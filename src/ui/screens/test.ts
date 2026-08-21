/**
 * Test: put something in front of you and go and look at it.
 *
 * THE SCREEN SAYS WHAT IT COSTS, ONCE, BEFORE THE FIRST SPAWN, AND NOT IN A
 * TOOLTIP. Every one of the game's debug commands is gated on the character's
 * NOSCORE.DEBUG bit; that mark is permanent, and a marked character is barred from
 * the high score list for the rest of its life. That is a real consequence, and a
 * consequence that arrives without warning is the one thing a convenience is not
 * allowed to do. So the workshop does not take the mark on anybody's behalf: it
 * says the mark is required, says what it does, and leaves the decision where the
 * game already put it.
 *
 * WHAT CAN BE SPAWNED IS WHAT IS LOADED, and the screen is plain about why. A
 * record built here is not in the game until the mod is installed and the game has
 * reloaded, which is a thing enabling any mod already requires. So the loop is
 * build, install, reload, spawn - and the panel is still useful before any of that
 * because it will hand you the thing you are about to copy.
 */

import { h } from "../dom.js";
import { spawnable, spawnByName } from "../../host/spawn.js";
import type { SpawnKind } from "../../host/spawn.js";
import { button, card, empty, searchBox } from "../widgets.js";
import type { AppState } from "../store.js";
import type { View, Workshop } from "../view.js";

const PAGE = 60;

export function testScreen(shop: Workshop): View {
  const el = h("div", { class: "mb-main" });

  const intro = h(
    "div",
    { class: "mb-prose" },
    h("h2", { text: "Test something" }),
    h("p", {
      text:
        "This puts a creature beside you, or an item on the floor where you are standing, using the game's own " +
        "debug commands. It reaches only what the game currently has loaded, so something you have just built " +
        "appears here after you install the mod and the game reloads.",
    }),
    h("p", null, h("b", { text: "It marks the character. " }),
      "Angband records that a character has been handed something this way, permanently, and a marked character " +
      "cannot appear on the high score list again. The workshop will not take that mark for you: the game's own " +
      "debug toggle is where that decision belongs.",
    ),
  );

  const kindPick = h(
    "select",
    null,
    h("option", { value: "monster", text: "a creature, beside me" }),
    h("option", { value: "object", text: "an item, on the floor" }),
  );
  const search = searchBox("filter by name", (value) => shop.acts.setFilter(value));
  const list = h("div", { class: "mb-list" });
  const more = button({
    label: "Show more",
    kind: "ghost",
    onClick: () => {
      shown += PAGE;
      render(shop.store.get());
    },
  });

  const panel = card({ title: "Spawn", open: true });
  panel.body.append(h("div", { class: "mb-row-actions" }, kindPick, search), list, more);

  const blocked = h("div", { class: "mb-banner" });

  el.append(intro, blocked, panel.el);

  let shown = PAGE;

  const render = (state: AppState): void => {
    const seam = shop.seams.spawn;
    if (!seam.available) {
      blocked.style.display = "";
      blocked.replaceChildren(h("b", { text: "Not available. " }), h("span", { text: seam.why ?? "" }));
      panel.el.style.display = "none";
      return;
    }
    blocked.style.display = "none";
    panel.el.style.display = "";

    const kind = (kindPick.value === "object" ? "object" : "monster") as SpawnKind;
    const names = spawnable(shop.registries, kind);
    const needle = state.filter.trim().toLowerCase();
    const matched = needle === "" ? names : names.filter((name) => name.toLowerCase().includes(needle));
    const page = matched.slice(0, shown);

    more.style.display = matched.length > page.length ? "" : "none";
    more.textContent = `Show more (${matched.length - page.length} left)`;

    panel.setNote(`${matched.length} of ${names.length} loaded`);
    list.replaceChildren(
      ...(page.length === 0
        ? [
            empty(
              "?",
              names.length === 0 ? "Nothing is loaded to spawn" : "Nothing matches",
              names.length === 0
                ? "The game has not handed the workshop its registries, so there is nothing to choose from."
                : "No loaded record has that in its name.",
            ),
          ]
        : page.map((name) =>
            h(
              "button",
              {
                class: "mb-listrow",
                type: "button",
                on: {
                  click: () => {
                    const live = shop.seams.spawn;
                    if (!live.available || live.deps === undefined || live.state === undefined) return;
                    const outcome = spawnByName(shop.core, live.state, live.deps, shop.registries, kind, name);
                    shop.acts.notice(outcome.says, outcome.ok ? "good" : "bad");
                  },
                },
              },
              h("span", { class: "mb-badge", text: kind === "monster" ? "o" : "|" }),
              h("span", { class: "mb-listrow-main" }, h("span", { class: "mb-listrow-name", text: name })),
              h("span", { class: "mb-row-acts" }, h("span", { class: "mb-tag", text: "spawn" })),
            ),
          )),
    );
  };

  kindPick.addEventListener("change", () => {
    shown = PAGE;
    render(shop.store.get());
  });

  render(shop.store.get());

  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) {
        shown = PAGE;
        render(next);
      }
    },
    dispose: () => undefined,
  };
}
