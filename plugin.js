// forge - generated from plugin.ts by neo-angband-mod-build
// (@rpgm-tools/neo-angband-mod-sdk). Edit the TypeScript source, not this file.

// src/host/context.ts
var FLAG = {
  showTab: "builder.showTab",
  keepDrafts: "builder.keepDrafts",
  cheatSpawn: "builder.cheatSpawn"
};

// src/host/api2-ctx.ts
async function answer(call) {
  try {
    const result = await call();
    return result.ok ? result.value : void 0;
  } catch {
    return void 0;
  }
}
function cachedPrefs(mod, initial) {
  let current = initial;
  return {
    get: () => current,
    set(value) {
      current = value;
      void (async () => {
        try {
          const result = await mod.store.prefs.set(current);
          if (!result.ok) mod.meta.log(`draft storage refused the write: ${result.message}`);
        } catch (error) {
          mod.meta.log(`draft storage failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      })();
    }
  };
}
async function composedRecords(mod, files) {
  const out = {};
  for (const file of files) {
    const records = await answer(() => mod.content.records(file));
    if (records) out[file] = records;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
async function buildBuilderCtx(mod) {
  const manage = mod.manage;
  const { granted } = mod.meta;
  const authoring = manage && granted("mod:authoring") ? await answer(() => manage.authoring()) : void 0;
  const records = authoring ? await composedRecords(mod, authoring.BLUEPRINT_FILES) : void 0;
  const wizard = manage && granted("debug:wizard") ? await answer(() => manage.wizard()) : void 0;
  const stored = await answer(() => mod.store.prefs.get());
  const loadForSession = manage && granted("mod:session") ? async (bytes) => {
    const result = await manage.loadForSession(bytes);
    return result.ok ? { ok: true, id: result.value.id, version: result.value.version, survivesReload: result.value.survivesReload } : { ok: false, problem: result.message };
  } : void 0;
  const reloadGame = manage && (granted("mod:session") || granted("mod:install")) ? async () => {
    const result = await manage.reloadGame();
    if (!result.ok) throw new Error(result.message);
  } : void 0;
  return {
    id: mod.meta.id,
    engine: mod.meta.engine,
    flags: mod.meta.flags,
    log: (message) => mod.meta.log(message),
    prefs: cachedPrefs(mod, stored ?? null),
    /* The debug commands refuse until a character is in play, and `where()` is how
     * the host says whether one is. `state` only ever has to be present or absent
     * (seams.ts), so a marker object is the whole of it. */
    ...wizard && wizard.where() !== null ? { state: {} } : {},
    ...authoring ? { authoring } : {},
    ...records ? { composedRecords: records } : {},
    ...wizard ? { wizard } : {},
    ...loadForSession ? { loadModForSession: loadForSession } : {},
    ...reloadGame ? { reloadGame } : {}
  };
}

// src/model/manifest-doc.ts
var MANIFEST_FORMAT = "neo-angband/mod/manifest";
var API1_RANGE = ">=1.0.0 <2.0.0";
var ENGINE_BECAUSE = "Made in ModForge on this version of the game. Older versions have not been tried.";
function scriptApi(source) {
  const api1 = { range: API1_RANGE, api1: true };
  if (source === void 0) return api1;
  const value = defaultExportApi(scanScript(source));
  if (typeof value !== "string") return api1;
  const range = value.trim();
  if (range === "") return api1;
  return { range, api1: range === API1_RANGE };
}
var REGEX_AFTER_WORD = /* @__PURE__ */ new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "case",
  "do",
  "else",
  "yield",
  "await"
]);
var ESCAPES = { n: "\n", t: "	", r: "\r", b: "\b", f: "\f", v: "\v", "0": "\0" };
function scanScript(source) {
  const out = source.split("");
  const literals = /* @__PURE__ */ new Map();
  const blank = (from, to) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };
  const substitutions = [];
  const openTemplates = [];
  let braces = 0;
  let last = "";
  let lastWord = "";
  let i = 0;
  const templateText = (start, from, value) => {
    let text = value;
    let k = from;
    while (k < source.length) {
      const c = source[k];
      if (c === "\\") {
        const next = source[k + 1] ?? "";
        if (text !== null) text += ESCAPES[next] ?? next;
        k += 2;
        continue;
      }
      if (c === "`") {
        blank(from, k);
        literals.set(start, { value: text, end: k + 1 });
        last = "`";
        return k + 1;
      }
      if (c === "$" && source[k + 1] === "{") {
        blank(from, k + 2);
        literals.set(start, { value: null, end: -1 });
        openTemplates.push(start);
        substitutions.push(braces);
        last = "{";
        return k + 2;
      }
      if (text !== null) text += c;
      k++;
    }
    blank(from, source.length);
    literals.set(start, { value: null, end: source.length });
    return source.length;
  };
  while (i < source.length) {
    const c = source[i] ?? "";
    const next = source[i + 1] ?? "";
    if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const stop = end < 0 ? source.length : end;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end < 0 ? source.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      let value = "";
      let k = i + 1;
      while (k < source.length && source[k] !== c && source[k] !== "\n") {
        if (source[k] === "\\") {
          const escaped = source[k + 1] ?? "";
          value += ESCAPES[escaped] ?? escaped;
          k += 2;
          continue;
        }
        value += source[k];
        k++;
      }
      blank(i + 1, k);
      literals.set(i, { value, end: k + 1 });
      last = c;
      i = k + 1;
      continue;
    }
    if (c === "`") {
      i = templateText(i, i + 1, "");
      continue;
    }
    if (c === "}" && substitutions.length > 0 && substitutions[substitutions.length - 1] === braces) {
      substitutions.pop();
      out[i] = " ";
      const start = openTemplates.pop() ?? i;
      i = templateText(start, i + 1, null);
      continue;
    }
    if (c === "/" && (last === "" || "(,=:[!&|?{};+-*%<>~^".includes(last) || last === "a" && REGEX_AFTER_WORD.has(lastWord))) {
      let k = i + 1;
      let inClass = false;
      while (k < source.length && source[k] !== "\n") {
        const r = source[k];
        if (r === "\\") {
          k += 2;
          continue;
        }
        if (r === "[") inClass = true;
        else if (r === "]") inClass = false;
        else if (r === "/" && !inClass) break;
        k++;
      }
      if (source[k] === "/") {
        blank(i + 1, k);
        last = ")";
        i = k + 1;
        continue;
      }
    }
    if (/[A-Za-z_$0-9]/u.test(c)) {
      let k = i;
      while (k < source.length && /[A-Za-z_$0-9]/u.test(source[k] ?? "")) k++;
      lastWord = source.slice(i, k);
      last = "a";
      i = k;
      continue;
    }
    if (c === "{") braces++;
    else if (c === "}") braces--;
    if (!/\s/u.test(c)) last = c;
    i++;
  }
  return { code: out.join(""), literals };
}
function defaultExportApi({ code, literals }) {
  const opening2 = /\bexport\s+default\s*\{/u.exec(code);
  if (opening2 === null) return void 0;
  const skipSpace = (k2) => {
    while (k2 < code.length && /\s/u.test(code[k2] ?? "")) k2++;
    return k2;
  };
  const endsMember = (k2) => {
    const c = code[skipSpace(k2)];
    return c === "," || c === "}";
  };
  let k = opening2.index + opening2[0].length;
  while (k < code.length) {
    k = skipSpace(k);
    if (code[k] === "}") return void 0;
    let key;
    let afterKey = k;
    const literal = literals.get(k);
    if (literal !== void 0 && (code[k] === '"' || code[k] === "'")) {
      key = literal.value ?? void 0;
      afterKey = literal.end;
    } else {
      const name = /^[A-Za-z_$][A-Za-z0-9_$]*/u.exec(code.slice(k));
      if (name !== null) {
        key = name[0];
        afterKey = k + name[0].length;
      }
    }
    const colon = skipSpace(afterKey);
    if (key === "api" && code[colon] === ":") {
      const at = skipSpace(colon + 1);
      const value = literals.get(at);
      if (value !== void 0 && "\"'`".includes(code[at] ?? "")) {
        return value.value !== null && endsMember(value.end) ? value.value : void 0;
      }
      const number = /^\d+/u.exec(code.slice(at));
      if (number !== null && number[0] === "1" && endsMember(at + 1)) return 1;
      return void 0;
    }
    let depth = 0;
    for (; k < code.length; k++) {
      const c = code[k];
      if (c === "{" || c === "(" || c === "[") depth++;
      else if (c === "}" || c === ")" || c === "]") {
        if (depth === 0) return void 0;
        depth--;
      } else if (c === "," && depth === 0) break;
    }
    k++;
  }
  return void 0;
}
function isApi2Range(range, satisfies2) {
  const candidates = /* @__PURE__ */ new Set(["1.0.0"]);
  for (const bound of range.matchAll(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/gu)) {
    if (Number(bound[1]) !== 1) continue;
    const minor = Number(bound[2] ?? 0);
    const patch = Number(bound[3] ?? 0);
    candidates.add(`1.${minor}.${patch}`);
    candidates.add(`1.${minor}.${patch + 1}`);
    candidates.add(`1.${minor + 1}.0`);
  }
  try {
    satisfies2("0.0.0", range);
    return ![...candidates].some((version) => satisfies2(version, range));
  } catch {
    return false;
  }
}
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function manifestFields(raw) {
  if (raw["format"] !== MANIFEST_FORMAT) return { ok: true, fields: { ...raw } };
  const data = raw["data"];
  if (!isObject(data)) return { ok: false, why: `The manifest document has no "data" object.` };
  if (raw["schemaVersion"] === 1) return { ok: true, fields: { ...data } };
  if (raw["schemaVersion"] !== 2) {
    return {
      ok: false,
      why: `The manifest document says schemaVersion ${JSON.stringify(raw["schemaVersion"] ?? null)}. This workshop reads schema 1 and schema 2.`
    };
  }
  const { engine, dependencies, ...rest } = data;
  const out = { ...rest };
  if (typeof engine === "string") out["engine"] = engine;
  else if (isObject(engine)) {
    if (typeof engine["range"] === "string") out["engine"] = engine["range"];
    if (typeof engine["because"] === "string") out["engineBecause"] = engine["because"];
  }
  if (isObject(dependencies)) {
    const reasons = {};
    const ranges = (map) => {
      if (!isObject(map)) return void 0;
      const out2 = {};
      for (const [id, dep] of Object.entries(map)) {
        if (!isObject(dep)) continue;
        out2[id] = typeof dep["range"] === "string" ? dep["range"] : "*";
        if (typeof dep["because"] === "string") reasons[id] = dep["because"];
      }
      return out2;
    };
    const required = ranges(dependencies["required"]);
    const optional = ranges(dependencies["optional"]);
    if (required !== void 0) out["dependencies"] = required;
    if (optional !== void 0) out["optionalDependencies"] = optional;
    if (Object.keys(reasons).length > 0) out["dependencyReasons"] = reasons;
    const conflicts = dependencies["conflicts"];
    if (isObject(conflicts)) {
      const claims = Array.isArray(out["compat"]) ? [...out["compat"]] : [];
      for (const [id, conflict] of Object.entries(conflicts)) {
        if (!isObject(conflict)) continue;
        claims.push({ with: id, claim: "conflicts", ...conflict });
      }
      if (claims.length > 0) out["compat"] = claims;
    }
  }
  return { ok: true, fields: out };
}
var KEPT_FIELDS = [
  "description",
  "author",
  "license",
  "repository",
  "payload",
  "shape",
  "facets",
  "loadAfter",
  "loadBefore",
  "group",
  "saveSchema",
  "fields",
  "rules",
  "settings",
  "publicFlags",
  "renamedRuleFlags",
  "sections",
  "tilePacks",
  "resources",
  "restoredItemArt",
  "restoredMonsterArt",
  "restoredFlavorArt",
  "nondeterministic",
  "affectsGameplay",
  "capabilities"
];
var WORKER_PREVIEW_API = "2.0.0-worker";
var CONVERTED_ENGINE_REASON = "Carried over from a schema 1 manifest, which gave no reason.";
function runtimeOf(m) {
  if (m["api"] !== void 0 && m["runtime"] !== void 0) {
    return {
      runtime: m["runtime"],
      api: m["api"],
      ...m["runtime"] === "worker" && m["entry"] !== void 0 ? { entry: m["entry"] } : {}
    };
  }
  const facets = Array.isArray(m["facets"]) ? m["facets"] : [m["shape"] ?? null];
  const code = facets.includes("plugin") || m["shape"] === "plugin";
  const modApi = m["modApi"];
  if (modApi === 2 && m["runtime"] === "worker" && typeof m["workerEntry"] === "string") {
    return { runtime: "worker", api: WORKER_PREVIEW_API, entry: m["workerEntry"] };
  }
  if (modApi === 1 && (m["runtime"] === void 0 || m["runtime"] === "in-process")) {
    return { runtime: "in-process", api: API1_RANGE };
  }
  if (modApi === void 0 && !code) return { runtime: "data", api: "*" };
  return null;
}
function manifestDocument(manifest) {
  const m = manifest;
  const mapped = runtimeOf(m);
  if (mapped === null) {
    const id = String(m["id"]);
    throw new Error(
      m["modApi"] === void 0 ? `manifest ${id}: ships code but declares no modApi, so there is no API to convert it to; add "modApi": 1 first` : `manifest ${id}: modApi ${String(m["modApi"])}${m["runtime"] === void 0 ? "" : ` with runtime "${String(m["runtime"])}"`} has no schema 2 mapping`
    );
  }
  const data = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    api: mapped.api,
    runtime: mapped.runtime,
    ...mapped.entry === void 0 ? {} : { entry: mapped.entry }
  };
  if (m["engine"] !== void 0 && m["engineBecause"] !== void 0) {
    data["engine"] = { range: m["engine"], because: m["engineBecause"] };
  } else if (typeof m["engine"] === "string") {
    data["engine"] = { range: m["engine"], because: CONVERTED_ENGINE_REASON };
  }
  const reasons = m["dependencyReasons"] ?? {};
  const deps = (map) => {
    if (!isObject(map)) return void 0;
    const out = {};
    for (const [id, range] of Object.entries(map)) {
      out[id] = typeof reasons[id] === "string" ? { range: String(range), because: reasons[id] } : { range: String(range) };
    }
    return out;
  };
  const required = deps(m["dependencies"]);
  const optional = deps(m["optionalDependencies"]);
  const compat = Array.isArray(m["compat"]) ? m["compat"] : void 0;
  const conflicts = {};
  const keptCompat = [];
  if (compat !== void 0) {
    const wholeMod = compat.filter((c) => c["claim"] === "conflicts" && c["scope"] === void 0);
    for (const claim of compat) {
      const other = String(claim["with"]);
      const movable = claim["claim"] === "conflicts" && claim["scope"] === void 0 && wholeMod.filter((c) => c["with"] === claim["with"]).length === 1 && required?.[other] === void 0 && optional?.[other] === void 0;
      if (movable) {
        conflicts[other] = {
          ...claim["range"] === void 0 ? {} : { range: claim["range"] },
          ...claim["because"] === void 0 ? {} : { because: claim["because"] }
        };
      } else {
        keptCompat.push(claim);
      }
    }
  }
  const dependencies = {};
  if (required !== void 0) dependencies["required"] = required;
  if (optional !== void 0) dependencies["optional"] = optional;
  if (Object.keys(conflicts).length > 0) dependencies["conflicts"] = conflicts;
  if (Object.keys(dependencies).length > 0) data["dependencies"] = dependencies;
  for (const key of KEPT_FIELDS) {
    if (m[key] !== void 0) data[key] = m[key];
  }
  if (compat !== void 0 && keptCompat.length > 0) data["compat"] = keptCompat;
  const listing = {};
  if (Array.isArray(m["screenshots"])) listing["screenshots"] = m["screenshots"];
  if (typeof m["changelog"] === "string") listing["changelog"] = m["changelog"];
  if (m["listing"] !== void 0) data["listing"] = { ...isObject(m["listing"]) ? m["listing"] : {}, ...listing };
  else if (Object.keys(listing).length > 0) data["listing"] = listing;
  if (m["text"] !== void 0) data["text"] = m["text"];
  if (m["budget"] !== void 0) data["budget"] = m["budget"];
  return { format: MANIFEST_FORMAT, schemaVersion: 2, data };
}

// src/host/stub-content.ts
var MONSTERS = [
  {
    name: "cave rat",
    base: "rodent",
    color: "u",
    speed: 110,
    "hit-points": 4,
    "armor-class": 8,
    sleepiness: 20,
    depth: 1,
    rarity: 1,
    experience: 1,
    hearing: 8,
    blow: [{ method: "BITE", effect: "HURT", damage: "1d3" }],
    desc: ["A rodent of unusual persistence."]
  },
  {
    name: "giant white mouse",
    base: "rodent",
    color: "w",
    speed: 110,
    "hit-points": 3,
    "armor-class": 6,
    sleepiness: 30,
    depth: 2,
    rarity: 1,
    experience: 1,
    hearing: 8,
    flags: ["MULTIPLY", "RAND_50"],
    blow: [{ method: "BITE", effect: "HURT", damage: "1d2" }],
    desc: ["It breeds explosively."]
  },
  {
    name: "black rat",
    base: "rodent",
    color: "s",
    speed: 120,
    "hit-points": 6,
    "armor-class": 10,
    sleepiness: 10,
    depth: 4,
    rarity: 2,
    experience: 3,
    hearing: 10,
    blow: [{ method: "BITE", effect: "POISON", damage: "1d4" }],
    desc: ["Its bite carries something."]
  },
  {
    name: "wild dog",
    base: "canine",
    color: "U",
    speed: 120,
    "hit-points": 12,
    "armor-class": 14,
    sleepiness: 20,
    depth: 2,
    rarity: 1,
    experience: 5,
    hearing: 20,
    flags: ["GROUP_AI"],
    blow: [{ method: "BITE", effect: "HURT", damage: "1d5" }],
    desc: ["It hunts in a pack and will not hunt alone."]
  },
  {
    name: "jackal of the waste",
    base: "canine",
    color: "y",
    speed: 120,
    "hit-points": 9,
    "armor-class": 12,
    sleepiness: 30,
    depth: 3,
    rarity: 1,
    experience: 4,
    hearing: 20,
    flags: ["GROUP_AI"],
    blow: [{ method: "BITE", effect: "HURT", damage: "1d4" }],
    desc: ["Thin, quick, and never by itself."]
  },
  {
    name: "grey wolf",
    base: "canine",
    color: "s",
    speed: 120,
    "hit-points": 30,
    "armor-class": 30,
    sleepiness: 20,
    depth: 10,
    rarity: 1,
    experience: 30,
    hearing: 20,
    flags: ["GROUP_AI"],
    blow: [
      { method: "BITE", effect: "HURT", damage: "1d6" },
      { method: "CLAW", effect: "HURT", damage: "1d4" }
    ],
    desc: ["Winter on four legs."]
  },
  {
    name: "soldier ant",
    base: "ant",
    color: "W",
    speed: 110,
    "hit-points": 6,
    "armor-class": 16,
    sleepiness: 80,
    depth: 2,
    rarity: 1,
    experience: 3,
    hearing: 10,
    blow: [{ method: "BITE", effect: "HURT", damage: "1d4" }],
    desc: ["A large ant with a hard shell."]
  },
  {
    name: "giant black ant",
    base: "ant",
    color: "D",
    speed: 110,
    "hit-points": 11,
    "armor-class": 20,
    sleepiness: 80,
    depth: 4,
    rarity: 1,
    experience: 8,
    hearing: 10,
    blow: [{ method: "BITE", effect: "HURT", damage: "1d6" }],
    desc: ["Bigger, and no friendlier."]
  },
  {
    name: "hill orc",
    base: "orc",
    color: "u",
    speed: 110,
    "hit-points": 26,
    "armor-class": 32,
    sleepiness: 40,
    depth: 8,
    rarity: 1,
    experience: 20,
    hearing: 20,
    flags: ["GROUP_AI", "OPEN_DOOR", "BASH_DOOR"],
    blow: [{ method: "HIT", effect: "HURT", damage: "1d10" }],
    desc: ["A broad orc from the high country."]
  },
  {
    name: "cave orc",
    base: "orc",
    color: "U",
    speed: 110,
    "hit-points": 22,
    "armor-class": 28,
    sleepiness: 30,
    depth: 7,
    rarity: 1,
    experience: 18,
    hearing: 20,
    flags: ["GROUP_AI", "OPEN_DOOR", "BASH_DOOR"],
    blow: [{ method: "HIT", effect: "HURT", damage: "1d8" }],
    desc: ["It has never once seen the sun."]
  },
  {
    name: "orc captain",
    base: "orc",
    color: "r",
    speed: 110,
    "hit-points": 60,
    "armor-class": 44,
    sleepiness: 20,
    depth: 12,
    rarity: 2,
    experience: 60,
    hearing: 25,
    flags: ["GROUP_AI", "OPEN_DOOR", "BASH_DOOR", "EVIL"],
    blow: [
      { method: "HIT", effect: "HURT", damage: "2d8" },
      { method: "HIT", effect: "HURT", damage: "2d8" }
    ],
    desc: ["It shouts and the others move."]
  },
  {
    name: "Bolg, Son of Azog",
    base: "orc",
    color: "R",
    speed: 120,
    "hit-points": 200,
    "armor-class": 60,
    sleepiness: 10,
    depth: 20,
    rarity: 3,
    experience: 400,
    hearing: 30,
    flags: ["UNIQUE", "MALE", "EVIL", "GROUP_AI"],
    blow: [
      { method: "HIT", effect: "HURT", damage: "3d8" },
      { method: "HIT", effect: "HURT", damage: "3d8" }
    ],
    desc: ["He has come a long way to find you."]
  }
];
var OBJECTS = [
  {
    name: "Dagger",
    type: "sword",
    graphics: { glyph: "|", color: "W" },
    level: 2,
    weight: 12,
    cost: 10,
    alloc: { common: 20, minmax: "1 to 40" },
    attack: { hd: "1d4", "to-h": 0, "to-d": 0 },
    desc: ["A short blade, quick in the hand."]
  },
  {
    name: "Main Gauche",
    type: "sword",
    graphics: { glyph: "|", color: "W" },
    level: 5,
    weight: 30,
    cost: 25,
    alloc: { common: 20, minmax: "3 to 60" },
    attack: { hd: "1d5", "to-h": 0, "to-d": 0 },
    desc: ["A parrying blade for the off hand."]
  },
  {
    name: "Long Sword",
    type: "sword",
    graphics: { glyph: "|", color: "W" },
    level: 20,
    weight: 130,
    cost: 300,
    alloc: { common: 20, minmax: "10 to 100" },
    attack: { hd: "2d5", "to-h": 0, "to-d": 0 },
    desc: ["The plain answer to most questions."]
  },
  {
    name: "Soft Leather Armour",
    type: "soft armor",
    graphics: { glyph: "(", color: "U" },
    level: 4,
    weight: 80,
    cost: 24,
    alloc: { common: 20, minmax: "1 to 40" },
    armor: { ac: 8, "to-a": 0 },
    desc: ["Cured hide, sewn into a coat."]
  },
  {
    name: "Studded Leather Armour",
    type: "soft armor",
    graphics: { glyph: "(", color: "U" },
    level: 10,
    weight: 200,
    cost: 90,
    alloc: { common: 20, minmax: "6 to 70" },
    armor: { ac: 12, "to-a": 0 },
    desc: ["Leather, with metal where it counts."]
  },
  {
    name: "Leather Shield",
    type: "shield",
    graphics: { glyph: ")", color: "U" },
    level: 3,
    weight: 50,
    cost: 24,
    alloc: { common: 20, minmax: "1 to 40" },
    armor: { ac: 8, "to-a": 0 },
    desc: ["A wooden round faced with hide."]
  },
  {
    name: "Potion of Cure Light Wounds",
    type: "potion",
    graphics: { glyph: "!", color: "d" },
    level: 3,
    weight: 4,
    cost: 20,
    alloc: { common: 20, minmax: "1 to 50" },
    desc: ["It closes the small ones."]
  },
  {
    /* Deliberately shares a NAME with the potion above and differs only in
     * `type`, because `object` is keyed on both. A player who names a new record
     * "Cure Light Wounds" of type "potion" collides with the record above and the
     * ref becomes unaddressable; the workshop has to catch that as they type. */
    name: "Cure Light Wounds",
    type: "magic book",
    graphics: { glyph: "?", color: "w" },
    level: 3,
    weight: 30,
    cost: 25,
    alloc: { common: 20, minmax: "1 to 50" },
    desc: ["Two pages, one of them useful."]
  }
];
var STORES = [
  {
    store: "STORE_GENERAL",
    slots: 24,
    turnover: 2,
    normal: [
      { tval: "food", sval: "Ration of Food" },
      { tval: "light", sval: "Wooden Torch" },
      { tval: "flask", sval: "Flask of oil" }
    ],
    always: [{ tval: "food", sval: "Ration of Food" }],
    owner: [{ name: "Bilbo the Friendly", purse: 5e3 }]
  },
  {
    store: "STORE_ARMOR",
    slots: 24,
    turnover: 9,
    normal: [
      { tval: "soft armor", sval: "Soft Leather Armour" },
      { tval: "shield", sval: "Leather Shield" }
    ],
    owner: [{ name: "Wolfram the Bold", purse: 1e4 }]
  }
];
var MONSTER_BASES = [
  { name: "rodent", glyph: "r", pain: 1, desc: "rodent" },
  { name: "canine", glyph: "C", pain: 1, desc: "dog" },
  { name: "ant", glyph: "a", pain: 1, desc: "ant" },
  { name: "orc", glyph: "o", pain: 1, desc: "orc" }
];
var STUB_RECORDS = Object.freeze({
  monster: MONSTERS,
  monster_base: MONSTER_BASES,
  object: OBJECTS,
  store: STORES
});

// src/host/authoring-stub.ts
var PEER_FIELD = {
  object: "type",
  ego_item: "type",
  artifact: "base-object.tval",
  monster: "base",
  monster_base: "glyph",
  terrain: "code"
};
var DEPTH_FIELD = {
  object: "level",
  monster: "depth",
  artifact: "level"
};
var PEER_WINDOW = 7;
var COMMON_SHARE = 0.5;
var MODEL_EXCLUDE = /* @__PURE__ */ new Set([
  "name",
  "desc",
  "msg",
  "code",
  "flags",
  "flags-off",
  "values",
  "slay",
  "brand",
  "curse",
  "effect",
  "effect-yx",
  "act",
  "spells",
  "blow",
  "friends",
  "friends-base",
  "drop",
  "drop-base",
  "mimic",
  "shape",
  "expr",
  "dice",
  "time",
  "charges",
  "pval"
]);
var KEY_SPECS = {
  brand: { kind: "fields", paths: ["code"] },
  slay: { kind: "fields", paths: ["code"] },
  chest_trap: { kind: "fields", paths: ["code"] },
  projection: { kind: "fields", paths: ["code"] },
  object_base: { kind: "fields", paths: ["name.tval"] },
  trap: { kind: "fields", paths: ["name.name", "name.desc"] },
  store: { kind: "fields", paths: ["store"] },
  pain: { kind: "fields", paths: ["type"] },
  ui_knowledge: { kind: "fields", paths: ["monster-category"] },
  names: { kind: "fields", paths: ["section"] },
  body: { kind: "fields", paths: ["body"] },
  world: { kind: "fields", paths: ["level.name"] },
  flavor: { kind: "fields", paths: ["kind.tval"] },
  hints: { kind: "fields", paths: ["H"] },
  constants: { kind: "singleton" },
  visuals: { kind: "singleton" },
  object: { kind: "fields", paths: ["type", "name"] },
  vault: { kind: "fields", paths: ["type", "name"] },
  ego_item: { kind: "fields", paths: ["name"], discriminator: ["type", "item.tval"] }
};
var PACK_GROUP_NAMES = [
  "framework",
  "overhaul",
  "content",
  "gameplay",
  "tweaks",
  "interface",
  "cosmetic",
  "late"
];
var ID_RE = /^[a-z][a-z0-9-]*$/;
var VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function keySlug(value) {
  return slugify(value.replace(/\*/g, " star ").replace(/\+/g, " plus "));
}
function atPath(record, path) {
  let at = record;
  for (const seg of path.split(".")) {
    if (Array.isArray(at)) {
      if (!/^(?:0|[1-9][0-9]*)$/.test(seg)) return void 0;
      at = at[Number(seg)];
      continue;
    }
    if (!isRecord(at)) return void 0;
    at = at[seg];
  }
  return at;
}
function shapeOf(value) {
  if (value === null) return "any";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}
function median(sorted) {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
  return Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2);
}
function editDistance(a, b) {
  const rows = [];
  for (let i = 0; i <= a.length; i++) rows.push(new Array(b.length + 1).fill(0));
  const first = rows[0];
  if (first) for (let j = 0; j <= b.length; j++) first[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row2 = rows[i];
    const prev = rows[i - 1];
    if (!row2 || !prev) continue;
    row2[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row2[j] = Math.min((row2[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
  }
  return rows[a.length]?.[b.length] ?? Math.max(a.length, b.length);
}
function measureField(values, total) {
  const types = /* @__PURE__ */ new Set();
  const numbers = [];
  const vocabulary = /* @__PURE__ */ new Set();
  const childValues = /* @__PURE__ */ new Map();
  const itemValues = [];
  for (const value of values) {
    types.add(shapeOf(value));
    if (typeof value === "number") numbers.push(value);
    if (typeof value === "string" || typeof value === "boolean") vocabulary.add(value);
    if (Array.isArray(value)) for (const item of value) itemValues.push(item);
    else if (isRecord(value)) {
      for (const [k, v] of Object.entries(value)) {
        const bucket = childValues.get(k);
        if (bucket) bucket.push(v);
        else childValues.set(k, [v]);
      }
    }
  }
  const shape = { count: values.length, types: [...types].sort() };
  if (numbers.length > 0) {
    const sorted = [...numbers].sort((a, b) => a - b);
    shape.range = {
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      median: median(sorted)
    };
  }
  if (childValues.size > 0) {
    const fields = {};
    for (const [k, v] of childValues) fields[k] = measureField(v, values.length);
    shape.fields = fields;
  }
  if (itemValues.length > 0) shape.items = measureField(itemValues, itemValues.length);
  if (vocabulary.size > 0 && vocabulary.size <= Math.max(2, Math.floor(total / 2))) {
    shape.values = [...vocabulary].sort((a, b) => String(a).localeCompare(String(b)));
  }
  return shape;
}
function measureBlueprint(file, records) {
  const columns = /* @__PURE__ */ new Map();
  for (const record of records) {
    for (const [k, v] of Object.entries(record)) {
      const bucket = columns.get(k);
      if (bucket) bucket.push(v);
      else columns.set(k, [v]);
    }
  }
  const fields = {};
  for (const [name, values] of columns) fields[name] = measureField(values, records.length);
  return { file, records: records.length, fields };
}
var StubPatchError = class extends Error {
};
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
var UNSAFE_PATH_SEGMENTS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function setAtPath(record, path, mutate) {
  const segments2 = path.split(".");
  const last = segments2.pop();
  if (last === void 0) throw new StubPatchError("an empty path addresses nothing");
  for (const seg of [...segments2, last]) {
    if (UNSAFE_PATH_SEGMENTS.has(seg)) {
      throw new StubPatchError(`"${seg}" is not an allowed path segment in "${path}"`);
    }
  }
  let at = record;
  for (const seg of segments2) {
    const isIndex2 = /^(?:0|[1-9][0-9]*)$/.test(seg);
    if (Array.isArray(at)) {
      if (!isIndex2) throw new StubPatchError(`"${seg}" is not an index, and "${path}" walks an array`);
      const next2 = at[Number(seg)];
      if (next2 === void 0) throw new StubPatchError(`"${path}" has no element at ${seg}`);
      if (!isRecord(next2) && !Array.isArray(next2)) {
        throw new StubPatchError(`"${path}" walks through a value that is not a container`);
      }
      at = next2;
      continue;
    }
    let next = Object.hasOwn(at, seg) ? at[seg] : void 0;
    if (next === void 0) {
      next = isIndex2 ? [] : {};
      at[seg] = next;
    }
    if (!isRecord(next) && !Array.isArray(next)) {
      throw new StubPatchError(`"${path}" walks through a value that is not a container`);
    }
    at = next;
  }
  if (Array.isArray(at)) {
    if (!/^(?:0|[1-9][0-9]*)$/.test(last)) throw new StubPatchError(`"${last}" is not an index`);
    at[Number(last)] = mutate(at[Number(last)]);
    return;
  }
  at[last] = mutate(Object.hasOwn(at, last) ? at[last] : void 0);
}
function applyOp(record, op) {
  switch (op.op) {
    case "set":
      setAtPath(record, op.path, () => clone(op.value));
      return;
    case "merge":
      setAtPath(record, op.path, (current) => {
        if (Array.isArray(current)) throw new StubPatchError(`merge cannot be applied to the array at "${op.path}"`);
        const base = isRecord(current) ? current : {};
        return { ...base, ...clone(op.value) };
      });
      return;
    case "add":
    case "mul":
      setAtPath(record, op.path, (current) => {
        if (current !== void 0 && typeof current !== "number") {
          throw new StubPatchError(`"${op.path}" is not a number, so ${op.op} cannot be applied to it`);
        }
        const base = typeof current === "number" ? current : 0;
        return op.op === "add" ? base + op.value : base * op.value;
      });
      return;
    case "addFlag":
    case "removeFlag":
      setAtPath(record, op.path, (current) => {
        if (current !== void 0 && !isStringArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list of flags`);
        }
        const base = current === void 0 ? [] : [...current];
        if (op.op === "addFlag") return base.includes(op.flag) ? base : [...base, op.flag];
        return base.filter((f) => f !== op.flag);
      });
      return;
    case "append":
      setAtPath(record, op.path, (current) => {
        if (current !== void 0 && !Array.isArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list, so append cannot be applied to it`);
        }
        const base = current === void 0 ? [] : [...current];
        return [...base, ...clone(op.values)];
      });
      return;
    case "removeValue":
      setAtPath(record, op.path, (current) => {
        if (current !== void 0 && !Array.isArray(current)) {
          throw new StubPatchError(`"${op.path}" is not a list, so removeValue cannot be applied to it`);
        }
        const base = current === void 0 ? [] : [...current];
        const gone = JSON.stringify(op.value);
        return base.filter((entry) => JSON.stringify(entry) !== gone);
      });
      return;
  }
}
function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
function isCommutative(op) {
  return op === "addFlag" || op === "removeFlag" || op === "append";
}
function applyFieldPatch(record, ops) {
  const out = clone(record);
  for (const op of ops) applyOp(out, op);
  return out;
}
function touchedFields(ops) {
  const out = /* @__PURE__ */ new Set();
  for (const op of ops) out.add(op.path);
  return out;
}
function composeFieldPatches(base, patches) {
  let value = clone(base);
  const writers = /* @__PURE__ */ new Map();
  for (const { owner, ops } of patches) {
    for (const op of ops) {
      if (isCommutative(op.op)) continue;
      const seen = writers.get(op.path);
      if (seen) {
        if (!seen.includes(owner)) seen.push(owner);
      } else writers.set(op.path, [owner]);
    }
    value = applyFieldPatch(value, ops);
  }
  const conflicts = [...writers.entries()].filter(([, owners]) => owners.length > 1).map(([path, owners]) => ({ path, owners }));
  return { value, conflicts };
}
function keySpecFor(file) {
  return KEY_SPECS[file] ?? { kind: "fields", paths: ["name"] };
}
function keyDescription(file) {
  const spec = keySpecFor(file);
  if (spec.kind === "singleton") return `the whole file (${file} is one record)`;
  const quoted = spec.paths.map((p) => `"${p}"`).join(" and ");
  return spec.paths.length === 1 ? `its ${quoted}` : `its ${quoted}, joined by "--"`;
}
function recordKey(file, record, spec = keySpecFor(file)) {
  if (spec.kind === "singleton") return slugify(file);
  const parts = [];
  for (const path of spec.paths) {
    const value = atPath(record, path);
    if (typeof value !== "string" && typeof value !== "number") return null;
    const slug = keySlug(String(value));
    if (slug === "") return null;
    parts.push(slug);
  }
  return parts.join("--");
}
function recordRefKeys(file, record, spec = keySpecFor(file)) {
  const base = recordKey(file, record, spec);
  if (base === null) return [];
  if (spec.kind === "singleton" || spec.discriminator === void 0) return [base];
  const parts = [];
  for (const path of spec.discriminator) {
    const value = atPath(record, path);
    if (typeof value === "string" || typeof value === "number") parts.push(keySlug(String(value)));
  }
  if (parts.length === 0) return [base];
  return [base, `${base}#${parts.join("--")}`];
}
var StubProject = class {
  id;
  base;
  fields = [];
  files = /* @__PURE__ */ new Map();
  activeSection;
  constructor(manifest) {
    const m = validateManifest(manifest);
    this.base = m;
    this.id = m.id;
    for (const decl of m.fields ?? []) this.fields.push(decl);
  }
  file(name) {
    const found = this.files.get(name);
    if (found) return found;
    const made = {};
    this.files.set(name, made);
    return made;
  }
  section(id) {
    this.activeSection = id;
    return this;
  }
  declareField(field) {
    if (!this.fields.some((f) => f.name === field.name)) this.fields.push(field);
    return this;
  }
  qualify(name) {
    return `${this.id}:${name}`;
  }
  add(file, ...records) {
    const target = this.file(file);
    if (this.activeSection) {
      target.sections ??= {};
      const section = target.sections[this.activeSection] ?? {};
      section.records = [...section.records ?? [], ...records.map((r) => clone(r))];
      target.sections[this.activeSection] = section;
    } else target.records = [...target.records ?? [], ...records.map((r) => clone(r))];
    return this;
  }
  patchFields(file, ref, ops) {
    const target = this.file(file);
    if (this.activeSection) {
      target.sections ??= {};
      const section = target.sections[this.activeSection] ?? {};
      section.fieldPatches = { ...section.fieldPatches ?? {}, [ref]: [...section.fieldPatches?.[ref] ?? [], ...ops.map((op) => clone(op))] };
      target.sections[this.activeSection] = section;
      return this;
    }
    const table = target.fieldPatches ?? {};
    table[ref] = [...table[ref] ?? [], ...ops.map((op) => clone(op))];
    target.fieldPatches = table;
    return this;
  }
  replace(file, ref, record) {
    const target = this.file(file);
    if (this.activeSection) {
      target.sections ??= {};
      const section = target.sections[this.activeSection] ?? {};
      section.replaces = { ...section.replaces ?? {}, [ref]: clone(record) };
      target.sections[this.activeSection] = section;
      return this;
    }
    const table = target.replaces ?? {};
    table[ref] = clone(record);
    target.replaces = table;
    return this;
  }
  remove(file, ref) {
    const target = this.file(file);
    if (this.activeSection) {
      target.sections ??= {};
      const section = target.sections[this.activeSection] ?? {};
      section.removes = [...section.removes ?? [], ref];
      target.sections[this.activeSection] = section;
      return this;
    }
    const list = target.removes ?? [];
    if (!list.includes(ref)) list.push(ref);
    target.removes = list;
    return this;
  }
  manifest() {
    const out = { ...this.base };
    if (this.fields.length > 0) out.fields = [...this.fields];
    else delete out.fields;
    return out;
  }
  toPack() {
    const files = {};
    for (const [name, contribution] of this.files) files[name] = clone(contribution);
    return { manifest: this.manifest(), files };
  }
  emit() {
    const out = [
      { path: "manifest.json", contents: `${JSON.stringify(manifestDocument(this.manifest()), null, 2)}
` }
    ];
    for (const name of [...this.files.keys()].sort()) {
      const contribution = this.files.get(name);
      if (!contribution) continue;
      out.push({ path: `${name}.json`, contents: `${JSON.stringify(contribution, null, 2)}
` });
    }
    return out;
  }
  build(core) {
    const manifest = this.manifest();
    const files = this.emit();
    const findings = [];
    const problems = [];
    const composed = {};
    for (const [file, contribution] of Object.entries(core?.files ?? {})) {
      composed[file] = [...(contribution.records ?? []).map((r) => clone(r))];
    }
    const mine = {};
    for (const [file, contribution] of this.files) {
      const into = composed[file] ?? [];
      const added = [];
      for (const record of contribution.records ?? []) {
        const copy = clone(record);
        into.push(copy);
        added.push(copy);
      }
      for (const [ref, ops] of Object.entries(contribution.fieldPatches ?? {})) {
        const key = ref.includes(":") ? ref.split(":")[1] ?? ref : ref;
        const index = into.findIndex((r) => recordKey(file, r) === key);
        if (index < 0) {
          problems.push(`${manifest.id}: fieldPatches names "${ref}" in ${file}, and no loaded pack defines it.`);
          continue;
        }
        const before = into[index];
        if (!before) continue;
        try {
          const after = applyFieldPatch(before, ops);
          into[index] = after;
          added.push(after);
        } catch (e) {
          problems.push(`${manifest.id}: a patch to "${ref}" in ${file} could not be applied: ${String(e)}`);
        }
      }
      for (const ref of contribution.removes ?? []) {
        const key = ref.includes(":") ? ref.split(":")[1] ?? ref : ref;
        const index = into.findIndex((r) => recordKey(file, r) === key);
        if (index < 0) problems.push(`${manifest.id}: removes names "${ref}" in ${file}, and no loaded pack defines it.`);
        else into.splice(index, 1);
      }
      composed[file] = into;
      mine[file] = added;
    }
    findings.push(...checkRecords(mine, composed));
    if (core === void 0) {
      findings.unshift({
        level: "hint",
        file: "manifest",
        record: manifest.id,
        message: "This was checked without the game's own records, so nothing here could look for a reference that does not resolve.",
        rule: "project/no-core"
      });
    }
    return {
      manifest,
      files,
      findings,
      problems,
      composed,
      ok: !findings.some((f) => f.level === "error")
    };
  }
};
function validateManifest(value) {
  if (!isRecord(value)) throw new Error("a manifest has to be an object");
  const id = value["id"];
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new Error('"id" has to be lower case, start with a letter, and use only letters, digits and hyphens');
  }
  const name = value["name"];
  if (typeof name !== "string" || name.trim() === "") throw new Error('"name" cannot be empty');
  const version = value["version"];
  if (typeof version !== "string" || !VERSION_RE.test(version)) {
    throw new Error('"version" has to look like 1.0.0');
  }
  const shape = value["shape"];
  if (shape !== "content" && shape !== "tiles" && shape !== "plugin") {
    throw new Error('"shape" has to be one of content, tiles or plugin');
  }
  const group = value["group"];
  if (group !== void 0 && (typeof group !== "string" || !PACK_GROUP_NAMES.includes(group))) {
    throw new Error(`"group" has to be one of ${PACK_GROUP_NAMES.join(", ")}`);
  }
  return value;
}
var BLUEPRINTS = {};
for (const [file, records] of Object.entries(STUB_RECORDS)) {
  BLUEPRINTS[file] = measureBlueprint(file, records);
}
var DESCRIPTIONS = {
  monster: "Creatures. One record is one kind of thing that can be met, from a rat to a Balrog.",
  monster_base: "The families creatures belong to. A creature names one, and inherits its letter and its feel.",
  object: "Items. Weapons, armour, potions, scrolls, wands: everything that can be picked up.",
  store: "Shops. What each one stocks, who runs it, and how much they carry."
};
function blueprintFor(file) {
  return BLUEPRINTS[file];
}
function requiredFields(file) {
  const bp = blueprintFor(file);
  if (!bp) return [];
  return Object.entries(bp.fields).filter(([, shape]) => shape.count === bp.records).map(([name]) => name).sort();
}
function fieldUsage(file) {
  const bp = blueprintFor(file);
  if (!bp || bp.records === 0) return [];
  return Object.entries(bp.fields).map(([name, shape]) => ({ name, shape, share: shape.count / bp.records })).sort((a, b) => b.share - a.share || a.name.localeCompare(b.name));
}
function placeholder(shape) {
  if (shape.range) return shape.range.median;
  const first = shape.types[0] ?? "any";
  switch (first) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const out = {};
      for (const [k, child] of Object.entries(shape.fields ?? {})) out[k] = placeholder(child);
      return out;
    }
    default:
      return shape.values && shape.values.length > 0 ? String(shape.values[0]) : "";
  }
}
function templateRecord(file, scope = "common") {
  const bp = blueprintFor(file);
  if (!bp) return {};
  const out = {};
  for (const [name, shape] of Object.entries(bp.fields)) {
    const share = bp.records === 0 ? 0 : shape.count / bp.records;
    const keep = scope === "all" || (scope === "common" ? share >= COMMON_SHARE : share >= 1);
    if (keep) out[name] = placeholder(shape);
  }
  return out;
}
function peersFor(file, draft, records = STUB_RECORDS) {
  const all = records[file] ?? [];
  const peerField = PEER_FIELD[file];
  const depthField = DEPTH_FIELD[file];
  const wanted = peerField === void 0 ? void 0 : atPath(draft, peerField);
  const depth = depthField === void 0 ? void 0 : draft[depthField];
  let peers = [...all];
  const clauses = [];
  if (peerField !== void 0 && (typeof wanted === "string" || typeof wanted === "number")) {
    peers = peers.filter((r) => atPath(r, peerField) === wanted);
    clauses.push(`${peerField} is ${JSON.stringify(wanted)}`);
  }
  if (depthField !== void 0 && typeof depth === "number") {
    peers = peers.filter((r) => {
      const theirs = r[depthField];
      return typeof theirs === "number" && Math.abs(theirs - depth) <= PEER_WINDOW;
    });
    peers.sort((a, b) => {
      const da = typeof a[depthField] === "number" ? Math.abs(a[depthField] - depth) : 999;
      const db = typeof b[depthField] === "number" ? Math.abs(b[depthField] - depth) : 999;
      return da - db;
    });
    clauses.push(`${depthField} is within ${PEER_WINDOW} of ${depth}`);
  }
  const because = clauses.length === 0 ? `every record in ${file}` : `${peers.length} record${peers.length === 1 ? "" : "s"} in ${file} where ${clauses.join(" and ")}`;
  return { peers, because };
}
function suggestFields(file, draft, records = STUB_RECORDS) {
  const bp = blueprintFor(file);
  if (!bp) return [];
  const { peers, because } = peersFor(file, draft, records);
  const pool = peers.length > 0 ? peers : records[file] ?? [];
  const out = [];
  for (const [name, shape] of Object.entries(bp.fields)) {
    if (name in draft) continue;
    if (!shape.range) continue;
    const seen = pool.map((r) => r[name]).filter((v) => typeof v === "number").sort((a, b) => a - b);
    if (seen.length === 0) continue;
    const value = median(seen);
    const same = seen.every((v) => v === value);
    out.push({
      field: name,
      value,
      because: same ? `every one of ${because} has ${name} ${value}` : `${value} is the middle of ${name} across ${because}, which run from ${seen[0]} to ${seen[seen.length - 1]}`
    });
  }
  return out.sort((a, b) => a.field.localeCompare(b.field));
}
function draftRecord(file, values = {}, records = STUB_RECORDS, scope = "common") {
  const record = templateRecord(file, scope);
  const { peers } = peersFor(file, values, records);
  const model = peers[0];
  let modelledOn;
  if (model) {
    const label = model["name"];
    if (typeof label === "string") modelledOn = label;
    for (const [k, v] of Object.entries(model)) {
      if (MODEL_EXCLUDE.has(k)) continue;
      record[k] = clone(v);
    }
  }
  record["name"] = "";
  for (const suggestion of suggestFields(file, values, records)) {
    if (!(suggestion.field in values)) record[suggestion.field] = suggestion.value;
  }
  Object.assign(record, clone(values));
  const drafted = {
    record,
    suggestions: suggestFields(file, record, records),
    findings: checkRecords({ [file]: [record] }, records)
  };
  if (modelledOn !== void 0) drafted.modelledOn = modelledOn;
  return drafted;
}
var LEVEL_ORDER = { error: 0, warn: 1, hint: 2 };
function checkRecords(subject, all, options = {}) {
  const out = [
    {
      level: "hint",
      file: "-",
      record: "-",
      message: "These checks are the workshop's own small set, not the game's. The game's checker is not reachable on this engine, so a clean report here is not a promise that the game will accept the mod.",
      rule: "stub/not-the-real-checker"
    }
  ];
  for (const [file, records] of Object.entries(subject)) {
    const bp = blueprintFor(file);
    const known = bp ? Object.keys(bp.fields) : [];
    const expected = requiredFields(file);
    const seenKeys = /* @__PURE__ */ new Map();
    for (const record of all[file] ?? []) {
      const key = recordKey(file, record);
      if (key !== null) seenKeys.set(key, (seenKeys.get(key) ?? 0) + 1);
    }
    for (const record of records) {
      const label = typeof record["name"] === "string" && record["name"] !== "" ? record["name"] : "(unnamed record)";
      for (const field of expected) {
        if (!(field in record)) {
          out.push({
            level: "warn",
            file,
            record: label,
            field,
            message: `${label} in ${file} has no "${field}", and every record in ${file} has one.`,
            rule: "field/required"
          });
        }
      }
      if (known.length > 0) {
        for (const field of Object.keys(record)) {
          if (known.includes(field)) continue;
          if (field.includes(":")) continue;
          const nearest = known.map((candidate) => ({ candidate, distance: editDistance(field, candidate) })).sort((a, b) => a.distance - b.distance)[0];
          const hint = nearest && nearest.distance <= Math.max(1, Math.floor(field.length / 3)) ? ` Did you mean "${nearest.candidate}"?` : "";
          out.push({
            level: "warn",
            file,
            record: label,
            field,
            message: `${label} in ${file} carries "${field}", which nothing in ${file} uses.${hint}`,
            rule: "field/unknown"
          });
        }
      }
      const key = recordKey(file, record);
      if (key === null) {
        out.push({
          level: "error",
          file,
          record: label,
          message: `${label} in ${file} has no identity: ${file} takes it from ${keyDescription(file)}.`,
          rule: "record/unaddressable"
        });
      } else if ((seenKeys.get(key) ?? 0) > 1) {
        out.push({
          level: "error",
          file,
          record: label,
          message: `Two records in ${file} both come out as "${key}", so neither can be addressed. ${file} takes an identity from ${keyDescription(file)}.`,
          rule: "record/ambiguous"
        });
      }
      if (file === "monster" && typeof record["depth"] !== "number") {
        out.push({
          level: "warn",
          file,
          record: label,
          field: "depth",
          message: `${label} has no depth, so nothing will ever generate it. It will exist and never be met.`,
          rule: "monster/no-depth"
        });
      }
      if (file === "monster" && typeof record["base"] === "string") {
        const bases = all["monster_base"] ?? [];
        if (!bases.some((b) => b["name"] === record["base"])) {
          out.push({
            level: "error",
            file,
            record: label,
            field: "base",
            message: `base names "${String(record["base"])}", and no loaded pack defines it in monster_base.`,
            rule: "reference/dangling"
          });
        }
      }
    }
  }
  const floor = LEVEL_ORDER[options.minLevel ?? "hint"] ?? 2;
  return out.filter((f) => (LEVEL_ORDER[f.level] ?? 2) <= floor).sort((a, b) => (LEVEL_ORDER[a.level] ?? 2) - (LEVEL_ORDER[b.level] ?? 2));
}
var PROVENANCE_KEY = "$from";
function provenanceOf(record) {
  if (!isRecord(record)) return void 0;
  const from = record[PROVENANCE_KEY];
  if (!isRecord(from) || typeof from["owner"] !== "string" || from["owner"] === "") return void 0;
  const modified = from["modifiedBy"];
  const mods = Array.isArray(modified) ? modified.filter((m) => typeof m === "string") : [];
  const was = from["was"];
  return {
    owner: from["owner"],
    ...mods.length === 0 ? {} : { modifiedBy: mods },
    ...isRecord(was) ? { was } : {}
  };
}
var PARTIAL_VERSION_RE = /^(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-([0-9A-Za-z.-]+))?$/;
function partialVersion(s) {
  const match = PARTIAL_VERSION_RE.exec(s);
  if (!match) throw new Error(`malformed version: ${s}`);
  const part = (p) => p === void 0 || /^[xX*]$/.test(p) ? null : Number(p);
  return { major: part(match[1]), minor: part(match[2]), patch: part(match[3]), prerelease: match[4] ?? null };
}
function comparePrerelease(a, b) {
  const left = a.split(".");
  const right = b.split(".");
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = left[i];
    const r = right[i];
    if (l === void 0) return -1;
    if (r === void 0) return 1;
    if (l === r) continue;
    const lNum = /^\d+$/.test(l);
    const rNum = /^\d+$/.test(r);
    if (lNum !== rNum) return lNum ? -1 : 1;
    if (lNum) return Number(l) < Number(r) ? -1 : 1;
    return l < r ? -1 : 1;
  }
  return 0;
}
function compareVersions(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  return comparePrerelease(a.prerelease, b.prerelease);
}
function rangeToken(token, v) {
  if (token === "*" || token.toLowerCase() === "x") return true;
  const op = /^(?:>=|<=|\^|~|>|<|=)?/.exec(token)?.[0] ?? "";
  const p = partialVersion(token.slice(op.length));
  if (p.major === null) return true;
  const major = p.major;
  const bound = { major, minor: p.minor ?? 0, patch: p.patch ?? 0, prerelease: p.prerelease };
  const at = (ma, mi, pa) => ({ major: ma, minor: mi, patch: pa, prerelease: null });
  const within = (lower, upper) => compareVersions(v, lower) >= 0 && compareVersions(v, upper) < 0;
  switch (op) {
    case "^":
      return within(
        bound,
        major > 0 ? at(major + 1, 0, 0) : bound.minor > 0 ? at(0, bound.minor + 1, 0) : at(0, 0, bound.patch + 1)
      );
    case "~":
      return within(bound, p.minor === null ? at(major + 1, 0, 0) : at(major, bound.minor + 1, 0));
    case ">=":
      return compareVersions(v, bound) >= 0;
    case ">":
      return compareVersions(v, bound) > 0;
    case "<=":
      return compareVersions(v, bound) <= 0;
    case "<":
      return compareVersions(v, bound) < 0;
    case "=":
      return compareVersions(v, bound) === 0;
    default:
      if (p.minor === null) return within(at(major, 0, 0), at(major + 1, 0, 0));
      if (p.patch === null) return within(at(major, p.minor, 0), at(major, p.minor + 1, 0));
      return compareVersions(v, bound) === 0;
  }
}
function satisfies(version, range) {
  const trimmed = range.trim();
  if (trimmed.length === 0) throw new Error("empty version range");
  if (trimmed === "*" || trimmed.toLowerCase() === "x") return true;
  const p = partialVersion(version);
  if (p.major === null || p.minor === null || p.patch === null) {
    throw new Error(`expected a full major.minor.patch version, got: ${version}`);
  }
  const v = { major: p.major, minor: p.minor, patch: p.patch, prerelease: p.prerelease };
  return trimmed.split(/\s+/).every((token) => rangeToken(token, v));
}
var STUB_AUTHORING = {
  BLUEPRINT_FILES: Object.keys(BLUEPRINTS).sort(),
  RECORD_BLUEPRINTS: BLUEPRINTS,
  blueprintFor,
  requiredFields,
  fieldUsage,
  describeFile: (file) => DESCRIPTIONS[file] ?? `Records in ${file}.json.`,
  templateRecord,
  peersFor,
  suggestFields,
  draftRecord,
  checkRecords,
  recordKey: (file, record) => recordKey(file, record),
  recordRefKeys: (file, record) => recordRefKeys(file, record),
  keySpecFor,
  keyDescription,
  applyFieldPatch,
  composeFieldPatches,
  touchedFields,
  modProject: (manifest) => new StubProject(manifest),
  validateManifest,
  PACK_GROUPS: PACK_GROUP_NAMES,
  slugify,
  provenanceOf,
  PROVENANCE_KEY,
  satisfies
};

// src/host/seams.ts
var NO_AUTHORING = "This game does not yet give the workshop its authoring library, so every number below comes from the workshop's own demonstration content instead of from the game.";
var NO_RECORDS = "This game does not yet give the workshop its own content, so the records you can base something on come from the workshop's demonstration set, not from the real game.";
var NO_INSTALL = "The workshop does not install mods itself, so it saves the finished mod as a file and you add it with Import a zip on the Mods screen. That takes two extra steps, and you end up with a file you can read, keep and share.";
var NO_SESSION = "This game has no way to load a mod for one session, so to try one you have to install it: the workshop saves the finished mod as a file, then you add it with Import a zip on the Mods screen, turn it on and reload. The mod then stays in your library, where you would want it once it is finished anyway.";
var SESSION_NOT_GRANTED = "This copy of the workshop has no permission to load a mod for one session. The game gives that permission only to the workshop installed from its own repository, and asks you about it on its own. Without it, to try a mod you have to install it: the workshop saves the finished mod as a file, then you add it with Import a zip on the Mods screen, turn it on and reload.";
var NO_WIZARD_SEAM = "This game does not give the workshop its debug commands, so it cannot put anything in front of you or take you anywhere. Forge the mod, try it for the session, reload, and go and find the thing yourself.";
var WIZARD_NOT_GRANTED = "This mod has no permission to use the game's debug commands, so it cannot put anything in front of you or take you anywhere. Forge the mod, try it for the session, reload, and go and find the thing yourself.";
var WIZARD_OFF = 'The "Let me test what I built" setting is off for this mod. Turn it on in the mod manager.';
var NO_GAME = "There is no character in play, so there is nothing to test with.";
function resolveSeams(ctx) {
  const realApi = ctx.authoring;
  const realRecords = ctx.composedRecords;
  const authoring = realApi ? realRecords ? { available: true, api: realApi, records: realRecords, demonstration: false } : { available: false, why: NO_RECORDS, api: realApi, records: STUB_RECORDS, demonstration: true } : { available: false, why: NO_AUTHORING, api: STUB_AUTHORING, records: realRecords ?? STUB_RECORDS, demonstration: true };
  const install = {
    available: false,
    why: NO_INSTALL,
    install: async () => ({
      ok: false,
      problem: NO_INSTALL,
      lines: [NO_INSTALL]
    }),
    reload: async () => void 0,
    reloadByHand: true
  };
  const realHost = realApi !== void 0;
  const reload = resolveReload(ctx);
  const stager = ctx.loadModForSession;
  const session = stager ? { available: true, load: stager, reload: reload ?? (() => void 0), reloadByHand: reload === null } : {
    available: false,
    why: realHost ? SESSION_NOT_GRANTED : NO_SESSION,
    load: async () => ({ ok: false, problem: realHost ? SESSION_NOT_GRANTED : NO_SESSION }),
    reload: () => void 0,
    reloadByHand: true
  };
  return { authoring, install, session, wizard: resolveWizard(ctx, realHost), engine: ctx.engine };
}
function resolveWizard(ctx, realHost) {
  if (ctx.flags[FLAG.cheatSpawn] !== true) return { available: false, why: WIZARD_OFF };
  if (ctx.wizard === void 0) return { available: false, why: realHost ? WIZARD_NOT_GRANTED : NO_WIZARD_SEAM };
  if (ctx.state === void 0) return { available: false, why: NO_GAME, api: ctx.wizard };
  return { available: true, api: ctx.wizard };
}
function resolveReload(ctx) {
  if (ctx.reloadGame !== void 0) return ctx.reloadGame;
  if (ctx.reload !== void 0) return ctx.reload;
  const loc = globalThis.location;
  if (typeof loc?.reload === "function") return () => loc.reload?.();
  return null;
}

// src/model/base64.ts
var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function bytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += CHARS[b0 >> 2];
    out += CHARS[(b0 & 3) << 4 | (b1 ?? 0) >> 4];
    out += b1 === void 0 ? "=" : CHARS[(b1 & 15) << 2 | (b2 ?? 0) >> 6];
    out += b2 === void 0 ? "=" : CHARS[b2 & 63];
  }
  return out;
}
function base64ToBytes(text) {
  const out = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of text) {
    if (ch === "=") break;
    const value = CHARS.indexOf(ch);
    if (value < 0) continue;
    buffer = buffer << 6 | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push(buffer >> bits & 255);
    }
  }
  return new Uint8Array(out);
}

// src/model/persist.ts
var SIZE_CEILING = 512 * 1024;
function isBytesMarker(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && typeof value["$bytes"] === "string" && Object.keys(value).length === 1;
}
function encodeBytes(value) {
  if (value instanceof Uint8Array) return { $bytes: bytesToBase64(value) };
  if (Array.isArray(value)) return value.map(encodeBytes);
  if (typeof value === "object" && value !== null) {
    const out = {};
    for (const [key, inner] of Object.entries(value)) out[key] = encodeBytes(inner);
    return out;
  }
  return value;
}
function decodeBytes(value) {
  if (isBytesMarker(value)) return base64ToBytes(value.$bytes);
  if (Array.isArray(value)) return value.map(decodeBytes);
  if (typeof value === "object" && value !== null) {
    const out = {};
    for (const [key, inner] of Object.entries(value)) out[key] = decodeBytes(inner);
    return out;
  }
  return value;
}
function loadDrafts(prefs) {
  if (!prefs) return { drafts: {}, seenTour: false };
  let raw;
  try {
    raw = prefs.get();
  } catch {
    return { drafts: {}, seenTour: false };
  }
  if (typeof raw !== "object" || raw === null) return { drafts: {}, seenTour: false };
  const stored = decodeBytes(raw);
  if (stored.v !== 1) return { drafts: {}, seenTour: false };
  const drafts = {};
  for (const [id, draft] of Object.entries(stored.drafts ?? {})) {
    if (looksLikeDraft(draft)) drafts[id] = draft;
  }
  return { drafts, seenTour: stored.seenTour === true };
}
function looksLikeDraft(value) {
  if (typeof value !== "object" || value === null) return false;
  const d = value;
  return typeof d.id === "string" && typeof d.version === "string" && Array.isArray(d.changes);
}
function saveDrafts(prefs, drafts, seenTour) {
  const stored = { v: 1, drafts, seenTour };
  const encoded = encodeBytes(stored);
  const text = JSON.stringify(encoded);
  const bytes = new TextEncoder().encode(text).length;
  if (!prefs) {
    return {
      ok: false,
      why: "This game has no storage for the workshop's unfinished work, so nothing here will survive a reload. Finish a mod and save the file.",
      bytes
    };
  }
  if (bytes > SIZE_CEILING) {
    return {
      ok: false,
      why: `Your unfinished work comes to ${Math.round(bytes / 1024)}KB, over the workshop's ${Math.round(SIZE_CEILING / 1024)}KB limit. Finish or delete a mod, and save the file for anything you want to keep.`,
      bytes
    };
  }
  try {
    prefs.set(encoded);
  } catch (e) {
    return { ok: false, why: `Saving your work in progress failed: ${String(e)}`, bytes };
  }
  let back;
  try {
    back = prefs.get();
  } catch (e) {
    return { ok: false, why: `Saving your work in progress seemed to work, but it could not be read back: ${String(e)}`, bytes };
  }
  if (JSON.stringify(back) !== text) {
    return {
      ok: false,
      why: "The workshop saved this and read back something else, so the storage ran out of room without reporting it. Nothing here will survive a reload. Save the file for anything you want to keep.",
      bytes
    };
  }
  return { ok: true, bytes };
}
var DraftWriter = class {
  constructor(prefs, onOutcome, delay = 400) {
    this.prefs = prefs;
    this.onOutcome = onOutcome;
    this.delay = delay;
  }
  prefs;
  onOutcome;
  delay;
  timer;
  pending;
  queue(drafts, seenTour) {
    this.pending = { drafts, seenTour };
    if (this.timer !== void 0) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.delay);
  }
  flush() {
    if (this.timer !== void 0) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
    const pending = this.pending;
    if (!pending) return;
    this.pending = void 0;
    this.onOutcome(saveDrafts(this.prefs, pending.drafts, pending.seenTour));
  }
  /** Stop writing. Called when the mod is torn down. */
  dispose() {
    if (this.timer !== void 0) clearTimeout(this.timer);
    this.timer = void 0;
    this.pending = void 0;
  }
};

// src/model/refs.ts
function refFor(owner, key) {
  return `${owner}:${key}`;
}
function splitRef(ref) {
  const at = ref.indexOf(":");
  if (at < 0) return { owner: "core", key: ref };
  return { owner: ref.slice(0, at), key: ref.slice(at + 1) };
}
function ownerOf(api, record) {
  return api.provenanceOf(record)?.owner ?? "core";
}
function checkIdentity(api, file, draft, owner, records) {
  const key = api.recordKey(file, draft);
  if (key === null) {
    return {
      key: null,
      ref: null,
      collides: false,
      says: `This record has no identity yet. In ${file}, a record takes its identity from ${api.keyDescription(file)}.`
    };
  }
  const ref = refFor(owner, key);
  for (const existing of records[file] ?? []) {
    if (existing === draft) continue;
    if (api.recordKey(file, existing) !== key) continue;
    const name = typeof existing["name"] === "string" ? existing["name"] : key;
    const from = ownerOf(api, existing);
    return {
      key,
      ref,
      collides: true,
      collidesWith: name,
      says: `This record's identity would be "${key}", which is already ${from === "core" ? "the base game's" : `${from}'s`} "${name}". Two records with the same identity are both unaddressable, so change what the identity is built from (${api.keyDescription(file)}).`
    };
  }
  return { key, ref, collides: false, says: `This will be addressed as ${ref}.` };
}
function draftLabel(api, file, record) {
  return api.recordKey(file, record) === null ? "(not named yet)" : labelOf(api, file, record);
}
function labelOf(api, file, record) {
  const spec = api.keySpecFor(file);
  if (spec.kind === "fields") {
    const parts = [];
    for (const path of spec.paths) {
      const value = valueAt(record, path);
      if (typeof value === "string" && value !== "") parts.push(value);
      else if (typeof value === "number") parts.push(String(value));
    }
    if (parts.length > 0) return parts.join(" ");
  }
  const name = record["name"];
  if (typeof name === "string" && name !== "") return name;
  return api.recordKey(file, record) ?? "(no identity)";
}
function valueAt(record, path) {
  let at = record;
  for (const segment of path.split(".")) {
    if (typeof at !== "object" || at === null || Array.isArray(at)) return void 0;
    at = at[segment];
  }
  return at;
}

// src/model/draft.ts
var MOD_API = 1;
var ID_RE2 = /^[a-z][a-z0-9-]*$/;
var VERSION_RE2 = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
function newDraft(id, engine, now) {
  return {
    id,
    name: titleFrom(id),
    version: "0.1.0",
    author: "",
    description: "",
    repository: `local://${id}`,
    license: "GPL-2.0-only",
    engine: engineRangeFor(engine),
    group: "content",
    fields: [],
    changes: [],
    touched: now
  };
}
function titleFrom(id) {
  return id.split("-").filter((part) => part !== "").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function engineRangeFor(engine) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(engine.trim());
  if (!m) return "*";
  return `>=${m[1]}.${m[2]}.${m[3]}`;
}
function groupFor(changes) {
  return changes.some((c) => c.kind === "add" || c.kind === "replace") ? "content" : "tweaks";
}
function allChanges(draft) {
  return [...draft.changes, ...(draft.sections ?? []).flatMap((section) => section.changes)];
}
function dependenciesFor(changes) {
  const out = {};
  for (const change of changes) {
    if (change.kind === "add") continue;
    out[splitRef(change.ref).owner] = "*";
  }
  return out;
}
function draftSize(draft) {
  let added = 0;
  let patched = 0;
  let removed = 0;
  for (const change of allChanges(draft)) {
    if (change.kind === "add") added++;
    else if (change.kind === "patch") patched++;
    else if (change.kind === "replace") patched++;
    else removed++;
  }
  return { added, patched, removed };
}
function draftFiles(draft) {
  return [...new Set(allChanges(draft).map((c) => c.file))].sort();
}

// src/model/zip.ts
var DOS_TIME = 0;
var DOS_DATE = 1 << 5 | 1;
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let c = 4294967295;
  for (let i = 0; i < bytes.length; i++) {
    c = (CRC_TABLE[(c ^ (bytes[i] ?? 0)) & 255] ?? 0) ^ c >>> 8;
  }
  return (c ^ 4294967295) >>> 0;
}
var Writer = class {
  parts = [];
  length = 0;
  get at() {
    return this.length;
  }
  push(bytes) {
    this.parts.push(bytes);
    this.length += bytes.length;
  }
  u16(value) {
    this.push(new Uint8Array([value & 255, value >>> 8 & 255]));
  }
  u32(value) {
    this.push(new Uint8Array([value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255]));
  }
  finish() {
    const out = new Uint8Array(this.length);
    let at = 0;
    for (const part of this.parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  }
};
function zipStored(entries) {
  const encoder = new TextEncoder();
  const body = new Writer();
  const directory = [];
  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const data = typeof entry.contents === "string" ? encoder.encode(entry.contents) : entry.contents;
    const crc = crc32(data);
    const offset = body.at;
    body.u32(67324752);
    body.u16(10);
    body.u16(0);
    body.u16(0);
    body.u16(DOS_TIME);
    body.u16(DOS_DATE);
    body.u32(crc);
    body.u32(data.length);
    body.u32(data.length);
    body.u16(name.length);
    body.u16(0);
    body.push(name);
    body.push(data);
    directory.push({ name, crc, size: data.length, offset });
  }
  const centralAt = body.at;
  for (const entry of directory) {
    body.u32(33639248);
    body.u16(20);
    body.u16(10);
    body.u16(0);
    body.u16(0);
    body.u16(DOS_TIME);
    body.u16(DOS_DATE);
    body.u32(entry.crc);
    body.u32(entry.size);
    body.u32(entry.size);
    body.u16(entry.name.length);
    body.u16(0);
    body.u16(0);
    body.u16(0);
    body.u16(0);
    body.u32(0);
    body.u32(entry.offset);
    body.push(entry.name);
  }
  const centralSize = body.at - centralAt;
  body.u32(101010256);
  body.u16(0);
  body.u16(0);
  body.u16(directory.length);
  body.u16(directory.length);
  body.u32(centralSize);
  body.u32(centralAt);
  body.u16(0);
  return body.finish();
}

// src/model/build.ts
function manifestFor(draft) {
  const ships = Object.keys(draft.extras ?? {});
  const code = ships.some((path) => /\.(?:js|mjs|cjs|ts|wasm)$/i.test(path));
  const manifest = {
    id: draft.id,
    name: draft.name,
    version: draft.version,
    shape: "content",
    facets: code ? ["content", "plugin"] : ["content"],
    engine: draft.engine,
    engineBecause: ENGINE_BECAUSE,
    group: groupFor(allChanges(draft)),
    dependencies: dependenciesFor(allChanges(draft)),
    /* A content mod that adds or retunes anything the player meets is a mod that
     * affects gameplay, and every change the workshop can make does. Saying so
     * is what lets the mod manager warn a player who cares about their score. */
    affectsGameplay: true,
    description: draft.description,
    author: draft.author,
    license: draft.license,
    repository: draft.repository
  };
  if (code) {
    const api = scriptApi(entrySource(draft));
    manifest.api = api.range;
    manifest.runtime = "in-process";
    if (api.api1) manifest.modApi = MOD_API;
  }
  if (draft.fields.length > 0) manifest.fields = [...draft.fields];
  if (draft.sections && draft.sections.length > 0) {
    manifest.sections = draft.sections.map(({ changes: _changes, ...section }) => ({ ...section }));
  }
  return { ...manifest, ...draft.manifestExtras ?? {} };
}
function entrySource(draft) {
  const entry = draft.extras?.["plugin.js"];
  return typeof entry === "string" ? entry : void 0;
}
function basePacks(api, records) {
  const byOwner = /* @__PURE__ */ new Map();
  for (const [file, list] of Object.entries(records)) {
    for (const record of list) {
      const owner = ownerOf(api, record);
      let files = byOwner.get(owner);
      if (!files) {
        files = {};
        byOwner.set(owner, files);
      }
      const into = files[file];
      if (into) into.push(record);
      else files[file] = [record];
    }
  }
  const packs = [];
  for (const [owner, files] of [...byOwner.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const contributions = {};
    for (const [file, list] of Object.entries(files)) contributions[file] = { records: list };
    packs.push({
      manifest: {
        id: owner,
        name: owner,
        version: "0.0.0",
        shape: "content"
      },
      files: contributions
    });
  }
  return packs;
}
function buildDraft(api, draft, records) {
  const project = api.modProject(manifestFor(draft));
  for (const field of draft.fields) project.declareField(field);
  addChanges(project, draft.changes);
  for (const section of draft.sections ?? []) addChanges(project.section?.(section.id) ?? project, section.changes);
  const merged = mergeBase(basePacks(api, records));
  const built = project.build(merged);
  if (built.composed === void 0) return built;
  const all = composedRecordObjects(built.composed);
  const subject = {};
  for (const [file, list] of Object.entries(all)) {
    const mine = list.filter((record) => {
      const provenance = api.provenanceOf(record);
      return provenance?.owner === draft.id || provenance?.modifiedBy?.includes(draft.id) === true;
    });
    if (mine.length > 0) subject[file] = mine;
  }
  const findings = distinctFindings([...built.findings, ...api.checkRecords(subject, all)]);
  return {
    ...built,
    findings,
    ok: built.ok && !findings.some((finding) => finding.level === "error")
  };
}
function composedRecordObjects(composed) {
  const out = {};
  for (const [file, values] of Object.entries(composed)) {
    out[file] = values.filter(
      (value) => typeof value === "object" && value !== null && !Array.isArray(value)
    );
  }
  return out;
}
function distinctFindings(findings) {
  const seen = /* @__PURE__ */ new Set();
  return sortFindings(
    findings.filter((finding) => {
      const key = [finding.level, finding.file, finding.record, finding.field ?? "", finding.rule].join("\0");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  );
}
function mergeBase(packs) {
  const files = {};
  for (const pack of packs) {
    for (const [file, contribution] of Object.entries(pack.files)) {
      const into = files[file];
      if (into) into.records = [...into.records ?? [], ...contribution.records ?? []];
      else files[file] = { records: [...contribution.records ?? []] };
    }
  }
  return {
    manifest: { id: "core", name: "core", version: "0.0.0", shape: "content" },
    files
  };
}
function emitDraft(api, draft) {
  const project = api.modProject(manifestFor(draft));
  for (const field of draft.fields) project.declareField(field);
  addChanges(project, draft.changes);
  for (const section of draft.sections ?? []) addChanges(project.section?.(section.id) ?? project, section.changes);
  return withHandWritten(project.emit(), draft);
}
function addChanges(project, changes) {
  for (const change of changes) {
    switch (change.kind) {
      case "add":
        project.add(change.file, change.record);
        break;
      case "patch":
        project.patchFields(change.file, change.ref, change.ops);
        break;
      case "replace":
        project.replace(change.file, change.ref, change.record);
        break;
      case "remove":
        project.remove(change.file, change.ref);
        break;
    }
  }
}
function withHandWritten(generated, draft) {
  const fileExtras = draft.fileExtras ?? {};
  const extras = draft.extras ?? {};
  const out = generated.map((file) => {
    const stem = file.path.endsWith(".json") ? file.path.slice(0, -".json".length) : "";
    const spare = fileExtras[stem];
    if (file.path === "manifest.json" || spare === void 0 || Object.keys(spare).length === 0 || typeof file.contents !== "string") {
      return file;
    }
    let body;
    try {
      body = JSON.parse(file.contents);
    } catch {
      return file;
    }
    return { path: file.path, contents: `${JSON.stringify({ ...body, ...spare }, null, 2)}
` };
  });
  const written = new Set(out.map((file) => file.path));
  for (const [stem, spare] of Object.entries(fileExtras)) {
    const path = `${stem}.json`;
    if (written.has(path) || Object.keys(spare).length === 0) continue;
    out.push({ path, contents: `${JSON.stringify(spare, null, 2)}
` });
    written.add(path);
  }
  for (const [path, contents] of Object.entries(extras)) {
    if (written.has(path)) continue;
    out.push({ path, contents });
  }
  return out.sort((a, b) => a.path === "manifest.json" ? -1 : b.path === "manifest.json" ? 1 : a.path.localeCompare(b.path));
}
function zipDraft(files) {
  return zipStored(files.map((f) => ({ path: f.path, contents: f.contents })));
}
function sortFindings(findings) {
  const order = { error: 0, warn: 1, hint: 2 };
  return [...findings].sort(
    (a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3) || a.file.localeCompare(b.file) || a.record.localeCompare(b.record) || (a.field ?? "").localeCompare(b.field ?? "")
  );
}
function countFindings(findings) {
  let errors = 0;
  let warnings = 0;
  let hints = 0;
  for (const finding of findings) {
    if (finding.level === "error") errors++;
    else if (finding.level === "warn") warnings++;
    else hints++;
  }
  return { errors, warnings, hints };
}

// src/model/files.ts
function isBinary(contents) {
  return typeof contents !== "string";
}
var MANIFEST = "manifest.json";
var CODE_EXTENSIONS = [".js", ".mjs", ".cjs", ".ts", ".wasm"];
var PLUGIN = "plugin.js";
function isCodePath(path) {
  const lower = path.toLowerCase();
  return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
function scriptFiles(draft) {
  return Object.keys(draft.extras ?? {}).filter(isCodePath).sort();
}
function sessionRefusal(draft) {
  const scripts = scriptFiles(draft);
  if (scripts.length > 0) {
    return `A mod tried for one session can hold content only, and this mod ships ${scripts.join(", ")}. Save it as a file and add it with Import a zip on the Mods screen instead, which can run code and asks you first.`;
  }
  const wanted = (draft.manifestExtras ?? {})["capabilities"];
  if (Array.isArray(wanted) && wanted.length > 0) {
    return `A mod tried for one session can hold content only, and this mod's manifest asks for ${wanted.join(", ")}. Capabilities are granted by the player in the mod manager, so save this as a file and add it with Import a zip.`;
  }
  return void 0;
}
function unread(draft) {
  return Object.entries(draft.fileExtras ?? {}).filter(([, spare]) => Object.keys(spare).length > 0).map(([stem, spare]) => ({ path: `${stem}.json`, keys: Object.keys(spare).sort() })).sort((a, b) => a.path.localeCompare(b.path));
}
function classify(api, path) {
  if (path === MANIFEST) return "manifest";
  if (path.includes("/")) return "extra";
  if (!path.endsWith(".json")) return "extra";
  const stem = path.slice(0, -".json".length);
  return api.BLUEPRINT_FILES.includes(stem) ? "records" : "extra";
}
function projectFiles(api, draft) {
  return emitDraft(api, draft).map((file) => ({ path: file.path, kind: classify(api, file.path), contents: file.contents })).sort((a, b) => a.path === MANIFEST ? -1 : b.path === MANIFEST ? 1 : a.path.localeCompare(b.path));
}
function fileContents(api, draft, path) {
  return projectFiles(api, draft).find((file) => file.path === path)?.contents;
}
function fileText(api, draft, path) {
  const contents = fileContents(api, draft, path);
  return typeof contents === "string" ? contents : void 0;
}
var DEVICE_NAMES = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
function pathShapeProblem(path) {
  if (path === "") return "A file needs a name.";
  if (path.length > 240) return "That path is longer than the 240 characters an installed mod may use.";
  if (path.includes("\\")) return "Folders are separated with a forward slash, even on Windows.";
  if (path.startsWith("/")) return "A path is relative to the mod folder, so it cannot start with a slash.";
  if (/[\u0000-\u001f\u007f]/.test(path)) return "That path has an invisible control character in it.";
  for (const segment of path.split("/")) {
    if (segment === "") return "That path has an empty folder name in it.";
    if (segment === "." || segment === "..") return "A mod may only hold its own files, so a path cannot use . or ..";
    if (segment.length > 255) return "One part of that path is longer than 255 characters.";
    if (segment.endsWith(".") || segment.endsWith(" ")) return "A file or folder name cannot end in a dot or a space.";
    if (DEVICE_NAMES.test(segment)) return `"${segment}" is a reserved device name on Windows, so the archive would be refused.`;
  }
  return void 0;
}
function pathProblem(api, draft, path) {
  const shape = pathShapeProblem(path);
  if (shape !== void 0) return shape;
  const kind = classify(api, path);
  if (kind === "manifest") return "The manifest already exists. Open it from the list.";
  if (kind === "records") {
    return `The workshop writes ${path} from what the mod does to ${path.slice(0, -".json".length)} records, so you cannot create it by hand. Add or change a record and the file appears in this list, ready to edit.`;
  }
  const taken = projectFiles(api, draft).map((file) => file.path.toLowerCase());
  if (taken.includes(path.toLowerCase())) return "There is already a file with that name.";
  return void 0;
}
function pathNote(api, path) {
  if (classify(api, path) !== "extra") return void 0;
  if (!path.includes("/") && path.endsWith(".json") && path !== MANIFEST) {
    return "The game reads every top-level JSON file as a record file. It does not recognise this one, so the file will load and contribute nothing. To have it treated as data your own code reads, put it in a folder (data/ is the usual one).";
  }
  if (isCodePath(path) && path !== PLUGIN && !path.includes("/")) {
    return `Only ${PLUGIN} is an entry point. Another script beside it runs only if ${PLUGIN} imports it.`;
  }
  return void 0;
}
function writeFileText(api, draft, path, text) {
  const shape = pathShapeProblem(path);
  if (shape !== void 0) return { ok: false, why: shape };
  switch (classify(api, path)) {
    case "manifest":
      return emittable(api, writeManifest(api, draft, text));
    case "records":
      return writeRecordFile(draft, path.slice(0, -".json".length), text);
    case "extra": {
      const next = { ok: true, draft: { ...draft, extras: { ...draft.extras ?? {}, [path]: text } } };
      return path === PLUGIN ? emittable(api, next) : next;
    }
  }
}
function emittable(api, outcome) {
  if (!outcome.ok) return outcome;
  try {
    emitDraft(api, outcome.draft);
  } catch (e) {
    return { ok: false, why: `The manifest this would write is not valid: ${e instanceof Error ? e.message : String(e)}` };
  }
  return outcome;
}
function writeFileBytes(api, draft, path, bytes) {
  const shape = pathShapeProblem(path);
  if (shape !== void 0) return { ok: false, why: shape };
  const kind = classify(api, path);
  if (kind !== "extra") {
    return {
      ok: false,
      why: `The workshop generates and parses ${path} as text from what the mod does, so it cannot hold raw bytes.`
    };
  }
  return { ok: true, draft: { ...draft, extras: { ...draft.extras ?? {}, [path]: bytes } } };
}
function deleteFile(api, draft, path) {
  if (classify(api, path) !== "extra") {
    return {
      ok: false,
      why: `The workshop generates ${path} from what the mod contains, so it cannot be deleted. Remove the changes instead.`
    };
  }
  const extras = { ...draft.extras ?? {} };
  delete extras[path];
  return { ok: true, draft: { ...draft, extras } };
}
function projectBytes(api, draft) {
  const encoder = new TextEncoder();
  let total = 0;
  for (const file of projectFiles(api, draft)) {
    total += typeof file.contents === "string" ? encoder.encode(file.contents).length : file.contents.length;
  }
  return total;
}
function parseObject(text, what) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { ok: false, why: `${what} is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, why: `${what} has to be a JSON object, written with { }.` };
  }
  return { ok: true, value };
}
var OWNED = ["id", "name", "version", "author", "description", "repository", "license", "engine", "fields"];
var DERIVED = [
  "shape",
  "facets",
  "group",
  "dependencies",
  "affectsGameplay",
  "modApi",
  "engineBecause",
  "sections"
];
var FROM_CODE = ["api", "runtime"];
function writeManifest(api, draft, text) {
  const parsed = parseObject(text, "The manifest");
  if (!parsed.ok) return parsed;
  const read = manifestFields(parsed.value);
  if (!read.ok) return read;
  const raw = read.fields;
  if (raw["id"] !== void 0 && raw["id"] !== draft.id) {
    return {
      ok: false,
      why: `The id cannot be changed here. The game treats a renamed mod as a different mod, so ${draft.id} would install alongside this one rather than replacing it. Start a new mod instead.`
    };
  }
  const strings = {};
  for (const key of ["name", "version", "author", "description", "repository", "license", "engine"]) {
    const value = raw[key];
    if (value === void 0) continue;
    if (typeof value !== "string") return { ok: false, why: `"${key}" in the manifest has to be a string.` };
    strings[key] = value;
  }
  let fields = draft.fields;
  if (raw["fields"] !== void 0) {
    const declared = raw["fields"];
    if (!Array.isArray(declared)) return { ok: false, why: `"fields" in the manifest has to be a list.` };
    for (const entry of declared) {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        return { ok: false, why: `Every entry in "fields" has to be an object with a name and a list of files.` };
      }
      const decl = entry;
      if (typeof decl["name"] !== "string" || !Array.isArray(decl["files"])) {
        return { ok: false, why: `Every entry in "fields" needs a "name" and a "files" list.` };
      }
    }
    fields = declared;
  }
  const next = { ...draft, ...strings, fields };
  const derived = manifestFor({ ...next, manifestExtras: {} });
  const derivedNow = { api: "*", runtime: "data", ...derived };
  const code = scriptFiles(next);
  for (const key of FROM_CODE) {
    const value = raw[key];
    if (value === void 0) continue;
    const refusal = codeKeyRefusal(api, key, value, derivedNow[key], code);
    if (refusal !== void 0) return { ok: false, why: refusal };
  }
  const extras = {};
  for (const [key, value] of Object.entries(raw)) {
    if (OWNED.includes(key)) continue;
    if (FROM_CODE.includes(key)) continue;
    if (DERIVED.includes(key) && JSON.stringify(derivedNow[key]) === JSON.stringify(value)) {
      continue;
    }
    extras[key] = value;
  }
  if (code.length > 0) {
    const facets = extras["facets"];
    if (facets !== void 0 && !(Array.isArray(facets) && facets.includes("plugin"))) {
      return {
        ok: false,
        why: `This mod ships ${code.join(", ")}, so "facets" has to include "plugin" or the game will not run the code. Leave the line out and the workshop fills it in.`
      };
    }
    if (extras["modApi"] !== void 0 && typeof extras["modApi"] !== "number") {
      return {
        ok: false,
        why: `"modApi" has to be a whole number. It is the schema 1 number for the mod API the code is written for.`
      };
    }
  }
  return { ok: true, draft: { ...next, manifestExtras: extras } };
}
function codeKeyRefusal(api, key, value, want, code) {
  if (key === "api") {
    if (typeof value !== "string") {
      return `"api" has to be a version range in quotes, such as ">=2.0.0 <3.0.0". It names the mod API the code is written for.`;
    }
    try {
      api.satisfies("0.0.0", value);
    } catch {
      return `"api" in the manifest is ${JSON.stringify(value)}, which is not a version range. Write one such as ">=2.0.0 <3.0.0", or leave the line out and the workshop fills it in.`;
    }
  }
  if (JSON.stringify(value) === JSON.stringify(want)) return void 0;
  const is = `"${key}" in the manifest is ${JSON.stringify(value)}`;
  if (code.length === 0) {
    return `${is}, but this mod ships no code, so it has to be ${JSON.stringify(want)}. Leave the line out and the workshop fills it in.`;
  }
  if (key === "api") {
    return `${is}, but the api in plugin.js makes it ${JSON.stringify(want)}. The game goes by the script, so change the api there and the manifest follows, or leave the line out here.`;
  }
  return `${is}, but the game runs this mod's code in its own page, so it has to be ${JSON.stringify(want)}. Leave the line out and the workshop fills it in.`;
}
var CONTRIBUTIONS = ["records", "fieldPatches", "replaces", "removes", "sections"];
function writeRecordFile(draft, file, text) {
  const changes = [];
  const sectionIds = [];
  const spare = {};
  if (text.trim() !== "") {
    const parsed = parseObject(text, `${file}.json`);
    if (!parsed.ok) return parsed;
    const raw = parsed.value;
    for (const [key, value] of Object.entries(raw)) {
      if (!CONTRIBUTIONS.includes(key)) spare[key] = value;
    }
    const readContribution = (value, section) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
      const contribution = value;
      const records2 = contribution["records"];
      if (records2 !== void 0) {
        if (!Array.isArray(records2)) return false;
        for (const record of records2) {
          if (typeof record !== "object" || record === null || Array.isArray(record)) return false;
          changes.push({ kind: "add", file, record, ...section ? { section } : {} });
        }
      }
      const patches2 = contribution["fieldPatches"];
      if (patches2 !== void 0) {
        if (typeof patches2 !== "object" || patches2 === null || Array.isArray(patches2)) return false;
        for (const [ref, ops] of Object.entries(patches2)) {
          if (!Array.isArray(ops)) return false;
          changes.push({ kind: "patch", file, ref, ops, ...section ? { section } : {} });
        }
      }
      const replaces2 = contribution["replaces"];
      if (replaces2 !== void 0) {
        if (typeof replaces2 !== "object" || replaces2 === null || Array.isArray(replaces2)) return false;
        for (const [ref, record] of Object.entries(replaces2)) {
          if (typeof record !== "object" || record === null || Array.isArray(record)) return false;
          changes.push({ kind: "replace", file, ref, record, ...section ? { section } : {} });
        }
      }
      const removes2 = contribution["removes"];
      if (removes2 !== void 0) {
        if (!Array.isArray(removes2) || removes2.some((ref) => typeof ref !== "string")) return false;
        for (const ref of removes2) changes.push({ kind: "remove", file, ref, ...section ? { section } : {} });
      }
      return true;
    };
    const records = raw["records"];
    if (records !== void 0) {
      if (!Array.isArray(records)) return { ok: false, why: `"records" in ${file}.json has to be a list.` };
      for (const record of records) {
        if (typeof record !== "object" || record === null || Array.isArray(record)) {
          return { ok: false, why: `Every entry in "records" has to be an object.` };
        }
        changes.push({ kind: "add", file, record });
      }
    }
    const patches = raw["fieldPatches"];
    if (patches !== void 0) {
      if (typeof patches !== "object" || patches === null || Array.isArray(patches)) {
        return { ok: false, why: `"fieldPatches" in ${file}.json has to be an object that maps each reference to a list of operations.` };
      }
      for (const [ref, ops] of Object.entries(patches)) {
        if (!Array.isArray(ops)) return { ok: false, why: `The operations for ${ref} have to be a list.` };
        for (const op of ops) {
          if (typeof op !== "object" || op === null || Array.isArray(op) || typeof op["op"] !== "string" || typeof op["path"] !== "string") {
            return { ok: false, why: `Every operation for ${ref} needs an "op" and a "path".` };
          }
        }
        changes.push({ kind: "patch", file, ref, ops });
      }
    }
    const replaces = raw["replaces"];
    if (replaces !== void 0) {
      if (typeof replaces !== "object" || replaces === null || Array.isArray(replaces)) {
        return { ok: false, why: `"replaces" in ${file}.json has to be an object that maps each reference to a record.` };
      }
      for (const [ref, record] of Object.entries(replaces)) {
        if (typeof record !== "object" || record === null || Array.isArray(record)) {
          return { ok: false, why: `The replacement for ${ref} has to be an object.` };
        }
        changes.push({ kind: "replace", file, ref, record });
      }
    }
    const removes = raw["removes"];
    if (removes !== void 0) {
      if (!Array.isArray(removes) || removes.some((ref) => typeof ref !== "string")) {
        return { ok: false, why: `"removes" in ${file}.json has to be a list of references.` };
      }
      for (const ref of removes) changes.push({ kind: "remove", file, ref });
    }
    const sections2 = raw["sections"];
    if (sections2 !== void 0) {
      if (typeof sections2 !== "object" || sections2 === null || Array.isArray(sections2)) return { ok: false, why: `"sections" in ${file}.json has to be an object.` };
      for (const [id, contribution] of Object.entries(sections2)) {
        if (!readContribution(contribution, id)) return { ok: false, why: `The contribution for section ${id} is malformed.` };
      }
      const declaredSectionIds = Object.keys(sections2);
      for (const id of declaredSectionIds) if (!sectionIds.includes(id)) sectionIds.push(id);
    }
  }
  for (const id of changes.map((change) => change.section).filter((id2) => id2 !== void 0)) {
    if (!sectionIds.includes(id)) sectionIds.push(id);
  }
  const existingSections = new Map((draft.sections ?? []).map((section) => [section.id, section]));
  const sections = sectionIds.map((id) => ({
    ...existingSections.get(id) ?? { id, title: id },
    changes: changes.filter((change) => change.section === id)
  }));
  const fileExtras = { ...draft.fileExtras ?? {} };
  if (Object.keys(spare).length === 0) delete fileExtras[file];
  else fileExtras[file] = spare;
  const unsectioned = changes.filter((change) => change.section === void 0);
  const sectioned = [...(draft.sections ?? []).filter((section) => !sectionIds.includes(section.id)), ...sections];
  const next = { ...draft, changes: spliceFile(draft.changes, file, unsectioned), fileExtras };
  if (sectioned.length > 0) return { ok: true, draft: { ...next, sections: sectioned } };
  const { sections: _sections, ...withoutSections } = next;
  return { ok: true, draft: withoutSections };
}
function spliceFile(changes, file, replacement) {
  const at = changes.findIndex((change) => change.file === file);
  const others = changes.filter((change) => change.file !== file);
  if (at < 0) return [...others, ...replacement];
  const before = changes.slice(0, at);
  return [...before, ...replacement, ...others.slice(before.length)];
}

// src/model/fork.ts
var FORKED_FROM = "forkedFrom";
function forkDraft(api, folder, options) {
  if (!ID_RE2.test(options.id)) {
    return { ok: false, why: "A fork needs an id that is lower case, starts with a letter, and uses only letters, digits and hyphens." };
  }
  const rooted = rootFolder(folder);
  const manifestText = rooted[MANIFEST];
  if (manifestText !== void 0 && isBinary(manifestText)) {
    return { ok: false, why: "That folder's manifest.json is not text, so it is not a mod folder." };
  }
  let manifest;
  if (manifestText !== void 0) {
    let parsed;
    try {
      parsed = JSON.parse(manifestText);
    } catch (e) {
      return { ok: false, why: `That mod's manifest.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, why: "That mod's manifest.json is not a JSON object, so it is not a manifest." };
    }
    const read = manifestFields(parsed);
    if (!read.ok) return { ok: false, why: `That mod's manifest.json could not be read: ${read.why}` };
    manifest = read.fields;
  }
  const sourceId = stringAt(manifest, "id") ?? options.sourceId;
  if (sourceId === void 0 || sourceId === "") {
    return {
      ok: false,
      why: "There is no manifest.json with an id in that folder, so there is no mod there to fork. A mod folder has manifest.json at its root."
    };
  }
  if (sourceId === options.id) {
    return {
      ok: false,
      why: `A fork needs an id of its own, and "${sourceId}" belongs to the mod being forked. Two mods with the same id install over each other instead of side by side.`
    };
  }
  const notes = [];
  let draft = newDraft(options.id, options.engine, options.now);
  const paths = Object.keys(rooted).filter((path) => path !== MANIFEST).sort();
  let carried = 0;
  for (const path of paths) {
    const contents = rooted[path];
    if (contents === void 0) continue;
    const outcome = isBinary(contents) ? writeFileBytes(api, draft, path, contents) : writeFileText(api, draft, path, contents);
    if (!outcome.ok) return { ok: false, why: `${path} could not be read: ${outcome.why}` };
    draft = outcome.draft;
    carried++;
  }
  if (carried === 0 && manifest === void 0) {
    return { ok: false, why: `${sourceId} has nothing in the running game that can be forked.` };
  }
  if (manifest !== void 0) {
    const { id: _id, repository: _repository, author: _author, ...rest } = manifest;
    const text = `${JSON.stringify({ ...rest, [FORKED_FROM]: originOf(options.source, sourceId, manifest) }, null, 2)}
`;
    const outcome = writeFileText(api, draft, MANIFEST, text);
    if (!outcome.ok) return { ok: false, why: `That mod's manifest.json could not be read: ${outcome.why}` };
    draft = outcome.draft;
  } else {
    draft = {
      ...draft,
      manifestExtras: { ...draft.manifestExtras ?? {}, [FORKED_FROM]: originOf(options.source, sourceId, void 0) }
    };
  }
  notes.push(...differences(sourceId, manifest, options.source));
  return { ok: true, draft, notes };
}
function originOf(source, id, manifest) {
  const version = stringAt(manifest, "version");
  const author = stringAt(manifest, "author");
  const repository = stringAt(manifest, "repository");
  return {
    source,
    id,
    ...version === void 0 ? {} : { version },
    ...author === void 0 ? {} : { author },
    ...repository === void 0 ? {} : { repository }
  };
}
function differences(sourceId, manifest, source) {
  const notes = [
    `This is a fork of ${sourceId}. Its manifest records where it came from, so the original keeps its credit.`,
    "The repository field holds your own local address, not the original's. An install pins a mod's origin, and with the original's address the update check would look for your releases in somebody else's repository."
  ];
  if (manifest === void 0) {
    notes.push(
      `The workshop cannot read ${sourceId}'s manifest, so this fork has none of its name, description, author or licence. Set the licence on the details screen before you share it, because forking somebody's content does not give you permission to relicense it.`
    );
    return notes;
  }
  const license = stringAt(manifest, "license");
  notes.push(
    license === void 0 ? `${sourceId} declares no licence, so nothing says what you may do with its content. Ask its author before you share this.` : `${sourceId} is licensed ${license}, so the fork keeps that licence along with its content.`
  );
  if (stringAt(manifest, "author") !== void 0) notes.push("The author field is blank, because the fork's author is you.");
  if (source === "file") notes.push("The name is still the original's. Change it before anybody sees the two side by side.");
  return notes;
}
function folderFromFiles(files) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const out = {};
  for (const file of files) {
    if (typeof file.contents === "string") {
      out[file.path] = file.contents;
      continue;
    }
    try {
      out[file.path] = decoder.decode(file.contents);
    } catch {
      out[file.path] = file.contents;
    }
  }
  return out;
}
function rootFolder(folder) {
  if (folder[MANIFEST] !== void 0) return folder;
  const prefixes = Object.keys(folder).filter((path) => path.endsWith(`/${MANIFEST}`) && path.split("/").length === 2).map((path) => path.slice(0, -MANIFEST.length));
  const prefix = prefixes[0];
  if (prefix === void 0 || prefixes.length > 1) return folder;
  const out = {};
  for (const [path, contents] of Object.entries(folder)) {
    if (!path.startsWith(prefix)) continue;
    out[path.slice(prefix.length)] = contents;
  }
  return out;
}
function installedMods(api, records) {
  const tally = /* @__PURE__ */ new Map();
  const of = (id) => {
    const found = tally.get(id);
    if (found) return found;
    const fresh = { adds: 0, adjusts: 0, shared: 0 };
    tally.set(id, fresh);
    return fresh;
  };
  for (const list of Object.values(records)) {
    for (const record of list) {
      const provenance = api.provenanceOf(record);
      if (!provenance) continue;
      if (provenance.owner !== BASE) of(provenance.owner).adds++;
      const modifiers = provenance.modifiedBy ?? [];
      for (const id of modifiers) {
        if (id === provenance.owner) continue;
        if (modifiers.length === 1) of(id).adjusts++;
        else of(id).shared++;
      }
    }
  }
  return [...tally.entries()].map(([id, counts]) => ({ id, ...counts })).sort((a, b) => a.id.localeCompare(b.id));
}
var BASE = "core";
function folderFromInstalled(api, records, owner) {
  const byFile = /* @__PURE__ */ new Map();
  const of = (file) => {
    const found = byFile.get(file);
    if (found) return found;
    const fresh = { records: [], replaces: {} };
    byFile.set(file, fresh);
    return fresh;
  };
  let restored = 0;
  let shared = 0;
  let unaddressable = 0;
  for (const [file, list] of Object.entries(records)) {
    for (const record of list) {
      const provenance = api.provenanceOf(record);
      if (!provenance) continue;
      if (provenance.owner === owner) {
        const own = { ...record, ...provenance.was ?? {} };
        if (provenance.was !== void 0) restored++;
        of(file).records.push(withoutProvenance(api, own));
        continue;
      }
      const modifiers = provenance.modifiedBy ?? [];
      if (!modifiers.includes(owner)) continue;
      if (modifiers.length > 1) {
        shared++;
        continue;
      }
      const key = api.recordKey(file, record);
      if (key === null) {
        unaddressable++;
        continue;
      }
      of(file).replaces[refFor(provenance.owner, key)] = withoutProvenance(api, record);
    }
  }
  const folder = {};
  for (const [file, contribution] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const body = {};
    if (contribution.records.length > 0) body["records"] = contribution.records;
    if (Object.keys(contribution.replaces).length > 0) body["replaces"] = contribution.replaces;
    if (Object.keys(body).length === 0) continue;
    folder[`${file}.json`] = `${JSON.stringify(body, null, 2)}
`;
  }
  const notes = [];
  if (restored > 0) {
    notes.push(
      `Another mod in this game had adjusted ${restored} of ${owner}'s own records. The fork takes ${owner}'s version of them, without the other mod's changes.`
    );
  }
  if (shared > 0) {
    notes.push(
      `${shared} record${shared === 1 ? "" : "s"} that ${owner} adjusts ${shared === 1 ? "is" : "are"} adjusted by another mod as well. A composed record holds only the combined result, not one entry per mod, so ${owner}'s share cannot be pulled out of it and ${shared === 1 ? "it is" : "they are"} left out of the fork.`
    );
  }
  if (unaddressable > 0) {
    notes.push(
      `${unaddressable} record${unaddressable === 1 ? "" : "s"} ${owner} adjusts cannot be named by a reference, so ${unaddressable === 1 ? "it is" : "they are"} left out.`
    );
  }
  return { folder, notes };
}
function forkInstalled(api, records, owner, options) {
  const read = folderFromInstalled(api, records, owner);
  const outcome = forkDraft(api, read.folder, { ...options, source: "installed", sourceId: owner });
  if (!outcome.ok) return outcome;
  return { ok: true, draft: outcome.draft, notes: [...outcome.notes, ...read.notes] };
}
function withoutProvenance(api, record) {
  const { [api.PROVENANCE_KEY]: _stamp, ...rest } = record;
  return rest;
}
function stringAt(record, key) {
  const value = record?.[key];
  return typeof value === "string" && value !== "" ? value : void 0;
}

// src/model/unzip.ts
var ZIP_LIMITS = {
  maxArchiveBytes: 64 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
  maxEntries: 4096
};
function zipSizeCheck(size, limit = ZIP_LIMITS.maxArchiveBytes) {
  return size > limit ? { ok: false, why: `Could not import: the ZIP file is larger than ${limit / (1024 * 1024)} MiB.` } : { ok: true };
}
function unpackedLimit(limit) {
  return `Could not import: the ZIP would unpack to more than ${limit / (1024 * 1024)} MiB.`;
}
var LOCAL_HEADER = 67324752;
var CENTRAL_HEADER = 33639248;
var END_OF_DIRECTORY = 101010256;
var ZIP64_MARKER = 4294967295;
async function unzip(bytes, limits = ZIP_LIMITS) {
  const size = zipSizeCheck(bytes.length, limits.maxArchiveBytes);
  if (!size.ok) return size;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = findEndOfDirectory(view);
  if (end < 0) {
    return { ok: false, why: "That file is not a zip: it has no central directory at the end of it." };
  }
  const count = view.getUint16(end + 10, true);
  if (count > limits.maxEntries) {
    return { ok: false, why: `Could not import: the ZIP holds more than ${limits.maxEntries.toLocaleString("en-US")} entries.` };
  }
  const directoryAt = view.getUint32(end + 16, true);
  if (directoryAt >= bytes.length) {
    return { ok: false, why: "That zip's directory points past the end of the file, so it is truncated or damaged." };
  }
  const files = [];
  let declared = 0;
  let at = directoryAt;
  for (let i = 0; i < count; i++) {
    if (at + 46 > bytes.length || view.getUint32(at, true) !== CENTRAL_HEADER) {
      return { ok: false, why: `That zip's directory ends after ${i} of its ${count} files, so it is damaged.` };
    }
    const method = view.getUint16(at + 10, true);
    const compressed = view.getUint32(at + 20, true);
    const uncompressed = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const localAt = view.getUint32(at + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extraLength + commentLength;
    if (compressed === ZIP64_MARKER || uncompressed === ZIP64_MARKER || localAt === ZIP64_MARKER) {
      return {
        ok: false,
        why: `${name} uses the zip64 extension, which the workshop cannot open. A mod folder is too small to need it, so this is probably not a mod.`
      };
    }
    declared += uncompressed;
    if (declared > limits.maxTotalBytes) return { ok: false, why: unpackedLimit(limits.maxTotalBytes) };
    if (name.endsWith("/")) continue;
    if (method !== 0 && method !== 8) {
      return {
        ok: false,
        why: `${name} is compressed with method ${method}, which is neither stored nor deflate. Repack the mod as an ordinary zip, or pick its folder instead.`
      };
    }
    if (localAt + 30 > bytes.length || view.getUint32(localAt, true) !== LOCAL_HEADER) {
      return { ok: false, why: `That zip lists ${name} at a position that holds no file, so the zip is damaged.` };
    }
    const dataAt = localAt + 30 + view.getUint16(localAt + 26, true) + view.getUint16(localAt + 28, true);
    if (dataAt + compressed > bytes.length) {
      return { ok: false, why: `${name} runs past the end of that zip, so it is truncated.` };
    }
    const raw = bytes.subarray(dataAt, dataAt + compressed);
    files.push({ name, method, raw });
  }
  const entries = [];
  const budget = { used: 0, limit: limits.maxTotalBytes };
  for (const { name, method, raw } of files) {
    if (method === 0) {
      budget.used += raw.length;
      if (budget.used > budget.limit) return { ok: false, why: unpackedLimit(budget.limit) };
      entries.push({ path: name, contents: raw.slice() });
      continue;
    }
    const inflated = await inflate(raw, budget);
    if (!inflated.ok) return { ok: false, why: `${name} could not be unpacked: ${inflated.why}` };
    entries.push({ path: name, contents: inflated.bytes });
  }
  return { ok: true, entries };
}
function findEndOfDirectory(view) {
  const floor = Math.max(0, view.byteLength - 22 - 65535);
  for (let at = view.byteLength - 22; at >= floor; at--) {
    if (view.getUint32(at, true) === END_OF_DIRECTORY) return at;
  }
  return -1;
}
async function inflate(raw, budget) {
  const Decompressor = globalThis.DecompressionStream;
  if (Decompressor === void 0) {
    return {
      ok: false,
      why: "this browser cannot unpack a compressed zip. Pick the mod's folder instead of its zip."
    };
  }
  try {
    const stream = new Blob([raw]).stream().pipeThrough(new Decompressor("deflate-raw"));
    const reader = stream.getReader();
    const chunks = [];
    let length = 0;
    try {
      for (; ; ) {
        const chunk = await reader.read();
        if (chunk.done) break;
        budget.used += chunk.value.length;
        if (budget.used > budget.limit) {
          await reader.cancel().catch(() => void 0);
          return { ok: false, why: unpackedLimit(budget.limit) };
        }
        chunks.push(chunk.value);
        length += chunk.value.length;
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let at = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, at);
      at += chunk.length;
    }
    return { ok: true, bytes };
  } catch (e) {
    return { ok: false, why: e instanceof Error ? e.message : String(e) };
  }
}

// src/model/ops.ts
function isCommutative2(op) {
  return op === "addFlag" || op === "removeFlag" || op === "append";
}
function opSet(path, value) {
  return { op: "set", path, value };
}
function opNudge(path, delta) {
  return { op: "add", path, value: delta };
}
function opScale(path, factor) {
  return { op: "mul", path, value: factor };
}
function opFlag(path, flag, on) {
  return on ? { op: "addFlag", path, flag } : { op: "removeFlag", path, flag };
}
function opAddRow(path, value) {
  return { op: "append", path, values: [value] };
}
function opDeleteRow(path, value) {
  return { op: "removeValue", path, value };
}
function describeOp(op) {
  switch (op.op) {
    case "set":
      return `set ${op.path} to ${short(op.value)}`;
    case "merge":
      return `change ${Object.keys(op.value).join(", ")} inside ${op.path}`;
    case "addFlag":
      return `add the flag ${op.flag} to ${op.path}`;
    case "removeFlag":
      return `take the flag ${op.flag} out of ${op.path}`;
    case "add":
      return `${op.value < 0 ? "lower" : "raise"} ${op.path} by ${Math.abs(op.value)}`;
    case "mul":
      return `multiply ${op.path} by ${op.value}`;
    case "append":
      return `add ${op.values.length === 1 ? "an entry" : `${op.values.length} entries`} to ${op.path}`;
    case "removeValue":
      return `take ${short(op.value)} out of ${op.path}`;
  }
}
function describeComposition(op) {
  if (isCommutative2(op.op)) {
    return "If another mod makes the same kind of change here, both changes are kept.";
  }
  return "If another mod also writes this field, whichever loads last wins.";
}
function short(value) {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "nothing";
  if (Array.isArray(value)) return `a list of ${value.length}`;
  if (typeof value === "object") return `{ ${Object.keys(value).slice(0, 3).join(", ")} }`;
  return String(value);
}
function collapseOps(ops) {
  const out = [];
  for (const op of ops) {
    if (op.op === "set") {
      const at = out.findIndex((prev) => prev.op === "set" && prev.path === op.path);
      if (at >= 0) {
        out[at] = op;
        continue;
      }
    }
    out.push(op);
  }
  return out;
}

// src/model/paths.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var INDEX_RE = /^(?:0|[1-9][0-9]*)$/;
function isIndex(segment) {
  return INDEX_RE.test(segment);
}
function segments(path) {
  return path === "" ? [] : path.split(".");
}
function valueAt2(record, path) {
  let at = record;
  for (const segment of segments(path)) {
    if (Array.isArray(at)) {
      if (!isIndex(segment)) return void 0;
      at = at[Number(segment)];
      continue;
    }
    if (!isRecord2(at)) return void 0;
    at = at[segment];
  }
  return at;
}
function withValueAt(record, path, value) {
  const parts = segments(path);
  if (parts.length === 0) throw new Error("an empty path addresses nothing");
  return setIn(record, parts, value);
}
function setIn(container, parts, value) {
  const head = parts[0];
  if (head === void 0) return value;
  const rest = parts.slice(1);
  if (isIndex(head)) {
    const index = Number(head);
    const base2 = Array.isArray(container) ? [...container] : [];
    const child = rest.length === 0 ? value : setIn(base2[index] ?? seedFor(rest[0]), rest, value);
    while (base2.length < index) base2.push(null);
    base2[index] = child;
    return base2;
  }
  const base = isRecord2(container) ? { ...container } : {};
  base[head] = rest.length === 0 ? value : setIn(base[head] ?? seedFor(rest[0]), rest, value);
  return base;
}
function seedFor(next) {
  return next !== void 0 && isIndex(next) ? [] : {};
}
function withoutValueAt(record, path) {
  const parts = segments(path);
  if (parts.length === 0) return record;
  return removeIn(record, parts);
}
function removeIn(container, parts) {
  const head = parts[0];
  if (head === void 0) return container;
  const rest = parts.slice(1);
  if (isIndex(head)) {
    if (!Array.isArray(container)) return container;
    const base2 = [...container];
    const index = Number(head);
    if (rest.length === 0) base2.splice(index, 1);
    else {
      const child = base2[index];
      if (child !== void 0) base2[index] = removeIn(child, rest);
    }
    return base2;
  }
  if (!isRecord2(container)) return container;
  const base = { ...container };
  if (rest.length === 0) delete base[head];
  else {
    const child = base[head];
    if (child !== void 0) base[head] = removeIn(child, rest);
  }
  return base;
}
function kindOf(value) {
  if (value === void 0 || value === null) return "empty";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) {
    if (value.length === 0) return "list";
    if (value.every((entry) => typeof entry === "string")) return "flags";
    if (value.every((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry))) return "rows";
    return "list";
  }
  return "object";
}
function summarize(value) {
  const kind = kindOf(value);
  switch (kind) {
    case "empty":
      return "nothing yet";
    case "flags":
      return value.join(", ");
    case "rows":
      return `${value.length} entr${value.length === 1 ? "y" : "ies"}`;
    case "list":
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    case "object": {
      const keys = Object.keys(value);
      return keys.length === 0 ? "nothing yet" : keys.join(", ");
    }
    default:
      return String(value);
  }
}

// src/model/target.ts
function targetFor(api, change, base) {
  switch (change.kind) {
    case "add":
      return { file: change.file, mode: "own", record: change.record };
    case "replace":
      return { file: change.file, mode: "own", record: change.record, ref: change.ref };
    case "patch": {
      if (!base) return void 0;
      let effective = base;
      try {
        effective = api.applyFieldPatch(base, [...change.ops]);
      } catch {
        effective = base;
      }
      return { file: change.file, mode: "patch", record: effective, base, ref: change.ref, ops: change.ops };
    }
    case "remove":
      return void 0;
  }
}
function editValue(change, path, value) {
  switch (change.kind) {
    case "add":
      return { ...change, record: withValueAt(change.record, path, value) };
    case "replace":
      return { ...change, record: withValueAt(change.record, path, value) };
    case "patch":
      return { ...change, ops: collapseOps([...change.ops, opSet(path, value)]) };
    case "remove":
      return change;
  }
}
function removeValue(change, path) {
  switch (change.kind) {
    case "add":
      return { ...change, record: withoutValueAt(change.record, path) };
    case "replace":
      return { ...change, record: withoutValueAt(change.record, path) };
    case "patch":
      return { ...change, ops: collapseOps([...change.ops, opSet(path, null)]) };
    case "remove":
      return change;
  }
}
function recordOp(change, op) {
  if (change.kind !== "patch") return change;
  return { ...change, ops: collapseOps([...change.ops, op]) };
}
function isPristine(target, path) {
  if (target.mode === "own") return valueAt2(target.record, path) === void 0;
  const ops = target.ops ?? [];
  return !ops.some((op) => op.path === path || op.path.startsWith(`${path}.`));
}

// src/ui/store.ts
function initialState(drafts, seenTour) {
  return {
    route: seenTour ? { at: "mods" } : { at: "tour" },
    drafts,
    revision: 0,
    verdict: { revision: -1, stale: false },
    showAllFields: false,
    filter: "",
    collapsed: {},
    buffers: {},
    seenTour
  };
}
function openDraft(state) {
  return state.openId === void 0 ? void 0 : state.drafts[state.openId];
}
var Store = class _Store {
  state;
  listeners = [];
  past = [];
  future = [];
  static DEPTH = 60;
  constructor(initial) {
    this.state = initial;
  }
  get() {
    return this.state;
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const at = this.listeners.indexOf(listener);
      if (at >= 0) this.listeners.splice(at, 1);
    };
  }
  /** Change VIEW or DERIVED state. Not undoable, does not bump the revision. */
  view(change) {
    this.commit({ ...this.state, ...change(this.state) });
  }
  /**
   * Change the DOCUMENT. Undoable, bumps the revision, invalidates the verdict.
   *
   * The verdict is marked stale rather than cleared, so the findings pane keeps
   * showing the last completed answer with a label instead of emptying and
   * refilling on every keystroke. A pane that flickers is a pane nobody reads.
   */
  edit(change) {
    const next = change(this.state.drafts);
    if (next === this.state.drafts) return;
    this.past.push(this.state.drafts);
    if (this.past.length > _Store.DEPTH) this.past.shift();
    this.future.length = 0;
    this.commit({
      ...this.state,
      drafts: next,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true }
    });
  }
  canUndo() {
    return this.past.length > 0;
  }
  canRedo() {
    return this.future.length > 0;
  }
  undo() {
    const previous = this.past.pop();
    if (!previous) return;
    this.future.push(this.state.drafts);
    this.commit({
      ...this.state,
      drafts: previous,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true }
    });
  }
  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.state.drafts);
    this.commit({
      ...this.state,
      drafts: next,
      revision: this.state.revision + 1,
      verdict: { ...this.state.verdict, stale: true }
    });
  }
  commit(next) {
    const prev = this.state;
    if (next === prev) return;
    this.state = next;
    for (const listener of [...this.listeners]) listener(next, prev);
  }
};

// src/ui/actions.ts
var CHECK_DELAY = 250;
var Actions = class {
  constructor(deps) {
    this.deps = deps;
  }
  deps;
  checkTimer;
  /** Set the moment `close()` is first called, so a second press - the Close
   * button mashed, or Escape landing again while the exit screen is up -
   * cannot start a second exit transition racing the first one. */
  closing = false;
  /* --------------------------------------------------------------- *
   * Navigation and chatter                                          *
   * --------------------------------------------------------------- */
  go(route) {
    this.deps.store.view(() => ({ route, filter: "" }));
  }
  notice(text, tone = "plain") {
    this.deps.store.view(() => ({ notice: { text, tone } }));
  }
  setFilter(filter) {
    this.deps.store.view(() => ({ filter }));
  }
  focusField(field) {
    this.deps.store.view(() => field === void 0 ? { focusField: void 0 } : { focusField: field });
  }
  toggleGroup(group) {
    this.deps.store.view((s) => ({ collapsed: { ...s.collapsed, [group]: !s.collapsed[group] } }));
  }
  toggleAllFields() {
    this.deps.store.view((s) => ({ showAllFields: !s.showAllFields }));
  }
  finishTour() {
    this.deps.store.view(() => ({ seenTour: true, route: { at: "mods" } }));
    this.persist();
  }
  /**
   * The player is done. The drafts are flushed immediately either way - an
   * animation is not a reason to risk losing unsaved work - and the actual
   * teardown runs after the graceful exit screen has had its moment, when
   * one is available.
   */
  close() {
    if (this.closing) return;
    this.closing = true;
    this.deps.writer.flush();
    const finish = () => this.deps.closeWorkshop();
    if (this.deps.playExit) this.deps.playExit(finish);
    else finish();
  }
  /* --------------------------------------------------------------- *
   * Mods                                                            *
   * --------------------------------------------------------------- */
  /**
   * Whether an id can be used, and why not when it cannot.
   *
   * A MOD ALREADY IN THE GAME COUNTS, and that arm arrived with forking. The game
   * treats an id as an identity, so a mod that reuses one installs over the mod
   * that had it rather than beside it - which is a mistake somebody is far more
   * likely to make while copying an existing mod than while naming a blank one,
   * and is the same mistake either way. There is one answer to this question so
   * that the two doors cannot give different ones.
   */
  idProblem(id) {
    if (id === "") return "A mod needs an id.";
    if (!ID_RE2.test(id)) {
      return "An id is lower case, starts with a letter, and uses only letters, digits and hyphens.";
    }
    if (this.deps.store.get().drafts[id]) return "There is already an unfinished mod with that id.";
    if (this.installedMods().some((mod) => mod.id === id)) {
      return `${id} is already in this game. Two mods with one id install over each other, so pick another.`;
    }
    return void 0;
  }
  createMod(id) {
    if (this.idProblem(id) !== void 0) return;
    const draft = newDraft(id, this.deps.seams.engine, (/* @__PURE__ */ new Date()).toISOString());
    this.deps.store.edit((drafts) => ({ ...drafts, [id]: draft }));
    this.deps.store.view(() => ({ openId: id, route: { at: "details" } }));
    this.persist();
  }
  openMod(id) {
    this.deps.store.view(() => ({ openId: id, route: { at: "details" } }));
    this.scheduleCheck();
  }
  /* --------------------------------------------------------------- *
   * Forking                                                         *
   * --------------------------------------------------------------- */
  /**
   * Every mod in the running game whose content a fork could take.
   *
   * Read from provenance on every call rather than cached, because the answer
   * comes from the composed records the workshop was handed and those do not
   * change while it is open. A cache would be a copy that could.
   */
  installedMods() {
    return installedMods(this.deps.api, this.deps.records);
  }
  /** Fork a mod this game has installed, from the records it composed. */
  forkInstalled(owner, id) {
    const problem = this.idProblem(id);
    if (problem !== void 0) return this.tell({ ok: false, why: problem });
    return this.adopt(forkInstalled(this.deps.api, this.deps.records, owner, this.forkOptions(id)), id);
  }
  /** Fork a mod folder picked from disk, file by file. */
  forkFolder(files, id) {
    const problem = this.idProblem(id);
    if (problem !== void 0) return this.tell({ ok: false, why: problem });
    return this.forkFrom(folderFromFiles(files), id);
  }
  /**
   * Fork a mod supplied as a zip.
   *
   * The archive is opened here rather than handed to the game, because the doors
   * the game lends a mod take bytes in order to INSTALL them. There is no seam
   * that reads an archive and gives it back, so reading it is this repository's
   * own `unzip`, and what comes out goes through the same fork as a picked folder.
   */
  async forkZip(bytes, id) {
    const problem = this.idProblem(id);
    if (problem !== void 0) return this.tell({ ok: false, why: problem });
    const read = await unzip(bytes);
    if (!read.ok) return this.tell({ ok: false, why: read.why });
    return this.forkFrom(
      folderFromFiles(read.entries.map((entry) => ({ path: entry.path, contents: entry.contents }))),
      id
    );
  }
  forkFrom(folder, id) {
    return this.adopt(forkDraft(this.deps.api, folder, { ...this.forkOptions(id), source: "file" }), id);
  }
  forkOptions(id) {
    return { id, engine: this.deps.seams.engine, now: (/* @__PURE__ */ new Date()).toISOString() };
  }
  /**
   * Put a finished fork in the workshop, and DO NOT navigate to it.
   *
   * The difference from `createMod`, which opens what it made, is the notes. A
   * fork hands back several sentences about what it could not carry - a licence
   * it does not know, a record two mods both adjust, an author field it blanked -
   * and the status line is one line. Walking straight to the details screen would
   * take the player away from the only place those sentences are shown, before
   * they had been read. So the fork lands, gets selected, and says so where the
   * player still is.
   */
  adopt(outcome, id) {
    if (!outcome.ok) return this.tell(outcome);
    this.deps.store.edit((drafts) => ({ ...drafts, [id]: outcome.draft }));
    this.deps.store.view(() => ({ openId: id }));
    this.persist();
    this.scheduleCheck();
    this.notice(`${id} is a fork you can edit. Read what it could not carry before you change anything.`, "good");
    return outcome;
  }
  tell(refusal) {
    this.notice(refusal.why, "bad");
    return refusal;
  }
  deleteMod(id) {
    this.deps.store.edit((drafts) => {
      const next = { ...drafts };
      delete next[id];
      return next;
    });
    this.deps.store.view((s) => ({
      openId: s.openId === id ? void 0 : s.openId,
      route: { at: "mods" }
    }));
    this.persist();
  }
  /** Change one or more of the manifest fields on the open draft. */
  setDetails(patch) {
    this.mutate((draft) => ({ ...draft, ...patch }));
  }
  /* --------------------------------------------------------------- *
   * Changes                                                         *
   * --------------------------------------------------------------- */
  /**
   * Add a new record, drafted against the base the player picked.
   *
   * The drafting call is what makes this worth doing rather than starting from a
   * blank form: the new record inherits the shape and the scale of its nearest
   * comparable and none of its powers, and every number it arrives with can say
   * where it came from.
   */
  addRecord(file, seed) {
    const drafted = this.deps.api.draftRecord(file, seed, this.deps.records);
    this.pushChange({ kind: "add", file, record: drafted.record });
    const index = (openDraft(this.deps.store.get())?.changes.length ?? 1) - 1;
    this.go({ at: "record", change: index, path: "" });
    if (drafted.modelledOn !== void 0) {
      this.notice(`Modelled on ${drafted.modelledOn}. No attacks or flags were copied.`);
    }
  }
  /** Start adjusting a record somebody else owns. */
  patchRecord(file, ref) {
    const existing = openDraft(this.deps.store.get())?.changes.findIndex(
      (c) => c.kind === "patch" && c.file === file && c.ref === ref
    );
    if (existing !== void 0 && existing >= 0) {
      this.go({ at: "record", change: existing, path: "" });
      return;
    }
    this.pushChange({ kind: "patch", file, ref, ops: [] });
    const index = (openDraft(this.deps.store.get())?.changes.length ?? 1) - 1;
    this.go({ at: "record", change: index, path: "" });
  }
  /** Take a record out of the game. Confirmed by the caller, not here. */
  removeRecord(file, ref) {
    this.pushChange({ kind: "remove", file, ref });
    this.notice(`${ref} will be gone from the game once this mod is installed.`, "bad");
  }
  /** Drop one change from the draft entirely. */
  dropChange(index) {
    this.mutate((draft) => ({ ...draft, changes: draft.changes.filter((_, at) => at !== index) }));
    this.go({ at: "details" });
  }
  /** The player put a value at a path. */
  setValue(index, path, value) {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      next[index] = editValue(change, path, value);
      return { ...draft, changes: next };
    });
  }
  /** The player took a field out. */
  clearValue(index, path) {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      next[index] = removeValue(change, path);
      return { ...draft, changes: next };
    });
  }
  /**
   * The player made a gesture that IS an op: a nudge, a flag, a row.
   *
   * Only meaningful against a patch. For a record the player owns there is
   * nothing to compose with, so the op is applied and the result stored.
   */
  applyOp(index, op) {
    this.mutate((draft) => {
      const change = draft.changes[index];
      if (!change) return draft;
      const next = [...draft.changes];
      if (change.kind === "patch") {
        next[index] = recordOp(change, op);
      } else if (change.kind === "add" || change.kind === "replace") {
        try {
          next[index] = { ...change, record: this.deps.api.applyFieldPatch(change.record, [op]) };
        } catch (e) {
          this.notice(String(e), "bad");
          return draft;
        }
      }
      return { ...draft, changes: next };
    });
  }
  /**
   * One numeric op across every record the player filtered down to.
   *
   * The mundane majority of what people mod is a numeric retune, and doing it one
   * record at a time is what stops somebody from bothering. Every one becomes its
   * own `fieldPatches` entry, so the result is an ordinary mod that another mod's
   * unrelated change to the same record still composes with.
   */
  rebalance(file, refs, path, op, value) {
    if (refs.length === 0) return;
    this.mutate((draft) => {
      const changes = [...draft.changes];
      for (const ref of refs) {
        const at = changes.findIndex((c) => c.kind === "patch" && c.file === file && c.ref === ref);
        const made = op === "add" ? opNudge(path, value) : opScale(path, value);
        const found = at >= 0 ? changes[at] : void 0;
        if (found && found.kind === "patch") changes[at] = recordOp(found, made);
        else changes.push({ kind: "patch", file, ref, ops: [made] });
      }
      return { ...draft, changes };
    });
    this.notice(
      `${op === "add" ? "Adjusted" : "Scaled"} ${path} on ${refs.length} record${refs.length === 1 ? "" : "s"}.`,
      "good"
    );
  }
  /* --------------------------------------------------------------- *
   * Files, as text                                                  *
   * --------------------------------------------------------------- */
  /**
   * Open a file in the editor.
   *
   * The buffer remembers the text it was HANDED, which is what makes the check on
   * the way out mean something.
   *
   * A BUFFER WITH NOTHING UNSAVED IN IT IS REFRESHED, and one with unsaved work is
   * not. That distinction is the whole of this method and it was got wrong first
   * time in a way no test in a synthetic document could see: keeping every buffer
   * meant that opening a file, saving it, changing the same record on a wizard
   * screen and opening the file again showed the text from before the wizard
   * change. It looked exactly like the two views having come apart, which is the
   * one thing this feature promises they do not. Found by driving a real browser.
   *
   * Unsaved work is still never thrown away for the crime of clicking a name twice:
   * a dirty buffer is kept as it was, and the stale check on save is what tells the
   * reader that the mod moved underneath it.
   *
   * `line` IS THE JUMP A CROSS-FILE SEARCH RESULT MAKES. It rides along in the
   * route rather than being poked at the editor directly, because the editor
   * for this path may not exist yet - the file screen builds one fresh on
   * every route change, and folding the destination line into the route is
   * what lets that fresh editor land on it as it is built.
   */
  openFile(path, line) {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const text = fileText(this.deps.api, draft, path);
    const route = line === void 0 ? { at: "files", path } : { at: "files", path, line };
    this.deps.store.view((state) => {
      const held = state.buffers[path];
      const dirty = held !== void 0 && held.text !== held.from;
      if (text === void 0 || dirty) return { route };
      return { route, buffers: { ...state.buffers, [path]: { text, from: text } } };
    });
  }
  /** The reader typed. Held outside the document until they save it. */
  editFile(path, text) {
    this.deps.store.view((state) => {
      const held = state.buffers[path];
      if (held === void 0) return {};
      return { buffers: { ...state.buffers, [path]: { ...held, text } } };
    });
  }
  /** Throw away what is in the buffer and show the file as the mod has it. */
  revertFile(path) {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const text = fileText(this.deps.api, draft, path) ?? "";
    this.deps.store.view((state) => ({ buffers: { ...state.buffers, [path]: { text, from: text } } }));
    this.notice(`${path} is back to what the mod says.`, "plain");
  }
  /**
   * Save the buffer into the mod.
   *
   * ONE STORE EDIT, WHICH IS ONE STEP OF UNDO. A saved record file can be a dozen
   * changes at once, and undo here is a stack of whole documents rather than a
   * stack of inverse operations, so the whole save goes back with one press. Putting
   * each parsed change through the store separately would have been the other
   * option and it is the wrong one: it would mean pressing undo twelve times to take
   * back one gesture the reader made once.
   *
   * THE STALE CHECK IS ON THE BYTES THE READER WAS SHOWN. A file's text is derived
   * from the draft, so it moves when the draft does - an undo, or a change made on
   * another screen. Comparing what the file says NOW against what the buffer was
   * opened from is what turns "your work was quietly overwritten" into a question
   * with two answers. It is safe to compare bytes because the derivation is
   * deterministic: the emitter writes the same keys in the same order for the same
   * draft, so a difference is a real difference and never formatting.
   */
  saveFile(path, options = {}) {
    const state = this.deps.store.get();
    const draft = openDraft(state);
    const held = state.buffers[path];
    if (!draft || held === void 0) return false;
    const now = fileText(this.deps.api, draft, path);
    if (options.force !== true && now !== void 0 && now !== held.from) {
      this.notice(
        `${path} has changed in the mod since you opened it here, so saving would write over that change. Save anyway to keep what is in the editor, or reload the file to start from what the mod says.`,
        "bad"
      );
      return false;
    }
    const outcome = writeFileText(this.deps.api, draft, path, held.text);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return false;
    }
    this.mutate(() => outcome.draft);
    const saved = fileText(this.deps.api, openDraft(this.deps.store.get()) ?? outcome.draft, path) ?? held.text;
    this.deps.store.view((current) => ({ buffers: { ...current.buffers, [path]: { text: saved, from: saved } } }));
    this.notice(`Saved ${path}.`, "good");
    return true;
  }
  /** Start a new file of the author's own. Refused for a path the game would not take. */
  createFile(path, contents = "") {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const problem = pathProblem(this.deps.api, draft, path);
    if (problem !== void 0) {
      this.notice(problem, "bad");
      return;
    }
    const outcome = writeFileText(this.deps.api, draft, path, contents);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => ({
      route: { at: "files", path },
      buffers: { ...state.buffers, [path]: { text: contents, from: contents } }
    }));
    this.notice(`${path} is in the mod. It is empty until you write something in it.`, "good");
  }
  /**
   * Start a new file, or replace an existing one of the author's own, with real
   * bytes read from disk - a tile, a font, a sound. `replace` skips the new-path
   * check, because the path is not new.
   *
   * NO TEXT BUFFER IS OPENED. The editor's buffer is a string a textarea can hold,
   * and decoding a PNG's bytes into one would show mojibake and, worse, would let
   * "Save into the mod" re-encode that mojibake as UTF-8 and quietly replace the
   * picture with a different and wrong set of bytes. So the buffer for this path
   * is cleared instead, and the screen reads the file's bytes straight from the
   * draft, the same way it always has for anything it did not open into an editor.
   */
  importFileBytes(path, bytes, options = {}) {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    if (options.replace !== true) {
      const problem = pathProblem(this.deps.api, draft, path);
      if (problem !== void 0) {
        this.notice(problem, "bad");
        return;
      }
    }
    const outcome = writeFileBytes(this.deps.api, draft, path, bytes);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => {
      const buffers = { ...state.buffers };
      delete buffers[path];
      return { route: { at: "files", path }, buffers };
    });
    this.notice(`${path} now holds ${bytes.length} byte${bytes.length === 1 ? "" : "s"} loaded from disk.`, "good");
  }
  /** Take one of the author's own files out of the mod. */
  deleteFile(path) {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const outcome = deleteFile(this.deps.api, draft, path);
    if (!outcome.ok) {
      this.notice(outcome.why, "bad");
      return;
    }
    this.mutate(() => outcome.draft);
    this.deps.store.view((state) => {
      const buffers = { ...state.buffers };
      delete buffers[path];
      return { route: { at: "files", path: "" }, buffers };
    });
    this.notice(`${path} is out of the mod. Undo brings it back.`, "plain");
  }
  /* --------------------------------------------------------------- *
   * Building and shipping                                           *
   * --------------------------------------------------------------- */
  /**
   * Recheck the open draft, on a delay, and discard a stale answer.
   *
   * The revision is captured before the work and compared after it. Without that
   * the pane can show the verdict for a document the player has already changed,
   * which is worse than showing nothing because it looks authoritative.
   */
  scheduleCheck() {
    if (this.checkTimer !== void 0) clearTimeout(this.checkTimer);
    this.checkTimer = setTimeout(() => {
      this.checkTimer = void 0;
      const state = this.deps.store.get();
      const draft = openDraft(state);
      if (!draft) return;
      const revision = state.revision;
      try {
        const build = buildDraft(this.deps.api, draft, this.deps.records);
        if (this.deps.store.get().revision !== revision) return;
        this.deps.store.view(() => ({ verdict: { revision, stale: false, build } }));
      } catch (e) {
        if (this.deps.store.get().revision !== revision) return;
        this.deps.store.view(() => ({ verdict: { revision, stale: false, broke: String(e) } }));
        this.deps.log(`build threw: ${String(e)}`);
      }
    }, CHECK_DELAY);
  }
  /**
   * Recheck NOW, on the way into a screen whose controls depend on the answer.
   *
   * WHY THIS EXISTS BESIDE `scheduleCheck`. The debounce is right for typing: a
   * full build per keystroke is work nobody asked for. It is wrong for arriving,
   * because a screen built during the debounce paints its primary action DISABLED
   * and enables it a quarter of a second later - so the button is grey exactly when
   * the player has just moved their hand to it, and the workshop's own test had to
   * settle twice to click it. Every route change rebuilds the screen from scratch,
   * so that happened on every visit rather than once.
   *
   * Cheap enough to be worth doing on the spot: the build is over one draft's own
   * records, the same work the debounce was going to do anyway, and it is already
   * being done inside a try because a throw here is a workshop bug rather than the
   * mod's.
   */
  checkNow() {
    if (this.checkTimer !== void 0) {
      clearTimeout(this.checkTimer);
      this.checkTimer = void 0;
    }
    const state = this.deps.store.get();
    const draft = openDraft(state);
    if (!draft) return;
    if (state.verdict.revision === state.revision && !state.verdict.stale) return;
    const revision = state.revision;
    try {
      const build = buildDraft(this.deps.api, draft, this.deps.records);
      this.deps.store.view(() => ({ verdict: { revision, stale: false, build } }));
    } catch (e) {
      this.deps.store.view(() => ({ verdict: { revision, stale: false, broke: String(e) } }));
      this.deps.log(`build threw: ${String(e)}`);
    }
  }
  /** The files this draft would write. Recomputed rather than cached. */
  files() {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return [];
    try {
      return emitDraft(this.deps.api, draft);
    } catch (e) {
      this.notice(`The files could not be written: ${String(e)}`, "bad");
      return [];
    }
  }
  /**
   * Hand the player the mod as a file.
   *
   * PRESENT WHETHER OR NOT THE INSTALL SEAM IS. A mod the player is holding is a
   * mod they can open, read, keep, hand to somebody and push to a repository, and
   * a mod that only ever existed inside the browser's storage is none of those.
   * It is also the workshop's honest answer to its own draft storage being able
   * to fail quietly: the file is the save point.
   */
  download() {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const files = this.files();
    if (files.length === 0) return;
    const bytes = zipDraft(files);
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = this.deps.doc.createElement("a");
    link.href = url;
    link.download = `${draft.id}-${draft.version}.zip`;
    this.deps.doc.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e4);
    this.notice(`Saved ${draft.id}-${draft.version}.zip. Add it with Import a zip on the Mods screen.`, "good");
  }
  /** Install it here and now, when the engine offers a door for that. */
  async install() {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    this.deps.writer.flush();
    const files = this.files();
    if (files.length === 0) return;
    const outcome = await this.deps.seams.install.install(zipDraft(files));
    if (outcome.ok) {
      this.notice(
        `${outcome.id} ${outcome.version} is installed and takes effect after the next reload, like any mod you enable.`,
        "good"
      );
    } else {
      this.notice(outcome.problem, "bad");
      for (const line of outcome.lines) this.deps.log(line);
    }
  }
  /**
   * Load it for this session and go and play it. One action.
   *
   * THE SHORTEST HONEST LOOP the workshop has, and it used to be three steps
   * longer than it needed to be. Content composes at load, so a reload is genuinely
   * unavoidable - but the workshop was announcing that in a status line, leaving the
   * player to find the Close button and then press Ctrl-R themselves, while holding
   * a `reload` it never called. Reloading is not a capability anybody grants: a
   * plugin's code runs in the page and can reach `location` either way. So the
   * reload was never the game's to withhold, and asking the player to do by hand
   * something the workshop could do was friction with nothing behind it.
   *
   * WHAT IT IS NOT is a preview. The pack composes into the game exactly as an
   * installed one does, so this is the real mod, and the only thing that is
   * temporary is the archive. What it did to the character who plays it is not, and
   * the button that calls this says so before it is pressed.
   *
   * The drafts are written down FIRST, for the same reason `install` writes them
   * first: what follows is a reload, and an unflushed draft would not survive it.
   */
  async loadForSession() {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const refusal = sessionRefusal(draft);
    if (refusal !== void 0) {
      this.notice(refusal, "bad");
      return;
    }
    this.deps.writer.flush();
    const files = this.files();
    if (files.length === 0) return;
    this.notice(`Forging ${draft.id}...`, "plain");
    const outcome = await this.deps.seams.session.load(zipDraft(files));
    if (!outcome.ok) {
      this.notice(outcome.problem, "bad");
      return;
    }
    if (!outcome.survivesReload) {
      this.notice(
        `${outcome.id} cannot be tried this way here, because this window would lose it in the reload the game needs to pick it up. Save it as a file and install it instead.`,
        "bad"
      );
      return;
    }
    if (this.deps.seams.session.reloadByHand) {
      this.notice(
        `${outcome.id} ${outcome.version} is loaded for this session. Reload the game to play it. It is not in your mods and is gone when you close the game, but anything it does to the character who plays it stays.`,
        "good"
      );
      return;
    }
    this.notice(`${outcome.id} ${outcome.version} is forged. Reloading to play it...`, "good");
    await this.deps.seams.session.reload();
  }
  /** The manifest as it will ship, for the review screen. */
  manifestText() {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return "";
    return `${JSON.stringify(manifestFor(draft), null, 2)}
`;
  }
  /* --------------------------------------------------------------- *
   * Plumbing                                                        *
   * --------------------------------------------------------------- */
  /** The record the editor is currently pointed at, resolved. */
  target(index) {
    const draft = openDraft(this.deps.store.get());
    const change = draft?.changes[index];
    if (!change) return void 0;
    if (change.kind !== "patch") return targetFor(this.deps.api, change, void 0);
    const base = this.findRecord(change.file, change.ref);
    return targetFor(this.deps.api, change, base);
  }
  /** One composed record, by ref. */
  findRecord(file, ref) {
    const key = ref.includes(":") ? ref.split(":")[1] ?? ref : ref;
    for (const record of this.deps.records[file] ?? []) {
      if (this.deps.api.recordKey(file, record) === key) return record;
    }
    return void 0;
  }
  dispose() {
    if (this.checkTimer !== void 0) clearTimeout(this.checkTimer);
    this.checkTimer = void 0;
  }
  pushChange(change) {
    this.mutate((draft) => ({ ...draft, changes: [...draft.changes, change] }));
  }
  mutate(change) {
    const id = this.deps.store.get().openId;
    if (id === void 0) return;
    this.deps.store.edit((drafts) => {
      const draft = drafts[id];
      if (!draft) return drafts;
      const next = change(draft);
      if (next === draft) return drafts;
      return { ...drafts, [id]: { ...next, touched: (/* @__PURE__ */ new Date()).toISOString() } };
    });
    this.persist();
    this.scheduleCheck();
  }
  persist() {
    const state = this.deps.store.get();
    this.deps.writer.queue(state.drafts, state.seenTour);
  }
};

// src/ui/dom.ts
var factory;
function useDocument(doc2) {
  factory = doc2;
}
function doc() {
  if (!factory) throw new Error("useDocument has not been called: there is no document to build elements from");
  return factory;
}
function h(tag, attrs, ...children) {
  const el = doc().createElement(tag);
  if (attrs) apply(el, attrs);
  append(el, children);
  return el;
}
function svg(markup) {
  const ns = "http://www.w3.org/2000/svg";
  const root = doc().createElementNS(ns, "svg");
  root.setAttribute("viewBox", markup.viewBox);
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("focusable", "false");
  if (markup.cls) root.setAttribute("class", markup.cls);
  for (const d of markup.paths) {
    const path = doc().createElementNS(ns, "path");
    path.setAttribute("d", d);
    root.appendChild(path);
  }
  return root;
}
function apply(el, attrs) {
  if (attrs.class !== void 0) el.className = attrs.class;
  if (attrs.text !== void 0) el.textContent = String(attrs.text);
  if (attrs.title !== void 0) el.title = attrs.title;
  if (attrs.tip !== void 0) el.dataset["tip"] = attrs.tip;
  if (attrs.role !== void 0) el.setAttribute("role", attrs.role);
  if (attrs.tabIndex !== void 0) el.tabIndex = attrs.tabIndex;
  if (attrs.href !== void 0 && el instanceof HTMLAnchorElement) el.href = attrs.href;
  if (attrs.download !== void 0 && el instanceof HTMLAnchorElement) el.download = attrs.download;
  if (attrs.spellcheck !== void 0) el.spellcheck = attrs.spellcheck;
  if (el instanceof HTMLOptionElement) {
    if (attrs.value !== void 0) el.value = String(attrs.value);
    if (attrs.disabled !== void 0) el.disabled = attrs.disabled;
  } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (attrs.type !== void 0 && el instanceof HTMLInputElement) el.type = attrs.type;
    if (attrs.value !== void 0) el.value = String(attrs.value);
    if (attrs.placeholder !== void 0 && !(el instanceof HTMLSelectElement)) el.placeholder = attrs.placeholder;
    if (attrs.disabled !== void 0) el.disabled = attrs.disabled;
    if (attrs.checked !== void 0 && el instanceof HTMLInputElement) el.checked = attrs.checked;
    if (el instanceof HTMLInputElement) {
      if (attrs.min !== void 0) el.min = String(attrs.min);
      if (attrs.max !== void 0) el.max = String(attrs.max);
      if (attrs.step !== void 0) el.step = String(attrs.step);
    }
    if (attrs.rows !== void 0 && el instanceof HTMLTextAreaElement) el.rows = attrs.rows;
  } else if (attrs.disabled !== void 0 && el instanceof HTMLButtonElement) {
    el.disabled = attrs.disabled;
  }
  for (const [key, value] of Object.entries(attrs.style ?? {})) el.style.setProperty(key, value);
  for (const [key, value] of Object.entries(attrs.data ?? {})) el.dataset[key] = value;
  for (const [key, value] of Object.entries(attrs.aria ?? {})) el.setAttribute(`aria-${key}`, value);
  for (const [event, handler] of Object.entries(attrs.on ?? {})) el.addEventListener(event, handler);
}
function append(el, children) {
  for (const child of children) {
    if (child === null || child === void 0 || child === false) continue;
    if (Array.isArray(child)) {
      append(el, child);
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(doc().createTextNode(String(child)));
      continue;
    }
    el.appendChild(child);
  }
}
function fill(el, ...children) {
  while (el.firstChild) el.removeChild(el.firstChild);
  append(el, children);
}
function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

// src/ui/tooltip.ts
var HOVER_DELAY = 350;
var GAP = 8;
function installTooltips(root, doc2) {
  const tip = doc2.createElement("div");
  tip.className = "mb-tip";
  tip.setAttribute("role", "tooltip");
  tip.dataset["shown"] = "0";
  root.appendChild(tip);
  let timer;
  let showing;
  const hide = () => {
    if (timer !== void 0) {
      clearTimeout(timer);
      timer = void 0;
    }
    if (showing === void 0) return false;
    showing = void 0;
    tip.dataset["shown"] = "0";
    return true;
  };
  const place2 = (anchor, text) => {
    tip.textContent = text;
    tip.dataset["shown"] = "1";
    showing = anchor;
    const box = anchor.getBoundingClientRect();
    const own = tip.getBoundingClientRect();
    const view = doc2.defaultView;
    const width = view?.innerWidth ?? 1024;
    const height = view?.innerHeight ?? 768;
    let top = box.bottom + GAP;
    if (top + own.height > height - 4) top = Math.max(4, box.top - own.height - GAP);
    let left = box.left;
    if (left + own.width > width - 4) left = Math.max(4, width - own.width - 4);
    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
  };
  const anchorFor = (target) => {
    let node = target instanceof Node ? target : null;
    while (node && node !== root) {
      if (node instanceof HTMLElement) {
        const text = node.dataset["tip"];
        if (text !== void 0 && text !== "") return { el: node, text };
      }
      node = node.parentElement;
    }
    return void 0;
  };
  const onOver = (event) => {
    const found = anchorFor(event.target);
    if (!found) {
      hide();
      return;
    }
    if (showing === found.el) return;
    if (timer !== void 0) clearTimeout(timer);
    timer = setTimeout(() => place2(found.el, found.text), HOVER_DELAY);
  };
  const onOut = () => {
    hide();
  };
  const onFocus = (event) => {
    const found = anchorFor(event.target);
    if (!found) {
      hide();
      return;
    }
    if (timer !== void 0) clearTimeout(timer);
    place2(found.el, found.text);
  };
  const listeners = [
    ["pointerover", onOver],
    ["pointerout", onOut],
    ["focusin", onFocus],
    ["focusout", onOut],
    /* A click means the reader has acted; the explanation is no longer wanted. */
    ["click", onOut]
  ];
  for (const [type, listener] of listeners) root.addEventListener(type, listener, true);
  return {
    hide,
    dispose() {
      hide();
      for (const [type, listener] of listeners) root.removeEventListener(type, listener, true);
      tip.remove();
    }
  };
}

// src/ui/readme-content.ts
var README_SECTIONS = [
  {
    title: "What ModForge is",
    paragraphs: [
      "Pick something that already exists in Angband - a monster, a sword, a shop, a spell - and the workshop shows what it is made of, what its neighbours carry for every number, and what would have to change to make the thing you had in mind.",
      "You do not need to know JSON to use it, but the JSON is always there to read. Every screen can show the exact file it is about to write, and a mod it built can be taken out, edited by hand and brought back."
    ]
  },
  {
    title: "What it does",
    paragraphs: [
      "Adds records: a new monster, item or spell based on something that already exists. It arrives with that record's shape and scale and none of its powers until you add them.",
      "Adjusts records the game already owns, shipping the difference rather than the whole record, so two mods changing different fields of the same thing both keep working.",
      "Retunes a whole file at once, for example making every potion cheaper or every dragon faster. One adjustment applies to everything that matches a filter, and each record gets its own entry.",
      "Checks as you type: a name collision, a field nothing in the file uses, a reference to something no loaded pack defines. Errors, warnings and advice are kept apart."
    ]
  },
  {
    title: "Editing the files directly",
    paragraphs: [
      `Every screen above asks a question and writes the answer into a file. "Edit the files directly", reached from a mod's own page, shows those files. They are the mod itself rather than a copy, so a change made there shows up on every other screen, and the other way round.`
    ]
  },
  {
    title: "The game it reads",
    paragraphs: [
      "On Neo Angband 1.0.0 the workshop reads the authoring SDK and the complete set of records composed for this running game, including enabled content mods. Its suggestions, comparisons and checks are about what is loaded.",
      "When the authoring SDK or the loaded records are missing, as in the standalone preview and some test hosts, the workshop uses a small demonstration set and shows a banner that cannot be dismissed. In the game itself the banner does not appear."
    ]
  },
  {
    title: "Reading more",
    paragraphs: [
      "The SDK tutorials and authoring references are bundled under Docs in the workshop. The full ModForge README and the notes on the engine seams it uses are in the repository this mod ships from, neo-angband-mod-forge."
    ]
  }
];
function readmeElements() {
  return README_SECTIONS.map(
    (section) => h(
      "section",
      { class: "mb-readme-section" },
      h("h3", { text: section.title }),
      ...section.paragraphs.map((p) => h("p", { text: p }))
    )
  );
}

// src/ui/widgets.ts
function card(options) {
  const note = h(options.badge === void 0 ? "span" : "div", { class: "mb-card-note", text: options.note ?? "" });
  const foldable = options.onToggle !== void 0;
  const caret = foldable ? svg({ viewBox: "0 0 8 12", paths: ["M1 1l5 5-5 5z"], cls: "mb-caret" }) : null;
  const title = h("span", { class: "mb-card-title", text: options.title });
  const inside = options.badge === void 0 ? [caret, title, note] : [caret, h("span", { class: "mb-kind-badge", text: options.badge }), h("span", null, title, note)];
  const head = foldable ? h(
    "button",
    {
      class: options.badge === void 0 ? "mb-card-head" : "mb-card-head mb-head-stacked",
      type: "button",
      ...options.tip === void 0 ? {} : { tip: options.tip },
      on: { click: options.onToggle }
    },
    ...inside
  ) : h(
    "div",
    {
      class: options.badge === void 0 ? "mb-card-head" : "mb-card-head mb-head-stacked",
      ...options.tip === void 0 ? {} : { tip: options.tip }
    },
    ...inside
  );
  const body = h("div", { class: "mb-card-body" });
  const el = h("section", { class: "mb-card", data: { open: options.open === false ? "0" : "1" } }, head, body);
  return {
    el,
    body,
    setOpen(open2) {
      el.dataset["open"] = open2 ? "1" : "0";
    },
    setNote(text) {
      note.textContent = text;
    }
  };
}
function empty(glyph, title, blurb, ...actions) {
  const offered = actions.filter((action) => action !== null && action !== void 0);
  return h(
    "div",
    { class: "mb-empty" },
    h("div", { class: "mb-empty-glyph", text: glyph }),
    h("div", { class: "mb-empty-title", text: title }),
    h("div", { class: "mb-empty-blurb", text: blurb }),
    offered.length === 0 ? null : h("div", { class: "mb-empty-actions" }, ...offered)
  );
}
function button(options) {
  const classes = ["mb-btn"];
  if (options.kind) classes.push(`mb-${options.kind}`);
  if (options.tiny) classes.push("mb-tiny");
  if (options.seal) classes.push("mb-seal");
  return h("button", {
    class: classes.join(" "),
    type: "button",
    text: options.label,
    disabled: options.disabled === true,
    ...options.tip === void 0 ? {} : { tip: options.tip },
    ...options.action === void 0 ? {} : { data: { action: options.action } },
    on: { click: options.onClick }
  });
}
function listRow(options) {
  const tags = (options.tags ?? []).map(
    (tag) => h("span", {
      class: "mb-tag",
      text: tag.text,
      ...tag.tone === void 0 ? {} : { data: { tone: tag.tone } },
      ...tag.tip === void 0 ? {} : { tip: tag.tip }
    })
  );
  const acts = h("span", { class: "mb-row-acts" }, tags);
  return h(
    "button",
    {
      class: "mb-listrow",
      type: "button",
      aria: { selected: options.selected === true ? "true" : "false" },
      ...options.tip === void 0 ? {} : { tip: options.tip },
      on: {
        click: (event) => {
          const target = event.target;
          if (target instanceof Element && (target === acts || acts.contains(target))) return;
          options.onClick();
        }
      }
    },
    options.badge === void 0 ? h("span", { class: "mb-badge", text: " " }) : h("span", { class: "mb-badge", text: options.badge }),
    h(
      "span",
      { class: "mb-listrow-main" },
      h("span", { class: "mb-listrow-name", text: options.name }),
      options.meta === void 0 ? null : h("span", { class: "mb-listrow-meta", text: options.meta })
    ),
    acts
  );
}
function searchBox(placeholder2, onInput) {
  return h("input", {
    type: "search",
    placeholder: placeholder2,
    spellcheck: false,
    on: {
      input: (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement) onInput(target.value);
      }
    }
  });
}
function textField(options) {
  const input = options.multiline ? h("textarea", {
    rows: 4,
    value: options.value,
    spellcheck: true,
    ...options.placeholder === void 0 ? {} : { placeholder: options.placeholder }
  }) : h("input", {
    type: "text",
    value: options.value,
    spellcheck: false,
    class: options.mono ? "mb-mono" : "",
    ...options.placeholder === void 0 ? {} : { placeholder: options.placeholder }
  });
  input.addEventListener("input", () => options.onInput(input.value));
  const problem = h("div", { class: "mb-why" });
  problem.style.display = "none";
  const el = h(
    "div",
    { class: "mb-field" },
    h(
      "label",
      { class: "mb-label" },
      h("span", { class: "mb-label-name", text: options.label }),
      options.note === void 0 ? null : h("span", { class: "mb-label-meta", text: options.note })
    ),
    h("div", { class: "mb-control" }, input, problem)
  );
  if (options.tip !== void 0) el.dataset["tip"] = options.tip;
  return {
    el,
    input,
    setProblem(text) {
      if (text === void 0) {
        problem.style.display = "none";
        input.removeAttribute("aria-invalid");
      } else {
        problem.style.display = "";
        problem.textContent = text;
        input.setAttribute("aria-invalid", "true");
      }
    },
    setValue(value) {
      if (input.value !== value && input !== input.ownerDocument.activeElement) input.value = value;
    }
  };
}
function asideSection(title, count) {
  const counter = h("span", { class: "mb-count", text: count ?? "" });
  const body = h("div");
  const el = h(
    "section",
    { class: "mb-aside-section" },
    h("h4", { class: "mb-aside-title" }, title, counter),
    body
  );
  return {
    el,
    body,
    setCount(text) {
      counter.textContent = text;
    }
  };
}
function filePreview(name, contents) {
  const body = typeof contents === "string" ? h("pre", { class: "mb-code", text: contents }) : h("div", { class: "mb-why", text: `Binary, ${contents.length} byte${contents.length === 1 ? "" : "s"}.` });
  return h("div", null, h("div", { class: "mb-filename", text: name }), body);
}
function fillList(container, rows, nothing) {
  if (rows.length === 0) fill(container, nothing);
  else fill(container, ...rows);
}

// src/ui/screens/about.ts
function aboutScreen(shop) {
  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "section",
      { class: "mb-readme-card mb-prose" },
      h("h2", { text: "About ModForge" }),
      ...readmeElements(),
      h(
        "div",
        { class: "mb-row-actions" },
        button({
          label: "Read the Neo Angband SDK docs",
          kind: "primary",
          onClick: () => shop.acts.go({ at: "docs", doc: "tutorial-01" })
        })
      )
    )
  );
  return { el, update: () => void 0, dispose: () => void 0 };
}

// src/model/kinds.ts
var FIELD_GROUPS = [
  "essentials",
  "identity",
  "combat",
  "traits",
  "references",
  "generation",
  "presentation",
  "tables",
  "advanced"
];
var GROUP_TITLES = {
  essentials: "Essentials",
  identity: "Identity and place",
  combat: "Combat and effect",
  traits: "Traits and flags",
  references: "What it points at",
  generation: "Where it turns up",
  presentation: "How it looks and reads",
  tables: "Lists and tables",
  advanced: "Everything else"
};
var GROUP_BLURBS = {
  essentials: "The few fields that decide what this thing is, and the ones to fill in first.",
  identity: "What it is called, what family it belongs to, and roughly where it sits.",
  combat: "What it does in a fight, or what it does when it is used.",
  traits: "Named properties you can tick on or off. This is the safest kind of change, because if another mod ticks a different one, both are kept.",
  references: "Fields that name another record. Naming a record that nothing defines is the most common reason a first mod fails.",
  generation: "How often and how deep the game will produce it on its own.",
  presentation: "The letter, the colour, and the words the player reads.",
  tables: "Fields that hold a list. Adding a row composes with other mods; replacing the list does not.",
  advanced: "Fields the base game rarely uses. Changing them is fine, but they are not the place to start."
};
var FEATURED = [
  {
    file: "object",
    title: "Items",
    blurb: "Weapons, armour, potions, scrolls, rings: anything that can be picked up and carried.",
    badge: "|",
    essentials: ["name", "type", "level", "cost", "weight"],
    featured: true
  },
  {
    file: "monster",
    title: "Creatures",
    blurb: "Each record is one kind of creature you can meet, from a rat to a named unique.",
    badge: "o",
    essentials: ["name", "base", "depth", "hit-points", "speed", "armor-class", "experience"],
    featured: true
  },
  {
    file: "store",
    title: "Shops",
    blurb: "What each shop stocks, who runs it, and how deep their purse is.",
    badge: "1",
    essentials: ["store", "slots", "turnover"],
    featured: true
  },
  {
    file: "class",
    title: "Character classes",
    blurb: "What a Warrior or a Priest can do: their spells, their skills, and what they start with.",
    badge: "@",
    essentials: ["name", "stats", "skill-disarm-phys", "max-attacks"],
    featured: true
  },
  {
    file: "artifact",
    title: "Artifacts",
    blurb: "A one-of-a-kind version of an item the game already has, made by adjusting that item.",
    badge: "*",
    essentials: ["name", "base-object", "level", "cost", "weight"],
    featured: true
  },
  {
    file: "ego_item",
    title: "Item qualities",
    blurb: "The of-Slay-Evil part of an item's name, and which kinds of item it can appear on.",
    badge: "+",
    essentials: ["name", "type", "level", "cost", "rating"],
    featured: true
  },
  {
    file: "monster_base",
    title: "Creature families",
    blurb: "The families creatures belong to. A creature names one and inherits its letter and its feel.",
    badge: "a",
    essentials: ["name", "glyph", "pain", "desc"],
    featured: true
  },
  {
    file: "p_race",
    title: "Player races",
    blurb: "What a Dwarf or a Hobbit starts with, and what they are good at.",
    badge: "h",
    essentials: ["name", "stats", "hitdie", "exp"],
    featured: true
  },
  {
    file: "terrain",
    title: "Terrain",
    blurb: "Floors, walls, doors, rubble and stairs: what a square of the dungeon is.",
    badge: "#",
    essentials: ["name", "code", "graphics", "flags"],
    featured: true
  },
  {
    file: "trap",
    title: "Traps",
    blurb: "What is waiting on the floor, and what it does when it goes off.",
    badge: "^",
    essentials: ["name", "graphics", "rarity", "effect"],
    featured: true
  },
  {
    file: "monster_spell",
    title: "Creature spells",
    blurb: "What a caster can throw at you, and what the player is told when it lands.",
    badge: "?",
    essentials: ["name", "hit", "effect", "lore"],
    featured: true
  },
  {
    file: "brand",
    title: "Brands and slays",
    blurb: "A weapon that burns, or that bites harder into one kind of creature.",
    badge: "!",
    essentials: ["code", "name", "verb", "multiplier"],
    featured: true
  }
];
var BY_FILE = new Map(FEATURED.map((kind) => [kind.file, kind]));
function contentKinds(api) {
  const out = [];
  for (const kind of FEATURED) {
    if (api.blueprintFor(kind.file) !== void 0) out.push(kind);
  }
  for (const file of api.BLUEPRINT_FILES) {
    if (BY_FILE.has(file)) continue;
    if (!composable(file)) continue;
    out.push(generic(api, file));
  }
  return out;
}
function composable(file) {
  return file !== "constants" && file !== "visuals" && file !== "history";
}
function generic(api, file) {
  const blurb = api.describeFile(file).split("\n")[0] ?? `Records in ${file}.json.`;
  const usage = api.fieldUsage(file);
  const essentials = usage.filter((entry) => entry.share >= 0.9).slice(0, 6).map((entry) => entry.name);
  return {
    file,
    title: humanFile(file),
    blurb,
    badge: (file[0] ?? "?").toUpperCase(),
    essentials: essentials.length > 0 ? essentials : ["name"],
    featured: false
  };
}
function humanFile(file) {
  const words = file.split("_");
  const first = words[0] ?? file;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...words.slice(1)].join(" ");
}
function kindFor(api, file) {
  return BY_FILE.get(file) ?? generic(api, file);
}
var NAME_RULES = [
  { group: "presentation", test: /^(desc|graphics|color|colour|glyph|msg|lore|verb|message|name-|text)/ },
  { group: "generation", test: /^(alloc|rarity|depth|level|common|minmax|turnover|slots|freq|prob|weight-)/ },
  { group: "combat", test: /^(attack|armor|armour|blow|effect|damage|dice|hit|to-|multiplier|power|rating|mana|fail)/ },
  { group: "traits", test: /^(flags|values|flags-off|resist|ignore|curse|brand|slay)/ },
  { group: "references", test: /^(base|type|code|base-object|item|kind|store|body|shape|mimic|friends|drop|act)/ }
];
var TABLE_KINDS = /* @__PURE__ */ new Set(["array"]);
function groupOf(kind, field, shape) {
  if (kind.essentials.includes(field)) return "essentials";
  for (const rule of NAME_RULES) {
    if (rule.test.test(field)) return rule.group;
  }
  if (shape) {
    const first = shape.types[0];
    if (first !== void 0 && TABLE_KINDS.has(first)) return "tables";
    if (first === "object") return "tables";
    if (shape.count > 0) return "identity";
  }
  return "advanced";
}
function groupFields(api, kind, present, showAll) {
  const blueprint = api.blueprintFor(kind.file);
  const known = blueprint ? Object.keys(blueprint.fields) : [];
  const universe = showAll ? [.../* @__PURE__ */ new Set([...present, ...known])] : [.../* @__PURE__ */ new Set([...present, ...kind.essentials])];
  const out = /* @__PURE__ */ new Map();
  for (const group of FIELD_GROUPS) out.set(group, []);
  for (const field of universe) {
    const group = groupOf(kind, field, blueprint?.fields[field]);
    out.get(group)?.push(field);
  }
  for (const group of FIELD_GROUPS) {
    const list = out.get(group);
    if (!list) continue;
    if (group === "essentials") {
      list.sort((a, b) => kind.essentials.indexOf(a) - kind.essentials.indexOf(b));
    } else list.sort((a, b) => a.localeCompare(b));
    if (list.length === 0) out.delete(group);
  }
  return out;
}

// src/ui/screens/base.ts
var PAGE = 120;
function baseScreen(shop, file, mode) {
  const kind = kindFor(shop.api, file);
  const all = shop.records[file] ?? [];
  const peerField = peerFieldFor(shop, file);
  const list = h("div", { class: "mb-list" });
  const search = searchBox(
    `filter ${all.length} record${all.length === 1 ? "" : "s"}`,
    (value) => shop.acts.setFilter(value)
  );
  const more = button({
    label: "Show more",
    kind: "ghost",
    onClick: () => {
      shown += PAGE;
      render(shop.store.get());
    }
  });
  const blankButton = () => button({
    label: "Start from nothing instead",
    kind: "ghost",
    tip: "A record with only the fields the game's own records always carry, filled with typical values. Useful when nothing existing is close to what you have in mind.",
    onClick: () => shop.acts.addRecord(file, {})
  });
  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: mode === "new" ? `Base your ${singular(kind.title)} on something` : `Which ${singular(kind.title)}?` }),
      h("p", {
        text: mode === "new" ? "The workshop fills in a new record from the one you pick, using its shape, its scale and the values its neighbours in the game carry. It does not copy attacks, flags, spells or anything else that would hand out powers you did not ask for." : "Your mod will ship the difference rather than the record, so the base game keeps owning it and two mods adjusting different fields of it both work."
      })
    ),
    h("div", { class: "mb-row-actions" }, search, mode === "new" ? blankButton() : null),
    list,
    more
  );
  let shown = PAGE;
  const render = (state) => {
    const needle = state.filter.trim().toLowerCase();
    const matches = needle === "" ? all : all.filter((r) => labelOf(shop.api, file, r).toLowerCase().includes(needle));
    const page = matches.slice(0, shown);
    more.style.display = matches.length > page.length ? "" : "none";
    more.textContent = `Show more (${matches.length - page.length} left)`;
    const rows = page.map((record) => rowFor(record));
    fillList(
      list,
      rows,
      all.length === 0 ? empty(
        "[ ]",
        "Nothing to base one on",
        `Nothing is loaded in ${file}, so there is no record here to copy or adjust.`,
        mode === "new" ? blankButton() : null,
        button({ label: "Choose another kind", kind: "ghost", onClick: () => shop.acts.go({ at: "kinds" }) })
      ) : empty(
        "?",
        "Nothing matches",
        "No record in this file has that in its name.",
        button({
          label: "Clear the filter",
          kind: "primary",
          onClick: () => {
            search.value = "";
            shop.acts.setFilter("");
          }
        })
      )
    );
  };
  const rowFor = (record) => {
    const owner = ownerOf(shop.api, record);
    const key = shop.api.recordKey(file, record);
    const label = labelOf(shop.api, file, record);
    const notes = [];
    if (peerField !== void 0) {
      const value = record[peerField];
      if (typeof value === "string" || typeof value === "number") notes.push(`${peerField} ${String(value)}`);
    }
    for (const depth of ["depth", "level"]) {
      const value = record[depth];
      if (typeof value === "number") {
        notes.push(`${depth} ${value}`);
        break;
      }
    }
    const row2 = listRow({
      badge: kind.badge,
      name: label,
      meta: notes.join(", "),
      tags: owner === "core" ? [] : [
        {
          text: owner,
          tone: "mod",
          tip: `This record belongs to the "${owner}" mod. Using it means your mod depends on that mod, and the workshop will write that down for you. Somebody without it installed gets nothing from yours.`
        }
      ],
      onClick: () => {
        if (mode === "new") seedFrom(record);
        else if (key !== null) shop.acts.patchRecord(file, `${owner}:${key}`);
        else shop.acts.notice("That record has no identity the game can address, so it cannot be adjusted.", "bad");
      }
    });
    if (shop.seams.wizard.api !== void 0 && mode === "new") {
      row2.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Look at it",
          tiny: true,
          kind: "ghost",
          tip: "Put this in front of you in the game, so you can see what you are copying before you copy it.",
          onClick: () => shop.acts.go({ at: "test" })
        })
      );
    }
    if (mode === "change" && key !== null) {
      row2.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Remove",
          tiny: true,
          kind: "danger",
          tip: `Take ${owner}:${key} out of the game entirely. Anything else that names it stops resolving, including another mod's changes to it. Undo brings it back.`,
          onClick: () => shop.acts.removeRecord(file, `${owner}:${key}`)
        })
      );
    }
    return row2;
  };
  const seedFrom = (record) => {
    const seed = {};
    if (peerField !== void 0) {
      const value = record[peerField];
      if (value !== void 0) seed[peerField] = value;
    }
    for (const depth of ["depth", "level"]) {
      const value = record[depth];
      if (typeof value === "number") {
        seed[depth] = value;
        break;
      }
    }
    shop.acts.addRecord(file, seed);
  };
  render(shop.store.get());
  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) {
        shown = PAGE;
        render(next);
      }
    },
    dispose: () => void 0
  };
}
function peerFieldFor(shop, file) {
  const sample = (shop.records[file] ?? [])[0];
  if (!sample) return void 0;
  const said = shop.api.peersFor(file, sample, shop.records).because;
  for (const field of Object.keys(sample)) {
    if (said.includes(`${field} is`)) return field;
  }
  return void 0;
}
function singular(title) {
  return title.endsWith("s") ? title.slice(0, -1).toLowerCase() : title.toLowerCase();
}

// src/ui/screens/details.ts
function detailsScreen(shop) {
  const el = h("div", { class: "mb-main" });
  const draft = openDraft(shop.store.get());
  if (!draft) {
    el.appendChild(
      empty(
        "?",
        "No mod is open",
        "Every screen after this one is about one mod, so the list is where to start.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) })
      )
    );
    return { el, update: () => void 0, dispose: () => void 0 };
  }
  const name = textField({
    label: "name",
    value: draft.name,
    note: "shown in the mod manager",
    tip: "What a player sees in the list of mods. Free text: capitals, spaces and punctuation are all fine.",
    onInput: (value) => shop.acts.setDetails({ name: value })
  });
  const version = textField({
    label: "version",
    value: draft.version,
    mono: true,
    note: "three numbers",
    tip: "Three numbers with dots between them, like 0.1.0. Anything else is refused before the mod is read.",
    onInput: (value) => shop.acts.setDetails({ version: value })
  });
  const author = textField({
    label: "author",
    value: draft.author,
    note: "required",
    tip: "A mod with nobody's name on it is refused at install. Any name will do; it does not have to be your legal one.",
    onInput: (value) => shop.acts.setDetails({ author: value })
  });
  const repository = textField({
    label: "repository",
    value: draft.repository,
    mono: true,
    note: "required, and pinned forever",
    tip: "The first time this mod is installed, the game records where it came from and refuses any later install that claims somewhere else. Leave it as the local address unless you own the repository you name.",
    onInput: (value) => shop.acts.setDetails({ repository: value })
  });
  const license = textField({
    label: "license",
    value: draft.license,
    mono: true,
    note: "recommended",
    tip: "What somebody else may do with this. GPL-2.0-only matches the game and the other mods in its family.",
    onInput: (value) => shop.acts.setDetails({ license: value })
  });
  const engine = textField({
    label: "engine",
    value: draft.engine,
    mono: true,
    note: "required",
    tip: "Which builds of the game this was written against. Give a minimum rather than an exact version, because a mod pinned to one release gets a warning on every update. The workshop will not write a range that excludes the build you are running.",
    onInput: (value) => shop.acts.setDetails({ engine: value })
  });
  const description = textField({
    label: "description",
    value: draft.description,
    multiline: true,
    note: "recommended",
    tip: "The paragraph the mod manager shows. Say what it changes and what it leaves alone.",
    onInput: (value) => shop.acts.setDetails({ description: value })
  });
  const detailsCard = card({
    title: "This mod",
    note: "the manifest, as it will ship",
    open: true
  });
  detailsCard.body.append(
    name.el,
    version.el,
    author.el,
    repository.el,
    license.el,
    engine.el,
    description.el
  );
  const derived = h("div", { class: "mb-prose" });
  const derivedCard = card({ title: "Written for you", note: "worked out from your changes", open: true });
  derivedCard.body.appendChild(derived);
  const changesList = h("div", { class: "mb-list" });
  const changesCard = card({ title: "What is in it", open: true });
  changesCard.body.appendChild(changesList);
  const actions = h(
    "div",
    { class: "mb-row-actions" },
    button({ label: "Add or change something", kind: "primary", onClick: () => shop.acts.go({ at: "kinds" }) }),
    button({ label: "Review it", onClick: () => shop.acts.go({ at: "verdict" }) }),
    /* THE WAY OUT OF THE WIZARD, offered next to the way through it rather than
     * hidden behind a setting. Somebody who wants a script, a manifest key no field
     * here asks about, or a record file grouped into sections has outgrown these
     * screens and should not have to guess that there is anywhere else to go. It is
     * last in the row because it is the advanced door and not the front one. */
    button({
      label: "Edit the files directly",
      tip: "The same mod, as the text files it ships. Everything on this screen is in them, and saving one puts what you wrote back into the mod. It is also the only way to add a script, a manifest key no screen offers, or a record file grouped into sections.",
      onClick: () => shop.acts.go({ at: "files", path: "" })
    }),
    shop.seams.wizard.api !== void 0 ? button({
      label: "Test it in the game",
      tip: "Go where this mod's content belongs, put some in front of you, and look at it.",
      onClick: () => shop.acts.go({ at: "test" })
    }) : null
  );
  el.append(detailsCard.el, derivedCard.el, changesCard.el, actions);
  const render = (state) => {
    const current = openDraft(state);
    if (!current) return;
    name.setValue(current.name);
    version.setValue(current.version);
    author.setValue(current.author);
    repository.setValue(current.repository);
    license.setValue(current.license);
    engine.setValue(current.engine);
    description.setValue(current.description);
    name.setProblem(current.name.trim() === "" ? "A mod with no name is refused before it is read." : void 0);
    version.setProblem(VERSION_RE2.test(current.version) ? void 0 : "Three numbers with dots, like 0.1.0.");
    author.setProblem(current.author.trim() === "" ? "Required: a mod with no author is refused at install." : void 0);
    repository.setProblem(
      /^(?:[a-z][a-z0-9+.-]*:\/\/|git@)/.test(current.repository) ? void 0 : "Required, and it has to look like an address: local://something, or a real https:// URL you own."
    );
    let fits;
    try {
      fits = shop.api.satisfies(shop.seams.engine, current.engine);
    } catch {
      fits = void 0;
    }
    engine.setProblem(
      fits === true ? void 0 : fits === void 0 ? `This is not a version range the game can read. Write one such as >=${shop.seams.engine}.` : `This range excludes the build you are running (${shop.seams.engine}), so you could not install what you are making.`
    );
    const idProblem = ID_RE2.test(current.id) ? "" : ` The id "${current.id}" is not one the game will accept.`;
    const deps = Object.keys(dependenciesFor(allChanges(current)));
    derived.replaceChildren(
      h("p", null, "id ", h("code", { text: current.id }), ", which is also the folder name.", idProblem),
      h(
        "p",
        null,
        "group ",
        h("code", { text: groupFor(allChanges(current)) }),
        groupFor(allChanges(current)) === "content" ? ", because this mod adds records. Adding mods load before the ones that only adjust things." : ", because this mod only adjusts records that already exist, so it wants to load after the mods that add them."
      ),
      deps.length === 0 ? h("p", { text: "No dependencies, because nothing here touches anybody else's records yet." }) : h(
        "p",
        null,
        "depends on ",
        ...deps.flatMap((id, at) => [at === 0 ? "" : ", ", h("code", { text: id })]),
        ". A mod may only adjust a record whose owner it names as a dependency. Without that, the change is refused silently while the rest of the mod still loads, so the workshop writes these down as soon as you pick something to change."
      )
    );
    const rows = current.changes.map((change, index) => {
      const kindLabel = change.kind === "add" ? "new" : change.kind === "patch" ? `${change.ops.length} adjustment${change.ops.length === 1 ? "" : "s"}` : change.kind === "replace" ? "replaced whole" : "removed";
      const label = change.kind === "add" ? draftLabel(shop.api, change.file, change.record) : change.ref;
      const row2 = listRow({
        badge: change.file.charAt(0).toUpperCase(),
        name: label,
        meta: `${change.file} - ${kindLabel}`,
        tags: change.kind === "remove" ? [{ text: "removes", tone: "mod" }] : [],
        onClick: () => {
          if (change.kind === "remove") shop.acts.notice("A removal has nothing to edit. Drop it to undo it.", "plain");
          else shop.acts.go({ at: "record", change: index, path: "" });
        }
      });
      row2.querySelector(".mb-row-acts")?.appendChild(
        button({
          label: "Drop",
          tiny: true,
          kind: "danger",
          tip: "Take this change out of the mod. Undo brings it back.",
          onClick: () => shop.acts.dropChange(index)
        })
      );
      return row2;
    });
    fillList(
      changesList,
      rows,
      empty(
        "[ ]",
        "Nothing in it yet",
        "The manifest above is the one this mod will ship, but so far the mod changes nothing.",
        button({
          label: "Add or change something",
          kind: "primary",
          onClick: () => shop.acts.go({ at: "kinds" })
        })
      )
    );
  };
  render(shop.store.get());
  return {
    el,
    update(next, prev) {
      if (next.drafts !== prev.drafts || next.openId !== prev.openId) render(next);
    },
    dispose: () => void 0
  };
}

// src/model/diff.ts
var CELL_CEILING = 4e6;
function diffLines(before, after) {
  const a = before === "" ? [] : before.split("\n");
  const b = after === "" ? [] : after.split("\n");
  const n = a.length;
  const m = b.length;
  if (n * m > CELL_CEILING) {
    const ops2 = [
      ...a.map((text, i2) => ({ kind: "remove", text, beforeLine: i2 + 1 })),
      ...b.map((text, i2) => ({ kind: "add", text, afterLine: i2 + 1 }))
    ];
    return { ops: ops2, truncated: true };
  }
  const dp = [];
  for (let i2 = 0; i2 <= n; i2++) dp.push(new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      dp[i2][j2] = a[i2] === b[j2] ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "same", text: a[i], beforeLine: i + 1, afterLine: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: "remove", text: a[i], beforeLine: i + 1 });
      i++;
    } else {
      ops.push({ kind: "add", text: b[j], afterLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    ops.push({ kind: "remove", text: a[i], beforeLine: i + 1 });
    i++;
  }
  while (j < m) {
    ops.push({ kind: "add", text: b[j], afterLine: j + 1 });
    j++;
  }
  return { ops, truncated: false };
}
function diffSummary(ops) {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.kind === "add") added++;
    else if (op.kind === "remove") removed++;
  }
  return { added, removed };
}
var DIFF_CONTEXT = 3;
function diffRows(ops, context = DIFF_CONTEXT) {
  const n = ops.length;
  const keep = new Array(n).fill(false);
  for (let i2 = 0; i2 < n; i2++) {
    if (ops[i2].kind === "same") continue;
    for (let k = Math.max(0, i2 - context); k <= Math.min(n - 1, i2 + context); k++) keep[k] = true;
  }
  const rows = [];
  let i = 0;
  while (i < n) {
    if (!keep[i]) {
      let j = i;
      while (j < n && !keep[j]) j++;
      rows.push({ kind: "gap", count: j - i });
      i = j;
      continue;
    }
    const op = ops[i];
    rows.push(
      op.kind === "same" ? { kind: "context", text: op.text, beforeLine: op.beforeLine, afterLine: op.afterLine } : op.kind === "add" ? { kind: "add", text: op.text, afterLine: op.afterLine } : { kind: "remove", text: op.text, beforeLine: op.beforeLine }
    );
    i++;
  }
  return rows;
}

// src/ui/screens/diff.ts
function diffScreen(shop, path) {
  const main = h("div", { class: "mb-main" });
  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "There is nothing to compare until a mod is open.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) })
      )
    );
    return { el: main, update: () => void 0, dispose: () => void 0 };
  }
  const back = button({ label: "Back to the file", onClick: () => shop.acts.go({ at: "files", path }) });
  const headline = h("div", { class: "mb-prose" });
  const summary = h("div", { class: "mb-why" });
  const body = h("div", { class: "mb-diff" });
  main.append(
    h("div", { class: "mb-row-actions" }, back),
    headline,
    summary,
    body
  );
  const render = (state) => {
    const current = openDraft(state);
    if (!current) return;
    const file = projectFiles(shop.api, current).find((entry) => entry.path === path);
    if (file === void 0) {
      headline.replaceChildren(h("h2", { text: path }));
      summary.textContent = "That file is not in the mod any more, so there is nothing left to compare.";
      body.replaceChildren();
      return;
    }
    headline.replaceChildren(h("h2", { text: path }));
    if (isBinary(file.contents)) {
      summary.textContent = "This file holds raw bytes, not text, so there is nothing here to diff.";
      body.replaceChildren();
      return;
    }
    const before = file.contents;
    const after = state.buffers[path]?.text ?? before;
    if (after === before) {
      summary.textContent = "The editor's text matches the mod's saved file, so there are no unsaved changes to compare.";
      body.replaceChildren();
      return;
    }
    const { ops, truncated } = diffLines(before, after);
    const { added, removed } = diffSummary(ops);
    const counts = `${added} line${added === 1 ? "" : "s"} added, ${removed} line${removed === 1 ? "" : "s"} removed`;
    summary.textContent = truncated ? `${path} is too big to compare line by line, so the whole file is shown as removed and added below. ${counts}.` : `Comparing the mod's saved file against what is in the editor now. ${counts}.`;
    body.replaceChildren(...diffRows(ops).map(rowEl));
  };
  render(shop.store.get());
  return {
    el: main,
    update(next, prev) {
      if (next.drafts !== prev.drafts || next.buffers !== prev.buffers || next.openId !== prev.openId) render(next);
    },
    dispose: () => void 0
  };
}
function rowEl(row2) {
  if (row2.kind === "gap") {
    return h("div", { class: "mb-diff-gap", text: `... ${row2.count} unchanged line${row2.count === 1 ? "" : "s"} ...` });
  }
  const marker = row2.kind === "add" ? "+" : row2.kind === "remove" ? "-" : " ";
  return h(
    "div",
    { class: "mb-diff-row", data: { kind: row2.kind } },
    h("span", { class: "mb-diff-num", text: row2.beforeLine !== void 0 ? String(row2.beforeLine) : "" }),
    h("span", { class: "mb-diff-num", text: row2.afterLine !== void 0 ? String(row2.afterLine) : "" }),
    h("span", { class: "mb-diff-marker", text: marker }),
    h("span", { class: "mb-diff-text", text: row2.text })
  );
}

// src/model/syntax.ts
function languageFor(path) {
  const dot = path.lastIndexOf(".");
  const ext = dot < 0 ? "" : path.slice(dot + 1).toLowerCase();
  switch (ext) {
    case "json":
      return "json";
    case "js":
    case "mjs":
    case "cjs":
      return "js";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return "text";
  }
}
function lineStarts(text) {
  const out = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") out.push(i + 1);
  }
  return out;
}
function positionAt(text, offset) {
  const at = Math.max(0, Math.min(offset, text.length));
  const starts = lineStarts(text);
  let line = starts.length - 1;
  while (line > 0 && (starts[line] ?? 0) > at) line--;
  return { line: line + 1, column: at - (starts[line] ?? 0) + 1 };
}
function offsetAt(text, line, column = 1) {
  const starts = lineStarts(text);
  const start = starts[Math.max(0, Math.min(line - 1, starts.length - 1))] ?? 0;
  const end = text.indexOf("\n", start);
  const limit = end < 0 ? text.length : end;
  return Math.max(start, Math.min(start + column - 1, limit));
}
function tokenize(lang, text) {
  switch (lang) {
    case "json":
      return tokenizeJson(text);
    case "js":
      return tokenizeJs(text);
    case "markdown":
      return tokenizeMarkdown(text);
    case "text":
      return [];
  }
}
var WHITESPACE = /* @__PURE__ */ new Set([" ", "	", "\r", "\n"]);
function isDigit(ch) {
  return ch !== void 0 && ch >= "0" && ch <= "9";
}
function isWordStart(ch) {
  return ch !== void 0 && (/[A-Za-z_$]/.test(ch) || ch.charCodeAt(0) > 127);
}
function isWord(ch) {
  return isWordStart(ch) || isDigit(ch);
}
function scanQuoted(text, at, quote, stopAtNewline) {
  let i = at + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return { to: i + 1, closed: true };
    if (stopAtNewline && ch === "\n") return { to: i, closed: false };
    i++;
  }
  return { to: text.length, closed: false };
}
function tokenizeJson(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (WHITESPACE.has(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      const run = scanQuoted(text, i, '"', true);
      let ahead = run.to;
      while (ahead < text.length && WHITESPACE.has(text[ahead])) ahead++;
      out.push({ at: i, to: run.to, cls: text[ahead] === ":" ? "key" : "str" });
      i = run.to;
      continue;
    }
    if (isDigit(ch) || ch === "-" && isDigit(text[i + 1])) {
      let j = i + 1;
      while (j < text.length && /[0-9eE+.\-]/.test(text[j])) j++;
      out.push({ at: i, to: j, cls: "num" });
      i = j;
      continue;
    }
    if (isWordStart(ch)) {
      let j = i;
      while (j < text.length && isWord(text[j])) j++;
      const word = text.slice(i, j);
      out.push({ at: i, to: j, cls: word === "true" || word === "false" || word === "null" ? "lit" : "punc" });
      i = j;
      continue;
    }
    if ("{}[],:".includes(ch)) {
      out.push({ at: i, to: i + 1, cls: "punc" });
      i++;
      continue;
    }
    i++;
  }
  return out;
}
var JS_KEYWORDS = /* @__PURE__ */ new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "of",
  "return",
  "set",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield"
]);
var JS_LITERALS = /* @__PURE__ */ new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);
function scanTemplate(text, at) {
  let i = at + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "`") return { to: i + 1, closed: true };
    if (ch === "$" && text[i + 1] === "{") {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        const inner = text[i];
        if (inner === "`") {
          const nested = scanTemplate(text, i);
          i = nested.to;
          continue;
        }
        if (inner === "{") depth++;
        else if (inner === "}") depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return { to: text.length, closed: false };
}
function regexAllowed(before) {
  return before !== "value";
}
function tokenizeJs(text) {
  const out = [];
  let before = "start";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (WHITESPACE.has(ch)) {
      i++;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      const end = text.indexOf("\n", i);
      const to = end < 0 ? text.length : end;
      out.push({ at: i, to, cls: "com" });
      i = to;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const to = end < 0 ? text.length : end + 2;
      out.push({ at: i, to, cls: "com" });
      i = to;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const run = scanQuoted(text, i, ch, true);
      out.push({ at: i, to: run.to, cls: "str" });
      i = run.to;
      before = "value";
      continue;
    }
    if (ch === "`") {
      const run = scanTemplate(text, i);
      out.push({ at: i, to: run.to, cls: "str" });
      i = run.to;
      before = "value";
      continue;
    }
    if (ch === "/" && regexAllowed(before)) {
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < text.length) {
        const c = text[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "\n") break;
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          closed = true;
          j++;
          break;
        }
        j++;
      }
      if (closed) {
        while (j < text.length && /[dgimsuvy]/.test(text[j])) j++;
        out.push({ at: i, to: j, cls: "str" });
        i = j;
        before = "value";
        continue;
      }
    }
    if (isDigit(ch) || ch === "." && isDigit(text[i + 1])) {
      let j = i + 1;
      while (j < text.length && /[0-9a-fA-FxXoObBeE_.+-]/.test(text[j])) {
        if ((text[j] === "+" || text[j] === "-") && !/[eE]/.test(text[j - 1] ?? "")) break;
        j++;
      }
      if (text[j] === "n") j++;
      out.push({ at: i, to: j, cls: "num" });
      i = j;
      before = "value";
      continue;
    }
    if (isWordStart(ch)) {
      let j = i;
      while (j < text.length && isWord(text[j])) j++;
      const word = text.slice(i, j);
      const keyword = JS_KEYWORDS.has(word);
      const cls = JS_LITERALS.has(word) ? "lit" : keyword ? "kw" : "punc";
      if (cls !== "punc") out.push({ at: i, to: j, cls });
      i = j;
      before = keyword && !JS_LITERALS.has(word) ? "operator" : "value";
      continue;
    }
    if ("{}[]()".includes(ch)) {
      out.push({ at: i, to: i + 1, cls: "punc" });
      i++;
      before = ch === ")" || ch === "]" ? "value" : "operator";
      continue;
    }
    i++;
    before = "operator";
  }
  return out;
}
function tokenizeMarkdown(text) {
  const out = [];
  const starts = lineStarts(text);
  let fenced = false;
  for (let n = 0; n < starts.length; n++) {
    const start = starts[n] ?? 0;
    const next = starts[n + 1];
    const end = next === void 0 ? text.length : next - 1;
    const line = text.slice(start, end);
    if (/^\s*(?:```|~~~)/.test(line)) {
      out.push({ at: start, to: end, cls: "code" });
      fenced = !fenced;
      continue;
    }
    if (fenced) {
      out.push({ at: start, to: end, cls: "code" });
      continue;
    }
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      out.push({ at: start, to: end, cls: "head" });
      continue;
    }
    if (/^\s*>/.test(line)) {
      out.push({ at: start, to: end, cls: "com" });
      continue;
    }
    const bullet = /^(\s*(?:[-*+]|\d+\.)\s)/.exec(line);
    if (bullet?.[1] !== void 0) out.push({ at: start, to: start + bullet[1].length, cls: "punc" });
    const inline = /`[^`\n]+`/g;
    let hit;
    while ((hit = inline.exec(line)) !== null) {
      out.push({ at: start + hit.index, to: start + hit.index + hit[0].length, cls: "code" });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
var OPENERS = "{[(";
var CLOSERS = "}])";
var PARTNER = { "{": "}", "[": "]", "(": ")", "}": "{", "]": "[", ")": "(" };
function literalMask(text, tokens) {
  const mask = new Uint8Array(text.length);
  for (const token of tokens) {
    if (token.cls !== "str" && token.cls !== "com" && token.cls !== "code") continue;
    const to = Math.min(token.to, text.length);
    for (let i = Math.max(0, token.at); i < to; i++) mask[i] = 1;
  }
  return mask;
}
function matchingBrackets(lang, text, caret) {
  if (lang === "markdown" || lang === "text") return [];
  const mask = literalMask(text, tokenize(lang, text));
  for (const at of [caret, caret - 1]) {
    if (at < 0 || at >= text.length) continue;
    const ch = text[at];
    if (!OPENERS.includes(ch) && !CLOSERS.includes(ch)) continue;
    if (mask[at] === 1) continue;
    const partner = findPartner(text, mask, at, ch);
    if (partner >= 0) return [at, partner];
    return [];
  }
  return [];
}
function findPartner(text, mask, at, ch) {
  const want = PARTNER[ch];
  const step = OPENERS.includes(ch) ? 1 : -1;
  let depth = 0;
  for (let i = at; i >= 0 && i < text.length; i += step) {
    const c = text[i];
    if ((OPENERS.includes(c) || CLOSERS.includes(c)) && mask[i] !== 1) {
      if (c === ch) depth++;
      else if (c === want) {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}
function problemsIn(lang, text) {
  switch (lang) {
    case "json":
      return jsonProblems(text);
    case "js":
      return jsProblems(text);
    default:
      return [];
  }
}
function jsonProblems(text) {
  if (text.trim() === "") return [];
  try {
    JSON.parse(text);
    return [];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const spot = /line (\d+) column (\d+)/.exec(message);
    if (spot?.[1] !== void 0 && spot[2] !== void 0) {
      return [{ line: Number(spot[1]), column: Number(spot[2]), message: tidy(message) }];
    }
    const offset = /position (\d+)/.exec(message);
    const at = offset?.[1] !== void 0 ? Number(offset[1]) : jsonFault(text);
    const where = positionAt(text, at);
    return [{ line: where.line, column: where.column, message: tidy(message) }];
  }
}
function jsonFault(text) {
  const tokens = tokenizeJson(text);
  let at = 0;
  const fault = () => tokens[at]?.at ?? text.length;
  const isPunc = (ch) => {
    const token = tokens[at];
    return token !== void 0 && token.cls === "punc" && text.slice(token.at, token.to) === ch;
  };
  const value = () => {
    const token = tokens[at];
    if (token === void 0) return text.length;
    if (token.cls === "str" || token.cls === "key" || token.cls === "num" || token.cls === "lit") {
      at++;
      return -1;
    }
    if (isPunc("{")) return object();
    if (isPunc("[")) return array();
    return fault();
  };
  const object = () => {
    at++;
    if (isPunc("}")) {
      at++;
      return -1;
    }
    for (; ; ) {
      const name = tokens[at];
      if (name === void 0) return text.length;
      if (name.cls !== "key" && name.cls !== "str") return fault();
      at++;
      if (!isPunc(":")) return fault();
      at++;
      const bad2 = value();
      if (bad2 !== -1) return bad2;
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("}")) {
        at++;
        return -1;
      }
      return fault();
    }
  };
  const array = () => {
    at++;
    if (isPunc("]")) {
      at++;
      return -1;
    }
    for (; ; ) {
      const bad2 = value();
      if (bad2 !== -1) return bad2;
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("]")) {
        at++;
        return -1;
      }
      return fault();
    }
  };
  const bad = value();
  if (bad !== -1) return bad;
  return tokens[at]?.at ?? text.length;
}
function tidy(message) {
  return message.replace(/\s*(?:in JSON )?at position \d+.*$/, "").trim() || message;
}
function jsProblems(text) {
  const out = [];
  const tokens = tokenizeJs(text);
  for (const token of tokens) {
    if (token.cls === "com" && text.startsWith("/*", token.at) && !text.slice(token.at, token.to).endsWith("*/")) {
      const where = positionAt(text, token.at);
      out.push({ ...where, message: "This block comment is never closed, so everything after it is part of the comment." });
    }
    if (token.cls === "str") {
      const quote = text[token.at];
      const run = text.slice(token.at, token.to);
      const closed = quote === "`" ? run.length > 1 && run.endsWith("`") : run.length > 1 && run.endsWith(quote) && !run.endsWith(`\\${quote}`);
      if (!closed) {
        const where = positionAt(text, token.at);
        out.push({ ...where, message: `This ${quote === "`" ? "template" : "string"} is never closed.` });
      }
    }
  }
  const mask = literalMask(text, tokens);
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!OPENERS.includes(ch) && !CLOSERS.includes(ch)) continue;
    if (mask[i] === 1) continue;
    if (OPENERS.includes(ch)) {
      stack.push({ at: i, ch });
      continue;
    }
    const top = stack.pop();
    if (top === void 0) {
      out.push({ ...positionAt(text, i), message: `This ${ch} has nothing open to close.` });
      continue;
    }
    if (PARTNER[top.ch] !== ch) {
      out.push({
        ...positionAt(text, i),
        message: `This ${ch} closes the ${top.ch} opened on line ${positionAt(text, top.at).line}, which needs a ${PARTNER[top.ch]}.`
      });
    }
  }
  for (const left of stack) {
    out.push({ ...positionAt(text, left.at), message: `This ${left.ch} is never closed.` });
  }
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}

// src/ui/editor.ts
var LINE_HEIGHT = 18;
var INDENT = "  ";
var PAIRS = { "{": "}", "[": "]", "(": ")" };
var QUOTES = {
  json: ['"'],
  js: ['"', "'", "`"],
  markdown: [],
  text: []
};
var MAY_PRECEDE_CLOSE = /[\s)\]},;:]/;
var WORDISH = /[\p{L}\p{N}_]/u;
var COLOUR_CEILING = 2e5;
var PROMPT_CEILING = 4e4;
var REPAINT_DELAY = 140;
function codeEditor(options) {
  const { doc: doc2 } = options;
  let lang = options.lang;
  const area = doc2.createElement("textarea");
  area.className = "mb-ed-area";
  area.spellcheck = false;
  area.wrap = "off";
  area.value = options.text;
  area.readOnly = options.readOnly === true;
  area.setAttribute("aria-label", "The file, as text");
  area.dataset["code"] = "1";
  const picture = h("pre", { class: "mb-ed-hl", aria: { hidden: "true" } });
  const gutter = h("div", { class: "mb-ed-nums", aria: { hidden: "true" } });
  const findInput = h("input", { type: "search", class: "mb-ed-find-box", placeholder: "Find", spellcheck: false });
  const findCount = h("span", { class: "mb-ed-find-count" });
  const findBar = h(
    "div",
    { class: "mb-ed-find" },
    findInput,
    h("button", { class: "mb-btn mb-tiny", type: "button", text: "Next", on: { click: () => step(1) } }),
    h("button", { class: "mb-btn mb-tiny", type: "button", text: "Previous", on: { click: () => step(-1) } }),
    findCount,
    options.onSearchAll === void 0 ? null : h("button", {
      class: "mb-btn mb-tiny mb-ghost",
      type: "button",
      text: "Search everywhere",
      tip: "Look for this across every file in the mod, not just the one open here.",
      on: { click: () => options.onSearchAll?.() }
    }),
    h("button", { class: "mb-btn mb-tiny mb-ghost", type: "button", text: "Close", on: { click: () => showFind(false) } })
  );
  findBar.style.display = "none";
  const el = h(
    "div",
    { class: "mb-ed" },
    findBar,
    h("div", { class: "mb-ed-body" }, h("div", { class: "mb-ed-gutter" }, gutter), h("div", { class: "mb-ed-box" }, picture, area))
  );
  let focused = false;
  let repaint;
  let lines = -1;
  const colouring = () => area.value.length <= COLOUR_CEILING;
  const paint = () => {
    const text = area.value;
    drawGutter(text);
    if (!colouring()) {
      picture.textContent = `${text}
`;
      return;
    }
    const spans = tokenize(lang, text).map((token) => ({
      at: token.at,
      to: token.to,
      cls: classOf(token.cls)
    }));
    const pair = focused ? matchingBrackets(lang, text, area.selectionStart) : [];
    if (pair.length === 2) {
      for (const at2 of pair) {
        const covering = spans.findIndex((span) => span.at === at2 && span.to === at2 + 1);
        if (covering >= 0) spans.splice(covering, 1);
        spans.push({ at: at2, to: at2 + 1, cls: "mb-t-match" });
      }
      spans.sort((a, b) => a.at - b.at);
    }
    const parts = [];
    let at = 0;
    for (const span of spans) {
      if (span.at < at || span.to > text.length) continue;
      if (span.at > at) parts.push(doc2.createTextNode(text.slice(at, span.at)));
      parts.push(h("span", { class: span.cls, text: text.slice(span.at, span.to) }));
      at = span.to;
    }
    if (at < text.length) parts.push(doc2.createTextNode(text.slice(at)));
    parts.push(doc2.createTextNode("\n"));
    picture.replaceChildren(...parts);
  };
  const schedulePaint = () => {
    if (repaint !== void 0) clearTimeout(repaint);
    repaint = setTimeout(
      () => {
        repaint = void 0;
        paint();
      },
      area.value.length > PROMPT_CEILING ? REPAINT_DELAY : 0
    );
  };
  const drawGutter = (text) => {
    const count = lineStarts(text).length;
    if (count === lines) return;
    lines = count;
    const numbers = [];
    for (let n = 1; n <= count; n++) numbers.push(String(n));
    gutter.textContent = numbers.join("\n");
  };
  const sync = () => {
    const x = -area.scrollLeft;
    const y = -area.scrollTop;
    picture.style.transform = `translate(${x}px, ${y}px)`;
    gutter.style.transform = `translateY(${y}px)`;
  };
  const reportCaret = () => {
    const where = positionAt(area.value, area.selectionStart);
    options.onCaret?.(where.line, where.column);
  };
  const replaceRange = (start, end, text) => {
    area.focus();
    area.setSelectionRange(start, end);
    let native = false;
    try {
      native = doc2.execCommand("insertText", false, text);
    } catch {
      native = false;
    }
    if (!native) {
      area.setRangeText(text, start, end, "end");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  const selectedLines = () => {
    const starts = lineStarts(area.value);
    const first = positionAt(area.value, area.selectionStart).line - 1;
    const end = area.selectionEnd;
    let last = positionAt(area.value, end).line - 1;
    if (last > first && end === starts[last]) last--;
    return { first, last };
  };
  const indent = (out) => {
    const text = area.value;
    const starts = lineStarts(text);
    const { first, last } = selectedLines();
    if (!out && first === last && area.selectionStart === area.selectionEnd) {
      replaceRange(area.selectionStart, area.selectionStart, INDENT);
      return;
    }
    const from = starts[first] ?? 0;
    const nextStart = starts[last + 1];
    const to = nextStart === void 0 ? text.length : nextStart - 1;
    const block = text.slice(from, to);
    const changed = block.split("\n").map((line) => {
      if (!out) return line === "" ? line : INDENT + line;
      if (line.startsWith(INDENT)) return line.slice(INDENT.length);
      return line.replace(/^[ \t]/, "");
    }).join("\n");
    if (changed === block) return;
    replaceRange(from, to, changed);
    area.setSelectionRange(from, from + changed.length);
  };
  const newline = () => {
    const text = area.value;
    const at = area.selectionStart;
    const start = offsetAt(text, positionAt(text, at).line, 1);
    const lead = /^[ \t]*/.exec(text.slice(start, at))?.[0] ?? "";
    const opens = /[{[(]\s*$/.test(text.slice(start, at));
    const before = at > 0 ? text[at - 1] : void 0;
    const after = text[at];
    if (at === area.selectionEnd && before !== void 0 && PAIRS[before] !== void 0 && after === PAIRS[before]) {
      const inner = `
${lead}${INDENT}`;
      replaceRange(at, at, `${inner}
${lead}`);
      area.setSelectionRange(at + inner.length, at + inner.length);
      return;
    }
    replaceRange(at, area.selectionEnd, `
${lead}${opens ? INDENT : ""}`);
  };
  const inLiteral = (at) => {
    if (!colouring()) return false;
    for (const token of tokenize(lang, area.value)) {
      if (token.cls !== "str" && token.cls !== "com") continue;
      if (at > token.at && at < token.to) return true;
    }
    return false;
  };
  const autoClose = (ch) => {
    if (lang === "markdown" || lang === "text") return false;
    const text = area.value;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const quote = QUOTES[lang].includes(ch);
    const close = PAIRS[ch];
    if (start !== end) {
      if (close === void 0 && !quote) return false;
      const partner = close ?? ch;
      const selected = text.slice(start, end);
      replaceRange(start, end, `${ch}${selected}${partner}`);
      area.setSelectionRange(start + 1, start + 1 + selected.length);
      return true;
    }
    const next = text[start];
    if (next === ch && (quote || Object.values(PAIRS).includes(ch))) {
      area.setSelectionRange(start + 1, start + 1);
      reportCaret();
      schedulePaint();
      return true;
    }
    if (close === void 0 && !quote) return false;
    if (next !== void 0 && !MAY_PRECEDE_CLOSE.test(next)) return false;
    if (quote) {
      const previous = start > 0 ? text[start - 1] : void 0;
      if (previous !== void 0 && (WORDISH.test(previous) || previous === "\\" || previous === ch)) return false;
      if (inLiteral(start)) return false;
    }
    replaceRange(start, start, `${ch}${close ?? ch}`);
    area.setSelectionRange(start + 1, start + 1);
    reportCaret();
    return true;
  };
  const rubOutPair = () => {
    if (lang === "markdown" || lang === "text") return false;
    if (area.selectionStart !== area.selectionEnd) return false;
    const text = area.value;
    const at = area.selectionStart;
    const before = at > 0 ? text[at - 1] : void 0;
    const after = text[at];
    if (before === void 0 || after === void 0) return false;
    const paired = PAIRS[before] === after || QUOTES[lang].includes(before) && before === after;
    if (!paired) return false;
    replaceRange(at - 1, at + 1, "");
    return true;
  };
  const showFind = (on) => {
    findBar.style.display = on ? "" : "none";
    if (on) {
      findInput.focus();
      findInput.select();
    } else {
      findCount.textContent = "";
      area.focus();
    }
  };
  const step = (direction) => {
    const needle = findInput.value;
    if (needle === "") {
      findCount.textContent = "";
      return;
    }
    const hay = area.value.toLowerCase();
    const want = needle.toLowerCase();
    const all = [];
    for (let at2 = hay.indexOf(want); at2 >= 0; at2 = hay.indexOf(want, at2 + 1)) all.push(at2);
    if (all.length === 0) {
      findCount.textContent = "not here";
      return;
    }
    const from = area.selectionStart;
    let index;
    if (direction === 1) {
      const next = all.findIndex((at2) => at2 > from);
      index = next < 0 ? 0 : next;
    } else {
      const previous = [...all].reverse().find((at2) => at2 < from);
      index = previous === void 0 ? all.length - 1 : all.indexOf(previous);
    }
    const at = all[index];
    findCount.textContent = `${index + 1} of ${all.length}`;
    area.focus();
    area.setSelectionRange(at, at + needle.length);
    scrollTo(positionAt(area.value, at).line);
    reportCaret();
    schedulePaint();
  };
  const scrollTo = (line) => {
    const middle2 = (line - 1) * LINE_HEIGHT - area.clientHeight / 2;
    area.scrollTop = Math.max(0, middle2);
    sync();
  };
  area.addEventListener("input", () => {
    options.onInput(area.value);
    schedulePaint();
    reportCaret();
  });
  area.addEventListener("scroll", sync);
  area.addEventListener("click", () => {
    reportCaret();
    schedulePaint();
  });
  el.addEventListener("focusin", () => {
    focused = true;
    schedulePaint();
  });
  el.addEventListener("focusout", () => {
    focused = false;
    schedulePaint();
  });
  findInput.addEventListener("input", () => step(1));
  const onSelectionChange = () => {
    if (!focused) return;
    reportCaret();
    schedulePaint();
  };
  doc2.addEventListener("selectionchange", onSelectionChange);
  paint();
  sync();
  return {
    el,
    text: () => area.value,
    setText(text) {
      area.value = text;
      lines = -1;
      paint();
      area.scrollTop = 0;
      area.scrollLeft = 0;
      sync();
    },
    setLanguage(next) {
      lang = next;
      paint();
    },
    focus() {
      area.focus();
    },
    goTo(line, column = 1) {
      const at = offsetAt(area.value, line, column);
      area.focus();
      area.setSelectionRange(at, at);
      scrollTo(line);
      reportCaret();
      schedulePaint();
    },
    hasFocus: () => focused,
    colouring,
    keys(event) {
      if (!focused) return false;
      const chord = event.ctrlKey || event.metaKey;
      const key = event.key;
      if (key === "Escape") {
        if (findBar.style.display === "none") return false;
        showFind(false);
        return true;
      }
      if (chord && key.toLowerCase() === "f") {
        if (event.shiftKey) {
          if (options.onSearchAll === void 0) return false;
          options.onSearchAll();
          return true;
        }
        showFind(true);
        return true;
      }
      if (chord && key.toLowerCase() === "s") {
        if (options.readOnly !== true) options.onSave();
        return true;
      }
      if (chord && key.toLowerCase() === "g") {
        step(event.shiftKey ? -1 : 1);
        return true;
      }
      if (deepFocus(el) === findInput) {
        if (key === "Enter") {
          step(event.shiftKey ? -1 : 1);
          return true;
        }
        return false;
      }
      if (options.readOnly === true) return false;
      if (key === "Tab" && !event.altKey) {
        indent(event.shiftKey);
        return true;
      }
      if (key === "Enter" && !chord && !event.altKey) {
        newline();
        return true;
      }
      if ((key === "Backspace" || key === "Delete") && !chord && !event.altKey && rubOutPair()) return true;
      if (key.length === 1 && !chord && !event.altKey && autoClose(key)) return true;
      return false;
    },
    dispose() {
      if (repaint !== void 0) clearTimeout(repaint);
      doc2.removeEventListener("selectionchange", onSelectionChange);
    }
  };
}
function deepFocus(within) {
  const root = within.getRootNode();
  const active = root.activeElement ?? null;
  return active !== null && within.contains(active) ? active : null;
}
function classOf(cls) {
  return `mb-t-${cls}`;
}
function problemRow(problem, onClick) {
  return h(
    "button",
    { class: "mb-ed-problem", type: "button", on: { click: onClick } },
    h("span", { class: "mb-ed-problem-at", text: `${problem.line}:${problem.column}` }),
    h("span", { text: problem.message })
  );
}
function findingRow(finding, onClick) {
  const placed = finding.line !== void 0;
  const where = placed ? `${finding.line}:${finding.column}` : finding.record === void 0 ? "this file" : finding.record;
  const parts = [
    h("span", { class: "mb-ed-problem-at", text: where }),
    h("span", { class: "mb-ed-problem-text", text: finding.message }),
    h("span", { class: "mb-ed-problem-rule", text: finding.rule })
  ];
  const attrs = { class: "mb-ed-problem", data: { level: finding.level } };
  return placed ? h("button", { ...attrs, type: "button", on: { click: onClick } }, ...parts) : h("div", { ...attrs, data: { level: finding.level, still: "1" } }, ...parts);
}

// src/ui/sdk-docs-content.ts
var SDK_DOC_SOURCES = [
  {
    "id": "tutorial-01",
    "path": "tutorials/01-tweak-a-value.md",
    "source": "local",
    "audience": "beginner",
    "title": "1. Change one thing",
    "note": "Five minutes, two files, and a dagger that hits harder.",
    "encoded": "IyBUdXRvcmlhbCAxOiBDaGFuZ2Ugb25lIHRoaW5nCgpJbiB0aGlzIHR1dG9yaWFsIHlvdSBtYWtlIGRhZ2dlcnMgaGl0IGhhcmRlciBhbmQgY29zdCB0ZW4gdGltZXMgYXMgbXVjaC4gWW91IG5lZWQgYSB0ZXh0IGVkaXRvciBhbmQgbm90aGluZyBlbHNlOiBubyBjb21waWxlciwgbm8gdG9vbGNoYWluLCBubyBhY2NvdW50LCBhbmQgbm8gY29weSBvZiB0aGUgZ2FtZSdzIHNvdXJjZSBjb2RlLiBJdCB0YWtlcyBhYm91dCBmaXZlIG1pbnV0ZXMsIGFuZCBtb3N0IG9mIHRoYXQgZ29lcyB0byBmaW5kaW5nIHRoZSBNb2RzIG1lbnUuCgotLS0KCiMjIE1vZCBmaWxlcwoKQSBtb2QgaXMgYSBmb2xkZXIuIE1ha2Ugb25lIGFueXdoZXJlIHlvdSBsaWtlLCBuYW1lIGl0IGBteS1maXJzdC1tb2RgLCBhbmQgcHV0IHR3byBmaWxlcyBpbiBpdDoKCmBgYApteS1maXJzdC1tb2QvCiAgbWFuaWZlc3QuanNvbgogIG9iamVjdC5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIGlkZW50aWZpZXMgdGhlIG1vZC4gQ29weSB0aGlzIGludG8gaXQ6CgpgYGBqc29uCnsKICAiZm9ybWF0IjogIm5lby1hbmdiYW5kL21vZC9tYW5pZmVzdCIsCiAgInNjaGVtYVZlcnNpb24iOiAyLAogICJkYXRhIjogewogICAgImlkIjogIm15LWZpcnN0LW1vZCIsCiAgICAibmFtZSI6ICJNeSBGaXJzdCBNb2QiLAogICAgInZlcnNpb24iOiAiMS4wLjAiLAogICAgInNoYXBlIjogImNvbnRlbnQiLAogICAgImZhY2V0cyI6IFsKICAgICAgImNvbnRlbnQiCiAgICBdLAogICAgImFwaSI6ICIqIiwKICAgICJydW50aW1lIjogImRhdGEiLAogICAgImVuZ2luZSI6IHsKICAgICAgInJhbmdlIjogIj49MS4yMy4wLWJldGEuMyIsCiAgICAgICJiZWNhdXNlIjogIlRoaXMgbW9kIHRhcmdldHMgdGhlIHB1Ymxpc2hlZCAxLjIzLjAtYmV0YS4zIFNESy4iCiAgICB9LAogICAgImF1dGhvciI6ICJ5b3VyIG5hbWUiLAogICAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAgICJyZXBvc2l0b3J5IjogImh0dHBzOi8vZ2l0aHViLmNvbS95b3UvbXktZmlyc3QtbW9kIiwKICAgICJkZXBlbmRlbmNpZXMiOiB7CiAgICAgICJyZXF1aXJlZCI6IHsKICAgICAgICAiY29yZSI6IHsKICAgICAgICAgICJyYW5nZSI6ICIqIgogICAgICAgIH0KICAgICAgfQogICAgfSwKICAgICJhZmZlY3RzR2FtZXBsYXkiOiB0cnVlLAogICAgImRlc2NyaXB0aW9uIjogIkRhZ2dlcnMgaGl0IGhhcmRlciBhbmQgY29zdCBtb3JlLiIKICB9Cn0KYGBgCgpFdmVyeSBtb2QgbmVlZHMgYHJlcG9zaXRvcnlgLCBpbmNsdWRpbmcgb25lIHlvdSBuZXZlciBwdWJsaXNoLiBUaGUgZ2FtZSB1c2VzIGl0IGFzIHRoZSBtb2QncyBpZGVudGl0eSBob3dldmVyIHRoZSBtb2Qgd2FzIGluc3RhbGxlZDogaXQgcGlucyBhbiBpbnN0YWxsZWQgbW9kIHRvIHRoZSByZXBvc2l0b3J5IGl0IGNhbWUgZnJvbSBhbmQgYWNjZXB0cyByZXBsYWNlbWVudHMgb25seSBmcm9tIHRoYXQgcmVwb3NpdG9yeS4gQSBtb2Qgd2l0aCBubyByZXBvc2l0b3J5IGNhbiBiZSBvdmVyd3JpdHRlbiBieSBhbnkgbW9kIHRoYXQgY2xhaW1zIHRoZSBzYW1lIGlkLiBTZXQgaXQgdG8gdGhlIHBsYWNlIHlvdSBwbGFuIHRvIHB1Ymxpc2gsIG9yIHRoZSBwbGFjZSB5b3Ugd291bGQgcHVibGlzaCBpZiB5b3UgZGlkLgoKYG9iamVjdC5qc29uYCBob2xkcyB0aGUgY2hhbmdlOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN3b3JkLS1kYWdnZXIiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImF0dGFjay5oZCIsICJ2YWx1ZSI6ICIxZDYiIH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImNvc3QiLCAidmFsdWUiOiAzMDAgfQogICAgXQogIH0KfQpgYGAKClRob3NlIHR3byBmaWxlcyBtYWtlIGEgY29tcGxldGUsIHdvcmtpbmcgbW9kLgoKIyMgV2hhdCB0aG9zZSBzaXggbGluZXMgYXJlIHNheWluZwoKYG9iamVjdC5qc29uYCBpcyB0aGUgbmFtZSBvZiBvbmUgb2YgdGhlIGdhbWUncyBkYXRhIGZpbGVzLiBUaGUgYmFzZSBnYW1lIHNoaXBzIGFuIGBvYmplY3QuanNvbmAgdGhhdCBsaXN0cyBldmVyeSBpdGVtIGluIEFuZ2JhbmQsIGFuZCB5b3VyIGZpbGUgYWRkcyB0byB0aGF0IGZpbGUuIFRvIGNoYW5nZSBhIG1vbnN0ZXIgeW91IHdvdWxkIHdyaXRlIGBtb25zdGVyLmpzb25gIGluc3RlYWQuIFRoZSBnYW1lIHJlYWRzIHRoZSBmaWxlIG5hbWUgdG8ga25vdyB3aGljaCBkYXRhIHlvdSBhcmUgY2hhbmdpbmcuCgpgY29yZTpzd29yZC0tZGFnZ2VyYCBuYW1lcyB0aGUgcmVjb3JkIHlvdSBhcmUgY2hhbmdpbmcuIFRoZSBgY29yZTpgIHBhcnQgc2F5cyB0aGUgcmVjb3JkIGJlbG9uZ3MgdG8gdGhlIGJhc2UgZ2FtZSwgYXMgb3Bwb3NlZCB0byB5b3VyIG1vZCBvciBhbm90aGVyIG1vZC4gVGhlIHJlc3QgaXMgdGhlIGRhZ2dlcidzIGlkZW50aXR5IHdpdGhpbiBpdHMgZmlsZSwgd2hpY2ggZm9yIGFuIG9iamVjdCBpcyBpdHMgYHR5cGVgIGFuZCBpdHMgYG5hbWVgIGpvaW5lZCBieSBgLS1gLiBZb3UgY2FuIHN0YXJ0IHdpdGggeW91ciBiZXN0IGd1ZXNzLiBJZiB0aGUgcmVmIGlzIHdyb25nLCB0aGUgZXJyb3IgdGVsbHMgeW91IHdoaWNoIHJ1bGUgYnVpbGRzIHRoZSByZWYsIGFuZCB5b3UgY2FuIHdvcmsgb3V0IHRoZSBjb3JyZWN0IG9uZSBmcm9tIHRoZSByZWNvcmQgeW91IG1lYW50LiBUaGUgZXJyb3IgZ2l2ZXMgbm8gbGlzdCBvZiBjYW5kaWRhdGVzIGFuZCBubyAiZGlkIHlvdSBtZWFuIiBzdWdnZXN0aW9uIGZvciByZWZzLgoKV2hlbiBhIHJlZiBtYXRjaGVzIG5vdGhpbmcsIHRoZSBnYW1lIHNraXBzIHRoYXQgb25lIGNvbnRyaWJ1dGlvbiwgcmVwb3J0cyBpdCBvbiB5b3VyIG1vZCdzIHJvdyBpbiB0aGUgbW9kIG1hbmFnZXIsIGFuZCBsb2FkcyBldmVyeXRoaW5nIGVsc2UgaW4geW91ciBtb2QuCgpgZmllbGRQYXRjaGVzYCBpcyBhIGxpc3Qgb2Ygc21hbGwgZWRpdHMuIEVhY2ggb25lIG5hbWVzIGEgcGF0aCBpbnRvIHRoZSByZWNvcmQgYW5kIGEgbmV3IHZhbHVlLiBgYXR0YWNrLmhkYCBpcyB0aGUgZGFtYWdlIGRpY2UsIGFuZCBgY29zdGAgaXMgdGhlIGJhc2UgcHJpY2UgaW4gZ29sZC4gRXZlcnkgZmllbGQgeW91IGxlYXZlIG91dCBrZWVwcyB0aGUgYmFzZSBnYW1lJ3MgdmFsdWUsIHNvIHRoZSBkYWdnZXIgc3RheXMgdGhlIHNhbWUgaXRlbSB3aXRoIHR3byBudW1iZXJzIGNoYW5nZWQuCgpgImRlcGVuZGVuY2llcyI6IHsgInJlcXVpcmVkIjogeyAiY29yZSI6IHsgInJhbmdlIjogIioiIH0gfSB9YCBkZWNsYXJlcyB0aGF0IHlvdXIgbW9kIG1vZGlmaWVzIHRoZSBiYXNlIGdhbWUncyByZWNvcmRzLiBUaGUgZ2FtZSByZWplY3RzIHRoZSBwYXRjaCB3aXRob3V0IGl0LiBBIG1vZCBjYW4gY2hhbmdlIG9ubHkgcmVjb3JkcyB0aGF0IGJlbG9uZyB0byBzb21ldGhpbmcgaXQgaGFzIGRlY2xhcmVkLCBzbyBubyBtb2QgY2FuIGNoYW5nZSBhbm90aGVyIG1vZCdzIHJlY29yZHMgd2l0aG91dCBuYW1pbmcgdGhhdCBtb2QuCgpUaGUgc2NoZW1hIDIgZW52ZWxvcGUgaG9sZHMgdGhlIG1hbmlmZXN0IHVuZGVyIGBkYXRhYC4gQ29udGVudC1vbmx5IG1vZHMgdXNlIGBydW50aW1lOiAiZGF0YSJgIGFuZCBgYXBpOiAiKiJgLiBUdXRvcmlhbHMgdGhhdCBydW4gY29kZSBkZWNsYXJlIGFuIEFQSSAyIHJhbmdlIGFuZCBgcnVudGltZTogImluLXByb2Nlc3MiYC4gVGhlc2UgZXhhbXBsZXMgdGFyZ2V0IFNESyAxLjIzLjAtYmV0YS4zLCB3aGljaCBwdWJsaXNoZXMgbW9kIEFQSSAyLjAuMC4KCiMjIFJ1bm5pbmcgaXQKCk9uIHRoZSBkZXNrdG9wIGJ1aWxkLCBwdXQgeW91ciBgbXktZmlyc3QtbW9kYCBmb2xkZXIgaW50byB0aGUgYG1vZHMvYCBmb2xkZXIgbmV4dCB0byB0aGUgZ2FtZSBhbmQgc3RhcnQgdGhlIGdhbWUuIFByZXNzIGBFc2NhcGVgLCBjaG9vc2UgKipNb2RzKiosIGZpbmQgKk15IEZpcnN0IE1vZCosIHR1cm4gaXQgb24sIGFuZCBjaG9vc2UgKipBcHBseSBjaGFuZ2VzIGFuZCByZWxvYWQqKi4KCkluIGEgYnJvd3NlciwgcHJlc3MgYEVzY2FwZWAsIGNob29zZSAqKk1vZHMqKiwgY2hvb3NlICoqQ2hvb3NlIGEgbW9kcyBmb2xkZXIuLi4qKiwgYW5kIHNlbGVjdCB0aGUgZm9sZGVyIHRoYXQgY29udGFpbnMgYG15LWZpcnN0LW1vZGAuIFR1cm4gdGhlIG1vZCBvbiBhbmQgcmVsb2FkIHRoZSBzYW1lIHdheS4gVGhlIGdhbWUgcmVtZW1iZXJzIHRoZSBmb2xkZXIsIHNvIHRvIHRlc3QgYSBjaGFuZ2UgeW91IGVkaXQgdGhlIGZpbGUgYW5kIHJlbG9hZCB0aGUgcGFnZS4KCiMjIENoZWNrIHRoZSByZXN1bHQKCkdvIHRvIHRoZSAqKldlYXBvbiBTbWl0aHMqKiAodGhlIGAzYCBvbiB0aGUgdG93biBtYXApLCB3aGljaCBzdG9ja3MgZGFnZ2Vycy4gVGhlIEdlbmVyYWwgU3RvcmUgZG9lcyBub3Qgc2VsbCB0aGVtLiBBIGRhZ2dlciBub3cgY29zdHMgYXJvdW5kIDMwMCBnb2xkLCB1cCBmcm9tIGFyb3VuZCAzMC4gSW5zcGVjdCBpdCB3aXRoIGBJYCBhbmQgaXRzIGRhbWFnZSBzaG93cyBgMWQ2YC4gSXQgYWxzbyBoaXRzIGhhcmRlciBpbiBhIGZpZ2h0LgoKVHVybiB0aGUgbW9kIG9mZiBhbmQgY2hvb3NlICoqQXBwbHkgY2hhbmdlcyBhbmQgcmVsb2FkKiosIGFuZCBkYWdnZXJzIGdvIGJhY2sgdG8gbm9ybWFsLiBZb3VyIG1vZCBzaXRzIGFzIGEgbGF5ZXIgb3ZlciB0aGUgYmFzZSBnYW1lIGFuZCBjaGFuZ2VzIG5vIGZpbGVzIG9uIHlvdXIgbWFjaGluZSwgc28gd2l0aCB0aGUgbW9kIG9mZiB5b3UgYXJlIHBsYXlpbmcgdGhlIHZhbmlsbGEgZ2FtZS4KCiMjIFZhcmlhdGlvbnMgdG8gdHJ5CgotIE1ha2UgdGhlIGRhZ2dlciBsaWdodGVyOiBhZGQgYHsgIm9wIjogInNldCIsICJwYXRoIjogIndlaWdodCIsICJ2YWx1ZSI6IDQgfWAuCi0gQ2hhbmdlIGEgbW9uc3RlciBpbnN0ZWFkLiBBZGQgYSBgbW9uc3Rlci5qc29uYCB3aXRoIGB7ICJmaWVsZFBhdGNoZXMiOiB7ICJjb3JlOnNvbGRpZXItYW50IjogWyB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJoaXQtcG9pbnRzIiwgInZhbHVlIjogNjAgfSBdIH0gfWAgYW5kIG1lZXQgYSB2ZXJ5IHVucmVhc29uYWJsZSBhbnQgb24gbGV2ZWwgMS4KLSBJbnRyb2R1Y2UgYSBtaXN0YWtlLiBDaGFuZ2UgYGNvcmU6c3dvcmQtLWRhZ2dlcmAgdG8gYGNvcmU6c3dvcmQtLWRhZ2dlcnJgIGFuZCByZWxvYWQsIHRoZW4gcmVhZCB0aGUgZXJyb3Igd2hpbGUgeW91IGFscmVhZHkga25vdyB0aGUgY2F1c2UuIFRoYXQgbWVzc2FnZSBpcyB5b3VyIG1haW4gZGVidWdnaW5nIHRvb2wuCgojIyBTYW1wbGUgbW9kCgpbQ29yZSdzIGhpc3RvcmljYWwgdHV0b3JpYWwtMDEtdHdlYWstYS12YWx1ZSBzYW1wbGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL3RyZWUvbWFzdGVyL3NhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTAxLXR3ZWFrLWEtdmFsdWUpIGNvbnRhaW5zIHRoZSBjb250ZW50IGNvbnRyaWJ1dGlvbi4gSXQgdXNlcyBhbiBvbGRlciBtYW5pZmVzdCBmb3JtYXQgYW5kIHNhbXBsZSBpZGVudGl0eS4gRm9yIGEgbmV3IG1vZCwgdXNlIHRoZSBzY2hlbWEgMiBtYW5pZmVzdCBmcm9tIHRoZXNlIHR1dG9yaWFscy4KCi0tLQoKKipOZXh0OioqIFtUdXRvcmlhbCAyOiBBZGQgYW4gaXRlbV0oMDItYWRkLWFuLWl0ZW0ubWQpIHVzZXMgdGhlIHNhbWUgYXBwcm9hY2ggdG8gY3JlYXRlIGFuIGl0ZW0gdGhlIGdhbWUgaGFzIG5ldmVyIGhhZC4K"
  },
  {
    "id": "tutorial-02",
    "path": "tutorials/02-add-an-item.md",
    "source": "local",
    "audience": "beginner",
    "title": "2. Add an item",
    "note": "Make a record the base game has never seen.",
    "encoded": "IyBUdXRvcmlhbCAyOiBBZGQgYW4gaXRlbQoKSW4gdGhpcyB0dXRvcmlhbCB5b3UgYWRkIG9uZSBuZXcgcGllY2Ugb2YgYXJtb3IgdGhhdCB0aGUgYmFzZSBnYW1lIGhhcyBuZXZlciBoZWFyZCBvZi4gUGxheWVycyBjYW4gZmluZCBpdCBpbiB0aGUgZHVuZ2VvbiBhbmQgYnV5IGl0IGluIHRvd24uIEl0IHRha2VzIHRlbiBtaW51dGVzIGFuZCBidWlsZHMgb24gW1R1dG9yaWFsIDFdKDAxLXR3ZWFrLWEtdmFsdWUubWQpLCB3aGljaCBleHBsYWlucyB3aGF0IGEgbW9kIGZvbGRlciBpcyBhbmQgaG93IHRvIGxvYWQgb25lLgoKLS0tCgojIyBNb2QgZmlsZXMKClRoZSBtb2QgaXMgYSBmb2xkZXIgd2l0aCB0d28gZmlsZXM6CgpgYGAKbXktaXRlbS1tb2QvCiAgbWFuaWZlc3QuanNvbgogIG9iamVjdC5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIGhhcyB0aGUgc2FtZSBzaGFwZSBhcyBpbiBUdXRvcmlhbCAxLCB3aXRoIGEgbmV3IGlkOgoKYGBganNvbgp7CiAgImZvcm1hdCI6ICJuZW8tYW5nYmFuZC9tb2QvbWFuaWZlc3QiLAogICJzY2hlbWFWZXJzaW9uIjogMiwKICAiZGF0YSI6IHsKICAgICJpZCI6ICJteS1pdGVtLW1vZCIsCiAgICAibmFtZSI6ICJNeSBJdGVtIE1vZCIsCiAgICAidmVyc2lvbiI6ICIxLjAuMCIsCiAgICAic2hhcGUiOiAiY29udGVudCIsCiAgICAiZmFjZXRzIjogWwogICAgICAiY29udGVudCIKICAgIF0sCiAgICAiYXBpIjogIioiLAogICAgInJ1bnRpbWUiOiAiZGF0YSIsCiAgICAiZW5naW5lIjogewogICAgICAicmFuZ2UiOiAiPj0xLjIzLjAtYmV0YS4zIiwKICAgICAgImJlY2F1c2UiOiAiVGhpcyBtb2QgdGFyZ2V0cyB0aGUgcHVibGlzaGVkIDEuMjMuMC1iZXRhLjMgU0RLLiIKICAgIH0sCiAgICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgICAibGljZW5zZSI6ICJHUEwtMi4wLW9ubHkiLAogICAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3lvdS9teS1pdGVtLW1vZCIsCiAgICAiZGVwZW5kZW5jaWVzIjogewogICAgICAicmVxdWlyZWQiOiB7CiAgICAgICAgImNvcmUiOiB7CiAgICAgICAgICAicmFuZ2UiOiAiKiIKICAgICAgICB9CiAgICAgIH0KICAgIH0sCiAgICAiYWZmZWN0c0dhbWVwbGF5IjogdHJ1ZSwKICAgICJkZXNjcmlwdGlvbiI6ICJBZGRzIGEgcGFkZGVkIGplcmtpbi4iCiAgfQp9CmBgYAoKYG9iamVjdC5qc29uYDoKCmBgYGpzb24KewogICJyZWNvcmRzIjogWwogICAgewogICAgICAibmFtZSI6ICJQYWRkZWQgSmVya2lufiIsCiAgICAgICJ0eXBlIjogInNvZnQgYXJtb3IiLAogICAgICAiZ3JhcGhpY3MiOiB7ICJnbHlwaCI6ICIoIiwgImNvbG9yIjogIlUiIH0sCiAgICAgICJsZXZlbCI6IDEsCiAgICAgICJ3ZWlnaHQiOiA2MCwKICAgICAgImNvc3QiOiAxMiwKICAgICAgImFsbG9jIjogeyAiY29tbW9uIjogMjAsICJtaW5tYXgiOiAiMSB0byA0MCIgfSwKICAgICAgImF0dGFjayI6IHsgImhkIjogIjBkMCIsICJ0by1oIjogIjAiLCAidG8tZCI6ICIwIiB9LAogICAgICAiYXJtb3IiOiB7ICJhYyI6IDUsICJ0by1hIjogIjAiIH0sCiAgICAgICJkZXNjIjogWyJBIHF1aWx0ZWQgamFja2V0IHN0dWZmZWQgd2l0aCB3b29sLiBJdCBpcyB3YXJtLCBhbmQgdmVyeSBzbGlnaHRseSBwcm90ZWN0aXZlLiJdCiAgICB9CiAgXQp9CmBgYAoKIyMgV2hhdCBjaGFuZ2VkIGZyb20gVHV0b3JpYWwgMQoKVGhlIGRhdGEgZmlsZSB1c2VzIGByZWNvcmRzYCB3aGVyZSBUdXRvcmlhbCAxIHVzZWQgYGZpZWxkUGF0Y2hlc2AuIEEgYGZpZWxkUGF0Y2hlc2AgZW50cnkgZWRpdHMgc29tZXRoaW5nIHRoYXQgYWxyZWFkeSBleGlzdHMsIGFuZCBhIGByZWNvcmRzYCBlbnRyeSBhZGRzIHNvbWV0aGluZyBuZXcgdGhhdCB5b3VyIG1vZCBvd25zLiBUaGUgZm9sZGVyLCB0aGUgbWFuaWZlc3QsIGFuZCB0aGUgd2F5IHlvdSBsb2FkIHRoZSBtb2QgYWxsIHdvcmsgdGhlIHNhbWUgYXMgYmVmb3JlLgoKIyMgUmVhZGluZyB0aGUgcmVjb3JkCgpNb3N0IG9mIHRoZXNlIGZpZWxkcyBhcmUgQW5nYmFuZCdzIG93biB2b2NhYnVsYXJ5LCBzbyB0aGUgYmFzZSBnYW1lJ3MgZGF0YSB3b3JrcyBhcyB5b3VyIHJlZmVyZW5jZSBtYW51YWwuIFRvIGxlYXJuIGhvdyB0byBleHByZXNzIHNvbWV0aGluZywgZmluZCBhbiBpdGVtIHRoYXQgYWxyZWFkeSBkb2VzIGl0IGFuZCBjb3B5IGhvdyBpdCBzYXlzIHNvLgoKLSBgbmFtZWA6IHRoZSB0cmFpbGluZyBgfmAgbWFya3Mgd2hlcmUgdGhlIHBsdXJhbCBnb2VzLiAiUGFkZGVkIEplcmtpbn4iIGRpc3BsYXlzIGFzICphIFBhZGRlZCBKZXJraW4qIGFuZCAqMiBQYWRkZWQgSmVya2lucyouIEFuIGl0ZW0gd2hvc2UgbmFtZSBzdGFydHMgd2l0aCBgJmAgKGAiJiBEYWdnZXJ+ImApIHRha2VzIGFuIGFydGljbGUuIFRoZXNlIG1hcmtzIGNvbWUgZnJvbSB0aGUgb3JpZ2luYWwgZ2FtZSwgc28gY29weSB0aGUgcHVuY3R1YXRpb24gb2YgYW4gZXhpc3RpbmcgbmFtZSB3aGVuIHlvdSB3cml0ZSBhIG5ldyBvbmUuCi0gYHR5cGVgOiB0aGUga2luZCBvZiBpdGVtLiBgc29mdCBhcm1vcmAgcHV0cyBpdCBpbiB0aGUgYm9keSBhcm1vciBzbG90IGFuZCBpbiB0aGUgYXJtb3J5J3Mgc3RvY2suIFBpY2sgYSB0eXBlIHRoZSBnYW1lIGFscmVhZHkgaGFzLiBbQ29yZSdzIG5ldyBpdGVtIGNsYXNzIHJlZmVyZW5jZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0FVVEhPUklORy5tZCNhLW5ldy1pdGVtLWNsYXNzKSBjb3ZlcnMgZGVjbGFyaW5nIGFub3RoZXIgY2xhc3MuCi0gYGxldmVsYDogdGhlIGRlcHRoIGF0IHdoaWNoIGl0IHN0YXJ0cyBhcHBlYXJpbmcuCi0gYGFsbG9jYDogaG93IG9mdGVuIGl0IGFwcGVhcnMsIGFuZCBiZXR3ZWVuIHdoaWNoIGRlcHRocy4gYGNvbW1vbjogMjBgIGlzIHJvdWdobHkgdGhlIGZyZXF1ZW5jeSBvZiBvcmRpbmFyeSBlYXJseSBnZWFyLCBhbmQgYCIxIHRvIDQwImAgaXMgdGhlIGRlcHRoIHdpbmRvdy4KLSBgYXJtb3IuYWNgOiB0aGUgYXJtb3IgaXQgZ2l2ZXMuIFNvZnQgTGVhdGhlciBBcm1vciBoYXMgOCBhbmQgY29zdHMgMjAsIHNvIDUgZm9yIDEyIGdvbGQgbWFrZXMgdGhlIGplcmtpbiBhIHdvcnNlLCBjaGVhcGVyIG9wdGlvbi4KLSBgZGVzY2A6IGFuIGFycmF5IG9mIGxpbmVzLCBzaG93biB3aGVuIHRoZSBwbGF5ZXIgaW5zcGVjdHMgdGhlIGl0ZW0uCgpUbyBwaWNrIHRoZSBudW1iZXJzLCBvcGVuIGBwYWNrYWdlcy9jb250ZW50L3BhY2svb2JqZWN0Lmpzb25gIGluIENvcmUgYW5kIGZpbmQgYW4gaXRlbSBsaWtlIHRoZSBvbmUgeW91IHdhbnQuIFRoYXQgZmlsZSBob2xkcyB0aGUgYmFzZSBnYW1lJ3MgZGF0YSBpbiB0aGUgc2FtZSBmb3JtYXQgeW91ciBtb2Qgd3JpdGVzLCBzbyB0aGUgbmVhcmVzdCBleGlzdGluZyBpdGVtIGlzIGFsd2F5cyBhIHdvcmtpbmcgdGVtcGxhdGUuIFRoZSBgZHJhZnRSZWNvcmRgIGhlbHBlciBkb2VzIHRoaXMgZm9yIHlvdTogaXQgZmlsbHMgaW4gYSBuZXcgcmVjb3JkIGZyb20gdGhlIGdhbWUncyBjb21wYXJhYmxlIHJlY29yZHMsIGluY2x1ZGluZyBhIHNlbnNpYmxlIHByaWNlLiBTZWUgW0FVVEhPUklORy5tZF0oLi4vQVVUSE9SSU5HLm1kKS4KCiMjIENoZWNrIHRoZSByZXN1bHQKCllvdXIgaXRlbSBleGlzdHMgaW4gdGhlIGdhbWUgYXMgc29vbiBhcyB0aGUgbW9kIGlzIG9uLiBJdCBnZW5lcmF0ZXMgaW4gdGhlIGR1bmdlb24gd2l0aGluIGl0cyBkZXB0aCB3aW5kb3csIG1vbnN0ZXJzIGNhbiBjYXJyeSBvbmUsIGFuZCB3ZWFyaW5nIGl0IHJhaXNlcyB5b3VyIGFybW9yIGNsYXNzIGJ5IDUuIFdpemFyZCBtb2RlIGlzIHRoZSBxdWljayB3YXkgdG8gY29uZmlybSBpdCwgb3IgeW91IGNhbiBkaXZlIHVudGlsIG9uZSBkcm9wcy4KCk5vIHNob3Agc3RvY2tzIGl0IHlldC4gQSBzaG9wJ3Mgc3RvY2sgY29tZXMgZnJvbSB0aGF0IHNob3AncyBvd24gdGFibGUsIGFuZCB5b3VyIGl0ZW0gaXMgb24gbm9uZSBvZiB0aGVtIHVudGlsIHRoZSBzaG9wIHNlY3Rpb24gYmVsb3cgYWRkcyBpdC4KClRoZSBnYW1lIGtub3dzIHlvdXIgaXRlbSBhcyBgbXktaXRlbS1tb2Q6c29mdC1hcm1vci0tcGFkZGVkLWplcmtpbmAuIEFuIGBvYmplY3RgIHJlY29yZCdzIGlkZW50aXR5IGlzIGl0cyBgdHlwZWAgYW5kIGl0cyBgbmFtZWAgam9pbmVkIGJ5IGAtLWAsIHNvIHRoZSByZWYgaW5jbHVkZXMgdGhlIHR5cGUgYWxvbmcgd2l0aCB0aGUgbmFtZS4gVGhlIHNhbWUgcnVsZSBtYWRlIFR1dG9yaWFsIDEncyBkYWdnZXIgYGNvcmU6c3dvcmQtLWRhZ2dlcmAuIFRoZSBgbXktaXRlbS1tb2Q6YCBwYXJ0IGlzIHlvdXIgb3duIG5hbWVzcGFjZSwgc28geW91ciBpdGVtIG5ldmVyIGNvbGxpZGVzIHdpdGggb25lIGZyb20gdGhlIGJhc2UgZ2FtZSBvciBhbm90aGVyIG1vZCwgZXZlbiBpZiBib3RoIG9mIHlvdSBhZGQgYSBQYWRkZWQgSmVya2luLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gTWFrZSBpdCBjdXJzZWQtY2hlYXAgYW5kIGhlYXZ5OiBgd2VpZ2h0YCAyMDAsIGBjb3N0YCAyLgotIE1ha2UgaXQgcmFyZSBhbmQgZGVlcDogYGxldmVsYCAzMCwgYGFsbG9jYCBgeyAiY29tbW9uIjogMywgIm1pbm1heCI6ICIzMCB0byAxMDAiIH1gLgotIEFkZCBhIHNlY29uZCBpdGVtIGluIHRoZSBzYW1lIGByZWNvcmRzYCBhcnJheS4gVGhlIGFycmF5IHRha2VzIGFueSBudW1iZXIgb2YgaXRlbXMuCi0gR2l2ZSBpdCBhbiBlZ28gcG9zc2liaWxpdHksIG9yIGEgZmxhZy4gRmluZCBhbiBpdGVtIGluIHRoZSBiYXNlIGdhbWUncyBgb2JqZWN0Lmpzb25gIHRoYXQgaGFzIHRoZSBwcm9wZXJ0eSB5b3Ugd2FudCBhbmQgY29weSB0aGUgZmllbGQgYWNyb3NzLgoKIyMgV2hhdCB5b3VyIGl0ZW0gam9pbnMgYXV0b21hdGljYWxseQoKWW91ciBQYWRkZWQgSmVya2luIGlzIGEgc29mdCBhcm1vciwgYW5kIHRoZSBnYW1lIHRyZWF0cyBpdCBhcyBvbmUgZXZlcnl3aGVyZSB3aXRoIG5vIGV4dHJhIHdvcmsgZnJvbSB5b3U6CgotIEVnb3MsIHJ1bmVzLCBhbmQgYnJhbmRzIGFwcGx5IHRvIGl0LiBBbiBlZ28gZGVjbGFyZXMgdGhlIGtpbmRzIG9mIGl0ZW0gaXQgY2FuIGxhbmQgb24sIGFuZCAib2YgUmVzaXN0IEFjaWQiIG5hbWVzIGBzb2Z0IGFybW9yYCwgc28gaXQgY292ZXJzIHlvdXIgamVya2luLiBBIHBsYXllciBjYW4gZmluZCBhIFBhZGRlZCBKZXJraW4gb2YgUmVzaXN0IEZpcmUgd2l0aG91dCBhbnlvbmUgYWRkaW5nIGl0IHRvIGEgbGlzdC4KLSBRdWFsaXR5IGVuY2hhbnRtZW50IGFwcGxpZXMuIEl0IGNhbiB0dXJuIHVwIGFzIGBbNSwrNl1gLCBhbmQgaXRzIHByaWNlIGlzIHJlY29tcHV0ZWQgZnJvbSB3aGF0IGl0IGVuZGVkIHVwIGJlaW5nLCBzbyB0aGUgYGNvc3RgIHlvdSB3cm90ZSBkb2VzIG5vdCBzZXQgdGhlIGZpbmFsIHByaWNlLgotIEl0IGdlbmVyYXRlcyBpbiB0aGUgZHVuZ2VvbiBhdCB0aGUgZGVwdGhzIHlvdXIgYGFsbG9jYCBuYW1lcywgYW5kIGl0IGlzIGluIHRoZSBkcm9wIHRhYmxlcyBmcm9tIHRoZSBtb21lbnQgdGhlIG1vZCBpcyBvbi4KLSBTaG9wcyB3aWxsIGJ1eSBpdCwgYmVjYXVzZSBhIHNob3AncyBidXkgbGlzdCBhbHNvIGdvZXMgYnkgaXRlbSBraW5kLgoKIyMgT25lIHRoaW5nIHRoYXQgZG9lcyBOT1QgaGFwcGVuOiBhIHBpY3R1cmUKCkluIEFTQ0lJIHlvdXIgamVya2luIGRyYXdzIHdpdGggaXRzIGNsYXNzJ3Mgc3ltYm9sIGFuZCBuZWVkcyBub3RoaW5nIGZyb20geW91LiBJbiB0aWxlIG1vZGUgaXQgaGFzIG5vIHBpY3R1cmUsIGFuZCB0aGUgZ2FtZSBkb2VzIG5vdCBpbnZlbnQgb25lLiBBIHRpbGUgc2V0IG1hcHMgbmFtZWQgaXRlbXMgdG8gcGljdHVyZXMgYW5kIGhhcyBuZXZlciBoZWFyZCBvZiB5b3Vycywgc28gYSBwbGF5ZXIgaW4gdGlsZSBtb2RlIHNlZXMgYSBsZXR0ZXIgYW1vbmcgcGljdHVyZXMuIEJlZm9yZSAwLjIzLjAgdGhlIGdhbWUgZ3Vlc3NlZCwgZHJhd2luZyBhbiBhZGRlZCBpdGVtIHdpdGggdGhlIHRpbGUgb2YgYW5vdGhlciBpdGVtIHNoYXJpbmcgaXRzIGB0dmFsYC4gVmVyc2lvbiAwLjIzLjAgcmVtb3ZlZCB0aGF0IGd1ZXNzLiBBbmdiYW5kIDQuMi42IGhhcyBubyBjb25jZXB0IG9mIGFuIGl0ZW0gYSBtb2QgYWRkZWQsIHNvIGl0IGhhcyBubyBvcGluaW9uIGFib3V0IGhvdyBvbmUgc2hvdWxkIGxvb2ssIGFuZCBjaG9vc2luZyBhcnQgZm9yIG9uZSBpcyB0aGUgdGlsZSBzZXQncyBqb2IuCgpJZiB5b3Ugc2hpcCBjb250ZW50LCBzaGlwIHRpbGVzIGZvciBpdC4gSWYgeW91IGRvIG5vdCwgc2F5IHNvIGluIHlvdXIgbW9kJ3MgZGVzY3JpcHRpb24gYW5kIHBvaW50IHBsYXllcnMgYXQgYSB0aWxlIG1vZCB0aGF0IGZpbGxzIGJsYW5rczoKCj4gTm8gdGlsZXMgb2YgaXRzIG93bjogaW4gdGlsZSBtb2RlIHRoZSBQYWRkZWQgSmVya2luIGRyYXdzIGFzIGEgbGV0dGVyLiBJbnN0YWxsIFtsaW5vbGV1bV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWxpbm9sZXVtKSBhbmQgaXQgaXMgZHJhd24gZnJvbSBhbm90aGVyIGl0ZW0gb2YgaXRzIHR5cGUgaW5zdGVhZC4KClVuZGVyIGl0cyBvd24gdGlsZSBwYWNrcywgTGlub2xldW0gZHJhd3MgYW4gYWRkZWQgaXRlbSBmcm9tIGEga2luZCBzaGFyaW5nIGl0cyBgdHZhbGAsIHdpdGggdGhlIGNvbG9yIHR1cm5lZC4gVW5kZXIgQW5nYmFuZCdzIG93biB0aWxlIHNoZWV0cyBhbiBhZGRlZCBpdGVtIGtlZXBzIGl0cyBsZXR0ZXIsIGJlY2F1c2UgdGhvc2Ugc2hlZXRzIGFyZSBhIGZpeGVkIGdyaWQgd2l0aCBubyBzcGFyZSBjZWxsIGZvciBhIHZhcmlhbnQuIExlYXZlIExpbm9sZXVtIG91dCBvZiB5b3VyIGRlcGVuZGVuY2llcy4gWW91ciBtb2QgaXMgY29tcGxldGUgaW4gQVNDSUkgd2l0aCBubyB0aWxlIHNldCBhdCBhbGwsIGFuZCBhIHBsYXllciB1c2luZyBhIGRpZmZlcmVudCBzZXQgc2hvdWxkIG5vdCBoYXZlIHRvIGluc3RhbGwgb25lIHRoZXkgd2lsbCBub3QgbG9vayBhdC4KCiMjIFB1dHRpbmcgaXQgaW4gYSBzaG9wCgpTaG9wcyBkbyBub3Qgc3RvY2sgYSBuZXcgaXRlbSBvbiB0aGVpciBvd24uIFRoZSBvcmlnaW5hbCBnYW1lIHdvcmtzIHRoZSBzYW1lIHdheTogYSBzdG9yZSdzIHN0b2NrIGxpc3QgbmFtZXMgc3BlY2lmaWMgaXRlbXMsIHNvIGEgbmV3IGl0ZW0gaGFzIHRvIGJlIGFkZGVkIHRvIHRoZSBsaXN0LgoKQWRkaW5nIGEgbGluZSB0byBhIGxpc3QgdGFrZXMgb25lIG9wLiBNYWtlIGEgYHN0b3JlLmpzb25gIGJlc2lkZSB5b3VyIGBvYmplY3QuanNvbmA6CgpgYGBqc29uCnsKICAiZmllbGRQYXRjaGVzIjogewogICAgImNvcmU6c3RvcmUtYXJtb3IiOiBbCiAgICAgIHsKICAgICAgICAib3AiOiAiYXBwZW5kIiwKICAgICAgICAicGF0aCI6ICJub3JtYWwiLAogICAgICAgICJ2YWx1ZXMiOiBbeyAidHZhbCI6ICJzb2Z0IGFybW9yIiwgInN2YWwiOiAiUGFkZGVkIEplcmtpbiIgfV0KICAgICAgfQogICAgXQogIH0KfQpgYGAKClJlc3RhcnQgYW5kIHdhbGsgaW50byB0aGUgQXJtb3J5LiBZb3VyIGplcmtpbiBpcyBpbiB0aGUgcm90YXRpb24gd2l0aCBldmVyeXRoaW5nIGVsc2U6IHNvbWV0aW1lcyBpbiBzdG9jayBhbmQgc29tZXRpbWVzIG91dCwgYXQgd2hhdGV2ZXIgZW5jaGFudG1lbnQgdGhlIHN0b3JlIHJvbGxlZCwgYW5kIHByaWNlZCBmcm9tIHdoYXQgaXQgdHVybmVkIG91dCB0byBiZS4gVGhlIHN0b2NrIHJvbGwgcGlja3MgZnJvbSB0aGUgc3RvcmUncyBvd24gdGFibGUgYW5kIGlnbm9yZXMgeW91ciBpdGVtJ3MgYGFsbG9jYCB3aW5kb3csIHNvIGEgc2hvcCBjYW4gb2ZmZXIgaXQgYXQgYW55IGRlcHRoLiBgYWxsb2NgIGNvbnRyb2xzIHdoZXJlIHRoZSBpdGVtIGdlbmVyYXRlcyBpbiB0aGUgZHVuZ2Vvbi4KCkFib3V0IHRoYXQgcGF0Y2g6CgotIGBjb3JlOnN0b3JlLWFybW9yYCBpcyB0aGUgc3RvcmUncyByZWNvcmQgaWQ6IGl0cyBjb2RlLCBgU1RPUkVfQVJNT1JgLCBsb3dlcmNhc2VkIHdpdGggYF9gIHR1cm5lZCBpbnRvIGAtYC4gVGhhdCBydWxlIGJlbG9uZ3MgdG8gdGhlIFNUT1JFIGZpbGUuIEVhY2ggZGF0YSBmaWxlIGRlY2xhcmVzIHdoYXQgaWRlbnRpZmllcyBpdHMgcmVjb3JkcywgYW5kIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9yZWNvcmQta2V5LnRzYCBob2xkcyB0aGUgdGFibGUgb2YgdGhlbS4gTW9zdCBmaWxlcyB1c2UgYG5hbWVgLiBgb2JqZWN0YCB1c2VzIGB0eXBlYCBwbHVzIGBuYW1lYC4gYGJyYW5kYCwgYHNsYXlgLCBhbmQgYHByb2plY3Rpb25gIHVzZSBgY29kZWAuIGBjb25zdGFudHNgIGFuZCBgdmlzdWFsc2AgaGF2ZSBvbmUgcmVjb3JkIGVhY2ggYW5kIGFyZSBuYW1lZCBieSB0aGUgZmlsZS4KLSBgbm9ybWFsYCBpcyB0aGUgIm1heSBzdG9jayIgdGFibGUsIGFuZCBgYWx3YXlzYCBob2xkcyB0aGUgc3RhcGxlcy4gQXBwZW5kaW5nIHRvIGBhbHdheXNgIG1ha2VzIGEgc2hvcCBrZWVwIG9uZSBvbiB0aGUgc2hlbGYgYXQgYWxsIHRpbWVzLCB3aGljaCBzdWl0cyBmZXcgaXRlbXMuIFRoZSBBcm1vcnkgc2hpcHMgbm8gYGFsd2F5c2AgbGlzdCwgc28gYW4gYXBwZW5kIHRvIG9uZSB0aGVyZSBoYXMgbm90aGluZyB0byBhcHBlbmQgdG8sIGFuZCB0aGUgZ2FtZSByZXBvcnRzIGl0LgotIGBzdmFsYCBpcyB0aGUgaXRlbSdzIG5hbWUgd2l0aG91dCB0aGUgYH5gLiBJZiBpdCBtYXRjaGVzIG5vIGV4aXN0aW5nIGl0ZW0sIHRoZSBnYW1lIGRyb3BzIHRoYXQgb25lIGxpbmUgZnJvbSB0aGUgc2hvcCdzIHRhYmxlIGFuZCByZXBvcnRzIGl0IGFnYWluc3QgeW91ciBtb2QgaW4gdGhlIG1vZCBtYW5hZ2VyLiBBIHR5cG8gY29zdHMgeW91IG9uZSBsaW5lLCBhbmQgdGhlIHJlcG9ydCB0ZWxscyB5b3Ugd2hpY2ggb25lLgoKYGFwcGVuZGAgbGV0cyB0d28gc2hvcCBtb2RzIGNvZXhpc3QuIEl0IGFkZHMgdG8gdGhlIGxpc3Qgd2l0aG91dCByZXN0YXRpbmcgaXQsIHNvIHRoZSBzdG9yZSdzIGV4aXN0aW5nIGVudHJpZXMgc3RheSwgYW5kIGEgc2Vjb25kIG1vZCBhcHBlbmRpbmcgdG8gdGhlIHNhbWUgc3RvcmUga2VlcHMgaXRzIGVudHJ5IHRvby4gTm8gbW9kIGhhcyB0byBjb3B5IGEgbGlzdCBvdXQgb2YgdGhlIGJhc2UgZ2FtZSdzIGRhdGEgYW5kIHdhdGNoIGl0IGdvIHN0YWxlLiBJdHMgY291bnRlcnBhcnQsIGByZW1vdmVWYWx1ZWAsIGRyb3BzIGFuIGVudHJ5IGFuZCBjYW4gdGFrZSBvdXQgc29tZXRoaW5nIGFub3RoZXIgbW9kIGFkZGVkLCBzbyB0aGUgZ2FtZSByZXBvcnRzIGl0IGFzIGEgY29uZmxpY3QgYW5kIHRoZSBtb2QgdGhhdCBsb2FkcyBsYXN0IHdpbnMuCgpZb3VyIGBzdG9yZS5qc29uYCBuYW1lcyB5b3VyIGl0ZW0sIHNvIGl0IG9ubHkgd29ya3Mgd2hpbGUgeW91ciBgb2JqZWN0Lmpzb25gIGlzIGFsc28gbG9hZGVkLiBUaGlzIHR1dG9yaWFsIGtlZXBzIGJvdGggaW4gdGhlIHNhbWUgbW9kLiBZb3UgY2FuIHNwbGl0IHRoZW0sIGFuZCBhIHNob3AgbW9kIHRoYXQgc3RvY2tzIGFub3RoZXIgbW9kJ3MgaXRlbSBpcyBhIHJlYXNvbmFibGUgdGhpbmcgdG8gd3JpdGUuIEluIHRoYXQgY2FzZSwgd2hlbiB0aGUgb3RoZXIgbW9kIGlzIHR1cm5lZCBvZmYsIHlvdXIgYXBwZW5kZWQgbGluZSBuYW1lcyBub3RoaW5nLiBUaGUgc2hvcCBsb3NlcyB0aGF0IGxpbmUsIHRoZSBtb2QgbWFuYWdlciBzYXlzIHNvIG9uIHlvdXIgbW9kJ3Mgcm93LCBhbmQgdGhlIHJlc3Qgb2YgdGhlIEFybW9yeSBzdGF5cyBhcyBpdCB3YXMuIERlY2xhcmUgdGhlIG90aGVyIG1vZCBpbiB5b3VyIGBkZXBlbmRlbmNpZXNgIHNvIHRoZSBwbGF5ZXIgaXMgdG9sZCBiZWZvcmUgdGhhdCBoYXBwZW5zLgoKIyMgU2FtcGxlIG1vZAoKW0NvcmUncyBoaXN0b3JpY2FsIHR1dG9yaWFsLTAyLWFkZC1hbi1pdGVtIHNhbXBsZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvdHJlZS9tYXN0ZXIvc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDItYWRkLWFuLWl0ZW0pIGNvbnRhaW5zIHRoZSBjb250ZW50IGNvbnRyaWJ1dGlvbi4gSXQgdXNlcyBhbiBvbGRlciBtYW5pZmVzdCBmb3JtYXQgYW5kIHNhbXBsZSBpZGVudGl0eS4gRm9yIGEgbmV3IG1vZCwgdXNlIHRoZSBzY2hlbWEgMiBtYW5pZmVzdCBmcm9tIHRoZXNlIHR1dG9yaWFscy4KCi0tLQoKKipOZXh0OioqIFtUdXRvcmlhbCAzOiBBZGQgYSBtb25zdGVyXSgwMy1hZGQtYS1tb25zdGVyLm1kKSBtYWtlcyB0aGUgc2FtZSBtb3ZlIGluIGEgZGlmZmVyZW50IGZpbGUgYW5kIGNvdmVycyB0aGUgYmFzZSByZWZlcmVuY2UgdGhhdCB0aGUgY2hlY2tlciByZXBvcnRzIGJ5IG5hbWUuCg=="
  },
  {
    "id": "tutorial-03",
    "path": "tutorials/03-add-a-monster.md",
    "source": "local",
    "audience": "beginner",
    "title": "3. Add a monster",
    "note": "Build the same idea in another record file.",
    "encoded": "IyBUdXRvcmlhbCAzOiBBZGQgYSBtb25zdGVyCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBhIGNhcnBlbnRlciBhbnQsIGEgc2xpZ2h0bHkgbmFzdGllciBjb3VzaW4gb2YgdGhlIHNvbGRpZXIgYW50LCBsaXZpbmcgb24gZHVuZ2VvbiBsZXZlbCAyLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgMl0oMDItYWRkLWFuLWl0ZW0ubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBNb2QgZmlsZXMKCmBgYApteS1tb25zdGVyLW1vZC8KICBtYW5pZmVzdC5qc29uCiAgbW9uc3Rlci5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIHVzZXMgdHV0b3JpYWwgMSdzIHNjaGVtYSAyIGVudmVsb3BlIHdpdGggYSBuZXcgaWQsIG5hbWUsIHJlcG9zaXRvcnksIGFuZCBkZXNjcmlwdGlvbi4gVGhlIG5ldyBmaWxlIGlzIGBtb25zdGVyLmpzb25gOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbCiAgICB7CiAgICAgICJuYW1lIjogImNhcnBlbnRlciBhbnQiLAogICAgICAiYmFzZSI6ICJhbnQiLAogICAgICAiY29sb3IiOiAidSIsCiAgICAgICJzcGVlZCI6IDExMCwKICAgICAgImhpdC1wb2ludHMiOiAxMSwKICAgICAgImhlYXJpbmciOiAxMCwKICAgICAgInNtZWxsIjogMjAsCiAgICAgICJhcm1vci1jbGFzcyI6IDYsCiAgICAgICJzbGVlcGluZXNzIjogNDAsCiAgICAgICJkZXB0aCI6IDIsCiAgICAgICJyYXJpdHkiOiAxLAogICAgICAiZXhwZXJpZW5jZSI6IDYsCiAgICAgICJibG93IjogW3sgIm1ldGhvZCI6ICJCSVRFIiwgImVmZmVjdCI6ICJIVVJUIiwgImRhbWFnZSI6ICIxZDQiIH1dLAogICAgICAiZGVzYyI6IFsiQSBiaWcgYnJvd24gYW50IHdpdGggamF3cyB0aGF0IHN0cmlwIHdvb2QuIEl0IGlzIG5vdCBmdXNzeSBhYm91dCB3aGF0IGVsc2UgdGhleSBzdHJpcC4iXQogICAgfQogIF0KfQpgYGAKCiMjIFRoZSBvbmUgdGhpbmcgdGhhdCB3aWxsIGJpdGUgeW91CgpUaGUgYGJhc2VgIGZpZWxkIGNhdXNlcyB0aGUgbW9zdCB0cm91YmxlIGluIGEgZmlyc3QgbW9uc3RlciBtb2QuIEV2ZXJ5IG1vbnN0ZXIgaW5oZXJpdHMgZnJvbSBhICptb25zdGVyIGJhc2UqLCBhIHRlbXBsYXRlIHRoYXQgc2V0cyBpdHMgc3ltYm9sIG9uIHRoZSBtYXAsIHdoYXQgaXQgaXMgbWFkZSBvZiwgd2hpY2ggYXR0YWNrcyBpdCBjYW4gaGF2ZSwgYW5kIG1hbnkgb3RoZXIgZGVmYXVsdHMuIGBhbnRgIHNoaXBzIHdpdGggdGhlIGJhc2UgZ2FtZSwgYWxvbmcgd2l0aCBgY2FuaW5lYCwgYG9yY2AsIGBkcmFnb25gLCBhbmQgZmlmdHktb2RkIG90aGVycy4gVGhleSBsaXZlIGluIGBwYWNrYWdlcy9jb250ZW50L3BhY2svbW9uc3Rlcl9iYXNlLmpzb25gLCB3aGljaCBob2xkcyA1NiByZWNvcmRzIGFuZCBpcyBzaG9ydCBlbm91Z2ggdG8gcmVhZC4KCkEgd3JvbmcgYGJhc2VgIGdldHMgcmVwb3J0ZWQgdHdpY2UuIGBiYXNlYCBpcyBhIGRlY2xhcmVkIHJlZmVyZW5jZSwgc28gY29tcG9zaXRpb24gbmFtZXMgdGhlIHByb2JsZW0gb24geW91ciBtb2QncyByb3c6ICpiYXNlIG5hbWVzIHRoZSBtb25zdGVyIGJhc2UgImF1bnQiLCBhbmQgbm8gbG9hZGVkIHBhY2sgZGVmaW5lcyBpdCBpbiBtb25zdGVyX2Jhc2UqLiBUaGUgbW9uc3RlciBiaW5kZXIgdGhlbiBza2lwcyB0aGUgcmVjb3JkIGVudGlyZWx5LCBzbyBubyBtb25zdGVyIGdldHMgYnVpbHQgd2l0aG91dCBhIHRlbXBsYXRlLiBDb3B5IHRoZSBgYmFzZWAgZnJvbSBhbiBleGlzdGluZyBtb25zdGVyIG9mIHRoZSBraW5kIHlvdSBhcmUgbWFraW5nLCBhbmQgY2hlY2sgaXQgYWdhaW5zdCBgbW9uc3Rlcl9iYXNlLmpzb25gIGlmIHlvdSB0eXBlZCBpdCBmcm9tIG1lbW9yeS4KCkEgd3JvbmcgYmFzZSBpcyB0aGUgbW9zdCBjb21tb24gd2F5IGEgZmlyc3QgbW9uc3RlciBtb2QgZmFpbHMsIGFuZCBDb3JlJ3Mgc2FtcGxlIHRlc3QgY2hlY2tzIHRoYXQgdGhlIGJhc2UgZXhpc3RzLgoKIyMgUmVhZGluZyB0aGUgcmVzdAoKQXMgd2l0aCBpdGVtcywgZmluZCBhIG1vbnN0ZXIgY2xvc2UgdG8gd2hhdCB5b3Ugd2FudCBpbiBgcGFja2FnZXMvY29udGVudC9wYWNrL21vbnN0ZXIuanNvbmAgYW5kIGNvcHkgaXRzIHNoYXBlLgoKLSBgc3BlZWRgOiAxMTAgaXMgbm9ybWFsIHdhbGtpbmcgcGFjZSwgdGhlIHNhbWUgYXMgYW4gdW5oYXN0ZWQgcGxheWVyLiAxMjAgaXMgZmFzdCBlbm91Z2ggdG8gYmUgZGFuZ2Vyb3VzLgotIGBkZXB0aGAgYW5kIGByYXJpdHlgOiB3aGVyZSBpdCBsaXZlcyBhbmQgaG93IG9mdGVuIGl0IHNob3dzIHVwIHRoZXJlLgotIGBleHBlcmllbmNlYDogdGhlIHBsYXllciBnZXRzIGBleHBlcmllbmNlICogdGhlIG1vbnN0ZXIncyBsZXZlbCAvIHRoZSBwbGF5ZXIncyBsZXZlbGAsIHNvIHRoZSBzYW1lIG1vbnN0ZXIgaXMgd29ydGggc3RlYWRpbHkgbGVzcyBhcyB0aGUgY2hhcmFjdGVyIGdyb3dzLgotIGBzbGVlcGluZXNzYDogaG93IGxpa2VseSBpdCBpcyB0byBiZSBhc2xlZXAgd2hlbiB5b3UgYXJyaXZlLiAwIG1lYW5zIGl0IGlzIGFsd2F5cyBhd2FrZSBhbmQgY29taW5nIGZvciB5b3UuCi0gYGJsb3dgOiBhIGxpc3QuIEVhY2ggZW50cnkgaXMgYSBgbWV0aG9kYCAoaG93IGl0IGF0dGFja3MpLCBhbiBgZWZmZWN0YCAod2hhdCB0aGF0IGRvZXMgdG8geW91KSwgYW5kIGBkYW1hZ2VgIGRpY2UuIFRocmVlIGJsb3dzIG1lYW5zIHRocmVlIGF0dGFja3MgcGVyIHR1cm4uIFRoZSBhdmFpbGFibGUgbWV0aG9kcyBhbmQgZWZmZWN0cyBhcmUgaW4gYGJsb3dfbWV0aG9kcy5qc29uYCBhbmQgYGJsb3dfZWZmZWN0cy5qc29uYCBiZXNpZGUgdGhlIG1vbnN0ZXIgZmlsZS4KLSBgY29sb3JgOiBhIHNpbmdsZSBsZXR0ZXIsIGFuZCB0aGUgY2FzZSBtYXR0ZXJzLiBgdWAgaXMgVW1iZXIgKGJyb3duKSwgYHlgIGlzIFllbGxvdywgYW5kIGB3YCBpcyBXaGl0ZS4gYFdgIGlzIExpZ2h0IFNsYXRlLCB0aGUgc29sZGllciBhbnQncyBjb2xvci4gYHBhY2thZ2VzL2NvcmUvc3JjL2NvbG9yLnRzYCBpcyB0aGUgY2hhcnQuCgojIyBDaGVjayB0aGUgcmVzdWx0CgpTdGFydCBhIGNoYXJhY3RlciwgZGVzY2VuZCB0byBsZXZlbCAyLCBhbmQgbG9vayBmb3IgYSBicm93biBgYWAuIExvb2sgaXQgdXAgd2l0aCBgL2Agb3IgcmVjYWxsIGl0IHdpdGggYGxgLCBhbmQgdGhlIGdhbWUgZGVzY3JpYmVzIGl0IHdpdGggdGhlIHRleHQgeW91IHdyb3RlLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gTWFrZSBpdCBhIHVuaXF1ZTogYWRkIGAiZmxhZ3MiOiBbIlVOSVFVRSJdYCwgZ2l2ZSBpdCBhIGNhcGl0YWxpemVkIHByb3BlciBuYW1lLCBhbmQgZ2l2ZSBpdCBhIGxvdCBtb3JlIGhpdCBwb2ludHMuCi0gR2l2ZSBpdCBhIHNlY29uZCBibG93IGJ5IGFkZGluZyBhbm90aGVyIGVudHJ5IHRvIHRoZSBgYmxvd2AgYXJyYXkuCi0gTWFrZSBpdCBmYXN0IGFuZCBmcmFnaWxlOiBgc3BlZWRgIDEzMCwgYGhpdC1wb2ludHNgIDQuCi0gQWRkIGEgd2hvbGUgZmFtaWx5OiBzZXZlcmFsIHJlY29yZHMgaW4gb25lIGFycmF5LCBzaGFyaW5nIGEgYmFzZS4KCiMjIFRlc3QgYSBiYWQgYmFzZSByZWZlcmVuY2UKCkNoYW5nZSBgImJhc2UiOiAiYW50ImAgdG8gYCJiYXNlIjogImF1bnQiYCBhbmQgcmVsb2FkLiBDb21wb3NpdGlvbiByZXBvcnRzIHRoZSBtaXNzaW5nIGJhc2Ugb24geW91ciBtb2QncyByb3csIGFuZCB0aGUgYmluZGVyIGRvZXMgbm90IGJ1aWxkIHRoZSBhbnQuIFRoaXMgaXMgdGhlIGZhaWx1cmUgZGVzY3JpYmVkIGluIFtUaGUgb25lIHRoaW5nIHRoYXQgd2lsbCBiaXRlIHlvdV0oI3RoZS1vbmUtdGhpbmctdGhhdC13aWxsLWJpdGUteW91KSwgYW5kIG9uY2UgeW91IGhhdmUgdHJpZ2dlcmVkIGl0IHlvdXJzZWxmIHlvdSB3aWxsIHJlY29nbml6ZSBpdCBxdWlja2x5IGluIHlvdXIgb3duIG1vZHMuCgojIyBXaGF0IGl0IGxvb2tzIGxpa2UsIGFuZCB0aGUgb25lIHRoaW5nIHlvdSBoYXZlIHRvIGFzayBmb3IKCllvdXIgYW50J3MgYXBwZWFyYW5jZSBoYXMgdHdvIHBhcnRzLCBhbmQgeW91IHdyb3RlIG9uZSBvZiB0aGVtOgoKLSBgImNvbG9yIjogInUiYCBpcyB5b3VyczogdW1iZXIsIHNvIGl0IGRyYXdzIGFzIGEgYnJvd24gYGFgIGFuZCByZWFkcyBhcyBhIGRpZmZlcmVudCBjcmVhdHVyZSBmcm9tIHRoZSB3aGl0ZSBgYWAgYmVzaWRlIGl0LgotIFRoZSBsZXR0ZXIgYGFgIGNvbWVzIGZyb20gYCJiYXNlIjogImFudCJgLCBhbG9uZyB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSB0aGUgdGVtcGxhdGUgY2Fycmllcy4gQ2hhbmdlIHRoZSBiYXNlIGFuZCB0aGUgbGV0dGVyIGNoYW5nZXMuCgpJbiBhIHRpbGUgc2V0LCB5b3VyIGFudCBoYXMgbm8gcGljdHVyZSwgYW5kIHRoZSBnYW1lIGRvZXMgbm90IG1ha2Ugb25lIHVwLiBBIHRpbGUgc2V0IG1hcHMgbmFtZWQgbW9uc3RlcnMgdG8gcGljdHVyZXMgYW5kIGhhcyBubyBlbnRyeSBmb3IgeW91cnMsIHNvIGluIHRpbGUgbW9kZSBhIHBsYXllciBzZWVzIHlvdXIgYnJvd24gYGFgIHN0YW5kaW5nIGFtb25nIHBpY3R1cmVzLiBPbGRlciB2ZXJzaW9ucyBkcmV3IGFuIGFkZGVkIG1vbnN0ZXIgd2l0aCB0aGUgdGlsZSBvZiBhIHJlbGF0aXZlIHNoYXJpbmcgaXRzIGBiYXNlYCwgYW5kIDAuMjMuMCByZW1vdmVkIHRoYXQuIE5lbyBBbmdiYW5kIGlzIGEgZmFpdGhmdWwgcG9ydCBvZiA0LjIuNiwgYW5kIDQuMi42IGhhcyBubyBydWxlIGZvciBkcmF3aW5nIGEgY3JlYXR1cmUgaXQgaGFzIG5ldmVyIGhlYXJkIG9mLiBQaWNraW5nIGEgcGljdHVyZSBmb3IgYW4gdW5rbm93biBjcmVhdHVyZSBpcyBsZWZ0IHRvIHRoZSB0aWxlIHNldC4KClNoaXAgdGlsZXMgd2l0aCB5b3VyIGNvbnRlbnQgaWYgeW91IGNhbiwgYW5kIGlmIHlvdSBkbyBub3QsIHNheSBzbyBpbiB5b3VyIG1vZCdzIGRlc2NyaXB0aW9uLiBUd28gc2VudGVuY2VzIHRoZXJlIHRlbGwgYSBwbGF5ZXIgd2hhdCB0aGV5IGFyZSBsb29raW5nIGF0LCBzbyBhIGxldHRlciBhbW9uZyBwaWN0dXJlcyBkb2VzIG5vdCBsb29rIGxpa2UgYSBicm9rZW4gbW9kOgoKPiBJbmNsdWRlcyB0aWxlcyBmb3IgdGhlIGNhcnBlbnRlciBhbnQuCgpvcgoKPiBObyB0aWxlcyBvZiBpdHMgb3duOiBpbiB0aWxlIG1vZGUgdGhlIGNhcnBlbnRlciBhbnQgZHJhd3MgYXMgYSBsZXR0ZXIuIEluc3RhbGwgW2xpbm9sZXVtXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtbGlub2xldW0pIGFuZCBpdCBpcyBkcmF3biBmcm9tIGl0cyBmYW1pbHkgaW5zdGVhZC4KClRoZSBzZWNvbmQgZGVzY3JpcHRpb24gcG9pbnRzIHBsYXllcnMgYXQgYSB3b3JraW5nIGZhbGxiYWNrLiBMaW5vbGV1bSwgdGhlIGxvb3NlLXBhY2sgdGlsZSBtb2QsIGRyYXdzIGNvbnRlbnQgdGhhdCBoYXMgbm8gdGlsZTogYW4gYWRkZWQgbW9uc3RlciBnZXRzIHRoZSB0aWxlIG9mIGEgcmVsYXRpdmUgc2hhcmluZyBpdHMgYGJhc2VgLCB3aXRoIHRoZSBjb2xvciB0dXJuZWQsIHNvIHlvdXIgY2FycGVudGVyIGFudCBsb29rcyBsaWtlIGFuIGFudCB3aXRob3V0IG1hdGNoaW5nIHRoZSBiYXNlIGdhbWUncyBhbnQgcGl4ZWwgZm9yIHBpeGVsLiBUaGlzIHdvcmtzIHdpdGggTGlub2xldW0ncyBvd24gcGFja3Mgb25seS4gQW5nYmFuZCdzIG93biB0aWxlIHNoZWV0cyBoYXZlIG5vIHNwYXJlIGNlbGwgZm9yIGEgdmFyaWFudCwgc28gdW5kZXIgdGhlbSBhbiBhZGRlZCBjcmVhdHVyZSBkcmF3cyBhcyBhIGxldHRlci4gUGxheWVycyB0dXJuIExpbm9sZXVtIG9uIHRoZW1zZWx2ZXMuIFlvdXIgbW9kIGlzIGNvbXBsZXRlIGFuZCBjb3JyZWN0IGluIEFTQ0lJIHdpdGggbm8gdGlsZSBzZXQgYXQgYWxsLCBzbyBkbyBub3QgbGlzdCBMaW5vbGV1bSBhcyBhIHJlcXVpcmVtZW50LiBNZW50aW9uIGl0IGFuZCBsZXQgdGhlIHBsYXllciBjaG9vc2UuCgpgYmFzZWAgc2V0cyB0aGUgbGV0dGVyIGFuZCB0aGUgdGVtcGxhdGUsIGFuZCBmb3IgYW55b25lIHJ1bm5pbmcgYSB0aWxlIG1vZCB0aGF0IGZpbGxzIGJsYW5rcywgaXQgYWxzbyBzZXRzIHRoZSBmYW1pbHkgeW91ciBtb25zdGVyIGJvcnJvd3MgYSBwaWN0dXJlIGZyb20uIFBpY2sgaXQgd2l0aCB0aGF0IGluIG1pbmQuCgpBIG1vZCBjYW4gYWxzbyBhc2sgZm9yIGEgc3BlY2lmaWMgcGljdHVyZS4gQm90aCB3YXlzIHRvIGRvIGl0IGdvIGJleW9uZCB0aGlzIHR1dG9yaWFsOgoKLSBQb2ludCBhdCBhIHBpY3R1cmUgdGhhdCBhbHJlYWR5IGV4aXN0cy4gRGVjbGFyZSBhIEpTT04gcHJlZmVyZW5jZXMgZG9jdW1lbnQgYXMgYSBgcHJlZnNgIHJlc291cmNlLCB3aXRoIHRpbGUgYXNzaWdubWVudHMgZm9yIHRoZSB0YXJnZXQgZ3JhcGhpY3MgcGFjay4gQXRsYXMgY29vcmRpbmF0ZXMgYmVsb25nIHRvIHRoYXQgcGFjaywgc28gYSBjb29yZGluYXRlIGZyb20gb25lIHBhY2sgY2FuIHNob3cgdGhlIHdyb25nIHRpbGUgaW4gYW5vdGhlci4gU2VlIFtDb3JlJ3MgSlNPTiBwcmVmZXJlbmNlIGZvcm1hdF0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0FVVEhPUklORy5tZCNzaGlwcGluZy1yZXNvdXJjZXMtc291bmRzLWEtZm9udC1wcmVmLWZpbGVzLWhlbHAtcGFnZXMtYXJ0KS4KLSBTaGlwIGEgd2hvbGUgdGlsZSBzZXQuIEEgbW9kIHdpdGggdGhlIGB0aWxlc2AgZmFjZXQgY29udHJpYnV0ZXMgYSBncmFwaGljcyBtb2RlIG9mIGl0cyBvd24gKGB0aWxlUGFja3NgKSwgYW5kIHRoZSBMaW5vbGV1bSBzZXRzIGFyZSBkZWxpdmVyZWQgdGhpcyB3YXkuIFRoZSBwbGF5ZXIgcGlja3MgdGhlIHdob2xlIHNldCBmcm9tIHRoZSBHcmFwaGljcyBtZW51LiBOb3RoaW5nIHN1cHBvcnRzIGFkZGluZyBvbmUgcGljdHVyZSB0byBzb21lYm9keSBlbHNlJ3Mgc2V0IHRvZGF5LgoKU2VlIFttb2RkaW5nL1JFQURNRS5tZF0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL1JFQURNRS5tZCkgZm9yIGJvdGguCgojIyBDaGFuZ2luZyBhIG1vbnN0ZXIgdGhhdCBhbHJlYWR5IGV4aXN0cwoKT25lIGZpbGUgY2FuIGFkZCByZWNvcmRzIGFuZCBwYXRjaCBleGlzdGluZyBvbmVzLCBhbmQgdGhlIGZpbmlzaGVkIG1vZCBkb2VzIGJvdGguIEhlcmUgaXMgdGhlIHBhdGNoaW5nIGZyb20gW1R1dG9yaWFsIDFdKDAxLXR3ZWFrLWEtdmFsdWUubWQpIGFwcGxpZWQgdG8gYSBtb25zdGVyOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbIC4uLiB5b3VyIGNhcnBlbnRlciBhbnQgLi4uIF0sCiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOmdpYW50LWJsYWNrLWFudCI6IFsKICAgICAgeyAib3AiOiAiYWRkIiwgInBhdGgiOiAiaGl0LXBvaW50cyIsICJ2YWx1ZSI6IDMgfSwKICAgICAgeyAib3AiOiAiYWRkRmxhZyIsICJwYXRoIjogImZsYWdzIiwgImZsYWciOiAiR1JPVVBfQUkiIH0KICAgIF0KICB9Cn0KYGBgCgpHaWFudCBibGFjayBhbnRzIG5vdyBoYXZlIGEgbGl0dGxlIG1vcmUgaGVhbHRoIGFuZCBodW50IGluIGdyb3Vwcy4KCi0gYGFkZGAgYWRqdXN0cyB0aGUgY3VycmVudCB2YWx1ZS4gYHsib3AiOiAiYWRkIiwgInBhdGgiOiAiaGl0LXBvaW50cyIsICJ2YWx1ZSI6IDN9YCBtZWFucyAidGhyZWUgbW9yZSB0aGFuIHdoYXRldmVyIGl0IGlzIiwgc28gdGhlIHBhdGNoIHN0aWxsIGdpdmVzIHRoZSBpbnRlbmRlZCByZXN1bHQgaWYgdGhlIGJhc2UgZ2FtZSByZXR1bmVzIHRoZSBtb25zdGVyIG9yIGFub3RoZXIgbW9kIGNoYW5nZWQgaXQgZmlyc3QuIGBzZXRgIHdvdWxkIHNpbGVudGx5IHVuZG8gYm90aC4KLSBgYWRkRmxhZ2AgY29tcG9zZXMuIFR3byBtb2RzIGFkZGluZyBkaWZmZXJlbnQgZmxhZ3MgdG8gdGhlIHNhbWUgbW9uc3RlciBib3RoIGdldCB0aGVpciBmbGFnLCB3aXRoIG5vIGNvbmZsaWN0LiBgYWRkRmxhZ2AsIGByZW1vdmVGbGFnYCwgYW5kIGBhcHBlbmRgIGNvbXBvc2UgdGhpcyB3YXkuIFdpdGggYHNldGAsIGBtZXJnZWAsIGBhZGRgLCBvciBgbXVsYCwgdHdvIG1vZHMgb24gdGhlIHNhbWUgZmllbGQgaXMgYSByZXBvcnRlZCBjb25mbGljdCwgYW5kIHRoZSBtb2QgdGhhdCBsb2FkcyBsYXN0IHdpbnMuCgpBIHBhdGNoZWQgbW9uc3RlciBrZWVwcyBpdHMgcGljdHVyZSwgYmVjYXVzZSB0aGUgdGlsZSBzZXQgYWxyZWFkeSBrbm93cyBpdCBieSBuYW1lLiBPbmx5IHRoZSBhbnQgeW91IGFkZGVkIGhhcyBub3RoaW5nIGRyYXduIGZvciBpdC4KCiMjIFNhbXBsZSBtb2QKCltDb3JlJ3MgaGlzdG9yaWNhbCB0dXRvcmlhbC0wMy1hZGQtYS1tb25zdGVyIHNhbXBsZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvdHJlZS9tYXN0ZXIvc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDMtYWRkLWEtbW9uc3RlcikgY29udGFpbnMgdGhlIGNvbnRlbnQgY29udHJpYnV0aW9uLiBJdCB1c2VzIGFuIG9sZGVyIG1hbmlmZXN0IGZvcm1hdCBhbmQgc2FtcGxlIGlkZW50aXR5LiBVc2UgdGhlIHNjaGVtYSAyIG1hbmlmZXN0IGZyb20gdGhlc2UgdHV0b3JpYWxzIGZvciBhIG5ldyBtb2QuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgNDogQ2hhbmdlIGEgc3BlbGxdKDA0LWNoYW5nZS1hLXNwZWxsLm1kKSBjb3ZlcnMgcmVhY2hpbmcgaW50byBhIGNsYXNzJ3Mgc3BlbGwgbGlzdCBhbmQgd2hhdCBhIHBvc2l0aW9uYWwgcGF0aCBjb3N0cyB5b3UuCg=="
  },
  {
    "id": "tutorial-04",
    "path": "tutorials/04-change-a-spell.md",
    "source": "local",
    "audience": "beginner",
    "title": "4. Change a spell",
    "note": "Reach into a class and understand a positional path.",
    "encoded": "IyBUdXRvcmlhbCA0OiBDaGFuZ2UgYSBzcGVsbAoKKipXaGF0IHlvdSB3aWxsIG1ha2U6KiogYSBQcmllc3Qgd2hvc2UgTWlub3IgSGVhbGluZyBjb3N0cyAxIG1hbmEgaW5zdGVhZCBvZiAyIGFuZCBhbG1vc3QgbmV2ZXIgZmFpbHMuCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCAzXSgwMy1hZGQtYS1tb25zdGVyLm1kKS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCi0tLQoKIyMgTW9kIGZpbGVzCgpgYGAKbXktc3BlbGwtbW9kLwogIG1hbmlmZXN0Lmpzb24KICBjbGFzcy5qc29uCmBgYAoKQ29weSB0dXRvcmlhbCAxJ3Mgc2NoZW1hIDIgbWFuaWZlc3QgYW5kIGdpdmUgaXQgYSBuZXcgaWQsIG5hbWUsIHJlcG9zaXRvcnksIGFuZCBkZXNjcmlwdGlvbi4gS2VlcCBpdHMgQ29yZSBkZXBlbmRlbmN5LgoKYGNsYXNzLmpzb25gOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnByaWVzdCI6IFsKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4wLnNwZWxsLjIubWFuYSIsICJ2YWx1ZSI6IDEgfSwKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4wLnNwZWxsLjIuZmFpbCIsICJ2YWx1ZSI6IDUgfQogICAgXQogIH0KfQpgYGAKClRoZXNlIGFyZSB0aGUgc2FtZSBgZmllbGRQYXRjaGVzYCB5b3UgdXNlZCBpbiBUdXRvcmlhbCAxLCBhaW1lZCBhdCBhIGNsYXNzIHRoaXMgdGltZS4gVGhlIHRhcmdldCBpcyB0aGUgb25seSBuZXcgcGFydC4KCiMjIFJlYWRpbmcgdGhlIHBhdGgKCmBib29rLjAuc3BlbGwuMi5tYW5hYCB3YWxrcyBkb3duIHRocm91Z2ggdGhlIFByaWVzdCdzIHJlY29yZDoKCi0gYGJvb2suMGA6IHRoZSBQcmllc3QncyBmaXJzdCBzcGVsbCBib29rLgotIGBzcGVsbC4yYDogdGhlIHRoaXJkIHNwZWxsIGluIGl0IChjb3VudGluZyBmcm9tIHplcm8pLiBUaGF0IGlzIE1pbm9yIEhlYWxpbmcuCi0gYG1hbmFgOiBpdHMgY29zdC4KCmBmYWlsYCBpcyB0aGUgcGVyY2VudGFnZSBjaGFuY2UgdGhhdCB0aGUgc3BlbGwgZml6emxlcywgYmVmb3JlIHlvdXIgY2hhcmFjdGVyJ3Mgc3RhdHMgYWRqdXN0IGl0LgoKVG8gZmluZCB0aGUgc3BlbGwgeW91IHdhbnQsIG9wZW4gYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9jbGFzcy5qc29uYCwgZmluZCB5b3VyIGNsYXNzLCBhbmQgY291bnQuIEJvb2tzIGFuZCBzcGVsbHMgYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyIGFzIGluIHRoZSBnYW1lJ3Mgc3BlbGwgbWVudSwgc28geW91IGNhbiBhbHNvIGNvdW50IHRoZW0gb24gc2NyZWVuLgoKIyMgUG9zaXRpb25hbCBwYXRocyBjYW4gdGFyZ2V0IHRoZSB3cm9uZyBzcGVsbAoKRWFjaCBudW1iZXIgaW4gdGhlIHBhdGggaXMgYSBwb3NpdGlvbi4gYHNwZWxsLjJgIG1lYW5zIHdoYXRldmVyIHNwZWxsIHNpdHMgdGhpcmQgaW4gdGhlIGJvb2ssIHdoZXRoZXIgb3Igbm90IHRoYXQgaXMgTWlub3IgSGVhbGluZy4gSWYgYW5vdGhlciBtb2QgaW5zZXJ0cyBhIHNwZWxsIGFib3ZlIGl0LCBvciBhIGZ1dHVyZSByZWxlYXNlIG9mIHRoZSBiYXNlIGdhbWUgcmVvcmRlcnMgdGhhdCBib29rLCB5b3VyIHBhdGNoIGNoYW5nZXMgYSBkaWZmZXJlbnQgc3BlbGwgYW5kIGdpdmVzIG5vIHdhcm5pbmcsIGJlY2F1c2UgdGhlIHBhdGNoIHN0aWxsIGFwcGxpZXMgY2xlYW5seS4KClBvc2l0aW9uYWwgcGF0aHMgYXJlIGhvdyB0aGUgZGF0YSBpcyBzaGFwZWQsIGFuZCB0aGVyZSBpcyBubyB3YXkgYXJvdW5kIHRoZW0gdG9kYXkuIElmIHlvdSBwdWJsaXNoIGEgc3BlbGwgbW9kLCBzYXkgd2hpY2ggcmVsZWFzZSB5b3UgYnVpbHQgaXQgYWdhaW5zdCBhbmQgcmUtY2hlY2sgaXQgd2hlbiB0aGUgZ2FtZSB1cGRhdGVzLiBDb3JlJ3Mgc2FtcGxlIHRlc3QgYXNzZXJ0cyB0aGF0IGBib29rLjAuc3BlbGwuMmAgaXMgc3RpbGwgY2FsbGVkIE1pbm9yIEhlYWxpbmcsIHNvIGEgcmVvcmRlciBmYWlscyB0aGF0IHRlc3QgYmVmb3JlIGl0IGNhbiBtYWtlIHRoaXMgcGFnZSB3cm9uZy4KCiMjIEFkZGluZyBhIHNwZWxsIHJhdGhlciB0aGFuIGNoYW5naW5nIG9uZQoKQWRkaW5nIGEgc3BlbGwgdXNlcyB0aGUgc2FtZSBtZWNoYW5pc20gd2l0aCBvbmUgZXh0cmEgc3RlcC4gYHNldGAgYSB3aG9sZSBzcGVsbCBvYmplY3QgYXQgdGhlIG5leHQgZnJlZSBpbmRleCwgdGhlbiByYWlzZSB0aGUgYm9vaydzIGBzcGVsbHNgIGNvdW50IHNvIHRoZSBnYW1lIHJlYWRzIHRoZSBsb25nZXIgYm9vazoKCmBgYGpzb24KewogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpwcmllc3QiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImJvb2suMi5zcGVsbC42IiwgInZhbHVlIjogeyAibmFtZSI6ICJUZWxlcG9ydCBPdGhlciIsICJsZXZlbCI6IDE4LCAibWFuYSI6IDEwLCAiZmFpbCI6IDMwLCAiZXhwIjogMjAsICJlZmZlY3QiOiBbIHsgImVmZiI6ICJCT0xUX1NUQVRVUyIsICJ0eXBlIjogIkFXQVlfQUxMIiwgImRpY2UiOiAiJEIiLCAiZXhwciI6IFsgeyAibmFtZSI6ICJCIiwgImJhc2UiOiAiUExBWUVSX0xFVkVMIiwgImV4cHIiOiAiKiAzIiB9IF0gfSBdLCAiZGVzYyI6IFsiUHJvZHVjZXMgYSBib2x0IHRoYXQgdGVsZXBvcnRzIGF3YXkgdGhlIGZpcnN0IG1vbnN0ZXIgaW4gaXRzIHBhdGguIl0gfSB9LAogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJib29rLjIuc3BlbGxzIiwgInZhbHVlIjogNyB9CiAgICBdCiAgfQp9CmBgYAoKVGhlIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QgZG9lcyB0aGlzIHRvIGdpdmUgdGhlIFByaWVzdCBiYWNrIGEgc3BlbGwgdGhhdCBhIGxhdGVyIHZlcnNpb24gb2YgQW5nYmFuZCBkcm9wcGVkLCBhbmQgdGhlc2UgZm91ciBudW1iZXJzIGFyZSB0aGUgb25lcyBpdCBzaGlwcy4KClRoZSBudW1iZXJzIGRpZmZlciBmcm9tIHRoZSBvbGQgZ2FtZSdzLiBBbmdiYW5kIDQuMS4yIGdhdmUgdGhlIFByaWVzdCB0aGlzIHNwZWxsIGFzIGBUZWxlcG9ydCBPdGhlcjoyMDoyMDo4MDoxNmAsIGluIHRoYXQgZmlsZSdzIGBuYW1lOmxldmVsOm1hbmE6ZmFpbDpleHBgIG9yZGVyLCBhbmQgQ29yZSBrZWVwcyB0aG9zZSByZWNvcmRzIGF0IGByZWZlcmVuY2UvbGliL2dhbWVkYXRhL29sZF9jbGFzcy50eHRgLiBBbmdiYW5kIDQuMiB0aGVuIHJlcHJpY2VkIHNwZWxscyBzbyBlYWNoIG9uZSBjb3N0cyB0aGUgc2FtZSBpbiBldmVyeSBjbGFzcyB0aGF0IGhhcyBpdCwgYW5kIGJvdGggY2xhc3NlcyB0aGF0IHN0aWxsIGhhdmUgVGVsZXBvcnQgT3RoZXIgcGF5IDEwIG1hbmEgYXQgMzAgcGVyY2VudCBmYWlsdXJlLiBDb3B5aW5nIDIwIGFuZCA4MCBpbnRvIHRoZSBjdXJyZW50IGdhbWUgd291bGQgY2hhcmdlIGEgUHJpZXN0IHR3aWNlIHRoZSBtYW5hIGEgTWFnZSBwYXlzIGZvciB0aGUgc2FtZSBzcGVsbC4gV2hlbiB5b3UgcmVzdG9yZSBzb21ldGhpbmcsIHJlYWQgdGhlIG9sZCBkYXRhLCB0aGVuIGNoZWNrIHdoZXRoZXIgaXRzIHVuaXRzIHN0aWxsIG1lYW4gd2hhdCB0aGV5IG1lYW50LiBbRmVhdHVyZSByZXN0b3JhdGlvbl0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0ZFQVRVUkVfUkVTVE9SQVRJT04ubWQpIHNldHMgb3V0IHRoaXMgcnVsZSwgYW5kIGl0cyB3b3JrZWQgZXhhbXBsZSBpcyB0aGlzIHNwZWxsLgoKVGhlIGBlZmZlY3RgIGJsb2NrIHVzZXMgdGhlIGdhbWUncyBvd24gZWZmZWN0IHZvY2FidWxhcnk6IGBCT0xUX1NUQVRVU2AsIGBQTEFZRVJfTEVWRUxgLCBhbmQgZGljZSBleHByZXNzaW9ucy4gWW91IGNhbiBnbyBiZXlvbmQgdGhlIGVmZmVjdHMgdGhlIGJhc2UgZ2FtZSBzaGlwcywgYnV0IGEgbmV3IGVmZmVjdCBuZWVkcyBjb2RlLCB3aGljaCBbVHV0b3JpYWwgNV0oMDUtaG9vay1iZWhhdmlvdXIubWQpIGFuZCB0aGUgcGFnZXMgYWZ0ZXIgaXQgY292ZXIuCgojIyBDaGVjayB0aGUgcmVzdWx0CgpSb2xsIGEgUHJpZXN0LCBsZWFybiBNaW5vciBIZWFsaW5nLCBhbmQgb3BlbiB0aGUgc3BlbGwgbWVudS4gVGhlIG1hbmEgY29zdCByZWFkcyAxLCBhbmQgdGhlIGZhaWx1cmUgcmF0ZSBpcyBmYXIgbG93ZXIgdGhhbiBhbiB1bm1vZGRlZCBQcmllc3QncyBhdCB0aGUgc2FtZSBsZXZlbC4KCiMjIFZhcmlhdGlvbnMgdG8gdHJ5CgotIFJldHVuZSBhIGRpZmZlcmVudCBjbGFzczogYGNvcmU6bWFnZWAsIGBjb3JlOnJhbmdlcmAsIGBjb3JlOnBhbGFkaW5gLgotIE1vdmUgYSBzcGVsbCBlYXJsaWVyOiBzZXQgaXRzIGBsZXZlbGAgdG8gMSB0byBnZXQgaXQgYXQgY2hhcmFjdGVyIGNyZWF0aW9uLgotIE1ha2UgYSBjbGFzcyB3b3JzZSBhdCBzb21ldGhpbmcuIEEgd2Vha25lc3MgaXMgb2Z0ZW4gd2hhdCBtYWtlcyBhIHZhcmlhbnQgaW50ZXJlc3RpbmcgdG8gcGxheS4KCiMjIFNhbXBsZSBtb2QKCltDb3JlJ3MgaGlzdG9yaWNhbCB0dXRvcmlhbC0wNC1jaGFuZ2UtYS1zcGVsbCBzYW1wbGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL3RyZWUvbWFzdGVyL3NhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTA0LWNoYW5nZS1hLXNwZWxsKSBob2xkcyB0aGUgY29udGVudCBjb250cmlidXRpb24gZm9yIHRoaXMgdHV0b3JpYWwuIEl0IHVzZXMgYW4gb2xkZXIgbWFuaWZlc3QgZm9ybWF0IGFuZCBzYW1wbGUgaWRlbnRpdHksIHNvIHN0YXJ0IGEgbmV3IG1vZCBmcm9tIHRoZSBzY2hlbWEgMiBtYW5pZmVzdCBpbiB0aGVzZSB0dXRvcmlhbHMuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgNTogSG9vayBiZWhhdmlvcl0oMDUtaG9vay1iZWhhdmlvdXIubWQpLCB0aGUgZmlyc3QgdHV0b3JpYWwgd2hlcmUgeW91ciBtb2QgcnVucyBjb2RlLiBUaGUgZWFybGllciB0dXRvcmlhbHMgc2hpcCBkYXRhIG9ubHkuCg=="
  },
  {
    "id": "tutorial-05",
    "path": "tutorials/05-hook-behaviour.md",
    "source": "local",
    "audience": "beginner",
    "title": "5. Hook behaviour",
    "note": "Write a ten-line plugin that changes behaviour.",
    "encoded": "IyBUdXRvcmlhbCA1OiBIb29rIG9uZSBwaWVjZSBvZiBiZWhhdmlvcgoKKipXaGF0IHlvdSB3aWxsIG1ha2U6KiogdGhlIGdhbWUgY29uZ3JhdHVsYXRpbmcgeW91IHdoZW4geW91IGdhaW4gYSBsZXZlbC4KCioqQmVmb3JlIHRoaXM6KiogW1R1dG9yaWFsIDRdKDA0LWNoYW5nZS1hLXNwZWxsLm1kKS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCioqTmV3IGlkZWE6KiogeW91ciBtb2QgcnVucyBjb2RlLiBJdCBpcyBzdGlsbCBvbmUgYC5qc2AgZmlsZSBiZXNpZGUgdGhlIG1hbmlmZXN0LCB3aXRoIG5vIGNvbXBpbGVyLCBidWlsZCBzdGVwLCBvciBkZXBlbmRlbmNpZXMuCgotLS0KCiMjIE1vZCBmaWxlcwoKYGBgCm15LWNvZGUtbW9kLwogIG1hbmlmZXN0Lmpzb24KICBwbHVnaW4uanMKYGBgCgpgbWFuaWZlc3QuanNvbmAgZGVjbGFyZXMgYW4gaW4tcHJvY2VzcyBwbHVnaW4gYW5kIHRoZSBBUEkgMiByYW5nZToKCmBgYGpzb24KewogICJmb3JtYXQiOiAibmVvLWFuZ2JhbmQvbW9kL21hbmlmZXN0IiwKICAic2NoZW1hVmVyc2lvbiI6IDIsCiAgImRhdGEiOiB7CiAgICAiaWQiOiAibXktY29kZS1tb2QiLAogICAgIm5hbWUiOiAiTXkgQ29kZSBNb2QiLAogICAgInZlcnNpb24iOiAiMS4wLjAiLAogICAgInNoYXBlIjogInBsdWdpbiIsCiAgICAiZmFjZXRzIjogWwogICAgICAicGx1Z2luIgogICAgXSwKICAgICJhcGkiOiAiPj0yLjAuMCA8My4wLjAiLAogICAgInJ1bnRpbWUiOiAiaW4tcHJvY2VzcyIsCiAgICAiZW5naW5lIjogewogICAgICAicmFuZ2UiOiAiPj0xLjIzLjAtYmV0YS4zIiwKICAgICAgImJlY2F1c2UiOiAiVGhpcyBtb2QgdGFyZ2V0cyB0aGUgcHVibGlzaGVkIDEuMjMuMC1iZXRhLjMgU0RLLiIKICAgIH0sCiAgICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgICAibGljZW5zZSI6ICJHUEwtMi4wLW9ubHkiLAogICAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3lvdS9teS1jb2RlLW1vZCIsCiAgICAiZGVwZW5kZW5jaWVzIjogewogICAgICAicmVxdWlyZWQiOiB7CiAgICAgICAgImNvcmUiOiB7CiAgICAgICAgICAicmFuZ2UiOiAiKiIKICAgICAgICB9CiAgICAgIH0KICAgIH0sCiAgICAiYWZmZWN0c0dhbWVwbGF5IjogZmFsc2UsCiAgICAiZGVzY3JpcHRpb24iOiAiQ29uZ3JhdHVsYXRlcyB5b3Ugb24gZ2FpbmluZyBhIGxldmVsLiIKICB9Cn0KYGBgCgpgc2hhcGVgIGFuZCBgZmFjZXRzYCBkZWNsYXJlIHRoZSBwbHVnaW4uIGBydW50aW1lYCBzZWxlY3RzIGluLXByb2Nlc3MgZXhlY3V0aW9uLCBhbmQgYGFwaWAgbmFtZXMgdGhlIG1vZCBBUEkgdmVyc2lvbnMgdGhlIHBsdWdpbiB3b3JrcyB3aXRoLiBUaGUgaG9vayBydW5zIHN5bmNocm9ub3VzbHkgaW4gdGhlIGdhbWUgcHJvY2Vzcy4KCmBwbHVnaW4uanNgOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogIj49Mi4wLjAgPDMuMC4wIiwKCiAgaG9va3MoKSB7CiAgICByZXR1cm4gewogICAgICBtZXNzYWdlVGV4dDogKHJhdykgPT4KICAgICAgICByYXcuc3RhcnRzV2l0aCgiV2VsY29tZSB0byBsZXZlbCAiKSA/IGBDb25ncmF0dWxhdGlvbnMhICR7cmF3fWAgOiByYXcsCiAgICB9OwogIH0sCn07CmBgYAoKVGhvc2UgdGVuIGxpbmVzIGFyZSBhbGwgdGhlIGNvZGUgdGhlIG1vZCBuZWVkcy4KCiMjIFdoYXQgaXMgaGFwcGVuaW5nCgpBIG1vZCB0aGF0IHJ1bnMgY29kZSBkZWZhdWx0LWV4cG9ydHMgb25lIG9iamVjdCwgYW5kIHRoZSBnYW1lIGNhbGxzIG1ldGhvZHMgb24gdGhhdCBvYmplY3QuCgpgaG9va3MoKWAgcmV0dXJucyBhIHBsYWluIG9iamVjdCB3aG9zZSBrZXlzIGFyZSAqKmJlaGF2aW9yIHBvaW50cyoqLCB0aGUgcGxhY2VzIHdoZXJlIHRoZSBnYW1lIGNvbnN1bHRzIGEgbW9kIGJlZm9yZSBkb2luZyBzb21ldGhpbmcuIFRoZSBwdWJsaXNoZWQgQVBJIDIgaG9vayBjb250cmFjdCBsaXN0cyB0aGUgYXZhaWxhYmxlIGhvb2tzLiBXcml0ZSBrZXlzIGZvciB0aGUgaG9va3MgeW91IHdhbnQgYW5kIGxlYXZlIHRoZSByZXN0IG91dC4gVGhlIGdhbWUgbmV2ZXIgY29uc3VsdHMgeW91ciBtb2QgYXQgYSBwb2ludCB5b3UgbGVhdmUgb3V0LCBhbmQgYW4gb21pdHRlZCBrZXkgY29zdHMgbm90aGluZy4KCmBtZXNzYWdlVGV4dGAgaXMgdGhlIHNpbXBsZXN0IGhvb2suIEV2ZXJ5IG1lc3NhZ2UgdGhlIHBsYXllciBzZWVzIHBhc3NlcyB0aHJvdWdoIGl0IG9uIHRoZSB3YXkgdG8gdGhlIG1lc3NhZ2UgbGluZSwgYW5kIHRoZSBnYW1lIHNob3dzIHdoYXRldmVyIHN0cmluZyB5b3UgcmV0dXJuLgoKYHBsdWdpbi5qc2AgaGFzIG5vIGltcG9ydHMuIFRoZSBnYW1lIGxvYWRzIGl0IGZyb20geW91ciBmb2xkZXIgYXMgYSBwbGFpbiBFUyBtb2R1bGUgYW5kIHBhc3NlcyB0aGUgZW5naW5lIGluIHRvIHRoZSBmdW5jdGlvbnMgdGhhdCBuZWVkIGl0LiBCZWNhdXNlIG9mIHRoYXQsIGEgbW9kIG5lZWRzIG5vIGJ1aWxkIG9yIGJ1bmRsZSBzdGVwIGFuZCBkb2VzIG5vdCBoYXZlIHRvIHRyYWNrIHRoZSBnYW1lJ3MgaW50ZXJuYWwgbW9kdWxlIGxheW91dC4gVG8gc3BsaXQgeW91ciBjb2RlIGFjcm9zcyBmaWxlcywgYGltcG9ydCAiLi9saWIvd2hhdGV2ZXIuanMiYCBmcm9tIHlvdXIgb3duIGZvbGRlci4gUmVsYXRpdmUgcGF0aHMgd29yayBvbiBib3RoIHRoZSBkZXNrdG9wIGFuZCBicm93c2VyIGJ1aWxkcy4KCiMjIE9uZSBydWxlIGFib3V0IHRoaXMgaG9vawoKQSBtZXNzYWdlIGhvb2sgbWF5IHJlc3RhdGUgYSBtZXNzYWdlLiBJdCBtdXN0IG5ldmVyIGNoYW5nZSB3aGF0IHRoZSBtZXNzYWdlIG1lYW5zLgoKUHV0dGluZyAiQ29uZ3JhdHVsYXRpb25zISIgaW4gZnJvbnQgb2YgYSBsZXZlbC11cCBtZXNzYWdlIHJlc3RhdGVzIGl0OiB0aGUgZmFjdCBzdGF5cyB0aGUgc2FtZSwgd2l0aCBtb3JlIGVudGh1c2lhc20uIFR1cm5pbmcgKiJZb3UgYXJlIHBvaXNvbmVkLiIqIGludG8gKiJZb3UgZmVlbCBmaW5lLiIqIGNoYW5nZXMgdGhlIG1lYW5pbmcsIGFuZCBhIG1vZCB0aGF0IGRvZXMgdGhhdCBtYWtlcyB0aGUgZ2FtZSBsaWUgdG8gdGhlIHBsYXllciBhYm91dCB0aGVpciBvd24gY2hhcmFjdGVyLgoKVGhlIGVuZ2luZSByZXR1cm5zIHdoYXRldmVyIHlvdXIgaG9vayByZXR1cm5zLCBzbyB0aGUgcnVsZSBpcyB5b3VycyB0byBrZWVwLiBUaGlzIGhvb2sgaXMgdGhlIGVhc2llc3QgcGxhY2UgaW4gdGhlIG1vZCBzeXN0ZW0gdG8gYnJlYWsgaXQgYnkgYWNjaWRlbnQuCgojIyBUaGUgbWlzdGFrZSB0byBhdm9pZAoKYGBganMKbWVzc2FnZVRleHQ6IChyYXcpID0+IChyYXcuc3RhcnRzV2l0aCgiV2VsY29tZSB0byBsZXZlbCAiKSA/IGBDb25ncmF0dWxhdGlvbnMhICR7cmF3fWAgOiByYXcpLAovLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXl5eCmBgYAoKVGhlIHRyYWlsaW5nIGA6IHJhd2AgcmV0dXJucyB0aGUgb3JpZ2luYWwgdGV4dCBmb3IgZXZlcnkgbWVzc2FnZSB0aGUgaG9vayBsZWF2ZXMgYWxvbmUuIFlvdXIgZnVuY3Rpb24gc2VlcyBldmVyeSBtZXNzYWdlIHRoZSBnYW1lIHByaW50cywgc28gYSBob29rIHRoYXQgZHJvcHMgdGhhdCBicmFuY2ggZGVsZXRlcyB0aGUgcmVzdCBvZiB0aGUgZ2FtZSdzIG91dHB1dC4gV2hhdGV2ZXIgZWxzZSB5b3VyIGhvb2sgZG9lcywgbWFrZSB0aGUgZGVmYXVsdCBicmFuY2ggcmV0dXJuIHdoYXQgaXQgd2FzIGdpdmVuLgoKIyMgUnVubmluZyBpdAoKTG9hZCBpdCB0aGUgc2FtZSB3YXkgYXMgaW4gdGhlIGVhcmxpZXIgdHV0b3JpYWxzOiBwdXQgaXQgaW4gdGhlIGBtb2RzL2AgZm9sZGVyIG9uIHRoZSBkZXNrdG9wIGJ1aWxkLCBvciB1c2UgKipDaG9vc2UgYSBtb2RzIGZvbGRlci4uLioqIGluIGEgYnJvd3Nlci4gVGhlIGdhbWUgbG9hZHMgYSBjb2RlIG1vZCBmcm9tIGEgZm9sZGVyIHRoZSBzYW1lIHdheSBpdCBsb2FkcyBhIGRhdGEgbW9kLgoKIyMgQ2hlY2sgdGhlIHJlc3VsdAoKR2FpbiBhIGxldmVsLiBUaGUgbWVzc2FnZSByZWFkcyAqIkNvbmdyYXR1bGF0aW9ucyEgV2VsY29tZSB0byBsZXZlbCAyLiIqCgpUdXJuIHRoZSBtb2Qgb2ZmIGFuZCByZWxvYWQuIFRoZSBtZXNzYWdlIHJlYWRzICoiV2VsY29tZSB0byBsZXZlbCAyLiIqIGFnYWluLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gQ29uZ3JhdHVsYXRlIGxvdWRseTogYGAgYCoqKiAke3Jhdy50b1VwcGVyQ2FzZSgpfSAqKipgIGBgLgotIFJlYWN0IHRvIGEgZGlmZmVyZW50IG1lc3NhZ2UuIEZpbmQgb25lIHlvdSBsaWtlIGluIHRoZSBnYW1lIGFuZCBtYXRjaCBvbiBpdC4KLSBBZGQgYSBzZWNvbmQgaG9vay4gYHNhdmVOb2lzZVNjZW50YCBhbmQgYG9iamVjdExpc3RUaWVicmVha2AgYXJlIHR3byBvZiB0aGUgb3RoZXIgaG9va3MuIFtNT0RfU0VBTVMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9NT0RfU0VBTVMubWQpIGRlc2NyaWJlcyB3aGF0IHRoZSBnYW1lIGFza3MgZWFjaCBvbmUgdG8gZG8gYW5kIHdoZW4uCi0gUHJpbnQgc29tZXRoaW5nIHRvIHRoZSBjb25zb2xlIGZyb20gaW5zaWRlIHRoZSBob29rIGFuZCBjb3VudCBob3cgb2Z0ZW4gaXQgcnVucy4gVGhlIGNvdW50IHNob3dzIGhvdyBtYW55IG1lc3NhZ2VzIHRoZSBnYW1lIHByaW50cyBkdXJpbmcgcGxheS4KCiMjIFNhbXBsZSBtb2QKCkNvcmUncyBoaXN0b3JpY2FsIHNhbXBsZSB1c2VzIEFQSSAxLiBNb2RGb3JnZSdzIGRvY3VtZW50YXRpb24gc3VpdGUgdGVzdHMgdGhlIEFQSSAyIGV4YW1wbGUgb24gdGhpcyBwYWdlLgoKLS0tCgoqKk5leHQ6KiogW1R1dG9yaWFsIDY6IEFkZCBhbiBvcHRpb25dKDA2LWFkZC1hbi1vcHRpb24ubWQpLCB3aGljaCBnaXZlcyB0aGUgc2FtZSBtb2QgYSBzd2l0Y2ggdGhlIHBsYXllciBjb250cm9scy4K"
  },
  {
    "id": "tutorial-06",
    "path": "tutorials/06-add-an-option.md",
    "source": "local",
    "audience": "beginner",
    "title": "6. Add an option",
    "note": "Let a player switch your change on and off.",
    "encoded": "IyBUdXRvcmlhbCA2OiBBZGQgYW4gb3B0aW9uCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBUdXRvcmlhbCA1J3MgbW9kLCBwbHVzIGEgc3dpdGNoIHRoZSBwbGF5ZXIgY2FuIHR1cm4gb24gYW5kIG9mZiBmcm9tIGluc2lkZSB0aGUgZ2FtZSB3aXRob3V0IGVkaXRpbmcgYW55IGZpbGVzLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgNV0oMDUtaG9vay1iZWhhdmlvdXIubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBNb2QgZmlsZXMKCllvdSBzdGlsbCBoYXZlIHR3byBmaWxlcy4gYG1hbmlmZXN0Lmpzb25gIGdhaW5zIGEgYHJ1bGVzYCBibG9jazoKCmBgYGpzb24KewogICJmb3JtYXQiOiAibmVvLWFuZ2JhbmQvbW9kL21hbmlmZXN0IiwKICAic2NoZW1hVmVyc2lvbiI6IDIsCiAgImRhdGEiOiB7CiAgICAiaWQiOiAibXktb3B0aW9uLW1vZCIsCiAgICAibmFtZSI6ICJNeSBPcHRpb24gTW9kIiwKICAgICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAgICJzaGFwZSI6ICJwbHVnaW4iLAogICAgImZhY2V0cyI6IFsKICAgICAgInBsdWdpbiIKICAgIF0sCiAgICAiYXBpIjogIj49Mi4wLjAgPDMuMC4wIiwKICAgICJydW50aW1lIjogImluLXByb2Nlc3MiLAogICAgImVuZ2luZSI6IHsKICAgICAgInJhbmdlIjogIj49MS4yMy4wLWJldGEuMyIsCiAgICAgICJiZWNhdXNlIjogIlRoaXMgbW9kIHRhcmdldHMgdGhlIHB1Ymxpc2hlZCAxLjIzLjAtYmV0YS4zIFNESy4iCiAgICB9LAogICAgImF1dGhvciI6ICJ5b3VyIG5hbWUiLAogICAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAgICJyZXBvc2l0b3J5IjogImh0dHBzOi8vZ2l0aHViLmNvbS95b3UvbXktb3B0aW9uLW1vZCIsCiAgICAiZGVwZW5kZW5jaWVzIjogewogICAgICAicmVxdWlyZWQiOiB7CiAgICAgICAgImNvcmUiOiB7CiAgICAgICAgICAicmFuZ2UiOiAiKiIKICAgICAgICB9CiAgICAgIH0KICAgIH0sCiAgICAiYWZmZWN0c0dhbWVwbGF5IjogZmFsc2UsCiAgICAiZGVzY3JpcHRpb24iOiAiQ29uZ3JhdHVsYXRlcyB5b3Ugb24gZ2FpbmluZyBhIGxldmVsLiIsCiAgICAicnVsZXMiOiBbCiAgICAgIHsKICAgICAgICAiZmxhZyI6ICJteS1vcHRpb24tbW9kLmNvbmdyYXR1bGF0ZSIsCiAgICAgICAgInRpdGxlIjogIkNvbmdyYXR1bGF0ZSBtZSBvbiBnYWluaW5nIGEgbGV2ZWwiLAogICAgICAgICJkZXNjcmlwdGlvbiI6ICJBZGRzIENvbmdyYXR1bGF0aW9ucyEgdG8gdGhlIGxldmVsLXVwIG1lc3NhZ2UuIiwKICAgICAgICAiZGVmYXVsdCI6IGZhbHNlCiAgICAgIH0KICAgIF0KICB9Cn0KYGBgCgpgcGx1Z2luLmpzYCBnYWlucyBvbmUgbGluZToKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6ICI+PTIuMC4wIDwzLjAuMCIsCgogIGhvb2tzKHsgZmxhZ3MgfSkgewogICAgaWYgKGZsYWdzWyJteS1vcHRpb24tbW9kLmNvbmdyYXR1bGF0ZSJdICE9PSB0cnVlKSByZXR1cm4ge307CiAgICByZXR1cm4gewogICAgICBtZXNzYWdlVGV4dDogKHJhdykgPT4KICAgICAgICByYXcuc3RhcnRzV2l0aCgiV2VsY29tZSB0byBsZXZlbCAiKSA/IGBDb25ncmF0dWxhdGlvbnMhICR7cmF3fWAgOiByYXcsCiAgICB9OwogIH0sCn07CmBgYAoKVGhvc2UgdHdvIGVkaXRzIG1ha2UgdXAgdGhlIHdob2xlIGZlYXR1cmUuIFRoZSBnYW1lIHN1cHBsaWVzIHRoZSBzZXR0aW5ncyBzY3JlZW4gYW5kIHRoZSBzdG9yYWdlLCBzbyB5b3UgaGF2ZSBubyBzZXR0aW5ncyBBUEkgdG8gbGVhcm4gYW5kIG5vIHNjcmVlbiB0byBidWlsZC4KCiMjIFRoZSBtYW5pZmVzdCBmbGFnIGNvbnRyb2xzIGhvb2sgcmVnaXN0cmF0aW9uCgpZb3UgZGVjbGFyZSB0aGUgc3dpdGNoIGluIHRoZSBtYW5pZmVzdC4gVGhlIGdhbWUgYnVpbGRzIHRoZSBvcHRpb25zIHNjcmVlbiwgc2hvd3MgeW91ciBgdGl0bGVgIGFuZCBgZGVzY3JpcHRpb25gLCByZW1lbWJlcnMgd2hhdCB0aGUgcGxheWVyIHBpY2tlZCwgYW5kIHBhc3NlcyB0aGUgYW5zd2VyIHRvIGBob29rcyh7IGlkLCBmbGFncyB9KWAgYmVmb3JlIHlvdXIgY29kZSBydW5zLgoKUmVhZGluZyBhIHNldHRpbmcgaXMgYSBwbGFpbiBwcm9wZXJ0eSBsb29rdXAuIFRoZSBwbGF5ZXIgcmVhZHMgYHRpdGxlYCBhbmQgYGRlc2NyaXB0aW9uYCwgc28gd3JpdGUgdGhlbSBmb3IgYSBwbGF5ZXIgYW5kIGRlc2NyaWJlIHdoYXQgY2hhbmdlcyBpbiB0aGUgZ2FtZSB3aGVuIHRoZSBvcHRpb24gaXMgb24uCgpCeSBjb252ZW50aW9uLCBhIGZsYWcgbmFtZSBzdGFydHMgd2l0aCB5b3VyIG1vZCdzIGlkLCBhbmQgeW91IHNob3VsZCBrZWVwIHRoYXQgY29udmVudGlvbi4gVGhlIGhvc3QgZ2l2ZXMgZWFjaCBtb2QgaXRzIG93biBzbGljZSBvZiB0aGUgYGZsYWdzYCBhcmd1bWVudCwgc28geW91IGNhbm5vdCBzZWUgYW5vdGhlciBtb2QncyB0b2dnbGVzIGFuZCBvdGhlciBtb2RzIGNhbm5vdCBzZWUgeW91cnMuIFRoZSBwbGF5ZXIncyBzYXZlZCBjaG9pY2VzIGFsbCBsaXZlIGluIG9uZSBmbGF0IG1hcCBrZXllZCBieSBmbGFnIG5hbWUsIHRob3VnaCwgc28gdHdvIG1vZHMgdGhhdCBlYWNoIG5hbWVkIGEgZmxhZyBgY29uZ3JhdHVsYXRlYCB3b3VsZCBzaGFyZSBvbmUgc3RvcmVkIHNldHRpbmcuCgojIyBXaGVyZSB0aGUgY2hlY2sgZ29lcywgYW5kIHdoeSBpdCBtYXR0ZXJzCgpUaGUgYGlmYCBzaXRzIGluIGBob29rc2AsIHdoZXJlIGl0IGRlY2lkZXMgd2hldGhlciB0byBzdXBwbHkgdGhlIGhvb2sgYXQgYWxsLiBZb3UgY291bGQgaW5zdGVhZCBwdXQgdGhlIGNoZWNrIGluc2lkZSBgbWVzc2FnZVRleHRgIGFuZCByZXR1cm4gYHJhd2AgdW5jaGFuZ2VkIHdoZW4gdGhlIG9wdGlvbiBpcyBvZmYuCgpUaGUgcGxheWVyIHNlZXMgdGhlIHNhbWUgcmVzdWx0IGVpdGhlciB3YXksIGJ1dCB0aGUgZ2FtZSBkb2VzIGRpZmZlcmVudCB3b3JrOgoKLSBXaXRoIHRoZSBjaGVjayBpbnNpZGUgdGhlIGhvb2ssIHRoZSBnYW1lIGNhbGxzIHlvdXIgZnVuY3Rpb24gZm9yIGV2ZXJ5IG1lc3NhZ2UgaXQgcHJpbnRzLCBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlc3Npb24sIGFuZCB5b3VyIGZ1bmN0aW9uIGRvZXMgbm90aGluZyBlYWNoIHRpbWUuCi0gV2l0aCB0aGUgY2hlY2sgYXJvdW5kIHRoZSBob29rLCBhbiBvcHRpb24gdGhhdCBpcyBvZmYgbWVhbnMgeW91IHN1cHBsaWVkIG5vIGhvb2ssIHNvIHRoZSBnYW1lIHJ1bnMgaXRzIG93biB1bnRvdWNoZWQgcGF0aCBhbmQgeW91ciBtb2QgcGxheXMgbm8gcGFydCBpbiBpdC4KClVzZSB0aGUgc2Vjb25kIGZvcm0uIEEgZGlzYWJsZWQgb3B0aW9uIHRoZW4gY29zdHMgbm90aGluZywgdGhlIGdhbWUgYmVoYXZlcyBhcyBpZiB5b3VyIG1vZCB3ZXJlIG5vdCBpbnN0YWxsZWQsIGFuZCB0dXJuaW5nIHRoZSBvcHRpb24gb2ZmIGdpdmVzIHRoZSBwbGF5ZXIgdGhlIGJhc2UgZ2FtZSBiYWNrLgoKIyMgRGVmYXVsdCBvZmYKCk1ha2UgYCJkZWZhdWx0IjogZmFsc2VgIGEgaGFiaXQsIHNvIHRoYXQgZW5hYmxpbmcgYSBtb2QgbGVhdmVzIGl0cyBmZWF0dXJlcyBvZmYgdW50aWwgdGhlIHBsYXllciBwaWNrcyB0aGVtLgoKQSBwbGF5ZXIgdXN1YWxseSBpbnN0YWxscyBhIG1vZCBmb3Igb25lIHRoaW5nIGluIGl0LiBJZiBldmVyeSB0b2dnbGUgc2hpcHMgb24sIHRoYXQgcGxheWVyIGdldHMgZml2ZSBjaGFuZ2VzIHRoZXkgZGlkIG5vdCBhc2sgZm9yIGFuZCBoYXMgdG8gZmluZCBhIHNldHRpbmdzIHNjcmVlbiB0byB1bmRvIHRoZW0uIFNoaXAgdG9nZ2xlcyBvZmYsIGRlc2NyaWJlIGVhY2ggb25lIGNsZWFybHksIGFuZCBsZXQgdGhlIHBsYXllciBjaG9vc2UuCgpUaGUgZmlyc3QtcGFydHkgYGZlYXR1cmUtcmVzdG9yYXRpb25gIG1vZCB3b3JrcyB0aGlzIHdheTogZW5hYmxpbmcgaXQgY2hhbmdlcyBub3RoaW5nIHVudGlsIHlvdSBwaWNrIGEgZmVhdHVyZS4KCiMjIENoZWNrIHRoZSByZXN1bHQKCkVuYWJsZSB0aGUgbW9kLiBXaGVuIHlvdSBzd2l0Y2ggb24gYSBtb2QgdGhhdCBkZWNsYXJlcyBhdCBsZWFzdCBvbmUgcnVsZSwgdGhlIGdhbWUgYXNrcyB3aGljaCBvZiBpdHMgZmVhdHVyZXMgdG8gdHVybiBvbi4gKipFbmFibGUgZGVmYXVsdCBmZWF0dXJlcyoqIHVzZXMgd2hhdGV2ZXIgYCJkZWZhdWx0ImAgc2F5cyBpbiB0aGUgbWFuaWZlc3QsIHdoaWNoIGlzIG9mZiBmb3IgdGhpcyB0dXRvcmlhbC4gKipDaG9vc2UgZmVhdHVyZXMgdG8gZW5hYmxlKiogb3BlbnMgdGhpcyBtb2QncyBvd24gb3B0aW9ucyBzY3JlZW4gc28geW91IGNhbiBkZWNpZGUgcGVyIHJ1bGUuICoqRG8gbm90IGVuYWJsZSBhbnkgZmVhdHVyZXMqKiB0dXJucyBldmVyeSBydWxlIG9mZiwgd2hhdGV2ZXIgaXRzIG1hbmlmZXN0IGRlZmF1bHQuIElmIHlvdSBwaWNrIHRoZSBkZWZhdWx0LCAqQ29uZ3JhdHVsYXRlIG1lIG9uIGdhaW5pbmcgYSBsZXZlbCogc3RheXMgb2ZmLCBhcyBgImRlZmF1bHQiOiBmYWxzZWAgc2F5cy4KClByZXNzIGBFc2NhcGVgLCBjaG9vc2UgKipNb2RzKiosIGFuZCBjaG9vc2UgeW91ciBtb2QgdG8gZmluZCB0aGUgc2FtZSBvcHRpb24gb24gaXRzIG93biBzY3JlZW4uIFR1cm4gaXQgb24sIGNob29zZSAqKkFwcGx5IGNoYW5nZXMgYW5kIHJlbG9hZCoqLCBhbmQgZ2FpbiBhIGxldmVsLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gQWRkIGEgc2Vjb25kIG9wdGlvbiB0aGF0IGNvbnRyb2xzIHNvbWV0aGluZyBlbHNlLCBhbmQgY2hlY2sgdGhhdCBib3RoIGFwcGVhci4KLSBNYWtlIG9uZSBvcHRpb24gZGVmYXVsdCBvbiBhbmQgbm90aWNlIGhvdyB0aGUgbW9kIGZlZWxzIHRvIGluc3RhbGwuIFRoZW4gZGVjaWRlIHdoaWNoIGRlZmF1bHQgeW91IHByZWZlci4KLSBSZW5hbWUgYSBydWxlIGZsYWcgb3IgYSBzZWN0aW9uLiBbQ29yZSdzIGF1dGhvcmluZyByZWZlcmVuY2VdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9BVVRIT1JJTkcubWQjcmVuYW1pbmctYS1wbGF5ZXItdG9nZ2xlYWJsZS1ydWxlKSBkZXNjcmliZXMgYHJlbmFtZWRSdWxlRmxhZ3NgIGFuZCBgcmVuYW1lZFNlY3Rpb25GbGFnc2AsIHdoaWNoIGxldCB5b3UgcmVuYW1lIGVpdGhlciBvbmUgd2l0aG91dCBsb3NpbmcgcGxheWVycycgc2F2ZWQgY2hvaWNlcy4KCiMjIFNhbXBsZSBtb2QKCkNvcmUncyBoaXN0b3JpY2FsIHNhbXBsZSB1c2VzIEFQSSAxLiBUaGUgQVBJIDIgZXhhbXBsZSBvbiB0aGlzIHBhZ2UgaXMgdGVzdGVkIGluIE1vZEZvcmdlJ3MgZG9jdW1lbnRhdGlvbiBzdWl0ZS4KCi0tLQoKIyMgWW91IGhhdmUgZmluaXNoZWQgdGhlIGNvcmUgc2l4CgpZb3UgaGF2ZSBidWlsdCBzaXggbW9kcywgYW5kIGJldHdlZW4gdGhlbSB0aGV5IGNvdmVyIHRoZSBzaGFwZSBvZiBuZWFybHkgZXZlcnl0aGluZyBlbHNlOiBjaGFuZ2luZyBkYXRhLCBhZGRpbmcgZGF0YSwgcnVubmluZyBjb2RlLCBhbmQgbGV0dGluZyB0aGUgcGxheWVyIGRlY2lkZS4KCioqT25lIG1vcmUsIGlmIHlvdSB3YW50IGl0OioqIFtUdXRvcmlhbCA3XSgwNy1hZGQtYW4tYXJ0aWZhY3QubWQpIGFkZHMgYW4gYXJ0aWZhY3QuIEFuIGFydGlmYWN0IGlzIGEgbGF5ZXIgb3ZlciBhbiBleGlzdGluZyBpdGVtLCB3aGljaCBtYWtlcyBpdCB0aGUgb2RkIG9uZSBvdXQgYW1vbmcgdGhlIHR1dG9yaWFscy4gSXQgdGVhY2hlcyBub3RoaW5nIG5ldyBhYm91dCB0aGUgbW9kIHN5c3RlbSwgYnV0IGl0IGlzIHdvcnRoIGRvaW5nIG9uY2UuCgpXaGVyZSB5b3UgZ28gYWZ0ZXIgdGhhdCBkZXBlbmRzIG9uIHdoYXQgeW91IHdhbnQgdG8gYnVpbGQuIFNlZSBbdGhlIGxlYXJuaW5nIHBhdGhdKFJFQURNRS5tZCNhZnRlci10aGUtdHV0b3JpYWxzKS4K"
  },
  {
    "id": "tutorial-07",
    "path": "tutorials/07-add-an-artifact.md",
    "source": "local",
    "audience": "beginner",
    "title": "7. Add an artifact",
    "note": "Build on top of an item and keep it composable.",
    "encoded": "IyBUdXRvcmlhbCA3OiBBZGQgYW4gYXJ0aWZhY3QKCioqV2hhdCB5b3Ugd2lsbCBtYWtlOioqIHRoZSBMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllLCBhIHVuaXF1ZSBzaGllbGQgdGhhdCBjYW4gYXBwZWFyIGFyb3VuZCBkdW5nZW9uIGxldmVsIDEyIGFuZCBuZXZlciBhcHBlYXJzIHR3aWNlLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgMl0oMDItYWRkLWFuLWl0ZW0ubWQpLiBZb3UgY2FuIHNraXAgdHV0b3JpYWxzIDMgdG8gNiwgYnV0IGRvIHR1dG9yaWFsIDIgZmlyc3QuIEFuIGFydGlmYWN0IHNpdHMgb24gdG9wIG9mIGFuIG9yZGluYXJ5IGl0ZW0sIGFuZCBpdCBoZWxwcyB0byBoYXZlIGFkZGVkIG9uZSBhbHJlYWR5LgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBXaGF0IGFuIGFydGlmYWN0IGFjdHVhbGx5IGlzCgpBbiBhcnRpZmFjdCBpcyBhIHNldCBvZiBjaGFuZ2VzIGFwcGxpZWQgdG8gYW4gaXRlbSB0aGUgZ2FtZSBhbHJlYWR5IGhhcy4gVGhlIExlYXRoZXIgU2hpZWxkIG9mIHRoZSBXYXRjaGZ1bCBFeWUgaXMgdGhlIGxlYXRoZXIgc2hpZWxkIGZyb20gdGhlIGxlYXRoZXIgc2hpZWxkIGVudHJ5IGluIGBvYmplY3QuanNvbmAsIHdpdGggYSBuZXcgbmFtZSwgYmV0dGVyIG51bWJlcnMsIGFuZCBhIGZldyBleHRyYSBmbGFncy4gVGhlIHJlY29yZCBuYW1lcyB0aGF0IGl0ZW0gaW4gaXRzIGBiYXNlLW9iamVjdGAgZmllbGQsIGFuZCBhbG1vc3QgZXZlcnkgb3RoZXIgZmllbGQgaXMgYSBudW1iZXIgZGVzY3JpYmluZyBob3cgdGhlIGFydGlmYWN0IGRpZmZlcnMgZnJvbSBpdC4KClRoZSBnYW1lIGdlbmVyYXRlcyBlYWNoIGFydGlmYWN0IGF0IG1vc3Qgb25jZSBwZXIgY2hhcmFjdGVyLiBBbiBvcmRpbmFyeSBzaGllbGQgY29tcGV0ZXMgdGhyb3VnaCBgYWxsb2NgIHdpdGggYSBodW5kcmVkIG90aGVyIHNoaWVsZHMuIEZvciBhbiBhcnRpZmFjdCB0aGVyZSBpcyBvbmUsIG9yIHRoZXJlIGlzIG5vdCBvbmUgeWV0LgoKVGhlIGJhc2Ugb2JqZWN0IHN1cHBsaWVzIHRoZSBraW5kJ3MgZmxhZ3MsIHBsdXMgaXRzIGFjdGl2YXRpb24gaWYgeW91ciBhcnRpZmFjdCBkZWNsYXJlcyBub25lLiBUaGUgbnVtYmVycyBjb21lIGZyb20gdGhlIGFydGlmYWN0IHJlY29yZDogYHdlaWdodGAsIGBhY2AsIGB0by1hYCwgYHRvLWhgLCBgdG8tZGAsIGFuZCB0aGUgZGFtYWdlIGRpY2UuIEFueSBvZiB0aGVzZSB5b3UgbGVhdmUgb3V0IGJpbmRzIHRvIHplcm8sIHNvIHdyaXRlIGV2ZXJ5IG9uZSBvZiB0aGVtLiBUaGUgcHJvcGVydGllcyBvZiB0aGUga2luZCBpdHNlbGYsIHN1Y2ggYXMgYSBsZWF0aGVyIHNoaWVsZCdzIHdlaWdodCBjbGFzcywgaXRzIG1hdGVyaWFsLCBhbmQgaG93IGl0IHJlYWN0cyB0byBhY2lkLCBjb21lIHdpdGggdGhlIGJhc2UgeW91IG5hbWUuCgojIyBNb2QgZmlsZXMKCmBgYApteS1hcnRpZmFjdC1tb2QvCiAgbWFuaWZlc3QuanNvbgogIGFydGlmYWN0Lmpzb24KYGBgCgpgbWFuaWZlc3QuanNvbmAgZm9sbG93cyB0dXRvcmlhbCAxJ3Mgc2NoZW1hIDIgc2hhcGUgd2l0aCBpdHMgb3duIGBpZGAsIGBuYW1lYCwgcmVwb3NpdG9yeSwgYW5kIGRlc2NyaXB0aW9uLCBhbmQga2VlcHMgdGhlIHB1Ymxpc2hlZCBTREsgZW5naW5lIGZsb29yLiBUaGUgbmV3IGZpbGUgaXMgYGFydGlmYWN0Lmpzb25gOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbCiAgICB7CiAgICAgICJuYW1lIjogIm9mIHRoZSBXYXRjaGZ1bCBFeWUiLAogICAgICAiYmFzZS1vYmplY3QiOiB7CiAgICAgICAgInR2YWwiOiAic2hpZWxkIiwKICAgICAgICAic3ZhbCI6ICJMZWF0aGVyIFNoaWVsZCIKICAgICAgfSwKICAgICAgImxldmVsIjogMTIsCiAgICAgICJ3ZWlnaHQiOiA1MCwKICAgICAgImNvc3QiOiAxNDAwMCwKICAgICAgImFsbG9jIjogewogICAgICAgICJjb21tb24iOiAxMCwKICAgICAgICAibWlubWF4IjogIjEyIHRvIDcwIgogICAgICB9LAogICAgICAiYXR0YWNrIjogewogICAgICAgICJoZCI6ICIwZDAiLAogICAgICAgICJ0by1oIjogMCwKICAgICAgICAidG8tZCI6IDAKICAgICAgfSwKICAgICAgImFybW9yIjogewogICAgICAgICJhYyI6IDgsCiAgICAgICAgInRvLWEiOiAxMAogICAgICB9LAogICAgICAiZmxhZ3MiOiBbIlNFRV9JTlZJUyIsICJQUk9UX0ZFQVIiXSwKICAgICAgInZhbHVlcyI6IFsiSU5GUkFbMl0iLCAiUkVTX0RBUktbMV0iXSwKICAgICAgImRlc2MiOiBbCiAgICAgICAgIkEgcm91bmQgc2hpZWxkIG9mIGJvaWxlZCBsZWF0aGVyLCBpdHMgYm9zcyB3b3JrZWQgaW50byBhIHNpbmdsZSBvcGVuIGV5ZS4iLAogICAgICAgICIgIFRoZSBleWUgZG9lcyBub3QgYmxpbmssIGFuZCBuZWl0aGVyLCB3aGlsZSB5b3UgY2FycnkgaXQsIGRvIHlvdS4iCiAgICAgIF0KICAgIH0KICBdCn0KYGBgCgpUdXJuIHRoZSBtb2Qgb24sIGNyZWF0ZSBhIGNoYXJhY3RlciwgYW5kIGdvIGRvd24uIFRoZSBhcnRpZmFjdCBjYW4gZ2VuZXJhdGUgYmV0d2VlbiBkdW5nZW9uIGxldmVscyAxMiBhbmQgNzAsIGF0IG1vc3Qgb25jZSBwZXIgY2hhcmFjdGVyLCBhbmQgZWFjaCBjaGFyYWN0ZXIgaGFzIGEgY2hhbmNlIG9mIGZpbmRpbmcgaXQgd2l0aCBubyBndWFyYW50ZWUuCgojIyBUaGUgbmFtZSBpcyBub3QgdGhlIG5hbWUKCkxvb2sgYXQgYG5hbWVgIGFnYWluOgoKYGBganNvbgoibmFtZSI6ICJvZiB0aGUgV2F0Y2hmdWwgRXllIgpgYGAKCmBuYW1lYCBob2xkcyBvbmx5IHRoZSBwYXJ0IHRoYXQgZm9sbG93cyB0aGUgYmFzZSBvYmplY3QncyBuYW1lLiBUaGUgZ2FtZSBqb2lucyB0aGUgdHdvIGhhbHZlcywgc28gYExlYXRoZXIgU2hpZWxkYCBwbHVzIGBvZiB0aGUgV2F0Y2hmdWwgRXllYCBzaG93cyBhcyAqdGhlIExlYXRoZXIgU2hpZWxkIG9mIHRoZSBXYXRjaGZ1bCBFeWUqIGluIHRoZSBpdGVtIGxpc3QuCgpBcnRpZmFjdCBuYW1lcyBpbiB0aGUgYmFzZSBnYW1lIGZvbGxvdyB0aGUgc2FtZSBwYXR0ZXJuLiBJbiBgcGFja2FnZXMvY29udGVudC9wYWNrL2FydGlmYWN0Lmpzb25gLCBgb2YgR2FsYWRyaWVsYCBiZWNvbWVzIHRoZSBQaGlhbCBvZiBHYWxhZHJpZWwuIGAnQW5ncmlzdCdgLCB3cml0dGVuIGluIHF1b3RlcywgaXMgYSBwcm9wZXIgbmFtZSBhbmQgcmVwbGFjZXMgdGhlIGJhc2UgbmFtZS4gQ2hvb3NlIHRoZSBmb3JtIHRoYXQgcmVhZHMgY29ycmVjdGx5IGZvciB5b3VyIGFydGlmYWN0LCBhbmQga2VlcCBpbiBtaW5kIHRoYXQgeW91IGFyZSB3cml0aW5nIGhhbGYgYSBuYW1lLgoKVGhlIG5hbWUgYWxzbyBoYXMgbm8gYCZgIGFuZCBubyBgfmAuIFR1dG9yaWFsIDIncyBpdGVtIHdhcyBgIlBhZGRlZCBKZXJraW5+ImAsIHdoZXJlIGB+YCBtYXJrcyB0aGUgcGxhY2UgZm9yIHRoZSBwbHVyYWwgZW5kaW5nLiBBbiBhcnRpZmFjdCBpcyB1bmlxdWUsIHNvIGl0IGlzIG5ldmVyIHBsdXJhbCBhbmQgbmV2ZXIgbmVlZHMgYW4gYXJ0aWNsZSBjaG9zZW4gZm9yIGl0LiBBIGB+YCBjYXJyaWVkIG92ZXIgZnJvbSB0dXRvcmlhbCAyIGVuZHMgdXAgaW4gdGhlIGl0ZW0gbGlzdCBhcyAqdGhlIExlYXRoZXIgU2hpZWxkIG9mIHRoZSBXYXRjaGZ1bCBFeWV+Ki4KCiMjIFRoZSBvbmUgdGhpbmcgdGhhdCB3aWxsIGJpdGUgeW91CgpCb3RoIGhhbHZlcyBvZiBgYmFzZS1vYmplY3RgIGhhdmUgdG8gbWF0Y2ggYW4gZXhpc3RpbmcgZW50cnk6CgotIGB0dmFsYCBpcyB0aGUgaXRlbSB0eXBlLCB0YWtlbiBmcm9tIGBvYmplY3RfYmFzZS5qc29uYDogYHNoaWVsZGAsIGBzd29yZGAsIGBoYXJkIGFybW9yYCwgYGxpZ2h0YCwgYHJpbmdgLiBUaGVzZSBzdHJpbmdzIGJlbG9uZyB0byB0aGUgYmFzZSBnYW1lLCBhbmQgdGhlIGFybW9yIHR5cGVzIHVzZSB0aGUgQW1lcmljYW4gc3BlbGxpbmcsIHdoaWNoIHRyaXBzIHBlb3BsZSB1cC4KLSBgc3ZhbGAgaXMgdGhlIGJhc2Ugb2JqZWN0J3MgbmFtZSB3aXRoaW4gdGhhdCB0eXBlLCB0YWtlbiBmcm9tIGBvYmplY3QuanNvbmAgd2l0aCB0aGUgYCZgIGFuZCBgfmAgcmVtb3ZlZC4gVGhlIGVudHJ5IHJlYWRzIGAiJiBMZWF0aGVyIFNoaWVsZH4iYCwgYW5kIHlvdSB3cml0ZSBgIkxlYXRoZXIgU2hpZWxkImAuCgpBIHdyb25nIGB0dmFsYCBkcm9wcyB0aGUgYXJ0aWZhY3QsIGFuZCB0aGUgbW9kIG1hbmFnZXIgc2hvd3MgYSBsaW5lIG5hbWluZyB0aGUgcmVjb3JkIGFuZCB0aGUgcmVhc29uLgoKQSB3cm9uZyBgc3ZhbGAgc3RpbGwgbG9hZHMuIFRoZSBnYW1lIGNyZWF0ZXMgYW4gaW52aXNpYmxlIHBsYWNlaG9sZGVyIGJhc2Ugb2JqZWN0IGFuZCBidWlsZHMgdGhlIGFydGlmYWN0IG9uIGl0LCB3aGljaCBpcyBob3cgdGhlIGJhc2UgZ2FtZSdzIFBoaWFsLCBTdGFyLCBhbmQgQXJrZW5zdG9uZSB3b3JrOiBub25lIG9mIHRoZSB0aHJlZSBoYXMgYW4gb3JkaW5hcnkgdmVyc2lvbiBpbiBgb2JqZWN0Lmpzb25gLiBCZWNhdXNlIGBiYXNlLW9iamVjdC5zdmFsYCBpcyBhIGRlY2xhcmVkIHJlZmVyZW5jZSwgYSB0eXBvIHN0aWxsIGdldHMgcmVwb3J0ZWQgYnkgbmFtZSBvbiB5b3VyIG1vZCdzIHJvdyAtICpiYXNlLW9iamVjdC5zdmFsIG5hbWVzIHRoZSBiYXNlIG9iamVjdCB0aGUgYXJ0aWZhY3QgaXMgYnVpbHQgb24gImxldGhlciBzaGllbGQiLCBhbmQgbm8gbG9hZGVkIHBhY2sgZGVmaW5lcyBpdCBpbiBvYmplY3QqLiBJZiB5b3UgbWlzcyB0aGF0IHJlcG9ydCwgdGhlIGFydGlmYWN0IGdlbmVyYXRlcyBhbmQgZXF1aXBzIG9uIGEgYmxhbmsgYmFzZSwgd2l0aCBubyB3ZWlnaHQgY2xhc3MgYW5kIG5vbmUgb2YgdGhlIGJhc2UncyBvd24gYmVoYXZpb3IsIGFuZCB0aGUgaXRlbSBzdG9wcyBiZWhhdmluZyBsaWtlIGEgc2hpZWxkLgoKQ29weSB0aGUgYHN2YWxgIGZyb20gYG9iamVjdC5qc29uYC4gSXQgaXMgdGhlIG9uZSBmaWVsZCBpbiB0aGlzIGZpbGUgd2hlcmUgYSB0eXBvIGxlYXZlcyB0aGUgZ2FtZSBydW5uaW5nIHdpdGggdGhlIHdyb25nIGl0ZW0gaW4gaXQuCgojIyBQYXRjaGluZyBhbiBhcnRpZmFjdCB0aGUgZ2FtZSBhbHJlYWR5IGhhcwoKVGhlIHNhbWUgZmlsZSBjYW4gY2hhbmdlIGFuIGV4aXN0aW5nIGFydGlmYWN0LCB0aGUgd2F5IHR1dG9yaWFsIDMgY2hhbmdlZCBhbiBleGlzdGluZyBtb25zdGVyLiBBZGQgdGhpcyBuZXh0IHRvIHlvdXIgYHJlY29yZHNgOgoKYGBganNvbgogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTphbmdyaXN0IjogWwogICAgICB7ICJvcCI6ICJhZGQiLCAicGF0aCI6ICJhcm1vci50by1hIiwgInZhbHVlIjogMyB9CiAgICBdCiAgfQpgYGAKCmBhZGRgIGlzIHJlbGF0aXZlOiBBbmdyaXN0IGdldHMgdGhyZWUgbW9yZSBwb2ludHMgb2YgYXJtb3IgdGhhbiBpdCBhbHJlYWR5IGhhZCwgd2hhdGV2ZXIgdGhhdCBudW1iZXIgaXMuIFVzZSBgYWRkYCB3aGVuIHlvdSBhcmUgYWRqdXN0aW5nIGEgbnVtYmVyIGFuZCBgc2V0YCB3aGVuIHlvdSBhcmUgZGVjaWRpbmcgaXQsIGFuZCB5b3VyIG1vZCBrZWVwcyB3b3JraW5nIHdoZW4gdGhlIGJhc2UgZ2FtZSByZXR1bmVzIHRoZSB2YWx1ZSB1bmRlcm5lYXRoLgoKVGhlIHJlZiBpcyBgY29yZTpgIGZvbGxvd2VkIGJ5IHRoZSBhcnRpZmFjdCdzIG5hbWUgaW4gbG93ZXIgY2FzZSB3aXRoIHB1bmN0dWF0aW9uIHJlbW92ZWQsIHNvIGAnQW5ncmlzdCdgIGJlY29tZXMgYGNvcmU6YW5ncmlzdGAuIFdoZW4gYSByZWYgZG9lcyBub3QgcmVzb2x2ZSwgdGhlIGxvYWRlciByZXBvcnRzIGl0IGJ5IG5hbWUsIGFuZCBgcG5wbSBleGVjIG5lby1hbmdiYW5kLW1vZC1jaGVja2AgZmluZHMgdGhvc2UgZm9yIHlvdS4KCiMjIEFydGlmYWN0IGZpZWxkcwoKVGhlIGZpZWxkcyBhZnRlciBgYmFzZS1vYmplY3RgIHNldCB3aGF0IHRoZSBhcnRpZmFjdCBkb2VzLgoKLSBgbGV2ZWxgIGlzIGhvdyBkZWVwIHRoZSBnYW1lIGNvbnNpZGVycyB0aGUgYXJ0aWZhY3QgdG8gYmUuIEl0IGZlZWRzIGludG8gdGhlIGFydGlmYWN0J3MgcHJpY2UgYW5kIGhvdyBzdHJvbmcgaXQgaXMgYWxsb3dlZCB0byBiZS4KLSBgYWxsb2NgIGhvbGRzIGBjb21tb25gLCB0aGUgd2VpZ2h0IGFnYWluc3QgZXZlcnl0aGluZyBlbHNlIGVsaWdpYmxlLCBhbmQgYG1pbm1heGAsIHRoZSBkZXB0aCBiYW5kIGl0IGNhbiBhcHBlYXIgaW4uIGAiMTIgdG8gNzAiYCBrZWVwcyBpdCBmcm9tIGdlbmVyYXRpbmcgc2hhbGxvd2VyIHRoYW4gMTIgb3IgZGVlcGVyIHRoYW4gNzAuCi0gYGFybW9yLmFjYCByZXBsYWNlcyB0aGUgYmFzZSBvYmplY3QncyBhcm1vciBjbGFzcywgYW5kIGBhcm1vci50by1hYCBpcyB0aGUgYm9udXMgb24gdG9wLiBBIHdlYXBvbiB1c2VzIGBhdHRhY2suaGRgLCBgdG8taGAsIGFuZCBgdG8tZGAgaW5zdGVhZC4KLSBgZmxhZ3NgIGFyZSB5ZXMtb3Itbm8gcHJvcGVydGllczogYFNFRV9JTlZJU2AsIGBQUk9UX0ZFQVJgLCBgRlJFRV9BQ1RgLCBgUkVHRU5gLCBhbmQgbWFueSBtb3JlLgotIGB2YWx1ZXNgIGFyZSBwcm9wZXJ0aWVzIHRoYXQgY2FycnkgYSBudW1iZXIsIHdyaXR0ZW4gaW4gc3F1YXJlIGJyYWNrZXRzOiBgSU5GUkFbMl1gLCBgUkVTX0RBUktbMV1gLCBgU1RSWzJdYCwgYFNQRUVEWzVdYC4KCkJvdGggbGlzdHMgbGl2ZSBpbiBgcGFja2FnZXMvY29udGVudC9wYWNrL29iamVjdF9wcm9wZXJ0eS5qc29uYC4gRmxhZ3MgYW5kIG1vZGlmaWVycyBhcHBlYXIgdGhlcmUgc3BlbGxlZCBvdXQgaW4gZnVsbCB1bmRlciBgY29kZWAsIHNvIGtlZXAgdGhhdCBmaWxlIG9wZW4gd2hpbGUgeW91IHdyaXRlLiBSZXNpc3RhbmNlcyBhcmUgbGlzdGVkIGRpZmZlcmVudGx5OiBhIHJlc2lzdGFuY2UncyBgY29kZWAgaXMgdGhlIGJhcmUgZWxlbWVudCAoYHJlc2lzdGFuY2U6REFSS2ApLCBhbmQgdGhlIHRva2VuIHlvdSB3cml0ZSBpbiBgdmFsdWVzYCBpcyBgUkVTX2AgcGx1cyB0aGF0IGVsZW1lbnQsIGFzc2VtYmxlZCB3aGVuIHRoZSByZWNvcmQgYmluZHMuIEEgc2VhcmNoIG9mIHRoZSBmaWxlIGZvciBgUkVTX0RBUktgIGZpbmRzIG5vdGhpbmcuIFRoZSBnYW1lIHJlZnVzZXMgYW4gdW5yZWNvZ25pemVkIGZsYWcgb3IgdmFsdWUgd2hlbiB5b3VyIG1vZCBsb2Fkcywgc28geW91IGhlYXIgYWJvdXQgaXQgYmVmb3JlIHlvdSBwbGF5LgoKRm9yIGFuIGFydGlmYWN0IHRoYXQgZG9lcyBzb21ldGhpbmcgd2hlbiBhY3RpdmF0ZWQsIHNldCBgYWN0YCBhbmQgYHRpbWVgLCB3aXRoIG5hbWVzIGZyb20gYGFjdGl2YXRpb24uanNvbmAuIFN0YXJ0IGJ5IGNvcHlpbmcgYSBiYXNlLWdhbWUgYXJ0aWZhY3QgdGhhdCBhbHJlYWR5IGFjdGl2YXRlcyBhbmQgY2hhbmdpbmcgaXRzIG51bWJlcnMuCgojIyBBcnRpZmFjdCBydWxlcyB0byByZW1lbWJlcgoKLSBBbiBhcnRpZmFjdCBpcyBhIHNldCBvZiBjaGFuZ2VzIG92ZXIgYW4gZXhpc3RpbmcgaXRlbSwgc28gdGhlIHJlY29yZCBuYW1lcyBhIGBiYXNlLW9iamVjdGAgYW5kIHRoZSByZXN0IGlzIG1vc3RseSBudW1iZXJzLgotIEl0cyBgbmFtZWAgaXMgaGFsZiBhIG5hbWUsIHdpdGhvdXQgdGhlIGAmYCBhbmQgYH5gIGFuIG9yZGluYXJ5IGl0ZW0ncyBuYW1lIHVzZXMuCi0gQSB3cm9uZyBgdHZhbGAgZ2V0cyByZXBvcnRlZC4gQSB3cm9uZyBgc3ZhbGAgYnVpbGRzIHRoZSBhcnRpZmFjdCBvbiBhbiBpbnZlbnRlZCBwbGFjZWhvbGRlciBiYXNlLCBiZWNhdXNlIHRoZSBiYXNlIGdhbWUgbmVlZHMgdGhhdCBiZWhhdmlvciBmb3IgdGhlIFBoaWFsLiBDb3B5IHRoZSBzdmFsLgotIFVzZSBgYWRkYCBvdmVyIGBzZXRgIHdoZW4geW91IGFkanVzdCBhIG51bWJlciB0aGUgYmFzZSBnYW1lIG93bnMuCgojIyBTYW1wbGUgbW9kCgpbQ29yZSdzIGhpc3RvcmljYWwgdHV0b3JpYWwtMDctYWRkLWFuLWFydGlmYWN0IHNhbXBsZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvdHJlZS9tYXN0ZXIvc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDctYWRkLWFuLWFydGlmYWN0KSBjb250YWlucyB0aGUgY29udGVudCBmb3IgdGhpcyB0dXRvcmlhbC4gSXQgdXNlcyBhbiBvbGRlciBtYW5pZmVzdCBmb3JtYXQgYW5kIHNhbXBsZSBpZGVudGl0eSwgc28gc3RhcnQgYSBuZXcgbW9kIGZyb20gdGhlIHNjaGVtYSAyIG1hbmlmZXN0IGluIHRoZXNlIHR1dG9yaWFscy4KCioqTmV4dDoqKiBbVHV0b3JpYWwgODogQWRkIGEgc3RvcmVdKDA4LWFkZC1hLXN0b3JlLm1kKSByZXBsYWNlcyBhIHN0b3JlZnJvbnQgYW5kIGFkZHMgYSBidXlpbmcgcnVsZS4gVGhlIGVuZCBvZiB0aGUgW3R1dG9yaWFsIGluZGV4XShSRUFETUUubWQpIGxpc3RzIHdoYXQgdG8gcmVhZCBhZnRlciB0aGVzZS4gSWYgeW91IGFyZSBhYm91dCB0byBzaGFyZSBhIG1vZCB3aXRoIHNvbWVib2R5LCByZWFkIFtSRVFVSVJFTUVOVFMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9SRVFVSVJFTUVOVFMubWQpIGZpcnN0Lgo="
  },
  {
    "id": "tutorial-08",
    "path": "tutorials/08-add-a-store.md",
    "source": "local",
    "audience": "beginner",
    "title": "8. Add a store",
    "note": "Replace a storefront and add a player-known buying rule.",
    "encoded": "IyBUdXRvcmlhbCA4OiBBZGQgYSBzdG9yZQoKSW4gdGhpcyB0dXRvcmlhbCB5b3UgYnVpbGQgdGhlIEFkdmVudHVyZXIncyBFeGNoYW5nZSwgYSBuZXcgc2hvcCBpbiB0b3duIHRoYXQgc3RvY2tzIGV4cGVkaXRpb24gc3VwcGxpZXMgYW5kIGJ1eXMgdGhlIGVuY2hhbnRlZCBzd29yZHMgdGhlIG9yZGluYXJ5IHNob3BzIHR1cm4gYXdheS4gSXQgdGFrZXMgZmlmdGVlbiBtaW51dGVzLiBXb3JrIHRocm91Z2ggW1R1dG9yaWFsIDJdKDAyLWFkZC1hbi1pdGVtLm1kKSBmaXJzdCBmb3IgY29udGVudCBmaWxlcywgYW5kIFtUdXRvcmlhbCA1XSgwNS1ob29rLWJlaGF2aW91ci5tZCkgZm9yIHRoZSBvbmUgc21hbGwgYHBsdWdpbi5qc2AgdGhpcyBzaG9wIG5lZWRzLgoKLS0tCgojIyBPbmUgbGltaXQgd29ydGgga25vd2luZyBmaXJzdAoKVGhlIHRvd24gaGFzIGVpZ2h0IHN0b3JlZnJvbnRzLiBUaGVpciBlbnRyYW5jZSBmZWF0dXJlcyBjb21lIGZyb20gdGhlIGdhbWUgdGhlIHBvcnQgcmVwcm9kdWNlcywgc28gYSBtb2QgY2Fubm90IGFkZCBhIG5pbnRoIG9uZSB3aXRoIGEgbmV3IHRlcnJhaW4gY29kZS4gQSBtb2QgY2FuIHR1cm4gb25lIG9mIHRoZSBlaWdodCBpbnRvIGl0cyBvd24gc2hvcCB3aXRoIGEgbmV3IG5hbWUsIHN0b2NrIHRhYmxlLCBvd25lcnMsIGFuZCBidXlpbmcgcnVsZS4gVGhlIHBsYXllciBzZWVzIGEgbmV3IHNob3AsIGFuZCB0aGlzIGlzIHRoZSBwb3J0YWJsZSB3YXkgZm9yIGEgbW9kIHRvIGFkZCBvbmUuCgpUaGlzIHR1dG9yaWFsIHRha2VzIG92ZXIgdGhlIEdlbmVyYWwgU3RvcmUncyBidWlsZGluZy4gVGhlIEdlbmVyYWwgU3RvcmUgc3RheXMgaW4gdGhlIGJhc2UgZ2FtZSB1bmRlciB5b3VyIG1vZCwgYW5kIHR1cm5pbmcgdGhlIG1vZCBvZmYgYnJpbmdzIGl0IGJhY2sgdW5jaGFuZ2VkLiBOb3RoaW5nIGluIHRoaXMgdHV0b3JpYWwgZWRpdHMgdGhlIGdhbWUncyBzb3VyY2UgZmlsZXMuCgojIyBNb2QgZmlsZXMKCmBgYApteS1zdG9yZS1tb2QvCiAgbWFuaWZlc3QuanNvbgogIHRlcnJhaW4uanNvbgogIHN0b3JlLmpzb24KICBwbHVnaW4uanMKYGBgCgpUaGlzIG1vZCBjaGFuZ2VzIHJlY29yZHMgYW5kIGFsc28gcnVucyBvbmUgYnV5aW5nIHJ1bGUsIHNvIGl0cyBtYW5pZmVzdCBkZWNsYXJlcyBib3RoIGZhY2V0cy4gQ29weSB0aGlzIGFzIGBtYW5pZmVzdC5qc29uYDoKCmBgYGpzb24KewogICJmb3JtYXQiOiAibmVvLWFuZ2JhbmQvbW9kL21hbmlmZXN0IiwKICAic2NoZW1hVmVyc2lvbiI6IDIsCiAgImRhdGEiOiB7CiAgICAiaWQiOiAibXktc3RvcmUtbW9kIiwKICAgICJuYW1lIjogIk15IFN0b3JlIE1vZCIsCiAgICAidmVyc2lvbiI6ICIxLjAuMCIsCiAgICAic2hhcGUiOiAiY29udGVudCIsCiAgICAiZmFjZXRzIjogWwogICAgICAiY29udGVudCIsCiAgICAgICJwbHVnaW4iCiAgICBdLAogICAgImFwaSI6ICI+PTIuMC4wIDwzLjAuMCIsCiAgICAicnVudGltZSI6ICJpbi1wcm9jZXNzIiwKICAgICJlbmdpbmUiOiB7CiAgICAgICJyYW5nZSI6ICI+PTEuMjMuMC1iZXRhLjMiLAogICAgICAiYmVjYXVzZSI6ICJUaGlzIG1vZCB0YXJnZXRzIHRoZSBwdWJsaXNoZWQgMS4yMy4wLWJldGEuMyBTREsuIgogICAgfSwKICAgICJhdXRob3IiOiAieW91ciBuYW1lIiwKICAgICJsaWNlbnNlIjogIkdQTC0yLjAtb25seSIsCiAgICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20veW91L215LXN0b3JlLW1vZCIsCiAgICAiZGVwZW5kZW5jaWVzIjogewogICAgICAicmVxdWlyZWQiOiB7CiAgICAgICAgImNvcmUiOiB7CiAgICAgICAgICAicmFuZ2UiOiAiKiIKICAgICAgICB9CiAgICAgIH0KICAgIH0sCiAgICAiYWZmZWN0c0dhbWVwbGF5IjogdHJ1ZSwKICAgICJkZXNjcmlwdGlvbiI6ICJUdXJucyB0aGUgR2VuZXJhbCBTdG9yZSBpbnRvIHRoZSBBZHZlbnR1cmVyJ3MgRXhjaGFuZ2UuIiwKICAgICJjYXBhYmlsaXRpZXMiOiBbCiAgICAgICJlbmdpbmU6YWNjZXNzIiwKICAgICAgInJlZ2lzdHJ5OnN0b3JlIgogICAgXQogIH0KfQpgYGAKCmByZWdpc3RyeTpzdG9yZWAgdGVsbHMgdGhlIHBsYXllciwgYmVmb3JlIHRoZXkgZW5hYmxlIHlvdXIgcGx1Z2luLCB0aGF0IHRoaXMgbW9kIGNoYW5nZXMgYSBzaG9wIHJ1bGUuIEl0IGFsc28gb3BlbnMgYG1vZC5lbmdpbmUucmVnaXN0cnkuc3RvcmVzYCBmb3IgdGhlIHJ1bGUgYmVsb3cuIEEgc2hvcCBtYWRlIG9ubHkgb2YgY29udGVudCBuZWVkcyBubyBjYXBhYmlsaXR5LCBhbmQgdGhpcyBvbmUgYXNrcyBmb3IgaXQgYmVjYXVzZSBpdCBhbHNvIGNhcnJpZXMgYSBzbWFsbCBwaWVjZSBvZiBiZWhhdmlvci4KCiMjIEdpdmUgdGhlIGJ1aWxkaW5nIGEgbmV3IG5hbWUKCmB0ZXJyYWluLmpzb25gIGNoYW5nZXMgd2hhdCB0aGUgdG93biBkb29yIHNheXMgd2hlbiB0aGUgcGxheWVyIGxvb2tzIGF0IGl0OgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOmdlbmVyYWwtc3RvcmUiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogIm5hbWUiLCAidmFsdWUiOiAiQWR2ZW50dXJlcidzIEV4Y2hhbmdlIiB9LAogICAgICB7CiAgICAgICAgIm9wIjogInNldCIsCiAgICAgICAgInBhdGgiOiAiZGVzYyIsCiAgICAgICAgInZhbHVlIjogWwogICAgICAgICAgIkEgcHJhY3RpY2FsIHNob3AgZm9yIHBlb3BsZSB3aG8gZXhwZWN0IHRvIGNvbWUgYmFjayBmcm9tIHRoZSBkdW5nZW9uLiIKICAgICAgICBdCiAgICAgIH0KICAgIF0KICB9Cn0KYGBgCgpUaGUgcmVmIGlzIGBjb3JlOmdlbmVyYWwtc3RvcmVgIGJlY2F1c2UgYSB0ZXJyYWluIHJlY29yZCBpcyBuYW1lZCBieSBpdHMgdmlzaWJsZSBgbmFtZWAuIFRvIGZpbmQgdGhlIHJlZiBmb3IgYW55IGJ1aWxkaW5nLCBvcGVuIGBwYWNrYWdlcy9jb250ZW50L3BhY2svdGVycmFpbi5qc29uYCwgZmluZCB0aGUgYnVpbGRpbmcgeW91IHdhbnQsIGFuZCBjb3B5IGl0cyBuYW1lIGludG8gdGhlIHJlZiBpbiBsb3dlciBjYXNlIHdpdGggc3BhY2VzIGNoYW5nZWQgdG8gYC1gLgoKVGhlIHBhdGNoIGxlYXZlcyB0aGUgZ2x5cGgsIHRoZSBjb2xvciwgYW5kIHRoZSBgU0hPUGAgZmxhZyBhcyB0aGV5IHdlcmUuIEJlY2F1c2UgdGhlIGVudHJhbmNlIHN0YXlzIHRoZSBzYW1lLCB0aGUgRXhjaGFuZ2UgY291bnRzIGFzIGEgc3VwcG9ydGVkIHJlcGxhY2VtZW50IG9mIGFuIGV4aXN0aW5nIHN0b3JlZnJvbnQgYW5kIG5lZWRzIG5vIG5ldyB0b3duIHNsb3QuCgojIyBTdG9jayB0aGUgc2hvcAoKYHN0b3JlLmpzb25gIGlzIHRoZSBzaG9wIGJlaGluZCB0aGF0IGVudHJhbmNlLiBJdCByZWZlcnMgdG8gdGhlIGVudHJhbmNlIGJ5IGl0cyBzdGFibGUgc3RvcmUgY29kZSwgd2hpY2ggc3RheXMgdGhlIHNhbWUgd2hlbiB0aGUgc2lnbiBjaGFuZ2VzOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN0b3JlLWdlbmVyYWwiOiBbCiAgICAgIHsKICAgICAgICAib3AiOiAic2V0IiwKICAgICAgICAicGF0aCI6ICJvd25lciIsCiAgICAgICAgInZhbHVlIjogWwogICAgICAgICAgeyAicHVyc2UiOiAxMjAwMCwgIm5hbWUiOiAiUmlsbGEgdGhlIFdlbGwtUHJlcGFyZWQgKER3YXJmKSIgfSwKICAgICAgICAgIHsgInB1cnNlIjogMTgwMDAsICJuYW1lIjogIk5vcmkgdGhlIEZhci1XYWxrZXIgKEh1bWFuKSIgfQogICAgICAgIF0KICAgICAgfSwKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAic2xvdHMiLCAidmFsdWUiOiB7ICJtaW4iOiA1LCAibWF4IjogMTAgfSB9LAogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJ0dXJub3ZlciIsICJ2YWx1ZSI6IDYgfSwKICAgICAgewogICAgICAgICJvcCI6ICJzZXQiLAogICAgICAgICJwYXRoIjogIm5vcm1hbCIsCiAgICAgICAgInZhbHVlIjogWwogICAgICAgICAgeyAidHZhbCI6ICJkaWdnZXIiLCAic3ZhbCI6ICJTaG92ZWwiIH0sCiAgICAgICAgICB7ICJ0dmFsIjogImRpZ2dlciIsICJzdmFsIjogIlBpY2siIH0sCiAgICAgICAgICB7ICJ0dmFsIjogImxpZ2h0IiwgInN2YWwiOiAiV29vZGVuIFRvcmNoIiB9LAogICAgICAgICAgeyAidHZhbCI6ICJmbGFzayIsICJzdmFsIjogIkZsYXNrIG9mIE9pbCIgfSwKICAgICAgICAgIHsgInR2YWwiOiAiY2xvYWsiLCAic3ZhbCI6ICJDbG9hayIgfQogICAgICAgIF0KICAgICAgfSwKICAgICAgewogICAgICAgICJvcCI6ICJzZXQiLAogICAgICAgICJwYXRoIjogImFsd2F5cyIsCiAgICAgICAgInZhbHVlIjogWwogICAgICAgICAgeyAidHZhbCI6ICJmb29kIiwgInN2YWwiOiAiUmF0aW9uIG9mIEZvb2QiIH0sCiAgICAgICAgICB7ICJ0dmFsIjogImRpZ2dlciIsICJzdmFsIjogIlNob3ZlbCIgfQogICAgICAgIF0KICAgICAgfSwKICAgICAgewogICAgICAgICJvcCI6ICJzZXQiLAogICAgICAgICJwYXRoIjogImJ1eSIsCiAgICAgICAgInZhbHVlIjogWyJkaWdnZXIiLCAibGlnaHQiLCAiZmxhc2siLCAiY2xvYWsiXQogICAgICB9CiAgICBdCiAgfQp9CmBgYAoKYG5vcm1hbGAgaXMgdGhlIHBvb2wgdGhlIHNob3Agcm9sbHMgaXRzIHN0b2NrIGZyb20uIFRoZSBHZW5lcmFsIFN0b3JlIHVzZXMgdGhpcyB0YWJsZSwgYW5kIHRoZSBCbGFjayBNYXJrZXQgaWdub3JlcyBpdCBpbiBmYXZvciBvZiBpdHMgb3duIHJhbmRvbS1zdG9jayBwYXRoLiBgYWx3YXlzYCBsaXN0cyB3aGF0IHN0YXlzIG9uIHRoZSBzaGVsZiwgc28gdGhpcyBFeGNoYW5nZSBhbHdheXMgaGFzIGZvb2QgYW5kIHNob3ZlbHMuIGBidXlgIGlzIHRoZSBvcmRpbmFyeSBydWxlIGZvciB3aGljaCBpdGVtcyB0aGUgc2hvcCBidXlzIGZyb20gdGhlIHBsYXllci4gVGhlIG5hbWVzIHVuZGVyIGBzdmFsYCBjb21lIGZyb20gYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9vYmplY3QuanNvbmAsIHdpdGggdGhlIGl0ZW0ncyBgJmAgYW5kIGB+YCBtYXJrcyByZW1vdmVkLgoKYHNldGAgcmVwbGFjZXMgdGhlIEdlbmVyYWwgU3RvcmUncyB0YWJsZSB3aXRoIHlvdXJzLCB3aGljaCBmaXRzIGhlcmUgYmVjYXVzZSBvbmUgc3RvcmVmcm9udCBpcyBiZWNvbWluZyBhIGRpZmZlcmVudCBzaG9wLiBUbyBhZGQgb25lIGl0ZW0gdG8gYSBzaG9wIHRoYXQga2VlcHMgaXRzIGlkZW50aXR5LCB1c2UgVHV0b3JpYWwgMidzIGBhcHBlbmRgIGluc3RlYWQuCgojIyBUaGUgb25lIHJ1bGUgZGF0YSBjYW5ub3Qgc2F5CgpUaGUgRXhjaGFuZ2UgYWxzbyBidXlzIGVuY2hhbnRlZCBzd29yZHMgd2hpbGUgdHVybmluZyBhd2F5IG9yZGluYXJ5IG9uZXMuIFRoYXQgZGVjaXNpb24gZGVwZW5kcyBvbiB0aGUgcGFydGljdWxhciBpdGVtIGluIHRoZSBwbGF5ZXIncyBoYW5kLCBhbmQgYSBgYnV5YCB0YWJsZSBoYXMgbm8gbGluZSBmb3IgaXQuIFRoZSBzdG9yZSByZWdpc3RyeSBoYW5kbGVzIHJ1bGVzIGxpa2UgdGhpcy4KCk1ha2UgYHBsdWdpbi5qc2A6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAoKICBzdGFydChtb2QpIHsKICAgIGNvbnN0IGVuZ2luZSA9IG1vZC5lbmdpbmU7CiAgICBjb25zdCBob3N0ID0gZW5naW5lPy5yZWdpc3RyeTsKICAgIGNvbnN0IGV4Y2hhbmdlID0gZW5naW5lPy5yZWdpc3RyaWVzPy5zdG9yZXMuYnlOYW1lKCJTVE9SRV9HRU5FUkFMIik7CiAgICBpZiAoIWhvc3QgfHwgIWV4Y2hhbmdlKSByZXR1cm47CgogICAgY29uc3QgY29yZVdpbGxCdXkgPSBob3N0LnN0b3Jlcy53aWxsQnV5Rm9yKCIqIik7CiAgICBpZiAoIWNvcmVXaWxsQnV5KSByZXR1cm47CgogICAgaG9zdC5zdG9yZXMuc2V0V2lsbEJ1eShleGNoYW5nZS5mZWF0LCAoc2hvcCkgPT4gewogICAgICBjb25zdCBzdGF0ZSA9IGVuZ2luZS5zdGF0ZTsKICAgICAgaWYgKCFzdGF0ZSkgcmV0dXJuIGNvcmVXaWxsQnV5KHNob3ApOwogICAgICBjb25zdCB7IGtub3duIH0gPSBlbmdpbmUuY29yZS5vYmplY3RLbm93blZpZXcoc3RhdGUsIHNob3Aub2JqKTsKICAgICAgaWYgKAogICAgICAgIGtub3duLnR2YWwgPT09IGVuZ2luZS5jb3JlLlRWLlNXT1JEICYmCiAgICAgICAgKGtub3duLnRvSCA+IDAgfHwga25vd24udG9EID4gMCkKICAgICAgKSB7CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgIH0KICAgICAgcmV0dXJuIGNvcmVXaWxsQnV5KHNob3ApOwogICAgfSk7CiAgfSwKfTsKYGBgCgpEdXJpbmcgYHN0YXJ0YCwgdGhlIHB1Ymxpc2hlZCBBUEkgMi4wIGVuZ2luZSBkb21haW4gcHJvdmlkZXMgdGhlIGxpdmUgc3RvcmUgcmVnaXN0cnkuIFRoaXMgZXhhbXBsZSBydW5zIGluLXByb2Nlc3MgYW5kIHJlcXVlc3RzIGBlbmdpbmU6YWNjZXNzYCBhbmQgYHJlZ2lzdHJ5OnN0b3JlYC4gSXQgY2Fubm90IHJ1biBpbiBhIFdvcmtlciwgYW5kIHRoZSBwbGF5ZXIgbXVzdCBncmFudCBlbmdpbmUgYWNjZXNzLiBJZiB0aGUgZW5naW5lIGRvbWFpbiBvciB0aGUgc2hvcCBpcyBtaXNzaW5nLCB0aGUgcGx1Z2luIHJldHVybnMgYW5kIHRoZSBkYXRhLW9ubHkgc3RvcmVmcm9udCBzdGF5cyBpbiBwbGFjZS4KCkZvciB0aGUgYnV5aW5nIGV4Y2VwdGlvbiwgdGhlIHBsdWdpbiBjYWxscyB0aGUgcHVibGljIGBlbmdpbmUuY29yZS5vYmplY3RLbm93blZpZXcoc3RhdGUsIHNob3Aub2JqKWAgaGVscGVyIGFuZCByZWFkcyBpdHMgYGtub3duYCByZXN1bHQuIFRoZSBwdWJsaXNoZWQgb2JqZWN0IGNhcnJpZXMgbm8gc3RvcmVkIGBrbm93bmAgdHdpbiwgc28gdGhlIGhlbHBlciBzdXBwbGllcyB0aGUgcGxheWVyLWtub3duIGNvcHkuIEEgaGlkZGVuIGVuY2hhbnRtZW50IG5ldmVyIHF1YWxpZmllcywgYW5kIHRoZSBwbHVnaW4gcmVhZHMgbm8gbGl2ZSBib251cyB2YWx1ZXMuIFRoZSBwbHVnaW4gYWNjZXB0cyBhIGtub3duIGVuY2hhbnRlZCBzd29yZCBmaXJzdCBhbmQgcGFzc2VzIGV2ZXJ5IG90aGVyIGl0ZW0gdG8gYGNvcmVXaWxsQnV5KHNob3ApYCwgd2hpY2ggYXBwbGllcyB0aGUgYmFzZSBnYW1lJ3Mgb3JkaW5hcnkgYnV5aW5nIHJ1bGVzLgoKYG9iamVjdElkYCBhcnJpdmVzIHdpdGggbW9kIEFQSSAyLjEgYW5kIHdpbGwgaWRlbnRpZnkgYW4gaXRlbSBhY3Jvc3Mga25vd24tdmlldyB1cGRhdGVzLiBUaGlzIHN5bmNocm9ub3VzIHJlZ2lzdHJ5IHJ1bGUgaGFzIG5vIHVzZSBmb3IgaXQuCgojIyBDaGVjayB0aGUgcmVzdWx0CgpUdXJuIHRoZSBtb2Qgb24gZnJvbSAqKk1vZHMqKiBhbmQgY2hvb3NlICoqQXBwbHkgY2hhbmdlcyBhbmQgcmVsb2FkKiouIEluIHRvd24sIHRoZSBgMWAgYnVpbGRpbmcgaXMgbm93IHRoZSBBZHZlbnR1cmVyJ3MgRXhjaGFuZ2UuIEl0cyBzdXBwbGllcyByb3RhdGUsIGFuZCBpdCBhbHdheXMgaGFzIGZvb2QgYW5kIGEgc2hvdmVsLiBPZmZlciBpdCBhbiBvcmRpbmFyeSBEYWdnZXIgYW5kIGl0IHJlZnVzZXMuIElkZW50aWZ5IGEgZGFnZ2VyIHdpdGggYSBwb3NpdGl2ZSBhdHRhY2sgYm9udXMsIG9yIGNyZWF0ZSBhbmQgaWRlbnRpZnkgb25lIGluIHdpemFyZCBtb2RlLCBhbmQgdGhlIHNob3AgYnV5cyBpdC4gQSBib251cyB0aGUgcGxheWVyIGhhcyBub3QgbGVhcm5lZCBkb2VzIG5vdCBjb3VudC4KClR1cm4gdGhlIG1vZCBvZmYgYW5kIHJlbG9hZC4gVGhlIHNpZ24sIHRoZSBzdG9jaywgYW5kIHRoZSBidXlpbmcgcnVsZSBhbGwgZ28gYXdheSB3aXRoIGl0LCBhbmQgdGhlIEdlbmVyYWwgU3RvcmUgcmV0dXJucyBhcyB0aGUgYmFzZSBnYW1lIGhhZCBpdC4KCiMjIFZhcmlhdGlvbnMgdG8gdHJ5CgotIFRha2Ugb3ZlciBhIGRpZmZlcmVudCBzdG9yZWZyb250LiBDb3B5IGl0cyB0ZXJyYWluIG5hbWUgYW5kIGl0cyBgU1RPUkVfKmAgY29kZSBmcm9tIGB0ZXJyYWluLmpzb25gIGFuZCBgc3RvcmUuanNvbmAuIEJvdGggbmFtZSB0aGUgc2FtZSBkb29yLCBhbmQgZWFjaCBmaWxlIHVzZXMgdGhlIG5hbWUgaXQgb3ducy4KLSBNYWtlIHRoZSBzaG9wIGEgc3BlY2lhbGlzdC4gQWRkIGFuIGl0ZW0gZnJvbSBUdXRvcmlhbCAyIHRvIGl0cyBgbm9ybWFsYCBsaXN0LCBhbmQga2VlcCBib3RoIGZpbGVzIGluIHRoaXMgbW9kIHNvIHRoZSBpdGVtIGFuZCBpdHMgc3RvY2sgbGluZSBhcnJpdmUgdG9nZXRoZXIuCi0gQ2hhbmdlIHRoZSBleGNlcHRpb24uIGBlbmdpbmUuY29yZS5UVi5TV09SRGAgaXMgdGhlIHN3b3JkIGl0ZW0gY2xhc3MuIFN3YXAgaW4gYSBkaWZmZXJlbnQgZXhpc3RpbmcgYFRWYCB2YWx1ZSBhbmQgYSBwbGF5ZXIta25vd24gaXRlbSBmaWVsZCB5b3UgY2FuIGV4cGxhaW4gdG8gdGhlIHBsYXllci4KLSBSZW1vdmUgYHBsdWdpbi5qc2AsIGJvdGggY2FwYWJpbGl0aWVzLCBhbmQgdGhlIGBwbHVnaW5gIGZhY2V0LCB0aGVuIHNldCBgcnVudGltZWAgdG8gYGRhdGFgIGFuZCBgYXBpYCB0byBgKmAuIFRoZSBzaG9wIGtlZXBzIGl0cyBzaWduIGFuZCBzdG9jayBhbmQgbG9zZXMgdGhlIGVuY2hhbnRlZC1zd29yZCBleGNlcHRpb24sIHdoaWNoIGlzIHRoZSBvbmx5IHBhcnQgdGhhdCBuZWVkZWQgdGhlIHBsdWdpbi4KCiMjIFNhbXBsZSBtb2QKClRoZSBmb3VyIGZpbGVzIGFib3ZlIGFyZSB0aGUgY29tcGxldGUgbW9kLiBLZWVwIHRoZW0gdG9nZXRoZXIgaW4gb25lIGZvbGRlci4gVGhlIHRlcnJhaW4gYW5kIHN0b3JlIHBhdGNoZXMgbmFtZSB0aGUgc2FtZSBHZW5lcmFsIFN0b3JlIGRvb3J3YXksIGFuZCB0aGUgcGx1Z2luIGZpbmRzIHRoYXQgZG9vcndheSB0aHJvdWdoIHRoZSBsaXZlIHJlZ2lzdHJ5LgoKLS0tCgoqKk5leHQ6Kiogb25jZSB5b3UgY2FuIG1ha2UgYSBzbWFsbCBtb2QgZnJvbSBzY3JhdGNoLCB0aGUgW2F1dGhvcmluZyBndWlkZV0oLi4vQVVUSE9SSU5HLm1kKSBpcyB0aGUgcmVmZXJlbmNlIGZvciB0aGUgcmVzdCBvZiB0aGUgcmVjb3JkIGZpbGVzLgo="
  },
  {
    "id": "tutorials",
    "path": "tutorials/README.md",
    "source": "local",
    "audience": "beginner",
    "title": "The beginner path",
    "note": "How the eight lessons fit together, and what to read next.",
    "encoded": "IyBNYWtlIGEgbW9kCgpUaGVzZSBlaWdodCB0dXRvcmlhbHMgYXJlIGZvciBwZW9wbGUgd2hvIGhhdmUgbmV2ZXIgbWFkZSBhIG1vZC4gVGhleSBhc3N1bWUgeW91IGNhbiBlZGl0IGEgdGV4dCBmaWxlIGFuZCBub3RoaW5nIGVsc2UuIFRoZSBmaXJzdCBvbmUgdGFrZXMgYWJvdXQgZml2ZSBtaW51dGVzIGFuZCBjaGFuZ2VzIHRoZSBnYW1lLgoKWW91IGNhbiBza2lwIFR5cGVTY3JpcHQsIGEgY29tcGlsZXIsIGEgYnVpbGQgc3RlcCwgYW4gYWNjb3VudCwgYW5kIGEgY29weSBvZiBBbmdiYW5kJ3Mgc291cmNlLiBBIG1vZCBpcyBhIGZvbGRlciB3aXRoIGEgY291cGxlIG9mIGZpbGVzIGluIGl0LgoKLS0tCgojIyBUaGUgZWlnaHQgdHV0b3JpYWxzCgpFYWNoIHR1dG9yaWFsIHRlYWNoZXMgb25lIGlkZWEgYW5kIGVuZHMgd2l0aCBzb21ldGhpbmcgeW91IGNhbiBzZWUgb24gc2NyZWVuLgoKfCB8IFR1dG9yaWFsIHwgV2hhdCB5b3UgbGVhcm4gfCBGaWxlcyB8CnwgLS0tIHwgLS0tIHwgLS0tIHwgLS0tIHwKfCAxIHwgW0NoYW5nZSBvbmUgdGhpbmddKDAxLXR3ZWFrLWEtdmFsdWUubWQpIHwgRWRpdGluZyBhIHZhbHVlIHRoZSBnYW1lIGFscmVhZHkgaGFzIHwgMiB8CnwgMiB8IFtBZGQgYW4gaXRlbV0oMDItYWRkLWFuLWl0ZW0ubWQpIHwgQWRkaW5nIHNvbWV0aGluZyB0aGUgZ2FtZSBoYXMgbmV2ZXIgc2VlbiB8IDMgfAp8IDMgfCBbQWRkIGEgbW9uc3Rlcl0oMDMtYWRkLWEtbW9uc3Rlci5tZCkgfCBUaGUgc2FtZSBtb3ZlIGluIGFub3RoZXIgZmlsZSwgcGx1cyB0aGUgb25lIGZpZWxkIG1vc3QgbGlrZWx5IHRvIHRyaXAgeW91IHVwIHwgMiB8CnwgNCB8IFtDaGFuZ2UgYSBzcGVsbF0oMDQtY2hhbmdlLWEtc3BlbGwubWQpIHwgUmVhY2hpbmcgaW50byBhIGNsYXNzLCBhbmQgd2hhdCBhIHBvc2l0aW9uYWwgcGF0aCBjb3N0cyB8IDIgfAp8IDUgfCBbSG9vayBiZWhhdmlvcl0oMDUtaG9vay1iZWhhdmlvdXIubWQpIHwgUnVubmluZyB5b3VyIG1vZCdzIGNvZGUsIGluIHRlbiBsaW5lcyB8IDIgfAp8IDYgfCBbQWRkIGFuIG9wdGlvbl0oMDYtYWRkLWFuLW9wdGlvbi5tZCkgfCBMZXR0aW5nIHRoZSBwbGF5ZXIgc3dpdGNoIHlvdXIgY2hhbmdlIG9uIGFuZCBvZmYgfCAyIHwKfCA3IHwgW0FkZCBhbiBhcnRpZmFjdF0oMDctYWRkLWFuLWFydGlmYWN0Lm1kKSB8IEJ1aWxkaW5nIG9uIHRvcCBvZiBhbiBpdGVtIHRoZSBnYW1lIGFscmVhZHkgaGFzIHwgMiB8CnwgOCB8IFtBZGQgYSBzdG9yZV0oMDgtYWRkLWEtc3RvcmUubWQpIHwgVHVybmluZyBhIHRvd24gc3RvcmVmcm9udCBpbnRvIHlvdXIgb3duIHNob3AsIGFuZCBhZGRpbmcgb25lIHNob3AgcnVsZSB8IDQgfAoKSWYgeW91IGFyZSBuZXcsIGRvIHRoZW0gaW4gb3JkZXIuIEVhY2ggb25lIGJ1aWxkcyBvbiB0aGUgb25lcyBiZWZvcmUgaXQgYW5kIGlzIHNob3J0IGVub3VnaCB0byByZWFkIGluIGZ1bGwgYmVmb3JlIHlvdSB0eXBlIGFueXRoaW5nLiBUdXRvcmlhbCA3IG5lZWRzIG9ubHkgdHV0b3JpYWwgMiwgc28geW91IGNhbiBqdW1wIHRvIGl0IGlmIHlvdSBjYW1lIGhlcmUgdG8gbWFrZSBhbiBhcnRpZmFjdC4gVHV0b3JpYWwgOCBuZWVkcyB0dXRvcmlhbHMgMiBhbmQgNSwgYW5kIGl0IGlzIHRoZSBwbGFjZSB0byBqdW1wIHRvIGlmIHlvdSBjYW1lIGhlcmUgdG8gbWFrZSBhIHNob3AuCgpUdXRvcmlhbHMgMSB0aHJvdWdoIDcgaGF2ZSBbaGlzdG9yaWNhbCBzYW1wbGUgZm9sZGVycyBpbiBDb3JlXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC90cmVlL21hc3Rlci9zYW1wbGVzL3R1dG9yaWFscykuIFRoZSBjb2RlIHNhbXBsZXMgdGhlcmUgZm9yIHR1dG9yaWFscyA1IGFuZCA2IHN0aWxsIHVzZSBBUEkgMSwgc28gdXNlIHRoZSBBUEkgMiBjb2RlIG9uIHRoZXNlIHBhZ2VzIGluc3RlYWQuIFR1dG9yaWFsIDgncyBjb21wbGV0ZSBmaWxlcyBhcmUgb24gaXRzIHBhZ2UuIE1vZEZvcmdlIHRlc3RzIHRoZSBsb2NhbCBBUEkgMiBleGFtcGxlcyBhbmQgZW1iZWRzIGFsbCBlaWdodCBsZXNzb25zIGluIHRoZSB3b3Jrc2hvcC4KClRvIHRyeSBhIHNhbXBsZSwgY29weSBpdHMgZm9sZGVyIGludG8gdGhlIGRlc2t0b3AgYG1vZHMvYCBmb2xkZXIsIG9yIGluIGEgYnJvd3NlciB1c2UgKipDaG9vc2UgYSBtb2RzIGZvbGRlci4uLioqIHRvIHNlbGVjdCB0aGUgZm9sZGVyIHRoYXQgY29udGFpbnMgaXQuIFVzZSB0aGUgc2NoZW1hIDIgbWFuaWZlc3QgZnJvbSB0aGVzZSB0dXRvcmlhbHMgd2l0aCB5b3VyIG93biBpZCBhbmQgcmVwb3NpdG9yeS4gRm9yIHR1dG9yaWFscyA1IGFuZCA2LCBhbHNvIHN3YXAgaW4gdGhlIEFQSSAyIHZlcnNpb24gb2YgdGhlIHNjcmlwdCBmcm9tIHRoZXNlIHBhZ2VzLgoKLS0tCgojIyBXaHkgbm90IGp1c3QgZWRpdCBBbmdiYW5kPwoKQW5nYmFuZCBoYXMgYmVlbiBjdXN0b21pemFibGUgZnJvbSB0ZXh0IGZpbGVzIGZvciBkZWNhZGVzLCBhbmQgaWYgZWRpdGluZyB0aG9zZSBmaWxlcyB3b3JrcyBmb3IgeW91LCBrZWVwIGRvaW5nIGl0LgoKQSBOZW8gQW5nYmFuZCBtb2QgdHVybnMgeW91ciBjaGFuZ2UgaW50byBzb21ldGhpbmcgcG9ydGFibGU6CgotIFRoZSBiYXNlIGdhbWUgc3RheXMgdW50b3VjaGVkLCBhbmQgeW91ciBjaGFuZ2Ugc2l0cyBpbiBhIGxheWVyIG92ZXIgaXQuCi0gVGhlIG1vZCBoYXMgYW4gb2ZmIHN3aXRjaCwgYW5kIHR1cm5pbmcgaXQgb2ZmIGdpdmVzIGJhY2sgdGhlIHVubW9kaWZpZWQgZ2FtZSBleGFjdGx5IGFzIGl0IHdhcy4KLSBZb3Ugc2hhcmUgYSBmb2xkZXIgb3IgYSByZXBvc2l0b3J5IGxpbmsuIE5vYm9keSBoYXMgdG8gYXBwbHkgYSBwYXRjaCBmaWxlIG9yIG1haW50YWluIGEgZm9yay4KLSBNb2RzIGZyb20gc2V2ZXJhbCBwZW9wbGUgY29tYmluZSB3aXRob3V0IGFueSBvZiB0aGVtIGhhdmluZyB0byBrbm93IGFib3V0IGVhY2ggb3RoZXIuCi0gWW91IGNhbiBleHBvc2Ugc2V0dGluZ3Mgc28gcGxheWVycyBjYW4gdHVuZSB0aGUgbW9kIHdpdGhvdXQgZWRpdGluZyBpdC4KLSBUaGUgZ2FtZSBjYW4gdXBkYXRlIHVuZGVybmVhdGggdGhlIG1vZCB3aXRob3V0IHlvdSByZS1hcHBseWluZyBhbnl0aGluZy4KLSBUaGUgc2FtZSBzeXN0ZW0gdGhhdCBjaGFuZ2VzIG9uZSBudW1iZXIgY2FuIGNhcnJ5IGFuIGVudGlyZSB2YXJpYW50LgoKVGhhdCByYW5nZSBydW5zIGZyb20gIkkgbWlzcyB0aGlzIG9uZSBmZWF0dXJlIiB0byAiSSB3YW50IHRvIGJ1aWxkIHRoZSBuZXh0IFpBbmdiYW5kLCIgYW5kIGJvdGggZW5kcyB1c2UgdGhlIHNhbWUgbWVjaGFuaXNtLiBUdXRvcmlhbCAxIGlzIHRoZSBmaXJzdCBlbmQsIGFuZCBubyBzdHJ1Y3R1cmFsIGJhcnJpZXIgc2VwYXJhdGVzIGl0IGZyb20gdGhlIHNlY29uZC4gQSB0b3RhbCBjb252ZXJzaW9uIHVzZXMgdGhpcyBzYW1lIHN5c3RlbSBhdCBmdWxsIHNjYWxlOiBpdCBkZXBlbmRzIG9uIHRoZSBiYXNlIGdhbWUsIHJlcGxhY2VzIHdoYXQgeW91IGRvIG5vdCB3YW50LCBhbmQgYWRkcyB5b3VyIG93biB3b3JsZC4KCi0tLQoKIyMgVmFuaWxsYSBzdGF5cyB2YW5pbGxhCgpFYXN5IG1vZGRpbmcgcmFpc2VzIGEgZmFpciB3b3JyeTogYSBjb21tdW5pdHkgY291bGQgZW5kIHVwIHdpdGggYSB0aG91c2FuZCBwZXJzb25hbCB2ZXJzaW9ucyBvZiB0aGUgZ2FtZSBhbmQgbm8gc2hhcmVkIGdyb3VuZC4gTmVvIEFuZ2JhbmQga2VlcHMgYSBzaGFyZWQgYmFzZWxpbmUgaW4gdGhyZWUgd2F5cy4KCi0gVGhlIGJhc2UgZ2FtZSBzaGlwcyBhcyB0aGUgc2hhcmVkIHZhbmlsbGEgdGFyZ2V0OiB0aGUgbGF0ZXN0IG9mZmljaWFsIEFuZ2JhbmQgcmVsZWFzZSwgcmVwcm9kdWNlZCBmYWl0aGZ1bGx5LCB3aXRoIG5vIG1vZHMgZW5hYmxlZC4gQW4gdW50b3VjaGVkIGluc3RhbGwgZ2l2ZXMgeW91IHRoYXQgZ2FtZSwgYW5kIHRoZSBwcm9qZWN0IG1lYXN1cmVzIGl0c2VsZiBhZ2FpbnN0IGl0LgotIFRoZSBwcm9qZWN0IGJ1bmRsZXMgbm8gbW9kcyBhdCBhbGwsIGluY2x1ZGluZyB0aGUgYXV0aG9yJ3Mgb3duLiBFdmVyeSBtb2QgaW5zdGFsbHMgdGhlIHNhbWUgd2F5IHlvdXJzIHdvdWxkLgotIEV2ZXJ5IG1vZCBpcyBhIGxheWVyIHlvdSBjYW4gbmFtZSwgbGlzdCwgYW5kIHJlbW92ZS4gQSBnYW1lJ3MgZGlhZ25vc3RpY3MgcmVjb3JkIGl0cyBlbmFibGVkIG1vZHMgYW5kIHRoZWlyIHZlcnNpb25zLCBhbmQgdGhlIGNoYXJhY3RlciBkdW1wIGluY2x1ZGVzIHRoZSBzYW1lIGxpc3QsIHNvIGFueSB0d28gcGVvcGxlIGNhbiBjaGVjayB3aGV0aGVyIHRoZXkgd2VyZSBwbGF5aW5nIHRoZSBzYW1lIHRoaW5nLgoKLS0tCgojIyBJZGVhcyBmb3IgYSBmaXJzdCBtb2QKClNvbWUgc3RhcnRpbmcgcG9pbnRzIGZvciB5b3VyIGZpcnN0IGZvbGRlcjoKCi0gQnJpbmcgYmFjayBhIGZlYXR1cmUgYW4gb2xkZXIgQW5nYmFuZCBoYWQgYW5kIGEgbmV3ZXIgb25lIGRyb3BwZWQKLSBBZGQgYSBtb25zdGVyLCBvciBhIGZhbWlseSBvZiB0aGVtCi0gQWRkIGFuIGFydGlmYWN0IHdvcnRoIGRlc2NlbmRpbmcgZm9yLCB3aGljaCBpcyBbdHV0b3JpYWwgN10oMDctYWRkLWFuLWFydGlmYWN0Lm1kKQotIFdyaXRlIGEgbmV3IHNwZWxsLCBvciBtb3ZlIG9uZSB0byBhIGNsYXNzIHRoYXQgbmV2ZXIgZ290IGl0Ci0gQ2hhbmdlIHdoYXQgdGhlIHN0b3JlcyBzdG9jaywgb3IgaG93IHRoZXkgcHJpY2UgaXQKLSBBZGQgYSBxdWFsaXR5LW9mLWxpZmUgYmVoYXZpb3IgdGhhdCBoYXMgYmVlbiBhbm5veWluZyB5b3UgZm9yIHllYXJzCi0gUmVwbGFjZSB0aGUgZ3JhcGhpY3MKLSBBdXRvbWF0ZSBzb21ldGhpbmcgdGVkaW91cwotIEJ1aWxkIGEgdGhlbWVkIGNvbnRlbnQgcGFjaywgYSB3aG9sZSBkdW5nZW9uJ3Mgd29ydGggb2Ygb25lIGlkZWEKLSBUcnkgYSBtZWNoYW5pYyBub2JvZHkgaGFzIHRyaWVkLCBhbmQgZmluZCBvdXQgd2h5IG5vYm9keSBoYXMKLSBSZWJhbGFuY2UgYSBjbGFzcyB5b3UgdGhpbmsgaGFzIGFsd2F5cyBiZWVuIHdyb25nCi0gRXZlbnR1YWxseTogeW91ciBvd24gdmFyaWFudAoKVGhlIFtmZWF0dXJlIHJlc3RvcmF0aW9uXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL21vZGRpbmcvRkVBVFVSRV9SRVNUT1JBVElPTi5tZCkgaWRlYSBzdGFydGVkIGluIGEgY29udmVyc2F0aW9uIHdpdGggYSBwbGF5ZXIgYW5kIGlzIG5vdyBhIHNoaXBwZWQgbW9kLgoKLS0tCgojIyBBZnRlciB0aGUgdHV0b3JpYWxzCgpSZWFkIHRoZXNlIHJvdWdobHkgaW4gb3JkZXIgb2YgaG93IG11Y2ggeW91IG5lZWQgdG8ga25vdzoKCjEuIFtSRVFVSVJFTUVOVFMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9SRVFVSVJFTUVOVFMubWQpOiB3aGF0IGEgbW9kIG11c3QgcHJvdmlkZSB0byBiZSBpbnN0YWxsYWJsZS4gVGhlIHBhZ2UgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJ1bGVzIHRoZSBnYW1lIGVuZm9yY2VzLCBzbyBpdCBzdGF5cyBjdXJyZW50LiBUbyBjaGVjayB5b3VyIG93biBmb2xkZXIgYWdhaW5zdCB0aG9zZSBydWxlcywgcnVuIGBwbnBtIGV4ZWMgbmVvLWFuZ2JhbmQtbW9kLWNoZWNrIHBhdGgvdG8veW91ci1tb2RgLgoyLiBbQVVUSE9SSU5HLm1kXSguLi9BVVRIT1JJTkcubWQpOiB0aGUgc2hvcnRjdXRzLiBgZHJhZnRSZWNvcmRgIGZpbGxzIGluIGEgbmV3IHJlY29yZCBmcm9tIGNvbXBhcmFibGUgcmVjb3JkcyBpbiB0aGUgZ2FtZSwgYGNoZWNrUmVjb3Jkc2AgbmFtZXMgZXZlcnkgd2F5IHlvdXIgZGF0YSB3b3VsZCBzaWxlbnRseSBmYWlsLCBhbmQgYE1vZFByb2plY3RgIGNvbXBvc2VzIGEgd2hvbGUgbW9kIHRocm91Z2ggdGhlIHNhbWUgcGlwZWxpbmUgdGhlIGdhbWUgdXNlcywgYmVmb3JlIHlvdSBsb2FkIGl0LiBSZWFkIHRoaXMgYmVmb3JlIHlvdSB3cml0ZSBtdWNoIGJ5IGhhbmQuCjMuIFtUaGUgbW9kZGluZyBodWJdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9SRUFETUUubWQpOiBwYWNrIGFuYXRvbXksIHJlY29yZCBjb21wb3NpdGlvbiwgbmFtZXNwYWNlZCBmaWVsZHMgb2YgeW91ciBvd24sIGFuZCBhIHRhYmxlIG9mIHdoYXQgaXMgYnVpbHQgdG9kYXkgYW5kIHdoYXQgaXMgc3RpbGwgYSBkZXNpZ24uCjQuIFtNT0RfU0VBTVMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9NT0RfU0VBTVMubWQpOiB0aGUgZnVsbCBsaXN0IG9mIGJlaGF2aW9yIGhvb2tzLCBhbmQgaG93IHRoZSBnYW1lIGNvbWJpbmVzIGFuc3dlcnMgZnJvbSBzZXZlcmFsIG1vZHMuCjUuIFtQbHVnaW4gc2NhZmZvbGRpbmddKC4uL1NDQUZGT0xESU5HLm1kKTogdGhlIGZvbGRlciBsYXlvdXQsIGVudHJ5IHBvaW50LCBpbXBvcnRzLCBhbmQgQVBJIDIgbWFuaWZlc3QuCjYuIFtNT0RfQ09NUEFUSUJJTElUWS5tZF0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL01PRF9DT01QQVRJQklMSVRZLm1kKTogd2hhdCBhbiBlbmdpbmUgcmVsZWFzZSBtYXkgYW5kIG1heSBub3QgYnJlYWssIGFuZCB3aGF0IHRvIHdyaXRlIGluIGBlbmdpbmVgLiBSZWFkIHRoaXMgYmVmb3JlIHlvdSBwdWJsaXNoLgo3LiBbTU9EX1JFQUNILm1kXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL21vZGRpbmcvTU9EX1JFQUNILm1kKTogbWVhc3VyZWQgYW5zd2VycyB0byB3aGV0aGVyIGEgbW9kIGNhbiBkbyBhIGdpdmVuIHRoaW5nLiBUaGUgcGFnZSBpcyBsb25nLCBhbmQgaXQgaXMgd2hlcmUgdG8gY2hlY2sgYSBjYXBhYmlsaXR5IGNsYWltIGJlZm9yZSB5b3UgYnVpbGQgb24gaXQuCgpJZiB5b3UgYXJlIHN0dWNrIG9uIGhvdyB0byBzdGFydCwgZ28gdG8gYSB0dXRvcmlhbC4gSWYgeW91IGFyZSBzdHVjayBvbiB3aGF0IGEgZmllbGQgaXMgY2FsbGVkLCBnbyB0byB0aGUgcmVmZXJlbmNlIGRvY3VtZW50cy4KCi0tLQoKUmVhZCBbUHVibGlzaGluZ10oLi4vUFVCTElTSElORy5tZCkgYmVmb3JlIHlvdSBzaGFyZSB0aGUgZmluaXNoZWQgZm9sZGVyIG9yIHJlcG9zaXRvcnkuCgojIyBSZWFkIGEgcmVhbCBtb2QKClRoZSBmaXJzdC1wYXJ0eSBtb2RzIGFyZSB3cml0dGVuIHRvIGJlIHJlYWQsIGFuZCBlYWNoIG9uZSBpbiB0aGlzIHRhYmxlIGlzIG1vcmUgaW52b2x2ZWQgdGhhbiB0aGUgb25lIGFib3ZlIGl0OgoKfCBNb2QgfCBSZWFkIGl0IGZvciB8CnwgLS0tIHwgLS0tIHwKfCBbdXBzdHJlYW0tY2F0Y2h1cF0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLXVwc3RyZWFtLWNhdGNodXApIHwgQWJvdXQgdGhlIHNtYWxsZXN0IHVzZWZ1bCBtb2QgdGhlcmUgaXM6IG9uZSBmbGFnLCBvbmUgcmVnaXN0cnkgZmlsbGVyLCBhbmQgYSBSRUFETUUgdGhhdCBjaXRlcyBldmVyeSBsaW5lIG9mIGl0IHwKfCBbZmVhdHVyZS1yZXN0b3JhdGlvbl0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWZlYXR1cmUtcmVzdG9yYXRpb24pIHwgQSBzbWFsbCBtb2QgdGhhdCBpcyBib3RoIGRhdGEgYW5kIGNvZGUsIHdpdGggZXZlcnkgZmVhdHVyZSBiZWhpbmQgaXRzIG93biBzd2l0Y2ggfAp8IFtxb2xdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1xb2wpIHwgQmVoYXZpb3IgaG9va3MgaW4gYSBzaGlwcGVkIG1vZCB8CnwgW2J1Zy1maXhlc10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJ1Zy1maXhlcykgfCBNYW55IHNtYWxsLCBpbmRlcGVuZGVudCBjaGFuZ2VzLCBlYWNoIHdpdGggaXRzIG93biBzd2l0Y2ggfAp8IFtsaW5vbGV1bV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWxpbm9sZXVtKSB8IEEgd2hvbGUgYWx0ZXJuYXRpdmUgdGlsZSBlbmdpbmUsIGFuZCBhIG1vZCB0aGF0IHNoaXBzIGFydCB8CnwgW2JvcmddKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1ib3JnKSB8IEEgbW9kIHRoYXQgcGxheXMgdGhlIGdhbWUgfAoKTm9uZSBvZiB0aGVzZSBtb2RzIGlzIGJ1bmRsZWQgd2l0aCB0aGUgZ2FtZSwgYW5kIG5vbmUgbG9hZHMgdGhyb3VnaCBhIHByaXZhdGUgcGF0aC4gRWFjaCBvbmUgaW5zdGFsbHMgdGhlIHdheSB5b3VycyBkb2VzLCBzbyBldmVyeSBmaXJzdC1wYXJ0eSByZWxlYXNlIGV4ZXJjaXNlcyB0aGUgc2FtZSBpbnN0YWxsIHJvdXRlIHlvdSB1c2UuCgotLS0KCiMjIFN0dWNrPwoKW1RoZSBSUEdNIFRvb2xzIERpc2NvcmRdKGh0dHBzOi8vZGlzY29yZC5nZy9ZZWd0d2JIVEJRKSBuZWVkcyBubyBHaXRIdWIgYWNjb3VudC4gQXNrICJjYW4gYSBtb2QgZG8gWD8iIHRoZXJlIGJlZm9yZSB5b3UgYnVpbGQgYXJvdW5kIGEgZ3Vlc3MuCg=="
  },
  {
    "id": "overview",
    "path": "README.md",
    "audience": "beginner",
    "title": "Modding overview",
    "note": "The SDK front door and pack anatomy.",
    "source": "sdk",
    "encoded": "IyBNb2RkaW5nIE5lbyBBbmdiYW5kCgo+ICMjIE5ldyB0byB0aGlzPyBEb24ndCBzdGFydCBoZXJlLgo+Cj4gKipbTWFrZSBhIG1vZF0odHV0b3JpYWxzL1JFQURNRS5tZCkqKiBpcyB0aGUgZnJvbnQgZG9vcjogc2V2ZW4gc2hvcnQgdHV0b3JpYWxzLAo+IHRoZSBmaXJzdCBvZiB3aGljaCBpcyB0d28gZmlsZXMgYW5kIHRha2VzIGFib3V0IGZpdmUgbWludXRlcy4gVGhpcyBwYWdlIGlzIHRoZQo+IHJlZmVyZW5jZTogaXQgZW51bWVyYXRlcywgaXQgZG9lcyBub3QgdGVhY2guCgpNb2RkYWJpbGl0eSBpcyBhIHJhdGlmaWVkIHBpbGxhciBvZiB0aGlzIHByb2plY3QgKFBPUlRfUExBTi5tZCBkZWNpc2lvbnMKMTMtMjEpOiBldmVyeSBhc3BlY3Qgb2YgdGhlIGdhbWUgaXMgb3BlbiB0byBtb2RzLCBpbmNsdWRpbmcgY2FwYWJpbGl0aWVzCnRoYXQgZG8gbm90IGV4aXN0IGluIHRoZSBiYXNlIHJlc291cmNlcy4gVGhlIGJhc2UgZ2FtZSBpcyBpdHNlbGYgYSBwYWNrCigiY29yZSIsIHBhY2sgemVybykgbG9hZGVkIHRocm91Z2ggdGhlIHNhbWUgcGlwZWxpbmUgeW91ciBtb2QgdXNlcyAtIGlmCmNvcmUgY2FuIGRvIGl0LCB5b3VyIG1vZCBjYW4gZG8gaXQsIHJlZGVmaW5lIGl0LCBvciBkZWxldGUgaXQuIENvcmUgaXMKcGFyaXR5IHBsdXMgdGhlIG1vZCBhcmNoaXRlY3R1cmUgb25seTsgZXZlcnl0aGluZyBlbHNlIC0gdGhlIGZpdmUgZmlyc3QtcGFydHkKbW9kcyBpbmNsdWRlZCAtIGlzIGEgbW9kIChkZWNpc2lvbnMgMTctMTgpLiBDaGVhdHkgbW9kcyBhcmUgYWxsb3dlZDogdGhlIGVuZ2luZQp3YXJucyBhbmQgbGFiZWxzLCBpdCBkb2VzIG5vdCBmb3JiaWQuCgpUaGlzIGRpcmVjdG9yeSBpcyB0aGUgbW9kZGluZyBTREsgZG9jdW1lbnRhdGlvbiBzZXQuIEl0IGdyb3dzIHdpdGggdGhlCmVuZ2luZTsgZWFjaCBwYWdlIGRvY3VtZW50cyBzdXJmYWNlcyB0aGF0IGV4aXN0IGFuZCBhcmUgdGVzdGVkLiBGb3IgdGhlCm92ZXJhbGwgZGVzaWduIGFuZCB0aGUgbW9kZGFibGUtc3VyZmFjZSBtYXRyaXgsIHJlYWQgYGRvY3MvTU9EUy5tZGAuCgpNb2QtYXV0aG9yZWQgSlNPTiBkb2N1bWVudHMgdXNlIHRoZSBzYW1lIGVudmVsb3BlIGFzIGRlc2t0b3Agd2luZG93IHN0YXRlLiBTZWUgW0pTT04gZG9jdW1lbnQgc3R5bGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvSlNPTl9TVFlMRS5tZCkgZm9yIHZhbGlkYXRvcnMsIHNlcmlhbGl6YXRpb24sIGFuZCBtaWdyYXRpb25zLgoKKipKdXN0IHdhbnQgdG8gaW5zdGFsbCBvbmU/KiogVGhhdCBpcwpbdGhyZWUga2V5cHJlc3Nlc10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9NT0RTLm1kI2dldHRpbmctYS1tb2QtaW4tb25lLXBhcmFncmFwaCksIG5vdCB0aGlzIHBhZ2UuCgoqKldyaXRpbmcgb25lLCBhbmQgd2FudCB0byB0YWxrIHRvIHNvbWVvbmU/KioKW1RoZSBSUEdNIFRvb2xzIERpc2NvcmRdKGh0dHBzOi8vZGlzY29yZC5nZy9ZZWd0d2JIVEJRKSBpcyB0aGUgcGxhY2UgLSB0aGUKc2VhbXMgYXJlIG5ldywgYW5kICJjYW4gYSBtb2QgZG8gWCIgaXMgZXhhY3RseSB0aGUgcXVlc3Rpb24gd29ydGggYXNraW5nCmJlZm9yZSB5b3UgYnVpbGQgYXJvdW5kIGFuIGFuc3dlciB5b3UgZ3Vlc3NlZC4KCiMjIFN1cmZhY2Ugc3RhdHVzOiBjb21wbGV0ZSwgV0lQLCBub3QgeWV0CgpUaGlzIGRpcmVjdG9yeSBob2xkcyBib3RoICoqYnVpbHQtdG9kYXkqKiBwYWdlcyBhbmQgKipkZXNpZ24tb2YtcmVjb3JkKiogcGFnZXMsCmFuZCBhbiBhdXRob3Igd2hvIGNhbm5vdCB0ZWxsIHdoaWNoIGlzIHdoaWNoIGJ1aWxkcyBhZ2FpbnN0IHRoZSB3cm9uZyBvbmUuIEV2ZXJ5CnN1cmZhY2UgYmVsb3cgY2FycmllcyBvbmUgb2YgdGhyZWUgd29yZHMsIGFuZCB0aGV5IGFyZSBtZWFudCBsaXRlcmFsbHk6CgotICoqQ29tcGxldGUqKjogYnVpbHQsIHRlc3RlZCwgYW5kIGRyaXZlbiBlbmQgdG8gZW5kIGF0IGxlYXN0IG9uY2UgYWxvbmcgdGhlCiAgcGF0aCBhIHBsYXllcidzIGluc3RhbGwgYWN0dWFsbHkgdXNlcy4gV3JpdGUgYWdhaW5zdCBpdCB0b2RheS4KLSAqKldJUCoqOiBwYXJ0bHkgYnVpbHQuIFdoYXQgZXhpc3RzIGlzIHJlYWwgYW5kIGlzIG5vdCBnb2luZyB0byBiZSB0YWtlbiBhd2F5LAogIGJ1dCB0aGUgc3VyZmFjZSBkb2VzIG5vdCB5ZXQgY292ZXIgZXZlcnl0aGluZyBpdHMgbmFtZSBzdWdnZXN0cy4gUmVhZCB0aGUKICBsaW5rZWQgcm93IGJlZm9yZSBhc3N1bWluZyB0aGUgcGFydCB5b3UgbmVlZCBpcyBpbi4KLSAqKk5vdCB5ZXQqKjogdGhlcmUgaXMgbm8gc2VhbS4gV2hhdGV2ZXIgdGhlIGRlc2lnbiBwYWdlcyBzYXkgYWJvdXQgaXQgaXMgYQogIHByb3Bvc2FsLiBEbyBub3QgYnVpbGQgYXJvdW5kIGl0LCBhbmQgZG8gbm90IGJ1aWxkIGEgKndvcmthcm91bmQqIGVpdGhlcjogYQogIHdvcmthcm91bmQgcmVhY2hlcyB0aHJvdWdoIHNvbWV0aGluZyB0aGF0IHdhcyBuZXZlciBhIHNlYW0sIGFuZCBpdCBpcyBleGFjdGx5CiAgd2hhdCB0aGUgcmVhbCBzZWFtIGJyZWFrcyB3aGVuIGl0IGxhbmRzLiBBc2sgb24gdGhlIERpc2NvcmQgaW5zdGVhZC4KCmBNT0RfUkVBQ0gubWRgIGlzIHdoZXJlIGVhY2ggb2YgdGhlc2UgaXMgbWVhc3VyZWQsIG9uZSByb3cgcGVyIGNhcGFiaWxpdHk7IHRoZQp0YWJsZSBiZWxvdyBpcyBhbiBpbmRleCBpbnRvIGl0LiBgbW9kZGluZy1zdGF0dXMudGVzdC50c2AgcmVhZHMgYm90aCBmaWxlcyBhbmQKZmFpbHMgaWYgYSBzdGF0dXMgaGVyZSBzdG9wcyBtYXRjaGluZyB0aGUgbWVhc3VyZW1lbnQgdGhlcmUsIHNvIHRoZSB0d28gY2Fubm90CmRyaWZ0IHNpbGVudGx5LCB3aGljaCBpcyB0aGUgb25seSByZWFzb24gYSBzdW1tYXJ5IHRhYmxlIGxpa2UgdGhpcyBpcyBzYWZlIHRvCndyaXRlIGRvd24gYXQgYWxsLgoKfCBXaGF0IHlvdSB3YW50IHRvIGRvIHwgU3RhdHVzIHwgTWVhc3VyZWQgaW4gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgQ2hhbmdlIGFueSB2YWx1ZSBpbiBhbnkgZ2FtZWRhdGEgZmlsZSwgYWRkIGEga2V5LCByZW1vdmUgYSBrZXksIG9uIGFueSByZWNvcmQsIGluY2x1ZGluZyB0aGUgb25lcyB3aXRoIHJlcGVhdGVkIG5hbWVzIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDIgfAp8IEFkZCByZWNvcmRzIGNvcmUgaGFzIG5ldmVyIHNlZW46IG9iamVjdHMsIG1vbnN0ZXJzLCBlZ29zLCBhcnRpZmFjdHMsIGFuZCB3aG9sZSBuZXcgaXRlbSAqKmNsYXNzZXMqKiAodHZhbHMpIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDIwIHwKfCBFeHRlbmQgYSByZWNvcmQgd2l0aCBmaWVsZHMgb2YgeW91ciBvd24sIGluIHlvdXIgb3duIG5hbWVzcGFjZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxNiB8CnwgU2hpcCByZWFsICoqY29kZSoqIHRoYXQgcnVucyBpbiB0aGUgZ2FtZSwgaW5zdGFsbGVkIGZyb20gZGlzayB3aXRoIG5vIGJ1aWxkIHN0ZXAgaGVyZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxIHwKfCBDaGFuZ2UgYmVoYXZpb3VyOiB0aGUgYE1vZEhvb2tzYCBwb2ludHMsIHBsdXMgdGhlIGtleWVkIHJlZ2lzdHJpZXMgbGlzdGVkIGluIGBNT0RfUkVBQ0gubWRgLCBpdGVtIChjKSB8ICoqQ29tcGxldGUqKiB8IGdhcCAzIHwKfCBNb25zdGVyIGNvbWJhdDogYmxvdyBlZmZlY3RzLCByZWNvcmRpbmcgYW5kIGxpdmUgcGF0aHMsIG9uZSByZWdpc3RyYXRpb24gZm9yIGJvdGggfCAqKkNvbXBsZXRlKiogfCBnYXAgNCB8CnwgU3RvcmUgYmVoYXZpb3VyOiB0aGUgYnV5IHJ1bGUgYW5kIHN0YWNrIHNpemVzIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDUgfAp8IExldmVsIGdlbmVyYXRpb246IHlvdXIgb3duIHdob2xlLWNhdmUgYnVpbGRlciBhbmQgdGhlIHByb2ZpbGUgdGhhdCBzZWxlY3RzIGl0IHwgKipDb21wbGV0ZSoqIHwgZ2FwIDYgfAp8IFZhdWx0cyBhbmQgcm9vbSB0ZW1wbGF0ZXMgZHJhd24gd2l0aCBzeW1ib2xzIGNvcmUgaGFzIG5ldmVyIGRlY29kZWQgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTcgfAp8IFJhbmRvbSBhcnRpZmFjdHM6IHJlYWNoIHRoZSAqKmdlbmVyYXRvcioqLCBub3QganVzdCBzaGlwIGEgZml4ZWQgYXJ0aWZhY3QgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTkgfAp8IEFuIGVmZmVjdCBvZiB5b3VyIG93biB0aGF0IHRoZSBnYW1lIGNhbiAqKmRlc2NyaWJlKiogdG8gdGhlIHBsYXllciB8ICoqQ29tcGxldGUqKiB8IGdhcCAxOCB8CnwgVGlsZSBwYWNrczogcmVnaXN0ZXIgYSBHcmFwaGljcyByb3csIHNoaXAgeW91ciBvd24gYXJ0LCBlaXRoZXIgdGlsZSBlbmdpbmUgfCAqKkNvbXBsZXRlKiogfCBnYXAgOCB8CnwgU291bmRzLCBmb250cywgc3BsYXNoIGFydCwgaGVscCB0ZXh0LCBhbmQgYC5wcmZgIGVmZmVjdHMsIGluY2x1ZGluZyBjbGFzc2ljIFRJTEUgYXNzaWdubWVudHMgbGF5ZXJlZCBvdmVyIGEgZ3JhcGhpY3MgcGFjayB8ICoqQ29tcGxldGUqKiB8IGdhcCA3IHwKfCBMb2NhbGl6YXRpb24sIG5vdCBhIHN0cmluZyB0YWJsZTsgdGhlIHN0cnVjdHVyYWwgc2VhbSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxNCB8CnwgSGF2ZSB5b3VyIHJlY29yZHMgc2NoZW1hLWNoZWNrZWQgYmVmb3JlIHRoZXkgcmVhY2ggdGhlIGdhbWUgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTIgfAp8IFN1cnZpdmUgYSBicm9rZW4gbW9kIGF0IGJvb3QsIHdpdGggdGhlIGZhdWx0IG5hbWVkIGFuZCBhdHRyaWJ1dGVkIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDEzIHwKfCBLbm93IHdoaWNoIG1vZCBhZGRlZCBvciBjaGFuZ2VkIGEgcmVjb3JkLCBpbiB0aGUgcnVubmluZyBnYW1lIGFuZCBpbiB0aGUgc2F2ZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxMCB8CnwgTG9hZCBvcmRlciB0aGF0IG1lYW5zIHdoYXQgdGhlIG1hbmFnZXIgc2F5cyBpdCBtZWFucyB8ICoqQ29tcGxldGUqKiB8IGdhcCAxMSB8CnwgKipSZXBsYWNlIHRoZSBmcm9udCBlbmQqKjogZHJhdyB0aGUgd29ybGQgeW91cnNlbGYsIGFueSB3YXkgeW91IGxpa2UgfCAqKkNvbXBsZXRlKiogfCBnYXAgOSB8CnwgS25vdyAqKndoZXJlIHlvdSBtYXkgZHJhdyoqOiBuYW1lZCByZWdpb25zLCBpbiBncmlkIGNlbGxzIGFuZCBDU1MgcGl4ZWxzLCBvbiBldmVyeSBmcmFtZSB8ICoqQ29tcGxldGUqKiB8IGdhcCA5IHwKfCBEcml2ZSB0aGUgZ2FtZSBwcm9ncmFtbWF0aWNhbGx5OiBhbiBhdXRvcGxheWVyLCBhIGJvdCwgYSB0ZXN0IGhhcm5lc3MgfCAqKkNvbXBsZXRlKiogfCBgQk9SRy5tZGAsIGBNb2RQbHVnaW4uY29udHJvbGxlcmAgfAp8IE1lbnVzOiBhZGQsIHJlb3JkZXIsIHJldGl0bGUgYW5kIHJlLXRhZyAqKnJvd3MqKiAocmVnaXN0cnk6bWVudSksIHRoZW4gcmVwbGFjZSB0aGUgcHJlc2VudGF0aW9uIG9mIGEgc3VwcG9ydGVkIHF1ZXN0aW9uIHwgKipXSVAqKiB8IGdhcCAyMSwgUFJFU0VOVEFUSU9OX09XTkVSX1NFQU0ubWQgfAp8ICoqUmVwbGFjZSB0aGUgVUkqKjogdGhlIEhVRCwgc3RhdHVzIGxpbmUsIG1lc3NhZ2UgYXJlYSwgbWVudSBwcmVzZW50YXRpb24sIGFuZCBmdWxsIHNjcmVlbnMgfCAqKldJUCoqIHwgZ2FwIDIxLCBQUkVTRU5UQVRJT05fT1dORVJfU0VBTS5tZCB8CnwgT3duIGEgSFVEIHJlZ2lvbiAobWVzc2FnZXMsIHZpdGFscywgc3RhdHVzKSB3aXRoIGNvcmUgZHJhd2luZyB0aGUgb25lcyB5b3UgZG8gbm90IGNsYWltLCBvciAqKmNyZWF0ZSBhIHJlZ2lvbiBvZiB5b3VyIG93bioqOiBvcmRlcmVkLCBvdmVybGFwcGluZywgdHJhbnNwYXJlbnQsIGNvbXBvc2l0ZWQsIGFuZCBvd25pbmcgcG9pbnRlciBpbnB1dCBvbiB0aGUgY2VsbHMgaXQgcGFpbnRzIHwgKipXSVAqKiB8IGdhcCAyMSwgUFJFU0VOVEFUSU9OX09XTkVSX1NFQU0ubWQgfAp8IFJldGl0bGUsIHJlZ3JvdXAsIHJlb3JkZXIsIHJlLXRhZyBvciByZWJpbmQgYW4gZXhpc3Rpbmcgd2ViIGtleXByZXNzIGNvbW1hbmQgKGByZWdpc3RyeTptZW51YCk7IHRoZSBjb21tYW5kJ3MgY2xvc3VyZSBzdGF5cyBzaGVsbC1wcml2YXRlIHwgKipDb21wbGV0ZSoqIHwgYE1PRF9SRUFDSC5tZGAgcm93IDIzIHwKfCBSZW5hbWUgb25lIG9mIHlvdXIgb3duIHJ1bGUgZmxhZ3Mgb3Igc2VjdGlvbnMgd2l0aG91dCBsb3NpbmcgdGhlIHBsYXllcidzIHNhdmVkIGNob2ljZSAoYHJlbmFtZWRSdWxlRmxhZ3NgLCBgcmVuYW1lZFNlY3Rpb25GbGFnc2ApIHwgKipDb21wbGV0ZSoqIHwgYEFVVEhPUklORy5tZGAgfAp8IFJlYmluZCBrZXlzLCBvciBhZGQgYSBnYW1lcGFkOiBgaW5wdXQtZG9vci50c2AgaXMgaG9zdCBpbmZyYXN0cnVjdHVyZSwgbm90IGEgc2VhbSB8ICoqTm90IHlldCoqIHwgYE1PRF9TRUFNUy5tZGAgfAp8IENoYW5nZSB0aGUgbWVzc2FnZSB0YWJsZSwgdGhlIGBNU0dfYC0+c291bmQgbWFwLCBvciB0aGUgcHJlZi1maWxlIGhhbmRsZXJzIHwgKipDb21wbGV0ZSoqIHwgYE1PRF9SRUFDSC5tZGAgcm93cyAyMCwgMjEsIDggfAp8IENoYW5nZSB0aGUgbW9uc3RlciBzcGVsbCB0YWJsZSBvciB0aGUgY29tbWFuZCB0YWJsZSB8ICoqTm90IHlldCoqIHwgYE1PRF9SRUFDSC5tZGAgcm93cyAyMiwgMTkgfAp8IEluc3RhbGwsIHVwZGF0ZSBhbmQgdW5pbnN0YWxsIFVYOiByYXRpZmllZCBpbiBmdWxsLCBidWlsdCBpbiBwYXJ0IHwgKipXSVAqKiB8IGBNT0RfTElGRUNZQ0xFLm1kYCB8CgpUd28gdGhpbmdzIHRoaXMgdGFibGUgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IGRvLiBJdCBkb2VzIG5vdCByYW5rIHN1cmZhY2VzIGJ5IGhvdwptdWNoIHdvcmsgdGhleSB3ZXJlLCBhbmQgaXQgZG9lcyBub3QgcHJvbWlzZSBkYXRlcy4gQSAqKk5vdCB5ZXQqKiByb3cgaXMgbm90IGEKcXVldWUgcG9zaXRpb247IHNvbWUgb2YgdGhlbSBhcmUgb25lIHRhc2sgYXdheSBhbmQgc29tZSBhcmUgYSBkZXNpZ24gYXJndW1lbnQKdGhhdCBoYXMgbm90IGJlZW4gc2V0dGxlZC4KCiMjIENvbnRlbnRzCgotIGB0dXRvcmlhbHMvYDogKip0aGUgYmVnaW5uZXIgcGF0aCoqLCBzZXZlbiB0aW55IG1vZHMgd2l0aCBvbmUgaWRlYSBlYWNoLCBlYWNoIGVuZGluZyBpbiBzb21ldGhpbmcgdmlzaWJsZSBvbiBzY3JlZW4uIFRoZSBmaW5pc2hlZCBtb2QgZm9yIGV2ZXJ5IHR1dG9yaWFsIGlzIGEgcmVhbCBmb2xkZXIgdW5kZXIgYHNhbXBsZXMvdHV0b3JpYWxzL2AgdGhhdCBpcyBjb21wb3NlZCBhZ2FpbnN0IHRoZSByZWFsIGdhbWUgZGF0YSBvbiBldmVyeSB0ZXN0IHJ1biwgc28gYSB0dXRvcmlhbCBjYW5ub3QgcXVpZXRseSBzdG9wIHdvcmtpbmcuIFN0YXJ0IHRoZXJlIGlmIHlvdSBoYXZlIG5vdCB3cml0dGVuIGEgbW9kIGZvciB0aGlzIGdhbWUgYmVmb3JlLgotIGBGRUFUVVJFX1JFU1RPUkFUSU9OLm1kYDogYnJpbmdpbmcgYmFjayBtZWNoYW5pY3MgdGhhdCBsYXRlciB2ZXJzaW9ucyBvZiBBbmdiYW5kIGRyb3BwZWQsIHdpdGhvdXQgY2hhbmdpbmcgdmFuaWxsYS4gSXQgY292ZXJzIHRoZSByZXNlYXJjaCBydWxlcyBhIHJlc3RvcmF0aW9uIGhhcyB0byBmb2xsb3cgYW5kIHdoeSByZXN0b3JhdGlvbiBpcyB0aGUgYmVzdCBhdmFpbGFibGUgdGVzdCBvZiB3aGV0aGVyIHRoZSBtb2Qgc3lzdGVtIGlzIHJlYWwuCi0gVGhpcyBwYWdlOiBwYWNrIGFuYXRvbXksIG1hbmlmZXN0cywgYW5kIHJlY29yZCBjb21wb3NpdGlvbiAobGl2ZSB0b2RheSwgYmFja2VkIGJ5IGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCkuCi0gYFJFUVVJUkVNRU5UUy5tZGA6ICoqZXhhY3RseSB3aGF0IGEgbW9kIG11c3QgcHJvdmlkZSoqLiBJdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgcnVsZXMgdGhlIGdhbWUgZW5mb3JjZXMgKGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHNgKSBhbmQgdGhlIGZpeGVkIGNoZWNrcyAoYHBhY2thZ2VzL21vZC1zZGsvc3JjL2NoZWNrcy9gKSwgYW5kIGEgdGVzdCBmYWlscyBpZiB0aGUgZG9jIGFuZCB0aGUgY29kZSBldmVyIGRpc2FncmVlLiBSdW4gdGhlbSBhZ2FpbnN0IHlvdXIgb3duIGZvbGRlciBvciB6aXAgYmVmb3JlIHB1Ymxpc2hpbmc6IGBucHggbmVvLWFuZ2JhbmQtbW9kLWNoZWNrIHBhdGgvdG8veW91ci1tb2RgLiBTdGFydCBoZXJlLgotIGBBVVRIT1JJTkcubWRgOiB0aGUgc2hvcnRjdXRzLiBgZHJhZnRSZWNvcmRgIGZpbGxzIGEgbmV3IHJlY29yZCBmcm9tIGNvcmUncyBvd24gY29tcGFyYWJsZSByZWNvcmRzIChpbmNsdWRpbmcgaXRzIHByaWNlKSwgYGNoZWNrUmVjb3Jkc2AgbmFtZXMgZXZlcnkgd2F5IGEgcmVjb3JkIHdpbGwgc2lsZW50bHkgbm90IHdvcmssIGFuZCBgTW9kUHJvamVjdGAgYXNzZW1ibGVzIGEgd2hvbGUgbW9kIGFuZCBjb21wb3NlcyBpdCB0aHJvdWdoIHRoZSByZWFsIHBpcGVsaW5lIGJlZm9yZSByZXBvcnRpbmcgYW55dGhpbmcuIFJlYWQgdGhpcyBiZWZvcmUgd3JpdGluZyBhIHJlY29yZCBieSBoYW5kLgotIGBNT0RfTElGRUNZQ0xFLm1kYDogaG93IHNhdmVzIHN0YXkgc2FmZSBhY3Jvc3MgaW5zdGFsbCwgdXBkYXRlIGFuZCB1bmluc3RhbGwsIGluc3RhbGxpbmcgZnJvbSBnaXQgKGFuZCBhIGZ1dHVyZSBtYXJrZXRwbGFjZSksIG11bHRpLW1vZCBjb21wb3NpdGlvbiBhbmQgY29uZmxpY3QgcmVzb2x1dGlvbiwgdW5pbnN0YWxsIHJlY292ZXJ5LCBhbmQgdGhlIFVYIHByaW5jaXBsZXMuIE5vdCB5ZXQgZnVsbHkgYnVpbHQuCi0gYFBMVUdJTlMubWRgOiBzaGlwcGluZyBjb2RlIGluIGEgbW9kIGZvbGRlciwgZm9yIGEgbW9kIHRoYXQgYSBtYW5pZmVzdCBhbmQgYSBmZXcgcmVjb3JkIGZpbGVzIGNhbm5vdCBleHByZXNzLiBJdCBjb3ZlcnMgYHBsdWdpbi5qc2AsIGl0cyBgaG9va3MoY3R4KWAvYHJlZ2lzdGVyKGhvc3QsIGN0eClgIGVudHJ5IHBvaW50cywgYW5kIHdoYXQgZWFjaCBvbmUgY2FuIHJlYWNoIGluIGEgbGl2ZSBnYW1lLgotIGBBUEkyLm1kYDogdmVyc2lvbiAyIG9mIHRoZSBtb2QgY29kZSBBUEksIGZvciBhIG1vZCdzIGBzdGFydGAgYW5kIGBob29rc2AuIEV2ZXJ5IGNhbGwgcmV0dXJucyBwbGFpbiBkYXRhIGFuZCBhIHR5cGVkIHJlc3VsdCwgYSBtaXNzaW5nIHBlcm1pc3Npb24gY29tZXMgYmFjayBhcyBgbm90LWdyYW50ZWRgLCBhbmQgcmVhZHMgc2hvdyBvbmx5IHdoYXQgdGhlIHBsYXllciBrbm93cy4gVGhlIHR5cGVzIGFuZCB0aGUgaW4tcHJvY2VzcyBob3N0IGFyZSBidWlsdCwgYW5kIEFQSSAxIHBsdWdpbnMga2VlcCB3b3JraW5nLgotIFtgTUlHUkFUSU5HX1RPX0FQSTIubWRgXShNSUdSQVRJTkdfVE9fQVBJMi5tZCkgbW92ZXMgYW4gQVBJIDEgcGx1Z2luIHRvIEFQSSAyIHN0ZXAgYnkgc3RlcC4gSXQgb3BlbnMgd2l0aCB3aGF0IHRvIGRvIGFuZCB3aGF0IGhhcHBlbnMgaWYgeW91IGRvIG5vdGhpbmcgeWV0LCBtYXBzIGV2ZXJ5IHBhcnQgb2YgdGhlIG9sZCBgY3R4YCB0byBpdHMgQVBJIDIgaG9tZSwgY29udmVydHMgdGhlIG1hbmlmZXN0IHdpdGggYGNvbnZlcnRNYW5pZmVzdFYxYCwgYW5kIGdpdmVzIGEgYmVmb3JlIGFuZCBhZnRlciBmb3IgZWFjaCBwYXJ0LgotIGBNT0RfU0VBTVMubWRgOiB0aGUgY29yZSBzZWFtcyBhIG1vZCByZWFjaGVzIHRocm91Z2gsIGluY2x1ZGluZyB0aGUgYE1vZEhvb2tzYCBiZWhhdmlvdXIgaW50ZXJmYWNlLCBpdHMgcGVyLWhvb2sgZm9sZCBydWxlcywgYW5kIGhvdyBhIHBhdGNoIGlzIHR1cm5lZCBvbi4gRXZlcnl0aGluZyBpdCBkZXNjcmliZXMgaXMgYnVpbHQuCi0gYFJFR0lPTl9JTlBVVC5tZGA6IGhvdyBwb2ludGVyIHRhcHMsIGNvbnRleHQgbWVudXMgYW5kIGxvbmctcHJlc3NlcyByb3V0ZSBieSBwZXItY2VsbCByZWdpb24gb3duZXJzaGlwIHJhdGhlciB0aGFuIGJ5IHJlY3RhbmdsZS4gVGhpcyBpcyBidWlsdCwgYW5kIHRoZSBwYWdlIGlzIGtlcHQgYXMgYSBkZXNpZ24gcmVjb3JkLgotIGBDTE9VRF9CQUNLVVBfREVTSUdOLm1kYDogYSBwbGF5ZXItY2hvc2VuIHNhdmUtYmFja3VwIGZvbGRlciBhcyBhIGBxb2xgIGZlYXR1cmUsIHRoZSB0d28gc21hbGwgaG9zdCBzZWFtcyBpdCBuZWVkcywgYW5kIHdoeSB0aGUgdHJpZ2dlciBpcyBzdGlsbCBibG9ja2VkIG9uIGEgc2VhbSB0aGF0IGRvZXMgbm90IGV4aXN0IHlldCBldmVuIHRob3VnaCB0aGUgZW5naW5lIHNpZGUgaXMgZG9uZS4KLSBgTU9EX0NPTVBBVElCSUxJVFkubWRgOiB3aGF0IGFuIGVuZ2luZSByZWxlYXNlIG1heSBhbmQgbWF5IG5vdCBicmVhaywgYW5kIHdoYXQgeW91IGhhdmUgdG8gZG8gYWJvdXQgaXQuIEl0IGNvdmVycyB0aGUgZm91ciBnYXRlcyB0aGF0IGNhbiBzdHJhbmQgYSBtb2QsIHdoYXQgdG8gd3JpdGUgaW4gYGVuZ2luZWAsIHRoZSB0d28tcmVsZWFzZSBydWxlIGZvciBhbiBBQkkgYnVtcCwgYW5kIHRoZSBnYXAgYXJvdW5kIGBjdHguY29yZWAuIFJlYWQgdGhpcyBiZWZvcmUgcHVibGlzaGluZyBhbnl0aGluZy4KLSBbYEhFQURMRVNTX1JVTk5FUi5tZGBdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9IRUFETEVTU19SVU5ORVIubWQpOiBib290aW5nIHRoZSBnYW1lIHVuZGVyIE5vZGUgd2l0aCB5b3VyIG1vZCwgcGxheWluZyBhIGZpeGVkIHNlc3Npb24gd2l0aCBpdCBvZmYgYW5kIHRoZW4gb24sIGFuZCByZWFkaW5nIHRoZSBKU09OIHJlcG9ydCBvZiBmYXVsdHMsIHNsb3cgdHVybnMsIHJlZnVzZWQgY2FwYWJpbGl0aWVzIGFuZCBzYXZlIGRpZmZlcmVuY2VzLiBSdW4gaXQgd2l0aCBgcG5wbSBtb2QtcnVubmVyIHBhdGgvdG8veW91ci1tb2RgLgotIGBNT0RfUkVBQ0gubWRgOiBob3cgbXVjaCBvZiB0aGUgZ2FtZSBhIG1vZCBjYW4gY2hhbmdlIHRvZGF5LCBtZWFzdXJlZC4gSXQgaGFzIHRoZSBob29rIGNvdW50LCBhIGNlbnN1cyBvZiB0aGUgcG9ydCdzIGRpc3BhdGNoIHRhYmxlcyBhbmQgd2hpY2ggb2YgdGhlbSBhIG1vZCBjYW4gcmVhY2gsIHdoYXQgZGF0YSBsYXllcmluZyBzdXBwb3J0cywgd2hpY2ggcmVzb3VyY2VzIGNhbiBiZSBvdmVycmlkZGVuLCBhbmQgdGhlIGdhcCBsaXN0LiBDaGVjayBpdCBiZWZvcmUgdHJ1c3RpbmcgYSBjYXBhYmlsaXR5IGNsYWltIG9uIGFueSBvdGhlciBwYWdlLCBiZWNhdXNlIHNvbWUgcGFnZXMgaW4gdGhpcyBkaXJlY3RvcnkgZGVzY3JpYmUgZGVzaWducyBhbmQgb3RoZXJzIGRlc2NyaWJlIHdoYXQgaXMgYnVpbHQuCi0gKipSZXBsYWNpbmcgdGhlIHdob2xlIGZyb250IGVuZCoqIChhbiA4LzE2LWJpdCBtZW51IHNoZWxsLCBpc29tZXRyaWMsIGZ1bGwgM0QsIGZpcnN0LXBlcnNvbiwgY29udHJvbGxlci1kcml2ZW4pIGlzIGJ1aWx0OiBhIHBsdWdpbidzIGBmcm9udGVuZGAgbWVtYmVyIGRyYXdzIHRoZSB3b3JsZCBpdHNlbGYsIHVuZGVyIGBkaXNwbGF5OnJlcGxhY2VgLiBDb3JlIG5lZWRlZCBubyBjaGFuZ2UgZm9yIGl0LCBiZWNhdXNlIGl0IHdhcyBhbHJlYWR5IGhlYWRsZXNzLiBTZWUgYFBMVUdJTlMubWRgIGFuZCBnYXAgOSBpbiBgTU9EX1JFQUNILm1kYC4KLSBgZG9jcy9MSU5PTEVVTS5tZGA6IHRpbGUgcGFja3MgYW5kIGNvbnZlcnRpbmcgdGhlIGNsYXNzaWMgdGlsZXNldHMuCi0gYEJVR19GSVhFUy5tZGA6IHRoZSBgYnVnLWZpeGVzYCBtb2QsIHdpdGggaXRzIGRlc2lnbiBhbmQgYSByZWZlcmVuY2VkIGNoYW5nZWxvZyBvZiB1cHN0cmVhbSBjcmFzaCwgY29ycnVwdGlvbiwgc2F2ZSBhbmQgZGV0ZXJtaW5pc20gZml4ZXMgdGhhdCBjb3JlIGRvZXMgbm90IGNhcnJ5LiBQYXRjaGVzIGxhbmQgd2l0aCB0aGUgbW9kIHJ1bnRpbWUgYW5kIHRoZSBzeXN0ZW1zIHRoZXkgdG91Y2guCi0gYFVQU1RSRUFNX0NBVENIVVBfTU9EX1NDT1BFLm1kYDogd2hlcmUgdGhlIGB1cHN0cmVhbS1jYXRjaHVwYCBtb2QgZHJhd3MgaXRzIGxpbmUgYWdhaW5zdCBgYnVnLWZpeGVzYC4gVGhlIG1vZCBpcyBpbiBpdHMgb3duIHJlcG9zaXRvcnkgKHNlZSB0aGUgdGFibGUgYmVsb3cpLgotIFN0aWxsIHRvIGNvbWUgYXMgdGhlIGVuZ2luZSBhZGRzIHRoZW06IGEgaGFuZGxlciByZWdpc3RyeSBjYXRhbG9nIChlZmZlY3RzLCBjb21tYW5kcywgcm9vbSBidWlsZGVycyksIHRoZSBzYW5kYm94IGNhcGFiaWxpdHkgcmVmZXJlbmNlIGZvciBzY3JpcHRlZCBwbHVnaW5zLCBkaWFsb2csIHF1ZXN0IGFuZCBzaG9wIGNvb2tib29rcywgYW5kIHB1Ymxpc2hpbmcgZ3VpZGFuY2UuIFZhbGlkYXRpbmcgYW5kIGJ1bmRsaW5nIGFyZSBub3Qgb24gdGhhdCBsaXN0LCBiZWNhdXNlIGBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIGFuZCBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCBhbHJlYWR5IHNoaXAgaW4gYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGtgLgojIyBUaGUgZmlyc3QtcGFydHkgbW9kcwoKVGhlcmUgYXJlIGVpZ2h0LCAqKm5vbmUgb2YgdGhlbSBidW5kbGVkKiosIGFuZCBhbGwgYXJlIG9mZiB1bnRpbCBlbmFibGVkIChzZWUgYERFRkFVTFRfRU5BQkxFRF9NT0RTYDsgYW4gdW50b3VjaGVkIGluc3RhbGwgaXMgdGhlIGZhaXRoZnVsIGJhc2UgZ2FtZSB3aXRoIG5vIG1vZCBsb2FkZWQpLiBFYWNoIGxpdmVzIGluIGl0cyBvd24gcmVwb3NpdG9yeSBhbmQgYXJyaXZlcyB0aHJvdWdoIHRoZSBtb2QgbWFuYWdlcidzICpSZWNvbW1lbmRlZCBtb2RzLi4uKiByb3c6Cgp8IGlkIHwgc2hhcGUgfCB3aGVyZSBpdCBsaXZlcyB8IHdoYXQgaXQgYWRkcyB8CnwgLS0tIHwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgcW9sYCB8IGNvbnRlbnQgfCBbb3duIHJlcG9dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1xb2wpIHwgTmV3IGNvbnZlbmllbmNlcywgY3VycmVudGx5IGp1c3QgYXV0by1kaWcgb24gd2Fsay4gQW5nYmFuZCdzIGJ1aWx0LWluIGA9YCBvcHRpb25zIGFyZSBub3QgaGVyZTogdGhleSBzaGlwIGluIGNvcmUgYXQgdGhlaXIgdXBzdHJlYW0gZGVmYXVsdHMuIFNlZSBgUU9MLm1kYC4gfAp8IGBidWctZml4ZXNgIHwgY29udGVudCB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJ1Zy1maXhlcykgfCBBbiB1bm9mZmljaWFsIHBhdGNoIHNldCBmb3IgdXBzdHJlYW0gYnVncyB0aGF0IGNvcmUga2VlcHMuIFNlZSBgQlVHX0ZJWEVTLm1kYC4gfAp8IGBsaW5vbGV1bWAgfCB0aWxlcyB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWxpbm9sZXVtKSB8IEFuIGFsdGVybmF0aXZlIHRpbGUgZW5naW5lOiB0aGUgTGlub2xldW0gbG9vc2UtcGFjayBmb3JtYXQgKGluZGl2aWR1YWwgUE5HcyBhZGRyZXNzZWQgYnkgcmVhZGFibGUgdGFyZ2V0IG1hcHMsIHBsdXMgdmFyaWFudCBwb29scykuIEl0IGRvZXMgbm90IHN1cHBseSB0aGUgZ2FtZSdzIGdyYXBoaWNzLiBBbGwgZml2ZSB1cHN0cmVhbSB0aWxlIHNldHMgKE9yaWdpbmFsIC8gQWRhbSBCb2x0IC8gRGF2aWQgR2VydmFpcyAvIE5vbWFkIC8gU2hvY2tib2x0IERhcmsgYW5kIExpZ2h0KSBhcmUgY29yZSBjb250ZW50IChgZ3JhZm1vZGUuY2AgLyBgbGliL3RpbGVzL2xpc3QudHh0YCkgYW5kIGFwcGVhciBpbiB0aGUgR3JhcGhpY3Mgc2NyZWVuIHdpdGggbm8gbW9kIGVuYWJsZWQuIFRoaXMgbW9kIHNoaXBzIGFsbCBzaXggY29udmVydGVkIHRvIGxvb3NlIHBhY2tzLCBzbyB5b3UgY2FuIGNvbXBhcmUgdGhlIHR3byBlbmdpbmVzIG9uIGlkZW50aWNhbCBhcnQuIERlY2xhcmUgYSBwYWNrIHdpdGggYHsgImdyYWZJRCI6ID49MTAwLCAiZW5naW5lIjogImxpbm9sZXVtIiwgIm1lbnVuYW1lIjogIi4uLiIsICJwYXRoIjogIi4uLiIgfWA7IGBlbmdpbmVgIG5hbWVzIHRoZSBmb3JtYXQsIGFuZCB0aGUgbW9kIHRoYXQgc2hpcHMgdGhlIHNpeCBjb252ZXJ0ZWQgcGFja3MgaGFzIHRoZSBzYW1lIGlkLiBTaW5jZSAwLjE1LjAgaXQgYWxzbyBjYXJyaWVzIGEgcnVsZSB0aGUgZ2FtZSB1c2VkIHRvIGhvbGQ6IGNvbnRlbnQgYSBtb2QgYWRkZWQsIHdpdGggbm8gdGlsZSBhbnl3aGVyZSwgaXMgZHJhd24gZnJvbSBpdHMgbmVhcmVzdCByZWxhdGl2ZSB3aXRoIHRoZSBjb2xvdXIgdHVybmVkLCB1bmRlciBpdHMgb3duIHBhY2tzIG9ubHksIHRocm91Z2ggYHJlZ2lzdHJ5OnRpbGVzYC4gU2VlIGBkb2NzL0xJTk9MRVVNLm1kYC4gfAp8IGBib3JnYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJvcmcpIHwgQW4gYXV0b21hdGljIHBsYXllciB0aGF0IGRyaXZlcyB0aGUgZ2FtZSB0aHJvdWdoIHRoZSBzYW1lIHBlcmNlaXZlL2FjdCBBUEkgYW55IHRoaXJkLXBhcnR5IGF1dG9tYXRpb24gd291bGQgdXNlLiBUaGUgd2hvbGUgcG9ydCBsaXZlcyBpbiB0aGF0IHJlcG9zaXRvcnksIHdpdGggaXRzIG93biByZWxlYXNlIHRhZ3MgYW5kIGl0cyBvd24gdGVzdCBzdWl0ZSwgaW5jbHVkaW5nIG9uZSB0aGF0IGRyaXZlcyB0aGUgYnVpbHQgYHBsdWdpbi5qc2AuIEluc3RhbGxpbmcgYW5kIGVuYWJsaW5nIGl0IGRvZXMgbm90IGhhbmQgaXQgeW91ciBjaGFyYWN0ZXI7IGl0cyAiTGV0IHRoZSBCb3JnIHBsYXkiIHRvZ2dsZSBkb2VzLiB8CnwgYGZlYXR1cmUtcmVzdG9yYXRpb25gIHwgY29udGVudCArIHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWZlYXR1cmUtcmVzdG9yYXRpb24pIHwgQW5nYmFuZCBmZWF0dXJlcyB0aGF0IGEgbGF0ZXIgdmVyc2lvbiBkcm9wcGVkLCBicm91Z2h0IGJhY2sgb25lIG5hbWVkIHRvZ2dsZSBhdCBhIHRpbWUsIGV2ZXJ5IHRvZ2dsZSBvZmYgYnkgZGVmYXVsdC4gYFRlbGVwb3J0IE90aGVyYCAoY29udGVudDogYSBgZmllbGRQYXRjaGVzYCBhZGRpdGlvbiB0byB0aGUgUHJpZXN0LCBQYWxhZGluIGFuZCBSYW5nZXIncyBvd24gYm9va3MsIHNpbmNlIHRob3NlIGNsYXNzZXMgbG9zdCB0aGUgc3BlbGwgc29tZXdoZXJlIGJldHdlZW4gYW4gZWFybGllciBBbmdiYW5kIGFuZCA0LjIuNiB3aGlsZSB0aGUgTWFnZSBhbmQgdGhlIFJvZ3VlIGtlcHQgaXQpIGFuZCBzdG9yZSBkaXNjb3VudHMgKHBsdWdpbjogNC4yLjYgZHJvcHBlZCB0aGUgZGlzY291bnQgcm9sbCBlbnRpcmVseSwgc28gdGhpcyByZXN0b3JhdGlvbiBpbnN0YWxscyBhIGByZWdpc3RyeTpzdG9yZWAgZGlzY291bnQtcm9sbCBoYW5kbGVyIGluc3RlYWQgb2YgcGF0Y2hpbmcgZGF0YSB0aGF0IG5vIGxvbmdlciBleGlzdHMpLiB8CnwgYGZvcmdlYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWZvcmdlKSB8IEFuIGluLWdhbWUgd29ya3Nob3AgZm9yIGJ1aWxkaW5nIG90aGVyIG1vZHMgd2l0aG91dCBsZWF2aW5nIHRoZSBnYW1lOiBwaWNrIGFuIGV4aXN0aW5nIHJlY29yZCwgc2VlIGl0cyBuZWlnaGJvdXJzLCBjaGFuZ2Ugd2hhdCB3b3VsZCBoYXZlIHRvIGNoYW5nZSwgYW5kIHBhY2sgdGhlIHJlc3VsdCB1cCB0byB0cnkgaW4tc2Vzc2lvbiwgaW5zdGFsbCwgb3IgaGFuZCBvZmYgYXMgYSBmaWxlLiBJdCBpcyBlYXJseSwgYW5kIHRoZSB3b3Jrc2hvcCdzIG93biBjb250ZW50IGlzIGEgZGVtb25zdHJhdGlvbiBmaXh0dXJlIHVudGlsIHRoZSByZW1haW5pbmcgZW5naW5lIHNlYW1zIGxhbmQuIFNlZSBgZG9jcy9FTkdJTkVfU0VBTVMubWRgIGluIGl0cyBvd24gcmVwb3NpdG9yeS4gfAp8IGB1cHN0cmVhbS1jYXRjaHVwYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLXVwc3RyZWFtLWNhdGNodXApIHwgQ2hhbmdlcyB1cHN0cmVhbSBBbmdiYW5kIGFjY2VwdGVkIGFmdGVyIHRoZSBgNC4yLjZgIHRhZyBjb3JlIGlzIHBpbm5lZCB0bywgY2l0ZWQgYnkgU0hBLCB3aXRoIG9uZSB0b2dnbGUgcGVyIGNsYXNzIG9mIGNoYW5nZSBhbmQgZXZlcnkgb25lIG9mZiBieSBkZWZhdWx0LiBJdHMgZmlyc3Qgc2xpY2UgaXMgdGhlIGZvdXIgcG9zdC00LjIuNiB0aWxlLWFzc2lnbm1lbnQgY29tbWl0cywgYXBwbGllZCB0aHJvdWdoIGByZWdpc3RyeTp0aWxlc2AgcmF0aGVyIHRoYW4gYXMgYSBgcHJlZnNgIHJlc291cmNlLCBiZWNhdXNlIGEgbW9kJ3MgcHJlZiBmaWxlIGlzIHJlcGxheWVkIGludG8gZXZlcnkgdGlsZSBtYXAgYW5kIHRoZSBraW5kIGZvcmJpZHMgYSBzbG90LCBzbyBub3RoaW5nIGNvdWxkIHNjb3BlIGl0IHRvIHRoZSBvbmUgc2hlZXQgdXBzdHJlYW0gd3JvdGUgaXQgZm9yLiBUaGUgYm91bmRhcnkgYWdhaW5zdCBgYnVnLWZpeGVzYCBpcyB3aGV0aGVyIGFuIGFjY2VwdGVkIHVwc3RyZWFtIGNvbW1pdCBleGlzdHMuIFRoaXMgbW9kIGV4cGlyZXM6IGEgcmViYXNlbGluZSBvbnRvIGEgbmV3ZXIgdXBzdHJlYW0gdGFnIG1ha2VzIGV2ZXJ5IHJvdyBpbiBpdCByZWR1bmRhbnQuIFNlZSBgVVBTVFJFQU1fQ0FUQ0hVUF9NT0RfU0NPUEUubWRgLiB8CnwgYGFueWJhbmR1aWAgfCBwbHVnaW4gfCBbb3duIHJlcG9dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1hbnliYW5kdWkpIHwgV3VybGkgTW9ua2hhdmVuJ3MgQW55YmFuZFVJLCByZWJ1aWx0IGZvciBOZW8gQW5nYmFuZDogcGxheSB3aXRoIHRoZSBtb3VzZSAoY2xpY2sgdGhlIG1hcCB0byBtb3ZlIGFuZCBhY3QpLCBrZWVwIHRoZSBjaGFyYWN0ZXIsIHN0YXR1cyBhbmQgbWVzc2FnZXMgaW4gcGFuZWxzLCBhbmQgY29tcGFyZSBnZWFyIGluIGFuIGl0ZW0gd2luZG93IGJlZm9yZSB3ZWFyaW5nIGl0LiBFYWNoIGZlYXR1cmUgaGFzIGl0cyBvd24gc3dpdGNoIGFuZCBzdGFydHMgb2ZmLCBhbmQgbm9uZSBvZiB0aGVtIGNoYW5nZXMgdGhlIGdhbWUncyBydWxlcy4gfApGaXJzdC1wYXJ0eSBtb2RzIHRha2UgdGhlIHNhbWUgcm91dGUgaW50byB0aGUgZ2FtZSBhcyBhbnlvbmUgZWxzZSdzIG1vZC4gQnVuZGxpbmcgdGhlIHByb2plY3QncyBvd24gbW9kcyB3b3VsZCBoYXZlIGhpZGRlbiBldmVyeSBkZWZlY3QgaW4gdGhlIGluc3RhbGwgcGF0aCBiZWhpbmQgbW9kcyB0aGF0IG5ldmVyIHVzZWQgaXQsIGFuZCB0aGUgZG93bmxvYWQgcm91dGUsIHRoZSBmb2xkZXIgY29kZSBsb2FkZXIgYW5kIHRoZSBwbHVnaW4gQUJJIHdvcmsgYmVjYXVzZSBubyBtb2QgaXMgZXhlbXB0IGZyb20gdGhlbS4gVGhlIGVpZ2h0IGZpcnN0LXBhcnR5IG1vZHMgYXJlIGFsc28gdGhlIHJlZmVyZW5jZSBleGFtcGxlcywgc28gcmVhZCB0aGVtIHRvIGxlYXJuIHRoZSBzZWFtcy4KCkVuYWJsZSBvbmUgaW4gdGhlIGluLWFwcCBtb2QgbWFuYWdlciAoZ2FtZSBtZW51IC0+IE1vZHMpLCBvciB3aXRoIGA/bW9kcz1xb2wsYnVnLWZpeGVzLGxpbm9sZXVtYCBmb3IgYSBvbmUtb2ZmLgoKVGhlIG1vZCBpcyB0aGUgdW5pdCB5b3Ugc3dpdGNoLCBhbmQgaXRzIHBhdGNoZXMgY29tZSB3aXRoIGl0LiBXaGlsZSBhIG1vZCBpcyBkaXNhYmxlZCBpdHMgcGF0Y2hlcyBkbyBub3QgZXhpc3Q6IGl0cyBjb2RlIGlzIG5ldmVyIGNhbGxlZCwgbm8gaG9vayBpcyBpbnN0YWxsZWQsIG5vdGhpbmcgYXBwZWFycyBpbiB0aGUgbWVudSwgYW5kIGNvcmUgcnVucyB0aGUgZmFpdGhmdWwgYmFzZSBnYW1lLiBBIG1vZCB0aGF0IGNoYW5nZXMgYmVoYXZpb3VyIGRvZXMgc28gYnkgZGVmYXVsdC1leHBvcnRpbmcgYE1vZEhvb2tzYCBmcm9tIGl0cyBvd24gYHBsdWdpbi50c2A7IGNvcmUgaG9sZHMgb25lIGNvbXBvc2VkIGBNb2RIb29rc2AgYW5kIG5ldmVyIGxlYXJucyB3aGljaCBtb2Qgc3VwcGxpZWQgd2hhdCAoYGRvY3MvbW9kZGluZy9NT0RfU0VBTVMubWRgKS4gRW5hYmxpbmcgdGhlIG1vZCB0dXJucyBpdHMgd2hvbGUgcGF0Y2ggc2V0IG9uIGF0IG9uY2UsIGFuZCBlYWNoIHBhdGNoIGNhbiB0aGVuIGJlIHN3aXRjaGVkIGluZGl2aWR1YWxseSBvbiB0aGF0IG1vZCdzIG93biBzY3JlZW4gKE1vZHMgLT4gdGhlIG1vZCAtPiBGaXhlcyAmIHR3ZWFrcyksIHNvIHlvdSBjYW4gdGFrZSB0aGUgc2V0IG1pbnVzIG9uZS4gVGhhdCBpcyBhbGwgYGRlZmF1bHQ6IHRydWVgIG9uIGEgcnVsZSBtZWFuczogb24gb25jZSBpdHMgb3duIG1vZCBpcyBvbiwgbmV2ZXIgb24gaW4gYSBmcmVzaCBpbnN0YWxsLgoKVGhlIGBkZW1vLSpgIGRpcmVjdG9yaWVzIGFyZSBub3Qgc2hpcHBlZCBtb2RzLiBUaGV5IGFyZSB0aGUgZnJhbWV3b3JrIHByb29mcywgb25lIHBlciBTREsgbG9hZCBwYXRoIChhIGNvbnRlbnQgcGFjayB0aGF0IHBhdGNoZXMgYSBjb3JlIG1vbnN0ZXIsIGEgc2FuZGJveGVkIHdvcmtlciBwbHVnaW4sIGEgdHJ1c3RlZCBpbi1wcm9jZXNzIHBsdWdpbiksIGFuZCB0aGV5IGtlZXAgYWxsIHRocmVlIHBhdGhzIGV4ZXJjaXNlZCBpbiBkZXYgYW5kIGluIHRoZSB0ZXN0IHN1aXRlLiBEaXNjb3ZlcnkgZHJvcHMgdGhlbSBmcm9tIHJlbGVhc2UgYnVpbGRzIChgaXNTaGlwcGVkTW9kYCBpbiBgbW9kLXN0b3JlLnRzYCkuIFNpbmNlIG5vdGhpbmcgZWxzZSBpcyBidW5kbGVkLCBhIHJlbGVhc2UgYnVpbGQncyBkaXNjb3ZlcmVkIG1vZCBzZXQgaXMgZW1wdHkgYW5kIGEgcGxheWVyJ3MgbW9kIG1hbmFnZXIgbGlzdHMgZXhhY3RseSB3aGF0IHRoZXkgaW5zdGFsbGVkLCB3aGljaCBgbW9kLXN0b3JlLnRlc3QudHNgIGFzc2VydHMgKCJhIHJlbGVhc2UgYnVpbGQncyBjb250ZW50IGNhdGFsb2cgaXMgRU1QVFkiKS4KCk9uZSBkZW1vIG1hdHRlcnMgYmV5b25kIGJlaW5nIGFuIGV4YW1wbGUuIGBkZW1vLWhvb2tzYCBpcyB0aGUgb25seSBtb2QgaW4gdGhlIGJ1aWxkIHdpdGggYSBgcGx1Z2luLnRzYCwgc28gaXQga2VlcHMgdGhlIE1vZEhvb2tzIGRpc2NvdmVyeSBwYXRoIGFuZCBpdHMgZ3VhcmRzIGZyb20gZ29pbmcgdmFjdW91cyBub3cgdGhhdCB0aGUgcmVhbCBtb2RzIGhhdmUgbGVmdCwgc2luY2UgYSBnbG9iIHRoYXQgbWF0Y2hlcyBub3RoaW5nIHdvdWxkIHBhc3MgZXZlcnkgYXNzZXJ0aW9uIGFib3V0IHdoYXQgaXQgbWF0Y2hlZC4KIyMgUGFjayBhbmF0b215CgpBIHBhY2sgaXMgYSBkaXJlY3RvcnkgKG9yIGFyY2hpdmUpIHdpdGggYSBtYW5pZmVzdCBhbmQgY29udGVudCBmaWxlczoKCmBgYApteS1mcm9zdC1wYWNrLwogIG1hbmlmZXN0Lmpzb24gICAgICA8LSB0aGUgbWFuaWZlc3Q7IHRoZSBmaWxlIHRoYXQgbWFrZXMgdGhpcyBhIG1vZAogIG1vbnN0ZXIuanNvbiAgICAgICA8LSBjb250cmlidXRpb25zIHRvIHRoZSAibW9uc3RlciIgcmVjb3JkIGZpbGUKICBvYmplY3QuanNvbiAgICAgICAgPC0gY29udHJpYnV0aW9ucyB0byB0aGUgIm9iamVjdCIgcmVjb3JkIGZpbGUKICAuLi4KYGBgCgojIyMgVGhlIG1hbmlmZXN0IChgbWFuaWZlc3QuanNvbmApCgpgYGBqc29uCnsKICAiZm9ybWF0IjogIm5lby1hbmdiYW5kL21vZC9tYW5pZmVzdCIsCiAgInNjaGVtYVZlcnNpb24iOiAyLAogICJkYXRhIjogewogICAgImlkIjogImZyb3N0IiwKICAgICJuYW1lIjogIlRoZSBGcm9zdCBEZXB0aHMiLAogICAgInZlcnNpb24iOiAiMS4yLjAiLAogICAgImFwaSI6ICIqIiwKICAgICJydW50aW1lIjogImRhdGEiLAogICAgImRlcGVuZGVuY2llcyI6IHsKICAgICAgInJlcXVpcmVkIjogeyAiY29yZSI6IHsgInJhbmdlIjogIioiIH0gfQogICAgfSwKICAgICJhdXRob3IiOiAiWW91IiwKICAgICJsaWNlbnNlIjogIkNDLUJZLTQuMCIKICB9Cn0KYGBgCgotIGBpZGA6IGxvd2VyY2FzZSBrZWJhYi1jYXNlLCB1bmlxdWUgYW1vbmcgbG9hZGVkIHBhY2tzLiBJdCBiZWNvbWVzIHlvdXIgbmFtZXNwYWNlOiBhIG1vbnN0ZXIgeW91IGFkZCBuYW1lZCAiRnJvc3QgV3lybSIgaXMgYGZyb3N0OmZyb3N0LXd5cm1gIGV2ZXJ5d2hlcmUgLSBpbiBvdGhlciBwYWNrcywgaW4gdGlsZS1wYWNrIHRhcmdldHMsIGluIHNhdmVmaWxlcy4KLSBgYXBpYDogdGhlIG1vZCBBUEkgdmVyc2lvbnMgeW91ciBtb2Qgd29ya3Mgd2l0aCwgYXMgYSBzZW12ZXIgcmFuZ2UuIEEgbW9kIHdpdGggbm8gY29kZSBjYW4gc2F5IGAiKiJgLiBBIHBsdWdpbiB3cml0dGVuIGZvciB0aGUgaW4tcHJvY2VzcyBBUEkgMSBzYXlzIGAiPj0xLjAuMCA8Mi4wLjAiYCwgYW5kIGEgbW9kIHdyaXR0ZW4gZm9yIEFQSSAyLCBpbiBwcm9jZXNzIG9yIGluIGEgV29ya2VyLCBzYXlzIGAiPj0yLjAuMCA8My4wLjAiYC4gQSBtb2QgdGhhdCBydW5zIGNvZGUgaXMgbm90IGxvYWRlZCB3aGVuIGl0cyByYW5nZSBhZG1pdHMgbm8gQVBJIHRoaXMgYnVpbGQgcnVucyBpbiBpdHMgcnVudGltZSwgYW5kIHRoZSBNb2RzIHNjcmVlbiBzYXlzIHdoaWNoIHJhbmdlIGFuZCBydW50aW1lIGl0IGFza2VkIGZvci4KLSBgcnVudGltZWA6IGhvdyB5b3VyIG1vZCBydW5zLiBgZGF0YWAgcnVucyBubyBjb2RlLCBgaW4tcHJvY2Vzc2AgbG9hZHMgYHBsdWdpbi5qc2AgaW50byB0aGUgZ2FtZSdzIHBhZ2UsIGFuZCBgd29ya2VyYCBzdGFydHMgdGhlIG1vZHVsZSBuYW1lZCBpbiBgZW50cnlgIGluIGEgV29ya2VyIG9mIGl0cyBvd24uIFRoZSBydW50aW1lIGhhcyB0byBtYXRjaCB0aGUgZm9sZGVyOiBhIGBkYXRhYCBtb2QgdGhhdCBzaGlwcyBhIGAuanNgIG9yIGAubWpzYCBmaWxlIGlzIHJlZnVzZWQsIGFuZCBzbyBpcyBhIGNvZGUgbW9kIHdob3NlIGVudHJ5IGZpbGUgaXMgbWlzc2luZy4KLSBgZW50cnlgOiB0aGUgbW9kdWxlIGEgYHdvcmtlcmAgbW9kIHN0YXJ0cywgYXMgYSBwYXRoIGluc2lkZSB0aGUgbW9kIGZvbGRlciAobm8gbGVhZGluZyBgL2AsIG5vIGAuLmAsIG5vIGJhY2tzbGFzaCkuIEFuIGBpbi1wcm9jZXNzYCBtb2QgYWx3YXlzIHN0YXJ0cyBgcGx1Z2luLmpzYCwgc28gaXQgY2FuIGxlYXZlIHRoaXMgb3V0LCBhbmQgYW55IG90aGVyIHZhbHVlIGlzIHJlZnVzZWQuCi0gYHNoYXBlYCBhbmQgYGZhY2V0c2A6IG9wdGlvbmFsLiBXaXRob3V0IHRoZW0gYSBtb2Qgd2l0aCBubyBjb2RlIGlzIGBjb250ZW50YCBhbmQgYSBjb2RlIG1vZCBpcyBgcGx1Z2luYC4gQSBtb2Qgd2l0aCBib3RoIHJlY29yZHMgYW5kIGNvZGUgc2F5cyBgInNoYXBlIjogImNvbnRlbnQiLCAiZmFjZXRzIjogWyJjb250ZW50IiwgInBsdWdpbiJdYC4gQSBjb2RlIHJ1bnRpbWUgYWx3YXlzIGhhcyB0aGUgYHBsdWdpbmAgZmFjZXQsIGFuZCBhIGBkYXRhYCBtb2QgY2Fubm90IGhhdmUgaXQuCi0gYGRlcGVuZGVuY2llc2A6IHRocmVlIGxpc3RzLCBlYWNoIGtleWVkIGJ5IG1vZCBpZC4gTW9kcyB1bmRlciBgcmVxdWlyZWRgIGxvYWQgYmVmb3JlIHlvdXJzLCBhbmQgYSBtaXNzaW5nIG9uZSBzdG9wcyB0aGUgbG9hZC4gTW9kcyB1bmRlciBgb3B0aW9uYWxgIGxvYWQgZmlyc3Qgd2hlbiB0aGV5IGFyZSBpbnN0YWxsZWQsIGFuZCBub3RoaW5nIGlzIHdyb25nIHdoZW4gdGhleSBhcmUgbm90LiBBbiBpbnN0YWxsZWQgZGVwZW5kZW5jeSBpbiBlaXRoZXIgbGlzdCBtdXN0IGhhdmUgYSB2ZXJzaW9uIGluc2lkZSBpdHMgYHJhbmdlYC4gTGlzdGluZyBhIG1vZCBpbiBlaXRoZXIgbGlzdCBpcyBhbHNvIGEgcGVybWlzc2lvbjogeW91IG1heSBwYXRjaCwgcmVwbGFjZSBvciByZW1vdmUgb25seSB5b3VyIG93biByZWNvcmRzIGFuZCB0aG9zZSBvZiBtb2RzIHlvdSBsaXN0IHRoZXJlLiBNb2RzIHVuZGVyIGBjb25mbGljdHNgIGdldCBhIHdhcm5pbmcgb24gdGhlIE1vZHMgc2NyZWVuIHRoYXQgZ2l2ZXMgeW91ciByZWFzb24sIGFuZCB0aGUgcGxheWVyIGNhbiBzdGlsbCB0dXJuIGJvdGggb24uIEVhY2ggZW50cnkgaGFzIGEgYHJhbmdlYCAobmVlZGVkIGZvciBgcmVxdWlyZWRgIGFuZCBgb3B0aW9uYWxgOyBhIGNvbmZsaWN0IHdpdGhvdXQgb25lIGNvdmVycyBldmVyeSB2ZXJzaW9uKSBhbmQgYSBgYmVjYXVzZWAsIHdoaWNoIGEgY29uZmxpY3QgbXVzdCBoYXZlLiBBIG1vZCBpZCBnb2VzIGluIG9uZSBsaXN0IG9ubHksIGFuZCBhIG1vZCBjYW5ub3QgbGlzdCBpdHNlbGYuCi0gYGVuZ2luZWA6IG9wdGlvbmFsLiBgeyAicmFuZ2UiOiAiPj0xLjIxLjEiLCAiYmVjYXVzZSI6ICIuLi4iIH1gIGxpbWl0cyB0aGUgZ2FtZSB2ZXJzaW9ucyB5b3VyIG1vZCBsb2FkcyBvbiwgYW5kIGl0IG5lZWRzIGEgcmVhc29uLiBVc2UgaXQgb25seSBmb3IgYSBrbm93biBlbmdpbmUgYnVnIG9yIGEgY29udGVudCBmb3JtYXQgeW91ciBtb2QgcmVsaWVzIG9uLgotIGBjYXBhYmlsaXRpZXNgOiB3aGF0IHlvdXIgY29kZSBhc2tzIHRoZSBwbGF5ZXIgdG8gYWxsb3c7IHNlZSBbQ2FwYWJpbGl0aWVzXShQTFVHSU5TLm1kI2NhcGFiaWxpdGllcykuCi0gYHRleHRgOiB5b3VyIG1vZCdzIGRlZmF1bHQgbG9jYWxlIGFuZCB0aGUgZmlsZSBob2xkaW5nIGVhY2ggbG9jYWxlJ3Mgc3RyaW5ncywgc3VjaCBhcyBgeyAiZGVmYXVsdCI6ICJlbiIsICJsb2NhbGVzIjogeyAiZW4iOiAidGV4dC9lbi5qc29uIiB9IH1gLiBUaGUgbWFuaWZlc3QgY2hlY2tzIHRoZSBsb2NhbGUgdGFncyBhbmQgcGF0aHMsIGJ1dCB0aGUgZ2FtZSBkb2VzIG5vdCByZWFkIHRoZXNlIGZpbGVzIHlldC4KLSBgbGlzdGluZ2A6IGB0YWdzYCAoa2ViYWItY2FzZSB3b3JkcyksIGBzY3JlZW5zaG90c2AgYW5kIGBjaGFuZ2Vsb2dgLCBhcyBwYXRocyBpbnNpZGUgdGhlIG1vZCBmb2xkZXIuIFRoZSBpbi1nYW1lIG1vZCBicm93c2VyIHNob3dzIHRoZSBzY3JlZW5zaG90czsgbm90aGluZyBpbiB0aGUgZ2FtZSByZWFkcyBgdGFnc2Agb3IgYGNoYW5nZWxvZ2AgeWV0LgotIGBidWRnZXRgOiBgeyAibXNQZXJUdXJuIjogNTAgfWAsIHRoZSB0aW1lIHlvdXIgbW9kIGFza3MgdG8gc3BlbmQgb24gZWFjaCBnYW1lIHR1cm4uIFRoZSBtYW5pZmVzdCBhY2NlcHRzIGEgdmFsdWUgYWJvdmUgMCBhbmQgYXQgbW9zdCA1MDAuIFRoZSBnYW1lIGRvZXMgbm90IHJlYWQgdGhpcyBmaWVsZCB5ZXQsIHNvIGV2ZXJ5IG1vZCBnZXRzIHRoZSBkZWZhdWx0IG9mIDUwIG1zIGEgdHVybi4gQSB0dXJuIG92ZXIgYnVkZ2V0IGlzIGxvZ2dlZCBhcyBhIHdhcm5pbmcuIEdvaW5nIG92ZXIgNTAwIG1zIGlzIHdvcnNlOiB0aGUgZmlyc3QgdGltZSBpbiAyMDAgdHVybnMgaXMgbG9nZ2VkLCBhbmQgZWFjaCB0aW1lIGFmdGVyIHRoYXQgY291bnRzIGFzIGEgZmF1bHQgYWdhaW5zdCB0aGUgbW9kLgotIGBwdWJsaWNGbGFnc2A6IG9wdGlvbmFsIG5hbWVzIGZyb20gdGhpcyBtYW5pZmVzdCdzIGBydWxlc2Agb3IgYHNlY3Rpb25zYC4gVGhlIGhvc3QgaW5jbHVkZXMgb25seSB0aGVzZSBjdXJyZW50IGJvb2xlYW4gZmxhZ3MgaW4gYGN0eC5tb2RzKClgIGZvciBvdGhlciBwbHVnaW5zLiBNaXNzaW5nIGFuZCByZXBlYXRlZCBuYW1lcyBhcmUgcmVmdXNlZDsgb3RoZXIgc2V0dGluZ3Mgc3RheSBwcml2YXRlLgotIExvYWQgb3JkZXIgaXMgcmVzb2x2ZWQgZGV0ZXJtaW5pc3RpY2FsbHk6IGRlcGVuZGVuY2llcyBhbmQgYGxvYWRBZnRlcmAvYGxvYWRCZWZvcmVgIGhpbnRzIGZpcnN0LCB0aGVuIHRoZSBvcmRlciBvZiB0aGUgcGxheWVyJ3MgbW9kIGxpc3QuIFRoZSBzYW1lIHBhY2sgc2V0IGluIHRoZSBzYW1lIG9yZGVyIGNvbXBvc2VzIGlkZW50aWNhbGx5IG9uIGV2ZXJ5IG1hY2hpbmUuIEN5Y2xlcyBhbmQgbWlzc2luZyByZXF1aXJlZCBkZXBlbmRlbmNpZXMgZmFpbCBsb3VkbHkgYXQgbG9hZC4KCkV2ZXJ5IG90aGVyIGZpZWxkLCBzdWNoIGFzIGBydWxlc2AsIGBzZXR0aW5nc2AsIGBzZWN0aW9uc2AsIGBjb21wYXRgLCBgZmllbGRzYCwgYHJlc291cmNlc2AsIGB0aWxlUGFja3NgIGFuZCBgcGF5bG9hZGAsIGtlZXBzIHRoZSBuYW1lIGFuZCBtZWFuaW5nIGl0IGhhZCBiZWZvcmUgc2NoZW1hIDIuIEEgZmllbGQgdGhlIHNjaGVtYSBkb2VzIG5vdCBrbm93IGlzIHJlZnVzZWQsIHNvIHRoZSBzY2hlbWEgMSBuYW1lcyBgbW9kQXBpYCwgYHdvcmtlckVudHJ5YCBhbmQgYG9wdGlvbmFsRGVwZW5kZW5jaWVzYCBjYW5ub3QgYXBwZWFyIGluIGEgc2NoZW1hIDIgbWFuaWZlc3QuIEEgYHNjaGVtYVZlcnNpb25gIGFib3ZlIDIgaXMgcmVmdXNlZCB0b28uCgojIyMjIE1hbmlmZXN0cyB3cml0dGVuIGJlZm9yZSBzY2hlbWEgMgoKQSBgbWFuaWZlc3QuanNvbmAgd2l0aCBubyBgZm9ybWF0YCwgb3Igd2l0aCBgInNjaGVtYVZlcnNpb24iOiAxYCwgc3RpbGwgbG9hZHMsIGFuZCB0aGUgZ2FtZSByZWFkcyBpdCB0aGUgd2F5IGl0IGFsd2F5cyBoYXMuIGBtb2RBcGk6IDFgIGNvdW50cyBhcyBgInJ1bnRpbWUiOiAiaW4tcHJvY2VzcyJgIHdpdGggYCJhcGkiOiAiPj0xLjAuMCA8Mi4wLjAiYC4gYG1vZEFwaTogMmAgd2l0aCBgInJ1bnRpbWUiOiAid29ya2VyImAgY291bnRzIGFzIGAicnVudGltZSI6ICJ3b3JrZXIiYCB3aXRoIHRoZSBXb3JrZXIgcHJldmlldyBBUEksIGAiYXBpIjogIjIuMC4wLXdvcmtlciJgLCBhbmQgaXRzIGB3b3JrZXJFbnRyeWAgYXMgYGVudHJ5YC4gVGhlIHByZXZpZXcgQVBJIGlzIHJldGlyZWQsIHNvIHRoZSBtYW5pZmVzdCBvZiBzdWNoIGEgbW9kIHN0aWxsIHJlYWRzIGJ1dCBpdHMgY29kZSBkb2VzIG5vdCBydW47IHJlYnVpbGQgaXQgYXMgYW4gQVBJIDIgV29ya2VyIG1vZCAoW0FQSTIubWRdKEFQSTIubWQpKS4gQSBtb2Qgd2l0aCBubyBjb2RlIGNvdW50cyBhcyBgInJ1bnRpbWUiOiAiZGF0YSJgIHdpdGggYCJhcGkiOiAiKiJgLiBObyBvdGhlciBgbW9kQXBpYCB2YWx1ZSBoYXMgYSBzY2hlbWEgMiBtZWFuaW5nLCBhbmQgdGhlIGludGVnZXIgaXMgbmV2ZXIgcmVhZCBhcyBhIHJhbmdlLgoKVG8gbW92ZSBhIG1hbmlmZXN0IHRvIHNjaGVtYSAyLCBydW4gaXQgdGhyb3VnaCB0aGUgU0RLJ3MgYGNvbnZlcnRNYW5pZmVzdFYxYC4gYGRlcGVuZGVuY2llc2AgYW5kIGBvcHRpb25hbERlcGVuZGVuY2llc2AgYmVjb21lIGBkZXBlbmRlbmNpZXMucmVxdWlyZWRgIGFuZCBgZGVwZW5kZW5jaWVzLm9wdGlvbmFsYC4gQSBgY29uZmxpY3RzYCBjbGFpbSBhYm91dCBhIHdob2xlIG1vZCBtb3ZlcyB0byBgZGVwZW5kZW5jaWVzLmNvbmZsaWN0c2Agd2hlbiBpdCBpcyB0aGUgb25seSBzdWNoIGNsYWltIGFib3V0IHRoYXQgbW9kIGFuZCB0aGUgbW9kIGlzIG5vdCBhbHNvIGEgZGVwZW5kZW5jeTsgZXZlcnkgb3RoZXIgY2xhaW0gc3RheXMgaW4gYGNvbXBhdGAuIGBjaGFuZ2Vsb2dgIGFuZCBgc2NyZWVuc2hvdHNgIG1vdmUgaW50byBgbGlzdGluZ2AsIGFuZCBgZW5naW5lYCBnZXRzIGEgcGxhY2Vob2xkZXIgcmVhc29uIHRoYXQgeW91IHNob3VsZCByZXBsYWNlIHdpdGggdGhlIHJlYWwgb25lLiBUaGUgY29udmVydGVyIHJlZnVzZXMgYSBgbW9kQXBpYCBpdCBoYXMgbm8gbWFwcGluZyBmb3IsIGFuZCBhIG1vZCB0aGF0IHNoaXBzIGNvZGUgd2l0aCBubyBgbW9kQXBpYCBhdCBhbGwuIGBtb2RQcm9qZWN0KC4uLikuZW1pdCgpYCB3cml0ZXMgc2NoZW1hIDIgb25seSwgdGhyb3VnaCBgbWFuaWZlc3RUb1YyYC4KCiMjIyBSZWNvcmQgY29tcG9zaXRpb24KCkVhY2ggY29udGVudCBmaWxlIG1heSBhZGQsIHBhdGNoLCByZXBsYWNlLCBhbmQgcmVtb3ZlIHJlY29yZHM6CgpgYGBqc29uCnsKICAicmVjb3JkcyI6IFsKICAgIHsgIm5hbWUiOiAiRnJvc3QgV3lybSIsICJocCI6IDQwMCwgImZsYWdzIjogWyJDT0xEIiwgIkRSQUdPTiJdIH0KICBdLAogICJwYXRjaGVzIjogewogICAgImNvcmU6a29ib2xkIjogeyAiaHAiOiAxMiwgImRlc2MiOiAiQSB0b3VnaGVyIGxpdHRsZSBrb2JvbGQuIiB9CiAgfSwKICAicmVwbGFjZXMiOiB7CiAgICAiY29yZTpncmlwLWZhcm1lci1tYWdnb3Qtcy1kb2ciOiB7ICJuYW1lIjogIkdyaXAiLCAiaHAiOiA1MCB9CiAgfSwKICAicmVtb3ZlcyI6IFsiY29yZTpmYW5nLWZhcm1lci1tYWdnb3Qtcy1kb2ciXQp9CmBgYAoKLSBgcmVjb3Jkc2AgYWRkcyBuZXcgZW50cmllczsgeW91ciBwYWNrIG93bnMgdGhlbS4KLSBgcGF0Y2hlc2AgZGVlcC1tZXJnZXMgb250byBhbiBleGlzdGluZyByZWNvcmQ6IG9iamVjdHMgbWVyZ2Uga2V5IGJ5CiAga2V5LCBhcnJheXMgYW5kIHNjYWxhcnMgYXJlIHJlcGxhY2VkIHdob2xlLCBhbmQgYW4gZXhwbGljaXQgYG51bGxgCiAgZGVsZXRlcyBhIGtleS4KLSBgcmVwbGFjZXNgIHN3YXBzIHRoZSByZWNvcmQgYm9keSB3aG9sZXNhbGUgKHRoZSByZWYgYW5kIG93bmVyIHN0YXkpLgotIGByZW1vdmVzYCBkZWxldGVzIHRoZSByZWNvcmQgZnJvbSB0aGUgY29tcG9zZWQgZ2FtZSwgdW5sZXNzIHRoYXQgd291bGQKICBsZWF2ZSB0aGUgZ2FtZSBicm9rZW4uIEEgcmVtb3ZhbCBpcyByZWZ1c2VkLCBhbmQgdGhlIHJlY29yZCBzdGF5cywgd2hlbgogIGFub3RoZXIgcmVjb3JkIHN0aWxsIG5hbWVzIGl0IChhIG1vbnN0ZXIgd2hvc2UgYGJhc2VgIGl0IGlzLCBhbiBlc2NvcnQKICBpbiBhIG1vbnN0ZXIncyBgZnJpZW5kc2AsIGEgaGlzdG9yeSBwaHJhc2Ugd2hvc2UgYG5leHRgIGNoYXJ0IGl0IGlzIHRoZQogIGxhc3QgcGhyYXNlIG9mKSwgb3Igd2hlbiBpdCBpcyB0aGUgcm9sbC0xMDAgcGhyYXNlIG9mIGEgaGlzdG9yeSBjaGFydC4KICBSZW1vdmUgdGhlIHJlY29yZCB0b2dldGhlciB3aXRoIGV2ZXJ5dGhpbmcgdGhhdCBuYW1lcyBpdCBhbmQgdGhlCiAgcmVtb3ZhbCBnb2VzIHRocm91Z2guCi0gYGZpZWxkUGF0Y2hlc2AgYXBwbGllcyB0eXBlZCBvcHMgdG8gZG90LXBhdGhzIChgc2V0YCwgYG1lcmdlYCwKICBgYWRkRmxhZ2AsIGByZW1vdmVGbGFnYCwgYGFkZGAsIGBtdWxgLCBgYXBwZW5kYCwgYHJlbW92ZVZhbHVlYCkgLSBzZWUKICBgcGFja2FnZXMvbW9kLXNkay9zcmMvcGF0Y2gudHNgLiBgYXBwZW5kYCBhZGRzIGVudHJpZXMgdG8gYSBsaXN0CiAgd2l0aG91dCByZXN0YXRpbmcgaXQsIHdoaWNoIGlzIGhvdyBhIG1vZCBwdXRzIGFuIGl0ZW0gaW4gYSBzaG9wJ3MKICBzdG9jazsgYHJlbW92ZVZhbHVlYCB0YWtlcyBhbiBlbnRyeSBvdXQgYWdhaW4uCi0gTW9kaWZ5aW5nIGEgcmVjb3JkIHlvdSBkbyBub3Qgb3duIHJlcXVpcmVzIGRlY2xhcmluZyBpdHMgb3duZXIgaW4KICBgZGVwZW5kZW5jaWVzYC4gV2l0aG91dCBpdCwgdGhhdCBwYXRjaCwgcmVwbGFjZW1lbnQgb3IgcmVtb3ZhbCBpcwogIHJlZnVzZWQuCi0gQSByZWZ1c2VkIG9wIGlzIHJlcG9ydGVkIG9uIHRoZSBtb2QncyByb3cgaW4gdGhlIE1vZHMgc2NyZWVuLCBhbmQgdGhlCiAgcmVzdCBvZiB0aGUgbW9kIHN0aWxsIGxvYWRzLgoKIyMjIyBXaGF0IGEgcmVmIGxvb2tzIGxpa2Ugd2hlbiBjb3JlIHNoaXBzIHRoZSBuYW1lIHR3aWNlCgpBIHJlZiBpcyBgPHBhY2s+OjxzbHVnIG9mIHRoZSByZWNvcmQncyBpZGVudGl0eT5gLiBGb3IgbW9zdCBmaWxlcyB0aGF0CmlkZW50aXR5IGlzIHRoZSByZWNvcmQncyBgbmFtZWAsIHNvIGBjb3JlOmtvYm9sZGAgaXMgYSBtb25zdGVyIGFuZApgbXlwYWNrOmZyb3N0LXd5cm1gIGlzIHlvdXJzLiBUd28gY2FzZXMgbmVlZCBtb3JlOgoKLSAqKkZpbGVzIGtleWVkIGJ5IHNvbWV0aGluZyBvdGhlciB0aGFuIGBuYW1lYC4qKiBgc3RvcmVgIGlzIGtleWVkIGJ5IGl0cwogIGBTVE9SRV8qYCBjb2RlLCBgYnJhbmRgIGFuZCBgc2xheWAgYnkgYGNvZGVgLCBgb2JqZWN0X2Jhc2VgIGJ5IHR2YWwsCiAgYGNvbnN0YW50c2AgYnkgdGhlIGZpbGUgaXRzZWxmIChgY29yZTpjb25zdGFudHNgLCB3aGljaCBpcyB3aGF0IGEKICBgZmllbGRQYXRjaGAgYWdhaW5zdCBhIGdhbWUgY29uc3RhbnQgdGFyZ2V0cykuIFRoZSBmdWxsIHRhYmxlIGlzCiAgYHBhY2thZ2VzL21vZC1zZGsvc3JjL3JlY29yZC1rZXkudHNgOyB0aGUgbG9hZGVyIG5hbWVzIHRoZSBpZGVudGl0eSBpbgogIGV2ZXJ5IGVycm9yIGl0IHJlcG9ydHMsIHNvIHlvdSByYXJlbHkgaGF2ZSB0byBsb29rIGl0IHVwLgotICoqTmFtZXMgY29yZSBnZW51aW5lbHkgcmVwZWF0cy4qKiBgZWdvX2l0ZW1gIHNoaXBzICJvZiBBY2lkIiBtb3JlIHRoYW4KICBvbmNlIC0gb25lIGZvciBtZWxlZSB3ZWFwb25zLCBvbmUgZm9yIGFtbXVuaXRpb24gLSBzbyBgY29yZTpvZi1hY2lkYAogIG5hbWVzIG5laXRoZXIuIEFkZCBhIGAjYCBhbmQgdGhlIGl0ZW0gdHlwZXMgaXQgYXBwbGllcyB0bzoKICBgY29yZTpvZi1hY2lkI3Nob3QtYXJyb3ctYm9sdGAuIFdyaXRlIHRoZSBwbGFpbiByZWYgYW5kIHRoZSBsb2FkZXIKICByZWZ1c2VzIGl0ICphbmQgbGlzdHMgdGhlIG9uZXMgdGhhdCB3b3JrKiwgc28gdGhlIGVycm9yIHRlbGxzIHlvdSB3aGF0CiAgdG8gdHlwZS4KClRoZSBgKmAgYW5kIGArYCBpbiBhbiBBbmdiYW5kIG5hbWUgYXJlIHBhcnQgb2YgaXQ6IGAqSGVhbGluZypgIGlzCmBjb3JlOnBvdGlvbi0tc3Rhci1oZWFsaW5nLXN0YXJgLCBkaXN0aW5jdCBmcm9tIGBIZWFsaW5nYC4KCiMjIyMgQWRkaW5nIHlvdXIgb3duIGZpZWxkcyB0byBhIGNvcmUgcmVjb3JkCgpBIHBhdGNoIGlzIG5vdCBsaW1pdGVkIHRvIHRoZSBmaWVsZHMgY29yZSBkZWZpbmVzLiBZb3UgY2FuIGludHJvZHVjZSB5b3VyIG93biAtCmRlY2xhcmUgdGhlbSBpbiB5b3VyIG1hbmlmZXN0LCBhbmQgd3JpdGUgdGhlbSBuYW1lc3BhY2VkIHdpdGggeW91ciBtb2QgaWQuCgpgYGBqc29uCiJmaWVsZHMiOiBbCiAgeyAibmFtZSI6ICJibGVlZCIsICJmaWxlcyI6IFsib2JqZWN0IiwgImVnb19pdGVtIl0sICJ0eXBlIjogIm9iamVjdCIsCiAgICAibGFiZWwiOiAiQmxlZWQiIH0KXQpgYGAKCmBgYGpzb24KewogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpzd29yZC0tZGFnZ2VyIjogWwogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJhdHRhY2suaGQiLCAidmFsdWUiOiAiMWQ1IiB9LAogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJnb3JlOmJsZWVkIiwKICAgICAgICAidmFsdWUiOiB7ICJkaWNlIjogIjFkMyIsICJ0dXJucyI6IDUgfSB9CiAgICBdCiAgfQp9CmBgYAoKVGhlIGZpcnN0IG9wIGNoYW5nZXMgYSBmaWVsZCBjb3JlIG93bnMsIHNvIHRoZSBkYWdnZXIgbm93IHJvbGxzIDFkNS4gVGhlIHNlY29uZCBhZGRzIGEgZmllbGQgY29yZSBkb2VzIG5vdCBoYXZlLCBhbmQgYSBwbHVnaW4gcmVhZHMgaXQgYmFjayBhcyBga2luZC5leHRbImdvcmU6YmxlZWQiXWAuCgoqKldoeSBuYW1lc3BhY2VkLioqIFdpdGhvdXQgYSBuYW1lc3BhY2UsIHdoaWNoZXZlciBtb2Qgc2hpcHBlZCBmaXJzdCB3b3VsZCB0YWtlIGBibGVlZGAsIGFuZCBldmVyeSBsYXRlciBtb2Qgd291bGQgZWl0aGVyIGNvbGxpZGUgd2l0aCBpdCBvciB3b3JrIGFyb3VuZCBpdC4gUXVhbGlmeWluZyB0aGUgbmFtZSB3aXRoIHlvdXIgbW9kIGlkIG1ha2VzIHRoZSBjb2xsaXNpb24gaW1wb3NzaWJsZSBhbmQgbWFrZXMgZGVsaWJlcmF0ZSBpbnRlcm9wIHBvc3NpYmxlOiB3cml0aW5nIGBnb3JlOmJsZWVkYCBmcm9tIGEgZGlmZmVyZW50IG1vZCBpcyBjbGVhcmx5IGFuIGF0dGVtcHQgdG8gZXh0ZW5kICpnb3JlJ3MqIGZpZWxkLiBUaGUgdm9jYWJ1bGFyeSByZWdpc3RyeSBhbHJlYWR5IHVzZXMgdGhlIHNhbWUgcnVsZSBmb3IgdGVybXMgKGBnb3JlOmx1Y2tgKS4KCioqV3JpdGluZyBhbm90aGVyIG1vZCdzIGZpZWxkLioqIFRvIHdyaXRlIGBnb3JlOmJsZWVkYCBmcm9tIGEgbW9kIG90aGVyIHRoYW4gYGdvcmVgLCBkZWNsYXJlIGBnb3JlYCBpbiBgZGVwZW5kZW5jaWVzYCBvciBgb3B0aW9uYWxEZXBlbmRlbmNpZXNgLiBPdGhlcndpc2UgdGhlIHdyaXRlIGlzIHJlZnVzZWQsIHRoZSBmaWVsZCBpcyByb2xsZWQgYmFjaywgYW5kIHRoZSBmYXVsdCBuYW1lcyB5b3VyIG1vZC4gTGF0ZXIgZWRpdHMgdG8gdGhhdCBmaWVsZCBtYWRlIGZyb20gdGhlIHJlZnVzZWQgdmFsdWUgYXJlIHJvbGxlZCBiYWNrIHRvby4KCioqV2h5IGRlY2xhcmVkLioqIEEgbmFtZXNwYWNlZCBrZXkgdGhhdCBubyBsb2FkZWQgbW9kIGRlY2xhcmVzIGlzIHN0cmlwcGVkIGF0IGNvbXBvc2l0aW9uIGFuZCByZXBvcnRlZCBieSBuYW1lLCBhbmQgc28gaXMgb25lIHdyaXR0ZW4gb250byBhIGZpbGUgdGhlIGRlY2xhcmF0aW9uIGRvZXMgbm90IGxpc3QsIG9yIG9uZSB3aG9zZSBzaGFwZSBkb2VzIG5vdCBtYXRjaCBpdHMgYHR5cGVgLiBUaGUgZGVjbGFyYXRpb24gY29zdHMgb25lIG1hbmlmZXN0IGxpbmUgYW5kIGdldHMgeW91IHRoYXQgZXJyb3IgbWVzc2FnZS4gV2l0aG91dCBpdCwgYSB0eXBvIGxvb2tzIGV4YWN0bHkgbGlrZSBhIGRlbGliZXJhdGUgbmV3IGZpZWxkLCBzbyB5b3Ugd291bGQgc2VlIHlvdXIgZGF0YSBhcnJpdmUgYW5kIGNvbmNsdWRlIHRoZSBwYXRjaCB3b3JrZWQuCgpBbiAqdW5xdWFsaWZpZWQqIGtleSBjb3JlIGRvZXMgbm90IGtub3cgaXMgbm90IHRyZWF0ZWQgYXMgYSBmaWVsZCBhdCBhbGwgKGBhdGFja2AgaXMgYSBtaXNzcGVsbGluZyBvZiBgYXR0YWNrYCwgbm90IGEgbmV3IGF0dHJpYnV0ZSksIGFuZCB0aGUgZ2FtZSByZXBvcnRzIGl0IHdpdGggY29yZSdzIG5lYXJlc3QgcmVhbCBmaWVsZCBuYW1lZC4KCkEgZHJvcHBlZCBmaWVsZCBjb3N0cyBvbmx5IHRoYXQgZmllbGQ6IGV2ZXJ5dGhpbmcgZWxzZSB0aGUgcGF0Y2ggZGlkIHN0aWxsIGFwcGxpZXMuCgpgZXh0YCBpcyBhYnNlbnQgZW50aXJlbHkgb24gYW4gdW5tb2RkZWQgcmVjb3JkLCBzbyBpZiBpdCBpcyBwcmVzZW50LCBhIG1vZCBwdXQgc29tZXRoaW5nIHRoZXJlLiBJdCBob2xkcyBvbmx5IG1vZCBrZXlzLiBDb3JlJ3Mgb3duIGZpZWxkcyBhcmUgbmV2ZXIgY29waWVkIGludG8gaXQsIGJlY2F1c2UgYSBtb2QgcmVhZGluZyBhIHByZS1iaW5kIGNvcHkgb2YgYSBmaWVsZCBpdCBkaWQgbm90IGFkZCB3b3VsZCBiZSByZWFkaW5nIGEgdmFsdWUgdGhhdCBjYW4gZGlzYWdyZWUgd2l0aCB0aGUgYm91bmQgb25lIGZvcmV2ZXIgd2l0aG91dCBlaXRoZXIgYmVpbmcgd3JvbmcuIEl0IGlzIGZyb3plbiwgc28gb25lIG1vZCBjYW5ub3QgcmV3cml0ZSB3aGF0IGFub3RoZXIgcmVhZHMuCgpgZmllbGRzYCBlbnRyaWVzIHRha2U6Cgp8IGtleSB8IHJlcXVpcmVkIHwgbWVhbmluZyB8CnwtLS18LS0tfC0tLXwKfCBgbmFtZWAgfCB5ZXMgfCBiYXJlIG5hbWUsIG5vIGNvbG9uIC0gdGhlIG5hbWVzcGFjZSBpcyBhZGRlZCBmb3IgeW91IHwKfCBgZmlsZXNgIHwgeWVzIHwgdGhlIHJlY29yZCBmaWxlcyBpdCBtYXkgYXBwZWFyIG9uOyBhIG1pc3BsYWNlbWVudCBpcyBhbiBlcnJvciB8CnwgYHR5cGVgIHwgbm8gfCBgc3RyaW5nYCwgYG51bWJlcmAsIGBib29sZWFuYCwgYG9iamVjdGAsIGBhcnJheWAsIG9yIGBhbnlgIHwKfCBgbGFiZWxgLCBgZGVzY2AgfCBubyB8IGZvciBhIG1vZCBtYW5hZ2VyIG9yIGEgY2hhcmFjdGVyIHNoZWV0IHwKQ29yZSBuZXZlciByZWFkcyBgZXh0YC4gVGhlIGdhbWUgZG9lcyBub3Qga25vdyB3aGF0ICJibGVlZCIgbWVhbnMsIHNvIGRhdGEgYWxvbmUgY2hhbmdlcyBub3RoaW5nLCBhbmQgYSBtb2QgdGhhdCBhZGRzIHRoZSBmaWVsZCBhbHNvIHN1cHBsaWVzIHRoZSBiZWhhdmlvdXI6IGEgYHJlZ2lzdHJ5OmVmZmVjdGAgaGFuZGxlciBmb3Igd2hhdCBibGVlZGluZyBkb2VzLCBvciBhIGByZWdpc3RyeTpibG93YCBoYW5kbGVyIGZvciBhIG1vbnN0ZXIgYXR0YWNrIHRoYXQgYXBwbGllcyBpdC4KCldoaWNoIGtleXMgY291bnQgYXMgY29yZSdzIGlzIGRlcml2ZWQgZnJvbSBjb3JlJ3Mgb3duIGdhbWVkYXRhIHJhdGhlciB0aGFuIGRlY2xhcmVkIGJ5IGhhbmQgKGBwYWNrYWdlcy9jb3JlL3NyYy9tb2QvcmVjb3JkLWtleXMudHNgLCBnZW5lcmF0ZWQgYW5kIHJlLWRlcml2ZWQgYnkgaXRzIHRlc3QgaW4gYm90aCBkaXJlY3Rpb25zKSwgc28gdGhlIGJvdW5kYXJ5IGNhbm5vdCBkcmlmdCBhcyB0aGUgcGFjayBncm93cy4KCj4gRXZlcnkgcmVjb3JkIG9mIGV2ZXJ5IHNoaXBwZWQgZmlsZSBjYW4gbm93IGJlIGFkZHJlc3NlZCBieSBhIHJlZi4gYGhpc3RvcnlgIHdhcyB0aGUgbGFzdCB0byBnZXQgb25lLCBvbiAyMDI2LTEwLTAzOiBhIGhpc3RvcnkgcmVjb3JkJ3MgcmVmIGlzIGl0cyBjaGFydCBhbmQgcm9sbCwgYXMgaW4gYGNvcmU6NTAtLTEwMGAuIFVudGlsIDIwMjYtMDctMjkgYSBwZXItcmVjb3JkIG9wIGFpbWVkIGF0IGFueSBvZiB0aGUgMjAgbm9uLW5hbWUta2V5ZWQgZmlsZXMgd2FzIHNpbGVudGx5IGRyb3BwZWQsIGFuZCB1bnRpbCAyMDI2LTA4LTA4IGEgZnVydGhlciA3MyBpbmRpdmlkdWFsIHJlY29yZHMsIDYxIG9mIGBlZ29faXRlbWAncyAxMDcgYW1vbmcgdGhlbSwgY291bGQgbm90IGJlIGFkZHJlc3NlZCBieSBhbnkgcmVmIGF0IGFsbC4gYE1PRF9SRUFDSC5tZGAgY2FycmllcyB0aGUgbWVhc3VyZW1lbnQuCgpUb3RhbCBjb252ZXJzaW9ucyBhcmUgdGhlIHNhbWUgbWVjaGFuaXNtIGF0IGZ1bGwgdGhyb3R0bGU6IGRlcGVuZCBvbiBgY29yZWAsIHJlcGxhY2Ugb3IgcmVtb3ZlIHdoYXQgeW91IGRvIG5vdCB3YW50LCBhbmQgYWRkIHlvdXIgb3duIHdvcmxkLgojIyMgQWRkaW5nIHRoaW5ncyB0aGF0IGRvIG5vdCBleGlzdCBpbiB0aGUgYmFzZSBnYW1lCgpUaGVyZSBhcmUgdHdvIGxldmVsczoKCjEuIE5ldyByZWNvcmRzIG9mIGV4aXN0aW5nIHR5cGVzICh0aGUgSlNPTiBhYm92ZSk6IHB1cmUgZGF0YSwgc2FmZSBieSBjb25zdHJ1Y3Rpb24sIGFuZCB2YWxpZGF0ZWQgYWdhaW5zdCB0aGUgc2FtZSBzY2hlbWFzIGNvcmUgdXNlcy4KMi4gTmV3IGNhcGFiaWxpdGllczogbmV3IGVmZmVjdCBvcGNvZGVzLCBuZXcgY29tbWFuZHMsIG5ldyByb29tIGJ1aWxkZXJzLCBtb25zdGVyLUFJIG92ZXJyaWRlcywgbmV3IHZvY2FidWxhcnkgdGVybXMuIFRoZXNlIGdvIHRocm91Z2ggdGhlIGNhcGFiaWxpdHktZ2F0ZWQgcmVnaXN0cnkgaG9zdCAoYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCksIGFuZCB0aGV5IG5lZWQgYSAqKnRydXN0ZWQgaW4tcHJvY2VzcyoqIHBsdWdpbiwgeW91ciBtb2QgZm9sZGVyJ3MgYHBsdWdpbi5qc2AsIG5vdCB0aGUgc2FuZGJveGVkIFdvcmtlciB0aWVyLgoKICAgQSBXb3JrZXIgaXMgYXN5bmNocm9ub3VzIGJ5IGNvbnN0cnVjdGlvbiwgc28gaXQgY2Fubm90IHN1cHBseSBhIGhhbmRsZXIgdGhhdCBydW5zIHN5bmNocm9ub3VzbHkgd2l0aCBsaXZlIGBybmdgIC8gYGNodW5rYCAvIGBwbGF5ZXJgIGFjY2VzcyBkZWVwIGluc2lkZSB0aGUgdHVybi4gVGhlIHNhbmRib3hlZCB0aWVyIGtlZXBzIHRoZSByZWFjdGl2ZSBwZXJjZWl2ZS9hY3QvZXZlbnQgc3VyZmFjZSBhbmQgbm9uZSBvZiB0aGUgcmVnaXN0cmllcy4KCiAgIFRydXN0IGlzIGV4cGxpY2l0OiB0aGUgcGx1Z2luIGRlY2xhcmVzIGVhY2ggYHJlZ2lzdHJ5OipgIGNhcGFiaWxpdHkgaW4gaXRzIG1hbmlmZXN0LCBhbmQgdGhlIHBsYXllciBhZ3JlZXMgdG8gdGhlIGxpc3Qgd2hlbiB0dXJuaW5nIHRoZSBtb2Qgb24uIEV4cGxpY2l0IGlzIG5vdCB0aGUgc2FtZSBhcyBlbmZvcmNlZCwgdGhvdWdoLiBUaGUgY2FwYWJpbGl0eSBnYXRlcyB0aGUgZmFjYWRlLCB3aGlsZSB0aGUgc2FtZSBsaXZlIHJlZ2lzdHJpZXMgYWxzbyBhcnJpdmUgdW5nYXRlZCB0aHJvdWdoIGBjdHguY29yZWAsIGBjdHguc3RhdGVgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgLCBiZWNhdXNlIGEgbW9kIGlzIG1lYW50IHRvIGJlIGFibGUgdG8gcmVhZCBldmVyeXRoaW5nIHdpdGhvdXQgZGVjbGFyaW5nIGFueXRoaW5nLiBQTFVHSU5TLm1kJ3MgIldoYXQgYSBjYXBhYmlsaXR5IGdhdGVzLCBhbmQgd2hhdCBpdCBkb2VzIG5vdCIgaGFzIHRoZSB0YWJsZSBvZiB0d2lucyBhbmQgZXhwbGFpbnMgd2h5IHRoZSBib3VuZGFyeSBpcyB0aGUgaW5zdGFsbCByYXRoZXIgdGhhbiB0aGUgbGlzdC4KCj4gQSBtb2QgaW5zdGFsbGVkIGZyb20gZGlzayBjYW4gcmVhY2ggdGhlIHJlZ2lzdHJpZXMuIEJlZm9yZSB0aGUgcGx1Z2luIEFCSSBsYW5kZWQsIGJvdGggY29kZSBwYXRocyB3ZXJlIGJ1aWxkLXRpbWUgVml0ZSBnbG9icyBvdmVyIGBwYWNrYWdlcy93ZWIvbW9kcy9gLCBzbyBvbmx5IGEgbW9kIGNvbXBpbGVkIGludG8gdGhlIHdlYiBidW5kbGUgY291bGQgcmVhY2ggYSByZWdpc3RyeSwgYW5kIGEgbW9kIGluc3RhbGxlZCBmcm9tIGRpc2sgY291bGQgc3VwcGx5IGdhbWVkYXRhIEpTT04gYW5kIG5vdGhpbmcgZWxzZS4gTm93IGEgbW9kIGZvbGRlciBzaGlwcyBgcGx1Z2luLmpzYCBiZXNpZGUgaXRzIGBtYW5pZmVzdC5qc29uYCwgYW5kIHRoZSBob3N0IGxvYWRzIGl0IGZyb20gd2hlcmV2ZXIgdGhlIGZvbGRlciBpcyAodGhlIGdhbWUncyBvd24gYG5lby1hbmdiYW5kOi8vYCBhZGRyZXNzIG9uIGRlc2t0b3AsIGEgcmV3cml0dGVuIG1vZHVsZSBncmFwaCBpbiBhIGJyb3dzZXIgdGFiKSBhbmQgY2FsbHMgYHJlZ2lzdGVyKGhvc3QsIGN0eClgIG9uIGl0IGxpa2UgYW55IG90aGVyIHBsdWdpbi4gYHBhY2thZ2VzL3dlYi9zcmMvbW9kLXBsdWdpbi50c2AgaXMgdGhlIGNvbnRyYWN0LCBhbmQgYG1haW4udHNgJ3MgYGFjdGl2ZU1vZENvZGUoKS5wbHVnaW5zYCBsb29wIGlzIHRoZSBjYWxsZXIuIFRoZSBzaGlwcGVkIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QgcmVhY2hlcyBgcmVnaXN0cnk6c3RvcmVgIHRoaXMgd2F5LCBmcm9tIGl0cyBvd24gcmVwb3NpdG9yeSwgdGhyb3VnaCB0aGUgc2FtZSBpbnN0YWxsIHJvdXRlIGFueW9uZSdzIG1vZCB1c2VzLgo+Cj4gVGhlIHJlZ2lzdHJpZXMgc3RpbGwgY292ZXIgYSBzZXQgb2YgZG9tYWlucyByYXRoZXIgdGhhbiB0aGUgd2hvbGUgZW5naW5lLCBhbmQgbW9zdCBvZiB0aGUgcG9ydCdzIGRpc3BhdGNoIHRhYmxlcyBoYXZlIG5vIHJlZ2lzdHJ5IGF0IGFsbC4gYE1PRF9SRUFDSC5tZGAgaGFzIHRoZSBjZW5zdXM7IGNoZWNrIGl0IGJlZm9yZSBidWlsZGluZyBvbiBhIGNhcGFiaWxpdHkgY2xhaW0uCiMjIFZlcnNpb25pbmcgYW5kIHN0YWJpbGl0eQoKYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGtgIGlzIHRoZSB2ZXJzaW9uZWQgc3VyZmFjZSBtb2QgYXV0aG9ycyBidWlsZAphZ2FpbnN0LiBUeXBlcyBhcmUgZXhwb3J0ZWQgZm9yIFR5cGVTY3JpcHQgYXV0aG9yczsgZXZlcnl0aGluZyBpcyBwbGFpbgpKU09OIGF0IHJlc3QuIEJyZWFraW5nIGNoYW5nZXMgdG8gcGFjayBzZW1hbnRpY3MgYnVtcCB0aGUgU0RLIG1ham9yCnZlcnNpb24gYW5kIGFyZSBjYWxsZWQgb3V0IGluIHJlbGVhc2Ugbm90ZXMuCgoqKmBNT0RfQ09NUEFUSUJJTElUWS5tZGAgaXMgdGhlIHBhZ2UgdGhhdCBhbnN3ZXJzICJ3aWxsIG15IG1vZCBzdGlsbCB3b3JrIi4qKgpJbiBvbmUgbGluZTogYSBkYXRhLW9ubHkgbW9kIHNob3VsZCBzdXJ2aXZlIGVuZ2luZSByZWxlYXNlcyB3aXRob3V0IGJlaW5nCnJlcHVibGlzaGVkLCBhbmQgYSBtb2QgdGhhdCBzaGlwcyBjb2RlIGdldHMgYSByZWxlYXNlJ3Mgd2FybmluZyBiZWZvcmUgYW4gQUJJCmNoYW5nZSBzdHJhbmRzIGl0LiBUaGF0IEFCSSBpbmNsdWRlcyBhIG5hbWVkIHN1YnNldCBvZiBgY3R4LmNvcmVgOyB0aGUgcmVzdCBvZgp0aGF0IG5hbWVzcGFjZSBpcyBhbiBlc2NhcGUgaGF0Y2guIFRoYXQgcGFnZSBoYXMgdGhlIG1lY2hhbmlzbXMsIHRoZQptZWFzdXJlbWVudHMgYmVoaW5kIHRoZW0sIGFuZCB0aGUgbGlzdCBvZiBndWFyYW50ZWVkIG5hbWVzLgoKIyMgTGljZW5zaW5nIGZvciBtb2QgYXV0aG9ycwoKVGhlIGVuZ2luZSBpcyBkdWFsLWxpY2Vuc2VkIEdQTHYyLW9yLUFuZ2JhbmQtbGljZW5zZSAoc2VlIExJQ0VOU0UubWQpLgpEZWNsYXJhdGl2ZSBjb250ZW50IHBhY2tzIGFuZCB0aWxlIHBhY2tzIGFyZSB5b3VyIG93biBpbmRlcGVuZGVudCB3b3JrczsKbGljZW5zZSB0aGVtIGFzIHlvdSB3aXNoLiBEaXN0cmlidXRlZCBzY3JpcHRlZCBwbHVnaW5zIGFyZSBzYWZlc3QKdHJlYXRlZCBhcyBHUEx2MiBkZXJpdmF0aXZlcy4gU2VlIHRoZSBub3RlIGF0IHRoZSBlbmQgb2YgZG9jcy9NT0RTLm1kLgo="
  },
  {
    "id": "requirements",
    "path": "REQUIREMENTS.md",
    "audience": "advanced",
    "title": "Requirements",
    "note": "The rules the game enforces before it installs a mod.",
    "source": "sdk",
    "encoded": "PCEtLSBHRU5FUkFURUQgZnJvbSBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHMgYW5kIHNyYy9jaGVja3MvcnVsZXMudHMgLSBkbyBub3QgZWRpdCBieSBoYW5kLiAtLT4KPCEtLSBSdW46IG5vZGUgcGFja2FnZXMvbW9kLXNkay9iaW4vbmVvLWFuZ2JhbmQtbW9kLWNoZWNrLm1qcyAtLXdyaXRlLWRvY3MgLS0+CgojIFdoYXQgYSBtb2QgbXVzdCBwcm92aWRlCgpFdmVyeSBydWxlIGJlbG93IGlzIGNvZGUgaW4gYHBhY2thZ2VzL21vZC1zZGsvc3JjL3N0YW5kYXJkcy50c2AuIFRoZSBzYW1lIGZ1bmN0aW9uIGdlbmVyYXRlcyB0aGVzZSBkb2NzLCBydW5zIHdoZW4gdGhlIGdhbWUgaW5zdGFsbHMgYSBtb2QsIGFuZCBydW5zIHdoZW4gYG5lby1hbmdiYW5kLW1vZC1jaGVja2AgY2hlY2tzIHlvdXIgbW9kIGJlZm9yZSB5b3UgcHVibGlzaC4gSWYgYSBydWxlIGNoYW5nZXMsIHRoZSB0ZXh0IGhlcmUgY2hhbmdlcyB3aXRoIGl0LCBhbmQgYSB0ZXN0IGZhaWxzIGlmIHRoZSB0d28gZXZlciBkaXNhZ3JlZS4KCkNoZWNrIHlvdXIgbW9kOgoKYGBgCm5weCBuZW8tYW5nYmFuZC1tb2QtY2hlY2sgcGF0aC90by95b3VyLW1vZApgYGAKCiMjIFJlcXVpcmVkCgpBIG1vZCB0aGF0IGZhaWxzIGFueSBvZiB0aGVzZSBjYW5ub3Qgd29yaywgYW5kIHRoZSBnYW1lIHJlZnVzZXMgdG8gaW5zdGFsbCBpdC4KCiMjIyBTaGlwIG1hbmlmZXN0Lmpzb24gYXQgdGhlIHJvb3Qgb2YgdGhlIG1vZCBmb2xkZXIKCmBtYW5pZmVzdC1wcmVzZW50YAoKSXQgaXMgaG93IHRoZSBnYW1lIHJlY29nbmlzZXMgYSBmb2xkZXIgYXMgYSBtb2QgYXQgYWxsLiBBIGZvbGRlciB3aXRob3V0IG9uZSBpcyBub3QgbG9hZGVkLCBub3QgbGlzdGVkLCBhbmQgbm90IHJlcG9ydGVkIGFzIGJyb2tlbiAtIGl0IGlzIHNpbXBseSBub3QgYSBtb2QuCgojIyMgTWFrZSBtYW5pZmVzdC5qc29uIHZhbGlkIEpTT04KCmBtYW5pZmVzdC1qc29uYAoKSXQgaXMgcmVhZCBiZWZvcmUgYW55dGhpbmcgZWxzZS4gQSB0cmFpbGluZyBjb21tYSBzdG9wcyB0aGUgd2hvbGUgbW9kIGxvYWRpbmcuCgojIyMgRGVjbGFyZSBpZCwgbmFtZSwgdmVyc2lvbiBhbmQgc2hhcGUsIGFuZCBub3RoaW5nIG1hbGZvcm1lZAoKYG1hbmlmZXN0LWZpZWxkc2AKClRoZXNlIGZvdXIgYXJlIHdoYXQgdGhlIG1hbmFnZXIgbGlzdHMgYW5kIHdoYXQgdGhlIGxvYWRlciBrZXlzIGV2ZXJ5dGhpbmcgYnkuIFRoZSBjaGVjayB1c2VzIHRoZSBnYW1lJ3Mgb3duIHZhbGlkYXRvciwgc28gYSBtYW5pZmVzdCB0aGF0IHBhc3NlcyBoZXJlIHBhc3NlcyBhdCBpbnN0YWxsIHRvby4KCiMjIyBTYXkgd2hlcmUgdGhlIG1vZCBsaXZlcywgaW4gYHJlcG9zaXRvcnlgCgpgZGVjbGFyZS1hLXJlcG9zaXRvcnlgCgpJdCBpZGVudGlmaWVzIHRoZSBtb2QgaG93ZXZlciBpdCB3YXMgb2J0YWluZWQuIFRoZSBnYW1lIHBpbnMgYW4gaW5zdGFsbGVkIG1vZCB0byB0aGUgcmVwb3NpdG9yeSBpdCBjYW1lIGZyb20gYW5kIHdpbGwgbm90IGxldCBhIGRpZmZlcmVudCBvbmUgcmVwbGFjZSBpdCwgc28gYSBtb2QgdGhhdCBuYW1lcyBubyByZXBvc2l0b3J5IGNhbiBiZSBxdWlldGx5IG92ZXJ3cml0dGVuIGJ5IGFueXRoaW5nIGNsYWltaW5nIGl0cyBpZC4gSXQgaXMgYWxzbyB0aGUgb25seSB3YXkgYW4gdXBkYXRlIGNhbiBldmVyIGJlIG9mZmVyZWQsIGFuZCB0aGUgb25seSBwbGFjZSBhIHBsYXllciBjYW4gZ28gdG8gcmVhZCBhYm91dCB0aGUgbW9kLiBBcmNoaXZlcyBuZWVkIGl0IGp1c3QgYXMgY2hlY2tvdXRzIGRvOiBhIG1vZCBoYW5kZWQgb3ZlciBhcyBhIHppcCBpcyB0aGUgc2FtZSBtb2QsIGFuZCBpdCBzaG91bGQgY2FycnkgdGhlIHNhbWUgaW5mb3JtYXRpb24gYWJvdXQgaXRzZWxmIGFzIHRoZSBmaWxlcyBmZXRjaGVkIGZyb20gaXRzIHJlcG9zaXRvcnkuCgojIyMgTmFtZSB0aGUgYXV0aG9yCgpgY3JlZGl0LWFuLWF1dGhvcmAKClRoZSBnYW1lIHNob3dzIGl0IGJlc2lkZSB0aGUgbW9kJ3MgbmFtZSwgc28gYSBwbGF5ZXIgY2FuIHRlbGwgdHdvIG1vZHMgb2YgdGhlIHNhbWUgbmFtZSBhcGFydCBhbmQga25vd3Mgd2hvc2Ugd29yayB0aGV5IGFyZSBhYm91dCB0byBydW4uIFVzZSB0aGUgbmFtZSB5b3Ugd2FudCBzaG93bi4gSXQgc2hhcmVzIGEgbGluZSB3aXRoIHRoZSBtb2QncyBuYW1lIGFuZCB2ZXJzaW9uLCBzbyBrZWVwIGl0IHNob3J0IGFuZCBwdXQgYW55dGhpbmcgbG9uZ2VyIGluIGBkZXNjcmlwdGlvbmAuCgojIyMgRGVjbGFyZSB0aGUgZW5naW5lIHJhbmdlIHRoZSBtb2Qgd2FzIHdyaXR0ZW4gYWdhaW5zdAoKYGVuZ2luZS1yYW5nZWAKCldpdGhvdXQgaXQgdGhlIG1vZCBpcyBvZmZlcmVkIHRvIGV2ZXJ5IHZlcnNpb24gb2YgdGhlIGdhbWUgZm9yZXZlciwgaW5jbHVkaW5nIHRoZSBvbmUgdGhhdCBjaGFuZ2VzIHNvbWV0aGluZyBpdCBkZXBlbmRzIG9uLiBXaXRoIGl0LCBhIHBsYXllciBpcyB0b2xkIHRoZSBtb2QgaXMgdG9vIG9sZCBpbnN0ZWFkIG9mIHdhdGNoaW5nIGl0IG1pc2JlaGF2ZS4gRXZlcnkgbW9kIHRoYXQgaGFzIHNoaXBwZWQgZGVjbGFyZWQgb25lLCBhbmQgdGhlIG1vZHMgd2l0aG91dCBvbmUgd2VyZSB0aGUgb25lcyBubyBjaGVjayBoYWQgY292ZXJlZC4KCiMjIyBSZXF1ZXN0IG9ubHkgY2FwYWJpbGl0aWVzIHRoZSBnYW1lIGtub3dzCgpgY2FwYWJpbGl0aWVzLXJlY29nbml6ZWRgCgpBIGNhcGFiaWxpdHkgc3RyaW5nIGlzIHdoYXQgdGhlIHBsYXllciByZWFkcyBiZWZvcmUgYWdyZWVpbmcgdG8gaW5zdGFsbCwgYW5kIGl0IGlzIHRoZSBnYXRlIHRoZSBydW50aW1lIG9wZW5zLiBBbiB1bnJlY29nbml6ZWQgc3RyaW5nLCBvciBhIGNhcGFiaWxpdHkgb24gYSBwYWNrIHRoYXQgY2Fubm90IHJ1biBjb2RlLCBpcyByZWZ1c2VkIHdoZW4gdGhlIGdhbWUgbG9hZHMgdGhlIHBsdWdpbiwgd2hpY2ggaXMgYWZ0ZXIgdGhlIHBsYXllciBoYXMgYWxyZWFkeSBpbnN0YWxsZWQgaXQuIFRoaXMgY2hlY2sgY2FsbHMgQ2FwYWJpbGl0eVNldC5mcm9tTWFuaWZlc3QsIHRoZSBzYW1lIGZ1bmN0aW9uIHRoZSBsb2FkZXIgY2FsbHMsIHNvIGEgdHlwbyBjYW5ub3QgcGFzcyBoZXJlIGFuZCB0aGVuIGZhaWwgYXQgbG9hZC4KCiMjIyBEZWNsYXJlIG1vZEFwaSBpZiB0aGUgbW9kIHNoaXBzIHBsdWdpbi5qcwoKYHBsdWdpbi1kZWNsYXJlcy1tb2RhcGlgCgpUaGUgaG9zdCByZWZ1c2VzIGFuIGluY29tcGF0aWJsZSBwbHVnaW4gYmVmb3JlIGltcG9ydGluZyBpdCwgYW5kIGl0IGNhbiBvbmx5IGRvIHRoYXQgZnJvbSB0aGUgbWFuaWZlc3QsIGJlY2F1c2UgYSB2ZXJzaW9uIGNoZWNrIGluc2lkZSB0aGUgbW9kdWxlIHdvdWxkIHJ1biBhZnRlciB0aGUgbW9kdWxlJ3MgdG9wLWxldmVsIGNvZGUgYWxyZWFkeSBoYWQuIFdpdGhvdXQgbW9kQXBpIHRoZXJlIGlzIG5vdGhpbmcgdG8gY2hlY2sgYWdhaW5zdCwgYW5kIHRoZSBtb2QncyBjb2RlIGlzIGxvYWRlZCB1bmNoZWNrZWQuCgojIyMgU2F5IHRoZSBtb2QgY29udGFpbnMgY29kZSwgaWYgaXQgc2hpcHMgcGx1Z2luLmpzCgpgcGx1Z2luLWRlY2xhcmVzLWZhY2V0YAoKVGhlIG1hbmFnZXIgdGVsbHMgYSBwbGF5ZXIgd2hldGhlciBhIG1vZCBpcyBkYXRhIG9yIGNvZGUsIGFuZCB0aGF0IGFuc3dlciBkZWNpZGVzIGhvdyBtdWNoIHRoZXkgYXJlIHRydXN0aW5nLiBBIG1vZCBzaGlwcGluZyBjb2RlIHdoaWxlIHByZXNlbnRpbmcgYXMgY29udGVudCBpcyBtaXNsZWFkaW5nIHdoZXRoZXIgb3Igbm90IHRoZSBhdXRob3IgbWVhbnQgaXQgdG8gYmUuCgojIyMgRGVjbGFyZSBjb21taXR0ZWQgLnppcCBhcmNoaXZlcyBpbiBwYXlsb2FkLmFyY2hpdmVzCgpgYXJjaGl2ZXMtZGVjbGFyZWRgCgpPbmx5IHRoZSBtYW5pZmVzdCBjYW4gc2F5IHdoZXRoZXIgYSAuemlwIGlzIGEgcGFjayB0byB1bnBhY2sgb3IgYSBmaWxlIHRvIHN0b3JlIGFzIGl0IGlzOyBhIGZpbGUgbGlzdCBjYW5ub3QuIEFuIHVuZGVjbGFyZWQgYXJjaGl2ZSBpcyBpbnN0YWxsZWQgdW5vcGVuZWQsIHNvIHRoZSBtb2QgaXMgcHJlc2VudCwgbGlzdGVkIGFuZCBlbmFibGVkLCBhbmQgZG9lcyBub3RoaW5nLgoKIyMgUmVjb21tZW5kZWQKCkFkdmljZS4gTm9uZSBvZiB0aGVzZSBibG9ja3MgYW4gaW5zdGFsbDsgYWxsIG9mIHRoZW0gYXJlIHRoaW5ncyBwbGF5ZXJzIG5vdGljZS4KCiMjIyBQdWJsaXNoIHNvbWV3aGVyZSB0aGUgZ2FtZSBjYW4gY2hlY2sgZm9yIHVwZGF0ZXMKCmB1cGRhdGVzLWNhbi1iZS1vZmZlcmVkYAoKYHJlcG9zaXRvcnlgIG1heSBuYW1lIGFueSBob3N0LCBhbmQgdGhlIGdhbWUgd2lsbCBpbnN0YWxsIHRoZSBtb2QgZnJvbSBhIHppcCBlaXRoZXIgd2F5IC0gYnV0IHRoZSBvbmx5IGhvc3QgaXQgY2FuIEFTSyBmb3IgbmV3ZXIgdmVyc2lvbnMgaXMgR2l0SHViLiBBIG1vZCBwdWJsaXNoZWQgZWxzZXdoZXJlIGlzIGxpc3RlZCB3aXRoIGEgbm90ZSBzYXlpbmcgaXQgY2Fubm90IGJlIGNoZWNrZWQsIGFuZCBpdHMgcGxheWVycyB1cGRhdGUgaXQgYnkgaGFuZCBvciBub3QgYXQgYWxsLiBUaGlzIGlzIGEgbGltaXRhdGlvbiBvZiB0aGUgZ2FtZSwgbm90IGEganVkZ2VtZW50IGFib3V0IHRoZSBob3N0LgoKIyMjIFVzZSBhIHZlcnNpb24gdGhlIHVwZGF0ZSBjaGVjayBjYW4gb3JkZXIKCmB2ZXJzaW9uLW9yZGVyYWJsZWAKClVwZGF0ZXMgYXJlIG9mZmVyZWQgYnkgY29tcGFyaW5nIHZlcnNpb25zLiBPbmUgdGhhdCBjYW5ub3QgYmUgb3JkZXJlZCBhZ2FpbnN0IGl0cyBwcmVkZWNlc3NvciBpcyBuZXZlciByZXBvcnRlZCBhcyBuZXdlciwgc28gdGhlIG1vZCBzaWxlbnRseSBzdG9wcyB1cGRhdGluZy4KCiMjIyBXcml0ZSBhIGRlc2NyaXB0aW9uCgpgZGVzY3JpYmUtaXRzZWxmYAoKSXQgaXMgdGhlIG9ubHkgdGhpbmcgYSBwbGF5ZXIgaGFzIHRvIGRlY2lkZSBieSwgc2luY2Ugbm90aGluZyBlbHNlIGluIHRoZSBnYW1lIGtub3dzIHdoYXQgdGhlIG1vZCBkb2VzLgoKIyMjIFN0YXRlIGEgbGljZW5jZQoKYHN0YXRlLWEtbGljZW5jZWAKCkEgbW9kIHdpdGggbm8gbGljZW5jZSBjYW5ub3QgbGVnYWxseSBiZSByZWRpc3RyaWJ1dGVkIGJ5IGFueW9uZSwgaW5jbHVkaW5nIGEgcGxheWVyIHNoYXJpbmcgdGhlaXIgc2V0dXAuIENvbnZlcnRpbmcgc29tZWJvZHkgZWxzZSdzIGFydCBoYXMgaXRzIG93biB0ZXJtcyBvbiB0b3Agb2YgdGhhdC4KCiMjIEZpeGVkIGNoZWNrcwoKYG5lby1hbmdiYW5kLW1vZC1jaGVja2AgYWxzbyBydW5zIHRoZSBjaGVja3MgYmVsb3cgb3ZlciB0aGUgbW9kJ3MgYXJjaGl2ZXMsIHBheWxvYWQsIG1hbmlmZXN0LCBjb2RlIGFuZCByZWNvcmRzLiBUaGV5IGxpdmUgaW4gYHBhY2thZ2VzL21vZC1zZGsvc3JjL2NoZWNrcy9gLiBBIGBibG9ja2AgZmluZGluZyBmYWlscyB0aGUgY2hlY2s7IGBzZXJpb3VzYCwgYHdhcm5pbmdgIGFuZCBgbm90ZWAgZmluZGluZ3MgYXJlIHJlcG9ydGVkIGFuZCBkbyBub3QuIEEgZmluZGluZyBtYXJrZWQgImNvdWxkIG5vdCBjaGVjayIgY292ZXJzIGEgcGFydCBvZiB0aGUgbW9kIHRoZSBjaGVja2VyIGNvdWxkIG5vdCBzZWUsIHdoaWNoIGlzIG5vdCB0aGUgc2FtZSBhcyBhIHBhcnQgaXQgZm91bmQgY2xlYW4uCgpUaGUgZ2FtZSBydW5zIHRoZSA4IGNoZWNrcyBtYXJrZWQgInJ1biBhdCBpbnN0YWxsIiB3aGVuIGl0IGluc3RhbGxzIGEgbW9kLCBhbmQgcmVmdXNlcyB0aGUgbW9kIGlmIG9uZSBvZiB0aGVtIGZpbmRzIGEgYGJsb2NrYCBwcm9ibGVtLgoKIyMjIFNoaXAgYXJjaGl2ZXMgdGhlIGdhbWUgY2FuIG9wZW4KCmBjaGVja3MvYXJjaGl2ZS11bnJlYWRhYmxlYCAtIGJsb2NrLCBwYWNrYWdpbmcKCkEgLnppcCB3aG9zZSBkaXJlY3RvcnkgY2Fubm90IGJlIHJlYWQgaW5zdGFsbHMgbm90aGluZywgYW5kIG5vdGhpbmcgaW5zaWRlIGl0IGNhbiBiZSBjaGVja2VkLgoKIyMjIEtlZXAgZXZlcnkgYXJjaGl2ZSBlbnRyeSBpbnNpZGUgdGhlIG1vZCBmb2xkZXIKCmBjaGVja3MvYXJjaGl2ZS1wYXRoYCAtIGJsb2NrLCBzYWZldHkKCkFuIGVudHJ5IG5hbWVkIHdpdGggYC4uYCwgYSBsZWFkaW5nIHNsYXNoLCBhIGRyaXZlIGxldHRlciBvciBhIGJhY2tzbGFzaCBjYW4gd3JpdGUgb3V0c2lkZSB0aGUgZm9sZGVyIGl0IGlzIHVucGFja2VkIGludG8uCgojIyMgR2l2ZSBlYWNoIGFyY2hpdmUgZW50cnkgaXRzIG93biBuYW1lCgpgY2hlY2tzL2FyY2hpdmUtZHVwbGljYXRlYCAtIGJsb2NrLCBzYWZldHkKClR3byBlbnRyaWVzIHdpdGggb25lIG5hbWUsIG9yIG5hbWVzIHRoYXQgZGlmZmVyIG9ubHkgaW4gY2FzZSwgdW5wYWNrIHRvIG9uZSBmaWxlLCBhbmQgd2hpY2ggY29weSB3aW5zIGRlcGVuZHMgb24gdGhlIHRvb2wgdGhhdCB1bnBhY2tzIHRoZW0uCgojIyMgU3RheSB3aXRoaW4gdGhlIGFyY2hpdmUgbGltaXRzCgpgY2hlY2tzL2FyY2hpdmUtc2l6ZWAgLSBibG9jaywgcGFja2FnaW5nCgpBbGwgYXJjaGl2ZXMgaW4gb25lIG1vZCBzaGFyZSBsaW1pdHMgb2YgNjQgTUIgb2YgYXJjaGl2ZSBieXRlcywgNCwwOTYgZW50cmllcyBhbmQgMTI4IE1CIGV4cGFuZGVkLCB3aXRoIDY0IE1CIGZvciBvbmUgZmlsZSwgc28gYSBwYXlsb2FkIG92ZXIgYW55IGxpbWl0IGNhbm5vdCBiZSBpbnN0YWxsZWQuCgojIyMgTWFrZSBhcmNoaXZlIGhlYWRlcnMgbWF0Y2ggd2hhdCB0aGUgZW50cmllcyBob2xkCgpgY2hlY2tzL2FyY2hpdmUtYm9tYmAgLSBibG9jaywgc2FmZXR5CgpBbiBlbnRyeSB0aGF0IGluZmxhdGVzIGZhciBwYXN0IGl0cyBjb21wcmVzc2VkIHNpemUsIHBhc3QgdGhlIHNpemUgaXRzIGhlYWRlciBzdGF0ZXMsIG9yIGludG8gYnl0ZXMgYW5vdGhlciBlbnRyeSBhbHNvIGNsYWltcyBpcyBob3cgYW4gYXJjaGl2ZSBib21iIGZpbGxzIGEgZGlzay4KCiMjIyBVc2UgcGxhaW4gc3RvcmVkIG9yIGRlZmxhdGVkIGZpbGVzIGluIGFyY2hpdmVzCgpgY2hlY2tzL2FyY2hpdmUtZW50cnktdHlwZWAgLSBibG9jaywgc2FmZXR5CgpTeW1ib2xpYyBsaW5rcywgZW5jcnlwdGVkIGVudHJpZXMgYW5kIG90aGVyIGNvbXByZXNzaW9uIG1ldGhvZHMgZWl0aGVyIHBvaW50IG91dHNpZGUgdGhlIG1vZCBvciBjYW5ub3QgYmUgcmVhZCBhbmQgY2hlY2tlZC4KCiMjIyBMZXQgdGhlIGNoZWNrZXIgaW5mbGF0ZSBhcmNoaXZlIGVudHJpZXMKCmBjaGVja3MvYXJjaGl2ZS11bm1lYXN1cmVkYCAtIHdhcm5pbmcsIHBhY2thZ2luZywgY291bGQgbm90IGNoZWNrCgpXaXRob3V0IGEgZGVmbGF0ZSBkZWNvZGVyIHRoZSBjaGVja2VyIHRydXN0cyBlYWNoIGVudHJ5J3Mgc3RhdGVkIHNpemUsIHNvIGFuIGVudHJ5IHRoYXQgbGllcyBhYm91dCBpdCBnb2VzIHVubWVhc3VyZWQuCgojIyMgVXNlIHJlbGF0aXZlIHBhdGhzIGluc2lkZSB0aGUgbW9kIGZvbGRlcgoKYGNoZWNrcy9wYXlsb2FkLXBhdGhgIC0gYmxvY2ssIHNhZmV0eSwgcnVuIGF0IGluc3RhbGwKCkEgcGF5bG9hZCBwYXRoIHRoYXQgaXMgYWJzb2x1dGUsIHVzZXMgYSBiYWNrc2xhc2gsIGNsaW1icyBvdXQgd2l0aCBgLi5gLCBvciBob2xkcyBhIGNoYXJhY3RlciBhIGZpbGUgc3lzdGVtIHJlZnVzZXMgY2Fubm90IGJlIHN0b3JlZCBzYWZlbHkgb24gZXZlcnkgcGxhdGZvcm0uCgojIyMgTmFtZSBmaWxlcyBzbyB0aGV5IGRpZmZlciBieSBtb3JlIHRoYW4gY2FzZQoKYGNoZWNrcy9wYXlsb2FkLWNvbGxpc2lvbmAgLSBibG9jaywgcGFja2FnaW5nLCBydW4gYXQgaW5zdGFsbAoKV2luZG93cyBhbmQgbWFjT1MgdHJlYXQgYFBsdWdpbi5qc2AgYW5kIGBwbHVnaW4uanNgIGFzIG9uZSBmaWxlLCBzbyBvbmUgb2YgdGhlIHR3byBpcyBsb3N0IHdoZW4gdGhlIG1vZCBpcyBjb3BpZWQgdG8gYSBtb2RzIGZvbGRlci4KCiMjIyBTdGF5IHdpdGhpbiB0aGUgcGF5bG9hZCBsaW1pdHMKCmBjaGVja3MvcGF5bG9hZC1zaXplYCAtIGJsb2NrLCBwYWNrYWdpbmcsIHJ1biBhdCBpbnN0YWxsCgpUaGUgZ2FtZSBzdG9yZXMgYXQgbW9zdCA0LDA5NiBmaWxlcywgNjQgTUIgZm9yIG9uZSBmaWxlIGFuZCAxMjggTUIgaW4gYWxsIGZvciBhIG1vZC4KCiMjIyBTaGlwIGV2ZXJ5IGZpbGUgdGhlIG1hbmlmZXN0IG5hbWVzCgpgY2hlY2tzL3BheWxvYWQtaW5jb21wbGV0ZWAgLSBibG9jaywgZnVuY3Rpb25hbGl0eSwgcnVuIGF0IGluc3RhbGwKCkEgZmlsZSBsaXN0ZWQgaW4gYHBheWxvYWQuZmlsZXNgIG9yIGB0ZXh0LmxvY2FsZXNgIHRoYXQgaXMgbm90IHRoZXJlIGxlYXZlcyB0aGUgbW9kIHdpdGhvdXQgaXQsIGFuZCB0aGUgZGVmYXVsdCBsb2NhbGUgaGFzIHRvIGJlIG9uZSBvZiB0aGUgbGlzdGVkIGxvY2FsZXMuCgojIyMgTWFrZSB0aGUgcnVudGltZSBtYXRjaCB0aGUgY29kZSB0aGUgbW9kIHNoaXBzCgpgY2hlY2tzL2VudHJ5LW1vZHVsZWAgLSBibG9jaywgZnVuY3Rpb25hbGl0eSwgcnVuIGF0IGluc3RhbGwKCkEgbW9kIHRoYXQgcnVucyBjb2RlIG5lZWRzIGl0cyBlbnRyeSBtb2R1bGUgaW4gdGhlIHBheWxvYWQsIGFuZCBhIGRhdGEgbW9kIG11c3Qgbm90IHNoaXAgc2NyaXB0cyB0aGUgZ2FtZSB3b3VsZCBuZXZlciBydW4uCgojIyMgU2hpcCB0aGUgc2NyZWVuc2hvdHMgYW5kIGNoYW5nZWxvZyB0aGUgbGlzdGluZyBuYW1lcwoKYGNoZWNrcy9saXN0aW5nLWZpbGVzYCAtIHdhcm5pbmcsIGNvbnRlbnQKClRoZSBtb2QgcGFnZSBzaG93cyB0aGVzZSBmaWxlcywgYW5kIGEgbWlzc2luZyBvbmUgbGVhdmVzIGEgZ2FwIHdoZXJlIGEgcGxheWVyIGV4cGVjdHMgYSBwaWN0dXJlIG9yIHRoZSByZWxlYXNlIG5vdGVzLgoKIyMjIEFzayBmb3IgYXQgbW9zdCA1MDAgbXMgcGVyIHR1cm4KCmBjaGVja3MvYnVkZ2V0LWNlaWxpbmdgIC0gYmxvY2ssIGZ1bmN0aW9uYWxpdHksIHJ1biBhdCBpbnN0YWxsCgpgYnVkZ2V0Lm1zUGVyVHVybmAgbXVzdCBiZSBhIG51bWJlciBhYm92ZSAwIGFuZCBhdCBtb3N0IDUwMDsgdGhlIGdhbWUgc3dpdGNoZXMgb2ZmIGEgbW9kIHRoYXQga2VlcHMgcnVubmluZyBwYXN0IGl0cyBidWRnZXQuCgojIyMgRGVjbGFyZSBhIHRpbWUgYnVkZ2V0IGZvciBhIG1vZCB0aGF0IHJ1bnMgY29kZQoKYGNoZWNrcy9idWRnZXQtZGVmYXVsdGAgLSBub3RlLCBmdW5jdGlvbmFsaXR5CgpXaXRob3V0IGBidWRnZXQubXNQZXJUdXJuYCBhIG1vZCBnZXRzIDUwIG1zIHBlciBnYW1lIHR1cm4sIGFuZCBhbiBhdXRob3Igd2hvIGtub3dzIHRoZSBtb2QgbmVlZHMgbW9yZSBzaG91bGQgc2F5IHNvLgoKIyMjIERlY2xhcmUgYW4gQVBJIHJhbmdlIHRoaXMgZ2FtZSBjYW4gcnVuCgpgY2hlY2tzL2FwaS1yYW5nZWAgLSBibG9jaywgZnVuY3Rpb25hbGl0eSwgcnVuIGF0IGluc3RhbGwKClRoZSBnYW1lIGxvYWRzIGEgbW9kIG9ubHkgd2hlbiBpdHMgYGFwaWAgcmFuZ2UgYWRtaXRzIGFuIEFQSSB2ZXJzaW9uIHRoZSBnYW1lIGltcGxlbWVudHMgZm9yIHRoZSBtb2QncyBydW50aW1lLgoKIyMjIEtlZXAgbG9hZCBvcmRlciBjb25zaXN0ZW50IHdpdGggZGVwZW5kZW5jaWVzCgpgY2hlY2tzL2RlcGVuZGVuY3ktb3JkZXJgIC0gYmxvY2ssIGZ1bmN0aW9uYWxpdHksIHJ1biBhdCBpbnN0YWxsCgpBIG1vZCBsb2FkcyBhZnRlciBpdHMgcmVxdWlyZWQgZGVwZW5kZW5jaWVzLCBzbyBuYW1pbmcgb25lIGluIGBsb2FkQmVmb3JlYCwgbmFtaW5nIGEgbW9kIGluIGJvdGggYGxvYWRBZnRlcmAgYW5kIGBsb2FkQmVmb3JlYCwgb3IgbmFtaW5nIGl0c2VsZiBtYWtlcyBhbiBvcmRlciB0aGF0IGNhbm5vdCBleGlzdC4KCiMjIyBSZXF1ZXN0IG9ubHkgY2FwYWJpbGl0aWVzIHlvdXIgcnVudGltZSBjYW4gaG9sZAoKYGNoZWNrcy9jYXBhYmlsaXR5LXRpZXJgIC0gYmxvY2ssIGZ1bmN0aW9uYWxpdHkKClNvbWUgY2FwYWJpbGl0aWVzIGV4aXN0IG9ubHkgZm9yIGNvZGUgcnVubmluZyBpbiB0aGUgZ2FtZSdzIG93biBwYWdlLCBzbyBhIFdvcmtlciBtb2QgdGhhdCBhc2tzIGZvciBvbmUgY2FuIG5ldmVyIGJlIGdyYW50ZWQgaXQuCgojIyMgTGVhdmUgbWFuYWdlbWVudCBjYXBhYmlsaXRpZXMgdG8gdGhlIGdhbWUncyBvd24gbW9kcwoKYGNoZWNrcy9maXJzdC1wYXJ0eS1jYXBhYmlsaXR5YCAtIGJsb2NrLCBzYWZldHkKCk1vZCBtYW5hZ2VtZW50IGlzIGdyYW50ZWQgb25seSB0byB0aGUgZmlyc3QtcGFydHkgbW9kcyB0aGUgZ2FtZSdzIGJ1aWxkIG5hbWVzLiBBbnkgaW4tcHJvY2VzcyBtb2QgbWF5IHJlcXVlc3QgaGlkZGVuLXN0YXRlIGFjY2VzcyB1bmRlciB0aGUgcGxheWVyJ3MgY29uc2VudDsgYXV0b3BsYXllciBkZWNpc2lvbnMgc3RpbGwgdXNlIG9ubHkgd2hhdCB0aGUgcGxheWVyIGtub3dzLgoKIyMjIFNoaXAgbW9kdWxlcyB0aGUgY2hlY2tlciBjYW4gcGFyc2UKCmBjaGVja3MvdW5wYXJzZWQtbW9kdWxlYCAtIHNlcmlvdXMsIGZ1bmN0aW9uYWxpdHksIGNvdWxkIG5vdCBjaGVjawoKRXZlcnkgaW1wb3J0ZWQgcGF5bG9hZCBmaWxlIGlzIGNoZWNrZWQgYXMgYSBKYXZhU2NyaXB0IG1vZHVsZSwgcmVnYXJkbGVzcyBvZiBpdHMgZXh0ZW5zaW9uLiBBIG1vZHVsZSB0aGF0IGRvZXMgbm90IHBhcnNlIGNhbm5vdCBiZSBleGFtaW5lZCwgYW5kIHRoZSBnYW1lIHdpbGwgbW9zdCBsaWtlbHkgZmFpbCB0byBsb2FkIGl0IHRvby4KCiMjIyBJbXBvcnQgb25seSBmaWxlcyB0aGUgbW9kIHNoaXBzLCBieSB0aGVpciBmdWxsIG5hbWUKCmBjaGVja3MvbWlzc2luZy1tb2R1bGVgIC0gYmxvY2ssIGZ1bmN0aW9uYWxpdHkKCkEgcmVsYXRpdmUgaW1wb3J0IG9mIGEgbWlzc2luZyBmaWxlLCBhbiBleHRlbnNpb25sZXNzIHBhdGggb3IgYSBwYXRoIG91dHNpZGUgdGhlIG1vZCBmb2xkZXIgZmFpbHMgd2hlbiB0aGUgZ2FtZSBsb2FkcyB0aGUgbW9kLgoKIyMjIEJ1bmRsZSBwYWNrYWdlIGltcG9ydHMgaW50byB0aGUgbW9kCgpgY2hlY2tzL3VucmVzb2x2ZWQtaW1wb3J0YCAtIHNlcmlvdXMsIGZ1bmN0aW9uYWxpdHksIGNvdWxkIG5vdCBjaGVjawoKVGhlIGdhbWUgaGFzIG5vIGltcG9ydCBtYXAsIHNvIGEgYmFyZSBwYWNrYWdlIG5hbWUgZG9lcyBub3QgbG9hZCwgYW5kIHRoZSBjaGVja2VyIGNhbm5vdCBzZWUgdGhlIGNvZGUgaXQgd291bGQgYnJpbmcgaW4uCgojIyMgQXZvaWQgaW1wb3J0IGN5Y2xlcyBiZXR3ZWVuIHRoZSBtb2QncyBmaWxlcwoKYGNoZWNrcy9pbXBvcnQtY3ljbGVgIC0gc2VyaW91cywgZnVuY3Rpb25hbGl0eQoKQSBtb2QgbG9hZGVkIGZyb20gYSBwaWNrZWQgZm9sZGVyIG9yIGZyb20gc3RvcmFnZSB0dXJucyBlYWNoIGZpbGUgaW50byBhIGJsb2IgVVJMLCBhbmQgdHdvIGZpbGVzIHRoYXQgaW1wb3J0IGVhY2ggb3RoZXIgY2Fubm90IGJvdGggZ2V0IG9uZS4KCiMjIyBJbXBvcnQgbW9kdWxlcyBieSBhIGZpeGVkIG5hbWUKCmBjaGVja3MvY29tcHV0ZWQtaW1wb3J0YCAtIHdhcm5pbmcsIHNhZmV0eSwgY291bGQgbm90IGNoZWNrCgpBIGR5bmFtaWMgYGltcG9ydCgpYCBvZiBhIGNvbXB1dGVkIHNwZWNpZmllciBjYW4gbG9hZCBhbnl0aGluZywgYW5kIHRoZSBjaGVja2VyIGNhbm5vdCB0ZWxsIHdoYXQuCgojIyMgTG9hZCBjb2RlIG9ubHkgZnJvbSB0aGUgbW9kJ3Mgb3duIGZpbGVzCgpgY2hlY2tzL3JlbW90ZS1pbXBvcnRgIC0gYmxvY2ssIHNhZmV0eQoKQW4gaW1wb3J0IGZyb20gYSBVUkwsIGBkYXRhOmAgb3IgYGJsb2I6YCBhZGRyZXNzLCBvciB0aHJvdWdoIGBpbXBvcnRTY3JpcHRzYCBydW5zIGNvZGUgdGhhdCB3YXMgbmV2ZXIgcGFydCBvZiB0aGUgcmV2aWV3ZWQgcGF5bG9hZC4KCiMjIyBHaXZlIGVhY2ggdGl0bGUgcm93IGFuIGlkIHRoZSBnYW1lIGFjY2VwdHMKCmBjaGVja3MvdGl0bGUtcm93LWlkYCAtIHdhcm5pbmcsIGZ1bmN0aW9uYWxpdHkKClRoZSBnYW1lIHJlZnVzZXMgYSB0aXRsZSByb3cgd2hvc2UgaWQgaXMgbm90IGxvd2VyLWNhc2UgbGV0dGVycywgZGlnaXRzIGFuZCBoeXBoZW5zIHN0YXJ0aW5nIHdpdGggYSBsZXR0ZXIsIHVwIHRvIDY0IGNoYXJhY3RlcnMsIGFuZCB0aGUgcmVmdXNhbCBjb21lcyBiYWNrIGFzIGEgcmVzdWx0LCBzbyB0aGUgcm93IG5ldmVyIGFwcGVhcnMgYW5kIG5vdGhpbmcgaXMgbG9nZ2VkLgoKIyMjIFNoaXAgb25seSBzY3JpcHRzIHRoZSBlbnRyeSBtb2R1bGUgdXNlcwoKYGNoZWNrcy91bnJlYWNoYWJsZS1jb2RlYCAtIG5vdGUsIGZ1bmN0aW9uYWxpdHkKCkEgc2NyaXB0IG5vIGltcG9ydCByZWFjaGVzIGlzIGVpdGhlciBkZWFkIHdlaWdodCBvciBsb2FkZWQgc29tZSB3YXkgdGhlIGNoZWNrZXIgY2Fubm90IGZvbGxvdy4KCiMjIyBEZWNsYXJlIGV2ZXJ5IGNhcGFiaWxpdHkgdGhlIGNvZGUgdXNlcwoKYGNoZWNrcy91bmRlY2xhcmVkLWNhcGFiaWxpdHlgIC0gYmxvY2ssIGZ1bmN0aW9uYWxpdHkKCkEgaG9zdCBjYWxsIHRoYXQgbmVlZHMgYSBjYXBhYmlsaXR5IHRoZSBtYW5pZmVzdCBkb2VzIG5vdCByZXF1ZXN0IGNhbiBuZXZlciBiZSBncmFudGVkLCBzbyB0aGF0IHBhcnQgb2YgdGhlIG1vZCBuZXZlciB3b3Jrcy4KCiMjIyBSZXF1ZXN0IHRoZSBjYXBhYmlsaXRpZXMgdGhlIGNvZGUgY2hlY2tzIGZvcgoKYGNoZWNrcy9jYXBhYmlsaXR5LWZlYXR1cmUtdGVzdGAgLSBub3RlLCBmdW5jdGlvbmFsaXR5CgpUaGUgZ2FtZSBsZWF2ZXMgbWVtYmVycyBzdWNoIGFzIGN0eC5pbnN0YWxsTW9kIG91dCB1bmxlc3MgdGhlIG1hbmlmZXN0IHJlcXVlc3RzIHRoZWlyIGNhcGFiaWxpdHksIHNvIGEgZ3VhcmQgY29udHJvbGxpbmcgdGhhdCB1c2UgY2FuIGtlZXAgaXQgZnJvbSBydW5uaW5nIHdpdGhvdXQgdGhlIHJlcXVlc3QuIEFuIHVucmVsYXRlZCB0ZXN0IGRvZXMgbm90IGd1YXJkIGEgY2FsbC4KCiMjIyBSZWFjaCB0aGUgbW9kIEFQSSBieSBmaXhlZCBwcm9wZXJ0eSBuYW1lcwoKYGNoZWNrcy9jb21wdXRlZC1jb250ZXh0LWFjY2Vzc2AgLSB3YXJuaW5nLCBmdW5jdGlvbmFsaXR5LCBjb3VsZCBub3QgY2hlY2sKClJlYWRpbmcgYGN0eFtuYW1lXWAgb3IgYGhvc3RbbmFtZV1gIGhpZGVzIHdoaWNoIGhvc3QgY2FsbCBpcyBtYWRlLCBzbyB0aGUgY2hlY2tlciBjYW5ub3QgbWF0Y2ggaXQgdG8gYSBjYXBhYmlsaXR5LgoKIyMjIFJlYWNoIGdsb2JhbCBmdW5jdGlvbnMgYnkgZml4ZWQgcHJvcGVydHkgbmFtZXMKCmBjaGVja3MvY29tcHV0ZWQtZ2xvYmFsLWFjY2Vzc2AgLSB3YXJuaW5nLCBzYWZldHksIGNvdWxkIG5vdCBjaGVjawoKQSBjb21wdXRlZCBnbG9iYWwgcHJvcGVydHkgY2FuIHNlbGVjdCBhIGZ1bmN0aW9uIHN1Y2ggYXMgZXZhbCwgc28gdGhlIGNoZWNrZXIgcmVwb3J0cyB1bmtub3duIG5hbWVzIHJhdGhlciB0aGFuIHBhc3NpbmcgdGhlIGNhbGwuCgojIyMgSW52b2tlIGZ1bmN0aW9ucyB0aHJvdWdoIGZvcm1zIHRoZSBjaGVja2VyIGNhbiBmb2xsb3cKCmBjaGVja3MvdW50cmFja2VkLWludm9jYXRpb25gIC0gd2FybmluZywgc2FmZXR5LCBjb3VsZCBub3QgY2hlY2sKCkFuIHVua25vd24gZnVuY3Rpb24gcHJvcGVydHkgbG9zZXMgaXRzIGNhbGxhYmxlIGlkZW50aXR5LCBzbyB0aGUgY2hlY2tlciBjYW5ub3QgdGVsbCB3aGV0aGVyIGl0IGludm9rZXMgZ2VuZXJhdGVkIGNvZGUuCgojIyMgS2VlcCB0aGUgbW9kIEFQSSBpbiBjb2RlIHRoZSBjaGVja2VyIGNhbiBmb2xsb3cKCmBjaGVja3MvY29udGV4dC1lc2NhcGVzYCAtIHdhcm5pbmcsIGZ1bmN0aW9uYWxpdHksIGNvdWxkIG5vdCBjaGVjawoKUGFzc2luZyBgY3R4YCBvciB0aGUgcmVnaXN0cnkgaG9zdCB0byBjb2RlIG91dHNpZGUgdGhlIG1vZCdzIG93biBmdW5jdGlvbnMsIG9yIHN0b3JpbmcgaXQgd2hlcmUgdGhlIGNoZWNrZXIgY2Fubm90IHRyYWNrIGl0LCBoaWRlcyB0aGUgY2FsbHMgbWFkZSB0aHJvdWdoIGl0LgoKIyMjIERlZmF1bHQtZXhwb3J0IHRoZSBwbHVnaW4gYXMgYW4gb2JqZWN0CgpgY2hlY2tzL3BsdWdpbi1zaGFwZWAgLSB3YXJuaW5nLCBmdW5jdGlvbmFsaXR5LCBjb3VsZCBub3QgY2hlY2sKClRoZSBjaGVja2VyIGZpbmRzIHRoZSBtZXRob2RzIHRoZSBnYW1lIGNhbGxzIHRocm91Z2ggdGhlIGVudHJ5IG1vZHVsZSdzIGRlZmF1bHQgZXhwb3J0LCBhbmQgd2l0aG91dCB0aGVtIGl0IGNhbm5vdCB0ZWxsIHdoaWNoIGNvZGUgcmVjZWl2ZXMgdGhlIG1vZCBBUEkuCgojIyMgS2VlcCB0aGUgY29kZSB3aXRoaW4gd2hhdCB0aGUgY2hlY2tlciBjYW4gdHJhY2UKCmBjaGVja3MvYW5hbHlzaXMtbGltaXRgIC0gd2FybmluZywgZnVuY3Rpb25hbGl0eSwgY291bGQgbm90IGNoZWNrCgpUaGUgY2hlY2tlciBzdG9wcyB0cmFjaW5nIGFmdGVyIGEgZml4ZWQgbnVtYmVyIG9mIHBhc3NlcywgYW5kIGFueXRoaW5nIGl0IGRpZCBub3QgcmVhY2ggaXMgdW5jaGVja2VkLgoKIyMjIERlY2xhcmUgdGhlIHNhbWUgQVBJIGluIHRoZSBjb2RlIGFuZCB0aGUgbWFuaWZlc3QKCmBjaGVja3MvYXBpLW1pc21hdGNoYCAtIGJsb2NrLCBmdW5jdGlvbmFsaXR5CgpUaGUgZ2FtZSByZWFkcyB0aGUgQVBJIGZyb20gdGhlIG1hbmlmZXN0IGFuZCB0aGUgcGx1Z2luIHN0YXRlcyBpdCBhZ2FpbiBpbiBpdHMgYGFwaWAgZmllbGQsIGFuZCBhIG1vZCB3aG9zZSB0d28gYW5zd2VycyBkaXNhZ3JlZSBpcyByZWZ1c2VkIHdoZW4gaXQgbG9hZHMuCgojIyMgRG8gbm90IHJ1biBzdHJpbmdzIGFzIGNvZGUKCmBjaGVja3MvZHluYW1pYy1ldmFsYCAtIGJsb2NrLCBzYWZldHkKCmBldmFsYCwgZnVuY3Rpb24gY29uc3RydWN0b3JzIGFuZCBzdHJpbmcgdGltZXJzIHJ1biBjb2RlIHRoYXQgaXMgYnVpbHQgYXQgcnVuIHRpbWUsIGluY2x1ZGluZyB0aHJvdWdoIGNhbGwsIGFwcGx5LCBiaW5kLCBSZWZsZWN0IGFuZCB0YWdnZWQgdGVtcGxhdGVzLCB3aGljaCBubyByZXZpZXcgb2YgdGhlIHNoaXBwZWQgZmlsZXMgY2FuIHNlZS4KCiMjIyBEbyBub3QgYWRkIHNjcmlwdCBlbGVtZW50cyB0byB0aGUgcGFnZQoKYGNoZWNrcy9zY3JpcHQtaW5qZWN0aW9uYCAtIGJsb2NrLCBzYWZldHkKCkEgc2NyaXB0IGVsZW1lbnQsIGluY2x1ZGluZyBvbmUgY3JlYXRlZCB0aHJvdWdoIGEgRE9NIG5hbWVzcGFjZSBvciBzY3JpcHQgbWFya3VwIHNpbmssIGNhbiBydW4gY29kZSBvdXRzaWRlIHRoZSBtb2QncyBvd24gbW9kdWxlcywgcGFzdCBldmVyeSBjaGVjayBvbiB0aGVtLgoKIyMjIERvIG5vdCBzdGFydCB3b3JrZXJzIG9mIHlvdXIgb3duCgpgY2hlY2tzL25lc3RlZC13b3JrZXJgIC0gc2VyaW91cywgc2FmZXR5CgpBIHdvcmtlciB0aGUgbW9kIHN0YXJ0cyBydW5zIG91dHNpZGUgdGhlIGhvc3QncyBicm9rZXIsIHNvIGl0cyBuZXR3b3JrIGFuZCBzdG9yYWdlIHVzZSBhcmUgbm90IGxpbWl0ZWQgYnkgdGhlIG1vZCdzIGNhcGFiaWxpdGllcy4KCiMjIyBTZW5kIG5ldHdvcmsgcmVxdWVzdHMgdGhyb3VnaCB0aGUgbW9kIEFQSQoKYGNoZWNrcy9kaXJlY3QtbmV0d29ya2AgLSBzZXJpb3VzLCBzYWZldHkKCmBmZXRjaGAsIGBYTUxIdHRwUmVxdWVzdGAsIFdlYlNvY2tldCBhbmQgdGhlIGxpa2Ugc2tpcCB0aGUgaG9zdCBicm9rZXIsIHNvIG5laXRoZXIgdGhlIGRlY2xhcmVkIGhvc3RzIG5vciB0aGUgcmVkaXJlY3QgbGltaXQgYXBwbGllcyB0byB0aGVtLgoKIyMjIERlY2xhcmUgZXZlcnkgaG9zdCB0aGUgbW9kIHNlbmRzIHJlcXVlc3RzIHRvCgpgY2hlY2tzL3VuZGVjbGFyZWQtbmV0d29yay1ob3N0YCAtIGJsb2NrLCBmdW5jdGlvbmFsaXR5CgpUaGUgaG9zdCByZWZ1c2VzIGEgcmVxdWVzdCB0byBhbnkgaG9zdCB0aGUgbWFuaWZlc3QncyBgbmV0d29yazpgIGNhcGFiaWxpdGllcyBkbyBub3QgY292ZXIuCgojIyMgVXNlIHJlcXVlc3QgVVJMcyB0aGUgY2hlY2tlciBjYW4gcmVhZAoKYGNoZWNrcy9uZXR3b3JrLWRlc3RpbmF0aW9uYCAtIHdhcm5pbmcsIHNhZmV0eSwgY291bGQgbm90IGNoZWNrCgpBIFVSTCBidWlsdCBhdCBydW4gdGltZSBjYW5ub3QgYmUgY29tcGFyZWQgd2l0aCB0aGUgZGVjbGFyZWQgaG9zdHMgdW50aWwgdGhlIHJlcXVlc3QgaXMgbWFkZS4KCiMjIyBVc2UgaHR0cHMgZm9yIGhvc3RzIG91dHNpZGUgdGhpcyBjb21wdXRlcgoKYGNoZWNrcy9pbnNlY3VyZS10cmFuc3BvcnRgIC0gd2FybmluZywgc2FmZXR5CgpBIHBsYWluIGh0dHAgcmVxdWVzdCB0byBhIHJlbW90ZSBob3N0IGNhbiBiZSByZWFkIGFuZCBjaGFuZ2VkIGJ5IGFueW9uZSBvbiB0aGUgbmV0d29yayBwYXRoLgoKIyMjIEtlZXAga2V5cyBhbmQgdG9rZW5zIG91dCBvZiB0aGUgY29kZQoKYGNoZWNrcy9jcmVkZW50aWFsLWluLWNvZGVgIC0gc2VyaW91cywgc2FmZXR5CgpBIGtleSB3cml0dGVuIGludG8gYSBzY3JpcHQgaXMgcmVhZGFibGUgYnkgZXZlcnlvbmUgd2hvIGluc3RhbGxzIHRoZSBtb2Q7IGtlZXAgaXQgaW4gdGhlIGhvc3QncyBzZWNyZXQgc3RvcmUgYW5kIHJlZmVyIHRvIGl0IGFzIGB7c2VjcmV0Om5hbWV9YC4KCiMjIyBTZW5kIGNyZWRlbnRpYWxzIGluIGhlYWRlcnMsIG5vdCBVUkxzCgpgY2hlY2tzL2NyZWRlbnRpYWwtaW4tdXJsYCAtIHdhcm5pbmcsIHNhZmV0eQoKQSBrZXkgb3IgdG9rZW4gaW4gYSBxdWVyeSBzdHJpbmcgZW5kcyB1cCBpbiBzZXJ2ZXIgbG9ncyBhbmQgcmVkaXJlY3QgY2hhaW5zLgoKIyMjIEJpbmQgc2VjcmV0cyBvbmx5IHRvIGhvc3RzIHRoZSBtYW5pZmVzdCBkZWNsYXJlcwoKYGNoZWNrcy9zZWNyZXQtaG9zdGAgLSBibG9jaywgZnVuY3Rpb25hbGl0eQoKVGhlIGhvc3QgcmVmdXNlcyB0byBrZWVwIGEgc2VjcmV0IGZvciBhIGhvc3QgdGhlIG1vZCBjYW5ub3QgcmVhY2gsIGFuZCBhIGB7c2VjcmV0Oi4uLn1gIHRlbXBsYXRlIG11c3QgbmFtZSBhIHNlY3JldCBpbiBsb3dlci1jYXNlIHdvcmRzIGpvaW5lZCBieSBoeXBoZW5zLgoKIyMjIFNoaXAgSmF2YVNjcmlwdCByYXRoZXIgdGhhbiBXZWJBc3NlbWJseQoKYGNoZWNrcy93ZWJhc3NlbWJseWAgLSBzZXJpb3VzLCBzYWZldHkKCkNvbXBpbGVkIFdlYkFzc2VtYmx5IGNhbm5vdCBiZSByZWFkIGFzIHNvdXJjZSwgc28gYSByZXZpZXcgb2YgdGhlIG1vZCBjYW5ub3Qgc2F5IHdoYXQgaXQgZG9lcy4KCiMjIyBTaGlwIHJlYWRhYmxlIGNvZGUKCmBjaGVja3Mvb2JmdXNjYXRpb25gIC0gc2VyaW91cywgc2FmZXR5CgpPYmZ1c2NhdG9yLXN0eWxlIG5hbWVzLCBzdHJpbmdzIHdyaXR0ZW4gYWxtb3N0IGVudGlyZWx5IGluIGVzY2FwZSBjb2RlcyBhbmQgdGV4dCBhc3NlbWJsZWQgZnJvbSBjaGFyYWN0ZXIgY29kZXMgaGlkZSB3aGF0IGEgc2NyaXB0IGRvZXMgZnJvbSBhbnlvbmUgcmV2aWV3aW5nIGl0LgoKIyMjIFNoaXAgdW5taW5pZmllZCBjb2RlCgpgY2hlY2tzL21pbmlmaWVkLWNvZGVgIC0gd2FybmluZywgc2FmZXR5CgpNaW5pZmllZCBzY3JpcHRzIGFyZSBoYXJkIHRvIHJldmlldyBsaW5lIGJ5IGxpbmU7IGBuZW8tYW5nYmFuZC1tb2QtYnVpbGRgIHdyaXRlcyByZWFkYWJsZSBvdXRwdXQuCgojIyMgQ2hlY2sgcmVjb3JkcyBhZ2FpbnN0IHRoZSBiYXNlIGdhbWUKCmBjaGVja3MvY29tcG9zaXRpb24tdW5jaGVja2VkYCAtIG5vdGUsIGNvbnRlbnQsIGNvdWxkIG5vdCBjaGVjawoKQSByZWNvcmQsIHBhdGNoIG9yIHJlbW92YWwgbWVhbnMgc29tZXRoaW5nIG9ubHkgbmV4dCB0byB0aGUgZ2FtZSdzIG93biBkYXRhIGFuZCB0aGUgbW9kJ3MgZGVwZW5kZW5jaWVzLCBzbyB3aGVuIHRoZSBjaGVja2VyIGNhbm5vdCBmaW5kIHRob3NlIGl0IHNraXBzIHRoaXMgcGFydCBhbmQgc2F5cyBzby4KCiMjIyBNYWtlIGV2ZXJ5IHBhdGNoLCByZXBsYWNlbWVudCBhbmQgcmVtb3ZhbCBhcHBseQoKYGNoZWNrcy9jb21wb3NpdGlvbi1yZWZ1c2VkYCAtIGJsb2NrLCBjb250ZW50CgpUaGUgbG9hZGVyIHJlZnVzZXMgYW4gb3BlcmF0aW9uIHdob3NlIHRhcmdldCBpcyBtaXNzaW5nIG9yIG5vdCB0aGUgbW9kJ3MgdG8gY2hhbmdlLCBpbmNsdWRpbmcgYSByZW1vdmFsIHRoYXQgd291bGQgbGVhdmUgYSByZWZlcmVuY2UgZGFuZ2xpbmcuCgojIyMgTmFtZSBvbmx5IHJlY29yZHMgdGhhdCBleGlzdCBhZnRlciBjb21wb3NpdGlvbgoKYGNoZWNrcy9kYW5nbGluZy1yZWZlcmVuY2VgIC0gc2VyaW91cywgY29udGVudAoKQSByZWNvcmQgdGhhdCBuYW1lcyBhIG1vbnN0ZXIsIGl0ZW0gb3IgY2hhcnQgdGhlIGNvbXBvc2VkIGdhbWUgZG9lcyBub3QgaGF2ZSBjYW4gZmFpbCB3aGVuIHRoYXQgcGFydCBvZiB0aGUgZ2FtZSBpcyByZWFjaGVkLgoKIyMjIEtlZXAgZXZlcnkgaGlzdG9yeSBjaGFydCBjb21wbGV0ZQoKYGNoZWNrcy9oaXN0b3J5LWNoYXJ0YCAtIGJsb2NrLCBjb250ZW50CgpDaGFyYWN0ZXIgY3JlYXRpb24gcm9sbHMgMSB0byAxMDAgb24gZWFjaCBjaGFydCBhbmQgZm9sbG93cyBgbmV4dGAgdG8gYW5vdGhlciBjaGFydCwgc28gYSBjaGFydCB3aXRoIG5vIHBocmFzZSBhdCAxMDAgb3IgYSBsaW5rIHRvIGEgbWlzc2luZyBjaGFydCBicmVha3MgaXQuCgojIyMgV3JpdGUgcmVjb3JkcyB0aGUgZ2FtZSdzIGJsdWVwcmludHMgcmVjb2duaXNlCgpgY2hlY2tzL3JlY29yZC1jaGVja2AgLSB3YXJuaW5nLCBjb250ZW50CgpUaGUgbG9hZGVyIHJlcG9ydHMgYSByZWNvcmQgd2hvc2UgZmllbGRzIGRvIG5vdCBtYXRjaCB3aGF0IHRoZSBnYW1lJ3Mgb3duIGRhdGEgdXNlcywgYW5kIHRoZSBtb2QgbG9hZHMgYW55d2F5Lgo="
  },
  {
    "id": "authoring",
    "path": "AUTHORING.md",
    "source": "local",
    "audience": "advanced",
    "title": "Authoring guide",
    "note": "Draft records, validate them, and assemble a project.",
    "encoded": "IyBEcmFmdCBhbmQgYXNzZW1ibGUgcmVjb3JkcwoKVGhlIFNESydzIGF1dGhvcmluZyBmdW5jdGlvbnMgZHJhZnQgcmVjb3JkcyBmcm9tIGNvbXBhcmFibGUgZ2FtZSByZWNvcmRzLCByZXBvcnQgZmluZGluZ3MsIGFuZCBjb21wb3NlIGEgbW9kIGJlZm9yZSBpdCBpcyB3cml0dGVuLiBUaGV5IHRha2UgSlNPTiByZWNvcmRzIGtleWVkIGJ5IGZpbGUgc3RlbSwgc3VjaCBhcyBgb2JqZWN0YCBvciBgbW9uc3RlcmAuIENvcmUga2VlcHMgdGhlIFtmdWxsIGF1dGhvcmluZyBBUEkgcmVmZXJlbmNlXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL21vZGRpbmcvQVVUSE9SSU5HLm1kKS4KCiMjIEdldCB0aGUgcmVjb3JkcyBhbmQgYXV0aG9yaW5nIGxpYnJhcnkKCkFuIG9mZmxpbmUgdG9vbCBpbXBvcnRzIGBkcmFmdFJlY29yZGAgYW5kIGBtb2RQcm9qZWN0YCBmcm9tIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYC4gSXQgc3VwcGxpZXMgYSBjb250ZW50IHNvdXJjZSBtYXRjaGluZyB0aGUgZ2FtZSB2ZXJzaW9uIHVuZGVyIHRlc3QuIENvcmUncyBucG0gcGFja2FnZSBjb250YWlucyBlbmdpbmUgY29kZSwgc28gaXQgZG9lcyBub3Qgc3VwcGx5IHRoYXQgY29udGVudCBwYWNrLgoKTW9kRm9yZ2Ugb2J0YWlucyB0aGUgYXV0aG9yaW5nIGxpYnJhcnkgdGhyb3VnaCBgbW9kLm1hbmFnZS5hdXRob3JpbmcoKWAgd2l0aCBgbW9kOmF1dGhvcmluZ2AsIGFuZCBjb21wb3NlZCBKU09OIHRocm91Z2ggYG1vZC5jb250ZW50LnJlY29yZHMoZmlsZSlgLiBUaGUgcHVibGlzaGVkIEFQSSAyLjAgaG9zdCByZXNlcnZlcyB0aGUgbWFuYWdlbWVudCBhdXRob3Jpbmcgc2VhbSBmb3IgZmlyc3QtcGFydHkgbW9kcy4gQW4gb3JkaW5hcnkgbW9kIGNhbiByZWFkIGNvbXBvc2VkIGNvbnRlbnQgd2l0aG91dCB0aGF0IHNlYW07IGFuIG9mZmxpbmUgdG9vbCB1c2VzIHRoZSBTREsgcGFja2FnZSBkaXJlY3RseS4gQ2hlY2sgZWFjaCBjYWxsJ3MgYG9rYCBiZWZvcmUgdXNpbmcgaXRzIGB2YWx1ZWAuCgojIyBEcmFmdCBhIG5ldyByZWNvcmQKCmBgYHRzCmltcG9ydCB7IGRyYWZ0UmVjb3JkIH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNkayI7Cgpjb25zdCBkcmFmdGVkID0gZHJhZnRSZWNvcmQoCiAgIm9iamVjdCIsCiAgeyBuYW1lOiAiJiBTbHVkZ2UgRGFnZ2VyfiIsIHR5cGU6ICJzd29yZCIsIGxldmVsOiAyMCB9LAogIGNvcmVSZWNvcmRzLAopOwpgYGAKCmBjb3JlUmVjb3Jkc2AgaXMgdGhlIHN1cHBsaWVkIEpTT04gcmVjb3JkIG1hcC4gYGRyYWZ0ZWQucmVjb3JkYCB0YWtlcyBpdHMgc2hhcGUgZnJvbSBhIGNvbXBhcmFibGUgcmVjb3JkIGFuZCBpdHMgc3VnZ2VzdGVkIG51bWJlcnMgZnJvbSBuZWFyYnkgcGVlcnMuIGBkcmFmdGVkLm1vZGVsbGVkT25gIG5hbWVzIHRoZSBtb2RlbCwgYW5kIGBkcmFmdGVkLnN1Z2dlc3Rpb25zYCBnaXZlcyB0aGUgZXZpZGVuY2UgZm9yIGVhY2ggdmFsdWUuIFRoZSBkcmFmdCBkb2VzIG5vdCBjb3B5IGF0dGFja3MsIGZsYWdzLCBlZmZlY3RzLCBkZXNjcmlwdGlvbnMsIG9yIG90aGVyIGJlaGF2aW9yIGFuZCBpZGVudGl0eSBmaWVsZHMuIFRoZSBhdXRob3Igc3VwcGxpZXMgdGhvc2UgY2hvaWNlcy4KCmBjaGVja1JlY29yZHMoc3ViamVjdCwgYWxsKWAgY2hlY2tzIHRoZSBhdXRob3IncyByZWNvcmRzIGFnYWluc3QgdGhlIGZ1bGwgY29tcG9zZWQgc2V0LiBBIGNoZWNrIGFnYWluc3QgdGhlIG1vZCBhbG9uZSBjYW5ub3QgcmVzb2x2ZSBpdHMgcmVmZXJlbmNlcyB0byBDb3JlIG9yIGFub3RoZXIgbW9kLiBGaW5kaW5ncyBoYXZlIGBlcnJvcmAsIGB3YXJuYCwgb3IgYGhpbnRgIGxldmVsczsgYSBoaW50IHN1Y2ggYXMgYGZpZWxkL3ZvY2FidWxhcnlgIHBlcm1pdHMgYSB2YWx1ZSB0aGUgYmFzZSBkYXRhIGRvZXMgbm90IHVzZS4KCiMjIEFzc2VtYmxlIGEgcHJvamVjdAoKYGBgdHMKaW1wb3J0IHsgZHJhZnRSZWNvcmQsIG1vZFByb2plY3QgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKCmNvbnN0IGJ1aWxkID0gbW9kUHJvamVjdCh7CiAgaWQ6ICJzbHVkZ2UiLAogIG5hbWU6ICJTbHVkZ2UiLAogIHZlcnNpb246ICIxLjAuMCIsCiAgc2hhcGU6ICJjb250ZW50IiwKICBhdXRob3I6ICJ5b3UiLAogIGxpY2Vuc2U6ICJHUEwtMi4wLW9ubHkiLAogIHJlcG9zaXRvcnk6ICJodHRwczovL2dpdGh1Yi5jb20veW91L3NsdWRnZSIsCiAgZW5naW5lOiAiPj0xLjIzLjAtYmV0YS4zIiwKICBkZXBlbmRlbmNpZXM6IHsgY29yZTogIioiIH0sCn0pCiAgLmRlY2xhcmVGaWVsZCh7IG5hbWU6ICJzbHVkZ2UiLCBmaWxlczogWyJvYmplY3QiXSwgdHlwZTogIm9iamVjdCIgfSkKICAuYWRkKCJtb25zdGVyIiwgZHJhZnRSZWNvcmQoIm1vbnN0ZXIiLCB7CiAgICBuYW1lOiAic2x1ZGdlIGZpZW5kIiwgYmFzZTogImlja3kgdGhpbmciLCBkZXB0aDogMjUsCiAgfSwgY29yZVJlY29yZHMpLnJlY29yZCkKICAucGF0Y2hGaWVsZHMoIm9iamVjdCIsICJjb3JlOnN3b3JkLS1kYWdnZXIiLCBbCiAgICB7IG9wOiAic2V0IiwgcGF0aDogInNsdWRnZTpzbHVkZ2UiLCB2YWx1ZTogeyB0dXJuczogNSB9IH0sCiAgXSkKICAuYnVpbGQoY29yZVBhY2spOwpgYGAKCmBjb3JlUGFja2AgaXMgdGhlIG1hdGNoaW5nIGJhc2UgY29udGVudCBpbiB0aGUgU0RLJ3MgYExvYWRlZFBhY2tgIHNoYXBlLiBUaGUgYnVpbGRlciBhY2NlcHRzIHRoaXMgbm9ybWFsaXplZCBtYW5pZmVzdCBvYmplY3QgYW5kIGVtaXRzIGEgc2NoZW1hIDIgbWFuaWZlc3QgZG9jdW1lbnQuIGBidWlsZC5maWxlc2AgY29udGFpbnMgcGF0aHMgYW5kIHRleHQsIGBidWlsZC5maW5kaW5nc2AgY29udGFpbnMgYXV0aG9yaW5nIGZpbmRpbmdzLCBhbmQgYGJ1aWxkLnByb2JsZW1zYCBjb250YWlucyBjb21wb3NpdGlvbiByZWZ1c2Fscy4gYGJ1aWxkLm9rYCBpcyBmYWxzZSB3aGVuIGEgZmluZGluZyBpcyBhbiBlcnJvcjsgd2FybmluZ3Mgc3RpbGwgbmVlZCByZXZpZXcgYmVmb3JlIHB1YmxpY2F0aW9uLgoKYGVtaXQoKWAgcmV0dXJucyBmaWxlcyB3aXRob3V0IHdyaXRpbmcgdGhlbS4gYGJ1aWxkKGNvcmVQYWNrKWAgY29tcG9zZXMgdGhlIHJlc3VsdCBhbmQgY2hlY2tzIGl0LiBUaGUgY2FsbGVyIHdyaXRlcyB0aG9zZSBmaWxlcyBvciBtYWtlcyBhIHppcCwgd2hpY2ggbGV0cyB0aGUgc2FtZSBwcm9qZWN0IHJ1biBpbiBhbiBvZmZsaW5lIHRvb2wgb3IgaW4gdGhlIHdvcmtzaG9wLgoKVGhlIHB1Ymxpc2hlZCBgTW9kUHJvamVjdC5idWlsZGAgYWNjZXB0cyBvbmUgYmFzZSBwYWNrLiBNb2RGb3JnZSBtZXJnZXMgaXRzIGxvYWRlZCByZWNvcmQgbWFwIGludG8gYSBDb3JlIGJhc2UgZm9yIHRoaXMgY2FsbCwgc28gYSBkcmFmdCB0aGF0IGRlY2xhcmVzIGFub3RoZXIgaW5zdGFsbGVkIG1vZCBhcyBhIGRlcGVuZGVuY3kgcmVjZWl2ZXMgYHByb2plY3QvdW5sb2FkYWJsZWAuIFRoZSBkZXBlbmRlbmN5IGlzIHByZXNlcnZlZCBpbiB0aGUgZXhwb3J0ZWQgbWFuaWZlc3QsIGJ1dCB0aGUgd29ya3Nob3AgY2Fubm90IHZhbGlkYXRlIHRoYXQgZHJhZnQgdGhyb3VnaCB0aGlzIGJ1aWxkZXIuIFRoZSBTREsgbmVlZHMgYSBidWlsZCBtZXRob2QgdGhhdCBhY2NlcHRzIGFsbCBsb2FkZWQgYmFzZSBwYWNrczsgTW9kRm9yZ2Uga2VlcHMgdGhlIFNESydzIHZhbGlkYXRpb24gcnVsZXMgaW4gdGhlIFNESy4KCiMjIENvbXBvc2Ugd2l0aCBvdGhlciBtb2RzCgpEZWNsYXJlIGEgcmVjb3JkIG93bmVyJ3MgaWQgaW4gYGRlcGVuZGVuY2llc2AgYmVmb3JlIHBhdGNoaW5nIGl0cyByZWNvcmRzLiBEZWNsYXJlIGFuIGV4dGVuc2lvbiBmaWVsZCBiZWZvcmUgd3JpdGluZyBpdCwgYW5kIGRlY2xhcmUgdGhlIGV4dGVuc2lvbiBvd25lcidzIGlkIGJlZm9yZSB3cml0aW5nIGFub3RoZXIgbW9kJ3MgbmFtZXNwYWNlZCBmaWVsZC4gVXNlIGBhZGRgIGZvciBhIHJlbGF0aXZlIG51bWVyaWMgY2hhbmdlLCBgYWRkRmxhZ2AgZm9yIGEgZmxhZywgYW5kIGBhcHBlbmRgIGZvciBhIGxpc3QgY29udHJpYnV0aW9uLiBBIGBzZXRgIHJlcGxhY2VzIHRoZSBjdXJyZW50IGZpZWxkIHZhbHVlLgoKVGhlIHByb2plY3QgbWV0aG9kcyBgYWRkYCwgYHBhdGNoRmllbGRzYCwgYHJlcGxhY2VgLCBhbmQgYHJlbW92ZWAgb3BlcmF0ZSBvbiBmaWxlIHN0ZW1zIGFuZCBzdGFibGUgcmVmcy4gYHJlY29yZEtleShmaWxlLCByZWNvcmQpYCBkZXJpdmVzIGEga2V5OyBgcmVjb3JkUmVmS2V5c2AgbGlzdHMgaXRzIGFjY2VwdGVkIGFsaWFzZXMuIE1vc3QgZmlsZXMgdXNlIHRoZSByZWNvcmQncyBuYW1lLCBidXQgb2JqZWN0cyB1c2UgdHlwZSBwbHVzIG5hbWUsIGFuZCBzdG9yZXMgdXNlIHRoZWlyIGNvZGUuIFJlYWQgdGhlIFtyZWNvcmQgaWRlbnRpdHkgcmVmZXJlbmNlXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL21vZGRpbmcvQVVUSE9SSU5HLm1kI3doYXQtYS1yZWNvcmQtaXMtY2FsbGVkKSBiZWZvcmUgaW52ZW50aW5nIGEgcmVmLgoKVGhlIHdvcmtzaG9wJ3MgcmVjb3JkIHNjcmVlbnMgb21pdCBgY29uc3RhbnRzYCwgYHZpc3VhbHNgLCBhbmQgYGhpc3RvcnlgLiBUaGUgcHJvamVjdCBidWlsZGVyIHJlcG9ydHMgd2hvbGUtZmlsZSByZXBsYWNlbWVudCBvZiB0aG9zZSBmaWxlcyBhcyBhbiBlcnJvci4gVGhlIGZpbGUgZWRpdG9yIGNhbiBjYXJyeSBzZWN0aW9ucyBhbmQgcmVwbGFjZW1lbnRzOyBhIHJlcGxhY2VtZW50IHR5cGVkIHRoZXJlIGlzIGNoZWNrZWQgb24gdGhlIHJldmlldyBzY3JlZW4uCgpUaGUgW3NjYWZmb2xkaW5nIGd1aWRlXShTQ0FGRk9MRElORy5tZCkgY292ZXJzIHRoZSBmb2xkZXIgYW5kIGVudHJ5IHBvaW50LiBUaGUgW3B1Ymxpc2hpbmcgZ3VpZGVdKFBVQkxJU0hJTkcubWQpIGNvdmVycyBjaGVja3MgYW5kIHNoYXJpbmcuIFJ1bGUgYW5kIHNlY3Rpb24gcmVuYW1lIGZvcm1hdHMgcmVtYWluIGluIFtDb3JlJ3MgYXV0aG9yaW5nIHJlZmVyZW5jZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0FVVEhPUklORy5tZCNyZW5hbWluZy1hLXBsYXllci10b2dnbGVhYmxlLXJ1bGUpLgo="
  },
  {
    "id": "scaffolding",
    "path": "SCAFFOLDING.md",
    "source": "local",
    "audience": "advanced",
    "title": "Start a mod",
    "note": "Folder layout, API 2 entry point, imports, and assets.",
    "encoded": "IyBTdGFydCBhIG1vZAoKQSBtb2QgaXMgYSBmb2xkZXIgdGhhdCBob2xkcyBgbWFuaWZlc3QuanNvbmAsIGl0cyByZWNvcmQgY29udHJpYnV0aW9ucywgYW5kIGFueSBzY3JpcHRzIG9yIGFzc2V0cyBpdCBuZWVkcy4gVGhlIHdvcmtzaG9wIGNyZWF0ZXMgdGhhdCBmb2xkZXIgYXMgYSB6aXAuIFtUdXRvcmlhbCAxXSh0dXRvcmlhbHMvMDEtdHdlYWstYS12YWx1ZS5tZCkgZ2l2ZXMgdGhlIGNvbXBsZXRlIHNjaGVtYSAyIG1hbmlmZXN0IGZvciBhIGNvbnRlbnQgbW9kLCBhbmQgW3R1dG9yaWFsIDVdKHR1dG9yaWFscy8wNS1ob29rLWJlaGF2aW91ci5tZCkgZ2l2ZXMgYW4gQVBJIDIgcGx1Z2luLgoKIyMgRnJvbSB0aGUgd29ya3Nob3AKCkluIHRoZSBHYW1lIG1lbnUsIGNob29zZSAqKkJ1aWxkIGEgbW9kLi4uKiosIGNyZWF0ZSBhIGRyYWZ0LCBhbmQgc2V0IGl0cyBpZCwgbmFtZSwgYXV0aG9yLCByZXBvc2l0b3J5LCBhbmQgbGljZW5zZS4gVGhlIHJlY29yZCBzY3JlZW5zIGFkZCBvciBjaGFuZ2UgcmVjb3Jkcy4gRm9yIGFuIGV4aXN0aW5nIHJlY29yZCB0aGUgd29ya3Nob3Agd3JpdGVzIGZpZWxkIHBhdGNoZXMsIGFuZCBmb3IgYSBuZXcgb25lIGl0IHdyaXRlcyB0aGUgd2hvbGUgcmVjb3JkLiAqKkVkaXQgdGhlIGZpbGVzIGRpcmVjdGx5Kiogb3BlbnMgdGhlIHNhbWUgZHJhZnQgYXMgZmlsZXMuCgoqKlN0YXJ0IGEgcGx1Z2luLmpzKiogYWRkcyBhbiBBUEkgMiBlbnRyeSB0ZW1wbGF0ZS4gVGhlIGVtaXR0ZWQgbWFuaWZlc3QgdGhlbiBnYWlucyB0aGUgYHBsdWdpbmAgZmFjZXQsIHRoZSBgaW4tcHJvY2Vzc2AgcnVudGltZSwgYW5kIHRoZSBBUEkgcmFuZ2UgcmVhZCBmcm9tIHRoZSBzY3JpcHQuICoqVHJ5IGl0IGluIHRoZSBnYW1lKiogaXMgdW5hdmFpbGFibGUgb25jZSBhIGRyYWZ0IGhhcyBhIHNjcmlwdCBvciBhIGNhcGFiaWxpdHkgZGVjbGFyYXRpb24uIFRvIHRlc3QgdGhhdCBkcmFmdCwgc2F2ZSBhIHppcCBhbmQgbG9hZCBpdCB3aXRoICoqSW1wb3J0IGEgemlwKiogb24gdGhlIGdhbWUncyBNb2RzIHNjcmVlbi4KCiMjIEZyb20gYSBmb2xkZXIKCmBgYHRleHQKbXktbW9kLwogIG1hbmlmZXN0Lmpzb24KICBwbHVnaW4uanMKICBsaWIvZm9ybWF0LmpzCiAgbW9uc3Rlci5qc29uCiAgZGF0YS9zcGF3bnMuanNvbgogIHRpbGVzL29yYy5wbmcKYGBgCgpPbmx5IGEgY29kZSBtb2QgbmVlZHMgYHBsdWdpbi5qc2AuIEEgbW9kIHdpdGggYm90aCByZWNvcmRzIGFuZCBjb2RlIGRlY2xhcmVzIGBjb250ZW50YCBhbmQgYHBsdWdpbmAgaW4gYGRhdGEuZmFjZXRzYCBhbmQgbmFtZXMgaXRzIHByaW1hcnkgZmFjZXQgaW4gYGRhdGEuc2hhcGVgLiBDb2RlIHJ1bnMgd2l0aCBgZGF0YS5ydW50aW1lOiAiaW4tcHJvY2VzcyJgIGFuZCBgZGF0YS5hcGk6ICI+PTIuMC4wIDwzLjAuMCJgLiBBIGNvbnRlbnQtb25seSBtb2QgdXNlcyBgZGF0YS5ydW50aW1lOiAiZGF0YSJgIGFuZCBgZGF0YS5hcGk6ICIqImAuIFRoZSBleGFtcGxlcyB0YXJnZXQgU0RLIDEuMjMuMC1iZXRhLjMsIHdoaWNoIGNhcnJpZXMgbW9kIEFQSSAyLjAuMC4KClRoZSBlbnRyeSBtb2R1bGUgZGVmYXVsdC1leHBvcnRzIGFuIEFQSSAyIGRlZmluaXRpb24uIFRoZSBob3N0IHBhc3NlcyB0aGUgQVBJIHJvb3QgdG8gYHN0YXJ0YCwgYW5kIGhvb2tzIHJlY2VpdmUgb25seSBgeyBpZCwgZmxhZ3MgfWAuIEEgaG9vayByZXR1cm5zIGl0cyBhbnN3ZXIgc3luY2hyb25vdXNseS4gQ2FsbHMgb24gZG9tYWlucyBzdWNoIGFzIGB2aWV3YCByZXR1cm4gcHJvbWlzZXMgb2YgcmVzdWx0cywgc28gY2hlY2sgYG9rYCBiZWZvcmUgeW91IHJlYWQgYHZhbHVlYC4KCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6ICI+PTIuMC4wIDwzLjAuMCIsCiAgYXN5bmMgc3RhcnQobW9kKSB7CiAgICBjb25zdCBwbGF5ZXIgPSBhd2FpdCBtb2Qudmlldy5wbGF5ZXIoKTsKICAgIGlmICghcGxheWVyLm9rKSByZXR1cm47CiAgICBtb2QubWV0YS5sb2coYEhQICR7cGxheWVyLnZhbHVlLmhwfS8ke3BsYXllci52YWx1ZS5tYXhIcH1gKTsKICB9LAp9OwpgYGAKClRoaXMgZXhhbXBsZSBuZWVkcyBgc3RhdGU6cGxheWVyLnJlYWRgIGluIGBkYXRhLmNhcGFiaWxpdGllc2AuIFZpZXdzIGNvbnRhaW4gb25seSBpbmZvcm1hdGlvbiB0aGUgcGxheWVyIGtub3dzLiBJZiB0aGUgcGVybWlzc2lvbiBpcyBtaXNzaW5nIG9yIHRoZSBjaGFyYWN0ZXIgaXMgdW5hdmFpbGFibGUsIHRoZSBjYWxsIHByb2R1Y2VzIGEgZmFpbGVkIHJlc3VsdCBhbmQgdGhlIGV4YW1wbGUgcmV0dXJucyB3aXRob3V0IHJlYWRpbmcgYSB2YWx1ZS4KCiMjIEltcG9ydHMgYW5kIGFzc2V0cwoKU3BsaXQgc2NyaXB0cyBhY3Jvc3MgZmlsZXMgd2l0aCByZWxhdGl2ZSBpbXBvcnRzIHRoYXQgaW5jbHVkZSB0aGUgZXh0ZW5zaW9uLCBzdWNoIGFzIGBpbXBvcnQgeyBmb3JtYXQgfSBmcm9tICIuL2xpYi9mb3JtYXQuanMiYC4gRm9sZGVyIGxvYWRpbmcgZG9lcyBub3Qgc3VwcG9ydCBpbXBvcnQgY3ljbGVzLCBzbyB3aGVuIHR3byBtb2R1bGVzIHdvdWxkIGltcG9ydCBlYWNoIG90aGVyLCBtb3ZlIHRoZWlyIHNoYXJlZCBjb2RlIGludG8gYSB0aGlyZCBtb2R1bGUuCgpBbiBpbnN0YWxsZWQgbW9kIGNhbm5vdCByZXNvbHZlIHBhY2thZ2UgbmFtZXMuIEluIFR5cGVTY3JpcHQsIGltcG9ydCBTREsgYW5kIENvcmUgdHlwZXMgd2l0aCBgaW1wb3J0IHR5cGVgLCB0aGVuIGJ1bmRsZSB0aGUgc291cmNlIHRvIGBwbHVnaW4uanNgIHdpdGggdGhlIFNESyBidWlsZGVyLiBUaGUgcnVudGltZSBBUEkgYXJyaXZlcyB0aHJvdWdoIGBzdGFydChtb2QpYC4gQSBzZWNvbmQgYnVuZGxlZCBjb3B5IG9mIENvcmUgZG9lcyBub3QgcmVwcmVzZW50IHRoZSBydW5uaW5nIGdhbWUuCgpJbiBhbiBpbi1wcm9jZXNzIG1vZCwgcmVhZCBhbiBhc3NldCB0aHJvdWdoIGBhd2FpdCBtb2QuY29udGVudC5hc3NldCgiZGF0YS9zcGF3bnMuanNvbiIpYCwgY2hlY2sgdGhlIHJlc3VsdCwgYW5kIHVzZSBpdHMgVVJMLiBUaGUgcmVzb2x2ZXIgcmVhY2hlcyBvbmx5IHRoaXMgbW9kJ3MgZmlsZXMuIEEgcm9vdCByZWNvcmQgSlNPTiBmaWxlIGNvbnRyaWJ1dGVzIGdhbWUgZGF0YSwgYW5kIG5lc3RlZCBKU09OIGNhbiBob2xkIHRoZSBtb2QncyBvd24gZGF0YS4gW0NvcmUncyByZXNvdXJjZSByZWZlcmVuY2VdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9BVVRIT1JJTkcubWQjc2hpcHBpbmctcmVzb3VyY2VzLXNvdW5kcy1hLWZvbnQtcHJlZi1maWxlcy1oZWxwLXBhZ2VzLWFydCkgZGVzY3JpYmVzIG1hbmlmZXN0LWRlY2xhcmVkIHNvdW5kcywgZm9udHMsIHByZWZlcmVuY2VzLCBoZWxwLCBhcnQsIGFuZCBsb2NhbGVzLgoKIyMgVHlwZVNjcmlwdCBhbmQgZGlzdHJpYnV0aW9uCgpBZGQgdGhlIHB1Ymxpc2hlZCBTREsgYXMgYSBkZXZlbG9wbWVudCBkZXBlbmRlbmN5LiBGcm9tIHRoZSBtb2QgcmVwb3NpdG9yeSwgcnVuIGBwbnBtIGV4ZWMgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkIC0tcm9vdCAuYCB0byBidW5kbGUgdGhlIGVudHJ5IHNvdXJjZSwgdGhlbiBjb21taXQgdGhlIHJlc3VsdGluZyBgcGx1Z2luLmpzYCBiZXNpZGUgdGhlIG1hbmlmZXN0LiBUaGUgYnVpbGRlciByZWplY3RzIHVucmVzb2x2ZWQgcGFja2FnZSBpbXBvcnRzLiBBIGhhbmQtd3JpdHRlbiBFUyBtb2R1bGUgd2l0aCByZWxhdGl2ZSBpbXBvcnRzIG5lZWRzIG5vIGJ1aWxkIHN0ZXAuCgpUaGUgW2F1dGhvcmluZyBndWlkZV0oQVVUSE9SSU5HLm1kKSBjb3ZlcnMgZHJhZnRpbmcgYW5kIGNvbXBvc2luZyByZWNvcmRzLCBhbmQgW1B1Ymxpc2hpbmddKFBVQkxJU0hJTkcubWQpIGNvdmVycyBjaGVja3MgYW5kIGRpc3RyaWJ1dGlvbi4gQ29yZSBrZWVwcyB0aGUgW0FQSSAyIHJlZmVyZW5jZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0FQSTIubWQpLCB0aGUgW0FQSSAxIG1pZ3JhdGlvbiBndWlkZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL01JR1JBVElOR19UT19BUEkyLm1kKSwgYW5kIHRoZSBbcGx1Z2luIHJlZmVyZW5jZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL1BMVUdJTlMubWQpLgo="
  },
  {
    "id": "publishing",
    "path": "PUBLISHING.md",
    "source": "local",
    "audience": "advanced",
    "title": "Check and publish",
    "note": "Review a draft, check a repository, and share a release.",
    "encoded": "IyBDaGVjayBhbmQgcHVibGlzaCBhIG1vZAoKQSBkaXN0cmlidXRlZCBtb2QgaXMgYSBmb2xkZXIgaG9sZGluZyBgbWFuaWZlc3QuanNvbmAsIHRoZSByZWNvcmQgY29udHJpYnV0aW9ucyBhbmQgcmVzb3VyY2VzIGl0IGRlY2xhcmVzLCBhbmQgYHBsdWdpbi5qc2AgaWYgdGhlIG1vZCBydW5zIGNvZGUuIFRoZSBnYW1lIGxvYWRzIHRoYXQgZm9sZGVyIGZyb20gZGlzaywgZnJvbSBhIHppcCwgb3IgZnJvbSBhIHJlcG9zaXRvcnkuIG5wbSBzdXBwbGllcyBvbmx5IHRoZSBkZXZlbG9wbWVudCBTREssIGFuZCB0aGUgbW9kIGl0c2VsZiBzaGlwcyBhcyB0aGUgZm9sZGVyLgoKIyMgUmV2aWV3IHRoZSBkcmFmdAoKSW4gTW9kRm9yZ2UsIGNsaWNrICoqUmV2aWV3IGl0KiogdG8gcmVhZCBlcnJvcnMsIHdhcm5pbmdzLCBhbmQgaGludHMuIFNldCBhIHJlcG9zaXRvcnkgYWRkcmVzcyBhbmQgYSBsaWNlbnNlIGJlZm9yZSB5b3Ugc2hhcmUgdGhlIG1vZC4gQSBmb3JrIG1hZGUgZnJvbSBpbnN0YWxsZWQgcmVjb3JkcyBoYXMgbG9zdCBpdHMgc291cmNlIG1hbmlmZXN0IGFuZCBsaWNlbnNlLCBzbyBnZXQgdGhlIG9yaWdpbmFsIGxpY2Vuc2UgZnJvbSB0aGUgYXV0aG9yIGJlZm9yZSB5b3UgcHVibGlzaCB0aGF0IGZvcmsuCgoqKlRyeSBpdCBpbiB0aGUgZ2FtZSoqIHN0YWdlcyB0aGUgY29udGVudCBmb3Igb25lIHNlc3Npb24gYW5kIHJlbG9hZHMgdGhyb3VnaCB0aGUgaG9zdC4gTW9kcyB3aXRoIHNjcmlwdHMgb3IgY2FwYWJpbGl0eSByZXF1ZXN0cyBjYW5ub3QgYmUgc3RhZ2VkIHRoaXMgd2F5LiBTZXNzaW9uIGxvYWRpbmcgY2hhbmdlcyB0aGUgcnVubmluZyBnYW1lIGFuZCBjYW4gYWZmZWN0IGEgc2F2ZWQgY2hhcmFjdGVyLCBhbmQgdGhlIHN0YWdlZCBtb2QgaXMgZ29uZSBhdCB0aGUgbmV4dCBsYXVuY2guICoqU2F2ZSBpdCBhcyBhIGZpbGUqKiBleHBvcnRzIHRoZSBmaWxlcyBmb3IgKipJbXBvcnQgYSB6aXAqKiBvbiB0aGUgTW9kcyBzY3JlZW4sIGFuZCB0aGlzIHJvdXRlIGFsc28gd29ya3MgZm9yIGNvZGUgbW9kcyB0aGF0IG5lZWQgcGxheWVyIGNvbnNlbnQuCgojIyBDaGVjayBhIHJlcG9zaXRvcnkKCkFkZCB0aGUgcHVibGlzaGVkIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCBhcyBhIGRldmVsb3BtZW50IGRlcGVuZGVuY3kuIFNESyAxLjIzLjAtYmV0YS4zIGNhcnJpZXMgbW9kIEFQSSAyLjAuMC4gUnVuIHRoZXNlIGNvbW1hbmRzIGluIHRoZSBtb2QgcmVwb3NpdG9yeSB3aXRoIFBvd2VyU2hlbGwgNyAocHdzaCk6CgpgYGBwb3dlcnNoZWxsCnBucG0gZXhlYyBuZW8tYW5nYmFuZC1tb2QtYnVpbGQgLS1yb290IC4KcG5wbSBleGVjIG5lby1hbmdiYW5kLW1vZC1jaGVjayAuCmBgYAoKU2tpcCB0aGUgYnVpbGRlciBzdGVwIGlmIHlvdSB3cm90ZSBgcGx1Z2luLmpzYCBieSBoYW5kLiBSdW4gdGhlIHJlcG9zaXRvcnkncyB0ZXN0cyBhbmQgdHlwZWNoZWNrIHRvby4gVGhlIGNoZWNrZXIgbG9va3MgYXQgcmVxdWlyZW1lbnRzLCB1bmRlY2xhcmVkIGNvbnRleHQgcmVhZHMsIGRhbmdsaW5nIHJlZmVyZW5jZXMsIGFuZCByZWNvcmQgZmluZGluZ3MuIEl0IHRha2VzIGEgZm9sZGVyIG9yIGEgemlwLCB1c2VzIHRoZSBjdXJyZW50IGRpcmVjdG9yeSB3aGVuIHlvdSBnaXZlIG5vIHBhdGgsIGFuZCBwcmludHMgYSBKU09OIHJlcG9ydCB3aXRoIGAtLWpzb25gLiBFeGl0IGNvZGUgMCBtZWFucyBubyBibG9ja2luZyBmaW5kaW5nLCAxIG1lYW5zIGF0IGxlYXN0IG9uZSBibG9ja2luZyBmaW5kaW5nLCBhbmQgMiBtZWFucyB0aGUgY2hlY2tlciBjb3VsZCBub3QgcmVhZCB0aGUgcGF0aC4KCldoZW4gYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLWNvbnRlbnRgIGlzIGluc3RhbGxlZCwgdGhlIGNoZWNrZXIgY29tcG9zZXMgeW91ciBtb2QgYWdhaW5zdCBpdC4gSWYgdGhhdCBwYWNrYWdlIGlzIG1pc3NpbmcsIHBhc3MgYC0tYmFzZSA8ZGlyPmAgd2l0aCBhIHBpbm5lZCBjb250ZW50IHBhY2suIFBhdGNoZXMgYW5kIGNyb3NzLXBhY2sgcmVmZXJlbmNlcyBhcmUgb25seSB2ZXJpZmllZCB0byBjb21wb3NlIHdoZW4gdGhlIGNoZWNrIHJ1bnMgYWdhaW5zdCBiYXNlIGNvbnRlbnQuIFtQbHVnaW4gdGVzdGluZ10oUExVR0lOX1RFU1RJTkcubWQpIGNvdmVycyBjb21wb3NpdGlvbiBhbmQgYmVoYXZpb3IgdGVzdHMgYWdhaW5zdCB0aGUgcHVibGljIHBhY2thZ2VzLgoKYC0tZmlyc3QtcGFydHlgIGlzIGZvciB0aGUgZ2FtZSdzIG93biBtb2RzLiBUaGUgZmxhZyBhbGxvd3MgdGhlIGZpcnN0LXBhcnR5IGNhcGFiaWxpdHkgdm9jYWJ1bGFyeSBkdXJpbmcgY2hlY2tpbmcgYW5kIGNoYW5nZXMgbm90aGluZyBlbHNlLiBBIGRpc3RyaWJ1dGVkIG1vZCBjaGVja2VkIHdpdGggaXQgaXMgc3RpbGwgYSB0aGlyZC1wYXJ0eSBtb2QuCgojIyBSdW4gY2hlY2tzIGluIENJCgpQdXQgdGhlIFNESyBpbiB0aGUgbW9kJ3MgZGV2ZWxvcG1lbnQgZGVwZW5kZW5jaWVzIGFuZCBjb21taXQgdGhlIGxvY2tmaWxlLiBUaGUgQ0kgam9iIHRoZW4gaW5zdGFsbHMgZnJvbSB0aGUgbG9ja2ZpbGUsIGJ1aWxkcyBhIGNvbXBpbGVkIHBsdWdpbiBpZiB0aGUgbW9kIGhhcyBvbmUsIGFuZCBydW5zIHRoZSBjaGVja2VyIGFuZCB0aGUgcmVwb3NpdG9yeSdzIHZlcmlmaWNhdGlvbiBzY3JpcHQuIExlYXZlIGAtLWZpcnN0LXBhcnR5YCBvdXQgb2YgYSB0aGlyZC1wYXJ0eSBtb2QncyBjaGVjayBjb21tYW5kLgoKYGBgeWFtbAotIHJ1bjogcG5wbSBpbnN0YWxsIC0tZnJvemVuLWxvY2tmaWxlCi0gcnVuOiBwbnBtIGV4ZWMgbmVvLWFuZ2JhbmQtbW9kLWNoZWNrIC4KLSBydW46IHBucG0gdmVyaWZ5CmBgYAoKSGF2ZSB0aGUgdmVyaWZpY2F0aW9uIHNjcmlwdCBjaGVjayB0aGUgY29tbWl0dGVkIHBsdWdpbiBhcnRpZmFjdCBhbG9uZyB3aXRoIHR5cGVzIGFuZCB0ZXN0cy4gQWZ0ZXIgYW55IHNvdXJjZSBjaGFuZ2UsIHJlYnVpbGQgYW5kIGNvbW1pdCBgcGx1Z2luLmpzYCBiZWZvcmUgeW91IHB1Ymxpc2guIFRoZSBnYW1lJ3MgbG9hZGVyIHJlYWRzIHRoYXQgZmlsZSBkaXJlY3RseSBhbmQgbmV2ZXIgY29tcGlsZXMgVHlwZVNjcmlwdC4KCiMjIFNoYXJlIHRoZSBmb2xkZXIgb3IgcmVwb3NpdG9yeQoKS2VlcCBgbWFuaWZlc3QuanNvbmAgYXQgdGhlIG1vZCByb290IGFuZCBpbmNsdWRlIGV2ZXJ5IHJ1bnRpbWUgZmlsZSB0aGUgbWFuaWZlc3QgZGVjbGFyZXMuIEEgemlwIGhvbGRzIHRoZSBzYW1lIGZpbGVzLiBJZiB0aGUgc291cmNlIG5lZWRzIGNvbXBpbGluZywgdGhlIHJlcG9zaXRvcnkgYWxzbyBob2xkcyB0aGUgYnVpbHQgYHBsdWdpbi5qc2AuIFNoYXJlIHRoZSByZXBvc2l0b3J5IGFkZHJlc3MgZGVjbGFyZWQgaW4gdGhlIG1hbmlmZXN0LiBUaGUgaW5zdGFsbGVyIHBpbnMgdGhhdCBvcmlnaW4gYW5kIHJlamVjdHMgYSByZXBsYWNlbWVudCBmcm9tIGFueSBvdGhlciByZXBvc2l0b3J5LgoKVG8gZGlzdHJpYnV0ZSB0aHJvdWdoIHRoZSByZXBvc2l0b3J5IGluc3RhbGxlciwgcHVibGlzaCBhIHRhZyB0aGF0IG1hdGNoZXMgdGhlIG1hbmlmZXN0IHZlcnNpb24uIFRoZSBnYW1lIHJlc29sdmVzIHRhZ3MgYWdhaW5zdCBpdHMgdXBkYXRlIGNoYW5uZWwgYW5kIGNvbXBhdGliaWxpdHkgcnVsZXMsIHNvIHB1c2hpbmcgdG8gYSBkZXZlbG9wbWVudCBicmFuY2ggYWxvbmUgcHVibGlzaGVzIG5vdGhpbmcgdG8gcGxheWVycy4gVGhlIG1hbmlmZXN0J3MgYGFwaWAgcmFuZ2UgbmFtZXMgdGhlIG1vZCBBUEkgY29udHJhY3QsIGFuZCBpdHMgYGVuZ2luZS5yYW5nZWAgYW5kIGBlbmdpbmUuYmVjYXVzZWAgc3RhdGUgd2hpY2ggZ2FtZSBidWlsZHMgdGhlIG1vZCBuZWVkcy4gU2VlIFtDb3JlJ3MgY29tcGF0aWJpbGl0eSByZWZlcmVuY2VdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9NT0RfQ09NUEFUSUJJTElUWS5tZCkuCgpCZWZvcmUgeW91IHNoYXJlIGEgcmVsZWFzZSwgaW5zdGFsbCB0aGUgZXhwb3J0ZWQgZm9sZGVyIG9yIHppcCB0aHJvdWdoIHRoZSBnYW1lJ3MgTW9kcyBzY3JlZW4uIFRoZSBpbnN0YWxsZXIgc2hvd3MgdGhlIG1vZCdzIGlkZW50aXR5LCBsaWNlbnNlLCBjb250ZW50IGNoYW5nZXMsIGFuZCBjYXBhYmlsaXR5IHJlcXVlc3RzLCBhbmQgdGhlIHBsYXllciBjaG9vc2VzIHdoZXRoZXIgdG8gaW5zdGFsbCBhbmQgZW5hYmxlIGl0LiBbQ29yZSdzIGluc3RhbGxhdGlvbiBndWlkZV0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9NT0RTLm1kKSB3YWxrcyB0aHJvdWdoIHRoZSBwbGF5ZXIgc2lkZSwgYW5kIFtyZXF1aXJlbWVudHNdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9SRVFVSVJFTUVOVFMubWQpIGxpc3RzIHRoZSBjaGVja3MgdGhlIGluc3RhbGxlciBydW5zLgo="
  },
  {
    "id": "plugins",
    "path": "PLUGINS.md",
    "audience": "advanced",
    "title": "Plugin API",
    "note": "plugin.js, hooks, resources, regions, capabilities, and testing.",
    "source": "sdk",
    "encoded": "IyBNb2QgcGx1Z2luczogc2hpcHBpbmcgQ09ERSBpbiBhIG1vZCBmb2xkZXIKCkEgbW9kIHRoYXQgb25seSBjaGFuZ2VzIHJlY29yZHMgbmVlZHMgbm8gY29kZTogZHJvcCBgbWFuaWZlc3QuanNvbmAgcGx1cyBvbmUKYDxyZWNvcmQtdHlwZT4uanNvbmAgcGVyIHRoaW5nIHlvdSBjaGFuZ2UgaW50byBhIGZvbGRlciBhbmQgeW91IGFyZSBkb25lIChzZWUKWy4uL01PRFMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvTU9EUy5tZCkpLiBUaGlzIGRvY3VtZW50IGlzIGZvciB0aGUgb3RoZXIga2luZDogYSBtb2QgdGhhdCBjaGFuZ2VzCipiZWhhdmlvdXIqLgoKPiAqKkEgYnJlYWtpbmcgbW9kIEFQSSBjaGFuZ2UgaXMgbm93IGEgTUFKT1IgdmVyc2lvbiBidW1wLioqIEJlZm9yZSAxLjAsIHRoZQo+IEFQSSBjb3VsZCBjaGFuZ2Ugb24gYW55IG1pbm9yIHJlbGVhc2U7IGZyb20gMS4wLjAgb24sIGEgcGx1Z2luIHdyaXR0ZW4KPiBhZ2FpbnN0IHRoZSBjdXJyZW50IEFQSSBrZWVwcyBsb2FkaW5nIGFjcm9zcyBwYXRjaCBhbmQgbWlub3IgcmVsZWFzZXMsIGFuZAo+IHRoZSBkZXByZWNhdGlvbiB3aW5kb3cgZGVzY3JpYmVkIGJlbG93IHN0aWxsIGdpdmVzIGFuIGF1dGhvciBhIHJlbGVhc2Uncwo+IHdhcm5pbmcgYmVmb3JlIGEgcmVhbCBicmVhayBsYW5kcy4gU2VlIFtWZXJzaW9uIGNvbnRyYWN0XSgjdmVyc2lvbi1jb250cmFjdCkuCgojIyBUaGUgc2hhcGUKCkEgbW9kIGlzIGEgKipmb2xkZXIqKiwgYW5kIGl0IG1heSBob2xkIGFzIG11Y2ggYXMgaXQgbmVlZHMgdG86IHNldmVyYWwgc2NyaXB0cywKcmVjb3JkcywgaW1hZ2VzLCBzb3VuZHMsIGRhdGEgb2YgaXRzIG93bi4KCmBgYAptb2RzL215LW1vZC8KICBtYW5pZmVzdC5qc29uCiAgcGx1Z2luLmpzICAgICAgICAgIDwtIHRoZSBlbnRyeSBwb2ludCwgZGVmYXVsdC1leHBvcnRpbmcgYSBwbHVnaW4KICBsaWIvZGljZS5qcyAgICAgICAgPC0gbW9yZSBzY3JpcHRzOyBpbXBvcnQgdGhlbSByZWxhdGl2ZWx5CiAgbGliL2Zvcm1hdC5qcwogIG1vbnN0ZXIuanNvbiAgICAgICA8LSBhIHJlY29yZCBjb250cmlidXRpb24gKG5lZWRzIHRoZSAiY29udGVudCIgZmFjZXQgdG9vKQogIHRpbGVzL29yYy5wbmcgICAgICA8LSBhbiBpbWFnZTogYXdhaXQgY3R4LmFzc2V0VXJsKCJ0aWxlcy9vcmMucG5nIikKICBkYXRhL3NwYXducy5qc29uICAgPC0geW91ciBvd24gZGF0YSAobmVzdGVkIC5qc29uIGlzIGFuIGFzc2V0LCBub3QgYSByZWNvcmQpCiAgUkVBRE1FLm1kCmBgYAoKT25seSBgcGx1Z2luLmpzYCBpcyBsb2FkZWQgYnkgbmFtZS4gRXZlcnl0aGluZyBlbHNlIHlvdXIgY29kZSByZWFjaGVzIGl0c2VsZjoKc2NyaXB0cyBieSBpbXBvcnRpbmcgdGhlbSwgZXZlcnl0aGluZyBlbHNlIHRocm91Z2ggYGN0eC5hc3NldFVybGAuCgpgbWFuaWZlc3QuanNvbmAgbXVzdCBkZWNsYXJlIHRoZSAqKmBwbHVnaW5gIGZhY2V0KiogYW5kIGBtb2RBcGlgLiBBIHNjaGVtYSAyIG1hbmlmZXN0IGRlY2xhcmVzIGAicnVudGltZSI6ICJpbi1wcm9jZXNzImAgYW5kIGFuIGBhcGlgIHJhbmdlIGluc3RlYWQ7IHRoZSBbbWFuaWZlc3QgcmVmZXJlbmNlXShSRUFETUUubWQjdGhlLW1hbmlmZXN0LW1hbmlmZXN0anNvbikgY292ZXJzIGJvdGguCgpBIG1vZCB0aGF0IG9ubHkgcnVucyBjb2RlIGNhbiBzYXkgYCJzaGFwZSI6ICJwbHVnaW4iYCBhbmQgc3RvcCB0aGVyZS4gQSBtb2QgdGhhdApjb250cmlidXRlcyAqKmJvdGgqKiByZWNvcmRzIGFuZCBjb2RlICh0aGUgb3JkaW5hcnkgY2FzZSwgZS5nLiBhIG5ldyBtb25zdGVyCnBsdXMgdGhlIGJlaGF2aW91ciB0aGF0IG1ha2VzIGl0IGludGVyZXN0aW5nKSBsaXN0cyBib3RoIGZhY2V0czoKCmBgYGpzb24KeyAic2hhcGUiOiAiY29udGVudCIsICJmYWNldHMiOiBbImNvbnRlbnQiLCAicGx1Z2luIl0gfQpgYGAKCmBmYWNldHNgIG11c3QgY29udGFpbiBgc2hhcGVgLCBzbyB0aGUgdHdvIGNhbiBuZXZlciBjb250cmFkaWN0IGVhY2ggb3RoZXIuIEVpdGhlcgpzcGVsbGluZyB3b3JrcyAoYHNoYXBlYCBpcyBqdXN0IHRoZSBwcmltYXJ5IGtpbmQsIGFuZCB3aGF0IHRoZSBtb2QgbWFuYWdlcgpkaXNwbGF5cykuCgo+IFVudGlsIDIwMjYtMDctMjkgYHNoYXBlYCB3YXMgKipleGNsdXNpdmUqKiwgYW5kIHRoZSBsb2FkZXIgZ2F0ZWQgY29kZSBvbgo+IGAicGx1Z2luImAgd2hpbGUgY29tcG9zaXRpb24gZ2F0ZWQgcmVjb3JkcyBvbiBgImNvbnRlbnQiYC4gQSBmb2xkZXIgbGlrZSB0aGUgb25lCj4gYWJvdmUgdGhlcmVmb3JlIGNvdWxkIG5vdCB3b3JrOiBkZWNsYXJpbmcgYHBsdWdpbmAgZHJvcHBlZCBgbW9uc3Rlci5qc29uYAo+IHNpbGVudGx5LCBhbmQgZGVjbGFyaW5nIGBjb250ZW50YCByZWZ1c2VkIHRoZSBjb2RlLiBJZiB5b3Ugd3JvdGUgYSBtb2QgYWdhaW5zdAo+IHRoZSBvbGRlciB0ZXh0IGFuZCBmb3VuZCBoYWxmIG9mIGl0IGluZXJ0LCB0aGF0IHdhcyB0aGlzLCBhbmQgYGZhY2V0c2AgaXMgdGhlIGZpeC4KCmBgYGpzb24KewogICJpZCI6ICJteS1tb2QiLAogICJuYW1lIjogIk15IE1vZCIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJwbHVnaW4iLAogICJtb2RBcGkiOiAxLAogICJhZmZlY3RzR2FtZXBsYXkiOiB0cnVlLAogICJjYXBhYmlsaXRpZXMiOiBbInJlZ2lzdHJ5OmVmZmVjdCJdLAogICJkZXNjcmlwdGlvbiI6ICJXaGF0IHRoaXMgZG9lcywgaW4geW91ciBvd24gd29yZHMuIFRoZSBtb2QgbWFuYWdlciBzaG93cyB0aGlzLiIKfQpgYGAKCmBwbHVnaW4uanNgOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKCiAgLy8gQmVoYXZpb3VyOiBmb2xkZWQgaW50byB0aGUgb25lIE1vZEhvb2tzIHRoZSBlbmdpbmUgY29uc3VsdHMuCiAgaG9va3MoY3R4KSB7CiAgICBpZiAoIWN0eC5mbGFncy5teVRvZ2dsZSkgcmV0dXJuIHVuZGVmaW5lZDsgICAvLyBhIHJ1bGUgdGhlIHBsYXllciB0dXJuZWQgb2ZmCiAgICByZXR1cm4gewogICAgICBtZXNzYWdlVGV4dDogKHJhdykgPT4gcmF3LnJlcGxhY2UoIllvdSBoYXZlIiwgIlRob3UgaGFzdCIpLAogICAgfTsKICB9LAoKICAvLyBTeXN0ZW0gb3ZlcnJpZGVzOiBjYXBhYmlsaXR5LWdhdGVkIHJlZ2lzdHJpZXMuCiAgcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgICBob3N0LmVmZmVjdHMucmVnaXN0ZXIoIk1ZX0VGRkVDVCIsIHsKICAgICAgaGFuZGxlcjogKGNvbnRleHQpID0+IHsgLyogcnVucyBpbnNpZGUgZWZmZWN0X2RvLCBsaXZlIHN0YXRlICovIHJldHVybiB0cnVlOyB9LAogICAgfSk7CiAgfSwKfTsKYGBgCgpBIHJlZ2lzdGVyZWQgZWZmZWN0J3MgbmFtZSBtdXN0IG5vdCBjb250YWluIGEgY29sb24gaWYgYSByZWNvcmQgbmFtZXMgaXQ6IGEgcmVjb3JkJ3MgZWZmZWN0IGxpbmUgcmVhZHMgYG5hbWU6dHlwZTpyYWRpdXM6b3RoZXJgLCBzbyBhIGNvbG9uIGluc2lkZSB0aGUgbmFtZSBzcGxpdHMgaXQgYW5kIHRoZSByZWNvcmQgZmFpbHMgdG8gbG9hZC4KCkV2ZXJ5IG1lbWJlciBpcyBvcHRpb25hbCwgYW5kIHRoZSB0d28gYWJvdmUgYXJlIG9ubHkgdGhlIHR3byBtb3N0IGNvbW1vbi4gVGhlCmZ1bGwgc2V0IGlzIGBob29rc2AsIGByZWdpc3RlcmAsIGBjb250cm9sbGVyYCwgYGZyb250ZW5kYCwgYGh1ZGAsIGBtZW51YCwKYHNjcmVlbmAgYW5kIGByZWdpb25zYCwgcGx1cyBgbWlncmF0ZUJhZ2AgYW5kIGB1bmluc3RhbGxgLiBBIHBsdWdpbiBpcyByZWZ1c2VkCm9ubHkgd2hlbiBBTEwgZWlnaHQgb2YgdGhlIGZpcnN0IGdyb3VwIGFyZSBhYnNlbnQsIGJlY2F1c2UgYSBtb2Qgd2l0aCBubyBjb2RlCnNpbXBseSBzaGlwcyBubyBgcGx1Z2luLmpzYCAtIHNvIGEgcGx1Z2luIHdob3NlIG9ubHkgbWVtYmVyIGlzIGBmcm9udGVuZGAsIG9yCmBjb250cm9sbGVyYCwgb3IgYHJlZ2lvbnNgLCBsb2FkcyBmaW5lLiBgbWlncmF0ZUJhZ2AgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IGNvdW50CmFzIGNvZGUgb2YgaXRzIG93bjogYSBwbHVnaW4gdGhhdCBjYW4gb25seSBtaWdyYXRlIGEgYmFnIGl0IG5ldmVyIHdyaXRlcyBoYXMKbm90aGluZyB0byBtaWdyYXRlLgoKIyMgTnVtYmVycyB0aGUgcGxheWVyIHNldHMKCkEgc3dpdGNoIGlzIGEgcnVsZS4gRm9yIGEgbnVtYmVyLCBzdWNoIGFzIGhvdyBzdHJvbmcgYW4gZWZmZWN0IGlzLCBkZWNsYXJlIGEgc2V0dGluZyBpbiBgbWFuaWZlc3QuanNvbmAgYW5kIHJlYWQgaXQgZnJvbSBgY3R4LnNldHRpbmdzYDoKCmBgYGpzb24KInJ1bGVzIjogW3sgImZsYWciOiAiZnguY3J0IiwgInRpdGxlIjogIkNSVCBlZmZlY3QiLCAiZGVzY3JpcHRpb24iOiAiU2NhbmxpbmVzIG92ZXIgdGhlIG1hcC4iLCAiZGVmYXVsdCI6IHRydWUgfV0sCiJzZXR0aW5ncyI6IFt7CiAgImlkIjogImNydFN0cmVuZ3RoIiwgInRpdGxlIjogIkNSVCBzdHJlbmd0aCIsICJkZXNjcmlwdGlvbiI6ICJIb3cgc3Ryb25nIHRoZSBzY2FubGluZXMgYXJlLiIsCiAgIm1pbiI6IDAsICJtYXgiOiAxMDAsICJzdGVwIjogNSwgImRlZmF1bHQiOiA2MCwgInVuaXQiOiAiJSIsICJwYXJlbnQiOiAiZnguY3J0Igp9XQpgYGAKCmBgYGpzCmh1ZChjdHgpIHsKICBsZXQgc3RyZW5ndGggPSBjdHguc2V0dGluZ3M/LmdldCgiY3J0U3RyZW5ndGgiKSA/PyA2MDsKICBjdHguc2V0dGluZ3M/Lm9uQ2hhbmdlKChpZCwgdmFsdWUpID0+IHsgaWYgKGlkID09PSAiY3J0U3RyZW5ndGgiKSBzdHJlbmd0aCA9IHZhbHVlOyB9KTsKICAvLyBkcmF3IHRoZSBzY2FubGluZXMgYXQgc3RyZW5ndGggLyAxMDAKfQpgYGAKClRoZSB2YWx1ZSBpcyBhbHdheXMgaW5zaWRlIHRoZSByYW5nZSBhbmQgb24gYSBzdGVwLCBzbyB0aGUgY29kZSBuZXZlciBjaGVja3MgaXQuIGBjdHguc2V0dGluZ3NgIGlzIHVuZGVmaW5lZCBvbiBhbiBlbmdpbmUgd2l0aG91dCB0aGUgc2VhbSwgd2hpY2ggaXMgd2h5IHRoZSBleGFtcGxlIGZhbGxzIGJhY2sgdG8gdGhlIGRlZmF1bHQuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHldKE1PRF9TRUFNUy5tZCM0eS1udW1lcmljLXNldHRpbmdzKSBmb3IgdGhlIHJvdyBvbiB0aGUgTW9kcyBzY3JlZW4gYW5kIHJlbG9hZCBiZWhhdmlvdXIuCgojIyBZb3VyIG93biBzYXZlZCBkYXRhLCBhbmQgY2hhbmdpbmcgaXRzIHNoYXBlCgpZb3UgbWF5IGtlZXAgd2hhdGV2ZXIgSlNPTiB5b3UgbGlrZSBpbiB0aGUgcGxheWVyJ3Mgc2F2ZSwgdW5kZXIgeW91ciBtb2QncyBpZC4KVGhlIGVuZ2luZSByb3VuZC10cmlwcyBpdCB2ZXJiYXRpbSBhbmQgbmV2ZXIgcmVhZHMgaXQuIEl0IGlzIHN0b3JlZCB3aXRoIGEKYHNjaGVtYWAgbnVtYmVyLCB3aGF0ZXZlciB5b3VyIG1hbmlmZXN0J3MgYHNhdmVTY2hlbWFgIHdhcyB3aGVuIGl0IHdhcyB3cml0dGVuLgoKKipUaGUgYmFnIGlzIG5vdCBvbiBgY3R4LnN0YXRlYC4qKiBgR2FtZVN0YXRlYCBkb2VzIG5vdCBjYXJyeSB0aGUgYmFncyBhdCBhbGw7CnRoZXkgbGl2ZSBvbiB0aGUgYFN0YXJ0ZWRHYW1lYCB0aGUgaG9zdCBob2xkcywgd2hpY2ggaXMgd2hhdCBgc2F2ZUdhbWVgIHJlYWRzLgpZb3VyIGhhbmRsZSBvbiB5b3VyIG93biBiYWcgaXMgdGhlIGBkYXRhYCBhcmd1bWVudCBgbWlncmF0ZUJhZ2AgaXMgZ2l2ZW4sIGFuZCB0aGUKdmFsdWUgdGhlIGhvc3Qgd3JpdGVzIGJhY2sgZm9yIHlvdS4gUmVhY2hpbmcgZm9yIGBjdHguc3RhdGUubW9kc2AgZmluZHMgbm90aGluZywKYmVjYXVzZSB0aGVyZSBpcyBubyBzdWNoIGZpZWxkLgoKKipgbWlncmF0ZUJhZ2AgaXMgbm90IGEgV1JJVEUgc2VhbS4qKiBJdCBvbmx5IGJyaW5ncyBhbiBvbGQgYmFnIGZvcndhcmQgYXQKbW9kLWxvYWQgdGltZTsgaXQgZ2l2ZXMgeW91IG5vIHdheSB0byB3cml0ZSBhIG5ldyBvbmUgZHVyaW5nIHBsYXkuIEZvciB0aGF0LAp1c2UgYGN0eC5jaGFyYWN0ZXJTdG9yZWAgKG5lby1hbmdiYW5kIzE3MSk6IGBnZXQoKWAgYW5kIGBzZXQodmFsdWUpYCBvbiB5b3VyCm93biBiYWcsIGxpdmUsIGtleWVkIHRvIHRoZSBhY3R1YWwgY2hhcmFjdGVyIHJhdGhlciB0aGFuIHRvIGEgZmluZ2VycHJpbnQgb2YKb25lLiBCZWZvcmUgdGhpcyBleGlzdGVkLCBhIG1vZCB0aGF0IG5lZWRlZCB0byByZW1lbWJlciBzb21ldGhpbmcgYWJvdXQgYQpjaGFyYWN0ZXIgaGFkIHRvIGFwcHJveGltYXRlIGEgc2F2ZSBrZXkgZnJvbSBiaXJ0aC1maXhlZCBmYWN0cyAobmFtZSwgcmFjZSwKY2xhc3MsIGJpcnRoIHN0YXRzKSBhbmQga2VlcCBpdCBpbiBgY3R4LnByZWZzYCBpbnN0ZWFkLiBUaGF0IHN0b3JlIGNvdmVycyB0aGUKd2hvbGUgaW5zdGFsbCByYXRoZXIgdGhhbiBvbmUgY2hhcmFjdGVyLCBzbyBpdCBjb2xsaWRlcyBiZXR3ZWVuIHR3bwpjaGFyYWN0ZXJzIHdobyBoYXBwZW4gdG8gbWF0Y2ggb24gYWxsIG9mIHRob3NlIGZhY3RzLiBgY3R4LmNoYXJhY3RlclN0b3JlLnNldCgpYApzdGFtcHMgeW91ciB3cml0ZSB3aXRoIHdoYXRldmVyIGBzYXZlU2NoZW1hYCB5b3VyIG1hbmlmZXN0IGN1cnJlbnRseSBkZWNsYXJlcywKc28gYG1pZ3JhdGVCYWdgIHN0aWxsIHNlZXMgYSBjb2hlcmVudCBudW1iZXIgb24gdGhlIG5leHQgbG9hZC4KCldoZW4geW91IGNoYW5nZSB0aGUgU0hBUEUgb2YgdGhhdCBkYXRhLCBidW1wIGBzYXZlU2NoZW1hYCBhbmQgc2hpcCBhCmBtaWdyYXRlQmFnYDoKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCiAgaG9va3MoY3R4KSB7IC8qIC4uLiAqLyB9LAoKICAvLyBDYWxsZWQgYXQgbW9kLWxvYWQgdGltZSwgQkVGT1JFIHJlZ2lzdGVyKCksIHdoZW4gdGhlIGJhZyBpbiB0aGUgc2F2ZSBpcwogIC8vIGJlaGluZCB5b3VyIG1hbmlmZXN0J3Mgc2F2ZVNjaGVtYS4gUmV0dXJuIHRoZSBzYW1lIGRhdGEgaW4gdGhlIG5ldyBzaGFwZS4KICBtaWdyYXRlQmFnKGRhdGEsIGZyb21TY2hlbWEsIGN0eCkgewogICAgaWYgKGZyb21TY2hlbWEgPCAyKSByZXR1cm4geyBraWxsczogT2JqZWN0LmtleXMoZGF0YS5raWxsZWQgPz8ge30pLmxlbmd0aCB9OwogICAgcmV0dXJuIGRhdGE7CiAgfSwKfTsKYGBgCgpPbmx5IHlvdSBjYW4gZG8gdGhpczogbm9ib2R5IGVsc2Uga25vd3Mgd2hhdCBpcyBpbiB0aGVyZS4gV2hhdCB0aGUgZ2FtZSBkb2VzCmFyb3VuZCBpdDoKCnwgU2l0dWF0aW9uIHwgV2hhdCBoYXBwZW5zIHwKfC0tLXwtLS18CnwgYmFnIGJlaGluZCBgc2F2ZVNjaGVtYWAsIGBtaWdyYXRlQmFnYCBwcmVzZW50IHwgaXQgcnVucywgYW5kIHRoZSBzY2hlbWEgaXMgc3RhbXBlZCBmb3J3YXJkIHwKfCBiYWcgYmVoaW5kIGBzYXZlU2NoZW1hYCwgKipubyoqIGBtaWdyYXRlQmFnYCB8IHRoZSBvbGQgZGF0YSBpcyBrZXB0ICoqZXhhY3RseSBhcyBpdCB3YXMqKiwgYW5kIHRoZSBwbGF5ZXIgaXMgdG9sZCB5b3VyIG1vZCBoYXMgZGF0YSBpdCBtYXkgbm90IHVuZGVyc3RhbmQuIFRoZSBzY2hlbWEgaXMgKm5vdCogc3RhbXBlZCBmb3J3YXJkLCBzbyB5b3Ugd291bGQgYmUgaGFuZGVkIG9sZCBkYXRhIGxhYmVsbGVkIG5ldyB8CnwgYG1pZ3JhdGVCYWdgIHRocm93cywgb3IgcmV0dXJucyBub3RoaW5nIHwgdGhlIG9sZCBiYWcgc3RhbmRzLCBhbmQgdGhlIHJlYXNvbiBnb2VzIG9uIHlvdXIgbW9kJ3Mgcm93IHwKfCBiYWcgKiphaGVhZCoqIG9mIGBzYXZlU2NoZW1hYCAodGhlIHBsYXllciByb2xsZWQgeW91IGJhY2spIHwgbm90aGluZyBpcyBjaGFuZ2VkLCBhbmQgdGhlIHBsYXllciBpcyB0b2xkLiBBIG1pZ3JhdGlvbiBiYWNrd2FyZHMgaXMgc29tZXRoaW5nIG9ubHkgeW91IGNvdWxkIHdyaXRlIHwKfCB5b3UgZGVjbGFyZSBubyBgc2F2ZVNjaGVtYWAgfCBub3RoaW5nIGhhcHBlbnMsIGV2ZXIgfAoKSWYgeW91IHdvdWxkIHJhdGhlciBicmFuY2ggb24gdGhlIHNjaGVtYSBpbmxpbmUgdGhhbiBzaGlwIGEgbWlncmF0b3IsIHlvdSBjYW46CnRoZSBiYWcgY2FycmllcyBpdHMgb3duIGBzY2hlbWFgIGFuZCB5b3UgY2FuIHJlYWQgaXQuIE9taXR0aW5nIGBtaWdyYXRlQmFnYAoqYWZ0ZXIqIGJ1bXBpbmcgYHNhdmVTY2hlbWFgIGlzIHRoZSBjYXNlIHRoZSBnYW1lIHJlcG9ydHMsIGJlY2F1c2UgaXQgY2Fubm90IHRlbGwKdGhhdCBhcGFydCBmcm9tIGFuIG92ZXJzaWdodC4KCiMjIFdoeSB0aGUgZW5naW5lIGlzIG5vdCBpbXBvcnRlZAoKYGN0eC5jb3JlYCBpcyB0aGUgZW5naW5lOiB0aGUgc2FtZSBsaXZlIG1vZHVsZSBpbnN0YW5jZSB0aGUgZ2FtZSBpcyBydW5uaW5nIG9uLCBoYW5kZWQgdG8geW91ciBwbHVnaW4gaW5zdGVhZCBvZiBpbXBvcnRlZC4KCkEgYmFyZSBzcGVjaWZpZXIgbGlrZSBgaW1wb3J0IHsgdHVubmVsQXV4IH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtY29yZSJgIGNhbm5vdCByZXNvbHZlIGluIGEgbW9kdWxlIGZldGNoZWQgZnJvbSBhIGZvbGRlci4gQnVuZGxpbmcgdGhlIGVuZ2luZSBpbnRvIHlvdXIgcGx1Z2luIHdvdWxkIGJlIHdvcnNlOiB5b3Ugd291bGQgZ2V0IHlvdXIgb3duIGNvcHkgb2YgZXZlcnkgcmVnaXN0cnkgYW5kIHNpbmdsZXRvbiwgc28geW91ciBlZmZlY3QgaGFuZGxlciB3b3VsZCBsYW5kIG9uIGEgcmVnaXN0cnkgdGhlIGludGVycHJldGVyIG5ldmVyIGNvbnN1bHRzLCBhbmQgeW91ciBtb2Qgd291bGQgZG8gbm90aGluZyBhdCBhbGwsIHdpdGggbm8gZXJyb3IgYW55d2hlcmUuIFBhc3NpbmcgaW4gdGhlIG9uZSBsaXZlIGluc3RhbmNlIHJ1bGVzIHRoYXQgZmFpbHVyZSBvdXQuCgpXaGF0IGBjdHhgIGNhcnJpZXM6Cgp8IEZpZWxkIHwgV2hhdCBpdCBpcyB8CnwtLS18LS0tfAp8IGBpZGAgfCB5b3VyIG1vZCdzIGlkLCB3aGljaCBpcyBhbHNvIGl0cyBmb2xkZXIgbmFtZSB8CnwgYGFwaWAgfCB0aGUgQUJJIHZlcnNpb24gdGhlIGhvc3QgaW1wbGVtZW50cyB8CnwgYGVuZ2luZWAgfCB0aGUgZW5naW5lIHZlcnNpb24sIGZvciB3aGVuIHlvdSB3b3VsZCByYXRoZXIgYWRhcHQgdGhhbiByZWZ1c2UgfAp8IGBmbGFnc2AgfCB5b3VyIG93biByZXNvbHZlZCBydWxlIHRvZ2dsZXMsIGBjaG9pY2VzW2ZsYWddID8/IHJ1bGUuZGVmYXVsdGAsIHNsaWNlZCB0byB0aGUgcnVsZXMgeW91ciBtYW5pZmVzdCBkZWNsYXJlcyB8CnwgYGNvcmVgIHwgdGhlIGxpdmUgZW5naW5lIG5hbWVzcGFjZSwgd2hpY2ggaXMgY29yZSdzIGVudGlyZSBwdWJsaWMgQVBJLiBBIG5hbWVkIHN1YnNldCBpcyBndWFyYW50ZWVkLCBhbmQgdGhlIHJlc3QgaXMgYW4gZXNjYXBlIGhhdGNoLiBTZWUgW01PRF9DT01QQVRJQklMSVRZLm1kXShNT0RfQ09NUEFUSUJJTElUWS5tZCkgfAp8IGBzdGF0ZWAgfCB0aGUgbGl2ZSBgR2FtZVN0YXRlYC4gVGhlIGhvc3QgcGFzc2VzIGl0IHRvIGByZWdpc3RlcmAsIGBtaWdyYXRlQmFnYCwgYGNvbnRyb2xsZXJgLCBhbmQgZXZlcnkgZGlzcGxheSBzZWFtLiBgaG9va3NgIG5ldmVyIGdldHMgaXQsIGJlY2F1c2UgdGhlIGhvc3QgY29tcG9zZXMgaG9va3MgYmVmb3JlIGEgZ2FtZSBleGlzdHMgfAp8IGBhc3NldFVybGAgfCBgKHBhdGgpID0+IFByb21pc2U8c3RyaW5nIFx8IG51bGw+YCwgd2hpY2ggZ2l2ZXMgYSBVUkwgZm9yIG9uZSBvZiB5b3VyIG93biBmaWxlcyB8CnwgYGRhdGFgIHwgeW91ciBvd24gcmVjb3JkIGZpbGVzLCBwYXJzZWQsIHdpdGgga2V5cyB0aGF0IG9taXQgYC5qc29uYCB8CnwgYHByZWZzYCB8IGB7IGdldCgpLCBzZXQodmFsdWUpIH1gLCBvbmUgSlNPTiB2YWx1ZSB0aGF0IGJlbG9uZ3MgdG8geW91ciBtb2QgYW5kIGlzIGtlcHQgb3V0c2lkZSBldmVyeSBzYXZlIHwKfCBgbmV3Q2hhcmFjdGVyYCB8IHdoZXRoZXIgdGhpcyBzZXNzaW9uJ3MgY2hhcmFjdGVyIHdhcyBqdXN0IGNyZWF0ZWQgaW5zdGVhZCBvZiBsb2FkZWQgfAp8IGByZWdpc3RyaWVzYCB8IHRoZSB3aG9sZSBib3VuZCBgQ29yZVJlZ2lzdHJpZXNgOiBldmVyeSByYWNlLCBraW5kLCBmZWF0dXJlLCB0cmFwLCBzdG9yZSwgcHJvamVjdGlvbiwgcm9vbSwgcHJvZmlsZSwgY29uc3RhbnQsIHF1ZXN0LCBhbmQgaGludCB0aGlzIHNlc3Npb24gcnVucyBvbi4gQWJzZW50IGR1cmluZyBjb250ZW50IGNvbXBvc2l0aW9uIHwKfCBgbG9nYCB8IHdyaXRlcyBhIGRpYWdub3N0aWMgbGluZSwgYW5kIHRoZSBob3N0IGRlY2lkZXMgd2hlcmUgaXQgZ29lcyB8CnwgYGJhY2t1cEZvbGRlcmAgfCBgeyBuYW1lKCksIGNob29zZSgpLCBmb3JnZXQoKSwgd3JpdGUobmFtZSwgdGV4dCksIG9uU2F2ZShmbiksIGxpc3QoKSB9YCwgYSBmb2xkZXIgdGhlIHBsYXllciBjaG9vc2VzIGZvciBhdXRvbWF0aWMgc2F2ZSBiYWNrdXBzLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBiYWNrdXA6Zm9sZGVyYCBhbmQgdGhlIHBsYXRmb3JtIGNhbiBvZmZlciBhIGZvbGRlciBwaWNrZXIuIEl0IGlzIGFic2VudCBldmVyeXdoZXJlIGVsc2UsIHNvIHRlc3QgZm9yIGl0IGJlZm9yZSB1c2luZyBpdC4gT24gZGVza3RvcCwgYWNjZXNzIGFsc28gbmVlZHMgY3VycmVudCBwbGF5ZXIgY29uc2VudCBhbmQgYSBuYXRpdmUgZGVjaXNpb24gZm9yIHRoaXMgaW5zdGFsbGF0aW9uLCBhbmQgdGhlIGluc3RhbGxhdGlvbiBnZXRzIGl0cyBvd24gc3ViZm9sZGVyIGZvciBpdHMgaWQgYW5kIHBheWxvYWQgZGlnZXN0LiBgbGlzdCgpYCAoIzI0KSBpZGVudGlmaWVzIGAubmVvY2hhcmAgZmlsZXMgYnkgbGluZWFnZSBhbmQgY2hhcmFjdGVyIG5hbWUvbGV2ZWwgd2l0aG91dCBkZWNvZGluZyBvciBpbXBvcnRpbmcgYW55IHNhdmUuIE9uIGRlc2t0b3AsIHJlYWRpbmcgYSBmaWxlIG5lZWRzIGEgbmF0aXZlIGNvbmZpcm1hdGlvbiwgYW5kIHRoZSB1bmRlcmx5aW5nIElQQyBsaXN0aW5nIHJldHVybnMgb25seSBuYW1lcyBhbmQgc2l6ZXMgfAp8IGBkZWJ1Z2AgfCBgeyBzcGF3bk9iamVjdChraW5kKSwgc3Bhd25Nb25zdGVyKHJhY2UpIH1gLCB3aGljaCBjb25qdXJlcyBvbmUgaXRlbSBvciBjcmVhdHVyZSBpbnRvIHRoZSBsaXZlIGdhbWUuIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYGRlYnVnOnNwYXduYCBhbmQgYSBnYW1lIGV4aXN0cyB0byBjb25qdXJlIGludG8uIFRoZSBmaXJzdCB1c2UgaW4gYSBjaGFyYWN0ZXIgYXNrcyB0aGUgZ2FtZSdzIG93biBkZWJ1ZyBxdWVzdGlvbiBhbmQgbWFya3MgdGhhdCBjaGFyYWN0ZXIgcGVybWFuZW50bHksIHNvIHRlbGwgdGhlIHBsYXllciBiZWZvcmUgdGhleSBwcmVzcyB5b3VyIGJ1dHRvbiB8CnwgYHdpemFyZGAgfCB0aGUgZ2FtZSdzIHdob2xlIGRlYnVnIHNldCAoZGVwdGgsIGV4cGVyaWVuY2UsIGdvbGQsIHN0YXRzLCBhY3F1aXJlbWVudCwgYW5kIG1hcHBpbmcpIHBsdXMgYSBjYXRhbG9ndWUgb2YgZXZlcnkgaXRlbSwgY3JlYXR1cmUsIGFuZCBhcnRpZmFjdCB0aGlzIGdhbWUgaGFzIGFuZCB0aGUgcGFjayB0aGF0IGFkZGVkIGVhY2ggb25lLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBkZWJ1Zzp3aXphcmRgIGFuZCBhIGdhbWUgZXhpc3RzIHRvIGRyaXZlLiBObyBtZXRob2Qgd29ya3MgdW50aWwgeW91IGNhbGwgYHNhbmRib3goKWAuIFRoYXQgY2FsbCBkZXRhY2hlcyB0aGUgc2Vzc2lvbiBmcm9tIGl0cyBzYXZlIHNsb3QgYW5kIGNhbm5vdCBiZSB1bmRvbmU6IHRoZSBjaGFyYWN0ZXIgb24gZGlzayBrZWVwcyB3aGF0ZXZlciB0aGUgbGFzdCBzYXZlIGxlZnQsIGFuZCBub3RoaW5nIGFmdGVyIHRoYXQgcG9pbnQgaXMgd3JpdHRlbi4gQ2FsbCBgYXR0YWNoZWQoKWAgZmlyc3QgdG8gZ2V0IHRoZSBuYW1lIHRvIHVzZSBpbiB0aGUgcXVlc3Rpb24geW91IHB1dCB0byB0aGUgcGxheWVyLiBTZWUgYE1PRF9TRUFNUy5tZGAgc2VjdGlvbiA0ZiB8CnwgYGluc3RhbGxNb2RgIHwgYChieXRlcykgPT4gUHJvbWlzZTx7b2ssIGlkLCB2ZXJzaW9uLCBsaW5lc30gXHwge29rLCBwcm9ibGVtLCBsaW5lc30+YCwgd2hpY2ggaW5zdGFsbHMgYSBjb250ZW50IG1vZCBmcm9tIHRoZSBieXRlcyBvZiBhbiBhcmNoaXZlLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBtb2Q6aW5zdGFsbGAuIENvZGUgaXMgcmVmdXNlZC4gQW4gaW5zdGFsbGVkIG1vZCBhcnJpdmVzIHN3aXRjaGVkIG9mZiwgdGhlIHBsYXllciBlbmFibGVzIGl0LCBhbmQgaXQgdGFrZXMgZWZmZWN0IG9uIHJlbG9hZC4gYGxpbmVzYCBob2xkcyB0aGUgdGV4dCB0aGUgTW9kcyBzY3JlZW4gcHJpbnRzIGZvciB0aGUgc2FtZSBvdXRjb21lLCBpbmNsdWRpbmcgcGVyLXJlcXVpcmVtZW50IHJvd3MsIHNvIHByaW50IGl0IGluc3RlYWQgb2Ygd3JpdGluZyB5b3VyIG93biB3b3JkaW5nIGZvciB0aGUgc2FtZSByZXN1bHQgfAp8IGByZWxvYWRHYW1lYCB8IGAoKSA9PiBQcm9taXNlPHZvaWQ+YCwgdGhlIGdhbWUncyBvd24gbW9kLWNoYW5nZSByZWxvYWQuIEl0IHJ1bnMgZXZlcnkgcGx1Z2luJ3MgYHVuaW5zdGFsbCgpYCwgaGFuZHMgdGhlIGF1dG9wbGF5ZXIncyBrZXlib2FyZCBiYWNrLCB3cml0ZXMgZG93biB0aGUgbGl2ZSBjaGFyYWN0ZXIsIGFuZCByZXN1bWVzIHRoZSBzZXNzaW9uIG9uIHRoYXQgY2hhcmFjdGVyLiBQcmVzZW50IG9uIHRoZSBzYW1lIHRlcm1zIGFzIGBpbnN0YWxsTW9kYCwgYmVjYXVzZSBhbiBpbnN0YWxsIGRvZXMgbm90aGluZyB1bnRpbCB0aGUgZ2FtZSByZWxvYWRzLiBJdCBncmFudHMgbm8gcGVybWlzc2lvbiwgc2luY2UgYSBwbHVnaW4gY2FuIHJlYWNoIGBsb2NhdGlvbmAgYW55d2F5LiBgbG9jYXRpb24ucmVsb2FkKClgIHNraXBzIGFsbCBmb3VyIHN0ZXBzLCB0aG91Z2gsIGFuZCB0aGUgdGhpcmQgc3RlcCBpcyB0aGUgcGxheWVyJ3MgcHJvZ3Jlc3MgfAp8IGBsb2FkTW9kRm9yU2Vzc2lvbmAgfCBgKGJ5dGVzKSA9PiBQcm9taXNlPHtvaywgaWQsIHZlcnNpb24sIHN1cnZpdmVzUmVsb2FkfSBcfCB7b2ssIHByb2JsZW19PmAsIHdoaWNoIGxvYWRzIGEgY29udGVudCBtb2QgZm9yIHRoaXMgc2Vzc2lvbiBvbmx5LiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBtb2Q6c2Vzc2lvbmAuIENvZGUgaXMgcmVmdXNlZCBvbiB0aGUgc2FtZSB0ZXJtcy4gVGhlIG1vZCBpcyBvbiBmcm9tIHRoZSBuZXh0IHJlbG9hZCB3aXRoIG5vIG5lZWQgdG8gc3dpdGNoIGl0IG9uLiBUaGUgZ2FtZSBmb3JnZXRzIHRoZSBhcmNoaXZlIHdoZW4gaXQgY2xvc2VzLCBidXQgYW55dGhpbmcgdGhlIG1vZCBkaWQgdG8gYSBjaGFyYWN0ZXIgc3RheXMsIHNvIHRlbGwgdGhlIHBsYXllciB0aGF0IHwKfCBgdWlgIHwgYHsgb3BlblBhbmVsKHNwZWMpLCByZWdpc3RlclBhbmVsS2luZChzcGVjKSwgb3BlblBhbmVscyB9YCwgcGFuZWxzIGJ1aWx0IGZyb20gSFRNTCBpbnN0ZWFkIG9mIGNoYXJhY3RlciBjZWxscy4gUHJlc2VudCBvbmx5IHdoZW4geW91ciBtYW5pZmVzdCBkZWNsYXJlZCBgdWk6cGFuZWwubW91bnRgLiBJdCBpcyBhYnNlbnQgZXZlcnl3aGVyZSBlbHNlLCBzbyB0ZXN0IGZvciBpdC4gU2VlIGBNT0RfU0VBTVMubWRgIHNlY3Rpb25zIDRiIGFuZCA0cC4gVGhlIEVzY2FwZSBrZXkgYmVsb25ncyB0byB0aGUgcGxheWVyLCBhbmQgYSBub24tbW9kYWwgYG9wZW5QYW5lbGAgY29udGFpbmVyIHRha2VzIG5vIHBvaW50ZXIgZXZlbnRzIHwKfCBga2V5UmVwZWF0YCB8IGAoKSA9PiB7IGlzUmVwZWF0LCByZXBvcnRlZFJlcGVhdCwgaW50ZXJ2YWxNcywgYWdlTXMgfSBcfCBudWxsYCwgdGhlIGhvc3QncyBvd24gY2xhc3NpZmljYXRpb24gb2YgdGhlIG1vc3QgcmVjZW50IHJvb3Qtc2NyZWVuIGtleWRvd24gYXMgYSBrZXktcmVwZWF0IG9yIGEgZnJlc2ggcHJlc3MuIFVuZ2F0ZWQsIGxpa2UgYHN1YndpbmRvd3NgLiBJdCByZXR1cm5zIGBudWxsYCB1bnRpbCB0aGUgcm9vdCBoYW5kbGVyIGhhcyBjbGFzc2lmaWVkIGEga2V5ZG93biB0aGlzIHNlc3Npb24uIFJlYWQtb25seSBmb3Igbm93OiBubyBjb21tYW5kIGlzIHN1cHByZXNzZWQgb3IgY2hhbmdlZCBiYXNlZCBvbiBpdCB5ZXQgKCMzNSkgfAp8IGBjaGFyYWN0ZXJTdG9yZWAgfCBgeyBnZXQoKSwgc2V0KHZhbHVlKSB9YCwgdGhpcyBtb2QncyBvd24gbGl2ZSBzdG9yYWdlIGZvciBlYWNoIGNoYXJhY3Rlci4gSXQgaXMgdGhlIHNhbWUgc2F2ZSBiYWcgYG1pZ3JhdGVCYWdgIG1pZ3JhdGVzLCByZWFkIGFuZCB3cml0dGVuIGR1cmluZyBwbGF5IGluc3RlYWQgb2Ygb25seSBhdCBtb2QtbG9hZCB0aW1lLiBTY29wZWQgYnkgbW9kIGlkIGxpa2UgYHByZWZzYCwgYW5kIHVuZ2F0ZWQuIFByZXNlbnQgb25seSBvbmNlIGEgbGl2ZSBjaGFyYWN0ZXIgZXhpc3RzLiBFYWNoIHdyaXRlIGlzIHN0YW1wZWQgd2l0aCB5b3VyIG1hbmlmZXN0J3MgY3VycmVudCBgc2F2ZVNjaGVtYWAgKDAgaWYgeW91IGRlY2xhcmUgbm9uZSksIGFuZCBgbWlncmF0ZUJhZ2AgcmVhZHMgdGhhdCBudW1iZXIgYmFjayBvbiBhIGxhdGVyIGxvYWQgKCMxNzEpIHwKCmBmbGFnc2AgaXMgc2xpY2VkIHBlciBtb2Qgc28gdGhhdCBvbmUgbW9kIGNhbm5vdCByZWFkIG9yIGFjdCBvbiBhbm90aGVyIG1vZCdzIHRvZ2dsZXMuIE90aGVyd2lzZSBhIG1vZCdzIGJlaGF2aW91ciB3b3VsZCBkZXBlbmQgb24gd2hpY2ggb3RoZXIgbW9kcyB0aGUgcGxheWVyIGhhcHBlbmVkIHRvIGVuYWJsZS4KCiMjIyBgaG9va3MoY3R4KWAgY2FuIG9ic2VydmUgbmV3IGNoYXJhY3RlcnMKClRoZSBob3N0IGNhbGxzIGBob29rcyhjdHgpYCBiZWZvcmUgaXQgc3RhcnRzIHRoZSBnYW1lLCBzbyB0aGUgZmFjdG9yeSBpdHNlbGYgaGFzIG5vIGBHYW1lU3RhdGVgLiBBIGhvb2sgaXQgcmV0dXJucyBjYW4gcmVjZWl2ZSB0aGUgbGl2ZSBzdGF0ZSBsYXRlcjogYG5ld0NoYXJhY3RlcihzdGF0ZSwgcmVnaXN0cmllcylgIHJ1bnMgb25jZSBhZnRlciBgc3RhcnRHYW1lYCBoYXMgYnVpbHQgYW5kIHdpcmVkIGEgbmV3IGNoYXJhY3Rlci4gSXQgZG9lcyBub3QgcnVuIHdoZW4gYSBzYXZlZCBnYW1lIGlzIGxvYWRlZCBvciByZWxvYWRlZC4gQ2hhbmdlcyBpdCBtYWtlcyBiZWNvbWUgb3JkaW5hcnkgY2hhcmFjdGVyIHN0YXRlIGFuZCBhcmUgc2F2ZWQgd2l0aCB0aGF0IGNoYXJhY3Rlci4gT3RoZXIgd29yayB0aGF0IG5lZWRzIHRoZSBsaXZlIGdhbWUgY2FuIGdvIGluIGByZWdpc3Rlcihob3N0LCBjdHgpYCwgd2hpY2ggcnVucyBhZnRlciB0aGUgZ2FtZSBpcyBidWlsdC4KCklmIHlvdSBuZWVkIHRoZSBlbmdpbmUgYXQgYGhvb2tzYCB0aW1lIGZvciBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgbGl2ZSBnYW1lIChjbGFzc2lmeWluZyBvcHRpb24gbmFtZXMsIHJlYWRpbmcgYSBjb25zdGFudCksIGBjdHguY29yZWAgaXMgYXZhaWxhYmxlIGFuZCBpcyB0aGUgc2FtZSBtb2R1bGUgaW5zdGFuY2UgdGhlIGdhbWUgcnVucyBvbi4KCiMjIyBgcmVnaXN0cmllc2AgaXMgdGhlIGNvbnRlbnQsIHdoZXJlIGBzdGF0ZWAgaXMgdGhlIGxldmVsCgpUaGVzZSB0d28gYXJlIGVhc3kgdG8gY29uZnVzZSwgYW5kIHNvbWUgbW9kcyBjYW5ub3QgYmUgd3JpdHRlbiB3aXRob3V0IHRoZSBzZWNvbmQuCgpgc3RhdGVgIGlzIHRoaXMgbGV2ZWw6IHRoZSBtb25zdGVycyBzdGFuZGluZyBvbiBpdCwgdGhlIG9iamVjdHMgbHlpbmcgb24gaXQsIHRoZSBwbGF5ZXIuIFJlYWQgaXQgdG8gZHJhdyBhIGZyYW1lIG9yIHRvIGFuc3dlciBhIHF1ZXN0aW9uIGFib3V0IHNvbWV0aGluZyBpbiBmcm9udCBvZiB0aGUgcGxheWVyIHJpZ2h0IG5vdy4KCmByZWdpc3RyaWVzYCBpcyB3aGF0IHRoZSBnYW1lIGlzIG1hZGUgb2Y6IGByZWdpc3RyaWVzLm1vbnN0ZXJzLnJhY2VzYCBpcyBldmVyeSByYWNlIHRoZSBwYWNrIGRlZmluZXMsIGF0IGl0cyByZWFsIGByaWR4YDsgYHJlZ2lzdHJpZXMub2JqZWN0cy5raW5kc2AgaXMgZXZlcnkgb2JqZWN0IGtpbmQsIGF0IGl0cyByZWFsIGBraWR4YDsgYW5kIGZlYXR1cmVzLCB0cmFwcywgc3RvcmVzIGFuZCBwcm9qZWN0aW9ucyBhcmUgdGhlcmUgb24gdGhlIHNhbWUgdGVybXMuIFlvdSBuZWVkIGl0IHdoZW5ldmVyIHlvdXIgcXVlc3Rpb24gaXMgYWJvdXQgYSB0aGluZyBieSBpbmRleCBpbnN0ZWFkIG9mIGJ5IHByZXNlbmNlOiB3aGF0IGEgY3JlYXR1cmUgeW91IG9ubHkgcmVtZW1iZXIgY2FuIGRvLCB3aGF0IGFuIGl0ZW0geW91IGhhdmUgbmV2ZXIgc2VlbiBpcyB3b3J0aCwgd2hpY2gga2luZHMgc2hhcmUgYSBgdHZhbGAuCgpgYGBqcwpyZWdpc3Rlcihob3N0LCBjdHgpIHsKICBjb25zdCByYWNlcyA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlczsKICBpZiAoIXJhY2VzKSByZXR1cm47ICAgICAgICAgICAgICAgICAvLyBjb21wb3NpdGlvbiB0aW1lLCBvciBhbiBvbGRlciBob3N0CiAgY29uc3QgYnlSaWR4ID0gbmV3IE1hcChyYWNlcy5tYXAoKHIpID0+IFtyLnJpZHgsIHJdKSk7Cn0KYGBgCgotIEl0IGlzIHRoZSB3aG9sZSBgQ29yZVJlZ2lzdHJpZXNgLCBub3QgYSBjdXJhdGVkIHNsaWNlLCBmb3IgdGhlIHNhbWUgcmVhc29uIGBjdHguY29yZWAgaXMgdGhlIHdob2xlIG5hbWVzcGFjZTogYSBjdXJhdGVkIGxpc3QgZHJpZnRzIG91dCBvZiBkYXRlLiBTZWUgc2VjdGlvbiA0IG9mIE1PRF9DT01QQVRJQklMSVRZLm1kLgotIEEgbW9kJ3MgY29udGVudCBpcyBpbiBpdCBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBjb3JlJ3MuIEJpbmRpbmcgcnVucyBhZnRlciBldmVyeSBlbmFibGVkIG1vZCBoYXMgY29tcG9zZWQgaXRzIGNvbnRlbnQsIGFuZCBtb2RzIGFwcGVuZCwgc28gYSBtb25zdGVyIGEgbW9kIGFkZGVkIGlzIGEgYE1vbnN0ZXJSYWNlYCBhdCBhIHJlYWwgYHJpZHhgIGFuZCBhbiBpdGVtIGEgbW9kIGFkZGVkIGlzIGFuIGBPYmplY3RLaW5kYCBhdCBhIHJlYWwgYGtpZHhgLiBOb3RoaW5nIGluIGEgbG9va3VwIHRlbGxzIHRoZW0gYXBhcnQ7IHRoZSBvbmx5IG1hcmtlciBpcyB0aGUgb3B0aW9uYWwgYGZyb21gIHByb3ZlbmFuY2UgZmllbGQsIGFuZCBtb3N0IGNvbnN1bWVycyBzaG91bGQgbm90IHJlYWQgaXQuIFRoYXQgaXMgd2h5IG1vZGRlZCBjb250ZW50IHdvcmtzIHRoZSBzYW1lIGFzIHZhbmlsbGEgY29udGVudCB3aXRoIG5vIGV4dHJhIHdvcmsgZnJvbSBhbnlvbmUuIFdpdGhvdXQgaXQsIGV2ZXJ5IGNvbnN1bWVyIHdvdWxkIGtlZXAgaXRzIG93biB0YWJsZSBvZiBjb3JlJ3MgY29udGVudCBhbmQgaWdub3JlIGV2ZXJ5dGhpbmcgYSBtb2QgYWRkZWQuCi0gR3VhcmQgaXQuIEl0IGlzIGFic2VudCBkdXJpbmcgY29udGVudCBjb21wb3NpdGlvbiAodGhhdCBpcyB3aGVuIGl0IGlzIGJlaW5nIGJ1aWx0KSBhbmQgb24gYW55IGhvc3Qgb2xkZXIgdGhhbiAyMDI2LTA4LTIxLCBzbyBgaWYgKCFjdHgucmVnaXN0cmllcykgcmV0dXJuO2AgaXMgdGhlIHBhdHRlcm4sIHRoZSBzYW1lIG9uZSBgY3R4LmJhY2t1cEZvbGRlcmAgdXNlcy4KLSBJdCBpcyB0aGUgcmVhZCBzZWFtLCBidXQgaXQgaXMgbm90IHJlYWQtb25seS4gVGhlc2UgYXJlIHRoZSBsaXZlIG9iamVjdHMgdGhlIGVuZ2luZSBydW5zIG9uLCBzbyBgcmVnaXN0cmllcy5yb29tc2AsIGByZWdpc3RyaWVzLnByb2ZpbGVzYCBhbmQgYHJlZ2lzdHJpZXMucm9vbXMuZ2x5cGhzYCBjYXJyeSB0aGUgc2FtZSBtdXRhdG9ycyB0aGUgY2FwYWJpbGl0eS1nYXRlZCBmYWNhZGVzIHdyaXRlIHRocm91Z2guIFVzZSB0aGUgZmFjYWRlIGFuZCBkZWNsYXJlIHRoZSBjYXBhYmlsaXR5OyBbV2hhdCBhIGNhcGFiaWxpdHkgZ2F0ZXMsIGFuZCB3aGF0IGl0IGRvZXMgbm90XSgjd2hhdC1hLWNhcGFiaWxpdHktZ2F0ZXMtYW5kLXdoYXQtaXQtZG9lcy1ub3QpIGV4cGxhaW5zIHdoeSB0aGUgZ2F0ZSBjYW5ub3Qgc3RvcCB5b3UgYW5kIHdoeSBkZWNsYXJpbmcgc3RpbGwgbWF0dGVycy4KCiMjIyBBdXRob3Jpbmc6IGBjdHguYXV0aG9yaW5nYCBhbmQgYGN0eC5jb21wb3NlZFJlY29yZHNgCgpUaGVzZSB0d28gYXJlIGZvciBhIG1vZCB0aGF0IHdyaXRlcyBjb250ZW50IGluc3RlYWQgb2YgcGxheWluZyBpdC4gQSB0b29sIHRoYXQgaGVscHMgYW4gYXV0aG9yIGRyYWZ0IGEgbW9uc3RlciBuZWVkcyB0d28gdGhpbmdzIHRoZSBzZWFtcyBhYm92ZSBjYW5ub3QgZ2l2ZSBpdDogdGhlIGZ1bmN0aW9ucyB0aGF0IGtub3cgd2hhdCBhIHdlbGwtZm9ybWVkIHJlY29yZCBsb29rcyBsaWtlLCBhbmQgdGhlIHJlY29yZHMgdGhlIGdhbWUgd2FzIGFjdHVhbGx5IGNvbXBvc2VkIGZyb20uCgpgY3R4LmF1dGhvcmluZ2AgaXMgdGhlIG1vZCBTREsncyBwdWJsaWMgYmFycmVsLCBsaXZlIGFuZCBhbHdheXMgcHJlc2VudC4gYFJFQ09SRF9CTFVFUFJJTlRTYCBhbmQgYGJsdWVwcmludEZvcmAgY2FycnkgZXZlcnkgZmllbGQncyBtZWFzdXJlZCBzaGFwZSwgdHlwZSBzZXQgYW5kIHJhbmdlOyBgZmllbGRVc2FnZWAgYW5kIGByZXF1aXJlZEZpZWxkc2Agc2F5IGhvdyBjb21tb24gYSBmaWVsZCBpczsgYHBlZXJzRm9yYCBidWlsZHMgYSB0YWJsZSBvZiBjb21wYXJhYmxlIHJlY29yZHMgYWxvbmcgd2l0aCBhIHNlbnRlbmNlIHNheWluZyB3aHkgdGhleSBhcmUgY29tcGFyYWJsZTsgYHN1Z2dlc3RGaWVsZHNgIHByb3Bvc2VzIGEgdmFsdWUgd2l0aCBpdHMgcmVhc29uOyBgY2hlY2tSZWNvcmRzYCBhbmQgYENPTVBBTklPTl9SVUxFU2AgdmFsaWRhdGUgYXQgdGhlIHNhbWUgdGhyZWUgbGV2ZWxzIHRoZSBydW5uaW5nIGdhbWUgdXNlczsgYW5kIGBNb2RQcm9qZWN0YCBhc3NlbWJsZXMgYW5kIGVtaXRzIGEgbW9kIGZvbGRlci4gSXQgaXMgdW5nYXRlZCwgYmVjYXVzZSB0aGVzZSBhcmUgcHVyZSBmdW5jdGlvbnMgb3ZlciBkYXRhIHlvdSBwYXNzIGluLgoKYGN0eC5jb21wb3NlZFJlY29yZHNgIGlzIHRoZSB1bmJvdW5kIGNvdW50ZXJwYXJ0IG9mIGBjdHgucmVnaXN0cmllc2A6IGV2ZXJ5IHJlY29yZCB0aGUgcnVubmluZyBnYW1lIGNvbXBvc2VkLCBhcyBKU09OLCBrZXllZCBieSBwYWNrLWZpbGUgc3RlbSB3aXRoIG5vIGV4dGVuc2lvbi4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHJlY29yZHMgPSBjdHguY29tcG9zZWRSZWNvcmRzOwogIGlmICghcmVjb3JkcykgcmV0dXJuOyAgICAgICAgICAgICAgIC8vIGNvbXBvc2l0aW9uIHRpbWUsIG9yIGFuIG9sZGVyIGhvc3QKICBjb25zdCB7IHBlZXJzLCBiZWNhdXNlIH0gPSBjdHguYXV0aG9yaW5nLnBlZXJzRm9yKAogICAgIm1vbnN0ZXIiLAogICAgeyBuYW1lOiAiV2FyZyBtYXRyaWFyY2giLCBiYXNlOiAiY2FuaW5lIiwgZGVwdGg6IDIyIH0sCiAgICByZWNvcmRzLAogICk7CiAgY3R4LmxvZyhgJHtwZWVycy5sZW5ndGh9IGNvbXBhcmFibGUgbW9uc3RlcnM6ICR7YmVjYXVzZX1gKTsKfQpgYGAKCi0gVXNlIGBjb21wb3NlZFJlY29yZHNgLCBub3QgYHJlZ2lzdHJpZXNgLCBmb3IgYW55dGhpbmcgdGhlIFNESyB0YWtlcy4gRXZlcnkgYHJlY29yZHNgIHBhcmFtZXRlciBpbiB0aGUgYXV0aG9yaW5nIGZ1bmN0aW9ucyBpcyBrZXllZCBieSBmaWxlIHN0ZW0gYW5kIGhvbGRzIHJhdyBKU09OLiBgcmVnaXN0cmllcy5tb25zdGVycy5yYWNlc2AgaXMgYm91bmQ6IHRoZSBiaW5kZXIgcmVzb2x2ZWQgYGJhc2VgIGludG8gYSBwb2ludGVyIGFuZCBkcm9wcGVkIHRoZSBzdHJpbmcsIHNvIHlvdSBjYW5ub3QgYnVpbGQgYSBwZWVyIHRhYmxlIGdyb3VwZWQgb24gYGJhc2VgIGZyb20gaXQsIG9yIGFzayBhYm91dCBhIGZpZWxkIHRoYXQgYm91bmQgdG8gbm90aGluZy4KLSBNb2QtYWRkZWQgcmVjb3JkcyBhcmUgaW4gaXQgb24gdGhlIHNhbWUgdGVybXMgYXMgY29yZSdzLCBqdXN0IGFzIGluIGByZWdpc3RyaWVzYCwgYW5kIGVhY2ggY2FycmllcyBpdHMgcHJvdmVuYW5jZS4gQSBkcmFmdCBiYXNlZCBvbiBhbm90aGVyIG1vZCdzIHN3b3JkIGRlcGVuZHMgb24gdGhhdCBtb2QsIGFuZCBwcm92ZW5hbmNlIGxldHMgeW91IHNlZSB0aGF0IHdoZW4gdGhlIGJhc2UgaXMgY2hvc2VuIGluc3RlYWQgb2YgYXQgaW5zdGFsbCB0aW1lLgotIEd1YXJkIGBjb21wb3NlZFJlY29yZHNgLCBub3QgYGF1dGhvcmluZ2AuIFRoZSByZWNvcmRzIGFyZSBhYnNlbnQgZHVyaW5nIGNvbnRlbnQgY29tcG9zaXRpb24sIGZvciB0aGUgc2FtZSByZWFzb24gYHJlZ2lzdHJpZXNgIGlzLiBUaGUgYmFycmVsIHdhaXRzIG9uIG5vdGhpbmcgYW5kIGlzIHByZXNlbnQgb24gZXZlcnkgY29udGV4dC4gQW4gb2xkZXIgaG9zdCBoYXMgbmVpdGhlciwgc28gYGlmICghY3R4LmNvbXBvc2VkUmVjb3JkcykgcmV0dXJuO2AgY292ZXJzIGJvdGguCi0gSXQgaG9sZHMgcmVjb3JkIG9iamVjdHMgb25seS4gUGFzc3Rocm91Z2ggZmlsZXMgY2FuIGNhcnJ5IGFycmF5cyBhbmQgc2NhbGFyczsgdGhlIGhvc3QgbmFycm93cyB0aHJvdWdoIHRoZSBTREsncyBvd24gYGNvbXBvc2VkT2JqZWN0c2AgYmVmb3JlIGhhbmRpbmcgdGhlIHJlY29yZHMgb3Zlciwgc28gdGhlIGF1dGhvcmluZyBmdW5jdGlvbnMgbmV2ZXIgbWVldCBhbiBlbGVtZW50IHRoZXkgY2Fubm90IHJlYWQuCgojIyMgRmlsbGluZyB0aWxlcwoKYHJlZ2lzdHJ5OnRpbGVzYCBpcyB0aGUgc2VhbSBmb3Igb25lIG5hcnJvdyB0aGluZzogKiphIHBpY3R1cmUgZm9yIGNvbnRlbnQgdGhlCmxvYWRlZCB0aWxlIHBhY2sgaGFzIG5ldmVyIGhlYXJkIG9mLioqIE5vIHRpbGUgc2V0IHdhcyBidWlsdCBrbm93aW5nIGFib3V0IHlvdXIKbW9kLCBzbyBpbiB0aWxlIG1vZGUgYSBjcmVhdHVyZSB5b3UgYWRkZWQgaXMgYSBjb2xvdXJlZCBsZXR0ZXIgc3RhbmRpbmcgaW4gYQp0aWxlZCBkdW5nZW9uLCBhbmQgdGhlIG9ubHkgcG9ydGFibGUgYWx0ZXJuYXRpdmUgdXNlZCB0byBiZSBvbmUgcHJlZiBmaWxlIHBlcgp0aWxlIHNldCBuYW1pbmcgYXRsYXMgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHVubWFpbnRhaW5hYmxlLgoKYGBganMKcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgaG9zdC50aWxlcy5yZWdpc3RlcigoZmlsbCkgPT4gewogICAgaWYgKGZpbGwucGFjay5lbmdpbmUgIT09ICJsaW5vbGV1bSIpIHJldHVybjsgICAvLyBvbmx5IHBhY2tzIHlvdSBrbm93CiAgICBjb25zdCByYWNlcyA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlczsKICAgIGlmICghcmFjZXMpIHJldHVybjsKICAgIGZvciAoY29uc3QgcmFjZSBvZiByYWNlcykgewogICAgICBpZiAoZmlsbC5tb25zdGVyVGlsZShyYWNlLnJpZHgpKSBjb250aW51ZTsgICAvLyBzb21lYm9keSBkcmV3IGl0IGFscmVhZHkKICAgICAgY29uc3QgZG9ub3IgPSBmaWxsLm1vbnN0ZXJUaWxlKDApOwogICAgICBpZiAoZG9ub3IpIGZpbGwuZmlsbE1vbnN0ZXIocmFjZS5yaWR4LCBmaWxsLmRlcml2ZShkb25vciwgOTApID8/IHsgLi4uZG9ub3IgfSk7CiAgICB9CiAgfSk7Cn0KYGBgCgotIFlvdSBjYW5ub3QgcmVwYWludCB0aGUgdGlsZSBzZXQuIGBmaWxsTW9uc3RlcmAgLyBgZmlsbE9iamVjdGAgd3JpdGUgb25seSB3aGVyZSBub3RoaW5nIGlzIGFzc2lnbmVkIGFuZCByZXR1cm4gYGZhbHNlYCBvdGhlcndpc2UuIEV2ZXJ5IHByZWYgbGF5ZXIgKHRoZSBwYWNrJ3Mgb3duLCB0aGVuIGVhY2ggZW5hYmxlZCBtb2QncykgcnVucyBiZWZvcmUgYW55IGZpbGxlciwgc28gYSB0aWxlIGFuIGF1dGhvciBuYW1lZCBpcyBuZXZlciB0cmVhdGVkIGFzIGEgYmxhbmsuIEl0IGFsc28gbWVhbnMgdHdvIG1vZHMgY2Fubm90IGZpZ2h0OiB3aGljaGV2ZXIgYXNrcyBmaXJzdCBmb3IgYW4gaW5kZXggZ2V0cyBpdCwgYW5kIG5laXRoZXIgY2FuIHVuZG8gdGhlIG90aGVyLgotIGBkZXJpdmUoZG9ub3IsIGh1ZSlgIG1heSByZXR1cm4gYG51bGxgLCBhbmQgdXN1YWxseSBkb2VzLiBJdCBhc2tzIHRoZSBlbmdpbmUgZm9yIGEgdGlsZSB0aGF0IGRyYXdzIHRoZSBkb25vcidzIGFzc2V0IHdpdGggaXRzIGh1ZSByb3RhdGVkLiBBIHRpbGVzaGVldCBjYW5ub3QgcHJvdmlkZSBvbmUsIGJlY2F1c2UgaXRzIHRpbGVzIGFyZSBjZWxscyBvZiBhIGZpeGVkIGF0bGFzIHdpdGggbm8gc3BhcmUgY2VsbCBmb3IgYSB2YXJpYW50LCBzbyBpdCBhbHdheXMgcmV0dXJucyBgbnVsbGAuIEEgbG9vc2UgcGFjayBjYW4sIHVubGVzcyB0aGUgZG9ub3IncyBhc3NldCBpcyBub3Qgb25lIG9mIGl0cyBvd24uIEZhbGwgYmFjayB0byBhIHBsYWluIGNvcHkuCi0gQ2hlY2sgYGZpbGwucGFja2AuIEEgdGlsZXNldCBtb2QncyBydWxlIGZpdHMgaXRzIG93biBhcnQgYW5kIGlzIG9ubHkgYSBndWVzcyBhYm91dCBhbnlvbmUgZWxzZSdzLCBzbyBkZWNsaW5pbmcgcGFja3MgeW91IGRvIG5vdCBvd24gaXMgbm9ybWFsLgotIENvcmUgZG9lcyBub3QgZGVjaWRlIHdoaWNoIGNvbnRlbnQgZ2V0cyBhIHRpbGUuIEl0IHVzZWQgdG86IDAuMjIuMCBzaGlwcGVkIGEgcnVsZSBpbiBjb3JlIHRoYXQgZHJldyBhIG1vZC1hZGRlZCBtb25zdGVyIGZyb20gYSByYWNlIHNoYXJpbmcgaXRzIGBiYXNlYCwgYW5kIDAuMjMuMCByZW1vdmVkIGl0LCBiZWNhdXNlIEFuZ2JhbmQgNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYSBtb2QtYWRkZWQgcmVjb3JkIGFuZCB0aGUgcG9ydCBhZGRzIG5vdGhpbmcuIFRoYXQgcnVsZSBub3cgbGl2ZXMgaW4gYGxpbm9sZXVtYCwgd2hpY2ggaXMgdGhlIHdvcmtlZCBleGFtcGxlLiBOb3RlIHdoYXQgaXQgbGVhdmVzIGFsb25lOiByaW5ncywgYW11bGV0cywgbXVzaHJvb21zIGFuZCBmb29kIGFyZSBkcmF3biBieSBmbGF2b3VyLCBzbyB0aGVpciBraW5kIHNsb3RzIGFyZSBibGFuayBvbiBwdXJwb3NlLCBhbmQgYW4gb2xkZXIgcGFjayBoYXMgbm8gYXJ0IGZvciBjb250ZW50IGFkZGVkIGFmdGVyIGl0IHdhcyBkcmF3bi4gQSBsZXR0ZXIgaXMgdGhlIHJpZ2h0IHJlc3VsdCBpbiBib3RoIGNhc2VzLCBzbyB0aGUgcnVsZSBpcyByZXN0cmljdGVkIHRvIHJlY29yZHMgYSBtb2QgYWRkZWQsIGJ5IHByb3ZlbmFuY2UuCgpJZiB5b3UgYXJlIHNoaXBwaW5nIGNvbnRlbnQgcmF0aGVyIHRoYW4gdGlsZXMsIGRyYXcgeW91ciBvd24gdGlsZXMgZm9yIGl0LiBBIGZpbGxlciBpcyBhIGZhbGxiYWNrIGZvciBtb2RzIHRoYXQgZG8gbm90LCBhbmQgaXQgaGFzIG5vIHdheSB0byBrbm93IHdoYXQgeW91IGludGVuZGVkLgoKIyMjIFJlcGFpbnRpbmcgYSB0aWxlLCBhbmQgZHJhd2luZyB0aGUgcGxheWVyJ3Mgb3duIGNlbGwKClR3byBtb3JlIGZlYXR1cmVzIGxpdmUgb24gdGhlIHNhbWUgYHJlZ2lzdHJ5OnRpbGVzYCBzZWFtLiBOZWl0aGVyIGZpbGxzIGEgYmxhbms7IGJvdGggc3RhcnQgZnJvbSBhIHRpbGUgdGhhdCBhbHJlYWR5IGhhcyBhIHBpY3R1cmUuCgpgZmlsbC50cmFuc2Zvcm0oZG9ub3IsIHNwZWMpYCBpcyB0aGUgc2libGluZyBvZiBgZGVyaXZlYCwgZm9yIHdoZW4gcm90YXRpbmcgdGhlIGRvbm9yJ3MgaHVlIGlzIG5vdCB3aGF0IHlvdSB3YW50LiBgZGVyaXZlYCBrZWVwcyB0aGUgZG9ub3IncyBjb2xvdXJzIGFuZCB0dXJucyB0aGVtLCB3aGljaCBkb2VzIG5vdGhpbmcgdG8gZ3JleTsgYHRyYW5zZm9ybWAgcmVwbGFjZXMgdGhlIHBhbGV0dGUuIEVhY2ggcGl4ZWwgaXMgaW5kZXhlZCBieSBicmlnaHRuZXNzIGludG8gYSByYW1wIHlvdSBzdXBwbHksIGRhcmtlc3QgZmlyc3QsIGFuZCByZXBhaW50ZWQgd2l0aCB0aGUgY29sb3VyIGF0IHRoYXQgaW5kZXgsIHNvIHRoZSByZXN1bHQgaXMgaW4geW91ciBjb2xvdXJzIHdoYXRldmVyIHRoZSBkb25vcidzIHdlcmUsIGdyZXkgZG9ub3JzIGluY2x1ZGVkLiBBbHBoYSBpcyBsZWZ0IHVudG91Y2hlZCwgc28gdGhlIHNpbGhvdWV0dGUgbWF0Y2hlcyB0aGUgZG9ub3IncyBleGFjdGx5LiBJdCBjYW4gYWxzbyBtaXJyb3IgdGhlIHBpY3R1cmUgaG9yaXpvbnRhbGx5LCBpbmRlcGVuZGVudGx5IG9mIHRoZSByYW1wLiBMaWtlIGBkZXJpdmVgLCBpdCByZXR1cm5zIGBudWxsYCBvbiBhIGZpeGVkIHRpbGVzaGVldCAobm8gc3BhcmUgY2VsbCBmb3IgYSB2YXJpYW50KSBhbmQgaW4gdGhlIHNhbWUgdHdvIG90aGVyIGNhc2VzOyBmYWxsIGJhY2sgdG8gYSBwbGFpbiBjb3B5LgoKYGBganMKY29uc3QgdGlsZSA9IGZpbGwudHJhbnNmb3JtKGRvbm9yLCB7IG1pcnJvcjogdHJ1ZSwgcmFtcDogW1syMCwgMTAsIDMwXSwgWzkwLCA0MCwgMTEwXSwgWzE4MCwgMTIwLCAyMjBdXSB9KTsKYGBgCgpgdGlsZXMucGxheWVyKHByb3ZpZGVyKWAgYW5zd2VycyBhIGRpZmZlcmVudCBxdWVzdGlvbiwgb25jZSBwZXIgZnJhbWUgaW5zdGVhZCBvZiBvbmNlIHBlciBtYXAgYnVpbGQ6IGdpdmVuIHdobyB0aGUgY2hhcmFjdGVyIGlzIHJpZ2h0IG5vdywgaXMgdGhlcmUgYSB0aWxlIHRoYXQgZml0cyBiZXR0ZXIgdGhhbiB0aGUgcGFjaydzIG93biBwbGF5ZXIgcGljdHVyZT8gVGhlIHBsYXllciBpcyByYWNlIDAgaW4gdGhlIG1vbnN0ZXIgdGlsZSB0YWJsZSBhbmQgZXZlcnkgc2hpcHBlZCBwYWNrIGFzc2lnbnMgaXQsIHNvIHRoZXJlIGlzIG5vIGJsYW5rIGhlcmUgZm9yIGEgZmlsbGVyIHRvIHdyaXRlIGludG8uIFRoZSBwcm92aWRlciBpcyBhc2tlZCBpbnN0ZWFkLCBhbmQgYG51bGxgIG1lYW5zIG5vLCB3aGljaCBpcyBhbHNvIHRoZSByZXN1bHQgd2hlbiBubyBwcm92aWRlciBpcyBpbnN0YWxsZWQuIFRoZSBmaXJzdCBub24tbnVsbCBhbnN3ZXIgaW4gbG9hZCBvcmRlciB3aW5zLCBzbyB0d28gc3VjaCBtb2RzIGNhbiBjb2V4aXN0LgoKYGBganMKaG9zdC50aWxlcy5wbGF5ZXIoKHZpZXcpID0+IHsKICBpZiAoIXZpZXcuc2hhcGUpIHJldHVybiBudWxsOyAgICAgICAgICAvLyBub3JtYWwgc2hhcGU6IGxldCB0aGUgcGFjayBkcmF3IGl0CiAgcmV0dXJuIHNoYXBlVGlsZUZvcih2aWV3LnNoYXBlLCB2aWV3LmxldmVsLCB2aWV3LmNscywgdmlldy5yYWNlKTsKfSk7CmBgYAoKVGhlIHZpZXcgeW91IGdldCAoYHNoYXBlYCwgYGxldmVsYCwgYGNsc2AsIGByYWNlYCkgaXMgYSBzZXQgb2YgbmFtZWQgZmFjdHMsIG5vdCB0aGUgbGl2ZSBwbGF5ZXIgcmVjb3JkLCBzbyBhIHJlbmRlci10aW1lIGhvb2sgaGFzIG5vdGhpbmcgdG8gbXV0YXRlLiBCZWNhdXNlIHRoZSBwcm92aWRlciBydW5zIGluc2lkZSB0aGUgcmVuZGVyIHBhdGgsIGl0IG11c3QgYmUgYSBsb29rdXA6IGFsbG9jYXRlIHRoZSB0aWxlcyB5b3VyIGFuc3dlcnMgbmVlZCBkdXJpbmcgdGhlIGZpbGwgKHdpdGggYHRyYW5zZm9ybWApIGFuZCByZWFkIHRoYXQgdGFibGUgaGVyZS4gQSBwcm92aWRlciB0aGF0IHRocm93cyBsb3NlcyB0aGF0IGZyYW1lJ3MgYW5zd2VyIGFuZCBub3RoaW5nIGVsc2UuCgojIyMgUmVhZGluZyBhIG1vbnN0ZXIncyB0aWxlOiBgY3R4LnRpbGVzYAoKYHJlZ2lzdHJ5OnRpbGVzYCBhYm92ZSBpcyB0aGUgV1JJVEUgc2lkZTogc3VwcGx5aW5nIGFydCB0aGUgbG9hZGVkIHBhY2sgaGFzCm5ldmVyIGhlYXJkIG9mLiBgY3R4LnRpbGVzYCBpcyB0aGUgUkVBRCBzaWRlLCBmb3IgYSBtb2QgdGhhdCB3YW50cyB0byBkcmF3IGEKbW9uc3RlcidzIGV4aXN0aW5nIHRpbGUgYXJ0IHNvbWV3aGVyZSBvZiBpdHMgb3duIC0gYSBwb3J0cmFpdCBpbiBhIGRpYWxvZywgYQpzaWRlYmFyIHJvdywgYW55dGhpbmcgb3V0c2lkZSB0aGUgZHVuZ2VvbiBncmlkIGl0c2VsZi4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHBhaW50ZWQgPSBjdHgudGlsZXM/LmFjdGl2ZSAmJiBjdHgudGlsZXMuaGFzTW9uc3RlclRpbGUocmFjZS5yaWR4KQogICAgPyBjdHgudGlsZXMuZHJhd01vbnN0ZXIobXlDYW52YXMuZ2V0Q29udGV4dCgiMmQiKSwgcmFjZS5yaWR4LCAwLCAwLCAzMiwgMzIpCiAgICA6IGZhbHNlOwogIGlmICghcGFpbnRlZCkgZHJhd0FzY2lpR2x5cGhJbnN0ZWFkKHJhY2UpOwp9CmBgYAoKLSAqKmBjdHgudGlsZXMuYWN0aXZlYCoqIGlzIHRydWUgd2hlbiBhIGdyYXBoaWNzL3RpbGVzZXQgbW9kZSwgcmF0aGVyIHRoYW4KICBBU0NJSSwgaXMgdGhlIGN1cnJlbnQgZGlzcGxheSBtb2RlLiBGYWxzZSBpbiBBU0NJSSBtb2RlLCBhbHdheXMgLSB0aGVyZSBpcwogIG5vdGhpbmcgdG8gcGFpbnQuCi0gKipgY3R4LnRpbGVzLmhhc01vbnN0ZXJUaWxlKHJpZHgpYCoqIGFuc3dlcnMgd2hldGhlciB0aGUgQUNUSVZFIHBhY2sgYXNzaWducwogIHRoaXMgcmFjZSBhIHRpbGUgYXQgYWxsIChjb3JlJ3Mgb3duIGB0aWxlRm9yTW9uc3RlcmApLCB3aXRob3V0IHRvdWNoaW5nIGEKICBjYW52YXMuIEZhbHNlIGluIEFTQ0lJIG1vZGUsIGFuZCBmYWxzZSBmb3IgYSByYWNlIHRoZSBwYWNrIGhhcyBuZXZlciBkcmF3biAtCiAgYW4gb2xkIHBhY2sgd2l0aCBubyBhcnQgZm9yIGNvbnRlbnQgYWRkZWQgc2luY2UsIHNheS4KLSAqKmBjdHgudGlsZXMuZHJhd01vbnN0ZXIoY3R4MmQsIHJpZHgsIGR4LCBkeSwgZHcsIGRoKWAqKiBwYWludHMgdGhlIHJhY2UncwogIHRpbGUgb250byBhIDJEIGNhbnZhcyBjb250ZXh0IHlvdSBvd24sIGF0IGAoZHgsIGR5KWAgc2NhbGVkIHRvIGAoZHcsIGRoKWAsCiAgY29tcG9zaXRlZCBvdmVyIGEgbmV1dHJhbCBmbG9vciB0aWxlIC0gdGhlIHNhbWUgdGVycmFpbi10aGVuLWZvcmVncm91bmQgYmxpdAogIHRoZSBkdW5nZW9uIHZpZXcgaXRzZWxmIGRyYXdzIGEgbW9uc3RlciBzdGFuZGluZyBvbiBvcGVuIGdyb3VuZCB3aXRoLgogIFJldHVybnMgYHRydWVgIHdoZW4gYXJ0IHdhcyBkcmF3bjsgYGZhbHNlYCAoQVNDSUkgbW9kZSwgbm8gdGlsZSBmb3IgdGhpcwogIHJhY2UsIG9yIGl0cyBpbWFnZSBoYXMgbm90IGZpbmlzaGVkIGxvYWRpbmcgeWV0KSBtZWFucyBmYWxsIGJhY2sgdG8geW91ciBvd24KICBBU0NJSSBnbHlwaC4KLSAqKkVudGlyZWx5IHVuZ2F0ZWQqKiwgdGhlIHNhbWUgcmVhc29uaW5nIGBkaXNwbGF5YCBhbmQgYHN1YndpbmRvd3NgIGNhcnJ5OgogIHRoaXMgaXMgcmVhZC1vbmx5IGFydCB0aGUgcGFnZSBhbHJlYWR5IGZldGNoZWQgKHRoZSBhY3RpdmUgcGFjaydzIG93bgogIGltYWdlcyksIG5vdCBhIGNhcGFiaWxpdHkgb3ZlciB0aGUgZ2FtZSBvciB0aGUgcGxhdGZvcm0uCi0gKipBYnNlbnQgb24gYW4gb2xkZXIgaG9zdC4qKiBgY3R4LnRpbGVzYCBkaWQgbm90IGV4aXN0IGJlZm9yZSBuZW8tYW5nYmFuZCMyNTY7CiAgZ3VhcmQgaXQgd2l0aCBgY3R4LnRpbGVzPy5gIGFuZCBkZWdyYWRlIHRvIHRoZSBBU0NJSSBnbHlwaCwgdGhlIHNhbWUgc2hhcGUKICBldmVyeSBvdGhlciBvcHRpb25hbCBgY3R4YCBkb29yIGFscmVhZHkgdXNlcy4KCiMjIyBSZWFkaW5nIG9uZSBpbnB1dCB3YWl0OiBgY3R4LnNuYXBzaG90KClgCgpgY3R4LnNuYXBzaG90KClgIHJldHVybnMgdGhlIGdhbWUgYXQgdGhlIGN1cnJlbnQgaW5wdXQgd2FpdCBhcyBvbmUgZnJvemVuIG9iamVjdCwgb3IgbnVsbCBiZWZvcmUgYSBnYW1lIGV4aXN0czogYGNvcmVgICh0aGUgYEFnZW50Vmlldy5jYXB0dXJlKClgIHBhcnRzOiB0dXJuLCBwbGF5ZXIsIGludmVudG9yeSwgZXF1aXBtZW50LCBtb25zdGVycywgdGFyZ2V0LCBzdG9yZXMsIHNwZWxsYm9va3MpLCBgcGhhc2VgLCBgbWVzc2FnZVBlbmRpbmdgLCBgZnJhbWVgICh0aGUgbGFzdCB3b3JsZCBmcmFtZSkgYW5kIGB0b2tlbmAuIFNlbmQgdGhlIHRva2VuIGJhY2sgd2l0aCBhbiBhY3Rpb24gc28gYSBzdGFsZSBvbmUgY2FuIGJlIHJlZnVzZWQuIFBhcnRzIHlvdSBoYXZlIG5vIHJlYWQgY2FwYWJpbGl0eSBmb3IgYXJlIG51bGw7IHRoZSBwaGFzZSBhbmQgcGF1c2UgdXNlIGBzdGF0ZTppbnRlcmFjdGlvbi5yZWFkYCBhbmQgdGhlIGZyYW1lIHVzZXMgYHN0YXRlOm1hcC5yZWFkYC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0Z10oTU9EX1NFQU1TLm1kIzRnLWN0eHNuYXBzaG90LWFuZC10aGUtaW5wdXQtdG9rZW4tLS1vbmUtd2FpdC1yZWFkLXdob2xlKS4KClRoZSBjb3JlIHNuYXBzaG90IGFsc28gY2FycmllcyBxdWl2ZXIgaXRlbXMsIGVxdWlwbWVudCBzbG90IGxhYmVscywgbG9jYWwgZmxvb3IgaXRlbXMsIGl0ZW0ga2V5cyBhbmQgbmFtZSBhdHRyaWJ1dGVzLCBhbmQgc3BlbGwgc3R1ZHkgZmllbGRzIHVuZGVyIHRoZWlyIG1hdGNoaW5nIHN0YXRlIGdyYW50cy4gVGhlIGhvc3Qgc25hcHNob3QgYWRkcyByZXN0IGFjdGl2aXR5LCBtZXNzYWdlIGhpc3RvcnksIGFjdGl2ZSBibGFzdCBtZXRhZGF0YSBhbmQgc3RvcmUgc3RhdHVzLiBgY3R4LmNoYXJhY3Rlci5rZXkoKWAgcmV0dXJucyB0aGUgYXR0YWNoZWQgY2hhcmFjdGVyJ3Mgcm9zdGVyIGxpbmVhZ2UgdW5kZXIgYHN0YXRlOnBsYXllci5yZWFkYC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbnMgNGddKE1PRF9TRUFNUy5tZCM0Zy1jdHhzbmFwc2hvdC1hbmQtdGhlLWlucHV0LXRva2VuLS0tb25lLXdhaXQtcmVhZC13aG9sZSkgYW5kIFs0c10oTU9EX1NFQU1TLm1kIzRzLWNvbW1hbmQtY2F0YWxvZ3VlLWFuZC1zdG9yZS1wYW5lbC1zdGF0dXMpLgoKYGN0eC5pbnNwZWN0LnRyYXZlbFBhdGgoKWAgcHJldmlld3MgdGhlIHRyYXZlbCBjb21tYW5kJ3Mgd2Fsa2luZyByb3V0ZSwgYHRpbGVBY3Rpb25zKClgIGxpc3RzIGNvbW1hbmQgY29kZXMgZm9yIGEgcmVtZW1iZXJlZCBncmlkLCBhbmQgYGl0ZW1SdWxlcygpYCByZWFkcyBsZWFybmVkIGlnbm9yZSBhbmQgYXV0by1pbnNjcmlwdGlvbiBzZXR0aW5ncy4gVGhlIG1hcCByZWFkcyBuZWVkIGBzdGF0ZTptYXAucmVhZGA7IGl0ZW0gcnVsZXMgbmVlZCBgc3RhdGU6aW52ZW50b3J5LnJlYWRgLiBFYWNoIGFuc3dlciBpcyBmcm96ZW4gYW5kIHN0YW1wZWQgd2l0aCB0aGUgaW5wdXQgdG9rZW4uIGBjdHguZGlzcGxheS5zZXRNYXBNYXJnaW4oKWAgcmVzZXJ2ZXMgYSBjbGVhciBzdHJpcCBiZXNpZGUgdGhlIG1haW4gbWFwIGFuZCBuZWVkcyBubyBhZGRlZCBjYXBhYmlsaXR5LiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRrXShNT0RfU0VBTVMubWQjNGstY3R4aW5zcGVjdC0tLXJlYWQtdGhlLWdhbWVzLW93bi1pbnNwZWN0aW9uLWFuc3dlcnMpIGFuZCBbc2VjdGlvbiA0b10oTU9EX1NFQU1TLm1kIzRvLXJlc2VydmluZy1hLW1hcC1tYXJnaW4pLgoKIyMjIFdvcmtpbmcgYmVzaWRlIGNvbnRyb2xsZXJzIGFuZCBvdGhlciBtb2RzCgpgY3R4LnNuYXBzaG90KCkuZHJpdmVyYCBhbmQgYGN0eC5kcml2ZXIoKWAgbmFtZSB0aGUgY3VycmVudCBrZXlib2FyZCBvd25lci4gQSBjb250cm9sbGVyIG1vZCBjYW4gcHVibGlzaCBhIHRhc2sgbGFiZWwgYW5kIHJlYXNvbiB0aHJvdWdoIGBjdHguY29udHJvbGxlci5zZXRTdGF0dXMoKWAsIHJlbGVhc2UgdGhlIGtleWJvYXJkIHRocm91Z2ggYGN0eC5jb250cm9sbGVyLnJlbGVhc2UocmVhc29uPylgLCBhbmQgbW9kcyB3aXRoIGBldmVudDpkcml2ZXItY2hhbmdlZGAgY2FuIGxpc3RlbiBmb3IgY2hhbmdlcy4gYGN0eC5tb2RzKClgIGxpc3RzIGVuYWJsZWQsIGxvYWRlZCBtb2RzIGFuZCBvbmx5IHRoZSBydWxlIG9yIHNlY3Rpb24gZmxhZ3MgZWFjaCBtYW5pZmVzdCBkZWNsYXJlcyBpbiBgcHVibGljRmxhZ3NgLiBEaXNwbGF5IHNldHRlcnMga2VlcCBhIHZhbHVlIHBlciBtb2QsIHJlc3RvcmUgYW4gZWFybGllciB2YWx1ZSB3aGVuIHRoZSBjdXJyZW50IG93bmVyIGNsZWFycyBvciB1bmxvYWRzLCBhbmQgZXhwb3NlIGdldHRlcnMgZm9yIHRoZSB2YWx1ZSBpbiBmb3JjZS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0cV0oTU9EX1NFQU1TLm1kIzRxLWNvbnRyb2xsZXItb3duZXJzaGlwLXB1YmxpYy1tb2RzLWFuZC1kaXNwbGF5LXJlcXVlc3RzKS4gQSBjb250cm9sbGVyIGNhbiBzYXkgbW9yZSBhYm91dCBvbmUgaW5zdGFsbCBieSByZXR1cm5pbmcgYHsgY29udHJvbGxlciwgbm9uZGV0ZXJtaW5pc3RpYywgb25EZWF0aCwgb25LZXkgfWAsIGFuZCBhIG1vZCB3aXRoIGBldmVudDpwbGF5ZXItY29tbWFuZGAgY2FuIHdhdGNoIHRoZSBwbGF5ZXIncyBvd24gY29tbWFuZHMgd2hpbGUgaXQgd2FpdHM7IHNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb25zIDRxIGFuZCA0bF0oTU9EX1NFQU1TLm1kIzRxLWNvbnRyb2xsZXItb3duZXJzaGlwLXB1YmxpYy1tb2RzLWFuZC1kaXNwbGF5LXJlcXVlc3RzKS4KCiMjIyBXYXRjaGluZyByZXNvbHZlZCBvdXRjb21lczogYGN0eC5ldmVudHNgCgpEZWNsYXJlIGBldmVudDpjb21iYXQtb3V0Y29tZWAsIGBldmVudDpoZWFsYCwgb3IgYGV2ZW50Om1vdGlvbmAgdG8gcmVjZWl2ZSBgY3R4LmV2ZW50c2AgZHVyaW5nIGEgZ2FtZS4gU3Vic2NyaWJlIHdpdGggYGN0eC5ldmVudHMub24obmFtZSwgaGFuZGxlcilgOyBlYWNoIG5hbWUgbmVlZHMgaXRzIG93biBncmFudC4gQ29tYmF0IHBheWxvYWRzIHJlcG9ydCBoaXQgb3IgbWlzcywgYXBwbGllZCBkYW1hZ2UsIGRlYXRoLCBhbmQgdGhlIHRhcmdldCBncmlkLiBIZWFsaW5nIHJlcG9ydHMgdGhlIHJlc3RvcmVkIGFtb3VudC4gTW90aW9uIG5hbWVzIGEgYHdhbGtgIG9yIGB0ZWxlcG9ydGAgYXQgdGhlIGNvbXBsZXRlZCBtb3ZlLiBFdmVyeSBwYXlsb2FkIGluY2x1ZGVzIGBzZWVuYCwgYW5kIHVuc2VlbiBldmVudHMgc3RpbGwgYXJyaXZlLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRsXShNT0RfU0VBTVMubWQjNGwtcmVzb2x2ZWQtY29tYmF0LWhlYWxpbmctYW5kLW1vdmVtZW50LWV2ZW50cykuCgojIyMgTWFuYWdpbmcgY2hhcmFjdGVyczogYGN0eC5zYXZlc2AKCkRlY2xhcmUgYHNhdmVzOm1hbmFnZWAgZm9yIGEgcmVwbGFjZW1lbnQgdGl0bGUgc2NyZWVuIHRoYXQgbGlzdHMsIGxvYWRzLCByZW5hbWVzIG9yIGRlbGV0ZXMgY2hhcmFjdGVycy4gYGN0eC5zYXZlc2AgaXMgYWJzZW50IHdpdGhvdXQgdGhhdCBncmFudC4gVGhlIG1ldGhvZHMgYW5kIHRoZWlyIHJlZnVzYWwgcmVzdWx0cyBhcmUgZGVzY3JpYmVkIGluIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0bV0oTU9EX1NFQU1TLm1kIzRtLWN0eHNhdmVzLS0tdGhlLWhvc3QtY2hhcmFjdGVyLXJvc3RlcikuCgpgY3R4LnNhdmVzLm9uQ2hhbmdlKClgIHJlcG9ydHMgZnJvemVuIHJlbmFtZSBhbmQgZGVsZXRlIGV2ZW50cyBhZnRlciB0aGUgaG9zdCBjaGFuZ2VzIHRoZSByb3N0ZXIsIGluY2x1ZGluZyBjaGFuZ2VzIG1hZGUgb3V0c2lkZSBhIG1vZCBtZW51LiBFYWNoIGV2ZW50IGNhcnJpZXMgdGhlIHN0YWJsZSBsaW5lYWdlIGtleSByZXR1cm5lZCBieSBgY3R4LmNoYXJhY3Rlci5rZXkoKWAgZm9yIHRoZSBhdHRhY2hlZCBjaGFyYWN0ZXIuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNG1dKE1PRF9TRUFNUy5tZCM0bS1jdHhzYXZlcy0tLXRoZS1ob3N0LWNoYXJhY3Rlci1yb3N0ZXIpLgoKRGVjbGFyZSBgc2Vzc2lvbjpjb250cm9sYCBmb3IgYSBzYXZlIGRpYWxvZyBvZiB5b3VyIG93bi4gYGN0eC5zZXNzaW9uYCBzYXZlcyB0aGUgZ2FtZSwgbGVhdmVzIGZvciB0aGUgdGl0bGUgc2NyZWVuIG9yIHF1aXRzLCBhcyB0aGUgZ2FtZSBtZW51IGRvZXMsIGJ1dCB3aXRob3V0IHRoZSBtZW51J3MgY29uZmlybWF0aW9ucy4gRWFjaCBjYWxsIHNhdmVzIGZpcnN0IGFuZCBzdGF5cyBpbiB0aGUgZ2FtZSB3aGVuIHRoZSBzYXZlIGZhaWxzLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRtXShNT0RfU0VBTVMubWQjNG0tY3R4c2F2ZXMtLS10aGUtaG9zdC1jaGFyYWN0ZXItcm9zdGVyKS4KCiMjIyBUaXRsZSBhY3Rpb25zIGFuZCBwbGF5ZXIgcHJvZmlsZXMKCkRlY2xhcmUgYHVpOnRpdGxlYCB0byByZWNlaXZlIGBjdHgudGl0bGVgLiBgcmVnaXN0ZXJSb3coeyBsYWJlbCwga2V5PywgcnVuIH0pYCBhZGRzIGFuIGFjdGlvbiBhZnRlciB0aGUgY29yZSB0aXRsZSBvcHRpb25zLiBSb3dzIGtlZXAgdGhlaXIgcmVnaXN0cmF0aW9uIG9yZGVyLCBhbmQgdGhlIGhvc3QgcmVtb3ZlcyBhIG1vZCdzIHJvd3Mgd2hlbiBpdCB1bmluc3RhbGxzIHRoYXQgbW9kLiBUaGUgb3B0aW9uYWwga2V5IGlzIGEgbGV0dGVyIG9yIGRpZ2l0OyBhIGNvcmUga2V5IG9yIGFuIGVhcmxpZXIgbW9kIGtleSBrZWVwcyBpdHMgZXhpc3RpbmcgYWN0aW9uLiBgY2hvb3NlKHRpdGxlLCBjaG9pY2VzKWAgb3BlbnMgYSBjaG9pY2UgbWVudSBiZWZvcmUgcGxheSBiZWdpbnMgYW5kIHJldHVybnMgdGhlIGNob3NlbiBpbmRleCwgb3IgYG51bGxgIG9uIEVzY2FwZS4gVGhlIGZpcnN0IGNob2ljZSBpcyBzZWxlY3RlZCBieSBkZWZhdWx0LgoKQSBtb2QgdGhhdCBkZWNsYXJlcyBgcHJvZmlsZXM6bWFuYWdlYCByZWNlaXZlcyBgY3R4LnByb2ZpbGVzYC4gV2l0aCBpdCwgdGhlIG1vZCBjYW4gbGlzdCBwcm9maWxlcywgY3JlYXRlIGEgZnJlc2ggcHJvZmlsZSBvciBvbmUgdGhhdCBjb3BpZXMgdGhlIGVuYWJsZWQtbW9kIHNlbGVjdGlvbnMgb2YgYW5vdGhlciBwcm9maWxlLCByZXBsYWNlIHRoZSBlbmFibGVkIG1vZHMgaW4gYSBwcm9maWxlIGl0IGNyZWF0ZWQsIGFuZCBzd2l0Y2ggcHJvZmlsZXMgYmVmb3JlIHBsYXkgYmVnaW5zLiBBIGNvcHkgbGVhdmVzIG91dCBjb25zZW50IGRlY2lzaW9ucywgcGlucywgc2V0dGluZ3MsIHByaXZhdGUgcHJlZmVyZW5jZXMsIGFuZCBjaGFyYWN0ZXIgZGF0YS4gVGhlIGRlc3RpbmF0aW9uIHByb2ZpbGUgbmVlZHMgaXRzIG93biBwZXJtaXNzaW9uIGRlY2lzaW9ucyBiZWZvcmUgdGhlIG1vZCBjaGFuZ2VzIGl0cyBlbmFibGVkIHNldCBvciByZXF1ZXN0cyBjaGFyYWN0ZXIgY3JlYXRpb24uIEZvciBtZXRob2QgdHlwZXMgYW5kIHJlbG9hZCBhY3Rpb25zLCBzZWUgW01PRF9TRUFNUy5tZF0oTU9EX1NFQU1TLm1kI3BsYXllci1wcm9maWxlcy1hbmQtdGl0bGUtYWN0aW9ucykuCgojIyMgU2hhcmluZyBkYXRhIHdpdGggb3RoZXIgbW9kczogYGN0eC5zaGFyZWRgCgpEZWNsYXJlIGBzaGFyZWQ6cHVibGlzaGAgdG8gcHVibGlzaCBuYW1lZCBKU09OIHZhbHVlcyB3aXRoIGBjdHguc2hhcmVkLnB1Ymxpc2gobmFtZSwgdmVyc2lvbiwgdmFsdWUpYCwgYW5kIGBzaGFyZWQ6cmVhZGAgdG8gcmVhZCBhbm90aGVyIG1vZCdzIHdpdGggYGN0eC5zaGFyZWQucmVhZChtb2RJZCwgbmFtZSlgLiBBIHJlYWQgcmV0dXJucyBhIGZyb3plbiBjb3B5LCBvciBudWxsIHdoZW4gdGhhdCBtb2QgaXMgbm90IGluc3RhbGxlZCwgaXMgZGlzYWJsZWQsIGZhaWxlZCB0byBsb2FkLCBvciBoYXMgbm90IHB1Ymxpc2hlZCB0aGUgbmFtZS4gVmFsdWVzIG11c3QgYmUgcGxhaW4gSlNPTiBvZiBhdCBtb3N0IDI1NiBLaUIsIGFuZCB0aGUgdmVyc2lvbiBpcyBhIG51bWJlciB5b3UgcmFpc2Ugd2hlbiB0aGUgdmFsdWUncyBzaGFwZSBjaGFuZ2VzLiBUcmVhdCB3aGF0IHlvdSByZWFkIGFzIHVudHJ1c3RlZCBpbnB1dCBhbmQgY2hlY2sgaXRzIHZlcnNpb24gYW5kIGZpZWxkcyBiZWZvcmUgeW91IHVzZSBpdC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0emFdKE1PRF9TRUFNUy5tZCM0emEtY3R4c2hhcmVkLS0tdmFsdWVzLW9uZS1tb2Qtc2hhcmVzLXdpdGgtb3RoZXJzKS4KCiMjIyBUaWxlZCBwYW5lbHMgYmVzaWRlIGBvcGVuUGFuZWxgCgpEZWNsYXJlIGB1aTpwYW5lbC5tb3VudGAgdG8gb2ZmZXIgYSBwYW5lbCBpbiBTdWJ3aW5kb3cgc2V0dXAgd2l0aCBgY3R4LnVpLnJlZ2lzdGVyUGFuZWxLaW5kKHNwZWMpYC4gSXRzIGBtb3VudGAgZnVuY3Rpb24gZHJhd3MgaW50byB0aGUgc2xvdCdzIHNoYWRvdyByb290LiBVc2UgdGhlIHJldHVybmVkIGZ1bmN0aW9uIGR1cmluZyBtb2QgY2xlYW51cCB0byB1bnJlZ2lzdGVyIHRoZSBraW5kLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRwXShNT0RfU0VBTVMubWQjNHAtY3R4dWlyZWdpc3RlcnBhbmVsa2luZC0tLWEtbW9kLXBhbmVsLWluLXRoZS10aWxlZC1sYXlvdXQpIGZvciB0aGUgaG9zdCBoYW5kbGUgYW5kIHNhdmVkIGxheW91dCBiZWhhdmlvci4KClRoZSBob3N0IGNhbiBmbG9hdCB0aGUgc2FtZSByZWdpc3RlcmVkIHBhbmVsIGluc2lkZSB0aGUgZ2FtZSB2aWV3cG9ydCBhbmQgcmVzdG9yZSBpdHMgbGFzdCBkb2NrZWQgb3IgZmxvYXRpbmcgcGxhY2Ugd2hlbiBpdCBpcyBzaG93biBhZ2Fpbi4gQSBtaXNzaW5nIG1vZCBsZWF2ZXMgYSBuYW1lZCBwbGFjZWhvbGRlciBpbiBlaXRoZXIgcGxhY2UuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHJdKE1PRF9TRUFNUy5tZCM0ci1mbG9hdGluZy1wYW5lbC1wb3NpdGlvbnMtYW5kLXJlY292ZXJ5KS4KCiMjIyBGaWx0ZXJpbmcgcGFuZWxzIHdpdGggdGhlIGNhbnZhcwoKRGVjbGFyZSBgZGlzcGxheTpmaWx0ZXJgIHRvIGNhbGwgYGN0eC5kaXNwbGF5LnNldFZpc3VhbEZpbHRlcihmaWx0ZXIsIHsgc2NvcGU6ICJnYW1lIiB9KWAuIFRoaXMgY292ZXJzIHRoZSB0ZXJtaW5hbCBjYW52YXMsIHRpbGVkIHN1YndpbmRvd3MsIGFuZCBtb2QgcGFuZWwgY29udGVudC4gT21pdCB0aGUgb3B0aW9ucyBmb3IgdGhlIHByZXZpb3VzIGNhbnZhcy1vbmx5IGJlaGF2aW9yLCBvciBwYXNzIGBudWxsYCB0byBjbGVhciB0aGUgZmlsdGVyLiBTdHJvbmcgZmlsdGVycyBjYW4gbWFrZSBwYW5lbCB0ZXh0IGZpZWxkcyBhbmQgdGhlaXIgY2FyZXQgaGFyZCB0byByZWFkLiBIb3N0IHJlY292ZXJ5IGNvbnRyb2xzIGFuZCBjYXBhYmlsaXR5IGNvbnNlbnQgcmVtYWluIGNsZWFyLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRuXShNT0RfU0VBTVMubWQjNG4tZmlsdGVyaW5nLXRoZS13aG9sZS1nYW1lLXZpZXdwb3J0KS4KCiMjIyBSZWFkaW5nIHRoZSBrbm93biBsZXZlbDogYGN0eC5rbm93bkxldmVsKClgCgpVc2UgYGN0eC5rbm93bkxldmVsKClgIHRvIGRyYXcgYSBtYXAgb3IgbWluaW1hcCBmcm9tIGV2ZXJ5IGdyaWQgdGhlIHBsYXllciBrbm93cy4gVGhlIGZyb3plbiByZXN1bHQgaGFzIGEgdG9rZW4sIGxldmVsIGlkLCBkaW1lbnNpb25zIGFuZCBjZWxscyB3aXRoIHJlbWVtYmVyZWQgdGVycmFpbiwgdHJhcHMgYW5kIG9iamVjdHMuIERlY2xhcmUgYHN0YXRlOm1hcC5yZWFkYDsgdGhlIGNhbGwgcmV0dXJucyBudWxsIHdpdGhvdXQgaXQuIFRoZSBzZXBhcmF0ZSBgYWN0dWFsYCBkYXRhIHJlcXVpcmVzIGBzdGF0ZTptYXAtYWN0dWFsLnJlYWRgIGJ5IG5hbWUsIGFsb25nc2lkZSBgc3RhdGU6bWFwLnJlYWRgOyB0aGUgYHN0YXRlOioucmVhZGAgd2lsZGNhcmQgZG9lcyBub3QgZ3JhbnQgaXQuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNGhdKE1PRF9TRUFNUy5tZCM0aC1jdHhrbm93bmxldmVsLS0tdGhlLXBsYXllcnMtd2hvbGUtcmVtZW1iZXJlZC1sZXZlbCkuCiMjIyBJbnNwZWN0aW5nIGl0ZW1zLCBtb25zdGVycywgc3BlbGxzLCBhbmQgYWltaW5nCgpgY3R4Lmluc3BlY3RgIHJlYWRzIGl0ZW0gaW5zcGVjdGlvbiwgbW9uc3RlciByZWNhbGwsIHNwZWxsIGRldGFpbHMsIGl0ZW0gcGlja2VyIGVsaWdpYmlsaXR5LCBwcm9qZWN0aW9uIHBhdGhzLCBhbmQgYmFsbCBhcmVhcyBmcm9tIHRoZSBnYW1lJ3Mgb3duIGhlbHBlcnMuIEVhY2ggcmVzdWx0IGlzIGZyb3plbiBhbmQgc3RhbXBlZCB3aXRoIHRoZSBjdXJyZW50IGlucHV0IHRva2VuLiBEZWNsYXJlIHRoZSBtYXRjaGluZyBgc3RhdGU6aW52ZW50b3J5LnJlYWRgLCBgc3RhdGU6bW9uc3RlcnMucmVhZGAsIGBzdGF0ZTpzcGVsbHMucmVhZGAsIG9yIGBzdGF0ZTptYXAucmVhZGAgY2FwYWJpbGl0eS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0a10oTU9EX1NFQU1TLm1kIzRrLWN0eGluc3BlY3QtLS1yZWFkLXRoZS1nYW1lcy1vd24taW5zcGVjdGlvbi1hbnN3ZXJzKS4KCmBpbnNwZWN0SXRlbWAgbm93IGFjY2VwdHMgc3RvcmUgc3RvY2sgcmVmZXJlbmNlcyBhbmQgcmV0dXJucyBzZXBhcmF0ZSBzZWN0aW9ucy4gYGJvb2tGb3JJdGVtYCBtYXBzIGEgY2FycmllZCBzcGVsbGJvb2sgdG8gaXRzIGNsYXNzIHNwZWxsczsgYGNvbXBhcmVMb2Fkb3V0U2xvdHNgIHJ1bnMgdGhlIGV4aXN0aW5nIGxvYWRvdXQgc2ltdWxhdGlvbiBmb3IgZWFjaCBjb21wYXRpYmxlIHNsb3QsIGluY2x1ZGluZyBhIHNlY29uZCByaW5nIHNsb3QuIEJsYXN0IHByZXZpZXdzIGluY2x1ZGUgcmFkaXVzIGFuZCBlbGVtZW50IG1ldGFkYXRhLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRrXShNT0RfU0VBTVMubWQjNGstY3R4aW5zcGVjdC0tLXJlYWQtdGhlLWdhbWVzLW93bi1pbnNwZWN0aW9uLWFuc3dlcnMpLgoKIyMjIEFjdGluZyBhdCBvbmUgaW5wdXQgd2FpdDogYGN0eC5pbnRlbnQuc3VibWl0KClgCgpEZWNsYXJlIGBpbnB1dDppbnRlbnRgIHRvIHJlY2VpdmUgYGN0eC5pbnRlbnRgLiBQYXNzIHRoZSBjdXJyZW50IGBjdHguc25hcHNob3QoKWAgdG9rZW4gd2l0aCBhIGNvbW1hbmQsIHRyYXZlbCBkZXN0aW5hdGlvbiBvciB0YXJnZXQuIFRoZSBob3N0IHJlamVjdHMgc3RhbGUgb3IgYmxvY2tlZCBhY3Rpb25zIHdpdGggYSByZWFzb247IGFjY2VwdGVkIGNvbW1hbmRzIHVzZSB0aGUgc2FtZSBidWZmZXIgYW5kIGdhbWUgbG9vcCBhcyBhIGtleXByZXNzLCB3aGlsZSB0YXJnZXQgc2V0dGVycyBjaGFuZ2Ugbm8gdHVybi4gRm9yIGEgY29tcG91bmQgYWN0aW9uLCBzZW5kIHRyYXZlbCwgd2FpdCBmb3IgdGhlIG5leHQgaW5wdXQgd2FpdCwgaW5zcGVjdCBhIG5ldyBzbmFwc2hvdCBhbmQgc2VuZCB0aGUgZm9sbG93LXVwIGNvbW1hbmQuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNGldKE1PRF9TRUFNUy5tZCM0aS1jdHhpbnRlbnRzdWJtaXQtLS1hY3QtYXQtdGhlLWN1cnJlbnQtaW5wdXQtd2FpdCkuCgpgY3R4LmludGVudC5jYXRhbG9ndWUoKWAgbGlzdHMgcmVnaXN0ZXJlZCBjb21tYW5kcyBhbmQgYXJndW1lbnQgc2hhcGVzLiBBIGBsb29rYCBjb21tYW5kIGNhbiBzdGFydCBhdCBhIGdyaWQ7IHRyYXZlbCBtb2RpZmllcnMgbWFwIEN0cmwgdG8gdGFyZ2V0aW5nIGFuZCBTaGlmdCBvbiBhbiBhZGphY2VudCBncmlkIHRvIHJ1bm5pbmcuIFRoZSBgc3RvcC1yZXN0aW5nYCwgYGlnbm9yZWAsIGB1bmlnbm9yZWAgYW5kIGBpdGVtLXJ1bGVgIGludGVudHMgdXNlIHRoZSBnYW1lJ3MgZXhpc3RpbmcgaGFuZGxlcnMuIFN0b3JlIGJ1eSBhbmQgc2VsbCBpbnRlbnRzIGFzayB0aGUgc3RvcmUncyBxdWFudGl0eSBhbmQgY29uZmlybWF0aW9uIHF1ZXN0aW9ucyBiZWZvcmUgdHJhZGluZy4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbnMgNGldKE1PRF9TRUFNUy5tZCM0aS1jdHhpbnRlbnRzdWJtaXQtLS1hY3QtYXQtdGhlLWN1cnJlbnQtaW5wdXQtd2FpdCkgYW5kIFs0c10oTU9EX1NFQU1TLm1kIzRzLWNvbW1hbmQtY2F0YWxvZ3VlLWFuZC1zdG9yZS1wYW5lbC1zdGF0dXMpLgoKVGhlIHNuYXBzaG90J3MgbW9uc3RlcnMgbWFyayB1bmlxdWVzIGFuZCBxdWVzdCBndWFyZGlhbnMsIGFuZCB0aGUgcGxheWVyIHZpZXcgYWRkcyB0aGUgbG93IGhpdCBwb2ludCB0aHJlc2hvbGQgYW5kIHRoZSByZWNhbGwgYW5kIGRlc2NlbnQgdGltZXJzLiBSZW1lbWJlcmVkIGZsb29yIG9iamVjdHMgY2FycnkgYSBnbG93IGNsYXNzLCBgY3R4Lmluc3BlY3QudGVycmFpbkNhdGFsb2d1ZSgpYCBsaXN0cyB0ZXJyYWluIHdpdGggaXRzIHN0YWlycyBhbmQgZmlyZSBmbGFncywgYW5kIHRoZSBib2x0IGFuZCBleHBsb3Npb24gZXZlbnRzIG5hbWUgdGhlaXIgZWxlbWVudC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0dF0oTU9EX1NFQU1TLm1kIzR0LXJlYWRzLWZvci12aXN1YWwtZWZmZWN0cykuCgpBIG1lbnUgbW9kIGNhbiByZWFkIHRoZSBjaGFyYWN0ZXIgc2hlZXQgYXMgZGF0YSB3aXRoIGBjdHguY2hhcmFjdGVyLnNoZWV0KClgLCByZW5hbWUgYW55IHNhdmVkIGNoYXJhY3RlciwgcmVhZCBhbmQgY2hhbmdlIHRoZSBnYW1lJ3Mgb3B0aW9ucyB3aXRoIGBjdHgub3B0aW9uc2AsIGFuZCBlZGl0IHRoZSBwbGF5ZXIncyBrZXltYXBzIHdpdGggYGN0eC5rZXliaW5kaW5nc2AuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHVdKE1PRF9TRUFNUy5tZCM0dS1jaGFyYWN0ZXItc2hlZXQtc2F2ZXMtb3B0aW9ucy1hbmQta2V5bWFwcykuCgpBIG1vZCBjYW4gZHJhdyBpdHMgb3duIGtub3dsZWRnZSBicm93c2VyIHdpdGggYGN0eC5rbm93bGVkZ2VgOiB0aGUgY2F0ZWdvcmllcywgdGhlaXIga25vd24gZW50cmllcywgYW5kIGVhY2ggZW50cnkncyByZWNhbGwgcGFnZS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0dl0oTU9EX1NFQU1TLm1kIzR2LWtub3dsZWRnZS1icm93c2VyKS4KCkEgbW9kIGNhbiBkcmF3IGEgcnVuIGpvdXJuYWwgZnJvbSBgY3R4LmNoYXJhY3Rlci5oaXN0b3J5KClgIGFuZCBhIHBvc3QtbW9ydGVtIGZyb20gdGhlIHJlcG9ydCBgY3R4LmNoYXJhY3Rlci5vblJ1bkVuZGAgZGVsaXZlcnMuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHddKE1PRF9TRUFNUy5tZCM0dy1ydW4tam91cm5hbC1hbmQtZW5kLW9mLXJ1bi1yZXBvcnQpLgojIyMgQW5zd2VyaW5nIHRoZSBvcGVuIHByb21wdAoKV2l0aCBgc3RhdGU6aW50ZXJhY3Rpb24ucmVhZGAsIGBjdHguc25hcHNob3QoKS5wcm9tcHRgIGRlc2NyaWJlcyB0aGUgcXVlc3Rpb24gY3VycmVudGx5IGhvbGRpbmcgaW5wdXQuIEEgbW9kIHdpdGggYGlucHV0OnByb21wdC5yZXBseWAgYWxzbyByZWNlaXZlcyBgY3R4LnByb21wdC5yZXBseShwcm9tcHRJZCwgYW5zd2VyKWAsIHdoaWNoIHNlbmRzIGEgdHlwZWQgYW5zd2VyIHRocm91Z2ggdGhlIGdhbWUncyBleGlzdGluZyBoYW5kbGVyLiBJbnZhbGlkIG9yIHN0YWxlIHJlcGxpZXMgbGVhdmUgdGhlIHF1ZXN0aW9uIG9wZW4gYW5kIHJldHVybiBhIHJlYXNvbi4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0al0oTU9EX1NFQU1TLm1kIzRqLXR5cGVkLXByb21wdHMtYW5kLXJlcGxpZXMpIGZvciB0aGUga2luZHMgYW5kIGFuc3dlcnMuCgpTdG9yZSBxdWFudGl0eSBwcm9tcHRzIGluY2x1ZGUgdGhlIHVuaXQgcHJpY2UsIGN1cnJlbnQgdG90YWwgYW5kIGdvbGQuIFJlcGx5IHdpdGggYHsgYWN0aW9uOiAiY2FuY2VsIiB9YCB0byBjYW5jZWwgYSBxdWFudGl0eSBxdWVzdGlvbi4gVGhlIHJlc3QgcHJvbXB0IGhhcyBhIHN0YWJsZSB0YWcsIGFuZCBhIGAtbW9yZS1gIHBhdXNlIGFjY2VwdHMgYHsgYWN0aW9uOiAiYWNrbm93bGVkZ2UiIH1gLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRqXShNT0RfU0VBTVMubWQjNGotdHlwZWQtcHJvbXB0cy1hbmQtcmVwbGllcykuCgojIyMgRW5naW5lLXdpZGUgc2V0dGluZ3MgeW91IGNoYW5nZSB0aHJvdWdoIGBjdHguY29yZWAsIG5vdCB0aHJvdWdoIGEgaG9vawoKQSBmZXcgZW5naW5lIGRlY2lzaW9ucyBhcmUgbm90IG1hZGUgaW5zaWRlIGEgdHVybiBhbmQgaGF2ZSBubyBnYW1lIHN0YXRlIHRvIGhhbmcgYSBob29rIG9uLiBUaG9zZSBhcmUgZXhwb3NlZCBhcyBhIG1vZHVsZS1sZXZlbCBwb2xpY3kgeW91IHNldCBvbmNlLCBmcm9tIGBob29rcyhjdHgpYCwgd2hpY2ggaXMgdGhlIGVhcmxpZXN0IHBvaW50IHlvdXIgY29kZSBydW5zOiBiZWZvcmUgYHN0YXJ0R2FtZWAsIGFuZCBiZWZvcmUgYm9vdCByZWFkcyBhbnl0aGluZy4KClRoZXJlIGlzIG9uZSBzbyBmYXI6Cgp8IENhbGwgfCBDaGFuZ2VzIHwgRmFpdGhmdWwgZGVmYXVsdCB8CnwtLS18LS0tfC0tLXwKfCBgY3R4LmNvcmUuc2V0UHJlZkVycm9yUG9saWN5KHBvbGljeSBcfCBudWxsKWAgfCBXaGF0IGEgcHJlZiBmaWxlIGRvZXMgd2l0aCBhIGxpbmUgaXQgY2Fubm90IHBhcnNlLiBgeyBjb250aW51ZUFmdGVyRXJyb3IsIHJlcG9ydExpbWl0IH1gLCB3aGV0aGVyIHRoZSByZXN0IG9mIHRoZSBmaWxlIGlzIHN0aWxsIGFwcGxpZWQsIGFuZCBob3cgbWFueSBlcnJvcnMgdGhlIHBsYXllciBpcyB0b2xkIGFib3V0LiB8IGBVUFNUUkVBTV9QUkVGX0VSUk9SX1BPTElDWWA6IHN0b3AgYXQgdGhlIGZpcnN0IGJhZCBsaW5lLCB3aGljaCBpcyB3aGF0IGBwcm9jZXNzX3ByZWZfZmlsZV9uYW1lZGAgZG9lcyBpbiA0LjIuNi4gfAoKYGBganMKaG9va3MoY3R4KSB7CiAgaWYgKGN0eC5mbGFnc1sibXltb2QuZm9yZ2l2aW5nUHJlZkZpbGVzIl0pIHsKICAgIGN0eC5jb3JlLnNldFByZWZFcnJvclBvbGljeSh7IGNvbnRpbnVlQWZ0ZXJFcnJvcjogdHJ1ZSwgcmVwb3J0TGltaXQ6IDIwIH0pOwogIH0KICByZXR1cm4ge307Cn0KYGBgCgpUaGUgc2FtZSBydWxlcyBhcHBseSBoZXJlIGFzIGluIHRoZSByZXN0IG9mIHRoZSBtb2Qgc3lzdGVtOgoKLSBMYXN0IGxvYWQgd2lucywgYW5kIHRoZXJlIGlzIG9ubHkgb25lIHdpbm5lci4gVGhlIGhvc3QgY2FsbHMgZWFjaCBlbmFibGVkIG1vZCdzIGBob29rc2AgaW4gbG9hZCBvcmRlciwgc28gdGhlIGxhc3QgbW9kIHRvIHNldCBhIHBvbGljeSBpcyB0aGUgb25lIHRoYXQgc3RhbmRzLCB3aGljaCBtYXRjaGVzIHdoYXQgdGhlIG1vZCBtYW5hZ2VyJ3Mgcm93IHRlbGxzIHRoZSBwbGF5ZXIgKCJNb3ZlIGxhdGVyIChsb2FkcyBsYXN0LCB3aW5zIGNvbmZsaWN0cykiKS4gVHdvIHBvbGljaWVzIGNhbm5vdCBiZSBtZXJnZWQgaW50byBhIHRoaXJkIHRoYXQgaXMgZWl0aGVyIG9mIHRoZW0sIHdoaWNoIGlzIHdoeSB0aGlzIGlzIG5vdCBhIGBNb2RIb29rc2AgbWVtYmVyLiBJZiB5b3VyIG1vZCBjYXJlcywgc2F5IHNvIGluIGl0cyBSRUFETUU7IGEgcGxheWVyIHdobyBpbnN0YWxscyB0d28gbW9kcyB3aXRoIG9waW5pb25zIGFib3V0IHRoZSBzYW1lIHBvbGljeSBnZXRzIHRoZSBsYXRlciBvbmUuCi0gT25seSBzZXQgaXQgd2hlbiB5b3VyIGZsYWcgaXMgb24uIFNldHRpbmcgdGhlIGZhaXRoZnVsIGRlZmF1bHQgZXhwbGljaXRseSBpcyBub3QgdGhlIHNhbWUgYXMgbGVhdmluZyBpdCBhbG9uZTogaXQgc3RpbGwgbWFrZXMgeW91ciBtb2QgdGhlIHdpbm5lciBhbmQgc3RpbGwgb3ZlcnJpZGVzIGEgbW9kIGxvYWRlZCBiZWZvcmUgeW91cnMuIElmIHRoZSBwbGF5ZXIgc3dpdGNoZWQgeW91ciBwYXRjaCBvZmYsIGRvIG5vdCBjYWxsIGl0IGF0IGFsbC4KLSBEaXNhYmxpbmcgeW91ciBtb2QgcmVtb3ZlcyB0aGUgcG9saWN5LiBBIG1vZHVsZS1sZXZlbCB2YWx1ZSBjb3VsZCBvdXRsaXZlIGEgbW9kIGJlaW5nIGRpc2FibGVkLCBidXQgZGlzYWJsaW5nIG5ldmVyIHRha2VzIGVmZmVjdCBpbnNpZGUgb25lIHByb2Nlc3M6IHRoZSBtYW5hZ2VyIHByb21wdHMgdG8gc2F2ZSBhbmQgcmVsb2FkcywgYW5kIGFmdGVyIHRoZSByZWxvYWQgeW91ciBgaG9va3NgIGlzIG5vdCBjYWxsZWQsIHNvIG5vdGhpbmcgaW5zdGFsbHMgYSBwb2xpY3kgYW5kIHRoZSBlbmdpbmUgaXMgYmFjayBvbiBpdHMgZmFpdGhmdWwgZGVmYXVsdC4gYHNldFByZWZFcnJvclBvbGljeShudWxsKWAgZG9lcyB0aGUgc2FtZSByZXNldCBmb3IgYSB0ZXN0LgoKR3VhcmQgdGhlIGNhbGwgaWYgeW91ciBgZW5naW5lYCByYW5nZSBhbGxvd3MgYSB2ZXJzaW9uIHRoYXQgcHJlZGF0ZXMgdGhlIHNlYW06IGB0eXBlb2YgY3R4LmNvcmUuc2V0UHJlZkVycm9yUG9saWN5ID09PSAiZnVuY3Rpb24iYC4gVGhlIHJhbmdlIGlzIHRoZSByZWFsIGdhdGUgYW5kIHRoZSBjaGVjayBpcyBhIGJhY2t1cC4gV3JpdGUgYSBgY3R4LmxvZ2AgbGluZSB3aGVuIHRoZSBjaGVjayBmYWlscywgc28geW91ciBtb2QgaXMgbm90IHNpbGVudGx5IGluZXJ0LgoKIyMjIGBwcmVmc2A6IHRoZSBwbGFjZSBmb3IgZGF0YSB0aGF0IG91dGxpdmVzIGEgY2hhcmFjdGVyCgpZb3VyIG1vZCBoYXMgdHdvIHBsYWNlcyB0byBwdXQgZGF0YSBhbmQgdGhleSBhcmUgbm90IGludGVyY2hhbmdlYWJsZS4KCnwgfCBsaXZlcyBpbiB8IGRpZXMgd2hlbiB8IGZvciB8CnwtLS18LS0tfC0tLXwtLS18CnwgeW91ciBzYXZlIGJhZyAodGhyb3VnaCBgbWlncmF0ZUJhZ2ApIHwgdGhlIGNoYXJhY3RlcidzIHNhdmUgZmlsZSB8IHRoYXQgY2hhcmFjdGVyIGRvZXMgfCB3aGF0IGhhcHBlbmVkIHRvIHRoaXMgY2hhcmFjdGVyIHwKfCBgY3R4LnByZWZzYCB8IHRoZSBwbGF5ZXIncyBpbnN0YWxsIHwgbmV2ZXIsIHVudGlsIHlvdSBjbGVhciBpdCB8IHdoYXQgdGhpcyBwbGF5ZXIgbGlrZXMgfAoKYHByZWZzYCBpcyBvbmUgSlNPTiB2YWx1ZSwgcmVwbGFjZWQgd2hvbGUsIHNjb3BlZCB0byB5b3VyIG1vZCdzIGlkIGJ5IHRoZSBob3N0Ogp5b3UgY2Fubm90IHJlYWQgYW5vdGhlciBtb2QncywgYW5kIHBhc3NpbmcgYSBkaWZmZXJlbnQgaWQgaXMgbm90IGEgdGhpbmcgeW91IGNhbgpkby4gU2V0dGluZyBgbnVsbGAgZm9yZ2V0cyBpdC4gRXZlcnkgZmFpbHVyZSBpcyBzd2FsbG93ZWQgYW5kIGxvZ2dlZCByYXRoZXIgdGhhbgp0aHJvd24gYXQgeW91OiBhIGZ1bGwgZGlzayBtdXN0IG5vdCB0YWtlIHlvdXIgbW9kIGRvd24gZnJvbSBpbnNpZGUgYSBob29rLgoKV2hlcmUgdGhlcmUgaXMgbm8gc3RvcmFnZSBhdCBhbGwsIGBwcmVmc2Agc3RpbGwgZXhpc3RzIGFuZCBzaW1wbHkgbmV2ZXIKcmVtZW1iZXJzLCBzbyBhIG1vZCB3cml0dGVuIGFnYWluc3QgaXQgcnVucyBvbiBhIGZyb250IGVuZCB0aGF0IGhhcyBub25lLgoKUmVhY2ggZm9yIGBsb2NhbFN0b3JhZ2VgIHlvdXJzZWxmIGFuZCB5b3UgaGF2ZSBoYXJkLWNvZGVkIGEgYnJvd3NlciBpbnRvIGEgbW9kCnRoYXQgd291bGQgb3RoZXJ3aXNlIHJ1biBhbnl3aGVyZSB0aGUgZ2FtZSBkb2VzLgoKIyMgU2V2ZXJhbCBzY3JpcHRzCgpTcGxpdCB5b3VyIHBsdWdpbiB1cCBob3dldmVyIHlvdSBsaWtlIGFuZCBpbXBvcnQgdGhlIHBpZWNlcyByZWxhdGl2ZWx5OgoKYGBganMKLy8gcGx1Z2luLmpzCmltcG9ydCB7IHJvbGwgfSBmcm9tICIuL2xpYi9kaWNlLmpzIjsKaW1wb3J0IHsgZGVzY3JpYmUgfSBmcm9tICIuL2xpYi9mb3JtYXQuanMiOwpgYGAKClR3byBydWxlcywgYm90aCBvZiB0aGVtIHRoaW5ncyBhIGJyb3dzZXIgY2Fubm90IGRvIHJhdGhlciB0aGFuIGNob2ljZXM6CgotICoqUHV0IHRoZSBleHRlbnNpb24gb24uKiogYCIuL2xpYi9kaWNlLmpzImAsIG5vdCBgIi4vbGliL2RpY2UiYC4gRXh0ZW5zaW9ubGVzcwogIHJlc29sdXRpb24gaXMgYSBOb2RlIGFuZCBidW5kbGVyIGNvbnZlbmllbmNlOyBubyBicm93c2VyIGhhcyBldmVyIGRvbmUgaXQuCi0gKipObyBjeWNsZXMuKiogVHdvIGZpbGVzIHRoYXQgaW1wb3J0IGVhY2ggb3RoZXIgY2Fubm90IGJvdGggYmUgbG9hZGVkIGZyb20gYQogIGJyb3dzZXIgZm9sZGVyOiBhIGZpbGUncyBhZGRyZXNzIHRoZXJlIG9ubHkgZXhpc3RzIG9uY2UgaXRzIHRleHQgaXMgZmluYWwsIGFuZCBhCiAgY3ljbGUgbmVlZHMgYm90aCBhZGRyZXNzZXMgYXQgb25jZS4gTW92ZSB0aGUgc2hhcmVkIHBhcnQgaW50byBhIHRoaXJkIGZpbGUuCgpBbnl0aGluZyBlbHNlIHdvcmtzLCBpbiBhcyBtYW55IHN1YmRpcmVjdG9yaWVzIGFzIHlvdSB3YW50LiBJZiBhIHNjcmlwdCBpcyBtaXNzaW5nCm9yIHR3byBpbXBvcnQgZWFjaCBvdGhlciwgdGhlIG1vZCBtYW5hZ2VyIG5hbWVzICp0aG9zZSogZmlsZXMsIG5vdCB5b3VyIGVudHJ5CnBvaW50LgoKIyMgSW1hZ2VzLCBzb3VuZHMsIGFuZCB5b3VyIG93biBkYXRhCgpBc2sgZm9yIGEgVVJMOyBkbyBub3QgYnVpbGQgYSBwYXRoLgoKYGBganMKcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgY3R4LmFzc2V0VXJsKCJ0aWxlcy9vcmMucG5nIikudGhlbigodXJsKSA9PiB7CiAgICBpZiAodXJsKSB7IC8qIGFuIDxpbWc+LCBhIGNhbnZhcyBkcmF3LCBhIHRleHR1cmUgKi8gfQogIH0pOwp9CgovLyBkYXRhIHRvbyAtIHlvdXIgb3duIEpTT04sIG5vdCBhIHJlY29yZCBjb250cmlidXRpb24KY29uc3Qgc3Bhd25zID0gYXdhaXQgZmV0Y2goYXdhaXQgY3R4LmFzc2V0VXJsKCJkYXRhL3NwYXducy5qc29uIikpLnRoZW4oKHIpID0+IHIuanNvbigpKTsKYGBgCgpPbiBkZXNrdG9wIHRoYXQgVVJMIGlzIGFuIGBodHRwOmAgb25lIHVuZGVyIHRoZSBzaGVsbCdzIG93biBzZXJ2ZXI7IGluIGEgYnJvd3Nlcgp0YWIgaXQgaXMgYSBgYmxvYjpgLiBBIG1vZCB0aGF0IGhhcmQtY29kZXMgZWl0aGVyIGlzIGEgbW9kIHRoYXQgcnVucyBvbiBvbmUgb2YgdGhlCnR3byBmcm9udCBlbmRzLiBUaGUgVVJMIGxhc3RzIGZvciB0aGUgc2Vzc2lvbiwgYW5kIGFza2luZyB0d2ljZSBnaXZlcyB5b3UgdGhlIHNhbWUKb25lLgoKYGN0eC5hc3NldFVybGAgb25seSBldmVyIHJlYWNoZXMgKip5b3VyIG93bioqIGZvbGRlcjogdGhlIGlkIGlzIGZpeGVkIGJ5IHRoZSBob3N0LAphbmQgYSBwYXRoIHRoYXQgY2xpbWJzIG91dCBvZiBpdCBpcyByZWZ1c2VkLgoKIyMgQmFyZSBzcGVjaWZpZXJzIHN0aWxsIGRvIG5vdCB3b3JrCgpgaW1wb3J0IHsgdHVubmVsQXV4IH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtY29yZSJgIGNhbm5vdCByZXNvbHZlIGZyb20gYSBmb2xkZXIsIGFuZCB5b3UgZG8gbm90IG5lZWQgaXQ6IHRoZSBlbmdpbmUgaXMgYWxyZWFkeSBsaXZlIGFzIGBjdHguY29yZWAuIEl0IGlzIHRoZSBvbmUgaW1wb3J0IGEgZm9sZGVyIHBsdWdpbiBjYW5ub3QgaGF2ZSwgYW5kIHdoZW4gYSBwbHVnaW4gdHJpZXMgaXQsIHRoZSBtb2QgbWFuYWdlciBleHBsYWlucyB0aGlzIGluc3RlYWQgb2Ygc2hvd2luZyB0aGUgYnJvd3NlcidzIG93biBlcnJvci4KCiMjIFZlcnNpb24gY29udHJhY3QKCmBtb2RBcGlgIGlzIGFuIGludGVnZXIsIGFuZCB0aGUgaG9zdCBhY2NlcHRzIGEgd2luZG93OiBldmVyeXRoaW5nIGZyb20gYE1PRF9BUElfTUlOYCB1cCB0byBgTU9EX0FQSV9WRVJTSU9OYCBpbmNsdXNpdmUgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1wbHVnaW4udHNgKS4gQSBwbHVnaW4gaW5zaWRlIHRoZSB3aW5kb3cgYnV0IGJlbG93IHRoZSBjdXJyZW50IHZlcnNpb24gbG9hZHMgYW5kIGlzIHJlcG9ydGVkIGFzIERFUFJFQ0FURUQsIHdoaWNoIGdpdmVzIGl0cyBhdXRob3IgYSByZWxlYXNlJ3Mgd2FybmluZyBiZWZvcmUgdGhlIG1pbmltdW0gbW92ZXMgcGFzdCBpdC4gVG9kYXkgYE1PRF9BUElfTUlOYCBhbmQgYE1PRF9BUElfVkVSU0lPTmAgYXJlIGJvdGggYDFgLCBzbyB0aGUgd2luZG93IGlzIG9uZSB2YWx1ZSB3aWRlIGFuZCBiZWhhdmVzIGxpa2UgYW4gZXhhY3QgbWF0Y2gsIGJ1dCB0aGUgY29kZSBjaGVja3MgYSB3aW5kb3csIGFuZCBgTU9EX0NPTVBBVElCSUxJVFkubWRgIGRvY3VtZW50cyB0aGUgdHdvLXJlbGVhc2UgcnVsZSBidWlsdCBvbiBpdC4KCk91dHNpZGUgdGhlIHdpbmRvdyB0aGUgcGx1Z2luIGRvZXMgbm90IGxvYWQsIGFuZCB0aGUgbW9kIG1hbmFnZXIgbmFtZXMgYm90aCBudW1iZXJzIGFuZCB3aGljaCBzaWRlIGlzIGJlaGluZDogYSB0b28tbmV3IG1vZCBuZWVkcyBhIG5ld2VyIGdhbWUsIGFuZCBhIHRvby1vbGQgb25lIG5lZWRzIGEgbW9kIHVwZGF0ZS4gQSBiYXJlICJpbmNvbXBhdGlibGUiIHdvdWxkIHNlbmQgdGhlIHBsYXllciB0byB0aGUgd3JvbmcgcGxhY2UuCgpJdCBpcyBkZWNsYXJlZCBpbiB0aGUgbWFuaWZlc3QsIG5vdCBvbmx5IGluc2lkZSBgcGx1Z2luLmpzYCwgc28gYW4gaW5jb21wYXRpYmxlIHBsdWdpbiBjYW4gYmUgcmVmdXNlZCBiZWZvcmUgaXQgaXMgaW1wb3J0ZWQuIEEgdmVyc2lvbiBjaGVjayBpbnNpZGUgdGhlIG1vZHVsZSBvbmx5IHJ1bnMgYWZ0ZXIgdGhlIG1vZHVsZSdzIHRvcC1sZXZlbCBjb2RlIGhhcyBhbHJlYWR5IGV4ZWN1dGVkLCB3aGljaCBpcyB0b28gbGF0ZSBmb3IgY29kZSBsb2FkZWQgZnJvbSBhIGZvbGRlciBhbnlvbmUgY2FuIHdyaXRlIGludG8uCgpBIHNjaGVtYSAyIG1hbmlmZXN0IHN0YXRlcyBgYXBpYCwgYSBzZW12ZXIgcmFuZ2UsIGluc3RlYWQgb2YgYG1vZEFwaWAuIFRoZSBnYW1lIHJ1bnMgYW4gYGluLXByb2Nlc3NgIG1vZCB3aGVuIHRoZSByYW5nZSBpbmNsdWRlcyBBUEkgMS4wLjAsIGFuZCBhbiBgaW4tcHJvY2Vzc2Agb3IgYHdvcmtlcmAgbW9kIHdyaXR0ZW4gYWdhaW5zdCBBUEkgMiB3aGVuIGl0IGluY2x1ZGVzIEFQSSAyIChgPj0yLjAuMCA8My4wLjBgKS4gQSByYW5nZSB0aGF0IGluY2x1ZGVzIG5vbmUgb2YgdGhlc2UgZm9yIHRoZSBtb2QncyBydW50aW1lIGlzIHJlZnVzZWQsIGFuZCB0aGUgTW9kcyBzY3JlZW4gbmFtZXMgdGhlIHJhbmdlIGFuZCB0aGUgcnVudGltZS4gVGhlIHJldGlyZWQgV29ya2VyIHByZXZpZXcgQVBJLCBgMi4wLjAtd29ya2VyYCwgaXMgYSBwcmVyZWxlYXNlLCBzbyBhIHJhbmdlIG92ZXIgdGhlIHN0YWJsZSBBUEkgMiBsZWF2ZXMgaXQgb3V0LCBhbmQgYSBtb2QgZGVjbGFyaW5nIGl0IGlzIHJlZnVzZWQgd2l0aCBhIG5vdGUgdG8gcmVidWlsZCBpdCBhZ2FpbnN0IEFQSSAyLgoKIyMgV2hhdCBoYXMgdG8gYmUgdHJ1ZSBiZWZvcmUgeW91ciBjb2RlIHJ1bnMKCkluIG9yZGVyLCBhbmQgYWxsIG9mIGl0IGJlZm9yZSB0aGUgaW1wb3J0OgoKMS4gdGhlIGZvbGRlciBzaGlwcyBgcGx1Z2luLmpzYCAoZnJvbSB0aGUgZGlyZWN0b3J5IGxpc3RpbmcsIHdpdGggbm8gcHJvYmluZyk7CjIuIHRoZSBtb2QgaXMgKiplbmFibGVkKiosIHNpbmNlIGEgZGlzYWJsZWQgbW9kJ3MgY29kZSBkb2VzIG5vdCBleGlzdCwgdGhlIHNhbWUgcnVsZSBhcwogICBhIGRpc2FibGVkIG1vZCdzIHBhdGNoZXM7CjMuIHRoZSBtYW5pZmVzdCBkZWNsYXJlcyB0aGUgYHBsdWdpbmAgZmFjZXQgKHZpYSBgc2hhcGVgIG9yIGBmYWNldHNgKTsKNC4gYG1vZEFwaWAgbWF0Y2hlczsKNS4gdGhlIHBsYXllciBoYXMgc2FpZCB5ZXMgb3Igbm8gdG8gZXZlcnkgY2FwYWJpbGl0eSB0aGUgbW9kJ3MgdGllciBhbGxvd3MsIGFuZCBoYXMgbm90IHJlZnVzZWQgb25lIHRoZSBtb2QgbmVlZHMgaW4gb3JkZXIgdG8gc3RhcnQuIFRoZSBtb2QncyBgY3R4YCBpcyBidWlsdCBmcm9tIHRoZSBjYXBhYmlsaXRpZXMgaXQgZW5kcyB1cCB3aXRoLCBub3QgZnJvbSB0aGUgbWFuaWZlc3QncyBsaXN0LgoKVGhlbiB0aGUgbW9kdWxlIGlzIGltcG9ydGVkIGFuZCBpdHMgZGVmYXVsdCBleHBvcnQgaXMgc2hhcGUtY2hlY2tlZC4KCk5vdGhpbmcgYWJvdXQgYSBiYWQgcGx1Z2luIGNhbiBzdG9wIHRoZSBnYW1lIGJvb3RpbmcuIEEgaGFuZC1lZGl0ZWQgbWFuaWZlc3QsIGEKaGFsZi1maW5pc2hlZCBkb3dubG9hZCwgYSBwbHVnaW4gdGhhdCB0aHJvd3MgYXQgaW1wb3J0IG9yIGluc2lkZSBgaG9va3MoKWA6IGVhY2gKYmVjb21lcyBvbmUgbGluZSB0aGUgbW9kIG1hbmFnZXIgc2hvd3MsIGFuZCB0aGUgb3RoZXIgbW9kcyBjYXJyeSBvbi4KCiMjIyBNZXNzYWdlIHR5cGVzIGFyZSBkZWNsYXJlZCBhcyBEQVRBLCBub3QgaW4gYHJlZ2lzdGVyKClgCgpgcmVnaXN0ZXIoKWAgcnVucyBhZnRlciB0aGUgZ2FtZSBoYXMgYmVlbiBib3VuZCAoMzg0IHRvcC1sZXZlbCBzdGF0ZW1lbnRzIGFmdGVyKSwgc28gYSBtZXNzYWdlIHR5cGUgZGVjbGFyZWQgdGhlcmUgaXMgZGVjbGFyZWQgYWZ0ZXIgZXZlcnkgcmVjb3JkIHRoYXQgY291bGQgaGF2ZSBuYW1lZCBpdC4gQSBjb250ZW50LW9ubHkgcGFjayBoYXMgbm8gYHJlZ2lzdGVyKClgIGF0IGFsbCwgc28gdGhlIHBhY2tzIG1vc3QgbGlrZWx5IHRvIG5lZWQgYSBtZXNzYWdlIHR5cGUgY291bGQgbm90IGRlY2xhcmUgb25lIHRoZXJlIGFueXdheS4KClNvIGlmIHlvdXIgcGFjaydzIG93biBzcGVsbCwgYmxvdyBtZXRob2QsIHN1bW1vbiBvciBwcm9qZWN0aW9uIGNhcnJpZXMgYSBgbXNndDpgLCBzaGlwIHRoZSB0eXBlIGFzIGEgYG1lc3NhZ2VfdHlwZWAgcmVjb3JkIGZpbGUgaW5zdGVhZDoKCmBgYGpzb24KeyAicmVjb3JkcyI6IFsKICB7ICJuYW1lIjogIlNPVUxGSVJFIiwgInNvdW5kIjogInNvdWxmaXJlIiwgInNvdW5kcyI6ICJzZl9vbmUgc2ZfdHdvIiB9Cl0gfQpgYGAKCmBuYW1lYCBpcyB0aGUgYmFyZSBgTVNHX2AgbmFtZSBhIGBtc2d0OmAgdXNlcywgYHNvdW5kYCBpcyB0aGUgYHNvdW5kLnByZmAga2V5IHRoZSB0eXBlIHBsYXlzIHVuZGVyLCBhbmQgYHNvdW5kc2AgaXMgdGhlIHNwYWNlLXNlcGFyYXRlZCBzYW1wbGUgbGlzdCBib3VuZCB0byBpdC4gVGhlIHJlY29yZCBjYXJyaWVzIGFsbCB0aHJlZSBzbyB0aGF0IGEgcGFjayBjYW4gYmluZCBzYW1wbGVzIHRvIHRoZSB0eXBlIGl0IG5hbWVzLCBub3QganVzdCBuYW1lIGl0LiBObyBjYXBhYmlsaXR5IGFuZCBubyBgcGx1Z2luLmpzYCBhcmUgbmVlZGVkLiBJdCBpcyBhIHJlY29yZCBmaWxlIGxpa2UgYW55IG90aGVyLCBhbmQgYSBwYWNrIGNhbiBhbHJlYWR5IGFkZCBhIHByb2plY3Rpb24sIGEgbW9uc3RlciwgYW4gYXJ0aWZhY3QgYW5kIGFuIGVnbyBpdGVtIHdpdGhvdXQgYSBjYXBhYmlsaXR5LCBzbyBnYXRpbmcgdGhpcyBvbmUgcmVjb3JkIGZpbGUgd291bGQgcHJvdGVjdCBub3RoaW5nLgoKRGVjbGFyYXRpb25zIGFyZSBhZGRpdGl2ZSwgYXR0cmlidXRlZCB0byB0aGUgcGFjayB0aGF0IGNvaW5lZCB0aGVtLCBhbmQgaWRlbXBvdGVudCBhY3Jvc3MgdGhlIG5ldy1nYW1lIGFuZCBsb2FkIHBhdGhzLiBUaGV5IG5ldmVyIHRocm93OiBhIHJlZnVzZWQgZGVjbGFyYXRpb24gbG9zZXMgdGhhdCBvbmUgbWVzc2FnZSB0eXBlIGFuZCByZXBvcnRzIGl0IGluc3RlYWQgb2Ygc3RvcHBpbmcgdGhlIGJvb3QuCgpgaG9zdC5tZXNzYWdlcy5kZWZpbmUoLi4uKWAgc3RpbGwgZXhpc3RzIGFuZCBpcyBzdGlsbCB0aGUgcmlnaHQgY2FsbCBmb3IgYSB0eXBlIGEgcGx1Z2luIGNvaW5zIGF0IHJ1bnRpbWUsIGZvciBleGFtcGxlIHRvIHJlLXBvaW50IHNvdW5kcy4gSXQgaXMgb25seSB0aGUgd3JvbmcgcGxhY2UgZm9yIGEgdHlwZSB5b3VyIG93biByZWNvcmRzIG5hbWUuCgojIyBGcm9udC1lbmQgcmVwbGFjZW1lbnQKCmBmcm9udGVuZChjdHgpYCBpcyBhbiBvcHRpb25hbCBgcGx1Z2luLmpzYCBtZW1iZXIuIEl0IHJldHVybnMgYSBzaW5rIGZvciB0aGUKbGl2ZSBtYXAgc3RyZWFtIChvciBgdW5kZWZpbmVkYCB0byBkZWNsaW5lKToKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCiAgZnJvbnRlbmQoY3R4KSB7CiAgICByZXR1cm4gewogICAgICBwcmVzZW50KGZyYW1lKSB7CiAgICAgICAgLy8gZnJhbWUuY2VsbHM6IHNlbWFudGljIHRlcnJhaW4vb2NjdXBhbnQgbGF5ZXJzIGFuZCB2aXNpYmlsaXR5LAogICAgICAgIC8vIG5vdCB0ZXJtaW5hbCBjaGFyYWN0ZXJzIHRoYXQgbmVlZCByZXZlcnNlLXBhcnNpbmcuCiAgICAgIH0sCiAgICB9OwogIH0sCn07CmBgYAoKQSBjb21wbGV0ZSB3b3JrZWQgZXhhbXBsZSBsaXZlcyBpbiBgc2FtcGxlcy9ibHVlcHJpbnQtdmlldy9gLCBhIGZvbGRlciB5b3UgY2FuIGNvcHkgc3RyYWlnaHQgaW50byBhIG1vZHMgZm9sZGVyLiBJdCBkcmF3cyBhIGJsdWVwcmludCBvZiB0aGUgZHVuZ2VvbiBmcm9tIHRoZSBmcmFtZSdzIHNlbWFudGljIGxheWVycy4gYHBhY2thZ2VzL3dlYi9zcmMvc2FtcGxlLWJsdWVwcmludC5ub2RlLnRlc3QudHNgIGxvYWRzIHRoYXQgZm9sZGVyIGJ5IHBhdGggYW5kIHJlY29yZHMgd2hhdCBpdCBkcmF3cywgc28gdGhlIHNhbXBsZSBpcyB0ZXN0ZWQgY29kZS4gSXQgaGFzIGFsc28gYmVlbiBydW4gaW4gdGhlIGluc3RhbGxlZCBkZXNrdG9wIGJ1aWxkLCB3aGljaCBpcyB3aGVyZSB0aGUgbWlzc2luZyB2aWV3cG9ydCBnZW9tZXRyeSBzaG93ZWQgdXAgYXMgYSByZWFsIHByb2JsZW07IHNlZSBbV2hlcmUgeW91IG1heSBkcmF3XSgjd2hlcmUteW91LW1heS1kcmF3LWZyYW1lcmVnaW9ucykgYmVsb3cgZm9yIHdoYXQgaXQgcmVhZHMgbm93LgoKVGhlIG1hbmlmZXN0IG11c3QgcmVxdWVzdCBgZGlzcGxheTpyZXBsYWNlYCwgYW5kIHRoZSBwbGF5ZXIgbXVzdCBhcHByb3ZlIGl0OgoKYGBganNvbgp7ICJzaGFwZSI6ICJwbHVnaW4iLCAiY2FwYWJpbGl0aWVzIjogWyJkaXNwbGF5OnJlcGxhY2UiXSB9CmBgYAoKRGVjbGFyaW5nIGBmcm9udGVuZGAgd2l0aG91dCBpdCBpcyByZXBvcnRlZCBieSBuYW1lLCBhbmQgdGhlIGdhbWUga2VlcHMgZHJhd2luZy4gSXQgaXMgbm90IGEgYHJlZ2lzdHJ5OmAgZG9tYWluLCBhbmQgYHJlZ2lzdHJ5OipgIGRvZXMgbm90IGNvdmVyIGl0OiBhbiBvdmVycmlkZSBncmFudCBjaGFuZ2VzIG9uZSBuYW1lZCBnYW1lIHN5c3RlbSBhbW9uZyBtYW55LCB3aGlsZSB0aGlzIG9uZSBtZWFucyBldmVyeXRoaW5nIHRoZSBwbGF5ZXIgc2VlcyBvZiB0aGUgZHVuZ2VvbiBjb21lcyBmcm9tIHRoZSBtb2QuIGBjb250cm9sbGVyYCByZXF1aXJlcyBgY29tbWFuZDphZGRgIGZvciB0aGUgc2FtZSByZWFzb24uCgpGb3IgVHlwZVNjcmlwdCwgaW1wb3J0IHRoZSBwdWJsaWMgZGF0YSBjb250cmFjdCB0eXBlLW9ubHkgZnJvbSB0aGUgU0RLOiBgaW1wb3J0IHR5cGUgeyBXb3JsZEZyYW1lLCBXb3JsZEZyYW1lU2luayB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiYC4gVGhlIGJ1aWxkIGVyYXNlcyB0aGF0IGltcG9ydCwgc28gYSBmb2xkZXIgcGx1Z2luIHN0aWxsIGhhcyBubyBiYXJlIHJ1bnRpbWUgZGVwZW5kZW5jeS4gVGhlcmUgaXMgb25lIHNsb3QsIGFuZCB0aGUgbGFzdCBlbGlnaWJsZSBtb2QgaW4gbG9hZCBvcmRlciB3aW5zOyBlYXJsaWVyIGZyb250ZW5kIGZhY3RvcmllcyBhcmUgbm90IGNhbGxlZC4gVGhlIGhvc3QgaGFuZHMgdGhlIHdpbm5lciBhIGZyb3plbiwgc3RydWN0dXJhbGx5IG93bmVkIHNuYXBzaG90IHBlciByZWFsIG1hcCByZXBhaW50LiBZb3UgY2FuIGtlZXAgaXQgZm9yIGFuIGFuaW1hdGlvbiBmcmFtZSwgYnV0IGl0IGNhbm5vdCBleHBvc2Ugb3IgbXV0YXRlIHRoZSBsaXZlIHBsYXllci1ncmlkIG9iamVjdC4gQSBmcm9udGVuZCB0aGF0IHRocm93cyBsb3NlcyB0aGF0IGRpc3BsYXkgYXR0ZW1wdCwgYW5kIHRoZSBnYW1lJ3Mgb3duIHJlbmRlcmVyIHRha2VzIG92ZXIgYWdhaW4uCgpUaGUgZ2FtZSdzIG93biByZW5kZXJlciBpcyBjYW5kaWRhdGUgemVybyBpbiB0aGUgc2FtZSBsaXN0LiBJdCBkZWNsYXJlcyBgZnJvbnRlbmRgIGFuZCBgZGlzcGxheTpyZXBsYWNlYCB0aGUgc2FtZSB3YXkgYSBtb2QgZG9lcywgYW5kIGl0IHdpbnMgd2hlbmV2ZXIgbm8gbW9kIG91dHJhbmtzIGl0OyB0aGUgc2VsZWN0aW9uIG5ldmVyIGZhbGxzIHRocm91Z2ggdG8gaXQgYXMgYSBmYWxsYmFjay4gU28gdGhlIHNlYW0gaXMgcHJvdmVuIGFnYWluc3QgYSByZWFsIGZyb250IGVuZDogdGhlIG9uZSB0aGUgZ2FtZSBzaGlwcyBpcyBidWlsdCB0aHJvdWdoIGl0LgoKVGhpcyByZXBsYWNlcyB0aGUgbWFwIGRpc3BsYXkgb25seS4gTWVudXMgc3RpbGwgdXNlIGByZWdpc3RyeTptZW51YCwgYW5kIGlucHV0IHN0aWxsIGVudGVycyB0aHJvdWdoIHRoZSBob3N0J3MgZGV2aWNlLW5ldXRyYWwgaW5wdXQgZG9vcjsgZ2FtZXBhZCBiaW5kaW5ncyBhbmQgd2hvbGUtc2NyZWVuIG93bmVyc2hpcCBhcmUgbGF0ZXIgc2VhbXMuCgojIyMgV2hlcmUgeW91IG1heSBkcmF3OiBgZnJhbWUucmVnaW9uc2AKCkV2ZXJ5IGZyYW1lIGNhcnJpZXMgdGhlIG5hbWVkIHBhcnRzIG9mIHRoZSBzY3JlZW4sIHNvIGEgZnJvbnQgZW5kIG5vIGxvbmdlciBoYXMKdG8gZ3Vlc3Mgd2hlcmUgdGhlIG1hcCBpczoKCmBgYGpzCnByZXNlbnQoZnJhbWUpIHsKICBjb25zdCBib3ggPSBmcmFtZS5yZWdpb25zPy5tYXA/LnBpeGVsczsKICBpZiAoIWJveCkgcmV0dXJuOyAgICAgICAgICAgICAgICAgICAgICAgLy8gbm8gZ2VvbWV0cnk6IGRyYXcgTk9USElORwogIGNhbnZhcy5zdHlsZS5sZWZ0ID0gYCR7Ym94Lnh9cHhgOwogIGNhbnZhcy5zdHlsZS50b3AgPSBgJHtib3gueX1weGA7CiAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7Ym94LndpZHRofXB4YDsKICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7Ym94LmhlaWdodH1weGA7CiAgLy8gLi4uCn0KYGBgCgpgcmVnaW9uc2AgaGFzIGBtYXBgLCBhbmQsIGRlcGVuZGluZyBvbiB0aGUgcGxheWVyJ3Mgc2lkZWJhciBtb2RlLCBgbWVzc2FnZXNgLApgc2lkZWJhcmAgYW5kIGBzdGF0dXNgLiBFYWNoIGNhcnJpZXMgYGNlbGxzYCAoYSByZWN0YW5nbGUgb2YgdGhlIGNoYXJhY3RlciBncmlkKQphbmQgYHBpeGVsc2AgKENTUyBwaXhlbHMgaW4gdGhlIGdhbWUgd2luZG93J3MgY29vcmRpbmF0ZSBzcGFjZSwgdGhlIHNwYWNlCmBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKWAgYW5zd2VycyBpbikuIGBtYXBgIGlzIHlvdXJzIHdoaWxlIHlvdSBob2xkIHRoZQpkaXNwbGF5OyB0aGUgb3RoZXJzIGFyZSBjb3JlJ3MgYW5kIGFyZSBwdWJsaXNoZWQgc28geW91IGNhbiBzdGF5IG9mZiB0aGVtLCBvcgpjb3ZlciB0aGVtIGtub3dpbmcgd2hhdCB5b3UgYXJlIGNvdmVyaW5nLgoKVGhyZWUgdGhpbmdzIHdvcnRoIGtub3dpbmc6CgotICoqVGhlIG5hbWVzIGFyZSByb2xlcywgbm90IHBsYWNlcy4qKiBgc2lkZWJhcmAgaXMgdGhlIDEzLWNvbHVtbiBsZWZ0IGNvbHVtbiBpbgogIHRoZSBjbGFzc2ljIGxheW91dCBhbmQgYSBvbmUtbGluZSBoZWFkZXIgdW5kZXIgdGhlIG1lc3NhZ2VzIGluIHRoZSBjb21wYWN0CiAgb25lLCBhbmQgaXQgaXMgKiphYnNlbnQqKiB3aGVuIHRoZSBwbGF5ZXIgaGFzIHR1cm5lZCB0aGUgdml0YWxzIG9mZi4gUmVhZCBpdAogIGV2ZXJ5IGZyYW1lIHJhdGhlciB0aGFuIGNhY2hpbmcgaXQ6IGl0IG1vdmVzIG9uIGEgcmVzaXplLCBvbiBhIHNpZGViYXItbW9kZQogIGNoYW5nZSwgYW5kIHdoZW4gYSBuYXJyb3cgd2luZG93IGZvcmNlcyB0aGUgY29tcGFjdCBsYXlvdXQuCi0gKipgcmVnaW9uc2AgaXMgb3B0aW9uYWwuKiogQSBob3N0IHdpdGggbm8gZml0dGVkIHN1cmZhY2UgaGFzIG5vbmUgdG8gZ2l2ZS4KICBUcmVhdCB0aGF0IGFzICJkcmF3IG5vdGhpbmciLCBub3QgYXMgImZhbGwgYmFjayB0byB0aGUgd2luZG93IjogZmFsbGluZyBiYWNrCiAgcmVpbnRyb2R1Y2VzIHRoZSBkZWZlY3QgYmVsb3csIGludGVybWl0dGVudGx5LgotICoqVGhlIG1hcCBpcyBvbmUgY29sdW1uIG5hcnJvd2VyIHRoYW4gdGhlIHNjcmVlbi4qKiBUaGF0IGlzIHVwc3RyZWFtJ3Mgb3duCiAgcnVsZSAoYFNDUkVFTl9XSURgIHJlc2VydmVzIHRoZSByaWdodG1vc3QgY29sdW1uKSwgbm90IGEgcm91bmRpbmcgZXJyb3IuCgpUaGUgZm91ciByZWdpb25zIGN1cnJlbnRseSB0aWxlIHRoZSBzY3JlZW4gd2l0aG91dCBvdmVybGFwcGluZywgYW5kIHRoZSBzZXQgaXMgY2xvc2VkLiBOZWl0aGVyIHdpbGwgc3RheSB0cnVlLiBUaGUgVUkgc2VhbSAoYE1PRF9SRUFDSC5tZGAgZ2FwIDIxKSBtYWtlcyBhIGZ1bGwgc2NyZWVuIGNvbXBvc2VkIG9mIHJlZ2lvbnMgaW5zdGVhZCBvZiBjb3ZlcmluZyB0aGVtLCBzbyByZWdpb25zIHdpbGwgb3ZlcmxhcCwgZ2FpbiBhIHN0YWNraW5nIG9yZGVyLCBhbmQgYmUgY3JlYXRhYmxlIGJ5IGEgbW9kOyB0aGUgcHVycG9zZSBpcyBhIGZsb2F0aW5nIHdpbmRvdyBvdmVyIGEgbWFwIHRoYXQgaXMgc3RpbGwgYmVpbmcgZHJhd24uIE5vdGhpbmcgaW4gdGhlIGNvZGUgYWJvdmUgY2hhbmdlcyB3aGVuIHRoYXQgbGFuZHMsIGJ1dCBjb2RlIHRoYXQgaW5mZXJzIGRpc2pvaW50bmVzcyBicmVha3MuIFJlYWQgYHJlZ2lvbnMubWFwYCBhbmQgZHJhdyBpbiBpdDsgZG8gbm90IGNvbXB1dGUgeW91ciByZWN0YW5nbGUgYnkgc3VidHJhY3RpbmcgdGhlIG90aGVycy4KCkNvdmVyaW5nIHRoZSB3aW5kb3cgY29zdHMgdGhlIHBsYXllciBldmVyeXRoaW5nIGVsc2Ugb24gaXQuIEJlZm9yZSByZWdpb25zIGV4aXN0ZWQsIHJ1bm5pbmcgdGhlIHNhbXBsZSBpbiB0aGUgaW5zdGFsbGVkIGJ1aWxkIHNob3dlZCB0aGUgcHJvYmxlbTogYGRpc3BsYXk6cmVwbGFjZWAgcmVwbGFjZXMgdGhlIG1hcCBvbmx5LCBzbyBjb3JlIHN0b3BzIGRyYXdpbmcgdGhlIGR1bmdlb24gYnV0IGdvZXMgb24gZHJhd2luZyB0aGUgc2lkZWJhciwgdGhlIG1lc3NhZ2UgbGluZSBhbmQgZXZlcnkgbWVudS4gQSBmcm9udCBlbmQgdGhhdCBjb3ZlcmVkIHRoZSB3aW5kb3cgcGFpbnRlZCBvdmVyIGFsbCBvZiB0aGF0LCBzbyB0aGUgcGxheWVyIGNvdWxkIG5vdCByZWFkIHRoZWlyIGhpdCBwb2ludHMsIHNlZSBhIG1lc3NhZ2UsIG9yIG9wZW4gdGhlIE1vZHMgc2NyZWVuIHRvIHR1cm4gdGhlIG1vZCBvZmYsIGFuZCBoYWQgdG8gZWRpdCB0aGUgZW5hYmxlZCBzZXQgYnkgaGFuZC4KCkEgZnJvbnQgZW5kIG1heSBzdGlsbCB0YWtlIHRoZSB3aG9sZSB3aW5kb3csIGFuZCBhbiBpc29tZXRyaWMgb3IgM0QgdmlldyBtYXkgd2FudCB0by4gV2l0aCByZWdpb25zLCB0aGF0IGlzIGEgY2hvaWNlIG1hZGUga25vd2luZyB3aGF0IGdldHMgY292ZXJlZCwgaW5zdGVhZCBvZiB0aGUgb25seSBvcHRpb24gYSBtb2QgaGFkLgoKIyMjIEtub3dpbmcgd2hlbiB5b3UgYXJlIGNvdmVyZWQ6IGBmcmFtZS5zdGFja2AKCmBmcmFtZS5yZWdpb25zYCBzYXlzIHdoZXJlIHRoZSBtYXAgaXMuIGBmcmFtZS5zdGFja2Agc2F5cyB3aGF0IGlzIG9uIHRvcCBvZiBpdDoKZXZlcnkgcmVnaW9uIG9uIHNjcmVlbiwgYm90dG9tIHRvIHRvcCwgYmVnaW5uaW5nIHdpdGggdGhlIGZvdXIgYmFzZSB0aWxlcwpgcmVnaW9uc2AgbmFtZXMuIEEgcmVnaW9uIGxhdGVyIGluIHRoZSBhcnJheSBpcyBkcmF3biBvdmVyIG9uZSBlYXJsaWVyIGluIGl0LgpGaW5kIHRoZSBlbnRyeSB3aG9zZSBgaWRgIGlzIGAibWFwImA7IGlmIGFueSBlbnRyeSBhZnRlciBpdCBvdmVybGFwcyBpdHMgYGNlbGxzYCwKaGlkZSB5b3VyIGRpc3BsYXkuCgpgYGBqcwpmdW5jdGlvbiBjb3ZlcmVkVXAoZnJhbWUpIHsKICBjb25zdCBzdGFjayA9IGZyYW1lLnN0YWNrOwogIGlmICghc3RhY2spIHJldHVybiBmYWxzZTsgICAgICAgICAgICAgICAgICAvLyB0aGlzIGhvc3QgcHVibGlzaGVzIG5vbmUKICBjb25zdCBhdCA9IHN0YWNrLmZpbmRJbmRleCgocikgPT4gci5pZCA9PT0gIm1hcCIpOwogIGlmIChhdCA8IDApIHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAvLyBhIHN0YWNrIHRoYXQgc3RvcHBlZCBuYW1pbmcgdGhlIG1hcAogIGNvbnN0IG1hcCA9IHN0YWNrW2F0XS5jZWxsczsKICByZXR1cm4gc3RhY2suc2xpY2UoYXQgKyAxKS5zb21lKChyKSA9PgogICAgci5jZWxscy5jb2wgPCBtYXAuY29sICsgbWFwLmNvbHMgJiYgbWFwLmNvbCA8IHIuY2VsbHMuY29sICsgci5jZWxscy5jb2xzICYmCiAgICByLmNlbGxzLnJvdyA8IG1hcC5yb3cgKyBtYXAucm93cyAmJiBtYXAucm93IDwgci5jZWxscy5yb3cgKyByLmNlbGxzLnJvd3MpOwp9CmBgYAoKYHNhbXBsZXMvYmx1ZXByaW50LXZpZXcvcGx1Z2luLmpzYCBzaGlwcyB0aGlzIGZ1bmN0aW9uLiBUaGUgZ2FtZSdzIG93biB2ZXJzaW9uIGlzIGBvY2NsdWRlcnNPZmAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvcmVnaW9ucy50c2AsIHdpdGggYHJlZ2lvbnNJbnRlcnNlY3RgICh0aGUgZm91ciBjb21wYXJpc29ucyBhYm92ZSkgYmVzaWRlIGl0LiBOZWl0aGVyIGlzIHJlYWNoYWJsZSBmcm9tIGEgbW9kLCBiZWNhdXNlIG9mIGhvdyBtb2RzIGFyZSBsb2FkZWQ6IGEgbW9kdWxlIGZldGNoZWQgZnJvbSBhIG1vZCBmb2xkZXIgY2Fubm90IHJlc29sdmUgYSBwYWNrYWdlIGJ5IG5hbWUsIHNvIGBuZW8tYW5nYmFuZC1tb2QtYnVpbGRgIG1hcmtzIGV2ZXJ5IGJhcmUgc3BlY2lmaWVyIGV4dGVybmFsIGFuZCBmYWlscyB0aGUgYnVpbGQgaWYgYW55IHN1cnZpdmUuIFR5cGVzIGNyb3NzIHRoYXQgbGluZSBiZWNhdXNlIHRoZSBidWlsZCBlcmFzZXMgdGhlbTsgZnVuY3Rpb25zIGRvIG5vdC4gUHVibGlzaGluZyB0aGVzZSB0d28gdGhyb3VnaCB0aGUgU0RLIHdvdWxkIHB1Ymxpc2ggbWVtYmVycyBubyBtb2QgY291bGQgaW1wb3J0LCBzbyB3cml0ZSB5b3VyIG93biBhcyBhYm92ZS4gSXQgaXMgbmluZSBsaW5lczsga2VlcCB0aGUgYHVuZGVmaW5lZGAgY2FzZSBpbiBwYXJ0aWN1bGFyLgoKVGhlIGhvc3QgdGVsbHMgeW91IHdoZW4gdGhlIHN0YWNrIGNoYW5nZXMuIFRoZSBnYW1lJ3Mgb3duIHNjcmVlbnMgKHRoZSBpbnZlbnRvcnksIHRoZSBrbm93bGVkZ2UgYnJvd3NlciwgdGhlIE1vZHMgc2NyZWVuIHlvdSB3b3VsZCB1c2UgdG8gdHVybiB0aGlzIG1vZCBvZmYpIHJlcGFpbnQgdGhlIHRlcm1pbmFsIHdpdGhvdXQgcHJvZHVjaW5nIGEgd29ybGQgZnJhbWUsIGJlY2F1c2UgYSBzY3JlZW4gcmVkcmF3cyBmcm9tIGl0cyBvd24ga2V5IGxvb3AuIFNvIHdoZW4gdGhlIHN0YWNrIGNoYW5nZXMgd2l0aCBubyBuZXcgZnJhbWUgYmVoaW5kIGl0LCB0aGUgaG9zdCBwcmVzZW50cyB5b3VyIGxhc3QgZnJhbWUgYWdhaW4gd2l0aCBgc3RhY2tgIHVwZGF0ZWQuIFRoZSBjZWxscyBhcmUgdGhlIG9uZXMgeW91IGFscmVhZHkgZHJldy4gUHJvamVjdGluZyBhIGZyZXNoIHdvcmxkIGZyYW1lIGZyb20gYSBzaGVsbCB0aGF0IGlzIG5vdCBpbiBhIHJlcGFpbnQgd291bGQgbWVhbiBpbnZlbnRpbmcgb25lLCBhbmQgbm90aGluZyBoYXMgcnVuIHRoYXQgY291bGQgaGF2ZSBjaGFuZ2VkIHRoZSBkdW5nZW9uLiBPbmx5IHRoZSBzdGFjayBjaGFuZ2VkLCBzbyB0aGF0IGlzIHRoZSBwYXJ0IHRvIHJlYWQuCgpUaGUgbm90aWZpY2F0aW9uIGZpcmVzIHdoZW4gdGhlIGNvbXBvc2l0ZSBjaGFuZ2VzLCBub3QgZXZlcnkgdGltZSBpdCBpcyByZWNvbXB1dGVkLCBzaW5jZSBub3RpZnlpbmcgb24gZXZlcnkgcmVjb21wb3NlIHdvdWxkIGRvdWJsZSBldmVyeSByZXBhaW50IHdpdGggbm8gbmV3IGluZm9ybWF0aW9uLgoKQSBzdGFjayBjYW4gZ2l2ZSB5b3UgdGhyZWUgYW5zd2Vycy4gQW4gZW1wdHkgc3RhY2ssIG9yIG9uZSB3aG9zZSBlbnRyaWVzIGRvIG5vdCBvdmVybGFwIHlvdSwgbWVhbnMgbm90aGluZyBpcyBvdmVyIHlvdS4gQSBtaXNzaW5nIGBzdGFja2AgbWVhbnMgdGhpcyBob3N0IHB1Ymxpc2hlcyBub25lLCBzbyBub3RoaW5nIGlzIGtub3duOyBkcmF3IGFueXdheSwgYmVjYXVzZSBgcGxhY2UoKWAgYWxyZWFkeSBkZWNsaW5lcyB3aGVuIHRoZXJlIGlzIG5vIHBpeGVsIGdlb21ldHJ5IHRvIGRyYXcgaW50by4gQSBzdGFjayB0aGF0IGlzIHB1Ymxpc2hlZCBidXQgZG9lcyBub3QgY29udGFpbiBgIm1hcCJgIGNvbWVzIGZyb20gYSBob3N0IHRoYXQgaGFzIHN0b3BwZWQgZGVzY3JpYmluZyB0aGUgbWFwLCBhbmQgeW91IHNob3VsZCB0cmVhdCB0aGF0IGFzIGNvdmVyZWQuIElmIHlvdSB0cmVhdCBpdCBhcyBjbGVhciwgeW91ciBjYW52YXMga2VlcHMgcGFpbnRpbmcgb3ZlciB3aGF0ZXZlciByZXBsYWNlZCB0aGUgbWFwLCBpbmRlZmluaXRlbHksIHdpdGggbm8gZXJyb3IgYW55d2hlcmUuCgpBIEhVRCByZWdpb24gb3duZXIgcmVhZHMgdGhlIHNhbWUgZmllbGQgb24gYEh1ZEZyYW1lYCwgYXNraW5nIGFib3V0IGl0cyBvd24gc2VjdGlvbidzIGByZWdpb24ubmFtZWAuCgpPbmUgZ2FwIHJlbWFpbnM6IGEgbW9kIHByZXNlbnRlciBob2xkaW5nIGEgc2NyZWVuIGRvZXMgbm90IHB1c2ggYSByZWdpb24sIHNvIHRoZSBjaGVjayBhYm92ZSByZXBvcnRzIG5vdGhpbmcgb3ZlciB0aGUgbWFwIHdoaWxlIGEgcHJlc2VudGVyLW93bmVkIHNjcmVlbiBpcyB1cC4gVGhlIG5vdGlmaWNhdGlvbiBpcyBjb3JyZWN0IGZvciBldmVyeSByZWdpb24gdGhhdCBpcyBwdXNoZWQ7IHRvZGF5IHRoZSB0ZXh0LXNjcmVlbiBwYXRoIGlzIHdoYXQgcHVzaGVzIHRoZW0uCgojIyBUaGUgSFVELCByZWdpb24gYnkgcmVnaW9uCgpgaHVkKGN0eClgIGlzIHRoZSBjb21wYW5pb24gdG8gYGZyb250ZW5kKGN0eClgLiBgZnJvbnRlbmRgIGNvdmVycyB0aGUgZHVuZ2VvbjsgYGh1ZGAgY292ZXJzIGV2ZXJ5dGhpbmcgYXJvdW5kIGl0ICh0aGUgbWVzc2FnZSBsaW5lLCB0aGUgdml0YWxzIGFuZCB0aGUgc3RhdHVzIGxpbmUpLCBhbmQgdW5saWtlIHRoZSBtYXAgaXQgaXMgb3duZWQgb25lIHJlZ2lvbiBhdCBhIHRpbWU6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAxLAogIGh1ZChjdHgpIHsKICAgIGNvbnN0IGNhbnZhcyA9IG1ha2VNeVBhbmVsKGdsb2JhbFRoaXMuZG9jdW1lbnQpOwogICAgcmV0dXJuIHsKICAgICAgc2lkZWJhcjogewogICAgICAgIHByZXNlbnQoc2VjdGlvbiwgZnJhbWUpIHsKICAgICAgICAgIGNvbnN0IGJveCA9IHNlY3Rpb24ucmVnaW9uPy5waXhlbHM7CiAgICAgICAgICBpZiAoIWJveCkgcmV0dXJuOyAgICAgICAgICAgICAgICAgICAgICAgLy8gbm8gZ2VvbWV0cnk6IGRyYXcgbm90aGluZwogICAgICAgICAgcGxhY2VPbihjYW52YXMsIGJveCk7CiAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHNlY3Rpb24uZW50cmllcykgewogICAgICAgICAgICBkcmF3KGVudHJ5LmtleSwgdGV4dE9mKGVudHJ5KSwgaW5rRm9yKGVudHJ5LnJ1bnNbMF0/LmNvbG9yKSk7CiAgICAgICAgICB9CiAgICAgICAgfSwKICAgICAgfSwKICAgIH07CiAgfSwKfTsKYGBgCgpSZXR1cm4gYSBzaW5rIGZvciBlYWNoIHJlZ2lvbiB5b3UgYXJlIHRha2luZyBhbmQgb21pdCB0aGUgcmVzdDsgdGhvc2Ugc3RheSB0aGUgZ2FtZSdzIGFuZCBrZWVwIGJlaW5nIGRyYXduLiBSZXR1cm5pbmcgYHVuZGVmaW5lZGAgb3IgYHt9YCBkZWNsaW5lcyBldmVyeXRoaW5nLCB3aGljaCBpcyB0aGUgcmlnaHQgYW5zd2VyIG9uIGEgaG9zdCB5b3UgY2Fubm90IGRyYXcgb24uIEEgZmFjdG9yeSB0aGF0IHRocm93cyBhbHNvIGxvc2VzIHlvdXIgcmVnaW9ucywgYnV0IGl0IGlzIHJlcG9ydGVkIGFzIHlvdXIgbW9kJ3MgZmF1bHQsIGFuZCBoYXZpbmcgbm8gZG9jdW1lbnQgdG8gZHJhdyBvbiBpcyBub3QgYSBmYXVsdC4KCkVhY2ggcmVnaW9uIG5lZWRzIGl0cyBvd24gY2FwYWJpbGl0eSwgb3IgdGhlIHdpbGRjYXJkIGZvciBhbGwgdGhyZWU6CgpgYGBqc29uCnsgInNoYXBlIjogInBsdWdpbiIsICJjYXBhYmlsaXRpZXMiOiBbInVpOnNpZGViYXIucmVwbGFjZSJdIH0KYGBgCgpgdWk6bWVzc2FnZXMucmVwbGFjZWAsIGB1aTpzaWRlYmFyLnJlcGxhY2VgLCBgdWk6c3RhdHVzLnJlcGxhY2VgLCBgdWk6Ki5yZXBsYWNlYC4gVGhlcmUgaXMgbm8gYHVpOm1hcC5yZXBsYWNlYDogdGhlIGR1bmdlb24gYmVsb25ncyB0byBgZGlzcGxheTpyZXBsYWNlYCwgYW5kIG9uZSByZWdpb24gYW5zd2VyaW5nIHRvIHR3byBjYXBhYmlsaXRpZXMgd291bGQgZ2l2ZSB0d28gYW5zd2VycyB0byB3aG8gZHJhd3MgaXQuIFRoZSB0d28gZG8gbm90IGNvdmVyIGVhY2ggb3RoZXIgaW4gZWl0aGVyIGRpcmVjdGlvbjogaG9sZGluZyB0aGUgbWFwIGRvZXMgbm90IGxldCB5b3UgZHJhdyB0aGUgdml0YWxzLCBhbmQgaG9sZGluZyB0aGUgd2hvbGUgaW50ZXJmYWNlIGRvZXMgbm90IGxldCB5b3UgZHJhdyB0aGUgbWFwLgoKVGhlIGNhcGFiaWxpdHkgaXMgdGhlIGNsYWltLiBUaGUgaG9zdCBwaWNrcyBlYWNoIHJlZ2lvbidzIG93bmVyIGZyb20gdGhlIG1hbmlmZXN0cyBiZWZvcmUgaXQgY2FsbHMgYW55Ym9keSdzIGBodWQoKWAsIHNvIGEgbW9kIHRoYXQgbG9zZXMgaXMgbmV2ZXIgY29uc3RydWN0ZWQgYW5kIGNhbm5vdCBtb3VudCBVSSBpdCB3aWxsIG5ldmVyIGRyYXcgaW50by4gVGhhdCBoYXMgdHdvIGNvbnNlcXVlbmNlcyBmb3IgeW91ciBtYW5pZmVzdDoKCi0gQSBzaW5rIGZvciBhIHJlZ2lvbiB5b3UgZGlkIG5vdCBhc2sgZm9yIGlzIGRyb3BwZWQgYW5kIHJlcG9ydGVkIGJ5IG5hbWUuCi0gQSByZWdpb24geW91IHdvbiBhbmQgdGhlbiBkZWNsaW5lZCBnb2VzIGJhY2sgdG8gdGhlIGdhbWUsIG5vdCBvbiB0byB0aGUgbmV4dCBjbGFpbWFudC4gQXNrIG9ubHkgZm9yIHRoZSByZWdpb25zIHlvdSBhY3R1YWxseSBkcmF3LgoKT24gZXZlcnkgcmVwYWludCB5b3UgZ2V0IHlvdXIgb3duIGBzZWN0aW9uYCBwbHVzIHRoZSB3aG9sZSBgZnJhbWVgLCBib3RoIGZyb3plbiBhbmQgc3RydWN0dXJhbGx5IHlvdXJzLCBzbyBrZWVwaW5nIG9uZSB0byBhbmltYXRlIGZyb20gaXMgc2FmZS4gVGhlIGZyYW1lIHRlbGxzIHlvdSB3aGF0IGEgc2VjdGlvbiBtZWFuczogYGZyYW1lLnRhcmdldGluZ2Agc2F5cyB0aGUgbWVzc2FnZSByb3cgaXMgYSBsb29rIGRlc2NyaXB0aW9uIGluc3RlYWQgb2YgYSBtZXNzYWdlLCBhbmQgYGZyYW1lLmxheW91dGAgKGAibGVmdCIgfCAidG9wIiB8ICJub25lImApIHNheXMgd2hldGhlciB0aGUgdml0YWxzIGFyZSBhIGNvbHVtbiwgYSBvbmUtbGluZSBoZWFkZXIsIG9yIHR1cm5lZCBvZmYuIFVuZGVyIGAibm9uZSJgIHRoZXJlIGlzIG5vIGBzaWRlYmFyYCBzZWN0aW9uIGF0IGFsbCBhbmQgeW91ciBzaW5rIGlzIG5vdCBjYWxsZWQsIGJlY2F1c2UgdGhlIHBsYXllciB0dXJuZWQgdGhlIHZpdGFscyBvZmYuCgpSZWFkIGBlbnRyeS5rZXlgIChvbmUgb2YgYGhwYCwgYHNwYCwgYGFjYCwgYGRlcHRoYCwgYHN0YXRlYCksIHdoaWNoIGlzIHRoZSBlbmdpbmUncyBvd24gYHNpZGVfaGFuZGxlcnNbXWAgLyBgc3RhdHVzX2hhbmRsZXJzW11gIG5hbWUgbWludXMgaXRzIGBwcnRfYCBwcmVmaXgsIGFuZCBgcnVuLmNvbG9yYCwgaXRzIGBDT0xPVVJfKmAgYXR0cmlidXRlLiBSZXNvbHZlIHRoZSBjb2xvdXIgdGhyb3VnaCBgY3R4LmNvcmUuQ09MT1VSX0xfR1JFRU5gIGFuZCBmcmllbmRzIGJ5IG5hbWUsIG5ldmVyIGJ5IHRoZSBudW1iZXIgaXQgY3VycmVudGx5IGhhcy4gYHJ1bi5jc3NgIGFuZCBgZW50cnkuc2NyZWVuYCBhcmUgdGhlIGZhaXRoZnVsIHRlcm1pbmFsJ3Mgb3duIHByb2plY3Rpb246IHVzZWZ1bCBmb3IgYSB0ZXh0LW1vZGUgcmVwbGFjZW1lbnQsIGFuZCBzYWZlIHRvIGlnbm9yZSBpZiB5b3UgYXJlIGRyYXdpbmcgeW91ciBvd24uCgpBIGZhdWx0IGNvc3RzIHlvdSBvbmUgcmVnaW9uLiBJZiB5b3VyIGBzdGF0dXNgIHNpbmsgdGhyb3dzLCB0aGUgZ2FtZSByZXN1bWVzIGRyYXdpbmcgdGhlIHN0YXR1cyBsaW5lIGZvciB0aGUgcmVzdCBvZiB0aGUgc2Vzc2lvbiBhbmQgcmVwb3J0cyB5b3VyIG1vZCBieSBuYW1lOyB5b3VyIGBzaWRlYmFyYCBrZWVwcyBkcmF3aW5nLCBhbmQgdGhlIHBsYXllciBrZWVwcyB0aGVpciBnYW1lLgoKRHJhdyBiYXJzIGZyb20gYGVudHJ5LnZhbHVlc2AsIG5ldmVyIGZyb20gdGhlIHRleHQuIEFuIGVudHJ5IGNhcnJpZXMgdGhlIG51bWJlcnMgaXRzIHRleHQgd2FzIGZvcm1hdHRlZCBmcm9tLCBzbyBoaXQgcG9pbnRzIGFycml2ZSBhcyBgeyBjdXJyZW50OiA3LCBtYXg6IDM0IH1gIGJlc2lkZSBgIkhQICAgNy8gIDM0ImAuIFBhcnNpbmcgdGhlIHN0cmluZyB3b3JrcyBvbmx5IHVudGlsIHNvbWVib2R5IGxvYWRzIGEgcHJlZiBmaWxlLCBwbGF5cyBpbiBhbm90aGVyIGxhbmd1YWdlLCBvciBpbnN0YWxscyBhIGNvbnRlbnQgcGFjayB0aGF0IHdpZGVucyBhIGZpZWxkLgoKVGhlIGNvbnZlbnRpb24gaXMgYSBzaW5nbGUgcnVsZS4gYGN1cnJlbnRgIGFuZCBgbWF4YCB0b2dldGhlciBtZWFuIHRoZSBmaWVsZCBpcyBhIHByb3BvcnRpb24sIGFuZCBgY3VycmVudCAvIG1heGAgaXMgbWVhbmluZ2Z1bC4gRXZlcnkgb3RoZXIga2V5IGlzIGEgcGxhaW4gbmFtZWQgcXVhbnRpdHkuIEEgZmllbGQgd2l0aCB0d28gbnVtYmVycyB0aGF0IGFyZSBub3QgYSByYXRpbyBhdm9pZHMgdGhvc2UgbmFtZXM6IGEgc3RhdCBwdWJsaXNoZXMgYHVzZWAgLyBgY3VyYCAvIGBtYXhgLCBiZWNhdXNlIGAxMThgIGlzIGFuIGVuY29kaW5nIG1lYW5pbmcgMTgvMTAwLCBhbmQgYSBiYXIgb3ZlciBpdCB3b3VsZCBzaG93IGEgbWF4ZWQgY2hhcmFjdGVyIGF0IDE1JS4gU28gYGlmICh2LmN1cnJlbnQgIT09IHVuZGVmaW5lZCAmJiB2Lm1heCAhPT0gdW5kZWZpbmVkKSBkcmF3QmFyKCkgZWxzZSBkcmF3VGV4dCgpYCBpcyBzYWZlIG9uIGV2ZXJ5IGZpZWxkLCBpbmNsdWRpbmcgb25lcyBhZGRlZCBhZnRlciB5b3Ugc2hpcHBlZC4KCkEgbWlzc2luZyB2YWx1ZSBhbHdheXMgbWVhbnMgdGhlIGdhbWUgZG9lcyBub3Qga25vdywgbmV2ZXIgemVybzogdGhlIG1vbnN0ZXIgaGVhbHRoIGJhciBwdWJsaXNoZXMgbm90aGluZyB3aGlsZSBpdCByZWFkcyBgWy0tLS0tLS0tLS1dYCwgYW5kIGBzcGAgaXMgYWJzZW50IGZvciBhIGNsYXNzIHdpdGggbm8gbWFuYSBpbnN0ZWFkIG9mIGAwLzBgLiBUaGUgZnVsbCBwZXItZmllbGQga2V5IGxpc3QgaXMgb24gYEh1ZFZhbHVlc2AgaW4gdGhlIFNESy4KCmBzYW1wbGVzL3ZpdGFscy1wYW5lbC9gIGlzIGEgY29tcGxldGUgd29ya2VkIGV4YW1wbGU6IGl0IHRha2VzIGBzaWRlYmFyYCBhbG9uZSBhbmQgbGVhdmVzIHRoZSByZXN0IG9mIHRoZSBzY3JlZW4gdG8gdGhlIGdhbWUuCgojIyBgbWVudShjdHgpYDogYXNrIHRoZSBnYW1lJ3MgcXVlc3Rpb25zIHlvdXIgb3duIHdheQoKYG1lbnUoY3R4KWAgaXMgdGhlIHRoaXJkIG93bmVyIHNlYW0sIGFuZCBpdCB3b3JrcyBkaWZmZXJlbnRseSBmcm9tIHRoZSBmaXJzdCB0d286IGEgSFVEIHNlY3Rpb24gaXMgZHJhd24sIHdoaWxlIGEgbWVudSBpcyBhc2tlZC4gVGhlIGJvdW5kYXJ5IGlzIGBhc2socXVlc3Rpb24pIC0+IGFuc3dlcmAsIGFuZCB0YWtpbmcgYSBxdWVzdGlvbiBtZWFucyBoYW5kbGluZyB0aGUgcGxheWVyJ3MgY2hvaWNlIGFzIHdlbGwgYXMgZHJhd2luZyB0aGUgbWVudS4KCmBgYGpzCm1lbnUoY3R4KSB7CiAgcmV0dXJuIHsKICAgIGFzayhxdWVzdGlvbikgewogICAgICBpZiAocXVlc3Rpb24uaWQgIT09ICJjb3JlOmdhbWUtbWVudSIpIHJldHVybiB1bmRlZmluZWQ7ICAgLy8gZGVjbGluZQogICAgICByZXR1cm4gZHJhd0RpYWxBbmRXYWl0KHF1ZXN0aW9uKTsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0+IE1lbnVBbnN3ZXIKICAgIH0sCiAgfTsKfQpgYGAKCkl0IGlzIGdhdGVkIGJ5IHRoZSBzaW5nbGUgYHVpOm1lbnUucmVwbGFjZWAgY2FwYWJpbGl0eSAob3IgdGhlIHdpbGRjYXJkIGB1aToqLnJlcGxhY2VgKS4gT25lIGdyYW50IGNvdmVycyBldmVyeSBtZW51IGluc3RlYWQgb2Ygb25lIHBlciBtZW51IGlkOiB0aGVyZSBhcmUgYWJvdXQgNTAgb2YgdGhlbSwgYW5kIDUwIGNhcGFiaWxpdHkgc3RyaW5ncyB3b3VsZCBtYWtlIGEgY29uc2VudCBsaXN0IG5vYm9keSBjb3VsZCByZWFkLgoKRGVjbGluaW5nIGlzIHRoZSBub3JtYWwgY2FzZS4gWW91ciBwcmVzZW50ZXIgaXMgb2ZmZXJlZCBldmVyeSBtZW51IHRoZSBnYW1lIGFza3MgYW5kIHJldHVybnMgYHVuZGVmaW5lZGAgZnJvbSBgYXNrYCBmb3IgdGhlIG9uZXMgaXQgaGFzIG5vIGJldHRlciB3YXkgdG8gcHJlc2VudDsgdGhlIGdhbWUgdGhlbiBhc2tzIHRob3NlIGl0cyBvd24gd2F5LiBBIHJhZGlhbCBkaWFsIGZvciBzaXggY29tbWFuZCB2ZXJicyBoYXMgbm8gcmVhc29uIHRvIHRvdWNoIHRoZSBtb2QgbWFuYWdlcidzIHRoaXJ0eS1yb3cgbGlzdC4gRGVjbGluaW5nIGNvc3RzIG5vdGhpbmc6IHlvdSBkcmV3IG5vdGhpbmcsIGFuZCBub3RoaW5nIGlzIGxlZnQgaGFsZi1vd25lZC4KCkFuc3dlciBieSB0aGUgY2hvaWNlJ3Mgc3RhYmxlIGBpZGAsIG5ldmVyIGJ5IGFuIGluZGV4LiBBbiBpbmRleCBkZXNjcmliZXMgYSBsYXlvdXQsIGFuZCBvbmNlIHlvdSBoYXZlIGdyb3VwZWQgdGhlIGNob2ljZXMgaW50byB0aGUgd2VkZ2VzIG9mIGEgZGlhbCB5b3UgaGF2ZSBubyBpbmRleCB0aGUgZ2FtZSB3b3VsZCByZWNvZ25pc2UuIFJlYWQgYGNob2ljZS5zZW1hbnRpY2AgKGB7a2luZCwgcmVmfWApIGZvciB3aGF0IGEgY2hvaWNlIG1lYW5zIGluZGVwZW5kZW50IG9mIGl0cyB3b3JkaW5nLCBhbmQgYHF1ZXN0aW9uLmlkYCB0byByZWNvZ25pc2Ugd2hpY2ggcXVlc3Rpb24geW91IGFyZSBiZWluZyBhc2tlZC4KClRoZSBhbnN3ZXJzIGFyZSBgY2hvb3NlYCwgYGNhbmNlbGAsIGBjb21tYW5kYCBhbmQgYG9wdGlvbnNgLiBgY29tbWFuZGAgcnVucyBvbmUgb2YgYHF1ZXN0aW9uLmNvbW1hbmRzYCwgdGhlIGNhbGxlcidzIG93biBoYW5kbGVyLCBleGFjdGx5IGFzIHByZXNzaW5nIHRoZSBrZXkgd291bGQsIGFuZCB0aGUgcXVlc3Rpb24gaXMgdGhlbiBhc2tlZCBhZ2FpbiB1bmxlc3MgdGhhdCBoYW5kbGVyIHJlc29sdmVkIGl0LiBUaGF0IGlzIGhvdyBhIHJlaW1hZ2luZWQgc3RvcmUgY2FuIG9mZmVyICJidXkiIHdpdGhvdXQga25vd2luZyB3aGF0IGJ1eWluZyBkb2VzLiBZb3UgY2Fubm90IGludmVudCB0aG9zZSBrZXlzOyB0aGV5IGJlbG9uZyB0byB3aG9ldmVyIG9wZW5lZCB0aGUgbWVudS4KClRocm93aW5nIGNvc3RzIHlvdSB0aGUgc2VhbSBmb3IgdGhlIHNlc3Npb24sIG9uIGV2ZXJ5IG1lbnUsIHdoZXJlYXMgaW4gYGh1ZGAgYSBmYXVsdCBjb3N0cyBvbmUgcmVnaW9uLiBBIHByZXNlbnRlciB0aGF0IHRocm93cyBvbiBvbmUgcXVlc3Rpb24gdXN1YWxseSB0aHJvd3Mgb24gYWxsIG9mIHRoZW0sIGFuZCBvbmUgcmVwb3J0IGlzIGJldHRlciB0aGFuIGEgcmVwb3J0IGV2ZXJ5IHRpbWUgdGhlIHBsYXllciBvcGVucyBhbnl0aGluZy4gQW5zd2VycyB0aGF0IGNhbm5vdCBiZSBob25vdXJlZCAoYW4gdW5rbm93biBjaG9pY2UgaWQsIGEgY2hvaWNlIG9uIGEgYnJvd3NlLW9ubHkgcXVlc3Rpb24sIGEgY29tbWFuZCBrZXkgdGhhdCB3YXMgbmV2ZXIgb2ZmZXJlZCkgY29zdCB5b3UgdGhhdCBtZW51IG9ubHksIGFuZCBhcmUgcmVwb3J0ZWQuCgpBIG1lbnUgc3RpbGwgaGFzIG5vIHB1Ymxpc2hlZCByZWdpb24gb2YgaXRzIG93biwgYWx0aG91Z2ggb3ZlcmxhcHBpbmcsIG9yZGVyZWQsIG1vZC1jcmVhdGVkIHJlZ2lvbnMgaGF2ZSBzaW5jZSBsYW5kZWQ7IHNlZSBbYHJlZ2lvbnMoY3R4KWBdKCNyZWdpb25zY3R4LXB1dC1mdXJuaXR1cmUtb2YteW91ci1vd24tb24tdGhlLXNjcmVlbikuIGByZWdpb25zLnRzYCBuYW1lcyB0aGUgZm91ciBwYXJ0cyBvZiB0aGUgc2NyZWVuIHRoYXQgdGlsZSBpdCwgYW5kIGEgZmxvYXRpbmcgbWVudSBvdmVybGFwcyBieSBkZWZpbml0aW9uLiBgcXVlc3Rpb24uc3R5bGVgIHRlbGxzIHlvdSB3aGV0aGVyIHRoZSBnYW1lIHdvdWxkIGhhdmUgY2xlYXJlZCB0aGUgc2NyZWVuIChgInNjcmVlbiJgKSBvciBkcmF3biBhIGJveCBvdmVyIGEgc3RpbGwtdmlzaWJsZSBtYXAgKGAib3ZlcmxheSJgKS4KCmBzYW1wbGVzL2NvbW1hbmQtZGlhbC9gIGlzIGEgY29tcGxldGUgd29ya2VkIGV4YW1wbGU6IGl0IHRha2VzIHRoZSBnYW1lIG1lbnUgYW5kCmRlY2xpbmVzIGV2ZXJ5IG90aGVyIHF1ZXN0aW9uIGluIHRoZSBnYW1lLgoKIyMgYHNjcmVlbihjdHgpYDogc2hvdyB0aGUgZ2FtZSdzIGZ1bGwgc2NyZWVucyB5b3VyIG93biB3YXkKCmBzY3JlZW4oY3R4KWAgaXMgdGhlIGZvdXJ0aCBvd25lciBzZWFtLCBhbmQgaXQgcmVhY2hlcyB0aGUgY29udGVudCBvZiBhIHNjcmVlbiB3aGVyZSB0aGUgb3RoZXJzIHJlYWNoIHRoZSBmcmFtZS4gQmVmb3JlIGl0IGV4aXN0ZWQsIHRoZSBpbnZlbnRvcnkgYXJyaXZlZCBhcyBgU2NyZWVuTGluZVtdYCwgcm93cyBvZiBjaGFyYWN0ZXJzIGFuZCBjb2xvdXJzLCBzbyBhIG1vZCB0aGF0IHdhbnRlZCB0byBkcmF3IGl0ZW1zIGFzIHNwcml0ZSBjYXJkcyB3b3VsZCBoYXZlIGhhZCB0byBwYXJzZSBgImEpIGEgUG90aW9uIG9mIEN1cmUgTGlnaHQgV291bmRzICAgICAgIDQuMCBsYiJgIGJhY2sgaW50byBhIG5hbWUgYW5kIGEgd2VpZ2h0LCBhbmQgd291bGQgYnJlYWsgdGhlIGRheSBhIHByZWYgZmlsZSBjaGFuZ2VkIGEgY29sb3VyIG9yIGEgdHJhbnNsYXRpb24gY2hhbmdlZCBhIHdpZHRoLiBBIHNjcmVlbiBub3cgYXJyaXZlcyBhcyBhIGRvY3VtZW50IG9mIGJsb2Nrcy4KCmBgYGpzCnNjcmVlbihjdHgpIHsKICByZXR1cm4gewogICAgc2hvdyh2aWV3KSB7CiAgICAgIGlmICh2aWV3LmlkICE9PSAiY29yZTppbnZlbnRvcnkiKSByZXR1cm4gdW5kZWZpbmVkOyAgICAgICAgLy8gZGVjbGluZQogICAgICBjb25zdCB0YWJsZSA9IHZpZXcuYmxvY2tzLmZpbmQoKGIpID0+IGIua2luZCA9PT0gInRhYmxlIik7CiAgICAgIGRyYXdDYXJkcyh0YWJsZS5yb3dzKTsgICAgICAgICAgICAvLyByb3cuY2VsbHMubmFtZS50ZXh0LCByb3cuc2VtYW50aWMsIC4uLgogICAgICByZXR1cm4geyBkaXNtaXNzZWQ6IHdoZW5UaGVQbGF5ZXJDbG9zZXMoKSB9OwogICAgfSwKICB9Owp9CmBgYAoKSXQgaXMgZ2F0ZWQgYnkgdGhlIHNpbmdsZSBgdWk6c2NyZWVuLnJlcGxhY2VgIGNhcGFiaWxpdHkgKG9yIHRoZSB3aWxkY2FyZCBgdWk6Ki5yZXBsYWNlYCksIG9uIHRoZSBzYW1lIHRlcm1zIGFzIGBtZW51YDogb25lIGdyYW50IGNvdmVycyBldmVyeSBzY3JlZW4sIGFuZCB5b3UgY2hvb3NlIHBlciBzY3JlZW4gYnkgZGVjbGluaW5nLgoKQSBsaXN0IGlzIGEgYHRhYmxlYCwgYW5kIGNlbGxzIGFyZSBhZGRyZXNzZWQgYnkgY29sdW1uIGtleS4gQ29sdW1ucyBoYXZlIHN0YWJsZSBrZXlzIChgbmFtZWAsIGBzbG90YCwgYHdlaWdodGAsIGB0dXJuYCksIHNvIHlvdSByZWFkIGByb3cuY2VsbHMubmFtZS50ZXh0YCBhbmQgbmV2ZXIgY291bnQgY2hhcmFjdGVycy4gQSBjb2x1bW4gYWxzbyBwdWJsaXNoZXMgdGhyZWUgZmFjdHMgYWJvdXQgdGhlIHRlcm1pbmFsJ3MgbGF5b3V0LCBhbGwgb2Ygd2hpY2ggeW91IGFyZSBmcmVlIHRvIGlnbm9yZTogYHdpZHRoYCAodGhlIGZpZWxkIHdpZHRoIHdoZXJlIHVwc3RyZWFtIGZpeGVkIG9uZSksIGBnYXBgIChjb2x1bW5zIG9mIHNwYWNlIGJlZm9yZSBpdDsgdGhlIGhpc3Rvcnkgc2NyZWVuIHdyaXRlcyBgIiUxMGxkJTdkJyAgJXMiYCwgd2l0aCBubyBnYXAgYmVmb3JlIHRoZSBkZXB0aCBhbmQgdHdvIGJlZm9yZSB0aGUgbm90ZSkgYW5kIGBwYWRgIChmYWxzZSB3aGVyZSB0aGUgZ2FtZSBkb2VzIG5vdCBsaW5lIHRoZSBjb2x1bW4gdXAsIGFzIHdpdGggdGhlIG9iamVjdCBsaXN0J3MgbG9jYXRpb24sIHdoaWNoIHNpbXBseSBmb2xsb3dzIHRoZSBuYW1lKS4gVGhlc2UgYXJlIHB1Ymxpc2hlZCBiZXNpZGUgdGhlIGRhdGEgaW5zdGVhZCBvZiBiZWluZyBiYWtlZCBpbnRvIGl0IGFzIHBhZGRpbmcsIHNvIGJvdGggYSB0ZXJtaW5hbCByZW5kZXJpbmcgYW5kIHlvdXIgb3duIGNhbiBjb21lIGZyb20gb25lIG1vZGVsLgoKYHJvdy5zZW1hbnRpY2AgaXMgdGhlIHNhbWUgYHtraW5kLCByZWZ9YCBhIGBNZW51Q2hvaWNlYCBjYXJyaWVzLCBzbyBhbiBpdGVtIGlzIHRoZSBzYW1lIHRoaW5nIHRvIHlvdSB3aGV0aGVyIHRoZSBnYW1lIGlzIGxpc3RpbmcgaXQgb3IgYXNraW5nIHlvdSB0byBwaWNrIGl0OiBhbiBpbnZlbnRvcnkgcm93IGFuZCBpdHMgcGlja2VyIGNob2ljZSBzaGFyZSBhbiBpZC4gQW4gZW1wdHkgZXF1aXBtZW50IHNsb3QgaXMgYHtraW5kOiAic2xvdCJ9YCBpbnN0ZWFkIG9mIGFuIGl0ZW0uIGByb3cuY29sb3JgIGlzIHRoZSBvYmplY3QncyBvd24gYXR0ciBhcyBDU1MsIGFuZCBgcm93LnRhZ2AgaXMgdGhlIGxldHRlciB0aGUgdGVybWluYWwgd291bGQgb2ZmZXIuCgpOdW1iZXJzIGNvbWUgd2l0aCB0aGUgdGV4dC4gYGNlbGwudmFsdWVzYCBmb2xsb3dzIHRoZSBIVUQncyBjb252ZW50aW9uOiBgY3VycmVudGAgYW5kIGBtYXhgIHRvZ2V0aGVyIG1lYW4gYSBwcm9wb3J0aW9uLCBldmVyeSBvdGhlciBrZXkgaXMgYSBuYW1lZCBxdWFudGl0eSwgYW5kIGEgbWlzc2luZyBrZXkgbWVhbnMgdGhlIGdhbWUgZG9lcyBub3Qga25vdyB0aGUgdmFsdWUuIEEgd2VpZ2h0IGNlbGwgcHVibGlzaGVzIGB7ZWFjaCwgdG90YWwsIG51bWJlcn1gIGluIHRlbnRocyBvZiBhIHBvdW5kLCBzbyB5b3UgY2FuIGZvcm1hdCBpdCB5b3VyIG93biB3YXkuCgpDaGVjayBgcm93LnZhbHVlc2AgYXMgd2VsbCBhcyBgY2VsbC52YWx1ZXNgLiBUaGUgbW9kZWwgbWF5IGNhcnJ5IG1vcmUgdGhhbiB0aGUgcmVuZGVyaW5nLCBuZXZlciBsZXNzLCBzbyBhIG51bWJlciB0aGUgdGVybWluYWwgaGFzIG5vIGNvbHVtbiBmb3IgbGl2ZXMgb24gdGhlIHJvdzogdGhlIHF1aXZlciBwdWJsaXNoZXMgaXRzIHdlaWdodCB0aGF0IHdheSwgdGhlIG9iamVjdCBsaXN0IHB1Ymxpc2hlcyBlYWNoIG9mZnNldCBhcyBge2R5LCBkeH1gIGFzIHdlbGwgYXMgYCIyIE4gMCBXImAsIGFuZCB0aGUgcGxheWVyIGhpc3RvcnkgaW5jbHVkZXMgdGhlIGNoYXJhY3RlciBsZXZlbCBpdCBuZXZlciBwcmludHMuIFRob3NlIGFyZSB0aGUgbnVtYmVycyBhIHByZXNlbnRlciBuZWVkcyBhbmQgYSB0ZXh0IHNjcmVlbiBjYW5ub3Qgc2hvdy4KClByb3NlIGFycml2ZXMgdW53cmFwcGVkLCBpbiBhIGB0ZXh0YCBibG9jay4gYHBhcmFncmFwaHNgIGlzIGEgcnVuIHN0cmVhbSBwZXIgcGFyYWdyYXBoLCBzcGxpdCB3aGVyZSB0aGUgZ2FtZSBtZWFudCBhIGJyZWFrIGFuZCBub3doZXJlIGVsc2UsIHNvIHRoZSBvYmplY3QgcmVjYWxsLCB0aGUgb2JqZWN0IGNvbXBhcmlzb24gYW5kIHRoZSBtb25zdGVyIHJlY2FsbCBoYW5kIHlvdSB0aGUgdGV4dCBhbmQgbGV0IHlvdSBjaG9vc2UgdGhlIHdpZHRoLiBBIGBsaW5lc2AgYmxvY2ssIGJ5IGNvbnRyYXN0LCBoYXMgYWxyZWFkeSBiZWVuIGJyb2tlbiBpbnRvIHRlcm1pbmFsLXdpZHRoIHJvd3MsIGFuZCByZS1mbG93aW5nIHRob3NlIHRvIGEgcGFuZWwgb2YgeW91ciBvd24gc2l6ZSBtZWFucyB1bmRvaW5nIHRoZSBnYW1lJ3Mgd3JhcCBmaXJzdCBhbmQgZ3Vlc3Npbmcgd2hpY2ggYnJlYWtzIHdlcmUgdGhlIGdhbWUncyBhbmQgd2hpY2ggd2VyZSB0aGUgc2VudGVuY2Uncy4gYGJsb2NrLmNvbG9yYCBpcyB0aGUgcHJvc2UncyBkZWZhdWx0IGNvbG91ciwgZm9yIHRoZSBwYXJ0cyBubyBydW4gc2V0cy4KCmBibG9jay5mbG93YCBuYW1lcyB3aGljaCBvZiBBbmdiYW5kJ3MgdHdvIHdyYXBwaW5nIHJvdXRpbmVzIGxhaWQgdGhlIHByb3NlIG91dCwgZm9yIGEgcHJlc2VudGVyIHRoYXQgd2FudHMgdG8gcmVwcm9kdWNlIHRoZSB0ZXJtaW5hbCBpbnN0ZWFkIG9mIHJlLWZsb3dpbmcuIEFic2VudCBtZWFucyBgdGV4dGJsb2NrX2NhbGN1bGF0ZV9saW5lc2AsIHdoaWNoIGNvdmVycyBldmVyeSBwYWdlIGJ1dCBvbmU7IGAidGV4dC1vdXQiYCBtZWFucyBgdGV4dF9vdXRfdG9fc2NyZWVuYCwgdXNlZCBvbmx5IGZvciB0aGUgY2hhcmFjdGVyIHNoZWV0J3MgaGlzdG9yeS4gVGhlIHR3byBkaWZmZXIgYnkgdHdvIGNvbHVtbnMgYW5kIGJ5IHdoZXRoZXIgYSBzZW50ZW5jZSdzIHNlY29uZCBzcGFjZSBzdXJ2aXZlcyBhIGxpbmUgYnJlYWssIHNvIGEgcmVuZGVyZXIgdGhhdCBhc3N1bWVkIG9uZSBydWxlIGZvciBib3RoIHdhcyB3cm9uZyBvbiBvbmUgb2YgdGhlbS4gTW9zdCBwcmVzZW50ZXJzIGNhbiBpZ25vcmUgdGhpczsgaXQgbWF0dGVycyBvbmx5IGlmIHlvdSBhcmUgd3JhcHBpbmcgdGhlIHdheSB0aGUgdGVybWluYWwgZG9lcyBpbnN0ZWFkIG9mIGF0IGEgd2lkdGggb2YgeW91ciBvd24uCgpBbiBgYXJ0YCBibG9jayBrZWVwcyB0aGUgcGljdHVyZSBhbmQgdGhlIHRleHQgb24gaXQgc2VwYXJhdGUuIEl0cyBgbGluZXNgIGFyZSB0aGUgcGljdHVyZSAodGhlIHRvbWJzdG9uZSBvciB0aGUgd2lubmVyJ3MgY3Jvd24pLCBhbmQgaXRzIGBmaWVsZHNgIGFyZSB0aGUgdGV4dCB0aGUgZ2FtZSB3cml0ZXMgb250byB0aGUgcGljdHVyZS4gVXBzdHJlYW0ncyB0b21ic3RvbmUgaXMgb25lIGRyYXdpbmcgd2l0aCB0aGUgY2hhcmFjdGVyJ3MgZGV0YWlscyBidXJuZWQgaW50byBjb2x1bW5zIDgtMzksIHNvIGEgcHJlc2VudGVyIGhhbmRlZCBvbmx5IHRoZSBkcmF3aW5nIHdvdWxkIGhhdmUgdG8ga25vdyB0aGF0IHRvIGdldCB0aGUgbmFtZSBiYWNrLiBJbnN0ZWFkLCBlYWNoIGZpZWxkIGNhcnJpZXMgYSBzdGFibGUgYGtleWAgKGBuYW1lYCwgYHRpdGxlYCwgYGNsYXNzYCwgYGxldmVsYCwgYGV4cGAsIGBnb2xkYCwgYGRlYXRoYCwgYGtpbGxlcmAsIGBkYXRlYCksIGl0cyBgdGV4dGAsIGFuZCBgdmFsdWVzYCB3aGVyZSB0aGUgdGV4dCBpcyBhIGZvcm1hdHRlZCBudW1iZXIuIFRoZSBgcm93YC9geDFgL2B4MmAgYmVzaWRlIHRoZW0gYXJlIHdoZXJlIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCBwdXRzIGVhY2ggb25lOyBpZ25vcmUgdGhlbSBhbmQgZHJhdyBhIHJlYWwgZ3JhdmVzdG9uZS4gQSBmaWVsZCB3aXRoIG5vIGJhbmQgaXMgY2VudHJlZCBvbiB0aGUgZnVsbCB3aWR0aCwgYXMgdXBzdHJlYW0gZG9lcyBmb3IgdGhlIHdpbm5lcidzIGJhbm5lci4KCkEgY29sdW1uIGNhbiBjYXJyeSBhIHBpY3R1cmUsIGFuZCBhIHRhYmxlIGNhbiBjYXJyeSBpdHMgc3BhY2luZy4gVGhlIGNoYXJhY3RlciBzaGVldCdzIGZsYWcgZ3JpZCBoYXMgb25lIGNvbHVtbiBwZXIgZXF1aXBtZW50IHNsb3QsIGFuZCB1cHN0cmVhbSBkcmF3cyB0aGUgd29ybiBpdGVtJ3MgZ2x5cGggb3ZlciBlYWNoLiBUaGF0IGdseXBoIGRlc2NyaWJlcyB0aGUgY29sdW1uICh3aGF0IGlzIGluIHRoaXMgc2xvdCksIHNvIGl0IGFycml2ZXMgYXMgYGNvbHVtbi5nbHlwaGAgaW5zdGVhZCBvZiBhcyBhIGZpcnN0IHJvdyB5b3Ugd291bGQgaGF2ZSB0byBrbm93IHRvIHNraXA7IGRyYXcgdGhlIGl0ZW0ncyBpY29uIHRoZXJlLiBUd28gbW9yZSBsYXlvdXQgZmFjdHMgYXJlIHB1Ymxpc2hlZCBiZXNpZGUgdGhlIGRhdGE6IGBoZWFkZXJDb2xvcmAgaXMgdGhlIGhlYWRlciByb3cncyBjb2xvdXIgd2hlcmUgdGhlIGdhbWUgY29sb3VycyBpdCwgYW5kIGBnYXBBZnRlcmAgaXMgdGhlIG51bWJlciBvZiBibGFuayByb3dzIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCBsZWF2ZXMgdW5kZXIgYSB0YWJsZS4gQSBgdGV4dGAgYmxvY2sncyBgd3JhcGAgZG9lcyB0aGUgc2FtZSBmb3IgcHJvc2U6IGl0IGlzIHRoZSB3aWR0aCB1cHN0cmVhbSB3cmFwcyBhdCAoNzIgZm9yIHRoZSBjaGFyYWN0ZXIgaGlzdG9yeSBvbiBhbiA4MC1jb2x1bW4gc2NyZWVuKSwgYWx3YXlzIGFuIHVwcGVyIGJvdW5kIGFuZCBuZXZlciBhIG1pbmltdW0uIElnbm9yZSBhbGwgZm91ciBpZiB5b3UgbGF5IHRoaW5ncyBvdXQgeW91cnNlbGYuCgpOb3QgZXZlcnkgc2NyZWVuIGhhcyBhIG1vZGVsIHlldC4gYE1PREVMTEVEX1NDUkVFTlNgIChgcGFja2FnZXMvd2ViL3NyYy9zY3JlZW4tdmlldy50c2ApIG5hbWVzIHRoZSBvbmVzIHRoYXQgZG8sIHRoaXJ0eS1uaW5lIHRvZGF5OiB0aGUgaW52ZW50b3J5LCB0aGUgZXF1aXBtZW50LCB0aGUgcXVpdmVyLCB0aGUgb2JqZWN0IGxpc3QsIHRoZSBtb25zdGVyIGxpc3QsIHRoZSBtZXNzYWdlIGhpc3RvcnksIHRoZSBwbGF5ZXIgaGlzdG9yeSwgdGhlIG9iamVjdCByZWNhbGwsIHRoZSBvYmplY3QgY29tcGFyaXNvbiwgdGhlIG1vbnN0ZXIgcmVjYWxsLCB0aGUgdG9tYnN0b25lLCB0aGUgd2lubmVyLCB0aGUgY2hhcmFjdGVyIHNoZWV0J3MgdHdvIHBhZ2VzIChgY29yZTpjaGFyYWN0ZXJgIGFuZCBgY29yZTpjaGFyYWN0ZXItZmxhZ3NgKSwgdGhlIGtub3dsZWRnZSBicm93c2VyJ3Mgc2V2ZW4gcmVjYWxsIHBhZ2VzIChgY29yZTpydW5lLXJlY2FsbGAsIGBjb3JlOmZlYXR1cmUtcmVjYWxsYCwgYGNvcmU6dHJhcC1yZWNhbGxgLCBgY29yZTpzaGFwZS1yZWNhbGxgLCBgY29yZTphcnRpZmFjdC1yZWNhbGxgLCBgY29yZTplZ28tcmVjYWxsYCwgYGNvcmU6b2JqZWN0LWtpbmQtcmVjYWxsYCksIHRoZSBmb3VyIGhlbHAgcGFnZXMgKGBjb3JlOmhlbHAtY29tbWFuZHNgLCBgY29yZTpoZWxwLXN5bWJvbHNgLCBgY29yZTpoZWxwLWd1aWRlYCwgYGNvcmU6aGVscC1jb21tdW5pdHlgKSwgdGhlIGVxdWlwbWVudC1jb21wYXJpc29uIHNjcmVlbidzIHR3byBoZWxwIG92ZXJsYXlzIChgY29yZTplcXVpcC1jbXAtaGVscGAsIGBjb3JlOmVxdWlwLWNtcC1zZWxlY3QtaGVscGApLCB0aGUgbW9kIG1hbmFnZXIncyBmb3VyIGxpc3RpbmdzIChgY29yZTptb2QtdXBkYXRlc2AsIGBjb3JlOm1vZC1hdXRvLXNvcnRgLCBgY29yZTptb2QtY2FwYWJpbGl0aWVzYCwgYGNvcmU6bW9kLWNvbmZsaWN0c2ApLCB0aGUgaGFsbCBvZiBmYW1lIChgY29yZTpoYWxsLW9mLWZhbWVgKSwgdGhlIGtub3dsZWRnZSBtZW51J3Mgc3RvcmUgdmlldyAoYGNvcmU6c3RvcmUta25vd2xlZGdlYCksIHRoZSB1cGRhdGUgYW5kIHJlcG9ydCBwYWdlcyAoYGNvcmU6dXBkYXRlYCwgYGNvcmU6cmVwb3J0YCksIGFuZCB3aXphcmQgbW9kZSdzIHR3byBkZWJ1ZyByZWFkb3V0cyAoYGNvcmU6d2l6YXJkLWtleWxvZ2AsIGBjb3JlOndpemFyZC1pdGVtYCkuIEV2ZXJ5dGhpbmcgZWxzZSBhcnJpdmVzIHVuZGVyIHRoZSBzaGFyZWQgaWQgYGNvcmU6dGV4dGAgd2l0aCBhIHNpbmdsZSBgbGluZXNgIGJsb2NrIG9mIHByZS13cmFwcGVkIHJvd3MsIHdoaWNoIGlzIGVub3VnaCB0byByZXNraW4gYSBmcmFtZSBidXQgbm90IHRvIHJlaW1hZ2luZSBhIGxpc3RpbmcsIHNvIGNoZWNrIGB2aWV3LmlkYC4KCk1vc3Qgb2Ygd2hhdCByZW1haW5zIHVuZGVyIGBjb3JlOnRleHRgIGlzIHByb3NlLiBPZiB0aGUgdGhpcnR5LXR3byBgc2hvd1RleHRTY3JlZW5gIGNhbGwgc2l0ZXMgaW4gdGhlIG1vZCBtYW5hZ2VyIGFzIG9mIEF1Z3VzdCAyMDI2LCB0d2VudHktZm91ciBzaG93IHByb3NlOiB3YXJuaW5ncywgb3V0Y29tZSByZXBvcnRzLCBlcnJvciBleHBsYW5hdGlvbnMgYW5kIGEgbW9kIGF1dGhvcidzIG93biBkZXNjcmlwdGlvbiwgd2hpY2ggYSBwcmVzZW50ZXIgZ2FpbnMgbm90aGluZyBieSBhZGRyZXNzaW5nIGZpZWxkIGJ5IGZpZWxkLiBUaGUgc2NyZWVucyB0aGF0IHN0aWxsIG5lZWQgYSBtb2RlbCBhcmUgbGlzdGVkIGluIGBNT0RfUkVBQ0gubWRgIGdhcCAyMTogdGhlIHNwZWxsIGxpc3RzLCB3aGljaCBiZWxvbmcgdG8gdGhlIG1lbnUgc2VhbSwgYW5kIHRoZSBpbnN0YWxsLXJlZnVzYWwgc2NyZWVucywgd2hpY2ggdGhlIG1vZGVsIGNhbiBub3cgcmVwcmVzZW50IGJ1dCB3aGljaCBhcmUgbm90IHlldCB3aXJlZCB0byBpdCAoc2VlIHRoZSBuZXh0IHNlY3Rpb24pLgoKIyMjIFJlZ2lvbnMgYXJlIHN0YWNrZWQsIGFuZCBhIHNjcmVlbiBpcyBvbmUgb2YgdGhlbQoKYHVpLXN0YWNrLnRzYCBob2xkcyB0aGUgbGl2ZSBzdGFjay4gYHB1c2hSZWdpb25gIGFkZHMgYSByZWdpb24sIHRoZSByZXR1cm5lZApoYW5kbGUncyBgcmVsZWFzZSgpYCByZW1vdmVzIGl0LCBgcmVsYXlvdXRTdGFja2AgcmUtcGxhY2VzIGV2ZXJ5IHJlZ2lvbiB3aGVuIHRoZQp0ZXJtaW5hbCBjaGFuZ2VzIHNoYXBlLCBhbmQgYHBhaW50UmVnaW9uU3RhY2tgIGRyYXdzIHRoZSBvbmVzIHRoYXQgd2FudCBhCnBhaW50ZXIsIGJvdHRvbSBiYW5kIHRvIHRvcCwgZWFjaCB0aHJvdWdoIGEgc3VyZmFjZSBjbGlwcGVkIHRvIGl0cyBvd24KcmVjdGFuZ2xlLgoKYHBsYWNlKGdyaWQpYCBpcyBjYWxsZWQgb24gZXZlcnkgbGF5b3V0IGNoYW5nZSwgc28gaXRzIGNvbnRyYWN0IGlzIG5hcnJvdzogcmV0dXJuIGEgcmVjdGFuZ2xlIGFuZCBkbyBubyB3b3JrLiBEbyBub3QgcGFpbnQgaW4gaXQsIHJlYWQgdGhlIGdhbWUgaW4gaXQsIG9yIHRocm93IGZyb20gaXQsIGJlY2F1c2UgYSByZXNpemUgY2FuIGFycml2ZSBiZXR3ZWVuIGFueSB0d28ga2V5c3Ryb2tlcy4gSXQgcnVucyBpbnNpZGUgYSB0cnkvY2F0Y2ggc28gb25lIGF1dGhvcidzIG1pc3Rha2UgY2Fubm90IGJyZWFrIHRoZSByZWxheW91dCBmb3IgZXZlcnkgb3RoZXIgcmVnaW9uLCBhbmQgYSByZWdpb24gd2hvc2UgYHBsYWNlKClgIHRocm93cyBvciB3aG9zZSByZWN0YW5nbGUgcnVucyBvZmYgdGhlIGdyaWQgaXMgcmVjb3JkZWQgaW4gYHJlZ2lvblN0YWNrRmF1bHRzKClgIGluc3RlYWQgb2YgYmVpbmcgc2lsZW50bHkgb21pdHRlZCwgd2hpY2ggd291bGQgbGVhdmUgYSBtaXNzaW5nIHdpbmRvdyB3aXRoIG5vdGhpbmcgdG8gc2VhcmNoIGZvci4KCmBwYWludChzdXJmYWNlKWAgaXMgb3B0aW9uYWwsIGFuZCBjb3JlIHVzdWFsbHkgbGVhdmVzIGl0IG91dDogYSBzY3JlZW4gdGhhdCBvd25zIHRoZSBrZXlib2FyZCByZXBhaW50cyBpdHNlbGYgd2hlbiBhIGtleSBhcnJpdmVzLiBHaXZlIHlvdXIgcmVnaW9uIGEgcGFpbnRlciB3aGVuIHlvdSB3YW50IGl0IHJlZHJhd24gZXZlcnkgZnJhbWUsIHN1Y2ggYXMgYSBIVUQgd2luZG93IG92ZXIgYSBsaXZlIG1hcC4KCkEgY29yZSBzY3JlZW4gb2NjdXBpZXMgYGNvcmU6c2NyZWVuYCBvbiB0aGUgYG1vZGFsYCBiYW5kLCBhbmQgaXRzIHJlY3RhbmdsZSBpcyB0aGUgd2hvbGUgdGVybWluYWwsIHBlcm1hbmVudGx5LiBBIG1vZCB0aGF0IHdhbnRzIGEgcGFuZWwgZGVjbGFyZXMgaXRzIG93biByZWdpb24gaW5zdGVhZCBvZiBhc2tpbmcgY29yZSB0byBtYWtlIHJvb20sIGJlY2F1c2Ugc2hyaW5raW5nIGNvcmUncyBzY3JlZW5zIHdvdWxkIG1vdmUgcGljdHVyZXMgdGhhdCB1cHN0cmVhbS1jaXRlZCBwYXJpdHkgdGVzdHMgcGluIGJ5dGUgZm9yIGJ5dGUsIGFuZCBubyBtb2Qgd291bGQgZ2FpbiBmcm9tIGl0LiBUbyBmaW5kIG91dCB3aGV0aGVyIGFueXRoaW5nIGlzIG92ZXIgdGhlIG1hcCBiZWZvcmUgeW91IGRyYXcgb24gaXQsIHJlYWQgYGZyYW1lLnN0YWNrYDsgc2VlIFtLbm93aW5nIHdoZW4geW91IGFyZSBjb3ZlcmVkXSgja25vd2luZy13aGVuLXlvdS1hcmUtY292ZXJlZC1mcmFtZXN0YWNrKS4gQ29yZSdzIG93biB2ZXJzaW9uIG9mIHRoYXQgY2hlY2sgaXMgYG9jY2x1ZGVyc09mYCAoYHBhY2thZ2VzL3dlYi9zcmMvcmVnaW9ucy50c2ApLCB3aGljaCBpcyBob3N0LWludGVybmFsIGFuZCByZXR1cm5zIGB1bmRlZmluZWRgLCBub3QgYFtdYCwgd2hlbiB5b3UgbmFtZSBhIHJlZ2lvbiB0aGF0IGlzIG5vdCBpbiB0aGUgc3RhY2ssIHNvIGEgdHlwbyBzaG93cyB1cCBhcyBhIHF1ZXN0aW9uIHdpdGggbm8gYW5zd2VyIGluc3RlYWQgb2YgYXMgZ29vZCBuZXdzLiBLZWVwIHRoYXQgZGlzdGluY3Rpb24gaW4geW91ciBvd24gY29weS4KCiMjIyBTdGFuZGluZyBhc2lkZSBmb3IgdGhlIGdhbWUncyBvd24gcHJvbXB0CgpBIHNjcmVlbidzIGBhY3Rpb25zYCBhcmUgdGhlIGdhbWUncyBvd24gY29tbWFuZHMsIGFuZCBzb21lIG9mIHRoZW0gYXNrIHRoZSBwbGF5ZXIgYSBxdWVzdGlvbiBvbiB0aGUgZmFpdGhmdWwgdGVybWluYWwgdW5kZXJuZWF0aCB5b3VyIG92ZXJsYXkuIFRoZSBjaGFyYWN0ZXIgc2hlZXQncyBgY2AgKHJlbmFtZSkgb3BlbnMgYSBuYW1lIHByb21wdCwgYW5kIGl0cyBgZmAgKGR1bXAgdG8gZmlsZSkgYXNrcyBmb3IgYSBmaWxlbmFtZS4gSWYgeW91ciBvdmVybGF5IGtlZXBzIGRyYXdpbmcsIHRoZSBwbGF5ZXIgaXMgYW5zd2VyaW5nIGEgcXVlc3Rpb24gdGhleSBjYW5ub3Qgc2VlLCBhbmQgYmVjYXVzZSB0aGUgcmVuYW1lIHJlYWNoZXMgYHBlcnNpc3RTYXZlKClgLCB0d28ga2V5c3Ryb2tlcyAoYGNgIHRoZW4gRW50ZXIpIG9uY2Ugd3JvdGUgdGhlIHNhdmUgd2l0aCBub3RoaW5nIHZpc2libGUgb24gc2NyZWVuIGF0IGFsbC4gRXNjYXBlIHdhcyB0aGUgb25seSBrZXkgdGhhdCBnb3Qgb3V0IHdpdGhvdXQgd3JpdGluZyBpdC4KCkZvcmJpZGRpbmcgcHJvbXB0cyBpbnNpZGUgYFNjcmVlbkhvc3QuaW52b2tlYCB3b3VsZCBtYWtlIHRoZSBhY3Rpb25zIGEgbW9kIGNhbiBvZmZlciBhIHN0cmljdCBzdWJzZXQgb2YgdGhlIGdhbWUncywgd2hpY2ggZGVmZWF0cyB0aGUgcHVycG9zZSBvZiB0aGUgc2VhbS4gVGhlIGdhbWUgYW5ub3VuY2VzIHRoZSBwcm9tcHQgYmVmb3JlIGl0IGxhbmRzIGluc3RlYWQ6IGEgcHJlc2VudGVyIHRoYXQgY2FuIHN0YW5kIGFzaWRlIGlzIHRvbGQgd2hhdCBpcyBjb21pbmcsIGF3YWl0ZWQgd2hpbGUgaXQgYW5pbWF0ZXMgb3V0LCBhbmQgZ2l2ZW4gaXRzIHNjcmVlbiBiYWNrIGFmdGVyd2FyZHMuCgogICAgc2hvdyh2aWV3LCBob3N0KSB7CiAgICAgIHJldHVybiB7CiAgICAgICAgZGlzbWlzc2VkLAogICAgICAgIHlpZWxkVGVybWluYWwocmVxdWVzdCkgewogICAgICAgICAgLy8gcmVxdWVzdDogYSBQcm9tcHRSZXF1ZXN0IHdoaWxlIHRoZSBnYW1lIG5lZWRzIHRoZSB0ZXJtaW5hbCwKICAgICAgICAgIC8vICAgICAgICAgIG51bGwgd2hlbiB5b3UgY2FuIHRha2UgaXQgYmFjay4KICAgICAgICAgIGNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gcmVxdWVzdCA9PT0gbnVsbCA/ICJibG9jayIgOiAibm9uZSI7CiAgICAgICAgfSwKICAgICAgfTsKICAgIH0KClRoZSByZXF1ZXN0IHNheXMgd2hhdCBpcyBiZWluZyBhc2tlZCAoYGxhYmVsYCksIHdoaWNoIG9mIHlvdXIgYGFjdGlvbnNgIGxlZCB0aGVyZQooYGFjdGlvbmApLCBhIHN0YWJsZSBpZGVudGl0eSB5b3UgY2FuIG1hdGNoIG9uIHdpdGhvdXQgcGFyc2luZyBwcm9zZSAoYGlkYCwgZS5nLgpgImNoYXJzaGVldDpyZW5hbWUiYCksIGhvdyBtdWNoIG9mIHRoZSB0ZXJtaW5hbCBpdCBuZWVkcyAoYGV4dGVudGA6IGAibGluZSJgIGZvciBhCnJvdy0wIHByb21wdCwgYCJzY3JlZW4iYCBmb3Igb25lIHRoYXQgY2xlYXJzIHRoZSBncmlkKSBhbmQgdGhlIHJlY3RhbmdsZSBpdCB3aWxsCmxhbmQgaW4gKGBjbGlwYCkuIEEgYCJsaW5lImAgcHJvbXB0IG9ubHkgbmVlZHMgcm93IDAsIHNvIHlvdSBtYXkga2VlcCBkcmF3aW5nCmV2ZXJ5dGhpbmcgYmVsb3cgaXQuCgpXaGF0ZXZlciB5b3UgcmV0dXJuIGlzIGF3YWl0ZWQsIHNvIGEgZmFkZS1vdXQgd29ya3MsIGFuZCB0aGUgcHJvbXB0IGRvZXMgbm90IGxhbmQgdW50aWwgaXQgZmluaXNoZXMuIFRoZXJlIGlzIG5vIHRpbWVvdXQuCgpgeWllbGRUZXJtaW5hbGAgaXMgb3B0aW9uYWwuIExlYXZpbmcgaXQgb3V0IGlzIG5vdCBhbiBlcnJvciwgYnV0IGl0IGlzIHJlcG9ydGVkIG9uY2UgYnkgbmFtZSwgd2l0aCB0aGUgbWVtYmVyIHRvIGFkZCBzcGVsbGVkIG91dCwgYW5kIHRoZSBnYW1lIGRyYXdzIGl0cyBwcm9tcHQgb3ZlciB5b3VyIHNjcmVlbiBhbnl3YXkuIFRoZSBjb21tYW5kIGFsd2F5cyBydW5zLCBzbyB5b3VyIGFjdGlvbnMgYXJlIG5ldmVyIGEgc21hbGxlciBzZXQgdGhhbiB0aGUgZ2FtZSdzLgoKSXQgaXMgb24gdGhlIHB1Ymxpc2hlZCB0eXBlIGluIGJvdGggY29waWVzOiBgU2NyZWVuU2hvd25gIGluIHRoZSBob3N0J3MgYHBhY2thZ2VzL3dlYi9zcmMvc2NyZWVuLXZpZXcudHNgIGFuZCBpbiB0aGUgU0RLJ3MgYHBhY2thZ2VzL21vZC1zZGsvc3JjL3NjcmVlbi50c2AsIHRvZ2V0aGVyIHdpdGggdGhlIHR5cGVzIHRoYXQgZGVzY3JpYmUgdGhlIGFubm91bmNlbWVudCwgYFByb21wdFJlcXVlc3RgIGFuZCBgUHJvbXB0RXh0ZW50YC4gRm9yIFR5cGVTY3JpcHQsIGltcG9ydCBhbGwgdGhyZWUgdHlwZS1vbmx5IGZyb20gdGhlIFNESywgd2hpY2ggdGhlIGJ1aWxkIGVyYXNlcyBsaWtlIGFueSBvdGhlciB0eXBlIGltcG9ydDoKCmBgYHRzCmltcG9ydCB0eXBlIHsKICBQcm9tcHRSZXF1ZXN0LAogIFNjcmVlblByZXNlbnRlciwKICBTY3JlZW5TaG93biwKfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKYGBgCgpVbnRpbCAyMDI2LTA4LTE0IHRoZSBtZW1iZXIgd2FzIGRlY2xhcmVkIG9ubHkgb24gYSBob3N0LWxvY2FsIGBZaWVsZGluZ1NjcmVlbmAsIGFuZCB0aGUgbWVjaGFuaXNtIHdvcmtlZCBhbnl3YXksIHdoaWNoIG1hZGUgdGhlIGdhcCBlYXN5IHRvIG1pc3MuIEFuIHVucHVibGlzaGVkIG1lbWJlciBkb2VzIG5vdCBzdG9wIGEgbW9kIGltcGxlbWVudGluZyBpdDogYHRzY2AgYWNjZXB0cyBgc2hvdzogKCkgPT4gKHsgZGlzbWlzc2VkLCB5aWVsZFRlcm1pbmFsIH0pYCBhZ2FpbnN0IGEgYFNjcmVlblNob3duIHwgdW5kZWZpbmVkYCByZXR1cm4gd2l0aCBubyBjYXN0IGFuZCBubyBleGNlc3MtcHJvcGVydHkgZXJyb3IuIFdoYXQgaXQgcHJldmVudHMgaXMgZmluZGluZyBvdXQgdGhhdCB0aGUgbWVtYmVyIGV4aXN0cywgYW5kIGdldHRpbmcgYW4gZXJyb3Igd2hlbiB5b3UgZ2V0IGl0IHdyb25nOiBgeWllbGRUZXJtaW5hbChyZXF1ZXN0OiBzdHJpbmcpYCBjb21waWxlZCwgYW5kIHdhcyBoYW5kZWQgYSBgUHJvbXB0UmVxdWVzdGAgYXQgcnVudGltZS4KCmBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zY3JlZW4tYWJpLWFncmVlbWVudC50ZXN0LnRzYCBrZWVwcyB0aGUgdHdvIGNvcGllcyBpbiBhZ3JlZW1lbnQ6IHRoZSBtZW1iZXIgbGlzdCwgYHlpZWxkVGVybWluYWxgJ3Mgc2lnbmF0dXJlIGNoYXJhY3RlciBmb3IgY2hhcmFjdGVyLCB0aGUgZG9jLWNvbW1lbnQgc2VudGVuY2UgdGhhdCBkZXNjcmliZXMgaXQsIGFuZCBgUHJvbXB0UmVxdWVzdGAncyBvd24gZmllbGQgbGlzdCBhbmQgdHlwZXMuIEl0IHJlYWRzIGJvdGggc291cmNlIGZpbGVzLCBiZWNhdXNlIGltcG9ydGluZyBib3RoIHR5cGVzIHdvdWxkIHByb3ZlIG5vdGhpbmc6IHR3byBzdHJ1Y3R1cmFsbHkgaWRlbnRpY2FsIGludGVyZmFjZXMgYXJlIG9uZSB0eXBlIHRvIHRoZSBjb21waWxlciwgd2hpY2ggaXMgdGhlIHNhbWUgYmxpbmQgc3BvdCB0aGF0IGxldCB0aGUgbWVtYmVyIHNoaXAgdW5wdWJsaXNoZWQuCgpFdmVyeSBhY3Rpb24gaW4gdGhlIGBTQ1JFRU5fUFJPTVBUU2AgY2Vuc3VzIGlzIGFubm91bmNlZC4gYGNoYXJzaGVldC50c2AgY292ZXJzIGBjb3JlOmNoYXJhY3RlcmAgYW5kIGBjb3JlOmNoYXJhY3Rlci1mbGFnc2AgKGByZW5hbWVgLCBgZmlsZWApOyBgbWFpbi50c2AgY292ZXJzIGBjb3JlOnJlcG9ydGAncyBgZGVzY3JpYmVgIGFuZCBgY29yZTp1cGRhdGVgJ3MgYG1vZHNgLiBUaGUgYG1vZHNgIGFjdGlvbiBvcGVucyBhIHdob2xlIG5lc3RlZCBwYWdlIChgc2hvd01vZFVwZ3JhZGVzYCkgd2hvc2Ugb3duIHNjcmVlbnMgd291bGQgY29tZSBiYWNrIHJvdW5kIHRvIHRoZSBwcmVzZW50ZXIgdGhhdCBpcyBhbHJlYWR5IGhvbGRpbmcgYGNvcmU6dXBkYXRlYC4gV2hpbGUgeW91IGFyZSBzdGFuZGluZyBhc2lkZSB5b3UgYXJlIG5vdCBvZmZlcmVkIHRoZW07IHRoZSBnYW1lIHNob3dzIHRob3NlIGl0c2VsZiwgYmVjYXVzZSBvZmZlcmluZyB0aGVtIHdvdWxkIGFzayB5b3UgdG8gZHJhdyBvdmVyIHRoZSB0ZXJtaW5hbCB5b3UganVzdCBjbGVhcmVkLgoKIyMjIEEgcm93IHdpdGggYSBwYXJhZ3JhcGgKCmBTY3JlZW5Sb3cuZGV0YWlsYCBpcyBwcm9zZSBhdHRhY2hlZCB0byBvbmUgcm93IG9mIGEgdGFibGUuIEl0IGlzIGEKYFNjcmVlblByb3NlYCwgdGhlIHNhbWUgYHsgcGFyYWdyYXBocywgaW5kZW50Pywgd3JhcD8sIGZsb3c/LCBjb2xvcj8gfWAgYQpgdGV4dGAgYmxvY2sgaXMgbWFkZSBvZiwgc28gYSBwcmVzZW50ZXIgdGhhdCBjYW4gYWxyZWFkeSBkcmF3IGEgcHJvc2UgYmxvY2sgY2FuCmRyYXcgYSBkZXRhaWwsIGFuZCBvbmUgdGhhdCBvbmx5IHdhbnRzIHRoZSByZWNvcmQgY2FuIGlnbm9yZSBpdC4KClRoZSBydWxlIGZvciB0ZWxsaW5nIHRoZSB0d28gYXBhcnQgaXMgdW5jaGFuZ2VkLCBhbmQgaXQgZXhwbGFpbnMgdGhlIHNoYXBlIG9mIGBkZXRhaWxgOiBzdHJ1Y3R1cmUgaXMgd2hhdCBoYXMga2V5cywgYW5kIHByb3NlIGlzIHdoYXQgaGFzIHBhcmFncmFwaHMuIEFueXRoaW5nIHlvdSBuZWVkIHRvIHJlYWNoIGJ5IG5hbWUgaXMgYSBjZWxsLCBhZGRyZXNzZWQgYnkgaXRzIGNvbHVtbiBrZXkuIEEgZGV0YWlsIGhhcyBubyBrZXkgYW5kIGNhbm5vdCBiZSBhZGRyZXNzZWQuIElmIHlvdSBmaW5kIHlvdXJzZWxmIHBhcnNpbmcgb25lLCB3aGF0IHlvdSBhcmUgcGFyc2luZyBpcyBhIGNvbHVtbiB0aGUgc2NyZWVuIGhhcyBub3QgZGVjbGFyZWQgeWV0LCBzbyByZXBvcnQgaXQgYXMgYSBidWcgaW5zdGVhZCBvZiBzcGxpdHRpbmcgdGhlIHN0cmluZy4gVGhlIGlkcyBiZWhpbmQgYSBkZXBlbmRlbmN5IGN5Y2xlIGxpa2UgYEEgLT4gQiAtPiBBYCBhcmUgb24gYHNlbWFudGljLmRhdGFgLCB3aGVyZSBgYXV0b1NvcnRTY3JlZW5gIGFscmVhZHkgcHV0cyB0aGVtLgoKQSBkZXRhaWwgbmV2ZXIgYWZmZWN0cyBsYXlvdXQgYmV5b25kIGl0cyBvd24gcm93LiBJdCBpcyBub3QgY29uc3VsdGVkIHdoZW4gY29sdW1uIHdpZHRocyBhcmUgY29tcHV0ZWQsIHNvIGEgbG9uZyBwYXJhZ3JhcGggY2Fubm90IHdpZGVuIGEgY29sdW1uIG9yIG1vdmUgdGhlIHJvdyBhYm92ZSBpdCwgYW5kIGEgcm93IHdpdGhvdXQgYSBkZXRhaWwgaXMgbGFpZCBvdXQgdGhlIHNhbWUgd2hldGhlciBvciBub3QgaXRzIG5laWdoYm91cnMgaGF2ZSBvbmUuIEl0IGFkZHMgbm8gdGhpcmQgd3JhcHBpbmcgcnVsZSBlaXRoZXI6IGl0IGlzIGxhaWQgb3V0IGJ5IHRoZSBzYW1lIGZ1bmN0aW9uIGFzIGEgYHRleHRgIGJsb2NrLCBhbmQgY2hvb3NlcyBiZXR3ZWVuIEFuZ2JhbmQncyB0d28gYWxnb3JpdGhtcyB0aHJvdWdoIHRoZSBzYW1lIGBmbG93YCBmaWVsZC4KClRocmVlIHNjcmVlbnMgbmVlZGVkIHRoaXM6IHRoZSBpbnN0YWxsIHJlZnVzYWwsIGEgZHJvcHBlZCBhdXRvLXNvcnQgc3VnZ2VzdGlvbiwgYW5kIGEgZGVjbGFyZWQtY29uZmxpY3QgY2xhaW0uIEVhY2ggaXMgYSByZWNvcmQgd2l0aCBhIHBhcmFncmFwaCBhdHRhY2hlZCwgYW5kIHRoZXkgaGFkIGJlZW4gc3R1Y2sgYXQgYGxpbmVzYCBiZWNhdXNlIHRoZXJlIHdhcyBub3doZXJlIHRvIHB1dCB0aGUgcGFyYWdyYXBoLiBDdXR0aW5nIHRoZSBwYXJhZ3JhcGggaW50byByb3cgZnJhZ21lbnRzIHdvdWxkIGhhdmUgbGVmdCB0aGVtIGFzIGBsaW5lc2AgaW4gYWxsIGJ1dCBuYW1lLCBzaW5jZSBhIHByZXNlbnRlciB3b3VsZCBzdGlsbCBoYXZlIGhhZCB0byBrbm93IHRoYXQgc29tZSByb3dzIGNvbnRpbnVlIG90aGVycy4KClRoZSBzZXZlbiByZWNhbGwgcGFnZXMgYXJlIGFsbCBgdGV4dGAgYmxvY2tzLCBhbmQgdGhleSBoYXZlIHNldmVuIGlkcyBpbnN0ZWFkIG9mIG9uZSBzbyB0aGF0IGEgbW9kIGNhbiB0ZWxsIHRoZW0gYXBhcnQsIGZvciBleGFtcGxlIHRvIGRyYXcgYW4gYXJ0aWZhY3QncyBwYWdlIGFzIGEgcGxhcXVlIGFuZCBhIHRyYXAncyBhcyBhIHdhcm5pbmcgY2FyZC4gSWYgeW91IG9ubHkgd2FudCB0byByZXN0eWxlIHByb3NlLCBtYXRjaCBvbiBhbGwgc2V2ZW4gKG9yIG9uIGBibG9jay5raW5kID09PSAidGV4dCJgKTsgbm90aGluZyBpbiBhIHByb3NlIHBhbmVsIG5lZWRzIHRvIGtub3cgd2hpY2ggb25lIGl0IGhhcy4KClRoZSBwbGF5ZXIgZGlzbWlzc2VzIGEgc2NyZWVuIGluc3RlYWQgb2YgYW5zd2VyaW5nIGl0LCB3aGljaCBpcyB0aGUgb25lIGRpZmZlcmVuY2UgaW4gc2hhcGUgZnJvbSBgbWVudWAuIGBzaG93YCBkZWNsaW5lcyBieSByZXR1cm5pbmcgYHVuZGVmaW5lZGAgc3luY2hyb25vdXNseSwgYW5kIHRha2VzIHRoZSBzY3JlZW4gYnkgcmV0dXJuaW5nIGB7IGRpc21pc3NlZCB9YCwgYSBwcm9taXNlIHlvdSByZXNvbHZlIHdoZW4gdGhlIHBsYXllciBjbG9zZXMgaXQuIE9uY2UgdGhlIHByb21pc2UgbWVhbnMgInRoZXkgY2xvc2VkIGl0IiwgdGhlcmUgaXMgbm8gYW5zd2VyIHZhbHVlIGxlZnQgdG8gZGVjbGluZSB3aXRoLCBhbmQgdGhlIGRlY2lzaW9uIG5ldmVyIG5lZWRzIHRvIGJlIGFzeW5jIGFueXdheSwgc2luY2UgeW91IG1hdGNoIG9uIGB2aWV3LmlkYC4gUmVzb2x2aW5nIGBkaXNtaXNzZWRgIGlzIHRoZSB3aG9sZSBjb250cmFjdDogaWYgeW91ciBwcmVzZW50ZXIgbmV2ZXIgcmVzb2x2ZXMgaXQsIHRoZSBwbGF5ZXIgY2Fubm90IGdldCBiYWNrIHRvIHRoZSBnYW1lLgoKU29tZSBzY3JlZW5zIGNhbiBiZSBhY3RlZCBvbiwgYW5kIHRob3NlIGdpdmUgeW91IGEgd2F5IGJhY2sgaW50byB0aGUgZ2FtZS4gTW9zdCBzY3JlZW5zIGFyZSBvbmx5IGRpc21pc3NlZCwgYnV0IHRoZSBjaGFyYWN0ZXIgc2hlZXQgYWxzbyBvZmZlcnMgcmVuYW1pbmcsIGEgY2hhcmFjdGVyIGR1bXAgYW5kIHRoZSBwYWdlIGN5Y2xlIGZyb20gdGhlIHNhbWUgbW9kYWwsIGFzIHVwc3RyZWFtIGRvZXMsIGFuZCBhIHByZXNlbnRlciB0aGF0IHRvb2sgdGhlIHNoZWV0IHdpdGhvdXQgcmVhY2hpbmcgdGhvc2Ugd291bGQgcXVpZXRseSB0YWtlIHRoZSBjb21tYW5kcyBhd2F5IGZyb20gdGhlIHBsYXllci4gVGhlIHZpc2libGUtbW9uc3RlciBsaXN0IGhhcyBhIHNpbmdsZSBhY3Rpb24sIGBzb3J0LWV4cGAgKGB4YCksIHdoaWNoIGZsaXBzIHRoZSBzb3J0IGJldHdlZW4gZGVwdGggYW5kIGV4cGVyaWVuY2UuIGB2aWV3LmFjdGlvbnNgIHB1Ymxpc2hlcyB0aGVzZSBhcyBkYXRhOiBhIHN0YWJsZSBgaWRgIChgcmVuYW1lYCwgYGZpbGVgLCBgcGFnZS1uZXh0YCwgYHBhZ2UtcHJldmApLCB0aGUgYGtleWAgdGhlIGZhaXRoZnVsIHRlcm1pbmFsIGxpc3RlbnMgZm9yLCBhbmQgdGhlIGdhbWUncyBvd24gYGxhYmVsYC4gYHNob3codmlldywgaG9zdClgIGhhbmRzIHlvdSBhIGBTY3JlZW5Ib3N0YCB3aG9zZSBgaW52b2tlKGlkKWAgcnVucyBvbmUuCgpgYGBqcwpzaG93KHZpZXcsIGhvc3QpIHsKICBpZiAodmlldy5pZCAhPT0gImNvcmU6Y2hhcmFjdGVyIikgcmV0dXJuIHVuZGVmaW5lZDsKICBsZXQgc2hvd24gPSB2aWV3OwogIGNvbnN0IG9uS2V5ID0gKGV2KSA9PiB7CiAgICBjb25zdCBhY3Rpb24gPSBzaG93bi5hY3Rpb25zICYmIHNob3duLmFjdGlvbnMuZmluZCgoYSkgPT4gYS5rZXkgPT09IGV2LmtleSk7CiAgICBpZiAoIWFjdGlvbikgcmV0dXJuOwogICAgaG9zdC5pbnZva2UoYWN0aW9uLmlkKS50aGVuKChuZXh0KSA9PiB7CiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGNsb3NlKCk7ICAgLy8gdGhlIGdhbWUgaGFzIHRha2VuIHRoZSBzY3JlZW4gYmFjawogICAgICBzaG93biA9IG5leHQ7ICAgICAgICAgICAgICAgIC8vIHRoZSBzYW1lIHNoZWV0IHJlbmFtZWQsIG9yIHRoZSBvdGhlciBwYWdlCiAgICAgIHBhaW50KHNob3duKTsKICAgIH0pOwogIH07CiAgLi4uCn0KYGBgCgpgaW52b2tlYCBydW5zIHRoZSBnYW1lJ3MgY29kZSAoYSByZW5hbWUgc3RpbGwgb3BlbnMgdGhlIGdhbWUncyBwcm9tcHQsIGFuZCBhIGR1bXAgc3RpbGwgd3JpdGVzIHRoZSBnYW1lJ3MgZmlsZSkgYW5kIHJlc29sdmVzIHdpdGggd2hhdCB0aGUgcGxheWVyIHNob3VsZCBzZWUgbmV4dDogdXN1YWxseSB0aGUgc2FtZSBzY3JlZW4gd2l0aCBuZXcgY29udGVudCwgb3IgdGhlIG5leHQgcGFnZS4gYHVuZGVmaW5lZGAgbWVhbnMgdGhlIGdhbWUgaGFzIHRha2VuIHRoZSBzY3JlZW4gYmFjazsgcmVzb2x2ZSBgZGlzbWlzc2VkYCB3aGVuIHlvdSBzZWUgaXQuIEFuIGlkIHRoaXMgZW5naW5lIGRvZXMgbm90IGtub3cgaXMgYSBuby1vcCB0aGF0IGhhbmRzIHRoZSBjdXJyZW50IHZpZXcgYmFjaywgc28gYXNraW5nIGZvciBhIG5ld2VyIGNvbW1hbmQgY2FuIG5ldmVyIGNsb3NlIHRoZSBwbGF5ZXIncyBzY3JlZW4uIGBob3N0YCBhcnJpdmVzIG9ubHkgd2hlcmUgYGFjdGlvbnNgIGRvZXMsIGFuZCBpdCBpcyBhIHNlY29uZCBwYXJhbWV0ZXIgaW5zdGVhZCBvZiBhIGZpZWxkIG9mIHRoZSB2aWV3IGJlY2F1c2UgYSB2aWV3IGlzIGZyb3plbiBkYXRhIGFuZCBhIHdheSBiYWNrIGludG8gdGhlIGdhbWUgY2Fubm90IGJlLgoKVGhyb3dpbmcgY29zdHMgeW91IHRoZSBzZWFtIGZvciB0aGUgc2Vzc2lvbiwgYXMgd2l0aCBgbWVudWAuIElmIHlvdSB0aHJvdyB3aGlsZSBhIHNjcmVlbiBpcyBvcGVuLCBvciByZWplY3QgYGRpc21pc3NlZGAsIHRoZSBnYW1lIHJlcG9ydHMgeW91ciBtb2QgYnkgbmFtZSBhbmQgc2hvd3MgdGhlIHNjcmVlbiBpdHNlbGYsIHNvIHRoZSBwbGF5ZXIgaXMgbmV2ZXIgbGVmdCBzdGFyaW5nIGF0IGEgZGVhZCBvdmVybGF5IHdpdGggbm8gd2F5IG91dC4gVGhhdCByZWNvdmVyeSBleGlzdHMgc28gYSBidWcgZG9lcyBub3QgY29zdCBhIGNoYXJhY3RlcjsgZG8gbm90IHJlbHkgb24gaXQgYXMgbm9ybWFsIGJlaGF2aW91ci4KCioqQSBzY3JlZW4gaGFzIG5vIHB1Ymxpc2hlZCByZWdpb24gZWl0aGVyLioqIEl0IGNvdmVycyB0aGUgd2luZG93LCBmb3IgdGhlIHNhbWUKcmVhc29uIGEgZmxvYXRpbmcgbWVudSBkb2VzLgoKYHNhbXBsZXMvc3ByaXRlLWludmVudG9yeS9gIGlzIGEgY29tcGxldGUgd29ya2VkIGV4YW1wbGU6IGl0IGRyYXdzIHRoZSBpbnZlbnRvcnksCnRoZSBlcXVpcG1lbnQgYW5kIHRoZSBxdWl2ZXIgYXMgaXRlbSBjYXJkcywgbGF5cyB0aGUgcmVjYWxsIHBhZ2VzIG91dCBpbnRvIGEKcGFuZWwgb2YgaXRzIG93biB3aWR0aCBieSBtZWFzdXJpbmcgdGhlbSwgYW5kIGRlY2xpbmVzIGV2ZXJ5IG90aGVyIHNjcmVlbi4KCiMjIGBiaXJ0aChjdHgpYDogcnVuIGNoYXJhY3RlciBjcmVhdGlvbiB5b3VyIG93biB3YXkKCmBiaXJ0aChjdHgpYCBoYW5kcyBhIG1vZCBjaGFyYWN0ZXIgY3JlYXRpb24sIGZyb20gdGhlIHJhY2UgY2hvaWNlIHRvIHRoZSBzdGFydCBvZiBwbGF5LiBJdCBuZWVkcyBgdWk6YmlydGgucmVwbGFjZWAgKG9yIGB1aToqLnJlcGxhY2VgKS4KCmBgYGpzCmJpcnRoKGN0eCkgewogIHJldHVybiB7CiAgICBzaG93KHNlc3Npb24pIHsKICAgICAgY29uc3QgeyByYWNlcywgY2xhc3NlcyB9ID0gc2Vzc2lvbi5jYXRhbG9ndWUoKTsKICAgICAgb3BlbldpemFyZCh7CiAgICAgICAgcmFjZXMsCiAgICAgICAgY2xhc3NlcywKICAgICAgICBkcmFmdDogKCkgPT4gc2Vzc2lvbi5kcmFmdCgpLCAgICAgICAgLy8gc3RhdHMsIG5hbWUsIGJhY2tncm91bmQsIHByZXZpZXcKICAgICAgICBwaWNrOiAocmFjZSwgY2xzKSA9PiB7IHNlc3Npb24uY2hvb3NlUmFjZShyYWNlKTsgc2Vzc2lvbi5jaG9vc2VDbGFzcyhjbHMpOyB9LAogICAgICAgIGJ1eTogKHN0YXQpID0+IHNlc3Npb24uYnV5KHN0YXQpLAogICAgICAgIHN0YXJ0OiAoKSA9PiBzZXNzaW9uLmFjY2VwdCgpLCAgICAgICAvLyB0aGUgcGFnZSByZWxvYWRzIGludG8gdGhlIG5ldyBjaGFyYWN0ZXIKICAgICAgICBiYWNrOiAoKSA9PiBzZXNzaW9uLmNhbmNlbCgpLCAgICAgICAgLy8gYmFjayB0byB0aGUgdGl0bGUgc2NyZWVuCiAgICAgIH0pOwogICAgICByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0YWtlIGl0OyByZXR1cm4gdW5kZWZpbmVkIHRvIGRlY2xpbmUKICAgIH0sCiAgfTsKfQpgYGAKCkV2ZXJ5IGNoYW5nZSBnb2VzIHRocm91Z2ggdGhlIGdhbWUncyBvd24gcnVsZXMgYW5kIGFuc3dlcnMgYHsgb2s6IHRydWUgfWAgb3IgYHsgb2s6IGZhbHNlLCByZWFzb24gfWAsIHNvIHRoZSB3aXphcmQgbmV2ZXIgY29tcHV0ZXMgcG9pbnQgY29zdHMgb3Igc3VnZ2VzdGVkIHN0YXRzIGl0c2VsZi4gS2VlcCBjYWxsaW5nIGBkcmFmdCgpYCBhZnRlciBlYWNoIGNoYW5nZTogaXQgaXMgdGhlIGNoYXJhY3RlciBhcyB0aGUgZ2FtZSB3b3VsZCBzdGFydCBpdCwgd2l0aCB0aGUgcHJldmlldyBidWlsdCB0aGUgd2F5IHRoZSBiaXJ0aCBzY3JlZW4gYnVpbGRzIGl0LiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDR4XShNT0RfU0VBTVMubWQjNHgtY2hhcmFjdGVyLWNyZWF0aW9uKSBmb3IgdGhlIGZ1bGwgc2Vzc2lvbi4KCiMjIGByZWdpb25zKGN0eClgOiBwdXQgZnVybml0dXJlIG9mIHlvdXIgb3duIG9uIHRoZSBzY3JlZW4KCmByZWdpb25zKGN0eClgIGlzIHRoZSBmaWZ0aCBvd25lciBzZWFtLCBhbmQgdGhlIG9ubHkgb25lIHdpdGggbm8gd2lubmVyLiBUaGUgb3RoZXIgZm91ciBlYWNoIGRlY2lkZSB3aG8gZ2V0cyBzb21ldGhpbmcsIGJlY2F1c2UgdGhlIG1hcCwgYSBIVUQgcmVnaW9uLCB0aGUgbWVudSBzZWFtIGFuZCB0aGUgc2NyZWVuIHNlYW0gYXJlIGVhY2ggYSBzaW5nbGUgdGhpbmcgdGhhdCB0d28gbW9kcyBjYW5ub3QgYm90aCBoYXZlLiBSZWdpb25zIHdvcmsgZGlmZmVyZW50bHk6IHdoZW4gdHdvIG1vZHMgYm90aCBkZWNsYXJlIG9uZSwgdGhleSBkbyBub3QgY29tcGV0ZS4gVGhleSBhcmUgdHdvIHBpZWNlcyBvZiBmdXJuaXR1cmUgdGhhdCBjb2V4aXN0LCBlYWNoIGF0IGl0cyBvd24gYmFuZCwgaW4gbG9hZCBvcmRlci4gTG9hZCBvcmRlciBtYXR0ZXJzIGhlcmUgb25seSBpbiB0aGUgb3JkaW5hcnkgc2Vuc2UgdGhhdCwgd2l0aGluIGEgYmFuZCwgdGhlIGxhdGVyLWxvYWRlZCByZWdpb24gZHJhd3Mgb24gdG9wLgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICByZWdpb25zKGN0eCkgewogICAgcmV0dXJuIFt7CiAgICAgIGlkOiAiY2FycmllZCIsCiAgICAgIGxheWVyOiAib3ZlcmxheSIsCiAgICAgIHBsYWNlOiAoZ3JpZCkgPT4gKHsgeDogZ3JpZC5jb2xzIC0gMTgsIHk6IDEsIHc6IDE3LCBoOiAxIH0pLAogICAgICBwYWludDogKHN1cmZhY2UpID0+IHN1cmZhY2UucHV0KDAsIDAsIGBDYXJyaWVkICR7d2VpZ2h0KCl9IGxiYCksCiAgICB9XTsKICB9LAp9OwpgYGAKCkl0IHJlcXVpcmVzIGB1aTpyZWdpb24uY3JlYXRlYC4gYHVpOioucmVwbGFjZWAgZG9lcyBub3QgZ3JhbnQgaXQ6IHRoYXQgd2lsZGNhcmQgY292ZXJzIHdoaWNoIG9mIHRoZSBnYW1lJ3Mgb3duIHJlZ2lvbnMgY2hhbmdlIGhhbmRzLCBhbmQgYWRkaW5nIGEgcmVnaW9uIG9mIHlvdXIgb3duIGlzIGEgc2VwYXJhdGUgdGhpbmcgZm9yIHRoZSBwbGF5ZXIgdG8gYWdyZWUgdG8uIERlY2xhcmluZyBgcmVnaW9ucygpYCB3aXRob3V0IHRoZSBjYXBhYmlsaXR5IGlzIHJlcG9ydGVkIGJ5IG5hbWUsIHdpdGggdGhlIGZpeCBzcGVsbGVkIG91dCwgaW5zdGVhZCBvZiBzaWxlbnRseSBkcmF3aW5nIG5vdGhpbmcuCgpZb3VyIGlkIGlzIG5hbWVzcGFjZWQ6IGRlY2xhcmUgYCJjYXJyaWVkImAgYW5kIHRoZSBsaXZlIHN0YWNrIGhvbGRzIGBteS1tb2Q6Y2FycmllZGAuIFRoaXMgbWF0dGVycyBmb3IgY29ycmVjdG5lc3MuIEEgbW9kIG5hbWluZyBpdHMgcmVnaW9uIGBtYXBgIHdvdWxkIHB1dCBhIHNlY29uZCBgbWFwYCBpbiB0aGUgc3RhY2ssIGFuZCBgb2NjbHVkZXJzT2ZgIGFuc3dlcnMgYWJvdXQgdGhlIGZpcnN0IG1hdGNoLCBzbyBhIGZyb250IGVuZCdzIG9uZSBxdWVzdGlvbiBjb3VsZCBxdWlldGx5IHN0YXJ0IGJlaW5nIGFuc3dlcmVkIGFib3V0IHNvbWVib2R5IGVsc2UncyByZWN0YW5nbGUuCgpGYWlsdXJlIGlzIHBlciBkZWNsYXJhdGlvbiwgbm90IHBlciBtb2QuIEEgcmVjdGFuZ2xlIHdpdGggbm8gYHBhaW50YCwgYSBiYW5kIHRoYXQgZG9lcyBub3QgZXhpc3QsIGEgZHVwbGljYXRlIG5hbWUsIG9yIGEgYHBhaW50YCB0aGF0IHRocm93cyBvbiBpdHMgZmlyc3QgZnJhbWUgZWFjaCBjb3N0cyB0aGF0IG9uZSByZWdpb24sIGlzIHJlcG9ydGVkIG9uY2UsIGFuZCBsZWF2ZXMgeW91ciBvdGhlciByZWdpb25zIGFuZCBldmVyeSBvdGhlciBtb2QncyBhbG9uZS4KCkEgZmF1bHRpbmcgcmVnaW9uIGlzIHdpdGhkcmF3biBpbnN0ZWFkIG9mIGJlaW5nIGxlZnQgZW1wdHkuIFRoaXMgZGlmZmVycyBmcm9tIGNvcmU6IGB1aS1zdGFjay50c2AgbGVhdmVzIGEgZmF1bHRlZCBjb3JlIHNjcmVlbiBpbiB0aGUgY29tcG9zaXRlLCB3aGljaCBpcyByaWdodCBmb3Igc29tZXRoaW5nIHRoYXQgc3RpbGwgb3ducyB0aGUga2V5Ym9hcmQuIEEgZGVjb3JhdGl2ZSBwYW5lbCBoYXMgbm8gc3VjaCBjbGFpbS4gTGVmdCBpbiB0aGUgc3RhY2sgaXQgd291bGQgYmUgYSBwaGFudG9tIG9jY2x1ZGVyLCBhbmQgYSByZXBsYWNlbWVudCBmcm9udCBlbmQgYXNraW5nIGBvY2NsdWRlcnNPZihzdGFjaywgIm1hcCIpYCB3b3VsZCBoaWRlIGl0cyBjYW52YXMgZm9yIGEgcmVnaW9uIHRoYXQgaGFzIGRyYXduIG5vdGhpbmcgc2luY2UgaXRzIGZpcnN0IGZyYW1lLiBTbyB0aGUgaGFuZGxlIGlzIHJlbGVhc2VkLCBhbmQgdGhlIHJlZ2lvbiBkaXNhcHBlYXJzIHdpdGggYSBtZXNzYWdlIGluc3RlYWQgb2YgbGluZ2VyaW5nIHdpdGhvdXQgb25lLgoKYHBsYWNlKGdyaWQpYCBtdXN0IGJlIGNoZWFwLCB0b3RhbCBhbmQgcHVyZS4gSXQgcnVucyBmb3IgZXZlcnkgb3BlbiByZWdpb24gb24gZXZlcnkgZnJhbWUgYW5kIG9uIGV2ZXJ5IHJlc2l6ZTogbm8gZ2FtZSByZWFkcywgbm8gcGFpbnRpbmcsIGFuZCBubyBhbGxvY2F0aW9uIHlvdSBjYW4gYXZvaWQuIFJldHVybiB0aGUgcmVjdGFuZ2xlIGZvciBhIHRlcm1pbmFsIG9mIHRoYXQgc2l6ZTsgYSByZWN0YW5nbGUgdGhhdCBydW5zIG9mZiB0aGUgZ3JpZCBpcyByZWNvcmRlZCBpbiBgcmVnaW9uU3RhY2tGYXVsdHMoKWAgaW5zdGVhZCBvZiBiZWluZyBkcmF3bi4KClRoZSBgc3lzdGVtYCBsYXllciBpcyByZXNlcnZlZCBmb3IgdGhlIGdhbWUuIEFza2luZyBmb3IgaXQgaXMgcmVmdXNlZCB3aXRoIGl0cyBvd24gbWVzc2FnZSBpbnN0ZWFkIG9mIGEgZ2VuZXJpYyBiYWQtYmFuZCBvbmUsIGJlY2F1c2UgaXQgaXMgYSByZWFsIGJhbmQgKHRoZSB0b3Agb25lKSBhbmQgdGhlIHJlZnVzYWwgaXMgaW50ZW50aW9uYWwsIG5vdCBhIHNpZ24gb2YgYSB0eXBvLiBUaGUgbW9kIG1hbmFnZXIgYW5kIGZhdWx0IHJlcG9ydHMgaGF2ZSB0byBiZSBkcmF3YWJsZSBhYm92ZSBldmVyeSBtb2QsIGluY2x1ZGluZyBvbmUgdGhhdCBoYXMgZ29uZSB3cm9uZy4gVXNlIGAib3ZlcmxheSJgIGZvciBmdXJuaXR1cmUsIG9yIGAibW9kYWwiYCBmb3Igc29tZXRoaW5nIHRoYXQgbmVlZHMgdGhlIHBsYXllcidzIGF0dGVudGlvbi4KCiMjIENhcGFiaWxpdGllcwoKVGhlIGBHcmlkU3VyZmFjZWAgcmVuZGVyaW5nIGNvbnRyYWN0IGlzIGhvc3QgaW5mcmFzdHJ1Y3R1cmUsIG5vdCBhIHJlZ2lzdHJ5IGNhcGFiaWxpdHkuIGBmcm9udGVuZGAgaXMgYSBkaXJlY3QgYE1vZFBsdWdpbmAgbWVtYmVyIGJlY2F1c2UgaXQgc2VsZWN0cyBvbmUgZGlzcGxheSBvd25lciBpbnN0ZWFkIG9mIHJlZ2lzdGVyaW5nIGFuIGluZGVwZW5kZW50IGdhbWUgYmVoYXZpb3VyLCBhbmQgZm9yIHRoZSBzYW1lIHJlYXNvbiBpdCBoYXMgYSBjYXBhYmlsaXR5IGtpbmQgb2YgaXRzIG93biwgYGRpc3BsYXk6cmVwbGFjZWAuIGBodWRgIGhhcyB0aGUgc2FtZSBzaGFwZSBvbmUgbGV2ZWwgZmluZXI6IGEgZGlyZWN0IG1lbWJlciBiZWNhdXNlIGl0IHNlbGVjdHMgYW4gb3duZXIsIGdhdGVkIHBlciByZWdpb24gYnkgYHVpOjxyZWdpb24+LnJlcGxhY2VgLCBiZWNhdXNlIGEgbW9kIHRoYXQgZHJhd3MgaGl0IHBvaW50cyBhcyBhIGJhciBoYXMgbm8gYnVzaW5lc3MgdGFraW5nIHRoZSBtZXNzYWdlIGxvZyBhcyB3ZWxsLCBhbmQgYSBwbGF5ZXIgZ2l2aW5nIGNvbnNlbnQgc2hvdWxkIGJlIHRvbGQgd2hpY2ggcGFydCBvZiB0aGUgc2NyZWVuIGlzIGNoYW5naW5nIGhhbmRzLiBgbWVudWAgaXMgdGhlIHRoaXJkLCBnYXRlZCBieSBgdWk6bWVudS5yZXBsYWNlYCBmb3IgYWxsIG1lbnVzIGF0IG9uY2UsIGJlY2F1c2UgdGhlIHVuaXQgYSBwbGF5ZXIgY2FuIHdlaWdoIGlzICJ0aGUgZ2FtZSdzIG1lbnVzIiwgbm90IGZpZnR5IGluZGl2aWR1YWwgc2NyZWVucy4gQWxsIHRocmVlIGB1aToqYCBncmFudHMgYW5kIGBkaXNwbGF5OnJlcGxhY2VgIGFyZSBzZXBhcmF0ZSBraW5kcyBpbiBib3RoIGRpcmVjdGlvbnM6IGEgbW9kIGhvbGRpbmcgdGhlIGR1bmdlb24gY2Fubm90IGRyYXcgdGhlIHZpdGFscywgYW5kIGEgbW9kIGhvbGRpbmcgZXZlcnkgbWVudSBjYW5ub3QgZHJhdyB0aGUgZHVuZ2Vvbi4KCmB1aTo8cmVnaW9uPi48YWN0aW9uPmAgaGFzIHRocmVlIGFjdGlvbnMsIGFuZCB0aGUgYWN0aW9uIGlzIGNvbXBhcmVkIGFzIHdlbGwgYXMgdGhlIHJlZ2lvbi4gYHJlcGxhY2VgIGhhbmRzIG92ZXIgc29tZXRoaW5nIHRoZSBnYW1lIGFscmVhZHkgZHJhd3MuIGByZWdpb24uY3JlYXRlYCBhZGRzIGEgcmVjdGFuZ2xlIG9mIHRoZSBnYW1lJ3Mgb3duIGNoYXJhY3RlciBncmlkIGJlc2lkZSBpdC4gYHBhbmVsLm1vdW50YCBwdXRzIHJlYWwgSFRNTCBvbiB0aGUgcGFnZSBhYm92ZSB0aGUgZ2FtZSwgcmVhY2hlZCB0aHJvdWdoIGBjdHgudWlgIGluc3RlYWQgb2YgYSBgTW9kUGx1Z2luYCBtZW1iZXIsIGJlY2F1c2UgYSBwYW5lbCBvcGVucyB3aGVuIHRoZSBwbGF5ZXIgYXNrcyBmb3Igb25lIGluc3RlYWQgb2YgYmVpbmcgZGVjbGFyZWQgb25jZSBhdCBsb2FkLiBgdWk6Ki5yZXBsYWNlYCBjb3ZlcnMgbmVpdGhlciBvZiB0aGUgb3RoZXIgdHdvOiB0aGUgd2lsZGNhcmQgY292ZXJzIHdoaWNoIG9mIHRoZSBnYW1lJ3MgcmVnaW9ucyBjaGFuZ2UgaGFuZHMsIGFuZCBhZGRpbmcgZnVybml0dXJlIG9yIG1vdW50aW5nIGEgd2ViIHBhZ2UgYXJlIHNlcGFyYXRlIHRoaW5ncyBmb3IgYSBwbGF5ZXIgdG8gYWdyZWUgdG8uIGB1aTpyZWdpb25gLCBgdWk6cGFuZWxgIGFuZCBgdWk6dGl0bGVgIGFyZSBraW5kcyBvZiB0aGVpciBvd24sIGFuZCBubyBgdWk6YCBncmFudCBjb3ZlcnMgYW5vdGhlci4KCmBtb2Q6YCBoYXMgdHdvIGFjdGlvbnMsIGFuZCBuZWl0aGVyIGdyYW50IGluY2x1ZGVzIHRoZSBvdGhlci4gYG1vZDppbnN0YWxsYCBwdXRzIGEgY29udGVudCBwYWNrIGluIHRoZSBwbGF5ZXIncyBsaWJyYXJ5LCBzd2l0Y2hlZCBvZmYsIHNvIHRoZSBwbGF5ZXIgc3RpbGwgbWVldHMgaXQgb24gdGhlIE1vZHMgc2NyZWVuIGFuZCByZWFkcyBpdHMgb3duIGNhcGFiaWxpdHkgbGlzdCBiZWZvcmUgdHVybmluZyBpdCBvbi4gYG1vZDpzZXNzaW9uYCBsb2FkcyBhIHBhY2sgZm9yIHRoZSByZXN0IG9mIHRoZSBzZXNzaW9uIGFuZCB0dXJucyBpdCBvbiBhdCB0aGUgbmV4dCByZWxvYWQsIHNraXBwaW5nIGJvdGggb2YgdGhvc2Ugc3RlcHMsIHNvIHRoZSBpbnN0YWxsIGdyYW50IGNhbm5vdCBjb3ZlciBpdC4gYGdyYW50Q292ZXJzYCBjb21wYXJlcyB0aGUgYWN0aW9uLCB0aGUgc2FtZSBydWxlIGB1aTpgIG5lZWRlZCAoIzI2MSkuIEJvdGggcmVmdXNlIGFuIGFyY2hpdmUgdGhhdCBzaGlwcyBjb2RlIG9yIHdob3NlIG1hbmlmZXN0IGFza3MgZm9yIGEgY2FwYWJpbGl0eSwgc28gbmVpdGhlciBjYW4gYmUgdXNlZCB0byBydW4gY29kZSBhIG1vZCB3cm90ZS4gYG1vZDpyZWFkYCBsb29rcyBhIG1vZCB1cCBhdCBhIHJlcG9zaXRvcnkgYWRkcmVzcyB3aXRob3V0IGluc3RhbGxpbmcgYW55dGhpbmc7IGl0IGlzIGEga2luZCBvZiBpdHMgb3duLCBhbmQgbmVpdGhlciBgbW9kOmAgZ3JhbnQgY292ZXJzIGl0LgoKQSBzZXNzaW9uLW9ubHkgbG9hZCBpcyBsaW1pdGVkIGluIGxpZmV0aW1lLCBub3QgaW4gcHJpdmlsZWdlLiBBIHNlc3Npb24tbG9hZGVkIHBhY2sgY29tcG9zZXMgaW50byB0aGUgZ2FtZSBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBhbiBpbnN0YWxsZWQgb25lLiBPbmx5IHRoZSBhcmNoaXZlIGlzIHNob3J0LWxpdmVkOiB3aGF0IHRoZSByZWNvcmRzIGRpZCB0byBhIGNoYXJhY3RlciwgYW5kIGFueXRoaW5nIGEgbW9kIHdyb3RlIHdoaWxlIHRoZXkgd2VyZSBsb2FkZWQsIG91dGxpdmVzIHRoZSBzZXNzaW9uIGV4YWN0bHkgYXMgaXQgd291bGQgaGF2ZSBpZiB0aGUgbW9kIGhhZCBiZWVuIGluc3RhbGxlZC4gV2hhdCB0aGUgc2Vzc2lvbiB0aWVyIGRvZXMgZ2l2ZSBhIHBsYXllciBpcyB0aGF0IGl0IGNhbm5vdCBhY2N1bXVsYXRlOiB0aGUgbW9kIGlzIGxpc3RlZCBhbmQgbWFya2VkLCBpdCBjYW4gYmUgZHJvcHBlZCwgYW5kIGNsb3NpbmcgdGhlIGdhbWUgZm9yZ2V0cyBpdC4KClRoYXQgbGlmZXRpbWUgaXMgYSBzdHJvbmcgY29udmVudGlvbiwgbm90IGFuIGVuZm9yY2VkIGJvdW5kYXJ5LiBUaGUgYXJjaGl2ZSBsaXZlcyBpbiBgc2Vzc2lvblN0b3JhZ2VgLCB3aGljaCBzdXJ2aXZlcyBhIHJlbG9hZCAodGhhdCBpcyB3aGF0IG1ha2VzIHRoZSB0aWVyIHdvcmssIHNpbmNlIGEgcmVsb2FkIGlzIHdoYXQgYXBwbGllcyBhIG1vZCkuIEEgYnJvd3NlciBhbHNvIHJlc3RvcmVzIGl0IHdoZW4gaXQgcmVzdG9yZXMgYSBjbG9zZWQgb3IgY3Jhc2hlZCB3aW5kb3csIGFuZCBhIHdpbmRvdyB0aGUgcGFnZSBpdHNlbGYgb3BlbnMgaW5oZXJpdHMgYSBjb3B5IG9mIGl0LiBTbyAiZ29uZSB3aGVuIHlvdSBjbG9zZSB0aGUgZ2FtZSIgaXMgd2hhdCBub3JtYWxseSBoYXBwZW5zLCBub3QgYSBndWFyYW50ZWUuIFRoZSBtaXRpZ2F0aW9uIGlzIHZpc2liaWxpdHk6IGEgc2Vzc2lvbiBtb2QgaXMgYWx3YXlzIG9uIHRoZSBsaXN0LCBhbHdheXMgbWFya2VkLCBhbmQgYWx3YXlzIGRyb3BwYWJsZSwgc28gaXQgY2FuIG5ldmVyIHNpdCB0aGVyZSB1bm5vdGljZWQuCgpgc2hhcmVkOmAgaGFzIHR3byBhY3Rpb25zLCBhbmQgbmVpdGhlciBncmFudCBpbmNsdWRlcyB0aGUgb3RoZXIuIEEgbW9kIHRoYXQgcmVhZHMgd2hhdCBvdGhlcnMgc2hhcmUgaXMgbm90IGFibGUgdG8gcHVibGlzaCwgYW5kIHRoZSByZXZlcnNlLiBQdWJsaXNoaW5nIG5lZWRzIGl0cyBvd24gZ3JhbnQgc28gdGhlIHBsYXllciBjYW4gc2VlIGZyb20gdGhlIE1vZHMgc2NyZWVuIHdoaWNoIG1vZHMgaGFuZCBkYXRhIHRvIG90aGVyIG1vZHMsIG5vdCBvbmx5IHdoaWNoIG1vZHMgdGFrZSBpdC4KCmB1aTpwYW5lbC5tb3VudGAgaXMgbm90IGEgZmVuY2UgYXJvdW5kIHRoZSBET00uIFlvdXIgYHBsdWdpbi5qc2AgcnVucyBpbiB0aGUgcGFnZSdzIG93biByZWFsbSwgc28gYGRvY3VtZW50YCBpcyBhdmFpbGFibGUgdG8gaXQgd2l0aCBvciB3aXRob3V0IGFueSBjYXBhYmlsaXR5LCBhbmQgYSBtb2QgdGhhdCBuZXZlciBkZWNsYXJlcyB0aGlzIGNhbiBzdGlsbCBhcHBlbmQgYW4gZWxlbWVudCB0byB0aGUgYm9keS4gV2hhdCB0aGUgZ3JhbnQgY2FycmllcyBpcyBhIGxpbmUgdGhlIHBsYXllciByZWFkcyBmaXJzdCwgYSBjb250YWluZXIgdGhlIGhvc3Qgb3ducyBhbmQgY2FuIHRha2UgYXdheSwgYW5kIG9uZSB0aGluZyBhIG1vZCBjYW5ub3QgZG8gd2l0aG91dCBpdDogc3RhbmQgdGhlIGdhbWUncyBpbnB1dCBkb29yIGRvd24sIHNvIGEgcmVhbCBgPGlucHV0PmAgaW5zaWRlIHlvdXIgcGFuZWwgY2FuIGJlIHR5cGVkIGludG8gaW5zdGVhZCBvZiB0aGUga2V5c3Ryb2tlcyBiZWluZyByZWFkIGFzIGdhbWUgY29tbWFuZHMuCgpgV29ybGRGcmFtZWAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvd29ybGQtdmlldy50c2AgaXMgbGl2ZS4gYHJlbmRlcigpYCBjYWxscyB0aGUgZXh0cmFjdGVkIGB3b3JsZC1yZW5kZXItZGF0YS50c2Agd2l0aCB0aGUgcmVhbCBtYXAta25vd2xlZGdlIHJlYWRzIGFuZCBwYXNzZXMgdGhlIHJlc3VsdGluZyBmcmFtZSB0byBhIGBXb3JsZEZyYW1lU2lua2AuIFRoZSBkZWZhdWx0IGdseXBoIHRlcm1pbmFsIGlzIHRoYXQgc2luaywgYW5kIGl0IGNvbnN1bWVzIHRoZSBmcmFtZSdzIGZhbGxiYWNrIHZpc3VhbCBwcm9qZWN0aW9uLCBpbmNsdWRpbmcgdGhlIHRlcnJhaW4tdW5kZXItZm9yZWdyb3VuZCB0aWxlIGlucHV0cyBmb3IgYSBwYXRoIG92ZXIgb3RoZXJ3aXNlIGJhcmUgc2VlbiB0ZXJyYWluLiBUaGUgZnJhbWUgY2FycmllcyBzZW1hbnRpYyBmZWF0dXJlLCB0cmFwLCBvYmplY3QgYW5kIG1vbnN0ZXIgaWRzLCB2aXNpYmlsaXR5LCBvcmRlcmVkIGxheWVycywgdGhlIGN1cnNvciBhbmQgcGxheWVyIHBsYWNlbWVudCwgc28gYSBzZWxlY3RlZCBmcm9udCBlbmQgY2FuIGJ1aWxkIGFuIGlzb21ldHJpYyBvciAzRCB2aWV3IHdpdGhvdXQgZGVjb2RpbmcgdGVybWluYWwgZ2x5cGhzLiBBcyBhIGNvbnRyb2wsIHRoZSBob3N0IHJ1bnMgdGhlIHNhbWUgcHJvZHVjZXIgYHJlbmRlcigpYCB1c2VzLCBjaGVja3MgaXRzIHVubW9kZGVkIHByZS1mcmFtZSBnbHlwaCB0dXBsZXMsIGFuZCB0ZWVzIHRoYXQgZXhhY3QgZnJhbWUgdG8gYW4gaW5kZXBlbmRlbnQgaG9zdCBzaW5rIGluIHRoZSBzYW1lIGNhbGwuIFRoZSBzZWxlY3RlZCBmcm9udGVuZCByZWNlaXZlcyBhIGZyb3plbiBjb3B5IG9mIHRoYXQgZnJhbWU7IHdoZW4gbm8gZnJvbnRlbmQgaXMgc2VsZWN0ZWQsIG9yIG5vbmUgZXhpc3RzLCB0aGUgZ2x5cGggc2luayBzdGF5cyBhY3RpdmUgdW5jaGFuZ2VkLgoKVGhlIHNhbWUgaXMgdHJ1ZSBvZiBgVWlJbnB1dGAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvaW5wdXQtZG9vci50c2AuIEl0IGlzIHRoZSBzaW5nbGUgZGV2aWNlLW5ldXRyYWwgcm91dGUgYnkgd2hpY2gga2V5Ym9hcmQgYW5kIGtleW1hcCBpbnB1dCByZWFjaGVzIHNjcmVlbnM7IGl0cyBkaXJlY3Rpb24gY2FycmllcyBhbiBhbmFsb2cgdmVjdG9yIGFuZCBhbmdsZS4gQSBwbHVnaW4gdGhhdCBkZWNsYXJlcyBhbmQgaXMgZ3JhbnRlZCBga2V5bWFwOndyaXRlYCByZWNlaXZlcyBgY3R4LmtleW1hcHNgIGR1cmluZyBhIGxpdmUgZ2FtZS4gYGJpbmQoKWAgY2xhaW1zIG9ubHkgYSBmcmVlIHRyaWdnZXIsIGBlbnRyaWVzKClgIGxpc3RzIG9ubHkgYmluZGluZ3MgdGhlIGNhbGxpbmcgbW9kIG93bnMsIGFuZCBgcmViaW5kKClgIGFuZCBgcmVtb3ZlKClgIGNhbiBjaGFuZ2Ugb25seSB0aG9zZSBvd25lZCBiaW5kaW5ncy4gVGhyb3VnaCBgY3R4LmtleW1hcHNgIGEgcGx1Z2luIGNhbm5vdCByZWFkLCBvdmVyd3JpdGUsIG9yIHJlbW92ZSB0aGUgcGxheWVyJ3MgYmluZGluZ3Mgb3IgYW5vdGhlciBtb2QncyBiaW5kaW5ncy4gRWRpdGluZyB0aG9zZSBpcyBhIHNlcGFyYXRlIGdyYW50LCBga2V5bWFwOmVkaXRgLCB3aGljaCBoYW5kcyB0aGUgcGx1Z2luIGBjdHgua2V5YmluZGluZ3NgLCB0aGUgc2FtZSBlZGl0b3IgYXMgdGhlIGdhbWUncyBvd24ga2V5bWFwIHNjcmVlbi4gQSBwbGF5ZXIgY2hhbmdlIGNsZWFycyB0aGUgbW9kIGNsYWltLCBhbmQgYmluZGluZ3Mgc3RpbGwgb3duZWQgYnkgYSBkZXBhcnRpbmcgbW9kIGFyZSByZW1vdmVkIGR1cmluZyBob3N0IHRlYXJkb3duLiBTdG9yZWQgcGxheWVyIGtleW1hcHMgYXJlIGV2YWx1YXRlZCBmaXJzdCB3aGVuIHRoZSByb290IG93bnMgaW5wdXQ7IHNjb3JlIHBhZ2VzLCBtb2RhbHMsIGFuZCBydW4gaW50ZXJydXB0aW9uIGtlZXAgdGhlaXIgb3duIGxpdGVyYWwta2V5IGdhdGVzLCBzbyBhIG1vZCBtdXN0IG5vdCB1c2UgaW5qZWN0ZWQgaW5wdXQgdG8gb3V0cmFuayB0aGUgcGxheWVyJ3MgY2hvc2VuIG1hcHBpbmcgb3IgYW4gYWN0aXZlIHNjcmVlbi4KCmByZWdpc3RlcmAgcmVhY2hlcyBlaWdodGVlbiByZWdpc3RyaWVzLCBlYWNoIGdhdGVkIGJ5IGEgY2FwYWJpbGl0eSB5b3VyIG1hbmlmZXN0IG11c3QgZGVjbGFyZSBhbmQgdGhlIHBsYXllciBtdXN0IGFncmVlIHRvLiBgUkVHSVNUUllfQ0FQQUJJTElUSUVTYCBpbiBgcGFja2FnZXMvY29yZS9zcmMvbW9kL3JlZ2lzdHJ5LWhvc3QudHNgIG1hcHMgZWFjaCBmYWNhZGUgdG8gaXRzIGNhcGFiaWxpdHkgc3RyaW5nLCBhbmQgdGhlIHRhYmxlIGJlbG93IHNheXMgd2hhdCBlYWNoIG9uZSBvcGVuczoKCnwgQ2FwYWJpbGl0eSB8IFdoYXQgaXQgb3BlbnMgfAp8LS0tfC0tLXwKfCBgcmVnaXN0cnk6ZWZmZWN0YCB8IGFkZCBhIG5ldyBlZmZlY3QgY29kZSwgb3IgcmVwbGFjZSBhIGNvcmUgb25lOiBjb21iYXQsIGhlYWxpbmcsIHRlbGVwb3J0LCBkZXRlY3Rpb24gfAp8IGByZWdpc3RyeTpyb29tYCB8IHJvb20gYW5kIGxldmVsIGJ1aWxkZXJzLCByZWZlcmVuY2VkIGZyb20gYSBkdW5nZW9uIHByb2ZpbGUgfAp8IGByZWdpc3RyeTpwcm9maWxlYCB8IHdob2xlLWNhdmUgYnVpbGRlcnMgYW5kIGR1bmdlb24gcHJvZmlsZXM6IGEgbmV3ICpraW5kKiBvZiBsZXZlbCwgYW5kIHdoaWNoIGtpbmQgeW91IGdldCBhdCBhIGRlcHRoIHwKfCBgcmVnaXN0cnk6Ymxvd2AgfCB3aGF0IGEgbW9uc3RlcidzIGF0dGFja3MgZG8gdG8geW91LCBhbmQgbmV3IGtpbmRzIG9mIGF0dGFjazogYGRlZmluZSgpYCB0YWtlcyBvbmUgZGVzY3JpcHRpb24gYW5kIHRoZSBlbmdpbmUgZGVyaXZlcyBib3RoIG9mIHRoZSBoYW5kbGVycyBpdCBuZWVkcyB8CnwgYHJlZ2lzdHJ5OnN0b3JlYCB8IHdoYXQgYSBzaG9wIHdpbGwgYnV5LCBhbmQgaG93IG1hbnkgb2YgYSB0aGluZyBpdCBzdG9ja3MgfAp8IGByZWdpc3RyeTpjb21tYW5kYCB8IHdoYXQgYSBwbGF5ZXIgY29tbWFuZCAqZG9lcyosIGFuZCB3aGF0IGl0IGlzIENBTExFRDogYGNvbW1hbmRzLnJlZ2lzdGVyKGNvZGUsIGFjdGlvbilgIGZvciB0aGUgYmVoYXZpb3VyLCBgY29tbWFuZHMuc2V0VmVyYihjb2RlLCB2ZXJiKWAgZm9yIHRoZSB2ZXJiIHRoZSBgIWAtaW5zY3JpcHRpb24gY29uZmlybSByZWFkcy4gU2tpcCB0aGUgdmVyYiBhbmQgYSBwbGF5ZXIgd2hvIGhhcyBpbnNjcmliZWQgYCF6YCBvbiBhIFBvdGlvbiBvZiBEZWF0aCBpcyBhc2tlZCAiUmVhbGx5ICoqZG8gdGhhdCB3aXRoKiogeW91ciBQb3Rpb24gb2YgRGVhdGg/IiBpbnN0ZWFkIG9mIHlvdXIgY29tbWFuZCdzIG93biBuYW1lOyBgY29tbWFuZHMudmVyYkZvcihjb2RlKWAgcmV0dXJucyB3aGF0IGlzIGluc3RhbGxlZCwgc28gYSBsYXRlciBtb2QgY2FuIHdyYXAgYW4gZWFybGllciBvbmUncyB8CnwgYHJlZ2lzdHJ5Om1vbnN0ZXJgIHwgYSBob29rIGF0IHRoZSB0b3Agb2YgZXZlcnkgbW9uc3RlcidzIHR1cm47IHJldHVybiB0cnVlIHRvIHRha2UgdGhlIHR1cm4gb3ZlciB8CnwgYHJlZ2lzdHJ5OnByb2plY3Rpb25gIHwgd2hhdCBhIHByb2plY3Rpb24gZG9lcyB0byB0ZXJyYWluLCBmbG9vciBpdGVtcyBhbmQgdGhlIHBsYXllcjogYHByb2plY3Rpb25zLmZlYXRgIC8gYC5vYmpgIC8gYC5wbGF5ZXJgLCBvbmUgcHJvamVjdGlvbiBgY29kZWAgYXQgYSB0aW1lLiBUaGlzIGlzIHRoZSBiZWhhdmlvdXIgaGFsZiBvZiBhZGRpbmcgeW91ciBvd24gZWxlbWVudDogdGhlIGBwcm9qZWN0aW9uLmpzb25gIHJlY29yZCBtYWtlcyBpdCBleGlzdCwgdGhlc2UgdGhyZWUgbWFrZSBpdCAqZG8qIHNvbWV0aGluZyB8CnwgYHJlZ2lzdHJ5OnVpLWVudHJ5YCB8IHdoYXQgYSBgY29tYmluZTpgIG9yIGFuIGBlbnRyeS1yZW5kZXJlcjpgIGBjb2RlOmAgKm1lYW5zKiBvbiB0aGUgc2Vjb25kIGNoYXJhY3RlciBzY3JlZW4gYW5kIHRoZSBlcXVpcG1lbnQgY29tcGFyaXNvbjogYHVpRW50cnkuY29tYmluZXJzLnNldCgibXktbW9kOndvcnN0LW9mIiwgLi4uKWAgKGhvdyBhIHJvdydzIHBlci1zbG90IHZhbHVlcyByZWR1Y2UgdG8gdGhlIG9uZSB0aGF0IGNvbG91cnMgaXRzIGxhYmVsKSBhbmQgYHVpRW50cnkuYmFja2VuZHMuc2V0KCJteS1tb2Q6YmFycyIsIC4uLilgIChob3cgYSB2YWx1ZSBiZWNvbWVzIGEgY2VsbCBzeW1ib2wgYW5kIGNvbG91cikuIEFkZGluZyBhIGB1aV9lbnRyeS5qc29uYCBST1cgbmVlZHMgbm8gY2FwYWJpbGl0eTsgYSByb3cgbmFtaW5nIGEgY29tYmluZXIgb3IgcmVuZGVyZXIgbm90aGluZyBhbnN3ZXJzIGZvciBkcmF3cyBhcyBhbiBlbXB0eSByb3cgcmF0aGVyIHRoYW4gZmFpbGluZywgc28gdGhpcyBpcyB3aGF0IG1ha2VzIHlvdXIgcm93IG1lYW4gc29tZXRoaW5nIHwKfCBgcmVnaXN0cnk6Z2x5cGhgIHwgd2hhdCBvbmUgY2hhcmFjdGVyIG9mIGEgcm9vbS10ZW1wbGF0ZSBvciB2YXVsdCBsYXlvdXQgbWVhbnMgd2hlbiB0aGUgbGV2ZWwgaXMgZHJhd246IGBnbHlwaHMuc2V0KCJ2YXVsdCIsICJRIiwgLi4uKWAuIFRoZSBiZWhhdmlvdXIgaGFsZiBvZiBzaGlwcGluZyBhIHZhdWx0IHdpdGggYSBzeW1ib2wgY29yZSBoYXMgbmV2ZXIgc2VlbiB8CnwgYHJlZ2lzdHJ5OmVmZmVjdC1pbmZvYCB8IHdoYXQgdGhlIGdhbWUgKnNheXMqIGFib3V0IGFuIGVmZmVjdDogYGVmZmVjdEluZm8udGV4dGAgKHRoZSBtZW51IHJvdyBhbmQgdGhlIHJlY2FsbCBzZW50ZW5jZSksIGAuc3VtbWFyeWAgKHRoZSBvYmplY3QgcHJvcGVydGllcyBhbiBhY3RpdmF0aW9uIGdyYW50cyksIGAuc3VidHlwZWAgKHRoZSBuYW1lZCBzdWJ0eXBlcyBpdCBhY2NlcHRzKSBhbmQgYC5yZXF1ZXN0YCAod2hpY2ggaXRlbSBpdCBwcm9tcHRzIGZvcikuIFRoaXMgaXMgdGhlIGRlc2NyaXB0aW9uIGhhbGYgb2YgYHJlZ2lzdHJ5OmVmZmVjdGA6IHdpdGhvdXQgaXQgeW91ciBuZXcgZWZmZWN0IHdvcmtzIGFuZCB0aGUgZ2FtZSBoYXMgbm90aGluZyB0byBzYXkgYWJvdXQgaXQgfAp8IGByZWdpc3RyeTp0dmFsYCB8IHdoYXQgYW4gaXRlbSBDTEFTUyAqaXMqOiBgdHZhbC5jbGFzc2VzYCAoa2V5ZWQgb24gdGhlIHByZWRpY2F0ZSdzIG93biBuYW1lLCBzbyBgaGFuZGxlckZvcigidHZhbElzV2VhcG9uIilgIHJldHVybnMgY29yZSdzIGFybSBhbmQgYSBtb2QgT1JzIGl0cyBvd24gdHZhbCBpbnRvIGl0KSwgYC5nb29kYCAod2hldGhlciBhIHRlbXBsYXRlIGNvdW50cyBhcyBnb29kIGZvciBhbGxvY2F0aW9uKSwgYC52YWx1ZUJhc2VgICh3aGF0IGFuIHVuaWRlbnRpZmllZCBpdGVtIG9mIHRoZSBjbGFzcyBpcyB3b3J0aCksIGAudmFsdWVBZGp1c3RgIChhIHBvc3QtY29tcHV0YXRpb24gbnVkZ2UgdG8gYG9iamVjdF92YWx1ZV9yZWFsYCdzIG93biBmYWl0aGZ1bCByZXN1bHQgLSBgeyByZWcsIG9iaiwgcXR5LCBiYXNlVmFsdWUsIHRvdGFsQWMgfWAgaW4sIGEgcG9zc2libHktZGlmZmVyZW50IG51bWJlciBvdXQ7IHVucmVnaXN0ZXJlZCBpcyBhIG5vLW9wKSBhbmQgYC5iYXNlbmFtZWAgKHdoYXQgdGhlIGNsYXNzIGlzIENBTExFRCAtIHdpdGhvdXQgaXQgZXZlcnkgbWVzc2FnZSwgbWVudSByb3cgYW5kIHNob3AgbGluZSBuYW1pbmcgdGhlIGNsYXNzIHJlYWRzIHRoZSBsaXRlcmFsICIobm90aGluZykiKS4gU2hpcHBpbmcgYSBuZXcgKml0ZW0qIG5lZWRzIG5vIGNhcGFiaWxpdHk7IHRoaXMgaXMgdGhlIGNsYXNzIHwKfCBgcmVnaXN0cnk6cmFuZGFydGAgfCBob3cgUkFORE9NIGFydGlmYWN0cyBhcmUgYnVpbHQ6IGByYW5kYXJ0LmFiaWxpdGllc2AgKHdoYXQgYSBwb3dlciBkb2VzKSwgYC5wcmVwYCAod2hhdCBhbiBpdGVtIGNsYXNzIHN0YXJ0cyB3aXRoKSwgYC5jZW5zdXNgICh3aGljaCBmcmVxdWVuY3kgYnVja2V0IGl0IGZlZWRzKSBhbmQgYC5yZWR1bmRhbmN5YCAod2hldGhlciBhbiBhY3RpdmF0aW9uIGR1cGxpY2F0ZXMgc29tZXRoaW5nIHRoZSBhcnRpZmFjdCBhbHJlYWR5IGhhcykuIFNoaXBwaW5nIGEgKmZpeGVkKiBhcnRpZmFjdCBuZWVkcyBubyBjYXBhYmlsaXR5OyB0aGlzIGlzIHRoZSBnZW5lcmF0b3IgfAp8IGByZWdpc3RyeTpydW5lYCB8IHdoYXQgYSBydW5lIGlzOiB0aGUgdW5pdCBvZiBvYmplY3Qga25vd2xlZGdlLiBgcnVuZS5kZXNjYCAodGhlIHJlY2FsbCBsaW5lKSwgYC5uYW1lYCAodGhlIGRpc3BsYXkgZGVjb3JhdGlvbiksIGAua25vd3NgIC8gYC5sZWFybmAgKHRoZSBrbm93bGVkZ2UgcGFpciwgaGFuZGVkIHRoZSBwbGF5ZXIgc28geW91ciBtb2Qga2VlcHMgdGhlIHN0b3JlLCBzaW5jZSBjb3JlIGhhcyBubyBzbG90IGZvciBpdCksIGAub2JqZWN0SGFzYCAod2hldGhlciBhbiBpdGVtIGNhcnJpZXMgaXQpIGFuZCBgLm1vZE1lc3NhZ2VgICh0aGUgIllvdSBmZWVsIHN0cm9uZ2VyISIgbGluZSwga2V5ZWQgb24gdGhlIG1vZGlmaWVyKS4gUGx1cyBgLmNvbnRyaWJ1dGVgLCB3aGljaCBwdXRzIHlvdXIgcnVuZSBpbnRvIHRoZSBsaXN0IGV2ZXJ5IGNvbnN1bWVyIGVudW1lcmF0ZXM7IHdpdGhvdXQgaXQsIHRoZSBzaXggaGFuZGxlcnMgYWJvdmUgYXJlIG5ldmVyIGNhbGxlZCB8CnwgYHJlZ2lzdHJ5OnZvY2FiYCB8IGRlY2xhcmUgZ2VudWluZWx5IG5ldyB2b2NhYnVsYXJ5IChmbGFncywgc3RhdHMsIG1vZC1jb2luZWQga2luZHMpIGFuZCBzdG9yZSBwZXItZW50aXR5IHZhbHVlcyB8CnwgYHJlZ2lzdHJ5Om1lc3NhZ2VgIHwgbWVzc2FnZSBUWVBFUzogYG1lc3NhZ2VzLmRlZmluZShuYW1lLCBzb3VuZD8pYCBjb2lucyBvbmUgYW5kIHJldHVybnMgaXRzIG51bWJlciwgYC5sb29rdXAobmFtZSlgIGZpbmRzIGFuIGV4aXN0aW5nIG9uZSwgYC50eXBlcygpYCBsaXN0cyB3aGF0IGhhcyBiZWVuIGFkZGVkLCBgLmFkZFNvdW5kcyguLi4pYCBhdHRhY2hlcyBzb3VuZHMuIEFkZGluZyBhIGBtZXNzYWdlX3R5cGUuanNvbmAgUkVDT1JEIG5lZWRzIG5vIGNhcGFiaWxpdHksIHRoZSBzYW1lIHdheSBhZGRpbmcgYW4gaXRlbSBkb2VzOyB0aGlzIGlzIHRoZSBjb2RlIGhhbGYsIGZvciBhIHR5cGUgeW91ciBvd24gcGx1Z2luIHJhaXNlcyB8CnwgYHJlZ2lzdHJ5Om1lbnVgIHwgcmV3cml0ZSBvbmUgc3RhYmxlIG1lbnUgaWQncyBzZW1hbnRpYyByb3dzLiBgbWVudXMuaGFuZGxlckZvcihpZClgIHJldHVybnMgdGhlIGVhcmxpZXIgdHJhbnNmb3JtZXIsIHNvIGEgbGF0ZXIgbW9kIHdyYXBzIGl0IGJlZm9yZSBjYWxsaW5nIGBtZW51cy5yZWdpc3RlcihpZCwgLi4uKWA7IGEgdGhyb3cgb3IgYSBub24tcm93LWFycmF5IHJlc3VsdCBpcyByZXBvcnRlZCBhZ2FpbnN0IHRoYXQgbW9kIGFuZCBsZWF2ZXMgdGhlIG9yaWdpbmFsIG1lbnUgdXNhYmxlLiBgbWVudXMuYWRkQWN0aW9uKCJjb3JlOmdhbWUtbWVudSIsIGFjdGlvbiwgbGFiZWwsIGhhbmRsZXIpYCBhZGRzIGEgbmFtZXNwYWNlZCwgcnVubmFibGUgcm93IHRvIHRoZSBFc2NhcGUgR2FtZSBtZW51OyBpdCBpcyB0aGUgZG9vciBmb3IgYSBtb2Qtb3duZWQgY2FsbGJhY2sgcmF0aGVyIHRoYW4gYSByZXdyaXRlIG9mIGEgY29yZSBhY3Rpb24gfAp8IGByZWdpc3RyeTp0aWxlc2AgfCBzdXBwbHkgdGlsZXMgZm9yIGNvbnRlbnQgdGhlIGxvYWRlZCB0aWxlIHBhY2sgZG9lcyBub3QgZHJhdywgd2hpY2ggaW4gcHJhY3RpY2UgbWVhbnMgY29udGVudCBhIG1vZCBhZGRlZC4gYHRpbGVzLnJlZ2lzdGVyKGZpbGxlcilgIGluc3RhbGxzIG9uZSBmaWxsZXIgcGVyIG1vZDsgZXZlcnkgcmVnaXN0ZXJlZCBmaWxsZXIgcnVucywgaW4gbG9hZCBvcmRlciwgYWZ0ZXIgdGhlIHBhY2sncyBvd24gcHJlZnMgYW5kIGV2ZXJ5IG1vZCdzLiBBIGZpbGxlciBjYW4gb25seSB3cml0ZSB3aGVyZSBub3RoaW5nIGlzIGFzc2lnbmVkLCBzbyBpdCBjYW5ub3QgcmVwYWludCB0aGUgdGlsZSBzZXQgYW5kIHR3byBtb2RzIGNhbm5vdCBmaWdodCBvdmVyIGFuIGluZGV4LiBUaGUgc2FtZSBzZWFtIGFsc28gb2ZmZXJzIHJlcGFpbnRpbmcgaW4gcGxhY2UgKGBmaWxsLnRyYW5zZm9ybWAsIGEgbWlycm9yIGFuZC9vciBhIHBhbGV0dGUgcmVtYXAgb3ZlciBhbiBleGlzdGluZyB0aWxlKSBhbmQgdGhlIHBsYXllcidzIG93biBjZWxsIChgdGlsZXMucGxheWVyYCwgYXNrZWQgb25jZSBwZXIgZnJhbWUgd2hhdCB0aGUgY2hhcmFjdGVyJ3MgY2VsbCBzaG91bGQgc2hvdykuIFNlZSBbRmlsbGluZyB0aWxlc10oI2ZpbGxpbmctdGlsZXMpIGFuZCBbUmVwYWludGluZyBhIHRpbGUsIGFuZCBkcmF3aW5nIHRoZSBwbGF5ZXIncyBvd24gY2VsbF0oI3JlcGFpbnRpbmctYS10aWxlLWFuZC1kcmF3aW5nLXRoZS1wbGF5ZXJzLW93bi1jZWxsKSB8CgpUb3VjaGluZyBhIGZhY2FkZSB5b3UgZGlkIG5vdCBkZWNsYXJlIHRocm93cywgZXZlbiBpZiB0aGUgcGxheWVyIGNvbnNlbnRlZCB0byBzb21ldGhpbmcgZWxzZS4gQ29uc2VudCBtZWFucyB0aGUgcGxheWVyIGFsbG93ZWQgdGhlc2UgZG9tYWlucywgYW5kIHRoZSBtYW5pZmVzdCBtZWFucyB5b3UgYXNrZWQgZm9yIHRoZW07IHlvdSBuZWVkIGJvdGguCgpFdmVyeSBjYXBhYmlsaXR5IGlzIGRlZmluZWQgb25jZSwgaW4gYHBhY2thZ2VzL21vZC1zZGsvc3JjL2NhcGFiaWxpdHktdm9jYWJ1bGFyeS50c2A6IGl0cyBhcmd1bWVudCwgdGhlIHNlbnRlbmNlIHRoZSBwbGF5ZXIgaXMgYXNrZWQgdG8gYWdyZWUgdG8sIHdoYXQgc3RvcHMgd29ya2luZyB3aXRob3V0IGl0LCB3aGV0aGVyIHRoZSBtb2QgY2FuIHN0aWxsIHN0YXJ0IHdpdGhvdXQgaXQsIHdoZXRoZXIgdGhlIGNvbnNlbnQgc2NyZWVuIGhpZ2hsaWdodHMgaXQsIGFuZCB3aGljaCBraW5kcyBvZiBtb2QgbWF5IGhvbGQgaXQuIGBwYXJzZUNhcGFiaWxpdHlgIGFuZCBgZ3JhbnRDb3ZlcnNgIGluIGBjYXBhYmlsaXRpZXMudHNgIHJlYWQgdGhhdCBsaXN0LCBhbmQgc28gZG9lcyB0aGUgY29uc2VudCBzY3JlZW4gKGBwYWNrYWdlcy93ZWIvc3JjL2NhcGFiaWxpdHktZGVzY3JpYmUudHNgKS4gYHBhcnNlQ2FwYWJpbGl0eWAgdGhyb3dzIG9uIGEgc3RyaW5nIHRoZSBsaXN0IGRvZXMgbm90IGtub3csIGFuZCB0aGUgY29uc2VudCBzY3JlZW4gc2hvd3Mgc3VjaCBhIHN0cmluZyBhcyBhbiB1bnJlY29nbml6ZWQsIGhpZ2gtcmlzayBncmFudC4KClBsYXllcnMgYW5zd2VyIGZvciB0aGUgd2hvbGUgbGlzdCBpbiBvbmUgZ28uIFlvdXIgbW9kIHN0YXlzIG9mZiB1bnRpbCB0aGV5IGhhdmUgc2FpZCB5ZXMgdG8gZXZlcnkgY2FwYWJpbGl0eSBpbiBpdHMgbWFuaWZlc3QsIHdoaWNoIG1lYW5zIHRoZSBub3RlcyBvbiB3aGF0IHN0b3BzIHdvcmtpbmcgd2l0aG91dCBhIGdyYW50IHRlbGwgeW91IGhvdyB5b3VyIGNvZGUgc2hvdWxkIGJlaGF2ZSB3aGVuIGEgY2hlY2sgZmFpbHMuCgpUaHJlZSBjYXBhYmlsaXRpZXMgdGFrZSBhbiBhcmd1bWVudC4gYGV2ZW50OjxuYW1lPmAgYW5kIGBzdGF0ZTo8ZG9tYWluPi5yZWFkYCB0YWtlIGEgbG93ZXJjYXNlIGtlYmFiLWNhc2Ugd29yZCwgc3VjaCBhcyBgdHVybi1zdGFydGAgb3IgYG1vbnN0ZXJzYC4gYG5ldHdvcms6PGhvc3Q+YCB0YWtlcyBhIGhvc3QgbmFtZSBvciBhbiBhZGRyZXNzIGluIGJyYWNrZXRzLCB3aXRoIGFuIG9wdGlvbmFsIHBvcnQgZnJvbSAxIHRvIDY1NTM1OyB3aXRob3V0IGEgcG9ydCBpdCBjb3ZlcnMgdGhlIHNjaGVtZSdzIGRlZmF1bHQgcG9ydCBvbmx5LiBgbmV0d29yazpsb2NhbGAgY292ZXJzIHRoaXMgY29tcHV0ZXIgYW5kIHRoZSBwcml2YXRlIGFkZHJlc3MgcmFuZ2VzIG9uIGFueSBwb3J0LgoKRm91ciBncmFudHMgYXJlIHdpbGRjYXJkcywgYW5kIGVhY2ggcmFuZ2VzIG92ZXIgaXRzIG9uZSBhcmd1bWVudCBhbmQgbm90aGluZyBlbHNlOiBgc3RhdGU6Ki5yZWFkYCwgYHJlZ2lzdHJ5OipgLCBgbmV0d29yazoqYCBhbmQgYHVpOioucmVwbGFjZWAuIFdoZXJlIGEga2luZCBoYXMgbW9yZSB0aGFuIG9uZSBhY3Rpb24sIHRoZSBhY3Rpb24gaXMgY29tcGFyZWQgdG9vLCBzbyBgZGVidWc6c3Bhd25gIGRvZXMgbm90IGNvdmVyIGBkZWJ1Zzp3aXphcmRgIGFuZCBgcHJlZnM6cmVhZGAgZG9lcyBub3QgY292ZXIgYHByZWZzOndyaXRlYC4KCkZpdmUgY2FwYWJpbGl0aWVzIHJ1biB0aGUgZ2FtZSdzIG93biBtYW5hZ2VtZW50OiBgbW9kOmluc3RhbGxgLCBgbW9kOnNlc3Npb25gLCBgc2Vzc2lvbjpjb250cm9sYCwgYHByb2ZpbGVzOm1hbmFnZWAgYW5kIGBzY3JlZW5zOm1hbmFnZWAuIE9ubHkgZmlyc3QtcGFydHkgbW9kcyBhcmUgbWVhbnQgdG8gaG9sZCB0aGVtLCBhbmQgdGhleSBhcmUgbGVmdCBvdXQgb2YgdGhlIHB1YmxpYyBsaXN0LiBgc3RhdGU6bWFwLWFjdHVhbC5yZWFkYCwgdGhlIHJlYWwgbWFwIHJhdGhlciB0aGFuIHdoYXQgdGhlIGNoYXJhY3RlciBoYXMgZm91bmQsIGlzIGZpcnN0LXBhcnR5IG9ubHkgYXMgd2VsbC4gQSBncmFudCBoYXMgdG8gbmFtZSBpdDsgYHN0YXRlOioucmVhZGAgZ2l2ZXMgZXZlcnkgb3RoZXIgc3RhdGUgZG9tYWluIGFuZCBub3QgdGhpcyBvbmUuIFRoZSBnYW1lIGRvZXMgbm90IHlldCBjaGVjayBhIG1vZCdzIGtpbmQgd2hlbiBpdCBsb2Fkcywgc28gYSBtb2QgdGhhdCBkZWNsYXJlcyBvbmUgb2YgdGhlc2UgaXMgbm90IHJlZnVzZWQgZm9yIGl0LgoKSW4gdGhlIHRhYmxlLCAiYW55IGNvZGUgbW9kIiBtZWFucyBmaXJzdC1wYXJ0eSwgcmV2aWV3ZWQsIHNpZGVsb2FkZWQgYW5kIFdvcmtlciBtb2RzLCBhbmQgImluLXByb2Nlc3MiIG1lYW5zIGV2ZXJ5IGtpbmQgZXhjZXB0IFdvcmtlciBtb2RzLiBBIG1vZCB3aXRoIG5vIGNvZGUgaG9sZHMgbm8gY2FwYWJpbGl0aWVzLgoKfCBDYXBhYmlsaXR5IHwgV2hhdCB0aGUgcGxheWVyIHJlYWRzIHwgV2l0aG91dCBpdCB8IEhpZ2hsaWdodGVkIHwgSGVsZCBieSB8CnwtLS18LS0tfC0tLXwtLS18LS0tfAp8IGBjb21tYW5kOmFkZGAgfCBBZGQgbmV3IHBsYXllciBjb21tYW5kcyB8IFRoZSBjb21tYW5kcyB0aGlzIG1vZCBhZGRzIGFyZSBub3QgYXZhaWxhYmxlLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYGNvbW1hbmQ6c3VibWl0YCB8IEFzayB0aGUgZ2FtZSB0byBydW4gY29tbWFuZHMgYnkgdGhlaXIgbmFtZXMsIHRoZSB3YXkgeW91ciBvd24ga2V5cyBkbyB8IFRoZSBtb2QgY2Fubm90IGFzayB0aGUgZ2FtZSB0byBydW4gY29tbWFuZHMgZm9yIHlvdS4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAp8IGBpbnB1dDppbnRlbnRgIHwgQWN0IG9uIHlvdXIgY2hhcmFjdGVyJ3MgYmVoYWxmIHdpdGggdGhlIHNhbWUgY29tbWFuZHMgeW91ciBvd24ga2V5cyB1c2UgfCBUaGUgbW9kIGNhbm5vdCBtb3ZlIG9yIGFjdCBmb3IgeW91ciBjaGFyYWN0ZXIuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYGlucHV0OnByb21wdC5yZXBseWAgfCBBbnN3ZXIgdGhlIGdhbWUncyBjdXJyZW50IHF1ZXN0aW9uIHRocm91Z2ggaXRzIGlucHV0IGhhbmRsZXIgfCBUaGUgbW9kIGNhbm5vdCBhbnN3ZXIgdGhlIGdhbWUncyBxdWVzdGlvbnMgZm9yIHlvdSwgc28geW91IGFuc3dlciB0aGVtIHlvdXJzZWxmLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGBzYXZlczptYW5hZ2VgIHwgTGlzdCwgbG9hZCwgcmVuYW1lIGFuZCBkZWxldGUgeW91ciBjaGFyYWN0ZXJzOyBkZWxldGlvbiBhc2tzIHlvdSBmaXJzdCB8IFRoZSBtb2QncyBvd24gY2hhcmFjdGVyIGxpc3QgZG9lcyBub3QgYXBwZWFyOyB0aGUgZ2FtZSdzIGxpc3Qgc3RpbGwgd29ya3MuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHVpOnRpdGxlYCB8IEFkZCB0aXRsZSBzY3JlZW4gYWN0aW9ucyB8IFRoZSBtb2QncyBlbnRyaWVzIG9uIHRoZSB0aXRsZSBzY3JlZW4gZG8gbm90IGFwcGVhci4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGB1aTptZW51LnJvd2AgfCBBZGQgYSByb3cgdG8gdGhlIGdhbWUgbWVudSB8IFRoZSBtb2QncyByb3cgaW4gdGhlIGdhbWUgbWVudSBkb2VzIG5vdCBhcHBlYXIuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgc2hhcmVkOnJlYWRgIHwgUmVhZCBkYXRhIG90aGVyIG1vZHMgc2hhcmUgfCBUaGUgbW9kIGNhbm5vdCBzZWUgd2hhdCBvdGhlciBtb2RzIHNoYXJlIHdpdGggaXQuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgc2hhcmVkOnB1Ymxpc2hgIHwgU2hhcmUgZGF0YSB3aXRoIG90aGVyIG1vZHMgfCBPdGhlciBtb2RzIGNhbm5vdCBzZWUgd2hhdCB0aGlzIG1vZCBzaGFyZXMuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgZGlzcGxheTpyZXBsYWNlYCB8IERyYXcgdGhlIGR1bmdlb24gaXRzZWxmIC0gZXZlcnl0aGluZyB5b3Ugc2VlIG9mIHRoZSBtYXAgY29tZXMgZnJvbSB0aGlzIG1vZCBpbnN0ZWFkIG9mIHRoZSBnYW1lIHwgVGhlIGdhbWUgZHJhd3MgdGhlIG1hcCBpdHNlbGYgYW5kIHRoaXMgbW9kJ3MgdmlldyBpcyBub3QgdXNlZC4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgZGlzcGxheTpmaWx0ZXJgIHwgQXBwbHkgYSB2aXN1YWwgcG9zdC1wcm9jZXNzaW5nIGZpbHRlciB0byB0aGUgZ2FtZSdzIHRlcm1pbmFsIGNhbnZhcyBhbmQgcGFuZWxzIHwgVGhlIGdhbWUncyBzY3JlZW4gaXMgc2hvd24gd2l0aG91dCB0aGlzIG1vZCdzIGZpbHRlci4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGB1aToqLnJlcGxhY2VgIHwgRHJhdyB0aGUgd2hvbGUgaW50ZXJmYWNlIGFyb3VuZCB0aGUgbWFwIC0geW91ciBtZXNzYWdlcywgeW91ciB2aXRhbHMsIHRoZSBzdGF0dXMgbGluZSwgZXZlcnkgbWVudSBhbmQgZXZlcnkgZnVsbCBzY3JlZW4gYWxsIGNvbWUgZnJvbSB0aGlzIG1vZCB8IFRoZSBnYW1lIGRyYXdzIGl0cyBvd24gaW50ZXJmYWNlIGFyb3VuZCB0aGUgbWFwLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTptZXNzYWdlcy5yZXBsYWNlYCB8IERyYXcgdGhlIG1lc3NhZ2UgbGluZSBhdCB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gaW5zdGVhZCBvZiB0aGUgZ2FtZSB8IFRoZSBnYW1lIGRyYXdzIGl0cyBvd24gbWVzc2FnZSBsaW5lLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpzaWRlYmFyLnJlcGxhY2VgIHwgRHJhdyB0aGUgdml0YWxzIHBhbmVsIC0geW91ciBoaXQgcG9pbnRzLCBmb29kLCBhcm1vdXIgYW5kIGRlcHRoIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBkcmF3cyBpdHMgb3duIHZpdGFscyBwYW5lbC4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6c3RhdHVzLnJlcGxhY2VgIHwgRHJhdyB0aGUgc3RhdHVzIGxpbmUgYWxvbmcgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBkcmF3cyBpdHMgb3duIHN0YXR1cyBsaW5lLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTptZW51LnJlcGxhY2VgIHwgRHJhdyB0aGUgbWVudXMgYW5kIGNob2ljZXMgdGhlIGdhbWUgb2ZmZXJzIHlvdSBpbnN0ZWFkIG9mIHRoZSBnYW1lIHwgVGhlIGdhbWUgc2hvd3MgaXRzIG93biBtZW51cy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6c2NyZWVuLnJlcGxhY2VgIHwgRHJhdyB0aGUgZnVsbCBzY3JlZW5zIC0geW91ciBpbnZlbnRvcnksIGNoYXJhY3RlciBzaGVldCBhbmQgdGhlIHJlc3QgaW5zdGVhZCBvZiB0aGUgZ2FtZSB8IFRoZSBnYW1lIHNob3dzIGl0cyBvd24gZnVsbCBzY3JlZW5zLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpiaXJ0aC5yZXBsYWNlYCB8IERyYXcgdGhlIGNoYXJhY3RlciBjcmVhdGlvbiBzY3JlZW5zIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBzaG93cyBpdHMgb3duIGNoYXJhY3RlciBjcmVhdGlvbiBzY3JlZW5zLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpyZWdpb24uY3JlYXRlYCB8IEFkZCBmdXJuaXR1cmUgb2YgaXRzIG93biB0byB5b3VyIHNjcmVlbiAtIHBhbmVscyB0aGlzIG1vZCBkcmF3cyBpdHNlbGYsIG92ZXIgdGhlIG1hcCBhbmQgYmVzaWRlIHRoZSBnYW1lJ3Mgb3duIHwgVGhlIHBhbmVscyB0aGlzIG1vZCBkcmF3cyBvbiB0aGUgZ2FtZSBzY3JlZW4gZG8gbm90IGFwcGVhci4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6cGFuZWwubW91bnRgIHwgRHJhdyBpdHMgb3duIGludGVyZmFjZSBvdmVyIHRoZSBnYW1lIHdpdGggcmVhbCB3ZWIgcGFnZXMgLSBpdCBjYW4gbG9vayBleGFjdGx5IGxpa2UgdGhlIGdhbWUncyBvd24gc2NyZWVucywgY292ZXIgdGhlbSBjb21wbGV0ZWx5LCBhbmQgcmVhZCB3aGF0ZXZlciB5b3UgdHlwZSwgcGFzdGUgb3IgZHJvcCBpbnRvIGl0IHwgVGhlIG1vZCdzIG93biB3aW5kb3dzIG92ZXIgdGhlIGdhbWUgZG8gbm90IG9wZW4uIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHVpOnJlZ2lvbmAgfCBBZGQgYW5kIHVwZGF0ZSBhIGhvc3QtcGFpbnRlZCB0ZXh0IHJlZ2lvbiBvbiB0aGUgZ2FtZSBzY3JlZW4gfCBUaGUgdGV4dCBhcmVhIHRoaXMgbW9kIGZpbGxzIG9uIHRoZSBnYW1lIHNjcmVlbiBzdGF5cyBlbXB0eS4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAp8IGB1aTpwYW5lbGAgfCBTaG93IHBhbmVscyBvZiBidXR0b25zIGFuZCB0ZXh0IHRoYXQgdGhlIGdhbWUgZHJhd3MgZm9yIHRoaXMgbW9kIHwgVGhlIHBhbmVscyB0aGlzIG1vZCBhc2tzIHRoZSBnYW1lIHRvIGRyYXcgZG8gbm90IGFwcGVhci4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYGJhY2t1cDpmb2xkZXJgIHwgV3JpdGUgZmlsZXMgaW50byBhIGZvbGRlciB5b3UgcGljayAoaXQgbmV2ZXIgbGVhcm5zIHRoZSBmb2xkZXIncyByZWFsIHBhdGgsIG9ubHkgd2hldGhlciBhIHdyaXRlIHN1Y2NlZWRlZCkgfCBUaGUgbW9kIGNhbm5vdCB3cml0ZSBiYWNrdXBzIHRvIGEgZm9sZGVyIHlvdSBwaWNrLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYG1vZDpyZWFkYCB8IExvb2sgdXAgYSBtb2QgYXQgYSByZXBvc2l0b3J5IGFkZHJlc3MsIHRoZSBzYW1lIHdheSBpbnN0YWxsaW5nIG9uZSBkb2VzIC0gaXRzIG5hbWUsIGRlc2NyaXB0aW9uLCBhdXRob3IsIHZlcnNpb24gYW5kIGZpbGUgbGlzdGluZyAtIGJ5IHJlYWNoaW5nIG91dCB0byB0aGF0IHJlcG9zaXRvcnkgb24geW91ciBiZWhhbGYuIE5vdGhpbmcgaXMgaW5zdGFsbGVkIGFuZCBub3RoaW5nIGlzIGFkZGVkIHRvIHlvdXIgbGlicmFyeSB8IFRoZSBtb2QgY2Fubm90IGxvb2sgdXAgb3RoZXIgbW9kcyBieSB0aGVpciByZXBvc2l0b3J5IGFkZHJlc3MuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYGRlYnVnOnNwYXduYCB8IENvbmp1cmUgaXRlbXMgYW5kIGNyZWF0dXJlcyBpbnRvIHlvdXIgZ2FtZSwgdGhlIHdheSB0aGUgZGVidWcgY29tbWFuZHMgZG8gLSBpdCBhc2tzIGZpcnN0LCBhbmQgdGhlIGNoYXJhY3RlciBpdCBoYXBwZW5zIHRvIGlzIG1hcmtlZCBmb3IgZ29vZCBhbmQgY2FuIG5vIGxvbmdlciBiZSBzY29yZWQgfCBUaGUgbW9kIGNhbm5vdCBjcmVhdGUgaXRlbXMgb3IgY3JlYXR1cmVzIGluIHlvdXIgZ2FtZS4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgZGVidWc6d2l6YXJkYCB8IFVzZSB0aGUgZ2FtZSdzIGRlYnVnIGNvbW1hbmRzIHRvIHRlc3Qgd2l0aCAtIGRlcHRoLCBleHBlcmllbmNlLCBnb2xkLCBpdGVtcywgY3JlYXR1cmVzIC0gYWZ0ZXIgc3RvcHBpbmcgdGhpcyBzZXNzaW9uIGZyb20gYmVpbmcgc2F2ZWQgYXQgYWxsLiBZb3VyIGNoYXJhY3RlciBvbiBkaXNrIGtlZXBzIHdoYXRldmVyIHRoZSBsYXN0IHNhdmUgbGVmdCBhbmQgbm90aGluZyBhZnRlciB0aGF0IGlzIHdyaXR0ZW4sIHdoaWNoIGNhbm5vdCBiZSB1bmRvbmUgd2l0aG91dCByZWxvYWRpbmcgfCBUaGUgbW9kIGNhbm5vdCB1c2UgdGhlIGdhbWUncyBkZWJ1ZyBjb21tYW5kcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBga2V5bWFwOndyaXRlYCB8IENyZWF0ZSBuZXcgc2hvcnRjdXQga2V5bWFwcyBpbiB5b3VyIGN1cnJlbnQga2V5c2V0IHdpdGhvdXQgcmVwbGFjaW5nIHlvdXIgZXhpc3Rpbmcgc2hvcnRjdXRzIHwgVGhlIHNob3J0Y3V0IGtleXMgdGhpcyBtb2Qgb2ZmZXJzIHRvIGFkZCBhcmUgbm90IGNyZWF0ZWQuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBga2V5bWFwOmVkaXRgIHwgQ2hhbmdlLCByZXBsYWNlIGFuZCByZW1vdmUgYW55IG9mIHlvdXIga2V5bWFwcyBpbiB0aGUgY3VycmVudCBrZXlzZXQsIGFuZCByZWFkIHRoZSBuZXh0IGtleSB5b3UgcHJlc3MgdG8gYmluZCBpdCB8IFRoZSBtb2QncyBrZXltYXAgZWRpdG9yIGNhbm5vdCBjaGFuZ2UgeW91ciBrZXltYXBzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGBvcHRpb25zOndyaXRlYCB8IENoYW5nZSB5b3VyIHVzZXIgaW50ZXJmYWNlIG9wdGlvbnMgYW5kIGRlbGF5IHNldHRpbmdzLCBhcyB0aGUgb3B0aW9ucyBtZW51IGRvZXM7IGJpcnRoIGFuZCBjaGVhdCBvcHRpb25zIHN0YXkgeW91cnMgdG8gc2V0IHwgVGhlIG1vZCBjYW5ub3QgY2hhbmdlIHlvdXIgb3B0aW9uczsgdGhlIG9wdGlvbnMgbWVudSBzdGlsbCB3b3Jrcy4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGBxdWVyeTpzbmFwc2hvdGAgfCBSZWFkIHRoZSBob3N0J3MgbmFtZWQsIGNsb25lZCBlbmdpbmUgYW5kIGNvbnRlbnQgc25hcHNob3RzIHwgVGhlIG1vZCBjYW5ub3QgcmVhZCB0aGUgZ2FtZSdzIHNuYXBzaG90cy4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYHBvbGljeTppbnN0YWxsYCB8IEluc3RhbGwgZGVjbGFyZWQgaG9zdC1zaWRlIHBvbGljaWVzIHRoYXQgdGhlIGdhbWUgZXZhbHVhdGVzIHN5bmNocm9ub3VzbHkgfCBUaGUgcnVsZXMgdGhpcyBtb2QgZGVjbGFyZXMgZm9yIHRoZSBnYW1lIHRvIGFwcGx5IGFyZSBub3QgaW5zdGFsbGVkLiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYGhvb2s6cmVzcG9uZGAgfCBBbnN3ZXIgYXBwcm92ZWQgYXN5bmNocm9ub3VzIGdhbWUgZGVjaXNpb25zIHdpdGggYSBzYWZlIHRpbWVvdXQgZmFsbGJhY2sgfCBUaGUgZ2FtZSBtYWtlcyB0aG9zZSBkZWNpc2lvbnMgd2l0aG91dCBhc2tpbmcgdGhpcyBtb2QuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKfCBgcmVnaXN0cnk6ZGVjbGFyZWAgfCBEZWNsYXJlIGhvc3Qtb3duZWQgY29tbWFuZHMgb3IgY29udGVudCB1c2luZyBhcHByb3ZlZCBkYXRhIHNjaGVtYXMgfCBUaGUgY29tbWFuZHMgYW5kIGNvbnRlbnQgdGhpcyBtb2QgZGVjbGFyZXMgYXJlIG5vdCBhZGRlZC4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAp8IGBwcmVmczpyZWFkYCB8IFJlYWQgdGhlIHNldHRpbmdzIHRoaXMgbW9kIHNhdmVkIGVhcmxpZXIgfCBUaGUgbW9kIHN0YXJ0cyBmcm9tIGl0cyBkZWZhdWx0cyBlYWNoIHRpbWUuIHwgbm8gfCBhbnkgY29kZSBtb2QgfAp8IGBwcmVmczp3cml0ZWAgfCBTYXZlIGl0cyBvd24gc2V0dGluZ3MgYmV0d2VlbiBzZXNzaW9ucyB8IENoYW5nZXMgdG8gdGhlIG1vZCdzIHNldHRpbmdzIGFyZSBsb3N0IHdoZW4geW91IGNsb3NlIHRoZSBnYW1lLiB8IG5vIHwgYW55IGNvZGUgbW9kIHwKfCBgYXNzZXQ6cmVhZGAgfCBSZWFkIGZpbGVzIHRoYXQgY2FtZSB3aXRoIHRoaXMgbW9kIHwgVGhlIG1vZCBjYW5ub3Qgb3BlbiB0aGUgaW1hZ2VzIGFuZCBkYXRhIGZpbGVzIGl0IHNoaXBzIHdpdGguIHwgbm8gfCBhbnkgY29kZSBtb2QgfAp8IGBzdGF0ZToqLnJlYWRgIHwgUmVhZCBBTEwgZ2FtZSBzdGF0ZSwgZXhjZXB0IHRoZSBwYXJ0cyBvZiB0aGUgbWFwIHlvdXIgY2hhcmFjdGVyIGhhcyBub3QgZm91bmQgfCBUaGUgbW9kIGNhbm5vdCByZWFkIHRoZSBnYW1lIHN0YXRlIGl0IHVzZXMuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKfCBgc3RhdGU6bWFwLWFjdHVhbC5yZWFkYCB8IFNlZSB3aGF0IHRoZSBtYXAgcmVhbGx5IGhvbGRzLCBpbmNsdWRpbmcgdHJhcHMsIGl0ZW1zLCB0ZXJyYWluIGFuZCBjcmVhdHVyZXMgeW91ciBjaGFyYWN0ZXIgaGFzIG5vdCBmb3VuZCB8IFRoZSBtb2Qgc2VlcyBvbmx5IHdoYXQgeW91ciBjaGFyYWN0ZXIgaGFzIGZvdW5kLiB8IHllcyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBzdGF0ZTptb25zdGVycy1hY3R1YWwucmVhZGAgfCBTZWUgZXhhY3QgbnVtYmVycyBmb3IgdGhlIGNyZWF0dXJlcyB5b3VyIGNoYXJhY3RlciBwZXJjZWl2ZXMsIHN1Y2ggYXMgaGl0IHBvaW50cyBhbmQgc3BlZWQsIGFuZCB3aGF0IGVhY2gga2luZCBvZiBjcmVhdHVyZSByZWFsbHkgZG9lcyB8IFRoZSBtb2Qgc2VlcyBvbmx5IHdoYXQgeW91ciBjaGFyYWN0ZXIgaGFzIGxlYXJuZWQgYWJvdXQgY3JlYXR1cmVzLiB8IHllcyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBuZXR3b3JrOipgIHwgU2VuZCBuZXR3b3JrIHJlcXVlc3RzIHRvIEFOWSBob3N0ICh5b3VyIGRhdGEgY291bGQgbGVhdmUgdGhpcyBkZXZpY2UpIHwgVGhlIG1vZCBjYW5ub3QgcmVhY2ggdGhlIGludGVybmV0LiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYG5ldHdvcms6bG9jYWxgIHwgU2VuZCBuZXR3b3JrIHJlcXVlc3RzIHRvIHNlcnZlcnMgb24gdGhpcyBjb21wdXRlciBvciB5b3VyIGxvY2FsIG5ldHdvcmsgfCBUaGUgbW9kIGNhbm5vdCByZWFjaCBzZXJ2ZXJzIG9uIHRoaXMgY29tcHV0ZXIgb3IgeW91ciBsb2NhbCBuZXR3b3JrLiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYHJlZ2lzdHJ5OipgIHwgT3ZlcnJpZGUgQU5ZIGdhbWUgc3lzdGVtIC0gZWZmZWN0cywgbGV2ZWwgYW5kIGR1bmdlb24gZ2VuZXJhdGlvbiwgbW9uc3RlciBhdHRhY2tzLCBzaG9wcywgY29tbWFuZHMsIG1vbnN0ZXIgQUksIHdoYXQgc3BlbGxzIGFuZCBicmVhdGhzIGRvLCB3aGF0IGEgdmF1bHQgc3ltYm9sIG1lYW5zLCBhbmQgdm9jYWJ1bGFyeSAoZnVsbCB0cnVzdGVkLCBpbi1wcm9jZXNzIGFjY2VzcykgfCBOb25lIG9mIHRoZSBnYW1lIHN5c3RlbXMgdGhpcyBtb2QgY2hhbmdlcyBhcmUgY2hhbmdlZCwgYW5kIHRoZSBtb2QgZG9lcyBub3Qgc3RhcnQuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OmVmZmVjdGAgfCBPdmVycmlkZSBlZmZlY3QsIGNvbWJhdCwgYW5kIG1hZ2ljIGxvZ2ljIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6cm9vbWAgfCBPdmVycmlkZSBkdW5nZW9uIC8gbGV2ZWwgZ2VuZXJhdGlvbiB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnByb2ZpbGVgIHwgQWRkIG5ldyBraW5kcyBvZiBkdW5nZW9uIGxldmVsLCBhbmQgY2hhbmdlIHdoaWNoIGtpbmQgeW91IGdldCBhdCBhIGRlcHRoIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Ymxvd2AgfCBDaGFuZ2Ugd2hhdCBtb25zdGVyIGF0dGFja3MgZG8gdG8geW91LCBhbmQgYWRkIG5ldyBraW5kcyBvZiBhdHRhY2sgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpzdG9yZWAgfCBDaGFuZ2Ugd2hhdCBzaG9wcyBidXkgZnJvbSB5b3UgYW5kIHdoYXQgdGhleSBrZWVwIGluIHN0b2NrIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Y29tbWFuZGAgfCBDaGFuZ2Ugd2hhdCBwbGF5ZXIgY29tbWFuZHMgZG8gKGFuZCBhZGQgY29tbWFuZHMpIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6bW9uc3RlcmAgfCBPdmVycmlkZSBtb25zdGVyIEFJICh0YWtlIG92ZXIgbW9uc3RlciB0dXJucykgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpwcm9qZWN0aW9uYCB8IENoYW5nZSB3aGF0IHNwZWxscywgYnJlYXRocyBhbmQgb3RoZXIgZWxlbWVudHMgZG8gdG8gdGhlIGR1bmdlb24sIHRvIGl0ZW1zIG9uIHRoZSBmbG9vciwgYW5kIHRvIHlvdSB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnVpLWVudHJ5YCB8IENoYW5nZSBob3cgeW91ciByZXNpc3RhbmNlcywgYWJpbGl0aWVzIGFuZCBzdGF0IG1vZGlmaWVycyBhcmUgd29ya2VkIG91dCBhbmQgZHJhd24gb24gdGhlIGNoYXJhY3RlciBzaGVldCBhbmQgdGhlIGVxdWlwbWVudCBjb21wYXJpc29uIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Z2x5cGhgIHwgQ2hhbmdlIHdoYXQgdGhlIHN5bWJvbHMgaW4gYSByb29tIG9yIHZhdWx0IGxheW91dCBtZWFuIHdoZW4gYSBsZXZlbCBpcyBkcmF3biB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OmVmZmVjdC1pbmZvYCB8IENoYW5nZSB3aGF0IHRoZSBnYW1lIHRlbGxzIHlvdSBhYm91dCBhIHNwZWxsLCBwb3Rpb24gb3Igd2FuZCBlZmZlY3QgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpyYW5kYXJ0YCB8IENoYW5nZSBob3cgcmFuZG9tIGFydGlmYWN0cyBhcmUgYnVpbHQgLSB3aGF0IHBvd2VycyB0aGV5IGNhbiBnZXQsIGFuZCB3aGF0IGVhY2gga2luZCBvZiBpdGVtIHN0YXJ0cyB3aXRoIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6cnVuZWAgfCBUZWFjaCB0aGUgZ2FtZSBhYm91dCBhIG5ldyBraW5kIG9mIFJVTkUgLSB3aGF0IGl0IGlzIGNhbGxlZCwgd2hhdCBhbiBpdGVtIGNhcnJpZXMsIGFuZCBob3cgdGhlIHBsYXllciBsZWFybnMgaXQgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTp0dmFsYCB8IENoYW5nZSBob3cgaXRlbXMgYXJlIHByaWNlZCBhbmQgaG93IGZsb29yIGl0ZW1zIGFyZSBvcmRlcmVkLCBhbmQgdGVhY2ggdGhlIGdhbWUgYWJvdXQgYSBuZXcga2luZCBvZiBpdGVtIC0gd2hldGhlciBpdCBjYW4gYmUgd29ybiBvciB3aWVsZGVkIGFuZCB3aGV0aGVyIGl0IGhhcyBhbiB1bmlkZW50aWZpZWQgZmxhdm91ciB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnZvY2FiYCB8IEFkZCBuZXcgdm9jYWJ1bGFyeSAtIGZsYWdzLCBzdGF0cywgYW5kIG90aGVyIHRlcm1zIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTptZW51YCB8IFJld3JpdGUgb25lIG5hbWVkIGdhbWUgbWVudSdzIHNlbWFudGljIHJvd3MgYW5kIGxheW91dCB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5Om1lc3NhZ2VgIHwgQWRkIG5ldyBtZXNzYWdlIHR5cGVzLCBhbmQgY2hvb3NlIHdoaWNoIHNvdW5kcyBwbGF5IGZvciB0aGVtIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTp0aWxlc2AgfCBTdXBwbHkgdGlsZXMgZm9yIGNyZWF0dXJlcyBhbmQgaXRlbXMgeW91ciB0aWxlIHNldCBkb2VzIG5vdCBkcmF3IHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGBwcm9maWxlczptYW5hZ2VgIHwgQ3JlYXRlIHByb2ZpbGVzIGFuZCBzd2l0Y2ggYmV0d2VlbiB0aGVtIHwgVGhlIG1vZCBjYW5ub3QgY3JlYXRlIHByb2ZpbGVzIG9yIHN3aXRjaCBiZXR3ZWVuIHRoZW0uIHwgeWVzIHwgZmlyc3QtcGFydHkgb25seSB8CnwgYHNlc3Npb246Y29udHJvbGAgfCBTYXZlIHRoZSBnYW1lLCByZXR1cm4gdG8gdGhlIHRpdGxlIHNjcmVlbiwgb3IgcXVpdCB8IFRoZSBtb2QgY2Fubm90IHNhdmUgdGhlIGdhbWUsIGxlYXZlIGl0IG9yIHF1aXQgZm9yIHlvdS4gfCBubyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBzY3JlZW5zOm1hbmFnZWAgfCBEcmF3IHRoZSBnYW1lJ3MgbW9kLCBwcm9maWxlIGFuZCBzZXR0aW5ncyBzY3JlZW5zIGluIGl0cyBvd24gbG9vayB8IFRoZSBnYW1lJ3Mgb3duIG1hbmFnZW1lbnQgc2NyZWVucyBhcmUgc2hvd24gaW5zdGVhZC4gfCB5ZXMgfCBmaXJzdC1wYXJ0eSBvbmx5IHwKfCBgbW9kOmluc3RhbGxgIHwgQWRkIGNvbnRlbnQgbW9kcyB0byB5b3VyIGxpYnJhcnkgLSByZWNvcmRzIGFuZCB0d2Vha3MsIG5ldmVyIGNvZGUsIGFuZCB0aGV5IGFycml2ZSBzd2l0Y2hlZCBvZmYgdW50aWwgeW91IHJlYWQgd2hhdCB0aGV5IGFzayBmb3IgYW5kIHR1cm4gdGhlbSBvbiB5b3Vyc2VsZiB8IFRoZSBtb2QgY2Fubm90IGFkZCBtb2RzIHRvIHlvdXIgbGlicmFyeS4gfCB5ZXMgfCBmaXJzdC1wYXJ0eSBvbmx5IHwKfCBgbW9kOnNlc3Npb25gIHwgUHV0IGNvbnRlbnQgbW9kcyBpbnRvIHRoZSBnYW1lIGZvciB0aGUgcmVzdCBvZiB0aGlzIHNlc3Npb24gLSByZWNvcmRzIGFuZCB0d2Vha3MsIG5ldmVyIGNvZGUgLSB3aGljaCBzdGFydCB3b3JraW5nIGFzIHNvb24gYXMgdGhlIGdhbWUgcmVsb2Fkcywgd2l0aG91dCB3YWl0aW5nIHRvIGJlIHN3aXRjaGVkIG9uLiBUaGUgbW9kIGlzIGZvcmdvdHRlbiB3aGVuIHlvdSBjbG9zZSB0aGUgZ2FtZTsgd2hhdCBpdCBkaWQgdG8gYSBjaGFyYWN0ZXIgaXMgbm90IHwgVGhlIG1vZCBjYW5ub3QgbG9hZCB0ZXN0IGNvbnRlbnQgaW50byB0aGlzIHNlc3Npb24uIHwgeWVzIHwgZmlyc3QtcGFydHkgb25seSB8CnwgYGV2ZW50OjxuYW1lPmAgfCBPYnNlcnZlIHRoZSAie25hbWV9IiBnYW1lIGV2ZW50IHwgVGhlIG1vZCBpcyBub3QgdG9sZCB3aGVuIHRoaXMgZXZlbnQgaGFwcGVucy4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYHN0YXRlOjxkb21haW4+LnJlYWRgIHwgUmVhZCB7ZG9tYWlufSBnYW1lIHN0YXRlIHwgVGhlIG1vZCBjYW5ub3QgcmVhZCB0aGlzIHBhcnQgb2YgdGhlIGdhbWUgc3RhdGUuIHwgbm8gfCBhbnkgY29kZSBtb2QgfAp8IGBuZXR3b3JrOjxob3N0PmAgfCBTZW5kIG5ldHdvcmsgcmVxdWVzdHMgdG8ge2hvc3R9IHwgVGhlIG1vZCBjYW5ub3QgcmVhY2ggdGhpcyBzZXJ2ZXIuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKCiMjIyBXaGF0IGEgY2FwYWJpbGl0eSBnYXRlcywgYW5kIHdoYXQgaXQgZG9lcyBub3QKClRoZSBydWxlIGFib3ZlIGlzIGFjY3VyYXRlLCBidXQgbmFycm93ZXIgdGhhbiBpdCBsb29rczogdGhlIGdhdGUgaXMgb24gdGhlIGZhY2FkZSwgbm90IG9uIHRoZSByZWdpc3RyeSBiZWhpbmQgaXQuIEEgYHJlZ2lzdHJ5OipgIGNhcGFiaWxpdHkgaXMgYSBkZWNsYXJhdGlvbiwgYW5kIHdoYXQgaXQgZ2l2ZXMgeW91IGlzIHJlYWwgYnV0IGxpbWl0ZWQ6CgotIHRoZSBwbGF5ZXIgc2VlcyB0aGUgbGlzdCwgaW4gcGxhaW4gbGFuZ3VhZ2UsIGJlZm9yZSBjb25zZW50aW5nOwotIHRoZSBjb25mbGljdCByZXBvcnQgYW5kIHRoZSBtYW5hZ2VyIHJvdyBhcmUgYnVpbHQgZnJvbSBpdDsKLSBhbiBhdXRob3Igd2hvIGZvcmdvdCB0byBkZWNsYXJlIGEgZG9tYWluIGdldHMgYSBjbGVhciB0aHJvdyB3aXRoIHRoZSBjYXBhYmlsaXR5IG5hbWUgaW4gaXQsIGluc3RlYWQgb2YgYSBzaWxlbnQgc3VycHJpc2UgbGF0ZXIuCgpJdCBkb2VzIG5vdCBmZW5jZSBvZmYgdGhlIHJlZ2lzdHJ5LiBZb3VyIGByZWdpc3Rlcihob3N0LCBjdHgpYCBpcyBoYW5kZWQgdGhyZWUgc2V0cyBvZiBvYmplY3RzIHdpdGggbm8gY2FwYWJpbGl0eSBjaGVjayBhdCBhbGwsIGJlY2F1c2UgYSBtb2QgaXMgbWVhbnQgdG8gYmUgYWJsZSB0byBsb29rIGF0IGV2ZXJ5dGhpbmcgd2l0aG91dCBkZWNsYXJpbmcgYW55dGhpbmc6Cgp8IEhhbmRlZCB0byB5b3UgdW5nYXRlZCB8IFRoZSBnYXRlZCBmYWNhZGUgaXQgaXMgdGhlIHR3aW4gb2YgfAp8LS0tfC0tLXwKfCBgY3R4LnJlZ2lzdHJpZXMucm9vbXNgLCBgLnByb2ZpbGVzYCwgYC5yb29tcy5nbHlwaHNgIHwgYHJlZ2lzdHJ5OnJvb21gLCBgcmVnaXN0cnk6cHJvZmlsZWAsIGByZWdpc3RyeTpnbHlwaGAgfAp8IGBjdHguc3RhdGUuYmxvd0VmZmVjdHNgLCBgLnN0b3JlQmVoYXZpb3VyYCwgYC5wcm9qZWN0aW9uSGFuZGxlcnNgLCBgLnVpRW50cnlgLCBgLmNvbW1hbmRWZXJic2AsIGAubW9uc3RlclR1cm5Ib29rYCB8IGByZWdpc3RyeTpibG93YCwgYHJlZ2lzdHJ5OnN0b3JlYCwgYHJlZ2lzdHJ5OnByb2plY3Rpb25gLCBgcmVnaXN0cnk6dWktZW50cnlgLCBgcmVnaXN0cnk6Y29tbWFuZGAsIGByZWdpc3RyeTptb25zdGVyYCB8CnwgYGN0eC5jb3JlLnR2YWxSZWdpc3RyeSgpYCwgYC5ydW5lUmVnaXN0cnkoKWAsIGAucmFuZGFydFJlZ2lzdHJ5KClgLCBgLmVmZmVjdEluZm9SZWdpc3RyeSgpYCwgYC5tZXNzYWdlVHlwZXNgLCBgLnNvdW5kUHJlZlJlZ2lzdHJ5YCB8IGByZWdpc3RyeTp0dmFsYCwgYHJlZ2lzdHJ5OnJ1bmVgLCBgcmVnaXN0cnk6cmFuZGFydGAsIGByZWdpc3RyeTplZmZlY3QtaW5mb2AsIGByZWdpc3RyeTptZXNzYWdlYCB8CgpgY3R4LmF1dGhvcmluZ2AgYW5kIGBjdHguY29tcG9zZWRSZWNvcmRzYCBhcmUgdW5nYXRlZCB0b28sIGZvciBhIGRpZmZlcmVudCByZWFzb246IHRoZXkgYXJlIG5vdCB0d2lucyBvZiBhbnkgZ2F0ZWQgZmFjYWRlLiBUaGUgYmFycmVsIGlzIHB1cmUgZnVuY3Rpb25zIG92ZXIgZGF0YSB5b3UgcGFzcyBpbiwgYW5kIHRoZSByZWNvcmRzIGFyZSBjb250ZW50IHRoZSBwbGF5ZXIgYWxyZWFkeSBoYXMsIGluIHRoZSBzaGFwZSBpdCB3YXMgcmVhZCBpbi4gTmVpdGhlciBpcyBhIHNlY29uZCByb3V0ZSB0byBhIGdhdGVkIGZhY2FkZS4KClRob3NlIGFyZSB0aGUgc2FtZSBsaXZlIG9iamVjdHMsIGJ5IGlkZW50aXR5LCBub3QgY29waWVzLiBgY3R4LmNvcmVgIGFsc28gZXhwb3J0cyBgY3JlYXRlTW9kUmVnaXN0cnlIb3N0YCBpdHNlbGYsIHdoaWNoIGdyYW50cyBldmVyeSBkb21haW4gd2hlbiBjYWxsZWQgd2l0aG91dCBhIGNhcGFiaWxpdHkgc2V0LCBzbyBhbnl0aGluZyBob2xkaW5nIHRoZSBuYW1lc3BhY2UgaXMgb25lIGNhbGwgYXdheSBmcm9tIGFuIHVuZ2F0ZWQgaG9zdC4KClRoYXQgZm9sbG93cyBmcm9tIGhvdyBwbHVnaW5zIHJ1bi4gQSB0cnVzdGVkIHBsdWdpbiBydW5zIGluLXByb2Nlc3MsIHN5bmNocm9ub3VzbHksIGhvbGRpbmcgdGhlIGVuZ2luZSBuYW1lc3BhY2UsIGJlY2F1c2UgdGhhdCBpcyB0aGUgb25seSB3YXkgYSBoYW5kbGVyIGNhbiB0b3VjaCB0aGUgbGl2ZSBgcm5nYCwgYGNodW5rYCBhbmQgYHBsYXllcmAgZGVlcCBpbnNpZGUgYSB0dXJuICh0aGUgcmVhc29uaW5nIGlzIGluIGBwYWNrYWdlcy9jb3JlL3NyYy9tb2QvcmVnaXN0cnktaG9zdC50c2AsIHVuZGVyIFdIWSBJTi1QUk9DRVNTIEFORCBUUlVTVEVEKS4gTm90aGluZyByZWFjaGFibGUgZnJvbSB0aGF0IG5hbWVzcGFjZSBjYW4gYmUgd2l0aGhlbGQgZnJvbSBjb2RlIGFscmVhZHkgaW5zaWRlIGl0LCBhbmQgYSByZWFkLW9ubHkgdmlldyBvdmVyIGBjdHgucmVnaXN0cmllc2Agd291bGQgY2xvc2UgdGhyZWUgb2YgdGhlIGZpZnRlZW4gdHdpbnMgYWJvdmUgd2hpbGUgbG9va2luZyBhcyB0aG91Z2ggaXQgaGFkIGNsb3NlZCBhbGwgb2YgdGhlbS4gYHBhY2thZ2VzL3dlYi9zcmMvY2FwYWJpbGl0eS1nYXRlLXJlYWNoLnRlc3QudHNgIHRlc3RzIGJvdGggaGFsdmVzOiB0aGUgZ2F0ZSByZWZ1c2luZywgYW5kIHRoZSB0d2luIHJlYWNoaW5nLgoKVGhlIHNhbWUgaG9sZHMgZm9yIG90aGVyIGNhcGFiaWxpdHkgZmFtaWxpZXMgaW4gdGhlIGluLXByb2Nlc3MgdGllci4gYHN0YXRlOjxkb21haW4+LnJlYWRgIGdhdGVzIHRoZSBwZXJjZWl2ZSBmYWNhZGUncyBhY2Nlc3NvcnMgcGVyIGRvbWFpbiwgYnV0IGBjdHguc3RhdGVgIGlzIHRoZSB3aG9sZSBsaXZlIGBHYW1lU3RhdGVgLiBgbmV0d29yazo8aG9zdD5gIGdhdGVzIGBjdHgubmV0YCwgd2hpY2ggcmVmdXNlcyBhIHJlcXVlc3QgdG8gYW4gdW5kZWNsYXJlZCBob3N0LCBidXQgYSBwbHVnaW4gaXMgYW4gRVMgbW9kdWxlIGluIHRoZSBnYW1lJ3Mgb3duIHBhZ2Ugd2l0aCB0aGUgZ2xvYmFsIGBmZXRjaGAgaW4gc2NvcGUuCgpXb3JrZXIgbW9kcyBhcmUgZGlmZmVyZW50LiBBIFdvcmtlciBzaXRzIGJlaGluZCBhIG1lc3NhZ2UgcG9ydCBhbmQgZ2V0cyB0aGUgcGVyY2VpdmUsIGFjdCBhbmQgZXZlbnQgY2FsbHMgdGhlIGJyb2tlciBvZmZlcnMsIHdpdGggbm8gYGN0eC5jb3JlYCwgYGN0eC5zdGF0ZWAgb3IgYGN0eC5yZWdpc3RyaWVzYCB0byBnbyBhcm91bmQgdGhlbSwgc28gYSBjYXBhYmlsaXR5IGl0IGxhY2tzIHN0YXlzIG91dCBvZiByZWFjaC4gVGhlIGJyb2tlciBpbiBgcGFja2FnZXMvd2ViL3NyYy9tb2Qtd29ya2VyL2hvc3QudHNgIG1hdGNoZXMgZWFjaCByZXF1ZXN0IGFnYWluc3Qgb25lIGV4YWN0IHN0cmluZy4gQSBzdGF0ZSBzdWJzY3JpcHRpb24sIGZvciBleGFtcGxlLCBuZWVkcyBgc3RhdGU6bW9kZWwucmVhZGAgaXRzZWxmLCBhbmQgYHN0YXRlOioucmVhZGAgZG9lcyBub3Qgc3RhbmQgaW4gZm9yIGl0IHRoZXJlLiBPbmUgY2FwYWJpbGl0eSBzdHJpbmcgY2FuIHRoZXJlZm9yZSBtZWFuIGEgaGFyZCB3YWxsIGZvciBhIFdvcmtlciBtb2QgYW5kIGEgZGVjbGFyYXRpb24gZm9yIGFuIGluLXByb2Nlc3MgcGx1Z2luOyB0aGUgcmVzdCBvZiB0aGlzIHNlY3Rpb24gaXMgYWJvdXQgaW4tcHJvY2VzcyBwbHVnaW5zLgoKRm9yIGluLXByb2Nlc3MgcGx1Z2lucywgdGhlIHJlYWwgYm91bmRhcnkgaXMgdGhlIGluc3RhbGwuIEEgbW9kIGlzIGNvZGUsIG5vYm9keSBpbiB0aGlzIHByb2plY3QgcmV2aWV3cyBpdCwgYW5kIHRoZSBwbGF5ZXIgbWFrZXMgdGhhdCBkZWNpc2lvbiB3aXRoIHRoZSB0b2dnbGUgb24gdGhlIE1vZHMgc2NyZWVuIChgcGFja2FnZXMvd2ViL3NyYy9tb2QtY29uc2VudC50c2ApLiBTbyB0aGUgY29uc2VudCBzY3JlZW4gc2hvd3MgdGhlIGluLXByb2Nlc3Mgd2FybmluZyBmb3IgYW55IG1vZCB0aGF0IHNoaXBzIGNvZGUsIHdoYXRldmVyIGl0cyBkZWNsYXJlZCBsaXN0IHNheXMsIGFuZCB0aGUgbWFuYWdlciByb3cgZm9yIGEgcGx1Z2luIHRoYXQgZGVjbGFyZXMgbm90aGluZyBzYXlzIHNvIGluc3RlYWQgb2YgbG9va2luZyByZWFzc3VyaW5nLgoKU28gZGVjbGFyZSB3aGF0IHlvdSBvdmVycmlkZS4gVGhlIHRocm93IGlzIG5vdCB0aGUgb25seSByZWFzb246IHRoZSBkZWNsYXJhdGlvbiBpcyB3aGF0IHRoZSBwbGF5ZXIgcmVhZHMgYW5kIHdoYXQgdGhlIGNvbmZsaWN0IHJlcG9ydCBpcyBidWlsdCBmcm9tLiBJZiB5b3UgcmVhY2ggYSByZWdpc3RyeSBhcm91bmQgaXRzIGZhY2FkZSwgdGhlIHBsYXllciBoYXMgY29uc2VudGVkIHRvIGEgbW9kIHRoYXQgZGlkIG5vdCBzYXkgd2hhdCBpdCBkb2VzLCBhbmQgdGhlIG1hbmFnZXIgY2Fubm90IHNlZSB0aGUgY2xhc2ggdG8gcmVwb3J0IGl0LgoKIyMjIE92ZXJ3cml0aW5nIGFuZCBleHRlbmRpbmc6IHlvdXJzLCBjb3JlJ3MsIG9yIHNvbWVib2R5IGVsc2UncwoKRXZlcnkgcmVnaXN0cnkgaGVyZSBpcyBrZXllZCwgYW5kIHlvdSB3cml0ZSAqKm9uZSBrZXkgYXQgYSB0aW1lKiouIFRoYXQgaXMgd2hhdAptYWtlcyB0d28gbW9kcyBhYmxlIHRvIHRvdWNoIHRoZSBzYW1lIHN5c3RlbTogdGhlIGxhc3Qgb25lIHRvIHdyaXRlIGEga2V5IHdpbnMKdGhhdCBrZXksIGFuZCBldmVyeSBvdGhlciBrZXkgZWl0aGVyIG1vZCB3cm90ZSBzdXJ2aXZlcy4gSGFuZGluZyBvdmVyIGEgd2hvbGUKdGFibGUgaW5zdGVhZCB3b3VsZCBtZWFuIHRoZSBzZWNvbmQgbW9kIGxvYWRlZCBzaWxlbnRseSBlcmFzZWQgdGhlIGZpcnN0LgoKRWFjaCBmYWNhZGUgYWxzbyBoYW5kcyBiYWNrIHdoYXQgaXMgaW5zdGFsbGVkICpyaWdodCBub3cqLCBzbyBleHRlbmRpbmcgaXMgdGhlCnNhbWUgbW92ZSBhcyByZXBsYWNpbmc6CgpgYGBqcwpyZWdpc3Rlcihob3N0KSB7CiAgLy8gWW91ciBvd24gZWxlbWVudCwgZ2l2ZW4gYSBib2R5LgogIGhvc3QucHJvamVjdGlvbnMucGxheWVyLnNldCgiZnJvc3Q6cmltZSIsIChjdHgpID0+IHsKICAgIGN0eC5tc2coIlRoZSByaW1lIGJpdGVzIGRlZXBlciB0aGFuIGNvbGQuIik7CiAgICBjdHguaW5jVGltZWQoVE1EX1NMT1csIDUsIHRydWUpOwogIH0pOwoKICAvLyBDb3JlJ3MgRklSRSwgZXh0ZW5kZWQuIGBwcmV2aW91c2AgaXMgY29yZSdzIGhhbmRsZXIsIG9yLCBpZiBhIG1vZCBsb2FkZWQKICAvLyBiZWZvcmUgeW91cnMgYWxyZWFkeSByZXBsYWNlZCBpdCwgVEhFSVJTLiBZb3UgZG8gbm90IG5lZWQgdG8ga25vdyB3aGljaC4KICBjb25zdCBwcmV2aW91cyA9IGhvc3QucHJvamVjdGlvbnMucGxheWVyLmhhbmRsZXJGb3IoIkZJUkUiKTsKICBob3N0LnByb2plY3Rpb25zLnBsYXllci5zZXQoIkZJUkUiLCAoY3R4KSA9PiB7CiAgICBwcmV2aW91cyhjdHgpOwogICAgY3R4Lm1zZygiWW91ciBjbG9hayBzbW91bGRlcnMuIik7CiAgfSk7Cn0KYGBgCgpgaGFuZGxlckZvcmAgaXMgb24gZXZlcnkgZmFjYWRlIGluIHRoZSB0YWJsZSBhYm92ZTogYGJsb3dzLmhhbmRsZXJGb3JgLApgc3RvcmVzLndpbGxCdXlGb3JgLCBgcHJvZmlsZXMuYnVpbGRlcmAuIFJlYWNoIGZvciBpdCBiZWZvcmUgcmVpbXBsZW1lbnRpbmcKYW55dGhpbmc6IGEgd3JhcHBlciBzdXJ2aXZlcyBhIGNvcmUgY2hhbmdlIHRoYXQgYSBjb3B5IGRvZXMgbm90LgoKTWVudXMgYXJlIGRlY2xhcmVkIGJ5IHN0YWJsZSBpZHMgc3VjaCBhcyBgY29yZTpnYW1lLW1lbnVgIGFuZApgY29yZTprbm93bGVkZ2UtZ3JvdXBgLCBuZXZlciB0aGVpciBsb2NhbGl6ZWQgdGl0bGVzLiBFYWNoIHJvdyBoYXMgYSBzdGFibGUKYGlkYCBwbHVzIGBzZW1hbnRpYzogeyBraW5kLCByZWY/LCBkYXRhPyB9YDogYSBjb21tYW5kIHdoZWVsIGNhbiB1c2UgYSBjb21tYW5kCnJvdydzIGByZWZgLCB3aGlsZSBhbiBpbnZlbnRvcnkgZ3JpZCBjYW4gdXNlIGFuIGl0ZW0gcm93IHdpdGhvdXQgcmV2ZXJzZS1wYXJzaW5nCnRoZSBsYWJlbC4gQSB0cmFuc2Zvcm1lciByZWNlaXZlcyB0aG9zZSByb3dzLCBtYXkgYWRkL3JlbW92ZS9yZW9yZGVyL3JlbGFiZWwsCmFuZCByZXR1cm5zIHRoZSByZXBsYWNlbWVudCByb3cgYXJyYXk6CgpgYGBqcwpyZWdpc3Rlcihob3N0KSB7CiAgY29uc3QgcHJldmlvdXMgPSBob3N0Lm1lbnVzLmhhbmRsZXJGb3IoImNvcmU6Z2FtZS1tZW51Iik7CiAgaG9zdC5tZW51cy5yZWdpc3RlcigiY29yZTpnYW1lLW1lbnUiLCAoaWQsIHJvd3MpID0+IFsKICAgIC4uLihwcmV2aW91cyA/IHByZXZpb3VzKGlkLCByb3dzKSA6IHJvd3MpLAogICAgeyBpZDogIm15LW1vZDpyZXN0IiwgbGFiZWw6ICJSZXN0Iiwgc2VtYW50aWM6IHsga2luZDogImNvbW1hbmQiLCByZWY6ICJyZXN0IiB9IH0sCiAgXSk7Cn0KYGBgCgpUaGF0IHRyYW5zZm9ybWVyIGNoYW5nZXMgcHJlc2VudGF0aW9uIG9ubHk6IGEgcm93IGl0IGludmVudHMgaGFzIG5vIGNvcmUgYWN0aW9uCmJlaGluZCBpdC4gVG8gYWRkIGEgKipydW5uYWJsZSoqIHJvdyBvZiB5b3VyIG93biwgZGVjbGFyZSBgcmVnaXN0cnk6bWVudWAgYW5kCnVzZSBgYWRkQWN0aW9uYCBpbnN0ZWFkLiBUaGUgaG9zdCBuYW1lc3BhY2VzIGBhY3Rpb25gIGJ5IHlvdXIgbW9kIGlkLCBhcHBlbmRzCnRoZSByb3cgdG8gdGhlIEVzY2FwZSBHYW1lIG1lbnUsIGFuZCBjYWxscyBvbmx5IHlvdXIgaGFuZGxlciB3aGVuIHRoZSBwbGF5ZXIKc2VsZWN0cyBpdC4gVGhlIGhhbmRsZXIgYmVnaW5zIGluIHRoZSBzZWxlY3Rpb24gZ2VzdHVyZSwgc28gaXQgbWF5IG9wZW4gYQpicm93c2VyIGZvbGRlciBwaWNrZXIuCgpgYGBqcwpyZWdpc3Rlcihob3N0LCBjdHgpIHsKICBob3N0Lm1lbnVzLmFkZEFjdGlvbigKICAgICJjb3JlOmdhbWUtbWVudSIsCiAgICAiY2hvb3NlLWJhY2t1cC1mb2xkZXIiLAogICAgIkNob29zZSBiYWNrdXAgZm9sZGVyLi4uIiwKICAgIGFzeW5jICgpID0+IHsKICAgICAgY29uc3QgbmFtZSA9IGF3YWl0IGN0eC5iYWNrdXBGb2xkZXI/LmNob29zZSgpOwogICAgICBjdHgubG9nKG5hbWUgPyBgVXNpbmcgYmFja3VwIGZvbGRlcjogJHtuYW1lfWAgOiAiQmFja3VwIGZvbGRlciB1bmNoYW5nZWQuIik7CiAgICB9LAogICk7Cn0KYGBgCgpgY29yZTpnYW1lLW1lbnVgIGlzIHRoZSBvbmx5IGFjdGlvbiBsb2NhdGlvbiBpbiB0aGlzIEFQSSB2ZXJzaW9uLiBBIGNhbGxiYWNrCnRoYXQgdGhyb3dzIGlzIHJlcG9ydGVkIGFnYWluc3QgaXRzIG1vZCBhbmQgcmV0dXJucyB0aGUgcGxheWVyIHRvIHRoZSBHYW1lIG1lbnU7Cml0IG5ldmVyIGZhbGxzIHRocm91Z2ggdG8gYSBzaW1pbGFybHkgcG9zaXRpb25lZCBjb3JlIHJvdy4KClBsdWdpbiBjb2RlIHJ1bnMgKippbiBwcm9jZXNzLCBzeW5jaHJvbm91c2x5KiosIHdpdGggdGhlIHNhbWUgYWNjZXNzIHRvIHRoZSBybmcsCnRoZSBjaHVuaywgdGhlIHBsYXllciBhbmQgdGhlIG1vbnN0ZXIgdGhhdCBjb3JlIGhhcywgYmVjYXVzZSBhIGRlZXAgb3ZlcnJpZGUKY2Fubm90IGNyb3NzIGFuIGFzeW5jLCBpc29sYXRlZCBXb3JrZXIgYm91bmRhcnkuIFNvIGl0IGlzIHRydXN0ZWQgY29kZSwgZXhhY3RseSBhcwppdCBpcyBpbiBTS1NFIG9yIEZvcmdlLCBhbmQgdGhlIGNvbnNlbnQgcHJvbXB0IGlzIHRoZSBib3VuZGFyeS4gSWYgeW91ciBtb2Qgb25seQpuZWVkcyB0byByZWFjdCB0byBldmVudHMgcmF0aGVyIHRoYW4gb3ZlcnJpZGUgc3lzdGVtcywgdGhlIHVudHJ1c3RlZCBXb3JrZXIgdGllcgpleGlzdHMgZm9yIHRoYXQgYW5kIG5lZWRzIG5vIHRydXN0IGF0IGFsbC4KCiMjIFRlc3RpbmcgeW91cnMKClBvaW50IHRoZSBnYW1lIGF0IHlvdXIgZm9sZGVyIGFuZCByZWFkIHRoZSBtb2QgbWFuYWdlcjogaXQgbGlzdHMgd2hhdCB3YXMgZm91bmQsCmFuZCBvbmUgbGluZSBwZXIgcGFjayBpdCBjb3VsZCBub3QgdXNlLiBgV2hlcmUgbW9kcyBjb21lIGZyb21gIG5hbWVzIHRoZSBleGFjdApkaXJlY3RvcnkuCgpUaGUgbG9hZGVyIGl0c2VsZiBpcyBjb3ZlcmVkIGJ5IGBwYWNrYWdlcy93ZWIvc3JjL21vZC1jb2RlLnRlc3QudHNgICh0aGUgZ2F0ZXMsCndpdGggdGhlIGltcG9ydGVyIGluamVjdGVkIHNvIGFuIGFic2VuY2Ugb2YgZXhlY3V0aW9uIGNhbiBiZSBhc3NlcnRlZCkgYW5kCmBtb2QtY29kZS5ub2RlLnRlc3QudHNgIChhIHJlYWwgZm9sZGVyIG9uIGRpc2ssIGEgcmVhbCBkeW5hbWljIGltcG9ydCwgYSByZWFsCmBNb2RIb29rc2AgY29taW5nIGJhY2sgb3V0KS4gVGhlIHNlY29uZCBpcyB0aGUgb25lIHdvcnRoIGNvcHlpbmcgaWYgeW91IHdhbnQgYQpoYXJuZXNzIG9mIHlvdXIgb3duLgo="
  },
  {
    "id": "api2",
    "path": "API2.md",
    "audience": "advanced",
    "title": "Mod API 2",
    "note": "The published plugin API: domains, results, events, hooks and storage.",
    "source": "sdk",
    "encoded": "IyBNb2QgQVBJIDIKCkFQSSAyIGlzIHRoZSBzZXQgb2YgY2FsbHMgYSBtb2QncyBjb2RlIGdldHMgZnJvbSB0aGUgZ2FtZTogd2hhdCBpdCBjYW4gcmVhZCwgd2hhdCBpdCBjYW4gZG8sIGFuZCB3aGF0IGl0IGhlYXJzLiBFdmVyeSBjYWxsIHJldHVybnMgcGxhaW4gZGF0YSwgYSBwZXJtaXNzaW9uIHRoZSBwbGF5ZXIgdHVybmVkIGRvd24gY29tZXMgYmFjayBhcyBhIHJlc3VsdCB5b3UgY2FuIGNoZWNrLCBhbmQgcmVhZHMgc2hvdyB0aGUgZ2FtZSBhcyB0aGUgcGxheWVyIGtub3dzIGl0LiBUaGUgdHlwZXMgYXJlIGluIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCwgYW5kIHRoZSBpbi1wcm9jZXNzIGhvc3QgaXMgaW4gdGhlIHdlYiBwYWNrYWdlIChgcGFja2FnZXMvd2ViL3NyYy9tb2QtYXBpMi1ob3N0LnRzYCkuCgpUaGUgbW9kIEFQSSBoYXMgaXRzIG93biB2ZXJzaW9uIG51bWJlciwgd2hpY2ggaXMgbm90IHRoZSBnYW1lJ3MuIFRoaXMgZ2FtZSBpbXBsZW1lbnRzIEFQSSAyLjEuMCwgYW5kIGEgbW9kJ3MgYGFwaWAgcmFuZ2UgaXMgY2hlY2tlZCBhZ2FpbnN0IHRoYXQgbnVtYmVyIGFsb25lLCBzbyBhIG5ldyBnYW1lIHZlcnNpb24gY2FuIHNoaXAgd2l0aCB0aGUgc2FtZSBBUEkuCgpTdGF0dXM6IHRoZSB0eXBlcywgdGhlIHZlcnNpb24gY2hlY2ssIHRoZSBpbi1wcm9jZXNzIGhvc3QsIHRoZSBXb3JrZXIgYnJva2VyIGFuZCB0aGUgZm9sZGVyIGxvYWRlciBhcmUgYnVpbHQuIFRoZSBsb2FkZXIgcnVucyBhbiBpbi1wcm9jZXNzIEFQSSAyIG1vZCB3cmFwcGVkIGFzIGEgcGx1Z2luIChgYXBpMlBsdWdpbmAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWFwaTItc2hpbS50c2ApLCBydW5zIGEgV29ya2VyIG1vZCB0aHJvdWdoIHRoZSBicm9rZXIgKHNlZSBJbiBhIFdvcmtlciksIGFuZCBydW5zIEFQSSAxIHBsdWdpbnMgdW5jaGFuZ2VkLgoKIyMgQSBtb2QgaW4gQVBJIDIKCkEgbW9kJ3MgY29kZSBkZWZhdWx0LWV4cG9ydHMgYSBkZWZpbml0aW9uOgoKYGBgdHMKaW1wb3J0IHsgZGVmaW5lQXBpMk1vZCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiOwoKZXhwb3J0IGRlZmF1bHQgZGVmaW5lQXBpMk1vZCh7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIGhvb2tzOiAoeyBmbGFncyB9KSA9PiAoewogICAgbWVzc2FnZVRleHQ6IChyYXcpID0+IChmbGFnc1sic2hvdXQiXSA/IHJhdy50b1VwcGVyQ2FzZSgpIDogcmF3KSwKICB9KSwKICBhc3luYyBzdGFydChtb2QpIHsKICAgIGNvbnN0IG1vbnN0ZXJzID0gYXdhaXQgbW9kLnZpZXcubW9uc3RlcnMoKTsKICAgIGlmICghbW9uc3RlcnMub2spIHsKICAgICAgbW9kLm1ldGEubG9nKGBubyBtb25zdGVyIGxpc3Q6ICR7bW9uc3RlcnMucmVhc29ufWApOwogICAgICByZXR1cm47CiAgICB9CiAgICBtb2QubWV0YS5sb2coYCR7bW9uc3RlcnMudmFsdWUubGVuZ3RofSBtb25zdGVycyBpbiBzaWdodGApOwogIH0sCn0pOwpgYGAKCmBob29rc2AgaXMgYXNrZWQgb25jZSB3aGVuIGNvbnRlbnQgY29tcG9zZXMgYW5kIGdldHMgb25seSB0aGUgbW9kJ3MgaWQgYW5kIGZsYWdzLiBgc3RhcnRgIHJ1bnMgd2hlbiB0aGUgZ2FtZSBpcyByZWFkeSBhbmQgZ2V0cyB0aGUgQVBJLiBgc3RvcGAgcnVucyBiZWZvcmUgdGhlIG1vZCBpcyB0YWtlbiBkb3duLCBgbWlncmF0ZUJhZyhkYXRhLCBmcm9tU2NoZW1hKWAgYnJpbmdzIHRoZSBtb2QncyBjaGFyYWN0ZXIgZGF0YSBmb3J3YXJkLCBhbmQgYHByZWZzYCBkZWNsYXJlcyBob3cgc3RvcmVkIHByZWZlcmVuY2VzIG1pZ3JhdGUgKHNlZSBTdG9yYWdlKS4KCmBjaGVja0FwaTJEZWZpbml0aW9uYCwgdGhlIGNoZWNrIGBhcGkyUGx1Z2luYCBydW5zLCByZWZ1c2VzIGEgZGVmaW5pdGlvbiB3aXRoIG5laXRoZXIgYGhvb2tzYCBub3IgYHN0YXJ0YCwgYSBtZW1iZXIgdGhhdCBpcyBub3QgYSBmdW5jdGlvbiwgYSBgcHJlZnMudmVyc2lvbmAgdGhhdCBpcyBub3QgYSB3aG9sZSBudW1iZXIgZnJvbSAxLCBhbmQgYW4gYGFwaWAgcmFuZ2UgdGhpcyBob3N0J3MgdmVyc2lvbiBkb2VzIG5vdCBzYXRpc2Z5LgoKIyMgVmVyc2lvbnMKCmBhcGlgIGlzIGEgc2VtdmVyIHJhbmdlIG92ZXIgdGhlIEFQSSdzIG93biB2ZXJzaW9uLCBgTU9EX0FQSTJfVkVSU0lPTmAgKG5vdyBgMi4xLjBgKS4gVGhlIGdhbWUncyB2ZXJzaW9uIGlzIGZvciBkaWFnbm9zdGljcyBvbmx5LiBUaGUgbWlub3IgbnVtYmVyIHJpc2VzIHdoZW4gdGhlIEFQSSBnYWlucyBhIGNhbGwuIFRoZSBtYWpvciBudW1iZXIgcmlzZXMgd2hlbiBhbiBleGlzdGluZyBjYWxsIGNoYW5nZXMgb3IgZ29lcyBhd2F5LCBzbyBgPj0yLjAuMCA8My4wLjBgIChgTU9EX0FQSTJfREVGQVVMVF9SQU5HRWApIGlzIHRoZSByYW5nZSB0byBkZWNsYXJlLgoKQSBsb2FkZXIgY2FsbHMgYGFwaVJhbmdlVmVyZGljdChyYW5nZSlgIGJlZm9yZSBpbXBvcnRpbmcgYW55IG1vZCBjb2RlLiBJdCByZXR1cm5zIGB7IG9rOiB0cnVlIH1gLCBvciBgb2s6IGZhbHNlYCB3aXRoIGEgYGNvZGVgIGFuZCBhIGB3aHlgIHNlbnRlbmNlIG5hbWluZyBib3RoIHZlcnNpb25zLiBUaGUgY29kZSBpcyBgbWFsZm9ybWVkYCB3aGVuIHRoZSByYW5nZSBpcyBtaXNzaW5nIG9yIGRvZXMgbm90IHBhcnNlLiBJdCBpcyBgdG9vLW5ld2Agd2hlbiBldmVyeSB2ZXJzaW9uIHRoZSByYW5nZSBuYW1lcyBoYXMgYSBoaWdoZXIgbWFqb3IgbnVtYmVyIHRoYW4gdGhpcyBnYW1lJ3MgQVBJLCBzbyB0aGUgbW9kIG5lZWRzIGEgbmV3ZXIgZ2FtZSwgYW5kIGB0b28tb2xkYCB3aGVuIGV2ZXJ5IG9uZSBoYXMgYSBsb3dlciBtYWpvciBudW1iZXIsIHNvIHRoZSBtb2QgbmVlZHMgYW4gdXBkYXRlLiBBbnkgb3RoZXIgbWlzcyBpcyBgb3V0c2lkZWAsIHN1Y2ggYXMgYD49Mi4yLjAgPDMuMC4wYCBvbiBhIGdhbWUgd2l0aCBBUEkgMi4xLjAuCgojIyBSZXN1bHRzCgpFdmVyeSBjYWxsIHJldHVybnMgYSBwcm9taXNlIG9mIGFuIGBBcGkyUmVzdWx0YC4gQ2hlY2sgYG9rYCBiZWZvcmUgdXNpbmcgYHZhbHVlYDoKCnwgYHJlYXNvbmAgfCBXaGVuIHwgRXh0cmEgZmllbGRzIHwKfCAtLS0gfCAtLS0gfCAtLS0gfAp8IChub25lLCBgb2s6IHRydWVgKSB8IFRoZSBjYWxsIHdvcmtlZC4gfCBgdmFsdWVgIHwKfCBgbm90LWdyYW50ZWRgIHwgVGhlIG1vZCBsYWNrcyB0aGUgcGVybWlzc2lvbiB0aGUgY2FsbCBuZWVkcy4gfCBgY2FwYWJpbGl0eWAsIHRoZSBzdHJpbmcgdG8gYXNrIGZvciwgYW5kIGBtZXNzYWdlYCB8CnwgYHVuYXZhaWxhYmxlYCB8IE5vdGhpbmcgdG8gYW5zd2VyIHlldDogbm8gZ2FtZSBydW5uaW5nLCBubyBjaGFyYWN0ZXIsIG9yIGEgZnJvbnQgZW5kIHdpdGhvdXQgdGhhdCBmZWF0dXJlLiB8IGBtZXNzYWdlYCB8CnwgYHJlZnVzZWRgIHwgVGhlIGdhbWUgdHVybmVkIHRoZSByZXF1ZXN0IGRvd246IGEgc3RhbGUgaW5wdXQgdG9rZW4sIGEga2V5IGFscmVhZHkgYm91bmQsIGEgcmVjb3JkIHRoYXQgZG9lcyBub3QgZXhpc3QuIHwgYGNvZGVgLCBgbWVzc2FnZWAgfAoKQSBjYWxsIG5ldmVyIHRocm93cyBmb3IgYSBtaXNzaW5nIHBlcm1pc3Npb24uIGBpc05vdEdyYW50ZWQocmVzdWx0KWAgdGVsbHMgYSBtaXNzaW5nIHBlcm1pc3Npb24gYXBhcnQgZnJvbSB0aGUgb3RoZXIgZmFpbHVyZXMsIGFuZCBgbW9kLm1ldGEuZ3JhbnRlZChjYXBhYmlsaXR5KWAgYW5zd2VycyB3aXRob3V0IG1ha2luZyBhIGNhbGwuIFBlcm1pc3Npb25zIHVzZSB0aGUgc2FtZSBzdHJpbmdzIGFzIEFQSSAxIChgc3RhdGU6bW9uc3RlcnMucmVhZGAsIGBpbnB1dDppbnRlbnRgLCBgZXZlbnQ6bWVzc2FnZWApLCB0eXBlZCBhcyBgQXBpMkNhcGFiaWxpdHlgLiBBIGZhdWx0IGluc2lkZSB0aGUgaG9zdCB0aGF0IGlzIG5vdCBhIHBlcm1pc3Npb24gY2hlY2sgc3RpbGwgcmVqZWN0cyB0aGUgcHJvbWlzZSwgYXMgaXQgd291bGQgaW4gQVBJIDEuCgojIyBUaGUgZG9tYWlucwoKfCBEb21haW4gfCBXaGF0IGl0IGhvbGRzIHwgUGVybWlzc2lvbiB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgbWV0YWAgfCBUaGUgbW9kJ3MgYGlkYCwgYGZsYWdzYCwgYW5kIGB0aWVyYCwgdGhlIEFQSSBhbmQgZ2FtZSB2ZXJzaW9ucyAoYGFwaWAsIGBlbmdpbmVgKSwgYG5ld0NoYXJhY3RlcmAsIGBncmFudGVkKGNhcGFiaWxpdHkpYCwgYGxvZ2AsIHRoZSBtb2QncyBudW1lcmljIHNldHRpbmdzIChgc2V0dGluZ3NgLCBgc2V0U2V0dGluZ2ApLCBhbmQgdGhlIGxpc3Qgb2YgZW5hYmxlZCBtb2RzIChgbW9kc2ApLiB8IE5vbmUgfAp8IGB2aWV3YCB8IFdoYXQgdGhlIHBsYXllciBrbm93cyBvZiB0aGUgd29ybGQ6IGB3b3JsZCgpYCwgYHBsYXllcigpYCwgYG1vbnN0ZXJzKClgLCBgbGV2ZWwoKWAsIGBpbnB1dCgpYCwgYW5kIGBpc0N1cnJlbnQodG9rZW4pYC4gfCBgd29ybGQoKWAgYW5kIGBpc0N1cnJlbnRgIG5lZWQgbm9uZS4gRWFjaCBvdGhlciBwYXJ0IG5lZWRzIGl0cyBvd24gZ3JhbnQgKGBzdGF0ZTpwbGF5ZXIucmVhZGAsIGBzdGF0ZTptb25zdGVycy5yZWFkYCwgYHN0YXRlOm1hcC5yZWFkYCwgb3IgYHN0YXRlOmludGVyYWN0aW9uLnJlYWRgKSwgb3IgYHN0YXRlOioucmVhZGAgY292ZXJzIHRoZW0gYWxsLiB8CnwgYGFjdGAgfCBgc3VibWl0KHRva2VuLCBpbnRlbnQpYCwgYGFuc3dlcihwcm9tcHRJZCwgYW5zd2VyKWAsIGFuZCBgY29udHJvbGxlcmAsIHdoaWNoIHdvcmtzIG9ubHkgd2hpbGUgdGhlIG1vZCBob2xkcyB0aGUga2V5Ym9hcmQuIHwgYGlucHV0OmludGVudGAgYW5kIGBpbnB1dDpwcm9tcHQucmVwbHlgLiBgY29udHJvbGxlcmAgbmVlZHMgYGlucHV0OmNvbnRyb2xsZXJgIGFuZCBgc3RhdGU6aW50ZXJhY3Rpb24ucmVhZGAgb24gdG9wIG9mIGBpbnB1dDppbnRlbnRgLiBgb25LZXlgIG5lZWRzIGBpbnB1dDpvYnNlcnZlYC4gfAp8IGBldmVudHNgIHwgYG9uKG5hbWUsIGxpc3RlbmVyKWAgc3Vic2NyaWJlcyBhbmQgYG9mZihzdWJzY3JpcHRpb24pYCB1bnN1YnNjcmliZXMuIHwgYGV2ZW50OjxuYW1lPmAgfAp8IGBob29rc2AgfCBgYXZhaWxhYmxlYCBsaXN0cyB0aGUgaG9va3MgdGhpcyBnYW1lIHJ1bnMsIGFuZCBgYWN0aXZlYCBsaXN0cyB0aGUgb25lcyB0aGlzIG1vZCBkZWNsYXJlZC4gfCBOb25lIHwKfCBgY29udGVudGAgfCBUaGUgbW9kJ3Mgb3duIGZpbGVzIChgb3duYCwgYGFzc2V0YCksIHRoZSBydW5uaW5nIGdhbWUncyByZWNvcmRzIChgcmVjb3JkcyhmaWxlKWApLCBhbmQgYGxvb2t1cCh7IGZpbGUsIGtleSB9KWAsIHdoaWNoIGZpbmRzIGEgcmVjb3JkIGJ5IHRoZSBrZXkgYHJlY29yZEtleWAgZGVyaXZlcy4gfCBOb25lIHwKfCBgdWlgIHwgUGFuZWxzIHRoZSBob3N0IGRyYXdzIChgbW91bnRgLCBgcGF0Y2hgKSBhbmQgdGhlIG1vZCdzIGtleSBiaW5kaW5ncyAoYGtleXNgKS4gfCBgdWk6cGFuZWwubW91bnRgLCBga2V5bWFwOndyaXRlYCB8CnwgYHN0b3JlYCB8IGBwcmVmc2AsIHN0b3JlZCBvdXRzaWRlIGFueSBjaGFyYWN0ZXIsIGFuZCBgY2hhcmFjdGVyYCwgc3RvcmVkIGluIHRoZSBjdXJyZW50IGNoYXJhY3RlcidzIHNhdmUuIHwgTm9uZSB8CnwgYG5ldGAgfCBSZXF1ZXN0cyB0byB0aGUgaG9zdHMgdGhlIG1hbmlmZXN0IG5hbWVzLCB3aXRoIGNyZWRlbnRpYWxzIHBhc3NlZCBieSByZWZlcmVuY2UuIFRoZSBkb21haW4gZXhpc3RzIG9ubHkgd2hlbiB0aGUgbWFuaWZlc3QgYXNrcyBmb3IgYSBgbmV0d29yazpgIHBlcm1pc3Npb24uIHwgYG5ldHdvcms6PGhvc3Q+YCB8CnwgYG1hbmFnZWAgfCBGb3IgV29ya2VycywgaG9zdC1jb25maXJtZWQgb3BlcmF0aW9ucyBvbiBwcm9maWxlcywgc2F2ZXMsIG9wdGlvbnMsIGNoYXJhY3RlcnMsIGNvbnRlbnQsIGFuZCByZXBvc2l0b3JpZXMsIHBsdXMgZGV0YWNoZWQgd2l6YXJkIG9wZXJhdGlvbnMuIEZpcnN0LXBhcnR5IGluLXByb2Nlc3MgbW9kcyBnZXQgYnJvYWRlciBsZWdhY3kgbWFuYWdlbWVudC4gfCBgcHJvZmlsZXM6bWFuYWdlYCwgYHNlc3Npb246Y29udHJvbGAsIGBvcHRpb25zOm1hbmFnZWAsIGBzYXZlczptYW5hZ2VgLCBgbW9kOmluc3RhbGxgLCBgbW9kOnNlc3Npb25gLCBgbW9kOnJlYWRgLCBgZGVidWc6d2l6YXJkYCB8CnwgYHRydXRoYCB8IEV2ZXJ5IG1vbnN0ZXIgYW5kIHRoZSBhY3R1YWwgbWFwLCBvcGVuIHRvIGFueSBpbi1wcm9jZXNzIG1vZCBhbmQgdG8gYSBXb3JrZXIgdGhlIHBsYXllciBhbGxvd3MuIHwgYHN0YXRlOm1hcC1hY3R1YWwucmVhZGAsIG9yIGBzdGF0ZTptb25zdGVycy1hY3R1YWwucmVhZGAgZm9yIG1vbnN0ZXJzIGFuZCByYWNlcyBvbmx5IHwKCiMjIyBXaGF0IGB2aWV3YCBzaG93cwoKYHZpZXdgIGlzIGJ1aWx0IGZyb20gY29yZSdzIGtub3duIHdvcmxkIChgYnVpbGRLbm93bldvcmxkYCk6IHRoZSBtb25zdGVycyB0aGUgcGxheWVyIHBlcmNlaXZlcywgd2l0aCBoZWFsdGggYXMgdGhlIGxvb2sgY29tbWFuZCB3b3JkcyBpdCwgdGhlIGFiaWxpdGllcyB0aGUgcGxheWVyIGhhcyBsZWFybmVkLCB0aGUgbWFwIGFzIHRoZSBwbGF5ZXIgcmVtZW1iZXJzIGl0LCBhbmQgaXRlbXMgYXMgZmFyIGFzIHRoZSBwbGF5ZXIgaGFzIGlkZW50aWZpZWQgdGhlbS4gQSBtb25zdGVyIHRoZSBwbGF5ZXIgY2Fubm90IHNlZSBpcyBub3QgaW4gYW55IHBhcnQgb2YgaXQsIGFuZCBjaGFuZ2luZyB0aGF0IG1vbnN0ZXIgY2hhbmdlcyBub3RoaW5nIGEgbW9kIGNhbiByZWFkLiBBIG1pbWljIHRoZSBwbGF5ZXIgdGFrZXMgZm9yIGFuIG9iamVjdCBpcyBub3QgbGlzdGVkIGFzIGEgbW9uc3RlciwgYW5kIHdoaWxlIHRoZSBwbGF5ZXIgaGFsbHVjaW5hdGVzIGBtb25zdGVyc2AgaXMgZW1wdHkgYW5kIGBtb25zdGVyc0hpZGRlbmAgaXMgYCJoYWxsdWNpbmF0aW5nImAuIEEgbW9uc3RlcidzIGBpZGAgaXMgYSBoYW5kbGUgZ2l2ZW4gb3V0IG9uIGVhY2ggbGV2ZWwgaW4gdGhlIG9yZGVyIHRoZSBwbGF5ZXIgZmlyc3QgcGVyY2VpdmVzIG1vbnN0ZXJzIHRoZXJlLCBub3QgdGhlIGdhbWUncyBtb25zdGVyIGluZGV4LCBhbmQgdGhlIGxpc3QgcnVucyBuZWFyZXN0IGZpcnN0LiBUaW1lZCBlZmZlY3RzIHNob3cgdGhlIGdyYWRlIG5hbWUgdGhlIHN0YXR1cyBsaW5lIHByaW50cywgYSByZWNhbGwgb3IgZGVlcCBkZXNjZW50IHNob3dzIG9ubHkgdGhhdCBpdCBpcyBhY3RpdmUsIGEgcmVjaGFyZ2luZyBpdGVtIHNob3dzIHRoZSBjb3VudCBpdHMgbmFtZSBnaXZlcyAoYGNoYXJnaW5nYCksIGB1bmtub3duUnVuZXNgIGlzIHRoZSBuYW1lJ3MgYHs/P31gLCBhbmQgYSByZW1lbWJlcmVkIHRyYXAgc3RheXMgYXMgdGhlIHBsYXllciBsYXN0IHNhdyBpdC4gYHdvcmxkKClgIHJldHVybnMgZXZlcnkgcGFydCBhdCBvbmNlLCB3aXRoIGBudWxsYCBmb3IgZWFjaCBwYXJ0IHRoZSBtb2QgaGFzIG5vIHBlcm1pc3Npb24gZm9yLiBUaGUgc2luZ2xlLXBhcnQgY2FsbHMgYW5zd2VyIGBub3QtZ3JhbnRlZGAgaW5zdGVhZC4gYHdvcmxkKCkudHVybmAgaXMgdGhlIGdhbWUgdHVybiBjb3VudGVyIGFuZCBpcyBgbnVsbGAgd2l0aG91dCBgc3RhdGU6dHVybi5yZWFkYCAob3IgYHN0YXRlOioucmVhZGApLiBJdCBtb3ZlcyBvbmx5IHdoZW4gZ2FtZSB0aW1lIHBhc3Nlcywgc28gYSBjb21tYW5kIHRoYXQgc3BlbnQgbm8gdGltZSBsZWF2ZXMgaXQgd2hlcmUgaXQgd2FzLgoKRWFjaCB2YWx1ZSBjYXJyaWVzIGEgYHRva2VuYCBuYW1pbmcgdGhlIGlucHV0IHdhaXQgaXQgd2FzIHJlYWQgYXQuIGBhY3Quc3VibWl0YCB0YWtlcyB0aGF0IHRva2VuLCBhbmQgYSB0b2tlbiBmcm9tIGFuIG9sZGVyIHdhaXQgY29tZXMgYmFjayBgcmVmdXNlZGAuIGBpc0N1cnJlbnQodG9rZW4pYCBzYXlzIHdoZXRoZXIgdGhhdCB3YWl0IGlzIHN0aWxsIHRoZSBjdXJyZW50IG9uZS4gQSBgdGFyZ2V0YCBpbnRlbnQgbmFtZXMgaXRzIG1vbnN0ZXIgYnkgdGhlIGBpZGAgdGhlIHZpZXcgZ2F2ZSBpdDsgYW4gaWQgZm9yIGEgbW9uc3RlciB0aGUgcGxheWVyIGRvZXMgbm90IHBlcmNlaXZlIG5vdyBpcyByZWZ1c2VkIGxpa2UgYW55IG1vbnN0ZXIgdGhhdCBjYW5ub3QgYmUgdGFyZ2V0ZWQuCgpBIG1vbnN0ZXIncyBgdmlzaWJsZWAgbWVhbnMgZXllc2lnaHQ6IGJsaW5kbmVzcywgZGFya25lc3MgYW5kIGludmlzaWJpbGl0eSBjYW4gbGVhdmUgYSBzZW5zZWQgbW9uc3RlciBsaXN0ZWQgd2l0aCBgdmlzaWJsZTogZmFsc2VgOyBpbmZyYXZpc2lvbiBhbmQgc2VlLWludmlzaWJsZSBjb3VudCB3aGVuIHRoZXkgbGV0IHRoZSBwbGF5ZXIgc2VlIGl0LiBBIHN0YXRpb25hcnkgbW9uc3RlciBmaXJzdCBwZXJjZWl2ZWQgZHVyaW5nIGhhbGx1Y2luYXRpb24gcmVjZWl2ZXMgaXRzIHNpZ2h0aW5nIG5vdGlmaWNhdGlvbiB3aGVuIHRoZSBoYWxsdWNpbmF0aW9uIGNsZWFycy4gUmVtZW1iZXJlZCBpdGVtIGF1cmFzIHVzZSB0aGUgbGFzdCBvYnNlcnZlZCBvYmplY3QgcHJvcGVydGllcyBhbmQgdGhlIHBsYXllcidzIGN1cnJlbnQgcnVuZSBrbm93bGVkZ2UsIGFuZCByZW1lbWJlcmVkIHRyYXBzIGluY2x1ZGUgb25seSB0aGUgdHJhcHMgdGhlIHBsYXllciBwZXJjZWl2ZWQuCgpTaG9wIHZpc2l0cyBhbmQgc2hvcCBrbm93bGVkZ2Ugc2NyZWVucyByZWNvcmQgc3RvY2sgYW5kIG93bmVyIG9ic2VydmF0aW9ucywgYW5kIGtub3duLXdvcmxkIHJlYWRzIGF0IGEgc2hvcCdzIGVudHJhbmNlIHJlZnJlc2ggdGhhdCBzaG9wLiBPdGhlciBzaG9wcyByZXRhaW4gdGhlaXIgbGFzdCBvYnNlcnZhdGlvbnMgZm9yIHRoZSBzZXNzaW9uLCBvciByZXR1cm4gZW1wdHkgc3RvY2sgYW5kIGFuIHVubmFtZWQgb3duZXIgaWYgdGhleSBoYXZlIG5vdCBiZWVuIGluc3BlY3RlZC4gTG9hZGluZyBhIGdhbWUgc3RhcnRzIHdpdGggdW5rbm93biBzaG9wIG9ic2VydmF0aW9ucy4gQSBob3N0IHRoYXQgZHJhd3MgYSBzaG9wIHNjcmVlbiBjYWxscyBgb2JzZXJ2ZUtub3duU3RvcmUoc3RhdGUsIHN0b3JlKWAgdG8gcmVjb3JkIHRoZSBzdG9jayBpdCBzaG93cy4KCkZvdXIgYWRkaXRpb25zIHRvIGB2aWV3YCBhcnJpdmUgaW4gbW9kIEFQSSAyLjEuMCwgYW5kIHRoZSBnYW1lIGFscmVhZHkgcmVwb3J0cyB0aGF0IHZlcnNpb24sIHNvIGEgbW9kIHRoYXQgcmVsaWVzIG9uIGFueSBvZiB0aGVtIGRlY2xhcmVzICI+PTIuMS4wIDwzLjAuMCIuIEEgcmVhZCBzdWNoIGFzIGB2aWV3LnBsYXllcigpYCBvciBgdmlldy5tb25zdGVycygpYCBidWlsZHMgaXRzIG9iamVjdCBvbmNlIHBlciB3YWl0IGZvciBpbnB1dCBhbmQgaGFuZHMgdGhlIHNhbWUgZnJvemVuIG9iamVjdCBiYWNrIHRvIGV2ZXJ5IGxhdGVyIHJlYWQgYXQgdGhhdCB3YWl0LCBzbyBhIG1vZCBjYW4gcmVhZCBhcyBvZnRlbiBhcyBpdCBsaWtlcyB3aXRob3V0IHBheWluZyBmb3IgYSBmcmVzaCBjb3B5LiBUaGUgZ2FtZSBidWlsZHMgYSBuZXcgb2JqZWN0IGFmdGVyIGl0IHRha2VzIGEgdHVybiwgY2hhbmdlcyBsZXZlbCwgb3Igc2V0cyBhIHRhcmdldCwgYW5kIGl0IGFsd2F5cyBidWlsZHMgZnJlc2ggZm9yIGEgcmVhZCBtYWRlIHdoaWxlIGEgZ2FtZSBldmVudCBpcyBiZWluZyBkZWxpdmVyZWQuIFRoZSBrbm93biBwbGF5ZXIncyBgc3RhdHVzYCBoYXMgYSBgY291bnRkb3duYCBudW1iZXIgdGhhdCBnb2VzIHVwIGJ5IG9uZSBlYWNoIHRpbWUgdGhlIGdhbWUgY291bnRzIGFueSB0aW1lZCBlZmZlY3QgZG93biwgb25jZSBwZXIgd29ybGQgdGljayB3aGlsZSBhbnkgZWZmZWN0IGlzIHJ1bm5pbmcgb3V0LiBJZiB0d28gcmVhZHMgc2hvdyB0aGUgc2FtZSBgY291bnRkb3duYCBhbmQgdGhlIHNhbWUgZ3JhZGVzLCBub3RoaW5nIGhhcyBjb3VudGVkIGRvd24gYmV0d2VlbiB0aGVtLCBhbmQgYSBzdGFsbCBjaGVjayBjYW4gdXNlIHRoYXQgdG8gdGVsbCB3YWl0aW5nIG91dCBhbiBlZmZlY3QgZnJvbSBiZWluZyBzdHVjay4gVGhlIG51bWJlciBkb2VzIG5vdCBzYXkgaG93IG1hbnkgdHVybnMgYW55IGVmZmVjdCBoYXMgbGVmdC4gSXQgc3RhcnRzIGF0IDAgZWFjaCBzZXNzaW9uIGFuZCBpcyBub3Qgc2F2ZWQuIEVhY2gga25vd24gaXRlbSB0aGF0IGlzIGNhcnJpZWQsIHdvcm4sIGluIHRoZSBxdWl2ZXIsIG9uIHRoZSBmbG9vciwgb3IgaW4gdGhlIGhvbWUgaGFzIGFuIGBvYmplY3RJZGAgdGhhdCBuYW1lcyB0aGUgb2JqZWN0IGZyb20gdGhlIGZpcnN0IHJlYWQgdGhhdCBzaG93cyBpdCB1bnRpbCB0aGUgc2Vzc2lvbiBlbmRzLiBUaGUgaWQgc3RheXMgdGhlIHNhbWUgdGhyb3VnaCBhIHBpY2t1cCwgYSBkcm9wLCBhbmQgYSB0cmlwIHRvIGFub3RoZXIgbGV2ZWwsIGFuZCBhIGZsb29yIGl0ZW0gcmVhZCB3aGlsZSBpbiB2aWV3IGtlZXBzIGl0cyBpZCBhZnRlciBpdCBmYWxscyBvdXQgb2Ygdmlldy4gQSBtb2QgY2FuIG1hdGNoIHRoZSBzdGFjayBpdCBkcm9wcGVkIHRvIHRoZSBzdGFjayBhdCBpdHMgZmVldCB3aXRoIHRoaXMgaWQsIHdoZXJlIGBpdGVtS2V5YCBmYWlscyBiZWNhdXNlIGEgY2FycmllZCBpdGVtJ3MgYGdlYXI6YCBrZXkgYmVjb21lcyBhIHBvc2l0aW9uLWJhc2VkIGBtZW1vcnk6YCBrZXkgb24gdGhlIGZsb29yLiBEcm9wcGluZyBwYXJ0IG9mIGEgc3RhY2sgZ2l2ZXMgdGhlIGRyb3BwZWQgcGFydCBpdHMgb3duIGlkLiBTaG9wIHdhcmVzIGhhdmUgbm8gYG9iamVjdElkYCwgYW5kIGEgcmVsb2FkZWQgZ2FtZSBoYW5kcyBvdXQgbmV3IGlkcy4gQ2hlc3RzIGFyZSB0aGUgb25seSBpdGVtcyB3aXRoIGB0cmFwS25vd25gLiBPbmNlIGl0IGlzIHRydWUsIGBwdmFsYCBob2xkcyB0aGUgc3RyZW5ndGggb2YgdGhlIGNoZXN0J3MgdHJhcCBhbmQgMCBtZWFucyB0aGUgY2hlc3QgaGFzIG5vIHRyYXAuIFdoaWxlIGl0IGlzIGZhbHNlLCBgcHZhbGAgcmVhZHMgMCB3aGV0aGVyIG9yIG5vdCB0aGUgY2hlc3QgaXMgdHJhcHBlZCwgc28gYSBtb2Qgc2hvdWxkIG9wZW4gdGhlIGNoZXN0IG9yIHNlYXJjaCBpdCBmaXJzdC4gVGhlIGtub3duIHBsYXllciBhbHNvIGhhcyBgc2xhaW5VbmlxdWVzYCwgYSBsaXN0IG9mIGB7IHJhY2VJbmRleCwgcmFjZUlkLCBuYW1lIH1gIGVudHJpZXMgaW4gcmFjZSBvcmRlciwgb25lIGZvciBlYWNoIHVuaXF1ZSB0aGUgY2hhcmFjdGVyIGhhcyBraWxsZWQsIHdpdGggYHJhY2VJZGAgcHJlc2VudCB3aGVuIHRoZSByYWNlIGhhcyBhIG5hbWVzcGFjZWQgaWQuIFRoZSBsaXN0IGNvbWVzIGZyb20gdGhlIGNoYXJhY3RlcidzIG93biBraWxsIHJlY29yZCwgdGhlIHNhbWUgcmVjb3JkIHRoZSBrbm93bGVkZ2UgbWVudSBzaG93cy4gQSB1bmlxdWUga2lsbGVkIGJ5IGFueXRoaW5nIGVsc2UsIG9yIGtpbGxlZCBiZWZvcmUgdGhlIGNoYXJhY3RlciB3YXMgc3RhcnRlZCwgZG9lcyBub3QgYXBwZWFyLCBhbmQgdGhlIGxpc3QgZ2l2ZXMgbm8ga2lsbCBjb3VudC4gVG8gY2hlY2sgd2hldGhlciBTYXVyb24gaXMgZGVhZCwgYSBtb2QgbG9va3MgZm9yIGhpcyByYWNlIGluIGBzbGFpblVuaXF1ZXNgLgojIyMgVGhlIGNvbnRyb2xsZXIKCmBhY3QuY29udHJvbGxlcmAgaGFzIGBvd25zKClgLCBgc2V0U3RhdHVzKHN0YXR1cylgLCBgbWFya05vbmRldGVybWluaXN0aWMoKWAsIGFuZCBgcmVsZWFzZShyZWFzb24pYC4gRXZlcnkgY2FsbCBleGNlcHQgYG93bnMoKWAgcmV0dXJucyBgcmVmdXNlZGAgd2l0aCB0aGUgY29kZSBgbm90LW93bmVyYCB1bmxlc3MgdGhlIG1vZCBob2xkcyB0aGUga2V5Ym9hcmQuIEFuIEFQSSAyIGRlZmluaXRpb24gdGFrZXMgdGhlIGtleWJvYXJkIHdpdGggaXRzIGBjb250cm9sbGVyYCBtZW1iZXIsIHdoaWNoIG5lZWRzIGBpbnB1dDpjb250cm9sbGVyYCBhbmQgYHN0YXRlOmludGVyYWN0aW9uLnJlYWRgIGluIHRoZSBtYW5pZmVzdCBhbG9uZyB3aXRoIGBpbnB1dDppbnRlbnRgLiBPbmUgY29udHJvbGxlciBob2xkcyB0aGUga2V5Ym9hcmQgYXQgYSB0aW1lLiBgb25LZXlgIHJlY2VpdmVzIGVhY2gga2V5IHRoZSBwbGF5ZXIgcHJlc3NlcyB3aGlsZSB0aGUgbW9kIGhvbGRzIHRoZSBrZXlib2FyZCBhbmQgcmV0dXJucyBgeyBraW5kOiAia2VlcCIgfWAgb3IgYHsga2luZDogInJlbGVhc2UiIH1gLCBhbmQgaXQgbmVlZHMgYGlucHV0Om9ic2VydmVgLiBBbnN3ZXJpbmcgcHJvbXB0cyBuZWVkcyBgaW5wdXQ6cHJvbXB0LnJlcGx5YC4gYG9uRGVhdGg6ICJlbmQiYCBsZXRzIGFuIG9yZGluYXJ5IGRlYXRoIGVuZCB0aGUgcnVuIGluc3RlYWQgb2Ygc3RhcnRpbmcgdGhlIG5leHQgY2hhcmFjdGVyLgoKQSBjb250cm9sbGVyIGNhbiBhY3QgaW4gYW4gb3BlbiBzdG9yZS4gVGhlIGhvc3QgYXNrcyBpdCBmb3IgYSBkZWNpc2lvbiBhdCBwaGFzZSBgc3RvcmVgIGFuZCBwYXNzZXMgdGhlIGBzaG9wLWJ1eWAsIGBzaG9wLXNlbGxgIG9yIGBzaG9wLWV4aXRgIGludGVudCBpdCByZXR1cm5zIHRvIHRoZSBzaG9wIHNjcmVlbi4KCiMjIyBQYW5lbHMKCmB1aS5tb3VudGAgdXNlcyB0aGUgc2FtZSBwYW5lbCBncmFtbWFyIGFzIFdvcmtlciBtb2RzOiBgdGV4dGAsIGBidXR0b25gLCBgcm93YCwgYW5kIGBjb2x1bW5gIG5vZGVzIHVuZGVyIGEgcGFuZWwgYGlkYC4gVGhlIHBhbmVsIGBpZGAgYW5kIGVhY2ggYnV0dG9uJ3MgYGFjdGlvbmAgdXNlIGxvd2VyLWNhc2UgbGV0dGVycywgZGlnaXRzLCBhbmQgaHlwaGVucywgc3RhcnQgd2l0aCBhIGxldHRlciwgYW5kIGFyZSBhdCBtb3N0IDY0IGNoYXJhY3RlcnMgbG9uZy4gQSB0ZXh0IG5vZGUgaG9sZHMgdXAgdG8gNDA5NiBjaGFyYWN0ZXJzLCBhIHJvdyBvciBjb2x1bW4gdGFrZXMgdXAgdG8gMzIgY2hpbGRyZW4sIGFuZCB0aGUgdHJlZSBuZXN0cyBhdCBtb3N0IDE2IGRlZXAuIFRoZSBob3N0IGRyYXdzIHRoZSBwYW5lbCBhbmQgcGFzc2VzIHRoZSBgYWN0aW9uYCBvZiBlYWNoIGJ1dHRvbiB0aGUgcGxheWVyIHVzZXMgdG8gYG9uQWN0aW9uYC4gYHVpLnBhdGNoYCByZXBsYWNlcyB0aGUgdGl0bGUsIHRoZSB0cmVlLCBvciBgdmlzaWJsZWAsIGFuZCBhIGBudWxsYCB0aXRsZSByZW1vdmVzIHRoZSB0aXRsZS4gTW91bnRpbmcgYSBwYW5lbCBvdXRzaWRlIHRoZSBncmFtbWFyIG9yIHVuZGVyIGFuIGlkIHRoYXQgaXMgYWxyZWFkeSBtb3VudGVkLCBvciBwYXRjaGluZyBhIHBhbmVsIHRoYXQgaXMgbm90IG1vdW50ZWQsIHJldHVybnMgYHJlZnVzZWRgIHdpdGggdGhlIGNvZGUgYGJhZC1wYW5lbGAuIEFuIEFQSSAyIG1vZCBnZXRzIG5vIERPTSBlbGVtZW50LiBUbyBhZGQgYSByb3cgdG8gdGhlIGdhbWUgbWVudSwgY2FsbCBgdWkuZ2FtZU1lbnUucmVnaXN0ZXIoYWN0aW9uLCBsYWJlbCwgcnVuKWAgd2l0aCBgdWk6bWVudS5yb3dgLiBJbi1wcm9jZXNzIGNvZGUgY2FuIGFsc28gdXNlIGByZWdpc3RyeTptZW51YCwgd2hpbGUgYSBXb3JrZXIgbmVlZHMgYHVpOm1lbnUucm93YCBmb3IgdGhpcyBjYWxsYmFjay4gUGFnZXMgb3BlbmVkIHdpdGggYHVpLm92ZXJsYXlgIG9yIGB1aS5tb3VudFBhZ2VgIGFsd2F5cyBzaG93IHRoZSBob3N0J3MgY2xvc2UgY29udHJvbCwgaW4gdGhlIHRvcCByaWdodCB1bmxlc3MgdGhlIHBhZ2Ugc2V0cyBgY2xvc2VBdGAgdG8gYHRvcC1sZWZ0YCwgYGJvdHRvbS1yaWdodGAsIG9yIGBib3R0b20tbGVmdGAgdG8ga2VlcCBpdCBjbGVhciBvZiB0aGUgcGFnZSdzIG93biBoZWFkZXIgYnV0dG9ucy4KCmB1aS5jb21tYW5kcy5yZWdpc3RlcihpZCwgdmVyYiwgcnVuLCBvcHRpb25zPylgIHJlZ2lzdGVycyBhIGNvbW1hbmQgYSBib3VuZCBrZXkgb3IgdGhlIGNvbW1hbmQgbWVudSBjYW4gcnVuLiBQYXNzIGB7IGRpcmVjdGlvbjogdHJ1ZSB9YCBhbmQgdGhlIGdhbWUgYXNrcyBmb3IgYSBkaXJlY3Rpb24gZmlyc3QsIHdpdGggdGhlIHByb21wdCB0aGUgb3BlbiwgY2xvc2UgYW5kIHR1bm5lbCBjb21tYW5kcyB1c2U7IGBydW5gIHJlY2VpdmVzIGB7IGRpciB9YCB3aXRoIHRoZSBrZXlwYWQgZGlnaXQgMSB0byA5LCBhbmQgRXNjYXBlIHJ1bnMgbm90aGluZy4gQSBrZXkgYm91bmQgd2l0aCBgdWkua2V5cy5iaW5kYCB0byBzdWNoIGEgY29tbWFuZCdzIGlkIHJlYWNoZXMgaXQgdGhhdCB3YXksIHNvIGEgY29tbWFuZCB0aGF0IG5lZWRzIGEgZGlyZWN0aW9uLCBzdWNoIGFzIHNwaWtpbmcgYSBkb29yLCBoYXMgYSBrZXkuIFdpdGhvdXQgdGhlIG9wdGlvbiBgcnVuYCByZWNlaXZlcyBubyBkaXJlY3Rpb24uIFBhc3MgYHsgdHVybjogdHJ1ZSB9YCBhcyB3ZWxsIGFuZCB0aGUga2V5IHJ1bnMgdGhlIGNvbW1hbmQgaW5zaWRlIHRoZSBwbGF5ZXIncyB0dXJuOiBgcnVuYCByZXR1cm5zIGB7IGVuZXJneSB9YCAoMCB0byAxMDAwLCAxMDAgaXMgb25lIHN0YW5kYXJkIHR1cm4pIGFuZCB0aGUgZ2FtZSBzcGVuZHMgaXQsIHNvIHRoZSBtb25zdGVycyBhbnN3ZXIuIFdpdGhvdXQgYHR1cm5gIHRoZSByZXR1cm4gdmFsdWUgaXMgaWdub3JlZCBhbmQgdGhlIGNvbW1hbmQgY29zdHMgbm90aGluZy4KCiMjIyBUaXRsZSBzY3JlZW4gcm93cwoKQSBmaXJzdC1wYXJ0eSBtb2Qgd2l0aCBgdWk6dGl0bGVgIGFkZHMgYSByb3cgdG8gdGhlIHRpdGxlIHNjcmVlbiB3aXRoIGB1aS50aXRsZS5yZWdpc3RlclJvdyh7IGlkLCBsYWJlbCwgcnVuIH0pYCBhbmQgcmVtb3ZlcyBpdCB3aXRoIGB1aS50aXRsZS5yZW1vdmVSb3dgLiBUaGUgYGlkYCB1c2VzIHRoZSBzYW1lIGZvcm1hdCBhcyBhIHBhbmVsIGBpZGA6IGxvd2VyLWNhc2UgbGV0dGVycywgZGlnaXRzIGFuZCBoeXBoZW5zLCBhIGxldHRlciBmaXJzdCwgNjQgY2hhcmFjdGVycyBhdCBtb3N0LCBhbmQgZnJlZSBhbW9uZyB0aGUgbW9kJ3Mgb3duIHJvd3MuIEFuIGlkIG91dHNpZGUgdGhlIGZvcm1hdCwgc3VjaCBhcyBgc3F1aXJlOm5ldy1jaGFyYWN0ZXJgLCBvciBvbmUgYWxyZWFkeSBpbiB1c2UgY29tZXMgYmFjayBgcmVmdXNlZGAgd2l0aCB0aGUgY29kZSBgYmFkLXRpdGxlLXJvd2AuIFRoZSByZXN1bHQgaXMgdGhlIG9ubHkgc2lnbiwgc2luY2Ugbm90aGluZyBpcyBsb2dnZWQgYW5kIG5vIHJvdyBhcHBlYXJzLCBzbyBhIG1vZCBjaGVja3MgaXQuIGBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIGZsYWdzIGEgbGl0ZXJhbCBpZCBvdXRzaWRlIHRoZSBmb3JtYXQgYXMgYGNoZWNrcy90aXRsZS1yb3ctaWRgLgoKIyMjIE1vZCBsb2dzCgpgbW9kLm1ldGEubG9nKG1lc3NhZ2UpYCB3cml0ZXMgYW4gYGluZm9gIGxpbmUgb24gdGhlIGNoYW5uZWwgYG1vZDo8aWQ+YCBpbiB0aGUgZ2FtZSdzIGxvZy4gQSByZWxlYXNlIGJ1aWxkIGtlZXBzIHdhcm5pbmdzIGFuZCBlcnJvcnMgb25seSwgc28gdGhvc2UgbGluZXMgc3RheSBvdXQgb2YgdGhlIGxvZyB1bnRpbCB0aGUgbGV2ZWwgaXMgcmFpc2VkLiBUaGVyZSBhcmUgdGhyZWUgd2F5cyB0byByYWlzZSBpdDogcHJlc3MgYExgIG9uIHRoZSAiUmVwb3J0IGEgcHJvYmxlbSIgcGFnZSwgd2hpY2gga2VlcHMgdGhlIGNob2ljZTsgbGF1bmNoIHRoZSBkZXNrdG9wIGdhbWUgd2l0aCBgLS1sb2c9aW5mb2AgKG9yIGAtLWxvZz1kZWJ1Z2ApLCB3aGljaCBhcHBsaWVzIHRvIHRoYXQgbGF1bmNoIG9ubHk7IG9yIGFkZCBgP2xvZz1pbmZvYCB0byB0aGUgYWRkcmVzcyBvZiB0aGUgd2ViIGJ1aWxkLiBUaGUgZGVza3RvcCBnYW1lIHdyaXRlcyB0aGUgbG9nIHRvIGEgZmlsZSBpbiB0aGUgYGxvZ3NgIGZvbGRlciBiZXNpZGUgdGhlIHNhdmVzLCBvbmUgZmlsZSBwZXIgbGF1bmNoLCBhbmQgdGhlIHJlcG9ydCBwYWdlIGluY2x1ZGVzIHRoZSB0YWlsLgoKIyMgRXZlbnRzCgpBbiBldmVudCBhcnJpdmVzIG9ubHkgd2hlbiB0aGUgcGxheWVyIGNvdWxkIGtub3cgYWJvdXQgaXQuIGBjb21iYXQtb3V0Y29tZWAgcmVwb3J0cyBvdXRjb21lcyBhZ2FpbnN0IHRoZSBwbGF5ZXIgb3IgYSBwZXJjZWl2ZWQgbW9uc3RlciBpbiB2aWV3OyBhdHRhY2tpbmcgYW4gdW5zZWVuIG1vbnN0ZXIgZG9lcyBub3QgcmV2ZWFsIGl0cyBwb3NpdGlvbiBvciBvdXRjb21lLiBBIG1vbnN0ZXIgYXBwZWFycyBhcyBgeyBtb25zdGVyOiBpZCB9YCB3aGVuIHRoZSBwbGF5ZXIgcGVyY2VpdmVkIGl0IGFzIHRoZSBldmVudCBoYXBwZW5lZCBhbmQgYXMgYCJ1bnNlZW4iYCBvdGhlcndpc2UsIGV2ZW4gd2hlbiB0aGUgZXZlbnQgcmVtb3ZlZCBpdCAoYSBraWxsKS4gTW92ZW1lbnQgb3IgaGVhbGluZyBieSBhIG1vbnN0ZXIgdGhlIHBsYXllciBjYW5ub3QgcGVyY2VpdmUgaW4gdmlldyBkb2VzIG5vdCBhcnJpdmUuIEEgbW92ZW1lbnQgb21pdHMgYGZyb21gIHdoZW4gdGhlIHBsYXllciBkaWQgbm90IHBlcmNlaXZlIHRoZSBtb25zdGVyIGF0IGl0cyBvcmlnaW4gYmVmb3JlIGl0IG1vdmVkLiBEYW1hZ2UgYW5kIGhlYWxpbmcgYW1vdW50cyBhcmUgZ2l2ZW4gb25seSBmb3IgdGhlIHBsYXllciwgYXMgYHBsYXllckRhbWFnZWAgYW5kIGBwbGF5ZXJBbW91bnRgLiBTdXBwcmVzc2VkIGV2ZW50cyBhc3NpZ24gbm8gbW9uc3RlciBoYW5kbGVzLCBhbmQgaGVhbGluZyB3aGlsZSB0aGUgcGxheWVyIHdhcyBhd2F5IGZyb20gYSBwZXJzaXN0ZW50IGxldmVsIGVtaXRzIG5vIGV2ZW50LgoKfCBFdmVudCB8IFBheWxvYWQgfAp8IC0tLSB8IC0tLSB8CnwgYG1lc3NhZ2VgIHwgYHsgdGV4dCwgdHlwZSB9YCB8CnwgYGR1bmdlb25sZXZlbGAgfCBgeyBkZXB0aCwgbGV2ZWxJZCwgY2F1c2UsIGFyZW5hIH1gIHwKfCBgY29tYmF0LW91dGNvbWVgIHwgYHsgYXR0YWNrZXIsIHRhcmdldCwga2luZCwgaGl0LCBkaWVkLCBncmlkLCBwbGF5ZXJEYW1hZ2U/IH1gIHwKfCBgbW90aW9uYCB8IGB7IHdobywgZnJvbT8sIHRvLCBraW5kIH1gIHwKfCBgaGVhbGAgfCBgeyB3aG8sIGdyaWQsIHBsYXllckFtb3VudD8gfWAgfAp8IGBwbGF5ZXItY29tbWFuZGAgfCBgeyBjb2RlLCBkaXI/LCBhcmdzPywgcGhhc2UsIHRva2VuIH1gIHwKfCBgZHJpdmVyLWNoYW5nZWRgIHwgYHsga2luZDogInBsYXllciIgfWAgb3IgYHsga2luZDogImNvbnRyb2xsZXIiLCBvd25lciwgbGFiZWw/LCByZWFzb24/IH1gOiB3aG8gaG9sZHMgdGhlIGtleWJvYXJkIHwKfCBgaHBgIGBtYW5hYCBgZ29sZGAgYGV4cGVyaWVuY2VgIGBwbGF5ZXJsZXZlbGAgYHN0YXR1c2AgfCBgbnVsbGAgfAp8IGBpbnZlbnRvcnlgIGBlcXVpcG1lbnRgIGBtb25zdGVybGlzdGAgYGl0ZW1saXN0YCB8IGBudWxsYCB8CnwgYGVudGVyLXN0b3JlYCB8IGBudWxsYDogdGhlIHBsYXllciB3YWxrZWQgaW50byBhIHNob3AuIHwKfCBgbGVhdmUtc3RvcmVgIHwgYG51bGxgOiB0aGUgcGxheWVyIGxlZnQgdGhlIHNob3AuIHwKfCBgZW50ZXItd29ybGRgIHwgYG51bGxgOiBhIGdhbWUgaXMgc3RhcnRpbmcgdG8gcnVuLiB8CnwgYGxlYXZlLXdvcmxkYCB8IGBudWxsYDogdGhlIGdhbWUgaXMgc3RvcHBpbmcuIHwKCmBwbGF5ZXItY29tbWFuZGAgZmlyZXMgYXMgdGhlIGdhbWUgbG9vcCB0YWtlcyBhIGNvbW1hbmQgZnJvbSB0aGUgcGxheWVyIGFuZCBiZWZvcmUgdGhlIGNvbW1hbmQgcnVucywgc28gYSBgc3RhdGU6KmAgcmVhZCBpbiB0aGUgbGlzdGVuZXIgc3RpbGwgc2hvd3MgdGhlIHdvcmxkIHRoZSBjb21tYW5kIGFuc3dlcmVkLCBhbmQgdGhlIGNvbW1hbmQncyBlZmZlY3QgYXJyaXZlcyBsYXRlciBhcyBpdHMgb3duIGV2ZW50cyAoYG1vdGlvbmAsIGBjb21iYXQtb3V0Y29tZWAsIGBocGApLiBJdCBjYXJyaWVzIGBkaXJgIHdoZW4gdGhlIGNvbW1hbmQgaGFzIG9uZS4gYGFyZ3NgIGtlZXBzIG9ubHkgYGhhbmRsZWAsIGBmbG9vcmAsIGBzcGVsbGAgYW5kIGBpbmRleGAsIGFuZCBvbmx5IHdoZW4gZWFjaCBpcyBhIG5vbi1uZWdhdGl2ZSB3aG9sZSBudW1iZXIuIFRoZSBjb21tYW5kcyBhbiBpbnN0YWxsZWQgY29udHJvbGxlciBnaXZlcywgdGhlIGZvbGxvdy11cCBzdGVwcyBvZiBhIHJ1biBvciBhIHJlcGVhdCBjb3VudCwgYW5kIHNob3AgYnV5aW5nIGFuZCBzZWxsaW5nIGRvIG5vdCBmaXJlIGl0LgoKQSBgbnVsbGAgcGF5bG9hZCBpcyBhIG5vdGljZSB0aGF0IHNvbWV0aGluZyBjaGFuZ2VkOiByZWFkIHRoZSB2aWV3IGZvciB0aGUgbmV3IHZhbHVlLiBMZXZlbCBnZW5lcmF0aW9uLCBib2x0cywgbWlzc2lsZXMgYW5kIGV4cGxvc2lvbnMgaGF2ZSBubyBBUEkgMiBldmVudCwgc2luY2UgdGhleSBzaG93IHRoaW5ncyB0aGUgcGxheWVyIGRpZCBub3Qgc2VlLgoKYGV2ZW50cy5vbmAgYW5zd2VycyBgcmVmdXNlZGAgd2l0aCBgdW5rbm93bi1ldmVudGAgZm9yIGEgbmFtZSBub3QgaW4gdGhpcyB0YWJsZSwgYG5vdC1ncmFudGVkYCB3aXRob3V0IGBldmVudDo8bmFtZT5gLCBhbmQgYHVuYXZhaWxhYmxlYCBiZWZvcmUgYSBnYW1lIGlzIHJ1bm5pbmcuIFRoZSBsaXN0ZW5lciBnZXRzIHRoZSBwYXlsb2FkIGFsb25lLgoKIyMgSG9va3MKCkFuIEFQSSAyIG1vZCBkZWNsYXJlcyBpdHMgaG9va3MgaW4gYGhvb2tzKGNvbnRleHQpYC4gRWFjaCBvbmUgZ2V0cyBwbGFpbiwgZnJvemVuIGRhdGEgYW5kIHJldHVybnMgcGxhaW4gZGF0YS4gVGhlIGhvc3QgY29tcG9zZXMgdGhlbSB3aXRoIGV2ZXJ5IG90aGVyIG1vZCdzIGhvb2tzIGluIGxvYWQgb3JkZXIsIHRoZSBzYW1lIHdheSBpdCBjb21wb3NlcyBBUEkgMSBob29rcy4gQSBtb2QgY2FuIGFsc28gZ2l2ZSBob29rIGFuc3dlcnMgYXMgZGF0YSBpbiBgcG9saWNpZXMoY29udGV4dClgLCB3aGljaCBhIFdvcmtlciBtb2QgaGFzIHRvIGRvIGZvciBldmVyeSBob29rIHRoYXQgYW5zd2VycyAoc2VlIFBvbGljeSB0YWJsZXMpLgoKYG1lc3NhZ2VUZXh0YCwgYHNjcmVlblRleHRgLCBgY2hhcmFjdGVyQmFja2dyb3VuZGAsIGBvYmplY3RJbmZvVGV4dGAsIGBlZmZlY3RJbnRyb2AgYW5kIGBoaXN0b3J5RGlzcGxheWAgcmVzdGF0ZSB0ZXh0LiBgaGlzdG9yeUFkZGAgcmV0dXJucyBgeyBrZWVwLCB3aGF0PywgZXhwYW5kVXNlcklucHV0PyB9YCwgYW5kIGFuIGVudHJ5IGlzIHdyaXR0ZW4gb25seSBpZiBldmVyeSBtb2Qga2VlcHMgaXQuIGBvYmplY3RMaXN0VGllYnJlYWtgLCBgc2F2ZU5vaXNlU2NlbnRgIGFuZCBgc2hhcGVMZWFybk9idmlvdXNGbGFnc0RpcmVjdGx5YCBhbnN3ZXIgYSBxdWVzdGlvbi4gYG9wdGlvbnNDaGFuZ2VkYCwgYGFiaWxpdHlHYWluZWRgLCBgbW9uc3RlckJlY2FtZVZpc2libGVgIGFuZCBgYXJ0aWZhY3RJZGVudGlmaWVkYCB0ZWxsIHRoZSBtb2Qgc29tZXRoaW5nIGhhcHBlbmVkLgoKVGhlc2UgQVBJIDEgaG9va3MgaGF2ZSBubyBBUEkgMiBmb3JtOgoKfCBIb29rIHwgV2h5IHwgSW5zdGVhZCB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgbmV3Q2hhcmFjdGVyYCwgYHdhbGtCbG9ja2VkQnlEaWdnYWJsZWAsIGBsZXZlbEdlbmVyYXRlZGAsIGBwYXJ0aWFsU3RhY2tNZXJnZWAsIGBwYWNrT3ZlcmZsb3dWaWN0aW1gIHwgVGhleSBwYXNzIGxpdmUgZ2FtZSBvYmplY3RzIG9yIHRoZSB3aG9sZSBnYW1lIHN0YXRlLiB8IGBlbmdpbmVIb29rc2AsIG9yIGFuIEFQSSAxIHBsdWdpbi4gfAp8IGBsZXZlbFJldmlzaXRlZGAgfCBJdCBwYXNzZXMgdGhlIHJlc3RvcmVkIGxldmVsIGl0c2VsZi4gfCBUaGUgYGxldmVsUmV2aXNpdFRyYWNraW5nYCBwb2xpY3kgdGFibGUuIHwKfCBgcHJvamVjdGlvblJhZGl1c2AgfCBJdCBydW5zIGZvciBwcm9qZWN0aW9ucyB0aGUgcGxheWVyIG5ldmVyIHNlZXMuIHwgVGhlIGBwcm9qZWN0aW9uUmFkaXVzQ2xhbXBgIHBvbGljeSB0YWJsZS4gfAp8IGBhcnRpZmFjdENvbW1pdGAgfCBJdCBydW5zIHdoZW4gYW4gYXJ0aWZhY3QgaXMgZ2VuZXJhdGVkLCBiZWZvcmUgdGhlIHBsYXllciBoYXMgc2VlbiBpdC4gfCBgZW5naW5lSG9va3NgLCBvciBgYXJ0aWZhY3RJZGVudGlmaWVkYCBmb3Igd2hhdCB0aGUgcGxheWVyIGxlYXJucy4gfAoKVG8gcmVhY2ggdGhvc2UgaG9va3MsIHVzZSBgZW5naW5lSG9va3MoY29udGV4dClgLiBJdCByZXR1cm5zIHRoZSBnYW1lJ3Mgb3duIGhvb2sgbWVtYmVycyBieSBuYW1lLCBhbmQgdGhlIGdhbWUgY2FsbHMgZWFjaCBvbmUgd2l0aCB0aGUgc2FtZSBsaXZlIGFyZ3VtZW50cyBpdCBoYXMgYWx3YXlzIHBhc3NlZC4gVGhlIGdhbWUgYXNrcyBmb3IgdGhlbSBvbmx5IHdoZW4gdGhlIG1vZCBoYXMgdGhlIGBlbmdpbmVgIGRvbWFpbiwgd2hpY2ggcmVxdWlyZXMgaW4tcHJvY2VzcyBjb2RlIChmaXJzdC1wYXJ0eSwgb3IgYW4gZXhwbGljaXQgZGV2ZWxvcGVyIGluLXByb2Nlc3MgcnVuKSB3aXRoIGEgZGVjbGFyZWQgYGVuZ2luZTphY2Nlc3NgIGdyYW50LiBBIFdvcmtlciBuZXZlciBnZXRzIGl0LiBGaXJzdC1wYXJ0eSBpbi1wcm9jZXNzIGNvZGUgaG9sZHMgdGhlIGRlY2xhcmVkIGdyYW50IGJ5IGRlZmF1bHQsIGFuZCBhIHJlY29yZGVkIHBsYXllciByZWZ1c2FsIHRha2VzIGl0IGF3YXkuIEV2ZXJ5IHJlYWQgZnJvbSB0aGUgZW5naW5lIGRvbWFpbiBjaGVja3MgdGhlIGdyYW50IGFnYWluLCBidXQgbGl2ZSBvYmplY3RzIGFscmVhZHkgaGFuZGVkIHRvIHBhZ2UgY29kZSBzdGF5IGxpdmUsIHNvIHRoZXNlIGNoZWNrcyBkbyBub3Qgc2FuZGJveCBwYWdlIGV4ZWN1dGlvbi4gQSBob29rIG5hbWUgdGhhdCBhbHJlYWR5IGhhcyBhbiBBUEkgMiBmb3JtIGlzIHJlZnVzZWQsIHdoaWNoIGtlZXBzIGVhY2ggaG9vayBkZWNsYXJlZCBvbmUgd2F5LgoKYGVuZ2luZVRpbGVzKGNvbnRleHQpYCBpcyB0aGUgc2FtZSBkb29yIGZvciBhIHRpbGUgc2V0LiBJdCByZXR1cm5zIGEgYGZpbGxlcmAgdGhhdCBzdXBwbGllcyB0aWxlcyBmb3IgbW9uc3RlcnMgYW5kIG9iamVjdHMgdGhlIHBhY2sgZG9lcyBub3QgZHJhdywgYW5kIGEgYHBsYXllcmAgcHJvdmlkZXIgdGhhdCBwaWNrcyB0aGUgcGxheWVyJ3MgdGlsZSBmcm9tIHRoZSBjaGFyYWN0ZXIncyBzaGFwZSwgY2xhc3MsIHJhY2UgYW5kIGxldmVsLiBJdCBuZWVkcyBgcmVnaXN0cnk6dGlsZXNgIGFuZCB0aGUgYGVuZ2luZWAgZG9tYWluLCBhbmQgYSBtb2QgdGhhdCBhbHNvIGRlY2xhcmVzIGEgYHRpbGVNYXBgIHRhYmxlIGRlY2xhcmVzIGl0cyBmaWxsZXIgaW4gb25seSBvbmUgb2YgdGhlIHR3by4KCkluLXByb2Nlc3MgY29kZSByZWdpc3RlcnMgdGhpbmdzIHdpdGggdGhlIGdhbWUgaXRzZWxmIHRocm91Z2ggYGVuZ2luZS5yZWdpc3RyeWA6IGVmZmVjdCBoYW5kbGVycywgcHJvamVjdGlvbiBoYW5kbGVycywgY29tbWFuZHMgYW5kIHRoZWlyIHZlcmJzLCByb29tcywgcHJvZmlsZXMsIGJsb3dzLCBzdG9yZXMsIG1lbnVzLCBhbmQgZXZlcnl0aGluZyBlbHNlIGFuIEFQSSAxIGByZWdpc3Rlcihob3N0LCBjdHgpYCByZWNlaXZlZCBhcyBgaG9zdGAuIEl0IG5lZWRzIGBlbmdpbmU6YWNjZXNzYCBwbHVzIHRoZSBgcmVnaXN0cnk6YCBncmFudCBmb3IgZWFjaCBkb21haW4uIFdvcmtlcnMgZGVjbGFyZSBkYXRhLW9ubHkgZW50cmllcyBpbiBgbW9kLnJlZ2lzdHJ5YCBpbnN0ZWFkLCBkZXNjcmliZWQgYmVsb3csIGFuZCBuZWVkIG5vIGBlbmdpbmU6YWNjZXNzYC4KCiMjIFBvbGljeSB0YWJsZXMKCmBwb2xpY2llcyhjb250ZXh0KWAgcmV0dXJucyBjaGFuZ2VzIGFzIGRhdGE6IGhvb2sgYW5zd2VycywgYW5kIGEgZmV3IGdhbWUgcmVnaXN0cmF0aW9ucy4gVGhlIGdhbWUgYXBwbGllcyB0aGVtIGl0c2VsZiwgd2l0aG91dCBjYWxsaW5nIHRoZSBtb2QsIHNvIGEgdGFibGUgd29ya3MgdGhlIHNhbWUgaW4gYSBXb3JrZXIgYW5kIGluIHByb2Nlc3MuIFRhYmxlcyBkbyBub3QgbGltaXQgd2hhdCBhIG1vZCBjYW4gY2hhbmdlLiBBbiBpbi1wcm9jZXNzIG1vZCBrZWVwcyBldmVyeSBob29rIGZ1bmN0aW9uIGl0IGhhcywgYW5kIHdoZW4gaXQgZGVjbGFyZXMgYSBmdW5jdGlvbiBhbmQgYSB0YWJsZSBmb3IgdGhlIHNhbWUgaG9vaywgdGhlIGZ1bmN0aW9uIGlzIHVzZWQuCgpFYWNoIHRhYmxlIG5lZWRzIGl0cyBtYXRjaGluZyByZWdpc3RyeSBwZXJtaXNzaW9uIGZyb20gdGhlIGxpc3QgYmVsb3csIGluIGJvdGggcnVudGltZXMuIFdoZW4gYSBncmFudCBpcyBtaXNzaW5nLCBvbmx5IHRoZSB0YWJsZXMgdGhhdCBuZWVkIGl0IGFyZSBza2lwcGVkLCBhbmQgdGhlIG1vZCdzIG90aGVyIHRhYmxlcyBhbmQgaG9vayBmdW5jdGlvbnMgc3RheSBhdmFpbGFibGUuIEluLXByb2Nlc3MsIGByZWdpc3RyeToqYCBjb3ZlcnMgZXZlcnkgdGFibGUuIEEgV29ya2VyIGhhcyB0byBuYW1lIGVhY2ggZ3JhbnQgaW5kaXZpZHVhbGx5LCBhbmQgYSBiYXJlIGAqYCBncmFudHMgbm90aGluZy4gVGhlIGluLXByb2Nlc3MgaG9zdCBldmFsdWF0ZXMgdGhlIHBvbGljaWVzIHdoaWxlIGl0IGNvbXBvc2VzIGd1YXJkZWQgaG9va3MgYW5kIHJldXNlcyB0aGUgcmVzdWx0cyBmb3Igc3RhcnR1cCByZWdpc3RyYXRpb25zLiBJZiBhIGZhY3RvcnkgdGhyb3dzLCBpdCBjb250cmlidXRlcyBubyB0YWJsZXMsIGFuZCB0aGUgZ2FtZSBzdGlsbCBzdGFydHMuCgp8IFRhYmxlIHwgV2hlcmUgaXQgYXBwbGllcyB8IFdoYXQgYHdoZXJlYCBtYXkgbmFtZSB8IFBlcm1pc3Npb24gfAp8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYG1lc3NhZ2VUZXh0YCwgYGNoYXJhY3RlckJhY2tncm91bmRgIHwgdGhlIHNhbWUgfCBub3RoaW5nIHwgYHJlZ2lzdHJ5Om1lc3NhZ2VgIHwKfCBgc2NyZWVuVGV4dGAgfCBgc2NyZWVuVGV4dGAgfCBgc2NyZWVuYCwgYHBhcnRgLCBgY29sdW1uYCB8IGByZWdpc3RyeTp1aS1lbnRyeWAgfAp8IGBvYmplY3RJbmZvVGV4dGAgfCBgb2JqZWN0SW5mb1RleHRgIHwgYHNlY3Rpb25gLCBgdHZhbGAsIGBraW5kYCwgYGF3YXJlYCB8IGByZWdpc3RyeTplZmZlY3QtaW5mb2AgfAp8IGBlZmZlY3RJbnRyb2AgfCBgZWZmZWN0SW50cm9gLCBvbiB0aGUgaW50cm8ncyB0ZXh0IHwgYGVmZmVjdGAsIGBpdGVtQ2xhc3NgLCBgYWltZWRgLCBgYWN0aXZhdGlvbmAsIGBkZXNjcmliZWRBY3RpdmF0aW9uYCB8IGByZWdpc3RyeTplZmZlY3QtaW5mb2AgfAp8IGBoaXN0b3J5QWRkYCB8IGBoaXN0b3J5QWRkYCB8IGB0eXBlYCwgYGR1cGxpY2F0ZWAgfCBgcmVnaXN0cnk6bWVzc2FnZWAgfAp8IGBoaXN0b3J5RGlzcGxheWAgfCBgaGlzdG9yeURpc3BsYXlgIHwgYHR5cGVgIHwgYHJlZ2lzdHJ5Om1lc3NhZ2VgIHwKfCBgb2JqZWN0TGlzdE9yZGVyYCB8IGBvYmplY3RMaXN0VGllYnJlYWtgIHwgbm90IGEgcnVsZSB0YWJsZSB8IGByZWdpc3RyeTp0dmFsYCB8CnwgYHNhdmVOb2lzZVNjZW50YCB8IHRoZSBzYW1lIHwgbm90IGEgcnVsZSB0YWJsZSB8IGByZWdpc3RyeTptb25zdGVyYCB8CnwgYHNoYXBlTGVhcm5PYnZpb3VzRmxhZ3NEaXJlY3RseWAgfCB0aGUgc2FtZSB8IG5vdCBhIHJ1bGUgdGFibGUgfCBgcmVnaXN0cnk6cnVuZWAgfAp8IGBwcm9qZWN0aW9uUmFkaXVzQ2xhbXBgIHwgYHByb2plY3Rpb25SYWRpdXNgIHwgbm90IGEgcnVsZSB0YWJsZSB8IGByZWdpc3RyeTpwcm9qZWN0aW9uYCB8CnwgYGxldmVsUmV2aXNpdFRyYWNraW5nYCB8IGBsZXZlbFJldmlzaXRlZGAgfCBub3QgYSBydWxlIHRhYmxlIHwgYHJlZ2lzdHJ5Om1vbnN0ZXJgIHwKfCBgc3RvcmVEaXNjb3VudFJvbGxgIHwgdGhlIHN0b3JlcycgZGlzY291bnQgcm9sbCB8IG5vdCBhIHJ1bGUgdGFibGUgfCBgcmVnaXN0cnk6c3RvcmVgIHwKfCBgdGlsZU1hcGAgfCB0aGUgbW9kJ3MgdGlsZSBmaWxsZXIgfCBub3QgYSBydWxlIHRhYmxlIHwgYHJlZ2lzdHJ5OnRpbGVzYCB8CgpBIHRleHQgcnVsZSBpcyBgeyBmaW5kLCByZXBsYWNlLCBtYXRjaCwgd2hlcmUgfWAuIGBtYXRjaGAgaXMgYCJleGFjdCJgICh0aGUgd2hvbGUgdGV4dCwgYW5kIHRoZSBkZWZhdWx0KSwgYCJzdWJzdHJpbmciYCAoZXZlcnkgb2NjdXJyZW5jZSkgb3IgYCJwcmVmaXgiYC4gTWF0Y2hpbmcgaXMgbGl0ZXJhbCB0ZXh0IHdpdGggbm8gcmVndWxhciBleHByZXNzaW9ucywgc28gYSBydWxlIGNhbm5vdCBzdGFsbCBhIHR1cm4uIFJ1bGVzIHJ1biBpbiBvcmRlciwgZWFjaCBvbiB0aGUgdGV4dCB0aGUgb25lIGJlZm9yZSBpdCBwcm9kdWNlZCwgYW5kIGB3aGVyZWAgbGltaXRzIGEgcnVsZSB0byBjYWxsIHNpdGVzIHdob3NlIG5hbWVkIGZpZWxkcyBlcXVhbCB0aGUgdmFsdWVzIGdpdmVuLiBBIGBoaXN0b3J5QWRkYCBydWxlIG1heSBiZSBgeyBmaW5kLCBkcm9wOiB0cnVlIH1gIGluc3RlYWQsIHdoaWNoIGtlZXBzIGEgbWF0Y2hpbmcgZW50cnkgb3V0IG9mIHRoZSBoaXN0b3J5LiBgb2JqZWN0TGlzdE9yZGVyYCBsaXN0cyB0aGUga2V5cyBgZHlgLCBgZHhgLCBgLWR5YCBhbmQgYC1keGA6IHRoZSBmaXJzdCBrZXkgdGhhdCBkaWZmZXJzIGJldHdlZW4gdHdvIGVudHJpZXMgb3JkZXJzIHRoZW0sIGFuZCBhIG1pbnVzIHNpZ24gc29ydHMgdGhhdCBrZXkgaGlnaCB0byBsb3cuIFRoZSB0d28gc3dpdGNoZXMgdGFrZSBgdHJ1ZWAuCgpgc3RvcmVEaXNjb3VudFJvbGxgIGlzIGB7IG1pbkNvc3QsIHRpZXJzIH1gLiBXaGVuIGEgc3RvcmUgc3RvY2tzIGFuIG9iamVjdCB3b3J0aCBhdCBsZWFzdCBgbWluQ29zdGAgKDAgaWYgbGVmdCBvdXQpLCBpdCB0cmllcyBlYWNoIHRpZXIgYHsgb25lSW4sIHBlcmNlbnQgfWAgaW4gb3JkZXIsIGFuZCB0aGUgZmlyc3Qgb25lLWluLWBvbmVJbmAgcm9sbCB0aGF0IGNvbWVzIHVwIHRha2VzIGBwZXJjZW50YCBvZmYgdGhhdCBzdGFjay4gVGhlIHJvbGxzIGNvbWUgZnJvbSB0aGUgZ2FtZSdzIG93biByYW5kb20gbnVtYmVycywgc28gYSBzZWVkZWQgZ2FtZSBzdGF5cyByZXBlYXRhYmxlLiBJZiB0d28gbW9kcyBkZWNsYXJlIGEgZGlzY291bnQgcm9sbCwgdGhlIG9uZSB0aGF0IGxvYWRzIGxhdGVyIGlzIHVzZWQuCgpgdGlsZU1hcGAgbGlzdHMgcnVsZXMgb2YgdGhlIGZvcm0gYHsgbW9uc3RlciwgbGlrZSwgaHVlLCBwYWNrcyB9YCBvciBgeyBtb25zdGVyLCBjZWxsLCBwYWNrcyB9YCwgd2l0aCBgb2JqZWN0YCBpbiBwbGFjZSBvZiBgbW9uc3RlcmAuIEEgcnVsZSBnaXZlcyBhIG1vbnN0ZXIgcmFjZSBvciBvYmplY3Qga2luZCB0aGUgdGlsZSB0aGF0IHRoZSBgbGlrZWAgaW5kZXggaGFzIG5vdywgdHVybmVkIGBodWVgIGRlZ3JlZXMgYXJvdW5kIHRoZSBjb2xvdXIgd2hlZWwgd2hlbiBgaHVlYCBpcyBzZXQuIEl0IG9ubHkgZmlsbHMgYSB0aWxlIHRoZSBwYWNrIGxlYXZlcyBlbXB0eSwgc28gaXQgbmV2ZXIgcmVwYWludHMgYW55dGhpbmcgYSBwYWNrIGRyYXdzLiBgcGFja3NgIGxpbWl0cyBhIHJ1bGUgdG8gdGhvc2UgcGFjayBpZHMsIGFuZCBhIHBhY2sgdGhhdCBjYW5ub3QgcmVjb2xvdXIgc2tpcHMgYW55IHJ1bGUgd2l0aCBhIGBodWVgLiBBIGBjZWxsYCBydWxlIG5hbWVzIGEgc3BvdCBvbiBhIHRpbGUgc2hlZXQgaW5zdGVhZCBvZiBhIGRvbm9yOiBgW2NvbHVtbiwgcm93XWAsIGVhY2ggZnJvbSAwIHRvIDEyNy4gSXQgb25seSB3b3JrcyBvbiBhIHBhY2sgdGhhdCBpcyBhIGZpeGVkIHRpbGUgc2hlZXQsIHNvIGl0IGhhcyB0byBsaXN0IGl0cyBgcGFja3NgLCBpdCBjYW5ub3QgYWxzbyB0YWtlIGEgYGh1ZWAsIGFuZCBhbnkgb3RoZXIgcGFjayBza2lwcyBpdC4KClR3byBtb3JlIHRhYmxlcyBhcmUgcGxhaW4gc3dpdGNoZXMuIGBwcm9qZWN0aW9uUmFkaXVzQ2xhbXA6IHRydWVgIGtlZXBzIGEgYmxhc3QgZnJvbSBncm93aW5nIHBhc3QgdGhlIG1heGltdW0gcHJvamVjdGlvbiByYW5nZSwgd2hpY2ggaXMgd2hhdCB1cHN0cmVhbSdzIGBwcm9qZWN0KClgIGRvZXMuIGBsZXZlbFJldmlzaXRUcmFja2luZzogdHJ1ZWAgbWFrZXMgYSBsZXZlbCB5b3UgY29tZSBiYWNrIHRvIGZvcmdldCBpdHMgb2xkIG5vaXNlIGFuZCBhZ2UgaXRzIHNjZW50IGJ5IHRoZSB3b3JsZCB0aWNrcyB5b3Ugd2VyZSBhd2F5LCB0aGUgd2F5IHVwc3RyZWFtJ3MgYGFnZV9zY2VudCgpYCBhbmQgYGZvcmdldF9ub2lzZSgpYCBkby4gVGhlIGdhbWUgYXBwbGllcyBib3RoIGl0c2VsZiwgc28gdGhlIG1vZCBuZXZlciBzZWVzIHRoZSBsZXZlbCBvciB0aGUgcHJvamVjdGlvbi4KCkJvdGggcnVudGltZXMgaW5zdGFsbCByZWdpc3RyYXRpb25zIGluIHRoZSBzZWxlY3RlZCBtb2Qgb3JkZXIuIEEgbGF0ZXIgZGlzY291bnQgcm9sbCByZXBsYWNlcyBhbiBlYXJsaWVyIG9uZSwgYW5kIHRpbGUgZmlsbGVycyBydW4gaW4gdGhhdCBvcmRlciwgc28gdGhlIGZpcnN0IGZpbGxlciBmb3IgYW4gZW1wdHkgdGlsZSB3aW5zLgoKQSB0YWJsZSBob2xkcyB1cCB0byAyNTYgcnVsZXMsIGBmaW5kYCBhbmQgYHJlcGxhY2VgIHVwIHRvIDQwOTYgY2hhcmFjdGVycyBlYWNoLCBhbmQgYHdoZXJlYCB1cCB0byA4IGZpZWxkcy4gQSBkaXNjb3VudCByb2xsIGhhcyAxIHRvIDE2IHRpZXJzLCBgb25lSW5gIGZyb20gMSB0byAxMDAwMDAwIGFuZCBgcGVyY2VudGAgZnJvbSAxIHRvIDk5LiBBbiB1bmtub3duIHRhYmxlIG9yIGZpZWxkIGlzIHJlZnVzZWQsIG5vdCBpZ25vcmVkLCBhbmQgc28gYXJlIHRhYmxlcyB0aGF0IGJyZWFrIHRoZXNlIGxpbWl0czsgYGNoZWNrQXBpMlBvbGljaWVzYCBzYXlzIHdoeS4gQSBtb2Qgd2hvc2UgdGFibGVzIGFyZSByZWZ1c2VkIGdldHMgbm9uZSBvZiB0aGVtLgoKVGhlIGhvc3QgYm91bmRzIGludGVybWVkaWF0ZSB0ZXh0IHRvIDE2Mzg0IGNoYXJhY3RlcnMgYW5kIHRleHQgd29yayB0byBhIGJ1ZGdldCBvZiAxMDQ4NTc2IGNoYXJhY3RlcnMgcGVyIHRhYmxlIGNhbGwsIGNoZWNraW5nIGJlZm9yZSBpdCBhbGxvY2F0ZXMgcmVwbGFjZW1lbnRzLiBJZiB0aGUgaW5wdXQgZXhjZWVkcyB0aGUgdGV4dCBsaW1pdCBvciBhIHRhYmxlIGV4Y2VlZHMgZWl0aGVyIGJvdW5kLCB0aGUgdGFibGUgcmV0dXJucyB0aGUgb3JpZ2luYWwgdGV4dC4gQSBoaXN0b3J5IHRhYmxlIGtlZXBzIHRoZSBvcmlnaW5hbCBlbnRyeSB1bmNoYW5nZWQgaW4gdGhhdCBjYXNlLgoKYGBgdHMKZXhwb3J0IGRlZmF1bHQgZGVmaW5lQXBpMk1vZCh7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIHBvbGljaWVzOiAoKSA9PiAoewogICAgbWVzc2FnZVRleHQ6IFt7IGZpbmQ6ICJZb3UgZmVlbCIsIHJlcGxhY2U6ICJZb3Ugc2Vuc2UiLCBtYXRjaDogInByZWZpeCIgfV0sCiAgICBvYmplY3RMaXN0T3JkZXI6IFsiZHkiLCAiZHgiXSwKICAgIHN0b3JlRGlzY291bnRSb2xsOiB7IG1pbkNvc3Q6IDUsIHRpZXJzOiBbeyBvbmVJbjogMjUsIHBlcmNlbnQ6IDI1IH0sIHsgb25lSW46IDE1MCwgcGVyY2VudDogNTAgfV0gfSwKICB9KSwKfSk7CmBgYAoKRWFjaCBraW5kIG9mIHRhYmxlIGlzIG9uZSBlbnRyeSBpbiBgQVBJMl9QT0xJQ1lfS0lORFNgIChgcGFja2FnZXMvbW9kLXNkay9zcmMvYXBpMi9wb2xpY2llcy50c2ApLiBUaGUgZW50cnkgZ2l2ZXMgdGhlIHRhYmxlJ3MgbmFtZSwgaXRzIHJlZ2lzdHJ5IHBlcm1pc3Npb24sIHRoZSBob29rIG9yIHJlZ2lzdHJhdGlvbiBpdCBmZWVkcywgdGhlIGNoZWNrIGZvciBpdHMgdmFsdWUsIGFuZCB3aGF0IGl0IGluc3RhbGxzOyBgY2hlY2tBcGkyUG9saWNpZXNgIGFuZCBgYXBpMlBvbGljeUVmZmVjdHNgIG9ubHkgd2FsayB0aGF0IGxpc3QuIFRvIGFkZCBhIGtpbmQsIGFkZCBpdHMgbWVtYmVyIHRvIGBBcGkyUG9saWNpZXNgIGFuZCBpdHMgZW50cnkgdG8gdGhlIGxpc3QsIHRlc3QgaXQgaW4gYHBvbGljaWVzLnRlc3QudHNgLCBhbmQgZ2l2ZSBpdCBhIHJvdyBpbiB0aGUgdGFibGUgYWJvdmUuIEEga2luZCB0aGF0IGZlZWRzIGEgcmVnaXN0cmF0aW9uIHRoZSBnYW1lIGhhcyBub3QgaW5zdGFsbGVkIGZyb20gYSB0YWJsZSBiZWZvcmUgYWxzbyBuZWVkcyBhIHRhcmdldCBpbiBgaW5zdGFsbEFwaTJQb2xpY3lSZWdpc3RyYXRpb25zYCAoYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWFwaTItc2hpbS50c2ApLgoKIyMgU3RvcmFnZQoKYHN0b3JlLnByZWZzLmdldCgpYCBhbmQgYHNldCh2YWx1ZSlgIGhvbGQgb25lIEpTT04gdmFsdWUgcGVyIG1vZCwgYW5kIGBzZXQobnVsbClgIHJlbW92ZXMgaXQuIEEgbW9kIHRoYXQgY2hhbmdlcyB0aGUgc2hhcGUgb2Ygd2hhdCBpdCBzdG9yZXMgZGVjbGFyZXMgYHByZWZzOiB7IHZlcnNpb24sIG1pZ3JhdGUodmFsdWUsIGZyb21WZXJzaW9uKSB9YCwgd2l0aCBgdmVyc2lvbmAgYSB3aG9sZSBudW1iZXIgZnJvbSAxLiBUaGUgaG9zdCBzdG9yZXMgdGhlIHZlcnNpb24gYmVzaWRlIHRoZSB2YWx1ZSwgY2FsbHMgYG1pZ3JhdGVgIG9uY2Ugb24gdGhlIGZpcnN0IHJlYWQgYWZ0ZXIgYW4gdXBncmFkZSwgYW5kIHdyaXRlcyB0aGUgcmVzdWx0IGJhY2suIEEgdmFsdWUgc3RvcmVkIGJlZm9yZSB0aGUgbW9kIGRlY2xhcmVkIGEgdmVyc2lvbiBjb3VudHMgYXMgdmVyc2lvbiAwLgoKQ29uY3VycmVudCByZWFkcyBzaGFyZSBhIHBlbmRpbmcgbWlncmF0aW9uLiBBIHByZWZlcmVuY2Ugd3JpdGUgb3IgY2xlYXIgd2hpbGUgdGhlIG1pZ3JhdGlvbiB3YWl0cyB0YWtlcyBwcmVjZWRlbmNlLCBhbmQgdGhlIHdhaXRpbmcgcmVhZHMgcmVjZWl2ZSB0aGUgY3VycmVudCB2YWx1ZSBpbnN0ZWFkIG9mIG92ZXJ3cml0aW5nIGl0IHdpdGggdGhlIG9sZGVyIG1pZ3JhdGlvbiByZXN1bHQuCgpgc3RvcmUuY2hhcmFjdGVyYCBob2xkcyBvbmUgSlNPTiB2YWx1ZSBpbiB0aGUgY3VycmVudCBjaGFyYWN0ZXIncyBzYXZlIGFuZCBhbnN3ZXJzIGB1bmF2YWlsYWJsZWAgdW50aWwgYSBjaGFyYWN0ZXIgZXhpc3RzLiBCcmluZyBpdHMgc2hhcGUgZm9yd2FyZCB3aXRoIGBtaWdyYXRlQmFnYC4KCiMjIE5ldHdvcmsgYW5kIGNyZWRlbnRpYWxzCgpgbmV0LnJlcXVlc3QoeyB1cmwsIG1ldGhvZCwgaGVhZGVycywgYm9keSwgdGltZW91dE1zIH0pYCBzZW5kcyBhIHJlcXVlc3QgdG8gYSBob3N0IHRoZSBtYW5pZmVzdCBuYW1lcyBhbmQgYW5zd2VycyBgeyBzdGF0dXMsIGhlYWRlcnMsIGJvZHkgfWAgd2hhdGV2ZXIgdGhlIHN0YXR1cy4gQSBoZWFkZXIgY2FuIGhvbGQgYG1vZC5uZXQuY3JlZGVudGlhbCgiYXBpLWtleSIpYCBpbiBwbGFjZSBvZiBhIHN0cmluZy4gVGhlIGhvc3QgcHV0cyB0aGUgc3RvcmVkIHZhbHVlIGluIGFzIHRoZSB3aG9sZSBoZWFkZXIgdmFsdWUsIGFuZCB0aGUgbW9kIG5ldmVyIHJlYWRzIGl0IGJhY2suIGBuZXQuY3JlZGVudGlhbHNgIGtlZXBzIGNyZWRlbnRpYWxzIGJ5IG5hbWU6IGBzZXQobmFtZSwgdmFsdWUsIGhvc3RzKWAgc3RvcmVzIG9uZSB0byBiZSBzZW50IG9ubHkgdG8gdGhvc2UgaG9zdHMsIGBmcm9tRW52aXJvbm1lbnQobmFtZSwgdmFyaWFibGVzLCBob3N0cylgIHRha2VzIGl0IGZyb20gdGhlIGZpcnN0IGVudmlyb25tZW50IHZhcmlhYmxlIHRoYXQgaXMgc2V0IChkZXNrdG9wIGFwcCBvbmx5LCBhbmQgdGhlIHBsYXllciBpcyBhc2tlZCksIGBzdGF0dXMobmFtZSlgIHNheXMgd2hldGhlciBvbmUgaXMgc2V0IGFuZCB3aGVyZSBpdCBpcyBrZXB0IChgb3NgLCBgZW52aXJvbm1lbnRgIG9yIGBwYWdlYCksIGFuZCBgcmVtb3ZlKG5hbWUpYCBkZWxldGVzIGl0LiBBIGNyZWRlbnRpYWwgY2FsbCB0aGF0IGZhaWxzIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggdGhlIGNvZGUgYGNyZWRlbnRpYWxgLgoKQSByZXF1ZXN0IHRvIGEgaG9zdCB0aGUgbWFuaWZlc3QgZG9lcyBub3QgbmFtZSBhbnN3ZXJzIGBub3QtZ3JhbnRlZGAgd2l0aCBgbmV0d29yazo8aG9zdD5gLiBBbnkgb3RoZXIgZmFpbHVyZSBpcyBgcmVmdXNlZGAgd2l0aCBhIG5ldCBwcm9ibGVtIGNvZGU6IGB0aW1lb3V0YCwgYHRvby1sYXJnZWAsIGByZWRpcmVjdGAsIGB1bnJlYWNoYWJsZWAgb3IgYGJhZC1yZXF1ZXN0YC4gQSBjcmVkZW50aWFsIHRoYXQgaXMgbm90IHNldCBnaXZlcyBgc2VjcmV0LW1pc3NpbmdgLCBhbmQgb25lIG5vdCBzZXQgdXAgZm9yIHRoZSByZXF1ZXN0J3MgaG9zdCBnaXZlcyBgc2VjcmV0LWhvc3RgLgoKIyMgSW4gYSBXb3JrZXIKCkEgV29ya2VyIGdyYW50ZWQgYG1vZDphdXRob3JpbmdgIGNhbiBpbXBvcnQgYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsvYXV0aG9yaW5nYC4gVGhlIGhvc3Qgc3RhZ2VzIHRoZSBmaXhlZCBhdXRob3JpbmcsIGJsdWVwcmludCwgZmllbGQsIHByb3ZlbmFuY2UsIGFuZCByZWZlcmVuY2UgbW9kdWxlcyBhcyBzb3VyY2UgbmV4dCB0byB0aGUgbW9kJ3Mgb3duIG1vZHVsZXMsIGFuZCBjYWxscyBzdWNoIGFzIGB0ZW1wbGF0ZVJlY29yZGAsIGBzdWdnZXN0RmllbGRzYCwgYW5kIGBjaGVja1JlY29yZHNgIHJ1biBpbnNpZGUgdGhlIFdvcmtlciBvbiBkYXRhIHRoZSBtb2Qgc3VwcGxpZXMuIFRoZSBsaWJyYXJ5IGNhbm5vdCBpbnN0YWxsIGFueXRoaW5nLCBsb2FkIGEgc2Vzc2lvbiwgb3IgY2FsbCB0aGUgaG9zdC4gSXRzIG1vZHVsZXMgY291bnQgdG93YXJkIHRoZSBzdGFnaW5nIHNpemUgYW5kIG1vZHVsZSBsaW1pdHMsIGFuZCB0aGUgaG9zdCByZWNoZWNrcyB0aGUgZ3JhbnQgYmVmb3JlIGl0IHJlbGVhc2VzIHRoZSBzdGFnZWQgZ3JhcGguIFJldm9jYXRpb24gc3RvcHMgdGhlIFdvcmtlci4gVW50aWwgdGhlbiwgdGhlIGxpYnJhcnkncyBsb2NhbCBjb21wdXRhdGlvbiBydW5zIHVuZGVyIHRoZSBzYW1lIENQVSBhbmQgbWVtb3J5IGxpbWl0cyBhcyBhbnkgb3RoZXIgV29ya2VyIGNvZGUuCgpXb3JrZXIgZWxpZ2liaWxpdHkgY29tZXMgZnJvbSB0aGUgdm9jYWJ1bGFyeSBmb3IgZXZlcnkgV29ya2VyLCBmaXJzdC1wYXJ0eSBXb3JrZXJzIGluY2x1ZGVkLCBhbmQgZWFjaCBzaW1wbGUgZ3JhbnQgbmVlZHMgYW4gZXhwbGljaXQgZGVjaXNpb24gZnJvbSB0aGUgcGxheWVyLiBNZW51LCBzY3JlZW4sIGJpcnRoLCBtYXAsIGFuZCBNb2RzLXNjcmVlbiByZXBsYWNlbWVudCBhcnJpdmUgdGhyb3VnaCB0aGUgcHJlc2VudGVyIHBhdGhzIGRlc2NyaWJlZCBiZWxvdywgYXMgZGF0YSB0aGUgaG9zdCBkcmF3cy4gVGhlIGB1aToqLnJlcGxhY2VgIHdpbGRjYXJkIGNvdmVycyBtZXNzYWdlcywgc2lkZWJhciwgc3RhdHVzLCBtZW51LCBzY3JlZW4sIGFuZCBiaXJ0aCwgYW5kIG5vdGhpbmcgbW9yZS4gTWFwIHJlcGxhY2VtZW50LCBhZGRpdGlvbmFsIHJlZ2lvbnMsIGFuZCBwYW5lbHMgZmFsbCBvdXRzaWRlIGl0LiBJZiB0aGUgcGxheWVyIGV4cGxpY2l0bHkgcmVmdXNlcyBhbnkgY292ZXJlZCBmYW1pbHksIHRoYXQgcmVmdXNhbCBvdmVycmlkZXMgdGhlIHdpbGRjYXJkLiBXb3JrZXJzIGhhdmUgbm8gZW5naW5lIGFjY2Vzcy4gVHJ1dGgsIG1hbmFnZW1lbnQsIGNvbnRlbnQsIHNwYXduaW5nLCBhbmQgc2hhcmVkIGRhdGEgZWFjaCBnbyB0aHJvdWdoIHRoZWlyIG93biBib3VuZGVkIFdvcmtlciBvcGVyYXRpb24uCgpXaXRoIGB1aTptZXNzYWdlcy5yZXBsYWNlYCwgYHVpOnNpZGViYXIucmVwbGFjZWAsIG9yIGB1aTpzdGF0dXMucmVwbGFjZWAsIGEgV29ya2VyIGNhbiByZXBsYWNlIHRoZSBtYXRjaGluZyByZWdpb24gYnkgY2FsbGluZyBgbW9kLnVpLm1lc3NhZ2VzLnJlcGxhY2UobGluZXMpYCwgYG1vZC51aS5zaWRlYmFyLnJlcGxhY2UobGluZXMpYCwgb3IgYG1vZC51aS5zdGF0dXMucmVwbGFjZShsaW5lcylgLiBFYWNoIGxpbmUgaXMgYHsgdGV4dCwgc3R5bGU/IH1gLCBhbmQgYHN0eWxlYCBpcyBvbmUgb2YgYG5vcm1hbGAsIGBtdXRlZGAsIGB3YXJuaW5nYCwgYGRhbmdlcmAsIGFuZCBgZ29vZGAuIFRoZSBob3N0IGRyYXdzIHRoZSB0ZXh0IHdpdGggYHRleHRDb250ZW50YCBhbmQgYWNjZXB0cyB1cCB0byA2NCBsaW5lcywgNTEyIGNoYXJhY3RlcnMgcGVyIGxpbmUsIGFuZCA0MDk2IGNoYXJhY3RlcnMgcGVyIG91dHB1dC4gUGFzcyBgbnVsbGAgdG8gZ2l2ZSB0aGUgcmVnaW9uIGJhY2sgdG8gdGhlIGdhbWUuIEJlY2F1c2UgdGhlIG1vZCBzdXBwbGllcyB0aGUgd2hvbGUgcmVnaW9uLCBpdHMgdGV4dCBjYW4gaGlkZSB3YXJuaW5ncyBvciBtaXNzdGF0ZSBjaGFyYWN0ZXIgc3RhdHVzLgoKYHVpOnJlZ2lvbi5jcmVhdGVgIGFkZHMgYG1vZC51aS5yZWdpb24uY3JlYXRlKHsgaWQsIHJlY3Q6IHsgY29sLCByb3csIGNvbHMsIHJvd3MgfSwgbGluZXMgfSlgIGFuZCBgbW9kLnVpLnJlZ2lvbi5yZW1vdmUoaWQpYC4gQ2FsbGluZyBjcmVhdGUgd2l0aCBhbiBpZCB0aGUgV29ya2VyIGFscmVhZHkgb3ducyB1cGRhdGVzIHRoYXQgb3V0cHV0J3MgdGV4dCBhbmQgcmVjdGFuZ2xlLiBUaGUgaG9zdCBjaGVja3MgdGhlIHJlY3RhbmdsZSBhZ2FpbnN0IHRoZSBjdXJyZW50IGNoYXJhY3RlciBncmlkIGFuZCBjYXBzIGVhY2ggV29ya2VyIGF0IGVpZ2h0IHRleHQgb3V0cHV0cywgY291bnRpbmcgbmFtZWQgcmVwbGFjZW1lbnRzLiBBIHJlZ2lvbiB0YWtlcyBubyBpbnB1dCwgaGFzIG5vIGNob2ljZSBvZiBsYXllciwgYW5kIG5ldmVyIGNvdmVycyBhIGhvc3QgZGlhbG9nLiBFdmVyeSB1cGRhdGUgY291bnRzIGFnYWluc3QgdGhlIGJyb2tlcidzIG1lc3NhZ2UgYW5kIGNhbGwtcmF0ZSBsaW1pdHMuIFRlYXJkb3duIHJlbW92ZXMgdGhlIG91dHB1dCwgYW5kIHJldm9jYXRpb24sIGEgbW9kYWwgc2NyZWVuLCBvciBhIGhvc3QgZGlhbG9nIGhpZGVzIGl0LgoKYG9wdGlvbnM6d3JpdGVgIGFsbG93cyBgYXdhaXQgbW9kLm9wdGlvbnMuc2V0KHsgdmFsdWVzLCBoaXRwb2ludFdhcm4sIGRlbGF5RmFjdG9yLCBsYXp5bW92ZURlbGF5IH0pYC4gVGhlIGNhbGwgYWNjZXB0cyBpbnRlcmZhY2UgYm9vbGVhbnMgYW5kIGJvdW5kZWQgZGVsYXlzIGFuZCBub3RoaW5nIGVsc2UuIFRoZSBob3N0IHZhbGlkYXRlcyB0aGUgd2hvbGUgY2hhbmdlIGJlZm9yZSBhcHBseWluZyBhbnkgb2YgaXQsIGFuZCBpdCByZWplY3RzIGJpcnRoLCBjaGVhdCwgc2NvcmUsIGFuZCB1bmtub3duIG9wdGlvbnMuIGBtYW5hZ2VgIGlzIG5vdCByZWFjaGFibGUgdGhyb3VnaCB0aGlzIGNhbGwuCgpga2V5bWFwOmVkaXRgIHByb3ZpZGVzIGFzeW5jaHJvbm91cyBgbW9kLmtleWJpbmRpbmdzLmtleXNldCgpYCwgYGxpc3QoKWAsIGBjb21tYW5kcygpYCwgYHNldCh0cmlnZ2VyLCBhY3Rpb24sIHJlcGxhY2U/KWAsIGByZW1vdmUodHJpZ2dlcilgLCBgY2FwdHVyZSgpYCwgYW5kIGBjYW5jZWxDYXB0dXJlKClgLCBhbGwgYWN0aW5nIG9uIHRoZSBjdXJyZW50IGtleXNldC4gQW4gYWN0aW9uIGhvbGRzIGF0IG1vc3QgMjU2IGNoYXJhY3RlcnMsIGFuZCBvdmVyd3JpdGluZyBhIGNvbmZsaWN0aW5nIGJpbmRpbmcgbmVlZHMgYHJlcGxhY2U6IHRydWVgLiBFc2NhcGUsIGNvbnRyb2wgY2hhcmFjdGVycywgbW9kaWZpZXIgY2hvcmRzLCBGNSwgRjExLCBhbmQgRjEyIGJlbG9uZyB0byB0aGUgaG9zdC4gQSBjYXB0dXJlIGVuZHMgd2hlbiBhIGhvc3QgZGlhbG9nIG9wZW5zLCBvbiBjYW5jZWxsYXRpb24sIG9uIHRlYXJkb3duLCBvciBhZnRlciB0ZW4gc2Vjb25kcy4gSWYgcmV2b2NhdGlvbiBvciBhbiBleHBpcmVkIGJyb2tlciBlcG9jaCBhcnJpdmVzIHdoaWxlIGEgY2FwdHVyZSBpcyBwZW5kaW5nLCBpdHMgcmVzdWx0IGlzIGRyb3BwZWQuCgpgZGlzcGxheTpmaWx0ZXJgIGFsbG93cyBgYXdhaXQgbW9kLmRpc3BsYXkuZmlsdGVyKHsgbmFtZSwgYW1vdW50IH0pYCwgYW5kIHBhc3NpbmcgYG51bGxgIGNsZWFycyB0aGUgV29ya2VyJ3MgZmlsdGVyLiBgZ3JheXNjYWxlYCwgYHNlcGlhYCwgYW5kIGBpbnZlcnRgIHRha2UgYW1vdW50cyBmcm9tIDAgdG8gMSwgYGJyaWdodG5lc3NgIGFuZCBgY29udHJhc3RgIGZyb20gMC4yNSB0byAyLCBhbmQgYHNhdHVyYXRlYCBmcm9tIDAgdG8gMi4gVGhlIGhvc3QgYnVpbGRzIHRoZSBmaWx0ZXIgaXRzZWxmLCBhcHBsaWVzIGl0IHRvIHRoZSBnYW1lIGNhbnZhcywgYW5kIHN1c3BlbmRzIGl0IHdoaWxlIGEgaG9zdCBkaWFsb2cgaXMgb3Blbi4gQ1NTIHRleHQsIHJlc291cmNlIFVSTHMsIGFuZCBmdW5jdGlvbnMgYXJlIHJlamVjdGVkLiBBbGwgb2YgdGhlc2UgV29ya2VyIGFkZGl0aW9ucyBwYXNzIHNlcmlhbGl6ZWQgZGF0YSwgYW5kIG5vIGxpdmUgcHJlc2VudGF0aW9uIG9iamVjdCByZWFjaGVzIHRoZSBXb3JrZXIuCgpGaXZlIHByZXNlbnRlciBjYWxscyByZWdpc3RlciBXb3JrZXIgY2FsbGJhY2tzIGZvciBob3N0LWRyYXduIHJlcGxhY2VtZW50czogYGF3YWl0IG1vZC51aS5tZW51LnJlcGxhY2UoZGVzY3JpYmUsIHNlbGVjdClgIHVuZGVyIGB1aTptZW51LnJlcGxhY2VgLCBgYXdhaXQgbW9kLnVpLnNjcmVlbi5yZXBsYWNlKGRlc2NyaWJlLCBzZWxlY3QpYCB1bmRlciBgdWk6c2NyZWVuLnJlcGxhY2VgLCBgYXdhaXQgbW9kLnVpLmJpcnRoLnJlcGxhY2UoZGVzY3JpYmUsIHNlbGVjdClgIHVuZGVyIGB1aTpiaXJ0aC5yZXBsYWNlYCwgYGF3YWl0IG1vZC51aS5tYW5hZ2VtZW50LnJlcGxhY2UoZGVzY3JpYmUsIHNlbGVjdClgIHVuZGVyIGBzY3JlZW5zOm1hbmFnZWAsIGFuZCBgYXdhaXQgbW9kLmRpc3BsYXkucmVwbGFjZShkZXNjcmliZSlgIHVuZGVyIGBkaXNwbGF5OnJlcGxhY2VgLiBQYXNzaW5nIGBudWxsYCB1bnJlZ2lzdGVycyBhIHByZXNlbnRlci4gSW4gVHlwZVNjcmlwdCwgZGVjbGFyZSBsb2NhbCB0eXBlcyBmb3IgdGhlc2UgcnVudGltZSBhZGRpdGlvbnMsIGJlY2F1c2UgdGhlIFNESydzIGxpdmUgcHJlc2VudGVyIHR5cGVzIGRlc2NyaWJlIHRoZSBzZXBhcmF0ZSBpbi1wcm9jZXNzIGNvbnRyYWN0LiBBIFdvcmtlciBzdGlsbCBjYW5ub3QgZGVjbGFyZSBgZGVmaW5pdGlvbi5wcmVzZW50YXRpb25gIG9yIGBkZWZpbml0aW9uLmJpcnRoYC4KCkNhbGxiYWNrcyBydW4gb25seSBpbnNpZGUgdGhlIFdvcmtlci4gVGhlIHBvcnQgY2FycmllcyBjYWxsYmFjayBpZHMsIGhvc3QtaXNzdWVkIHByZXNlbnRhdGlvbiBpZHMsIEpTT04gc25hcHNob3RzLCBkZXNjcmlwdGlvbnMsIGFuZCBzZWxlY3Rpb24gYW5zd2VycywgYW5kIGVhY2ggY2FsbGJhY2sgaXMgY2FsbGVkIHdpdGggYChpbnB1dCwgcHJlc2VudGF0aW9uSWQpYC4gQSBkZXNjcmlwdGlvbiBpcyBgeyB0aXRsZSwgbGluZXMsIHJvd3M6IFt7IGlkLCBsYWJlbCB9XSB9YC4gSXQgaG9sZHMgYXQgbW9zdCA2NCBsaW5lcyBhbmQgNjQgdW5pcXVlbHkgbmFtZWQgcm93cywgMjU2IGNoYXJhY3RlcnMgZm9yIHRoZSB0aXRsZSBhbmQgZm9yIGVhY2ggbGluZSBvciBsYWJlbCwgNjQgY2hhcmFjdGVycyBwZXIgcm93IGlkLCBhbmQgMzI3NjggYnl0ZXMgaW4gdG90YWwuIFJvdyBpZHMgbWF5IHVzZSBsZXR0ZXJzLCBkaWdpdHMsIHVuZGVyc2NvcmVzLCBoeXBoZW5zLCBhbmQgY29sb25zLiBUaGUgaG9zdCBkcmF3cyBldmVyeSBzdHJpbmcgd2l0aCBgdGV4dENvbnRlbnRgIGluIGZpeGVkIHN0eWxlcyBpbnNpZGUgdGhlIG1hcCByZWN0YW5nbGUsIGFuZCBpdCBrZWVwcyBpdHMgb3duIENsb3NlIGFuZCBVc2UgZ2FtZSBzY3JlZW4gY29udHJvbHMuIFdoZW4gc2V2ZXJhbCBlbGlnaWJsZSBXb3JrZXJzIHJlZ2lzdGVyIGZvciBvbmUgZmFtaWx5LCB0aGUgbW9zdCByZWNlbnQgcmVnaXN0cmF0aW9uIGhhbmRsZXMgaXQsIHdoaWxlIGxlZ2FjeSBtZW51IGFuZCBzY3JlZW4gcHJlc2VudGVycyBrZWVwIHRoZWlyIGV4aXN0aW5nIHByZWNlZGVuY2UuIEVhY2ggV29ya2VyIGNhbiBtYWtlIGF0IG1vc3QgZWlnaHQgcmVnaXN0cmF0aW9uIGNhbGxzIHBlciBzZWNvbmQgYWNyb3NzIHRoZXNlIGZpdmUgbWV0aG9kcywgb24gdG9wIG9mIHRoZSBicm9rZXIgbGltaXRzLgoKQSBtZW51J3MgYGRlc2NyaWJlYCBjYWxsYmFjayByZWNlaXZlcyBgeyBpZCwgdGl0bGUsIGZvb3RlciwgY2hvaWNlczogW3sgaWQsIGxhYmVsLCBkaXNhYmxlZCB9XSwgYnJvd3NlT25seSB9YCwgd2l0aG91dCB0aGUgbGl2ZSBkZXRhaWwgY2FsbGJhY2sgb3IgY29tbWFuZCBrZXlzLiBDbGlja2luZyBhIHJvdyBjYWxscyBgc2VsZWN0KHsgYWN0aW9uOiByb3dJZCB9LCBwcmVzZW50YXRpb25JZClgIGluIHRoZSBXb3JrZXIsIHdoaWNoIGFuc3dlcnMgYHsga2luZDogImNob29zZSIsIGNob2ljZTogb3JpZ2luYWxDaG9pY2VJZCB9YCBvciBgeyBraW5kOiAiY2FuY2VsIiB9YC4gVGhlIGhvc3QgcmVqZWN0cyBhIGRpc2FibGVkLCBmb3JlaWduLCBvciBicm93c2Utb25seSBjaG9pY2UuIEEgbWVudSB3aXRoIG1vcmUgdGhhbiA2NCBjaG9pY2VzIGZhbGxzIGJhY2sgdG8gdGhlIGdhbWUuIENvbW1hbmQga2V5cyBhbmQgZGV0YWlsIHBhbmVzIHN0YXkgYXZhaWxhYmxlIHRocm91Z2ggVXNlIGdhbWUgc2NyZWVuLiBGb3IgZXhhbXBsZToKCmBgYGpzCmNvbnN0IG9mZmVyZWRNZW51cyA9IG5ldyBNYXAoKTsKYXdhaXQgbW9kLnVpLm1lbnUucmVwbGFjZSgKICAobWVudSwgcHJlc2VudGF0aW9uSWQpID0+IHsKICAgIGNvbnN0IGNob2ljZXMgPSBtZW51LmNob2ljZXMuZmlsdGVyKChjaG9pY2UpID0+ICFjaG9pY2UuZGlzYWJsZWQpOwogICAgb2ZmZXJlZE1lbnVzLmNsZWFyKCk7CiAgICBvZmZlcmVkTWVudXMuc2V0KHByZXNlbnRhdGlvbklkLCBjaG9pY2VzKTsKICAgIHJldHVybiB7IHRpdGxlOiBtZW51LnRpdGxlLCBsaW5lczogW10sIHJvd3M6IGNob2ljZXMubWFwKChjaG9pY2UsIGluZGV4KSA9PiAoeyBpZDogU3RyaW5nKGluZGV4KSwgbGFiZWw6IGNob2ljZS5sYWJlbCB9KSkgfTsKICB9LAogICh7IGFjdGlvbiB9LCBwcmVzZW50YXRpb25JZCkgPT4gewogICAgY29uc3QgY2hvaWNlID0gb2ZmZXJlZE1lbnVzLmdldChwcmVzZW50YXRpb25JZCk/LltOdW1iZXIoYWN0aW9uKV07CiAgICBvZmZlcmVkTWVudXMuZGVsZXRlKHByZXNlbnRhdGlvbklkKTsKICAgIHJldHVybiBjaG9pY2UgPyB7IGtpbmQ6ICJjaG9vc2UiLCBjaG9pY2U6IGNob2ljZS5pZCB9IDogeyBraW5kOiAiY2FuY2VsIiB9OwogIH0sCik7CmBgYAoKVGhlIGV4YW1wbGUgc3RvcmVzIHRoZSBvcmlnaW5hbCBjaG9pY2VzIGluIGEgYm91bmRlZCBXb3JrZXItbG9jYWwgbWFwIGtleWVkIGJ5IHRoZSBob3N0J3MgcHJlc2VudGF0aW9uIGlkLiBBIHNjcmVlbiBwcmVzZW50ZXIgcmVjZWl2ZXMgdGhlIEpTT04gYFNjcmVlblZpZXdgLCB3aXRoIGl0cyBibG9ja3MgYW5kIG9mZmVyZWQgYWN0aW9uIGlkcy4gSXRzIHNlbGVjdGlvbiBjYWxsYmFjayBjbG9zZXMgdGhlIHNjcmVlbiBieSByZXR1cm5pbmcgYG51bGxgIG9yIGB7IGtpbmQ6ICJkaXNtaXNzIiB9YC4gUmV0dXJuaW5nIGB7IGtpbmQ6ICJyZWZyZXNoIiB9YCBjYWxscyB0aGUgV29ya2VyLWxvY2FsIGRlc2NyaXB0aW9uIGNhbGxiYWNrIGFnYWluLCB1cCB0byA2NCB0aW1lcyBwZXIgc2NyZWVuLCB3aGljaCBpcyBlbm91Z2ggZm9yIGxvY2FsIHRhYnMsIHNvcnRpbmcsIGFuZCBvdGhlciBwcmVzZW50YXRpb24gY2hvaWNlcyB3aXRoIG5vIGxpdmUgaG9zdCBoYW5kbGVyLiBBbnkgcmVxdWVzdCBmb3IgYSBnYW1lIGFjdGlvbiwgaW5jbHVkaW5nIGB7IGFjdGlvbjogb3JpZ2luYWxBY3Rpb25JZCB9YCwgZGVjbGluZXMgdGhlIHJlcGxhY2VtZW50IGFuZCBvcGVucyB0aGUgZ2FtZSdzIHNjcmVlbi4gVGhlIGJyaWRnZSBuZXZlciBjYWxscyBleGlzdGluZyBgU2NyZWVuSG9zdC5pbnZva2VgIGltcGxlbWVudGF0aW9ucywgc2luY2UgdGhleSBjYW4gYXdhaXQgcHJvbXB0cyBhbmQgY29tbWl0IG11dGF0aW9ucyB3aXRob3V0IGNoZWNraW5nIHRoZSBXb3JrZXIgZ3JhbnQgYWdhaW4uIFJlbmFtaW5nLCBmaWxlIGV4cG9ydCwgYW5kIHVwZGF0ZSBhY3Rpb25zIHN0YXkgb24gdGhlIGdhbWUncyBvd24gc2NyZWVuIHVudGlsIHRob3NlIGFjdGlvbnMgaGF2ZSBndWFyZGVkIHNlcmlhbGl6ZWQgdHJhbnNhY3Rpb25zLiBUaGUgcHJlc2VudGVyIHlpZWxkcyBiZWZvcmUgYW55IGhvc3QgcHJvbXB0LiBFc2NhcGUgYW5kIENsb3NlIGRpc21pc3MgaXQsIGFuZCB0aGUgV29ya2VyIHJlY2VpdmVzIG5vIGtleSBvciBhY3Rpb24gZnJvbSBlaXRoZXIuIFByZXNlbnRlcnMgYXJlIG5ldmVyIG9mZmVyZWQgcGVybWlzc2lvbiBvciBjb250cm9sbGVyLWNvbnNlbnQgZGlhbG9ncywgYW5kIENvcmUgc2NyZWVuIGlkcyBzdGF5IGhvc3Qtb3duZWQuCgpUaGUgbWFuYWdlbWVudCBwcmVzZW50ZXIgcmVjZWl2ZXMgYHsgaWQ6ICJtb2RzIiB9YCBhbmQgdXNlcyB0aGUgc2FtZSBkZXNjcmlwdGlvbiBncmFtbWFyLiBTZWxlY3RpbmcgYSByb3cgcnVucyBhIFdvcmtlci1sb2NhbCBzZWxlY3Rpb24gY2FsbGJhY2sgYW5kIGdyYW50cyBubyBtYW5hZ2VtZW50IG9wZXJhdGlvbi4gVGhlIGhvc3QgYWx3YXlzIGRyYXdzIFBlcm1pc3Npb25zIGFuZCBnYW1lIGNvbnRyb2xzIGFib3ZlIG1vZCBwYW5lbHMuIENob29zaW5nIHRoYXQgY29udHJvbCBkZWNsaW5lcyB0aGUgcmVwbGFjZW1lbnQsIGFuZCB0aGUgZ2FtZSdzIE1vZHMgc2NyZWVuIG9wZW5zIHdpdGggbW9kIHBhbmVscyBzdXNwZW5kZWQgYW5kIGFsbCBuYXZpZ2F0aW9uIGRyYXduIGJ5IENvcmUsIG91dHNpZGUgbWVudSwgc2NyZWVuLCBhbmQgdGV4dCByZXBsYWNlbWVudC4gTm8gV29ya2VyIG1ldGhvZCBjYW4gbmFtZSBhbm90aGVyIG1hbmFnZW1lbnQgc2NyZWVuLCByZXNvbHZlIGEgY29uZmlybWF0aW9uLCBvciBzdXBwbHkgYSBwZXJtaXNzaW9uIGRlY2lzaW9uLgoKVGhlIGRpc3BsYXkgY2FsbGJhY2sgcmVjZWl2ZXMgYHsgZ3JpZCwgdmlld3BvcnQsIG1hcCB9YCwgd2hlcmUgYG1hcGAgaXMgdGhlIG1hcCdzIHJlY3RhbmdsZSBpbiB0aGUgY2hhcmFjdGVyIGdyaWQuIEl0IHJldHVybnMgYW4gYXJyYXkgb2YgYXQgbW9zdCA1MTIgYHsgY29sLCByb3csIGdseXBoLCBjb2xvciB9YCByZWNvcmRzIHdpdGhpbiA2MDAwMCBieXRlcy4gQ29vcmRpbmF0ZXMgYXJlIGludGVnZXJzIGZyb20gLTMyNzY3IHRvIDMyNzY3LCBjb3VudGVkIGZyb20gdGhlIG1hcCdzIHRvcC1sZWZ0IGNlbGwsIGFuZCBjZWxscyBvdXRzaWRlIHRoZSBtYXAgYXJlIGNsaXBwZWQuIEVhY2ggZ2x5cGggaXMgb25lIFVuaWNvZGUgY29kZSBwb2ludCB3aXRoIG5vIGNvbnRyb2wgb3IgZm9ybWF0dGluZyBjaGFyYWN0ZXJzLCBhbmQgZWFjaCBjb2xvciBpcyBgbm9ybWFsYCwgYG11dGVkYCwgYHdhcm5pbmdgLCBgZGFuZ2VyYCwgb3IgYGdvb2RgLiBUaGUgaG9zdCBhc2tzIGZvciBhdCBtb3N0IHRlbiBmcmFtZXMgcGVyIHNlY29uZCB3aXRoIG9uZSByZXF1ZXN0IGluIGZsaWdodCBhbmQgZHJhd3MgaW5lcnQgZ2x5cGggZWxlbWVudHMgb3ZlciB0aGUgZ2FtZSdzIG93biBtYXAuIFRoZSBncmFudCBnaXZlcyB0aGUgV29ya2VyIGdlb21ldHJ5IG9ubHksIHdpdGggbm8gaGlkZGVuIHN0YXRlIGFuZCBubyBjYW52YXMuIEtub3duIHdvcmxkIGRhdGEgY29tZXMgZnJvbSBzZXBhcmF0ZWx5IGdyYW50ZWQgdmlldyBjYWxscy4KCkV2ZXJ5IGRlc2NyaXB0aW9uIGFuZCBzZWxlY3Rpb24gaGFzIGEgMjUwIG1zIGRlYWRsaW5lLiBBbiBhbnN3ZXIgdGhhdCBpcyBpbnZhbGlkLCBsYXRlLCByZXZva2VkLCBzdXBlcnNlZGVkLCBvciB0aWVkIHRvIGEgY2hhbmdlZCBiaW5kaW5nIG9yIHNlc3Npb24gZGVjbGluZXMgdGhlIHByZXNlbnRhdGlvbiwgYW5kIHRoZSBnYW1lJ3MgcmVuZGVyZXIgb3Igc2NyZWVuIHRha2VzIG92ZXIuIE1hcCBvdXRwdXQgZXhwaXJlcyBhZnRlciAyNTAgbXMgYW5kIGNsZWFycyB3aGVuIHRoZSBnYW1lIGZyYW1lIGNoYW5nZXMgb3IgYSBob3N0IGRpYWxvZyBvcGVucy4gQW4gaW50ZXJhY3RpdmUgcHJlc2VudGVyIGNhbiBvd24gYSBnYW1lcGxheSBtb2RhbCBvZmZlcmVkIHRvIGl0LCBidXQgQ29yZSBxdWVzdGlvbnMgaGlkZSBhbmQgY2FuY2VsIGl0LCBldmVuIGluc2lkZSBhIGdhbWVwbGF5IG1vZGFsIHRoYXQgaXMgYWxyZWFkeSBvcGVuLiBNb2Qgb3V0cHV0IG5ldmVyIGVudGVycyB0aGUgYnJvd3NlcidzIHRvcCBsYXllciBhbmQgbmV2ZXIgcmVjZWl2ZXMgcGVybWlzc2lvbi1kaWFsb2cgaW5wdXQsIHJlc2VydmVkIGtleXMsIERPTSBub2RlcywgY2FudmFzIG9iamVjdHMsIHRyYW5zZmVyYWJsZXMsIG9yIHNoYXJlZCBidWZmZXJzLgoKVGhlIGJpcnRoIGNhbGxiYWNrIHJlY2VpdmVzIGB7IGtpbmQ6ICJiaXJ0aCIsIHN0ZXBJZCwgc3RhZ2UsIGRyYWZ0LCBjaG9pY2VzOiBbeyBpZCwgbGFiZWwsIHZhbHVlTWF4PyB9XSB9YC4gQ3JlYXRpb24gcnVucyByYWNlIGZpcnN0LCB0aGVuIGNsYXNzLCB0aGVuIGRyYWZ0IGVkaXRpbmcsIHdpdGggYXQgbW9zdCA2NCBzdGVwcyBhbmQgYXQgbW9zdCA2NCByYWNlcyBvciBjbGFzc2VzLiBMYXJnZXIgY2F0YWxvZ3MgdXNlIHRoZSBnYW1lJ3Mgc2NyZWVucy4gVGhlIFdvcmtlciBhbnN3ZXJzIHdpdGggdGhlIHNhbWUgZGVzY3JpcHRpb24gZ3JhbW1hciwgbWFwcGluZyBvZmZlcmVkIGNob2ljZXMgdG8gcm93cyB0aGF0IGhvbGQgb25seSBgaWRgIGFuZCBgbGFiZWxgLiBDbGlja2luZyBhIHJvdyBzZW5kcyBgc2VsZWN0KHsgYWN0aW9uOiByb3dJZCwgc3RlcElkIH0sIHByZXNlbnRhdGlvbklkKWAsIGFuZCB0aGUgYW5zd2VyIGlzIGB7IHN0ZXBJZCwgY2hvaWNlOiBvZmZlcmVkQ2hvaWNlSWQsIHZhbHVlPyB9YC4gRXZlcnkgc3RlcCBnZXRzIGZyZXNoIG9wYXF1ZSBpZHMuIEEgZm9yZWlnbiBjaG9pY2UsIGEgc3RhbGUgc3RlcCwgYW4gdW5rbm93biBmaWVsZCwgb3IgYW4gaW52YWxpZCB2YWx1ZSBkZWNsaW5lcyB0aGUgcmVwbGFjZW1lbnQsIGFuZCB0aGF0IHByb3Bvc2FsIGlzIG5vdCBhcHBsaWVkLiBUaGUgaG9zdCdzIGJpcnRoIHNlc3Npb24gY2hlY2tzIHJhY2UsIGNsYXNzLCBwb2ludC1idXksIGFuZCByb2xsZXIgY2hhbmdlcyBhZ2FpbnN0IHRoZSBnYW1lJ3MgcnVsZXMuIERyYWZ0IGNob2ljZXMgYWxzbyBjb3ZlciBib3VuZGVkIG5hbWUgYW5kIGJhY2tncm91bmQgcHJvcG9zYWxzLCByYW5kb20gbmFtZXMsIGFuZCByZWdlbmVyYXRpbmcgb3IgcmVzdG9yaW5nIHRoZSBiYWNrZ3JvdW5kLiBPbmx5IGEgY2hvaWNlIHdpdGggYHZhbHVlTWF4YCB0YWtlcyBhIHN0cmluZyB2YWx1ZS4gTmFtZXMgZm9sbG93IHRoZSBnYW1lJ3MgbmFtZSBsaW1pdCwgYmFja2dyb3VuZHMgYWxsb3cgMTAyNCBjaGFyYWN0ZXJzLCBhbmQgbmVpdGhlciBtYXkgY29udGFpbiBjb250cm9sIG9yIGZvcm1hdHRpbmcgY2hhcmFjdGVycy4gQmlydGggYW5kIHNjb3JlIG9wdGlvbnMgc3RheSBsb2NrZWQsIGV2ZW4gd2l0aCBgb3B0aW9uczptYW5hZ2VgLgoKUmV2aWV3IGNoYXJhY3RlciByZXF1ZXN0cyBhIHNlcGFyYXRlIGhvc3QtZHJhd24gbW9kYWwgd2l0aCB0aGUgYWN0dWFsIG5hbWUsIHJhY2UsIGNsYXNzLCBzdGF0cywgYmFja2dyb3VuZCwgYW5kIGV2ZXJ5IGJpcnRoIG9wdGlvbiwgYW5kIGFsbCBtb2QgcGFuZWxzIGFuZCBkcmF3aW5nIGFyZSBzdXNwZW5kZWQgd2hpbGUgaXQgaXMgb3Blbi4gT25seSBpdHMgU3RhcnQgY2hhcmFjdGVyIGJ1dHRvbiBjYW4gY2FsbCB0aGUgaG9zdCdzIGFjY2VwdGFuY2Ugc3RlcC4gVGhlIFdvcmtlciBoYXMgbm8gYWNjZXB0IG9wZXJhdGlvbiBhbmQgY2Fubm90IHN1cHBseSBvciByZXN0eWxlIHRoaXMgc3VtbWFyeS4gQmVmb3JlIGFjY2VwdGFuY2UsIHRoZSBob3N0IHJlY2hlY2tzIHRoZSBncmFudCwgcGF5bG9hZCBiaW5kaW5nLCBnYW1lLXN0YXRlIGlkZW50aXR5LCBhbmQgYnJva2VyIGVwb2NoLCBhbmQgY29uZmlybXMgdGhlIGRyYWZ0IGlzIHVuY2hhbmdlZC4gQmFjayB0byBjcmVhdGlvbiByZXR1cm5zIHRvIGVkaXRpbmcsIGFuZCBDbG9zZSBjYW5jZWxzIGNyZWF0aW9uLiBVc2UgZ2FtZSBzY3JlZW4sIG9yIGFuIGludmFsaWQgb3IgZXhwaXJlZCBwcm9wb3NhbCwgb3BlbnMgdGhlIGdhbWUncyBiaXJ0aCBzY3JlZW5zLgoKT24gZGVza3RvcCBvbmx5LCBgYmFja3VwOmZvbGRlcmAgZ2l2ZXMgYSBXb3JrZXIgYGJhY2t1cEZvbGRlci5uYW1lKClgLCBgY2hvb3NlKClgLCBgZm9yZ2V0KClgLCBgbGlzdCgpYCwgYHdyaXRlKG5hbWUsIHRleHQpYCwgYHdyaXRlU2F2ZWQoZmlsZUlkKWAsIGBvblNhdmUobGlzdGVuZXIpYCwgYW5kIGBvZmYoc3Vic2NyaXB0aW9uKWAuIFRoZSBob3N0IHRha2VzIHRoZSBuYXRpdmUgYXV0aG9yaXR5IGhhbmRsZSBmcm9tIGl0cyBtZWFzdXJlZCBpbnN0YWxsYXRpb24sIGFuZCB0aGUgV29ya2VyIGNhbm5vdCBzZW5kIGEgZm9sZGVyIHBhdGgsIHB1cnBvc2UsIGRpZ2VzdCwgb3IgaW5zdGFsbGF0aW9uIGhhbmRsZS4gVGhlIG5hdGl2ZSBmb2xkZXIgcGlja2VyIG5hbWVzIHRoZSBtb2QuIEVhY2ggd3JpdGUgcmFpc2VzIGFub3RoZXIgbmF0aXZlIGNvbmZpcm1hdGlvbiBuYW1pbmcgdGhlIG1vZCwgdGhlIGZpbGUsIGFuZCB0aGUgZm9sZGVyLCB0aGVuIHJldHVybnMgYSBzaW5nbGUtdXNlIHBsYW4gdGhhdCBvbmx5IHRoZSBob3N0IGhvbGRzLiBUaGUgaG9zdCByZWNoZWNrcyBhdXRob3JpdHkgYW5kIHRoZSBXb3JrZXIgZXBvY2ggYmVmb3JlIGNvbW1pdHRpbmcgdGhlIHBsYW4uIFBsYW5zIGV4cGlyZSBhZnRlciAzMCBzZWNvbmRzLCBhbmQgcmV2b2NhdGlvbiBpbnZhbGlkYXRlcyB0aGVpciBuYXRpdmUgYXV0aG9yaXR5LiBGaWxlcyBzdGF5IGluc2lkZSB0aGUgZGVza3RvcCdzIHBlci1pbnN0YWxsYXRpb24gc3ViZm9sZGVyLiBBIGN1c3RvbSBgd3JpdGVgIHRha2VzIGEgcGxhaW4gQVNDSUkgYC5uZW9jaGFyYCBmaWxlbmFtZSBvZiB1cCB0byAyNTUgY2hhcmFjdGVycyBhbmQgYXQgbW9zdCAzMjc2OCBVVEYtOCBieXRlcyBvZiB0ZXh0LiBUaGUgaG9zdCBhbGxvd3Mgb25lIHBlbmRpbmcgb3BlcmF0aW9uIGFuZCAxNiByZXF1ZXN0cyBwZXIgbWludXRlLCBhbmQgdGhlIGRlc2t0b3Agc2VwYXJhdGVseSBjYXBzIHBsYW4gcmVxdWVzdHMgYW5kIGNvbW1pdHMgYXQgMzIgcGVyIG1pbnV0ZS4gVGhlIGV4aXN0aW5nIGRlc2t0b3AgbGltaXRzIG9mIDIwMCBmaWxlcyBhbmQgMjU2IE1pQiBwZXIgYWxsb2NhdGlvbiBhbHNvIGFwcGx5LiBXb3JrZXIgbGlzdGluZ3MgcmV0dXJuIGZpbGUgbmFtZXMgd2l0aCBlbXB0eSBjaGFyYWN0ZXIgbWV0YWRhdGEsIG5ldmVyIGZpbGUgdGV4dCBvciBwYXRocy4gQSBicm93c2VyLW9ubHkgaG9zdCByZWZ1c2VzIHRoaXMgV29ya2VyIG1lY2hhbmlzbS4KCldvcmtlciBgb25TYXZlYCBkZWxpdmVycyBgeyBpZCwgbmFtZSwgc2l6ZSB9YCB3aXRoaW4gdGhlIHJlcGx5IGJ5dGUgYnVkZ2V0LiBUaGUgaG9zdCBrZWVwcyBvbmUgbGF0ZXN0IGZpbGUgb2YgdXAgdG8gOCBNaUIgcGVyIFdvcmtlciwgYW5kIHRoaXMgcGVybWlzc2lvbiBuZXZlciByZWxlYXNlcyBpdHMgY29udGVudHMuIGB3cml0ZVNhdmVkKGZpbGUuaWQpYCBoYXMgdGhlIGRlc2t0b3Agd3JpdGUgdGhvc2UgZXhhY3QgaG9zdC1oZWxkIGJ5dGVzIHVuZGVyIHRoZSBob3N0J3MgZmlsZW5hbWUsIHNvIHRoZSBXb3JrZXIgbmV2ZXIgcHVzaGVzIHRoZSBmaWxlIG9yIGEgcGF0aCB0aHJvdWdoIGl0cyBzbWFsbGVyIGNhbGwgZW52ZWxvcGUuIEluIFR5cGVTY3JpcHQsIHRoZXNlIHJ1bnRpbWUgYWRkaXRpb25zIGFuZCB0aGUgV29ya2VyIG5vdGljZSBzaGFwZSBuZWVkIGxvY2FsIHR5cGVzLCBiZWNhdXNlIHRoZSBTREsncyBuYW1lLWFuZC10ZXh0IGNhbGxiYWNrIGRlc2NyaWJlcyB0aGUgc2VwYXJhdGUgaW4tcHJvY2VzcyBjb250cmFjdC4gVGhlIGlkIHN0b3BzIHdvcmtpbmcgaWYgdGhlIGZpbGUncyBieXRlcyBvciBmaWxlbmFtZSBjaGFuZ2UsIGlmIHRoZSBiaW5kaW5nLCBzZXNzaW9uLCBvciBlcG9jaCBjaGFuZ2VzLCBvciBvbiByZXZvY2F0aW9uIG9yIHRlYXJkb3duLiBUaGUgaG9zdCBhbHNvIHJlY2hlY2tzIHRoZSByZXRhaW5lZCBmaWxlIGFmdGVyIG5hdGl2ZSBjb25maXJtYXRpb24uIExhcmdlciBjdXN0b20gdXBsb2FkcywgYW5kIGhvc3QgZmlsZXMgYmV5b25kIDggTWlCLCBuZWVkIGEgc2VwYXJhdGUgYm91bmRlZCBtZWNoYW5pc20uCgpBIG1vZCBydW5zIGluIGEgV29ya2VyIGZvciBpc29sYXRpb24uIEl0cyBjb2RlIHJ1bnMgYXBhcnQgZnJvbSB0aGUgZ2FtZSwgYW5kIHRoZSBnYW1lIHJlYWNoZXMgaXQgb25seSB0aHJvdWdoIG1lc3NhZ2VzLiBNb2RzIGNhbiBhbHNvIGNoYW5nZSB0aGUgZ2FtZSBpbi1wcm9jZXNzLCBhbmQgdGhlIFdvcmtlciBsaW1pdHMgb24gdGhpcyBwYWdlIGRvIG5vdCByZXN0cmljdCBpbi1wcm9jZXNzIG1vZHMuCgpBIG1vZCB3aXRoIGAicnVudGltZSI6ICJ3b3JrZXIiYCBkZWZhdWx0LWV4cG9ydHMgdGhlIHNhbWUgZGVmaW5pdGlvbiBhbmQgZ2V0cyB0aGUgc2FtZSBkb21haW5zLCByZXN1bHRzIGFuZCBrbm93bi1vbmx5IGRhdGEgYXMgYW4gaW4tcHJvY2VzcyBtb2QuIEl0cyBtYW5pZmVzdCBuYW1lcyBhbiBgYXBpYCByYW5nZSB0aGF0IEFQSSAyIHNhdGlzZmllcyBhbmQgdGhlIG1vZHVsZSB0byBzdGFydCBpbiBgZW50cnlgLiBFYWNoIGNhbGwgYmVjb21lcyBhIG1lc3NhZ2UgdG8gdGhlIGdhbWUncyBicm9rZXIgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC13b3JrZXIvaG9zdC50c2ApLCB3aGljaCBzZXJ2ZXMgaXQgd2l0aCB0aGUgaW4tcHJvY2VzcyBob3N0IGFuZCBwb3N0cyBiYWNrIGEgY29weSBvZiB0aGUgYW5zd2VyLiBUaGUgV29ya2VyIHJ1bnMgaW4gYSBzYW5kYm94IHdpdGggbm8gbmV0d29yayBhbmQgbm9uZSBvZiB0aGUgZ2FtZSdzIHN0b3JhZ2UgKFtXT1JLRVJfSVNPTEFUSU9OLm1kXShXT1JLRVJfSVNPTEFUSU9OLm1kKSkuCgpSdW5uaW5nIHRoZXJlIGNvc3RzIGEgbW9kIHRoZXNlIHRoaW5nczoKCi0gSG9va3MgdGhhdCBhbnN3ZXIgaW5zaWRlIGEgdHVybi4gQSB0dXJuIGNhbm5vdCBwYXVzZSBmb3IgYSBXb3JrZXIgbWVzc2FnZSwgc28gYW55IGhvb2sgdGhhdCByZXR1cm5zIGFuIGFuc3dlciBkdXJpbmcgYSB0dXJuIGNvbWVzIGZyb20gYHBvbGljaWVzYC4gSW5zaWRlIGEgV29ya2VyLCBgaG9va3MoY29udGV4dClgIGNhbiBkZWNsYXJlIG9ubHkgYG9wdGlvbnNDaGFuZ2VkYCwgYGFiaWxpdHlHYWluZWRgLCBgbW9uc3RlckJlY2FtZVZpc2libGVgLCBhbmQgYGFydGlmYWN0SWRlbnRpZmllZGAsIGFuZCB0aGUgZ2FtZSBwYXNzZXMgZWFjaCBvZiB0aGVtIHRvIHRoZSBXb3JrZXIgd2l0aG91dCB3YWl0aW5nIGZvciBhIHJlcGx5LiBJZiBgaG9va3MoY29udGV4dClgIHN1cHBsaWVzIGFueSBvdGhlciBob29rIGZ1bmN0aW9uLCB0aGUgTW9kcyBzY3JlZW4gcmVwb3J0cyBpdCBhbmQgdGhlIGdhbWUgZG9lcyBub3QgaW5zdGFsbCBpdC4KLSBBc3luY2hyb25vdXMgY2FsbHMuIEV2ZXJ5IFdvcmtlciBjYWxsIHJldHVybnMgYSBwcm9taXNlLCBhbmQgZXZlcnkgdmFsdWUgdGhlIFdvcmtlciByZWNlaXZlcyBpcyBhIGNvcHkuIGBtZXRhLmdyYW50ZWRgIGlzIHRoZSBvbmUgcXVlc3Rpb24gdGhlIFdvcmtlciBhbnN3ZXJzIGxvY2FsbHkuCi0gTWFuYWdlbWVudCBhbmQgdHJ1dGggcmVhZHMuIGBtYW5hZ2VgIGhvbGRzIG9ubHkgdGhlIG5hbWVkIHNlcmlhbGl6ZWQgb3BlcmF0aW9ucyBkb2N1bWVudGVkIGJlbG93LiBXaXRoIGVpdGhlciBleHBsaWNpdCB0cnV0aCBncmFudCwgYSBXb3JrZXIgYWxzbyBnZXRzIGB0cnV0aC5sZXZlbGAsIGB0cnV0aC5tb25zdGVyc2AsIGB0cnV0aC5yYWNlYCwgYW5kIGB0cnV0aC5zdG9yZUtub3dsZWRnZWAsIGFuZCBlYWNoIG9mIHRob3NlIG1ldGhvZHMgc3RpbGwgcmVxdWlyZXMgaXRzIG93biBncmFudC4KLSBGaWxlcyBhbmQgdGhlIG5ldHdvcmsuIFRoZSBzYW5kYm94IGNhbm5vdCBsb2FkIGFueXRoaW5nLCBzbyBgY29udGVudC5hc3NldChwYXRoKWAgYW5zd2VycyB3aXRoIGEgYGRhdGE6YCBVUkwgdGhhdCBob2xkcyB0aGUgZmlsZSdzIGJ5dGVzLiBgbmV0LmNyZWRlbnRpYWwobmFtZSlgIGhhbmRzIHRoZSBXb3JrZXIgb25seSBhIHJlZmVyZW5jZS4gVGhlIGdhbWUgaG9sZHMgdGhlIGNyZWRlbnRpYWwgdmFsdWUgYW5kIGFkZHMgaXQgdG8gdGhlIHJlcXVlc3Qgb25jZSB0aGUgcmVxdWVzdCBoYXMgbGVmdCB0aGUgV29ya2VyLgotIEEgd2lsZGNhcmQgZ3JhbnQuIEEgV29ya2VyIGhvbGRzIHRoZSBwZXJtaXNzaW9ucyB0aGUgcGxheWVyIGdyYW50ZWQsIHVuZGVyIHRoZWlyIEFQSSAyIG5hbWVzLiBSZXF1ZXN0aW5nIGAiKiJgIGdyYW50cyBub3RoaW5nLgoKVGhlIGJyb2tlciByZWZ1c2VzIGEgbWVzc2FnZSBvdmVyIDY0IEtCIGFuZCBhbnkgY2FsbCBwYXN0IDIwMCBpbiBvbmUgc2Vjb25kLiBJdCBwaW5ncyB0aGUgV29ya2VyIGV2ZXJ5IHNlY29uZCwgYW5kIGEgV29ya2VyIHRoYXQgbGVhdmVzIGEgcGluZyB1bmFuc3dlcmVkIGZvciA1IHNlY29uZHMgaXMgc3RvcHBlZCBhbmQgc3dpdGNoZWQgb2ZmIGZvciB0aGUgc2Vzc2lvbiwgd2l0aCB0aGUgbm90aWNlIGEgbW9kIHRoYXQga2VlcHMgZmFpbGluZyBnZXRzLiBXaGVuIHRoZSBnYW1lIGFza3MgdGhlIFdvcmtlciB0byBtaWdyYXRlIGl0cyBiYWcgb3IgaXRzIHByZWZlcmVuY2VzIGFuZCBoYXMgbm8gYW5zd2VyIHdpdGhpbiAzIHNlY29uZHMsIGl0IGdvZXMgb24gd2l0aG91dCBvbmU6IHRoZSBjaGFyYWN0ZXIga2VlcHMgaXRzIG9sZCBiYWcsIHRoZSBzdG9yZWQgcHJlZmVyZW5jZXMgc3RheSBhcyB0aGV5IHdlcmUsIGFuZCBgc3RvcmUucHJlZnMuZ2V0YCBhbnN3ZXJzIGB1bmF2YWlsYWJsZWAuIEFuIGFuc3dlciB0aGF0IGFycml2ZXMgYWZ0ZXIgdGhhdCBpcyBkcm9wcGVkLiBUaGUgTW9kIHBlcmZvcm1hbmNlIHNjcmVlbiBzaG93cyBhIFdvcmtlciBtb2QncyByZXBseSB0aW1lIGFuZCBuZXR3b3JrIHdhaXQgaW4gdGhlaXIgb3duIGNvbHVtbnMsIGFwYXJ0IGZyb20gaXRzIENQVSB0aW1lLgoKVGhlIFdvcmtlciBwcm94eSByZWplY3RzIGFuIG92ZXJzaXplZCBjYWxsIGJlZm9yZSBzZW5kaW5nIGl0LCBhbmQgdGhlIGJyb2tlciByZXR1cm5zIGEgYm91bmRlZCBlcnJvciBmb3IgYW4gaWRlbnRpZmlhYmxlIG92ZXJzaXplZCBvciBtYWxmb3JtZWQgY2FsbC4gQSBtaWdyYXRpb24gdGltZW91dCBzdGFydHMgYSBuZXcgZXBvY2g6IHRoZSBicm9rZXIgcmVmdXNlcyBjYWxscyBmcm9tIGVhcmxpZXIgZXBvY2hzIGJlZm9yZSBydW5uaW5nIHRoZW0gYW5kIGtlZXBzIGVhY2ggcGVuZGluZyBjYWxsJ3Mgb3JpZ2luYWwgZXBvY2ggb24gaXRzIHJlcGx5LiBXaGVuIHRoZSBXb3JrZXIgbGVhcm5zIG9mIGEgbmV3IGVwb2NoLCBpdCByZWplY3RzIGl0cyBzdXBlcnNlZGVkIHBlbmRpbmcgY2FsbHMsIHNvIGFuIG9sZCByZXBseSBjYW5ub3QgcmVzb2x2ZSBhIGNhbGwgaW4gdGhlIG5ldyBlcG9jaC4KClRoZSBwcmV2aWV3IFdvcmtlciBBQkkgKGBtb2RBcGk6IDJgIHdpdGggYHdvcmtlckVudHJ5YCkgaXMgcmV0aXJlZC4gSXRzIG1hbmlmZXN0IHN0aWxsIHJlYWRzLCBhbmQgdGhlIGxvYWRlciByZWZ1c2VzIGl0cyBjb2RlIHdpdGggYSBub3RlIHRvIHJlYnVpbGQgaXQgYWdhaW5zdCBBUEkgMi4gSXRzIFdvcmtlci1vbmx5IHBlcm1pc3Npb24gbmFtZXMgY29udmVydCB0byBBUEkgMiBuYW1lczogYHVpOnBhbmVsYCBiZWNvbWVzIGB1aTpwYW5lbC5tb3VudGAgYW5kIGBzdGF0ZTptb2RlbC5yZWFkYCBiZWNvbWVzIGBzdGF0ZTpwbGF5ZXIucmVhZGAuIGBwcmVmczpyZWFkYCwgYHByZWZzOndyaXRlYCBhbmQgYGFzc2V0OnJlYWRgIGJlY29tZSBub3RoaW5nLCBzaW5jZSBBUEkgMiBhc2tzIG5vIHBlcm1pc3Npb24gZm9yIGEgbW9kJ3Mgb3duIHByZWZlcmVuY2VzIGFuZCBmaWxlcywgYW5kIHNvIGRvIGBjb21tYW5kOnN1Ym1pdGAsIGB1aTpyZWdpb25gLCBgcXVlcnk6c25hcHNob3RgLCBgcmVnaXN0cnk6ZGVjbGFyZWAsIGBwb2xpY3k6aW5zdGFsbGAgYW5kIGBob29rOnJlc3BvbmRgLCB3aGljaCBoYXZlIG5vIEFQSSAyIGZvcm0uIGBXT1JLRVJfQ0FQQUJJTElUWV9BTElBU0VTYCBpbiB0aGUgU0RLIGhvbGRzIHRoZSB3aG9sZSB0YWJsZS4KCiMjIyBUaGlyZC1wYXJ0eSBtb2RzIGFuZCBjb25zZW50CgpBIHRoaXJkLXBhcnR5IChwdWJsaWMpIG1vZCBjYW4gdXNlIHRoZSBmZWF0dXJlcyBtYXJrZWQgWWVzIGluIHRoZSB0YWJsZSBvbmNlIHRoZSBwbGF5ZXIgZ3JhbnRzIHRoZSBwZXJtaXNzaW9ucyBpdHMgbWFuaWZlc3QgZGVjbGFyZXMuIGBpbnB1dDppbnRlbnRgIGFuZCBga2V5bWFwOndyaXRlYCBkbyBub3QgaW1wbHkgYW55IG9mIHRoZW0uIE1vZHMgdGhhdCBuZWVkIGEgZmVhdHVyZSBtYXJrZWQgTm8gbXVzdCBiZSBmaXJzdC1wYXJ0eS4gUHVibGljIEFQSSAyIGNvZGUgYWx3YXlzIHJ1bnMgaW4gYW4gaXNvbGF0ZWQgV29ya2VyLCBldmVuIHdoZW4gdGhlIG1hbmlmZXN0IGFza3MgZm9yIHBhZ2UgZXhlY3V0aW9uLiBUaGUgaG9zdCBjaGVja3MgZWFjaCBtZXNzYWdlIGFnYWluc3QgdGhlIG1vZCdzIGlkZW50aXR5IGFuZCBncmFudHMsIGFuZCBpdCBjYXBzIG1lc3NhZ2UgYW5kIHJlcGx5IHNpemVzLCBtZXNzYWdlIHJhdGUsIHN1YnNjcmlwdGlvbnMsIGFuZCBVSSBjb3VudCwgc3VjaCBhcyBlaWdodCBwYW5lbCBtb3VudHMgcGVyIG1vZC4gUHVibGljIEFQSSAxIGNvZGUgaXMgcmVmdXNlZC4gRm9yIGRldmVsb3BtZW50LCBhIGxhYiBidWlsZCBhY2NlcHRzIGA/bGFicHJvY2Vzcz08bW9kLWlkPmAgdG8gcnVuIGEgbmFtZWQgZm9sZGVyIG1vZCBpbiB0aGUgZ2FtZSBwYWdlIGlmIHRoZSBtb2QgZGVjbGFyZXMgYW5kIGlzIGdyYW50ZWQgYGVuZ2luZTphY2Nlc3NgIGFuZCBpdHMgY29udGVudCBpcyBhcHByb3ZlZC4gVW5kZXIgTm9kZSwgdGhlIGhlYWRsZXNzIHJ1bm5lcidzIGAtLXVuc2FmZS1pbi1wcm9jZXNzYCBvcHRpb24gZG9lcyB0aGUgc2FtZSwgYW5kIG1vZCBjb2RlIHRoZW4gcnVucyB3aXRoIHRoZSBwcm9jZXNzJ3MgcHJpdmlsZWdlcy4gTmVpdGhlciBvcHQtaW4gbWFrZXMgYSBtb2QgZmlyc3QtcGFydHkuCgp8IEZlYXR1cmUgfCBQZXJtaXNzaW9ucyB8IEF2YWlsYWJsZSB0byBwdWJsaWMgbW9kcyB8CnwtLS18LS0tfC0tLXwKfCBBdXRvcGxheWVyIGNvbnRyb2xsZXIgfCBgaW5wdXQ6Y29udHJvbGxlcmAsIGBpbnB1dDppbnRlbnRgLCBgc3RhdGU6aW50ZXJhY3Rpb24ucmVhZGAuIEEgY29udHJvbGxlciBmcm9tIGFueSBhdXRob3IgcGVybWFuZW50bHkgbWFrZXMgdGhlIGNoYXJhY3RlciB1bnNjb3JhYmxlIGFuZCB0aGUgc2F2ZSBub25kZXRlcm1pbmlzdGljLiB8IFllcyB8CnwgV2F0Y2hpbmcgZ2FtZXBsYXkga2V5cyAoYG9uS2V5YCkgfCBgaW5wdXQ6b2JzZXJ2ZWAgfCBZZXMgfAp8IENvbW1hbmRzIHwgYGNvbW1hbmQ6YWRkYCB8IFllcyB8CnwgUm93cyBvbiB0aGUgdGl0bGUgc2NyZWVuIHwgYHVpOnRpdGxlYCB8IFllcyB8CnwgUm93cyBpbiB0aGUgZ2FtZSBtZW51IHwgYHVpOm1lbnUucm93YCB8IFllcyB8CnwgUHJvZmlsZSBhbmQgc2Vzc2lvbiBtYW5hZ2VtZW50IHwgYHByb2ZpbGVzOm1hbmFnZWAsIGBzZXNzaW9uOmNvbnRyb2xgIHwgWWVzLiBUaGUgbW9kIG1hbmFnZXMgdGhlIHByb2ZpbGVzIGl0IG93bnMsIGFuZCB0aGUgaG9zdCBjb25maXJtcyBzYXZlLCBleGl0LXRvLXRpdGxlLCBhbmQgcXVpdC4gfAp8IENvbnRlbnQgaW5zdGFsbGF0aW9uIGFuZCBzZXNzaW9uIHBhY2tzIHwgYG1vZDppbnN0YWxsYCwgYG1vZDpzZXNzaW9uYCB8IFllcy4gQ29udGVudCBwbGFucyBhcmUgbWVhc3VyZWQgYW5kIG5lZWQgYSBzZXBhcmF0ZSBob3N0IGNvbmZpcm1hdGlvbi4gSW5zdGFsbGVkIGNvbnRlbnQgY2FycmllcyBubyBjb2RlIG9yIGNhcGFiaWxpdGllcy4gfAp8IFJlcG9zaXRvcnkgbWV0YWRhdGEgfCBgbW9kOnJlYWRgIHwgWWVzLiBFYWNoIEdpdEh1YiBsb29rdXAgbmVlZHMgY29uZmlybWF0aW9uIGFuZCByZXR1cm5zIG1ldGFkYXRhIGFuZCBmaWxlIG5hbWVzIG9ubHkuIHwKfCBXaXphcmQgdGVzdGluZyB8IGBkZWJ1Zzp3aXphcmRgIHwgWWVzLiBDb21tYW5kcyBydW4gb25seSBhZnRlciB0aGUgY2hhcmFjdGVyIGJlY29tZXMgdW5zY29yYWJsZSBhbmQgc2F2aW5nIHN0b3BzIHBlcm1hbmVudGx5IGZvciB0aGlzIHBhZ2UsIGFuZCB0aGUgaG9zdCBjb25maXJtcyBlYWNoIG9uZS4gfAp8IEdhbWUgb3B0aW9uIG1hbmFnZW1lbnQgfCBgb3B0aW9uczptYW5hZ2VgIHwgWWVzLiBUaGUgaG9zdCBjb25maXJtcyBlYWNoIGNoYW5nZS4gQmlydGggYW5kIHNjb3JlIG9wdGlvbnMgc3RheSBsb2NrZWQsIGFuZCBhIGNoZWF0IGNoYW5nZSBwZXJzaXN0cyBhbiB1bnNjb3JhYmxlIG1hcmsgYmVmb3JlIGl0IHRha2VzIGVmZmVjdC4gfAp8IENoYXJhY3RlciBtYW5hZ2VtZW50IHwgYHNhdmVzOm1hbmFnZWAgfCBZZXMuIFRoZSBwbGF5ZXIgc2VsZWN0cyB0aGUgY2hhcmFjdGVycywgd2hpY2ggY2Fycnkgb3BhcXVlIGlkcywgYW5kIHRoZSBob3N0IGNvbmZpcm1zIGxvYWQsIHJlbmFtZSwgYW5kIGRlbGV0ZS4gfAp8IEhpZGRlbiBzdGF0ZSAodHJ1dGgpIHJlYWRzIHwgYHN0YXRlOm1hcC1hY3R1YWwucmVhZGAgb3IgYHN0YXRlOm1vbnN0ZXJzLWFjdHVhbC5yZWFkYCB8IFllcyBpbiBXb3JrZXJzLCB3aXRoIHRoZSBncmFudCBhbmQgcGxheWVyIGNvbnNlbnQuIEV2ZXJ5IGFmZmVjdGVkIGNoYXJhY3RlciBpcyBtYXJrZWQgdW5zY29yYWJsZS4gfAp8IFJhdyBlbmdpbmUgYWNjZXNzIHwgbm9uZSB8IE5vIHwKfCBSYXcgcHJlc2VudGF0aW9uIHJlcGxhY2VtZW50IHwgbm9uZSB8IE5vIHwKfCBIb3N0LWRyYXduIG1lbnUgYW5kIHNjcmVlbiBkZXNjcmlwdGlvbnMgfCBgdWk6bWVudS5yZXBsYWNlYCwgYHVpOnNjcmVlbi5yZXBsYWNlYCB8IFllcy4gVGV4dCBpcyBib3VuZGVkIGFuZCBzZWxlY3Rpb25zIGFyZSBvcGFxdWUuIE1lbnVzIHZhbGlkYXRlIHRoZSBvcmlnaW5hbCBjaG9pY2VzLCBhbmQgbGl2ZSBzY3JlZW4gYWN0aW9ucyBmYWxsIGJhY2sgdG8gdGhlIGdhbWUuIHwKfCBIb3N0LWRyYXduIG1hcCBnbHlwaCBjb21tYW5kcyB8IGBkaXNwbGF5OnJlcGxhY2VgIHwgWWVzLCBmb3IgdGhlIG1hcCByZWN0YW5nbGUgb25seS4gQ29tbWFuZHMgaGF2ZSBkZWFkbGluZXMsIGFuZCB0aGUgaG9zdCBwcm92aWRlcyBhIGZhbGxiYWNrLiB8CnwgSG9zdC1kcmF3biBNb2RzIHNjcmVlbiB8IGBzY3JlZW5zOm1hbmFnZWAgfCBZZXMuIFRoZSBob3N0IHJlc2VydmVzIGl0cyBvd24gcmVjb3ZlcnkgYW5kIHBlcm1pc3Npb24gY29udHJvbHMgb24gdGhlIHNjcmVlbi4gfAp8IEJpcnRoIGFuZCBVSSByZXBsYWNlbWVudCB3aWxkY2FyZCB8IGB1aTpiaXJ0aC5yZXBsYWNlYCwgYHVpOioucmVwbGFjZWAgfCBZZXMuIFRoZSBtb2QgcHJvcG9zZXMgYm91bmRlZCwgbGVnYWwgY2hvaWNlcyBhbmQgdGhlIGhvc3Qgb3ducyBmaW5hbCBhY2NlcHRhbmNlLiBUaGUgd2lsZGNhcmQgY292ZXJzIGFsbCBzaXggVUkgZmFtaWxpZXMuIHwKfCBCYWNrdXAgZm9sZGVyIHwgYGJhY2t1cDpmb2xkZXJgIHwgWWVzIG9uIGRlc2t0b3AuIFdyaXRlcyBhcmUgYm91bmRlZCBhbmQgbmF0aXZlbHkgY29uZmlybWVkLCBhbmQgdGhleSBnbyB0byBhIHBlci1pbnN0YWxsYXRpb24gc3ViZm9sZGVyLiBUaGUgV29ya2VyIGNhbm5vdCBzdXBwbHkgYSBwYXRoLiB8CgojIyMgR3JhbnRzIFdvcmtlcnMgY2Fubm90IGhvbGQgeWV0CgpBIG1vZCBydW5uaW5nIGluIGEgV29ya2VyIGNhbm5vdCBob2xkIHRoZSBncmFudHMgaW4gdGhlIHRhYmxlIGJlbG93LiBUaGUgY29uc2VudCBzY3JlZW4gZ2l2ZXMgdGhlIHJlYXNvbiBmb3IgZWFjaCByZWZ1c2FsLCBhbmQgYSBtb2QgdGhhdCBuZWVkcyBhIHJlZnVzZWQgZ3JhbnQgaW4gb3JkZXIgdG8gcnVuIGRvZXMgbm90IHN0YXJ0LiBUaGUgZWlnaHQgcmVnaXN0cnkgbWVjaGFuaXNtcyBhY2NlcHQgZGVjbGFyYXRpb25zIHdpdGhvdXQgdGhlIGVuZ2luZSBicmlkZ2UgcHJvdG90eXBlLCB3aGljaCBpcyBzdGlsbCB1bndpcmVkLgoKfCBHcmFudCB8IFdoeSBpdCBpcyBjbG9zZWQgfCBXaGF0IGl0IG5lZWRzIHwKfCAtLS0gfCAtLS0gfCAtLS0gfAp8IGBlbmdpbmU6YWNjZXNzYCB8IGB3cml0ZVNsb3RgIHdyaXRlcyB0aGUgc2F2ZSBieXRlcyBhbmQgdGhlIHJvc3RlciBtZXRhZGF0YSBpbiBzZXBhcmF0ZSBzdGVwcywgYW5kIGl0IGNhbiByZXBvcnQgYSBmYWlsdXJlIGFmdGVyIHRoZSBzYXZlIGhhcyBhbHJlYWR5IGNoYW5nZWQuIEEgbGl2ZSBhZGFwdGVyIGJ1aWx0IG9uIHRoYXQgd3JpdGVyIGNhbm5vdCBtZWV0IHRoZSBwcm90b3R5cGUncyBhdG9taWMgY29tbWl0IGNvbnRyYWN0LiB8IEFuIGF0b21pYyBwZXJzaXN0ZW5jZSBwcmltaXRpdmUsIGEgcHJvZHVjdGlvbiBzYWZlLXBvaW50IGFkYXB0ZXIsIGNvbnNlcXVlbmNlIG1hcmtpbmcsIGFuZCBXb3JrZXIgaGFuZGxlIGxpZmVjeWNsZSB0ZXN0cyBydW4gYWdhaW5zdCB0aGF0IGFkYXB0ZXIuIHwKfCBgcmVnaXN0cnk6KmAgfCBUaGUgd2lsZGNhcmQgYWxzbyBjb3ZlcnMgYG1vbnN0ZXJgLCBgcHJvamVjdGlvbmAsIGBlZmZlY3QtaW5mb2AsIGFuZCBgcnVuZWAuIEEgV29ya2VyIGhvbGRzIHRob3NlIGZvdXIgb25seSBmb3IgdGhlIGZpeGVkIHBvbGljeSB0YWJsZXMgdGhhdCBuYW1lIHRoZW0uIE1vbnN0ZXIgQUksIHByb2plY3Rpb24gaGFuZGxlcnMsIGFuZCBvdGhlciBjYWxsYmFja3MgdGhhdCBydW4gaW5zaWRlIGEgdHVybiBoYXZlIG5vIFdvcmtlciBtZWNoYW5pc20uIHwgQSBib3VuZGVkLCBpc29sYXRlZCBtZWNoYW5pc20gZm9yIGV2ZXJ5IGRvbWFpbiB0aGUgd2lsZGNhcmQgY292ZXJzLCBpbiBwbGFjZSBiZWZvcmUgdGhlIHdpbGRjYXJkIG9wZW5zLiB8CgojIyMgV29ya2VyIHJlZ2lzdHJ5IGRlY2xhcmF0aW9ucwoKQW55IGF1dGhvciBjYW4gcmVxdWVzdCBgcmVnaXN0cnk6ZWZmZWN0YCwgYHJlZ2lzdHJ5OnJvb21gLCBgcmVnaXN0cnk6cHJvZmlsZWAsIGByZWdpc3RyeTpibG93YCwgYHJlZ2lzdHJ5OmdseXBoYCwgYHJlZ2lzdHJ5OnJhbmRhcnRgLCBgcmVnaXN0cnk6dm9jYWJgLCBhbmQgYHJlZ2lzdHJ5Om1lbnVgLiBBIFdvcmtlciB3aXRoIG9uZSBvZiB0aGVzZSBncmFudHMgZ2V0cyBgbW9kLnJlZ2lzdHJ5Ljxkb21haW4+LmRlY2xhcmUoZGVjbGFyYXRpb24pYCwgd2hpY2ggcmV0dXJucyBgUHJvbWlzZTxBcGkyUmVzdWx0PG51bGw+PmAuIEVhY2ggbWV0aG9kIGFjY2VwdHMgZXhhY3RseSB0aGUgZmllbGRzIGxpc3RlZCBpbiB0aGUgdGFibGUuIEEgbmV3IGlkZW50aWZpZXIgc3RhcnRzIHdpdGggdGhlIGNhbGxpbmcgbW9kJ3MgaWQgZm9sbG93ZWQgYnkgYDpgLiBEZWNsYXJhdGlvbnMgY2Fubm90IGNvbnRhaW4gY2FsbGJhY2tzLCBlbmdpbmUgb2JqZWN0cywgaGFuZGxlcywgcGF0aHMsIG9yIHRyYW5zZmVyYWJsZSB2YWx1ZXMuCgp8IERvbWFpbiB8IERlY2xhcmF0aW9uIHwgSG9zdCBiZWhhdmlvciB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgZWZmZWN0YCB8IGB7IGNvZGUsIHByb2dyYW0gfWAgfCBgY29kZWAgaXMgYSBzdHJpbmcgdGhlIG1vZCBvd25zIG9yIGFuIGV4aXN0aW5nIG51bWVyaWMgZWZmZWN0IGNvZGUuIEEgcHJvZ3JhbSBob2xkcyAxIHRvIDE2IG9wZXJhdGlvbnMsIGVhY2ggb25lIGB7IG9wOiAiaGVhbCIgb3IgImRhbWFnZSIsIGFtb3VudCB9YCBvciBgeyBvcDogIm1lc3NhZ2UiLCB0ZXh0IH1gLiBBbW91bnRzIGFyZSBpbnRlZ2VycyBmcm9tIDAgdG8gMTAsMDAwLCBhbmQgYSBtZXNzYWdlIGlzIGF0IG1vc3QgMTYwIGNoYXJhY3RlcnMgbG9uZy4gSGVhbGluZyBzdG9wcyBhdCBtYXhpbXVtIEhQLCBhbmQgZGFtYWdlIGdvZXMgdGhyb3VnaCB0aGUgaG9zdCdzIGRhbWFnZSBoYW5kbGVyLiB8CnwgYHJvb21gIHwgYHsgbmFtZSwgcHJpbWl0aXZlIH1gIHwgYG5hbWVgIGlzIGFuIGV4aXN0aW5nIHJvb20ga2V5IG9yIGEga2V5IHRoZSBtb2Qgb3ducywgYW5kIGBwcmltaXRpdmVgIGlzIG9uZSBvZiBgc2ltcGxlYCwgYGNpcmN1bGFyYCwgYG92ZXJsYXBgLCBgY3Jvc3NlZGAsIG9yIGBsYXJnZWAuIEV4aXN0aW5nIHJvb20gcHJvZmlsZXMgcGljayB1cCBrZXlzIHRoYXQgYSBkZWNsYXJhdGlvbiBvdmVycmlkZXMuIEEgbmV3bHkgYWRkZWQga2V5IGFwcGVhcnMgaW4gbm8gcHJvZmlsZSBvbiBpdHMgb3duLiB8CnwgYHByb2ZpbGVgIHwgYHsgbmFtZSwgYmFzZSwgbWluTGV2ZWwsIGFsbG9jIH1gIHwgVGhlIGhvc3QgY29waWVzIGFuIGV4aXN0aW5nIHByb2ZpbGUgdW5kZXIgYSBuZXcgbmFtZSB0aGUgbW9kIG93bnMuIE1pbmltdW0gZGVwdGggcmFuZ2VzIGZyb20gMCB0byAxMjcsIGFuZCBzZWxlY3Rpb24gd2VpZ2h0IGZyb20gMCB0byAxMDAuIFRoZSBjb3B5IGtlZXBzIHRoZSBiYXNlIHByb2ZpbGUncyBidWlsZGVyLCByb29tIHBhcmFtZXRlcnMsIGFuZCB0dW5uZWwgcGFyYW1ldGVycy4gfAp8IGBibG93YCB8IGB7IG5hbWUsIGRhbWFnZSwgb2J2aW91cyB9YCB8IGBuYW1lYCBpcyBhbiBleGlzdGluZyBibG93IGVmZmVjdCBvciBhIG5hbWUgdGhlIG1vZCBvd25zLiBUaGUgaG9zdCBidWlsZHMgYm90aCB0aGUgcmVjb3JkZWQgYXR0YWNrIGFuZCB0aGUgbGl2ZSBhdHRhY2sgZnJvbSBhIGZpeGVkIGludGVnZXIgZGFtYWdlIG9mIDAgdG8gMTAsMDAwIGFuZCBhIGJvb2xlYW4gdmlzaWJpbGl0eSBmbGFnLiB8CnwgYGdseXBoYCB8IGB7IGtpbmQsIGdseXBoLCBzb3VyY2UgfWAgfCBga2luZGAgaXMgYHRlbXBsYXRlYCBvciBgdmF1bHRgLCBhbmQgZWFjaCBvZiB0aGUgdHdvIHN5bWJvbHMgaXMgYSBzaW5nbGUgbm9uLXNwYWNlIGNoYXJhY3Rlci4gVGhlIGhvc3QgZ2l2ZXMgdGhlIHRhcmdldCBzeW1ib2wgdGhlIHRlcnJhaW4gYW5kIHBvcHVsYXRpb24gYmVoYXZpb3Igb2YgYW4gZXhpc3Rpbmcgc291cmNlIHN5bWJvbC4gfAp8IGByYW5kYXJ0YCB8IGB7IHRhYmxlLCBrZXksIHRvSCwgdG9ELCB0b0EgfWAgfCBgdGFibGVgIGlzIGBhYmlsaXRpZXNgIG9yIGBwcmVwYCwgYGtleWAgaXMgYW4gaW50ZWdlciBmcm9tIDAgdG8gNDA5NSwgYW5kIGVhY2ggY29tYmF0IHN0YXQgaXMgYW4gaW50ZWdlciBmcm9tIC0xMDAgdG8gMTAwLiBXaGVuZXZlciB0aGUgZ2VuZXJhdG9yIHVzZXMgdGhhdCBrZXksIHRoZSBob3N0IHNldHMgdGhvc2Ugc3RhdHMuIENlbnN1cywgcmVkdW5kYW5jeSBjYWxjdWxhdGlvbnMsIGFuZCBhcmJpdHJhcnkgYXJ0aWZhY3QgY2FsbGJhY2tzIGFyZSB1bmF2YWlsYWJsZS4gfAp8IGB2b2NhYmAgfCBgeyBraW5kLCB0ZXJtLCBsYWJlbCB9YCB8IFRoZSBob3N0IHN0b3JlcyBhIHRlcm0gYW5kIGxhYmVsIHRoZSBtb2Qgb3ducyBpbiB0aGlzIGNvbm5lY3Rpb24ncyB2b2NhYnVsYXJ5LiBBIGtpbmQgbmFtZSBpcyBhdCBtb3N0IDY0IGNoYXJhY3RlcnMuIEEgdm9jYWIgZGVjbGFyYXRpb24gY2Fubm90IGdyb3cgdGhlIGNvcmUgZmxhZyBhcnJheXMgb3Igc3RhdGlzdGljcywgZXhwb3NlIGFub3RoZXIgbW9kJ3MgdGVybXMsIG9yIHBlcnNpc3QgdmFsdWVzIG9uIGVudGl0aWVzLiBBIG1vZCBrZWVwcyBpdHMgb3duIHZhbHVlcyBpbiBjaGFyYWN0ZXIgc3RvcmFnZS4gfAp8IGBtZW51YCB8IGB7IGlkLCByb3dzOiBbeyBpZCwgbGFiZWwsIGhpZGRlbiB9XSB9YCB8IFVwIHRvIDY0IHJ1bGVzIHJlbmFtZSBvciBoaWRlIGV4aXN0aW5nIHJvd3MsIGFuZCB0aGUgcm93cyBrZWVwIHRoZWlyIHNlbWFudGljIHRhcmdldHMgYW5kIHRoZWlyIG9yZGVyLiBTdXBwb3J0ZWQgaWRzIGFyZSBgY29yZTphY3RpdmF0ZS1pdGVtYCwgYGNvcmU6YnJvd3NlLXNwZWxsYCwgYGNvcmU6Y2FzdC1zcGVsbGAsIGBjb3JlOmNvbnRleHQtZ3JpZGAsIGBjb3JlOmNvbnRleHQtb2JqZWN0YCwgYGNvcmU6Y29udGV4dC1wbGF5ZXItb3RoZXJgLCBgY29yZTpjb250ZXh0LXBsYXllcmAsIGBjb3JlOmNvbnRleHQtdXNlLWl0ZW1gLCBgY29yZTpjdXJzZS1yZW1vdmFsYCwgYGNvcmU6ZWZmZWN0LWNob2ljZWAsIGBjb3JlOnBpY2t1cGAsIGBjb3JlOnNwZWxsLWJvb2tgLCBgY29yZTpzdHVkeS1zcGVsbGAsIGBjb3JlOnRhcmdldC1tb25zdGVyYCwgYW5kIGBjb3JlOnVzZS1pdGVtYC4gVGhlIGhvc3QgcmVmdXNlcyBldmVyeSBvdGhlciBtZW51LCBpbmNsdWRpbmcgcGVybWlzc2lvbnMgYW5kIHRoZSBnYW1lIG1lbnUuIEFkZGluZyBhY3Rpb25zIHRvIHRoZSBnYW1lIG1lbnUgbmVlZHMgYHVpOm1lbnUucm93YC4gfAoKVGhlIGhvc3QgdmFsaWRhdGVzIHRoZSB3aG9sZSBkZWNsYXJhdGlvbiBhbmQgZXZlcnl0aGluZyBpdCByZWZlcmVuY2VzIGJlZm9yZSBpdCBtYXJrcyBvciBpbnN0YWxscyBhbnl0aGluZy4gQmVmb3JlIGl0IGFjY2VwdHMgdGhlIGZpcnN0IGRlY2xhcmF0aW9uIGluIGEgZG9tYWluLCB0aGUgaG9zdCBzYXZlcyBwZXJtYW5lbnQgdW5zY29yYWJsZSBhbmQgbm9uZGV0ZXJtaW5pc3RpYyBtYXJrcyBvbiB0aGUgYXR0YWNoZWQgY2hhcmFjdGVyLiBBIHNlc3Npb24gd2l0aCBubyB3cml0YWJsZSBjaGFyYWN0ZXIgY2Fubm90IHJlZ2lzdGVyIGRlY2xhcmF0aW9ucy4gQW4gaW52YWxpZCBkZWNsYXJhdGlvbiBuZXZlciByZWFjaGVzIHRoZSBzYXZlIHdyaXRlciwgYW5kIGlmIHdyaXRpbmcgdGhlIG1hcmsgZmFpbHMsIG5vdGhpbmcgaXMgaW5zdGFsbGVkLiBBdXRob3JpdHkgaXMgYm91bmQgdG8gdGhlIGNoYXJhY3RlciBpZGVudGl0eSBhbmQgdGhlIHBsYXllciBvYmplY3QuIE9uY2UgdGhlIG1hcmsgd3JpdGUgY29tcGxldGVzLCBhbmQgYmVmb3JlIGl0IHJlcGxpZXMsIHRoZSBob3N0IGNoZWNrcyB0aGUgbWVhc3VyZWQgaW5zdGFsbGF0aW9uIGJpbmRpbmcsIHBsdWdpbiBpZCwgZXBvY2gsIGFuZCBsaXZlIGdyYW50IGFnYWluLiBBIHBlbmRpbmcgcmVxdWVzdCBjYW5ub3Qgd2lkZW4gaXRzIG93biBncmFudHMuCgpBIGNvbm5lY3Rpb24gY2FuIG1ha2UgdXAgdG8gMzIgZGVjbGFyYXRpb24gY2FsbHMgcGVyIHNlY29uZCwgd2l0aCBvbmUgY2FsbCBwZW5kaW5nIGF0IGEgdGltZS4gQWNyb3NzIGFsbCBlaWdodCBkb21haW5zIGl0IGNhbiBob2xkIDY0IHN1Y2Nlc3NmdWwgZGVjbGFyYXRpb25zIGFuZCAyNTYgS2lCIG9mIHJldGFpbmVkIGRlY2xhcmF0aW9uIGRhdGEsIGFuZCBjb3BpZWQgcHJvZmlsZXMgY291bnQgdG93YXJkIHRoYXQgMjU2IEtpQi4gTWFyayBhdHRlbXB0cyBhcmUgbGltaXRlZCB0byBmb3VyIHBlciBzZWNvbmQuIEV2ZXJ5IHJlcXVlc3QgYWxzbyBmYWxscyB1bmRlciB0aGUgYnJva2VyJ3MgNjQgS2lCIG1lc3NhZ2UgbGltaXQgYW5kIHRoZSBleGlzdGluZyByZXBseSBxdW90YXMsIGFsb25nIHdpdGggdGhlIGJyaWRnZSBjb3BpZXIncyBsaW1pdHMgb2YgZGVwdGggMTIgYW5kIDQsMDk2IHZhbHVlcy4gQ29waWVkIGJhc2UgcHJvZmlsZXMgZ2V0IHRoZSBzYW1lIHN0cnVjdHVyYWwgbGltaXRzLiBBIG1lbnUgcnVsZSBnaXZlbiBtb3JlIHRoYW4gMjU2IHJvd3MgZGVjbGluZXMgdGhlIGlucHV0IGFuZCBrZWVwcyB0aGUgb3JpZ2luYWwgcm93cy4gRnVuY3Rpb25zLCBjbGFzc2VzLCBhY2Nlc3NvcnMsIHByb3RvdHlwZSBrZXlzLCBjeWNsZXMsIHR5cGVkIGFycmF5cywgc2hhcmVkIG1lbW9yeSwgYW5kIHRyYW5zZmVyYWJsZXMgYXJlIHJlZnVzZWQsIGFuZCB0ZXh0IGZpZWxkcyByZWplY3QgY29udHJvbCBhbmQgZm9ybWF0dGluZyBjaGFyYWN0ZXJzLgoKRHVyaW5nIGEgc3luY2hyb25vdXMgdGljayB0aGUgZ2FtZSBydW5zIGhvc3QgcHJpbWl0aXZlcyBvbmx5IGFuZCBuZXZlciBhc2tzIHRoZSBXb3JrZXIgdG8gZXhlY3V0ZSBhbiBlZmZlY3Qgb3IgYSBnZW5lcmF0b3IuIEluc3RhbGxlZCBiZWhhdmlvciBkZWFjdGl2YXRlcyBvbiByZXZvY2F0aW9uLCBvbiB0ZWFyZG93biwgb3Igd2hlbiB0aGUgZXBvY2ggb3IgYmluZGluZyBjaGFuZ2VzLiBGcm9tIHRoZW4gb24sIGEgcmVwbGFjZWQgaGFuZGxlciBmYWxscyBiYWNrIHRvIHRoZSBob3N0IGJlaGF2aW9yIGl0IGhhZCBiZWZvcmUsIGEgbmV3IGVmZmVjdCBkZWNsaW5lcywgYSBuZXcgcm9vbSByZXR1cm5zIGZhaWx1cmUsIGEgbmV3IGJsb3cgZGVhbHMgemVybyBkYW1hZ2UsIGEgbmV3IGdseXBoIGRvZXMgbm90aGluZywgYW5kIGFuIGluYWN0aXZlIHByb2ZpbGUgZHJvcHMgb3V0IG9mIHNlbGVjdGlvbi4gSWYgYSBXb3JrZXIgc3RhbGxzLCB0aGUgYnJva2VyIGhlYXJ0YmVhdCBzdG9wcyBpdCBhbmQgdGhlIHNhbWUgZmFsbGJhY2tzIGFwcGx5LiBWb2NhYnVsYXJ5IGRlY2xhcmF0aW9ucyBzdGF5IHByaXZhdGUgdG8gdGhlIHN0b3BwZWQgY29ubmVjdGlvbiB0aGF0IG1hZGUgdGhlbS4gQXJiaXRyYXJ5IGNhbGxiYWNrcyBhcmUgdW5hdmFpbGFibGUsIGFuZCBzbyBpcyBsb3NzbGVzcyBjb21wYXRpYmlsaXR5IHdpdGggdGhlIGxpdmUgZW5naW5lLgoKVGhlIGdhbWUgcGFnZSBkcmF3cyB0aGUgcHVibGljIGNvbnNlbnQgZGlhbG9nIGl0c2VsZiwgYXMgYSBuYXRpdmUgbW9kYWwgd2l0aCBzeXN0ZW0gZm9udHMgYW5kIGZpeGVkIHdvcmRpbmcgdGhhdCBhIG1vZCdzIGxvY2FsZSBjYW5ub3QgcmVwbGFjZS4gSXQgc2hvd3MgdGhlIHNhbml0aXplZCBtYW5pZmVzdCBuYW1lLCB0aGUgbW9kIGlkLCB0aGUgcmVwb3NpdG9yeSwgYW5kIHRoZSBmaXJzdCAxMiBjaGFyYWN0ZXJzIG9mIHRoZSBwYXlsb2FkJ3MgU0hBLTI1NiBkaWdlc3QuIEV2ZXJ5IGNoZWNrYm94IHN0YXJ0cyB1bmNoZWNrZWQsIGV2ZW4gZm9yIHBlcm1pc3Npb25zIHRoZSBwbGF5ZXIgZ3JhbnRlZCBiZWZvcmUuIFRoZSBwbGF5ZXIncyBkZWNpc2lvbiBpcyBib3VuZCB0byBldmVyeSBtZWFzdXJlZCBmaWxlLCB0aGUgZXhlY3V0aW9uIHRpZXIsIGFuZCB0aGUgcmVxdWVzdGVkIHBlcm1pc3Npb25zLCBzbyBhIGNoYW5nZSB0byBhbnkgb2YgdGhvc2UgbmVlZHMgYSBuZXcgZGVjaXNpb24sIGV2ZW4gYXQgdGhlIHNhbWUgdmVyc2lvbi4gRXZlcnkgZXhlY3V0YWJsZSBtb2QgbmVlZHMgYSBtZWFzdXJlZCBiaW5kaW5nLCBmaXJzdC1wYXJ0eSBjb2RlIGluY2x1ZGVkLCBhbmQgZmlyc3QtcGFydHkgaW1wb3J0cyB1c2UgdGhlIHJldGFpbmVkIHBheWxvYWQgYnl0ZXMuIERlY2lzaW9ucyBzYXZlIGF0b21pY2FsbHkuIElmIHRoZSBzYXZlIGZhaWxzLCB0aGUgbW9kIGRvZXMgbm90IHJ1bi4gUGxheWVycyByZXZpZXcgYW5kIHJldm9rZSBncmFudHMgb24gdGhlIE1vZHMgcGVybWlzc2lvbiBzY3JlZW4sIGFuZCByZXZva2luZyBhIGdyYW50IHN0b3BzIHRoZSBydW5uaW5nIGNvZGUuCgpBIHB1YmxpYyBjb250cm9sbGVyIG5lZWRzIGEgc2Vjb25kLCBzZXBhcmF0ZSBkaWFsb2cgYmVmb3JlIGl0IHN0YXJ0cyBwbGF5aW5nLCBhbmQgdGhhdCBkaWFsb2cgYXBwZWFycyBldmVyeSB0aW1lIGEgc2F2ZSBpcyBsb2FkZWQgb3IgcmVzdW1lZC4gUHJvZmlsZSByb2xsLW9uIGRvZXMgbm90IGFjY2VwdCBpdCwgYW5kIGZpcnN0LXBhcnR5IHJvbGwtb24gYWxzbyB3YWl0cyBmb3Igc2Vzc2lvbiBjb25maXJtYXRpb24uIEV2ZXJ5IGNvbnRyb2xsZXIgY2FuZGlkYXRlIG5lZWRzIHRoZSBjdXJyZW50IHBlcm1pc3Npb24gYmluZGluZyBwbHVzIHN0b3JlZCBgaW5wdXQ6Y29udHJvbGxlcmAgYW5kIGBpbnB1dDppbnRlbnRgIGdyYW50cy4gRXNjYXBlIG9yIEN0cmwtWiByZXR1cm5zIHRoZSBrZXlib2FyZCB0byB0aGUgcGxheWVyIGJlZm9yZSBhbnkgbW9kIGNvZGUgc2VlcyB0aGUga2V5LiBBIGNvbnRyb2xsZXIgY2FuIHN1Ym1pdCBnYW1lcGxheSBjb21tYW5kcyBvbmx5OiBtb3ZlbWVudCwgcnVubmluZywgcmVzdGluZywgc3RhaXJzLCBkb29ycyBhbmQgdHJhcHMsIHR1bm5lbGluZywgaXRlbSB1c2UsIHNwZWxscywgbG9va2luZyBhbmQgc2VhcmNoaW5nLCBzaG9wcGluZywgdGFyZ2V0aW5nLCBhbmQgdHJhdmVsLCBwbHVzIGlnbm9yZSBydWxlcy4gVGhlIGhvc3QgcmVmdXNlcyBxdWl0IGFuZCByZXRpcmUsIHByb2ZpbGUgYW5kIHNlc3Npb24gbWFuYWdlbWVudCwgaW5zdGFsbCwgdW5rbm93biBjb21tYW5kcywgYW5kIGFueSBjb21tYW5kIHRoYXQgYmVsb25ncyB0byBhbm90aGVyIG1vZC4gSW5wdXQgYSBtb2Qgc2VuZHMgb3V0c2lkZSB0aGUgY29udHJvbGxlciBpcyBhY2NlcHRlZCBvbmx5IHNob3J0bHkgYWZ0ZXIgYW4gYWN0dWFsIHBsYXllciBhY3Rpb24uIFN0YXJ0aW5nIGFueSBjb250cm9sbGVyLCBmaXJzdC1wYXJ0eSBvbmVzIGluY2x1ZGVkLCBwZXJtYW5lbnRseSBtYXJrcyB0aGUgY2hhcmFjdGVyIHVuc2NvcmFibGUgd2l0aCBgTk9TQ09SRS5CT1JHYCwgc2V0cyBgbW9kTm9zY29yZWAsIGFuZCBtYXJrcyB0aGUgc2F2ZSBub25kZXRlcm1pbmlzdGljLiBTYXZlcyBhbmQgcnVuIHJlcG9ydHMgbGlzdCB0aGUgMzIgbW9zdCByZWNlbnQgY29udHJvbGxlciBpZGVudGl0aWVzIGluIGBhdXRvcGxheWVyc2AuIFRoZSBzZXBhcmF0ZSBgY2FwYWJpbGl0eVVzZWAgc3VtbWFyeSBrZWVwcyBwZXJtYW5lbnQgcHJvdmVuYW5jZSwgbmV2ZXIgdHJ1bmNhdGVzIGl0LCBhbmQgZG9lcyBub3QgZGVwZW5kIG9uIG1vZC1vd25lZCBzYXZlIGJhZ3MuCgojIyBTZWFtcyBvdXRzaWRlIHRoZSBwdWJsaWMgQVBJCgpGaXJzdC1wYXJ0eSBpbi1wcm9jZXNzIHByZXNlbnRhdGlvbiBuZWVkcyBkZWNsYXJlZCBncmFudHMgdG9vLiBgcHJlc2VudGF0aW9uLmRpc3BsYXlgIGFuZCBgcHJlc2VudGF0aW9uLnRpbGVzYCBuZWVkIGBkaXNwbGF5OnJlcGxhY2VgLiBMaXZlIGBkaXNwbGF5Lm9uS2V5YCwgYGtleVJlcGVhdGAsIGFuZCBgY2FuY2VsSW5wdXRgIG5lZWQgYGtleW1hcDplZGl0YC4gYHByZXNlbnRhdGlvbi5zdWJ3aW5kb3dzYCBhbmQgYHByZXNlbnRhdGlvbi5wYW5lbHNgIG5lZWQgYHVpOnJlZ2lvbi5jcmVhdGVgLCBhbmQgYHNpZGViYXJIb3N0YCBuZWVkcyBgdWk6c2lkZWJhci5yZXBsYWNlYCAob3IgYHVpOioucmVwbGFjZWApLiBET00gb3ZlcmxheSBhbmQgcGFnZSBtb3VudGluZyBuZWVkIGB1aTpyZWdpb24uY3JlYXRlYCwgYHVpOnNjcmVlbi5yZXBsYWNlYCwgb3IgYHNjcmVlbnM6bWFuYWdlYCwgdG9nZXRoZXIgd2l0aCB0aGUgZXhpc3RpbmcgYHVpOnBhbmVsLm1vdW50YCBncmFudC4gVGl0bGUgYWN0aW9ucyBzdGlsbCBuZWVkIGB1aTp0aXRsZWAuIEZvciBmaXJzdC1wYXJ0eSBpbi1wcm9jZXNzIGNvZGUsIGRlY2xhcmVkIHB1YmxpYyBwcmVzZW50YXRpb24gZ3JhbnRzIGFyZSBhbGxvd2VkIGJ5IGRlZmF1bHQsIGFuZCBhIHJlY29yZGVkIHJlZnVzYWwgb3ZlcnJpZGVzIHRoYXQgZGVmYXVsdCwgd2lsZGNhcmQgZGVjbGFyYXRpb25zIGluY2x1ZGVkLiBNYW5hZ2VtZW50IGdyYW50cyBzdGlsbCBnbyB0aHJvdWdoIHRoZWlyIG93biBjb25maXJtYXRpb24uIFB1YmxpYyBXb3JrZXJzIGFuZCBkZXZlbG9wZXIgaW4tcHJvY2VzcyBzd2l0Y2hlcyBnZXQgbm8gbGl2ZSBwcmVzZW50YXRpb24gb2JqZWN0cyB0aHJvdWdoIHRoaXMgc2VhbSwgYW5kIGxpdmUgcGFnZSBvYmplY3RzIHN0YXkgb3V0c2lkZSBXb3JrZXIgY29udGFpbm1lbnQuCgpBIG1vZCdzIEFQSSBoYXMgYG1hbmFnZWAgYW5kIGB0cnV0aGAgb25seSB3aGVuIHRoZSBtb2QgaG9sZHMgdGhlbSwgc28gY2hlY2sgYGlmIChtb2QudHJ1dGgpYCBiZWZvcmUgY2FsbGluZyBhbnl0aGluZyBvbiBpdC4gYHRydXRoLm1vbnN0ZXJzKClgIHJldHVybnMgdGhlIGxvY2F0aW9uIGFuZCBleGFjdCBzdGF0ZSBvZiBldmVyeSBtb25zdGVyLCB1bnNlZW4gb25lcyBpbmNsdWRlZCwgZWFjaCB3aXRoIGEgYHBlcmNlaXZlZGAgZmxhZy4gYHRydXRoLmxldmVsKClgIHJldHVybnMgdGhlIGFjdHVhbCBtYXAuIGBzdGF0ZTptb25zdGVycy1hY3R1YWwucmVhZGAgdW5sb2NrcyBgbW9uc3RlcnMoKWAgYW5kIGByYWNlKClgIGFuZCBub3RoaW5nIGVsc2UuIGBzdGF0ZTptYXAtYWN0dWFsLnJlYWRgIHVubG9ja3MgdGhvc2UgdHdvIGFzIHdlbGwgYXMgYGxldmVsKClgIGFuZCBgc3RvcmVLbm93bGVkZ2UoKWAuIE5laXRoZXIgdHJ1dGggZ3JhbnQgaXMgY292ZXJlZCBieSBgc3RhdGU6Ki5yZWFkYC4gT25jZSB0aGUgcGxheWVyIGNvbnNlbnRzLCBhIGNvbnRyb2xsZXIgb3IgYW55IG90aGVyIG1vZCBob2xkaW5nIGEgdHJ1dGggZ3JhbnQgbWF5IGJhc2UgaXRzIGRlY2lzaW9ucyBvbiBoaWRkZW4gaW5mb3JtYXRpb24uIEVpdGhlciB0cnV0aCBncmFudCBwZXJtYW5lbnRseSBtYXJrcyBldmVyeSBhZmZlY3RlZCBjaGFyYWN0ZXIgdW5zY29yYWJsZSB3aXRoIGBOT1NDT1JFLkRFQlVHYCBhbmQgYG1vZE5vc2NvcmVgLCB3aG9ldmVyIHdyb3RlIHRoZSBtb2QuIFRoZSBob3N0IHdyaXRlcyB0aGF0IG1hcmsgYW5kIGl0cyBwcm92ZW5hbmNlIHRvIHRoZSBzYXZlIGJlZm9yZSBpdCByZXR1cm5zIGFueSBoaWRkZW4gaW5mb3JtYXRpb24sIGFuZCBpZiB0aGUgc2F2ZSB3cml0ZSBpcyBtaXNzaW5nIG9yIGZhaWxzLCB0aGUgcmVhZCBpcyByZWZ1c2VkLiBBIHRydXRoIHJlYWQgYnkgaXRzZWxmIGxlYXZlcyBkZXRlcm1pbmlzbSB1bmNoYW5nZWQuCgpgU2F2ZU1hbmlmZXN0LmNhcGFiaWxpdHlVc2VgIGFuZCBgUnVuUmVwb3J0LmNhcGFiaWxpdHlVc2VgIGJvdGggaG9sZCBgeyBzY2hlbWE6IDEsIGVudHJpZXMgfWAuIEFuIGVudHJ5IHJlY29yZHMgdGhlIGhvc3QncyBtZWFzdXJlZCBpbnN0YWxsYXRpb24gY29uc2VudCBiaW5kaW5nLCB0aGUgbW9kIGlkLCB2ZXJzaW9uLCBwYXlsb2FkIGRpZ2VzdCwgYW5kIGNhcGFiaWxpdHksIHRoZSB0dXJuIGFuZCBkZXB0aCBvZiB0aGUgZmlyc3QgYWN0aXZhdGlvbiwgYW5kIHRoZSBjb25zZXF1ZW5jZSwgZWl0aGVyIGBjb250cm9sbGVyYCBvciBgaGlkZGVuLWluZm9ybWF0aW9uYC4gVW5tZWFzdXJlZCBsZWdhY3kgY2FsbGVycyB3cml0ZSBudWxsIGZvciBpbnN0YWxsYXRpb24sIGRpZ2VzdCwgb3IgYWN0aXZhdGlvbiB2YWx1ZXMuIFRoZSBob3N0IG1lcmdlcyBlbnRyaWVzIHdpdGggbWF0Y2hpbmcgaWRlbnRpdGllcyBhbmQgY29uc2VxdWVuY2VzLCBrZWVwcyB0aGUgZmlyc3QgYWN0aXZhdGlvbiwgYW5kIG5ldmVyIHRydW5jYXRlcyB0aGUgc3VtbWFyeS4gUmV2b2tpbmcgYSBncmFudCBzdG9wcyBsYXRlciB0cnV0aCByZWFkcyBidXQgbGVhdmVzIG1hcmtzIGFuZCBwcm92ZW5hbmNlIGluIHBsYWNlLiBPbGQgc2F2ZXMgaGF2ZSBubyBzdW1tYXJ5IGFuZCBsb2FkIHVuY2hhbmdlZC4gV2hlbiB0aGlzIGJ1aWxkIGZpbmRzIGEgbmV3ZXIgc3VtbWFyeSBzY2hlbWEsIGl0IGtlZXBzIHRoYXQgc3VtbWFyeSBhcyBpdCBpcyB3aXRob3V0IHJlYWRpbmcgb3IgcmVwbGFjaW5nIGl0LCBhbmQgaXQgc3RpbGwgYXBwbGllcyB0aGUgZXhpc3Rpbmcgc2NvcmUgYW5kIGRldGVybWluaXNtIG1hcmtzLgoKQSBmaXJzdC1wYXJ0eSBpbi1wcm9jZXNzIG1vZCB0aGF0IHRoZSBnYW1lIGxldHMgc2VlIHRoZSByZWFsIG1hcCBjYW4gYXNrIGZvciBpdCB3aGlsZSBpdCBydW5zLCByYXRoZXIgdGhhbiBkZWNsYXJpbmcgaXQgaW4gdGhlIG1hbmlmZXN0LiBDYWxsIGBwZXJtaXNzaW9ucy5yZXF1ZXN0VHJ1dGgocmVhc29uKWAgYW5kIHRoZSBnYW1lIHNob3dzIGl0cyBvd24gcXVlc3Rpb24gd2l0aCB5b3VyIHJlYXNvbiBpbiBpdC4gT24gYSB5ZXMgeW91IGdldCB0aGUgYHRydXRoYCBkb21haW4sIHRoZSBjaG9pY2UgaXMgcmVtZW1iZXJlZCBsaWtlIG9uZSBtYWRlIGluIHRoZSBNb2RzIHNjcmVlbiwgYW5kIGV2ZXJ5IGNoYXJhY3RlciBwbGF5ZWQgd2hpbGUgdGhlIG1vZCBob2xkcyBpdCBpcyBtYXJrZWQgdGhlIHdheSBkZWJ1ZyBtb2RlIG1hcmtzIGl0LiBPbiBhIG5vIHlvdSBnZXQgYHsgb2s6IGZhbHNlLCBjb2RlOiAiZGVjbGluZWQiIH1gLCBhbmQgdGhlIG5leHQgY2FsbCBhc2tzIGFnYWluLiBgcGVybWlzc2lvbnMudHJ1dGhIZWxkKClgIHRlbGxzIHlvdSB3aGV0aGVyIHRoZSBtb2QgYWxyZWFkeSBoYXMgaXQsIGFuZCBhIG1vZCB0aGF0IGRvZXMgaXMgbmV2ZXIgYXNrZWQuIE90aGVyIG1vZHMgaGF2ZSBubyBgcGVybWlzc2lvbnNgLCBzbyBjaGVjayBgaWYgKG1vZC5wZXJtaXNzaW9ucylgIGZpcnN0LgoKYG1ldGEudGllcmAgcmVwb3J0cyBtZWFzdXJlZCBpZGVudGl0eSBzZXBhcmF0ZWx5IGZyb20gdGhlc2UgcGVybWlzc2lvbnMuIEEgcHVibGljIG1vZCB3aXRoIGNvbnNlbnQgdG8gYHRydXRoYCBzdGlsbCByZXBvcnRzIGAicHVibGljImAuCgpBbnkgaW4tcHJvY2VzcyBtb2Qgb3IgV29ya2VyIHRoYXQgdGhlIHBsYXllciBoYXMgYWxsb3dlZCBlaXRoZXIgdHJ1dGggZ3JhbnQgZ2V0cyBhIGB0cnV0aGAgb2JqZWN0LiBGb3IgZWFjaCBjYWxsLCB0aGUgV29ya2VyIGJyb2tlciB2YWxpZGF0ZXMgdGhlIGFyZ3VtZW50cywgaWRlbnRpdHksIGFuZCBlcG9jaCwgdGhlbiBjaGVja3MgdGhlIGdyYW50IGFnYWluLiBJdCB3YWl0cyBmb3IgdGhlIHBlcm1hbmVudCBzYXZlIG1hcmsgYmVmb3JlIGl0IGJ1aWxkcyBhIHBsYWluIHNuYXBzaG90LCBhbmQgaXQgZHJvcHMgdGhlIHJlcGx5IGlmIHRoZSBncmFudCBpcyByZXZva2VkIG9yIHRoZSBlcG9jaCBjaGFuZ2VzIGJlZm9yZSBkZWxpdmVyeS4gQSBzZXNzaW9uIHdpdGggbm8gY2hhcmFjdGVyIHRvIHNhdmUgcmV0dXJucyBubyBoaWRkZW4gZGF0YS4gVHJ1dGggcmVwbGllcyBjb3VudCBhZ2FpbnN0IHRoZSBzaGFyZWQgNCBNaUIgcmVwbHkgY2FwIGFuZCB0aGUgMjAwIGNhbGxzIHBlciBzZWNvbmQgY2FwLCBhbmQgYSByZXBseSB0aGF0IGV4Y2VlZHMgdGhlIHNpemUgY2FwIHN0aWxsIGxlYXZlcyB0aGUgcGVybWFuZW50IG1hcmsgaW4gcGxhY2UuIEFmdGVyIGEgc2VwYXJhdGUgQ29yZSBjb25maXJtYXRpb24sIGEgV29ya2VyIGJ5IGFueSBhdXRob3IgY2FuIGhvbGQgYHByb2ZpbGVzOm1hbmFnZWAsIGBzZXNzaW9uOmNvbnRyb2xgLCBgb3B0aW9uczptYW5hZ2VgLCBhbmQgYHNhdmVzOm1hbmFnZWAuIEl0cyBgbWFuYWdlYCBwcm94eSBoYXMgb25seSB0aGUgb3BlcmF0aW9ucyBsaXN0ZWQgYmVsb3cuIEJyb2FkZXIgaW4tcHJvY2VzcyBtYW5hZ2VtZW50IG5lZWRzIGEgZmlyc3QtcGFydHkgbW9kIHdob3NlIGBGSVJTVF9QQVJUWV9PUklHSU5TYCBlbnRyeSBuYW1lcyB0aGUgY2FwYWJpbGl0eS4gV2hlbiBhIG1vZCBkZWNsYXJlcyBhIHBlcm1pc3Npb24gaXQgY2Fubm90IGhvbGQsIGl0IGxvYWRzIHdpdGhvdXQgdGhhdCBwZXJtaXNzaW9uIGFuZCB0aGUgTW9kcyBzY3JlZW4gc2hvd3MgdGhlIHJlYXNvbi4KCldpdGggYHByb2ZpbGVzOm1hbmFnZWAsIHRoZSBpbi1wcm9jZXNzIGBtYW5hZ2UucHJvZmlsZXNgIGxpc3RzIGFuZCBjcmVhdGVzIHBsYXllciBwcm9maWxlcywgc2V0cyB3aGljaCBtb2RzIGEgcHJvZmlsZSBlbmFibGVzLCBhbmQgc3dpdGNoZXMgcHJvZmlsZXMuIEEgY29weSBtYWRlIGJ5IGEgbW9kIGNhcnJpZXMgb3ZlciB0aGUgZW5hYmxlZC1tb2Qgc2VsZWN0aW9ucyBhbmQgbm90aGluZyBlbHNlOiBubyBjb25zZW50IGRlY2lzaW9ucywgcGlucywgc2V0dGluZ3MsIG9yIHByaXZhdGUgcHJlZmVyZW5jZXMuIFRoZSBkZXN0aW5hdGlvbiBwcm9maWxlIG11c3QgYWxyZWFkeSBoYXZlIGl0cyBvd24gcGVybWlzc2lvbiBkZWNpc2lvbnMgYmVmb3JlIGEgbW9kIGNoYW5nZXMgdGhhdCBwcm9maWxlJ3MgZW5hYmxlZCBzZXQgb3IgcmVxdWVzdHMgY2hhcmFjdGVyIGNyZWF0aW9uIGluIGl0LiBFeGlzdGluZyBwcm9maWxlcyBzdGF5IHVuY2hhbmdlZC4gV2l0aCBgc2Vzc2lvbjpjb250cm9sYCwgYG1hbmFnZS5zZXNzaW9uYCBzYXZlcywgZXhpdHMgdG8gdGhlIHRpdGxlIHNjcmVlbiwgb3IgcXVpdHMgd2l0aG91dCBhc2tpbmcgdGhlIHBsYXllciB0byBjb25maXJtLCBzbyBhIG1vZCBzaG91bGQgYXNrIGZpcnN0IGluIGl0cyBvd24gcGFuZWwuCgpXb3JrZXIgbWFuYWdlbWVudCBjYWxscyBhcmUgYm91bmRlZCBKU09OIHJlcXVlc3RzLiBUaGUgaG9zdCBydW5zIG9uZSBvcGVyYXRpb24gYXQgYSB0aW1lIGFuZCBhY2NlcHRzIGF0IG1vc3QgMzIgcmVxdWVzdHMgcGVyIG1vZCBwZXIgbWludXRlLiBgbWFuYWdlLnByb2ZpbGVzLmxpc3QvY3JlYXRlL3N3aXRjaFRvL3JlbmFtZWAgcmVhY2ggb25seSB0aGUgcHJvZmlsZXMgdGhlIGNhbGxpbmcgbW9kIGNyZWF0ZWQsIHVwIHRvIDY0IHBlciBtb2QuIENyZWF0aW5nIGEgcHJvZmlsZSB0YWtlcyBhIG5hbWUgYW5kIG5vdGhpbmcgZWxzZSwgc28gYSBuZXcgcHJvZmlsZSBjYW5ub3QgYmUgY29waWVkIGZyb20gYW4gZXhpc3Rpbmcgb25lLiBUaGUgU0RLJ3MgY3VycmVudCBwcm9maWxlIHR5cGUgaGFzIG5vIGRlY2xhcmF0aW9uIGZvciB0aGUgV29ya2VyIGByZW5hbWVgIG1ldGhvZCBhbmQgbWFya3MgYHByb2ZpbGVzLnJlbmFtZWAgYXMgb3B0aW9uYWwsIHNvIGNoZWNrIHRoYXQgaXQgZXhpc3RzIGJlZm9yZSBjYWxsaW5nIGl0LiBTd2l0Y2hpbmcgcHJvZmlsZXMgZHVyaW5nIGNoYXJhY3RlciBjcmVhdGlvbiBuZWVkcyBgc2F2ZXM6bWFuYWdlYCBhbmQgdGhlIGRlc3RpbmF0aW9uIHByb2ZpbGUncyBvd24gc3RvcmVkIHBlcm1pc3Npb24gZGVjaXNpb25zLiBTZXNzaW9uIGRlY2lzaW9ucyBtYWRlIHVuZGVyIGFub3RoZXIgcHJvZmlsZSBkbyBub3QgY291bnQuIGBtYW5hZ2Uuc2Vzc2lvbi5zYXZlYCwgYGV4aXRUb1RpdGxlYCwgYW5kIGBxdWl0YCBlYWNoIHNob3cgYSBob3N0IGRpYWxvZyBiZWZvcmUgZ29pbmcgdGhyb3VnaCB0aGUgZ2FtZSdzIHNhdmUgYW5kIGV4aXQgcGF0aCwgYW5kIGlmIHRoZSBzYXZlIGZhaWxzLCB0aGUgZXhpdCBpcyByZWZ1c2VkLiBUaGlzIGJyb2tlciBnaXZlcyBubyBlbmdpbmUgYWNjZXNzIG9yIHJhdyBwcmVzZW50YXRpb24uIEZvciBzY3JlZW4gcmVwbGFjZW1lbnQsIHRoZSBwcmVzZW50ZXIgcGF0aHMgYWNjZXB0IGRhdGEgb25seS4KCkEgV29ya2VyIHdpdGggYG1vZDppbnN0YWxsYCBjYW4gY2FsbCBgbWFuYWdlLmNvbnRlbnQucGxhbkluc3RhbGwoc291cmNlKWAgYW5kIGBhcHBseUluc3RhbGwocGxhbklkKWAuIFdpdGggYG1vZDpzZXNzaW9uYCBpdCBnZXRzIGBwbGFuU2Vzc2lvbihzb3VyY2UpYCBhbmQgYGFwcGx5U2Vzc2lvbihwbGFuSWQpYC4gQSBzb3VyY2UgaXMgZWl0aGVyIGB7IHJlcG86ICJvd25lci9yZXBvc2l0b3J5IiB9YCwgd2hpY2ggdGFrZXMgdGhlIHNhbWUgR2l0SHViIHRhZyBVUkxzIGFzIHRoZSBwbGF5ZXIgZG9vciwgb3IgYSBgVWludDhBcnJheWAgYXJjaGl2ZS4gVGhlIGJvb3RzdHJhcCBzZW5kcyBhcmNoaXZlIGJ5dGVzIGFzIGB7IGFyY2hpdmU6IG51bWJlcltdIH1gLCBhbmQgZGlyZWN0IG1lc3NhZ2VzIGNhbiB1c2UgdGhhdCBzaGFwZSBhcyB3ZWxsLiBBbiBhcmNoaXZlIGNhbiBiZSBhdCBtb3N0IDEyIEtpQiBvbiB0aGUgd2lyZS4gQSBwbGFuIGhvbGRzIGBpZGAsIGBtb2RJZGAsIGByZXBvc2l0b3J5YCwgYHZlcnNpb25gLCBgZGlnZXN0YCwgYGNhcGFiaWxpdGllc2AsIGFuZCBgc2Vzc2lvbmAuIFRoZSBob3N0IGtlZXBzIG9uZSBwbGFuIHBlciBXb3JrZXIgQVBJIGZvciA2MCBzZWNvbmRzLCBhbmQgYW55IGFwcGx5IGF0dGVtcHQgdXNlcyBpdCB1cCwgd2hldGhlciB0aGUgcGxheWVyIGRlY2xpbmVzLCB0aGUgcmVxdWVzdCBpcyBzdGFsZSwgb3IgdGhlIG9wZXJhdGlvbiBpcyB0aGUgd3Jvbmcgb25lLiBUaGUgaG9zdCBkaWFsb2cgc2hvd3MgdGhlIHRhcmdldCBpZCwgcmVwb3NpdG9yeSwgdmVyc2lvbiwgU0hBLTI1NiBkaWdlc3QsIGFuZCByZXF1ZXN0ZWQgY2FwYWJpbGl0aWVzLiBBZnRlciB0aGUgZGlhbG9nLCB0aGUgaG9zdCBtZWFzdXJlcyBpdHMgcmV0YWluZWQgYnl0ZXMgYWdhaW4gYW5kIHJlZnVzZXMgdGhlIGFwcGx5IGlmIGFueXRoaW5nIGNoYW5nZWQuIEEgV29ya2VyIGhhcyBubyB3YXkgdG8gcGFzcyBpbiBncmFudHMsIGEgcHJlLWFwcHJvdmVkIHBsYW4sIG9yIGEgY29uZmlybWF0aW9uIGlkLiBUaGUgU0RLIGhhcyBubyB0eXBlcyBmb3IgdGhlc2UgcnVudGltZSBjb250ZW50IG1ldGhvZHMgeWV0LCBzbyBkZWNsYXJlIHRoZW0gbG9jYWxseSBpbiBUeXBlU2NyaXB0LgoKQm90aCBjb250ZW50IHBhdGhzIHJ1biB0aGUgcGxheWVyJ3MgYXJjaGl2ZSB2YWxpZGF0b3JzLCB3aGljaCByZWplY3QgZXhlY3V0YWJsZSBmaWxlcyBhbmQgYW55IGNhcGFiaWxpdHkgZGVjbGFyYXRpb25zLiBBbiBpbnN0YWxsIGFycml2ZXMgc3dpdGNoZWQgb2ZmIGFuZCBjYW5ub3QgcmVwbGFjZSBhIG1vZCBpZCB0aGF0IGlzIGFscmVhZHkgcHJlc2VudC4gQSBzZXNzaW9uIHBhY2sgbG9hZHMgdGhyb3VnaCB0aGUgbW9kLWZhY2luZyBsb2FkZXIgd2l0aCBgZ3JhbnRlZDogW11gIGFuZCBgY29udGVudE9ubHk6IHRydWVgLCBzdGFydHMgb24gcmVsb2FkLCBhbmQgY2Fubm90IHRha2UgYW4gaW5zdGFsbGVkIGlkLCBldmVuIG9uZSBmcm9tIHRoZSBzYW1lIHJlcG9zaXRvcnkuIEEgYG5lbzpzZXNzaW9uTW9kc2AgcmVjb3JkIHdyaXR0ZW4gYnkgYSBwYWdlIG5ldmVyIGF1dGhvcml6ZXMgY29kZSBhbmQgaW5oZXJpdHMgbm8gaW5zdGFsbGVkIGNvbnNlbnQsIGtleS12YWx1ZSBzdG9yYWdlLCBvciBjcmVkZW50aWFscy4gQ2hhbmdlcyBhIHNlc3Npb24gcGFjayBtYWtlcyB0byBhIGNoYXJhY3RlciBjYW4gc3RheSBhZnRlciB0aGUgYXJjaGl2ZSBpcyBmb3Jnb3R0ZW4uIEFwcGx5aW5nIGEgcGxhbiBkb2VzIG5vdCByZWxvYWQgdGhlIGdhbWUuCgpgbWFuYWdlLnJlYWRNb2QoYWRkcmVzcylgIHVuZGVyIGBtb2Q6cmVhZGAgcmV0dXJucyB0aGUgZGlzY292ZXJlZCBtZXRhZGF0YSBhbmQgdGhlIHBheWxvYWQgZmlsZSBuYW1lcy4gSXQgcmV0dXJucyBubyBmaWxlIHRleHQgYW5kIGluc3RhbGxzIG5vdGhpbmcuIFJlcG9zaXRvcnkgcGxhbm5pbmcgYW5kIGxvb2t1cCBhc2sgdGhlIHBsYXllciBiZWZvcmUgY29udGFjdGluZyBHaXRIdWIuIFRoZXkgZ28gdGhyb3VnaCB0aGUgZXhpc3RpbmcgZGlzY292ZXJ5IGFuZCBpbnN0YWxsIHJlc29sdXRpb24gd2l0aCB0aGVzZSBsaW1pdHM6IEhUVFBTIG9ubHksIHRvIGBhcGkuZ2l0aHViLmNvbWAgYW5kIGByYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tYCB1bmRlciB0aGUgc2VsZWN0ZWQgcmVwb3NpdG9yeSwgbm8gY3JlZGVudGlhbHMsIGEgMTUtc2Vjb25kIHRpbWVvdXQgcGVyIHJlcXVlc3QsIGF0IG1vc3QgMzIgZmV0Y2hlcywgMSBNaUIgcGVyIHJlc3BvbnNlLCA0IE1pQiBpbiB0b3RhbCwgYW5kIDEyOCBwYXlsb2FkIGZpbGVzLiBJbiB0aGUgYnJvd3NlciwgYSByZWRpcmVjdCBmYWlscyB0aGUgZmV0Y2guIE9uIGRlc2t0b3AsIGEgbWV0YWRhdGEgbG9va3VwIG5lZWRzIG5hdGl2ZSBhcHByb3ZhbCBmb3IgYSBzZXBhcmF0ZSByZXBvc2l0b3J5IGlkZW50aXR5LCB0aGVuIHBhc3NlcyB0aHJvdWdoIHRoZSBuYXRpdmUgcmVsYXkncyBkZXN0aW5hdGlvbiwgcmVkaXJlY3QtaG9wLCBhbmQgRE5TIGNoZWNrcywgYW5kIGl0IGNhbm5vdCB1c2UgdGhlIGNhbGxpbmcgbW9kJ3MgY3JlZGVudGlhbHMuIElmIG5hdGl2ZSBhdXRob3JpdHkgaXMgbWlzc2luZyBvciBkZWNsaW5lZCwgdGhlIGxvb2t1cCBmYWlscyBjbG9zZWQuIEEgbWV0YWRhdGEgcmVwbHkgaXMgY2FwcGVkIGF0IDY0IEtpQiwgYW5kIGFyY2hpdmUgZXhwYW5zaW9uIGlzIGNhcHBlZCBhdCA0IE1pQiB0b3RhbCBhbmQgMTI4IGVudHJpZXMuIFRoaXMgcGF0aCBnaXZlcyBubyBhY2Nlc3MgdG8gYXJiaXRyYXJ5IFVSTHMgYW5kIGRvZXMgbm90IGF1dGhvcml6ZSBhIG1vZCdzIG93biBuZXR3b3JrIGNhbGxzLgoKYGF3YWl0IG1hbmFnZS53aXphcmQoKWAgdW5kZXIgYGRlYnVnOndpemFyZGAgc2hvd3MgYSBob3N0IGRpYWxvZyBhbmQgcmV0dXJucyBhIGxvY2FsIGFzeW5jaHJvbm91cyBwcm94eSBmb3IgdGhlIGV4aXN0aW5nIHdpemFyZCBtZXRob2RzLiBFYWNoIGNhbGwgdGhyb3VnaCB0aGUgcHJveHkgZ2V0cyBpdHMgb3duIGhvc3QgY29uZmlybWF0aW9uIGFuZCB0YWtlcyBib3VuZGVkIGFyZ3VtZW50cy4gQmVmb3JlIGFueSB3aXphcmQgcmVwbHkgb3IgY29tbWFuZCwgdGhlIGhvc3QgZGV0YWNoZXMgdGhlIHNsb3QsIGxhdGNoZXMgdGhlIHJvc3RlcidzIHBlcm1hbmVudCB3cml0ZSBzdXJyZW5kZXIsIHZlcmlmaWVzIGJvdGgsIGFuZCBzZXRzIGBOT1NDT1JFLkRFQlVHYCBvbiB0aGUgbGl2ZSBjaGFyYWN0ZXIuIElmIHRoYXQgdmVyaWZpY2F0aW9uIGZhaWxzLCB0aGUgbW9kIGdldHMgbm8gd2l6YXJkIGFjY2Vzcy4gU2F2ZSB3cml0ZXMgc3RheSBvZmYgZm9yIHRoYXQgcGFnZSBmcm9tIHRoZW4gb24sIGV2ZW4gaWYgYSBzbG90IGlzIGF0dGFjaGVkIGxhdGVyLCBhbmQgcmVsb2FkaW5nIGVuZHMgdGhlIGRldGFjaGVkIHRlc3Qgc2Vzc2lvbi4gTm8gaG9zdCBmdW5jdGlvbiBvciBsaXZlIGVuZ2luZSBvYmplY3QgY3Jvc3NlcyB0aGUgY2hhbm5lbC4KCmBtYW5hZ2Uub3B0aW9ucy5nZXQvc2V0YCByZWFkcyBvcHRpb25zIGFuZCBwcm9wb3NlcyBhIHZhbGlkYXRlZCB0cmFuc2FjdGlvbi4gVGhlIHBsYXllciBjb25maXJtcyBldmVyeSBjaGFuZ2UuIEEgY2hlYXQgY2hhbmdlIHN0YXRlcyBpdHMgcGVybWFuZW50IHNjb3JpbmcgY29uc2VxdWVuY2UsIGFuZCB0aGUgaG9zdCBwZXJzaXN0cyBgTk9TQ09SRS5ERUJVR2AgYW5kIGBtb2ROb3Njb3JlYCBiZWZvcmUgaXQgY2hhbmdlcyB0aGUgY2hlYXQgb3B0aW9uLiBCaXJ0aCBhbmQgc2NvcmUgb3B0aW9ucyBzdGF5IGxvY2tlZC4gYG1hbmFnZS5zYXZlcy5saXN0YCBvcGVucyBhIGhvc3QtZHJhd24gcGlja2VyIG9mIHVwIHRvIDEyOCByb3N0ZXIgZW50cmllcywgd2l0aCBldmVyeSBjaGFyYWN0ZXIgY2hvaWNlIHVuY2hlY2tlZC4gT25seSB0aGUgZW50cmllcyB0aGUgcGxheWVyIHNlbGVjdHMgY29tZSBiYWNrLCBlYWNoIHdpdGggYSBmcmVzaCBvcGFxdWUgaWQgdGhhdCBleHBpcmVzIGF0IHRoZSBuZXh0IHNlbGVjdGlvbiBvciBwcm9maWxlL3Nlc3Npb24gY2hhbmdlLiBBIHJhdyBzbG90IGlkIG5ldmVyIHdvcmtzLiBgbG9hZGAsIGByZW5hbWVgLCBhbmQgYGRlbGV0ZWAgZWFjaCBhc2sgYWdhaW4sIGFuZCBkZWxldGluZyB0aGUgYWN0aXZlIHNsb3QgaXMgcmVmdXNlZCBldmVuIGFmdGVyIHRoZSBwbGF5ZXIgY29uZmlybXMuIGBsb2FkKGlkLCB7IHJlc3VtZUF1dG9wbGF5ZXI6IHRydWUgfSlgIHN0aWxsIHdhaXRzIGZvciB0aGUgc2VwYXJhdGUgY29udHJvbGxlciBjb25zZW50IGRpYWxvZyB3aGVuIHRoZSByZXN1bWVkIGNoYXJhY3RlciBib290cy4KCldpdGggYHByb2ZpbGVzOm1hbmFnZWAsIGEgV29ya2VyIGNhbiBjYWxsIGBtYW5hZ2UubW9kcy5zbmFwc2hvdCgpYCwgd2hpY2ggcmV0dXJucyBpdHMgb3duIGB7IGlkLCBuYW1lIH1gIGFuZCBub3RoaW5nIG1vcmUuIEZvciBpdHMgb3duIGlkIGl0IGNhbiByZXF1ZXN0IGBkaXNhYmxlYCwgYHNldFNldHRpbmdWYWx1ZWAsIG9yIGBzZXRTZWN0aW9uQ2hvaWNlYC4gSXQgY2FuIGFsc28gc2VsZWN0IGl0c2VsZiB3aXRoIGBzZXRDb25mbGljdE92ZXJyaWRlYCBhbmQgd2l0aGRyYXcgdGhpcmQtcGFydHkgY29uc2VudCB3aXRoIGBzZXRUaGlyZFBhcnR5Q29uc2VudChmYWxzZSlgLiBFYWNoIGNoYW5nZSBnb2VzIHRocm91Z2ggYSBob3N0LWRyYXduIGNvbmZpcm1hdGlvbiB0aGF0IG5hbWVzIHRoZSBjYWxsZXIgYW5kIHRoZSBjaGFuZ2VzLiBUaGUgYXBwcm92YWwgaXMgYm91bmQgdG8gdGhlIGN1cnJlbnQgbWVhc3VyZWQgcGF5bG9hZCBhbmQgY29uZmlndXJhdGlvbiwgc28gYSBjaGFuZ2VkIHBsYW4sIGEgcmV2b2tlZCBncmFudCwgb3IgYSBzdGFsZSBlcG9jaCBjYW5jZWxzIHRoZSBvcGVyYXRpb24uIE5vIFdvcmtlciBtZXRob2QgcmVjb3JkcyBwZXJtaXNzaW9ucywgcmVzb2x2ZXMgY29uZmlybWF0aW9uIGlkcywgZW5hYmxlcyBjb2RlLCBjb3BpZXMgc2NvcGVkIHN0b3JhZ2UsIG9yIGluc3RhbGxzIG1vZHMuCgpTbmFwc2hvdCwgc3Vic2NyaXB0aW9uLCBhbmQgcmVmcmVzaCByZXNwb25zZXMgb24gdGhlIG1vZC1mYWNpbmcgc2lkZSBsZWF2ZSBvdXQgc3RvcmVkIGNvbnNlbnQsIHNldHRpbmdzLCBwYXlsb2FkIGRpZ2VzdHMsIGFuZCBwZW5kaW5nIGNvbmZpcm1hdGlvbnMuIEEgbW9kIGNhbm5vdCByZXNvbHZlIGEgY29uZmlybWF0aW9uIG9yIGNoYW5nZSB0aGUgdGhpcmQtcGFydHkgY29uc2VudCBzd2l0Y2guIFJlY29yZGluZyBwZXJtaXNzaW9ucyBhbHdheXMgYXNrcyB0aGUgaG9zdCBmb3IgYSBkZWNpc2lvbiwgZXZlbiB3aGVuIHRoZSBtb2QgYWxyZWFkeSBob2xkcyBldmVyeSByZXF1ZXN0ZWQgZ3JhbnQsIGFuZCB0aGF0IHJlcXVlc3QgYWxvbmUgbmV2ZXIgdHVybnMgYSBzZXNzaW9uIGdyYW50IGludG8gYSBzdG9yZWQgZGVjaXNpb24uCgpgbWFuYWdlLnNjcmVlbnMudGFrZSh7IG1vZHMgfSlgIGRyYXdzIHRoZSBtb2QgbWFuYWdlciBpbnN0ZWFkIG9mIHRoZSBnYW1lJ3Mgb3duLCB1bmRlciBgc2NyZWVuczptYW5hZ2VgLiBFYWNoIGhhbmRsZXIgaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hlbiB0aGUgcGxheWVyIGNsb3NlcyB0aGUgc2NyZWVuLCBhbmQgdGhlIGdhbWUgb3BlbnMgaXQgZnJvbSBib3RoIHRoZSBnYW1lIG1lbnUgYW5kIHRoZSB0aXRsZSBzY3JlZW4uIElmIHRoZSBoYW5kbGVyIHRocm93cyBvciByZWplY3RzLCB0aGUgZ2FtZSdzIG93biBNb2RzIHNjcmVlbiBvcGVucyBpbnN0ZWFkLiBOYW1lIG9ubHkgdGhlIHNjcmVlbnMgdGhlIG1vZCBkcmF3czsgdG9kYXkgdGhlIG1vZCBtYW5hZ2VyIGlzIHRoZSBvbmx5IG9uZSBhIG1vZCBjYW4gdGFrZSwgYW5kIGEgY2FsbCB0aGF0IG5hbWVzIGFub3RoZXIgaXMgcmVmdXNlZC4gQSBzZWNvbmQgbW9kIGNhbm5vdCB0YWtlIGEgc2NyZWVuIHRoYXQgaXMgYWxyZWFkeSBoZWxkLCBhbmQgdGhlIGhvbGQgZW5kcyB3aGVuIHRoZSBtb2Qgc3RvcHMuCgoKIyMgV29ya2VyIHNwYXduaW5nIGFuZCBzaGFyZWQgZGF0YQoKVW5kZXIgYGRlYnVnOnNwYXduYCwgYSBjb25zZW50aW5nIFdvcmtlciBnZXRzIGBkZWJ1Zy5zcGF3bk9iamVjdChraW5kLCBjb3VudD8pYCBhbmQgYGRlYnVnLnNwYXduTW9uc3RlcihyYWNlLCBjb3VudD8pYC4gQm90aCB0YWtlIGEga25vd24gY29udGVudCBpZCwgbmFtZSwgb3IgcmVnaXN0cnkgaW5kZXgsIHBsdXMgYSBjb3VudCBmcm9tIDEgdG8gMTYuIEV2ZXJ5IHJlcXVlc3Qgb3BlbnMgYSBuYXRpdmUgZGlhbG9nIG5hbWluZyB0aGUgbW9kIGJ5IGRpc3BsYXkgbmFtZSBhbmQgaWQsIHRoZSBjb250ZW50LCBhbmQgdGhlIGNvdW50LiBJZiB0aGUgcGxheWVyIGRlY2xpbmVzLCBub3RoaW5nIGNoYW5nZXMuIEJlZm9yZSBhbnl0aGluZyBzcGF3bnMsIHRoZSBob3N0IHdyaXRlcyBgTk9TQ09SRS5ERUJVR2AsIGBtb2ROb3Njb3JlYCwgYW5kIHRoZSBgc3Bhd25gIGNvbnNlcXVlbmNlIHRvIHRoZSBjaGFyYWN0ZXIncyBzYXZlLiBBIGZhaWxlZCB3cml0ZXIsIGEgcmV2b2tlZCBncmFudCwgYSBjaGFuZ2VkIG1lYXN1cmVkIGJpbmRpbmcsIG9yIGEgc3RhbGUgZXBvY2ggc3RvcHMgdGhlIHNwYXduLiBUaGUgaG9zdCBhbGxvd3MgZm91ciBzcGF3biByZXF1ZXN0cyBwZXIgbW9kIHBlciBtaW51dGUgYW5kIHNob3dzIG9uZSBzcGF3biBkaWFsb2cgYXQgYSB0aW1lLiBTcGF3bmVkIHRoaW5ncyBhcHBlYXIgbmVhciB0aGUgY2hhcmFjdGVyLiBgZGVidWc6d2l6YXJkYCBpcyBub3QgYXZhaWxhYmxlIHRvIFdvcmtlcnMuCgpgc2hhcmVkLnJlYWQocHVibGlzaGVySWQsIG5hbWUpYCB1bmRlciBgc2hhcmVkOnJlYWRgIHJlYWRzIEpTT04gdGhhdCBhbm90aGVyIG1vZCBoYXMgZXhwbGljaXRseSBwdWJsaXNoZWQuIEl0IGNhbm5vdCByZWFjaCBwcml2YXRlIHByZWZlcmVuY2VzLCBrZXkvdmFsdWUgc3RvcmFnZSwgc2F2ZSBiYWdzLCBvciB0aGUgY2FsbGVyJ3Mgb3duIHB1YmxpY2F0aW9ucy4gYHNoYXJlZC5wdWJsaXNoKG5hbWUsIHZlcnNpb24sIHZhbHVlKWAgYW5kIGBzaGFyZWQud2l0aGRyYXcobmFtZSlgIHVuZGVyIGBzaGFyZWQ6cHVibGlzaGAgYWx3YXlzIHRha2UgdGhlIHB1Ymxpc2hlciBpZCBmcm9tIHRoZSBob3N0IGNvbm5lY3Rpb24uIEEgcHVibGlzaGVkIHZhbHVlIGlzIHZpc2libGUgdG8gZXZlcnkgb3RoZXIgbW9kIHdpdGggYHNoYXJlZDpyZWFkYCwgYW5kIHRob3NlIG1vZHMgY2FuIGtlZXAgaXQgb3IgcGFzcyBpdCBvbiB0aHJvdWdoIHRoZWlyIG93biBncmFudHMuIFB1Ymxpc2hpbmcgdHJhbnNmZXJzIG5vIHBlcm1pc3Npb25zLiBFdmVyeSBjYWxsIHRha2VzIGFuZCByZXR1cm5zIGRlZXAgY29waWVzLCBzbyB0aGVyZSBhcmUgbm8gbGl2ZSByZWZlcmVuY2VzIG9yIHN1YnNjcmlwdGlvbiBjYWxsYmFja3MuCgpBIFdvcmtlciBzaGFyZWQgZW50cnkgbmFtZSBpcyAxIHRvIDY0IGxvd2VyY2FzZSBsZXR0ZXJzLCBkaWdpdHMsIGRvdHMsIGh5cGhlbnMsIG9yIHVuZGVyc2NvcmVzLCBhbmQgaXQgc3RhcnRzIHdpdGggYSBsZXR0ZXIgb3IgZGlnaXQuIEEgdmVyc2lvbiBpcyBhIG5vbm5lZ2F0aXZlIHNhZmUgaW50ZWdlci4gRWFjaCBtb2QgY2FuIHB1Ymxpc2ggdXAgdG8gMzIgZW50cmllcyBvZiBhdCBtb3N0IDE2IEtpQiBvZiBKU09OIGVhY2gsIGFuZCBpdHMgcmVhZHMgYW5kIHdyaXRlcyB0b2dldGhlciBhcmUgY2FwcGVkIGF0IDE2IGNhbGxzIHBlciBzZWNvbmQuIFRoZSBmaXJzdCBwdWJsaWNhdGlvbiBpbiBhIFdvcmtlciBzZXNzaW9uIHJlY29yZHMgYW5kIHBlcnNpc3RzIGBzaGFyZWQtd3JpdGVgIG9uY2UuIEl0IHNob3dzIG5vIHBsYXllciBkaWFsb2cgYW5kIGRvZXMgbm90IGRpc3F1YWxpZnkgdGhlIHNjb3JlLCBidXQgaXQgbmVlZHMgYSBjaGFyYWN0ZXIgd2l0aCBhIHdvcmtpbmcgc2F2ZSB3cml0ZXIuIFNoYXJlZCBhbmQgc3Bhd24gY2FsbHMgYWxzbyBjb3VudCBhZ2FpbnN0IHRoZSBicm9rZXIncyBtZXNzYWdlIGFuZCByZXBseSBsaW1pdHMuCgpUaGUgdmVyc2lvbiAxIGBjYXBhYmlsaXR5VXNlYCBzdW1tYXJ5IGtlZXBzIGBzcGF3bmAgYW5kIGBzaGFyZWQtd3JpdGVgIG5leHQgdG8gYGNvbnRyb2xsZXJgIGFuZCBgaGlkZGVuLWluZm9ybWF0aW9uYC4gQ29udHJvbGxlciBoaXN0b3J5IGNhbiBiZSB0cnVuY2F0ZWQgd2hpbGUgdGhlIHN1bW1hcnkgc3RheXMgd2hvbGUuIFJldm9jYXRpb24gYW5kIG1vZC1iYWcgcmVtb3ZhbCBsZWF2ZSByZWNvcmRlZCBjb25zZXF1ZW5jZXMgaW4gcGxhY2UuIE9sZGVyIHNhdmVzIG5lZWQgbm8gbWlncmF0aW9uLCBhbmQgYSBzdW1tYXJ5IHdpdGggYW4gdW5rbm93biBuZXdlciBzY2hlbWEgaXMgbGVmdCB1bmNoYW5nZWQuCgojIyBNb3ZpbmcgZnJvbSBBUEkgMQoKTW9zdCBvZiB0aGUgQVBJIDEgY29udGV4dCBoYXMgYSBkaXJlY3QgaG9tZSBpbiBBUEkgMi4gYEFQSTFfQ09OVEVYVF9NQVBgIGluIGBwYWNrYWdlcy93ZWIvc3JjL21vZC1hcGkyLXNoaW0udHNgIG5hbWVzIGV2ZXJ5IG1lbWJlciBhbmQgd2hlcmUgaXQgd2VudCwgb3Igd2h5IGl0IGhhcyBubyBBUEkgMiBmb3JtLiBbTUlHUkFUSU5HX1RPX0FQSTIubWRdKE1JR1JBVElOR19UT19BUEkyLm1kKSB3YWxrcyB0aHJvdWdoIHRoZSBtb3ZlIG9uZSBkb21haW4gYXQgYSB0aW1lLCBpbmNsdWRpbmcgdGhlIG1lbWJlcnMgQVBJIDIgZG9lcyBub3QgaGF2ZS4gVGhlIG1haW4gY2hhbmdlczoKCnwgQVBJIDEgfCBBUEkgMiB8CnwgLS0tIHwgLS0tIHwKfCBgY3R4LmlkYCwgYGN0eC5mbGFnc2AsIGBjdHguc2V0dGluZ3NgLCBgY3R4Lm1vZHNgLCBgY3R4LmxvZ2AsIGBjdHgubmV3Q2hhcmFjdGVyYCB8IGBtZXRhYCB8CnwgYGN0eC5zdGF0ZWAsIGBjdHguY29yZWAsIGBjdHgucmVnaXN0cmllc2AgfCBgdmlld2AgZm9yIHJlYWRzLCBgYWN0YCBmb3IgY29tbWFuZHMsIGBjb250ZW50LnJlY29yZHNgIGZvciBkYXRhIHwKfCBgY3R4Lmluc3BlY3RgLCBgY3R4Lmtub3duTGV2ZWxgLCBgY3R4LmNoYXJhY3RlcmAgfCBgdmlldy5tb25zdGVyc2AsIGB2aWV3LmxldmVsYCwgYHZpZXcucGxheWVyYCB8CnwgYGN0eC5zbmFwc2hvdGAsIGBjdHguaW50ZW50YCwgYGN0eC5wcm9tcHRgIHwgYHZpZXcuaW5wdXRgLCBgYWN0LnN1Ym1pdGAsIGBhY3QuYW5zd2VyYCB8CnwgYGN0eC5ldmVudHMub24odHlwZSwgKHR5cGUsIGRhdGEpID0+IC4uLilgIHwgYGV2ZW50cy5vbihuYW1lLCAocGF5bG9hZCkgPT4gLi4uKWAsIHdoaWNoIHJldHVybnMgYSBzdWJzY3JpcHRpb24gfAp8IGBjdHgudWlgIChhIERPTSBlbGVtZW50KSB8IGB1aS5tb3VudGAgd2l0aCB0aGUgcGFuZWwgZ3JhbW1hciB8CnwgYGN0eC5rZXltYXBzYCwgYGN0eC5rZXliaW5kaW5nc2AgfCBgdWkua2V5c2AgfAp8IGBjdHgucHJlZnNgLCBgY3R4LmNoYXJhY3RlclN0b3JlYCB8IGBzdG9yZS5wcmVmc2AsIGBzdG9yZS5jaGFyYWN0ZXJgIHwKfCBgY3R4LmRhdGFgLCBgY3R4LmFzc2V0VXJsYCwgYGN0eC5jb21wb3NlZFJlY29yZHNgIHwgYGNvbnRlbnQub3duYCwgYGNvbnRlbnQuYXNzZXRgLCBgY29udGVudC5yZWNvcmRzYCB8CnwgYGN0eC5uZXRgIHwgYG5ldGAsIHdpdGggY3JlZGVudGlhbHMgcGFzc2VkIGJ5IHJlZmVyZW5jZSB8CnwgYGN0eC5wcm9maWxlc2AsIGBjdHguc2Vzc2lvbmAgfCBgbWFuYWdlYCwgd2l0aCBXb3JrZXJzIGxpbWl0ZWQgdG8gdGhlIGJvdW5kZWQgb3BlcmF0aW9ucyBhYm92ZSB8Cg=="
  },
  {
    "id": "api2-migration",
    "path": "MIGRATING_TO_API2.md",
    "audience": "advanced",
    "title": "Moving to API 2",
    "note": "Taking a plugin from API 1 to API 2, and what has no API 2 form yet.",
    "source": "sdk",
    "encoded": "IyBNb3ZpbmcgYSBtb2QgZnJvbSBBUEkgMSB0byBBUEkgMgoKVGhpcyBndWlkZSB0YWtlcyBhbiBBUEkgMSBwbHVnaW4gKGEgYHBsdWdpbi5qc2Agd2hvc2UgZGVmYXVsdCBleHBvcnQgaGFzIGBhcGk6IDFgKSB0byBtb2QgQVBJIDIsIGluIHRoZSBvcmRlciB0aGUgd29yayB1c3VhbGx5IGdvZXM6IGNoZWNrIHdoYXQgY2FuIG1vdmUsIGNvbnZlcnQgdGhlIG1hbmlmZXN0LCBjaGFuZ2UgdGhlIHNoYXBlIG9mIHRoZSBjb2RlLCB0aGVuIGdvIHRocm91Z2ggZWFjaCBwYXJ0IG9mIHRoZSBvbGQgYGN0eGAuIFtBUEkyLm1kXShBUEkyLm1kKSBkZXNjcmliZXMgQVBJIDIgaXRzZWxmLiBUaGUgdHlwZXMgYXJlIGluIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYC4KCiMjIFdoYXQgd29ya3Mgb24gdGhpcyBidWlsZAoKVGhlIFNESyBoYXMgdGhlIEFQSSAyIHR5cGVzIChgTW9kQXBpMmAsIGBBcGkyTW9kRGVmaW5pdGlvbmAsIGBBcGkyUmVzdWx0YCksIHRoZSB2ZXJzaW9uIGNoZWNrIGBhcGlSYW5nZVZlcmRpY3RgLCBhbmQgdGhlIG1hbmlmZXN0IGNvbnZlcnRlciBgY29udmVydE1hbmlmZXN0VjFgLiBUaGUgd2ViIGhvc3QgaGFzIGFuIGluLXByb2Nlc3MgQVBJIDIgaG9zdCAoYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWFwaTItaG9zdC50c2ApLCBgYXBpMlBsdWdpbmAgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1hcGkyLXNoaW0udHNgKSwgd2hpY2ggd3JhcHMgYW4gQVBJIDIgZGVmaW5pdGlvbiBzbyBpdCBydW5zIHRocm91Z2ggdGhlIEFQSSAxIGxvYWRlciB3aXRoIHRoZSBzYW1lIHBlcm1pc3Npb25zIGFuZCB0aGUgc2FtZSBob29rIGNvbXBvc2l0aW9uLCBhbmQgYSBXb3JrZXIgYnJva2VyIChgcGFja2FnZXMvd2ViL3NyYy9tb2Qtd29ya2VyL2hvc3QudHNgKSB0aGF0IHNlcnZlcyBhIFdvcmtlciBtb2QgdGhlIHNhbWUgQVBJLgoKVGhlIGZvbGRlciBsb2FkZXIgcnVucyBhbiBBUEkgMiBtb2QgaW4gZWl0aGVyIHJ1bnRpbWUuIEFuIGluLXByb2Nlc3MgbW9kIG5lZWRzIGEgc2NoZW1hIDIgbWFuaWZlc3Qgd2l0aCBgInJ1bnRpbWUiOiAiaW4tcHJvY2VzcyJgIGFuZCBhbiBgYXBpYCByYW5nZSB0aGF0IGFkbWl0cyBBUEkgMiwgc3VjaCBhcyBgPj0yLjAuMCA8My4wLjBgOyB0aGUgbG9hZGVyIHdyYXBzIGl0cyBkZWZhdWx0IGV4cG9ydCB3aXRoIGBhcGkyUGx1Z2luYC4gQSBXb3JrZXIgbW9kIG5lZWRzIGAicnVudGltZSI6ICJ3b3JrZXIiYCwgdGhlIHNhbWUga2luZCBvZiByYW5nZSBhbmQgYW4gYGVudHJ5YCAoc2VlIFJ1bnRpbWUgdGllcnMpLiBBIG1hbmlmZXN0IHdob3NlIHJhbmdlIGFkbWl0cyBubyBBUEkgdGhpcyBidWlsZCBydW5zIGluIHRoYXQgcnVudGltZSBpcyByZWZ1c2VkIHdpdGggYSBsaW5lIHN1Y2ggYXMgYG5lZWRzIG1vZCBBUEkgPj0zLjAuMCA8NC4wLjAgaW4gcnVudGltZSAiaW4tcHJvY2VzcyIsIHdoaWNoIHRoaXMgYnVpbGQgZG9lcyBub3QgcHJvdmlkZWAuIGBuZW8tYW5nYmFuZC1tb2QtYnVpbGRgIHN0aWxsIHJlZnVzZXMgYSBkZWZhdWx0IGV4cG9ydCB3aXRob3V0IGFuIGludGVnZXIgYGFwaWAsIHNvIGJ1aWxkIGFuIEFQSSAyIG1vZCB3aXRoIHlvdXIgb3duIGJ1bmRsZXIgYW5kIGNoZWNrIGl0IHdpdGggYG5lby1hbmdiYW5kLW1vZC1jaGVja2AsIHdoaWNoIHJlYWRzIGJvdGgga2luZHMgb2YgZGVmYXVsdCBleHBvcnQuCgojIyBXaGF0IHRvIGRvCgpPbmx5IGEgbW9kIHRoYXQgc2hpcHMgYSBgcGx1Z2luLmpzYCBoYXMgYW55dGhpbmcgdG8gbW92ZS4gQSBkYXRhLW9ubHkgbW9kIG5lZWRzIG5vIGNoYW5nZSwgYmVjYXVzZSBpdHMgcmVjb3JkcyBhbmQgcGF0Y2hlcyBjYXJyeSBubyBjb2RlIEFQSSBhbmQgbmVpdGhlciBkbyBpdHMgdGlsZXMgb3IgdGV4dC4gSXRzIG1hbmlmZXN0IHN0aWxsIHJlYWRzIGluIHNjaGVtYSAxLiBTY2hlbWEgMiBpcyBvcHRpb25hbCBmb3IgaXQsIGFuZCBgTW9kUHJvamVjdC5lbWl0KClgIGFscmVhZHkgd3JpdGVzIHNjaGVtYSAyLgoKSWYgeW91IGRvIG5vdGhpbmcgeWV0LCBhIHBsdWdpbiB0aGF0IGRlY2xhcmVzIGBhcGk6IDFgIGtlZXBzIGxvYWRpbmcgdW5jaGFuZ2VkLiBUaGUgaG9zdCBtYXJrcyBpdCBhcyBydW5uaW5nIG9uIGEgY29tcGF0aWJpbGl0eSBwYXRoIGFuZCBzYXlzIHNvIG9uIHRoZSBNb2RzIHNjcmVlbiBhbmQgaW4gdGhlIGxvZy4gYE1PRF9BUElfTUlOYCwgdGhlIG9sZGVzdCBhY2NlcHRlZCBBUEksIGlzIDEuIFJhaXNpbmcgaXQgdGFrZXMgdHdvIHJlbGVhc2VzLiBUaGUgZmlyc3QgcmVsZWFzZSBzaGlwcyB0aGUgbmV3IGJlaGF2aW9yIGFuZCBzaG93cyB0aGUgY29tcGF0aWJpbGl0eS1wYXRoIGxpbmUsIGFuZCB0aGUgc2Vjb25kIHJhaXNlcyB0aGUgZmxvb3IuIE5vIHJlbGVhc2UgaGFzIHJhaXNlZCBpdCBzbyBmYXIuCgpUbyBtb3ZlIGEgbW9kIHRoYXQgcnVucyBjb2RlIG9udG8gQVBJIDIsIGZvbGxvdyB0aGVzZSBzdGVwczoKCjEuIExvb2sgdXAgZWFjaCBtZW1iZXIgb2YgdGhlIG9sZCBgY3R4YCBpbiBTdGVwIDEuIEV2ZXJ5IG1lbWJlciBoYXMgYSBob21lIGluIEFQSSAyIGV4Y2VwdCBgY3R4LnNoYXJlZGAsIHdoaWNoIGhvbGRzIHZhbHVlcyBzaGFyZWQgYmV0d2VlbiBtb2RzLCBhbmQgYGN0eC5kZWJ1Z2AsIHRoZSByZXRpcmVkIHB1YmxpYyBkZWJ1ZyB0b29scy4KMi4gQ29udmVydCB0aGUgbWFuaWZlc3QgKFN0ZXAgMikuCjMuIENoYW5nZSB0aGUgY29kZSBzaGFwZSAoU3RlcCAzKSwgYW5kIHNldCBgYXBpYCB0byBgPj0yLjAuMCA8My4wLjBgIGluIHRoZSBtYW5pZmVzdCBhbmQgaW4gdGhlIGNvZGUncyBvd24gYGFwaWAuCjQuIFdvcmsgdGhyb3VnaCBTdGVwcyA0IHRvIDExIHRvIG1vdmUgcmVhZHMsIGFjdGlvbnMsIGV2ZW50cywgaG9va3MsIGFuZCBwYW5lbHMsIGFsb25nIHdpdGggc3RvcmFnZSBhbmQgbmV0d29yayBjYWxscy4KNS4gU2V0IHRoZSBgZW5naW5lYCByYW5nZSB0byB0aGUgZmlyc3QgZ2FtZSB2ZXJzaW9uIHdpdGggQVBJIDIuIFRoYXQgcmFuZ2UgaXMgYD49MS4yMy4wLWJldGEuMWAgd2hpbGUgMS4yMy4wIGlzIGluIGJldGEgYW5kIGA+PTEuMjMuMGAgb25jZSBpdCBpcyByZWxlYXNlZC4KNi4gQ2hlY2sgdGhlIGZvbGRlciBvciB6aXAgd2l0aCBgbnB4IG5lby1hbmdiYW5kLW1vZC1jaGVjayBwYXRoL3RvL3lvdXItbW9kYCBhbmQgYHBucG0gbW9kLXJ1bm5lciBwYXRoL3RvL3lvdXItbW9kYC4gYG5lby1hbmdiYW5kLW1vZC1idWlsZGAgc3RpbGwgcmVmdXNlcyBhIGRlZmF1bHQgZXhwb3J0IHdpdGhvdXQgYW4gaW50ZWdlciBgYXBpYCwgc28gYnVpbGQgdGhlIG1vZCB3aXRoIHlvdXIgb3duIGJ1bmRsZXIgYW5kIHRoZW4gcnVuIGBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIG9uIHRoZSByZXN1bHQuCjcuIFJlbGVhc2UgYXMgdXN1YWwuIFJ1biBgbnBtIHJ1biB2ZXJpZnlgLCBjb21taXQsIHRhZyB3aXRoIHRoZSBtb2QncyBvd24gdmVyc2lvbiwgYW5kIHB1c2ggdGhlIHRhZy4gQSBwdWJsaXNoZWQgdGFnIGlzIG5ldmVyIG1vdmVkLCBzbyBhIGZpeCB0YWtlcyBhIG1pbm9yIGJ1bXAgb2YgdGhlIG1vZCdzIHZlcnNpb24uCgpUaGUgY2hlY2tsaXN0IGF0IHRoZSBib3R0b20gb2YgdGhpcyBndWlkZSByZXBlYXRzIHRoZXNlIHN0ZXBzIGluIHNob3J0IGZvcm0uCgojIyBTdGVwIDE6IGZpbmQgd2hlcmUgZWFjaCBwYXJ0IG9mIHRoZSBvbGQgY29udGV4dCB3ZW50CgpOZWFybHkgZXZlcnkgbWVtYmVyIG9mIHRoZSBvbGQgYGN0eGAgaGFzIGEgaG9tZSBpbiBBUEkgMi4gRmluZCBlYWNoIG1lbWJlciB5b3VyIHBsdWdpbiB1c2VzIGluIHRoZSB0YWJsZSB0byBzZWUgd2hlcmUgaXQgbGl2ZXMgbm93IGFuZCB3aG8gY2FuIHVzZSBpdC4gIkZpcnN0LXBhcnR5IG9ubHkiIG1lYW5zIG9ubHkgdGhlIGdhbWUncyBvd24gbW9kcyBnZXQgaXQuICJJbi1wcm9jZXNzLCBuZWVkcyBgZW5naW5lOmFjY2Vzc2AiIG1lYW5zIGFuIGluLXByb2Nlc3MgbW9kIHRoZSBwbGF5ZXIgZ2F2ZSBgZW5naW5lOmFjY2Vzc2AsIG5ldmVyIGEgV29ya2VyLiBPbmx5IGBjdHguc2hhcmVkYCBhbmQgYGN0eC5kZWJ1Z2AgaGF2ZSBubyBob21lLgoKfCBPbGQgY3R4IG5hbWUgfCBXaGVyZSBpdCBsaXZlcyBub3cgfCBXaG8gY2FuIHVzZSBpdCB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgY3R4LmlkYCwgYGN0eC5lbmdpbmVgLCBgY3R4LmZsYWdzYCwgYGN0eC5uZXdDaGFyYWN0ZXJgLCBgY3R4LmxvZ2AsIGBjdHgubW9kc2AsIGBjdHguY29udHJvbGxlckFybWVkYCB8IGBtZXRhLmlkYCwgYG1ldGEuZW5naW5lYCwgYG1ldGEuZmxhZ3NgLCBgbWV0YS5uZXdDaGFyYWN0ZXJgLCBgbWV0YS5sb2dgLCBgbWV0YS5tb2RzYCwgYG1ldGEuY29udHJvbGxlckFybWVkYCB8IEV2ZXJ5b25lIHwKfCBgY3R4LmFwaWAgfCBgbWV0YS5hcGlgLCBub3cgYSBzZW12ZXIgc3RyaW5nIGluc3RlYWQgb2YgYW4gaW50ZWdlciB8IEV2ZXJ5b25lIHwKfCBgY3R4LnNldHRpbmdzYCB8IGBtZXRhLnNldHRpbmdzYCBhbmQgYG1ldGEuc2V0U2V0dGluZ2AgfCBFdmVyeW9uZSB8CnwgYGN0eC5jb3JlYCwgYGN0eC5zdGF0ZWAsIGBjdHgucmVnaXN0cmllc2AgfCBgZW5naW5lLmNvcmVgLCBgZW5naW5lLnN0YXRlYCwgYGVuZ2luZS5yZWdpc3RyaWVzYCB8IEluLXByb2Nlc3MgbW9kcyB3aXRoIGBlbmdpbmU6YWNjZXNzYCB8CnwgYGN0eC5kYXRhYCwgYGN0eC5hc3NldFVybGAsIGBjdHguY29tcG9zZWRSZWNvcmRzYCB8IGBjb250ZW50Lm93bmAsIGBjb250ZW50LmFzc2V0YCwgYGNvbnRlbnQucmVjb3Jkc2AsIGBjb250ZW50Lmxvb2t1cGAgfCBFdmVyeW9uZSB8CnwgYGN0eC5wcmVmc2AsIGBjdHguY2hhcmFjdGVyU3RvcmVgIHwgYHN0b3JlLnByZWZzYCwgd2l0aCBhbiBleHBsaWNpdCBwcmVmcyBtaWdyYXRpb24sIGFuZCBgc3RvcmUuY2hhcmFjdGVyYCB8IEV2ZXJ5b25lIHwKfCBgY3R4LnNuYXBzaG90YCwgYGN0eC5kcml2ZXJgIHwgYHZpZXcuaW5wdXRgLCBhbmQgdGhlIGRyaXZlciBhdCBgdmlldy5pbnB1dCgpLmRyaXZlcmAgfCBBbnkgbW9kIHdpdGggYHN0YXRlOmludGVyYWN0aW9uLnJlYWRgIHwKfCBgY3R4Lmtub3duTGV2ZWxgIHwgYHZpZXcubGV2ZWxgIHwgQW55IG1vZCB3aXRoIGBzdGF0ZTptYXAucmVhZGAgfAp8IGBjdHguaW5zcGVjdGAgfCBgdmlldy5pbnNwZWN0YCwgd2hlcmUgYGluc3BlY3RJdGVtYCBiZWNvbWVzIGBpdGVtYCBhbmQgYHNwZWxsSW5mb2AgYmVjb21lcyBgc3BlbGxgIHwgQW55IG1vZCBob2xkaW5nIHRoZSBgc3RhdGU6YCBwZXJtaXNzaW9uIGZvciB0aGUgZGF0YSBhIGNhbGwgcmVhZHMsIHN1Y2ggYXMgYHN0YXRlOmludmVudG9yeS5yZWFkYCBmb3IgYGl0ZW1gIGFuZCBgc3RhdGU6c3BlbGxzLnJlYWRgIGZvciBgc3BlbGxgIHwKfCBgY3R4Lmtub3dsZWRnZWAgfCBgdmlldy5rbm93bGVkZ2VgLCB3aGVyZSBjYXRlZ29yeSBhbmQgaWQgcGljayB0aGUgcmVjYWxsIHBhZ2UgfCBBbnkgbW9kIHdpdGggYHN0YXRlOmtub3dsZWRnZS5yZWFkYCB8CnwgYGN0eC5vcHRpb25zYCB8IGB2aWV3Lm9wdGlvbnNgLCBwbHVzIGBtYW5hZ2Uub3B0aW9uc2AgZm9yIHRoZSBmaXJzdC1wYXJ0eSBlZGl0b3IgfCBgdmlldy5vcHRpb25zYCBuZWVkcyBgc3RhdGU6cGxheWVyLnJlYWRgLiBgbWFuYWdlLm9wdGlvbnNgIGlzIGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHguY2hhcmFjdGVyYCB8IGB2aWV3LmNoYXJhY3RlcmAsIGB2aWV3LnBsYXllcigpLmtleWAsIGFuZCBgZXZlbnRzLm9uKCJydW4tZW5kIilgIHwgQW55IG1vZCB3aXRoIGBzdGF0ZTpwbGF5ZXIucmVhZGAuIGBldmVudHMub25gIGFsc28gbmVlZHMgYGV2ZW50OnJ1bi1lbmRgIHwKfCBgY3R4LmludGVudGAgfCBgYWN0LnN1Ym1pdGAsIHdpdGggYHZpZXcuY2F0YWxvZ3VlYCBhbG9uZ3NpZGUgaXQgfCBBbnkgbW9kIHdpdGggYGlucHV0OmludGVudGAuIGB2aWV3LmNhdGFsb2d1ZWAgbmVlZHMgYHN0YXRlOmludGVyYWN0aW9uLnJlYWRgIHwKfCBgY3R4LnByb21wdGAgfCBgYWN0LmFuc3dlcmAgfCBBbnkgbW9kIHdpdGggYGlucHV0OnByb21wdC5yZXBseWAgfAp8IGBjdHguY29udHJvbGxlcmAgfCBgYWN0LmNvbnRyb2xsZXJgIHwgRXZlcnlvbmUuIFRoZSBgY29udHJvbGxlcmAgbWVtYmVyIG5lZWRzIGBzdGF0ZTppbnRlcmFjdGlvbi5yZWFkYCwgYGlucHV0OmludGVudGAsIGFuZCBgaW5wdXQ6cHJvbXB0LnJlcGx5YCAoc2VlIFN0ZXAgNikgfAp8IGBjdHguZXZlbnRzYCB8IGBldmVudHMub25gIGFuZCBgZXZlbnRzLm9mZmAuIFBheWxvYWRzIGNhcnJ5IG9ubHkgd2hhdCB0aGUgcGxheWVyIGtub3dzIHwgQW55IG1vZCB3aXRoIGBldmVudDo8bmFtZT5gIHwKfCBgY3R4LmtleW1hcHNgIHwgYHVpLmtleXNgIHwgQW55IG1vZCB3aXRoIGBrZXltYXA6d3JpdGVgIHwKfCBgY3R4LnVpYCB8IGB1aS5tb3VudGAsIGB1aS5wYXRjaGAsIGFuZCBgcHJlc2VudGF0aW9uLnBhbmVsc2AgZm9yIGZpcnN0LXBhcnR5IERPTSBwYW5lbHMgfCBgdWkubW91bnRgIGFuZCBgdWkucGF0Y2hgIG5lZWQgYHVpOnBhbmVsLm1vdW50YC4gYHByZXNlbnRhdGlvbi5wYW5lbHNgIG5lZWRzIGZpcnN0LXBhcnR5IGluLXByb2Nlc3MgZXhlY3V0aW9uIGFuZCBgdWk6cmVnaW9uLmNyZWF0ZWAgfAp8IGBjdHgudGl0bGVgIHwgYHVpLnRpdGxlYCBhbmQgYHByZXNlbnRhdGlvbi50aXRsZWAgfCBgdWk6dGl0bGVgLiBgcHJlc2VudGF0aW9uLnRpdGxlYCBhbHNvIG5lZWRzIGZpcnN0LXBhcnR5IGluLXByb2Nlc3MgZXhlY3V0aW9uIHwKfCBgY3R4Lm5ldGAgfCBgbmV0LnJlcXVlc3RgIGFuZCBgbmV0LmNyZWRlbnRpYWxzYCwgd2hpY2ggaGFuZHMgb3V0IGNyZWRlbnRpYWxzIGJ5IG9wYXF1ZSByZWZlcmVuY2UgfCBBbnkgbW9kIHdpdGggYG5ldHdvcms6PGhvc3Q+YCBmb3IgZWFjaCBob3N0IGl0cyBtYW5pZmVzdCBuYW1lcyB8CnwgYGN0eC5iYWNrdXBGb2xkZXJgIHwgYGJhY2t1cEZvbGRlcmAgfCBBbnkgbW9kIHdpdGggYGJhY2t1cDpmb2xkZXJgIHwKfCBgY3R4LmRpc3BsYXlgIHwgYHByZXNlbnRhdGlvbi5kaXNwbGF5YCB8IEZpcnN0LXBhcnR5IGluLXByb2Nlc3MgbW9kcyB3aXRoIGBkaXNwbGF5OnJlcGxhY2VgLiBBIGxpdmUgYG9uS2V5YCBhbHNvIG5lZWRzIGBrZXltYXA6ZWRpdGAgfAp8IGBjdHguc3Vid2luZG93c2AgfCBgcHJlc2VudGF0aW9uLnN1YndpbmRvd3NgIHwgRmlyc3QtcGFydHkgaW4tcHJvY2VzcyBtb2RzIHdpdGggYHVpOnJlZ2lvbi5jcmVhdGVgIHwKfCBgY3R4LnRpbGVzYCB8IGBwcmVzZW50YXRpb24udGlsZXNgIHwgRmlyc3QtcGFydHkgaW4tcHJvY2VzcyBtb2RzIHdpdGggYGRpc3BsYXk6cmVwbGFjZWAgfAp8IGBjdHgua2V5UmVwZWF0YCB8IGBwcmVzZW50YXRpb24ua2V5UmVwZWF0YCB8IEZpcnN0LXBhcnR5IGluLXByb2Nlc3MgbW9kcyB3aXRoIGBrZXltYXA6ZWRpdGAgfAp8IGBjdHguYXV0aG9yaW5nYCB8IGBtYW5hZ2UuYXV0aG9yaW5nYCB8IEZpcnN0LXBhcnR5IG1vZHMgd2l0aCBgbW9kOmF1dGhvcmluZ2AgfAp8IGBjdHgua2V5YmluZGluZ3NgIHwgYG1hbmFnZS5rZXlzYCB8IEZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHgubG9va2AgfCBgbWFuYWdlLmxvb2tgIHwgRmlyc3QtcGFydHkgb25seSB8CnwgYGN0eC5zYXZlc2AgfCBgbWFuYWdlLnNhdmVzYCB8IEZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHguc2Vzc2lvbmAgfCBgbWFuYWdlLnNlc3Npb25gIHwgRmlyc3QtcGFydHkgb25seSB8CnwgYGN0eC5wcm9maWxlc2AgfCBgbWFuYWdlLnByb2ZpbGVzYCB8IEZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHguaW5zdGFsbE1vZGAgfCBgbWFuYWdlLm1vZHMucGxhbkluc3RhbGxgLCBgbWFuYWdlLm1vZHMuYXBwbHlQbGFuYCB8IEZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHgucmVsb2FkR2FtZWAgfCBgbWFuYWdlLnJlbG9hZEdhbWVgIHwgRmlyc3QtcGFydHkgb25seSB8CnwgYGN0eC5sb2FkTW9kRm9yU2Vzc2lvbmAgfCBgbWFuYWdlLmxvYWRGb3JTZXNzaW9uYCB8IEZpcnN0LXBhcnR5IG9ubHkgfAp8IGBjdHgucmVhZE1vZGAgfCBgbWFuYWdlLm1vZHMuZGlzY292ZXJgIHwgRmlyc3QtcGFydHkgb25seSB8CnwgYGN0eC53aXphcmRgIHwgYG1hbmFnZS53aXphcmRgIHwgRmlyc3QtcGFydHkgbW9kcyB3aXRoIGBkZWJ1Zzp3aXphcmRgIHwKfCBgY3R4LnNoYXJlZGAgfCBOb25lLiBBUEkgMiBoYXMgbm8gdmFsdWVzIHNoYXJlZCBiZXR3ZWVuIG1vZHMgeWV0IHwgTm8gb25lIHwKfCBgY3R4LmRlYnVnYCB8IE5vbmUuIEl0IGlzIHJldGlyZWQgZnJvbSBwdWJsaWMgbW9kcywgYW5kIGRlYnVnIHRvb2xpbmcgaXMgZmlyc3QtcGFydHkgfCBObyBvbmUgfAoKVGhlIGVudHJpZXMgb2YgdGhlIHBsdWdpbiBvYmplY3QgaXRzZWxmIG1vdmUgb250byB0aGUgZGVmaW5pdGlvbjoKCnwgT2xkIHBsdWdpbiBlbnRyeSB8IERlZmluaXRpb24gZW50cnkgfAp8IC0tLSB8IC0tLSB8CnwgYGNvbnRyb2xsZXJgIHwgVGhlIGRlZmluaXRpb24ncyBgY29udHJvbGxlcihtb2QsIGlucHV0KWAgbWVtYmVyLCBob2xkaW5nIGBhcm1lZGAsIGBvbktleWAsIGFuZCBgb25EZWF0aGAgfAp8IGByZWdpc3Rlcihob3N0LCBjdHgpYCB8IGBzdGFydChtb2QpYC4gV2hpbGUgYHN0YXJ0YCBydW5zLCBgbW9kLmVuZ2luZT8ucmVnaXN0cnlgIGlzIHRoZSByZWdpc3RyeSBob3N0IHRoYXQgYHJlZ2lzdGVyYCB1c2VkIHRvIHJlY2VpdmUuIEFueSBhdXRob3IgY2FuIHJlYWNoIGl0IHdpdGggYGVuZ2luZTphY2Nlc3NgLCBpbi1wcm9jZXNzIG9ubHkgfAp8IGBtZW51YCwgYHNjcmVlbmAsIGBodWRgLCBgYmlydGhgIHwgVGhlIGBwcmVzZW50YXRpb25gIG1lbWJlcidzIGBtZW51YCwgYHNjcmVlbmAsIGBodWRgLCBhbmQgYGJpcnRoYCBlbnRyaWVzLCBwbHVzIHRoZSBgYmlydGhgIG1lbWJlciB8CnwgR2FtZS1tZW51IHJvd3MgfCBUaGUgYGFjdGlvbnNgIG1lbWJlciBvciBgdWkuZ2FtZU1lbnUucmVnaXN0ZXJgIHwKfCBUaXRsZSByb3dzIHwgVGhlIGB0aXRsZUFjdGlvbnNgIG1lbWJlciBvciBgdWkudGl0bGUucmVnaXN0ZXJSb3dgIHwKClRoZSBob29rcyB0aGF0IHBhc3MgbGl2ZSBnYW1lIG9iamVjdHMgc3RheSByZWFjaGFibGUgdGhyb3VnaCBgZW5naW5lSG9va3MoY29udGV4dClgIChzZWUgU3RlcCA4KS4KCk90aGVyIG1vZHMgY2Fubm90IHVzZSBhbnkgcm93IG1hcmtlZCBmaXJzdC1wYXJ0eSBvbmx5LCBzbyBhIG1vZCB0aGF0IG5lZWRzIG9ubHkgdGhvc2Ugcm93cyBjYW4gc3RheSBvbiBBUEkgMS4gYEFQSTFfQ09OVEVYVF9NQVBgIGluIGBwYWNrYWdlcy93ZWIvc3JjL21vZC1hcGkyLXNoaW0udHNgIG5hbWVzLCBmb3IgZXZlcnkgbWVtYmVyIG9mIHRoZSBBUEkgMSBjb250ZXh0LCB3aGVyZSBpdCB3ZW50IGluIEFQSSAyIG9yIHdoeSBpdCBoYXMgbm9uZS4KCiMjIFN0ZXAgMjogY29udmVydCB0aGUgbWFuaWZlc3QKClNjaGVtYSAyIHdyYXBzIHRoZSBtYW5pZmVzdCBpbiBhIGRvY3VtZW50OiBgeyAiZm9ybWF0IjogIm5lby1hbmdiYW5kL21vZC9tYW5pZmVzdCIsICJzY2hlbWFWZXJzaW9uIjogMiwgImRhdGEiOiB7IC4uLiB9IH1gLiBUaGUgZ2FtZSByZWFkcyBhIGJhcmUgc2NoZW1hIDEgbWFuaWZlc3QsIGEgc2NoZW1hIDEgZG9jdW1lbnQgYW5kIGEgc2NoZW1hIDIgZG9jdW1lbnQuIGBNb2RQcm9qZWN0LmVtaXQoKWAgYWxyZWFkeSB3cml0ZXMgc2NoZW1hIDIuIEZvciBhIGhhbmQtd3JpdHRlbiBtYW5pZmVzdCwgcnVuIHRoZSBjb252ZXJ0ZXIgb25jZSBmcm9tIGEgTm9kZSBzY3JpcHQgaW4geW91ciBtb2QncyByZXBvc2l0b3J5OgoKYGBganMKaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSAibm9kZTpmcyI7CmltcG9ydCB7IGNvbnZlcnRNYW5pZmVzdFYxLCBtb2RNYW5pZmVzdEZvcm1hdCwgc2VyaWFsaXplRG9jdW1lbnQgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKCmNvbnN0IHYxID0gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoIm1hbmlmZXN0Lmpzb24iLCAidXRmOCIpKTsKd3JpdGVGaWxlU3luYygibWFuaWZlc3QuanNvbiIsIHNlcmlhbGl6ZURvY3VtZW50KG1vZE1hbmlmZXN0Rm9ybWF0LCBjb252ZXJ0TWFuaWZlc3RWMSh2MSkpKTsKYGBgCgpgc2VyaWFsaXplRG9jdW1lbnRgIHZhbGlkYXRlcyB0aGUgcmVzdWx0IGFuZCB0aHJvd3MgYERvY3VtZW50VmFsaWRhdGlvbkVycm9yYCB3aGVuIGl0IGRvZXMgbm90IHBhc3MuIGBtYW5pZmVzdFRvVjJgIGRvZXMgdGhlIHNhbWUgam9iIGZvciBhIGBQYWNrTWFuaWZlc3RgIGFscmVhZHkgaW4gbWVtb3J5LgoKQmVmb3JlLCB0aGUgc2NoZW1hIDEgbWFuaWZlc3Qgb2YgYHNhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTA2LWFkZC1hbi1vcHRpb25gOgoKYGBganNvbgp7CiAgImlkIjogInR1dG9yaWFsLTA2LWFkZC1hbi1vcHRpb24iLAogICJuYW1lIjogIlR1dG9yaWFsIDY6IEFkZCBhbiBPcHRpb24iLAogICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAic2hhcGUiOiAicGx1Z2luIiwKICAibW9kQXBpIjogMSwKICAiZW5naW5lIjogIj49MC4yMC4wIiwKICAiYXV0aG9yIjogIm5lb3N0cnlkZXIiLAogICJsaWNlbnNlIjogIkdQTC0yLjAtb25seSIsCiAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIiLAogICJkZXNjcmlwdGlvbiI6ICIuLi4iLAogICJydWxlcyI6IFt7ICJmbGFnIjogInR1dG9yaWFsLTA2LWFkZC1hbi1vcHRpb24uY29uZ3JhdHVsYXRlIiwgInRpdGxlIjogIi4uLiIsICJkZXNjcmlwdGlvbiI6ICIuLi4iLCAiZGVmYXVsdCI6IGZhbHNlIH1dCn0KYGBgCgpBZnRlciwgYXMgdGhlIGNvbnZlcnRlciB3cml0ZXMgaXQgKGRlc2NyaXB0aW9ucyBzaG9ydGVuZWQgaGVyZSk6CgpgYGBqc29uCnsKICAiZm9ybWF0IjogIm5lby1hbmdiYW5kL21vZC9tYW5pZmVzdCIsCiAgInNjaGVtYVZlcnNpb24iOiAyLAogICJkYXRhIjogewogICAgImlkIjogInR1dG9yaWFsLTA2LWFkZC1hbi1vcHRpb24iLAogICAgIm5hbWUiOiAiVHV0b3JpYWwgNjogQWRkIGFuIE9wdGlvbiIsCiAgICAidmVyc2lvbiI6ICIxLjAuMCIsCiAgICAiYXBpIjogIj49MS4wLjAgPDIuMC4wIiwKICAgICJydW50aW1lIjogImluLXByb2Nlc3MiLAogICAgImVuZ2luZSI6IHsKICAgICAgInJhbmdlIjogIj49MC4yMC4wIiwKICAgICAgImJlY2F1c2UiOiAiQ2FycmllZCBvdmVyIGZyb20gYSBzY2hlbWEgMSBtYW5pZmVzdCwgd2hpY2ggZ2F2ZSBubyByZWFzb24uIgogICAgfSwKICAgICJkZXNjcmlwdGlvbiI6ICIuLi4iLAogICAgImF1dGhvciI6ICJuZW9zdHJ5ZGVyIiwKICAgICJsaWNlbnNlIjogIkdQTC0yLjAtb25seSIsCiAgICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlciIsCiAgICAic2hhcGUiOiAicGx1Z2luIiwKICAgICJydWxlcyI6IFt7ICJmbGFnIjogInR1dG9yaWFsLTA2LWFkZC1hbi1vcHRpb24uY29uZ3JhdHVsYXRlIiwgInRpdGxlIjogIi4uLiIsICJkZXNjcmlwdGlvbiI6ICIuLi4iLCAiZGVmYXVsdCI6IGZhbHNlIH1dCiAgfQp9CmBgYAoKV2hhdCB0aGUgY29udmVydGVyIGNoYW5nZXM6Cgp8IFNjaGVtYSAxIHwgU2NoZW1hIDIgfAp8IC0tLSB8IC0tLSB8CnwgYCJtb2RBcGkiOiAxYCwgYHJ1bnRpbWVgIGFic2VudCBvciBgImluLXByb2Nlc3MiYCB8IGAicnVudGltZSI6ICJpbi1wcm9jZXNzImAsIGAiYXBpIjogIj49MS4wLjAgPDIuMC4wImAgfAp8IGAibW9kQXBpIjogMmAsIGAicnVudGltZSI6ICJ3b3JrZXIiYCwgYHdvcmtlckVudHJ5YCB8IGAicnVudGltZSI6ICJ3b3JrZXIiYCwgYCJhcGkiOiAiMi4wLjAtd29ya2VyImAsIGBlbnRyeWAgfAp8IE5vIGBtb2RBcGlgIGFuZCBubyBgcGx1Z2luYCBmYWNldCB8IGAicnVudGltZSI6ICJkYXRhImAsIGAiYXBpIjogIioiYCB8CnwgYCJlbmdpbmUiOiAiPHJhbmdlPiJgIHwgYCJlbmdpbmUiOiB7ICJyYW5nZSIsICJiZWNhdXNlIiB9YCwgd2l0aCB0aGUgcGxhY2Vob2xkZXIgcmVhc29uIHNob3duIGFib3ZlIHwKfCBgZGVwZW5kZW5jaWVzYCB8IGBkZXBlbmRlbmNpZXMucmVxdWlyZWRgLCBlYWNoIGFzIGB7ICJyYW5nZSIgfWAgfAp8IGBvcHRpb25hbERlcGVuZGVuY2llc2AgfCBgZGVwZW5kZW5jaWVzLm9wdGlvbmFsYCB8CnwgQSBgY29tcGF0YCBjbGFpbSBvZiBgY29uZmxpY3RzYCB3aXRoIG5vIGBzY29wZWAsIHRoZSBvbmx5IG9uZSBmb3IgdGhhdCBtb2QsIHdoaWNoIGlzIG5vdCBhbHNvIGEgZGVwZW5kZW5jeSB8IGBkZXBlbmRlbmNpZXMuY29uZmxpY3RzYCwgYXMgYHsgInJhbmdlIj8sICJiZWNhdXNlIiB9YCB8CnwgRXZlcnkgb3RoZXIgYGNvbXBhdGAgY2xhaW0gfCBgY29tcGF0YCwgdW5jaGFuZ2VkIHwKfCBgY2hhbmdlbG9nYCwgYHNjcmVlbnNob3RzYCB8IGBsaXN0aW5nLmNoYW5nZWxvZ2AsIGBsaXN0aW5nLnNjcmVlbnNob3RzYCB8CnwgRXZlcnkgb3RoZXIgZmllbGQgfCBLZXB0IHVuZGVyIHRoZSBzYW1lIG5hbWUgfAoKVGhlIGNvbnZlcnRlciB0aHJvd3MgYE1hbmlmZXN0Q29udmVyc2lvbkVycm9yYCBmb3IgYSBtb2QgdGhhdCBzaGlwcyBjb2RlIHdpdGhvdXQgYSBgbW9kQXBpYCAoYWRkIGAibW9kQXBpIjogMWAgZmlyc3QpIGFuZCBmb3IgYW55IG90aGVyIGBtb2RBcGlgIHZhbHVlLgoKQWZ0ZXIgY29udmVydGluZywgcmVwbGFjZSB0aGUgcGxhY2Vob2xkZXIgYGJlY2F1c2VgIHVuZGVyIGBlbmdpbmVgIHdpdGggdGhlIHJlYWwgcmVhc29uIHRoZSBtb2QgbmVlZHMgdGhhdCBnYW1lIHZlcnNpb24sIG9yIHJlbW92ZSBgZW5naW5lYCBpZiBub3RoaW5nIG5lZWRzIGl0LiBBIHJlcXVpcmVkIG9yIG9wdGlvbmFsIGRlcGVuZGVuY3kgY2FuIGNhcnJ5IGl0cyBvd24gYGJlY2F1c2VgLiBTY2hlbWEgMiBhbHNvIGFkZHMgYHRleHRgIChhIGRlZmF1bHQgbG9jYWxlIGFuZCBvbmUgc3RyaW5ncyBmaWxlIHBlciBsb2NhbGUpLCBgbGlzdGluZy50YWdzYCBhbmQgYGJ1ZGdldGAuCgpgYnVkZ2V0Lm1zUGVyVHVybmAgaXMgdGhlIHRpbWUgdGhlIG1vZCBhc2tzIGZvciBwZXIgZ2FtZSB0dXJuLCBhYm92ZSAwIGFuZCBhdCBtb3N0IDUwMCBtaWxsaXNlY29uZHMuIFRoZSBob3N0IGRvZXMgbm90IHJlYWQgaXQgeWV0LCBzbyBldmVyeSBtb2QgaXMgaGVsZCB0byB0aGUgZGVmYXVsdCBvZiA1MCBtcy4gT25seSB0aGUgc3luY2hyb25vdXMgcGFydCBvZiBlYWNoIGNhbGwgaW50byB0aGUgbW9kIGlzIHRpbWVkLiBBIHR1cm4gb3ZlciB0aGUgYnVkZ2V0IHdyaXRlcyBhIHdhcm5pbmcgdG8gdGhlIGxvZy4gQSB0aHJvdywgYSByZWplY3RlZCBwcm9taXNlLCBvciBhIHNlY29uZCB0dXJuIG92ZXIgNTAwIG1zIHdpdGhpbiAyMDAgZ2FtZSB0dXJucyBjb3VudHMgYXMgYSBmYXVsdCwgYW5kIHRocmVlIGZhdWx0cyB3aXRoaW4gMjAwIGdhbWUgdHVybnMgc3dpdGNoIHRoZSBtb2Qgb2ZmIHVudGlsIHRoZSBnYW1lIG5leHQgc3RhcnRzLgoKVGhlIHZhbGlkYXRvciBhbHNvIGNoZWNrcyB0aGF0IHRoZSBmaWVsZHMgYWdyZWUuIEEgYGRhdGFgIG1vZCBoYXMgbm8gYGVudHJ5YCwgbm8gYHBsdWdpbmAgZmFjZXQgYW5kIG5vIGAuanNgIG9yIGAubWpzYCBmaWxlIGluIGl0cyBwYXlsb2FkLiBBbiBgaW4tcHJvY2Vzc2AgbW9kJ3MgZW50cnkgaXMgYHBsdWdpbi5qc2AsIGEgYHdvcmtlcmAgbW9kIG5hbWVzIGl0cyBgZW50cnlgLCBhbmQgYSBtb2QgdGhhdCBydW5zIGNvZGUgbGlzdHMgYHBsdWdpbmAgaW4gYGZhY2V0c2Agd2hlbiBpdCBsaXN0cyBmYWNldHMgYXQgYWxsLiBBIG1vZCBpZCBhcHBlYXJzIGluIGF0IG1vc3Qgb25lIG9mIGByZXF1aXJlZGAsIGBvcHRpb25hbGAgYW5kIGBjb25mbGljdHNgLCBhbmQgYSBtb2QgY2Fubm90IGxpc3QgaXRzZWxmLgoKVGhlIGBhcGlgIHJhbmdlIGRlY2lkZXMgd2hldGhlciB0aGUgbW9kIGxvYWRzLiBgPj0xLjAuMCA8Mi4wLjBgIGtlZXBzIGl0IG9uIEFQSSAxLCB3aGljaCB0aGlzIGJ1aWxkIHN0aWxsIGxvYWRzLiBBbiBBUEkgMiBtb2QgZGVjbGFyZXMgYD49Mi4wLjAgPDMuMC4wYCAoYE1PRF9BUEkyX0RFRkFVTFRfUkFOR0VgKSwgaW4gYm90aCB0aGUgbWFuaWZlc3QgYW5kIHRoZSBjb2RlJ3Mgb3duIGBhcGlgLiBgYXBpUmFuZ2VWZXJkaWN0KHJhbmdlKWAgYW5zd2VycyBgeyBvazogdHJ1ZSB9YCBvciBvbmUgb2YgZm91ciBjb2RlczogYHRvby1uZXdgICh0aGUgbW9kIG5lZWRzIGEgbmV3ZXIgZ2FtZSksIGB0b28tb2xkYCAodGhlIG1vZCBuZWVkcyBhbiB1cGRhdGUpLCBgb3V0c2lkZWAgKHRoZSByYW5nZSBtaXNzZXMgdGhpcyB2ZXJzaW9uIGZvciBhbm90aGVyIHJlYXNvbikgYW5kIGBtYWxmb3JtZWRgLgoKIyMgU3RlcCAzOiBjaGFuZ2UgdGhlIHNoYXBlIG9mIHRoZSBjb2RlCgpBbiBBUEkgMiBtb2QgZGVmYXVsdC1leHBvcnRzIGFuIGBBcGkyTW9kRGVmaW5pdGlvbmA6Cgp8IEFQSSAxIGBNb2RQbHVnaW5gIHwgQVBJIDIgYEFwaTJNb2REZWZpbml0aW9uYCB8CnwgLS0tIHwgLS0tIHwKfCBgYXBpOiAxYCB8IGBhcGk6ICI+PTIuMC4wIDwzLjAuMCJgIHwKfCBgaG9va3MoY3R4KWAgfCBgaG9va3MoeyBpZCwgZmxhZ3MgfSlgIHwKfCBgcmVnaXN0ZXIoaG9zdCwgY3R4KWAgfCBgc3RhcnQobW9kKWAsIHdoaWNoIG1heSBiZSBhc3luYy4gQSByZWplY3RlZCBwcm9taXNlIGlzIHdyaXR0ZW4gdG8gdGhlIG1vZCdzIGxvZy4gfAp8IGBtaWdyYXRlQmFnKGRhdGEsIGZyb21TY2hlbWEsIGN0eClgIHwgYG1pZ3JhdGVCYWcoZGF0YSwgZnJvbVNjaGVtYSlgLCB3aGljaCByZWNlaXZlcyBhIGNvcHkgfAp8IGB1bmluc3RhbGwoKWAgfCBgc3RvcCgpYCB8CnwgTm8gZXF1aXZhbGVudCB8IGBwcmVmczogeyB2ZXJzaW9uLCBtaWdyYXRlIH1gIChzZWUgU3RlcCAxMCkgfAoKQSBkZWZpbml0aW9uIGRlY2xhcmVzIGBob29rc2AsIGBzdGFydGAgb3IgYm90aCwgYW5kIGBwcmVmcy52ZXJzaW9uYCBpcyBhIHdob2xlIG51bWJlciBmcm9tIDEuCgpCZWZvcmU6CgpgYGB0cwppbXBvcnQgdHlwZSB7IE1vZEhvb2tzLCBNb2RQbHVnaW5Db250ZXh0LCBNb2RSZWdpc3RyeUhvc3QgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1jb3JlIjsKCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCiAgaG9va3MoY3R4OiBNb2RQbHVnaW5Db250ZXh0KTogTW9kSG9va3MgfCB1bmRlZmluZWQgewogICAgaWYgKGN0eC5mbGFnc1sibXktbW9kLnNob3V0Il0gIT09IHRydWUpIHJldHVybiB1bmRlZmluZWQ7CiAgICByZXR1cm4geyBtZXNzYWdlVGV4dDogKHJhdykgPT4gcmF3LnRvVXBwZXJDYXNlKCkgfTsKICB9LAogIHJlZ2lzdGVyKF9ob3N0OiBNb2RSZWdpc3RyeUhvc3QsIGN0eDogTW9kUGx1Z2luQ29udGV4dCk6IHZvaWQgewogICAgY3R4LmxvZygic3RhcnRlZCIpOwogIH0sCiAgdW5pbnN0YWxsKCk6IHZvaWQge30sCn07CmBgYAoKQWZ0ZXI6CgpgYGB0cwppbXBvcnQgdHlwZSB7IEFwaTJNb2REZWZpbml0aW9uIH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNkayI7CgpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIGhvb2tzOiAoeyBmbGFncyB9KSA9PgogICAgZmxhZ3NbIm15LW1vZC5zaG91dCJdID09PSB0cnVlID8geyBtZXNzYWdlVGV4dDogKHJhdykgPT4gcmF3LnRvVXBwZXJDYXNlKCkgfSA6IHVuZGVmaW5lZCwKICBzdGFydChtb2QpIHsKICAgIG1vZC5tZXRhLmxvZygic3RhcnRlZCIpOwogIH0sCiAgc3RvcCgpIHt9LAp9IHNhdGlzZmllcyBBcGkyTW9kRGVmaW5pdGlvbjsKYGBgCgpJbXBvcnQgdGhlIFNESyB3aXRoIGBpbXBvcnQgdHlwZWAgYW5kIGNoZWNrIHRoZSBvYmplY3Qgd2l0aCBgc2F0aXNmaWVzYC4gYGRlZmluZUFwaTJNb2QoZGVmaW5pdGlvbilgIHJldHVybnMgaXRzIGFyZ3VtZW50IGFuZCBnaXZlcyB0aGUgc2FtZSBjaGVjaywgYnV0IGl0IGlzIGEgdmFsdWUgaW1wb3J0LCBhbmQgYSBtb2R1bGUgbG9hZGVkIGZyb20gYSBtb2QgZm9sZGVyIGNhbm5vdCByZXNvbHZlIGEgcGFja2FnZSBieSBuYW1lLiBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCByZWZ1c2VzIGFueSBzdWNoIGltcG9ydCBsZWZ0IGluIGBwbHVnaW4uanNgLgoKIyMgU3RlcCA0OiBoYW5kbGUgcmVzdWx0cyBpbnN0ZWFkIG9mIGV4Y2VwdGlvbnMKCkluIEFQSSAxIGEgcGVybWlzc2lvbiB0aGUgcGxheWVyIHJlZnVzZWQgc2hvd3MgdXAgYXMgYSBtaXNzaW5nIGBjdHhgIG1lbWJlciAoYGN0eC51aWAgaXMgdW5kZWZpbmVkKSBvciBhcyBhbiBgQWdlbnRDYXBhYmlsaXR5RXJyb3JgIHRocm93biBieSB0aGUgY2FsbC4gSW4gQVBJIDIgZXZlcnkgZG9tYWluIGlzIHByZXNlbnQgYW5kIGV2ZXJ5IG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSBvZiBhbiBgQXBpMlJlc3VsdGAuIENoZWNrIGBva2AgYmVmb3JlIHJlYWRpbmcgYHZhbHVlYDoKCmBgYHRzCmNvbnN0IG1vbnN0ZXJzID0gYXdhaXQgbW9kLnZpZXcubW9uc3RlcnMoKTsKaWYgKG1vbnN0ZXJzLm9rKSB7CiAgbW9kLm1ldGEubG9nKGAke21vbnN0ZXJzLnZhbHVlLmxlbmd0aH0gbW9uc3RlcnMgaW4gdmlld2ApOwp9IGVsc2UgaWYgKG1vbnN0ZXJzLnJlYXNvbiA9PT0gIm5vdC1ncmFudGVkIikgewogIG1vZC5tZXRhLmxvZyhgbW9uc3RlciBjb3VudCBpcyBvZmY6IGl0IG5lZWRzICR7bW9uc3RlcnMuY2FwYWJpbGl0eX1gKTsKfSBlbHNlIHsKICBtb2QubWV0YS5sb2cobW9uc3RlcnMubWVzc2FnZSk7Cn0KYGBgCgpBIGZhaWx1cmUgaXMgYG5vdC1ncmFudGVkYCAod2l0aCB0aGUgYGNhcGFiaWxpdHlgIHRvIGFzayBmb3IpLCBgdW5hdmFpbGFibGVgIChubyBnYW1lIHlldCwgbm8gY2hhcmFjdGVyIHlldCwgb3IgYSBmcm9udCBlbmQgd2l0aG91dCB0aGUgZmVhdHVyZSkgb3IgYHJlZnVzZWRgICh3aXRoIGEgYGNvZGVgKS4gRXZlcnkgZmFpbHVyZSBoYXMgYSBgbWVzc2FnZWAuIGBpc05vdEdyYW50ZWQocmVzdWx0KWAgaW4gdGhlIFNESyBtYWtlcyB0aGUgc2FtZSBjaGVjayBhcyBgcmVzdWx0LnJlYXNvbiA9PT0gIm5vdC1ncmFudGVkImAsIHRob3VnaCBjb2RlIGJ1aWx0IHdpdGggYG5lby1hbmdiYW5kLW1vZC1idWlsZGAgaGFzIHRvIHdyaXRlIHRoZSBjb21wYXJpc29uIG91dCBmb3IgdGhlIGltcG9ydCByZWFzb24gaW4gU3RlcCAzLiBgbW9kLm1ldGEuZ3JhbnRlZCgiZXZlbnQ6bWVzc2FnZSIpYCBhbnN3ZXJzIHdoZXRoZXIgYSBwZXJtaXNzaW9uIGlzIGdyYW50ZWQgd2l0aG91dCBtYWtpbmcgYSBjYWxsLiBBIGZhdWx0IHRoYXQgaXMgbm90IGEgcGVybWlzc2lvbiBwcm9ibGVtIHN0aWxsIHJlamVjdHMgdGhlIHByb21pc2UuCgojIyBTdGVwIDU6IG1vdmUgcmVhZHMgdG8gYHZpZXdgIGFuZCBgY29udGVudGAKCnwgQVBJIDEgfCBBUEkgMiB8IFBlcm1pc3Npb24gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYGN0eC5zdGF0ZS5hY3Rvci5wbGF5ZXJgLCBgY3R4LmNoYXJhY3Rlci5rZXkoKWAgfCBgdmlldy5wbGF5ZXIoKWAgfCBgc3RhdGU6cGxheWVyLnJlYWRgIHwKfCBgY3R4LnN0YXRlLm1vbnN0ZXJzYCwgYGN0eC5pbnNwZWN0YCB8IGB2aWV3Lm1vbnN0ZXJzKClgLCBgdmlldy53b3JsZCgpYCB8IGBzdGF0ZTptb25zdGVycy5yZWFkYCB8CnwgYGN0eC5rbm93bkxldmVsKClgIHwgYHZpZXcubGV2ZWwoKWAgfCBgc3RhdGU6bWFwLnJlYWRgIHwKfCBgY3R4LnNuYXBzaG90KClgLCBgY3R4LmRyaXZlcigpYCB8IGB2aWV3LmlucHV0KClgIChgdG9rZW5gLCBgZHJpdmVyYCwgYHBoYXNlYCwgYG1lc3NhZ2VQZW5kaW5nYCwgYHByb21wdGApIHwgYHN0YXRlOmludGVyYWN0aW9uLnJlYWRgIHwKfCBBbGwgb2YgdGhlIGFib3ZlIGF0IG9uY2UgfCBgdmlldy53b3JsZCgpYCwgd2l0aCBgbnVsbGAgZm9yIGVhY2ggcGFydCB0aGUgbW9kIG1heSBub3QgcmVhZCB8IEVhY2ggcGFydCdzIG93biB8CnwgYGN0eC5yZWdpc3RyaWVzYCwgYGN0eC5jb21wb3NlZFJlY29yZHNgIHwgYGNvbnRlbnQucmVjb3JkcyhmaWxlKWAsIGBjb250ZW50Lmxvb2t1cCh7IGZpbGUsIGtleSB9KWAgfCBOb25lIHwKfCBgY3R4LmRhdGFgLCBgY3R4LmFzc2V0VXJsKHBhdGgpYCB8IGBjb250ZW50Lm93bigpYCwgYGNvbnRlbnQuYXNzZXQocGF0aClgIHwgTm9uZSB8CnwgYGN0eC5jb3JlYCB8IE5vbmUgfCB8Cgpgdmlld2Agc2hvd3MgdGhlIGdhbWUgYXMgdGhlIHBsYXllciBrbm93cyBpdC4gSXQgbGlzdHMgb25seSB0aGUgbW9uc3RlcnMgdGhlIHBsYXllciBwZXJjZWl2ZXMsIHdpdGggYSBoZWFsdGggYmFuZCAoYHVuaHVydGAgdG8gYGFsbW9zdGApIGluIHBsYWNlIG9mIGhpdCBwb2ludHMsIHRoZSByYWNlJ3MgYmFzZSBzcGVlZCBpbiBwbGFjZSBvZiBpdHMgY3VycmVudCBzcGVlZCwgYW5kIG9ubHkgdGhlIGZsYWdzIGFuZCBzcGVsbHMgdGhlIHBsYXllcidzIG1vbnN0ZXIgbWVtb3J5IGhhcyBsZWFybmVkLiBJdGVtcyBzaG93IHdoYXQgdGhlIHBsYXllciBoYXMgaWRlbnRpZmllZCwgYW5kIHRoZSBsZXZlbCBpcyB0aGUgcmVtZW1iZXJlZCBtYXAsIG5ldmVyIHRoZSByZWFsIG9uZS4gQW4gQVBJIDEgbW9kIHRoYXQgcmVhZCBgY3R4LnN0YXRlYCBzYXcgZXZlcnkgbW9uc3RlciBvbiB0aGUgbGV2ZWwgYW5kIGl0cyBleGFjdCBoaXQgcG9pbnRzLCBzbyBjb2RlIHRoYXQgY291bnRlZCBvciB0cmFja2VkIGhpZGRlbiBtb25zdGVycyBoYXMgbm8gZGlyZWN0IHRyYW5zbGF0aW9uLgoKQmVmb3JlOgoKYGBgdHMKY29uc3Qgc3RhdGUgPSBjdHguc3RhdGU7CmlmICghc3RhdGUpIHJldHVybjsKY29uc3QgcCA9IHN0YXRlLmFjdG9yLnBsYXllcjsKY3R4LmxvZyhgSFAgJHtwLmNocH0vJHtwLm1ocH1gKTsKY29uc3Qgd291bmRlZCA9IHN0YXRlLm1vbnN0ZXJzLmZpbHRlcigobSkgPT4gbSAhPT0gbnVsbCAmJiBtLmhwIDwgbS5tYXhocCk7CmN0eC5sb2coYCR7d291bmRlZC5sZW5ndGh9IHdvdW5kZWQgbW9uc3RlcnMgb24gdGhlIGxldmVsYCk7CmNvbnN0IGNhdCA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlcy5maW5kKChyKSA9PiByLm5hbWUgPT09ICJTY3Jhd255IGNhdCIpOwpjdHgubG9nKGBmb3VuZCBhdCBkZXB0aCAke1N0cmluZyhjYXQ/LmxldmVsKX1gKTsKYGBgCgpBZnRlcjoKCmBgYHRzCmNvbnN0IHBsYXllciA9IGF3YWl0IG1vZC52aWV3LnBsYXllcigpOwppZiAocGxheWVyLm9rKSBtb2QubWV0YS5sb2coYEhQICR7cGxheWVyLnZhbHVlLmhwfS8ke3BsYXllci52YWx1ZS5tYXhIcH1gKTsKY29uc3QgbW9uc3RlcnMgPSBhd2FpdCBtb2Qudmlldy5tb25zdGVycygpOwppZiAobW9uc3RlcnMub2spIHsKICBjb25zdCB3b3VuZGVkID0gbW9uc3RlcnMudmFsdWUuZmlsdGVyKChtKSA9PiBtLmhlYWx0aCAhPT0gInVuaHVydCIpOwogIG1vZC5tZXRhLmxvZyhgJHt3b3VuZGVkLmxlbmd0aH0gd291bmRlZCBtb25zdGVycyBpbiB2aWV3YCk7Cn0KY29uc3QgY2F0ID0gYXdhaXQgbW9kLmNvbnRlbnQubG9va3VwKHsgZmlsZTogIm1vbnN0ZXIiLCBrZXk6ICJzY3Jhd255LWNhdCIgfSk7CmlmIChjYXQub2spIG1vZC5tZXRhLmxvZyhgZm91bmQgYXQgZGVwdGggJHtTdHJpbmcoY2F0LnZhbHVlWyJkZXB0aCJdKX1gKTsKYGBgCgpgY29udGVudC5yZWNvcmRzKGZpbGUpYCByZXR1cm5zIHRoZSByZWNvcmRzIHRoZSBydW5uaW5nIGdhbWUgd2FzIGNvbXBvc2VkIGZyb20sIG1vZCByZWNvcmRzIGluY2x1ZGVkLCBhcyBKU09OLiBUaGUgZmllbGQgbmFtZXMgYXJlIHRoZSBKU09OIG5hbWVzIChgZGVwdGhgLCBgaGl0LXBvaW50c2ApLCBub3QgdGhlIG5hbWVzIG9uIHRoZSBib3VuZCBvYmplY3RzIGluIGBjdHgucmVnaXN0cmllc2AgKGBsZXZlbGAsIGBhdmdIcGAgYW5kIHNvIG9uKS4gYGNvbnRlbnQubG9va3VwYCBmaW5kcyBhIHJlY29yZCBieSB0aGUga2V5IHRoZSBTREsncyBgcmVjb3JkS2V5YCBkZXJpdmVzLCB3aGljaCBmb3IgYSBuYW1lZCByZWNvcmQgaXMgYSBzbHVnIG9mIHRoZSBuYW1lIChgU2NyYXdueSBjYXRgIGJlY29tZXMgYHNjcmF3bnktY2F0YCkuIEFuIHVua25vd24gZmlsZSBhbnN3ZXJzIGByZWZ1c2VkYCB3aXRoIGB1bmtub3duLWZpbGVgLCBhbmQgYW4gdW5rbm93biBrZXkgYHJlZnVzZWRgIHdpdGggYHVua25vd24tcmVjb3JkYC4KCmBjdHguY29yZWAgaGFzIG5vIEFQSSAyIGNvdW50ZXJwYXJ0LiBFbmdpbmUgZnVuY3Rpb25zIGFyZSBub3QgcmVhY2hhYmxlLCBhbmQgY29uc3RhbnRzIHN1Y2ggYXMgYGN0eC5jb3JlLlRWYCBhcmUgbm90IGhhbmRlZCBvdmVyOiBgS25vd25JdGVtLnR2YWxgIGlzIGEgcGxhaW4gbnVtYmVyLCBzbyBhIG1vZCB0aGF0IGNvbXBhcmVkIGFnYWluc3QgYFRWLlNXT1JEYCBrZWVwcyB0aGF0IG51bWJlciBpdHNlbGYuCgojIyBTdGVwIDY6IG1vdmUgYWN0aW9ucyB0byBgYWN0YAoKYGN0eC5pbnRlbnQuc3VibWl0KHRva2VuLCBpbnRlbnQpYCBiZWNvbWVzIGBhY3Quc3VibWl0KHRva2VuLCBpbnRlbnQpYCAocGVybWlzc2lvbiBgaW5wdXQ6aW50ZW50YCksIGFuZCBgY3R4LnByb21wdC5yZXBseShpZCwgYW5zd2VyKWAgYmVjb21lcyBgYWN0LmFuc3dlcihwcm9tcHRJZCwgYW5zd2VyKWAgKHBlcm1pc3Npb24gYGlucHV0OnByb21wdC5yZXBseWApLiBUaGUgdG9rZW4gY29tZXMgZnJvbSBgdmlldy5pbnB1dCgpYCBvciBgdmlldy53b3JsZCgpYC4gV2hlbiB0aGUgZ2FtZSB0dXJucyB0aGUgaW50ZW50IGRvd24gKGEgc3RhbGUgdG9rZW4sIGZvciBvbmUpLCB0aGUgYW5zd2VyIGlzIGByZWZ1c2VkYCB3aXRoIHRoZSBnYW1lJ3MgY29kZSBhbmQgcmVhc29uLgoKQmVmb3JlOgoKYGBgdHMKY29uc3Qgc25hcCA9IGN0eC5zbmFwc2hvdD8uKCk7CmlmICghc25hcCB8fCAhY3R4LmludGVudCkgcmV0dXJuOwpjb25zdCByZXN1bHQgPSBjdHguaW50ZW50LnN1Ym1pdChzbmFwLnRva2VuLCB7IGtpbmQ6ICJzdG9wLXJlc3RpbmciIH0pOwppZiAoIXJlc3VsdC5hY2NlcHRlZCkgY3R4LmxvZyhyZXN1bHQucmVhc29uID8/ICJyZWZ1c2VkIik7CmBgYAoKQWZ0ZXI6CgpgYGB0cwpjb25zdCBpbnB1dCA9IGF3YWl0IG1vZC52aWV3LmlucHV0KCk7CmlmICghaW5wdXQub2spIHJldHVybjsKY29uc3QgZG9uZSA9IGF3YWl0IG1vZC5hY3Quc3VibWl0KGlucHV0LnZhbHVlLnRva2VuLCB7IGtpbmQ6ICJzdG9wLXJlc3RpbmciIH0pOwppZiAoIWRvbmUub2spIG1vZC5tZXRhLmxvZyhkb25lLm1lc3NhZ2UpOwpgYGAKCkFuIEFQSSAyIGRlZmluaXRpb24gdGFrZXMgdGhlIGtleWJvYXJkIHdpdGggaXRzIGBjb250cm9sbGVyKG1vZCwgaW5wdXQpYCBtZW1iZXIsIHdoaWNoIG5lZWRzIGBzdGF0ZTppbnRlcmFjdGlvbi5yZWFkYCwgYGlucHV0OmludGVudGAsIGFuZCBgaW5wdXQ6cHJvbXB0LnJlcGx5YCBpbiB0aGUgbWFuaWZlc3QuIGBhcm1lZChjb250ZXh0KWAgdGVsbHMgdGhlIGdhbWUgd2hldGhlciB0aGUgbW9kIGlzIHJlYWR5LiBgb25LZXlgIGhlYXJzIGVhY2gga2V5IHRoZSBwbGF5ZXIgcHJlc3NlcyB3aGlsZSB0aGUgbW9kIGhvbGRzIHRoZSBrZXlib2FyZCBhbmQgYW5zd2VycyBgeyBraW5kOiAia2VlcCIgfWAgb3IgYHsga2luZDogInJlbGVhc2UiIH1gLiBXaXRoIGBvbkRlYXRoOiAiZW5kImAsIGFuIG9yZGluYXJ5IGRlYXRoIGVuZHMgdGhlIHJ1biwgYW5kIHdpdGggdGhlIGRlZmF1bHQsIGAicmVpbmNhcm5hdGUiYCwgdGhlIG5leHQgY2hhcmFjdGVyIHN0YXJ0cy4gT25seSBvbmUgYXV0b3BsYXllciBob2xkcyB0aGUga2V5Ym9hcmQgYXQgYSB0aW1lLgoKYGFjdC5jb250cm9sbGVyYCBoYXMgYG93bnMoKWAsIGBzZXRTdGF0dXMoc3RhdHVzKWAsIGBtYXJrTm9uZGV0ZXJtaW5pc3RpYygpYCwgYW5kIGByZWxlYXNlKHJlYXNvbilgLiBFdmVyeSBjYWxsIGV4Y2VwdCBgb3ducygpYCBhbnN3ZXJzIGByZWZ1c2VkYCB3aXRoIGBub3Qtb3duZXJgIHVubGVzcyB0aGUgbW9kIGhvbGRzIHRoZSBrZXlib2FyZC4gQW4gYXV0b3BsYXllciBwbGFucyBmcm9tIHRoZSBrbm93bi13b3JsZCBgdmlld2AgYW5kIGFjdHMgdGhyb3VnaCBgYWN0YCwgYW5kIGNvbnNlbnQgdG8gYHRydXRoYCBkb2VzIG5vdCBsZXQgaGlkZGVuIGluZm9ybWF0aW9uIGludG8gaXRzIGRlY2lzaW9ucy4KCiMjIFN0ZXAgNzogbW92ZSBldmVudCBsaXN0ZW5lcnMKCkFQSSAxIGNhbGxzIGEgbGlzdGVuZXIgd2l0aCB0aGUgZXZlbnQgbmFtZSBmaXJzdCwgYW5kIGBjdHguZXZlbnRzLm9uYCB0aHJvd3Mgd2hlbiB0aGUgcGVybWlzc2lvbiBpcyBtaXNzaW5nLiBBUEkgMiBjYWxscyB0aGUgbGlzdGVuZXIgd2l0aCB0aGUgcGF5bG9hZCBvbmx5IGFuZCBhbnN3ZXJzIHdpdGggYSBzdWJzY3JpcHRpb24gdG8gcGFzcyB0byBgb2ZmYC4gRWFjaCBldmVudCBzdGlsbCBuZWVkcyBgZXZlbnQ6PG5hbWU+YC4KCkJlZm9yZToKCmBgYHRzCmN0eC5ldmVudHM/Lm9uKCJtZXNzYWdlIiwgKF90eXBlLCBkYXRhKSA9PiB7CiAgaWYgKGRhdGEubXNnPy5zdGFydHNXaXRoKCJZb3UgZmVlbCIpKSBjdHgubG9nKGRhdGEubXNnKTsKfSk7CmBgYAoKQWZ0ZXI6CgpgYGB0cwpjb25zdCBzdWIgPSBhd2FpdCBtb2QuZXZlbnRzLm9uKCJtZXNzYWdlIiwgKGV2ZW50KSA9PiB7CiAgaWYgKGV2ZW50LnRleHQuc3RhcnRzV2l0aCgiWW91IGZlZWwiKSkgbW9kLm1ldGEubG9nKGV2ZW50LnRleHQpOwp9KTsKaWYgKCFzdWIub2spIHJldHVybjsKLy8gbGF0ZXIKYXdhaXQgbW9kLmV2ZW50cy5vZmYoc3ViLnZhbHVlKTsKYGBgCgpUaGUgcGF5bG9hZHMgY2hhbmdlIGFzIHdlbGw6Cgp8IEV2ZW50IHwgQVBJIDEgcGF5bG9hZCB8IEFQSSAyIHBheWxvYWQgfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYG1lc3NhZ2VgIHwgYHsgbXNnLCB0eXBlIH1gLCB3aGVyZSBgbXNnYCBtYXkgYmUgbnVsbCB8IGB7IHRleHQsIHR5cGUgfWAgfAp8IGBjb21iYXQtb3V0Y29tZWAgfCBFdmVyeSBvdXRjb21lLCB3aXRoIGBzZWVuYCwgZXhhY3QgYGRhbWFnZWAsIGFuZCBtb25zdGVycyBieSBpbmRleCB8IE9ubHkgb3V0Y29tZXMgdGhlIHBsYXllciB0b29rIHBhcnQgaW4gb3Igc2F3LiBgcGxheWVyRGFtYWdlYCBvbmx5IHdoZW4gdGhlIHRhcmdldCBpcyB0aGUgcGxheWVyLiB8CnwgYGhlYWxgIHwgRXZlcnkgaGVhbCwgd2l0aCBgc2VlbmAgYW5kIGBhbW91bnRgIHwgT25seSBoZWFscyB0aGUgcGxheWVyIHNhdy4gYHBsYXllckFtb3VudGAgb25seSBmb3IgdGhlIHBsYXllci4gfAp8IGBtb3Rpb25gIHwgRXZlcnkgbW92ZSwgd2l0aCBgc2VlbmAgfCBPbmx5IG1vdmVzIHRoZSBwbGF5ZXIgc2F3LiB8CnwgYHBsYXllci1jb21tYW5kYCB8IGB7IGNvZGUsIGRpcj8sIGFyZ3M/LCByZXBlYXRzPywgcGhhc2UsIHRva2VuIH1gIHwgYHsgY29kZSwgZGlyPywgcGhhc2UsIHRva2VuIH1gIHwKfCBgZHVuZ2VvbmxldmVsYCwgYGRyaXZlci1jaGFuZ2VkYCB8IFVuY2hhbmdlZCB8IFVuY2hhbmdlZCB8CnwgYGhwYCwgYG1hbmFgLCBgZ29sZGAsIGBleHBlcmllbmNlYCwgYHBsYXllcmxldmVsYCwgYHN0YXR1c2AsIGBpbnZlbnRvcnlgLCBgZXF1aXBtZW50YCwgYG1vbnN0ZXJsaXN0YCwgYGl0ZW1saXN0YCwgYGVudGVyLXN0b3JlYCwgYGxlYXZlLXN0b3JlYCwgYGVudGVyLXdvcmxkYCwgYGxlYXZlLXdvcmxkYCB8IE5vdGhpbmcgfCBgbnVsbGAuIFJlYWQgYHZpZXdgIGZvciB0aGUgbmV3IHZhbHVlLiB8CgpJbiBBUEkgMiBhIG1vbnN0ZXIgYXBwZWFycyBhcyBgeyBtb25zdGVyOiBpZCB9YCB3aGlsZSB0aGUgcGxheWVyIHBlcmNlaXZlcyBpdCBhbmQgYXMgYCJ1bnNlZW4iYCBvdGhlcndpc2UsIGFuZCBhIG1vdmUgb3IgaGVhbCBieSBhbiB1bnNlZW4gbW9uc3RlciBpcyBub3QgZGVsaXZlcmVkLgoKVGhvc2UgMjEgZXZlbnRzIGFyZSBhbGwgQVBJIDIgZGVsaXZlcnMuIGBldmVudHMub25gIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYHVua25vd24tZXZlbnRgIGZvciBhbnkgb3RoZXIgbmFtZSwgaW5jbHVkaW5nIGBtYXBgLCBgc3RhdHNgLCBgYWNgLCBgbGlnaHRgLCBgZmVlbGluZ2AsIGBwbGF5ZXJtb3ZlZGAsIGBib2x0YCwgYG1pc3NpbGVgLCBgZXhwbG9zaW9uYCwgYHNvdW5kYCwgYGJlbGxgLCBgZW50ZXItZGVhdGhgLCBgbGVhdmUtZGVhdGhgLCBgZW50ZXItYmlydGhgIGFuZCB0aGUgbGV2ZWwtZ2VuZXJhdGlvbiBldmVudHMgKGBnZW4tbGV2ZWwtc3RhcnRgIGFuZCB0aGUgcmVzdCkuIFRoZSBTREsgc3RhdGVzIHRoZSByZWFzb24gZm9yIHRoZSBnZW5lcmF0aW9uIGV2ZW50cyBhbmQgZm9yIGJvbHRzIGFuZCBtaXNzaWxlczogdGhleSBzaG93IHRoaW5ncyB0aGUgcGxheWVyIGRpZCBub3Qgc2VlLCBzdWNoIGFzIGhvdyBhIGxldmVsIHdhcyBidWlsdCBvciB0aGUgcGF0aCBvZiBhIGJvbHQgb3V0IG9mIHZpZXcuCgojIyBTdGVwIDg6IG1vdmUgaG9va3MKCkFuIEFQSSAyIG1vZCByZXR1cm5zIGl0cyBob29rcyBmcm9tIGBob29rcyh7IGlkLCBmbGFncyB9KWAsIHdoaWNoIGlzIGFza2VkIG9uY2Ugd2hlbiBjb250ZW50IGNvbXBvc2VzLiBFYWNoIGhvb2sgZ2V0cyBwbGFpbiwgZnJvemVuIGRhdGEgYW5kIHJldHVybnMgcGxhaW4gZGF0YSwgYW5kIHRoZSBob3N0IGNvbXBvc2VzIGl0IHdpdGggZXZlcnkgb3RoZXIgbW9kJ3MgaG9va3MgaW4gbG9hZCBvcmRlciwgYXMgaXQgZG9lcyBmb3IgQVBJIDEuIEhvb2tzIGFyZSBzeW5jaHJvbm91cyBhbmQgdGhlIEFQSSBpcyBhc3luY2hyb25vdXMsIHNvIGEgaG9vayBjYW5ub3QgY2FsbCBgdmlld2AuIEtlZXAgd2hhdCBhIGhvb2sgbmVlZHMgaW4geW91ciBtb2R1bGUgYW5kIHVwZGF0ZSBpdCBmcm9tIGBzdGFydGAgb3IgZnJvbSBldmVudHMuCgpgYGB0cwpsZXQgbG9nOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkID0gKCkgPT4ge307CgpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIGhvb2tzOiAoKSA9PiAoewogICAgbW9uc3RlckJlY2FtZVZpc2libGU6IChtb25zdGVyKSA9PiBsb2coYCR7bW9uc3Rlci5yYWNlfSAoJHttb25zdGVyLmxvb2t9KSBjb21lcyBpbnRvIHZpZXdgKSwKICAgIGFydGlmYWN0SWRlbnRpZmllZDogKGZvdW5kKSA9PiBsb2coYGlkZW50aWZpZWQgJHtmb3VuZC5uYW1lfWApLAogICAgb2JqZWN0TGlzdFRpZWJyZWFrOiAoYSwgYikgPT4gYS5keSAtIGIuZHkgfHwgYS5keCAtIGIuZHgsCiAgICBoaXN0b3J5QWRkOiAoZW50cnkpID0+ICh7IGtlZXA6ICFlbnRyeS5kdXBsaWNhdGUgfSksCiAgfSksCiAgc3RhcnQobW9kKSB7CiAgICBsb2cgPSAobWVzc2FnZSkgPT4gbW9kLm1ldGEubG9nKG1lc3NhZ2UpOwogIH0sCn0gc2F0aXNmaWVzIEFwaTJNb2REZWZpbml0aW9uOwpgYGAKCmBtb25zdGVyQmVjYW1lVmlzaWJsZWAgcmVjZWl2ZXMgYSBgS25vd25Nb25zdGVyYDogcmFjZSwgZ3JpZCwgaGVhbHRoIGJhbmQsIGxvb2sgc3RhdHVzZXMsIGFuZCB0aGUgZmxhZ3MgYW5kIHNwZWxscyB0aGUgcGxheWVyIGhhcyBsZWFybmVkLCB3aXRoIG5vIGhpdCBwb2ludHMuIGBhcnRpZmFjdElkZW50aWZpZWRgIHJlY2VpdmVzIGB7IG5hbWUsIGFydGlmYWN0SW5kZXggfWAuIEFQSSAxIGhvb2tzIG9uIHRoaXMgYnVpbGQgcmVjZWl2ZSB0aGUgc2FtZSB2YWx1ZXMuIEJvdGggaG9va3MgdXNlZCB0byBoYW5kIG92ZXIgdGhlIGxpdmUgYE1vbnN0ZXJgLCBhbmQgdGhlIGxpdmUgb2JqZWN0IHdpdGggaXRzIGBBcnRpZmFjdGAsIHNvIEFQSSAxIGNvZGUgdGhhdCByZWFkIG90aGVyIGZpZWxkcyBvZmYgdGhlbSBuZWVkcyBjaGFuZ2luZyBlaXRoZXIgd2F5LgoKYGhpc3RvcnlBZGRgIHJldHVybnMgYSBkZWNpc2lvbiwgYHsga2VlcCwgd2hhdD8sIGV4cGFuZFVzZXJJbnB1dD8gfWAsIGluIHBsYWNlIG9mIGNoYW5naW5nIHRoZSBlbnRyeSBpdCB3YXMgZ2l2ZW4gYW5kIHJldHVybmluZyBhIGJvb2xlYW4uIEFuIGVudHJ5IGlzIHdyaXR0ZW4gb25seSBpZiBldmVyeSBtb2Qga2VlcHMgaXQuIGBvYmplY3RMaXN0VGllYnJlYWtgIGtlZXBzIGl0cyBgeyBkeSwgZHggfWAgYXJndW1lbnRzLCBidXQgYGN0eC5jb3JlLm9iamVjdExpc3RTdGFuZGFyZENvbXBhcmVgIGhhcyBubyBBUEkgMiBmb3JtLCBzbyB0aGUgY29tcGFyaXNvbiBpcyB3cml0dGVuIGluIHRoZSBtb2QuIFRoZSBvdGhlciBob29rcyB3aXRoIGFuIEFQSSAyIGZvcm0ga2VlcCB0aGVpciBBUEkgMSBhcmd1bWVudHMgYXMgcGxhaW4gZGF0YTogYG1lc3NhZ2VUZXh0YCwgYHNjcmVlblRleHRgLCBgY2hhcmFjdGVyQmFja2dyb3VuZGAsIGBvYmplY3RJbmZvVGV4dGAsIGBlZmZlY3RJbnRyb2AsIGBoaXN0b3J5RGlzcGxheWAsIGBzYXZlTm9pc2VTY2VudGAsIGBzaGFwZUxlYXJuT2J2aW91c0ZsYWdzRGlyZWN0bHlgLCBgb3B0aW9uc0NoYW5nZWRgIGFuZCBgYWJpbGl0eUdhaW5lZGAuIGBtb2QuaG9va3MuYXZhaWxhYmxlYCBsaXN0cyB0aGUgaG9va3MgdGhpcyBnYW1lIHJ1bnMsIGFuZCBgbW9kLmhvb2tzLmFjdGl2ZWAgdGhlIG9uZXMgdGhlIG1vZCBkZWNsYXJlZC4KClRoZXNlIGhvb2tzIGhhdmUgbm8gQVBJIDIgZm9ybToKCnwgSG9vayB8IFdoeSB8IE1lYW53aGlsZSB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgbGV2ZWxSZXZpc2l0ZWRgIHwgSXQgcGFzc2VzIHRoZSByZXN0b3JlZCBsZXZlbCBpdHNlbGYuIHwgVGhlIGBsZXZlbFJldmlzaXRUcmFja2luZ2AgcG9saWN5IHRhYmxlIGZvciBub2lzZSBhbmQgc2NlbnQgdHJhY2tpbmcsIG9yIGtlZXAgdGhlIG1vZCBvbiBBUEkgMS4gfAp8IGBuZXdDaGFyYWN0ZXJgLCBgd2Fsa0Jsb2NrZWRCeURpZ2dhYmxlYCwgYGxldmVsR2VuZXJhdGVkYCwgYHBhcnRpYWxTdGFja01lcmdlYCwgYHBhY2tPdmVyZmxvd1ZpY3RpbWAgfCBUaGV5IHBhc3MgbGl2ZSBnYW1lIG9iamVjdHMgb3IgdGhlIHdob2xlIGdhbWUgc3RhdGUuIHwgYGVuZ2luZUhvb2tzKGNvbnRleHQpYCBpbiBhbiBpbi1wcm9jZXNzIG1vZCB3aXRoIHRoZSBgZW5naW5lYCBkb21haW4sIG9yIGtlZXAgdGhlIG1vZCBvbiBBUEkgMS4gRm9yIHRoZSBtb2QncyBvd24gc2V0dXAgYXQgdGhlIHN0YXJ0IG9mIGEgbGlmZSwgYG1ldGEubmV3Q2hhcmFjdGVyYCB0ZWxscyBgc3RhcnRgIHdoZXRoZXIgdGhlIGNoYXJhY3RlciB3YXMganVzdCBjcmVhdGVkLiBJdCBjYW5ub3QgY2hhbmdlIHRoZSBnYW1lIHN0YXRlIHRoZSB3YXkgYG5ld0NoYXJhY3RlcmAgY2FuLiB8CnwgYHByb2plY3Rpb25SYWRpdXNgIHwgSXQgcnVucyBmb3IgcHJvamVjdGlvbnMgdGhlIHBsYXllciBuZXZlciBzZWVzLiB8IFRoZSBgcHJvamVjdGlvblJhZGl1c0NsYW1wYCBwb2xpY3kgdGFibGUgZm9yIGEgY2xhbXAgYXQgdGhlIG1heGltdW0gcmFuZ2UsIG9yIGtlZXAgdGhlIG1vZCBvbiBBUEkgMS4gfAp8IGBhcnRpZmFjdENvbW1pdGAgfCBJdCBydW5zIHdoZW4gYW4gYXJ0aWZhY3QgaXMgZ2VuZXJhdGVkLCBiZWZvcmUgdGhlIHBsYXllciBoYXMgc2VlbiBpdC4gfCBgZW5naW5lSG9va3MoY29udGV4dClgIHdpdGggdGhlIGBlbmdpbmVgIGRvbWFpbiwgYGFydGlmYWN0SWRlbnRpZmllZGAgZm9yIHdoYXQgdGhlIHBsYXllciBsZWFybnMsIG9yIGtlZXAgdGhlIG1vZCBvbiBBUEkgMS4gfAoKIyMgU3RlcCA5OiBtb3ZlIHBhbmVscyBhbmQga2V5cwoKYGN0eC51aS5vcGVuUGFuZWxgIGhhbmRzIG92ZXIgYSBzaGFkb3cgcm9vdCB0byBmaWxsIHdpdGggSFRNTC4gQVBJIDIgaGFzIG5vIERPTTogYHVpLm1vdW50KHBhbmVsLCBvbkFjdGlvbilgIHRha2VzIGEgdHJlZSBvZiBgdGV4dGAsIGBidXR0b25gLCBgcm93YCBhbmQgYGNvbHVtbmAgbm9kZXMsIHRoZSBob3N0IGRyYXdzIGl0LCBhbmQgYG9uQWN0aW9uYCBoZWFycyB0aGUgYGFjdGlvbmAgb2YgZWFjaCBidXR0b24gdGhlIHBsYXllciB1c2VzLiBJdCBuZWVkcyB0aGUgYHVpOnBhbmVsLm1vdW50YCBwZXJtaXNzaW9uLgoKQmVmb3JlOgoKYGBgdHMKaWYgKCFjdHgudWkpIHJldHVybjsKY29uc3QgcGFuZWwgPSBjdHgudWkub3BlblBhbmVsKHsgaWQ6ICJub3RlcyIsIGxhYmVsOiAiTm90ZXMiIH0pOwpwYW5lbC5yb290LmlubmVySFRNTCA9IGA8cD5TYXZlZC48L3A+PGJ1dHRvbiBpZD0iY2xlYXIiPkNsZWFyPC9idXR0b24+YDsKcGFuZWwucm9vdC5nZXRFbGVtZW50QnlJZCgiY2xlYXIiKT8uYWRkRXZlbnRMaXN0ZW5lcigiY2xpY2siLCAoKSA9PiBjdHgucHJlZnMuc2V0KG51bGwpKTsKYGBgCgpBZnRlcjoKCmBgYHRzCmNvbnN0IHNob3duID0gYXdhaXQgbW9kLnVpLm1vdW50KAogIHsKICAgIGlkOiAibm90ZXMiLAogICAgdGl0bGU6ICJOb3RlcyIsCiAgICByb290OiB7CiAgICAgIHR5cGU6ICJjb2x1bW4iLAogICAgICBjaGlsZHJlbjogWwogICAgICAgIHsgdHlwZTogInRleHQiLCB0ZXh0OiAiU2F2ZWQuIiB9LAogICAgICAgIHsgdHlwZTogImJ1dHRvbiIsIGxhYmVsOiAiQ2xlYXIiLCBhY3Rpb246ICJjbGVhciIgfSwKICAgICAgXSwKICAgIH0sCiAgfSwKICAoYWN0aW9uKSA9PiB7CiAgICBpZiAoYWN0aW9uID09PSAiY2xlYXIiKSB2b2lkIG1vZC5zdG9yZS5wcmVmcy5zZXQobnVsbCk7CiAgfSwKKTsKaWYgKHNob3duLm9rKSBhd2FpdCBtb2QudWkucGF0Y2goc2hvd24udmFsdWUucGFuZWxJZCwgeyB2aXNpYmxlOiBmYWxzZSB9KTsKYGBgCgpBIHBhbmVsIGBpZGAgYW5kIGVhY2ggYnV0dG9uIGBhY3Rpb25gIGFyZSBsb3dlci1jYXNlIGxldHRlcnMsIGRpZ2l0cyBhbmQgaHlwaGVucywgc3RhcnRpbmcgd2l0aCBhIGxldHRlciwgdXAgdG8gNjQgY2hhcmFjdGVycy4gQSB0ZXh0IG9yIGxhYmVsIGhvbGRzIHVwIHRvIDQwOTYgY2hhcmFjdGVycywgYSByb3cgb3IgY29sdW1uIHVwIHRvIDMyIGNoaWxkcmVuLCBhbmQgdGhlIHRyZWUgbmVzdHMgdXAgdG8gMTYgbGV2ZWxzIGRlZXAuIFRoZSBob3N0IHBsYWNlcyB0aGUgcGFuZWwgYW5kIHN0eWxlcyBpdCwgYW5kIG1vdW50aW5nIGFuIGlkIHRoYXQgaXMgYWxyZWFkeSBtb3VudGVkIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYGJhZC1wYW5lbGAuIGB1aS5wYXRjaGAgY2hhbmdlcyB0aGUgdGl0bGUsIHJlcGxhY2VzIHRoZSB0cmVlIG9yIGhpZGVzIGFuZCBzaG93cyB0aGUgcGFuZWwuIFRpbGVkIHBhbmVsIGtpbmRzIChgY3R4LnVpLnJlZ2lzdGVyUGFuZWxLaW5kYCkgaGF2ZSBubyBBUEkgMiBmb3JtLgoKYGN0eC5rZXltYXBzYCBiZWNvbWVzIGB1aS5rZXlzYCwgd2l0aCBgYmluZCh0cmlnZ2VyLCBhY3Rpb24pYCwgYGxpc3QoKWAgYW5kIGByZW1vdmUodHJpZ2dlcilgIHVuZGVyIHRoZSBzYW1lIGBrZXltYXA6d3JpdGVgIHBlcm1pc3Npb24uIGBiaW5kYCBhbnN3ZXJzIGByZWZ1c2VkYCB3aXRoIGB0cmlnZ2VyLXRha2VuYCBmb3IgYSBrZXkgdGhhdCBpcyBub3QgZnJlZSBpbiB0aGUgY3VycmVudCBrZXlzZXQuIFRoZXJlIGlzIG5vIGByZWJpbmRgIG9yIGBpc0JpbmRhYmxlVHJpZ2dlcktleWA6IHJlbW92ZSB0aGUgYmluZGluZyBhbmQgYmluZCBhZ2Fpbi4KCiMjIFN0ZXAgMTA6IG1vdmUgc3RvcmFnZQoKYGN0eC5wcmVmc2AgYmVjb21lcyBgc3RvcmUucHJlZnNgIGFuZCBgY3R4LmNoYXJhY3RlclN0b3JlYCBiZWNvbWVzIGBzdG9yZS5jaGFyYWN0ZXJgLCBlYWNoIHdpdGggYGdldCgpYCBhbmQgYHNldCh2YWx1ZSlgLiBCb3RoIGhvbGQgSlNPTiwgYW5kIGBzZXQobnVsbClgIHJlbW92ZXMgdGhlIHZhbHVlLiBgc3RvcmUuY2hhcmFjdGVyYCBhbnN3ZXJzIGB1bmF2YWlsYWJsZWAgdW50aWwgYSBjaGFyYWN0ZXIgZXhpc3RzLgoKQSBtb2QgdGhhdCBjaGFuZ2VzIHRoZSBzaGFwZSBvZiBpdHMgc3RvcmVkIHByZWZlcmVuY2VzIGRlY2xhcmVzIGBwcmVmczogeyB2ZXJzaW9uLCBtaWdyYXRlKHZhbHVlLCBmcm9tVmVyc2lvbikgfWAuIFRoZSBob3N0IGtlZXBzIHRoZSB2ZXJzaW9uIGJlc2lkZSB0aGUgdmFsdWUsIGNhbGxzIGBtaWdyYXRlYCBvbiB0aGUgZmlyc3QgcmVhZCBvZiBhbiBvbGRlciB2YWx1ZSBhbmQgd3JpdGVzIHRoZSByZXN1bHQgYmFjay4gQSB2YWx1ZSBzdG9yZWQgd2l0aG91dCBhIHZlcnNpb24sIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5dGhpbmcgYW4gQVBJIDEgbW9kIHdyb3RlIHRocm91Z2ggYGN0eC5wcmVmc2AsIGFycml2ZXMgd2l0aCBgZnJvbVZlcnNpb25gIDAsIHNvIGEgcGxheWVyJ3MgQVBJIDEgcHJlZmVyZW5jZXMgY2Fycnkgb3Zlci4KCkNoYXJhY3RlciBkYXRhIGtlZXBzIHVzaW5nIGBzYXZlU2NoZW1hYCBpbiB0aGUgbWFuaWZlc3QgYW5kIGBtaWdyYXRlQmFnYCwgd2hpY2ggbm93IGdldHMgYSBjb3B5IG9mIHRoZSBkYXRhIGFuZCBubyBgY3R4YC4KCkJlZm9yZToKCmBgYHRzCmNvbnN0IGNvbG91ciA9IGN0eC5wcmVmcy5nZXQoKSBhcyBzdHJpbmcgfCBudWxsOwpjdHgucHJlZnMuc2V0KGNvbG91ciA/PyAicmVkIik7CmN0eC5jaGFyYWN0ZXJTdG9yZT8uc2V0KHsga2lsbHM6IDMgfSk7CmBgYAoKQWZ0ZXI6CgpgYGB0cwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIHByZWZzOiB7CiAgICB2ZXJzaW9uOiAxLAogICAgbWlncmF0ZTogKHZhbHVlLCBmcm9tVmVyc2lvbikgPT4gKGZyb21WZXJzaW9uID09PSAwID8geyBjb2xvdXI6IHZhbHVlIH0gOiB2YWx1ZSksCiAgfSwKICBtaWdyYXRlQmFnOiAoZGF0YSwgZnJvbVNjaGVtYSkgPT4gKGZyb21TY2hlbWEgPCAyID8geyBraWxsczogZGF0YSB9IDogZGF0YSksCiAgYXN5bmMgc3RhcnQobW9kKSB7CiAgICBjb25zdCBwcmVmcyA9IGF3YWl0IG1vZC5zdG9yZS5wcmVmcy5nZXQoKTsKICAgIGlmIChwcmVmcy5vayAmJiBwcmVmcy52YWx1ZSA9PT0gbnVsbCkgYXdhaXQgbW9kLnN0b3JlLnByZWZzLnNldCh7IGNvbG91cjogInJlZCIgfSk7CiAgICBhd2FpdCBtb2Quc3RvcmUuY2hhcmFjdGVyLnNldCh7IGtpbGxzOiAzIH0pOwogIH0sCn0gc2F0aXNmaWVzIEFwaTJNb2REZWZpbml0aW9uOwpgYGAKCiMjIFN0ZXAgMTE6IG1vdmUgbmV0d29yayByZXF1ZXN0cwoKYGN0eC5uZXRgIGJlY29tZXMgYG5ldGAsIHByZXNlbnQgd2hlbiB0aGUgbWFuaWZlc3QgbmFtZXMgYXQgbGVhc3Qgb25lIGhvc3Qgd2l0aCBgbmV0d29yazo8aG9zdD5gLCBgbmV0d29yazpsb2NhbGAgb3IgYG5ldHdvcms6KmAuIGBuZXQucmVxdWVzdCh7IHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5LCB0aW1lb3V0TXMgfSlgIGFuc3dlcnMgd2l0aCBgeyBzdGF0dXMsIGhlYWRlcnMsIGJvZHkgfWAgZm9yIGFueSBIVFRQIHN0YXR1cy4gQSBoZWFkZXIgdGhhdCBuZWVkcyBhIHNlY3JldCB0YWtlcyBgbW9kLm5ldC5jcmVkZW50aWFsKCJuYW1lIilgIGFzIGl0cyB2YWx1ZSwgYW5kIHRoZSBob3N0IGZpbGxzIGluIHRoZSB3aG9sZSBoZWFkZXIgdmFsdWUgZnJvbSB0aGUgY3JlZGVudGlhbCBvZiB0aGF0IG5hbWUuIGBuZXQuY3JlZGVudGlhbHNgIGhhcyBgc3RhdHVzYCwgYHNldGAsIGBmcm9tRW52aXJvbm1lbnRgIGFuZCBgcmVtb3ZlYCwgdGhlIGpvYnMgb2YgYGN0eC5uZXQuc2VjcmV0c2AuIEEgcmVxdWVzdCB0byBhIGhvc3QgdGhlIG1hbmlmZXN0IGRvZXMgbm90IG5hbWUgYW5zd2VycyBgbm90LWdyYW50ZWRgIHdpdGggYG5ldHdvcms6PGhvc3Q+YCwgYW5kIGFueSBvdGhlciBmYWlsdXJlIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYSBuZXQgcHJvYmxlbSBjb2RlLgoKYGBgdHMKaWYgKCFtb2QubmV0KSByZXR1cm47CmNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbW9kLm5ldC5yZXF1ZXN0KHsKICB1cmw6ICJodHRwczovL2V4YW1wbGUuY29tL3J1bnMiLAogIG1ldGhvZDogIlBPU1QiLAogIGhlYWRlcnM6IHsgImNvbnRlbnQtdHlwZSI6ICJhcHBsaWNhdGlvbi9qc29uIiwgIngtYXBpLWtleSI6IG1vZC5uZXQuY3JlZGVudGlhbCgiYXBpLWtleSIpIH0sCiAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBkZXB0aDogNSB9KSwKfSk7CmlmICghcmVzcG9uc2Uub2spIG1vZC5tZXRhLmxvZyhyZXNwb25zZS5tZXNzYWdlKTsKYGBgCgojIyBTdGVwIDEyOiB0aGUgcmVzdCBvZiB0aGUgY29udGV4dAoKfCBBUEkgMSB8IEFQSSAyIHwKfCAtLS0gfCAtLS0gfAp8IGBjdHguaWRgLCBgY3R4LmVuZ2luZWAsIGBjdHguZmxhZ3NgLCBgY3R4Lm5ld0NoYXJhY3RlcmAsIGBjdHgubG9nYCB8IGBtZXRhLmlkYCwgYG1ldGEuZW5naW5lYCwgYG1ldGEuZmxhZ3NgLCBgbWV0YS5uZXdDaGFyYWN0ZXJgLCBgbWV0YS5sb2dgIHwKfCBgY3R4LmFwaWAgKGFuIGludGVnZXIpIHwgYG1ldGEuYXBpYCwgYSB2ZXJzaW9uIHN0cmluZyBzdWNoIGFzIGAiMi4xLjAiYCB8CnwgYGN0eC5zZXR0aW5ncy5nZXRgLCBgY3R4LnNldHRpbmdzLmFsbGAsIGBjdHguc2V0dGluZ3Muc2V0YCB8IGBtZXRhLnNldHRpbmdzKClgLCBgbWV0YS5zZXRTZXR0aW5nKGlkLCB2YWx1ZSlgLiBBbiB1bmtub3duIGlkIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYHVua25vd24tc2V0dGluZ2AuIHwKfCBgY3R4Lm1vZHMoKWAgfCBgbWV0YS5tb2RzKClgIHwKfCBgY3R4Lm9wdGlvbnNgIHwgVGhlIGBvcHRpb25zQ2hhbmdlZGAgaG9vaywgYWZ0ZXIgdGhlIHBsYXllciBjaGFuZ2VzIGFuIG9wdGlvbiB8CnwgYGN0eC5wcm9maWxlc2AsIGBjdHguc2Vzc2lvbmAgfCBgbWFuYWdlLnByb2ZpbGVzYCwgYG1hbmFnZS5zZXNzaW9uYCwgZmlyc3QtcGFydHkgb25seSB8CgpCcmFuY2ggb24gYG1ldGEuYXBpYCwgbmV2ZXIgb24gdGhlIGdhbWUgdmVyc2lvbiwgYW5kIHJlYWQgYG1ldGEuZW5naW5lYCBvbmx5IGZvciBkaWFnbm9zdGljcy4gV2l0aCB0aGUgcGxheWVyJ3MgY29uc2VudCwgYW55IFdvcmtlciBtb2QsIGZpcnN0LXBhcnR5IG9yIHRoaXJkLXBhcnR5LCBjYW4gaG9sZCB0aGUgbWFuYWdlbWVudCBncmFudHMgKGBwcm9maWxlczptYW5hZ2VgLCBgc2Vzc2lvbjpjb250cm9sYCwgYG9wdGlvbnM6bWFuYWdlYCwgYHNhdmVzOm1hbmFnZWAsIGBzY3JlZW5zOm1hbmFnZWApLCB0aGUgdHJ1dGggcmVhZHMgKGBzdGF0ZTptYXAtYWN0dWFsLnJlYWRgLCBgc3RhdGU6bW9uc3RlcnMtYWN0dWFsLnJlYWRgKSwgYW5kIHRoZSBvdGhlciBicm9rZXJlZCBncmFudHMuIEEgdHJ1dGggcmVhZCBtYXJrcyB0aGUgY2hhcmFjdGVyIHVuc2NvcmFibGUgYmVmb3JlIGl0IHJldHVybnMgYW55IGRhdGEuIEEgbW9kIHdpdGhvdXQgdGhlc2UgZ3JhbnRzIGhhcyBubyBgbW9kLm1hbmFnZWAgb3IgYG1vZC50cnV0aGAgYXQgYWxsLCBzbyBjaGVjayB0aGF0IGVhY2ggb25lIGV4aXN0cyBiZWZvcmUgeW91IGNhbGwgaXQ6CgojIyBSdW50aW1lIHRpZXJzCgpBbiBpbi1wcm9jZXNzIG1vZCBydW5zIGluIHRoZSBnYW1lJ3Mgb3duIHBhZ2UuIEFQSSAyIGJ1aWx0IHRocm91Z2ggdGhlIGluLXByb2Nlc3MgaG9zdCBnb2VzIHRocm91Z2ggdGhlIHNhbWUgcGVybWlzc2lvbnMgYW5kIGZhY2FkZXMgYXMgQVBJIDEgYW5kIGhhbmRzIHRoZSBtb2QgY29waWVzIG9mIGRhdGEsIGJ1dCBpdCBkb2VzIG5vdCBpc29sYXRlIHRoZSBjb2RlOiB0aGUgbW9kdWxlIHN0aWxsIHJ1bnMgaW4gdGhlIHBhZ2Ugd2l0aCB0aGUgcGFnZSdzIG93biBhY2Nlc3MsIGFzIGFuIEFQSSAxIHBsdWdpbiBkb2VzIChbUExVR0lOUy5tZF0oUExVR0lOUy5tZCkpLgoKQSBXb3JrZXIgbW9kIHJ1bnMgaW4gYW4gb3BhcXVlLW9yaWdpbiBXb3JrZXIgaW5zaWRlIGEgc2FuZGJveGVkIGZyYW1lLCBhbmQgdGFsa3MgdG8gdGhlIGdhbWUgb25seSB0aHJvdWdoIGEgbWVzc2FnZSBwb3J0IChbV09SS0VSX0lTT0xBVElPTi5tZF0oV09SS0VSX0lTT0xBVElPTi5tZCkpLiBJdHMgbWFuaWZlc3QgZGVjbGFyZXMgYCJydW50aW1lIjogIndvcmtlciJgLCBhbiBgYXBpYCByYW5nZSBzdWNoIGFzIGA+PTIuMC4wIDwzLjAuMGAgYW5kIHRoZSBtb2R1bGUgdG8gc3RhcnQgaW4gYGVudHJ5YCwgYW5kIHRoZSBtb2R1bGUgZGVmYXVsdC1leHBvcnRzIHRoZSBzYW1lIGRlZmluaXRpb24gYW4gaW4tcHJvY2VzcyBBUEkgMiBtb2QgZG9lcy4gRWFjaCBjYWxsIGJlY29tZXMgYSBtZXNzYWdlIHRvIHRoZSBnYW1lJ3MgYnJva2VyLCB3aGljaCBhbnN3ZXJzIGl0IHdpdGggdGhlIGluLXByb2Nlc3MgaG9zdCB1bmRlciB0aGUgcGVybWlzc2lvbnMgdGhlIHBsYXllciBncmFudGVkLgoKVGhlIG9sZGVyIFdvcmtlciBpbnRlcmZhY2UsIGRlY2xhcmVkIGluIHNjaGVtYSAxIGFzIGAibW9kQXBpIjogMmAgd2l0aCBhIGB3b3JrZXJFbnRyeWAsIGlzIHJldGlyZWQuIEl0cyBtYW5pZmVzdCBzdGlsbCByZWFkcyAodGhlIGNvbnZlcnRlciBhYm92ZSBnaXZlcyBpdCBgImFwaSI6ICIyLjAuMC13b3JrZXIiYCwgYSBwcmVyZWxlYXNlIG5vIHN0YWJsZSByYW5nZSBhZG1pdHMpLCBidXQgdGhlIGxvYWRlciB3aWxsIG5vdCBydW4gaXRzIGNvZGU6IHRoZSBNb2RzIHNjcmVlbiBhc2tzIGZvciBpdCB0byBiZSByZWJ1aWx0IGFzIGFuIEFQSSAyIFdvcmtlciBtb2QuIFRvIHJlYnVpbGQgb25lLCB3cml0ZSBpdCBhcyBhIGRlZmluaXRpb24gd2l0aCBgaG9va3NgLCBgc3RhcnRgIGFuZCB0aGUgZG9tYWlucyBpdCBuZWVkcywgcmVuYW1lIGl0cyBwZXJtaXNzaW9ucyBhcyBbQVBJMi5tZF0oQVBJMi5tZCkgKCJJbiBhIFdvcmtlciIpIGxpc3RzLCBhbmQgc2V0IGBhcGlgIHRvIGA+PTIuMC4wIDwzLjAuMGAuCgpNb3ZpbmcgYSBtb2QgaW50byBhIFdvcmtlciBjb3N0cyBpdCB0aGVzZSB0aGluZ3M6CgotIFRoZSBET00uIEEgV29ya2VyIGhhcyBubyBkb2N1bWVudCwgc28gZHJhd2luZyBnb2VzIHRocm91Z2ggaG9zdC1kcmF3biBwYW5lbHMgKGB1aS5tb3VudGApLgotIFRoZSBuZXR3b3JrLiBUaGUgcGFnZSdzIHBvbGljeSByZWZ1c2VzIGV2ZXJ5IGNvbm5lY3Rpb24gYW5kIHRoZSBXb3JrZXIncyBuZXR3b3JrIGdsb2JhbHMgYXJlIGRlbGV0ZWQgYmVmb3JlIHRoZSBtb2QgbG9hZHMuIEEgbW9kIHRoYXQgbmFtZXMgYSBob3N0IHJlYWNoZXMgaXQgdGhyb3VnaCBgbmV0YCwgd2hpY2ggdGhlIGdhbWUgcGVyZm9ybXMgZm9yIGl0OyBgbmV0LmNyZWRlbnRpYWxgIGhhbmRzIHRoZSBXb3JrZXIgYSByZWZlcmVuY2UsIG5ldmVyIHRoZSBzZWNyZXQuCi0gVGhlIGdhbWUncyBzdG9yYWdlLiBUaGUgb3BhcXVlIG9yaWdpbiBnaXZlcyB0aGUgV29ya2VyIG5vbmUgb2YgdGhlIGdhbWUncyBJbmRleGVkREIsIENhY2hlIFN0b3JhZ2Ugb3IgZmlsZXMuIFByZWZlcmVuY2VzIGFuZCB0aGUgY2hhcmFjdGVyJ3MgYmFnIGdvIHRocm91Z2ggYHN0b3JlYCwgYW5kIGEgbW9kJ3Mgb3duIGZpbGVzIHRocm91Z2ggYGNvbnRlbnQuYXNzZXRgLgotIEltcG9ydHMgYnkgcGFja2FnZSBuYW1lLiBBIFdvcmtlciBtb2QgaW1wb3J0cyBvbmx5IGl0cyBvd24gZmlsZXMgYnkgcmVsYXRpdmUgcGF0aCwgd2l0aCBubyBpbXBvcnQgY3ljbGVzLCBhdCBtb3N0IDI1NiBzY3JpcHQgZmlsZXMgYW5kIDE2LDc3NywyMTYgY2hhcmFjdGVycyBvZiBzb3VyY2UuIEJ1bmRsZSBhIHBhY2thZ2UgaW4uCi0gYGltcG9ydC5tZXRhLnVybGAgYW5kIGNvbXB1dGVkIGR5bmFtaWMgaW1wb3J0cyBvZiB0aGUgbW9kJ3Mgb3duIGZpbGVzLCBiZWNhdXNlIGVhY2ggbW9kdWxlIGlzIGEgYGRhdGE6YCBVUkwuIFJlYWQgZmlsZXMgdGhyb3VnaCBgY29udGVudC5hc3NldGAuCi0gYGV2YWxgLCBuZXN0ZWQgV29ya2VycyBhbmQgYEJyb2FkY2FzdENoYW5uZWxgLgotIExpdmUgb2JqZWN0cyBvZiBhbnkga2luZC4gRXZlcnl0aGluZyBjcm9zc2VzIHRoZSBwb3J0IGFzIHN0cnVjdHVyZWQtY2xvbmUgZGF0YSwgYW5kIGV2ZXJ5IGNhbGwgcmV0dXJucyBhIHByb21pc2UuCi0gSG9va3MgdGhhdCBhbnN3ZXIgaW5zaWRlIGEgdHVybi4gQSB0dXJuIGNhbm5vdCB3YWl0IGZvciBhIG1lc3NhZ2UsIHNvIGEgV29ya2VyIGRlY2xhcmVzIHRob3NlIGFuc3dlcnMgYXMgYHBvbGljaWVzYCB0YWJsZXMsIGFuZCBgaG9va3MoY29udGV4dClgIG1heSBuYW1lIG9ubHkgYG9wdGlvbnNDaGFuZ2VkYCwgYGFiaWxpdHlHYWluZWRgLCBgbW9uc3RlckJlY2FtZVZpc2libGVgIGFuZCBgYXJ0aWZhY3RJZGVudGlmaWVkYC4gQW55IG90aGVyIGhvb2sgZnVuY3Rpb24gaXMgbm90IGluc3RhbGxlZCBhbmQgaXMgcmVwb3J0ZWQgb24gdGhlIE1vZHMgc2NyZWVuLgotIGBtYW5hZ2VgIGFuZCBgdHJ1dGhgLCBhbmQgYSB3aWxkY2FyZCBncmFudDogYSBgIioiYCBwZXJtaXNzaW9uIGdyYW50cyBhIFdvcmtlciBub3RoaW5nLgoKQSBtZXNzYWdlIG92ZXIgNjQgS0IgaXMgcmVmdXNlZCwgYW5kIGEgV29ya2VyIHRoYXQgYW5zd2VycyBubyBwaW5nIGZvciA1IHNlY29uZHMgaXMgc3dpdGNoZWQgb2ZmIGZvciB0aGUgc2Vzc2lvbi4gW0FQSTIubWRdKEFQSTIubWQpIGhhcyB0aGUgbGltaXRzIGFuZCB3aGF0IGhhcHBlbnMgdG8gYSBtaWdyYXRpb24gdGhhdCB0YWtlcyBvdmVyIDMgc2Vjb25kcy4KCiMjIENoZWNrbGlzdAoKMS4gRmluZCBlYWNoIHBhcnQgb2YgdGhlIG9sZCBjb250ZXh0IGluIFN0ZXAgMSdzIHRhYmxlLiBBIG1vZCB0aGF0IG5lZWRzIG9ubHkgZmlyc3QtcGFydHkgcm93cyBzdGF5cyBvbiBBUEkgMS4KMi4gQ29udmVydCB0aGUgbWFuaWZlc3Qgd2l0aCBgY29udmVydE1hbmlmZXN0VjFgIGFuZCBmaXggdGhlIGBlbmdpbmVgIHJlYXNvbiBpdCB3cml0ZXMuCjMuIFNldCBgYXBpYCB0byBgPj0yLjAuMCA8My4wLjBgIGluIHRoZSBtYW5pZmVzdCBhbmQgaW4gdGhlIGRlZmluaXRpb24sIGFuZCBkZWZhdWx0LWV4cG9ydCB0aGUgZGVmaW5pdGlvbiB3aXRoIGBzYXRpc2ZpZXMgQXBpMk1vZERlZmluaXRpb25gLgo0LiBSZW5hbWUgYHJlZ2lzdGVyYCB0byBgc3RhcnRgIGFuZCBgdW5pbnN0YWxsYCB0byBgc3RvcGAsIGRyb3AgYGN0eGAgZnJvbSBgbWlncmF0ZUJhZ2AsIGFuZCBnaXZlIGBob29rc2Agb25seSBgeyBpZCwgZmxhZ3MgfWAuCjUuIENoZWNrIGBva2Agb24gZXZlcnkgY2FsbCByZXN1bHQsIGFuZCBoYW5kbGUgYG5vdC1ncmFudGVkYCBieSBzd2l0Y2hpbmcgb2ZmIHRoZSBmZWF0dXJlIHRoYXQgbmVlZHMgaXQuCjYuIFJlcGxhY2UgYGN0eC5zdGF0ZWAsIGBjdHguY29yZWAgYW5kIGBjdHgucmVnaXN0cmllc2AgcmVhZHMgd2l0aCBgdmlld2AgYW5kIGBjb250ZW50YCwgYW5kIGV4cGVjdCBvbmx5IHdoYXQgdGhlIHBsYXllciBrbm93cy4KNy4gTW92ZSBsaXN0ZW5lcnMgdG8gYGV2ZW50cy5vbmAsIHJlYWQgdGhlIHBheWxvYWQgYWxvbmUsIGFuZCBkcm9wIGV2ZW50cyBBUEkgMiBkb2VzIG5vdCBkZWxpdmVyLgo4LiBVcGRhdGUgYG1vbnN0ZXJCZWNhbWVWaXNpYmxlYCwgYGFydGlmYWN0SWRlbnRpZmllZGAgYW5kIGBoaXN0b3J5QWRkYCB0byB0aGVpciBuZXcgYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzLgo5LiBSZWJ1aWxkIHBhbmVscyBhcyBgdWkubW91bnRgIHRyZWVzIGFuZCBrZXltYXBzIGFzIGB1aS5rZXlzYC4KMTAuIERlY2xhcmUgYHByZWZzYCB3aXRoIGEgbWlncmF0aW9uIHRoYXQgcmVhZHMgdmVyc2lvbiAwLCBzbyBleGlzdGluZyBwcmVmZXJlbmNlcyBjYXJyeSBvdmVyLgo="
  },
  {
    "id": "compatibility",
    "path": "MOD_COMPATIBILITY.md",
    "audience": "advanced",
    "title": "Compatibility",
    "note": "What an engine release can change and how a mod stays loadable.",
    "source": "sdk",
    "encoded": "IyBXaGF0IGFuIGVuZ2luZSByZWxlYXNlIG1heSBicmVhaywgYW5kIHdoYXQgaXQgbWF5IG5vdAoKSWYgeW91IHB1Ymxpc2ggbW9kcywgeW91IHdhbnQgdG8ga25vdyB3aGljaCBvZiB0aGVtIHN0b3Agd29ya2luZyB3aGVuIHRoZSBnYW1lIHVwZGF0ZXMsIGFuZCB3aGF0IHlvdSBoYXZlIHRvIGRvIGFib3V0IGl0LgoKPiBBIG1vZCB0aGF0IGlzIHB1cmUgZGF0YSBzaG91bGQgc3Vydml2ZSBlbmdpbmUgcmVsZWFzZXMgd2l0aG91dCBiZWluZyByZXB1Ymxpc2hlZC4gQSBtb2QgdGhhdCBzaGlwcyBjb2RlIHNob3VsZCBzdXJ2aXZlIHBhdGNoIGFuZCBtaW5vciByZWxlYXNlcywgYW5kIGdldCBhIHJlbGVhc2UncyB3YXJuaW5nIGJlZm9yZSBhbiBBQkkgY2hhbmdlIHN0cmFuZHMgaXQuIFRoYXQgQUJJIGluY2x1ZGVzIGEgbmFtZWQgc3Vic2V0IG9mIGBjdHguY29yZWA7IHRoZSByZXN0IG9mIHRoYXQgbmFtZXNwYWNlIGlzIGFuIGVzY2FwZSBoYXRjaC4KClRoZXNlIHJ1bGVzIGRhdGUgZnJvbSAyMDI2LTA4LTAyLiBCZWZvcmUgdGhlbiwgdGhyZWUgb2YgdGhlIGZvdXIgZ2F0ZXMgYmVsb3cgd2VyZSBzdHJpY3RlciB0aGFuIHRoZXkgbmVlZGVkIHRvIGJlLCBhbmQgdGhlIGZvdXJ0aCwgYGN0eC5jb3JlYCwgaGFkIG5vIGdhdGUgYXQgYWxsLgojIyBUaGUgZm91ciB0aGluZ3MgdGhhdCBjYW4gc3RyYW5kIGEgbW9kCgp8ICMgfCBHYXRlIHwgV2hhdCBpdCBqdWRnZXMgfCBPbiBmYWlsdXJlIHwKfC0tLXwtLS18LS0tfC0tLXwKfCAxIHwgYGVuZ2luZWAgfCBhIHNlbXZlciByYW5nZSBvdmVyIGBFTkdJTkVfVkVSU0lPTmAgfCAqKndhcm5zKiogZm9yIGRhdGEsICoqcmVmdXNlcyoqIGNvZGUgfAp8IDIgfCBgbW9kQXBpYCB8IHRoZSBwbHVnaW4gQUJJLCBhbiBpbnRlZ2VyIHwgcmVmdXNlcyBvdXRzaWRlIHRoZSBhY2NlcHRlZCB3aW5kb3cgfAp8IDMgfCBhIHBhdGNoIHRhcmdldCB8IG9uZSBgcGF0Y2hlc2AgLyBgZmllbGRQYXRjaGVzYCAvIGByZW1vdmVzYCByZWYgfCAqKnNraXBzIHRoYXQgb3AqKiwga2VlcHMgdGhlIG1vZCB8CnwgNCB8IGBjdHguY29yZWAgfCBhIGd1YXJhbnRlZWQgbmFtZSBkaXNhcHBlYXJpbmc7IGFueSBvdGhlciBleHBvcnQgYSBwbHVnaW4gYWN0dWFsbHkgY2FsbHMgfCBub3RoaW5nIGhhcHBlbnMgYXQgbG9hZCB0aW1lLiBBIGd1YXJhbnRlZWQgbmFtZSBjYW4gb25seSBiZSByZW1vdmVkIGZyb20gdGhlIGVuZ2luZSB3aXRoIGFuIGFsaWFzIG9yIGEgdHdvLXJlbGVhc2UgQUJJIGJ1bXA7IHNlZSBiZWxvdy4gfAoKIyMjIDEuIGBlbmdpbmVgIGlzIGEgbGFiZWwgb24gZGF0YSBhbmQgYSBnYXRlIG9uIGNvZGUKCmBlbmdpbmVgIHJlY29yZHMgd2hpY2ggYnVpbGRzIHRoZSBhdXRob3IgdGVzdGVkLCBhbmQgZm9yIGEgZGF0YSBwYWNrIHRoZSBnYW1lIHRyZWF0cyBpdCBhcyBpbmZvcm1hdGlvbiBvbmx5LiBVbnRpbCAyMDI2LTA4LTAyIHRoZSBob3N0IHJlZnVzZWQgYW55IHBhY2sgb3V0c2lkZSBpdHMgcmFuZ2UsIHNvIGEgcGFjayBvZiBwdXJlIEpTT04gc3RvcHBlZCBsb2FkaW5nIG92ZXIgb25lIHN0cmluZyBpbiBpdHMgbWFuaWZlc3QuCgpUaGUgcmFuZ2Ugb25seSBibG9ja3MgYSBwYWNrIHRoYXQgc2hpcHMgY29kZS4gVGhlIGdhbWUgdGVsbHMgdGhlIHR3byBhcGFydCBieSBgbW9kQXBpYCwgd2hpY2ggdGhlIG1hbmlmZXN0IHJlcXVpcmVzIG9mIGV2ZXJ5IHBhY2sgd2l0aCBhIGBwbHVnaW4uanNgIGFuZCBvZiBubyBvdGhlci4gQ29kZSBpcyB3aGF0IGJyZWFrcyBhY3Jvc3MgYSByZWxlYXNlLCBiZWNhdXNlIGl0IGNhbGxzIGZ1bmN0aW9ucyBhbmQgYSByZW5hbWVkIGZ1bmN0aW9uIGlzIGEgY3Jhc2guIFRpbGUgcGFja3MgY291bnQgYXMgZGF0YTogYSBzdGFsZSBtYXBwaW5nIGxvc2VzIGluZGl2aWR1YWwgdGlsZXMgdG8gdGhlIEFTQ0lJIGZhbGxiYWNrLCB3aGljaCB0aGUgcGxheWVyIGNhbiBzZWUsIGFuZCB0aGF0IGlzIGJldHRlciB0aGFuIGEgd2hvbGUgdGlsZXNldCBmYWlsaW5nIHRvIGxvYWQuCgoqKldoYXQgdG8gd3JpdGUuKiogQSBtaW5pbXVtLCBub3QgYSBjYXJldDoKCmBgYGpzb24KImVuZ2luZSI6ICI+PTAuMTMuMCIKYGBgCgpPbiBhIGAwLnhgIHZlcnNpb24sIGBeMC4xMy4wYCBtZWFucyAwLjEzLnggb25seSwgc28gaXQgZXhjbHVkZXMgMC4xNC4wIGFuZCBlYXJucyB0aGUgbW9kIGEgd2FybmluZyBvbiBldmVyeSBtaW5vciByZWxlYXNlLiBVc2UgYSB0d28tc2lkZWQgcmFuZ2Ugb25seSB3aGVuIHRoZSBtb2QgaXMga25vd24gdG8gYnJlYWsgYWJvdmUgc29tZSB2ZXJzaW9uLiBBIGRhdGEgcGFjayBjYW4gbGVhdmUgdGhlIGZpZWxkIG91dCBlbnRpcmVseTsgdGhlIGNvcmUgY29udGVudCBwYWNrIGNvbWVzIGNsb3NlIHRvIHRoYXQgd2l0aCBgIj49MC4xLjAiYC4KCiMjIyMgQSByYW5nZSB0aGlzIGJ1aWxkIGZhaWxzIGlzIG5vIGxvbmdlciB0aGUgZW5kIG9mIHRoZSByb2FkCgpVbnRpbCAyMDI2LTA4LTIxLCBhIGNvZGUgcGFjayB3aG9zZSBuZXdlc3QgcmVsZWFzZSBkZWNsYXJlZCBhIHJhbmdlIG91dHNpZGUgdGhpcyBidWlsZCB3YXMgcmVmdXNlZCBvdXRyaWdodC4gVGhlIHJvdyByZWFkIGB3aWxsIG5vdCBydW4gb24gdGhpcyB2ZXJzaW9uYCwgZXZlbiB3aGVuIHRoZSBzYW1lIHJlcG9zaXRvcnkgaGVsZCBhbiBvbGRlciByZWxlYXNlIHRoYXQgd291bGQgcnVuLiBZb3UgY291bGQgaW5zdGFsbCB0aGF0IHJlbGVhc2UgYnkgcGFzdGluZyBhIGBnaXRodWIuY29tL293bmVyL3JlcG8vdHJlZS88dGFnPmAgVVJMIGludG8gKipBZGQgZnJvbSBhIHJlcG9zaXRvcnkgYWRkcmVzcyoqLCBidXQgdGhlIGdhbWUgbmV2ZXIgbG9va2VkIGZvciBpdCBvciBtZW50aW9uZWQgaXQuCgpEaXNjb3Zlcnkgbm93IHdhbGtzIGEgcmVwb3NpdG9yeSdzIHRhZ3MgbmV3ZXN0IGZpcnN0IGFuZCBvZmZlcnMgdGhlIG5ld2VzdCByZWxlYXNlIHRoaXMgYnVpbGQgd2lsbCBydW4uIFRoZSB3YWxrIGZvbGxvd3MgdGhlc2UgcnVsZXM6CgotICoqVGhlIGxvYWRlcidzIG93biBydWxlIGp1ZGdlcyBlYWNoIGNhbmRpZGF0ZSoqLCBzbyBhbnkgdmVyc2lvbiBhIHNjcmVlbiBvZmZlcnMgaXMgb25lIHRoZSBsb2FkZXIgYWNjZXB0cy4gVGhlIGluc3RhbGwgc2NyZWVuIGFuZCAqVXBkYXRlIGluc3RhbGxlZCBtb2RzKiBzaGFyZSB0aGUgc2FtZSB3YWxrLCBzbyB0aGV5IGNhbm5vdCBkaXNhZ3JlZSBhYm91dCB3aGF0IHJ1bnMuCi0gKipVc3VhbGx5IG9ubHkgb25lIG1hbmlmZXN0IGlzIHJlYWQuKiogVGhlIHdhbGsgc3RvcHMgYXQgdGhlIGZpcnN0IGNhbmRpZGF0ZSBpdCBhY2NlcHRzLCB3aGljaCBpcyBuZWFybHkgYWx3YXlzIHRoZSBuZXdlc3QgcmVsZWFzZSwgc28gYSBtb2QgdGhhdCBrZWVwcyB1cCBjb3N0cyBubyBtb3JlIHRoYW4gYmVmb3JlLiBNYW5pZmVzdHMgY29tZSBmcm9tIGByYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tYCwgd2hpY2ggaXMgdW5tZXRlcmVkLCByYXRoZXIgdGhhbiBmcm9tIHRoZSBHaXRIdWIgQVBJLCB3aG9zZSBsaW1pdCBvZiBzaXh0eSByZXF1ZXN0cyBhbiBob3VyIGEgc2luZ2xlIHNjcmVlbiBvZiBtb2Qgcm93cyBjb3VsZCB1c2UgdXAuCi0gKipUaGUgd2FsayBzdG9wcyBhZnRlciBlaWdodCB2ZXJzaW9ucyoqIChgTUFYX1ZFUlNJT05TX1RSSUVEYCkuIElmIGEgbW9kJ3MgbGFzdCBlaWdodCByZWxlYXNlcyBhbGwgd2FudCBhIG5ld2VyIGdhbWUsIHRoZSByZWZ1c2FsIHRlbGxzIHRoZSBwbGF5ZXIgdG8gdXBkYXRlIHRoZSBnYW1lIGFuZCBzYXlzIGhvdyBtYW55IHJlbGVhc2VzIHdlcmUgdHJpZWQuCi0gKipBIHBpbm5lZCB0YWcgaXMgbmV2ZXIgd2Fsa2VkIHBhc3QuKiogSWYgdGhlIHBsYXllciBuYW1lZCBhIHZlcnNpb24gYW5kIGl0IHdpbGwgbm90IHJ1biwgdGhlIHBpbiBpcyByZWZ1c2VkIHJhdGhlciB0aGFuIHN3YXBwZWQgZm9yIGEgZGlmZmVyZW50IHJlbGVhc2UuCi0gKipBIGRhdGEgcGFjayBvdXQgb2YgcmFuZ2UgaXMgbm90IHdhbGtlZCBwYXN0IGVpdGhlciwqKiBiZWNhdXNlIGdhdGUgMSBsZXRzIGl0IGxvYWQuIEl0cyBuZXdlc3QgcmVsZWFzZSBpcyBvZmZlcmVkLCB3aXRoIHRoZSB3YXJuaW5nIGFib3V0IHRoZSByYW5nZS4KLSAqKlRoZSBza2lwcGVkIHJlbGVhc2UgaXMgbmFtZWQuKiogVGhlIHJvdywgdGhlIGRldGFpbCBwYW5lIGFuZCB0aGUgcmVmdXNhbCBzY3JlZW4gYWxsIHNheSB3aGljaCBuZXdlciByZWxlYXNlIHdhcyBwYXNzZWQgb3ZlciBhbmQgd2h5LiBXaXRob3V0IHRoYXQsIGEgcGxheWVyIG9mZmVyZWQgMC4xNC40IHdoaWxlIHRoZSBtb2QncyBmcm9udCBwYWdlIHNob3dzIDAuMTUuMCB3b3VsZCBhc3N1bWUgdGhlIGdhbWUgb3IgdGhlIGxpc3RpbmcgaXMgYnJva2VuLCB3aGVuIDAuMTUuMCBzaW1wbHkgd2FudHMgYSBuZXdlciBnYW1lLgotICoqIlVwZGF0ZSB0aGUgZ2FtZSIgYXBwZWFycyBvbmx5IHdoZW4gYSBuZXdlciBnYW1lIHdvdWxkIGhlbHAuKiogR2F0ZSAxIGRvZXMgbm90IHNheSB3aGljaCBzaWRlIGlzIGJlaGluZCwgc2luY2UgYD49MC4yNC4wYCB3YW50cyBhIG5ld2VyIGdhbWUgYW5kIGA8MC41LjBgIHdhbnRzIGFuIG9sZGVyIG9uZS4gQSBzY3JlZW4gb2ZmZXJpbmcgYW4gb2xkZXIgcmVsZWFzZSBhbnN3ZXJzIHRoYXQgcXVlc3Rpb24gc2VwYXJhdGVseSBieSBwcm9iaW5nOiBgbmV3ZXJHYW1lQ291bGRSdW5gIHRyaWVzIHRoZSBuZXh0IG5pbmUgcGF0Y2hlcywgdGhlIG5leHQgbmluZSBtaW5vcnMgYW5kIHRoZSBuZXh0IG5pbmUgbWFqb3JzIGFib3ZlIHRoZSBydW5uaW5nIHZlcnNpb24sIHBsdXMgb25lIGZhci1mdXR1cmUgdmVyc2lvbiBmb3IgYW4gb3BlbiB1cHBlciBib3VuZC4gSWYgbm9uZSBvZiB0aG9zZSBzYXRpc2ZpZXMgdGhlIHJhbmdlLCB0aGUgc2NyZWVuIG5hbWVzIGJvdGggdmVyc2lvbnMgYW5kIGdpdmVzIG5vIGFkdmljZS4KLSAqKk5vIHVwZGF0ZSBpcyBvZmZlcmVkIHRoYXQgdGhlIGxvYWRlciB3b3VsZCByZWZ1c2UuKiogKlVwZGF0ZSBpbnN0YWxsZWQgbW9kcyogY291bnRzIG9ubHkgcmVsZWFzZXMgdGhhdCBydW4gb24gdGhpcyBidWlsZCwgc28gYSBtb2QgYWxyZWFkeSBvbiB0aGUgbmV3ZXN0IHJ1bm5hYmxlIHJlbGVhc2Ugc2hvd3MgYXMgY3VycmVudCByYXRoZXIgdGhhbiBvdXQgb2YgZGF0ZS4gQmVzaWRlIHRoYXQsIHRoZSBzY3JlZW4gc2hvd3MgaG93IG1hbnkgbW9kcyBoYXZlIGEgbmV3ZXIgcmVsZWFzZSB3YWl0aW5nIG9uIGEgbmV3ZXIgZ2FtZS4KLSAqKklmIGEgbWFuaWZlc3QgY2Fubm90IGJlIHJlYWQsIHRoZSB1cGRhdGUgaXMgc3RpbGwgb2ZmZXJlZC4qKiBPbmUgZmFpbGVkIHJlcXVlc3QgaXMgbm8gZXZpZGVuY2UgdGhhdCB0aGUgcmVsZWFzZSB3aWxsIG5vdCBydW4uIFRoZSBpbnN0YWxsIHBhdGggcmVwZWF0cyB0aGUgd2FsayBvdmVyIGEgbGl2ZSBjb25uZWN0aW9uIGFuZCBzdGVwcyBiYWNrIHRvIGFuIG9sZGVyIHJlbGVhc2UgdGhlcmUgaWYgaXQgbmVlZHMgdG8uCgoqKldoYXQgdGhpcyBtZWFucyBmb3IgYXV0aG9ycy4qKiBBIHJhbmdlIHN0cmljdGVyIHRoYW4gdGhlIG1vZCBuZWVkcyBub3cgY29zdHMgcGxheWVycyB5b3VyIG5ld2VzdCByZWxlYXNlIGluc3RlYWQgb2YgdGhlIHdob2xlIG1vZC4gVGhhdCBzdGlsbCBodXJ0cywgc28gb25seSB3cml0ZSBhIHR3by1zaWRlZCByYW5nZSB5b3UgbWVhbi4gSXQgYWxzbyBtZWFucyBhIGNvcnJlY3RlZCByYW5nZSBpbiBhIG5ldyByZWxlYXNlIHJlYWNoZXMgcGxheWVycyBzdHJhaWdodCBhd2F5LCBiZWNhdXNlIHRoZSB3YWxrIGZpbmRzIGl0IHdpdGhvdXQgdGhlIGdhbWUgaGF2aW5nIHRvIHVwZGF0ZSBmaXJzdC4KIyMjIDIuIGBtb2RBcGlgIGFjY2VwdHMgYSB3aW5kb3cKCmBNT0RfQVBJX1ZFUlNJT05gIGlzIHdoYXQgdGhpcyBob3N0IGltcGxlbWVudHM7IGBNT0RfQVBJX01JTmAgaXMgdGhlIG9sZGVzdCBpdApzdGlsbCBhY2NlcHRzLiBFdmVyeXRoaW5nIGluIGJldHdlZW4gbG9hZHMsIGFuZCBhbnl0aGluZyBiZWxvdyB0aGUgY3VycmVudAp2ZXJzaW9uIGlzIHJlcG9ydGVkIHRvIGl0cyBhdXRob3IgYXMgcnVubmluZyBvbiBhIGNvbXBhdGliaWxpdHkgcGF0aC4KClVudGlsIDIwMjYtMDgtMDIgdGhlIGNoZWNrIHdhcyBgZGVjbGFyZWQgIT09IE1PRF9BUElfVkVSU0lPTmAsIHNvIHRoZSBkYXkgdGhlIG51bWJlciBtb3ZlZCwgZXZlcnkgbW9kIHN0b3BwZWQgbG9hZGluZyBhdCBvbmNlLCBiZWZvcmUgYW55IGF1dGhvciBjb3VsZCByZWFjdCBhbmQgd2hldGhlciBvciBub3QgdGhlIGNoYW5nZSBhZmZlY3RlZCB0aGVtLgoKKipBIGJ1bXAgbm93IHRha2VzIHR3byByZWxlYXNlczoqKgoKMS4gU2hpcCB0aGUgbmV3IGJlaGF2aW91ci4gTGVhdmUgYE1PRF9BUElfTUlOYCB3aGVyZSBpdCBpcy4gS2VlcCBob25vdXJpbmcgdGhlIG9sZCBjb250cmFjdCBmb3IgcGx1Z2lucyB0aGF0IGRlY2xhcmVkIHRoZSBvbGQgbnVtYmVyOyBgTG9hZGVkTW9kUGx1Z2luLmFwaWAgY2FycmllcyB3aGF0IGVhY2ggb25lIGRlY2xhcmVkLCB3aGljaCBpcyB3aGF0IG1ha2VzIHRoYXQgcG9zc2libGUuIEF1dGhvcnMgc3RhcnQgc2VlaW5nIHRoZSBkZXByZWNhdGlvbiBsaW5lLgoyLiBSYWlzZSBgTU9EX0FQSV9NSU5gLiBEZWxldGUgdGhlIG9sZCBwYXRoLgoKSWYgYSBjaGFuZ2UgY2Fubm90IGJlIGNvbmRpdGlvbmVkIG9uIHRoZSBkZWNsYXJlZCB2ZXJzaW9uLCBib3RoIGNvbnN0YW50cyBtb3ZlIGluIG9uZSBzdGVwLiBBIHRlc3QgZmFpbHMgd2hlbiB0aGUgdHdvIGNvbnN0YW50cyBzdG9wIG1ha2luZyBzZW5zZSB0b2dldGhlci4KCiMjIyAzLiBBIG1pc3NpbmcgcGF0Y2ggdGFyZ2V0IGNvc3RzIHRoZSBwYXRjaCwgbm90IHRoZSBtb2QKCkEgYGZpZWxkUGF0Y2hgIGFpbWVkIGF0IGEgcmVjb3JkIHRoYXQgbm8gbG9uZ2VyIGV4aXN0cyB1c2VkIHRvIHRocm93LCBhbmQgdGhlIGhvc3QgYW5zd2VycyBhIHRocm93IGJ5IGRyb3BwaW5nIHRoZSB3aG9sZSBwYWNrLiBBIG1vZCBwYXRjaGluZyBmb3J0eSBtb25zdGVycyBsb3N0IGFsbCBmb3J0eSwgYWxvbmcgd2l0aCBpdHMgY29kZSwgaXRzIHJ1bGVzIGFuZCBpdHMgdGlsZXMsIGJlY2F1c2Ugb25lIG9mIHRoZSBmb3J0eSBoYWQgYmVlbiByZW5hbWVkLgoKTm93IGl0IGlzIG9uZSByZXBvcnRlZCBsaW5lIG9uIHRoYXQgbW9kJ3Mgcm93LCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHBhY2sgc3RpbGwgYXBwbGllcy4gVGhlIGxpbmUgc3VnZ2VzdHMgdGhlIHRhcmdldCBtYXkgaGF2ZSBiZWVuIHJlbmFtZWQsIHNpbmNlIHRoYXQgaXMgdGhlIGxpa2VsaWVzdCBjYXVzZS4KClRoZSBjb21wb3NlcidzIG90aGVyIG1lcmdlIHBhdGggYWx3YXlzIGJlaGF2ZWQgdGhpcyB3YXkuIE9mIGNvcmUncyA0NCByZWNvcmQgZmlsZXMsIDIwIHRha2UgYSAicGFzc3Rocm91Z2giIHBhdGggdGhhdCByZXBvcnRlZCBhbmQgY2FycmllZCBvbiwgYW5kIDI0IHRha2UgYSAiY29tcG9zYWJsZSIgcGF0aCB0aGF0IHRocmV3LiBUaGUgc3BsaXQgd2FzIG5ldmVyIGNob3NlbjsgaXQgZm9sbG93cyBmcm9tIHRoZSBzaGFwZSBvZiBjb3JlJ3Mgb3duIHJlY29yZHMuCgpBIHBhdGNoIGNhbiBhcHBseSBjbGVhbmx5IGFuZCBzdGlsbCBuYW1lIHNvbWV0aGluZyB0aGF0IGRvZXMgbm90IGV4aXN0LiBVbnRpbCAyMDI2LTA4LTIwIHRoYXQgd2FzIHdvcnNlIHRoYW4gYSBtaXNzaW5nIHRhcmdldCwgYmVjYXVzZSB0aGUgY29tcG9zZXIgYWNjZXB0ZWQgaXQgYW5kIHRoZSBiaW5kZXIgdGhyZXcuIFN0b3JlIHN0b2NrIHRhYmxlcyBtYWRlIHRoaXMgY29tbW9uOiBgYXBwZW5kYCBleGlzdHMgc28gbW9kIEEgY2FuIHN0b2NrIGFuIGl0ZW0gdGhhdCBtb2QgQiBkZWZpbmVzLCB0dXRvcmlhbCAyIHRlYWNoZXMgZXhhY3RseSB0aGF0IHBhdGNoLCBhbmQgZGlzYWJsaW5nIG1vZCBCIGxlZnQgYW4gYXBwZW5kZWQgbGluZSBpbiB0aGUgYG5vcm1hbGAgdGFibGUgbmFtaW5nIG5vdGhpbmcuIGBiaW5kU3RvcmVgIHRocmV3IGBzdG9yZTogdW5rbm93biBzdmFsYCBmcm9tIGluc2lkZSBgYmluZENvcmVgLCB3aGljaCB0aGUgaG9zdCBydW5zIGF0IG1vZHVsZSB0b3AgbGV2ZWwsIHNvIG9uZSBsaW5lIGluIG9uZSBzaG9wJ3Mgc3RvY2sgdGFibGUgYnJvdWdodCB1cCB0aGUgY3Jhc2ggc2NyZWVuIGluc3RlYWQgb2YgdGhlIGdhbWUuCgpCaW5kZXJzIG5vdyBhcHBseSBnYXRlIDMncyBydWxlOiB0aGUgbGluZSBpcyBkcm9wcGVkLCB0aGUgbW9kIGlzIHRvbGQgb24gaXRzIG93biByb3csIGFuZCB0aGUgcmVzdCBvZiB0aGF0IHN0b3JlIGFuZCBldmVyeSBvdGhlciBzdG9yZSBhcmUgdW50b3VjaGVkLiBDb3JlJ3Mgb3duIGRhdGEgc3RpbGwgdGhyb3dzLiBSZWNvcmQgcHJvdmVuYW5jZSB0ZWxscyB0aGUgdHdvIGFwYXJ0OiBhbiB1bnJlc29sdmFibGUgZW50cnkgaW4gYSBzdG9yZSBubyBwYWNrIGhhcyB0b3VjaGVkIGlzIGNvcmUncyBtaXN0YWtlIGFuZCBmYWlscyBsb3VkbHksIGFuZCBpbiBhIGdhbWUgd2l0aCBubyBtb2RzIHRoYXQgY292ZXJzIGV2ZXJ5IHN0b3JlLgoKVGhpcyBjb3ZlcnMgZXZlcnkgZmllbGQgb2YgYSBzdG9yZSByZWNvcmQgdGhhdCBhIHBhdGNoIGNhbiByZWFjaC4gYG5vcm1hbGAsIGBhbHdheXNgIGFuZCBgYnV5YCBlYWNoIGxvc2Ugb25seSB0aGUgZW50cnkgdGhhdCByZXNvbHZlZCB0byBub3RoaW5nLiBUaGUgYHN0b3JlOmAgZW50cmFuY2UgZmVhdHVyZSBpcyBhIHNjYWxhciwgc28gdGhlcmUgaXMgbm8gc2luZ2xlIGVudHJ5IHRvIGRyb3A6IHRoZSByZWNvcmQgc3RheXMgd2l0aCBhbiBlbnRyYW5jZSB0aGF0IG1hdGNoZXMgbm90aGluZywgdGhlIHNob3AgY2Fubm90IGJlIGVudGVyZWQsIGFuZCB0aGUgbW9kIGlzIHRvbGQuIFRoZSByZWNvcmQgc3RheXMgaW4gdGhlIHN0b3JlIGxpc3QgYmVjYXVzZSB0aGF0IGxpc3QgaXMgcmVhZCBieSBwb3NpdGlvbiwgYW5kIHJlbW92aW5nIG9uZSB3b3VsZCByZW51bWJlciBldmVyeSBsYXRlciBzdG9yZSBhbmQgbW92ZSBhIHNhdmVkIGdhbWUncyBzdG9jayBiZXR3ZWVuIHNob3BzLgpUaGUgb3duZXIgbGlzdCByZXNvbHZlcyBubyBuYW1lcywgc28gaXQgaGFzIG5vIHBlci1lbnRyeSBtaXNzIHRvIGRyb3AsIGJ1dCB0aGUgZmllbGQgY2FuIGdvIG1pc3NpbmcgZW50aXJlbHkuIFRoYXQgaXMgYSBkaWZmZXJlbnQgZmFpbHVyZSBmcm9tIHRoZSB3cm9uZy1zaGFwZSBjYXNlIHRoZSBjb21wb3NlciBoYW5kbGVzIChzZWUgIkEgcGF0Y2ggY2Fubm90IG1ha2UgYSBmaWVsZCB1bnJlYWRhYmxlIiBiZWxvdykuIEEgYHJlcGxhY2VzYCBib2R5IG9uIGEgcmVjb3JkIGEgbW9kIG93bnMgbWF5IGRyb3AgYG93bmVyOmAgYXMgcGFydCBvZiBhIHRvdGFsIGNvbnZlcnNpb24sIGFuZCB0aGUgY29tcG9zZXIncyBzaGFwZSBndWFyZCBkb2VzIG5vdCByZXN0b3JlIGFuIGFic2VudCBmaWVsZCwgc28gYG93bmVyOiB1bmRlZmluZWRgIHVzZWQgdG8gcmVhY2ggYHJlYy5vd25lci5tYXBgIGFzIGEgYmFyZSBgVHlwZUVycm9yYCBuYW1pbmcgbm8gcGFjay4gVGhlIHN0b3JlIGJpbmRlciBub3cgZ3VhcmRzIHRoZSBmaWVsZCBpdHNlbGY6IGEgbWlzc2luZyBvciBtYWxmb3JtZWQgb3duZXIgbGlzdCBiZWNvbWVzIGFuIGVtcHR5IGxpc3QgYW5kIGlzIHJlcG9ydGVkIGFnYWluc3Qgd2hpY2hldmVyIHBhY2sgaXMgcmVzcG9uc2libGUsIGxpa2UgZXZlcnkgb3RoZXIgZmllbGQgb24gdGhlIHJlY29yZCAoIzgpLgoKKipBIHBhdGNoIGNhbm5vdCBtYWtlIGEgZmllbGQgdW5yZWFkYWJsZS4qKiBUaGUgcmVjb3JkIGNoZWNrIGFscmVhZHkgdGVzdGVkIHNoYXBlIG9uIHRoZSBsb2FkIHBhdGggd2l0aCBgZmllbGQvdHlwZWAsIGJ1dCB0aGF0IGNoZWNrIG9ubHkgcmVwb3J0cywgYmVjYXVzZSB0aGUgYmx1ZXByaW50IGl0IHJlYWRzIGlzIGEgbWVhc3VyZW1lbnQgb2YgY29yZSdzIHJlY29yZHMgYW5kIGEgdmFsdWUgb3V0c2lkZSBpdCBjYW4gYmUgbGVnYWwgKGEgbW9kIGludmVudGluZyBhIG5ldyB0dmFsIGlzIHVzaW5nIHRoZSBtb2Qgc3lzdGVtIGFzIGludGVuZGVkKS4gVGhhdCB3b3JrcyBmb3Igc2NhbGFyIHZhbHVlcyBhbmQgZmFpbHMgZm9yIGxpc3RzOiBldmVyeSBiaW5kZXIgcmVhZHMgYSBsaXN0IGZpZWxkIGJ5IGl0ZXJhdGluZyBpdCwgc28gYSBsaXN0IGZpZWxkIGhvbGRpbmcgYSBzdHJpbmcsIGEgbnVtYmVyIG9yIGBudWxsYCBiZWNvbWVzIGEgYFR5cGVFcnJvcmAgaW5zaWRlIGBiaW5kQ29yZWAgaW5zaWRlIGBzdGFydEdhbWVgLCBhbmQgb25lIGZpZWxkIGJyaW5ncyB1cCB0aGUgY3Jhc2ggc2NyZWVuLiBUaGUgY29tcG9zZXIgbm93IHJlZnVzZXMgdGhhdCBvbmUgY2FzZTogdGhlIGZpZWxkIGdvZXMgYmFjayB0byB3aGF0IHRoZSByZWNvcmQgaGFkIGJlZm9yZSwgdGhlIHBhY2sgaXMgdG9sZCBvbiBpdHMgb3duIHJvdywgYW5kIHRoZSByZXN0IG9mIHRoZSBwYXRjaCBhcHBsaWVzLgoKSXQgbGVhdmVzIHR3byBjYXNlcyBhbG9uZToKCi0gQSBzY2FsYXIgb2YgdGhlIHdyb25nIHR5cGUgaXMgb25seSByZXBvcnRlZC4gYHdlaWdodGAgYXMgYCI0MCJgIGlzIHJlYWRhYmxlLCBzb21lIGJpbmRlcnMgY29lcmNlIGl0LCBhbmQgdGhlIG1lYXN1cmVtZW50IGNhbm5vdCBwcm92ZSBpdCBpcyB3cm9uZy4KLSBBIGZpZWxkIHRoZSBwYXRjaCByZW1vdmVzIGlzIG5vdCBwdXQgYmFjay4gRHJvcHBpbmcgZmllbGRzIGlzIGhvdyBhIHRvdGFsIGNvbnZlcnNpb24gd29ya3M6IGByZXBsYWNlc2Agc3dhcHMgdGhlIHdob2xlIHJlY29yZCwgYW5kIGEgbW9uc3RlciByZXdyaXR0ZW4gYXMgYHtuYW1lLCBocH1gIGhhcyBubyBgZmxhZ3NgLiBSZXN0b3JpbmcgdGhlIGZpZWxkIHdvdWxkIHVuZG8gYSBzdXBwb3J0ZWQgZmVhdHVyZS4gQW4gYWJzZW50IHJlcXVpcmVkIGZpZWxkIGlzIHJlcG9ydGVkIChgZmllbGQvcmVxdWlyZWRgKS4gUmVmdXNpbmcgYSByZWNvcmQgdGhhdCB0aGUgbW9kIGl0c2VsZiBvd25zIGlzIHRoZSBiaW5kZXJzJyBqb2IsIGFuZCB0aGUgc3RvcmUgYmluZGVyJ3MgYG93bmVyOmAgZ3VhcmQgYWJvdmUgZG9lcyB0aGF0IHdoZXJlIGl0IGlzIHJlYWNoYWJsZSB0b2RheS4KCkVnb3MgZ2V0IHRoZSBzYW1lIHRyZWF0bWVudCBhcyBzdG9yZXMuIEFuIGVnbydzIGBpdGVtOmAgbGlzdCBuYW1lcyBzcGVjaWZpYyBiYXNlIGtpbmRzIGFuZCBhY2NlcHRzIHRoZSBzYW1lIGBhcHBlbmRgLCBzbyBpdCBoYWQgdGhlIHNhbWUgZGVmZWN0IGFuZCBub3cgYmVoYXZlcyB0aGUgc2FtZSB3YXk6IHRoZSBsaW5lIGlzIGRyb3BwZWQsIHRoZSBlZ28ga2VlcHMgaXRzIG90aGVyIGNhbmRpZGF0ZXMsIGFuZCB0aGUgbW9kIGlzIHRvbGQuIFRoZSBjb3JlLXZlcnN1cy1tb2QgY2hlY2sgbGl2ZXMgaW4gb25lIHNoYXJlZCBgZmllbGRPd25lcmAgaW4gYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWZ1c2FsLnRzYCwgc28gdHdvIGJpbmRlcnMgY2Fubm90IGp1ZGdlIHRoZSBzYW1lIHByb3ZlbmFuY2UgZGlmZmVyZW50bHkuIEFueSBiaW5kZXIgdGhhdCByZXNvbHZlcyBuYW1lcyBmcm9tIGEgbGlzdCBhIG1vZCBjYW4gYXBwZW5kIHRvIHNob3VsZCB1c2UgaXQgcmF0aGVyIHRoYW4gYSBydWxlIG9mIGl0cyBvd24uCkEgcGFzcyBvdmVyIGV2ZXJ5IGJpbmRlciAoIzgpIGZvdW5kIHNpeCBtb3JlIGNhc2VzIG9mIHRoZSBzYW1lIHNoYXBlIGFuZCBmaXhlZCB0aGVtIHRoZSBzYW1lIHdheTogYW4gYXJ0aWZhY3QncyBgZmxhZ3M6YCBhbmQgYHZhbHVlczpgIHRva2VucywgYSBjdXJzZSdzIGB0eXBlOmAgZW50cmllcywgYSBtb25zdGVyJ3MgYGJhc2U6YCAodGhlIHdob2xlIHJhY2UsIGxpa2UgdGhlIGFydGlmYWN0J3MgYGJhc2Utb2JqZWN0OmApLCBgZnJpZW5kcy1iYXNlOmAsIGBmcmllbmRzOmAgYW5kIGBzaGFwZTpgIChvbmUgZW50cnkgZWFjaCksIGFuZCBhIHRlcnJhaW4gZmVhdHVyZSdzIGBtaW1pYzpgLiBUd28gZmllbGRzIGRpZCBub3QgbmVlZCBpdC4gQW4gYXJ0aWZhY3QncyBgYWN0OmAgcmVzb2x2ZXMgdGhlIHdheSB1cHN0cmVhbSdzIGBmaW5kYWN0YCBkb2VzLCBzaWxlbnRseSB0byBub3RoaW5nLCBhbmQgaXQgZG9lcyB0aGF0IG9uIGNvcmUncyBvd24gZGF0YSB0b28sIHNvIHJlZnVzaW5nIGEgbW9kJ3MgdmVyc2lvbiB3b3VsZCBtYWtlIHRoZSBzYW1lIG1pc3Rha2UgbG91ZGVyIGZvciBtb2RzIHRoYW4gZm9yIGNvcmUuIFRoZSB0cmFwIGJpbmRlciByZXNvbHZlcyBubyBuYW1lcyBmcm9tIGFuIGFwcGVuZGFibGUgbGlzdCwgb25seSBmcm9tIGZpeGVkIGNvbXBpbGVkIHRhYmxlcy4KCmBjb21wb3NlUGFja3NgJ3MgYGZpZWxkUGF0Y2hlc2AgbG9vcCBhbHNvIGNhbGxlZCBgYXBwbHlGaWVsZFBhdGNoYCB3aXRob3V0IGdvaW5nIHRocm91Z2ggYHJlZnVzZSgpYCwgc28gYSBtYWxmb3JtZWQgb3AgKGFuIGBhcHBlbmRgIHdpdGggYHZhbHVlYCBpbnN0ZWFkIG9mIGB2YWx1ZXNgLCBzYXkpIHRvb2sgZG93biB0aGUgd2hvbGUgcGFjaywgb3IgZXZlcnkgaW5zdGFsbGVkIG1vZCB3aGVuIHRoZSByYXcgZXJyb3IgbmFtZWQgbm9uZSBvZiB0aGVtLiBJdCBpcyBub3cgcmVmdXNlZCB0aGUgc2FtZSB3YXkgYSBtaXNzaW5nIHBhdGNoIHRhcmdldCBpcy4KIyMjIDQuIGBjdHguY29yZWAgaXMgaGFuZGVkIG92ZXIgd2hvbGU7IGEgbmFtZWQgc3Vic2V0IG9mIGl0IGlzIGd1YXJhbnRlZWQKCmBNb2RQbHVnaW5Db250ZXh0LmNvcmVgIGlzIHRoZSBsaXZlIGNvcmUgbW9kdWxlIG5hbWVzcGFjZTogdGhlIHdob2xlIGVuZ2luZSwgYWJvdXQgdHdvIHRob3VzYW5kIHJ1bnRpbWUgZXhwb3J0cywgcmF0aGVyIHRoYW4gYSBjdXJhdGVkIHNsaWNlIHRoYXQgd291bGQgZHJpZnQgb3V0IG9mIGRhdGUuIGBwYWNrYWdlcy9jb3JlL21vZC1hcGktc3VyZmFjZS5qc29uYCByZWNvcmRzIHRoZSBzdXJmYWNlLCBhbmQgYG1vZC1jb3JlLXN1cmZhY2UudGVzdC50c2AgZmFpbHMgb24gYW55IGRpZmZlcmVuY2UgaW4gZWl0aGVyIGRpcmVjdGlvbiwgc28gZXZlcnkgcmVtb3ZhbCBhbmQgZXZlcnkgYWRkaXRpb24gc2hvd3MgdXAgYXMgYSBkaWZmLgoKYE1PRF9BUElfVkVSU0lPTmAgZG9lcyBub3QgY292ZXIgdGhpcyBuYW1lc3BhY2UuIEl0IHZlcnNpb25zIHRoZSBwbHVnaW4gY29udHJhY3QgaXRzZWxmOiB0aGUgbWVtYmVycyBvZiBgTW9kUGx1Z2luYCwgd2hhdCB0aGUgaG9zdCBwYXNzZXMsIGFuZCB3aGVuIGl0IGNhbGxzIHRoZW0uIEEgY29yZSBmdW5jdGlvbiBjYW4gYmUgcmVuYW1lZCB3aXRob3V0IGNoYW5naW5nIGFueSBvZiB0aGF0LCBzbyB0aGUgbnVtYmVyIGEgbW9kIGF1dGhvciBjaGVja3Mgc2F5cyBub3RoaW5nIGFib3V0IHRoZSBmdW5jdGlvbnMgdGhlaXIgcGx1Z2luIGNhbGxzIG1vc3QuCgpUaGUgbmFtZXNwYWNlIGlzIHRvbyB3aWRlIHRvIHByb21pc2UgYWxsIG9mIGl0OiBmb3JiaWRkaW5nIHRoZSByZW1vdmFsIG9mIGFueSBvZiB0aG9zZSBuYW1lcyB3b3VsZCBmcmVlemUgdGhlIHBvcnQuIFRoZSBwcm9taXNlIGNvdmVycyB0aGUgMjMgbmFtZXMgYmVsb3csIHRoZSBvbmVzIGZpcnN0LXBhcnR5IHBsdWdpbnMgY2FsbGVkIHdoZW4gdGhlIGxpc3Qgd2FzIGRyYXduIHVwLCBhbmQgdGhlIGxpc3QgaGFzIG5vdCBncm93biBzaW5jZS4gRmlyc3QtcGFydHkgbW9kcyByZWFkIDYxIG5hbWVzIGZyb20gYGN0eC5jb3JlYCBhcyBvZiAyMDI2LTEwLTAzLCBzbyA0MSBvZiB0aGVtIGFyZSBvdXRzaWRlIHRoZSBwcm9taXNlLCBhbmQgdGhyZWUgb2YgdGhlIGd1YXJhbnRlZWQgbmFtZXMgYXJlIG5vIGxvbmdlciByZWFkIGJ5IGFueSBvZiB0aGVtLiBUaG9zZSA0MSBhcmUgdGhlIGVzY2FwZSBoYXRjaCBkZXNjcmliZWQgYmVsb3csIHRoZSBzYW1lIGFzIGZvciBhbnlvbmUgZWxzZSdzIG1vZC4KfCBFeHBvcnQgfCBgdHlwZW9mYCB8IENhbGxlZCBieSB8CnwtLS18LS0tfC0tLXwKfCBgRERHUklEYCB8IG9iamVjdCB8IG5vbmUgfAp8IGBGRUFUYCB8IG9iamVjdCB8IGJvcmcsIGJ1Zy1maXhlcyB8CnwgYE1PTl9SQUNFX0ZMQUdfRU5UUklFU2AgfCBvYmplY3QgfCBib3JnIHwKfCBgTU9OX1NQRUxMX0VOVFJJRVNgIHwgb2JqZWN0IHwgYm9yZyB8CnwgYE9wdGlvblN0YXRlYCB8IGZ1bmN0aW9uIHwgcW9sIHwKfCBgUkVTVF9DT01QTEVURWAgfCBudW1iZXIgfCBib3JnIHwKfCBgUlNGYCB8IG9iamVjdCB8IGJvcmcgfAp8IGBSbmdgIHwgZnVuY3Rpb24gfCBib3JnIHwKfCBgVFZgIHwgb2JqZWN0IHwgYm9yZywgcW9sIHwKfCBgZGVzY3JpYmVMb29rR3JpZGAgfCBmdW5jdGlvbiB8IGFueWJhbmR1aSB8CnwgYGdlYXJPYmplY3RGb3JVc2VgIHwgZnVuY3Rpb24gfCBub25lIHwKfCBga25vd25QaWxlYCB8IGZ1bmN0aW9uIHwgYW55YmFuZHVpIHwKfCBgbG9jYCB8IGZ1bmN0aW9uIHwgYnVnLWZpeGVzIHwKfCBgbW92ZW1lbnRUdW5uZWxUZXN0YCB8IGZ1bmN0aW9uIHwgcW9sIHwKfCBgcGFyc2VUaWxlUHJlZnNgIHwgZnVuY3Rpb24gfCB1cHN0cmVhbS1jYXRjaHVwIHwKfCBgcGxhY2VTdGFpcnNgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGBwbGF5ZXJDb25mdXNlRGlyYCB8IGZ1bmN0aW9uIHwgbm9uZSB8CnwgYHNldFByZWZFcnJvclBvbGljeWAgfCBmdW5jdGlvbiB8IHFvbCB8CnwgYHNxdWFyZUlzRW1wdHlgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGBzcXVhcmVJc05vU3RhaXJzYCB8IGZ1bmN0aW9uIHwgYnVnLWZpeGVzIHwKfCBgc3F1YXJlSXNWaXNpYmxlVHJhcGAgfCBmdW5jdGlvbiB8IGFueWJhbmR1aSB8CnwgYHNxdWFyZU51bVdhbGxzQWRqYWNlbnRgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGB0dW5uZWxBdXhgIHwgZnVuY3Rpb24gfCBxb2wgfAoKQnkgbW9kLCBib3JnIHJlYWRzIDcgb2YgdGhlc2UsIGJ1Zy1maXhlcyA2LCBxb2wgNSwgYW55YmFuZHVpIDMgYW5kIHVwc3RyZWFtLWNhdGNodXAgMS4gZmVhdHVyZS1yZXN0b3JhdGlvbiBhbmQgc3F1aXJlIHJlYWQgb25seSB1bmd1YXJhbnRlZWQgbmFtZXMsIGFuZCBsaW5vbGV1bSBhbmQgZm9yZ2UgcmVhZCBub25lOiBsaW5vbGV1bSByZWFjaGVzIHRoZSBnYW1lIHRocm91Z2ggYGhvc3QudGlsZXNgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgLCBhbmQgZm9yZ2UgaG9sZHMgYGN0eC5jb3JlYCB3aXRob3V0IHJlYWRpbmcgYSBuYW1lIGZyb20gaXQuCgpgcGFja2FnZXMvY29yZS9tb2QtY29yZS1ndWFyYW50ZWVkLmpzb25gIGhvbGRzIHRoZSBsaXN0LCBhbmQgYG1vZC1jb3JlLWd1YXJhbnRlZWQudGVzdC50c2AgZmFpbHMgaWYgYW55IG9mIHRob3NlIG5hbWVzIGlzIG1pc3NpbmcgZnJvbSB0aGUgbmFtZXNwYWNlIGEgcGx1Z2luIHJlY2VpdmVzIG9yIGl0cyBgdHlwZW9mYCBoYXMgY2hhbmdlZC4gUmVtb3Zpbmcgb25lIGlzIGEgY29tcGF0aWJpbGl0eSBicmVhayB0aGF0IG5lZWRzIGVpdGhlciBhbiBhbGlhcyB1bmRlciB0aGUgb2xkIG5hbWUgb3IgdGhlIHR3by1yZWxlYXNlIGBtb2RBcGlgIHBhdGg7IHVwZGF0aW5nIGBtb2QtYXBpLXN1cmZhY2UuanNvbmAgYWxvbmUgZG9lcyBub3QgY292ZXIgaXQuCkV2ZXJ5dGhpbmcgZWxzZSBvbiBgY3R4LmNvcmVgIGlzIGFuIGVzY2FwZSBoYXRjaC4gQSBwbHVnaW4gbWF5IGNhbGwgaXQsIGJ1dCBhIHJlbmFtZSBvciByZW1vdmFsIG9mIGFuIHVuZ3VhcmFudGVlZCBuYW1lIGNhbiBzaGlwIGluIGFueSByZWxlYXNlLCByZWNvcmRlZCBpbiB0aGUgdGFibGUgYmVsb3cuIFVzZSBhIHNlYW0gKGBNb2RIb29rc2AsIGBjdHgucmVnaXN0cmllc2AsIGEgY2FwYWJpbGl0eS1nYXRlZCBmYWNhZGUpIHdoZW4gb25lIGV4aXN0czsgY2FsbGluZyBhbiB1bmd1YXJhbnRlZWQgbmFtZSB0aWVzIHRoZSBwbHVnaW4gdG8gdGhhdCBlbmdpbmUgcmVsZWFzZS4KCkZvciB0aGUgcmVzdCBvZiB0aGUgbmFtZXNwYWNlLCB0aGUgb25seSBtZWNoYW5pc20gaXMgdGhlIHJhdGNoZXQgZGVzY3JpYmVkIGFib3ZlOiBgcGFja2FnZXMvY29yZS9tb2QtYXBpLXN1cmZhY2UuanNvbmAgcmVjb3JkcyBldmVyeSBydW50aW1lIGV4cG9ydCwgYW5kIGBtb2QtY29yZS1zdXJmYWNlLnRlc3QudHNgIGZhaWxzIHdoZW4gdGhlIHNldCBjaGFuZ2VzIGluIGVpdGhlciBkaXJlY3Rpb24uCgotIEEgcmVtb3ZhbCBvciByZW5hbWUgb2YgYW4gdW5ndWFyYW50ZWVkIG5hbWUgZmFpbHMgQ0kgYW5kIGxpc3RzIHRoZSBuYW1lcy4gVGhlIGZpeCBpcyB0byBrZWVwIHRoZSBvbGQgbmFtZSBhcyBhbiBhbGlhcywgb3IgdG8gcmVjb3JkIHRoZSBicmVhayBpbiB0aGUgcmVtb3ZhbHMgdGFibGUgYmVsb3cgYW5kIHNoaXAgaXQuIEEgZ3VhcmFudGVlZCBuYW1lIGNhbm5vdCB0YWtlIHRoZSBzZWNvbmQgcm91dGUuCi0gQW4gYWRkaXRpb24gYWxzbyBmYWlscywgYW5kIHRoZSBmaXggaXMgb25lIGNvbW1hbmQ6IGBub2RlIHRvb2xzL2FwaS1zdXJmYWNlLm1qcyAtLXVwZGF0ZWAuIEFkZGl0aW9ucyBoYXZlIHRvIGJlIHJlY29yZGVkIGJlY2F1c2UgYW4gZXhwb3J0IGFkZGVkIGluIG9uZSByZWxlYXNlIGFuZCByZW1vdmVkIGluIHRoZSBuZXh0IHdvdWxkIG90aGVyd2lzZSBuZXZlciBhcHBlYXIgaW4gdGhlIGJhc2VsaW5lLCBhbmQgaXRzIHJlbW92YWwgd291bGQgZ28gdW5ub3RpY2VkLgoKIyMjIyBUaGVyZSBhcmUgdHdvIHN1Y2ggbmFtZXNwYWNlcyBub3csIHdhdGNoZWQgdGhlIHNhbWUgd2F5CgpgY3R4LmF1dGhvcmluZ2AgaXMgdGhlIG1vZCBTREsncyBwdWJsaWMgYmFycmVsLCBoYW5kZWQgb3ZlciB3aG9sZSBmb3IgdGhlIHNhbWUgcmVhc29uIGFzIGBjdHguY29yZWA6IGEgaGFuZC1waWNrZWQgc3Vic2V0IHdvdWxkIGJlIGEgc2Vjb25kIGxpc3QgdG8gbWFpbnRhaW4sIGFuZCBpdCB3b3VsZCBsYWcgYmVoaW5kIHdoYXRldmVyIGZ1bmN0aW9uIGFuIGF1dGhvciBuZWVkcyBuZXh0LiBJdCBoYXMgdGhlIHJhdGNoZXQgYnV0IG5vIGd1YXJhbnRlZWQgc3Vic2V0LgoKQmVmb3JlIHBsdWdpbnMgcmVjZWl2ZWQgaXQsIGEgcmVuYW1lIGluc2lkZSB0aGUgU0RLIHdhcyBjYXVnaHQgYnkgYHRzYyAtYmAgb3ZlciB0aGlzIHJlcG9zaXRvcnksIGJlY2F1c2UgZXZlcnkgY29uc3VtZXIgd2FzIGluIHRoZSByZXBvc2l0b3J5LiBBIHBsdWdpbiBzaGlwcyBhcyBidWlsdCBKYXZhU2NyaXB0IGFuZCByZXNvbHZlcyBubyBzcGVjaWZpZXIsIHNvIHRoZSBjb21waWxlciBuZXZlciBzZWVzIGl0cyBjYWxscy4gVGhlIFNESyB0aGVyZWZvcmUgZ2V0cyB0aGUgc2FtZSByYXRjaGV0IGFzIGNvcmU6IGBwYWNrYWdlcy9tb2Qtc2RrL21vZC1zZGstYXBpLXN1cmZhY2UuanNvbmAgcmVjb3JkcyB0aGUgc3VyZmFjZSwgYG1vZC1hdXRob3Jpbmctc3VyZmFjZS50ZXN0LnRzYCBmYWlscyBvbiBhIGNoYW5nZSBpbiBlaXRoZXIgZGlyZWN0aW9uLCBhbmQgYG5vZGUgdG9vbHMvYXBpLXN1cmZhY2UubWpzYCBjaGVja3MgYW5kIHVwZGF0ZXMgYm90aCBiYXNlbGluZXMgaW4gb25lIHJ1bi4KClRoZSBTREsgYmFycmVsIG5hbWVzIGl0cyBleHBvcnRzIG9uZSBieSBvbmUgaW5zdGVhZCBvZiByZS1leHBvcnRpbmcgZXZlcnl0aGluZzogYGFwcGx5RmllbGRQb2xpY3lgIGlzIGxlZnQgb3V0IG9mIGl0cyBgaW5kZXgudHNgLCBhbmQgYSBjb21tZW50IHRoZXJlIHNheXMgd2h5LiBBIHJlbW92YWwgZnJvbSB0aGUgYmFycmVsIGlzIHJlY29yZGVkIGluIHRoZSB0YWJsZSBiZWxvdyBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBhIGNvcmUgcmVtb3ZhbC4KCiMjIyMgQWRkaXRpb25zLCB3aGljaCBzdHJhbmQgbm9ib2R5CgpBbiBhZGRlZCBgY3R4YCBmaWVsZCBjYW5ub3QgYnJlYWsgYW4gZXhpc3RpbmcgcGx1Z2luLCBiZWNhdXNlIGEgcGx1Z2luIG5ldmVyIHJlYWRzIGEgbmFtZSBpdCBkb2VzIG5vdCBrbm93IGFib3V0LiBgTU9EX0FQSV9WRVJTSU9OYCBkb2VzIG5vdCBtb3ZlIGZvciBvbmUgKGl0cyBkb2MgY29tbWVudCBzYXlzIHNvKSwgYW5kIGFkZGl0aW9ucyBhcmUgbGlzdGVkIGhlcmUgc28gYXV0aG9ycyBjYW4gZmluZCB0aGVtLgp8IFZlcnNpb24gfCBGaWVsZCB8IFdoYXQgaXQgaXMgfAp8LS0tfC0tLXwtLS18CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0yMikgfCBgY3R4LmF1dGhvcmluZ2AgfCBUaGUgbW9kIFNESydzIHB1YmxpYyBiYXJyZWw6IGJsdWVwcmludHMsIGBwZWVyc0ZvcmAsIGBzdWdnZXN0RmllbGRzYCwgYGNoZWNrUmVjb3Jkc2AsIGBNb2RQcm9qZWN0YCBhbmQgdGhlIHJlc3Qgb2YgdGhlIGF1dGhvcmluZyBzdGFjay4gQWx3YXlzIHByZXNlbnQsIHNpbmNlIHRoZXNlIGFyZSBwdXJlIGZ1bmN0aW9ucyBvdmVyIGRhdGEgdGhlIGNhbGxlciBzdXBwbGllcyBhbmQgbmVlZCBubyBib290IHN0YXRlLiBOb3QgY2FwYWJpbGl0eS1nYXRlZCwgZm9yIHRoZSBzYW1lIHJlYXNvbnMgYGNhcGFiaWxpdHktZ2F0ZS1yZWFjaC50ZXN0LnRzYCByZWNvcmRzIGZvciBgY3R4LmNvcmVgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgOiBub3RoaW5nIGhlcmUgcmVhZHMgZ2FtZSBzdGF0ZSBvciBtdXRhdGVzIGEgcmVnaXN0cnksIGFuZCBhbnlvbmUgY2FuIGdldCBldmVyeSBuYW1lIGJ5IGluc3RhbGxpbmcgdGhlIHB1Ymxpc2hlZCBucG0gcGFja2FnZS4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5jb21wb3NlZFJlY29yZHNgIHwgRXZlcnkgY29udGVudCByZWNvcmQgdGhlIHJ1bm5pbmcgZ2FtZSB3YXMgY29tcG9zZWQgZnJvbSwgYXMgSlNPTiwga2V5ZWQgYnkgcGFjay1maWxlIHN0ZW0gd2l0aG91dCB0aGUgZXh0ZW5zaW9uLiBJdCBpcyB0aGUgdW5ib3VuZCBjb3VudGVycGFydCBvZiBgY3R4LnJlZ2lzdHJpZXNgIGFuZCB0aGUgc2hhcGUgdGhlIGF1dGhvcmluZyBmdW5jdGlvbnMgYWJvdmUgYWNjZXB0LiBgcmVnaXN0cmllcy5tb25zdGVycy5yYWNlc2AgaXMgYm91bmQsIHNvIGl0IGhhcyBuZWl0aGVyIHRoZSBKU09OIGtleSBuYW1lcyBub3IgdGhlIGZpZWxkcyB0aGF0IGJvdW5kIHRvIG5vdGhpbmcsIGFuZCBhIHBlZXIgdGFibGUgY2Fubm90IGJlIGJ1aWx0IGZyb20gaXQuIE1vZC1hZGRlZCByZWNvcmRzIGFwcGVhciBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBjb3JlJ3MsIGVhY2ggd2l0aCBpdHMgcHJvdmVuYW5jZS4gQWJzZW50IGR1cmluZyBjb250ZW50IGNvbXBvc2l0aW9uLCBmb3IgdGhlIHNhbWUgcmVhc29uIGByZWdpc3RyaWVzYCBpcy4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5yZWxvYWRHYW1lYCB8IFRoZSBnYW1lJ3Mgb3duIG1vZC1jaGFuZ2UgcmVsb2FkLCBzbyBhIG1vZCB0aGF0IGluc3RhbGxlZCBzb21ldGhpbmcgY2FuIGFwcGx5IGl0OiBldmVyeSBwbHVnaW4ncyBgdW5pbnN0YWxsKClgIHJ1bnMsIHRoZSBhdXRvcGxheWVyIGhhbmRzIHRoZSBrZXlib2FyZCBiYWNrLCB0aGUgbGl2ZSBjaGFyYWN0ZXIncyBzdGF0ZSBpcyByZWNvcmRlZCwgYW5kIHRoZSBzZXNzaW9uIHJlc3VtZXMgdGhhdCBjaGFyYWN0ZXIgaW5zdGVhZCBvZiByZXR1cm5pbmcgdG8gdGhlIHRpdGxlIHNjcmVlbi4gSXQgc2l0cyBiZWhpbmQgYG1vZDppbnN0YWxsYCByYXRoZXIgdGhhbiBhIGNhcGFiaWxpdHkgb2YgaXRzIG93biwgYmVjYXVzZSBjb250ZW50IGNvbXBvc2VzIGF0IGxvYWQsIGFuZCBhbiBpbnN0YWxsIHRoYXQgY2Fubm90IGJlIGZvbGxvd2VkIGJ5IGEgcmVsb2FkIGxlYXZlcyB0aGUgcGxheWVyIHdpdGggc29tZXRoaW5nIHRoZSBydW5uaW5nIGdhbWUgd2lsbCBuZXZlciBsb2FkLiBBIHBsdWdpbiBjYW4gYWxyZWFkeSByZWFjaCBgbG9jYXRpb25gIHdpdGhvdXQgYW55IGdyYW50LCBzbyB0aGlzIGFkZHMgbm8gbmV3IHBvd2VyIHRvIHJlbG9hZDsgaXQgcGVyZm9ybXMgdGhlIGZvdXIgc3RlcHMgYSBtb2QgY2Fubm90IHRha2UgZm9yIGl0c2VsZi4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5pbnN0YWxsTW9kKC4uLikubGluZXNgIHwgQSBmaWVsZCBvbiBib3RoIGFybXMgb2YgdGhlIGV4aXN0aW5nIGluc3RhbGwgb3V0Y29tZTogdGhlIHdvcmRpbmcgdGhlIE1vZHMgc2NyZWVuIHByaW50cyBmb3IgdGhhdCBvdXRjb21lLCBpbmNsdWRpbmcgb25lIHJvdyBwZXIgdW5tZXQgcmVxdWlyZW1lbnQgd2l0aCB0aGUgYXV0aG9yJ3MgYWR2aWNlIHVuZGVyIGVhY2guIEEgbW9kIGJ1aWx0IGluIHRoZSBnYW1lIGZhaWxzIGEgcmVxdWlyZW1lbnQgaW4gdGhlIHNhbWUgd29yZHMgYXMgYSBkb3dubG9hZGVkIG1vZC4gYHByb2JsZW1gIGlzIHVuY2hhbmdlZCBhbmQgaXMgc3RpbGwgb25lIGNvbXBsZXRlIHNlbnRlbmNlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOS0wMSkgfCBgTW9kUmVnaXN0cnlIb3N0Lm1lbnVzLmFkZEFjdGlvbmAgfCBBIGNhcGFiaWxpdHktZ2F0ZWQgYWRkaXRpdmUgY29tcGFuaW9uIHRvIGBtZW51cy5yZWdpc3RlcmA6IGEgcGx1Z2luIGRlY2xhcmluZyBgcmVnaXN0cnk6bWVudWAgY2FuIGFkZCBvbmUgbGFiZWxsZWQsIG5hbWVzcGFjZWQgY2FsbGJhY2sgcm93IHRvIGBjb3JlOmdhbWUtbWVudWAuIEV4aXN0aW5nIG1lbnUgdHJhbnNmb3JtZXJzIGtlZXAgdGhlaXIgYmVoYXZpb3VyLCBhbmQgYW4gZXhpc3RpbmcgcGx1Z2luIG5laXRoZXIgY2FsbHMgbm9yIG9ic2VydmVzIHRoZSBuZXcgbWV0aG9kLCBzbyB0aGlzIGlzIGEgYmFja3dhcmQtY29tcGF0aWJsZSBBUEkgYWRkaXRpb24gYW5kIGRvZXMgbm90IG1vdmUgYE1PRF9BUElfVkVSU0lPTmAuIHwKfCB1bnJlbGVhc2VkICgyMDI2LTA5LTA1KSB8IGBjdHgua2V5bWFwcy5lbnRyaWVzYCwgYC5yZWJpbmRgLCBhbmQgYC5yZW1vdmVgIHwgVGhlIGV4aXN0aW5nIGBrZXltYXA6d3JpdGVgIGZhY2FkZSBub3cgcmVjb3JkcyBhbiBvd25lciBmb3IgZWFjaCBiaW5kaW5nIGl0IGNyZWF0ZXMuIEEgbW9kIGNhbiBlbnVtZXJhdGUsIHJlcGxhY2UsIGFuZCByZW1vdmUgb25seSBpdHMgb3duIGJpbmRpbmdzIGluIHRoZSBhY3RpdmUga2V5c2V0OyBpdCBjYW5ub3QgbGVhcm4sIG92ZXJ3cml0ZSwgb3IgcmVtb3ZlIHBsYXllciBiaW5kaW5ncyBvciBhbm90aGVyIG1vZCdzLiBQbGF5ZXIga2V5bWFwIGVkaXRzIGNsZWFyIGEgY2xhaW0sIGFuZCB0aGUgbW9kLWNoYW5nZSB0ZWFyZG93biByZW1vdmVzIGNsYWltcyB0aGF0IHJlbWFpbiwgc28gYSBkaXNhYmxlZCBtb2QgaGFzIG5vIHN1cnZpdmluZyBrZXlib2FyZCBiaW5kaW5nLiBFeGlzdGluZyBgYmluZGAgcmVtYWlucyBmcmVlLXRyaWdnZXItb25seSwgc28gdGhpcyBpcyBhIGJhY2t3YXJkLWNvbXBhdGlibGUgQVBJIGFkZGl0aW9uIGFuZCBkb2VzIG5vdCBtb3ZlIGBNT0RfQVBJX1ZFUlNJT05gLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOS0wMikgfCBBUEktMiBXb3JrZXIgQUJJIHwgYG1vZEFwaTogMmAgcGx1cyBgcnVudGltZTogIndvcmtlciJgIGFuZCBhIG1vZC1yZWxhdGl2ZSBgd29ya2VyRW50cnlgIHNlbGVjdHMgYSBkZWRpY2F0ZWQgbW9kdWxlIFdvcmtlciBib290ZWQgYnkgaG9zdCBjb2RlLCBpbnN0ZWFkIG9mIGltcG9ydGluZyBgcGx1Z2luLmpzYCBpbnRvIHRoZSByZW5kZXJlci4gSXRzIGluZGVwZW5kZW50bHkgdmVyc2lvbmVkIHByb3RvY29sIHN0YXJ0cyB3aXRoIGltbXV0YWJsZSBpbml0IGRhdGEsIGxvZ3MsIGFzeW5jIHByZWZlcmVuY2VzLCBvd24tYXNzZXQgYnl0ZXMsIGJhZyBtaWdyYXRpb24sIHNlbWFudGljIGNvbW1hbmRzLCByZW5kZXItY29hbGVzY2VkIHN0YXRlIGFuZCBkaXNwbGF5IHNuYXBzaG90cywgYW5kIGhvc3QtcmVuZGVyZWQgZGVjbGFyYXRpdmUgcGFuZWxzLiBUaGUgaW50ZW5kZWQgZmluYWwgc3VyZmFjZSBhbHNvIGFkZHMgdmVyc2lvbmVkIHJlYWQgc25hcHNob3RzLCBob3N0LWNhY2hlZCBwb2xpY2llcyBmb3Igc3luY2hyb25vdXMgcGF0aHMsIGFzeW5jIGhvb2sgZGVjaXNpb25zIHdpdGggdmFsaWRhdGVkIHBhdGNoZXMsIGRlY2xhcmF0aXZlIHJlZ2lzdHJ5L2NvbnRlbnQgYW5kIHRpbGUgZGVjbGFyYXRpb25zLCBjYWNoZWQgZnJvbnRlbmQvSFVEL3JlZ2lvbiBkaXNwbGF5IGxpc3RzLCBzZW1hbnRpYyBrZXltYXAvZGVidWcvd2l6YXJkL3N0b3JhZ2Ugb3BlcmF0aW9ucywgYW5kIG1lZGlhdGVkIG1vZCBsaWZlY3ljbGUgYWN0aW9ucy4gQVBJLTEgcmVtYWlucyBhcyB0cnVzdGVkIGNvbXBhdGliaWxpdHkgY29kZSBmb3Igbm93OyB0aGUgcGxhbiBpcyB0byBtb3ZlIGV2ZXJ5IHNoaXBwZWQgbW9kIHRvIEFQSS0yIHJhdGhlciB0aGFuIGtlZXAgYm90aCBBUElzIHBlcm1hbmVudGx5LiB8CgojIyMjIFJlbW92YWxzIHRha2VuIGtub3dpbmdseQoKRm91ciBvZiB0aGUgc2l4IHJvd3MgYXJlIG9uZSByZW1vdmFsOiB0aGUgcGFyc2UtZXJyb3IgbGltaXQsIHdoaWNoIGhhZCBubyBjb3VudGVycGFydCBpbiBBbmdiYW5kIDQuMi42IGFuZCBzbyBkaWQgbm90IGJlbG9uZyBpbiBhIHBvcnQuIGBmaWxsVGlsZXNGcm9tS2luYCBpcyB0aGUgc2FtZSBraW5kIG9mIHJlbW92YWwsIGFuZCB0aGUgZmlyc3Qgb2YgdGhlc2UgdG8gaGF2ZSBzaGlwcGVkIGluIGEgcmVsZWFzZS4KCnwgVmVyc2lvbiB8IEV4cG9ydCB8IFdoeSB8IFdoYXQgdG8gdXNlIGluc3RlYWQgfAp8LS0tfC0tLXwtLS18LS0tfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTIpIHwgYG9wdGlvbkZpbGVFcnJvck1lc3NhZ2VgIHwgSXRzIHdob2xlIHN1YmplY3QgaXMgZ29uZS4gVGhlIGN1c3RvbS1vcHRpb25zIHJlYWRlciB3YXMgYSBwb3J0IG9mIHVwc3RyZWFtICoqbWFzdGVyKioncyBgc3RydWN0IHBhcnNlcmAgZ3JhbW1hcjsgIzE0OSByZXdyb3RlIGl0IHRvIDQuMi42J3MgaGFuZC1yb2xsZWQgcmVhZCBsb29wLCB3aGljaCBoYXMgbm8gYHBhcnNlcl9zdGF0ZWAgdG8gZm9ybWF0IC0gaXQgZW1pdHMgdGhyZWUgcGxhaW4gYG1zZygpYCBsaW5lcyBpbnN0ZWFkLiB8IGBwcmVmRXJyb3JNZXNzYWdlYCAoYHZpc3VhbHMvcHJlZnMudHNgKSwgd2hpY2ggZm9ybWF0cyB0aGUgaWRlbnRpY2FsIGBQYXJzZSBlcnJvciBpbiAlcyBsaW5lICVkIGNvbHVtbiAlZDogJXM6ICVzYCBmcm9tIHRoZSBzYW1lIGBQYXJzZXJTdGF0ZWAuIEl0IHdhcyBhbHdheXMgdGhlIHNhbWUgZnVuY3Rpb247IHRoaXMgb25lIHdhcyB0aGUgZHVwbGljYXRlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgUEFSU0VfRVJST1JfTElNSVRgIHwgVGhlIHBvcnQncyBvd24gY2FwIG9mIDIwIHBhcnNlIGVycm9ycyBwZXIgZmlsZS4gQSBjaXRhdGlvbiBzd2VlcCAoIzI2OCkgZm91bmQgbm8gYFBBUlNFX0VSUk9SX0xJTUlUYCwgbm8gYGdldF9wYXJzZXJfZXJyb3JfbGltaXRgIGFuZCBubyBlcnJvciBDT1VOVCBhbnl3aGVyZSBpbiA0LjIuNiAtIGBwcm9jZXNzX3ByZWZfZmlsZV9uYW1lZGAgKGB1aS1wcmVmcy5jYCBMMTIyNS0xMjMxKSBgYnJlYWtgcyBvbiB0aGUgRklSU1QgYmFkIGxpbmUgLSBzbyBpdCB3YXMgYW4gaW1wcm92ZW1lbnQgdGhlIHBvcnQgaGFkIGFkZGVkLCBhbmQgdGhlIHBvcnQgYWRkcyBub3RoaW5nICgjMjcyKS4gfCBOb3RoaW5nIGluIGNvcmU6IHRoZSBudW1iZXIgd2FzIG5ldmVyIGEgZmFjdCBhYm91dCBBbmdiYW5kLiBBIG1vZCB0aGF0IHdhbnRzIGEgY2FwIGNob29zZXMgaXRzIG93biBhbmQgcGFzc2VzIGl0IGFzIGBQcmVmRXJyb3JQb2xpY3kucmVwb3J0TGltaXRgIHRvIGBzZXRQcmVmRXJyb3JQb2xpY3lgIChgdmlzdWFscy9wcmVmcy50c2ApLiBUaGUgYHFvbGAgbW9kIHVzZXMgMjAsIHNvIGEgcGxheWVyIHNlZXMgdGhlIGZhbWlsaWFyIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYGdldFBhcnNlckVycm9yTGltaXRgIHwgVGhlIHJlYWRlciBmb3IgdGhlIGFib3ZlLCBpbmNsdWRpbmcgYSBgUEFSU0VfRVJST1JfTElNSVRgIGVudmlyb25tZW50IG92ZXJyaWRlIHRoYXQgbm8gdXBzdHJlYW0gYnVpbGQgaGFzLiBSZW1vdmVkIHdpdGggaXRzIHN1YmplY3QgKCMyNzIpLiB8IGBwcmVmRXJyb3JQb2xpY3koKWAsIHdoaWNoIGFuc3dlcnMgd2l0aCB0aGUgcG9saWN5IGluIGZvcmNlIC0gYFVQU1RSRUFNX1BSRUZfRVJST1JfUE9MSUNZYCB1bmxlc3MgYSBtb2QgaW5zdGFsbGVkIGFub3RoZXIuIEl0IGFuc3dlcnMgYSByaWNoZXIgcXVlc3Rpb24sIGJlY2F1c2Ugb25lIG51bWJlciBjb3VsZCBub3QgZXhwcmVzcyBib3RoICJrZWVwIHJlYWRpbmciIGFuZCAia2VlcCByZXBvcnRpbmciLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgc2V0UGFyc2VyRXJyb3JMaW1pdGAgfCBUaGUgdGVzdCBzZWFtIGZvciB0aGUgYWJvdmUuIE5vdGhpbmcgaW4gdGhlIGdhbWUgZXZlciBjYWxsZWQgaXQsIGFuZCBpdHMgc3ViamVjdCBpcyBnb25lICgjMjcyKS4gfCBgc2V0UHJlZkVycm9yUG9saWN5KHBvbGljeSBcfCBudWxsKWAsIHdoaWNoIGlzIGEgcmVhbCBzZWFtIHJhdGhlciB0aGFuIGEgdGVzdCBob29rOiBpdCBpcyB0aGUgZG9jdW1lbnRlZCB3YXkgYSBtb2QgY2hhbmdlcyB3aGF0IGEgYmFkIHByZWYgbGluZSBjb3N0cywgYW5kIGBudWxsYCByZXN0b3JlcyA0LjIuNidzIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYHBhcnNlUGFyc2VyRXJyb3JMaW1pdEVudmAgfCBQYXJzZWQgYFBBUlNFX0VSUk9SX0xJTUlUYCBvdXQgb2YgdGhlIGVudmlyb25tZW50IHdpdGggQydzIGBzdHJ0b2xgIHJ1bGVzLCBzbyBhIGhvc3QgY291bGQgc2V0IHRoZSBjYXAgd2l0aG91dCBvd25pbmcgdGhlIHJ1bGUuIFRoZXJlIGlzIG5vIGNhcCBhbmQgbm8gZW52aXJvbm1lbnQgdmFyaWFibGUgKCMyNzIpLiB8IE5vdGhpbmcuIEEgbW9kIHRoYXQgd2FudHMgaXRzIHBvbGljeSBjb25maWd1cmFibGUgb3ducyB0aGF0IGRlY2lzaW9uLCBhbmQgYGN0eC5wcmVmc2AgaXMgd2hlcmUgYSBtb2Qga2VlcHMgYSBwbGF5ZXIncyBhbnN3ZXIgdG8gaXQuIHwKfCAwLjIzLjAgfCBgZmlsbFRpbGVzRnJvbUtpbmAgfCBUaGUgcG9ydCdzIG93biBydWxlIHRoYXQgYSBtb2QtYWRkZWQgbW9uc3RlciB3aXRoIG5vIHRpbGUgaXMgZHJhd24gd2l0aCB0aGUgdGlsZSBvZiBhIHJhY2Ugc2hhcmluZyBpdHMgYGJhc2VgLCBhbmQgYW4gYWRkZWQgb2JqZWN0IGtpbmQgd2l0aCBhIGtpbmQgc2hhcmluZyBpdHMgYHR2YWxgLiBTaGlwcGVkIGluIDAuMjIuMCBhbmQgcmVtb3ZlZCBpbiAwLjIzLjA6IDQuMi42IGhhcyBubyBjb25jZXB0IG9mIGEgbW9kLWFkZGVkIHJlY29yZCBhbmQgc28gbm8gb3BpbmlvbiBhYm91dCBob3cgb25lIHNob3VsZCBsb29rLCBhbmQgYm9ycm93aW5nIHRoZSBsb3dlc3QtaW5kZXggcmVsYXRpdmUncyBwaWN0dXJlIGlzIGEgc3R5bGUgY2hvaWNlIHJhdGhlciB0aGFuIHBvcnRlZCBiZWhhdmlvdXIuIEl0IGFsc28gbWFkZSB0aGF0IGNob2ljZSBmb3IgdGlsZSBzZXRzIHRoZSBnYW1lIGRvZXMgbm90IG93bjogYSBwYWNrIGRyYXduIGluIDIwMDMgaGFzIG5vIGFydCBmb3IgY29udGVudCBhZGRlZCB0d2VudHkgeWVhcnMgbGF0ZXIsIGFuZCBhIHNpYmxpbmcncyBwaWN0dXJlIHRoZXJlIG1pc2xlYWRzIHdoZXJlIGEgcGxhaW4gbGV0dGVyIGRvZXMgbm90LiBUaGUgcG9ydCBhZGRzIG5vdGhpbmcgKCMyNzIpLiB8IEl0IGJlY2FtZSBhIHNlYW0sIGByZWdpc3RyeTp0aWxlc2AuIEEgdGlsZXNldCBtb2QgcmVnaXN0ZXJzIGEgZmlsbGVyIHRocm91Z2ggYGhvc3QudGlsZXMucmVnaXN0ZXJgLCByZWFkcyB3aGF0IHRoZSBnYW1lIGNvbnRhaW5zIHRocm91Z2ggYGN0eC5yZWdpc3RyaWVzYCwgYW5kIHdyaXRlcyB0aHJvdWdoIGBUaWxlRmlsbGAsIHdoaWNoIHJlamVjdHMgYW55IHRpbGUgdGhhdCBzb21ldGhpbmcgZWxzZSBhbHJlYWR5IGFzc2lnbmVkLiBgbmVvLWxpbm9sZXVtYCAwLjE1LjAgY2FycmllcyB0aGUgcnVsZSB0aGF0IHVzZWQgdG8gbGl2ZSBoZXJlLCBhcHBsaWVkIHRvIGxpbm9sZXVtIHBhY2tzIG9ubHkuIEl0cyB0aHJlZSBzdXBwb3J0aW5nIHR5cGVzIHdlcmUgcmVtb3ZlZCB3aXRoIGl0IChgS2luVGlsZURlcHNgLCBgS2luVGlsZUZpbGxgLCBgS2luVGlsZURlcml2YXRpb25gKTsgYXMgdHlwZXMsIHRoZXkgbmV2ZXIgYXBwZWFyZWQgaW4gdGhlIHN1cmZhY2UgbGlzdC4gfAoKYHBhcnNlQ3VzdG9tT3B0aW9uc1RleHRgIGtlZXBzIGl0cyBuYW1lIGJ1dCBjaGFuZ2VkIHNoYXBlIG9uIDIwMjYtMDgtMTIuIEl0IHJldHVybnMgYHN0cmluZ1tdYCAodGhlIG1lc3NhZ2VzKSBpbnN0ZWFkIG9mIGBQYXJzZXJTdGF0ZVtdYCwgYW5kIGl0cyBmb3VydGggcGFyYW1ldGVyLCBgZXJyb3JMaW1pdGAsIGlzIGdvbmUgYmVjYXVzZSA0LjIuNidzIHJlYWRlciBoYXMgbm8gZXJyb3IgY2FwLiBBIHBsdWdpbiBjYWxsaW5nIGl0IGZvciBpdHMgb3duIGRpYWdub3N0aWNzIGdldHMgYSB0eXBlIGVycm9yIGF0IGJ1aWxkIGFuZCBhIGRpZmZlcmVudCBhcnJheSBhdCBydW50aW1lLiBUaGVyZSBpcyBubyBhbGlhcywgYmVjYXVzZSB0aGUgY2FsbCBub3cgcmV0dXJucyBkaWZmZXJlbnQgZGF0YSBhbmQgYW4gYWxpYXMgY291bGQgbm90IGdpdmUgYmFjayB0aGUgb2xkIHJlc3VsdC4KCmBDZWxsVmlldy50cmFwYCBrZWVwcyBpdHMgbmFtZSBidXQgY2hhbmdlZCBtZWFuaW5nICh1bnJlbGVhc2VkLCAyMDI2LTA4LTIxKS4gSXQgdXNlZCB0byBtZWFuICJ0aGlzIGdyaWQgaG9sZHMgYW55IHRyYXAgcmVjb3JkIjsgaXQgbm93IG1hdGNoZXMgYHNxdWFyZV9pc2Rpc2FybWFibGV0cmFwYCwgYSB2aXNpYmxlIHBsYXllciB0cmFwIHRoYXQgaXMgbm90IGFscmVhZHkgZGlzYWJsZWQuCgpUaGUgZmllbGQgd2FzIGNoYW5nZWQgaW4gcGxhY2UsIHdpdGggbm8gc2Vjb25kIGZpZWxkIGFsb25nc2lkZSBpdCwgYmVjYXVzZSB0aGUgb2xkIHZhbHVlIHdhcyBzaW1wbHkgd3JvbmcuIFRoZSB0cmFwIGxpc3QgYWxzbyBob2xkcyBhIGNsb3NlZCBkb29yJ3MgbG9jayAoYHNxdWFyZV9zZXRfZG9vcl9sb2NrYCwgZmxhZ2dlZCBgTE9DSyB8IElOVklTSUJMRWApLCBhIGdseXBoIG9mIHdhcmRpbmcsIGEgd2ViIGFuZCBhIGRlY295LiBOb25lIG9mIHRob3NlIGlzIGEgdHJhcCB0aGUgcGxheWVyIGNhbiBzZWUgb3IgdGhhdCBgZGlzYXJtYCB3aWxsIGFjdCBvbiwgc28gYSBtb2QgcmVhZGluZyB0aGUgb2xkIGZpZWxkIHNhdyBhIGxvY2tlZCBkb29yIGFzIHNvbWV0aGluZyB0byBkaXNhcm0uIGBkaXNhcm1gIHJlZnVzZXMgaXQgd2l0aG91dCBzcGVuZGluZyBhIHR1cm4sIHNvIGEgbW9kIHRoYXQga2VwdCBjaG9vc2luZyB0byBkaXNhcm0gd291bGQgaGFuZy4gVGhlIG9sZCBtZWFuaW5nIGFsc28gYnJva2UgdGhlIHJ1bGUgc3RhdGVkIG9uIHRoZSBuZWlnaGJvdXJpbmcgYHRyYXBHbHlwaGA6IGEgdHJhcCB0aGUgcGxheWVyIGhhcyBub3QgZm91bmQgaXMgbm90IG9uIHRoZSBzY3JlZW4sIHNvIGl0IGlzIG5vdCBpbiB0aGUgdmlldy4KCioqV2hhdCB0byBkbyBhYm91dCBpdC4qKiBBIG1vZCB0aGF0IHVzZWQgYHRyYXBgIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGRpc2FybSBuZWVkcyBubyBjaGFuZ2UgYW5kIG5vIGxvbmdlciBoYW5ncy4gQSBtb2QgdGhhdCB1c2VkIGl0IHRvIGFzayB3aGV0aGVyIGFueXRoaW5nIGluIHRoZSB0cmFwIGxpc3QgaXMgaGVyZSAoYSBtYXAgb3ZlcmxheSBjb3VudGluZyBnbHlwaHMgb2Ygd2FyZGluZywgc2F5KSBub3cgZ2V0cyBgZmFsc2VgIGZvciBhIGdseXBoIGFuZCBzaG91bGQgcmVhZCBgdHJhcEdseXBoYCBpbnN0ZWFkLCB3aGljaCBpcyBwcmVzZW50IGZvciBldmVyeSB0cmFwIHRoZSBwbGF5ZXIgY2FuIHNlZSwgZ2x5cGhzIGluY2x1ZGVkLgoKYFByb2Nlc3NQcmVmT3B0aW9uc2AgY2hhbmdlZCBzaGFwZSBmb3IgdGhlIHNhbWUgcmVhc29uICgjMjcyLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTQpOiBgZXJyb3JMaW1pdD86IG51bWJlcmAgaXMgbm93IGBlcnJvclBvbGljeT86IFByZWZFcnJvclBvbGljeWAuIEEgcGx1Z2luIHRoYXQgY2FsbGVkIGBwcm9jZXNzUHJlZlRleHQodGV4dCwgZGVwcywgc2luaywgeyBlcnJvckxpbWl0OiAwIH0pYCBnZXRzIGEgdHlwZSBlcnJvciBhdCBidWlsZCwgYW5kIHRoZSBmaXggaXMgYHsgZXJyb3JQb2xpY3k6IHsgY29udGludWVBZnRlckVycm9yOiB0cnVlLCByZXBvcnRMaW1pdDogMCB9IH1gLiBUaGVyZSBpcyBubyBhbGlhcywgYmVjYXVzZSBvbmUgbnVtYmVyIG1peGVkIHVwICJzdG9wIGFwcGx5aW5nIHRoZSBmaWxlIiB3aXRoICJzdG9wIGNvbGxlY3RpbmcgZXJyb3JzIiwgYW5kIG9ubHkgdGhlIHNlY29uZCBpcyBzb21ldGhpbmcgYSBwbGF5ZXIgd2FudHMgY2FwcGVkLiBGb3VyIG5hbWVzIGFycml2ZWQgd2l0aCBpdDogdGhlIHR5cGUgYFByZWZFcnJvclBvbGljeWAsIHdoaWNoIGFzIGEgdHlwZSBuZXZlciBhcHBlYXJzIGluIHRoZSBzdXJmYWNlIGxpc3QsIGFuZCB0aGUgcnVudGltZSBleHBvcnRzIGBVUFNUUkVBTV9QUkVGX0VSUk9SX1BPTElDWWAsIGBwcmVmRXJyb3JQb2xpY3koKWAgYW5kIGBzZXRQcmVmRXJyb3JQb2xpY3koKWAuCmBtc2d0KHNpbmtzLCB0eXBlLCB0ZXh0KWAga2VlcHMgaXRzIG5hbWUgYW5kIHNpZ25hdHVyZSBidXQgbm8gbG9uZ2VyIHRvdWNoZXMgYHNpbmtzLnNvdW5kYCAoIzIzOSwgdW5yZWxlYXNlZCAyMDI2LTA4LTEzKS4gSXQgdXNlZCB0byBjYWxsIGJvdGggc2lua3MgaXRzZWxmOyB0aGUgaG9zdCdzIGBtc2dgIHNpbmsgaXMgbm93IGBtc2d0YCwgc28gZG9pbmcgYm90aCB3b3VsZCBwbGF5IHRoZSBzb3VuZCB0d2ljZS4gTm90aGluZyBicmVha3MgYXQgYnVpbGQgdGltZSwgYW5kIHRoZSBjb21tb24gY2FzZSBpcyB1bmNoYW5nZWQ6IGEgcGx1Z2luIHRoYXQgY2FsbHMgYG1zZ3QoY3R4LnN0YXRlLCAiSFVOR1JZIiwgIi4uLiIpYCBzdGlsbCBnZXRzIHRoZSBtZXNzYWdlIGFuZCB0aGUgc291bmQsIGJlY2F1c2UgdGhlIHN0YXRlJ3Mgc2luayBzdXBwbGllcyBpdC4gVGhlIGNoYW5nZSBhZmZlY3RzIGEgcGx1Z2luIHRoYXQgYmluZHMgaXRzIG93biBub24tc291bmRpbmcgYG1zZ2AgaW50byBhIGBNZXNzYWdlU2lua3NgIGFuZCByZWxpZWQgb24gYG1zZ3RgIHRvIGNhbGwgYHNvdW5kYCBzZXBhcmF0ZWx5LiBUaGF0IHBsdWdpbiBub3cgZ29lcyBxdWlldCwgYW5kIHRoZSBmaXggaXMgdG8gbWFrZSBpdHMgc2luayB0eXBlLWF3YXJlIHdpdGggdGhlIGV4cG9ydGVkIGBtZXNzYWdlU291bmQodHlwZSlgLCB0aGUgc2FtZSBvbmUtbGluZSBydWxlIGB3ZWIvc3JjL21haW4udHNgIHVzZXMuIFRoZXJlIGlzIG5vIGFsaWFzLCBiZWNhdXNlIHR3byBmdW5jdGlvbnMgdGhhdCBkaWZmZXIgb25seSBpbiB3aGV0aGVyIHRoZXkgcGxheSB0aGUgc291bmQgdHdpY2Ugd291bGQgYmUgd29yc2UgdGhhbiBvbmUgcnVsZS4KCkluIHRoZSBTREsgcmF0aGVyIHRoYW4gYGN0eC5jb3JlYCwgYFBhcnNlZENhcGFiaWxpdHlgIGdhaW5lZCBhIGB7IGtpbmQ6ICJkaXNwbGF5IjsgYWN0aW9uOiAicmVwbGFjZSIgfWAgdmFyaWFudCAoIzE0MCwgdW5yZWxlYXNlZCAyMDI2LTA4LTEzKSwgYmVjYXVzZSBgTW9kUGx1Z2luLmZyb250ZW5kYCBub3cgcmVxdWlyZXMgYGRpc3BsYXk6cmVwbGFjZWAuIENvZGUgdGhhdCBidWlsZHMgYSBjYXBhYmlsaXR5IHN0cmluZyBpcyB1bmFmZmVjdGVkLiBBIHBsdWdpbiB0aGF0IGBzd2l0Y2hgZXMgZXhoYXVzdGl2ZWx5IG92ZXIgYHBhcnNlQ2FwYWJpbGl0eWAncyByZXN1bHQgaW4gVHlwZVNjcmlwdCBnZXRzIGEgY29tcGlsZSBlcnJvciBuYW1pbmcgdGhlIG5ldyBhcm0sIHdoaWNoIGlzIGludGVuZGVkOiBhIG1vZCB0aGF0IHNob3dzIHRoZSBjYXBhYmlsaXR5IGxpc3QgaW4gaXRzIG93biBVSSBzaG91bGQgbGVhcm4gdGhhdCBhIGtpbmQgZXhpc3RzIGl0IGRvZXMgbm90IGRlc2NyaWJlLiBBdCBydW50aW1lIHRoZSBjaGFuZ2UgaXMgYWRkaXRpdmUsIGFuZCBhbiBvbGRlciBidWlsZCBuZXZlciBlbWl0cyB0aGUgbmV3IHZhcmlhbnQuCgpgUGFyc2VkQ2FwYWJpbGl0eWAgY2hhbmdlZCBhZ2FpbiBpbiB0aGUgc2FtZSB3YXk6IGl0IGdhaW5lZCBgeyBraW5kOiAidWkiOyByZWdpb246IHN0cmluZzsgYWN0aW9uOiAicmVwbGFjZSIgfWAsIGFuZCBgQ29udGVzdGVkTGF5ZXJgIGdhaW5lZCBgImh1ZCJgICgjMjUzLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTMpLCBiZWNhdXNlIGBNb2RQbHVnaW4uaHVkYCByZXF1aXJlcyBgdWk6PHJlZ2lvbj4ucmVwbGFjZWAgYW5kIHRoZSBjb25mbGljdCByZXBvcnQgbm93IGhhcyBhIHNsb3QgZm9yIGVhY2ggSFVEIHJlZ2lvbi4gQW4gZXhoYXVzdGl2ZSBgc3dpdGNoYCBvdmVyIGVpdGhlciB0eXBlIGdldHMgYSBjb21waWxlIGVycm9yIG5hbWluZyB0aGUgbmV3IGFybSwgYXMgaW50ZW5kZWQuIGBNb2RQbHVnaW5gIGl0c2VsZiBvbmx5IGdhaW5lZCBhbiBvcHRpb25hbCBtZW1iZXIsIHNvIG5vIGV4aXN0aW5nIHBsdWdpbidzIHNoYXBlIGNoYW5nZXMuCgpUd28gbW9yZSBTREsgYWRkaXRpb25zIGJyZWFrIG5vdGhpbmcgYW5kIGFyZSBsaXN0ZWQgYmVjYXVzZSBldmVyeSBzaGFwZSBjaGFuZ2UgaXMgcmVjb3JkZWQsIHdoZXRoZXIgb3Igbm90IGl0IHN0cmFuZHMgYW55b25lLiBgV29ybGRGcmFtZWAgYW5kIGBIdWRGcmFtZWAgZWFjaCBnYWluZWQgYW4gb3B0aW9uYWwgYHN0YWNrYCAoYHJlYWRvbmx5IExpdmVSZWdpb25bXSB8IHVuZGVmaW5lZGApLCBhbmQgYExpdmVSZWdpb25gIGFuZCBgUmVnaW9uTGF5ZXJgIGFyZSBub3cgZXhwb3J0ZWQgZnJvbSB0aGUgU0RLICgjMjYxLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTQpLiBBbiBvcHRpb25hbCBtZW1iZXIgb24gYW4gaW50ZXJmYWNlIGEgcGx1Z2luIHJlY2VpdmVzIGNhbm5vdCBicmVhayBpdCwgYmVjYXVzZSBjb2RlIHRoYXQgcmVhZHMgYSBmcmFtZSBzdGlsbCBjb21waWxlcy4gQSBob3N0IHRoYXQgcHVibGlzaGVzIG5vIHN0YWNrIGxlYXZlcyBpdCBgdW5kZWZpbmVkYCwgYW5kIHRoYXQgaGFzIGl0cyBvd24gbWVhbmluZywgc28gYSBmcm9udCBlbmQgbXVzdCBub3QgdHJlYXQgYSBtaXNzaW5nIHN0YWNrIGFzICJub3RoaW5nIGlzIGNvdmVyaW5nIG1lIi4gU2VlIFtQTFVHSU5TLm1kXShQTFVHSU5TLm1kI2tub3dpbmctd2hlbi15b3UtYXJlLWNvdmVyZWQtZnJhbWVzdGFjaykuIFRoZSBgUGFyc2VkQ2FwYWJpbGl0eWAgY2hhbmdlcyBhYm92ZSBicm9rZSBleGhhdXN0aXZlIGBzd2l0Y2hgZXMgYmVjYXVzZSBwbHVnaW5zIGluc3BlY3QgY2FwYWJpbGl0aWVzOyBwbHVnaW5zIGRvIG5vdCBzd2l0Y2ggZXhoYXVzdGl2ZWx5IG92ZXIgZnJhbWVzLgpPbmUgU0RLIGNoYW5nZSByZW1vdmVzIGEgbmFtZSByYXRoZXIgdGhhbiByZXNoYXBpbmcgaXQ6IGBhcHBseUZpZWxkUG9saWN5YCBpcyBnb25lIGZyb20gdGhlIHBhY2thZ2UgaW5kZXggKCMyODUsIHVucmVsZWFzZWQgMjAyNi0wOC0xNSkuIEl0IGJlY2FtZSBwdWJsaWMgYnkgYWNjaWRlbnQgdGhyb3VnaCBgZXhwb3J0ICogZnJvbSAiLi9maWVsZHMuanMiYCwgYW5kIG91dHNpZGUgdGhlIFNESyBpdCB3YXMgYm90aCB1bnVzYWJsZSBhbmQgZGFuZ2Vyb3VzLiBUaGUgZnVuY3Rpb24ganVkZ2VzIGEgbmFtZXNwYWNlIHRyZXNwYXNzIGZyb20gYSBgRmllbGRQcm92ZW5hbmNlYCBtYXAgYnVpbHQgZHVyaW5nIGNvbXBvc2l0aW9uLCBhbmQgdGhlIGFjY2Vzc29yIHRoYXQgYnVpbGRzIG9uZSAoYGZpZWxkUHJvdmVuYW5jZU9mYCkgd2FzIG5ldmVyIGV4cG9ydGVkLiBBbiBvdXRzaWRlIGNhbGxlciBjb3VsZCB0aGVyZWZvcmUgb25seSB1c2UgdGhlIHRocmVlLWFyZ3VtZW50IGZvcm0sIHdob3NlIGRlZmF1bHRzIGFyZSBlbXB0eSBtYXBzOiBpdCBzdHJpcHMgdW5kZWNsYXJlZCBrZXlzLCBmaW5kcyBubyByZWNvcmRlZCB3cml0ZXIgZm9yIGFueXRoaW5nLCBqdWRnZXMgbm8gd3JpdGUgYSB0cmVzcGFzcywgYW5kIHJldHVybnMgYSBmYXVsdCBsaXN0IHRoYXQgbG9va3MgZXhhY3RseSBsaWtlIGEgY2xlYW4gcGFzcywgc28gdGhlIGNhbGxlciB0cnVzdHMgYSBjaGVjayB0aGF0IG5ldmVyIHJhbi4gVGhlIHR3byBwcm92ZW5hbmNlIHBhcmFtZXRlcnMgYXJlIG5vdyByZXF1aXJlZCB0b28sIHNvIHRoZSBzYW1lIG1pc3Rha2UgaXMgYSBjb21waWxlIGVycm9yIGluc2lkZSB0aGUgU0RLLiBOb3RoaW5nIGluIHRoaXMgcmVwb3NpdG9yeSBvciB0aGUgZm91ciBtb2QgcmVwb3NpdG9yaWVzIGNhbGxlZCBpdCwgc28gbm8gYXV0aG9yIGlzIHN0cmFuZGVkOyB0aGUgd2F5IHRvIGFwcGx5IHRoZSBydWxlIGlzIGBjb21wb3NlQ29udGVudFBhY2tzYCwgd2hpY2ggc3VwcGxpZXMgYm90aCBtYXBzIGFuZCBhbHdheXMgaGFzLiBgY2hlY2tVbnF1YWxpZmllZGAsIGBkZWNsYXJlZEZpZWxkc2AsIGBmaWVsZE93bmVyYCwgYGlzRXh0ZW5zaW9uS2V5YCBhbmQgYEZJRUxEX1RZUEVTYCBhcmUgdW5hZmZlY3RlZCwgYW5kIHRoZSBpbmRleCBub3cgbmFtZXMgdGhlbSBleHBsaWNpdGx5IGluc3RlYWQgb2YgdXNpbmcgdGhlIHdpbGRjYXJkIHRoYXQgbGV0IGBhcHBseUZpZWxkUG9saWN5YCBvdXQuCgpUd28gZmllbGQgcmVuYW1lcyBhcmUgaW52aXNpYmxlIHRvIHRoZSBleHBvcnQgcmF0Y2hldCwgd2hpY2ggY29tcGFyZXMgb25seSB0aGUgc2V0IG9mIGV4cG9ydGVkIG5hbWVzIGFuZCBub3QgdGhlIHNoYXBlIG9mIHdoYXQgZWFjaCBvbmUgcmV0dXJucyAoIzI4MywgdW5yZWxlYXNlZCAyMDI2LTA4LTE1KS4gVGhlIHVpLWVudHJ5IGNvbmZpZyBhIHBsdWdpbiBnZXRzIGZyb20gYGJ1aWxkVWlFbnRyeUNvbmZpZ2AgY2hhbmdlZCB0d28gZmllbGRzOgoKfCBXYXMgfCBOb3cgfCBXaHkgbm90IGFsaWFzZWQgfAp8LS0tfC0tLXwtLS18CnwgYFVpRW50cnkuY29tYmluZXJJbmRleDogbnVtYmVyYCAoMS1iYXNlZCBpbnRvIGNvcmUncyBuaW5lKSB8IGBVaUVudHJ5LmNvbWJpbmVyTmFtZTogc3RyaW5nYCB8IFRoZSBpbmRleCBpcyBhIHBvc2l0aW9uIGluIGNvcmUncyBvd24gY29tcGlsZWQgdGFibGUsIHNvIGEgY29tYmluZXIgYSBtb2QgcmVnaXN0ZXJzIGhhcyBub25lOyBrZWVwaW5nIGl0IHdvdWxkIGhhdmUgZml4ZWQgdGhlIHRhYmxlIGF0IG5pbmUgZW50cmllcyBhbmQgbWFkZSBgcmVnaXN0cnk6dWktZW50cnlgIHVzZWxlc3MuIEtlZXBpbmcgYm90aCB3b3VsZCBnaXZlIG9uZSB0aGluZyB0d28gaWRlbnRpdGllcyBhbmQgbmVlZCBhIHJ1bGUgYWJvdXQgd2hpY2ggd2lucy4gfAp8IGBSZW5kZXJlckluZm8uYmFja2VuZEluZGV4OiBudW1iZXJgICgwLi41KSwgYFJlbmRlcmVySW5mby5jb21iaW5lckluZGV4OiBudW1iZXJgIHwgYFJlbmRlcmVySW5mby5iYWNrZW5kTmFtZTogc3RyaW5nYCwgYFJlbmRlcmVySW5mby5jb21iaW5lck5hbWU6IHN0cmluZ2AgfCBTYW1lIHJlYXNvbiBhbmQgc2FtZSBmaXg6IHJlYWQgdGhlIG5hbWUuIGBSZW5kZXJlckluZm9gIGlzIG5vdyBhbHNvIGFuIGV4cG9ydGVkIHR5cGUsIHdoaWNoIGEgcGx1Z2luIHdyaXRpbmcgYSByZW5kZXJlciBiYWNrZW5kIG5lZWRzIGluIG9yZGVyIHRvIG5hbWUgaXQuIHwKCk5vdGhpbmcgZWxzZSBpbiBgVWlFbnRyeUNvbmZpZ2AgY2hhbmdlZC4gQSBwbHVnaW4gdGhhdCBvbmx5IGNhbGxzIGBjaGFyYWN0ZXJHcmlkYCwgYGVxdWlwQ21wU3VtbWFyeWAsIGBhcHBseVJlbmRlcmVyYCBvciBgY29tYmluZVZhbHVlc2AgaXMgdW5hZmZlY3RlZDogZWFjaCBnYWluZWQgYW4gb3B0aW9uYWwgdHJhaWxpbmcgcmVnaXN0cnkgYXJndW1lbnQgYW5kIGJlaGF2ZXMgYXMgYmVmb3JlIHdoZW4gaXQgaXMgb21pdHRlZC4KQW4gQVBJLTIgV29ya2VyIG1vZCdzIG1vZHVsZSBncmFwaCBoYXMgYSBuYXJyb3dlciBzaGFwZSAodW5yZWxlYXNlZCwgMjAyNi0xMC0wNCksIGJlY2F1c2UgdGhlIG1vZCBub3cgcnVucyBpbiBhIHNhbmRib3ggdGhhdCBjYW5ub3QgbG9hZCB0aGUgZ2FtZSdzIFVSTHMgYW5kIHJlY2VpdmVzIGl0cyBtb2R1bGVzIGFzIHRleHQgdGhlIGdhbWUgcmVhZCBmb3IgaXQuIEl0cyBpbXBvcnRzIG11c3QgYmUgcmVsYXRpdmUgcGF0aHMgdG8gaXRzIG93biBmaWxlcywgd2l0aCBubyBjeWNsZXM7IGEgYmFyZSBwYWNrYWdlIG5hbWUsIGFub3RoZXIgb3JpZ2luIG9yIGEgcGF0aCBvdXQgb2YgdGhlIGVudHJ5J3MgZm9sZGVyIGZhaWxzIHRoZSBtb2QgYXQgc3RhcnQgd2l0aCB0aGUgZmlsZSBuYW1lZC4gSW5zaWRlIHRoZSBzYW5kYm94IGVhY2ggbW9kdWxlIGlzIGEgYGRhdGE6YCBVUkwsIHNvIGBpbXBvcnQubWV0YS51cmxgIGFuZCBjb21wdXRlZCBkeW5hbWljIGltcG9ydHMgbm8gbG9uZ2VyIGZpbmQgdGhlIG1vZCdzIGZpbGVzLCBhbmQgYGZldGNoYCBpcyBnb25lLiBBIG1vZCBidW5kbGVkIGludG8gb25lIGZpbGUgd2l0aCBpdHMgYXNzZXRzIHJlYWQgdGhyb3VnaCB0aGUgYXNzZXQgcmVxdWVzdCBuZWVkcyBubyBjaGFuZ2UuIFtXT1JLRVJfSVNPTEFUSU9OLm1kXShXT1JLRVJfSVNPTEFUSU9OLm1kKSBoYXMgdGhlIGRldGFpbHMuCgpUaGUgcHJldmlldyBXb3JrZXIgQUJJIGlzIHJldGlyZWQgKHVucmVsZWFzZWQsIDIwMjYtMTAtMDQpLiBBIG1vZCB3aXRoIGBtb2RBcGk6IDJgIGFuZCBhIGB3b3JrZXJFbnRyeWAgc3Bva2UgYSBtZXNzYWdlIHByb3RvY29sIG9mIGl0cyBvd247IGEgV29ya2VyIG1vZCBub3cgZGVmYXVsdC1leHBvcnRzIGFuIEFQSSAyIGRlZmluaXRpb24gYW5kIHJlYWNoZXMgdGhlIGdhbWUgdGhyb3VnaCB0aGUgc2FtZSBkb21haW5zIGFzIGFuIGluLXByb2Nlc3MgbW9kLiBUaGUgb2xkIG1hbmlmZXN0IHN0aWxsIHJlYWRzIGFuZCBjb252ZXJ0cywgd2l0aCBgdWk6cGFuZWxgIGJlY29taW5nIGB1aTpwYW5lbC5tb3VudGAsIGBzdGF0ZTptb2RlbC5yZWFkYCBiZWNvbWluZyBgc3RhdGU6cGxheWVyLnJlYWRgIGFuZCB0aGUgb3RoZXIgV29ya2VyLW9ubHkgbmFtZXMgZHJvcHBlZCwgYnV0IHRoZSBsb2FkZXIgcmVmdXNlcyBpdHMgY29kZSBhbmQgc2F5cyB0byByZWJ1aWxkIGl0IGFnYWluc3QgQVBJIDIuIE5vIG1vZCBpbiB0aGlzIHJlcG9zaXRvcnkgdXNlZCB0aGUgcHJldmlldyBBQkkuIFtBUEkyLm1kXShBUEkyLm1kKSAoIkluIGEgV29ya2VyIikgbGlzdHMgd2hhdCBhIFdvcmtlciBtb2QgZ2V0cy4KCk91dHNpZGUgdGhlIGd1YXJhbnRlZWQgc3Vic2V0LCBgY3R4LmNvcmVgIGNhbiBjaGFuZ2UgaW4gYW55IHJlbGVhc2U7IHRoZSByYXRjaGV0IG1ha2VzIGVhY2ggYnJlYWsgdmlzaWJsZSBpbiB0aGlzIHJlcG9zaXRvcnkgYmVmb3JlIGl0IHJlYWNoZXMgYSBwbGF5ZXIncyBicm93c2VyLiBUaGUgZ3VhcmFudGVlIGNvdmVycyBhIHRvcC1sZXZlbCBuYW1lIGFuZCBpdHMgYHR5cGVvZmAsIHNvIG5lc3RlZCBrZXlzIG9uIGEgZ3VhcmFudGVlZCBvYmplY3QgKGBGRUFULk1PUkVgLCBgVFYuU1dPUkRgLCBgUlNGLkJSX0ZJUkVgKSBhcmUgcmVjb3JkZWQgbGlrZSBhbnkgb3RoZXIgc2hhcGUgY2hhbmdlLiBgTW9kSG9va3NgIGlzIGEgY2xvc2VkIGludGVyZmFjZSBvZiAyMiBtZW1iZXJzLCBhbmQgdGhlIGJ1Zy1maXhlcyBtb2QgYWxvbmUgdXNlcyBuaW5lIG9mIHRoZW0uIElmIGF1dGhvcnMga2VlcCBjYWxsaW5nIHVuZ3VhcmFudGVlZCBgY3R4LmNvcmVgIG5hbWVzIHRvIGdldCBwYXN0IGl0LCB0aGUgYW5zd2VyIGlzIHRvIGdyb3cgdGhlIHNlYW0gb3IgYWRkIG5hbWVzIHRvIHRoZSBndWFyYW50ZWVkIHN1YnNldCwgcmF0aGVyIHRoYW4gcmVzdHJpY3RpbmcgdGhlIG5hbWVzcGFjZS4KCmBtb25zdGVyQmVjYW1lVmlzaWJsZWAgYW5kIGBhcnRpZmFjdElkZW50aWZpZWRgIGtlZXAgdGhlaXIgbmFtZXMgYnV0IGNoYW5nZWQgYXJndW1lbnRzICh1bnJlbGVhc2VkLCAyMDI2LTEwLTA0KS4gVGhlIGZpcnN0IHVzZWQgdG8gcGFzcyB0aGUgbGl2ZSBgTW9uc3RlcmAgYW5kIG5vdyBwYXNzZXMgYSBgS25vd25Nb25zdGVyYDsgdGhlIHNlY29uZCB1c2VkIHRvIHBhc3MgdGhlIGBHYW1lT2JqZWN0YCBhbmQgaXRzIGBBcnRpZmFjdGAgcmVjb3JkIGFuZCBub3cgcGFzc2VzIGB7IG5hbWUsIGFydGlmYWN0SW5kZXggfWAuIFRoZSBsaXZlIG9iamVjdHMgdG9sZCBhIG1vZCB0aGluZ3MgdGhlIHBsYXllciBkb2VzIG5vdCBrbm93LCBzdWNoIGFzIGEgbW9uc3RlcidzIGV4YWN0IGhpdCBwb2ludHMgYW5kIGV2ZXJ5IHNwZWxsIGl0cyByYWNlIGhhcywgYW5kIGEgbW9kIGNvdWxkIGNoYW5nZSB0aGVtLiBObyBmaXJzdC1wYXJ0eSBtb2QgaGFuZGxlcyBlaXRoZXIgaG9vay4gQSBoYW5kbGVyIHRoYXQgcmVhZCBgbW9uLnJhY2UubmFtZWAgcmVhZHMgYG1vbi5yYWNlYCwgYG1vbi5ncmlkYCBpcyB1bmNoYW5nZWQsIGFuZCBgYXJ0aWZhY3QuYWlkeGAgYmVjb21lcyBgYXJ0aWZhY3RJbmRleGAuIFRoZSBgaWRgIGlzIGEgaGFuZGxlIHRoYXQgYSBLbm93bldvcmxkIGdpdmVzIHRoZSBzYW1lIG1vbnN0ZXIsIG5vdCBpdHMgaW5kZXggaW4gYHN0YXRlLm1vbnN0ZXJzYCwgc28gYSBtb2QgYWxsb3dlZCB0byByZWFkIGdhbWUgc3RhdGUgZmluZHMgdGhlIGxpdmUgbW9uc3RlciBieSBpdHMgYGdyaWRgLiBUaGUgaG9vayBubyBsb25nZXIgZmlyZXMgZm9yIGEgbWltaWMgdGFrZW4gZm9yIGFuIG9iamVjdCBvciB3aGlsZSB0aGUgcGxheWVyIGhhbGx1Y2luYXRlcywgYW5kIGl0IG5vdyBmaXJlcyBmb3IgYSBtb25zdGVyIGRldGVjdGlvbiByZXZlYWxzLiBBIG1vbnN0ZXIgZmlyc3QgcGVyY2VpdmVkIGR1cmluZyBoYWxsdWNpbmF0aW9uIGlzIGFubm91bmNlZCB3aGVuIGl0IGNsZWFycywgZXZlbiBpZiB0aGUgbW9uc3RlciBzdGF5cyBzdGlsbC4gYHZpc2libGVgIHJlcG9ydHMgZXllc2lnaHQgc2VwYXJhdGVseSBmcm9tIHRlbGVwYXRoeSwgaW5jbHVkaW5nIGJsaW5kbmVzcywgaWxsdW1pbmF0aW9uLCBpbnZpc2liaWxpdHkgYW5kIGluZnJhdmlzaW9uLgoKVGhpcyBpcyBhIGJyZWFraW5nIGNoYW5nZSBpbnNpZGUgQVBJIDEuIGBNT0RfQVBJX1ZFUlNJT05gIGFuZCBgTU9EX0FQSV9NSU5gIGFyZSBib3RoIHN0aWxsIDEsIGFuZCB0aGUgaG9zdCBoYXMgbm8gcGF0aCB0aGF0IHBhc3NlcyB0aGUgb2xkIGFyZ3VtZW50cywgc28gbm8gbG9hZC10aW1lIGNoZWNrIHJlcG9ydHMgYSBwbHVnaW4gd3JpdHRlbiBmb3IgdGhlbTogaXQgbG9hZHMsIGFuZCBpdHMgaGFuZGxlciBnZXRzIHRoZSBuZXcgb25lcy4gQSByZWFkIHRoZSBuZXcgb2JqZWN0IGNhbm5vdCBhbnN3ZXIsIHN1Y2ggYXMgYG1vbi5yYWNlLm5hbWVgIG9yIGBtb24uaHBgLCBnaXZlcyBgdW5kZWZpbmVkYCB3aXRob3V0IGFuIGVycm9yLiBBIGhhbmRsZXIgdGhhdCByZWFkcyBhIHByb3BlcnR5IG9mIHRoZSBvbGQgc2Vjb25kIGFyZ3VtZW50LCBzdWNoIGFzIGBhcnRpZmFjdC5haWR4YCwgdGhyb3dzLCBiZWNhdXNlIHRoYXQgYXJndW1lbnQgaXMgbm93IGB1bmRlZmluZWRgLiBBIHRocm93IGZyb20gZWl0aGVyIGhvb2sgc3dpdGNoZXMgdGhhdCBob29rIG9mZiBmb3IgdGhlIHNlc3Npb24gYW5kIHN0b3BzIHNhdmluZywgYXMgYE1PRF9TRUFNUy5tZGAgZGVzY3JpYmVzLCBhbmQgaXQgY291bnRzIHRvd2FyZCB0aGUgdGhyZWUgZmFpbHVyZXMgdGhhdCBzd2l0Y2ggdGhlIHdob2xlIG1vZCBvZmYuIFRvIHBvcnQgYSBoYW5kbGVyLCByZWFkIGBtb24ucmFjZWAgd2hlcmUgaXQgcmVhZCBgbW9uLnJhY2UubmFtZWAsIGtlZXAgYG1vbi5ncmlkYCwgYW5kIHJlYWQgYG5hbWVgIGFuZCBgYXJ0aWZhY3RJbmRleGAgd2hlcmUgaXQgcmVhZCBgYXJ0aWZhY3QubmFtZWAgYW5kIGBhcnRpZmFjdC5haWR4YC4gQSBtb2QgYWxsb3dlZCB0byByZWFkIGdhbWUgc3RhdGUgY2FuIHN0aWxsIGZpbmQgdGhlIGxpdmUgbW9uc3RlciBieSBpdHMgYGlkYC4KCiMjIFdoYXQgaXMgKm5vdCogYSBjb21wYXRpYmlsaXR5IG1lY2hhbmlzbQoKLSAqKlNhdmUgZGF0YS4qKiBBIG1vZCdzIG93biBiYWcgaW4gdGhlIHBsYXllcidzIHNhdmUgaXMgbWlncmF0ZWQgYnkgdGhlIG1vZCwgdmlhCiAgYE1vZFBsdWdpbi5taWdyYXRlQmFnYCBhbmQgYHNhdmVTY2hlbWFgLiBDb3JlIHJvdW5kLXRyaXBzIHRoZSBiYWcgdmVyYmF0aW0gYW5kCiAgbmV2ZXIgcmVhZHMgaXQsIHNvIG9ubHkgdGhlIG1vZCBrbm93cyB3aGF0IGl0cyBvd24gZGF0YSBtZWFucy4KLSAqKkxvYWQgb3JkZXIuKiogTm90aGluZyBoZXJlIGNoYW5nZXMgd2hvIHdpbnMgYSBjb25mbGljdC4gVGhhdCBpcwogIE1PRF9MSUZFQ1lDTEUubWQgc2VjdGlvbiAzLCBhbmQgdGhlIGFuc3dlciBpcyBhbHdheXMgdGhlIG1vZCB0aGF0IGxvYWRzIGxhc3QuCgojIyBXaG8gZmluZHMgb3V0IGZpcnN0CgpUaGUgKiptb2QgY2FuYXJ5KiogKGAuZ2l0aHViL3dvcmtmbG93cy9tb2QtY2FuYXJ5LnltbGApIGNoZWNrcyB0aGUgUmVjb21tZW5kZWQgbW9kcyBsaXN0IGFnYWluc3QgdGhpcyBidWlsZCBkYWlseSBhbmQgd2hlbmV2ZXIgdGhlIGxpc3QgY2hhbmdlcy4gRXZlcnkgcmVwb3NpdG9yeSBpbiBgbW9kcy9yZWdpc3RyeS5qc29uYCwgY29tbXVuaXR5IG1vZHMgaW5jbHVkZWQsIGlzIGRpc2NvdmVyZWQgdGhlIHdheSB0aGUgZ2FtZSBkaXNjb3ZlcnMgaXQsIGFuZCBpdHMgbWFuaWZlc3QgZ29lcyB0aHJvdWdoIHRoZSBzYW1lIGNoZWNrcyB0aGlzIGJ1aWxkIGFwcGxpZXMgYXQgaW5zdGFsbCBhbmQgbG9hZCB0aW1lLiBBbiBlbmdpbmUgcmVsZWFzZSB0aGF0IHdvdWxkIHN0cmFuZCBhIGxpc3RlZCBtb2Qgc2hvd3MgdXAgaW4gdGhlIGNhbmFyeSByYXRoZXIgdGhhbiBpbiBhIHBsYXllcidzIGluc3RhbGwuIEl0IGRvZXMgdGhlIGpvYiBvZiBTTUFQSSdzIGNvbXBhdGliaWxpdHkgbGlzdCBhdXRvbWF0aWNhbGx5LCBhbmQgaXQgbGV0cyBhIHJlbGVhc2UgYmUgaGVsZCBiYWNrIGJlZm9yZSBpdCBzaGlwcy4KClRoYXQgY292ZXJzIGN1cmF0ZWQgbW9kcyBvbmx5LiBBIG1vZCBub2JvZHkgaGFzIGxpc3RlZCBmaW5kcyBvdXQgdGhlIHNhbWUgd2F5IGV2ZXJ5IG1vZCBhbHdheXMgaGFzLCB3aGljaCBpcyB3aHkgdGhlIGdhdGVzIGFib3ZlIGRlZ3JhZGUgaW5zdGVhZCBvZiByZWZ1c2luZy4KCiMjIFByaW9yIGFydCwgYW5kIHdoZXJlIHRoaXMgZGVsaWJlcmF0ZWx5IGRpZmZlcnMKCi0gKipbU01BUEldKGh0dHBzOi8vZ2l0aHViLmNvbS9QYXRob3NjaGlsZC9TTUFQSSkqKiAoU3RhcmRldyBWYWxsZXkpIGlzIHRoZSBtb2RlbAogIGZvciBtb3N0IG9mIHRoaXM6IGl0IHJld3JpdGVzIG1vZHMnIGNvbXBpbGVkIGNvZGUgZm9yIHJlbmFtZWQgbWVtYmVycywgZGV0ZWN0cwogIGFuIGluY29tcGF0aWJsZSBtb2QgYW5kIGRpc2FibGVzIGl0IHdpdGggYSBjbGVhciBtZXNzYWdlIHJhdGhlciB0aGFuIGxldHRpbmcgaXQKICBjcmFzaCB0aGUgZ2FtZSwgYW5kIHB1Ymxpc2hlcyBhIGxpdmUgY29tcGF0aWJpbGl0eSBsaXN0LiBUaGUgbGVzc29uIHRha2VuIGhlcmUKICBpcyB0aGUgKm9yZGVyaW5nKiAtIGRlZ3JhZGUsIHJlcG9ydCwgYW5kIG9ubHkgcmVmdXNlIHdoYXQgZ2VudWluZWx5IGNhbm5vdCBydW4uCiAgTm90IHRha2VuOiB0aGUgSUwgcmV3cml0aW5nLCB3aGljaCBoYXMgbm8gZXF1aXZhbGVudCBmb3IgYSBKYXZhU2NyaXB0IG1vZHVsZQogIGFuZCB3b3VsZCBiZSB0aGUgd3JvbmcgdG9vbCBhbnl3YXkuCi0gKipbRmFjdG9yaW9dKGh0dHBzOi8vbHVhLWFwaS5mYWN0b3Jpby5jb20vbGF0ZXN0L2F1eGlsaWFyeS9kYXRhLWxpZmVjeWNsZS5odG1sKSoqCiAgc3VwcGxpZXMgbWlncmF0aW9ucyBpbiB0d28gZmxhdm91cnMgLSBKU09OIHRvIHJlbmFtZSBhIHByb3RvdHlwZSwgTHVhIHRvIGZpeCB1cAogIGEgbG9hZGVkIHNhdmUgLSBhbmQgcmVtZW1iZXJzIHBlciBzYXZlIHdoaWNoIGhhdmUgcnVuLiBgbWlncmF0ZUJhZ2AgaXMgdGhlCiAgc2Vjb25kIG9mIHRob3NlLiBUaGUgZmlyc3QgaXMgdGhlIHNoYXBlIGEgY29yZS1zaWRlIHJlbmFtZSBhbGlhcyB3b3VsZCB0YWtlIGlmCiAgb25lIGlzIGV2ZXIgbmVlZGVkOyBub3RoaW5nIG5lZWRzIGl0IHlldCwgYmVjYXVzZSBjb3JlJ3MgcmVjb3JkIG5hbWVzIGFyZQogIHVwc3RyZWFtIEFuZ2JhbmQncyBhbmQgdGhlIHBhcml0eSBtYW5kYXRlIGtlZXBzIHRoZW0gc3RpbGwuCi0gKipOZW9Gb3JnZSBhbmQgRmFjdG9yaW8gYm90aCBibG9jayoqIG9uIGEgZGVjbGFyZWQgaW5jb21wYXRpYmlsaXR5LiBUaGlzIGVuZ2luZSBkb2VzIG5vdDogYW4gYXV0aG9yJ3MgZGVjbGFyYXRpb24gaXMgc2hvd24gd2l0aCB0aGVpciByZWFzb24gYW5kIG5ldmVyIG92ZXJyaWRlcyB0aGUgcGxheWVyJ3Mgc2V0dXAuCg=="
  }
];
var decoded;
function decodeUtf8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}
function sdkDocs() {
  if (decoded === void 0) {
    decoded = SDK_DOC_SOURCES.map(({ encoded, ...document }) => ({ ...document, text: decodeUtf8(encoded) }));
  }
  return decoded;
}

// src/ui/screens/docs.ts
function docsScreen(shop, selected) {
  const docs = sdkDocs();
  const document = docs.find((candidate) => candidate.id === selected) ?? docs[0];
  if (document === void 0) throw new Error("The embedded SDK docs are empty.");
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);
  const reader = codeEditor({
    doc: shop.doc,
    lang: "markdown",
    text: document.text,
    readOnly: true,
    onInput: () => void 0,
    onSave: () => void 0
  });
  main.append(
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "Neo Angband modding docs" }),
      h("p", {
        text: "ModForge tutorials and SDK references, bundled with this workshop. Pick a lesson on the right, or use the advanced references when you need the full contract behind a content file or plugin.js."
      })
    ),
    h(
      "div",
      { class: "mb-row-actions" },
      button({
        label: "Start with tutorial 1",
        kind: "primary",
        onClick: () => shop.acts.go({ at: "docs", doc: "tutorial-01" })
      }),
      button({ label: "Open plugin API", onClick: () => shop.acts.go({ at: "docs", doc: "plugins" }) })
    ),
    h("div", { class: "mb-filename", text: `${document.source === "local" ? "ModForge docs" : "SDK docs"} / ${document.path}` }),
    h("div", { class: "mb-why", text: "Read-only. Ctrl+F finds text in this document." }),
    reader.el
  );
  const beginner = asideSection("Beginner path", "8 lessons");
  beginner.body.append(
    h("p", {
      class: "mb-why",
      text: "Start with the two-file lesson, then take the tutorials in order."
    }),
    ...docs.filter((candidate) => candidate.audience === "beginner").map(
      (candidate) => listRow({
        badge: candidate.id.startsWith("tutorial-") ? candidate.id.slice(-2) : "+",
        name: candidate.title,
        meta: candidate.note,
        selected: candidate.id === selected,
        onClick: () => shop.acts.go({ at: "docs", doc: candidate.id })
      })
    )
  );
  const advanced = asideSection("Advanced reference");
  advanced.body.append(
    h("p", {
      class: "mb-why",
      text: "Guides for authoring and publishing, plus SDK contracts."
    }),
    ...docs.filter((candidate) => candidate.audience === "advanced").map(
      (candidate) => listRow({
        badge: "?",
        name: candidate.title,
        meta: candidate.note,
        selected: candidate.id === selected,
        onClick: () => shop.acts.go({ at: "docs", doc: candidate.id })
      })
    )
  );
  aside.append(beginner.el, advanced.el);
  return {
    el,
    update: () => void 0,
    keys(event) {
      return reader.keys(event);
    },
    dispose() {
      reader.dispose();
    }
  };
}

// src/model/lint.ts
var NOTHING = { findings: [], elsewhere: 0, checked: false };
function lintFile(api, draft, records, path, text) {
  const kind = classify(api, path);
  if (kind === "extra") {
    return { ...NOTHING, why: "This file is yours, so the workshop does not check what is in it." };
  }
  if (text.trim() === "" && kind === "manifest") {
    return { ...NOTHING, why: "There is no manifest here to check." };
  }
  let parsed;
  try {
    parsed = text.trim() === "" ? {} : JSON.parse(text);
  } catch {
    return { ...NOTHING, why: "Not valid JSON yet, so the checks below cannot run." };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ...NOTHING, why: "This file has to be a JSON object, written with { }." };
  }
  const candidate = writeFileText(api, draft, path, text);
  if (!candidate.ok) return { ...NOTHING, why: candidate.why };
  const index = jsonIndex(text);
  const body = parsed;
  const stem = path === MANIFEST ? "manifest" : path.slice(0, -".json".length);
  let findings;
  let elsewhere = 0;
  const refusals = [];
  try {
    const build = buildDraft(api, candidate.draft, records);
    findings = build.findings.filter((finding) => {
      const mine = finding.file === "-" || finding.file === stem || path === MANIFEST && finding.file === "manifest";
      if (!mine) elsewhere++;
      return mine;
    });
    if (path === MANIFEST) refusals.push(...build.problems);
    else elsewhere += build.problems.length;
  } catch (e) {
    return { ...NOTHING, why: `The workshop could not check this: ${e instanceof Error ? e.message : String(e)}` };
  }
  const out = findings.map((finding) => {
    const at = place(index, body, finding);
    const where = at === void 0 ? {} : positionAt(text, at);
    const row2 = {
      level: finding.level,
      rule: finding.rule,
      message: finding.message,
      ...finding.file === "-" ? { caveat: true } : {},
      ...where
    };
    return finding.field === void 0 ? { ...row2, record: finding.record } : { ...row2, record: finding.record, field: finding.field };
  });
  for (const problem of refusals) {
    out.push({ level: "error", rule: "project/refused", message: problem });
  }
  return { findings: sortLint(out), elsewhere, checked: true };
}
function sortLint(findings) {
  const order = { error: 0, warn: 1, hint: 2 };
  return [...findings].sort(
    (a, b) => Number(b.caveat ?? false) - Number(a.caveat ?? false) || (order[a.level] ?? 3) - (order[b.level] ?? 3) || (a.line ?? Number.MAX_SAFE_INTEGER) - (b.line ?? Number.MAX_SAFE_INTEGER) || (a.column ?? 0) - (b.column ?? 0) || a.rule.localeCompare(b.rule)
  );
}
function keyOf(path) {
  return path.join("\0");
}
function jsonIndex(text) {
  const tokens = tokenize("json", text);
  const out = /* @__PURE__ */ new Map();
  let at = 0;
  const isPunc = (ch) => {
    const token = tokens[at];
    return token !== void 0 && token.cls === "punc" && text.slice(token.at, token.to) === ch;
  };
  const value = (path) => {
    if (tokens[at] === void 0) return;
    if (isPunc("{")) {
      object(path);
      return;
    }
    if (isPunc("[")) {
      array(path);
      return;
    }
    at++;
  };
  const object = (path) => {
    at++;
    if (isPunc("}")) {
      at++;
      return;
    }
    for (; ; ) {
      const name = tokens[at];
      if (name === void 0 || name.cls !== "key" && name.cls !== "str") return;
      let key;
      try {
        key = JSON.parse(text.slice(name.at, name.to));
      } catch {
        return;
      }
      at++;
      if (!isPunc(":")) return;
      at++;
      const child = [...path, key];
      out.set(keyOf(child), name.at);
      value(child);
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("}")) at++;
      return;
    }
  };
  const array = (path) => {
    at++;
    if (isPunc("]")) {
      at++;
      return;
    }
    for (let n = 0; ; n++) {
      const token = tokens[at];
      if (token === void 0) return;
      const child = [...path, n];
      out.set(keyOf(child), token.at);
      value(child);
      if (isPunc(",")) {
        at++;
        continue;
      }
      if (isPunc("]")) at++;
      return;
    }
  };
  value([]);
  if (!out.has(keyOf([]))) out.set(keyOf([]), tokens[0]?.at ?? 0);
  return out;
}
function nearestOffset(index, path, floor) {
  for (let cut = path.length; cut >= floor; cut--) {
    const at = index.get(keyOf(path.slice(0, cut)));
    if (at !== void 0) return at;
  }
  return void 0;
}
var LABEL_KEYS = ["name", "code", "store", "type"];
function labelOf2(record) {
  for (const key of LABEL_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value !== "") return value;
  }
  return "(unnamed record)";
}
function fieldPath(field) {
  return field.split(".").map((part) => /^\d+$/.test(part) ? Number(part) : part);
}
function place(index, body, finding) {
  const anchor = recordAnchor(body, finding.record);
  if (anchor === void 0) {
    return finding.field === void 0 ? void 0 : nearestOffset(index, fieldPath(finding.field), 1);
  }
  const path = finding.field === void 0 ? anchor : [...anchor, ...fieldPath(finding.field)];
  return nearestOffset(index, path, anchor.length);
}
function recordAnchor(body, label) {
  const hits = [];
  const added = body["records"];
  if (Array.isArray(added)) {
    added.forEach((entry, n) => {
      if (isRecord3(entry) && labelOf2(entry) === label) hits.push(["records", n]);
    });
  }
  for (const key of ["replaces", "fieldPatches"]) {
    const group = body[key];
    if (!isRecord3(group)) continue;
    for (const [ref, entry] of Object.entries(group)) {
      if (ref === label || isRecord3(entry) && labelOf2(entry) === label) hits.push([key, ref]);
    }
  }
  const removed = body["removes"];
  if (Array.isArray(removed)) {
    removed.forEach((ref, n) => {
      if (ref === label) hits.push(["removes", n]);
    });
  }
  return hits.length === 1 ? hits[0] : void 0;
}
function isRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/ui/screens/files.ts
var PLUGIN_TEMPLATE = `/*
 * The entry point, written for mod API 1.
 *
 * No imports: a module loaded from a mod folder cannot resolve a package by name.
 * What the plugin works with arrives in the ctx argument the game passes in.
 */
export default {
  api: 1,

  hooks(ctx) {
    ctx.log?.("hello from a hand-written plugin");
    return {};
  },
};
`;
var PLUGIN_TEMPLATE_API2 = `/*
 * The entry point, written for mod API 2.
 *
 * Every call on mod answers with a result and never throws for a refusal. Check
 * ok, and read reason when it is false.
 */
export default {
  api: ">=2.0.0 <3.0.0",

  async start(mod) {
    const world = await mod.view.world();
    if (!world.ok) {
      mod.meta.log("no world to read yet: " + world.reason);
      return;
    }
    mod.meta.log("hello from a hand-written plugin");
  },

  stop() {},
};
`;
function filesScreen(shop, path, line) {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);
  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "This screen shows one mod's files, so open a mod first.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) })
      )
    );
    return { el, update: () => void 0, dispose: () => void 0 };
  }
  const list = h("div", { class: "mb-list" });
  const listSection = asideSection("The mod folder");
  const size = h("div", { class: "mb-why" });
  const newName = h("input", { type: "text", class: "mb-mono", placeholder: "lib/dice.js", spellcheck: false });
  const newProblem = h("div", { class: "mb-why" });
  const add = button({
    label: "Add it",
    tiny: true,
    tip: "Makes an empty file of your own in the mod folder. A path with a slash in it puts the file in a folder.",
    onClick: () => {
      shop.acts.createFile(newName.value.trim(), newName.value.trim() === PLUGIN ? PLUGIN_TEMPLATE_API2 : "");
      newName.value = "";
    }
  });
  const plugin = button({
    label: `Start a ${PLUGIN}`,
    tiny: true,
    tip: "Writes a working API 2 entry point with nothing in it yet, so a mod that runs code is one file away. The manifest gets the plugin facet and the API 2 range with it, since a mod that ships code without declaring it installs and then does nothing.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE_API2)
  });
  const pluginApi1 = button({
    label: `Start an API 1 ${PLUGIN}`,
    tiny: true,
    tip: "Writes an entry point for mod API 1 instead, and the manifest names the API 1 range. Use it for a mod that has to run on a game older than 1.23.0-beta.1.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE)
  });
  const apiNote = h(
    "div",
    { class: "mb-why" },
    "A new plugin.js is written for mod API 2, which the game runs from 1.23.0-beta.1 on. An API 1 script still loads, and is the choice for a mod that has to run on an older game."
  );
  const api2Docs = button({
    label: "Read about API 2",
    tiny: true,
    kind: "ghost",
    tip: "Open the SDK's API 2 reference: what it offers, and what an API 1 plugin has to change to use it.",
    onClick: () => shop.acts.go({ at: "docs", doc: "api2" })
  });
  const pluginDocs = button({
    label: "Read the plugin API",
    tiny: true,
    kind: "ghost",
    tip: "Open the SDK reference before you add behaviour to plugin.js.",
    onClick: () => shop.acts.go({ at: "docs", doc: "plugins" })
  });
  const searchAll = button({
    label: "Search every file",
    tiny: true,
    kind: "ghost",
    tip: "Look for a word or a name across every file this mod would write, not just the one open here.",
    onClick: () => shop.acts.go({ at: "search" })
  });
  const loadFile = h("input", { type: "file" });
  loadFile.addEventListener("change", () => {
    const picked = loadFile.files?.[0];
    if (!picked) return;
    const wanted = newName.value.trim() || picked.name;
    void picked.arrayBuffer().then((buffer) => {
      shop.acts.importFileBytes(wanted, new Uint8Array(buffer));
      loadFile.value = "";
      newName.value = "";
      newName.dispatchEvent(new Event("input"));
    });
  });
  const loadRow = h(
    "label",
    { class: "mb-why" },
    "Or load a file from disk, binary or text: ",
    loadFile
  );
  listSection.body.append(
    list,
    h("div", { class: "mb-ed-new" }, newName, add),
    newProblem,
    h("div", { class: "mb-row-actions" }, plugin, pluginDocs),
    h("div", { class: "mb-row-actions" }, pluginApi1, api2Docs),
    apiNote,
    loadRow,
    h("div", { class: "mb-row-actions" }, searchAll),
    size
  );
  aside.appendChild(listSection.el);
  newName.addEventListener("input", () => {
    const wanted = newName.value.trim();
    const current = openDraft(shop.store.get());
    const why = wanted === "" || !current ? void 0 : pathProblem(shop.api, current, wanted);
    const note = wanted === "" || why !== void 0 ? void 0 : pathNote(shop.api, wanted);
    setText(newProblem, why ?? note ?? "");
    newProblem.dataset["tone"] = why === void 0 ? "plain" : "bad";
    add.disabled = wanted === "" || why !== void 0;
  });
  add.disabled = true;
  const title = h("div", { class: "mb-filename" });
  const about = h("div", { class: "mb-why" });
  const dirty = h("span", { class: "mb-tag" });
  const caret = h("span", { class: "mb-ed-caret" });
  const save = button({ label: "Save into the mod", kind: "primary", tiny: true, onClick: () => shop.acts.saveFile(path) });
  const overwrite = button({
    label: "Save anyway",
    kind: "danger",
    tiny: true,
    tip: "Writes what is in the editor over whatever the mod now says for this file. It replaces the whole file, not the lines you changed.",
    onClick: () => shop.acts.saveFile(path, { force: true })
  });
  const revert = button({
    label: "Reload the file",
    tiny: true,
    tip: "Throws away what is in the editor and shows the file as the mod has it now.",
    onClick: () => shop.acts.revertFile(path)
  });
  const diff = button({
    label: "See the changes",
    tiny: true,
    kind: "ghost",
    tip: "Compares what is in the editor now against the mod's saved file, line by line.",
    onClick: () => shop.acts.go({ at: "diff", path })
  });
  const remove = button({
    label: "Delete",
    kind: "danger",
    tiny: true,
    tip: "Takes this file out of the mod. Undo brings it back.",
    onClick: () => shop.acts.deleteFile(path)
  });
  const setDeletable = (allowed) => {
    remove.disabled = !allowed;
    remove.dataset["tip"] = allowed ? "Takes this file out of the mod. Undo brings it back." : "Only a file of your own can be deleted here. The manifest and a record file are written from what the mod contains, so the way to empty one is to drop the changes behind it.";
  };
  const bar = h("div", { class: "mb-row-actions" }, save, overwrite, revert, diff, h("span", { class: "mb-spacer" }), caret, dirty, remove);
  const problems = h("div", { class: "mb-ed-problems" });
  const checkNote = h("div", { class: "mb-why" });
  let editor;
  const host = h("div");
  const goneRow = h(
    "div",
    { class: "mb-row-actions" },
    button({
      label: "Back to the file list",
      kind: "primary",
      onClick: () => shop.acts.go({ at: "files", path: "" })
    })
  );
  goneRow.style.display = "none";
  const binaryInfo = h("div", { class: "mb-why" });
  const binaryReplace = h("input", { type: "file" });
  binaryReplace.addEventListener("change", () => {
    const picked = binaryReplace.files?.[0];
    if (!picked) return;
    void picked.arrayBuffer().then((buffer) => {
      shop.acts.importFileBytes(path, new Uint8Array(buffer), { replace: true });
      binaryReplace.value = "";
    });
  });
  const binaryPanel = h(
    "div",
    { class: "mb-prose" },
    h("p", {
      text: "This file holds raw bytes, not text, so there is nothing here to type or colour in. Replacing it swaps the whole file for whatever the picked file contains."
    }),
    binaryInfo,
    h("label", { class: "mb-why" }, "Replace with a file from disk: ", binaryReplace)
  );
  const LINT_DELAY = 250;
  let lint;
  let lintKey = "";
  let lintTimer;
  const keyFor = (state) => `${state.revision}\0${state.buffers[path]?.text ?? ""}`;
  const scheduleLint = (state) => {
    if (path === "" || editor?.colouring() === false) return;
    const wanted = keyFor(state);
    if (wanted === lintKey) return;
    if (lintTimer !== void 0) clearTimeout(lintTimer);
    lintTimer = setTimeout(() => {
      lintTimer = void 0;
      const now = shop.store.get();
      const current = openDraft(now);
      const held = now.buffers[path];
      if (!current || held === void 0) return;
      lintKey = keyFor(now);
      lint = lintFile(shop.api, current, shop.records, path, held.text);
      render(now);
    }, LINT_DELAY);
  };
  if (path !== "") {
    const opened = shop.store.get().buffers[path];
    editor = codeEditor({
      doc: shop.doc,
      lang: languageFor(path),
      text: opened?.text ?? "",
      onInput: (text) => shop.acts.editFile(path, text),
      onSave: () => shop.acts.saveFile(path),
      onCaret: (line2, column) => setText(caret, `line ${line2}, column ${column}`),
      onSearchAll: () => shop.acts.go({ at: "search" })
    });
    host.appendChild(editor.el);
    main.append(title, about, goneRow, bar, host, binaryPanel, problems, checkNote);
  } else {
    main.append(
      h(
        "div",
        { class: "mb-prose" },
        h("h2", { text: "The mod, as files" }),
        h("p", {
          text: "This is the same mod the other screens edit, shown as the files the folder ships. Saving one puts what you wrote back into the mod, so a monster you added on the record screen is in monster.json, and a number you change here is the number that screen shows next time."
        }),
        h("p", {
          text: "Use it for what no screen offers: a script the game runs, a manifest key nothing asks you about, or a record file grouped into sections. Pick a file on the right, or add one of your own."
        }),
        h("p", {
          text: "Unsaved text lives only in this window. It is kept when you move between screens but lost when the game reloads, so save a file into the mod before you go anywhere."
        })
      )
    );
  }
  const render = (state) => {
    const current = openDraft(state);
    if (!current) return;
    const files = projectFiles(shop.api, current);
    const unchecked = unread(current);
    const uncheckedPaths = new Set(unchecked.map((entry) => entry.path));
    listSection.setCount(`${files.length}`);
    fillList(
      list,
      files.map((file2) => {
        const held2 = state.buffers[file2.path];
        const changed2 = held2 !== void 0 && !isBinary(file2.contents) && held2.text !== file2.contents;
        const tags = [];
        if (changed2) tags.push({ text: "unsaved", tone: "mod" });
        if (uncheckedPaths.has(file2.path)) tags.push({ text: "partly unread" });
        if (isCodePath(file2.path)) tags.push({ text: "code" });
        return listRow({
          badge: file2.kind === "extra" ? "+" : file2.kind === "manifest" ? "M" : "R",
          name: file2.path,
          meta: describe(file2.kind, file2.path),
          selected: file2.path === path,
          tags,
          onClick: () => shop.acts.openFile(file2.path)
        });
      }),
      empty("[ ]", "Nothing yet", "A mod with no changes writes only its manifest.")
    );
    const bytes = projectBytes(shop.api, current);
    setText(
      size,
      `${files.length} file${files.length === 1 ? "" : "s"}, ${Math.max(1, Math.round(bytes / 1024))}KB. Unfinished work is kept in a store this install shares with your saves, and the workshop uses at most ${Math.round(SIZE_CEILING / 1024)}KB of it, so if you paste in a large file, save the mod out as a zip.`
    );
    const refusal = sessionRefusal(current);
    if (path === "") {
      setText(checkNote, refusal ?? "");
      return;
    }
    const file = files.find((entry) => entry.path === path);
    if (file !== void 0 && isBinary(file.contents)) {
      host.style.display = "none";
      binaryPanel.style.display = "";
      problems.style.display = "none";
      setText(title, path);
      setText(binaryInfo, `${file.contents.length} byte${file.contents.length === 1 ? "" : "s"} loaded from disk.`);
      const notes2 = ["Your own file. It goes into the mod folder byte for byte as it is here, and nothing rewrites it."];
      if (refusal !== void 0) notes2.push(refusal);
      setText(about, notes2.join(" "));
      setText(dirty, "saved");
      dirty.dataset["tone"] = "";
      save.disabled = true;
      revert.disabled = true;
      diff.disabled = true;
      overwrite.disabled = true;
      overwrite.style.display = "none";
      setDeletable(classify(shop.api, path) === "extra");
      setText(checkNote, "This is not text, so there is nothing here for the record checks to read.");
      return;
    }
    host.style.display = "";
    binaryPanel.style.display = "none";
    problems.style.display = "";
    const held = state.buffers[path];
    if (file === void 0 || held === void 0) {
      setText(title, path);
      setText(about, "That file is not in the mod any more, so there is nothing here to edit or save.");
      save.disabled = true;
      overwrite.disabled = true;
      revert.disabled = true;
      diff.disabled = true;
      setDeletable(false);
      goneRow.style.display = "";
      bar.style.display = "none";
      host.style.display = "none";
      problems.style.display = "none";
      setText(checkNote, "");
      return;
    }
    goneRow.style.display = "none";
    bar.style.display = "";
    setText(title, path);
    const stale = file.contents !== held.from;
    const changed = held.text !== file.contents;
    setText(dirty, changed ? "unsaved" : "saved");
    dirty.dataset["tone"] = changed ? "mod" : "";
    save.disabled = !changed;
    revert.disabled = !changed;
    diff.disabled = !changed;
    setDeletable(classify(shop.api, path) === "extra");
    overwrite.style.display = stale ? "" : "none";
    const notes = [aboutKind(classify(shop.api, path), path)];
    if (stale) {
      notes.push(
        "This file has changed in the mod since it was opened here, so saving normally is refused. Save anyway replaces the whole file with what is in the editor; reloading starts again from what the mod now says."
      );
    }
    const note = pathNote(shop.api, path);
    if (note !== void 0) notes.push(note);
    const spare = unchecked.find((entry) => entry.path === path);
    if (spare !== void 0) {
      notes.push(
        `This file carries ${spare.keys.join(", ")}, which the workshop passes through without reading. It ships exactly as typed, and nothing on the review screen has checked it.`
      );
    }
    if (refusal !== void 0) notes.push(refusal);
    setText(about, notes.join(" "));
    const lang = languageFor(path);
    const found = editor?.colouring() === false ? [] : problemsIn(lang, held.text);
    scheduleLint(state);
    const settled = lintKey === keyFor(state);
    const checks = lint?.findings ?? [];
    fill(
      problems,
      ...found.map((problem) => problemRow(problem, () => editor?.goTo(problem.line, problem.column))),
      ...checks.map(
        (finding) => findingRow(finding, () => editor?.goTo(finding.line ?? 1, finding.column ?? 1))
      )
    );
    setText(checkNote, checkedHow(lang, found.length, editor?.colouring() !== false, lint, settled));
  };
  render(shop.store.get());
  const openedFile = path === "" ? void 0 : projectFiles(shop.api, draft).find((entry) => entry.path === path);
  if (openedFile === void 0 || !isBinary(openedFile.contents)) editor?.focus();
  if (line !== void 0) editor?.goTo(line);
  return {
    el,
    update(next, prev) {
      const held = next.buffers[path];
      if (editor !== void 0 && held !== void 0 && held.text !== editor.text()) editor.setText(held.text);
      if (next.drafts !== prev.drafts || next.buffers !== prev.buffers || next.openId !== prev.openId) render(next);
    },
    keys(event) {
      return editor?.keys(event) === true;
    },
    dispose() {
      if (lintTimer !== void 0) clearTimeout(lintTimer);
      editor?.dispose();
    }
  };
}
function describe(kind, path) {
  if (kind === "manifest") return "what the game reads first";
  if (kind === "records") return `what this mod does to ${path.slice(0, -".json".length)} records`;
  return "yours, shipped as typed";
}
function aboutKind(kind, path) {
  switch (kind) {
    case "manifest":
      return "The manifest. Saving it puts the fields the details screen shows back into the mod and keeps every other key exactly as typed, so capabilities, rules and anything else the game understands stay in place. The id cannot be changed here, because the game treats a renamed mod as a different mod.";
    case "records":
      return `Written from what the mod does to ${path.slice(0, -".json".length)} records. Saving it parses the contributions back into the mod, so the record screens show what you typed here.`;
    default:
      return "Your own file. It goes into the mod folder exactly as it is here, and nothing rewrites it.";
  }
}
function checkedHow(lang, found, colouring, lint, settled) {
  if (!colouring) {
    return "This file is too big to colour in or check, so it is shown as plain text. It still saves and ships exactly as it is.";
  }
  if (lang === "json") {
    const parser = found === 0 ? "Valid JSON, checked with the same parser the game uses." : "The game reads this file with the same parser, so it will not load until this is fixed.";
    return `${parser} ${checkedFurther(lint, settled)}`.trim();
  }
  if (lang === "js") {
    return "Only quotes, comments and brackets are checked. There is no syntax check and no compiler in a browser, so code that passes here can still be wrong, and the game reports a script it cannot import as a mod that is not working. This check cannot see a mistake inside a template's ${ }, a slash that starts a pattern where it looks like a division, or code that is spelled correctly but means nothing.";
  }
  return "Nothing here to check.";
}
function checkedFurther(lint, settled) {
  if (lint === void 0) return "The record checks have not run over this yet.";
  if (!lint.checked) return lint.why ?? "";
  const parts = [];
  const about = lint.findings.filter((finding) => finding.caveat !== true);
  const standIn = lint.findings.some((finding) => finding.caveat === true);
  const whose = standIn ? "the record checks" : "the game's own record checker";
  parts.push(
    about.length === 0 ? `${standIn ? "The record checks have" : "The game's own record checker has"} nothing to say about this file.` : `${about.length} thing${about.length === 1 ? "" : "s"} ${whose} found here, the same findings the record screens show. Click one to go to it.`
  );
  if (!settled) parts.push("Checking what you have just typed.");
  if (lint.elsewhere > 0) {
    parts.push(
      `${lint.elsewhere} finding${lint.elsewhere === 1 ? "" : "s"} elsewhere in this mod, on the review screen.`
    );
  }
  return parts.join(" ");
}

// src/ui/screens/kinds.ts
function kindsScreen(shop) {
  const kinds = contentKinds(shop.api);
  const featured = kinds.filter((k) => k.featured);
  const rest = kinds.filter((k) => !k.featured);
  const grid = h("div", { class: "mb-kinds" });
  const restGrid = h("div", { class: "mb-kinds" });
  const search = searchBox("filter every kind", (value) => shop.acts.setFilter(value));
  const kindCard = (kind) => h(
    "div",
    { class: "mb-kind" },
    h("span", { class: "mb-kind-badge", text: kind.badge }),
    h(
      "span",
      null,
      h("span", { class: "mb-kind-title", text: kind.title }),
      h("div", { class: "mb-kind-blurb", text: kind.blurb }),
      h(
        "div",
        { class: "mb-row-actions", style: { "margin-top": "8px" } },
        button({
          label: "Make a new one",
          tiny: true,
          kind: "primary",
          onClick: () => shop.acts.go({ at: "base", file: kind.file, mode: "new" }),
          tip: "You will pick something that already exists to base it on, and the workshop will fill it in from that."
        }),
        button({
          label: "Change one",
          tiny: true,
          onClick: () => shop.acts.go({ at: "base", file: kind.file, mode: "change" }),
          tip: "Adjust a record the base game or another mod already owns. Your mod ships the difference, not the record."
        }),
        button({
          label: "Retune many",
          tiny: true,
          kind: "ghost",
          onClick: () => shop.acts.go({ at: "rebalance", file: kind.file }),
          tip: "One numeric adjustment applied to every record you filter down to."
        })
      ),
      h("div", { class: "mb-label-meta", style: { "margin-top": "6px" }, text: `${kind.file}.json` })
    )
  );
  const everything = card({
    title: "Everything else",
    note: `${rest.length} more record file${rest.length === 1 ? "" : "s"} the game composes one record at a time`,
    open: false,
    onToggle: () => everything.setOpen(everything.el.dataset["open"] !== "1")
  });
  everything.body.append(
    h("div", {
      class: "mb-why",
      text: "These work exactly like the ones above. They sit down here only because a first mod is rarely a pain message or a room template."
    }),
    search,
    restGrid
  );
  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "What are you making?" }),
      h("p", {
        text: "Every one of these is a file the game reads at startup, and a mod contributes to one by adding records to it or by adjusting records already in it."
      })
    ),
    grid,
    everything.el
  );
  for (const kind of featured) grid.appendChild(kindCard(kind));
  const clearFilter = () => {
    search.value = "";
    shop.acts.setFilter("");
  };
  const renderRest = (filter) => {
    const needle = filter.trim().toLowerCase();
    const shown = needle === "" ? rest : rest.filter((k) => k.file.includes(needle) || k.title.toLowerCase().includes(needle));
    restGrid.replaceChildren(
      ...shown.length === 0 ? [
        empty(
          "?",
          "Nothing matches",
          "No record file has that in its name. The four above are not in this list.",
          button({ label: "Clear the filter", kind: "primary", onClick: clearFilter })
        )
      ] : shown.map(kindCard)
    );
  };
  renderRest("");
  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) renderRest(next.filter);
    },
    dispose: () => void 0
  };
}

// src/ui/screens/mods.ts
function modsScreen(shop) {
  const list = h("div", { class: "mb-list" });
  const idBox = h("input", { type: "text", class: "mb-mono", placeholder: "an id, like my-first-mod", spellcheck: false });
  const idProblem = h("div", { class: "mb-why" });
  const create = button({
    label: "Start a new mod",
    kind: "primary",
    onClick: () => {
      const id = idBox.value.trim();
      const problem = shop.acts.idProblem(id);
      if (problem !== void 0) {
        idProblem.textContent = problem;
        idBox.setAttribute("aria-invalid", "true");
        return;
      }
      idBox.value = "";
      idProblem.textContent = "";
      idBox.removeAttribute("aria-invalid");
      shop.acts.createMod(id);
    }
  });
  idBox.addEventListener("input", () => {
    idProblem.textContent = "";
    idBox.removeAttribute("aria-invalid");
  });
  idBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) create.click();
  });
  const startCard = card({ title: "Start something", open: true });
  startCard.body.appendChild(
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "id" }),
        h("span", { class: "mb-label-meta", text: "lower case, hyphens" })
      ),
      h(
        "div",
        { class: "mb-control" },
        h("div", { class: "mb-control-line" }, idBox, create),
        h("div", {
          class: "mb-why",
          text: "This is the mod's name to the game and to every other mod. It cannot be changed later without the game treating the result as a different mod, so it is worth a moment."
        }),
        idProblem
      )
    )
  );
  const fork = forkCard(shop);
  const unfinishedCard = card({
    title: "Unfinished",
    note: "kept in this install's settings, not in any character's save",
    tip: "Unfinished work does not live in a file. Its store can run out of room without warning, so the workshop checks every write, and a finished mod saved as a file is the only copy you can rely on.",
    open: true
  });
  unfinishedCard.body.appendChild(list);
  const el = h("div", { class: "mb-main" }, startCard.el, fork.el, unfinishedCard.el);
  let lastDrafts;
  const render = (state) => {
    const drafts = Object.values(state.drafts).sort((a, b) => b.touched.localeCompare(a.touched));
    const rows = drafts.map((draft) => {
      const size = draftSize(draft);
      const parts = [];
      if (size.added > 0) parts.push(`${size.added} new`);
      if (size.patched > 0) parts.push(`${size.patched} adjusted`);
      if (size.removed > 0) parts.push(`${size.removed} removed`);
      const row2 = listRow({
        badge: draft.id.charAt(0).toUpperCase(),
        name: `${draft.name} ${draft.version}`,
        meta: parts.length === 0 ? "nothing in it yet" : parts.join(", "),
        tags: [{ text: draft.id, tone: "mine" }],
        selected: state.openId === draft.id,
        onClick: () => shop.acts.openMod(draft.id)
      });
      const acts = row2.querySelector(".mb-row-acts");
      acts?.appendChild(
        button({
          label: "Delete",
          tiny: true,
          kind: "danger",
          tip: "Throw this unfinished mod away. Anything already installed is untouched.",
          onClick: () => {
            shop.acts.deleteMod(draft.id);
            shop.acts.notice(`${draft.id} is gone. Undo brings it back.`, "plain");
          }
        })
      );
      return row2;
    });
    fillList(
      list,
      rows,
      empty(
        "[ ]",
        "Nothing here yet",
        "A mod starts with an id, and the workshop takes it from there.",
        button({
          label: "Name one now",
          kind: "primary",
          tip: "Puts the cursor in the id field above. An id is all a mod needs to exist.",
          onClick: () => idBox.focus()
        })
      )
    );
  };
  render(shop.store.get());
  lastDrafts = shop.store.get().drafts;
  return {
    el,
    update(next) {
      if (next.drafts !== lastDrafts || next.openId !== void 0) {
        lastDrafts = next.drafts;
        render(next);
      }
    },
    dispose: () => void 0
  };
}
function forkCard(shop) {
  const idBox = h("input", { type: "text", class: "mb-mono", placeholder: "an id, like my-own-qol", spellcheck: false });
  const problem = h("div", { class: "mb-why" });
  const notes = h("div", { class: "mb-fork-notes" });
  const list = h("div", { class: "mb-list" });
  const clearProblem = () => {
    setText(problem, "");
    idBox.removeAttribute("aria-invalid");
  };
  idBox.addEventListener("input", clearProblem);
  const refuse = (why) => {
    setText(problem, why);
    idBox.setAttribute("aria-invalid", "true");
  };
  const take = (run) => {
    const id = idBox.value.trim();
    const why = shop.acts.idProblem(id);
    if (why !== void 0) {
      refuse(why);
      fill(notes);
      return;
    }
    clearProblem();
    void Promise.resolve(run(id)).then((outcome) => {
      if (!outcome.ok) {
        refuse(outcome.why);
        fill(notes);
        return;
      }
      idBox.value = "";
      fill(
        notes,
        h("div", { class: "mb-why", text: `${id} is in the workshop. What the fork did and did not carry:` }),
        ...outcome.notes.map((note) => h("div", { class: "mb-why", text: note })),
        h(
          "div",
          { class: "mb-row-actions" },
          button({ label: `Open ${id}`, kind: "primary", onClick: () => shop.acts.openMod(id) })
        )
      );
    });
  };
  const readPicked = async (picked) => Promise.all(
    picked.map(async (file) => ({
      /* `webkitRelativePath` is how a directory pick reports where a file sat
       * inside the folder that was chosen, and it is empty for a single file. */
      path: file.webkitRelativePath === "" ? file.name : file.webkitRelativePath,
      contents: new Uint8Array(await file.arrayBuffer())
    }))
  );
  const folderInput = h("input", { type: "file" });
  folderInput.setAttribute("webkitdirectory", "");
  folderInput.setAttribute("multiple", "");
  folderInput.addEventListener("change", () => {
    const picked = [...folderInput.files ?? []];
    if (picked.length === 0) return;
    folderInput.value = "";
    take(async (id) => shop.acts.forkFolder(await readPicked(picked), id));
  });
  const zipInput = h("input", { type: "file" });
  zipInput.addEventListener("change", () => {
    const picked = zipInput.files?.[0];
    if (!picked) return;
    zipInput.value = "";
    take(async (id) => {
      const size = zipSizeCheck(picked.size);
      if (!size.ok) return size;
      return shop.acts.forkZip(new Uint8Array(await picked.arrayBuffer()), id);
    });
  });
  const forkCardEl = card({
    title: "Fork one that exists",
    note: "a copy of somebody's mod, as a mod of your own",
    tip: "A fork owns its content outright. The records become yours, with your id on them, and the mod you took them from does not have to be installed for yours to work. Adjusting somebody's record is different: it ships only the difference and leaves the record theirs.",
    open: true
  });
  forkCardEl.body.append(
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "id" }),
        h("span", { class: "mb-label-meta", text: "the fork's own" })
      ),
      h(
        "div",
        { class: "mb-control" },
        idBox,
        h("div", {
          class: "mb-why",
          text: "A fork needs an id of its own before it can be taken. The game identifies a mod by its id, so a fork that kept the original's would install over it rather than beside it."
        }),
        problem
      )
    ),
    h("div", { class: "mb-why", text: "A mod in this game:" }),
    list,
    h("label", { class: "mb-why" }, "A mod folder on disk: ", folderInput),
    h("label", { class: "mb-why" }, "Or a mod saved as a zip: ", zipInput),
    h("div", {
      class: "mb-why",
      text: "A mod at a repository address cannot be forked from here. Only the game resolves a repository address (it picks the tag, reads the manifest and decides which files are the mod), and mods have no access to that step, so a copy of it here could accept mods the game's installer refuses. Install the mod first and fork it from the list above, or download its folder and pick it."
    }),
    notes
  );
  const listMods = () => {
    const mods = shop.acts.installedMods();
    fillList(
      list,
      mods.map((mod) => {
        const parts = [];
        if (mod.adds > 0) parts.push(`${mod.adds} of its own`);
        if (mod.adjusts > 0) parts.push(`${mod.adjusts} adjusted`);
        if (mod.shared > 0) parts.push(`${mod.shared} shared with another mod`);
        const row2 = listRow({
          badge: mod.id.charAt(0).toUpperCase(),
          name: mod.id,
          meta: parts.length === 0 ? "nothing a fork could take" : parts.join(", "),
          onClick: () => take((id) => shop.acts.forkInstalled(mod.id, id))
        });
        const act = button({
          label: "Fork it",
          tiny: true,
          tip: `Take ${mod.id}'s content as a mod of your own. Its manifest is not readable from here, so the name and the licence do not come with it.`,
          onClick: () => take((id) => shop.acts.forkInstalled(mod.id, id))
        });
        act.addEventListener("click", (event) => event.stopPropagation());
        row2.querySelector(".mb-row-acts")?.appendChild(act);
        return row2;
      }),
      h("div", {
        class: "mb-why",
        text: "No mod in this game has content of its own to fork. Only what a mod adds or adjusts is visible here, and the base game is not a mod."
      })
    );
  };
  listMods();
  return { el: forkCardEl.el };
}

// src/ui/screens/rebalance.ts
function rebalanceScreen(shop, file) {
  const kind = kindFor(shop.api, file);
  const all = shop.records[file] ?? [];
  const numeric = numericFields(all);
  const search = searchBox(
    `filter ${all.length} record${all.length === 1 ? "" : "s"}`,
    (value) => shop.acts.setFilter(value)
  );
  const fieldPick = h(
    "select",
    null,
    ...numeric.map((field) => h("option", { value: field, text: field }))
  );
  const opPick = h(
    "select",
    null,
    h("option", { value: "add", text: "add" }),
    h("option", { value: "mul", text: "multiply by" })
  );
  const amount = h("input", { type: "text", class: "mb-mono", value: "1" });
  const preview = h("div", { class: "mb-scrollx" });
  const summary = h("div", { class: "mb-why" });
  const apply2 = button({
    label: "Apply to all of them",
    kind: "primary",
    onClick: () => {
      const matched = matches(shop.store.get());
      const field = fieldPick.value;
      const value = Number(amount.value);
      if (!Number.isFinite(value)) {
        shop.acts.notice("That is not a number.", "bad");
        return;
      }
      const refs = [];
      for (const record of matched) {
        const key = shop.api.recordKey(file, record);
        if (key === null) continue;
        refs.push(`${ownerOf(shop.api, record)}:${key}`);
      }
      shop.acts.rebalance(file, refs, field, opPick.value === "mul" ? "mul" : "add", value);
      shop.acts.go({ at: "details" });
    }
  });
  const controls = card({ title: "The adjustment", open: true });
  controls.body.append(
    h(
      "div",
      { class: "mb-field" },
      h("label", { class: "mb-label" }, h("span", { class: "mb-label-name", text: "field" })),
      h("div", { class: "mb-control" }, fieldPick)
    ),
    h(
      "div",
      { class: "mb-field" },
      h(
        "label",
        { class: "mb-label" },
        h("span", { class: "mb-label-name", text: "change" }),
        h("span", { class: "mb-label-meta", text: "not a fixed value" })
      ),
      h(
        "div",
        { class: "mb-control" },
        h("div", { class: "mb-control-line" }, opPick, amount),
        h("div", {
          class: "mb-why",
          text: "Both write the adjustment itself into your mod, so it keeps doing what you meant after a game update retunes the numbers or another mod has already changed one of them."
        })
      )
    )
  );
  const previewCard = card({ title: "What that does", open: true });
  previewCard.body.append(summary, preview);
  const el = h(
    "div",
    { class: "mb-main" },
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: `Retune ${kind.title.toLowerCase()}` }),
      h("p", {
        text: "Filter the list down to the records you mean, choose one number and one adjustment, and every record that matched gets its own entry in your mod."
      })
    ),
    numeric.length === 0 ? empty(
      "?",
      "Nothing to retune here",
      emptyRetuneMessage(shop, file),
      button({
        label: "Choose another kind",
        kind: "primary",
        onClick: () => shop.acts.go({ at: "kinds" })
      })
    ) : h("div", null, search, controls.el, previewCard.el, h("div", { class: "mb-row-actions" }, apply2))
  );
  function matches(state) {
    const needle = state.filter.trim().toLowerCase();
    const field = fieldPick.value;
    return all.filter(
      (record) => typeof valueAt2(record, field) === "number" && (needle === "" || labelOf(shop.api, file, record).toLowerCase().includes(needle))
    );
  }
  const render = (state) => {
    if (numeric.length === 0) return;
    const field = fieldPick.value;
    const value = Number(amount.value);
    const op = opPick.value;
    const matched = matches(state);
    apply2.disabled = matched.length === 0 || !Number.isFinite(value);
    summary.textContent = matched.length === 0 ? "" : `${matched.length} record${matched.length === 1 ? "" : "s"} would get one entry each.`;
    if (matched.length === 0) {
      preview.replaceChildren(
        empty(
          "?",
          "Nothing matches",
          `No ${file} record has that in its name and a number in ${fieldPick.value}.`,
          button({
            label: "Clear the filter",
            kind: "primary",
            onClick: () => {
              search.value = "";
              shop.acts.setFilter("");
            }
          })
        )
      );
      return;
    }
    preview.replaceChildren(
      h(
        "table",
        { class: "mb-peers" },
        h("thead", null, h("tr", null, h("th", { text: "record" }), h("th", { text: field }), h("th", { text: "becomes" }))),
        h(
          "tbody",
          null,
          ...matched.slice(0, 25).map((record) => {
            const was = valueAt2(record, field);
            const now = typeof was === "number" && Number.isFinite(value) ? op === "mul" ? was * value : was + value : was;
            return h(
              "tr",
              null,
              h("td", { text: labelOf(shop.api, file, record) }),
              h("td", { class: "mb-num", text: String(was) }),
              h("td", { class: "mb-num mb-focus-cell", text: typeof now === "number" ? String(round(now)) : "" })
            );
          })
        )
      )
    );
  };
  fieldPick.addEventListener("change", () => render(shop.store.get()));
  opPick.addEventListener("change", () => render(shop.store.get()));
  amount.addEventListener("input", () => render(shop.store.get()));
  render(shop.store.get());
  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) render(next);
    },
    dispose: () => void 0
  };
}
function numericFields(records) {
  const counts = /* @__PURE__ */ new Map();
  for (const record of records) {
    for (const path of numericPaths(record)) counts.set(path, (counts.get(path) ?? 0) + 1);
  }
  const floor = Math.max(1, records.length / 4);
  return [...counts.entries()].filter(([, count]) => count >= floor).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([key]) => key);
}
function numericPaths(record) {
  const out = [];
  const visit = (value, path) => {
    if (typeof value === "number") {
      if (path !== "") out.push(path);
      return;
    }
    if (typeof value !== "object" || value === null || Array.isArray(value)) return;
    for (const [key, child] of Object.entries(value)) {
      visit(child, path === "" ? key : `${path}.${key}`);
    }
  };
  visit(record, "");
  return out;
}
function emptyRetuneMessage(shop, file) {
  const alternatives = contentKinds(shop.api).filter((kind) => kind.file !== file && numericFields(shop.records[kind.file] ?? []).length > 0).slice(0, 3).map((kind) => kind.title);
  if (alternatives.length === 0) {
    return `No numeric field appears often enough across the loaded ${file} records. Choose another kind to keep going.`;
  }
  return `No numeric field appears often enough across the loaded ${file} records. Try ${joinAlternatives(alternatives)}, or choose another kind.`;
}
function joinAlternatives(values) {
  if (values.length === 1) return values[0] ?? "another kind";
  if (values.length === 2) return `${values[0]} or ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, or ${values[values.length - 1]}`;
}
function round(value) {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}

// src/ui/field-editor.ts
function fieldRow(initial, on) {
  const labelName = h("span", { class: "mb-label-name", text: initial.label });
  const labelMeta = h("span", { class: "mb-label-meta" });
  const marks = h("span", { class: "mb-row-acts" });
  const label = h("label", { class: "mb-label" }, labelName, labelMeta);
  const line = h("div", { class: "mb-control-line" });
  const why = h("div", { class: "mb-why" });
  const control = h("div", { class: "mb-control" }, line, why);
  const el = h("div", { class: "mb-field", data: { path: initial.path } }, label, control);
  el.addEventListener("focusin", () => on.focus(initial.path));
  let kind;
  let scalar;
  const rebuild = (input, value, next) => {
    scalar = void 0;
    switch (next) {
      case "number": {
        const box = h("input", { type: "text", class: "mb-mono", value: String(value ?? "") });
        box.addEventListener("input", () => {
          const text = box.value.trim();
          if (text === "") {
            box.removeAttribute("aria-invalid");
            return;
          }
          const parsed = Number(text);
          if (Number.isFinite(parsed)) {
            box.removeAttribute("aria-invalid");
            on.set(input.path, parsed);
          } else {
            box.setAttribute("aria-invalid", "true");
          }
        });
        scalar = box;
        fill(
          line,
          box,
          button({ label: "-1", tiny: true, tip: nudgeTip(-1), onClick: () => on.nudge(input.path, -1) }),
          button({ label: "+1", tiny: true, tip: nudgeTip(1), onClick: () => on.nudge(input.path, 1) }),
          rangeNote(input.shape),
          marks
        );
        return;
      }
      case "boolean": {
        const box = h("input", { type: "checkbox", checked: value === true });
        box.addEventListener("change", () => on.set(input.path, box.checked));
        fill(line, h("label", { class: "mb-switch" }, box, h("span", { text: value === true ? "yes" : "no" })), marks);
        return;
      }
      case "flags": {
        fill(line, flagEditor(input.path, value ?? [], input.shape, on), marks);
        return;
      }
      case "rows": {
        fill(line, rowsEditor(input.path, value ?? [], on), marks);
        return;
      }
      case "list":
      case "object": {
        fill(
          line,
          h("span", { class: "mb-row-summary", text: summarize(value) }),
          button({ label: "Open", tiny: true, onClick: () => on.drill(input.path) }),
          button({ label: "Clear", tiny: true, kind: "ghost", onClick: () => on.clear(input.path) }),
          marks
        );
        return;
      }
      case "empty": {
        fill(
          line,
          h("span", { class: "mb-row-summary", text: "nothing yet" }),
          ...seedButtons(input, on),
          marks
        );
        return;
      }
      default: {
        const long = typeof value === "string" && (value.length > 60 || value.includes("\n"));
        const box = long ? h("textarea", { rows: 3, value: String(value ?? "") }) : h("input", { type: "text", value: String(value ?? "") });
        box.addEventListener("input", () => on.set(input.path, box.value));
        scalar = box;
        fill(line, box, marks);
        return;
      }
    }
  };
  const update = (input) => {
    const value = valueAt2(input.record, input.path);
    const next = kindOf(value);
    setText(labelName, input.label);
    setText(labelMeta, meta(input));
    el.dataset["focused"] = input.focused ? "1" : "0";
    if (next !== kind) {
      kind = next;
      rebuild(input, value, next);
    } else if (scalar) {
      const text = value === void 0 || value === null ? "" : String(value);
      if (scalar.value !== text && scalar !== scalar.ownerDocument.activeElement) scalar.value = text;
    } else {
      rebuild(input, value, next);
    }
    fill(marks, ...input.findings.slice(0, 3).map(markFor));
    setWhy(why, input, on);
  };
  update(initial);
  return { el, path: initial.path, update };
}
function nudgeTip(delta) {
  return `${delta > 0 ? "Add one to" : "Take one from"} whatever this number currently is, rather than writing a fixed value over it. That still does the right thing after the base game retunes it, and after another mod adjusts it.`;
}
function rangeNote(shape) {
  if (!shape?.range) return null;
  return h("span", {
    class: "mb-label-meta",
    text: `${shape.range.min} to ${shape.range.max}, usually ${shape.range.median}`,
    tip: "The smallest, the largest and the middle value this field takes across the game's own records in this file."
  });
}
function meta(input) {
  const parts = [];
  if (input.shape) parts.push(input.shape.types.join(" or "));
  if (input.share !== void 0) {
    if (input.share >= 1) parts.push("on every record");
    else if (input.share > 0) parts.push(`on ${Math.round(input.share * 100)}%`);
  }
  return parts.join(" - ");
}
function markFor(finding) {
  const glyph = finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i";
  return h("span", { class: "mb-mark", data: { level: finding.level }, text: glyph, tip: finding.message });
}
function setWhy(why, input, on) {
  const suggestion = input.suggestion;
  if (!suggestion || !input.pristine) {
    fill(why);
    why.style.display = "none";
    return;
  }
  why.style.display = "";
  fill(
    why,
    "Suggested ",
    h("b", { text: JSON.stringify(suggestion.value) }),
    ", because ",
    suggestion.because,
    ". ",
    button({
      label: "Use it",
      tiny: true,
      onClick: () => on.set(input.path, suggestion.value),
      tip: "Write the suggested value here. It comes from the game's own records and is only a starting point."
    })
  );
}
function seedButtons(input, on) {
  const types = input.shape?.types ?? [];
  const seeds = [];
  if (types.includes("string") || types.length === 0) seeds.push(["text", ""]);
  if (types.includes("number") || types.length === 0) seeds.push(["a number", input.shape?.range?.median ?? 0]);
  if (types.includes("array") || types.length === 0) seeds.push(["a list", []]);
  if (types.includes("object") || types.length === 0) seeds.push(["a group", {}]);
  if (types.includes("boolean")) seeds.push(["yes or no", false]);
  return seeds.map(
    ([label, value]) => button({ label: `Set ${label}`, tiny: true, kind: "ghost", onClick: () => on.set(input.path, value) })
  );
}
function flagEditor(path, flags, shape, on) {
  const chips = flags.map(
    (flag, index) => h(
      "span",
      { class: "mb-chip" },
      h("span", { text: flag }),
      h("button", {
        type: "button",
        text: "x",
        aria: { label: `remove ${flag}` },
        on: { click: () => on.flag(path, flag, false) }
      })
    )
  );
  const box = h("input", {
    type: "text",
    class: "mb-mono",
    placeholder: "add one",
    spellcheck: false,
    tip: "Adding to a list of names composes: another mod adding a different one keeps its change and you keep yours, and neither is reported as a conflict."
  });
  box.style.maxWidth = "150px";
  box.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    const value = box.value.trim();
    if (value === "") return;
    box.value = "";
    if (!flags.includes(value)) on.flag(path, value, true);
  });
  const known = (shape?.values ?? []).filter((v) => typeof v === "string" && !flags.includes(v));
  const offered = known.length === 0 ? null : h(
    "select",
    {
      on: {
        change: (event) => {
          const target = event.target;
          if (!(target instanceof HTMLSelectElement) || target.value === "") return;
          const chosen = target.value;
          target.value = "";
          if (!flags.includes(chosen)) on.flag(path, chosen, true);
        }
      }
    },
    h("option", { value: "", text: `one of the ${known.length} the game uses` }),
    ...known.slice(0, 200).map((value) => h("option", { value, text: value }))
  );
  return h("div", { class: "mb-chips" }, ...chips, box, offered);
}
function rowsEditor(path, rows, on) {
  const list = rows.map(
    (row2, index) => h(
      "div",
      { class: "mb-row" },
      h("span", { class: "mb-row-index", text: String(index) }),
      h("span", { class: "mb-row-summary", text: describeRow(row2) }),
      h(
        "span",
        { class: "mb-row-acts" },
        button({ label: "Open", tiny: true, onClick: () => on.drill(`${path}.${index}`) }),
        button({
          label: "Copy",
          tiny: true,
          kind: "ghost",
          tip: "Add another entry that copies this one.",
          onClick: () => on.addRow(path, JSON.parse(JSON.stringify(row2)))
        }),
        button({
          label: "Up",
          tiny: true,
          kind: "ghost",
          disabled: index === 0,
          onClick: () => on.set(path, move(rows, index, index - 1))
        }),
        button({
          label: "Down",
          tiny: true,
          kind: "ghost",
          disabled: index === rows.length - 1,
          onClick: () => on.set(path, move(rows, index, index + 1))
        }),
        button({
          label: "Remove",
          tiny: true,
          kind: "danger",
          onClick: () => on.removeRow(path, row2)
        })
      )
    )
  );
  const shape = rows[0];
  return h(
    "div",
    { class: "mb-rows" },
    ...list,
    button({
      label: "Add an entry",
      tiny: true,
      onClick: () => on.addRow(path, shape ? blankLike(shape) : {}),
      tip: shape === void 0 ? "Add an empty entry, and fill it in." : "Add an entry with the same fields as the ones already here, left blank."
    })
  );
}
function describeRow(row2) {
  const parts = [];
  for (const [key, value] of Object.entries(row2)) {
    if (typeof value === "object" && value !== null) continue;
    parts.push(`${key} ${String(value)}`);
    if (parts.length === 4) break;
  }
  return parts.length === 0 ? "(empty)" : parts.join(", ");
}
function blankLike(row2) {
  const out = {};
  for (const [key, value] of Object.entries(row2)) {
    out[key] = typeof value === "number" ? 0 : typeof value === "boolean" ? false : Array.isArray(value) ? [] : typeof value === "object" && value !== null ? {} : "";
  }
  return out;
}
function move(rows, from, to) {
  const out = [...rows];
  const taken = out.splice(from, 1)[0];
  if (taken !== void 0) out.splice(to, 0, taken);
  return out;
}
function jsonEditor(path, value, on) {
  const box = h("textarea", { rows: 10, class: "mb-mono", spellcheck: false, value: JSON.stringify(value ?? null, null, 2) });
  const problem = h("div", { class: "mb-why" });
  const apply2 = () => {
    try {
      const parsed = JSON.parse(box.value);
      box.removeAttribute("aria-invalid");
      problem.textContent = "";
      on.set(path, parsed);
    } catch (e) {
      box.setAttribute("aria-invalid", "true");
      problem.textContent = `That is not valid JSON: ${String(e)}`;
    }
  };
  return h(
    "div",
    { class: "mb-control" },
    box,
    h("div", { class: "mb-row-actions" }, button({ label: "Apply", onClick: apply2 }), problem)
  );
}

// src/ui/screens/record.ts
function recordScreen(shop, index, path) {
  const rail = h("div", { class: "mb-rail" });
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols" }, rail, main, aside);
  const target = shop.acts.target(index);
  if (!target) {
    fill(
      main,
      empty(
        "?",
        "Nothing to edit here",
        "That change has no record behind it, which usually means it was dropped.",
        button({ label: "Back to the mod", kind: "primary", onClick: () => shop.acts.go({ at: "details" }) })
      )
    );
    return { el, update: () => void 0, dispose: () => void 0 };
  }
  const kind = kindFor(shop.api, target.file);
  const handlers = {
    set: (at, value) => shop.acts.setValue(index, at, value),
    clear: (at) => shop.acts.clearValue(index, at),
    drill: (at) => shop.acts.go({ at: "record", change: index, path: at }),
    focus: (at) => shop.acts.focusField(at),
    /* Every one of these four goes through `applyOp` rather than through
     * `setValue`, because each is a gesture the format has a COMMUTATIVE op for.
     * Writing the outcome instead of the gesture would turn a change that
     * coexists with another mod's into one that overwrites it. */
    nudge: (at, delta) => shop.acts.applyOp(index, opNudge(at, delta)),
    flag: (at, name, on) => shop.acts.applyOp(index, opFlag(at, name, on)),
    addRow: (at, value) => shop.acts.applyOp(index, opAddRow(at, value)),
    removeRow: (at, value) => shop.acts.applyOp(index, opDeleteRow(at, value))
  };
  const railList = h("div", { class: "mb-list" });
  rail.append(
    h("div", { class: "mb-listhead" }, h("h3", { text: "In this mod" })),
    railList,
    h(
      "div",
      { style: { padding: "8px" } },
      button({ label: "Add or change something", tiny: true, onClick: () => shop.acts.go({ at: "kinds" }) })
    )
  );
  const crumbBar = h("div", { class: "mb-crumbs" });
  const identity = h("div", { class: "mb-why" });
  const identityCard = card({ title: "Identity", note: "how the game and other mods refer to it", open: true });
  identityCard.body.appendChild(identity);
  const opsList = h("div", { class: "mb-rows" });
  const opsCard = card({ title: "What this writes down", note: "", open: target.mode === "patch" });
  opsCard.body.appendChild(opsList);
  const groupsHost = h("div", { style: { display: "flex", "flex-direction": "column", gap: "12px" } });
  const addBox = searchBox("add a field by name", () => void 0);
  const addList = h("div", { class: "mb-list" });
  const addCard = card({
    title: "Add a field",
    note: "ranked by how much the game's own records use it",
    open: false,
    onToggle: () => addCard.setOpen(addCard.el.dataset["open"] !== "1")
  });
  addCard.body.append(addBox, addList);
  const allSwitch = h("input", { type: "checkbox" });
  allSwitch.addEventListener("change", () => shop.acts.toggleAllFields());
  main.append(
    crumbBar,
    identityCard.el,
    ...target.mode === "patch" ? [opsCard.el] : [],
    h(
      "div",
      { class: "mb-row-actions" },
      h(
        "label",
        { class: "mb-switch", tip: "Show every field this kind of record can carry, not only the ones this one has." },
        allSwitch,
        h("span", { text: "show every field" })
      ),
      h("span", { class: "mb-spacer" }),
      button({ label: "Review it", onClick: () => shop.acts.go({ at: "verdict" }) }),
      /* GATED ON THE SEAM EXISTING, not on it being usable. The panel's whole first
       * half is the explanation of what testing costs and the button that spends it,
       * so a route that only appeared once the player had already paid would be a
       * route to a screen they no longer needed. */
      shop.seams.wizard.api !== void 0 ? button({
        label: "Test it in the game",
        tip: "Go where this belongs, put one in front of you, and look at it.",
        onClick: () => shop.acts.go({ at: "test" })
      }) : null
    ),
    groupsHost,
    addCard.el
  );
  const findingsSection = asideSection("Checks");
  const findingsList = h("ul", { class: "mb-findings" });
  const findingsNote = h("div", { class: "mb-stale" });
  findingsSection.body.append(findingsNote, findingsList);
  const evidenceSection = asideSection("Things like this");
  const evidenceBody = h("div");
  evidenceSection.body.appendChild(evidenceBody);
  const usageSection = asideSection("What this file uses");
  const usageBody = h("div");
  usageSection.body.appendChild(usageBody);
  aside.append(findingsSection.el, evidenceSection.el, usageSection.el);
  const rows = /* @__PURE__ */ new Map();
  const groupCards = /* @__PURE__ */ new Map();
  const render = (state) => {
    const current = shop.acts.target(index);
    if (!current) return;
    const draft = openDraft(state);
    if (!draft) return;
    allSwitch.checked = state.showAllFields;
    renderRail(state, draft);
    renderCrumbs(current.record);
    renderIdentity(current.record, draft.id);
    if (current.mode === "patch") renderOps(current.ops ?? []);
    const scope = path === "" ? current.record : valueAt2(current.record, path);
    if (scope === void 0 || kindOf(scope) === "empty") {
      const up = path.split(".").slice(0, -1).join(".");
      fill(
        groupsHost,
        empty(
          "[ ]",
          "Nothing here",
          "This part of the record is empty, so there are no fields to show. Give it a value one level up.",
          button({
            label: "Go back up",
            kind: "primary",
            onClick: () => shop.acts.go({ at: "record", change: index, path: up })
          })
        )
      );
      return;
    }
    if (kindOf(scope) !== "object") {
      fill(
        groupsHost,
        h(
          "div",
          { class: "mb-prose" },
          h("h3", { text: "As JSON" }),
          h("p", {
            text: "This part of the record is a list rather than a group of named fields, so it is edited whole."
          })
        ),
        jsonEditor(path, scope, handlers)
      );
      return;
    }
    const findings = findingsFor(state);
    const suggestions = suggestionsFor(current.record);
    renderGroups(state, current.record, scope, findings, suggestions);
    renderAdd(state, scope);
    renderFindings(state, findings);
    renderEvidence(state, current.record);
    renderUsage(state);
  };
  const renderRail = (state, draft) => {
    fill(
      railList,
      ...draft.changes.map(
        (change, at) => listRow({
          badge: change.file.charAt(0).toUpperCase(),
          name: change.kind === "add" || change.kind === "replace" ? draftLabel(shop.api, change.file, change.record) : change.ref,
          meta: change.file,
          selected: at === index,
          onClick: () => shop.acts.go({ at: "record", change: at, path: "" })
        })
      )
    );
    void state;
  };
  const renderCrumbs = (record) => {
    const parts = path === "" ? [] : path.split(".");
    const nodes = [
      h("button", {
        class: "mb-crumb",
        type: "button",
        text: draftLabel(shop.api, target.file, record),
        aria: parts.length === 0 ? { current: "page" } : {},
        on: { click: () => shop.acts.go({ at: "record", change: index, path: "" }) }
      })
    ];
    let walked = "";
    parts.forEach((part, at) => {
      walked = walked === "" ? part : `${walked}.${part}`;
      const here = walked;
      nodes.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      nodes.push(
        h("button", {
          class: "mb-crumb",
          type: "button",
          text: part,
          aria: at === parts.length - 1 ? { current: "page" } : {},
          on: { click: () => shop.acts.go({ at: "record", change: index, path: here }) }
        })
      );
    });
    fill(crumbBar, ...nodes);
  };
  const renderIdentity = (record, owner) => {
    const current = shop.acts.target(index);
    if (current?.mode === "patch") {
      fill(
        identity,
        `This adjusts ${current.ref ?? "a record"}, which stays the base game's. Your mod ships the difference, so `,
        "another mod adjusting a different field of the same record still works."
      );
      return;
    }
    const check = checkIdentity(shop.api, target.file, record, owner, shop.records);
    fill(
      identity,
      check.collides ? h("b", { text: "This name is taken. " }) : null,
      check.says,
      " ",
      h("span", {
        class: "mb-label-meta",
        text: `Identity comes from ${shop.api.keyDescription(target.file)}.`
      })
    );
  };
  const renderOps = (ops) => {
    opsCard.setNote(`${ops.length} adjustment${ops.length === 1 ? "" : "s"}`);
    if (ops.length === 0) {
      fill(opsList, h("div", { class: "mb-why", text: "Nothing yet. Change a field below and it will appear here." }));
      return;
    }
    fill(
      opsList,
      ...ops.map(
        (op, at) => h(
          "div",
          { class: "mb-row" },
          h("span", { class: "mb-row-index", text: String(at) }),
          h(
            "span",
            { class: "mb-row-summary", tip: describeComposition(op) },
            describeOp(op)
          ),
          h("span", { class: "mb-row-acts" })
        )
      )
    );
  };
  const renderGroups = (state, record, scope, findings, suggestions) => {
    const blueprint = shop.api.blueprintFor(target.file);
    const inNested = path !== "";
    const shapeAt = inNested ? nestedShape(blueprint?.fields, path) : blueprint?.fields;
    const grouped = inNested ? /* @__PURE__ */ new Map([["essentials", Object.keys(scope).sort()]]) : groupFields(shop.api, kind, Object.keys(scope), state.showAllFields);
    const wanted = /* @__PURE__ */ new Set();
    const order = [];
    for (const [group, fields] of grouped) {
      wanted.add(group);
      let block = groupCards.get(group);
      if (!block) {
        block = card({
          title: inNested ? "Fields" : GROUP_TITLES[group],
          ...inNested ? {} : { tip: GROUP_BLURBS[group] },
          open: group === "essentials" || state.collapsed[group] === false,
          onToggle: () => shop.acts.toggleGroup(group)
        });
        groupCards.set(group, block);
      }
      const open2 = group === "essentials" ? state.collapsed[group] !== true : state.collapsed[group] !== true && (group !== "advanced" || state.showAllFields);
      block.setOpen(open2);
      const issues = fields.reduce(
        (n, field) => n + findings.filter((f) => f.field === field || f.field === joinPath(path, field)).length,
        0
      );
      block.setNote(`${fields.length} field${fields.length === 1 ? "" : "s"}${issues > 0 ? `, ${issues} noted` : ""}`);
      const children = [];
      for (const field of fields) {
        const full = joinPath(path, field);
        const shape = shapeAt?.[field];
        const input = {
          path: full,
          label: field,
          record,
          ...shape === void 0 ? {} : { shape },
          ...shape === void 0 || !blueprint || inNested ? {} : { share: shape.count / blueprint.records },
          ...suggestions.get(full) === void 0 ? {} : { suggestion: suggestions.get(full) },
          findings: findings.filter((f) => f.field === full),
          focused: state.focusField === full,
          pristine: isPristine(shop.acts.target(index) ?? target, full)
        };
        let row2 = rows.get(full);
        if (!row2) {
          row2 = fieldRow(input, handlers);
          rows.set(full, row2);
        } else row2.update(input);
        children.push(row2.el);
      }
      fill(block.body, ...children);
      order.push(block.el);
    }
    for (const [group, block] of groupCards) {
      if (!wanted.has(group)) {
        block.el.remove();
        groupCards.delete(group);
      }
    }
    fill(groupsHost, ...order);
  };
  const renderAdd = (state, scope) => {
    const usage = shop.api.fieldUsage(target.file);
    const needle = addBox.value.trim().toLowerCase();
    const missing = usage.filter((entry) => !(entry.name in scope)).filter((entry) => needle === "" || entry.name.includes(needle)).slice(0, 40);
    fill(
      addList,
      ...missing.map(
        (entry) => listRow({
          name: entry.name,
          meta: `${entry.shape.types.join(" or ")} - on ${Math.round(entry.share * 100)}% of the game's records`,
          onClick: () => handlers.set(joinPath(path, entry.name), seedValue(entry.shape))
        })
      )
    );
    if (missing.length === 0) {
      fill(addList, h("div", { class: "mb-why", text: "Nothing left to add from this file's own fields." }));
    }
    void state;
  };
  const renderFindings = (state, findings) => {
    const verdict = state.verdict;
    findingsSection.setCount(
      verdict.build ? `${countOf(findings, "error")} / ${countOf(findings, "warn")} / ${countOf(findings, "hint")}` : ""
    );
    if (verdict.broke !== void 0) {
      setText(findingsNote, `The workshop could not check this: ${verdict.broke}`);
    } else if (verdict.stale || verdict.revision !== state.revision) {
      setText(
        findingsNote,
        verdict.build ? `Checking revision ${state.revision}. Showing revision ${verdict.revision}.` : "Checking."
      );
    } else {
      setText(findingsNote, findings.length === 0 ? `No issues in revision ${verdict.revision}.` : "");
    }
    fill(
      findingsList,
      ...findings.slice(0, 60).map(
        (finding) => h(
          "li",
          null,
          h(
            "button",
            {
              class: "mb-finding",
              type: "button",
              data: { level: finding.level },
              on: {
                click: () => {
                  if (finding.field === void 0) return;
                  shop.acts.focusField(finding.field);
                  const row2 = rows.get(finding.field);
                  row2?.el.scrollIntoView({ block: "center" });
                  row2?.el.querySelector("input, textarea, select, button")?.focus();
                }
              }
            },
            h("span", { class: "mb-mark", data: { level: finding.level }, text: finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i" }),
            h(
              "span",
              null,
              h("span", { text: finding.message }),
              h("div", { class: "mb-finding-rule", text: finding.rule })
            )
          )
        )
      )
    );
  };
  const renderEvidence = (state, record) => {
    const field = state.focusField;
    const bare = field === void 0 ? void 0 : field.split(".").pop() ?? field;
    const set = shop.api.peersFor(target.file, record, shop.records);
    evidenceSection.setCount(`${set.peers.length}`);
    if (set.peers.length === 0) {
      fill(
        evidenceBody,
        h("div", { class: "mb-why", text: "Nothing in the game is comparable to this yet. Give it a family and a depth." })
      );
      return;
    }
    const columns = bare === void 0 ? defaultColumns(set.peers) : [bare, ...defaultColumns(set.peers).filter((c) => c !== bare)].slice(0, 4);
    const numbers = bare === void 0 ? [] : set.peers.map((p) => p[bare]).filter((v) => typeof v === "number");
    fill(
      evidenceBody,
      h("div", { class: "mb-why", text: `Comparable because ${set.because}.` }),
      numbers.length === 0 ? null : h(
        "div",
        { class: "mb-stat" },
        h("span", null, `${bare ?? ""} `, h("b", { text: `${Math.min(...numbers)} to ${Math.max(...numbers)}` })),
        h("span", null, "middle ", h("b", { text: String(middle(numbers)) })),
        h("span", null, "yours ", h("b", { text: String(bare === void 0 ? "" : JSON.stringify(record[bare] ?? null)) }))
      ),
      h(
        "div",
        { class: "mb-scrollx" },
        h(
          "table",
          { class: "mb-peers" },
          h(
            "thead",
            null,
            h(
              "tr",
              null,
              h("th", { text: "record" }),
              ...columns.map(
                (column) => h("th", { text: column, class: column === bare ? "mb-focus-cell" : "" })
              )
            )
          ),
          h(
            "tbody",
            null,
            ...set.peers.slice(0, 14).map(
              (peer) => h(
                "tr",
                null,
                h("td", { text: labelOf(shop.api, target.file, peer) }),
                ...columns.map(
                  (column) => h("td", {
                    class: `${typeof peer[column] === "number" ? "mb-num" : ""} ${column === bare ? "mb-focus-cell" : ""}`.trim(),
                    text: cell(peer[column])
                  })
                )
              )
            )
          )
        )
      )
    );
  };
  const renderUsage = (state) => {
    const usage = shop.api.fieldUsage(target.file).slice(0, 18);
    usageSection.setCount(`${shop.api.fieldUsage(target.file).length}`);
    fill(
      usageBody,
      h("div", {
        class: "mb-why",
        text: "How much of the game's own content in this file carries each field. A field that nearly every record carries is core to this kind of record."
      }),
      h(
        "div",
        { class: "mb-scrollx" },
        h(
          "table",
          { class: "mb-peers" },
          h("tbody", null, ...usage.map(
            (entry) => h(
              "tr",
              null,
              h("td", { text: entry.name }),
              h("td", { class: "mb-num", text: `${Math.round(entry.share * 100)}%` })
            )
          ))
        )
      )
    );
    void state;
  };
  const findingsFor = (state) => {
    const build = state.verdict.build;
    if (!build) return [];
    return build.findings.filter((finding) => finding.file === target.file || finding.file === "-" || finding.file === "manifest");
  };
  const suggestionsFor = (record) => {
    const out = /* @__PURE__ */ new Map();
    if (path !== "") return out;
    for (const suggestion of shop.api.suggestFields(target.file, record, shop.records)) {
      out.set(suggestion.field, suggestion);
    }
    return out;
  };
  addBox.addEventListener("input", () => renderAdd(shop.store.get(), (path === "" ? shop.acts.target(index)?.record : valueAt2(shop.acts.target(index)?.record ?? {}, path)) ?? {}));
  render(shop.store.get());
  shop.acts.scheduleCheck();
  return {
    el,
    update(next) {
      render(next);
    },
    dispose() {
      rows.clear();
      groupCards.clear();
    }
  };
}
function joinPath(base, field) {
  return base === "" ? field : `${base}.${field}`;
}
function nestedShape(fields, path) {
  let at = fields;
  for (const segment of path.split(".")) {
    if (!at) return void 0;
    if (/^(?:0|[1-9][0-9]*)$/.test(segment)) {
      const only = Object.values(at)[0];
      at = only?.fields;
      continue;
    }
    at = at[segment]?.fields ?? at[segment]?.items?.fields;
  }
  return at;
}
function seedValue(shape) {
  if (shape.range) return shape.range.median;
  const first = shape.types[0] ?? "string";
  if (first === "number") return 0;
  if (first === "boolean") return false;
  if (first === "array") return [];
  if (first === "object") return {};
  return shape.values && shape.values.length > 0 ? String(shape.values[0]) : "";
}
function countOf(findings, level) {
  return findings.filter((f) => f.level === level).length;
}
function defaultColumns(peers) {
  const counts = /* @__PURE__ */ new Map();
  for (const peer of peers) {
    for (const [key, value] of Object.entries(peer)) {
      if (typeof value !== "number" && typeof value !== "string") continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4).map(([key]) => key);
}
function cell(value) {
  if (value === void 0 || value === null) return "";
  if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "{...}";
  return String(value);
}
function middle(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const at = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[at] ?? 0;
  return Math.round(((sorted[at - 1] ?? 0) + (sorted[at] ?? 0)) / 2);
}

// src/model/search.ts
var MATCH_CEILING = 500;
var SNIPPET_RADIUS = 60;
function searchDraft(api, draft, buffers, query) {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [];
  const out = [];
  for (const file of projectFiles(api, draft)) {
    if (isBinary(file.contents)) continue;
    const text = buffers[file.path]?.text ?? file.contents;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hay = line.toLowerCase();
      let at = hay.indexOf(needle);
      while (at >= 0) {
        out.push({ path: file.path, line: i + 1, column: at + 1, snippet: snippetAround(line, at, needle.length) });
        if (out.length >= MATCH_CEILING) return out;
        at = hay.indexOf(needle, at + 1);
      }
    }
  }
  return out;
}
function snippetAround(line, at, needleLength) {
  const trimmed = line.trim();
  const shift = line.length - line.trimStart().length;
  const shiftedAt = Math.max(0, at - shift);
  const from = Math.max(0, shiftedAt - SNIPPET_RADIUS);
  const to = Math.min(trimmed.length, shiftedAt + needleLength + SNIPPET_RADIUS);
  const cut = trimmed.slice(from, to);
  return `${from > 0 ? "..." : ""}${cut}${to < trimmed.length ? "..." : ""}`;
}

// src/ui/screens/search.ts
function searchScreen(shop) {
  const main = h("div", { class: "mb-main" });
  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "Search looks across one mod's files, so there is nothing to search yet.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) })
      )
    );
    return { el: main, update: () => void 0, dispose: () => void 0 };
  }
  const search = searchBox("search every file in this mod", (value) => shop.acts.setFilter(value));
  const count = h("div", { class: "mb-why" });
  const list = h("div", { class: "mb-list" });
  main.append(
    h(
      "div",
      { class: "mb-prose" },
      h("h2", { text: "Search this mod" }),
      h("p", {
        text: "Searches every text file this mod would write at once. A match takes you straight into that file's editor, at the line it is on."
      })
    ),
    search,
    count,
    list
  );
  const rowFor = (match) => listRow({
    badge: "@",
    name: `${match.path}:${match.line}`,
    meta: match.snippet,
    onClick: () => shop.acts.openFile(match.path, match.line)
  });
  const render = (query) => {
    const current = openDraft(shop.store.get());
    if (!current) return;
    const needle = query.trim();
    if (needle === "") {
      setText(count, "Type something above to search every file this mod would write.");
      fillList(list, [], empty("@", "Nothing yet", "Type a word or a name above to search every file in this mod."));
      return;
    }
    const matches = searchDraft(shop.api, current, shop.store.get().buffers, needle);
    setText(
      count,
      matches.length === 0 ? `Nothing found for "${needle}".` : matches.length >= MATCH_CEILING ? `Showing the first ${matches.length} matches for "${needle}". There may be more; a narrower search will find them.` : `${matches.length} match${matches.length === 1 ? "" : "es"} for "${needle}".`
    );
    fillList(
      list,
      matches.map(rowFor),
      empty("?", "Nothing found", `No file in this mod has "${needle}" in it.`)
    );
  };
  render(shop.store.get().filter);
  return {
    el: main,
    update(next, prev) {
      if (next.filter !== prev.filter || next.drafts !== prev.drafts || next.buffers !== prev.buffers) {
        render(next.filter);
      }
    },
    dispose: () => void 0
  };
}

// src/host/spawn.ts
var NO_CATALOGUE = { items: [], creatures: [], artifacts: [] };
function packsInPlay(catalogue) {
  const seen = [];
  for (const entry of allEntries(catalogue)) {
    const from = entry.entry.from;
    if (from !== void 0 && !seen.includes(from)) seen.push(from);
  }
  return seen;
}
function testRows(catalogue, opts) {
  const needle = (opts.search ?? "").trim().toLowerCase();
  const rows = listFor(catalogue, opts.kind).filter((row2) => {
    if (opts.pack !== void 0 && row2.entry.from !== opts.pack) return false;
    return needle === "" || row2.entry.name.toLowerCase().includes(needle);
  });
  return rows.slice().sort(compareRows);
}
function compareRows(a, b) {
  if (a.modded !== b.modded) return a.modded ? -1 : 1;
  if (a.entry.level !== b.entry.level) return a.entry.level - b.entry.level;
  return a.entry.name.localeCompare(b.entry.name);
}
function listFor(catalogue, kind) {
  const source = kind === "creature" ? catalogue.creatures : kind === "item" ? catalogue.items : catalogue.artifacts;
  return source.map((entry) => ({ kind, entry, modded: entry.from !== void 0 }));
}
function allEntries(catalogue) {
  return [
    ...listFor(catalogue, "creature"),
    ...listFor(catalogue, "item"),
    ...listFor(catalogue, "artifact")
  ];
}

// src/ui/screens/test.ts
var PAGE2 = 60;
var HANDFUL = 5;
var KNOW_NOTE = "so nothing shows up unidentified";
function testScreen(shop) {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);
  const seam = shop.seams.wizard;
  const intro = h("div", { class: "mb-prose" }, h("h2", { text: "Test it in the game" }));
  const blocked = h("div", { class: "mb-banner" });
  const armCard = card({
    title: "Before anything works",
    open: true,
    onToggle: () => armCard.setOpen(armCard.el.dataset["open"] !== "1")
  });
  const armProse = h("div", { class: "mb-prose" });
  const arm = button({
    label: "Stop saving, and let me test",
    kind: "danger",
    seal: true,
    tip: "Cuts this session loose from its save slot. Your character on disk keeps whatever the last save left and nothing after this is ever written. It cannot be undone; reload the game to go back to them.",
    onClick: () => {
      if (!seam.api) return;
      report(seam.api.sandbox());
      renderAll();
    }
  });
  armCard.body.append(armProse, h("div", { class: "mb-row-actions" }, arm));
  const kindPick = h(
    "select",
    null,
    h("option", { value: "creature", text: "creatures" }),
    h("option", { value: "item", text: "items" }),
    h("option", { value: "artifact", text: "artifacts" })
  );
  const packPick = h("select", null);
  const search = searchBox("filter by name", (value) => shop.acts.setFilter(value));
  const list = h("div", { class: "mb-list" });
  const more = button({
    label: "Show more",
    kind: "ghost",
    onClick: () => {
      shown += PAGE2;
      renderList(shop.store.get());
    }
  });
  const browse = card({ title: "Put one in front of me", open: true });
  browse.body.append(h("div", { class: "mb-row-actions" }, kindPick, packPick, search), list, more);
  const depth = numberField("dungeon level", "0 is the town", 0);
  const goDeep = button({ label: "Go there", kind: "primary", onClick: () => act((w) => w.goToDepth(depth.read())) });
  const exp = numberField("experience to gain", "levels up on the way, as play would", 0);
  const giveExp = button({ label: "Grant it", onClick: () => act((w) => w.grantExperience(exp.read())) });
  const gold = numberField("gold", "set outright, not added", 0);
  const giveGold = button({ label: "Set it", onClick: () => act((w) => w.setGold(gold.read())) });
  const statPick = h("select", null);
  const statValue = numberField("value", "the game clamps this to its own band", 18);
  const setStat = button({
    label: "Set it",
    onClick: () => act((w) => w.setStat(statPick.value, statValue.read()))
  });
  const loot = numberField("how many", "good random items, as acquirement makes them", 3);
  const acquire = button({ label: "Drop them", onClick: () => act((w) => w.acquire(loot.read())) });
  const acquireGreat = button({
    label: "Excellent ones",
    onClick: () => act((w) => w.acquire(loot.read(), true))
  });
  const horde = numberField("how many", "random creatures, near you", 5);
  const summon = button({ label: "Summon them", onClick: () => act((w) => w.summonRandom(horde.read())) });
  const hop = numberField("squares", "a random teleport of up to this far", 40);
  const teleport = button({ label: "Teleport", onClick: () => act((w) => w.teleport(hop.read())) });
  const depthCard = card({ title: "Where you are", open: true });
  depthCard.body.append(row(depth.el, goDeep), row(hop.el, teleport));
  const charCard = card({ title: "What you are", open: true });
  charCard.body.append(
    row(exp.el, giveExp),
    row(gold.el, giveGold),
    row(statPick, statValue.el, setStat),
    row(
      null,
      button({ label: "Heal and cure", onClick: () => act((w) => w.heal()) }),
      button({ label: "Reroll hit points", onClick: () => act((w) => w.rerollLife()) }),
      button({
        label: "Max everything out",
        kind: "danger",
        tip: "Every stat, the experience cap, a million gold. For testing the top of the game.",
        onClick: () => act((w) => w.maxOut())
      })
    )
  );
  const roomCard = card({ title: "What is around you", open: true });
  roomCard.body.append(
    row(loot.el, acquire, acquireGreat),
    row(horde.el, summon),
    row(
      null,
      button({ label: "Map this level", onClick: () => act((w) => w.mapLevel()) }),
      button({ label: "Light it all", onClick: () => act((w) => w.lightLevel()) }),
      button({ label: "Show every creature", onClick: () => act((w) => w.findCreatures()) })
    ),
    row(
      null,
      button({
        label: "Clear the level",
        kind: "danger",
        tip: "Removes every creature on the level, so you can look at one thing without being interrupted.",
        onClick: () => act((w) => w.banish())
      }),
      button({
        label: "Hit everything in sight",
        kind: "danger",
        onClick: () => act((w) => w.killVisible())
      })
    )
  );
  const knowCard = card({
    title: "What you know",
    note: KNOW_NOTE,
    open: false,
    onToggle: () => knowCard.setOpen(knowCard.el.dataset["open"] !== "1")
  });
  knowCard.body.append(
    row(
      null,
      button({ label: "Learn every item", onClick: () => act((w) => w.learnItems()) }),
      button({ label: "Learn every creature", onClick: () => act((w) => w.learnCreatures()) })
    )
  );
  const whereSection = asideSection("Right now");
  const whereBody = h("div", { class: "mb-prose" });
  whereSection.body.appendChild(whereBody);
  const minesSection = asideSection("In this game");
  const minesBody = h("div", { class: "mb-prose" });
  minesSection.body.appendChild(minesBody);
  aside.append(whereSection.el, minesSection.el);
  main.append(intro, blocked, armCard.el, browse.el, depthCard.el, charCard.el, roomCard.el, knowCard.el);
  let shown = PAGE2;
  let catalogue = NO_CATALOGUE;
  let statsFilled = false;
  let browseCount = "";
  const armed = () => seam.api?.sandboxed() === true;
  const setNotes = () => {
    const live = armed() && seam.available;
    const why = seam.available ? "off until this session stops being saved" : `off on this game: ${seam.why ?? ""}`;
    const compose = (own) => live ? own : own === "" ? why : `${own}, ${why}`;
    depthCard.setNote(compose(""));
    charCard.setNote(compose(""));
    roomCard.setNote(compose(""));
    knowCard.setNote(compose(KNOW_NOTE));
    browse.setNote(compose(browseCount));
  };
  const report = (outcome) => {
    if (outcome.ok) shop.acts.notice(outcome.did, "good");
    else shop.acts.notice(outcome.problem, "bad");
  };
  const act = (run) => {
    const api = seam.api;
    if (!api) return;
    report(run(api));
    renderAll();
  };
  const renderArm = () => {
    if (armed()) {
      armCard.setOpen(false);
      armCard.setNote("done");
      arm.disabled = true;
      armProse.replaceChildren(
        h(
          "p",
          null,
          h("b", { text: "This session is no longer being saved. " }),
          "Everything below works. Your character on disk is exactly as their last save left them, and reloading the game takes you back to them. Anything you do from here is gone once you reload."
        )
      );
      return;
    }
    armCard.setOpen(true);
    armCard.setNote("");
    arm.disabled = !seam.available;
    const who = seam.api?.attached()?.name;
    armProse.replaceChildren(
      h(
        "p",
        null,
        h("b", { text: "Everything here is off until this session stops being saved. " }),
        "These are the game's own debug commands. Their effects on a character you are keeping would be saved with it, so the workshop first cuts the session loose from its save slot and writes nothing after that."
      ),
      h("p", {
        text: who === void 0 || who === "" ? "Nothing is being saved right now in any case, so this costs you nothing." : `${who} keeps whatever their last save left, which is at most a few seconds of walking behind. Everything after that is discarded, and reloading the game brings them back exactly as they are on disk.`
      }),
      h("p", { text: "It cannot be undone. Reload the game to go back to normal play." })
    );
  };
  const renderList = (state) => {
    const kind = kindPick.value;
    const pack = packPick.value === "" ? void 0 : packPick.value;
    const rows = testRows(catalogue, {
      kind,
      search: state.filter,
      ...pack === void 0 ? {} : { pack }
    });
    const page = rows.slice(0, shown);
    const total = testRows(catalogue, { kind }).length;
    more.style.display = rows.length > page.length ? "" : "none";
    setText(more, `Show more (${rows.length - page.length} left)`);
    browseCount = `${rows.length} of ${total}`;
    setNotes();
    fillList(
      list,
      page.map(
        (entry) => buildRow(entry.kind, entry.entry.name, entry.entry.level, entry.modded, entry.entry.from)
      ),
      total === 0 ? empty(
        "[ ]",
        "Nothing is loaded to test with",
        armedOrNot(
          "The game has not handed the workshop its content, so there is nothing to choose from.",
          "Content composes when the game loads, so what this mod adds turns up here after it has been forged."
        ),
        seam.api === void 0 ? null : button({
          label: "Forge it and play it now",
          kind: "primary",
          tip: "Forges the mod, loads it for this session only, and reloads the game. Everything it adds is in this list afterwards.",
          onClick: () => void shop.acts.loadForSession()
        })
      ) : empty(
        "[ ]",
        "Nothing matches",
        "No loaded record has that in its name.",
        button({
          label: "Clear the filter",
          kind: "primary",
          onClick: () => {
            search.value = "";
            shop.acts.setFilter("");
          }
        })
      )
    );
  };
  const buildRow = (kind, name, level, modded, from) => {
    const row2 = listRow({
      badge: kind === "creature" ? "o" : kind === "artifact" ? "*" : "|",
      name,
      meta: level > 0 ? `level ${level}` : "town",
      /* THE PROVENANCE TAG IS THE POINT OF THE WHOLE LIST. A workshop's user is
       * looking for what they wrote, in six hundred entries of what they did not. */
      tags: modded ? [{ text: from ?? "a mod", tone: "mine", tip: `Added by "${from ?? "a mod"}", not by the base game.` }] : [],
      onClick: () => spawn(kind, name, 1)
    });
    const acts = row2.querySelector(".mb-row-acts");
    if (acts && kind !== "artifact") {
      acts.appendChild(
        button({
          label: `x${HANDFUL}`,
          tiny: true,
          tip: `Put ${HANDFUL} of them there at once.`,
          onClick: () => spawn(kind, name, HANDFUL)
        })
      );
    }
    return row2;
  };
  const spawn = (kind, name, quantity) => {
    act(
      (w) => kind === "creature" ? w.spawnCreature(name, quantity) : kind === "artifact" ? w.spawnArtifact(name) : w.spawnItem(name, quantity)
    );
  };
  const renderPacks = () => {
    const packs = packsInPlay(catalogue);
    const wanted = ["", ...packs].join(" ");
    if (packPick.dataset["packs"] === wanted) return;
    packPick.dataset["packs"] = wanted;
    fill(
      packPick,
      h("option", { value: "", text: "everything loaded" }),
      ...packs.map((pack) => h("option", { value: pack, text: `only ${pack}` }))
    );
    packPick.value = packs.length === 1 ? packs[0] ?? "" : "";
  };
  const renderWhere = () => {
    const where = seam.api?.where() ?? null;
    if (where === null) {
      whereBody.replaceChildren(h("p", { text: "There is no character in play." }));
      return;
    }
    if (!statsFilled) {
      fill(statPick, ...where.stats.map((stat) => h("option", { value: stat.name, text: stat.name })));
      statsFilled = true;
    }
    depth.setPlaceholder(`0 to ${where.maxDepth}`);
    whereBody.replaceChildren(
      h("p", {
        text: `Dungeon level ${where.depth}${where.depth === 0 ? " (the town)" : ""}, character level ${where.level}, ${where.experience} experience, ${where.gold} gold.`
      }),
      h("p", { text: where.stats.map((stat) => `${stat.name} ${stat.value}`).join("   ") })
    );
  };
  const renderMine = () => {
    const packs = packsInPlay(catalogue);
    const counts = {
      creatures: catalogue.creatures.filter((entry) => entry.from !== void 0).length,
      items: catalogue.items.filter((entry) => entry.from !== void 0).length,
      artifacts: catalogue.artifacts.filter((entry) => entry.from !== void 0).length
    };
    minesBody.replaceChildren(
      packs.length === 0 ? h("p", {
        text: "Everything loaded is the base game's. Content composes when the game loads, so a record you have just written turns up here after you forge the mod and play it with the button in the bar below."
      }) : h("p", {
        text: `${packs.join(", ")} added ${counts.creatures} creature${counts.creatures === 1 ? "" : "s"}, ${counts.items} item${counts.items === 1 ? "" : "s"} and ${counts.artifacts} artifact${counts.artifacts === 1 ? "" : "s"} to this game. They are at the top of the list.`
      }),
      h("p", {
        text: "Anything you change in the workshop now is not in the game until you forge it and play it again, because composing content always takes a reload."
      })
    );
  };
  const armedOrNot = (whenNoSeam, whenSeam) => seam.api === void 0 ? whenNoSeam : whenSeam;
  const renderAll = () => {
    const usable = seam.available || seam.api !== void 0;
    blocked.style.display = seam.available ? "none" : "";
    if (!seam.available) {
      blocked.replaceChildren(h("b", { text: "Not available. " }), h("span", { text: seam.why ?? "" }));
    }
    armCard.el.style.display = seam.api === void 0 ? "none" : "";
    for (const section of [depthCard, charCard, roomCard, knowCard]) {
      section.el.style.display = usable ? "" : "none";
    }
    browse.el.style.display = usable ? "" : "none";
    catalogue = seam.api?.catalogue() ?? NO_CATALOGUE;
    renderPacks();
    renderArm();
    renderWhere();
    renderMine();
    renderList(shop.store.get());
    const live = armed() && seam.available;
    setNotes();
    for (const control of main.querySelectorAll("button")) {
      if (control === arm) continue;
      if (control === more) continue;
      if (control.classList.contains("mb-card-head")) continue;
      if (control.closest(".mb-empty") !== null) continue;
      control.disabled = !live;
    }
    for (const field of [depth, exp, gold, statValue, loot, horde, hop]) field.setEnabled(live);
    for (const picker of [kindPick, packPick, statPick]) picker.disabled = catalogue === NO_CATALOGUE;
    search.disabled = false;
  };
  kindPick.addEventListener("change", () => {
    shown = PAGE2;
    renderList(shop.store.get());
  });
  packPick.addEventListener("change", () => {
    shown = PAGE2;
    renderList(shop.store.get());
  });
  renderAll();
  return {
    el,
    update(next, prev) {
      if (next.filter !== prev.filter) {
        shown = PAGE2;
        renderList(next);
      }
    },
    dispose: () => void 0
  };
}
function numberField(label, note, initial) {
  const input = h("input", {
    type: "text",
    class: "mb-mono",
    value: String(initial),
    spellcheck: false
  });
  const el = h(
    "div",
    { class: "mb-field" },
    h(
      "label",
      { class: "mb-label" },
      h("span", { class: "mb-label-name", text: label }),
      h("span", { class: "mb-label-meta", text: note })
    ),
    h("div", { class: "mb-control" }, input)
  );
  return {
    el,
    read() {
      const text = input.value.trim();
      return text === "" ? Number.NaN : Number(text);
    },
    setEnabled(enabled) {
      input.disabled = !enabled;
    },
    setPlaceholder(text) {
      input.placeholder = text;
    }
  };
}
function row(field, ...controls) {
  return h("div", { class: "mb-row-actions" }, field, ...controls);
}

// src/ui/screens/tour.ts
var LESSONS = [
  {
    badge: "1",
    title: "Change one thing",
    teaches: "Editing a value the game already has",
    body: [
      "For example, daggers that hit harder, a shop with deeper pockets, or a monster with three more hit points.",
      "The workshop shows you the record as the game sees it. You nudge a number, and the mod writes down the nudge instead of the new value, so three more hit points stays three more after the base game retunes the monster, or after another mod adjusts it first."
    ],
    cta: "Change something",
    tutorial: "tutorials/01-tweak-a-value.md",
    doc: "tutorial-01",
    start: (shop) => shop.acts.go({ at: "kinds" })
  },
  {
    badge: "2",
    title: "Add something new",
    teaches: "Adding a record the game has never seen",
    body: [
      "Make a new sword, creature or potion. You pick something that already exists to base it on, and the workshop fills in the new record from what its neighbours in the game carry, then tells you where every number came from.",
      "It inherits shape and scale but none of the original's powers. A new orc arrives with an orc's hit points and armour and no attacks at all until you add them, so nothing like a Balrog's breath gets handed out by accident."
    ],
    cta: "Make something new",
    tutorial: "tutorials/02-add-an-item.md",
    doc: "tutorial-02",
    start: (shop) => shop.acts.go({ at: "kinds" })
  },
  {
    badge: "3",
    title: "Build on top of it",
    teaches: "One-of-a-kind items, and what a field that names another record costs",
    body: [
      "An artifact is a set of adjustments to an item the game already has, so you describe how it differs from that item.",
      "This is also where first mods most often fail: a field that names another record, spelled slightly wrong. The workshop checks those names against what is loaded as you type, and says which file it looked in."
    ],
    cta: "Build on something",
    tutorial: "tutorials/07-add-an-artifact.md",
    doc: "tutorial-07",
    start: (shop) => shop.acts.go({ at: "kinds" })
  },
  {
    badge: "4",
    title: "Retune a whole set of things",
    teaches: "One change across many records at once",
    body: [
      "The most common mod moves one number across everything of one sort, such as making every potion cheaper, every dragon faster or every shop's purse deeper.",
      "Pick a file, filter it down to the records you mean, and apply one adjustment to all of them. Each one is written as its own entry, so another mod's unrelated change to the same record still composes with yours."
    ],
    cta: "Retune a set",
    tutorial: "tutorials/01-tweak-a-value.md",
    doc: "tutorial-01",
    start: (shop) => shop.acts.go({ at: "kinds" })
  }
];
function tourScreen(shop) {
  const el = h("div", { class: "mb-main" });
  const intro = h(
    "div",
    { class: "mb-prose" },
    h("h2", { text: "Make something for Angband" }),
    h("p", {
      text: "A mod is a folder with a text file in it, whether the file is written here or in a text editor. The workshop knows what belongs in the file, what the rest of the game already puts there, and which mistakes stay silent until you play."
    }),
    h("p", {
      text: "Nothing you do in here touches the game until you try the mod for this session or add its saved file through the Mods screen. A mod can be switched off, and switching it off gives you the base game back exactly as it was."
    })
  );
  const cards = LESSONS.map((lesson) => {
    const block = card({ title: lesson.title, note: lesson.teaches, badge: lesson.badge, open: true });
    block.body.append(
      h("div", { class: "mb-prose" }, ...lesson.body.map((line) => h("p", { text: line }))),
      h(
        "div",
        { class: "mb-row-actions" },
        button({ label: lesson.cta, kind: "primary", onClick: () => lesson.start(shop) }),
        button({
          label: `Read tutorial ${lesson.badge}`,
          kind: "ghost",
          onClick: () => shop.acts.go({ at: "docs", doc: lesson.doc }),
          tip: `Open the ModForge tutorial ${lesson.tutorial} to build a mod with a text editor.`
        })
      )
    );
    return block.el;
  });
  const advanced = card({
    title: "Or do it by hand",
    note: "The SDK path for code and the details behind the workshop",
    badge: "+",
    open: true
  });
  advanced.body.classList.add("mb-prose");
  advanced.body.append(
    h("p", {
      text: "The workshop guides record changes, starts a working plugin.js entry point, imports tiles, fonts and sounds byte for byte, and round-trips sections in record files. It does not write your plugin's behaviour, preview or validate an asset, or offer a visual editor for sections. For those, use the SDK docs below."
    }),
    h(
      "ul",
      null,
      h("li", null, button({ label: "Read the eight tutorials", onClick: () => shop.acts.go({ at: "docs", doc: "tutorials" }) })),
      h("li", null, button({ label: "Read the plugin API", onClick: () => shop.acts.go({ at: "docs", doc: "plugins" }) })),
      h("li", null, button({ label: "Read the authoring guide", onClick: () => shop.acts.go({ at: "docs", doc: "authoring" }) })),
      h("li", null, button({ label: "Read compatibility guidance", onClick: () => shop.acts.go({ at: "docs", doc: "compatibility" }) }))
    ),
    h("p", {
      text: "A mod the workshop wrote is an ordinary folder of ordinary files. Take it out, edit it in anything, and bring it back through Import a zip. Nothing in it belongs to the workshop."
    })
  );
  const done = h(
    "div",
    { class: "mb-row-actions" },
    button({
      label: "Take me to my mods",
      kind: "primary",
      onClick: () => shop.acts.finishTour()
    }),
    h("span", { class: "mb-label-meta", text: "This page is under Guide whenever you want it again." })
  );
  el.append(intro, ...cards, advanced.el, done);
  return { el, update: () => void 0, dispose: () => void 0 };
}

// src/ui/screens/verdict.ts
function verdictScreen(shop) {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);
  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "There is nothing to review until a mod is open.",
        button({ label: "Go to my mods", kind: "primary", onClick: () => shop.acts.go({ at: "mods" }) })
      )
    );
    return { el, update: () => void 0, dispose: () => void 0 };
  }
  const headline = h("div", { class: "mb-prose" });
  const filesHost = h("div", { style: { display: "flex", "flex-direction": "column", gap: "10px" } });
  const filesCard = card({ title: "What it writes", note: "", open: true });
  filesCard.body.appendChild(filesHost);
  const tryIt = button({
    label: "Forge it and play it now",
    kind: "primary",
    seal: true,
    onClick: () => void shop.acts.loadForSession(),
    tip: "Forges it, loads it for this session only, and reloads the game, since content always needs a reload. It is not added to your mods and is gone when you close the game, but anything it does to the character who plays it stays."
  });
  const install = button({
    label: "Forge and install",
    seal: true,
    onClick: () => void shop.acts.install(),
    tip: "Adds it to your mods for good. Like any mod you enable, it takes effect after a reload."
  });
  const save = button({
    label: "Save it as a file",
    onClick: () => shop.acts.download(),
    tip: "Writes the mod as a zip. Add it with Import a zip on the Mods screen. This is also the only copy that lives outside this browser, so it is the one to keep."
  });
  const back = button({ label: "Keep working on it", kind: "ghost", onClick: () => shop.acts.go({ at: "details" }) });
  const actions = h("div", { class: "mb-row-actions" }, tryIt, install, save, back);
  const installNote = h("div", { class: "mb-why" });
  main.append(headline, filesCard.el, actions, installNote);
  const findingsSection = asideSection("Every check");
  const findingsNote = h("div", { class: "mb-stale" });
  const findingsList = h("ul", { class: "mb-findings" });
  findingsSection.body.append(findingsNote, findingsList);
  const problemsSection = asideSection("Refused outright");
  const problemsList = h("div");
  problemsSection.body.appendChild(problemsList);
  aside.append(findingsSection.el, problemsSection.el);
  const render = (state) => {
    const current = openDraft(state);
    if (!current) return;
    const size = draftSize(current);
    const files = draftFiles(current);
    const verdict = state.verdict;
    const build = verdict.build;
    const findings = build ? sortFindings(build.findings) : [];
    const counts = countFindings(findings);
    const ok = build?.ok === true;
    const anything = current.changes.length > 0 || (current.sections?.length ?? 0) > 0 || Object.keys(current.extras ?? {}).length > 0;
    const buildable = ok && anything;
    const refusal = sessionRefusal(current);
    const script = entrySource(current);
    tryIt.disabled = !shop.seams.session.available || !buildable || refusal !== void 0;
    install.disabled = !shop.seams.install.available || !buildable;
    save.disabled = !anything;
    headline.replaceChildren(
      h("h2", { text: `${current.name} ${current.version}` }),
      h(
        "p",
        null,
        build === void 0 ? "Checking." : ok ? "This will install. " : h("b", { text: "This will not install as it stands. " }),
        build === void 0 ? "" : `${counts.errors} error${counts.errors === 1 ? "" : "s"}, ${counts.warnings} warning${counts.warnings === 1 ? "" : "s"}, ${counts.hints} note${counts.hints === 1 ? "" : "s"}.`
      ),
      h("p", {
        text: `${size.added} new record${size.added === 1 ? "" : "s"}, ${size.patched} adjusted, ${size.removed} removed, ${current.sections?.length ?? 0} switchable section${(current.sections?.length ?? 0) === 1 ? "" : "s"}, across ${files.length} file${files.length === 1 ? "" : "s"}. Checked against the game as it is loaded right now, mods included, since that is what your changes will apply to.`
      }),
      ...shop.seams.authoring.demonstration ? [h("p", null, h("b", { text: "These checks are the workshop's own small set, not the game's. " }), shop.seams.authoring.why ?? "")] : [],
      ...script !== void 0 && isApi2Range(scriptApi(script).range, (version, range) => shop.api.satisfies(version, range)) ? [
        h(
          "p",
          null,
          h("b", { text: "It needs a game that runs API 2. " }),
          "The plugin.js here is written for mod API 2, so the mod loads only on 1.23.0-beta.1 or later, and the manifest's engine floor says so. To support an older game, start the script again from the API 1 template."
        )
      ] : []
    );
    const emitted = shop.acts.files();
    filesCard.setNote(`${emitted.length} file${emitted.length === 1 ? "" : "s"}`);
    const unchecked = unread(current);
    filesHost.replaceChildren(
      ...emitted.length === 0 ? [
        empty(
          "[ ]",
          "Nothing to write yet",
          "A mod with no changes and no files of its own has nothing to emit.",
          button({
            label: "Add or change something",
            kind: "primary",
            onClick: () => shop.acts.go({ at: "kinds" })
          })
        )
      ] : emitted.map((file) => filePreview(file.path, file.contents)),
      ...unchecked.length === 0 ? [] : [
        h(
          "div",
          { class: "mb-why" },
          h("b", { text: "Passed through unread. " }),
          `${unchecked.map((entry) => `${entry.path} carries ${entry.keys.join(", ")}`).join("; ")}. The workshop cannot compose or check those keys, so the checks above do not cover them.`
        )
      ]
    );
    findingsSection.setCount(`${findings.length}`);
    findingsNote.textContent = verdict.broke !== void 0 ? `The workshop could not check this: ${verdict.broke}` : verdict.stale || verdict.revision !== state.revision ? "Checking." : findings.length === 0 ? "Nothing to report." : "";
    findingsList.replaceChildren(
      ...findings.map(
        (finding) => h(
          "li",
          null,
          h(
            "div",
            { class: "mb-finding", data: { level: finding.level } },
            h("span", {
              class: "mb-mark",
              data: { level: finding.level },
              text: finding.level === "error" ? "!" : finding.level === "warn" ? "?" : "i"
            }),
            h(
              "span",
              null,
              h("span", { text: finding.message }),
              h("div", { class: "mb-finding-rule", text: `${finding.rule} - ${finding.file}` })
            )
          )
        )
      )
    );
    const problems = build?.problems ?? [];
    problemsSection.setCount(`${problems.length}`);
    problemsList.replaceChildren(
      problems.length === 0 ? h("div", {
        class: "mb-why",
        text: "Nothing was refused. A refused change drops only that change and the rest of the mod still installs, so a mod whose every change was refused installs and does nothing."
      }) : h(
        "ul",
        null,
        ...problems.map((problem) => h("li", { text: problem }))
      )
    );
    const notes = [
      refusal !== void 0 ? h("p", null, h("b", { text: "This one cannot be tried for a session. " }), refusal) : shop.seams.session.available ? h("p", {
        text: "Playing it loads the mod for this session only and reloads the game, because composing content always needs a reload. It is not added to your mods and is gone when you close the game. This is the real mod, so play a character you do not mind changing: next time, with the mod gone, the game treats anything it added as belonging to a mod that is not installed."
      }) : h("p", { text: shop.seams.session.why ?? "" }),
      shop.seams.install.available ? h("p", { text: "Installing keeps it. Like any mod you enable, it takes effect after a reload." }) : h("p", { text: shop.seams.install.why ?? "" })
    ];
    if (!ok) {
      notes.push(h("p", { text: "Fix the errors on the right and these become available." }));
    }
    installNote.replaceChildren(...notes);
  };
  shop.acts.checkNow();
  render(shop.store.get());
  return {
    el,
    update(next) {
      render(next);
    },
    dispose: () => void 0
  };
}

// src/ui/app.ts
function mountApp(deps) {
  useDocument(deps.doc);
  const tips = installTooltips(deps.overlay.root, deps.doc);
  const shop = {
    store: deps.store,
    acts: deps.acts,
    seams: deps.seams,
    api: deps.api,
    records: deps.records,
    tips,
    doc: deps.doc
  };
  const illum = h("div", { class: "mb-illum", text: "M" });
  const title = h("h1", { class: "mb-title", text: "ModForge" });
  const subtitle = h("p", { class: "mb-subtitle" });
  const parchment = h("input", { type: "checkbox" });
  parchment.addEventListener("change", () => deps.overlay.setParchment(parchment.checked));
  const undo = button({
    label: "Undo",
    kind: "ghost",
    tiny: true,
    tip: "Take back the last change. Every change to a mod can be undone, and none of them touch the game itself.",
    onClick: () => deps.store.undo()
  });
  const redo = button({ label: "Redo", kind: "ghost", tiny: true, onClick: () => deps.store.redo() });
  const guide = button({
    label: "Guide",
    kind: "ghost",
    tiny: true,
    tip: "The four things people usually make, and where the written tutorials for the same ideas are.",
    onClick: () => deps.acts.go({ at: "tour" })
  });
  const docs = button({
    label: "Docs",
    kind: "ghost",
    tiny: true,
    tip: "The SDK's beginner tutorials and advanced authoring references, bundled with the workshop.",
    onClick: () => deps.acts.go({ at: "docs", doc: "tutorial-01" })
  });
  const about = button({
    label: "About",
    kind: "ghost",
    tiny: true,
    tip: "What ModForge is and what it does. It is the same page as Read the README on the launch screen.",
    onClick: () => deps.acts.go({ at: "about" })
  });
  const close = button({
    label: "Close",
    tiny: true,
    tip: "Put the workshop away. Unfinished work is kept; nothing is installed until you say so.",
    onClick: () => deps.acts.close()
  });
  const titlebar = h(
    "header",
    { class: "mb-titlebar" },
    illum,
    h("div", { class: "mb-titles" }, title, subtitle),
    h(
      "div",
      { class: "mb-titleacts" },
      h("label", { class: "mb-switch", tip: "Switch to an ink-on-parchment look." }, parchment, h("span", { text: "parchment" })),
      guide,
      docs,
      about,
      undo,
      redo,
      close
    )
  );
  const crumbs = h("nav", { class: "mb-crumbs" });
  const banner = h("div", { class: "mb-banner" });
  const body = h("div", { class: "mb-body" });
  const statusText = h("div", { class: "mb-status-text" });
  const statusActs = h("div", { class: "mb-status-acts" });
  const status = h("footer", { class: "mb-status" }, statusText, statusActs);
  const frame = h("div", { class: "mb-frame" }, titlebar, crumbs, banner, body, status);
  const scrim = h("div", { class: "mb-scrim" }, frame);
  deps.overlay.root.appendChild(scrim);
  let current;
  let currentKey = "";
  const build = (route) => {
    switch (route.at) {
      case "tour":
        return tourScreen(shop);
      case "mods":
        return modsScreen(shop);
      case "details":
        return detailsScreen(shop);
      case "kinds":
        return kindsScreen(shop);
      case "base":
        return baseScreen(shop, route.file, route.mode);
      case "record":
        return recordScreen(shop, route.change, route.path);
      case "rebalance":
        return rebalanceScreen(shop, route.file);
      case "verdict":
        return verdictScreen(shop);
      case "test":
        return testScreen(shop);
      case "files":
        return filesScreen(shop, route.path, route.line);
      case "search":
        return searchScreen(shop);
      case "diff":
        return diffScreen(shop, route.path);
      case "docs":
        return docsScreen(shop, route.doc);
      case "about":
        return aboutScreen(shop);
    }
  };
  const keyOf2 = (route) => JSON.stringify(route);
  const renderChrome = (state) => {
    const draft = openDraft(state);
    setText(subtitle, subtitleFor(state, draft?.name));
    setText(illum, (draft?.name.trim().charAt(0) || "M").toUpperCase());
    undo.disabled = !deps.store.canUndo();
    redo.disabled = !deps.store.canRedo();
    if (deps.seams.authoring.demonstration) {
      banner.style.display = "";
      fill(
        banner,
        h("b", { text: "Demonstration content. " }),
        h("span", { text: deps.seams.authoring.why ?? "" })
      );
    } else banner.style.display = "none";
    fill(crumbs, ...crumbTrail(state, draft?.name));
    const notice = state.notice;
    setText(statusText, notice?.text ?? statusFor(state, draft));
    statusText.dataset["tone"] = notice?.tone ?? "plain";
    fill(
      statusActs,
      draft === void 0 ? null : button({
        label: "Save it as a file",
        tiny: true,
        tip: "Writes the mod as a zip you can keep, read, edit by hand and give away. Unfinished work lives in this browser's storage, which can run out of room without warning, so the zip is the only copy you can rely on.",
        onClick: () => deps.acts.download()
      }),
      /* THE ONE-CLICK LOOP, and it is here rather than only on the review screen
       * because the review screen was the friction. Getting a draft into the game
       * used to be: leave what you are doing for the verdict screen, wait for a
       * debounce to enable the button, press it, find Close, press Ctrl-R. Four
       * actions and a wait, of which exactly none was a decision. The status bar is
       * on every screen a draft is open on, so this is that whole loop from wherever
       * the author already is.
       *
       * REVIEW DID NOT GO AWAY, and it should not: it is where the errors, the
       * emitted files and the manifest are, and an author who wants to look before
       * they leap still has the button next to this one. What changed is that
       * looking is no longer compulsory in order to try something. */
      /* THE ONE BUTTON THAT CAN GO AWAY, and it goes away with its reason rather
       * than going grey. The session door takes content only, so the moment a mod
       * grows a script it cannot be tried this way - and pressing it would produce
       * the host's refusal, written for somebody importing a stranger's mod, at the
       * end of a build the author waited for. `sessionRefusal` is asked here and
       * again inside the action, from one function, so the two cannot disagree. */
      draft === void 0 ? null : button({
        label: "Try it in the game",
        kind: "primary",
        tiny: true,
        disabled: sessionRefusal(draft) !== void 0,
        tip: sessionRefusal(draft) ?? "Forges the mod, loads it for this session only, and reloads the game, since content always needs a reload. It is not added to your mods and is gone when you close the game, but anything it does to the character who plays it stays, so play one you do not mind changing.",
        onClick: () => void deps.acts.loadForSession()
      }),
      draft === void 0 ? null : button({
        label: "Review it",
        tiny: true,
        tip: "The errors, the files it would write, and the manifest as it will ship.",
        onClick: () => deps.acts.go({ at: "verdict" })
      })
    );
  };
  const crumbTrail = (state, name) => {
    const out = [
      h("button", {
        class: "mb-crumb",
        type: "button",
        text: "My mods",
        on: { click: () => deps.acts.go({ at: "mods" }) }
      })
    ];
    if (name !== void 0 && state.route.at !== "mods" && state.route.at !== "tour" && state.route.at !== "docs") {
      out.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      out.push(
        h("button", {
          class: "mb-crumb",
          type: "button",
          text: name,
          on: { click: () => deps.acts.go({ at: "details" }) }
        })
      );
    }
    if (state.route.at === "base" || state.route.at === "rebalance") {
      out.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      out.push(
        h("button", {
          class: "mb-crumb",
          type: "button",
          text: "What are you making",
          on: { click: () => deps.acts.go({ at: "kinds" }) }
        })
      );
    }
    const leaf = leafName(state.route);
    if (leaf !== void 0) {
      out.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      out.push(h("button", { class: "mb-crumb", type: "button", text: leaf, aria: { current: "page" } }));
    }
    return out;
  };
  const render = (next, prev) => {
    renderChrome(next);
    const key = keyOf2(next.route);
    if (key !== currentKey || current === void 0) {
      current?.dispose();
      currentKey = key;
      current = build(next.route);
      fill(body, current.el);
      current.el.querySelector('input:not([type="checkbox"]), textarea, select, button')?.focus();
      return;
    }
    current.update(next, prev);
  };
  const unsubscribe = deps.store.subscribe((next, prev) => render(next, prev));
  render(deps.store.get(), deps.store.get());
  deps.overlay.onKey((event) => {
    const state = deps.store.get();
    if (current?.keys?.(event) === true) return true;
    const inCode = event.composedPath()[0]?.dataset?.["code"] === "1";
    if (event.key === "Escape") {
      if (tips.hide()) return true;
      const route = state.route;
      if (route.at === "files" && route.path !== "") {
        deps.acts.go({ at: "files", path: "" });
        return true;
      }
      if (route.at === "record" && route.path !== "") {
        const up = route.path.split(".").slice(0, -1).join(".");
        deps.acts.go({ at: "record", change: route.change, path: up });
        return true;
      }
      if (route.at === "mods") {
        deps.acts.close();
        return true;
      }
      if (route.at === "docs" || route.at === "details" || state.openId === void 0) {
        deps.acts.go({ at: "mods" });
        return true;
      }
      deps.acts.go({ at: "details" });
      return true;
    }
    const chord = event.ctrlKey || event.metaKey;
    if (chord && event.key.toLowerCase() === "z") {
      if (inCode) return false;
      if (event.shiftKey) deps.store.redo();
      else deps.store.undo();
      return true;
    }
    if (chord && event.key.toLowerCase() === "y") {
      if (inCode) return false;
      deps.store.redo();
      return true;
    }
    if (chord && event.key.toLowerCase() === "s") {
      deps.acts.download();
      return true;
    }
    return false;
  });
  deps.overlay.onClose(() => {
    unsubscribe();
    current?.dispose();
    current = void 0;
    tips.dispose();
  });
  return {
    dispose() {
      deps.overlay.close();
    }
  };
}
function subtitleFor(state, name) {
  if (state.route.at === "tour") return "What people usually make, and where each one is written down";
  if (state.route.at === "docs") return "The Neo Angband SDK tutorials and authoring references";
  if (name === void 0) return "Make your own mod, without leaving the game";
  const size = Object.keys(state.drafts).length;
  return `${name} - ${size} unfinished mod${size === 1 ? "" : "s"} in this install`;
}
function statusFor(state, draft) {
  if (draft === void 0) return "Nothing is open.";
  const verdict = state.verdict;
  if (verdict.broke !== void 0) return `The workshop could not check this: ${verdict.broke}`;
  if (verdict.stale || verdict.revision !== state.revision) return "Checking.";
  if (!verdict.build) return `${draft.changes.length} change${draft.changes.length === 1 ? "" : "s"}.`;
  const errors = verdict.build.findings.filter((f) => f.level === "error").length;
  return errors === 0 ? `${draft.changes.length} change${draft.changes.length === 1 ? "" : "s"}, and this will install.` : `${errors} error${errors === 1 ? "" : "s"} to fix before this will install.`;
}
function leafName(route) {
  switch (route.at) {
    case "kinds":
      return "What are you making";
    case "base":
      return route.mode === "new" ? `Base a new ${route.file}` : `Change a ${route.file}`;
    case "record":
      return route.path === "" ? "Editing" : route.path;
    case "rebalance":
      return `Retune ${route.file}`;
    case "verdict":
      return "Review";
    case "test":
      return "Test";
    case "files":
      return route.path === "" ? "Files" : route.path;
    case "search":
      return "Search";
    case "diff":
      return `Compare ${route.path}`;
    case "docs":
      return "Docs";
    case "about":
      return "About";
    default:
      return void 0;
  }
}

// src/ui/launch.ts
var LAUNCH_PHASES = ["brand", "tagline", "ready"];
var LAUNCH_STEP_MS = 320;
var LAUNCH_AUTO_MS = 1100;
var LAUNCH_FADE_MS = 260;
function nextLaunchPhase(phase) {
  return LAUNCH_PHASES[LAUNCH_PHASES.indexOf(phase) + 1];
}
function timerFns(deps) {
  return {
    after: deps.setTimeout ?? ((fn, ms) => setTimeout(fn, ms)),
    cancel: deps.clearTimeout ?? ((handle2) => clearTimeout(handle2))
  };
}
function runLaunchSequence(onPhase, deps = {}) {
  const { after, cancel } = timerFns(deps);
  let phase = "brand";
  let handle2;
  let finished = false;
  const tick = () => {
    const next = nextLaunchPhase(phase);
    if (next === void 0) {
      finished = true;
      return;
    }
    phase = next;
    onPhase(phase);
    if (nextLaunchPhase(phase) !== void 0) handle2 = after(tick, LAUNCH_STEP_MS);
    else finished = true;
  };
  onPhase(phase);
  handle2 = after(tick, LAUNCH_STEP_MS);
  return {
    get phase() {
      return phase;
    },
    skip() {
      if (finished) return;
      cancel(handle2);
      finished = true;
      const last = LAUNCH_PHASES[LAUNCH_PHASES.length - 1];
      if (last !== void 0 && phase !== last) {
        phase = last;
        onPhase(phase);
      }
    },
    dispose() {
      if (!finished) cancel(handle2);
      finished = true;
    }
  };
}
var LAUNCH_TAGLINE = "Make your own Neo Angband mod from inside the game.";
function mountLaunch(overlay, opts) {
  const { after, cancel } = timerFns(opts.timers ?? {});
  const illum = h("div", { class: "mb-launch-illum", text: "M" });
  const title = h("h1", { class: "mb-launch-title", text: "ModForge" });
  const tagline = h("p", { class: "mb-launch-tagline", text: LAUNCH_TAGLINE });
  let settled = false;
  let autoHandle;
  const clearAuto = () => {
    if (autoHandle !== void 0) {
      cancel(autoHandle);
      autoHandle = void 0;
    }
  };
  const enterButton = () => button({ label: "Enter the workshop", kind: "primary", onClick: () => finish(opts.onEnter) });
  const docsButton = () => button({
    label: "Read the SDK docs",
    kind: "ghost",
    onClick: () => {
      if (opts.onDocs !== void 0) finish(opts.onDocs);
    }
  });
  let enterBtn = enterButton();
  const readmeBtn = button({
    label: "Read the README",
    kind: "ghost",
    onClick: () => {
      clearAuto();
      fill(
        body,
        h("div", { class: "mb-launch-readme mb-readme-card mb-prose" }, ...readmeElements()),
        h(
          "div",
          { class: "mb-launch-actions" },
          button({ label: "Back", onClick: showFront }),
          enterButton(),
          opts.onDocs === void 0 ? null : docsButton()
        )
      );
    }
  });
  const body = h("div", { class: "mb-launch-card" });
  function showFront() {
    enterBtn = enterButton();
    fill(
      body,
      illum,
      title,
      tagline,
      h("div", { class: "mb-launch-actions" }, enterBtn, readmeBtn, opts.onDocs === void 0 ? null : docsButton())
    );
  }
  showFront();
  const skip = button({ label: "Skip", kind: "ghost", tiny: true, onClick: () => finish(opts.onEnter) });
  skip.classList.add("mb-launch-skip");
  const panel = h("div", { class: "mb-launch", role: "dialog", aria: { label: "ModForge" } }, skip, body);
  overlay.root.appendChild(panel);
  panel.dataset["phase"] = "brand";
  let revealHandle = after(() => {
    revealHandle = void 0;
    panel.dataset["shown"] = "1";
  }, 0);
  const sequencer = runLaunchSequence((phase) => {
    panel.dataset["phase"] = phase;
    if (phase === "ready") {
      enterBtn.focus();
      if (!opts.firstRun) autoHandle = after(() => finish(opts.onEnter), LAUNCH_AUTO_MS);
    }
  }, opts.timers);
  const teardown = () => {
    clearAuto();
    sequencer.dispose();
    if (revealHandle !== void 0) {
      cancel(revealHandle);
      revealHandle = void 0;
    }
    panel.dataset["shown"] = "0";
    after(() => panel.remove(), LAUNCH_FADE_MS);
  };
  function finish(action) {
    if (settled) return;
    settled = true;
    teardown();
    action();
  }
  overlay.onKey((event) => {
    if (settled) return false;
    if (event.key === "Escape") {
      finish(opts.onCancel);
      return true;
    }
    if (event.key === "Enter") {
      const active = overlay.root.activeElement;
      if (active instanceof HTMLButtonElement && panel.contains(active)) {
        active.click();
        return true;
      }
      finish(opts.onEnter);
      return true;
    }
    return false;
  });
  return {
    dispose() {
      settled = true;
      clearAuto();
      sequencer.dispose();
      if (revealHandle !== void 0) {
        cancel(revealHandle);
        revealHandle = void 0;
      }
    },
    focus() {
      enterBtn.focus();
    }
  };
}
var EXIT_MS = 550;
function mountExit(overlay, opts) {
  const { after } = timerFns(opts.timers ?? {});
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    opts.onDone();
  };
  const panel = h(
    "div",
    {
      class: "mb-exit",
      role: "status",
      aria: { label: "Leaving ModForge" },
      on: { click: finish }
    },
    h(
      "div",
      { class: "mb-exit-card" },
      h("div", { class: "mb-exit-title", text: "Leaving ModForge..." }),
      h("div", { class: "mb-exit-note", text: "Back to the game. Unfinished work is kept." })
    )
  );
  overlay.root.appendChild(panel);
  after(() => {
    panel.dataset["shown"] = "1";
  }, 0);
  overlay.onKey(() => {
    finish();
    return true;
  });
  after(finish, EXIT_MS);
}

// src/ui/theme.ts
var THEME_CSS = `
/* ---------------------------------------------------------------- *
 * Tokens                                                            *
 * ---------------------------------------------------------------- */

:host {
  /* Dark: oiled stone and lamplight. */
  --ink: #f1e6cf;
  --ink-dim: #c2b695;
  /* MEASURED against the surfaces it actually sits on. The third step of ink
   * carries real information - a field's measured type, a rule id, the share of
   * the game's records that use a field - and at eleven and twelve pixels the
   * old value read at 3.0 to 3.7 against a card. This reads at 4.8 to 6.3. */
  --ink-faint: #a0977b;
  --canvas: #171b1a;
  --surface: #222721;
  --surface-2: #2c312a;
  --surface-3: #363c33;
  --stone: #101615;
  /* The hairline that draws every card, field and table row. The old value was
   * 1.34 against a card, which is a boundary the reader has to hunt for. */
  --edge: #4a5145;
  --edge-strong: #746037;
  --gold: #e0bb64;
  --gold-bright: #f4d584;
  --gold-dim: #9d8340;
  --ember: #f07147;
  --danger: #fa967b;
  --warn: #ecc66b;
  --good: #91c99c;
  --focus: #7cc5c8;
  --scrim: rgba(7, 9, 11, 0.91);

  --paper-a: rgba(255, 255, 255, 0.018);
  --paper-b: rgba(0, 0, 0, 0.16);

  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif;
  --font-body: "Segoe UI", Inter, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

  /* The type scale. Named for the job, because a rule that says 12.5px says
   * nothing about why, and three rules that each say a different fraction of a
   * pixel are three rules nobody can keep in step. */
  /* The workshop is a desktop surface as well as a phone-width one. Fixed
   * pixels made every control look like a postage stamp in a 4K Electron
   * window, even though the overlay itself filled the viewport. The minimums
   * preserve the 1280px treatment; the viewport terms give a larger window
   * proportionately larger, still-capped type rather than an empty black sea. */
  --fs-micro: clamp(11px, 0.58vw, 22px);   /* a rule id, a count, a measured share */
  --fs-small: clamp(12px, 0.64vw, 24px);   /* a note, a tag, a table cell, a breadcrumb */
  --fs-ui: clamp(13px, 0.70vw, 26px);      /* anything the reader operates: controls and list rows */
  --fs-body: clamp(14px, 0.78vw, 28px);    /* running text */
  --fs-title: clamp(15px, 0.84vw, 30px);   /* the title on a card */
  --fs-head: clamp(17px, 0.95vw, 34px);    /* a heading inside a screen */
  --fs-screen: clamp(20px, 1.12vw, 40px);  /* the screen's own title */
  --fs-brand: clamp(28px, 1.56vw, 56px);   /* the illuminated initial */
  --fs-hero: clamp(34px, 1.90vw, 68px);    /* the launch mark, and an empty state's glyph */
  --fs-mark: clamp(42px, 2.34vw, 84px);    /* the launch screen's own initial, and nothing else */

  --r-sm: 3px;
  --r: 5px;
  --r-lg: 9px;
  --gap: clamp(12px, 0.75vw, 28px);
  --pad: clamp(16px, 1vw, 36px);
  /* One indent for the titlebar, the breadcrumb, the banner, the content and the
   * status bar, so the window has a single left edge instead of five. */
  --gutter: clamp(16px, 1vw, 36px);
  /* How wide a screen that is one column lets itself get. A form whose text
   * fields are a thousand pixels wide is a form nobody laid out. */
  --page: clamp(900px, 58vw, 2200px);
  /* How wide one control gets, so a select holding the word "add" stops being
   * the widest thing on the screen. */
  --control: clamp(560px, 46vw, 1180px);
  --rail: clamp(200px, 16vw, 420px);
  --aside: clamp(240px, 20vw, 480px);

  --shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  --inset: inset 0 1px 0 rgba(255, 255, 255, 0.045);

  --motion: 140ms;

  color-scheme: dark;
}

:host(.mb-parchment) {
  /* Parchment: iron-gall ink on aged rag paper. */
  --ink: #27271f;
  --ink-dim: #57513f;
  --ink-faint: #6f6750;
  --canvas: #e7d8b6;
  --surface: #f6efdd;
  --surface-2: #fbf5e7;
  --surface-3: #fffaee;
  --stone: #d6c49c;
  --edge: #c3ac7f;
  --edge-strong: #b79a5e;
  --gold: #8a6519;
  --gold-bright: #a87d22;
  --gold-dim: #b8a271;
  --ember: #a3401f;
  --danger: #a63d32;
  --warn: #8a5a12;
  --good: #33604a;
  --focus: #1e6169;
  --scrim: rgba(20, 16, 10, 0.86);

  --paper-a: rgba(120, 84, 30, 0.05);
  --paper-b: rgba(120, 84, 30, 0.028);

  --shadow: 0 18px 48px rgba(40, 28, 10, 0.4);
  --inset: inset 0 1px 0 rgba(255, 255, 255, 0.5);

  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }

/* ---------------------------------------------------------------- *
 * The frame                                                         *
 * ---------------------------------------------------------------- */

.mb-scrim {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: grid;
  place-items: stretch;
  padding: clamp(0px, 1.5vmin, 36px);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.45;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

/* FIVE CHILDREN, FIVE ROWS, and the fifth is why this line is spelled out.
 * There were four track sizes for five elements, so the BANNER got the 1fr and
 * the body got an implicit auto - which meant the banner grew to swallow every
 * pixel of leftover height on any screen whose content was shorter than the
 * window, and an empty 1fr row opened the same gap on an install where the
 * banner is hidden altogether. The content is the thing that takes the slack. */
.mb-frame {
  position: relative;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--edge-strong);
  border-radius: var(--r-lg);
  background:
    radial-gradient(120% 90% at 12% 0%, var(--paper-a), transparent 62%),
    radial-gradient(90% 70% at 100% 100%, var(--paper-b), transparent 58%),
    linear-gradient(174deg, var(--surface-2) 0%, var(--surface) 46%, var(--canvas) 100%);
  box-shadow: var(--shadow), var(--inset);
}

/* A hairline of gold just inside the border: the gilt edge of a bound book. */
.mb-frame::before {
  content: "";
  position: absolute;
  inset: 3px;
  border: 1px solid color-mix(in srgb, var(--gold) 26%, transparent);
  border-radius: calc(var(--r-lg) - 2px);
  pointer-events: none;
}

/* ---------------------------------------------------------------- *
 * Title bar                                                         *
 * ---------------------------------------------------------------- */

.mb-titlebar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--gap);
  padding: 10px var(--gutter) 8px;
  border-bottom: 1px solid var(--edge);
  background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 7%, transparent), transparent);
}

.mb-illum {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  font-family: var(--font-display);
  font-size: var(--fs-brand);
  font-weight: 600;
  line-height: 1;
  color: var(--gold-bright);
  border: 1px solid var(--edge-strong);
  border-radius: var(--r);
  background:
    radial-gradient(120% 120% at 30% 10%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 70%),
    var(--stone);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
}

.mb-titles { min-width: 0; }

.mb-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-screen);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mb-subtitle {
  margin: 1px 0 0;
  font-size: var(--fs-small);
  color: var(--ink-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mb-titleacts { display: flex; align-items: center; gap: 6px; }

/* ---------------------------------------------------------------- *
 * Breadcrumb and banner                                             *
 * ---------------------------------------------------------------- */

.mb-crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 7px calc(var(--gutter) - 5px);
  border-bottom: 1px solid var(--edge);
  font-size: var(--fs-small);
  color: var(--ink-dim);
  background: color-mix(in srgb, var(--stone) 40%, transparent);
}

.mb-crumb {
  appearance: none;
  border: 0;
  background: none;
  padding: 2px 5px;
  border-radius: var(--r-sm);
  font: inherit;
  color: var(--gold);
  cursor: pointer;
  transition: background var(--motion) ease, color var(--motion) ease;
}
.mb-crumb:hover { background: color-mix(in srgb, var(--gold) 12%, transparent); }
.mb-crumb:active { background: color-mix(in srgb, var(--gold) 20%, transparent); }
/* The crumb for where the reader already is goes nowhere, so it stops offering
 * to: no pointer, no hover, no colour change under the mouse. */
.mb-crumb[aria-current="page"] { color: var(--ink); cursor: default; }
.mb-crumb[aria-current="page"]:hover,
.mb-crumb[aria-current="page"]:active { background: none; }
.mb-crumb-sep { opacity: 0.5; user-select: none; }

.mb-banner {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 0;
  padding: 9px var(--gutter);
  border-bottom: 1px solid color-mix(in srgb, var(--warn) 40%, var(--edge));
  background: color-mix(in srgb, var(--warn) 12%, transparent);
  font-size: var(--fs-ui);
  color: var(--ink);
}
.mb-banner b { color: var(--warn); font-weight: 600; }

/* ---------------------------------------------------------------- *
 * Three columns                                                     *
 * ---------------------------------------------------------------- */

.mb-body { min-height: 0; display: grid; }

.mb-cols {
  display: grid;
  grid-template-columns: minmax(200px, var(--rail)) minmax(0, 1fr) minmax(240px, var(--aside));
  min-height: 0;
}
.mb-cols.mb-cols-2 { grid-template-columns: minmax(0, 1fr) minmax(260px, var(--aside)); }
.mb-cols.mb-cols-1 { grid-template-columns: minmax(0, 1fr); }

.mb-rail, .mb-main, .mb-aside {
  min-height: 0;
  min-width: 0;
  overflow: auto;
  overscroll-behavior: contain;
}
.mb-rail { border-right: 1px solid var(--edge); background: color-mix(in srgb, var(--stone) 30%, transparent); }
.mb-aside { border-left: 1px solid var(--edge); background: color-mix(in srgb, var(--stone) 22%, transparent); }
.mb-main { padding: var(--pad); display: flex; flex-direction: column; gap: var(--gap); }

/* A SCREEN THAT IS ONE COLUMN IS A PAGE, AND A PAGE HAS A MEASURE. Only the
 * direct child of the body is one, which is what tells a whole-screen main apart
 * from the middle column of the record editor - that one is already narrow and
 * capping it again would take width it needs. Its measure grows with a desktop
 * viewport and is centred inside the frame, so a 4K workshop does not leave all
 * of its useful content stranded in the top-left corner. */
.mb-body > .mb-main { width: min(100%, var(--page)); margin-inline: auto; }

@media (max-width: 1080px) {
  .mb-cols, .mb-cols.mb-cols-2 { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 1fr auto; }
  .mb-rail { border-right: 0; border-bottom: 1px solid var(--edge); max-height: 26vh; }
  .mb-aside { border-left: 0; border-top: 1px solid var(--edge); max-height: 34vh; }
}

@media (max-width: 720px) {
  .mb-scrim { padding: 0; }
  .mb-frame { border-radius: 0; }
  .mb-titlebar { grid-template-columns: auto minmax(0, 1fr); }
  .mb-titleacts { grid-column: 1 / -1; flex-wrap: wrap; justify-content: flex-start; }
}

/* ---------------------------------------------------------------- *
 * Cards                                                             *
 * ---------------------------------------------------------------- */

.mb-card {
  border: 1px solid var(--edge);
  border-radius: var(--r);
  background: color-mix(in srgb, var(--surface-2) 65%, transparent);
  box-shadow: var(--inset);
  overflow: hidden;
  /* MEASURED, not defensive. An overflow of hidden makes a flex item's automatic
   * minimum height resolve to zero, so in the column flex layout of a screen a
   * card shrinks until its own content is clipped away - which is exactly what it
   * did. This line is what stops that; removing it clips every card on any screen
   * with more content than height. */
  flex: none;
}

/* A head with two lines in it wants its parts aligned at the top rather than on
 * a shared baseline: the second line is a block, and a baseline through it puts
 * the badge halfway down the card. */
.mb-card-head.mb-head-stacked {
  align-items: flex-start;
  gap: 12px;
}

.mb-card-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  appearance: none;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  font: inherit;
  color: var(--ink);
  text-align: left;
}
.mb-card[data-open="1"] > .mb-card-head { border-bottom-color: var(--edge); }

/* ONLY A HEAD THAT IS A BUTTON LOOKS LIKE ONE. Half the cards in the workshop
 * have nothing to toggle and are built as a div with the same class, and those
 * were showing a pointer cursor and lighting up under the mouse - an offer to
 * do something that then did nothing, which is the gesture that teaches a reader
 * to stop trusting the ones that work. */
button.mb-card-head {
  cursor: pointer;
  transition: background var(--motion) ease;
}
button.mb-card-head:hover { background: color-mix(in srgb, var(--gold) 7%, transparent); }
button.mb-card-head:active { background: color-mix(in srgb, var(--gold) 13%, transparent); }

.mb-card-title {
  font-family: var(--font-display);
  font-size: var(--fs-title);
  font-weight: 600;
  letter-spacing: 0.01em;
}
.mb-card-note { font-size: var(--fs-small); color: var(--ink-faint); flex: 1; }
.mb-card-body { padding: 4px 12px 12px; display: flex; flex-direction: column; }
.mb-card[data-open="0"] > .mb-card-body { display: none; }

.mb-caret {
  width: 9px;
  flex: none;
  color: var(--gold-dim);
  transition: transform var(--motion) ease;
}
.mb-card[data-open="1"] .mb-caret { transform: rotate(90deg); }
.mb-caret path { fill: currentColor; }

/* ---------------------------------------------------------------- *
 * Field rows                                                        *
 * ---------------------------------------------------------------- */

.mb-field {
  display: grid;
  grid-template-columns: minmax(120px, 190px) minmax(0, 1fr);
  gap: 4px 12px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px dashed color-mix(in srgb, var(--edge) 70%, transparent);
}
.mb-field:last-child { border-bottom: 0; }
.mb-field[data-focused="1"] { background: color-mix(in srgb, var(--gold) 6%, transparent); }

.mb-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 4px;
  min-width: 0;
}
.mb-label-name {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--ink);
  overflow-wrap: anywhere;
}
.mb-label-meta { font-size: var(--fs-micro); color: var(--ink-faint); }

/* ONE CONTROL IS NOT A COLUMN. Left uncapped, every text box on the details
 * screen was as wide as the window, which reads as a form nobody laid out and
 * puts the label and its value a thousand pixels apart. */
.mb-control { display: flex; flex-direction: column; gap: 5px; min-width: 0; max-width: var(--control); }
.mb-control-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.mb-why {
  font-size: var(--fs-small);
  color: var(--ink-dim);
  font-style: italic;
}
.mb-why b { font-style: normal; color: var(--gold); font-weight: 600; }

/* What a fork could not carry, listed under the card that took it. Set apart
   from the controls above it because it is an outcome to read rather than
   another thing to press. */
.mb-fork-notes:not(:empty) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 10px;
  border-left: 2px solid var(--gold-dim);
  background: var(--surface-2);
}

.mb-mark {
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  flex: none;
  border-radius: 50%;
  font-size: var(--fs-micro);
  font-weight: 700;
  font-family: var(--font-body);
}
.mb-mark[data-level="error"] { background: color-mix(in srgb, var(--danger) 26%, transparent); color: var(--danger); }
.mb-mark[data-level="warn"] { background: color-mix(in srgb, var(--warn) 24%, transparent); color: var(--warn); }
.mb-mark[data-level="hint"] { background: color-mix(in srgb, var(--focus) 20%, transparent); color: var(--focus); }

/* ---------------------------------------------------------------- *
 * Controls                                                          *
 * ---------------------------------------------------------------- */

input[type="text"], input[type="number"], input[type="search"], textarea, select {
  font: inherit;
  font-size: var(--fs-ui);
  color: var(--ink);
  background: var(--surface-3);
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  padding: 5px 7px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  transition: border-color var(--motion) ease, background var(--motion) ease;
}
input[type="text"]:hover:not(:disabled),
input[type="number"]:hover:not(:disabled),
input[type="search"]:hover:not(:disabled),
textarea:hover:not(:disabled),
select:hover:not(:disabled) { border-color: var(--edge-strong); }
input[type="number"] { max-width: 130px; font-family: var(--font-mono); }
/* A PICKER IS AS WIDE AS ITS WIDEST OPTION, NOT AS WIDE AS THE SCREEN, and a
 * filter box is a filter box rather than a headline. Both were stretching to
 * whatever the row gave them. */
select { max-width: 280px; }
input[type="search"] { max-width: 340px; }
textarea { resize: vertical; line-height: 1.5; }

/* DISABLED HAS TO LOOK DISABLED, INCLUDING A FIELD. Only buttons were dimmed,
 * so the Test panel's number boxes looked live while refusing every keystroke. */
input:disabled, textarea:disabled, select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-style: dashed;
}

input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 1px;
}
input[aria-invalid="true"], textarea[aria-invalid="true"] {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, var(--surface-3));
}
input::placeholder, textarea::placeholder { color: var(--ink-faint); }

/* A tick box drawn by the browser, in the workshop's own colours rather than the
 * operating system's blue. */
input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--gold);
  cursor: pointer;
}
input[type="checkbox"]:disabled { cursor: not-allowed; opacity: 0.5; }

/* A file picker is two controls in one element, and only the button half of it
 * can be styled. Doing that is the difference between the workshop's own row of
 * buttons and one grey system control sitting in the middle of it. */
input[type="file"] {
  font: inherit;
  font-size: var(--fs-small);
  font-style: normal;
  color: var(--ink-dim);
  max-width: 100%;
}
input[type="file"]::file-selector-button {
  font: inherit;
  font-size: var(--fs-small);
  font-style: normal;
  color: var(--ink);
  background: linear-gradient(180deg, var(--surface-3), var(--surface-2));
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  padding: 3px 9px;
  margin-right: 8px;
  cursor: pointer;
  transition: background var(--motion) ease, border-color var(--motion) ease;
}
input[type="file"]::file-selector-button:hover { border-color: var(--edge-strong); background: var(--surface-3); }

.mb-mono { font-family: var(--font-mono); }

.mb-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font: inherit;
  font-size: var(--fs-ui);
  color: var(--ink);
  background: linear-gradient(180deg, var(--surface-3), var(--surface-2));
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background var(--motion) ease, border-color var(--motion) ease, transform var(--motion) ease;
  white-space: nowrap;
}
.mb-btn:hover:not(:disabled) { border-color: var(--edge-strong); background: var(--surface-3); }
.mb-btn:active:not(:disabled) { transform: translateY(1px); background: var(--surface-2); }
.mb-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.mb-btn.mb-primary {
  color: var(--stone);
  border-color: var(--gold-dim);
  background: linear-gradient(180deg, var(--gold-bright), var(--gold));
  font-weight: 600;
}
:host(.mb-parchment) .mb-btn.mb-primary { color: #fdf6e6; }
.mb-btn.mb-primary:hover:not(:disabled) { background: var(--gold-bright); border-color: var(--gold); }
.mb-btn.mb-primary:active:not(:disabled) { background: var(--gold); }

.mb-btn.mb-danger { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 45%, var(--edge)); }
.mb-btn.mb-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--danger) 14%, transparent); }
.mb-btn.mb-danger:active:not(:disabled) { background: color-mix(in srgb, var(--danger) 22%, transparent); }

/* A QUIET BUTTON IS STILL A BUTTON. With no border at all these read as captions
 * next to the two bordered controls they sit beside - "Retune many" and "Start
 * from nothing instead" were both offers nobody could see. A hairline is enough
 * to say it can be pressed without competing with the primary action. */
.mb-btn.mb-ghost {
  background: none;
  border-color: color-mix(in srgb, var(--edge) 60%, transparent);
  color: var(--ink-dim);
}
.mb-btn.mb-ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--gold) 10%, transparent);
  border-color: var(--edge);
  color: var(--ink);
}
.mb-btn.mb-ghost:active:not(:disabled) { background: color-mix(in srgb, var(--gold) 16%, transparent); }

.mb-btn.mb-tiny { padding: 2px 7px; font-size: var(--fs-small); }

/* The one irreversible button in the workshop wears a seal. Decoration around a
 * real button, never instead of one: the label still says what it does and the
 * focus ring still lands where a focus ring belongs. */
.mb-seal {
  position: relative;
  padding-left: 34px;
}
.mb-seal::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translateY(-50%);
  border-radius: 50% 46% 52% 48% / 48% 52% 46% 50%;
  background:
    radial-gradient(70% 70% at 34% 28%, color-mix(in srgb, #ffffff 34%, transparent), transparent 60%),
    linear-gradient(150deg, #a8321f, #6d1d12);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.4);
}

.mb-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 4px 2px 8px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--ink);
  background: color-mix(in srgb, var(--gold) 13%, var(--surface-3));
  border: 1px solid color-mix(in srgb, var(--gold) 30%, var(--edge));
  border-radius: 999px;
}
.mb-chip button {
  appearance: none;
  border: 0;
  background: none;
  color: var(--ink-faint);
  font: inherit;
  line-height: 1;
  padding: 1px 3px;
  border-radius: 50%;
  cursor: pointer;
  transition: background var(--motion) ease, color var(--motion) ease;
}
.mb-chip button:hover { color: var(--danger); background: color-mix(in srgb, var(--danger) 18%, transparent); }
.mb-chips { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }

.mb-switch { display: inline-flex; align-items: center; gap: 7px; font-size: var(--fs-ui); cursor: pointer; }
.mb-switch input { width: auto; }

/* ---------------------------------------------------------------- *
 * Nested rows (an array of objects)                                 *
 * ---------------------------------------------------------------- */

.mb-rows { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.mb-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--stone) 26%, transparent);
}
.mb-row-index {
  font-family: var(--font-mono);
  font-size: var(--fs-micro);
  color: var(--ink-faint);
  min-width: 1.4em;
  text-align: right;
}
.mb-row-summary {
  font-size: var(--fs-ui);
  color: var(--ink-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mb-row-acts { display: flex; gap: 3px; }

/* ---------------------------------------------------------------- *
 * Lists (records, kinds, mods)                                     *
 * ---------------------------------------------------------------- */

.mb-listhead {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 9px 10px;
  border-bottom: 1px solid var(--edge);
  background: linear-gradient(180deg, var(--surface-2), color-mix(in srgb, var(--surface-2) 82%, transparent));
  backdrop-filter: blur(3px);
}

/* THE SAME IDEA, ONE TREATMENT. A list's head and a column's section title are
 * both "the name of the block below", and they were two sizes and two letter
 * spacings apart for no reason anybody could have named. */
.mb-listhead h3, .mb-aside-title {
  margin: 0 0 7px;
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.mb-listhead h3 { margin-bottom: 6px; }

.mb-list { list-style: none; margin: 0; padding: 4px; display: flex; flex-direction: column; gap: 2px; }
.mb-listrow {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  appearance: none;
  border: 1px solid transparent;
  border-radius: var(--r-sm);
  background: none;
  font: inherit;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: background var(--motion) ease, border-color var(--motion) ease;
}
.mb-listrow:hover { background: color-mix(in srgb, var(--gold) 9%, transparent); }
.mb-listrow:active { background: color-mix(in srgb, var(--gold) 15%, transparent); }
.mb-listrow[aria-selected="true"] {
  border-color: color-mix(in srgb, var(--gold) 50%, transparent);
  background: color-mix(in srgb, var(--gold) 15%, transparent);
}
/* A row's two lines have to BE two lines. Both are inline elements, and
 * ellipsis-on-nowrap does nothing to an inline box, so without this the name and
 * the note run together into one unreadable string - which is what they did. */
.mb-listrow-main { min-width: 0; display: grid; }
.mb-listrow-name {
  display: block;
  font-size: var(--fs-ui);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mb-listrow-meta {
  display: block;
  font-size: var(--fs-micro);
  color: var(--ink-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mb-badge {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--gold);
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  background: var(--stone);
}

.mb-tag {
  font-size: var(--fs-micro);
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--edge);
  color: var(--ink-faint);
  white-space: nowrap;
}
.mb-tag[data-tone="mod"] { color: var(--focus); border-color: color-mix(in srgb, var(--focus) 45%, transparent); }
.mb-tag[data-tone="mine"] { color: var(--gold); border-color: color-mix(in srgb, var(--gold) 50%, transparent); }

/* ---------------------------------------------------------------- *
 * The kind picker                                                   *
 * ---------------------------------------------------------------- */

.mb-kinds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
  gap: 10px;
}
.mb-kind {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  text-align: left;
  appearance: none;
  border: 1px solid var(--edge);
  border-radius: var(--r);
  background: color-mix(in srgb, var(--surface-2) 60%, transparent);
  font: inherit;
  color: var(--ink);
  transition: border-color var(--motion) ease, background var(--motion) ease;
}
/* The card is a container for three offers rather than an offer itself, so it
 * lights up when the reader is over it and never claims to be pressable. */
.mb-kind:hover {
  border-color: var(--edge-strong);
  background: color-mix(in srgb, var(--gold) 8%, var(--surface-2));
}
.mb-kind:focus-within { border-color: var(--focus); }
.mb-kind-badge {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  font-family: var(--font-mono);
  font-size: var(--fs-head);
  color: var(--gold-bright);
  border: 1px solid var(--edge-strong);
  border-radius: var(--r-sm);
  background: radial-gradient(120% 120% at 30% 15%, color-mix(in srgb, var(--gold) 18%, transparent), transparent 70%), var(--stone);
}
.mb-kind-title { font-family: var(--font-display); font-size: var(--fs-title); font-weight: 600; }
.mb-kind-blurb { font-size: var(--fs-small); color: var(--ink-dim); margin-top: 2px; }

/* ---------------------------------------------------------------- *
 * Findings and evidence                                             *
 * ---------------------------------------------------------------- */

.mb-aside-section { padding: 10px; border-bottom: 1px solid var(--edge); }
.mb-aside-section:last-child { border-bottom: 0; }
.mb-aside-title {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.mb-aside-title .mb-count { font-family: var(--font-mono); letter-spacing: 0; text-transform: none; color: var(--ink-faint); }

.mb-stale { font-size: var(--fs-micro); color: var(--warn); font-style: italic; }

.mb-findings { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.mb-finding {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 7px;
  width: 100%;
  padding: 6px 7px;
  appearance: none;
  border: 1px solid var(--edge);
  border-left-width: 3px;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--stone) 30%, transparent);
  font: inherit;
  font-size: var(--fs-small);
  color: var(--ink);
  text-align: left;
  transition: background var(--motion) ease;
}
.mb-finding[data-level="error"] { border-left-color: var(--danger); }
.mb-finding[data-level="warn"] { border-left-color: var(--warn); }
.mb-finding[data-level="hint"] { border-left-color: var(--focus); }
/* Only the ones that go somewhere offer to. A finding with no field behind it is
 * built as a div, and a div that highlighted under the mouse was an invitation
 * to click something that could not answer. */
button.mb-finding { cursor: pointer; }
button.mb-finding:hover { background: color-mix(in srgb, var(--gold) 9%, transparent); }
button.mb-finding:active { background: color-mix(in srgb, var(--gold) 15%, transparent); }
.mb-finding-rule { font-family: var(--font-mono); font-size: var(--fs-micro); color: var(--ink-faint); margin-top: 2px; }

.mb-peers { width: 100%; border-collapse: collapse; font-size: var(--fs-small); }
.mb-peers th, .mb-peers td {
  padding: 3px 6px;
  text-align: left;
  border-bottom: 1px solid color-mix(in srgb, var(--edge) 70%, transparent);
  white-space: nowrap;
}
.mb-peers th { font-weight: 600; color: var(--ink-dim); font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.04em; }
.mb-peers td.mb-num { font-family: var(--font-mono); text-align: right; }
.mb-peers col.mb-focus-col, .mb-peers .mb-focus-cell { background: color-mix(in srgb, var(--gold) 12%, transparent); }
.mb-scrollx { overflow-x: auto; }

.mb-stat { display: flex; gap: 12px; flex-wrap: wrap; font-size: var(--fs-small); color: var(--ink-dim); margin-bottom: 6px; }
.mb-stat b { color: var(--ink); font-family: var(--font-mono); font-weight: 600; }

/* ---------------------------------------------------------------- *
 * Status bar                                                        *
 * ---------------------------------------------------------------- */

.mb-status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--gap);
  padding: 8px var(--gutter);
  border-top: 1px solid var(--edge);
  background: linear-gradient(0deg, color-mix(in srgb, var(--gold) 6%, transparent), transparent);
  font-size: var(--fs-small);
}
.mb-status-text { color: var(--ink-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mb-status-text[data-tone="good"] { color: var(--good); }
.mb-status-text[data-tone="bad"] { color: var(--danger); }
.mb-status-acts { display: flex; gap: 6px; align-items: center; }

/* ---------------------------------------------------------------- *
 * Prose, code and empties                                          *
 * ---------------------------------------------------------------- */

.mb-prose { max-width: 68ch; font-size: var(--fs-body); }
.mb-prose h2 {
  font-family: var(--font-display);
  font-size: var(--fs-screen);
  font-weight: 600;
  margin: 0 0 8px;
}
.mb-prose h3 {
  font-family: var(--font-display);
  font-size: var(--fs-title);
  font-weight: 600;
  margin: 18px 0 4px;
}
.mb-prose p { margin: 0 0 10px; }
.mb-prose ol, .mb-prose ul { margin: 0 0 10px; padding-left: 22px; }
.mb-prose li { margin-bottom: 5px; }
.mb-prose code {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  padding: 1px 4px;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--gold) 12%, var(--stone));
}
.mb-prose strong { color: var(--gold); font-weight: 600; }

/* The README is shown both over the launch scrim and as the About screen. Give
 * the shared copy the same backed treatment as the workshop's other cards, and
 * set its ink explicitly because the launch layer is a sibling of mb-scrim and
 * does not inherit that element's foreground colour. */
.mb-readme-card {
  width: min(100%, 68ch);
  padding: 14px 16px;
  color: var(--ink);
  border: 1px solid var(--edge);
  border-radius: var(--r);
  background: var(--surface-2);
  box-shadow: var(--inset);
}

.mb-code {
  margin: 0;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  line-height: 1.55;
  color: var(--ink-dim);
  background: var(--stone);
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  overflow: auto;
  max-height: 44vh;
  white-space: pre;
  tab-size: 2;
}
.mb-filename {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--gold);
  margin-bottom: 4px;
}

/* ---------------------------------------------------------------- *
 * The file editor                                                   *
 * ---------------------------------------------------------------- *
 *
 * TWO LAYERS THAT MUST AGREE ON EVERY CHARACTER'S POSITION, so every property
 * that can move one is written twice and identically: the family, the size, the
 * line height IN PIXELS, the padding, the tab size and the white-space rule.
 * A ratio line height is rounded per line and the picture drifts down a long
 * file; a token span that changed weight or slant would change how wide its
 * characters are. So the token classes below set a colour and nothing else, and
 * the numbers here are the same numbers editor.ts does its arithmetic with.
 */

.mb-ed {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  background: var(--stone);
  overflow: hidden;
  transition: border-color var(--motion) ease, box-shadow var(--motion) ease;
}
/* THE ONE PLACE THE FOCUS RING HAD TO BE DRAWN BY HAND. The textarea suppresses
 * its own outline on purpose - it is transparent text over a painted layer, and
 * a ring around it would sit inside the gutter - so without this the editor was
 * the only control in the workshop that gave a keyboard user no sign at all that
 * it held the caret. */
.mb-ed:focus-within {
  border-color: var(--focus);
  box-shadow: 0 0 0 1px var(--focus);
}
.mb-ed-body { display: flex; min-height: 0; height: 52vh; }

.mb-ed-gutter {
  position: relative;
  overflow: hidden;
  flex: none;
  width: 46px;
  border-right: 1px solid var(--edge);
  background: color-mix(in srgb, var(--stone) 60%, var(--surface));
}
.mb-ed-nums {
  position: absolute;
  top: 0;
  right: 6px;
  margin: 0;
  padding: 8px 0;
  text-align: right;
  white-space: pre;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 18px;
  color: var(--ink-faint);
  user-select: none;
}

.mb-ed-box { position: relative; flex: 1; min-width: 0; overflow: hidden; }

.mb-ed-hl,
.mb-ed-area {
  margin: 0;
  padding: 8px;
  border: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 18px;
  white-space: pre;
  tab-size: 2;
  letter-spacing: 0;
  word-spacing: 0;
}

.mb-ed-hl {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  color: var(--ink-dim);
  pointer-events: none;
  overflow: visible;
}

.mb-ed-area {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  resize: none;
  overflow: auto;
  background: transparent;
  /* The text is drawn by the layer behind. The caret is not, so it stays visible
   * and stays the reader's own colour. */
  color: transparent;
  caret-color: var(--gold-bright);
  outline: none;
}
.mb-ed-area::selection { background: color-mix(in srgb, var(--focus) 40%, transparent); }
.mb-ed-area:focus { outline: none; }

/* Colour, and only colour. See the note at the top of this section. */
.mb-t-str { color: #9fc98b; }
.mb-t-num { color: #e0bb64; }
.mb-t-key { color: #7cc5c8; }
.mb-t-kw { color: #d79bd0; }
.mb-t-lit { color: #f0a35e; }
.mb-t-com { color: var(--ink-faint); }
.mb-t-punc { color: var(--ink-dim); }
.mb-t-head { color: var(--gold-bright); }
.mb-t-code { color: #9fc98b; }
.mb-t-match { color: var(--stone); background: var(--gold); border-radius: 2px; }

:host(.mb-parchment) .mb-t-str { color: #2f5d34; }
:host(.mb-parchment) .mb-t-num { color: #7a4d10; }
:host(.mb-parchment) .mb-t-key { color: #17515a; }
:host(.mb-parchment) .mb-t-kw { color: #6c2a72; }
:host(.mb-parchment) .mb-t-lit { color: #8a3a12; }
:host(.mb-parchment) .mb-t-code { color: #2f5d34; }
:host(.mb-parchment) .mb-t-match { color: var(--surface-3); background: var(--gold); }

.mb-ed-find {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid var(--edge);
  background: var(--surface-2);
}
.mb-ed-find-box { flex: 1; min-width: 0; font-family: var(--font-mono); font-size: var(--fs-small); max-width: none; }
.mb-ed-find-count { font-size: var(--fs-micro); color: var(--ink-faint); font-family: var(--font-mono); }

.mb-ed-caret { font-family: var(--font-mono); font-size: var(--fs-micro); color: var(--ink-faint); }

.mb-ed-new { display: flex; gap: 6px; align-items: center; margin-top: 8px; }
.mb-ed-new input { flex: 1; min-width: 0; font-size: var(--fs-small); }

.mb-ed-problems { display: flex; flex-direction: column; gap: 2px; }
.mb-ed-problem {
  display: flex;
  gap: 8px;
  align-items: baseline;
  width: 100%;
  padding: 4px 8px;
  text-align: left;
  font: inherit;
  font-size: var(--fs-small);
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 9%, transparent);
  border: 0;
  border-left: 2px solid var(--danger);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
}
button.mb-ed-problem { cursor: pointer; transition: background var(--motion) ease; }
button.mb-ed-problem:hover { background: color-mix(in srgb, var(--danger) 16%, transparent); }

/* A CHECK FINDING IS THE SAME ROW, COLOURED BY WHAT IT COSTS. A syntax fault carries
   no level and keeps the plain danger colouring above, because a file that is not
   JSON is not a matter of degree. */
.mb-ed-problem[data-level] {
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 9%, transparent);
  border-left-color: var(--tone);
}
button.mb-ed-problem[data-level]:hover { background: color-mix(in srgb, var(--tone) 16%, transparent); }
.mb-ed-problem[data-still] { cursor: default; }
.mb-ed-problem[data-level="error"] { --tone: var(--danger); }
.mb-ed-problem[data-level="warn"] { --tone: var(--warn); }
.mb-ed-problem[data-level="hint"] { --tone: var(--focus); }
.mb-ed-problem-text { flex: 1; min-width: 0; }
.mb-ed-problem-rule { font-family: var(--font-mono); font-size: var(--fs-micro); color: var(--ink-faint); flex: none; }

/* ---------------------------------------------------------------- *
 * The diff view                                                     *
 * ---------------------------------------------------------------- *
 *
 * THE SAME MONOSPACE NUMBERS AS THE EDITOR'S OWN GUTTER, because a diff is a
 * second reading of the same file and a reader comparing the two by eye should
 * not also have to reconcile two different type treatments.
 */

.mb-diff {
  display: flex;
  flex-direction: column;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  line-height: 1.5;
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  background: var(--stone);
  overflow: auto;
  max-height: 64vh;
}
.mb-diff-row { display: flex; white-space: pre; }
.mb-diff-num {
  flex: none;
  width: 42px;
  padding: 0 6px;
  text-align: right;
  color: var(--ink-faint);
  user-select: none;
}
.mb-diff-marker { flex: none; width: 16px; text-align: center; color: var(--ink-faint); user-select: none; }
.mb-diff-text { flex: 1; min-width: 0; white-space: pre; overflow-x: auto; color: var(--ink-dim); }
.mb-diff-row[data-kind="add"] { background: color-mix(in srgb, var(--good) 14%, transparent); }
.mb-diff-row[data-kind="add"] .mb-diff-marker,
.mb-diff-row[data-kind="add"] .mb-diff-text { color: var(--good); }
.mb-diff-row[data-kind="remove"] { background: color-mix(in srgb, var(--danger) 14%, transparent); }
.mb-diff-row[data-kind="remove"] .mb-diff-marker,
.mb-diff-row[data-kind="remove"] .mb-diff-text { color: var(--danger); }
.mb-diff-gap {
  padding: 3px 12px;
  color: var(--ink-faint);
  font-style: italic;
  background: var(--surface-2);
  border-top: 1px solid var(--edge);
  border-bottom: 1px solid var(--edge);
}

/* ---------------------------------------------------------------- *
 * Empty states                                                      *
 * ---------------------------------------------------------------- *
 *
 * ONE TREATMENT, AND IT ALWAYS HAS ROOM FOR A WAY ON. The actions used to be
 * appended after the panel and pulled back over it with a negative margin, which
 * only worked on the one screen it was written for. They are part of the panel
 * now, so every empty state in the workshop can offer a next action and they all
 * look the same when they do.
 */

.mb-empty {
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 40px 20px;
  text-align: center;
  color: var(--ink-faint);
}
.mb-empty-glyph {
  font-family: var(--font-mono);
  font-size: var(--fs-hero);
  color: var(--gold-dim);
  opacity: 0.7;
}
.mb-empty-title { font-family: var(--font-display); font-size: var(--fs-head); color: var(--ink-dim); }
.mb-empty-blurb { max-width: 52ch; }
.mb-empty-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }

.mb-row-actions { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; }
.mb-spacer { flex: 1; }
.mb-hr { height: 1px; background: var(--edge); border: 0; margin: 4px 0; }

/* ---------------------------------------------------------------- *
 * Tooltip                                                           *
 * ---------------------------------------------------------------- */

.mb-tip {
  position: fixed;
  z-index: 40;
  max-width: 300px;
  padding: 7px 9px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  line-height: 1.4;
  color: var(--ink);
  background: var(--surface-3);
  border: 1px solid var(--edge-strong);
  border-radius: var(--r-sm);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  opacity: 0;
  transform: translateY(3px);
  transition: opacity var(--motion) ease, transform var(--motion) ease;
}
.mb-tip[data-shown="1"] { opacity: 1; transform: translateY(0); }

/* ---------------------------------------------------------------- *
 * The launch screen and the exit screen                             *
 * ---------------------------------------------------------------- *
 *
 * Both sit above the workshop's own frame (which has no z-index of its own,
 * so anything after it in the shadow root already paints on top) rather than
 * inside it, because both are about the workshop as a whole rather than
 * about any one screen of it.
 *
 * WHICH IS ALSO WHY THEY HAVE TO STATE THEIR OWN TYPOGRAPHY. They are siblings
 * of mb-scrim rather than children of it, so they inherited neither its family
 * nor its size nor its ink - and what they inherited instead was the game page's
 * own monospace face at the game's own line height. The workshop's front door
 * was set in the wrong typeface, in the one place a reader's first impression is
 * the whole of the impression.
 */

.mb-launch, .mb-exit {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 6vmin 4vmin;
  text-align: center;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.45;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(70% 60% at 50% 28%, color-mix(in srgb, var(--gold) 10%, transparent), transparent 70%),
    var(--scrim);
  opacity: 0;
  transition: opacity 260ms ease;
}
.mb-launch[data-shown="1"], .mb-exit[data-shown="1"] { opacity: 1; }
.mb-exit { z-index: 20; }

.mb-launch-card, .mb-exit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 48ch;
}

.mb-launch-illum {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: var(--fs-mark);
  font-weight: 600;
  color: var(--gold-bright);
  border: 1px solid var(--edge-strong);
  border-radius: var(--r-lg);
  background:
    radial-gradient(120% 120% at 30% 10%, color-mix(in srgb, var(--gold) 26%, transparent), transparent 70%),
    var(--stone);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(8px) scale(0.96);
  transition: opacity 380ms ease, transform 380ms ease;
}
.mb-launch[data-phase="brand"] .mb-launch-illum,
.mb-launch[data-phase="tagline"] .mb-launch-illum,
.mb-launch[data-phase="ready"] .mb-launch-illum {
  opacity: 1;
  transform: none;
}

.mb-launch-title {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ink);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 380ms ease, transform 380ms ease;
}
.mb-launch[data-phase="brand"] .mb-launch-title,
.mb-launch[data-phase="tagline"] .mb-launch-title,
.mb-launch[data-phase="ready"] .mb-launch-title {
  opacity: 1;
  transform: none;
}

.mb-launch-tagline {
  margin: 0;
  font-size: var(--fs-body);
  color: var(--ink-dim);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 380ms ease 60ms, transform 380ms ease 60ms;
}
.mb-launch[data-phase="tagline"] .mb-launch-tagline,
.mb-launch[data-phase="ready"] .mb-launch-tagline {
  opacity: 1;
  transform: none;
}

.mb-launch-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 380ms ease 120ms, transform 380ms ease 120ms;
}
.mb-launch[data-phase="ready"] .mb-launch-actions { opacity: 1; transform: none; }

.mb-launch-skip {
  position: absolute;
  top: 12px;
  right: 12px;
}

.mb-launch-readme {
  max-width: 62ch;
  max-height: 60vh;
  overflow: auto;
  text-align: left;
  padding-right: 4px;
}
.mb-readme-section + .mb-readme-section { margin-top: 14px; }

.mb-exit-title { font-family: var(--font-display); font-size: var(--fs-head); font-weight: 600; color: var(--ink); }
.mb-exit-note { font-size: var(--fs-small); color: var(--ink-faint); }

/* ---------------------------------------------------------------- *
 * Motion, only when it is wanted                                    *
 * ---------------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
}
`;

// src/ui/overlay.ts
var HOST_ID = "neo-angband-mod-forge";
var Z = 2e3;
function mountOverlay(doc2, options) {
  const panel = options.panel;
  let host;
  let root;
  if (panel) {
    root = panel.root;
    host = root.host;
  } else {
    doc2.getElementById(HOST_ID)?.remove();
    host = doc2.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-modal", "true");
    host.setAttribute("aria-label", options.label);
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = String(Z);
    host.style.height = "100dvh";
    host.style.width = "100vw";
    root = host.attachShadow({ mode: "open" });
  }
  const style = doc2.createElement("style");
  style.textContent = THEME_CSS;
  root.appendChild(style);
  if (!panel) doc2.body.appendChild(host);
  const closeHandlers = [];
  const keyHandlers = [];
  let open2 = true;
  let composing = false;
  const win = doc2.defaultView;
  const heldKeys = /* @__PURE__ */ new Set();
  const heldButtons = /* @__PURE__ */ new Set();
  const SYNTHETIC = /* @__PURE__ */ Symbol("mb-synthetic-release");
  const markSynthetic = (event) => {
    event[SYNTHETIC] = true;
    return event;
  };
  const isSynthetic = (event) => event[SYNTHETIC] === true;
  const releaseKey = (key) => {
    heldKeys.delete(key);
    win?.dispatchEvent(markSynthetic(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true })));
  };
  const releaseButton = (button2) => {
    heldButtons.delete(button2);
    win?.dispatchEvent(markSynthetic(new MouseEvent("mouseup", { button: button2, bubbles: true, cancelable: true })));
  };
  const deepest = (event) => {
    const first = event.composedPath()[0] ?? event.target;
    return first === host && root.activeElement ? root.activeElement : first;
  };
  const insideUs = (event) => {
    const target = deepest(event);
    if (!(target instanceof Node)) return false;
    return host.contains(target) || root.contains(target);
  };
  const editable = (target) => {
    if (!(target instanceof Element)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return target instanceof HTMLElement && target.isContentEditable;
  };
  const onKeyEvent = (event) => {
    if (!(event instanceof KeyboardEvent) || isSynthetic(event)) return;
    if (!open2) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.type === "keyup") {
      heldKeys.delete(event.key);
    } else if (event.type === "keydown") {
      const alreadyTracked = heldKeys.has(event.key);
      heldKeys.add(event.key);
      if (!alreadyTracked && event.repeat) releaseKey(event.key);
    }
    if (event.type !== "keydown") return;
    if (composing || event.isComposing) return;
    for (const handler of keyHandlers) {
      if (handler(event)) {
        event.preventDefault();
        return;
      }
    }
    if (event.key === "Tab") return;
    if (!editable(deepest(event)) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
    }
  };
  const onComposition = (event) => {
    composing = event.type === "compositionstart";
  };
  const onPointerEvent = (event) => {
    if (isSynthetic(event)) return;
    if (!open2) return;
    const outside = !insideUs(event);
    if (outside && event instanceof MouseEvent) {
      if (event.type === "mousedown") heldButtons.add(event.button);
      else if (event.type === "mouseup") heldButtons.delete(event.button);
    }
    if (!outside) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
  };
  const onFocusIn = (event) => {
    if (!open2) return;
    if (insideUs(event)) return;
    const first = root.querySelector(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (first) first.focus();
    else host.focus();
  };
  const listeners = [
    ["keydown", onKeyEvent, true],
    ["keyup", onKeyEvent, true],
    ["keypress", onKeyEvent, true],
    ["compositionstart", onComposition, true],
    ["compositionend", onComposition, true],
    ["mousedown", onPointerEvent, true],
    ["mouseup", onPointerEvent, true],
    ["click", onPointerEvent, true],
    ["wheel", onPointerEvent, true],
    ["touchstart", onPointerEvent, true],
    ["focusin", onFocusIn, true]
  ];
  for (const [type, listener, capture] of listeners) {
    win?.addEventListener(type, listener, capture);
  }
  if (panel) void panel.closed.then(() => overlay.close());
  const overlay = {
    root,
    get open() {
      return open2;
    },
    onClose(handler) {
      closeHandlers.push(handler);
    },
    onKey(handler) {
      keyHandlers.push(handler);
    },
    setParchment(on) {
      host.classList.toggle("mb-parchment", on);
    },
    close() {
      if (!open2) return;
      open2 = false;
      for (const [type, listener, capture] of listeners) {
        win?.removeEventListener(type, listener, capture);
      }
      for (const key of [...heldKeys]) releaseKey(key);
      for (const button2 of [...heldButtons]) releaseButton(button2);
      if (panel) panel.close();
      else host.remove();
      for (const handler of [...closeHandlers]) handler();
    }
  };
  return overlay;
}

// src/workshop.ts
function openWorkshop(ctx, doc2, panel) {
  if (!doc2 || !doc2.body) return void 0;
  const seams = resolveSeams(ctx);
  const log = ctx.log ?? (() => void 0);
  const keep = ctx.flags[FLAG.keepDrafts] === true;
  const stored = keep ? loadDrafts(ctx.prefs) : { drafts: {}, seenTour: false };
  const store = new Store(initialState(stored.drafts, stored.seenTour));
  const writer = new DraftWriter(keep ? ctx.prefs : void 0, (outcome) => {
    if (outcome.ok) return;
    store.view(() => ({ notice: { text: outcome.why, tone: "bad" } }));
    log(`draft storage refused ${outcome.bytes} bytes: ${outcome.why}`);
  });
  const overlay = mountOverlay(doc2, { label: "ModForge", ...panel ? { panel } : {} });
  let closed = false;
  let launchHandle;
  const handle2 = {
    get open() {
      return !closed;
    },
    close() {
      if (closed) return;
      closed = true;
      launchHandle?.dispose();
      writer.flush();
      writer.dispose();
      acts.dispose();
      overlay.close();
    }
  };
  const acts = new Actions({
    store,
    seams,
    api: seams.authoring.api,
    records: seams.authoring.records,
    writer,
    log,
    doc: doc2,
    closeWorkshop: () => handle2.close(),
    /* The graceful exit screen, for the player's OWN close - the titlebar
     * button and the bottom rung of the escape ladder - as opposed to
     * `handle.close()` above, which is the programmatic teardown a mod
     * switch or a test uses and which stays immediate on purpose. */
    playExit: (done) => mountExit(overlay, { onDone: done })
  });
  useDocument(doc2);
  launchHandle = mountLaunch(overlay, {
    firstRun: !stored.seenTour,
    onEnter: () => {
      launchHandle = void 0;
    },
    onCancel: () => {
      launchHandle = void 0;
      handle2.close();
    },
    onDocs: () => {
      launchHandle = void 0;
      acts.go({ at: "docs", doc: "tutorial-01" });
    }
  });
  mountApp({
    overlay,
    doc: doc2,
    store,
    acts,
    seams,
    api: seams.authoring.api,
    records: seams.authoring.records
  });
  launchHandle.focus();
  overlay.onClose(() => {
    closed = true;
    writer.flush();
    writer.dispose();
    acts.dispose();
  });
  log(
    `workshop opened: authoring ${seams.authoring.available ? "live" : "demonstration"}, install ${seams.install.available ? "in place" : "by file"}, testing ${seams.wizard.available ? "on" : "off"}`
  );
  return handle2;
}

// plugin.ts
var ROW = "Build a mod...";
var CLOSE_AT = "bottom-right";
var handle;
var opening = false;
async function open(mod) {
  if (opening || handle?.open === true) return;
  opening = true;
  try {
    const doc2 = globalThis.document;
    const ctx = await buildBuilderCtx(mod);
    let panel;
    if (mod.ui.overlay) {
      const made = await mod.ui.overlay({ id: "workshop", modal: true, label: "ModForge", closeAt: CLOSE_AT });
      if (made.ok) panel = made.value;
      else mod.meta.log(`the game would not make a page for the workshop (${made.message}), so it draws its own`);
    }
    handle = openWorkshop(ctx, doc2, panel);
    if (handle === void 0) {
      panel?.close();
      mod.meta.log("no document to build the workshop into, so there is nothing to open");
    }
  } finally {
    opening = false;
  }
}
var plugin_default = {
  api: ">=2.0.0 <3.0.0",
  async start(mod) {
    if (mod.meta.flags[FLAG.showTab] !== true) return;
    const row2 = await mod.ui.gameMenu.register("open-workshop", ROW, () => open(mod));
    if (!row2.ok) mod.meta.log(`the game menu would not take the workshop's row (${row2.message}), so there is no way in`);
  },
  stop() {
    handle?.close();
    handle = void 0;
  }
};
export {
  plugin_default as default
};
