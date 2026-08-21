/**
 * A working stand-in for the authoring SDK, for a host that cannot hand it over.
 *
 * WHAT THIS IS FOR. `ctx.authoring` does not exist on any engine yet
 * (`docs/ENGINE_SEAMS.md`, seam 1). Without something behind that interface the
 * workshop would be a set of screens that draw nothing, which cannot be shown to
 * anybody and cannot be tested. This is the something. Every screen renders,
 * every gesture works, and the files it emits are structurally exactly what the
 * folder reader expects.
 *
 * WHAT IT IS NOT, said as loudly here as the workshop says it on screen. Three
 * of these functions are MEASUREMENTS - `requiredFields`, `fieldUsage`,
 * `suggestFields` - and here they measure `stub-content.ts`, which is a dozen
 * invented monsters. A suggestion drawn from them is evidence about the fixture
 * and about nothing else. And `checkRecords` here is a deliberately small subset
 * of the real checker: it finds a missing expected field, an unknown field name,
 * a duplicate identity and a missing depth, and it does not find any of the
 * fourteen companion rules, the dangling references, or the field-shape
 * refusals. A validator that disagreed with the game's own and was believed
 * would be worse than no validator, so this one says what it is: every call
 * returns one `hint` whose rule is `stub/not-the-real-checker`, which the
 * findings pane shows first and does not let the player filter away.
 *
 * WHAT IS SAFE TO IMPLEMENT HERE, and why the line falls where it does. The
 * field-op mechanics, the record-identity rule and the emitter are DETERMINISTIC:
 * they have no measured input, so there is nothing for them to drift from, and
 * `patch.test.ts` and `refs.test.ts` pin them against the rules written down in
 * the engine's own record-key table. The measurements and the checker are the
 * parts that can only be right if they are the engine's, which is why the seam
 * exists.
 */

import type {
  AuthoringApi,
  AuthoringFinding,
  CheckOptions,
  ComposedPatch,
  ComposedRecords,
  DraftedRecord,
  EmittedFile,
  FieldDecl,
  FieldOp,
  FieldPatch,
  FieldShape,
  FieldType,
  FieldUsage,
  FileContribution,
  JsonRecord,
  JsonValue,
  LoadedPack,
  PackManifest,
  PeerSet,
  ProjectBuild,
  ProjectLike,
  RecordKeySpec,
  RecordProvenance,
  Suggestion,
  TemplateScope,
} from "./authoring.js";
import { STUB_RECORDS } from "./stub-content.js";

/* ------------------------------------------------------------------ *
 * Rules transcribed from the engine, not invented here                *
 * ------------------------------------------------------------------ */

/** The field that decides whether two records are comparable at all. */
const PEER_FIELD: Readonly<Record<string, string>> = {
  object: "type",
  ego_item: "type",
  artifact: "base-object.tval",
  monster: "base",
  monster_base: "glyph",
  terrain: "code",
};

/** The field that says how deep a record belongs. */
const DEPTH_FIELD: Readonly<Record<string, string>> = {
  object: "level",
  monster: "depth",
  artifact: "level",
};

/** How many levels either side of a draft's depth still counts as comparable. */
const PEER_WINDOW = 7;

/** The share at or above which a field counts as "common". */
const COMMON_SHARE = 0.5;

/**
 * What a new record does NOT inherit from the record it is modelled on.
 *
 * Shape and scale carry over; powers do not. A new orc gets the orc's hit points
 * and armour and none of its attacks until the player says so.
 */
const MODEL_EXCLUDE: ReadonlySet<string> = new Set([
  "name",
  "desc",
  "msg",
  "code",
  "flags",
  "flags-off",
  "values",
  "slay",
  "brand",
  "curse",
  "effect",
  "effect-yx",
  "act",
  "spells",
  "blow",
  "friends",
  "friends-base",
  "drop",
  "drop-base",
  "mimic",
  "shape",
  "expr",
  "dice",
  "time",
  "charges",
  "pval",
]);

