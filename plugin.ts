/**
 * ModForge: make your own mod from inside the game.
 *
 * ------------------------------------------------------------------
 * ENTRY POINT CONTRACT - one shape, for every mod and every front end
 * ------------------------------------------------------------------
 *
 * A mod that runs code default-exports a ModPlugin:
 *
 *   export default { api: 1, regions(ctx) { ... } }
 *
 * `ctx.core` is the ENGINE, handed in. This file imports the engine and the mod
 * SDK for TYPES ONLY, and that is not a style choice: the same source is built to
 * the `plugin.js` this repository ships, and a module fetched from a folder
 * cannot resolve a bare specifier. Nor should it, because a bundled copy of the
 * engine would give the plugin its own registries and singletons while the game
 * ran on another set, which is a failure with no error message anywhere.
 *
 * ------------------------------------------------------------------
 * THE WAY IN, AND WHY IT IS A TAB RATHER THAN A MENU
 * ------------------------------------------------------------------
 *
 * The mod declares one region - a rectangle over the game's own text grid - and
 * paints a tab into it in the game's own idiom. Tapping the tab opens the
 * workshop. That needs `ui:region.create` and nothing else, and it needs no
 * change to the engine at all.
 *
 * The alternative was to take one of the game's menus with `ui:menu.replace` and
 * route a row of its own into the workshop. That works, and it was not chosen: a
 * presenter has to draw the whole question it takes, so a mod whose real job is
 * elsewhere would be restyling one of the game's own screens as the price of
 * having a door. A one-row tab is the smaller promise.
 *
 * The region is painted by the host once per frame, so the tab does not have to
 * maintain itself. What it cannot survive is a full-screen erase the region
 * system does not know about, of which the game still has a number: on those
 * screens the tab is simply not there, and it is back on the next frame that
 * declares its regions. That is a real rough edge and it is written down in
 * PLANNED.md rather than glossed here.
 *
 * ------------------------------------------------------------------
 * WHAT THE WORKSHOP GETS FROM A SUPPORTED ENGINE
 * ------------------------------------------------------------------
 *
 * Neo Angband 1.0.0 hands this plugin the authoring SDK and the records composed
 * for the running game. `docs/ENGINE_SEAMS.md` traces that route and records all
 * five seam decisions. The small demonstration set remains for a standalone or
 * partial test context; when it is used, the workshop says so in a banner it will
 * not let the player dismiss. Installing another mod in place remains deliberately
 * absent, while session loading and the Test panel use their landed host surfaces.
 */

import type { RegionDeclaration, RegionPointer, RegionSurface } from "@rpgm-tools/neo-angband-mod-sdk";
import type { BuilderCtx } from "./src/host/context.js";
import { FLAG } from "./src/host/context.js";
import { openWorkshop } from "./src/workshop.js";
import type { WorkshopHandle } from "./src/workshop.js";

/** The tab's label, and therefore the region's width. */
const TAB = " Build a mod ";

/** The game's own colour names, as the region surface takes them. */
const TAB_INK = "#e0bb64";
const TAB_GROUND = "#222721";

export default {
  api: 1,

  /**
   * One region, one row, in the bottom right, painted in text.
   *
   * `place` is called on every frame and has to be cheap, total and pure, so it
   * does arithmetic and nothing else. It clamps rather than refusing on a grid too
   * small for the label, because returning a rectangle outside the grid would be
   * this mod's fault and not the terminal's.
   */
  regions(ctx: BuilderCtx): readonly RegionDeclaration[] {
    if (ctx.flags[FLAG.showTab] !== true) return [];

    /* One handle for the session. Opening the workshop twice would mean two
     * overlays fighting over the keyboard, and the second one's listeners would
     * outlive the first one's element. */
    let handle: WorkshopHandle | undefined;

    const open = (): void => {
      if (handle?.open === true) return;
      const doc: Document | undefined = (globalThis as { document?: Document }).document;
      handle = openWorkshop(ctx, doc);
      if (handle === undefined) {
        ctx.log?.("no document to build the workshop into, so there is nothing to open");
      }
    };

    return [
      {
        id: "workshop",
        layer: "overlay",
        place(grid: { readonly cols: number; readonly rows: number }) {
          const cols = Math.min(TAB.length, Math.max(1, grid.cols));
          return {
            col: Math.max(0, grid.cols - cols),
            row: Math.max(0, grid.rows - 1),
            cols,
            rows: 1,
          };
        },
        paint(surface: RegionSurface) {
          const size = surface.size();
          if (size.cols <= 0 || size.rows <= 0) return;
          surface.print(0, 0, TAB.slice(0, size.cols), TAB_INK, TAB_GROUND);
        },
        input(pointer: RegionPointer) {
          if (pointer.kind !== "tap") return;
          open();
        },
      },
    ];
  },
};
