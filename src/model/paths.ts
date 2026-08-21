/**
 * Reading and writing one value inside a record, by path.
 *
 * A path is dotted, and a segment that is a run of digits is an ARRAY INDEX. So
 * `level-max.0.value` and `normal.3.tval` are ordinary paths, and the same
 * notation addresses a nested object and a nested array without the editor
 * needing to know which it is looking at. That is the engine's own rule, not a
 * convenience invented here, which is why the record editor can drill into
 * anything with one mechanism.
 *
 * WHY THIS EXISTS BESIDE THE PATCH MACHINERY. The patch ops address an existing
 * record that belongs to somebody else. These functions address a record the
 * player is CREATING, which belongs to them, so there is no op to record and
 * nothing to compose - the value simply changes. Two different situations, and
 * conflating them is how a workshop ends up emitting a patch against a record
 * that does not exist yet.
 */

import type { JsonRecord, JsonValue } from "../host/authoring.js";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const INDEX_RE = /^(?:0|[1-9][0-9]*)$/;

/** Whether a path segment addresses an array position rather than a key. */
export function isIndex(segment: string): boolean {
  return INDEX_RE.test(segment);
}

/** Split a path into its segments. An empty path is no segments, not one blank. */
export function segments(path: string): readonly string[] {
  return path === "" ? [] : path.split(".");
}

/** Join segments back into a path. */
export function joinPath(...parts: readonly (string | number)[]): string {
  return parts.filter((p) => p !== "").join(".");
}

/** The value at a path, or undefined when nothing is there. */
export function valueAt(record: JsonRecord, path: string): JsonValue | undefined {
  let at: JsonValue | undefined = record;
  for (const segment of segments(path)) {
    if (Array.isArray(at)) {
      if (!isIndex(segment)) return undefined;
      at = at[Number(segment)];
      continue;
    }
    if (!isRecord(at)) return undefined;
    at = at[segment];
  }
  return at;
}

/**
 * A copy of the record with one value changed.
 *
 * IMMUTABLE, on purpose. Undo is a stack of whole drafts, so a mutation in place
 * would rewrite history as well as the present. Copying a record that is a few
 * dozen fields deep is not a cost worth optimising against a keystroke.
 *
 * Missing containers are created on the way down: an object for a key, an array
 * for an index. A path that walks through something that is neither is refused
 * rather than silently replacing it, because that would throw the player's data
 * away to satisfy a typo.
 */
export function withValueAt(record: JsonRecord, path: string, value: JsonValue): JsonRecord {
  const parts = segments(path);
  if (parts.length === 0) throw new Error("an empty path addresses nothing");
  return setIn(record, parts, value) as JsonRecord;
}

function setIn(container: JsonValue, parts: readonly string[], value: JsonValue): JsonValue {
  const head = parts[0];
  if (head === undefined) return value;
  const rest = parts.slice(1);

  if (isIndex(head)) {
    const index = Number(head);
    const base = Array.isArray(container) ? [...container] : [];
    const child = rest.length === 0 ? value : setIn(base[index] ?? seedFor(rest[0]), rest, value);
    /* Filling the gap with null rather than leaving holes: a sparse array
     * serialises to nulls anyway, so making them explicit is honest. */
    while (base.length < index) base.push(null);
    base[index] = child;
    return base;
  }

  const base: JsonRecord = isRecord(container) ? { ...container } : {};
  base[head] = rest.length === 0 ? value : setIn(base[head] ?? seedFor(rest[0]), rest, value);
  return base;
}

function seedFor(next: string | undefined): JsonValue {
  return next !== undefined && isIndex(next) ? [] : {};
}

/** A copy of the record with one value removed. Array entries close the gap. */
export function withoutValueAt(record: JsonRecord, path: string): JsonRecord {
  const parts = segments(path);
  if (parts.length === 0) return record;
  return removeIn(record, parts) as JsonRecord;
}

function removeIn(container: JsonValue, parts: readonly string[]): JsonValue {
  const head = parts[0];
  if (head === undefined) return container;
  const rest = parts.slice(1);

  if (isIndex(head)) {
    if (!Array.isArray(container)) return container;
    const base = [...container];
    const index = Number(head);
    if (rest.length === 0) base.splice(index, 1);
    else {
      const child = base[index];
      if (child !== undefined) base[index] = removeIn(child, rest);
    }
    return base;
  }

  if (!isRecord(container)) return container;
  const base: JsonRecord = { ...container };
  if (rest.length === 0) delete base[head];
  else {
    const child = base[head];
    if (child !== undefined) base[head] = removeIn(child, rest);
  }
  return base;
}

/** What kind of widget a value wants, from the value itself. */
export type ValueKind = "string" | "number" | "boolean" | "flags" | "rows" | "list" | "object" | "empty";

/**
 * Which editor a value should get.
 *
 * From the VALUE, not from the blueprint, and that ordering is deliberate: a
 * field the blueprint has never seen still has to be editable, and a field whose
 * blueprint says "number" but which currently holds a string has to show the
 * string so the player can see what is wrong with it. The blueprint's opinion
 * arrives separately, as the suggestion and the finding.
 */
export function kindOf(value: JsonValue | undefined): ValueKind {
  if (value === undefined || value === null) return "empty";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) {
    if (value.length === 0) return "list";
    if (value.every((entry) => typeof entry === "string")) return "flags";
    if (value.every((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry))) return "rows";
    return "list";
  }
  return "object";
}

/** A one-line summary of a container, for the row a drill-down opens from. */
export function summarize(value: JsonValue | undefined): string {
  const kind = kindOf(value);
  switch (kind) {
    case "empty":
      return "nothing yet";
    case "flags":
      return (value as string[]).join(", ");
    case "rows":
      return `${(value as JsonValue[]).length} entr${(value as JsonValue[]).length === 1 ? "y" : "ies"}`;
    case "list":
      return `${(value as JsonValue[]).length} item${(value as JsonValue[]).length === 1 ? "" : "s"}`;
    case "object": {
      const keys = Object.keys(value as JsonRecord);
      return keys.length === 0 ? "nothing yet" : keys.join(", ");
    }
    default:
      return String(value);
  }
}
