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

## When you outgrow the screens: editing the files

Every screen above asks a question and writes the answer into a file. There is one
more screen, reached with **Edit the files directly** from a mod's own page, that
shows the files.

**It is the same mod, printed.** Not a mode, not an import, not a second copy. A
monster added on the record screen is in `monster.json` there; a number changed
there is the number the record screen shows next time you open it. Saving a file
parses the text back into the mod that every other screen edits, which is why the
two can never come apart.

It has line numbers, syntax colouring for JSON and JavaScript, bracket matching,
Tab and Shift-Tab to indent and outdent, `Ctrl+F` to find, `Ctrl+S` to save the
file, and a line and column readout. `Ctrl+Z` in the editor is the browser's own
undo over your typing; `Ctrl+Z` anywhere else is the workshop's undo over the mod.

**Three things are only possible here**, and they are why it exists rather than
being a viewer:

- **A script.** `Start a plugin.js` writes a working entry point with nothing in
  it. A `plugin.js` needs no build step: it is an ES module with no bare imports
  and a default export, and the engine arrives as `ctx.core`. The manifest grows
  the `plugin` facet and the `modApi` number by itself, because a mod that ships
  code without declaring both installs and then does nothing.
- **A manifest key nothing asks you about.** `capabilities`, `rules` a player can
  switch on and off, `optionalDependencies`. The game passes a key it does not
  model straight through, so these work, and they survive every later save.
- **Sections and anything else a record file can carry.** Written through to the
  folder exactly as typed.

**What it will not pretend.** The check under a JSON file is the same parser the
game uses, so a clean file is really clean. The check under a script is quotes,
comments and brackets, and it says so: it is not a syntax check, there is no
compiler in a browser tab, and code that passes it can still be wrong. A mod that
ships a script also cannot be tried for a session, because that door takes content
only - save it as a file and add it with `Import a zip`, which is the door that
runs code and asks you first. The button says which of those you are looking at
before you press it.

**It is not the way in.** A first mod made here is a first mod made without the
evidence table, without the sentence saying where each suggested number came from,
and without the check that runs as you type. Start with the screens. This is the
door at the far end of them.

## What it does not do, and why

**It does not write code for you.** It will carry a `plugin.js` you wrote, and it
will not produce one: a mod written in TypeScript becomes a module through a
bundler that runs in Node, and there is no bundler in a browser tab. Everything a
first mod is likely to be - a monster, a sword, a rebalanced spell, an item in a
shop, an artifact - is content and needs no build step at all.
`docs/modding/PLUGINS.md` in the game's own repository is the path for a mod that
does run code, and `docs/modding/tutorials/05-hook-behaviour.md` is ten lines of
it.

**It does not ship pictures, sounds or fonts.** The emitter produces text. A file
whose name ends in `.png` can be made in the file editor and will hold whatever
text is typed into it, which is not a picture.

**It does not open a mod you already have.** The editor edits the mod in the
workshop. A finished mod is a folder with a text editor and a repository behind
it, which is a better place to work on one.

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

`Ctrl+Z` and `Ctrl+Shift+Z` undo and redo. `Ctrl+S` saves the mod as a file, or
saves the open file into the mod when the caret is in the file editor.

## Getting the mod out

**Save it as a file.** Always available. You get a zip, which the Mods screen's
`Import a zip` accepts, and which you can also open, read, hand to somebody and
push to a repository. This is the only copy of your work that exists outside the
browser's storage, which is why the button is on every screen.

**Try it in the game.** One button, on every screen a mod is open on. It forges the
mod, loads it for the rest of the session without adding it to your mods, and
reloads the game so it takes effect. It is forgotten when you close the game, so
iterating costs you nothing in your library.

It is the real mod and not a preview, which cuts both ways. The pack composes into
the game exactly as an installed one does, so play a character you do not mind
changing: next time, with the mod gone, the game treats anything it added as
belonging to something that is not installed, and a value it adjusted goes back to
what it was. What is temporary is the mod, not what it did.

The reload is not optional and never was, because composing content always needs
one. What changed is who does it: the workshop used to say "reload to play it" and
leave you to find the Close button and press Ctrl-R.

**Install it in place.** Deliberately absent. A mod that can put another mod into
your library is an elevated permission, and the only thing it would buy is a click
the button above already saves. Permanence is worth visiting the mod manager for,
and a mod on disk is one you can read, keep and hand to somebody.

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
| Let me test what I built, in the game | **off** | A Test panel that arranges the game around the thing you made. |

The third is off, and it stays off until you say otherwise, for one reason. Testing
one record honestly means arranging everything around it - a monster written for
dungeon level forty tells you nothing on level one - so the panel carries the game's
own debug set: go to a depth, gain experience, set gold and stats, acquire items,
summon, banish, teleport, map the level, light it, learn everything.

**Not one control on it works until the panel has stopped this session being saved,
and that cannot be undone.** Your character on disk keeps whatever their last save
left and nothing after that is ever written, so testing can never spoil a character
you are keeping. Reload the game and they are waiting exactly as they were. What you
give up is the session you tested in, which is the point: it was a scratchpad. The
panel names the character and says all of this before the button that spends it.

Its browser puts your own content at the top, marked with the pack that added it,
and it is not limited to it - the whole game's catalogue is behind the same filter,
because the record you are modelling yours on is usually the one you want to compare
against.

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
