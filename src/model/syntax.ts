/**
 * Colouring text, and saying what is wrong with it, without a compiler.
 *
 * WHY THIS IS HAND-WRITTEN, and it is the same answer `store.ts` gives about the
 * absence of a framework. A mod ships as one ES module fetched from a folder, and
 * the game's own plugin builder marks every non-relative import external and then
 * REFUSES the build if one survives. So there is no CodeMirror here, and there
 * could not be: an editor library is a package, a package is a bare specifier, and
 * a bare specifier does not resolve in a mod. Vendoring one under `src/` would
 * bundle, and would put about a megabyte of third-party code that nobody will read
 * inside an artefact that is deliberately shipped unminified so that somebody can.
 *
 * WHAT A TOKENIZER OWES THE READER, given that. Colour is a reading aid, so it may
 * be approximate: a template literal whose nesting confuses the scanner is drawn
 * slightly wrong and nothing is lost. A PROBLEM is a claim, so it may not be
 * approximate, and the two are held to different standards here on purpose:
 *
 *  - JSON is checked by `JSON.parse`, which is the same parser the game uses. What
 *    it says is true.
 *  - JAVASCRIPT IS NOT PARSED AT ALL, and the interface says so where the reader
 *    can see it. What is reported is what a scanner can be certain of: a comment or
 *    a string that never closes, and brackets that do not balance. That catches the
 *    great majority of what goes wrong in hand-edited code and it catches nothing
 *    else, which is the honest half of the bargain.
 *
 * `new Function(text)` was the obvious free syntax check and it is not usable. It
 * refuses `export default`, which every `plugin.js` has, so it would report a false
 * error on the one file that matters most - and it is refused outright under a
 * content security policy without `unsafe-eval`, which is a thing this game may
 * one day be served with.
 */

/** The languages a mod folder actually contains. */
export type Language = "json" | "js" | "markdown" | "text";

/**
 * What one run of characters is.
 *
 * Deliberately few. A palette of twenty classes is a palette nobody can tell apart
 * at eleven pixels, and every one of them is another thing to be wrong about.
 */
export type TokenClass = "str" | "num" | "key" | "kw" | "lit" | "com" | "punc" | "head" | "code";

/** One run of characters, half open: `at` is included and `to` is not. */
export interface Token {
  readonly at: number;
  readonly to: number;
  readonly cls: TokenClass;
}

/** One thing wrong, at a place. Lines and columns are 1 based, as editors count. */
export interface SyntaxProblem {
  readonly line: number;
  readonly column: number;
  readonly message: string;
}

/** Which language a path is written in. Unknown extensions read as plain text. */
export function languageFor(path: string): Language {
  const dot = path.lastIndexOf(".");
  const ext = dot < 0 ? "" : path.slice(dot + 1).toLowerCase();
  switch (ext) {
    case "json":
      return "json";
    case "js":
    case "mjs":
    case "cjs":
      return "js";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return "text";
  }
}

/* ------------------------------------------------------------------ *
 * Places in the text                                                  *
 * ------------------------------------------------------------------ */

/** The offset each line begins at, including the first. */
export function lineStarts(text: string): readonly number[] {
  const out = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") out.push(i + 1);
  }
  return out;
}

/** The 1-based line and column an offset falls on. */
export function positionAt(text: string, offset: number): { line: number; column: number } {
  const at = Math.max(0, Math.min(offset, text.length));
  const starts = lineStarts(text);
  /* Walking backwards from the end finds the last start at or before the offset
   * in one pass, and a file being edited by hand is not long enough for a binary
   * search to be worth the chance of being wrong at its edges. */
  let line = starts.length - 1;
  while (line > 0 && (starts[line] ?? 0) > at) line--;
  return { line: line + 1, column: at - (starts[line] ?? 0) + 1 };
}

/** The offset a 1-based line and column addresses, clamped to the text. */
export function offsetAt(text: string, line: number, column = 1): number {
  const starts = lineStarts(text);
  const start = starts[Math.max(0, Math.min(line - 1, starts.length - 1))] ?? 0;
  const end = text.indexOf("\n", start);
  const limit = end < 0 ? text.length : end;
  return Math.max(start, Math.min(start + column - 1, limit));
}

/* ------------------------------------------------------------------ *
 * Tokenizing                                                          *
 * ------------------------------------------------------------------ */

/** Colour the text. Never throws, and always covers a prefix of every character. */
export function tokenize(lang: Language, text: string): readonly Token[] {
  switch (lang) {
    case "json":
      return tokenizeJson(text);
    case "js":
      return tokenizeJs(text);
    case "markdown":
      return tokenizeMarkdown(text);
    case "text":
      return [];
  }
}

