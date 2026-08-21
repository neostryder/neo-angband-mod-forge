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
 * TWO WAYS OUT, AND BOTH STAY. Install it here, when the engine offers a door for
 * that; and save it as a file, always. The file is not a fallback. It is the only
 * version of the mod that exists outside this browser's storage, so it is the only
 * thing that can be read, kept, hand-edited and given away.
 */

import { h } from "../dom.js";
import type { AuthoringFinding } from "../../host/authoring.js";
import { countFindings, sortFindings } from "../../model/build.js";
import { draftFiles, draftSize } from "../../model/draft.js";
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

  const install = button({
    label: "Forge and install",
    kind: "primary",
    seal: true,
    onClick: () => void shop.acts.install(),
  });
  const save = button({
    label: "Save it as a file",
    onClick: () => shop.acts.download(),
    tip:
      "Writes the mod as a zip. Add it with Import a zip on the Mods screen. This is also the only copy that lives " +
      "outside this browser, so it is the one to keep.",
  });
  const back = button({ label: "Keep working on it", kind: "ghost", onClick: () => shop.acts.go({ at: "details" }) });

  const actions = h("div", { class: "mb-row-actions" }, install, save, back);
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
    install.disabled = !shop.seams.install.available || !ok || current.changes.length === 0;
    save.disabled = current.changes.length === 0;

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
          `across ${files.length} file${files.length === 1 ? "" : "s"}. Checked against the game exactly as it is ` +
          "loaded right now, mods included, because that is what your changes will actually land on.",
      }),
      ...(shop.seams.authoring.demonstration
        ? [h("p", null, h("b", { text: "These checks are the workshop's own small set, not the game's. " }), shop.seams.authoring.why ?? "")]
        : []),
    );

    const emitted = shop.acts.files();
    filesCard.setNote(`${emitted.length} file${emitted.length === 1 ? "" : "s"}`);
    filesHost.replaceChildren(
      ...(emitted.length === 0
        ? [empty("[ ]", "Nothing to write yet", "Add or change something first.")]
        : emitted.map((file) => filePreview(file.path, file.contents))),
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

    installNote.textContent = shop.seams.install.available
      ? ok
        ? "Installing takes effect after a reload, because enabling any mod does."
        : "Fix the errors on the right and this becomes available."
      : (shop.seams.install.why ?? "");
  };

  render(shop.store.get());
  shop.acts.scheduleCheck();

  return {
    el,
    update(next) {
      render(next);
    },
    dispose: () => undefined,
  };
}
