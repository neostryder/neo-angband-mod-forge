# Tutorial 7: Add an artifact

**What you will make:** the Leather Shield of the Watchful Eye, a unique shield that can appear around dungeon level 12 and never appears twice.

**Before this:** [Tutorial 2](02-add-an-item.md). You can skip tutorials 3 to 6, but do tutorial 2 first. An artifact sits on top of an ordinary item, and it helps to have added one already.

**Time:** ten minutes.

---

## What an artifact actually is

An artifact is a set of changes applied to an item the game already has. The Leather Shield of the Watchful Eye is the leather shield from the leather shield entry in `object.json`, with a new name, better numbers, and a few extra flags. The record names that item in its `base-object` field, and almost every other field is a number describing how the artifact differs from it.

The game generates each artifact at most once per character. An ordinary shield competes through `alloc` with a hundred other shields. For an artifact there is one, or there is not one yet.

The base object supplies the kind's flags, plus its activation if your artifact declares none. The numbers come from the artifact record: `weight`, `ac`, `to-a`, `to-h`, `to-d`, and the damage dice. Any of these you leave out binds to zero, so write every one of them. The properties of the kind itself, such as a leather shield's weight class, its material, and how it reacts to acid, come with the base you name.

## Mod files

```
my-artifact-mod/
  manifest.json
  artifact.json
```

`manifest.json` follows tutorial 1's schema 2 shape with its own `id`, `name`, repository, and description, and keeps the published SDK engine floor. The new file is `artifact.json`:

```json
{
  "records": [
    {
      "name": "of the Watchful Eye",
      "base-object": {
        "tval": "shield",
        "sval": "Leather Shield"
      },
      "level": 12,
      "weight": 50,
      "cost": 14000,
      "alloc": {
        "common": 10,
        "minmax": "12 to 70"
      },
      "attack": {
        "hd": "0d0",
        "to-h": 0,
        "to-d": 0
      },
      "armor": {
        "ac": 8,
        "to-a": 10
      },
      "flags": ["SEE_INVIS", "PROT_FEAR"],
      "values": ["INFRA[2]", "RES_DARK[1]"],
      "desc": [
        "A round shield of boiled leather, its boss worked into a single open eye.",
        "  The eye does not blink, and neither, while you carry it, do you."
      ]
    }
  ]
}
```

Turn the mod on, create a character, and go down. The artifact can generate between dungeon levels 12 and 70, at most once per character, and each character has a chance of finding it with no guarantee.

## The name is not the name

Look at `name` again:

```json
"name": "of the Watchful Eye"
```

`name` holds only the part that follows the base object's name. The game joins the two halves, so `Leather Shield` plus `of the Watchful Eye` shows as *the Leather Shield of the Watchful Eye* in the item list.

Artifact names in the base game follow the same pattern. In `packages/content/pack/artifact.json`, `of Galadriel` becomes the Phial of Galadriel. `'Angrist'`, written in quotes, is a proper name and replaces the base name. Choose the form that reads correctly for your artifact, and keep in mind that you are writing half a name.

The name also has no `&` and no `~`. Tutorial 2's item was `"Padded Jerkin~"`, where `~` marks the place for the plural ending. An artifact is unique, so it is never plural and never needs an article chosen for it. A `~` carried over from tutorial 2 ends up in the item list as *the Leather Shield of the Watchful Eye~*.

## The one thing that will bite you

Both halves of `base-object` have to match an existing entry:

- `tval` is the item type, taken from `object_base.json`: `shield`, `sword`, `hard armor`, `light`, `ring`. These strings belong to the base game, and the armor types use the American spelling, which trips people up.
- `sval` is the base object's name within that type, taken from `object.json` with the `&` and `~` removed. The entry reads `"& Leather Shield~"`, and you write `"Leather Shield"`.

A wrong `tval` drops the artifact, and the mod manager shows a line naming the record and the reason.

A wrong `sval` still loads. The game creates an invisible placeholder base object and builds the artifact on it, which is how the base game's Phial, Star, and Arkenstone work: none of the three has an ordinary version in `object.json`. Because `base-object.sval` is a declared reference, a typo still gets reported by name on your mod's row - *base-object.sval names the base object the artifact is built on "lether shield", and no loaded pack defines it in object*. If you miss that report, the artifact generates and equips on a blank base, with no weight class and none of the base's own behavior, and the item stops behaving like a shield.

Copy the `sval` from `object.json`. It is the one field in this file where a typo leaves the game running with the wrong item in it.

## Patching an artifact the game already has

The same file can change an existing artifact, the way tutorial 3 changed an existing monster. Add this next to your `records`:

```json
  "fieldPatches": {
    "core:angrist": [
      { "op": "add", "path": "armor.to-a", "value": 3 }
    ]
  }
```

`add` is relative: Angrist gets three more points of armor than it already had, whatever that number is. Use `add` when you are adjusting a number and `set` when you are deciding it, and your mod keeps working when the base game retunes the value underneath.

The ref is `core:` followed by the artifact's name in lower case with punctuation removed, so `'Angrist'` becomes `core:angrist`. When a ref does not resolve, the loader reports it by name, and `pnpm exec neo-angband-mod-check` finds those for you.

## Artifact fields

The fields after `base-object` set what the artifact does.

- `level` is how deep the game considers the artifact to be. It feeds into the artifact's price and how strong it is allowed to be.
- `alloc` holds `common`, the weight against everything else eligible, and `minmax`, the depth band it can appear in. `"12 to 70"` keeps it from generating shallower than 12 or deeper than 70.
- `armor.ac` replaces the base object's armor class, and `armor.to-a` is the bonus on top. A weapon uses `attack.hd`, `to-h`, and `to-d` instead.
- `flags` are yes-or-no properties: `SEE_INVIS`, `PROT_FEAR`, `FREE_ACT`, `REGEN`, and many more.
- `values` are properties that carry a number, written in square brackets: `INFRA[2]`, `RES_DARK[1]`, `STR[2]`, `SPEED[5]`.

Both lists live in `packages/content/pack/object_property.json`. Flags and modifiers appear there spelled out in full under `code`, so keep that file open while you write. Resistances are listed differently: a resistance's `code` is the bare element (`resistance:DARK`), and the token you write in `values` is `RES_` plus that element, assembled when the record binds. A search of the file for `RES_DARK` finds nothing. The game refuses an unrecognized flag or value when your mod loads, so you hear about it before you play.

For an artifact that does something when activated, set `act` and `time`, with names from `activation.json`. Start by copying a base-game artifact that already activates and changing its numbers.

## Artifact rules to remember

- An artifact is a set of changes over an existing item, so the record names a `base-object` and the rest is mostly numbers.
- Its `name` is half a name, without the `&` and `~` an ordinary item's name uses.
- A wrong `tval` gets reported. A wrong `sval` builds the artifact on an invented placeholder base, because the base game needs that behavior for the Phial. Copy the sval.
- Use `add` over `set` when you adjust a number the base game owns.

## Sample mod

[Core's historical tutorial-07-add-an-artifact sample](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials/tutorial-07-add-an-artifact) contains the content for this tutorial. It uses an older manifest format and sample identity, so start a new mod from the schema 2 manifest in these tutorials.

**Next:** [Tutorial 8: Add a store](08-add-a-store.md) replaces a storefront and adds a buying rule. The end of the [tutorial index](README.md) lists what to read after these. If you are about to share a mod with somebody, read [REQUIREMENTS.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/REQUIREMENTS.md) first.