const WHITESPACE = new Set([" ", "\t", "\r", "\n"]);

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= "0" && ch <= "9";
}

function isWordStart(ch: string | undefined): boolean {
  return ch !== undefined && (/[A-Za-z_$]/.test(ch) || ch.charCodeAt(0) > 127);
}

function isWord(ch: string | undefined): boolean {
  return isWordStart(ch) || isDigit(ch);
}

/**
 * Scan a quoted run, returning where it ends and whether it closed.
 *
 * `stopAtNewline` is true for the two quote characters that cannot span a line in
 * either JSON or JavaScript, which is what makes "this string never closed" a
 * claim rather than a guess: without it, one stray quote swallows the rest of the
 * file and every problem after it is invented.
 */
function scanQuoted(text: string, at: number, quote: string, stopAtNewline: boolean): { to: number; closed: boolean } {
  let i = at + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return { to: i + 1, closed: true };
    if (stopAtNewline && ch === "\n") return { to: i, closed: false };
    i++;
  }
  return { to: text.length, closed: false };
}

function tokenizeJson(text: string): readonly Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i] as string;
    if (WHITESPACE.has(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      const run = scanQuoted(text, i, '"', true);
      /* A string is a KEY when the next thing that is not whitespace is a colon.
       * Reading it from the text rather than from a parse state is what lets this
       * colour a half-typed file, which is the only state an editor ever sees. */
      let ahead = run.to;
      while (ahead < text.length && WHITESPACE.has(text[ahead] as string)) ahead++;
      out.push({ at: i, to: run.to, cls: text[ahead] === ":" ? "key" : "str" });
      i = run.to;
      continue;
    }
    if (isDigit(ch) || (ch === "-" && isDigit(text[i + 1]))) {
      let j = i + 1;
      while (j < text.length && /[0-9eE+.\-]/.test(text[j] as string)) j++;
      out.push({ at: i, to: j, cls: "num" });
      i = j;
      continue;
    }
    if (isWordStart(ch)) {
      let j = i;
      while (j < text.length && isWord(text[j])) j++;
      const word = text.slice(i, j);
      out.push({ at: i, to: j, cls: word === "true" || word === "false" || word === "null" ? "lit" : "punc" });
      i = j;
      continue;
    }
    if ("{}[],:".includes(ch)) {
      out.push({ at: i, to: i + 1, cls: "punc" });
      i++;
      continue;
    }
    i++;
  }
  return out;
}

/** The words JavaScript reserves. Only the ones a mod script plausibly uses. */
const JS_KEYWORDS = new Set([
  "as", "async", "await", "break", "case", "catch", "class", "const", "continue", "debugger",
  "default", "delete", "do", "else", "export", "extends", "finally", "for", "from", "function",
  "get", "if", "import", "in", "instanceof", "let", "new", "of", "return", "set", "static",
  "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield",
]);

const JS_LITERALS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

/**
 * Scan a template literal, including its substitutions.
 *
 * The braces of a `${...}` are counted so that a template holding an object
 * literal does not end at the first closing brace, and a backtick inside a
 * substitution starts a nested template rather than closing this one. What it does
 * not do is understand a quote inside a substitution, so `` `${ "`" }` `` is drawn
 * wrong. That is a colouring mistake and not a reported problem, which is the line
 * this file draws everywhere.
 */
function scanTemplate(text: string, at: number): { to: number; closed: boolean } {
  let i = at + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "`") return { to: i + 1, closed: true };
    if (ch === "$" && text[i + 1] === "{") {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        const inner = text[i];
        if (inner === "`") {
          const nested = scanTemplate(text, i);
          i = nested.to;
          continue;
        }
        if (inner === "{") depth++;
        else if (inner === "}") depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return { to: text.length, closed: false };
}

/**
 * What came before, reduced to the one thing a slash needs to know.
 *
 * "value" means the previous thing was a name, a number, a string or a closing
 * bracket, and therefore a slash after it DIVIDES. "operator" means it cannot
 * divide anything, so a slash opens a pattern. A keyword counts as an operator,
 * because `return /x/` and `typeof /x/` are patterns rather than arithmetic.
 *
 * CARRIED FORWARD AS THE SCANNER GOES rather than recovered by looking backwards,
 * which is the difference between linear and quadratic. The version this replaced
 * asked `tokens.some(...)` for every slash in the file, so a file of a few thousand
 * lines with a lot of division spent its time re-walking the token list.
 */
