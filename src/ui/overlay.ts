/**
 * The overlay: a real element, over the game, that owns the keyboard while it is
 * open.
 *
 * WHY THIS IS THE MOD'S JOB TODAY. There is no host seam that mounts an element
 * for a mod and suppresses the game's own input while it is up. There is also
 * nothing stopping a mod from doing it: four sample plugins that ship with the
 * game create their own elements from the ambient document, position them from
 * the region geometry the frame publishes, and manage their own listeners, and
 * the region documentation names that as the pattern. The capability model is a
 * declaration for in-process code rather than a fence, which the engine's own
 * documentation says in as many words, so a `ui:dom.overlay` capability would
 * add a consent string and no containment.
 *
 * WHAT THE MOD CANNOT DO FOR ITSELF, recorded here and in PLANNED.md rather than
 * glossed: the host holds the key-repeat and pointer-button state that drives the
 * game, and a mod cannot clear it. So closing the workshop with a key held down
 * can still deliver that key to the game. Capture-phase listeners stop the game
 * seeing anything while the workshop is open, which is the important half; the
 * transition at the edges is the half that wants a seam.
 *
 * THREE RULES THE LISTENERS FOLLOW, each because of a way this goes wrong:
 *
 *  1. CAPTURE, THEN STOP. The listeners are registered on the window in the
 *     capture phase, so they run before anything the game registered, and they
 *     call `stopPropagation` unconditionally while the workshop is open. Without
 *     that, typing a monster's name walks the character across the level, because
 *     the game's keyboard model is single-owner and every letter is a command.
 *  2. STOP IS NOT PREVENT. `preventDefault` is called only for a key aimed at
 *     nothing editable and only when no modifier is held. A text field needs its
 *     own arrow keys, selection, clipboard and composition, and the browser's
 *     chords - reload, devtools, the address bar - belong to the browser and not
 *     to a mod that happens to be up.
 *  3. COMPOSITION IS NOT TYPING. While an input method is composing, Escape and
 *     Enter belong to the composition. A workshop that closed itself when
 *     somebody committed an accented character would be unusable in half the
 *     languages the game is translated into.
 */

import { THEME_CSS } from "./theme.js";

/** What the app gets back when the overlay is up. */
export interface Overlay {
  /** The shadow root everything is built into. Open, so it stays inspectable. */
  readonly root: ShadowRoot;
  /** Called when the overlay closes, whoever closed it. */
  onClose(handler: () => void): void;
  /** Called for every key the overlay swallowed. Return true if it was handled. */
  onKey(handler: (event: KeyboardEvent) => boolean): void;
  /** Switch the parchment treatment on or off. */
  setParchment(on: boolean): void;
  /** True until `close` runs. */
  readonly open: boolean;
  close(): void;
}

const HOST_ID = "neo-angband-mod-builder";

/**
 * Above the game and above the samples, and low enough to leave room.
 *
 * The game's own canvas sits at the bottom of the page's stacking order and the
 * sample plugins that draw over it use 50 and 60. 2000 is chosen to be clearly
 * above anything in that range without being the sort of number that says the
 * author had given up.
 */
const Z = 2000;

export function mountOverlay(doc: Document, options: { readonly label: string }): Overlay {
  const existing = doc.getElementById(HOST_ID);
  if (existing) existing.remove();

  const host = doc.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.setAttribute("aria-label", options.label);
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = String(Z);
  /* `dvh` rather than `vh`, so a mobile browser's collapsing toolbar does not
   * leave the bottom row of the workshop under it. */
  host.style.height = "100dvh";
  host.style.width = "100vw";

  const root = host.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = THEME_CSS;
  root.appendChild(style);

  doc.body.appendChild(host);

  const closeHandlers: (() => void)[] = [];
  const keyHandlers: ((event: KeyboardEvent) => boolean)[] = [];
  let open = true;
  let composing = false;

  const insideUs = (target: EventTarget | null): boolean => {
    if (!(target instanceof Node)) return false;
    return host.contains(target) || root.contains(target);
  };

  const editable = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return target instanceof HTMLElement && target.isContentEditable;
  };

  const onKeyEvent = (event: Event): void => {
    if (!open || !(event instanceof KeyboardEvent)) return;
    /* The game must not see this key, whatever it is and wherever it landed. */
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (event.type !== "keydown") return;
    if (composing || event.isComposing) return;

    for (const handler of keyHandlers) {
      if (handler(event)) {
        event.preventDefault();
        return;
      }
    }
    /* Nothing wanted it. Swallow it only if it was aimed at nothing that could
     * use it and carries no modifier the browser owns. */
    if (!editable(event.target) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
    }
  };

  const onComposition = (event: Event): void => {
    composing = event.type === "compositionstart";
  };

  /* Pointer events are swallowed only OUTSIDE the workshop, because inside it
   * they are the workshop's own clicks. A mousedown on the game canvas behind a
   * modal has no business reaching the game. */
  const onPointerEvent = (event: Event): void => {
    if (!open) return;
    if (insideUs(event.target)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
  };

  /**
   * Pull focus back if it escapes.
   *
   * A modal that lets Tab walk into the page behind it is a modal in name only:
   * the reader ends up typing into something they cannot see. The guard sends
   * focus to the first thing inside the workshop rather than to the host element,
   * so it lands somewhere useful rather than nowhere.
   */
  const onFocusIn = (event: Event): void => {
    if (!open) return;
    if (insideUs(event.target)) return;
    const first = root.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (first) first.focus();
    else host.focus();
  };

  const win = doc.defaultView;
  const listeners: [string, EventListener, boolean][] = [
    ["keydown", onKeyEvent, true],
    ["keyup", onKeyEvent, true],
    ["keypress", onKeyEvent, true],
    ["compositionstart", onComposition, true],
    ["compositionend", onComposition, true],
    ["mousedown", onPointerEvent, true],
    ["mouseup", onPointerEvent, true],
    ["click", onPointerEvent, true],
    ["wheel", onPointerEvent, true],
    ["touchstart", onPointerEvent, true],
    ["focusin", onFocusIn, true],
  ];
  for (const [type, listener, capture] of listeners) {
    win?.addEventListener(type, listener, capture);
  }

  const overlay: Overlay = {
    root,
    get open() {
      return open;
    },
    onClose(handler) {
      closeHandlers.push(handler);
    },
    onKey(handler) {
      keyHandlers.push(handler);
    },
    setParchment(on) {
      host.classList.toggle("mb-parchment", on);
    },
    close() {
      if (!open) return;
      open = false;
      for (const [type, listener, capture] of listeners) {
        win?.removeEventListener(type, listener, capture);
      }
      host.remove();
      for (const handler of [...closeHandlers]) handler();
    },
  };
  return overlay;
}
