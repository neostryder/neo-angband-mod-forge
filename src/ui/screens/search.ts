/**
 * Search: every file in this mod, one query at a time.
 *
 * THE ONE THING THIS SCREEN ADDS OVER THE EDITOR'S OWN FIND BAR is the word
 * "every". Ctrl-F in the editor answers "where is this in the file I have
 * open"; this answers "where is this at all", which is the question an author
 * actually has the moment a mod grows past one file - a record's ref renamed
 * in one place and still spelled the old way in three others, a helper
 * function's name remembered but not which file it lives in.
 *
 * THE QUERY LIVES IN VIEW STATE, THE SAME `filter` FIELD `kinds.ts` AND
 * `rebalance.ts` ALREADY USE FOR A LIVE SEARCH BOX. Putting it in the route
 * instead would rebuild this screen, and the box in it, on every keystroke -
 * losing the caret on the very control the reader is typing into. `filter` is
 * reset to "" by `acts.go` on every navigation, so arriving here always starts
 * from an empty box, which is the right default for a screen that is itself a
 * search.
 */

import { h, setText } from "../dom.js";
import { MATCH_CEILING, searchDraft } from "../../model/search.js";
import type { SearchMatch } from "../../model/search.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { button, empty, fillList, listRow, searchBox } from "../widgets.js";
import type { View, Workshop } from "../view.js";

export function searchScreen(shop: Workshop): View {
  const main = h("div", { class: "mb-main" });

  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "Search looks across one mod's files, so there is nothing to search yet.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) }),
      ),
    );
    return { el: main, update: () => undefined, dispose: () => undefined };
  }

  const search = searchBox("search every file in this mod", (value) => shop.acts.setFilter(value));
  const count = h("div", { class: "mb-why" });
  const list = h("div", { class: "mb-list" });

  main.append(
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "Search this mod" }),
      h("p", {
        text:
          "Every text file this mod would write, searched at once. A match takes you straight into that file's " +
          "editor, at the line it is on.",
      }),
    ),
    search,
    count,
    list,
  );

  const rowFor = (match: SearchMatch): HTMLElement =>
    listRow({
      badge: "@",
      name: `${match.path}:${match.line}`,
      meta: match.snippet,
      onClick: () => shop.acts.openFile(match.path, match.line),
    });

  const render = (query: string): void => {
    const current = openDraft(shop.store.get());
    if (!current) return;
    const needle = query.trim();
    if (needle === "") {
      setText(count, "Type something above to search every file this mod would write.");
      fillList(list, [], empty("@", "Nothing yet", "Type a word or a name above to search every file in this mod."));
      return;
    }
    const matches = searchDraft(shop.api, current, shop.store.get().buffers, needle);
    setText(
      count,
      matches.length === 0
        ? `Nothing found for "${needle}".`
        : matches.length >= MATCH_CEILING
          ? `Showing the first ${matches.length} matches for "${needle}". There may be more; a narrower search will find them.`
          : `${matches.length} match${matches.length === 1 ? "" : "es"} for "${needle}".`,
    );
    fillList(
      list,
      matches.map(rowFor),
      empty("?", "Nothing found", `No file in this mod has "${needle}" in it.`),
    );
  };

  render(shop.store.get().filter);

  return {
    el: main,
    update(next: AppState, prev: AppState) {
      if (next.filter !== prev.filter || next.drafts !== prev.drafts || next.buffers !== prev.buffers) {
        render(next.filter);
      }
    },
    dispose: () => undefined,
  };
}