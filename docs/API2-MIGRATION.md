# ModForge and mod API 2

ModForge is a first-party (P-tier) mod and the authoring seam for every other mod, so its move to mod API 2 has two halves: what ModForge itself reads from the game, and what ModForge writes for authors. This page records both against the API 2 surface in `@rpgm-tools/neo-angband-mod-sdk` (`docs/API2.md`, `docs/MIGRATING_TO_API2.md`) and the web host's `API1_CONTEXT_MAP`.

## Where it stands

- What ModForge writes has moved. A generated manifest is a schema 2 document with an `api` range, and the file screen offers two `plugin.js` templates: an API 1 one (the default, because this game loads API 1 plugins from a folder) and an API 2 one (an `Api2ModDefinition` with `start` and `stop`, results instead of exceptions, and no `ctx.core`). The review screen says when a draft's script is API 2 and so will not run on this game yet.
- ModForge's own `manifest.json` is schema 2, converted with the SDK's `convertManifestV1`. It still names the API 1 range (`>=1.0.0 <2.0.0`) and the `in-process` runtime, because the plugin itself is still API 1. A game reads it only once its release contains the reader for schema 2 manifests.
- ModForge's own code is still API 1. Most of what it reads has no API 2 form, so an API 2 twin of the plugin cannot be built yet. The table below says which reads already have an API 2 home and which wait on Core.

## The table

| API 1 member | API 2 home | Notes |
| --- | --- | --- |
| `modApi` in ModForge's own manifest | `api` range in a schema 2 manifest | Moved. The manifest names `>=1.0.0 <2.0.0`, which the game reads as the old `modApi: 1`. |
| `modApi` in a generated manifest | `api` range in a schema 2 manifest | Moved. The range comes from the `api` the script's default export names, so the code and the manifest cannot disagree. The number is still kept in the draft beside the API 1 range, so a game whose library writes schema 1 keeps loading the mod. |
| `api: 1` and `ctx.core` in the generated `plugin.js` | `Api2ModDefinition` template | Moved. The API 1 template stays as the default and no longer mentions `ctx.core`; the API 2 template is a labelled second choice. |
| `ctx.id` | `meta.id` | API 2 home, not wired. |
| `ctx.engine` | `meta.engine` | API 2 home, not wired. ModForge uses it as the engine floor it writes into a draft. |
| `ctx.flags` | `meta.flags` | API 2 home, not wired. Read for the tab switch, kept drafts and the spawn test. |
| `ctx.log` | `meta.log` | API 2 home, not wired. |
| `ctx.prefs` | `store.prefs` | API 2 home, not wired. The API 2 slot is asynchronous and has an explicit prefs migration; the draft store reads synchronously today, so the move changes when a stored draft first appears. |
| `ctx.state` (only whether a game is running) | `view.world()` answering `unavailable` | API 2 home, not wired. The workshop never reads the state itself; it checks that one exists before it offers the Test panel. |
| `ctx.composedRecords` | `content.records(file)` | API 2 home, not wired. One call per pack file. Which files exist comes from the authoring library's blueprint, which is the first Core request below. |
| `regions` plugin member (the workshop tab) | `ui.mount` with a one-button panel | API 2 home, not wired. A host-drawn panel replaces the tab painted into the text grid, which changes how the way in looks. The capability would be `ui:panel.mount` instead of `ui:region.create`. |
| `ctx.authoring` | Core request 1 | The API 1 map retires it: "the SDK package is imported at build time". ModForge calls the library at run time, against the running game's version. |
| `ctx.installMod` | Core request 2 | ModForge does not declare `mod:install`, so this seam is never granted to it today and the workshop saves a file for Import a zip instead. |
| `ctx.reloadGame` | Core request 2 | Used after a session load. The API 1 map lists it as a later `manage` member. |
| `ctx.loadModForSession` | Core request 3 | Needs `mod:session`, which is first-party only. |
| `ctx.wizard` | Core request 4 | Needs `debug:wizard`. The API 1 map retires debug tooling from public mods. |
| The workshop overlay (`document`, reached through `globalThis`) | Core request 5 | Not a context member: the overlay is a shadow-DOM tree the plugin builds itself. API 2's panel grammar (text, buttons, rows, columns) cannot carry a file editor or a record table. |
| `ctx.reload` (`location.reload`) | Stays | Not a host member. `seams.ts` resolves it to `location.reload` in the page, and an in-process mod keeps that. |

Counts: 3 moved, 8 with an API 2 home that is not wired yet, 6 waiting on a Core request (5 requests), and 1 that is not a host member and stays.

## Core requests

1. **The authoring library at run time.** The workshop calls the SDK's authoring functions while the game runs: the blueprint of record kinds and fields, compose, validate, the record checker and the manifest writer. They have to be the running game's own version, or a check passes or fails a mod by another version's rules. The smallest addition is a first-party `manage.authoring()` member, behind a new capability, that answers the SDK barrel the game was built with. Without it, ModForge can bundle the SDK into `plugin.js`, which needs no Core change but lets its checks drift from the game's. P-tier only.
2. **Installing a mod and reloading the game.** The workshop's "Forge and install" button needs to hand the game a mod archive and then restart into it. The smallest addition is `manage.install(bytes)`, which stages the archive and has the host draw the confirmation, plus `manage.reloadGame()`. Both belong in the first-party `manage` namespace that the API 1 map already names for them. P-tier only.
3. **Loading a mod for one session.** "Forge it and play it now" loads a content-only mod for the current session and reloads. The smallest addition is `manage.loadForSession(bytes)`, gated on `mod:session` as today, answering the same refusals the session door gives now. P-tier only.
4. **A sandboxed test session.** The Test panel spawns items and creatures, changes depth and sets the character's numbers through the host's wizard surface, which refuses every command until `sandbox()` has cut the session loose from its save slot. The smallest addition is a first-party `manage.wizard()` member, gated on `debug:wizard`, that answers the same method surface with the same sandbox check in the host. P-tier only.
5. **A host for the workshop's own interface.** The workshop is a full-screen editor with a file tree, a code editor and record tables, built as a shadow-DOM tree. API 2's host-drawn panels cannot carry it, and a Worker has no document. The smallest addition is a P-tier in-process `ui.overlay()` member that answers a shadow root the host owns and shows over the game, so the host decides when it opens and closes. P-tier only.

## The removal list

Removed in this pass, without a Core change and without changing play:

- The integer `modApi` in ModForge's own manifest, now an `api` range in a schema 2 document.
- `modApi` as the only API marker in a generated manifest, now an `api` range read from the script.
- `ctx.core` in the generated template, the plugin's header comment, `package.json` notes, the README and the docs.

Waiting, with the request each one needs:

- The `ctx.state` check before the Test panel, until the plugin itself moves to API 2 and can ask `view.world()` (no Core request; it moves with the rest of the plugin).
- `installMod` and `reloadGame` seam code: Core request 2.
- The `mod:session` grant and `loadModForSession`: Core request 3.
- The `debug:wizard` grant and the Test panel: Core request 4.
- The `ui:region.create` grant and the painted tab: it moves to `ui.mount` with the plugin, and the overlay it opens needs Core request 5.

No capability grant was dropped. Each one backs a feature a player can see: the tab needs `ui:region.create`, "Forge it and play it now" needs `mod:session`, and the Test panel needs `debug:wizard`.

## Release order

A schema 2 `manifest.json` is read only by a game whose release contains the reader for schema 2 manifests. ModForge's own manifest and the manifests it writes through the game's library are schema 2, so a ModForge release with this change waits for that game release.
