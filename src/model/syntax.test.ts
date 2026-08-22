/**
 * The tokenizer and the two checks over it.
 *
 * WHAT THESE TESTS ARE ACTUALLY FOR, and it is not the colours. A wrong colour is
 * a wrong colour. A wrong PROBLEM is a tool telling somebody their file is broken
 * when it is not, which is the one failure that makes a check worth turning off. So
 * most of what follows is about the JavaScript check being SILENT where it cannot
 * be certain, and that is the property to keep if any of this is ever rewritten.
 */

import { describe, expect, it } from "vitest";
import {
  languageFor,
  matchingBrackets,
  offsetAt,
  positionAt,
  problemsIn,
  tokenize,
} from "./syntax.js";

/** The class covering an offset, or nothing, so a test can read like a sentence. */
function classAt(lang: Parameters<typeof tokenize>[0], text: string, at: number): string | undefined {
  return tokenize(lang, text).find((token) => at >= token.at && at < token.to)?.cls;
}

describe("choosing a language", () => {
  it("reads it off the extension, and calls anything else plain text", () => {
    expect(languageFor("manifest.json")).toBe("json");
    expect(languageFor("plugin.js")).toBe("js");
    expect(languageFor("lib/dice.mjs")).toBe("js");
    expect(languageFor("README.md")).toBe("markdown");
    expect(languageFor("LICENSE")).toBe("text");
    expect(languageFor("notes.txt")).toBe("text");
  });
});

describe("colouring JSON", () => {
  it("tells a key from a string by what follows it, not by a parse", () => {
    const text = '{ "name": "grey wolf" }';
    expect(classAt("json", text, 3)).toBe("key");
    expect(classAt("json", text, 11)).toBe("str");
  });

  it("still colours a half-typed file, which is the only state an editor sees", () => {
    const tokens = tokenize("json", '{ "depth": 3, "na');
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some((token) => token.cls === "num")).toBe(true);
  });

  it("marks the three literals as literals", () => {
    const text = '{ "a": true, "b": null, "c": false }';
    expect(classAt("json", text, 8)).toBe("lit");
    expect(classAt("json", text, 19)).toBe("lit");
  });
});

describe("colouring JavaScript", () => {
  it("knows a comment, a string, a template, a keyword and a number apart", () => {
    const text = 'const x = 1; // note\nlet s = "hi";\nlet t = `a${1}b`;';
    expect(classAt("js", text, 0)).toBe("kw");
    expect(classAt("js", text, 10)).toBe("num");
    expect(classAt("js", text, 14)).toBe("com");
    expect(classAt("js", text, 30)).toBe("str");
    expect(classAt("js", text, text.indexOf("`"))).toBe("str");
  });

  it("keeps a template whole across a substitution holding braces", () => {
    const text = "const t = `x${ {a:1} }y`; const after = 2;";
    /* The closing brace of the object literal must not end the template, or
     * everything after it is coloured as if it were inside one. */
    expect(classAt("js", text, text.indexOf("y`"))).toBe("str");
    expect(classAt("js", text, text.indexOf("after"))).toBeUndefined();
    expect(classAt("js", text, text.lastIndexOf("2"))).toBe("num");
  });

  it("reads a slash after a value as division and a slash after a keyword as a pattern", () => {
    const divided = tokenize("js", "const half = total / 2;");
    expect(divided.some((token) => token.cls === "str")).toBe(false);
    const pattern = tokenize("js", "if (x) return /ab+c/gi;");
    expect(pattern.some((token) => token.cls === "str")).toBe(true);
  });

  it("does not treat an apostrophe inside a comment as an unterminated string", () => {
    expect(problemsIn("js", "// don't do this\nconst a = 1;\n")).toEqual([]);
  });
});

