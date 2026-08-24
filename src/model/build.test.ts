/**
 * From a draft to files, and the attribution that makes the check honest.
 */

import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import { STUB_RECORDS } from "../host/stub-content.js";
import { basePacks, buildDraft, emitDraft, manifestFor, zipDraft } from "./build.js";
import { newDraft } from "./draft.js";
import type { Draft } from "./draft.js";

const api = STUB_AUTHORING;

/** Every file the stub composer emits is JSON text; this narrows the type for it. */
function asText(contents: string | Uint8Array | undefined): string {
  if (typeof contents !== "string") throw new Error("expected text contents");
  return contents;
}

function draftWith(changes: Draft["changes"]): Draft {
  return {
    ...newDraft("my-mod", "0.25.0", "2026-08-21T00:00:00.000Z"),
    author: "somebody",
    changes,
  };
}

describe("manifestFor", () => {
  it("ships as a content pack, because the workshop writes no code", () => {
    const manifest = manifestFor(draftWith([]));
    expect(manifest.shape).toBe("content");
    expect(manifest.facets).toEqual(["content"]);
  });

  it("says it affects gameplay, because everything the workshop can change does", () => {
    expect(manifestFor(draftWith([])).affectsGameplay).toBe(true);
  });

  it("carries the dependency the moment something of the base game's is adjusted", () => {
    const manifest = manifestFor(draftWith([{ kind: "patch", file: "object", ref: "core:sword--dagger", ops: [] }]));
    expect(manifest.dependencies).toEqual({ core: "*" });
  });
});

describe("emitDraft", () => {
  it("writes the manifest and one file per record file, as the folder reader expects", () => {
    const files = emitDraft(
      api,
      draftWith([
        { kind: "add", file: "monster", record: { name: "carpenter ant", base: "ant", depth: 2 } },
        { kind: "patch", file: "object", ref: "core:sword--dagger", ops: [{ op: "mul", path: "cost", value: 10 }] },
      ]),
    );
    expect(files.map((f) => f.path)).toEqual(["manifest.json", "monster.json", "object.json"]);
    for (const file of files) expect(asText(file.contents).endsWith("\n")).toBe(true);

    const monster = JSON.parse(asText(files[1]?.contents ?? "{}")) as { records?: unknown[] };
    expect(monster.records).toHaveLength(1);

    const object = JSON.parse(asText(files[2]?.contents ?? "{}")) as { fieldPatches?: Record<string, unknown[]> };
    expect(object.fieldPatches?.["core:sword--dagger"]).toEqual([{ op: "mul", path: "cost", value: 10 }]);
  });

  it("is readable as a zip by the reader the game uses", () => {
    const files = emitDraft(api, draftWith([{ kind: "add", file: "monster", record: { name: "x", base: "ant", depth: 1 } }]));
    const out = unzipSync(zipDraft(files));
    expect(Object.keys(out).sort()).toEqual(["manifest.json", "monster.json"]);
  });

  it("carries a binary extra - a tile, in this case - through untouched, next to ordinary text files", () => {
    /* Not a whole valid PNG, just its signature plus a few bytes that are not
     * valid UTF-8 on their own (0x89), so a codec that quietly treated this as
     * text anywhere along the way would corrupt it rather than merely mangling
     * something readable. */
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
    const source: Draft = {
      ...draftWith([{ kind: "add", file: "monster", record: { name: "x", base: "ant", depth: 1 } }]),
      extras: { "tiles/hero.png": png },
    };

    const files = emitDraft(api, source);
    expect(files.map((f) => f.path)).toEqual(["manifest.json", "monster.json", "tiles/hero.png"]);

    const tile = files.find((f) => f.path === "tiles/hero.png");
    expect(tile?.contents).toBeInstanceOf(Uint8Array);
    expect([...((tile?.contents as Uint8Array) ?? [])]).toEqual([...png]);

    /* The text files next to it are unaffected: still strings, still JSON. */
    const monster = files.find((f) => f.path === "monster.json");
    expect(typeof monster?.contents).toBe("string");
    expect(() => JSON.parse(asText(monster?.contents))).not.toThrow();

    /* And the zip carries the bytes exactly, which is the round trip that matters:
     * this is what the mod manager's own reader will unzip on install. */
    const out = unzipSync(zipDraft(files));
    expect(Object.keys(out).sort()).toEqual(["manifest.json", "monster.json", "tiles/hero.png"]);
    expect([...(out["tiles/hero.png"] ?? [])]).toEqual([...png]);
  });
});

