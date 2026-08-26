/**
 * The launch screen and the exit screen: ModForge's own front door and its
 * own goodbye.
 *
 * WHY A SEPARATE LAYER RATHER THAN A ROUTE. `store.ts`'s `Route` union is the
 * workshop's OWN screens - the mod list, a record, the file editor - and every
 * one of them presumes a workshop that is already open. The title screen's
 * subject is the moment before that is true, and the exit screen's subject is
 * leaving it; neither belongs on that list. Both are layered on top of
 * whatever the workshop is already showing, in the same shadow root
 * `overlay.ts` already mounts - a real DOM surface positioned over the game's
 * canvas rather than a canvas draw, the same pattern the host's own
 * `crash-screen.ts` uses for the same reason (a plain `position:fixed`
 * element with its own inline styling, appended once, no dependency on
 * anything else in the page). This reuses that surface rather than adding a
 * second one.
 *
 * WHY IT NEVER BLOCKS THE WORKSHOP FROM MOUNTING. Tapping the workshop's tab
 * is already the one gesture that means "open it". `workshop.ts` mounts the
 * real app immediately and underneath, exactly as it always has; this plays
 * in front of it and gets out of the way on its own, or on a click, a key, or
 * (for a player who has been through it before) after a short pause with
 * nothing pressed at all. A first-time player is the one exception: for them
 * the screen waits, because the first look is the one worth not rushing.
 */

import { fill, h } from "./dom.js";
import type { Overlay } from "./overlay.js";
import { button } from "./widgets.js";
import { readmeElements } from "./readme-content.js";

/* ------------------------------------------------------------------ *
 * The phase sequence - pure, and driven by an injectable timer so a   *
 * test can step it without a clock, the same shape `loading.ts` uses  *
 * in the host for its own boot screen.                                *
 * ------------------------------------------------------------------ */

/** The three frames the title screen advances through, brand first. */
export const LAUNCH_PHASES = ["brand", "tagline", "ready"] as const;
export type LaunchPhase = (typeof LAUNCH_PHASES)[number];

/** How long the screen sits on one phase before advancing to the next. */
export const LAUNCH_STEP_MS = 320;

/** How long a RETURNING player's title screen waits on "ready" before it lets itself out. */
export const LAUNCH_AUTO_MS = 1100;

/** How long the fade takes once something has decided the screen is done. */
export const LAUNCH_FADE_MS = 260;

/** The phase after this one, or undefined once the sequence is finished. */
export function nextLaunchPhase(phase: LaunchPhase): LaunchPhase | undefined {
  return LAUNCH_PHASES[LAUNCH_PHASES.indexOf(phase) + 1];
}

export interface TimerDeps {
  readonly setTimeout?: (fn: () => void, ms: number) => unknown;
  readonly clearTimeout?: (handle: unknown) => void;
}

export interface LaunchSequencer {
  readonly phase: LaunchPhase;
  /** Jump straight to the last frame. Idempotent past the first call. */
  skip(): void;
  /** Stop the timer. Safe to call more than once, and after `skip`. */
  dispose(): void;
}

function timerFns(deps: TimerDeps): { after(fn: () => void, ms: number): unknown; cancel(handle: unknown): void } {
  return {
    after: deps.setTimeout ?? ((fn, ms) => setTimeout(fn, ms)),
    cancel: deps.clearTimeout ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>)),
  };
}

/**
 * Drive `onPhase` through `LAUNCH_PHASES` on a timer, starting at "brand"
 * immediately (called synchronously, before this returns).
 */
export function runLaunchSequence(onPhase: (phase: LaunchPhase) => void, deps: TimerDeps = {}): LaunchSequencer {
  const { after, cancel } = timerFns(deps);
  let phase: LaunchPhase = "brand";
  let handle: unknown;
  let finished = false;

  const tick = (): void => {
    const next = nextLaunchPhase(phase);
    if (next === undefined) {
      finished = true;
      return;
    }
    phase = next;
    onPhase(phase);
    if (nextLaunchPhase(phase) !== undefined) handle = after(tick, LAUNCH_STEP_MS);
    else finished = true;
  };

  onPhase(phase);
  handle = after(tick, LAUNCH_STEP_MS);

  return {
    get phase() {
      return phase;
    },
    skip() {
      if (finished) return;
      cancel(handle);
      finished = true;
      const last = LAUNCH_PHASES[LAUNCH_PHASES.length - 1];
      if (last !== undefined && phase !== last) {
        phase = last;
        onPhase(phase);
      }
    },
    dispose() {
      if (!finished) cancel(handle);
      finished = true;
    },
  };
}

