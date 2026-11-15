# Make a mod

These eight tutorials are for people who have never made a mod. They assume you can edit a text file and nothing else. The first one takes about five minutes and changes the game.

You can skip TypeScript, a compiler, a build step, an account, and a copy of Angband's source. A mod is a folder with a couple of files in it.

---

## The eight tutorials

Each tutorial teaches one idea and ends with something you can see on screen.

| | Tutorial | What you learn | Files |
| --- | --- | --- | --- |
| 1 | [Change one thing](01-tweak-a-value.md) | Editing a value the game already has | 2 |
| 2 | [Add an item](02-add-an-item.md) | Adding something the game has never seen | 3 |
| 3 | [Add a monster](03-add-a-monster.md) | The same move in another file, plus the one field most likely to trip you up | 2 |
| 4 | [Change a spell](04-change-a-spell.md) | Reaching into a class, and what a positional path costs | 2 |
| 5 | [Hook behavior](05-hook-behaviour.md) | Running your mod's code, in ten lines | 2 |
| 6 | [Add an option](06-add-an-option.md) | Letting the player switch your change on and off | 2 |
| 7 | [Add an artifact](07-add-an-artifact.md) | Building on top of an item the game already has | 2 |
| 8 | [Add a store](08-add-a-store.md) | Turning a town storefront into your own shop, and adding one shop rule | 4 |

If you are new, do them in order. Each one builds on the ones before it and is short enough to read in full before you type anything. Tutorial 7 needs only tutorial 2, so you can jump to it if you came here to make an artifact. Tutorial 8 needs tutorials 2 and 5, and it is the place to jump to if you came here to make a shop.

Tutorials 1 through 7 have [historical sample folders in Core](https://github.com/neostryder/neo-angband/tree/master/samples/tutorials). The code samples there for tutorials 5 and 6 still use API 1, so use the API 2 code on these pages instead. Tutorial 8's complete files are on its page. ModForge tests the local API 2 examples and embeds all eight lessons in the workshop.

To try a sample, copy its folder into the desktop `mods/` folder, or in a browser use **Choose a mods folder...** to select the folder that contains it. Use the schema 2 manifest from these tutorials with your own id and repository. For tutorials 5 and 6, also swap in the API 2 version of the script from these pages.

---

## Why not just edit Angband?

Angband has been customizable from text files for decades, and if editing those files works for you, keep doing it.

A Neo Angband mod turns your change into something portable:

- The base game stays untouched, and your change sits in a layer over it.
- The mod has an off switch, and turning it off gives back the unmodified game exactly as it was.
- You share a folder or a repository link. Nobody has to apply a patch file or maintain a fork.
- Mods from several people combine without any of them having to know about each other.
- You can expose settings so players can tune the mod without editing it.
- The game can update underneath the mod without you re-applying anything.
- The same system that changes one number can carry an entire variant.

That range runs from "I miss this one feature" to "I want to build the next ZAngband," and both ends use the same mechanism. Tutorial 1 is the first end, and no structural barrier separates it from the second. A total conversion uses this same system at full scale: it depends on the base game, replaces what you do not want, and adds your own world.

---

## Vanilla stays vanilla

Easy modding raises a fair worry: a community could end up with a thousand personal versions of the game and no shared ground. Neo Angband keeps a shared baseline in three ways.

- The base game ships as the shared vanilla target: the latest official Angband release, reproduced faithfully, with no mods enabled. An untouched install gives you that game, and the project measures itself against it.
- The project bundles no mods at all, including the author's own. Every mod installs the same way yours would.
- Every mod is a layer you can name, list, and remove. A game's diagnostics record its enabled mods and their versions, and the character dump includes the same list, so any two people can check whether they were playing the same thing.

---

## Ideas for a first mod

Some starting points for your first folder:

- Bring back a feature an older Angband had and a newer one dropped
- Add a monster, or a family of them
- Add an artifact worth descending for, which is [tutorial 7](07-add-an-artifact.md)
- Write a new spell, or move one to a class that never got it
- Change what the stores stock, or how they price it
- Add a quality-of-life behavior that has been annoying you for years
- Replace the graphics
- Automate something tedious
- Build a themed content pack, a whole dungeon's worth of one idea
- Try a mechanic nobody has tried, and find out why nobody has
- Rebalance a class you think has always been wrong
- Eventually: your own variant

The [feature restoration](https://github.com/neostryder/neo-angband/blob/master/docs/modding/FEATURE_RESTORATION.md) idea started in a conversation with a player and is now a shipped mod.

---

## After the tutorials

Read these roughly in order of how much you need to know:

1. [REQUIREMENTS.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/REQUIREMENTS.md): what a mod must provide to be installable. The page is generated from the rules the game enforces, so it stays current. To check your own folder against those rules, run `pnpm exec neo-angband-mod-check path/to/your-mod`.
2. [AUTHORING.md](../AUTHORING.md): the shortcuts. `draftRecord` fills in a new record from comparable records in the game, `checkRecords` names every way your data would silently fail, and `ModProject` composes a whole mod through the same pipeline the game uses, before you load it. Read this before you write much by hand.
3. [The modding hub](https://github.com/neostryder/neo-angband/blob/master/docs/modding/README.md): pack anatomy, record composition, namespaced fields of your own, and a table of what is built today and what is still a design.
4. [MOD_SEAMS.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_SEAMS.md): the full list of behavior hooks, and how the game combines answers from several mods.
5. [Plugin scaffolding](../SCAFFOLDING.md): the folder layout, entry point, imports, and API 2 manifest.
6. [MOD_COMPATIBILITY.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_COMPATIBILITY.md): what an engine release may and may not break, and what to write in `engine`. Read this before you publish.
7. [MOD_REACH.md](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_REACH.md): measured answers to whether a mod can do a given thing. The page is long, and it is where to check a capability claim before you build on it.

If you are stuck on how to start, go to a tutorial. If you are stuck on what a field is called, go to the reference documents.

---

Read [Publishing](../PUBLISHING.md) before you share the finished folder or repository.

## Read a real mod

The first-party mods are written to be read, and each one in this table is more involved than the one above it:

| Mod | Read it for |
| --- | --- |
| [upstream-catchup](https://github.com/neostryder/neo-angband-mod-upstream-catchup) | About the smallest useful mod there is: one flag, one registry filler, and a README that cites every line of it |
| [feature-restoration](https://github.com/neostryder/neo-angband-mod-feature-restoration) | A small mod that is both data and code, with every feature behind its own switch |
| [qol](https://github.com/neostryder/neo-angband-mod-qol) | Behavior hooks in a shipped mod |
| [bug-fixes](https://github.com/neostryder/neo-angband-mod-bug-fixes) | Many small, independent changes, each with its own switch |
| [linoleum](https://github.com/neostryder/neo-angband-mod-linoleum) | A whole alternative tile engine, and a mod that ships art |
| [borg](https://github.com/neostryder/neo-angband-mod-borg) | A mod that plays the game |

None of these mods is bundled with the game, and none loads through a private path. Each one installs the way yours does, so every first-party release exercises the same install route you use.

---

## Stuck?

[The RPGM Tools Discord](https://discord.gg/YegtwbHTBQ) needs no GitHub account. Ask "can a mod do X?" there before you build around a guess.
