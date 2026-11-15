# Tutorial 8: Add a store

In this tutorial you build the Adventurer's Exchange, a new shop in town that stocks expedition supplies and buys the enchanted swords the ordinary shops turn away. It takes fifteen minutes. Work through [Tutorial 2](02-add-an-item.md) first for content files, and [Tutorial 5](05-hook-behaviour.md) for the one small `plugin.js` this shop needs.

---

## One limit worth knowing first

The town has eight storefronts. Their entrance features come from the game the port reproduces, so a mod cannot add a ninth one with a new terrain code. A mod can turn one of the eight into its own shop with a new name, stock table, owners, and buying rule. The player sees a new shop, and this is the portable way for a mod to add one.

This tutorial takes over the General Store's building. The General Store stays in the base game under your mod, and turning the mod off brings it back unchanged. Nothing in this tutorial edits the game's source files.

## Mod files

```
my-store-mod/
  manifest.json
  terrain.json
  store.json
  plugin.js
```

This mod changes records and also runs one buying rule, so its manifest declares both facets. Copy this as `manifest.json`:

```json
{
  "format": "neo-angband/mod/manifest",
  "schemaVersion": 2,
  "data": {
    "id": "my-store-mod",
    "name": "My Store Mod",
    "version": "1.0.0",
    "shape": "content",
    "facets": [
      "content",
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
    "repository": "https://github.com/you/my-store-mod",
    "dependencies": {
      "required": {
        "core": {
          "range": "*"
        }
      }
    },
    "affectsGameplay": true,
    "description": "Turns the General Store into the Adventurer's Exchange.",
    "capabilities": [
      "engine:access",
      "registry:store"
    ]
  }
}
```

`registry:store` tells the player, before they enable your plugin, that this mod changes a shop rule. It also opens `mod.engine.registry.stores` for the rule below. A shop made only of content needs no capability, and this one asks for it because it also carries a small piece of behavior.

## Give the building a new name

`terrain.json` changes what the town door says when the player looks at it:

```json
{
  "fieldPatches": {
    "core:general-store": [
      { "op": "set", "path": "name", "value": "Adventurer's Exchange" },
      {
        "op": "set",
        "path": "desc",
        "value": [
          "A practical shop for people who expect to come back from the dungeon."
        ]
      }
    ]
  }
}
```

The ref is `core:general-store` because a terrain record is named by its visible `name`. To find the ref for any building, open `packages/content/pack/terrain.json`, find the building you want, and copy its name into the ref in lower case with spaces changed to `-`.

The patch leaves the glyph, the color, and the `SHOP` flag as they were. Because the entrance stays the same, the Exchange counts as a supported replacement of an existing storefront and needs no new town slot.

## Stock the shop

`store.json` is the shop behind that entrance. It refers to the entrance by its stable store code, which stays the same when the sign changes:

```json
{
  "fieldPatches": {
    "core:store-general": [
      {
        "op": "set",
        "path": "owner",
        "value": [
          { "purse": 12000, "name": "Rilla the Well-Prepared (Dwarf)" },
          { "purse": 18000, "name": "Nori the Far-Walker (Human)" }
        ]
      },
      { "op": "set", "path": "slots", "value": { "min": 5, "max": 10 } },
      { "op": "set", "path": "turnover", "value": 6 },
      {
        "op": "set",
        "path": "normal",
        "value": [
          { "tval": "digger", "sval": "Shovel" },
          { "tval": "digger", "sval": "Pick" },
          { "tval": "light", "sval": "Wooden Torch" },
          { "tval": "flask", "sval": "Flask of Oil" },
          { "tval": "cloak", "sval": "Cloak" }
        ]
      },
      {
        "op": "set",
        "path": "always",
        "value": [
          { "tval": "food", "sval": "Ration of Food" },
          { "tval": "digger", "sval": "Shovel" }
        ]
      },
      {
        "op": "set",
        "path": "buy",
        "value": ["digger", "light", "flask", "cloak"]
      }
    ]
  }
}
```

