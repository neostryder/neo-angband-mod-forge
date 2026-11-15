import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as Core from "@rpgm-tools/neo-angband-core";
import { apiRangeVerdict, validateManifest } from "@rpgm-tools/neo-angband-mod-sdk";
import type { Api2ModDefinition, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { sdkDocs } from "./src/ui/sdk-docs-content.js";

/**
 * `docs/README.md`'s settings table and `manifest.json` must agree.
 *
 * The table is the quick reference the game's own README links a player at, so
 * a switch that is renamed, removed, or flipped from on to off in the manifest
 * and left alone here does not read as out of date. It reads as fact, and the
 * player who follows it goes looking for a toggle that is not there.
 *
 * A toggle lives under EITHER `rules` or `sections`, and both render the same
 * way on the Mods screen. That is the specific trap this file exists for: the
 * first draft of the page was built from `rules` alone and silently lost two of
 * the four switches in this mod family's bug-fixes mod, and one of the five in
 * upstream-catchup, without anything failing. A section may also carry no flag
 * of its own, in which case its id is what identifies it.
 *
 * The description cell is deliberately NOT checked. It is the manifest's own
 * first sentence, and pinning prose here would fail on an ordinary reword and
 * teach the next person to delete the check rather than fix the page.
 */
describe("the settings table and the manifest", () => {
  interface Toggle {
    flag?: string;
    id?: string;
    title?: string;
    default?: unknown;
  }

  /* The manifest is a schema 2 document, so its fields sit under `data`. */
  const manifest = (): { rules?: Toggle[]; sections?: Toggle[] } =>
    (
      JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8")) as {
        data: { rules?: Toggle[]; sections?: Toggle[] };
      }
    ).data;

  const toggles = (): Toggle[] => {
    const read = manifest();
    /* A section that carries neither a flag nor a default is a grouping
     * heading rather than a switch, and is not a row. */
    const sections = (read.sections ?? []).filter(
      (s) => s.flag !== undefined || s.default !== undefined,
    );
    return [...(read.rules ?? []), ...sections];
  };

  const identify = (t: Toggle): string => t.flag ?? t.id ?? "";

  const rows = (): { title: string; identifier: string; default: string }[] => {
    const text = readFileSync(new URL("./docs/README.md", import.meta.url), "utf8");
    return text
      .split("\n")
      .filter((line) => line.startsWith("| "))
      .map((line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim()),
      )
      .filter((cells) => cells.length === 4 && cells[0] !== "Setting" && cells[0] !== "---")
      .map((cells) => ({
        title: cells[0] ?? "",
        identifier: (cells[1] ?? "").replace(/`/gu, ""),
        default: cells[2] ?? "",
      }));
  };

  it("cover exactly the same switches", () => {
    expect(rows().map((r) => r.identifier).sort()).toEqual(
      toggles().map(identify).sort(),
    );
  });

  it("agree on every title and default", () => {
    const table = new Map(rows().map((r) => [r.identifier, r]));

    for (const toggle of toggles()) {
      const row = table.get(identify(toggle));
      expect(row, `${identify(toggle)} is missing from docs/README.md`).toBeDefined();
      expect(row?.title).toBe(toggle.title);
      expect(row?.default, `${identify(toggle)} disagrees on its default`).toBe(
        toggle.default === true ? "on" : "off",
      );
    }
  });
});

const tutorialDir = resolve("docs/tutorials");
const tutorials = readdirSync(tutorialDir).filter((name) => /^\d\d-.*\.md$/.test(name));
const readTutorial = (name: string): string => readFileSync(resolve(tutorialDir, name), "utf8");

function example(name: string): Api2ModDefinition {
  const source = /```js\n(export default [\s\S]*?)\n```/.exec(readTutorial(name))?.[1];
  if (!source) throw new Error(`No plugin example in ${name}`);
  return (new Function(source.replace("export default", "return")) as () => Api2ModDefinition)();
}

describe("the local authoring documentation", () => {
  it("embeds all eight tutorials and local guides from their source files", () => {
    expect(tutorials).toHaveLength(8);
    const local = sdkDocs().filter((doc) => doc.source === "local");
    expect(local.map((doc) => doc.path).sort()).toEqual([
      ...tutorials.map((name) => `tutorials/${name}`),
      "tutorials/README.md", "AUTHORING.md", "SCAFFOLDING.md", "PUBLISHING.md",
    ].sort());
    for (const doc of local) {
      expect(doc.text, doc.path).toBe(readFileSync(resolve("docs", doc.path), "utf8").replace(/\r\n/g, "\n").replace(/\n{2,}$/u, "\n"));
    }
  });

  it("embeds the installed SDK references without stale text", () => {
    for (const doc of sdkDocs().filter((entry) => entry.source === "sdk")) {
      const source = readFileSync(resolve("node_modules/@rpgm-tools/neo-angband-mod-sdk/docs", doc.path), "utf8");
      expect(doc.text === source.replace(/\r\n/g, "\n").replace(/\n{2,}$/u, "\n"), doc.path).toBe(true);
    }
  });

  it("resolves every moved guide's relative file link inside this repository", () => {
    for (const doc of sdkDocs().filter((entry) => entry.source === "local")) {
      const file = resolve("docs", doc.path);
      for (const match of doc.text.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1] ?? "";
        if (/^(?:https?:|#)/.test(target)) continue;
        expect(existsSync(resolve(dirname(file), target.split("#")[0] ?? "")), `${doc.path}: ${target}`).toBe(true);
      }
    }
  });

  it.each(["01-tweak-a-value.md", "02-add-an-item.md", "05-hook-behaviour.md", "06-add-an-option.md", "08-add-a-store.md"])("validates %s with the published manifest reader", (name) => {
    const json = /```json\n([\s\S]*?)\n```/.exec(readTutorial(name))?.[1];
    expect(json).toBeDefined();
    const document = JSON.parse(json ?? "{}");
    expect(document.schemaVersion).toBe(2);
    const manifest = validateManifest(document);
    if (manifest.runtime !== "data") expect(apiRangeVerdict(manifest.api ?? "").ok).toBe(true);
  });

  it("transforms Core's real level-up message with tutorial 5's hook and preserves unrelated messages", () => {
    const contribution = example("05-hook-behaviour.md").hooks?.({ id: "my-code-mod", flags: {} });
    const hooks = Core.composeModHooks([{ messageText: contribution?.messageText! }]);
    const player = Core.blankPlayer({} as Core.PlayerRace, {} as Core.PlayerClass, { name: "test", count: 0, slots: [] });
    player.expFactor = 100;
    player.hitdie = 1;
    const messages: string[] = [];
    Core.playerExpGain(player, 10, { rng: new Core.Rng(7), msg: (text) => { messages.push(hooks?.messageText?.(text) ?? text); } });
    expect(player.lev).toBe(2);
    expect(messages).toEqual(["Congratulations! Welcome to level 2."]);
    expect(hooks?.messageText?.("You are poisoned.")).toBe("You are poisoned.");
  });

  it("registers tutorial 6's hook only when the option is on", () => {
    const plugin = example("06-add-an-option.md");
    expect(plugin.hooks?.({ id: "my-option-mod", flags: {} })).toEqual({});
    const contribution = plugin.hooks?.({ id: "my-option-mod", flags: { "my-option-mod.congratulate": true } });
    const hooks = Core.composeModHooks([{ messageText: contribution?.messageText! }]);
    expect(hooks?.messageText?.("Welcome to level 2.")).toBe("Congratulations! Welcome to level 2.");
  });

  it("uses tutorial 8's known view and leaves hidden enchantments out of its buying rule", async () => {
    const plugin = example("08-add-a-store.md");
    const rules = new Core.StoreBehaviourRegistry();
    rules.registerWillBuy("*", (shop) => shop.obj.tval === Core.TV.DIGGING);
    const kind = { dd: 1, ds: 4, ac: 0, toH: Core.zeroRv(), effect: null } as Core.ObjectKind;
    const sword = Core.objectNew(kind);
    sword.tval = Core.TV.SWORD;
    sword.toD = 5;
    sword.notice = Core.OBJ_NOTICE.ASSESSED;
    const player = { objKnown: Core.blankObjKnowledge() } as Core.Player;
    player.objKnown.toD = 0;
    const state = { actor: { player }, runeEnv: Core.makeRuneEnv(() => null, () => false) } as Core.GameState;
    const mod = {
      engine: {
        core: Core,
        state,
        registries: { stores: { byName: (name: string) => name === "STORE_GENERAL" ? { feat: Core.FEAT.STORE_GENERAL } : null } },
        registry: { stores: { willBuyFor: rules.willBuyFor.bind(rules), setWillBuy: rules.registerWillBuy.bind(rules) } },
      },
    } as unknown as ModApi2;
    await plugin.start?.(mod);
    const buy = rules.willBuyFor(Core.FEAT.STORE_GENERAL);
    const shop = { obj: sword } as Core.StoreWillBuyContext;
    expect(buy?.(shop)).toBe(false);
    player.objKnown.toD = 1;
    expect(buy?.(shop)).toBe(true);
    sword.toD = 0;
    expect(buy?.(shop)).toBe(false);
    sword.tval = Core.TV.DIGGING;
    expect(buy?.(shop)).toBe(true);
  });

  it("keeps tutorial 8's content-only shop when engine access is absent", async () => {
    expect(await example("08-add-a-store.md").start?.({} as ModApi2)).toBeUndefined();
  });
});
