/**
 * From a draft to the bytes of a mod.
 *
 * The whole pipeline, in one file, because it is one thought: a draft becomes a
 * project, the project is built ON TOP OF the game rather than on its own, the
 * build's verdict is what the player reads, and the emitted files become a zip.
 *
 * THE ONE THING WORTH UNDERSTANDING HERE is why the build composes. The game
 * does not see a mod's records; it sees the base game's records with the mod's
 * changes applied. So checking the draft on its own would miss exactly the class
 * of mistake that matters: a patch whose target does not exist, a new record that
 * collides with an existing identity, a reference to something no loaded pack
 * defines. The project builder takes a base pack and composes against it, which
 * is why `basePacks` below exists and why it bothers to attribute records to the
 * pack that owns them.
 */

import type {
  AuthoringApi,
  AuthoringFinding,
  ComposedRecords,
  EmittedFile,
  FileContribution,
  JsonRecord,
  LoadedPack,
  PackManifest,
  ProjectBuild,
} from "../host/authoring.js";
import type { Change, Draft } from "./draft.js";
import { allChanges, dependenciesFor, groupFor, MOD_API } from "./draft.js";
import { ownerOf } from "./refs.js";
import { zipStored } from "./zip.js";

/**
 * The manifest a draft emits. Built here so one function owns every field.
 *
 * SHIPPING A SCRIPT CHANGES TWO KEYS AT ONCE, and it has to change both or
 * neither. The host refuses to import a `plugin.js` unless the manifest declares
 * the `plugin` facet AND a `modApi` number, and the install-time standards check
 * refuses the whole mod for either one on its own. So a draft that has grown a
 * script gets both, from the same condition, in the same place. Declaring one and
 * not the other is the failure this codebase keeps finding: a mod that installs,
 * loads, and does nothing at all.
 *
 * `facets` carries `content` as well, because the validator requires the facet list
 * to contain whatever `shape` says, and the shape of everything the workshop writes
 * is content.
 */
export function manifestFor(draft: Draft): PackManifest {
  const ships = Object.keys(draft.extras ?? {});
  const code = ships.some((path) => /\.(?:js|mjs|cjs|ts|wasm)$/i.test(path));

  const manifest: PackManifest = {
    id: draft.id,
    name: draft.name,
    version: draft.version,
    shape: "content",
    facets: code ? ["content", "plugin"] : ["content"],
    engine: draft.engine,
    group: groupFor(allChanges(draft)),
    dependencies: dependenciesFor(allChanges(draft)),
    /* A content mod that adds or retunes anything the player meets is a mod that
     * affects gameplay, and every change the workshop can make does. Saying so
     * is what lets the mod manager warn a player who cares about their score. */
    affectsGameplay: true,
    description: draft.description,
    author: draft.author,
    license: draft.license,
    repository: draft.repository,
  };
  if (code) manifest.modApi = MOD_API;
  if (draft.fields.length > 0) manifest.fields = [...draft.fields];
  if (draft.sections && draft.sections.length > 0) {
    manifest.sections = draft.sections.map(({ changes: _changes, ...section }) => ({ ...section }));
  }

  /* Whatever the author wrote by hand wins, and the reason it is safe to let it is
   * that the game's validator passes an unknown key through untouched, so a key it
   * does not model is a key that works. `writeManifest` is where the decision about
   * WHICH keys land here is made, and it refuses the two above. */
  return { ...manifest, ...(draft.manifestExtras ?? {}) } as PackManifest;
}

/**
 * The base to compose against, split into one pack per owning pack.
 *
 * NOT ONE PACK CALLED "core". The composer only lets a pack patch a record whose
 * owner it declares as a dependency, so folding every loaded record into a
 * pretend `core` pack would make a patch against another mod's sword look
 * permitted when the real composer would refuse it. That is a false green, and a
 * false green on this particular check produces a mod that installs, loads and
 * silently does nothing.
 */
