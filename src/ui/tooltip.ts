/**
 * One tooltip, for the whole workshop.
 *
 * MEASURED AND PLACED HERE rather than handed to the browser. `title` cannot be
 * styled, appears after a delay nobody can set, never appears for a keyboard
 * user, and on a touch device does not appear at all. The native popover
 * behaviour is better and is still version-sensitive in ways a mod cannot test
 * across. So: one element, one listener pair, and arithmetic.
 *
 * WHAT GETS ONE, and the rule is a rule because a tool where everything has a
 * tooltip is a tool where nothing does:
 *
 *  - a control whose label is an icon or a single character
 *  - a term out of the game's own vocabulary that a new author will not know
 *  - a number the workshop computed rather than the player typed
 *  - a control that is disabled, where the tip is the reason
 *  - a consequence worth knowing before the click, not after
 *
 * WHAT DOES NOT: anything with a clear label already, a validation message (those
 * belong in the findings pane where they persist), and anything essential. A
 * tooltip is not a place to keep something the reader has to know, because it is
 * the one piece of the interface that vanishes when you look away.
 *
 * ON FOCUS IT IS IMMEDIATE, on hover it waits. A keyboard user arriving at a
 * control has asked for it; a pointer crossing a toolbar has not.
 */

const HOVER_DELAY = 350;
const GAP = 8;

export interface Tooltips {
  dispose(): void;
  /** Hide whatever is showing. The Escape ladder's first rung. */
  hide(): boolean;
}

/**
 * Watch a subtree for anything carrying `data-tip`.
 *
 * Delegated, so a list that redraws its rows does not have to re-register
 * anything, and a row that goes away cannot leave a tooltip behind it.
 */
export function installTooltips(root: ShadowRoot, doc: Document): Tooltips {
  const tip = doc.createElement("div");
  tip.className = "mb-tip";
  tip.setAttribute("role", "tooltip");
  tip.dataset["shown"] = "0";
  root.appendChild(tip);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let showing: HTMLElement | undefined;

  const hide = (): boolean => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (showing === undefined) return false;
    showing = undefined;
    tip.dataset["shown"] = "0";
    return true;
  };

  const place = (anchor: HTMLElement, text: string): void => {
    tip.textContent = text;
    tip.dataset["shown"] = "1";
    showing = anchor;

    const box = anchor.getBoundingClientRect();
    const own = tip.getBoundingClientRect();
    const view = doc.defaultView;
    const width = view?.innerWidth ?? 1024;
    const height = view?.innerHeight ?? 768;

    /* Below by preference, above when there is no room below. Clamped
     * horizontally so a tip on a control at the right edge stays on screen. */
    let top = box.bottom + GAP;
    if (top + own.height > height - 4) top = Math.max(4, box.top - own.height - GAP);
    let left = box.left;
    if (left + own.width > width - 4) left = Math.max(4, width - own.width - 4);

    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
  };

  const anchorFor = (target: EventTarget | null): { el: HTMLElement; text: string } | undefined => {
    let node = target instanceof Node ? (target as HTMLElement | null) : null;
    while (node && node !== (root as unknown as HTMLElement)) {
      if (node instanceof HTMLElement) {
        const text = node.dataset["tip"];
        if (text !== undefined && text !== "") return { el: node, text };
      }
      node = node.parentElement;
    }
    return undefined;
  };

  const onOver = (event: Event): void => {
    const found = anchorFor(event.target);
    if (!found) {
      hide();
      return;
    }
    if (showing === found.el) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => place(found.el, found.text), HOVER_DELAY);
  };

  const onOut = (): void => {
    hide();
  };

  const onFocus = (event: Event): void => {
    const found = anchorFor(event.target);
    if (!found) {
      hide();
      return;
    }
    if (timer !== undefined) clearTimeout(timer);
    place(found.el, found.text);
  };

  const listeners: [string, EventListener][] = [
    ["pointerover", onOver],
    ["pointerout", onOut],
    ["focusin", onFocus],
    ["focusout", onOut],
    /* A click means the reader has acted; the explanation is no longer wanted. */
    ["click", onOut],
  ];
  for (const [type, listener] of listeners) root.addEventListener(type, listener, true);

  return {
    hide,
    dispose() {
      hide();
      for (const [type, listener] of listeners) root.removeEventListener(type, listener, true);
      tip.remove();
    },
  };
}
