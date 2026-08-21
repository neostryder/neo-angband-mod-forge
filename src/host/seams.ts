/**
 * One place that decides what this install can actually do.
 *
 * Every seam in `docs/ENGINE_SEAMS.md` is read here and nowhere else, and each
 * one resolves to a triple: whether it is real, what to call, and one sentence
 * saying why it is not real when it is not. Two things fall out of that.
 *
 * A SCREEN NEVER TESTS FOR A SEAM. It reads `seams.spawn.available` and
 * `seams.spawn.why`, so a seam landing changes this file and nothing else, and a
 * disabled control can always say which of the three reasons applies rather than
 * being mysteriously grey.
 *
 * AND THE REASON IS NEVER "not supported". A control that is off because the
 * engine has no seam, a control that is off because the player did not grant the
 * capability, and a control that is off because there is no game running are
 * three different situations with three different next actions, and telling them
 * apart is the difference between a tool and a shrug.
 */

import type { AuthoringApi, ComposedRecords } from "./authoring.js";
import { STUB_AUTHORING } from "./authoring-stub.js";
import { STUB_RECORDS } from "./stub-content.js";
import type { BuilderCtx, InstallModResult, WizardDepsLike } from "./context.js";
import { FLAG } from "./context.js";

/** Whether a capability is real, and the sentence to show when it is not. */
export interface SeamState {
  readonly available: boolean;
  /** Present exactly when `available` is false. One sentence, player-facing. */
  readonly why?: string;
}

export interface AuthoringSeam extends SeamState {
  readonly api: AuthoringApi;
  readonly records: ComposedRecords;
  /**
   * True when the numbers on screen come from the workshop's own fixture rather
   * than from the game. The banner that says so is not dismissible.
   */
  readonly demonstration: boolean;
}

export interface InstallSeam extends SeamState {
  install(bytes: Uint8Array): Promise<InstallModResult>;
  reload(): Promise<void>;
  /** True when reloading has to be done by hand because there is no seam for it. */
  readonly reloadByHand: boolean;
}

export interface SpawnSeam extends SeamState {
  readonly deps?: WizardDepsLike;
  readonly state?: object;
}

export interface Seams {
  readonly authoring: AuthoringSeam;
  readonly install: InstallSeam;
  readonly spawn: SpawnSeam;
  /** The engine version string, for the range an emitted mod declares. */
  readonly engine: string;
}

const NO_AUTHORING =
  "This game cannot hand the workshop its authoring library yet, so every number below is measured from " +
  "the workshop's own demonstration content instead of from the game.";

const NO_RECORDS =
  "This game cannot hand the workshop its own content yet, so the records you can base something on are " +
  "the workshop's demonstration set rather than the real game's.";

const NO_INSTALL =
  "This game has no way for a mod to install another mod, so the workshop saves the finished mod as a file " +
  "and you add it with Import a zip on the Mods screen. That path is two extra steps and leaves you holding " +
  "a file you can read, keep and share.";

const NO_SPAWN_SEAM =
  "This game cannot lend the workshop its spawning machinery yet, so nothing can be put in front of you for " +
  "testing. Build the mod, install it, reload, and go and find the thing.";

const SPAWN_OFF = 'The "Let me spawn what I built" setting is off for this mod. Turn it on in the mod manager.';

const NO_GAME = "There is no character in play, so there is nowhere to put anything.";

const NO_MARK =
  "This character has not taken Angband's debug mark, and every one of these commands is gated on it. Taking it " +
  "is permanent and it bars the character from the high score list for the rest of its life, so the workshop will " +
  "not take it for you: turn debug commands on yourself, on a character you do not mind marking.";

/** Read every seam off one context. Pure: it calls nothing. */
export function resolveSeams(ctx: BuilderCtx): Seams {
  const realApi = ctx.authoring;
  const realRecords = ctx.composedRecords;

  const authoring: AuthoringSeam = realApi
    ? realRecords
      ? { available: true, api: realApi, records: realRecords, demonstration: false }
      : { available: false, why: NO_RECORDS, api: realApi, records: STUB_RECORDS, demonstration: true }
    : { available: false, why: NO_AUTHORING, api: STUB_AUTHORING, records: realRecords ?? STUB_RECORDS, demonstration: true };

  const installer = ctx.installMod;
  const reloader = ctx.reloadGame;
  const install: InstallSeam = installer
    ? {
        available: true,
        install: installer,
        reload: reloader ?? (async () => undefined),
        reloadByHand: reloader === undefined,
      }
    : {
        available: false,
        why: NO_INSTALL,
        install: async () => ({
          ok: false as const,
          problem: NO_INSTALL,
          lines: [NO_INSTALL],
        }),
        reload: async () => undefined,
        reloadByHand: true,
      };

  const spawn = resolveSpawn(ctx);

  return { authoring, install, spawn, engine: ctx.engine };
}

function resolveSpawn(ctx: BuilderCtx): SpawnSeam {
  if (ctx.flags[FLAG.cheatSpawn] !== true) return { available: false, why: SPAWN_OFF };
  if (ctx.wizard === undefined) return { available: false, why: NO_SPAWN_SEAM };
  if (ctx.state === undefined) return { available: false, why: NO_GAME };
  if (ctx.wizard.debug !== true) return { available: false, why: NO_MARK, deps: ctx.wizard, state: ctx.state };
  return { available: true, deps: ctx.wizard, state: ctx.state };
}
