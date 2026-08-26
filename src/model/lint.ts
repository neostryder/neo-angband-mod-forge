/**
 * The same checks the wizard screens run, over a file that was edited as text.
 *
 * THE PROBLEM THIS SOLVES. The record screens put a field's constraints in front of
 * the author as they work: a number box with the range core's own records use, a
 * dropdown of the values core writes for that field, and a findings pane fed by the
 * game's own checker that marks a record with no `depth` or a field spelled wrong.
 * Open the same record file as text and every one of those disappears, because the
 * text is just text. A raw editor that is quieter than the form it replaces is a
 * raw editor that quietly ships worse mods, and the author does not find out until
 * the review screen, or until the game refuses to load the pack.
 *
 * SO THE CHECKS ARE THE SAME CHECKS, NOT A SECOND SET. What runs here is
 * `buildDraft`, which is the exact function the review screen and the record screen
 * get their findings from: the buffer's text is turned into a candidate draft
 * through `writeFileText` - the same parse that saving does - and that draft is
 * composed on top of the game and checked by the engine's own checker. There is no
 * copy of a rule anywhere in this file. What is here is the part that could not be
 * reused, which is WHERE in the text a finding belongs.
 *
 * ------------------------------------------------------------------
 * PLACING A FINDING IN THE TEXT
 * ------------------------------------------------------------------
 *
 * A finding names a file, a record by LABEL and sometimes a field. None of those is
 * an offset. `jsonIndex` walks the token stream of text `JSON.parse` has already
 * accepted and records where every path in it begins, and `place` turns a finding
 * into one of those paths.
 *
 * A LABEL IS NOT AN IDENTITY, which is the trap here. Two records in one file can
 * carry the same name, and the checker's label is a display string rather than the
 * record key. So a label matching more than one record in the file places nothing
 * rather than guessing, and a finding that cannot be placed is still SHOWN - as a
 * row about the file with no line number on it. Dropping it would be the worst of
 * the three outcomes, because a check that silently omits its awkward cases reads
 * as a clean file.
 */

import type {
  AuthoringApi,
  AuthoringFinding,
  ComposedRecords,
  FindingLevel,
  JsonRecord,
} from "../host/authoring.js";
import { buildDraft } from "./build.js";
import type { Draft } from "./draft.js";
import { classify, MANIFEST, writeFileText } from "./files.js";
import { positionAt, tokenize } from "./syntax.js";

/** One thing worth saying about a file, placed in it where that was possible. */
export interface LintFinding {
  readonly level: FindingLevel;
  /** The checker's own rule id. A `workshop/` prefix means the game will not say it. */
  readonly rule: string;
  readonly message: string;
  /** 1-based, and absent when the finding could not be placed in the text. */
  readonly line?: number;
  readonly column?: number;
  /** The record it is about, for a row that has no line to show. */
  readonly record?: string;
  readonly field?: string;
  /**
   * True for a finding about the CHECKING rather than about the file.
   *
   * The one that exists today says that this engine cannot lend the workshop the
   * game's real checker, so what ran was the workshop's smaller stand-in. It is
   * sorted to the top and never filtered, because every other row in the pane means
   * less than it appears to while it is there.
   */
  readonly caveat?: boolean;
}

/** What one pass over one file found, and what it could not look at. */
export interface FileLint {
  /** About this file, worst first, then in the order they appear in the text. */
  readonly findings: readonly LintFinding[];
  /**
   * How many findings the same build had about the REST of the mod.
   *
   * Reported rather than hidden. A pane that shows only this file's findings and
   * says nothing else reads as "the mod is fine", which is a claim it did not make
   * and cannot support.
   */
  readonly elsewhere: number;
  /** False when the text could not be checked at all, with `why` saying so. */
  readonly checked: boolean;
  readonly why?: string;
}

const NOTHING: FileLint = { findings: [], elsewhere: 0, checked: false };

/**
 * Check one file's unsaved text against everything the workshop knows.
 *
 * Never throws. A checker that can take a screen down while somebody is typing is
 * worse than no checker, and the text it is handed is half-written by definition.
 */
