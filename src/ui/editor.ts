/**
 * A code editor, in one file, because a mod cannot borrow one.
 *
 * WHY NOT CODEMIRROR, asked and answered once: the game's own plugin builder marks
 * every non-relative import specifier external and then refuses the build if one
 * survives, so a mod may not carry a package. Vendoring an editor's sources under
 * `src/` would bundle and would also put about a megabyte of code nobody will read
 * inside an artefact that is deliberately shipped unminified so that somebody can.
 * `syntax.ts` carries the same argument about the tokenizer.
 *
 * ------------------------------------------------------------------
 * HOW IT IS BUILT: A TEXTAREA IN FRONT OF A PICTURE OF ITSELF
 * ------------------------------------------------------------------
 *
 * A real `<textarea>`, with transparent text and a visible caret, sits over an
 * aria-hidden `<pre>` holding the same characters in coloured spans. The textarea
 * is the only thing the reader interacts with, which is the entire reason for the
 * arrangement: selection, the clipboard, an input method mid-composition, a dead
 * key, autorepeat, a screen reader and the browser's own undo all keep working,
 * because none of them has been reimplemented. A `contenteditable` would have meant
 * reimplementing every one of them, and getting composition wrong in a game that
 * is translated.
 *
 * THE TWO LAYERS STAY ALIGNED BY CONSTRUCTION, not by measurement. Both use the
 * same font at the same size with a line height fixed in PIXELS rather than as a
 * ratio - a ratio is rounded per line by the browser, and a rounding difference of
 * a third of a pixel is a picture that has slid one line by the bottom of a long
 * file. The colour spans set a colour and nothing else: no weight, no slant, no
 * size, because every one of those changes how wide a character is.
 *
 * WRAPPING IS OFF and the textarea is the scroller. The picture behind it is
 * translated by the textarea's own scroll offsets, so there is one scrollbar and
 * one source of truth about where the text is.
 *
 * ------------------------------------------------------------------
 * WHY EVERY KEY GESTURE IS HANDED IN FROM ABOVE
 * ------------------------------------------------------------------
 *
 * The overlay listens for keys on the WINDOW in the capture phase and calls
 * `stopImmediatePropagation` on all of them, because the game's keyboard model is
 * single-owner and a letter that reaches it walks the character across the level.
 * A consequence, measured rather than assumed: a `keydown` listener on an element
 * inside the shadow root never runs at all. So this file registers no key listener.
 * It exposes `keys`, the shell offers it every key before the shell's own ladder
 * sees one, and a key this editor does not want is left alone - which is how the
 * browser keeps the chords that are its, including the textarea's own undo.
 *
 * `input`, `scroll`, `focusin` and `click` are not intercepted, so those are
 * ordinary listeners on ordinary elements.
 */

import { h } from "./dom.js";
import type { Language, SyntaxProblem, TokenClass } from "../model/syntax.js";
import { lineStarts, matchingBrackets, offsetAt, positionAt, tokenize } from "../model/syntax.js";

/**
 * The line height, in pixels, shared by both layers and by the scroller.
 *
 * A NUMBER RATHER THAN A RATIO, and it is the single most load-bearing constant
 * here. Every browser rounds a computed line height to device pixels per line, so
 * `line-height: 1.5` on a 12px font gives lines that are sometimes 18 and sometimes
 * 19 pixels tall - which is invisible on one line and is the picture sliding out
 * from under the text by the four hundredth. It is also what lets scrolling to a
 * line be arithmetic instead of a measurement.
 */
export const LINE_HEIGHT = 18;

/** The font size both layers use. Paired with the line height above. */
export const FONT_SIZE = 12;

/** The padding both layers use, so a character is at the same place in both. */
export const PAD = 8;

/** What one press of Tab inserts. Two spaces, as every emitted file uses. */
const INDENT = "  ";

/**
 * Above this many characters, nothing is coloured.
 *
 * A picture of the text is one DOM node per token, and a file with forty thousand
 * tokens is forty thousand nodes to build every time a key goes down. The ceiling
 * is not a guess about what is fast; it is the point past which a reader would
 * rather have a responsive editor than a coloured one, and the screen says which
 * one they have got rather than leaving them to wonder why it went grey.
 */
export const COLOUR_CEILING = 200_000;

/** Above this many characters, the picture is redrawn on a delay instead of at once. */
const PROMPT_CEILING = 40_000;

/** How long that delay is. Long enough to skip a burst of typing, short enough to feel live. */
const REPAINT_DELAY = 140;

