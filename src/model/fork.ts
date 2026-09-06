/**
 * Forking: an existing mod becomes a draft that owns its own content.
 *
 * THE DISTINCTION THIS FILE EXISTS TO KEEP is between forking and basing on. The
 * workshop has always been able to build a draft ON TOP OF a pack: the base
 * picker attributes a record to whoever owns it, the draft ships a patch, and the
 * record stays theirs. That is the right shape for adjusting somebody's sword and
 * the wrong shape for taking their mod somewhere else, because a patch is nothing
 * without the pack it patches. A fork is the other thing: the records become the
 * fork's own `add` changes, the composer attributes them to the fork's id, and
 * the result stands on its own with the source mod uninstalled.
 *
 * SO A FORK NEEDS AN ID OF ITS OWN, and it is refused without one. The game
 * treats id as identity - an install pins it, a save refers to it, a dependency
 * names it - so a fork that kept the source's id would not be a second mod, it
 * would be a competing copy of the first one, and whichever of them installed
 * last would win with nothing said.
 *
 * AND A REPOSITORY OF ITS OWN, which is the less obvious half. An install pins a
 * mod's origin on first import and the update check later asks that repository
 * for its tags, so a fork that carried the source's `repository` string would
 * point somebody's copy of the fork at a stranger's releases. `newDraft` refuses
 * to invent a plausible URL for exactly this reason; a fork must not inherit one
 * either. The source's address is kept as provenance instead, where it says who
 * this came from without claiming to be them.
 *
 * WHAT IT DOES NOT PROMISE is the source mod's authoring history. A mod's folder
 * is its content, not the gestures that produced it: a `fieldPatches` entry comes
 * back as a patch because that is what the file says, and a hand-written
 * `replaces` block comes back as an opaque replacement because that is what the
 * file says too. The fork reproduces what the mod DOES. It does not reconstruct
 * what its author clicked.
 */

import type { AuthoringApi, ComposedRecords, JsonRecord, JsonValue } from "../host/authoring.js";
import type { Draft } from "./draft.js";
import { ID_RE, newDraft } from "./draft.js";
import { isBinary, MANIFEST, writeFileBytes, writeFileText } from "./files.js";
import { refFor } from "./refs.js";

/** Which of the intake routes a fork came in through. */
export type ForkSource = "installed" | "file";

/** A mod's folder: every path it carries, and what is in each one. */
export type ForkFolder = Readonly<Record<string, string | Uint8Array>>;

/**
 * The manifest key a fork records its origin under.
 *
 * IN THE MANIFEST RATHER THAN BESIDE IT, because a fork that only remembered
 * where it came from inside this install would forget the moment it was saved as
 * a file, which is the point at which somebody else starts reading it. The game's
 * validator passes a key it does not model through untouched, so this is a real
 * line in a real file that travels with the mod - and, being an ordinary
 * unmodelled key, the file editor round-trips it and an author who disagrees can
 * delete it.
 */
export const FORKED_FROM = "forkedFrom";

/** What a fork records about the mod it was taken from. */
export interface ForkOrigin {
  readonly source: ForkSource;
  /** The source mod's id. Always known: a fork with no named source is refused. */
  readonly id: string;
  readonly version?: string;
  /** The source's author, kept here because the fork's own author is not them. */
  readonly author?: string;
  /** The source's repository, kept here because the fork must not inherit it. */
  readonly repository?: string;
}

/**
 * What one fork produced.
 *
 * `notes` is never decoration. Every sentence in it is something the fork could
 * not carry or had to change, and a fork whose differences from its source are
 * not said out loud is a fork somebody will ship believing it is a copy.
 */
export type ForkOutcome =
  | { readonly ok: true; readonly draft: Draft; readonly notes: readonly string[] }
  | { readonly ok: false; readonly why: string };

