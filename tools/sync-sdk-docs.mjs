#!/usr/bin/env node
/**
 * Embed the SDK documentation ModForge can show in game.
 *
 * The browser loads one built plugin.js from a mod folder. It has no package
 * resolver and it cannot fetch a markdown file that the mod did not ship, so
 * the reader needs its source text compiled into that module. Local authoring guides and SDK references
 * are the sources of truth; this script selects complete documents and
 * serializes them into a TypeScript module.
 *
 * Keep the selection focused. The beginner path is complete, and the advanced
 * path carries local authoring and publishing guides plus requirements, plugin, API 2,
 * and compatibility references. The engine's lifecycle and design records stay out of the
 * plugin, and so do the reach and region-input notes. Together they would add
 * more than the workshop itself, and none of them is where an author starts.
 *
 * The text is UTF-8 base64 in the generated source and decoded only when the
 * reader opens. The SDK builder's bare-import guard correctly protects live
 * JavaScript, but its intentionally small scan cannot distinguish an import
 * example in a raw Markdown string from executable code.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(root, "node_modules", "@rpgm-tools", "neo-angband-mod-sdk", "docs");
const localDir = resolve(root, "docs");
const output = resolve(root, "src", "ui", "sdk-docs-content.ts");

const documents = [
  {
    id: "tutorial-01",
    path: "tutorials/01-tweak-a-value.md",
    source: "local",
    audience: "beginner",
    title: "1. Change one thing",
    note: "Five minutes, two files, and a dagger that hits harder.",
  },
  {
    id: "tutorial-02",
    path: "tutorials/02-add-an-item.md",
    source: "local",
    audience: "beginner",
    title: "2. Add an item",
    note: "Make a record the base game has never seen.",
  },
  {
    id: "tutorial-03",
    path: "tutorials/03-add-a-monster.md",
    source: "local",
    audience: "beginner",
    title: "3. Add a monster",
    note: "Build the same idea in another record file.",
  },
  {
    id: "tutorial-04",
    path: "tutorials/04-change-a-spell.md",
    source: "local",
    audience: "beginner",
    title: "4. Change a spell",
    note: "Reach into a class and understand a positional path.",
  },
  {
    id: "tutorial-05",
    path: "tutorials/05-hook-behaviour.md",
    source: "local",
    audience: "beginner",
    title: "5. Hook behaviour",
    note: "Write a ten-line plugin that changes behaviour.",
  },
  {
    id: "tutorial-06",
    path: "tutorials/06-add-an-option.md",
    source: "local",
    audience: "beginner",
    title: "6. Add an option",
    note: "Let a player switch your change on and off.",
  },
  {
    id: "tutorial-07",
    path: "tutorials/07-add-an-artifact.md",
    source: "local",
    audience: "beginner",
    title: "7. Add an artifact",
    note: "Build on top of an item and keep it composable.",
  },
  {
    id: "tutorial-08",
    path: "tutorials/08-add-a-store.md",
    source: "local",
    audience: "beginner",
    title: "8. Add a store",
    note: "Replace a storefront and add a player-known buying rule.",
  },
  {
    id: "tutorials",
    path: "tutorials/README.md",
    source: "local",
    audience: "beginner",
    title: "The beginner path",
    note: "How the eight lessons fit together, and what to read next.",
  },
  {
    id: "overview",
    path: "README.md",
    audience: "beginner",
    title: "Modding overview",
    note: "The SDK front door and pack anatomy.",
  },
  {
    id: "requirements",
    path: "REQUIREMENTS.md",
    audience: "advanced",
    title: "Requirements",
    note: "The rules the game enforces before it installs a mod.",
  },
  {
    id: "authoring",
    path: "AUTHORING.md",
    source: "local",
    audience: "advanced",
    title: "Authoring guide",
    note: "Draft records, validate them, and assemble a project.",
  },
  {
    id: "scaffolding",
    path: "SCAFFOLDING.md",
    source: "local",
    audience: "advanced",
    title: "Start a mod",
    note: "Folder layout, API 2 entry point, imports, and assets.",
  },
  {
    id: "publishing",
    path: "PUBLISHING.md",
    source: "local",
    audience: "advanced",
    title: "Check and publish",
    note: "Review a draft, check a repository, and share a release.",
  },
  {
    id: "plugins",
    path: "PLUGINS.md",
    audience: "advanced",
    title: "Plugin API",
    note: "plugin.js, hooks, resources, regions, capabilities, and testing.",
  },
  {
    id: "api2",
    path: "API2.md",
    audience: "advanced",
    title: "Mod API 2",
    note: "The published plugin API: domains, results, events, hooks and storage.",
  },
  {
    id: "api2-migration",
    path: "MIGRATING_TO_API2.md",
    audience: "advanced",
    title: "Moving to API 2",
    note: "Taking a plugin from API 1 to API 2, and what has no API 2 form yet.",
  },
  {
    id: "compatibility",
    path: "MOD_COMPATIBILITY.md",
    audience: "advanced",
    title: "Compatibility",
    note: "What an engine release can change and how a mod stays loadable.",
  },
];

const readDocument = (document) => {
  const local = document.source === "local";
  const file = resolve(local ? localDir : sourceDir, document.path);
  if (!existsSync(file)) {
    throw new Error(
      `Missing documentation: ${document.path}. Local guides and installed SDK references must be present before building ModForge.`,
    );
  }
  return { ...document, source: local ? "local" : "sdk", text: readFileSync(file, "utf8").replace(/\r\n/g, "\n").replace(/\n{2,}$/u, "\n") };
};

const embedded = documents.map(readDocument);
const bytes = new TextEncoder().encode(embedded.map((document) => document.text).join("")).length;
const ceiling = 384 * 1024;
if (bytes > ceiling) {
  throw new Error(`Selected SDK docs are ${String(bytes)} bytes, above the ${String(ceiling)} byte embedding ceiling.`);
}

const encoded = embedded.map(({ text, ...document }) => ({ ...document, encoded: Buffer.from(text, "utf8").toString("base64") }));
const generated = `/**\n * Generated by tools/sync-sdk-docs.mjs from docs/ and @rpgm-tools/neo-angband-mod-sdk/docs.\n * Do not edit by hand.\n */\n\nconst SDK_DOC_SOURCES = ${JSON.stringify(encoded, null, 2)} as const;\n\nexport type SdkDocId = (typeof SDK_DOC_SOURCES)[number]["id"];\nexport interface SdkDoc {\n  readonly id: SdkDocId;\n  readonly path: string;\n  readonly source: "local" | "sdk";\n  readonly audience: "beginner" | "advanced";\n  readonly title: string;\n  readonly note: string;\n  readonly text: string;\n}\n\nlet decoded: readonly SdkDoc[] | undefined;\n\nfunction decodeUtf8(base64: string): string {\n  const binary = atob(base64);\n  const bytes = new Uint8Array(binary.length);\n  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);\n  return new TextDecoder().decode(bytes);\n}\n\nexport function sdkDocs(): readonly SdkDoc[] {\n  if (decoded === undefined) {\n    decoded = SDK_DOC_SOURCES.map(({ encoded, ...document }) => ({ ...document, text: decodeUtf8(encoded) }));\n  }\n  return decoded;\n}\n`;
const before = existsSync(output) ? readFileSync(output, "utf8") : undefined;
if (before !== generated) writeFileSync(output, generated, "utf8");

console.log(`embedded ${String(embedded.length)} SDK documents (${String(bytes)} bytes) in src/ui/sdk-docs-content.ts`);
