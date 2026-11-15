/**
 * The zip reader, checked against the two writers it will actually meet.
 *
 * `zipStored` is one of them: a mod this workshop saved and the author is now
 * bringing back. `fflate` is the other, standing in for every ordinary zip tool
 * in the world, which compresses - so an archive from one is the only proof that
 * the deflate branch is real rather than plausible.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { zipSync } from "fflate";
import { unzip, ZIP_LIMITS } from "./unzip.js";
import { zipStored } from "./zip.js";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

afterEach(() => vi.restoreAllMocks());

function declareSizes(bytes: Uint8Array, size: number): void {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  let at = view.getUint32(end + 16, true);
  for (let i = 0; i < view.getUint16(end + 10, true); i++) {
    view.setUint32(at + 24, size, true);
    at += 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
  }
}

/** The one entry at `path`, as text, or a failure naming what came back instead. */
function text(entries: readonly { path: string; contents: string | Uint8Array }[], path: string): string {
  const found = entries.find((entry) => entry.path === path);
  if (found === undefined) throw new Error(`${path} is not in there. Found: ${entries.map((e) => e.path).join(", ")}`);
  return typeof found.contents === "string" ? found.contents : decoder.decode(found.contents);
}

describe("unzip", () => {
  it("exports finite archive, output, and entry limits", () => {
    expect(ZIP_LIMITS).toEqual({
      maxArchiveBytes: 64 * 1024 * 1024,
      maxTotalBytes: 128 * 1024 * 1024,
      maxEntries: 4096,
    });
  });

  it("stops deflate output early when the declared size lies", async () => {
    const payload = new Uint8Array(256 * 1024).fill(65);
    const packed = zipSync({ bomb: payload });
    declareSizes(packed, 1);
    const budget = 20_000;
    let allocated = 0;
    let largestChunk = 0;
    const read = ReadableStreamDefaultReader.prototype.read;
    vi.spyOn(ReadableStreamDefaultReader.prototype, "read").mockImplementation(async function (this: ReadableStreamDefaultReader) {
      const result = await read.call(this);
      if (!result.done) {
        allocated += result.value.byteLength;
        largestChunk = Math.max(largestChunk, result.value.byteLength);
      }
      return result;
    });
    const cancel = vi.spyOn(ReadableStreamDefaultReader.prototype, "cancel");

    const outcome = await unzip(packed, { ...ZIP_LIMITS, maxTotalBytes: budget });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("would unpack to more than");
    expect(cancel).toHaveBeenCalledOnce();
    expect(allocated).toBeGreaterThan(budget);
    expect(allocated).toBeLessThan(budget + largestChunk);
    expect(allocated).toBeLessThan(payload.length);
  });

  it.each([false, true])("checks all declared sizes before inflating: %s", async (aggregate) => {
    const packed = zipSync({ first: encoder.encode("small"), second: encoder.encode("small") });
    declareSizes(packed, aggregate ? 6 : 11);
    const inflate = vi.spyOn(globalThis, "DecompressionStream");
    const outcome = await unzip(packed, { ...ZIP_LIMITS, maxTotalBytes: 10 });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("would unpack to more than");
    expect(inflate).not.toHaveBeenCalled();
  });

  it.each([[0, 0], [0, 9], [9, 0], [9, 9]] as const)("counts output against one budget at compression levels %s and %s", async (first, second) => {
    const payload = new Uint8Array(6000).fill(65);
    const packed = zipSync({ first: [payload, { level: first }], second: [payload, { level: second }] });
    declareSizes(packed, 1);
    const outcome = await unzip(packed, { ...ZIP_LIMITS, maxTotalBytes: 10_000 });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("would unpack to more than");
  });

  it("allows output that exactly fills the budget", async () => {
    const payload = new Uint8Array(5000).fill(65);
    const outcome = await unzip(zipSync({ first: payload, second: payload }), { ...ZIP_LIMITS, maxTotalBytes: 10_000 });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.entries).toEqual([
      { path: "first", contents: payload },
      { path: "second", contents: payload },
    ]);
  });

  it("refuses excess entries before inflating", async () => {
    const inflate = vi.spyOn(globalThis, "DecompressionStream");
    const outcome = await unzip(zipSync({ first: encoder.encode("a"), second: encoder.encode("b") }), { ...ZIP_LIMITS, maxEntries: 1 });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("holds more than 1 entries");
    expect(inflate).not.toHaveBeenCalled();
  });

  it("refuses oversized input before reading its directory", async () => {
    const outcome = await unzip(new Uint8Array(11), { ...ZIP_LIMITS, maxArchiveBytes: 10 });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.why).toContain("limit for a zip");
  });

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