/* ------------------------------------------------------------------ *
 * The title screen                                                    *
 * ------------------------------------------------------------------ */

const LAUNCH_TAGLINE = "Make your own Neo Angband mod from inside the game.";

export interface LaunchOptions {
  /** True the first time this player has ever opened the workshop. */
  readonly firstRun: boolean;
  /** The player chose to proceed - a click, Enter, or (returning players only) the auto-advance. */
  readonly onEnter: () => void;
  /** The player backed out instead - Escape, before ever entering. */
  readonly onCancel: () => void;
  readonly timers?: TimerDeps;
}

export interface Dismissable {
  /**
   * Stop every pending timer without firing `onEnter` or `onCancel` and
   * without playing the fade - for a caller that is tearing the whole
   * overlay down anyway (a mod switched off mid-animation) and needs
   * nothing left running afterwards, rather than a graceful dismissal.
   */
  dispose(): void;
  /**
   * Put keyboard focus back on this screen's own primary control.
   *
   * WHY A CALLER NEEDS THIS AT ALL. This screen registers its key handler
   * before `mountApp` does, on purpose, so Escape and Enter are its own while
   * it is up rather than falling into the workshop's escape ladder underneath
   * - `overlay.ts` offers a key to handlers in the order they registered, and
   * the first one to claim an event is the only one that runs. But `mountApp`
   * ALSO moves focus, unconditionally, onto whatever its own first screen is -
   * so mounting this first and `mountApp` second leaves focus sitting on a
   * control the player cannot see. This is the other half of that ordering.
   */
  focus(): void;
}

/**
 * Mount the title screen over whatever the workshop is already showing
 * underneath. Every element goes through `h()`, so `useDocument` must already
 * have been called - true by the time `workshop.ts` calls this, since
 * `mountApp` calls it first.
 */