export interface CodeEditor {
  readonly el: HTMLElement;
  /** What is in the editor now. */
  text(): string;
  /**
   * Put text in, and move the caret to the front.
   *
   * For loading a different file or reverting this one. Never called while the
   * reader is typing: assigning `value` throws away the caret, the selection and
   * the native undo stack, which is right for "this is a different file" and wrong
   * for anything else.
   */
  setText(text: string): void;
  /** Colour it in a different language, for a file saved under a new name. */
  setLanguage(lang: Language): void;
  focus(): void;
  /** Put the caret on a line, and scroll it into the middle of the view. */
  goTo(line: number, column?: number): void;
  /** Whether the reader is inside the editor at all. */
  hasFocus(): boolean;
  /** Offered every key before the shell's own ladder. True means handled. */
  keys(event: KeyboardEvent): boolean;
  /** Whether colouring is off because the file is too big for it. */
  colouring(): boolean;
  dispose(): void;
}

export interface CodeEditorOptions {
  readonly doc: Document;
  readonly lang: Language;
  readonly text: string;
  /** Called on every change, so the screen can hold the unsaved text. */
  readonly onInput: (text: string) => void;
  /** Called for the save chord, so the screen decides what saving means. */
  readonly onSave: () => void;
  /** Called when the caret moves, for the line and column readout. */
  readonly onCaret?: (line: number, column: number) => void;
}

