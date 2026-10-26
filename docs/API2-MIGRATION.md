# ModForge and mod API 2

ModForge is a first-party mod and the authoring seam for every other mod, so its move to mod API 2 has two halves: what ModForge itself reads from the game, and what ModForge writes for authors. This page records both against the API 2 surface in `@rpgm-tools/neo-angband-mod-sdk`.

## Where it stands

- ModForge's own code runs on mod API 2. `plugin.ts` default-exports an `Api2ModDefinition` with `start` and `stop`, the manifest names `>=2.0.0 <3.0.0`, and the engine floor is 1.22.0, the first build that runs an API 2 definition from a mod folder.
- What ModForge writes has moved. A generated manifest is a schema 2 document with an `api` range, and the file screen offers two `plugin.js` templates: an API 1 one (the default, because this game still loads API 1 plugins from a folder) and an API 2 one (an `Api2ModDefinition` with `start` and `stop`, results instead of exceptions, and no `ctx.core`). The review screen says when a draft's script is API 2 and so needs a game that runs it.
- Every seam the workshop needs now has an API 2 home, so none waits on a Core request: the authoring library, the composed records, the debug commands, loading a mod for one session, reloading into it, and a page to draw on. The four Core requests this page used to carry are all served by `manage` and `ui.overlay`.

## The table

| API 1 member | API 2 home | Notes |
| --- | --- | --- |
| `modApi` in ModForge's own manifest | `api` range in a schema 2 manifest | Moved. The manifest names `>=2.0.0 <3.0.0`. |
| `modApi` in a generated manifest | `api` range in a schema 2 manifest | Moved. The range comes from the `api` the script's default export names, so the code and the manifest cannot disagree. |
| `api: 1` and `ctx.core` in the generated `plugin.js` | `Api2ModDefinition` template | Moved. The API 1 template stays the default and no longer mentions `ctx.core`; the API 2 template is a labelled second choice. |
| `ctx.id` | `meta.id` | Moved. |
| `ctx.engine` | `meta.engine` | Moved. ModForge uses it as the engine floor it writes into a draft. `Api2Meta` marks it as diagnostic, so a draft's floor is a suggestion the author can change. |
| `ctx.flags` | `meta.flags` | Moved. Read for the menu-row switch, kept drafts and the spawn test. |
| `ctx.log` | `meta.log` | Moved. |
| `ctx.prefs` | `store.prefs` | Moved. The slot is asynchronous and the draft store reads synchronously, so `buildBuilderCtx` reads it once when the workshop opens and writes through on every save. A write the game refuses is logged instead of shown on the workshop's status line. |
| `ctx.state` (only whether a game is running) | `manage.wizard().where()` answering null | Moved. The debug commands report whether a character is in play, which is the only thing the workshop asks of the state. |
| `ctx.composedRecords` | `content.records(file)` | Moved. One call per file the authoring library's blueprints list. |
| `regions` plugin member (the workshop tab) | `ui.gameMenu.register` | Moved. A "Build a mod..." row in the Game menu replaces the tab painted into the text grid, because API 2 has no regions. The capability is `registry:menu` instead of `ui:region.create`. |
| `ctx.authoring` | `manage.authoring()` | Moved. Needs `mod:authoring`. |
| `ctx.installMod` | Removed | Removed. ModForge does not declare `mod:install`, and `seams.ts` no longer reads it. The workshop saves a file for Import a zip instead. |
| `ctx.reloadGame` | `manage.reloadGame()` | Moved. Needs `mod:session`. |
| `ctx.loadModForSession` | `manage.loadForSession(bytes)` | Moved. Needs `mod:session`, a first-party permission that the game asks about with its own question. |
| `ctx.wizard` | `manage.wizard()` | Moved. Needs `debug:wizard`. |
| The workshop overlay (`document`, reached through `globalThis`) | `ui.overlay({ id, modal: true })` | Moved. The game makes the page, with a closed shadow root, and draws its own close button. The workshop still listens for keys on the window so that it owns the keyboard while open; a host that will not make a page leaves it to draw its own element, as before. |
| `ctx.reload` (`location.reload`) | Stays | The host does not supply this one. When `manage.reloadGame` is not granted, `seams.ts` falls back to `location.reload` in the page. |

## What changed for the player

- The way in is a Game-menu row, not a corner tab. The setting that switched the tab on and off keeps its identifier (`builder.showTab`), so a stored choice carries over, and its title now names the row.
- The manifest asks for `registry:menu`, `ui:panel.mount` and `mod:authoring` where it asked for `ui:region.create`. `mod:session` and `debug:wizard` are unchanged. `mod:authoring` was handed over implicitly before and is declared now.
- The workshop sits inside the game's own close button, so a second Close control appears in the top right corner beside the workshop's.

## Checking the mod with the game's tools

The game's fixed checks pass with `--first-party`. Run from the Core repository, `node packages/mod-sdk/bin/neo-angband-mod-check.mjs <folder> --first-party` reports no block and one note, that the manifest declares no `budget.msPerTurn`, so the mod gets the default.

## Release order

A schema 2 `manifest.json` that names API 2 is read only by a game whose release contains the API 2 loader for mod folders. A ModForge release with this change needs that game build, and its engine floor says so.
