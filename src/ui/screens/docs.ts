/**
 * The SDK documentation, read in the workshop.
 *
 * This is a reader rather than a second markdown renderer. The code editor
 * already paints markdown, lines, and find results while leaving the browser in
 * charge of scrolling and selection. Its read-only mode gives the same useful
 * machinery to prose without creating a parser whose rendering could drift from
 * the editor an author uses for their own files.
 */

import { h } from "../dom.js";
import { codeEditor } from "../editor.js";
import { sdkDocs } from "../sdk-docs-content.js";
import type { SdkDocId } from "../sdk-docs-content.js";
import { asideSection, button, listRow } from "../widgets.js";
import type { View, Workshop } from "../view.js";

export function docsScreen(shop: Workshop, selected: SdkDocId): View {
  const docs = sdkDocs();
  const document = docs.find((candidate) => candidate.id === selected) ?? docs[0];
  if (document === undefined) throw new Error("The embedded SDK docs are empty.");

  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);

  const reader = codeEditor({
    doc: shop.doc,
    lang: "markdown",
    text: document.text,
    readOnly: true,
    onInput: () => undefined,
    onSave: () => undefined,
  });

  main.append(
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "Neo Angband modding docs" }),
      h("p", {
        text:
          "The real SDK documentation bundled when this workshop was built. Pick a lesson on the right, or use " +
          "the advanced references when you need the full contract behind a content file or plugin.js.",
      }),
    ),
    h(
      "div",
      { class: "mb-row-actions" },
      button({
        label: "Start with tutorial 1",
        kind: "primary",
        onClick: () => shop.acts.go({ at: "docs", doc: "tutorial-01" }),
      }),
      button({ label: "Open plugin API", onClick: () => shop.acts.go({ at: "docs", doc: "plugins" }) }),
    ),
    h("div", { class: "mb-filename", text: `SDK docs / ${document.path}` }),
    h("div", { class: "mb-why", text: "Read-only. Ctrl+F finds text in this document." }),
    reader.el,
  );

  const beginner = asideSection("Beginner path", "7 lessons");
  beginner.body.append(
    h("p", {
      class: "mb-why",
      text: "Start with the two-file lesson, then take the tutorials in order.",
    }),
    ...docs.filter((candidate) => candidate.audience === "beginner").map((candidate) =>
      listRow({
        badge: candidate.id.startsWith("tutorial-") ? candidate.id.slice(-2) : "+",
        name: candidate.title,
        meta: candidate.note,
        selected: candidate.id === selected,
        onClick: () => shop.acts.go({ at: "docs", doc: candidate.id }),
      }),
    ),
  );

  const advanced = asideSection("Advanced reference");
  advanced.body.append(
    h("p", {
      class: "mb-why",
      text: "Requirements first, then the complete authoring and plugin contracts.",
    }),
    ...docs.filter((candidate) => candidate.audience === "advanced").map((candidate) =>
      listRow({
        badge: "?",
        name: candidate.title,
        meta: candidate.note,
        selected: candidate.id === selected,
        onClick: () => shop.acts.go({ at: "docs", doc: candidate.id }),
      }),
    ),
  );
  aside.append(beginner.el, advanced.el);

  return {
    el,
    update: () => undefined,
    keys(event) {
      return reader.keys(event);
    },
    dispose() {
      reader.dispose();
    },
  };
}
