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
development dependency only: `plugin.js` receives the engine as `ctx.core`, so
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

Construct the smallest complete host context that the plugin's manifest says it
requires, using `Core` from `@rpgm-tools/neo-angband-core`. Then invoke the same
plugin entry point the host invokes and pass its contribution to the public core
seam. For a hook contribution, the shape is:

```ts
import * as Core from "@rpgm-tools/neo-angband-core";

const contribution = plugin.hooks(flags); // use your plugin's declared entry point
const hooks = Core.composeModHooks([contribution]);

const game = Core.startGame(realGamePack, { seed: 7, depth: 0 });
game.state.modHooks = hooks;

// Call the public operation that owns the transition, with the real state.
const changed = Core.playerSetTimed(
  game.state.player,
  realTimedEffect,
  10,
  true,
  true,
  hooks,
);
expect(changed).toBe(true);
expect(observedByThePlugin).toEqual(["begin"]);
```

The exact entry point and transition depend on the plugin ABI and hook being
tested. `composeModHooks` is the engine's composition rule: it models the
load-order fold that the host performs. The transition must be a public core
operation such as `playerSetTimed`, `playerIncTimed`, `playerDecTimed`,
`startGame`/`runGameLoop`, or the relevant command/effect function. Do not call a
private implementation or manually mutate `GameState`; that would prove only a
fixture seam.

For a message hook, feed a real core message-producing operation and assert the
text received by the test sink. For a veto hook, assert both sides: the hook is
called and the operation is accepted or rejected as its return value requires.
For a controller-style plugin, use the real `GameState`/agent view and action
facade, then assert the command produced after a state change. In every case,
make the state transition visible in the assertion; “the hook was registered”
is not a behaviour test.

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
