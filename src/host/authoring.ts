/**
 * The authoring surface this mod uses, named symbol by symbol.
 *
 * `ctx.authoring` hands over the mod SDK's whole public barrel, the same way
 * `ctx.core` hands over the engine's. That is the right shape for the ENGINE to
 * offer, because a curated list on the engine's side is a second list to keep in
 * step and the first thing that happens to one is that it lags the function
 * somebody needs.
 *
 * It is the wrong shape for a MOD to consume. So this file is the narrow half of
 * that bargain: an interface naming exactly what the workshop calls, which makes
 * the mod's dependency on the SDK measurable rather than "whatever that package
 * happens to export". Two things fall out of it for free. A stub can implement
 * it, which is what makes every screen renderable on an engine that has no seam
 * yet. And when the SDK grows, nothing here changes until this file changes.
 *
 * The signatures are the SDK's own, transcribed. Where a name differs from the
 * obvious guess the comment says so, because a wrong guess here compiles against
 * the stub and fails against the real thing.
 */

/* ------------------------------------------------------------------ *
 * The data shapes                                                     *
 * ------------------------------------------------------------------ */

/** One JSON value, as a record file carries it. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** One record, as a record file carries it. */
export type JsonRecord = { [key: string]: JsonValue };

/**
 * Records keyed by pack-file STEM with no extension: "monster", "object",
 * "store". Every `records` parameter in the SDK is this shape.
 */
export type ComposedRecords = Readonly<Record<string, readonly JsonRecord[]>>;

/** The SDK's field type vocabulary. */
export type FieldType = "string" | "number" | "boolean" | "object" | "array" | "any";

/**
 * What a field looks like across every core record in one file, MEASURED.
 *
 * `count === blueprint.records` is what "every record has it" means, and it is
 * the only sense in which a field is required by this data - see `requiredFields`.
 */
export interface FieldShape {
  readonly count: number;
  readonly types: readonly FieldType[];
  readonly range?: { readonly min: number; readonly max: number; readonly median: number };
  readonly fields?: Readonly<Record<string, FieldShape>>;
  readonly items?: FieldShape;
  /** Advisory closed vocabulary, where the data has one. */
  readonly values?: readonly (string | boolean)[];
}

/** One record file, measured. */
export interface RecordBlueprint {
  readonly file: string;
  readonly records: number;
  readonly fields: Readonly<Record<string, FieldShape>>;
}

/** How much of a template to fill in. "common" means a share of at least 0.5. */
export type TemplateScope = "required" | "common" | "all";

/** How much a field is used across one file's core records. */
export interface FieldUsage {
  readonly name: string;
  readonly shape: FieldShape;
  /** 0 to 1. */
  readonly share: number;
}

/** The comparable records, and the sentence saying why they are comparable. */
export interface PeerSet {
  readonly peers: readonly JsonRecord[];
  readonly because: string;
}

/** A value, and the evidence for it. `because` is the whole point. */
export interface Suggestion {
  readonly field: string;
  readonly value: JsonValue;
  readonly because: string;
}

export type FindingLevel = "error" | "warn" | "hint";

/**
 * One thing wrong, or worth knowing, about a record.
 *
 * The SDK calls this `AuthoringFinding`. It also exports an unrelated `Finding`
 * from its mod-standards checker, which is a different shape; using the short
 * name here would be the kind of mistake that typechecks.
 */
export interface AuthoringFinding {
  readonly level: FindingLevel;
  readonly file: string;
  readonly record: string;
  readonly field?: string;
  readonly message: string;
  /** Stable rule id, e.g. "field/required", "monster/no-depth". */
  readonly rule: string;
}

export interface CheckOptions {
  readonly minLevel?: FindingLevel;
}

/** What one call to `draftRecord` produced. */
export interface DraftedRecord {
  readonly record: JsonRecord;
  readonly suggestions: readonly Suggestion[];
  readonly findings: readonly AuthoringFinding[];
  /** The core record the shape was taken from, when there was one. */
  readonly modelledOn?: string;
}

