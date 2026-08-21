# Mod Builder

Make your own Neo Angband mod from inside the game.

Pick something that already exists - a monster, a sword, a shop, a spell - and the
workshop shows you what it is made of, what its neighbours in the game carry for
every number, and what would have to change to make the thing you had in mind.
When you are happy it packs the result up: try it in this session to play it
straight away, install it to keep it, or save it as a file to hand to somebody.

It never asks you what JSON is. It also never hides it: every screen can show you
the exact file it is about to write, and a mod it built can be taken away,
hand-edited and brought back.

## Status

**Early. The workshop opens, every screen works, the mod it emits is a real mod,
and you can load that mod into the running game for the rest of the session.**
What it is not yet is connected to the game's own content: four of the five engine
seams it wants do not exist, so the numbers on screen come from the workshop's own
demonstration content rather than from the 3279 records the game actually runs on.
The workshop says so in a banner it will not let you dismiss, and
`docs/ENGINE_SEAMS.md` specifies all five precisely. `PLANNED.md` records which of
them blocks what.

It needs Neo Angband 0.26.0 or newer, because the capability behind the session
load arrived there and a mod declaring one the running game does not know is
refused outright.

That state is deliberate rather than premature. A tool that refuses to open until
an engine change lands is a tool nobody can look at, and looking at it is how the
seams get specified correctly.

## What it does

**Adds records.** A new monster, a new sword, a new potion, a new artifact, in any
of the forty-odd record files the game composes one record at a time. You base it
on something that already exists, and the workshop fills it in from what its
comparables in the game actually carry rather than leaving it blank. It inherits
shape and scale and none of its powers: a new orc arrives with the orc's hit
points and armour and no attacks at all until you say otherwise.

**Adjusts records the game already owns.** Your mod ships the difference rather
than the record, so the base game keeps owning it and two mods adjusting different
fields of the same record both work.

**Retunes a whole set at once.** Every potion cheaper, every dragon faster, every
shop's purse deeper. Filter a file down to what you mean, choose one adjustment,
and every record that matched gets its own entry.

**Explains every number it chose.** Not "speed 120" but "speed 120, because every
dog within seven levels of depth 3 has it". The evidence table beside the editor
answers "is forty hit points a lot for a depth-three dog" with the game's own data
rather than with a manual.

**Checks as you type.** A name that collides with something already loaded, a
field nothing in the file uses, a monster with no depth that would exist and never
be met, a reference to something no loaded pack defines. Errors are separated from
warnings and from advice, and clicking one takes you to the field it is about.

**Writes the paperwork you would have got wrong.** A mod may only adjust a record
whose owner it declares as a dependency, and a change refused for want of that
declaration costs you the change and not the mod, silently. The workshop writes
the dependency at the moment you pick the record. It also picks the load-order
group from what you actually did, writes an engine range that is a minimum rather
than a pin, and defaults the repository to an address that is obviously yours.

**Prefers the change that survives other people.** Nudging a number writes "three
more than whatever this is" rather than a fixed value, so it keeps meaning what you
meant after a game update retunes it and after another mod adjusts it first.
Ticking a flag writes "add this flag", so another mod adding a different flag to
the same record keeps its change and you keep yours.

## What it does not do, and why

**It does not write code.** A mod that runs code needs a built ES module with no
bare imports, and there is no bundler in a browser tab. Everything a first mod is
likely to be - a monster, a sword, a rebalanced spell, an item in a shop, an
artifact - is content and needs no build step at all.
`docs/modding/PLUGINS.md` in the game's own repository is the path for a mod that
does run code.

**It does not ship pictures, sounds or fonts.** The emitter produces text.

**It does not offer `constants`, `visuals` or `history`.** Those three are
whole-file configuration rather than records with identities, so contributing one
means "use mine instead of the game's", which the project builder promotes to a
hard error. That is the format being honest about identity rather than a gap.

**It does not draw a tile for what you make.** A new monster with no tile falls
back to its letter. `neo-linoleum` derives a tile for mod-added content from its
kin, and the tile door allows one filler per mod, so pointing at that mod is
better citizenship than competing with it. It is not a dependency: a mod without
tiles works, it just looks like Angband did for thirty years.

## Getting it

There is no release yet. When there is, install it the way you install any mod:
the Mods screen, then the mod's repository.

## Using it

