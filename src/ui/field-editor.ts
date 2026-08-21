/**
 * One field, edited.
 *
 * THE WIDGET COMES FROM THE VALUE, not from the blueprint, and the ordering is
 * the whole trick. A number gets a number box; a list of strings gets chips; a
 * list of objects gets rows you can open; anything the workshop cannot place gets
 * a JSON box that parses on commit. That last one is not a failure of the design,
 * it is what makes an editor over forty-one arbitrary record files honest: there
 * will always be a shape nobody wrote a widget for, and a field the reader cannot
 * edit at all is worse than a field they have to edit as text.
 *
 * A NUMBER BOX KEEPS A STRING. Typing "1" on the way to "12" briefly means one,
 * and typing "-" on the way to "-3" briefly means nothing at all. A control that
 * wrote its parsed value on every keystroke would delete the reader's minus sign.
 * So the element keeps what was typed, the document is written only when it parses,
 * and the row says so when it does not.
 *
 * SUGGESTIONS ARE QUIET UNTIL THEY ARE ASKED. A field the reader has not decided
 * about shows the suggested value as something to click, with the evidence one
 * hover away. A field they have decided about shows nothing, because a tool that
 * keeps arguing with a decision the reader already made is a tool they stop
 * reading.
 */

import type { AuthoringFinding, FieldShape, JsonRecord, JsonValue, Suggestion } from "../host/authoring.js";
import { fill, h, setText } from "./dom.js";
import { button } from "./widgets.js";
import { kindOf, summarize, valueAt } from "../model/paths.js";
import type { ValueKind } from "../model/paths.js";

export interface FieldRowInput {
  /** The full dotted path from the record's root. */
  readonly path: string;
  /** The last segment, which is what the label shows. */
  readonly label: string;
  readonly record: JsonRecord;
  readonly shape?: FieldShape;
  /** How many of the game's records in this file carry it, 0 to 1. */
  readonly share?: number;
  readonly suggestion?: Suggestion;
  readonly findings: readonly AuthoringFinding[];
  readonly focused: boolean;
  /** True when the reader has not written this field yet. */
  readonly pristine: boolean;
}

export interface FieldRowHandlers {
  set(path: string, value: JsonValue): void;
  clear(path: string): void;
  drill(path: string): void;
  focus(path: string): void;
  /** A nudge, offered beside every number, because `add` outlives `set`. */
  nudge(path: string, delta: number): void;
  /**
   * Tick or untick one flag.
   *
   * NOT `set` OF THE WHOLE LIST, and the difference is the whole reason this
   * handler exists separately. `addFlag` and `removeFlag` compose: two mods each
   * adding a different flag to one record both keep theirs, and neither is
   * reported as a conflict. Writing the list back wholesale is a `set`, which
   * means load order decides and the other mod's flag is gone.
   */
  flag(path: string, name: string, on: boolean): void;
  /** Add one entry to a list. `append` composes for exactly the same reason. */
  addRow(path: string, value: JsonValue): void;
  /** Take one entry out of a list, by value rather than by position. */
  removeRow(path: string, value: JsonValue): void;
}

export interface FieldRow {
  readonly el: HTMLElement;
  readonly path: string;
  update(input: FieldRowInput): void;
}

