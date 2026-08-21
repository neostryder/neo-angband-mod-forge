/**
 * The eight field ops as gestures, and the one property that decides whether an
 * author's change survives somebody else's mod.
 */

import { describe, expect, it } from "vitest";
import {
  collapseOps,
  describeComposition,
  describeOp,
  isCommutative,
  opAddRow,
  opDeleteRow,
  opFlag,
  opNudge,
  opScale,
  opSet,
} from "./ops.js";

describe("isCommutative", () => {
  it("is exactly the three ops two mods can both apply to one field", () => {
    expect(isCommutative("addFlag")).toBe(true);
    expect(isCommutative("removeFlag")).toBe(true);
    expect(isCommutative("append")).toBe(true);
    for (const op of ["set", "merge", "add", "mul", "removeValue"] as const) {
      expect(isCommutative(op)).toBe(false);
    }
  });
});

describe("the gestures", () => {
  it("map to the op the gesture means", () => {
    expect(opSet("cost", 100)).toEqual({ op: "set", path: "cost", value: 100 });
    expect(opNudge("hit-points", 3)).toEqual({ op: "add", path: "hit-points", value: 3 });
    expect(opScale("cost", 10)).toEqual({ op: "mul", path: "cost", value: 10 });
    expect(opFlag("flags", "GROUP_AI", true)).toEqual({ op: "addFlag", path: "flags", flag: "GROUP_AI" });
    expect(opFlag("flags", "GROUP_AI", false)).toEqual({ op: "removeFlag", path: "flags", flag: "GROUP_AI" });
    expect(opAddRow("normal", { tval: "food" })).toEqual({ op: "append", path: "normal", values: [{ tval: "food" }] });
    expect(opDeleteRow("normal", { tval: "food" })).toEqual({ op: "removeValue", path: "normal", value: { tval: "food" } });
  });

  it("uses the property names the format uses, not the obvious guesses", () => {
    /* `flag` is singular and `values` is plural, which is the format's asymmetry
     * rather than a slip, and a wrong guess here typechecks against a stub. */
    expect(Object.keys(opFlag("flags", "X", true)).sort()).toEqual(["flag", "op", "path"]);
    expect(Object.keys(opAddRow("normal", 1)).sort()).toEqual(["op", "path", "values"]);
  });
});

describe("describeOp", () => {
  it("says what the author did, in the words of the gesture", () => {
    expect(describeOp(opNudge("hit-points", 3))).toBe("raise hit-points by 3");
    expect(describeOp(opNudge("hit-points", -3))).toBe("lower hit-points by 3");
    expect(describeOp(opScale("cost", 10))).toBe("multiply cost by 10");
    expect(describeOp(opFlag("flags", "EVIL", true))).toBe("add the flag EVIL to flags");
    expect(describeOp(opSet("name", "x"))).toBe('set name to "x"');
    expect(describeOp(opAddRow("normal", 1))).toBe("add an entry to normal");
  });
});

describe("describeComposition", () => {
  it("promises coexistence for the three that compose, and load order for the rest", () => {
    expect(describeComposition(opFlag("flags", "EVIL", true))).toContain("keeps its change");
    expect(describeComposition(opSet("cost", 1))).toContain("loads last wins");
  });
});

describe("collapseOps", () => {
  it("folds a repeated set on one path onto the last one", () => {
    /* Changing your mind three times must not ship three ops, or the file
     * contains a value that was never on screen. */
    const folded = collapseOps([opSet("cost", 1), opSet("cost", 2), opSet("cost", 3)]);
    expect(folded).toEqual([opSet("cost", 3)]);
  });

  it("keeps sets on different paths", () => {
    expect(collapseOps([opSet("cost", 1), opSet("weight", 2)])).toHaveLength(2);
  });

  it("accumulates every other op, because two nudges of three genuinely mean six", () => {
    const folded = collapseOps([opNudge("hp", 3), opNudge("hp", 3)]);
    expect(folded).toHaveLength(2);
  });

  it("keeps a set that came after a nudge in order", () => {
    const folded = collapseOps([opNudge("hp", 3), opSet("hp", 10)]);
    expect(folded).toEqual([opNudge("hp", 3), opSet("hp", 10)]);
  });
});
