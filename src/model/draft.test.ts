/**
 * The manifest fields the workshop writes for the author.
 *
 * Every one of these has a consequence the author would otherwise meet at install
 * time or, worse, not meet at all: a missing dependency costs a change silently, a
 * wrong group loads a patching mod before the content it patches, and an engine
 * range that excludes the running build labels a data pack rather than refusing
 * it, so nothing tells anybody.
 */

import { describe, expect, it } from "vitest";
import { dependenciesFor, draftFiles, draftSize, engineRangeFor, groupFor, newDraft } from "./draft.js";
import type { Change } from "./draft.js";

const ADD: Change = { kind: "add", file: "monster", record: { name: "carpenter ant" } };
const PATCH_CORE: Change = { kind: "patch", file: "object", ref: "core:sword--dagger", ops: [] };
const PATCH_MOD: Change = { kind: "patch", file: "object", ref: "qol:sword--stick", ops: [] };
const REMOVE: Change = { kind: "remove", file: "monster", ref: "core:cave-rat" };

describe("dependenciesFor", () => {
  it("is empty when the mod only adds things of its own", () => {
    expect(dependenciesFor([ADD])).toEqual({});
  });

  it("names core the moment anything of the base game's is touched", () => {
    expect(dependenciesFor([PATCH_CORE])).toEqual({ core: "*" });
    expect(dependenciesFor([REMOVE])).toEqual({ core: "*" });
  });

  it("names another mod when its record is the one being adjusted", () => {
    /* Without this the mod installs, enables, loads, and every one of its
     * changes is refused for want of the declaration, with nothing on screen. */
    expect(dependenciesFor([PATCH_CORE, PATCH_MOD])).toEqual({ core: "*", qol: "*" });
  });

  it("treats a ref with no owner as the base game's", () => {
    expect(dependenciesFor([{ kind: "remove", file: "monster", ref: "cave-rat" }])).toEqual({ core: "*" });
  });
});

describe("groupFor", () => {
  it("is content for a mod that adds records", () => {
    expect(groupFor([ADD])).toBe("content");
    expect(groupFor([ADD, PATCH_CORE])).toBe("content");
  });

  it("is tweaks for a mod that only adjusts what already exists", () => {
    /* A manifest with no group sorts as content, which is right for an adding mod
     * and wrong for a patching one: a patching mod wants to load AFTER the mods
     * that add the things it is patching. */
    expect(groupFor([PATCH_CORE])).toBe("tweaks");
    expect(groupFor([REMOVE])).toBe("tweaks");
    expect(groupFor([])).toBe("tweaks");
  });
});

describe("engineRangeFor", () => {
  it("writes a minimum rather than a caret", () => {
    expect(engineRangeFor("0.25.0")).toBe(">=0.25.0");
    expect(engineRangeFor("1.2.3-beta.1")).toBe(">=1.2.3");
  });

  it("falls back to everything when the version cannot be read", () => {
    expect(engineRangeFor("who knows")).toBe("*");
  });
});

describe("newDraft", () => {
  it("defaults the repository to an address that is obviously the author's own", () => {
    /* Never a plausible GitHub URL. The origin is pinned on first import and the
     * update check will later ask that repository for its tags, so inventing one
     * points somebody's mod at a stranger. */
    const draft = newDraft("my-first-mod", "0.25.0", "2026-08-21T00:00:00.000Z");
    expect(draft.repository).toBe("local://my-first-mod");
    expect(draft.repository).not.toContain("github");
  });

  it("titles the mod from its id, so the name field is never blank", () => {
    expect(newDraft("my-first-mod", "0.25.0", "x").name).toBe("My First Mod");
  });

  it("starts at 0.1.0 with an engine range for the build it was made on", () => {
    const draft = newDraft("x", "0.25.0", "x");
    expect(draft.version).toBe("0.1.0");
    expect(draft.engine).toBe(">=0.25.0");
  });
});

describe("counting", () => {
  it("separates what was added from what was adjusted and what was removed", () => {
    expect(draftSize({ ...newDraft("x", "0.25.0", "x"), changes: [ADD, PATCH_CORE, REMOVE] })).toEqual({
      added: 1,
      patched: 1,
      removed: 1,
    });
  });

  it("lists the files touched, once each, sorted", () => {
    expect(draftFiles({ ...newDraft("x", "0.25.0", "x"), changes: [PATCH_CORE, ADD, PATCH_MOD] })).toEqual([
      "monster",
      "object",
    ]);
  });
});
