/**
 * What this mod needs from the host, declared structurally.
 *
 * Declared here rather than imported from the game's `mod-plugin.ts` for the
 * same reason every mod in this family declares its own: this file has to
 * compile in a standalone repository that has no copy of the host. A structural
 * subset also states exactly what the mod touches, which is the honest form of
 * "the mod uses no private path".
 *
 * FIVE MEMBERS HERE MAY NOT EXIST. `authoring`, `composedRecords`, `installMod`,
 * `loadModForSession` and `wizard` are the seams in `docs/ENGINE_SEAMS.md`, and
 * every one of them is optional in this interface because every one of them is
 * genuinely absent on some engine this mod runs on. Nothing reads them directly:
 * `seams.ts` resolves each to either the real thing or a named fallback, so a
 * seam landing changes one file.
 */

import type { AuthoringApi, JsonRecord } from "./authoring.js";

/** The engine, as a type. Type-only syntax, so the built plugin.js has no import. */
export type CoreApi = typeof import("@rpgm-tools/neo-angband-core");

/** One JSON value, as the record files carry them. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/**
 * The bound content registries, structurally, narrowed to what the workshop
 * reads.
 *
 * The workshop reads these for two things only: resolving a name to the live
 * `ridx` or `kidx` a spawn needs, and telling the player that a record they are
 * about to base something on came from another mod. Everything the AUTHORING
 * side needs is raw JSON and comes from `composedRecords` instead - a bound
 * `MonsterRace` has no `base` field to compare peers on, because `base` was
 * resolved away at bind time.
 */
export interface RegistriesLike {
  readonly monsters?: { readonly races?: readonly { readonly name?: string }[] };
  readonly objects?: { readonly kinds?: readonly { readonly name?: string }[] };
}

/** One JSON value of this mod's own, kept outside every character's save. */
export interface PrefsLike {
  get(): unknown;
  set(value: unknown): void;
}

/**
 * The result of installing a mod from bytes.
 *
 * `lines` is the host's OWN wording, from the same functions a downloaded mod's
 * outcome is written with. A mod built here that fails a requirement has to fail
 * with the same words a downloaded mod fails with, or the player learns two
 * vocabularies for one concept.
 */
export type InstallModResult =
  | { readonly ok: true; readonly id: string; readonly version: string; readonly lines: readonly string[] }
  | { readonly ok: false; readonly problem: string; readonly lines: readonly string[] };

/**
 * The result of loading a mod for this session only.
 *
 * `InstallModResult` plus the one field a caller cannot find out for itself and
 * must not assume: whether the archive will still be there after the reload that
 * applies it. A browser with storage switched off takes the mod for this page and
 * loses it on the way back up, and a workshop that said "reload to try it" in that
 * case would be sending the player round a loop that cannot finish.
 */
export type SessionModResult =
  | {
      readonly ok: true;
      readonly id: string;
      readonly version: string;
      readonly survivesReload: boolean;
    }
  | { readonly ok: false; readonly problem: string };

/** What came of one debug command. `did` is a sentence, ready for the status line. */
export type WizardOutcome =
  | { readonly ok: true; readonly did: string }
  | { readonly ok: false; readonly problem: string };

/** The save a session is still attached to, for naming what is about to stop. */
export interface WizardAttached {
  readonly name: string;
}

/** One record the test panel can offer, and which pack put it in the game. */
export interface WizardEntry {
  readonly name: string;
  readonly index: number;
  readonly level: number;
  /**
   * The pack that ADDED the record, absent when the base game did.
   *
   * This is the field the whole browser is built around. It is how a workshop can
   * put the author's own content at the top without keeping its own list of what
   * vanilla contains, which is a list that would be wrong the first time the game
   * added a monster.
   */
  readonly from?: string;
}

/** Everything the running game has, after this session's mods composed. */
export interface WizardCatalogue {
  readonly items: readonly WizardEntry[];
  readonly creatures: readonly WizardEntry[];
  readonly artifacts: readonly WizardEntry[];
}

/** Where the character is and what it has, for filling the panel's fields in. */
export interface WizardWhere {
  readonly depth: number;
  readonly maxDepth: number;
  readonly level: number;
  readonly experience: number;
  readonly gold: number;
  readonly stats: readonly { readonly name: string; readonly value: number }[];
}

/**
 * The game's debug commands as a surface of METHODS, not as a bag of its internals.
 *
 * THIS IS NOT THE SHAPE THIS SEAM WAS PLANNED AS, and the change is worth reading
 * because it moved a guarantee out of this repository. The plan was for the game to
 * hand over its wired `WizardDeps` bundle so the workshop could pass it back into
 * the `wiz*` functions on `ctx.core` itself. That works, and it puts the player's
 * character behind the workshop's own care: those functions are gated on a `debug`
 * flag in a bag the CALLER assembles, so nothing outside this repository could stop
 * a mistake here from writing a cheated character over one somebody loved.
 *
 * A method surface moves the guarantee to the host, where it can be enforced rather
 * than intended. Every command below refuses until `sandbox()` has cut the session
 * loose from its save slot, and the host checks that on every call. The workshop
 * cannot opt out of it and neither can a bug in the workshop.
 *
 * WHAT IS STILL TRUE is that nothing here is reimplemented. Each method is the
 * function the game's own `^A` menu dispatches to, called through the game's own
 * live dependencies - so an artifact still cannot be created twice by this route,
 * and a spawned object is still stamped as a cheat by the code that stamps the
 * debug menu's.
 */
