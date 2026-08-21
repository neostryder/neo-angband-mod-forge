/**
 * @vitest-environment jsdom
 *
 * The plugin's own surface: the tab, and the one gesture that opens the workshop.
 *
 * These are the tests the host's own checks cannot make. `place` runs on every
 * frame and has to be cheap, total and pure, so a grid narrower than the label
 * has to produce a rectangle inside the grid rather than an exception in the
 * paint loop. And the tab has to be absent, not blank, when the player has turned
 * it off.
 */

import { afterEach, describe, expect, it } from "vitest";
import plugin from "./plugin.js";
import type { BuilderCtx } from "./src/host/context.js";

afterEach(() => {
  document.getElementById("neo-angband-mod-builder")?.remove();
  document.body.replaceChildren();
});

function ctx(flags: Record<string, boolean>): BuilderCtx {
  return {
    id: "builder",
    engine: "0.25.0",
    flags,
    core: {} as BuilderCtx["core"],
    log: () => undefined,
    prefs: {
      get: () => undefined,
      set: () => undefined,
    },
  };
}

/** A surface that records what was painted into it. */
function surface(cols: number, rows: number): {
  size(): { cols: number; rows: number };
  clear(): void;
  print(x: number, y: number, text: string, fg: string, bg?: string): void;
  prt(x: number, y: number, text: string, fg: string): void;
  eraseToEol(x: number, y: number): void;
  setCursor(x: number, y: number): void;
  hideCursor(): void;
  written: string[];
} {
  const written: string[] = [];
  return {
    size: () => ({ cols, rows }),
    clear: () => undefined,
    print: (_x, _y, text) => {
      written.push(text);
    },
    prt: (_x, _y, text) => {
      written.push(text);
    },
    eraseToEol: () => undefined,
    setCursor: () => undefined,
    hideCursor: () => undefined,
    written,
  };
}

describe("the plugin's shape", () => {
  it("declares the ABI version the manifest declares", () => {
    expect(plugin.api).toBe(1);
  });

  it("supplies regions, which is what makes it a plugin the host will load", () => {
    expect(typeof plugin.regions).toBe("function");
  });
});

describe("the tab", () => {
  it("is absent, not blank, when the player has switched it off", () => {
    /* Not merely inert: a region declared and painted with nothing would still
     * take a rectangle of the screen away from the game. */
    expect(plugin.regions(ctx({ "builder.showTab": false }))).toEqual([]);
    expect(plugin.regions(ctx({}))).toEqual([]);
  });

  it("is one row, in the bottom right, on a normal terminal", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region) throw new Error("no region declared");
    expect(region.id).toBe("workshop");
    expect(region.layer).toBe("overlay");
    const cells = region.place({ cols: 80, rows: 24 });
    expect(cells.rows).toBe(1);
    expect(cells.row).toBe(23);
    expect(cells.col + cells.cols).toBe(80);
  });

  it("stays inside a grid too small for its own label", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region) throw new Error("no region declared");
    for (const grid of [
      { cols: 1, rows: 1 },
      { cols: 4, rows: 2 },
      { cols: 0, rows: 0 },
    ]) {
      const cells = region.place(grid);
      expect(cells.col).toBeGreaterThanOrEqual(0);
      expect(cells.row).toBeGreaterThanOrEqual(0);
      expect(cells.cols).toBeGreaterThanOrEqual(1);
      expect(cells.col + cells.cols).toBeLessThanOrEqual(Math.max(1, grid.cols));
    }
  });

  it("paints its label, clipped to whatever room it was given", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region) throw new Error("no region declared");
    const wide = surface(13, 1);
    region.paint(wide);
    expect(wide.written.join("")).toContain("Build a mod");

    const narrow = surface(5, 1);
    region.paint(narrow);
    expect((narrow.written[0] ?? "").length).toBe(5);
  });

  it("paints nothing rather than throwing when it has no room at all", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region) throw new Error("no region declared");
    const none = surface(0, 0);
    expect(() => region.paint(none)).not.toThrow();
    expect(none.written).toEqual([]);
  });
});

describe("tapping the tab", () => {
  it("opens the workshop", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region?.input) throw new Error("the region takes no input");
    region.input({ col: 0, row: 0, kind: "tap" });
    expect(document.getElementById("neo-angband-mod-builder")).not.toBeNull();
  });

  it("opens it once, however many times it is tapped", () => {
    /* Two overlays would fight over the keyboard, and the second one's listeners
     * would outlive the first one's element. */
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region?.input) throw new Error("the region takes no input");
    region.input({ col: 0, row: 0, kind: "tap" });
    region.input({ col: 0, row: 0, kind: "tap" });
    expect(document.querySelectorAll("#neo-angband-mod-builder")).toHaveLength(1);
  });

  it("ignores anything that is not a tap", () => {
    const region = plugin.regions(ctx({ "builder.showTab": true }))[0];
    if (!region?.input) throw new Error("the region takes no input");
    region.input({ col: 0, row: 0, kind: "context" });
    expect(document.getElementById("neo-angband-mod-builder")).toBeNull();
  });
});
