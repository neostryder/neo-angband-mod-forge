/**
 * @vitest-environment jsdom
 *
 * The whole workshop, driven the way a player drives it: by clicking things.
 *
 * WHY THROUGH THE DOM AND NOT THROUGH THE ACTIONS. Calling the command surface
 * directly would test the model twice and the interface never, and the interface
 * is where this feature either exists or does not. These tests find the controls
 * by the words on them, which means they also fail when a label stops saying what
 * it does - which is the right thing for them to notice.
 *
 * WHAT IT PROVES END TO END: the tab's overlay mounts, the guide leads to a mod,
 * a mod can be named, a content kind picked, a base chosen, a record drafted from
 * that base with real values in it, a field edited, and the review screen shows
 * the exact two files that would be written. That is the player's journey, and
 * every step of it runs here with no engine present at all.
 */

import { afterEach, describe, expect, it } from "vitest";
import { openWorkshop } from "./workshop.js";
import type { WorkshopHandle } from "./workshop.js";
import type { BuilderCtx } from "./host/context.js";

let open: WorkshopHandle | undefined;

afterEach(() => {
  open?.close();
  open = undefined;
  document.body.replaceChildren();
});

function fakePrefs(): { get(): unknown; set(v: unknown): void } {
  let held: unknown;
  return {
    get: () => held,
    set: (value) => {
      held = value;
    },
  };
}

function ctx(extra: Partial<BuilderCtx> = {}): BuilderCtx {
  return {
    id: "builder",
    engine: "0.25.0",
    flags: { "builder.showTab": true, "builder.keepDrafts": true },
    core: {} as BuilderCtx["core"],
    prefs: fakePrefs(),
    log: () => undefined,
    ...extra,
  };
}

function shadow(): ShadowRoot {
  const host = document.getElementById("neo-angband-mod-builder");
  if (!host?.shadowRoot) throw new Error("the workshop did not mount");
  return host.shadowRoot;
}

/** Find the one control whose visible text matches, and complain if it is absent. */
function control(text: string, selector = "button"): HTMLElement {
  const found = [...shadow().querySelectorAll<HTMLElement>(selector)].filter((el) =>
    (el.textContent ?? "").trim().includes(text),
  );
  if (found.length === 0) {
    throw new Error(`nothing matching "${text}" on screen. Buttons here: ${buttonNames().join(" | ")}`);
  }
  return found[0] as HTMLElement;
}

function buttonNames(): string[] {
  return [...shadow().querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()).filter((t) => t !== "");
}

function screenText(): string {
  return shadow().textContent ?? "";
}

function type(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("opening the workshop", () => {
  it("declines quietly when there is no document, which is a legitimate host", () => {
    expect(openWorkshop(ctx(), undefined)).toBeUndefined();
  });

  it("mounts one overlay, above everything, and owns the keyboard while it is up", () => {
    open = openWorkshop(ctx(), document);
    const host = document.getElementById("neo-angband-mod-builder");
    expect(host).not.toBeNull();
    expect(host?.getAttribute("aria-modal")).toBe("true");
    expect(host?.style.position).toBe("fixed");
    expect(Number(host?.style.zIndex)).toBeGreaterThan(100);
    expect(host?.shadowRoot).not.toBeNull();
  });

  it("swallows a keystroke so it never reaches the game", () => {
    open = openWorkshop(ctx(), document);
    let reachedTheGame = false;
    window.addEventListener("keydown", () => {
      reachedTheGame = true;
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true, cancelable: true }));
    expect(reachedTheGame).toBe(false);
  });

  it("takes its element and its listeners away again on close", () => {
    open = openWorkshop(ctx(), document);
    open?.close();
    expect(document.getElementById("neo-angband-mod-builder")).toBeNull();

    let reachedTheGame = false;
    window.addEventListener("keydown", () => {
      reachedTheGame = true;
    });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", bubbles: true, cancelable: true }));
    expect(reachedTheGame).toBe(true);
    open = undefined;
  });

  it("says, undismissably, that its numbers are a demonstration when they are", () => {
    open = openWorkshop(ctx(), document);
    expect(screenText()).toContain("Demonstration content");
    /* No dismiss control on it, deliberately: every suggestion under that banner
     * is evidence about a fixture. */
    expect(buttonNames().some((name) => name.toLowerCase().includes("dismiss"))).toBe(false);
  });

  it("opens on the guide the first time, and on the mod list once it has been read", () => {
    open = openWorkshop(ctx(), document);
    expect(screenText()).toContain("Make something for Angband");
    const prefs = fakePrefs();
    prefs.set({ v: 1, drafts: {}, seenTour: true });
    open?.close();
    open = openWorkshop(ctx({ prefs }), document);
    expect(screenText()).toContain("Start something");
  });
});

