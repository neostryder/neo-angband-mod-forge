/**
 * A zip writer, in about a hundred lines, because a mod cannot borrow one.
 *
 * The game already depends on `fflate` and already imports its `unzipSync` to
 * READ a mod archive. A folder plugin cannot resolve a bare specifier, so the
 * compressor next to it is not reachable from here, and asking the engine to
 * publish one would be asking for a seam in order to avoid writing this file.
 *
 * STORED, NOT DEFLATED. Every entry is written with compression method 0, which
 * is a plain copy of the bytes with a CRC beside them. A stored zip is a zip: the
 * reader on the other side is `unzipSync`, which handles method 0 as it handles
 * method 8, and the archives this writes are two or three small JSON files. What
 * stored buys is that this file contains no compressor, which is the whole
 * difference between something worth reading and something worth trusting.
 *
 * REPRODUCIBLE, DELIBERATELY. Every entry carries the same fixed timestamp
 * rather than the clock, so the same project emits the same bytes and therefore
 * the same digest. An install records a digest, so a zip whose bytes moved
 * because a second went by would make two identical mods look like two different
 * ones.
 */

/**
 * One file to put in the archive.
 *
 * `contents` is a `string`, encoded as UTF-8, or a `Uint8Array` written exactly
 * as given - a tile pack, a font, a sound. Neither is converted into the other.
 */
export interface ZipEntry {
  readonly path: string;
  readonly contents: string | Uint8Array;
}

/**
 * The zero hour every entry is stamped with: 1980-01-01 00:00:00, which is the
 * earliest a DOS timestamp can express and therefore the obvious "no time here".
 */
const DOS_TIME = 0;
const DOS_DATE = (1 << 5) | 1; /* year 1980, month 1, day 1 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = (CRC_TABLE[(c ^ (bytes[i] ?? 0)) & 0xff] ?? 0) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

class Writer {
  private readonly parts: Uint8Array[] = [];
  private length = 0;

  get at(): number {
    return this.length;
  }

  push(bytes: Uint8Array): void {
    this.parts.push(bytes);
    this.length += bytes.length;
  }

  u16(value: number): void {
    this.push(new Uint8Array([value & 0xff, (value >>> 8) & 0xff]));
  }

  u32(value: number): void {
    this.push(new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]));
  }

  finish(): Uint8Array {
    const out = new Uint8Array(this.length);
    let at = 0;
    for (const part of this.parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  }
}

/**
 * Pack the entries into the bytes of a zip.
 *
 * Paths are used verbatim, so a caller that wants a folder inside the archive
 * writes "my-mod/manifest.json". The workshop does not: the mod importer expects
 * the manifest at the root or one level down, and the root is the simpler of the
 * two to be right about.
 */
export function zipStored(entries: readonly ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const body = new Writer();
  const directory: { name: Uint8Array; crc: number; size: number; offset: number }[] = [];

  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const data = typeof entry.contents === "string" ? encoder.encode(entry.contents) : entry.contents;
    const crc = crc32(data);
    const offset = body.at;

    body.u32(0x04034b50); /* local file header */
    body.u16(10); /* version needed: 1.0, which is all stored requires */
    body.u16(0); /* flags */
    body.u16(0); /* method: stored */
    body.u16(DOS_TIME);
    body.u16(DOS_DATE);
    body.u32(crc);
    body.u32(data.length); /* compressed size */
    body.u32(data.length); /* uncompressed size */
    body.u16(name.length);
    body.u16(0); /* extra field length */
    body.push(name);
    body.push(data);

    directory.push({ name, crc, size: data.length, offset });
  }

  const centralAt = body.at;
  for (const entry of directory) {
    body.u32(0x02014b50); /* central directory header */
    body.u16(20); /* version made by */
    body.u16(10); /* version needed */
    body.u16(0); /* flags */
    body.u16(0); /* method: stored */
    body.u16(DOS_TIME);
    body.u16(DOS_DATE);
    body.u32(entry.crc);
    body.u32(entry.size);
    body.u32(entry.size);
    body.u16(entry.name.length);
    body.u16(0); /* extra */
    body.u16(0); /* comment */
    body.u16(0); /* disk number */
    body.u16(0); /* internal attributes */
    body.u32(0); /* external attributes */
    body.u32(entry.offset);
    body.push(entry.name);
  }
  const centralSize = body.at - centralAt;

  body.u32(0x06054b50); /* end of central directory */
  body.u16(0); /* this disk */
  body.u16(0); /* disk with the directory */
  body.u16(directory.length);
  body.u16(directory.length);
  body.u32(centralSize);
  body.u32(centralAt);
  body.u16(0); /* comment length */

  return body.finish();
}
