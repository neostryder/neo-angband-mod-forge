/**
 * Test: be wherever the thing you wrote belongs, and then look at it.
 *
 * WHAT THIS SCREEN IS FOR is not "cheat". It is the observation that testing one
 * record means arranging everything around it. A monster written for dungeon level
 * forty tells you nothing on level one, where nothing it does is dangerous. An item
 * balanced for a character with a hundred hit points tells you nothing to a
 * character with nine. A shop's reaction to a new weapon needs the gold to see it.
 * So the panel is not a spawn button with extras; it is the whole set, because the
 * whole set is what one honest test of one record takes.
 *
 * THE SAVE IS WHAT IT COSTS, AND IT IS SAID ONCE, BEFORE ANYTHING, AND NOT IN A
 * TOOLTIP. Every control here is dead until the session has been cut loose from its
 * save, which is one button and cannot be undone. After it, the character on disk
 * keeps whatever the last save left and nothing else is ever written: reloading the
 * game returns to the character select with them waiting exactly as they were. That
 * is a real consequence and a consequence that arrives without warning is the one
 * thing a convenience is not allowed to be. So the screen names the character, says
 * what happens to them, and puts the decision behind its own button.
 *
 * IT IS ALSO WHY THIS IS NOT THE OLD SCREEN WITH MORE BUTTONS. The old one refused
 * to act at all unless the player had already taken Angband's permanent debug mark
 * on a character they were still playing and still saving - a mark that costs that
 * character its place on the high score list for the rest of its life. It refused
 * to take that on anybody's behalf, correctly. Detaching first is a smaller thing to
 * spend and it is spent in the open, so there is nothing left to refuse for
 * somebody: the mark goes on a character that has already stopped being written
 * down, where it is simply true.
 *
 * WHAT CAN BE TESTED IS WHAT IS LOADED, and the screen is plain about why. Content
 * composes when the game loads, so a record written a minute ago is not in the game
 * until the mod has been forged and the game has reloaded - which is the one-click
 * action in the status bar. Until then this browser shows the game as it stands,
 * which is still the useful half: the record you are about to copy is in it, and
 * holding one answers "what is a Studded Leather Armour actually like" better than
 * its numbers do.
 */

import { fill, h, setText } from "../dom.js";
import { NO_CATALOGUE, packsInPlay, testRows } from "../../host/spawn.js";
import type { TestKind } from "../../host/spawn.js";
import type { WizardApi, WizardCatalogue, WizardOutcome, WizardWhere } from "../../host/context.js";
import { asideSection, button, card, empty, fillList, listRow, searchBox } from "../widgets.js";
import type { AppState } from "../store.js";
import type { View, Workshop } from "../view.js";

/** How many rows before the list asks to be asked for more. */
const PAGE = 60;

/** How many of one thing a row's buttons offer. Beyond this, use the field. */
const HANDFUL = 5;

