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

/**
 * The game's own wired debug dependencies, all but opaque here.
 *
 * Opaque on purpose, with exactly one field read. The workshop passes this
 * straight back into the `wiz*` functions on `ctx.core` and reaches inside it for
 * nothing else, because the one thing that makes the seam correct is that it is
 * the game's instances by identity: `makeDeps.artifacts` must be the single
 * `ArtifactState` the game owns, or an artifact can be created twice. A mod that
 * read fields off it would be one refactor away from rebuilding it.
 *
 * `debug` is the exception, and it is read rather than passed because it is the
 * difference between a control that is off and a control that lies. Every one of
 * those functions is gated on it, it comes from the character's persisted
 * NOSCORE.DEBUG bit rather than from wizard mode, and a character that has never
 * taken that mark cannot spawn anything. Saying so is better than a button that
 * does nothing.
 */
export interface WizardDepsLike {
  readonly debug: boolean;
  readonly [key: string]: unknown;
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
  /** Seam 3. Save and reload, so an install takes effect. Gated by `mod:install`. */
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
  /** Seam 4. The game's wired debug dependencies. Gated by `debug:spawn`. */
  readonly wizard?: WizardDepsLike;
}

/** The three rule flags this mod declares, by name, in one place. */
export const FLAG = {
  showTab: "builder.showTab",
  keepDrafts: "builder.keepDrafts",
  cheatSpawn: "builder.cheatSpawn",
} as const;
