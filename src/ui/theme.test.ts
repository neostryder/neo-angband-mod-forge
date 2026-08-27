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
     * partial repaint with half the dark palette showing through. The list below
     * is everything that is NOT a colour - a face, a size, a radius, a length, a
     * duration - and it is the only reason a token may be absent from parchment.
     * A treatment changes the ink and the paper; it does not change the metrics. */
    for (const name of dark) {
      if (NOT_A_COLOUR.some((prefix) => name.startsWith(prefix))) continue;
      expect(parchment.has(name), `${name} is not redefined for parchment`).toBe(true);
    }
  });

  it("sizes every rule from the responsive type scale rather than from a made-up fraction", () => {
    const scale = new Set([...THEME_CSS.matchAll(/--fs-[a-z]+:\s*([^;]+)/g)].map((m) => m[1] as string));
    expect(scale.size).toBeGreaterThan(6);
    /* The two exceptions are the file editor's own text and its line numbers, and
     * they are exceptions because `editor.ts` does pixel arithmetic against those
     * exact numbers to line two stacked layers up character by character. */
    const literals = [...THEME_CSS.matchAll(/font-size:\s*([0-9.]+px)/g)].map((m) => m[1] as string);
    const strays = [...new Set(literals)].filter((size) => size !== "12px");
    expect(strays, "a font size that is not on the scale").toEqual([]);
  });

  it("centres a single-column page and lets its measure grow on a large viewport", () => {
    const tokens = THEME_CSS.slice(THEME_CSS.indexOf(":host {"), THEME_CSS.indexOf("\n}", THEME_CSS.indexOf(":host {")));
    expect(tokens).toContain("--page: clamp(900px, 58vw, 2200px)");
    const page = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-body > .mb-main {"));
    const block = page.slice(0, page.indexOf("}"));
    expect(block).toContain("width: min(100%, var(--page))");
    expect(block).toContain("margin-inline: auto");
  });

  it("gives the frame one grid row per child, so the content takes the slack", () => {
    const frame = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-frame {"));
    const rows = /grid-template-rows:\s*([^;]+);/.exec(frame.slice(0, frame.indexOf("}")))?.[1] ?? "";
    /* Five children - titlebar, breadcrumb, banner, body, status bar - and the
     * 1fr belongs to the fourth, which is the body. With four tracks for five
     * children the banner took the 1fr and grew to fill any leftover height. */
    const tracks = rows.trim().split(/\s+/);
    expect(tracks).toHaveLength(5);
    expect(tracks[3]).toBe("1fr");
  });

  it("makes a card head look pressable only when it is a button", () => {
    expect(THEME_CSS).toContain("button.mb-card-head:hover");
    const head = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-card-head {"));
    expect(head.slice(0, head.indexOf("}"))).not.toContain("cursor: pointer");
  });

  it("gives the launch and exit layers their own typography, not the game page's", () => {
    const launch = THEME_CSS.slice(THEME_CSS.indexOf("\n.mb-launch, .mb-exit {"));
    const block = launch.slice(0, launch.indexOf("}"));
    /* Both are siblings of mb-scrim rather than children of it, so nothing about
     * the workshop's typography reaches them by inheritance. */
    expect(block).toContain("font-family: var(--font-body)");
    expect(block).toContain("font-size: var(--fs-body)");
    expect(block).toContain("color: var(--ink)");
  });

  it("turns motion off for a reader who has asked for less of it", () => {
    expect(THEME_CSS).toContain("prefers-reduced-motion");
  });
});

/** Token prefixes that carry a metric rather than a colour. */
const NOT_A_COLOUR = ["--font", "--fs-", "--r", "--gap", "--pad", "--gutter", "--page", "--control", "--rail", "--aside", "--motion"];

function tokens(css: string, selector: string): Set<string> {
  const at = css.indexOf(selector);
  const block = css.slice(at, css.indexOf("\n}", at));
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] as string));
}
