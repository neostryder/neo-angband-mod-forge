/**
 * The workshop's view of the game, built from a running API 2 mod.
 *
 * The workshop was written against `BuilderCtx`, a structural subset of the old
 * plugin context in which each seam was either a value or absent. API 2 hands
 * the same things over as calls that answer with a result: the authoring
 * library comes from `manage.authoring()`, the composed records from
 * `content.records(file)`, the debug commands from `manage.wizard()`, and the
 * stored drafts from `store.prefs`. This file makes those calls once, when the
 * player opens the workshop, and returns a `BuilderCtx` with the same meaning
 * the old context had, so `seams.ts` and everything under it read it unchanged.
 *
 * A call the host refuses leaves its member absent, which is what `seams.ts`
 * already reads as "this install cannot do that", with the reason it writes for
 * each case. Nothing here invents a fallback.
 */

import type { Api2Call, JsonValue, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import type { AuthoringApi, JsonRecord } from "./authoring.js";
import type { BuilderCtx, PrefsLike, SessionModResult, WizardApi } from "./context.js";

/** The answer of a call, or undefined when the host refused it or the call threw. */
async function answer<T>(call: () => Api2Call<T>): Promise<T | undefined> {
  try {
    const result = await call();
    return result.ok ? result.value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Drafts live in one stored value that the game keeps outside every save.
 *
 * `PrefsLike` is synchronous and the store is not, so the value is read once
 * when the workshop opens and every later `get` answers from that copy. A `set`
 * updates the copy first, which is what lets the draft writer read its own write
 * back, and then writes through; a write the host refuses or fails is logged, so
 * a lost draft is at least findable.
 */
function cachedPrefs(mod: ModApi2, initial: JsonValue | null): PrefsLike {
  let current: JsonValue | null = initial;
  return {
    get: () => current,
    set(value) {
      current = value as JsonValue | null;
      void (async () => {
        try {
          const result = await mod.store.prefs.set(current);
          if (!result.ok) mod.meta.log(`draft storage refused the write: ${result.message}`);
        } catch (error) {
          mod.meta.log(`draft storage failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      })();
    },
  };
}

/** Every record file the blueprints describe, as the running game composed them. */
async function composedRecords(mod: ModApi2, files: readonly string[]): Promise<Record<string, readonly JsonRecord[]> | undefined> {
  const out: Record<string, readonly JsonRecord[]> = {};
  for (const file of files) {
    const records = await answer(() => mod.content.records(file));
    if (records) out[file] = records as readonly JsonRecord[];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Build the workshop's context from the live mod. */
export async function buildBuilderCtx(mod: ModApi2): Promise<BuilderCtx> {
  const manage = mod.manage;
  const { granted } = mod.meta;

  const authoring = manage && granted("mod:authoring") ? await answer(() => manage.authoring()) : undefined;
  const records = authoring ? await composedRecords(mod, (authoring as unknown as AuthoringApi).BLUEPRINT_FILES) : undefined;
  const wizard = manage && granted("debug:wizard") ? await answer(() => manage.wizard()) : undefined;
  const stored = await answer(() => mod.store.prefs.get());

  const loadForSession =
    manage && granted("mod:session")
      ? async (bytes: Uint8Array): Promise<SessionModResult> => {
          const result = await manage.loadForSession(bytes);
          return result.ok
            ? { ok: true, id: result.value.id, version: result.value.version, survivesReload: result.value.survivesReload }
            : { ok: false, problem: result.message };
        }
      : undefined;

  const reloadGame =
    manage && (granted("mod:session") || granted("mod:install"))
      ? async (): Promise<void> => {
          const result = await manage.reloadGame();
          if (!result.ok) throw new Error(result.message);
        }
      : undefined;

  return {
    id: mod.meta.id,
    engine: mod.meta.engine,
    flags: mod.meta.flags,
    log: (message) => mod.meta.log(message),
    prefs: cachedPrefs(mod, stored ?? null),
    /* The debug commands refuse until a character is in play, and `where()` is how
     * the host says whether one is. `state` only ever has to be present or absent
     * (seams.ts), so a marker object is the whole of it. */
    ...(wizard && wizard.where() !== null ? { state: {} } : {}),
    ...(authoring ? { authoring: authoring as unknown as AuthoringApi } : {}),
    ...(records ? { composedRecords: records } : {}),
    ...(wizard ? { wizard: wizard as unknown as WizardApi } : {}),
    ...(loadForSession ? { loadModForSession: loadForSession } : {}),
    ...(reloadGame ? { reloadGame } : {}),
  };
}