export interface ForkOptions {
  /** The fork's own id. Refused when it is the source's. */
  readonly id: string;
  readonly engine: string;
  readonly now: string;
  readonly source: ForkSource;
  /**
   * The source mod's id, for a folder that carries no manifest.
   *
   * The installed route is the whole of that case: a composed record names the
   * pack that owns it and no manifest comes with it, so the id is the one thing
   * about the source that IS known and it is known from outside the folder.
   */
  readonly sourceId?: string;
}

/**
 * Turn a mod's folder into a draft of one's own.
 *
 * THE RECORD FILES ARE WRITTEN BEFORE THE MANIFEST, and the order is load-bearing
 * rather than tidy. `writeFileText` keeps a manifest key the workshop DERIVES
 * only when the author's value differs from what the workshop would write, and it
 * decides that against the draft as it stands at that moment. Writing the
 * manifest into an empty draft would find `dependencies: {}` and `group: tweaks`,
 * disagree with every line the source manifest actually says, and freeze all of
 * them as deliberate overrides - which is exactly the staleness `writeManifest`
 * warns about, since a frozen `dependencies` goes wrong the first time the fork
 * patches something new. Written last, the comparison is against the real
 * content and a derived key that still agrees is left derived.
 */
export function forkDraft(api: AuthoringApi, folder: ForkFolder, options: ForkOptions): ForkOutcome {
  if (!ID_RE.test(options.id)) {
    return { ok: false, why: "A fork needs an id that is lower case, starts with a letter, and uses only letters, digits and hyphens." };
  }

  const rooted = rootFolder(folder);
  const manifestText = rooted[MANIFEST];
  if (manifestText !== undefined && isBinary(manifestText)) {
    return { ok: false, why: "That folder's manifest.json is not text, so it is not a mod folder." };
  }

  let manifest: JsonRecord | undefined;
  if (manifestText !== undefined) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(manifestText);
    } catch (e) {
      return { ok: false, why: `That mod's manifest.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, why: "That mod's manifest.json is not a JSON object, so it is not a manifest." };
    }
    manifest = parsed as JsonRecord;
  }

  const sourceId = stringAt(manifest, "id") ?? options.sourceId;
  if (sourceId === undefined || sourceId === "") {
    return {
      ok: false,
      why: "There is no manifest.json with an id in that folder, so there is no mod there to fork. A mod folder has manifest.json at its root.",
    };
  }
  if (sourceId === options.id) {
    return {
      ok: false,
      why:
        `A fork needs an id of its own, and "${sourceId}" is the mod being forked. The game treats an id as an ` +
        `identity, so two mods sharing one would install over each other rather than sit side by side.`,
    };
  }

  const notes: string[] = [];
  let draft = newDraft(options.id, options.engine, options.now);

  const paths = Object.keys(rooted)
    .filter((path) => path !== MANIFEST)
    .sort();
  let carried = 0;
  for (const path of paths) {
    const contents = rooted[path];
    if (contents === undefined) continue;
    const outcome = isBinary(contents)
      ? writeFileBytes(api, draft, path, contents)
      : writeFileText(api, draft, path, contents);
    if (!outcome.ok) return { ok: false, why: `${path} could not be read: ${outcome.why}` };
    draft = outcome.draft;
    carried++;
  }
  if (carried === 0 && manifest === undefined) {
    return { ok: false, why: `${sourceId} has nothing in the running game that can be forked.` };
  }

  if (manifest !== undefined) {
    /* THREE KEYS ARE DELIBERATELY NOT CARRIED. `id` is the fork's own identity and
     * is already set. `repository` would point the update check at the source's
     * releases. `author` would credit the source's author with whatever the fork
     * goes on to do, which is the opposite of what preserving attribution means. */
    const { id: _id, repository: _repository, author: _author, ...rest } = manifest;
    const text = `${JSON.stringify({ ...rest, [FORKED_FROM]: originOf(options.source, sourceId, manifest) }, null, 2)}\n`;
    const outcome = writeFileText(api, draft, MANIFEST, text);
    if (!outcome.ok) return { ok: false, why: `That mod's manifest.json could not be read: ${outcome.why}` };
    draft = outcome.draft;
  } else {
    draft = {
      ...draft,
      manifestExtras: { ...(draft.manifestExtras ?? {}), [FORKED_FROM]: originOf(options.source, sourceId, undefined) },
    };
  }

  notes.push(...differences(sourceId, manifest, options.source));
  return { ok: true, draft, notes };
}

