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

Last reviewed: 2026-08-24.

---

## Release

### A screenshots pass - NOT BUILT

Tagged releases now exist (`manifest.json` and `CHANGELOG.md` track them the
same way every other first-party mod does), but no screenshots pass exists
anywhere in the documentation. Held for after the authoring seams land, since a
screenshots pass against the fixture stub would document a mod whose authoring
surface is a demonstration rather than a tool.
Tracked as neo-angband#44, dependent on neo-angband#41.

---

## Test creation

### Scaffolding tests for the plugin an author wrote by hand

Nothing tells a third-party author how to write a standalone test for a
hand-written `plugin.js` outside this monorepo, since the one worked example
(`docs/modding/tutorials/05-hook-behaviour.md`) runs the plugin through the
engine's own internal sample-mod suite. Held for after the authoring seams
(`ctx.authoring`, `ctx.composedRecords`) land, since what a test needs to assert
against is exactly what those two seams also unlock, making this a third
consumer of the same door rather than a separate one. Tracked as
neo-angband#45, dependent on neo-angband#41.

---

## The engine seams

### Drafting, validating and emitting against the game's own content - NEEDS A SEAM

`ctx.authoring` (seam 1) and `ctx.composedRecords` (seam 2) would let the
workshop draft, validate and emit against the game's real 3279 records instead
of the hand-written fixture in `src/host/authoring-stub.ts`, which renders every
screen but returns a `hint` on every call saying it is a demonstration and not
evidence. Full detail, including the rejected alternative of shipping a
regenerated copy of the game's statistics inside the mod, is in
`docs/ENGINE_SEAMS.md`. Tracked as neo-angband#41.

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

`ctx.reloadGame` is a real seam, gated by `mod:install` or `mod:session` rather than
`mod:install` alone, so the `mod:session` capability this mod already declares gets
it too. The session seam prefers it over a bare `location.reload()`: it is the
engine's own save-and-reload sequence - plugin teardown, autoplayer keyboard
handback, character write, session resume - which a page reload on its own skips.

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

### The overlay's held-key state - LANDED, and still not the whole of it

The narrower ask recorded here was to clear held input state on overlay
acquire and release, rather than the whole `ui:dom.overlay` capability
`docs/ENGINE_SEAMS.md` declines to request. That ask is now built: the overlay
tracks every key and pointer button it has seen go down without a matching
release while it owns input, and sends the game an honest keyup or mouseup for
one the moment it discovers an already-repeating key or gives up ownership of
one, in `src/ui/overlay.ts`. Tracked as neo-angband#49.

What it does not do is stop the browser's own hardware auto-repeat from
generating another keydown for a key that is still physically held the instant
after the overlay's listeners come off - that repeat is not driven by anything
in this mod's script, and no amount of listener bookkeeping reaches it. The
correction here keeps the game from believing a key is held that it can no
longer hear the release of; it does not, and cannot, guarantee that a single
further move is impossible in every timing. That residual gap is what a real
`ui:dom.overlay` seam would still be for, and it remains not requested.

---

## The tab

### The tab is absent on a screen whose full-screen erase is undeclared - NEEDS A SEAM

One of the game's remaining full-screen erases is not known to the region
system, so the tab that opens the workshop is simply absent on those screens
until the next frame that declares its regions. This is the game's own row 21
work and not a mod's. Tracked as neo-angband#50.

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

### Tile packs, sounds, fonts and other binary resources

Not an engine seam after all: `EmittedFile.contents` is now `string | Uint8Array`,
so the project builder's emit path and the file editor can both carry a tile, a
font or a sound as its exact bytes rather than as whatever text was typed at a
path that happens to end in `.png`. A record file and the manifest are unaffected
and stay text. In the tree; pending write-up in `CHANGELOG.md` at the next release.
Tracked as neo-angband#46.

A new monster or object with no tile still falls back to its letter, and
`neo-linoleum` still derives a tile for mod-added content from its kin - that is
about what the running game does with a shipped asset, not about whether this
workshop can emit one, and is unaffected by the above.

### A tile filler of the workshop's own - DECLINED

The tile fill door allows one filler per mod and writes only where nothing has, so
a filler here would be correct and would also be a second answer to a question
`neo-linoleum` already answers, competing for the same content. Pointing at the
sibling mod is better citizenship. The cost is stated plainly: the shortest path
from nothing to a monster with a picture is three installs and a reload, and the
workshop says so rather than implying the tile story is solved.

### Sections, so somebody else can switch half your mod off - NEEDS A SEAM

A section needs a manifest entry and the content grouped under it, and the
project builder writes neither. A record file's `sections` block can already be
typed into the file editor and reaches the emitted folder exactly as written,
but the draft cannot model a section, so the composer never sees it and the
review screen's verdict is not a verdict on it. Tracked as neo-angband#47.

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

The same seam the emitter needs: a path ending in `.png` can be created here and
will hold whatever text is typed into it, which is not a picture. Tracked as
neo-angband#46.

### The closed-vocabulary check belongs in the SDK - NEEDS A SEAM

`RECORD_BLUEPRINTS` measures a closed set of values that `checkRecords` never
checks, so the record screen's dropdown and the file editor's hint are two
consumers of one measurement that can already disagree about the same field.
An advisory rule inside `checkRecords` itself would give both one shared
answer. Tracked as neo-angband#48.

### Searching across files, and a diff - NOT BUILT

Find works inside the file that is open. There is no search across the folder
and no view of what a save changed, which matters most because a save on a
record file rewrites the text into the emitter's own spelling without showing
what moved. Tracked as neo-angband#51.

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
