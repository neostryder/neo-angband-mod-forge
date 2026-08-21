/**
 * The whole of this mod's element-building vocabulary, in one small function.
 *
 * NO `innerHTML`, ANYWHERE, and the rule is absolute rather than stylistic.
 * Every string this workshop displays came from somewhere the workshop does not
 * control: a monster's description that another mod wrote, a field name from a
 * hand-edited file, a validation message quoting a value the player typed. Text
 * goes in through `textContent`, so a description containing a bracket is a
 * description containing a bracket and there is nothing to escape and nowhere to
 * get the escaping wrong.
 *
 * `h` is deliberately not a framework. It builds an element and returns it. Views
 * keep the elements they care about and change them in place; nothing is
 * rebuilt from a string.
 */

/** Anything that can go inside an element. `null` and `false` are dropped. */
export type Child = Node | string | number | null | false | undefined | readonly Child[];

/** Attributes, plus the two shorthands worth having. */
export interface Attrs {
  readonly class?: string;
  /** Text content. Set through `textContent`, so nothing is ever parsed. */
  readonly text?: string | number;
  readonly title?: string;
  /** The workshop's own tooltip, which is not the browser's `title`. */
  readonly tip?: string;
  readonly type?: string;
  readonly value?: string | number;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly checked?: boolean;
  readonly min?: string | number;
  readonly max?: string | number;
  readonly step?: string | number;
  readonly rows?: number;
  readonly href?: string;
  readonly download?: string;
  readonly spellcheck?: boolean;
  readonly tabIndex?: number;
  readonly style?: Readonly<Record<string, string>>;
  readonly data?: Readonly<Record<string, string>>;
  readonly aria?: Readonly<Record<string, string>>;
  readonly role?: string;
  readonly on?: Readonly<Record<string, (event: Event) => void>>;
}

let factory: Document | undefined;

/**
 * The document elements are made from.
 *
 * Threaded in rather than reached for, so the tests can hand over a synthetic
 * one and so this file never assumes a browser exists. A headless host is a
 * legitimate host and this whole layer simply does not run there.
 */
export function useDocument(doc: Document): void {
  factory = doc;
}

function doc(): Document {
  if (!factory) throw new Error("useDocument has not been called: there is no document to build elements from");
  return factory;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = doc().createElement(tag);
  if (attrs) apply(el, attrs);
  append(el, children);
  return el;
}

/** An inline SVG element, for the few marks that earn one. */
export function svg(markup: { readonly viewBox: string; readonly paths: readonly string[]; readonly cls?: string }): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const root = doc().createElementNS(ns, "svg");
  root.setAttribute("viewBox", markup.viewBox);
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("focusable", "false");
  if (markup.cls) root.setAttribute("class", markup.cls);
  for (const d of markup.paths) {
    const path = doc().createElementNS(ns, "path");
    path.setAttribute("d", d);
    root.appendChild(path);
  }
  return root;
}

function apply(el: HTMLElement, attrs: Attrs): void {
  if (attrs.class !== undefined) el.className = attrs.class;
  if (attrs.text !== undefined) el.textContent = String(attrs.text);
  if (attrs.title !== undefined) el.title = attrs.title;
  if (attrs.tip !== undefined) el.dataset["tip"] = attrs.tip;
  if (attrs.role !== undefined) el.setAttribute("role", attrs.role);
  if (attrs.tabIndex !== undefined) el.tabIndex = attrs.tabIndex;
  if (attrs.href !== undefined && el instanceof HTMLAnchorElement) el.href = attrs.href;
  if (attrs.download !== undefined && el instanceof HTMLAnchorElement) el.download = attrs.download;
  if (attrs.spellcheck !== undefined) el.spellcheck = attrs.spellcheck;

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (attrs.type !== undefined && el instanceof HTMLInputElement) el.type = attrs.type;
    if (attrs.value !== undefined) el.value = String(attrs.value);
    if (attrs.placeholder !== undefined && !(el instanceof HTMLSelectElement)) el.placeholder = attrs.placeholder;
    if (attrs.disabled !== undefined) el.disabled = attrs.disabled;
    if (attrs.checked !== undefined && el instanceof HTMLInputElement) el.checked = attrs.checked;
    if (el instanceof HTMLInputElement) {
      if (attrs.min !== undefined) el.min = String(attrs.min);
      if (attrs.max !== undefined) el.max = String(attrs.max);
      if (attrs.step !== undefined) el.step = String(attrs.step);
    }
    if (attrs.rows !== undefined && el instanceof HTMLTextAreaElement) el.rows = attrs.rows;
  } else if (attrs.disabled !== undefined && el instanceof HTMLButtonElement) {
    el.disabled = attrs.disabled;
  }

  for (const [key, value] of Object.entries(attrs.style ?? {})) el.style.setProperty(key, value);
  for (const [key, value] of Object.entries(attrs.data ?? {})) el.dataset[key] = value;
  for (const [key, value] of Object.entries(attrs.aria ?? {})) el.setAttribute(`aria-${key}`, value);
  for (const [event, handler] of Object.entries(attrs.on ?? {})) el.addEventListener(event, handler);
}

function append(el: HTMLElement, children: readonly Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) {
      append(el, child);
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(doc().createTextNode(String(child)));
      continue;
    }
    el.appendChild(child as Node);
  }
}

/** Replace everything inside an element with new children. */
export function fill(el: HTMLElement, ...children: Child[]): void {
  while (el.firstChild) el.removeChild(el.firstChild);
  append(el, children);
}

/** Set text only when it changed, so a stable line is not touched every frame. */
export function setText(el: HTMLElement, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

/** Add or drop one class without disturbing the others. */
export function setClass(el: HTMLElement, name: string, on: boolean): void {
  el.classList.toggle(name, on);
}

/**
 * One delegated listener for a whole subtree, dispatching on `data-action`.
 *
 * Buttons and rows go through this rather than each holding its own closure,
 * because a list of six hundred monsters with six hundred closures is six hundred
 * things to detach. Inputs deliberately do NOT: a text field keeps its own
 * handler and its own element for as long as the player is typing in it.
 */
export function delegate(
  root: HTMLElement,
  event: string,
  handlers: Readonly<Record<string, (el: HTMLElement, event: Event) => void>>,
): () => void {
  const listener = (e: Event): void => {
    let node = e.target as HTMLElement | null;
    while (node && node !== root) {
      const action = node.dataset["action"];
      if (action !== undefined) {
        const handler = handlers[action];
        if (handler) {
          handler(node, e);
          return;
        }
      }
      node = node.parentElement;
    }
  };
  root.addEventListener(event, listener);
  return () => root.removeEventListener(event, listener);
}

/** Every element inside a root that a Tab press should be able to reach. */
export function focusable(root: ParentNode): HTMLElement[] {
  const found = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return [...found].filter((el) => el.offsetParent !== null || el === root);
}
