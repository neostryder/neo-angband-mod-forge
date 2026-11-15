# Start a mod

A mod is a folder that holds `manifest.json`, its record contributions, and any scripts or assets it needs. The workshop creates that folder as a zip. [Tutorial 1](tutorials/01-tweak-a-value.md) gives the complete schema 2 manifest for a content mod, and [tutorial 5](tutorials/05-hook-behaviour.md) gives an API 2 plugin.

## From the workshop

In the Game menu, choose **Build a mod...**, create a draft, and set its id, name, author, repository, and license. The record screens add or change records. For an existing record the workshop writes field patches, and for a new one it writes the whole record. **Edit the files directly** opens the same draft as files.

**Start a plugin.js** adds an API 2 entry template. The emitted manifest then gains the `plugin` facet, the `in-process` runtime, and the API range read from the script. **Try it in the game** is unavailable once a draft has a script or a capability declaration. To test that draft, save a zip and load it with **Import a zip** on the game's Mods screen.

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

Only a code mod needs `plugin.js`. A mod with both records and code declares `content` and `plugin` in `data.facets` and names its primary facet in `data.shape`. Code runs with `data.runtime: "in-process"` and `data.api: ">=2.0.0 <3.0.0"`. A content-only mod uses `data.runtime: "data"` and `data.api: "*"`. The examples target SDK 1.23.0-beta.4, which carries mod API 2.1.0. The starter and examples use no 2.1 fields and keep `>=2.0.0 <3.0.0`.

The entry module default-exports an API 2 definition. The host passes the API root to `start`, and hooks receive only `{ id, flags }`. A hook returns its answer synchronously. Calls on domains such as `view` return promises of results, so check `ok` before you read `value`.

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

This example needs `state:player.read` in `data.capabilities`. Views contain only information the player knows. If the permission is missing or the character is unavailable, the call produces a failed result and the example returns without reading a value.

A mod that reads API 2.1 fields declares `>=2.1.0 <3.0.0` in its script and manifest. `player.slainUniques` is a readonly list of `{ raceIndex: number, raceId?: string, name: string }` entries for uniques the character killed. `player.status.countdown` counts ticks that reduced a timed effect; it gives no remaining duration. A known item has an optional `objectId: number` that identifies it for the session and an optional `trapKnown: boolean` for chests. Shop wares have no `objectId`. A chest with `trapKnown: false` reports `pval: 0` without revealing its trap.

## Imports and assets

Split scripts across files with relative imports that include the extension, such as `import { format } from "./lib/format.js"`. Folder loading does not support import cycles, so when two modules would import each other, move their shared code into a third module.

An installed mod cannot resolve package names. In TypeScript, import SDK and Core types with `import type`, then bundle the source to `plugin.js` with the SDK builder. The runtime API arrives through `start(mod)`. A second bundled copy of Core does not represent the running game.

In an in-process mod, read an asset through `await mod.content.asset("data/spawns.json")`, check the result, and use its URL. The resolver reaches only this mod's files. A root record JSON file contributes game data, and nested JSON can hold the mod's own data. [Core's resource reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#shipping-resources-sounds-a-font-pref-files-help-pages-art) describes manifest-declared sounds, fonts, preferences, help, art, and locales.

## TypeScript and distribution

Add the published SDK as a development dependency. From the mod repository, run `pnpm exec neo-angband-mod-build --root .` to bundle the entry source, then commit the resulting `plugin.js` beside the manifest. The builder rejects unresolved package imports. A hand-written ES module with relative imports needs no build step.

The [authoring guide](AUTHORING.md) covers drafting and composing records, and [Publishing](PUBLISHING.md) covers checks and distribution. Core keeps the [API 2 reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/API2.md), the [API 1 migration guide](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MIGRATING_TO_API2.md), and the [plugin reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/PLUGINS.md).
