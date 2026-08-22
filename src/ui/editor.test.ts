/**
 * @vitest-environment jsdom
 *
 * The keyboard, driven by keys, which is the one thing the rest of the suite cannot
 * do.
 *
 * WHY THIS FILE EXISTS AT ALL. The workshop's other tests set a value and dispatch
 * an `input` event, because that is what a test can do through the DOM. Two real
 * bugs in the keyboard shipped invisible to them for exactly that reason, both
 * recorded in the editor's own header. Everything below goes through `keys`, which
 * is the whole of the editor's key handling - there is no listener to bypass - so a
 * test here is the same path a keystroke takes.
 *
 * WHAT IS BEING PINNED is not that a brace closes itself. It is the four rules that
 * decide when it does NOT, because those are what make the feature something other
 * than a nuisance, and every one of them is a line somebody could reasonably delete
 * while tidying up.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { useDocument } from "./dom.js";
import { codeEditor } from "./editor.js";
import type { CodeEditor } from "./editor.js";
import type { Language } from "../model/syntax.js";

let editor: CodeEditor | undefined;

beforeEach(() => {
  useDocument(document);
  editor?.dispose();
  editor = undefined;
  document.body.replaceChildren();
});

interface Open {
  readonly ed: CodeEditor;
  readonly area: HTMLTextAreaElement;
  /** Press a key at the caret, and say whether the editor claimed it. */
  press(key: string, options?: { shiftKey?: boolean; ctrlKey?: boolean }): boolean;
  /** Put the caret somewhere, or select a range. */
  at(start: number, end?: number): void;
}

function open(text: string, lang: Language = "json"): Open {
  const ed = codeEditor({ doc: document, lang, text, onInput: () => undefined, onSave: () => undefined });
  editor = ed;
  document.body.appendChild(ed.el);
  const area = ed.el.querySelector("textarea");
  if (!area) throw new Error("the editor built no textarea");
  area.focus();
  /* `keys` refuses everything unless the editor believes it has focus, and focus in
   * jsdom does not fire the `focusin` the editor listens for on its own root. */
  ed.el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

  return {
    ed,
    area,
    press(key, options = {}) {
      return ed.keys(new KeyboardEvent("keydown", { key, bubbles: true, ...options }));
    },
    at(start, end = start) {
      area.setSelectionRange(start, end);
    },
  };
}

describe("closing a bracket", () => {
  it("puts the pair in and leaves the caret between them", () => {
    const it_ = open("");
    expect(it_.press("{")).toBe(true);
    expect(it_.area.value).toBe("{}");
    expect(it_.area.selectionStart).toBe(1);
  });

  it("does the same for a square bracket and a paren", () => {
    const it_ = open("");
    it_.press("[");
    expect(it_.area.value).toBe("[]");
    const other = open("", "js");
    other.press("(");
    expect(other.area.value).toBe("()");
  });

  it("does NOT close in front of a word, which is the rule that stops it being fought", () => {
    const it_ = open("value", "js");
    it_.at(0);
    expect(it_.press("(")).toBe(false);
    /* Refused, so the browser inserts the one character it was asked for and the
     * text is unchanged as far as this test can see. */
    expect(it_.area.value).toBe("value");
  });

  it("closes in front of whitespace and in front of another closer", () => {
    const spaced = open(" tail", "js");
    spaced.at(0);
    expect(spaced.press("(")).toBe(true);
    expect(spaced.area.value).toBe("() tail");

    const nested = open("()", "js");
    nested.at(1);
    expect(nested.press("[")).toBe(true);
    expect(nested.area.value).toBe("([])");
  });

  it("steps over a closer the reader types out instead of doubling it", () => {
    const it_ = open("{}");
    it_.at(1);
    expect(it_.press("}")).toBe(true);
    expect(it_.area.value).toBe("{}");
    expect(it_.area.selectionStart).toBe(2);
  });

  it("wraps a selection rather than replacing it", () => {
    const it_ = open("keep me", "js");
    it_.at(0, 4);
    expect(it_.press("(")).toBe(true);
    expect(it_.area.value).toBe("(keep) me");
    /* The selection survives, so a second wrap wraps the same words again. */
    expect(it_.area.value.slice(it_.area.selectionStart, it_.area.selectionEnd)).toBe("keep");
  });

  it("takes both halves of an empty pair out with one Backspace, and with one Delete", () => {
    const back = open("{}");
    back.at(1);
    expect(back.press("Backspace")).toBe(true);
    expect(back.area.value).toBe("");

    const forward = open("[]");
    forward.at(1);
    expect(forward.press("Delete")).toBe(true);
    expect(forward.area.value).toBe("");
  });

  it("leaves an ordinary Backspace alone", () => {
    const it_ = open("abc");
    it_.at(2);
    expect(it_.press("Backspace")).toBe(false);
    expect(it_.area.value).toBe("abc");
  });
});