export function codeEditor(options: CodeEditorOptions): CodeEditor {
  const { doc } = options;
  let lang = options.lang;

  const area = doc.createElement("textarea");
  area.className = "mb-ed-area";
  area.spellcheck = false;
  area.wrap = "off";
  area.value = options.text;
  area.setAttribute("aria-label", "The file, as text");
  /* Marked so the shell can tell that a chord it would otherwise claim - the
   * textarea's own undo - belongs to the browser while the caret is in here. */
  area.dataset["code"] = "1";

  const picture = h("pre", { class: "mb-ed-hl", aria: { hidden: "true" } });
  const gutter = h("div", { class: "mb-ed-nums", aria: { hidden: "true" } });

  const findInput = h("input", { type: "search", class: "mb-ed-find-box", placeholder: "Find", spellcheck: false });
  const findCount = h("span", { class: "mb-ed-find-count" });
  const findBar = h(
    "div",
    { class: "mb-ed-find" },
    findInput,
    h("button", { class: "mb-btn mb-tiny", type: "button", text: "Next", on: { click: () => step(1) } }),
    h("button", { class: "mb-btn mb-tiny", type: "button", text: "Previous", on: { click: () => step(-1) } }),
    findCount,
    h("button", { class: "mb-btn mb-tiny mb-ghost", type: "button", text: "Close", on: { click: () => showFind(false) } }),
  );
  findBar.style.display = "none";

  const el = h(
    "div",
    { class: "mb-ed" },
    findBar,
    h("div", { class: "mb-ed-body" }, h("div", { class: "mb-ed-gutter" }, gutter), h("div", { class: "mb-ed-box" }, picture, area)),
  );

  let focused = false;
  let repaint: ReturnType<typeof setTimeout> | undefined;
  let lines = -1;

  /* ---------------------------------------------------------------- *
   * Drawing                                                          *
   * ---------------------------------------------------------------- */

  const colouring = (): boolean => area.value.length <= COLOUR_CEILING;

  const paint = (): void => {
    const text = area.value;
    drawGutter(text);

    if (!colouring()) {
      /* Plain, and the screen says why. A file this size is still perfectly
       * editable; it is only the picture behind it that has been given up on. */
      picture.textContent = `${text}\n`;
      return;
    }

    const spans: { at: number; to: number; cls: string }[] = tokenize(lang, text).map((token) => ({
      at: token.at,
      to: token.to,
      cls: classOf(token.cls),
    }));

    /* The bracket under the caret and its partner, drawn over whatever was there.
     * Both are single characters and both are already punctuation tokens in every
     * language here, so replacing the one-character span is the whole of it. */
    const pair = focused ? matchingBrackets(lang, text, area.selectionStart) : [];
    if (pair.length === 2) {
      for (const at of pair) {
        const covering = spans.findIndex((span) => span.at === at && span.to === at + 1);
        if (covering >= 0) spans.splice(covering, 1);
        spans.push({ at, to: at + 1, cls: "mb-t-match" });
      }
      spans.sort((a, b) => a.at - b.at);
    }

    const parts: Node[] = [];
    let at = 0;
    for (const span of spans) {
      if (span.at < at || span.to > text.length) continue;
      if (span.at > at) parts.push(doc.createTextNode(text.slice(at, span.at)));
      parts.push(h("span", { class: span.cls, text: text.slice(span.at, span.to) }));
      at = span.to;
    }
    if (at < text.length) parts.push(doc.createTextNode(text.slice(at)));
    /* A trailing newline in a `pre` is collapsed by every browser, so a file that
     * ends in one would draw its picture one line short of its text and every line
     * after the first blank would be off by one. The sentinel is cheaper than
     * special-casing it. */
    parts.push(doc.createTextNode("\n"));
    picture.replaceChildren(...parts);
  };

  const schedulePaint = (): void => {
    if (repaint !== undefined) clearTimeout(repaint);
    repaint = setTimeout(
      () => {
        repaint = undefined;
        paint();
      },
      area.value.length > PROMPT_CEILING ? REPAINT_DELAY : 0,
    );
  };

  const drawGutter = (text: string): void => {
    const count = lineStarts(text).length;
    if (count === lines) return;
    lines = count;
    const numbers: string[] = [];
    for (let n = 1; n <= count; n++) numbers.push(String(n));
    gutter.textContent = numbers.join("\n");
  };

  const sync = (): void => {
    const x = -area.scrollLeft;
    const y = -area.scrollTop;
    picture.style.transform = `translate(${x}px, ${y}px)`;
    gutter.style.transform = `translateY(${y}px)`;
  };

  const reportCaret = (): void => {
    const where = positionAt(area.value, area.selectionStart);
    options.onCaret?.(where.line, where.column);
  };

  /* ---------------------------------------------------------------- *
   * Editing                                                          *
   * ---------------------------------------------------------------- */

  /**
   * Replace a range, keeping the browser's own undo stack if it will let us.
   *
   * `execCommand("insertText")` is deprecated and is the only way to put text into
   * a textarea that the browser records as an undoable step, so an indent stays
   * undoable with the same chord as everything else the reader typed. Where it is
   * refused, `setRangeText` still makes the edit and only the undo history is
   * poorer - which is the right way round for a fallback.
   */
  const replaceRange = (start: number, end: number, text: string): void => {
    area.focus();
    area.setSelectionRange(start, end);
    let native = false;
    try {
      native = doc.execCommand("insertText", false, text);
    } catch {
      native = false;
    }
    if (!native) {
      area.setRangeText(text, start, end, "end");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  /** The offsets of the first and last line the selection touches. */
  const selectedLines = (): { first: number; last: number } => {
    const starts = lineStarts(area.value);
    const first = positionAt(area.value, area.selectionStart).line - 1;
    const end = area.selectionEnd;
    let last = positionAt(area.value, end).line - 1;
    /* A selection that ends exactly at the start of a line has not reached into it,
     * so indenting three lines does not silently indent a fourth. */
    if (last > first && end === starts[last]) last--;
    return { first, last };
  };

  const indent = (out: boolean): void => {
    const text = area.value;
    const starts = lineStarts(text);
    const { first, last } = selectedLines();

    if (!out && first === last && area.selectionStart === area.selectionEnd) {
      replaceRange(area.selectionStart, area.selectionStart, INDENT);
      return;
    }

    const from = starts[first] ?? 0;
    const nextStart = starts[last + 1];
    const to = nextStart === undefined ? text.length : nextStart - 1;
    const block = text.slice(from, to);
    const changed = block
      .split("\n")
      .map((line) => {
        if (!out) return line === "" ? line : INDENT + line;
        if (line.startsWith(INDENT)) return line.slice(INDENT.length);
        return line.replace(/^[ \t]/, "");
      })
      .join("\n");
    if (changed === block) return;
    replaceRange(from, to, changed);
    area.setSelectionRange(from, from + changed.length);
  };

  /**
   * A new line that starts where the last one did.
   *
   * Plus one more level when the line being left ends in an opening bracket, which
   * is the whole of the auto-indentation here. Nothing closes a bracket for the
   * reader: a tool that types a character nobody asked for is a tool that has to be
   * fought at the end of every line.
   */
  const newline = (): void => {
    const text = area.value;
    const at = area.selectionStart;
    const start = offsetAt(text, positionAt(text, at).line, 1);
    const lead = /^[ \t]*/.exec(text.slice(start, at))?.[0] ?? "";
    const opens = /[{[(]\s*$/.test(text.slice(start, at));
    replaceRange(at, area.selectionEnd, `\n${lead}${opens ? INDENT : ""}`);
  };

  /* ---------------------------------------------------------------- *
   * Finding                                                          *
   * ---------------------------------------------------------------- */

  const showFind = (on: boolean): void => {
    findBar.style.display = on ? "" : "none";
    if (on) {
      findInput.focus();
      findInput.select();
    } else {
      findCount.textContent = "";
      area.focus();
    }
  };

  const step = (direction: 1 | -1): void => {
    const needle = findInput.value;
    if (needle === "") {
      findCount.textContent = "";
      return;
    }
    const hay = area.value.toLowerCase();
    const want = needle.toLowerCase();
    const all: number[] = [];
    for (let at = hay.indexOf(want); at >= 0; at = hay.indexOf(want, at + 1)) all.push(at);
    if (all.length === 0) {
      findCount.textContent = "not here";
      return;
    }
    const from = area.selectionStart;
    let index: number;
    if (direction === 1) {
      const next = all.findIndex((at) => at > from);
      index = next < 0 ? 0 : next;
    } else {
      const previous = [...all].reverse().find((at) => at < from);
      index = previous === undefined ? all.length - 1 : all.indexOf(previous);
    }
    const at = all[index] as number;
    findCount.textContent = `${index + 1} of ${all.length}`;
    area.focus();
    area.setSelectionRange(at, at + needle.length);
    scrollTo(positionAt(area.value, at).line);
    reportCaret();
    schedulePaint();
  };

  /** Put a line in the middle of the view, by arithmetic rather than by measurement. */
  const scrollTo = (line: number): void => {
    const middle = (line - 1) * LINE_HEIGHT - area.clientHeight / 2;
    area.scrollTop = Math.max(0, middle);
    sync();
  };

  /* ---------------------------------------------------------------- *
   * Listeners that are allowed to be listeners                       *
   * ---------------------------------------------------------------- */

  area.addEventListener("input", () => {
    options.onInput(area.value);
    schedulePaint();
    reportCaret();
  });
  area.addEventListener("scroll", sync);
  area.addEventListener("click", () => {
    reportCaret();
    schedulePaint();
  });
  el.addEventListener("focusin", () => {
    focused = true;
    schedulePaint();
  });
  el.addEventListener("focusout", () => {
    focused = false;
    schedulePaint();
  });
  findInput.addEventListener("input", () => step(1));

  /* The caret moved without a click and without a change, which is to say with an
   * arrow key - whose `keydown` this file never sees, for the reason in the header.
   * `selectionchange` is not intercepted, so it is the one signal left. */
  const onSelectionChange = (): void => {
    if (!focused) return;
    reportCaret();
    schedulePaint();
  };
  doc.addEventListener("selectionchange", onSelectionChange);

  paint();
  sync();

  return {
    el,
    text: () => area.value,
    setText(text) {
      area.value = text;
      lines = -1;
      paint();
      area.scrollTop = 0;
      area.scrollLeft = 0;
      sync();
    },
    setLanguage(next) {
      lang = next;
      paint();
    },
    focus() {
      area.focus();
    },
    goTo(line, column = 1) {
      const at = offsetAt(area.value, line, column);
      area.focus();
      area.setSelectionRange(at, at);
      scrollTo(line);
      reportCaret();
      schedulePaint();
    },
    hasFocus: () => focused,
    colouring,
    keys(event) {
      if (!focused) return false;
      const chord = event.ctrlKey || event.metaKey;
      const key = event.key;

      if (key === "Escape") {
        if (findBar.style.display === "none") return false;
        showFind(false);
        return true;
      }
      if (chord && key.toLowerCase() === "f") {
        showFind(true);
        return true;
      }
      if (chord && key.toLowerCase() === "s") {
        options.onSave();
        return true;
      }
      if (chord && key.toLowerCase() === "g") {
        step(event.shiftKey ? -1 : 1);
        return true;
      }
      /* Everything below is a gesture inside the text, so it belongs to the
       * textarea and not to the find box that may currently have the caret. */
      if (deepFocus(el) === findInput) {
        if (key === "Enter") {
          step(event.shiftKey ? -1 : 1);
          return true;
        }
        return false;
      }
      if (key === "Tab" && !event.altKey) {
        indent(event.shiftKey);
        return true;
      }
      if (key === "Enter" && !chord && !event.altKey) {
        newline();
        return true;
      }
      return false;
    },
    dispose() {
      if (repaint !== undefined) clearTimeout(repaint);
      doc.removeEventListener("selectionchange", onSelectionChange);
    },
  };
}

/** Which element inside a subtree has the caret, across the shadow boundary. */
function deepFocus(within: HTMLElement): Element | null {
  const root = within.getRootNode();
  const active = (root as ShadowRoot | Document).activeElement ?? null;
  return active !== null && within.contains(active) ? active : null;
}

/** The class one token class draws with. Colour only: see the header. */
function classOf(cls: TokenClass): string {
  return `mb-t-${cls}`;
}

/** A problem, as one line the reader can click. Built here so the screen stays thin. */
export function problemRow(problem: SyntaxProblem, onClick: () => void): HTMLElement {
  return h(
    "button",
    { class: "mb-ed-problem", type: "button", on: { click: onClick } },
    h("span", { class: "mb-ed-problem-at", text: `${problem.line}:${problem.column}` }),
    h("span", { text: problem.message }),
  );
}
