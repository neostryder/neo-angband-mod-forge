import { describe, expect, it } from "vitest";
import type { JsonRecord } from "../../host/authoring.js";
import { numericFields } from "./rebalance.js";

describe("bulk-retune numeric fields", () => {
  it("finds numeric leaves inside objects by the dotted paths field patches use", () => {
    const egos: JsonRecord[] = [
      { name: "first", alloc: { common: 20 }, info: { cost: 500, rating: 4 } },
      { name: "second", alloc: { common: 30 }, info: { cost: 900, rating: 7 } },
    ];

    expect(numericFields(egos)).toEqual([
      "alloc.common",
      "info.cost",
      "info.rating",
    ]);
  });

  it("does not treat array positions as equivalent fields across records", () => {
    const records: JsonRecord[] = [
      { rows: [{ value: 1 }] },
      { rows: [{ value: 2 }] },
    ];

    expect(numericFields(records)).toEqual([]);
  });
});
