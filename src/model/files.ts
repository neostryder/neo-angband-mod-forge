/**
 * The mod as a folder of text files, which is the same mod the screens edit.
 *
 * THE ONE THING THIS FILE EXISTS TO AVOID is a second copy of the project. A tool
 * that grows a raw editor usually grows a file store beside the model it already
 * had, and from that moment the two disagree: a record edited in the interface is
 * not the record in the file, one of them wins on save, and the author finds out
 * which by losing work. So there is no file store here and there is not going to be
 * one. `draft.ts` remains the whole document. Reading a file DERIVES its text from
 * the draft, and saving a file PARSES that text back into the draft through the
 * same `store.edit` every button on every screen goes through.
 *
 * WHICH MEANS THREE KINDS OF FILE, and the difference is what a path is, not a mode
 * the author is in:
 *
 *   manifest.json      the manifest, which the details screen also edits
 *   <stem>.json        a record file, which the record screens also edit
 *   anything else      a file no screen writes: plugin.js, lib/*.js, data/*.json,
 *                      a README. Held verbatim in `draft.extras`, because the mod
 *                      folder carries it and `draft.ts`'s rule is that the workshop
 *                      owns nothing the folder does not.
 *
 * The first two round-trip. A record file is `{records, fieldPatches, replaces,
 * removes}` and every one of those is a `Change`, so the mapping is total in both
 * directions and the raw text is not a second representation - it is the same
 * representation, printed.
 *
 * WHAT DOES NOT ROUND-TRIP IS REFUSED RATHER THAN DROPPED. A record file may carry
 * `sections`, which this draft cannot model (see PLANNED.md), so a file with one is
 * refused with the reason on it. Silently discarding a key the author typed is the
 * behaviour that makes a raw editor untrustworthy, and it only has to happen once.
 *
 * A MANIFEST KEY THE WORKSHOP DOES NOT MODEL IS KEPT, which is the opposite call
 * and the right one for the opposite reason: the game's manifest validator passes
 * unknown keys through untouched, so `capabilities`, `rules`, `optionalDependencies`
 * and anything else an author adds by hand are real and work. Keeping them in
 * `draft.manifestExtras` is what makes this an escape hatch rather than a viewer.
 */

import type { AuthoringApi, FieldDecl, FieldOp, JsonRecord, JsonValue, PackSection } from "../host/authoring.js";
import type { Change, Draft } from "./draft.js";
import { emitDraft, manifestFor } from "./build.js";

/** What kind of file a path is, which decides what saving it means. */
export type FileKind = "manifest" | "records" | "extra";

/** One file in the project, and where its text came from. */
export interface ProjectFile {
  readonly path: string;
  readonly kind: FileKind;
  /**
   * `string` for the manifest, a record file, or a hand-written text extra.
   * `Uint8Array` for a hand-written extra carrying real bytes - a tile, a font, a
   * sound. Only an "extra" file is ever the second shape: the manifest and every
   * record file are JSON the workshop itself composes, and stay text.
   */
  readonly contents: string | Uint8Array;
}

/** Whether a file's contents are raw bytes rather than text. */
export function isBinary(contents: string | Uint8Array): contents is Uint8Array {
  return typeof contents !== "string";
}

/** The one path the manifest lives at. */
export const MANIFEST = "manifest.json";

/**
 * The extensions the game treats as CODE, wherever they sit in the folder.
 *
 * Named here because two different rules turn on it: a mod carrying any of these
 * must declare the plugin facet, and the session-load door refuses an archive that
 * contains one at all.
 */
export const CODE_EXTENSIONS = [".js", ".mjs", ".cjs", ".ts", ".wasm"] as const;

/** The entry point a code mod ships. The host looks for exactly this name. */
export const PLUGIN = "plugin.js";

