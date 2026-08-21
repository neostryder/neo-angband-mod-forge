/**
 * The workshop's document: an unfinished mod.
 *
 * ONE RULE GOVERNS THIS FILE, and it is the rule that keeps the workshop from
 * becoming a second content pipeline nobody can escape: **the workshop never
 * owns anything the mod folder does not contain.** A draft is a cache of the
 * files that would be emitted and nothing more. Every field here either goes
 * into `manifest.json` or into a record file, so a player can always take the
 * emitted files, edit them by hand, and bring them back through the mod
 * manager's own import door - and the workshop can read a mod it did not write,
 * because reading one is just this shape in the other direction.
 *
 * The moment that rule is bent, the workshop is a format owner and the player is
 * locked into it. Every tool that started as a helper and ended as a trap did it
 * by keeping one thing in its own project file that the exported artefact did
 * not carry.
 */

import type { FieldDecl, FieldOp, JsonRecord } from "../host/authoring.js";
import { splitRef } from "./refs.js";

/** One thing the player has done, in the order they did it. */
export type Change =
  | { readonly kind: "add"; readonly file: string; readonly record: JsonRecord }
  | { readonly kind: "patch"; readonly file: string; readonly ref: string; readonly ops: readonly FieldOp[] }
  | { readonly kind: "replace"; readonly file: string; readonly ref: string; readonly record: JsonRecord }
  | { readonly kind: "remove"; readonly file: string; readonly ref: string };

/** A mod in progress. Every field is something the emitted files carry. */
export interface Draft {
  /** The manifest's `id`, which is also the folder name a published mod uses. */
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly author: string;
  readonly description: string;
  /**
   * The manifest's `repository`.
   *
   * PERSISTED WITH THE DRAFT AND NEVER REGENERATED. An install pins a mod's
   * origin on first import and refuses any later import whose repository
   * disagrees, so a workshop that invented a fresh string each time would emit a
   * mod that could be installed exactly once. The default is a `local://` scheme
   * rather than a plausible GitHub URL, because pinning somebody's mod to a
   * repository they do not own means the update check will one day ask a stranger
   * for their tags.
   */
  readonly repository: string;
  readonly license: string;
  /** The engine range. See `engineRangeFor`. */
  readonly engine: string;
  /** One of the engine's pack groups. See `groupFor`. */
  readonly group: string;
  /** Fields the mod coins, in its own namespace. */
  readonly fields: readonly FieldDecl[];
  readonly changes: readonly Change[];
  /** When this draft was last written to storage, as an ISO string. */
  readonly touched: string;
}

/** The manifest's `id` rule, restated so the workshop can check as you type. */
export const ID_RE = /^[a-z][a-z0-9-]*$/;
/** The manifest's `version` rule, likewise. */
export const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/**
 * A brand new draft.
 *
 * The engine version is threaded in rather than read from a global because the
 * range an emitted mod declares is a claim about the build it was written
 * against, and there is exactly one honest source for that.
 */
export function newDraft(id: string, engine: string, now: string): Draft {
  return {
    id,
    name: titleFrom(id),
    version: "0.1.0",
    author: "",
    description: "",
    repository: `local://${id}`,
    license: "GPL-2.0-only",
    engine: engineRangeFor(engine),
    group: "content",
    fields: [],
    changes: [],
    touched: now,
  };
}

function titleFrom(id: string): string {
  return id
    .split("-")
    .filter((part) => part !== "")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * The range to declare, from the engine actually running.
 *
 * A MINIMUM, NOT A CARET. `^0.25.0` on a `0.x` version means 0.25.x only, so it
 * excludes 0.26.0, which is how an author accidentally opts into a warning on
 * every minor release. And a minimum is the honest claim: the mod was written
 * against this build and nobody has tested it against an older one.
 *
 * The workshop will not write a range that excludes the build it is running on.
 * An out-of-range `engine` LABELS a data pack rather than refusing it, so a
 * content mod that is silently out of date keeps loading while its patches start
 * being refused one at a time, and the player never sees the refusals. Refusing
 * to write such a range is cheaper than explaining that.
 */
export function engineRangeFor(engine: string): string {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(engine.trim());
  if (!m) return "*";
  return `>=${m[1]}.${m[2]}.${m[3]}`;
}

/**
 * Which pack group a draft belongs to, from what the player actually did.
 *
 * A manifest with no `group` sorts as `content`, which is right for a mod that
 * ADDS things and wrong for a mod that only patches - a patching mod wants
 * `tweaks`, which loads later, after the content it is adjusting exists. So the
 * workshop writes the group explicitly rather than leaving it out and getting
 * the adding-mod answer for a patching mod.
 */
export function groupFor(changes: readonly Change[]): string {
  return changes.some((c) => c.kind === "add" || c.kind === "replace") ? "content" : "tweaks";
}

/**
 * Every pack whose records this draft touches, which is exactly the set the
 * manifest must declare as dependencies.
 *
 * WHY THIS IS THE EASIEST THING IN THE WHOLE DESIGN TO GET WRONG. A pack may
 * only patch, replace or remove a record whose owner it declares. A refused op
 * costs that op and not the mod, so a mod with every patch refused installs
 * cleanly, enables, loads, and does nothing at all, with no visible cause. The
 * workshop knows the owner at the moment the player picks the base, so it writes
 * the dependency then rather than at build time.
 *
 * `core` is in the set the moment anything of core's is touched. A ref of the
 * form `<owner>:<key>` names its owner in the first segment, which is why the
 * refs the workshop stores are always fully qualified.
 */
export function dependenciesFor(changes: readonly Change[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const change of changes) {
    if (change.kind === "add") continue;
    out[splitRef(change.ref).owner] = "*";
  }
  return out;
}

/** How many records a draft adds, patches, replaces or removes. */
export function draftSize(draft: Draft): { added: number; patched: number; removed: number } {
  let added = 0;
  let patched = 0;
  let removed = 0;
  for (const change of draft.changes) {
    if (change.kind === "add") added++;
    else if (change.kind === "patch") patched++;
    else if (change.kind === "replace") patched++;
    else removed++;
  }
  return { added, patched, removed };
}

/** Every record file a draft touches, sorted, for the emit summary. */
export function draftFiles(draft: Draft): readonly string[] {
  return [...new Set(draft.changes.map((c) => c.file))].sort();
}
