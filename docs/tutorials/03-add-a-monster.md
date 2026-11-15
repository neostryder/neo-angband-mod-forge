# Tutorial 3: Add a monster

**What you will make:** a carpenter ant, a slightly nastier cousin of the soldier ant, living on dungeon level 2.

**Before this:** [Tutorial 2](02-add-an-item.md).

**Time:** ten minutes.

---

## Mod files

```
my-monster-mod/
  manifest.json
  monster.json
```

`manifest.json` uses tutorial 1's schema 2 envelope with a new id, name, repository, and description. The new file is `monster.json`:

```json
{
  "records": [
    {
      "name": "carpenter ant",
      "base": "ant",
      "color": "u",
      "speed": 110,
      "hit-points": 11,
      "hearing": 10,
      "smell": 20,
      "armor-class": 6,
      "sleepiness": 40,
      "depth": 2,
      "rarity": 1,
      "experience": 6,
      "blow": [{ "method": "BITE", "effect": "HURT", "damage": "1d4" }],
      "desc": ["A big brown ant with jaws that strip wood. It is not fussy about what else they strip."]
    }
  ]
}
```

## The one thing that will bite you

The `base` field causes the most trouble in a first monster mod. Every monster inherits from a *monster base*, a template that sets its symbol on the map, what it is made of, which attacks it can have, and many other defaults. `ant` ships with the base game, along with `canine`, `orc`, `dragon`, and fifty-odd others. They live in `packages/content/pack/monster_base.json`, which holds 56 records and is short enough to read.

A wrong `base` gets reported twice. `base` is a declared reference, so composition names the problem on your mod's row: *base names the monster base "aunt", and no loaded pack defines it in monster_base*. The monster binder then skips the record entirely, so no monster gets built without a template. Copy the `base` from an existing monster of the kind you are making, and check it against `monster_base.json` if you typed it from memory.

A wrong base is the most common way a first monster mod fails, and Core's sample test checks that the base exists.

## Reading the rest

As with items, find a monster close to what you want in `packages/content/pack/monster.json` and copy its shape.

- `speed`: 110 is normal walking pace, the same as an unhasted player. 120 is fast enough to be dangerous.
- `depth` and `rarity`: where it lives and how often it shows up there.
- `experience`: the player gets `experience * the monster's level / the player's level`, so the same monster is worth steadily less as the character grows.
- `sleepiness`: how likely it is to be asleep when you arrive. 0 means it is always awake and coming for you.
- `blow`: a list. Each entry is a `method` (how it attacks), an `effect` (what that does to you), and `damage` dice. Three blows means three attacks per turn. The available methods and effects are in `blow_methods.json` and `blow_effects.json` beside the monster file.
- `color`: a single letter, and the case matters. `u` is Umber (brown), `y` is Yellow, and `w` is White. `W` is Light Slate, the soldier ant's color. `packages/core/src/color.ts` is the chart.

## Check the result

Start a character, descend to level 2, and look for a brown `a`. Look it up with `/` or recall it with `l`, and the game describes it with the text you wrote.

## Variations to try

- Make it a unique: add `"flags": ["UNIQUE"]`, give it a capitalized proper name, and give it a lot more hit points.
- Give it a second blow by adding another entry to the `blow` array.
- Make it fast and fragile: `speed` 130, `hit-points` 4.
- Add a whole family: several records in one array, sharing a base.

## Test a bad base reference

Change `"base": "ant"` to `"base": "aunt"` and reload. Composition reports the missing base on your mod's row, and the binder does not build the ant. This is the failure described in [The one thing that will bite you](#the-one-thing-that-will-bite-you), and once you have triggered it yourself you will recognize it quickly in your own mods.

## What it looks like, and the one thing you have to ask for

Your ant's appearance has two parts, and you wrote one of them:

- `"color": "u"` is yours: umber, so it draws as a brown `a` and reads as a different creature from the white `a` beside it.
- The letter `a` comes from `"base": "ant"`, along with everything else the template carries. Change the base and the letter changes.

In a tile set, your ant has no picture, and the game does not make one up. A tile set maps named monsters to pictures and has no entry for yours, so in tile mode a player sees your brown `a` standing among pictures. Older versions drew an added monster with the tile of a relative sharing its `base`, and 0.23.0 removed that. Neo Angband is a faithful port of 4.2.6, and 4.2.6 has no rule for drawing a creature it has never heard of. Picking a picture for an unknown creature is left to the tile set.

Ship tiles with your content if you can, and if you do not, say so in your mod's description. Two sentences there tell a player what they are looking at, so a letter among pictures does not look like a broken mod:

> Includes tiles for the carpenter ant.

or

> No tiles of its own: in tile mode the carpenter ant draws as a letter. Install [linoleum](https://github.com/neostryder/neo-angband-mod-linoleum) and it is drawn from its family instead.

The second description points players at a working fallback. Linoleum, the loose-pack tile mod, draws content that has no tile: an added monster gets the tile of a relative sharing its `base`, with the color turned, so your carpenter ant looks like an ant without matching the base game's ant pixel for pixel. This works with Linoleum's own packs only. Angband's own tile sheets have no spare cell for a variant, so under them an added creature draws as a letter. Players turn Linoleum on themselves. Your mod is complete and correct in ASCII with no tile set at all, so do not list Linoleum as a requirement. Mention it and let the player choose.

`base` sets the letter and the template, and for anyone running a tile mod that fills blanks, it also sets the family your monster borrows a picture from. Pick it with that in mind.

A mod can also ask for a specific picture. Both ways to do it go beyond this tutorial:

- Point at a picture that already exists. Declare a JSON preferences document as a `prefs` resource, with tile assignments for the target graphics pack. Atlas coordinates belong to that pack, so a coordinate from one pack can show the wrong tile in another. See [Core's JSON preference format](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#shipping-resources-sounds-a-font-pref-files-help-pages-art).
- Ship a whole tile set. A mod with the `tiles` facet contributes a graphics mode of its own (`tilePacks`), and the Linoleum sets are delivered this way. The player picks the whole set from the Graphics menu. Nothing supports adding one picture to somebody else's set today.

See [modding/README.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/README.md) for both.

## Changing a monster that already exists

One file can add records and patch existing ones, and the finished mod does both. Here is the patching from [Tutorial 1](01-tweak-a-value.md) applied to a monster:

```json
{
  "records": [ ... your carpenter ant ... ],
  "fieldPatches": {
    "core:giant-black-ant": [
      { "op": "add", "path": "hit-points", "value": 3 },
      { "op": "addFlag", "path": "flags", "flag": "GROUP_AI" }
    ]
  }
}
```

Giant black ants now have a little more health and hunt in groups.

- `add` adjusts the current value. `{"op": "add", "path": "hit-points", "value": 3}` means "three more than whatever it is", so the patch still gives the intended result if the base game retunes the monster or another mod changed it first. `set` would silently undo both.
- `addFlag` composes. Two mods adding different flags to the same monster both get their flag, with no conflict. `addFlag`, `removeFlag`, and `append` compose this way. With `set`, `merge`, `add`, or `mul`, two mods on the same field is a reported conflict, and the mod that loads last wins.

A patched monster keeps its picture, because the tile set already knows it by name. Only the ant you added has nothing drawn for it.

## Sample mod

[Core's historical tutorial-03-add-a-monster sample](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials/tutorial-03-add-a-monster) contains the content contribution. It uses an older manifest format and sample identity. Use the schema 2 manifest from these tutorials for a new mod.

---

**Next:** [Tutorial 4: Change a spell](04-change-a-spell.md) covers reaching into a class's spell list and what a positional path costs you.
