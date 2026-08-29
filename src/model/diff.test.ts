import { describe, expect, it } from "vitest";
import { diffLines, diffRows, diffSummary } from "./diff.js";

describe("diffing two versions of a file's text", () => {
  it("says two identical texts are all context, with nothing added or removed", () => {
    const { ops, truncated } = diffLines("a\nb\nc", "a\nb\nc");
    expect(truncated).toBe(false);
    expect(ops.every((op) => op.kind === "same")).toBe(true);
    expect(diffSummary(ops)).toEqual({ added: 0, removed: 0 });
  });

  it("finds a line changed in the middle as one remove and one add, not a whole rewrite", () => {
    const { ops } = diffLines("a\nb\nc", "a\nB\nc");
    expect(ops.map((op) => op.kind)).toEqual(["same", "remove", "add", "same"]);
    expect(diffSummary(ops)).toEqual({ added: 1, removed: 1 });
  });

  it("keeps the line numbers on each side of a change", () => {
    const { ops } = diffLines("keep\nold", "keep\nnew\nextra");
    const kept = ops.find((op) => op.kind === "same");
    expect(kept).toEqual({ kind: "same", text: "keep", beforeLine: 1, afterLine: 1 });
    const removed = ops.find((op) => op.kind === "remove");
    expect(removed).toEqual({ kind: "remove", text: "old", beforeLine: 2 });
    const added = ops.filter((op) => op.kind === "add");
    expect(added).toEqual([
      { kind: "add", text: "new", afterLine: 2 },
      { kind: "add", text: "extra", afterLine: 3 },
    ]);
  });

  it("treats an empty file as no lines rather than one blank line", () => {
    const { ops } = diffLines("", "one line");
    expect(ops).toEqual([{ kind: "add", text: "one line", afterLine: 1 }]);
  });

  it("falls back to a whole-file replace, and says it did, above the cell ceiling", () => {
    const before = Array.from({ length: 3000 }, (_, i) => `before ${i}`).join("\n");
    const after = Array.from({ length: 3000 }, (_, i) => `after ${i}`).join("\n");
    const { ops, truncated } = diffLines(before, after);
    expect(truncated).toBe(true);
    expect(ops.filter((op) => op.kind === "remove")).toHaveLength(3000);
    expect(ops.filter((op) => op.kind === "add")).toHaveLength(3000);
  });
});

describe("cutting an edit script down to unified-diff shape", () => {
  it("keeps every line when the file is short enough that context reaches end to end", () => {
    const { ops } = diffLines("a\nb\nc", "a\nB\nc");
    const rows = diffRows(ops, 3);
    expect(rows.every((row) => row.kind !== "gap")).toBe(true);
  });

  it("collapses a long unchanged run between two changes into a gap", () => {
    const before = ["a", "changed", ...Array.from({ length: 20 }, (_, i) => `same${i}`), "removed"].join("\n");
    const after = ["a", "CHANGED", ...Array.from({ length: 20 }, (_, i) => `same${i}`)].join("\n");
    const rows = diffRows(diffLines(before, after).ops, 2);
    const gap = rows.find((row) => row.kind === "gap");
    expect(gap).toBeDefined();
    if (gap && gap.kind === "gap") expect(gap.count).toBeGreaterThan(0);
  });
});