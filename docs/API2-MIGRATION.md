# ModForge and mod API 2

ModForge is the first-party workshop where players build Neo Angband mods, and other mods are authored through it. Moving it to mod API 2 touched two sides: the calls ModForge makes into the game, and the files it writes for authors. The table on this page maps everything ModForge used from API 1 to its home in the API 2 surface of `@rpgm-tools/neo-angband-mod-sdk`.

## Where it stands

ModForge's own code runs on mod API 2. `plugin.ts` default-exports an `Api2ModDefinition` with `start` and `stop`, and the manifest names `>=2.0.0 <3.0.0` with an engine floor of 1.23.0-beta.1, the first build that runs an API 2 definition from a mod folder.

The files ModForge writes have moved as well. A generated manifest is a schema 2 document with an `api` range. The file screen offers two `plugin.js` templates, and the API 2 one is the default because the game runs an API 2 definition from a mod folder as of 1.23.0-beta.1. The API 2 template is an `Api2ModDefinition` with `start` and `stop` that works with results instead of exceptions and has no `ctx.core`. The API 1 template stays available for a mod that has to run on an older game. When a draft's script is API 2, the review screen says so and notes that it needs a game that runs it.

The workshop's authoring loop has API 2 calls for the authoring library, the composed records, the debug commands, loading a mod for one session, reloading into it, and a page to draw on. Forking from a repository still lacks a read-only file seam. The published SDK builder also accepts only one base pack, so review reports `project/unloadable` for dependencies on another installed mod. [ENGINE_SEAMS.md](ENGINE_SEAMS.md) records those limits.

The pinned SDK 1.23.0-beta.4 publishes mod API 2.1.0. A mod that reads the known-view fields `objectId`, `trapKnown`, `slainUniques`, or `status.countdown` declares `>=2.1.0 <3.0.0`. The workshop and its starter read no 2.1 fields and keep `>=2.0.0 <3.0.0`.

## From API 1 to API 2

| API 1 member | API 2 home | Notes |
| --- | --- | --- |
| `modApi` in ModForge's own manifest | `api` range in a schema 2 manifest | Moved. The manifest names `>=2.0.0 <3.0.0`. |
| `modApi` in a generated manifest | `api` range in a schema 2 manifest | Moved. The range comes from the `api` the script's default export names, so the code and the manifest cannot disagree. |
| `api: 1` and `ctx.core` in the generated `plugin.js` | `Api2ModDefinition` template | Moved. The API 2 template is the default; the API 1 template no longer mentions `ctx.core` and is a labelled second choice. |
| `ctx.id` | `meta.id` | Moved. |
| `ctx.engine` | `meta.engine` | Moved. ModForge uses it as the engine floor it writes into a draft. `Api2Meta` marks it as diagnostic, so a draft's floor is a suggestion the author can change. |
| `ctx.flags` | `meta.flags` | Moved. Read for the menu-row switch, kept drafts and the spawn test. |
| `ctx.log` | `meta.log` | Moved. |
| `ctx.prefs` | `store.prefs` | Moved. The slot is asynchronous and the draft store reads synchronously, so `buildBuilderCtx` reads it once when the workshop opens and writes through on every save. A write the game refuses is logged instead of shown on the workshop's status line. |
| `ctx.state` (only whether a game is running) | `manage.wizard().where()` answering null | Moved. The debug commands report whether a character is in play, which is the only thing the workshop asks of the state. |
| `ctx.composedRecords` | `content.records(file)` | Moved. One call per file the authoring library's blueprints list. |
| `regions` plugin member (the workshop tab) | `ui.gameMenu.register` | Moved. A "Build a mod..." row in the Game menu replaces the tab painted into the text grid, because API 2 has no regions. The capability is `ui:menu.row` instead of `ui:region.create`. |
| `ctx.authoring` | `manage.authoring()` | Moved. Needs `mod:authoring`. |
| `ctx.installMod` | Removed | Removed. ModForge does not declare `mod:install`, and `seams.ts` no longer reads it. The workshop saves a file for Import a zip instead. |
| `ctx.reloadGame` | `manage.reloadGame()` | Moved. Needs `mod:session`. |
| `ctx.loadModForSession` | `manage.loadForSession(bytes)` | Moved. Needs `mod:session`, a first-party permission that the game asks about with its own question. |
| `ctx.wizard` | `manage.wizard()` | Moved. Needs `debug:wizard`. |
| The workshop overlay (`document`, reached through `globalThis`) | `ui.overlay({ id, modal: true, closeAt: "bottom-right" })` | Moved. The game makes the page, with a closed shadow root, and draws its own close button in the bottom right corner, clear of the workshop's header buttons. The workshop still listens for keys on the window so that it owns the keyboard while open; a host that will not make a page leaves it to draw its own element, as before. |
| `ctx.reload` (`location.reload`) | Stays | The host does not supply this one. When `manage.reloadGame` is not granted, `seams.ts` falls back to `location.reload` in the page. |

## What changed for the player

- The workshop opens from a Game-menu row instead of a corner tab. The setting that switched the tab on and off keeps its identifier (`builder.showTab`), so a stored choice carries over, and its title now names the row.
- The manifest asks for `ui:menu.row`, `ui:panel.mount`, and `mod:authoring` where it used to ask for `ui:region.create`. `mod:session` and `debug:wizard` are unchanged. `mod:authoring` used to be handed over implicitly and is now declared.
- The game draws its own Close button on the workshop page. The workshop asks for it in the bottom right corner, which keeps it off the header buttons and the launch screen's Skip button.

## Checking the mod with the game's tools

Run `pnpm exec neo-angband-mod-check . --first-party` from this repository with PowerShell 7 (pwsh). The checker reports the default 50 ms turn budget when `budget.msPerTurn` is absent. Without a base content source it reports "composition not checked"; this does not validate the composed game. `pnpm verify` runs the repository's typecheck, tests, and plugin artifact check.

## Release order

Only a game whose release contains the API 2 loader for mod folders can run an API 2 plugin. A ModForge release with this change needs that game build, and its engine floor says so.