describe("basePacks", () => {
  it("splits the loaded records by the pack that owns them", () => {
    /* NOT one pretend pack called core. A mod may only adjust a record whose
     * owner it declares, so folding everything into core would make a patch
     * against another mod's record look permitted when the real composer refuses
     * it - and a refused change costs the change silently. */
    const records = {
      monster: [{ name: "a" }, { name: "b", $from: { owner: "qol" } }],
    };
    const packs = basePacks(api, records);
    expect(packs.map((p) => p.manifest.id)).toEqual(["core", "qol"]);
    expect(packs[0]?.files["monster"]?.records).toHaveLength(1);
    expect(packs[1]?.files["monster"]?.records).toHaveLength(1);
  });

  it("handles a file no mod has touched", () => {
    expect(basePacks(api, STUB_RECORDS).map((p) => p.manifest.id)).toEqual(["core"]);
  });
});

describe("buildDraft", () => {
  it("reports a patch whose target does not exist, rather than emitting it quietly", () => {
    const build = buildDraft(api, draftWith([{ kind: "patch", file: "monster", ref: "core:no-such-thing", ops: [] }]), STUB_RECORDS);
    expect(build.problems.join(" ")).toContain("no-such-thing");
  });

  it("applies a patch whose target does exist", () => {
    const build = buildDraft(
      api,
      draftWith([{ kind: "patch", file: "monster", ref: "core:grey-wolf", ops: [{ op: "add", path: "hit-points", value: 5 }] }]),
      STUB_RECORDS,
    );
    expect(build.problems).toEqual([]);
    const wolf = (build.composed?.["monster"] ?? []).find(
      (r) => (r as { name?: string }).name === "grey wolf",
    ) as { "hit-points"?: number } | undefined;
    expect(wolf?.["hit-points"]).toBe(35);
  });

  it("finds the collision a new record creates against the loaded game", () => {
    const build = buildDraft(api, draftWith([{ kind: "add", file: "monster", record: { name: "grey wolf", base: "canine", depth: 10 } }]), STUB_RECORDS);
    expect(build.ok).toBe(false);
    expect(build.findings.some((f) => f.rule === "record/ambiguous")).toBe(true);
  });

  it("finds a base that no loaded pack defines", () => {
    const build = buildDraft(api, draftWith([{ kind: "add", file: "monster", record: { name: "aunt lizzie", base: "aunt", depth: 2 } }]), STUB_RECORDS);
    expect(build.findings.some((f) => f.rule === "reference/dangling")).toBe(true);
    expect(build.ok).toBe(false);
  });

  it("warns about a monster with no depth, which would exist and never be met", () => {
    const build = buildDraft(api, draftWith([{ kind: "add", file: "monster", record: { name: "quiet thing", base: "ant" } }]), STUB_RECORDS);
    expect(build.findings.some((f) => f.rule === "monster/no-depth")).toBe(true);
  });

  it("is clean for a record that is actually fine", () => {
    const build = buildDraft(
      api,
      draftWith([{ kind: "add", file: "monster", record: { name: "carpenter ant", base: "ant", depth: 3, "hit-points": 9, "armor-class": 18, speed: 110, sleepiness: 80, rarity: 1, experience: 5, hearing: 10 } }]),
      STUB_RECORDS,
    );
    expect(build.findings.filter((f) => f.level === "error")).toEqual([]);
    expect(build.ok).toBe(true);
  });

  it("says out loud that its checks are not the game's", () => {
    /* The stub's whole safety argument. A clean report from a checker that is not
     * the game's must not read like a promise. */
    const build = buildDraft(api, draftWith([]), STUB_RECORDS);
    expect(build.findings.some((f) => f.rule === "stub/not-the-real-checker")).toBe(true);
  });
});
