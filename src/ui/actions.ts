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