/** How each record file that names its identity differently derives it. */
const KEY_SPECS: Readonly<Record<string, RecordKeySpec>> = {
  brand: { kind: "fields", paths: ["code"] },
  slay: { kind: "fields", paths: ["code"] },
  chest_trap: { kind: "fields", paths: ["code"] },
  projection: { kind: "fields", paths: ["code"] },
  object_base: { kind: "fields", paths: ["name.tval"] },
  trap: { kind: "fields", paths: ["name.name", "name.desc"] },
  store: { kind: "fields", paths: ["store"] },
  pain: { kind: "fields", paths: ["type"] },
  ui_knowledge: { kind: "fields", paths: ["monster-category"] },
  names: { kind: "fields", paths: ["section"] },
  body: { kind: "fields", paths: ["body"] },
  world: { kind: "fields", paths: ["level.name"] },
  flavor: { kind: "fields", paths: ["kind.tval"] },
  hints: { kind: "fields", paths: ["H"] },
  constants: { kind: "singleton" },
  visuals: { kind: "singleton" },
  object: { kind: "fields", paths: ["type", "name"] },
  vault: { kind: "fields", paths: ["type", "name"] },
  ego_item: { kind: "fields", paths: ["name"], discriminator: ["type", "item.tval"] },
};

const PACK_GROUP_NAMES: readonly string[] = [
  "framework",
  "overhaul",
  "content",
  "gameplay",
  "tweaks",
  "interface",
  "cosmetic",
  "late",
];

const ID_RE = /^[a-z][a-z0-9-]*$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/* ------------------------------------------------------------------ *
 * Shared helpers, all pure                                            *
 * ------------------------------------------------------------------ */

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The engine's own slug rule, including the two characters it spells out. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function keySlug(value: string): string {
  return slugify(value.replace(/\*/g, " star ").replace(/\+/g, " plus "));
}

/** A dot path, where a run of digits is an array index. */
export function atPath(record: unknown, path: string): unknown {
  let at: unknown = record;
  for (const seg of path.split(".")) {
    if (Array.isArray(at)) {
      if (!/^(?:0|[1-9][0-9]*)$/.test(seg)) return undefined;
      at = at[Number(seg)];
      continue;
    }
    if (!isRecord(at)) return undefined;
    at = at[seg];
  }
  return at;
}

function shapeOf(value: JsonValue): FieldType {
  if (value === null) return "any";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}

function median(sorted: readonly number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
  return Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
}

/** Levenshtein distance, capped, for "did you mean". */
function editDistance(a: string, b: string): number {
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) rows.push(new Array<number>(b.length + 1).fill(0));
  const first = rows[0];
  if (first) for (let j = 0; j <= b.length; j++) first[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = rows[i];
    const prev = rows[i - 1];
    if (!row || !prev) continue;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
  }
  return rows[a.length]?.[b.length] ?? Math.max(a.length, b.length);
}

/* ------------------------------------------------------------------ *
 * Measuring the fixture, the same way the engine measures its content *
 * ------------------------------------------------------------------ */

function measureField(values: readonly JsonValue[], total: number): FieldShape {
  const types = new Set<FieldType>();
  const numbers: number[] = [];
  const vocabulary = new Set<string | boolean>();
  const childValues = new Map<string, JsonValue[]>();
  const itemValues: JsonValue[] = [];

  for (const value of values) {
    types.add(shapeOf(value));
    if (typeof value === "number") numbers.push(value);
    if (typeof value === "string" || typeof value === "boolean") vocabulary.add(value);
    if (Array.isArray(value)) for (const item of value) itemValues.push(item);
    else if (isRecord(value)) {
      for (const [k, v] of Object.entries(value)) {
        const bucket = childValues.get(k);
        if (bucket) bucket.push(v);
        else childValues.set(k, [v]);
      }
    }
  }

  const shape: {
    count: number;
    types: FieldType[];
    range?: { min: number; max: number; median: number };
    fields?: Record<string, FieldShape>;
    items?: FieldShape;
    values?: (string | boolean)[];
  } = { count: values.length, types: [...types].sort() };

  if (numbers.length > 0) {
    const sorted = [...numbers].sort((a, b) => a - b);
    shape.range = {
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      median: median(sorted),
    };
  }
  if (childValues.size > 0) {
    const fields: Record<string, FieldShape> = {};
    for (const [k, v] of childValues) fields[k] = measureField(v, values.length);
    shape.fields = fields;
  }
  if (itemValues.length > 0) shape.items = measureField(itemValues, itemValues.length);
  /* A closed vocabulary only means something when it is genuinely small next to
   * the number of records carrying it. Fifty distinct strings over fifty records
   * is not a vocabulary, it is a name. */
  if (vocabulary.size > 0 && vocabulary.size <= Math.max(2, Math.floor(total / 2))) {
    shape.values = [...vocabulary].sort((a, b) => String(a).localeCompare(String(b)));
  }
  return shape;
}

