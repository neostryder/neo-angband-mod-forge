import { describe, expect, it } from "vitest";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import { newDraft } from "./draft.js";
import type { Draft } from "./draft.js";
import { writeFileBytes, writeFileText } from "./files.js";
import { searchDraft } from "./search.js";

const api = STUB_AUTHORING;

function draft(): Draft {
  return { ...newDraft("test-mod", "0.25.0", "2026-01-01T00:00:00.000Z"), author: "somebody" };
}

describe("searching every file in a draft", () => {
  it("finds nothing for an empty query rather than every line of every file", () => {
    const outcome = writeFileText(api, draft(), "lib/dice.js", "roll(2, 6)\nroll(1, 20)");
    if (!outcome.ok) throw new Error(outcome.why);
    expect(searchDraft(api, outcome.draft, {}, "")).toEqual([]);
    expect(searchDraft(api, outcome.draft, {}, "   ")).toEqual([]);
  });

  it("finds a match in one file, with its line and column", () => {
    const outcome = writeFileText(api, draft(), "lib/dice.js", "function roll() {\n  return 4;\n}");
    if (!outcome.ok) throw new Error(outcome.why);
    const matches = searchDraft(api, outcome.draft, {}, "return");
    expect(matches).toEqual([
      { path: "lib/dice.js", line: 2, column: 3, snippet: "return 4;" },
    ]);
  });

  it("is case insensitive, the same as the editor's own find bar", () => {
    const outcome = writeFileText(api, draft(), "README.md", "Hello Dice Roller");
    if (!outcome.ok) throw new Error(outcome.why);
    expect(searchDraft(api, outcome.draft, {}, "dice")).toHaveLength(1);
    expect(searchDraft(api, outcome.draft, {}, "DICE")).toHaveLength(1);
  });

  it("finds every occurrence on a line, not just the first", () => {
    const outcome = writeFileText(api, draft(), "lib/dice.js", "dice dice dice");
    if (!outcome.ok) throw new Error(outcome.why);
    expect(searchDraft(api, outcome.draft, {}, "dice")).toHaveLength(3);
  });

  it("searches across every file, in the file list's own order", () => {
    let current = draft();
    for (const [path, text] of [
      ["b.js", "shared"],
      ["a.js", "shared"],
    ] as const) {
      const outcome = writeFileText(api, current, path, text);
      if (!outcome.ok) throw new Error(outcome.why);
      current = outcome.draft;
    }
    const matches = searchDraft(api, current, {}, "shared");
    expect(matches.map((m) => m.path)).toEqual(["a.js", "b.js"]);
  });

  it("searches the unsaved buffer's text instead of the saved file when one is open", () => {
    const outcome = writeFileText(api, draft(), "lib/dice.js", "old text");
    if (!outcome.ok) throw new Error(outcome.why);
    const matches = searchDraft(api, outcome.draft, { "lib/dice.js": { text: "new text" } }, "new");
    expect(matches).toHaveLength(1);
    expect(searchDraft(api, outcome.draft, { "lib/dice.js": { text: "new text" } }, "old")).toHaveLength(0);
  });

  it("never opens a binary file as text", () => {
    const outcome = writeFileBytes(api, draft(), "art/tile.png", new Uint8Array([1, 2, 3]));
    if (!outcome.ok) throw new Error(outcome.why);
    expect(searchDraft(api, outcome.draft, {}, "png")).toEqual([]);
  });
});