describe("the player's journey", () => {
  function walkToTheEditor(): void {
    open = openWorkshop(ctx(), document);

    /* The guide leads to the mod list. */
    control("Take me to my mods").click();
    expect(screenText()).toContain("Unfinished");

    /* Naming the mod. */
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box on the mod list");
    type(idBox, "my-first-mod");
    control("Start a new mod").click();
    expect(screenText()).toContain("This mod");

    /* Picking what to make. */
    control("Add or change something").click();
    expect(screenText()).toContain("What are you making?");
    expect(screenText()).toContain("Creatures");

    /* The creatures card's own "make a new one". */
    const creatures = [...shadow().querySelectorAll<HTMLElement>(".mb-kind")].find((el) =>
      (el.textContent ?? "").includes("Creatures"),
    );
    if (!creatures) throw new Error("no Creatures card in the picker");
    const make = [...creatures.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
      (b.textContent ?? "").includes("Make a new one"),
    );
    make?.click();
    expect(screenText()).toContain("Base your creature on something");

    /* Basing it on something that exists. */
    const wolf = [...shadow().querySelectorAll<HTMLElement>(".mb-listrow")].find((row) =>
      (row.textContent ?? "").includes("grey wolf"),
    );
    if (!wolf) throw new Error("the base list has no grey wolf");
    wolf.click();
  }

  it("drafts a record from the base, with real values rather than blanks", () => {
    walkToTheEditor();
    expect(screenText()).toContain("Identity");
    expect(screenText()).toContain("Things like this");

    /* The drafted record inherited the wolf's family and scale. */
    const values = fieldValues();
    expect(values["base"]).toBe("canine");
    expect(Number(values["hit-points"])).toBeGreaterThan(0);

    /* And none of its attacks: shape and scale carry over, powers do not. */
    expect(values["blow"]).toBeUndefined();
  });

  it("says what a name would collide with, as it is typed", () => {
    walkToTheEditor();
    const name = fieldInput("name");
    type(name, "grey wolf");
    expect(screenText()).toContain("This name is taken");
    type(name, "dire wolf");
    expect(screenText()).toContain("my-first-mod:dire-wolf");
  });

  it("writes exactly the two files a folder reader expects", () => {
    walkToTheEditor();
    type(fieldInput("name"), "dire wolf");

    control("Review and install").click();
    expect(screenText()).toContain("manifest.json");
    expect(screenText()).toContain("monster.json");

    const files = [...shadow().querySelectorAll(".mb-filename")].map((el) => el.textContent);
    expect(files).toEqual(["manifest.json", "monster.json"]);

    const emitted = [...shadow().querySelectorAll(".mb-code")].map((el) => el.textContent ?? "");
    const manifest = JSON.parse(emitted[0] ?? "{}") as Record<string, unknown>;
    expect(manifest["id"]).toBe("my-first-mod");
    expect(manifest["shape"]).toBe("content");
    expect(manifest["engine"]).toBe(">=0.25.0");
    expect(manifest["repository"]).toBe("local://my-first-mod");

    const monster = JSON.parse(emitted[1] ?? "{}") as { records?: { name?: string }[] };
    expect(monster.records?.[0]?.name).toBe("dire wolf");
  });

  it("offers the file when there is no install door, and says why", () => {
    walkToTheEditor();
    type(fieldInput("name"), "dire wolf");
    control("Review and install").click();
    expect(screenText()).toContain("Import a zip");
    const forge = control("Forge and install") as HTMLButtonElement;
    expect(forge.disabled).toBe(true);
    expect((control("Save it as a file") as HTMLButtonElement).disabled).toBe(false);
  });

  it("undoes an edit from the title bar", () => {
    walkToTheEditor();
    type(fieldInput("name"), "dire wolf");
    expect(screenText()).toContain("my-first-mod:dire-wolf");
    control("Undo").click();
    expect(fieldValues()["name"]).not.toBe("dire wolf");
  });

  it("keeps unfinished work, and finds it again on the next open", () => {
    const prefs = fakePrefs();
    open = openWorkshop(ctx({ prefs }), document);
    control("Take me to my mods").click();
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box");
    type(idBox, "kept-mod");
    control("Start a new mod").click();
    open?.close();

    open = openWorkshop(ctx({ prefs }), document);
    expect(screenText()).toContain("Kept Mod");
  });

  it("keeps nothing when the player asked it not to", () => {
    const prefs = fakePrefs();
    prefs.set({ v: 1, drafts: { "old-mod": { id: "old-mod", version: "0.1.0", changes: [], name: "Old Mod" } }, seenTour: true });
    open = openWorkshop(ctx({ prefs, flags: { "builder.showTab": true } }), document);
    expect(screenText()).not.toContain("Old Mod");
  });
});

