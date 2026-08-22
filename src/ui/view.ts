/**
 * What a screen is, and what it is handed.
 *
 * A view owns its elements from `mount` to `dispose` and is told about state
 * changes through `update(next, prev)`. It compares what it needs to and touches
 * only what moved. Nothing here rebuilds a subtree from a string, for the reasons
 * in `store.ts`.
 *
 * `prev` is handed over rather than kept, so a view can ask "did the thing I care
 * about change" in one comparison instead of holding a shadow copy of the state
 * it read last time. Views that genuinely need their own memory keep it in a
 * closure, which is the only place it cannot get out of step with the store.
 */

import type { AuthoringApi, ComposedRecords } from "../host/authoring.js";
import type { CoreApi, RegistriesLike } from "../host/context.js";
import type { Seams } from "../host/seams.js";
import type { Actions } from "./actions.js";
import type { AppState } from "./store.js";
import type { Store } from "./store.js";
import type { Tooltips } from "./tooltip.js";

export interface View {
  readonly el: HTMLElement;
  update(next: AppState, prev: AppState): void;
  dispose(): void;
  /**
   * A key the screen wants before the shell's own ladder sees it.
   *
   * WHY A SCREEN CANNOT JUST LISTEN FOR ITSELF, which is the obvious way and does
   * not work here. The overlay registers its keyboard listeners on the WINDOW in the
   * capture phase and calls `stopImmediatePropagation` on every one of them, because
   * the game's keyboard model is single-owner and a letter that reaches it moves the
   * character. Stopping propagation at the window in the capture phase means the
   * event never descends to the elements below, so a `keydown` listener on a
   * textarea inside the shadow root NEVER FIRES. Measured, not assumed.
   *
   * So a screen that needs a key gesture - Tab to indent, Enter to keep the
   * indentation, a chord to save - asks for it here, and the shell offers every key
   * to the screen that is up before doing anything with it itself.
   *
   * Returning true means handled, and the overlay then calls `preventDefault`.
   * Returning false leaves the key alone, which is how the browser keeps the ones
   * that belong to it - a textarea's own undo among them.
   */
  keys?(event: KeyboardEvent): boolean;
}

/** Everything a screen is allowed to reach. */
export interface Workshop {
  readonly store: Store;
  readonly acts: Actions;
  readonly seams: Seams;
  readonly api: AuthoringApi;
  readonly records: ComposedRecords;
  readonly tips: Tooltips;
  readonly doc: Document;
  /** The engine. Reached by exactly one screen, to spawn something. */
  readonly core: CoreApi;
  /** The bound registries, for resolving a name to something the game can place. */
  readonly registries?: RegistriesLike;
}