/** The origin as it is written into the manifest, with nothing unknown in it. */
function originOf(source: ForkSource, id: string, manifest: JsonRecord | undefined): ForkOrigin {
  const version = stringAt(manifest, "version");
  const author = stringAt(manifest, "author");
  const repository = stringAt(manifest, "repository");
  return {
    source,
    id,
    ...(version === undefined ? {} : { version }),
    ...(author === undefined ? {} : { author }),
    ...(repository === undefined ? {} : { repository }),
  };
}

/** Everything the fork changed or could not carry, as sentences. */
function differences(sourceId: string, manifest: JsonRecord | undefined, source: ForkSource): string[] {
  const notes: string[] = [
    `This is a fork of ${sourceId}. Its manifest records where it came from, so the original keeps its credit.`,
    "The repository is your own local address rather than the original's, because an install pins a mod's origin and the update check would otherwise ask somebody else for your releases.",
  ];
  if (manifest === undefined) {
    notes.push(
      `Nothing here can read ${sourceId}'s manifest, so this fork has none of its name, description, author or ` +
        `licence. Set the licence on the details screen before you share it: forking somebody's content does not ` +
        `come with permission to relicense it.`,
    );
    return notes;
  }
  const license = stringAt(manifest, "license");
  notes.push(
    license === undefined
      ? `${sourceId} declares no licence, so nothing says what you may do with its content. Ask its author before you share this.`
      : `${sourceId} is licensed ${license}, and the fork carries that licence because it carries that content.`,
  );
  if (stringAt(manifest, "author") !== undefined) notes.push("The author field is blank, because the fork's author is you.");
  if (source === "file") notes.push("The name still says the original's, which is worth changing before anybody sees both at once.");
  return notes;
}

/** One file out of an archive or off a disk, before anything has read it. */
export interface RawFile {
  readonly path: string;
  readonly contents: string | Uint8Array;
}

/**
 * The folder those files make, with text read as text and everything else kept
 * as bytes.
 *
 * DECIDED BY DECODING, NOT BY EXTENSION. A list of text extensions is a list that
 * is wrong for the first mod that ships a `.cfg`, and getting it wrong in the
 * direction of "bytes" would mean `monster.json` arriving as an opaque blob the
 * workshop cannot read. So the bytes are decoded as strict UTF-8 and kept as
 * bytes only when that fails, which is what a tile, a font or a sound does on its
 * first invalid sequence.
 *
 * NOTHING IS RISKED BY GUESSING TEXT. A byte sequence that decodes as UTF-8
 * re-encodes to exactly itself, and the emitter writes a string entry as UTF-8,
 * so a binary file that happened to be valid text still ships byte for byte.
 */
export function folderFromFiles(files: readonly RawFile[]): ForkFolder {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const out: Record<string, string | Uint8Array> = {};
  for (const file of files) {
    if (typeof file.contents === "string") {
      out[file.path] = file.contents;
      continue;
    }
    try {
      out[file.path] = decoder.decode(file.contents);
    } catch {
      out[file.path] = file.contents;
    }
  }
  return out;
}

/**
 * The folder, re-rooted on whichever level actually holds the manifest.
 *
 * A ZIP OF A MOD IS USUALLY A ZIP OF A FOLDER, and a folder picked from disk
 * always reports its own name in front of every path. The mod importer accepts a
 * manifest at the root or one level down for the same reason, so this is the same
 * allowance rather than a second one. Nothing deeper is looked at: two levels
 * down is an archive of somebody's mods directory, and picking one of them is a
 * choice this cannot make.
 */
