/**
 * Putting a thing in front of you, to look at it.
 *
 * THE NARROWEST USEFUL VERSION OF THIS FEATURE, deliberately. It spawns records
 * that are ALREADY in the composed game and nothing else: it never spawns from an
 * unfinished draft, and it never asks the engine to recompose content while a game
 * is running. That is not timidity. Recomposing under a live game can invalidate
 * references held by monsters and objects already on the level and by the
 * generation code, and the payoff would be small, because enabling a mod reloads
 * the process anyway. So the loop is build, install, reload, spawn, and the reload
 * was never optional.
 *
 * WHICH LEAVES IT USEFUL BEFORE THERE IS ANYTHING TO TEST, which is the half that
 * is easy to miss. The base picker offers "look at it" on the record you are about
 * to copy, so the question "what is a Studded Leather Armour actually like" is
 * answered by going and holding one rather than by reading its numbers.
 *
 * EVERY COMMAND HERE IS THE GAME'S OWN. `wizSummonNamed` and `wizCreateObj` are
 * exported from core and are what the game's own debug menu calls. The workshop
 * resolves a name to the race or the kind index and passes the game's own
 * dependencies straight back in. Nothing is reimplemented, which is why an
 * artifact cannot be created twice by this route and why a spawned object is
 * stamped as a cheat by the same code that stamps the debug menu's.
 */

import type { CoreApi, RegistriesLike, WizardDepsLike } from "./context.js";

export type SpawnKind = "monster" | "object";

export interface SpawnOutcome {
  readonly ok: boolean;
  /** One sentence for the status line, whichever way it went. */
  readonly says: string;
}

/**
 * The shape of the two core functions the workshop calls.
 *
 * Declared structurally rather than by importing core's own types, so this file
 * compiles in a repository with no copy of the engine and so what the workshop
 * touches is written down where somebody can read it.
 */
interface SpawnCore {
  wizSummonNamed?: (state: unknown, params: { race: unknown }, deps: unknown) => boolean;
  wizCreateObj?: (state: unknown, params: { index: number }, deps: unknown) => boolean;
}

/** Find a bound monster race by name, case-insensitively. */
export function raceByName(registries: RegistriesLike | undefined, name: string): unknown | undefined {
  const wanted = name.trim().toLowerCase();
  for (const race of registries?.monsters?.races ?? []) {
    if (typeof race.name === "string" && race.name.toLowerCase() === wanted) return race;
  }
  return undefined;
}

/**
 * Find a bound object kind's INDEX by name.
 *
 * The index rather than the kind, because `wizCreateObj` takes an index into the
 * registry's own array and prints its own refusal when it is out of range. Using
 * the game's own accessor keeps the workshop from having a second opinion about
 * what a valid kind is.
 */
export function kindIndexByName(registries: RegistriesLike | undefined, name: string): number | undefined {
  const wanted = name.trim().toLowerCase();
  const kinds = registries?.objects?.kinds ?? [];
  for (let index = 0; index < kinds.length; index++) {
    const kind = kinds[index];
    if (kind && typeof kind.name === "string" && kind.name.toLowerCase() === wanted) return index;
  }
  return undefined;
}

/** Every name that can be spawned, for the picker. */
export function spawnable(registries: RegistriesLike | undefined, kind: SpawnKind): readonly string[] {
  const source = kind === "monster" ? (registries?.monsters?.races ?? []) : (registries?.objects?.kinds ?? []);
  const out: string[] = [];
  for (const entry of source) {
    if (entry && typeof entry.name === "string" && entry.name !== "") out.push(entry.name);
  }
  return out;
}

/** Spawn one thing by name. Never throws: a failure is a sentence. */
export function spawnByName(
  core: CoreApi,
  state: object,
  deps: WizardDepsLike,
  registries: RegistriesLike | undefined,
  kind: SpawnKind,
  name: string,
): SpawnOutcome {
  const api = core as unknown as SpawnCore;
  try {
    if (kind === "monster") {
      const race = raceByName(registries, name);
      if (race === undefined) {
        return { ok: false, says: `Nothing loaded is called "${name}". A record you have not installed yet is not in the game.` };
      }
      if (typeof api.wizSummonNamed !== "function") {
        return { ok: false, says: "This game does not have the summon command the workshop needs." };
      }
      const placed = api.wizSummonNamed(state, { race }, deps);
      return placed
        ? { ok: true, says: `${name} is beside you.` }
        : { ok: false, says: `There was nowhere next to you to put ${name}. Try again somewhere with more room.` };
    }
    const index = kindIndexByName(registries, name);
    if (index === undefined) {
      return { ok: false, says: `Nothing loaded is called "${name}". A record you have not installed yet is not in the game.` };
    }
    if (typeof api.wizCreateObj !== "function") {
      return { ok: false, says: "This game does not have the create-object command the workshop needs." };
    }
    const made = api.wizCreateObj(state, { index }, deps);
    return made
      ? { ok: true, says: `${name} is on the floor where you are standing.` }
      : { ok: false, says: `The game refused to make ${name}.` };
  } catch (e) {
    /* A throw out of a debug command is the game's problem, not something to
     * hide: the workshop says what happened and stays open. */
    return { ok: false, says: `That went wrong inside the game: ${String(e)}` };
  }
}
