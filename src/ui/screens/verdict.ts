/**
 * The verdict: every finding, the exact files, and the one irreversible button.
 *
 * THE FILES ARE SHOWN, IN FULL, ALWAYS. Not because anybody has to read them, but
 * because a tool that will not show you what it wrote is a tool you have to
 * trust. Seeing `monster.json` here is also the moment somebody realises they
 * could have typed it themselves, which is the opposite of a problem: the written
 * tutorials are the other half of this and a reader who crosses over to them has
 * not been lost.
 *
 * IT CHECKS THE COMPOSED RESULT, NOT THE DRAFT. The game never sees a mod's
 * records; it sees the base game's records with the mod's changes applied. So
 * checking the draft on its own would miss exactly the class of mistake that
 * matters, and the line saying "checked against the game as it is loaded right
 * now" is a real claim rather than reassurance.
 *
 * THREE WAYS OUT, AND ALL THREE STAY. Try it for this session, when the engine
 * offers that door; install it, when it offers that one; and save it as a file,
 * always. The file is not a fallback. It is the only version of the mod that exists
 * outside this browser's storage, so it is the only thing that can be read, kept,
 * hand-edited and given away.
 *
 * TRYING IT IS OFFERED FIRST AND IS NOT THE SAFE OPTION. It is the shortest loop -
 * build, try, reload, play - and it is the one somebody iterating actually wants,
 * which is why it leads. What it is not is a preview: the pack composes into the
 * game exactly as an installed one does, so the character who plays it keeps
 * whatever it does to them. The note under the buttons says that in those terms,
 * because "just for this session" reads as a safety feature and is not one.
 */

import { h } from "../dom.js";
import type { AuthoringFinding } from "../../host/authoring.js";
import { countFindings, sortFindings } from "../../model/build.js";
import { draftFiles, draftSize } from "../../model/draft.js";
import { sessionRefusal, unread } from "../../model/files.js";
import type { AppState } from "../store.js";
import { openDraft } from "../store.js";
import { asideSection, button, card, empty, filePreview } from "../widgets.js";
import type { View, Workshop } from "../view.js";

