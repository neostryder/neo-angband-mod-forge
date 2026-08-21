/**
 * The two things the record editor can be pointed at, behind one shape.
 *
 * A player editing a record they CREATED is changing their own data: the value
 * simply becomes the new value, and the emitted file carries the record. A player
 * editing a record the base game owns is describing a DIFFERENCE: the emitted
 * file carries an op, the game applies it on top, and two mods can both do it as
 * long as they touch different fields.
 *
 * Those are genuinely different, and every authoring tool that pretends
 * otherwise ends up emitting a patch against a record that does not exist yet, or
 * a whole-record replacement where the author wanted to adjust one number. So the
 * difference is modelled once, here, and the editor above it works in terms of
 * "the record as it stands" and "the player just changed this path to this
 * value" without caring which case it is in.
 *
 * The effective record for a patch is the base with the ops applied, which is
 * exactly what the game will see. So the editor shows the outcome, not the
 * paperwork, and the paperwork is visible on the review screen where it belongs.
 */

import type { AuthoringApi, FieldOp, JsonRecord, JsonValue } from "../host/authoring.js";
import type { Change } from "./draft.js";
import { collapseOps, opSet } from "./ops.js";
import { valueAt, withValueAt, withoutValueAt } from "./paths.js";

export interface EditTarget {
  readonly file: string;
  /** "own" is a record the player made; "patch" adjusts somebody else's. */
  readonly mode: "own" | "patch";
  /** The record as the game will see it. */
  readonly record: JsonRecord;
  /** The record before this draft touched it. Only for a patch. */
  readonly base?: JsonRecord;
  /** The ref being patched. Only for a patch. */
  readonly ref?: string;
  /** The ops recorded so far. Only for a patch. */
  readonly ops?: readonly FieldOp[];
}

/** Read one change out of a draft as something the editor can point at. */
export function targetFor(api: AuthoringApi, change: Change, base: JsonRecord | undefined): EditTarget | undefined {
  switch (change.kind) {
    case "add":
      return { file: change.file, mode: "own", record: change.record };
    case "replace":
      return { file: change.file, mode: "own", record: change.record, ref: change.ref };
    case "patch": {
      if (!base) return undefined;
      let effective = base;
      try {
        effective = api.applyFieldPatch(base, [...change.ops]);
      } catch {
        /* An op that cannot apply is a finding, not a reason to show nothing.
         * The player sees the base and the findings pane says what is wrong. */
        effective = base;
      }
      return { file: change.file, mode: "patch", record: effective, base, ref: change.ref, ops: change.ops };
    }
    case "remove":
      return undefined;
  }
}

/**
 * The change that results from the player putting `value` at `path`.
 *
 * For an owned record the value is written. For a patch the value becomes a
 * `set` op, folded onto any earlier `set` at the same path so that changing your
 * mind three times does not ship three ops - see `collapseOps` for why every
 * other op accumulates instead.
 */
export function editValue(change: Change, path: string, value: JsonValue): Change {
  switch (change.kind) {
    case "add":
      return { ...change, record: withValueAt(change.record, path, value) };
    case "replace":
      return { ...change, record: withValueAt(change.record, path, value) };
    case "patch":
      return { ...change, ops: collapseOps([...change.ops, opSet(path, value)]) };
    case "remove":
      return change;
  }
}

/** The change that results from the player taking a field out. */
export function removeValue(change: Change, path: string): Change {
  switch (change.kind) {
    case "add":
      return { ...change, record: withoutValueAt(change.record, path) };
    case "replace":
      return { ...change, record: withoutValueAt(change.record, path) };
    case "patch":
      /* A field the patch REMOVES is not put back by the composer, which is how
       * a total conversion works, so `set` to null is the honest spelling of
       * "take this away" in a patch. */
      return { ...change, ops: collapseOps([...change.ops, opSet(path, null)]) };
    case "remove":
      return change;
  }
}

/** Record one op against a patch, verbatim, without folding it into a `set`. */
export function recordOp(change: Change, op: FieldOp): Change {
  if (change.kind !== "patch") return change;
  return { ...change, ops: collapseOps([...change.ops, op]) };
}

/** Whether a path holds a value the player has actually decided about. */
export function isPristine(target: EditTarget, path: string): boolean {
  if (target.mode === "own") return valueAt(target.record, path) === undefined;
  const ops = target.ops ?? [];
  return !ops.some((op) => op.path === path || op.path.startsWith(`${path}.`));
}
