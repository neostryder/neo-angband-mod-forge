/**
 * Retune many records at once.
 *
 * WHY THIS SCREEN EXISTS AT ALL, when the record editor can already change a
 * number: because the most common thing anybody actually makes is not a new
 * creature. It is a number, moved, across everything of one sort. Every potion
 * cheaper. Every dragon faster. Every shop's purse deeper. Doing that one record
 * at a time is what stops somebody bothering, and a tool whose easiest job is the
 * rare one and whose hardest job is the common one has its priorities backwards.
 *
 * IT EMITS ORDINARY WORK. Each record gets its own entry, carrying `add` or
 * `mul` rather than a written-in answer. So another mod's unrelated change to one
 * of those records still composes, the change keeps meaning what the author meant
 * after the base game retunes something, and the result is indistinguishable from
 * a mod somebody wrote by hand - which is the promise the whole workshop rests on.
 *
 * IT SHOWS THE OUTCOME BEFORE IT COMMITS. A multiplier applied to two hundred
 * records is exactly the gesture whose result nobody can picture, so the preview
 * is the point of the screen rather than a nicety.
 */

import { h } from "../dom.js";
import type { JsonRecord } from "../../host/authoring.js";
import { kindFor } from "../../model/kinds.js";
import { contentKinds } from "../../model/kinds.js";
import { valueAt } from "../../model/paths.js";
import { labelOf, ownerOf } from "../../model/refs.js";
import type { AppState } from "../store.js";
import { button, card, empty, searchBox } from "../widgets.js";
import type { View, Workshop } from "../view.js";

export function rebalanceScreen(shop: Workshop, file: string): View {
  const kind = kindFor(shop.api, file);
  const all = shop.records[file] ?? [];
  const numeric = numericFields(all);

  const search = searchBox(`filter ${all.length} record${all.length === 1 ? "" : "s"}`, (value) =>
    shop.acts.setFilter(value),
  );

  const fieldPick = h(
    "select",
    null,
    ...numeric.map((field) => h("option", { value: field, text: field })),
  );
  const opPick = h(
    "select",
    null,
    h("option", { value: "add", text: "add" }),
    h("option", { value: "mul", text: "multiply by" }),
  );
  const amount = h("input", { type: "text", class: "mb-mono", value: "1" });

  const preview = h("div", { class: "mb-scrollx" });
  const summary = h("div", { class: "mb-why" });

  const apply = button({
    label: "Apply to all of them",
    kind: "primary",
    onClick: () => {
      const matched = matches(shop.store.get());
      const field = fieldPick.value;
      const value = Number(amount.value);
      if (!Number.isFinite(value)) {
        shop.acts.notice("That is not a number.", "bad");
        return;
      }
      const refs: string[] = [];
      for (const record of matched) {
        const key = shop.api.recordKey(file, record);
        if (key === null) continue;
        refs.push(`${ownerOf(shop.api, record)}:${key}`);
      }
      shop.acts.rebalance(file, refs, field, opPick.value === "mul" ? "mul" : "add", value);
      shop.acts.go({ at: "details" });
    },
  });

  const controls = card({ title: "The adjustment", open: true });
  controls.body.append(
    h(
      "div",
      { class: "mb-field" },
      h("label", { class: "mb-label" }, h("span", { class: "mb-label-name", text: "field" })),
      h("div", { class: "mb-control" }, fieldPick),
    ),
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "change" }),
        h("span", { class: "mb-label-meta", text: "not a fixed value" }),
      ),
      h(
        "div",
        { class: "mb-control" },
        h("div", { class: "mb-control-line" }, opPick, amount),
        h("div", {
          class: "mb-why",
          text:
            "Neither of these writes an answer in. They write the adjustment, so it keeps doing what you meant " +
            "after a game update retunes the numbers and after another mod has already changed one of them.",
        }),
      ),
    ),
  );

  const previewCard = card({ title: "What that does", open: true });
  previewCard.body.append(summary, preview);

  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: `Retune ${kind.title.toLowerCase()}` }),
      h("p", {
        text:
          "Filter the list down to the records you mean, choose one number and one adjustment, and every record " +
          "that matched gets its own entry in your mod.",
      }),
    ),
    numeric.length === 0
      ? empty(
          "?",
          "Nothing to retune here",
          emptyRetuneMessage(shop, file),
          button({
            label: "Choose another kind",
            kind: "primary",
            onClick: () => shop.acts.go({ at: "kinds" }),
          }),
        )
      : h("div", null, search, controls.el, previewCard.el, h("div", { class: "mb-row-actions" }, apply)),
  );

  function matches(state: AppState): readonly JsonRecord[] {
    const needle = state.filter.trim().toLowerCase();
    const field = fieldPick.value;
    return all.filter(
      (record) =>
        typeof valueAt(record, field) === "number" &&
        (needle === "" || labelOf(shop.api, file, record).toLowerCase().includes(needle)),
    );
  }

  const render = (state: AppState): void => {
    if (numeric.length === 0) return;
    const field = fieldPick.value;
    const value = Number(amount.value);
    const op = opPick.value;
    const matched = matches(state);
    apply.disabled = matched.length === 0 || !Number.isFinite(value);

    summary.textContent =
      matched.length === 0
        ? ""
        : `${matched.length} record${matched.length === 1 ? "" : "s"} would get one entry each.`;

    /* A TABLE OF NOTHING IS STILL A TABLE, and a row of column headings over an
     * empty body reads as a screen that is still loading. Say what happened and
     * offer the one thing that undoes it. */
    if (matched.length === 0) {
      preview.replaceChildren(
        empty(
          "?",
          "Nothing matches",
          `No ${file} record has that in its name and a number in ${fieldPick.value}.`,
          button({
            label: "Clear the filter",
            kind: "primary",
            onClick: () => {
              search.value = "";
              shop.acts.setFilter("");
            },
          }),
        ),
      );
      return;
    }

    preview.replaceChildren(
      h(
        "table",
        { class: "mb-peers" },
        h("thead", null, h("tr", null, h("th", { text: "record" }), h("th", { text: field }), h("th", { text: "becomes" }))),
        h(
          "tbody",
          null,
          ...matched.slice(0, 25).map((record) => {
            const was = valueAt(record, field);
            const now = typeof was === "number" && Number.isFinite(value) ? (op === "mul" ? was * value : was + value) : was;
            return h(
              "tr",
              null,
              h("td", { text: labelOf(shop.api, file, record) }),
              h("td", { class: "mb-num", text: String(was) }),
              h("td", { class: "mb-num mb-focus-cell", text: typeof now === "number" ? String(round(now)) : "" }),
            );
          }),
        ),
      ),
    );
  };

  fieldPick.addEventListener("change", () => render(shop.store.get()));
  opPick.addEventListener("change", () => render(shop.store.get()));
  amount.addEventListener("input", () => render(shop.store.get()));

  render(shop.store.get());

  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) render(next);
    },
    dispose: () => undefined,
  };
}

