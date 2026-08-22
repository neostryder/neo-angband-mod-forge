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

### A `plugin.js` the workshop COMPILES - NOT APPLICABLE

A mod written in TypeScript becomes an ES module through an esbuild pipeline that
runs in Node. Nothing in a browser tab can run that pipeline, and there is no
in-browser bundler anywhere in the tree. The only honest version would be a fixed
literal template with substituted values, which is a much smaller promise than
"the workshop writes code" and would be mistaken for the larger one.

**The other half of this is now LANDED, and it is the half that mattered.** A
`plugin.js` does not have to be compiled from anything: the ABI wants an ES module
with no bare imports and a validated default export, and that is a file a person
can type. The file editor carries one, the manifest grows the `plugin` facet and
the `modApi` number from the same condition that notices the file, and the emitted
folder is a code mod. What the workshop does not do is write the code, which is
the part that needed a compiler and the part an author was always going to want to
do themselves.

Two consequences, both stated where they happen rather than here. A mod that ships
a script cannot be tried for a session, because that door takes content only. And
nothing checks the script: the game imports it and reports a failure as a mod that
is not working, so the editor's own check says in as many words that it looks at
quotes, comments and brackets and is not a syntax check.

The written path is still real and still the place to learn:
`docs/modding/tutorials/05-hook-behaviour.md` runs code in ten lines.

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
builder writes neither. It is the most obviously wanted thing no screen offers: a
player who makes five changes and wants a friend to be able to switch off two of
them is describing sections exactly. Additive SDK work with no consequence for the
plugin ABI.

**Meanwhile:** a record file's `sections` block can be typed into the file editor,
and it reaches the emitted folder exactly as written. That is worth having and it
is not the same as the seam, so the difference is said on the screen rather than
left to be discovered. The draft cannot model a section, so the workshop carries
one through unread: the composer never sees it, the review screen's verdict is not
a verdict on it, and both the file editor and the review screen name the file and
the keys and say so. A blind spot that is declared is a different thing from one
that is not, and the reason to allow it at all is that the alternative was a file
the editor could open and never save.

### The coarse whole-record patch kind - DECLINED

Supported by the format and deliberately not offered. Its failure mode is "your
mod silently replaced an array another mod was contributing to", which is the exact
problem the per-field patches exist to avoid. A workshop that offered it would be
handing a beginner the sharper of two tools for no gain.

### Whole-record replacement - NEEDS NO SEAM, NO SCREEN

`replace` is in the project builder and the file editor round-trips it, so a
`replaces` block typed into a record file is a real replacement that the review
screen composes and checks like any other change. What is not built is a SCREEN
for it. Removal has one: offered last, in the dangerous colour, with the reference
spelled out. Replacement is the same weight of gesture and wants the same
treatment plus a diff against what it replaces, and that is a screen rather than a
button. Until it exists, the honest place for the gesture is the text, where an
author can see exactly what they are writing over.

### Fields of the author's own, namespaced - NEEDS NO SEAM, NO SCREEN

The draft carries a `fields` list, the emitter writes it, and the file editor
round-trips it out of `manifest.json`. So an author can coin a field today, and
now that the same editor can carry the script that reads it, a coined field is a
field something can actually use - which is what made this last on the list rather
than first when nothing here emitted code.

What is not built is a gesture in the interface, and it still has to be one
gesture when it is: an undeclared namespaced key is stripped and reported, and a
bare novel key is not a mod's to coin at all.

---

## The file editor

### A second editor for a mod nobody is holding - DECLINED

An author with a finished mod on disk cannot open it here: the editor edits the
draft, and there is no import. The zip the workshop writes can be hand-edited and
brought back through the mod manager, which is the loop that exists, and reading a
mod back into a draft is the same shape as writing one out - `files.ts` does the
hard half already. It is declined rather than planned because the reason to want
it is thin. A mod that has left the workshop is a mod with a repository and a text
editor behind it, and a second, worse editor inside a game is not what that author
needs. What would change the argument is a mod that was MADE here, exported, and
edited by hand once: that person has a real use for bringing it back, and no way
to say so yet.

### Anything that is not text - NEEDS A SEAM

The same seam the emitter needs: `EmittedFile.contents` is a `string`, so a tile,
a font or a sound cannot be carried whatever the editor does. The editor refuses
nothing and offers nothing here; a path ending in `.png` can be created and will
hold whatever text is typed into it, which is not a picture. Recorded beside the
emit seam above rather than as a separate ask.

### The closed-vocabulary check belongs in the SDK - NEEDS A SEAM

`RECORD_BLUEPRINTS` measures a closed set of values for a field where the game's
own records have one, and two places in the workshop read it: the record screen
offers those values as a dropdown, and the file editor now names a value that is
outside the set. Nothing in the ENGINE reads it. Its own checker takes `values` for
a placeholder and never for a check, which is the right call on its own terms - a
mod coining a new tval or a new slay code is doing something legal - but it leaves
an author who mistyped one of twenty-six colour codes with no word from anybody.

So the rule lives here, as a hint, under a `workshop/` rule id, with the pane saying
the game will not repeat it. That is the honest arrangement and it is not the right
one. Two consumers of one measurement, each deciding for itself what it means, is
how they come apart: the dropdown and the hint can already disagree about the same
field, and only one of them is on screen at a time. The seam is an advisory rule in
`checkRecords` itself, at hint level, which both the form and the text editor would
then get from one place and neither would have to name. Recorded in
`docs/ENGINE_SEAMS.md` beside the authoring seam it extends.

### Searching across files, and a diff - NOT BUILT

Find works inside the file that is open. There is no search across the folder and
no view of what a save changed. Both are real and neither is the difference
between having a text editor and not having one, which is what this version is
for. A diff is the more useful of the two, because a save on a record file rewrites
the text into the emitter's own spelling and an author currently sees that happen
without being shown what moved.

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