export function basePacks(api: AuthoringApi, records: ComposedRecords): LoadedPack[] {
  const byOwner = new Map<string, Record<string, JsonRecord[]>>();
  for (const [file, list] of Object.entries(records)) {
    for (const record of list) {
      const owner = ownerOf(api, record);
      let files = byOwner.get(owner);
      if (!files) {
        files = {};
        byOwner.set(owner, files);
      }
      const into = files[file];
      if (into) into.push(record);
      else files[file] = [record];
    }
  }
  const packs: LoadedPack[] = [];
  for (const [owner, files] of [...byOwner.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const contributions: Record<string, FileContribution> = {};
    for (const [file, list] of Object.entries(files)) contributions[file] = { records: list };
    packs.push({
      manifest: {
        id: owner,
        name: owner,
        version: "0.0.0",
        shape: "content",
      },
      files: contributions,
    });
  }
  return packs;
}

/**
 * Compose the draft onto the game and return the verdict.
 *
 * The base packs are merged into ONE pack for the project builder, because its
 * `build` takes a single base. Merging them here rather than in `basePacks` keeps
 * the attribution available to callers that want it - the base-picker screen uses
 * it to mark a row as another mod's - while giving `build` the shape it wants.
 */
export function buildDraft(api: AuthoringApi, draft: Draft, records: ComposedRecords): ProjectBuild {
  const project = api.modProject(manifestFor(draft));
  for (const field of draft.fields) project.declareField(field);
  addChanges(project, draft.changes);
  for (const section of draft.sections ?? []) addChanges(project.section?.(section.id) ?? project, section.changes);
  const merged = mergeBase(basePacks(api, records));
  const built = project.build(merged);
  if (built.composed === undefined) return built;

  /* ModProject runs the install-time pack checker. checkRecords is the authoring
   * companion over the same composed output, including advisory rules such as
   * field/vocabulary that deliberately do not run while a player's game boots.
   * A supported host hands both through one SDK barrel, so the workshop must call
   * both rather than keep its former local copy of that advisory rule. */
  const all = composedRecordObjects(built.composed);
  const subject: Record<string, JsonRecord[]> = {};
  for (const [file, list] of Object.entries(all)) {
    const mine = list.filter((record) => {
      const provenance = api.provenanceOf(record);
      return provenance?.owner === draft.id || provenance?.modifiedBy?.includes(draft.id) === true;
    });
    if (mine.length > 0) subject[file] = mine;
  }
  const findings = distinctFindings([...built.findings, ...api.checkRecords(subject, all)]);
  return {
    ...built,
    findings,
    ok: built.ok && !findings.some((finding) => finding.level === "error"),
  };
}

function composedRecordObjects(composed: Readonly<Record<string, readonly unknown[]>>): ComposedRecords {
  const out: Record<string, JsonRecord[]> = {};
  for (const [file, values] of Object.entries(composed)) {
    out[file] = values.filter(
      (value): value is JsonRecord => typeof value === "object" && value !== null && !Array.isArray(value),
    );
  }
  return out;
}

function distinctFindings(findings: readonly AuthoringFinding[]): readonly AuthoringFinding[] {
  const seen = new Set<string>();
  return sortFindings(
    findings.filter((finding) => {
      const key = [finding.level, finding.file, finding.record, finding.field ?? "", finding.rule].join("\u0000");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
}

function mergeBase(packs: readonly LoadedPack[]): LoadedPack {
  const files: Record<string, FileContribution> = {};
  for (const pack of packs) {
    for (const [file, contribution] of Object.entries(pack.files)) {
      const into = files[file];
      if (into) into.records = [...(into.records ?? []), ...(contribution.records ?? [])];
      else files[file] = { records: [...(contribution.records ?? [])] };
    }
  }
  return {
    manifest: { id: "core", name: "core", version: "0.0.0", shape: "content" },
    files,
  };
}

/**
 * The files this draft would write, exactly as the folder reader expects them.
 *
 * THE WHOLE FOLDER, not just the records: the project builder's own files, then
 * whatever a record file carries that the draft cannot model, then every file the
 * author wrote by hand. That order matters, because it is also the order of
 * authority - a hand-written file never shadows a generated one, so no amount of
 * editing can produce a folder in which `monster.json` is not what the mod does to
 * monsters.
 */
export function emitDraft(api: AuthoringApi, draft: Draft): readonly EmittedFile[] {
  const project = api.modProject(manifestFor(draft));
  for (const field of draft.fields) project.declareField(field);
  addChanges(project, draft.changes);
  for (const section of draft.sections ?? []) addChanges(project.section?.(section.id) ?? project, section.changes);
  return withHandWritten(project.emit(), draft);
}

function addChanges(project: ReturnType<AuthoringApi["modProject"]>, changes: readonly Change[]): void {
  for (const change of changes) {
    switch (change.kind) {
      case "add":
        project.add(change.file, change.record);
        break;
      case "patch":
        project.patchFields(change.file, change.ref, change.ops);
        break;
      case "replace":
        project.replace(change.file, change.ref, change.record);
        break;
      case "remove":
        project.remove(change.file, change.ref);
        break;
    }
  }
}

/**
 * Fold the author's own text into the generated folder.
 *
 * A record file's unmodelled keys are merged INTO the generated file rather than
 * beside it, because a mod folder has one `monster.json` and the game reads all of
 * it. The generated keys are written first so that a draft's actual changes cannot
 * be overwritten by a stale copy of themselves.
 */
function withHandWritten(generated: readonly EmittedFile[], draft: Draft): readonly EmittedFile[] {
  const fileExtras = draft.fileExtras ?? {};
  const extras = draft.extras ?? {};

  const out = generated.map((file) => {
    const stem = file.path.endsWith(".json") ? file.path.slice(0, -".json".length) : "";
    const spare = fileExtras[stem];
    /* Every file the composer itself emits is JSON text - the manifest and every
     * record file - so `typeof file.contents !== "string"` never actually happens
     * here today. It is checked anyway because this function's contract is about
     * `EmittedFile` in general, not about what one implementation happens to emit. */
    if (file.path === "manifest.json" || spare === undefined || Object.keys(spare).length === 0 || typeof file.contents !== "string") {
      return file;
    }
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(file.contents) as Record<string, unknown>;
    } catch {
      return file;
    }
    return { path: file.path, contents: `${JSON.stringify({ ...body, ...spare }, null, 2)}\n` };
  });

  /* A stem with nothing but unmodelled keys still has to be written, or an author
   * who put a whole mod's worth of sections in one file would emit no file at all. */
  const written = new Set(out.map((file) => file.path));
  for (const [stem, spare] of Object.entries(fileExtras)) {
    const path = `${stem}.json`;
    if (written.has(path) || Object.keys(spare).length === 0) continue;
    out.push({ path, contents: `${JSON.stringify(spare, null, 2)}\n` });
    written.add(path);
  }

  for (const [path, contents] of Object.entries(extras)) {
    if (written.has(path)) continue;
    out.push({ path, contents });
  }

  return out.sort((a, b) => (a.path === "manifest.json" ? -1 : b.path === "manifest.json" ? 1 : a.path.localeCompare(b.path)));
}

/** The bytes of the mod, ready for the install door or for a download. */
export function zipDraft(files: readonly EmittedFile[]): Uint8Array {
  return zipStored(files.map((f) => ({ path: f.path, contents: f.contents })));
}

/** Findings, worst first, then by file and record, so the pane is stable. */
export function sortFindings(findings: readonly AuthoringFinding[]): readonly AuthoringFinding[] {
  const order: Readonly<Record<string, number>> = { error: 0, warn: 1, hint: 2 };
  return [...findings].sort(
    (a, b) =>
      (order[a.level] ?? 3) - (order[b.level] ?? 3) ||
      a.file.localeCompare(b.file) ||
      a.record.localeCompare(b.record) ||
      (a.field ?? "").localeCompare(b.field ?? ""),
  );
}

/** How many findings there are at each level, for the summary chip. */
export function countFindings(findings: readonly AuthoringFinding[]): { errors: number; warnings: number; hints: number } {
  let errors = 0;
  let warnings = 0;
  let hints = 0;
  for (const finding of findings) {
    if (finding.level === "error") errors++;
    else if (finding.level === "warn") warnings++;
    else hints++;
  }
  return { errors, warnings, hints };
}
