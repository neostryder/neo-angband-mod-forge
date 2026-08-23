/**
 * A path-based field op walks ordinary object properties by name. Without a
 * guard, a path segment of "__proto__", "prototype", or "constructor" resolves
 * through the prototype chain instead of an own property, and the final
 * assignment lands on the shared Object.prototype rather than on the record
 * being edited - see MOD-001 in the security review.
 */

import { describe, expect, it } from "vitest";
import { applyFieldPatch, StubPatchError } from "./authoring-stub.js";

describe("field-op paths cannot reach the prototype chain", () => {
  const record = { name: "grey wolf" };

  for (const segment of ["__proto__", "prototype", "constructor"]) {
    it(`refuses a "set" op whose path is "${segment}.polluted"`, () => {
      expect(() => applyFieldPatch(record, [{ op: "set", path: `${segment}.polluted`, value: 1 }])).toThrow(
        StubPatchError,
      );
      expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
    });

    it(`refuses a "set" op whose path ends in ".${segment}"`, () => {
      expect(() => applyFieldPatch(record, [{ op: "set", path: `nested.${segment}`, value: 1 }])).toThrow(
        StubPatchError,
      );
      expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
    });
  }

  it("still applies an ordinary path", () => {
    const out = applyFieldPatch(record, [{ op: "set", path: "name", value: "dire wolf" }]);
    expect(out["name"]).toBe("dire wolf");
  });
});
