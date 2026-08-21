/**
 * Record identity, and the collision the workshop has to catch as the author
 * types.
 *
 * Two records that come out with the same identity make that identity
 * unaddressable, and the composer reports it rather than guessing. A player who
 * names their new sword exactly what a base-game sword is called has made both of
 * them unreachable, and the only cheap moment to fix that is while they are still
 * typing.
 */

import { describe, expect, it } from "vitest";
import { STUB_AUTHORING } from "../host/authoring-stub.js";
import { STUB_RECORDS } from "../host/stub-content.js";
import { checkIdentity, draftLabel, labelOf, ownerOf, refFor, splitRef } from "./refs.js";

const api = STUB_AUTHORING;

describe("the identity a file takes", () => {
  it("is the name for a file with no rule of its own", () => {
    expect(api.recordKey("monster", { name: "grey wolf" })).toBe("grey-wolf");
  });

  it("is two fields joined for object, because object is keyed on both", () => {
    expect(api.recordKey("object", { type: "sword", name: "Dagger" })).toBe("sword--dagger");
  });

  it("is the code for a store, which has no name at all", () => {
    expect(api.recordKey("store", { store: "STORE_GENERAL" })).toBe("store-general");
  });

  it("spells out the two characters the slug rule spells out", () => {
    /* A slug that dropped these would collide "*Healing*" with "Healing", which
     * is a real pair in the base game's own data. */
    expect(api.recordKey("object", { type: "potion", name: "*Healing*" })).toBe("potion--star-healing-star");
    expect(api.recordKey("object", { type: "potion", name: "a+b" })).toBe("potion--a-plus-b");
  });

  it("answers null rather than a guess when there is no identity to take", () => {
    expect(api.recordKey("monster", {})).toBeNull();
    expect(api.recordKey("monster", { name: "" })).toBeNull();
    expect(api.recordKey("monster", { name: "!!!" })).toBeNull();
  });

  it("says where a file takes its identity from, in words", () => {
    expect(api.keyDescription("monster")).toContain("name");
    expect(api.keyDescription("object")).toContain("--");
  });
});

describe("refs", () => {
  it("are the owner and the identity, joined", () => {
    expect(refFor("my-mod", "grey-wolf")).toBe("my-mod:grey-wolf");
  });

  it("split back, and a ref with no owner is the base game's", () => {
    expect(splitRef("qol:sword--stick")).toEqual({ owner: "qol", key: "sword--stick" });
    expect(splitRef("grey-wolf")).toEqual({ owner: "core", key: "grey-wolf" });
  });

  it("attribute an unstamped record to core", () => {
    expect(ownerOf(api, { name: "grey wolf" })).toBe("core");
    expect(ownerOf(api, { name: "x", $from: { owner: "qol" } })).toBe("qol");
  });

});

describe("draftLabel", () => {
  it("names an unnamed record rather than diagnosing it", () => {
    /* "(no identity)" is the right answer to "can the game address this" and the
     * wrong answer to "what is this row in my own list of unfinished work". */
    expect(draftLabel(api, "monster", {})).toBe("(not named yet)");
    expect(draftLabel(api, "monster", { name: "" })).toBe("(not named yet)");
    expect(draftLabel(api, "monster", { name: "dire wolf" })).toBe("dire wolf");
  });
});

describe("checkIdentity", () => {
  it("reports the collision, and names what it collided with", () => {
    const check = checkIdentity(api, "monster", { name: "grey wolf" }, "my-mod", STUB_RECORDS);
    expect(check.collides).toBe(true);
    expect(check.collidesWith).toBe("grey wolf");
    expect(check.says).toContain("unaddressable");
  });

  it("is happy with a name nothing else has", () => {
    const check = checkIdentity(api, "monster", { name: "carpenter ant" }, "my-mod", STUB_RECORDS);
    expect(check.collides).toBe(false);
    expect(check.ref).toBe("my-mod:carpenter-ant");
  });

  it("says what is missing when there is no identity yet, rather than nothing", () => {
    const check = checkIdentity(api, "monster", {}, "my-mod", STUB_RECORDS);
    expect(check.key).toBeNull();
    expect(check.says).toContain("identity");
  });

  it("does not report a record colliding with itself", () => {
    const existing = STUB_RECORDS["monster"]?.[0];
    if (!existing) throw new Error("the fixture lost its monsters");
    expect(checkIdentity(api, "monster", existing, "core", STUB_RECORDS).collides).toBe(false);
  });

  it("catches the collision that only differs outside the identity fields", () => {
    /* `object` is keyed on type AND name, so two records sharing a name in
     * different types are fine and two sharing both are not. */
    const fine = checkIdentity(api, "object", { type: "wand", name: "Dagger" }, "my-mod", STUB_RECORDS);
    expect(fine.collides).toBe(false);
    const clash = checkIdentity(api, "object", { type: "sword", name: "Dagger" }, "my-mod", STUB_RECORDS);
    expect(clash.collides).toBe(true);
  });
});

describe("labelOf", () => {
  it("uses the fields the file's identity actually draws on", () => {
    /* A shop has no `name`, so a row that fell back to it would read
     * "(unnamed record)" for every shop in the game. */
    expect(labelOf(api, "store", { store: "STORE_GENERAL" })).toBe("STORE_GENERAL");
    expect(labelOf(api, "object", { type: "sword", name: "Dagger" })).toBe("sword Dagger");
    expect(labelOf(api, "monster", { name: "grey wolf" })).toBe("grey wolf");
  });

  it("still says something for a record with no identity at all", () => {
    expect(labelOf(api, "monster", {})).toBe("(no identity)");
  });
});
