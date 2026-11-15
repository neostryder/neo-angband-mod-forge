# Tutorial 1: Change one thing

In this tutorial you make daggers hit harder and cost ten times as much. You need a text editor and nothing else: no compiler, no toolchain, no account, and no copy of the game's source code. It takes about five minutes, and most of that goes to finding the Mods menu.

---

## Mod files

A mod is a folder. Make one anywhere you like, name it `my-first-mod`, and put two files in it:

```
my-first-mod/
  manifest.json
  object.json
```

`manifest.json` identifies the mod. Copy this into it:

```json
{
  "format": "neo-angband/mod/manifest",
  "schemaVersion": 2,
  "data": {
    "id": "my-first-mod",
    "name": "My First Mod",
    "version": "1.0.0",
    "shape": "content",
    "facets": [
      "content"
    ],
    "api": "*",
    "runtime": "data",
    "engine": {
      "range": ">=1.23.0-beta.3",
      "because": "This mod targets the published 1.23.0-beta.3 SDK."
    },
    "author": "your name",
    "license": "GPL-2.0-only",
    "repository": "https://github.com/you/my-first-mod",
    "dependencies": {
      "required": {
        "core": {
          "range": "*"
        }
      }
    },
    "affectsGameplay": true,
    "description": "Daggers hit harder and cost more."
  }
}
```

Every mod needs `repository`, including one you never publish. The game uses it as the mod's identity however the mod was installed: it pins an installed mod to the repository it came from and accepts replacements only from that repository. A mod with no repository can be overwritten by any mod that claims the same id. Set it to the place you plan to publish, or the place you would publish if you did.

`object.json` holds the change:

```json
{
  "fieldPatches": {
    "core:sword--dagger": [
      { "op": "set", "path": "attack.hd", "value": "1d6" },
      { "op": "set", "path": "cost", "value": 300 }
    ]
  }
}
```

Those two files make a complete, working mod.

## What those six lines are saying

`object.json` is the name of one of the game's data files. The base game ships an `object.json` that lists every item in Angband, and your file adds to that file. To change a monster you would write `monster.json` instead. The game reads the file name to know which data you are changing.

`core:sword--dagger` names the record you are changing. The `core:` part says the record belongs to the base game, as opposed to your mod or another mod. The rest is the dagger's identity within its file, which for an object is its `type` and its `name` joined by `--`. You can start with your best guess. If the ref is wrong, the error tells you which rule builds the ref, and you can work out the correct one from the record you meant. The error gives no list of candidates and no "did you mean" suggestion for refs.

When a ref matches nothing, the game skips that one contribution, reports it on your mod's row in the mod manager, and loads everything else in your mod.

`fieldPatches` is a list of small edits. Each one names a path into the record and a new value. `attack.hd` is the damage dice, and `cost` is the base price in gold. Every field you leave out keeps the base game's value, so the dagger stays the same item with two numbers changed.

`"dependencies": { "required": { "core": { "range": "*" } } }` declares that your mod modifies the base game's records. The game rejects the patch without it. A mod can change only records that belong to something it has declared, so no mod can change another mod's records without naming that mod.

The schema 2 envelope holds the manifest under `data`. Content-only mods use `runtime: "data"` and `api: "*"`. Tutorials that run code declare an API 2 range and `runtime: "in-process"`. These examples target SDK 1.23.0-beta.3, which publishes mod API 2.0.0.

## Running it

On the desktop build, put your `my-first-mod` folder into the `mods/` folder next to the game and start the game. Press `Escape`, choose **Mods**, find *My First Mod*, turn it on, and choose **Apply changes and reload**.

In a browser, press `Escape`, choose **Mods**, choose **Choose a mods folder...**, and select the folder that contains `my-first-mod`. Turn the mod on and reload the same way. The game remembers the folder, so to test a change you edit the file and reload the page.

## Check the result

Go to the **Weapon Smiths** (the `3` on the town map), which stocks daggers. The General Store does not sell them. A dagger now costs around 300 gold, up from around 30. Inspect it with `I` and its damage shows `1d6`. It also hits harder in a fight.

Turn the mod off and choose **Apply changes and reload**, and daggers go back to normal. Your mod sits as a layer over the base game and changes no files on your machine, so with the mod off you are playing the vanilla game.

## Variations to try

- Make the dagger lighter: add `{ "op": "set", "path": "weight", "value": 4 }`.
- Change a monster instead. Add a `monster.json` with `{ "fieldPatches": { "core:soldier-ant": [ { "op": "set", "path": "hit-points", "value": 60 } ] } }` and meet a very unreasonable ant on level 1.
- Introduce a mistake. Change `core:sword--dagger` to `core:sword--daggerr` and reload, then read the error while you already know the cause. That message is your main debugging tool.

## Sample mod

[Core's historical tutorial-01-tweak-a-value sample](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials/tutorial-01-tweak-a-value) contains the content contribution. It uses an older manifest format and sample identity. For a new mod, use the schema 2 manifest from these tutorials.

---

**Next:** [Tutorial 2: Add an item](02-add-an-item.md) uses the same approach to create an item the game has never had.