function measureBlueprint(file: string, records: readonly JsonRecord[]): {
  file: string;
  records: number;
  fields: Record<string, FieldShape>;
} {
  const columns = new Map<string, JsonValue[]>();
  for (const record of records) {
    for (const [k, v] of Object.entries(record)) {
      const bucket = columns.get(k);
      if (bucket) bucket.push(v);
      else columns.set(k, [v]);
    }
  }
  const fields: Record<string, FieldShape> = {};
  for (const [name, values] of columns) fields[name] = measureField(values, records.length);
  return { file, records: records.length, fields };
}

/* ------------------------------------------------------------------ *
 * The field ops. Deterministic mechanics, so safe to own here.        *
 * ------------------------------------------------------------------ */

export class StubPatchError extends Error {}

function clone<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function setAtPath(record: JsonRecord, path: string, mutate: (current: unknown) => JsonValue): void {
  const segments = path.split(".");
  const last = segments.pop();
  if (last === undefined) throw new StubPatchError("an empty path addresses nothing");
  let at: JsonRecord | JsonValue[] = record;
  for (const seg of segments) {
    const isIndex = /^(?:0|[1-9][0-9]*)$/.test(seg);
    if (Array.isArray(at)) {
      if (!isIndex) throw new StubPatchError(`"${seg}" is not an index, and "${path}" walks an array`);
      const next: JsonValue | undefined = at[Number(seg)];
      if (next === undefined) throw new StubPatchError(`"${path}" has no element at ${seg}`);
      if (!isRecord(next) && !Array.isArray(next)) {
        throw new StubPatchError(`"${path}" walks through a value that is not a container`);
      }
      at = next;
      continue;
    }
    let next: JsonValue | undefined = at[seg];
    if (next === undefined) {
      next = isIndex ? [] : {};
      at[seg] = next;
    }
    if (!isRecord(next) && !Array.isArray(next)) {
      throw new StubPatchError(`"${path}" walks through a value that is not a container`);
    }
    at = next;
  }
  if (Array.isArray(at)) {
    if (!/^(?:0|[1-9][0-9]*)$/.test(last)) throw new StubPatchError(`"${last}" is not an index`);
    at[Number(last)] = mutate(at[Number(last)]);
    return;
  }
  at[last] = mutate(at[last]);
}

