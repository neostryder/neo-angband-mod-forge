# Draft and assemble records

The SDK's authoring functions draft records from comparable game records, report findings, and compose a mod before it is written. They take JSON records keyed by file stem, such as `object` or `monster`. Core keeps the [full authoring API reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md).

## Get the records and authoring library

An offline tool imports `draftRecord` and `modProject` from `@rpgm-tools/neo-angband-mod-sdk`. It supplies a content source matching the game version under test. Core's npm package contains engine code, so it does not supply that content pack.

ModForge obtains the authoring library through `mod.manage.authoring()` with `mod:authoring`, and composed JSON through `mod.content.records(file)`. The published API 2.0 host reserves the management authoring seam for first-party mods. An ordinary mod can read composed content without that seam; an offline tool uses the SDK package directly. Check each call's `ok` before using its `value`.

## Draft a new record

```ts
import { draftRecord } from "@rpgm-tools/neo-angband-mod-sdk";

const drafted = draftRecord(
  "object",
  { name: "& Sludge Dagger~", type: "sword", level: 20 },
  coreRecords,
);
```

`coreRecords` is the supplied JSON record map. `drafted.record` takes its shape from a comparable record and its suggested numbers from nearby peers. `drafted.modelledOn` names the model, and `drafted.suggestions` gives the evidence for each value. The draft does not copy attacks, flags, effects, descriptions, or other behavior and identity fields. The author supplies those choices.

`checkRecords(subject, all)` checks the author's records against the full composed set. A check against the mod alone cannot resolve its references to Core or another mod. Findings have `error`, `warn`, or `hint` levels; a hint such as `field/vocabulary` permits a value the base data does not use.

## Assemble a project

```ts
import { draftRecord, modProject } from "@rpgm-tools/neo-angband-mod-sdk";

const build = modProject({
  id: "sludge",
  name: "Sludge",
  version: "1.0.0",
  shape: "content",
  author: "you",
  license: "GPL-2.0-only",
  repository: "https://github.com/you/sludge",
  engine: ">=1.23.0-beta.3",
  dependencies: { core: "*" },
})
  .declareField({ name: "sludge", files: ["object"], type: "object" })
  .add("monster", draftRecord("monster", {
    name: "sludge fiend", base: "icky thing", depth: 25,
  }, coreRecords).record)
  .patchFields("object", "core:sword--dagger", [
    { op: "set", path: "sludge:sludge", value: { turns: 5 } },
  ])
  .build(corePack);
```

`corePack` is the matching base content in the SDK's `LoadedPack` shape. The builder accepts this normalized manifest object and emits a schema 2 manifest document. `build.files` contains paths and text, `build.findings` contains authoring findings, and `build.problems` contains composition refusals. `build.ok` is false when a finding is an error; warnings still need review before publication.

`emit()` returns files without writing them. `build(corePack)` composes the result and checks it. The caller writes those files or makes a zip, which lets the same project run in an offline tool or in the workshop.

The published `ModProject.build` accepts one base pack. ModForge merges its loaded record map into a Core base for this call, so a draft that declares another installed mod as a dependency receives `project/unloadable`. The dependency is preserved in the exported manifest, but the workshop cannot validate that draft through this builder. The SDK needs a build method that accepts all loaded base packs; ModForge keeps the SDK's validation rules in the SDK.

## Compose with other mods

Declare a record owner's id in `dependencies` before patching its records. Declare an extension field before writing it, and declare the extension owner's id before writing another mod's namespaced field. Use `add` for a relative numeric change, `addFlag` for a flag, and `append` for a list contribution. A `set` replaces the current field value.

The project methods `add`, `patchFields`, `replace`, and `remove` operate on file stems and stable refs. `recordKey(file, record)` derives a key; `recordRefKeys` lists its accepted aliases. Most files use the record's name, but objects use type plus name, and stores use their code. Read the [record identity reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#what-a-record-is-called) before inventing a ref.

The workshop's record screens omit `constants`, `visuals`, and `history`. The project builder reports whole-file replacement of those files as an error. The file editor can carry sections and replacements; a replacement typed there is checked on the review screen.

The [scaffolding guide](SCAFFOLDING.md) covers the folder and entry point. The [publishing guide](PUBLISHING.md) covers checks and sharing. Rule and section rename formats remain in [Core's authoring reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#renaming-a-player-toggleable-rule).
