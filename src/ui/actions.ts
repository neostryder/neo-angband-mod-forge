/**
 * Everything the workshop can DO, in one place.
 *
 * A screen decides what to show. It never decides what an edit means. Keeping
 * that line means the record editor and the rebalance screen and the base picker
 * all produce the same kind of change through the same function, so there is one
 * place where a gesture becomes a change and one place to be right about it.
 *
 * It is also what makes the validation honest. Every document change goes through
 * `store.edit`, which bumps a revision; every revision schedules one recheck;
 * every recheck is discarded if a newer revision arrived while it ran. A screen
 * that edited state directly would be a screen whose changes were never checked.
 */

import type { AuthoringApi, ComposedRecords, EmittedFile, FieldOp, JsonRecord, JsonValue } from "../host/authoring.js";
import type { Seams } from "../host/seams.js";
import type { Change, Draft } from "../model/draft.js";
import { ID_RE, newDraft } from "../model/draft.js";
import { buildDraft, emitDraft, manifestFor, zipDraft } from "../model/build.js";
import { deleteFile, fileText, pathProblem, sessionRefusal, writeFileBytes, writeFileText } from "../model/files.js";
import type { DraftWriter } from "../model/persist.js";
import { opNudge, opScale } from "../model/ops.js";
import { editValue, recordOp, removeValue, targetFor } from "../model/target.js";
import type { AppState, Route } from "./store.js";
import { openDraft, Store } from "./store.js";

/** How long after the last keystroke the full recheck runs. */
const CHECK_DELAY = 250;

export interface ActionDeps {
  readonly store: Store;
  readonly seams: Seams;
  readonly api: AuthoringApi;
  readonly records: ComposedRecords;
  readonly writer: DraftWriter;
  readonly log: (msg: string) => void;
  readonly doc: Document;
  readonly closeWorkshop: () => void;
}

