# Tutorial 5: Hook one piece of behavior

**What you will make:** the game congratulating you when you gain a level.

**Before this:** [Tutorial 4](04-change-a-spell.md).

**Time:** ten minutes.

**New idea:** your mod runs code. It is still one `.js` file beside the manifest, with no compiler, build step, or dependencies.

---

## Mod files

```
my-code-mod/
  manifest.json
  plugin.js
```

`manifest.json` declares an in-process plugin and the API 2 range:

```json
{
  "format": "neo-angband/mod/manifest",
  "schemaVersion": 2,
  "data": {
    "id": "my-code-mod",
    "name": "My Code Mod",
    "version": "1.0.0",
    "shape": "plugin",
    "facets": [
      "plugin"
    ],
    "api": ">=2.0.0 <3.0.0",
    "runtime": "in-process",
    "engine": {
      "range": ">=1.23.0-beta.4",
      "because": "This mod targets the published 1.23.0-beta.4 SDK."
    },
    "author": "your name",
    "license": "GPL-2.0-only",
    "repository": "https://github.com/you/my-code-mod",
    "dependencies": {
      "required": {
        "core": {
          "range": "*"
        }
      }
    },
    "affectsGameplay": false,
    "description": "Congratulates you on gaining a level."
  }
}
```

`shape` and `facets` declare the plugin. `runtime` selects in-process execution, and `api` names the mod API versions the plugin works with. The hook runs synchronously in the game process.

`plugin.js`:

```js
export default {
  api: ">=2.0.0 <3.0.0",

  hooks() {
    return {
      messageText: (raw) =>
        raw.startsWith("Welcome to level ") ? `Congratulations! ${raw}` : raw,
    };
  },
};
```

Those ten lines are all the code the mod needs.

## What is happening

A mod that runs code default-exports one object, and the game calls methods on that object.

`hooks()` returns a plain object whose keys are **behavior points**, the places where the game consults a mod before doing something. The published API 2 hook contract lists the available hooks. Write keys for the hooks you want and leave the rest out. The game never consults your mod at a point you leave out, and an omitted key costs nothing.

`messageText` is the simplest hook. Every message the player sees passes through it on the way to the message line, and the game shows whatever string you return.

`plugin.js` has no imports. The game loads it from your folder as a plain ES module and passes the engine in to the functions that need it. Because of that, a mod needs no build or bundle step and does not have to track the game's internal module layout. To split your code across files, `import "./lib/whatever.js"` from your own folder. Relative paths work on both the desktop and browser builds.

## One rule about this hook

A message hook may restate a message. It must never change what the message means.

Putting "Congratulations!" in front of a level-up message restates it: the fact stays the same, with more enthusiasm. Turning *"You are poisoned."* into *"You feel fine."* changes the meaning, and a mod that does that makes the game lie to the player about their own character.

The engine returns whatever your hook returns, so the rule is yours to keep. This hook is the easiest place in the mod system to break it by accident.

## The mistake to avoid

```js
messageText: (raw) => (raw.startsWith("Welcome to level ") ? `Congratulations! ${raw}` : raw),
//                                                                                     ^^^^
```

The trailing `: raw` returns the original text for every message the hook leaves alone. Your function sees every message the game prints, so a hook that drops that branch deletes the rest of the game's output. Whatever else your hook does, make the default branch return what it was given.

## Running it

Load it the same way as in the earlier tutorials: put it in the `mods/` folder on the desktop build, or use **Choose a mods folder...** in a browser. The game loads a code mod from a folder the same way it loads a data mod.

## Check the result

Gain a level. The message reads *"Congratulations! Welcome to level 2."*

Turn the mod off and reload. The message reads *"Welcome to level 2."* again.

## Variations to try

- Congratulate loudly: `` `*** ${raw.toUpperCase()} ***` ``.
- React to a different message. Find one you like in the game and match on it.
- Add a second hook. `saveNoiseScent` and `objectListTiebreak` are two of the other hooks. [MOD_SEAMS.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_SEAMS.md) describes what the game asks each one to do and when.
- Print something to the console from inside the hook and count how often it runs. The count shows how many messages the game prints during play.

## Sample mod

Core's historical sample uses API 1. ModForge's documentation suite tests the API 2 example on this page.

---

**Next:** [Tutorial 6: Add an option](06-add-an-option.md), which gives the same mod a switch the player controls.
