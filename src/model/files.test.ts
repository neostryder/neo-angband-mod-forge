/**
 * The mod as files, and the promise that it is the same mod either way.
 *
 * THE PROPERTY EVERYTHING ELSE RESTS ON is that reading a file and writing it back
 * unchanged leaves the draft alone. If that is not true then the two views are not
 * two views, they are two documents that resemble each other, and every later
 * guarantee - the stale check, the undo, the emitted zip - is built on sand. It is
 * asserted below for every shape of change there is, and for all of them at once.
 */

import { describe, expect, it } from "vitest";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import { emitDraft, manifestFor } from "./build.js";
import type { Draft } from "./draft.js";
import { newDraft } from "./draft.js";
import {
  classify,
  deleteFile,
  fileText,
  isCodePath,
  MANIFEST,
  pathProblem,
  pathShapeProblem,
  projectFiles,
  scriptFiles,
  sessionRefusal,
  unread,
  writeFileText,
} from "./files.js";

const api = STUB_AUTHORING;

function draft(): Draft {
  return {
    ...newDraft("test-mod", "0.25.0", "2026-01-01T00:00:00.000Z"),
    author: "somebody",
  };
}

/** A draft with one of everything, so a round-trip has all four kinds to survive. */
function busy(): Draft {
  return {
    ...draft(),
    changes: [
      { kind: "add", file: "monster", record: { name: "dire wolf", depth: 12 } },
      { kind: "patch", file: "monster", ref: "core:grey-wolf", ops: [{ op: "set", path: "speed", value: 130 }] },
      { kind: "add", file: "object", record: { name: "odd stick" } },
      { kind: "remove", file: "monster", ref: "core:cave-spider" },
      { kind: "replace", file: "object", ref: "core:dagger", record: { name: "dagger", cost: 1 } },
    ],
  };
}

/** A stable order for comparing two change lists as sets rather than as sequences. */
function byShape(a: Draft["changes"][number], b: Draft["changes"][number]): number {
  return JSON.stringify(a).localeCompare(JSON.stringify(b));
}

/** Write every file of a draft straight back, and hand back what came out. */
function rewriteEverything(source: Draft): Draft {
  let current = source;
  for (const file of projectFiles(api, source)) {
    const outcome = writeFileText(api, current, file.path, file.contents);
    if (!outcome.ok) throw new Error(`${file.path} would not write back: ${outcome.why}`);
    current = outcome.draft;
  }
  return current;
}

describe("what kind of file a path is", () => {
  it("is decided by the path and by nothing else", () => {
    expect(classify(api, "manifest.json")).toBe("manifest");
    expect(classify(api, "monster.json")).toBe("records");
    expect(classify(api, "object.json")).toBe("records");
    /* Nested, so the game reads it as an asset the mod fetches for itself rather
     * than as records - which is the game's own rule and the reason for the test. */
    expect(classify(api, "data/spawns.json")).toBe("extra");
    expect(classify(api, "plugin.js")).toBe("extra");
    expect(classify(api, "lib/dice.js")).toBe("extra");
    expect(classify(api, "README.md")).toBe("extra");
    /* A top-level JSON that is not a record file the game knows. */
    expect(classify(api, "notes.json")).toBe("extra");
  });

  it("knows which paths the game will run as code, at any depth", () => {
    expect(isCodePath("plugin.js")).toBe(true);
    expect(isCodePath("lib/deep/thing.mjs")).toBe(true);
    expect(isCodePath("data/x.wasm")).toBe(true);
    expect(isCodePath("monster.json")).toBe(false);
  });
});

describe("the folder a draft would ship", () => {
  it("leads with the manifest, and is the same list the emitter writes", () => {
    const files = projectFiles(api, busy());
    expect(files[0]?.path).toBe(MANIFEST);
    expect(files.map((file) => file.path)).toEqual(emitDraft(api, busy()).map((file) => file.path));
    expect(files.map((file) => file.path)).toContain("monster.json");
    expect(files.map((file) => file.path)).toContain("object.json");
  });

  it("shows a file the author wrote, exactly as they wrote it", () => {
    const source = "export default { api: 1 };\n";
    const outcome = writeFileText(api, draft(), "plugin.js", source);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(fileText(api, outcome.draft, "plugin.js")).toBe(source);
    expect(emitDraft(api, outcome.draft).find((file) => file.path === "plugin.js")?.contents).toBe(source);
  });
});

