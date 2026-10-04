/**
 * The two scripts the file screen starts `plugin.js` from, run rather than read.
 *
 * Each template is the first code an author sees, so each has to be a definition
 * the game accepts for the API it names: the API 1 one hands back hooks, and the
 * API 2 one names the API 2 range and handles a refused call without throwing.
 */

import { describe, expect, it } from "vitest";
import { apiRangeVerdict, MOD_API2_DEFAULT_RANGE } from "@rpgm-tools/neo-angband-mod-sdk";
import type { Api2Result, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { scriptApi } from "../../model/manifest-doc.js";
import { PLUGIN_TEMPLATE, PLUGIN_TEMPLATE_API2 } from "./files.js";

/** The template's default export, evaluated the way a module body would be. */
function definition(source: string): Record<string, unknown> {
  expect(source).toContain("export default {");
  const body = source.replace("export default {", "return {");
  return (new Function(body) as () => Record<string, unknown>)();
}

describe("the API 1 template", () => {
  it("declares api 1 and hands back hooks", () => {
    const plugin = definition(PLUGIN_TEMPLATE);
    expect(plugin["api"]).toBe(1);
    const lines: string[] = [];
    const hooks = (plugin["hooks"] as (ctx: { log: (m: string) => void }) => unknown)({ log: (m) => lines.push(m) });
    expect(hooks).toEqual({});
    expect(lines).toEqual(["hello from a hand-written plugin"]);
  });

  it("does not point an author at the engine instance", () => {
    expect(PLUGIN_TEMPLATE).not.toContain("ctx.core");
  });
});

describe("the API 2 template", () => {
  it("names a range the API 2 host accepts, and the manifest reads the same range", () => {
    const plugin = definition(PLUGIN_TEMPLATE_API2);
    expect(plugin["api"]).toBe(MOD_API2_DEFAULT_RANGE);
    expect(apiRangeVerdict(plugin["api"] as string).ok).toBe(true);
    expect(scriptApi(PLUGIN_TEMPLATE_API2).range).toBe(MOD_API2_DEFAULT_RANGE);
    expect(PLUGIN_TEMPLATE_API2).not.toContain("ctx.");
  });

  it("logs and stops when the world cannot be read, instead of throwing", async () => {
    const plugin = definition(PLUGIN_TEMPLATE_API2);
    const lines: string[] = [];
    const refused: Api2Result<never> = { ok: false, reason: "unavailable", message: "no game yet" };
    const mod = {
      meta: { log: (m: string) => lines.push(m) },
      view: { world: () => Promise.resolve(refused) },
    } as unknown as ModApi2;
    await (plugin["start"] as (m: ModApi2) => Promise<void>)(mod);
    expect(lines).toEqual(["no world to read yet: unavailable"]);
    expect(() => (plugin["stop"] as () => void)()).not.toThrow();
  });

  it("logs its greeting once the world answers", async () => {
    const plugin = definition(PLUGIN_TEMPLATE_API2);
    const lines: string[] = [];
    const mod = {
      meta: { log: (m: string) => lines.push(m) },
      view: { world: () => Promise.resolve({ ok: true, value: {} }) },
    } as unknown as ModApi2;
    await (plugin["start"] as (m: ModApi2) => Promise<void>)(mod);
    expect(lines).toEqual(["hello from a hand-written plugin"]);
  });
});