export function testScreen(shop: Workshop): View {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);

  const seam = shop.seams.wizard;

  /* ---------------------------------------------------------------- *
   * What it costs, and the one button that spends it
   * ---------------------------------------------------------------- */

  const intro = h("div", { class: "mb-prose" }, h("h2", { text: "Test it in the game" }));
  const blocked = h("div", { class: "mb-banner" });

  const armCard = card({ title: "Before anything works", open: true });
  const armProse = h("div", { class: "mb-prose" });
  const arm = button({
    label: "Stop saving, and let me test",
    kind: "danger",
    seal: true,
    tip:
      "Cuts this session loose from its save slot. Your character on disk keeps whatever the last save left and " +
      "nothing after this is ever written. It cannot be undone; reload the game to go back to them.",
    onClick: () => {
      if (!seam.api) return;
      report(seam.api.sandbox());
      renderAll();
    },
  });
  armCard.body.append(armProse, h("div", { class: "mb-row-actions" }, arm));

  /* ---------------------------------------------------------------- *
   * The browser: this mod's content first, the whole game behind it
   * ---------------------------------------------------------------- */

  const kindPick = h(
    "select",
    null,
    h("option", { value: "creature", text: "creatures" }),
    h("option", { value: "item", text: "items" }),
    h("option", { value: "artifact", text: "artifacts" }),
  );
  const packPick = h("select", null);
  const search = searchBox("filter by name", (value) => shop.acts.setFilter(value));
  const list = h("div", { class: "mb-list" });
  const more = button({
    label: "Show more",
    kind: "ghost",
    onClick: () => {
      shown += PAGE;
      renderList(shop.store.get());
    },
  });

  const browse = card({ title: "Put one in front of me", open: true });
  browse.body.append(h("div", { class: "mb-row-actions" }, kindPick, packPick, search), list, more);

  /* ---------------------------------------------------------------- *
   * Where and what: the rest of the debug set
   * ---------------------------------------------------------------- */

  const depth = numberField("dungeon level", "0 is the town", 0);
  const goDeep = button({ label: "Go there", kind: "primary", onClick: () => act((w) => w.goToDepth(depth.read())) });

  const exp = numberField("experience to gain", "levels up on the way, as play would", 0);
  const giveExp = button({ label: "Grant it", onClick: () => act((w) => w.grantExperience(exp.read())) });

  const gold = numberField("gold", "set outright, not added", 0);
  const giveGold = button({ label: "Set it", onClick: () => act((w) => w.setGold(gold.read())) });

  const statPick = h("select", null);
  const statValue = numberField("value", "the game clamps this to its own band", 18);
  const setStat = button({
    label: "Set it",
    onClick: () => act((w) => w.setStat(statPick.value, statValue.read())),
  });

  const loot = numberField("how many", "good random items, as acquirement makes them", 3);
  const acquire = button({ label: "Drop them", onClick: () => act((w) => w.acquire(loot.read())) });
  const acquireGreat = button({
    label: "Excellent ones",
    onClick: () => act((w) => w.acquire(loot.read(), true)),
  });

  const horde = numberField("how many", "random creatures, near you", 5);
  const summon = button({ label: "Summon them", onClick: () => act((w) => w.summonRandom(horde.read())) });

  const hop = numberField("squares", "a random teleport of up to this far", 40);
  const teleport = button({ label: "Teleport", onClick: () => act((w) => w.teleport(hop.read())) });

  const depthCard = card({ title: "Where you are", open: true });
  depthCard.body.append(row(depth.el, goDeep), row(hop.el, teleport));

  const charCard = card({ title: "What you are", open: true });
  charCard.body.append(
    row(exp.el, giveExp),
    row(gold.el, giveGold),
    row(statPick, statValue.el, setStat),
    row(
      null,
      button({ label: "Heal and cure", onClick: () => act((w) => w.heal()) }),
      button({ label: "Reroll hit points", onClick: () => act((w) => w.rerollLife()) }),
      button({
        label: "Max everything out",
        kind: "danger",
        tip: "Every stat, the experience cap, a million gold. For testing the top of the game.",
        onClick: () => act((w) => w.maxOut()),
      }),
    ),
  );

  const roomCard = card({ title: "What is around you", open: true });
  roomCard.body.append(
    row(loot.el, acquire, acquireGreat),
    row(horde.el, summon),
    row(
      null,
      button({ label: "Map this level", onClick: () => act((w) => w.mapLevel()) }),
      button({ label: "Light it all", onClick: () => act((w) => w.lightLevel()) }),
      button({ label: "Show every creature", onClick: () => act((w) => w.findCreatures()) }),
    ),
    row(
      null,
      button({
        label: "Clear the level",
        kind: "danger",
        tip: "Removes every creature on the level, so you can look at one thing without being interrupted.",
        onClick: () => act((w) => w.banish()),
      }),
      button({
        label: "Hit everything in sight",
        kind: "danger",
        onClick: () => act((w) => w.killVisible()),
      }),
    ),
  );

  const knowCard = card({ title: "What you know", note: "so nothing shows up unidentified", open: false });
  knowCard.body.append(
    row(
      null,
      button({ label: "Learn every item", onClick: () => act((w) => w.learnItems()) }),
      button({ label: "Learn every creature", onClick: () => act((w) => w.learnCreatures()) }),
    ),
  );

  /* ---------------------------------------------------------------- *
   * The aside: where the character actually is
   * ---------------------------------------------------------------- */

  const whereSection = asideSection("Right now");
  const whereBody = h("div", { class: "mb-prose" });
  whereSection.body.appendChild(whereBody);

  const minesSection = asideSection("In this game");
  const minesBody = h("div", { class: "mb-prose" });
  minesSection.body.appendChild(minesBody);

  aside.append(whereSection.el, minesSection.el);
  main.append(intro, blocked, armCard.el, browse.el, depthCard.el, charCard.el, roomCard.el, knowCard.el);

  /* ---------------------------------------------------------------- *
   * Rendering
   * ---------------------------------------------------------------- */

  let shown = PAGE;
  /* READ ONCE PER RENDER, not once per row. The catalogue is the whole game's
   * content and a row's click handler asking for it again would rebuild it six
   * hundred times per paint. */
  let catalogue: WizardCatalogue = NO_CATALOGUE;
  let statsFilled = false;

  const armed = (): boolean => seam.api?.sandboxed() === true;

  const report = (outcome: WizardOutcome): void => {
    if (outcome.ok) shop.acts.notice(outcome.did, "good");
    else shop.acts.notice(outcome.problem, "bad");
  };

  /** Run one command, then repaint: most of them change what the aside says. */
  const act = (run: (w: WizardApi) => WizardOutcome): void => {
    const api = seam.api;
    if (!api) return;
    report(run(api));
    renderAll();
  };

  const renderArm = (): void => {
    if (armed()) {
      armCard.setOpen(false);
      armCard.setNote("done");
      arm.disabled = true;
      armProse.replaceChildren(
        h(
          "p",
          null,
          h("b", { text: "This session is no longer being saved. " }),
          "Everything below works. Your character on disk is exactly as their last save left them, and reloading " +
            "the game takes you back to them - anything you do from here is gone when you do.",
        ),
      );
      return;
    }
    armCard.setOpen(true);
    armCard.setNote("");
    arm.disabled = !seam.available;
    const who = seam.api?.attached()?.name;
    armProse.replaceChildren(
      h(
        "p",
        null,
        h("b", { text: "Everything here is off until this session stops being saved. " }),
        "These are the game's own debug commands, and using them on a character you are keeping would mean " +
          "keeping whatever they did to it. So the workshop cuts the session loose from its save slot first, and " +
          "then nothing at all is written down.",
      ),
      h("p", {
        text:
          who === undefined || who === ""
            ? "Nothing is being saved right now in any case, so this costs you nothing."
            : `${who} keeps whatever their last save left - at most a few seconds of walking behind. Everything ` +
              `after that is discarded, and reloading the game brings them back exactly as they are on disk.`,
      }),
      h("p", { text: "It cannot be undone. Reload the game to go back to normal play." }),
    );
  };

  const renderList = (state: AppState): void => {
    const kind = kindPick.value as TestKind;
    const pack = packPick.value === "" ? undefined : packPick.value;
    const rows = testRows(catalogue, {
      kind,
      search: state.filter,
      ...(pack === undefined ? {} : { pack }),
    });
    const page = rows.slice(0, shown);
    const total = testRows(catalogue, { kind }).length;

    more.style.display = rows.length > page.length ? "" : "none";
    setText(more, `Show more (${rows.length - page.length} left)`);
    browse.setNote(`${rows.length} of ${total}`);

    fillList(
      list,
      page.map((entry) =>
        buildRow(entry.kind, entry.entry.name, entry.entry.level, entry.modded, entry.entry.from),
      ),
      total === 0
        ? empty(
            "[ ]",
            "Nothing is loaded to test with",
            armedOrNot(
              "The game has not handed the workshop its content, so there is nothing to choose from.",
              "Forge the mod and play it, and everything it adds turns up here.",
            ),
          )
        : empty("[ ]", "Nothing matches", "No loaded record has that in its name."),
    );
  };

  const buildRow = (
    kind: TestKind,
    name: string,
    level: number,
    modded: boolean,
    from: string | undefined,
  ): HTMLElement => {
    const row = listRow({
      badge: kind === "creature" ? "o" : kind === "artifact" ? "*" : "|",
      name,
      meta: level > 0 ? `level ${level}` : "town",
      /* THE PROVENANCE TAG IS THE POINT OF THE WHOLE LIST. A workshop's user is
       * looking for what they wrote, in six hundred entries of what they did not. */
      tags: modded
        ? [{ text: from ?? "a mod", tone: "mine", tip: `Added by "${from ?? "a mod"}", not by the base game.` }]
        : [],
      onClick: () => spawn(kind, name, 1),
    });
    const acts = row.querySelector(".mb-row-acts");
    if (acts && kind !== "artifact") {
      acts.appendChild(
        button({
          label: `x${HANDFUL}`,
          tiny: true,
          tip: `Put ${HANDFUL} of them there at once.`,
          onClick: () => spawn(kind, name, HANDFUL),
        }),
      );
    }
    return row;
  };

  const spawn = (kind: TestKind, name: string, quantity: number): void => {
    act((w) =>
      kind === "creature"
        ? w.spawnCreature(name, quantity)
        : kind === "artifact"
          ? w.spawnArtifact(name)
          : w.spawnItem(name, quantity),
    );
  };

  const renderPacks = (): void => {
    const packs = packsInPlay(catalogue);
    /* Rebuilt only when the set changed, because replacing the options resets the
     * player's choice - and the set only changes on a reload. */
    const wanted = ["", ...packs].join(" ");
    if (packPick.dataset["packs"] === wanted) return;
    packPick.dataset["packs"] = wanted;
    fill(
      packPick,
      h("option", { value: "", text: "everything loaded" }),
      ...packs.map((pack) => h("option", { value: pack, text: `only ${pack}` })),
    );
    /* DEFAULTS TO THE AUTHOR'S OWN, when the running game has exactly one pack's
     * worth of added content: that is overwhelmingly the draft they just forged, and
     * showing them the base game's six hundred monsters first would be answering a
     * question they did not ask. More than one pack and the choice is theirs, because
     * guessing which of two mods is "theirs" is guessing. */
    packPick.value = packs.length === 1 ? (packs[0] ?? "") : "";
  };

  const renderWhere = (): void => {
    const where: WizardWhere | null = seam.api?.where() ?? null;
    if (where === null) {
      whereBody.replaceChildren(h("p", { text: "There is no character in play." }));
      return;
    }
    if (!statsFilled) {
      /* From the game's own list and in its own order, so a build whose stats differ
       * from this one's cannot end up with the workshop labelling DEX as WIS. */
      fill(statPick, ...where.stats.map((stat) => h("option", { value: stat.name, text: stat.name })));
      statsFilled = true;
    }
    depth.setPlaceholder(`0 to ${where.maxDepth}`);
    whereBody.replaceChildren(
      h("p", {
        text:
          `Dungeon level ${where.depth}${where.depth === 0 ? " (the town)" : ""}, character level ` +
          `${where.level}, ${where.experience} experience, ${where.gold} gold.`,
      }),
      h("p", { text: where.stats.map((stat) => `${stat.name} ${stat.value}`).join("   ") }),
    );
  };

  const renderMine = (): void => {
    const packs = packsInPlay(catalogue);
    const counts = {
      creatures: catalogue.creatures.filter((entry) => entry.from !== undefined).length,
      items: catalogue.items.filter((entry) => entry.from !== undefined).length,
      artifacts: catalogue.artifacts.filter((entry) => entry.from !== undefined).length,
    };
    minesBody.replaceChildren(
      packs.length === 0
        ? h("p", {
            text:
              "Everything loaded is the base game's. Content composes when the game loads, so a record you have " +
              "just written turns up here after you forge the mod and play it - the button in the bar below.",
          })
        : h("p", {
            text:
              `${packs.join(", ")} added ${counts.creatures} creature${counts.creatures === 1 ? "" : "s"}, ` +
              `${counts.items} item${counts.items === 1 ? "" : "s"} and ${counts.artifacts} ` +
              `artifact${counts.artifacts === 1 ? "" : "s"} to this game. They are at the top of the list.`,
          }),
      h("p", {
        text:
          "Anything you change in the workshop now is not in the game until you forge it and play it again, " +
          "because composing content always takes a reload.",
      }),
    );
  };

  const armedOrNot = (whenNoSeam: string, whenSeam: string): string =>
    seam.api === undefined ? whenNoSeam : whenSeam;

  const renderAll = (): void => {
    /* THE BANNER GOES UP WHEN THE SEAM IS MISSING, and the controls come down with
     * it - but the browser stays, whenever there is a catalogue to fill it from.
     * Deciding what to test is how somebody decides whether to spend their session,
     * and a list that only appeared afterwards would be asking them to agree to
     * something they cannot see. */
    const usable = seam.available || seam.api !== undefined;
    blocked.style.display = seam.available ? "none" : "";
    if (!seam.available) {
      blocked.replaceChildren(h("b", { text: "Not available. " }), h("span", { text: seam.why ?? "" }));
    }
    armCard.el.style.display = seam.api === undefined ? "none" : "";
    for (const section of [depthCard, charCard, roomCard, knowCard]) {
      section.el.style.display = usable ? "" : "none";
    }
    browse.el.style.display = usable ? "" : "none";

    catalogue = seam.api?.catalogue() ?? NO_CATALOGUE;
    renderPacks();
    renderArm();
    renderWhere();
    renderMine();
    renderList(shop.store.get());

    /* ONE PLACE DECIDES WHETHER A CONTROL WORKS, and it is the host's answer rather
     * than this screen's opinion of it. A second rule here would be a second rule to
     * keep in step with the first. */
    const live = armed() && seam.available;
    for (const control of main.querySelectorAll("button")) {
      if (control === arm) continue;
      if (control === more) continue;
      if (control.classList.contains("mb-card-head")) continue;
      control.disabled = !live;
    }
    for (const field of [depth, exp, gold, statValue, loot, horde, hop]) field.setEnabled(live);
    for (const picker of [kindPick, packPick, statPick]) picker.disabled = catalogue === NO_CATALOGUE;
    search.disabled = false;
  };

  kindPick.addEventListener("change", () => {
    shown = PAGE;
    renderList(shop.store.get());
  });
  packPick.addEventListener("change", () => {
    shown = PAGE;
    renderList(shop.store.get());
  });

  renderAll();

  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) {
        shown = PAGE;
        renderList(next);
      }
    },
    dispose: () => undefined,
  };
}

