/**
 * Manifest documents, and the mod API a draft's script is written for.
 *
 * A mod folder's `manifest.json` comes in three shapes: a bare schema 1 object,
 * a schema 1 document and a schema 2 document (`{ format, schemaVersion, data }`).
 * The game's SDK writes schema 2 and reads all three. The workshop keeps its
 * drafts in the in-memory field names (`engine` as a range string, `dependencies`
 * as a map of ranges), so `manifestFields` reads any of the three into those
 * names and `manifestDocument` writes them back out as schema 2.
 *
 * The API a script targets is read from the script itself, from the `api` member
 * of its default export, so the manifest's `api` range and the code's own `api`
 * cannot disagree.
 */

import type { JsonRecord, JsonValue, PackManifest } from "../host/authoring.js";

/** The manifest document's format tag. */
export const MANIFEST_FORMAT = "neo-angband/mod/manifest";

/** The API range of a plugin whose default export says `api: 1`, which this game loads in process. */
export const API1_RANGE = ">=1.0.0 <2.0.0";

/** The API range an API 2 definition declares, in its code and in its manifest. */
export const API2_RANGE = ">=2.0.0 <3.0.0";

/** Why a draft needs its engine range, as written into `engine.because`. */
export const ENGINE_BECAUSE =
  "Made in ModForge on this version of the game. Older versions have not been tried.";

/** Which mod API a script is written for. */
export interface ScriptApi {
  /** The manifest's `api` range. */
  readonly range: string;
  /** True for an API 1 plugin, which also declares the schema 1 `modApi` number. */
  readonly api1: boolean;
}

/**
 * Read the `api` member of a script's default export.
 *
 * A quoted value is an API range (API 2 and later). `api: 1`, or no `api` the
 * pattern can find, is an API 1 plugin: the template the workshop starts a
 * script from declares it, and the game refuses a script with no `api` either
 * way.
 */