function applyOp(record: JsonRecord, op: FieldOp): void {
  switch (op.op) {
    case "set":
      setAtPath(record, op.path, () => clone(op.value));
      return;
    case "merge":
      setAtPath(record, op.path, (current) => {
        if (Array.isArray(current)) throw new StubPatchError(`merge cannot be applied to the array at "${op.path}"`);
        const base = isRecord(current) ? current : {};
        return { ...base, ...clone(op.value) };
      });
      return;
    case "add":
    case "mul":
      setAtPath(record, op.path, (current) => {
        if (current !== undefined && typeof current !== "number") {
          throw new StubPatchError(`"${op.path}" is not a number, so ${op.op} cannot be applied to it`);
        }
        const base = typeof current === "number" ? current : 0;
        return op.op === "add" ? base + op.value : base * op.value;
      });
      return;
    case "addFlag":
    case "removeFlag":
      setAtPath(record, op.path, (current) => {
        if (current !== undefined && !isStringArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list of flags`);
        }
        const base: string[] = current === undefined ? [] : [...current];
        if (op.op === "addFlag") return base.includes(op.flag) ? base : [...base, op.flag];
        return base.filter((f) => f !== op.flag);
      });
      return;
    case "append":
      setAtPath(record, op.path, (current) => {
        if (current !== undefined && !Array.isArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list, so append cannot be applied to it`);
        }
        const base: JsonValue[] = current === undefined ? [] : [...current];
        return [...base, ...clone(op.values)];
      });
      return;
    case "removeValue":
      setAtPath(record, op.path, (current) => {
        if (current !== undefined && !Array.isArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list, so removeValue cannot be applied to it`);
        }
        const base: JsonValue[] = current === undefined ? [] : [...current];
        const gone = JSON.stringify(op.value);
        return base.filter((entry) => JSON.stringify(entry) !== gone);
      });
      return;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * The three ops two mods can both apply to one field without either losing.
 *
 * The engine keeps this predicate module-private, so it is restated here rather
 * than imported. It is three names and it is pinned by a test, which is a
 * cheaper answer than a seam.
 */
export function isCommutative(op: FieldOp["op"]): boolean {
  return op === "addFlag" || op === "removeFlag" || op === "append";
}

export function applyFieldPatch(record: JsonRecord, ops: FieldPatch): JsonRecord {
  const out = clone(record);
  for (const op of ops) applyOp(out, op);
  return out;
}

export function touchedFields(ops: FieldPatch): Set<string> {
  const out = new Set<string>();
  for (const op of ops) out.add(op.path);
  return out;
}

export function composeFieldPatches(
  base: JsonRecord,
  patches: ReadonlyArray<{ owner: string; ops: FieldPatch }>,
): ComposedPatch {
  let value = clone(base);
  const writers = new Map<string, string[]>();
  for (const { owner, ops } of patches) {
    for (const op of ops) {
      if (isCommutative(op.op)) continue;
      const seen = writers.get(op.path);
      if (seen) {
        if (!seen.includes(owner)) seen.push(owner);
      } else writers.set(op.path, [owner]);
    }
    value = applyFieldPatch(value, ops);
  }
  const conflicts = [...writers.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([path, owners]) => ({ path, owners }));
  return { value, conflicts };
}

/* ------------------------------------------------------------------ *
 * Record identity                                                     *
 * ------------------------------------------------------------------ */

export function keySpecFor(file: string): RecordKeySpec {
  return KEY_SPECS[file] ?? { kind: "fields", paths: ["name"] };
}

export function keyDescription(file: string): string {
  const spec = keySpecFor(file);
  if (spec.kind === "singleton") return `the whole file (${file} is one record)`;
  const quoted = spec.paths.map((p) => `"${p}"`).join(" and ");
  return spec.paths.length === 1 ? `its ${quoted}` : `its ${quoted}, joined by "--"`;
}

export function recordKey(file: string, record: unknown, spec: RecordKeySpec = keySpecFor(file)): string | null {
  if (spec.kind === "singleton") return slugify(file);
  const parts: string[] = [];
  for (const path of spec.paths) {
    const value = atPath(record, path);
    if (typeof value !== "string" && typeof value !== "number") return null;
    const slug = keySlug(String(value));
    if (slug === "") return null;
    parts.push(slug);
  }
  return parts.join("--");
}

export function recordRefKeys(file: string, record: unknown, spec: RecordKeySpec = keySpecFor(file)): readonly string[] {
  const base = recordKey(file, record, spec);
  if (base === null) return [];
  if (spec.kind === "singleton" || spec.discriminator === undefined) return [base];
  const parts: string[] = [];
  for (const path of spec.discriminator) {
    const value = atPath(record, path);
    if (typeof value === "string" || typeof value === "number") parts.push(keySlug(String(value)));
  }
  if (parts.length === 0) return [base];
  return [base, `${base}#${parts.join("--")}`];
}

/* ------------------------------------------------------------------ *
 * The stub's own emitter and project                                  *
 * ------------------------------------------------------------------ */

class StubProject implements ProjectLike {
  readonly id: string;
  private readonly base: PackManifest;
  private readonly fields: FieldDecl[] = [];
  private readonly files = new Map<string, FileContribution>();

  constructor(manifest: unknown) {
    const m = validateManifest(manifest);
    this.base = m;
    this.id = m.id;
    for (const decl of m.fields ?? []) this.fields.push(decl);
  }

  private file(name: string): FileContribution {
    const found = this.files.get(name);
    if (found) return found;
    const made: FileContribution = {};
    this.files.set(name, made);
    return made;
  }

  declareField(field: FieldDecl): ProjectLike {
    if (!this.fields.some((f) => f.name === field.name)) this.fields.push(field);
    return this;
  }

  qualify(name: string): string {
    return `${this.id}:${name}`;
  }

  add(file: string, ...records: JsonRecord[]): ProjectLike {
    const target = this.file(file);
    target.records = [...(target.records ?? []), ...records.map((r) => clone(r))];
    return this;
  }

  patchFields(file: string, ref: string, ops: readonly FieldOp[]): ProjectLike {
    const target = this.file(file);
    const table = target.fieldPatches ?? {};
    table[ref] = [...(table[ref] ?? []), ...ops.map((op) => clone(op) as FieldOp)];
    target.fieldPatches = table;
    return this;
  }

  replace(file: string, ref: string, record: JsonRecord): ProjectLike {
    const target = this.file(file);
    const table = target.replaces ?? {};
    table[ref] = clone(record);
    target.replaces = table;
    return this;
  }

  remove(file: string, ref: string): ProjectLike {
    const target = this.file(file);
    const list = target.removes ?? [];
    if (!list.includes(ref)) list.push(ref);
    target.removes = list;
    return this;
  }

  manifest(): PackManifest {
    const out: PackManifest = { ...this.base };
    if (this.fields.length > 0) out.fields = [...this.fields];
    else delete out.fields;
    return out;
  }

  toPack(): LoadedPack {
    const files: Record<string, FileContribution> = {};
    for (const [name, contribution] of this.files) files[name] = clone(contribution as unknown as JsonRecord) as unknown as FileContribution;
    return { manifest: this.manifest(), files };
  }

  emit(): EmittedFile[] {
    const out: EmittedFile[] = [{ path: "manifest.json", contents: `${JSON.stringify(this.manifest(), null, 2)}\n` }];
    for (const name of [...this.files.keys()].sort()) {
      const contribution = this.files.get(name);
      if (!contribution) continue;
      out.push({ path: `${name}.json`, contents: `${JSON.stringify(contribution, null, 2)}\n` });
    }
    return out;
  }

  build(core?: LoadedPack): ProjectBuild {
    const manifest = this.manifest();
    const files = this.emit();
    const findings: AuthoringFinding[] = [];
    const problems: string[] = [];

    /* Compose onto the base the same way round the engine does: the base's
     * records first, then this project's additions and patches. */
    const composed: Record<string, JsonRecord[]> = {};
    for (const [file, contribution] of Object.entries(core?.files ?? {})) {
      composed[file] = [...(contribution.records ?? []).map((r) => clone(r))];
    }
    const mine: Record<string, JsonRecord[]> = {};
    for (const [file, contribution] of this.files) {
      const into = composed[file] ?? [];
      const added: JsonRecord[] = [];
      for (const record of contribution.records ?? []) {
        const copy = clone(record);
        into.push(copy);
        added.push(copy);
      }
      for (const [ref, ops] of Object.entries(contribution.fieldPatches ?? {})) {
        const key = ref.includes(":") ? (ref.split(":")[1] ?? ref) : ref;
        const index = into.findIndex((r) => recordKey(file, r) === key);
        if (index < 0) {
          problems.push(`${manifest.id}: fieldPatches names "${ref}" in ${file}, and no loaded pack defines it.`);
          continue;
        }
        const before = into[index];
        if (!before) continue;
        try {
          const after = applyFieldPatch(before, ops);
          into[index] = after;
          added.push(after);
        } catch (e) {
          problems.push(`${manifest.id}: a patch to "${ref}" in ${file} could not be applied: ${String(e)}`);
        }
      }
      for (const ref of contribution.removes ?? []) {
        const key = ref.includes(":") ? (ref.split(":")[1] ?? ref) : ref;
        const index = into.findIndex((r) => recordKey(file, r) === key);
        if (index < 0) problems.push(`${manifest.id}: removes names "${ref}" in ${file}, and no loaded pack defines it.`);
        else into.splice(index, 1);
      }
      composed[file] = into;
      mine[file] = added;
    }

    findings.push(...checkRecords(mine, composed));
    if (core === undefined) {
      findings.unshift({
        level: "hint",
        file: "manifest",
        record: manifest.id,
        message:
          "This was checked without the game's own records, so nothing here could look for a reference that does not resolve.",
        rule: "project/no-core",
      });
    }
    return {
      manifest,
      files,
      findings,
      problems,
      composed,
      ok: !findings.some((f) => f.level === "error"),
    };
  }
}

export function validateManifest(value: unknown): PackManifest {
  if (!isRecord(value)) throw new Error("a manifest has to be an object");
  const id = value["id"];
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new Error('"id" has to be lower case, start with a letter, and use only letters, digits and hyphens');
  }
  const name = value["name"];
  if (typeof name !== "string" || name.trim() === "") throw new Error('"name" cannot be empty');
  const version = value["version"];
  if (typeof version !== "string" || !VERSION_RE.test(version)) {
    throw new Error('"version" has to look like 1.0.0');
  }
  const shape = value["shape"];
  if (shape !== "content" && shape !== "tiles" && shape !== "plugin") {
    throw new Error('"shape" has to be one of content, tiles or plugin');
  }
  const group = value["group"];
  if (group !== undefined && (typeof group !== "string" || !PACK_GROUP_NAMES.includes(group))) {
    throw new Error(`"group" has to be one of ${PACK_GROUP_NAMES.join(", ")}`);
  }
  return value as unknown as PackManifest;
}

/* ------------------------------------------------------------------ *
 * The measured half, over the fixture                                 *
 * ------------------------------------------------------------------ */

const BLUEPRINTS: Record<string, { file: string; records: number; fields: Record<string, FieldShape> }> = {};
for (const [file, records] of Object.entries(STUB_RECORDS)) {
  BLUEPRINTS[file] = measureBlueprint(file, records);
}

const DESCRIPTIONS: Readonly<Record<string, string>> = {
  monster: "Creatures. One record is one kind of thing that can be met, from a rat to a Balrog.",
  monster_base: "The families creatures belong to. A creature names one, and inherits its letter and its feel.",
  object: "Items. Weapons, armour, potions, scrolls, wands: everything that can be picked up.",
  store: "Shops. What each one stocks, who runs it, and how much they carry.",
};

function blueprintFor(file: string): { file: string; records: number; fields: Record<string, FieldShape> } | undefined {
  return BLUEPRINTS[file];
}

function requiredFields(file: string): readonly string[] {
  const bp = blueprintFor(file);
  if (!bp) return [];
  return Object.entries(bp.fields)
    .filter(([, shape]) => shape.count === bp.records)
    .map(([name]) => name)
    .sort();
}

function fieldUsage(file: string): readonly FieldUsage[] {
  const bp = blueprintFor(file);
  if (!bp || bp.records === 0) return [];
  return Object.entries(bp.fields)
    .map(([name, shape]) => ({ name, shape, share: shape.count / bp.records }))
    .sort((a, b) => b.share - a.share || a.name.localeCompare(b.name));
}

function placeholder(shape: FieldShape): JsonValue {
  if (shape.range) return shape.range.median;
  const first = shape.types[0] ?? "any";
  switch (first) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const out: JsonRecord = {};
      for (const [k, child] of Object.entries(shape.fields ?? {})) out[k] = placeholder(child);
      return out;
    }
    default:
      return shape.values && shape.values.length > 0 ? String(shape.values[0]) : "";
  }
}