describe("reading a file and writing it straight back", () => {
  /**
   * THE PROPERTY IS ABOUT THE FOLDER, not about the order of the change list, and
   * the difference is worth being exact about. A file is one piece of text, so the
   * changes belonging to one file necessarily come back out of it next to each
   * other - a draft whose monster and object changes were interleaved has them
   * grouped after a rewrite. Nothing about the mod moves: the emitter groups by file
   * anyway, so the folder is identical byte for byte, and the folder is what ships.
   * What does move is the order of the rows on the details screen, which is why the
   * grouping happens at the position of the file's FIRST change rather than at the
   * end - see `spliceFile`.
   */
  it("changes nothing about the folder, for every kind of change there is", () => {
    const before = busy();
    const after = rewriteEverything(before);
    expect(emitDraft(api, after)).toEqual(emitDraft(api, before));
    expect(manifestFor(after)).toEqual(manifestFor(before));
    expect(after.changes).toHaveLength(before.changes.length);
    expect([...after.changes].sort(byShape)).toEqual([...before.changes].sort(byShape));
  });

  it("changes nothing the second time either, so it settles rather than drifting", () => {
    const once = rewriteEverything(busy());
    const twice = rewriteEverything(once);
    expect(emitDraft(api, twice)).toEqual(emitDraft(api, once));
  });

  it("keeps two patches against one reference as the one entry the file shows", () => {
    /* The emitted file has one `fieldPatches` entry per reference with both ops in
     * it, so writing it back has to produce one change and not two. Two would ship
     * the same ops twice on the next emit, which is the sort of doubling that is
     * invisible until a number is applied twice. */
    const source: Draft = {
      ...draft(),
      changes: [
        { kind: "patch", file: "monster", ref: "core:grey-wolf", ops: [{ op: "set", path: "speed", value: 130 }] },
        { kind: "patch", file: "monster", ref: "core:grey-wolf", ops: [{ op: "add", path: "depth", value: 2 }] },
      ],
    };
    const after = rewriteEverything(source);
    expect(after.changes).toHaveLength(1);
    expect(after.changes[0]).toMatchObject({ kind: "patch", ref: "core:grey-wolf" });
    expect(emitDraft(api, after)).toEqual(emitDraft(api, source));
  });

  it("leaves other files' changes where they were, rather than shuffling them", () => {
    const source = busy();
    const monster = fileText(api, source, "monster.json") ?? "";
    const outcome = writeFileText(api, source, "monster.json", monster);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    /* The object changes were at positions 2 and 4 and the monster ones around
     * them. Rewriting one file must not renumber the rest, because the record
     * editor addresses a change by its index. */
    expect(outcome.draft.changes.filter((change) => change.file === "object")).toEqual(
      source.changes.filter((change) => change.file === "object"),
    );
  });
});

