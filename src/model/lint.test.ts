/**
 * The checks over a hand-edited file, and the two properties they live or die by.
 *
 * ONE: A CHECK HERE IS THE SAME CHECK THE FORM RUNS. The rows below are compared
 * against what `buildDraft` says about the same draft, which is what the record
 * screen and the review screen read. A raw editor with its own weaker opinion about
 * a record would be a second answer to a question that has one, and the author would
 * find out which was right by shipping.
 *
 * TWO: A FINDING IS PLACED OR IT IS SHOWN UNPLACED. Never guessed at, and never
 * dropped. The tests for `place` are mostly tests that an ambiguous case declines to
 * answer, because a marker on an innocent line is the failure that makes somebody
 * stop trusting the pane.
 */

import { describe, expect, it } from "vitest";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import { STUB_RECORDS } from "../host/stub-content.js";
import { buildDraft } from "./build.js";
import type { Draft } from "./draft.js";
import { newDraft } from "./draft.js";
import { jsonIndex, lintFile, VOCABULARY_RULE } from "./lint.js";
import { writeFileText } from "./files.js";

const api = STUB_AUTHORING;

/** The same separator `keyOf` uses, spelled without putting a NUL in this file. */
const SEP = String.fromCharCode(0);

/** One index key, so a test never has to know how the index spells a path. */
function key(path: readonly (string | number)[]): string {
  return path.join(SEP);
}

function draft(): Draft {
  return newDraft("test-mod", "0.25.0", "2026-01-01T00:00:00.000Z");
}

function lint(text: string, path = "monster.json"): ReturnType<typeof lintFile> {
  return lintFile(api, draft(), STUB_RECORDS, path, text);
}

/** A record file with one monster in it, laid out as the emitter lays one out. */
function monsterFile(record: Record<string, unknown>): string {
  return `${JSON.stringify({ records: [record] }, null, 2)}\n`;
}

describe("finding where a path is in the source", () => {
  it("points at the key rather than at the value", () => {
    const text = '{\n  "a": 1,\n  "b": { "c": 2 }\n}\n';
    const index = jsonIndex(text);
    expect(index.get(key(["a"]))).toBe(text.indexOf('"a"'));
    expect(index.get(key(["b", "c"]))).toBe(text.indexOf('"c"'));
  });

  it("points at the element for something inside a list", () => {
    const text = '{\n  "xs": [\n    10,\n    { "y": 3 }\n  ]\n}\n';
    const index = jsonIndex(text);
    expect(index.get(key(["xs", 0]))).toBe(text.indexOf("10"));
    expect(index.get(key(["xs", 1, "y"]))).toBe(text.indexOf('"y"'));
  });

  it("keeps two keys apart when one of them contains the separator character", () => {
    /* A dot or a slash would collide here. A NUL cannot appear in a JSON key. */
    const text = '{\n  "a.b": 1,\n  "a": { "b": 2 }\n}\n';
    const index = jsonIndex(text);
    expect(index.get(key(["a.b"]))).toBe(text.indexOf('"a.b"'));
    expect(index.get(key(["a", "b"]))).toBe(text.indexOf('"b"'));
  });
});