function templateRecord(file: string, scope: TemplateScope = "common"): JsonRecord {
  const bp = blueprintFor(file);
  if (!bp) return {};
  const out: JsonRecord = {};
  for (const [name, shape] of Object.entries(bp.fields)) {
    const share = bp.records === 0 ? 0 : shape.count / bp.records;
    const keep = scope === "all" || (scope === "common" ? share >= COMMON_SHARE : share >= 1);
    if (keep) out[name] = placeholder(shape);
  }
  return out;
}

function peersFor(file: string, draft: JsonRecord, records: ComposedRecords = STUB_RECORDS): PeerSet {
  const all = records[file] ?? [];
  const peerField = PEER_FIELD[file];
  const depthField = DEPTH_FIELD[file];
  const wanted = peerField === undefined ? undefined : atPath(draft, peerField);
  const depth = depthField === undefined ? undefined : draft[depthField];

  let peers = [...all];
  const clauses: string[] = [];
  if (peerField !== undefined && (typeof wanted === "string" || typeof wanted === "number")) {
    peers = peers.filter((r) => atPath(r, peerField) === wanted);
    clauses.push(`${peerField} is ${JSON.stringify(wanted)}`);
  }
  if (depthField !== undefined && typeof depth === "number") {
    peers = peers.filter((r) => {
      const theirs = r[depthField];
      return typeof theirs === "number" && Math.abs(theirs - depth) <= PEER_WINDOW;
    });
    peers.sort((a, b) => {
      const da = typeof a[depthField] === "number" ? Math.abs((a[depthField] as number) - depth) : 999;
      const db = typeof b[depthField] === "number" ? Math.abs((b[depthField] as number) - depth) : 999;
      return da - db;
    });
    clauses.push(`${depthField} is within ${PEER_WINDOW} of ${depth}`);
  }
  const because =
    clauses.length === 0
      ? `every record in ${file}`
      : `${peers.length} record${peers.length === 1 ? "" : "s"} in ${file} where ${clauses.join(" and ")}`;
  return { peers, because };
}