describe("editing a record file as text", () => {
  it("puts a hand-typed record into the mod, where the screens can see it", () => {
    const outcome = writeFileText(api, draft(), "monster.json", '{ "records": [ { "name": "grue", "depth": 40 } ] }');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.draft.changes).toEqual([{ kind: "add", file: "monster", record: { name: "grue", depth: 40 } }]);
  });

  it("takes everything out when the file is emptied", () => {
    const outcome = writeFileText(api, busy(), "monster.json", "");
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.draft.changes.some((change) => change.file === "monster")).toBe(false);
    expect(outcome.draft.changes.some((change) => change.file === "object")).toBe(true);
  });

  it("refuses text that is not JSON, and changes nothing", () => {
    const before = busy();
    const outcome = writeFileText(api, before, "monster.json", "{ nope");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.why).toContain("not valid JSON");
  });

  it("refuses a contribution of the wrong shape rather than half-applying it", () => {
    const outcome = writeFileText(api, draft(), "monster.json", '{ "records": { "not": "a list" } }');
    expect(outcome.ok).toBe(false);
  });

  /**
   * The key the draft cannot model. Carried rather than refused, and declared
   * rather than carried quietly: both halves are the decision, and a version that
   * did the first without the second would ship an unchecked contribution silently.
   */
  it("carries a key it cannot model through to the folder, and says that it did", () => {
    const outcome = writeFileText(
      api,
      draft(),
      "monster.json",
      '{ "records": [ { "name": "grue" } ], "sections": { "extras": { "records": [] } } }',
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(unread(outcome.draft)).toEqual([{ path: "monster.json", keys: ["sections"] }]);

    const written = emitDraft(api, outcome.draft).find((file) => file.path === "monster.json");
    const body = JSON.parse(written?.contents ?? "{}") as Record<string, unknown>;
    expect(body["sections"]).toEqual({ extras: { records: [] } });
    expect(body["records"]).toHaveLength(1);
  });

  it("forgets the unmodelled key once the author takes it out again", () => {
    const first = writeFileText(api, draft(), "monster.json", '{ "sections": { "a": {} } }');
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = writeFileText(api, first.draft, "monster.json", '{ "records": [] }');
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(unread(second.draft)).toEqual([]);
  });
});

describe("editing the manifest as text", () => {
  it("puts the fields the details screen owns back into the mod", () => {
    const text = fileText(api, draft(), MANIFEST) ?? "";
    const outcome = writeFileText(api, draft(), MANIFEST, text.replace('"test-mod"', '"test-mod"').replace(/"version": "[^"]*"/, '"version": "2.0.0"'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.draft.version).toBe("2.0.0");
  });

  it("keeps a key the workshop does not model, through this save and the next", () => {
    const text = (fileText(api, draft(), MANIFEST) ?? "").replace(
      '"id":',
      '"capabilities": ["registry:tiles"],\n  "id":',
    );
    const outcome = writeFileText(api, draft(), MANIFEST, text);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(manifestFor(outcome.draft)["capabilities"]).toEqual(["registry:tiles"]);

    /* And it is still there after the file has been read back and saved again,
     * which is the case a naive implementation loses it on. */
    const again = rewriteEverything(outcome.draft);
    expect(manifestFor(again)["capabilities"]).toEqual(["registry:tiles"]);
  });

  it("refuses a change of id, because the game would read it as a different mod", () => {
    const text = (fileText(api, draft(), MANIFEST) ?? "").replace('"test-mod"', '"other-mod"');
    const outcome = writeFileText(api, draft(), MANIFEST, text);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.why).toContain("different mod");
  });

  /**
   * A DERIVED VALUE THAT WAS NOT TOUCHED MUST NOT FREEZE. `dependencies` is worked
   * out from what the mod patches, so a save that recorded today's answer as an
   * override would go stale the moment the next record was patched - and a mod
   * whose dependencies are wrong installs, loads and silently does nothing.
   */
  it("does not turn an untouched derived value into a frozen override", () => {
    const source = draft();
    const text = fileText(api, source, MANIFEST) ?? "";
    const outcome = writeFileText(api, source, MANIFEST, text);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.draft.manifestExtras).toEqual({});

    const patched: Draft = {
      ...outcome.draft,
      changes: [{ kind: "patch", file: "monster", ref: "core:grey-wolf", ops: [] }],
    };
    expect(manifestFor(patched)["dependencies"]).toEqual({ core: "*" });
  });

  it("keeps a derived value the author DID change, as a deliberate override", () => {
    const text = (fileText(api, draft(), MANIFEST) ?? "").replace('"group": "tweaks"', '"group": "interface"');
    const outcome = writeFileText(api, draft(), MANIFEST, text);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(manifestFor(outcome.draft)["group"]).toBe("interface");
  });
});

