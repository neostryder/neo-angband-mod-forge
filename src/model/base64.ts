/**
 * A base64 codec, in about thirty lines, because a mod folder cannot borrow one.
 *
 * THE SAME REASONING AS `zip.ts`. `btoa`/`atob` exist in a browser but take a
 * "binary string" (one code unit per byte) rather than a `Uint8Array`, and are
 * not guaranteed at all where this code also runs - a test file under Node, for
 * one. Writing the thirty lines here is cheaper than carrying that assumption
 * into every caller.
 *
 * THIS IS WHAT LETS BINARY EXTRAS SURVIVE `ctx.prefs`. That seam is declared as
 * "one JSON value", and `JSON.stringify` does not know what a `Uint8Array` is: it
 * serialises one as `{"0":137,"1":80,...}`, and reading that back gives a plain
 * object with no way to tell it was ever bytes - a silent corruption of exactly
 * the content this seam exists to add. `src/model/persist.ts` uses this codec to
 * turn a `Uint8Array` into a marker object before it ever reaches `JSON.stringify`,
 * and back again on the way in, so the round trip is this module's problem and
 * nobody else's.
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Encode bytes as base64, standard alphabet, padded with "=". */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += CHARS[b0 >> 2];
    out += CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? "=" : CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? "=" : CHARS[b2 & 0x3f];
  }
  return out;
}

/** Decode base64 back to bytes. A character outside the alphabet is skipped rather than refused. */
export function base64ToBytes(text: string): Uint8Array {
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of text) {
    if (ch === "=") break;
    const value = CHARS.indexOf(ch);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}