type Preceding = "start" | "value" | "operator";

/**
 * Whether a slash begins a regular expression rather than a division.
 *
 * The famous ambiguity, settled the way every scanner without a parser settles it,
 * and it is a HEURISTIC rather than a rule: a closing brace is read as the end of a
 * block, so `}` is treated as an operator, and a slash straight after an object
 * literal is drawn as a pattern. That is a colouring mistake in a case nobody
 * writes, and it is why nothing in `problemsIn` is allowed to depend on it.
 */
function regexAllowed(before: Preceding): boolean {
  return before !== "value";
}

function tokenizeJs(text: string): readonly Token[] {
  const out: Token[] = [];
  let before: Preceding = "start";
  let i = 0;
  while (i < text.length) {
    const ch = text[i] as string;
    if (WHITESPACE.has(ch)) {
      i++;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      const end = text.indexOf("\n", i);
      const to = end < 0 ? text.length : end;
      out.push({ at: i, to, cls: "com" });
      i = to;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const to = end < 0 ? text.length : end + 2;
      out.push({ at: i, to, cls: "com" });
      i = to;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const run = scanQuoted(text, i, ch, true);
      out.push({ at: i, to: run.to, cls: "str" });
      i = run.to;
      before = "value";
      continue;
    }
    if (ch === "`") {
      const run = scanTemplate(text, i);
      out.push({ at: i, to: run.to, cls: "str" });
      i = run.to;
      before = "value";
      continue;
    }
    if (ch === "/" && regexAllowed(before)) {
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < text.length) {
        const c = text[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "\n") break;
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          closed = true;
          j++;
          break;
        }
        j++;
      }
      if (closed) {
        while (j < text.length && /[dgimsuvy]/.test(text[j] as string)) j++;
        out.push({ at: i, to: j, cls: "str" });
        i = j;
        before = "value";
        continue;
      }
      /* Not a pattern after all: fall through and treat it as punctuation. */
    }
    if (isDigit(ch) || (ch === "." && isDigit(text[i + 1]))) {
      let j = i + 1;
      while (j < text.length && /[0-9a-fA-FxXoObBeE_.+-]/.test(text[j] as string)) {
        /* A sign only continues a number straight after an exponent marker. */
        if ((text[j] === "+" || text[j] === "-") && !/[eE]/.test(text[j - 1] ?? "")) break;
        j++;
      }
      if (text[j] === "n") j++;
      out.push({ at: i, to: j, cls: "num" });
      i = j;
      before = "value";
      continue;
    }
    if (isWordStart(ch)) {
      let j = i;
      while (j < text.length && isWord(text[j])) j++;
      const word = text.slice(i, j);
      const keyword = JS_KEYWORDS.has(word);
      const cls: TokenClass = JS_LITERALS.has(word) ? "lit" : keyword ? "kw" : "punc";
      if (cls !== "punc") out.push({ at: i, to: j, cls });
      i = j;
      before = keyword && !JS_LITERALS.has(word) ? "operator" : "value";
      continue;
    }
    if ("{}[]()".includes(ch)) {
      out.push({ at: i, to: i + 1, cls: "punc" });
      i++;
      before = ch === ")" || ch === "]" ? "value" : "operator";
      continue;
    }
    i++;
    before = "operator";
  }
  return out;
}

