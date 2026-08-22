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

describe("the wizard seam", () => {
  const api = wizardStub();
  const on = { "builder.cheatSpawn": true };

  it("is off, and says which setting, when the toggle is off", () => {
    const seams = resolveSeams(ctxWith({ wizard: api, state: {} }));
    expect(seams.wizard.available).toBe(false);
    expect(seams.wizard.why).toContain("setting is off");
  });

  it("is off, and says the engine cannot, when the seam is absent", () => {
    const seams = resolveSeams(ctxWith({ flags: on, state: {} }));
    expect(seams.wizard.available).toBe(false);
    expect(seams.wizard.why).toContain("cannot lend");
  });

  it("is off, and says there is no character, when no game is running", () => {
    const seams = resolveSeams(ctxWith({ flags: on, wizard: api }));
    expect(seams.wizard.available).toBe(false);
    expect(seams.wizard.why).toContain("no character");
  });

  it("carries the api on the no-character arm, so the browser can still fill in", () => {
    /* The catalogue is readable before anything is consented to, and deciding what
     * to test is how somebody decides whether to spend their session at all. A
     * browser that only appeared afterwards would be asking them to agree to
     * something they cannot see. */
    const seams = resolveSeams(ctxWith({ flags: on, wizard: api }));
    expect(seams.wizard.api).toBe(api);
  });

  it("is on when the toggle, the seam and a game are all there", () => {
    /* THREE CONDITIONS, NOT FOUR. The old seam had a fourth - the character having
     * already taken Angband's permanent debug mark, which the workshop refused to
     * take on anybody's behalf because it costs that character its place on the high
     * score list forever. The seam now cuts the session loose from its save before
     * it takes the mark, so the mark lands on a character that has stopped being
     * written down and there is nothing left to refuse for somebody. */
    const seams = resolveSeams(ctxWith({ flags: on, wizard: api, state: {} }));
    expect(seams.wizard.available).toBe(true);
    expect(seams.wizard.why).toBeUndefined();
    expect(seams.wizard.api).toBe(api);
  });
});

describe("reloading", () => {
  it("is not by hand when the host offers a reload", () => {
    const seams = resolveSeams(
      ctxWith({
        loadModForSession: async () => ({ ok: true, id: "x", version: "1.0.0", survivesReload: true }),
        reload: () => undefined,
      }),
    );
    expect(seams.session.available).toBe(true);
    expect(seams.session.reloadByHand).toBe(false);
  });

  it("calls what it was given rather than navigating on its own", () => {
    let reloaded = 0;
    const seams = resolveSeams(
      ctxWith({
        loadModForSession: async () => ({ ok: true, id: "x", version: "1.0.0", survivesReload: true }),
        reload: () => {
          reloaded += 1;
        },
      }),
    );
    seams.session.reload();
    expect(reloaded).toBe(1);
  });
});

describe("every seam", () => {
  it("carries a reason whenever it is unavailable, and none when it is not", () => {
    const seams = resolveSeams(ctxWith({}));
    for (const seam of [seams.authoring, seams.install, seams.wizard]) {
      if (seam.available) expect(seam.why).toBeUndefined();
      else expect(seam.why).toBeTruthy();
    }
  });
});

/**
 * A `WizardApi` that answers everything and does nothing.
 *
 * Built by proxy rather than written out, because these tests are about which arm
 * `resolveWizard` picks and about identity - `seams.wizard.api` being the object it
 * was handed. Twenty-six hand-written stubs would be twenty-six things to keep in
 * step with an interface none of them is testing.
 */
function wizardStub(): NonNullable<BuilderCtx["wizard"]> {
  const refuse = { ok: false as const, problem: "a stub does nothing" };
  return new Proxy({} as NonNullable<BuilderCtx["wizard"]>, {
    get: (_t, name) => {
      if (name === "sandboxed") return () => false;
      if (name === "attached") return () => null;
      if (name === "catalogue") return () => ({ items: [], creatures: [], artifacts: [] });
      if (name === "where") return () => null;
      return () => refuse;
    },
  });
}
