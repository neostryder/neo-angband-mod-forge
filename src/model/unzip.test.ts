/**
 * The zip reader, checked against the two writers it will actually meet.
 *
 * `zipStored` is one of them: a mod this workshop saved and the author is now
 * bringing back. `fflate` is the other, standing in for every ordinary zip tool
 * in the world, which compresses - so an archive from one is the only proof that
 * the deflate branch is real rather than plausible.
 */

import { describe, expect, it } from "vitest";
import { zipSync } from "fflate";
import { unzip } from "./unzip.js";
import { zipStored } from "./zip.js";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

/** The one entry at `path`, as text, or a failure naming what came back instead. */
function text(entries: readonly { path: string; contents: string | Uint8Array }[], path: string): string {
  const found = entries.find((entry) => entry.path === path);
  if (found === undefined) throw new Error(`${path} is not in there. Found: ${entries.map((e) => e.path).join(", ")}`);
  return typeof found.contents === "string" ? found.contents : decoder.decode(found.contents);
}

describe("unzip", () => {
  it("reads a stored archive, which is what this workshop writes", async () => {
    const outcome = await unzip(zipStored([
      { path: "manifest.json", contents: '{\n  "id": "my-mod"\n}\n' },
      { path: "monster.json", contents: '{\n  "records": []\n}\n' },
    ]));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.entries.map((entry) => entry.path).sort()).toEqual(["manifest.json", "monster.json"]);
    expect(text(outcome.entries, "manifest.json")).toBe('{\n  "id": "my-mod"\n}\n');
  });

  it("reads a deflated archive, which is what every other tool writes", async () => {
    /* Long enough and repetitive enough that the compressor actually compresses,
     * so this is the deflate branch rather than a stored entry in disguise. */
    const body = `${'{"records":[' + '{"name":"cave rat","speed":110},'.repeat(200)}{}]}\n`;
    const packed = zipSync({ "manifest.json": encoder.encode('{"id":"my-mod"}'), "monster.json": encoder.encode(body) });
    expect(packed.length).toBeLessThan(body.length);
    const outcome = await unzip(packed);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(text(outcome.entries, "monster.json")).toBe(body);
  });

  it("keeps non-ASCII text intact through the compressed path", async () => {
    const body = "Grip, Farmer Maggot's dog - lourd, rapide, tres desagreable. Élan. 中文.\n";
    const outcome = await unzip(zipSync({ "monster.json": encoder.encode(body) }));
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(text(outcome.entries, "monster.json")).toBe(body);
  });

  it("drops the entries a zip uses to record a folder", async () => {
    /* A folder marker is a zero-length entry whose name ends in a slash. Carried
     * through, it would become an empty file called "lib/" inside the mod. */
    const outcome = await unzip(zipSync({ lib: { "helper.js": encoder.encode("export default 1;\n") } }));
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.entries.map((entry) => entry.path)).toEqual(["lib/helper.js"]);
  });

  it("refuses a file that is not a zip, by name rather than by stack trace", async () => {
    const outcome = await unzip(encoder.encode("this is a monster, not an archive"));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("not a zip");
  });

  it("refuses a truncated archive rather than reading half of it", async () => {
    const whole = zipStored([{ path: "manifest.json", contents: '{"id":"my-mod"}' }]);
    const outcome = await unzip(whole.slice(0, whole.length - 4));
    expect(outcome.ok).toBe(false);
  });
});