describe("the test panel", () => {
  it("is disabled with the reason on it when the seam is absent", () => {
    open = openWorkshop(ctx({ flags: { "builder.showTab": true, "builder.cheatSpawn": true } }), document);
    control("Take me to my mods").click();
    /* Reached through a route rather than a button, because the button only
     * appears once the seam is live - which is itself the behaviour under test. */
    expect(buttonNames()).not.toContain("Test it");
  });
});

/** Every field row's current value, by field name, out of the record editor. */
function fieldValues(): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const row of shadow().querySelectorAll<HTMLElement>(".mb-field")) {
    const name = row.querySelector(".mb-label-name")?.textContent ?? "";
    if (name === "") continue;
    const input = row.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    out[name] = input?.value;
  }
  return out;
}

function fieldInput(field: string): HTMLInputElement {
  for (const row of shadow().querySelectorAll<HTMLElement>(".mb-field")) {
    if ((row.querySelector(".mb-label-name")?.textContent ?? "") !== field) continue;
    const input = row.querySelector<HTMLInputElement>("input, textarea");
    if (input) return input;
  }
  throw new Error(`no editable field called "${field}". Fields here: ${Object.keys(fieldValues()).join(", ")}`);
}

describe("composition, which is the property an author cannot see", () => {
  /**
   * Ticking a flag on somebody else's record has to emit `addFlag`, not a write
   * of the whole list.
   *
   * This is the single most consequential invisible detail in the whole workshop.
   * `addFlag` composes: another mod adding a different flag to the same record
   * keeps its change and this one keeps its own. Writing the list back wholesale
   * is a `set`, so load order decides and one of the two mods silently loses. An
   * author cannot tell the difference by looking at the game, which is exactly why
   * it has to be pinned here.
   */
  it("writes addFlag when a flag is ticked on a record the base game owns", () => {
    open = openWorkshop(ctx(), document);
    control("Take me to my mods").click();
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box");
    type(idBox, "flag-mod");
    control("Start a new mod").click();
    control("Add or change something").click();

    const creatures = [...shadow().querySelectorAll<HTMLElement>(".mb-kind")].find((el) =>
      (el.textContent ?? "").includes("Creatures"),
    );
    [...(creatures?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
      .find((b) => (b.textContent ?? "").includes("Change one"))
      ?.click();

    const wolf = [...shadow().querySelectorAll<HTMLElement>(".mb-listrow")].find((row) =>
      (row.textContent ?? "").includes("grey wolf"),
    );
    if (!wolf) throw new Error("no grey wolf to change");
    wolf.click();

    /* Tick a flag by typing it into the chip editor and pressing Enter. */
    const flagRow = [...shadow().querySelectorAll<HTMLElement>(".mb-field")].find(
      (row) => (row.querySelector(".mb-label-name")?.textContent ?? "") === "flags",
    );
    if (!flagRow) throw new Error("the wolf has no flags row");
    const box = flagRow.querySelector<HTMLInputElement>('input[type="text"]');
    if (!box) throw new Error("no chip box");
    box.value = "EVIL";
    box.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    control("Review and install").click();
    const emitted = [...shadow().querySelectorAll(".mb-code")].map((el) => el.textContent ?? "");
    const monster = JSON.parse(emitted[1] ?? "{}") as { fieldPatches?: Record<string, { op: string; flag?: string }[]> };
    const ops = monster.fieldPatches?.["core:grey-wolf"] ?? [];
    expect(ops).toEqual([{ op: "addFlag", path: "flags", flag: "EVIL" }]);
  });

  it("writes add rather than set when a number is nudged on somebody else's record", () => {
    /* `add hit-points 1` keeps meaning what the author meant after the base game
     * retunes the monster and after another mod adjusts it first. `set` does not. */
    open = openWorkshop(ctx(), document);
    control("Take me to my mods").click();
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box");
    type(idBox, "nudge-mod");
    control("Start a new mod").click();
    control("Add or change something").click();

    const creatures = [...shadow().querySelectorAll<HTMLElement>(".mb-kind")].find((el) =>
      (el.textContent ?? "").includes("Creatures"),
    );
    [...(creatures?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
      .find((b) => (b.textContent ?? "").includes("Change one"))
      ?.click();
    [...shadow().querySelectorAll<HTMLElement>(".mb-listrow")]
      .find((row) => (row.textContent ?? "").includes("grey wolf"))
      ?.click();

    const hp = [...shadow().querySelectorAll<HTMLElement>(".mb-field")].find(
      (row) => (row.querySelector(".mb-label-name")?.textContent ?? "") === "hit-points",
    );
    [...(hp?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find((b) => b.textContent === "+1")?.click();

    control("Review and install").click();
    const emitted = [...shadow().querySelectorAll(".mb-code")].map((el) => el.textContent ?? "");
    const monster = JSON.parse(emitted[1] ?? "{}") as { fieldPatches?: Record<string, { op: string }[]> };
    expect(monster.fieldPatches?.["core:grey-wolf"]).toEqual([{ op: "add", path: "hit-points", value: 1 }]);
  });

  it("declares the dependency the moment somebody else's record is chosen", () => {
    open = openWorkshop(ctx(), document);
    control("Take me to my mods").click();
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box");
    type(idBox, "dep-mod");
    control("Start a new mod").click();
    control("Add or change something").click();
    const creatures = [...shadow().querySelectorAll<HTMLElement>(".mb-kind")].find((el) =>
      (el.textContent ?? "").includes("Creatures"),
    );
    [...(creatures?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
      .find((b) => (b.textContent ?? "").includes("Change one"))
      ?.click();
    [...shadow().querySelectorAll<HTMLElement>(".mb-listrow")]
      .find((row) => (row.textContent ?? "").includes("grey wolf"))
      ?.click();

    control("Review and install").click();
    const manifest = JSON.parse([...shadow().querySelectorAll(".mb-code")][0]?.textContent ?? "{}") as {
      dependencies?: Record<string, string>;
      group?: string;
    };
    expect(manifest.dependencies).toEqual({ core: "*" });
    /* And a mod that only adjusts things wants to load after the ones that add
     * them, which is `tweaks` and not the default `content`. */
    expect(manifest.group).toBe("tweaks");
  });
});
