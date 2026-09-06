/**
 * My mods: the workshop's front door.
 *
 * One row per unfinished mod, with what is in it and when it was last touched.
 * The row's note says how many records it adds and how many it adjusts, because
 * those are the two numbers that tell you which of your three half-finished mods
 * this one is.
 *
 * IT SAYS WHERE THE DRAFTS LIVE, AND WHAT THAT IS WORTH. Unfinished work is kept
 * in this install's own settings, which is not a file and can quietly run out of
 * room. The status line says so when a write fails, and this screen says so
 * before one does, because "save the file" is advice worth having in advance.
 */

import { fill, h, setText } from "../dom.js";
import type { View, Workshop } from "../view.js";
import { button, card, empty, fillList, listRow } from "../widgets.js";
import { draftSize } from "../../model/draft.js";
import type { ForkOutcome, RawFile } from "../../model/fork.js";
import type { AppState } from "../store.js";

export function modsScreen(shop: Workshop): View {
  const list = h("div", { class: "mb-list" });

  const idBox = h("input", { type: "text", class: "mb-mono", placeholder: "an id, like my-first-mod", spellcheck: false });
  const idProblem = h("div", { class: "mb-why" });
  const create = button({
    label: "Start a new mod",
    kind: "primary",
    onClick: () => {
      const id = idBox.value.trim();
      const problem = shop.acts.idProblem(id);
      if (problem !== undefined) {
        idProblem.textContent = problem;
        idBox.setAttribute("aria-invalid", "true");
        return;
      }
      idBox.value = "";
      idProblem.textContent = "";
      idBox.removeAttribute("aria-invalid");
      shop.acts.createMod(id);
    },
  });
  idBox.addEventListener("input", () => {
    idProblem.textContent = "";
    idBox.removeAttribute("aria-invalid");
  });
  idBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) create.click();
  });

  const startCard = card({ title: "Start something", open: true });
  startCard.body.appendChild(
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "id" }),
        h("span", { class: "mb-label-meta", text: "lower case, hyphens" }),
      ),
      h(
        "div",
        { class: "mb-control" },
        h("div", { class: "mb-control-line" }, idBox, create),
        h("div", {
          class: "mb-why",
          text:
            "This is the mod's name to the game and to every other mod. It cannot be changed later without " +
            "the game treating the result as a different mod, so it is worth a moment.",
        }),
        idProblem,
      ),
    ),
  );

  const fork = forkCard(shop);

  const unfinishedCard = card({
    title: "Unfinished",
    note: "kept in this install's settings, not in any character's save",
    tip:
      "Unfinished work does not live in a file. The store it uses can run out of room without saying so, " +
      "which is why the workshop verifies every write and why a finished mod, saved as a file, is the only " +
      "save point it will promise you.",
    open: true,
  });
  unfinishedCard.body.appendChild(list);

  const el = h("div", { class: "mb-main" }, startCard.el, fork.el, unfinishedCard.el);

  let lastDrafts: unknown;

  const render = (state: AppState): void => {
    const drafts = Object.values(state.drafts).sort((a, b) => b.touched.localeCompare(a.touched));
    const rows = drafts.map((draft) => {
      const size = draftSize(draft);
      const parts: string[] = [];
      if (size.added > 0) parts.push(`${size.added} new`);
      if (size.patched > 0) parts.push(`${size.patched} adjusted`);
      if (size.removed > 0) parts.push(`${size.removed} removed`);
      const row = listRow({
        badge: draft.id.charAt(0).toUpperCase(),
        name: `${draft.name} ${draft.version}`,
        meta: parts.length === 0 ? "nothing in it yet" : parts.join(", "),
        tags: [{ text: draft.id, tone: "mine" }],
        selected: state.openId === draft.id,
        onClick: () => shop.acts.openMod(draft.id),
      });
      const acts = row.querySelector(".mb-row-acts");
      acts?.appendChild(
        button({
          label: "Delete",
          tiny: true,
          kind: "danger",
          tip: "Throw this unfinished mod away. Anything already installed is untouched.",
          onClick: () => {
            /* No confirmation dialog, and one is not wanted: undo is one key away
             * and a modal that interrupts to ask about a draft is the sort of
             * thing that makes a tool tiring. */
            shop.acts.deleteMod(draft.id);
            shop.acts.notice(`${draft.id} is gone. Undo brings it back.`, "plain");
          },
        }),
      );
      return row;
    });
    fillList(
      list,
      rows,
      empty(
        "[ ]",
        "Nothing here yet",
        "A mod starts with an id, and the workshop takes it from there.",
        button({
          label: "Name one now",
          kind: "primary",
          tip: "Puts the cursor in the id field above. An id is all a mod needs to exist.",
          onClick: () => idBox.focus(),
        }),
      ),
    );
  };

  render(shop.store.get());
  lastDrafts = shop.store.get().drafts;

  return {
    el,
    update(next) {
      if (next.drafts !== lastDrafts || next.openId !== undefined) {
        lastDrafts = next.drafts;
        render(next);
      }
    },
    dispose: () => undefined,
  };
}