describe("a mod that ships code", () => {
  function withPlugin(): Draft {
    const outcome = writeFileText(api, draft(), "plugin.js", "export default { api: 1 };\n");
    if (!outcome.ok) throw new Error(outcome.why);
    return outcome.draft;
  }

  /**
   * BOTH KEYS OR NEITHER. The host refuses to import a plugin.js unless the
   * manifest declares the plugin facet AND a modApi number, and the install-time
   * standards check refuses the whole mod for either one alone.
   */
  it("declares the plugin facet and the ABI number together, from one condition", () => {
    const manifest = manifestFor(withPlugin());
    expect(manifest.facets).toEqual(["content", "plugin"]);
    expect(manifest.shape).toBe("content");
    /* The validator requires the facet list to contain whatever `shape` says. */
    expect(manifest.facets).toContain(manifest.shape);
    expect(manifest.modApi).toBe(1);
  });

  it("declares neither when there is no code", () => {
    const manifest = manifestFor(draft());
    expect(manifest.facets).toEqual(["content"]);
    expect(manifest.modApi).toBeUndefined();
  });

  it("refuses a hand-edited manifest that would take the facet away", () => {
    const source = withPlugin();
    const text = (fileText(api, source, MANIFEST) ?? "").replace('"content",\n    "plugin"', '"content"');
    const outcome = writeFileText(api, source, MANIFEST, text);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.why).toContain("plugin");
  });

  it("cannot be tried for a session, and says why before the button is pressed", () => {
    expect(sessionRefusal(draft())).toBeUndefined();
    const refusal = sessionRefusal(withPlugin());
    expect(refusal).toContain("plugin.js");
    expect(refusal).toContain("Import a zip");
    expect(scriptFiles(withPlugin())).toEqual(["plugin.js"]);
  });

  it("cannot be tried for a session when the manifest asks for a capability either", () => {
    const text = (fileText(api, draft(), MANIFEST) ?? "").replace('"id":', '"capabilities": ["registry:tiles"],\n  "id":');
    const outcome = writeFileText(api, draft(), MANIFEST, text);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(sessionRefusal(outcome.draft)).toContain("registry:tiles");
  });
});

describe("paths a mod folder may hold", () => {
  it("refuses everything the installer would refuse, with the reason", () => {
    expect(pathShapeProblem("")).toBeDefined();
    expect(pathShapeProblem("/absolute.js")).toBeDefined();
    expect(pathShapeProblem("lib\\dice.js")).toBeDefined();
    expect(pathShapeProblem("../escape.json")).toBeDefined();
    expect(pathShapeProblem("lib//dice.js")).toBeDefined();
    expect(pathShapeProblem("trailing.")).toBeDefined();
    expect(pathShapeProblem("con.js")).toBeDefined();
    expect(pathShapeProblem("NUL")).toBeDefined();
    expect(pathShapeProblem(`${"a".repeat(300)}.js`)).toBeDefined();
    expect(pathShapeProblem("lib/dice.js")).toBeUndefined();
    expect(pathShapeProblem("data/spawns.json")).toBeUndefined();
  });

  it("checks the path on the way into the draft, not only on the way out", () => {
    const outcome = writeFileText(api, draft(), "../escape.js", "x");
    expect(outcome.ok).toBe(false);
  });

  it("refuses a new file that would collide, whatever its capitals", () => {
    const source = writeFileText(api, draft(), "plugin.js", "x");
    expect(source.ok).toBe(true);
    if (!source.ok) return;
    expect(pathProblem(api, source.draft, "Plugin.JS")).toContain("already");
  });

  it("refuses to invent a record file by hand, and says where it comes from instead", () => {
    const why = pathProblem(api, draft(), "monster.json");
    expect(why).toContain("monster");
    expect(why).toContain("appears in this list");
  });
});

describe("taking a file out", () => {
  it("removes one of the author's own", () => {
    const added = writeFileText(api, draft(), "lib/dice.js", "x");
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    const gone = deleteFile(api, added.draft, "lib/dice.js");
    expect(gone.ok).toBe(true);
    if (!gone.ok) return;
    expect(fileText(api, gone.draft, "lib/dice.js")).toBeUndefined();
  });

  it("refuses to remove one the mod writes for itself", () => {
    const outcome = deleteFile(api, busy(), "monster.json");
    expect(outcome.ok).toBe(false);
  });
});
