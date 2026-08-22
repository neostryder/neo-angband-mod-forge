/**
 * Ordering a catalogue so the author's own work is at the top.
 *
 * WHAT THIS FILE USED TO BE, because the change is the whole story. It used to
 * resolve a name to a registry index and call the game's `wiz*` functions itself,
 * passing back the raw debug dependency bundle the host handed over. That worked,
 * and it put the player's character behind this repository's own care: those
 * functions are gated on a flag in a bag the CALLER assembles, so nothing outside
 * this file could stop a mistake in it from writing a cheated character over one
 * somebody loved.
 *
 * The host now offers the commands as methods and refuses every one of them until
 * the session has been cut loose from its save. So the resolving, the placement and
 * the refusals all moved there, where they can be enforced instead of intended, and
 * what is left here is the one job that is genuinely the workshop's: deciding what
 * order to show things in.
 *
 * AND THAT ORDER IS THE FEATURE. A workshop's user has just written a monster, and
 * the list they need is not six hundred entries with theirs somewhere in it. Every
 * catalogue entry says which pack added it, so the author's own content sorts to the
 * front without this file keeping a list of what the base game contains - a list
 * that would be wrong the first time the game added a monster.
 *
 * WHOSE IS "MINE", though, is not as obvious as it looks. A record the author has
 * only just written is not in the catalogue at all: content composes at load, so
 * what is in the running game is what was there when it started. The pack ids that
 * matter are therefore the ones the running game has - including a draft that was
 * forged and tried for the session, which is exactly the loop this panel exists to
 * close. So "mine" is read off the catalogue rather than off the open draft, and a
 * draft that has never been tried shows nothing and says so.
 */

import type { WizardCatalogue, WizardEntry } from "./context.js";

/** Which of the three lists a row came from. */
export type TestKind = "creature" | "item" | "artifact";

/** One row of the browser: an entry, plus what the panel needs to draw it. */
export interface TestRow {
  readonly kind: TestKind;
  readonly entry: WizardEntry;
  /** True when a pack added this record, rather than the base game. */
  readonly modded: boolean;
}

/** The empty catalogue, for a front end with no game behind it. */
export const NO_CATALOGUE: WizardCatalogue = { items: [], creatures: [], artifacts: [] };

/**
 * Every pack id that put something into the running game, in first-seen order.
 *
 * For the "whose content" filter. First-seen rather than sorted, because the order
 * a player reads is more useful when it matches the order the game composed in than
 * when it is alphabetical for no reason.
 */
export function packsInPlay(catalogue: WizardCatalogue): readonly string[] {
  const seen: string[] = [];
  for (const entry of allEntries(catalogue)) {
    const from = entry.entry.from;
    if (from !== undefined && !seen.includes(from)) seen.push(from);
  }
  return seen;
}

/**
 * The rows to show, filtered and ordered.
 *
 * ORDER: a pack's own records first, then the base game's, and each half by depth
 * then by name. Depth before name because a builder comparing their new monster to
 * its neighbours wants the neighbours, and "what else lives at this depth" is that
 * question; alphabetical order answers a question nobody asked.
 */
export function testRows(
  catalogue: WizardCatalogue,
  opts: {
    readonly kind: TestKind;
    /** Substring match on the name, case-insensitively. Empty matches everything. */
    readonly search?: string;
    /**
     * Show only records from this pack, or every record when absent.
     *
     * Absent is not the same as "the base game": a filter that could not be turned
     * off would hide the thing an author most often wants to test against, which is
     * whatever their record is supposed to resemble.
     */
    readonly pack?: string;
  },
): readonly TestRow[] {
  const needle = (opts.search ?? "").trim().toLowerCase();
  const rows = listFor(catalogue, opts.kind).filter((row) => {
    if (opts.pack !== undefined && row.entry.from !== opts.pack) return false;
    return needle === "" || row.entry.name.toLowerCase().includes(needle);
  });
  return rows.slice().sort(compareRows);
}

/** Mod content first, then by depth, then by name. */
function compareRows(a: TestRow, b: TestRow): number {
  if (a.modded !== b.modded) return a.modded ? -1 : 1;
  if (a.entry.level !== b.entry.level) return a.entry.level - b.entry.level;
  return a.entry.name.localeCompare(b.entry.name);
}

function listFor(catalogue: WizardCatalogue, kind: TestKind): readonly TestRow[] {
  const source =
    kind === "creature"
      ? catalogue.creatures
      : kind === "item"
        ? catalogue.items
        : catalogue.artifacts;
  return source.map((entry) => ({ kind, entry, modded: entry.from !== undefined }));
}

function allEntries(catalogue: WizardCatalogue): readonly TestRow[] {
  return [
    ...listFor(catalogue, "creature"),
    ...listFor(catalogue, "item"),
    ...listFor(catalogue, "artifact"),
  ];
}
