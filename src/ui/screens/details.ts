/**
 * The mod's own details, and the list of what is in it.
 *
 * EVERY FIELD HERE IS ON THIS SCREEN BECAUSE SOMETHING REFUSES THE MOD WITHOUT
 * IT, or because getting it wrong has a consequence the player would otherwise
 * meet at install time. Three are refused outright when they are missing: a
 * repository, an author, and an engine range. Two are refused when they are
 * malformed: the id and the version. So the checks run as the reader types rather
 * than at the end, and the notes say what each field is actually for instead of
 * restating its name.
 *
 * THE REPOSITORY FIELD CARRIES THE ONE WARNING THAT MATTERS MOST. An install pins
 * a mod's origin the first time it is imported and refuses every later import
 * whose repository disagrees. So the default is a `local://` address that is
 * obviously the author's own, and changing it after the mod has been installed
 * once means the next install of it is refused. The field says so.
 */

import { h } from "../dom.js";
import type { View, Workshop } from "../view.js";
import { button, card, empty, fillList, listRow, textField } from "../widgets.js";
import { allChanges, dependenciesFor, groupFor, ID_RE, VERSION_RE } from "../../model/draft.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { draftLabel } from "../../model/refs.js";

export function detailsScreen(shop: Workshop): View {
  const el = h("div", { class: "mb-main" });
  const draft = openDraft(shop.store.get());
  if (!draft) {
    el.appendChild(
      empty(
        "?",
        "No mod is open",
        "Every screen after this one is about one mod, so the list is where to start.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) }),
      ),
    );
    return { el, update: () => undefined, dispose: () => undefined };
  }

  const name = textField({
    label: "name",
    value: draft.name,
    note: "shown in the mod manager",
    tip: "What a player sees in the list of mods. Free text: capitals, spaces and punctuation are all fine.",
    onInput: (value) => shop.acts.setDetails({ name: value }),
  });
  const version = textField({
    label: "version",
    value: draft.version,
    mono: true,
    note: "three numbers",
    tip: "Three numbers with dots between them, like 0.1.0. Anything else is refused before the mod is even read.",
    onInput: (value) => shop.acts.setDetails({ version: value }),
  });
  const author = textField({
    label: "author",
    value: draft.author,
    note: "required",
    tip: "A mod with nobody's name on it is refused at install. Any name will do; it does not have to be your legal one.",
    onInput: (value) => shop.acts.setDetails({ author: value }),
  });
  const repository = textField({
    label: "repository",
    value: draft.repository,
    mono: true,
    note: "required, and pinned forever",
    tip:
      "The first time this mod is installed, the game records where it came from and refuses any later install " +
      "that claims somewhere else. Leave it as the local address unless you actually own the repository you name.",
    onInput: (value) => shop.acts.setDetails({ repository: value }),
  });
  const license = textField({
    label: "license",
    value: draft.license,
    mono: true,
    note: "recommended",
    tip: "What somebody else may do with this. GPL-2.0-only matches the game and the other mods in its family.",
    onInput: (value) => shop.acts.setDetails({ license: value }),
  });
  const engine = textField({
    label: "engine",
    value: draft.engine,
    mono: true,
    note: "required",
    tip:
      "Which builds of the game this was written against. A minimum rather than an exact version: a mod pinned to " +
      "one release opts itself into a warning on every update. The workshop will not write a range that excludes " +
      "the build you are running.",
    onInput: (value) => shop.acts.setDetails({ engine: value }),
  });
  const description = textField({
    label: "description",
    value: draft.description,
    multiline: true,
    note: "recommended",
    tip: "The paragraph the mod manager shows. Say what it changes and what it leaves alone.",
    onInput: (value) => shop.acts.setDetails({ description: value }),
  });

  const detailsCard = card({
    title: "This mod",
    note: "the manifest, as it will ship",
    open: true,
  });
  detailsCard.body.append(
    name.el,
    version.el,
    author.el,
    repository.el,
    license.el,
    engine.el,
    description.el,
  );

  const derived = h("div", { class: "mb-card-body mb-prose" });
  const derivedCard = card({ title: "Written for you", note: "from what you actually did", open: true });
  derivedCard.body.appendChild(derived);

  const changesList = h("div", { class: "mb-list" });
  const changesCard = card({ title: "What is in it", open: true });
  changesCard.body.appendChild(changesList);

  const actions = h(
    "div",
    { class: "mb-row-actions" },
    button({ label: "Add or change something", kind: "primary", onClick: () => shop.acts.go({ at: "kinds" }) }),
    button({ label: "Review it", onClick: () => shop.acts.go({ at: "verdict" }) }),
    /* THE WAY OUT OF THE WIZARD, offered next to the way through it rather than
     * hidden behind a setting. Somebody who wants a script, a manifest key no field
     * here asks about, or a record file grouped into sections has outgrown these
     * screens and should not have to guess that there is anywhere else to go. It is
     * last in the row because it is the advanced door and not the front one. */
    button({
      label: "Edit the files directly",
      tip:
        "The same mod, as the text files it ships. Everything here is in them, and saving one puts what you " +
        "wrote back into the mod. It is also the only way to add a script, a manifest key no screen offers, or " +
        "a record file grouped into sections.",
      onClick: () => shop.acts.go({ at: "files", path: "" }),
    }),
    shop.seams.wizard.api !== undefined
      ? button({
          label: "Test it in the game",
          tip: "Go where this mod's content belongs, put some in front of you, and look at it.",
          onClick: () => shop.acts.go({ at: "test" }),
        })
      : null,
  );

  el.append(detailsCard.el, derivedCard.el, changesCard.el, actions);

  const render = (state: AppState): void => {
    const current = openDraft(state);
    if (!current) return;

    name.setValue(current.name);
    version.setValue(current.version);
    author.setValue(current.author);
    repository.setValue(current.repository);
    license.setValue(current.license);
    engine.setValue(current.engine);
    description.setValue(current.description);

    name.setProblem(current.name.trim() === "" ? "A mod with no name is refused before it is read." : undefined);
    version.setProblem(VERSION_RE.test(current.version) ? undefined : "Three numbers with dots, like 0.1.0.");
    author.setProblem(current.author.trim() === "" ? "Required: a mod with no author is refused at install." : undefined);
    repository.setProblem(
      /^(?:[a-z][a-z0-9+.-]*:\/\/|git@)/.test(current.repository)
        ? undefined
        : "Required, and it has to look like an address: local://something, or a real https:// URL you own.",
    );
    engine.setProblem(
      shop.api.satisfies(shop.seams.engine, current.engine)
        ? undefined
        : `This range excludes the build you are running (${shop.seams.engine}), so you could not install what you are making.`,
    );
    /* The id is not editable here on purpose: the game treats a renamed mod as a
     * different mod, so offering the field would be offering a mistake. */
    const idProblem = ID_RE.test(current.id) ? "" : ` The id "${current.id}" is not one the game will accept.`;

    const deps = Object.keys(dependenciesFor(allChanges(current)));
    derived.replaceChildren(
      h("p", null, "id ", h("code", { text: current.id }), ", which is also the folder name.", idProblem),
      h(
        "p",
        null,
        "group ",
        h("code", { text: groupFor(allChanges(current)) }),
        groupFor(allChanges(current)) === "content"
          ? ", because this mod adds records. Adding mods load before the ones that only adjust things."
          : ", because this mod only adjusts records that already exist, so it wants to load after the mods that add them.",
      ),
      deps.length === 0
        ? h("p", { text: "No dependencies, because nothing here touches anybody else's records yet." })
        : h(
            "p",
            null,
            "depends on ",
            ...deps.flatMap((id, at) => [at === 0 ? "" : ", ", h("code", { text: id })]),
            ". A mod may only adjust a record whose owner it names, and a change that is refused for want of that " +
              "costs you the change and not the mod, silently. So the workshop writes these down the moment you " +
              "pick something to change.",
          ),
    );

    const rows = current.changes.map((change, index) => {
      const kindLabel =
        change.kind === "add"
          ? "new"
          : change.kind === "patch"
            ? `${change.ops.length} adjustment${change.ops.length === 1 ? "" : "s"}`
            : change.kind === "replace"
              ? "replaced whole"
              : "removed";
      const label = change.kind === "add" ? draftLabel(shop.api, change.file, change.record) : change.ref;
      const row = listRow({
        badge: change.file.charAt(0).toUpperCase(),
        name: label,
        meta: `${change.file} - ${kindLabel}`,
        tags: change.kind === "remove" ? [{ text: "removes", tone: "mod" }] : [],
        onClick: () => {
          if (change.kind === "remove") shop.acts.notice("A removal has nothing to edit. Drop it to undo it.", "plain");
          else shop.acts.go({ at: "record", change: index, path: "" });
        },
      });
      row.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Drop",
          tiny: true,
          kind: "danger",
          tip: "Take this change out of the mod. Undo brings it back.",
          onClick: () => shop.acts.dropChange(index),
        }),
      );
      return row;
    });
    fillList(
      changesList,
      rows,
      empty(
        "...",
        "Nothing in it yet",
        "The manifest above is real, and a mod that changes nothing changes nothing.",
        button({
          label: "Add or change something",
          kind: "primary",
          onClick: () => shop.acts.go({ at: "kinds" }),
        }),
      ),
    );
  };

  render(shop.store.get());

  return {
    el,
    update(next, prev) {
      if (next.drafts !== prev.drafts || next.openId !== prev.openId) render(next);
    },
    dispose: () => undefined,
  };
}
