# The engine seams this mod needs

Four seams, each stated as a shape rather than a wish: what it is called, what
capability gates it, what it takes, what it returns, and what the mod does when
it is absent. Nothing here is in the engine yet. Every one of them has a
fallback, and the fallback is what runs today, so the workshop is openable and
every screen renders on engine 0.25.0. What the fallbacks cannot do is written
down beside each seam and again in `PLANNED.md`.

The seams are ordered by how much they cost to leave out. Seam 1 is the only one
whose absence makes the workshop a demonstration rather than a tool.

Two rules apply to all four:

- **Absent means absent, never broken.** Each is read through one accessor in
  `src/host/seams.ts`, which returns either the real thing or a named fallback.
  No screen tests for a seam directly, so a seam landing changes one file.
- **A capability string the running engine does not recognise refuses the whole
  mod.** `parseCapability` throws on an unknown string and `CapabilitySet.fromManifest`
  propagates it, so `manifest.json` can only ever declare capabilities that
  already exist. Every new capability below therefore arrives in a release of
  this mod that follows the engine release, not alongside it. The manifest today
  declares `ui:region.create` and nothing else.

---

## Seam 1. `ctx.authoring` - the mod SDK, handed in

**Capability: none.** These are pure functions over data the mod already holds.
There is nothing to gate: no game state is reachable through them, no registry is
mutated, and every one of them is already reachable to anybody who can read the
published npm package.

```ts
/**
 * The mod SDK's public barrel, handed in the way `core` is handed in.
 *
 * Absent on a host that predates the seam, and absent for the same reason
 * `registries` is absent during content composition: there is no honest answer
 * yet rather than an empty one.
 */
readonly authoring?: ModAuthoringApi;

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

**Without it.** `src/host/authoring-stub.ts` implements the same interface over a
hand-written record set of a few dozen records and a hand-written blueprint for
four content kinds. Every screen renders and every gesture works; the numbers are
a demonstration and the workshop says so in a banner it does not let the player
dismiss. It cannot draft against core's real 3279 records, so no suggestion and
no peer table is evidence about the real game, and `emit` produces files that are
structurally right and content that is not worth installing.

**Rejected alternative, recorded so it is not proposed again.** The mod could
ship its own copy of the measured statistics, regenerated from the installed SDK
at release time. That is roughly 300KB of duplicated payload, it drifts from the
engine the moment the engine's content changes, and it would still not supply
`checkRecords` or `ModProject` without reimplementing them - and a
reimplementation of the validator that disagreed with the game's own would be
worse than no validator, because it would be believed.

---

## Seam 2. `ctx.composedRecords` - the records the game was built from

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

**Where it already exists in the host.** `packages/web/src/pack.ts` composes it
and memoises the result as `memo.composed`, alongside `packs`, `dropped` and
`refused`. `composedObjects(composed.records)` is the SDK's own narrowing of
`Record<string, unknown[]>` to `ComposedRecords` and is exported from the barrel,
so the conversion is one call and belongs on the host's side of the seam.

**One property the workshop depends on.** Mod-added records must be in it on the
same terms as core's, exactly as they are in `ctx.registries`. Basing a new sword
on another mod's sword acquires a dependency, and the workshop writes that
dependency at the moment the base is chosen. It can only do that if it can see
the other mod's records and knows who owns them, which the provenance field on a
composed record already carries.

**Without it.** The stub's record set stands in. Everything renders; nothing is
evidence.

---

## Seam 3. `ctx.installMod` - install the bytes

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
 * Save the game and reload, so a mod installed this session takes effect.
 *
 * Gated by the same capability: installing without being able to reload leaves
 * the player holding a mod the running process will never load, and reloading
 * without installing is not something a mod has any business doing.
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

## Seam 4. `ctx.wizard` - spawn something, to look at it

**Capability: `debug:spawn`.** New string, and the one in this document whose
consent text has to be blunt, because taking it has a permanent consequence for
the character.

```ts
/**
 * The wired debug dependencies the running game owns, for the `wiz*` commands
 * on `core`.
 *
 * Present only when the manifest declared `debug:spawn`, the player consented,
 * and there is a live game. It is the GAME'S object, by identity, not a rebuilt
 * one - see below.
 */
