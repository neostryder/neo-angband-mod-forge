# The engine seams this mod needs

Five seam decisions, each stated as a shape rather than a wish: what it is called,
what capability gates it, what it takes, what it returns, and what the mod does
when it is absent. Seams 1, 2, 4 and 5 are in Neo Angband 1.0.0. The install half
of seam 3 is deliberately not requested; its reload half is in the engine for a
mod that stages session content. The compatibility fallbacks remain so the
standalone preview and a partial test context still render every screen.

The declared engine range starts at 1.0.0, where the complete production path
used by this release exists. The manifest declares the capabilities for seams 4
and 5 plus its `ui:region.create` entry point. Seams 1 and 2 need no capability.

The production route for this mod is concrete. `main.ts` finishes boot, calls
`setModRegistries(booted.registries)` and
`setModComposedRecords(composedObjects(composedRecords()))`, then builds
`displayCandidateContext` over `modPluginContext`. `installRegions` uses that
context builder when it invokes this plugin's `regions(ctx)` declaration. The
tap handler closes over the same context and passes it to `openWorkshop`, so the
SDK and the composed records reach a `facet: "plugin"` mod using
`ui:region.create`; there is no separate region-only context path.

**Reloading was not one of these when this was first written, and pretending it
was cost the try-it loop three steps.** Composing content takes a reload, so a mod
loaded for the session does not take effect until the page comes back. The
workshop used to say so and leave the player to press Ctrl-R, while holding a
`reload` it never called - which was reporting a restriction that did not exist. A
plugin's code runs in the page and can reach `location` with or without anybody's
permission, exactly as it can reach the document.

**It is a seam now, for the session case.** `ctx.reloadGame` (seam 3) is gated by
`mod:install` or `mod:session`, not `mod:install` alone, and the session seam
(seam 5) prefers it over `location.reload()`: it is the engine's own
save-and-reload sequence - plugin teardown, autoplayer keyboard handback,
character write, session resume - rather than a bare page navigation that skips
the write and can drop the player at title/character-select instead of back into
play. `location.reload()` remains the fallback for a host with neither seam.

Two rules apply to all five:

- **Absent means absent, never broken.** Each is read through one accessor in
  `src/host/seams.ts`, which returns either the real thing or a named fallback.
  No screen tests for a seam directly, so a seam landing changes one file.
- **A capability string the running engine does not recognise refuses the whole
  mod.** `parseCapability` throws on an unknown string and `CapabilitySet.fromManifest`
  propagates it, so `manifest.json` can only ever declare capabilities that
  already exist. A new capability therefore arrives here paired with an `engine`
  range starting at the release that carries it, which a player meets as "this
  needs a newer game" rather than as a mod that fails to load. The manifest
  declares `ui:region.create`, `mod:session` and `debug:wizard`.

---

## Seam 1. `ctx.authoring` - the mod SDK, handed in - LANDED

**Capability: none.** These are pure functions over data the mod already holds.
There is nothing to gate: no game state is reachable through them, no registry is
mutated, and every one of them is already reachable to anybody who can read the
published npm package.

```ts
/**
 * The mod SDK's public barrel, handed in the way `core` is handed in.
 *
 * Always present on the Neo Angband 1.0.0 plugin context.
 */
readonly authoring: ModAuthoringApi;

export type ModAuthoringApi = typeof import("@rpgm-tools/neo-angband-mod-sdk");
```

**Why the whole barrel rather than a curated subset.** `ctx.core` is already
`typeof import("@rpgm-tools/neo-angband-core")`, so the pattern exists and the
ratchet that watches core's surface (`packages/core/mod-api-surface.json`) is the
model for watching this one. A curated subset is a second list to maintain, and
the first thing that happens to a curated list is that it lags the function
somebody needs. The SDK barrel is also already deliberate about what it withholds:
`applyFieldPolicy` is kept out of `index.ts` on purpose and says so in a comment
there, so the barrel is a considered surface rather than everything that happens
to be exported.

**What the workshop calls through it.** Named so the surface can be measured
rather than guessed at:

