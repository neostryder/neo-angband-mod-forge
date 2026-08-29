/**
 * The diff: what changed in one file, in a plain +/- reading.
 *
 * WHAT "BEFORE" AND "AFTER" MEAN HERE, because this project has no place a real
 * base-pack version of a mod's own file could come from - see `model/diff.ts`'s
 * own header. Before is the file as the mod has it now, exactly what `files.ts`
 * would save over if you pressed Revert. After is what is sitting unsaved in
 * the editor's buffer, exactly what pressing Save would write. So this screen
 * is answering "what would Save actually change", which is the version of a
 * diff an author editing one file in place actually wants.
 *
 * A SCREEN, NOT A PANEL INSIDE THE EDITOR, for the same reason the review
 * screen is its own screen rather than a drawer on every wizard page: a diff
 * over a whole file wants the width, and it is a place to look rather than a
 * thing to keep open while typing.
 */

import { h } from "../dom.js";
import { diffLines, diffRows, diffSummary } from "../../model/diff.js";
import type { DiffRow } from "../../model/diff.js";
import { isBinary, projectFiles } from "../../model/files.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { button, empty } from "../widgets.js";
import type { View, Workshop } from "../view.js";

export function diffScreen(shop: Workshop, path: string): View {
  const main = h("div", { class: "mb-main" });

  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "There is nothing to compare until a mod is open.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) }),
      ),
    );
    return { el: main, update: () => undefined, dispose: () => undefined };
  }

  const back = button({ label: "Back to the file", onClick: () => shop.acts.go({ at: "files", path }) });
  const headline = h("div", { class: "mb-prose" });
  const summary = h("div", { class: "mb-why" });
  const body = h("div", { class: "mb-diff" });

  main.append(
    h("div", { class: "mb-row-actions" }, back),
    headline,
    summary,
    body,
  );

  const render = (state: AppState): void => {
    const current = openDraft(state);
    if (!current) return;
    const file = projectFiles(shop.api, current).find((entry) => entry.path === path);

    if (file === undefined) {
      headline.replaceChildren(h("h2", { text: path }));
      summary.textContent = "That file is not in the mod any more, so there is nothing left to compare.";
      body.replaceChildren();
      return;
    }

    headline.replaceChildren(h("h2", { text: path }));

    if (isBinary(file.contents)) {
      summary.textContent = "This file holds raw bytes, not text, so there is nothing here to diff.";
      body.replaceChildren();
      return;
    }

    const before = file.contents;
    const after = state.buffers[path]?.text ?? before;

    if (after === before) {
      summary.textContent =
        "There is nothing unsaved to compare: the editor's text and the mod's saved file are the same right now.";
      body.replaceChildren();
      return;
    }

    const { ops, truncated } = diffLines(before, after);
    const { added, removed } = diffSummary(ops);
    const counts = `${added} line${added === 1 ? "" : "s"} added, ${removed} line${removed === 1 ? "" : "s"} removed`;
    summary.textContent = truncated
      ? `${path} is too big to compare line by line, so the whole file is shown as removed and added below. ${counts}.`
      : `Comparing the mod's saved file against what is in the editor now. ${counts}.`;

    body.replaceChildren(...diffRows(ops).map(rowEl));
  };

  render(shop.store.get());

  return {
    el: main,
    update(next: AppState, prev: AppState) {
      if (next.drafts !== prev.drafts || next.buffers !== prev.buffers || next.openId !== prev.openId) render(next);
    },
    dispose: () => undefined,
  };
}

function rowEl(row: DiffRow): HTMLElement {
  if (row.kind === "gap") {
    return h("div", { class: "mb-diff-gap", text: `... ${row.count} unchanged line${row.count === 1 ? "" : "s"} ...` });
  }
  const marker = row.kind === "add" ? "+" : row.kind === "remove" ? "-" : " ";
  return h(
    "div",
    { class: "mb-diff-row", data: { kind: row.kind } },
    h("span", { class: "mb-diff-num", text: row.beforeLine !== undefined ? String(row.beforeLine) : "" }),
    h("span", { class: "mb-diff-num", text: row.afterLine !== undefined ? String(row.afterLine) : "" }),
    h("span", { class: "mb-diff-marker", text: marker }),
    h("span", { class: "mb-diff-text", text: row.text }),
  );
}