`normal` is the pool the shop rolls its stock from. The General Store uses this table, and the Black Market ignores it in favor of its own random-stock path. `always` lists what stays on the shelf, so this Exchange always has food and shovels. `buy` is the ordinary rule for which items the shop buys from the player. The names under `sval` come from `packages/content/pack/object.json`, with the item's `&` and `~` marks removed.

`set` replaces the General Store's table with yours, which fits here because one storefront is becoming a different shop. To add one item to a shop that keeps its identity, use Tutorial 2's `append` instead.

## The one rule data cannot say

The Exchange also buys enchanted swords while turning away ordinary ones. That decision depends on the particular item in the player's hand, and a `buy` table has no line for it. The store registry handles rules like this.

Make `plugin.js`:

```js
export default {
  api: ">=2.0.0 <3.0.0",

  start(mod) {
    const engine = mod.engine;
    const host = engine?.registry;
    const exchange = engine?.registries?.stores.byName("STORE_GENERAL");
    if (!host || !exchange) return;

    const coreWillBuy = host.stores.willBuyFor("*");
    if (!coreWillBuy) return;

    host.stores.setWillBuy(exchange.feat, (shop) => {
      const state = engine.state;
      if (!state) return coreWillBuy(shop);
      const { known } = engine.core.objectKnownView(state, shop.obj);
      if (
        known.tval === engine.core.TV.SWORD &&
        (known.toH > 0 || known.toD > 0)
      ) {
        return true;
      }
      return coreWillBuy(shop);
    });
  },
};
```

During `start`, the published API 2.0 engine domain provides the live store registry. This example runs in-process and requests `engine:access` and `registry:store`. It cannot run in a Worker, and the player must grant engine access. If the engine domain or the shop is missing, the plugin returns and the data-only storefront stays in place.

For the buying exception, the plugin calls the public `engine.core.objectKnownView(state, shop.obj)` helper and reads its `known` result. The published object carries no stored `known` twin, so the helper supplies the player-known copy. A hidden enchantment never qualifies, and the plugin reads no live bonus values. The plugin accepts a known enchanted sword first and passes every other item to `coreWillBuy(shop)`, which applies the base game's ordinary buying rules.

`objectId` arrives with mod API 2.1 and will identify an item across known-view updates. This synchronous registry rule has no use for it.

## Check the result

Turn the mod on from **Mods** and choose **Apply changes and reload**. In town, the `1` building is now the Adventurer's Exchange. Its supplies rotate, and it always has food and a shovel. Offer it an ordinary Dagger and it refuses. Identify a dagger with a positive attack bonus, or create and identify one in wizard mode, and the shop buys it. A bonus the player has not learned does not count.

Turn the mod off and reload. The sign, the stock, and the buying rule all go away with it, and the General Store returns as the base game had it.

## Variations to try

- Take over a different storefront. Copy its terrain name and its `STORE_*` code from `terrain.json` and `store.json`. Both name the same door, and each file uses the name it owns.
- Make the shop a specialist. Add an item from Tutorial 2 to its `normal` list, and keep both files in this mod so the item and its stock line arrive together.
- Change the exception. `engine.core.TV.SWORD` is the sword item class. Swap in a different existing `TV` value and a player-known item field you can explain to the player.
- Remove `plugin.js`, both capabilities, and the `plugin` facet, then set `runtime` to `data` and `api` to `*`. The shop keeps its sign and stock and loses the enchanted-sword exception, which is the only part that needed the plugin.

## Sample mod

The four files above are the complete mod. Keep them together in one folder. The terrain and store patches name the same General Store doorway, and the plugin finds that doorway through the live registry.

---

**Next:** once you can make a small mod from scratch, the [authoring guide](../AUTHORING.md) is the reference for the rest of the record files.