| Function | What the workshop does with it |
| --- | --- |
| `RECORD_BLUEPRINTS`, `BLUEPRINT_FILES`, `blueprintFor` | the content-kind list, and every field's measured shape, type set and range |
| `describeFile` | the one-line summary on each content kind |
| `fieldUsage`, `requiredFields` | how common a field is, which is what "expected" means on a field card |
| `templateRecord`, `draftRecord` | filling a new record with typical values rather than empty ones |
| `peersFor` | the evidence table: comparable records, and the sentence saying why they are comparable |
| `suggestFields` | a value plus the sentence explaining it |
| `checkRecords`, `COMPANION_RULES` | live validation, at the same three levels the running game uses |
| `ModProject`, `modProject` | assembling, validating and emitting the mod |
| `recordKey`, `recordRefKeys`, `keySpecFor`, `keyDescription` | the ref a record will be addressed by, shown at the moment the player names it |
| `validateManifest`, `ManifestError`, `PACK_GROUPS`, `slugify` | live checks on the mod's own id, name and version |
| `applyFieldPatch`, `composeFieldPatches`, `touchedFields` | previewing a patch, and reporting a same-field collision |
| `MOD_REQUIREMENTS`, `checkMod` | the requirement rows on the mod-details screen, so a refusal at install time is not the first the player hears of it |
| `danglingReferences`, `normalizeRef` | naming what else references a record before it is removed |
| `compareSemver`, `satisfies` | the engine range the emitted mod declares |

**Production wiring.** `mod-context.ts` imports the SDK namespace once and places
it on every `modPluginContext` result unconditionally. Unlike composed records,
it does not wait for game boot because its functions are pure over caller-owned
data. `mod-authoring-surface.test.ts` pins the barrel and
`mod-authoring-seam.node.test.ts` calls it through the context.

**Without it.** A standalone or compatibility context can still omit the field
from ModForge's narrower `BuilderCtx`. `src/host/authoring-stub.ts` then implements
the same interface over a hand-written record set of a few dozen records and a
hand-written blueprint for four content kinds. Every screen renders and every
gesture works; the numbers are a demonstration and the workshop says so in a
banner it does not let the player dismiss. This is not the production path on a
supported game.

**The advisory extension also landed.** `RecordBlueprint` measures a closed set
of values for a field where core's data has one. `checkRecords` now reports an
unlisted value as the `field/vocabulary` hint. It is never an error because a mod
may legally coin a new tval or slay code, but it still catches a misspelled member
of an existing vocabulary. ModForge calls that checker over the composed draft
and no longer keeps a second `workshop/vocabulary` implementation.

**Rejected alternative, recorded so it is not proposed again.** The mod could
ship its own copy of the measured statistics, regenerated from the installed SDK
at release time. That is roughly 300KB of duplicated payload, it drifts from the
engine the moment the engine's content changes, and it would still not supply
`checkRecords` or `ModProject` without reimplementing them - and a
reimplementation of the validator that disagreed with the game's own would be
worse than no validator, because it would be believed.

---

## Seam 2. `ctx.composedRecords` - the records the game was built from - LANDED

**Capability: none.** It is the same content the player already has, in the shape
it was read in. `ctx.registries` already publishes the bound result of exactly
this data with no capability, and this is strictly less than that: data rather
than live objects.

```ts
/**
 * Every content record the running game was composed from, as JSON, keyed by
 * pack-file stem with no extension: "monster", "object", "store".
 *
 * The BOUND form of the same content is `registries`. This is what the binder
 * read. Absent during content composition, for the same reason.
 */
readonly composedRecords?: Readonly<Record<string, readonly JsonRecord[]>>;
```

**Why it is needed when `ctx.registries` exists.** They are different shapes and
only one of them is what the authoring stack accepts. Every `records` parameter
in the SDK is `Readonly<Record<string, readonly JsonRecord[]>>` keyed by file
stem, and `peersFor`, `suggestFields`, `templateRecord`, `draftRecord` and
`checkRecords` all take it. `ctx.registries.monsters.races` is `MonsterRace[]`:
bound, resolved, and carrying neither the JSON key names nor the fields that
bound to nothing. A peer table built from bound races could not answer "what does
`base` say on the dogs near depth 3", because `base` is not a field on a bound
race.

**Production wiring.** `packages/web/src/pack.ts` composes it and memoises the
result as `memo.composed`, alongside `packs`, `dropped` and `refused`. After the
game has booted, `main.ts` calls
`setModComposedRecords(composedObjects(composedRecords()))` beside the bound
registry latch. Every later `modPluginContext` reads that latch, including the
context `installRegions` gives ModForge. `composedObjects` is the SDK's own
narrowing of `Record<string, unknown[]>` to `ComposedRecords`, so the host and the
authoring functions agree about which passthrough elements are records.

