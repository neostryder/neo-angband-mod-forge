# Tutorial 6: Add an option

**What you will make:** Tutorial 5's mod, plus a switch the player can turn on and off from inside the game without editing any files.

**Before this:** [Tutorial 5](05-hook-behaviour.md).

**Time:** ten minutes.

---

## Mod files

You still have two files. `manifest.json` gains a `rules` block:

```json
{
  "format": "neo-angband/mod/manifest",
  "schemaVersion": 2,
  "data": {
    "id": "my-option-mod",
    "name": "My Option Mod",
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
    "repository": "https://github.com/you/my-option-mod",
    "dependencies": {
      "required": {
        "core": {
          "range": "*"
        }
      }
    },
    "affectsGameplay": false,
    "description": "Congratulates you on gaining a level.",
    "rules": [
      {
        "flag": "my-option-mod.congratulate",
        "title": "Congratulate me on gaining a level",
        "description": "Adds Congratulations! to the level-up message.",
        "default": false
      }
    ]
  }
}
```

`plugin.js` gains one line:

```js
export default {
  api: ">=2.0.0 <3.0.0",

  hooks({ flags }) {
    if (flags["my-option-mod.congratulate"] !== true) return {};
    return {
      messageText: (raw) =>
        raw.startsWith("Welcome to level ") ? `Congratulations! ${raw}` : raw,
    };
  },
};
```

Those two edits make up the whole feature. The game supplies the settings screen and the storage, so you have no settings API to learn and no screen to build.

## The manifest flag controls hook registration

You declare the switch in the manifest. The game builds the options screen, shows your `title` and `description`, remembers what the player picked, and passes the answer to `hooks({ id, flags })` before your code runs.

Reading a setting is a plain property lookup. The player reads `title` and `description`, so write them for a player and describe what changes in the game when the option is on.

By convention, a flag name starts with your mod's id, and you should keep that convention. The host gives each mod its own slice of the `flags` argument, so you cannot see another mod's toggles and other mods cannot see yours. The player's saved choices all live in one flat map keyed by flag name, though, so two mods that each named a flag `congratulate` would share one stored setting.

## Where the check goes, and why it matters

The `if` sits in `hooks`, where it decides whether to supply the hook at all. You could instead put the check inside `messageText` and return `raw` unchanged when the option is off.

The player sees the same result either way, but the game does different work:

- With the check inside the hook, the game calls your function for every message it prints, for the rest of the session, and your function does nothing each time.
- With the check around the hook, an option that is off means you supplied no hook, so the game runs its own untouched path and your mod plays no part in it.

Use the second form. A disabled option then costs nothing, the game behaves as if your mod were not installed, and turning the option off gives the player the base game back.

## Default off

Make `"default": false` a habit, so that enabling a mod leaves its features off until the player picks them.

A player usually installs a mod for one thing in it. If every toggle ships on, that player gets five changes they did not ask for and has to find a settings screen to undo them. Ship toggles off, describe each one clearly, and let the player choose.

The first-party `feature-restoration` mod works this way: enabling it changes nothing until you pick a feature.

## Check the result

Enable the mod. When you switch on a mod that declares at least one rule, the game asks which of its features to turn on. **Enable default features** uses whatever `"default"` says in the manifest, which is off for this tutorial. **Choose features to enable** opens this mod's own options screen so you can decide per rule. **Do not enable any features** turns every rule off, whatever its manifest default. If you pick the default, *Congratulate me on gaining a level* stays off, as `"default": false` says.

Press `Escape`, choose **Mods**, and choose your mod to find the same option on its own screen. Turn it on, choose **Apply changes and reload**, and gain a level.

## Variations to try

- Add a second option that controls something else, and check that both appear.
- Make one option default on and notice how the mod feels to install. Then decide which default you prefer.
- Rename a rule flag or a section. [Core's authoring reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#renaming-a-player-toggleable-rule) describes `renamedRuleFlags` and `renamedSectionFlags`, which let you rename either one without losing players' saved choices.

## Sample mod

Core's historical sample uses API 1. The API 2 example on this page is tested in ModForge's documentation suite.

---

## You have finished the core six

You have built six mods, and between them they cover the shape of nearly everything else: changing data, adding data, running code, and letting the player decide.

**One more, if you want it:** [Tutorial 7](07-add-an-artifact.md) adds an artifact. An artifact is a layer over an existing item, which makes it the odd one out among the tutorials. It teaches nothing new about the mod system, but it is worth doing once.

Where you go after that depends on what you want to build. See [the learning path](README.md#after-the-tutorials).