export interface WizardApi {
  sandboxed(): boolean;
  attached(): WizardAttached | null;
  sandbox(): WizardOutcome;
  catalogue(): WizardCatalogue;
  where(): WizardWhere | null;

  spawnItem(which: number | string, quantity?: number): WizardOutcome;
  spawnCreature(which: number | string, quantity?: number): WizardOutcome;
  spawnArtifact(which: number | string): WizardOutcome;

  goToDepth(depth: number): WizardOutcome;
  grantExperience(amount: number): WizardOutcome;
  setExperience(value: number): WizardOutcome;
  setGold(value: number): WizardOutcome;
  setStat(stat: string, value: number): WizardOutcome;
  maxOut(): WizardOutcome;
  heal(): WizardOutcome;
  rerollLife(): WizardOutcome;

  acquire(quantity: number, great?: boolean): WizardOutcome;
  summonRandom(quantity: number): WizardOutcome;
  banish(range?: number): WizardOutcome;
  killVisible(): WizardOutcome;
  teleport(range: number): WizardOutcome;

  mapLevel(): WizardOutcome;
  lightLevel(): WizardOutcome;
  findCreatures(): WizardOutcome;
  learnItems(upTo?: number): WizardOutcome;
  learnCreatures(): WizardOutcome;
}

/** A live game, narrowed to nothing: the workshop only ever passes it on. */
export type GameStateLike = object;

/** The host's plugin context, narrowed to what this mod reads. */
export interface BuilderCtx {
  readonly id: string;
  readonly engine: string;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly core: CoreApi;
  readonly log?: (msg: string) => void;
  readonly prefs?: PrefsLike;
  readonly state?: GameStateLike;
  readonly registries?: RegistriesLike;

  /** Seam 1. The mod SDK's authoring surface. See docs/ENGINE_SEAMS.md. */
  readonly authoring?: AuthoringApi;
  /** Seam 2. The raw records the running game was composed from. */
  readonly composedRecords?: Readonly<Record<string, readonly JsonRecord[]>>;
  /** Seam 3. Install a mod from the bytes of a zip. Gated by `mod:install`. */
  readonly installMod?: (bytes: Uint8Array) => Promise<InstallModResult>;
  /**
   * Seam 3. Save and reload, so a staged mod takes effect: plugin teardown, autoplayer
   * keyboard handback, character write, session resume. Gated by either `mod:install`
   * or `mod:session` - this mod holds the latter, so a session it staged with
   * `loadModForSession` can be followed by a real reload rather than a bare
   * `location.reload()`.
   */
  readonly reloadGame?: () => Promise<void>;
  /**
   * Seam 5. Load a mod for THIS SESSION only. Gated by `mod:session`.
   *
   * Content only, on the same terms `installMod` is - this is the same door with
   * the library step removed, not a looser one. What it changes is that the pack
   * composes on the next reload without waiting to be switched on, and that the
   * archive is forgotten when the game is closed.
   *
   * What is short-lived is the ARCHIVE. A character the pack changed keeps the
   * change, and next launch, with the pack gone, that character's mod-owned
   * monsters and items belong to something that is not installed. The workshop
   * says so before it stages anything.
   */
  readonly loadModForSession?: (bytes: Uint8Array) => Promise<SessionModResult>;
  /**
   * Seam 4. The game's debug commands. Gated by `debug:wizard`.
   *
   * Every command refuses until `sandbox()` has cut the session loose from its save
   * slot, which cannot be undone. `attached()` names the character that is about to
   * stop being saved, so the workshop can put them in the question it asks.
   */
  readonly wizard?: WizardApi;
  /**
   * Reload the page.
   *
   * NOT A CAPABILITY, and it does not come from the host at all. A plugin's code
   * runs in the page and can reach `location` with or without anybody's permission,
   * so a seam for it would be a formality that reads as a boundary. It is declared
   * here so `seams.ts` can resolve it to the one thing that works on a front end
   * with no `location` (a test, or a headless host), and so the only place the
   * workshop navigates from is one function with a name.
   */
  readonly reload?: () => void;
}

/** The three rule flags this mod declares, by name, in one place. */
export const FLAG = {
  showTab: "builder.showTab",
  keepDrafts: "builder.keepDrafts",
  cheatSpawn: "builder.cheatSpawn",
} as const;
