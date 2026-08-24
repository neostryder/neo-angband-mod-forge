/**
 * The zip writer, checked by unzipping it with the reader the game uses.
 *
 * `fflate` is what the game imports to READ a mod archive, so round-tripping
 * through it is the only test of this file that means anything: a zip that is
 * structurally plausible and that the actual reader rejects is a zip that fails
 * at install time, on somebody else's machine.
 */

import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { crc32, zipStored } from "./zip.js";

const decoder = new TextDecoder();

describe("zipStored", () => {
  it("round-trips through the reader the game itself uses", () => {
    const bytes = zipStored([
      { path: "manifest.json", contents: '{\n  "id": "my-mod"\n}\n' },
      { path: "monster.json", contents: '{\n  "records": []\n}\n' },
    ]);
    const out = unzipSync(bytes);
    expect(Object.keys(out).sort()).toEqual(["manifest.json", "monster.json"]);
    expect(decoder.decode(out["manifest.json"])).toBe('{\n  "id": "my-mod"\n}\n');
    expect(decoder.decode(out["monster.json"])).toBe('{\n  "records": []\n}\n');
  });

  it("carries non-ASCII text through unharmed", () => {
    /* A monster's description is whatever its author typed, and an author who
     * typed an accent has to get it back. */
    const text = "Grip, Farmer Maggot's dog - lourd, rapide, tres desagreable. Élan. 中文.\n";
    const out = unzipSync(zipStored([{ path: "monster.json", contents: text }]));
    expect(decoder.decode(out["monster.json"])).toBe(text);
  });

  it("is reproducible: the same files give byte-identical archives", () => {
    /* An install records a digest of what it stored. A zip whose bytes moved
     * because a second went by would make two identical mods look like two
     * different ones. */
    const files = [{ path: "manifest.json", contents: "{}\n" }];
    expect([...zipStored(files)]).toEqual([...zipStored(files)]);
  });

  it("writes an empty archive rather than refusing one", () => {
    const out = unzipSync(zipStored([]));
    expect(Object.keys(out)).toEqual([]);
  });

  it("carries a binary entry through as exact bytes, alongside text entries unchanged", () => {
    /* The PNG signature plus an IHDR chunk header - not a whole valid image, just
     * enough non-ASCII, non-UTF-8-safe bytes (0x89, 0x00) that a codec silently
     * treating them as text would corrupt them. */
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const out = unzipSync(
      zipStored([
        { path: "manifest.json", contents: '{\n  "id": "my-mod"\n}\n' },
        { path: "tiles/hero.png", contents: png },
      ]),
    );
    expect(Object.keys(out).sort()).toEqual(["manifest.json", "tiles/hero.png"]);
    expect(decoder.decode(out["manifest.json"])).toBe('{\n  "id": "my-mod"\n}\n');
    expect([...(out["tiles/hero.png"] ?? [])]).toEqual([...png]);
  });

  it("computes the CRC-32 the format asks for", () => {
    /* The known answer for "123456789" under the standard polynomial. Pinned
     * because a wrong CRC produces an archive that unzips on a lenient reader and
     * fails on a strict one, which is the worst possible failure mode. */
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
});
