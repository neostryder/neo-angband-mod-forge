/**
 * The parts every screen is built out of.
 *
 * Small, unopinionated, and each one exists because it was about to be written
 * three times. Nothing here knows what a mod is.
 */

import { fill, h, svg } from "./dom.js";

/** A collapsible card with a title, a note, and a body. */
export interface Card {
  readonly el: HTMLElement;
  readonly body: HTMLElement;
  setOpen(open: boolean): void;
  setNote(note: string): void;
}

/**
 * A card.
 *
 * A CARD THAT CANNOT BE COLLAPSED DOES NOT WEAR A CARET AND IS NOT A BUTTON.
 * Every card was built with a button for a head and a caret on it whether or not
 * anything was passed to toggle, so more than half the cards in the workshop were
 * offering a gesture that did nothing when it was taken - the details screen's
 * three cards among them. The head is a heading when there is nothing to fold and
 * a control when there is, which is the only version of this a reader can learn.
 */
export function card(options: {
  readonly title: string;
  readonly note?: string;
  readonly tip?: string;
  readonly open?: boolean;
  readonly onToggle?: () => void;
}): Card {
  const note = h("span", { class: "mb-card-note", text: options.note ?? "" });
  const foldable = options.onToggle !== undefined;
  const caret = foldable ? svg({ viewBox: "0 0 8 12", paths: ["M1 1l5 5-5 5z"], cls: "mb-caret" }) : null;
  const head = foldable
    ? h(
        "button",
        {
          class: "mb-card-head",
          type: "button",
          ...(options.tip === undefined ? {} : { tip: options.tip }),
          on: { click: options.onToggle as () => void },
        },
        caret,
        h("span", { class: "mb-card-title", text: options.title }),
        note,
      )
    : h(
        "div",
        {
          class: "mb-card-head",
          ...(options.tip === undefined ? {} : { tip: options.tip }),
        },
        h("span", { class: "mb-card-title", text: options.title }),
        note,
      );
  const body = h("div", { class: "mb-card-body" });
  const el = h("section", { class: "mb-card", data: { open: options.open === false ? "0" : "1" } }, head, body);
  return {
    el,
    body,
    setOpen(open) {
      el.dataset["open"] = open ? "1" : "0";
    },
    setNote(text) {
      note.textContent = text;
    },
  };
}

/**
 * A standing-in-for-nothing panel: a glyph, a title, one sentence, and the way on.
 *
 * NO EMPTY STATE WITHOUT A WAY ON FROM IT. Saying what happened is half of the
 * job; the other half is the next action, because the reader arrived here by
 * doing something reasonable and the screen has just told them it produced
 * nothing. Any number of actions may be passed, they go in the panel's own row,
 * and they are the same row on every screen - the retune screen used to append
 * its one action after the panel and drag it back over the top with a negative
 * margin, which is what "the same idea done twice" looks like in a stylesheet.
 */
export function empty(glyph: string, title: string, blurb: string, ...actions: (HTMLElement | null | undefined)[]): HTMLElement {
  const offered = actions.filter((action): action is HTMLElement => action !== null && action !== undefined);
  return h(
    "div",
    { class: "mb-empty" },
    h("div", { class: "mb-empty-glyph", text: glyph }),
    h("div", { class: "mb-empty-title", text: title }),
    h("div", { class: "mb-empty-blurb", text: blurb }),
    offered.length === 0 ? null : h("div", { class: "mb-empty-actions" }, ...offered),
  );
}

/** A button. `kind` picks the treatment; `seal` is for the irreversible one. */
export function button(options: {
  readonly label: string;
  readonly onClick: () => void;
  readonly kind?: "primary" | "danger" | "ghost";
  readonly tiny?: boolean;
  readonly seal?: boolean;
  readonly tip?: string;
  readonly disabled?: boolean;
  readonly action?: string;
}): HTMLButtonElement {
  const classes = ["mb-btn"];
  if (options.kind) classes.push(`mb-${options.kind}`);
  if (options.tiny) classes.push("mb-tiny");
  if (options.seal) classes.push("mb-seal");
  return h("button", {
    class: classes.join(" "),
    type: "button",
    text: options.label,
    disabled: options.disabled === true,
    ...(options.tip === undefined ? {} : { tip: options.tip }),
    ...(options.action === undefined ? {} : { data: { action: options.action } }),
    on: { click: options.onClick },
  });
}

