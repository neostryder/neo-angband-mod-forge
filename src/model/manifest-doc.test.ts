import { describe, expect, it } from "vitest";
import {
  manifestToV2,
  MOD_API2_DEFAULT_RANGE,
  MOD_API_1_RANGE,
  satisfies,
  WORKER_PREVIEW_API,
} from "@rpgm-tools/neo-angband-mod-sdk";
import type { PackManifest as SdkPackManifest } from "@rpgm-tools/neo-angband-mod-sdk";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
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

  it("reads past a range in a comment", () => {
    const line = '// later: api: ">=2.0.0 <3.0.0"\nexport default { api: 1, hooks() { return {}; } };\n';
    expect(scriptApi(line)).toEqual({ range: API1_RANGE, api1: true });
    const block = '/* api: ">=2.0.0 <3.0.0" */\nexport default {\n  /* api: ">=2.0.0 <3.0.0" */\n  api: 1,\n};\n';
    expect(scriptApi(block)).toEqual({ range: API1_RANGE, api1: true });
  });

  it("reads past a range inside a string", () => {
    const source = 'const NOTE = "api: \\">=2.0.0 <3.0.0\\"";\nconst T = `api: ">=2.0.0 <3.0.0"`;\nexport default { api: 1 };\n';
    expect(scriptApi(source)).toEqual({ range: API1_RANGE, api1: true });
  });

  it("reads the default export, not another object that has an api", () => {
    const source = 'const LEGACY = { api: "1" };\nexport default {\n  api: ">=2.0.0 <3.0.0",\n  start(mod) {},\n};\n';
    expect(scriptApi(source)).toEqual({ range: API2_RANGE, api1: false });
  });

  it("reads the default export's own api, not one nested inside it", () => {
    const source = 'export default {\n  meta: { api: ">=2.0.0 <3.0.0" },\n  api: 1,\n};\n';
    expect(scriptApi(source)).toEqual({ range: API1_RANGE, api1: true });
    const later = 'export default {\n  hooks(ctx) { const x = { api: 1 }; return {}; },\n  api: ">=2.0.0 <3.0.0",\n};\n';
    expect(scriptApi(later)).toEqual({ range: API2_RANGE, api1: false });
  });

  it("reads a quoted key and a plain template literal", () => {
    expect(scriptApi('export default { "api": ">=2.0.0 <3.0.0" };').range).toBe(API2_RANGE);
    expect(scriptApi("export default { api: `>=2.0.0 <3.0.0` };").range).toBe(API2_RANGE);
  });

  it("is not thrown by a regular expression holding a quote", () => {
    const source = 'const Q = /"/g;\nexport default { api: ">=2.0.0 <3.0.0", start() {} };\n';
    expect(scriptApi(source).range).toBe(API2_RANGE);
    const division = 'const half = total / 2; const slash = "/";\nexport default { api: ">=2.0.0 <3.0.0" };\n';
    expect(scriptApi(division).range).toBe(API2_RANGE);
  });

  it("reads past a template literal whose substitution holds braces and another template", () => {
    const source = 'const T = `a ${ { b: `api: ">=2.0.0 <3.0.0"` }.b } c`;\nexport default { note: `x ${T}`, api: 1 };\n';
    expect(scriptApi(source)).toEqual({ range: API1_RANGE, api1: true });
  });

  it("takes an api it cannot read as API 1", () => {
    expect(scriptApi("export default { api: RANGE };").api1).toBe(true);
    expect(scriptApi('export default { api: ">=2.0.0" + suffix };').api1).toBe(true);
    expect(scriptApi("export default { api: `>=${major}.0.0` };").api1).toBe(true);
    expect(scriptApi('const mod = { api: ">=2.0.0 <3.0.0" };\nexport default mod;\n').api1).toBe(true);
  });
});

describe("whether a range is API 2", () => {
  const ranges: [string, boolean][] = [
    [API2_RANGE, true],
    [API1_RANGE, false],
    ["^2.0.0", true],
    ["2.x", true],
    [">=2.1.0", true],
    ["~2.3", true],
    [">1.9.9", false],
    [">=1.5.0 <3.0.0", false],
    ["^1.4.0", false],
    ["*", false],
    ["banana", false],
  ];
  for (const [range, api2] of ranges) {
    it(`calls "${range}" ${api2 ? "API 2" : "not API 2"}, with the SDK's semver and with the stub's`, () => {
      expect(isApi2Range(range, satisfies)).toBe(api2);
      expect(isApi2Range(range, STUB_AUTHORING.satisfies)).toBe(api2);
    });
  }
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
    {
      id: "listed",
      name: "Listed",
      version: "0.1.0",
      shape: "content",
      facets: ["content"],
      engine: ">=1.22.0",
      engineBecause: ENGINE_BECAUSE,
      changelog: "CHANGELOG.md",
      screenshots: ["shots/town.png"],
      listing: { tags: ["shops"], changelog: "OLD.md" },
      text: { default: "en", locales: { en: "text/en.json" } },
      budget: { msPerTurn: 20 },
    } as unknown as PackManifest,
    {
      id: "worker",
      name: "Worker",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      api: WORKER_PREVIEW_API,
      runtime: "worker",
      entry: "worker.js",
    } as unknown as PackManifest,
    {
      id: "in-process-entry",
      name: "In process, with an entry",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      api: API2_RANGE,
      runtime: "in-process",
      entry: "plugin.js",
    } as unknown as PackManifest,
    {
      id: "schema-one-plugin",
      name: "Schema 1 plugin",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      modApi: 1,
    },
    {
      id: "schema-one-worker",
      name: "Schema 1 worker",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      modApi: 2,
      runtime: "worker",
      workerEntry: "worker.js",
    } as unknown as PackManifest,
    {
      id: "api-without-runtime",
      name: "An api with no runtime",
      version: "0.1.0",
      shape: "content",
      facets: ["content", "plugin"],
      api: API2_RANGE,
      modApi: 1,
    },
    {
      id: "conflicted",
      name: "Conflicted",
      version: "0.1.0",
      shape: "content",
      dependencies: { core: "*" },
      compat: [
        { with: "rival", claim: "conflicts", because: "Both rewrite the shops." },
        { with: "other", claim: "conflicts", scope: "monster", because: "Both retune wolves." },
        { with: "core", claim: "conflicts", because: "Listed as a dependency too." },
      ],
    } as unknown as PackManifest,
  ];

  for (const manifest of manifests) {
    it(`matches the SDK's for ${manifest.id}`, () => {
      const ours = manifestDocument(manifest);
      expect(ours["format"]).toBe(MANIFEST_FORMAT);
      expect(ours["schemaVersion"]).toBe(2);
      expect(ours["data"]).toEqual(manifestToV2(manifest as unknown as SdkPackManifest));
    });
  }

  it("refuses a schema 1 API the SDK has no mapping for, as the SDK does", () => {
    const manifest = { id: "odd", name: "Odd", version: "0.1.0", shape: "content", facets: ["content", "plugin"], modApi: 3 } as PackManifest;
    expect(() => manifestToV2(manifest as unknown as SdkPackManifest)).toThrow(/modApi 3/u);
    expect(() => manifestDocument(manifest)).toThrow(/modApi 3/u);
  });

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
