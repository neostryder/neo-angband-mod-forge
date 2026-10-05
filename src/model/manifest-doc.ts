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
 * Only the object written as `export default { ... }` counts, and only its own
 * top-level `api` member: a range in a comment, in a string, in another object
 * or nested inside the default export says nothing about what the game loads. A
 * string value (quoted, or a template literal with no substitutions) is an API
 * range (API 2 and later). `api: 1`, and any `api` this cannot read, is an API 1
 * plugin: the template the workshop starts a script from declares it, and the
 * game refuses a script with no `api` either way.
 */
export function scriptApi(source: string | undefined): ScriptApi {
  const api1: ScriptApi = { range: API1_RANGE, api1: true };
  if (source === undefined) return api1;
  const value = defaultExportApi(scanScript(source));
  if (typeof value !== "string") return api1;
  const range = value.trim();
  if (range === "") return api1;
  return { range, api1: range === API1_RANGE };
}

/** A string literal's value, or null for a template with substitutions, and the offset just past its closing quote. */
interface Literal {
  readonly value: string | null;
  readonly end: number;
}

/** A script with its comments and string contents blanked, and every string literal keyed by its opening quote. */
interface Scanned {
  readonly code: string;
  readonly literals: ReadonlyMap<number, Literal>;
}

/** Words after which a `/` starts a regular expression rather than a division. */
const REGEX_AFTER_WORD = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await",
]);

const ESCAPES: Readonly<Record<string, string>> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };

/**
 * Blank a script's comments, string and template text and regular expressions
 * to spaces, so that what is left is the code's own punctuation and names. Line
 * breaks stay, and so do the quotes, at the offsets the literals are keyed by.
 * The code inside a template's `${ }` stays code.
 */
function scanScript(source: string): Scanned {
  const out = source.split("");
  const literals = new Map<number, Literal>();
  const blank = (from: number, to: number): void => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };
  /* For each open `${`, the brace depth its closing `}` returns to. */
  const substitutions: number[] = [];
  /* Template literals still open around a substitution, by opening offset. */
  const openTemplates: number[] = [];
  let braces = 0;
  let last = "";
  let lastWord = "";
  let i = 0;

  /* Read template text from `from` up to its closing backtick or the next `${`. */
  const templateText = (start: number, from: number, value: string | null): number => {
    let text = value;
    let k = from;
    while (k < source.length) {
      const c = source[k];
      if (c === "\\") {
        const next = source[k + 1] ?? "";
        if (text !== null) text += ESCAPES[next] ?? next;
        k += 2;
        continue;
      }
      if (c === "`") {
        blank(from, k);
        literals.set(start, { value: text, end: k + 1 });
        last = "`";
        return k + 1;
      }
      if (c === "$" && source[k + 1] === "{") {
        blank(from, k + 2);
        literals.set(start, { value: null, end: -1 });
        openTemplates.push(start);
        substitutions.push(braces);
        last = "{";
        return k + 2;
      }
      if (text !== null) text += c;
      k++;
    }
    blank(from, source.length);
    literals.set(start, { value: null, end: source.length });
    return source.length;
  };

  while (i < source.length) {
    const c = source[i] ?? "";
    const next = source[i + 1] ?? "";
    if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const stop = end < 0 ? source.length : end;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end < 0 ? source.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      let value = "";
      let k = i + 1;
      while (k < source.length && source[k] !== c && source[k] !== "\n") {
        if (source[k] === "\\") {
          const escaped = source[k + 1] ?? "";
          value += ESCAPES[escaped] ?? escaped;
          k += 2;
          continue;
        }
        value += source[k];
        k++;
      }
      blank(i + 1, k);
      literals.set(i, { value, end: k + 1 });
      last = c;
      i = k + 1;
      continue;
    }
    if (c === "`") {
      i = templateText(i, i + 1, "");
      continue;
    }
    if (c === "}" && substitutions.length > 0 && substitutions[substitutions.length - 1] === braces) {
      substitutions.pop();
      out[i] = " ";
      const start = openTemplates.pop() ?? i;
      i = templateText(start, i + 1, null);
      continue;
    }
    if (c === "/" && (last === "" || "(,=:[!&|?{};+-*%<>~^".includes(last) || (last === "a" && REGEX_AFTER_WORD.has(lastWord)))) {
      let k = i + 1;
      let inClass = false;
      while (k < source.length && source[k] !== "\n") {
        const r = source[k];
        if (r === "\\") {
          k += 2;
          continue;
        }
        if (r === "[") inClass = true;
        else if (r === "]") inClass = false;
        else if (r === "/" && !inClass) break;
        k++;
      }
      if (source[k] === "/") {
        blank(i + 1, k);
        last = ")";
        i = k + 1;
        continue;
      }
    }
    if (/[A-Za-z_$0-9]/u.test(c)) {
      let k = i;
      while (k < source.length && /[A-Za-z_$0-9]/u.test(source[k] ?? "")) k++;
      lastWord = source.slice(i, k);
      last = "a";
      i = k;
      continue;
    }
    if (c === "{") braces++;
    else if (c === "}") braces--;
    if (!/\s/u.test(c)) last = c;
    i++;
  }
  return { code: out.join(""), literals };
}