/** A row in a list: a badge, a name, a note, and optional tags on the right. */
export function listRow(options: {
  readonly badge?: string;
  readonly name: string;
  readonly meta?: string;
  readonly tags?: readonly { readonly text: string; readonly tone?: string; readonly tip?: string }[];
  readonly selected?: boolean;
  readonly tip?: string;
  readonly onClick: () => void;
}): HTMLElement {
  const tags = (options.tags ?? []).map((tag) =>
    h("span", {
      class: "mb-tag",
      text: tag.text,
      ...(tag.tone === undefined ? {} : { data: { tone: tag.tone } }),
      ...(tag.tip === undefined ? {} : { tip: tag.tip }),
    }),
  );
  return h(
    "button",
    {
      class: "mb-listrow",
      type: "button",
      aria: { selected: options.selected === true ? "true" : "false" },
      ...(options.tip === undefined ? {} : { tip: options.tip }),
      on: { click: options.onClick },
    },
    options.badge === undefined ? h("span", { class: "mb-badge", text: " " }) : h("span", { class: "mb-badge", text: options.badge }),
    h(
      "span",
      { class: "mb-listrow-main" },
      h("span", { class: "mb-listrow-name", text: options.name }),
      options.meta === undefined ? null : h("span", { class: "mb-listrow-meta", text: options.meta }),
    ),
    h("span", { class: "mb-row-acts" }, tags),
  );
}

/** A search box that reports on every keystroke and keeps its own element. */
export function searchBox(placeholder: string, onInput: (value: string) => void): HTMLInputElement {
  return h("input", {
    type: "search",
    placeholder,
    spellcheck: false,
    on: {
      input: (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement) onInput(target.value);
      },
    },
  });
}

/** A labelled text field for a manifest detail, with a live problem line. */
export interface TextField {
  readonly el: HTMLElement;
  readonly input: HTMLInputElement | HTMLTextAreaElement;
  setProblem(problem: string | undefined): void;
  setValue(value: string): void;
}

export function textField(options: {
  readonly label: string;
  readonly value: string;
  readonly placeholder?: string;
  readonly tip?: string;
  readonly note?: string;
  readonly multiline?: boolean;
  readonly mono?: boolean;
  readonly onInput: (value: string) => void;
}): TextField {
  const input = options.multiline
    ? h("textarea", {
        rows: 4,
        value: options.value,
        spellcheck: true,
        ...(options.placeholder === undefined ? {} : { placeholder: options.placeholder }),
      })
    : h("input", {
        type: "text",
        value: options.value,
        spellcheck: false,
        class: options.mono ? "mb-mono" : "",
        ...(options.placeholder === undefined ? {} : { placeholder: options.placeholder }),
      });
  input.addEventListener("input", () => options.onInput(input.value));

  const problem = h("div", { class: "mb-why" });
  problem.style.display = "none";

  const el = h(
    "div",
    { class: "mb-field" },
    h(
      "label",
      { class: "mb-label" },
      h("span", { class: "mb-label-name", text: options.label }),
      options.note === undefined ? null : h("span", { class: "mb-label-meta", text: options.note }),
    ),
    h("div", { class: "mb-control" }, input, problem),
  );
  if (options.tip !== undefined) el.dataset["tip"] = options.tip;

  return {
    el,
    input,
    setProblem(text) {
      if (text === undefined) {
        problem.style.display = "none";
        input.removeAttribute("aria-invalid");
      } else {
        problem.style.display = "";
        problem.textContent = text;
        input.setAttribute("aria-invalid", "true");
      }
    },
    setValue(value) {
      /* Only when it differs, and never while the reader is in it: assigning
       * `value` moves the caret to the end, which turns typing in the middle of a
       * word into typing at the end of it. */
      if (input.value !== value && input !== input.ownerDocument.activeElement) input.value = value;
    },
  };
}

/** A titled block in the right-hand column. */
export function asideSection(title: string, count?: string): { el: HTMLElement; body: HTMLElement; setCount(text: string): void } {
  const counter = h("span", { class: "mb-count", text: count ?? "" });
  const body = h("div");
  const el = h(
    "section",
    { class: "mb-aside-section" },
    h("h4", { class: "mb-aside-title" }, title, counter),
    body,
  );
  return {
    el,
    body,
    setCount(text) {
      counter.textContent = text;
    },
  };
}

/**
 * A monospace preview of one emitted file.
 *
 * `contents` is bytes for a binary extra - a tile, a font, a sound - and there is
 * no text to preview, only a size worth saying. Showing a `Uint8Array` here as
 * `String(...)` would print its numbers as a decimal-comma list, which reads as a
 * corrupted file rather than the byte count it actually is.
 */
export function filePreview(name: string, contents: string | Uint8Array): HTMLElement {
  const body =
    typeof contents === "string"
      ? h("pre", { class: "mb-code", text: contents })
      : h("div", { class: "mb-why", text: `Binary, ${contents.length} byte${contents.length === 1 ? "" : "s"}.` });
  return h("div", null, h("div", { class: "mb-filename", text: name }), body);
}

/** Replace a container's contents with rows, or with an empty state. */
export function fillList(container: HTMLElement, rows: readonly HTMLElement[], nothing: HTMLElement): void {
  if (rows.length === 0) fill(container, nothing);
  else fill(container, ...rows);
}
