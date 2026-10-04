import { describe, expect, it } from "vitest";
import { manifestToV2, MOD_API2_DEFAULT_RANGE, MOD_API_1_RANGE } from "@rpgm-tools/neo-angband-mod-sdk";
import type { PackManifest as SdkPackManifest } from "@rpgm-tools/neo-angband-mod-sdk";
import type { JsonRecord, PackManifest } from "../host/authoring.js";
import {
  API1_RANGE,
  API2_RANGE,
  ENGINE_BECAUSE,
  isApi2Range,
  manifestDocument,
  manifestFields,
  MANIFEST_FORMAT,
  scriptApi,
} from "./manifest-doc.js";

describe("the API ranges", () => {
  it("are the SDK's own", () => {
    expect(API1_RANGE).toBe(MOD_API_1_RANGE);
    expect(API2_RANGE).toBe(MOD_API2_DEFAULT_RANGE);
  });
});

describe("which API a script is written for", () => {
  it("reads api: 1 as API 1", () => {
    expect(scriptApi("export default { api: 1, hooks() { return {}; } };")).toEqual({ range: API1_RANGE, api1: true });
  });

  it("reads a quoted range as that range", () => {
    expect(scriptApi('export default {\n  api: ">=2.0.0 <3.0.0",\n};')).toEqual({ range: API2_RANGE, api1: false });
    expect(scriptApi("export default { api: '>=2.1.0 <3.0.0' };").range).toBe(">=2.1.0 <3.0.0");
  });

  it("falls back to API 1 when there is no script or no api to find", () => {
    expect(scriptApi(undefined)).toEqual({ range: API1_RANGE, api1: true });
    expect(scriptApi("export default {};")).toEqual({ range: API1_RANGE, api1: true });
  });

  it("tells an API 2 range apart from an API 1 one", () => {
    expect(isApi2Range(API2_RANGE)).toBe(true);
    expect(isApi2Range(API1_RANGE)).toBe(false);
  });
});

describe("reading a manifest in any of its three shapes", () => {
  const bare: JsonRecord = { id: "a", name: "A", version: "1.0.0", shape: "content", engine: ">=1.0.0" };

  it("takes a bare schema 1 manifest as it is", () => {
    expect(manifestFields(bare)).toEqual({ ok: true, fields: bare });
  });

  it("unwraps a schema 1 document", () => {
    expect(manifestFields({ format: MANIFEST_FORMAT, schemaVersion: 1, data: bare })).toEqual({ ok: true, fields: bare });
  });

  it("maps a schema 2 document's fields to the names a draft keeps", () => {
    const read = manifestFields({
      format: MANIFEST_FORMAT,
      schemaVersion: 2,
      data: {
        id: "a",
        name: "A",
        version: "1.0.0",
        api: API2_RANGE,
        runtime: "in-process",
        engine: { range: ">=1.2.0", because: "Needs the 1.2.0 shop records." },
        dependencies: {
          required: { core: { range: "*" }, other: { range: "^1.0.0", because: "Uses its swords." } },
          optional: { linoleum: { range: "*" } },
          conflicts: { rival: { because: "Both rewrite the shops." } },
        },
        capabilities: ["ui:panel.mount"],
      },
    });
    expect(read).toEqual({
      ok: true,
      fields: {
        id: "a",
        name: "A",
        version: "1.0.0",
        api: API2_RANGE,
        runtime: "in-process",
        engine: ">=1.2.0",
        engineBecause: "Needs the 1.2.0 shop records.",
        dependencies: { core: "*", other: "^1.0.0" },
        optionalDependencies: { linoleum: "*" },
        dependencyReasons: { other: "Uses its swords." },
        compat: [{ with: "rival", claim: "conflicts", because: "Both rewrite the shops." }],
        capabilities: ["ui:panel.mount"],
      },
    });
  });

  it("refuses a schema version it does not know", () => {
    const read = manifestFields({ format: MANIFEST_FORMAT, schemaVersion: 3, data: bare });
    expect(read.ok).toBe(false);
  });
});

describe("the schema 2 document the demonstration library writes", () => {
  /* manifestToV2 is what the game's library writes. The demonstration library has
   * to write the same document for every field the workshop sets, so the file
   * editor shows one manifest whether or not the game lends its library. */
  const manifests: PackManifest[] = [
    {
      id: "plain",
      name: "Plain",
      version: "0.1.0",
      shape: "content",
      facets: ["content"],
      engine: ">=1.22.0",
      engineBecause: ENGINE_BECAUSE,
      group: "tweaks",
      dependencies: { core: "*" },
      affectsGameplay: true,
      description: "",
      author: "",
      license: "GPL-2.0-only",
      repository: "local://plain",
    },
    {
      id: "scripted",
      name: "Scripted",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      engine: ">=1.22.0",
      engineBecause: ENGINE_BECAUSE,
      group: "content",
      dependencies: {},
      affectsGameplay: true,
      api: API2_RANGE,
      runtime: "in-process",
      capabilities: ["ui:panel.mount"],
      description: "",
      author: "",
      license: "GPL-2.0-only",
      repository: "local://scripted",
    },
    {
      id: "older",
      name: "Older",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      engine: ">=1.22.0",
      engineBecause: ENGINE_BECAUSE,
      dependencies: { core: "*" },
      optionalDependencies: { linoleum: "*" },
      api: API1_RANGE,
      runtime: "in-process",
      modApi: 1,
    },
  ];

  for (const manifest of manifests) {
    it(`matches the SDK's for ${manifest.id}`, () => {
      const ours = manifestDocument(manifest);
      expect(ours["format"]).toBe(MANIFEST_FORMAT);
      expect(ours["schemaVersion"]).toBe(2);
      expect(ours["data"]).toEqual(manifestToV2(manifest as unknown as SdkPackManifest));
    });
  }

  it("leaves out a key schema 2 does not define, as the SDK does", () => {
    const manifest = { ...manifests[0], flavour: "mint" } as unknown as PackManifest;
    const ours = manifestDocument(manifest)["data"] as Record<string, unknown>;
    expect(ours["flavour"]).toBeUndefined();
    expect(ours).toEqual(manifestToV2(manifest as unknown as SdkPackManifest));
  });

  it("reads back to the fields it was written from", () => {
    const manifest = manifests[1];
    if (manifest === undefined) throw new Error("no manifest");
    const read = manifestFields(manifestDocument(manifest));
    expect(read).toEqual({ ok: true, fields: { ...manifest } });
  });
});
