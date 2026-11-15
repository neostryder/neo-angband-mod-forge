/**
 * A zip reader, because a mod cannot borrow one either.
 *
 * `zip.ts` explains why the WRITER is hand-written: the game imports `fflate` to
 * read a mod archive, a folder plugin resolves no bare specifier, and the build
 * marks every non-relative import external and fails on a survivor. Reading is
 * the same bargain in the other direction, and it arrived for the same reason -
 * forking a mod supplied as a file means opening an archive somebody else wrote.
 *
 * TWO METHODS, AND ONLY TWO. Method 0 is a plain copy of the bytes, which is what
 * `zipStored` writes, so a mod this workshop emitted is readable with no
 * decompressor at all. Method 8 is deflate, which is what every other tool
 * writes, and it is handed to `DecompressionStream("deflate-raw")` - the
 * platform's own inflater, present in the browser and in Node, rather than a
 * third one written here. Anything else is refused by number instead of being
 * decoded wrongly.
 *
 * ASYNC BECAUSE INFLATING IS. `DecompressionStream` is a stream, so the whole
 * reader is a promise even for an archive that turns out to be entirely stored.
 * A reader that was sometimes synchronous would be a reader every caller had to
 * ask about first.
 *
 * NOT A VALIDATOR. This turns bytes into paths and contents. Whether those files
 * are a mod is `fork.ts`'s question, and whether the mod is one the game would
 * accept is the install door's.
 */

import type { ZipEntry } from "./zip.js";

/** What reading one archive produced. A refusal names the reason and reads nothing. */
export type UnzipOutcome =
  | { readonly ok: true; readonly entries: readonly ZipEntry[] }
  | { readonly ok: false; readonly why: string };

export const ZIP_LIMITS = {
  maxArchiveBytes: 64 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
  maxEntries: 4096,
};

export function zipSizeCheck(size: number, limit = ZIP_LIMITS.maxArchiveBytes): { readonly ok: true } | { readonly ok: false; readonly why: string } {
  return size > limit
    ? { ok: false, why: `That file exceeds the ${limit / (1024 * 1024)} MiB limit for a zip.` }
    : { ok: true };
}

function unpackedLimit(limit: number): string {
  return `That zip unpacks to more than ${limit / (1024 * 1024)} MiB.`;
}

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_DIRECTORY = 0x06054b50;

/** The largest a stored size may be before the archive needs zip64 to say it. */
const ZIP64_MARKER = 0xffffffff;

/**
 * Read an archive into its files.
 *
 * A DIRECTORY ENTRY IS DROPPED RATHER THAN CARRIED. A zip records a folder as a
 * zero-length entry whose name ends in a slash, and a mod folder is a set of
 * files: carrying the marker through would put an empty file called `lib/` in the
 * draft, which no writer here would ever emit and no reader on the other side
 * would know what to do with.
 */
