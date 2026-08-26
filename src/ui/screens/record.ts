/**
 * The record editor. The screen this whole thing lives or dies on.
 *
 * THREE REGIONS, and each one answers a different question the author is holding
 * at the same time. The left rail is "what else is in this mod". The middle is
 * "what is this thing". The right is "what is wrong, and is this number normal".
 * Putting the third one in a separate screen would mean the answer to "is forty
 * hit points a lot for a depth-three dog" costs a context switch, and an answer
 * that costs a context switch is an answer nobody gets.
 *
 * PROGRESSIVE DISCLOSURE, GROUPED BY MEANING. A monster carries up to thirty-three
 * top-level fields. Essentials first, as a handful; then groups with counts on
 * them, collapsed or not; then a switch that reveals every field the file has
 * rather than only the ones this record carries. What is above the fold is what
 * decides what the thing IS.
 *
 * HYBRID NESTING, and the reason is arithmetic. A shop's stock table expanded
 * inline is a page nobody can navigate; a nested object reached only by
 * drilling makes changing one number three clicks. So a simple object opens
 * inline for one level and anything with rows in it drills, with a breadcrumb
 * back and the parent's summary preserved.
 *
 * THE FINDINGS PANE IS NEVER EMPTY AND NEVER FLICKERS. It shows the last
 * completed answer with a label while a newer one is being computed, rather than
 * emptying and refilling on every keystroke. A pane that flickers is a pane the
 * reader learns to ignore, and this one has the errors in it.
 */

import type { AuthoringFinding, FieldShape, JsonRecord, JsonValue, Suggestion } from "../../host/authoring.js";
import { fill, h, setText } from "../dom.js";
import { fieldRow, jsonEditor } from "../field-editor.js";
import type { FieldRow, FieldRowHandlers } from "../field-editor.js";
import { groupFields, GROUP_BLURBS, GROUP_TITLES, kindFor } from "../../model/kinds.js";
import type { FieldGroup } from "../../model/kinds.js";
import { isPristine } from "../../model/target.js";
import { checkIdentity } from "../../model/refs.js";
import { kindOf, valueAt } from "../../model/paths.js";
import { describeComposition, describeOp, opAddRow, opDeleteRow, opFlag, opNudge } from "../../model/ops.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { asideSection, button, card, empty, listRow, searchBox } from "../widgets.js";
import type { View, Workshop } from "../view.js";
import { draftLabel, labelOf } from "../../model/refs.js";

