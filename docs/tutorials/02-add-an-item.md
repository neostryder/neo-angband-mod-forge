# Tutorial 2: Add an item

In this tutorial you add one new piece of armor that the base game has never heard of. Players can find it in the dungeon and buy it in town. It takes ten minutes and builds on [Tutorial 1](01-tweak-a-value.md), which explains what a mod folder is and how to load one.

---

## Mod files

The mod is a folder with two files:

```
my-item-mod/
  manifest.json
  object.json
```

`manifest.json` has the same shape as in Tutorial 1, with a new id:

```json
{
  "format": "neo-angband/mod/manifest",
  "schemaVersion": 2,
  "data": {
    "id": "my-item-mod",
    "name": "My Item Mod",
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
    "repository": "https://github.com/you/my-item-mod",
    "dependencies": {
      "required": {
        "core": {
          "range": "*"
        }
      }
    },
    "affectsGameplay": true,
    "description": "Adds a padded jerkin."
  }
}
```

`object.json`:

```json
{
  "records": [
    {
      "name": "Padded Jerkin~",
      "type": "soft armor",
      "graphics": { "glyph": "(", "color": "U" },
      "level": 1,
      "weight": 60,
      "cost": 12,
      "alloc": { "common": 20, "minmax": "1 to 40" },
      "attack": { "hd": "0d0", "to-h": "0", "to-d": "0" },
      "armor": { "ac": 5, "to-a": "0" },
      "desc": ["A quilted jacket stuffed with wool. It is warm, and very slightly protective."]
    }
  ]
}
```

## What changed from Tutorial 1

The data file uses `records` where Tutorial 1 used `fieldPatches`. A `fieldPatches` entry edits something that already exists, and a `records` entry adds something new that your mod owns. The folder, the manifest, and the way you load the mod all work the same as before.

## Reading the record

Most of these fields are Angband's own vocabulary, so the base game's data works as your reference manual. To learn how to express something, find an item that already does it and copy how it says so.

- `name`: the trailing `~` marks where the plural goes. "Padded Jerkin~" displays as *a Padded Jerkin* and *2 Padded Jerkins*. An item whose name starts with `&` (`"& Dagger~"`) takes an article. These marks come from the original game, so copy the punctuation of an existing name when you write a new one.
- `type`: the kind of item. `soft armor` puts it in the body armor slot and in the armory's stock. Pick a type the game already has. [Core's new item class reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/AUTHORING.md#a-new-item-class) covers declaring another class.
- `level`: the depth at which it starts appearing.
- `alloc`: how often it appears, and between which depths. `common: 20` is roughly the frequency of ordinary early gear, and `"1 to 40"` is the depth window.
- `armor.ac`: the armor it gives. Soft Leather Armor has 8 and costs 20, so 5 for 12 gold makes the jerkin a worse, cheaper option.
- `desc`: an array of lines, shown when the player inspects the item.

To pick the numbers, open `packages/content/pack/object.json` in Core and find an item like the one you want. That file holds the base game's data in the same format your mod writes, so the nearest existing item is always a working template. The `draftRecord` helper does this for you: it fills in a new record from the game's comparable records, including a sensible price. See [AUTHORING.md](../AUTHORING.md).

## Check the result

Your item exists in the game as soon as the mod is on. It generates in the dungeon within its depth window, monsters can carry one, and wearing it raises your armor class by 5. Wizard mode is the quick way to confirm it, or you can dive until one drops.

No shop stocks it yet. A shop's stock comes from that shop's own table, and your item is on none of them until the shop section below adds it.

The game knows your item as `my-item-mod:soft-armor--padded-jerkin`. An `object` record's identity is its `type` and its `name` joined by `--`, so the ref includes the type along with the name. The same rule made Tutorial 1's dagger `core:sword--dagger`. The `my-item-mod:` part is your own namespace, so your item never collides with one from the base game or another mod, even if both of you add a Padded Jerkin.

## Variations to try

- Make it cursed-cheap and heavy: `weight` 200, `cost` 2.
- Make it rare and deep: `level` 30, `alloc` `{ "common": 3, "minmax": "30 to 100" }`.
- Add a second item in the same `records` array. The array takes any number of items.
- Give it an ego possibility, or a flag. Find an item in the base game's `object.json` that has the property you want and copy the field across.

## What your item joins automatically

Your Padded Jerkin is a soft armor, and the game treats it as one everywhere with no extra work from you:

