/**
 * The base64 codec, checked by round-tripping bytes through it.
 */

import { describe, expect, it } from "vitest";
import { base64ToBytes, bytesToBase64 } from "./base64.js";

describe("bytesToBase64 and base64ToBytes", () => {
  it("round-trips arbitrary bytes, including ones that are not valid UTF-8 on their own", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect([...base64ToBytes(bytesToBase64(png))]).toEqual([...png]);
  });

  it("round-trips every length, so padding is right whether it needs one or two `=`", () => {
    for (let length = 0; length <= 8; length++) {
      const bytes = new Uint8Array(length).map((_, i) => (i * 37) % 256);
      expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
    }
  });

  it("matches the standard alphabet on a known vector", () => {
    /* "man" in ASCII, the textbook example the RFC itself uses. */
    const bytes = new TextEncoder().encode("man");
    expect(bytesToBase64(bytes)).toBe("bWFu");
  });

  it("round-trips an empty array", () => {
    expect(bytesToBase64(new Uint8Array())).toBe("");
    expect([...base64ToBytes("")]).toEqual([]);
  });
});