export class Actions {
  private checkTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly deps: ActionDeps) {}

  /* --------------------------------------------------------------- *
   * Navigation and chatter                                          *
   * --------------------------------------------------------------- */

  go(route: Route): void {
    this.deps.store.view(() => ({ route, filter: "" }));
  }

  notice(text: string, tone: "good" | "bad" | "plain" = "plain"): void {
    this.deps.store.view(() => ({ notice: { text, tone } }));
  }

  setFilter(filter: string): void {
    this.deps.store.view(() => ({ filter }));
  }

  focusField(field: string | undefined): void {
    this.deps.store.view(() => (field === undefined ? { focusField: undefined } : { focusField: field }));
  }

  toggleGroup(group: string): void {
    this.deps.store.view((s) => ({ collapsed: { ...s.collapsed, [group]: !s.collapsed[group] } }));
  }

  toggleAllFields(): void {
    this.deps.store.view((s) => ({ showAllFields: !s.showAllFields }));
  }

  finishTour(): void {
    this.deps.store.view(() => ({ seenTour: true, route: { at: "mods" } }));
    this.persist();
  }

  close(): void {
    this.deps.writer.flush();
    this.deps.closeWorkshop();
  }

  /* --------------------------------------------------------------- *
   * Mods                                                            *
   * --------------------------------------------------------------- */

  /** Whether an id can be used, and why not when it cannot. */
  idProblem(id: string): string | undefined {
    if (id === "") return "A mod needs an id.";
    if (!ID_RE.test(id)) {
      return "An id is lower case, starts with a letter, and uses only letters, digits and hyphens.";
    }
    if (this.deps.store.get().drafts[id]) return "There is already an unfinished mod with that id.";
    return undefined;
  }

  createMod(id: string): void {
    if (this.idProblem(id) !== undefined) return;
    const draft = newDraft(id, this.deps.seams.engine, new Date().toISOString());
    this.deps.store.edit((drafts) => ({ ...drafts, [id]: draft }));
    this.deps.store.view(() => ({ openId: id, route: { at: "details" } }));
    this.persist();
  }

  openMod(id: string): void {
    this.deps.store.view(() => ({ openId: id, route: { at: "details" } }));
    this.scheduleCheck();
  }

  deleteMod(id: string): void {
    this.deps.store.edit((drafts) => {
      const next = { ...drafts };
      delete next[id];
      return next;
    });
    this.deps.store.view((s) => ({
      openId: s.openId === id ? undefined : s.openId,
      route: { at: "mods" },
    }));
    this.persist();
  }

  /** Change one or more of the manifest fields on the open draft. */
  setDetails(patch: Partial<Draft>): void {
    this.mutate((draft) => ({ ...draft, ...patch }));
  }

  /* --------------------------------------------------------------- *
   * Changes                                                         *
   * --------------------------------------------------------------- */

  /**
   * Add a new record, drafted against the base the player picked.
   *
   * The drafting call is what makes this worth doing rather than starting from a
   * blank form: the new record inherits the shape and the scale of its nearest
   * comparable and none of its powers, and every number it arrives with can say
   * where it came from.
   */
  addRecord(file: string, seed: JsonRecord): void {
    const drafted = this.deps.api.draftRecord(file, seed, this.deps.records);
    this.pushChange({ kind: "add", file, record: drafted.record });
    const index = (openDraft(this.deps.store.get())?.changes.length ?? 1) - 1;
    this.go({ at: "record", change: index, path: "" });
    if (drafted.modelledOn !== undefined) {
      /* Short enough for the status line, which does not wrap: a sentence that
       * ends in an ellipsis has told the reader nothing. */
      this.notice(`Modelled on ${drafted.modelledOn}. No attacks or flags were copied.`);
    }
  }

  /** Start adjusting a record somebody else owns. */
  patchRecord(file: string, ref: string): void {
    const existing = openDraft(this.deps.store.get())?.changes.findIndex(
      (c) => c.kind === "patch" && c.file === file && c.ref === ref,
    );
    if (existing !== undefined && existing >= 0) {
      this.go({ at: "record", change: existing, path: "" });
      return;
    }
    this.pushChange({ kind: "patch", file, ref, ops: [] });
    const index = (openDraft(this.deps.store.get())?.changes.length ?? 1) - 1;
    this.go({ at: "record", change: index, path: "" });
  }

  /** Take a record out of the game. Confirmed by the caller, not here. */
  removeRecord(file: string, ref: string): void {
    this.pushChange({ kind: "remove", file, ref });
    this.notice(`${ref} will be gone from the game once this mod is installed.`, "bad");
  }

  /** Drop one change from the draft entirely. */
  dropChange(index: number): void {
    this.mutate((draft) => ({ ...draft, changes: draft.changes.filter((_, at) => at !== index) }));
    this.go({ at: "details" });
  }

  /** The player put a value at a path. */
  setValue(index: number, path: string, value: JsonValue): void {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      next[index] = editValue(change, path, value);
      return { ...draft, changes: next };
    });
  }

  /** The player took a field out. */
  clearValue(index: number, path: string): void {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      next[index] = removeValue(change, path);
      return { ...draft, changes: next };
    });
  }

  /**
   * The player made a gesture that IS an op: a nudge, a flag, a row.
   *
   * Only meaningful against a patch. For a record the player owns there is
   * nothing to compose with, so the op is applied and the result stored.
   */
  applyOp(index: number, op: FieldOp): void {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      if (change.kind === "patch") {
        next[index] = recordOp(change, op);
      } else if (change.kind === "add" || change.kind === "replace") {
        try {
          next[index] = { ...change, record: this.deps.api.applyFieldPatch(change.record, [op]) };
        } catch (e) {
          this.notice(String(e), "bad");
          return draft;
        }
      }
      return { ...draft, changes: next };
    });
  }

  /**
   * One numeric op across every record the player filtered down to.
   *
   * The mundane majority of what people mod is a numeric retune, and doing it one
   * record at a time is what stops somebody from bothering. Every one becomes its
   * own `fieldPatches` entry, so the result is an ordinary mod that another mod's
   * unrelated change to the same record still composes with.
   */
  rebalance(file: string, refs: readonly string[], path: string, op: "add" | "mul", value: number): void {
    if (refs.length === 0) return;
    this.mutate((draft) => {
      const changes = [...draft.changes];
      for (const ref of refs) {
        const at = changes.findIndex((c) => c.kind === "patch" && c.file === file && c.ref === ref);
        const made: FieldOp = op === "add" ? opNudge(path, value) : opScale(path, value);
        const found = at >= 0 ? changes[at] : undefined;
        if (found && found.kind === "patch") changes[at] = recordOp(found, made);
        else changes.push({ kind: "patch", file, ref, ops: [made] });
      }
      return { ...draft, changes };
    });
    this.notice(
      `${op === "add" ? "Adjusted" : "Scaled"} ${path} on ${refs.length} record${refs.length === 1 ? "" : "s"}.`,
      "good",
    );
  }

  /* --------------------------------------------------------------- *
   * Files, as text                                                  *
   * --------------------------------------------------------------- */

  /**
   * Open a file in the editor.
   *
   * The buffer remembers the text it was HANDED, which is what makes the check on
   * the way out mean something.
   *
   * A BUFFER WITH NOTHING UNSAVED IN IT IS REFRESHED, and one with unsaved work is
   * not. That distinction is the whole of this method and it was got wrong first
   * time in a way no test in a synthetic document could see: keeping every buffer
   * meant that opening a file, saving it, changing the same record on a wizard
   * screen and opening the file again showed the text from before the wizard
   * change. It looked exactly like the two views having come apart, which is the
   * one thing this feature promises they do not. Found by driving a real browser.
   *
   * Unsaved work is still never thrown away for the crime of clicking a name twice:
   * a dirty buffer is kept as it was, and the stale check on save is what tells the
   * reader that the mod moved underneath it.
   */
  openFile(path: string): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const text = fileText(this.deps.api, draft, path);
    this.deps.store.view((state) => {
      const held = state.buffers[path];
      const dirty = held !== undefined && held.text !== held.from;
      if (text === undefined || dirty) return { route: { at: "files", path } };
      return { route: { at: "files", path }, buffers: { ...state.buffers, [path]: { text, from: text } } };
    });
  }

  /** The reader typed. Held outside the document until they save it. */
  editFile(path: string, text: string): void {
    this.deps.store.view((state) => {
      const held = state.buffers[path];
      if (held === undefined) return {};
      return { buffers: { ...state.buffers, [path]: { ...held, text } } };
    });
  }

  /** Throw away what is in the buffer and show the file as the mod has it. */
  revertFile(path: string): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const text = fileText(this.deps.api, draft, path) ?? "";
    this.deps.store.view((state) => ({ buffers: { ...state.buffers, [path]: { text, from: text } } }));
    this.notice(`${path} is back to what the mod says.`, "plain");
  }

  /**
   * Save the buffer into the mod.
   *
   * ONE STORE EDIT, WHICH IS ONE STEP OF UNDO. A saved record file can be a dozen
   * changes at once, and undo here is a stack of whole documents rather than a
   * stack of inverse operations, so the whole save goes back with one press. Putting
   * each parsed change through the store separately would have been the other
   * option and it is the wrong one: it would mean pressing undo twelve times to take
   * back one gesture the reader made once.
   *
   * THE STALE CHECK IS ON THE BYTES THE READER WAS SHOWN. A file's text is derived
   * from the draft, so it moves when the draft does - an undo, or a change made on
   * another screen. Comparing what the file says NOW against what the buffer was
   * opened from is what turns "your work was quietly overwritten" into a question
   * with two answers. It is safe to compare bytes because the derivation is
   * deterministic: the emitter writes the same keys in the same order for the same
   * draft, so a difference is a real difference and never formatting.
   */
  saveFile(path: string, options: { readonly force?: boolean } = {}): boolean {
    const state = this.deps.store.get();
    const draft = openDraft(state);
    const held = state.buffers[path];
    if (!draft || held === undefined) return false;

    const now = fileText(this.deps.api, draft, path);
    if (options.force !== true && now !== undefined && now !== held.from) {
      this.notice(
        `${path} has changed in the mod since you opened it here, so saving would write over that change. ` +
          `Save anyway to keep what is in the editor, or reload the file to start from what the mod says.`,
        "bad",
      );
      return false;
    }

    const outcome = writeFileText(this.deps.api, draft, path, held.text);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return false;
    }

    this.mutate(() => outcome.draft);
    /* Re-derive rather than assume: saving a record file writes ops back out in the
     * emitter's own shape, so the text on screen after a save is the text the mod
     * will ship, which is not always character for character what was typed. */
    const saved = fileText(this.deps.api, openDraft(this.deps.store.get()) ?? outcome.draft, path) ?? held.text;
    this.deps.store.view((current) => ({ buffers: { ...current.buffers, [path]: { text: saved, from: saved } } }));
    this.notice(`Saved ${path}.`, "good");
    return true;
  }

  /** Start a new file of the author's own. Refused for a path the game would not take. */
  createFile(path: string, contents = ""): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const problem = pathProblem(this.deps.api, draft, path);
    if (problem !== undefined) {
      this.notice(problem, "bad");
      return;
    }
    const outcome = writeFileText(this.deps.api, draft, path, contents);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => ({
      route: { at: "files", path },
      buffers: { ...state.buffers, [path]: { text: contents, from: contents } },
    }));
    this.notice(`${path} is in the mod. It is empty until you write something in it.`, "good");
  }

  /**
   * Start a new file, or replace an existing one of the author's own, with real
   * bytes read from disk - a tile, a font, a sound. `replace` skips the new-path
   * check, because the path is not new.
   *
   * NO TEXT BUFFER IS OPENED. The editor's buffer is a string a textarea can hold,
   * and decoding a PNG's bytes into one would show mojibake and, worse, would let
   * "Save into the mod" re-encode that mojibake as UTF-8 and quietly replace the
   * picture with a different and wrong set of bytes. So the buffer for this path
   * is cleared instead, and the screen reads the file's bytes straight from the
   * draft, the same way it always has for anything it did not open into an editor.
   */
  importFileBytes(path: string, bytes: Uint8Array, options: { readonly replace?: boolean } = {}): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    if (options.replace !== true) {
      const problem = pathProblem(this.deps.api, draft, path);
      if (problem !== undefined) {
        this.notice(problem, "bad");
        return;
      }
    }
    const outcome = writeFileBytes(this.deps.api, draft, path, bytes);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => {
      const buffers = { ...state.buffers };
      delete buffers[path];
      return { route: { at: "files", path }, buffers };
    });
    this.notice(`${path} now holds ${bytes.length} byte${bytes.length === 1 ? "" : "s"} loaded from disk.`, "good");
  }

  /** Take one of the author's own files out of the mod. */
  deleteFile(path: string): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const outcome = deleteFile(this.deps.api, draft, path);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => {
      const buffers = { ...state.buffers };
      delete buffers[path];
      return { route: { at: "files", path: "" }, buffers };
    });
    this.notice(`${path} is out of the mod. Undo brings it back.`, "plain");
  }

  /* --------------------------------------------------------------- *
   * Building and shipping                                           *
   * --------------------------------------------------------------- */

  /**
   * Recheck the open draft, on a delay, and discard a stale answer.
   *
   * The revision is captured before the work and compared after it. Without that
   * the pane can show the verdict for a document the player has already changed,
   * which is worse than showing nothing because it looks authoritative.
   */
  scheduleCheck(): void {
    if (this.checkTimer !== undefined) clearTimeout(this.checkTimer);
    this.checkTimer = setTimeout(() => {
      this.checkTimer = undefined;
      const state = this.deps.store.get();
      const draft = openDraft(state);
      if (!draft) return;
      const revision = state.revision;
      try {
        const build = buildDraft(this.deps.api, draft, this.deps.records);
        if (this.deps.store.get().revision !== revision) return;
        this.deps.store.view(() => ({ verdict: { revision, stale: false, build } }));
      } catch (e) {
        if (this.deps.store.get().revision !== revision) return;
        this.deps.store.view(() => ({ verdict: { revision, stale: false, broke: String(e) } }));
        this.deps.log(`build threw: ${String(e)}`);
      }
    }, CHECK_DELAY);
  }

  /**
   * Recheck NOW, on the way into a screen whose controls depend on the answer.
   *
   * WHY THIS EXISTS BESIDE `scheduleCheck`. The debounce is right for typing: a
   * full build per keystroke is work nobody asked for. It is wrong for arriving,
   * because a screen built during the debounce paints its primary action DISABLED
   * and enables it a quarter of a second later - so the button is grey exactly when
   * the player has just moved their hand to it, and the workshop's own test had to
   * settle twice to click it. Every route change rebuilds the screen from scratch,
   * so that happened on every visit rather than once.
   *
   * Cheap enough to be worth doing on the spot: the build is over one draft's own
   * records, the same work the debounce was going to do anyway, and it is already
   * being done inside a try because a throw here is a workshop bug rather than the
   * mod's.
   */
  checkNow(): void {
    if (this.checkTimer !== undefined) {
      clearTimeout(this.checkTimer);
      this.checkTimer = undefined;
    }
    const state = this.deps.store.get();
    const draft = openDraft(state);
    if (!draft) return;
    if (state.verdict.revision === state.revision && !state.verdict.stale) return;
    const revision = state.revision;
    try {
      const build = buildDraft(this.deps.api, draft, this.deps.records);
      this.deps.store.view(() => ({ verdict: { revision, stale: false, build } }));
    } catch (e) {
      this.deps.store.view(() => ({ verdict: { revision, stale: false, broke: String(e) } }));
      this.deps.log(`build threw: ${String(e)}`);
    }
  }

  /** The files this draft would write. Recomputed rather than cached. */
  files(): readonly EmittedFile[] {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return [];
    try {
      return emitDraft(this.deps.api, draft);
    } catch (e) {
      this.notice(`The files could not be written: ${String(e)}`, "bad");
      return [];
    }
  }

  /**
   * Hand the player the mod as a file.
   *
   * PRESENT WHETHER OR NOT THE INSTALL SEAM IS. A mod the player is holding is a
   * mod they can open, read, keep, hand to somebody and push to a repository, and
   * a mod that only ever existed inside the browser's storage is none of those.
   * It is also the workshop's honest answer to its own draft storage being able
   * to fail quietly: the file is the save point.
   */
  download(): void {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const files = this.files();
    if (files.length === 0) return;
    const bytes = zipDraft(files);
    const blob = new Blob([bytes as unknown as BlobPart], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = this.deps.doc.createElement("a");
    link.href = url;
    link.download = `${draft.id}-${draft.version}.zip`;
    this.deps.doc.body.appendChild(link);
    link.click();
    link.remove();
    /* Revoked on the next turn of the loop rather than immediately: some browsers
     * have not started reading the blob by the time click() returns. */
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    this.notice(`Saved ${draft.id}-${draft.version}.zip. Add it with Import a zip on the Mods screen.`, "good");
  }

  /** Install it here and now, when the engine offers a door for that. */
  async install(): Promise<void> {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    /* Write the drafts down BEFORE installing, because installing reloads. */
    this.deps.writer.flush();
    const files = this.files();
    if (files.length === 0) return;
    const outcome = await this.deps.seams.install.install(zipDraft(files));
    if (outcome.ok) {
      this.notice(
        `${outcome.id} ${outcome.version} is installed. It takes effect after a reload, because enabling a mod always does.`,
        "good",
      );
    } else {
      this.notice(outcome.problem, "bad");
      for (const line of outcome.lines) this.deps.log(line);
    }
  }

  /**
   * Load it for this session and go and play it. One action.
   *
   * THE SHORTEST HONEST LOOP the workshop has, and it used to be three steps
   * longer than it needed to be. Content composes at load, so a reload is genuinely
   * unavoidable - but the workshop was announcing that in a status line, leaving the
   * player to find the Close button and then press Ctrl-R themselves, while holding
   * a `reload` it never called. Reloading is not a capability anybody grants: a
   * plugin's code runs in the page and can reach `location` either way. So the
   * reload was never the game's to withhold, and asking the player to do by hand
   * something the workshop could do was friction with nothing behind it.
   *
   * WHAT IT IS NOT is a preview. The pack composes into the game exactly as an
   * installed one does, so this is the real mod, and the only thing that is
   * temporary is the archive. What it did to the character who plays it is not, and
   * the button that calls this says so before it is pressed.
   *
   * The drafts are written down FIRST, for the same reason `install` writes them
   * first: what follows is a reload, and an unflushed draft would not survive it.
   */
  async loadForSession(): Promise<void> {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    /* ASKED HERE AS WELL AS BY THE BUTTON, from the same function, so a disabled
     * control and the refusal behind it cannot drift apart. The door takes content
     * only and this mod may now carry code, so the answer is a real one rather than
     * a formality - and it is the workshop's own sentence rather than the host's,
     * because the host's is written for somebody importing a stranger's mod. */
    const refusal = sessionRefusal(draft);
    if (refusal !== undefined) {
      this.notice(refusal, "bad");
      return;
    }
    this.deps.writer.flush();
    const files = this.files();
    if (files.length === 0) return;
    this.notice(`Forging ${draft.id}...`, "plain");
    const outcome = await this.deps.seams.session.load(zipDraft(files));
    if (!outcome.ok) {
      this.notice(outcome.problem, "bad");
      return;
    }
    if (!outcome.survivesReload) {
      /* The mod is staged for THIS page and will be gone after the reload that
       * would apply it, so the loop cannot finish. Said as the fault of the
       * window's storage rather than of the mod, and pointed at the door that does
       * work - and NOT reloaded, because reloading here would throw the mod away
       * and land the player somewhere that looks like a failure with no message. */
      this.notice(
        `${outcome.id} cannot be tried this way here: this window will not keep it across the reload the game ` +
          `needs to pick it up. Save it as a file and install it instead.`,
        "bad",
      );
      return;
    }
    if (this.deps.seams.session.reloadByHand) {
      /* No way to reload from here, which is a front end without a `location` - a
       * test, or a host that embeds the game. Say the one remaining step. */
      this.notice(
        `${outcome.id} ${outcome.version} is loaded for this session. Reload the game to play it. It is not in ` +
          `your mods and it is gone when you close the game - but whatever it does to the character who plays ` +
          `it is not.`,
        "good",
      );
      return;
    }
    this.notice(`${outcome.id} ${outcome.version} is forged. Reloading to play it...`, "good");
    /* Awaited, not fired and forgotten: the preferred source is `ctx.reloadGame`
     * now, the engine's real save-and-reload sequence, and letting it run to
     * completion (or reject) here is what keeps this function's own promise
     * meaningful rather than dropping the reload's outcome on the floor. */
    await this.deps.seams.session.reload();
  }

  /** The manifest as it will ship, for the review screen. */
  manifestText(): string {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return "";
    return `${JSON.stringify(manifestFor(draft), null, 2)}\n`;
  }

  /* --------------------------------------------------------------- *
   * Plumbing                                                        *
   * --------------------------------------------------------------- */

  /** The record the editor is currently pointed at, resolved. */
  target(index: number): ReturnType<typeof targetFor> {
    const draft = openDraft(this.deps.store.get());
    const change = draft?.changes[index];
    if (!change) return undefined;
    if (change.kind !== "patch") return targetFor(this.deps.api, change, undefined);
    const base = this.findRecord(change.file, change.ref);
    return targetFor(this.deps.api, change, base);
  }

  /** One composed record, by ref. */
  findRecord(file: string, ref: string): JsonRecord | undefined {
    const key = ref.includes(":") ? (ref.split(":")[1] ?? ref) : ref;
    for (const record of this.deps.records[file] ?? []) {
      if (this.deps.api.recordKey(file, record) === key) return record;
    }
    return undefined;
  }

  dispose(): void {
    if (this.checkTimer !== undefined) clearTimeout(this.checkTimer);
    this.checkTimer = undefined;
  }

  private pushChange(change: Change): void {
    this.mutate((draft) => ({ ...draft, changes: [...draft.changes, change] }));
  }

  private mutate(change: (draft: Draft) => Draft): void {
    const id = this.deps.store.get().openId;
    if (id === undefined) return;
    this.deps.store.edit((drafts) => {
      const draft = drafts[id];
      if (!draft) return drafts;
      const next = change(draft);
      if (next === draft) return drafts;
      return { ...drafts, [id]: { ...next, touched: new Date().toISOString() } };
    });
    this.persist();
    this.scheduleCheck();
  }

  private persist(): void {
    const state: AppState = this.deps.store.get();
    this.deps.writer.queue(state.drafts, state.seenTour);
  }
}
