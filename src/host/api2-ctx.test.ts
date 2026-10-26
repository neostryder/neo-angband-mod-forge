import { describe, expect, it, vi } from "vitest";
import { api2NotGranted, api2Ok, api2Refused, type ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { buildBuilderCtx } from "./api2-ctx.js";
import { resolveSeams } from "./seams.js";

const FILES = ["monster", "object"];
const AUTHORING = { BLUEPRINT_FILES: FILES };
const WIZARD = { where: () => ({ depth: 1 }) };

interface Options {
  readonly granted?: readonly string[];
  readonly manage?: boolean;
  readonly where?: unknown;
  readonly stored?: unknown;
  readonly setResult?: "ok" | "refused" | "throws";
}

function fake(options: Options = {}): { mod: ModApi2; logs: string[]; set: ReturnType<typeof vi.fn> } {
  const granted = new Set(options.granted ?? ["mod:authoring", "mod:session", "debug:wizard"]);
  const logs: string[] = [];
  const set = vi.fn(async () => {
    if (options.setResult === "refused") return api2Refused("quota", "out of room");
    if (options.setResult === "throws") throw new Error("host fault");
    return api2Ok(null);
  });
  const manage = {
    authoring: async () => (granted.has("mod:authoring") ? api2Ok(AUTHORING) : api2NotGranted("mod:authoring")),
    wizard: async () => (granted.has("debug:wizard") ? api2Ok({ ...WIZARD, where: () => ("where" in options ? options.where : { depth: 1 }) }) : api2NotGranted("debug:wizard")),
    loadForSession: async (bytes: Uint8Array) =>
      bytes.length === 0 ? api2Refused("empty", "The archive is empty.") : api2Ok({ id: "made", version: "1.0.0", survivesReload: true }),
    reloadGame: async () => api2Ok(null),
  };
  const mod = {
    ...(options.manage === false ? {} : { manage }),
    meta: {
      id: "forge",
      engine: "9.9.9",
      flags: { "builder.keepDrafts": true },
      granted: (capability: string) => granted.has(capability),
      log: (message: string) => logs.push(message),
    },
    content: { records: async (file: string) => api2Ok([{ name: `${file}-one` }]) },
    store: { prefs: { get: async () => api2Ok(options.stored ?? null), set } },
  } as unknown as ModApi2;
  return { mod, logs, set };
}

describe("the context built from a running mod", () => {
  it("carries every seam when the game grants each one", async () => {
    const ctx = await buildBuilderCtx(fake().mod);
    expect(ctx.id).toBe("forge");
    expect(ctx.engine).toBe("9.9.9");
    expect(ctx.authoring).toBe(AUTHORING);
    expect(Object.keys(ctx.composedRecords ?? {})).toEqual(FILES);
    expect(ctx.composedRecords?.["monster"]).toEqual([{ name: "monster-one" }]);
    expect(ctx.wizard).toBeDefined();
    expect(typeof ctx.loadModForSession).toBe("function");
    expect(typeof ctx.reloadGame).toBe("function");
    expect(ctx.state).toBeDefined();
    const seams = resolveSeams({ ...ctx, flags: { ...ctx.flags, "builder.cheatSpawn": true } });
    expect(seams.authoring.available).toBe(true);
    expect(seams.session.available).toBe(true);
    expect(seams.wizard.available).toBe(true);
  });

  it("leaves a seam off when the player did not grant it", async () => {
    const ctx = await buildBuilderCtx(fake({ granted: ["mod:authoring"] }).mod);
    expect(ctx.authoring).toBeDefined();
    expect(ctx.wizard).toBeUndefined();
    expect(ctx.loadModForSession).toBeUndefined();
    expect(ctx.reloadGame).toBeUndefined();
    expect(resolveSeams(ctx).session.available).toBe(false);
  });

  it("is the demonstration context when the game has no management domain", async () => {
    const ctx = await buildBuilderCtx(fake({ manage: false }).mod);
    expect(ctx.authoring).toBeUndefined();
    expect(ctx.composedRecords).toBeUndefined();
    expect(resolveSeams(ctx).authoring.demonstration).toBe(true);
  });

  it("says there is nothing to test with when no character is in play", async () => {
    const ctx = await buildBuilderCtx(fake({ where: null }).mod);
    expect(ctx.wizard).toBeDefined();
    expect(ctx.state).toBeUndefined();
    const seams = resolveSeams({ ...ctx, flags: { "builder.cheatSpawn": true } });
    expect(seams.wizard.available).toBe(false);
  });

  it("turns a refused session load into the workshop's own failure shape", async () => {
    const ctx = await buildBuilderCtx(fake().mod);
    expect(await ctx.loadModForSession!(new Uint8Array(0))).toEqual({ ok: false, problem: "The archive is empty." });
    expect(await ctx.loadModForSession!(new Uint8Array(3))).toEqual({ ok: true, id: "made", version: "1.0.0", survivesReload: true });
  });
});

describe("the stored drafts", () => {
  it("are read once, and a write is readable straight away", async () => {
    const game = fake({ stored: { v: 1 } });
    const ctx = await buildBuilderCtx(game.mod);
    expect(ctx.prefs!.get()).toEqual({ v: 1 });
    ctx.prefs!.set({ v: 2 });
    expect(ctx.prefs!.get()).toEqual({ v: 2 });
    expect(game.set).toHaveBeenCalledWith({ v: 2 });
  });

  it.each([
    ["refused", "draft storage refused the write: out of room"],
    ["throws", "draft storage failed: host fault"],
  ] as const)("log a write the game %s", async (setResult, line) => {
    const game = fake({ setResult });
    const ctx = await buildBuilderCtx(game.mod);
    ctx.prefs!.set({ v: 3 });
    await vi.waitFor(() => expect(game.logs).toContain(line));
  });
});