**One property the workshop depends on.** Mod-added records must be in it on the
same terms as core's, exactly as they are in `ctx.registries`. Basing a new sword
on another mod's sword acquires a dependency, and the workshop writes that
dependency at the moment the base is chosen. It can only do that if it can see
the other mod's records and knows who owns them, which the provenance field on a
composed record already carries.

**Without it.** During content composition, or in a standalone or partial test
context, the field is honestly absent and ModForge's stub record set stands in.
Everything renders; nothing from that fallback is presented as evidence about
the running game. On the supported in-game path it is present before regions are
installed.

---

## Seam 3. `ctx.installMod` - install the bytes - DECLINED; reload LANDED

The install contract below records the evaluated shape, but ModForge does not ask
for the capability and the engine does not expose this field. The session-loading
door already supplies the authoring loop without granting a mod permission to make
another mod permanent. `ctx.reloadGame`, also recorded in this section, did land
for callers holding `mod:session` or `mod:install`.

**Capability: `mod:install`.** New string, new arm in `parseCapability`, new arm
in `grantCovers`, new arm in `describeCapability` with elevated consent text. The
consent sentence has to say what it actually permits, which is that the mod may
put another mod into this install without the player visiting the mod manager.

```ts
/**
 * Install a mod from the bytes of a zip, exactly as importing a zip file does.
 *
 * Present only when the manifest declared `mod:install` and the player consented.
 */
readonly installMod?: (bytes: Uint8Array) => Promise<InstallModResult>;

export type InstallModResult =
  | { readonly ok: true; readonly id: string; readonly version: string; readonly lines: readonly string[] }
  | { readonly ok: false; readonly problem: string; readonly lines: readonly string[] };

/**
 * Save the game and reload, so a mod installed or staged this session takes effect.
 *
 * Gated by `mod:install` or `mod:session`, not `mod:install` alone: a mod that
 * stages content with seam 5 needs to follow it with a reload exactly as one that
 * installs does, and reloading without either is not something a mod has any
 * business doing.
 */
readonly reloadGame?: () => Promise<void>;
```

**Notes on the shape, each one there because of something in the existing path.**

- `lines` carries the host's own wording. `installFailureLines`, `installOutcomeLines`,
  `requirementsRefusal` and `MOD_CHECK_ADVICE` already exist and are what a
  downloaded mod's failure reads like. A mod built here that fails a requirement
  must fail with the same words, or the player learns two vocabularies for one
  concept. Returning the lines rather than a code is what makes that free.
- `problem` is `InstallResult.problem` unchanged: one whole sentence.
- No `replace` option and no `force`. `installModFromZip` pins the origin on
  first import and refuses a later import whose repository disagrees, and that is
  correct: the workshop's job is to persist the repository string with the draft
  and never regenerate it, not to ask the engine to relax the rule.
- `installBlocked("third-party", allowed)` runs before the archive is opened, so
  the answer can be "third-party mods are switched off" before any work happens.
  The workshop checks this when it OPENS rather than when it installs, because a
  player who has spent twenty minutes on a monster and is then told to go and
  press a key on another screen has had a bad time.

**Without it.** The workshop writes the same bytes to a file the player
downloads, and points at the mod manager's existing zip-import door, which
already accepts exactly these bytes. That path costs two extra actions and is
otherwise identical, and it has one advantage worth keeping even after the seam
lands: the player ends up holding a file they can open, read, hand to somebody
and push to a repository. So the download button stays either way, and the seam
removes a round trip rather than unlocking a capability.

---

## Seam 4. `ctx.wizard` - the whole debug set, on a session that is not being saved

**Capability: `debug:wizard`. LANDED in the engine.** A separate string from
`debug:spawn` rather than a wider reading of it, because the two cost the player
different things and neither is a bigger helping of the other. The engine's
`grantCovers` compares the action, so one consent cannot buy both.

```ts
/**
 * The game's debug commands as METHODS, plus a catalogue of everything loaded.
 *
 * Present only when the manifest declared `debug:wizard`, the player consented,
 * and there is a live game. Every command refuses until `sandbox()` has cut the
 * session loose from its save slot, which cannot be undone.
 */
readonly wizard?: WizardApi;
```

