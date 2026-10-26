/**
 * ModForge: make your own mod from inside the game.
 *
 * ------------------------------------------------------------------
 * ENTRY POINT CONTRACT
 * ------------------------------------------------------------------
 *
 * A mod that runs code default-exports a mod API 2 definition:
 *
 *   export default { api: ">=2.0.0 <3.0.0", async start(mod) { ... } }
 *
 * Everything it uses arrives on `mod`, the running game's API 2 root. This file
 * imports the mod SDK for TYPES ONLY, and that is not a style choice: the same
 * source is built to the `plugin.js` this repository ships, and a module fetched
 * from a folder cannot resolve a bare specifier. Nor should it, because a bundled
 * copy of the engine would give the plugin its own registries and singletons
 * while the game ran on another set, which is a failure with no error message
 * anywhere.
 *
 * ------------------------------------------------------------------
 * THE WAY IN: A ROW IN THE GAME MENU
 * ------------------------------------------------------------------
 *
 * `start` registers one row, "Build a mod...", in the game's own menu, and the
 * row opens the workshop. That needs `registry:menu` and nothing else. The tab
 * this mod used to paint in the corner of the main screen belonged to API 1's
 * region system, which API 2 does not have; a menu row is the way a mod gets a
 * door without restyling any screen of the game's.
 *
 * ------------------------------------------------------------------
 * WHAT THE WORKSHOP GETS FROM THE GAME
 * ------------------------------------------------------------------
 *
 * The authoring library (`manage.authoring`), the records composed for the
 * running game (`content.records`), the debug commands (`manage.wizard`), the
 * session loader and reload (`manage.loadForSession`, `manage.reloadGame`), and
 * the page it draws on (`ui.overlay`). `src/host/api2-ctx.ts` makes those calls
 * when the workshop opens and hands the workshop the same context shape it has
 * always read; `docs/ENGINE_SEAMS.md` records each seam. A call the game refuses
 * leaves that seam off, and the workshop says why in words. The small
 * demonstration set remains for a standalone or partial test context; when it is
 * used, the workshop says so in a banner it will not let the player dismiss.
 */

import type { Api2ModDefinition, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { FLAG } from "./src/host/context.js";
import { buildBuilderCtx } from "./src/host/api2-ctx.js";
import type { HostPanel } from "./src/ui/overlay.js";
import { openWorkshop } from "./src/workshop.js";
import type { WorkshopHandle } from "./src/workshop.js";

/** The menu row's label. */
const ROW = "Build a mod...";

/** One handle for the session. Opening the workshop twice would mean two overlays fighting over the keyboard. */
let handle: WorkshopHandle | undefined;
let opening = false;

async function open(mod: ModApi2): Promise<void> {
  if (opening || handle?.open === true) return;
  opening = true;
  try {
    const doc: Document | undefined = (globalThis as { document?: Document }).document;
    const ctx = await buildBuilderCtx(mod);

    /* The page the game makes for a first-party mod. A host that will not make
     * one (a test, a refusal) leaves the workshop to draw its own. */
    let panel: HostPanel | undefined;
    if (mod.ui.overlay) {
      const made = await mod.ui.overlay({ id: "workshop", modal: true, label: "ModForge" });
      if (made.ok) panel = made.value;
      else mod.meta.log(`the game would not make a page for the workshop (${made.message}), so it draws its own`);
    }

    handle = openWorkshop(ctx, doc, panel);
    if (handle === undefined) {
      panel?.close();
      mod.meta.log("no document to build the workshop into, so there is nothing to open");
    }
  } finally {
    opening = false;
  }
}

export default {
  api: ">=2.0.0 <3.0.0",

  async start(mod: ModApi2): Promise<void> {
    if (mod.meta.flags[FLAG.showTab] !== true) return;
    const row = await mod.ui.gameMenu.register("open-workshop", ROW, () => open(mod));
    if (!row.ok) mod.meta.log(`the game menu would not take the workshop's row (${row.message}), so there is no way in`);
  },

  stop(): void {
    handle?.close();
    handle = undefined;
  },
} satisfies Api2ModDefinition;