/**
 * The eight field ops.
 *
 * Note the property-name asymmetry, which is the SDK's and not a transcription
 * slip: `flag` is a single string, `values` is an array, `value` is everything
 * else. The workshop never asks the player to choose an op by name; it infers
 * one from the gesture. See `src/model/ops.ts`.
 */
export type FieldOp =
  | { op: "set"; path: string; value: JsonValue }
  | { op: "merge"; path: string; value: JsonRecord }
  | { op: "addFlag"; path: string; flag: string }
  | { op: "removeFlag"; path: string; flag: string }
  | { op: "add"; path: string; value: number }
  | { op: "mul"; path: string; value: number }
  | { op: "append"; path: string; values: JsonValue[] }
  | { op: "removeValue"; path: string; value: JsonValue };

export type FieldPatch = FieldOp[];

export interface FieldConflict {
  path: string;
  owners: string[];
}

export interface ComposedPatch {
  value: JsonRecord;
  conflicts: FieldConflict[];
}

/** One contribution to one record file. */
export interface FileContribution {
  records?: JsonRecord[];
  patches?: Record<string, JsonRecord>;
  replaces?: Record<string, JsonRecord>;
  removes?: string[];
  fieldPatches?: Record<string, FieldPatch>;
  sections?: Record<string, FileContribution>;
}

export type SectionBand = "first" | "early" | "normal" | "late" | "last";

export interface PackSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly default?: boolean;
  readonly priority?: SectionBand;
  readonly flag?: string;
}

/** A pack, loaded: its manifest and its per-file contributions. */
export interface LoadedPack {
  manifest: PackManifest;
  files: Record<string, FileContribution>;
}

/** A field a mod coins, in its own namespace. `files` is required and non-empty. */
export interface FieldDecl {
  /** BARE - no colon. `qualify` adds the mod id. */
  name: string;
  files: string[];
  type?: FieldType;
  label?: string;
  desc?: string;
}

export interface PackRule {
  flag: string;
  title: string;
  description: string;
  default: boolean;
}

/** The manifest, narrowed to the fields the workshop writes or reads. */
export interface PackManifest {
  id: string;
  name: string;
  version: string;
  shape: "content" | "tiles" | "plugin";
  facets?: readonly ("content" | "tiles" | "plugin")[];
  engine?: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  capabilities?: string[];
  fields?: FieldDecl[];
  modApi?: number;
  rules?: PackRule[];
  group?: string;
  affectsGameplay?: boolean;
  description?: string;
  author?: string;
  license?: string;
  repository?: string;
  sections?: PackSection[];
}

/**
 * One file the project will write.
 *
 * `contents` is a `string` for every file the composer itself produces - the
 * manifest and every record file are JSON text, and stay that way. It is
 * `Uint8Array` for a hand-carried file whose bytes are not text at all: a tile
 * pack, a font, a sound. Neither the composer nor the zip writer cares which
 * one a given entry is; both read the string branch as UTF-8 text and the
 * `Uint8Array` branch as the exact bytes to write, with no conversion between
 * the two in either direction. See `docs/ENGINE_SEAMS.md`, "Binary emit."
 */
export interface EmittedFile {
  readonly path: string;
  readonly contents: string | Uint8Array;
}

/** The verdict on a whole project. `ok` is false if any finding is an error. */
export interface ProjectBuild {
  readonly manifest: PackManifest;
  readonly files: readonly EmittedFile[];
  readonly findings: readonly AuthoringFinding[];
  readonly problems: readonly string[];
  readonly composed?: Readonly<Record<string, readonly unknown[]>>;
  readonly ok: boolean;
}

