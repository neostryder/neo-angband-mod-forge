/**
 * @vitest-environment jsdom
 *
 * The launch screen and the exit screen: their state transitions, driven
 * without a clock, and the DOM they build - not what they look like painted,
 * which nothing here claims to check.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { useDocument } from "./dom.js";
import {
  EXIT_MS,
  LAUNCH_AUTO_MS,
  LAUNCH_PHASES,
  LAUNCH_STEP_MS,
  mountExit,
  mountLaunch,
  nextLaunchPhase,
  runLaunchSequence,
} from "./launch.js";
import { mountOverlay } from "./overlay.js";
import type { Overlay } from "./overlay.js";

beforeEach(() => {
  useDocument(document);
});

/** A timer a test can advance by hand, without touching the real clock. */
function fakeClock(): {
  readonly setTimeout: (fn: () => void, ms: number) => unknown;
  readonly clearTimeout: (handle: unknown) => void;
  advance(ms: number): void;
} {
  let now = 0;
  let nextId = 1;
  const pending = new Map<number, { readonly at: number; readonly fn: () => void }>();
  return {
    setTimeout(fn, ms) {
      const id = nextId++;
      pending.set(id, { at: now + ms, fn });
      return id;
    },
    clearTimeout(handle) {
      pending.delete(handle as number);
    },
    advance(ms) {
      /* `now` MOVES TO EACH FIRED TIMER'S OWN DUE TIME, one at a time, rather
       * than jumping straight to the end of the window. A callback that
       * reschedules itself - which is exactly what the phase sequencer's own
       * `tick` does - computes its next due time from `now` as it stands at
       * that moment, so jumping `now` to the far end first would make every
       * cascading reschedule land past the window and never fire within it,
       * which is not how a real clock behaves. */
      const target = now + ms;
      for (;;) {
        let due: [number, { readonly at: number; readonly fn: () => void }] | undefined;
        for (const entry of pending) {
          if (entry[1].at > target) continue;
          if (due === undefined || entry[1].at < due[1].at) due = entry;
        }
        if (due === undefined) {
          now = target;
          return;
        }
        pending.delete(due[0]);
        now = due[1].at;
        due[1].fn();
      }
    },
  };
}

describe("nextLaunchPhase", () => {
  it("walks the three frames in order and then stops", () => {
    expect(LAUNCH_PHASES).toEqual(["brand", "tagline", "ready"]);
    expect(nextLaunchPhase("brand")).toBe("tagline");
    expect(nextLaunchPhase("tagline")).toBe("ready");
    expect(nextLaunchPhase("ready")).toBeUndefined();
  });
});

describe("runLaunchSequence", () => {
  it("starts on brand synchronously, before the timer has fired once", () => {
    const seen: string[] = [];
    const clock = fakeClock();
    runLaunchSequence((phase) => seen.push(phase), clock);
    expect(seen).toEqual(["brand"]);
  });

  it("advances one frame per step, in order, and stops at ready", () => {
    const seen: string[] = [];
    const clock = fakeClock();
    runLaunchSequence((phase) => seen.push(phase), clock);
    clock.advance(LAUNCH_STEP_MS);
    clock.advance(LAUNCH_STEP_MS);
    /* A third advance is a no-op: nothing left to schedule past "ready". */
    clock.advance(LAUNCH_STEP_MS);
    expect(seen).toEqual(["brand", "tagline", "ready"]);
  });

  it("skip jumps straight to the last frame and cancels the pending timer", () => {
    const seen: string[] = [];
    const clock = fakeClock();
    const seq = runLaunchSequence((phase) => seen.push(phase), clock);
    seq.skip();
    expect(seen).toEqual(["brand", "ready"]);
    expect(seq.phase).toBe("ready");
    /* The cancelled timer really was cancelled: advancing past it does not
     * call back in a second time. */
    clock.advance(LAUNCH_STEP_MS * 5);
    expect(seen).toEqual(["brand", "ready"]);
  });

  it("skip after the sequence has already finished does nothing", () => {
    const seen: string[] = [];
    const clock = fakeClock();
    const seq = runLaunchSequence((phase) => seen.push(phase), clock);
    clock.advance(LAUNCH_STEP_MS * 5);
    expect(seen).toEqual(["brand", "tagline", "ready"]);
    seq.skip();
    expect(seen).toEqual(["brand", "tagline", "ready"]);
  });

  it("dispose stops the timer without calling onPhase again", () => {
    const seen: string[] = [];
    const clock = fakeClock();
    const seq = runLaunchSequence((phase) => seen.push(phase), clock);
    seq.dispose();
    clock.advance(LAUNCH_STEP_MS * 5);
    expect(seen).toEqual(["brand"]);
  });
});

/* ------------------------------------------------------------------ *
 * The DOM each screen builds, and how it responds to the overlay's    *
 * own keyboard door.                                                  *
 * ------------------------------------------------------------------ */

function freshOverlay(): Overlay {
  document.body.replaceChildren();
  return mountOverlay(document, { label: "ModForge test" });
}

function panel(overlay: Overlay, selector: string): HTMLElement | null {
  return overlay.root.querySelector<HTMLElement>(selector);
}