readonly wizard?: WizardDeps;
```

`WizardDeps` already exists, and so does the function that assembles it: the web
shell's `buildWizardDeps()` spreads `StartedGame.wizardBundles` (itself
`Pick<WizardDeps, "makeDeps" | "expDeps" | "effect" | "trapDeps" | "monPlace">`,
assembled once in `wireGame`) and adds `wizard`, `debug`, `msg`, `markNoscore`,
`races`, `egos`, `artifacts` and `curses`. The whole seam is putting the result of
that existing function on the plugin context.

**The whole `WizardDeps`, not just the bundle.** `debug` is the field that decides
whether any of these commands do anything, and it comes from the character's
persisted `NOSCORE.DEBUG` bit rather than from wizard mode. A mod handed only the
bundle would have to invent that flag, and inventing it means either a control that
silently does nothing or a mod deciding on its own to mark somebody's character.
Handing over the assembled deps makes the honest answer available: the workshop
reads `debug`, and when it is false the Test panel is disabled with that as the
stated reason. `markNoscore` is in there too and the workshop does not call it -
taking that mark is the player's decision, made through the game's own debug
toggle, not a mod's.

**Why the deps rather than a purpose-built `spawn(name)` function.** Everything a
spawn needs is already exported from core and therefore already on `ctx.core`:
`wizCreateObj`, `wizCreateObjectFromKind`, `wizDropObject`, `wizCreateArtifact`,
`wizSummonNamed`, `wizAcquire`. What a mod cannot get is the deps they all take.
A narrower function would be a second way to spawn, with its own bugs, wrapping
functions the mod can already call.

**Why it must be the game's own instance.** `MakeDeps.artifacts` is a single
`ArtifactState` and its own doc comment says it must be the one instance the game
owns, or an artifact can be created twice. A mod that rebuilt `MakeDeps` from
`ctx.registries` would get a fresh `ArtifactState`, and the failure would be a
duplicate Phial in a save, discovered long afterwards. The same argument applies
to `MonAllocTable` on the live `MonPlaceDeps`. Handing over the wired bundle is
not a convenience: it is the only version of this seam that is correct.

**What the workshop does with it, and what it refuses to do.**

- It spawns only records that are already in the composed game. It never spawns
  from an uncommitted draft, and it never asks the engine to recompose content
  while a game is running. Recomposition can invalidate references held by live
  entities and by generation code, and the payoff would be small: enabling a mod
  already reloads the process, so the loop is build, install, reload, spawn, and
  the reload was never optional.
- Before the first spawn of a session it states, in the panel and not in a
  tooltip, that every one of these commands is gated on the character's
  `NOSCORE.DEBUG` bit, that taking that mark is permanent, and that a marked
  character is barred from the high score list for the rest of its life. It then
  requires an explicit confirmation. `debugEnabled(deps)` reads that bit, so a
  character that has never taken the mark cannot spawn at all, and saying so is
  better than a command that silently does nothing.
- It spawns the peer a draft is being modelled on as readily as it spawns
  something the player made, which is what makes the panel useful before there is
  anything to test.

**Without it.** The Test panel is present, disabled, and says which of the three
reasons applies: the seam is absent, the capability was not granted, or there is
no live game.

---

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
and cannot get that far. Recorded in `PLANNED.md` as a known rough edge with its
mechanism, not as a request.

**A menu-row dispatch seam.** Not needed. The way in is a region the mod paints
and taps, declared with `ui:region.create`, which exists.

**A live content-preview seam.** Considered and rejected; the reasoning is under
seam 4.

**Binary emit.** `EmittedFile.contents` is a `string`, so the emitter cannot
produce a PNG, a font or a sound. That bounds what version one can build rather
than blocking it, and the bound is written down in `PLANNED.md`.