- Egos, runes, and brands apply to it. An ego declares the kinds of item it can land on, and "of Resist Acid" names `soft armor`, so it covers your jerkin. A player can find a Padded Jerkin of Resist Fire without anyone adding it to a list.
- Quality enchantment applies. It can turn up as `[5,+6]`, and its price is recomputed from what it ended up being, so the `cost` you wrote does not set the final price.
- It generates in the dungeon at the depths your `alloc` names, and it is in the drop tables from the moment the mod is on.
- Shops will buy it, because a shop's buy list also goes by item kind.

## One thing that does NOT happen: a picture

In ASCII your jerkin draws with its class's symbol and needs nothing from you. In tile mode it has no picture, and the game does not invent one. A tile set maps named items to pictures and has never heard of yours, so a player in tile mode sees a letter among pictures. Before 0.23.0 the game guessed, drawing an added item with the tile of another item sharing its `tval`. Version 0.23.0 removed that guess. Angband 4.2.6 has no concept of an item a mod added, so it has no opinion about how one should look, and choosing art for one is the tile set's job.

If you ship content, ship tiles for it. If you do not, say so in your mod's description and point players at a tile mod that fills blanks:

> No tiles of its own: in tile mode the Padded Jerkin draws as a letter. Install [linoleum](https://github.com/neostryder/neo-angband-mod-linoleum) and it is drawn from another item of its type instead.

Under its own tile packs, Linoleum draws an added item from a kind sharing its `tval`, with the color turned. Under Angband's own tile sheets an added item keeps its letter, because those sheets are a fixed grid with no spare cell for a variant. Leave Linoleum out of your dependencies. Your mod is complete in ASCII with no tile set at all, and a player using a different set should not have to install one they will not look at.

## Putting it in a shop

Shops do not stock a new item on their own. The original game works the same way: a store's stock list names specific items, so a new item has to be added to the list.

Adding a line to a list takes one op. Make a `store.json` beside your `object.json`:

```json
{
  "fieldPatches": {
    "core:store-armor": [
      {
        "op": "append",
        "path": "normal",
        "values": [{ "tval": "soft armor", "sval": "Padded Jerkin" }]
      }
    ]
  }
}
```

Restart and walk into the Armory. Your jerkin is in the rotation with everything else: sometimes in stock and sometimes out, at whatever enchantment the store rolled, and priced from what it turned out to be. The stock roll picks from the store's own table and ignores your item's `alloc` window, so a shop can offer it at any depth. `alloc` controls where the item generates in the dungeon.

About that patch:

- `core:store-armor` is the store's record id: its code, `STORE_ARMOR`, lowercased with `_` turned into `-`. That rule belongs to the STORE file. Each data file declares what identifies its records, and `packages/mod-sdk/src/record-key.ts` holds the table of them. Most files use `name`. `object` uses `type` plus `name`. `brand`, `slay`, and `projection` use `code`. `constants` and `visuals` have one record each and are named by the file.
- `normal` is the "may stock" table, and `always` holds the staples. Appending to `always` makes a shop keep one on the shelf at all times, which suits few items. The Armory ships no `always` list, so an append to one there has nothing to append to, and the game reports it.
- `sval` is the item's name without the `~`. If it matches no existing item, the game drops that one line from the shop's table and reports it against your mod in the mod manager. A typo costs you one line, and the report tells you which one.

`append` lets two shop mods coexist. It adds to the list without restating it, so the store's existing entries stay, and a second mod appending to the same store keeps its entry too. No mod has to copy a list out of the base game's data and watch it go stale. Its counterpart, `removeValue`, drops an entry and can take out something another mod added, so the game reports it as a conflict and the mod that loads last wins.

Your `store.json` names your item, so it only works while your `object.json` is also loaded. This tutorial keeps both in the same mod. You can split them, and a shop mod that stocks another mod's item is a reasonable thing to write. In that case, when the other mod is turned off, your appended line names nothing. The shop loses that line, the mod manager says so on your mod's row, and the rest of the Armory stays as it was. Declare the other mod in your `dependencies` so the player is told before that happens.

## Sample mod

[Core's historical tutorial-02-add-an-item sample](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials/tutorial-02-add-an-item) contains the content contribution. It uses an older manifest format and sample identity. For a new mod, use the schema 2 manifest from these tutorials.

---

**Next:** [Tutorial 3: Add a monster](03-add-a-monster.md) makes the same move in a different file and covers the base reference that the checker reports by name.