function tokenizeMarkdown(text: string): readonly Token[] {
  const out: Token[] = [];
  const starts = lineStarts(text);
  let fenced = false;
  for (let n = 0; n < starts.length; n++) {
    const start = starts[n] ?? 0;
    const next = starts[n + 1];
    const end = next === undefined ? text.length : next - 1;
    const line = text.slice(start, end);

    if (/^\s*(?:```|~~~)/.test(line)) {
      out.push({ at: start, to: end, cls: "code" });
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      out.push({ at: start, to: end, cls: "code" });
      continue;
    }
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      out.push({ at: start, to: end, cls: "head" });
      continue;
    }
    if (/^\s*>/.test(line)) {
      out.push({ at: start, to: end, cls: "com" });
      continue;
    }
    const bullet = /^(\s*(?:[-*+]|\d+\.)\s)/.exec(line);
    if (bullet?.[1] !== undefined) out.push({ at: start, to: start + bullet[1].length, cls: "punc" });

    /* Inline code, and only inline code. Emphasis is left alone: asterisks are
     * common in ordinary prose and a highlighter that colours half a sentence
     * because somebody used one is worse than a highlighter that does not try. */
    const inline = /`[^`\n]+`/g;
    let hit: RegExpExecArray | null;
    while ((hit = inline.exec(line)) !== null) {
      out.push({ at: start + hit.index, to: start + hit.index + hit[0].length, cls: "code" });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

/* ------------------------------------------------------------------ *
 * Brackets                                                            *
 * ------------------------------------------------------------------ */

const OPENERS = "{[(";
const CLOSERS = "}])";
const PARTNER: Readonly<Record<string, string>> = { "{": "}", "[": "]", "(": ")", "}": "{", "]": "[", ")": "(" };

/**
 * One byte per character: 1 where that character is inside text rather than code.
 *
 * BUILT ONCE PER PASS, because the thing it replaced was a linear search through
 * the token list for every bracket in the file. On a hand-edited script that is
 * unnoticeable and on a pasted one it is the reason the workshop stops responding,
 * and the second case is exactly the one this feature makes possible.
 */
function literalMask(text: string, tokens: readonly Token[]): Uint8Array {
  const mask = new Uint8Array(text.length);
  for (const token of tokens) {
    if (token.cls !== "str" && token.cls !== "com" && token.cls !== "code") continue;
    const to = Math.min(token.to, text.length);
    for (let i = Math.max(0, token.at); i < to; i++) mask[i] = 1;
  }
  return mask;
}

/**
 * The pair of offsets to light up for the bracket at the caret, or nothing.
 *
 * Both sides of the caret are considered, which is what makes this feel right
 * rather than nearly right: a caret after a closing brace is on it as far as
 * anybody reading is concerned.
 */
export function matchingBrackets(lang: Language, text: string, caret: number): readonly number[] {
  if (lang === "markdown" || lang === "text") return [];
  const mask = literalMask(text, tokenize(lang, text));
  for (const at of [caret, caret - 1]) {
    if (at < 0 || at >= text.length) continue;
    const ch = text[at] as string;
    if (!OPENERS.includes(ch) && !CLOSERS.includes(ch)) continue;
    if (mask[at] === 1) continue;
    const partner = findPartner(text, mask, at, ch);
    if (partner >= 0) return [at, partner];
    return [];
  }
  return [];
}

function findPartner(text: string, mask: Uint8Array, at: number, ch: string): number {
  const want = PARTNER[ch] as string;
  const step = OPENERS.includes(ch) ? 1 : -1;
  let depth = 0;
  for (let i = at; i >= 0 && i < text.length; i += step) {
    const c = text[i] as string;
    if ((OPENERS.includes(c) || CLOSERS.includes(c)) && mask[i] !== 1) {
      if (c === ch) depth++;
      else if (c === want) {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

/* ------------------------------------------------------------------ *
 * Problems                                                            *
 * ------------------------------------------------------------------ */

/**
 * What is wrong with this text, as far as can be known without a parser.
 *
 * Empty for markdown and plain text, which have no wrong.
 */
export function problemsIn(lang: Language, text: string): readonly SyntaxProblem[] {
  switch (lang) {
    case "json":
      return jsonProblems(text);
    case "js":
      return jsProblems(text);
    default:
      return [];
  }
}

/**
 * What `JSON.parse` says, placed on a line.
 *
 * THE VERDICT IS ALWAYS THE PARSER'S. Whether a file is valid JSON is decided by
 * the same function the game decides it with, and nothing here second-guesses that.
 *
 * WHERE IT WENT WRONG IS NOT ALWAYS THE PARSER'S TO SAY, which is the reason for
 * the walk below. V8 puts a position in some of its messages and not in others:
 * "Expected double-quoted property name in JSON at position 10 (line 1 column 11)"
 * carries one, and "Unexpected token '}', ...<snippet> is not valid JSON" carries
 * none at all - and that second form is the one a half-typed file produces most
 * often. Reporting every one of those on line 1 would make the line number worth
 * less than nothing in exactly the case it is most wanted, so when the message has
 * no position, `jsonFault` walks the tokens and finds one.
 */
function jsonProblems(text: string): readonly SyntaxProblem[] {
  if (text.trim() === "") return [];
  try {
    JSON.parse(text);
    return [];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const spot = /line (\d+) column (\d+)/.exec(message);
    if (spot?.[1] !== undefined && spot[2] !== undefined) {
      return [{ line: Number(spot[1]), column: Number(spot[2]), message: tidy(message) }];
    }
    const offset = /position (\d+)/.exec(message);
    const at = offset?.[1] !== undefined ? Number(offset[1]) : jsonFault(text);
    const where = positionAt(text, at);
    return [{ line: where.line, column: where.column, message: tidy(message) }];
  }
}

/**
 * The offset at which this text stops being JSON.
 *
 * A grammar walk over the tokens rather than a parser: it builds nothing and
 * returns nothing but a place. Called only after `JSON.parse` has already refused,
 * so it never has to decide whether a file is valid - only where the first thing
 * that cannot be there is. If it somehow finds nothing wrong, the end of the text
 * is the honest answer, because that is where a file that ran out early stopped.
 */
function jsonFault(text: string): number {
  const tokens = tokenizeJson(text);
  let at = 0;

  const fault = (): number => tokens[at]?.at ?? text.length;

  const isPunc = (ch: string): boolean => {
    const token = tokens[at];
    return token !== undefined && token.cls === "punc" && text.slice(token.at, token.to) === ch;
  };

  const value = (): number => {
    const token = tokens[at];
    if (token === undefined) return text.length;
    if (token.cls === "str" || token.cls === "key" || token.cls === "num" || token.cls === "lit") {
      at++;
      return -1;
    }
    if (isPunc("{")) return object();
    if (isPunc("[")) return array();
    return fault();
  };

  const object = (): number => {
    at++; /* past the brace */
    if (isPunc("}")) {
      at++;
      return -1;
    }
    for (;;) {
      const name = tokens[at];
      if (name === undefined) return text.length;
      if (name.cls !== "key" && name.cls !== "str") return fault();
      at++;
      if (!isPunc(":")) return fault();
      at++;
      const bad = value();
      if (bad !== -1) return bad;
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("}")) {
        at++;
        return -1;
      }
      return fault();
    }
  };

  const array = (): number => {
    at++; /* past the bracket */
    if (isPunc("]")) {
      at++;
      return -1;
    }
    for (;;) {
      const bad = value();
      if (bad !== -1) return bad;
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("]")) {
        at++;
        return -1;
      }
      return fault();
    }
  };

  const bad = value();
  if (bad !== -1) return bad;
  return tokens[at]?.at ?? text.length;
}

/** Drop the position the message ends with, since it is shown separately. */
function tidy(message: string): string {
  return message.replace(/\s*(?:in JSON )?at position \d+.*$/, "").trim() || message;
}

/**
 * The three things a scanner can be sure of in JavaScript.
 *
 * NOT A SYNTAX CHECK, and the screen that shows these says so in those words. A
 * file with every bracket balanced and every quote closed can still be nonsense,
 * and this will call it clean. What it will not do is call something broken that is
 * not, which is the property that decides whether anybody trusts the pane at all.
 */
function jsProblems(text: string): readonly SyntaxProblem[] {
  const out: SyntaxProblem[] = [];
  const tokens = tokenizeJs(text);

  for (const token of tokens) {
    if (token.cls === "com" && text.startsWith("/*", token.at) && !text.slice(token.at, token.to).endsWith("*/")) {
      const where = positionAt(text, token.at);
      out.push({ ...where, message: "This block comment is never closed. It swallows everything after it." });
    }
    if (token.cls === "str") {
      const quote = text[token.at] as string;
      const run = text.slice(token.at, token.to);
      const closed = quote === "`" ? run.length > 1 && run.endsWith("`") : run.length > 1 && run.endsWith(quote) && !run.endsWith(`\\${quote}`);
      if (!closed) {
        const where = positionAt(text, token.at);
        out.push({ ...where, message: `This ${quote === "`" ? "template" : "string"} is never closed.` });
      }
    }
  }

  const mask = literalMask(text, tokens);
  const stack: { at: number; ch: string }[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    if (!OPENERS.includes(ch) && !CLOSERS.includes(ch)) continue;
    if (mask[i] === 1) continue;
    if (OPENERS.includes(ch)) {
      stack.push({ at: i, ch });
      continue;
    }
    const top = stack.pop();
    if (top === undefined) {
      out.push({ ...positionAt(text, i), message: `A closing ${ch} with nothing open to close.` });
      continue;
    }
    if (PARTNER[top.ch] !== ch) {
      out.push({
        ...positionAt(text, i),
        message: `A ${ch} closes the ${top.ch} opened on line ${positionAt(text, top.at).line}, which wanted ${PARTNER[top.ch]}.`,
      });
    }
  }
  for (const left of stack) {
    out.push({ ...positionAt(text, left.at), message: `This ${left.ch} is never closed.` });
  }

  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}
