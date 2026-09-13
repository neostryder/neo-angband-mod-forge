#!/usr/bin/env node
/**
 * Extract the complete CHANGELOG.md section for a version tag.
 *
 * Usage:
 *   node .github/scripts/release-notes.mjs v1.2.3
 *   node .github/scripts/release-notes.mjs v1.2.3 --output release-notes.md
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function changelogSection(markdown, version) {
  const escapedVersion = escapeRegExp(version);
  const heading = new RegExp(`^##\\s+(?:\\[${escapedVersion}\\]|${escapedVersion})(?:\\s|$)`, "gmu");
  const match = heading.exec(markdown);
  if (!match) return null;

  const nextHeading = /^##\s/gmu;
  nextHeading.lastIndex = match.index + match[0].length;
  const next = nextHeading.exec(markdown);
  return markdown.slice(match.index, next ? next.index : markdown.length);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function main() {
  const [tag, option, outputPath, ...extra] = process.argv.slice(2);
  if (!tag || extra.length > 0 || (option !== undefined && option !== "--output") || (option === "--output" && !outputPath)) {
    fail("Usage: release-notes.mjs <vX.Y.Z> [--output <path>]");
  }
  if (!tag.startsWith("v") || tag.length === 1) fail(`Expected a version tag beginning with v, received: ${tag}`);

  const changelogPath = fileURLToPath(new URL("../../CHANGELOG.md", import.meta.url));
  const section = changelogSection(readFileSync(changelogPath, "utf8"), tag.slice(1));
  if (!section) fail(`No CHANGELOG.md section found for ${tag}`);

  if (option === "--output") {
    writeFileSync(outputPath, section);
  } else {
    process.stdout.write(section);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
