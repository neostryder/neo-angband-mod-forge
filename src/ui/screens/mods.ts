/**
 * My mods: the workshop's front door.
 *
 * One row per unfinished mod, with what is in it and when it was last touched.
 * The row's note says how many records it adds and how many it adjusts, because
 * those are the two numbers that tell you which of your three half-finished mods
 * this one is.
 *
 * IT SAYS WHERE THE DRAFTS LIVE, AND WHAT THAT IS WORTH. Unfinished work is kept
 * in this install's own settings, which is not a file and can quietly run out of
 * room. The status line says so when a write fails, and this screen says so
 * before one does, because "save the file" is advice worth having in advance.
 */

import { h } from "../dom.js";
import type { View, Workshop } from "../view.js";
import { button, empty, fillList, listRow } from "../widgets.js";
import { draftSize } from "../../model/draft.js";
import type { AppState } from "../store.js";

export function modsScreen(shop: Workshop): View {
  const list = h("div", { class: "mb-list" });

  const idBox = h("input", { type: "text", class: "mb-mono", placeholder: "an id, like my-first-mod", spellcheck: false });
  const idProblem = h("div", { class: "mb-why" });
  const create = button({
    label: "Start a new mod",
    kind: "primary",
    onClick: () => {
      const id = idBox.value.trim();
      const problem = shop.acts.idProblem(id);
      if (problem !== undefined) {
        idProblem.textContent = problem;
        idBox.setAttribute("aria-invalid", "true");
        return;
      }
      idBox.value = "";
      idProblem.textContent = "";
      idBox.removeAttribute("aria-invalid");
      shop.acts.createMod(id);
    },
  });
  idBox.addEventListener("input", () => {
    idProblem.textContent = "";
    idBox.removeAttribute("aria-invalid");
  });
  idBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) create.click();
  });

  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "section",
      { class: "mb-card", data: { open: "1" } },
      h("div", { class: "mb-card-head" }, h("span", { class: "mb-card-title", text: "Start something" })),
      h(
        "div",
        { class: "mb-card-body" },
        h(
          "div",
          { class: "mb-field" },
          h(
            "label",
            { class: "mb-label" },
            h("span", { class: "mb-label-name", text: "id" }),
            h("span", { class: "mb-label-meta", text: "lower case, hyphens" }),
          ),
          h(
            "div",
            { class: "mb-control" },
            h("div", { class: "mb-control-line" }, idBox, create),
            h("div", {
              class: "mb-why",
              text:
                "This is the mod's name to the game and to every other mod. It cannot be changed later without " +
                "the game treating the result as a different mod, so it is worth a moment.",
            }),
            idProblem,
          ),
        ),
      ),
    ),
    h(
      "section",
      { class: "mb-card", data: { open: "1" } },
      h(
        "div",
        { class: "mb-card-head" },
        h("span", { class: "mb-card-title", text: "Unfinished" }),
        h("span", {
          class: "mb-card-note",
          text: "kept in this install's settings, not in any character's save",
          tip:
            "Unfinished work does not live in a file. The store it uses can run out of room without saying so, " +
            "which is why the workshop verifies every write and why a finished mod, saved as a file, is the only " +
            "save point it will promise you.",
        }),
      ),
      list,
    ),
  );

  let lastDrafts: unknown;

  const render = (state: AppState): void => {
    const drafts = Object.values(state.drafts).sort((a, b) => b.touched.localeCompare(a.touched));
    const rows = drafts.map((draft) => {
      const size = draftSize(draft);
      const parts: string[] = [];
      if (size.added > 0) parts.push(`${size.added} new`);
      if (size.patched > 0) parts.push(`${size.patched} adjusted`);
      if (size.removed > 0) parts.push(`${size.removed} removed`);
      const row = listRow({
        badge: draft.id.charAt(0).toUpperCase(),
        name: `${draft.name} ${draft.version}`,
        meta: parts.length === 0 ? "nothing in it yet" : parts.join(", "),
        tags: [{ text: draft.id, tone: "mine" }],
        selected: state.openId === draft.id,
        onClick: () => shop.acts.openMod(draft.id),
      });
      const acts = row.querySelector(".mb-row-acts");
      acts?.appendChild(
        button({
          label: "Delete",
          tiny: true,
          kind: "danger",
          tip: "Throw this unfinished mod away. Anything already installed is untouched.",
          onClick: () => {
            /* No confirmation dialog, and one is not wanted: undo is one key away
             * and a modal that interrupts to ask about a draft is the sort of
             * thing that makes a tool tiring. */
            shop.acts.deleteMod(draft.id);
            shop.acts.notice(`${draft.id} is gone. Undo brings it back.`, "plain");
          },
        }),
      );
      return row;
    });
    fillList(
      list,
      rows,
      empty(
        "[ ]",
        "Nothing here yet",
        "A mod starts with an id, and the workshop takes it from there.",
        button({
          label: "Name one now",
          kind: "primary",
          tip: "Puts the cursor in the id field above. An id is all a mod needs to exist.",
          onClick: () => idBox.focus(),
        }),
      ),
    );
  };

  render(shop.store.get());
  lastDrafts = shop.store.get().drafts;

  return {
    el,
    update(next) {
      if (next.drafts !== lastDrafts || next.openId !== undefined) {
        lastDrafts = next.drafts;
        render(next);
      }
    },
    dispose: () => undefined,
  };
}
