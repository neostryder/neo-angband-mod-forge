# Testing a hand-written `plugin.js`

This is the test path for a mod that lives in its own repository. It does not
import ModForge, the game's internal sample mods, or files from this checkout.
The file under test is the same committed `plugin.js` that a player downloads.

## What a useful test proves

There are two different claims, and they need two different tests:

1. **Composition:** the mod's records compose with the game's records and produce
   the record the author intended. Assert the composed value (and, when useful,
   its `owner` / `modifiedBy` provenance), not just that the mod's JSON parsed.
2. **Behaviour:** the plugin's contribution is installed into the real engine and
   changes the result of a real state transition. Assert the observable result of
   the transition - for example, a message transform, a veto, a command, or a
   timed-effect begin/end callback - rather than only asserting that a function
   exists.

These tests complement `mod-check`. The checker answers whether the files are
acceptable; this suite answers whether the composed game and the running hook do
what the author meant.

## Dependencies in the mod repository

Use the published versions that match the engine range in the mod's
`manifest.json`:

```sh
npm install --save-dev @rpgm-tools/neo-angband-core @rpgm-tools/neo-angband-mod-sdk vitest
```

`@rpgm-tools/neo-angband-core` is the public, headless engine API. It is a
development dependency only: the game hands a plugin what it needs at load time, so
the engine must not be bundled into the plugin. The mod SDK is needed when the
test composes content or runs the same authoring checks as the host. A
plugin-only repository can omit the SDK until it adds the composition test.

The Borg mod is the reference layout: it keeps core and the SDK in
`devDependencies`, uses Vitest, and imports its built `plugin.js` in
`plugin.test.ts`. Its tests run against the published core by default. Keep that
default; an optional local-core alias is useful only when deliberately testing
an unreleased engine change.

## Supplying real records

Core is deliberately a rules engine, not a copy of the game's content pack. A
composition test therefore needs both packages and a content source. Load the
content JSON from a pinned release of the `neo-angband` repository (or from the
content artifact your project already distributes), turn each file into the
SDK's `LoadedPack` shape, and compose the base pack followed by the test mod:

```ts
import {
  composeContentPacks,
  composedObjects,
  packSubject,
} from "@rpgm-tools/neo-angband-mod-sdk";

const result = composeContentPacks([corePackFromPinnedContent, myPack]);
expect(result.problems).toEqual([]);

const allRecords = composedObjects(result.records);
const mine = packSubject(myPack.files, allRecords);
expect(mine.monster).toContainEqual(
  expect.objectContaining({ name: "my-monster", depth: 25 }),
);
```

`corePackFromPinnedContent` is intentionally a test helper, not an import from
the game's monorepo. Follow the Borg precedent for that helper: resolve an
explicit `NEO_ANGBAND_REPO` (or a checked-in/downloaded content directory), read
the JSON files, and fail loudly when the selected content is absent. Pin the
content revision together with the core version so a test failure identifies a
changed game dataset rather than silently testing a different game.

For a patch, assert the final value in `result.records`, not the patch object.
For an added record, assert that it is present alongside the core records. For a
cross-pack reference, assert the composed target exists. If the test needs to
explain which pack supplied a record, use the `ComposedRecord` map returned by
`composePacks`; `composedObjects` is the convenient JSON-only view for authoring
assertions.

## Driving a real hook

Import the built artifact directly:

```ts
const plugin = (await import("../plugin.js")).default;
```

An API 2 hook factory receives `{ id, flags }`, and its message hook has the same string-to-string signature as Core's message transform. Other API 2 hooks, such as `historyAdd`, return different types, so a whole `Api2Hooks` object cannot go straight into `composeModHooks`. The example below pulls out only `messageText` and runs a level-up through Core:

```ts
import * as Core from "@rpgm-tools/neo-angband-core";

const contribution = plugin.hooks({ id: "my-code-mod", flags: {} });
const messageText = contribution.messageText;
if (!messageText) throw new Error("The plugin supplies no message hook.");
const hooks = Core.composeModHooks([{ messageText }]);

const game = Core.startGame(realGamePack, { seed: 7, depth: 0 });
const messages: string[] = [];
const msg = (text: string) => messages.push(hooks?.messageText?.(text) ?? text);
Core.playerExpGain(game.state.actor.player, 100, { rng: game.state.rng, msg });
expect(messages).toContain("Congratulations! Welcome to level 2.");
```

`realGamePack` is the test's `GamePack` fixture from the pinned content source. `startGame` returns a state with the player at `state.actor.player`, and `playerExpGain` calls `adjustLevel` and sends the level-up message to the sink you pass in. This example targets tutorial 5. For another hook, pick the public operation and expected result that match it.

A message hook test runs a core operation that produces a message and asserts the text that reaches the test sink. For a veto hook, assert that the hook is called and that the operation is accepted or rejected as its return value requires. A controller-style plugin needs the live `GameState`/agent view and action facade: change the state, then assert the command the plugin produces. Each test should assert on the state transition itself, because checking that the hook was registered says nothing about what the hook does.

## Running the suite

The useful scripts are ordinary Node/Vitest scripts in the mod repository:

```json
{
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "verify": "npm run typecheck && npm test && npm run check"
  }
}
```

Keep a separate test that imports `plugin.js`, even if source-level tests also
exist. `npm run check` should build or validate the committed artifact, while
the artifact test catches bundling/export mistakes that TypeScript tests cannot.
If the pinned content checkout is unavailable, skip or fail the real-engine
tests explicitly with a message naming the required content source; never fall
back to ModForge's demonstration records and call that a real-data pass.