**This is not the shape this seam was asked for, and the change moved a guarantee
out of this repository.** The ask was for the wired `WizardDeps` bundle, so the
workshop could pass it back into the `wiz*` functions on `ctx.core` itself. The
reasoning was sound as far as it went: everything a spawn needs is already exported
from core, what a mod cannot get is the deps those functions take, and rebuilding
`MakeDeps` from `ctx.registries` would hand the mod a fresh `ArtifactState` and
create the Phial twice.

What that shape could not do is stop a mistake here from reaching somebody's
character. Those functions are gated on a `debug` flag in a bag the CALLER
assembles, so the only thing between a bug in this repository and a cheated
character written over a real save was this repository's own care. A method surface
puts the rule in the host, where it is enforced instead of intended.

**What the host enforces, which is the whole bargain.** Not one command runs until
`sandbox()` has dropped the session's active save slot id. That id is the single
thing every write to a character consults - the turn-tail autosave, the level-change
save, `S`, the options screen, `pagehide` and the death save all end up there - so a
session without one writes nowhere. Detaching also throws a one-way latch in the
page's own memory, because the id itself lives in storage every tab shares. It
cannot be undone.

**So this grant is SAFER for the character on disk than `debug:spawn` is, not more
dangerous.** Spawning acts on the character the player is actually playing and costs
them that character's place on the high score list for good. This one refuses to
touch a character that is still being written down at all. The consent sentence says
so; describing it as "more debug commands" would have the risk exactly backwards.

**Which is also why the panel no longer refuses on somebody's behalf.** The old
design had a fourth disabled reason: the character had not taken Angband's permanent
debug mark, and the workshop would not take it for them, correctly, because it cost
that character its scoring eligibility forever. Detaching first is a smaller thing to
spend and it is spent in the open, so the mark now lands on a character that has
already stopped being written down, where it is simply true. There is nothing left to
refuse for anybody.

**What the workshop does with it.**

- It arranges the game around one record rather than only conjuring one. Testing a
  monster written for dungeon level forty means being on level forty; testing an item
  balanced for a hundred hit points means having them. The panel carries the depth
  jump, the experience and gold and stat edits, acquirement, summoning, banishment,
  mapping, lighting and lore, because that set is what one honest test takes.
- It says what testing costs, in the panel and not in a tooltip, naming the character
  who is about to stop being saved, before the button that spends it. That button is
  the only live control until it is pressed.
- It shows the author's own content first. Every catalogue entry carries the pack
  that added it, so the ordering needs no list of what the base game contains - a
  list that would be wrong the first time the game added a monster. It is **not**
  limited to the mod's own content: the filter turns off, and the record an author is
  modelling theirs on is the thing they most often want to test against.
- It reads the catalogue BEFORE anything is consented to, which is the one thing that
  works unarmed. Deciding what to test is how somebody decides whether to spend their
  session; a browser that filled in afterwards would ask them to agree to something
  they cannot see.
- It still spawns only records already in the composed game. It never spawns from an
  uncommitted draft and never asks the engine to recompose under a live game, which
  can invalidate references held by live entities and by generation code. The loop is
  forge, play, test - and forging and playing is now one button.

**Without it.** The Test panel is reachable, disabled, and says which of three
reasons applies: the setting is off, the engine has no seam, or there is no live
game. The catalogue browser still fills in whenever there is a game to read.

---

## Seam 5. `ctx.loadModForSession` - try it now, without keeping it

**Capability: `mod:session`. LANDED in the engine.** A separate string from
`mod:install` rather than a flag on it, because the two say different things to a
player: an install arrives switched off and waits to be turned on, and a session
load is on as soon as the game reloads. The engine's `grantCovers` compares the
action so neither consent sentence can be spent on the other.

```ts
/**
 * Load a mod for THIS SESSION only, from the bytes of a zip.
 *
 * Present only when the manifest declared `mod:session` and the player consented.
 */
readonly loadModForSession?: (bytes: Uint8Array) => Promise<SessionModResult>;

export type SessionModResult =
  | { readonly ok: true; readonly id: string; readonly version: string; readonly survivesReload: boolean }
  | { readonly ok: false; readonly problem: string };
```

