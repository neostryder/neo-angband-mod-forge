/**
 * Pick something that already exists.
 *
 * THIS IS THE PRIMARY CREATION GESTURE, not a convenience on the way to a blank
 * form. Across every large modding community anybody can look at, the dominant
 * idiom is not authoring a record from nothing: it is finding one that already
 * works, cloning it, and changing what needs changing. The tools people actually
 * use put that gesture front and centre, and the ones that open a blank form get
 * a reputation for being for experts.
 *
 * A ROW FROM ANOTHER MOD IS MARKED, and the mark is not decoration. Basing a
 * record on another mod's record acquires a dependency on that mod, and the
 * workshop writes it at the moment of the choice rather than at build time.
 * Telling the player at the moment it happens is much cheaper than telling them
 * when the mod they hand to a friend does nothing on that friend's install.
 */

import { h } from "../dom.js";
import type { View, Workshop } from "../view.js";
import { button, empty, fillList, listRow, searchBox } from "../widgets.js";
import { kindFor } from "../../model/kinds.js";
import { labelOf, ownerOf } from "../../model/refs.js";
import type { JsonRecord } from "../../host/authoring.js";
import type { AppState } from "../store.js";

/** How many rows to draw at once. A file can be several hundred records. */
const PAGE = 120;

export function baseScreen(shop: Workshop, file: string, mode: "new" | "change"): View {
  const kind = kindFor(shop.api, file);
  const all = shop.records[file] ?? [];
  const peerField = peerFieldFor(shop, file);

  const list = h("div", { class: "mb-list" });
  const search = searchBox(`filter ${all.length} record${all.length === 1 ? "" : "s"}`, (value) =>
    shop.acts.setFilter(value),
  );
  const more = button({
    label: "Show more",
    kind: "ghost",
    onClick: () => {
      shown += PAGE;
      render(shop.store.get());
    },
  });

  const blank = button({
    label: "Start from nothing instead",
    kind: "ghost",
    tip:
      "A record with only the fields the game's own records always carry, filled with typical values. Useful when " +
      "nothing existing is close to what you have in mind.",
    onClick: () => shop.acts.addRecord(file, {}),
  });

  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: mode === "new" ? `Base your ${singular(kind.title)} on something` : `Which ${singular(kind.title)}?` }),
      h("p", {
        text:
          mode === "new"
            ? "The workshop will fill a new record in from the one you pick: its shape, its scale, and the values " +
              "its neighbours in the game actually carry. It will not copy its attacks, its flags, its spells or " +
              "anything else that would hand out powers you did not ask for."
            : "Your mod will ship the difference rather than the record, so the base game keeps owning it and two " +
              "mods adjusting different fields of it both work.",
      }),
    ),
    h("div", { class: "mb-row-actions" }, search, mode === "new" ? blank : null),
    list,
    more,
  );

  let shown = PAGE;

  const render = (state: AppState): void => {
    const needle = state.filter.trim().toLowerCase();
    const matches = needle === "" ? all : all.filter((r) => labelOf(shop.api, file, r).toLowerCase().includes(needle));
    const page = matches.slice(0, shown);
    more.style.display = matches.length > page.length ? "" : "none";
    more.textContent = `Show more (${matches.length - page.length} left)`;

    const rows = page.map((record) => rowFor(record));
    fillList(
      list,
      rows,
      empty(
        "?",
        "Nothing matches",
        all.length === 0
          ? `Nothing is loaded in ${file}, so there is nothing to base anything on.`
          : "No record in this file has that in its name.",
      ),
    );
  };

  const rowFor = (record: JsonRecord): HTMLElement => {
    const owner = ownerOf(shop.api, record);
    const key = shop.api.recordKey(file, record);
    const label = labelOf(shop.api, file, record);
    const notes: string[] = [];
    if (peerField !== undefined) {
      const value = record[peerField];
      if (typeof value === "string" || typeof value === "number") notes.push(`${peerField} ${String(value)}`);
    }
    for (const depth of ["depth", "level"]) {
      const value = record[depth];
      if (typeof value === "number") {
        notes.push(`${depth} ${value}`);
        break;
      }
    }
    const row = listRow({
      badge: kind.badge,
      name: label,
      meta: notes.join(", "),
      tags:
        owner === "core"
          ? []
          : [
              {
                text: owner,
                tone: "mod",
                tip:
                  `This record belongs to the "${owner}" mod. Using it means your mod depends on that mod, and the ` +
                  "workshop will write that down for you. Somebody without it installed gets nothing from yours.",
              },
            ],
      onClick: () => {
        if (mode === "new") seedFrom(record);
        else if (key !== null) shop.acts.patchRecord(file, `${owner}:${key}`);
        else shop.acts.notice("That record has no identity the game can address, so it cannot be adjusted.", "bad");
      },
    });
    if (shop.seams.spawn.available && mode === "new") {
      row.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Look at it",
          tiny: true,
          kind: "ghost",
          tip: "Put this in front of you in the game, so you can see what you are copying before you copy it.",
          onClick: () => shop.acts.go({ at: "test" }),
        }),
      );
    }
    if (mode === "change" && key !== null) {
      /* Removal is offered, and it is offered LAST, smallest, and in the
       * dangerous colour. It is one keypress away from a mod that deletes
       * something another mod depends on, and unlike every other gesture here it
       * has no in-between state to look at. Undo covers the mistake; the ref is
       * spelled out so the author knows exactly what they are taking away. */
      row.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Remove",
          tiny: true,
          kind: "danger",
          tip:
            `Take ${owner}:${key} out of the game entirely. Anything else that names it stops resolving, ` +
            "including another mod's changes to it. Undo brings it back.",
          onClick: () => shop.acts.removeRecord(file, `${owner}:${key}`),
        }),
      );
    }
    return row;
  };

  /**
   * The seed handed to the drafting call.
   *
   * The comparability fields and nothing else: the file's peer field so the new
   * record lands in the same family, and its depth so the peers are the ones at
   * the right point in the game. Everything else is what the drafting call is
   * for, and passing more here would be the workshop deciding instead of the
   * evidence deciding.
   */
  const seedFrom = (record: JsonRecord): void => {
    const seed: JsonRecord = {};
    if (peerField !== undefined) {
      const value = record[peerField];
      if (value !== undefined) seed[peerField] = value;
    }
    for (const depth of ["depth", "level"]) {
      const value = record[depth];
      if (typeof value === "number") {
        seed[depth] = value;
        break;
      }
    }
    shop.acts.addRecord(file, seed);
  };

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

/**
 * Which field decides whether two records in this file are comparable.
 *
 * The engine keeps its table private, so this asks the drafting stack instead: it
 * drafts nothing, it just reads which field the peer sentence talks about. When
 * that cannot be worked out the column is simply absent, which costs a note on a
 * row rather than the screen.
 */
function peerFieldFor(shop: Workshop, file: string): string | undefined {
  const sample = (shop.records[file] ?? [])[0];
  if (!sample) return undefined;
  const said = shop.api.peersFor(file, sample, shop.records).because;
  for (const field of Object.keys(sample)) {
    if (said.includes(`${field} is`)) return field;
  }
  return undefined;
}

function singular(title: string): string {
  return title.endsWith("s") ? title.slice(0, -1).toLowerCase() : title.toLowerCase();
}
