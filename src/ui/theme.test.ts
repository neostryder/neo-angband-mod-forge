/**
 * The stylesheet, checked for the two things that break it silently.
 *
 * IT IS A TEMPLATE LITERAL, which means a backtick anywhere inside it ends the
 * string and turns the rest of the file into a syntax error somewhere else
 * entirely. That happened once, from a code comment about `overflow: hidden`
 * written in the style the rest of this repository uses, and the error it
 * produced named a line thirty rows further down. So the rule is: no backticks
 * and no dollar-brace inside the stylesheet, and a test rather than a memory.
 *
 * IT ALSO HAS TO HOLD THE ONE RULE that was found by looking at the thing: a card
 * with `overflow: hidden` is a flex item whose automatic minimum height resolves
 * to zero, so without `flex: none` every card on a full screen clips its own
 * content away.
 */

import { describe, expect, it } from "vitest";
import { THEME_CSS } from "./theme.js";

describe("the stylesheet", () => {
  it("contains nothing that would end its own template literal", () => {
    expect(THEME_CSS).not.toContain("`");
    expect(THEME_CSS).not.toContain("${");
  });

  it("stops a card from shrinking below its own content", () => {
    const card = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-card {"));
    const block = card.slice(0, card.indexOf("}"));
    expect(block).toContain("overflow: hidden");
    expect(block).toContain("flex: none");
  });

  it("backs the in-app README with the existing card tokens and explicit ink", () => {
    const readme = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-readme-card {"));
    const block = readme.slice(0, readme.indexOf("}"));
    expect(block).toContain("color: var(--ink)");
    expect(block).toContain("border: 1px solid var(--edge)");
    expect(block).toContain("background: var(--surface-2)");
  });

  it("defines both treatments, and every colour in both", () => {
    const dark = tokens(THEME_CSS, ":host {");
    const parchment = tokens(THEME_CSS, ":host(.mb-parchment) {");
    expect(dark.size).toBeGreaterThan(20);
    for (const name of parchment) expect(dark.has(name)).toBe(true);
    /* Every colour token redefined, so parchment is a treatment rather than a
     * partial repaint with half the dark palette showing through. */
    for (const name of dark) {
      if (!name.startsWith("--font") && !name.startsWith("--r") && name !== "--gap" && name !== "--pad" && name !== "--motion") {
        expect(parchment.has(name), `${name} is not redefined for parchment`).toBe(true);
      }
    }
  });

  it("turns motion off for a reader who has asked for less of it", () => {
    expect(THEME_CSS).toContain("prefers-reduced-motion");
  });
});

function tokens(css: string, selector: string): Set<string> {
  const at = css.indexOf(selector);
  const block = css.slice(at, css.indexOf("\n}", at));
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] as string));
}
