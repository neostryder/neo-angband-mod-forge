/**
 * @vitest-environment jsdom
 *
 * The plugin's own surface: the way in, and the one gesture that opens the
 * workshop.
 *
 * These are the tests the host's own checks cannot make. The row has to be
 * absent, not inert, when the player has turned it off, and opening has to build
 * into the page the game made rather than onto the document behind it.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { api2NotGranted, api2Ok, api2Unavailable, type ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import plugin from "./plugin.js";

afterEach(() => {
  plugin.stop();
  document.getElementById("neo-angband-mod-forge")?.remove();
  document.body.replaceChildren();
});

interface Fake {
  readonly mod: ModApi2;
  readonly rows: { action: string; label: string; run: () => void | Promise<void> }[];
  readonly logs: string[];
  readonly overlay: ReturnType<typeof vi.fn>;
}

/** The slice of the game this entry touches: flags, the menu, the overlay, and the stored drafts. */
function fake(flags: Record<string, boolean>, options: { overlay?: "page" | "refused" | "absent"; menu?: "ok" | "refused" } = {}): Fake {
  const rows: Fake["rows"] = [];
  const logs: string[] = [];
  let panelRoot: ShadowRoot | undefined;
  const overlay = vi.fn(async () => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    panelRoot = mount.attachShadow({ mode: "closed" });
    let settle: () => void = () => undefined;
    const closed = new Promise<void>((resolveClosed) => {
      settle = resolveClosed;
    });
    const panel = {
      id: "forge:workshop",
      root: panelRoot,
      open: true,
      closed,
      close() {
        mount.remove();
        settle();
      },
    };
    return api2Ok(panel);
  });
  const ui: Record<string, unknown> = {
    gameMenu: {
      register: vi.fn(async (action: string, label: string, run: () => void | Promise<void>) => {
        if (options.menu === "refused") return api2NotGranted("ui:menu.row");
        rows.push({ action, label, run });
        return api2Ok(null);
      }),
    },
  };
  if (options.overlay !== "absent") {
    ui["overlay"] = options.overlay === "refused" ? vi.fn(async () => api2Unavailable("no page")) : overlay;
  }
  const mod = {
    meta: {
      id: "forge",
      api: "2.0.0",
      engine: "test",
      tier: "first-party",
      flags,
      granted: () => false,
      log: (message: string) => logs.push(message),
    },
    ui,
    content: { records: async () => api2Ok([]) },
    store: { prefs: { get: async () => api2Ok(null), set: async () => api2Ok(null) } },
  } as unknown as ModApi2;
  return { mod, rows, logs, overlay };
}

describe("the plugin's shape", () => {
  it("declares the API range the manifest names", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "manifest.json"), "utf8")) as {
      data: { api?: string };
    };
    expect(plugin.api).toBe(">=2.0.0 <3.0.0");
    expect(manifest.data.api).toBe(plugin.api);
  });

  it("starts the game's way and declares no API 1 members", () => {
    expect(typeof plugin.start).toBe("function");
    expect("regions" in plugin).toBe(false);
  });
});

describe("the way in", () => {
  it("is one Game-menu row", async () => {
    const game = fake({ "builder.showTab": true });
    await plugin.start(game.mod);
    expect(game.rows.map((row) => [row.action, row.label])).toEqual([["open-workshop", "Build a mod..."]]);
  });

  it("is absent, not inert, when the player has switched it off", async () => {
    const off = fake({ "builder.showTab": false });
    await plugin.start(off.mod);
    expect(off.rows).toEqual([]);
    const unset = fake({});
    await plugin.start(unset.mod);
    expect(unset.rows).toEqual([]);
  });

  it("says so in the log when the game will not take the row", async () => {
    const game = fake({ "builder.showTab": true }, { menu: "refused" });
    await plugin.start(game.mod);
    expect(game.logs.join("\n")).toContain("no way in");
  });
});

describe("choosing the row", () => {
  it("opens the workshop in the page the game made", async () => {
    const game = fake({ "builder.showTab": true });
    await plugin.start(game.mod);
    await game.rows[0]!.run();
    expect(game.overlay).toHaveBeenCalledWith({ id: "workshop", modal: true, label: "ModForge", closeAt: "bottom-right" });
    /* The workshop drew nothing of its own on the document. */
    expect(document.getElementById("neo-angband-mod-forge")).toBeNull();
  });

  it("opens it once, however many times the row is chosen", async () => {
    const game = fake({ "builder.showTab": true });
    await plugin.start(game.mod);
    await Promise.all([game.rows[0]!.run(), game.rows[0]!.run()]);
    await game.rows[0]!.run();
    expect(game.overlay).toHaveBeenCalledTimes(1);
  });

  it("draws its own overlay when the game will not make a page, and says so", async () => {
    const game = fake({ "builder.showTab": true }, { overlay: "refused" });
    await plugin.start(game.mod);
    await game.rows[0]!.run();
    expect(document.getElementById("neo-angband-mod-forge")).not.toBeNull();
    expect(game.logs.join("\n")).toContain("draws its own");
  });

  it("draws its own overlay on a host that has no overlay member", async () => {
    const game = fake({ "builder.showTab": true }, { overlay: "absent" });
    await plugin.start(game.mod);
    await game.rows[0]!.run();
    expect(document.getElementById("neo-angband-mod-forge")).not.toBeNull();
  });

  it("closes the workshop when the mod is stopped", async () => {
    const game = fake({ "builder.showTab": true }, { overlay: "absent" });
    await plugin.start(game.mod);
    await game.rows[0]!.run();
    plugin.stop();
    expect(document.getElementById("neo-angband-mod-forge")).toBeNull();
  });
});
