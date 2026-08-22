# Planned

**This file is the only place in this repository where work that has NOT landed is
written down.** `CHANGELOG.md` records what shipped and nothing else: an entry
appears there when the code is in the tree, never before. Blurring the two is
expensive in a public repository, because a changelog that describes intentions
reads, to somebody who did not write it, exactly like a changelog that describes
features. They then go looking for the feature.

So the rule is one sentence. **If it works, it goes in the changelog. If it is
going to work, it goes here.**

## How an item leaves this file

**In exactly one of four ways, and "still open" is not one of them. Neither is
silence.**

1. **LANDED.** It works, and it is written up in `CHANGELOG.md`.
2. **NOT APPLICABLE.** It was found to have no subject: the thing it was going to
   do turned out not to be a thing this mod should do, and the entry says why
   before it goes.
3. **DECLINED.** It could be built and should not be. The entry states the
   argument and stays, so the case is not reopened by somebody who only has the
   idea and not the reasoning.
4. **NEEDS A SEAM.** It is unreachable from a mod, the seam that would reach it is
   specified in `docs/ENGINE_SEAMS.md`, and the entry names which seam. This is a
   FINISHED state for this repository: the work is no longer this mod's to do, and
   an item in it is not waiting on anybody here. What is still owed is the note
   beside it saying what the mod does in the meantime, which is never nothing.

The fourth exit is the difference between this file and the game's own
`docs/PLANNED.md`, and it exists because this repository is a mod. A mod that
cannot reach something has not failed to do the work; it has run out of surface,
and saying which surface is the whole of the useful information.

Last reviewed: 2026-08-21.

---

## The engine seams

### Drafting, validating and emitting against the game's own content - NEEDS A SEAM

`ctx.authoring` (seam 1) and `ctx.composedRecords` (seam 2). The mod SDK holds the
whole authoring stack - the measured field statistics over the game's 3279
records, the drafting call, the peer search, the validator the running game itself
uses, and the project builder that emits and composes - and none of it is
reachable: the engine does not depend on or re-export the SDK, and a folder plugin
resolves no bare specifier. The raw composed record map every one of those
functions takes is a different shape from `ctx.registries`, and the host already
builds it and memoises it.

**Meanwhile:** `src/host/authoring-stub.ts` implements the same interface over a
hand-written fixture of a few dozen invented records. Every screen renders, every
gesture works, and the emitted files are structurally exactly what the folder
reader expects. What is a demonstration and not evidence: every suggestion, every
peer table, every field-usage share, and the validator, which is four rules rather
than the game's full set and returns a `hint` on every call saying so. The banner
that says all of this is not dismissible.

**Rejected, so it is not proposed again:** shipping a regenerated copy of the
measured statistics inside the mod. Roughly 300KB of duplicated payload that
drifts the moment the game's content changes, and it would still not supply the
validator or the project builder without reimplementing both - and a
reimplementation of the validator that disagreed with the game's own and was
believed would be worse than no validator.

### Trying a mod without keeping it - LANDED

`ctx.loadModForSession` behind `mod:session` (seam 5), and the "Forge and try it
now" button on the review screen. The mod is held for the session, composes on the
next reload exactly as an installed pack does, and is gone when the game is closed
- so the build-look-change loop leaves nothing in the library.

Two things about it that are properties of the feature rather than of this mod,
and are written down because a player will read the button as a safety feature:
trying it is not a preview, so a character who plays it keeps whatever the pack
did to them; and the archive's lifetime is a strong convention rather than a
boundary, since a browser that restores a closed window restores session storage
with it. The game's own `docs/PLANNED.md` carries the save-reproducibility gap
behind the first of those.

### Installing without leaving the workshop - DECLINED

`ctx.installMod` behind a new `mod:install` capability (seam 3). Not asked for, and
the "Forge and install" button stays inert by design rather than waiting on a door.

