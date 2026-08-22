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
- **Try it in the game**, one button, from every screen a mod is open on. It forges
  the mod, loads it for the rest of the session without adding it to the player's
  mods, and reloads the game so it takes effect - composing content always needs a
  reload. The pack composes exactly as an installed one does and is forgotten when
  the game is closed, so the build, look, change loop leaves nothing behind in the
  library. The button says the half that "just for this session" hides: this is the
  real mod and not a preview, so the character who plays it keeps whatever it does
  to them, and next launch, with the pack gone, the game treats anything it added as
  belonging to something that is not installed. The review screen is still there,
  with the errors and the files and the manifest, and looking first is no longer
  compulsory in order to try something.
- **A Test panel that arranges the game around the thing you just made.** Testing
  one record means arranging everything around it: a monster written for dungeon
  level forty says nothing on level one, and an item balanced for a hundred hit
  points says nothing to a character with nine. So the panel carries the game's own
  debug set - go to a depth, gain experience, set gold and stats, acquire items,
  summon, banish, teleport, map the level, light it, learn every item and creature -
  rather than a spawn button with extras.

  Its browser lists everything the running game has, with the author's own content
  at the top and marked with the pack that added it. That ordering is read off each
  record's own provenance, so the workshop keeps no list of what the base game
  contains, which is a list that would be wrong the first time the game added a
  monster. It is not limited to the mod's own content: the filter turns off, because
  the record an author is modelling theirs on is the thing they most often want to
  test against.

  **Not one control on it works until the panel has stopped this session being
  saved**, which is one button and cannot be undone. The character on disk keeps
  whatever their last save left and nothing after that is ever written, so testing
  can never spoil a character somebody is keeping - and a session tested in is a
  session thrown away. The panel names the character and says all of it before the
  button that spends it. Off by default, and the setting's own description says the
  same thing.
- **The mod as its own text files, editable, for authors who outgrow the screens.**
  Reached with `Edit the files directly` from a mod's page. It lists every file the
  folder ships and opens any of them in an editor with line numbers, syntax
  colouring for JSON and JavaScript, bracket matching, Tab and Shift-Tab to indent
  and outdent, find, a line and column readout, and a save chord.

  **It is the same mod, printed, and not a second copy of it.** A monster added on
  the record screen is in `monster.json` there; a number changed there is what the
  record screen shows next time. Saving a file parses the text back into the same
  document every other screen edits, through the same undo. A file that has moved
  in the mod since it was opened is not written over silently: the save is refused
  and the choice between keeping what is in the editor and starting again from what
  the mod says is offered as two buttons.

  **Three things are only possible this way.** A hand-written `plugin.js`, which
  needs no build step and makes this the first version that can produce a mod that
  runs code - the manifest grows the `plugin` facet and the `modApi` number from the
  same condition that notices the file, because either alone is a mod that installs
  and does nothing. A manifest key no screen offers, `capabilities` and `rules`
  among them, kept exactly as typed through every later save. And a record file
  grouped into sections, or anything else a record file can carry.

  **What it does not claim.** A JSON file is checked by the same parser the game
  uses, so a clean answer is a real one. A script is checked for quotes, comments
  and brackets, and the pane says in as many words that this is not a syntax check
  and that code passing it can still be wrong. Anything in a record file the
  workshop cannot model is written through unread, and both the file editor and the
  review screen name the file and the keys and say the verdict does not cover them.
- **A guide covering the four things people usually make**, each card naming the
  game's own written tutorial for the same idea, plus a card for everything the
  workshop cannot reach and where to read about it.
- **A parchment treatment**, for anybody who prefers ink on paper to lamplight on
  stone.

### Known limitations, stated here because they change what the mod is

- **The numbers are a demonstration.** Two of the engine seams this needs do not
  exist, so the records the workshop draws its evidence from are its own fixture of a
  few dozen invented entries rather than the game's own content. Every suggestion,
  every evidence table and every usage share is therefore about the fixture. A banner
  says so and cannot be dismissed, and the validator returns a note on every call
  saying that its checks are the workshop's own small set and not the game's.
  `docs/ENGINE_SEAMS.md` specifies every seam; `PLANNED.md` records what each one
  blocks.
- **A mod that ships a script cannot be tried for a session.** That door takes
  content only: it refuses an archive holding a script of any kind at any depth,
  and one whose manifest asks for a capability. So the moment a mod grows either,
  the one-button loop is off, with the reason on the button, and the route is the
  file and the mod manager's own import. That is the right boundary rather than a
  gap - a mod that runs code should arrive through the door that asks the player
  first - and nothing is requested to change it.
- **A finished mod is either tried for the session or saved as a file and added
  through the mod manager.** There is deliberately no way for a mod to put another
  mod into the library for keeps: that would be an elevated permission bought for a
  convenience the one-button session loop already provides, and permanence is exactly
  the part a player should visit the mod manager for. `PLANNED.md` records the
  argument.
- **What is temporary about trying a mod is the mod, not what it does.** The
  archive is forgotten; a character it changed stays changed, and the values seen at
  save time can differ next launch because a pack's adjustments live in the
  composition rather than in the save. The lifetime is also a convention rather than
  a boundary: a browser that restores a closed window restores the staged mod with
  it, which is why the game lists it, marks it, and offers a way to drop it.
- **Unfinished work can be lost.** Drafts live in this install's own settings,
  whose write path catches a quota error and logs it rather than failing. Every
  write is read back and a failure is reported at the moment it happens, and the
  workshop caps what it will try to store, but the file is the only save point it
  will promise.
- **The tab is absent on a few of the game's screens**, and back on the next frame.
- **The workshop writes content, not code, and text, not pictures.** A new monster
  with no tile falls back to its letter.
