/**
 * Keeping drafts between sessions, against a store that can fail in silence.
 *
 * `ctx.prefs` is one JSON value per mod, replaced whole, kept in the player's
 * install rather than in any character's save. It is the right place for this.
 * It has one property that decides the whole design of this file: its `set`
 * catches a quota error and logs it rather than throwing. So a write can appear
 * to succeed and not have happened, and a player who loses twenty minutes of
 * work to that will reasonably conclude the workshop is broken.
 *
 * THREE THINGS FOLLOW, and none of them can be fixed from inside a mod:
 *
 *  1. EVERY WRITE IS VERIFIED by reading back and comparing. A write that did
 *     not take is reported to the player at the moment it did not take, not at
 *     the moment they close the workshop.
 *  2. THERE IS A SIZE CEILING, and reaching it refuses the write with a sentence
 *     rather than discovering the quota. The ceiling is this mod's own, well
 *     under any browser's, because the value has to share the origin's storage
 *     with the game's saves - and losing a character to a mod's draft cache would
 *     be an unforgivable trade.
 *  3. A FINISHED MOD IS THE ONLY REAL SAVE POINT, and the workshop says so. The
 *     emitted zip is a file the player holds; a draft is a cache. That is also
 *     why the download button exists whether or not the install seam does.
 *
 * ENABLING OR DISABLING A MOD RELOADS THE PAGE, which means the reload is not a
 * rare event in the middle of this workflow - it is the last step of it. So the
 * write is not deferred to a close handler that a reload would skip. It happens
 * on a short debounce after every document change, and the caller flushes it
 * before it installs anything.
 */

import type { Draft } from "./draft.js";

/** What one write did. */
export type SaveOutcome =
  | { readonly ok: true; readonly bytes: number }
  | { readonly ok: false; readonly why: string; readonly bytes: number };

/**
 * The ceiling, in characters of JSON.
 *
 * Half a megabyte, which is a great many drafts: one record with thirty fields
 * is under two kilobytes. Chosen well below the smallest browser quota anybody
 * still ships rather than as a fraction of it, because the quota is shared with
 * the game's own storage and this is the side that can afford to be modest.
 */
export const SIZE_CEILING = 512 * 1024;

/** The shape stored under this mod's key. Versioned, so a later shape can migrate. */
interface Stored {
  readonly v: 1;
  readonly drafts: Readonly<Record<string, Draft>>;
  readonly seenTour: boolean;
}

interface PrefsLike {
  get(): unknown;
  set(value: unknown): void;
}

/** What was in storage, or empty. An unreadable value is ignored, never guessed at. */
export function loadDrafts(prefs: PrefsLike | undefined): { drafts: Record<string, Draft>; seenTour: boolean } {
  if (!prefs) return { drafts: {}, seenTour: false };
  let raw: unknown;
  try {
    raw = prefs.get();
  } catch {
    return { drafts: {}, seenTour: false };
  }
  if (typeof raw !== "object" || raw === null) return { drafts: {}, seenTour: false };
  const stored = raw as Partial<Stored>;
  /* An unknown version is IGNORED, not guessed at. This is the only version
   * there has ever been; the field exists so that the day there is a second one,
   * the first is not read as if it were. */
  if (stored.v !== 1) return { drafts: {}, seenTour: false };
  const drafts: Record<string, Draft> = {};
  for (const [id, draft] of Object.entries(stored.drafts ?? {})) {
    if (looksLikeDraft(draft)) drafts[id] = draft;
  }
  return { drafts, seenTour: stored.seenTour === true };
}

function looksLikeDraft(value: unknown): value is Draft {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Partial<Draft>;
  return typeof d.id === "string" && typeof d.version === "string" && Array.isArray(d.changes);
}

/**
 * Write, then read back and check.
 *
 * The comparison is on the serialised form, which is the only thing that was
 * actually stored. Comparing the object would compare what is in memory to what
 * is in memory.
 */
export function saveDrafts(
  prefs: PrefsLike | undefined,
  drafts: Readonly<Record<string, Draft>>,
  seenTour: boolean,
): SaveOutcome {
  const stored: Stored = { v: 1, drafts, seenTour };
  const text = JSON.stringify(stored);
  /* MEASURED IN BYTES, NOT IN CHARACTERS, and the difference stopped being academic
   * when a draft could hold a file the author pasted in. A quota is a byte count,
   * every character outside ASCII costs two or three of them, and a monster
   * description in Japanese would have been counted at a third of what it takes. */
  const bytes = new TextEncoder().encode(text).length;

  if (!prefs) {
    return {
      ok: false,
      why: "This game gives the workshop nowhere to keep unfinished work, so nothing here will survive a reload. Finish a mod and save the file.",
      bytes,
    };
  }
  if (bytes > SIZE_CEILING) {
    return {
      ok: false,
      why:
        `There is more unfinished work here than the workshop will keep (${Math.round(bytes / 1024)}KB against a ` +
        `${Math.round(SIZE_CEILING / 1024)}KB limit). Finish or delete a mod, and save the file for anything you want to keep.`,
      bytes,
    };
  }

  try {
    prefs.set(stored);
  } catch (e) {
    return { ok: false, why: `Keeping this failed: ${String(e)}`, bytes };
  }

  let back: unknown;
  try {
    back = prefs.get();
  } catch (e) {
    return { ok: false, why: `Keeping this appeared to work and could not be read back: ${String(e)}`, bytes };
  }
  if (JSON.stringify(back) !== text) {
    return {
      ok: false,
      why:
        "The workshop wrote this and read back something else, which means the store quietly ran out of room. " +
        "Nothing here will survive a reload. Save the file for anything you want to keep.",
      bytes,
    };
  }
  return { ok: true, bytes };
}

/**
 * A debounced writer that can be flushed.
 *
 * Flush matters more than debounce here: installing a mod reloads the page, so
 * the last thing before an install is a synchronous write, and a timer that had
 * not fired yet would be a timer that never fires.
 */
export class DraftWriter {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pending: { drafts: Readonly<Record<string, Draft>>; seenTour: boolean } | undefined;

  constructor(
    private readonly prefs: PrefsLike | undefined,
    private readonly onOutcome: (outcome: SaveOutcome) => void,
    private readonly delay = 400,
  ) {}

  queue(drafts: Readonly<Record<string, Draft>>, seenTour: boolean): void {
    this.pending = { drafts, seenTour };
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.delay);
  }

  flush(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    const pending = this.pending;
    if (!pending) return;
    this.pending = undefined;
    this.onOutcome(saveDrafts(this.prefs, pending.drafts, pending.seenTour));
  }

  /** Stop writing. Called when the mod is torn down. */
  dispose(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.pending = undefined;
  }
}