export function rootFolder(folder: ForkFolder): ForkFolder {
  if (folder[MANIFEST] !== undefined) return folder;
  const prefixes = Object.keys(folder)
    .filter((path) => path.endsWith(`/${MANIFEST}`) && path.split("/").length === 2)
    .map((path) => path.slice(0, -MANIFEST.length));
  const prefix = prefixes[0];
  if (prefix === undefined || prefixes.length > 1) return folder;
  const out: Record<string, string | Uint8Array> = {};
  for (const [path, contents] of Object.entries(folder)) {
    if (!path.startsWith(prefix)) continue;
    out[path.slice(prefix.length)] = contents;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Forking a mod that is already installed                             *
 * ------------------------------------------------------------------ */

/** One pack the running game composed, and how much of it a fork could take. */
export interface InstalledMod {
  readonly id: string;
  /** Records it added, which a fork takes outright. */
  readonly adds: number;
  /** Records it adjusts on its own, which a fork takes as replacements. */
  readonly adjusts: number;
  /**
   * Records it adjusts that another mod adjusts as well.
   *
   * A composed record carries the result of every pack that touched it and not
   * one entry per pack, so where two mods adjusted the same record there is no
   * way to tell whose change is whose. Counted rather than guessed at, and said
   * on the screen before the fork is taken.
   */
  readonly shared: number;
}

/**
 * Every mod whose content the running game is carrying, from provenance alone.
 *
 * NO LIST OF INSTALLED MODS IS NEEDED, and none is available: a composed record
 * names the pack that owns it and the packs that have touched it, so the set of
 * mods in the game is exactly the set of names those stamps carry. What that
 * cannot give is anything a manifest says, which is why a fork taken this way
 * arrives without the source's name, licence or author. See `docs/ENGINE_SEAMS.md`.
 */
export function installedMods(api: AuthoringApi, records: ComposedRecords): readonly InstalledMod[] {
  const tally = new Map<string, { adds: number; adjusts: number; shared: number }>();
  const of = (id: string): { adds: number; adjusts: number; shared: number } => {
    const found = tally.get(id);
    if (found) return found;
    const fresh = { adds: 0, adjusts: 0, shared: 0 };
    tally.set(id, fresh);
    return fresh;
  };
  for (const list of Object.values(records)) {
    for (const record of list) {
      const provenance = api.provenanceOf(record);
      if (!provenance) continue;
      if (provenance.owner !== BASE) of(provenance.owner).adds++;
      const modifiers = provenance.modifiedBy ?? [];
      for (const id of modifiers) {
        if (id === provenance.owner) continue;
        if (modifiers.length === 1) of(id).adjusts++;
        else of(id).shared++;
      }
    }
  }
  return [...tally.entries()]
    .map(([id, counts]) => ({ id, ...counts }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** The pack id the composer treats as the base game, which is nobody's to fork. */
const BASE = "core";

/**
 * One installed mod's content, back in the shape a mod folder writes it.
 *
 * A RECORD IT OWNS IS RESTORED BEFORE IT IS COPIED. What is in the composed set
 * is that record with every later pack's patches already on it, so copying one
 * straight would ship another mod's balance changes inside this fork. The
 * provenance stamp carries the owner's own values for whatever composition
 * changed, so spreading those back gives the record as this mod actually shipped
 * it. A field a patch INVENTED is not in that stamp and does survive, which is
 * the one seam left in the restore and is worth knowing rather than hiding.
 *
 * A RECORD IT MERELY ADJUSTS BECOMES A REPLACEMENT, and only when no other mod
 * adjusted it too. The composed value is the sum of every patch that landed, so
 * where two mods both touched a record there is no honest way to take one of
 * their contributions; those are left out and counted.
 */
export function folderFromInstalled(
  api: AuthoringApi,
  records: ComposedRecords,
  owner: string,
): { readonly folder: ForkFolder; readonly notes: readonly string[] } {
  const byFile = new Map<string, { records: JsonRecord[]; replaces: Record<string, JsonRecord> }>();
  const of = (file: string): { records: JsonRecord[]; replaces: Record<string, JsonRecord> } => {
    const found = byFile.get(file);
    if (found) return found;
    const fresh = { records: [] as JsonRecord[], replaces: {} as Record<string, JsonRecord> };
    byFile.set(file, fresh);
    return fresh;
  };

  let restored = 0;
  let shared = 0;
  let unaddressable = 0;
  for (const [file, list] of Object.entries(records)) {
    for (const record of list) {
      const provenance = api.provenanceOf(record);
      if (!provenance) continue;
      if (provenance.owner === owner) {
        const own = { ...record, ...(provenance.was ?? {}) };
        if (provenance.was !== undefined) restored++;
        of(file).records.push(withoutProvenance(api, own));
        continue;
      }
      const modifiers = provenance.modifiedBy ?? [];
      if (!modifiers.includes(owner)) continue;
      if (modifiers.length > 1) {
        shared++;
        continue;
      }
      const key = api.recordKey(file, record);
      if (key === null) {
        unaddressable++;
        continue;
      }
      of(file).replaces[refFor(provenance.owner, key)] = withoutProvenance(api, record);
    }
  }

  const folder: Record<string, string> = {};
  for (const [file, contribution] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const body: Record<string, unknown> = {};
    if (contribution.records.length > 0) body["records"] = contribution.records;
    if (Object.keys(contribution.replaces).length > 0) body["replaces"] = contribution.replaces;
    if (Object.keys(body).length === 0) continue;
    folder[`${file}.json`] = `${JSON.stringify(body, null, 2)}\n`;
  }

  const notes: string[] = [];
  if (restored > 0) {
    notes.push(
      `${restored} of ${owner}'s own records had been adjusted by another mod in this game, and the fork takes ` +
        `${owner}'s version of them rather than the adjusted one.`,
    );
  }
  if (shared > 0) {
    notes.push(
      `${shared} record${shared === 1 ? "" : "s"} that ${owner} adjusts ${shared === 1 ? "is" : "are"} adjusted ` +
        `by another mod as well. A composed record carries the result rather than one entry per mod, so there is ` +
        `no way to take ${owner}'s share of it and ${shared === 1 ? "it is" : "they are"} left out.`,
    );
  }
  if (unaddressable > 0) {
    notes.push(
      `${unaddressable} record${unaddressable === 1 ? "" : "s"} ${owner} adjusts cannot be named by a reference, ` +
        `so ${unaddressable === 1 ? "it is" : "they are"} left out.`,
    );
  }
  return { folder, notes };
}

/**
 * Fork a mod the running game already has.
 *
 * The two halves are separate functions on purpose: reading the game's records is
 * the part that depends on provenance, and turning a folder into a draft is the
 * part every intake route shares. Keeping them apart is what stops the installed
 * route from growing its own quietly different idea of what a fork is.
 */
export function forkInstalled(
  api: AuthoringApi,
  records: ComposedRecords,
  owner: string,
  options: Omit<ForkOptions, "source" | "sourceId">,
): ForkOutcome {
  const read = folderFromInstalled(api, records, owner);
  const outcome = forkDraft(api, read.folder, { ...options, source: "installed", sourceId: owner });
  if (!outcome.ok) return outcome;
  return { ok: true, draft: outcome.draft, notes: [...outcome.notes, ...read.notes] };
}

/** The record without the stamp saying who composed it. A fork's records are its own. */
function withoutProvenance(api: AuthoringApi, record: JsonRecord): JsonRecord {
  const { [api.PROVENANCE_KEY]: _stamp, ...rest } = record;
  return rest;
}

function stringAt(record: JsonRecord | undefined, key: string): string | undefined {
  const value: JsonValue | undefined = record?.[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}
