/**
 * The way in for somebody who has never modded anything.
 *
 * IT TEACHES THE SAME STEPS THE WRITTEN TUTORIALS TEACH, in the same order, and
 * that is deliberate rather than convenient. The game ships seven hand-written
 * content tutorials, they are good, and they are the from-scratch path. Anybody
 * who finishes the workshop's tour and then opens tutorial 3 has to find the same
 * ideas under the same names, or the two are teaching different games.
 *
 * So the four cards below are the tutorials' own spine: change one thing, add
 * something new, build on top of something that exists, and let the player switch
 * it off. What the workshop changes is who does the typing, not what is being
 * learned.
 *
 * AND IT SAYS WHERE THE OTHER PATH IS. The workshop is the promoted route and it
 * is not the only route: a mod is a folder with a text file in it, that will
 * always be true, and an author who would rather have a text editor open should
 * be told so by the tool rather than discovering it. The last card is that, and
 * it is not hidden behind anything.
 */

import { h } from "../dom.js";
import type { SdkDocId } from "../sdk-docs-content.js";
import type { View, Workshop } from "../view.js";
import { button, card } from "../widgets.js";

interface Lesson {
  readonly badge: string;
  readonly title: string;
  readonly teaches: string;
  readonly body: readonly string[];
  readonly cta: string;
  readonly tutorial: string;
  readonly doc: SdkDocId;
  readonly start: (shop: Workshop) => void;
}

const LESSONS: readonly Lesson[] = [
  {
    badge: "1",
    title: "Change one thing",
    teaches: "Editing a value the game already has",
    body: [
      "Daggers that hit harder. A shop with deeper pockets. A monster with three more hit points.",
      "The workshop shows you the record as the game sees it, you nudge a number, and what gets written down is the nudge rather than the answer. That distinction matters more than it looks: three more hit points keeps being what you meant after the base game retunes the monster, and after another mod adjusts it first. A fixed value does not.",
    ],
    cta: "Change something",
    tutorial: "tutorials/01-tweak-a-value.md",
    doc: "tutorial-01",
    start: (shop) => shop.acts.go({ at: "kinds" }),
  },
  {
    badge: "2",
    title: "Add something new",
    teaches: "Adding a record the game has never seen",
    body: [
      "A new sword, a new creature, a new potion. You pick something that already exists to base it on, and the workshop fills the new record in from what its neighbours in the game actually carry, then tells you where every number came from.",
      "It inherits shape and scale and none of its powers. A new orc arrives with the orc's hit points and armour and no attacks at all until you say otherwise, because a tool that handed out a Balrog's breath by accident would be a tool nobody could trust with the easy cases.",
    ],
    cta: "Make something new",
    tutorial: "tutorials/02-add-an-item.md",
    doc: "tutorial-02",
    start: (shop) => shop.acts.go({ at: "kinds" }),
  },
  {
    badge: "3",
    title: "Build on top of it",
    teaches: "One-of-a-kind items, and what a field that names another record costs",
    body: [
      "An artifact is not a new kind of item. It is a set of adjustments to an item the game already has, so you are describing the difference rather than the thing.",
      "This is also where the single most common way a first mod fails lives: a field that names another record, spelled slightly wrong. The workshop checks those names against what is actually loaded as you type, and says which file it looked in.",
    ],
    cta: "Build on something",
    tutorial: "tutorials/07-add-an-artifact.md",
    doc: "tutorial-07",
    start: (shop) => shop.acts.go({ at: "kinds" }),
  },
  {
    badge: "4",
    title: "Retune a whole set of things",
    teaches: "One change across many records at once",
    body: [
      "The most common thing anybody makes is not a new creature. It is a number, moved, across everything of one sort: every potion cheaper, every dragon faster, every shop's purse deeper.",
      "Pick a file, filter it down to the records you mean, and apply one adjustment to all of them. Each one is written as its own entry, so another mod's unrelated change to the same record still composes with yours.",
    ],
    cta: "Retune a set",
    tutorial: "tutorials/01-tweak-a-value.md",
    doc: "tutorial-01",
    start: (shop) => shop.acts.go({ at: "kinds" }),
  },
];

export function tourScreen(shop: Workshop): View {
  const el = h("div", { class: "mb-main" });

  const intro = h(
    "div",
    { class: "mb-prose" },
    h("h2", { text: "Make something for Angband" }),
    h("p", {
      text:
        "A mod is a folder with a text file in it. That is the whole idea, and it stays true whether the file is " +
        "written here or in a text editor. What the workshop does is know what belongs in the file, what the rest " +
        "of the game already puts there, and which mistakes will not tell you about themselves until you play.",
    }),
    h("p", {
      text:
        "Nothing you do in here touches the game until you try the mod for this session or add its saved file through " +
        "the Mods screen. A mod can be switched off, and switching it off gives you the base game back exactly as it was.",
    }),
  );

  const cards = LESSONS.map((lesson) => {
    const block = card({ title: lesson.title, note: lesson.teaches, badge: lesson.badge, open: true });
    block.body.append(
      h("div", { class: "mb-prose" }, ...lesson.body.map((line) => h("p", { text: line }))),
      h(
        "div",
        { class: "mb-row-actions" },
        button({ label: lesson.cta, kind: "primary", onClick: () => lesson.start(shop) }),
        button({
          label: `Read tutorial ${lesson.badge}`,
          kind: "ghost",
          onClick: () => shop.acts.go({ at: "docs", doc: lesson.doc }),
          tip:
            `Open the real SDK document: ${lesson.tutorial}. It builds the same mod with a text editor and pins ` +
            "the finished version with a test.",
        }),
      ),
    );
    return block.el;
  });

  const advanced = card({
    title: "Or do it by hand",
    note: "The SDK path for code and the details behind the workshop",
    badge: "+",
    open: true,
  });
  advanced.body.classList.add("mb-prose");
  advanced.body.append(
    h("p", {
      text:
        "The workshop guides record changes, starts a working plugin.js entry point, imports tiles, fonts and sounds " +
        "as their real bytes, and round-trips sections from record files. It does not invent your plugin's behaviour, " +
        "preview or validate an asset, or offer a visual editor for sections. The SDK docs below are the path for all " +
        "of those details.",
    }),
    h(
      "ul",
      null,
      h("li", null, button({ label: "Read the seven tutorials", onClick: () => shop.acts.go({ at: "docs", doc: "tutorials" }) })),
      h("li", null, button({ label: "Read the plugin API", onClick: () => shop.acts.go({ at: "docs", doc: "plugins" }) })),
      h("li", null, button({ label: "Read the authoring API", onClick: () => shop.acts.go({ at: "docs", doc: "authoring" }) })),
      h("li", null, button({ label: "Read compatibility guidance", onClick: () => shop.acts.go({ at: "docs", doc: "compatibility" }) })),
    ),
    h("p", {
      text:
        "A mod the workshop wrote is an ordinary folder of ordinary files. Take it out, edit it in anything, and " +
        "bring it back through Import a zip. Nothing in it belongs to the workshop.",
    }),
  );

  const done = h(
    "div",
    { class: "mb-row-actions" },
    button({
      label: "Take me to my mods",
      kind: "primary",
      onClick: () => shop.acts.finishTour(),
    }),
    h("span", { class: "mb-label-meta", text: "This page is under Guide whenever you want it again." }),
  );

  el.append(intro, ...cards, advanced.el, done);
  return { el, update: () => undefined, dispose: () => undefined };
}
