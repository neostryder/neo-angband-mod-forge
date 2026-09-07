# ModForge: quick reference

Make your own mod from inside the game. Pick something that already exists - a
monster, a sword, a shop, a spell - and the workshop shows you what it is made
of, what its neighbours in the game carry for every number, and what would have
to change to make the thing you had in mind. When you are happy it packs the
result up: one button forges it, loads it for this session and reloads the game
so you are playing it, or save it as a file to hand to somebody.

This page is the short version: every setting, what the mod asks the game for,
and where the longer material is. The account of why each of these exists is in
[the repository README](../README.md).

## Settings

Each one is a named toggle on the game's own Mods screen, which shows the full
description. The identifier is the name a save and another mod see; where a
switch has no flag of its own, the game knows it by its section id instead.

| Setting | Identifier | Default | What it does |
| --- | --- | --- | --- |
| Show the workshop tab | `builder.showTab` | on | Puts a small tab in the corner of the main screen. |
| Remember work in progress | `builder.keepDrafts` | on | Keeps unfinished mods between sessions, in this install's own settings rather than in any character's save. |
| Let me test what I built, in the game | `builder.cheatSpawn` | off | Adds a Test panel that arranges the game around the thing you just made, using the game's own debug commands: put one in front of you, go to the depth it belongs at, be the level it is balanced for, carry the gold a shop would want for it, map the level so you can find it. |

## What it needs

- **Engine:** `>=1.0.0`
- **Shape:** `plugin`
- **Facets:** `plugin`
- **Capabilities:** `ui:region.create`, `mod:session`, `debug:wizard`

What a capability string permits, and what a mod that asks for one cannot do
without it, is in [the mod lifecycle
document](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_LIFECYCLE.md).

## Elsewhere

- [README](../README.md), the full account
- [Changelog](../CHANGELOG.md), what changed in each version
- [Planned](../PLANNED.md), what is not built yet
- [The engine seams this mod rides](ENGINE_SEAMS.md)
- [Testing a hand-written plugin.js](PLUGIN_TESTING.md)
- [Installing a
  mod](https://github.com/neostryder/neo-angband/blob/master/docs/MODS.md), the
  route every mod installs by