The workshop writes the same bytes to a file the player downloads, and the mod
manager's existing `Import a zip` accepts exactly those bytes. Two extra actions,
and the player ends up holding a file they can read, keep, hand-edit and push to a
repository.

`ctx.reloadGame`, which was asked for alongside it, is not a seam either and never
was: reloading is not a capability anybody grants, because a plugin's code runs in
the page and can reach `location` regardless. The workshop reloads itself.

**The objection carried, and this seam is now DECLINED rather than open.** A
cross-check argued it should not be requested at all: a mod that can put another
mod into the install is an elevated permission whose only benefit is one fewer
click, and the install consent prompt is the boundary that actually holds. The
counter-argument was that `installModFromZip` already refuses before it opens the
archive when third-party mods are switched off, and already runs the standards
check that refuses a mod which would install and then do nothing, so the seam adds
a caller rather than a bypass.

What settled it is that the benefit the seam was for has been got another way.
"One fewer click" was never really the ask; the ask was for an author to get a draft
into the game without ceremony, and that is now one button - forge it, load it for
the session, reload. The install seam would add nothing to that except permanence,
which is exactly the part a player should visit the mod manager for. So the elevated
permission would be bought for a convenience that already exists, which is the
weakest possible reason to ask for one.

The download button stays, and it is the honest end of the loop: a finished mod is a
file the author can read, keep, hand-edit and push to a repository, and a mod that
only ever existed inside the browser's storage is none of those.

### Testing what you built, in the game - LANDED

`ctx.wizard` behind a new `debug:wizard` capability (seam 4), and it landed in a
different shape from the one asked for. The ask was the wired `WizardDeps` bundle,
for the workshop to pass back into the `wiz*` functions on `ctx.core` itself; what
shipped is a surface of methods that refuses every command until the session has
been cut loose from its save.

The reasoning for the bundle was sound as far as it went and is recorded in
`docs/ENGINE_SEAMS.md`. What it could not do is stop a mistake in this repository
from reaching somebody's character: those functions are gated on a flag in a bag
the caller assembles, so the only thing between a bug here and a cheated character
written over a real save was this repository's own care. The method surface puts
that rule in the host, where it is enforced rather than intended.

One refusal went away with it. The old design would not act until the character had
already taken Angband's permanent debug mark, and would not take that mark for
anybody, because it costs the character its place on the high score list forever.
Detaching the session first is a smaller thing to spend and is spent in the open,
so the mark now lands on a character that has stopped being written down.

### The overlay's held-key state - NEEDS A SEAM, and a small one

The workshop's own capture-phase listeners stop the game seeing any keystroke
while the overlay is open, which is the important half and is tested. What a mod
cannot reach is the host's key-repeat and pointer-button state, so closing the
workshop with a key held down can still deliver that key to the game and move the
character one square.

`docs/ENGINE_SEAMS.md` records this under "what is deliberately not asked for",
because a whole `ui:dom.overlay` capability to fix it would be a large seam for a
small edge, and a capability would add a consent string rather than containment:
in-process mod code reaches the document whether or not `ctx` mentions it, which
the engine's own capability documentation states plainly. The honest shape of the
ask, if it is ever made, is "clear held input state on overlay acquire and
release" and nothing else.

---

## The tab

### The tab is absent on a screen whose full-screen erase is undeclared - NEEDS A SEAM

The host paints a declared region once per frame, so the tab maintains itself and
does not need a tick source. What it cannot survive is one of the game's remaining
full-screen erases that the region system does not know about: on those screens
the tab is simply not there, and it is back on the next frame that declares its
regions. It is never permanently invisible, and the workshop does not close when
it happens.

This is the game's own row 21 work and not a mod's. Recorded here because a
player who taps a corner and finds nothing there deserves the reason to exist
somewhere.

### A keyboard way in - DECLINED

