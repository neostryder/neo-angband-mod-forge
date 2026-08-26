/**
 * The README, read from inside the tool rather than only in the repository.
 *
 * A CURATED SUMMARY, not the file itself. There is no bundler step that ships
 * `README.md`'s bytes into `plugin.js` - the mod's whole build is one esbuild
 * pass over TypeScript, and a module fetched from a folder cannot `import` a
 * markdown file it was never told to carry. Writing an in-tool summary by
 * hand is the honest version of "a way to view the README from inside the
 * tool": it says the same things the file says, in the tool's own voice, and
 * it is short enough that keeping the two in agreement is a rereading rather
 * than a build step.
 *
 * Used by both the launch screen's "Read the README" panel and the workshop's
 * own "About" screen, so the words exist in one place regardless of which
 * door a reader came in by.
 */

import { h } from "./dom.js";

export interface ReadmeSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export const README_SECTIONS: readonly ReadmeSection[] = [
  {
    title: "What ModForge is",
    paragraphs: [
      "Pick something that already exists in Angband - a monster, a sword, a shop, a spell - and the workshop " +
        "shows what it is made of, what its neighbours carry for every number, and what would have to change to " +
        "make the thing you had in mind.",
      "It never asks what JSON is, and it never hides it either: every screen can show the exact file it is about " +
        "to write, and a mod it built can be taken away, hand-edited, and brought back.",
    ],
  },
  {
    title: "What it does",
    paragraphs: [
      "Adds records - a new monster, item or spell, based on something that already exists, so it arrives with " +
        "real shape and scale and none of its powers until you add them.",
      "Adjusts records the game already owns, shipping the difference rather than the whole record, so two mods " +
        "changing different fields of the same thing both keep working.",
      "Retunes a whole file at once - every potion cheaper, every dragon faster - one adjustment applied across " +
        "everything that matches a filter, each written as its own entry.",
      "Checks as you type: a name collision, a field nothing in the file uses, a reference to something no loaded " +
        "pack defines. Errors, warnings and advice are kept apart.",
    ],
  },
  {
    title: "Editing the files directly",
    paragraphs: [
      "Every screen above asks a question and writes the answer into a file. \"Edit the files directly\", reached " +
        "from a mod's own page, shows those files - the same mod, printed, not a second copy of it. A change made " +
        "there shows up on every other screen, and the other way round.",
    ],
  },
  {
    title: "What it is not yet",
    paragraphs: [
      "The numbers shown today come from the workshop's own demonstration content rather than from the game's " +
        "real records, until the engine grows the seams this mod is built against. The banner on every screen " +
        "says so, and nothing dismisses it.",
    ],
  },
  {
    title: "Reading more",
    paragraphs: [
      "The full README, the seven written tutorials, and every engine seam this mod is waiting on live in the " +
        "repository this mod shipped from: neo-angband-mod-forge, on GitHub.",
    ],
  },
];

/** The sections above, built as elements ready to drop into a screen. */
export function readmeElements(): readonly HTMLElement[] {
  return README_SECTIONS.map((section) =>
    h(
      "section",
      { class: "mb-readme-section" },
      h("h3", { text: section.title }),
      ...section.paragraphs.map((p) => h("p", { text: p })),
    ),
  );
}