/**
 * Forking: start from a mod that already exists rather than from nothing.
 *
 * ONE ID FIELD FOR EVERY ROUTE, because the id is the question every fork has to
 * answer and it is the same question whichever door the content came through. A
 * per-route field would be three places to be wrong about what makes a fork a
 * separate mod.
 *
 * THE NOTES ARE THE POINT OF THIS CARD, not a footnote to it. A fork is a copy
 * with differences, and the differences are things a player will otherwise ship
 * without noticing: a blanked author, a licence that came with somebody else's
 * content, a record two mods both adjust that could not be taken at all. So the
 * fork stays on this screen when it lands and writes them out here, and opening
 * the new mod is a second, deliberate press.
 */
function forkCard(shop: Workshop): { readonly el: HTMLElement } {
  const idBox = h("input", { type: "text", class: "mb-mono", placeholder: "an id, like my-own-qol", spellcheck: false });
  const problem = h("div", { class: "mb-why" });
  const notes = h("div", { class: "mb-fork-notes" });
  const list = h("div", { class: "mb-list" });

  const clearProblem = (): void => {
    setText(problem, "");
    idBox.removeAttribute("aria-invalid");
  };
  idBox.addEventListener("input", clearProblem);

  const refuse = (why: string): void => {
    setText(problem, why);
    idBox.setAttribute("aria-invalid", "true");
  };

  /** Run one fork, and put whatever it says where it can be read. */
  const take = (run: (id: string) => ForkOutcome | Promise<ForkOutcome>): void => {
    const id = idBox.value.trim();
    const why = shop.acts.idProblem(id);
    if (why !== undefined) {
      refuse(why);
      fill(notes);
      return;
    }
    clearProblem();
    void Promise.resolve(run(id)).then((outcome) => {
      if (!outcome.ok) {
        refuse(outcome.why);
        fill(notes);
        return;
      }
      idBox.value = "";
      fill(
        notes,
        h("div", { class: "mb-why", text: `${id} is in the workshop. What the fork did and did not carry:` }),
        ...outcome.notes.map((note) => h("div", { class: "mb-why", text: note })),
        h(
          "div",
          { class: "mb-row-actions" },
          button({ label: `Open ${id}`, kind: "primary", onClick: () => shop.acts.openMod(id) }),
        ),
      );
    });
  };

  /** Everything the picker handed over, read into memory before anything parses it. */
  const readPicked = async (picked: readonly File[]): Promise<readonly RawFile[]> =>
    Promise.all(
      picked.map(async (file) => ({
        /* `webkitRelativePath` is how a directory pick reports where a file sat
         * inside the folder that was chosen, and it is empty for a single file. */
        path: file.webkitRelativePath === "" ? file.name : file.webkitRelativePath,
        contents: new Uint8Array(await file.arrayBuffer()) as string | Uint8Array,
      })),
    );

  const folderInput = h("input", { type: "file" });
  folderInput.setAttribute("webkitdirectory", "");
  folderInput.setAttribute("multiple", "");
  folderInput.addEventListener("change", () => {
    /* Copied out of the live `FileList` BEFORE the input is cleared, because
     * clearing an input replaces that list rather than leaving it alone. */
    const picked = [...(folderInput.files ?? [])];
    if (picked.length === 0) return;
    folderInput.value = "";
    take(async (id) => shop.acts.forkFolder(await readPicked(picked), id));
  });

  const zipInput = h("input", { type: "file" });
  zipInput.addEventListener("change", () => {
    const picked = zipInput.files?.[0];
    if (!picked) return;
    zipInput.value = "";
    take(async (id) => shop.acts.forkZip(new Uint8Array(await picked.arrayBuffer()), id));
  });

  const forkCardEl = card({
    title: "Fork one that exists",
    note: "a copy of somebody's mod, as a mod of your own",
    tip:
      "A fork owns its content outright: the records become yours, with your id on them, and the mod you took " +
      "them from does not have to be installed for yours to work. That is a different thing from adjusting " +
      "somebody's record, which ships the difference and leaves the record theirs.",
    open: true,
  });

  forkCardEl.body.append(
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "id" }),
        h("span", { class: "mb-label-meta", text: "the fork's own" }),
      ),
      h(
        "div",
        { class: "mb-control" },
        idBox,
        h("div", {
          class: "mb-why",
          text:
            "A fork needs an id of its own before it can be taken. The game treats an id as an identity, so a " +
            "fork that kept the original's would install over it rather than beside it.",
        }),
        problem,
      ),
    ),
    h("div", { class: "mb-why", text: "A mod in this game:" }),
    list,
    h("label", { class: "mb-why" }, "A mod folder on disk: ", folderInput),
    h("label", { class: "mb-why" }, "Or a mod saved as a zip: ", zipInput),
    h("div", {
      class: "mb-why",
      text:
        "A mod at a repository address cannot be forked from here. Resolving one is the game's own job - it " +
        "picks the tag, reads the manifest and decides which files are the mod - and nothing hands that to a " +
        "mod, so a second copy of it here would accept mods the install door refuses. Install the mod first " +
        "and fork it from the list above, or download its folder and pick it.",
    }),
    notes,
  );

  /**
   * The mods in the game, listed once.
   *
   * NOT REDRAWN ON STATE CHANGES, because the set of mods the running game
   * composed is fixed for as long as the workshop is open: composing happens at
   * load, and nothing the player does in here changes it until they reload.
   */
  const listMods = (): void => {
    const mods = shop.acts.installedMods();
    fillList(
      list,
      mods.map((mod) => {
        const parts: string[] = [];
        if (mod.adds > 0) parts.push(`${mod.adds} of its own`);
        if (mod.adjusts > 0) parts.push(`${mod.adjusts} adjusted`);
        if (mod.shared > 0) parts.push(`${mod.shared} shared with another mod`);
        const row = listRow({
          badge: mod.id.charAt(0).toUpperCase(),
          name: mod.id,
          meta: parts.length === 0 ? "nothing a fork could take" : parts.join(", "),
          onClick: () => take((id) => shop.acts.forkInstalled(mod.id, id)),
        });
        const act = button({
          label: "Fork it",
          tiny: true,
          tip: `Take ${mod.id}'s content as a mod of your own. Its manifest is not readable from here, so the name and the licence do not come with it.`,
          onClick: () => take((id) => shop.acts.forkInstalled(mod.id, id)),
        });
        /* A ROW'S ACTION BUTTON SITS INSIDE THE ROW'S OWN BUTTON, which is the
         * shape `listRow` has always had, and a click on the inner one bubbles to
         * the outer one unless something stops it. Here that would run the fork
         * twice: once from the button, once from the row, and the second attempt
         * would fail on an id the first one had just taken and overwrite what the
         * first one reported with a refusal. Stopping propagation on this element
         * leaves this element's own handler alone and keeps the row's off. */
        act.addEventListener("click", (event) => event.stopPropagation());
        row.querySelector(".mb-row-acts")?.appendChild(act);
        return row;
      }),
      h("div", {
        class: "mb-why",
        text:
          "No mod in this game has content of its own to fork. Only what a mod adds or adjusts is visible here, " +
          "and the base game is not a mod.",
      }),
    );
  };

  listMods();
  return { el: forkCardEl.el };
}