/**
 * The value of the top-level `api` member of the object after `export default`:
 * a string, the number 1, or undefined when there is no such member or its
 * value is anything else (a name, an expression, a template with substitutions).
 */
function defaultExportApi({ code, literals }: Scanned): string | 1 | undefined {
  const opening = /\bexport\s+default\s*\{/u.exec(code);
  if (opening === null) return undefined;
  const skipSpace = (k: number): number => {
    while (k < code.length && /\s/u.test(code[k] ?? "")) k++;
    return k;
  };
  /* The member ends at a comma or at the object's closing brace. */
  const endsMember = (k: number): boolean => {
    const c = code[skipSpace(k)];
    return c === "," || c === "}";
  };

  let k = opening.index + opening[0].length;
  while (k < code.length) {
    k = skipSpace(k);
    if (code[k] === "}") return undefined;
    let key: string | undefined;
    let afterKey = k;
    const literal = literals.get(k);
    if (literal !== undefined && (code[k] === '"' || code[k] === "'")) {
      key = literal.value ?? undefined;
      afterKey = literal.end;
    } else {
      const name = /^[A-Za-z_$][A-Za-z0-9_$]*/u.exec(code.slice(k));
      if (name !== null) {
        key = name[0];
        afterKey = k + name[0].length;
      }
    }
    const colon = skipSpace(afterKey);
    if (key === "api" && code[colon] === ":") {
      const at = skipSpace(colon + 1);
      const value = literals.get(at);
      if (value !== undefined && "\"'`".includes(code[at] ?? "")) {
        return value.value !== null && endsMember(value.end) ? value.value : undefined;
      }
      const number = /^\d+/u.exec(code.slice(at));
      if (number !== null && number[0] === "1" && endsMember(at + 1)) return 1;
      return undefined;
    }
    /* Skip to the next top-level comma, through whatever this member holds. */
    let depth = 0;
    for (; k < code.length; k++) {
      const c = code[k];
      if (c === "{" || c === "(" || c === "[") depth++;
      else if (c === "}" || c === ")" || c === "]") {
        if (depth === 0) return undefined;
        depth--;
      } else if (c === "," && depth === 0) break;
    }
    k++;
  }
  return undefined;
}

/**
 * Whether today's folder loader would refuse this range in process. It does
 * when the range admits no 1.x version at all: ">=1.5.0 <3.0.0" still loads as
 * API 1, "^2.0.0" does not. An unreadable range counts as not API 2.
 *
 * The check calls the authoring library's `satisfies` on 1.0.0 and on each 1.x
 * bound the range names, plus the next patch and minor after it, because the
 * lowest 1.x version a range can admit is always one of those.
 */
export function isApi2Range(range: string, satisfies: (version: string, range: string) => boolean): boolean {
  const candidates = new Set(["1.0.0"]);
  for (const bound of range.matchAll(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/gu)) {
    if (Number(bound[1]) !== 1) continue;
    const minor = Number(bound[2] ?? 0);
    const patch = Number(bound[3] ?? 0);
    candidates.add(`1.${minor}.${patch}`);
    candidates.add(`1.${minor}.${patch + 1}`);
    candidates.add(`1.${minor + 1}.0`);
  }
  try {
    satisfies("0.0.0", range);
    return ![...candidates].some((version) => satisfies(version, range));
  } catch {
    return false;
  }
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

/** The SDK's API version for the Worker ABI that schema 1 called `modApi: 2`. */
const WORKER_PREVIEW_API = "2.0.0-worker";

/** The SDK's `because` for an engine range that came with no reason. */
const CONVERTED_ENGINE_REASON = "Carried over from a schema 1 manifest, which gave no reason.";

/**
 * The runtime, API range and entry a manifest maps to, as the SDK maps them: an
 * `api` and a `runtime` together are taken as they are, and otherwise the
 * schema 1 fields decide. Null when they map to none.
 */
function runtimeOf(m: Fields): { runtime: JsonValue; api: JsonValue; entry?: JsonValue } | null {
  if (m["api"] !== undefined && m["runtime"] !== undefined) {
    return {
      runtime: m["runtime"],
      api: m["api"],
      ...(m["runtime"] === "worker" && m["entry"] !== undefined ? { entry: m["entry"] } : {}),
    };
  }
  const facets: JsonValue[] = Array.isArray(m["facets"]) ? m["facets"] : [m["shape"] ?? null];
  const code = facets.includes("plugin") || m["shape"] === "plugin";
  const modApi = m["modApi"];
  if (modApi === 2 && m["runtime"] === "worker" && typeof m["workerEntry"] === "string") {
    return { runtime: "worker", api: WORKER_PREVIEW_API, entry: m["workerEntry"] };
  }
  if (modApi === 1 && (m["runtime"] === undefined || m["runtime"] === "in-process")) {
    return { runtime: "in-process", api: API1_RANGE };
  }
  if (modApi === undefined && !code) return { runtime: "data", api: "*" };
  return null;
}

/**
 * Schema 2 for a manifest when no SDK is around to write it, which is the
 * demonstration library's case. The output has to match the SDK's
 * `manifestToV2` key for key, so this copies its mapping: runtime and api,
 * `changelog` and `screenshots` folded into `listing`, a whole-mod conflicts
 * claim moved into `dependencies.conflicts`. A schema 1 modApi with no mapping
 * throws here too.
 */
export function manifestDocument(manifest: PackManifest): JsonRecord {
  const m = manifest as unknown as Fields;
  const mapped = runtimeOf(m);
  if (mapped === null) {
    const id = String(m["id"]);
    throw new Error(
      m["modApi"] === undefined
        ? `manifest ${id}: ships code but declares no modApi, so there is no API to convert it to; add "modApi": 1 first`
        : `manifest ${id}: modApi ${String(m["modApi"])}${m["runtime"] === undefined ? "" : ` with runtime "${String(m["runtime"])}"`} has no schema 2 mapping`,
    );
  }
  const data: Fields = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    api: mapped.api,
    runtime: mapped.runtime,
    ...(mapped.entry === undefined ? {} : { entry: mapped.entry }),
  };
  if (m["engine"] !== undefined && m["engineBecause"] !== undefined) {
    data["engine"] = { range: m["engine"], because: m["engineBecause"] };
  } else if (typeof m["engine"] === "string") {
    data["engine"] = { range: m["engine"], because: CONVERTED_ENGINE_REASON };
  }

  const reasons = (m["dependencyReasons"] ?? {}) as Fields;
  const deps = (map: JsonValue | undefined): Record<string, Fields> | undefined => {
    if (!isObject(map)) return undefined;
    const out: Record<string, Fields> = {};
    for (const [id, range] of Object.entries(map)) {
      out[id] = typeof reasons[id] === "string" ? { range: String(range), because: reasons[id] } : { range: String(range) };
    }
    return out;
  };
  const required = deps(m["dependencies"]);
  const optional = deps(m["optionalDependencies"]);

  /* A whole-mod `conflicts` claim (no `scope`, the only one for that mod, and not
   * a mod listed as a dependency) is schema 2's `dependencies.conflicts`. Every
   * other claim stays in `compat`. */
  const compat = Array.isArray(m["compat"]) ? (m["compat"] as Fields[]) : undefined;
  const conflicts: Fields = {};
  const keptCompat: Fields[] = [];
  if (compat !== undefined) {
    const wholeMod = compat.filter((c) => c["claim"] === "conflicts" && c["scope"] === undefined);
    for (const claim of compat) {
      const other = String(claim["with"]);
      const movable =
        claim["claim"] === "conflicts" &&
        claim["scope"] === undefined &&
        wholeMod.filter((c) => c["with"] === claim["with"]).length === 1 &&
        required?.[other] === undefined &&
        optional?.[other] === undefined;
      if (movable) {
        conflicts[other] = {
          ...(claim["range"] === undefined ? {} : { range: claim["range"] }),
          ...(claim["because"] === undefined ? {} : { because: claim["because"] }),
        };
      } else {
        keptCompat.push(claim);
      }
    }
  }
  const dependencies: Fields = {};
  if (required !== undefined) dependencies["required"] = required;
  if (optional !== undefined) dependencies["optional"] = optional;
  if (Object.keys(conflicts).length > 0) dependencies["conflicts"] = conflicts;
  if (Object.keys(dependencies).length > 0) data["dependencies"] = dependencies;

  for (const key of KEPT_FIELDS) {
    if (m[key] !== undefined) data[key] = m[key];
  }
  if (compat !== undefined && keptCompat.length > 0) data["compat"] = keptCompat;

  const listing: Fields = {};
  if (Array.isArray(m["screenshots"])) listing["screenshots"] = m["screenshots"];
  if (typeof m["changelog"] === "string") listing["changelog"] = m["changelog"];
  if (m["listing"] !== undefined) data["listing"] = { ...(isObject(m["listing"]) ? m["listing"] : {}), ...listing };
  else if (Object.keys(listing).length > 0) data["listing"] = listing;
  if (m["text"] !== undefined) data["text"] = m["text"];
  if (m["budget"] !== undefined) data["budget"] = m["budget"];
  return { format: MANIFEST_FORMAT, schemaVersion: 2, data };
}
