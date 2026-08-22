/**
 * @vitest-environment jsdom
 */

/**
 * The element builder, and the one thing it silently dropped.
 *
 * AN OPTION'S VALUE IS NOT ITS LABEL, and an option with no value attribute reports
 * its TEXT as its value. `HTMLOptionElement` was missing from the branch that
 * applies `value`, so every option this file ever built had its value thrown away
 * and answered with its own label instead.
 *
 * NOTHING LOOKED BROKEN, which is why this test exists rather than a comment. The
 * two selects in the workshop mostly passed a value equal to its label, so they
 * worked by coincidence. The one that did not was the rebalance screen's operation
 * picker - `{ value: "mul", text: "multiply by" }`, read back as
 * `opPick.value === "mul" ? "mul" : "add"`. It read "multiply by", missed, and fell
 * to the default, so choosing "multiply by" ADDED. Silently, every time, on a screen
 * whose whole purpose is applying one change to a hundred records at once.
 *
 * The lesson generalises past options: a builder that accepts an attribute and
 * quietly ignores it for one element type produces a bug with no error, no warning
 * and no wrong-looking code at the call site. So the test is per element type.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { h, useDocument } from "./dom.js";

/* `h` builds through whichever document it was handed, so a test that only ever
 * runs under jsdom still has to hand it one - the workshop's own does it at mount. */
beforeEach(() => {
  useDocument(document);
});

describe("h() applies value where value means something", () => {
  it("gives an option the value it was asked for, not its label", () => {
    const option = h("option", { value: "mul", text: "multiply by" });
    expect(option.value).toBe("mul");
    expect(option.textContent).toBe("multiply by");
  });

  it("lets a select be read back by the value of the option chosen", () => {
    /* The whole shape the rebalance screen and the test panel both rely on. */
    const select = h(
      "select",
      null,
      h("option", { value: "add", text: "add" }),
      h("option", { value: "mul", text: "multiply by" }),
    );
    select.value = "mul";
    expect(select.value).toBe("mul");
  });

  it("keeps an empty value empty rather than filling it with the label", () => {
    /* The "no choice yet" row in the field editor, whose value is deliberately the
     * empty string and whose label is a sentence. */
    const option = h("option", { value: "", text: "one of the 12 the game uses" });
    expect(option.value).toBe("");
  });

  it("still applies value to the inputs it always did", () => {
    expect(h("input", { type: "text", value: "42" }).value).toBe("42");
    expect(h("textarea", { value: "a description" }).value).toBe("a description");
  });
});
