# Tutorial 6: Add an option

**What you will make:** Tutorial 5's mod, with a switch the player can turn on and off, from the game, without editing anything.

**Before this:** [Tutorial 5](05-hook-behaviour.md).

**Time:** ten minutes.

---

## Mod files

Same two files. `manifest.json` gains a `rules` block:

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
      "range": ">=1.23.0-beta.3",
      "because": "This mod targets the published 1.23.0-beta.3 SDK."
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

That is the entire feature. There is no settings API to learn, no storage to manage, and no screen to build.

## The manifest flag controls hook registration

You **declare** the switch in the manifest. The game builds the screen, shows your `title` and `description`, remembers what the player chose, and passes the answer to `hooks({ id, flags })` before your code runs.

So reading a setting is a plain property lookup. `title` and `description` are what the player reads, so write them for a player: say what turning it on does, not what it does internally.

The flag name is prefixed with your mod's id by convention, and the convention is worth keeping. The `flags` argument is not shared: the host gives each mod its own slice, so you cannot see another mod's toggles and they cannot see yours. The player's saved choices, though, all live in one flat map keyed by flag name, so two mods that both called a flag `congratulate` would share one stored setting.

## Where the check goes, and why it matters

Look at where the `if` is: in `hooks`, deciding whether to supply the hook at all, rather than inside `messageText` returning `raw` unchanged.

The two look identical to the player, but they work differently:

- Checking inside the hook means the game calls your function for every message it ever prints, forever, and your function decides to do nothing.
- Checking around the hook means that when the option is off, you supplied no hook, so the game runs its own untouched path and your mod is not in it at all.

Use the second. A disabled option should cost nothing and be indistinguishable from your mod not being installed, and checking around the hook is what guarantees that turning the option off gives you the base game back.

## Default off

Make `"default": false` a habit: enabling a mod should not switch on all of its features.

Someone installs your mod because they want one thing in it. Shipping every toggle on means they get five changes they did not ask for and now have to discover a settings screen to undo. Ship them off, describe each one clearly, and let them choose.

The first-party `feature-restoration` mod works exactly this way: enabling it changes nothing at all until you pick a feature.

## Check the result

Enable the mod. Switching a mod on that declares at least one rule asks which of its features to turn on: **Enable default features** (whatever `"default"` says in the manifest, which for this tutorial is off), **Choose features to enable** (opens this mod's own options screen so you can decide per rule), or **Do not enable any features** (every rule off, regardless of its manifest default). Picking the default here leaves *Congratulate me on gaining a level* off, exactly as `"default": false` says.

Press `Escape`, choose **Mods**, choose your mod, and you will find that same option on its own screen. Turn it on, choose **Apply changes and reload**, and gain a level.

## Variations to try

- Add a **second** option, controlling something else, and see both appear.
- Make one **default on** and notice how differently the mod feels to install. Then decide whether you were right.
- Rename a rule flag or a section and read about `renamedRuleFlags` and `renamedSectionFlags` in [Core's authoring reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#renaming-a-player-toggleable-rule), since there is a supported way to do either without losing everyone's saved choice.

## Sample mod

Core's historical sample uses API 1. The API 2 example on this page is tested in ModForge's documentation suite.

---

## You have finished the core six

Six mods, and between them they cover the shape of nearly everything else: changing data, adding data, running code, and letting the player decide.

**One more, if you want it:** [Tutorial 7](07-add-an-artifact.md) adds an artifact. It is the odd one out, because an artifact is a layer over an item rather than an item, so it is worth doing once even though nothing new about the mod system is in it.

Where to go after that depends on what you want to build. See [the learning path](README.md#after-the-tutorials).
