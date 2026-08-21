/**
 * The seams, and the promise that a disabled control always says which reason.
 *
 * A control that is off because the engine has no seam, a control that is off
 * because the player did not grant the capability, and a control that is off
 * because there is no game running are three different situations with three
 * different next actions. Every one of these tests is about telling them apart.
 */

import { describe, expect, it } from "vitest";
import { resolveSeams } from "./seams.js";
import { STUB_RECORDS } from "./stub-content.js";
import { STUB_AUTHORING } from "./authoring-stub.js";
import type { BuilderCtx } from "./context.js";

function ctxWith(extra: Partial<BuilderCtx>): BuilderCtx {
  return {
    id: "builder",
    engine: "0.25.0",
    flags: {},
    core: {} as BuilderCtx["core"],
    ...extra,
  };
}

describe("the authoring seam", () => {
  it("falls back to the fixture and says the numbers are a demonstration", () => {
    const seams = resolveSeams(ctxWith({}));
    expect(seams.authoring.available).toBe(false);
    expect(seams.authoring.demonstration).toBe(true);
    expect(seams.authoring.why).toContain("demonstration");
    expect(seams.authoring.api.BLUEPRINT_FILES.length).toBeGreaterThan(0);
  });

  it("is live only when both halves are there", () => {
    const half = resolveSeams(ctxWith({ authoring: STUB_AUTHORING }));
    expect(half.authoring.available).toBe(false);
    expect(half.authoring.demonstration).toBe(true);
    expect(half.authoring.why).toContain("demonstration set");

    const whole = resolveSeams(ctxWith({ authoring: STUB_AUTHORING, composedRecords: STUB_RECORDS }));
    expect(whole.authoring.available).toBe(true);
    expect(whole.authoring.demonstration).toBe(false);
    expect(whole.authoring.why).toBeUndefined();
  });
});

describe("the install seam", () => {
  it("points at the mod manager's own import door when there is no seam", () => {
    const seams = resolveSeams(ctxWith({}));
    expect(seams.install.available).toBe(false);
    expect(seams.install.why).toContain("Import a zip");
  });

  it("refuses rather than throwing when called anyway", async () => {
    const outcome = await resolveSeams(ctxWith({})).install.install(new Uint8Array());
    expect(outcome.ok).toBe(false);
  });

  it("uses the real door when one is offered", async () => {
    const seams = resolveSeams(
      ctxWith({
        installMod: async () => ({ ok: true, id: "x", version: "1.0.0", lines: [] }),
      }),
    );
    expect(seams.install.available).toBe(true);
    expect(seams.install.reloadByHand).toBe(true);
    expect((await seams.install.install(new Uint8Array())).ok).toBe(true);
  });
});

describe("the spawn seam", () => {
  const deps = { debug: true };

  it("is off, and says which setting, when the toggle is off", () => {
    const seams = resolveSeams(ctxWith({ wizard: deps, state: {} }));
    expect(seams.spawn.available).toBe(false);
    expect(seams.spawn.why).toContain("setting is off");
  });

  it("is off, and says the engine cannot, when the seam is absent", () => {
    const seams = resolveSeams(ctxWith({ flags: { "builder.cheatSpawn": true }, state: {} }));
    expect(seams.spawn.available).toBe(false);
    expect(seams.spawn.why).toContain("cannot lend");
  });

  it("is off, and says there is no character, when no game is running", () => {
    const seams = resolveSeams(ctxWith({ flags: { "builder.cheatSpawn": true }, wizard: deps }));
    expect(seams.spawn.available).toBe(false);
    expect(seams.spawn.why).toContain("no character");
  });

  it("is off, and names the permanent mark, when the character has not taken it", () => {
    /* The workshop does not take that mark on anybody's behalf: it bars the
     * character from the high score list for the rest of its life. */
    const seams = resolveSeams(ctxWith({ flags: { "builder.cheatSpawn": true }, wizard: { debug: false }, state: {} }));
    expect(seams.spawn.available).toBe(false);
    expect(seams.spawn.why).toContain("high score");
  });

  it("is on when all four hold", () => {
    const seams = resolveSeams(ctxWith({ flags: { "builder.cheatSpawn": true }, wizard: deps, state: {} }));
    expect(seams.spawn.available).toBe(true);
    expect(seams.spawn.why).toBeUndefined();
    expect(seams.spawn.deps).toBe(deps);
  });
});

describe("every seam", () => {
  it("carries a reason whenever it is unavailable, and none when it is not", () => {
    const seams = resolveSeams(ctxWith({}));
    for (const seam of [seams.authoring, seams.install, seams.spawn]) {
      if (seam.available) expect(seam.why).toBeUndefined();
      else expect(seam.why).toBeTruthy();
    }
  });
});