function suggestFields(file: string, draft: JsonRecord, records: ComposedRecords = STUB_RECORDS): Suggestion[] {
  const bp = blueprintFor(file);
  if (!bp) return [];
  const { peers, because } = peersFor(file, draft, records);
  const pool = peers.length > 0 ? peers : (records[file] ?? []);
  const out: Suggestion[] = [];
  for (const [name, shape] of Object.entries(bp.fields)) {
    if (name in draft) continue;
    if (!shape.range) continue;
    const seen = pool
      .map((r) => r[name])
      .filter((v): v is number => typeof v === "number")
      .sort((a, b) => a - b);
    if (seen.length === 0) continue;
    const value = median(seen);
    const same = seen.every((v) => v === value);
    out.push({
      field: name,
      value,
      because: same
        ? `every one of ${because} has ${name} ${value}`
        : `${value} is the middle of ${name} across ${because}, which run from ${seen[0]} to ${seen[seen.length - 1]}`,
    });
  }
  return out.sort((a, b) => a.field.localeCompare(b.field));
}

function draftRecord(
  file: string,
  values: JsonRecord = {},
  records: ComposedRecords = STUB_RECORDS,
  scope: TemplateScope = "common",
): DraftedRecord {
  const record = templateRecord(file, scope);
  const { peers } = peersFor(file, values, records);
  const model = peers[0];
  let modelledOn: string | undefined;
  if (model) {
    const label = model["name"];
    if (typeof label === "string") modelledOn = label;
    for (const [k, v] of Object.entries(model)) {
      if (MODEL_EXCLUDE.has(k)) continue;
      record[k] = clone(v);
    }
  }
  record["name"] = "";
  for (const suggestion of suggestFields(file, values, records)) {
    if (!(suggestion.field in values)) record[suggestion.field] = suggestion.value;
  }
  Object.assign(record, clone(values as JsonValue) as JsonRecord);
  const drafted: {
    record: JsonRecord;
    suggestions: readonly Suggestion[];
    findings: readonly AuthoringFinding[];
    modelledOn?: string;
  } = {
    record,
    suggestions: suggestFields(file, record, records),
    findings: checkRecords({ [file]: [record] }, records),
  };
  if (modelledOn !== undefined) drafted.modelledOn = modelledOn;
  return drafted;
}

