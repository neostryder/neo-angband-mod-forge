/**
 * Every match of a needle, across every text file the draft would ship.
 *
 * WHY THIS IS ITS OWN FILE RATHER THAN A LOOP INSIDE A SCREEN. The file editor's
 * own find bar (`editor.ts`) already answers "where is this in the file I have
 * open" - it operates on one `codeEditor`'s own `area.value` and nothing else.
 * The moment the question becomes "where is this ANYWHERE in the mod", the
 * answer has to walk `projectFiles`, the same list the file screen shows, and
 * that is exactly the kind of thing this project keeps out of a screen: a
 * screen decides what to show, and reading the draft is the model's job.
 *
 * WHAT COUNTS AS "THE TEXT OF A FILE" HERE is whatever the reader would see if
 * they opened it - an unsaved buffer's text when one is open, and the draft's
 * own saved text otherwise. Searching only the saved text would mean typing a
 * name in one file and immediately failing to find it from a search over the
 * mod that is supposedly already open in front of you.
 */

import type { AuthoringApi } from "../host/authoring.js";
import type { Draft } from "./draft.js";
import { isBinary, projectFiles } from "./files.js";

/** One line in one file that contains the needle, once for every occurrence on it. */
export interface SearchMatch {
  readonly path: string;
  /** 1 based, as the editor's own gutter counts. */
  readonly line: number;
  /** 1 based, the column the match starts at. */
  readonly column: number;
  /** The line, trimmed and cut down around the match so one row stays one row. */
  readonly snippet: string;
}

/**
 * Above this many matches, the search stops looking rather than building a list
 * nobody would read. A common short word in a large mod could otherwise produce
 * thousands of rows for one keystroke.
 */
export const MATCH_CEILING = 500;

/** A snippet is cut to roughly this many characters around the match. */
const SNIPPET_RADIUS = 60;

/**
 * Every match of `query` across every text file in the draft, in file order and
 * then top to bottom within a file - the same order the file list itself shows.
 *
 * Case insensitive, and a plain substring rather than a pattern, which is the
 * same rule the editor's own find bar uses: an author typing a record's name is
 * not writing a regular expression.
 */
export function searchDraft(
  api: AuthoringApi,
  draft: Draft,
  buffers: Readonly<Record<string, { readonly text: string }>>,
  query: string,
): readonly SearchMatch[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [];

  const out: SearchMatch[] = [];
  for (const file of projectFiles(api, draft)) {
    if (isBinary(file.contents)) continue;
    const text = buffers[file.path]?.text ?? file.contents;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] as string;
      const hay = line.toLowerCase();
      let at = hay.indexOf(needle);
      while (at >= 0) {
        out.push({ path: file.path, line: i + 1, column: at + 1, snippet: snippetAround(line, at, needle.length) });
        if (out.length >= MATCH_CEILING) return out;
        at = hay.indexOf(needle, at + 1);
      }
    }
  }
  return out;
}

/** The line, cut down to a window around one match, with an ellipsis on either cut side. */
function snippetAround(line: string, at: number, needleLength: number): string {
  const trimmed = line.trim();
  const shift = line.length - line.trimStart().length;
  const shiftedAt = Math.max(0, at - shift);
  const from = Math.max(0, shiftedAt - SNIPPET_RADIUS);
  const to = Math.min(trimmed.length, shiftedAt + needleLength + SNIPPET_RADIUS);
  const cut = trimmed.slice(from, to);
  return `${from > 0 ? "..." : ""}${cut}${to < trimmed.length ? "..." : ""}`;
}