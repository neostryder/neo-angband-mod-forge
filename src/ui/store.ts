/**
 * The workshop's state, and the smallest store that can hold it.
 *
 * NO FRAMEWORK, and not for want of taste: `plugin.js` is one module that can
 * resolve no specifier, so anything in here is something written here. That
 * constraint turns out to argue for the right architecture anyway.
 *
 * IMPERATIVE VIEWS, NOT RERENDERED STRINGS. Every view object below owns its
 * elements and is handed `(next, prev)` to update them in place. The alternative
 * - rebuild the screen's HTML and assign it - loses focus, text selection,
 * caret position, in-progress composition and scroll offset on every keystroke,
 * which are precisely the failures that make a tool feel like a toy. It also
 * makes escaping somebody's monster description into HTML a problem that has to
 * be solved correctly in forty places instead of not existing.
 *
 * THREE KINDS OF STATE, kept apart because they change on different clocks:
 *
 *  - DOCUMENT state: the drafts. Undoable, persisted, and the only thing that
 *    ends up in a file.
 *  - VIEW state: which screen, which record, which path inside it, what the
 *    filter box says, which groups are open. Not undoable - undoing a scroll
 *    position is not a thing anybody wants - and not persisted beyond the
 *    session.
 *  - DERIVED state: the build verdict. Recomputed from the document, on a delay,
 *    and tagged with a revision so a slow answer for an old document is
 *    discarded rather than shown.
 */

import type { ProjectBuild } from "../host/authoring.js";
import type { Draft } from "../model/draft.js";

/** Which screen the workshop is on. */
export type Route =
  | { readonly at: "tour" }
  | { readonly at: "mods" }
  | { readonly at: "details" }
  | { readonly at: "kinds" }
  | { readonly at: "base"; readonly file: string; readonly mode: "new" | "change" }
  | { readonly at: "record"; readonly change: number; readonly path: string }
  | { readonly at: "rebalance"; readonly file: string }
  | { readonly at: "verdict" }
  | { readonly at: "test" }
  /** The file editor. An empty path means the list with nothing open. */
  | { readonly at: "files"; readonly path: string }
  /** What ModForge is, in the tool's own words - also reachable from the launch screen. */
  | { readonly at: "about" };

/**
 * One file open in the editor and not yet saved.
 *
 * `from` is the text the editor was HANDED, kept verbatim rather than recomputed.
 * That is what makes the stale check mean something: on save, the file's text is
 * derived again from the draft as it now stands and compared against this, so a
 * change that arrived from somewhere else while the author was typing is seen
 * instead of being flattened.
 */
export interface Buffer {
  readonly text: string;
  readonly from: string;
}

/** The build verdict, and whether it is still the answer to the current draft. */
export interface Verdict {
  /** The document revision this verdict was computed for. */
  readonly revision: number;
  /** True while a newer revision is being checked. The pane says so. */
  readonly stale: boolean;
  readonly build?: ProjectBuild;
  /** Present when the build itself threw, which is a workshop bug, not the mod's. */
  readonly broke?: string;
}

export interface AppState {
  readonly route: Route;
  /** Every draft, by id. */
  readonly drafts: Readonly<Record<string, Draft>>;
  /** Which draft is open, when one is. */
  readonly openId?: string | undefined;
  /** Bumped on every document change. The verdict's revision is compared to it. */
  readonly revision: number;
  readonly verdict: Verdict;
  /** Show every field the file has, not just the ones this record carries. */
  readonly showAllFields: boolean;
  /** The filter box on whichever list is showing. */
  readonly filter: string;
  /** Which field groups are collapsed, by group name. */
  readonly collapsed: Readonly<Record<string, boolean>>;
  /** The field the inspector is describing, as a path inside the open record. */
  readonly focusField?: string | undefined;
  /**
   * Files open in the editor with unsaved text in them, by path.
   *
   * VIEW STATE, DELIBERATELY. It is not undoable, because undo belongs to the mod
   * and a textarea has its own; and it is not persisted, because a store of file
   * text that outlived the session would be the second copy of the project this
   * whole design exists to avoid. What that costs is real and is said on the screen:
   * a reload loses whatever has not been saved into the mod.
   */
  readonly buffers: Readonly<Record<string, Buffer>>;
  /** A transient line at the foot of the screen. */
  readonly notice?: { readonly text: string; readonly tone: "good" | "bad" | "plain" } | undefined;
  /** True once the player has been told what the demonstration banner means. */
  readonly seenTour: boolean;
}

export function initialState(drafts: Readonly<Record<string, Draft>>, seenTour: boolean): AppState {
  return {
    route: seenTour ? { at: "mods" } : { at: "tour" },
    drafts,
    revision: 0,
    verdict: { revision: -1, stale: false },
    showAllFields: false,
    filter: "",
    collapsed: {},
    buffers: {},
    seenTour,
  };
}

/** The open draft, or undefined. Every screen that needs one checks. */
export function openDraft(state: AppState): Draft | undefined {
  return state.openId === undefined ? undefined : state.drafts[state.openId];
}

type Listener = (next: AppState, prev: AppState) => void;

/**
 * The store, plus undo.
 *
 * UNDO IS A STACK OF WHOLE DRAFT TABLES, not a stack of inverse operations. A
 * mod in progress is a few kilobytes of JSON and the depth is capped, so the
 * memory is not worth an argument, and the alternative - an inverse for every
 * gesture - is a second implementation of every edit, each of which can be
 * subtly wrong in a way that only shows up after three undos.
 */
export class Store {
  private state: AppState;
  private readonly listeners: Listener[] = [];
  private readonly past: Readonly<Record<string, Draft>>[] = [];
  private readonly future: Readonly<Record<string, Draft>>[] = [];
  private static readonly DEPTH = 60;

  constructor(initial: AppState) {
    this.state = initial;
  }

  get(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      const at = this.listeners.indexOf(listener);
      if (at >= 0) this.listeners.splice(at, 1);
    };
  }

  /** Change VIEW or DERIVED state. Not undoable, does not bump the revision. */
  view(change: (state: AppState) => Partial<AppState>): void {
    this.commit({ ...this.state, ...change(this.state) });
  }

  /**
   * Change the DOCUMENT. Undoable, bumps the revision, invalidates the verdict.
   *
   * The verdict is marked stale rather than cleared, so the findings pane keeps
   * showing the last completed answer with a label instead of emptying and
   * refilling on every keystroke. A pane that flickers is a pane nobody reads.
   */
  edit(change: (drafts: Readonly<Record<string, Draft>>) => Readonly<Record<string, Draft>>): void {
    const next = change(this.state.drafts);
    if (next === this.state.drafts) return;
    this.past.push(this.state.drafts);
    if (this.past.length > Store.DEPTH) this.past.shift();
    this.future.length = 0;
    this.commit({
      ...this.state,
      drafts: next,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true },
    });
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(): void {
    const previous = this.past.pop();
    if (!previous) return;
    this.future.push(this.state.drafts);
    this.commit({
      ...this.state,
      drafts: previous,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true },
    });
  }

  redo(): void {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.state.drafts);
    this.commit({
      ...this.state,
      drafts: next,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true },
    });
  }

  private commit(next: AppState): void {
    const prev = this.state;
    if (next === prev) return;
    this.state = next;
    for (const listener of [...this.listeners]) listener(next, prev);
  }
}