**Why this is the seam the workshop actually wanted.** Seam 3 removes a round
trip; this removes the reason to hesitate. The loop an author is in is build,
look, change, look again, and every iteration of it through the install door
leaves another version of an unfinished mod in the library. A session load is the
same loop with nothing accumulating, which is what makes it usable more than once
an evening.

**Notes on the shape.**

- `survivesReload` is the one field a caller cannot work out for itself. A window
  with storage switched off takes the mod for this page and loses it on the way
  back up, so "reload to try it" would send the player round a loop that cannot
  finish. The workshop reads it and says to install instead.
- No `lines`. Unlike an install, there is no second vocabulary to match: a
  refusal here is `problem`, one whole sentence, and the archive is refused by the
  same functions the install door uses so the wording is already the game's.
- Content only, refused by name, on exactly the terms seam 3 is. The door refuses
  an archive holding a `.js`, `.mjs`, `.cjs`, `.ts` or `.wasm` at any depth, and
  refuses one whose manifest declares any capability. That is right, and it is the
  reason the seam is not a route by which any mod could get code to run without a
  player being asked.

  **It costs the workshop something now, which it did not when this was written.**
  The file editor can carry a hand-written `plugin.js`, so a mod made here is no
  longer content by construction. The button is therefore off for a mod that ships
  a script, with the reason on it, and the route for that mod is the file and the
  mod manager's own import door. Nothing is asked for here: consent belongs where
  the player is, and a mod that runs code should arrive through the door that says
  so. See `sessionRefusal` in `src/model/files.ts` - one function, asked by both
  buttons and by the action behind them, so a disabled control and the refusal
  behind it cannot drift apart.

**What the workshop says before it stages anything.** That trying it is not a
preview: the pack composes into the game exactly as an installed one does, so the
character who plays it keeps whatever it does to them, and next launch, with the
pack gone, that character's mod-owned monsters and items belong to something that
is not installed. "Only for this session" reads as a safety feature and is not
one, so the note under the button says the other half in the same breath.

**Without it.** The Try button is present, disabled, and says that this game has
no way to load a mod for one session, so trying one means installing it - which
is the loop that already worked, spelled out rather than implied.

## What is deliberately not asked for

**A DOM overlay seam.** An earlier shape of this design asked for
`ui:dom.overlay`, granting a mounted element, host-managed stacking, and
suppression of the game's own keyboard and pointer input while the overlay is
open. It is not requested, because four sample plugins that ship with the game
already create their own elements with the ambient `document`, position them from
`RegionPixels`, and manage their own listeners, and the region documentation names
that as the pattern rather than tolerating it. A capability would also not be a
boundary: in-process mod code reaches `document` whether or not `ctx` mentions
it, which the engine's own capability documentation states plainly.

What the seam would genuinely buy is one thing the mod cannot do properly for
itself: the host clearing held-key and pointer-button state as the overlay takes
and releases input, so that closing the workshop with a key held does not move
the character. The mod's own capture-phase listeners get most of the way there
and cannot get that far, since the browser's own hardware auto-repeat for a
still-held key is not something any amount of listener bookkeeping in this
mod's script can reach. What the listeners CAN do, and now do, is set right the
one thing that is honestly theirs to fix: `src/ui/overlay.ts` tracks a key or
pointer button it has seen go down without a matching release while it owns
input, and sends the game an honest keyup or mouseup for one on acquire and on
release, so the game is never left believing something is held that it can no
longer hear the release of. That narrows the edge case; it does not close it.
Implemented in `src/ui/overlay.ts`, with the remaining browser-level edge case
described above.

**A menu-row dispatch seam.** Not needed. The way in is a region the mod paints
and taps, declared with `ui:region.create`, which exists.

**A live content-preview seam.** Considered and rejected; the reasoning is under
seam 4.

**Binary emit.** Not an engine seam at all, in the end: `EmittedFile.contents` is
now `string | Uint8Array` rather than only `string`, which is a change entirely
on this repository's side of the boundary and asks the engine for nothing new.
A tile, a font or a sound is a hand-carried extra whose bytes are held exactly
as given, through the file editor, the project builder's emit path and the zip
writer alike; a record file and the manifest stay text, unaffected. Loading a
shipped binary asset back into the running game remains a question about an
engine seam, not about whether the workshop can emit the bytes.