export function lintFile(
  api: AuthoringApi,
  draft: Draft,
  records: ComposedRecords,
  path: string,
  text: string,
): FileLint {
  const kind = classify(api, path);
  if (kind === "extra") {
    return { ...NOTHING, why: "This file is yours, so nothing here has an opinion about what is in it." };
  }
  if (text.trim() === "" && kind === "manifest") {
    return { ...NOTHING, why: "There is no manifest here to check." };
  }

  let parsed: unknown;
  try {
    parsed = text.trim() === "" ? {} : JSON.parse(text);
  } catch {
    /* The JSON fault locator has already said where, in a message from the same
     * parser the game uses. Saying it twice in two voices helps nobody. */
    return { ...NOTHING, why: "Not valid JSON yet, so the checks below cannot run." };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ...NOTHING, why: "This file has to be a JSON object, written with { }." };
  }

  const candidate = writeFileText(api, draft, path, text);
  if (!candidate.ok) return { ...NOTHING, why: candidate.why };

  const index = jsonIndex(text);
  const body = parsed as JsonRecord;
  const stem = path === MANIFEST ? "manifest" : path.slice(0, -".json".length);

  let findings: AuthoringFinding[];
  let elsewhere = 0;
  /**
   * The project builder's `problems` are refusals rather than advice, and they are
   * about the WHOLE mod rather than about a file. They are shown on the manifest,
   * which is the mod's own page in file form, and counted as elsewhere on any other
   * file so that a clean record file never reads as a mod that would build.
   */
  const refusals: string[] = [];
  try {
    const build = buildDraft(api, candidate.draft, records);
    findings = build.findings.filter((finding) => {
      /* A finding filed under "-" belongs to no file: it is the checker talking
       * about itself, and it is shown wherever anybody is reading findings. The
       * record screen does the same, for the same reason. */
      const mine = finding.file === "-" || finding.file === stem || (path === MANIFEST && finding.file === "manifest");
      if (!mine) elsewhere++;
      return mine;
    });
    if (path === MANIFEST) refusals.push(...build.problems);
    else elsewhere += build.problems.length;
  } catch (e) {
    return { ...NOTHING, why: `The workshop could not check this: ${e instanceof Error ? e.message : String(e)}` };
  }

  const out: LintFinding[] = findings.map((finding) => {
    const at = place(index, body, finding);
    const where = at === undefined ? {} : positionAt(text, at);
    const row: LintFinding = {
      level: finding.level,
      rule: finding.rule,
      message: finding.message,
      ...(finding.file === "-" ? { caveat: true } : {}),
      ...where,
    };
    return finding.field === undefined
      ? { ...row, record: finding.record }
      : { ...row, record: finding.record, field: finding.field };
  });

  for (const problem of refusals) {
    out.push({ level: "error", rule: "project/refused", message: problem });
  }

  return { findings: sortLint(out), elsewhere, checked: true };
}

/**
 * A caveat about the checking first, then worst first, then up the file.
 *
 * Which is the order the pane is read in: what the checks are worth, then what they
 * cost, then where they are.
 */
function sortLint(findings: readonly LintFinding[]): readonly LintFinding[] {
  const order: Readonly<Record<string, number>> = { error: 0, warn: 1, hint: 2 };
  return [...findings].sort(
    (a, b) =>
      Number(b.caveat ?? false) - Number(a.caveat ?? false) ||
      (order[a.level] ?? 3) - (order[b.level] ?? 3) ||
      (a.line ?? Number.MAX_SAFE_INTEGER) - (b.line ?? Number.MAX_SAFE_INTEGER) ||
      (a.column ?? 0) - (b.column ?? 0) ||
      a.rule.localeCompare(b.rule),
  );
}

/* ------------------------------------------------------------------ *
 * Where in the text a path is                                         *
 * ------------------------------------------------------------------ */

/**
 * Path segments joined for use as a map key.
 *
 * The separator is a NUL rather than a dot or a slash, because a JSON key may
 * legally contain either of those and a mod that used one would make two different
 * paths collide on one entry.
 */
function keyOf(path: readonly (string | number)[]): string {
  return path.join("\u0000");
}

/**
 * Where every path in a JSON document begins, by path.
 *
 * THE TOKENIZER IS USED AS A LEXER AND NOT AS A PARSER, which is only safe because
 * this runs after `JSON.parse` has accepted the text. Over valid JSON the token
 * stream is unambiguous and the walk below cannot be led astray by a half-typed
 * construct - which is exactly the thing the colouring scanner is allowed to be
 * approximate about, and is why it may not be trusted with this job on its own.
 *
 * The offset recorded for an object member is the start of its KEY, so a marker
 * lands on `"depth"` rather than on the number after it. For an array element it is
 * the start of the element itself, since there is no key to point at.
 */
