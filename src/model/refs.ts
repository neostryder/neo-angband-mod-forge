/**
 * Refs: the string every later patch and every other mod's compatibility claim
 * will name this record by.
 *
 * The workshop shows a record's ref at the moment the player names the record,
 * not on the review screen, for two reasons. It is the identity the rest of the
 * modding world addresses their work by, so it is worth seeing. And it is where
 * one of the nastiest mistakes in the format hides: two records that come out
 * with the same identity make that identity unaddressable, and the composer
 * reports it rather than guessing. A player who names their new sword exactly
 * what a core sword is called has made both of them unreachable, and the only
 * moment that is cheap to fix is while they are still typing.
 */

import type { AuthoringApi, ComposedRecords, JsonRecord } from "../host/authoring.js";

/** A fully qualified ref: the owning pack, then the record's identity. */
export function refFor(owner: string, key: string): string {
  return `${owner}:${key}`;
}

/** Split a ref back into its owner and its key. A ref with no colon is core's. */
export function splitRef(ref: string): { owner: string; key: string } {
  const at = ref.indexOf(":");
  if (at < 0) return { owner: "core", key: ref };
  return { owner: ref.slice(0, at), key: ref.slice(at + 1) };
}

/** Who owns a composed record. Nothing recorded means core wrote it. */
export function ownerOf(api: AuthoringApi, record: JsonRecord): string {
  return api.provenanceOf(record)?.owner ?? "core";
}

/** The ref a composed record is addressed by, or null when it has no identity. */
export function refOf(api: AuthoringApi, file: string, record: JsonRecord): string | null {
  const key = api.recordKey(file, record);
  if (key === null) return null;
  return refFor(ownerOf(api, record), key);
}

/** What a proposed record's identity would be, and whether it can have one. */
export interface IdentityCheck {
  /** The key the record would be addressed by, or null when it can have none. */
  readonly key: string | null;
  /** The full ref, once the owning pack is known. */
  readonly ref: string | null;
  /** True when something already loaded comes out with the same key. */
  readonly collides: boolean;
  /** The colliding record's name, when there is one. */
  readonly collidesWith?: string;
  /** One sentence, always present, saying what the state of play is. */
  readonly says: string;
}

/**
 * Check a proposed record's identity against everything currently loaded.
 *
 * Called on every keystroke in the identity fields, so it walks the file's
 * records once and does nothing clever. The files it walks are single-digit
 * thousands of records at the very most.
 */
export function checkIdentity(
  api: AuthoringApi,
  file: string,
  draft: JsonRecord,
  owner: string,
  records: ComposedRecords,
): IdentityCheck {
  const key = api.recordKey(file, draft);
  if (key === null) {
    return {
      key: null,
      ref: null,
      collides: false,
      says: `Nothing here yet gives this record an identity. ${file} takes one from ${api.keyDescription(file)}.`,
    };
  }
  const ref = refFor(owner, key);
  for (const existing of records[file] ?? []) {
    if (existing === draft) continue;
    if (api.recordKey(file, existing) !== key) continue;
    const name = typeof existing["name"] === "string" ? existing["name"] : key;
    const from = ownerOf(api, existing);
    return {
      key,
      ref,
      collides: true,
      collidesWith: name,
      says:
        `This would come out as "${key}", which is already ${from === "core" ? "the base game's" : `${from}'s`} ` +
        `"${name}". Two records with one identity make both of them unaddressable, so change something ` +
        `${api.keyDescription(file)} draws on.`,
    };
  }
  return { key, ref, collides: false, says: `This will be addressed as ${ref}.` };
}

/**
 * A short label for a composed record, for a list row.
 *
 * Falls through the identity fields the record-key table actually uses rather
 * than assuming `name`, because `store` has no name, `brand` and `slay` are
 * keyed on `code`, and a row reading "(unnamed record)" for every shop would be
 * the workshop's fault rather than the data's.
 */
export function labelOf(api: AuthoringApi, file: string, record: JsonRecord): string {
  const spec = api.keySpecFor(file);
  if (spec.kind === "fields") {
    const parts: string[] = [];
    for (const path of spec.paths) {
      const value = valueAt(record, path);
      if (typeof value === "string" && value !== "") parts.push(value);
      else if (typeof value === "number") parts.push(String(value));
    }
    if (parts.length > 0) return parts.join(" ");
  }
  const name = record["name"];
  if (typeof name === "string" && name !== "") return name;
  return api.recordKey(file, record) ?? "(no identity)";
}

function valueAt(record: JsonRecord, path: string): unknown {
  let at: unknown = record;
  for (const segment of path.split(".")) {
    if (typeof at !== "object" || at === null || Array.isArray(at)) return undefined;
    at = (at as Record<string, unknown>)[segment];
  }
  return at;
}