const LEVEL_ORDER: Readonly<Record<string, number>> = { error: 0, warn: 1, hint: 2 };

/**
 * The small honest subset. Four rules, plus the one that says it is a subset.
 */
function checkRecords(subject: ComposedRecords, all: ComposedRecords, options: CheckOptions = {}): AuthoringFinding[] {
  const out: AuthoringFinding[] = [
    {
      level: "hint",
      file: "-",
      record: "-",
      message:
        "These checks are the workshop's own small set, not the game's. The game's checker is not reachable on this engine, so a clean report here is not a promise that the game will accept the mod.",
      rule: "stub/not-the-real-checker",
    },
  ];

  for (const [file, records] of Object.entries(subject)) {
    const bp = blueprintFor(file);
    const known = bp ? Object.keys(bp.fields) : [];
    const expected = requiredFields(file);
    const seenKeys = new Map<string, number>();
    for (const record of all[file] ?? []) {
      const key = recordKey(file, record);
      if (key !== null) seenKeys.set(key, (seenKeys.get(key) ?? 0) + 1);
    }

    for (const record of records) {
      const label = typeof record["name"] === "string" && record["name"] !== "" ? record["name"] : "(unnamed record)";

      for (const field of expected) {
        if (!(field in record)) {
          out.push({
            level: "warn",
            file,
            record: label,
            field,
            message: `${label} in ${file} has no "${field}", and every record in ${file} has one.`,
            rule: "field/required",
          });
        }
      }

      if (known.length > 0) {
        for (const field of Object.keys(record)) {
          if (known.includes(field)) continue;
          if (field.includes(":")) continue;
          const nearest = known
            .map((candidate) => ({ candidate, distance: editDistance(field, candidate) }))
            .sort((a, b) => a.distance - b.distance)[0];
          const hint =
            nearest && nearest.distance <= Math.max(1, Math.floor(field.length / 3))
              ? ` Did you mean "${nearest.candidate}"?`
              : "";
          out.push({
            level: "warn",
            file,
            record: label,
            field,
            message: `${label} in ${file} carries "${field}", which nothing in ${file} uses.${hint}`,
            rule: "field/unknown",
          });
        }
      }

      const key = recordKey(file, record);
      if (key === null) {
        out.push({
          level: "error",
          file,
          record: label,
          message: `${label} in ${file} has no identity: ${file} takes it from ${keyDescription(file)}.`,
          rule: "record/unaddressable",
        });
      } else if ((seenKeys.get(key) ?? 0) > 1) {
        out.push({
          level: "error",
          file,
          record: label,
          message: `Two records in ${file} both come out as "${key}", so neither can be addressed. ${file} takes an identity from ${keyDescription(file)}.`,
          rule: "record/ambiguous",
        });
      }

      if (file === "monster" && typeof record["depth"] !== "number") {
        out.push({
          level: "warn",
          file,
          record: label,
          field: "depth",
          message: `${label} has no depth, so nothing will ever generate it. It will exist and never be met.`,
          rule: "monster/no-depth",
        });
      }
      if (file === "monster" && typeof record["base"] === "string") {
        const bases = all["monster_base"] ?? [];
        if (!bases.some((b) => b["name"] === record["base"])) {
          out.push({
            level: "error",
            file,
            record: label,
            field: "base",
            message: `base names "${String(record["base"])}", and no loaded pack defines it in monster_base.`,
            rule: "reference/dangling",
          });
        }
      }
    }
  }

  const floor = LEVEL_ORDER[options.minLevel ?? "hint"] ?? 2;
  return out
    .filter((f) => (LEVEL_ORDER[f.level] ?? 2) <= floor)
    .sort((a, b) => (LEVEL_ORDER[a.level] ?? 2) - (LEVEL_ORDER[b.level] ?? 2));
}

