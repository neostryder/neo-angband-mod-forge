/**
 * Paths, which the whole record editor addresses everything through.
 *
 * The cases that matter are the ones where a dotted path meets an array, because
 * that is the engine's own notation and getting it wrong means an edit landing on
 * a different field than the one the reader clicked.
 */

import { describe, expect, it } from "vitest";
import { isIndex, kindOf, summarize, valueAt, withoutValueAt, withValueAt } from "./paths.js";

const MONSTER = {
  name: "grey wolf",
  depth: 10,
  flags: ["GROUP_AI"],
  blow: [
    { method: "BITE", damage: "1d6" },
    { method: "CLAW", damage: "1d4" },
  ],
  armor: { ac: 30, "to-a": 0 },
};

describe("valueAt", () => {
  it("reads a top-level field", () => {
    expect(valueAt(MONSTER, "depth")).toBe(10);
  });

  it("treats a run of digits as an array index", () => {
    expect(valueAt(MONSTER, "blow.1.method")).toBe("CLAW");
  });

  it("reads through a nested object", () => {
    expect(valueAt(MONSTER, "armor.to-a")).toBe(0);
  });

  it("answers undefined rather than throwing for a path that goes nowhere", () => {
    expect(valueAt(MONSTER, "blow.9.method")).toBeUndefined();
    expect(valueAt(MONSTER, "depth.nonsense")).toBeUndefined();
    expect(valueAt(MONSTER, "blow.method")).toBeUndefined();
  });
});

describe("withValueAt", () => {
  it("leaves the original untouched, because undo is a stack of whole drafts", () => {
    const next = withValueAt(MONSTER, "depth", 12);
    expect(next["depth"]).toBe(12);
    expect(MONSTER.depth).toBe(10);
  });

  it("writes into an array element without disturbing its neighbours", () => {
    const next = withValueAt(MONSTER, "blow.0.damage", "2d6");
    expect(valueAt(next, "blow.0.damage")).toBe("2d6");
    expect(valueAt(next, "blow.1.damage")).toBe("1d4");
  });

  it("creates the containers on the way down, choosing by the next segment", () => {
    const next = withValueAt({}, "alloc.common", 20);
    expect(next).toEqual({ alloc: { common: 20 } });
    const list = withValueAt({}, "blow.0.method", "HIT");
    expect(list).toEqual({ blow: [{ method: "HIT" }] });
  });

  it("fills a gap in an array with nulls rather than leaving holes", () => {
    const next = withValueAt({ blow: [] }, "blow.2", "x");
    expect(next["blow"]).toEqual([null, null, "x"]);
  });

  it("refuses an empty path rather than replacing the record", () => {
    expect(() => withValueAt(MONSTER, "", 1)).toThrow();
  });
});

describe("withoutValueAt", () => {
  it("removes a field", () => {
    expect(withoutValueAt(MONSTER, "depth")["depth"]).toBeUndefined();
  });

  it("closes the gap when an array entry goes", () => {
    const next = withoutValueAt(MONSTER, "blow.0");
    expect(valueAt(next, "blow.0.method")).toBe("CLAW");
    expect((next["blow"] as unknown[]).length).toBe(1);
  });
});

describe("kindOf", () => {
  it("picks the widget from the value, not from any schema", () => {
    expect(kindOf("x")).toBe("string");
    expect(kindOf(1)).toBe("number");
    expect(kindOf(true)).toBe("boolean");
    expect(kindOf(["A", "B"])).toBe("flags");
    expect(kindOf([{ a: 1 }])).toBe("rows");
    expect(kindOf([1, 2])).toBe("list");
    expect(kindOf([])).toBe("list");
    expect(kindOf({ a: 1 })).toBe("object");
    expect(kindOf(undefined)).toBe("empty");
    expect(kindOf(null)).toBe("empty");
  });

  it("calls a mixed list a list, so it gets the JSON escape hatch", () => {
    expect(kindOf(["a", 1])).toBe("list");
  });
});

describe("summarize", () => {
  it("says something useful for every container", () => {
    expect(summarize(["A", "B"])).toBe("A, B");
    expect(summarize([{ a: 1 }])).toBe("1 entry");
    expect(summarize([{ a: 1 }, { a: 2 }])).toBe("2 entries");
    expect(summarize({ ac: 1, "to-a": 2 })).toBe("ac, to-a");
    expect(summarize({})).toBe("nothing yet");
    expect(summarize(undefined)).toBe("nothing yet");
  });
});

describe("isIndex", () => {
  it("accepts only a canonical non-negative integer", () => {
    expect(isIndex("0")).toBe(true);
    expect(isIndex("12")).toBe(true);
    expect(isIndex("01")).toBe(false);
    expect(isIndex("-1")).toBe(false);
    expect(isIndex("to-a")).toBe(false);
  });
});