export function fieldRow(initial: FieldRowInput, on: FieldRowHandlers): FieldRow {
  const labelName = h("span", { class: "mb-label-name", text: initial.label });
  const labelMeta = h("span", { class: "mb-label-meta" });
  const marks = h("span", { class: "mb-row-acts" });
  const label = h("label", { class: "mb-label" }, labelName, labelMeta);
  const line = h("div", { class: "mb-control-line" });
  const why = h("div", { class: "mb-why" });
  const control = h("div", { class: "mb-control" }, line, why);
  const el = h("div", { class: "mb-field", data: { path: initial.path } }, label, control);

  el.addEventListener("focusin", () => on.focus(initial.path));

  let kind: ValueKind | undefined;
  let scalar: HTMLInputElement | HTMLTextAreaElement | undefined;

  const rebuild = (input: FieldRowInput, value: JsonValue | undefined, next: ValueKind): void => {
    scalar = undefined;
    switch (next) {
      case "number": {
        const box = h("input", { type: "text", class: "mb-mono", value: String(value ?? "") });
        box.addEventListener("input", () => {
          const text = box.value.trim();
          if (text === "") {
            box.removeAttribute("aria-invalid");
            return;
          }
          const parsed = Number(text);
          if (Number.isFinite(parsed)) {
            box.removeAttribute("aria-invalid");
            on.set(input.path, parsed);
          } else {
            box.setAttribute("aria-invalid", "true");
          }
        });
        scalar = box;
        fill(
          line,
          box,
          button({ label: "-1", tiny: true, tip: nudgeTip(-1), onClick: () => on.nudge(input.path, -1) }),
          button({ label: "+1", tiny: true, tip: nudgeTip(1), onClick: () => on.nudge(input.path, 1) }),
          rangeNote(input.shape),
          marks,
        );
        return;
      }
      case "boolean": {
        const box = h("input", { type: "checkbox", checked: value === true });
        box.addEventListener("change", () => on.set(input.path, box.checked));
        fill(line, h("label", { class: "mb-switch" }, box, h("span", { text: value === true ? "yes" : "no" })), marks);
        return;
      }
      case "flags": {
        fill(line, flagEditor(input.path, (value as string[] | undefined) ?? [], input.shape, on), marks);
        return;
      }
      case "rows": {
        fill(line, rowsEditor(input.path, (value as JsonRecord[] | undefined) ?? [], on), marks);
        return;
      }
      case "list":
      case "object": {
        fill(
          line,
          h("span", { class: "mb-row-summary", text: summarize(value) }),
          button({ label: "Open", tiny: true, onClick: () => on.drill(input.path) }),
          button({ label: "Clear", tiny: true, kind: "ghost", onClick: () => on.clear(input.path) }),
          marks,
        );
        return;
      }
      case "empty": {
        fill(
          line,
          h("span", { class: "mb-row-summary", text: "nothing yet" }),
          ...seedButtons(input, on),
          marks,
        );
        return;
      }
      default: {
        const long = typeof value === "string" && (value.length > 60 || value.includes("\n"));
        const box = long
          ? h("textarea", { rows: 3, value: String(value ?? "") })
          : h("input", { type: "text", value: String(value ?? "") });
        box.addEventListener("input", () => on.set(input.path, box.value));
        scalar = box;
        fill(line, box, marks);
        return;
      }
    }
  };

  const update = (input: FieldRowInput): void => {
    const value = valueAt(input.record, input.path);
    const next = kindOf(value);
    setText(labelName, input.label);
    setText(labelMeta, meta(input));
    el.dataset["focused"] = input.focused ? "1" : "0";

    if (next !== kind) {
      kind = next;
      rebuild(input, value, next);
    } else if (scalar) {
      const text = value === undefined || value === null ? "" : String(value);
      if (scalar.value !== text && scalar !== scalar.ownerDocument.activeElement) scalar.value = text;
    } else {
      rebuild(input, value, next);
    }

    fill(marks, ...input.findings.slice(0, 3).map(markFor));
    setWhy(why, input, on);
  };

  update(initial);
  return { el, path: initial.path, update };
}

function nudgeTip(delta: number): string {
  return (
    `${delta > 0 ? "Add one to" : "Take one from"} whatever this number currently is, rather than writing a fixed ` +
    "value over it. That still does the right thing after the base game retunes it, and after another mod adjusts it."
  );
}

function rangeNote(shape: FieldShape | undefined): HTMLElement | null {
  if (!shape?.range) return null;
  return h("span", {
    class: "mb-label-meta",
    text: `${shape.range.min} to ${shape.range.max}, usually ${shape.range.median}`,
    tip: "The smallest, the largest and the middle value this field takes across the game's own records in this file.",
  });
}