function provenanceOf(record: unknown): RecordProvenance | undefined {
  if (!isRecord(record)) return undefined;
  const from = record["$from"];
  if (isRecord(from) && typeof from["owner"] === "string") return { owner: from["owner"] };
  return undefined;
}

function satisfies(version: string, range: string): boolean {
  /* Enough of a semver range for the one thing the workshop asks: is the running
   * engine inside the range an emitted mod would declare. Only the ">=x.y.z"
   * form and "*", because those are the only two the workshop ever writes. */
  if (range.trim() === "*" || range.trim() === "") return true;
  const m = /^>=\s*(\d+)\.(\d+)\.(\d+)/.exec(range.trim());
  if (!m) return true;
  const v = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!v) return false;
  for (let i = 1; i <= 3; i++) {
    const have = Number(v[i] ?? 0);
    const need = Number(m[i] ?? 0);
    if (have > need) return true;
    if (have < need) return false;
  }
  return true;
}

/** The stub, as one object satisfying the interface the workshop consumes. */
export const STUB_AUTHORING: AuthoringApi = {
  BLUEPRINT_FILES: Object.keys(BLUEPRINTS).sort(),
  RECORD_BLUEPRINTS: BLUEPRINTS,
  blueprintFor,
  requiredFields,
  fieldUsage,
  describeFile: (file) => DESCRIPTIONS[file] ?? `Records in ${file}.json.`,
  templateRecord,
  peersFor,
  suggestFields,
  draftRecord,
  checkRecords,
  recordKey: (file, record) => recordKey(file, record),
  recordRefKeys: (file, record) => recordRefKeys(file, record),
  keySpecFor,
  keyDescription,
  applyFieldPatch,
  composeFieldPatches,
  touchedFields,
  modProject: (manifest) => new StubProject(manifest),
  validateManifest,
  PACK_GROUPS: PACK_GROUP_NAMES,
  slugify,
  provenanceOf,
  satisfies,
};
