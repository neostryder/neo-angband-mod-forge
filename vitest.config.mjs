/**
 * Test config, whose only job is an OPT-IN path to a local engine.
 *
 * By default these tests import `@rpgm-tools/neo-angband-core` and
 * `@rpgm-tools/neo-angband-mod-sdk` from node_modules - the PUBLISHED pair, the
 * versions a player actually runs. That default is deliberate: a mod that passes
 * against an unreleased engine and fails against the released one has been
 * tested against the wrong thing.
 *
 * This mod needs the opposite case more than its siblings do, because it is
 * waiting on engine seams that do not exist yet (see PLANNED.md). So:
 *
 *   NEO_ANGBAND_LOCAL_CORE=1 pnpm test
 *
 * A SECOND VARIABLE, not just the presence of the checkout. Most developers here
 * have the sibling checkout, so keying off that would silently swap the engine
 * under everyone and quietly turn the default into "whatever is on my disk".
 * The opt-in has to be a thing you typed.
 *
 * It resolves to the BUILT output of each package, because that is what the
 * package's own exports point at and therefore what a consumer gets. An unbuilt
 * checkout is a loud failure below rather than a fallback to node_modules:
 * silently testing the published engine after you asked for the local one is the
 * exact confusion this is meant to end.
 *
 * The DOM environment is per-file, declared with an `@vitest-environment jsdom`
 * docblock in the tests that need one. Most of this mod is not the interface -
 * the content pipeline, the record model, the emitter and the zip writer are all
 * plain data - and running those under a synthetic DOM would cost time and prove
 * nothing.
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

const PACKAGES = [
  ["@rpgm-tools/neo-angband-core", "core"],
  ["@rpgm-tools/neo-angband-mod-sdk", "mod-sdk"],
];

function localPackages() {
  if (process.env["NEO_ANGBAND_LOCAL_CORE"] !== "1") return {};

  /* AN EXPLICIT NEO_ANGBAND_REPO IS AUTHORITATIVE: if it is set and does not
   * hold built packages, that is an error, not a reason to look elsewhere. */
  const explicit = process.env["NEO_ANGBAND_REPO"];
  const root = explicit ?? fileURLToPath(new URL("../neo-angband/", import.meta.url));

  const alias = {};
  for (const [specifier, dir] of PACKAGES) {
    const entry = join(root, "packages", dir, "dist", "index.js");
    if (!existsSync(entry)) {
      throw new Error(
        "NEO_ANGBAND_LOCAL_CORE=1 was set, but no BUILT copy of\n" +
          `  ${specifier}\n` +
          "was found. Run `pnpm build` in the game's repository, or point\n" +
          `NEO_ANGBAND_REPO at it. Looked for:\n  ${entry}`,
      );
    }
    alias[specifier] = entry;
  }
  console.log(`[vitest] NEO_ANGBAND_LOCAL_CORE=1 -> ${root}`);
  return alias;
}

export default defineConfig({
  resolve: { alias: localPackages() },
});
