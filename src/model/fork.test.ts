/**
 * Forking, and the one difference that has to keep holding.
 *
 * A fork OWNS its content: the records become the fork's own contributions,
 * emitted under `records`, and the mod they came from is not a dependency. That
 * is a different thing from the base-picker path the workshop has always had,
 * where a record stays its owner's and the draft ships a `fieldPatches` entry
 * against it - a change that is nothing without the pack it names. Both are
 * built here from the same source so the difference cannot be argued about.
 */

import { describe, expect, it } from "vitest";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import type { ComposedRecords, JsonRecord } from "../host/authoring.js";
import { emitDraft, manifestFor } from "./build.js";
import type { Draft } from "./draft.js";
import { newDraft } from "./draft.js";
import {
  FORKED_FROM,
  folderFromFiles,
  folderFromInstalled,
  forkDraft,
  forkInstalled,
  installedMods,
  rootFolder,
} from "./fork.js";
import type { ForkFolder, ForkOutcome } from "./fork.js";

const api = STUB_AUTHORING;
const NOW = "2026-09-06T00:00:00.000Z";
const ENGINE = "1.0.0";

/** The manifest of the mod being forked, as its folder carries it. */
const SOURCE_MANIFEST = {
  id: "neo-qol",
  name: "Quality of Life",
  version: "2.3.1",
  shape: "content",
  facets: ["content"],
  engine: ">=1.0.0",
  group: "content",
  dependencies: { core: "*" },
  affectsGameplay: true,
  description: "Small comforts.",
  author: "Somebody Else",
  license: "MIT",
  repository: "https://github.com/somebody-else/neo-qol",
};

const TIDY_KOBOLD: JsonRecord = {
  name: "tidy kobold",
  base: "kobold",
  color: "y",
  speed: 110,
  "hit-points": 12,
  "armor-class": 16,
  depth: 4,
  rarity: 1,
  experience: 6,
};

function sourceFolder(extra: Readonly<Record<string, string>> = {}): ForkFolder {
  return {
    "manifest.json": `${JSON.stringify(SOURCE_MANIFEST, null, 2)}\n`,
    "monster.json": `${JSON.stringify(
      {
        records: [TIDY_KOBOLD],
        fieldPatches: { "core:cave-rat": [{ op: "add", path: "speed", value: 2 }] },
      },
      null,
      2,
    )}\n`,
    "README.md": "# Quality of Life\n",
    ...extra,
  };
}

function unwrap(outcome: ForkOutcome): { draft: Draft; notes: readonly string[] } {
  if (!outcome.ok) throw new Error(`the fork was refused: ${outcome.why}`);
  return { draft: outcome.draft, notes: outcome.notes };
}

function emitted(draft: Draft, path: string): string {
  const file = emitDraft(api, draft).find((f) => f.path === path);
  if (file === undefined) throw new Error(`${path} was not emitted. Files: ${emitDraft(api, draft).map((f) => f.path).join(", ")}`);
  if (typeof file.contents !== "string") throw new Error(`${path} came out as bytes`);
  return file.contents;
}

function fork(folder: ForkFolder, id = "my-own-qol"): { draft: Draft; notes: readonly string[] } {
  return unwrap(forkDraft(api, folder, { id, engine: ENGINE, now: NOW, source: "file" }));
}

