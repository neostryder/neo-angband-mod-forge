/**
 * The files, as text: the way out of the wizard for somebody who has outgrown it.
 *
 * WHAT THIS SCREEN IS FOR. Every other screen in the workshop asks a question and
 * writes the answer into a file. This one shows the files. It is not a second way
 * to do the same work and it is not a mode: it is the SAME mod, printed, and saving
 * a file here parses the text back into the same document every other screen edits.
 * A monster added on the record screen appears in `monster.json` here; a number
 * changed here is the number the record screen shows next time it is opened.
 *
 * WHICH IS WHY IT EARNS ITS PLACE rather than being a power-user indulgence. Three
 * things the wizard screens cannot do are ordinary here:
 *
 *  1. A SCRIPT. The workshop cannot write a `plugin.js` - that needs a compiler and
 *     there is not one in a browser - but an author can, and a hand-written ES
 *     module needs no build step at all. The manifest grows the plugin facet and the
 *     ABI number by itself, because a mod that ships code without declaring it
 *     installs, loads and does nothing.
 *  2. A MANIFEST KEY NO SCREEN OFFERS. Capabilities, rules a player can switch,
 *     optional dependencies. The game's validator passes an unknown key through, so
 *     these are real, and they survive every later save.
 *  3. SECTIONS, and anything else a record file can carry that the draft cannot
 *     model. Carried through to the emitted folder unread, with the fact that it is
 *     unread said on this screen, because a blind spot that is declared is a
 *     different thing from one that is not.
 *
 * WHAT IT IS NOT is a replacement for the screens that explain themselves. A first
 * mod made here is a first mod made without the evidence table, without the
 * suggestion that says where a number came from, and without the check that runs as
 * you type. The wizard is still the way in. This is the door at the far end of it.
 */

import { fill, h, setText } from "../dom.js";
import { codeEditor, problemRow } from "../editor.js";
import type { CodeEditor } from "../editor.js";
import {
  classify,
  isCodePath,
  MANIFEST,
  pathNote,
  pathProblem,
  PLUGIN,
  projectBytes,
  projectFiles,
  sessionRefusal,
  unread,
} from "../../model/files.js";
import { SIZE_CEILING } from "../../model/persist.js";
import { languageFor, problemsIn } from "../../model/syntax.js";
import type { SyntaxProblem } from "../../model/syntax.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { asideSection, button, empty, fillList, listRow } from "../widgets.js";
import type { View, Workshop } from "../view.js";

/** A starting point for a script, so a new one is not a blank page. */
const PLUGIN_TEMPLATE = `/*
 * The entry point. The game imports this and calls what it finds.
 *
 * No imports: a module loaded from a mod folder cannot resolve a package by name.
 * The engine arrives as ctx.core instead, which is the same module instance the
 * game itself is running on.
 */
export default {
  api: 1,

  hooks(ctx) {
    ctx.log?.("hello from a hand-written plugin");
    return {};
  },
};
`;