/** Numeric leaf paths that appear on at least a quarter of the loaded records. */
export function numericFields(records: readonly JsonRecord[]): readonly string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const path of numericPaths(record)) counts.set(path, (counts.get(path) ?? 0) + 1);
  }
  const floor = Math.max(1, records.length / 4);
  return [...counts.entries()]
    .filter(([, count]) => count >= floor)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key]) => key);
}

/**
 * Numeric leaves inside objects are ordinary patch targets too. The engine's
 * field-patch format addresses them with dotted paths, so stopping at the first
 * object hid fields such as ego_item's info.cost and info.rating even though the
 * SDK measured them and the patch composer could edit them.
 *
 * Arrays stay out of a bulk retune. Their positions are often rows rather than
 * stable identities, so applying one operation to index 0 across unrelated
 * records would claim those rows mean the same thing when they may not.
 */
function numericPaths(record: JsonRecord): readonly string[] {
  const out: string[] = [];
  const visit = (value: unknown, path: string): void => {
    if (typeof value === "number") {
      if (path !== "") out.push(path);
      return;
    }
    if (typeof value !== "object" || value === null || Array.isArray(value)) return;
    for (const [key, child] of Object.entries(value)) {
      visit(child, path === "" ? key : `${path}.${key}`);
    }
  };
  visit(record, "");
  return out;
}

function emptyRetuneMessage(shop: Workshop, file: string): string {
  const alternatives = contentKinds(shop.api)
    .filter((kind) => kind.file !== file && numericFields(shop.records[kind.file] ?? []).length > 0)
    .slice(0, 3)
    .map((kind) => kind.title);
  if (alternatives.length === 0) {
    return `No numeric field appears often enough across the loaded ${file} records. Choose another kind to keep going.`;
  }
  return (
    `No numeric field appears often enough across the loaded ${file} records. ` +
    `Try ${joinAlternatives(alternatives)}, or choose another kind.`
  );
}

function joinAlternatives(values: readonly string[]): string {
  if (values.length === 1) return values[0] ?? "another kind";
  if (values.length === 2) return `${values[0]} or ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, or ${values[values.length - 1]}`;
}

function round(value: number): number {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}
