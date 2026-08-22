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

/**
 * Let the debounced check run and the screen repaint.
 *
 * A REAL WAIT rather than a couple of microtasks: `scheduleCheck` uses a timer,
 * and the verdict screen's buttons are disabled until its result lands. A test
 * that only flushed microtasks would find them disabled and could only ever assert
 * that - which is why the disabled path was the only one covered before this.
 *
 * Comfortably longer than `CHECK_DELAY` (250ms, actions.ts), because the check
 * itself composes and validates the draft after the timer fires. Sixty
 * milliseconds was tried and failed on the timer alone.
 */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
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
  /**
   * Open the workshop and click all the way to a drafted record.
   *
   * `extra` goes to the context, so a test that needs a seam gets one for the ONE
   * workshop this opens. Reopening afterwards was tried and is wrong: closing
   * leaves the previous host in the document, `getElementById` finds it, and every
   * later assertion reads an empty shadow root full of stylesheet.
   */
  function walkToTheEditor(extra: Partial<BuilderCtx> = {}): void {
    open = openWorkshop(ctx(extra), document);

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

    /* And none of its attacks. The FIELD is there, because almost every creature
     * in the game has one and a record without it is missing something; what is
     * not there is the wolf's own bites. Shape and scale carry over, powers do
     * not, and the difference between "no blow field" and "an empty blow field"
     * is the difference between a broken record and a record waiting for you. */
    expect(values["blow"]).toBeUndefined();
    const blowRow = [...shadow().querySelectorAll<HTMLElement>(".mb-field")].find(
      (row) => (row.querySelector(".mb-label-name")?.textContent ?? "") === "blow",
    );
    expect(blowRow).toBeDefined();
    expect(blowRow?.querySelectorAll(".mb-row")).toHaveLength(0);
  });

  it("names a record that has not been named yet, rather than diagnosing it", () => {
    /* "(no identity)" is the right answer to "can the game address this" and the
     * wrong answer to "what is this row in my own list of work". */
    walkToTheEditor();
    const rail = shadow().querySelector(".mb-listrow-name")?.textContent ?? "";
    expect(rail).toBe("(not named yet)");
    expect(rail).not.toContain("no identity");
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

    control("Review it").click();
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
    control("Review it").click();
    expect(screenText()).toContain("Import a zip");
    const forge = control("Forge and install") as HTMLButtonElement;
    expect(forge.disabled).toBe(true);
    expect((control("Save it as a file") as HTMLButtonElement).disabled).toBe(false);
  });

  it("says why trying it is unavailable, rather than greying the button in silence", () => {
    walkToTheEditor();
    type(fieldInput("name"), "dire wolf");
    control("Review it").click();
    expect((control("Forge it and play it now") as HTMLButtonElement).disabled).toBe(true);
    /* The reason, in the same place the install reason goes: a control that is off
     * because this game has no door for it is a different situation from one that
     * is off because the mod is unfinished, and only one of them has a next step. */
    expect(screenText()).toContain("no way to load a mod for one session");
  });

  it("has its primary action live on the FIRST paint of the review screen", () => {
    /* THE CHECK USED TO BE DEBOUNCED HERE and this test used to wait for it, with a
     * comment explaining that the button is disabled on the first paint. That was
     * the friction, written down and accepted: the screen is rebuilt from scratch on
     * every visit, so the primary action was grey for a quarter of a second exactly
     * when the player's hand arrived on it, every single visit. Arriving now checks
     * on the spot; typing is still debounced, which is what the debounce is for. */
    walkToTheEditor({
      loadModForSession: () =>
        Promise.resolve({ ok: true as const, id: "my-first-mod", version: "0.1.0", survivesReload: true }),
    });
    type(fieldInput("name"), "dire wolf");
    control("Review it").click();
    expect((control("Forge it and play it now") as HTMLButtonElement).disabled).toBe(false);
  });

  it("stages the mod and reloads the game itself, rather than asking for Ctrl-R", async () => {
    /* THE WHOLE LOOP IS ONE CLICK NOW. It used to be four actions and a wait - leave
     * what you were doing for the review screen, wait out the debounce, press the
     * button, find Close, press Ctrl-R - of which none was a decision. The workshop
     * was holding a `reload` it never called and telling the player to do it, when
     * reloading was never a capability anybody grants: a plugin's code runs in the
     * page and can reach `location` either way. */
    const staged: Uint8Array[] = [];
    let reloaded = 0;
    walkToTheEditor({
      loadModForSession: (bytes) => {
        staged.push(bytes);
        return Promise.resolve({
          ok: true as const,
          id: "my-first-mod",
          version: "0.1.0",
          survivesReload: true,
        });
      },
      reload: () => {
        reloaded += 1;
      },
    });
    type(fieldInput("name"), "dire wolf");

    /* FROM THE STATUS BAR, which is on every screen a draft is open on - so this is
     * the whole loop from wherever the author already was, without visiting review
     * at all. Review did not go away; looking first is no longer compulsory. */
    control("Try it in the game").click();
    await settle();

    /* REAL BYTES, and a real archive - a stub that took no arguments would let the
     * emitter break without this noticing. */
    expect(staged).toHaveLength(1);
    expect((staged[0]?.length ?? 0)).toBeGreaterThan(0);
    expect(reloaded).toBe(1);
  });

  it("still says what a session load does and does not mean, before it is pressed", () => {
    /* THE SENTENCE MOVED, IT DID NOT GO. The success notice used to carry it, and a
     * notice that is immediately followed by a reload is a notice nobody reads. So
     * it is on the control instead, where it is read BEFORE the decision rather than
     * after it - which is the better place for it anyway. */
    walkToTheEditor({
      loadModForSession: () =>
        Promise.resolve({ ok: true as const, id: "my-first-mod", version: "0.1.0", survivesReload: true }),
    });
    type(fieldInput("name"), "dire wolf");
    const tip = control("Try it in the game").dataset["tip"] ?? "";
    expect(tip).toContain("not added to your mods");
    expect(tip).toContain("gone when you close the game");
    /* AND THE HALF THAT IS EASY TO DROP. "It is gone when you close the game" on
     * its own reads as a safety feature; the sentence has to carry the other half or
     * the workshop is telling the player something untrue by omission. */
    expect(tip).toContain("What it does to the character who plays it is not");
  });

  it("refuses to promise a reload the browser cannot survive", async () => {
    let reloaded = 0;
    walkToTheEditor({
      loadModForSession: () =>
        Promise.resolve({
          ok: true as const,
          id: "my-first-mod",
          version: "0.1.0",
          /* A window with storage switched off: the mod is staged for THIS page and
           * lost on the way back up, so the loop the workshop would otherwise send
           * the player round cannot finish. */
          survivesReload: false,
        }),
      reload: () => {
        reloaded += 1;
      },
    });
    type(fieldInput("name"), "dire wolf");
    control("Review it").click();
    (control("Forge it and play it now") as HTMLButtonElement).click();
    await settle();

    const said = screenText();
    expect(said).toContain("cannot be tried this way here");
    /* Pointed at the door that does work rather than left as a refusal. */
    expect(said).toContain("install it instead");
    /* AND NOT RELOADED, which is the part that would turn a readable refusal into a
     * mystery: the reload would throw the staged mod away and land the player
     * somewhere that looks like a failure with nothing on screen to say so. */
    expect(reloaded).toBe(0);
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

/**
 * The test panel, whose whole promise is that nothing works until the player has
 * given something up on purpose.
 *
 * THE PANEL IS NOW REACHABLE BEFORE IT IS USABLE, which the old one was not, and
 * that is the change these tests are mostly about. Its route used to be gated on
 * the seam being fully live, so on every shipped engine the screen existed and no
 * button anywhere led to it - the placehold* that was supposed to explain the
 * situation was, in practice, invisible. The explanation and the button that spends
 * the session are the first thing on it, so a route that only opened afterwards
 * would be a route to a screen nobody needed.
 */
describe("the test panel", () => {
  /** A wizard surface over a fixed catalogue, recording what was asked of it. */
  function fakeWizard(): NonNullable<BuilderCtx["wizard"]> & { readonly done: string[] } {
    const done: string[] = [];
    let loose = false;
    const ok = (what: string) => {
      done.push(what);
      return { ok: true as const, did: what };
    };
    const gate = (what: string) =>
      loose ? ok(what) : { ok: false as const, problem: `${what} needs the session cut loose` };
    return {
      done,
      sandboxed: () => loose,
      attached: () => (loose ? null : { name: "Beren" }),
      sandbox: () => {
        loose = true;
        return ok("cut loose");
      },
      catalogue: () => ({
        creatures: [
          { name: "grey wolf", index: 1, level: 10 },
          { name: "aardvark", index: 2, level: 2 },
          { name: "dire wolf", index: 3, level: 25, from: "my-first-mod" },
        ],
        items: [{ name: "Wooden Torch", index: 1, level: 1 }],
        artifacts: [],
      }),
      where: () => ({
        depth: 3,
        maxDepth: 100,
        level: 7,
        experience: 120,
        gold: 45,
        stats: [
          { name: "STR", value: 16 },
          { name: "INT", value: 10 },
        ],
      }),
      spawnItem: (which) => gate(`spawnItem ${String(which)}`),
      spawnCreature: (which, quantity) => gate(`spawnCreature ${String(which)} x${quantity ?? 1}`),
      spawnArtifact: (which) => gate(`spawnArtifact ${String(which)}`),
      goToDepth: (depth) => gate(`goToDepth ${depth}`),
      grantExperience: (amount) => gate(`grantExperience ${amount}`),
      setExperience: (value) => gate(`setExperience ${value}`),
      setGold: (value) => gate(`setGold ${value}`),
      setStat: (stat, value) => gate(`setStat ${stat} ${value}`),
      maxOut: () => gate("maxOut"),
      heal: () => gate("heal"),
      rerollLife: () => gate("rerollLife"),
      acquire: (quantity, great) => gate(`acquire ${quantity} ${great === true}`),
      summonRandom: (quantity) => gate(`summonRandom ${quantity}`),
      banish: (range) => gate(`banish ${range ?? "all"}`),
      killVisible: () => gate("killVisible"),
      teleport: (range) => gate(`teleport ${range}`),
      mapLevel: () => gate("mapLevel"),
      lightLevel: () => gate("lightLevel"),
      findCreatures: () => gate("findCreatures"),
      learnItems: (upTo) => gate(`learnItems ${upTo ?? "all"}`),
      learnCreatures: () => gate("learnCreatures"),
    };
  }

  /** Open the workshop with the seam live and land on the test panel. */
  function openTestPanel(over: Partial<BuilderCtx> = {}): ReturnType<typeof fakeWizard> {
    const wizard = fakeWizard();
    open = openWorkshop(
      ctx({
        flags: { "builder.showTab": true, "builder.keepDrafts": true, "builder.cheatSpawn": true },
        wizard,
        state: {},
        ...over,
      }),
      document,
    );
    control("Take me to my mods").click();
    const idBox = shadow().querySelector<HTMLInputElement>('input[type="text"]');
    if (!idBox) throw new Error("no id box on the mod list");
    type(idBox, "my-first-mod");
    control("Start a new mod").click();
    control("Test it in the game").click();
    return wizard;
  }

  it("is reachable, and says what it costs, before anything has been spent", () => {
    const wizard = openTestPanel();
    const said = screenText();
    /* THE CHARACTER IS NAMED, because a question that could not name them would be
     * one nobody can weigh. */
    expect(said).toContain("Beren");
    expect(said).toContain("off until this session stops being saved");
    expect(said).toContain("cannot be undone");
    expect(wizard.done).toEqual([]); // nothing has happened yet
  });

  it("leaves every command dead until the session is cut loose", () => {
    const wizard = openTestPanel();
    const live = [...shadow().querySelectorAll<HTMLButtonElement>(".mb-list button, .mb-listrow")].filter(
      (b) => !b.disabled,
    );
    expect(live).toEqual([]);
    /* Pressing one anyway does nothing, which is the assertion that matters: a
     * disabled attribute is a hint to a mouse, not a gate. */
    control("Map this level").click();
    control("dire wolf", ".mb-listrow").click();
    expect(wizard.done).toEqual([]);
  });

  it("brings the whole set to life once it has been, and only then", () => {
    const wizard = openTestPanel();
    control("Stop saving, and let me test").click();
    expect(wizard.done).toEqual(["cut loose"]);

    control("Map this level").click();
    control("Heal and cure").click();
    control("dire wolf", ".mb-listrow").click();
    expect(wizard.done).toEqual(["cut loose", "mapLevel", "heal", "spawnCreature dire wolf x1"]);
  });

  it("offers a handful at once without making the author type a number", () => {
    const wizard = openTestPanel();
    control("Stop saving, and let me test").click();
    control("x5", ".mb-listrow button").click();
    expect(wizard.done).toContain("spawnCreature dire wolf x5");
  });

  it("cannot be armed twice", () => {
    const wizard = openTestPanel();
    const arm = control("Stop saving, and let me test") as HTMLButtonElement;
    arm.click();
    expect(arm.disabled).toBe(true);
    arm.click();
    expect(wizard.done).toEqual(["cut loose"]);
  });

  it("shows the author's own content and nothing else, when one pack added any", () => {
    /* THE DEFAULT IS THE WHOLE POINT OF THE BROWSER. An author has just written a
     * monster; the list they need is not six hundred entries with theirs somewhere
     * in it. One pack in play is overwhelmingly the draft they just forged, so that
     * is what the filter starts on. */
    openTestPanel();
    expect(rowNames()).toEqual(["dire wolf"]);
    expect(screenText()).toContain("1 of 3");
  });

  it("has the whole game behind that, not instead of it", () => {
    /* NOT LIMITED TO THE MOD'S OWN CONTENT: the filter can be turned off, and the
     * thing an author most often wants to test against is whatever their record is
     * supposed to resemble. */
    openTestPanel();
    setPack("");
    /* Mine first, then the game's - read off each record's own provenance, so the
     * workshop keeps no list of what the base game contains, which is a list that
     * would be wrong the first time the game added a monster. Then by DEPTH rather
     * than alphabetically, because "what else lives at this depth" is the comparison
     * an author is actually making. */
    expect(rowNames()).toEqual(["dire wolf", "aardvark", "grey wolf"]);
  });

  it("switches between creatures, items and artifacts", () => {
    /* An option's value is not its label, and `dom.ts` used to drop it - which made
     * every `select.value` in the workshop report its own text. This is the
     * regression test for the fix as much as for the picker. */
    openTestPanel();
    setPack("");
    setKind("item");
    expect(rowNames()).toEqual(["Wooden Torch"]);
    setKind("artifact");
    expect(rowNames()).toEqual([]);
  });

  it("marks which pack a row came from, rather than leaving it to be guessed", () => {
    openTestPanel();
    const mine = [...shadow().querySelectorAll<HTMLElement>(".mb-listrow")].find((row) =>
      (row.querySelector(".mb-listrow-name")?.textContent ?? "") === "dire wolf",
    );
    expect(mine?.querySelector(".mb-tag")?.textContent).toBe("my-first-mod");
  });

  it("says where the character is, so a depth is a decision and not a guess", () => {
    openTestPanel();
    const said = screenText();
    expect(said).toContain("Dungeon level 3");
    expect(said).toContain("character level 7");
    expect(said).toContain("STR 16");
  });

  it("sends a typed depth through as typed", () => {
    const wizard = openTestPanel();
    control("Stop saving, and let me test").click();
    const depth = [...shadow().querySelectorAll<HTMLElement>(".mb-field")].find(
      (row) => (row.querySelector(".mb-label-name")?.textContent ?? "") === "dungeon level",
    );
    const box = depth?.querySelector<HTMLInputElement>("input");
    if (!box) throw new Error("no depth field on the test panel");
    type(box, "40");
    control("Go there").click();
    expect(wizard.done).toContain("goToDepth 40");
  });

  it("hands an unreadable number on as NaN rather than as zero", () => {
    /* Zero is a real depth - it is the town - so a mistyped field that arrived as
     * zero would quietly do something rather than be refused. The host's own
     * refusal says "that is not a dungeon level"; the workshop's job is only to not
     * launder the mistake into a legal value. */
    const wizard = openTestPanel();
    control("Stop saving, and let me test").click();
    const depth = [...shadow().querySelectorAll<HTMLElement>(".mb-field")].find(
      (row) => (row.querySelector(".mb-label-name")?.textContent ?? "") === "dungeon level",
    );
    const box = depth?.querySelector<HTMLInputElement>("input");
    if (!box) throw new Error("no depth field on the test panel");
    type(box, "deep");
    control("Go there").click();
    expect(wizard.done).toContain("goToDepth NaN");
  });

  /** Every row's name, in the order the browser is showing them. */
  function rowNames(): string[] {
    return [...shadow().querySelectorAll(".mb-listrow-name")].map((el) => el.textContent ?? "");
  }

  /** Pick one of the browser's two selects by the options it holds. */
  function pick(has: string): HTMLSelectElement {
    const found = [...shadow().querySelectorAll<HTMLSelectElement>("select")].find((select) =>
      [...select.options].some((option) => option.value === has),
    );
    if (!found) throw new Error(`no select offering "${has}"`);
    return found;
  }

  function setPack(value: string): void {
    const select = pick("");
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setKind(value: string): void {
    const select = pick("creature");
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  it("says the engine has no such seam, on a reachable screen, when it has not", () => {
    /* The refusal a player on a shipped engine without the capability actually sees.
     * It used to be on a screen nothing led to. */
    open = openWorkshop(
      ctx({ flags: { "builder.showTab": true, "builder.cheatSpawn": true } }),
      document,
    );
    control("Take me to my mods").click();
    expect(buttonNames()).not.toContain("Test it in the game");
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

    control("Review it").click();
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

    control("Review it").click();
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

    control("Review it").click();
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