export async function unzip(bytes: Uint8Array, limits = ZIP_LIMITS): Promise<UnzipOutcome> {
  const size = zipSizeCheck(bytes.length, limits.maxArchiveBytes);
  if (!size.ok) return size;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = findEndOfDirectory(view);
  if (end < 0) {
    return { ok: false, why: "That file is not a zip: it has no central directory at the end of it." };
  }

  const count = view.getUint16(end + 10, true);
  if (count > limits.maxEntries) {
    return { ok: false, why: `That zip has more than ${limits.maxEntries} entries.` };
  }
  const directoryAt = view.getUint32(end + 16, true);
  if (directoryAt >= bytes.length) {
    return { ok: false, why: "That zip's directory points past the end of the file, so it is truncated or damaged." };
  }

  const files: { name: string; method: number; raw: Uint8Array }[] = [];
  let declared = 0;
  let at = directoryAt;
  for (let i = 0; i < count; i++) {
    if (at + 46 > bytes.length || view.getUint32(at, true) !== CENTRAL_HEADER) {
      return { ok: false, why: `That zip's directory ends after ${i} of its ${count} files, so it is damaged.` };
    }
    const method = view.getUint16(at + 10, true);
    const compressed = view.getUint32(at + 20, true);
    const uncompressed = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const localAt = view.getUint32(at + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extraLength + commentLength;

    if (compressed === ZIP64_MARKER || uncompressed === ZIP64_MARKER || localAt === ZIP64_MARKER) {
      return {
        ok: false,
        why: `${name} uses the zip64 extension, which the workshop cannot open. A mod folder is too small to need it, so this is probably not a mod.`,
      };
    }
    declared += uncompressed;
    if (declared > limits.maxTotalBytes) return { ok: false, why: unpackedLimit(limits.maxTotalBytes) };
    if (name.endsWith("/")) continue;
    if (method !== 0 && method !== 8) {
      return {
        ok: false,
        why: `${name} is compressed with method ${method}, which is neither stored nor deflate. Repack the mod as an ordinary zip, or pick its folder instead.`,
      };
    }
    if (localAt + 30 > bytes.length || view.getUint32(localAt, true) !== LOCAL_HEADER) {
      return { ok: false, why: `That zip lists ${name} at a position that holds no file, so the zip is damaged.` };
    }
    const dataAt = localAt + 30 + view.getUint16(localAt + 26, true) + view.getUint16(localAt + 28, true);
    if (dataAt + compressed > bytes.length) {
      return { ok: false, why: `${name} runs past the end of that zip, so it is truncated.` };
    }
    const raw = bytes.subarray(dataAt, dataAt + compressed);
    files.push({ name, method, raw });
  }

  /* The directory is untrusted, so no inflater runs until every declared size fits. */
  const entries: ZipEntry[] = [];
  const budget = { used: 0, limit: limits.maxTotalBytes };
  for (const { name, method, raw } of files) {
    if (method === 0) {
      budget.used += raw.length;
      if (budget.used > budget.limit) return { ok: false, why: unpackedLimit(budget.limit) };
      entries.push({ path: name, contents: raw.slice() });
      continue;
    }
    const inflated = await inflate(raw, budget);
    if (!inflated.ok) return { ok: false, why: `${name} could not be unpacked: ${inflated.why}` };
    entries.push({ path: name, contents: inflated.bytes });
  }
  return { ok: true, entries };
}

/**
 * Where the end-of-directory record starts, or -1.
 *
 * SEARCHED BACKWARDS, because the record is last and carries a comment of up to
 * 65535 bytes after it, so its position cannot be computed. The scan stops at the
 * furthest back it could legally be rather than walking the whole file.
 */
function findEndOfDirectory(view: DataView): number {
  const floor = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let at = view.byteLength - 22; at >= floor; at--) {
    if (view.getUint32(at, true) === END_OF_DIRECTORY) return at;
  }
  return -1;
}

type Inflated = { readonly ok: true; readonly bytes: Uint8Array } | { readonly ok: false; readonly why: string };

/**
 * Deflate, undone by the platform.
 *
 * `deflate-raw` and not `deflate`: a zip entry holds the deflate stream on its
 * own, with none of the zlib header and trailer the plain name expects. Feeding
 * one to the wrong format fails on the first byte, which is a confusing way to
 * find out about a two-byte header.
 */
async function inflate(raw: Uint8Array, budget: { used: number; readonly limit: number }): Promise<Inflated> {
  const Decompressor = (globalThis as { DecompressionStream?: typeof DecompressionStream }).DecompressionStream;
  if (Decompressor === undefined) {
    return {
      ok: false,
      why: "this browser cannot unpack a compressed zip. Pick the mod's folder instead of its zip.",
    };
  }
  try {
    const stream = new Blob([raw as unknown as BlobPart]).stream().pipeThrough(new Decompressor("deflate-raw"));
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        budget.used += chunk.value.length;
        if (budget.used > budget.limit) {
          await reader.cancel().catch(() => undefined);
          return { ok: false, why: unpackedLimit(budget.limit) };
        }
        chunks.push(chunk.value);
        length += chunk.value.length;
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let at = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, at);
      at += chunk.length;
    }
    return { ok: true, bytes };
  } catch (e) {
    return { ok: false, why: e instanceof Error ? e.message : String(e) };
  }
}