describe("mountLaunch", () => {
  it("shows the brand immediately and waits on ready for a first-time player", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    mountLaunch(overlay, { firstRun: true, onEnter: () => entered++, onCancel: () => undefined, timers: clock });

    expect(panel(overlay, ".mb-launch")).not.toBeNull();
    expect(panel(overlay, ".mb-launch")?.dataset["phase"]).toBe("brand");

    clock.advance(LAUNCH_STEP_MS * 2);
    expect(panel(overlay, ".mb-launch")?.dataset["phase"]).toBe("ready");

    /* A first-time player is never rushed off it: even well past the
     * returning-player auto-advance window, nothing has happened. */
    clock.advance(LAUNCH_AUTO_MS * 3);
    expect(entered).toBe(0);
    expect(panel(overlay, ".mb-launch")).not.toBeNull();

    overlay.close();
  });

  it("lets a returning player's screen see itself out once it reaches ready", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    mountLaunch(overlay, { firstRun: false, onEnter: () => entered++, onCancel: () => undefined, timers: clock });

    clock.advance(LAUNCH_STEP_MS * 2); // -> ready
    expect(entered).toBe(0);
    clock.advance(LAUNCH_AUTO_MS);
    expect(entered).toBe(1);

    overlay.close();
  });

  it("dismisses on a click of its own primary button, and calls onEnter", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    mountLaunch(overlay, { firstRun: true, onEnter: () => entered++, onCancel: () => undefined, timers: clock });

    const enter = [...overlay.root.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => (b.textContent ?? "").trim() === "Enter the workshop",
    );
    if (!enter) throw new Error("no Enter the workshop button");
    enter.click();
    expect(entered).toBe(1);

    /* The fade is on a timer too; the panel is still in the tree until it
     * has run, marked as no longer shown. */
    expect(panel(overlay, ".mb-launch")?.dataset["shown"]).toBe("0");
    clock.advance(1000);
    expect(panel(overlay, ".mb-launch")).toBeNull();

    overlay.close();
  });

  it("shows the README summary and returns to the front on Back", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    mountLaunch(overlay, { firstRun: true, onEnter: () => undefined, onCancel: () => undefined, timers: clock });

    const readme = [...overlay.root.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => (b.textContent ?? "").trim() === "Read the README",
    );
    readme?.click();
    expect(overlay.root.textContent ?? "").toContain("What ModForge is");
    expect(panel(overlay, ".mb-launch-readme")?.classList.contains("mb-readme-card")).toBe(true);

    const back = [...overlay.root.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => (b.textContent ?? "").trim() === "Back",
    );
    back?.click();
    expect(overlay.root.textContent ?? "").not.toContain("What ModForge is");
    /* And the front view's own primary button is there again, not left empty
     * by the trip to the README - see the comment in launch.ts about a node
     * moved between views rather than rebuilt. */
    expect(
      [...overlay.root.querySelectorAll<HTMLButtonElement>("button")].some(
        (b) => (b.textContent ?? "").trim() === "Enter the workshop",
      ),
    ).toBe(true);

    overlay.close();
  });

  it("Enter activates whichever button actually has focus, not always the primary one", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    mountLaunch(overlay, { firstRun: true, onEnter: () => entered++, onCancel: () => undefined, timers: clock });

    const readme = [...overlay.root.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => (b.textContent ?? "").trim() === "Read the README",
    );
    if (!readme) throw new Error("no Read the README button");
    readme.focus();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

    /* Enter activated the FOCUSED button - the README panel opened - rather
     * than jumping straight into the workshop, which is what would have
     * happened if Enter always meant "enter the workshop" regardless of
     * where focus actually was. */
    expect(entered).toBe(0);
    expect(overlay.root.textContent ?? "").toContain("What ModForge is");

    overlay.close();
  });

  it("Escape cancels rather than entering", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    let cancelled = 0;
    mountLaunch(overlay, {
      firstRun: true,
      onEnter: () => entered++,
      onCancel: () => cancelled++,
      timers: clock,
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(cancelled).toBe(1);
    expect(entered).toBe(0);
    overlay.close();
  });

  it("Enter with nothing else focused enters the workshop", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    mountLaunch(overlay, { firstRun: true, onEnter: () => entered++, onCancel: () => undefined, timers: clock });
    (document.activeElement as HTMLElement | null)?.blur();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(entered).toBe(1);
    overlay.close();
  });

  it("dispose stops its timers without firing onEnter or onCancel", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let entered = 0;
    let cancelled = 0;
    const handle = mountLaunch(overlay, {
      firstRun: false,
      onEnter: () => entered++,
      onCancel: () => cancelled++,
      timers: clock,
    });
    clock.advance(LAUNCH_STEP_MS * 2); // reach ready, arm the auto-advance
    handle.dispose();
    clock.advance(LAUNCH_AUTO_MS * 2);
    expect(entered).toBe(0);
    expect(cancelled).toBe(0);
    overlay.close();
  });
});

describe("mountExit", () => {
  it("shows a leaving screen and calls onDone once its timer runs out", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let done = 0;
    mountExit(overlay, { onDone: () => done++, timers: clock });
    expect(overlay.root.textContent ?? "").toContain("Leaving ModForge");
    expect(done).toBe(0);
    clock.advance(EXIT_MS);
    expect(done).toBe(1);
    overlay.close();
  });

  it("finishes early on a click, and only calls onDone once", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let done = 0;
    mountExit(overlay, { onDone: () => done++, timers: clock });
    const el = panel(overlay, ".mb-exit");
    el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(done).toBe(1);
    clock.advance(EXIT_MS * 3);
    expect(done).toBe(1);
    overlay.close();
  });

  it("finishes early on any key, through the overlay's own door", () => {
    const overlay = freshOverlay();
    const clock = fakeClock();
    let done = 0;
    mountExit(overlay, { onDone: () => done++, timers: clock });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "x", bubbles: true, cancelable: true }));
    expect(done).toBe(1);
    overlay.close();
  });
});
