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
import type { Draft } from "./draft.js";
import { dependenciesFor, groupFor } from "./draft.js";
import { ownerOf } from "./refs.js";
import { zipStored } from "./zip.js";

/** The manifest a draft emits. Built here so one function owns every field. */
export function manifestFor(draft: Draft): PackManifest {
  const manifest: PackManifest = {
    id: draft.id,
    name: draft.name,
    version: draft.version,
    shape: "content",
    facets: ["content"],
    engine: draft.engine,
    group: groupFor(draft.changes),
    dependencies: dependenciesFor(draft.changes),
    /* A content mod that adds or retunes anything the player meets is a mod that
     * affects gameplay, and every change the workshop can make does. Saying so
     * is what lets the mod manager warn a player who cares about their score. */
    affectsGameplay: true,
    description: draft.description,
    author: draft.author,
    license: draft.license,
    repository: draft.repository,
  };
  if (draft.fields.length > 0) manifest.fields = [...draft.fields];
  return manifest;
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
  for (const change of draft.changes) {
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
  const merged = mergeBase(basePacks(api, records));
  return project.build(merged);
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

/** The files this draft would write, exactly as the folder reader expects them. */
export function emitDraft(api: AuthoringApi, draft: Draft): readonly EmittedFile[] {
  const project = api.modProject(manifestFor(draft));
  for (const field of draft.fields) project.declareField(field);
  for (const change of draft.changes) {
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
  return project.emit();
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