export function filesScreen(shop: Workshop, path: string): View {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);

  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(empty("?", "No mod is open", "Pick one on the My mods screen."));
    return { el, update: () => undefined, dispose: () => undefined };
  }

  /* ---------------------------------------------------------------- *
   * The list of files                                                *
   * ---------------------------------------------------------------- */

  const list = h("div", { class: "mb-list" });
  const listSection = asideSection("The mod folder");
  const size = h("div", { class: "mb-why" });
  const newName = h("input", { type: "text", class: "mb-mono", placeholder: "lib/dice.js", spellcheck: false });
  const newProblem = h("div", { class: "mb-why" });
  const add = button({
    label: "Add it",
    tiny: true,
    tip: "Makes an empty file of your own in the mod folder. A path with a slash in it puts the file in a folder.",
    onClick: () => {
      shop.acts.createFile(newName.value.trim(), newName.value.trim() === PLUGIN ? PLUGIN_TEMPLATE : "");
      newName.value = "";
    },
  });
  const plugin = button({
    label: `Start a ${PLUGIN}`,
    tiny: true,
    tip:
      "Writes a working entry point with nothing in it, so a mod that runs code is one file away. The manifest " +
      "grows the plugin facet and the ABI number to match, because a mod that ships code without declaring both " +
      "installs and then does nothing.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE),
  });
  listSection.body.append(
    list,
    h("div", { class: "mb-ed-new" }, newName, add),
    newProblem,
    h("div", { class: "mb-row-actions" }, plugin),
    size,
  );
  aside.appendChild(listSection.el);

  newName.addEventListener("input", () => {
    const wanted = newName.value.trim();
    const current = openDraft(shop.store.get());
    const why = wanted === "" || !current ? undefined : pathProblem(shop.api, current, wanted);
    const note = wanted === "" || why !== undefined ? undefined : pathNote(shop.api, wanted);
    setText(newProblem, why ?? note ?? "");
    newProblem.dataset["tone"] = why === undefined ? "plain" : "bad";
    add.disabled = wanted === "" || why !== undefined;
  });
  add.disabled = true;

  /* ---------------------------------------------------------------- *
   * The editor                                                       *
   * ---------------------------------------------------------------- */

  const title = h("div", { class: "mb-filename" });
  const about = h("div", { class: "mb-why" });
  const dirty = h("span", { class: "mb-tag" });
  const caret = h("span", { class: "mb-ed-caret" });

  const save = button({ label: "Save into the mod", kind: "primary", tiny: true, onClick: () => shop.acts.saveFile(path) });
  const overwrite = button({
    label: "Save anyway",
    kind: "danger",
    tiny: true,
    tip: "Writes what is in the editor over whatever the mod now says for this file. It replaces the whole file, not the lines you changed.",
    onClick: () => shop.acts.saveFile(path, { force: true }),
  });
  const revert = button({
    label: "Reload the file",
    tiny: true,
    tip: "Throws away what is in the editor and shows the file as the mod has it now.",
    onClick: () => shop.acts.revertFile(path),
  });
  const remove = button({
    label: "Delete",
    kind: "danger",
    tiny: true,
    tip: "Takes this file out of the mod. Undo brings it back.",
    onClick: () => shop.acts.deleteFile(path),
  });

  const bar = h("div", { class: "mb-row-actions" }, save, overwrite, revert, h("span", { class: "mb-spacer" }), caret, dirty, remove);

  const problems = h("div", { class: "mb-ed-problems" });
  const checkNote = h("div", { class: "mb-why" });

  let editor: CodeEditor | undefined;
  const host = h("div");

  if (path !== "") {
    const opened = shop.store.get().buffers[path];
    editor = codeEditor({
      doc: shop.doc,
      lang: languageFor(path),
      text: opened?.text ?? "",
      onInput: (text) => shop.acts.editFile(path, text),
      onSave: () => shop.acts.saveFile(path),
      onCaret: (line, column) => setText(caret, `line ${line}, column ${column}`),
    });
    host.appendChild(editor.el);
    main.append(title, about, bar, host, problems, checkNote);
  } else {
    main.append(
      h(
        "div",
        { class: "mb-prose" },
        h("h2", { text: "The mod, as files" }),
        h("p", {
          text:
            "This is the same mod the other screens edit, printed. Every file here is a file the folder ships, " +
            "and saving one puts what you wrote back into the mod - so a monster you added on the record screen " +
            "is in monster.json, and a number you change here is the number that screen shows next time.",
        }),
        h("p", {
          text:
            "It is the way to do the things no screen offers: a script the game runs, a manifest key nothing " +
            "asks you about, a record file grouped into sections. Pick a file on the right, or add one of your own.",
        }),
        h("p", {
          text:
            "Unsaved text lives in this window and nowhere else. It survives moving between screens and it does " +
            "not survive reloading the game, so save a file into the mod before you go anywhere.",
        }),
      ),
    );
  }

  /* ---------------------------------------------------------------- *
   * Painting                                                         *
   * ---------------------------------------------------------------- */

  const render = (state: AppState): void => {
    const current = openDraft(state);
    if (!current) return;

    const files = projectFiles(shop.api, current);
    const unchecked = unread(current);
    const uncheckedPaths = new Set(unchecked.map((entry) => entry.path));

    listSection.setCount(`${files.length}`);
    fillList(
      list,
      files.map((file) => {
        const held = state.buffers[file.path];
        const changed = held !== undefined && held.text !== file.contents;
        const tags: { text: string; tone?: string }[] = [];
        if (changed) tags.push({ text: "unsaved", tone: "mod" });
        if (uncheckedPaths.has(file.path)) tags.push({ text: "partly unread" });
        if (isCodePath(file.path)) tags.push({ text: "code" });
        return listRow({
          badge: file.kind === "extra" ? "+" : file.kind === "manifest" ? "M" : "R",
          name: file.path,
          meta: describe(file.kind, file.path),
          selected: file.path === path,
          tags,
          onClick: () => shop.acts.openFile(file.path),
        });
      }),
      empty("[ ]", "Nothing yet", "A mod with no changes writes only its manifest."),
    );

    const bytes = projectBytes(shop.api, current);
    setText(
      size,
      `${files.length} file${files.length === 1 ? "" : "s"}, ${Math.max(1, Math.round(bytes / 1024))}KB. Unfinished ` +
        `work is kept in a store this install shares with your saves, and the workshop will not use more than ` +
        `${Math.round(SIZE_CEILING / 1024)}KB of it, so a large file pasted in here is a file to save out as a zip.`,
    );

    const refusal = sessionRefusal(current);
    if (path === "") {
      setText(checkNote, refusal ?? "");
      return;
    }

    const file = files.find((entry) => entry.path === path);
    const held = state.buffers[path];
    if (file === undefined || held === undefined) {
      setText(title, path);
      setText(about, "That file is not in the mod any more.");
      save.disabled = true;
      overwrite.disabled = true;
      revert.disabled = true;
      remove.disabled = true;
      return;
    }

    setText(title, path);
    const stale = file.contents !== held.from;
    const changed = held.text !== file.contents;

    setText(dirty, changed ? "unsaved" : "saved");
    dirty.dataset["tone"] = changed ? "mod" : "";

    save.disabled = !changed;
    revert.disabled = !changed;
    remove.disabled = classify(shop.api, path) !== "extra";
    overwrite.style.display = stale ? "" : "none";

    const notes: string[] = [aboutKind(classify(shop.api, path), path)];
    if (stale) {
      notes.push(
        "This file has changed in the mod since it was opened here, so saving normally is refused. Save anyway " +
          "replaces the whole file with what is in the editor; reloading starts again from what the mod now says.",
      );
    }
    const note = pathNote(shop.api, path);
    if (note !== undefined) notes.push(note);
    const spare = unchecked.find((entry) => entry.path === path);
    if (spare !== undefined) {
      notes.push(
        `This file carries ${spare.keys.join(", ")}, which the workshop writes through without reading. It ships ` +
          `exactly as typed and nothing on the review screen has checked it.`,
      );
    }
    if (refusal !== undefined) notes.push(refusal);
    setText(about, notes.join(" "));

    /* The problems are about what is IN THE EDITOR, not about what was saved, which
     * is the only version of the question worth answering while somebody is typing. */
    const lang = languageFor(path);
    const found: readonly SyntaxProblem[] = editor?.colouring() === false ? [] : problemsIn(lang, held.text);
    fill(
      problems,
      ...found.map((problem) => problemRow(problem, () => editor?.goTo(problem.line, problem.column))),
    );
    setText(checkNote, checkedHow(lang, found.length, editor?.colouring() !== false));
  };

  render(shop.store.get());
  editor?.focus();

  return {
    el,
    update(next, prev) {
      /* THE EDITOR IS PUT BACK IN STEP ONLY WHEN SOMETHING ELSE MOVED IT. Typing
       * writes the buffer from the editor, so the two are equal on every keystroke
       * and this does nothing; a revert or a save writes the buffer from the draft,
       * so they differ and the editor is refilled. Refilling costs the caret, which
       * is right for both of those - the text has been replaced by the mod's own
       * spelling of it - and would be wrong for anything typed. */
      const held = next.buffers[path];
      if (editor !== undefined && held !== undefined && held.text !== editor.text()) editor.setText(held.text);
      if (next.drafts !== prev.drafts || next.buffers !== prev.buffers || next.openId !== prev.openId) render(next);
    },
    keys(event) {
      return editor?.keys(event) === true;
    },
    dispose() {
      editor?.dispose();
    },
  };
}

