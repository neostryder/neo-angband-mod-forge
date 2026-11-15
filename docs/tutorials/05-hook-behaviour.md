# Tutorial 5: Hook one piece of behavior

**What you will make:** the game congratulating you when you gain a level.

**Before this:** [Tutorial 4](04-change-a-spell.md).

**Time:** ten minutes.

**New idea:** your mod runs code. Still no compiler, no build step, no dependencies, just one `.js` file beside the manifest.

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
      "range": ">=1.23.0-beta.3",
      "because": "This mod targets the published 1.23.0-beta.3 SDK."
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

`shape` and `facets` declare the plugin, `runtime` selects in-process execution, and `api` names the compatible mod API versions. The hook runs synchronously in the game process.

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

Ten lines, and that is the entire mod.

## What is happening

A mod that runs code **default-exports one object**. The game looks at that object and asks it questions.

`hooks()` returns a plain object whose keys are **behavior points**, places where the game will consult a mod before doing something. The published API 2 hook contract lists the available hooks. You supply the ones you care about and omit the rest; a key you do not write is a place the game never asks you about, and it costs nothing.

`messageText` is the simplest one. Every player-visible message passes through it on its way to the message line, and whatever you return is what is shown.

**Note what is *not* here.** There are no imports. `plugin.js` is a plain ES module that the game loads from your folder; it does not import the engine, because the engine is passed *in* to the functions that need it. That is what keeps a mod from having to be built, bundled, or kept in step with the game's internal module layout. If you want more than one file, you can `import "./lib/whatever.js"` from your own folder; relative paths work on both the desktop and browser builds.

## One rule about this hook

A message hook may **restate** a message. It must never change what a message means.

"Congratulations!" in front of a level-up is a restatement: same fact, more enthusiasm. Turning *"You are poisoned."* into *"You feel fine."* is not, and a mod that does it has made the game lie to the player about their own character.

This is not the engine stopping you; the engine will happily return whatever you write. It is the line between a mod that changes the game and a mod that breaks it, and this hook is the easiest place in the whole system to cross it by accident.

## The mistake to avoid

```js
messageText: (raw) => (raw.startsWith("Welcome to level ") ? `Congratulations! ${raw}` : raw),
//                                                                                     ^^^^
```

That trailing `: raw` matters enormously. Your function sees **every** message the game prints, so one that forgets to return the original text for cases it does not care about deletes the rest of the game's output. Whatever your hook does, the default branch returns what it was given.

## Running it

Exactly as before: the `mods/` folder on the desktop build, or **Choose a mods folder...** in a browser. A code mod is loaded from a folder the same way a data mod is.

## Check the result

Gain a level. The message reads *"Congratulations! Welcome to level 2."*

Turn the mod off, reload, and it reads *"Welcome to level 2."* again.

## Variations to try

- Congratulate loudly: `` `*** ${raw.toUpperCase()} ***` ``.
- React to a **different** message. Find one you like in the game and match on it.
- Add a second hook. `saveNoiseScent` and `objectListTiebreak` are two of the other hooks; see [MOD_SEAMS.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_SEAMS.md) for what each one is asked to do and when.
- Print something to the console from inside the hook and watch how often it is called. It is a good way to get a feel for the game's message volume.

## Sample mod

Core's historical sample uses API 1. The API 2 example on this page is tested in ModForge's documentation suite.

---

**Next:** [Tutorial 6: Add an option](06-add-an-option.md), the same mod, with a switch the player controls.
