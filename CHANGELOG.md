# Changelog

All notable changes to this mod are recorded here. Versions follow the mod's own
`manifest.json`, which is what the game reads, and each released version has a
matching git tag that an install pins itself to.

An entry has to matter to somebody running the mod. Documentation wording,
internal refactoring and test-only additions are not recorded here. Bug fixes
are, however small.

Anything planned, deferred or merely intended goes in `PLANNED.md` instead, and
never here: a reader who did not write the entry cannot tell an intention from a
feature, so they go looking for the feature.

## 0.1.0

The first version. Nothing here has been released, so there is nothing to compare
it against; what follows is what it does.

### Added

- **A workshop for making mods, opened from a tab in the corner of the screen.**
  It runs as a real interface in the page the game already occupies, takes the
  keyboard while it is open, and gives it back when it closes. Nothing it does
  touches the game until a mod is installed.
- **New records, in any of the record files the game composes one at a time.**
  Based on something that already exists: the new record inherits the shape and the
  scale of its nearest comparable and none of its powers, so a new orc arrives with
  the orc's hit points and no attacks until the author says otherwise.
- **Adjustments to records the base game or another mod owns.** The mod ships the
  difference rather than the record, so two mods adjusting different fields of one
  record both work.
- **One numeric adjustment across a filtered set of records at once**, with a
  preview of what it does before it is applied. Each record gets its own entry, so
  another mod's unrelated change to any of them still composes.
- **Removal of a record, offered last, in the dangerous colour, with the reference
  spelled out.**
- **The evidence behind every number.** Each suggested value carries the sentence
  saying where it came from, and an evidence table beside the editor shows the
  comparable records with the focused field highlighted.
- **Checks as the author types**, separated into errors, warnings and advice, with
  a pane that never empties while a newer answer is being computed. Clicking a
  finding goes to the field it is about.
- **The manifest paperwork written from what the author actually did:** the
  dependency on a pack whose record is being adjusted, written at the moment that
  record is chosen; the load-order group, from whether the mod adds or only
  adjusts; an engine range that is a minimum rather than a pin, and which the
  workshop refuses to write in a form that would exclude the build it is running
  on; and a repository address that is obviously the author's own rather than a
  plausible URL belonging to somebody else.
- **Gestures that emit the composable op rather than the outcome.** Nudging a
  number writes "three more than whatever this is". Ticking a flag writes "add this
  flag". Adding a row to a table writes "append this". All three coexist with
  another mod doing the same thing to the same record; writing the outcome would
  not, and the review screen says which of an author's changes are which.
- **A JSON box on every container**, parsed on commit, so no shape in any record
  file is unreachable.
- **Undo and redo**, over every change to a mod, from the title bar or from
  `Ctrl+Z`.
- **The finished mod as a file**, always, whether or not the game offers a way to
  install one in place. The file is a zip the mod manager's own `Import a zip`
  accepts, and it is the only copy of the work that exists outside the browser.
- **A Test panel that puts a creature or an item in front of the player**, using
  the game's own debug commands, for looking at something rather than going to find
  it. Off by default and it stays off until the player says otherwise: Angband
  marks a character that has been handed anything this way, permanently, and a
  marked character is barred from the high score list for the rest of its life.
- **A guide covering the four things people usually make**, each card naming the
  game's own written tutorial for the same idea, plus a card for everything the
  workshop cannot reach and where to read about it.
- **A parchment treatment**, for anybody who prefers ink on paper to lamplight on
  stone.

### Known limitations, stated here because they change what the mod is

- **The numbers are a demonstration.** Four engine seams this needs do not exist,
  so the records the workshop draws its evidence from are its own fixture of a few
  dozen invented entries rather than the game's own content. Every suggestion,
  every evidence table and every usage share is therefore about the fixture. A
  banner says so and cannot be dismissed, and the validator returns a note on every
  call saying that its checks are the workshop's own small set and not the game's.
  `docs/ENGINE_SEAMS.md` specifies all four seams; `PLANNED.md` records what each
  one blocks.
- **A finished mod is saved as a file and added through the mod manager.** There is
  no way yet for a mod to install another mod.
- **Unfinished work can be lost.** Drafts live in this install's own settings,
  whose write path catches a quota error and logs it rather than failing. Every
  write is read back and a failure is reported at the moment it happens, and the
  workshop caps what it will try to store, but the file is the only save point it
  will promise.
- **The tab is absent on a few of the game's screens**, and back on the next frame.
- **The workshop writes content, not code, and text, not pictures.** A new monster
  with no tile falls back to its letter.