export function jsonIndex(text: string): ReadonlyMap<string, number> {
  const tokens = tokenize("json", text);
  const out = new Map<string, number>();
  let at = 0;

  const isPunc = (ch: string): boolean => {
    const token = tokens[at];
    return token !== undefined && token.cls === "punc" && text.slice(token.at, token.to) === ch;
  };

  const value = (path: readonly (string | number)[]): void => {
    if (tokens[at] === undefined) return;
    if (isPunc("{")) {
      object(path);
      return;
    }
    if (isPunc("[")) {
      array(path);
      return;
    }
    at++;
  };

  const object = (path: readonly (string | number)[]): void => {
    at++;
    if (isPunc("}")) {
      at++;
      return;
    }
    for (;;) {
      const name = tokens[at];
      if (name === undefined || (name.cls !== "key" && name.cls !== "str")) return;
      let key: string;
      try {
        key = JSON.parse(text.slice(name.at, name.to)) as string;
      } catch {
        return;
      }
      at++;
      if (!isPunc(":")) return;
      at++;
      const child = [...path, key];
      out.set(keyOf(child), name.at);
      value(child);
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("}")) at++;
      return;
    }
  };

  const array = (path: readonly (string | number)[]): void => {
    at++;
    if (isPunc("]")) {
      at++;
      return;
    }
    for (let n = 0; ; n++) {
      const token = tokens[at];
      if (token === undefined) return;
      const child = [...path, n];
      out.set(keyOf(child), token.at);
      value(child);
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("]")) at++;
      return;
    }
  };

  value([]);
  if (!out.has(keyOf([]))) out.set(keyOf([]), tokens[0]?.at ?? 0);
  return out;
}

/**
 * The offset of a path, or of the nearest ancestor of it that is in the index.
 *
 * `floor` IS WHERE THE CLIMB STOPS, and leaving it out was a real bug rather than a
 * refinement: without it, a finding about a field the file does not contain walked
 * all the way up to the empty path, found the document root, and put a confident
 * marker on line 1. Every unplaceable finding landing on the first line of the file
 * is worse than none of them being placed at all.
 */
function nearestOffset(
  index: ReadonlyMap<string, number>,
  path: readonly (string | number)[],
  floor: number,
): number | undefined {
  for (let cut = path.length; cut >= floor; cut--) {
    const at = index.get(keyOf(path.slice(0, cut)));
    if (at !== undefined) return at;
  }
  return undefined;
}

/**
 * The four keys the engine's checker builds a record's display label from.
 *
 * A COPY, AND AN INDEX RATHER THAN A RULE. The checker's `labelOf` is private to the
 * SDK, and this exists only to find which record in the author's own text a finding
 * is about. If the SDK ever changes the order, the consequence here is a finding
 * that lands on the file instead of on the line - never a finding that says
 * something untrue, and never one that disappears.
 */
const LABEL_KEYS = ["name", "code", "store", "type"] as const;

function labelOf(record: JsonRecord): string {
  for (const key of LABEL_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value !== "") return value;
  }
  return "(unnamed record)";
}

/** The dotted field path a finding names, split for the index. */
function fieldPath(field: string): readonly (string | number)[] {
  return field.split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

/**
 * Where in the author's text this finding belongs, or nothing.
 *
 * Nothing is a real answer and the caller shows the finding anyway. Guessing would
 * put a marker on an innocent line, which is worse than no marker at all: the
 * author fixes what the marker points at and the finding does not go away.
 */
function place(
  index: ReadonlyMap<string, number>,
  body: JsonRecord,
  finding: AuthoringFinding,
): number | undefined {
  const anchor = recordAnchor(body, finding.record);
  if (anchor === undefined) {
    /* No record to hang it on. A top-level key of the file itself is still a place,
     * and anything shallower than that is the whole document, which is not one. */
    return finding.field === undefined ? undefined : nearestOffset(index, fieldPath(finding.field), 1);
  }
  const path = finding.field === undefined ? anchor : [...anchor, ...fieldPath(finding.field)];
  return nearestOffset(index, path, anchor.length);
}

/**
 * The path of the one record in this file with that label, or nothing.
 *
 * Nothing when no record matches AND when more than one does, which is the whole
 * point: a label is a display string, so two records in a file may share one.
 */
function recordAnchor(body: JsonRecord, label: string): readonly (string | number)[] | undefined {
  const hits: (readonly (string | number)[])[] = [];

  const added = body["records"];
  if (Array.isArray(added)) {
    added.forEach((entry, n) => {
      if (isRecord(entry) && labelOf(entry) === label) hits.push(["records", n]);
    });
  }

  for (const key of ["replaces", "fieldPatches"] as const) {
    const group = body[key];
    if (!isRecord(group)) continue;
    for (const [ref, entry] of Object.entries(group)) {
      if (ref === label || (isRecord(entry) && labelOf(entry) === label)) hits.push([key, ref]);
    }
  }

  const removed = body["removes"];
  if (Array.isArray(removed)) {
    removed.forEach((ref, n) => {
      if (ref === label) hits.push(["removes", n]);
    });
  }

  return hits.length === 1 ? hits[0] : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
