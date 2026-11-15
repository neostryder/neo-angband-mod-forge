# Check and publish a mod

A distributed mod contains `manifest.json`, its declared record contributions and resources, and `plugin.js` when it runs code. The game consumes that folder from disk, a zip, or a repository. The mod itself is not an npm package; npm supplies the development SDK.

## Review the draft

In ModForge, use **Review it** to read errors, warnings, and hints. Set a repository address and a license before sharing. A fork taken from installed records cannot recover the source manifest or license; obtain the original license before publishing that fork.

**Try for this session** stages content for one session and reloads through the host. It refuses scripts and capabilities. Session loading changes the running game and can affect a saved character; the next launch does not retain the staged mod. **Save zip** exports the files for **Import a zip** on the Mods screen, including code mods that need consent.

## Check a repository

Use the published `@rpgm-tools/neo-angband-mod-sdk` as a development dependency. SDK 1.23.0-beta.3 carries mod API 2.0.0. Run these commands in the mod repository with PowerShell 7 (pwsh):

```powershell
pnpm exec neo-angband-mod-build --root .
pnpm exec neo-angband-mod-check .
```

A hand-written `plugin.js` needs no builder step. Run the repository's tests and typecheck as well. The checker inspects requirements, undeclared context reads, dangling references, and record findings. It checks a folder or zip, defaults to the current directory, and accepts `--json` for a JSON report. Exit code 0 means no blocking finding, 1 means a blocking finding, and 2 means the path could not be checked.

The checker composes against `@rpgm-tools/neo-angband-content` when that package is available. Otherwise pass `--base <dir>` with a pinned content pack. A check without base content does not prove that patches or cross-pack references compose correctly. [Plugin testing](PLUGIN_TESTING.md) covers composition and behavior tests against the public packages.

Only the game's own mods use `--first-party`. That flag permits the first-party capability vocabulary during checking; it does not grant a distributed mod first-party status.

## Run checks in CI

With the SDK in the mod's development dependencies and the lockfile committed, a CI job installs from the lockfile, builds a compiled plugin when needed, and runs the checker and the repository's verification script. A third-party mod's check command omits `--first-party`.

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm exec neo-angband-mod-check .
- run: pnpm verify
```

The verification script should check the committed plugin artifact as well as types and tests. Rebuild and commit `plugin.js` before publishing a source change. The game's loader consumes that file, without compiling TypeScript.

## Share the folder or repository

Keep `manifest.json` at the mod root and include every runtime file the manifest declares. A zip holds the same files. A repository also holds the built `plugin.js` when the source needs compilation. Use the repository address declared in the manifest; the installer pins that origin and refuses a replacement from a different repository.

Publish a tag matching the manifest version when distributing through the repository installer. The game resolves tags against its update channel and compatibility rules, so a development branch alone is not a release. The manifest's `api` range names the mod API contract; its `engine.range` and `engine.because` state the game build requirement. See [Core's compatibility reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_COMPATIBILITY.md).

Test the exported folder or zip through the game's Mods screen before sharing a release. The installer shows the mod's identity, license, content changes, and capability requests; the player decides whether to install and enable it. [Core's installation guide](https://github.com/neostryder/neo-angband/blob/master/docs/MODS.md) describes the player workflow, and [requirements](https://github.com/neostryder/neo-angband/blob/master/docs/modding/REQUIREMENTS.md) lists the installation checks.
