/**
 * Draft storage, against a store that is allowed to lie.
 *
 * `ctx.prefs.set` catches a quota error and logs it rather than throwing, so a
 * write can appear to succeed and not have happened. These tests are the reason
 * every write is read back.
 */

import { describe, expect, it, vi } from "vitest";
import { DraftWriter, loadDrafts, saveDrafts, SIZE_CEILING } from "./persist.js";
import { newDraft } from "./draft.js";

const DRAFT = newDraft("my-mod", "0.25.0", "2026-08-21T00:00:00.000Z");

function honestStore(): { get(): unknown; set(v: unknown): void } {
  let held: unknown;
  return {
    get: () => held,
    set: (value) => {
      held = value;
    },
  };
}

/** A store that reports success and keeps nothing. This is the real failure. */
function lyingStore(): { get(): unknown; set(v: unknown): void } {
  return { get: () => undefined, set: () => undefined };
}

describe("saveDrafts", () => {
  it("writes and reads back", () => {
    const prefs = honestStore();
    const outcome = saveDrafts(prefs, { "my-mod": DRAFT }, true);
    expect(outcome.ok).toBe(true);
    expect(loadDrafts(prefs).drafts["my-mod"]?.id).toBe("my-mod");
    expect(loadDrafts(prefs).seenTour).toBe(true);
  });

  it("catches a store that says yes and keeps nothing", () => {
    const outcome = saveDrafts(lyingStore(), { "my-mod": DRAFT }, false);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("read back something else");
  });

  it("refuses at its own ceiling rather than discovering the quota", () => {
    const fat = { ...DRAFT, description: "x".repeat(SIZE_CEILING + 10) };
    const outcome = saveDrafts(honestStore(), { "my-mod": fat }, false);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("limit");
  });

  it("says plainly that nothing will be kept when there is nowhere to keep it", () => {
    const outcome = saveDrafts(undefined, { "my-mod": DRAFT }, false);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("save the file");
  });

  it("reports a store that throws instead of letting it escape", () => {
    const outcome = saveDrafts(
      {
        get: () => undefined,
        set: () => {
          throw new Error("nope");
        },
      },
      { "my-mod": DRAFT },
      false,
    );
    expect(outcome.ok).toBe(false);
  });
});

describe("loadDrafts", () => {
  it("returns nothing from an empty or absent store", () => {
    expect(loadDrafts(undefined).drafts).toEqual({});
    expect(loadDrafts(honestStore()).drafts).toEqual({});
  });

  it("ignores a version it has never seen rather than guessing at it", () => {
    const prefs = honestStore();
    prefs.set({ v: 99, drafts: { x: DRAFT } });
    expect(loadDrafts(prefs).drafts).toEqual({});
  });

  it("drops an entry that is not a draft and keeps the ones that are", () => {
    const prefs = honestStore();
    prefs.set({ v: 1, drafts: { good: DRAFT, bad: { nonsense: true } }, seenTour: false });
    expect(Object.keys(loadDrafts(prefs).drafts)).toEqual(["good"]);
  });

  it("survives a store that throws when read", () => {
    expect(
      loadDrafts({
        get: () => {
          throw new Error("nope");
        },
        set: () => undefined,
      }).drafts,
    ).toEqual({});
  });
});

describe("DraftWriter", () => {
  it("debounces, and a flush before a reload does not lose the last change", () => {
    vi.useFakeTimers();
    const prefs = honestStore();
    const outcomes: boolean[] = [];
    const writer = new DraftWriter(prefs, (o) => outcomes.push(o.ok), 400);
    writer.queue({ a: DRAFT }, false);
    writer.queue({ a: DRAFT, b: DRAFT }, false);
    expect(outcomes).toEqual([]);
    writer.flush();
    expect(outcomes).toEqual([true]);
    expect(Object.keys(loadDrafts(prefs).drafts).sort()).toEqual(["a", "b"]);
    writer.dispose();
    vi.useRealTimers();
  });

  it("fires on its own once the delay passes", () => {
    vi.useFakeTimers();
    const outcomes: boolean[] = [];
    const writer = new DraftWriter(honestStore(), (o) => outcomes.push(o.ok), 400);
    writer.queue({ a: DRAFT }, false);
    vi.advanceTimersByTime(500);
    expect(outcomes).toEqual([true]);
    writer.dispose();
    vi.useRealTimers();
  });

  it("stops writing once disposed", () => {
    vi.useFakeTimers();
    const outcomes: boolean[] = [];
    const writer = new DraftWriter(honestStore(), (o) => outcomes.push(o.ok), 400);
    writer.queue({ a: DRAFT }, false);
    writer.dispose();
    vi.advanceTimersByTime(500);
    expect(outcomes).toEqual([]);
    vi.useRealTimers();
  });
});