/** Whether a path is code as far as the game is concerned. */
export function isCodePath(path: string): boolean {
  const lower = path.toLowerCase();
  return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Every script this draft ships, sorted. Empty for an ordinary content mod. */
export function scriptFiles(draft: Draft): readonly string[] {
  return Object.keys(draft.extras ?? {})
    .filter(isCodePath)
    .sort();
}

/**
 * Whether this mod can be tried for a session, and the reason when it cannot.
 *
 * ONE FUNCTION, BECAUSE TWO WOULD DRIFT. The status bar's button, the review
 * screen's button and the action they both call all ask this, so a mod that cannot
 * be tried is a mod whose button is off for a reason the author can read, and there
 * is no path by which a disabled control and the refusal behind it can disagree.
 *
 * THE DOOR'S RULE IS NOT THIS MOD'S. `ctx.loadModForSession` takes content only: it
 * refuses an archive holding a script of any kind at any depth, and it refuses one
 * whose manifest declares any capability. That is the seam being a narrow version of
 * the install door rather than a looser one, and it is the right call - a mod loaded
 * without the mod manager's consent prompt should not be able to run code. What it
 * means for an author is that the moment they write a script, the one-click loop
 * stops being available to them and the route is the file and the mod manager. Said
 * plainly, before the button is pressed, is the least this can do about it.
 */
export function sessionRefusal(draft: Draft): string | undefined {
  const scripts = scriptFiles(draft);
  if (scripts.length > 0) {
    return (
      `Trying it for one session takes content only, and this mod ships ${scripts.join(", ")}. Save it as a file ` +
      `and add it with Import a zip on the Mods screen instead: that door runs code, and it asks you first.`
    );
  }
  const wanted = (draft.manifestExtras ?? {})["capabilities"];
  if (Array.isArray(wanted) && wanted.length > 0) {
    return (
      `Trying it for one session takes content only, and this mod's manifest asks for ${wanted.join(", ")}. ` +
      `A capability is something a player grants, so it is granted in the mod manager: save this as a file and ` +
      `add it with Import a zip.`
    );
  }
  return undefined;
}

/**
 * Every file carrying something the workshop wrote through without reading it.
 *
 * Shown wherever those files are, and it is not a warning about a mistake. It is
 * the boundary of what the review screen's verdict covers: the composer and the
 * validator run over what the draft models, so a `sections` block the author typed
 * ships unchecked. A blind spot that is declared is a different thing from one that
 * is not, and this is what declares it.
 */
export function unread(draft: Draft): readonly { readonly path: string; readonly keys: readonly string[] }[] {
  return Object.entries(draft.fileExtras ?? {})
    .filter(([, spare]) => Object.keys(spare).length > 0)
    .map(([stem, spare]) => ({ path: `${stem}.json`, keys: Object.keys(spare).sort() }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Which kind of file a path is.
 *
 * A RECORD FILE IS A TOP-LEVEL `<stem>.json` AND NOTHING ELSE, because that is the
 * game's own rule: it binds top-level JSON files as records and treats a nested one
 * as an asset the mod reads for itself. So `data/spawns.json` is an extra and
 * `monster.json` is not, and the difference is the slash rather than anything the
 * author declares.
 */
export function classify(api: AuthoringApi, path: string): FileKind {
  if (path === MANIFEST) return "manifest";
  if (path.includes("/")) return "extra";
  if (!path.endsWith(".json")) return "extra";
  const stem = path.slice(0, -".json".length);
  return api.BLUEPRINT_FILES.includes(stem) ? "records" : "extra";
}

/**
 * Every file this mod would ship, in the order the list shows them.
 *
 * The manifest leads because it is the one file every mod has and the one a reader
 * opens first. Everything else is alphabetical, which puts a mod's record files
 * above its `lib/` folder without either of them having to be a category.
 */
export function projectFiles(api: AuthoringApi, draft: Draft): readonly ProjectFile[] {
  return emitDraft(api, draft)
    .map((file) => ({ path: file.path, kind: classify(api, file.path), contents: file.contents }))
    .sort((a, b) => (a.path === MANIFEST ? -1 : b.path === MANIFEST ? 1 : a.path.localeCompare(b.path)));
}

/**
 * The contents of one file as it stands, or undefined when there is no such file.
 *
 * Text or bytes, whichever the file actually holds. `fileText` below is the
 * narrower accessor every text-editing path already expects, and it is
 * undefined for a binary file rather than a decoded guess at what the bytes
 * might say as text - decoding a PNG as UTF-8 is not a smaller version of
 * reading it, it is a different and wrong answer.
 */
export function fileContents(api: AuthoringApi, draft: Draft, path: string): string | Uint8Array | undefined {
  return projectFiles(api, draft).find((file) => file.path === path)?.contents;
}

/** The text of one file, or undefined when there is no such file or it is binary. */
export function fileText(api: AuthoringApi, draft: Draft, path: string): string | undefined {
  const contents = fileContents(api, draft, path);
  return typeof contents === "string" ? contents : undefined;
}

/* ------------------------------------------------------------------ *
 * Paths a mod folder may contain                                      *
 * ------------------------------------------------------------------ */

/** Reserved on Windows whatever the extension, so an archive holding one is refused. */
const DEVICE_NAMES = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

/**
 * Why a path could never be in a mod folder, or undefined.
 *
 * THE RULES ARE THE INSTALLER'S, restated rather than invented. A mod arrives as a
 * zip and the game refuses an archive with a control character, a trailing dot or
 * space, a Windows device name, an over-long segment or a path that climbs out of
 * the mod folder. A workshop that let somebody write a file the installer would
 * later refuse would be a workshop whose mods fail at the last step, for a reason
 * given nowhere near where the mistake was made.
 *
 * SEPARATE FROM `pathProblem` BECAUSE EVERY WRITE CHECKS THIS ONE. The rules about
 * what already exists belong to the screen that offers to make a new file. These
 * rules belong to the store, including a write replaying a path out of storage, so
 * that a path the installer would refuse cannot get into a draft by any route.
 */
export function pathShapeProblem(path: string): string | undefined {
  if (path === "") return "A file needs a name.";
  if (path.length > 240) return "That path is longer than the 240 characters an installed mod may use.";
  if (path.includes("\\")) return "Folders are separated with a forward slash, even on Windows.";
  if (path.startsWith("/")) return "A path is relative to the mod folder, so it cannot start with a slash.";
  if (/[\u0000-\u001f\u007f]/.test(path)) return "That path has an invisible control character in it.";

  for (const segment of path.split("/")) {
    if (segment === "") return "That path has an empty folder name in it.";
    if (segment === "." || segment === "..") return "A mod may only hold its own files, so a path cannot use . or ..";
    if (segment.length > 255) return "One part of that path is longer than 255 characters.";
    if (segment.endsWith(".") || segment.endsWith(" ")) return "A file or folder name cannot end in a dot or a space.";
    if (DEVICE_NAMES.test(segment)) return `"${segment}" is a reserved device name on Windows, so the archive would be refused.`;
  }
  return undefined;
}

/** Why this path cannot be used for a NEW file, or undefined. */
export function pathProblem(api: AuthoringApi, draft: Draft, path: string): string | undefined {
  const shape = pathShapeProblem(path);
  if (shape !== undefined) return shape;

  const kind = classify(api, path);
  if (kind === "manifest") return "The manifest already exists. Open it from the list.";
  if (kind === "records") {
    return (
      `${path} is written from what the mod does to ${path.slice(0, -".json".length)} records, so it is not a file ` +
      `to create by hand. Add or change one and it appears in this list, ready to edit.`
    );
  }

  const taken = projectFiles(api, draft).map((file) => file.path.toLowerCase());
  if (taken.includes(path.toLowerCase())) return "There is already a file with that name.";
  return undefined;
}

/**
 * What is worth saying about a path that is allowed, or undefined.
 *
 * A NOTE AND NOT A REFUSAL, because both cases below are legal and one of them is
 * occasionally what somebody means. The point is that neither does what its name
 * suggests, and finding that out after installing is expensive.
 */
export function pathNote(api: AuthoringApi, path: string): string | undefined {
  if (classify(api, path) !== "extra") return undefined;
  if (!path.includes("/") && path.endsWith(".json") && path !== MANIFEST) {
    return (
      "The game reads every top-level JSON file as a record file. This one is not a record file the game knows, " +
      "so it will be loaded and contribute nothing. Put it in a folder - data/ is the usual one - to have it " +
      "treated as data your own code reads."
    );
  }
  if (isCodePath(path) && path !== PLUGIN && !path.includes("/")) {
    return `Only ${PLUGIN} is an entry point. Another script beside it runs only if ${PLUGIN} imports it.`;
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * Saving                                                              *
 * ------------------------------------------------------------------ */

/** What one save did. A refusal names the reason and changes nothing. */
export type WriteOutcome = { readonly ok: true; readonly draft: Draft } | { readonly ok: false; readonly why: string };

/** Save one file's text back into the draft. */
export function writeFileText(api: AuthoringApi, draft: Draft, path: string, text: string): WriteOutcome {
  const shape = pathShapeProblem(path);
  if (shape !== undefined) return { ok: false, why: shape };
  switch (classify(api, path)) {
    case "manifest":
      return writeManifest(draft, text);
    case "records":
      return writeRecordFile(draft, path.slice(0, -".json".length), text);
    case "extra":
      return { ok: true, draft: { ...draft, extras: { ...(draft.extras ?? {}), [path]: text } } };
  }
}

/**
 * Save raw bytes into an extra file - a tile, a font, a sound.
 *
 * Refused for the manifest and for a record file for the same reason
 * `writeFileText` refuses them for text: both are JSON the workshop itself
 * composes, and there is no gesture that turns bytes into that.
 */
export function writeFileBytes(api: AuthoringApi, draft: Draft, path: string, bytes: Uint8Array): WriteOutcome {
  const shape = pathShapeProblem(path);
  if (shape !== undefined) return { ok: false, why: shape };
  const kind = classify(api, path);
  if (kind !== "extra") {
    return {
      ok: false,
      why: `${path} is written from what the mod does, as text the workshop generates or parses, so it cannot hold raw bytes.`,
    };
  }
  return { ok: true, draft: { ...draft, extras: { ...(draft.extras ?? {}), [path]: bytes } } };
}

/** Take a file out of the mod. Only a hand-written one can go; the rest are derived. */
export function deleteFile(api: AuthoringApi, draft: Draft, path: string): WriteOutcome {
  if (classify(api, path) !== "extra") {
    return {
      ok: false,
      why: `${path} is written from what the mod contains, so there is nothing to delete. Take the changes out instead.`,
    };
  }
  const extras = { ...(draft.extras ?? {}) };
  delete extras[path];
  return { ok: true, draft: { ...draft, extras } };
}

/** The bytes this project would occupy, for a size the author can watch. */
export function projectBytes(api: AuthoringApi, draft: Draft): number {
  const encoder = new TextEncoder();
  let total = 0;
  for (const file of projectFiles(api, draft)) {
    total += typeof file.contents === "string" ? encoder.encode(file.contents).length : file.contents.length;
  }
  return total;
}

function parseObject(text: string, what: string): { ok: true; value: JsonRecord } | { ok: false; why: string } {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { ok: false, why: `${what} is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, why: `${what} has to be a JSON object, written with { }.` };
  }
  return { ok: true, value: value as JsonRecord };
}

/**
 * The manifest keys the workshop maintains itself, and therefore rewrites.
 *
 * Everything not in this list survives a save untouched. The list is short on
 * purpose: the fewer keys the workshop claims, the more of the manifest an author
 * can take over by hand, which is the whole point of being able to open it.
 */
const OWNED = ["id", "name", "version", "author", "description", "repository", "license", "engine", "fields"] as const;

/** The keys the workshop DERIVES, which an author may still override by hand. */
const DERIVED = ["shape", "facets", "group", "dependencies", "affectsGameplay", "modApi", "sections"] as const;

function writeManifest(draft: Draft, text: string): WriteOutcome {
  const parsed = parseObject(text, "The manifest");
  if (!parsed.ok) return parsed;
  const raw = parsed.value;

  /* THE ID IS REFUSED RATHER THAN APPLIED. The game treats a renamed mod as a
   * different mod - a fresh install, a fresh pin, and every save that referred to
   * the old one referring to nothing - and the drafts here are keyed by it. The
   * details screen declines to offer the field for the same reason, so accepting it
   * through the back door would be the interface disagreeing with itself. */
  if (raw["id"] !== undefined && raw["id"] !== draft.id) {
    return {
      ok: false,
      why:
        `The id cannot be changed here. The game treats a renamed mod as a different mod, so ${draft.id} would ` +
        `install alongside this one rather than replacing it. Start a new mod instead.`,
    };
  }

  const strings: Record<string, string> = {};
  for (const key of ["name", "version", "author", "description", "repository", "license", "engine"]) {
    const value = raw[key];
    if (value === undefined) continue;
    if (typeof value !== "string") return { ok: false, why: `"${key}" in the manifest has to be a string.` };
    strings[key] = value;
  }

  let fields: readonly FieldDecl[] = draft.fields;
  if (raw["fields"] !== undefined) {
    const declared = raw["fields"];
    if (!Array.isArray(declared)) return { ok: false, why: `"fields" in the manifest has to be a list.` };
    for (const entry of declared) {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return { ok: false, why: `Every entry in "fields" has to be an object with a name and a list of files.` };
      }
      const decl = entry as Record<string, JsonValue>;
      if (typeof decl["name"] !== "string" || !Array.isArray(decl["files"])) {
        return { ok: false, why: `Every entry in "fields" needs a "name" and a "files" list.` };
      }
    }
    fields = declared as unknown as readonly FieldDecl[];
  }

  const next: Draft = { ...draft, ...strings, fields };

  /* Compare what the author wrote against what the workshop would have written, so
   * that a value they DID change is kept as a deliberate override and a value they
   * merely left alone does not freeze at today's answer. Freezing it is the subtle
   * failure here: `dependencies` is derived from what the mod touches, so a copy
   * taken now would go stale the moment the next record is patched, and a mod whose
   * dependencies are wrong installs, loads and silently does nothing. */
  const derivedNow = manifestFor({ ...next, manifestExtras: {} }) as unknown as Record<string, JsonValue>;
  const extras: JsonRecord = {};
  for (const [key, value] of Object.entries(raw)) {
    if ((OWNED as readonly string[]).includes(key)) continue;
    if ((DERIVED as readonly string[]).includes(key) && JSON.stringify(derivedNow[key]) === JSON.stringify(value)) {
      continue;
    }
    extras[key] = value;
  }

  /* THE TWO KEYS A SCRIPT NEEDS ARE NOT OVERRIDABLE INTO NONSENSE. The host will
   * not import a plugin.js unless the manifest declares the plugin facet and a
   * modApi number, and the install refuses the mod for either one missing. So an
   * override that takes one of them away is refused here rather than shipped: the
   * result would install and do nothing, or not install at all, and in both cases
   * the cause would be a line the author had every right to think was allowed. */
  if (scriptFiles(next).length > 0) {
    const facets = extras["facets"];
    if (facets !== undefined && !(Array.isArray(facets) && facets.includes("plugin"))) {
      return {
        ok: false,
        why:
          `This mod ships ${scriptFiles(next).join(", ")}, so "facets" has to include "plugin" or the game will ` +
          `not run the code at all. Leave the line out and the workshop writes it.`,
      };
    }
    if (extras["modApi"] !== undefined && typeof extras["modApi"] !== "number") {
      return {
        ok: false,
        why: `"modApi" has to be a whole number. It is the plugin ABI the code is written against.`,
      };
    }
  }

  return { ok: true, draft: { ...next, manifestExtras: extras } };
}

/** The keys a record file may carry, all four of which are `Change`s. */
const CONTRIBUTIONS = ["records", "fieldPatches", "replaces", "removes", "sections"] as const;

function writeRecordFile(draft: Draft, file: string, text: string): WriteOutcome {
  const changes: Change[] = [];
  const sectionIds: string[] = [];
  const spare: Record<string, unknown> = {};

  if (text.trim() !== "") {
    const parsed = parseObject(text, `${file}.json`);
    if (!parsed.ok) return parsed;
    const raw = parsed.value;

    /* A KEY THE DRAFT CANNOT MODEL IS CARRIED, NOT REFUSED, and the choice went the
     * other way first. Refusing was tidier: the workshop would only ever hold what
     * it could compose and check. What it also meant was a file the editor could
     * open and never save - and the whole point of an editor over arbitrary text is
     * that there is no such file. `sections` is the case that exists today, and it
     * is the most obviously wanted thing no screen offers, so the version that
     * refuses is the version that says no to the one request it was most likely to
     * get. What is owed instead is saying that nothing in here is checked, which
     * `unread` exists to do. */
    for (const [key, value] of Object.entries(raw)) {
      if (!(CONTRIBUTIONS as readonly string[]).includes(key)) spare[key] = value;
    }

    const readContribution = (value: unknown, section?: string): boolean => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
      const contribution = value as Record<string, unknown>;
      const records = contribution["records"];
      if (records !== undefined) {
        if (!Array.isArray(records)) return false;
        for (const record of records) {
          if (typeof record !== "object" || record === null || Array.isArray(record)) return false;
          changes.push({ kind: "add", file, record: record as JsonRecord, ...(section ? { section } : {}) });
        }
      }
      const patches = contribution["fieldPatches"];
      if (patches !== undefined) {
        if (typeof patches !== "object" || patches === null || Array.isArray(patches)) return false;
        for (const [ref, ops] of Object.entries(patches)) {
          if (!Array.isArray(ops)) return false;
          changes.push({ kind: "patch", file, ref, ops: ops as unknown as readonly FieldOp[], ...(section ? { section } : {}) });
        }
      }
      const replaces = contribution["replaces"];
      if (replaces !== undefined) {
        if (typeof replaces !== "object" || replaces === null || Array.isArray(replaces)) return false;
        for (const [ref, record] of Object.entries(replaces)) {
          if (typeof record !== "object" || record === null || Array.isArray(record)) return false;
          changes.push({ kind: "replace", file, ref, record: record as JsonRecord, ...(section ? { section } : {}) });
        }
      }
      const removes = contribution["removes"];
      if (removes !== undefined) {
        if (!Array.isArray(removes) || removes.some((ref) => typeof ref !== "string")) return false;
        for (const ref of removes) changes.push({ kind: "remove", file, ref, ...(section ? { section } : {}) });
      }
      return true;
    };

    const records = raw["records"];
    if (records !== undefined) {
      if (!Array.isArray(records)) return { ok: false, why: `"records" in ${file}.json has to be a list.` };
      for (const record of records) {
        if (typeof record !== "object" || record === null || Array.isArray(record)) {
          return { ok: false, why: `Every entry in "records" has to be an object.` };
        }
        changes.push({ kind: "add", file, record: record as JsonRecord });
      }
    }

    const patches = raw["fieldPatches"];
    if (patches !== undefined) {
      if (typeof patches !== "object" || patches === null || Array.isArray(patches)) {
        return { ok: false, why: `"fieldPatches" in ${file}.json has to be an object of reference to operations.` };
      }
      for (const [ref, ops] of Object.entries(patches)) {
        if (!Array.isArray(ops)) return { ok: false, why: `The operations for ${ref} have to be a list.` };
        for (const op of ops) {
          if (
            typeof op !== "object" ||
            op === null ||
            Array.isArray(op) ||
            typeof (op as JsonRecord)["op"] !== "string" ||
            typeof (op as JsonRecord)["path"] !== "string"
          ) {
            return { ok: false, why: `Every operation for ${ref} needs an "op" and a "path".` };
          }
        }
        changes.push({ kind: "patch", file, ref, ops: ops as unknown as readonly FieldOp[] });
      }
    }

    const replaces = raw["replaces"];
    if (replaces !== undefined) {
      if (typeof replaces !== "object" || replaces === null || Array.isArray(replaces)) {
        return { ok: false, why: `"replaces" in ${file}.json has to be an object of reference to record.` };
      }
      for (const [ref, record] of Object.entries(replaces)) {
        if (typeof record !== "object" || record === null || Array.isArray(record)) {
          return { ok: false, why: `The replacement for ${ref} has to be an object.` };
        }
        changes.push({ kind: "replace", file, ref, record: record as JsonRecord });
      }
    }

    const removes = raw["removes"];
    if (removes !== undefined) {
      if (!Array.isArray(removes) || removes.some((ref) => typeof ref !== "string")) {
        return { ok: false, why: `"removes" in ${file}.json has to be a list of references.` };
      }
      for (const ref of removes) changes.push({ kind: "remove", file, ref: ref as string });
    }

    const sections = raw["sections"];
    if (sections !== undefined) {
      if (typeof sections !== "object" || sections === null || Array.isArray(sections)) return { ok: false, why: `"sections" in ${file}.json has to be an object.` };
      for (const [id, contribution] of Object.entries(sections)) {
        if (!readContribution(contribution, id)) return { ok: false, why: `The contribution for section ${id} is malformed.` };
      }
      const declaredSectionIds = Object.keys(sections);
      for (const id of declaredSectionIds) if (!sectionIds.includes(id)) sectionIds.push(id);
    }
  }

  for (const id of changes.map((change) => change.section).filter((id): id is string => id !== undefined)) {
    if (!sectionIds.includes(id)) sectionIds.push(id);
  }
  const existingSections = new Map((draft.sections ?? []).map((section) => [section.id, section]));
  const sections = sectionIds.map((id) => ({
    ...(existingSections.get(id) ?? { id, title: id }),
    changes: changes.filter((change) => change.section === id),
  }));
  const fileExtras = { ...(draft.fileExtras ?? {}) };
  if (Object.keys(spare).length === 0) delete fileExtras[file];
  else fileExtras[file] = spare;

  const unsectioned = changes.filter((change) => change.section === undefined);
  const sectioned = [...(draft.sections ?? []).filter((section) => !sectionIds.includes(section.id)), ...sections];
  const next = { ...draft, changes: spliceFile(draft.changes, file, unsectioned), fileExtras };
  if (sectioned.length > 0) return { ok: true, draft: { ...next, sections: sectioned } };
  const { sections: _sections, ...withoutSections } = next;
  return { ok: true, draft: withoutSections };
}

/**
 * Put this file's changes back where its old ones were.
 *
 * IN PLACE, rather than appended, and it is worth the six lines. The changes list
 * is what the details screen shows and what the record editor addresses BY INDEX,
 * so appending would silently renumber every change after the edited file and move
 * unrelated rows around on a screen the author is not looking at. The order within
 * one file is whatever the author's own text says, which is the point of having
 * edited it.
 */
function spliceFile(changes: readonly Change[], file: string, replacement: readonly Change[]): readonly Change[] {
  const at = changes.findIndex((change) => change.file === file);
  const others = changes.filter((change) => change.file !== file);
  if (at < 0) return [...others, ...replacement];
  /* `at` is the FIRST change for this file, so nothing before it belongs to the
   * file and `before` is exactly the leading run of `others`. */
  const before = changes.slice(0, at);
  return [...before, ...replacement, ...others.slice(before.length)];
}
