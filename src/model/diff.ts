/**
 * Comparing two versions of one file's text, line by line.
 *
 * WHAT "BEFORE" MEANS HERE. A record file's raw text is not a second copy of
 * anything - `files.ts`'s own header is explicit that the draft is the whole
 * document and a file's text is DERIVED from it. So there is no per-file "base
 * pack" version of `monster.json` to diff against: the base game's own records
 * are composed against the mod's changes, not against a text file with the same
 * name. The comparison that exists, is meaningful, and is already tracked by the
 * store without adding a second copy of anything is the one `files.ts` computes
 * for its own "unsaved" tag: the file's current text in the mod (`file.contents`)
 * against whatever is sitting unsaved in the editor's buffer (`held.text`). That
 * is "before" and "after" here - the mod as it stands, and the mod as the editor
 * would leave it on the next save.
 *
 * THE ALGORITHM IS AN ORDINARY LCS EDIT SCRIPT, computed once per screen visit
 * rather than kept warm, because a mod's files are text an author is willing to
 * read in one sitting and not the sort of thing that needs an incremental diff
 * engine. The one thing worth being honest about is the O(lines x lines) table
 * this takes to build: above `CELL_CEILING` the table would be the expensive
 * part of opening the screen rather than reading the result, so the diff falls
 * back to "the whole file changed" instead, and says so.
 */

/** One line of the edit script that turns `before` into `after`. */
export type DiffOp =
  | { readonly kind: "same"; readonly text: string; readonly beforeLine: number; readonly afterLine: number }
  | { readonly kind: "add"; readonly text: string; readonly afterLine: number }
  | { readonly kind: "remove"; readonly text: string; readonly beforeLine: number };

export interface DiffResult {
  readonly ops: readonly DiffOp[];
  /** True when the table would have been too large to build, so the fallback ran instead. */
  readonly truncated: boolean;
}

/** Counts worth showing beside a file name: how much of it moved. */
export interface DiffSummary {
  readonly added: number;
  readonly removed: number;
}

/**
 * Above this many table cells, the LCS table is not built. `before` and `after`
 * are shown as a whole removed file and a whole added file instead - still a
 * true answer, just not a line-level one, and the screen says which it got.
 */
export const CELL_CEILING = 4_000_000;

/** The edit script that turns `before` into `after`, one line at a time. */
export function diffLines(before: string, after: string): DiffResult {
  const a = before === "" ? [] : before.split("\n");
  const b = after === "" ? [] : after.split("\n");
  const n = a.length;
  const m = b.length;

  if (n * m > CELL_CEILING) {
    const ops: DiffOp[] = [
      ...a.map((text, i): DiffOp => ({ kind: "remove", text, beforeLine: i + 1 })),
      ...b.map((text, i): DiffOp => ({ kind: "add", text, afterLine: i + 1 })),
    ];
    return { ops, truncated: true };
  }

  /* dp[i][j] is the length of the longest common subsequence of a[i:] and b[j:]. */
  const dp: Uint32Array[] = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] =
        a[i] === b[j]
          ? dp[i + 1]![j + 1]! + 1
          : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "same", text: a[i] as string, beforeLine: i + 1, afterLine: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ kind: "remove", text: a[i] as string, beforeLine: i + 1 });
      i++;
    } else {
      ops.push({ kind: "add", text: b[j] as string, afterLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    ops.push({ kind: "remove", text: a[i] as string, beforeLine: i + 1 });
    i++;
  }
  while (j < m) {
    ops.push({ kind: "add", text: b[j] as string, afterLine: j + 1 });
    j++;
  }

  return { ops, truncated: false };
}

/** How much of the file moved, for a one-line summary beside its name. */
export function diffSummary(ops: readonly DiffOp[]): DiffSummary {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.kind === "add") added++;
    else if (op.kind === "remove") removed++;
  }
  return { added, removed };
}

/** One row of a rendered diff: a line kept, added or removed, or a run skipped over. */
export type DiffRow =
  | { readonly kind: "context" | "add" | "remove"; readonly text: string; readonly beforeLine?: number; readonly afterLine?: number }
  | { readonly kind: "gap"; readonly count: number };

/** How many unchanged lines are kept on each side of a change, unified-diff style. */
export const DIFF_CONTEXT = 3;

/**
 * The edit script, cut down to unified-diff shape: a change and a few lines of
 * context around it, with a gap marker over a long unchanged run.
 *
 * A mod's files are short enough that this is a convenience rather than a
 * necessity, but a README or a hand-written script can run to a few hundred
 * lines, and nobody reading "what did I just change" wants to scroll past four
 * hundred lines that did not.
 */
export function diffRows(ops: readonly DiffOp[], context: number = DIFF_CONTEXT): readonly DiffRow[] {
  const n = ops.length;
  const keep = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (ops[i]!.kind === "same") continue;
    for (let k = Math.max(0, i - context); k <= Math.min(n - 1, i + context); k++) keep[k] = true;
  }

  const rows: DiffRow[] = [];
  let i = 0;
  while (i < n) {
    if (!keep[i]) {
      let j = i;
      while (j < n && !keep[j]) j++;
      rows.push({ kind: "gap", count: j - i });
      i = j;
      continue;
    }
    const op = ops[i]!;
    rows.push(
      op.kind === "same"
        ? { kind: "context", text: op.text, beforeLine: op.beforeLine, afterLine: op.afterLine }
        : op.kind === "add"
          ? { kind: "add", text: op.text, afterLine: op.afterLine }
          : { kind: "remove", text: op.text, beforeLine: op.beforeLine },
    );
    i++;
  }
  return rows;
}