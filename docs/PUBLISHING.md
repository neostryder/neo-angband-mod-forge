# Check and publish a mod

A distributed mod is a folder holding `manifest.json`, the record contributions and resources it declares, and `plugin.js` if the mod runs code. The game loads that folder from disk, from a zip, or from a repository. npm supplies only the development SDK, and the mod itself ships as the folder.

## Review the draft

In ModForge, click **Review it** to read errors, warnings, and hints. Set a repository address and a license before you share the mod. A fork made from installed records has lost its source manifest and license, so get the original license from the author before you publish that fork.

**Try it in the game** stages the content for one session and reloads through the host. Mods with scripts or capability requests cannot be staged this way. Session loading changes the running game and can affect a saved character, and the staged mod is gone at the next launch. **Save it as a file** exports the files for **Import a zip** on the Mods screen, and this route also works for code mods that need player consent.

## Check a repository

Add the published `@rpgm-tools/neo-angband-mod-sdk` as a development dependency. SDK 1.23.0-beta.4 carries mod API 2.1.0. Run these commands in the mod repository with PowerShell 7 (pwsh):

```powershell
pnpm exec neo-angband-mod-build --root .
pnpm exec neo-angband-mod-check .
```

Skip the builder step if you wrote `plugin.js` by hand. Run the repository's tests and typecheck too. The checker looks at requirements, undeclared context reads, dangling references, and record findings. It takes a folder or a zip, uses the current directory when you give no path, and prints a JSON report with `--json`. Exit code 0 means no blocking finding, 1 means at least one blocking finding, and 2 means the checker could not read the path.

When `@rpgm-tools/neo-angband-content` is installed, the checker composes your mod against it. If that package is missing, pass `--base <dir>` with a pinned content pack. Patches and cross-pack references are only verified to compose when the check runs against base content. [Plugin testing](PLUGIN_TESTING.md) covers composition and behavior tests against the public packages.

`--first-party` is for the game's own mods. The flag allows the first-party capability vocabulary during checking and changes nothing else. A distributed mod checked with it is still a third-party mod.

## Run checks in CI

Put the SDK in the mod's development dependencies and commit the lockfile. The CI job then installs from the lockfile, builds a compiled plugin if the mod has one, and runs the checker and the repository's verification script. Leave `--first-party` out of a third-party mod's check command.

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm exec neo-angband-mod-check .
- run: pnpm verify
```

Have the verification script check the committed plugin artifact along with types and tests. After any source change, rebuild and commit `plugin.js` before you publish. The game's loader reads that file directly and never compiles TypeScript.

## Share the folder or repository

Keep `manifest.json` at the mod root and include every runtime file the manifest declares. A zip holds the same files. If the source needs compiling, the repository also holds the built `plugin.js`. Share the repository address declared in the manifest. The installer pins that origin and rejects a replacement from any other repository.

To distribute through the repository installer, publish a tag that matches the manifest version. The game resolves tags against its update channel and compatibility rules, so pushing to a development branch alone publishes nothing to players. The manifest's `api` range names the mod API contract, and its `engine.range` and `engine.because` state which game builds the mod needs. See [Core's compatibility reference](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_COMPATIBILITY.md).

Before you share a release, install the exported folder or zip through the game's Mods screen. The installer shows the mod's identity, license, content changes, and capability requests, and the player chooses whether to install and enable it. [Core's installation guide](https://github.com/neostryder/neo-angband/blob/master/docs/MODS.md) walks through the player side, and [requirements](https://github.com/neostryder/neo-angband/blob/master/docs/modding/REQUIREMENTS.md) lists the checks the installer runs.
