/**
 * Field ops, inferred from the gesture rather than chosen by name.
 *
 * The player is never asked "which of these eight operations do you want". They
 * type over a number, or nudge it, or tick a flag, or add a row to a list, and
 * the op falls out of that. The reason is not that the ops are hard to
 * understand; it is that choosing between `set` and `add` is a decision about
 * COMPOSITION, and the gesture already contains the answer.
 *
 * Which matters, because two of these compose and six do not:
 *
 *  - `addFlag`, `removeFlag` and `append` are commutative. Two mods each adding
 *    a different flag to one monster both keep theirs. Two mods each appending an
 *    item to one shop's stock both get their item.
 *  - `set`, `merge`, `add`, `mul` and `removeValue` are not. Two mods writing the
 *    same field means load order decides, and the player is entitled to know
 *    that before they publish.
 *
 * And one further distinction the workshop tries to teach without a lecture:
 * `add` beats `set` when the number is not yours. `set hit-points 15` says
 * fifteen for ever, including after a release retunes the monster and after
 * another mod adjusted it first. `add hit-points 3` says three more than
 * whatever it is, which keeps being what the author meant. So a nudge is offered
 * beside every number, and it is the one the workshop puts first.
 */

import type { FieldOp, JsonRecord, JsonValue } from "../host/authoring.js";

/** The three ops another mod's change to the same field cannot cost you. */
export function isCommutative(op: FieldOp["op"]): boolean {
  return op === "addFlag" || op === "removeFlag" || op === "append";
}

/** Type a value straight over whatever is there. */
export function opSet(path: string, value: JsonValue): FieldOp {
  return { op: "set", path, value };
}

/** Move a number by an amount, whatever it currently is. */
export function opNudge(path: string, delta: number): FieldOp {
  return { op: "add", path, value: delta };
}

/** Scale a number, whatever it currently is. */
export function opScale(path: string, factor: number): FieldOp {
  return { op: "mul", path, value: factor };
}

/** Tick or untick one flag in a list of flags. */
export function opFlag(path: string, flag: string, on: boolean): FieldOp {
  return on ? { op: "addFlag", path, flag } : { op: "removeFlag", path, flag };
}

/** Add one row to a list. */
export function opAddRow(path: string, value: JsonValue): FieldOp {
  return { op: "append", path, values: [value] };
}

/** Take one row out of a list, by value rather than by position. */
export function opDeleteRow(path: string, value: JsonValue): FieldOp {
  return { op: "removeValue", path, value };
}

/** Change some keys of an object and leave the rest alone. */
export function opMerge(path: string, value: JsonRecord): FieldOp {
  return { op: "merge", path, value };
}

/** One sentence describing an op, in the words the player used to make it. */
export function describeOp(op: FieldOp): string {
  switch (op.op) {
    case "set":
      return `set ${op.path} to ${short(op.value)}`;
    case "merge":
      return `change ${Object.keys(op.value).join(", ")} inside ${op.path}`;
    case "addFlag":
      return `add the flag ${op.flag} to ${op.path}`;
    case "removeFlag":
      return `take the flag ${op.flag} out of ${op.path}`;
    case "add":
      return `${op.value < 0 ? "lower" : "raise"} ${op.path} by ${Math.abs(op.value)}`;
    case "mul":
      return `multiply ${op.path} by ${op.value}`;
    case "append":
      return `add ${op.values.length === 1 ? "an entry" : `${op.values.length} entries`} to ${op.path}`;
    case "removeValue":
      return `take ${short(op.value)} out of ${op.path}`;
  }
}

/**
 * What this op costs if another mod touches the same field.
 *
 * Shown on the review screen, one line per op, because "load order decides" is a
 * thing an author should find out before they publish rather than in a bug
 * report.
 */
export function describeComposition(op: FieldOp): string {
  if (isCommutative(op.op)) {
    return "Another mod doing the same thing keeps its change and you keep yours.";
  }
  return "If another mod also writes this field, whichever loads last wins.";
}

function short(value: JsonValue): string {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "nothing";
  if (Array.isArray(value)) return `a list of ${value.length}`;
  if (typeof value === "object") return `{ ${Object.keys(value).slice(0, 3).join(", ")} }`;
  return String(value);
}

/**
 * Fold a list of ops down to the ones that still matter.
 *
 * Only `set` on the same path collapses, and only onto the LAST one: two `set`s
 * on one path mean the player changed their mind, and shipping both would put a
 * value in the file that never existed on screen. Every other op accumulates,
 * because two nudges of 3 genuinely mean 6 and folding them into one `add 6`
 * would be a lie about what the author wrote even though the number matches.
 */
export function collapseOps(ops: readonly FieldOp[]): readonly FieldOp[] {
  const out: FieldOp[] = [];
  for (const op of ops) {
    if (op.op === "set") {
      const at = out.findIndex((prev) => prev.op === "set" && prev.path === op.path);
      if (at >= 0) {
        out[at] = op;
        continue;
      }
    }
    out.push(op);
  }
  return out;
}
