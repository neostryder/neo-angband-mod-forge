/**
 * Opening the workshop: everything wired together, once.
 *
 * This is the only place the pieces meet, and it is deliberately dull. Resolve
 * what this install can do, read whatever unfinished work is stored, build the
 * store over it, mount the overlay, mount the app. Nothing here decides anything;
 * every decision has a file of its own.
 *
 * IT RETURNS A HANDLE, and the handle matters. A mod can be switched off, and the
 * page reloads when it is, so the tear-down path is not hypothetical: the same
 * function that opened the workshop has to be able to shut it, stop the draft
 * writer, and remove every listener, without leaving an element behind that
 * outlives the code that understands it.
 */

import type { BuilderCtx } from "./host/context.js";
import { FLAG } from "./host/context.js";
import { resolveSeams } from "./host/seams.js";
import { DraftWriter, loadDrafts } from "./model/persist.js";
import { Actions } from "./ui/actions.js";
import { mountApp } from "./ui/app.js";
import { useDocument } from "./ui/dom.js";
import type { Dismissable } from "./ui/launch.js";
import { mountExit, mountLaunch } from "./ui/launch.js";
import { mountOverlay } from "./ui/overlay.js";
import { initialState, Store } from "./ui/store.js";

export interface WorkshopHandle {
  close(): void;
  readonly open: boolean;
}

/**
 * Open it.
 *
 * Returns undefined when there is no document to build into, which is a
 * legitimate host rather than an error: a headless harness and a test both run
 * the game with no page. Declining quietly is the right answer, and the game's
 * own sample plugins decline the same way for the same reason.
 */
export function openWorkshop(ctx: BuilderCtx, doc: Document | undefined): WorkshopHandle | undefined {
  if (!doc || !doc.body) return undefined;

  const seams = resolveSeams(ctx);
  const log = ctx.log ?? ((): void => undefined);

  /* Drafts are read only when the player has asked for them to be kept. With the
   * toggle off the workshop starts empty every time, which is a legitimate thing
   * to want from a tool whose storage can quietly fail. */
  const keep = ctx.flags[FLAG.keepDrafts] === true;
  const stored = keep ? loadDrafts(ctx.prefs) : { drafts: {}, seenTour: false };

  const store = new Store(initialState(stored.drafts, stored.seenTour));
  const writer = new DraftWriter(keep ? ctx.prefs : undefined, (outcome) => {
    if (outcome.ok) return;
    /* A failed write is said out loud on the status line rather than logged and
     * forgotten, because the store swallows its own quota error and a player who
     * loses twenty minutes to that will reasonably conclude this is broken. */
    store.view(() => ({ notice: { text: outcome.why, tone: "bad" } }));
    log(`draft storage refused ${outcome.bytes} bytes: ${outcome.why}`);
  });

  const overlay = mountOverlay(doc, { label: "ModForge" });

  let closed = false;
  let launchHandle: Dismissable | undefined;
  const handle: WorkshopHandle = {
    get open() {
      return !closed;
    },
    close() {
      if (closed) return;
      closed = true;
      /* Stopped rather than let run: a launch screen mid-animation has
       * pending timers of its own, and this path - a mod switched off, a
       * test's own teardown - is tearing the whole overlay down right after,
       * not asking the launch screen to leave gracefully. */
      launchHandle?.dispose();
      writer.flush();
      writer.dispose();
      acts.dispose();
      overlay.close();
    },
  };

  const acts = new Actions({
    store,
    seams,
    api: seams.authoring.api,
    records: seams.authoring.records,
    writer,
    log,
    doc,
    closeWorkshop: () => handle.close(),
    /* The graceful exit screen, for the player's OWN close - the titlebar
     * button and the bottom rung of the escape ladder - as opposed to
     * `handle.close()` above, which is the programmatic teardown a mod
     * switch or a test uses and which stays immediate on purpose. */
    playExit: (done) => mountExit(overlay, { onDone: done }),
  });

  /* THE LAUNCH SCREEN MOUNTS BEFORE `mountApp`, AND THAT ORDER IS LOAD-BEARING.
   * `overlay.ts` offers a key to its registered handlers in the order they
   * registered, and the first one to claim an event is the only one that
   * runs - so mounting this first is what gives it Escape and Enter while it
   * is up, ahead of the workshop's own escape ladder underneath. `useDocument`
   * is called explicitly first because `mountApp` would otherwise be the one
   * to call it, and this needs `h()` working before that happens. */
  useDocument(doc);
  launchHandle = mountLaunch(overlay, {
    firstRun: !stored.seenTour,
    onEnter: () => {
      launchHandle = undefined;
    },
    onCancel: () => {
      launchHandle = undefined;
      handle.close();
    },
    onDocs: () => {
      launchHandle = undefined;
      acts.go({ at: "docs", doc: "tutorial-01" });
    },
  });

  /* THE TITLE SCREEN NEVER DELAYS THE WORKSHOP MOUNTING, even though it
   * registered first. The mod list (or the guide, on a first run) is built
   * right here and sitting ready the instant this function returns - the
   * launch screen only plays in front of it for a few hundred milliseconds
   * and then gets out of the way, on its own for a player who has seen it
   * before, or on a click, Enter or Escape for anybody. */
  mountApp({
    overlay,
    doc,
    store,
    acts,
    seams,
    api: seams.authoring.api,
    records: seams.authoring.records,
    core: ctx.core,
    ...(ctx.registries === undefined ? {} : { registries: ctx.registries }),
  });

  /* `mountApp`'s own render() just moved focus onto its first screen's first
   * control, which is invisible while the launch screen still covers it -
   * see `Dismissable.focus` for why this half exists. */
  launchHandle.focus();

  overlay.onClose(() => {
    closed = true;
    writer.flush();
    writer.dispose();
    acts.dispose();
  });

  log(
    `workshop opened: authoring ${seams.authoring.available ? "live" : "demonstration"}, ` +
      `install ${seams.install.available ? "in place" : "by file"}, ` +
      `testing ${seams.wizard.available ? "on" : "off"}`,
  );
  return handle;
}
