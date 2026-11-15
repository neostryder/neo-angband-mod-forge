# Start a mod

A mod is a folder with `manifest.json`, record contributions, and any scripts or assets it needs. The workshop creates that folder as a zip. [Tutorial 1](tutorials/01-tweak-a-value.md) gives the complete schema 2 manifest for a content mod; [tutorial 5](tutorials/05-hook-behaviour.md) gives an API 2 plugin.

## From the workshop

Choose **Build a mod...** in the Game menu, create a draft, and set its id, name, author, repository, and license. Add or change records through the record screens. The workshop writes field patches for existing records and records for new ones. **Edit the files directly** opens the same draft as files.

**Start a plugin.js** adds an API 2 entry template. The emitted manifest gains the `plugin` facet, the `in-process` runtime, and the API range read from the script. A script or a capability declaration disables **Try it in the game**; save a zip and use **Import a zip** on the game's Mods screen.

## From a folder

```text
my-mod/
  manifest.json
  plugin.js
  lib/format.js
  monster.json
  data/spawns.json
  tiles/orc.png
```

Only a code mod needs `plugin.js`. A mod with records and code declares both `content` and `plugin` in `data.facets`, with `data.shape` naming its primary facet. Code uses `data.runtime: "in-process"` and `data.api: ">=2.0.0 <3.0.0"`. A content-only mod uses `data.runtime: "data"` and `data.api: "*"`. The examples target SDK 1.23.0-beta.3, which carries mod API 2.0.0.

The entry module default-exports an API 2 definition. The host passes the API root to `start`; hooks receive only `{ id, flags }`. A hook returns its answer synchronously. Calls on domains such as `view` return promises of results; check `ok` before reading `value`.

```js
export default {
  api: ">=2.0.0 <3.0.0",
  async start(mod) {
    const player = await mod.view.player();
    if (!player.ok) return;
    mod.meta.log(`HP ${player.value.hp}/${player.value.maxHp}`);
  },
};
```

This example needs `state:player.read` in `data.capabilities`. Views contain only player-known information. A missing permission or unavailable character produces a failed result, so the example returns without reading a value.

## Imports and assets

Split scripts into files with relative imports that include the extension, such as `import { format } from "./lib/format.js"`. Folder loading does not support import cycles. Put shared code in a third module when two modules would import each other.

An installed mod cannot resolve package names. Import SDK and Core types with `import type` in TypeScript, then bundle the source to `plugin.js` with the SDK builder. The runtime API arrives through `start(mod)`; a second bundled copy of Core does not represent the running game.

Read an asset through `await mod.content.asset("data/spawns.json")`, check the result, and use its URL in an in-process mod. The resolver reaches only this mod's files. A root record JSON file contributes game data; nested JSON can hold the mod's own data. [Core's resource reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#shipping-resources-sounds-a-font-pref-files-help-pages-art) describes manifest-declared sounds, fonts, preferences, help, art, and locales.

## TypeScript and distribution

Use the published SDK as a development dependency. Run `pnpm exec neo-angband-mod-build --root .` from the mod repository to bundle the entry source, and commit the resulting `plugin.js` beside the manifest. The builder rejects unresolved package imports. A hand-written ES module with relative imports needs no build step.

The [authoring guide](AUTHORING.md) covers drafting and composing records. [Publishing](PUBLISHING.md) covers checks and distribution. Core keeps the [API 2 reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/API2.md), [API 1 migration guide](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MIGRATING_TO_API2.md), and [plugin reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/PLUGINS.md).