export function scriptApi(source: string | undefined): ScriptApi {
  const quoted = source === undefined ? null : /\bapi\s*:\s*(["'`])([^"'`\n]+)\1/u.exec(source);
  const range = quoted?.[2]?.trim();
  if (range === undefined || range === "") return { range: API1_RANGE, api1: true };
  return { range, api1: range === API1_RANGE };
}

/** True when `api` names only API 2 or later, which today's folder loader refuses to run in process. */
export function isApi2Range(range: string): boolean {
  return /^>=\s*2\./u.test(range.trim());
}

type Fields = Record<string, JsonValue>;

const isObject = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The manifest's fields under their in-memory names, from any supported shape.
 *
 * A schema 2 document is mapped field by field: `engine.range` and
 * `engine.because` become `engine` and `engineBecause`, `dependencies.required`
 * and `.optional` become `dependencies` and `optionalDependencies` with their
 * reasons in `dependencyReasons`, and a `conflicts` entry becomes a `compat`
 * claim. Every other field keeps its name. Whether the result is a valid
 * manifest is the SDK's question, asked when the draft is emitted.
 */
export function manifestFields(raw: JsonRecord): { ok: true; fields: Fields } | { ok: false; why: string } {
  if (raw["format"] !== MANIFEST_FORMAT) return { ok: true, fields: { ...raw } };
  const data = raw["data"];
  if (!isObject(data)) return { ok: false, why: `The manifest document has no "data" object.` };
  if (raw["schemaVersion"] === 1) return { ok: true, fields: { ...data } };
  if (raw["schemaVersion"] !== 2) {
    return {
      ok: false,
      why: `The manifest document says schemaVersion ${JSON.stringify(raw["schemaVersion"] ?? null)}. This workshop reads schema 1 and schema 2.`,
    };
  }

  const { engine, dependencies, ...rest } = data;
  const out: Fields = { ...rest };
  if (typeof engine === "string") out["engine"] = engine;
  else if (isObject(engine)) {
    if (typeof engine["range"] === "string") out["engine"] = engine["range"];
    if (typeof engine["because"] === "string") out["engineBecause"] = engine["because"];
  }
  if (isObject(dependencies)) {
    const reasons: Fields = {};
    const ranges = (map: JsonValue | undefined): Fields | undefined => {
      if (!isObject(map)) return undefined;
      const out: Fields = {};
      for (const [id, dep] of Object.entries(map)) {
        if (!isObject(dep)) continue;
        out[id] = typeof dep["range"] === "string" ? dep["range"] : "*";
        if (typeof dep["because"] === "string") reasons[id] = dep["because"];
      }
      return out;
    };
    const required = ranges(dependencies["required"]);
    const optional = ranges(dependencies["optional"]);
    if (required !== undefined) out["dependencies"] = required;
    if (optional !== undefined) out["optionalDependencies"] = optional;
    if (Object.keys(reasons).length > 0) out["dependencyReasons"] = reasons;
    const conflicts = dependencies["conflicts"];
    if (isObject(conflicts)) {
      const claims: JsonValue[] = Array.isArray(out["compat"]) ? [...out["compat"]] : [];
      for (const [id, conflict] of Object.entries(conflicts)) {
        if (!isObject(conflict)) continue;
        claims.push({ with: id, claim: "conflicts", ...conflict });
      }
      if (claims.length > 0) out["compat"] = claims;
    }
  }
  return { ok: true, fields: out };
}

/**
 * The fields schema 2 keeps under their own names, in the SDK's order. A key
 * outside this list and the ones `manifestDocument` maps is left out, as the
 * SDK's writer leaves it out.
 */
const KEPT_FIELDS = [
  "description", "author", "license", "repository", "payload", "shape", "facets",
  "loadAfter", "loadBefore", "group", "saveSchema", "fields", "rules", "settings",
  "publicFlags", "renamedRuleFlags", "sections", "tilePacks", "resources",
  "restoredItemArt", "restoredMonsterArt", "restoredFlavorArt", "nondeterministic",
  "affectsGameplay", "capabilities",
] as const;

/**
 * The schema 2 document for an in-memory manifest, for an emitter that has no
 * SDK to call: the demonstration authoring library uses it. The game's own
 * emitter is the SDK's `manifestToV2`, which this follows for every field the
 * workshop writes.
 */
export function manifestDocument(manifest: PackManifest): JsonRecord {
  const m = manifest as unknown as Fields;
  const code = manifest.shape === "plugin" || (manifest.facets ?? []).includes("plugin");
  const runtime = manifest.runtime ?? (code ? "in-process" : "data");
  const api = manifest.api ?? (code ? (manifest.modApi === 1 ? API1_RANGE : "") : "*");
  const data: Fields = { id: manifest.id, name: manifest.name, version: manifest.version, api, runtime };
  if (manifest.engine !== undefined) {
    data["engine"] = { range: manifest.engine, because: manifest.engineBecause ?? ENGINE_BECAUSE };
  }
  const reasons = (m["dependencyReasons"] ?? {}) as Fields;
  const deps = (map: Readonly<Record<string, string>> | undefined): Fields | undefined =>
    map === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(map).map(([id, range]) => [
            id,
            typeof reasons[id] === "string" ? { range, because: reasons[id] } : { range },
          ]),
        );
  const required = deps(manifest.dependencies);
  const optional = deps(manifest.optionalDependencies);
  if (required !== undefined || optional !== undefined) {
    data["dependencies"] = {
      ...(required === undefined ? {} : { required }),
      ...(optional === undefined ? {} : { optional }),
    };
  }
  for (const key of KEPT_FIELDS) {
    if (m[key] !== undefined) data[key] = m[key];
  }
  if (Array.isArray(m["compat"]) && m["compat"].length > 0) data["compat"] = m["compat"];
  return { format: MANIFEST_FORMAT, schemaVersion: 2, data };
}