describe("forking a mod supplied as a file", () => {
  it("reproduces the source's content before anything is edited", () => {
    const { draft } = fork(sourceFolder());
    const monster = JSON.parse(emitted(draft, "monster.json")) as Record<string, unknown>;
    expect(monster["records"]).toEqual([TIDY_KOBOLD]);
    expect(monster["fieldPatches"]).toEqual({ "core:cave-rat": [{ op: "add", path: "speed", value: 2 }] });
  });

  it("carries a file no screen writes, exactly as it was", () => {
    expect(emitted(fork(sourceFolder()).draft, "README.md")).toBe("# Quality of Life\n");
  });

  it("takes an id of its own, and refuses to take the source's", () => {
    const { draft } = fork(sourceFolder());
    expect(draft.id).toBe("my-own-qol");
    expect(manifestFor(draft).id).not.toBe(SOURCE_MANIFEST.id);

    const refused = forkDraft(api, sourceFolder(), { id: "neo-qol", engine: ENGINE, now: NOW, source: "file" });
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.why).toContain("an id of its own");
  });

  it("never inherits the repository, because an install pins the origin it finds", () => {
    /* The update check later asks that repository for its tags. A fork that kept
     * the original's would point every copy of itself at a stranger's releases. */
    const { draft } = fork(sourceFolder());
    expect(draft.repository).toBe("local://my-own-qol");
    expect(draft.repository).not.toContain("github");
  });

  it("carries the licence and blanks the author", () => {
    const { draft } = fork(sourceFolder());
    expect(draft.license).toBe("MIT");
    expect(draft.author).toBe("");
  });

  it("records where it came from, in the manifest it ships", () => {
    const manifest = manifestFor(fork(sourceFolder()).draft) as unknown as Record<string, unknown>;
    expect(manifest[FORKED_FROM]).toEqual({
      source: "file",
      id: "neo-qol",
      version: "2.3.1",
      author: "Somebody Else",
      repository: "https://github.com/somebody-else/neo-qol",
    });
  });

  it("keeps the source's name, description and version", () => {
    const { draft } = fork(sourceFolder());
    expect(draft.name).toBe("Quality of Life");
    expect(draft.description).toBe("Small comforts.");
    expect(draft.version).toBe("2.3.1");
  });

  it("leaves a derived manifest key derived rather than freezing today's answer", () => {
    /* `dependencies` is worked out from what the mod touches. A fork that copied
     * the source's line and kept it as an override would ship a dependency list
     * that stopped moving the first time the fork patched something new, and a
     * mod whose dependencies are wrong installs, loads and does nothing. */
    const { draft } = fork(sourceFolder());
    expect(draft.manifestExtras?.["dependencies"]).toBeUndefined();
    expect(manifestFor(draft).dependencies).toEqual({ core: "*" });
  });

  it("says what it could not carry", () => {
    const { notes } = fork(sourceFolder());
    expect(notes.join(" ")).toContain("MIT");
    expect(notes.join(" ")).toContain("fork of neo-qol");
  });

  it("refuses a folder that is not a mod", () => {
    const refused = forkDraft(api, { "README.md": "nothing here" }, { id: "x", engine: ENGINE, now: NOW, source: "file" });
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.why).toContain("manifest.json");
  });

  it("refuses a record file it cannot read rather than losing what is in it", () => {
    const refused = forkDraft(
      api,
      { ...sourceFolder(), "monster.json": "{ this is not json" },
      { id: "my-own-qol", engine: ENGINE, now: NOW, source: "file" },
    );
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.why).toContain("monster.json");
  });
});

describe("forking is not basing on", () => {
  /** A mod that only adds a record of its own, so nothing muddies the comparison. */
  const adderOnly: ForkFolder = {
    "manifest.json": `${JSON.stringify({ ...SOURCE_MANIFEST, dependencies: {} }, null, 2)}\n`,
    "monster.json": `${JSON.stringify({ records: [TIDY_KOBOLD] }, null, 2)}\n`,
  };

  it("a fork owns the record, so it needs nobody declared and stands on its own", () => {
    const { draft } = fork(adderOnly);
    expect(manifestFor(draft).dependencies).toEqual({});
    const monster = JSON.parse(emitted(draft, "monster.json")) as Record<string, unknown>;
    expect(monster["records"]).toEqual([TIDY_KOBOLD]);
    expect(monster["fieldPatches"]).toBeUndefined();
  });

  it("adjusting the same record instead leaves it the other mod's, and names them", () => {
    const based: Draft = {
      ...newDraft("my-own-qol", ENGINE, NOW),
      changes: [{ kind: "patch", file: "monster", ref: "neo-qol:tidy-kobold", ops: [{ op: "add", path: "speed", value: 5 }] }],
    };
    expect(manifestFor(based).dependencies).toEqual({ "neo-qol": "*" });
    const monster = JSON.parse(emitted(based, "monster.json")) as Record<string, unknown>;
    expect(monster["records"]).toBeUndefined();
    expect(monster["fieldPatches"]).toEqual({ "neo-qol:tidy-kobold": [{ op: "add", path: "speed", value: 5 }] });
  });
});

describe("rootFolder", () => {
  it("re-roots a zip of a folder onto the level that holds the manifest", () => {
    const nested: ForkFolder = { "neo-qol/manifest.json": "{}", "neo-qol/monster.json": "{}" };
    expect(Object.keys(rootFolder(nested)).sort()).toEqual(["manifest.json", "monster.json"]);
  });

  it("leaves a folder that already has its manifest at the root alone", () => {
    const flat: ForkFolder = { "manifest.json": "{}", "lib/thing.js": "" };
    expect(rootFolder(flat)).toEqual(flat);
  });

  it("does not choose between two mods in one archive", () => {
    const two: ForkFolder = { "a/manifest.json": "{}", "b/manifest.json": "{}" };
    expect(Object.keys(rootFolder(two)).sort()).toEqual(["a/manifest.json", "b/manifest.json"]);
  });
});

