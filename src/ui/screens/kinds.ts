/**
 * What are you making.
 *
 * The featured kinds first, as cards, then everything else behind one row rather
 * than thirty-seven. The order of the featured list is not alphabetical: it is
 * ordered by what people actually make, which across the two largest modding
 * communities anybody can look at is steeply weighted towards items, creatures,
 * shops and numbers. A picker that opened on `blow_methods` would be a picker
 * built for whoever wrote it.
 *
 * Each card offers both doors, because they are the same conversation from the
 * player's side: make a new one of these, or change one that exists.
 */

import { h } from "../dom.js";
import type { View, Workshop } from "../view.js";
import { button, card, empty, searchBox } from "../widgets.js";
import { contentKinds } from "../../model/kinds.js";
import type { ContentKind } from "../../model/kinds.js";
import type { AppState } from "../store.js";

export function kindsScreen(shop: Workshop): View {
  const kinds = contentKinds(shop.api);
  const featured = kinds.filter((k) => k.featured);
  const rest = kinds.filter((k) => !k.featured);

  const grid = h("div", { class: "mb-kinds" });
  const restGrid = h("div", { class: "mb-kinds" });
  const search = searchBox("filter every kind", (value) => shop.acts.setFilter(value));

  const kindCard = (kind: ContentKind): HTMLElement =>
    h(
      "div",
      { class: "mb-kind" },
      h("span", { class: "mb-kind-badge", text: kind.badge }),
      h(
        "span",
        null,
        h("span", { class: "mb-kind-title", text: kind.title }),
        h("div", { class: "mb-kind-blurb", text: kind.blurb }),
        h(
          "div",
          { class: "mb-row-actions", style: { "margin-top": "8px" } },
          button({
            label: "Make a new one",
            tiny: true,
            kind: "primary",
            onClick: () => shop.acts.go({ at: "base", file: kind.file, mode: "new" }),
            tip: "You will pick something that already exists to base it on, and the workshop will fill it in from that.",
          }),
          button({
            label: "Change one",
            tiny: true,
            onClick: () => shop.acts.go({ at: "base", file: kind.file, mode: "change" }),
            tip: "Adjust a record the base game or another mod already owns. Your mod ships the difference, not the record.",
          }),
          button({
            label: "Retune many",
            tiny: true,
            kind: "ghost",
            onClick: () => shop.acts.go({ at: "rebalance", file: kind.file }),
            tip: "One numeric adjustment applied to every record you filter down to.",
          }),
        ),
        h("div", { class: "mb-label-meta", style: { "margin-top": "6px" }, text: `${kind.file}.json` }),
      ),
    );

  const everything = card({
    title: "Everything else",
    note: `${rest.length} more record file${rest.length === 1 ? "" : "s"} the game composes one record at a time`,
    open: false,
    onToggle: () => everything.setOpen(everything.el.dataset["open"] !== "1"),
  });
  everything.body.append(
    h("div", {
      class: "mb-why",
      text:
        "All of these work exactly like the ones above. They are down here because a first mod is very rarely a " +
        "pain message or a room template, not because they are second class.",
    }),
    search,
    restGrid,
  );

  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "What are you making?" }),
      h("p", {
        text:
          "Every one of these is a file the game reads at startup, and a mod contributes to one by adding records " +
          "to it or by adjusting records already in it.",
      }),
    ),
    grid,
    everything.el,
  );

  for (const kind of featured) grid.appendChild(kindCard(kind));

  const clearFilter = (): void => {
    search.value = "";
    shop.acts.setFilter("");
  };

  const renderRest = (filter: string): void => {
    const needle = filter.trim().toLowerCase();
    const shown = needle === "" ? rest : rest.filter((k) => k.file.includes(needle) || k.title.toLowerCase().includes(needle));
    restGrid.replaceChildren(
      ...(shown.length === 0
        ? [
            empty(
              "?",
              "Nothing matches",
              "No record file has that in its name. The four above are not in this list.",
              button({ label: "Clear the filter", kind: "primary", onClick: clearFilter }),
            ),
          ]
        : shown.map(kindCard)),
    );
  };
  renderRest("");

  return {
    el,
    update(next: AppState, prev: AppState) {
      if (next.filter !== prev.filter) renderRest(next.filter);
    },
    dispose: () => undefined,
  };
}