export function mountLaunch(overlay: Overlay, opts: LaunchOptions): Dismissable {
  const { after, cancel } = timerFns(opts.timers ?? {});

  const illum = h("div", { class: "mb-launch-illum", text: "M" });
  const title = h("h1", { class: "mb-launch-title", text: "ModForge" });
  const tagline = h("p", { class: "mb-launch-tagline", text: LAUNCH_TAGLINE });

  let settled = false;
  let autoHandle: unknown;
  const clearAuto = (): void => {
    if (autoHandle !== undefined) {
      cancel(autoHandle);
      autoHandle = undefined;
    }
  };

  /* A FRESH BUTTON EVERY TIME, RATHER THAN ONE NODE MOVED BETWEEN VIEWS. An
   * element can only ever be in one place in the tree, so appending an
   * existing button into the README panel's own action row would silently
   * empty it out of the front view's row - which is exactly what happened
   * here the first time this was written, and it only showed up on the second
   * visit to the front view, after a trip to the README. */
  const enterButton = (): HTMLButtonElement =>
    button({ label: "Enter the workshop", kind: "primary", onClick: () => finish(opts.onEnter) });

  let enterBtn = enterButton();
  const readmeBtn = button({
    label: "Read the README",
    kind: "ghost",
    onClick: () => {
      clearAuto();
      fill(
        body,
        h("div", { class: "mb-launch-readme mb-readme-card mb-prose" }, ...readmeElements()),
        h("div", { class: "mb-launch-actions" }, button({ label: "Back", onClick: showFront }), enterButton()),
      );
    },
  });

  const body = h("div", { class: "mb-launch-card" }, illum, title, tagline, h("div", { class: "mb-launch-actions" }, enterBtn, readmeBtn));
  function showFront(): void {
    enterBtn = enterButton();
    fill(body, illum, title, tagline, h("div", { class: "mb-launch-actions" }, enterBtn, readmeBtn));
  }

  const skip = button({ label: "Skip", kind: "ghost", tiny: true, onClick: () => finish(opts.onEnter) });
  skip.classList.add("mb-launch-skip");

  const panel = h("div", { class: "mb-launch", role: "dialog", aria: { label: "ModForge" } }, skip, body);
  overlay.root.appendChild(panel);
  panel.dataset["phase"] = "brand";
  let revealHandle: unknown = after(() => {
    revealHandle = undefined;
    panel.dataset["shown"] = "1";
  }, 0);

  const sequencer = runLaunchSequence((phase) => {
    panel.dataset["phase"] = phase;
    if (phase === "ready") {
      enterBtn.focus();
      if (!opts.firstRun) autoHandle = after(() => finish(opts.onEnter), LAUNCH_AUTO_MS);
    }
  }, opts.timers);

  const teardown = (): void => {
    clearAuto();
    sequencer.dispose();
    if (revealHandle !== undefined) {
      cancel(revealHandle);
      revealHandle = undefined;
    }
    panel.dataset["shown"] = "0";
    /* Removed once its own fade has had a chance to run, not before: an
     * element torn out mid-transition never finishes the transition it
     * started, and the workshop underneath would jump into view early. */
    after(() => panel.remove(), LAUNCH_FADE_MS);
  };

  function finish(action: () => void): void {
    if (settled) return;
    settled = true;
    teardown();
    action();
  }

  /* ENTER ACTIVATES WHICHEVER BUTTON HAS FOCUS, not always "enter the
   * workshop". The overlay's own fallback (`overlay.ts`, the branch below
   * every registered handler) calls `preventDefault` on an unclaimed Enter
   * anyway - aimed at a button, which is not "editable" - so a native
   * activate-on-Enter never reaches it either way, and something here has to
   * do that job explicitly or Enter does nothing at all on this screen. */
  overlay.onKey((event) => {
    if (settled) return false;
    if (event.key === "Escape") {
      finish(opts.onCancel);
      return true;
    }
    if (event.key === "Enter") {
      /* `shadowRoot.activeElement`, NOT a `:focus` selector match. Measured:
       * jsdom's `:focus` pseudo-class matches every focusable sibling of the
       * actually-focused element, not only the one that holds focus, which
       * made this pick the first button in the panel rather than whichever
       * one the player had actually tabbed or clicked to. `activeElement` is
       * the one source both real browsers and jsdom agree on. */
      const active = overlay.root.activeElement;
      if (active instanceof HTMLButtonElement && panel.contains(active)) {
        active.click();
        return true;
      }
      finish(opts.onEnter);
      return true;
    }
    return false;
  });

  return {
    dispose() {
      settled = true;
      clearAuto();
      sequencer.dispose();
      if (revealHandle !== undefined) {
        cancel(revealHandle);
        revealHandle = undefined;
      }
    },
    focus() {
      enterBtn.focus();
    },
  };
}

/* ------------------------------------------------------------------ *
 * The exit screen                                                     *
 * ------------------------------------------------------------------ */

/** How long the exit screen shows before it lets the close through on its own. */
export const EXIT_MS = 550;

export interface ExitOptions {
  readonly onDone: () => void;
  readonly timers?: TimerDeps;
}

/** Mount a brief "leaving" screen, then call `onDone` once it is through. */
export function mountExit(overlay: Overlay, opts: ExitOptions): void {
  const { after } = timerFns(opts.timers ?? {});
  let done = false;
  const finish = (): void => {
    if (done) return;
    done = true;
    opts.onDone();
  };

  const panel = h(
    "div",
    {
      class: "mb-exit",
      role: "status",
      aria: { label: "Leaving ModForge" },
      on: { click: finish },
    },
    h(
      "div",
      { class: "mb-exit-card" },
      h("div", { class: "mb-exit-title", text: "Leaving ModForge..." }),
      h("div", { class: "mb-exit-note", text: "Back to the game. Unfinished work is kept." }),
    ),
  );
  overlay.root.appendChild(panel);
  after(() => {
    panel.dataset["shown"] = "1";
  }, 0);

  overlay.onKey(() => {
    finish();
    return true;
  });

  after(finish, EXIT_MS);
}
