# Tutorial 4: Change a spell

**What you will make:** a Priest whose Minor Healing costs 1 mana instead of 2 and almost never fails.

**Before this:** [Tutorial 3](03-add-a-monster.md).

**Time:** ten minutes.

---

## Mod files

```
my-spell-mod/
  manifest.json
  class.json
```

Copy tutorial 1's schema 2 manifest and give it a new id, name, repository, and description. Keep its Core dependency.

`class.json`:

```json
{
  "fieldPatches": {
    "core:priest": [
      { "op": "set", "path": "book.0.spell.2.mana", "value": 1 },
      { "op": "set", "path": "book.0.spell.2.fail", "value": 5 }
    ]
  }
}
```

These are the same `fieldPatches` you used in Tutorial 1, aimed at a class this time. The target is the only new part.

## Reading the path

`book.0.spell.2.mana` walks down through the Priest's record:

- `book.0`: the Priest's first spell book.
- `spell.2`: the third spell in it (counting from zero). That is Minor Healing.
- `mana`: its cost.

`fail` is the percentage chance that the spell fizzles, before your character's stats adjust it.

To find the spell you want, open `packages/content/pack/class.json`, find your class, and count. Books and spells appear in the same order as in the game's spell menu, so you can also count them on screen.

## Positional paths can target the wrong spell

Each number in the path is a position. `spell.2` means whatever spell sits third in the book, whether or not that is Minor Healing. If another mod inserts a spell above it, or a future release of the base game reorders that book, your patch changes a different spell and gives no warning, because the patch still applies cleanly.

Positional paths are how the data is shaped, and there is no way around them today. If you publish a spell mod, say which release you built it against and re-check it when the game updates. Core's sample test asserts that `book.0.spell.2` is still called Minor Healing, so a reorder fails that test before it can make this page wrong.

## Adding a spell rather than changing one

Adding a spell uses the same mechanism with one extra step. `set` a whole spell object at the next free index, then raise the book's `spells` count so the game reads the longer book:

```json
{
  "fieldPatches": {
    "core:priest": [
      { "op": "set", "path": "book.2.spell.6", "value": { "name": "Teleport Other", "level": 18, "mana": 10, "fail": 30, "exp": 20, "effect": [ { "eff": "BOLT_STATUS", "type": "AWAY_ALL", "dice": "$B", "expr": [ { "name": "B", "base": "PLAYER_LEVEL", "expr": "* 3" } ] } ], "desc": ["Produces a bolt that teleports away the first monster in its path."] } },
      { "op": "set", "path": "book.2.spells", "value": 7 }
    ]
  }
}
```

The `feature-restoration` mod does this to give the Priest back a spell that a later version of Angband dropped, and these four numbers are the ones it ships.

The numbers differ from the old game's. Angband 4.1.2 gave the Priest this spell as `Teleport Other:20:20:80:16`, in that file's `name:level:mana:fail:exp` order, and Core keeps those records at `reference/lib/gamedata/old_class.txt`. Angband 4.2 then repriced spells so each one costs the same in every class that has it, and both classes that still have Teleport Other pay 10 mana at 30 percent failure. Copying 20 and 80 into the current game would charge a Priest twice the mana a Mage pays for the same spell. When you restore something, read the old data, then check whether its units still mean what they meant. [Feature restoration](https://github.com/neostryder/neo-angband/blob/master/docs/modding/FEATURE_RESTORATION.md) sets out this rule, and its worked example is this spell.

The `effect` block uses the game's own effect vocabulary: `BOLT_STATUS`, `PLAYER_LEVEL`, and dice expressions. You can go beyond the effects the base game ships, but a new effect needs code, which [Tutorial 5](05-hook-behaviour.md) and the pages after it cover.

## Check the result

Roll a Priest, learn Minor Healing, and open the spell menu. The mana cost reads 1, and the failure rate is far lower than an unmodded Priest's at the same level.

## Variations to try

- Retune a different class: `core:mage`, `core:ranger`, `core:paladin`.
- Move a spell earlier: set its `level` to 1 to get it at character creation.
- Make a class worse at something. A weakness is often what makes a variant interesting to play.

## Sample mod

[Core's historical tutorial-04-change-a-spell sample](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials/tutorial-04-change-a-spell) holds the content contribution for this tutorial. It uses an older manifest format and sample identity, so start a new mod from the schema 2 manifest in these tutorials.

---

**Next:** [Tutorial 5: Hook behavior](05-hook-behaviour.md), the first tutorial where your mod runs code. The earlier tutorials ship data only.