/* ------------------------------------------------------------------ *
 * Two small local widgets. Local because nothing else wants them yet.
 * ------------------------------------------------------------------ */

interface NumberField {
  readonly el: HTMLElement;
  read(): number;
  setEnabled(enabled: boolean): void;
  setPlaceholder(text: string): void;
}

/**
 * A labelled number box.
 *
 * NOT `textField`, which reports every keystroke to an action - these values are
 * read when a button is pressed, so telling the store about each digit would put a
 * half-typed number through the whole render path. It also must not be an
 * `<input type="number">` with a `min`: a browser's own number spinner reports an
 * out-of-range value as the empty string, so a mistyped depth would arrive as zero
 * and quietly send the player to the town.
 */
function numberField(label: string, note: string, initial: number): NumberField {
  const input = h("input", {
    type: "text",
    class: "mb-mono",
    value: String(initial),
    spellcheck: false,
  });
  const el = h(
    "div",
    { class: "mb-field" },
    h(
      "label",
      { class: "mb-label" },
      h("span", { class: "mb-label-name", text: label }),
      h("span", { class: "mb-label-meta", text: note }),
    ),
    h("div", { class: "mb-control" }, input),
  );
  return {
    el,
    read(): number {
      /* NaN rather than zero for something unreadable, so the host's own refusal
       * says "that is not a number" instead of the workshop silently doing the thing
       * zero means - which for a depth is going to the town. */
      const text = input.value.trim();
      return text === "" ? Number.NaN : Number(text);
    },
    setEnabled(enabled): void {
      input.disabled = !enabled;
    },
    setPlaceholder(text): void {
      input.placeholder = text;
    },
  };
}

/** One line of controls: a field or nothing, then buttons. */
function row(field: HTMLElement | null, ...controls: HTMLElement[]): HTMLElement {
  return h("div", { class: "mb-row-actions" }, field, ...controls);
}