describe("what is wrong with a JSON file", () => {
  it("says nothing about a file that parses, and nothing about an empty one", () => {
    expect(problemsIn("json", '{ "a": 1 }')).toEqual([]);
    expect(problemsIn("json", "   \n ")).toEqual([]);
  });

  it("puts the parser's own complaint on a line", () => {
    const found = problemsIn("json", '{\n  "a": 1,\n  "b": 2\n}\n'.replace('"b": 2', '"b":'));
    expect(found).toHaveLength(1);
    expect(found[0]?.message).not.toBe("");
    /* Line 4, where the brace turns up in place of the value line 3 promised. The
     * point of the assertion is not the exact line: it is that a message V8 gives
     * NO position for still lands somewhere other than line 1, because a line
     * number that is always 1 is worse than no line number at all. */
    expect(found[0]?.line).toBeGreaterThan(1);
  });

  it("finds the place for every shape of complaint, including the ones V8 does not locate", () => {
    /* A trailing comma. V8 gives a position for this one. */
    const comma = problemsIn("json", '{\n  "a": 1,\n}\n');
    expect(comma[0]?.line).toBe(3);

    /* A missing comma between two entries. V8 gives no position for this one. */
    const missing = problemsIn("json", '{\n  "a": 1\n  "b": 2\n}\n');
    expect(missing[0]?.line).toBe(3);

    /* A value that was never written. */
    const empty = problemsIn("json", '{\n  "a":\n}\n');
    expect(empty[0]?.line).toBe(3);

    /* An array that is never closed reports at the end, which is where it ran out. */
    const unclosed = problemsIn("json", '{\n  "a": [1, 2\n');
    expect(unclosed).toHaveLength(1);
    expect(unclosed[0]?.line).toBeGreaterThanOrEqual(2);
  });
});

describe("what is wrong with a script, and what is deliberately not looked at", () => {
  it("says nothing about a module that is fine, export default and all", () => {
    const text = 'export default {\n  api: 1,\n  hooks(ctx) {\n    return {};\n  },\n};\n';
    expect(problemsIn("js", text)).toEqual([]);
  });

  it("finds a brace that is never closed, and names the line it was opened on", () => {
    const found = problemsIn("js", "function a() {\n  return 1;\n");
    expect(found).toHaveLength(1);
    expect(found[0]?.line).toBe(1);
    expect(found[0]?.message).toContain("never closed");
  });

  it("finds a block comment that swallows the rest of the file", () => {
    const found = problemsIn("js", "/* started\nconst a = 1;\n");
    expect(found.some((problem) => problem.message.includes("block comment"))).toBe(true);
  });

  it("finds a string that runs off the end of its line", () => {
    const found = problemsIn("js", 'const a = "unclosed;\nconst b = 2;\n');
    expect(found.some((problem) => problem.message.includes("never closed"))).toBe(true);
  });

  it("finds a bracket closed with the wrong one", () => {
    const found = problemsIn("js", "const a = [1, 2};\n");
    expect(found.some((problem) => problem.message.includes("wanted"))).toBe(true);
  });

  /**
   * THE PROPERTY THAT MATTERS MOST, stated as a test so it cannot quietly stop
   * being true: a script that is nonsense but balanced is reported as clean. This
   * is not a shortcoming to be fixed later by making the check cleverer without
   * saying so - the interface tells the reader exactly this, and a check that
   * started guessing would make that sentence a lie.
   */
  it("says nothing at all about code that is balanced and meaningless", () => {
    expect(problemsIn("js", "const = = = ;\n")).toEqual([]);
    expect(problemsIn("js", "function () function\n")).toEqual([]);
  });

  it("has nothing to say about prose", () => {
    expect(problemsIn("markdown", "# A heading\n\nA paragraph with a { in it.\n")).toEqual([]);
    expect(problemsIn("text", "{{{")).toEqual([]);
  });
});

describe("brackets under the caret", () => {
  it("matches from either side of the caret", () => {
    const text = "a(b)c";
    expect(matchingBrackets("js", text, 1)).toEqual([1, 3]);
    expect(matchingBrackets("js", text, 4)).toEqual([3, 1]);
  });

  it("ignores a bracket that is inside a string", () => {
    const text = 'const a = "(" + b;';
    expect(matchingBrackets("js", text, text.indexOf("("))).toEqual([]);
  });

  it("finds nothing when there is nothing to find", () => {
    expect(matchingBrackets("js", "const a = 1;", 3)).toEqual([]);
    expect(matchingBrackets("js", "function a() {", 13)).toEqual([]);
  });
});

describe("places in the text", () => {
  it("counts lines and columns from one, as an editor does", () => {
    const text = "one\ntwo\nthree";
    expect(positionAt(text, 0)).toEqual({ line: 1, column: 1 });
    expect(positionAt(text, 4)).toEqual({ line: 2, column: 1 });
    expect(positionAt(text, 6)).toEqual({ line: 2, column: 3 });
  });

  it("turns a line and column back into the same offset", () => {
    const text = "one\ntwo\nthree";
    for (let at = 0; at <= text.length; at++) {
      const where = positionAt(text, at);
      expect(offsetAt(text, where.line, where.column)).toBe(at);
    }
  });

  it("clamps a column past the end of its line rather than crossing into the next", () => {
    const text = "ab\ncd";
    expect(offsetAt(text, 1, 99)).toBe(2);
    expect(offsetAt(text, 99, 1)).toBe(3);
  });
});