export function verdictScreen(shop: Workshop): View {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", null);
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);

  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(empty("?", "No mod is open", "Pick one on the My mods screen."));
    return { el, update: () => undefined, dispose: () => undefined };
  }

  const headline = h("div", { class: "mb-prose" });
  const filesHost = h("div", { style: { display: "flex", "flex-direction": "column", gap: "10px" } });
  const filesCard = card({ title: "What it writes", note: "", open: true });
  filesCard.body.appendChild(filesHost);

  const tryIt = button({
    label: "Forge it and play it now",
    kind: "primary",
    seal: true,
    onClick: () => void shop.acts.loadForSession(),
    tip:
      "Forges it, loads it for this session only, and reloads the game so it takes effect - content always needs " +
      "a reload. It is not added to your mods and it is gone when you close the game. What it does to the " +
      "character who plays it is not.",
  });
  const install = button({
    label: "Forge and install",
    seal: true,
    onClick: () => void shop.acts.install(),
    tip: "Adds it to your mods for good. Takes effect after a reload, because enabling any mod does.",
  });
  const save = button({
    label: "Save it as a file",
    onClick: () => shop.acts.download(),
    tip:
      "Writes the mod as a zip. Add it with Import a zip on the Mods screen. This is also the only copy that lives " +
      "outside this browser, so it is the one to keep.",
  });
  const back = button({ label: "Keep working on it", kind: "ghost", onClick: () => shop.acts.go({ at: "details" }) });

  const actions = h("div", { class: "mb-row-actions" }, tryIt, install, save, back);
  const installNote = h("div", { class: "mb-why" });

  main.append(headline, filesCard.el, actions, installNote);

  const findingsSection = asideSection("Every check");
  const findingsNote = h("div", { class: "mb-stale" });
  const findingsList = h("ul", { class: "mb-findings" });
  findingsSection.body.append(findingsNote, findingsList);

  const problemsSection = asideSection("Refused outright");
  const problemsList = h("div");
  problemsSection.body.appendChild(problemsList);

  aside.append(findingsSection.el, problemsSection.el);

  const render = (state: AppState): void => {
    const current = openDraft(state);
    if (!current) return;
    const size = draftSize(current);
    const files = draftFiles(current);
    const verdict = state.verdict;
    const build = verdict.build;
    const findings: readonly AuthoringFinding[] = build ? sortFindings(build.findings) : [];
    const counts = countFindings(findings);

    const ok = build?.ok === true;
    /* A mod with no changes but a file of its own is still a mod worth forging: an
     * author whose whole mod is a hand-written plugin.js has zero changes and a real
     * pack. Counting emitted files rather than changes is what lets them ship it. */
    const anything = current.changes.length > 0 || (current.sections?.length ?? 0) > 0 || Object.keys(current.extras ?? {}).length > 0;
    const buildable = ok && anything;
    const refusal = sessionRefusal(current);
    tryIt.disabled = !shop.seams.session.available || !buildable || refusal !== undefined;
    install.disabled = !shop.seams.install.available || !buildable;
    save.disabled = !anything;

    headline.replaceChildren(
      h("h2", { text: `${current.name} ${current.version}` }),
      h(
        "p",
        null,
        build === undefined
          ? "Checking."
          : ok
            ? "This will install. "
            : h("b", { text: "This will not install as it stands. " }),
        build === undefined
          ? ""
          : `${counts.errors} error${counts.errors === 1 ? "" : "s"}, ${counts.warnings} warning${counts.warnings === 1 ? "" : "s"}, ${counts.hints} note${counts.hints === 1 ? "" : "s"}.`,
      ),
      h("p", {
        text:
          `${size.added} new record${size.added === 1 ? "" : "s"}, ${size.patched} adjusted, ${size.removed} removed, ` +
          `${current.sections?.length ?? 0} switchable section${(current.sections?.length ?? 0) === 1 ? "" : "s"}, across ${files.length} file${files.length === 1 ? "" : "s"}. Checked against the game exactly as it is ` +
          "loaded right now, mods included, because that is what your changes will actually land on.",
      }),
      ...(shop.seams.authoring.demonstration
        ? [h("p", null, h("b", { text: "These checks are the workshop's own small set, not the game's. " }), shop.seams.authoring.why ?? "")]
        : []),
    );

    const emitted = shop.acts.files();
    filesCard.setNote(`${emitted.length} file${emitted.length === 1 ? "" : "s"}`);

    /* WHAT THE VERDICT ABOVE DOES NOT COVER, said next to the files rather than
     * left to be inferred. The composer and the validator run over what the draft
     * models, so a key an author typed into a record file that the draft cannot
     * model ships exactly as written and has been checked by nothing. That is a
     * legitimate thing to allow and not a legitimate thing to leave unsaid. */
    const unchecked = unread(current);
    filesHost.replaceChildren(
      ...(emitted.length === 0
        ? [empty("[ ]", "Nothing to write yet", "Add or change something first.")]
        : emitted.map((file) => filePreview(file.path, file.contents))),
      ...(unchecked.length === 0
        ? []
        : [
            h(
              "div",
              { class: "mb-why" },
              h("b", { text: "Written through unread. " }),
              `${unchecked
                .map((entry) => `${entry.path} carries ${entry.keys.join(", ")}`)
                .join("; ")}. The workshop cannot compose or check those, so nothing above is a verdict on them.`,
            ),
          ]),
    );

    findingsSection.setCount(`${findings.length}`);
    findingsNote.textContent =
      verdict.broke !== undefined
        ? `The workshop could not check this: ${verdict.broke}`
        : verdict.stale || verdict.revision !== state.revision
          ? "Checking."
          : findings.length === 0
            ? "Nothing to report."
            : "";
    findingsList.replaceChildren(
      ...findings.map((finding) =>
        h(
          "li",
          null,
          h(
            "div",
            { class: "mb-finding", data: { level: finding.level } },
            h("span", {
              class: "mb-mark",
              data: { level: finding.level },
              text: finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i",
            }),
            h(
              "span",
              null,
              h("span", { text: finding.message }),
              h("div", { class: "mb-finding-rule", text: `${finding.rule} - ${finding.file}` }),
            ),
          ),
        ),
      ),
    );

    const problems = build?.problems ?? [];
    problemsSection.setCount(`${problems.length}`);
    problemsList.replaceChildren(
      problems.length === 0
        ? h("div", {
            class: "mb-why",
            text: "Nothing was refused. Worth knowing that a refused change costs you that change and not the mod, so a mod whose every change was refused installs and does nothing.",
          })
        : h(
            "ul",
            null,
            ...problems.map((problem) => h("li", { text: problem })),
          ),
    );

    /* ONE NOTE FOR THREE BUTTONS.
     *
     * A MISSING DOOR IS SAID EVERY TIME, ahead of the errors, and that ordering is
     * the same call `seams.ts` makes: a control that is off because this game has
     * no door for it is a permanent fact with a different next action from a
     * control that is off because the mod is not finished yet. The errors are also
     * already listed on the right, one per line, so repeating them here first
     * would push the only sentence that is not already on screen off the bottom.
     */
    const notes: HTMLElement[] = [
      refusal !== undefined
        ? h("p", null, h("b", { text: "This one cannot be tried for a session. " }), refusal)
        : shop.seams.session.available
        ? h("p", {
            text:
              "Playing it loads the mod for this session only and reloads the game, because composing content " +
              "always needs a reload. It is not added to your mods and it is gone when you close the game. It is " +
              "the real mod and not a preview, so play a character you do not mind changing - next time, with " +
              "the mod gone, the game treats anything it added as belonging to something not installed.",
          })
        : h("p", { text: shop.seams.session.why ?? "" }),
      shop.seams.install.available
        ? h("p", { text: "Installing keeps it, and takes effect after a reload, because enabling any mod does." })
        : h("p", { text: shop.seams.install.why ?? "" }),
    ];
    if (!ok) {
      notes.push(h("p", { text: "Fix the errors on the right and these become available." }));
    }
    installNote.replaceChildren(...notes);
  };

  /* CHECKED BEFORE THE FIRST PAINT, not a quarter of a second after it. This screen
   * is rebuilt from scratch on every visit and its buttons are disabled until a
   * verdict exists, so a debounced check meant the primary action was grey exactly
   * when the player's hand arrived on it - every single visit. `checkNow` returns
   * immediately when the verdict is already current, so this costs nothing on the
   * common path. */
  shop.acts.checkNow();
  render(shop.store.get());

  return {
    el,
    update(next) {
      render(next);
    },
    dispose: () => undefined,
  };
}
