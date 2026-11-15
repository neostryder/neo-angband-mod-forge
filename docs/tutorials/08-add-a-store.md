# Tutorial 8: Add a store

**What you will make:** The Adventurer's Exchange, a new shop in town that stocks expedition supplies and buys enchanted swords the ordinary shops turn away.

**Before this:** [Tutorial 2](02-add-an-item.md), for content files, and [Tutorial 5](05-hook-behaviour.md), for the one small `plugin.js` this shop needs.

**Time:** fifteen minutes.

---

## One limit worth knowing first

The town has eight storefronts. Their entrance features are part of the game the port is reproducing, so a mod cannot invent a ninth one with a new terrain code. What it *can* do is turn one of those storefronts into its own shop: give it a new name, stock table, owners and buying rule. That is a new shop to the player, and it is the portable move a mod can make.

We are taking over the Black Market's building. The Black Market is still in the base game underneath your mod; turn the mod off and it comes back exactly as it was. Nothing in this tutorial edits the game's source files.

## Mod files

```
my-store-mod/
  manifest.json
  terrain.json
  store.json
  plugin.js
```

This mod changes records *and* runs one buying rule, so its manifest declares both facets. Copy this as `manifest.json`:

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
    "description": "Turns the Black Market into the Adventurer's Exchange.",
    "capabilities": [
      "engine:access",
      "registry:store"
    ]
  }
}
```

`registry:store` is a promise to the player, shown before they enable your plugin: this mod changes a shop rule. It also opens `mod.engine.registry.stores` for the rule below. A content-only shop needs no capability; this one has a small bit of behavior as well.

## Give the building a new name

`terrain.json` changes what the town door says when the player looks at it:

```json
{
  "fieldPatches": {
    "core:black-market": [
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

The ref is `core:black-market` because a terrain record is named by its visible `name`. You do not have to know that rule in advance: open `packages/content/pack/terrain.json`, find the building you want, and copy its name into the ref in lower case with spaces changed to `-`.

We did not change its glyph, its color or its `SHOP` flag. Keeping the existing entrance is what makes this a supported replacement rather than a request for a new town slot.

## Stock the shop

`store.json` is the shop behind that entrance. It uses the entrance's stable code, not the name you just put on the sign:

```json
{
  "fieldPatches": {
    "core:store-black": [
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

`normal` is the pool the shop rolls from. `always` is the list it keeps on the shelf: this Exchange never runs out of food or shovels. `buy` is the ordinary rule for what it will buy from the player. The names under `sval` are copied from `packages/content/pack/object.json`, without the item's `&` and `~` marks.

`set` replaces the Black Market's table with yours. That is right here: this is one storefront becoming a different shop. If you are merely adding one item to a shop that stays itself, use Tutorial 2's `append` instead.

## The one rule data cannot say

The Exchange should also buy an **enchanted sword**. It does not buy ordinary swords, and that distinction is a question about the item in the player's hand, not a line a `buy` table can express. That is what the store registry is for.

Make `plugin.js`:

```js
export default {
  api: ">=2.0.0 <3.0.0",

  start(mod) {
    const engine = mod.engine;
    const host = engine?.registry;
    const exchange = engine?.registries?.stores.byName("STORE_BLACK");
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

The published API 2.0 engine domain provides the live store registry during `start`. This in-process example requests `engine:access` and `registry:store`; it cannot run in a Worker. The player must grant engine access. If the domain or shop is absent, the plugin leaves the data-only storefront in place.

The buying exception calls the public `engine.core.objectKnownView(state, shop.obj)` helper and reads its `known` result. The published object has no stored `known` twin; the helper supplies the player-known copy. A hidden enchantment never qualifies. The plugin reads no live bonus values. Calling `coreWillBuy(shop)` preserves the base game's ordinary buying rules for every other item; the known enchanted-sword exception deliberately accepts that sword first.

`objectId` arrives with mod API 2.1. It will identify an item across known-view updates; this synchronous registry rule does not need it.

## Check the result

Turn the mod on from **Mods** and choose **Apply changes and reload**. In town, the `7` building is now the **Adventurer's Exchange**. It rotates supplies, but there is always food and a shovel. Try selling it an ordinary Dagger: it refuses. Identify a dagger with a positive attack bonus, or use wizard mode to create and identify one, and the shop will buy it. A bonus the player has not learned does not qualify.

Turn the mod off and reload. The sign, stock and buying rule all disappear with it; the Black Market returns. That is the useful difference between a mod and a local edit: the base game never stopped being itself.

## Variations to try

- Take over a different storefront. Copy its terrain name and its `STORE_*` code from `terrain.json` and `store.json`; they are different names for the same door, and each file uses the one it owns.
- Make the shop a real specialist. Add an item from Tutorial 2 to its `normal` list, and keep both files in this mod so the item and its stock line arrive together.
- Change the exception. `engine.core.TV.SWORD` is the sword item class; use a different existing `TV` value and a player-known item field you can explain to the player.
- Remove `plugin.js`, both capabilities, and the `plugin` facet, and set `runtime` to `data` and `api` to `*`. The shop still has its sign and stock, but it no longer has the enchanted-sword exception. That is the clean boundary between content and behavior.

## Sample mod

The four files above are the complete mod. Keep them together in one folder: the terrain and store patches name the same Black Market doorway, and the plugin finds that doorway through the live registry.

---

**Next:** the [authoring guide](../AUTHORING.md) is the reference for the rest of the record files, once you are comfortable making a small mod from scratch.