describe("folderFromFiles", () => {
  it("reads text as text and keeps everything else as bytes", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0xfe]);
    const folder = folderFromFiles([
      { path: "manifest.json", contents: new TextEncoder().encode('{"id":"x"}') },
      { path: "tiles/a.png", contents: png },
    ]);
    expect(folder["manifest.json"]).toBe('{"id":"x"}');
    expect(folder["tiles/a.png"]).toBeInstanceOf(Uint8Array);
  });
});

/* ------------------------------------------------------------------ *
 * Forking a mod the game already has                                  *
 * ------------------------------------------------------------------ */

/**
 * The composed set as the game hands it over: core's untouched records carry no
 * stamp at all, and everything a mod touched carries one saying who.
 */
function installed(): ComposedRecords {
  return {
    monster: [
      { name: "cave rat", base: "rodent", speed: 110, depth: 1 },
      {
        ...TIDY_KOBOLD,
        speed: 130,
        $from: { owner: "neo-qol", modifiedBy: ["other-mod"], was: { speed: 110 } },
      },
      { name: "giant white mouse", base: "rodent", speed: 115, depth: 1, $from: { owner: "core", modifiedBy: ["neo-qol"] } },
      { name: "soldier ant", base: "ant", speed: 118, depth: 2, $from: { owner: "core", modifiedBy: ["neo-qol", "other-mod"] } },
    ],
  };
}

describe("installedMods", () => {
  it("finds every mod in the game from provenance, and never the base game", () => {
    expect(installedMods(api, installed())).toEqual([
      { id: "neo-qol", adds: 1, adjusts: 1, shared: 1 },
      { id: "other-mod", adds: 0, adjusts: 1, shared: 1 },
    ]);
  });
});

describe("forking a mod that is installed", () => {
  it("takes the mod's own version of its record, not the one another mod adjusted", () => {
    /* The composed record is 130 because another mod sped it up. Shipping that
     * inside the fork would put somebody else's balance change in it. */
    const read = folderFromInstalled(api, installed(), "neo-qol");
    const monster = JSON.parse(String(read.folder["monster.json"])) as { records: JsonRecord[] };
    expect(monster.records[0]?.["speed"]).toBe(110);
  });

  it("never carries the stamp saying who composed the record", () => {
    const read = folderFromInstalled(api, installed(), "neo-qol");
    expect(String(read.folder["monster.json"])).not.toContain("$from");
  });

  it("takes a record it adjusts alone as a replacement, named by its owner", () => {
    const read = folderFromInstalled(api, installed(), "neo-qol");
    const monster = JSON.parse(String(read.folder["monster.json"])) as { replaces: Record<string, JsonRecord> };
    expect(Object.keys(monster.replaces)).toEqual(["core:giant-white-mouse"]);
    expect(monster.replaces["core:giant-white-mouse"]?.["speed"]).toBe(115);
  });

  it("leaves out a record two mods both adjust, and says so", () => {
    const read = folderFromInstalled(api, installed(), "neo-qol");
    expect(String(read.folder["monster.json"])).not.toContain("soldier ant");
    expect(read.notes.join(" ")).toContain("adjusted by another mod as well");
  });

  it("produces a draft with its own id that emits the mod's content", () => {
    const { draft, notes } = unwrap(forkInstalled(api, installed(), "neo-qol", { id: "my-own-qol", engine: ENGINE, now: NOW }));
    expect(draft.id).toBe("my-own-qol");
    const monster = JSON.parse(emitted(draft, "monster.json")) as { records: JsonRecord[] };
    expect(monster.records[0]?.["name"]).toBe("tidy kobold");
    expect(notes.join(" ")).toContain("licence");
  });

  it("records that it was forked from a mod in the game", () => {
    const { draft } = unwrap(forkInstalled(api, installed(), "neo-qol", { id: "my-own-qol", engine: ENGINE, now: NOW }));
    expect((manifestFor(draft) as unknown as Record<string, unknown>)[FORKED_FROM]).toEqual({
      source: "installed",
      id: "neo-qol",
    });
  });

  it("refuses a mod with nothing in the game to take", () => {
    const refused = forkInstalled(api, installed(), "nobody", { id: "my-own-qol", engine: ENGINE, now: NOW });
    expect(refused.ok).toBe(false);
    if (!refused.ok) expect(refused.why).toContain("nothing in the running game");
  });
});
