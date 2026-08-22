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
import type {
  BuilderCtx,
  InstallModResult,
  SessionModResult,
  WizardApi,
} from "./context.js";
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

/**
 * The debug commands, when this game lends them.
 *
 * `api` is present whenever the seam is, including when it is unavailable for a
 * reason the panel can act on - so a disabled Test panel can still fill its
 * browser in from `catalogue()`, which is deliberately readable before anything is
 * consented to. Deciding what to test is how a player decides whether to detach at
 * all.
 */
export interface WizardSeam extends SeamState {
  readonly api?: WizardApi;
}

export interface SessionSeam extends SeamState {
  load(bytes: Uint8Array): Promise<SessionModResult>;
  reload(): void;
  /** True when reloading has to be done by hand because nothing here can do it. */
  readonly reloadByHand: boolean;
}

export interface Seams {
  readonly authoring: AuthoringSeam;
  readonly install: InstallSeam;
  readonly session: SessionSeam;
  readonly wizard: WizardSeam;
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

const NO_SESSION =
  "This game has no way to load a mod for one session, so trying one means installing it: the workshop saves " +
  "the finished mod as a file, you add it with Import a zip on the Mods screen, turn it on and reload. That " +
  "leaves the mod in your library, which is where you want it once it is finished anyway.";

const NO_WIZARD_SEAM =
  "This game cannot lend the workshop its debug commands, so nothing can be put in front of you and nowhere can " +
  "be jumped to. Forge the mod, try it for the session, reload, and go and find the thing yourself.";

const WIZARD_OFF = 'The "Let me test what I built" setting is off for this mod. Turn it on in the mod manager.';

const NO_GAME = "There is no character in play, so there is nothing to test with.";

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

  /**
   * RELOADING IS NOT A SEAM AND NEVER WAS, which is why this no longer waits for
   * one. A plugin's code runs in the page and can reach `location` with or without
   * anybody's permission, so `reloadByHand: true` was reporting a restriction that
   * did not exist, and the workshop was asking the player to press Ctrl-R for a
   * thing it could have done itself. `ctx.reload` is honoured first so a test or a
   * headless host can supply its own; `location.reload` otherwise; and only a front
   * end with neither is genuinely by hand.
   */
  const reload = resolveReload(ctx);

  const stager = ctx.loadModForSession;
  const session: SessionSeam = stager
    ? { available: true, load: stager, reload: reload ?? ((): void => undefined), reloadByHand: reload === null }
    : {
        available: false,
        why: NO_SESSION,
        load: async () => ({ ok: false as const, problem: NO_SESSION }),
        reload: (): void => undefined,
        reloadByHand: true,
      };

  return { authoring, install, session, wizard: resolveWizard(ctx), engine: ctx.engine };
}

/**
 * The debug commands, or the reason there are none.
 *
 * THE ORDER OF THE REFUSALS IS THE POINT. A control that is off because this game
 * has no such seam, one that is off because the player did not grant the
 * capability, and one that is off because nobody is playing are three situations
 * with three different next actions. Telling them apart is the difference between
 * a tool and a shrug.
 *
 * THERE IS NO "not marked yet" REFUSAL ANY MORE, and its absence is the change
 * worth reading. The old seam handed over the game's raw debug dependencies, whose
 * commands are gated on a permanent mark the workshop refused to take on anybody's
 * behalf - correctly, because the mark cost the character its place on the high
 * score list forever. The seam now cuts the session loose from its save first and
 * takes the mark on a character that has already stopped being written down, so
 * there is nothing left to refuse on somebody's behalf. What the panel asks about
 * instead is the session, which is a smaller thing to spend and is spent in the
 * open.
 *
 * `api` is carried on the unavailable arms too, wherever there is one, because the
 * catalogue is readable before anything is consented to and the panel fills its
 * browser in from it. Deciding what to test is how a player decides whether to
 * detach at all.
 */
function resolveWizard(ctx: BuilderCtx): WizardSeam {
  if (ctx.flags[FLAG.cheatSpawn] !== true) return { available: false, why: WIZARD_OFF };
  if (ctx.wizard === undefined) return { available: false, why: NO_WIZARD_SEAM };
  if (ctx.state === undefined) return { available: false, why: NO_GAME, api: ctx.wizard };
  return { available: true, api: ctx.wizard };
}

/** Whatever this front end can reload with, or null when it has nothing. */
function resolveReload(ctx: BuilderCtx): (() => void) | null {
  if (ctx.reload !== undefined) return ctx.reload;
  const loc = (globalThis as { location?: { reload?: () => void } }).location;
  if (typeof loc?.reload === "function") return () => loc.reload?.();
  return null;
}