describe("closing a quote", () => {
  it("pairs the one quote JSON has", () => {
    const it_ = open("");
    expect(it_.press('"')).toBe(true);
    expect(it_.area.value).toBe('""');
  });

  it("does not pair an apostrophe in JSON, where it could never be valid", () => {
    const it_ = open("");
    expect(it_.press("'")).toBe(false);
    expect(it_.area.value).toBe("");
  });

  it("pairs all three in JavaScript", () => {
    for (const quote of ['"', "'", "`"]) {
      const it_ = open("", "js");
      expect(it_.press(quote)).toBe(true);
      expect(it_.area.value).toBe(`${quote}${quote}`);
    }
  });

  it("leaves an apostrophe after a letter alone, so a possessive stays one", () => {
    const it_ = open("// it", "js");
    it_.at(5);
    expect(it_.press("'")).toBe(false);
    expect(it_.area.value).toBe("// it");
  });

  it("steps over the closing quote of a string the reader is finishing", () => {
    const it_ = open('"ab"');
    it_.at(3);
    expect(it_.press('"')).toBe(true);
    expect(it_.area.selectionStart).toBe(4);
    expect(it_.area.value).toBe('"ab"');
  });

  it("closes nothing at all in prose", () => {
    for (const lang of ["markdown", "text"] as const) {
      const it_ = open("", lang);
      expect(it_.press("(")).toBe(false);
      expect(it_.press('"')).toBe(false);
      expect(it_.area.value).toBe("");
    }
  });
});

describe("the auto-indent and the auto-close together", () => {
  it("opens a block when Enter is pressed inside an empty pair", () => {
    const it_ = open('{\n  "a": {}\n}\n');
    it_.at(it_.area.value.indexOf("{}") + 1);
    expect(it_.press("Enter")).toBe(true);
    expect(it_.area.value).toBe('{\n  "a": {\n    \n  }\n}\n');
    /* On the blank line between them, at the inner indent. */
    expect(it_.area.value.slice(0, it_.area.selectionStart).endsWith("\n    ")).toBe(true);
  });

  it("still indents one level after a trailing opener with nothing after it", () => {
    const it_ = open("{");
    it_.at(1);
    it_.press("Enter");
    expect(it_.area.value).toBe("{\n  ");
  });

  it("still keeps the current indent on an ordinary line", () => {
    const it_ = open("  abc");
    it_.at(5);
    it_.press("Enter");
    expect(it_.area.value).toBe("  abc\n  ");
  });
});

describe("what the editor does not claim", () => {
  it("leaves an ordinary letter to the browser", () => {
    const it_ = open("");
    expect(it_.press("a")).toBe(false);
  });

  it("leaves a bracket alone when a modifier is held, because that is somebody's chord", () => {
    const it_ = open("");
    expect(it_.press("{", { ctrlKey: true })).toBe(false);
    expect(it_.area.value).toBe("");
  });

  it("leaves every key alone when the caret is not in it", () => {
    const it_ = open("");
    it_.ed.el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    expect(it_.press("{")).toBe(false);
  });
});
