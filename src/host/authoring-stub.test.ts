/**
 * A path-based field op walks ordinary object properties by name. Without a
 * guard, a path segment of "__proto__", "prototype", or "constructor" resolves
 * through the prototype chain instead of an own property, and the final
 * assignment lands on the shared Object.prototype rather than on the record
 * being edited - see MOD-001 in the security review.
 */

import { describe, expect, it } from "vitest";
import { satisfies } from "@rpgm-tools/neo-angband-mod-sdk";
import { applyFieldPatch, STUB_AUTHORING, StubPatchError } from "./authoring-stub.js";

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

/* The workshop checks manifest ranges with whichever authoring library it gets,
 * the SDK's or this stub. If the two disagree on any version and range pair, or
 * one throws where the other answers, a range would pass in one and be refused
 * in the other. */
describe("the stub's semver matches the SDK's", () => {
  const versions = ["0.0.0", "0.0.3", "0.2.5", "1.0.0", "1.2.3", "1.2.4", "1.3.0", "1.9.10", "2.0.0", "2.0.0-rc.1", "2.0.0-rc.10", "2.0.0-worker", "3.0.0", "banana"];
  const ranges = [
    "*", "x", "X", "1.2.3", "1.2", "1", "^1.2.3", "^0.2.3", "^0.0.3", "~1.2.3", "~1.2", "~1",
    ">=1.0.0 <2.0.0", ">=2.0.0 <3.0.0", ">1.2", ">1.9.9", "<=1.2.3", "=1.2.3", "<2.0.0",
    ">=2.0.0-rc.2", "2.0.0-worker", "^x", ">=x", "1.x", "banana", "", " ", "=>1.0.0", ">=1.0.0 banana",
  ];
  const outcome = (f: (v: string, r: string) => boolean, v: string, r: string): boolean | "throws" => {
    try {
      return f(v, r);
    } catch {
      return "throws";
    }
  };
  for (const range of ranges) {
    it(`for the range "${range}"`, () => {
      for (const version of versions) {
        expect([version, outcome(satisfies, version, range)]).toEqual([version, outcome(STUB_AUTHORING.satisfies, version, range)]);
      }
    });
  }
});