export function recordScreen(shop: Workshop, index: number, path: string): View {
  /* THE THREE COLUMNS ARE THE THREE COLUMN CLASSES. Without them this screen's
   * rail and aside were the only ones in the workshop with no edge, no ground
   * tint and - the part that showed - no scroll box of their own, so the peer
   * table ran off the right of the window instead of scrolling inside its pane. */
  const rail = h("div", { class: "mb-rail" });
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols" }, rail, main, aside);

  const target = shop.acts.target(index);
  if (!target) {
    fill(main, empty("?", "Nothing to edit here", "That change has no record behind it. Drop it, or pick another."));
    return { el, update: () => undefined, dispose: () => undefined };
  }
  const kind = kindFor(shop.api, target.file);

  /* ------------------------------------------------------------- *
   * Handlers: one place a gesture becomes a change                 *
   * ------------------------------------------------------------- */

  const handlers: FieldRowHandlers = {
    set: (at, value) => shop.acts.setValue(index, at, value),
    clear: (at) => shop.acts.clearValue(index, at),
    drill: (at) => shop.acts.go({ at: "record", change: index, path: at }),
    focus: (at) => shop.acts.focusField(at),
    /* Every one of these four goes through `applyOp` rather than through
     * `setValue`, because each is a gesture the format has a COMMUTATIVE op for.
     * Writing the outcome instead of the gesture would turn a change that
     * coexists with another mod's into one that overwrites it. */
    nudge: (at, delta) => shop.acts.applyOp(index, opNudge(at, delta)),
    flag: (at, name, on) => shop.acts.applyOp(index, opFlag(at, name, on)),
    addRow: (at, value) => shop.acts.applyOp(index, opAddRow(at, value)),
    removeRow: (at, value) => shop.acts.applyOp(index, opDeleteRow(at, value)),
  };

  /* ------------------------------------------------------------- *
   * Left rail: the rest of the mod                                *
   * ------------------------------------------------------------- */

  const railList = h("div", { class: "mb-list" });
  rail.append(
    h("div", { class: "mb-listhead" }, h("h3", { text: "In this mod" })),
    railList,
    h(
      "div",
      { style: { padding: "8px" } },
      button({ label: "Add or change something", tiny: true, onClick: () => shop.acts.go({ at: "kinds" }) }),
    ),
  );

  /* ------------------------------------------------------------- *
   * Middle: identity, then the groups                             *
   * ------------------------------------------------------------- */

  const crumbBar = h("div", { class: "mb-crumbs" });
  const identity = h("div", { class: "mb-why" });
  const identityCard = card({ title: "Identity", note: "the name the rest of the modding world will use", open: true });
  identityCard.body.appendChild(identity);

  const opsList = h("div", { class: "mb-rows" });
  const opsCard = card({ title: "What this writes down", note: "", open: target.mode === "patch" });
  opsCard.body.appendChild(opsList);

  const groupsHost = h("div", { style: { display: "flex", "flex-direction": "column", gap: "12px" } });

  const addBox = searchBox("add a field by name", () => undefined);
  const addList = h("div", { class: "mb-list" });
  const addCard = card({
    title: "Add a field",
    note: "ranked by how much the game's own records use it",
    open: false,
    onToggle: () => addCard.setOpen(addCard.el.dataset["open"] !== "1"),
  });
  addCard.body.append(addBox, addList);

  const allSwitch = h("input", { type: "checkbox" });
  allSwitch.addEventListener("change", () => shop.acts.toggleAllFields());

  main.append(
    crumbBar,
    identityCard.el,
    ...(target.mode === "patch" ? [opsCard.el] : []),
    h(
      "div",
      { class: "mb-row-actions" },
      h(
        "label",
        { class: "mb-switch", tip: "Show every field this kind of record can carry, not only the ones this one has." },
        allSwitch,
        h("span", { text: "show every field" }),
      ),
      h("span", { class: "mb-spacer" }),
      button({ label: "Review it", onClick: () => shop.acts.go({ at: "verdict" }) }),
      /* GATED ON THE SEAM EXISTING, not on it being usable. The panel's whole first
       * half is the explanation of what testing costs and the button that spends it,
       * so a route that only appeared once the player had already paid would be a
       * route to a screen they no longer needed. */
      shop.seams.wizard.api !== undefined
        ? button({
            label: "Test it in the game",
            tip: "Go where this belongs, put one in front of you, and look at it.",
            onClick: () => shop.acts.go({ at: "test" }),
          })
        : null,
    ),
    groupsHost,
    addCard.el,
  );

  /* ------------------------------------------------------------- *
   * Right: findings, then evidence for the focused field          *
   * ------------------------------------------------------------- */

  const findingsSection = asideSection("Checks");
  const findingsList = h("ul", { class: "mb-findings" });
  const findingsNote = h("div", { class: "mb-stale" });
  findingsSection.body.append(findingsNote, findingsList);

  const evidenceSection = asideSection("Things like this");
  const evidenceBody = h("div");
  evidenceSection.body.appendChild(evidenceBody);

  const usageSection = asideSection("What this file uses");
  const usageBody = h("div");
  usageSection.body.appendChild(usageBody);

  aside.append(findingsSection.el, evidenceSection.el, usageSection.el);

  /* ------------------------------------------------------------- *
   * Rendering                                                     *
   * ------------------------------------------------------------- */

  const rows = new Map<string, FieldRow>();
  const groupCards = new Map<FieldGroup, ReturnType<typeof card>>();

  const render = (state: AppState): void => {
    const current = shop.acts.target(index);
    if (!current) return;
    const draft = openDraft(state);
    if (!draft) return;

    allSwitch.checked = state.showAllFields;
    renderRail(state, draft);
    renderCrumbs(current.record);
    renderIdentity(current.record, draft.id);
    if (current.mode === "patch") renderOps(current.ops ?? []);

    const scope = path === "" ? current.record : (valueAt(current.record, path) as JsonRecord | undefined);
    if (scope === undefined || kindOf(scope) === "empty") {
      fill(groupsHost, empty("?", "Nothing here", "This part of the record is empty. Go back up and give it a value."));
      return;
    }
    if (kindOf(scope) !== "object") {
      /* A list drilled into, or a scalar reached by a stale path. Offer the JSON
       * editor rather than nothing: it is the escape hatch that makes an editor
       * over arbitrary records honest. */
      fill(
        groupsHost,
        h(
          "div",
          { class: "mb-prose" },
          h("h3", { text: "As JSON" }),
          h("p", {
            text: "This part of the record is a list rather than a group of named fields, so it is edited whole.",
          }),
        ),
        jsonEditor(path, scope, handlers),
      );
      return;
    }

    const findings = findingsFor(state);
    const suggestions = suggestionsFor(current.record);
    renderGroups(state, current.record, scope, findings, suggestions);
    renderAdd(state, scope);
    renderFindings(state, findings);
    renderEvidence(state, current.record);
    renderUsage(state);
  };

  const renderRail = (state: AppState, draft: NonNullable<ReturnType<typeof openDraft>>): void => {
    fill(
      railList,
      ...draft.changes.map((change, at) =>
        listRow({
          badge: change.file.charAt(0).toUpperCase(),
          name:
            change.kind === "add" || change.kind === "replace"
              ? draftLabel(shop.api, change.file, change.record)
              : change.ref,
          meta: change.file,
          selected: at === index,
          onClick: () => shop.acts.go({ at: "record", change: at, path: "" }),
        }),
      ),
    );
    void state;
  };

  const renderCrumbs = (record: JsonRecord): void => {
    const parts = path === "" ? [] : path.split(".");
    const nodes: (HTMLElement | string)[] = [
      h("button", {
        class: "mb-crumb",
        type: "button",
        text: draftLabel(shop.api, target.file, record),
        aria: parts.length === 0 ? { current: "page" } : {},
        on: { click: () => shop.acts.go({ at: "record", change: index, path: "" }) },
      }),
    ];
    let walked = "";
    parts.forEach((part, at) => {
      walked = walked === "" ? part : `${walked}.${part}`;
      const here = walked;
      nodes.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      nodes.push(
        h("button", {
          class: "mb-crumb",
          type: "button",
          text: part,
          aria: at === parts.length - 1 ? { current: "page" } : {},
          on: { click: () => shop.acts.go({ at: "record", change: index, path: here }) },
        }),
      );
    });
    fill(crumbBar, ...nodes);
  };

  const renderIdentity = (record: JsonRecord, owner: string): void => {
    const current = shop.acts.target(index);
    if (current?.mode === "patch") {
      fill(
        identity,
        `This adjusts ${current.ref ?? "a record"}, which stays the base game's. Your mod ships the difference, so `,
        "another mod adjusting a different field of the same record still works.",
      );
      return;
    }
    const check = checkIdentity(shop.api, target.file, record, owner, shop.records);
    fill(
      identity,
      check.collides ? h("b", { text: "This name is taken. " }) : null,
      check.says,
      " ",
      h("span", {
        class: "mb-label-meta",
        text: `Identity comes from ${shop.api.keyDescription(target.file)}.`,
      }),
    );
  };

  const renderOps = (ops: readonly { readonly op: string; readonly path: string }[]): void => {
    opsCard.setNote(`${ops.length} adjustment${ops.length === 1 ? "" : "s"}`);
    if (ops.length === 0) {
      fill(opsList, h("div", { class: "mb-why", text: "Nothing yet. Change a field below and it will appear here." }));
      return;
    }
    fill(
      opsList,
      ...ops.map((op, at) =>
        h(
          "div",
          { class: "mb-row" },
          h("span", { class: "mb-row-index", text: String(at) }),
          h(
            "span",
            { class: "mb-row-summary", tip: describeComposition(op as never) },
            describeOp(op as never),
          ),
          h("span", { class: "mb-row-acts" }),
        ),
      ),
    );
  };

  const renderGroups = (
    state: AppState,
    record: JsonRecord,
    scope: JsonRecord,
    findings: readonly AuthoringFinding[],
    suggestions: ReadonlyMap<string, Suggestion>,
  ): void => {
    const blueprint = shop.api.blueprintFor(target.file);
    const inNested = path !== "";
    const shapeAt = inNested ? nestedShape(blueprint?.fields, path) : blueprint?.fields;

    const grouped = inNested
      ? new Map<FieldGroup, readonly string[]>([["essentials", Object.keys(scope).sort()]])
      : groupFields(shop.api, kind, Object.keys(scope), state.showAllFields);

    const wanted = new Set<FieldGroup>();
    const order: HTMLElement[] = [];
    for (const [group, fields] of grouped) {
      wanted.add(group);
      let block = groupCards.get(group);
      if (!block) {
        block = card({
          title: inNested ? "Fields" : GROUP_TITLES[group],
          ...(inNested ? {} : { tip: GROUP_BLURBS[group] }),
          open: group === "essentials" || state.collapsed[group] === false,
          onToggle: () => shop.acts.toggleGroup(group),
        });
        groupCards.set(group, block);
      }
      const open = group === "essentials" ? state.collapsed[group] !== true : state.collapsed[group] !== true && (group !== "advanced" || state.showAllFields);
      block.setOpen(open);

      const issues = fields.reduce(
        (n, field) => n + findings.filter((f) => f.field === field || f.field === joinPath(path, field)).length,
        0,
      );
      block.setNote(`${fields.length} field${fields.length === 1 ? "" : "s"}${issues > 0 ? `, ${issues} noted` : ""}`);

      const children: HTMLElement[] = [];
      for (const field of fields) {
        const full = joinPath(path, field);
        const shape = shapeAt?.[field];
        const input = {
          path: full,
          label: field,
          record,
          ...(shape === undefined ? {} : { shape }),
          ...(shape === undefined || !blueprint || inNested ? {} : { share: shape.count / blueprint.records }),
          ...(suggestions.get(full) === undefined ? {} : { suggestion: suggestions.get(full) as Suggestion }),
          findings: findings.filter((f) => f.field === full),
          focused: state.focusField === full,
          pristine: isPristine(shop.acts.target(index) ?? target, full),
        };
        let row = rows.get(full);
        if (!row) {
          row = fieldRow(input, handlers);
          rows.set(full, row);
        } else row.update(input);
        children.push(row.el);
      }
      fill(block.body, ...children);
      order.push(block.el);
    }
    for (const [group, block] of groupCards) {
      if (!wanted.has(group)) {
        block.el.remove();
        groupCards.delete(group);
      }
    }
    fill(groupsHost, ...order);
  };

  const renderAdd = (state: AppState, scope: JsonRecord): void => {
    const usage = shop.api.fieldUsage(target.file);
    const needle = addBox.value.trim().toLowerCase();
    const missing = usage
      .filter((entry) => !(entry.name in scope))
      .filter((entry) => needle === "" || entry.name.includes(needle))
      .slice(0, 40);
    fill(
      addList,
      ...missing.map((entry) =>
        listRow({
          name: entry.name,
          meta: `${entry.shape.types.join(" or ")} - on ${Math.round(entry.share * 100)}% of the game's records`,
          onClick: () => handlers.set(joinPath(path, entry.name), seedValue(entry.shape)),
        }),
      ),
    );
    if (missing.length === 0) {
      fill(addList, h("div", { class: "mb-why", text: "Nothing left to add from this file's own fields." }));
    }
    void state;
  };

  const renderFindings = (state: AppState, findings: readonly AuthoringFinding[]): void => {
    const verdict = state.verdict;
    findingsSection.setCount(
      verdict.build ? `${countOf(findings, "error")} / ${countOf(findings, "warn")} / ${countOf(findings, "hint")}` : "",
    );
    if (verdict.broke !== undefined) {
      setText(findingsNote, `The workshop could not check this: ${verdict.broke}`);
    } else if (verdict.stale || verdict.revision !== state.revision) {
      setText(
        findingsNote,
        verdict.build ? `Checking revision ${state.revision}. Showing revision ${verdict.revision}.` : "Checking.",
      );
    } else {
      setText(findingsNote, findings.length === 0 ? `No issues in revision ${verdict.revision}.` : "");
    }

    fill(
      findingsList,
      ...findings.slice(0, 60).map((finding) =>
        h(
          "li",
          null,
          h(
            "button",
            {
              class: "mb-finding",
              type: "button",
              data: { level: finding.level },
              on: {
                click: () => {
                  if (finding.field === undefined) return;
                  shop.acts.focusField(finding.field);
                  const row = rows.get(finding.field);
                  row?.el.scrollIntoView({ block: "center" });
                  row?.el.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
                },
              },
            },
            h("span", { class: "mb-mark", data: { level: finding.level }, text: finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i" }),
            h(
              "span",
              null,
              h("span", { text: finding.message }),
              h("div", { class: "mb-finding-rule", text: finding.rule }),
            ),
          ),
        ),
      ),
    );
  };

  const renderEvidence = (state: AppState, record: JsonRecord): void => {
    const field = state.focusField;
    const bare = field === undefined ? undefined : (field.split(".").pop() ?? field);
    const set = shop.api.peersFor(target.file, record, shop.records);
    evidenceSection.setCount(`${set.peers.length}`);

    if (set.peers.length === 0) {
      fill(
        evidenceBody,
        h("div", { class: "mb-why", text: "Nothing in the game is comparable to this yet. Give it a family and a depth." }),
      );
      return;
    }
    const columns = bare === undefined ? defaultColumns(set.peers) : [bare, ...defaultColumns(set.peers).filter((c) => c !== bare)].slice(0, 4);
    const numbers = bare === undefined ? [] : set.peers.map((p) => p[bare]).filter((v): v is number => typeof v === "number");

    fill(
      evidenceBody,
      h("div", { class: "mb-why", text: `Comparable because ${set.because}.` }),
      numbers.length === 0
        ? null
        : h(
            "div",
            { class: "mb-stat" },
            h("span", null, `${bare ?? ""} `, h("b", { text: `${Math.min(...numbers)} to ${Math.max(...numbers)}` })),
            h("span", null, "middle ", h("b", { text: String(middle(numbers)) })),
            h("span", null, "yours ", h("b", { text: String(bare === undefined ? "" : JSON.stringify(record[bare] ?? null)) })),
          ),
      h(
        "div",
        { class: "mb-scrollx" },
        h(
          "table",
          { class: "mb-peers" },
          h(
            "thead",
            null,
            h(
              "tr",
              null,
              h("th", { text: "record" }),
              ...columns.map((column) =>
                h("th", { text: column, class: column === bare ? "mb-focus-cell" : "" }),
              ),
            ),
          ),
          h(
            "tbody",
            null,
            ...set.peers.slice(0, 14).map((peer) =>
              h(
                "tr",
                null,
                h("td", { text: labelOf(shop.api, target.file, peer) }),
                ...columns.map((column) =>
                  h("td", {
                    class: `${typeof peer[column] === "number" ? "mb-num" : ""} ${column === bare ? "mb-focus-cell" : ""}`.trim(),
                    text: cell(peer[column]),
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  };

  const renderUsage = (state: AppState): void => {
    const usage = shop.api.fieldUsage(target.file).slice(0, 18);
    usageSection.setCount(`${shop.api.fieldUsage(target.file).length}`);
    fill(
      usageBody,
      h("div", {
        class: "mb-why",
        text: "How much of the game's own content in this file carries each field. A field almost everything has is part of what the thing is.",
      }),
      h(
        "div",
        { class: "mb-scrollx" },
        h(
          "table",
          { class: "mb-peers" },
          h("tbody", null, ...usage.map((entry) =>
            h(
              "tr",
              null,
              h("td", { text: entry.name }),
              h("td", { class: "mb-num", text: `${Math.round(entry.share * 100)}%` }),
            ),
          )),
        ),
      ),
    );
    void state;
  };

  const findingsFor = (state: AppState): readonly AuthoringFinding[] => {
    const build = state.verdict.build;
    if (!build) return [];
    return build.findings.filter((finding) => finding.file === target.file || finding.file === "-" || finding.file === "manifest");
  };

  const suggestionsFor = (record: JsonRecord): ReadonlyMap<string, Suggestion> => {
    const out = new Map<string, Suggestion>();
    if (path !== "") return out;
    for (const suggestion of shop.api.suggestFields(target.file, record, shop.records)) {
      out.set(suggestion.field, suggestion);
    }
    return out;
  };

  addBox.addEventListener("input", () => renderAdd(shop.store.get(), (path === "" ? shop.acts.target(index)?.record : (valueAt(shop.acts.target(index)?.record ?? {}, path) as JsonRecord)) ?? {}));

  render(shop.store.get());
  shop.acts.scheduleCheck();

  return {
    el,
    update(next) {
      render(next);
    },
    dispose() {
      rows.clear();
      groupCards.clear();
    },
  };
}

function joinPath(base: string, field: string): string {
  return base === "" ? field : `${base}.${field}`;
}

function nestedShape(
  fields: Readonly<Record<string, FieldShape>> | undefined,
  path: string,
): Readonly<Record<string, FieldShape>> | undefined {
  let at = fields;
  for (const segment of path.split(".")) {
    if (!at) return undefined;
    if (/^(?:0|[1-9][0-9]*)$/.test(segment)) {
      /* Every element of an array shares one measured shape, so an index does not
       * narrow anything: step through to the item's own fields. */
      const only = Object.values(at)[0];
      at = only?.fields;
      continue;
    }
    at = at[segment]?.fields ?? at[segment]?.items?.fields;
  }
  return at;
}

function seedValue(shape: FieldShape): JsonValue {
  if (shape.range) return shape.range.median;
  const first = shape.types[0] ?? "string";
  if (first === "number") return 0;
  if (first === "boolean") return false;
  if (first === "array") return [];
  if (first === "object") return {};
  return shape.values && shape.values.length > 0 ? String(shape.values[0]) : "";
}

function countOf(findings: readonly AuthoringFinding[], level: string): number {
  return findings.filter((f) => f.level === level).length;
}

function defaultColumns(peers: readonly JsonRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const peer of peers) {
    for (const [key, value] of Object.entries(peer)) {
      if (typeof value !== "number" && typeof value !== "string") continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([key]) => key);
}

function cell(value: JsonValue | undefined): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "{...}";
  return String(value);
}

function middle(numbers: readonly number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const at = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[at] ?? 0;
  return Math.round(((sorted[at - 1] ?? 0) + (sorted[at] ?? 0)) / 2);
}
