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

  const overlay = mountOverlay(doc, { label: "Mod Builder" });

  let closed = false;
  const handle: WorkshopHandle = {
    get open() {
      return !closed;
    },
    close() {
      if (closed) return;
      closed = true;
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
  });

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

  overlay.onClose(() => {
    closed = true;
    writer.flush();
    writer.dispose();
    acts.dispose();
  });

  log(
    `workshop opened: authoring ${seams.authoring.available ? "live" : "demonstration"}, ` +
      `install ${seams.install.available ? "in place" : "by file"}, ` +
      `spawn ${seams.spawn.available ? "on" : "off"}`,
  );
  return handle;
}