function meta(input: FieldRowInput): string {
  const parts: string[] = [];
  if (input.shape) parts.push(input.shape.types.join(" or "));
  if (input.share !== undefined) {
    /* "EXPECTED", NOT "REQUIRED". A field on every one of the game's records is
     * an empirical fact about the data, not a schema guarantee, and calling it
     * required would be the workshop putting words in the format's mouth. */
    if (input.share >= 1) parts.push("on every record");
    else if (input.share > 0) parts.push(`on ${Math.round(input.share * 100)}%`);
  }
  return parts.join(" - ");
}

function markFor(finding: AuthoringFinding): HTMLElement {
  const glyph = finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i";
  return h("span", { class: "mb-mark", data: { level: finding.level }, text: glyph, tip: finding.message });
}

function setWhy(why: HTMLElement, input: FieldRowInput, on: FieldRowHandlers): void {
  const suggestion = input.suggestion;
  if (!suggestion || !input.pristine) {
    fill(why);
    why.style.display = "none";
    return;
  }
  why.style.display = "";
  fill(
    why,
    "Suggested ",
    h("b", { text: JSON.stringify(suggestion.value) }),
    ", because ",
    suggestion.because,
    ". ",
    button({
      label: "Use it",
      tiny: true,
      onClick: () => on.set(input.path, suggestion.value),
      tip: "Write the suggested value here. It is a starting point drawn from the game's own records, not an instruction.",
    }),
  );
}

/**
 * Buttons for a field that has no value yet.
 *
 * What they offer comes from the blueprint's opinion about the field's shape, so
 * a field that holds a list offers an empty list rather than an empty string. A
 * field nothing has an opinion about offers all four, because guessing wrong and
 * making the reader clear it is worse than asking.
 */
function seedButtons(input: FieldRowInput, on: FieldRowHandlers): HTMLElement[] {
  const types = input.shape?.types ?? [];
  const seeds: [string, JsonValue][] = [];
  if (types.includes("string") || types.length === 0) seeds.push(["text", ""]);
  if (types.includes("number") || types.length === 0) seeds.push(["a number", input.shape?.range?.median ?? 0]);
  if (types.includes("array") || types.length === 0) seeds.push(["a list", []]);
  if (types.includes("object") || types.length === 0) seeds.push(["a group", {}]);
  if (types.includes("boolean")) seeds.push(["yes or no", false]);
  return seeds.map(([label, value]) =>
    button({ label: `Set ${label}`, tiny: true, kind: "ghost", onClick: () => on.set(input.path, value) }),
  );
}

/**
 * Chips for a list of strings.
 *
 * Ticking a flag is the safest change in the whole format: `addFlag` and
 * `removeFlag` compose, so two mods each adding a different flag to one record
 * both keep theirs. The tooltip on the add box says so, once, where it is
 * relevant.
 */
function flagEditor(path: string, flags: readonly string[], shape: FieldShape | undefined, on: FieldRowHandlers): HTMLElement {
  const chips = flags.map((flag, index) =>
    h(
      "span",
      { class: "mb-chip" },
      h("span", { text: flag }),
      h("button", {
        type: "button",
        text: "x",
        aria: { label: `remove ${flag}` },
        on: { click: () => on.flag(path, flag, false) },
      }),
    ),
  );
  const box = h("input", {
    type: "text",
    class: "mb-mono",
    placeholder: "add one",
    spellcheck: false,
    tip:
      "Adding to a list of names composes: another mod adding a different one keeps its change and you keep " +
      "yours, and neither is reported as a conflict.",
  });
  box.style.maxWidth = "150px";
  box.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    const value = box.value.trim();
    if (value === "") return;
    box.value = "";
    if (!flags.includes(value)) on.flag(path, value, true);
  });

  const known = (shape?.values ?? []).filter((v): v is string => typeof v === "string" && !flags.includes(v));
  const offered =
    known.length === 0
      ? null
      : h(
          "select",
          {
            on: {
              change: (event) => {
                const target = event.target;
                if (!(target instanceof HTMLSelectElement) || target.value === "") return;
                const chosen = target.value;
                target.value = "";
                if (!flags.includes(chosen)) on.flag(path, chosen, true);
              },
            },
          },
          h("option", { value: "", text: `one of the ${known.length} the game uses` }),
          ...known.slice(0, 200).map((value) => h("option", { value, text: value })),
        );
  if (offered) offered.style.maxWidth = "220px";

  return h("div", { class: "mb-chips" }, ...chips, box, offered);
}

