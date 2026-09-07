import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * `package.json` and `manifest.json` must carry the same version.
 *
 * The game reads `manifest.json`, so that is the version a player installs and
 * the one a release tag matches. `package.json` is only what the build and the
 * toolchain see, which is exactly why it can drift without anything noticing.
 * In a sibling repository it sat three tags out of date and nothing failed
 * (neostryder/neo-angband#175).
 */
describe("the two version sites", () => {
  const read = (f: string): string =>
    (JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8")) as { version: string }).version;

  it("agree", () => {
    expect(read("./package.json")).toBe(read("./manifest.json"));
  });

  it("are the version the changelog's newest released section names", () => {
    /* Released headings are spelled `## [1.2.0] - date` here and `## 1.4.0 - date`
     * in some siblings, so the brackets are optional rather than assumed. */
    const changelog = readFileSync(new URL("./CHANGELOG.md", import.meta.url), "utf8");
    const newest = /^## \[?(\d+\.\d+\.\d+)\]? - /mu.exec(changelog);
    expect(newest?.[1]).toBe(read("./manifest.json"));
  });
});