A mod can take one of the game's menus with `ui:menu.replace` and route a row of
its own into the workshop, which would give it a keyboard entry point today. It is
not done, because a presenter has to draw the whole question it takes, so a mod
whose real job is elsewhere would be restyling one of the game's own screens as
the price of having a door. A one-row tab is the smaller promise. If the game ever
grows a way for a menu row to dispatch into mod code without taking the menu's
presentation with it, this becomes trivial and worth doing.

---

## Content the workshop cannot write

### A `plugin.js` - NOT APPLICABLE

A code mod's entry point is a built ES module with no bare imports and a validated
default export, all of which comes from an esbuild pipeline that runs in Node.
Nothing in a browser tab can produce one, and there is no in-browser bundler
anywhere in the tree. The only honest version would be a fixed literal template
with substituted values, which is a much smaller promise than "the workshop writes
code" and would be mistaken for the larger one.

The written path is real and better: `docs/modding/tutorials/05-hook-behaviour.md`
runs code in ten lines and needs no compiler.

### Tile packs, sounds, fonts and other binary resources - NEEDS A SEAM

`EmittedFile.contents` is a `string`, so the project builder cannot produce a PNG,
a font or a sound however the workshop asks it to. A byte-capable emit is an
additive change to the SDK; it is not requested in
`docs/ENGINE_SEAMS.md` because nothing about this version needs it and a seam
requested before it has a caller is the failure mode this project keeps finding.

**Meanwhile:** a new monster or object with no tile falls back to its letter, which
is what Angband looked like for thirty years. `neo-linoleum` derives a tile for
mod-added content from its kin, so the workshop names that mod in prose and does
not make it a dependency.

### A tile filler of the workshop's own - DECLINED

The tile fill door allows one filler per mod and writes only where nothing has, so
a filler here would be correct and would also be a second answer to a question
`neo-linoleum` already answers, competing for the same content. Pointing at the
sibling mod is better citizenship. The cost is stated plainly: the shortest path
from nothing to a monster with a picture is three installs and a reload, and the
workshop says so rather than implying the tile story is solved.

### Sections, so somebody else can switch half your mod off - NEEDS A SEAM

A section needs a manifest entry and the content grouped under it, and the project
builder writes neither. It is the most obviously wanted thing not in this version:
a player who makes five changes and wants a friend to be able to switch off two of
them is describing sections exactly. Additive SDK work with no consequence for the
plugin ABI.

### The coarse whole-record patch kind - DECLINED

Supported by the format and deliberately not offered. Its failure mode is "your
mod silently replaced an array another mod was contributing to", which is the exact
problem the per-field patches exist to avoid. A workshop that offered it would be
handing a beginner the sharper of two tools for no gain.

### Whole-record replacement - NEEDS NO SEAM, NOT BUILT

`replace` is in the project builder and no screen offers it. Removal is offered,
in the dangerous colour, with the ref spelled out. Replacement is the same weight
of gesture and wants the same treatment plus a diff against what it replaces, and
that is a screen rather than a button.

### Fields of the author's own, namespaced - NEEDS NO SEAM, NOT BUILT

The draft carries a `fields` list and the emitter writes it; nothing in the
interface adds one. Version one emits no code, so a field the workshop coined
would be read by nothing, which is why this is last rather than first. When it is
built it has to be one gesture: an undeclared namespaced key is stripped and
reported, and a bare novel key is not a mod's to coin at all.

---

## The interface

### A record with no widget for its shape - LANDED, and worth reading twice

Every container offers a JSON box that parses on commit, so no shape in forty-odd
record files is unreachable. That is not a gap left open; it is what makes an
editor over arbitrary records honest. A field the author cannot edit at all is
worse than a field they have to edit as text.

### Reordering by dragging - DECLINED

Moving an entry is two buttons. A drag needs a pointer, and this has to work for
somebody using only a keyboard.

### Every kind of record given its own hand-built editor - DECLINED

Twelve kinds have a hand-written essentials list and a badge; the rest are grouped
by a classifier over the field's name and its measured shape. Forty-one bespoke
editors would be forty-one things to keep in step with the game's data, and the
thirty-ninth would be wrong.
