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
 * WHAT THE MOD CANNOT DO PERFECTLY FOR ITSELF, recorded here and in PLANNED.md
 * rather than glossed: the host, not this file, owns the hardware auto-repeat
 * that keeps a physically held key generating keydowns for as long as it stays
 * down, and nothing removing a listener can reach in and stop that. What these
 * listeners CAN do, and now do, is keep the game from being left thinking a key
 * or pointer button is still held once it can no longer hear the release: see
 * `heldKeys` and `heldButtons` below, and the honest keyup or mouseup they
 * synthesize the moment the overlay discovers an already-repeating key or gives
 * up ownership of one. It narrows the edge case; it does not close it, which is
 * why `ui:dom.overlay` is still not asked for.
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

const HOST_ID = "neo-angband-mod-forge";

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
  const win = doc.defaultView;

  /**
   * HELD-KEY-REPEAT AND POINTER-BUTTON STATE, tracked here because nothing else
   * can be asked. `heldKeys` is every key the overlay has seen go down without a
   * matching keyup while it owns input; `heldButtons` is the same for a pointer
   * button aimed at the game. Neither the browser nor the game exposes "what is
   * currently held" as something that can be read on demand - the only way to
   * know is to have watched every keydown and keyup go by, which the overlay
   * already does for a different reason (RULE 1, above).
   *
   * WHAT THIS BUYS, AND WHAT IT DOES NOT. `docs/ENGINE_SEAMS.md` records that a
   * `ui:dom.overlay` capability is not asked for, and that the mod's own
   * listeners "get most of the way there and cannot get that far": they cannot
   * stop the browser from keeping a physically held key auto-repeating past the
   * moment these listeners are removed, because that repeat is driven by
   * hardware and nothing in the page's own script owns it. What they CAN do is
   * make sure the game is never left believing a key is down that it has no way
   * to hear the release of - by telling it, honestly, the moment the overlay
   * either discovers an already-repeating key or gives up ownership of one.
   */
  const heldKeys = new Set<string>();
  const heldButtons = new Set<number>();

  /**
   * Marks a synthetic release so the overlay's own capture-phase listeners let
   * it through instead of swallowing it the way they swallow everything else.
   * Without this, `releaseKey` dispatching a "keyup" at the window would run
   * straight into `onKeyEvent` again - still registered, since a release can be
   * fired while the overlay is open as well as while it is closing - and never
   * reach the game at all, which is the one thing it exists to do.
   */
  const SYNTHETIC = Symbol("mb-synthetic-release");
  const markSynthetic = <T extends Event>(event: T): T => {
    (event as unknown as Record<symbol, unknown>)[SYNTHETIC] = true;
    return event;
  };
  const isSynthetic = (event: Event): boolean =>
    (event as unknown as Record<symbol, unknown>)[SYNTHETIC] === true;

  /** Tell the game a key is not held any more, and stop tracking it as one. */
  const releaseKey = (key: string): void => {
    heldKeys.delete(key);
    win?.dispatchEvent(markSynthetic(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true })));
  };

  /** Tell the game a pointer button is not held any more, and stop tracking it. */
  const releaseButton = (button: number): void => {
    heldButtons.delete(button);
    win?.dispatchEvent(markSynthetic(new MouseEvent("mouseup", { button, bubbles: true, cancelable: true })));
  };

  /**
   * The element the event actually landed on, not the one a window listener is
   * told about.
   *
   * A LISTENER OUTSIDE A SHADOW TREE IS LIED TO, and the lie is the spec's, not a
   * quirk: `event.target` is RETARGETED to the nearest node in the listener's own
   * tree, so every one of these listeners - registered on the window - sees the
   * host `div` for anything that happened inside the workshop. Open or closed makes
   * no difference. `composedPath()[0]` is the real element, which is the whole
   * reason that method exists.
   *
   * MEASURED, because it was wrong here and looked right. `editable(event.target)`
   * asked the host div whether it was a text field, got no, and so the fallback at
   * the bottom of `onKeyEvent` called `preventDefault` on every unmodified
   * keystroke aimed at a field inside the workshop - which is to say that typing a
   * mod's name did nothing, and Tab could not move focus. Nothing in the test suite
   * saw it: the tests set `value` and dispatch an `input` event, which is what a
   * test does and not what a keyboard does, so the whole class of bug was invisible
   * to them by construction.
   */
  const deepest = (event: Event): EventTarget | null => event.composedPath()[0] ?? event.target;

  const insideUs = (event: Event): boolean => {
    const target = deepest(event);
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
    if (!(event instanceof KeyboardEvent) || isSynthetic(event)) return;
    if (!open) return;
    /* The game must not see this key, whatever it is and wherever it landed. */
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (event.type === "keyup") {
      heldKeys.delete(event.key);
    } else if (event.type === "keydown") {
      const alreadyTracked = heldKeys.has(event.key);
      heldKeys.add(event.key);
      /* ON ACQUIRE: a `repeat` keydown the overlay has not tracked yet is the
       * browser continuing a hold that started, or is continuing, outside its
       * knowledge - the game will never get this key's real keyup while the
       * overlay owns input, since every one of them is swallowed here too. Left
       * alone it would keep believing the key is down for as long as the
       * overlay stays open; correcting it the moment the repeat is discovered,
       * rather than waiting for the overlay to close, is the whole of what
       * "clear held state on acquire" means for a seam that is not there. */
      if (!alreadyTracked && event.repeat) releaseKey(event.key);
    }

    if (event.type !== "keydown") return;
    if (composing || event.isComposing) return;

    for (const handler of keyHandlers) {
      if (handler(event)) {
        event.preventDefault();
        return;
      }
    }
    /* Nothing wanted it. Swallow it only if it was aimed at nothing that could
     * use it and carries no modifier the browser owns.
     *
     * TAB IS NEVER SWALLOWED, and it used to be, which meant that a modal covering
     * the whole screen could not be moved around with the keyboard at all unless
     * the caret happened to be in a text field already. It is not a game command
     * and there is nothing to protect the game from: the focus guard below keeps it
     * inside the workshop, so the worst it can do is visit the next control. */
    if (event.key === "Tab") return;
    if (!editable(deepest(event)) && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
    if (isSynthetic(event)) return;
    if (!open) return;
    const outside = !insideUs(event);
    if (outside && event instanceof MouseEvent) {
      /* Tracked only for a button aimed at the game, on the same terms as
       * `heldKeys` above: a mousedown inside the workshop is the workshop's own
       * click and the game was never going to hear about it either way. */
      if (event.type === "mousedown") heldButtons.add(event.button);
      else if (event.type === "mouseup") heldButtons.delete(event.button);
    }
    if (!outside) return;
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
    if (insideUs(event)) return;
    const first = root.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (first) first.focus();
    else host.focus();
  };

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
      /* ON RELEASE: anything still in either set saw a keydown or a mousedown
       * while the overlay owned input and never saw the matching keyup or
       * mouseup before it closed - every one of those was swallowed too, so the
       * game has heard nothing about any of it either way. Telling it now, with
       * the listeners above already gone, is the other half of "clear held
       * state on acquire and release" from `PLANNED.md`. */
      for (const key of [...heldKeys]) releaseKey(key);
      for (const button of [...heldButtons]) releaseButton(button);
      host.remove();
      for (const handler of [...closeHandlers]) handler();
    },
  };
  return overlay;
}
