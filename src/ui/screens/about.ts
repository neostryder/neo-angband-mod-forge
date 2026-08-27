/**
 * What ModForge is, read from inside the tool.
 *
 * The same words the launch screen's "Read the README" panel shows, on a
 * screen that stays reachable after the launch screen itself is long gone -
 * the titlebar's "About" button, from anywhere in the workshop.
 */

import { h } from "../dom.js";
import { readmeElements } from "../readme-content.js";
import type { View, Workshop } from "../view.js";
import { button } from "../widgets.js";

export function aboutScreen(shop: Workshop): View {
  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "section",
      { class: "mb-readme-card mb-prose" },
      h("h2", { text: "About ModForge" }),
      ...readmeElements(),
      h(
        "div",
        { class: "mb-row-actions" },
        button({
          label: "Read the Neo Angband SDK docs",
          kind: "primary",
          onClick: () => shop.acts.go({ at: "docs", doc: "tutorial-01" }),
        }),
      ),
    ),
  );
  return { el, update: () => undefined, dispose: () => undefined };
}