A tab reading `Build a mod` appears in the bottom corner of the main screen. Tap
it. The workshop opens over the game, takes the keyboard while it is open, and
gives it back when you close it. Nothing you do in there touches the game until
you install what you built.

Escape backs out of the innermost thing: a tooltip, then a level of nesting inside
a record, then the screen, then the workshop. Nothing on that ladder discards
anything.

`Ctrl+Z` and `Ctrl+Shift+Z` undo and redo. `Ctrl+S` saves the mod as a file.

## Getting the mod out

**Save it as a file.** Always available. You get a zip, which the Mods screen's
`Import a zip` accepts, and which you can also open, read, hand to somebody and
push to a repository. This is the only copy of your work that exists outside the
browser's storage, which is why the button is on every screen.

**Try it for this session.** The shortest loop there is: the mod is loaded for the
rest of the session without being added to your mods, and it is forgotten when you
close the game. So iterating costs you nothing in your library.

It is the real mod and not a preview, which cuts both ways. The pack composes into
the game exactly as an installed one does, so play a character you do not mind
changing: next time, with the mod gone, the game treats anything it added as
belonging to something that is not installed, and a value it adjusted goes back to
what it was. What is temporary is the mod, not what it did.

**Install it in place.** Available when the engine offers a door for it, which
today it does not. It saves two steps and nothing else; the file button stays
either way.

All three take effect after a reload, because composing content always does.

## Unfinished work, and the one honest warning

Drafts are kept in this install's own settings rather than in any character's
save, so they survive a character dying and they are gone if you clear the
browser's storage for the game. That store can also quietly run out of room: its
own write path catches a quota error and logs it rather than failing. The workshop
reads every write back and tells you at the moment one did not take, and it caps
what it will try to store rather than discovering the limit.

**So a mod saved as a file is the only save point the workshop will promise you.**
It says so on the screen where it matters, and the button is one click from
anywhere.

## Learning to mod

The workshop's `Guide` covers the four things people usually make, and each card
names the game's own written tutorial for the same idea. The two teach the same
steps in the same order on purpose: an author who finishes the tour and then opens
tutorial 3 has to find the same ideas under the same names.

If you would rather have a text editor open, that path is real and it is not
second class. A mod is a folder with a text file in it, and it will always be:

- `docs/modding/tutorials/` builds seven mods from nothing, in a text editor.
- `docs/modding/PLUGINS.md` is how a mod runs code.
- `docs/modding/AUTHORING.md` is the library this workshop itself calls.
- `docs/modding/MOD_COMPATIBILITY.md` is what surviving a game update takes.

A mod the workshop wrote is an ordinary folder of ordinary files. Take it out,
edit it in anything, and bring it back. Nothing in it belongs to the workshop -
that rule is what keeps this a helper rather than a format owner, and it is the
one rule here that is never bent.

## Settings

Three, in the mod manager:

| Setting | Default | What it does |
| --- | --- | --- |
| Show the workshop tab | on | The tab in the corner, which is the only way in. |
| Remember work in progress | on | Keep unfinished mods between sessions. |
| Let me spawn what I built, to test it | **off** | A Test panel that puts a creature or an item in front of you. |

The third is off, and it stays off until you say otherwise, for one reason:
Angband marks a character that has been handed anything this way, permanently, and
a marked character is barred from the high score list for the rest of its life.
The workshop will not take that mark on your behalf - the game's own debug toggle
is where that decision belongs - and the panel says so again before it spawns
anything.

## Building this repository

The repository root is the mod folder: `manifest.json` and `plugin.js` sit beside
the source they are built from, because that pair is what the game fetches.

```
npm ci
npm run verify     # typecheck, test, and prove the committed plugin.js is current
npm run build      # rebuild plugin.js from the source
```

The tests boot the workshop into a synthetic document and drive it by clicking
things, so they fail when a label stops saying what it does. They need no engine:
the demonstration content is what they run against, which is also what makes it
worth shipping.

To develop against an engine change that has not been released yet:

```
NEO_ANGBAND_LOCAL_CORE=1 npm test
```

To look at the workshop in a browser with no game at all:

```
npm run preview
```

That serves the repository and opens a harness page which builds the narrowest
context the mod actually reads, hands it to the plugin, and taps the tab. Every
seam is absent there, which is exactly the state a player is in today, so what
appears is what appears in the game.

## Licence

GPL-2.0-only, or the Angband licence. See `LICENSE.md`.