/**
 * Rows for a list of objects: a monster's attacks, a shop's stock table.
 *
 * Summary rows with an Open button rather than every field of every entry
 * expanded inline, because a stock table expanded inline is a page nobody can
 * navigate. Moving an entry is two buttons rather than a drag: a drag needs a
 * pointer, and this has to work for somebody who is only using a keyboard.
 */
function rowsEditor(path: string, rows: readonly JsonRecord[], on: FieldRowHandlers): HTMLElement {
  const list = rows.map((row, index) =>
    h(
      "div",
      { class: "mb-row" },
      h("span", { class: "mb-row-index", text: String(index) }),
      h("span", { class: "mb-row-summary", text: describeRow(row) }),
      h(
        "span",
        { class: "mb-row-acts" },
        button({ label: "Open", tiny: true, onClick: () => on.drill(`${path}.${index}`) }),
        button({
          label: "Copy",
          tiny: true,
          kind: "ghost",
          tip: "Add another entry just like this one. Cloning something that works is how most content gets made.",
          onClick: () => on.addRow(path, JSON.parse(JSON.stringify(row)) as JsonValue),
        }),
        button({
          label: "Up",
          tiny: true,
          kind: "ghost",
          disabled: index === 0,
          onClick: () => on.set(path, move(rows, index, index - 1)),
        }),
        button({
          label: "Down",
          tiny: true,
          kind: "ghost",
          disabled: index === rows.length - 1,
          onClick: () => on.set(path, move(rows, index, index + 1)),
        }),
        button({
          label: "Remove",
          tiny: true,
          kind: "danger",
          onClick: () => on.removeRow(path, row),
        }),
      ),
    ),
  );
  const shape = rows[0];
  return h(
    "div",
    { class: "mb-rows" },
    ...list,
    button({
      label: "Add an entry",
      tiny: true,
      onClick: () => on.addRow(path, shape ? blankLike(shape) : {}),
      tip:
        shape === undefined
          ? "Add an empty entry, and fill it in."
          : "Add an entry with the same fields as the ones already here, left blank.",
    }),
  );
}

function describeRow(row: JsonRecord): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "object" && value !== null) continue;
    parts.push(`${key} ${String(value)}`);
    if (parts.length === 4) break;
  }
  return parts.length === 0 ? "(empty)" : parts.join(", ");
}

function blankLike(row: JsonRecord): JsonRecord {
  const out: JsonRecord = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = typeof value === "number" ? 0 : typeof value === "boolean" ? false : Array.isArray(value) ? [] : typeof value === "object" && value !== null ? {} : "";
  }
  return out;
}

function move(rows: readonly JsonRecord[], from: number, to: number): JsonRecord[] {
  const out = [...rows];
  const taken = out.splice(from, 1)[0];
  if (taken !== undefined) out.splice(to, 0, taken);
  return out;
}

/**
 * The escape hatch: this value, as JSON, parsed and applied whole.
 *
 * Offered on every container so that no shape in forty-one record files is
 * unreachable. It parses on commit rather than on keystroke, so a half-typed
 * object never becomes the document, and it reports its own parse error rather
 * than silently doing nothing.
 */
export function jsonEditor(path: string, value: JsonValue | undefined, on: FieldRowHandlers): HTMLElement {
  const box = h("textarea", { rows: 10, class: "mb-mono", spellcheck: false, value: JSON.stringify(value ?? null, null, 2) });
  const problem = h("div", { class: "mb-why" });
  const apply = (): void => {
    try {
      const parsed = JSON.parse(box.value) as JsonValue;
      box.removeAttribute("aria-invalid");
      problem.textContent = "";
      on.set(path, parsed);
    } catch (e) {
      box.setAttribute("aria-invalid", "true");
      problem.textContent = `That is not valid JSON: ${String(e)}`;
    }
  };
  return h(
    "div",
    { class: "mb-control" },
    box,
    h("div", { class: "mb-row-actions" }, button({ label: "Apply", onClick: apply }), problem),
  );
}