/** The builder object the SDK hands back. Its methods chain. */
export interface ProjectLike {
  readonly id: string;
  declareField(field: FieldDecl): ProjectLike;
  qualify(name: string): string;
  add(file: string, ...records: JsonRecord[]): ProjectLike;
  patchFields(file: string, ref: string, ops: readonly FieldOp[]): ProjectLike;
  replace(file: string, ref: string, record: JsonRecord): ProjectLike;
  remove(file: string, ref: string): ProjectLike;
  /** Select a declared section for subsequent contributions, when supported. */
  section?(id: string): ProjectLike;
  manifest(): PackManifest;
  toPack(): LoadedPack;
  emit(): EmittedFile[];
  build(core?: LoadedPack): ProjectBuild;
}

/**
 * Who owns a composed record, and who has touched it since.
 *
 * `owner` is the pack that ADDED it, so a record with no provenance at all came
 * from core. `modifiedBy` is every pack that patched it, in load order, and is
 * absent when none did - which is why `owner` alone is the common shape.
 */
export interface RecordProvenance {
  readonly owner: string;
  readonly modifiedBy?: readonly string[];
}

/** How one record file derives a record's identity. */
export type RecordKeySpec =
  | { readonly kind: "fields"; readonly paths: readonly string[]; readonly discriminator?: readonly string[] }
  | { readonly kind: "singleton" };

/* ------------------------------------------------------------------ *
 * The surface                                                         *
 * ------------------------------------------------------------------ */

/**
 * Everything the workshop calls. Implemented twice: once by the real SDK handed
 * in on `ctx.authoring`, once by `authoring-stub.ts`.
 */
export interface AuthoringApi {
  /* Blueprints: what a record file is made of, measured over core's records. */
  readonly BLUEPRINT_FILES: readonly string[];
  readonly RECORD_BLUEPRINTS: Readonly<Record<string, RecordBlueprint>>;
  blueprintFor(file: string): RecordBlueprint | undefined;
  requiredFields(file: string): readonly string[];
  fieldUsage(file: string): readonly FieldUsage[];
  describeFile(file: string): string;

  /* Drafting: fill a record with typical values, and say why each one. */
  templateRecord(file: string, scope?: TemplateScope): JsonRecord;
  peersFor(file: string, draft: JsonRecord, records?: ComposedRecords): PeerSet;
  suggestFields(file: string, draft: JsonRecord, records?: ComposedRecords): Suggestion[];
  draftRecord(file: string, values?: JsonRecord, records?: ComposedRecords, scope?: TemplateScope): DraftedRecord;

  /* Validation: the same checker the running game runs. */
  checkRecords(subject: ComposedRecords, all: ComposedRecords, options?: CheckOptions): AuthoringFinding[];

  /* Identity: the ref every later patch and every compatibility claim names. */
  recordKey(file: string, record: unknown): string | null;
  recordRefKeys(file: string, record: unknown): readonly string[];
  keySpecFor(file: string): RecordKeySpec;
  keyDescription(file: string): string;

  /* Patching: previewing an op, and finding a same-field collision. */
  applyFieldPatch(record: JsonRecord, ops: FieldPatch): JsonRecord;
  composeFieldPatches(base: JsonRecord, patches: ReadonlyArray<{ owner: string; ops: FieldPatch }>): ComposedPatch;
  touchedFields(ops: FieldPatch): Set<string>;

  /* The project: assemble, validate, emit. */
  modProject(manifest: unknown): ProjectLike;

  /* The manifest's own rules, checked as the player types rather than at install. */
  validateManifest(value: unknown): PackManifest;
  readonly PACK_GROUPS: readonly string[];
  slugify(name: string): string;

  /* Provenance: which pack owns a composed record. Absent means core's. */
  provenanceOf(record: unknown): RecordProvenance | undefined;

  /* Semver, for the engine range the emitted mod declares. */
  satisfies(version: string, range: string): boolean;
}

/**
 * The narrowing the host applies before handing the barrel over.
 *
 * Written as a type rather than a function so nothing here has to run: the real
 * `ctx.authoring` IS the SDK barrel, which is structurally a superset of
 * `AuthoringApi`, so the assignment is checked by the compiler and costs nothing
 * at runtime.
 *
 */
export type AuthoringSource = AuthoringApi;
