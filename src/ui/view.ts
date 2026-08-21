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

/** A view that needs no updates: static prose, an error, an empty state. */
export function staticView(el: HTMLElement): View {
  return { el, update: () => undefined, dispose: () => undefined };
}