function describe(kind: string, path: string): string {
  if (kind === "manifest") return "what the game reads first";
  if (kind === "records") return `what this mod does to ${path.slice(0, -".json".length)} records`;
  return "yours, written through as typed";
}

function aboutKind(kind: string, path: string): string {
  switch (kind) {
    case "manifest":
      return (
        "The manifest. Saving it puts the fields the details screen shows back into the mod, and keeps every " +
        "other key exactly as typed - so capabilities, rules and anything else the game understands survive. " +
        "The id cannot be changed here, because the game treats a renamed mod as a different mod."
      );
    case "records":
      return (
        `Written from what the mod does to ${path.slice(0, -".json".length)} records. Saving it parses the ` +
        `contributions back into the mod, so the record screens show what you typed here.`
      );
    default:
      return "Yours. It goes into the mod folder exactly as it is here, and nothing rewrites it.";
  }
}

/**
 * What the check under the editor actually checked.
 *
 * SAID EVERY TIME, INCLUDING WHEN IT FOUND NOTHING, because the failure mode of a
 * check that is quieter than it is thorough is silence being read as approval. JSON
 * is parsed by the same parser the game uses, so nothing is a real nothing.
 * JavaScript is not parsed at all, so nothing means the quotes and the brackets
 * line up and says as much.
 */
function checkedHow(lang: string, found: number, colouring: boolean): string {
  if (!colouring) {
    return "This file is too big to colour in or check, so it is shown as plain text. It still saves and ships exactly as it is.";
  }
  if (lang === "json") {
    return found === 0
      ? "Valid JSON, checked with the same parser the game uses."
      : "The game reads this file with the same parser, so it will not load until this is fixed.";
  }
  if (lang === "js") {
    return (
      "Quotes, comments and brackets only. This is not a syntax check and there is no compiler in a browser: " +
      "code that passes here can still be wrong, and the game reports a script it cannot import as a mod that " +
      "is not working. What it cannot see at all is a mistake inside a template's ${ }, a slash that is a " +
      "pattern where it looks like a division, and anything that is spelled correctly and means nothing."
    );
  }
  return "Nothing here to check.";
}