describe("the checks are the same checks", () => {
  it("reports what buildDraft reports for the same file", () => {
    const text = monsterFile({ name: "spooky rat", base: "rodent", depth: 3 });
    const found = lint(text);
    expect(found.checked).toBe(true);

    const candidate = writeFileText(api, draft(), "monster.json", text);
    if (!candidate.ok) throw new Error(candidate.why);
    const build = buildDraft(api, candidate.draft, STUB_RECORDS);
    const theirs = build.findings
      .filter((f) => f.file === "monster" || f.file === "-")
      .map((f) => f.rule)
      .sort();
    const mine = found.findings
      .filter((f) => !f.rule.startsWith("workshop/"))
      .map((f) => f.rule)
      .sort();
    expect(mine).toEqual(theirs);
  });

  it("puts a missing expected field on the record it is missing from", () => {
    const text = monsterFile({ name: "spooky rat", base: "rodent" });
    const found = lint(text).findings.filter((f) => f.rule === "field/required");
    expect(found.length).toBeGreaterThan(0);
    for (const finding of found) {
      /* There is no key to point at, so the record's own opening brace is where it
       * goes: line 3 of `{ \n "records": [ \n { ...`. */
      expect(finding.line).toBe(3);
    }
  });

  it("puts a misspelled field on the misspelled key", () => {
    const text = monsterFile({ name: "spooky rat", base: "rodent", depht: 3 });
    const found = lint(text).findings.find((f) => f.rule === "field/unknown");
    expect(found).toBeDefined();
    const line = text.split("\n")[(found?.line ?? 1) - 1] ?? "";
    expect(line).toContain('"depht"');
  });

  it("counts what the same build found about the rest of the mod", () => {
    const busy: Draft = {
      ...draft(),
      changes: [{ kind: "add", file: "object", record: { name: "odd stick" } }],
    };
    const found = lintFile(api, busy, STUB_RECORDS, "monster.json", monsterFile({ name: "rat", base: "rodent" }));
    expect(found.elsewhere).toBeGreaterThan(0);
  });
});

describe("the vocabulary hint, which is the workshop's own", () => {
  it("names a value outside the set core uses, as a hint and no more", () => {
    const text = monsterFile({ name: "spooky rat", base: "rodnet" });
    const found = lint(text).findings.find((f) => f.rule === VOCABULARY_RULE);
    expect(found?.level).toBe("hint");
    expect(found?.message).toContain("rodnet");
    /* The rule id is namespaced so that nothing can mistake it for the engine's,
     * and the message says the game will not repeat it. */
    expect(found?.rule.startsWith("workshop/")).toBe(true);
    expect(found?.message).toContain("the game");
    const line = text.split("\n")[(found?.line ?? 1) - 1] ?? "";
    expect(line).toContain('"base"');
  });

  it("says nothing about a value that is in the set", () => {
    const text = monsterFile({ name: "spooky rat", base: "rodent" });
    expect(lint(text).findings.some((f) => f.rule === VOCABULARY_RULE)).toBe(false);
  });

  it("says nothing about a field core has no closed set for", () => {
    const text = monsterFile({ name: "a name nothing else has", base: "rodent" });
    const named = lint(text).findings.filter((f) => f.rule === VOCABULARY_RULE && f.field === "name");
    expect(named).toEqual([]);
  });
});

describe("refusing to guess", () => {
  it("shows a finding it cannot place rather than dropping it", () => {
    /* Two records with the same name: the label the checker reports is ambiguous,
     * so neither can be pointed at, and both findings must still appear. */
    const text = `${JSON.stringify(
      { records: [{ name: "twin", base: "rodent" }, { name: "twin", base: "rodent" }] },
      null,
      2,
    )}\n`;
    const found = lint(text).findings.filter((f) => f.rule === "field/required");
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((f) => f.line === undefined)).toBe(true);
  });

  it("checks nothing and says so when the text is not JSON yet", () => {
    const found = lint('{ "records": [ ');
    expect(found.checked).toBe(false);
    expect(found.findings).toEqual([]);
    expect(found.why).toContain("JSON");
  });

  it("checks nothing for a file the workshop does not model", () => {
    const found = lint("export default {};\n", "plugin.js");
    expect(found.checked).toBe(false);
    expect(found.why).toContain("yours");
  });
});

describe("the manifest", () => {
  it("is checked, and its whole-project refusals are shown on it", () => {
    const text = `${JSON.stringify({ id: "test-mod", name: "", version: "not-a-version", shape: "content" }, null, 2)}\n`;
    const found = lintFile(api, draft(), STUB_RECORDS, "manifest.json", text);
    /* Either the write is refused with a reason, or the build reports the refusal.
     * Both are answers; silence is not. */
    expect(found.checked === false || found.findings.length > 0).toBe(true);
  });
});
