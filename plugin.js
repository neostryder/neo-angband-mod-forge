// m2-api2 - generated from plugin.ts by neo-angband-mod-build
// (@rpgm-tools/neo-angband-mod-sdk). Edit the TypeScript source, not this file.

// src/host/context.ts
var FLAG = {
  showTab: "builder.showTab",
  keepDrafts: "builder.keepDrafts",
  cheatSpawn: "builder.cheatSpawn"
};

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
  const opening = /\bexport\s+default\s*\{/u.exec(code);
  if (opening === null) return void 0;
  const skipSpace = (k2) => {
    while (k2 < code.length && /\s/u.test(code[k2] ?? "")) k2++;
    return k2;
  };
  const endsMember = (k2) => {
    const c = code[skipSpace(k2)];
    return c === "," || c === "}";
  };
  let k = opening.index + opening[0].length;
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
var NO_INSTALL = "This game has no way for a mod to install another mod, so the workshop saves the finished mod as a file and you add it with Import a zip on the Mods screen. That takes two extra steps, and you end up with a file you can read, keep and share.";
var NO_SESSION = "This game has no way to load a mod for one session, so to try one you have to install it: the workshop saves the finished mod as a file, then you add it with Import a zip on the Mods screen, turn it on and reload. The mod then stays in your library, where you would want it once it is finished anyway.";
var NO_WIZARD_SEAM = "This game does not give the workshop its debug commands, so it cannot put anything in front of you or take you anywhere. Forge the mod, try it for the session, reload, and go and find the thing yourself.";
var WIZARD_OFF = 'The "Let me test what I built" setting is off for this mod. Turn it on in the mod manager.';
var NO_GAME = "There is no character in play, so there is nothing to test with.";
function resolveSeams(ctx) {
  const realApi = ctx.authoring;
  const realRecords = ctx.composedRecords;
  const authoring = realApi ? realRecords ? { available: true, api: realApi, records: realRecords, demonstration: false } : { available: false, why: NO_RECORDS, api: realApi, records: STUB_RECORDS, demonstration: true } : { available: false, why: NO_AUTHORING, api: STUB_AUTHORING, records: realRecords ?? STUB_RECORDS, demonstration: true };
  const installer = ctx.installMod;
  const reloader = ctx.reloadGame;
  const install = installer ? {
    available: true,
    install: installer,
    reload: reloader ?? (async () => void 0),
    reloadByHand: reloader === void 0
  } : {
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
  const reload = resolveReload(ctx);
  const stager = ctx.loadModForSession;
  const session = stager ? { available: true, load: stager, reload: reload ?? (() => void 0), reloadByHand: reload === null } : {
    available: false,
    why: NO_SESSION,
    load: async () => ({ ok: false, problem: NO_SESSION }),
    reload: () => void 0,
    reloadByHand: true
  };
  return { authoring, install, session, wizard: resolveWizard(ctx), engine: ctx.engine };
}
function resolveWizard(ctx) {
  if (ctx.flags[FLAG.cheatSpawn] !== true) return { available: false, why: WIZARD_OFF };
  if (ctx.wizard === void 0) return { available: false, why: NO_WIZARD_SEAM };
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
var LOCAL_HEADER = 67324752;
var CENTRAL_HEADER = 33639248;
var END_OF_DIRECTORY = 101010256;
var ZIP64_MARKER = 4294967295;
async function unzip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = findEndOfDirectory(view);
  if (end < 0) {
    return { ok: false, why: "That file is not a zip: it has no central directory at the end of it." };
  }
  const count = view.getUint16(end + 10, true);
  const directoryAt = view.getUint32(end + 16, true);
  if (directoryAt >= bytes.length) {
    return { ok: false, why: "That zip's directory points past the end of the file, so it is truncated or damaged." };
  }
  const entries = [];
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
    if (name.endsWith("/")) continue;
    if (compressed === ZIP64_MARKER || uncompressed === ZIP64_MARKER || localAt === ZIP64_MARKER) {
      return {
        ok: false,
        why: `${name} uses the zip64 extension, which the workshop cannot open. A mod folder is too small to need it, so this is probably not a mod.`
      };
    }
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
    if (method === 0) {
      entries.push({ path: name, contents: raw.slice() });
      continue;
    }
    const inflated = await inflate(raw);
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
async function inflate(raw) {
  const Decompressor = globalThis.DecompressionStream;
  if (Decompressor === void 0) {
    return {
      ok: false,
      why: "this browser cannot unpack a compressed zip. Pick the mod's folder instead of its zip."
    };
  }
  try {
    const stream = new Blob([raw]).stream().pipeThrough(new Decompressor("deflate-raw"));
    return { ok: true, bytes: new Uint8Array(await new Response(stream).arrayBuffer()) };
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
    setOpen(open) {
      el.dataset["open"] = open ? "1" : "0";
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
    "audience": "beginner",
    "title": "1. Change one thing",
    "note": "Five minutes, two files, and a dagger that hits harder.",
    "encoded": "IyBUdXRvcmlhbCAxOiBDaGFuZ2Ugb25lIHRoaW5nCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBkYWdnZXJzIHRoYXQgaGl0IGhhcmRlciBhbmQgY29zdCB0ZW4gdGltZXMgYXMgbXVjaC4KCioqV2hhdCB5b3UgbmVlZDoqKiBhIHRleHQgZWRpdG9yLiBUaGF0IGlzIHRoZSB3aG9sZSBsaXN0LiBObyBjb21waWxlciwgbm8KdG9vbGNoYWluLCBubyBhY2NvdW50LCBhbmQgbm8gY29weSBvZiB0aGUgZ2FtZSdzIHNvdXJjZSBjb2RlLgoKKipUaW1lOioqIGFib3V0IGZpdmUgbWludXRlcywgbW9zdCBvZiBpdCBmaW5kaW5nIHRoZSBNb2RzIG1lbnUuCgotLS0KCiMjIE1vZCBmaWxlcwoKQSBtb2QgaXMgYSBmb2xkZXIuIE1ha2Ugb25lIGFueXdoZXJlIHlvdSBsaWtlLCBjYWxsIGl0IGBteS1maXJzdC1tb2RgLCBhbmQgcHV0CnR3byBmaWxlcyBpbiBpdDoKCmBgYApteS1maXJzdC1tb2QvCiAgbWFuaWZlc3QuanNvbgogIG9iamVjdC5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIHNheXMgd2hvIHRoZSBtb2QgaXMuIENvcHkgdGhpcyBleGFjdGx5OgoKYGBganNvbgp7CiAgImlkIjogIm15LWZpcnN0LW1vZCIsCiAgIm5hbWUiOiAiTXkgRmlyc3QgTW9kIiwKICAidmVyc2lvbiI6ICIxLjAuMCIsCiAgInNoYXBlIjogImNvbnRlbnQiLAogICJlbmdpbmUiOiAiPj0wLjIwLjAiLAogICJhdXRob3IiOiAieW91ciBuYW1lIiwKICAibGljZW5zZSI6ICJHUEwtMi4wLW9ubHkiLAogICJyZXBvc2l0b3J5IjogImh0dHBzOi8vZ2l0aHViLmNvbS95b3UvbXktZmlyc3QtbW9kIiwKICAiZGVwZW5kZW5jaWVzIjogeyAiY29yZSI6ICIqIiB9LAogICJkZXNjcmlwdGlvbiI6ICJEYWdnZXJzIGhpdCBoYXJkZXIgYW5kIGNvc3QgbW9yZS4iCn0KYGBgCgpgcmVwb3NpdG9yeWAgaXMgcmVxdWlyZWQgZXZlbiBmb3IgYSBtb2QgeW91IG5ldmVyIHB1Ymxpc2guIEl0IGlzIHRoZSBtb2QncwppZGVudGl0eSBhY3Jvc3MgZXZlcnkgd2F5IG9mIGdldHRpbmcgaXQ6IHRoZSBnYW1lIHBpbnMgYW4gaW5zdGFsbGVkIG1vZCB0byB0aGUKcmVwb3NpdG9yeSBpdCBjYW1lIGZyb20gYW5kIHJlZnVzZXMgYSByZXBsYWNlbWVudCBmcm9tIGFueXdoZXJlIGVsc2UsIHNvIGEgbW9kCnRoYXQgbmFtZXMgbm93aGVyZSBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgYW55dGhpbmcgY2xhaW1pbmcgaXRzIGlkLiBQb2ludCBpdAp3aGVyZXZlciB5b3UgaW50ZW5kIHRvIHB1Ymxpc2gsIG9yIHdoZXJldmVyIHlvdSB3b3VsZCBpZiB5b3UgZGlkLgoKYG9iamVjdC5qc29uYCBpcyB0aGUgY2hhbmdlOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN3b3JkLS1kYWdnZXIiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImF0dGFjay5oZCIsICJ2YWx1ZSI6ICIxZDYiIH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImNvc3QiLCAidmFsdWUiOiAzMDAgfQogICAgXQogIH0KfQpgYGAKClRoYXQgaXMgYSBjb21wbGV0ZSwgd29ya2luZyBtb2QuIFR3byBmaWxlcywgdHdlbnR5IGxpbmVzLgoKIyMgV2hhdCB0aG9zZSBzaXggbGluZXMgYXJlIHNheWluZwoKKipgb2JqZWN0Lmpzb25gKiogaXMgdGhlIG5hbWUgb2Ygb25lIG9mIHRoZSBnYW1lJ3MgZGF0YSBmaWxlcy4gVGhlIGJhc2UgZ2FtZQpzaGlwcyBhbiBgb2JqZWN0Lmpzb25gIGZ1bGwgb2YgZXZlcnkgaXRlbSBpbiBBbmdiYW5kLCBhbmQgeW91ciBmaWxlIGNvbnRyaWJ1dGVzCnRvICp0aGF0KiBmaWxlLiBJZiB5b3Ugd2FudGVkIHRvIGNoYW5nZSBhIG1vbnN0ZXIgeW91IHdvdWxkIHdyaXRlIGBtb25zdGVyLmpzb25gCmluc3RlYWQ7IHRoZSBmaWxlIG5hbWUgaXMgaG93IHRoZSBnYW1lIGtub3dzIHdoYXQgeW91IGFyZSB0YWxraW5nIGFib3V0LgoKKipgY29yZTpzd29yZC0tZGFnZ2VyYCoqIG5hbWVzIHRoZSByZWNvcmQgeW91IGFyZSBjaGFuZ2luZy4gVGhlIGBjb3JlOmAgaGFsZiBzYXlzCndob3NlIHJlY29yZCBpdCBpczogdGhlIGJhc2UgZ2FtZSdzLCBhcyBvcHBvc2VkIHRvIHlvdXJzIG9yIGFub3RoZXIgbW9kJ3MuIFRoZQpyZXN0IGlzIHRoZSBkYWdnZXIncyBpZGVudGl0eSB3aXRoaW4gaXRzIGZpbGUgLSBmb3IgYW4gb2JqZWN0LCBpdHMgYHR5cGVgIGFuZAppdHMgYG5hbWVgIGpvaW5lZCBieSBgLS1gLiBZb3UgZG8gbm90IGhhdmUgdG8gbWVtb3Jpc2UgdGhlc2U6IHR5cGUgeW91ciBiZXN0Cmd1ZXNzLCBhbmQgaWYgaXQgaXMgd3JvbmcgdGhlIGdhbWUgdGVsbHMgeW91ICp3aGljaCBydWxlIGJ1aWxkcyB0aGUgcmVmKiwgc28geW91CmNhbiB3b3JrIGl0IG91dCBmcm9tIHRoZSByZWNvcmQgeW91IHdlcmUgYWltaW5nIGF0LiBJdCBkb2VzIG5vdCBoYW5kIHlvdSBhIGxpc3QKb2YgY2FuZGlkYXRlcywgYW5kIHRoZXJlIGlzIG5vICJkaWQgeW91IG1lYW4iIGZvciByZWZzLgoKQSByZWYgdGhhdCByZXNvbHZlcyB0byBub3RoaW5nIGNvc3RzIHlvdSB0aGF0IG9uZSBjb250cmlidXRpb24sIG5vdCB0aGUgd2hvbGUKbW9kOiB0aGUgZ2FtZSBza2lwcyBpdCwgcmVwb3J0cyBpdCBvbiB5b3VyIG1vZCdzIHJvdyBpbiB0aGUgbW9kIG1hbmFnZXIsIGFuZApsb2FkcyBldmVyeXRoaW5nIGVsc2UgeW91IHdyb3RlLgoKKipgZmllbGRQYXRjaGVzYCoqIGlzIGEgbGlzdCBvZiBzbWFsbCBlZGl0cywgZWFjaCBuYW1pbmcgYSBwYXRoIGludG8gdGhlIHJlY29yZAphbmQgYSBuZXcgdmFsdWUuIGBhdHRhY2suaGRgIGlzIHRoZSBkYW1hZ2UgZGljZTsgYGNvc3RgIGlzIHRoZSBiYXNlIHByaWNlIGluCmdvbGQuIEV2ZXJ5dGhpbmcgeW91IGRvIG5vdCBtZW50aW9uIGlzIGxlZnQgZXhhY3RseSBhcyB0aGUgYmFzZSBnYW1lIGhhcyBpdC4KVGhpcyBpcyBhIGNoYW5nZSB0byB0d28gbnVtYmVycywgbm90IGEgcmVwbGFjZW1lbnQgb2YgdGhlIGRhZ2dlci4KCioqYCJkZXBlbmRlbmNpZXMiOiB7ICJjb3JlIjogIioiIH1gKiogaXMgeW91IHNheWluZyAiSSBhbSBtb2RpZnlpbmcgdGhlIGJhc2UKZ2FtZSdzIHN0dWZmLiIgV2l0aG91dCBpdCB0aGUgZ2FtZSByZWZ1c2VzIHRoZSBwYXRjaC4gVGhhdCBpcyBkZWxpYmVyYXRlOiBhIG1vZAptYXkgb25seSBjaGFuZ2UgcmVjb3JkcyBiZWxvbmdpbmcgdG8gc29tZXRoaW5nIGl0IGhhcyBkZWNsYXJlZCwgc28gYSBtb2QgY2FuCm5ldmVyIHF1aWV0bHkgcmVhY2ggaW50byBhbm90aGVyIG1vZCBpdCBuZXZlciBtZW50aW9uZWQuCgojIyBSdW5uaW5nIGl0CgoqKk9uIHRoZSBkZXNrdG9wIGJ1aWxkOioqIHB1dCB5b3VyIGBteS1maXJzdC1tb2RgIGZvbGRlciBpbnRvIHRoZSBgbW9kcy9gIGZvbGRlcgp0aGF0IHNpdHMgYmVzaWRlIHRoZSBnYW1lLCBhbmQgc3RhcnQgdGhlIGdhbWUuIFByZXNzIGBFc2NhcGVgLCBjaG9vc2UgKipNb2RzKiosCmZpbmQgKk15IEZpcnN0IE1vZCosIHR1cm4gaXQgb24sIGFuZCBjaG9vc2UgKipBcHBseSBjaGFuZ2VzIGFuZCByZWxvYWQqKi4KCioqSW4gYSBicm93c2VyOioqIHByZXNzIGBFc2NhcGVgLCBjaG9vc2UgKipNb2RzKiosIGNob29zZSAqKkNob29zZSBhIG1vZHMKZm9sZGVyLi4uKiosIGFuZCBwb2ludCBpdCBhdCB0aGUgZm9sZGVyICpjb250YWluaW5nKiBgbXktZmlyc3QtbW9kYC4gVGhlbiB0dXJuIGl0Cm9uIGFuZCByZWxvYWQgYXMgYWJvdmUuIFRoZSBnYW1lIHJlbWVtYmVycyB0aGUgZm9sZGVyLCBzbyBlZGl0aW5nIGEgZmlsZSBhbmQKcmVsb2FkaW5nIHRoZSBwYWdlIGlzIHlvdXIgd2hvbGUgZWRpdC1hbmQtdGVzdCBsb29wLgoKIyMgQ2hlY2sgdGhlIHJlc3VsdAoKQnV5IGEgZGFnZ2VyIGluIHRoZSAqKldlYXBvbiBTbWl0aHMqKiAodGhlIGAzYCBvbiB0aGUgdG93biBtYXApIC0gdGhhdCBpcyB0aGUKc2hvcCB0aGF0IHN0b2NrcyBkYWdnZXJzLCBub3QgdGhlIEdlbmVyYWwgU3RvcmUuIEl0IG5vdyBjb3N0cyBhcm91bmQgMzAwIGdvbGQKcmF0aGVyIHRoYW4gYXJvdW5kIDMwLiBJbnNwZWN0IGl0IHdpdGggYElgIGFuZCBpdHMgZGFtYWdlIHJlYWRzIGAxZDZgLiBIaXQKc29tZXRoaW5nIHdpdGggaXQgYW5kIGl0IGh1cnRzIG1vcmUuCgpUdXJuIHRoZSBtb2Qgb2ZmIGFuZCBjaG9vc2UgKipBcHBseSBjaGFuZ2VzIGFuZCByZWxvYWQqKiwgYW5kIGRhZ2dlcnMgYXJlCm9yZGluYXJ5IGFnYWluLiBUaGF0IGlzIHRoZSBwYXJ0IHdvcnRoIHBhdXNpbmcgb246IHlvdXIgY2hhbmdlIGlzIGEgbGF5ZXIgb3Zlcgp0aGUgYmFzZSBnYW1lLCBub3QgYW4gZWRpdCB0byBpdC4gTm90aGluZyBvbiB5b3VyIG1hY2hpbmUgd2FzIG1vZGlmaWVkLCBhbmQgdGhlCmdhbWUgdW5kZXJuZWF0aCBpcyBzdGlsbCB0aGUgdmFuaWxsYSBvbmUuCgojIyBWYXJpYXRpb25zIHRvIHRyeQoKLSBNYWtlIHRoZSBkYWdnZXIgKipsaWdodGVyKio6IGFkZCBgeyAib3AiOiAic2V0IiwgInBhdGgiOiAid2VpZ2h0IiwgInZhbHVlIjogNCB9YC4KLSBDaGFuZ2UgYSAqKm1vbnN0ZXIqKiBpbnN0ZWFkLiBBZGQgYSBgbW9uc3Rlci5qc29uYCB3aXRoCiAgYHsgImZpZWxkUGF0Y2hlcyI6IHsgImNvcmU6c29sZGllci1hbnQiOiBbIHsgIm9wIjogInNldCIsICJwYXRoIjogImhpdC1wb2ludHMiLCAidmFsdWUiOiA2MCB9IF0gfSB9YAogIGFuZCBtZWV0IGEgdmVyeSB1bnJlYXNvbmFibGUgYW50IG9uIGxldmVsIDEuCi0gQnJlYWsgaXQgb24gcHVycG9zZS4gQ2hhbmdlIGBjb3JlOnN3b3JkLS1kYWdnZXJgIHRvIGBjb3JlOnN3b3JkLS1kYWdnZXJyYCBhbmQKICByZWxvYWQuIFJlYWQgdGhlIGVycm9yOiB0aGF0IG1lc3NhZ2UgaXMgeW91ciBtYWluIGRlYnVnZ2luZyB0b29sLCBhbmQgaXQgaXMKICB3b3J0aCBzZWVpbmcgb25jZSB3aGlsZSB5b3UgYWxyZWFkeSBrbm93IHdoYXQgaXMgd3JvbmcuCgojIyBTYW1wbGUgbW9kCgpgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDEtdHdlYWstYS12YWx1ZS9gIGluIHRoaXMgcmVwb3NpdG9yeSBpcyBleGFjdGx5IHRoaXMgbW9kLgpJdCBpcyBub3QgYSBjb3B5IG9mIHRoZSB0dXRvcmlhbC4gSXQgaXMgYSBtb2QgdGhhdCBnZXRzIGxvYWRlZCBhbmQgY2hlY2tlZAphZ2FpbnN0IHRoZSByZWFsIGdhbWUgZGF0YSBvbiBldmVyeSB0ZXN0IHJ1biwgc28gaWYgYW55dGhpbmcgb24gdGhpcyBwYWdlIGV2ZXIKc3RvcHMgYmVpbmcgdHJ1ZSwgdGhlIGJ1aWxkIGZhaWxzLgoKLS0tCgoqKk5leHQ6KiogW1R1dG9yaWFsIDI6IEFkZCBhbiBpdGVtXSgwMi1hZGQtYW4taXRlbS5tZCksIHRoZSBzYW1lIGlkZWEsIGJ1dApjcmVhdGluZyBzb21ldGhpbmcgdGhlIGdhbWUgaGFzIG5ldmVyIHNlZW4gaW5zdGVhZCBvZiBhZGp1c3Rpbmcgc29tZXRoaW5nIGl0Cmhhcy4K"
  },
  {
    "id": "tutorial-02",
    "path": "tutorials/02-add-an-item.md",
    "audience": "beginner",
    "title": "2. Add an item",
    "note": "Make a record the base game has never seen.",
    "encoded": "IyBUdXRvcmlhbCAyOiBBZGQgYW4gaXRlbQoKKipXaGF0IHlvdSB3aWxsIG1ha2U6Kiogb25lIG5ldyBwaWVjZSBvZiBhcm1vdXIgdGhlIGJhc2UgZ2FtZSBoYXMgbmV2ZXIgaGVhcmQKb2YsIGZpbmRhYmxlIGluIHRoZSBkdW5nZW9uIGFuZCBidXlhYmxlIGluIHRvd24uCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCAxXSgwMS10d2Vhay1hLXZhbHVlLm1kKSwgd2hpY2ggZXhwbGFpbnMgd2hhdCBhIG1vZApmb2xkZXIgaXMgYW5kIGhvdyB0byBsb2FkIG9uZS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCi0tLQoKIyMgTW9kIGZpbGVzCgpgYGAKbXktaXRlbS1tb2QvCiAgbWFuaWZlc3QuanNvbgogIG9iamVjdC5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gLCBzYW1lIHNoYXBlIGFzIGxhc3QgdGltZSwgZGlmZmVyZW50IGlkOgoKYGBganNvbgp7CiAgImlkIjogIm15LWl0ZW0tbW9kIiwKICAibmFtZSI6ICJNeSBJdGVtIE1vZCIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJjb250ZW50IiwKICAiZW5naW5lIjogIj49MC4yMC4wIiwKICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20veW91L215LWl0ZW0tbW9kIiwKICAiZGVwZW5kZW5jaWVzIjogeyAiY29yZSI6ICIqIiB9LAogICJkZXNjcmlwdGlvbiI6ICJBZGRzIGEgcGFkZGVkIGplcmtpbi4iCn0KYGBgCgpgb2JqZWN0Lmpzb25gOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbCiAgICB7CiAgICAgICJuYW1lIjogIlBhZGRlZCBKZXJraW5+IiwKICAgICAgInR5cGUiOiAic29mdCBhcm1vciIsCiAgICAgICJncmFwaGljcyI6IHsgImdseXBoIjogIigiLCAiY29sb3IiOiAiVSIgfSwKICAgICAgImxldmVsIjogMSwKICAgICAgIndlaWdodCI6IDYwLAogICAgICAiY29zdCI6IDEyLAogICAgICAiYWxsb2MiOiB7ICJjb21tb24iOiAyMCwgIm1pbm1heCI6ICIxIHRvIDQwIiB9LAogICAgICAiYXR0YWNrIjogeyAiaGQiOiAiMGQwIiwgInRvLWgiOiAiMCIsICJ0by1kIjogIjAiIH0sCiAgICAgICJhcm1vciI6IHsgImFjIjogNSwgInRvLWEiOiAiMCIgfSwKICAgICAgImRlc2MiOiBbIkEgcXVpbHRlZCBqYWNrZXQgc3R1ZmZlZCB3aXRoIHdvb2wuIEl0IGlzIHdhcm0sIGFuZCB2ZXJ5IHNsaWdodGx5IHByb3RlY3RpdmUuIl0KICAgIH0KICBdCn0KYGBgCgojIyBXaGF0IGNoYW5nZWQgZnJvbSBUdXRvcmlhbCAxCgpPbmUgd29yZDogYHJlY29yZHNgIGluc3RlYWQgb2YgYGZpZWxkUGF0Y2hlc2AuCgpgZmllbGRQYXRjaGVzYCBlZGl0cyBzb21ldGhpbmcgdGhhdCBhbHJlYWR5IGV4aXN0cy4gYHJlY29yZHNgICoqYWRkcyoqIHNvbWV0aGluZywKYW5kIHlvdXIgbW9kIG93bnMgd2hhdCBpdCBhZGRzLiBFdmVyeXRoaW5nIGVsc2UgeW91IGxlYXJuZWQgc3RpbGwgYXBwbGllczogc2FtZQpmb2xkZXIsIHNhbWUgbWFuaWZlc3QsIHNhbWUgd2F5IG9mIGxvYWRpbmcgaXQuCgojIyBSZWFkaW5nIHRoZSByZWNvcmQKCk1vc3Qgb2YgaXQgaXMgQW5nYmFuZCdzIG93biB2b2NhYnVsYXJ5IHJhdGhlciB0aGFuIGFueXRoaW5nIHRoaXMgcHJvamVjdAppbnZlbnRlZCwgd2hpY2ggbWVhbnMgdGhlIGJhc2UgZ2FtZSdzIG93biBkYXRhIGlzIHlvdXIgcmVmZXJlbmNlIG1hbnVhbC4gSWYgeW91CndhbnQgdG8ga25vdyB3aGF0IGEgZmllbGQgZG9lcywgZmluZCBhbiBpdGVtIHRoYXQgYWxyZWFkeSBkb2VzIGl0IGFuZCBjb3B5IGhvdwppdCBzYXlzIHNvLgoKLSBgbmFtZWA6IHRoZSB0cmFpbGluZyBgfmAgaXMgd2hlcmUgdGhlIHBsdXJhbCBnb2VzLiAiUGFkZGVkIEplcmtpbn4iCiAgZGlzcGxheXMgYXMgKmEgUGFkZGVkIEplcmtpbiogYW5kICoyIFBhZGRlZCBKZXJraW5zKi4gQW4gaXRlbSB3aG9zZSBuYW1lIHN0YXJ0cwogIHdpdGggYCZgIChgIiYgRGFnZ2VyfiJgKSB0YWtlcyBhbiBhcnRpY2xlLiBUaGVzZSBtYXJrcyBhcmUgdGhlIG9yaWdpbmFsIGdhbWUncwogIGNvbnZlbnRpb24sIGFuZCB0aGV5IGFyZSB3aHkgeW91IHNob3VsZCBjb3B5IGFuIGV4aXN0aW5nIG5hbWUncyBwdW5jdHVhdGlvbgogIHJhdGhlciB0aGFuIGludmVudCBpdC4KLSBgdHlwZWA6IHdoaWNoIGtpbmQgb2YgaXRlbSB0aGlzIGlzLiBgc29mdCBhcm1vcmAgcHV0cyBpdCBpbiB0aGUgYm9keQogIGFybW91ciBzbG90IGFuZCBpbiB0aGUgYXJtb3VyeSdzIHN0b2NrLiBVc2Ugb25lIHRoZSBnYW1lIGFscmVhZHkgaGFzOwogIFtUdXRvcmlhbCA0XSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkncyBmb2xsb3ctb24gcmVhZGluZyBjb3ZlcnMgaW52ZW50aW5nIGEKICB3aG9sbHkgbmV3IGl0ZW0gY2xhc3MuCi0gYGxldmVsYDogdGhlIGRlcHRoIGF0IHdoaWNoIGl0IHN0YXJ0cyBhcHBlYXJpbmcuCi0gYGFsbG9jYDogaG93IG9mdGVuLCBhbmQgYmV0d2VlbiB3aGljaCBkZXB0aHMuIGBjb21tb246IDIwYCBpcyByb3VnaGx5IHRoZQogIGZyZXF1ZW5jeSBvZiBvcmRpbmFyeSBlYXJseSBnZWFyOyBgIjEgdG8gNDAiYCBpcyB0aGUgZGVwdGggd2luZG93LgotIGBhcm1vci5hY2A6IHRoZSBhcm1vdXIgaXQgZ2l2ZXMuIFNvZnQgTGVhdGhlciBBcm1vdXIgaGFzIDggYW5kIGNvc3RzIDIwLAogIHNvIDUgZm9yIDEyIGdvbGQgaXMgYSBkZWxpYmVyYXRlbHkgd29yc2UsIGNoZWFwZXIgb3B0aW9uLgotIGBkZXNjYDogYW4gYXJyYXkgb2YgbGluZXMsIHNob3duIHdoZW4gdGhlIHBsYXllciBpbnNwZWN0cyBpdC4KCioqV2hlcmUgdG8gZ2V0IHRoZSBudW1iZXJzLioqIE9wZW4gYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9vYmplY3QuanNvbmAgaW4gdGhpcwpyZXBvc2l0b3J5IGFuZCBmaW5kIGFuIGl0ZW0gbGlrZSB0aGUgb25lIHlvdSB3YW50LiBUaGF0IGZpbGUgaXMgdGhlIGJhc2UgZ2FtZSdzCm93biBkYXRhLCBpbiBleGFjdGx5IHRoZSBmb3JtYXQgeW91ciBtb2Qgd3JpdGVzLCBzbyB0aGUgbmVhcmVzdCBleGlzdGluZyBpdGVtIGlzCmFsd2F5cyBhIHdvcmtpbmcgdGVtcGxhdGUuIFRoZXJlIGlzIGFsc28gYSBoZWxwZXIgdGhhdCBkb2VzIHRoaXMgZm9yIHlvdToKYGRyYWZ0UmVjb3JkYCBmaWxscyBpbiBhIG5ldyByZWNvcmQgZnJvbSB0aGUgZ2FtZSdzIGNvbXBhcmFibGUgcmVjb3JkcywgaW5jbHVkaW5nCmEgc2Vuc2libGUgcHJpY2UuIFNlZSBbQVVUSE9SSU5HLm1kXSguLi9BVVRIT1JJTkcubWQpLgoKIyMgQ2hlY2sgdGhlIHJlc3VsdAoKWW91ciBpdGVtIGV4aXN0cyBpbiB0aGUgZ2FtZSBhcyBzb29uIGFzIHRoZSBtb2QgaXMgb246IGl0IGdlbmVyYXRlcyBpbiB0aGUKZHVuZ2VvbiBpbnNpZGUgaXRzIG93biBkZXB0aCB3aW5kb3csIG1vbnN0ZXJzIGNhbiBiZSBjYXJyeWluZyBvbmUsIGFuZCB3ZWFyaW5nIGl0CnJhaXNlcyB5b3VyIGFybW91ciBjbGFzcyBieSA1LiBDb25maXJtIGl0IHRoZSBxdWljayB3YXkgd2l0aCB3aXphcmQgbW9kZSwgb3IgZGl2ZQp1bnRpbCBvbmUgZHJvcHMuCgoqKk5vIHNob3Agc3RvY2tzIGl0IHlldCoqLCBhbmQgdGhhdCBpcyBub3QgYSBidWcgaW4geW91ciBtb2QgLSBhIHNob3AncyBzdG9jawpjb21lcyBmcm9tIHRoYXQgc2hvcCdzIG93biB0YWJsZSwgYW5kIG5vdGhpbmcgaGFzIHB1dCB5b3VyIGl0ZW0gaW4gb25lLiBUaGUKc2VjdGlvbiBiZWxvdyBkb2VzIHRoYXQuCgpZb3VyIGl0ZW0gaXMgYG15LWl0ZW0tbW9kOnNvZnQtYXJtb3ItLXBhZGRlZC1qZXJraW5gIGFzIGZhciBhcyB0aGUgZ2FtZSBpcwpjb25jZXJuZWQuIEFuIGBvYmplY3RgIHJlY29yZCdzIGlkZW50aXR5IGlzIGl0cyBgdHlwZWAgYW5kIGl0cyBgbmFtZWAgam9pbmVkIGJ5CmAtLWAsIHdoaWNoIGlzIHdoeSB0aGUgcmVmIGlzIG5vdCBzaW1wbHkgdGhlIG5hbWUgLSBhbmQgaXQgaXMgdGhlIHNhbWUgcnVsZSB0aGF0Cm1hZGUgdHV0b3JpYWwgMSdzIGRhZ2dlciBgY29yZTpzd29yZC0tZGFnZ2VyYC4gVGhlIGBteS1pdGVtLW1vZDpgIGhhbGYgaXMgeW91cgpvd24gbmFtZXNwYWNlLCBzbyB5b3VyIGl0ZW0gY2FuIG5ldmVyIGNvbGxpZGUgd2l0aCB0aGUgYmFzZSBnYW1lJ3Mgb3Igd2l0aAphbm90aGVyIG1vZCdzLCBldmVuIGlmIHlvdSBib3RoIGFkZCBhIFBhZGRlZCBKZXJraW4uCgojIyBWYXJpYXRpb25zIHRvIHRyeQoKLSBNYWtlIGl0IGN1cnNlZC1jaGVhcCBhbmQgaGVhdnk6IGB3ZWlnaHRgIDIwMCwgYGNvc3RgIDIuCi0gTWFrZSBpdCByYXJlIGFuZCBkZWVwOiBgbGV2ZWxgIDMwLCBgYWxsb2NgIGB7ICJjb21tb24iOiAzLCAibWlubWF4IjogIjMwIHRvIDEwMCIgfWAuCi0gQWRkIGEgc2Vjb25kIGl0ZW0gaW4gdGhlIHNhbWUgYHJlY29yZHNgIGFycmF5LiBBIG1vZCBjYW4gYWRkIGFzIG1hbnkgYXMgaXQKICBsaWtlczsgdGhlIGFycmF5IGlzIGEgbGlzdC4KLSBHaXZlIGl0IGFuIGVnbyBwb3NzaWJpbGl0eSwgb3IgYSBmbGFnLiBGaW5kIGFuIGl0ZW0gaW4gdGhlIGJhc2UgZ2FtZSdzCiAgYG9iamVjdC5qc29uYCB0aGF0IGhhcyB0aGUgcHJvcGVydHkgeW91IHdhbnQgYW5kIGNvcHkgdGhlIGZpZWxkIGFjcm9zcy4KCiMjIFdoYXQgeW91ciBpdGVtIGpvaW5zIGF1dG9tYXRpY2FsbHkKClRoaXMgaXMgdGhlIHBhcnQgd29ydGgga25vd2luZywgYmVjYXVzZSBpdCBpcyB0aGUgcGFydCB5b3UgZG8gbm90IGhhdmUgdG8gYnVpbGQuCllvdXIgUGFkZGVkIEplcmtpbiBpcyBhIHNvZnQgYXJtb3VyLCBhbmQgdGhlIGdhbWUgdHJlYXRzIGl0IGFzIG9uZSBldmVyeXdoZXJlOgoKLSBFZ29zLCBydW5lcyBhbmQgYnJhbmRzIGFwcGx5IHRvIGl0LiBBbiBlZ28gZGVjbGFyZXMgdGhlICpraW5kcyogb2YgaXRlbSBpdAogIGNhbiBsYW5kIG9uLCBub3QgYSBsaXN0IG9mIG5hbWVkIG9uZXM6ICJvZiBSZXNpc3QgQWNpZCIgc2F5cyBgc29mdCBhcm1vcmAsIHNvCiAgaXQgc2F5cyB5b3VyIGplcmtpbiB0b28uIEEgKipQYWRkZWQgSmVya2luIG9mIFJlc2lzdCBGaXJlKiogaXMgYSB0aGluZyBhIHBsYXllcgogIGNhbiBmaW5kLCBhbmQgbm9ib2R5IGhhZCB0byBhZGQgaXQgdG8gYSBsaXN0LgotIFF1YWxpdHkgZW5jaGFudG1lbnQgYXBwbGllcy4gSXQgY2FuIHR1cm4gdXAgYXMgYFs1LCs2XWAsIGFuZCBpdHMgcHJpY2UgaXMKICByZWNvbXB1dGVkIGZyb20gd2hhdCBpdCBlbmRlZCB1cCBiZWluZyByYXRoZXIgdGhhbiBmcm9tIHRoZSBgY29zdGAgeW91IHdyb3RlLgotIEl0IGlzIGdlbmVyYXRlZCBpbiB0aGUgZHVuZ2VvbiBhdCB0aGUgZGVwdGhzIHlvdXIgYGFsbG9jYCBuYW1lcywgYW5kIGl0IGlzCiAgaW4gdGhlIGRyb3AgdGFibGVzIGZyb20gdGhlIG1vbWVudCB0aGUgbW9kIGlzIG9uLgotIFNob3BzIHdpbGwgYnV5IGl0LCBiZWNhdXNlIGEgc2hvcCdzIGJ1eSBsaXN0IGlzIGJ5IGl0ZW0ga2luZCB0b28uCgojIyBPbmUgdGhpbmcgdGhhdCBkb2VzIE5PVCBoYXBwZW46IGEgcGljdHVyZQoKSW4gQVNDSUkgeW91ciBqZXJraW4gZHJhd3Mgd2l0aCBpdHMgY2xhc3MncyBvd24gc3ltYm9sIGFuZCBuZWVkcyBub3RoaW5nIGZyb20geW91LgoqKkluIHRpbGUgbW9kZSBpdCBoYXMgbm8gcGljdHVyZSBhbmQgdGhlIGdhbWUgd2lsbCBub3QgaW52ZW50IG9uZS4qKiBBIHRpbGUgc2V0Cm1hcHMgKm5hbWVkKiBpdGVtcyB0byBwaWN0dXJlcyBhbmQgaGFzIG5ldmVyIGhlYXJkIG9mIHlvdXJzLCBzbyBhIHBsYXllciBpbiB0aWxlCm1vZGUgc2VlcyBhIGxldHRlciBhbW9uZyBwaWN0dXJlcy4gVGhlIGdhbWUgdXNlZCB0byBndWVzcyAtIGl0IGRyZXcgYW4gYWRkZWQgaXRlbQp3aXRoIHRoZSB0aWxlIG9mIGFub3RoZXIgaXRlbSBzaGFyaW5nIGl0cyBgdHZhbGAgLSBhbmQgdGhhdCBndWVzcyB3YXMgcmVtb3ZlZCBpbgowLjIzLjA6IEFuZ2JhbmQgNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYW4gaXRlbSBhIG1vZCBhZGRlZCwgc28gaXQgaGFzIG5vIG9waW5pb24KYWJvdXQgd2hhdCBvbmUgc2hvdWxkIGxvb2sgbGlrZSwgYW5kIG1ha2luZyB0aGF0IGNhbGwgb24gYmVoYWxmIG9mIHNvbWVib2R5J3MgYXJ0CmlzIHRoZSB0aWxlIHNldCdzIGpvYiByYXRoZXIgdGhhbiB0aGUgcG9ydCdzLgoKU28gaWYgeW91IHNoaXAgY29udGVudCwgc2hpcCB0aWxlcyBmb3IgaXQsIGFuZCBpZiB5b3UgZG8gbm90LCBzYXkgc28gaW4geW91ciBtb2QncwpkZXNjcmlwdGlvbiBhbmQgcG9pbnQgcGxheWVycyBhdCBhIHRpbGUgbW9kIHRoYXQgZmlsbHMgYmxhbmtzOgoKPiBObyB0aWxlcyBvZiBpdHMgb3duOiBpbiB0aWxlIG1vZGUgdGhlIFBhZGRlZCBKZXJraW4gZHJhd3MgYXMgYSBsZXR0ZXIuIEluc3RhbGwKPiBbbGlub2xldW1dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1saW5vbGV1bSkgYW5kIGl0IGlzCj4gZHJhd24gZnJvbSBhbm90aGVyIGl0ZW0gb2YgaXRzIHR5cGUgaW5zdGVhZC4KCkxpbm9sZXVtIGRyYXdzIGFuIGFkZGVkIGl0ZW0gZnJvbSBhIGtpbmQgc2hhcmluZyBpdHMgYHR2YWxgLCB3aXRoIHRoZSBjb2xvdXIKdHVybmVkLCB1bmRlciBpdHMgb3duIHRpbGUgcGFja3MuIFVuZGVyIEFuZ2JhbmQncyBvd24gdGlsZSBzaGVldHMgYW4gYWRkZWQgaXRlbQprZWVwcyBpdHMgbGV0dGVyLCBiZWNhdXNlIHRob3NlIHNoZWV0cyBhcmUgYSBmaXhlZCBncmlkIHdpdGggbm8gc3BhcmUgY2VsbCBmb3IgYQp2YXJpYW50LiAqKkRvIG5vdCBtYWtlIGl0IGEgZGVwZW5kZW5jeToqKiB5b3VyIG1vZCBpcyBjb21wbGV0ZSBpbiBBU0NJSSB3aXRoIG5vCnRpbGUgc2V0IGF0IGFsbCwgYW5kIGEgcGxheWVyIHVzaW5nIGEgZGlmZmVyZW50IHNldCBzaG91bGQgbm90IGhhdmUgdG8gaW5zdGFsbCBvbmUKdGhleSB3aWxsIG5vdCBsb29rIGF0LgoKIyMgUHV0dGluZyBpdCBpbiBhIHNob3AKCk9uZSB0aGluZyBkb2VzIG5vdCBoYXBwZW4gb24gaXRzIG93bjogYSBzaG9wIHdpbGwgbm90ICoqc3RvY2sqKiB5b3VyIGl0ZW0uIFRoYXQKaXMgdHJ1ZSBvZiB0aGUgb3JpZ2luYWwgZ2FtZSB0b286IGEgc3RvcmUncyBzdG9jayBsaXN0IG5hbWVzIHNwZWNpZmljIGl0ZW1zLCBzbwphIG5ldyBvbmUgaGFzIHRvIGJlIHB1dCBvbiB0aGUgbGlzdC4KCkFkZGluZyBhIGxpbmUgdG8gYSBsaXN0IGlzIG9uZSBvcC4gTWFrZSBhIGBzdG9yZS5qc29uYCBiZXNpZGUgeW91ciBgb2JqZWN0Lmpzb25gOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN0b3JlLWFybW9yIjogWwogICAgICB7CiAgICAgICAgIm9wIjogImFwcGVuZCIsCiAgICAgICAgInBhdGgiOiAibm9ybWFsIiwKICAgICAgICAidmFsdWVzIjogW3sgInR2YWwiOiAic29mdCBhcm1vciIsICJzdmFsIjogIlBhZGRlZCBKZXJraW4iIH1dCiAgICAgIH0KICAgIF0KICB9Cn0KYGBgCgpSZXN0YXJ0LCB3YWxrIGludG8gdGhlIEFybW91cnksIGFuZCB5b3VyIGplcmtpbiBpcyBpbiB0aGUgcm90YXRpb24gd2l0aApldmVyeXRoaW5nIGVsc2UsIHNvbWV0aW1lcyBpbiBzdG9jaywgc29tZXRpbWVzIG5vdCwgYXQgd2hhdGV2ZXIgZW5jaGFudG1lbnQgdGhlCnN0b3JlIHJvbGxlZCwgcHJpY2VkIGZyb20gd2hhdCBpdCB0dXJuZWQgb3V0IHRvIGJlLiBUaGUgc3RvY2sgcm9sbCBwaWNrcyBmcm9tIHRoZQpzdG9yZSdzIG93biB0YWJsZSBhbmQgZG9lcyBub3QgY29uc3VsdCB5b3VyIGl0ZW0ncyBgYWxsb2NgIHdpbmRvdywgc28gYSBzaG9wIGNhbgpvZmZlciBpdCBhdCBhbnkgZGVwdGg7IGBhbGxvY2AgZ292ZXJucyB3aGVyZSBpdCBnZW5lcmF0ZXMgaW4gdGhlIGR1bmdlb24uCgpUaHJlZSB0aGluZ3Mgd29ydGgga25vd2luZyBhYm91dCB0aGF0IHBhdGNoOgoKLSBgY29yZTpzdG9yZS1hcm1vcmAgaXMgdGhlIHN0b3JlJ3MgcmVjb3JkIGlkOiBpdHMgY29kZSwgYFNUT1JFX0FSTU9SYCwKICBsb3dlcmNhc2VkIHdpdGggYF9gIHR1cm5lZCBpbnRvIGAtYC4gVGhhdCBydWxlIGlzIHRoZSBTVE9SRSBmaWxlJ3MsIG5vdCBhCiAgdW5pdmVyc2FsIG9uZSAtIGVhY2ggZGF0YSBmaWxlIGRlY2xhcmVzIHdoYXQgaWRlbnRpZmllcyBpdHMgcmVjb3JkcywgYW5kIHRoZQogIHRhYmxlIG9mIHRoZW0gaXMgYHBhY2thZ2VzL21vZC1zZGsvc3JjL3JlY29yZC1rZXkudHNgLiBNb3N0IGZpbGVzIHVzZSBgbmFtZWA7CiAgYG9iamVjdGAgdXNlcyBgdHlwZWAgcGx1cyBgbmFtZWA7IGBicmFuZGAsIGBzbGF5YCBhbmQgYHByb2plY3Rpb25gIHVzZSBgY29kZWA7CiAgYGNvbnN0YW50c2AgYW5kIGB2aXN1YWxzYCBoYXZlIG9uZSByZWNvcmQgZWFjaCBhbmQgYXJlIG5hbWVkIGJ5IHRoZSBmaWxlLgotIGBub3JtYWxgIGlzIHRoZSAibWF5IHN0b2NrIiB0YWJsZTsgYGFsd2F5c2AgaXMgdGhlIHN0YXBsZXMuIEFwcGVuZGluZyB0bwogIGBhbHdheXNgIG1lYW5zIGEgc2hvcCBrZWVwcyBvbmUgb24gdGhlIHNoZWxmIGF0IGFsbCB0aW1lcywgd2hpY2ggZm9yIG1vc3QKICBpdGVtcyBpcyBub3Qgd2hhdCB5b3Ugd2FudCAtIGFuZCBub3RlIHRoZSBBcm1vdXJ5IHNoaXBzIG5vIGBhbHdheXNgIGxpc3QgYXQKICBhbGwsIHNvIGFwcGVuZGluZyB0byBvbmUgdGhlcmUgaGFzIG5vdGhpbmcgdG8gYXBwZW5kIHRvIGFuZCBpcyByZXBvcnRlZCByYXRoZXIKICB0aGFuIHdvcmtpbmcgcXVpZXRseS4KLSBgc3ZhbGAgaXMgdGhlIGl0ZW0ncyBuYW1lIHdpdGhvdXQgdGhlIGB+YC4gSWYgaXQgZG9lcyBub3QgbWF0Y2ggYW4gaXRlbQogIHRoYXQgZXhpc3RzLCB0aGUgZ2FtZSBkcm9wcyB0aGF0IG9uZSBsaW5lIGZyb20gdGhlIHNob3AncyB0YWJsZSBhbmQgcmVwb3J0cyBpdAogIGFnYWluc3QgeW91ciBtb2QgaW4gdGhlIG1vZCBtYW5hZ2VyLCBzbyBhIHR5cG8gY29zdHMgeW91IGEgbGluZSBhbmQgdGVsbHMgeW91CiAgd2hpY2ggb25lLCByYXRoZXIgdGhhbiBiZWluZyBzaWxlbnQgb3IgdGFraW5nIHRoZSBnYW1lIGRvd24gd2l0aCBpdC4KCioqYGFwcGVuZGAgaXMgd2h5IHR3byBzaG9wIG1vZHMgY2FuIGNvZXhpc3QuKiogSXQgYWRkcyB0byB0aGUgbGlzdCByYXRoZXIgdGhhbgpyZXN0YXRpbmcgaXQsIHNvIGNvcmUncyBvd24gZWlnaHRlZW4gZW50cmllcyBzdGF5LCBhbmQgYSBzZWNvbmQgbW9kIGFwcGVuZGluZyB0bwp0aGUgc2FtZSBzdG9yZSBrZWVwcyBpdHMgZW50cnkgdG9vLiBOb2JvZHkgaGFzIHRvIGNvcHkgYSBsaXN0IG91dCBvZiB0aGUgYmFzZQpnYW1lJ3MgZGF0YSBhbmQgd2F0Y2ggaXQgZ28gc3RhbGUuIEl0cyBjb3VudGVycGFydCBpcyBgcmVtb3ZlVmFsdWVgLCB3aGljaCBkcm9wcwphbiBlbnRyeSwgYW5kIHRoYXQgb25lICpjYW4qIHRha2Ugb3V0IHNvbWV0aGluZyBhbm90aGVyIG1vZCBhZGRlZCwgc28gdGhlIGdhbWUKcmVwb3J0cyBpdCBhcyBhIGNvbmZsaWN0IGFuZCB0aGUgbW9kIHRoYXQgbG9hZHMgbGFzdCB3aW5zLgoKVGhlcmUgaXMgb25lIHdyaW5rbGU6IHlvdXIgYHN0b3JlLmpzb25gIG5hbWVzIHlvdXIgaXRlbSwgc28gaXQgb25seSBtYWtlcyBzZW5zZQp3aGlsZSB5b3VyIGBvYmplY3QuanNvbmAgaXMgYWxzbyBsb2FkZWQuIEtlZXAgYm90aCBpbiB0aGUgc2FtZSBtb2QsIHdoaWNoIGlzIHdoYXQKdGhpcyB0dXRvcmlhbCBkb2VzLiBJZiB5b3UgZG8gc3BsaXQgdGhlbSAoYSBzaG9wIG1vZCB0aGF0IHN0b2NrcyBhbm90aGVyIG1vZCdzCml0ZW0gaXMgYSBwZXJmZWN0bHkgcmVhc29uYWJsZSB0aGluZyB0byB3cml0ZSksIHRoZW4gdGhlIGRheSB0aGUgb3RoZXIgbW9kIGlzCnR1cm5lZCBvZmYsIHlvdXIgYXBwZW5kZWQgbGluZSBuYW1lcyBub3RoaW5nLiBUaGUgc2hvcCBsb3NlcyB0aGF0IGxpbmUsIHRoZSBtb2QKbWFuYWdlciBzYXlzIHNvIG9uIHlvdXIgbW9kJ3Mgcm93LCBhbmQgZXZlcnl0aGluZyBlbHNlIGluIHRoZSBBcm1vdXJ5IGlzIGV4YWN0bHkKYXMgaXQgd2FzLiBEZWNsYXJlIHRoZSBvdGhlciBtb2QgaW4geW91ciBgZGVwZW5kZW5jaWVzYCBzbyB0aGUgcGxheWVyIGlzIHRvbGQKYmVmb3JlIHRoZXkgZ2V0IHRoZXJlLgoKIyMgU2FtcGxlIG1vZAoKYHNhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTAyLWFkZC1hbi1pdGVtL2AsIHdoaWNoIGlzIGxvYWRlZCBhbmQgY29tcG9zZWQgYWdhaW5zdCB0aGUKcmVhbCBnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4uCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgMzogQWRkIGEgbW9uc3Rlcl0oMDMtYWRkLWEtbW9uc3Rlci5tZCksIHRoZSBzYW1lIG1vdmUgaW4gYQpkaWZmZXJlbnQgZmlsZSwgYW5kIHRoZSBvbmUgZ290Y2hhIHRoYXQgbm8gZXJyb3IgbWVzc2FnZSB3aWxsIGNhdGNoIGZvciB5b3UuCg=="
  },
  {
    "id": "tutorial-03",
    "path": "tutorials/03-add-a-monster.md",
    "audience": "beginner",
    "title": "3. Add a monster",
    "note": "Build the same idea in another record file.",
    "encoded": "IyBUdXRvcmlhbCAzOiBBZGQgYSBtb25zdGVyCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBhIGNhcnBlbnRlciBhbnQsIGEgc2xpZ2h0bHkgbmFzdGllciBjb3VzaW4gb2YgdGhlCnNvbGRpZXIgYW50LCBsaXZpbmcgb24gZHVuZ2VvbiBsZXZlbCAyLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgMl0oMDItYWRkLWFuLWl0ZW0ubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBNb2QgZmlsZXMKCmBgYApteS1tb25zdGVyLW1vZC8KICBtYW5pZmVzdC5qc29uCiAgbW9uc3Rlci5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIGlzIHRoZSBzYW1lIGFzIGJlZm9yZSB3aXRoIGEgbmV3IGBpZGAgYW5kIGBkZXNjcmlwdGlvbmAuIFRoZSBuZXcKZmlsZSBpcyBgbW9uc3Rlci5qc29uYDoKCmBgYGpzb24KewogICJyZWNvcmRzIjogWwogICAgewogICAgICAibmFtZSI6ICJjYXJwZW50ZXIgYW50IiwKICAgICAgImJhc2UiOiAiYW50IiwKICAgICAgImNvbG9yIjogInUiLAogICAgICAic3BlZWQiOiAxMTAsCiAgICAgICJoaXQtcG9pbnRzIjogMTEsCiAgICAgICJoZWFyaW5nIjogMTAsCiAgICAgICJzbWVsbCI6IDIwLAogICAgICAiYXJtb3ItY2xhc3MiOiA2LAogICAgICAic2xlZXBpbmVzcyI6IDQwLAogICAgICAiZGVwdGgiOiAyLAogICAgICAicmFyaXR5IjogMSwKICAgICAgImV4cGVyaWVuY2UiOiA2LAogICAgICAiYmxvdyI6IFt7ICJtZXRob2QiOiAiQklURSIsICJlZmZlY3QiOiAiSFVSVCIsICJkYW1hZ2UiOiAiMWQ0IiB9XSwKICAgICAgImRlc2MiOiBbIkEgYmlnIGJyb3duIGFudCB3aXRoIGphd3MgdGhhdCBzdHJpcCB3b29kLiBJdCBpcyBub3QgZnVzc3kgYWJvdXQgd2hhdCBlbHNlIHRoZXkgc3RyaXAuIl0KICAgIH0KICBdCn0KYGBgCgojIyBUaGUgb25lIHRoaW5nIHRoYXQgd2lsbCBiaXRlIHlvdQoKKipgYmFzZWAuKioKCkV2ZXJ5IG1vbnN0ZXIgaW5oZXJpdHMgZnJvbSBhICptb25zdGVyIGJhc2UqLCB0aGUgdGVtcGxhdGUgdGhhdCBkZWNpZGVzIGl0cwpzeW1ib2wgb24gdGhlIG1hcCwgd2hhdCBpdCBpcyBtYWRlIG9mLCB3aGljaCBhdHRhY2tzIGl0IGNhbiBoYXZlLCBhbmQgYSBwaWxlIG9mCm90aGVyIGRlZmF1bHRzLiBgYW50YCBpcyBvbmUgdGhhdCB0aGUgYmFzZSBnYW1lIHNoaXBzLiBTbyBhcmUgYGNhbmluZWAsIGBvcmNgLApgZHJhZ29uYCwgYW5kIGZpZnR5LW9kZCBvdGhlcnMuIFRoZSBmaWxlIGlzCmBwYWNrYWdlcy9jb250ZW50L3BhY2svbW9uc3Rlcl9iYXNlLmpzb25gIGFuZCBpdCBob2xkcyA1NiByZWNvcmRzIGluIHRvdGFsLCBzbyBpdAppcyBzaG9ydCBlbm91Z2ggdG8gcmVhZC4KCkdldCBpdCB3cm9uZyBhbmQgeW91IGdldCB0b2xkIHR3aWNlLCB3aGljaCBpcyB3b3J0aCBrbm93aW5nIGJlZm9yZSB5b3UgZ28gbG9va2luZwpmb3IgYSBzdWJ0bGVyIGV4cGxhbmF0aW9uLiBgYmFzZWAgaXMgYSBkZWNsYXJlZCByZWZlcmVuY2UsIHNvIGNvbXBvc2l0aW9uIHJlcG9ydHMKaXQgYnkgbmFtZTogKmJhc2UgbmFtZXMgdGhlIG1vbnN0ZXIgYmFzZSAiYXVudCIsIGFuZCBubyBsb2FkZWQgcGFjayBkZWZpbmVzIGl0IGluCm1vbnN0ZXJfYmFzZSosIG9uIHlvdXIgbW9kJ3Mgcm93LiBBbmQgdGhlIG1vbnN0ZXIgYmluZGVyIHRoZW4gcmVmdXNlcyB0byBidWlsZCB0aGUKcmVjb3JkIGF0IGFsbCByYXRoZXIgdGhhbiBidWlsZGluZyBhIG1vbnN0ZXIgd2l0aCBubyB0ZW1wbGF0ZS4gU286IGNvcHkgdGhlIGBiYXNlYApmcm9tIGEgcmVhbCBtb25zdGVyIG9mIHRoZSBraW5kIHlvdSBhcmUgbWFraW5nLCBhbmQgY2hlY2sgaXQgYWdhaW5zdApgbW9uc3Rlcl9iYXNlLmpzb25gIGlmIHlvdSB0eXBlZCBpdCBmcm9tIG1lbW9yeS4KClRoaXMgaXMgdGhlIHNpbmdsZSBtb3N0IGNvbW1vbiB3YXkgYSBmaXJzdCBtb25zdGVyIG1vZCBmYWlscywgd2hpY2ggaXMgd2h5IHRoZQp0dXRvcmlhbCdzIG93biB0ZXN0IGFzc2VydHMgdGhlIGJhc2UgZXhpc3RzIHJhdGhlciB0aGFuIHRydXN0aW5nIGl0LgoKIyMgUmVhZGluZyB0aGUgcmVzdAoKU2FtZSBwcmluY2lwbGUgYXMgaXRlbXM6IGZpbmQgYSBtb25zdGVyIGNsb3NlIHRvIHdoYXQgeW91IHdhbnQgaW4KYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9tb25zdGVyLmpzb25gIGFuZCBjb3B5IGl0cyBzaGFwZS4KCi0gYHNwZWVkYDogMTEwIGlzIG5vcm1hbCB3YWxraW5nIHBhY2UsIHRoZSBzYW1lIGFzIGFuIHVuaGFzdGVkIHBsYXllci4gMTIwCiAgaXMgZmFzdCBlbm91Z2ggdG8gYmUgZ2VudWluZWx5IGRhbmdlcm91cy4KLSBgZGVwdGhgIGFuZCBgcmFyaXR5YDogd2hlcmUgaXQgbGl2ZXMgYW5kIGhvdyBvZnRlbiBpdCBzaG93cyB1cCB0aGVyZS4KLSBgZXhwZXJpZW5jZWA6IG5vdCBhIGZsYXQgYXdhcmQuIFdoYXQgdGhlIHBsYXllciBhY3R1YWxseSBnZXRzIGlzCiAgYGV4cGVyaWVuY2UgKiB0aGUgbW9uc3RlcidzIGxldmVsIC8gdGhlIHBsYXllcidzIGxldmVsYCwgc28gdGhlIHNhbWUgbW9uc3RlciBpcwogIHdvcnRoIHN0ZWFkaWx5IGxlc3MgYXMgdGhlIGNoYXJhY3RlciBncm93cy4KLSBgc2xlZXBpbmVzc2A6IGhvdyBsaWtlbHkgaXQgaXMgdG8gYmUgYXNsZWVwIHdoZW4geW91IGFycml2ZS4gMCBtZWFucyBpdCBpcwogIGFsd2F5cyBhd2FrZSBhbmQgY29taW5nIGZvciB5b3UuCi0gYGJsb3dgOiBhIGxpc3QuIEVhY2ggZW50cnkgaXMgYSBgbWV0aG9kYCAoaG93IGl0IGF0dGFja3MpLCBhbiBgZWZmZWN0YAogICh3aGF0IHRoYXQgZG9lcyB0byB5b3UpLCBhbmQgYGRhbWFnZWAgZGljZS4gVGhyZWUgYmxvd3MgbWVhbnMgdGhyZWUgYXR0YWNrcyBwZXIKICB0dXJuLiBUaGUgYXZhaWxhYmxlIG1ldGhvZHMgYW5kIGVmZmVjdHMgYXJlIGluIGBibG93X21ldGhvZHMuanNvbmAgYW5kCiAgYGJsb3dfZWZmZWN0cy5qc29uYCBiZXNpZGUgdGhlIG1vbnN0ZXIgZmlsZS4KLSBgY29sb3JgOiBhIHNpbmdsZSBsZXR0ZXIsIGFuZCB0aGUgY2FzZSBtYXR0ZXJzLiBgdWAgaXMgVW1iZXIgKGJyb3duKSwgYHlgCiAgaXMgWWVsbG93LCBgd2AgaXMgV2hpdGUgLSBgV2AgaXMgTGlnaHQgU2xhdGUsIHdoaWNoIGlzIHdoYXQgdGhlIHNvbGRpZXIgYW50CiAgYWN0dWFsbHkgaXMuIGBwYWNrYWdlcy9jb3JlL3NyYy9jb2xvci50c2AgaXMgdGhlIGNoYXJ0LgoKIyMgQ2hlY2sgdGhlIHJlc3VsdAoKU3RhcnQgYSBjaGFyYWN0ZXIsIGRlc2NlbmQgdG8gbGV2ZWwgMiwgYW5kIGxvb2sgZm9yIGEgYnJvd24gYGFgLiBMb29rIGl0IHVwIHdpdGgKYC9gIG9yIHJlY2FsbCBpdCB3aXRoIGBsYCBhbmQgdGhlIGdhbWUgd2lsbCBkZXNjcmliZSBpdCB1c2luZyB0aGUgdGV4dCB5b3Ugd3JvdGUuCgojIyBWYXJpYXRpb25zIHRvIHRyeQoKLSBNYWtlIGl0IGEgdW5pcXVlOiBhZGQgYCJmbGFncyI6IFsiVU5JUVVFIl1gLCBnaXZlIGl0IGEgY2FwaXRhbGlzZWQgcHJvcGVyCiAgbmFtZSBhbmQgYSBsb3QgbW9yZSBoaXQgcG9pbnRzLgotIEdpdmUgaXQgYSBzZWNvbmQgYmxvdyBieSBhZGRpbmcgYW5vdGhlciBlbnRyeSB0byB0aGUgYGJsb3dgIGFycmF5LgotIE1ha2UgaXQgZmFzdCBhbmQgZnJhZ2lsZTogYHNwZWVkYCAxMzAsIGBoaXQtcG9pbnRzYCA0LgotIEFkZCBhIHdob2xlIGZhbWlseTogc2V2ZXJhbCByZWNvcmRzIGluIG9uZSBhcnJheSwgc2hhcmluZyBhIGJhc2UuCgojIyBUZXN0IGEgYmFkIGJhc2UgcmVmZXJlbmNlCgpDaGFuZ2UgYCJiYXNlIjogImFudCJgIHRvIGAiYmFzZSI6ICJhdW50ImAgYW5kIHJlbG9hZC4gTm90aWNlIHdoYXQgZG9lcyAqYW5kIGRvZXMKbm90KiBoYXBwZW4uIFRoYXQgaXMgdGhlIGZhaWx1cmUgbW9kZSBkZXNjcmliZWQgYWJvdmUsIGFuZCBpdCBpcyBtdWNoIGVhc2llciB0bwpyZWNvZ25pc2UgbGF0ZXIgaWYgeW91IGhhdmUgc2VlbiBpdCBvbmNlIG9uIHB1cnBvc2UuCgojIyBXaGF0IGl0IGxvb2tzIGxpa2UsIGFuZCB0aGUgb25lIHRoaW5nIHlvdSBoYXZlIHRvIGFzayBmb3IKCllvdXIgYW50IGFscmVhZHkgaGFzIGFuIGFwcGVhcmFuY2UsIGFuZCB5b3Ugb25seSB3cm90ZSBoYWxmIG9mIGl0OgoKLSBgImNvbG9yIjogInUiYCBpcyB5b3VyczogdW1iZXIsIHNvIGl0IGRyYXdzIGFzIGEgYnJvd24gYGFgIGFuZCByZWFkcyBhcyBhCiAgZGlmZmVyZW50IGNyZWF0dXJlIGZyb20gdGhlIHdoaXRlIGBhYCBiZXNpZGUgaXQuCi0gVGhlIGxldHRlciBgYWAgaXMgbm90IHlvdXJzLiBJdCBjb21lcyBmcm9tIGAiYmFzZSI6ICJhbnQiYCwgYWxvbmcgd2l0aAogIGV2ZXJ5dGhpbmcgZWxzZSB0aGUgdGVtcGxhdGUgY2Fycmllcy4gQ2hhbmdlIHRoZSBiYXNlIGFuZCB0aGUgbGV0dGVyIGNoYW5nZXMuCgoqKkluIGEgdGlsZSBzZXQsIHlvdXIgYW50IGhhcyBubyBwaWN0dXJlLCBhbmQgdGhlIGdhbWUgd2lsbCBub3QgaW52ZW50IG9uZS4qKiBBCnRpbGUgc2V0IG1hcHMgKm5hbWVkKiBtb25zdGVycyB0byBwaWN0dXJlcyBhbmQgaGFzIG5ldmVyIGhlYXJkIG9mIHlvdXJzLCBzbyBpbgp0aWxlIG1vZGUgYSBwbGF5ZXIgc2VlcyB5b3VyIGJyb3duIGBhYCBzdGFuZGluZyBhbW9uZyBwaWN0dXJlcy4gVGhlIGdhbWUgdXNlZCB0bwpndWVzcyAtIGl0IGRyZXcgYW4gYWRkZWQgbW9uc3RlciB3aXRoIHRoZSB0aWxlIG9mIGEgcmVsYXRpdmUgc2hhcmluZyBpdHMgYGJhc2VgIC0KYW5kIHRoYXQgZ3Vlc3Mgd2FzIHJlbW92ZWQgaW4gMC4yMy4wLCBiZWNhdXNlIE5lbyBBbmdiYW5kIGlzIGEgZmFpdGhmdWwgcG9ydCBvZgo0LjIuNiBhbmQgNC4yLjYgaGFzIG5vIG9waW5pb24gYWJvdXQgd2hhdCBhIGNyZWF0dXJlIGl0IGhhcyBuZXZlciBoZWFyZCBvZiBzaG91bGQKbG9vayBsaWtlLiBEZWNpZGluZyB0aGF0IG9uIGJlaGFsZiBvZiBzb21lYm9keSdzIGFydCBpcyB0aGUgdGlsZSBzZXQncyBjYWxsLCBub3QKdGhlIHBvcnQncy4KCioqU28gc2hpcCB0aWxlcyB3aXRoIHlvdXIgY29udGVudCBpZiB5b3UgY2FuLCBhbmQgc2F5IHdoYXQgaGFwcGVucyBpZiB5b3UgZG8gbm90LioqClR3byBzZW50ZW5jZXMgaW4geW91ciBtb2QncyBkZXNjcmlwdGlvbiBhcmUgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBhIHBsYXllcgp0aGlua2luZyB5b3VyIG1vZCBpcyBicm9rZW4gYW5kIGEgcGxheWVyIGtub3dpbmcgd2hhdCB0aGV5IGFyZSBsb29raW5nIGF0OgoKPiBJbmNsdWRlcyB0aWxlcyBmb3IgdGhlIGNhcnBlbnRlciBhbnQuCgpvcgoKPiBObyB0aWxlcyBvZiBpdHMgb3duOiBpbiB0aWxlIG1vZGUgdGhlIGNhcnBlbnRlciBhbnQgZHJhd3MgYXMgYSBsZXR0ZXIuIEluc3RhbGwKPiBbbGlub2xldW1dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1saW5vbGV1bSkgYW5kIGl0IGlzCj4gZHJhd24gZnJvbSBpdHMgZmFtaWx5IGluc3RlYWQuCgpUaGF0IHNlY29uZCBvbmUgaXMgYSByZWFsIGZhbGxiYWNrIHJhdGhlciB0aGFuIGEgc2hydWcuIExpbm9sZXVtLCB0aGUgbG9vc2UtcGFjawp0aWxlIG1vZCwgZmlsbHMgY29udGVudCBub3RoaW5nIGRyZXc6IGFuIGFkZGVkIG1vbnN0ZXIgaXMgZHJhd24gZnJvbSBhIHJlbGF0aXZlCnNoYXJpbmcgaXRzIGBiYXNlYCB3aXRoIHRoZSBjb2xvdXIgdHVybmVkLCBzbyB5b3VyIGNhcnBlbnRlciBhbnQgcmVhZHMgYXMgYW4gYW50CndpdGhvdXQgYmVpbmcgcGl4ZWwtaWRlbnRpY2FsIHRvIHRoZSBiYXNlIGdhbWUncy4gSXQgYXBwbGllcyB0byBMaW5vbGV1bSdzIG93bgpwYWNrcyBvbmx5IC0gdW5kZXIgQW5nYmFuZCdzIG93biB0aWxlIHNoZWV0cyB0aGVyZSBpcyBubyBzcGFyZSBjZWxsIGZvciBhIHZhcmlhbnQsCnNvIGEgbGV0dGVyIGlzIHdoYXQgYW4gYWRkZWQgY3JlYXR1cmUgZ2V0cyAtIGFuZCB5b3VyIHBsYXllcnMgdHVybiBpdCBvbgp0aGVtc2VsdmVzLiAqKkl0IGlzIG5vdCBhIGRlcGVuZGVuY3k6KiogeW91ciBtb2QgaXMgY29tcGxldGUgYW5kIGNvcnJlY3QgaW4gQVNDSUkKd2l0aCBubyB0aWxlIHNldCBhdCBhbGwsIHNvIGRvIG5vdCByZXF1aXJlIGl0LiBQb2ludCBhdCBpdCwgYW5kIGxldCB0aGUgcGxheWVyCmNob29zZS4KClRoaXMgaXMgYWxzbyB3aHkgYGJhc2VgIGlzIHdvcnRoIGNob29zaW5nIHdpdGggY2FyZSByYXRoZXIgdGhhbiBmaWxsaW5nIGluOiBpdCBpcwp0aGUgc2luZ2xlIGZpZWxkIHRoYXQgZGVjaWRlcyB0aGUgbGV0dGVyLCB0aGUgdGVtcGxhdGUsIGFuZCwgZm9yIGFueW9uZSBydW5uaW5nIGEKdGlsZSBtb2QgdGhhdCBmaWxscyBibGFua3MsIHRoZSBmYW1pbHkgaXQgYm9ycm93cyBmcm9tLgoKSWYgeW91IHdhbnQgYSAqc3BlY2lmaWMqIHBpY3R1cmUsIGEgbW9kIGNhbiBzYXkgc28uIEJvdGggcm91dGVzIGFyZSBwYXN0IHdoYXQgdGhpcwp0dXRvcmlhbCBjb3ZlcnMsIGFuZCB0aGV5IGRpZmZlciBtb3JlIHRoYW4gdGhleSBsb29rOgoKLSBQb2ludCBhdCBhIHBpY3R1cmUgdGhhdCBhbHJlYWR5IGV4aXN0cy4gU2hpcCBhIGAucHJmYCBhcyBhIGBwcmVmc2AKICByZXNvdXJjZSwgYW5kIGl0cyBgbW9uc3RlcjpjYXJwZW50ZXIgYW50OjxhdHRyPjo8Y2hhcj5gIGxpbmUgbGF5ZXJzIG92ZXIgdGhlCiAgcGxheWVyJ3MgdGlsZSBzZXQgYW5kIHdpbnMgb3ZlciBhbnl0aGluZyBhIHRpbGUgbW9kIHdvdWxkIGhhdmUgZmlsbGVkIGluLiBPbmUKICBsaW5lLCBubyBhcnQsIGJ1dCB0aGUgbnVtYmVycyBhcmUgKmF0bGFzIGNvb3JkaW5hdGVzKiwgc28gdGhleSBhcmUgY29ycmVjdCBmb3IKICBvbmUgcGFjayBhbmQgd3JvbmcgZm9yIGV2ZXJ5IG90aGVyLiBSZWFjaCBmb3IgdGhpcyB3aGVuIHlvdXIgbW9kIHNoaXBzIG9yCiAgcmVxdWlyZXMgYSBwYXJ0aWN1bGFyIHNldC4KLSBTaGlwIGEgd2hvbGUgdGlsZSBzZXQuIEEgbW9kIHdpdGggdGhlIGB0aWxlc2AgZmFjZXQgY29udHJpYnV0ZXMgYSBncmFwaGljcwogIG1vZGUgb2YgaXRzIG93biAoYHRpbGVQYWNrc2ApLCB3aGljaCBpcyBob3cgdGhlIExpbm9sZXVtIHNldHMgYXJlIGRlbGl2ZXJlZC4KICBUaGF0IGlzIGEgc2V0IHRoZSBwbGF5ZXIgY2hvb3NlcyBmcm9tIHRoZSBHcmFwaGljcyBtZW51LCBub3Qgb25lIHBpY3R1cmUgYWRkZWQKICB0byBzb21lYm9keSBlbHNlJ3Mgc2V0LCB3aGljaCBub3RoaW5nIHN1cHBvcnRzIHRvZGF5LgoKU2VlIFttb2RkaW5nL1JFQURNRS5tZF0oLi4vUkVBRE1FLm1kKSBmb3IgYm90aC4KCiMjIENoYW5naW5nIGEgbW9uc3RlciB0aGF0IGFscmVhZHkgZXhpc3RzCgpPbmUgZmlsZSBjYW4gYm90aCBhZGQgcmVjb3JkcyBhbmQgcGF0Y2ggdGhlbSwgYW5kIHRoZSBmaW5pc2hlZCBtb2QgZG9lcywgc28gdGhlCm1pcnJvciBvZiBbVHV0b3JpYWwgMV0oMDEtdHdlYWstYS12YWx1ZS5tZCkgaXMgd29ydGggc2VlaW5nIG9uIGEgbW9uc3RlcjoKCmBgYGpzb24KewogICJyZWNvcmRzIjogWyAuLi4geW91ciBjYXJwZW50ZXIgYW50IC4uLiBdLAogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpnaWFudC1ibGFjay1hbnQiOiBbCiAgICAgIHsgIm9wIjogImFkZCIsICJwYXRoIjogImhpdC1wb2ludHMiLCAidmFsdWUiOiAzIH0sCiAgICAgIHsgIm9wIjogImFkZEZsYWciLCAicGF0aCI6ICJmbGFncyIsICJmbGFnIjogIkdST1VQX0FJIiB9CiAgICBdCiAgfQp9CmBgYAoKR2lhbnQgYmxhY2sgYW50cyBub3cgaGF2ZSBhIGxpdHRsZSBtb3JlIGhlYWx0aCBhbmQgaHVudCBpbiBncm91cHMuIFR3byB0aGluZ3MKdGhhdCBzZWN0aW9uIGlzIHRlYWNoaW5nIGJleW9uZCB0aGUgb3BzIHRoZW1zZWx2ZXM6CgotIGBhZGRgIGlzIG5vdCBgc2V0YC4gYHsib3AiOiAiYWRkIiwgInBhdGgiOiAiaGl0LXBvaW50cyIsICJ2YWx1ZSI6IDN9YCBtZWFucwogICJ0aHJlZSBtb3JlIHRoYW4gd2hhdGV2ZXIgaXQgaXMiLCBzbyBpdCBzdGlsbCBkb2VzIHRoZSByaWdodCB0aGluZyBpZiB0aGUgYmFzZQogIGdhbWUgcmV0dW5lcyB0aGUgbW9uc3RlciwgYW5kIGl0IHN0aWxsIGRvZXMgdGhlIHJpZ2h0IHRoaW5nIGlmIGFub3RoZXIgbW9kCiAgY2hhbmdlZCBpdCBmaXJzdC4gYHNldGAgd291bGQgc2lsZW50bHkgdW5kbyBib3RoLgotIGBhZGRGbGFnYCBjb21wb3Nlcy4gVHdvIG1vZHMgYWRkaW5nIGRpZmZlcmVudCBmbGFncyB0byB0aGUgc2FtZSBtb25zdGVyIGJvdGgKICBnZXQgdGhlaXIgZmxhZzsgbmVpdGhlciBpcyBhIGNvbmZsaWN0LiBUaGF0IGlzIHRydWUgb2YgYGFkZEZsYWdgLCBgcmVtb3ZlRmxhZ2AKICBhbmQgYGFwcGVuZGAsIGFuZCBub3QgdHJ1ZSBvZiBgc2V0YCwgYG1lcmdlYCwgYGFkZGAgb3IgYG11bGAuIEZvciB0aG9zZSwgdHdvCiAgbW9kcyBvbiB0aGUgc2FtZSBmaWVsZCBpcyBhIHJlcG9ydGVkIGNvbmZsaWN0IGFuZCB0aGUgb25lIHRoYXQgbG9hZHMgbGFzdCB3aW5zLgoKQSBwYXRjaGVkIG1vbnN0ZXIga2VlcHMgaXRzIHBpY3R1cmUsIGJlY2F1c2UgdGhlIHRpbGUgc2V0IGFscmVhZHkga25vd3MgaXQgYnkKbmFtZS4gT25seSB0aGUgYW50IHlvdSAqYWRkZWQqIGhhcyBub3RoaW5nIGRyYXduIGZvciBpdC4KCiMjIFNhbXBsZSBtb2QKCmBzYW1wbGVzL3R1dG9yaWFscy90dXRvcmlhbC0wMy1hZGQtYS1tb25zdGVyL2AgaW4gdGhpcyByZXBvc2l0b3J5IGlzIGV4YWN0bHkKdGhpcyBtb2QuIEl0IGlzIG5vdCBhIGNvcHkgb2YgdGhlIHR1dG9yaWFsLiBJdCBpcyBhIG1vZCB0aGF0IGdldHMgbG9hZGVkIGFuZApjaGVja2VkIGFnYWluc3QgdGhlIHJlYWwgZ2FtZSBkYXRhIG9uIGV2ZXJ5IHRlc3QgcnVuLCBzbyBpZiBhbnl0aGluZyBvbiB0aGlzCnBhZ2UgZXZlciBzdG9wcyBiZWluZyB0cnVlLCB0aGUgYnVpbGQgZmFpbHMuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgNDogQ2hhbmdlIGEgc3BlbGxdKDA0LWNoYW5nZS1hLXNwZWxsLm1kKSwgcmVhY2hpbmcgaW50byBhCmNsYXNzJ3Mgc3BlbGwgbGlzdCwgYW5kIHdoYXQgYSBwb3NpdGlvbmFsIHBhdGggY29zdHMgeW91Lgo="
  },
  {
    "id": "tutorial-04",
    "path": "tutorials/04-change-a-spell.md",
    "audience": "beginner",
    "title": "4. Change a spell",
    "note": "Reach into a class and understand a positional path.",
    "encoded": "IyBUdXRvcmlhbCA0OiBDaGFuZ2UgYSBzcGVsbAoKKipXaGF0IHlvdSB3aWxsIG1ha2U6KiogYSBQcmllc3Qgd2hvc2UgTWlub3IgSGVhbGluZyBjb3N0cyAxIG1hbmEgaW5zdGVhZCBvZiAyCmFuZCBhbG1vc3QgbmV2ZXIgZmFpbHMuCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCAzXSgwMy1hZGQtYS1tb25zdGVyLm1kKS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCi0tLQoKIyMgTW9kIGZpbGVzCgpgYGAKbXktc3BlbGwtbW9kLwogIG1hbmlmZXN0Lmpzb24KICBjbGFzcy5qc29uCmBgYAoKYGNsYXNzLmpzb25gOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnByaWVzdCI6IFsKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4wLnNwZWxsLjIubWFuYSIsICJ2YWx1ZSI6IDEgfSwKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4wLnNwZWxsLjIuZmFpbCIsICJ2YWx1ZSI6IDUgfQogICAgXQogIH0KfQpgYGAKClRoaXMgaXMgVHV0b3JpYWwgMSdzIGBmaWVsZFBhdGNoZXNgIGFnYWluLCBwb2ludGVkIGF0IGEgY2xhc3MgaW5zdGVhZCBvZiBhbiBpdGVtLgpOb3RoaW5nIG5ldyBpcyBiZWluZyBpbnRyb2R1Y2VkIGV4Y2VwdCAqd2hlcmUgeW91IGFyZSBwb2ludGluZyouCgojIyBSZWFkaW5nIHRoZSBwYXRoCgpgYm9vay4wLnNwZWxsLjIubWFuYWAgd2Fsa3MgZG93biB0aHJvdWdoIHRoZSBQcmllc3QncyByZWNvcmQ6CgotIGBib29rLjBgOiB0aGUgUHJpZXN0J3MgZmlyc3Qgc3BlbGwgYm9vay4KLSBgc3BlbGwuMmA6IHRoZSB0aGlyZCBzcGVsbCBpbiBpdCAoY291bnRpbmcgZnJvbSB6ZXJvKS4gVGhhdCBpcyBNaW5vciBIZWFsaW5nLgotIGBtYW5hYDogaXRzIGNvc3QuCgpgZmFpbGAgaXMgdGhlIHBlcmNlbnRhZ2UgY2hhbmNlIHRoZSBzcGVsbCBmaXp6bGVzLCBiZWZvcmUgeW91ciBjaGFyYWN0ZXIncyBvd24Kc3RhdHMgYWRqdXN0IGl0LgoKVG8gZmluZCB0aGUgc3BlbGwgeW91IHdhbnQsIG9wZW4gYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9jbGFzcy5qc29uYCwgZmluZCB5b3VyCmNsYXNzLCBhbmQgY291bnQuIEJvb2tzIGFuZCBzcGVsbHMgYXJlIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhciBpbiB0aGUgZ2FtZSdzIG93bgpzcGVsbCBtZW51LCBzbyB5b3UgY2FuIGNvdW50IHRoZW0gb24gc2NyZWVuIGluc3RlYWQgaWYgdGhhdCBpcyBlYXNpZXIuCgojIyBQb3NpdGlvbmFsIHBhdGhzIGNhbiB0YXJnZXQgdGhlIHdyb25nIHNwZWxsCgoqKkEgbnVtYmVyIGluIHRoYXQgcGF0aCBpcyBhIHBvc2l0aW9uLCBub3QgYSBuYW1lLioqCgpgc3BlbGwuMmAgbWVhbnMgIndoYXRldmVyIGlzIHRoaXJkIiwgbm90ICJNaW5vciBIZWFsaW5nIi4gSWYgYW5vdGhlciBtb2QgaW5zZXJ0cwphIHNwZWxsIGFib3ZlIGl0LCBvciBpZiBhIGZ1dHVyZSByZWxlYXNlIG9mIHRoZSBiYXNlIGdhbWUgcmVvcmRlcnMgdGhhdCBib29rLAp5b3VyIHBhdGNoIGxhbmRzIG9uIGEgKmRpZmZlcmVudCBzcGVsbCogYW5kIGtlZXBzIHdvcmtpbmcgc2lsZW50bHkuIE5vdGhpbmcgaXMKYnJva2VuLCBzbyBub3RoaW5nIGNvbXBsYWluczsgeW91IGp1c3QgcXVpZXRseSByZXR1bmVkIHRoZSB3cm9uZyB0aGluZy4KClRoZXJlIGlzIG5vIHdheSBhcm91bmQgdGhhdCB0b2RheSwgYW5kIHByZXRlbmRpbmcgb3RoZXJ3aXNlIHdvdWxkIGJlIHdvcnNlIHRoYW4Kc2F5aW5nIGl0OiBwb3NpdGlvbmFsIHBhdGhzIGFyZSBob3cgdGhlIGRhdGEgaXMgc2hhcGVkLiBXaGF0IHlvdSBjYW4gZG8gaXMga25vdwppdC4gSWYgeW91IHB1Ymxpc2ggYSBzcGVsbCBtb2QsIHNheSB3aGljaCByZWxlYXNlIHlvdSBidWlsdCBpdCBhZ2FpbnN0LCBhbmQKcmUtY2hlY2sgaXQgd2hlbiB0aGUgZ2FtZSB1cGRhdGVzLiAoVGhlIHR1dG9yaWFsJ3Mgb3duIHRlc3QgYXNzZXJ0cyB0aGF0CmBib29rLjAuc3BlbGwuMmAgaXMgc3RpbGwgY2FsbGVkIE1pbm9yIEhlYWxpbmcsIHByZWNpc2VseSBzbyB0aGlzIHBhZ2UgY2Fubm90IGdvCnF1aWV0bHkgd3JvbmcuKQoKIyMgQWRkaW5nIGEgc3BlbGwgcmF0aGVyIHRoYW4gY2hhbmdpbmcgb25lCgpTYW1lIG1lY2hhbmlzbSwgb25lIGV4dHJhIHN0ZXAuIGBzZXRgIGEgd2hvbGUgc3BlbGwgb2JqZWN0IGF0IHRoZSBuZXh0IGZyZWUKaW5kZXgsIHRoZW4gcmFpc2UgdGhlIGJvb2sncyBgc3BlbGxzYCBjb3VudCBzbyB0aGUgZ2FtZSBrbm93cyB0aGUgYm9vayBnb3QKbG9uZ2VyOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnByaWVzdCI6IFsKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4yLnNwZWxsLjYiLCAidmFsdWUiOiB7ICJuYW1lIjogIlRlbGVwb3J0IE90aGVyIiwgImxldmVsIjogMTgsICJtYW5hIjogMTAsICJmYWlsIjogMzAsICJleHAiOiAyMCwgImVmZmVjdCI6IFsgeyAiZWZmIjogIkJPTFRfU1RBVFVTIiwgInR5cGUiOiAiQVdBWV9BTEwiLCAiZGljZSI6ICIkQiIsICJleHByIjogWyB7ICJuYW1lIjogIkIiLCAiYmFzZSI6ICJQTEFZRVJfTEVWRUwiLCAiZXhwciI6ICIqIDMiIH0gXSB9IF0sICJkZXNjIjogWyJQcm9kdWNlcyBhIGJvbHQgdGhhdCB0ZWxlcG9ydHMgYXdheSB0aGUgZmlyc3QgbW9uc3RlciBpbiBpdHMgcGF0aC4iXSB9IH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImJvb2suMi5zcGVsbHMiLCAidmFsdWUiOiA3IH0KICAgIF0KICB9Cn0KYGBgCgpUaGF0IGlzIG5vdCBhbiBpbnZlbnRlZCBleGFtcGxlLiBJdCBpcyB3aGF0IHRoZSByZWFsIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QKZG9lcyB0byBnaXZlIHRoZSBQcmllc3QgYmFjayBhIHNwZWxsIGEgbGF0ZXIgdmVyc2lvbiBvZiBBbmdiYW5kIGRyb3BwZWQsIGFuZCB0aGUKZm91ciBudW1iZXJzIGFyZSB0aGUgb25lcyBpdCBzaGlwcy4KClRoZXkgYXJlIHdvcnRoIGEgbW9tZW50LCBiZWNhdXNlIHRoZXkgYXJlIG5vdCB0aGUgbnVtYmVycyB0aGUgb2xkIGdhbWUgdXNlZC4KQW5nYmFuZCA0LjEuMiBnYXZlIHRoZSBQcmllc3QgdGhpcyBzcGVsbCBhcyBgVGVsZXBvcnQgT3RoZXI6MjA6MjA6ODA6MTZgLCBpbiB0aGF0CmZpbGUncyBgbmFtZTpsZXZlbDptYW5hOmZhaWw6ZXhwYCBvcmRlciwgYW5kIHRob3NlIHJlY29yZHMgYXJlIGluIHRoaXMgcmVwb3NpdG9yeQphdCBgcmVmZXJlbmNlL2xpYi9nYW1lZGF0YS9vbGRfY2xhc3MudHh0YC4gQW5nYmFuZCA0LjIgdGhlbiByZXByaWNlZCBzcGVsbHMgdG8KY29zdCB0aGUgc2FtZSBpbiBldmVyeSBjbGFzcyB0aGF0IGhhcyB0aGVtLCBzbyBib3RoIGNsYXNzZXMgdGhhdCBzdGlsbCBoYXZlIHRoaXMKb25lIHBheSAxMCBtYW5hIGF0IDMwIHBlcmNlbnQgZmFpbHVyZS4gUXVvdGluZyAyMCBhbmQgODAgaW50byB0aGUgY3VycmVudCBnYW1lCndvdWxkIGNoYXJnZSBhIFByaWVzdCB0d2ljZSB0aGUgbWFuYSBvZiB0aGUgaWRlbnRpY2FsIHNwZWxsIGluIGEgTWFnZSdzIGJvb2suIEdldAp0aGUgb2xkIGRhdGEgYW5kIHJlYWQgaXQsIHRoZW4gY2hlY2sgd2hldGhlciB0aGUgdW5pdHMgaXQgaXMgd3JpdHRlbiBpbiBzdGlsbCBtZWFuCndoYXQgdGhleSBtZWFudDogW0ZlYXR1cmUgcmVzdG9yYXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9GRUFUVVJFX1JFU1RPUkFUSU9OLm1kKSBpcyB0aGUgcnVsZSB0aGlzCmZvbGxvd3MsIGFuZCBpdHMgd29ya2VkIGV4YW1wbGUgaXMgdGhpcyBleGFjdCBzcGVsbC4KClRoZSBgZWZmZWN0YCBibG9jayBpcyB0aGUgZ2FtZSdzIG93biBlZmZlY3Qgdm9jYWJ1bGFyeTogYEJPTFRfU1RBVFVTYCwKYFBMQVlFUl9MRVZFTGAsIGRpY2UgZXhwcmVzc2lvbnMuIFlvdSBhcmUgbm90IGxpbWl0ZWQgdG8gdGhlIGVmZmVjdHMgdGhlIGJhc2UKZ2FtZSBzaGlwcywgYnV0IGludmVudGluZyBhIG5ldyBvbmUgaXMgYSBjb2RlIGpvYiByYXRoZXIgdGhhbiBhIGRhdGEgam9iOyB0aGF0CmlzIFtUdXRvcmlhbCA1XSgwNS1ob29rLWJlaGF2aW91ci5tZCkgYW5kIHRoZSBwYWdlcyBiZXlvbmQgaXQuCgojIyBDaGVjayB0aGUgcmVzdWx0CgpSb2xsIGEgUHJpZXN0LCBsZWFybiBNaW5vciBIZWFsaW5nLCBhbmQgb3BlbiB0aGUgc3BlbGwgbWVudS4gSXRzIG1hbmEgY29zdCByZWFkcwoxIGFuZCBpdHMgZmFpbHVyZSByYXRlIGlzIGZhciBsb3dlciB0aGFuIGFuIHVubW9kZGVkIFByaWVzdCdzIGF0IHRoZSBzYW1lIGxldmVsLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gUmV0dW5lIGEgKipkaWZmZXJlbnQgY2xhc3MqKjogYGNvcmU6bWFnZWAsIGBjb3JlOnJhbmdlcmAsIGBjb3JlOnBhbGFkaW5gLgotIE1vdmUgYSBzcGVsbCAqKmVhcmxpZXIqKjogc2V0IGl0cyBgbGV2ZWxgIHRvIDEgYW5kIGdldCBpdCBhdCBjaGFyYWN0ZXIKICBjcmVhdGlvbi4KLSBNYWtlIGEgY2xhc3MgKip3b3JzZSoqIGF0IHNvbWV0aGluZywgd2hpY2ggaXMgb2Z0ZW4gd2hhdCBtYWtlcyBhIHZhcmlhbnQKICBpbnRlcmVzdGluZyByYXRoZXIgdGhhbiBhIGNoZWF0LgoKIyMgU2FtcGxlIG1vZAoKYHNhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTA0LWNoYW5nZS1hLXNwZWxsL2AuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgNTogSG9vayBiZWhhdmlvdXJdKDA1LWhvb2stYmVoYXZpb3VyLm1kKSwgdGhlIGZpcnN0IHR1dG9yaWFsCndoZXJlIHlvdXIgbW9kIHJ1bnMgY29kZSBpbnN0ZWFkIG9mIHNoaXBwaW5nIGRhdGEuCg=="
  },
  {
    "id": "tutorial-05",
    "path": "tutorials/05-hook-behaviour.md",
    "audience": "beginner",
    "title": "5. Hook behaviour",
    "note": "Write a ten-line plugin that changes behaviour.",
    "encoded": "IyBUdXRvcmlhbCA1OiBIb29rIG9uZSBwaWVjZSBvZiBiZWhhdmlvdXIKCioqV2hhdCB5b3Ugd2lsbCBtYWtlOioqIHRoZSBnYW1lIGNvbmdyYXR1bGF0aW5nIHlvdSB3aGVuIHlvdSBnYWluIGEgbGV2ZWwuCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCA0XSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkuCgoqKlRpbWU6KiogdGVuIG1pbnV0ZXMuCgoqKk5ldyBpZGVhOioqIHlvdXIgbW9kIHJ1bnMgY29kZS4gU3RpbGwgbm8gY29tcGlsZXIsIG5vIGJ1aWxkIHN0ZXAsIG5vCmRlcGVuZGVuY2llcywganVzdCBvbmUgYC5qc2AgZmlsZSBiZXNpZGUgdGhlIG1hbmlmZXN0LgoKLS0tCgojIyBNb2QgZmlsZXMKCmBgYApteS1jb2RlLW1vZC8KICBtYW5pZmVzdC5qc29uCiAgcGx1Z2luLmpzCmBgYAoKYG1hbmlmZXN0Lmpzb25gIGdhaW5zIHR3byBsaW5lcyBjb21wYXJlZCB0byB0aGUgY29udGVudCBtb2RzOgoKYGBganNvbgp7CiAgImlkIjogIm15LWNvZGUtbW9kIiwKICAibmFtZSI6ICJNeSBDb2RlIE1vZCIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJwbHVnaW4iLAogICJtb2RBcGkiOiAxLAogICJlbmdpbmUiOiAiPj0wLjIwLjAiLAogICJhdXRob3IiOiAieW91ciBuYW1lIiwKICAibGljZW5zZSI6ICJHUEwtMi4wLW9ubHkiLAogICJyZXBvc2l0b3J5IjogImh0dHBzOi8vZ2l0aHViLmNvbS95b3UvbXktY29kZS1tb2QiLAogICJkZXNjcmlwdGlvbiI6ICJDb25ncmF0dWxhdGVzIHlvdSBvbiBnYWluaW5nIGEgbGV2ZWwuIgp9CmBgYAoKYHNoYXBlYCBpcyBgcGx1Z2luYCByYXRoZXIgdGhhbiBgY29udGVudGAsIGFuZCBgbW9kQXBpYCBzYXlzIHdoaWNoIHZlcnNpb24gb2YgdGhlCnBsdWdpbiBjb250cmFjdCB0aGUgZmlsZSBpcyB3cml0dGVuIGFnYWluc3QuIFRoYXQgaXMgdGhlIHdob2xlIGRpZmZlcmVuY2UuCgpgcGx1Z2luLmpzYDoKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCgogIGhvb2tzKCkgewogICAgcmV0dXJuIHsKICAgICAgbWVzc2FnZVRleHQ6IChyYXcpID0+CiAgICAgICAgcmF3LnN0YXJ0c1dpdGgoIldlbGNvbWUgdG8gbGV2ZWwgIikgPyBgQ29uZ3JhdHVsYXRpb25zISAke3Jhd31gIDogcmF3LAogICAgfTsKICB9LAp9OwpgYGAKClRlbiBsaW5lcywgYW5kIHRoYXQgaXMgdGhlIGVudGlyZSBtb2QuCgojIyBXaGF0IGlzIGhhcHBlbmluZwoKQSBtb2QgdGhhdCBydW5zIGNvZGUgKipkZWZhdWx0LWV4cG9ydHMgb25lIG9iamVjdCoqLiBUaGUgZ2FtZSBsb29rcyBhdCB0aGF0Cm9iamVjdCBhbmQgYXNrcyBpdCBxdWVzdGlvbnMuCgpgaG9va3MoKWAgcmV0dXJucyBhIHBsYWluIG9iamVjdCB3aG9zZSBrZXlzIGFyZSAqKmJlaGF2aW91ciBwb2ludHMqKiwgcGxhY2VzCndoZXJlIHRoZSBnYW1lIHdpbGwgY29uc3VsdCBhIG1vZCBiZWZvcmUgZG9pbmcgc29tZXRoaW5nLiBUaGVyZSBhcmUgZWlnaHQgb2YKdGhlbS4gWW91IHN1cHBseSB0aGUgb25lcyB5b3UgY2FyZSBhYm91dCBhbmQgb21pdCB0aGUgcmVzdDsgYSBrZXkgeW91IGRvIG5vdAp3cml0ZSBpcyBhIHBsYWNlIHRoZSBnYW1lIG5ldmVyIGFza3MgeW91IGFib3V0LCBhbmQgaXQgY29zdHMgbm90aGluZy4KCmBtZXNzYWdlVGV4dGAgaXMgdGhlIHNpbXBsZXN0IG9uZS4gRXZlcnkgcGxheWVyLXZpc2libGUgbWVzc2FnZSBwYXNzZXMgdGhyb3VnaAppdCBvbiBpdHMgd2F5IHRvIHRoZSBtZXNzYWdlIGxpbmUsIGFuZCB3aGF0ZXZlciB5b3UgcmV0dXJuIGlzIHdoYXQgaXMgc2hvd24uCgoqKk5vdGUgd2hhdCBpcyAqbm90KiBoZXJlLioqIFRoZXJlIGFyZSBubyBpbXBvcnRzLiBgcGx1Z2luLmpzYCBpcyBhIHBsYWluIEVTCm1vZHVsZSB0aGF0IHRoZSBnYW1lIGxvYWRzIGZyb20geW91ciBmb2xkZXI7IGl0IGRvZXMgbm90IGltcG9ydCB0aGUgZW5naW5lLApiZWNhdXNlIHRoZSBlbmdpbmUgaXMgcGFzc2VkICppbiogdG8gdGhlIGZ1bmN0aW9ucyB0aGF0IG5lZWQgaXQuIFRoYXQgaXMgd2hhdAprZWVwcyBhIG1vZCBmcm9tIGhhdmluZyB0byBiZSBidWlsdCwgYnVuZGxlZCwgb3Iga2VwdCBpbiBzdGVwIHdpdGggdGhlIGdhbWUncwppbnRlcm5hbCBtb2R1bGUgbGF5b3V0LiBJZiB5b3Ugd2FudCBtb3JlIHRoYW4gb25lIGZpbGUsIHlvdSBjYW4gYGltcG9ydAoiLi9saWIvd2hhdGV2ZXIuanMiYCBmcm9tIHlvdXIgb3duIGZvbGRlcjsgcmVsYXRpdmUgcGF0aHMgd29yayBvbiBib3RoIHRoZQpkZXNrdG9wIGFuZCBicm93c2VyIGJ1aWxkcy4KCiMjIE9uZSBydWxlIGFib3V0IHRoaXMgaG9vawoKQSBtZXNzYWdlIGhvb2sgbWF5ICoqcmVzdGF0ZSoqIGEgbWVzc2FnZS4gSXQgbXVzdCBuZXZlciBjaGFuZ2Ugd2hhdCBhIG1lc3NhZ2UKbWVhbnMuCgoiQ29uZ3JhdHVsYXRpb25zISIgaW4gZnJvbnQgb2YgYSBsZXZlbC11cCBpcyBhIHJlc3RhdGVtZW50OiBzYW1lIGZhY3QsIG1vcmUKZW50aHVzaWFzbS4gVHVybmluZyAqIllvdSBhcmUgcG9pc29uZWQuIiogaW50byAqIllvdSBmZWVsIGZpbmUuIiogaXMgbm90LCBhbmQgYQptb2QgdGhhdCBkb2VzIGl0IGhhcyBtYWRlIHRoZSBnYW1lIGxpZSB0byB0aGUgcGxheWVyIGFib3V0IHRoZWlyIG93biBjaGFyYWN0ZXIuCgpUaGlzIGlzIG5vdCB0aGUgZW5naW5lIHN0b3BwaW5nIHlvdTsgdGhlIGVuZ2luZSB3aWxsIGhhcHBpbHkgcmV0dXJuIHdoYXRldmVyIHlvdQp3cml0ZS4gSXQgaXMgdGhlIGxpbmUgYmV0d2VlbiBhIG1vZCB0aGF0IGNoYW5nZXMgdGhlIGdhbWUgYW5kIGEgbW9kIHRoYXQgYnJlYWtzCml0LCBhbmQgdGhpcyBob29rIGlzIHRoZSBlYXNpZXN0IHBsYWNlIGluIHRoZSB3aG9sZSBzeXN0ZW0gdG8gY3Jvc3MgaXQgYnkKYWNjaWRlbnQuCgojIyBUaGUgbWlzdGFrZSB0byBhdm9pZAoKYGBganMKbWVzc2FnZVRleHQ6IChyYXcpID0+IChyYXcuc3RhcnRzV2l0aCgiV2VsY29tZSB0byBsZXZlbCAiKSA/IGBDb25ncmF0dWxhdGlvbnMhICR7cmF3fWAgOiByYXcpLAovLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBeXl5eCmBgYAoKVGhhdCB0cmFpbGluZyBgOiByYXdgIG1hdHRlcnMgZW5vcm1vdXNseS4gWW91ciBmdW5jdGlvbiBzZWVzICoqZXZlcnkqKiBtZXNzYWdlCnRoZSBnYW1lIHByaW50cywgc28gb25lIHRoYXQgZm9yZ2V0cyB0byByZXR1cm4gdGhlIG9yaWdpbmFsIHRleHQgZm9yIGNhc2VzIGl0CmRvZXMgbm90IGNhcmUgYWJvdXQgZGVsZXRlcyB0aGUgcmVzdCBvZiB0aGUgZ2FtZSdzIG91dHB1dC4gV2hhdGV2ZXIgeW91ciBob29rCmRvZXMsIHRoZSBkZWZhdWx0IGJyYW5jaCByZXR1cm5zIHdoYXQgaXQgd2FzIGdpdmVuLgoKIyMgUnVubmluZyBpdAoKRXhhY3RseSBhcyBiZWZvcmU6IHRoZSBgbW9kcy9gIGZvbGRlciBvbiB0aGUgZGVza3RvcCBidWlsZCwgb3IgKipDaG9vc2UgYSBtb2RzCmZvbGRlci4uLioqIGluIGEgYnJvd3Nlci4gQSBjb2RlIG1vZCBpcyBsb2FkZWQgZnJvbSBhIGZvbGRlciB0aGUgc2FtZSB3YXkgYSBkYXRhCm1vZCBpcy4KCiMjIENoZWNrIHRoZSByZXN1bHQKCkdhaW4gYSBsZXZlbC4gVGhlIG1lc3NhZ2UgcmVhZHMgKiJDb25ncmF0dWxhdGlvbnMhIFdlbGNvbWUgdG8gbGV2ZWwgMi4iKgoKVHVybiB0aGUgbW9kIG9mZiwgcmVsb2FkLCBhbmQgaXQgcmVhZHMgKiJXZWxjb21lIHRvIGxldmVsIDIuIiogYWdhaW4uCgojIyBWYXJpYXRpb25zIHRvIHRyeQoKLSBDb25ncmF0dWxhdGUgbG91ZGx5OiBgYCBgKioqICR7cmF3LnRvVXBwZXJDYXNlKCl9ICoqKmAgYGAuCi0gUmVhY3QgdG8gYSAqKmRpZmZlcmVudCoqIG1lc3NhZ2UuIEZpbmQgb25lIHlvdSBsaWtlIGluIHRoZSBnYW1lIGFuZCBtYXRjaCBvbgogIGl0LgotIEFkZCBhIHNlY29uZCBob29rLiBgc2F2ZU5vaXNlU2NlbnRgIGFuZCBgb2JqZWN0TGlzdFRpZWJyZWFrYCBhcmUgdHdvIG9mIHRoZQogIG90aGVyIHNldmVuOyBzZWUgW01PRF9TRUFNUy5tZF0oLi4vTU9EX1NFQU1TLm1kKSBmb3Igd2hhdCBlYWNoIG9uZSBpcyBhc2tlZCB0byBkbwogIGFuZCB3aGVuLgotIFByaW50IHNvbWV0aGluZyB0byB0aGUgY29uc29sZSBmcm9tIGluc2lkZSB0aGUgaG9vayBhbmQgd2F0Y2ggaG93IG9mdGVuIGl0IGlzCiAgY2FsbGVkLiBJdCBpcyBhIGdvb2Qgd2F5IHRvIGdldCBhIGZlZWwgZm9yIHRoZSBnYW1lJ3MgbWVzc2FnZSB2b2x1bWUuCgojIyBTYW1wbGUgbW9kCgpgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDUtaG9vay1iZWhhdmlvdXIvYCwgd2hpY2ggcmVhbGx5IGlzIGltcG9ydGVkIGFuZCByZWFsbHkgaXMKZm9sZGVkIHRocm91Z2ggdGhlIGdhbWUncyBvd24gaG9vayBjb21wb3NpdGlvbiBvbiBldmVyeSB0ZXN0IHJ1bi4gVGhlIHRlc3Qgd291bGQKZmFpbCBpZiB0aGlzIHBhZ2UncyBjb2RlIHN0b3BwZWQgd29ya2luZy4KCi0tLQoKKipOZXh0OioqIFtUdXRvcmlhbCA2OiBBZGQgYW4gb3B0aW9uXSgwNi1hZGQtYW4tb3B0aW9uLm1kKSwgdGhlIHNhbWUgbW9kLCB3aXRoIGEKc3dpdGNoIHRoZSBwbGF5ZXIgY29udHJvbHMuCg=="
  },
  {
    "id": "tutorial-06",
    "path": "tutorials/06-add-an-option.md",
    "audience": "beginner",
    "title": "6. Add an option",
    "note": "Let a player switch your change on and off.",
    "encoded": "IyBUdXRvcmlhbCA2OiBBZGQgYW4gb3B0aW9uCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBUdXRvcmlhbCA1J3MgbW9kLCB3aXRoIGEgc3dpdGNoIHRoZSBwbGF5ZXIgY2FuIHR1cm4gb24KYW5kIG9mZiwgZnJvbSB0aGUgZ2FtZSwgd2l0aG91dCBlZGl0aW5nIGFueXRoaW5nLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgNV0oMDUtaG9vay1iZWhhdmlvdXIubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBNb2QgZmlsZXMKClNhbWUgdHdvIGZpbGVzLiBgbWFuaWZlc3QuanNvbmAgZ2FpbnMgYSBgcnVsZXNgIGJsb2NrOgoKYGBganNvbgp7CiAgImlkIjogIm15LW9wdGlvbi1tb2QiLAogICJuYW1lIjogIk15IE9wdGlvbiBNb2QiLAogICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAic2hhcGUiOiAicGx1Z2luIiwKICAibW9kQXBpIjogMSwKICAiZW5naW5lIjogIj49MC4yMC4wIiwKICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20veW91L215LW9wdGlvbi1tb2QiLAogICJkZXNjcmlwdGlvbiI6ICJDb25ncmF0dWxhdGVzIHlvdSBvbiBnYWluaW5nIGEgbGV2ZWwsIGlmIHlvdSB3YW50IGl0IHRvLiIsCiAgInJ1bGVzIjogWwogICAgewogICAgICAiZmxhZyI6ICJteS1vcHRpb24tbW9kLmNvbmdyYXR1bGF0ZSIsCiAgICAgICJ0aXRsZSI6ICJDb25ncmF0dWxhdGUgbWUgb24gZ2FpbmluZyBhIGxldmVsIiwKICAgICAgImRlc2NyaXB0aW9uIjogIlB1dHMgXCJDb25ncmF0dWxhdGlvbnMhXCIgaW4gZnJvbnQgb2YgdGhlIGxldmVsLXVwIG1lc3NhZ2UuIE5vdGhpbmcgZWxzZSBjaGFuZ2VzLiIsCiAgICAgICJkZWZhdWx0IjogZmFsc2UKICAgIH0KICBdCn0KYGBgCgpgcGx1Z2luLmpzYCBnYWlucyBvbmUgbGluZToKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCgogIGhvb2tzKGN0eCkgewogICAgaWYgKGN0eC5mbGFnc1sibXktb3B0aW9uLW1vZC5jb25ncmF0dWxhdGUiXSAhPT0gdHJ1ZSkgcmV0dXJuIHt9OwogICAgcmV0dXJuIHsKICAgICAgbWVzc2FnZVRleHQ6IChyYXcpID0+CiAgICAgICAgcmF3LnN0YXJ0c1dpdGgoIldlbGNvbWUgdG8gbGV2ZWwgIikgPyBgQ29uZ3JhdHVsYXRpb25zISAke3Jhd31gIDogcmF3LAogICAgfTsKICB9LAp9OwpgYGAKClRoYXQgaXMgdGhlIGVudGlyZSBmZWF0dXJlLiBUaGVyZSBpcyBubyBzZXR0aW5ncyBBUEkgdG8gbGVhcm4sIG5vIHN0b3JhZ2UgdG8KbWFuYWdlLCBhbmQgbm8gc2NyZWVuIHRvIGJ1aWxkLgoKIyMgVGhlIG1hbmlmZXN0IGZsYWcgY29udHJvbHMgaG9vayByZWdpc3RyYXRpb24KCllvdSAqKmRlY2xhcmUqKiB0aGUgc3dpdGNoIGluIHRoZSBtYW5pZmVzdC4gVGhlIGdhbWUgYnVpbGRzIHRoZSBzY3JlZW4sIHNob3dzCnlvdXIgYHRpdGxlYCBhbmQgYGRlc2NyaXB0aW9uYCwgcmVtZW1iZXJzIHdoYXQgdGhlIHBsYXllciBjaG9zZSwgYW5kIHB1dHMgdGhlCmFuc3dlciBpbiBgY3R4LmZsYWdzYCBiZWZvcmUgeW91ciBjb2RlIHJ1bnMuCgpTbyByZWFkaW5nIGEgc2V0dGluZyBpcyBhIHBsYWluIHByb3BlcnR5IGxvb2t1cC4gYHRpdGxlYCBhbmQgYGRlc2NyaXB0aW9uYCBhcmUKd2hhdCB0aGUgcGxheWVyIHJlYWRzLCBzbyB3cml0ZSB0aGVtIGZvciBhIHBsYXllcjogc2F5IHdoYXQgdHVybmluZyBpdCBvbiBkb2VzLApub3Qgd2hhdCBpdCBkb2VzIGludGVybmFsbHkuCgpUaGUgZmxhZyBuYW1lIGlzIHByZWZpeGVkIHdpdGggeW91ciBtb2QncyBpZCBieSBjb252ZW50aW9uLCBhbmQgdGhlIGNvbnZlbnRpb24gaXMgd29ydGgga2VlcGluZy4gYGN0eC5mbGFnc2AgaXRzZWxmIGlzIG5vdCBzaGFyZWQ6IHRoZSBob3N0IGdpdmVzIGVhY2ggbW9kIGl0cyBvd24gc2xpY2UsIHNvIHlvdSBjYW5ub3Qgc2VlIGFub3RoZXIgbW9kJ3MgdG9nZ2xlcyBhbmQgdGhleSBjYW5ub3Qgc2VlIHlvdXJzLiBUaGUgcGxheWVyJ3Mgc2F2ZWQgY2hvaWNlcywgdGhvdWdoLCBhbGwgbGl2ZSBpbiBvbmUgZmxhdCBtYXAga2V5ZWQgYnkgZmxhZyBuYW1lLCBzbyB0d28gbW9kcyB0aGF0IGJvdGggY2FsbGVkIGEgZmxhZyBgY29uZ3JhdHVsYXRlYCB3b3VsZCBzaGFyZSBvbmUgc3RvcmVkIHNldHRpbmcuCgojIyBXaGVyZSB0aGUgY2hlY2sgZ29lcywgYW5kIHdoeSBpdCBtYXR0ZXJzCgpMb29rIGF0IHdoZXJlIHRoZSBgaWZgIGlzOiBpbiBgaG9va3NgLCBkZWNpZGluZyB3aGV0aGVyIHRvIHN1cHBseSB0aGUgaG9vayBhdCBhbGwsIHJhdGhlciB0aGFuIGluc2lkZSBgbWVzc2FnZVRleHRgIHJldHVybmluZyBgcmF3YCB1bmNoYW5nZWQuCgpUaGUgdHdvIGxvb2sgaWRlbnRpY2FsIHRvIHRoZSBwbGF5ZXIsIGJ1dCB0aGV5IHdvcmsgZGlmZmVyZW50bHk6CgotIENoZWNraW5nIGluc2lkZSB0aGUgaG9vayBtZWFucyB0aGUgZ2FtZSBjYWxscyB5b3VyIGZ1bmN0aW9uIGZvciBldmVyeSBtZXNzYWdlIGl0IGV2ZXIgcHJpbnRzLCBmb3JldmVyLCBhbmQgeW91ciBmdW5jdGlvbiBkZWNpZGVzIHRvIGRvIG5vdGhpbmcuCi0gQ2hlY2tpbmcgYXJvdW5kIHRoZSBob29rIG1lYW5zIHRoYXQgd2hlbiB0aGUgb3B0aW9uIGlzIG9mZiwgeW91IHN1cHBsaWVkIG5vIGhvb2ssIHNvIHRoZSBnYW1lIHJ1bnMgaXRzIG93biB1bnRvdWNoZWQgcGF0aCBhbmQgeW91ciBtb2QgaXMgbm90IGluIGl0IGF0IGFsbC4KClVzZSB0aGUgc2Vjb25kLiBBIGRpc2FibGVkIG9wdGlvbiBzaG91bGQgY29zdCBub3RoaW5nIGFuZCBiZSBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIHlvdXIgbW9kIG5vdCBiZWluZyBpbnN0YWxsZWQsIGFuZCBjaGVja2luZyBhcm91bmQgdGhlIGhvb2sgaXMgd2hhdCBndWFyYW50ZWVzIHRoYXQgdHVybmluZyB0aGUgb3B0aW9uIG9mZiBnaXZlcyB5b3UgdGhlIGJhc2UgZ2FtZSBiYWNrLgoKIyMgRGVmYXVsdCBvZmYKCk1ha2UgYCJkZWZhdWx0IjogZmFsc2VgIGEgaGFiaXQ6IGVuYWJsaW5nIGEgbW9kIHNob3VsZCBub3Qgc3dpdGNoIG9uIGFsbCBvZiBpdHMgZmVhdHVyZXMuCgpTb21lb25lIGluc3RhbGxzIHlvdXIgbW9kIGJlY2F1c2UgdGhleSB3YW50IG9uZSB0aGluZyBpbiBpdC4gU2hpcHBpbmcgZXZlcnkKdG9nZ2xlIG9uIG1lYW5zIHRoZXkgZ2V0IGZpdmUgY2hhbmdlcyB0aGV5IGRpZCBub3QgYXNrIGZvciBhbmQgbm93IGhhdmUgdG8KZGlzY292ZXIgYSBzZXR0aW5ncyBzY3JlZW4gdG8gdW5kby4gU2hpcCB0aGVtIG9mZiwgZGVzY3JpYmUgZWFjaCBvbmUgY2xlYXJseSwgYW5kCmxldCB0aGVtIGNob29zZS4KClRoZSBmaXJzdC1wYXJ0eSBgZmVhdHVyZS1yZXN0b3JhdGlvbmAgbW9kIHdvcmtzIGV4YWN0bHkgdGhpcyB3YXk6IGVuYWJsaW5nIGl0CmNoYW5nZXMgbm90aGluZyBhdCBhbGwgdW50aWwgeW91IHBpY2sgYSBmZWF0dXJlLgoKIyMgQ2hlY2sgdGhlIHJlc3VsdAoKRW5hYmxlIHRoZSBtb2QuIFN3aXRjaGluZyBhIG1vZCBvbiB0aGF0IGRlY2xhcmVzIGF0IGxlYXN0IG9uZSBydWxlIGFza3Mgd2hpY2ggb2YKaXRzIGZlYXR1cmVzIHRvIHR1cm4gb246ICoqRW5hYmxlIGRlZmF1bHQgZmVhdHVyZXMqKiAod2hhdGV2ZXIgYCJkZWZhdWx0ImAgc2F5cwppbiB0aGUgbWFuaWZlc3QsIHdoaWNoIGZvciB0aGlzIHR1dG9yaWFsIGlzIG9mZiksICoqQ2hvb3NlIGZlYXR1cmVzIHRvIGVuYWJsZSoqCihvcGVucyB0aGlzIG1vZCdzIG93biBvcHRpb25zIHNjcmVlbiBzbyB5b3UgY2FuIGRlY2lkZSBwZXIgcnVsZSksIG9yICoqRG8gbm90CmVuYWJsZSBhbnkgZmVhdHVyZXMqKiAoZXZlcnkgcnVsZSBvZmYsIHJlZ2FyZGxlc3Mgb2YgaXRzIG1hbmlmZXN0IGRlZmF1bHQpLgpQaWNraW5nIHRoZSBkZWZhdWx0IGhlcmUgbGVhdmVzICpDb25ncmF0dWxhdGUgbWUgb24gZ2FpbmluZyBhIGxldmVsKiBvZmYsIGV4YWN0bHkKYXMgYCJkZWZhdWx0IjogZmFsc2VgIHNheXMuCgpQcmVzcyBgRXNjYXBlYCwgY2hvb3NlICoqTW9kcyoqLCBjaG9vc2UgeW91ciBtb2QsIGFuZCB5b3Ugd2lsbCBmaW5kIHRoYXQgc2FtZQpvcHRpb24gb24gaXRzIG93biBzY3JlZW4uIFR1cm4gaXQgb24sIGNob29zZSAqKkFwcGx5IGNoYW5nZXMgYW5kIHJlbG9hZCoqLCBhbmQKZ2FpbiBhIGxldmVsLgoKIyMgVmFyaWF0aW9ucyB0byB0cnkKCi0gQWRkIGEgKipzZWNvbmQqKiBvcHRpb24sIGNvbnRyb2xsaW5nIHNvbWV0aGluZyBlbHNlLCBhbmQgc2VlIGJvdGggYXBwZWFyLgotIE1ha2Ugb25lICoqZGVmYXVsdCBvbioqIGFuZCBub3RpY2UgaG93IGRpZmZlcmVudGx5IHRoZSBtb2QgZmVlbHMgdG8gaW5zdGFsbC4KICBUaGVuIGRlY2lkZSB3aGV0aGVyIHlvdSB3ZXJlIHJpZ2h0LgotIFJlbmFtZSBhIHJ1bGUgZmxhZyBvciBhIHNlY3Rpb24gYW5kIHJlYWQgYWJvdXQgYHJlbmFtZWRSdWxlRmxhZ3NgIGFuZAogIGByZW5hbWVkU2VjdGlvbkZsYWdzYCBpbiBbQVVUSE9SSU5HLm1kXSguLi9BVVRIT1JJTkcubWQpLCBzaW5jZSB0aGVyZSBpcyBhCiAgc3VwcG9ydGVkIHdheSB0byBkbyBlaXRoZXIgd2l0aG91dCBsb3NpbmcgZXZlcnlvbmUncyBzYXZlZCBjaG9pY2UuCgojIyBTYW1wbGUgbW9kCgpgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbi9gLiBJdHMgdGVzdCBhc3NlcnRzIHRoZSBpbnRlcmVzdGluZyBoYWxmOgp0aGF0IHdpdGggdGhlIG9wdGlvbiBvZmYsIHRoZSBtb2Qgc3VwcGxpZXMgKipubyBob29rIGF0IGFsbCoqLgoKLS0tCgojIyBZb3UgaGF2ZSBmaW5pc2hlZCB0aGUgY29yZSBzaXgKClNpeCBtb2RzLCBhbmQgYmV0d2VlbiB0aGVtIHRoZXkgY292ZXIgdGhlIHNoYXBlIG9mIG5lYXJseSBldmVyeXRoaW5nIGVsc2U6CmNoYW5naW5nIGRhdGEsIGFkZGluZyBkYXRhLCBydW5uaW5nIGNvZGUsIGFuZCBsZXR0aW5nIHRoZSBwbGF5ZXIgZGVjaWRlLgoKKipPbmUgbW9yZSwgaWYgeW91IHdhbnQgaXQ6KiogW1R1dG9yaWFsIDddKDA3LWFkZC1hbi1hcnRpZmFjdC5tZCkgYWRkcyBhbgphcnRpZmFjdC4gSXQgaXMgdGhlIG9kZCBvbmUgb3V0LCBiZWNhdXNlIGFuIGFydGlmYWN0IGlzIGEgbGF5ZXIgb3ZlciBhbiBpdGVtCnJhdGhlciB0aGFuIGFuIGl0ZW0sIHNvIGl0IGlzIHdvcnRoIGRvaW5nIG9uY2UgZXZlbiB0aG91Z2ggbm90aGluZyBuZXcgYWJvdXQgdGhlCm1vZCBzeXN0ZW0gaXMgaW4gaXQuCgpXaGVyZSB0byBnbyBhZnRlciB0aGF0IGRlcGVuZHMgb24gd2hhdCB5b3Ugd2FudCB0byBidWlsZC4gU2VlClt0aGUgbGVhcm5pbmcgcGF0aF0oUkVBRE1FLm1kI2FmdGVyLXRoZS10dXRvcmlhbHMpLgo="
  },
  {
    "id": "tutorial-07",
    "path": "tutorials/07-add-an-artifact.md",
    "audience": "beginner",
    "title": "7. Add an artifact",
    "note": "Build on top of an item and keep it composable.",
    "encoded": "IyBUdXRvcmlhbCA3OiBBZGQgYW4gYXJ0aWZhY3QKCioqV2hhdCB5b3Ugd2lsbCBtYWtlOioqIHRoZSBMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllLCBhIG9uZS1vZi1hLWtpbmQKc2hpZWxkIHRoYXQgdHVybnMgdXAgc29tZXdoZXJlIGFyb3VuZCBkdW5nZW9uIGxldmVsIDEyIGFuZCBuZXZlciB0dXJucyB1cCB0d2ljZS4KCioqQmVmb3JlIHRoaXM6KiogW1R1dG9yaWFsIDJdKDAyLWFkZC1hbi1pdGVtLm1kKS4gVHV0b3JpYWxzIDMgdG8gNiBhcmUgbm90CnJlcXVpcmVkIGZvciB0aGlzIG9uZSwgYnV0IDIgaXM6IGFuIGFydGlmYWN0IHN0YW5kcyBvbiB0b3Agb2YgYW4gb3JkaW5hcnkgaXRlbSwKc28gaXQgaGVscHMgdG8gaGF2ZSBhZGRlZCBvbmUgZmlyc3QuCgoqKlRpbWU6KiogdGVuIG1pbnV0ZXMuCgotLS0KCiMjIFdoYXQgYW4gYXJ0aWZhY3QgYWN0dWFsbHkgaXMKCkdldCB0aGlzIHN0cmFpZ2h0IGJlZm9yZSB5b3UgdHlwZSBhbnl0aGluZywgYmVjYXVzZSB0aGUgcmVzdCBvZiB0aGUgdHV0b3JpYWwgZm9sbG93cyBmcm9tIGl0LgoKQW4gYXJ0aWZhY3QgaXMgYSBzZXQgb2YgYWRqdXN0bWVudHMgdG8gYW4gaXRlbSB0aGUgZ2FtZSBhbHJlYWR5IGhhcywgbm90IGEgbmV3IGtpbmQgb2YgaXRlbS4gIlRoZSBMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllIiBpcyBhIHJlYWwgbGVhdGhlciBzaGllbGQsIGZyb20gdGhlIHJlYWwgbGVhdGhlciBzaGllbGQgZW50cnkgaW4gYG9iamVjdC5qc29uYCwgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCBiZXR0ZXIgbnVtYmVycyBhbmQgc29tZSBmbGFncyBib2x0ZWQgb24uIFRoYXQgaXMgd2h5IHRoZSByZWNvcmQgaGFzIGEgZmllbGQgY2FsbGVkIGBiYXNlLW9iamVjdGAsIGFuZCB3aHkgYWxtb3N0IGV2ZXJ5IG90aGVyIGZpZWxkIGlzIGEgbnVtYmVyOiB5b3UgYXJlIGRlc2NyaWJpbmcgdGhlIGRpZmZlcmVuY2UsIG5vdCB0aGUgdGhpbmcuCgpUd28gY29uc2VxdWVuY2VzIGZvbGxvdyBmcm9tIHRoYXQsIGFuZCB0aGV5IGFyZSB3aGF0IG1ha2VzIGFydGlmYWN0cyBmZWVsCmRpZmZlcmVudCBmcm9tIHR1dG9yaWFsIDI6CgotIEl0IGlzIHVuaXF1ZS4gVGhlIGdhbWUgZ2VuZXJhdGVzIGVhY2ggYXJ0aWZhY3QgYXQgbW9zdCBvbmNlIHBlciBjaGFyYWN0ZXIuCiAgVGhlcmUgaXMgbm8gYGFsbG9jYCBmaWdodCB3aXRoIGEgaHVuZHJlZCBvdGhlciBzaGllbGRzOyB0aGVyZSBpcyBvbmUgb2YgdGhlc2UsCiAgb3IgdGhlcmUgaXMgbm90IG9uZSB5ZXQuCi0gSXQgaW5oZXJpdHMgc29tZSB0aGluZ3MgYW5kIG5vdCBvdGhlcnMuIFRoZSBiYXNlIG9iamVjdCBzdXBwbGllcyB0aGUKICBraW5kJ3MgZmxhZ3MsIGFuZCBpdHMgYWN0aXZhdGlvbiB3aGVuIHlvdXIgYXJ0aWZhY3QgZGVjbGFyZXMgbm9uZS4gSXQgZG9lcyBOT1QKICBzdXBwbHkgdGhlIG51bWJlcnM6IGB3ZWlnaHRgLCBgYWNgLCBgdG8tYWAsIGB0by1oYCwgYHRvLWRgIGFuZCB0aGUgZGFtYWdlIGRpY2UKICBhbGwgY29tZSBmcm9tIHRoZSBhcnRpZmFjdCByZWNvcmQsIGFuZCBvbmUgeW91IGxlYXZlIG91dCBiaW5kcyB0byB6ZXJvIHJhdGhlcgogIHRoYW4gdG8gdGhlIGJhc2Ugb2JqZWN0J3MgdmFsdWUuIFNheSB0aGVtLiBBCiAgbGVhdGhlciBzaGllbGQncyB3ZWlnaHQgY2xhc3MsIGl0cyBtYXRlcmlhbCwgaG93IGl0IHJlYWN0cyB0byBhY2lkOiBhbGwgb2YgdGhhdAogIGFycml2ZXMgZm9yIGZyZWUgYmVjYXVzZSB5b3UgbmFtZWQgdGhlIGJhc2UuCgojIyBNb2QgZmlsZXMKCmBgYApteS1hcnRpZmFjdC1tb2QvCiAgbWFuaWZlc3QuanNvbgogIGFydGlmYWN0Lmpzb24KYGBgCgpgbWFuaWZlc3QuanNvbmAgaXMgdGhlIHNhbWUgc2hhcGUgYXMgZXZlcnkgdHV0b3JpYWwgYmVmb3JlIHRoaXMsIHdpdGggaXRzIG93bgpgaWRgIGFuZCBgZGVzY3JpcHRpb25gLCBhbmQgb25lIGRpZmZlcmVuY2Ugd29ydGggbm90aWNpbmc6IGl0cyBgZW5naW5lYCBmbG9vciBpcwpgPj0wLjIyLjBgIHJhdGhlciB0aGFuIGA+PTAuMjAuMGAsIGJlY2F1c2UgdGhhdCBpcyB0aGUgcmVsZWFzZSB0aGUgYmVoYXZpb3VyIHRoaXMKcGFnZSByZWxpZXMgb24gbGFuZGVkIGluLiBBbiBgZW5naW5lYCByYW5nZSBpcyBhIGNsYWltIGFib3V0IHdoaWNoIGJ1aWxkcyBhIG1vZAp3YXMgd3JpdHRlbiBhZ2FpbnN0LCBzbyBpdCBtb3ZlcyB3aGVuIHdoYXQgdGhlIG1vZCBkZXBlbmRzIG9uIG1vdmVzLiBUaGUgbmV3IGZpbGUKaXMgYGFydGlmYWN0Lmpzb25gOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbCiAgICB7CiAgICAgICJuYW1lIjogIm9mIHRoZSBXYXRjaGZ1bCBFeWUiLAogICAgICAiYmFzZS1vYmplY3QiOiB7CiAgICAgICAgInR2YWwiOiAic2hpZWxkIiwKICAgICAgICAic3ZhbCI6ICJMZWF0aGVyIFNoaWVsZCIKICAgICAgfSwKICAgICAgImxldmVsIjogMTIsCiAgICAgICJ3ZWlnaHQiOiA1MCwKICAgICAgImNvc3QiOiAxNDAwMCwKICAgICAgImFsbG9jIjogewogICAgICAgICJjb21tb24iOiAxMCwKICAgICAgICAibWlubWF4IjogIjEyIHRvIDcwIgogICAgICB9LAogICAgICAiYXR0YWNrIjogewogICAgICAgICJoZCI6ICIwZDAiLAogICAgICAgICJ0by1oIjogMCwKICAgICAgICAidG8tZCI6IDAKICAgICAgfSwKICAgICAgImFybW9yIjogewogICAgICAgICJhYyI6IDgsCiAgICAgICAgInRvLWEiOiAxMAogICAgICB9LAogICAgICAiZmxhZ3MiOiBbIlNFRV9JTlZJUyIsICJQUk9UX0ZFQVIiXSwKICAgICAgInZhbHVlcyI6IFsiSU5GUkFbMl0iLCAiUkVTX0RBUktbMV0iXSwKICAgICAgImRlc2MiOiBbCiAgICAgICAgIkEgcm91bmQgc2hpZWxkIG9mIGJvaWxlZCBsZWF0aGVyLCBpdHMgYm9zcyB3b3JrZWQgaW50byBhIHNpbmdsZSBvcGVuIGV5ZS4iLAogICAgICAgICIgIFRoZSBleWUgZG9lcyBub3QgYmxpbmssIGFuZCBuZWl0aGVyLCB3aGlsZSB5b3UgY2FycnkgaXQsIGRvIHlvdS4iCiAgICAgIF0KICAgIH0KICBdCn0KYGBgCgpUdXJuIGl0IG9uLCByb2xsIGEgY2hhcmFjdGVyLCBhbmQgZ28gZG93bi4gU29tZXdoZXJlIGJldHdlZW4gbGV2ZWwgMTIgYW5kIGxldmVsCjcwIHlvdSB3aWxsIGZpbmQgaXQsIG9uY2UuCgojIyBUaGUgbmFtZSBpcyBub3QgdGhlIG5hbWUKCkxvb2sgYXQgYG5hbWVgIGFnYWluOgoKYGBganNvbgoibmFtZSI6ICJvZiB0aGUgV2F0Y2hmdWwgRXllIgpgYGAKCkFuIGFydGlmYWN0J3MgbmFtZSBpcyBvbmx5IHRoZSBwYXJ0IHRoYXQgZ29lcyAqKmFmdGVyKiogdGhlIGJhc2Ugb2JqZWN0J3MgbmFtZSwgYmVjYXVzZSB0aGUgZ2FtZSBhc3NlbWJsZXMgdGhlIGZ1bGwgbmFtZSBmcm9tIGJvdGggaGFsdmVzOiBgTGVhdGhlciBTaGllbGRgIHBsdXMgYG9mIHRoZSBXYXRjaGZ1bCBFeWVgIGdpdmVzIHlvdSAqdGhlIExlYXRoZXIgU2hpZWxkIG9mIHRoZSBXYXRjaGZ1bCBFeWUqIGluIHRoZSBpdGVtIGxpc3QuCgpUaGlzIGlzIHdoeSBhcnRpZmFjdCBuYW1lcyBpbiB0aGUgYmFzZSBnYW1lIHJlYWQgdGhlIHdheSB0aGV5IGRvLiBMb29rIGluCmBwYWNrYWdlcy9jb250ZW50L3BhY2svYXJ0aWZhY3QuanNvbmAgYW5kIHlvdSB3aWxsIGZpbmQgYG9mIEdhbGFkcmllbGAsIHdoaWNoCmJlY29tZXMgdGhlIFBoaWFsIG9mIEdhbGFkcmllbCwgYWxvbmdzaWRlIGAnQW5ncmlzdCdgLCBpbiBxdW90ZXMsIHdoaWNoIGlzIGEKcHJvcGVyIG5hbWUgdGhhdCByZXBsYWNlcyB0aGUgYmFzZSBuYW1lIHJhdGhlciB0aGFuIGZvbGxvd2luZyBpdC4gUGljayB3aGljaGV2ZXIKcmVhZHMgY29ycmVjdGx5IGZvciB3aGF0IHlvdSBhcmUgbWFraW5nLCBhbmQgcmVtZW1iZXIgdGhhdCB5b3UgYXJlIHdyaXRpbmcgaGFsZgphIG5hbWUuCgpBbHNvIG5vdGUgd2hhdCBpcyAqKmFic2VudCoqOiBubyBgJmAsIG5vIGB+YC4gVHV0b3JpYWwgMidzIGl0ZW0gd2FzCmAiUGFkZGVkIEplcmtpbn4iYCwgd2l0aCBhIGB+YCBtYXJraW5nIHdoZXJlIHRoZSBwbHVyYWwgZ29lcy4gQW4gYXJ0aWZhY3QgaXMKdW5pcXVlLCBzbyBpdCBpcyBuZXZlciBwbHVyYWwsIGFuZCBpdCBuZXZlciBuZWVkcyBhbiBhcnRpY2xlIGNob3NlbiBmb3IgaXQuIElmCnlvdSBjYXJyeSB0dXRvcmlhbCAyJ3MgaGFiaXRzIG92ZXIgeW91IHdpbGwgZW5kIHVwIHdpdGggYW4gaXRlbSBjYWxsZWQgKnRoZQpMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllfiouCgojIyBUaGUgb25lIHRoaW5nIHRoYXQgd2lsbCBiaXRlIHlvdQoKVGhlIGZpZWxkIHRvIHdhdGNoIGlzIGBiYXNlLW9iamVjdGAuIEJvdGggaGFsdmVzIG9mIGl0IGhhdmUgdG8gbmFtZSBzb21ldGhpbmcgcmVhbDoKCi0gYHR2YWxgIGlzIHRoZSBpdGVtIHR5cGUsIGFuZCBpdCBjb21lcyBmcm9tIGBvYmplY3RfYmFzZS5qc29uYDogYHNoaWVsZGAsIGBzd29yZGAsIGBoYXJkIGFybW9yYCwgYGxpZ2h0YCwgYHJpbmdgLiBUaGVzZSBhcmUgdGhlIGJhc2UgZ2FtZSdzIG93biBzdHJpbmdzLCBub3QgbmFtZXMgeW91IGNob29zZSwgYW5kIHRoZSBhcm1vdXIgb25lcyB1c2UgdGhlIEFtZXJpY2FuIHNwZWxsaW5nLCB3aGljaCBjYXRjaGVzIHBlb3BsZSBvdXQuCi0gYHN2YWxgIGlzIHRoZSBiYXNlIG9iamVjdCdzIG5hbWUgd2l0aGluIHRoYXQgdHlwZSwgZnJvbSBgb2JqZWN0Lmpzb25gLCB3aXRoIHRoZSBgJmAgYW5kIGB+YCBkZWNvcmF0aW9uIHN0cmlwcGVkIG9mZi4gVGhlIGVudHJ5IHJlYWRzIGAiJiBMZWF0aGVyIFNoaWVsZH4iYDsgeW91IHdyaXRlIGAiTGVhdGhlciBTaGllbGQiYC4KCklmIHRoZSBgdHZhbGAgaXMgd3JvbmcsIHlvdXIgYXJ0aWZhY3QgaXMgZHJvcHBlZCwgYW5kIHRoZSBtb2QgbWFuYWdlciBzaG93cyBhIGxpbmUgbmFtaW5nIHRoZSByZWNvcmQgYW5kIHRoZSByZWFzb24sIHNvIHlvdSBrbm93IHdoYXQgdG8gZml4LgoKSWYgdGhlIGBzdmFsYCBpcyB3cm9uZywgdGhlIGdhbWUgZG9lcyBub3QgcmVmdXNlIGl0LiBJdCBjcmVhdGVzIGFuIGludmlzaWJsZSBwbGFjZWhvbGRlciBiYXNlIG9iamVjdCBhbmQgYnVpbGRzIHlvdXIgYXJ0aWZhY3Qgb24gdGhhdCBpbnN0ZWFkLCBiZWNhdXNlIHRoYXQgaXMgaG93IHRoZSBiYXNlIGdhbWUncyBvd24gUGhpYWwsIFN0YXIgYW5kIEFya2Vuc3RvbmUgd29yazogdGhvc2UgdGhyZWUgaGF2ZSBubyBvcmRpbmFyeSB2ZXJzaW9uIGFueXdoZXJlIGluIGBvYmplY3QuanNvbmAuIFRoZSBnYW1lIG5lZWRzIHRoYXQgYmVoYXZpb3VyLCBidXQgaXQgY2FuIHN0aWxsIHRlbGwgYSBtaXNzcGVsbGluZyBhcGFydDogYGJhc2Utb2JqZWN0LnN2YWxgIGlzIGEgZGVjbGFyZWQgcmVmZXJlbmNlLCBzbyBhIHR5cG8gaXMgcmVwb3J0ZWQgYnkgbmFtZSBvbiB5b3VyIG1vZCdzIHJvdyAtICpiYXNlLW9iamVjdC5zdmFsIG5hbWVzIHRoZSBiYXNlIG9iamVjdCB0aGUgYXJ0aWZhY3QgaXMgYnVpbHQgb24gImxldGhlciBzaGllbGQiLCBhbmQgbm8gbG9hZGVkIHBhY2sgZGVmaW5lcyBpdCBpbiBvYmplY3QqLiBJZiB5b3UgbWlzcyB0aGF0IHJlcG9ydCwgeW91IGdldCBhbiBhcnRpZmFjdCB0aGF0IGdlbmVyYXRlcyBhbmQgZXF1aXBzIGJ1dCB3aG9zZSBiYXNlIGlzIGJsYW5rOiBubyB3ZWlnaHQgY2xhc3MsIG5vbmUgb2YgdGhlIGJhc2UncyBvd24gYmVoYXZpb3VyLCBhbiBpdGVtIHRoYXQgaXMgc29tZWhvdyBub3QgcmVhbGx5IGEgc2hpZWxkLgoKU28gY29weSB0aGUgYHN2YWxgIG91dCBvZiBgb2JqZWN0Lmpzb25gIGluc3RlYWQgb2YgdHlwaW5nIGl0IGZyb20gbWVtb3J5LiBJdCBpcyB0aGUgb25lIGZpZWxkIGluIHRoaXMgZmlsZSB3aGVyZSBhIHR5cG8gc3RpbGwgZ2l2ZXMgeW91IGEgd29ya2luZyBnYW1lLCB3aXRoIHRoZSB3cm9uZyBpdGVtIGluIGl0LgoKIyMgUGF0Y2hpbmcgYW4gYXJ0aWZhY3QgdGhlIGdhbWUgYWxyZWFkeSBoYXMKClRoZSBzYW1lIGZpbGUgY2FuIGNoYW5nZSBhbiBleGlzdGluZyBhcnRpZmFjdCwgdGhlIHNhbWUgd2F5IHR1dG9yaWFsIDMgY2hhbmdlZCBhbgpleGlzdGluZyBtb25zdGVyLiBBZGQgdGhpcyBiZXNpZGUgeW91ciBgcmVjb3Jkc2A6CgpgYGBqc29uCiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOmFuZ3Jpc3QiOiBbCiAgICAgIHsgIm9wIjogImFkZCIsICJwYXRoIjogImFybW9yLnRvLWEiLCAidmFsdWUiOiAzIH0KICAgIF0KICB9CmBgYAoKYGFkZGAgaXMgcmVsYXRpdmU6IHRocmVlIG1vcmUgcG9pbnRzIG9mIGFybW91ciB0aGFuIEFuZ3Jpc3QgYWxyZWFkeSBoYWQsIHdoYXRldmVyCnRoYXQgaXMuIFVzZSBgYWRkYCByYXRoZXIgdGhhbiBgc2V0YCBmb3IgYW55dGhpbmcgeW91IGFyZSBhZGp1c3RpbmcgcmF0aGVyIHRoYW4KZGVjaWRpbmcsIGFuZCB5b3VyIG1vZCB3aWxsIHN1cnZpdmUgdGhlIGJhc2UgZ2FtZSByZXR1bmluZyB0aGUgbnVtYmVyIHVuZGVybmVhdGgKeW91LgoKVGhlIHJlZiBpcyBgY29yZTpgIHBsdXMgdGhlIGFydGlmYWN0J3MgbmFtZSBpbiBsb3dlciBjYXNlIHdpdGggdGhlIHB1bmN0dWF0aW9uCmRyb3BwZWQsIHNvIGAnQW5ncmlzdCdgIGlzIGBjb3JlOmFuZ3Jpc3RgLiBJZiBhIHJlZiBkb2VzIG5vdCByZXNvbHZlLCB0aGUgbG9hZGVyCnRlbGxzIHlvdSBzbyBieSBuYW1lOyB0aGF0IGlzIHRoZSBmcmllbmRseSBmYWlsdXJlLCBhbmQgaXQgaXMgd2hhdApgbnB4IG5lby1hbmdiYW5kLW1vZC1jaGVja2AgaXMgZm9yLgoKIyMgQXJ0aWZhY3QgZmllbGRzCgpFdmVyeXRoaW5nIGJlbG93IGBiYXNlLW9iamVjdGAgaXMgdGhlIGZ1biBwYXJ0LgoKLSBgbGV2ZWxgIGlzIGhvdyBkZWVwIHRoZSBnYW1lIGNvbnNpZGVycyB0aGUgYXJ0aWZhY3QgdG8gYmUsIHdoaWNoIGZlZWRzCiAgaW50byBob3cgaXQgaXMgcHJpY2VkIGFuZCBob3cgZ29vZCBpdCBpcyBhbGxvd2VkIHRvIGJlLgotIGBhbGxvY2AgaXMgYGNvbW1vbmAsIHRoZSB3ZWlnaHRpbmcgYWdhaW5zdCBldmVyeXRoaW5nIGVsc2UgZWxpZ2libGUsIGFuZAogIGBtaW5tYXhgLCB0aGUgZGVwdGggYmFuZCBpdCBjYW4gYXBwZWFyIGluLiBgIjEyIHRvIDcwImAgbWVhbnMgaXQgd2lsbCBub3QgYmUKICBnZW5lcmF0ZWQgc2hhbGxvd2VyIHRoYW4gMTIgb3IgZGVlcGVyIHRoYW4gNzAuCi0gYGFybW9yLmFjYCByZXBsYWNlcyB0aGUgYmFzZSBvYmplY3QncyBhcm1vdXIgY2xhc3MsIGFuZCBgYXJtb3IudG8tYWAgaXMKICB0aGUgYm9udXMgb24gdG9wLiBPbiBhIHdlYXBvbiB5b3Ugd291bGQgYmUgcmVhY2hpbmcgZm9yIGBhdHRhY2suaGRgLCBgdG8taGAgYW5kCiAgYHRvLWRgIGluc3RlYWQuCi0gYGZsYWdzYCBhcmUgdGhlIHllcy1vci1ubyBwcm9wZXJ0aWVzOiBgU0VFX0lOVklTYCwgYFBST1RfRkVBUmAsCiAgYEZSRUVfQUNUYCwgYFJFR0VOYCwgYW5kIGEgbG9uZyBsaXN0IG1vcmUuCi0gYHZhbHVlc2AgYXJlIHRoZSBvbmVzIHRoYXQgY2FycnkgYSBudW1iZXIsIHdyaXR0ZW4gd2l0aCB0aGUgbnVtYmVyIGluCiAgc3F1YXJlIGJyYWNrZXRzOiBgSU5GUkFbMl1gLCBgUkVTX0RBUktbMV1gLCBgU1RSWzJdYCwgYFNQRUVEWzVdYC4KCkJvdGggbGlzdHMgYXJlIGluIGBwYWNrYWdlcy9jb250ZW50L3BhY2svb2JqZWN0X3Byb3BlcnR5Lmpzb25gLiBPbmUgY2F0Y2ggd2hlbgp5b3UgZ28gbG9va2luZzogYSByZXNpc3RhbmNlJ3MgYGNvZGVgIHRoZXJlIGlzIHRoZSBiYXJlIGVsZW1lbnQKKGByZXNpc3RhbmNlOkRBUktgKSwgYW5kIHRoZSB0b2tlbiB5b3Ugd3JpdGUgaW4gYHZhbHVlc2AgaXMgYFJFU19gIHBsdXMgdGhhdAplbGVtZW50LCBhc3NlbWJsZWQgd2hlbiB0aGUgcmVjb3JkIGJpbmRzLiBHcmVwcGluZyB0aGUgZmlsZSBmb3IgYFJFU19EQVJLYCBmaW5kcwpub3RoaW5nLiBGbGFncyBhbmQgbW9kaWZpZXJzIGFyZSBzcGVsbGVkIG91dAp1bmRlciBgY29kZWAsIHdoaWNoIGlzIHRoZSBmaWxlIHRvIGhhdmUgb3BlbiB3aGlsZSB5b3Ugd3JpdGUgdGhpcyByYXRoZXIgdGhhbiB0aGUKb25lIHRvIGd1ZXNzIGF0LiBBIGZsYWcgb3IgYSB2YWx1ZSB0aGUgZ2FtZSBkb2VzIG5vdCByZWNvZ25pc2UgaXMgcmVmdXNlZCB3aGVuCnlvdXIgbW9kIGxvYWRzLCB3aGljaCBpcyB0aGUgZ29vZCBvdXRjb21lOyB5b3UgZ2V0IHRvbGQsIGJlZm9yZSB5b3UgcGxheS4KCklmIHlvdSB3YW50IGFuIGFydGlmYWN0IHRoYXQgZG9lcyBzb21ldGhpbmcgd2hlbiB5b3UgYWN0aXZhdGUgaXQsIHRoYXQgaXMgYGFjdGAKcGx1cyBgdGltZWAsIGFuZCB0aGUgbmFtZXMgY29tZSBmcm9tIGBhY3RpdmF0aW9uLmpzb25gLiBDb3B5IGEgYmFzZS1nYW1lIGFydGlmYWN0CnRoYXQgYWxyZWFkeSBhY3RpdmF0ZXMgYW5kIGNoYW5nZSB0aGUgbnVtYmVycyBiZWZvcmUgd3JpdGluZyBvbmUgZnJvbSBzY3JhdGNoLgoKIyMgQXJ0aWZhY3QgcnVsZXMgdG8gcmVtZW1iZXIKCi0gQW4gYXJ0aWZhY3QgaXMgYSAqKmxheWVyIG92ZXIgYW4gZXhpc3RpbmcgaXRlbSoqLCBub3QgYSBuZXcgaXRlbSwgd2hpY2ggaXMgd2h5CiAgYGJhc2Utb2JqZWN0YCBleGlzdHMgYW5kIHdoeSB0aGUgcmVzdCBpcyBtb3N0bHkgbnVtYmVycy4KLSBJdHMgYG5hbWVgIGlzIG9ubHkgKipoYWxmIGEgbmFtZSoqLCBhbmQgaXQgdGFrZXMgbm9uZSBvZiB0aGUgYCZgIGFuZCBgfmAKICBkZWNvcmF0aW9uIGFuIG9yZGluYXJ5IGl0ZW0ncyBuYW1lIG5lZWRzLgotIEEgd3JvbmcgYHR2YWxgIGdldHMgcmVwb3J0ZWQuIEEgd3JvbmcgYHN2YWxgICoqc2lsZW50bHkgaW52ZW50cyBhIGJhc2Ugb2JqZWN0KiosCiAgYmVjYXVzZSB0aGUgYmFzZSBnYW1lIG5lZWRzIHRoYXQgYmVoYXZpb3VyIGZvciB0aGUgUGhpYWwuIENvcHkgdGhlIHN2YWwuCi0gYGFkZGAgYmVhdHMgYHNldGAgd2hlbiB5b3UgYXJlIGFkanVzdGluZyBhIG51bWJlciB0aGUgYmFzZSBnYW1lIG93bnMuCgojIyBTYW1wbGUgbW9kCgpgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDctYWRkLWFuLWFydGlmYWN0L2AgaW4gdGhpcyByZXBvc2l0b3J5IGlzIGV4YWN0bHkgdGhpcyBtb2QsIGFuZCBpdCBpcyBsb2FkZWQgYW5kIGNoZWNrZWQgYWdhaW5zdCB0aGUgcmVhbCBnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4sIHNvIHRoZSBidWlsZCBmYWlscyBpZiB0aGUgdHV0b3JpYWwgYW5kIHRoZSBnYW1lIGV2ZXIgZGlzYWdyZWUuCgoqKk5leHQ6Kiogbm90aGluZywgdGhpcyBpcyB0aGUgbGFzdCBvbmUuIFdoYXQgaXMgd29ydGggcmVhZGluZyBhZnRlciB0aGVzZSBpcwpsaXN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgW3R1dG9yaWFsIGluZGV4XShSRUFETUUubWQpLCBhbmQKW1JFUVVJUkVNRU5UUy5tZF0oLi4vUkVRVUlSRU1FTlRTLm1kKSBpcyB0aGUgb25lIHRvIHJlYWQgZmlyc3QgaWYgeW91IGFyZSBhYm91dAp0byBzaGFyZSBhIG1vZCB3aXRoIHNvbWVib2R5Lgo="
  },
  {
    "id": "tutorials",
    "path": "tutorials/README.md",
    "audience": "beginner",
    "title": "The beginner path",
    "note": "How the seven lessons fit together, and what to read next.",
    "encoded": "IyBNYWtlIGEgbW9kCgoqKk5ldmVyIG1hZGUgYSBtb2QgYmVmb3JlPyBUaGF0IGlzIGZpbmUuKiogVGhlc2UgZWlnaHQgdHV0b3JpYWxzIGFzc3VtZSB5b3UgY2FuCmVkaXQgYSB0ZXh0IGZpbGUgYW5kIG5vdGhpbmcgZWxzZS4gVGhlIGZpcnN0IG9uZSB0YWtlcyBhYm91dCBmaXZlIG1pbnV0ZXMgYW5kCmNoYW5nZXMgdGhlIGdhbWUuCgpZb3UgZG8gbm90IG5lZWQgdG8ga25vdyBUeXBlU2NyaXB0LiBZb3UgZG8gbm90IG5lZWQgYSBjb21waWxlciwgYSBidWlsZCBzdGVwLCBhbgphY2NvdW50LCBvciBhIGNvcHkgb2YgQW5nYmFuZCdzIHNvdXJjZS4gQSBtb2QgaXMgYSBmb2xkZXIgd2l0aCBhIGNvdXBsZSBvZiBmaWxlcwppbiBpdC4KCi0tLQoKIyMgVGhlIGVpZ2h0IHR1dG9yaWFscwoKRWFjaCBvbmUgdGVhY2hlcyBleGFjdGx5IG9uZSBpZGVhIGFuZCBlbmRzIHdpdGggc29tZXRoaW5nIHlvdSBjYW4gc2VlIG9uIHNjcmVlbi4KCnwgfCBUdXRvcmlhbCB8IFdoYXQgeW91IGxlYXJuIHwgRmlsZXMgfAp8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLSB8CnwgMSB8IFtDaGFuZ2Ugb25lIHRoaW5nXSgwMS10d2Vhay1hLXZhbHVlLm1kKSB8IEVkaXRpbmcgYSB2YWx1ZSB0aGUgZ2FtZSBhbHJlYWR5IGhhcyB8IDIgfAp8IDIgfCBbQWRkIGFuIGl0ZW1dKDAyLWFkZC1hbi1pdGVtLm1kKSB8IEFkZGluZyBzb21ldGhpbmcgdGhlIGdhbWUgaGFzIG5ldmVyIHNlZW4gfCAzIHwKfCAzIHwgW0FkZCBhIG1vbnN0ZXJdKDAzLWFkZC1hLW1vbnN0ZXIubWQpIHwgVGhlIHNhbWUgbW92ZSBpbiBhbm90aGVyIGZpbGUsIHBsdXMgdGhlIG9uZSBmaWVsZCB0aGF0IHdpbGwgYml0ZSB5b3UgfCAyIHwKfCA0IHwgW0NoYW5nZSBhIHNwZWxsXSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkgfCBSZWFjaGluZyBpbnRvIGEgY2xhc3MsIGFuZCB3aGF0IGEgcG9zaXRpb25hbCBwYXRoIGNvc3RzIHwgMiB8CnwgNSB8IFtIb29rIGJlaGF2aW91cl0oMDUtaG9vay1iZWhhdmlvdXIubWQpIHwgWW91ciBtb2QgcnVubmluZyBjb2RlLCBpbiB0ZW4gbGluZXMgfCAyIHwKfCA2IHwgW0FkZCBhbiBvcHRpb25dKDA2LWFkZC1hbi1vcHRpb24ubWQpIHwgTGV0dGluZyB0aGUgcGxheWVyIHN3aXRjaCB5b3VyIGNoYW5nZSBvbiBhbmQgb2ZmIHwgMiB8CnwgNyB8IFtBZGQgYW4gYXJ0aWZhY3RdKDA3LWFkZC1hbi1hcnRpZmFjdC5tZCkgfCBCdWlsZGluZyBvbiB0b3Agb2YgYW4gaXRlbSB0aGUgZ2FtZSBhbHJlYWR5IGhhcyB8IDIgfAp8IDggfCBbQWRkIGEgc3RvcmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy90dXRvcmlhbHMvMDgtYWRkLWEtc3RvcmUubWQpIHwgVHVybmluZyBhIHRvd24gc3RvcmVmcm9udCBpbnRvIHlvdXIgb3duIHNob3AsIGFuZCBhZGRpbmcgb25lIHNob3AgcnVsZSB8IDQgfAoKRG8gdGhlbSBpbiBvcmRlciBpZiB5b3UgYXJlIG5ldy4gVGhleSBidWlsZCBvbiBlYWNoIG90aGVyLCBhbmQgZWFjaCBvbmUgaXMgc2hvcnQKZW5vdWdoIHRvIHJlYWQgaW4gZnVsbCBiZWZvcmUgeW91IHR5cGUgYW55dGhpbmcuIFR1dG9yaWFsIDcgaXMgdGhlIG9uZSBleGNlcHRpb246Cml0IG5lZWRzIHR1dG9yaWFsIDIgYW5kIG5vdGhpbmcgZWxzZSwgc28geW91IGNhbiBqdW1wIHRvIGl0IGlmIGFuIGFydGlmYWN0IGlzCndoYXQgYnJvdWdodCB5b3UgaGVyZS4gVHV0b3JpYWwgOCBuZWVkcyB0dXRvcmlhbHMgMiBhbmQgNSwgYW5kIGlzIHRoZSBvbmUgdG8KanVtcCB0byBpZiBhIHNob3AgaXMgd2hhdCBicm91Z2h0IHlvdSBoZXJlLgoKKipUaGVzZSBhcmUgbm90IHNuaXBwZXRzLioqIFR1dG9yaWFscyAxIHRocm91Z2ggNyBlYWNoIGhhdmUgYSBmaW5pc2hlZCBtb2QgaW4KdGhpcyByZXBvc2l0b3J5IHVuZGVyIGBzYW1wbGVzL3R1dG9yaWFscy9gLCBsb2FkZWQgYW5kIGNoZWNrZWQgYWdhaW5zdCB0aGUgYWN0dWFsCmdhbWUgZGF0YSBvbiBldmVyeSB0ZXN0IHJ1biwgaW5jbHVkaW5nIGEgY2hlY2sgdGhhdCBlYWNoIG9uZSB3b3VsZCBiZSBhY2NlcHRlZApieSB0aGUgc2FtZSBmb2xkZXIgcmVhZGVyIHRoZSBnYW1lIGl0c2VsZiB1c2VzLiBUdXRvcmlhbCA4J3MgZm91ciBjb21wbGV0ZSBmaWxlcwphcmUgb24gaXRzIHBhZ2UuIElmIGEgc2FtcGxlZCB0dXRvcmlhbCBldmVyIHN0b3BzIHdvcmtpbmcsIHRoZSBidWlsZCBmYWlscyBiZWZvcmUKeW91IGZpbmQgb3V0IHRoZSBoYXJkIHdheS4KCioqWW91IGNhbiBydW4gdGhlbSB3aXRob3V0IHR5cGluZyBhbnl0aGluZy4qKiBDb3B5IGFueSBvZiB0aGUgZmlyc3Qgc2V2ZW4gZm9sZGVycyBvdXQgb2YKYHNhbXBsZXMvdHV0b3JpYWxzL2AgaW50byB0aGUgYG1vZHMvYCBmb2xkZXIgYmVzaWRlIHRoZSBkZXNrdG9wIGJ1aWxkIChvciBwb2ludCBhCmJyb3dzZXIgYXQgYHNhbXBsZXMvdHV0b3JpYWxzL2Agd2l0aCAqKkNob29zZSBhIG1vZHMgZm9sZGVyLi4uKiopLCBhbmQgdGhleSB0dXJuCm9uIGZyb20gdGhlIE1vZHMgc2NyZWVuIGxpa2UgYW55IG90aGVyIG1vZC4gVGhleSBhcmUgbmFtZWQgYHR1dG9yaWFsLTAxLS4uLmAgdG8KYHR1dG9yaWFsLTA3LS4uLmAgc28gYWxsIHNldmVuIGNhbiBzaXQgdGhlcmUgYXQgb25jZS4gVHlwaW5nIHlvdXIgb3duIGlzIHN0aWxsIHRoZQpiZXR0ZXIgd2F5IHRvIGxlYXJuLCBidXQgaGF2aW5nIGEga25vd24tZ29vZCBjb3B5IHRvIGNvbXBhcmUgYWdhaW5zdCBpcyB3b3J0aCBhCmxvdCB3aGVuIHlvdXJzIGRvZXMgbm90IHdvcmsgYW5kIHlvdSBjYW5ub3Qgc2VlIHdoeS4KCi0tLQoKIyMgV2h5IG5vdCBqdXN0IGVkaXQgQW5nYmFuZD8KCllvdSBhYnNvbHV0ZWx5IGNhbi4gQW5nYmFuZCBoYXMgYmVlbiBjdXN0b21pc2FibGUgZnJvbSB0ZXh0IGZpbGVzIGZvciBkZWNhZGVzLAphbmQgaWYgZWRpdGluZyB0aGVtIGlzIHdvcmtpbmcgZm9yIHlvdSwgbm90aGluZyBoZXJlIGlzIHRyeWluZyB0byB0YWxrIHlvdSBvdXQgb2YKaXQuCgpOZW8gQW5nYmFuZCBpcyBmb3Igd2hlbiB5b3Ugd291bGQgcmF0aGVyIHlvdXIgY2hhbmdlIGJlIGEgKipwb3J0YWJsZSB0aGluZyoqIHRoYW4KYW4gZWRpdDoKCi0gVGhlIGJhc2UgZ2FtZSBzdGF5cyB1bnRvdWNoZWQuIFlvdXIgY2hhbmdlIGlzIGEgbGF5ZXIgb3ZlciBpdCwgbm90IGEKICBtb2RpZmljYXRpb24gb2YgaXQuCi0gSXQgaGFzIGFuIG9mZiBzd2l0Y2gsIGFuZCB0dXJuaW5nIGl0IG9mZiBnaXZlcyBiYWNrIHRoZSB1bm1vZGlmaWVkIGdhbWUKICBleGFjdGx5LgotIFlvdSBzaGFyZSBhIGZvbGRlciBvciBhIHJlcG9zaXRvcnkgbGluaywgbm90IGEgZm9yayBhbmQgbm90IGEgcGF0Y2ggZmlsZS4KLSBTZXZlcmFsIG1vZHMgY29tYmluZSwgZnJvbSBzZXZlcmFsIHBlb3BsZSwgd2l0aG91dCBhbnkgb2YgdGhlbSBoYXZpbmcgdG8KICBrbm93IGFib3V0IGVhY2ggb3RoZXIuCi0gWW91IGNhbiBleHBvc2Ugc2V0dGluZ3Mgc28gdGhlIHBlb3BsZSB1c2luZyBpdCBjYW4gdHVuZSBpdCB3aXRob3V0IGVkaXRpbmcKICBpdC4KLSBUaGUgZ2FtZSBjYW4gdXBkYXRlIHVuZGVybmVhdGggaXQgd2l0aG91dCB5b3UgcmUtYXBwbHlpbmcgYW55dGhpbmcuCi0gSXQgc2NhbGVzIGFsbCB0aGUgd2F5IHVwLiBUaGUgc2FtZSBzeXN0ZW0gdGhhdCBjaGFuZ2VzIG9uZSBudW1iZXIgY2FuIGNhcnJ5CiAgYW4gZW50aXJlIHZhcmlhbnQuCgpUaGF0IGxhc3QgcG9pbnQgaXMgdGhlIHJlYWwgb25lLiBUaGUgc3BlY3RydW0gcnVucyBmcm9tOgoKPiAqIkkgbWlzcyB0aGlzIG9uZSBmZWF0dXJlLiIqCgp0bzoKCj4gKiJJIHdhbnQgdG8gYnVpbGQgdGhlIG5leHQgWkFuZ2JhbmQuIioKCmFuZCBib3RoIGVuZHMgdXNlIHRoZSBzYW1lIG1lY2hhbmlzbS4gVHV0b3JpYWwgMSBpcyB0aGUgZmlyc3QgZW5kLiBOb3RoaW5nCnN0cnVjdHVyYWwgc3RhbmRzIGJldHdlZW4gaXQgYW5kIHRoZSBzZWNvbmQ6IGEgdG90YWwgY29udmVyc2lvbiBpcyB0aGlzIHNhbWUKc3lzdGVtIHVzZWQgYXQgZnVsbCB0aHJvdHRsZTogZGVwZW5kIG9uIHRoZSBiYXNlIGdhbWUsIHJlcGxhY2Ugd2hhdCB5b3UgZG8gbm90CndhbnQsIGFkZCB5b3VyIG93biB3b3JsZC4KCi0tLQoKIyMgVmFuaWxsYSBzdGF5cyB2YW5pbGxhCgpBIGZhaXIgd29ycnkgYWJvdXQgZWFzeSBtb2RkaW5nIGlzIHRoYXQgYSBjb21tdW5pdHkgZW5kcyB1cCB3aXRoIGEgdGhvdXNhbmQKcGVyc29uYWwgdmVyc2lvbnMgb2YgdGhlIGdhbWUgYW5kIG5vIHNoYXJlZCBncm91bmQuCgpUaGF0IGlzIG5vdCB3aGF0IHRoaXMgaXMgZm9yLCBhbmQgdGhlIGRlc2lnbiBzYXlzIHNvOgoKLSBUaGUgYmFzZSBnYW1lIHNoaXBzIGFzIHRoZSBzaGFyZWQgdmFuaWxsYSB0YXJnZXQsIHRoZSBsYXRlc3Qgb2ZmaWNpYWwKICBBbmdiYW5kIHJlbGVhc2UsIGZhaXRoZnVsbHksIHdpdGggbm8gbW9kcyBlbmFibGVkLiBUaGF0IGlzIHdoYXQgYW4gdW50b3VjaGVkCiAgaW5zdGFsbCBnaXZlcyB5b3UgYW5kIHdoYXQgdGhlIHByb2plY3QgbWVhc3VyZXMgaXRzZWxmIGFnYWluc3QuCi0gVGhpcyBwcm9qZWN0IGJ1bmRsZXMgbm8gbW9kcyBhdCBhbGwuIE5vdCBldmVuIHRoZSBhdXRob3Incy4gRXZlcnkgb25lIG9mCiAgdGhlbSBpbnN0YWxscyB0aGUgc2FtZSB3YXkgeW91cnMgd291bGQuCi0gRXZlcnkgbW9kIGlzIGEgbGF5ZXIgeW91IGNhbiBuYW1lLCBsaXN0LCBhbmQgcmVtb3ZlLiBBIGdhbWUncyBlbmFibGVkIG1vZHMKICBhbmQgdmVyc2lvbnMgYXJlIHJlY29yZGVkIGluIGl0cyBkaWFnbm9zdGljcyBhbmQgd3JpdHRlbiBpbnRvIHRoZSBjaGFyYWN0ZXIKICBkdW1wLCBzbyBhbnkgdHdvIHBlb3BsZSBjYW4gdGVsbCB3aGV0aGVyIHRoZXkgd2VyZSBwbGF5aW5nIHRoZSBzYW1lIHRoaW5nLgoKTW9kcyBhcmUgaG93IHlvdSBleHBlcmltZW50ICp3aXRob3V0KiBmcmFnbWVudGluZyB0aGUgYmFzZWxpbmUsIG5vdCBpbnN0ZWFkIG9mCmhhdmluZyBvbmUuCgotLS0KCiMjIElkZWFzIGZvciBhIGZpcnN0IG1vZAoKSWYgeW91IHdhbnQgYSBzdGFydGluZyBwb2ludCByYXRoZXIgdGhhbiBhIGJsYW5rIGZvbGRlcjoKCi0gQnJpbmcgYmFjayBhIGZlYXR1cmUgYW4gb2xkZXIgQW5nYmFuZCBoYWQgYW5kIGEgbmV3ZXIgb25lIGRyb3BwZWQKLSBBZGQgYSBtb25zdGVyLCBvciBhIGZhbWlseSBvZiB0aGVtCi0gQWRkIGFuIGFydGlmYWN0IHdvcnRoIGRlc2NlbmRpbmcgZm9yLCB3aGljaCBpcyBbdHV0b3JpYWwgN10oMDctYWRkLWFuLWFydGlmYWN0Lm1kKQotIFdyaXRlIGEgbmV3IHNwZWxsLCBvciBtb3ZlIG9uZSB0byBhIGNsYXNzIHRoYXQgbmV2ZXIgZ290IGl0Ci0gQ2hhbmdlIHdoYXQgdGhlIHN0b3JlcyBzdG9jaywgb3IgaG93IHRoZXkgcHJpY2UgaXQKLSBBZGQgYSBxdWFsaXR5LW9mLWxpZmUgYmVoYXZpb3VyIHRoYXQgaGFzIGJlZW4gYW5ub3lpbmcgeW91IGZvciB5ZWFycwotIFJlcGxhY2UgdGhlIGdyYXBoaWNzCi0gQXV0b21hdGUgc29tZXRoaW5nIHRlZGlvdXMKLSBCdWlsZCBhIHRoZW1lZCBjb250ZW50IHBhY2ssIGEgd2hvbGUgZHVuZ2VvbidzIHdvcnRoIG9mIG9uZSBpZGVhCi0gVHJ5IGEgbWVjaGFuaWMgbm9ib2R5IGhhcyB0cmllZCwgYW5kIGZpbmQgb3V0IHdoeSBub2JvZHkgaGFzCi0gUmViYWxhbmNlIGEgY2xhc3MgeW91IHRoaW5rIGhhcyBhbHdheXMgYmVlbiB3cm9uZwotIEV2ZW50dWFsbHk6IHlvdXIgb3duIHZhcmlhbnQKClRoZSBbZmVhdHVyZSByZXN0b3JhdGlvbl0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9tb2RkaW5nL0ZFQVRVUkVfUkVTVE9SQVRJT04ubWQpIGlkZWEgaW4gcGFydGljdWxhciBjYW1lCnN0cmFpZ2h0IG91dCBvZiBhIHBsYXllciBjb252ZXJzYXRpb24sIGFuZCBpdCB0dXJuZWQgaW50byBhIHNoaXBwZWQgbW9kLgoKLS0tCgojIyBBZnRlciB0aGUgdHV0b3JpYWxzCgpSb3VnaGx5IGluIG9yZGVyIG9mIGhvdyBtdWNoIHlvdSBuZWVkIHRvIGtub3c6CgoxLiAqKltSRVFVSVJFTUVOVFMubWRdKC4uL1JFUVVJUkVNRU5UUy5tZCkqKjogZXhhY3RseSB3aGF0IGEgbW9kIG11c3QgcHJvdmlkZSB0bwogICBiZSBpbnN0YWxsYWJsZS4gR2VuZXJhdGVkIGZyb20gdGhlIHJ1bGVzIHRoZSBnYW1lIGFjdHVhbGx5IGVuZm9yY2VzLCBzbyBpdAogICBjYW5ub3QgZ28gc3RhbGUuIFJ1biB0aGVtIGFnYWluc3QgeW91ciBvd24gZm9sZGVyIHdpdGgKICAgYG5weCBuZW8tYW5nYmFuZC1tb2QtY2hlY2sgcGF0aC90by95b3VyLW1vZGAuCjIuICoqW0FVVEhPUklORy5tZF0oLi4vQVVUSE9SSU5HLm1kKSoqOiB0aGUgc2hvcnRjdXRzLiBgZHJhZnRSZWNvcmRgIGZpbGxzIGluIGEKICAgbmV3IHJlY29yZCBmcm9tIHRoZSBnYW1lJ3Mgb3duIGNvbXBhcmFibGUgb25lcywgYGNoZWNrUmVjb3Jkc2AgbmFtZXMgZXZlcnkgd2F5CiAgIHlvdXIgZGF0YSB3aWxsIHNpbGVudGx5IG5vdCB3b3JrLCBhbmQgYE1vZFByb2plY3RgIGNvbXBvc2VzIGEgd2hvbGUgbW9kIHRocm91Z2gKICAgdGhlIHJlYWwgcGlwZWxpbmUgYmVmb3JlIHlvdSBsb2FkIGl0LiBSZWFkIHRoaXMgYmVmb3JlIHdyaXRpbmcgbXVjaCBieSBoYW5kLgozLiAqKltUaGUgbW9kZGluZyBodWJdKC4uL1JFQURNRS5tZCkqKjogcGFjayBhbmF0b215LCByZWNvcmQgY29tcG9zaXRpb24sCiAgIG5hbWVzcGFjZWQgZmllbGRzIG9mIHlvdXIgb3duLCBhbmQgdGhlIGhvbmVzdCB0YWJsZSBvZiB3aGF0IGlzIGJ1aWx0IHRvZGF5CiAgIHZlcnN1cyB3aGF0IGlzIHN0aWxsIGEgZGVzaWduLgo0LiAqKltNT0RfU0VBTVMubWRdKC4uL01PRF9TRUFNUy5tZCkqKjogdGhlIGJlaGF2aW91ciBob29rcyBpbiBmdWxsLCBhbmQgaG93CiAgIHNldmVyYWwgbW9kcycgYW5zd2VycyBhcmUgY29tYmluZWQuCjUuICoqW1BMVUdJTlMubWRdKC4uL1BMVUdJTlMubWQpKiosIHRoZSBwbHVnaW4gY29udHJhY3QgaW4gZGVwdGg6IHRoZSBjYXBhYmlsaXR5CiAgIHJlZ2lzdHJpZXMsIHdoYXQgYSBwbHVnaW4gY2FuIHJlYWNoLCBhbmQgY29uc2VudC4KNi4gKipbTU9EX0NPTVBBVElCSUxJVFkubWRdKC4uL01PRF9DT01QQVRJQklMSVRZLm1kKSoqOiB3aGF0IGFuIGVuZ2luZSByZWxlYXNlCiAgIG1heSBhbmQgbWF5IG5vdCBicmVhaywgYW5kIHdoYXQgdG8gd3JpdGUgaW4gYGVuZ2luZWAuIFJlYWQgdGhpcyBiZWZvcmUKICAgcHVibGlzaGluZy4KNy4gKipbTU9EX1JFQUNILm1kXSguLi9NT0RfUkVBQ0gubWQpKio6IHRoZSBtZWFzdXJlZCBhbnN3ZXIgdG8gImNhbiBhIG1vZAogICBhY3R1YWxseSBkbyBYIi4gTG9uZywgYW5kIHRoZSBwbGFjZSB0byBjaGVjayBhIGNhcGFiaWxpdHkgY2xhaW0gYmVmb3JlIHlvdQogICBidWlsZCBvbiBpdC4KCioqUmVmZXJlbmNlIGRvY3VtZW50cyBlbnVtZXJhdGU7IHR1dG9yaWFscyB0ZWFjaC4qKiBJZiB5b3UgYXJlIHN0dWNrIG9uICJob3cgZG8gSQpzdGFydCIsIHlvdSB3YW50IGEgdHV0b3JpYWwuIElmIHlvdSBhcmUgc3R1Y2sgb24gIndoYXQgaXMgdGhpcyBmaWVsZCBjYWxsZWQiLCB5b3UKd2FudCB0aGUgcmVmZXJlbmNlLgoKLS0tCgojIyBSZWFkIGEgcmVhbCBtb2QKClRoZSBmaXJzdC1wYXJ0eSBtb2RzIGFyZSBkZWxpYmVyYXRlbHkgcmVhZGFibGUsIGFuZCB0aGV5IGdldCBwcm9ncmVzc2l2ZWx5IG1vcmUKaW52b2x2ZWQ6Cgp8IE1vZCB8IFJlYWQgaXQgZm9yIHwKfCAtLS0gfCAtLS0gfAp8IFt1cHN0cmVhbS1jYXRjaHVwXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtdXBzdHJlYW0tY2F0Y2h1cCkgfCBBYm91dCB0aGUgc21hbGxlc3QgdXNlZnVsIG1vZCB0aGVyZSBpczogb25lIGZsYWcsIG9uZSByZWdpc3RyeSBmaWxsZXIsIGFuZCBhIFJFQURNRSB0aGF0IGNpdGVzIGV2ZXJ5IGxpbmUgb2YgaXQgfAp8IFtmZWF0dXJlLXJlc3RvcmF0aW9uXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtZmVhdHVyZS1yZXN0b3JhdGlvbikgfCBBIHNtYWxsIG1vZCB0aGF0IGlzIGJvdGggZGF0YSBhbmQgY29kZSwgd2l0aCBldmVyeSBmZWF0dXJlIGJlaGluZCBpdHMgb3duIHN3aXRjaCB8CnwgW3FvbF0oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLXFvbCkgfCBCZWhhdmlvdXIgaG9va3MgaW4gYSBzaGlwcGVkIG1vZCB8CnwgW2J1Zy1maXhlc10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJ1Zy1maXhlcykgfCBNYW55IHNtYWxsLCBpbmRlcGVuZGVudCwgaW5kaXZpZHVhbGx5LXN3aXRjaGFibGUgY2hhbmdlcyB8CnwgW2xpbm9sZXVtXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtbGlub2xldW0pIHwgQSB3aG9sZSBhbHRlcm5hdGl2ZSB0aWxlIGVuZ2luZSwgYW5kIGEgbW9kIHRoYXQgc2hpcHMgYXJ0IHwKfCBbYm9yZ10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJvcmcpIHwgQSBtb2QgdGhhdCBwbGF5cyB0aGUgZ2FtZSB8CgpOb25lIG9mIHRoZW0gaXMgYnVuZGxlZCB3aXRoIHRoZSBnYW1lIGFuZCBub25lIHRha2VzIGEgcHJpdmF0ZSBwYXRoIGluLiBUaGV5Cmluc3RhbGwgdGhlIHdheSB5b3VycyBkb2VzLCB3aGljaCBpcyB0aGUgb25seSB3YXkgdG8ga25vdyB0aGF0IHJvdXRlIHdvcmtzLgoKLS0tCgojIyBTdHVjaz8KCioqW1RoZSBSUEdNIFRvb2xzIERpc2NvcmRdKGh0dHBzOi8vZGlzY29yZC5nZy9ZZWd0d2JIVEJRKSoqOiBubyBHaXRIdWIgYWNjb3VudApuZWVkZWQsIGFuZCAiY2FuIGEgbW9kIGRvIFg/IiBpcyBleGFjdGx5IHRoZSBxdWVzdGlvbiB3b3J0aCBhc2tpbmcgYmVmb3JlIHlvdQpidWlsZCBhcm91bmQgYSBndWVzcy4K"
  },
  {
    "id": "overview",
    "path": "README.md",
    "audience": "beginner",
    "title": "Modding overview",
    "note": "The SDK front door and pack anatomy.",
    "encoded": "IyBNb2RkaW5nIE5lbyBBbmdiYW5kCgo+ICMjIE5ldyB0byB0aGlzPyBEb24ndCBzdGFydCBoZXJlLgo+Cj4gKipbTWFrZSBhIG1vZF0odHV0b3JpYWxzL1JFQURNRS5tZCkqKiBpcyB0aGUgZnJvbnQgZG9vcjogc2V2ZW4gc2hvcnQgdHV0b3JpYWxzLAo+IHRoZSBmaXJzdCBvZiB3aGljaCBpcyB0d28gZmlsZXMgYW5kIHRha2VzIGFib3V0IGZpdmUgbWludXRlcy4gVGhpcyBwYWdlIGlzIHRoZQo+IHJlZmVyZW5jZTogaXQgZW51bWVyYXRlcywgaXQgZG9lcyBub3QgdGVhY2guCgpNb2RkYWJpbGl0eSBpcyBhIHJhdGlmaWVkIHBpbGxhciBvZiB0aGlzIHByb2plY3QgKFBPUlRfUExBTi5tZCBkZWNpc2lvbnMKMTMtMjEpOiBldmVyeSBhc3BlY3Qgb2YgdGhlIGdhbWUgaXMgb3BlbiB0byBtb2RzLCBpbmNsdWRpbmcgY2FwYWJpbGl0aWVzCnRoYXQgZG8gbm90IGV4aXN0IGluIHRoZSBiYXNlIHJlc291cmNlcy4gVGhlIGJhc2UgZ2FtZSBpcyBpdHNlbGYgYSBwYWNrCigiY29yZSIsIHBhY2sgemVybykgbG9hZGVkIHRocm91Z2ggdGhlIHNhbWUgcGlwZWxpbmUgeW91ciBtb2QgdXNlcyAtIGlmCmNvcmUgY2FuIGRvIGl0LCB5b3VyIG1vZCBjYW4gZG8gaXQsIHJlZGVmaW5lIGl0LCBvciBkZWxldGUgaXQuIENvcmUgaXMKcGFyaXR5IHBsdXMgdGhlIG1vZCBhcmNoaXRlY3R1cmUgb25seTsgZXZlcnl0aGluZyBlbHNlIC0gdGhlIGZpdmUgZmlyc3QtcGFydHkKbW9kcyBpbmNsdWRlZCAtIGlzIGEgbW9kIChkZWNpc2lvbnMgMTctMTgpLiBDaGVhdHkgbW9kcyBhcmUgYWxsb3dlZDogdGhlIGVuZ2luZQp3YXJucyBhbmQgbGFiZWxzLCBpdCBkb2VzIG5vdCBmb3JiaWQuCgpUaGlzIGRpcmVjdG9yeSBpcyB0aGUgbW9kZGluZyBTREsgZG9jdW1lbnRhdGlvbiBzZXQuIEl0IGdyb3dzIHdpdGggdGhlCmVuZ2luZTsgZWFjaCBwYWdlIGRvY3VtZW50cyBzdXJmYWNlcyB0aGF0IGV4aXN0IGFuZCBhcmUgdGVzdGVkLiBGb3IgdGhlCm92ZXJhbGwgZGVzaWduIGFuZCB0aGUgbW9kZGFibGUtc3VyZmFjZSBtYXRyaXgsIHJlYWQgYGRvY3MvTU9EUy5tZGAuCgpNb2QtYXV0aG9yZWQgSlNPTiBkb2N1bWVudHMgdXNlIHRoZSBzYW1lIGVudmVsb3BlIGFzIGRlc2t0b3Agd2luZG93IHN0YXRlLiBTZWUgW0pTT04gZG9jdW1lbnQgc3R5bGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvSlNPTl9TVFlMRS5tZCkgZm9yIHZhbGlkYXRvcnMsIHNlcmlhbGl6YXRpb24sIGFuZCBtaWdyYXRpb25zLgoKKipKdXN0IHdhbnQgdG8gaW5zdGFsbCBvbmU/KiogVGhhdCBpcwpbdGhyZWUga2V5cHJlc3Nlc10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQvYmxvYi9tYXN0ZXIvZG9jcy9NT0RTLm1kI2dldHRpbmctYS1tb2QtaW4tb25lLXBhcmFncmFwaCksIG5vdCB0aGlzIHBhZ2UuCgoqKldyaXRpbmcgb25lLCBhbmQgd2FudCB0byB0YWxrIHRvIHNvbWVvbmU/KioKW1RoZSBSUEdNIFRvb2xzIERpc2NvcmRdKGh0dHBzOi8vZGlzY29yZC5nZy9ZZWd0d2JIVEJRKSBpcyB0aGUgcGxhY2UgLSB0aGUKc2VhbXMgYXJlIG5ldywgYW5kICJjYW4gYSBtb2QgZG8gWCIgaXMgZXhhY3RseSB0aGUgcXVlc3Rpb24gd29ydGggYXNraW5nCmJlZm9yZSB5b3UgYnVpbGQgYXJvdW5kIGFuIGFuc3dlciB5b3UgZ3Vlc3NlZC4KCiMjIFN1cmZhY2Ugc3RhdHVzOiBjb21wbGV0ZSwgV0lQLCBub3QgeWV0CgpUaGlzIGRpcmVjdG9yeSBob2xkcyBib3RoICoqYnVpbHQtdG9kYXkqKiBwYWdlcyBhbmQgKipkZXNpZ24tb2YtcmVjb3JkKiogcGFnZXMsCmFuZCBhbiBhdXRob3Igd2hvIGNhbm5vdCB0ZWxsIHdoaWNoIGlzIHdoaWNoIGJ1aWxkcyBhZ2FpbnN0IHRoZSB3cm9uZyBvbmUuIEV2ZXJ5CnN1cmZhY2UgYmVsb3cgY2FycmllcyBvbmUgb2YgdGhyZWUgd29yZHMsIGFuZCB0aGV5IGFyZSBtZWFudCBsaXRlcmFsbHk6CgotICoqQ29tcGxldGUqKjogYnVpbHQsIHRlc3RlZCwgYW5kIGRyaXZlbiBlbmQgdG8gZW5kIGF0IGxlYXN0IG9uY2UgYWxvbmcgdGhlCiAgcGF0aCBhIHBsYXllcidzIGluc3RhbGwgYWN0dWFsbHkgdXNlcy4gV3JpdGUgYWdhaW5zdCBpdCB0b2RheS4KLSAqKldJUCoqOiBwYXJ0bHkgYnVpbHQuIFdoYXQgZXhpc3RzIGlzIHJlYWwgYW5kIGlzIG5vdCBnb2luZyB0byBiZSB0YWtlbiBhd2F5LAogIGJ1dCB0aGUgc3VyZmFjZSBkb2VzIG5vdCB5ZXQgY292ZXIgZXZlcnl0aGluZyBpdHMgbmFtZSBzdWdnZXN0cy4gUmVhZCB0aGUKICBsaW5rZWQgcm93IGJlZm9yZSBhc3N1bWluZyB0aGUgcGFydCB5b3UgbmVlZCBpcyBpbi4KLSAqKk5vdCB5ZXQqKjogdGhlcmUgaXMgbm8gc2VhbS4gV2hhdGV2ZXIgdGhlIGRlc2lnbiBwYWdlcyBzYXkgYWJvdXQgaXQgaXMgYQogIHByb3Bvc2FsLiBEbyBub3QgYnVpbGQgYXJvdW5kIGl0LCBhbmQgZG8gbm90IGJ1aWxkIGEgKndvcmthcm91bmQqIGVpdGhlcjogYQogIHdvcmthcm91bmQgcmVhY2hlcyB0aHJvdWdoIHNvbWV0aGluZyB0aGF0IHdhcyBuZXZlciBhIHNlYW0sIGFuZCBpdCBpcyBleGFjdGx5CiAgd2hhdCB0aGUgcmVhbCBzZWFtIGJyZWFrcyB3aGVuIGl0IGxhbmRzLiBBc2sgb24gdGhlIERpc2NvcmQgaW5zdGVhZC4KCmBNT0RfUkVBQ0gubWRgIGlzIHdoZXJlIGVhY2ggb2YgdGhlc2UgaXMgbWVhc3VyZWQsIG9uZSByb3cgcGVyIGNhcGFiaWxpdHk7IHRoZQp0YWJsZSBiZWxvdyBpcyBhbiBpbmRleCBpbnRvIGl0LiBgbW9kZGluZy1zdGF0dXMudGVzdC50c2AgcmVhZHMgYm90aCBmaWxlcyBhbmQKZmFpbHMgaWYgYSBzdGF0dXMgaGVyZSBzdG9wcyBtYXRjaGluZyB0aGUgbWVhc3VyZW1lbnQgdGhlcmUsIHNvIHRoZSB0d28gY2Fubm90CmRyaWZ0IHNpbGVudGx5LCB3aGljaCBpcyB0aGUgb25seSByZWFzb24gYSBzdW1tYXJ5IHRhYmxlIGxpa2UgdGhpcyBpcyBzYWZlIHRvCndyaXRlIGRvd24gYXQgYWxsLgoKfCBXaGF0IHlvdSB3YW50IHRvIGRvIHwgU3RhdHVzIHwgTWVhc3VyZWQgaW4gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgQ2hhbmdlIGFueSB2YWx1ZSBpbiBhbnkgZ2FtZWRhdGEgZmlsZSwgYWRkIGEga2V5LCByZW1vdmUgYSBrZXksIG9uIGFueSByZWNvcmQsIGluY2x1ZGluZyB0aGUgb25lcyB3aXRoIHJlcGVhdGVkIG5hbWVzIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDIgfAp8IEFkZCByZWNvcmRzIGNvcmUgaGFzIG5ldmVyIHNlZW46IG9iamVjdHMsIG1vbnN0ZXJzLCBlZ29zLCBhcnRpZmFjdHMsIGFuZCB3aG9sZSBuZXcgaXRlbSAqKmNsYXNzZXMqKiAodHZhbHMpIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDIwIHwKfCBFeHRlbmQgYSByZWNvcmQgd2l0aCBmaWVsZHMgb2YgeW91ciBvd24sIGluIHlvdXIgb3duIG5hbWVzcGFjZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxNiB8CnwgU2hpcCByZWFsICoqY29kZSoqIHRoYXQgcnVucyBpbiB0aGUgZ2FtZSwgaW5zdGFsbGVkIGZyb20gZGlzayB3aXRoIG5vIGJ1aWxkIHN0ZXAgaGVyZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxIHwKfCBDaGFuZ2UgYmVoYXZpb3VyOiB0aGUgYE1vZEhvb2tzYCBwb2ludHMsIHBsdXMgdGhlIGtleWVkIHJlZ2lzdHJpZXMgbGlzdGVkIGluIGBNT0RfUkVBQ0gubWRgLCBpdGVtIChjKSB8ICoqQ29tcGxldGUqKiB8IGdhcCAzIHwKfCBNb25zdGVyIGNvbWJhdDogYmxvdyBlZmZlY3RzLCByZWNvcmRpbmcgYW5kIGxpdmUgcGF0aHMsIG9uZSByZWdpc3RyYXRpb24gZm9yIGJvdGggfCAqKkNvbXBsZXRlKiogfCBnYXAgNCB8CnwgU3RvcmUgYmVoYXZpb3VyOiB0aGUgYnV5IHJ1bGUgYW5kIHN0YWNrIHNpemVzIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDUgfAp8IExldmVsIGdlbmVyYXRpb246IHlvdXIgb3duIHdob2xlLWNhdmUgYnVpbGRlciBhbmQgdGhlIHByb2ZpbGUgdGhhdCBzZWxlY3RzIGl0IHwgKipDb21wbGV0ZSoqIHwgZ2FwIDYgfAp8IFZhdWx0cyBhbmQgcm9vbSB0ZW1wbGF0ZXMgZHJhd24gd2l0aCBzeW1ib2xzIGNvcmUgaGFzIG5ldmVyIGRlY29kZWQgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTcgfAp8IFJhbmRvbSBhcnRpZmFjdHM6IHJlYWNoIHRoZSAqKmdlbmVyYXRvcioqLCBub3QganVzdCBzaGlwIGEgZml4ZWQgYXJ0aWZhY3QgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTkgfAp8IEFuIGVmZmVjdCBvZiB5b3VyIG93biB0aGF0IHRoZSBnYW1lIGNhbiAqKmRlc2NyaWJlKiogdG8gdGhlIHBsYXllciB8ICoqQ29tcGxldGUqKiB8IGdhcCAxOCB8CnwgVGlsZSBwYWNrczogcmVnaXN0ZXIgYSBHcmFwaGljcyByb3csIHNoaXAgeW91ciBvd24gYXJ0LCBlaXRoZXIgdGlsZSBlbmdpbmUgfCAqKkNvbXBsZXRlKiogfCBnYXAgOCB8CnwgU291bmRzLCBmb250cywgc3BsYXNoIGFydCwgaGVscCB0ZXh0LCBhbmQgYC5wcmZgIGVmZmVjdHMsIGluY2x1ZGluZyBjbGFzc2ljIFRJTEUgYXNzaWdubWVudHMgbGF5ZXJlZCBvdmVyIGEgZ3JhcGhpY3MgcGFjayB8ICoqQ29tcGxldGUqKiB8IGdhcCA3IHwKfCBMb2NhbGl6YXRpb24sIG5vdCBhIHN0cmluZyB0YWJsZTsgdGhlIHN0cnVjdHVyYWwgc2VhbSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxNCB8CnwgSGF2ZSB5b3VyIHJlY29yZHMgc2NoZW1hLWNoZWNrZWQgYmVmb3JlIHRoZXkgcmVhY2ggdGhlIGdhbWUgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTIgfAp8IFN1cnZpdmUgYSBicm9rZW4gbW9kIGF0IGJvb3QsIHdpdGggdGhlIGZhdWx0IG5hbWVkIGFuZCBhdHRyaWJ1dGVkIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDEzIHwKfCBLbm93IHdoaWNoIG1vZCBhZGRlZCBvciBjaGFuZ2VkIGEgcmVjb3JkLCBpbiB0aGUgcnVubmluZyBnYW1lIGFuZCBpbiB0aGUgc2F2ZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxMCB8CnwgTG9hZCBvcmRlciB0aGF0IG1lYW5zIHdoYXQgdGhlIG1hbmFnZXIgc2F5cyBpdCBtZWFucyB8ICoqQ29tcGxldGUqKiB8IGdhcCAxMSB8CnwgKipSZXBsYWNlIHRoZSBmcm9udCBlbmQqKjogZHJhdyB0aGUgd29ybGQgeW91cnNlbGYsIGFueSB3YXkgeW91IGxpa2UgfCAqKkNvbXBsZXRlKiogfCBnYXAgOSB8CnwgS25vdyAqKndoZXJlIHlvdSBtYXkgZHJhdyoqOiBuYW1lZCByZWdpb25zLCBpbiBncmlkIGNlbGxzIGFuZCBDU1MgcGl4ZWxzLCBvbiBldmVyeSBmcmFtZSB8ICoqQ29tcGxldGUqKiB8IGdhcCA5IHwKfCBEcml2ZSB0aGUgZ2FtZSBwcm9ncmFtbWF0aWNhbGx5OiBhbiBhdXRvcGxheWVyLCBhIGJvdCwgYSB0ZXN0IGhhcm5lc3MgfCAqKkNvbXBsZXRlKiogfCBgQk9SRy5tZGAsIGBNb2RQbHVnaW4uY29udHJvbGxlcmAgfAp8IE1lbnVzOiBhZGQsIHJlb3JkZXIsIHJldGl0bGUgYW5kIHJlLXRhZyAqKnJvd3MqKiAocmVnaXN0cnk6bWVudSksIHRoZW4gcmVwbGFjZSB0aGUgcHJlc2VudGF0aW9uIG9mIGEgc3VwcG9ydGVkIHF1ZXN0aW9uIHwgKipXSVAqKiB8IGdhcCAyMSwgUFJFU0VOVEFUSU9OX09XTkVSX1NFQU0ubWQgfAp8ICoqUmVwbGFjZSB0aGUgVUkqKjogdGhlIEhVRCwgc3RhdHVzIGxpbmUsIG1lc3NhZ2UgYXJlYSwgbWVudSBwcmVzZW50YXRpb24sIGFuZCBmdWxsIHNjcmVlbnMgfCAqKldJUCoqIHwgZ2FwIDIxLCBQUkVTRU5UQVRJT05fT1dORVJfU0VBTS5tZCB8CnwgT3duIGEgSFVEIHJlZ2lvbiAobWVzc2FnZXMsIHZpdGFscywgc3RhdHVzKSB3aXRoIGNvcmUgZHJhd2luZyB0aGUgb25lcyB5b3UgZG8gbm90IGNsYWltLCBvciAqKmNyZWF0ZSBhIHJlZ2lvbiBvZiB5b3VyIG93bioqOiBvcmRlcmVkLCBvdmVybGFwcGluZywgdHJhbnNwYXJlbnQsIGNvbXBvc2l0ZWQsIGFuZCBvd25pbmcgcG9pbnRlciBpbnB1dCBvbiB0aGUgY2VsbHMgaXQgcGFpbnRzIHwgKipXSVAqKiB8IGdhcCAyMSwgUFJFU0VOVEFUSU9OX09XTkVSX1NFQU0ubWQgfAp8IFJldGl0bGUsIHJlZ3JvdXAsIHJlb3JkZXIsIHJlLXRhZyBvciByZWJpbmQgYW4gZXhpc3Rpbmcgd2ViIGtleXByZXNzIGNvbW1hbmQgKGByZWdpc3RyeTptZW51YCk7IHRoZSBjb21tYW5kJ3MgY2xvc3VyZSBzdGF5cyBzaGVsbC1wcml2YXRlIHwgKipDb21wbGV0ZSoqIHwgYE1PRF9SRUFDSC5tZGAgcm93IDIzIHwKfCBSZW5hbWUgb25lIG9mIHlvdXIgb3duIHJ1bGUgZmxhZ3Mgb3Igc2VjdGlvbnMgd2l0aG91dCBsb3NpbmcgdGhlIHBsYXllcidzIHNhdmVkIGNob2ljZSAoYHJlbmFtZWRSdWxlRmxhZ3NgLCBgcmVuYW1lZFNlY3Rpb25GbGFnc2ApIHwgKipDb21wbGV0ZSoqIHwgYEFVVEhPUklORy5tZGAgfAp8IFJlYmluZCBrZXlzLCBvciBhZGQgYSBnYW1lcGFkOiBgaW5wdXQtZG9vci50c2AgaXMgaG9zdCBpbmZyYXN0cnVjdHVyZSwgbm90IGEgc2VhbSB8ICoqTm90IHlldCoqIHwgYE1PRF9TRUFNUy5tZGAgfAp8IENoYW5nZSB0aGUgbWVzc2FnZSB0YWJsZSwgdGhlIGBNU0dfYC0+c291bmQgbWFwLCBvciB0aGUgcHJlZi1maWxlIGhhbmRsZXJzIHwgKipDb21wbGV0ZSoqIHwgYE1PRF9SRUFDSC5tZGAgcm93cyAyMCwgMjEsIDggfAp8IENoYW5nZSB0aGUgbW9uc3RlciBzcGVsbCB0YWJsZSBvciB0aGUgY29tbWFuZCB0YWJsZSB8ICoqTm90IHlldCoqIHwgYE1PRF9SRUFDSC5tZGAgcm93cyAyMiwgMTkgfAp8IEluc3RhbGwsIHVwZGF0ZSBhbmQgdW5pbnN0YWxsIFVYOiByYXRpZmllZCBpbiBmdWxsLCBidWlsdCBpbiBwYXJ0IHwgKipXSVAqKiB8IGBNT0RfTElGRUNZQ0xFLm1kYCB8CgpUd28gdGhpbmdzIHRoaXMgdGFibGUgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IGRvLiBJdCBkb2VzIG5vdCByYW5rIHN1cmZhY2VzIGJ5IGhvdwptdWNoIHdvcmsgdGhleSB3ZXJlLCBhbmQgaXQgZG9lcyBub3QgcHJvbWlzZSBkYXRlcy4gQSAqKk5vdCB5ZXQqKiByb3cgaXMgbm90IGEKcXVldWUgcG9zaXRpb247IHNvbWUgb2YgdGhlbSBhcmUgb25lIHRhc2sgYXdheSBhbmQgc29tZSBhcmUgYSBkZXNpZ24gYXJndW1lbnQKdGhhdCBoYXMgbm90IGJlZW4gc2V0dGxlZC4KCiMjIENvbnRlbnRzCgotIGB0dXRvcmlhbHMvYDogKip0aGUgYmVnaW5uZXIgcGF0aCoqLCBzZXZlbiB0aW55IG1vZHMgd2l0aCBvbmUgaWRlYSBlYWNoLCBlYWNoIGVuZGluZyBpbiBzb21ldGhpbmcgdmlzaWJsZSBvbiBzY3JlZW4uIFRoZSBmaW5pc2hlZCBtb2QgZm9yIGV2ZXJ5IHR1dG9yaWFsIGlzIGEgcmVhbCBmb2xkZXIgdW5kZXIgYHNhbXBsZXMvdHV0b3JpYWxzL2AgdGhhdCBpcyBjb21wb3NlZCBhZ2FpbnN0IHRoZSByZWFsIGdhbWUgZGF0YSBvbiBldmVyeSB0ZXN0IHJ1biwgc28gYSB0dXRvcmlhbCBjYW5ub3QgcXVpZXRseSBzdG9wIHdvcmtpbmcuIFN0YXJ0IHRoZXJlIGlmIHlvdSBoYXZlIG5vdCB3cml0dGVuIGEgbW9kIGZvciB0aGlzIGdhbWUgYmVmb3JlLgotIGBGRUFUVVJFX1JFU1RPUkFUSU9OLm1kYDogYnJpbmdpbmcgYmFjayBtZWNoYW5pY3MgdGhhdCBsYXRlciB2ZXJzaW9ucyBvZiBBbmdiYW5kIGRyb3BwZWQsIHdpdGhvdXQgY2hhbmdpbmcgdmFuaWxsYS4gSXQgY292ZXJzIHRoZSByZXNlYXJjaCBydWxlcyBhIHJlc3RvcmF0aW9uIGhhcyB0byBmb2xsb3cgYW5kIHdoeSByZXN0b3JhdGlvbiBpcyB0aGUgYmVzdCBhdmFpbGFibGUgdGVzdCBvZiB3aGV0aGVyIHRoZSBtb2Qgc3lzdGVtIGlzIHJlYWwuCi0gVGhpcyBwYWdlOiBwYWNrIGFuYXRvbXksIG1hbmlmZXN0cywgYW5kIHJlY29yZCBjb21wb3NpdGlvbiAobGl2ZSB0b2RheSwgYmFja2VkIGJ5IGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCkuCi0gYFJFUVVJUkVNRU5UUy5tZGA6ICoqZXhhY3RseSB3aGF0IGEgbW9kIG11c3QgcHJvdmlkZSoqLiBJdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgcnVsZXMgdGhlIGdhbWUgZW5mb3JjZXMgKGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHNgKSwgYW5kIGEgdGVzdCBmYWlscyBpZiB0aGUgdHdvIGV2ZXIgZGlzYWdyZWUsIHNvIGl0IGNhbm5vdCBnbyBzdGFsZS4gUnVuIHRoZSBzYW1lIHJ1bGVzIGFnYWluc3QgeW91ciBvd24gZm9sZGVyIGJlZm9yZSBwdWJsaXNoaW5nOiBgbnB4IG5lby1hbmdiYW5kLW1vZC1jaGVjayBwYXRoL3RvL3lvdXItbW9kYC4gU3RhcnQgaGVyZS4KLSBgQVVUSE9SSU5HLm1kYDogdGhlIHNob3J0Y3V0cy4gYGRyYWZ0UmVjb3JkYCBmaWxscyBhIG5ldyByZWNvcmQgZnJvbSBjb3JlJ3Mgb3duIGNvbXBhcmFibGUgcmVjb3JkcyAoaW5jbHVkaW5nIGl0cyBwcmljZSksIGBjaGVja1JlY29yZHNgIG5hbWVzIGV2ZXJ5IHdheSBhIHJlY29yZCB3aWxsIHNpbGVudGx5IG5vdCB3b3JrLCBhbmQgYE1vZFByb2plY3RgIGFzc2VtYmxlcyBhIHdob2xlIG1vZCBhbmQgY29tcG9zZXMgaXQgdGhyb3VnaCB0aGUgcmVhbCBwaXBlbGluZSBiZWZvcmUgcmVwb3J0aW5nIGFueXRoaW5nLiBSZWFkIHRoaXMgYmVmb3JlIHdyaXRpbmcgYSByZWNvcmQgYnkgaGFuZC4KLSBgTU9EX0xJRkVDWUNMRS5tZGA6IGhvdyBzYXZlcyBzdGF5IHNhZmUgYWNyb3NzIGluc3RhbGwsIHVwZGF0ZSBhbmQgdW5pbnN0YWxsLCBpbnN0YWxsaW5nIGZyb20gZ2l0IChhbmQgYSBmdXR1cmUgbWFya2V0cGxhY2UpLCBtdWx0aS1tb2QgY29tcG9zaXRpb24gYW5kIGNvbmZsaWN0IHJlc29sdXRpb24sIHVuaW5zdGFsbCByZWNvdmVyeSwgYW5kIHRoZSBVWCBwcmluY2lwbGVzLiBOb3QgeWV0IGZ1bGx5IGJ1aWx0LgotIGBQTFVHSU5TLm1kYDogc2hpcHBpbmcgY29kZSBpbiBhIG1vZCBmb2xkZXIsIGZvciBhIG1vZCB0aGF0IGEgbWFuaWZlc3QgYW5kIGEgZmV3IHJlY29yZCBmaWxlcyBjYW5ub3QgZXhwcmVzcy4gSXQgY292ZXJzIGBwbHVnaW4uanNgLCBpdHMgYGhvb2tzKGN0eClgL2ByZWdpc3Rlcihob3N0LCBjdHgpYCBlbnRyeSBwb2ludHMsIGFuZCB3aGF0IGVhY2ggb25lIGNhbiByZWFjaCBpbiBhIGxpdmUgZ2FtZS4KLSBgQVBJMi5tZGA6IHZlcnNpb24gMiBvZiB0aGUgbW9kIGNvZGUgQVBJLCBmb3IgYSBtb2QncyBgc3RhcnRgIGFuZCBgaG9va3NgLiBFdmVyeSBjYWxsIHJldHVybnMgcGxhaW4gZGF0YSBhbmQgYSB0eXBlZCByZXN1bHQsIGEgbWlzc2luZyBwZXJtaXNzaW9uIGNvbWVzIGJhY2sgYXMgYG5vdC1ncmFudGVkYCwgYW5kIHJlYWRzIHNob3cgb25seSB3aGF0IHRoZSBwbGF5ZXIga25vd3MuIFRoZSB0eXBlcyBhbmQgdGhlIGluLXByb2Nlc3MgaG9zdCBhcmUgYnVpbHQsIGFuZCBBUEkgMSBwbHVnaW5zIGtlZXAgd29ya2luZy4KLSBbYE1JR1JBVElOR19UT19BUEkyLm1kYF0oTUlHUkFUSU5HX1RPX0FQSTIubWQpOiBtb3ZpbmcgYW4gQVBJIDEgcGx1Z2luIHRvIEFQSSAyLCBzdGVwIGJ5IHN0ZXAuIEl0IHN0YXJ0cyB3aXRoIHdoYXQgaGFzIG5vIEFQSSAyIGZvcm0geWV0LCBjb252ZXJ0cyB0aGUgbWFuaWZlc3Qgd2l0aCBgY29udmVydE1hbmlmZXN0VjFgLCBhbmQgZ2l2ZXMgYSBiZWZvcmUgYW5kIGFmdGVyIGZvciBlYWNoIHBhcnQgb2YgdGhlIG9sZCBgY3R4YC4gQSBtb2QgY2Fubm90IGJlIGxvYWRlZCBmcm9tIGEgZm9sZGVyIGFzIEFQSSAyIG9uIHRoaXMgYnVpbGQsIHNvIHRoZSBndWlkZSBhbHNvIHNheXMgd2hhdCBhbiBhdXRob3IgY2FuIHNoaXAgdG9kYXkuCi0gYE1PRF9TRUFNUy5tZGA6IHRoZSBjb3JlIHNlYW1zIGEgbW9kIHJlYWNoZXMgdGhyb3VnaCwgaW5jbHVkaW5nIHRoZSBgTW9kSG9va3NgIGJlaGF2aW91ciBpbnRlcmZhY2UsIGl0cyBwZXItaG9vayBmb2xkIHJ1bGVzLCBhbmQgaG93IGEgcGF0Y2ggaXMgdHVybmVkIG9uLiBFdmVyeXRoaW5nIGl0IGRlc2NyaWJlcyBpcyBidWlsdC4KLSBgUkVHSU9OX0lOUFVULm1kYDogaG93IHBvaW50ZXIgdGFwcywgY29udGV4dCBtZW51cyBhbmQgbG9uZy1wcmVzc2VzIHJvdXRlIGJ5IHBlci1jZWxsIHJlZ2lvbiBvd25lcnNoaXAgcmF0aGVyIHRoYW4gYnkgcmVjdGFuZ2xlLiBUaGlzIGlzIGJ1aWx0LCBhbmQgdGhlIHBhZ2UgaXMga2VwdCBhcyBhIGRlc2lnbiByZWNvcmQuCi0gYENMT1VEX0JBQ0tVUF9ERVNJR04ubWRgOiBhIHBsYXllci1jaG9zZW4gc2F2ZS1iYWNrdXAgZm9sZGVyIGFzIGEgYHFvbGAgZmVhdHVyZSwgdGhlIHR3byBzbWFsbCBob3N0IHNlYW1zIGl0IG5lZWRzLCBhbmQgd2h5IHRoZSB0cmlnZ2VyIGlzIHN0aWxsIGJsb2NrZWQgb24gYSBzZWFtIHRoYXQgZG9lcyBub3QgZXhpc3QgeWV0IGV2ZW4gdGhvdWdoIHRoZSBlbmdpbmUgc2lkZSBpcyBkb25lLgotIGBNT0RfQ09NUEFUSUJJTElUWS5tZGA6IHdoYXQgYW4gZW5naW5lIHJlbGVhc2UgbWF5IGFuZCBtYXkgbm90IGJyZWFrLCBhbmQgd2hhdCB5b3UgaGF2ZSB0byBkbyBhYm91dCBpdC4gSXQgY292ZXJzIHRoZSBmb3VyIGdhdGVzIHRoYXQgY2FuIHN0cmFuZCBhIG1vZCwgd2hhdCB0byB3cml0ZSBpbiBgZW5naW5lYCwgdGhlIHR3by1yZWxlYXNlIHJ1bGUgZm9yIGFuIEFCSSBidW1wLCBhbmQgdGhlIGdhcCBhcm91bmQgYGN0eC5jb3JlYC4gUmVhZCB0aGlzIGJlZm9yZSBwdWJsaXNoaW5nIGFueXRoaW5nLgotIGBNT0RfUkVBQ0gubWRgOiBob3cgbXVjaCBvZiB0aGUgZ2FtZSBhIG1vZCBjYW4gY2hhbmdlIHRvZGF5LCBtZWFzdXJlZC4gSXQgaGFzIHRoZSBob29rIGNvdW50LCBhIGNlbnN1cyBvZiB0aGUgcG9ydCdzIGRpc3BhdGNoIHRhYmxlcyBhbmQgd2hpY2ggb2YgdGhlbSBhIG1vZCBjYW4gcmVhY2gsIHdoYXQgZGF0YSBsYXllcmluZyBzdXBwb3J0cywgd2hpY2ggcmVzb3VyY2VzIGNhbiBiZSBvdmVycmlkZGVuLCBhbmQgdGhlIGdhcCBsaXN0LiBDaGVjayBpdCBiZWZvcmUgdHJ1c3RpbmcgYSBjYXBhYmlsaXR5IGNsYWltIG9uIGFueSBvdGhlciBwYWdlLCBiZWNhdXNlIHNvbWUgcGFnZXMgaW4gdGhpcyBkaXJlY3RvcnkgZGVzY3JpYmUgZGVzaWducyBhbmQgb3RoZXJzIGRlc2NyaWJlIHdoYXQgaXMgYnVpbHQuCi0gKipSZXBsYWNpbmcgdGhlIHdob2xlIGZyb250IGVuZCoqIChhbiA4LzE2LWJpdCBtZW51IHNoZWxsLCBpc29tZXRyaWMsIGZ1bGwgM0QsIGZpcnN0LXBlcnNvbiwgY29udHJvbGxlci1kcml2ZW4pIGlzIGJ1aWx0OiBhIHBsdWdpbidzIGBmcm9udGVuZGAgbWVtYmVyIGRyYXdzIHRoZSB3b3JsZCBpdHNlbGYsIHVuZGVyIGBkaXNwbGF5OnJlcGxhY2VgLiBDb3JlIG5lZWRlZCBubyBjaGFuZ2UgZm9yIGl0LCBiZWNhdXNlIGl0IHdhcyBhbHJlYWR5IGhlYWRsZXNzLiBTZWUgYFBMVUdJTlMubWRgIGFuZCBnYXAgOSBpbiBgTU9EX1JFQUNILm1kYC4KLSBgZG9jcy9MSU5PTEVVTS5tZGA6IHRpbGUgcGFja3MgYW5kIGNvbnZlcnRpbmcgdGhlIGNsYXNzaWMgdGlsZXNldHMuCi0gYEJVR19GSVhFUy5tZGA6IHRoZSBgYnVnLWZpeGVzYCBtb2QsIHdpdGggaXRzIGRlc2lnbiBhbmQgYSByZWZlcmVuY2VkIGNoYW5nZWxvZyBvZiB1cHN0cmVhbSBjcmFzaCwgY29ycnVwdGlvbiwgc2F2ZSBhbmQgZGV0ZXJtaW5pc20gZml4ZXMgdGhhdCBjb3JlIGRvZXMgbm90IGNhcnJ5LiBQYXRjaGVzIGxhbmQgd2l0aCB0aGUgbW9kIHJ1bnRpbWUgYW5kIHRoZSBzeXN0ZW1zIHRoZXkgdG91Y2guCi0gYFVQU1RSRUFNX0NBVENIVVBfTU9EX1NDT1BFLm1kYDogd2hlcmUgdGhlIGB1cHN0cmVhbS1jYXRjaHVwYCBtb2QgZHJhd3MgaXRzIGxpbmUgYWdhaW5zdCBgYnVnLWZpeGVzYC4gVGhlIG1vZCBpcyBpbiBpdHMgb3duIHJlcG9zaXRvcnkgKHNlZSB0aGUgdGFibGUgYmVsb3cpLgotIFN0aWxsIHRvIGNvbWUgYXMgdGhlIGVuZ2luZSBhZGRzIHRoZW06IGEgaGFuZGxlciByZWdpc3RyeSBjYXRhbG9nIChlZmZlY3RzLCBjb21tYW5kcywgcm9vbSBidWlsZGVycyksIHRoZSBzYW5kYm94IGNhcGFiaWxpdHkgcmVmZXJlbmNlIGZvciBzY3JpcHRlZCBwbHVnaW5zLCBkaWFsb2csIHF1ZXN0IGFuZCBzaG9wIGNvb2tib29rcywgYW5kIHB1Ymxpc2hpbmcgZ3VpZGFuY2UuIFZhbGlkYXRpbmcgYW5kIGJ1bmRsaW5nIGFyZSBub3Qgb24gdGhhdCBsaXN0LCBiZWNhdXNlIGBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIGFuZCBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCBhbHJlYWR5IHNoaXAgaW4gYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGtgLgojIyBUaGUgZmlyc3QtcGFydHkgbW9kcwoKVGhlcmUgYXJlIGVpZ2h0LCAqKm5vbmUgb2YgdGhlbSBidW5kbGVkKiosIGFuZCBhbGwgYXJlIG9mZiB1bnRpbCBlbmFibGVkIChzZWUgYERFRkFVTFRfRU5BQkxFRF9NT0RTYDsgYW4gdW50b3VjaGVkIGluc3RhbGwgaXMgdGhlIGZhaXRoZnVsIGJhc2UgZ2FtZSB3aXRoIG5vIG1vZCBsb2FkZWQpLiBFYWNoIGxpdmVzIGluIGl0cyBvd24gcmVwb3NpdG9yeSBhbmQgYXJyaXZlcyB0aHJvdWdoIHRoZSBtb2QgbWFuYWdlcidzICpSZWNvbW1lbmRlZCBtb2RzLi4uKiByb3c6Cgp8IGlkIHwgc2hhcGUgfCB3aGVyZSBpdCBsaXZlcyB8IHdoYXQgaXQgYWRkcyB8CnwgLS0tIHwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgcW9sYCB8IGNvbnRlbnQgfCBbb3duIHJlcG9dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1xb2wpIHwgTmV3IGNvbnZlbmllbmNlcywgY3VycmVudGx5IGp1c3QgYXV0by1kaWcgb24gd2Fsay4gQW5nYmFuZCdzIGJ1aWx0LWluIGA9YCBvcHRpb25zIGFyZSBub3QgaGVyZTogdGhleSBzaGlwIGluIGNvcmUgYXQgdGhlaXIgdXBzdHJlYW0gZGVmYXVsdHMuIFNlZSBgUU9MLm1kYC4gfAp8IGBidWctZml4ZXNgIHwgY29udGVudCB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJ1Zy1maXhlcykgfCBBbiB1bm9mZmljaWFsIHBhdGNoIHNldCBmb3IgdXBzdHJlYW0gYnVncyB0aGF0IGNvcmUga2VlcHMuIFNlZSBgQlVHX0ZJWEVTLm1kYC4gfAp8IGBsaW5vbGV1bWAgfCB0aWxlcyB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWxpbm9sZXVtKSB8IEFuIGFsdGVybmF0aXZlIHRpbGUgZW5naW5lOiB0aGUgTGlub2xldW0gbG9vc2UtcGFjayBmb3JtYXQgKGluZGl2aWR1YWwgUE5HcyBhZGRyZXNzZWQgYnkgcmVhZGFibGUgdGFyZ2V0IG1hcHMsIHBsdXMgdmFyaWFudCBwb29scykuIEl0IGRvZXMgbm90IHN1cHBseSB0aGUgZ2FtZSdzIGdyYXBoaWNzLiBBbGwgZml2ZSB1cHN0cmVhbSB0aWxlIHNldHMgKE9yaWdpbmFsIC8gQWRhbSBCb2x0IC8gRGF2aWQgR2VydmFpcyAvIE5vbWFkIC8gU2hvY2tib2x0IERhcmsgYW5kIExpZ2h0KSBhcmUgY29yZSBjb250ZW50IChgZ3JhZm1vZGUuY2AgLyBgbGliL3RpbGVzL2xpc3QudHh0YCkgYW5kIGFwcGVhciBpbiB0aGUgR3JhcGhpY3Mgc2NyZWVuIHdpdGggbm8gbW9kIGVuYWJsZWQuIFRoaXMgbW9kIHNoaXBzIGFsbCBzaXggY29udmVydGVkIHRvIGxvb3NlIHBhY2tzLCBzbyB5b3UgY2FuIGNvbXBhcmUgdGhlIHR3byBlbmdpbmVzIG9uIGlkZW50aWNhbCBhcnQuIERlY2xhcmUgYSBwYWNrIHdpdGggYHsgImdyYWZJRCI6ID49MTAwLCAiZW5naW5lIjogImxpbm9sZXVtIiwgIm1lbnVuYW1lIjogIi4uLiIsICJwYXRoIjogIi4uLiIgfWA7IGBlbmdpbmVgIG5hbWVzIHRoZSBmb3JtYXQsIGFuZCB0aGUgbW9kIHRoYXQgc2hpcHMgdGhlIHNpeCBjb252ZXJ0ZWQgcGFja3MgaGFzIHRoZSBzYW1lIGlkLiBTaW5jZSAwLjE1LjAgaXQgYWxzbyBjYXJyaWVzIGEgcnVsZSB0aGUgZ2FtZSB1c2VkIHRvIGhvbGQ6IGNvbnRlbnQgYSBtb2QgYWRkZWQsIHdpdGggbm8gdGlsZSBhbnl3aGVyZSwgaXMgZHJhd24gZnJvbSBpdHMgbmVhcmVzdCByZWxhdGl2ZSB3aXRoIHRoZSBjb2xvdXIgdHVybmVkLCB1bmRlciBpdHMgb3duIHBhY2tzIG9ubHksIHRocm91Z2ggYHJlZ2lzdHJ5OnRpbGVzYC4gU2VlIGBkb2NzL0xJTk9MRVVNLm1kYC4gfAp8IGBib3JnYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJvcmcpIHwgQW4gYXV0b21hdGljIHBsYXllciB0aGF0IGRyaXZlcyB0aGUgZ2FtZSB0aHJvdWdoIHRoZSBzYW1lIHBlcmNlaXZlL2FjdCBBUEkgYW55IHRoaXJkLXBhcnR5IGF1dG9tYXRpb24gd291bGQgdXNlLiBUaGUgd2hvbGUgcG9ydCBsaXZlcyBpbiB0aGF0IHJlcG9zaXRvcnksIHdpdGggaXRzIG93biByZWxlYXNlIHRhZ3MgYW5kIGl0cyBvd24gdGVzdCBzdWl0ZSwgaW5jbHVkaW5nIG9uZSB0aGF0IGRyaXZlcyB0aGUgYnVpbHQgYHBsdWdpbi5qc2AuIEluc3RhbGxpbmcgYW5kIGVuYWJsaW5nIGl0IGRvZXMgbm90IGhhbmQgaXQgeW91ciBjaGFyYWN0ZXI7IGl0cyAiTGV0IHRoZSBCb3JnIHBsYXkiIHRvZ2dsZSBkb2VzLiB8CnwgYGZlYXR1cmUtcmVzdG9yYXRpb25gIHwgY29udGVudCArIHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWZlYXR1cmUtcmVzdG9yYXRpb24pIHwgQW5nYmFuZCBmZWF0dXJlcyB0aGF0IGEgbGF0ZXIgdmVyc2lvbiBkcm9wcGVkLCBicm91Z2h0IGJhY2sgb25lIG5hbWVkIHRvZ2dsZSBhdCBhIHRpbWUsIGV2ZXJ5IHRvZ2dsZSBvZmYgYnkgZGVmYXVsdC4gYFRlbGVwb3J0IE90aGVyYCAoY29udGVudDogYSBgZmllbGRQYXRjaGVzYCBhZGRpdGlvbiB0byB0aGUgUHJpZXN0LCBQYWxhZGluIGFuZCBSYW5nZXIncyBvd24gYm9va3MsIHNpbmNlIHRob3NlIGNsYXNzZXMgbG9zdCB0aGUgc3BlbGwgc29tZXdoZXJlIGJldHdlZW4gYW4gZWFybGllciBBbmdiYW5kIGFuZCA0LjIuNiB3aGlsZSB0aGUgTWFnZSBhbmQgdGhlIFJvZ3VlIGtlcHQgaXQpIGFuZCBzdG9yZSBkaXNjb3VudHMgKHBsdWdpbjogNC4yLjYgZHJvcHBlZCB0aGUgZGlzY291bnQgcm9sbCBlbnRpcmVseSwgc28gdGhpcyByZXN0b3JhdGlvbiBpbnN0YWxscyBhIGByZWdpc3RyeTpzdG9yZWAgZGlzY291bnQtcm9sbCBoYW5kbGVyIGluc3RlYWQgb2YgcGF0Y2hpbmcgZGF0YSB0aGF0IG5vIGxvbmdlciBleGlzdHMpLiB8CnwgYGZvcmdlYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWZvcmdlKSB8IEFuIGluLWdhbWUgd29ya3Nob3AgZm9yIGJ1aWxkaW5nIG90aGVyIG1vZHMgd2l0aG91dCBsZWF2aW5nIHRoZSBnYW1lOiBwaWNrIGFuIGV4aXN0aW5nIHJlY29yZCwgc2VlIGl0cyBuZWlnaGJvdXJzLCBjaGFuZ2Ugd2hhdCB3b3VsZCBoYXZlIHRvIGNoYW5nZSwgYW5kIHBhY2sgdGhlIHJlc3VsdCB1cCB0byB0cnkgaW4tc2Vzc2lvbiwgaW5zdGFsbCwgb3IgaGFuZCBvZmYgYXMgYSBmaWxlLiBJdCBpcyBlYXJseSwgYW5kIHRoZSB3b3Jrc2hvcCdzIG93biBjb250ZW50IGlzIGEgZGVtb25zdHJhdGlvbiBmaXh0dXJlIHVudGlsIHRoZSByZW1haW5pbmcgZW5naW5lIHNlYW1zIGxhbmQuIFNlZSBgZG9jcy9FTkdJTkVfU0VBTVMubWRgIGluIGl0cyBvd24gcmVwb3NpdG9yeS4gfAp8IGB1cHN0cmVhbS1jYXRjaHVwYCB8IHBsdWdpbiB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLXVwc3RyZWFtLWNhdGNodXApIHwgQ2hhbmdlcyB1cHN0cmVhbSBBbmdiYW5kIGFjY2VwdGVkIGFmdGVyIHRoZSBgNC4yLjZgIHRhZyBjb3JlIGlzIHBpbm5lZCB0bywgY2l0ZWQgYnkgU0hBLCB3aXRoIG9uZSB0b2dnbGUgcGVyIGNsYXNzIG9mIGNoYW5nZSBhbmQgZXZlcnkgb25lIG9mZiBieSBkZWZhdWx0LiBJdHMgZmlyc3Qgc2xpY2UgaXMgdGhlIGZvdXIgcG9zdC00LjIuNiB0aWxlLWFzc2lnbm1lbnQgY29tbWl0cywgYXBwbGllZCB0aHJvdWdoIGByZWdpc3RyeTp0aWxlc2AgcmF0aGVyIHRoYW4gYXMgYSBgcHJlZnNgIHJlc291cmNlLCBiZWNhdXNlIGEgbW9kJ3MgcHJlZiBmaWxlIGlzIHJlcGxheWVkIGludG8gZXZlcnkgdGlsZSBtYXAgYW5kIHRoZSBraW5kIGZvcmJpZHMgYSBzbG90LCBzbyBub3RoaW5nIGNvdWxkIHNjb3BlIGl0IHRvIHRoZSBvbmUgc2hlZXQgdXBzdHJlYW0gd3JvdGUgaXQgZm9yLiBUaGUgYm91bmRhcnkgYWdhaW5zdCBgYnVnLWZpeGVzYCBpcyB3aGV0aGVyIGFuIGFjY2VwdGVkIHVwc3RyZWFtIGNvbW1pdCBleGlzdHMuIFRoaXMgbW9kIGV4cGlyZXM6IGEgcmViYXNlbGluZSBvbnRvIGEgbmV3ZXIgdXBzdHJlYW0gdGFnIG1ha2VzIGV2ZXJ5IHJvdyBpbiBpdCByZWR1bmRhbnQuIFNlZSBgVVBTVFJFQU1fQ0FUQ0hVUF9NT0RfU0NPUEUubWRgLiB8CnwgYGFueWJhbmR1aWAgfCBwbHVnaW4gfCBbb3duIHJlcG9dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1hbnliYW5kdWkpIHwgV3VybGkgTW9ua2hhdmVuJ3MgQW55YmFuZFVJLCByZWJ1aWx0IGZvciBOZW8gQW5nYmFuZDogcGxheSB3aXRoIHRoZSBtb3VzZSAoY2xpY2sgdGhlIG1hcCB0byBtb3ZlIGFuZCBhY3QpLCBrZWVwIHRoZSBjaGFyYWN0ZXIsIHN0YXR1cyBhbmQgbWVzc2FnZXMgaW4gcGFuZWxzLCBhbmQgY29tcGFyZSBnZWFyIGluIGFuIGl0ZW0gd2luZG93IGJlZm9yZSB3ZWFyaW5nIGl0LiBFYWNoIGZlYXR1cmUgaGFzIGl0cyBvd24gc3dpdGNoIGFuZCBzdGFydHMgb2ZmLCBhbmQgbm9uZSBvZiB0aGVtIGNoYW5nZXMgdGhlIGdhbWUncyBydWxlcy4gfApGaXJzdC1wYXJ0eSBtb2RzIHRha2UgdGhlIHNhbWUgcm91dGUgaW50byB0aGUgZ2FtZSBhcyBhbnlvbmUgZWxzZSdzIG1vZC4gQnVuZGxpbmcgdGhlIHByb2plY3QncyBvd24gbW9kcyB3b3VsZCBoYXZlIGhpZGRlbiBldmVyeSBkZWZlY3QgaW4gdGhlIGluc3RhbGwgcGF0aCBiZWhpbmQgbW9kcyB0aGF0IG5ldmVyIHVzZWQgaXQsIGFuZCB0aGUgZG93bmxvYWQgcm91dGUsIHRoZSBmb2xkZXIgY29kZSBsb2FkZXIgYW5kIHRoZSBwbHVnaW4gQUJJIHdvcmsgYmVjYXVzZSBubyBtb2QgaXMgZXhlbXB0IGZyb20gdGhlbS4gVGhlIGVpZ2h0IGZpcnN0LXBhcnR5IG1vZHMgYXJlIGFsc28gdGhlIHJlZmVyZW5jZSBleGFtcGxlcywgc28gcmVhZCB0aGVtIHRvIGxlYXJuIHRoZSBzZWFtcy4KCkVuYWJsZSBvbmUgaW4gdGhlIGluLWFwcCBtb2QgbWFuYWdlciAoZ2FtZSBtZW51IC0+IE1vZHMpLCBvciB3aXRoIGA/bW9kcz1xb2wsYnVnLWZpeGVzLGxpbm9sZXVtYCBmb3IgYSBvbmUtb2ZmLgoKVGhlIG1vZCBpcyB0aGUgdW5pdCB5b3Ugc3dpdGNoLCBhbmQgaXRzIHBhdGNoZXMgY29tZSB3aXRoIGl0LiBXaGlsZSBhIG1vZCBpcyBkaXNhYmxlZCBpdHMgcGF0Y2hlcyBkbyBub3QgZXhpc3Q6IGl0cyBjb2RlIGlzIG5ldmVyIGNhbGxlZCwgbm8gaG9vayBpcyBpbnN0YWxsZWQsIG5vdGhpbmcgYXBwZWFycyBpbiB0aGUgbWVudSwgYW5kIGNvcmUgcnVucyB0aGUgZmFpdGhmdWwgYmFzZSBnYW1lLiBBIG1vZCB0aGF0IGNoYW5nZXMgYmVoYXZpb3VyIGRvZXMgc28gYnkgZGVmYXVsdC1leHBvcnRpbmcgYE1vZEhvb2tzYCBmcm9tIGl0cyBvd24gYHBsdWdpbi50c2A7IGNvcmUgaG9sZHMgb25lIGNvbXBvc2VkIGBNb2RIb29rc2AgYW5kIG5ldmVyIGxlYXJucyB3aGljaCBtb2Qgc3VwcGxpZWQgd2hhdCAoYGRvY3MvbW9kZGluZy9NT0RfU0VBTVMubWRgKS4gRW5hYmxpbmcgdGhlIG1vZCB0dXJucyBpdHMgd2hvbGUgcGF0Y2ggc2V0IG9uIGF0IG9uY2UsIGFuZCBlYWNoIHBhdGNoIGNhbiB0aGVuIGJlIHN3aXRjaGVkIGluZGl2aWR1YWxseSBvbiB0aGF0IG1vZCdzIG93biBzY3JlZW4gKE1vZHMgLT4gdGhlIG1vZCAtPiBGaXhlcyAmIHR3ZWFrcyksIHNvIHlvdSBjYW4gdGFrZSB0aGUgc2V0IG1pbnVzIG9uZS4gVGhhdCBpcyBhbGwgYGRlZmF1bHQ6IHRydWVgIG9uIGEgcnVsZSBtZWFuczogb24gb25jZSBpdHMgb3duIG1vZCBpcyBvbiwgbmV2ZXIgb24gaW4gYSBmcmVzaCBpbnN0YWxsLgoKVGhlIGBkZW1vLSpgIGRpcmVjdG9yaWVzIGFyZSBub3Qgc2hpcHBlZCBtb2RzLiBUaGV5IGFyZSB0aGUgZnJhbWV3b3JrIHByb29mcywgb25lIHBlciBTREsgbG9hZCBwYXRoIChhIGNvbnRlbnQgcGFjayB0aGF0IHBhdGNoZXMgYSBjb3JlIG1vbnN0ZXIsIGEgc2FuZGJveGVkIHdvcmtlciBwbHVnaW4sIGEgdHJ1c3RlZCBpbi1wcm9jZXNzIHBsdWdpbiksIGFuZCB0aGV5IGtlZXAgYWxsIHRocmVlIHBhdGhzIGV4ZXJjaXNlZCBpbiBkZXYgYW5kIGluIHRoZSB0ZXN0IHN1aXRlLiBEaXNjb3ZlcnkgZHJvcHMgdGhlbSBmcm9tIHJlbGVhc2UgYnVpbGRzIChgaXNTaGlwcGVkTW9kYCBpbiBgbW9kLXN0b3JlLnRzYCkuIFNpbmNlIG5vdGhpbmcgZWxzZSBpcyBidW5kbGVkLCBhIHJlbGVhc2UgYnVpbGQncyBkaXNjb3ZlcmVkIG1vZCBzZXQgaXMgZW1wdHkgYW5kIGEgcGxheWVyJ3MgbW9kIG1hbmFnZXIgbGlzdHMgZXhhY3RseSB3aGF0IHRoZXkgaW5zdGFsbGVkLCB3aGljaCBgbW9kLXN0b3JlLnRlc3QudHNgIGFzc2VydHMgKCJhIHJlbGVhc2UgYnVpbGQncyBjb250ZW50IGNhdGFsb2cgaXMgRU1QVFkiKS4KCk9uZSBkZW1vIG1hdHRlcnMgYmV5b25kIGJlaW5nIGFuIGV4YW1wbGUuIGBkZW1vLWhvb2tzYCBpcyB0aGUgb25seSBtb2QgaW4gdGhlIGJ1aWxkIHdpdGggYSBgcGx1Z2luLnRzYCwgc28gaXQga2VlcHMgdGhlIE1vZEhvb2tzIGRpc2NvdmVyeSBwYXRoIGFuZCBpdHMgZ3VhcmRzIGZyb20gZ29pbmcgdmFjdW91cyBub3cgdGhhdCB0aGUgcmVhbCBtb2RzIGhhdmUgbGVmdCwgc2luY2UgYSBnbG9iIHRoYXQgbWF0Y2hlcyBub3RoaW5nIHdvdWxkIHBhc3MgZXZlcnkgYXNzZXJ0aW9uIGFib3V0IHdoYXQgaXQgbWF0Y2hlZC4KIyMgUGFjayBhbmF0b215CgpBIHBhY2sgaXMgYSBkaXJlY3RvcnkgKG9yIGFyY2hpdmUpIHdpdGggYSBtYW5pZmVzdCBhbmQgY29udGVudCBmaWxlczoKCmBgYApteS1mcm9zdC1wYWNrLwogIG1hbmlmZXN0Lmpzb24gICAgICA8LSB0aGUgbWFuaWZlc3Q7IHRoZSBmaWxlIHRoYXQgbWFrZXMgdGhpcyBhIG1vZAogIG1vbnN0ZXIuanNvbiAgICAgICA8LSBjb250cmlidXRpb25zIHRvIHRoZSAibW9uc3RlciIgcmVjb3JkIGZpbGUKICBvYmplY3QuanNvbiAgICAgICAgPC0gY29udHJpYnV0aW9ucyB0byB0aGUgIm9iamVjdCIgcmVjb3JkIGZpbGUKICAuLi4KYGBgCgojIyMgVGhlIG1hbmlmZXN0IChgbWFuaWZlc3QuanNvbmApCgpgYGBqc29uCnsKICAiZm9ybWF0IjogIm5lby1hbmdiYW5kL21vZC9tYW5pZmVzdCIsCiAgInNjaGVtYVZlcnNpb24iOiAyLAogICJkYXRhIjogewogICAgImlkIjogImZyb3N0IiwKICAgICJuYW1lIjogIlRoZSBGcm9zdCBEZXB0aHMiLAogICAgInZlcnNpb24iOiAiMS4yLjAiLAogICAgImFwaSI6ICIqIiwKICAgICJydW50aW1lIjogImRhdGEiLAogICAgImRlcGVuZGVuY2llcyI6IHsKICAgICAgInJlcXVpcmVkIjogeyAiY29yZSI6IHsgInJhbmdlIjogIioiIH0gfQogICAgfSwKICAgICJhdXRob3IiOiAiWW91IiwKICAgICJsaWNlbnNlIjogIkNDLUJZLTQuMCIKICB9Cn0KYGBgCgotIGBpZGA6IGxvd2VyY2FzZSBrZWJhYi1jYXNlLCB1bmlxdWUgYW1vbmcgbG9hZGVkIHBhY2tzLiBJdCBiZWNvbWVzIHlvdXIgbmFtZXNwYWNlOiBhIG1vbnN0ZXIgeW91IGFkZCBuYW1lZCAiRnJvc3QgV3lybSIgaXMgYGZyb3N0OmZyb3N0LXd5cm1gIGV2ZXJ5d2hlcmUgLSBpbiBvdGhlciBwYWNrcywgaW4gdGlsZS1wYWNrIHRhcmdldHMsIGluIHNhdmVmaWxlcy4KLSBgYXBpYDogdGhlIG1vZCBBUEkgdmVyc2lvbnMgeW91ciBtb2Qgd29ya3Mgd2l0aCwgYXMgYSBzZW12ZXIgcmFuZ2UuIEEgbW9kIHdpdGggbm8gY29kZSBjYW4gc2F5IGAiKiJgLiBBIHBsdWdpbiB3cml0dGVuIGZvciB0b2RheSdzIGluLXByb2Nlc3MgQVBJIHNheXMgYCI+PTEuMC4wIDwyLjAuMCJgLCBhbmQgYSBXb3JrZXIgbW9kIHdyaXR0ZW4gZm9yIHRvZGF5J3MgV29ya2VyIEFQSSBzYXlzIGAiMi4wLjAtd29ya2VyImAuIFRoYXQgdmVyc2lvbiBpcyBhIHByZXJlbGVhc2UsIHNvIGEgc3RhYmxlIHJhbmdlIHN1Y2ggYXMgYCJeMi4wLjAiYCBkb2VzIG5vdCBhZG1pdCBpdC4gQSBtb2QgdGhhdCBydW5zIGNvZGUgaXMgbm90IGxvYWRlZCB3aGVuIGl0cyByYW5nZSBhZG1pdHMgbm8gQVBJIHRoaXMgYnVpbGQgcnVucyBpbiBpdHMgcnVudGltZSwgYW5kIHRoZSBNb2RzIHNjcmVlbiBzYXlzIHdoaWNoIHJhbmdlIGFuZCBydW50aW1lIGl0IGFza2VkIGZvci4KLSBgcnVudGltZWA6IGhvdyB5b3VyIG1vZCBydW5zLiBgZGF0YWAgcnVucyBubyBjb2RlLCBgaW4tcHJvY2Vzc2AgbG9hZHMgYHBsdWdpbi5qc2AgaW50byB0aGUgZ2FtZSdzIHBhZ2UsIGFuZCBgd29ya2VyYCBzdGFydHMgdGhlIG1vZHVsZSBuYW1lZCBpbiBgZW50cnlgIGluIGEgV29ya2VyIG9mIGl0cyBvd24uIFRoZSBydW50aW1lIGhhcyB0byBtYXRjaCB0aGUgZm9sZGVyOiBhIGBkYXRhYCBtb2QgdGhhdCBzaGlwcyBhIGAuanNgIG9yIGAubWpzYCBmaWxlIGlzIHJlZnVzZWQsIGFuZCBzbyBpcyBhIGNvZGUgbW9kIHdob3NlIGVudHJ5IGZpbGUgaXMgbWlzc2luZy4KLSBgZW50cnlgOiB0aGUgbW9kdWxlIGEgYHdvcmtlcmAgbW9kIHN0YXJ0cywgYXMgYSBwYXRoIGluc2lkZSB0aGUgbW9kIGZvbGRlciAobm8gbGVhZGluZyBgL2AsIG5vIGAuLmAsIG5vIGJhY2tzbGFzaCkuIEFuIGBpbi1wcm9jZXNzYCBtb2QgYWx3YXlzIHN0YXJ0cyBgcGx1Z2luLmpzYCwgc28gaXQgY2FuIGxlYXZlIHRoaXMgb3V0LCBhbmQgYW55IG90aGVyIHZhbHVlIGlzIHJlZnVzZWQuCi0gYHNoYXBlYCBhbmQgYGZhY2V0c2A6IG9wdGlvbmFsLiBXaXRob3V0IHRoZW0gYSBtb2Qgd2l0aCBubyBjb2RlIGlzIGBjb250ZW50YCBhbmQgYSBjb2RlIG1vZCBpcyBgcGx1Z2luYC4gQSBtb2Qgd2l0aCBib3RoIHJlY29yZHMgYW5kIGNvZGUgc2F5cyBgInNoYXBlIjogImNvbnRlbnQiLCAiZmFjZXRzIjogWyJjb250ZW50IiwgInBsdWdpbiJdYC4gQSBjb2RlIHJ1bnRpbWUgYWx3YXlzIGhhcyB0aGUgYHBsdWdpbmAgZmFjZXQsIGFuZCBhIGBkYXRhYCBtb2QgY2Fubm90IGhhdmUgaXQuCi0gYGRlcGVuZGVuY2llc2A6IHRocmVlIGxpc3RzLCBlYWNoIGtleWVkIGJ5IG1vZCBpZC4gTW9kcyB1bmRlciBgcmVxdWlyZWRgIGxvYWQgYmVmb3JlIHlvdXJzLCBhbmQgYSBtaXNzaW5nIG9uZSBzdG9wcyB0aGUgbG9hZC4gTW9kcyB1bmRlciBgb3B0aW9uYWxgIGxvYWQgZmlyc3Qgd2hlbiB0aGV5IGFyZSBpbnN0YWxsZWQsIGFuZCBub3RoaW5nIGlzIHdyb25nIHdoZW4gdGhleSBhcmUgbm90LiBBbiBpbnN0YWxsZWQgZGVwZW5kZW5jeSBpbiBlaXRoZXIgbGlzdCBtdXN0IGhhdmUgYSB2ZXJzaW9uIGluc2lkZSBpdHMgYHJhbmdlYC4gTGlzdGluZyBhIG1vZCBpbiBlaXRoZXIgbGlzdCBpcyBhbHNvIGEgcGVybWlzc2lvbjogeW91IG1heSBwYXRjaCwgcmVwbGFjZSBvciByZW1vdmUgb25seSB5b3VyIG93biByZWNvcmRzIGFuZCB0aG9zZSBvZiBtb2RzIHlvdSBsaXN0IHRoZXJlLiBNb2RzIHVuZGVyIGBjb25mbGljdHNgIGdldCBhIHdhcm5pbmcgb24gdGhlIE1vZHMgc2NyZWVuIHRoYXQgZ2l2ZXMgeW91ciByZWFzb24sIGFuZCB0aGUgcGxheWVyIGNhbiBzdGlsbCB0dXJuIGJvdGggb24uIEVhY2ggZW50cnkgaGFzIGEgYHJhbmdlYCAobmVlZGVkIGZvciBgcmVxdWlyZWRgIGFuZCBgb3B0aW9uYWxgOyBhIGNvbmZsaWN0IHdpdGhvdXQgb25lIGNvdmVycyBldmVyeSB2ZXJzaW9uKSBhbmQgYSBgYmVjYXVzZWAsIHdoaWNoIGEgY29uZmxpY3QgbXVzdCBoYXZlLiBBIG1vZCBpZCBnb2VzIGluIG9uZSBsaXN0IG9ubHksIGFuZCBhIG1vZCBjYW5ub3QgbGlzdCBpdHNlbGYuCi0gYGVuZ2luZWA6IG9wdGlvbmFsLiBgeyAicmFuZ2UiOiAiPj0xLjIxLjEiLCAiYmVjYXVzZSI6ICIuLi4iIH1gIGxpbWl0cyB0aGUgZ2FtZSB2ZXJzaW9ucyB5b3VyIG1vZCBsb2FkcyBvbiwgYW5kIGl0IG5lZWRzIGEgcmVhc29uLiBVc2UgaXQgb25seSBmb3IgYSBrbm93biBlbmdpbmUgYnVnIG9yIGEgY29udGVudCBmb3JtYXQgeW91ciBtb2QgcmVsaWVzIG9uLgotIGBjYXBhYmlsaXRpZXNgOiB3aGF0IHlvdXIgY29kZSBhc2tzIHRoZSBwbGF5ZXIgdG8gYWxsb3c7IHNlZSBbQ2FwYWJpbGl0aWVzXShQTFVHSU5TLm1kI2NhcGFiaWxpdGllcykuCi0gYHRleHRgOiB5b3VyIG1vZCdzIGRlZmF1bHQgbG9jYWxlIGFuZCB0aGUgZmlsZSBob2xkaW5nIGVhY2ggbG9jYWxlJ3Mgc3RyaW5ncywgc3VjaCBhcyBgeyAiZGVmYXVsdCI6ICJlbiIsICJsb2NhbGVzIjogeyAiZW4iOiAidGV4dC9lbi5qc29uIiB9IH1gLiBUaGUgbWFuaWZlc3QgY2hlY2tzIHRoZSBsb2NhbGUgdGFncyBhbmQgcGF0aHMsIGJ1dCB0aGUgZ2FtZSBkb2VzIG5vdCByZWFkIHRoZXNlIGZpbGVzIHlldC4KLSBgbGlzdGluZ2A6IGB0YWdzYCAoa2ViYWItY2FzZSB3b3JkcyksIGBzY3JlZW5zaG90c2AgYW5kIGBjaGFuZ2Vsb2dgLCBhcyBwYXRocyBpbnNpZGUgdGhlIG1vZCBmb2xkZXIuIFRoZSBpbi1nYW1lIG1vZCBicm93c2VyIHNob3dzIHRoZSBzY3JlZW5zaG90czsgbm90aGluZyBpbiB0aGUgZ2FtZSByZWFkcyBgdGFnc2Agb3IgYGNoYW5nZWxvZ2AgeWV0LgotIGBidWRnZXRgOiBgeyAibXNQZXJUdXJuIjogNTAgfWAsIHRoZSB0aW1lIHlvdXIgbW9kIGFza3MgdG8gc3BlbmQgb24gZWFjaCBnYW1lIHR1cm4uIFRoZSBtYW5pZmVzdCBhY2NlcHRzIGEgdmFsdWUgYWJvdmUgMCBhbmQgYXQgbW9zdCA1MDAuIFRoZSBnYW1lIGRvZXMgbm90IHJlYWQgdGhpcyBmaWVsZCB5ZXQsIHNvIGV2ZXJ5IG1vZCBnZXRzIHRoZSBkZWZhdWx0IG9mIDUwIG1zIGEgdHVybi4gQSB0dXJuIG92ZXIgYnVkZ2V0IGlzIGxvZ2dlZCBhcyBhIHdhcm5pbmcuIEdvaW5nIG92ZXIgNTAwIG1zIGlzIHdvcnNlOiB0aGUgZmlyc3QgdGltZSBpbiAyMDAgdHVybnMgaXMgbG9nZ2VkLCBhbmQgZWFjaCB0aW1lIGFmdGVyIHRoYXQgY291bnRzIGFzIGEgZmF1bHQgYWdhaW5zdCB0aGUgbW9kLgotIGBwdWJsaWNGbGFnc2A6IG9wdGlvbmFsIG5hbWVzIGZyb20gdGhpcyBtYW5pZmVzdCdzIGBydWxlc2Agb3IgYHNlY3Rpb25zYC4gVGhlIGhvc3QgaW5jbHVkZXMgb25seSB0aGVzZSBjdXJyZW50IGJvb2xlYW4gZmxhZ3MgaW4gYGN0eC5tb2RzKClgIGZvciBvdGhlciBwbHVnaW5zLiBNaXNzaW5nIGFuZCByZXBlYXRlZCBuYW1lcyBhcmUgcmVmdXNlZDsgb3RoZXIgc2V0dGluZ3Mgc3RheSBwcml2YXRlLgotIExvYWQgb3JkZXIgaXMgcmVzb2x2ZWQgZGV0ZXJtaW5pc3RpY2FsbHk6IGRlcGVuZGVuY2llcyBhbmQgYGxvYWRBZnRlcmAvYGxvYWRCZWZvcmVgIGhpbnRzIGZpcnN0LCB0aGVuIHRoZSBvcmRlciBvZiB0aGUgcGxheWVyJ3MgbW9kIGxpc3QuIFRoZSBzYW1lIHBhY2sgc2V0IGluIHRoZSBzYW1lIG9yZGVyIGNvbXBvc2VzIGlkZW50aWNhbGx5IG9uIGV2ZXJ5IG1hY2hpbmUuIEN5Y2xlcyBhbmQgbWlzc2luZyByZXF1aXJlZCBkZXBlbmRlbmNpZXMgZmFpbCBsb3VkbHkgYXQgbG9hZC4KCkV2ZXJ5IG90aGVyIGZpZWxkLCBzdWNoIGFzIGBydWxlc2AsIGBzZXR0aW5nc2AsIGBzZWN0aW9uc2AsIGBjb21wYXRgLCBgZmllbGRzYCwgYHJlc291cmNlc2AsIGB0aWxlUGFja3NgIGFuZCBgcGF5bG9hZGAsIGtlZXBzIHRoZSBuYW1lIGFuZCBtZWFuaW5nIGl0IGhhZCBiZWZvcmUgc2NoZW1hIDIuIEEgZmllbGQgdGhlIHNjaGVtYSBkb2VzIG5vdCBrbm93IGlzIHJlZnVzZWQsIHNvIHRoZSBzY2hlbWEgMSBuYW1lcyBgbW9kQXBpYCwgYHdvcmtlckVudHJ5YCBhbmQgYG9wdGlvbmFsRGVwZW5kZW5jaWVzYCBjYW5ub3QgYXBwZWFyIGluIGEgc2NoZW1hIDIgbWFuaWZlc3QuIEEgYHNjaGVtYVZlcnNpb25gIGFib3ZlIDIgaXMgcmVmdXNlZCB0b28uCgojIyMjIE1hbmlmZXN0cyB3cml0dGVuIGJlZm9yZSBzY2hlbWEgMgoKQSBgbWFuaWZlc3QuanNvbmAgd2l0aCBubyBgZm9ybWF0YCwgb3Igd2l0aCBgInNjaGVtYVZlcnNpb24iOiAxYCwgc3RpbGwgbG9hZHMsIGFuZCB0aGUgZ2FtZSByZWFkcyBpdCB0aGUgd2F5IGl0IGFsd2F5cyBoYXMuIGBtb2RBcGk6IDFgIGNvdW50cyBhcyBgInJ1bnRpbWUiOiAiaW4tcHJvY2VzcyJgIHdpdGggYCJhcGkiOiAiPj0xLjAuMCA8Mi4wLjAiYC4gYG1vZEFwaTogMmAgd2l0aCBgInJ1bnRpbWUiOiAid29ya2VyImAgY291bnRzIGFzIGAicnVudGltZSI6ICJ3b3JrZXIiYCB3aXRoIHRoZSBXb3JrZXIgcHJldmlldyBBUEksIGAiYXBpIjogIjIuMC4wLXdvcmtlciJgLCBhbmQgaXRzIGB3b3JrZXJFbnRyeWAgYXMgYGVudHJ5YC4gQSBtb2Qgd2l0aCBubyBjb2RlIGNvdW50cyBhcyBgInJ1bnRpbWUiOiAiZGF0YSJgIHdpdGggYCJhcGkiOiAiKiJgLiBObyBvdGhlciBgbW9kQXBpYCB2YWx1ZSBoYXMgYSBzY2hlbWEgMiBtZWFuaW5nLCBhbmQgdGhlIGludGVnZXIgaXMgbmV2ZXIgcmVhZCBhcyBhIHJhbmdlLgoKVG8gbW92ZSBhIG1hbmlmZXN0IHRvIHNjaGVtYSAyLCBydW4gaXQgdGhyb3VnaCB0aGUgU0RLJ3MgYGNvbnZlcnRNYW5pZmVzdFYxYC4gYGRlcGVuZGVuY2llc2AgYW5kIGBvcHRpb25hbERlcGVuZGVuY2llc2AgYmVjb21lIGBkZXBlbmRlbmNpZXMucmVxdWlyZWRgIGFuZCBgZGVwZW5kZW5jaWVzLm9wdGlvbmFsYC4gQSBgY29uZmxpY3RzYCBjbGFpbSBhYm91dCBhIHdob2xlIG1vZCBtb3ZlcyB0byBgZGVwZW5kZW5jaWVzLmNvbmZsaWN0c2Agd2hlbiBpdCBpcyB0aGUgb25seSBzdWNoIGNsYWltIGFib3V0IHRoYXQgbW9kIGFuZCB0aGUgbW9kIGlzIG5vdCBhbHNvIGEgZGVwZW5kZW5jeTsgZXZlcnkgb3RoZXIgY2xhaW0gc3RheXMgaW4gYGNvbXBhdGAuIGBjaGFuZ2Vsb2dgIGFuZCBgc2NyZWVuc2hvdHNgIG1vdmUgaW50byBgbGlzdGluZ2AsIGFuZCBgZW5naW5lYCBnZXRzIGEgcGxhY2Vob2xkZXIgcmVhc29uIHRoYXQgeW91IHNob3VsZCByZXBsYWNlIHdpdGggdGhlIHJlYWwgb25lLiBUaGUgY29udmVydGVyIHJlZnVzZXMgYSBgbW9kQXBpYCBpdCBoYXMgbm8gbWFwcGluZyBmb3IsIGFuZCBhIG1vZCB0aGF0IHNoaXBzIGNvZGUgd2l0aCBubyBgbW9kQXBpYCBhdCBhbGwuIGBtb2RQcm9qZWN0KC4uLikuZW1pdCgpYCB3cml0ZXMgc2NoZW1hIDIgb25seSwgdGhyb3VnaCBgbWFuaWZlc3RUb1YyYC4KCiMjIyBSZWNvcmQgY29tcG9zaXRpb24KCkVhY2ggY29udGVudCBmaWxlIG1heSBhZGQsIHBhdGNoLCByZXBsYWNlLCBhbmQgcmVtb3ZlIHJlY29yZHM6CgpgYGBqc29uCnsKICAicmVjb3JkcyI6IFsKICAgIHsgIm5hbWUiOiAiRnJvc3QgV3lybSIsICJocCI6IDQwMCwgImZsYWdzIjogWyJDT0xEIiwgIkRSQUdPTiJdIH0KICBdLAogICJwYXRjaGVzIjogewogICAgImNvcmU6a29ib2xkIjogeyAiaHAiOiAxMiwgImRlc2MiOiAiQSB0b3VnaGVyIGxpdHRsZSBrb2JvbGQuIiB9CiAgfSwKICAicmVwbGFjZXMiOiB7CiAgICAiY29yZTpncmlwLWZhcm1lci1tYWdnb3Qtcy1kb2ciOiB7ICJuYW1lIjogIkdyaXAiLCAiaHAiOiA1MCB9CiAgfSwKICAicmVtb3ZlcyI6IFsiY29yZTpmYW5nLWZhcm1lci1tYWdnb3Qtcy1kb2ciXQp9CmBgYAoKLSBgcmVjb3Jkc2AgYWRkcyBuZXcgZW50cmllczsgeW91ciBwYWNrIG93bnMgdGhlbS4KLSBgcGF0Y2hlc2AgZGVlcC1tZXJnZXMgb250byBhbiBleGlzdGluZyByZWNvcmQ6IG9iamVjdHMgbWVyZ2Uga2V5IGJ5CiAga2V5LCBhcnJheXMgYW5kIHNjYWxhcnMgYXJlIHJlcGxhY2VkIHdob2xlLCBhbmQgYW4gZXhwbGljaXQgYG51bGxgCiAgZGVsZXRlcyBhIGtleS4KLSBgcmVwbGFjZXNgIHN3YXBzIHRoZSByZWNvcmQgYm9keSB3aG9sZXNhbGUgKHRoZSByZWYgYW5kIG93bmVyIHN0YXkpLgotIGByZW1vdmVzYCBkZWxldGVzIHRoZSByZWNvcmQgZnJvbSB0aGUgY29tcG9zZWQgZ2FtZSwgdW5sZXNzIHRoYXQgd291bGQKICBsZWF2ZSB0aGUgZ2FtZSBicm9rZW4uIEEgcmVtb3ZhbCBpcyByZWZ1c2VkLCBhbmQgdGhlIHJlY29yZCBzdGF5cywgd2hlbgogIGFub3RoZXIgcmVjb3JkIHN0aWxsIG5hbWVzIGl0IChhIG1vbnN0ZXIgd2hvc2UgYGJhc2VgIGl0IGlzLCBhbiBlc2NvcnQKICBpbiBhIG1vbnN0ZXIncyBgZnJpZW5kc2AsIGEgaGlzdG9yeSBwaHJhc2Ugd2hvc2UgYG5leHRgIGNoYXJ0IGl0IGlzIHRoZQogIGxhc3QgcGhyYXNlIG9mKSwgb3Igd2hlbiBpdCBpcyB0aGUgcm9sbC0xMDAgcGhyYXNlIG9mIGEgaGlzdG9yeSBjaGFydC4KICBSZW1vdmUgdGhlIHJlY29yZCB0b2dldGhlciB3aXRoIGV2ZXJ5dGhpbmcgdGhhdCBuYW1lcyBpdCBhbmQgdGhlCiAgcmVtb3ZhbCBnb2VzIHRocm91Z2guCi0gYGZpZWxkUGF0Y2hlc2AgYXBwbGllcyB0eXBlZCBvcHMgdG8gZG90LXBhdGhzIChgc2V0YCwgYG1lcmdlYCwKICBgYWRkRmxhZ2AsIGByZW1vdmVGbGFnYCwgYGFkZGAsIGBtdWxgLCBgYXBwZW5kYCwgYHJlbW92ZVZhbHVlYCkgLSBzZWUKICBgcGFja2FnZXMvbW9kLXNkay9zcmMvcGF0Y2gudHNgLiBgYXBwZW5kYCBhZGRzIGVudHJpZXMgdG8gYSBsaXN0CiAgd2l0aG91dCByZXN0YXRpbmcgaXQsIHdoaWNoIGlzIGhvdyBhIG1vZCBwdXRzIGFuIGl0ZW0gaW4gYSBzaG9wJ3MKICBzdG9jazsgYHJlbW92ZVZhbHVlYCB0YWtlcyBhbiBlbnRyeSBvdXQgYWdhaW4uCi0gTW9kaWZ5aW5nIGEgcmVjb3JkIHlvdSBkbyBub3Qgb3duIHJlcXVpcmVzIGRlY2xhcmluZyBpdHMgb3duZXIgaW4KICBgZGVwZW5kZW5jaWVzYC4gV2l0aG91dCBpdCwgdGhhdCBwYXRjaCwgcmVwbGFjZW1lbnQgb3IgcmVtb3ZhbCBpcwogIHJlZnVzZWQuCi0gQSByZWZ1c2VkIG9wIGlzIHJlcG9ydGVkIG9uIHRoZSBtb2QncyByb3cgaW4gdGhlIE1vZHMgc2NyZWVuLCBhbmQgdGhlCiAgcmVzdCBvZiB0aGUgbW9kIHN0aWxsIGxvYWRzLgoKIyMjIyBXaGF0IGEgcmVmIGxvb2tzIGxpa2Ugd2hlbiBjb3JlIHNoaXBzIHRoZSBuYW1lIHR3aWNlCgpBIHJlZiBpcyBgPHBhY2s+OjxzbHVnIG9mIHRoZSByZWNvcmQncyBpZGVudGl0eT5gLiBGb3IgbW9zdCBmaWxlcyB0aGF0CmlkZW50aXR5IGlzIHRoZSByZWNvcmQncyBgbmFtZWAsIHNvIGBjb3JlOmtvYm9sZGAgaXMgYSBtb25zdGVyIGFuZApgbXlwYWNrOmZyb3N0LXd5cm1gIGlzIHlvdXJzLiBUd28gY2FzZXMgbmVlZCBtb3JlOgoKLSAqKkZpbGVzIGtleWVkIGJ5IHNvbWV0aGluZyBvdGhlciB0aGFuIGBuYW1lYC4qKiBgc3RvcmVgIGlzIGtleWVkIGJ5IGl0cwogIGBTVE9SRV8qYCBjb2RlLCBgYnJhbmRgIGFuZCBgc2xheWAgYnkgYGNvZGVgLCBgb2JqZWN0X2Jhc2VgIGJ5IHR2YWwsCiAgYGNvbnN0YW50c2AgYnkgdGhlIGZpbGUgaXRzZWxmIChgY29yZTpjb25zdGFudHNgLCB3aGljaCBpcyB3aGF0IGEKICBgZmllbGRQYXRjaGAgYWdhaW5zdCBhIGdhbWUgY29uc3RhbnQgdGFyZ2V0cykuIFRoZSBmdWxsIHRhYmxlIGlzCiAgYHBhY2thZ2VzL21vZC1zZGsvc3JjL3JlY29yZC1rZXkudHNgOyB0aGUgbG9hZGVyIG5hbWVzIHRoZSBpZGVudGl0eSBpbgogIGV2ZXJ5IGVycm9yIGl0IHJlcG9ydHMsIHNvIHlvdSByYXJlbHkgaGF2ZSB0byBsb29rIGl0IHVwLgotICoqTmFtZXMgY29yZSBnZW51aW5lbHkgcmVwZWF0cy4qKiBgZWdvX2l0ZW1gIHNoaXBzICJvZiBBY2lkIiBtb3JlIHRoYW4KICBvbmNlIC0gb25lIGZvciBtZWxlZSB3ZWFwb25zLCBvbmUgZm9yIGFtbXVuaXRpb24gLSBzbyBgY29yZTpvZi1hY2lkYAogIG5hbWVzIG5laXRoZXIuIEFkZCBhIGAjYCBhbmQgdGhlIGl0ZW0gdHlwZXMgaXQgYXBwbGllcyB0bzoKICBgY29yZTpvZi1hY2lkI3Nob3QtYXJyb3ctYm9sdGAuIFdyaXRlIHRoZSBwbGFpbiByZWYgYW5kIHRoZSBsb2FkZXIKICByZWZ1c2VzIGl0ICphbmQgbGlzdHMgdGhlIG9uZXMgdGhhdCB3b3JrKiwgc28gdGhlIGVycm9yIHRlbGxzIHlvdSB3aGF0CiAgdG8gdHlwZS4KClRoZSBgKmAgYW5kIGArYCBpbiBhbiBBbmdiYW5kIG5hbWUgYXJlIHBhcnQgb2YgaXQ6IGAqSGVhbGluZypgIGlzCmBjb3JlOnBvdGlvbi0tc3Rhci1oZWFsaW5nLXN0YXJgLCBkaXN0aW5jdCBmcm9tIGBIZWFsaW5nYC4KCiMjIyMgQWRkaW5nIHlvdXIgb3duIGZpZWxkcyB0byBhIGNvcmUgcmVjb3JkCgpBIHBhdGNoIGlzIG5vdCBsaW1pdGVkIHRvIHRoZSBmaWVsZHMgY29yZSBkZWZpbmVzLiBZb3UgY2FuIGludHJvZHVjZSB5b3VyIG93biAtCmRlY2xhcmUgdGhlbSBpbiB5b3VyIG1hbmlmZXN0LCBhbmQgd3JpdGUgdGhlbSBuYW1lc3BhY2VkIHdpdGggeW91ciBtb2QgaWQuCgpgYGBqc29uCiJmaWVsZHMiOiBbCiAgeyAibmFtZSI6ICJibGVlZCIsICJmaWxlcyI6IFsib2JqZWN0IiwgImVnb19pdGVtIl0sICJ0eXBlIjogIm9iamVjdCIsCiAgICAibGFiZWwiOiAiQmxlZWQiIH0KXQpgYGAKCmBgYGpzb24KewogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpzd29yZC0tZGFnZ2VyIjogWwogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJhdHRhY2suaGQiLCAidmFsdWUiOiAiMWQ1IiB9LAogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJnb3JlOmJsZWVkIiwKICAgICAgICAidmFsdWUiOiB7ICJkaWNlIjogIjFkMyIsICJ0dXJucyI6IDUgfSB9CiAgICBdCiAgfQp9CmBgYAoKVGhlIGZpcnN0IG9wIGNoYW5nZXMgYSBmaWVsZCBjb3JlIG93bnMsIHNvIHRoZSBkYWdnZXIgbm93IHJvbGxzIDFkNS4gVGhlIHNlY29uZCBhZGRzIGEgZmllbGQgY29yZSBkb2VzIG5vdCBoYXZlLCBhbmQgYSBwbHVnaW4gcmVhZHMgaXQgYmFjayBhcyBga2luZC5leHRbImdvcmU6YmxlZWQiXWAuCgoqKldoeSBuYW1lc3BhY2VkLioqIFdpdGhvdXQgYSBuYW1lc3BhY2UsIHdoaWNoZXZlciBtb2Qgc2hpcHBlZCBmaXJzdCB3b3VsZCB0YWtlIGBibGVlZGAsIGFuZCBldmVyeSBsYXRlciBtb2Qgd291bGQgZWl0aGVyIGNvbGxpZGUgd2l0aCBpdCBvciB3b3JrIGFyb3VuZCBpdC4gUXVhbGlmeWluZyB0aGUgbmFtZSB3aXRoIHlvdXIgbW9kIGlkIG1ha2VzIHRoZSBjb2xsaXNpb24gaW1wb3NzaWJsZSBhbmQgbWFrZXMgZGVsaWJlcmF0ZSBpbnRlcm9wIHBvc3NpYmxlOiB3cml0aW5nIGBnb3JlOmJsZWVkYCBmcm9tIGEgZGlmZmVyZW50IG1vZCBpcyBjbGVhcmx5IGFuIGF0dGVtcHQgdG8gZXh0ZW5kICpnb3JlJ3MqIGZpZWxkLiBUaGUgdm9jYWJ1bGFyeSByZWdpc3RyeSBhbHJlYWR5IHVzZXMgdGhlIHNhbWUgcnVsZSBmb3IgdGVybXMgKGBnb3JlOmx1Y2tgKS4KCioqV3JpdGluZyBhbm90aGVyIG1vZCdzIGZpZWxkLioqIFRvIHdyaXRlIGBnb3JlOmJsZWVkYCBmcm9tIGEgbW9kIG90aGVyIHRoYW4gYGdvcmVgLCBkZWNsYXJlIGBnb3JlYCBpbiBgZGVwZW5kZW5jaWVzYCBvciBgb3B0aW9uYWxEZXBlbmRlbmNpZXNgLiBPdGhlcndpc2UgdGhlIHdyaXRlIGlzIHJlZnVzZWQsIHRoZSBmaWVsZCBpcyByb2xsZWQgYmFjaywgYW5kIHRoZSBmYXVsdCBuYW1lcyB5b3VyIG1vZC4gTGF0ZXIgZWRpdHMgdG8gdGhhdCBmaWVsZCBtYWRlIGZyb20gdGhlIHJlZnVzZWQgdmFsdWUgYXJlIHJvbGxlZCBiYWNrIHRvby4KCioqV2h5IGRlY2xhcmVkLioqIEEgbmFtZXNwYWNlZCBrZXkgdGhhdCBubyBsb2FkZWQgbW9kIGRlY2xhcmVzIGlzIHN0cmlwcGVkIGF0IGNvbXBvc2l0aW9uIGFuZCByZXBvcnRlZCBieSBuYW1lLCBhbmQgc28gaXMgb25lIHdyaXR0ZW4gb250byBhIGZpbGUgdGhlIGRlY2xhcmF0aW9uIGRvZXMgbm90IGxpc3QsIG9yIG9uZSB3aG9zZSBzaGFwZSBkb2VzIG5vdCBtYXRjaCBpdHMgYHR5cGVgLiBUaGUgZGVjbGFyYXRpb24gY29zdHMgb25lIG1hbmlmZXN0IGxpbmUgYW5kIGdldHMgeW91IHRoYXQgZXJyb3IgbWVzc2FnZS4gV2l0aG91dCBpdCwgYSB0eXBvIGxvb2tzIGV4YWN0bHkgbGlrZSBhIGRlbGliZXJhdGUgbmV3IGZpZWxkLCBzbyB5b3Ugd291bGQgc2VlIHlvdXIgZGF0YSBhcnJpdmUgYW5kIGNvbmNsdWRlIHRoZSBwYXRjaCB3b3JrZWQuCgpBbiAqdW5xdWFsaWZpZWQqIGtleSBjb3JlIGRvZXMgbm90IGtub3cgaXMgbm90IHRyZWF0ZWQgYXMgYSBmaWVsZCBhdCBhbGwgKGBhdGFja2AgaXMgYSBtaXNzcGVsbGluZyBvZiBgYXR0YWNrYCwgbm90IGEgbmV3IGF0dHJpYnV0ZSksIGFuZCB0aGUgZ2FtZSByZXBvcnRzIGl0IHdpdGggY29yZSdzIG5lYXJlc3QgcmVhbCBmaWVsZCBuYW1lZC4KCkEgZHJvcHBlZCBmaWVsZCBjb3N0cyBvbmx5IHRoYXQgZmllbGQ6IGV2ZXJ5dGhpbmcgZWxzZSB0aGUgcGF0Y2ggZGlkIHN0aWxsIGFwcGxpZXMuCgpgZXh0YCBpcyBhYnNlbnQgZW50aXJlbHkgb24gYW4gdW5tb2RkZWQgcmVjb3JkLCBzbyBpZiBpdCBpcyBwcmVzZW50LCBhIG1vZCBwdXQgc29tZXRoaW5nIHRoZXJlLiBJdCBob2xkcyBvbmx5IG1vZCBrZXlzLiBDb3JlJ3Mgb3duIGZpZWxkcyBhcmUgbmV2ZXIgY29waWVkIGludG8gaXQsIGJlY2F1c2UgYSBtb2QgcmVhZGluZyBhIHByZS1iaW5kIGNvcHkgb2YgYSBmaWVsZCBpdCBkaWQgbm90IGFkZCB3b3VsZCBiZSByZWFkaW5nIGEgdmFsdWUgdGhhdCBjYW4gZGlzYWdyZWUgd2l0aCB0aGUgYm91bmQgb25lIGZvcmV2ZXIgd2l0aG91dCBlaXRoZXIgYmVpbmcgd3JvbmcuIEl0IGlzIGZyb3plbiwgc28gb25lIG1vZCBjYW5ub3QgcmV3cml0ZSB3aGF0IGFub3RoZXIgcmVhZHMuCgpgZmllbGRzYCBlbnRyaWVzIHRha2U6Cgp8IGtleSB8IHJlcXVpcmVkIHwgbWVhbmluZyB8CnwtLS18LS0tfC0tLXwKfCBgbmFtZWAgfCB5ZXMgfCBiYXJlIG5hbWUsIG5vIGNvbG9uIC0gdGhlIG5hbWVzcGFjZSBpcyBhZGRlZCBmb3IgeW91IHwKfCBgZmlsZXNgIHwgeWVzIHwgdGhlIHJlY29yZCBmaWxlcyBpdCBtYXkgYXBwZWFyIG9uOyBhIG1pc3BsYWNlbWVudCBpcyBhbiBlcnJvciB8CnwgYHR5cGVgIHwgbm8gfCBgc3RyaW5nYCwgYG51bWJlcmAsIGBib29sZWFuYCwgYG9iamVjdGAsIGBhcnJheWAsIG9yIGBhbnlgIHwKfCBgbGFiZWxgLCBgZGVzY2AgfCBubyB8IGZvciBhIG1vZCBtYW5hZ2VyIG9yIGEgY2hhcmFjdGVyIHNoZWV0IHwKQ29yZSBuZXZlciByZWFkcyBgZXh0YC4gVGhlIGdhbWUgZG9lcyBub3Qga25vdyB3aGF0ICJibGVlZCIgbWVhbnMsIHNvIGRhdGEgYWxvbmUgY2hhbmdlcyBub3RoaW5nLCBhbmQgYSBtb2QgdGhhdCBhZGRzIHRoZSBmaWVsZCBhbHNvIHN1cHBsaWVzIHRoZSBiZWhhdmlvdXI6IGEgYHJlZ2lzdHJ5OmVmZmVjdGAgaGFuZGxlciBmb3Igd2hhdCBibGVlZGluZyBkb2VzLCBvciBhIGByZWdpc3RyeTpibG93YCBoYW5kbGVyIGZvciBhIG1vbnN0ZXIgYXR0YWNrIHRoYXQgYXBwbGllcyBpdC4KCldoaWNoIGtleXMgY291bnQgYXMgY29yZSdzIGlzIGRlcml2ZWQgZnJvbSBjb3JlJ3Mgb3duIGdhbWVkYXRhIHJhdGhlciB0aGFuIGRlY2xhcmVkIGJ5IGhhbmQgKGBwYWNrYWdlcy9jb3JlL3NyYy9tb2QvcmVjb3JkLWtleXMudHNgLCBnZW5lcmF0ZWQgYW5kIHJlLWRlcml2ZWQgYnkgaXRzIHRlc3QgaW4gYm90aCBkaXJlY3Rpb25zKSwgc28gdGhlIGJvdW5kYXJ5IGNhbm5vdCBkcmlmdCBhcyB0aGUgcGFjayBncm93cy4KCj4gRXZlcnkgcmVjb3JkIG9mIGV2ZXJ5IHNoaXBwZWQgZmlsZSBjYW4gbm93IGJlIGFkZHJlc3NlZCBieSBhIHJlZi4gYGhpc3RvcnlgIHdhcyB0aGUgbGFzdCB0byBnZXQgb25lLCBvbiAyMDI2LTEwLTAzOiBhIGhpc3RvcnkgcmVjb3JkJ3MgcmVmIGlzIGl0cyBjaGFydCBhbmQgcm9sbCwgYXMgaW4gYGNvcmU6NTAtLTEwMGAuIFVudGlsIDIwMjYtMDctMjkgYSBwZXItcmVjb3JkIG9wIGFpbWVkIGF0IGFueSBvZiB0aGUgMjAgbm9uLW5hbWUta2V5ZWQgZmlsZXMgd2FzIHNpbGVudGx5IGRyb3BwZWQsIGFuZCB1bnRpbCAyMDI2LTA4LTA4IGEgZnVydGhlciA3MyBpbmRpdmlkdWFsIHJlY29yZHMsIDYxIG9mIGBlZ29faXRlbWAncyAxMDcgYW1vbmcgdGhlbSwgY291bGQgbm90IGJlIGFkZHJlc3NlZCBieSBhbnkgcmVmIGF0IGFsbC4gYE1PRF9SRUFDSC5tZGAgY2FycmllcyB0aGUgbWVhc3VyZW1lbnQuCgpUb3RhbCBjb252ZXJzaW9ucyBhcmUgdGhlIHNhbWUgbWVjaGFuaXNtIGF0IGZ1bGwgdGhyb3R0bGU6IGRlcGVuZCBvbiBgY29yZWAsIHJlcGxhY2Ugb3IgcmVtb3ZlIHdoYXQgeW91IGRvIG5vdCB3YW50LCBhbmQgYWRkIHlvdXIgb3duIHdvcmxkLgojIyMgQWRkaW5nIHRoaW5ncyB0aGF0IGRvIG5vdCBleGlzdCBpbiB0aGUgYmFzZSBnYW1lCgpUaGVyZSBhcmUgdHdvIGxldmVsczoKCjEuIE5ldyByZWNvcmRzIG9mIGV4aXN0aW5nIHR5cGVzICh0aGUgSlNPTiBhYm92ZSk6IHB1cmUgZGF0YSwgc2FmZSBieSBjb25zdHJ1Y3Rpb24sIGFuZCB2YWxpZGF0ZWQgYWdhaW5zdCB0aGUgc2FtZSBzY2hlbWFzIGNvcmUgdXNlcy4KMi4gTmV3IGNhcGFiaWxpdGllczogbmV3IGVmZmVjdCBvcGNvZGVzLCBuZXcgY29tbWFuZHMsIG5ldyByb29tIGJ1aWxkZXJzLCBtb25zdGVyLUFJIG92ZXJyaWRlcywgbmV3IHZvY2FidWxhcnkgdGVybXMuIFRoZXNlIGdvIHRocm91Z2ggdGhlIGNhcGFiaWxpdHktZ2F0ZWQgcmVnaXN0cnkgaG9zdCAoYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCksIGFuZCB0aGV5IG5lZWQgYSAqKnRydXN0ZWQgaW4tcHJvY2VzcyoqIHBsdWdpbiwgeW91ciBtb2QgZm9sZGVyJ3MgYHBsdWdpbi5qc2AsIG5vdCB0aGUgc2FuZGJveGVkIFdvcmtlciB0aWVyLgoKICAgQSBXb3JrZXIgaXMgYXN5bmNocm9ub3VzIGJ5IGNvbnN0cnVjdGlvbiwgc28gaXQgY2Fubm90IHN1cHBseSBhIGhhbmRsZXIgdGhhdCBydW5zIHN5bmNocm9ub3VzbHkgd2l0aCBsaXZlIGBybmdgIC8gYGNodW5rYCAvIGBwbGF5ZXJgIGFjY2VzcyBkZWVwIGluc2lkZSB0aGUgdHVybi4gVGhlIHNhbmRib3hlZCB0aWVyIGtlZXBzIHRoZSByZWFjdGl2ZSBwZXJjZWl2ZS9hY3QvZXZlbnQgc3VyZmFjZSBhbmQgbm9uZSBvZiB0aGUgcmVnaXN0cmllcy4KCiAgIFRydXN0IGlzIGV4cGxpY2l0OiB0aGUgcGx1Z2luIGRlY2xhcmVzIGVhY2ggYHJlZ2lzdHJ5OipgIGNhcGFiaWxpdHkgaW4gaXRzIG1hbmlmZXN0LCBhbmQgdGhlIHBsYXllciBhZ3JlZXMgdG8gdGhlIGxpc3Qgd2hlbiB0dXJuaW5nIHRoZSBtb2Qgb24uIEV4cGxpY2l0IGlzIG5vdCB0aGUgc2FtZSBhcyBlbmZvcmNlZCwgdGhvdWdoLiBUaGUgY2FwYWJpbGl0eSBnYXRlcyB0aGUgZmFjYWRlLCB3aGlsZSB0aGUgc2FtZSBsaXZlIHJlZ2lzdHJpZXMgYWxzbyBhcnJpdmUgdW5nYXRlZCB0aHJvdWdoIGBjdHguY29yZWAsIGBjdHguc3RhdGVgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgLCBiZWNhdXNlIGEgbW9kIGlzIG1lYW50IHRvIGJlIGFibGUgdG8gcmVhZCBldmVyeXRoaW5nIHdpdGhvdXQgZGVjbGFyaW5nIGFueXRoaW5nLiBQTFVHSU5TLm1kJ3MgIldoYXQgYSBjYXBhYmlsaXR5IGdhdGVzLCBhbmQgd2hhdCBpdCBkb2VzIG5vdCIgaGFzIHRoZSB0YWJsZSBvZiB0d2lucyBhbmQgZXhwbGFpbnMgd2h5IHRoZSBib3VuZGFyeSBpcyB0aGUgaW5zdGFsbCByYXRoZXIgdGhhbiB0aGUgbGlzdC4KCj4gQSBtb2QgaW5zdGFsbGVkIGZyb20gZGlzayBjYW4gcmVhY2ggdGhlIHJlZ2lzdHJpZXMuIEJlZm9yZSB0aGUgcGx1Z2luIEFCSSBsYW5kZWQsIGJvdGggY29kZSBwYXRocyB3ZXJlIGJ1aWxkLXRpbWUgVml0ZSBnbG9icyBvdmVyIGBwYWNrYWdlcy93ZWIvbW9kcy9gLCBzbyBvbmx5IGEgbW9kIGNvbXBpbGVkIGludG8gdGhlIHdlYiBidW5kbGUgY291bGQgcmVhY2ggYSByZWdpc3RyeSwgYW5kIGEgbW9kIGluc3RhbGxlZCBmcm9tIGRpc2sgY291bGQgc3VwcGx5IGdhbWVkYXRhIEpTT04gYW5kIG5vdGhpbmcgZWxzZS4gTm93IGEgbW9kIGZvbGRlciBzaGlwcyBgcGx1Z2luLmpzYCBiZXNpZGUgaXRzIGBtYW5pZmVzdC5qc29uYCwgYW5kIHRoZSBob3N0IGxvYWRzIGl0IGZyb20gd2hlcmV2ZXIgdGhlIGZvbGRlciBpcyAodGhlIGdhbWUncyBvd24gYG5lby1hbmdiYW5kOi8vYCBhZGRyZXNzIG9uIGRlc2t0b3AsIGEgcmV3cml0dGVuIG1vZHVsZSBncmFwaCBpbiBhIGJyb3dzZXIgdGFiKSBhbmQgY2FsbHMgYHJlZ2lzdGVyKGhvc3QsIGN0eClgIG9uIGl0IGxpa2UgYW55IG90aGVyIHBsdWdpbi4gYHBhY2thZ2VzL3dlYi9zcmMvbW9kLXBsdWdpbi50c2AgaXMgdGhlIGNvbnRyYWN0LCBhbmQgYG1haW4udHNgJ3MgYGFjdGl2ZU1vZENvZGUoKS5wbHVnaW5zYCBsb29wIGlzIHRoZSBjYWxsZXIuIFRoZSBzaGlwcGVkIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QgcmVhY2hlcyBgcmVnaXN0cnk6c3RvcmVgIHRoaXMgd2F5LCBmcm9tIGl0cyBvd24gcmVwb3NpdG9yeSwgdGhyb3VnaCB0aGUgc2FtZSBpbnN0YWxsIHJvdXRlIGFueW9uZSdzIG1vZCB1c2VzLgo+Cj4gVGhlIHJlZ2lzdHJpZXMgc3RpbGwgY292ZXIgYSBzZXQgb2YgZG9tYWlucyByYXRoZXIgdGhhbiB0aGUgd2hvbGUgZW5naW5lLCBhbmQgbW9zdCBvZiB0aGUgcG9ydCdzIGRpc3BhdGNoIHRhYmxlcyBoYXZlIG5vIHJlZ2lzdHJ5IGF0IGFsbC4gYE1PRF9SRUFDSC5tZGAgaGFzIHRoZSBjZW5zdXM7IGNoZWNrIGl0IGJlZm9yZSBidWlsZGluZyBvbiBhIGNhcGFiaWxpdHkgY2xhaW0uCiMjIFZlcnNpb25pbmcgYW5kIHN0YWJpbGl0eQoKYEBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGtgIGlzIHRoZSB2ZXJzaW9uZWQgc3VyZmFjZSBtb2QgYXV0aG9ycyBidWlsZAphZ2FpbnN0LiBUeXBlcyBhcmUgZXhwb3J0ZWQgZm9yIFR5cGVTY3JpcHQgYXV0aG9yczsgZXZlcnl0aGluZyBpcyBwbGFpbgpKU09OIGF0IHJlc3QuIEJyZWFraW5nIGNoYW5nZXMgdG8gcGFjayBzZW1hbnRpY3MgYnVtcCB0aGUgU0RLIG1ham9yCnZlcnNpb24gYW5kIGFyZSBjYWxsZWQgb3V0IGluIHJlbGVhc2Ugbm90ZXMuCgoqKmBNT0RfQ09NUEFUSUJJTElUWS5tZGAgaXMgdGhlIHBhZ2UgdGhhdCBhbnN3ZXJzICJ3aWxsIG15IG1vZCBzdGlsbCB3b3JrIi4qKgpJbiBvbmUgbGluZTogYSBkYXRhLW9ubHkgbW9kIHNob3VsZCBzdXJ2aXZlIGVuZ2luZSByZWxlYXNlcyB3aXRob3V0IGJlaW5nCnJlcHVibGlzaGVkLCBhbmQgYSBtb2QgdGhhdCBzaGlwcyBjb2RlIGdldHMgYSByZWxlYXNlJ3Mgd2FybmluZyBiZWZvcmUgYW4gQUJJCmNoYW5nZSBzdHJhbmRzIGl0LiBUaGF0IEFCSSBpbmNsdWRlcyBhIG5hbWVkIHN1YnNldCBvZiBgY3R4LmNvcmVgOyB0aGUgcmVzdCBvZgp0aGF0IG5hbWVzcGFjZSBpcyBhbiBlc2NhcGUgaGF0Y2guIFRoYXQgcGFnZSBoYXMgdGhlIG1lY2hhbmlzbXMsIHRoZQptZWFzdXJlbWVudHMgYmVoaW5kIHRoZW0sIGFuZCB0aGUgbGlzdCBvZiBndWFyYW50ZWVkIG5hbWVzLgoKIyMgTGljZW5zaW5nIGZvciBtb2QgYXV0aG9ycwoKVGhlIGVuZ2luZSBpcyBkdWFsLWxpY2Vuc2VkIEdQTHYyLW9yLUFuZ2JhbmQtbGljZW5zZSAoc2VlIExJQ0VOU0UubWQpLgpEZWNsYXJhdGl2ZSBjb250ZW50IHBhY2tzIGFuZCB0aWxlIHBhY2tzIGFyZSB5b3VyIG93biBpbmRlcGVuZGVudCB3b3JrczsKbGljZW5zZSB0aGVtIGFzIHlvdSB3aXNoLiBEaXN0cmlidXRlZCBzY3JpcHRlZCBwbHVnaW5zIGFyZSBzYWZlc3QKdHJlYXRlZCBhcyBHUEx2MiBkZXJpdmF0aXZlcy4gU2VlIHRoZSBub3RlIGF0IHRoZSBlbmQgb2YgZG9jcy9NT0RTLm1kLgo="
  },
  {
    "id": "requirements",
    "path": "REQUIREMENTS.md",
    "audience": "advanced",
    "title": "Requirements",
    "note": "The rules the game enforces before it installs a mod.",
    "encoded": "PCEtLSBHRU5FUkFURUQgZnJvbSBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHMgLSBkbyBub3QgZWRpdCBieSBoYW5kLiAtLT4KPCEtLSBSdW46IG5vZGUgcGFja2FnZXMvbW9kLXNkay9iaW4vbmVvLWFuZ2JhbmQtbW9kLWNoZWNrLm1qcyAtLXdyaXRlLWRvY3MgLS0+CgojIFdoYXQgYSBtb2QgbXVzdCBwcm92aWRlCgpFdmVyeSBydWxlIGJlbG93IGlzIGNvZGUgaW4gYHBhY2thZ2VzL21vZC1zZGsvc3JjL3N0YW5kYXJkcy50c2AuIFRoZSBzYW1lIGZ1bmN0aW9uIGdlbmVyYXRlcyB0aGVzZSBkb2NzLCBydW5zIHdoZW4gdGhlIGdhbWUgaW5zdGFsbHMgYSBtb2QsIGFuZCBydW5zIHdoZW4gYG5lby1hbmdiYW5kLW1vZC1jaGVja2AgY2hlY2tzIHlvdXIgbW9kIGJlZm9yZSB5b3UgcHVibGlzaC4gSWYgYSBydWxlIGNoYW5nZXMsIHRoZSB0ZXh0IGhlcmUgY2hhbmdlcyB3aXRoIGl0LCBhbmQgYSB0ZXN0IGZhaWxzIGlmIHRoZSB0d28gZXZlciBkaXNhZ3JlZS4KCkNoZWNrIHlvdXIgbW9kOgoKYGBgCm5weCBuZW8tYW5nYmFuZC1tb2QtY2hlY2sgcGF0aC90by95b3VyLW1vZApgYGAKCiMjIFJlcXVpcmVkCgpBIG1vZCB0aGF0IGZhaWxzIGFueSBvZiB0aGVzZSBjYW5ub3Qgd29yaywgYW5kIHRoZSBnYW1lIHJlZnVzZXMgdG8gaW5zdGFsbCBpdC4KCiMjIyBTaGlwIG1hbmlmZXN0Lmpzb24gYXQgdGhlIHJvb3Qgb2YgdGhlIG1vZCBmb2xkZXIKCmBtYW5pZmVzdC1wcmVzZW50YAoKSXQgaXMgaG93IHRoZSBnYW1lIHJlY29nbmlzZXMgYSBmb2xkZXIgYXMgYSBtb2QgYXQgYWxsLiBBIGZvbGRlciB3aXRob3V0IG9uZSBpcyBub3QgbG9hZGVkLCBub3QgbGlzdGVkLCBhbmQgbm90IHJlcG9ydGVkIGFzIGJyb2tlbiAtIGl0IGlzIHNpbXBseSBub3QgYSBtb2QuCgojIyMgTWFrZSBtYW5pZmVzdC5qc29uIHZhbGlkIEpTT04KCmBtYW5pZmVzdC1qc29uYAoKSXQgaXMgcmVhZCBiZWZvcmUgYW55dGhpbmcgZWxzZS4gQSB0cmFpbGluZyBjb21tYSBzdG9wcyB0aGUgd2hvbGUgbW9kIGxvYWRpbmcuCgojIyMgRGVjbGFyZSBpZCwgbmFtZSwgdmVyc2lvbiBhbmQgc2hhcGUsIGFuZCBub3RoaW5nIG1hbGZvcm1lZAoKYG1hbmlmZXN0LWZpZWxkc2AKClRoZXNlIGZvdXIgYXJlIHdoYXQgdGhlIG1hbmFnZXIgbGlzdHMgYW5kIHdoYXQgdGhlIGxvYWRlciBrZXlzIGV2ZXJ5dGhpbmcgYnkuIFRoZSBjaGVjayB1c2VzIHRoZSBnYW1lJ3Mgb3duIHZhbGlkYXRvciwgc28gYSBtYW5pZmVzdCB0aGF0IHBhc3NlcyBoZXJlIHBhc3NlcyBhdCBpbnN0YWxsIHRvby4KCiMjIyBTYXkgd2hlcmUgdGhlIG1vZCBsaXZlcywgaW4gYHJlcG9zaXRvcnlgCgpgZGVjbGFyZS1hLXJlcG9zaXRvcnlgCgpJdCBpZGVudGlmaWVzIHRoZSBtb2QgaG93ZXZlciBpdCB3YXMgb2J0YWluZWQuIFRoZSBnYW1lIHBpbnMgYW4gaW5zdGFsbGVkIG1vZCB0byB0aGUgcmVwb3NpdG9yeSBpdCBjYW1lIGZyb20gYW5kIHdpbGwgbm90IGxldCBhIGRpZmZlcmVudCBvbmUgcmVwbGFjZSBpdCwgc28gYSBtb2QgdGhhdCBuYW1lcyBubyByZXBvc2l0b3J5IGNhbiBiZSBxdWlldGx5IG92ZXJ3cml0dGVuIGJ5IGFueXRoaW5nIGNsYWltaW5nIGl0cyBpZC4gSXQgaXMgYWxzbyB0aGUgb25seSB3YXkgYW4gdXBkYXRlIGNhbiBldmVyIGJlIG9mZmVyZWQsIGFuZCB0aGUgb25seSBwbGFjZSBhIHBsYXllciBjYW4gZ28gdG8gcmVhZCBhYm91dCB0aGUgbW9kLiBBcmNoaXZlcyBuZWVkIGl0IGp1c3QgYXMgY2hlY2tvdXRzIGRvOiBhIG1vZCBoYW5kZWQgb3ZlciBhcyBhIHppcCBpcyB0aGUgc2FtZSBtb2QsIGFuZCBpdCBzaG91bGQgY2FycnkgdGhlIHNhbWUgaW5mb3JtYXRpb24gYWJvdXQgaXRzZWxmIGFzIHRoZSBmaWxlcyBmZXRjaGVkIGZyb20gaXRzIHJlcG9zaXRvcnkuCgojIyMgTmFtZSB0aGUgYXV0aG9yCgpgY3JlZGl0LWFuLWF1dGhvcmAKClRoZSBnYW1lIHNob3dzIGl0IGJlc2lkZSB0aGUgbW9kJ3MgbmFtZSwgc28gYSBwbGF5ZXIgY2FuIHRlbGwgdHdvIG1vZHMgb2YgdGhlIHNhbWUgbmFtZSBhcGFydCBhbmQga25vd3Mgd2hvc2Ugd29yayB0aGV5IGFyZSBhYm91dCB0byBydW4uIFVzZSB0aGUgbmFtZSB5b3Ugd2FudCBzaG93bi4gSXQgc2hhcmVzIGEgbGluZSB3aXRoIHRoZSBtb2QncyBuYW1lIGFuZCB2ZXJzaW9uLCBzbyBrZWVwIGl0IHNob3J0IGFuZCBwdXQgYW55dGhpbmcgbG9uZ2VyIGluIGBkZXNjcmlwdGlvbmAuCgojIyMgRGVjbGFyZSB0aGUgZW5naW5lIHJhbmdlIHRoZSBtb2Qgd2FzIHdyaXR0ZW4gYWdhaW5zdAoKYGVuZ2luZS1yYW5nZWAKCldpdGhvdXQgaXQgdGhlIG1vZCBpcyBvZmZlcmVkIHRvIGV2ZXJ5IHZlcnNpb24gb2YgdGhlIGdhbWUgZm9yZXZlciwgaW5jbHVkaW5nIHRoZSBvbmUgdGhhdCBjaGFuZ2VzIHNvbWV0aGluZyBpdCBkZXBlbmRzIG9uLiBXaXRoIGl0LCBhIHBsYXllciBpcyB0b2xkIHRoZSBtb2QgaXMgdG9vIG9sZCBpbnN0ZWFkIG9mIHdhdGNoaW5nIGl0IG1pc2JlaGF2ZS4gRXZlcnkgbW9kIHRoYXQgaGFzIHNoaXBwZWQgZGVjbGFyZWQgb25lLCBhbmQgdGhlIG1vZHMgd2l0aG91dCBvbmUgd2VyZSB0aGUgb25lcyBubyBjaGVjayBoYWQgY292ZXJlZC4KCiMjIyBSZXF1ZXN0IG9ubHkgY2FwYWJpbGl0aWVzIHRoZSBnYW1lIGtub3dzCgpgY2FwYWJpbGl0aWVzLXJlY29nbml6ZWRgCgpBIGNhcGFiaWxpdHkgc3RyaW5nIGlzIHdoYXQgdGhlIHBsYXllciByZWFkcyBiZWZvcmUgYWdyZWVpbmcgdG8gaW5zdGFsbCwgYW5kIGl0IGlzIHRoZSBnYXRlIHRoZSBydW50aW1lIG9wZW5zLiBBbiB1bnJlY29nbml6ZWQgc3RyaW5nLCBvciBhIGNhcGFiaWxpdHkgb24gYSBwYWNrIHRoYXQgY2Fubm90IHJ1biBjb2RlLCBpcyByZWZ1c2VkIHdoZW4gdGhlIGdhbWUgbG9hZHMgdGhlIHBsdWdpbiwgd2hpY2ggaXMgYWZ0ZXIgdGhlIHBsYXllciBoYXMgYWxyZWFkeSBpbnN0YWxsZWQgaXQuIFRoaXMgY2hlY2sgY2FsbHMgQ2FwYWJpbGl0eVNldC5mcm9tTWFuaWZlc3QsIHRoZSBzYW1lIGZ1bmN0aW9uIHRoZSBsb2FkZXIgY2FsbHMsIHNvIGEgdHlwbyBjYW5ub3QgcGFzcyBoZXJlIGFuZCB0aGVuIGZhaWwgYXQgbG9hZC4KCiMjIyBEZWNsYXJlIG1vZEFwaSBpZiB0aGUgbW9kIHNoaXBzIHBsdWdpbi5qcwoKYHBsdWdpbi1kZWNsYXJlcy1tb2RhcGlgCgpUaGUgaG9zdCByZWZ1c2VzIGFuIGluY29tcGF0aWJsZSBwbHVnaW4gYmVmb3JlIGltcG9ydGluZyBpdCwgYW5kIGl0IGNhbiBvbmx5IGRvIHRoYXQgZnJvbSB0aGUgbWFuaWZlc3QsIGJlY2F1c2UgYSB2ZXJzaW9uIGNoZWNrIGluc2lkZSB0aGUgbW9kdWxlIHdvdWxkIHJ1biBhZnRlciB0aGUgbW9kdWxlJ3MgdG9wLWxldmVsIGNvZGUgYWxyZWFkeSBoYWQuIFdpdGhvdXQgbW9kQXBpIHRoZXJlIGlzIG5vdGhpbmcgdG8gY2hlY2sgYWdhaW5zdCwgYW5kIHRoZSBtb2QncyBjb2RlIGlzIGxvYWRlZCB1bmNoZWNrZWQuCgojIyMgU2F5IHRoZSBtb2QgY29udGFpbnMgY29kZSwgaWYgaXQgc2hpcHMgcGx1Z2luLmpzCgpgcGx1Z2luLWRlY2xhcmVzLWZhY2V0YAoKVGhlIG1hbmFnZXIgdGVsbHMgYSBwbGF5ZXIgd2hldGhlciBhIG1vZCBpcyBkYXRhIG9yIGNvZGUsIGFuZCB0aGF0IGFuc3dlciBkZWNpZGVzIGhvdyBtdWNoIHRoZXkgYXJlIHRydXN0aW5nLiBBIG1vZCBzaGlwcGluZyBjb2RlIHdoaWxlIHByZXNlbnRpbmcgYXMgY29udGVudCBpcyBtaXNsZWFkaW5nIHdoZXRoZXIgb3Igbm90IHRoZSBhdXRob3IgbWVhbnQgaXQgdG8gYmUuCgojIyMgRGVjbGFyZSBjb21taXR0ZWQgLnppcCBhcmNoaXZlcyBpbiBwYXlsb2FkLmFyY2hpdmVzCgpgYXJjaGl2ZXMtZGVjbGFyZWRgCgpPbmx5IHRoZSBtYW5pZmVzdCBjYW4gc2F5IHdoZXRoZXIgYSAuemlwIGlzIGEgcGFjayB0byB1bnBhY2sgb3IgYSBmaWxlIHRvIHN0b3JlIGFzIGl0IGlzOyBhIGZpbGUgbGlzdCBjYW5ub3QuIEFuIHVuZGVjbGFyZWQgYXJjaGl2ZSBpcyBpbnN0YWxsZWQgdW5vcGVuZWQsIHNvIHRoZSBtb2QgaXMgcHJlc2VudCwgbGlzdGVkIGFuZCBlbmFibGVkLCBhbmQgZG9lcyBub3RoaW5nLgoKIyMgUmVjb21tZW5kZWQKCkFkdmljZS4gTm9uZSBvZiB0aGVzZSBibG9ja3MgYW4gaW5zdGFsbDsgYWxsIG9mIHRoZW0gYXJlIHRoaW5ncyBwbGF5ZXJzIG5vdGljZS4KCiMjIyBQdWJsaXNoIHNvbWV3aGVyZSB0aGUgZ2FtZSBjYW4gY2hlY2sgZm9yIHVwZGF0ZXMKCmB1cGRhdGVzLWNhbi1iZS1vZmZlcmVkYAoKYHJlcG9zaXRvcnlgIG1heSBuYW1lIGFueSBob3N0LCBhbmQgdGhlIGdhbWUgd2lsbCBpbnN0YWxsIHRoZSBtb2QgZnJvbSBhIHppcCBlaXRoZXIgd2F5IC0gYnV0IHRoZSBvbmx5IGhvc3QgaXQgY2FuIEFTSyBmb3IgbmV3ZXIgdmVyc2lvbnMgaXMgR2l0SHViLiBBIG1vZCBwdWJsaXNoZWQgZWxzZXdoZXJlIGlzIGxpc3RlZCB3aXRoIGEgbm90ZSBzYXlpbmcgaXQgY2Fubm90IGJlIGNoZWNrZWQsIGFuZCBpdHMgcGxheWVycyB1cGRhdGUgaXQgYnkgaGFuZCBvciBub3QgYXQgYWxsLiBUaGlzIGlzIGEgbGltaXRhdGlvbiBvZiB0aGUgZ2FtZSwgbm90IGEganVkZ2VtZW50IGFib3V0IHRoZSBob3N0LgoKIyMjIFVzZSBhIHZlcnNpb24gdGhlIHVwZGF0ZSBjaGVjayBjYW4gb3JkZXIKCmB2ZXJzaW9uLW9yZGVyYWJsZWAKClVwZGF0ZXMgYXJlIG9mZmVyZWQgYnkgY29tcGFyaW5nIHZlcnNpb25zLiBPbmUgdGhhdCBjYW5ub3QgYmUgb3JkZXJlZCBhZ2FpbnN0IGl0cyBwcmVkZWNlc3NvciBpcyBuZXZlciByZXBvcnRlZCBhcyBuZXdlciwgc28gdGhlIG1vZCBzaWxlbnRseSBzdG9wcyB1cGRhdGluZy4KCiMjIyBXcml0ZSBhIGRlc2NyaXB0aW9uCgpgZGVzY3JpYmUtaXRzZWxmYAoKSXQgaXMgdGhlIG9ubHkgdGhpbmcgYSBwbGF5ZXIgaGFzIHRvIGRlY2lkZSBieSwgc2luY2Ugbm90aGluZyBlbHNlIGluIHRoZSBnYW1lIGtub3dzIHdoYXQgdGhlIG1vZCBkb2VzLgoKIyMjIFN0YXRlIGEgbGljZW5jZQoKYHN0YXRlLWEtbGljZW5jZWAKCkEgbW9kIHdpdGggbm8gbGljZW5jZSBjYW5ub3QgbGVnYWxseSBiZSByZWRpc3RyaWJ1dGVkIGJ5IGFueW9uZSwgaW5jbHVkaW5nIGEgcGxheWVyIHNoYXJpbmcgdGhlaXIgc2V0dXAuIENvbnZlcnRpbmcgc29tZWJvZHkgZWxzZSdzIGFydCBoYXMgaXRzIG93biB0ZXJtcyBvbiB0b3Agb2YgdGhhdC4K"
  },
  {
    "id": "authoring",
    "path": "AUTHORING.md",
    "audience": "advanced",
    "title": "Authoring API",
    "note": "Draft records, validation, projects, resources, and sections.",
    "encoded": "IyBBdXRob3Jpbmcgc2hvcnRjdXRzOiBkcmFmdGluZyBhIHJlY29yZCB0aGF0IGFjdHVhbGx5IHdvcmtzCgpBZGRpbmcgYSByZWNvcmQgdG8gYSBwYWNrIGlzIGVhc3k6IGl0IGlzIEpTT04sIGFuZCBjb21wb3NpdGlvbiBhY2NlcHRzIGl0LiBBZGRpbmcgYSByZWNvcmQgdGhhdCB3b3JrcyBpcyBoYXJkZXIsIGJlY2F1c2UgdGhlIHVzdWFsIG1pc3Rha2VzIHByb2R1Y2Ugbm8gZXJyb3IgbWVzc2FnZToKCi0gYW4gb2JqZWN0IHdpdGggbm8gYGFsbG9jYCBpcyBsZWdhbCwgbG9hZHMgY2xlYW5seSwgYW5kIG5ldmVyIGFwcGVhcnMgaW4gdGhlIGR1bmdlb247Ci0gYSBtb25zdGVyIHdob3NlIGBiYXNlYCBpcyBtaXNzcGVsbGVkIGlzIGxlZ2FsLCBsb2FkcyBjbGVhbmx5LCBhbmQgYmluZHMgdG8gbm90aGluZzsKLSBhIGZvcnR5LWZpcnN0IHBvdGlvbiBpcyBsZWdhbCwgbG9hZHMgY2xlYW5seSwgYW5kIHVzZXMgdXAgdGhlIGxhc3QgdW51c2VkIGZsYXZvdXIsIHNvIHNvbWUgb3RoZXIgcG90aW9uIHF1aWV0bHkgc3RvcHMgYmVpbmcgZGlzdGluZ3Vpc2hhYmxlLgoKVGhlIHBpcGVsaW5lIGNhbm5vdCByZXBvcnQgYW55IG9mIHRoYXQsIGJlY2F1c2UgaXQgaGFzIG5vIG1vZGVsIG9mIHdoYXQgYSB3b3JraW5nIHJlY29yZCBsb29rcyBsaWtlLiBDb3JlJ3Mgb3duIDMsMjc5IHJlY29yZHMgYXJlIHRoYXQgbW9kZWwsIGFuZCB0aGUgU0RLIGNvbXBhcmVzIHlvdXIgZHJhZnRzIGFnYWluc3QgdGhlbS4KCkV2ZXJ5dGhpbmcgb24gdGhpcyBwYWdlIGlzIGluIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCBhbmQgbmVlZHMgbm8KZ2FtZSBydW5uaW5nLgoKIyMgUGx1Z2luIGhvc3QgdHlwZXMKClR5cGVTY3JpcHQgcGx1Z2lucyBjYW4gaW1wb3J0IGBNb2RQbHVnaW5Db250ZXh0YCBmcm9tIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1jb3JlYCB0byB0eXBlIHRoZSBjb250ZXh0IHBhc3NlZCB0byBgcmVnaXN0ZXJgLCBgaG9va3NgLCBgaHVkYCBhbmQgYGNvbnRyb2xsZXJgLiBUaGUgc2FtZSBwYWNrYWdlIGV4cG9ydHMgYE1vZFVpYCwgYE1vZFBhbmVsYCwgYFBhbmVsS2luZFNwZWNgLCBgUGFuZWxNb3VudGAgYW5kIGBQYW5lbFN0YXRlYCBmb3IgcGFuZWxzOyBgTW9kTmV0YCwgYE1vZE5ldFJlc3BvbnNlYCBhbmQgYE1vZE5ldFNlY3JldHNgIGZvciBuZXR3b3JrIHJlcXVlc3RzIGFuZCBzZWNyZXRzOyBhbmQgYE1vZEJpcnRoU2Vzc2lvbmAgYW5kIGBCaXJ0aFJlc3VsdGAgZm9yIGNoYXJhY3RlciBjcmVhdGlvbi4gVXNlIGBpbXBvcnQgdHlwZWAgYmVjYXVzZSB0aGUgaG9zdCBwYXNzZXMgdGhlIGxpdmUgb2JqZWN0cyB0byB0aGUgcGx1Z2luIGF0IHJ1bnRpbWUuCgojIyBDb250cm9sbGVycwoKQSBjb250cm9sbGVyIGdldHMgYGN0eC5jb250cm9sbGVyYCB3aGlsZSBpdHMgbW9kIG93bnMgdGhlIGtleWJvYXJkLiBJdCBjYW4gcHVibGlzaCBpdHMgdGFzayB0aHJvdWdoIGBzZXRTdGF0dXMoeyBsYWJlbCwgcmVhc29uIH0pYCBhbmQgbWFyayB0aGUgc2F2ZSB0aHJvdWdoIGBtYXJrTm9uZGV0ZXJtaW5pc3RpYygpYCBpZiBpdCBzdGFydHMgdXNpbmcgYSBub25kZXRlcm1pbmlzdGljIHNvdXJjZS4gV2hlbiBpdCBoYXMgZmluaXNoZWQsIGl0IGNhbiBjYWxsIGBjdHguY29udHJvbGxlci5yZWxlYXNlKHJlYXNvbj8pYCB0byBnaXZlIGNvbnRyb2wgYmFjayB0byB0aGUgcGxheWVyLiBUaGUgaG9zdCB1bmluc3RhbGxzIHRoZSBzZXNzaW9uLCBjbGVhcnMgaXRzIHRpbWVyIGFuZCBjb250cm9sbGVyIHNsb3QsIGVtaXRzIGBkcml2ZXItY2hhbmdlZGAsIGFuZCBoaWRlcyB0aGUgYmFubmVyLiBUaGUgb3B0aW9uYWwgcmVhc29uIGFwcGVhcnMgaW4gdGhlIG1lc3NhZ2UgbGluZTsgd2l0aG91dCBvbmUsIHRoZSBob3N0IHNob3dzIGl0cyB1c3VhbCBrZXlib2FyZCBoYW5kLWJhY2sgbWVzc2FnZS4gQSByZXRhaW5lZCBjb250cm9sbGVyIGNvbnRleHQgY2Fubm90IHJlbGVhc2UgYW5vdGhlciBtb2QncyBjb250cm9sbGVyLiBSZXR1cm5pbmcgYG51bGxgIHN0aWxsIG1lYW5zIHRoYXQgdGhlIGNvbnRyb2xsZXIgaGFzIG5vIGNvbW1hbmQgZm9yIHRoaXMgdGljayBhbmQga2VlcHMgdGhlIGtleWJvYXJkLgoKIyMgVHdvIHdheXMgaW4sIGFuZCB0aGUgYGltcG9ydGAgaXMgb25seSBvbmUgb2YgdGhlbQoKQW4gb2ZmbGluZSB0b29sIGluc3RhbGxzIHRoZSBwYWNrYWdlIGFuZCBpbXBvcnRzIGl0LCB3aGljaCBpcyB3aGF0IGV2ZXJ5IGV4YW1wbGUKYmVsb3cgZG9lcy4gVGhhdCBwYXRoIG5lZWRzIGNvcmUncyByZWNvcmRzIGZyb20gc29tZXdoZXJlLCBhbmQgYGNvcmVSZWNvcmRzYCBpbgp0aG9zZSBleGFtcGxlcyBpcyB0aGF0OiB0aGUgcGFjaydzIEpTT04sIGtleWVkIGJ5IGZpbGUgc3RlbS4KCioqQSBwbHVnaW4gaW5zaWRlIGEgcnVubmluZyBnYW1lIHRha2VzIG5laXRoZXIgc3RlcC4qKiBBIHBsdWdpbiByZXNvbHZlcyBubyBiYXJlCnNwZWNpZmllciwgc28gdGhlIGltcG9ydCB3b3VsZCBub3Qgd29yazsgYW5kIGl0IGRvZXMgbm90IG5lZWQgYSBjb3B5IG9mIGNvcmUncwpyZWNvcmRzLCBiZWNhdXNlIHRoZSBnYW1lIGl0IGlzIHJ1bm5pbmcgaW4gYWxyZWFkeSBjb21wb3NlZCB0aGVtLiBCb3RoIGFycml2ZSBvbgpgY3R4YDoKCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHJlY29yZHMgPSBjdHguY29tcG9zZWRSZWNvcmRzOyAgICAgICAgICAgICAgLy8gdGhlIGNvcmVSZWNvcmRzIGFyZ3VtZW50CiAgaWYgKCFyZWNvcmRzKSByZXR1cm47CiAgY29uc3QgZHJhZnRlZCA9IGN0eC5hdXRob3JpbmcuZHJhZnRSZWNvcmQoICAgICAgICAvLyB0aGUgaW1wb3J0ZWQgYmFycmVsCiAgICAib2JqZWN0IiwKICAgIHsgbmFtZTogIiYgU2x1ZGdlIERhZ2dlcn4iLCB0eXBlOiAic3dvcmQiLCBsZXZlbDogMjAgfSwKICAgIHJlY29yZHMsCiAgKTsKfQpgYGAKCmBjdHguY29tcG9zZWRSZWNvcmRzYCBpcyBiZXR0ZXIgdGhhbiBhIHNoaXBwZWQgY29weSBvZiB0aGUgcGFjayB3b3VsZCBiZTogaXQgaXMKd2hhdCBUSElTIGdhbWUgY29tcG9zZWQsIHNvIGV2ZXJ5IGVuYWJsZWQgbW9kJ3MgcmVjb3JkcyBhcmUgaW4gaXQgdG9vLCBlYWNoCmNhcnJ5aW5nIGl0cyBwcm92ZW5hbmNlLiBBIHRvb2wgZHJhZnRpbmcgYWdhaW5zdCBhIGJ1bmRsZWQgc25hcHNob3QgY291bGQgbm90IHNlZQp0aGVtIGFuZCB3b3VsZCByZXBvcnQgYSByZWZlcmVuY2UgdG8gYW5vdGhlciBtb2QncyBzd29yZCBhcyBkYW5nbGluZy4gU2VlCltQTFVHSU5TLm1kXShQTFVHSU5TLm1kI2F1dGhvcmluZy1jdHhhdXRob3JpbmctYW5kLWN0eGNvbXBvc2VkcmVjb3JkcykgZm9yIHRoZQpndWFyZCBydWxlcyBhbmQgd2hhdCBlYWNoIGZpZWxkIGlzIGFic2VudCBmb3IuCgojIyBXcml0aW5nIGFub3RoZXIgbW9kJ3MgZXh0ZW5zaW9uIGZpZWxkCgpZb3VyIG1vZCBtYXkgd3JpdGUgYDxvd25lcj46PGZpZWxkPmAgb25seSBhZnRlciBkZWNsYXJpbmcgYDxvd25lcj5gIGluCmBkZXBlbmRlbmNpZXNgIG9yIGBvcHRpb25hbERlcGVuZGVuY2llc2AuIFdpdGhvdXQgdGhhdCBkZWNsYXJhdGlvbiB0aGUgd3JpdGUKaXMgcmVmdXNlZCwgdGhlIGZpZWxkIGlzIHJvbGxlZCBiYWNrLCBhbmQgdGhlIGZhdWx0IG5hbWVzIHlvdXIgbW9kOyBsYXRlciBlZGl0cwp0byB0aGF0IGZpZWxkIG1hZGUgZnJvbSB0aGUgcmVmdXNlZCB2YWx1ZSBhcmUgcm9sbGVkIGJhY2sgdG9vLiBEZWNsYXJlIHlvdXIgb3duCmZpZWxkcyB1bmRlciB5b3VyIG93biBpZCBhcyB1c3VhbC4KCi0tLQoKIyMgVGhlIG9uZS1jYWxsIHZlcnNpb24KCmBgYHRzCmltcG9ydCB7IGRyYWZ0UmVjb3JkIH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNkayI7Cgpjb25zdCB7IHJlY29yZCwgc3VnZ2VzdGlvbnMsIGZpbmRpbmdzLCBtb2RlbGxlZE9uIH0gPSBkcmFmdFJlY29yZCgKICAib2JqZWN0IiwKICB7IG5hbWU6ICImIFNsdWRnZSBEYWdnZXJ+IiwgdHlwZTogInN3b3JkIiwgbGV2ZWw6IDIwIH0sCiAgY29yZVJlY29yZHMsICAgICAgICAgIC8vIHsgb2JqZWN0OiBbLi4uXSwgb2JqZWN0X2Jhc2U6IFsuLi5dLCAuLi4gfQopOwpgYGAKCmByZWNvcmRgIGNvbWVzIGJhY2sgY29tcGxldGU6CgpgYGBqc29uCnsKICAidHlwZSI6ICJzd29yZCIsCiAgImdyYXBoaWNzIjogeyAiZ2x5cGgiOiAifCIsICJjb2xvciI6ICJXIiB9LAogICJsZXZlbCI6IDIwLAogICJ3ZWlnaHQiOiAxNDAsCiAgImNvc3QiOiAzMDAsCiAgImFsbG9jIjogeyAiY29tbW9uIjogMjAsICJtaW5tYXgiOiAiMjAgdG8gMTAwIiB9LAogICJhdHRhY2siOiB7ICJoZCI6ICIzZDUiLCAidG8taCI6ICIwIiwgInRvLWQiOiAiMCIgfSwKICAibmFtZSI6ICImIFNsdWRnZSBEYWdnZXJ+IiwKICAicG93ZXIiOiA4Cn0KYGBgCgpgbW9kZWxsZWRPbmAgc2F5cyBgIiYgS2F0YW5hfiJgLCBhbmQgZXZlcnkgbnVtYmVyIHRoYXQgd2FzIGNob3NlbiBjYXJyaWVzIGl0cwpldmlkZW5jZToKCmBgYApjb3N0ICAgPSAzMDAgIDwtIHRoZSBtZWRpYW4gb2YgdGhlIDcgY29yZSBvYmplY3QgcmVjb3JkcyBjbG9zZXN0IHRvIGxldmVsIDIwIHdpdGggdHlwZSAic3dvcmQiCndlaWdodCA9IDE0MCAgPC0gdGhlIG1lZGlhbiBvZiB0aGUgNyBjb3JlIG9iamVjdCByZWNvcmRzIGNsb3Nlc3QgdG8gbGV2ZWwgMjAgd2l0aCB0eXBlICJzd29yZCIKYGBgCgpgZmluZGluZ3NgIGhvbGRzIHdoYXQgaXMgc3RpbGwgd3Jvbmcgd2l0aCBpdDogaGVyZSwgb25lIGhpbnQgdGhhdCBpdCBoYXMgbm8KYGRlc2NgLgoKIyMjIFdoeSAibW9kZWxsZWQgb24iLCBub3QgImFzc2VtYmxlZCBmcm9tIGRlZmF1bHRzIgoKQW4gZWFybGllciB2ZXJzaW9uIGJ1aWx0IHRoZSBzaGFwZSBmcm9tIGhvdyBvZnRlbiBlYWNoIGZpZWxkIGFwcGVhcnMgYWNyb3NzIHRoZSB3aG9sZSBmaWxlLCBhbmQgcHJvZHVjZWQgYSBzd29yZCB3aXRoIGFuIGBhcm1vcmAgYmxvY2sgYmVjYXVzZSA1OSUgb2YgY29yZSdzIG9iamVjdHMgaGF2ZSBvbmUuIEhvdyBjb21tb24gYSBmaWVsZCBpcyBhY3Jvc3MgYSBmaWxlIHNheXMgbm90aGluZyBhYm91dCB3aGV0aGVyIGEgcGFydGljdWxhciByZWNvcmQgc2hvdWxkIGhhdmUgaXQsIHNvIHRoZSBzaGFwZSBub3cgY29tZXMgZnJvbSBjb3JlJ3MgbmVhcmVzdCBjb21wYXJhYmxlIHJlY29yZCBhbmQgb25seSB0aGUgbnVtYmVycyBhcmUgYXZlcmFnZWQuCgpUaGUgbW9kZWwgbmV2ZXIgbGVuZHMgdGhlIGZpZWxkcyB0aGF0IGNvbmZlciBiZWhhdmlvdXIgb3IgaWRlbnRpdHk6IGBmbGFnc2AsIGB2YWx1ZXNgLCBgc2xheWAsIGBicmFuZGAsIGBjdXJzZWAsIGBlZmZlY3RgLCBgYWN0YCwgYGJsb3dgLCBgc3BlbGxzYCwgYG5hbWVgLCBgZGVzY2AsIGBtc2dgLiBDb3B5aW5nIHRob3NlIHdvdWxkIGhhbmQgeW91IGFuIGl0ZW0gdGhhdCBkb2VzIHRoaW5ncyB5b3UgbmV2ZXIgYXNrZWQgZm9yIGFuZCB3b3VsZCBub3QgdGhpbmsgdG8gbG9vayBmb3IuCgotLS0KCiMjIFRoZSBwaWVjZXMsIHNlcGFyYXRlbHkKCkV2ZXJ5IHN0ZXAgb2YgYGRyYWZ0UmVjb3JkYCBpcyBjYWxsYWJsZSBvbiBpdHMgb3duLgoKfCBDYWxsIHwgQW5zd2VycyB8CnwtLS18LS0tfAp8IGBkZXNjcmliZUZpbGUoZmlsZSlgIHwgd2hhdCBkb2VzIGEgcmVjb3JkIG9mIHRoaXMga2luZCBjb250YWluPyB8CnwgYHJlcXVpcmVkRmllbGRzKGZpbGUpYCB8IHdoYXQgZG8gKiphbGwqKiBvZiBjb3JlJ3MgcmVjb3JkcyBoZXJlIGNhcnJ5PyB8CnwgYGZpZWxkVXNhZ2UoZmlsZSlgIHwgZXZlcnkgZmllbGQsIG1vc3QtdXNlZCBmaXJzdCwgd2l0aCBpdHMgc2hhcmUgfAp8IGB0ZW1wbGF0ZVJlY29yZChmaWxlLCBzY29wZSlgIHwgYSBzdGFydGluZyByZWNvcmQ6IGAicmVxdWlyZWQiYCwgYCJjb21tb24iYCAoZGVmYXVsdCkgb3IgYCJhbGwiYCB8CnwgYHBlZXJzRm9yKGZpbGUsIGRyYWZ0LCByZWNvcmRzKWAgfCB3aGljaCBvZiBjb3JlJ3MgcmVjb3JkcyBhcmUgY29tcGFyYWJsZSB0byB0aGlzIG9uZSB8CnwgYHN1Z2dlc3RGaWVsZHMoZmlsZSwgZHJhZnQsIHJlY29yZHMpYCB8IHdoYXQgY29yZSdzIGNvbXBhcmFibGUgcmVjb3JkcyB3b3VsZCBwdXQgaW4gdGhlIGdhcHMgfAp8IGBjaGVja1JlY29yZHMoc3ViamVjdCwgYWxsKWAgfCBldmVyeSB3YXkgdGhlc2UgcmVjb3JkcyB3aWxsIHNpbGVudGx5IG5vdCB3b3JrIHwKfCBgUkVDT1JEX0JMVUVQUklOVFNgIHwgdGhlIHJhdyBtZWFzdXJlbWVudDogcGVyIGZpbGUsIHBlciBmaWVsZCwgY291bnQgLyB0eXBlcyAvIHJhbmdlIC8gb2JzZXJ2ZWQgdmFsdWVzIHwKCiMjIyAiV2hhdCBzaG91bGQgaXQgY29zdD8iCgpBbmdiYW5kJ3MgY29zdHMgYXJlIHNldCBieSBoYW5kLCBzbyB0aGVyZSBpcyBubyBmb3JtdWxhIGZvciBhIHByaWNlLCBidXQgY29yZSdzIDM3NSBvYmplY3RzIGdpdmUgcGxlbnR5IG9mIHByZWNlZGVudC4gYHN1Z2dlc3RGaWVsZHNgIG5hcnJvd3MgdHdpY2U6IGZpcnN0IHRvIHRoZSBzYW1lIGl0ZW0gdHlwZSwgdGhlbiB0byB0aGUgc2V2ZW4gcmVjb3JkcyBuZWFyZXN0IGluIGxldmVsLiBJdCBzdWdnZXN0cyBudW1lcmljIGZpZWxkcyBvbmx5OyBhIG5hbWUsIGEgZGVzY3JpcHRpb24gb3IgYSBzZXQgb2YgZmxhZ3MgaXMgYSBkZXNpZ24gZGVjaXNpb24uCgpXaXRoIG5vIGNvbXBhcmFibGUgcmVjb3JkIGl0IGZhbGxzIGJhY2sgdG8gdGhlIGZpbGUtd2lkZSBtZWRpYW4gYW5kIHNheXMgc28gaW4gdGhlIGV2aWRlbmNlIGxpbmUsIHNvIHlvdSBjYW4gdGVsbCBhIHdlYWsgc3VnZ2VzdGlvbiBmcm9tIGEgc3Ryb25nIG9uZS4KCi0tLQoKIyMgV2hhdCBgY2hlY2tSZWNvcmRzYCBmaW5kcwoKYGNoZWNrUmVjb3Jkc2AgdGFrZXMgdHdvIGFyZ3VtZW50czoKCmBgYHRzCmNoZWNrUmVjb3JkcyhzdWJqZWN0LCBhbGwpCmBgYAoKYHN1YmplY3RgIGlzIHRoZSBzZXQgb2YgcmVjb3JkcyBpdCByZXBvcnRzIG9uLCBtZWFuaW5nIHlvdXJzLiBgYWxsYCBpcyB3aGF0IHRoZXkgbWF5IHJlc29sdmUgYWdhaW5zdDogY29yZSBwbHVzIGV2ZXJ5IGxvYWRlZCBwYWNrLiBDaGVja2luZyBhIG1vZCBhZ2FpbnN0IGl0c2VsZiBhbG9uZSB3b3VsZCByZXBvcnQgZXZlcnkgcmVmZXJlbmNlIHRvIGNvcmUgYXMgYnJva2VuLgoKRmluZGluZ3MgYXJlIGdyYWRlZCwgYW5kIGBjaGVja1JlY29yZHNgIG5ldmVyIHJlZnVzZXMgYW55dGhpbmcuIFJlZnVzYWxzIGhhcHBlbiBpbiB0aGUgbWFuaWZlc3QgdmFsaWRhdG9yIGFuZCB0aGUgZGVjbGFyZWQtZmllbGQgcnVsZSwgd2hpY2ggZW5mb3JjZSB0aGUgZW5naW5lJ3Mgb3duIHJ1bGVzLgoKIyMjIEl0IGFsc28gcnVucyB3aGVuIHRoZSBHQU1FIGxvYWRzIHlvdXIgbW9kCgpTaW5jZSAyMDI2LTA4LTA5IHRoZSBjaGVjayBhbHNvIHJ1bnMgYXQgbG9hZCB0aW1lLiBgY29tcG9zZUNvbnRlbnRQYWNrc2AsIHRoZSBmdW5jdGlvbiBldmVyeSBob3N0IGNvbXBvc2VzIHRocm91Z2gsIHJ1bnMgaXQgb3ZlciBldmVyeSBwYWNrIGl0IGxvYWRzIGFuZCBwdXRzIHRoZSBmaW5kaW5ncyBvbiB0aGF0IG1vZCdzIG93biByb3cgaW4gdGhlIG1vZCBtYW5hZ2VyLCBzbyBhIHBsYXllciB3aG8gaW5zdGFsbHMgeW91ciBtb2QgZnJvbSBhIHppcCBzZWVzIHRoZSBzYW1lIHNlbnRlbmNlcyB5b3UgZG8uIEl0IGRpZmZlcnMgZnJvbSBgYnVpbGQoKWAgaW4gdGhyZWUgd2F5czoKCi0gT25seSBgd2FybmAgYW5kIGFib3ZlIGFyZSBzaG93bi4gQSBgaGludGAgaXMgZHJhZnRpbmcgYWR2aWNlIGZvciB3aGVuIHlvdSBhcmUgbG9va2luZyBhdCB0aGUgZHJhZnQsIGFuZCBkb3plbnMgb2YgdGhlbSBvbiBhIHBsYXllcidzIHNjcmVlbiB3b3VsZCBidXJ5IHRoZSBvbmUgbGluZSB0aGF0IG1hdHRlcnMuCi0gVGhlIGJhc2UgZ2FtZSBpcyBub3QgcmVwb3J0ZWQgb24uIENvcmUncyBvd24gZGF0YSByYWlzZXMgd2FybmluZ3MgYWdhaW5zdCBjb3JlJ3Mgb3duIGJsdWVwcmludCwgYW5kIHRob3NlIGFyZSB1cHN0cmVhbSB3YXJ0cyB0aGUgcG9ydCBrZWVwcy4KLSBBIHBhdGNoIGlzIGNoZWNrZWQgYXMgdGhlIHJlY29yZCBpdCBwcm9kdWNlZCByYXRoZXIgdGhhbiBhcyB5b3Ugd3JvdGUgaXQsIHNvIGB7InNwZWVkIjogMTIwfWAgaXMgbm90IHJlcG9ydGVkIGFzIGEgcmVjb3JkIG1pc3NpbmcgdHdlbnR5IGZpZWxkcy4KCkluIHByYWN0aWNlLCB5b3VyIHVzZXJzIHNlZSB3aGF0IHlvdXIgYGJ1aWxkKClgIG91dHB1dCBzaG93cy4gSWYgaXQgaXMgY2xlYW4gYXQgYHdhcm5gLCB0aGVpciBtb2QgbWFuYWdlciBzdGF5cyBxdWlldCwgYW5kIHRoZXJlIGlzIG5vdGhpbmcgZXh0cmEgdG8gcnVuIG9yIG9wdCBpbnRvLgoKfCBMZXZlbCB8IE1lYW5pbmcgfCBFeGFtcGxlcyB8CnwtLS18LS0tfC0tLXwKfCBgZXJyb3JgIHwgdGhlIHJlY29yZCBjYW5ub3Qgd29yayB8IGEgcmVxdWlyZWQgZmllbGQgaXMgYWJzZW50OyBhbiBhcnRpZmFjdCB3aXRoIG5vIGBiYXNlLW9iamVjdGAgfAp8IGB3YXJuYCB8IGl0IGxvYWRzIGFuZCB3aWxsIG5vdCBkbyB3aGF0IGl0IGxvb2tzIGxpa2UgaXQgZG9lcyB8IGEgZGFuZ2xpbmcgcmVmZXJlbmNlOyBubyBgYWxsb2NgOyBhIGZpZWxkIHdyaXR0ZW4gYXMgdGhlIHdyb25nIHR5cGUgfAp8IGBoaW50YCB8IHdvcnRoIGEgbG9vayB8IGFuIHVuZmFtaWxpYXIgZmllbGQgbmFtZSAod2l0aCBhICJkaWQgeW91IG1lYW4iKTsgbm8gYGRlc2NgOyBub3RoaW5nIHRvIGF0dGFjayB3aXRoIHwKCiMjIyBEYW5nbGluZyByZWZlcmVuY2VzCgpgUkVGRVJFTkNFX0VER0VTYCBkZWNsYXJlcyAzNyBmaWVsZHMgdGhhdCBuYW1lIGFub3RoZXIgcmVjb3JkOiBgb2JqZWN0LnR5cGVgCmludG8gYG9iamVjdF9iYXNlYCwgYG1vbnN0ZXIuYmFzZWAgaW50byBgbW9uc3Rlcl9iYXNlYCwgYGVnb19pdGVtLnNsYXlgIGludG8KYHNsYXlgLCBgYXJ0aWZhY3QuYWN0YCBpbnRvIGBhY3RpdmF0aW9uYCwgYW5kIHNvIG9uLiBFdmVyeSBlZGdlIGlzIG1lYXN1cmVkCmFnYWluc3QgY29yZSdzIG93biBkYXRhIGJ5IGByZWZlcmVuY2VzLnRlc3QudHNgLCBzbyBhbiBlZGdlIHRoYXQgaXMgd3JvbmcgaXMgYQp0ZXN0IGZhaWx1cmUgcmF0aGVyIHRoYW4gYSBmYWxzZSBhbGFybSBpbiB5b3VyIG1vZC4KClJlZmVyZW5jZXMgcmVzb2x2ZSBhZ2FpbnN0ICoqY29yZSBwbHVzIHlvdXIgb3duIG5ldyByZWNvcmRzKiosIHNvIGEgbW9kIHRoYXQKYWRkcyBhbiBgb2JqZWN0X2Jhc2VgIGFuZCB0aGVuIGFuIG9iamVjdCBvZiB0aGF0IG5ldyB0dmFsIGlzIG5vdCB0b2xkIGl0cyBvd24KdHZhbCBpcyBtaXNzaW5nLgoKQW4gdW5yZXNvbHZlZCByZWZlcmVuY2UgaXMgYSAqKndhcm5pbmcsIG5ldmVyIGEgcmVmdXNhbCoqLCBhbmQgdGhlIHJlYXNvbiBpcwpyZWNvcmRlZDogY29yZSdzIG93biBkYXRhIGNvbnRhaW5zIHJlZmVyZW5jZXMgdGhhdCBkbyBub3QgcmVzb2x2ZS4KYGFydGlmYWN0LnR4dGAgc2F5cyBgYmFzZS1vYmplY3Q6c29mdCBhcm1vdXI6Li4uYCB3aGlsZSBgb2JqZWN0X2Jhc2UudHh0YCBhbmQKYGxpc3QtdHZhbHMuaGAgYm90aCBzcGVsbCBpdCBgc29mdCBhcm1vcmA7IGZvdXJ0ZWVuIGFydGlmYWN0IGJhc2Ugb2JqZWN0cwooUGhpYWwsIEFya2Vuc3RvbmUsIHNldmVyYWwgcmluZ3MpIG5hbWUgc3ZhbHMgYG9iamVjdC50eHRgIG5ldmVyIGRlZmluZXMuIFRob3NlCmFyZSBBbmdiYW5kIDQuMi42J3MsIHJlcHJvZHVjZWQgZXhhY3RseSB1bmRlciB0aGUgcGFyaXR5IG1hbmRhdGUuIEEgcnVsZSBzdHJpY3QKZW5vdWdoIHRvIHJlamVjdCB0aGVtIHdvdWxkIHJlamVjdCBBbmdiYW5kLgoKIyMjIENvbXBhbmlvbiBzdGVwcwoKYENPTVBBTklPTl9SVUxFU2AgaXMgdGhlIGxpc3Qgb2YgdGhpbmdzIHRoZSByZWNvcmQgaXMgZmluZSB3aXRob3V0IGFuZCAqKnlvdSoqCmFyZSBub3QuIFRoZXkgYXJlIGFsbCB3YXJuaW5ncyBvciBoaW50cywgYmVjYXVzZSBldmVyeSBvbmUgb2YgdGhlbSBpcyBsZWdhbDoKYW4gb2JqZWN0IHdpdGggbm8gYGFsbG9jYCBpcyBleGFjdGx5IGhvdyBjb3JlIGRlZmluZXMgYW4gaXRlbSB0aGF0IG9ubHkgY29tZXMKZnJvbSBhIHN0b3JlLgoKVGhlIG9uZSB0aGF0IGlzIG5vdCBhIHBlci1yZWNvcmQgcnVsZTogKipmbGF2b3VyIHByZXNzdXJlLioqIEFuZ2JhbmQgaGFuZHMgZWFjaApvYmplY3Qgb2YgYSBmbGF2b3VyZWQgdHlwZSBpdHMgb3duIGZsYXZvdXIgKGBwb3Rpb25gLCBgc2Nyb2xsYCwgYHJpbmdgLApgYW11bGV0YCwgYHN0YWZmYCwgYHdhbmRgLCBgcm9kYCwgYG11c2hyb29tYCk7IHBhc3QgdGhhdCBwb2ludCB1bmlkZW50aWZpZWQKaXRlbXMgc3RhcnQgc2hhcmluZy4gQ29yZSBzaGlwcyA1OSBwb3Rpb24gZmxhdm91cnMgZm9yIDQxIHBvdGlvbnMsIHNvIHRoZXJlIGlzCnJvb20gZm9yIGVpZ2h0ZWVuIG1vcmUgYmVmb3JlIGl0IGJpdGVzLiBDb3VudGVkIGZyb20gdGhlIGNvbXBvc2VkIGRhdGEsIHNvIGEgbW9kCnRoYXQgYWRkcyBmbGF2b3VycyBhcyB3ZWxsIGFzIG9iamVjdHMgZ2V0cyB0aGUgY3JlZGl0IGZvciB0aGVtLgoKLS0tCgojIyBBc3NlbWJsaW5nIGEgd2hvbGUgbW9kCgpgTW9kUHJvamVjdGAgaXMgdGhlIHNhbWUgc2hvcnRjdXRzIHdyYXBwZWQgYXJvdW5kIGEgbWFuaWZlc3QsIGFuZCBpdCBjb21wb3Nlcwp0aHJvdWdoIHRoZSByZWFsIHBpcGVsaW5lIGJlZm9yZSBpdCBzYXlzIGFueXRoaW5nLgoKYGBgdHMKaW1wb3J0IHsgbW9kUHJvamVjdCwgZHJhZnRSZWNvcmQgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKCmNvbnN0IGJ1aWxkID0gbW9kUHJvamVjdCh7CiAgaWQ6ICJzbHVkZ2UiLAogIG5hbWU6ICJTbHVkZ2UiLAogIHZlcnNpb246ICIxLjAuMCIsCiAgc2hhcGU6ICJjb250ZW50IiwKICBhdXRob3I6ICJ5b3UiLAogIHJlcG9zaXRvcnk6ICJodHRwczovL2dpdGh1Yi5jb20veW91L3NsdWRnZSIsCiAgZW5naW5lOiAiPj0wLjE5LjAiLAogIGRlcGVuZGVuY2llczogeyBjb3JlOiAiKiIgfSwKfSkKICAuZGVjbGFyZUZpZWxkKHsgbmFtZTogInNsdWRnZSIsIGZpbGVzOiBbIm9iamVjdCJdLCB0eXBlOiAib2JqZWN0IiB9KQogIC5hZGQoIm1vbnN0ZXIiLCBkcmFmdFJlY29yZCgibW9uc3RlciIsIHsgbmFtZTogInNsdWRnZSBmaWVuZCIsIGJhc2U6ICJpY2t5IHRoaW5nIiwgZGVwdGg6IDI1IH0sIGNvcmUpLnJlY29yZCkKICAucGF0Y2hGaWVsZHMoIm9iamVjdCIsICJjb3JlOnN3b3JkLS1kYWdnZXIiLCBbCiAgICB7IG9wOiAic2V0IiwgcGF0aDogInNsdWRnZTpzbHVkZ2UiLCB2YWx1ZTogeyB0dXJuczogNSB9IH0sCiAgXSkKICAuYnVpbGQoY29yZVBhY2spOwoKYnVpbGQuZmlsZXM7ICAgICAvLyBbeyBwYXRoOiAibWFuaWZlc3QuanNvbiIsIGNvbnRlbnRzIH0sIHsgcGF0aDogIm1vbnN0ZXIuanNvbiIsIGNvbnRlbnRzIH0sIC4uLl0KYnVpbGQuZmluZGluZ3M7ICAvLyB3b3JzdCBmaXJzdApidWlsZC5wcm9ibGVtczsgIC8vIGNvbXBvc2l0aW9uJ3Mgb3duIHJlZnVzYWxzCmJ1aWxkLm9rOyAgICAgICAgLy8gZmFsc2UgaWYgYW55dGhpbmcgaXMgYXQgYGVycm9yYApgYGAKCi0gVGhlIGJ1aWxkZXIgdG91Y2hlcyBubyBmaWxlc3lzdGVtLiBgZW1pdCgpYCBoYW5kcyBiYWNrIHBhdGhzIGFuZCBieXRlcyBhbmQgbGVhdmVzIHRoZSB3cml0aW5nIHRvIHlvdSwgc28gdGhlIHNhbWUgYnVpbGRlciB3b3JrcyBmcm9tIGEgQ0xJLCBmcm9tIGEgdGVzdCBhbmQgZnJvbSBhbiBpbi1nYW1lIGVkaXRvci4KLSBJdCBjaGVja3MgdGhlIGNvbXBvc2VkIHJlc3VsdCByYXRoZXIgdGhhbiB0aGUgZHJhZnQuIEEgcGF0Y2ggdGhhdCBicmVha3MgYSByZWZlcmVuY2UgaXMgaW52aXNpYmxlIGluIHlvdXIgb3duIGZpbGVzLCBiZWNhdXNlIHlvdXIgZmlsZXMgZG8gbm90IGNvbnRhaW4gdGhlIHJlY29yZCBpdCBicm9rZS4KLSBJdCByZXBvcnRzIHByb2JsZW1zIGluc3RlYWQgb2YgdGhyb3dpbmcuIEEgbWlzc2luZyBkZXBlbmRlbmN5IGlzIGFuIGBlcnJvcmAgZmluZGluZywgbm90IGEgc3RhY2sgdHJhY2UuCgpgYnVpbGQub2tgIGlnbm9yZXMgd2FybmluZ3MgYmVjYXVzZSBldmVyeSB3YXJuaW5nIGl0IGNhbiBwcm9kdWNlIGlzIHNvbWV0aGluZyBjb3JlJ3Mgb3duIGRhdGEgZG9lcyBzb21ld2hlcmUsIHNvIGEgYnVpbGRlciB0aGF0IHJlZnVzZWQgb24gd2FybmluZ3Mgd291bGQgcmVmdXNlIHRvIGJ1aWxkIEFuZ2JhbmQuCgotLS0KCiMjIFdoYXQgYSBtb2QgY2FuIGFkZCBhIHJlY29yZCB0bzogNDEgb2YgNDQgZmlsZXMKClRoYXQgY291bnQgaXMgdGFrZW4gb3ZlciB0aGUgc2hpcHBlZCBwYWNrOyBpdCB1c2VkIHRvIGJlIDI0LiBDb21wb3NpdGlvbiBtZXJnZXMgYSBmaWxlIHJlY29yZCBieSByZWNvcmQgd2hlbiBldmVyeSByZWNvcmQgaGFzIGEgcmVmIG5vIHNpYmxpbmcgY2xhaW1zLiBgcGFja2FnZXMvbW9kLXNkay9zcmMvcmVjb3JkLWtleS50c2AgZGVmaW5lcyB3aGF0IGEgcmVmIGlzOiBgbmFtZWAgZm9yIG1vc3QgZmlsZXMsIGFuZCBzb21ldGhpbmcgZWxzZSB3aGVyZSB1cHN0cmVhbSBpZGVudGlmaWVzIHJlY29yZHMgYW5vdGhlciB3YXkuCgpVbnRpbCAyMDI2LTA4LTA4IHRoZSB0ZXN0IHdhcyAiYSB1bmlxdWUgYG5hbWVgIiwgYW5kIHRocmVlIGZpbGVzIGZhaWxlZCBpdCBvbiBjb3JlJ3Mgb3duIGRhdGEsIGJlY2F1c2UgQW5nYmFuZCBuYW1lcyBhIGdyZWF0ZXIgZm9ybSBieSByZXVzaW5nIHRoZSBuYW1lIHdpdGggbWFya3M6IGBBY3F1aXJlbWVudGAgYW5kIGAqQWNxdWlyZW1lbnQqYCwgYExpdHRsZSBlcnVwdGlvbmAgYW5kIGBMaXR0bGUgZXJ1cHRpb24rYCwgYW5kIGBlZ29faXRlbWAgc2hpcHMgMjMgbmFtZXMgdHdpY2Ugb3Zlci4gQXMgYSByZXN1bHQgYSBtb2QgYWRkaW5nIG9uZSBvYmplY3QgcmVwbGFjZWQgYWxsIDM3NSBvZiBjb3JlJ3MsIG9uZSBlZ28gcmVwbGFjZWQgYWxsIDEwNywgYW5kIG9uZSB2YXVsdCBhbGwgMTYyLCBpbiB0aGUgdGhyZWUgZmlsZXMgbW9zdCB3b3J0aCBhZGRpbmcgdG8uIFRoZXkgbm93IG1lcmdlIHBlciByZWNvcmQ6Cgp8IEZpbGUgfCBSZWNvcmRzIHwgQSBtb2QgYWRkaW5nIG9uZSByZWNvcmQuLi4gfAp8LS0tfC0tLXwtLS18CnwgYG9iamVjdGAgfCAzNzUgfCBhZGRzIG9uZSwgMzc2IHwKfCBgZWdvX2l0ZW1gIHwgMTA3IHwgYWRkcyBvbmUsIDEwOCB8CnwgYHZhdWx0YCB8IDE2MiB8IGFkZHMgb25lLCAxNjMgfAp8IGBzdG9yZWAsIGBmbGF2b3JgLCBgYnJhbmRgLCBgc2xheWAsIGBvYmplY3RfYmFzZWAsIGB0cmFwYCwgYG5hbWVzYCwgLi4uIHwgLSB8IGFkZHMgb25lLCBrZXllZCBieSB3aGF0ZXZlciB1cHN0cmVhbSBrZXlzIGl0IGJ5IHwKCmBjb25zdGFudHNgLCBgdmlzdWFsc2AgYW5kIGBoaXN0b3J5YCBzdGlsbCB0YWtlIGEgd2hvbGUgZmlsZS4gYGNvbnN0YW50c2AgYW5kIGB2aXN1YWxzYCBhcmUgY29uZmlnIHNpbmdsZXRvbnM6IHRoZSBmaWxlIGlzIHRoZWlyIGlkZW50aXR5LCB0aGUgaG9zdCBiaW5kcyBleGFjdGx5IG9uZSwgYW5kIHNoaXBwaW5nIGBjb25zdGFudHMuanNvbmAgbWVhbnMgInVzZSBtaW5lIi4gYGhpc3RvcnlgIHJlY29yZHMgaGF2ZSByZWZzLCBzbyBhIG1vZCBjYW4gcGF0Y2gsIHJlcGxhY2Ugb3IgcmVtb3ZlIGEgc2luZ2xlIHBocmFzZSwgYnV0IGl0IGNhbm5vdCBhZGQgYSByZWNvcmQgb24gaXRzIG93bi4gVGhlIGdhbWUgd2Fsa3MgYSBjaGFydCdzIHJlY29yZHMgaW4gZmlsZSBvcmRlciBhbmQgdGFrZXMgdGhlIGZpcnN0IHdob3NlIGByb2xsYCByZWFjaGVzIHRoZSBkaWUsIHNvIGEgcmVjb3JkIGFkZGVkIGFmdGVyIGNvcmUncyBsYXN0IG9uZSB3b3VsZCBuZXZlciBiZSBwaWNrZWQuIEZvciB0aG9zZSB0aHJlZSwgYE1vZFByb2plY3QuYnVpbGRgIHN0aWxsIHJhaXNlcyBgZmlsZS93aG9sZS1maWxlLXJlcGxhY2VtZW50YCBhcyBhbiBgZXJyb3JgLCBzbyBhbiBhdXRob3IgY2Fubm90IHJlcGxhY2UgdGhlIGJhc2UgZ2FtZSdzIGNvcHkgb2YgYSBmaWxlIHdpdGhvdXQgbm90aWNpbmcuCgojIyMgV2hhdCBhIHJlY29yZCBpcyBjYWxsZWQKClJlZnMgZGlkIG5vdCBjaGFuZ2UuIGBwYXRjaEZpZWxkc2AsIGByZXBsYWNlYCBhbmQgYHJlbW92ZWAgYWxyZWFkeSB1c2VkIHRoZSBwZXItcmVjb3JkIGlkZW50aXR5LCBzbyBldmVyeSByZWYgdGhhdCByZXNvbHZlZCBiZWZvcmUgc3RpbGwgcmVzb2x2ZXM6CgotIGBvYmplY3RgIGlzIGB0eXBlICsgbmFtZWAsIHNvIHRoZSBEYWdnZXIgaXMgYGNvcmU6c3dvcmQtLWRhZ2dlcmA7Ci0gYGVnb19pdGVtYCBpcyBgbmFtZWAsIHBsdXMgYSBgI2AgZGlzY3JpbWluYXRvciB3aGVyZSBjb3JlIHNoaXBzIGEgbmFtZSB0d2ljZSwgYXMgaW4gYGNvcmU6b2YtYWNpZCNzaG90LWFycm93YDsKLSBgaGlzdG9yeWAgaXMgYGNoYXJ0ICsgcm9sbGAsIHRoZSBudW1iZXJzIG9uIHRoZSByZWNvcmQncyBgY2hhcnQ6YCBsaW5lIGluIGhpc3RvcnkudHh0LCBzbyBgY2hhcnQ6NTA6NTE6MTAwYCAoIllvdSBoYXZlIGJsdWUtZ3JheSBleWVzLCAiKSBpcyBgY29yZTo1MC0tMTAwYDsKLSBgc3RvcmVgIGlzIGl0cyBgU1RPUkVfKmAgY29kZSwgYGJyYW5kYCBhbmQgYHNsYXlgIHRoZWlyIGBjb2RlYCwgYGZsYXZvcmAgaXRzIGJhc2UgdHZhbCwgYW5kIHNvIG9uLgoKQSByZWNvcmQgYW5zd2VycyB0byBzZXZlcmFsIHJlZnM6IGl0cyBiYXNlIGtleSwgaXRzIGRpc2NyaW1pbmF0ZWQgZm9ybSwgYW5kLCBhcyBhbiBhbGlhcywgdGhlIGxvc3N5IHNsdWcgdXNlZCBiZWZvcmUgMjAyNi0wOC0wOCwgc28gcmVmcyB3cml0dGVuIGFnYWluc3QgYW4gb2xkZXIgZW5naW5lIGtlZXAgd29ya2luZy4gQW4gYWxpYXMgaXMgZHJvcHBlZCB3aGVyZSBpdCB3b3VsZCBzaGFkb3cgYSAqZGlmZmVyZW50KiByZWNvcmQncyByZWFsIG5hbWUuIGAqSGVhbGluZypgJ3Mgb2xkIHJlZiwgZm9yIGV4YW1wbGUsIGlzIHBsYWluIGBIZWFsaW5nYCdzIGN1cnJlbnQgb25lLCBhbmQgYW4gb2xkIGFsaWFzIG11c3Qgbm90IHRha2UgYSBuYW1lIGF3YXkgZnJvbSBhbm90aGVyIHJlY29yZC4KClRoYXQgZHJvcHMgKio4IG9mIHRoZSBwYWNrJ3MgMTkgbGVnYWN5IGFsaWFzZXMqKiwgYW5kIHdoaWNoIG9uZXMgZGVwZW5kcyBvbiBjb3JlJ3MgZGF0YSByYXRoZXIgdGhhbiBvbiB0aGUgbWFyay4gYCpBY3F1aXJlbWVudCpgIGxvc2VzIGl0cyBhbGlhcyBiZWNhdXNlIGNvcmUgc2hpcHMgYSBwbGFpbiBgQWNxdWlyZW1lbnRgIHNjcm9sbC4gYCpEZXN0cnVjdGlvbipgIGtlZXBzIGJvdGggb2YgaXRzLCBhcyBhIHNjcm9sbCBhbmQgYXMgYSBzdGFmZiwgYmVjYXVzZSBjb3JlIGhhcyBubyBwbGFpbiBgRGVzdHJ1Y3Rpb25gIGZvciB0aGVtIHRvIHNoYWRvdy4gYG9mICpTbGF5IE9yYypgIGxvc2VzIGl0cyBhbGlhcyBhbmQgYG9mICpTbGF5IEFuaW1hbCpgIGtlZXBzIGl0cyBvd24sIGZvciB0aGUgc2FtZSByZWFzb24uIGByZWNvcmQta2V5LnRlc3QudHNgIGFzc2VydHMgdGhlIGZ1bGwgY2Vuc3VzIHJvdyBieSByb3cuCgpOb25lIG9mIHRoZSA4IGJyZWFrcyBhIHdvcmtpbmcgcmVmOiBldmVyeSBmaWxlIGNhcnJ5aW5nIGEgbGVnYWN5IGFsaWFzIGhhZCBubyBwZXItcmVjb3JkIGFkZHJlc3NpbmcgYmVmb3JlIHRoZSBrZXkgdGFibGUgZXhpc3RlZC4KCiMjIyBXaGVyZSBhIG5ldyByZWNvcmQgbGFuZHMsIGFuZCB3aHkgaXQgbWF0dGVycwoKTmV3IHJlY29yZHMgYXJlIGFwcGVuZGVkIGFmdGVyIGNvcmUncywgYW5kIHRoZSBwb3NpdGlvbiBtYXR0ZXJzLiBJbiB1cHN0cmVhbSwgYHN2YWxgIGlzIGEgY291bnRlciByYXRoZXIgdGhhbiBhIGZpZWxkIGluIHRoZSBkYXRhOiBpdCBpcyBidW1wZWQgcGVyIG9iamVjdCBiYXNlIGluIGZpbGUgb3JkZXIgKGBwYXJzZV9vYmplY3RfdHlwZWAsIGByZWZlcmVuY2Uvc3JjL29iai1pbml0LmNgKSwgYW5kIGBraWR4YCBpcyB0aGUgcmVjb3JkJ3MgcG9zaXRpb24gaW4gdGhlIGZpbGUuIEFwcGVuZGVkLCBldmVyeSBvbmUgb2YgY29yZSdzIDM3NSBvYmplY3RzIGtlZXBzIGl0cyBpbmRleCwgbmFtZSwgdHZhbCBhbmQgc3ZhbCwgYW5kIHRoZSBuZXcgb2JqZWN0IHRha2VzIHRoZSBuZXh0IGZyZWUgc3ZhbCBvZiBpdHMgb3duIGJhc2UuIFByZXBlbmRlZCwgZXZlcnkgc3dvcmQgaW4gdGhlIGdhbWUgd291bGQgc2hpZnQgYnkgb25lLgoKQ29tcG9zaXRpb24gYXBwZW5kcyBiZWNhdXNlIGNvcmUgaXMgcGFjayB6ZXJvIGFuZCBhIG1vZCB0aGF0IGRlY2xhcmVzIGBjb3JlYCBhcyBhIGRlcGVuZGVuY3kgbG9hZHMgYWZ0ZXIgaXQuIGBwYWNrYWdlcy93ZWIvc3JjL21vZC1hZGRlZC1yZWNvcmQudGVzdC50c2AgYmluZHMgY29yZSdzIHBhY2sgd2l0aCBhbmQgd2l0aG91dCBvbmUgYWRkZWQgb2JqZWN0IGFuZCBhc3NlcnRzIHRoZSB3aG9sZSB0YWJsZSwgbm90IGEgc2FtcGxlLiBUaGUgb25lIHRoaW5nIHRoYXQgZG9lcyBtb3ZlIGlzIHRoZSB0YWlsIG9mIGR1bW15IGtpbmRzIGBiaW5kQ29yZWAgY3JlYXRlcyBmb3Igc3BlY2lhbCBhcnRpZmFjdHMgd2hvc2UgYmFzZSBzdmFsIGBvYmplY3QudHh0YCBuZXZlciBkZWZpbmVzICh0aGUgUGhpYWwsIHRoZSBTdGFyLCB0aGUgcmluZ3Mgb2YgcG93ZXIpLiBUaGVpciBhcnJheSBpbmRleCBzaGlmdHMgYnkgb25lLCBhbmQgbm90aGluZyBkZXBlbmRzIG9uIGl0LCBiZWNhdXNlIGEgc2F2ZWZpbGUgc3RvcmVzIGEgbmFtZXNwYWNlZCBzdHJpbmcgYGtpbmRJZGAgcmF0aGVyIHRoYW4gYSBga2lkeGAuCgojIyMgQSBuZXcgaXRlbSBjbGFzcwoKQW4gb2JqZWN0J3MgYHR5cGVgIG5hbWVzIGl0cyBjbGFzcy4gQSBjbGFzcyBBbmdiYW5kIDQuMiBkb2VzIG5vdCBoYXZlLCBzdWNoIGFzIHRoZSBqdW5rLCBza2VsZXRvbnMgYW5kIGJvdHRsZXMgb2YgMy54LCBoYXMgdG8gYmUgZGVjbGFyZWQgYmVmb3JlIGFueSByZWNvcmQgY2FuIHVzZSBpdC4gU2hpcCBhIGB0dmFsLmpzb25gIHdpdGggb25lIHJlY29yZCBwZXIgY2xhc3M6CgpgYGBqc29uCnsgInJlY29yZHMiOiBbIHsgIm5hbWUiOiAianVuayIgfSBdIH0KYGBgCgpUaGVuIGFkZCBhbiBgb2JqZWN0X2Jhc2VgIGZvciB0aGUgY2xhc3MgYW5kIG9iamVjdHMgd2hvc2UgYHR5cGVgIGlzIGBqdW5rYC4gV2l0aG91dCB0aGUgZGVjbGFyYXRpb24sIHRoZSBnYW1lIHN0b3BzIGxvYWRpbmcgd2l0aCBgb2JqZWN0OiB1bmtub3duIHR2YWwganVua2AuCgpBIGRlY2xhcmVkIGNsYXNzIHRha2VzIHRoZSBuZXh0IG51bWJlciBhZnRlciBBbmdiYW5kJ3Mgb3duLiBUaGF0IG51bWJlciBkZXBlbmRzIG9uIHdoaWNoIG1vZHMgYXJlIGxvYWRlZCwgc28gbm90aGluZyBzdG9yZXMgaXQ6IGEgc2F2ZWZpbGUga2VlcHMgZWFjaCBvYmplY3QncyBga2luZElkYCwgYW5kIHRoZSBvYmplY3QgZ2V0cyBpdHMgbnVtYmVyIGJhY2sgZnJvbSBpdHMga2luZCB3aGVuIHRoZSBnYW1lIGxvYWRzLgoKQSBkZWNsYXJlZCBjbGFzcyBjYW4ndCBiZSB3b3JuLCB3aWVsZGVkLCBmbGF2b3VyZWQsIHJlYWQsIGVhdGVuIG9yIGFpbWVkLCBhbmQgaXRzIG9iamVjdHMgYXJlIGNhbGxlZCBieSB0aGVpciBvd24gbmFtZXMuIFRvIGNoYW5nZSBhbnkgb2YgdGhhdCwgcmVnaXN0ZXIgdGhlIGFuc3dlcnMgdGhyb3VnaCBgcmVnaXN0cnk6dHZhbGAgKFtQTFVHSU5TLm1kXShQTFVHSU5TLm1kKSkuCgpBIGRlY2xhcmVkIGNsYXNzIHN0YXlzIG91dCBvZiB0aGUgaWdub3JlIG1lbnVzIHVubGVzcyBpdHMgcmVjb3JkIGdpdmVzIHRoZSBsYWJlbCBmb3IgaXRzIGNhdGVnb3J5IHRoZXJlOgoKYGBganNvbgp7ICJyZWNvcmRzIjogWyB7ICJuYW1lIjogImp1bmsiLCAiaWdub3JlTWVudSI6ICJKdW5rIiB9IF0gfQpgYGAKClRoZSBsYWJlbCBpcyBsaXN0ZWQgaW4gdGhlIGl0ZW0gaWdub3Jpbmcgc2V0dXAgYWZ0ZXIgQW5nYmFuZCdzIG93biBjYXRlZ29yaWVzLCBpbiB0aGUgb3JkZXIgdGhlIGNsYXNzZXMgYXJlIGRlY2xhcmVkLCBhbmQgdGhlIGBrYCBjb21tYW5kIG9uIG9uZSBvZiB0aGVzZSBvYmplY3RzIG9mZmVycyB0byBpZ25vcmUgZXZlcnkgb2JqZWN0IG9mIGl0cyBraW5kLiBXaXRob3V0IHRoZSBmaWVsZCwgYSBwbGF5ZXIgY2FuIG9ubHkgaWdub3JlIHRoZXNlIG9iamVjdHMgb25lIGF0IGEgdGltZSwgc28gYSBtb2QgdGhhdCBpZ25vcmVzIHRoZSBraW5kIGZvciBhIG5ldyBjaGFyYWN0ZXIgaGFzIHRvIGRlY2xhcmUgdGhlIGxhYmVsIG9yIHRoZSBwbGF5ZXIgY2FuIG5ldmVyIHVuZG8gaXQuIEEga2luZCBpZ25vcmUgaXMgc2F2ZWQgYnkgdGhlIG9iamVjdCdzIGlkLiBJZiB0aGUgbW9kIGlzIHR1cm5lZCBvZmYgbGF0ZXIsIHRoZSBzYXZlIHN0aWxsIGxvYWRzIGFuZCB0aGF0IGlnbm9yZSBpcyBkcm9wcGVkLgoKIyMjIFlvdXIgYXJ0aWZhY3QgYW5kIHRoZSBgYmlydGhfcmFuZGFydHNgIG9wdGlvbgoKQW4gYXJ0aWZhY3QgeW91ciBtb2QgYWRkcyBzdXJ2aXZlcyBhIGNoYXJhY3RlciBib3JuIHdpdGggcmFuZG9tIGFydGlmYWN0cyB0dXJuZWQgb24uIEV2ZXJ5IG90aGVyIGFydGlmYWN0IGluIHRoZSBnYW1lIGlzIHJlZGVzaWduZWQgaW50byBhIGRpZmZlcmVudCBpdGVtLCBidXQgeW91cnMga2VlcHMgdGhlIG5hbWUsIHRoZSBiYXNlIG9iamVjdCBhbmQgdGhlIG51bWJlcnMgeW91IHdyb3RlLgoKYHBhY2thZ2VzL2NvcmUvc3JjL29iai9yYW5kYXJ0LW1vZC1hcnRpZmFjdC50ZXN0LnRzYCB0ZXN0cyB0aGlzLCBhbmQgdGhlIGNhdXNlIGlzIHdoZXJlIHlvdXIgcmVjb3JkcyBzaXQgaW4gdGhlIGZpbGUuIFVwc3RyZWFtJ3MgYGRlc2lnbl9hcnRpZmFjdGAgbG9va3MgdXAgYW4gYXJ0aWZhY3QncyBiYXNlIGtpbmQgb25jZSwgYW5kIGl0cyBza2lwLXRoZS1maXhlZC1hcnRpZmFjdHMgbG9vcCBuZXZlciByZWZyZXNoZXMgdGhhdCBsb29rdXAsIHNvIG9uY2UgdGhlIGxvb3Agc3RhcnRzIG9uIGEgcXVlc3QgYXJ0aWZhY3QgaXQga2VlcHMgc2tpcHBpbmcgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkuIEFuZ2JhbmQncyB0d28gcXVlc3QgYXJ0aWZhY3RzIGFyZSB0aGUgbGFzdCB0d28gcmVjb3JkcyBpbiB0aGUgZmlsZSwgYW5kIHlvdXIgcmVjb3JkcyBhcmUgYXBwZW5kZWQgYWZ0ZXIgY29yZSdzLCB3aGljaCBwdXRzIHRoZW0gcGFzdCB0aGUgcG9pbnQgd2hlcmUgdGhlIHNraXBwaW5nIHN0YXJ0cy4gVGhlIHBvcnQgcmVwcm9kdWNlcyB0aGlzIHF1aXJrIGV4YWN0bHksIHNpbmNlIGNvcmUga2VlcHMgZXZlcnkgYmVoYXZpb3VyYWwgd2FydCBhIHBsYXllciBjYW4gb2JzZXJ2ZS4KClRoaXMgaGFzIHR3byBjb25zZXF1ZW5jZXMgZm9yIHlvdS4gWW91ciBhcnRpZmFjdCBpcyBub3QgcmFuZG9taXplZCBldmVuIGluIGEgcmFuZG9tLWFydGlmYWN0IGdhbWUsIHNvIHBsYXllcnMgd2hvIGNob3NlIHRoYXQgb3B0aW9uIHRvIGJlIHN1cnByaXNlZCB3aWxsIHN0aWxsIG1lZXQgeW91cnMgYXMgeW91IGRlc2lnbmVkIGl0LiBBbmQgdGhlIHBvcnQgZG9lcyBub3QgcHJvbWlzZSB0aGlzIGJlaGF2aW91ciwgc28gdGhlIHNhbWUgdGVzdCBhbHNvIGNoZWNrcyB0aGUgY29udmVyc2U6IGlmIHRoZSBvcmRlciByZWNvcmRzIGFyZSBib3VuZCBpbiBldmVyIGNoYW5nZXMsIGl0IGZhaWxzIGFuZCBuYW1lcyB0aGUgcmVhc29uLgoKLS0tCgojIyBTaGlwcGluZyByZXNvdXJjZXM6IHNvdW5kcywgYSBmb250LCBwcmVmIGZpbGVzLCBoZWxwIHBhZ2VzLCBhcnQKClJlY29yZHMgYXJlIG5vdCB0aGUgb25seSB0aGluZyBhIG1vZCBmb2xkZXIgY2FuIGhvbGQuIFNpeCBvdGhlciBjYXRlZ29yaWVzIGFyZQpkZWNsYXJlZCBpbiBvbmUgYHJlc291cmNlc2AgYXJyYXkgaW4geW91ciBtYW5pZmVzdCwgZWFjaCBuYW1pbmcgYSBga2luZGAgYW5kIGEKYHBhdGhgICoqaW5zaWRlIHlvdXIgbW9kIGZvbGRlcioqLiBUaGUga2luZHMgYXJlIGBzb3VuZGAsIGBmb250YCwgYHByZWZzYCwKYGhlbHBgLCBgYXJ0YCBhbmQgYGxvY2FsZWAgKGBSZXNvdXJjZUtpbmRgLApgcGFja2FnZXMvbW9kLXNkay9zcmMvcmVzb3VyY2VzLnRzYCk6CgpgYGBqc29uCiJyZXNvdXJjZXMiOiBbCiAgeyAia2luZCI6ICJzb3VuZCIsICJwYXRoIjogInNvdW5kcyIgfSwKICB7ICJraW5kIjogImZvbnQiLCAgInBhdGgiOiAiZm9udHMvdGVybWluYWwuanNvbiIgfSwKICB7ICJraW5kIjogInByZWZzIiwgInBhdGgiOiAicHJlZnMvY29sb3Vycy5qc29uIiB9LAogIHsgImtpbmQiOiAiaGVscCIsICAicGF0aCI6ICJoZWxwL2xvcmUudHh0IiwgInNsb3QiOiAibG9yZSIsICJuYW1lIjogIlRoZSBsb3JlIiB9LAogIHsgImtpbmQiOiAiYXJ0IiwgICAicGF0aCI6ICJhcnQvc3BsYXNoLnR4dCIsICJzbG90IjogInNwbGFzaCIgfQpdCmBgYAoKYHBhdGhgIGlzIG5ldmVyIGEgVVJMLiBZb3UgY2Fubm90IGtub3cgd2hlcmUgdGhlIGdhbWUgaXMgc2VydmluZyB5b3VyIG1vZCBmcm9tLAphbmQgdHdvIG9mIHRoZSB0aHJlZSBwbGFjZXMgYSBtb2QgY2FuIGxpdmUgaGF2ZSBubyBwYXRoIGF0IGFsbDogYSBmb2xkZXIgdGhlCnBsYXllciBwaWNrZWQsIGFuZCBhIG1vZCBpbnN0YWxsZWQgZnJvbSBhIHJlcG9zaXRvcnksIHdoaWNoIGxpdmVzIGluIHRoZQpicm93c2VyJ3MgZGF0YWJhc2UuIFRoZSBob3N0IGNvbXBvc2VzIHlvdXIgcGF0aCB3aXRoIHlvdXIgbW9kJ3Mgb3duIHJlc29sdmVyLgoKfCBraW5kIHwgd2hhdCBpdCBpcyB8IHNldmVyYWwgbW9kcz8gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYHNvdW5kYCB8IGEgKipkaXJlY3RvcnkqKiBvZiBzYW1wbGVzIG5hbWVkIGFzIGBzb3VuZC5wcmZgIG5hbWVzIHRoZW0sIGAubXAzYCBvciBgLm9nZ2AgfCB0aGUgbGFzdCBlbmFibGVkIG9uZSB3aW5zIHwKfCBgZm9udGAgfCBhIGJpdG1hcCBmb250LCBgeyAidyIsICJoIiwgImdseXBocyIgfWAsIG9uZSBzY2FubGluZSBudW1iZXIgcGVyIHJvdyB8IHRoZSBsYXN0IGVuYWJsZWQgb25lIHdpbnMgfAp8IGBwcmVmc2AgfCBhIEpTT04gcHJlZmVyZW5jZSBkb2N1bWVudDogdmlzdWFsIG92ZXJyaWRlcywgY29sb3Vycywgc291bmRzLCBhdXRvLWluc2NyaXB0aW9ucywgZW50cnkgcmVuZGVyZXJzIG9yIGtleW1hcHMuIEFTQ0lJIGdseXBocywgY29sb3VycyBhbmQgc291bmRzIGFwcGx5IGF0IGluc3RhbGwsIGFuZCBUSUxFIGFzc2lnbm1lbnRzIGxheWVyIG92ZXIgYSBncmFwaGljcyBwYWNrJ3Mgb3duIHByZWZzIG9uIGV2ZXJ5IG1hcCBidWlsZCB8ICoqYWxsIG9mIHRoZW0gYXBwbHkqKiwgaW4gbG9hZCBvcmRlciB8CnwgYGhlbHBgIHwgb25lIHBhZ2Ugb2YgcGxhaW4gdGV4dCB8IHBlciBgc2xvdGAgfAp8IGBhcnRgIHwgb25lIHNjcmVlbiBvZiBge2NvbG91cn0uLi57L31gIG1hcmt1cCB8IHBlciBgc2xvdGAgfAp8IGBsb2NhbGVgIHwgb25lIGxhbmd1YWdlLCBgc2xvdGAgYmVpbmcgaXRzIEJDUCA0NyB0YWcgfCBwZXIgYHNsb3RgIHwKCkZvdXIgdGhpbmdzIHRoYXQgd2lsbCBvdGhlcndpc2UgY29zdCB5b3UgYW4gYWZ0ZXJub29uOgoKLSAqKkEgcHJlZmVyZW5jZSBkb2N1bWVudCBhcHBsaWVzIGZvciB0aGUgc2Vzc2lvbiBvbmx5LioqIEl0IG5ldmVyIGNoYW5nZXMgdGhlIHBsYXllcidzIG93biBzYXZlZCBwcmVmZXJlbmNlcywgYW5kIGl0IHN0b3BzIGFwcGx5aW5nIHdoZW4geW91ciBtb2QgaXMgdHVybmVkIG9mZi4gQSBzdWJ3aW5kb3cgbGF5b3V0LCBvciBhbnkgZG9jdW1lbnQgb3V0c2lkZSB0aGF0IGxpc3QsIGlzIHJlcG9ydGVkIG9uIHlvdXIgbW9kJ3Mgcm93IGluc3RlYWQgb2YgYmVpbmcgYXBwbGllZC4KLSAqKkEgYC5qc29uYCByZXNvdXJjZSBtdXN0IHNpdCBpbiBhIHN1YmRpcmVjdG9yeS4qKiBBIHRvcC1sZXZlbCBgLmpzb25gIGlzIHJlYWQKICBhcyBhIHJlY29yZCBjb250cmlidXRpb24sIHNvIGBmb250Lmpzb25gIHdvdWxkIGJlIGhhbmRlZCB0byB0aGUgcmVjb3JkCiAgY29tcG9zZXIsIHdoaWNoIGhhcyBubyBjb250ZW50IGZpbGUgYnkgdGhhdCBuYW1lLCBhbmQgeW91ciBtb2Qgd291bGQgbG9hZCB3aXRoCiAgbm8gZm9udCBhbmQgbm8gY29tcGxhaW50IGFueXdoZXJlLiBgZm9udHMvZm9udC5qc29uYCBpcyBmaW5lLgotICoqYGFydGAgaXMgdGV4dCwgbm90IGFuIGltYWdlLioqIFRoZSB0ZXJtaW5hbCBpcyBhIGdseXBoIGdyaWQ7IG5vdGhpbmcgcGFpbnRzIGEKICBiaXRtYXAgaW50byBpdC4gVXBzdHJlYW0ncyBvd24gc3BsYXNoIGlzIHRleHQgKGBsaWIvc2NyZWVucy9uZXdzLnR4dGApLCBhbmQKICBgJFZFUlNJT05gIGlzIHN1YnN0aXR1dGVkIGluIHlvdXJzIGV4YWN0bHkgYXMgaXQgaXMgaW4gdGhhdCBvbmUuIFlvdXIgYXJ0IGlzCiAgY2xhbXBlZCB0byAyMSByb3dzIGFuZCB0aGUgdHdvIGNyZWRpdCBsaW5lcyBhcmUgYXBwZW5kZWQgYWZ0ZXIgaXQuCi0gKipBIGBoZWxwYCBzbG90IHRoYXQgbWF0Y2hlcyBvbmUgb2YgdGhlIGdhbWUncyBSRVBMQUNFUyB0aGF0IHBhZ2UqKjsgYW55IG90aGVyCiAgc2xvdCBhZGRzIG9uZS4gVGhlIGlkcyBhcmUgYGNvbW1hbmRzYCwgYHN5bWJvbHNgLCBgZ3VpZGVgLCBgY29tbXVuaXR5YC4gVXNlIG9uZQogIG9mIHRob3NlIGlmIHlvdXIgY29udmVyc2lvbidzIGtleXMgYXJlIG5vdCBBbmdiYW5kJ3M7IHVzZSB5b3VyIG93biBvdGhlcndpc2UuCgojIyMgV2hhdCBoYXBwZW5zIHdoZW4gYSByZXNvdXJjZSBpcyB3cm9uZwoKTm90aGluZyBpcyB0YWtlbiBhd2F5IGV4Y2VwdCB0aGF0IHJlc291cmNlLiBBIHByZWYgZmlsZSB0aGF0IHdpbGwgbm90IHBhcnNlIGNvc3RzCnlvdSB0aGUgcHJlZiBmaWxlLCBub3QgeW91ciByZWNvcmRzLCBub3QgeW91ciBzb3VuZCBwYWNrLCBub3QgdGhlIG1vZC4gQnV0IGl0IGlzCm5ldmVyIHNpbGVudDogd2hhdGV2ZXIgY291bGQgbm90IGJlIHVzZWQgaXMgd3JpdHRlbiBvbiB5b3VyIG1vZCdzIHJvdyBpbiB0aGUgbW9kCm1hbmFnZXIsIGluIGEgc2VudGVuY2Ugc2F5aW5nIHdoYXQgd2FzIHdyb25nIHdpdGggaXQuCgpUaHJlZSBjaGVja3MgcnVuLCBhbmQgdGhlIGxhc3Qgb25lIGNhbiBvbmx5IHJ1biBvbiB0aGUgcGxheWVyJ3MgbWFjaGluZToKCjEuICoqWW91ciBkZWNsYXJhdGlvbioqLCBhdCBidWlsZCB0aW1lIGFuZCBhZ2FpbiBhdCBsb2FkOiBhbiB1bmtub3duIGtpbmQsIGEgcGF0aAogICBsZWF2aW5nIHlvdXIgZm9sZGVyLCBhbiBleHRlbnNpb24gdGhlIGtpbmQgY2Fubm90IGJlLCBhIHNsb3Qgbm8gc2NyZWVuIHBhaW50cy4KICAgQSBgc2xvdGAgb24gYSBraW5kIHRoYXQgaGFzIG5vIHNsb3RzIGlzIHJlZnVzZWQgcmF0aGVyIHRoYW4gaWdub3JlZCwgYmVjYXVzZSBhCiAgIHNpbGVudGx5IGRyb3BwZWQga2V5IGlzIGEgYmVsaWVmIG9mIHlvdXJzIHRoYXQgd291bGQgc3Vydml2ZSB0byBzaGlwLgoyLiAqKllvdXIgZmlsZSBsaXN0LioqIEEgbW9kIHJlYWQgZnJvbSBhIGZvbGRlciBvciBpbnN0YWxsZWQgZnJvbSBhIHJlcG9zaXRvcnkKICAgYXJyaXZlcyB3aXRoIGV2ZXJ5IGZpbGVuYW1lIGl0IGhvbGRzLCBzbyBhIHR5cG8gaXMgY2F1Z2h0IHdpdGhvdXQgYSBzaW5nbGUKICAgcmVxdWVzdC4gKE5vdCBhdmFpbGFibGUgZm9yIGEgbW9kIGNvbXBpbGVkIGludG8gdGhlIGFwcDsgY2hlY2sgMyBjYXRjaGVzCiAgIHRob3NlLikKMy4gKipUaGUgbWFjaGluZS4qKiBXaGV0aGVyIHRoaXMgYnVpbGQgY2FuIHBsYXkgYC5tcDNgIG9yIGAub2dnYCBhdCBhbGwsIGFuZAogICB3aGV0aGVyIHlvdXIgZm9udCBKU09OIGlzIHN0cnVjdHVyYWxseSBhIGZvbnQuIE9ubHkgb3BlbmluZyB0aGUgZmlsZSBjYW4gc2F5LgoKYGRlbW8tcmVzb3VyY2VzYCBpcyBhIHdvcmtpbmcgZXhhbXBsZSBvZiBmb3VyIG9mIHRoZSBzaXgsIGFuZApgcGFja2FnZXMvd2ViL3NyYy9tb2QtcmVzb3VyY2VzLm5vZGUudGVzdC50c2AgcmVhZHMgaXQgZnJvbSBkaXNrIGluIENJLiBJdCBpcyBub3QKYSBtb2QgeW91IGNhbiBpbnN0YWxsOiB0aGUgYGRlbW8tKmAgbW9kcyB1bmRlciBgcGFja2FnZXMvd2ViL21vZHMvYCBhcmUgZnJhbWV3b3JrCnByb29mcyBjb21waWxlZCBpbnRvIERFViBidWlsZHMgb25seSwgYW5kIGRpc2NvdmVyeSBzdHJpcHMgdGhlbSBmcm9tIGEgcmVsZWFzZQpidWlsZCAoYGlzU2hpcHBlZE1vZGAsIGBwYWNrYWdlcy93ZWIvc3JjL21vZC1zdG9yZS50c2ApLiBSZWFkIGl0IGluIHRoaXMKcmVwb3NpdG9yeSByYXRoZXIgdGhhbiBsb29raW5nIGZvciBpdCBpbiB0aGUgZ2FtZS4KCi0tLQoKIyMjIEFydCBmb3IgcmVzdG9yZWQgcmVjb3JkcwoKQSBtb2QgdGhhdCBicmluZ3MgYmFjayBzb21ldGhpbmcgQW5nYmFuZCBjdXQgY2FuIGdpdmUgaXQgdGhlIHRpbGUgaXQgdXNlZCB0byBoYXZlLiBUaHJlZSBtYW5pZmVzdCBmaWVsZHMgaG9sZCB0aGF0IGFydCwgZWFjaCBrZXllZCBieSB0aGUgdGlsZS1wYWNrIGRpcmVjdG9yeSAoYG9sZGAsIGBhZGFtLWJvbHRgLCBgZ2VydmFpc2AsIGBub21hZGAsIGBzaG9ja2JvbHRgKSwgYW5kIGVhY2ggcGFjayBlbnRyeSBpcyBlaXRoZXIgYSBjZWxsIG9uIHRoYXQgcGFjaydzIHNoZWV0IG9yIGFuIGltYWdlIGluc2lkZSB5b3VyIG1vZCBmb2xkZXI6CgpgYGBqc29uCiJyZXN0b3JlZEl0ZW1BcnQiOiBbCiAgeyAia2luZCI6ICJmcm9zdDpoYXJkLWFybW9yOnJ1c3R5LWNoYWluLW1haWwiLCAicGFja3MiOiB7ICJvbGQiOiB7ICJyb3ciOiAxMSwgImNvbCI6IDIwIH0gfSB9Cl0sCiJyZXN0b3JlZE1vbnN0ZXJBcnQiOiBbCiAgeyAicmFjZSI6ICJmcm9zdDptYXR1cmUtYnJvbnplLWRyYWdvbiIsICJwYWNrcyI6IHsgIm5vbWFkIjogeyAiYXNzZXQiOiAiYXJ0L2Jyb256ZS5wbmciIH0gfSwgImh1ZSI6IDQwIH0KXSwKInJlc3RvcmVkRmxhdm9yQXJ0IjogWwogIHsgImZsYXZvciI6IDMwMywgImRyYXdBcyI6IDI4LCAiaHVlIjogOTAgfQpdCmBgYAoKLSBgcmVzdG9yZWRJdGVtQXJ0YCBuYW1lcyBhbiBvYmplY3Qga2luZCBieSBpZCwgYW5kIGByZXN0b3JlZE1vbnN0ZXJBcnRgIG5hbWVzIGEgbW9uc3RlciBieSBpZC4KLSBgcmVzdG9yZWRGbGF2b3JBcnRgIG5hbWVzIGEgZmxhdm91ciBieSBpdHMgaW5kZXggaW4gYGZsYXZvci5qc29uYC4gYGRyYXdBc2AgbWFrZXMgaXQgZHJhdyBhbm90aGVyIGZsYXZvdXIncyB0aWxlIGluIGV2ZXJ5IHBhY2ssIGFuZCBhIGBwYWNrc2AgZW50cnkgb3ZlcnJpZGVzIHRoYXQgZm9yIG9uZSBwYWNrLgotIEEgZmxhdm91ciB5b3VyIG1vZCBhZGRzIG9ubHkgaW5zaWRlIGEgc2VjdGlvbiBnZXRzIGl0cyBhcnQgb25seSB3aGlsZSB0aGF0IHNlY3Rpb24gaXMgb24uIFdpdGggdGhlIHNlY3Rpb24gb2ZmLCBhbm90aGVyIG1vZCBtYXkgYWRkIGEgZmxhdm91ciBhdCB0aGUgc2FtZSBpbmRleCwgYW5kIHlvdXIgYXJ0IGlzIG5vdCBkcmF3biBvbiBpdC4KLSBBcnQgb25seSBmaWxscyBhIHNsb3QgdGhlIHBhY2sncyBvd24gcHJlZiBmaWxlcyBsZWZ0IGVtcHR5LCBzbyBhIHBhY2sgdGhhdCBhbHJlYWR5IGRyYXdzIHRoZSB0aGluZyBrZWVwcyBpdHMgb3duIHBpY3R1cmUuCi0gYGh1ZWAgcm90YXRlcyB0aGUgdGlsZSdzIGNvbG91cnMgYnkgdGhhdCBtYW55IGRlZ3JlZXMgaW4gdGhlIExpbm9sZXVtIGVuZ2luZSwgd2hpY2ggY2FuIHJlY29sb3VyLiBVc2UgaXQgd2hlbiBhIHJlc3RvcmVkIHRoaW5nJ3Mgb2xkIHRpbGUgaXMgYWxzbyB0aGUgdGlsZSBvZiB0aGUgdGhpbmcgdGhhdCByZXBsYWNlZCBpdCwgc28gdGhlIHR3byBjYW4gYmUgdG9sZCBhcGFydC4gQW5nYmFuZCdzIG93biB0aWxlIHNoZWV0cyBjYW4ndCByZWNvbG91ciwgc28gdGhlcmUgdGhlIHRpbGUgaXMgZHJhd24gYXMgaXQgaXMuCgojIyBUcmFuc2xhdGluZyB0aGUgZ2FtZQoKRW5nbGlzaCBzaGlwcyBpbiB0aGUgZ2FtZSBhbmQgaXMgd2hhdCBhIHBsYXllciBzZWVzIHdpdGggbm8gbW9kIGluc3RhbGxlZC4gQQp0cmFuc2xhdGlvbiBpcyBhIGBsb2NhbGVgIHJlc291cmNlLCBhIEpTT04gZmlsZSB3aG9zZSBgc2xvdGAgaXMgaXRzIGxhbmd1YWdlCnRhZzoKCmBgYGpzb24KewogICJ0YWciOiAiZGUiLAogICJuYW1lIjogIkRldXRzY2giLAogICJtZXNzYWdlcyI6IHsKICAgICJoZWxwLmNvbW1hbmRzLmxhYmVsIjogIlZlcmbDvGdiYXJlIEJlZmVobGUiLAogICAgInNob3Auc3RvY2siOiAie24sIHBsdXJhbCwgb25lIHsjIEdlZ2Vuc3RhbmR9IG90aGVyIHsjIEdlZ2Vuc3TDpG5kZX19IgogIH0KfQpgYGAKCmB0YWdgIG11c3QgbWF0Y2ggdGhlIGBzbG90YCB0aGF0IGRlY2xhcmVkIHRoZSBmaWxlLiBUaGV5IGFyZSB0d28gc3RhdGVtZW50cyBvZgp0aGUgc2FtZSBmYWN0IGFuZCB0aGUgY2hlY2sgcmVmdXNlcyB0aGVtIHdoZW4gdGhleSBkaXNhZ3JlZTogdGhlIHNsb3QgZGVjaWRlcwp3aGljaCBsYW5ndWFnZSB5b3VyIGZpbGUgKmlzIG9mZmVyZWQgYXMqLCBhbmQgdGhlIHRhZyBkZWNpZGVzIHdoYXQgaXQgKmlzKi4KCioqWW91IGRvIG5vdCBoYXZlIHRvIHRyYW5zbGF0ZSBldmVyeXRoaW5nLioqIEEgbWlzc2luZyBpZCBmYWxscyBiYWNrIHRocm91Z2ggdGhlCnJlZ2lvbiAoYHB0LUJSYCAtPiBgcHRgKSB0byBFbmdsaXNoLCBzbyBhIHBhcnRpYWwgY2F0YWxvZ3VlIHJlYWRzIGFzIHBhcnQgRW5nbGlzaApyYXRoZXIgdGhhbiBhcyBhIHNjcmVlbiBvZiBibGFua3MuCgojIyMgUGF0dGVybnMsIG5vdCBzZW50ZW5jZXMgeW91IGdsdWUgdG9nZXRoZXIKCk1lc3NhZ2VzIGFyZSBbSUNVIE1lc3NhZ2VGb3JtYXRdKGh0dHBzOi8vdW5pY29kZS1vcmcuZ2l0aHViLmlvL2ljdS91c2VyZ3VpZGUvZm9ybWF0X3BhcnNlL21lc3NhZ2VzLyksCmEgc3Vic2V0LCBidXQgdGhlIG9yZGluYXJ5IG9uZSwgc28gb3JkaW5hcnkgdHJhbnNsYXRpb24gdG9vbHMgY2FuIGVkaXQgeW91cgpmaWxlOgoKfCB5b3Ugd3JpdGUgfCB5b3UgZ2V0IHwKfCAtLS0gfCAtLS0gfAp8IGB7bmFtZX1gIHwgdGhlIHZhbHVlIHwKfCBge24sIG51bWJlcn1gIHwgZ3JvdXBlZCBmb3IgeW91ciBsb2NhbGUgKGAxLjIzNC41NjdgIGluIEdlcm1hbikgfAp8IGB7biwgcGx1cmFsLCBvbmUgeyMgcmluZ30gb3RoZXIgeyMgcmluZ3N9fWAgfCB0aGUgcmlnaHQgYXJtLCBgI2AgYmVpbmcgdGhlIG51bWJlciB8CnwgYHtuLCBwbHVyYWwsID0wIHtub3RoaW5nfSBvdGhlciB7I319YCB8IGFuIGV4YWN0IHZhbHVlIHNob3J0LWNpcmN1aXRzIHRoZSBydWxlcyB8CnwgYHtnLCBzZWxlY3QsIG1hbGUge0VyfSBmZW1hbGUge1NpZX0gb3RoZXIge0VzfX1gIHwgYW4gZXhhY3QgbWF0Y2ggfAp8IGB7biwgc2VsZWN0b3JkaW5hbCwgb25lIHsjLn0gb3RoZXIgeyMufX1gIHwgb3JkaW5hbHMgfAp8IGAne2AgfCBhIGxpdGVyYWwgYnJhY2UgfAoKKipVc2UgdGhlIHBsdXJhbCBhcm1zIHlvdXIgbGFuZ3VhZ2UgYWN0dWFsbHkgaGFzLioqIFRoZXkgY29tZSBmcm9tIHRoZSBwbGF0Zm9ybSdzCm93biBydWxlcywgc28gUG9saXNoIGdldHMgYG9uZWAvYGZld2AvYG1hbnlgL2BvdGhlcmAgYW5kIEFyYWJpYyBnZXRzIHNpeCwgYW5kIHRoZQpnYW1lIG5ldmVyIGhhcyB0byBrbm93IHdoaWNoLiBXcml0aW5nIGEgYmFyZSBge259IFJpbmdlYCBhbmQgbGV0dGluZyB0aGUgbnVtYmVyCmRvIHRoZSB3b3JrIGlzIHRoZSBzaW5nbGUgbW9zdCBjb21tb24gd2F5IGEgdHJhbnNsYXRpb24gZW5kcyB1cCB3cm9uZy4KCiMjIyBXaGVuIHdvcmRzIGFyZSBub3QgZW5vdWdoCgpTb21lIHRleHQgaXMgKmFzc2VtYmxlZCosIG5vdCB3cml0dGVuLiBBbiBvYmplY3QncyBuYW1lIGlzIGJ1aWx0IGZyb20gYSBwYXR0ZXJuCmxpa2UgYCYgU2Nyb2xsfiB0aXRsZWQgI2AuIFRoZSBgfmAgaXMgYW4gRW5nbGlzaCBwbHVyYWxpemVyLCB0aGUgYCZgIGJlY29tZXMKYGFgL2BhbmAgYnkgdGhlIHZvd2VsIGFmdGVyIGl0LCBhbmQgdGhlIGNvdW50IGdvZXMgaW4gZnJvbnQuIElmIHlvdXIgbGFuZ3VhZ2UKY291bnRzIHdpdGggYSBjbGFzc2lmaWVyLCBpbmZsZWN0cyBmb3IgY2FzZSwgb3IgaGFzIG5vIHBsdXJhbCBgc2AsIG5vIGFtb3VudCBvZgp3b3JkIHJlcGxhY2VtZW50IHdpbGwgZ2V0IHlvdSB0aGVyZS4KCkZvciB0aGF0LCBhIGxvY2FsZSByZXBsYWNlcyB0aGUgKipmdW5jdGlvbioqLiBUaG9zZSBsaXZlIGluIGNvZGUsIHNvIGEKdHJhbnNsYXRpb24gdGhhdCBuZWVkcyB0aGVtIHNoaXBzIGEgYHBsdWdpbi5qc2AgYWxvbmdzaWRlIGl0cyBKU09OIGFuZCBjYWxscwpjb3JlJ3MgYHJlZ2lzdGVyTG9jYWxlYCB3aXRoIGl0cyBvd24gYGZvcm1zYDoKCmBgYGpzCmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlcihob3N0LCBjdHgpIHsKICBjb25zdCBjb3JlID0gY3R4LmNvcmUuY29yZUZvcm1zKCk7CiAgY3R4LmNvcmUucmVnaXN0ZXJMb2NhbGUoewogICAgdGFnOiAiZGUiLAogICAgZm9ybXM6IHsKICAgICAgLy8gRW5nbGlzaCdzIG1hY2hpbmVyeSBmb3IgZXZlcnl0aGluZyBleGNlcHQgdGhlIG5vdW5zIHlvdSBjYXJlIGFib3V0CiAgICAgIG9iamVjdE5hbWVGb3JtYXQ6IChmbXQsIG1vZHN0ciwgcGx1cmFsKSA9PgogICAgICAgIGZtdC5pbmNsdWRlcygiU2Nyb2xsIikKICAgICAgICAgID8gKHBsdXJhbCA/ICJSb2xsZW4iIDogIlJvbGxlIikKICAgICAgICAgIDogY29yZS5vYmplY3ROYW1lRm9ybWF0KGZtdCwgbW9kc3RyLCBwbHVyYWwpLAogICAgfSwKICB9KTsKfQpgYGAKCmBjb3JlRm9ybXMoKWAgaXMgd2hhdCBtYWtlcyB0aGlzIGEgc21hbGwgam9iIHJhdGhlciB0aGFuIGEgcmV3cml0ZTogdGFrZQpFbmdsaXNoJ3MgaW1wbGVtZW50YXRpb24sIHNwZWNpYWwtY2FzZSB3aGF0IHlvdXIgbGFuZ3VhZ2UgZG9lcyBkaWZmZXJlbnRseSwgYW5kCmRlbGVnYXRlIHRoZSByZXN0LgoKIyMjIEZpbmRpbmcgd2hhdCBpcyBub3QgdHJhbnNsYXRlZCB5ZXQKCk5vdCBldmVyeSBzdHJpbmcgaW4gdGhlIGdhbWUgaGFzIGJlZW4gcm91dGVkIHRocm91Z2ggdGhlIHRyYW5zbGF0b3IgeWV0LiBBCioqcHNldWRvLWxvY2FsZSoqIGlzIGhvdyB5b3UgZmluZCB0aGUgb25lcyB0aGF0IGhhdmUgbm90OiB0aGUgYnVuZGxlZApgZGVtby1yZXNvdXJjZXNgIG1vZCBzaGlwcyBgZW4tWEFgLCByZWFkYWJsZSBFbmdsaXNoIHdpdGggZXZlcnkgbGV0dGVyIGFjY2VudGVkCmFuZCBldmVyeSBzdHJpbmcgYnJhY2tldGVkLiBFbmFibGUgaXQsIHN3aXRjaCB0byBpdCB3aXRoIGA/bGFuZz1lbi1YQWAsIGFuZAphbnl0aGluZyBzdGlsbCBpbiBwbGFpbiBBU0NJSSBvbiB0aGUgc2NyZWVuIGlzIGEgc3RyaW5nIHRoYXQgY2Fubm90IHlldCBiZQp0cmFuc2xhdGVkLiBUaG9zZSBhcmUgd29ydGggcmVwb3J0aW5nLgoKLS0tCgojIyBSZW5hbWluZyBhIHBsYXllci10b2dnbGVhYmxlIHJ1bGUKCkEgcnVsZSBgZmxhZ2AgaXMgZHVyYWJsZSBwbGF5ZXIgc3RhdGUuIFRoZSBwbGF5ZXIncyBjaG9pY2UgaXMgc3RvcmVkIGFnYWluc3QgdGhhdCBleGFjdCBzdHJpbmcgaW4gdGhlIGhvc3QncyBvd24gc3RvcmUsIHNvIHJlcGxhY2luZyBhIGZsYWcgb3V0cmlnaHQgb3JwaGFucyB0aGUgY2hvaWNlOiB0aGUgbG9va3VwIG1pc3NlcywgdGhlIHJ1bGUgZmFsbHMgYmFjayB0byBpdHMgZGVjbGFyZWQgYGRlZmF1bHRgLCBhbmQgc29tZW9uZSB3aG8gdHVybmVkIHlvdXIgZml4IG9mZiBnZXRzIGl0IGJhY2sgb24gd2l0aG91dCBiZWluZyB0b2xkLiBGb3IgYSBidWctZml4ZXMgbW9kLCB3aG9zZSBkZWZhdWx0cyBhcmUgYWxsIG9uLCB0aGF0IG1lYW5zIHRoZSBnYW1lIHF1aWV0bHkgcmUtYXBwbGllcyBhIGNoYW5nZSB0aGUgcGxheWVyIGhhZCByZWplY3RlZC4KClNvIGluc3RlYWQgb2Ygc2ltcGx5IHJlcGxhY2luZyBhIGZsYWcsIG1hcCBlYWNoIHJldGlyZWQgZmxhZyB0byBpdHMgY3VycmVudCBydWxlIHVuZGVyIGByZW5hbWVkUnVsZUZsYWdzYDoKCmBgYGpzb24KInJlbmFtZWRSdWxlRmxhZ3MiOiB7CiAgImJ1Zy1maXhlcy5hdG9taWMtc2F2ZSI6ICJidWctZml4ZXMuc2F2ZS1zYWZldHkiLAogICJidWctZml4ZXMuYXRvbWljLWNyYXNoIjogImJ1Zy1maXhlcy5zYXZlLXNhZmV0eSIKfQpgYGAKCkV2ZXJ5IGRlc3RpbmF0aW9uIG11c3QgYmUgb25lIG9mIHRoaXMgbWFuaWZlc3QncyBjdXJyZW50IGBydWxlc2AuIEEgc291cmNlIG11c3Qgbm90IGJlIG9uZTogYSBmbGFnIHlvdSBzdGlsbCBkZWNsYXJlIGlzIGxpdmUsIGFuZCB0cmVhdGluZyBpdHMgc3RvcmVkIGNob2ljZSBhcyByZXRpcmVkIHdvdWxkIGRlc3Ryb3kgYSBzZXR0aW5nIHlvdSBzdGlsbCBleHBvc2UuIFJlbmFtaW5nIGEgZmxhZyB0byBpdHNlbGYgaXMgcmVmdXNlZCBmb3IgdGhlIHNhbWUgcmVhc29uLgoKVGhlIGhvc3QgbWlncmF0ZXMgc2F2ZWQgY2hvaWNlcyB3aGVuIGl0IGxvYWRzIHlvdXIgZW5hYmxlZCBtb2QsIGJlZm9yZSBpdCByZXNvbHZlcyBkZWZhdWx0cy4gV2hlbiBzZXZlcmFsIHJldGlyZWQgZmxhZ3MgYmVjb21lIG9uZSBydWxlLCB0aGUgcmVzdWx0IGlzIG9uIGlmIGFueSBvZiB0aGVtIHdhcyBvbi4gVHVybmluZyBvZmYgYSBmaXggdGhlIHBsYXllciBoYWQgb24gd291bGQgYnJpbmcgYmFjayBhIGJ1ZyB0aGV5IGNob3NlIHRvIGJlIHJpZCBvZiwgd2hlcmVhcyByZS1lbmFibGluZyBhIHNpYmxpbmcgaXMgdGhlIHNtYWxsZXIgc3VycHJpc2UsIGFuZCB0aGV5IGNhbiBzdGlsbCB0dXJuIHRoZSB3aG9sZSBydWxlIG9mZi4gQSBjaG9pY2UgYWxyZWFkeSByZWNvcmRlZCBmb3IgdGhlIGN1cnJlbnQgZmxhZyB3aW5zIG91dHJpZ2h0LCBzaW5jZSBpdCB3YXMgbWFkZSBhZ2FpbnN0IHRoZSBuZXcgcmVsZWFzZS4gVGhlIG9sZCBlbnRyaWVzIGFyZSB0aGVuIGNvbnN1bWVkLCBzbyBsb2FkaW5nIGFnYWluIGNoYW5nZXMgbm90aGluZy4KCi0tLQoKIyMgUmVuYW1pbmcgYSBzZWN0aW9uIG9yIHR1cm5pbmcgYSBydWxlIGludG8gYSBzZWN0aW9uCgpTZWN0aW9ucyBwZXJzaXN0IHRoZWlyIGNob2ljZXMgc2VwYXJhdGVseSBmcm9tIHJ1bGVzLCB1bmRlciB0aGUgb3duaW5nIG1vZCBhbmQKdGhlIHNlY3Rpb24ncyBgaWRgLiBJZiB5b3UgcmVuYW1lIGEgc2VjdGlvbiwgb3IgcHJvbW90ZSBhIGBydWxlc1tdYCBlbnRyeSBpbnRvIGEKc2VjdGlvbiBzbyBpdCBjYW4gZ2F0ZSBjb250ZW50LCBwdXQgaXRzIG9sZCBuYW1lcyBpbiB0aGUgbmV3IHNlY3Rpb24ncwpgcmVuYW1lZFNlY3Rpb25GbGFnc2AgbGlzdDoKCmBgYGpzb24KInNlY3Rpb25zIjogWwogIHsKICAgICJpZCI6ICJ0ZXh0LWNvcnJlY3Rpb25zIiwKICAgICJ0aXRsZSI6ICJUZXh0IGNvcnJlY3Rpb25zIiwKICAgICJmbGFnIjogImJ1Z2ZpeC50ZXh0QW5kSGlzdG9yeSIsCiAgICAicmVuYW1lZFNlY3Rpb25GbGFncyI6IFsiYnVnZml4LnRleHRBbmRIaXN0b3J5IiwgIm9sZC10ZXh0LWNvcnJlY3Rpb25zIl0KICB9Cl0KYGBgCgpFYWNoIG5hbWUgbWF5IGZpbmQgZWl0aGVyIGEgcmV0aXJlZCBydWxlIGNob2ljZSBvciBhIHJldGlyZWQgc2VjdGlvbiBjaG9pY2UuIEZvcgphIHByZXZpb3VzIHNlY3Rpb24gdXNpbmcgaXRzIGRlZmF1bHQgZmxhZywgdGhhdCBuYW1lIGlzIGl0cyBvbGQgYGlkYCwgd2hpY2ggaXMKYWxzbyB0aGUga2V5IHRoZSBob3N0IHN0b3JlZDsgYSBwcmV2aW91cyBzZWN0aW9uIHdpdGggYSBjdXN0b20gYGZsYWdgIHN0aWxsIHVzZXMKaXRzIG9sZCBgaWRgIGZvciB0aGlzIHB1cnBvc2UuIExpc3RpbmcgdGhlIGN1cnJlbnQgYGZsYWdgIGlzIHZhbGlkIGFuZCBpcyBob3cgYQpydWxlIHRoYXQgYmVjYW1lIGEgc2VjdGlvbiB1bmRlciB0aGUgc2FtZSBuYW1lIHByZXNlcnZlcyBpdHMgZXhpc3RpbmcgY2hvaWNlLgoKQW4gZXhwbGljaXQgY2hvaWNlIGFscmVhZHkgc3RvcmVkIGZvciB0aGUgY3VycmVudCBzZWN0aW9uIHdpbnMuIE90aGVyd2lzZSB0aGUKaG9zdCBjaGVja3MgYHJlbmFtZWRTZWN0aW9uRmxhZ3NgIGluIGxpc3Qgb3JkZXIgYW5kIGNvcGllcyB0aGUgZmlyc3QgbWF0Y2hpbmcKY2hvaWNlIGludG8gdGhlIGN1cnJlbnQgc2VjdGlvbjsgaWYgYm90aCBzdG9yZXMgaGFwcGVuIHRvIGNhcnJ5IHRoZSBzYW1lIG9sZApuYW1lLCB0aGUgb2xkIHNlY3Rpb24gY2hvaWNlIHdpbnMuIEl0IGNvbnN1bWVzIHJldGlyZWQgZW50cmllcyBhZnRlcndhcmRzLCBzbyBhCmxhdGVyIGxvYWQgaXMgdW5jaGFuZ2VkLiBXaXRoIG5vIGN1cnJlbnQgb3IgcmV0aXJlZCBjaG9pY2UsIHRoZSBzZWN0aW9uIHVzZXMgaXRzCmRlY2xhcmVkIGBkZWZhdWx0YCBhcyB1c3VhbC4KCkEgc2VjdGlvbiB3aG9zZSBjb250ZW50IG11c3Qga2VlcCBzdGFibGUgcG9zaXRpb25zIGluIGFuIGV4aXN0aW5nIGNoYXJhY3RlciBjYW4KZGVjbGFyZSBgImxvY2tlZEF0QmlydGgiOiB0cnVlYC4gVGhlIGhvc3Qgc2F2ZXMgaXRzIG9uL29mZiBjaG9pY2Ugd2hlbiB0aGUKY2hhcmFjdGVyIGlzIGNyZWF0ZWQgYW5kIHVzZXMgdGhhdCBjaG9pY2Ugd2hlbmV2ZXIgaXQgbG9hZHMgdGhlIGNoYXJhY3Rlci4KQ2hhbmdpbmcgdGhlIHRvZ2dsZSB0aGVuIGFmZmVjdHMgbmV3IGNoYXJhY3RlcnMgb25seS4gSW4gYW4gb2xkZXIgc2F2ZSB3aXRob3V0CmBzZWN0aW9uQmlydGhgLCBvciB3aGVuIGEgbG9ja2VkIHNlY3Rpb24gaGFzIG5vIGVudHJ5IGluIHRoYXQgdGFibGUsIHRoZSBzZWN0aW9uCmlzIG9mZiB1bmxlc3MgaXRzIGRlY2xhcmVkIGBkZWZhdWx0YCBpcyBvbi4gSWYgYSBzYXZlZCBsb2NrZWQgc2VjdGlvbiBpcyBvbiBidXQKaXRzIG1vZCBpcyBub3QgbG9hZGVkLCB0aGUgZ2FtZSB3YXJucyBhbmQgbmFtZXMgdGhlIG1vZCBhbmQgc2VjdGlvbiBiZWZvcmUgbG9hZC4KCi0tLQoKIyMgRnJvbnQtZW5kIGdyb3VuZHdvcmsKCiMjIyBJbml0aWFsaXplIG5ld2x5IGNyZWF0ZWQgY2hhcmFjdGVycwoKQSBwbHVnaW4ncyBgaG9va3MoY3R4KWAgY2FuIHJldHVybiB0aGUgYG5ld0NoYXJhY3RlcihzdGF0ZSwgcmVnaXN0cmllcylgIGhvb2suIFRoZSBob3N0IGNhbGxzIGl0IG9uY2UgYWZ0ZXIgY29yZSBoYXMgYnVpbHQgYW5kIHdpcmVkIGEgbmV3IGNoYXJhY3Rlci4gSXQgbmV2ZXIgcnVucyB3aGlsZSBhIHNhdmUgaXMgbG9hZGVkIG9yIGEgZ2FtZSBpcyByZWxvYWRlZC4gVGhlIGhvb2sgY2FuIGluaXRpYWxpemUgbGl2ZSBjaGFyYWN0ZXIgc3RhdGUsIGluY2x1ZGluZyBgc3RhdGUuaWdub3JlYDsgYW55dGhpbmcgaXQgc2V0cyBiZWNvbWVzIG9yZGluYXJ5IGNoYXJhY3RlciBzdGF0ZSBhbmQgaXMgc2F2ZWQgd2l0aCB0aGF0IGNoYXJhY3Rlci4KCmBgYGpzCmhvb2tzKCkgewogIHJldHVybiB7CiAgICBuZXdDaGFyYWN0ZXIoc3RhdGUsIHJlZ2lzdHJpZXMpIHt9CiAgfTsKfQpgYGAKClRoZSBob3N0IGRyYXdzIHRocm91Z2ggYSByZW5kZXJlci1uZXV0cmFsIGBHcmlkU3VyZmFjZWAsIGFuZCB0aGUgZXhpc3RpbmcgY2FudmFzIHRlcm1pbmFsIGlzIG9uZSBpbXBsZW1lbnRhdGlvbiBvZiBpdC4gTWVudXMgYXJlIGRlY2xhcmF0aXZlIGZyb250LWVuZCBkYXRhLiBSZXF1ZXN0IGByZWdpc3RyeTptZW51YCBhbmQgY2FsbCBgaG9zdC5tZW51cy5yZWdpc3RlcigiY29yZTpnYW1lLW1lbnUiLCBmbilgIHRvIHJld3JpdGUgb25lIG5hbWVkIG1lbnUncyByb3dzLiBUaGUgaWQgaXMgc3RhYmxlIGFuZCBpcyBuZXZlciBhIGxvY2FsaXplZCB0aXRsZS4gRWFjaCByb3cgY2FycmllcyBhIHN0YWJsZSBpZCBwbHVzIGBzZW1hbnRpYy5raW5kYCwgYW4gb3B0aW9uYWwgYHNlbWFudGljLnJlZmAgYW5kIHNtYWxsIHNjYWxhciBgc2VtYW50aWMuZGF0YWAsIHNvIGFuIGFsdGVybmF0aXZlIGxheW91dCBjYW4gd29yayBmcm9tIHdoYXQgYSByb3cgbWVhbnMgaW5zdGVhZCBvZiBwYXJzaW5nIGl0cyBsYWJlbC4gSWYgeW91IG5lZWQgdG8gd3JhcCBhIHRyYW5zZm9ybWVyIGFuIGVhcmxpZXIgbW9kIGluc3RhbGxlZCwgY2FsbCBgaG9zdC5tZW51cy5oYW5kbGVyRm9yKGlkKWAgYmVmb3JlIHJlZ2lzdGVyaW5nLiBBIGZhaWxlZCB0cmFuc2Zvcm0gaXMgcmVwb3J0ZWQsIGFuZCB0aGUgdW5tb2RpZmllZCBtZW51IHN0aWxsIG9wZW5zLgoKYE1vZFBsdWdpbi5mcm9udGVuZD8oY3R4KWAgaXMgdGhlIHNpbmdsZSBtYXAtZGlzcGxheSBzbG90LiBUaGUgZnJvbnRlbmQgZW5hYmxlZCBsYXRlciBpbiBsb2FkIG9yZGVyIHdpbnMsIGFuZCBvbmx5IGl0cyBmYWN0b3J5IGlzIGludm9rZWQ7IHJldHVybiBhIGBXb3JsZEZyYW1lU2lua2AsIG9yIGB1bmRlZmluZWRgIHRvIGtlZXAgdGhlIGdseXBoIHRlcm1pbmFsLiBUaGUgaG9zdCBydW5zIHRoZSB3b3JsZC1yZW5kZXItZGF0YSBwcm9kdWNlciBmcm9tIGl0cyByZWFsIG1hcCByZXBhaW50IGFuZCBwYXNzZXMgdGhlIHdpbm5pbmcgZnJvbnRlbmQgYSBmcm96ZW4sIHJlbmRlcmVyLW5ldXRyYWwgYFdvcmxkRnJhbWVgIHNuYXBzaG90LiBHcmlkcyBrZWVwIHNlbWFudGljIHRlcnJhaW4sIHRyYXAsIG9iamVjdCwgbW9uc3RlciBhbmQgcGF0aCBpZHMgcGx1cyBzZWVuLCByZW1lbWJlcmVkIG9yIHVua25vd24gc3RhdGUuIFRoZSBnbHlwaCBwcm9qZWN0aW9uIGlzIG9ubHkgdGhlIGN1cnJlbnQgdGVybWluYWwgZmFsbGJhY2ssIGluY2x1ZGluZyBpdHMgdGVycmFpbi11bmRlci1mb3JlZ3JvdW5kIHRpbGUgaW5wdXRzLCBldmVuIGZvciBhIHBhdGggb3ZlciBvdGhlcndpc2UgYmFyZSBzZWVuIHRlcnJhaW4uIFRoZSB3b3JsZCBkYXRhIGlzIHRoZXJlZm9yZSByZWFkeSBmb3IgYW4gaXNvbWV0cmljIG9yIDNEIGNvbnN1bWVyLiBUeXBlU2NyaXB0IG1vZHMgY2FuIHdyaXRlIGBpbXBvcnQgdHlwZSB7IFdvcmxkRnJhbWUsIFdvcmxkRnJhbWVTaW5rIH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNkayJgOyB0aGUgaW1wb3J0IGlzIHR5cGUtb25seSwgc28gaXQgZG9lcyBub3QgYnJlYWsgdGhlIGZvbGRlci1wbHVnaW4gcnVsZSBhZ2FpbnN0IGJhcmUgcnVudGltZSBpbXBvcnRzLiBBIGNvbnRyb2wgdGVzdCBydW5zIHRoZSBzYW1lIHByb2R1Y2VyIGBtYWluLnRzYCBjYWxscywgY2hlY2tzIHRoZSB1bm1vZGRlZCBnbHlwaCBzaW5rJ3MgcHJlLWZyYW1lIGB0ZXJtLnB1dGAgdHVwbGVzLCBhbmQgY29uZmlybXMgdGhhdCBhbiBpbmRlcGVuZGVudGx5IG93bmVkIGhvc3Qgc2luayByZWNlaXZlcyB0aGF0IGV4YWN0IGZyYW1lIGluIHRoZSBzYW1lIGNhbGwuIEEgZGlzayBmaXh0dXJlIGNvbmZpcm1zIHRoYXQgdGhlIGxhdGVyIHBsdWdpbiByZWNlaXZlcyB0aGUgZnJhbWUgYW5kIHRoYXQgYW4gdW5tb2RkZWQgY29udHJvbCBzdGlsbCBwYWludHMgZ2x5cGhzLiBUaGUgc25hcHNob3QgaGFzIG5vIG11dGFibGUgcGxheWVyLWdyaWQgYWxpYXMsIHNvIGEgZnJvbnRlbmQgY2FuIGtlZXAgYSBmcmFtZSB3aXRob3V0IGtlZXBpbmcgbGl2ZSBnYW1lIHN0YXRlLgoKSW5wdXQgaXMgc3RhZ2VkIHRoZSBzYW1lIHdheS4gYFVpSW5wdXRgIGlzIGF2YWlsYWJsZSB0byBob3N0IGNvZGUgdGhyb3VnaCB0aGUgc2luZ2xlIGlucHV0IGRvb3IgYW5kIGNhbiByZXByZXNlbnQgYSBjb250aW51b3VzIGRpcmVjdGlvbiAodmVjdG9yLCBtYWduaXR1ZGUsIGFuZ2xlKSB3aXRob3V0IHRyYW5zbGF0aW5nIGl0IGludG8gYSBrZXlib2FyZCBhcnJvdy4gQSBwbHVnaW4gdGhhdCBkZWNsYXJlcyBga2V5bWFwOndyaXRlYCByZWNlaXZlcyBgY3R4LmtleW1hcHNgIGR1cmluZyBhIGxpdmUgZ2FtZTogYGJpbmQodHJpZ2dlciwgYWN0aW9uKWAgY2xhaW1zIGEgZnJlZSBrZXlib2FyZCB0cmlnZ2VyLCBgZW50cmllcygpYCBsaXN0cyBvbmx5IHRoYXQgbW9kJ3MgY2xhaW1zLCBhbmQgYHJlYmluZCgpYCBhbmQgYHJlbW92ZSgpYCBhY3Qgb25seSBvbiB0aG9zZSBjbGFpbXMuIEEgbW9kIGNhbm5vdCBpbnNwZWN0LCByZXBsYWNlIG9yIHJlbW92ZSBwbGF5ZXIgYmluZGluZ3Mgb3IgYW5vdGhlciBtb2QncyBiaW5kaW5ncy4gQSBwbGF5ZXIgZWRpdCB0YWtlcyBvd25lcnNoaXAgYmFjaywgYW5kIHdoZW4gYSBtb2QgaXMgZGlzYWJsZWQgb3IgcmVsb2FkZWQsIGhvc3QgdGVhcmRvd24gZmlyc3QgcmVtb3ZlcyBhbnkgYmluZGluZ3MgaXQgc3RpbGwgb3ducy4gYGlucHV0LWRvb3IudHNgIHN0YXlzIGhvc3QgaW5mcmFzdHJ1Y3R1cmUgYW5kIGlzIG5vdCBhIGNhcGFiaWxpdHkuIFBsYXllciBrZXltYXBzIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFueSBsYXRlciBpbnB1dCBjb25zdW1lciB3aGlsZSB0aGUgcm9vdCBvd25zIGlucHV0OyBhbiBhY3RpdmUgbW9kYWwsIHNjb3JlIHNjcmVlbiBvciBydW4gaW50ZXJydXB0aW9uIHN0aWxsIHJlY2VpdmVzIHRoZSBwbGF5ZXIncyBsaXRlcmFsIGtleSBmaXJzdC4KCiMjIEtub3dpbmcgd2hpY2ggbW9kIGEgcmVjb3JkIGNhbWUgZnJvbQoKRXZlcnkgcmVjb3JkIHRoZSBnYW1lIGJpbmRzIGNhcnJpZXMgYGZyb21gIHdoZW4gYSBtb2Qgd2FzIGludm9sdmVkLiBSZWFjaCBhIGJvdW5kCnJlY29yZCB0aGUgd2F5IHRoZSBiaW5kaW5nIGV4cG9zZXMgaXQgLSBhIG1vbnN0ZXIgcmFjZSB0aHJvdWdoIHRoZSBiaW5kaW5nJ3MKYHJhY2VzYCBhcnJheSwgYW4gb2JqZWN0IGtpbmQgdGhyb3VnaCBgcmVnaXN0cmllcy5vYmplY3RzLmtpbmRzYCwgYW5kIHNvIG9uOwp0aGVyZSBpcyBubyBzaW5nbGUgYGxvb2t1cGAgaGVscGVyIGZvciBldmVyeSByZWNvcmQgdHlwZToKCmBgYGpzCmNvbnN0IHJhY2UgPSBzb21lQm91bmRSYWNlOyAgIC8vIGUuZy4gZnJvbSBjdHgucmVnaXN0cmllcwpyYWNlLmZyb207ICAgICAgICAgICAgLy8geyBvd25lcjogImRlbW8tbW9kdGVzdCIgfSAgICAgICAgLSBhIG1vZCBBRERFRCBpdApzb21lQ29yZVJhY2UuZnJvbTsgICAgLy8geyBvd25lcjogImNvcmUiLCBtb2RpZmllZEJ5OiBbInFvbCJdIH0gLSBhIG1vZCBDSEFOR0VEIGl0CmFub3RoZXJDb3JlUmFjZS5mcm9tOyAvLyB1bmRlZmluZWQgICAgICAgICAgICAgICAgICAgICAgICAgIC0gY29yZSdzLCB1bnRvdWNoZWQKYGBgCgpgdW5kZWZpbmVkYCBpcyB0aGUgY29tbW9uIGNhc2UgYW5kIGl0IG1lYW5zICJjb3JlJ3Mgb3duLCBhbmQgbm90aGluZyB0b3VjaGVkCml0IiwgZXhhY3RseSBhcyBgZXh0YCBkb2VzLiBTbyBhIHBsdWdpbiBuZXZlciBoYXMgdG8gdGVsbCAibm8gbW9kIiBmcm9tICJhIG1vZAp0aGF0IGxlZnQgbm8gbWFyayIsIGFuZCBhIGNoZWNrIGxpa2UgYGlmIChyYWNlLmZyb20pIC4uLmAgcmVhZHMgY29ycmVjdGx5LgoKYG93bmVyYCBpcyB0aGUgcGFjayB0aGF0IEFEREVEIHRoZSByZWNvcmQuIEEgcGF0Y2ggZG9lcyBub3QgdHJhbnNmZXIgb3duZXJzaGlwOgppZiB5b3VyIG1vZCByZW5hbWVzIG9uZSBvZiBjb3JlJ3MgbW9uc3RlcnMsIHRoYXQgbW9uc3RlciBpcyBzdGlsbCBjb3JlJ3MgLSB0dXJuCnlvdXIgbW9kIG9mZiBhbmQgaXQgaXMgc3RpbGwgdGhlcmUgLSBzbyBgb3duZXJgIHN0YXlzIGBjb3JlYCBhbmQgeW91ciBpZCBqb2lucwpgbW9kaWZpZWRCeWAuIFRoaXMgbWF0dGVycyBiZXlvbmQgYm9va2tlZXBpbmcsIGJlY2F1c2UgKipgb3duZXJgIGlzIHRoZQpuYW1lc3BhY2UgYSBzYXZlZmlsZSBzdG9yZXMgdGhlIHJlY29yZCB1bmRlcioqLiBBIG1vbnN0ZXIgeW91ciBtb2QgYWRkcyBpcyBzYXZlZAphcyBgeW91cm1vZDppdHMtbmFtZWA7IGlmIGl0IHdlcmUgc2F2ZWQgYXMgYGNvcmU6aXRzLW5hbWVgLCBhIHBsYXllciB3aG8gcmVtb3ZlZAp5b3VyIG1vZCB3b3VsZCBoYXZlIGEgc2F2ZSBhc2tpbmcgdGhlIGJhc2UgZ2FtZSBmb3IgY29udGVudCBpdCBoYXMgbmV2ZXIgaGVhcmQKb2YsIHdpdGggbm90aGluZyBpbiB0aGUgaWQgdG8gc2F5IHdobyBzaG91bGQgaGF2ZSBzdXBwbGllZCBpdC4KCllvdSBkbyBub3Qgd3JpdGUgYGZyb21gIGFuZCB5b3UgY2Fubm90OiBpdCBpcyBzdGFtcGVkIGJ5IHRoZSBjb21wb3NlciB1bmRlciBhCnJlc2VydmVkIGtleSB0aGF0IG5vIG1vZCBjYW4gbWludCwgYmVjYXVzZSBhIG1vZCdzIG93biBmaWVsZHMgbXVzdCBiZSBuYW1lc3BhY2VkCmFuZCB0aGUgcmVzZXJ2ZWQga2V5IGlzIG5vdC4gV3JpdGluZyBgIiRmcm9tImAgaW50byB5b3VyIG93biBKU09OIGJ5IGhhbmQgaXMKaWdub3JlZC4KCiMjIFJlZ2VuZXJhdGluZyB0aGUgYmx1ZXByaW50IHRhYmxlCgpgcGFja2FnZXMvbW9kLXNkay9zcmMvYmx1ZXByaW50cy50c2AgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHNoaXBwZWQgcGFjazoKCmBgYGJhc2gKbm9kZSBwYWNrYWdlcy9tb2Qtc2RrL3NjcmlwdHMvZ2VuLWJsdWVwcmludHMubWpzCmBgYAoKRG8gbm90IGVkaXQgaXQgYnkgaGFuZC4gYGJsdWVwcmludHMudGVzdC50c2AgcmUtZGVyaXZlcyB0aGUgd2hvbGUgdGFibGUgZnJvbQpgcGFja2FnZXMvY29udGVudC9wYWNrYCBhbmQgZmFpbHMgaW4gYm90aCBkaXJlY3Rpb25zLCBhbmQgc2VwYXJhdGVseSBhc3NlcnRzCnRoYXQgaXQgYWdyZWVzLCBmaWxlIGZvciBmaWxlLCB3aXRoIGNvcmUncyBvd24gZ2VuZXJhdGVkIGBDT1JFX1JFQ09SRF9LRVlTYDoKdGhlIGRheSB0aG9zZSB0d28gZGlzYWdyZWUgaXMgdGhlIGRheSBhIGZpZWxkIGlzIGFuIGV4dGVuc2lvbiBhdCBvbmUgZW5kIGFuZCBhCmNvcmUgZmllbGQgYXQgdGhlIG90aGVyLgo="
  },
  {
    "id": "plugins",
    "path": "PLUGINS.md",
    "audience": "advanced",
    "title": "Plugin API",
    "note": "plugin.js, hooks, resources, regions, capabilities, and testing.",
    "encoded": "IyBNb2QgcGx1Z2luczogc2hpcHBpbmcgQ09ERSBpbiBhIG1vZCBmb2xkZXIKCkEgbW9kIHRoYXQgb25seSBjaGFuZ2VzIHJlY29yZHMgbmVlZHMgbm8gY29kZTogZHJvcCBgbWFuaWZlc3QuanNvbmAgcGx1cyBvbmUKYDxyZWNvcmQtdHlwZT4uanNvbmAgcGVyIHRoaW5nIHlvdSBjaGFuZ2UgaW50byBhIGZvbGRlciBhbmQgeW91IGFyZSBkb25lIChzZWUKWy4uL01PRFMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvTU9EUy5tZCkpLiBUaGlzIGRvY3VtZW50IGlzIGZvciB0aGUgb3RoZXIga2luZDogYSBtb2QgdGhhdCBjaGFuZ2VzCipiZWhhdmlvdXIqLgoKPiAqKkEgYnJlYWtpbmcgbW9kIEFQSSBjaGFuZ2UgaXMgbm93IGEgTUFKT1IgdmVyc2lvbiBidW1wLioqIEJlZm9yZSAxLjAsIHRoZQo+IEFQSSBjb3VsZCBjaGFuZ2Ugb24gYW55IG1pbm9yIHJlbGVhc2U7IGZyb20gMS4wLjAgb24sIGEgcGx1Z2luIHdyaXR0ZW4KPiBhZ2FpbnN0IHRoZSBjdXJyZW50IEFQSSBrZWVwcyBsb2FkaW5nIGFjcm9zcyBwYXRjaCBhbmQgbWlub3IgcmVsZWFzZXMsIGFuZAo+IHRoZSBkZXByZWNhdGlvbiB3aW5kb3cgZGVzY3JpYmVkIGJlbG93IHN0aWxsIGdpdmVzIGFuIGF1dGhvciBhIHJlbGVhc2Uncwo+IHdhcm5pbmcgYmVmb3JlIGEgcmVhbCBicmVhayBsYW5kcy4gU2VlIFtWZXJzaW9uIGNvbnRyYWN0XSgjdmVyc2lvbi1jb250cmFjdCkuCgojIyBUaGUgc2hhcGUKCkEgbW9kIGlzIGEgKipmb2xkZXIqKiwgYW5kIGl0IG1heSBob2xkIGFzIG11Y2ggYXMgaXQgbmVlZHMgdG86IHNldmVyYWwgc2NyaXB0cywKcmVjb3JkcywgaW1hZ2VzLCBzb3VuZHMsIGRhdGEgb2YgaXRzIG93bi4KCmBgYAptb2RzL215LW1vZC8KICBtYW5pZmVzdC5qc29uCiAgcGx1Z2luLmpzICAgICAgICAgIDwtIHRoZSBlbnRyeSBwb2ludCwgZGVmYXVsdC1leHBvcnRpbmcgYSBwbHVnaW4KICBsaWIvZGljZS5qcyAgICAgICAgPC0gbW9yZSBzY3JpcHRzOyBpbXBvcnQgdGhlbSByZWxhdGl2ZWx5CiAgbGliL2Zvcm1hdC5qcwogIG1vbnN0ZXIuanNvbiAgICAgICA8LSBhIHJlY29yZCBjb250cmlidXRpb24gKG5lZWRzIHRoZSAiY29udGVudCIgZmFjZXQgdG9vKQogIHRpbGVzL29yYy5wbmcgICAgICA8LSBhbiBpbWFnZTogYXdhaXQgY3R4LmFzc2V0VXJsKCJ0aWxlcy9vcmMucG5nIikKICBkYXRhL3NwYXducy5qc29uICAgPC0geW91ciBvd24gZGF0YSAobmVzdGVkIC5qc29uIGlzIGFuIGFzc2V0LCBub3QgYSByZWNvcmQpCiAgUkVBRE1FLm1kCmBgYAoKT25seSBgcGx1Z2luLmpzYCBpcyBsb2FkZWQgYnkgbmFtZS4gRXZlcnl0aGluZyBlbHNlIHlvdXIgY29kZSByZWFjaGVzIGl0c2VsZjoKc2NyaXB0cyBieSBpbXBvcnRpbmcgdGhlbSwgZXZlcnl0aGluZyBlbHNlIHRocm91Z2ggYGN0eC5hc3NldFVybGAuCgpgbWFuaWZlc3QuanNvbmAgbXVzdCBkZWNsYXJlIHRoZSAqKmBwbHVnaW5gIGZhY2V0KiogYW5kIGBtb2RBcGlgLiBBIHNjaGVtYSAyIG1hbmlmZXN0IGRlY2xhcmVzIGAicnVudGltZSI6ICJpbi1wcm9jZXNzImAgYW5kIGFuIGBhcGlgIHJhbmdlIGluc3RlYWQ7IHRoZSBbbWFuaWZlc3QgcmVmZXJlbmNlXShSRUFETUUubWQjdGhlLW1hbmlmZXN0LW1hbmlmZXN0anNvbikgY292ZXJzIGJvdGguCgpBIG1vZCB0aGF0IG9ubHkgcnVucyBjb2RlIGNhbiBzYXkgYCJzaGFwZSI6ICJwbHVnaW4iYCBhbmQgc3RvcCB0aGVyZS4gQSBtb2QgdGhhdApjb250cmlidXRlcyAqKmJvdGgqKiByZWNvcmRzIGFuZCBjb2RlICh0aGUgb3JkaW5hcnkgY2FzZSwgZS5nLiBhIG5ldyBtb25zdGVyCnBsdXMgdGhlIGJlaGF2aW91ciB0aGF0IG1ha2VzIGl0IGludGVyZXN0aW5nKSBsaXN0cyBib3RoIGZhY2V0czoKCmBgYGpzb24KeyAic2hhcGUiOiAiY29udGVudCIsICJmYWNldHMiOiBbImNvbnRlbnQiLCAicGx1Z2luIl0gfQpgYGAKCmBmYWNldHNgIG11c3QgY29udGFpbiBgc2hhcGVgLCBzbyB0aGUgdHdvIGNhbiBuZXZlciBjb250cmFkaWN0IGVhY2ggb3RoZXIuIEVpdGhlcgpzcGVsbGluZyB3b3JrcyAoYHNoYXBlYCBpcyBqdXN0IHRoZSBwcmltYXJ5IGtpbmQsIGFuZCB3aGF0IHRoZSBtb2QgbWFuYWdlcgpkaXNwbGF5cykuCgo+IFVudGlsIDIwMjYtMDctMjkgYHNoYXBlYCB3YXMgKipleGNsdXNpdmUqKiwgYW5kIHRoZSBsb2FkZXIgZ2F0ZWQgY29kZSBvbgo+IGAicGx1Z2luImAgd2hpbGUgY29tcG9zaXRpb24gZ2F0ZWQgcmVjb3JkcyBvbiBgImNvbnRlbnQiYC4gQSBmb2xkZXIgbGlrZSB0aGUgb25lCj4gYWJvdmUgdGhlcmVmb3JlIGNvdWxkIG5vdCB3b3JrOiBkZWNsYXJpbmcgYHBsdWdpbmAgZHJvcHBlZCBgbW9uc3Rlci5qc29uYAo+IHNpbGVudGx5LCBhbmQgZGVjbGFyaW5nIGBjb250ZW50YCByZWZ1c2VkIHRoZSBjb2RlLiBJZiB5b3Ugd3JvdGUgYSBtb2QgYWdhaW5zdAo+IHRoZSBvbGRlciB0ZXh0IGFuZCBmb3VuZCBoYWxmIG9mIGl0IGluZXJ0LCB0aGF0IHdhcyB0aGlzLCBhbmQgYGZhY2V0c2AgaXMgdGhlIGZpeC4KCmBgYGpzb24KewogICJpZCI6ICJteS1tb2QiLAogICJuYW1lIjogIk15IE1vZCIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJwbHVnaW4iLAogICJtb2RBcGkiOiAxLAogICJhZmZlY3RzR2FtZXBsYXkiOiB0cnVlLAogICJjYXBhYmlsaXRpZXMiOiBbInJlZ2lzdHJ5OmVmZmVjdCJdLAogICJkZXNjcmlwdGlvbiI6ICJXaGF0IHRoaXMgZG9lcywgaW4geW91ciBvd24gd29yZHMuIFRoZSBtb2QgbWFuYWdlciBzaG93cyB0aGlzLiIKfQpgYGAKCmBwbHVnaW4uanNgOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKCiAgLy8gQmVoYXZpb3VyOiBmb2xkZWQgaW50byB0aGUgb25lIE1vZEhvb2tzIHRoZSBlbmdpbmUgY29uc3VsdHMuCiAgaG9va3MoY3R4KSB7CiAgICBpZiAoIWN0eC5mbGFncy5teVRvZ2dsZSkgcmV0dXJuIHVuZGVmaW5lZDsgICAvLyBhIHJ1bGUgdGhlIHBsYXllciB0dXJuZWQgb2ZmCiAgICByZXR1cm4gewogICAgICBtZXNzYWdlVGV4dDogKHJhdykgPT4gcmF3LnJlcGxhY2UoIllvdSBoYXZlIiwgIlRob3UgaGFzdCIpLAogICAgfTsKICB9LAoKICAvLyBTeXN0ZW0gb3ZlcnJpZGVzOiBjYXBhYmlsaXR5LWdhdGVkIHJlZ2lzdHJpZXMuCiAgcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgICBob3N0LmVmZmVjdHMucmVnaXN0ZXIoIk1ZX0VGRkVDVCIsIHsKICAgICAgaGFuZGxlcjogKGNvbnRleHQpID0+IHsgLyogcnVucyBpbnNpZGUgZWZmZWN0X2RvLCBsaXZlIHN0YXRlICovIHJldHVybiB0cnVlOyB9LAogICAgfSk7CiAgfSwKfTsKYGBgCgpFdmVyeSBtZW1iZXIgaXMgb3B0aW9uYWwsIGFuZCB0aGUgdHdvIGFib3ZlIGFyZSBvbmx5IHRoZSB0d28gbW9zdCBjb21tb24uIFRoZQpmdWxsIHNldCBpcyBgaG9va3NgLCBgcmVnaXN0ZXJgLCBgY29udHJvbGxlcmAsIGBmcm9udGVuZGAsIGBodWRgLCBgbWVudWAsCmBzY3JlZW5gIGFuZCBgcmVnaW9uc2AsIHBsdXMgYG1pZ3JhdGVCYWdgIGFuZCBgdW5pbnN0YWxsYC4gQSBwbHVnaW4gaXMgcmVmdXNlZApvbmx5IHdoZW4gQUxMIGVpZ2h0IG9mIHRoZSBmaXJzdCBncm91cCBhcmUgYWJzZW50LCBiZWNhdXNlIGEgbW9kIHdpdGggbm8gY29kZQpzaW1wbHkgc2hpcHMgbm8gYHBsdWdpbi5qc2AgLSBzbyBhIHBsdWdpbiB3aG9zZSBvbmx5IG1lbWJlciBpcyBgZnJvbnRlbmRgLCBvcgpgY29udHJvbGxlcmAsIG9yIGByZWdpb25zYCwgbG9hZHMgZmluZS4gYG1pZ3JhdGVCYWdgIGRlbGliZXJhdGVseSBkb2VzIG5vdCBjb3VudAphcyBjb2RlIG9mIGl0cyBvd246IGEgcGx1Z2luIHRoYXQgY2FuIG9ubHkgbWlncmF0ZSBhIGJhZyBpdCBuZXZlciB3cml0ZXMgaGFzCm5vdGhpbmcgdG8gbWlncmF0ZS4KCiMjIE51bWJlcnMgdGhlIHBsYXllciBzZXRzCgpBIHN3aXRjaCBpcyBhIHJ1bGUuIEZvciBhIG51bWJlciwgc3VjaCBhcyBob3cgc3Ryb25nIGFuIGVmZmVjdCBpcywgZGVjbGFyZSBhIHNldHRpbmcgaW4gYG1hbmlmZXN0Lmpzb25gIGFuZCByZWFkIGl0IGZyb20gYGN0eC5zZXR0aW5nc2A6CgpgYGBqc29uCiJydWxlcyI6IFt7ICJmbGFnIjogImZ4LmNydCIsICJ0aXRsZSI6ICJDUlQgZWZmZWN0IiwgImRlc2NyaXB0aW9uIjogIlNjYW5saW5lcyBvdmVyIHRoZSBtYXAuIiwgImRlZmF1bHQiOiB0cnVlIH1dLAoic2V0dGluZ3MiOiBbewogICJpZCI6ICJjcnRTdHJlbmd0aCIsICJ0aXRsZSI6ICJDUlQgc3RyZW5ndGgiLCAiZGVzY3JpcHRpb24iOiAiSG93IHN0cm9uZyB0aGUgc2NhbmxpbmVzIGFyZS4iLAogICJtaW4iOiAwLCAibWF4IjogMTAwLCAic3RlcCI6IDUsICJkZWZhdWx0IjogNjAsICJ1bml0IjogIiUiLCAicGFyZW50IjogImZ4LmNydCIKfV0KYGBgCgpgYGBqcwpodWQoY3R4KSB7CiAgbGV0IHN0cmVuZ3RoID0gY3R4LnNldHRpbmdzPy5nZXQoImNydFN0cmVuZ3RoIikgPz8gNjA7CiAgY3R4LnNldHRpbmdzPy5vbkNoYW5nZSgoaWQsIHZhbHVlKSA9PiB7IGlmIChpZCA9PT0gImNydFN0cmVuZ3RoIikgc3RyZW5ndGggPSB2YWx1ZTsgfSk7CiAgLy8gZHJhdyB0aGUgc2NhbmxpbmVzIGF0IHN0cmVuZ3RoIC8gMTAwCn0KYGBgCgpUaGUgdmFsdWUgaXMgYWx3YXlzIGluc2lkZSB0aGUgcmFuZ2UgYW5kIG9uIGEgc3RlcCwgc28gdGhlIGNvZGUgbmV2ZXIgY2hlY2tzIGl0LiBgY3R4LnNldHRpbmdzYCBpcyB1bmRlZmluZWQgb24gYW4gZW5naW5lIHdpdGhvdXQgdGhlIHNlYW0sIHdoaWNoIGlzIHdoeSB0aGUgZXhhbXBsZSBmYWxscyBiYWNrIHRvIHRoZSBkZWZhdWx0LiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDR5XShNT0RfU0VBTVMubWQjNHktbnVtZXJpYy1zZXR0aW5ncykgZm9yIHRoZSByb3cgb24gdGhlIE1vZHMgc2NyZWVuIGFuZCByZWxvYWQgYmVoYXZpb3VyLgoKIyMgWW91ciBvd24gc2F2ZWQgZGF0YSwgYW5kIGNoYW5naW5nIGl0cyBzaGFwZQoKWW91IG1heSBrZWVwIHdoYXRldmVyIEpTT04geW91IGxpa2UgaW4gdGhlIHBsYXllcidzIHNhdmUsIHVuZGVyIHlvdXIgbW9kJ3MgaWQuClRoZSBlbmdpbmUgcm91bmQtdHJpcHMgaXQgdmVyYmF0aW0gYW5kIG5ldmVyIHJlYWRzIGl0LiBJdCBpcyBzdG9yZWQgd2l0aCBhCmBzY2hlbWFgIG51bWJlciwgd2hhdGV2ZXIgeW91ciBtYW5pZmVzdCdzIGBzYXZlU2NoZW1hYCB3YXMgd2hlbiBpdCB3YXMgd3JpdHRlbi4KCioqVGhlIGJhZyBpcyBub3Qgb24gYGN0eC5zdGF0ZWAuKiogYEdhbWVTdGF0ZWAgZG9lcyBub3QgY2FycnkgdGhlIGJhZ3MgYXQgYWxsOwp0aGV5IGxpdmUgb24gdGhlIGBTdGFydGVkR2FtZWAgdGhlIGhvc3QgaG9sZHMsIHdoaWNoIGlzIHdoYXQgYHNhdmVHYW1lYCByZWFkcy4KWW91ciBoYW5kbGUgb24geW91ciBvd24gYmFnIGlzIHRoZSBgZGF0YWAgYXJndW1lbnQgYG1pZ3JhdGVCYWdgIGlzIGdpdmVuLCBhbmQgdGhlCnZhbHVlIHRoZSBob3N0IHdyaXRlcyBiYWNrIGZvciB5b3UuIFJlYWNoaW5nIGZvciBgY3R4LnN0YXRlLm1vZHNgIGZpbmRzIG5vdGhpbmcsCmJlY2F1c2UgdGhlcmUgaXMgbm8gc3VjaCBmaWVsZC4KCioqYG1pZ3JhdGVCYWdgIGlzIG5vdCBhIFdSSVRFIHNlYW0uKiogSXQgb25seSBicmluZ3MgYW4gb2xkIGJhZyBmb3J3YXJkIGF0Cm1vZC1sb2FkIHRpbWU7IGl0IGdpdmVzIHlvdSBubyB3YXkgdG8gd3JpdGUgYSBuZXcgb25lIGR1cmluZyBwbGF5LiBGb3IgdGhhdCwKdXNlIGBjdHguY2hhcmFjdGVyU3RvcmVgIChuZW8tYW5nYmFuZCMxNzEpOiBgZ2V0KClgIGFuZCBgc2V0KHZhbHVlKWAgb24geW91cgpvd24gYmFnLCBsaXZlLCBrZXllZCB0byB0aGUgYWN0dWFsIGNoYXJhY3RlciByYXRoZXIgdGhhbiB0byBhIGZpbmdlcnByaW50IG9mCm9uZS4gQmVmb3JlIHRoaXMgZXhpc3RlZCwgYSBtb2QgdGhhdCBuZWVkZWQgdG8gcmVtZW1iZXIgc29tZXRoaW5nIGFib3V0IGEKY2hhcmFjdGVyIGhhZCB0byBhcHByb3hpbWF0ZSBhIHNhdmUga2V5IGZyb20gYmlydGgtZml4ZWQgZmFjdHMgKG5hbWUsIHJhY2UsCmNsYXNzLCBiaXJ0aCBzdGF0cykgYW5kIGtlZXAgaXQgaW4gYGN0eC5wcmVmc2AgaW5zdGVhZC4gVGhhdCBzdG9yZSBjb3ZlcnMgdGhlCndob2xlIGluc3RhbGwgcmF0aGVyIHRoYW4gb25lIGNoYXJhY3Rlciwgc28gaXQgY29sbGlkZXMgYmV0d2VlbiB0d28KY2hhcmFjdGVycyB3aG8gaGFwcGVuIHRvIG1hdGNoIG9uIGFsbCBvZiB0aG9zZSBmYWN0cy4gYGN0eC5jaGFyYWN0ZXJTdG9yZS5zZXQoKWAKc3RhbXBzIHlvdXIgd3JpdGUgd2l0aCB3aGF0ZXZlciBgc2F2ZVNjaGVtYWAgeW91ciBtYW5pZmVzdCBjdXJyZW50bHkgZGVjbGFyZXMsCnNvIGBtaWdyYXRlQmFnYCBzdGlsbCBzZWVzIGEgY29oZXJlbnQgbnVtYmVyIG9uIHRoZSBuZXh0IGxvYWQuCgpXaGVuIHlvdSBjaGFuZ2UgdGhlIFNIQVBFIG9mIHRoYXQgZGF0YSwgYnVtcCBgc2F2ZVNjaGVtYWAgYW5kIHNoaXAgYQpgbWlncmF0ZUJhZ2A6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAxLAogIGhvb2tzKGN0eCkgeyAvKiAuLi4gKi8gfSwKCiAgLy8gQ2FsbGVkIGF0IG1vZC1sb2FkIHRpbWUsIEJFRk9SRSByZWdpc3RlcigpLCB3aGVuIHRoZSBiYWcgaW4gdGhlIHNhdmUgaXMKICAvLyBiZWhpbmQgeW91ciBtYW5pZmVzdCdzIHNhdmVTY2hlbWEuIFJldHVybiB0aGUgc2FtZSBkYXRhIGluIHRoZSBuZXcgc2hhcGUuCiAgbWlncmF0ZUJhZyhkYXRhLCBmcm9tU2NoZW1hLCBjdHgpIHsKICAgIGlmIChmcm9tU2NoZW1hIDwgMikgcmV0dXJuIHsga2lsbHM6IE9iamVjdC5rZXlzKGRhdGEua2lsbGVkID8/IHt9KS5sZW5ndGggfTsKICAgIHJldHVybiBkYXRhOwogIH0sCn07CmBgYAoKT25seSB5b3UgY2FuIGRvIHRoaXM6IG5vYm9keSBlbHNlIGtub3dzIHdoYXQgaXMgaW4gdGhlcmUuIFdoYXQgdGhlIGdhbWUgZG9lcwphcm91bmQgaXQ6Cgp8IFNpdHVhdGlvbiB8IFdoYXQgaGFwcGVucyB8CnwtLS18LS0tfAp8IGJhZyBiZWhpbmQgYHNhdmVTY2hlbWFgLCBgbWlncmF0ZUJhZ2AgcHJlc2VudCB8IGl0IHJ1bnMsIGFuZCB0aGUgc2NoZW1hIGlzIHN0YW1wZWQgZm9yd2FyZCB8CnwgYmFnIGJlaGluZCBgc2F2ZVNjaGVtYWAsICoqbm8qKiBgbWlncmF0ZUJhZ2AgfCB0aGUgb2xkIGRhdGEgaXMga2VwdCAqKmV4YWN0bHkgYXMgaXQgd2FzKiosIGFuZCB0aGUgcGxheWVyIGlzIHRvbGQgeW91ciBtb2QgaGFzIGRhdGEgaXQgbWF5IG5vdCB1bmRlcnN0YW5kLiBUaGUgc2NoZW1hIGlzICpub3QqIHN0YW1wZWQgZm9yd2FyZCwgc28geW91IHdvdWxkIGJlIGhhbmRlZCBvbGQgZGF0YSBsYWJlbGxlZCBuZXcgfAp8IGBtaWdyYXRlQmFnYCB0aHJvd3MsIG9yIHJldHVybnMgbm90aGluZyB8IHRoZSBvbGQgYmFnIHN0YW5kcywgYW5kIHRoZSByZWFzb24gZ29lcyBvbiB5b3VyIG1vZCdzIHJvdyB8CnwgYmFnICoqYWhlYWQqKiBvZiBgc2F2ZVNjaGVtYWAgKHRoZSBwbGF5ZXIgcm9sbGVkIHlvdSBiYWNrKSB8IG5vdGhpbmcgaXMgY2hhbmdlZCwgYW5kIHRoZSBwbGF5ZXIgaXMgdG9sZC4gQSBtaWdyYXRpb24gYmFja3dhcmRzIGlzIHNvbWV0aGluZyBvbmx5IHlvdSBjb3VsZCB3cml0ZSB8CnwgeW91IGRlY2xhcmUgbm8gYHNhdmVTY2hlbWFgIHwgbm90aGluZyBoYXBwZW5zLCBldmVyIHwKCklmIHlvdSB3b3VsZCByYXRoZXIgYnJhbmNoIG9uIHRoZSBzY2hlbWEgaW5saW5lIHRoYW4gc2hpcCBhIG1pZ3JhdG9yLCB5b3UgY2FuOgp0aGUgYmFnIGNhcnJpZXMgaXRzIG93biBgc2NoZW1hYCBhbmQgeW91IGNhbiByZWFkIGl0LiBPbWl0dGluZyBgbWlncmF0ZUJhZ2AKKmFmdGVyKiBidW1waW5nIGBzYXZlU2NoZW1hYCBpcyB0aGUgY2FzZSB0aGUgZ2FtZSByZXBvcnRzLCBiZWNhdXNlIGl0IGNhbm5vdCB0ZWxsCnRoYXQgYXBhcnQgZnJvbSBhbiBvdmVyc2lnaHQuCgojIyBXaHkgdGhlIGVuZ2luZSBpcyBub3QgaW1wb3J0ZWQKCmBjdHguY29yZWAgaXMgdGhlIGVuZ2luZTogdGhlIHNhbWUgbGl2ZSBtb2R1bGUgaW5zdGFuY2UgdGhlIGdhbWUgaXMgcnVubmluZyBvbiwgaGFuZGVkIHRvIHlvdXIgcGx1Z2luIGluc3RlYWQgb2YgaW1wb3J0ZWQuCgpBIGJhcmUgc3BlY2lmaWVyIGxpa2UgYGltcG9ydCB7IHR1bm5lbEF1eCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLWNvcmUiYCBjYW5ub3QgcmVzb2x2ZSBpbiBhIG1vZHVsZSBmZXRjaGVkIGZyb20gYSBmb2xkZXIuIEJ1bmRsaW5nIHRoZSBlbmdpbmUgaW50byB5b3VyIHBsdWdpbiB3b3VsZCBiZSB3b3JzZTogeW91IHdvdWxkIGdldCB5b3VyIG93biBjb3B5IG9mIGV2ZXJ5IHJlZ2lzdHJ5IGFuZCBzaW5nbGV0b24sIHNvIHlvdXIgZWZmZWN0IGhhbmRsZXIgd291bGQgbGFuZCBvbiBhIHJlZ2lzdHJ5IHRoZSBpbnRlcnByZXRlciBuZXZlciBjb25zdWx0cywgYW5kIHlvdXIgbW9kIHdvdWxkIGRvIG5vdGhpbmcgYXQgYWxsLCB3aXRoIG5vIGVycm9yIGFueXdoZXJlLiBQYXNzaW5nIGluIHRoZSBvbmUgbGl2ZSBpbnN0YW5jZSBydWxlcyB0aGF0IGZhaWx1cmUgb3V0LgoKV2hhdCBgY3R4YCBjYXJyaWVzOgoKfCBGaWVsZCB8IFdoYXQgaXQgaXMgfAp8LS0tfC0tLXwKfCBgaWRgIHwgeW91ciBtb2QncyBpZCwgd2hpY2ggaXMgYWxzbyBpdHMgZm9sZGVyIG5hbWUgfAp8IGBhcGlgIHwgdGhlIEFCSSB2ZXJzaW9uIHRoZSAqKmhvc3QqKiBpbXBsZW1lbnRzIHwKfCBgZW5naW5lYCB8IHRoZSBlbmdpbmUgdmVyc2lvbiwgaWYgeW91IHdhbnQgdG8gYWRhcHQgcmF0aGVyIHRoYW4gcmVmdXNlIHwKfCBgZmxhZ3NgIHwgKip5b3VyKiogcmVzb2x2ZWQgcnVsZSB0b2dnbGVzOiBgY2hvaWNlc1tmbGFnXSA/PyBydWxlLmRlZmF1bHRgLCBzbGljZWQgdG8gdGhlIHJ1bGVzIHlvdXIgb3duIG1hbmlmZXN0IGRlY2xhcmVzIHwKfCBgY29yZWAgfCB0aGUgbGl2ZSBlbmdpbmUgbmFtZXNwYWNlOiBjb3JlJ3MgZW50aXJlIHB1YmxpYyBBUEkuIEEgbmFtZWQgc3Vic2V0IGlzIGd1YXJhbnRlZWQ7IHRoZSByZXN0IGlzIGFuIGVzY2FwZSBoYXRjaC4gU2VlIFtNT0RfQ09NUEFUSUJJTElUWS5tZF0oTU9EX0NPTVBBVElCSUxJVFkubWQpIHwKfCBgc3RhdGVgIHwgdGhlIGxpdmUgYEdhbWVTdGF0ZWAuIEhhbmRlZCB0byBgcmVnaXN0ZXJgLCBgbWlncmF0ZUJhZ2AsIGBjb250cm9sbGVyYCBhbmQgZXZlcnkgZGlzcGxheSBzZWFtOyAqKm5ldmVyKiogdG8gYGhvb2tzYCwgYmVjYXVzZSB0aGUgaG9zdCBjb21wb3NlcyBob29rcyBiZWZvcmUgYSBnYW1lIGV4aXN0cyB8CnwgYGFzc2V0VXJsYCB8IGAocGF0aCkgPT4gUHJvbWlzZTxzdHJpbmcgXHwgbnVsbD5gLCBhIFVSTCBmb3Igb25lIG9mICp5b3VyKiBmaWxlcyB8CnwgYGRhdGFgIHwgeW91ciBvd24gcmVjb3JkIGZpbGVzLCBwYXJzZWQsIGtleWVkIHdpdGhvdXQgYC5qc29uYCB8CnwgYHByZWZzYCB8IGB7IGdldCgpLCBzZXQodmFsdWUpIH1gLCBvbmUgSlNPTiB2YWx1ZSBvZiAqKnlvdXJzKiosIGtlcHQgb3V0c2lkZSBldmVyeSBzYXZlIHwKfCBgbmV3Q2hhcmFjdGVyYCB8IHdoZXRoZXIgdGhpcyBzZXNzaW9uJ3MgY2hhcmFjdGVyIHdhcyBqdXN0IGNyZWF0ZWQsIHJhdGhlciB0aGFuIGxvYWRlZCB8CnwgYHJlZ2lzdHJpZXNgIHwgdGhlIHdob2xlIGJvdW5kIGBDb3JlUmVnaXN0cmllc2A6IGV2ZXJ5IHJhY2UsIGtpbmQsIGZlYXR1cmUsIHRyYXAsIHN0b3JlLCBwcm9qZWN0aW9uLCByb29tLCBwcm9maWxlLCBjb25zdGFudCwgcXVlc3QgYW5kIGhpbnQgdGhpcyBzZXNzaW9uIGFjdHVhbGx5IHJ1bnMgb24gKGFic2VudCBkdXJpbmcgY29udGVudCBjb21wb3NpdGlvbikgfAp8IGBsb2dgIHwgYSBkaWFnbm9zdGljIGxpbmU7IHRoZSBob3N0IGRlY2lkZXMgd2hlcmUgaXQgZ29lcyB8CnwgYGJhY2t1cEZvbGRlcmAgfCBgeyBuYW1lKCksIGNob29zZSgpLCBmb3JnZXQoKSwgd3JpdGUobmFtZSwgdGV4dCksIG9uU2F2ZShmbiksIGxpc3QoKSB9YCwgYSBwbGF5ZXItY2hvc2VuIGZvbGRlciBmb3IgYXV0b21hdGljIHNhdmUgYmFja3Vwcy4gUHJlc2VudCBvbmx5IHdoZW4geW91ciBtYW5pZmVzdCBkZWNsYXJlZCBgYmFja3VwOmZvbGRlcmAgYW5kIHRoZSBwbGF0Zm9ybSBjYW4gb2ZmZXIgYSBmb2xkZXIgcGlja2VyOyBhYnNlbnQgZXZlcnl3aGVyZSBlbHNlLCBzbyB0ZXN0IGZvciBpdCBpbnN0ZWFkIG9mIGFzc3VtaW5nIGl0LiBgbGlzdCgpYCAoIzI0KSByZXR1cm5zIGV2ZXJ5IGAubmVvY2hhcmAgZmlsZSBjdXJyZW50bHkgaW4gdGhlIGZvbGRlciwgaWRlbnRpZmllZCBjaGVhcGx5IGJ5IGxpbmVhZ2UgYW5kIGNoYXJhY3RlciBuYW1lL2xldmVsLCB3aXRob3V0IGRlY29kaW5nIG9yIGltcG9ydGluZyBhbnkgb2YgdGhlbSB8CnwgYGRlYnVnYCB8IGB7IHNwYXduT2JqZWN0KGtpbmQpLCBzcGF3bk1vbnN0ZXIocmFjZSkgfWAsIGNvbmp1cmluZyBvbmUgaXRlbSBvciBjcmVhdHVyZSBpbnRvIHRoZSBsaXZlIGdhbWUuIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYGRlYnVnOnNwYXduYCBhbmQgdGhlcmUgaXMgYSBnYW1lIHRvIGNvbmp1cmUgaW50by4gVGhlIGZpcnN0IHVzZSBpbiBhIGNoYXJhY3RlciBhc2tzIHRoZSBnYW1lJ3Mgb3duIGRlYnVnIHF1ZXN0aW9uIGFuZCBtYXJrcyB0aGF0IGNoYXJhY3RlciBwZXJtYW5lbnRseSwgc28gdGVsbCB0aGUgcGxheWVyIGJlZm9yZSB0aGV5IHByZXNzIHlvdXIgYnV0dG9uIHwKfCBgd2l6YXJkYCB8IHRoZSBnYW1lJ3Mgd2hvbGUgZGVidWcgc2V0OiBkZXB0aCwgZXhwZXJpZW5jZSwgZ29sZCwgc3RhdHMsIGFjcXVpcmVtZW50LCBtYXBwaW5nLCBwbHVzIGEgY2F0YWxvZ3VlIG9mIGV2ZXJ5IGl0ZW0sIGNyZWF0dXJlIGFuZCBhcnRpZmFjdCB0aGlzIGdhbWUgaGFzIGFuZCB3aGljaCBwYWNrIGFkZGVkIGVhY2guIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYGRlYnVnOndpemFyZGAgYW5kIHRoZXJlIGlzIGEgZ2FtZSB0byBkcml2ZS4gTm8gbWV0aG9kIHdvcmtzIHVudGlsIHlvdSBjYWxsIGBzYW5kYm94KClgLCB3aGljaCBkZXRhY2hlcyB0aGUgc2Vzc2lvbiBmcm9tIGl0cyBzYXZlIHNsb3QgYW5kIGNhbm5vdCBiZSB1bmRvbmU6IHRoZSBjaGFyYWN0ZXIgb24gZGlzayBrZWVwcyB3aGF0ZXZlciB0aGUgbGFzdCBzYXZlIGxlZnQsIGFuZCBub3RoaW5nIGFmdGVyIHRoYXQgaXMgd3JpdHRlbi4gQ2FsbCBgYXR0YWNoZWQoKWAgZmlyc3QgdG8gZ2V0IHRoZSBuYW1lIHRvIHVzZSBpbiB0aGUgcXVlc3Rpb24geW91IHB1dCB0byB0aGUgcGxheWVyLiBTZWUgYE1PRF9TRUFNUy5tZGAgc2VjdGlvbiA0ZiB8CnwgYGluc3RhbGxNb2RgIHwgYChieXRlcykgPT4gUHJvbWlzZTx7b2ssIGlkLCB2ZXJzaW9uLCBsaW5lc30gXHwge29rLCBwcm9ibGVtLCBsaW5lc30+YCwgaW5zdGFsbGluZyBhIGNvbnRlbnQgbW9kIGZyb20gdGhlIGJ5dGVzIG9mIGFuIGFyY2hpdmUuIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYG1vZDppbnN0YWxsYC4gQ29kZSBpcyByZWZ1c2VkLCBhbmQgd2hhdCB5b3UgaW5zdGFsbCBhcnJpdmVzIHN3aXRjaGVkIG9mZjogdGhlIHBsYXllciBlbmFibGVzIGl0LCBhbmQgYSBtb2QgdGFrZXMgZWZmZWN0IG9uIHJlbG9hZC4gYGxpbmVzYCBpcyB0aGUgd29yZGluZyB0aGUgTW9kcyBzY3JlZW4gcHJpbnRzIGZvciB0aGUgc2FtZSBvdXRjb21lLCBwZXItcmVxdWlyZW1lbnQgcm93cyBpbmNsdWRlZCwgc28gcHJpbnQgaXQgaW5zdGVhZCBvZiB3cml0aW5nIHlvdXIgb3duIHdvcmRpbmcgZm9yIHRoZSBzYW1lIHJlc3VsdCB8CnwgYHJlbG9hZEdhbWVgIHwgYCgpID0+IFByb21pc2U8dm9pZD5gLCB0aGUgZ2FtZSdzIG93biBtb2QtY2hhbmdlIHJlbG9hZDogZXZlcnkgcGx1Z2luJ3MgYHVuaW5zdGFsbCgpYCBydW5zLCB0aGUgYXV0b3BsYXllcidzIGtleWJvYXJkIGlzIGhhbmRlZCBiYWNrLCB0aGUgbGl2ZSBjaGFyYWN0ZXIgaXMgd3JpdHRlbiBkb3duLCBhbmQgdGhlIHNlc3Npb24gcmVzdW1lcyBvbiB0aGF0IGNoYXJhY3Rlci4gUHJlc2VudCBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBgaW5zdGFsbE1vZGAsIGJlY2F1c2UgYW4gaW5zdGFsbCBkb2VzIG5vdGhpbmcgdW50aWwgdGhlIGdhbWUgcmVsb2Fkcy4gSXQgaXMgbm90IGEgcGVybWlzc2lvbiAoYSBwbHVnaW4gY2FuIHJlYWNoIGBsb2NhdGlvbmAgcmVnYXJkbGVzcyksIGJ1dCBgbG9jYXRpb24ucmVsb2FkKClgIHNraXBzIGFsbCBmb3VyIHN0ZXBzLCBhbmQgdGhlIHRoaXJkIG9uZSBpcyB0aGUgcGxheWVyJ3MgcHJvZ3Jlc3MgfAp8IGBsb2FkTW9kRm9yU2Vzc2lvbmAgfCBgKGJ5dGVzKSA9PiBQcm9taXNlPHtvaywgaWQsIHZlcnNpb24sIHN1cnZpdmVzUmVsb2FkfSBcfCB7b2ssIHByb2JsZW19PmAsIGxvYWRpbmcgYSBjb250ZW50IG1vZCBmb3IgdGhpcyBzZXNzaW9uIG9ubHkuIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYG1vZDpzZXNzaW9uYC4gQ29kZSBpcyByZWZ1c2VkIG9uIHRoZSBzYW1lIHRlcm1zLiBUaGUgbW9kIGlzIG9uIGZyb20gdGhlIG5leHQgcmVsb2FkIHdpdGhvdXQgd2FpdGluZyB0byBiZSBzd2l0Y2hlZCBvbiwgYW5kIHRoZSBhcmNoaXZlIGlzIGZvcmdvdHRlbiB3aGVuIHRoZSBnYW1lIGNsb3NlcywgYnV0IHdoYXQgaXQgZGlkIHRvIGEgY2hhcmFjdGVyIGlzIG5vdCwgc28gdGVsbCB0aGUgcGxheWVyIHRoYXQgfAp8IGB1aWAgfCBgeyBvcGVuUGFuZWwoc3BlYyksIHJlZ2lzdGVyUGFuZWxLaW5kKHNwZWMpLCBvcGVuUGFuZWxzIH1gLCBwYW5lbHMgb2YgcmVhbCBIVE1MIGluc3RlYWQgb2YgY2hhcmFjdGVyIGNlbGxzLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGB1aTpwYW5lbC5tb3VudGA7IGFic2VudCBldmVyeXdoZXJlIGVsc2UsIHNvIHRlc3QgZm9yIGl0LiBTZWUgYE1PRF9TRUFNUy5tZGAgc2VjdGlvbnMgNGIgYW5kIDRwLiBFc2NhcGUgYmVsb25ncyB0byB0aGUgcGxheWVyLCBhbmQgYSBub24tbW9kYWwgYG9wZW5QYW5lbGAgY29udGFpbmVyIHRha2VzIG5vIHBvaW50ZXIgZXZlbnRzIHwKfCBga2V5UmVwZWF0YCB8IGAoKSA9PiB7IGlzUmVwZWF0LCByZXBvcnRlZFJlcGVhdCwgaW50ZXJ2YWxNcywgYWdlTXMgfSBcfCBudWxsYCwgdGhlIGhvc3QncyBvd24gY2xhc3NpZmljYXRpb24gb2YgdGhlIG1vc3QgcmVjZW50IHJvb3Qtc2NyZWVuIGtleWRvd24gYXMgYSBrZXktcmVwZWF0IG9yIGEgZnJlc2ggcHJlc3MuIFVuZ2F0ZWQsIGxpa2UgYHN1YndpbmRvd3NgOyBgbnVsbGAgdW50aWwgdGhlIHJvb3QgaGFuZGxlciBoYXMgY2xhc3NpZmllZCBhIGtleWRvd24gdGhpcyBzZXNzaW9uLiBSZWFkLW9ubHkgZm9yIG5vdzogbm90aGluZyBzdXBwcmVzc2VzIG9yIGNoYW5nZXMgYSBjb21tYW5kIGJhc2VkIG9uIGl0IHlldCAoIzM1KSB8CnwgYGNoYXJhY3RlclN0b3JlYCB8IGB7IGdldCgpLCBzZXQodmFsdWUpIH1gLCB0aGlzIG1vZCdzIG93biBsaXZlIHBlci1jaGFyYWN0ZXIgc3RvcmFnZTogdGhlIHNhbWUgc2F2ZSBiYWcgYG1pZ3JhdGVCYWdgIG1pZ3JhdGVzLCByZWFkIGFuZCB3cml0dGVuIGR1cmluZyBwbGF5IGluc3RlYWQgb2Ygb25seSBhdCBtb2QtbG9hZCB0aW1lLiBTY29wZWQgYnkgbW9kIGlkIGxpa2UgYHByZWZzYCwgYW5kIHVuZ2F0ZWQuIFByZXNlbnQgb25seSBvbmNlIHRoZXJlIGlzIGEgbGl2ZSBjaGFyYWN0ZXIuIEEgd3JpdGUgaXMgc3RhbXBlZCB3aXRoIHlvdXIgbWFuaWZlc3QncyBjdXJyZW50IGBzYXZlU2NoZW1hYCAoMCBpZiB5b3UgZGVjbGFyZSBub25lKSwgd2hpY2ggaXMgdGhlIG51bWJlciBgbWlncmF0ZUJhZ2AgcmVhZHMgYmFjayBvbiBhIGxhdGVyIGxvYWQgKCMxNzEpIHwKCmBmbGFnc2AgaXMgc2xpY2VkIHBlciBtb2Qgc28gdGhhdCBvbmUgbW9kIGNhbm5vdCByZWFkIG9yIGFjdCBvbiBhbm90aGVyIG1vZCdzIHRvZ2dsZXMuIE90aGVyd2lzZSBhIG1vZCdzIGJlaGF2aW91ciB3b3VsZCBkZXBlbmQgb24gd2hpY2ggb3RoZXIgbW9kcyB0aGUgcGxheWVyIGhhcHBlbmVkIHRvIGVuYWJsZS4KCiMjIyBgaG9va3MoY3R4KWAgY2FuIG9ic2VydmUgbmV3IGNoYXJhY3RlcnMKClRoZSBob3N0IGNhbGxzIGBob29rcyhjdHgpYCBiZWZvcmUgaXQgc3RhcnRzIHRoZSBnYW1lLCBzbyB0aGUgZmFjdG9yeSBpdHNlbGYgaGFzIG5vIGBHYW1lU3RhdGVgLiBBIGhvb2sgaXQgcmV0dXJucyBjYW4gcmVjZWl2ZSB0aGUgbGl2ZSBzdGF0ZSBsYXRlcjogYG5ld0NoYXJhY3RlcihzdGF0ZSwgcmVnaXN0cmllcylgIHJ1bnMgb25jZSBhZnRlciBgc3RhcnRHYW1lYCBoYXMgYnVpbHQgYW5kIHdpcmVkIGEgbmV3IGNoYXJhY3Rlci4gSXQgZG9lcyBub3QgcnVuIHdoZW4gYSBzYXZlZCBnYW1lIGlzIGxvYWRlZCBvciByZWxvYWRlZC4gQ2hhbmdlcyBpdCBtYWtlcyBiZWNvbWUgb3JkaW5hcnkgY2hhcmFjdGVyIHN0YXRlIGFuZCBhcmUgc2F2ZWQgd2l0aCB0aGF0IGNoYXJhY3Rlci4gT3RoZXIgd29yayB0aGF0IG5lZWRzIHRoZSBsaXZlIGdhbWUgY2FuIGdvIGluIGByZWdpc3Rlcihob3N0LCBjdHgpYCwgd2hpY2ggcnVucyBhZnRlciB0aGUgZ2FtZSBpcyBidWlsdC4KCklmIHlvdSBuZWVkIHRoZSBlbmdpbmUgYXQgYGhvb2tzYCB0aW1lIGZvciBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgbGl2ZSBnYW1lIChjbGFzc2lmeWluZyBvcHRpb24gbmFtZXMsIHJlYWRpbmcgYSBjb25zdGFudCksIGBjdHguY29yZWAgaXMgYXZhaWxhYmxlIGFuZCBpcyB0aGUgc2FtZSBtb2R1bGUgaW5zdGFuY2UgdGhlIGdhbWUgcnVucyBvbi4KCiMjIyBgcmVnaXN0cmllc2AgaXMgdGhlIGNvbnRlbnQsIHdoZXJlIGBzdGF0ZWAgaXMgdGhlIGxldmVsCgpUaGVzZSB0d28gYXJlIGVhc3kgdG8gY29uZnVzZSwgYW5kIHNvbWUgbW9kcyBjYW5ub3QgYmUgd3JpdHRlbiB3aXRob3V0IHRoZSBzZWNvbmQuCgpgc3RhdGVgIGlzIHRoaXMgbGV2ZWw6IHRoZSBtb25zdGVycyBzdGFuZGluZyBvbiBpdCwgdGhlIG9iamVjdHMgbHlpbmcgb24gaXQsIHRoZSBwbGF5ZXIuIFJlYWQgaXQgdG8gZHJhdyBhIGZyYW1lIG9yIHRvIGFuc3dlciBhIHF1ZXN0aW9uIGFib3V0IHNvbWV0aGluZyBpbiBmcm9udCBvZiB0aGUgcGxheWVyIHJpZ2h0IG5vdy4KCmByZWdpc3RyaWVzYCBpcyB3aGF0IHRoZSBnYW1lIGlzIG1hZGUgb2Y6IGByZWdpc3RyaWVzLm1vbnN0ZXJzLnJhY2VzYCBpcyBldmVyeSByYWNlIHRoZSBwYWNrIGRlZmluZXMsIGF0IGl0cyByZWFsIGByaWR4YDsgYHJlZ2lzdHJpZXMub2JqZWN0cy5raW5kc2AgaXMgZXZlcnkgb2JqZWN0IGtpbmQsIGF0IGl0cyByZWFsIGBraWR4YDsgYW5kIGZlYXR1cmVzLCB0cmFwcywgc3RvcmVzIGFuZCBwcm9qZWN0aW9ucyBhcmUgdGhlcmUgb24gdGhlIHNhbWUgdGVybXMuIFlvdSBuZWVkIGl0IHdoZW5ldmVyIHlvdXIgcXVlc3Rpb24gaXMgYWJvdXQgYSB0aGluZyBieSBpbmRleCBpbnN0ZWFkIG9mIGJ5IHByZXNlbmNlOiB3aGF0IGEgY3JlYXR1cmUgeW91IG9ubHkgcmVtZW1iZXIgY2FuIGRvLCB3aGF0IGFuIGl0ZW0geW91IGhhdmUgbmV2ZXIgc2VlbiBpcyB3b3J0aCwgd2hpY2gga2luZHMgc2hhcmUgYSBgdHZhbGAuCgpgYGBqcwpyZWdpc3Rlcihob3N0LCBjdHgpIHsKICBjb25zdCByYWNlcyA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlczsKICBpZiAoIXJhY2VzKSByZXR1cm47ICAgICAgICAgICAgICAgICAvLyBjb21wb3NpdGlvbiB0aW1lLCBvciBhbiBvbGRlciBob3N0CiAgY29uc3QgYnlSaWR4ID0gbmV3IE1hcChyYWNlcy5tYXAoKHIpID0+IFtyLnJpZHgsIHJdKSk7Cn0KYGBgCgotIEl0IGlzIHRoZSB3aG9sZSBgQ29yZVJlZ2lzdHJpZXNgLCBub3QgYSBjdXJhdGVkIHNsaWNlLCBmb3IgdGhlIHNhbWUgcmVhc29uIGBjdHguY29yZWAgaXMgdGhlIHdob2xlIG5hbWVzcGFjZTogYSBjdXJhdGVkIGxpc3QgZHJpZnRzIG91dCBvZiBkYXRlLiBTZWUgc2VjdGlvbiA0IG9mIE1PRF9DT01QQVRJQklMSVRZLm1kLgotIEEgbW9kJ3MgY29udGVudCBpcyBpbiBpdCBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBjb3JlJ3MuIEJpbmRpbmcgcnVucyBhZnRlciBldmVyeSBlbmFibGVkIG1vZCBoYXMgY29tcG9zZWQgaXRzIGNvbnRlbnQsIGFuZCBtb2RzIGFwcGVuZCwgc28gYSBtb25zdGVyIGEgbW9kIGFkZGVkIGlzIGEgYE1vbnN0ZXJSYWNlYCBhdCBhIHJlYWwgYHJpZHhgIGFuZCBhbiBpdGVtIGEgbW9kIGFkZGVkIGlzIGFuIGBPYmplY3RLaW5kYCBhdCBhIHJlYWwgYGtpZHhgLiBOb3RoaW5nIGluIGEgbG9va3VwIHRlbGxzIHRoZW0gYXBhcnQ7IHRoZSBvbmx5IG1hcmtlciBpcyB0aGUgb3B0aW9uYWwgYGZyb21gIHByb3ZlbmFuY2UgZmllbGQsIGFuZCBtb3N0IGNvbnN1bWVycyBzaG91bGQgbm90IHJlYWQgaXQuIFRoYXQgaXMgd2h5IG1vZGRlZCBjb250ZW50IHdvcmtzIHRoZSBzYW1lIGFzIHZhbmlsbGEgY29udGVudCB3aXRoIG5vIGV4dHJhIHdvcmsgZnJvbSBhbnlvbmUuIFdpdGhvdXQgaXQsIGV2ZXJ5IGNvbnN1bWVyIHdvdWxkIGtlZXAgaXRzIG93biB0YWJsZSBvZiBjb3JlJ3MgY29udGVudCBhbmQgaWdub3JlIGV2ZXJ5dGhpbmcgYSBtb2QgYWRkZWQuCi0gR3VhcmQgaXQuIEl0IGlzIGFic2VudCBkdXJpbmcgY29udGVudCBjb21wb3NpdGlvbiAodGhhdCBpcyB3aGVuIGl0IGlzIGJlaW5nIGJ1aWx0KSBhbmQgb24gYW55IGhvc3Qgb2xkZXIgdGhhbiAyMDI2LTA4LTIxLCBzbyBgaWYgKCFjdHgucmVnaXN0cmllcykgcmV0dXJuO2AgaXMgdGhlIHBhdHRlcm4sIHRoZSBzYW1lIG9uZSBgY3R4LmJhY2t1cEZvbGRlcmAgdXNlcy4KLSBJdCBpcyB0aGUgcmVhZCBzZWFtLCBidXQgaXQgaXMgbm90IHJlYWQtb25seS4gVGhlc2UgYXJlIHRoZSBsaXZlIG9iamVjdHMgdGhlIGVuZ2luZSBydW5zIG9uLCBzbyBgcmVnaXN0cmllcy5yb29tc2AsIGByZWdpc3RyaWVzLnByb2ZpbGVzYCBhbmQgYHJlZ2lzdHJpZXMucm9vbXMuZ2x5cGhzYCBjYXJyeSB0aGUgc2FtZSBtdXRhdG9ycyB0aGUgY2FwYWJpbGl0eS1nYXRlZCBmYWNhZGVzIHdyaXRlIHRocm91Z2guIFVzZSB0aGUgZmFjYWRlIGFuZCBkZWNsYXJlIHRoZSBjYXBhYmlsaXR5OyBbV2hhdCBhIGNhcGFiaWxpdHkgZ2F0ZXMsIGFuZCB3aGF0IGl0IGRvZXMgbm90XSgjd2hhdC1hLWNhcGFiaWxpdHktZ2F0ZXMtYW5kLXdoYXQtaXQtZG9lcy1ub3QpIGV4cGxhaW5zIHdoeSB0aGUgZ2F0ZSBjYW5ub3Qgc3RvcCB5b3UgYW5kIHdoeSBkZWNsYXJpbmcgc3RpbGwgbWF0dGVycy4KCiMjIyBBdXRob3Jpbmc6IGBjdHguYXV0aG9yaW5nYCBhbmQgYGN0eC5jb21wb3NlZFJlY29yZHNgCgpUaGVzZSB0d28gYXJlIGZvciBhIG1vZCB0aGF0IHdyaXRlcyBjb250ZW50IGluc3RlYWQgb2YgcGxheWluZyBpdC4gQSB0b29sIHRoYXQgaGVscHMgYW4gYXV0aG9yIGRyYWZ0IGEgbW9uc3RlciBuZWVkcyB0d28gdGhpbmdzIHRoZSBzZWFtcyBhYm92ZSBjYW5ub3QgZ2l2ZSBpdDogdGhlIGZ1bmN0aW9ucyB0aGF0IGtub3cgd2hhdCBhIHdlbGwtZm9ybWVkIHJlY29yZCBsb29rcyBsaWtlLCBhbmQgdGhlIHJlY29yZHMgdGhlIGdhbWUgd2FzIGFjdHVhbGx5IGNvbXBvc2VkIGZyb20uCgpgY3R4LmF1dGhvcmluZ2AgaXMgdGhlIG1vZCBTREsncyBwdWJsaWMgYmFycmVsLCBsaXZlIGFuZCBhbHdheXMgcHJlc2VudC4gYFJFQ09SRF9CTFVFUFJJTlRTYCBhbmQgYGJsdWVwcmludEZvcmAgY2FycnkgZXZlcnkgZmllbGQncyBtZWFzdXJlZCBzaGFwZSwgdHlwZSBzZXQgYW5kIHJhbmdlOyBgZmllbGRVc2FnZWAgYW5kIGByZXF1aXJlZEZpZWxkc2Agc2F5IGhvdyBjb21tb24gYSBmaWVsZCBpczsgYHBlZXJzRm9yYCBidWlsZHMgYSB0YWJsZSBvZiBjb21wYXJhYmxlIHJlY29yZHMgYWxvbmcgd2l0aCBhIHNlbnRlbmNlIHNheWluZyB3aHkgdGhleSBhcmUgY29tcGFyYWJsZTsgYHN1Z2dlc3RGaWVsZHNgIHByb3Bvc2VzIGEgdmFsdWUgd2l0aCBpdHMgcmVhc29uOyBgY2hlY2tSZWNvcmRzYCBhbmQgYENPTVBBTklPTl9SVUxFU2AgdmFsaWRhdGUgYXQgdGhlIHNhbWUgdGhyZWUgbGV2ZWxzIHRoZSBydW5uaW5nIGdhbWUgdXNlczsgYW5kIGBNb2RQcm9qZWN0YCBhc3NlbWJsZXMgYW5kIGVtaXRzIGEgbW9kIGZvbGRlci4gSXQgaXMgdW5nYXRlZCwgYmVjYXVzZSB0aGVzZSBhcmUgcHVyZSBmdW5jdGlvbnMgb3ZlciBkYXRhIHlvdSBwYXNzIGluLgoKYGN0eC5jb21wb3NlZFJlY29yZHNgIGlzIHRoZSB1bmJvdW5kIGNvdW50ZXJwYXJ0IG9mIGBjdHgucmVnaXN0cmllc2A6IGV2ZXJ5IHJlY29yZCB0aGUgcnVubmluZyBnYW1lIGNvbXBvc2VkLCBhcyBKU09OLCBrZXllZCBieSBwYWNrLWZpbGUgc3RlbSB3aXRoIG5vIGV4dGVuc2lvbi4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHJlY29yZHMgPSBjdHguY29tcG9zZWRSZWNvcmRzOwogIGlmICghcmVjb3JkcykgcmV0dXJuOyAgICAgICAgICAgICAgIC8vIGNvbXBvc2l0aW9uIHRpbWUsIG9yIGFuIG9sZGVyIGhvc3QKICBjb25zdCB7IHBlZXJzLCBiZWNhdXNlIH0gPSBjdHguYXV0aG9yaW5nLnBlZXJzRm9yKAogICAgIm1vbnN0ZXIiLAogICAgeyBuYW1lOiAiV2FyZyBtYXRyaWFyY2giLCBiYXNlOiAiY2FuaW5lIiwgZGVwdGg6IDIyIH0sCiAgICByZWNvcmRzLAogICk7CiAgY3R4LmxvZyhgJHtwZWVycy5sZW5ndGh9IGNvbXBhcmFibGUgbW9uc3RlcnM6ICR7YmVjYXVzZX1gKTsKfQpgYGAKCi0gVXNlIGBjb21wb3NlZFJlY29yZHNgLCBub3QgYHJlZ2lzdHJpZXNgLCBmb3IgYW55dGhpbmcgdGhlIFNESyB0YWtlcy4gRXZlcnkgYHJlY29yZHNgIHBhcmFtZXRlciBpbiB0aGUgYXV0aG9yaW5nIGZ1bmN0aW9ucyBpcyBrZXllZCBieSBmaWxlIHN0ZW0gYW5kIGhvbGRzIHJhdyBKU09OLiBgcmVnaXN0cmllcy5tb25zdGVycy5yYWNlc2AgaXMgYm91bmQ6IHRoZSBiaW5kZXIgcmVzb2x2ZWQgYGJhc2VgIGludG8gYSBwb2ludGVyIGFuZCBkcm9wcGVkIHRoZSBzdHJpbmcsIHNvIHlvdSBjYW5ub3QgYnVpbGQgYSBwZWVyIHRhYmxlIGdyb3VwZWQgb24gYGJhc2VgIGZyb20gaXQsIG9yIGFzayBhYm91dCBhIGZpZWxkIHRoYXQgYm91bmQgdG8gbm90aGluZy4KLSBNb2QtYWRkZWQgcmVjb3JkcyBhcmUgaW4gaXQgb24gdGhlIHNhbWUgdGVybXMgYXMgY29yZSdzLCBqdXN0IGFzIGluIGByZWdpc3RyaWVzYCwgYW5kIGVhY2ggY2FycmllcyBpdHMgcHJvdmVuYW5jZS4gQSBkcmFmdCBiYXNlZCBvbiBhbm90aGVyIG1vZCdzIHN3b3JkIGRlcGVuZHMgb24gdGhhdCBtb2QsIGFuZCBwcm92ZW5hbmNlIGxldHMgeW91IHNlZSB0aGF0IHdoZW4gdGhlIGJhc2UgaXMgY2hvc2VuIGluc3RlYWQgb2YgYXQgaW5zdGFsbCB0aW1lLgotIEd1YXJkIGBjb21wb3NlZFJlY29yZHNgLCBub3QgYGF1dGhvcmluZ2AuIFRoZSByZWNvcmRzIGFyZSBhYnNlbnQgZHVyaW5nIGNvbnRlbnQgY29tcG9zaXRpb24sIGZvciB0aGUgc2FtZSByZWFzb24gYHJlZ2lzdHJpZXNgIGlzLiBUaGUgYmFycmVsIHdhaXRzIG9uIG5vdGhpbmcgYW5kIGlzIHByZXNlbnQgb24gZXZlcnkgY29udGV4dC4gQW4gb2xkZXIgaG9zdCBoYXMgbmVpdGhlciwgc28gYGlmICghY3R4LmNvbXBvc2VkUmVjb3JkcykgcmV0dXJuO2AgY292ZXJzIGJvdGguCi0gSXQgaG9sZHMgcmVjb3JkIG9iamVjdHMgb25seS4gUGFzc3Rocm91Z2ggZmlsZXMgY2FuIGNhcnJ5IGFycmF5cyBhbmQgc2NhbGFyczsgdGhlIGhvc3QgbmFycm93cyB0aHJvdWdoIHRoZSBTREsncyBvd24gYGNvbXBvc2VkT2JqZWN0c2AgYmVmb3JlIGhhbmRpbmcgdGhlIHJlY29yZHMgb3Zlciwgc28gdGhlIGF1dGhvcmluZyBmdW5jdGlvbnMgbmV2ZXIgbWVldCBhbiBlbGVtZW50IHRoZXkgY2Fubm90IHJlYWQuCgojIyMgRmlsbGluZyB0aWxlcwoKYHJlZ2lzdHJ5OnRpbGVzYCBpcyB0aGUgc2VhbSBmb3Igb25lIG5hcnJvdyB0aGluZzogKiphIHBpY3R1cmUgZm9yIGNvbnRlbnQgdGhlCmxvYWRlZCB0aWxlIHBhY2sgaGFzIG5ldmVyIGhlYXJkIG9mLioqIE5vIHRpbGUgc2V0IHdhcyBidWlsdCBrbm93aW5nIGFib3V0IHlvdXIKbW9kLCBzbyBpbiB0aWxlIG1vZGUgYSBjcmVhdHVyZSB5b3UgYWRkZWQgaXMgYSBjb2xvdXJlZCBsZXR0ZXIgc3RhbmRpbmcgaW4gYQp0aWxlZCBkdW5nZW9uLCBhbmQgdGhlIG9ubHkgcG9ydGFibGUgYWx0ZXJuYXRpdmUgdXNlZCB0byBiZSBvbmUgcHJlZiBmaWxlIHBlcgp0aWxlIHNldCBuYW1pbmcgYXRsYXMgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHVubWFpbnRhaW5hYmxlLgoKYGBganMKcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgaG9zdC50aWxlcy5yZWdpc3RlcigoZmlsbCkgPT4gewogICAgaWYgKGZpbGwucGFjay5lbmdpbmUgIT09ICJsaW5vbGV1bSIpIHJldHVybjsgICAvLyBvbmx5IHBhY2tzIHlvdSBrbm93CiAgICBjb25zdCByYWNlcyA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlczsKICAgIGlmICghcmFjZXMpIHJldHVybjsKICAgIGZvciAoY29uc3QgcmFjZSBvZiByYWNlcykgewogICAgICBpZiAoZmlsbC5tb25zdGVyVGlsZShyYWNlLnJpZHgpKSBjb250aW51ZTsgICAvLyBzb21lYm9keSBkcmV3IGl0IGFscmVhZHkKICAgICAgY29uc3QgZG9ub3IgPSBmaWxsLm1vbnN0ZXJUaWxlKDApOwogICAgICBpZiAoZG9ub3IpIGZpbGwuZmlsbE1vbnN0ZXIocmFjZS5yaWR4LCBmaWxsLmRlcml2ZShkb25vciwgOTApID8/IHsgLi4uZG9ub3IgfSk7CiAgICB9CiAgfSk7Cn0KYGBgCgotIFlvdSBjYW5ub3QgcmVwYWludCB0aGUgdGlsZSBzZXQuIGBmaWxsTW9uc3RlcmAgLyBgZmlsbE9iamVjdGAgd3JpdGUgb25seSB3aGVyZSBub3RoaW5nIGlzIGFzc2lnbmVkIGFuZCByZXR1cm4gYGZhbHNlYCBvdGhlcndpc2UuIEV2ZXJ5IHByZWYgbGF5ZXIgKHRoZSBwYWNrJ3Mgb3duLCB0aGVuIGVhY2ggZW5hYmxlZCBtb2QncykgcnVucyBiZWZvcmUgYW55IGZpbGxlciwgc28gYSB0aWxlIGFuIGF1dGhvciBuYW1lZCBpcyBuZXZlciB0cmVhdGVkIGFzIGEgYmxhbmsuIEl0IGFsc28gbWVhbnMgdHdvIG1vZHMgY2Fubm90IGZpZ2h0OiB3aGljaGV2ZXIgYXNrcyBmaXJzdCBmb3IgYW4gaW5kZXggZ2V0cyBpdCwgYW5kIG5laXRoZXIgY2FuIHVuZG8gdGhlIG90aGVyLgotIGBkZXJpdmUoZG9ub3IsIGh1ZSlgIG1heSByZXR1cm4gYG51bGxgLCBhbmQgdXN1YWxseSBkb2VzLiBJdCBhc2tzIHRoZSBlbmdpbmUgZm9yIGEgdGlsZSB0aGF0IGRyYXdzIHRoZSBkb25vcidzIGFzc2V0IHdpdGggaXRzIGh1ZSByb3RhdGVkLiBBIHRpbGVzaGVldCBjYW5ub3QgcHJvdmlkZSBvbmUsIGJlY2F1c2UgaXRzIHRpbGVzIGFyZSBjZWxscyBvZiBhIGZpeGVkIGF0bGFzIHdpdGggbm8gc3BhcmUgY2VsbCBmb3IgYSB2YXJpYW50LCBzbyBpdCBhbHdheXMgcmV0dXJucyBgbnVsbGAuIEEgbG9vc2UgcGFjayBjYW4sIHVubGVzcyB0aGUgZG9ub3IncyBhc3NldCBpcyBub3Qgb25lIG9mIGl0cyBvd24uIEZhbGwgYmFjayB0byBhIHBsYWluIGNvcHkuCi0gQ2hlY2sgYGZpbGwucGFja2AuIEEgdGlsZXNldCBtb2QncyBydWxlIGZpdHMgaXRzIG93biBhcnQgYW5kIGlzIG9ubHkgYSBndWVzcyBhYm91dCBhbnlvbmUgZWxzZSdzLCBzbyBkZWNsaW5pbmcgcGFja3MgeW91IGRvIG5vdCBvd24gaXMgbm9ybWFsLgotIENvcmUgZG9lcyBub3QgZGVjaWRlIHdoaWNoIGNvbnRlbnQgZ2V0cyBhIHRpbGUuIEl0IHVzZWQgdG86IDAuMjIuMCBzaGlwcGVkIGEgcnVsZSBpbiBjb3JlIHRoYXQgZHJldyBhIG1vZC1hZGRlZCBtb25zdGVyIGZyb20gYSByYWNlIHNoYXJpbmcgaXRzIGBiYXNlYCwgYW5kIDAuMjMuMCByZW1vdmVkIGl0LCBiZWNhdXNlIEFuZ2JhbmQgNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYSBtb2QtYWRkZWQgcmVjb3JkIGFuZCB0aGUgcG9ydCBhZGRzIG5vdGhpbmcuIFRoYXQgcnVsZSBub3cgbGl2ZXMgaW4gYGxpbm9sZXVtYCwgd2hpY2ggaXMgdGhlIHdvcmtlZCBleGFtcGxlLiBOb3RlIHdoYXQgaXQgbGVhdmVzIGFsb25lOiByaW5ncywgYW11bGV0cywgbXVzaHJvb21zIGFuZCBmb29kIGFyZSBkcmF3biBieSBmbGF2b3VyLCBzbyB0aGVpciBraW5kIHNsb3RzIGFyZSBibGFuayBvbiBwdXJwb3NlLCBhbmQgYW4gb2xkZXIgcGFjayBoYXMgbm8gYXJ0IGZvciBjb250ZW50IGFkZGVkIGFmdGVyIGl0IHdhcyBkcmF3bi4gQSBsZXR0ZXIgaXMgdGhlIHJpZ2h0IHJlc3VsdCBpbiBib3RoIGNhc2VzLCBzbyB0aGUgcnVsZSBpcyByZXN0cmljdGVkIHRvIHJlY29yZHMgYSBtb2QgYWRkZWQsIGJ5IHByb3ZlbmFuY2UuCgpJZiB5b3UgYXJlIHNoaXBwaW5nIGNvbnRlbnQgcmF0aGVyIHRoYW4gdGlsZXMsIGRyYXcgeW91ciBvd24gdGlsZXMgZm9yIGl0LiBBIGZpbGxlciBpcyBhIGZhbGxiYWNrIGZvciBtb2RzIHRoYXQgZG8gbm90LCBhbmQgaXQgaGFzIG5vIHdheSB0byBrbm93IHdoYXQgeW91IGludGVuZGVkLgoKIyMjIFJlcGFpbnRpbmcgYSB0aWxlLCBhbmQgZHJhd2luZyB0aGUgcGxheWVyJ3Mgb3duIGNlbGwKClR3byBtb3JlIGZlYXR1cmVzIGxpdmUgb24gdGhlIHNhbWUgYHJlZ2lzdHJ5OnRpbGVzYCBzZWFtLiBOZWl0aGVyIGZpbGxzIGEgYmxhbms7IGJvdGggc3RhcnQgZnJvbSBhIHRpbGUgdGhhdCBhbHJlYWR5IGhhcyBhIHBpY3R1cmUuCgpgZmlsbC50cmFuc2Zvcm0oZG9ub3IsIHNwZWMpYCBpcyB0aGUgc2libGluZyBvZiBgZGVyaXZlYCwgZm9yIHdoZW4gcm90YXRpbmcgdGhlIGRvbm9yJ3MgaHVlIGlzIG5vdCB3aGF0IHlvdSB3YW50LiBgZGVyaXZlYCBrZWVwcyB0aGUgZG9ub3IncyBjb2xvdXJzIGFuZCB0dXJucyB0aGVtLCB3aGljaCBkb2VzIG5vdGhpbmcgdG8gZ3JleTsgYHRyYW5zZm9ybWAgcmVwbGFjZXMgdGhlIHBhbGV0dGUuIEVhY2ggcGl4ZWwgaXMgaW5kZXhlZCBieSBicmlnaHRuZXNzIGludG8gYSByYW1wIHlvdSBzdXBwbHksIGRhcmtlc3QgZmlyc3QsIGFuZCByZXBhaW50ZWQgd2l0aCB0aGUgY29sb3VyIGF0IHRoYXQgaW5kZXgsIHNvIHRoZSByZXN1bHQgaXMgaW4geW91ciBjb2xvdXJzIHdoYXRldmVyIHRoZSBkb25vcidzIHdlcmUsIGdyZXkgZG9ub3JzIGluY2x1ZGVkLiBBbHBoYSBpcyBsZWZ0IHVudG91Y2hlZCwgc28gdGhlIHNpbGhvdWV0dGUgbWF0Y2hlcyB0aGUgZG9ub3IncyBleGFjdGx5LiBJdCBjYW4gYWxzbyBtaXJyb3IgdGhlIHBpY3R1cmUgaG9yaXpvbnRhbGx5LCBpbmRlcGVuZGVudGx5IG9mIHRoZSByYW1wLiBMaWtlIGBkZXJpdmVgLCBpdCByZXR1cm5zIGBudWxsYCBvbiBhIGZpeGVkIHRpbGVzaGVldCAobm8gc3BhcmUgY2VsbCBmb3IgYSB2YXJpYW50KSBhbmQgaW4gdGhlIHNhbWUgdHdvIG90aGVyIGNhc2VzOyBmYWxsIGJhY2sgdG8gYSBwbGFpbiBjb3B5LgoKYGBganMKY29uc3QgdGlsZSA9IGZpbGwudHJhbnNmb3JtKGRvbm9yLCB7IG1pcnJvcjogdHJ1ZSwgcmFtcDogW1syMCwgMTAsIDMwXSwgWzkwLCA0MCwgMTEwXSwgWzE4MCwgMTIwLCAyMjBdXSB9KTsKYGBgCgpgdGlsZXMucGxheWVyKHByb3ZpZGVyKWAgYW5zd2VycyBhIGRpZmZlcmVudCBxdWVzdGlvbiwgb25jZSBwZXIgZnJhbWUgaW5zdGVhZCBvZiBvbmNlIHBlciBtYXAgYnVpbGQ6IGdpdmVuIHdobyB0aGUgY2hhcmFjdGVyIGlzIHJpZ2h0IG5vdywgaXMgdGhlcmUgYSB0aWxlIHRoYXQgZml0cyBiZXR0ZXIgdGhhbiB0aGUgcGFjaydzIG93biBwbGF5ZXIgcGljdHVyZT8gVGhlIHBsYXllciBpcyByYWNlIDAgaW4gdGhlIG1vbnN0ZXIgdGlsZSB0YWJsZSBhbmQgZXZlcnkgc2hpcHBlZCBwYWNrIGFzc2lnbnMgaXQsIHNvIHRoZXJlIGlzIG5vIGJsYW5rIGhlcmUgZm9yIGEgZmlsbGVyIHRvIHdyaXRlIGludG8uIFRoZSBwcm92aWRlciBpcyBhc2tlZCBpbnN0ZWFkLCBhbmQgYG51bGxgIG1lYW5zIG5vLCB3aGljaCBpcyBhbHNvIHRoZSByZXN1bHQgd2hlbiBubyBwcm92aWRlciBpcyBpbnN0YWxsZWQuIFRoZSBmaXJzdCBub24tbnVsbCBhbnN3ZXIgaW4gbG9hZCBvcmRlciB3aW5zLCBzbyB0d28gc3VjaCBtb2RzIGNhbiBjb2V4aXN0LgoKYGBganMKaG9zdC50aWxlcy5wbGF5ZXIoKHZpZXcpID0+IHsKICBpZiAoIXZpZXcuc2hhcGUpIHJldHVybiBudWxsOyAgICAgICAgICAvLyBub3JtYWwgc2hhcGU6IGxldCB0aGUgcGFjayBkcmF3IGl0CiAgcmV0dXJuIHNoYXBlVGlsZUZvcih2aWV3LnNoYXBlLCB2aWV3LmxldmVsLCB2aWV3LmNscywgdmlldy5yYWNlKTsKfSk7CmBgYAoKVGhlIHZpZXcgeW91IGdldCAoYHNoYXBlYCwgYGxldmVsYCwgYGNsc2AsIGByYWNlYCkgaXMgYSBzZXQgb2YgbmFtZWQgZmFjdHMsIG5vdCB0aGUgbGl2ZSBwbGF5ZXIgcmVjb3JkLCBzbyBhIHJlbmRlci10aW1lIGhvb2sgaGFzIG5vdGhpbmcgdG8gbXV0YXRlLiBCZWNhdXNlIHRoZSBwcm92aWRlciBydW5zIGluc2lkZSB0aGUgcmVuZGVyIHBhdGgsIGl0IG11c3QgYmUgYSBsb29rdXA6IGFsbG9jYXRlIHRoZSB0aWxlcyB5b3VyIGFuc3dlcnMgbmVlZCBkdXJpbmcgdGhlIGZpbGwgKHdpdGggYHRyYW5zZm9ybWApIGFuZCByZWFkIHRoYXQgdGFibGUgaGVyZS4gQSBwcm92aWRlciB0aGF0IHRocm93cyBsb3NlcyB0aGF0IGZyYW1lJ3MgYW5zd2VyIGFuZCBub3RoaW5nIGVsc2UuCgojIyMgUmVhZGluZyBhIG1vbnN0ZXIncyB0aWxlOiBgY3R4LnRpbGVzYAoKYHJlZ2lzdHJ5OnRpbGVzYCBhYm92ZSBpcyB0aGUgV1JJVEUgc2lkZTogc3VwcGx5aW5nIGFydCB0aGUgbG9hZGVkIHBhY2sgaGFzCm5ldmVyIGhlYXJkIG9mLiBgY3R4LnRpbGVzYCBpcyB0aGUgUkVBRCBzaWRlLCBmb3IgYSBtb2QgdGhhdCB3YW50cyB0byBkcmF3IGEKbW9uc3RlcidzIGV4aXN0aW5nIHRpbGUgYXJ0IHNvbWV3aGVyZSBvZiBpdHMgb3duIC0gYSBwb3J0cmFpdCBpbiBhIGRpYWxvZywgYQpzaWRlYmFyIHJvdywgYW55dGhpbmcgb3V0c2lkZSB0aGUgZHVuZ2VvbiBncmlkIGl0c2VsZi4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHBhaW50ZWQgPSBjdHgudGlsZXM/LmFjdGl2ZSAmJiBjdHgudGlsZXMuaGFzTW9uc3RlclRpbGUocmFjZS5yaWR4KQogICAgPyBjdHgudGlsZXMuZHJhd01vbnN0ZXIobXlDYW52YXMuZ2V0Q29udGV4dCgiMmQiKSwgcmFjZS5yaWR4LCAwLCAwLCAzMiwgMzIpCiAgICA6IGZhbHNlOwogIGlmICghcGFpbnRlZCkgZHJhd0FzY2lpR2x5cGhJbnN0ZWFkKHJhY2UpOwp9CmBgYAoKLSAqKmBjdHgudGlsZXMuYWN0aXZlYCoqIGlzIHRydWUgd2hlbiBhIGdyYXBoaWNzL3RpbGVzZXQgbW9kZSwgcmF0aGVyIHRoYW4KICBBU0NJSSwgaXMgdGhlIGN1cnJlbnQgZGlzcGxheSBtb2RlLiBGYWxzZSBpbiBBU0NJSSBtb2RlLCBhbHdheXMgLSB0aGVyZSBpcwogIG5vdGhpbmcgdG8gcGFpbnQuCi0gKipgY3R4LnRpbGVzLmhhc01vbnN0ZXJUaWxlKHJpZHgpYCoqIGFuc3dlcnMgd2hldGhlciB0aGUgQUNUSVZFIHBhY2sgYXNzaWducwogIHRoaXMgcmFjZSBhIHRpbGUgYXQgYWxsIChjb3JlJ3Mgb3duIGB0aWxlRm9yTW9uc3RlcmApLCB3aXRob3V0IHRvdWNoaW5nIGEKICBjYW52YXMuIEZhbHNlIGluIEFTQ0lJIG1vZGUsIGFuZCBmYWxzZSBmb3IgYSByYWNlIHRoZSBwYWNrIGhhcyBuZXZlciBkcmF3biAtCiAgYW4gb2xkIHBhY2sgd2l0aCBubyBhcnQgZm9yIGNvbnRlbnQgYWRkZWQgc2luY2UsIHNheS4KLSAqKmBjdHgudGlsZXMuZHJhd01vbnN0ZXIoY3R4MmQsIHJpZHgsIGR4LCBkeSwgZHcsIGRoKWAqKiBwYWludHMgdGhlIHJhY2UncwogIHRpbGUgb250byBhIDJEIGNhbnZhcyBjb250ZXh0IHlvdSBvd24sIGF0IGAoZHgsIGR5KWAgc2NhbGVkIHRvIGAoZHcsIGRoKWAsCiAgY29tcG9zaXRlZCBvdmVyIGEgbmV1dHJhbCBmbG9vciB0aWxlIC0gdGhlIHNhbWUgdGVycmFpbi10aGVuLWZvcmVncm91bmQgYmxpdAogIHRoZSBkdW5nZW9uIHZpZXcgaXRzZWxmIGRyYXdzIGEgbW9uc3RlciBzdGFuZGluZyBvbiBvcGVuIGdyb3VuZCB3aXRoLgogIFJldHVybnMgYHRydWVgIHdoZW4gYXJ0IHdhcyBkcmF3bjsgYGZhbHNlYCAoQVNDSUkgbW9kZSwgbm8gdGlsZSBmb3IgdGhpcwogIHJhY2UsIG9yIGl0cyBpbWFnZSBoYXMgbm90IGZpbmlzaGVkIGxvYWRpbmcgeWV0KSBtZWFucyBmYWxsIGJhY2sgdG8geW91ciBvd24KICBBU0NJSSBnbHlwaC4KLSAqKkVudGlyZWx5IHVuZ2F0ZWQqKiwgdGhlIHNhbWUgcmVhc29uaW5nIGBkaXNwbGF5YCBhbmQgYHN1YndpbmRvd3NgIGNhcnJ5OgogIHRoaXMgaXMgcmVhZC1vbmx5IGFydCB0aGUgcGFnZSBhbHJlYWR5IGZldGNoZWQgKHRoZSBhY3RpdmUgcGFjaydzIG93bgogIGltYWdlcyksIG5vdCBhIGNhcGFiaWxpdHkgb3ZlciB0aGUgZ2FtZSBvciB0aGUgcGxhdGZvcm0uCi0gKipBYnNlbnQgb24gYW4gb2xkZXIgaG9zdC4qKiBgY3R4LnRpbGVzYCBkaWQgbm90IGV4aXN0IGJlZm9yZSBuZW8tYW5nYmFuZCMyNTY7CiAgZ3VhcmQgaXQgd2l0aCBgY3R4LnRpbGVzPy5gIGFuZCBkZWdyYWRlIHRvIHRoZSBBU0NJSSBnbHlwaCwgdGhlIHNhbWUgc2hhcGUKICBldmVyeSBvdGhlciBvcHRpb25hbCBgY3R4YCBkb29yIGFscmVhZHkgdXNlcy4KCiMjIyBSZWFkaW5nIG9uZSBpbnB1dCB3YWl0OiBgY3R4LnNuYXBzaG90KClgCgpgY3R4LnNuYXBzaG90KClgIHJldHVybnMgdGhlIGdhbWUgYXQgdGhlIGN1cnJlbnQgaW5wdXQgd2FpdCBhcyBvbmUgZnJvemVuIG9iamVjdCwgb3IgbnVsbCBiZWZvcmUgYSBnYW1lIGV4aXN0czogYGNvcmVgICh0aGUgYEFnZW50Vmlldy5jYXB0dXJlKClgIHBhcnRzOiB0dXJuLCBwbGF5ZXIsIGludmVudG9yeSwgZXF1aXBtZW50LCBtb25zdGVycywgdGFyZ2V0LCBzdG9yZXMsIHNwZWxsYm9va3MpLCBgcGhhc2VgLCBgbWVzc2FnZVBlbmRpbmdgLCBgZnJhbWVgICh0aGUgbGFzdCB3b3JsZCBmcmFtZSkgYW5kIGB0b2tlbmAuIFNlbmQgdGhlIHRva2VuIGJhY2sgd2l0aCBhbiBhY3Rpb24gc28gYSBzdGFsZSBvbmUgY2FuIGJlIHJlZnVzZWQuIFBhcnRzIHlvdSBoYXZlIG5vIHJlYWQgY2FwYWJpbGl0eSBmb3IgYXJlIG51bGw7IHRoZSBwaGFzZSBhbmQgcGF1c2UgdXNlIGBzdGF0ZTppbnRlcmFjdGlvbi5yZWFkYCBhbmQgdGhlIGZyYW1lIHVzZXMgYHN0YXRlOm1hcC5yZWFkYC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0Z10oTU9EX1NFQU1TLm1kIzRnLWN0eHNuYXBzaG90LWFuZC10aGUtaW5wdXQtdG9rZW4tLS1vbmUtd2FpdC1yZWFkLXdob2xlKS4KClRoZSBjb3JlIHNuYXBzaG90IGFsc28gY2FycmllcyBxdWl2ZXIgaXRlbXMsIGVxdWlwbWVudCBzbG90IGxhYmVscywgbG9jYWwgZmxvb3IgaXRlbXMsIGl0ZW0ga2V5cyBhbmQgbmFtZSBhdHRyaWJ1dGVzLCBhbmQgc3BlbGwgc3R1ZHkgZmllbGRzIHVuZGVyIHRoZWlyIG1hdGNoaW5nIHN0YXRlIGdyYW50cy4gVGhlIGhvc3Qgc25hcHNob3QgYWRkcyByZXN0IGFjdGl2aXR5LCBtZXNzYWdlIGhpc3RvcnksIGFjdGl2ZSBibGFzdCBtZXRhZGF0YSBhbmQgc3RvcmUgc3RhdHVzLiBgY3R4LmNoYXJhY3Rlci5rZXkoKWAgcmV0dXJucyB0aGUgYXR0YWNoZWQgY2hhcmFjdGVyJ3Mgcm9zdGVyIGxpbmVhZ2UgdW5kZXIgYHN0YXRlOnBsYXllci5yZWFkYC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbnMgNGddKE1PRF9TRUFNUy5tZCM0Zy1jdHhzbmFwc2hvdC1hbmQtdGhlLWlucHV0LXRva2VuLS0tb25lLXdhaXQtcmVhZC13aG9sZSkgYW5kIFs0c10oTU9EX1NFQU1TLm1kIzRzLWNvbW1hbmQtY2F0YWxvZ3VlLWFuZC1zdG9yZS1wYW5lbC1zdGF0dXMpLgoKYGN0eC5pbnNwZWN0LnRyYXZlbFBhdGgoKWAgcHJldmlld3MgdGhlIHRyYXZlbCBjb21tYW5kJ3Mgd2Fsa2luZyByb3V0ZSwgYHRpbGVBY3Rpb25zKClgIGxpc3RzIGNvbW1hbmQgY29kZXMgZm9yIGEgcmVtZW1iZXJlZCBncmlkLCBhbmQgYGl0ZW1SdWxlcygpYCByZWFkcyBsZWFybmVkIGlnbm9yZSBhbmQgYXV0by1pbnNjcmlwdGlvbiBzZXR0aW5ncy4gVGhlIG1hcCByZWFkcyBuZWVkIGBzdGF0ZTptYXAucmVhZGA7IGl0ZW0gcnVsZXMgbmVlZCBgc3RhdGU6aW52ZW50b3J5LnJlYWRgLiBFYWNoIGFuc3dlciBpcyBmcm96ZW4gYW5kIHN0YW1wZWQgd2l0aCB0aGUgaW5wdXQgdG9rZW4uIGBjdHguZGlzcGxheS5zZXRNYXBNYXJnaW4oKWAgcmVzZXJ2ZXMgYSBjbGVhciBzdHJpcCBiZXNpZGUgdGhlIG1haW4gbWFwIGFuZCBuZWVkcyBubyBhZGRlZCBjYXBhYmlsaXR5LiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRrXShNT0RfU0VBTVMubWQjNGstY3R4aW5zcGVjdC0tLXJlYWQtdGhlLWdhbWVzLW93bi1pbnNwZWN0aW9uLWFuc3dlcnMpIGFuZCBbc2VjdGlvbiA0b10oTU9EX1NFQU1TLm1kIzRvLXJlc2VydmluZy1hLW1hcC1tYXJnaW4pLgoKIyMjIFdvcmtpbmcgYmVzaWRlIGNvbnRyb2xsZXJzIGFuZCBvdGhlciBtb2RzCgpgY3R4LnNuYXBzaG90KCkuZHJpdmVyYCBhbmQgYGN0eC5kcml2ZXIoKWAgbmFtZSB0aGUgY3VycmVudCBrZXlib2FyZCBvd25lci4gQSBjb250cm9sbGVyIG1vZCBjYW4gcHVibGlzaCBhIHRhc2sgbGFiZWwgYW5kIHJlYXNvbiB0aHJvdWdoIGBjdHguY29udHJvbGxlci5zZXRTdGF0dXMoKWAsIHJlbGVhc2UgdGhlIGtleWJvYXJkIHRocm91Z2ggYGN0eC5jb250cm9sbGVyLnJlbGVhc2UocmVhc29uPylgLCBhbmQgbW9kcyB3aXRoIGBldmVudDpkcml2ZXItY2hhbmdlZGAgY2FuIGxpc3RlbiBmb3IgY2hhbmdlcy4gYGN0eC5tb2RzKClgIGxpc3RzIGVuYWJsZWQsIGxvYWRlZCBtb2RzIGFuZCBvbmx5IHRoZSBydWxlIG9yIHNlY3Rpb24gZmxhZ3MgZWFjaCBtYW5pZmVzdCBkZWNsYXJlcyBpbiBgcHVibGljRmxhZ3NgLiBEaXNwbGF5IHNldHRlcnMga2VlcCBhIHZhbHVlIHBlciBtb2QsIHJlc3RvcmUgYW4gZWFybGllciB2YWx1ZSB3aGVuIHRoZSBjdXJyZW50IG93bmVyIGNsZWFycyBvciB1bmxvYWRzLCBhbmQgZXhwb3NlIGdldHRlcnMgZm9yIHRoZSB2YWx1ZSBpbiBmb3JjZS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0cV0oTU9EX1NFQU1TLm1kIzRxLWNvbnRyb2xsZXItb3duZXJzaGlwLXB1YmxpYy1tb2RzLWFuZC1kaXNwbGF5LXJlcXVlc3RzKS4gQSBjb250cm9sbGVyIGNhbiBzYXkgbW9yZSBhYm91dCBvbmUgaW5zdGFsbCBieSByZXR1cm5pbmcgYHsgY29udHJvbGxlciwgbm9uZGV0ZXJtaW5pc3RpYywgb25EZWF0aCwgb25LZXkgfWAsIGFuZCBhIG1vZCB3aXRoIGBldmVudDpwbGF5ZXItY29tbWFuZGAgY2FuIHdhdGNoIHRoZSBwbGF5ZXIncyBvd24gY29tbWFuZHMgd2hpbGUgaXQgd2FpdHM7IHNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb25zIDRxIGFuZCA0bF0oTU9EX1NFQU1TLm1kIzRxLWNvbnRyb2xsZXItb3duZXJzaGlwLXB1YmxpYy1tb2RzLWFuZC1kaXNwbGF5LXJlcXVlc3RzKS4KCiMjIyBXYXRjaGluZyByZXNvbHZlZCBvdXRjb21lczogYGN0eC5ldmVudHNgCgpEZWNsYXJlIGBldmVudDpjb21iYXQtb3V0Y29tZWAsIGBldmVudDpoZWFsYCwgb3IgYGV2ZW50Om1vdGlvbmAgdG8gcmVjZWl2ZSBgY3R4LmV2ZW50c2AgZHVyaW5nIGEgZ2FtZS4gU3Vic2NyaWJlIHdpdGggYGN0eC5ldmVudHMub24obmFtZSwgaGFuZGxlcilgOyBlYWNoIG5hbWUgbmVlZHMgaXRzIG93biBncmFudC4gQ29tYmF0IHBheWxvYWRzIHJlcG9ydCBoaXQgb3IgbWlzcywgYXBwbGllZCBkYW1hZ2UsIGRlYXRoLCBhbmQgdGhlIHRhcmdldCBncmlkLiBIZWFsaW5nIHJlcG9ydHMgdGhlIHJlc3RvcmVkIGFtb3VudC4gTW90aW9uIG5hbWVzIGEgYHdhbGtgIG9yIGB0ZWxlcG9ydGAgYXQgdGhlIGNvbXBsZXRlZCBtb3ZlLiBFdmVyeSBwYXlsb2FkIGluY2x1ZGVzIGBzZWVuYCwgYW5kIHVuc2VlbiBldmVudHMgc3RpbGwgYXJyaXZlLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRsXShNT0RfU0VBTVMubWQjNGwtcmVzb2x2ZWQtY29tYmF0LWhlYWxpbmctYW5kLW1vdmVtZW50LWV2ZW50cykuCgojIyMgTWFuYWdpbmcgY2hhcmFjdGVyczogYGN0eC5zYXZlc2AKCkRlY2xhcmUgYHNhdmVzOm1hbmFnZWAgZm9yIGEgcmVwbGFjZW1lbnQgdGl0bGUgc2NyZWVuIHRoYXQgbGlzdHMsIGxvYWRzLCByZW5hbWVzIG9yIGRlbGV0ZXMgY2hhcmFjdGVycy4gYGN0eC5zYXZlc2AgaXMgYWJzZW50IHdpdGhvdXQgdGhhdCBncmFudC4gVGhlIG1ldGhvZHMgYW5kIHRoZWlyIHJlZnVzYWwgcmVzdWx0cyBhcmUgZGVzY3JpYmVkIGluIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0bV0oTU9EX1NFQU1TLm1kIzRtLWN0eHNhdmVzLS0tdGhlLWhvc3QtY2hhcmFjdGVyLXJvc3RlcikuCgpgY3R4LnNhdmVzLm9uQ2hhbmdlKClgIHJlcG9ydHMgZnJvemVuIHJlbmFtZSBhbmQgZGVsZXRlIGV2ZW50cyBhZnRlciB0aGUgaG9zdCBjaGFuZ2VzIHRoZSByb3N0ZXIsIGluY2x1ZGluZyBjaGFuZ2VzIG1hZGUgb3V0c2lkZSBhIG1vZCBtZW51LiBFYWNoIGV2ZW50IGNhcnJpZXMgdGhlIHN0YWJsZSBsaW5lYWdlIGtleSByZXR1cm5lZCBieSBgY3R4LmNoYXJhY3Rlci5rZXkoKWAgZm9yIHRoZSBhdHRhY2hlZCBjaGFyYWN0ZXIuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNG1dKE1PRF9TRUFNUy5tZCM0bS1jdHhzYXZlcy0tLXRoZS1ob3N0LWNoYXJhY3Rlci1yb3N0ZXIpLgoKRGVjbGFyZSBgc2Vzc2lvbjpjb250cm9sYCBmb3IgYSBzYXZlIGRpYWxvZyBvZiB5b3VyIG93bi4gYGN0eC5zZXNzaW9uYCBzYXZlcyB0aGUgZ2FtZSwgbGVhdmVzIGZvciB0aGUgdGl0bGUgc2NyZWVuIG9yIHF1aXRzLCBhcyB0aGUgZ2FtZSBtZW51IGRvZXMsIGJ1dCB3aXRob3V0IHRoZSBtZW51J3MgY29uZmlybWF0aW9ucy4gRWFjaCBjYWxsIHNhdmVzIGZpcnN0IGFuZCBzdGF5cyBpbiB0aGUgZ2FtZSB3aGVuIHRoZSBzYXZlIGZhaWxzLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRtXShNT0RfU0VBTVMubWQjNG0tY3R4c2F2ZXMtLS10aGUtaG9zdC1jaGFyYWN0ZXItcm9zdGVyKS4KCiMjIyBUaXRsZSBhY3Rpb25zIGFuZCBwbGF5ZXIgcHJvZmlsZXMKCkRlY2xhcmUgYHVpOnRpdGxlYCB0byByZWNlaXZlIGBjdHgudGl0bGVgLiBgcmVnaXN0ZXJSb3coeyBsYWJlbCwga2V5PywgcnVuIH0pYCBhZGRzIGFuIGFjdGlvbiBhZnRlciB0aGUgY29yZSB0aXRsZSBvcHRpb25zLiBSb3dzIGtlZXAgdGhlaXIgcmVnaXN0cmF0aW9uIG9yZGVyLCBhbmQgdGhlIGhvc3QgcmVtb3ZlcyBhIG1vZCdzIHJvd3Mgd2hlbiBpdCB1bmluc3RhbGxzIHRoYXQgbW9kLiBUaGUgb3B0aW9uYWwga2V5IGlzIGEgbGV0dGVyIG9yIGRpZ2l0OyBhIGNvcmUga2V5IG9yIGFuIGVhcmxpZXIgbW9kIGtleSBrZWVwcyBpdHMgZXhpc3RpbmcgYWN0aW9uLiBgY2hvb3NlKHRpdGxlLCBjaG9pY2VzKWAgb3BlbnMgYSBjaG9pY2UgbWVudSBiZWZvcmUgcGxheSBiZWdpbnMgYW5kIHJldHVybnMgdGhlIGNob3NlbiBpbmRleCwgb3IgYG51bGxgIG9uIEVzY2FwZS4gVGhlIGZpcnN0IGNob2ljZSBpcyBzZWxlY3RlZCBieSBkZWZhdWx0LgoKRGVjbGFyZSBgcHJvZmlsZXM6bWFuYWdlYCB0byByZWNlaXZlIGBjdHgucHJvZmlsZXNgLiBBIG1vZCBjYW4gbGlzdCBwcm9maWxlcywgY3JlYXRlIGEgZnJlc2ggcHJvZmlsZSBvciBjb3B5IGNvbmZpZ3VyYXRpb24gZnJvbSBhbm90aGVyIHByb2ZpbGUsIHJlcGxhY2UgdGhlIGVuYWJsZWQgbW9kcyBpbiBhIHByb2ZpbGUgaXQgY3JlYXRlZCwgYW5kIHN3aXRjaCBwcm9maWxlcyBiZWZvcmUgcGxheSBiZWdpbnMuIFByb2ZpbGUgY29waWVzIGV4Y2x1ZGUgY2hhcmFjdGVycyBhbmQgdGhlIHNhdmUgcm9zdGVyLiBTZWUgW01PRF9TRUFNUy5tZF0oTU9EX1NFQU1TLm1kI3BsYXllci1wcm9maWxlcy1hbmQtdGl0bGUtYWN0aW9ucykgZm9yIG1ldGhvZCB0eXBlcyBhbmQgcmVsb2FkIGFjdGlvbnMuCgojIyMgU2hhcmluZyBkYXRhIHdpdGggb3RoZXIgbW9kczogYGN0eC5zaGFyZWRgCgpEZWNsYXJlIGBzaGFyZWQ6cHVibGlzaGAgdG8gcHVibGlzaCBuYW1lZCBKU09OIHZhbHVlcyB3aXRoIGBjdHguc2hhcmVkLnB1Ymxpc2gobmFtZSwgdmVyc2lvbiwgdmFsdWUpYCwgYW5kIGBzaGFyZWQ6cmVhZGAgdG8gcmVhZCBhbm90aGVyIG1vZCdzIHdpdGggYGN0eC5zaGFyZWQucmVhZChtb2RJZCwgbmFtZSlgLiBBIHJlYWQgcmV0dXJucyBhIGZyb3plbiBjb3B5LCBvciBudWxsIHdoZW4gdGhhdCBtb2QgaXMgbm90IGluc3RhbGxlZCwgaXMgZGlzYWJsZWQsIGZhaWxlZCB0byBsb2FkLCBvciBoYXMgbm90IHB1Ymxpc2hlZCB0aGUgbmFtZS4gVmFsdWVzIG11c3QgYmUgcGxhaW4gSlNPTiBvZiBhdCBtb3N0IDI1NiBLaUIsIGFuZCB0aGUgdmVyc2lvbiBpcyBhIG51bWJlciB5b3UgcmFpc2Ugd2hlbiB0aGUgdmFsdWUncyBzaGFwZSBjaGFuZ2VzLiBUcmVhdCB3aGF0IHlvdSByZWFkIGFzIHVudHJ1c3RlZCBpbnB1dCBhbmQgY2hlY2sgaXRzIHZlcnNpb24gYW5kIGZpZWxkcyBiZWZvcmUgeW91IHVzZSBpdC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0emFdKE1PRF9TRUFNUy5tZCM0emEtY3R4c2hhcmVkLS0tdmFsdWVzLW9uZS1tb2Qtc2hhcmVzLXdpdGgtb3RoZXJzKS4KCiMjIyBUaWxlZCBwYW5lbHMgYmVzaWRlIGBvcGVuUGFuZWxgCgpEZWNsYXJlIGB1aTpwYW5lbC5tb3VudGAgdG8gb2ZmZXIgYSBwYW5lbCBpbiBTdWJ3aW5kb3cgc2V0dXAgd2l0aCBgY3R4LnVpLnJlZ2lzdGVyUGFuZWxLaW5kKHNwZWMpYC4gSXRzIGBtb3VudGAgZnVuY3Rpb24gZHJhd3MgaW50byB0aGUgc2xvdCdzIHNoYWRvdyByb290LiBVc2UgdGhlIHJldHVybmVkIGZ1bmN0aW9uIGR1cmluZyBtb2QgY2xlYW51cCB0byB1bnJlZ2lzdGVyIHRoZSBraW5kLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRwXShNT0RfU0VBTVMubWQjNHAtY3R4dWlyZWdpc3RlcnBhbmVsa2luZC0tLWEtbW9kLXBhbmVsLWluLXRoZS10aWxlZC1sYXlvdXQpIGZvciB0aGUgaG9zdCBoYW5kbGUgYW5kIHNhdmVkIGxheW91dCBiZWhhdmlvci4KClRoZSBob3N0IGNhbiBmbG9hdCB0aGUgc2FtZSByZWdpc3RlcmVkIHBhbmVsIGluc2lkZSB0aGUgZ2FtZSB2aWV3cG9ydCBhbmQgcmVzdG9yZSBpdHMgbGFzdCBkb2NrZWQgb3IgZmxvYXRpbmcgcGxhY2Ugd2hlbiBpdCBpcyBzaG93biBhZ2Fpbi4gQSBtaXNzaW5nIG1vZCBsZWF2ZXMgYSBuYW1lZCBwbGFjZWhvbGRlciBpbiBlaXRoZXIgcGxhY2UuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHJdKE1PRF9TRUFNUy5tZCM0ci1mbG9hdGluZy1wYW5lbC1wb3NpdGlvbnMtYW5kLXJlY292ZXJ5KS4KCiMjIyBGaWx0ZXJpbmcgcGFuZWxzIHdpdGggdGhlIGNhbnZhcwoKRGVjbGFyZSBgZGlzcGxheTpmaWx0ZXJgIHRvIGNhbGwgYGN0eC5kaXNwbGF5LnNldFZpc3VhbEZpbHRlcihmaWx0ZXIsIHsgc2NvcGU6ICJnYW1lIiB9KWAuIFRoaXMgY292ZXJzIHRoZSB0ZXJtaW5hbCBjYW52YXMsIHRpbGVkIHN1YndpbmRvd3MsIGFuZCBtb2QgcGFuZWwgY29udGVudC4gT21pdCB0aGUgb3B0aW9ucyBmb3IgdGhlIHByZXZpb3VzIGNhbnZhcy1vbmx5IGJlaGF2aW9yLCBvciBwYXNzIGBudWxsYCB0byBjbGVhciB0aGUgZmlsdGVyLiBTdHJvbmcgZmlsdGVycyBjYW4gbWFrZSBwYW5lbCB0ZXh0IGZpZWxkcyBhbmQgdGhlaXIgY2FyZXQgaGFyZCB0byByZWFkLiBIb3N0IHJlY292ZXJ5IGNvbnRyb2xzIGFuZCBjYXBhYmlsaXR5IGNvbnNlbnQgcmVtYWluIGNsZWFyLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRuXShNT0RfU0VBTVMubWQjNG4tZmlsdGVyaW5nLXRoZS13aG9sZS1nYW1lLXZpZXdwb3J0KS4KCiMjIyBSZWFkaW5nIHRoZSBrbm93biBsZXZlbDogYGN0eC5rbm93bkxldmVsKClgCgpVc2UgYGN0eC5rbm93bkxldmVsKClgIHRvIGRyYXcgYSBtYXAgb3IgbWluaW1hcCBmcm9tIGV2ZXJ5IGdyaWQgdGhlIHBsYXllciBrbm93cy4gVGhlIGZyb3plbiByZXN1bHQgaGFzIGEgdG9rZW4sIGxldmVsIGlkLCBkaW1lbnNpb25zIGFuZCBjZWxscyB3aXRoIHJlbWVtYmVyZWQgdGVycmFpbiwgdHJhcHMgYW5kIG9iamVjdHMuIERlY2xhcmUgYHN0YXRlOm1hcC5yZWFkYDsgdGhlIGNhbGwgcmV0dXJucyBudWxsIHdpdGhvdXQgaXQuIFRoZSBzZXBhcmF0ZSBgYWN0dWFsYCBkYXRhIHJlcXVpcmVzIGBzdGF0ZTptYXAtYWN0dWFsLnJlYWRgIGJ5IG5hbWUsIGFsb25nc2lkZSBgc3RhdGU6bWFwLnJlYWRgOyB0aGUgYHN0YXRlOioucmVhZGAgd2lsZGNhcmQgZG9lcyBub3QgZ3JhbnQgaXQuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNGhdKE1PRF9TRUFNUy5tZCM0aC1jdHhrbm93bmxldmVsLS0tdGhlLXBsYXllcnMtd2hvbGUtcmVtZW1iZXJlZC1sZXZlbCkuCiMjIyBJbnNwZWN0aW5nIGl0ZW1zLCBtb25zdGVycywgc3BlbGxzLCBhbmQgYWltaW5nCgpgY3R4Lmluc3BlY3RgIHJlYWRzIGl0ZW0gaW5zcGVjdGlvbiwgbW9uc3RlciByZWNhbGwsIHNwZWxsIGRldGFpbHMsIGl0ZW0gcGlja2VyIGVsaWdpYmlsaXR5LCBwcm9qZWN0aW9uIHBhdGhzLCBhbmQgYmFsbCBhcmVhcyBmcm9tIHRoZSBnYW1lJ3Mgb3duIGhlbHBlcnMuIEVhY2ggcmVzdWx0IGlzIGZyb3plbiBhbmQgc3RhbXBlZCB3aXRoIHRoZSBjdXJyZW50IGlucHV0IHRva2VuLiBEZWNsYXJlIHRoZSBtYXRjaGluZyBgc3RhdGU6aW52ZW50b3J5LnJlYWRgLCBgc3RhdGU6bW9uc3RlcnMucmVhZGAsIGBzdGF0ZTpzcGVsbHMucmVhZGAsIG9yIGBzdGF0ZTptYXAucmVhZGAgY2FwYWJpbGl0eS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0a10oTU9EX1NFQU1TLm1kIzRrLWN0eGluc3BlY3QtLS1yZWFkLXRoZS1nYW1lcy1vd24taW5zcGVjdGlvbi1hbnN3ZXJzKS4KCmBpbnNwZWN0SXRlbWAgbm93IGFjY2VwdHMgc3RvcmUgc3RvY2sgcmVmZXJlbmNlcyBhbmQgcmV0dXJucyBzZXBhcmF0ZSBzZWN0aW9ucy4gYGJvb2tGb3JJdGVtYCBtYXBzIGEgY2FycmllZCBzcGVsbGJvb2sgdG8gaXRzIGNsYXNzIHNwZWxsczsgYGNvbXBhcmVMb2Fkb3V0U2xvdHNgIHJ1bnMgdGhlIGV4aXN0aW5nIGxvYWRvdXQgc2ltdWxhdGlvbiBmb3IgZWFjaCBjb21wYXRpYmxlIHNsb3QsIGluY2x1ZGluZyBhIHNlY29uZCByaW5nIHNsb3QuIEJsYXN0IHByZXZpZXdzIGluY2x1ZGUgcmFkaXVzIGFuZCBlbGVtZW50IG1ldGFkYXRhLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRrXShNT0RfU0VBTVMubWQjNGstY3R4aW5zcGVjdC0tLXJlYWQtdGhlLWdhbWVzLW93bi1pbnNwZWN0aW9uLWFuc3dlcnMpLgoKIyMjIEFjdGluZyBhdCBvbmUgaW5wdXQgd2FpdDogYGN0eC5pbnRlbnQuc3VibWl0KClgCgpEZWNsYXJlIGBpbnB1dDppbnRlbnRgIHRvIHJlY2VpdmUgYGN0eC5pbnRlbnRgLiBQYXNzIHRoZSBjdXJyZW50IGBjdHguc25hcHNob3QoKWAgdG9rZW4gd2l0aCBhIGNvbW1hbmQsIHRyYXZlbCBkZXN0aW5hdGlvbiBvciB0YXJnZXQuIFRoZSBob3N0IHJlamVjdHMgc3RhbGUgb3IgYmxvY2tlZCBhY3Rpb25zIHdpdGggYSByZWFzb247IGFjY2VwdGVkIGNvbW1hbmRzIHVzZSB0aGUgc2FtZSBidWZmZXIgYW5kIGdhbWUgbG9vcCBhcyBhIGtleXByZXNzLCB3aGlsZSB0YXJnZXQgc2V0dGVycyBjaGFuZ2Ugbm8gdHVybi4gRm9yIGEgY29tcG91bmQgYWN0aW9uLCBzZW5kIHRyYXZlbCwgd2FpdCBmb3IgdGhlIG5leHQgaW5wdXQgd2FpdCwgaW5zcGVjdCBhIG5ldyBzbmFwc2hvdCBhbmQgc2VuZCB0aGUgZm9sbG93LXVwIGNvbW1hbmQuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNGldKE1PRF9TRUFNUy5tZCM0aS1jdHhpbnRlbnRzdWJtaXQtLS1hY3QtYXQtdGhlLWN1cnJlbnQtaW5wdXQtd2FpdCkuCgpgY3R4LmludGVudC5jYXRhbG9ndWUoKWAgbGlzdHMgcmVnaXN0ZXJlZCBjb21tYW5kcyBhbmQgYXJndW1lbnQgc2hhcGVzLiBBIGBsb29rYCBjb21tYW5kIGNhbiBzdGFydCBhdCBhIGdyaWQ7IHRyYXZlbCBtb2RpZmllcnMgbWFwIEN0cmwgdG8gdGFyZ2V0aW5nIGFuZCBTaGlmdCBvbiBhbiBhZGphY2VudCBncmlkIHRvIHJ1bm5pbmcuIFRoZSBgc3RvcC1yZXN0aW5nYCwgYGlnbm9yZWAsIGB1bmlnbm9yZWAgYW5kIGBpdGVtLXJ1bGVgIGludGVudHMgdXNlIHRoZSBnYW1lJ3MgZXhpc3RpbmcgaGFuZGxlcnMuIFN0b3JlIGJ1eSBhbmQgc2VsbCBpbnRlbnRzIGFzayB0aGUgc3RvcmUncyBxdWFudGl0eSBhbmQgY29uZmlybWF0aW9uIHF1ZXN0aW9ucyBiZWZvcmUgdHJhZGluZy4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbnMgNGldKE1PRF9TRUFNUy5tZCM0aS1jdHhpbnRlbnRzdWJtaXQtLS1hY3QtYXQtdGhlLWN1cnJlbnQtaW5wdXQtd2FpdCkgYW5kIFs0c10oTU9EX1NFQU1TLm1kIzRzLWNvbW1hbmQtY2F0YWxvZ3VlLWFuZC1zdG9yZS1wYW5lbC1zdGF0dXMpLgoKVGhlIHNuYXBzaG90J3MgbW9uc3RlcnMgbWFyayB1bmlxdWVzIGFuZCBxdWVzdCBndWFyZGlhbnMsIGFuZCB0aGUgcGxheWVyIHZpZXcgYWRkcyB0aGUgbG93IGhpdCBwb2ludCB0aHJlc2hvbGQgYW5kIHRoZSByZWNhbGwgYW5kIGRlc2NlbnQgdGltZXJzLiBSZW1lbWJlcmVkIGZsb29yIG9iamVjdHMgY2FycnkgYSBnbG93IGNsYXNzLCBgY3R4Lmluc3BlY3QudGVycmFpbkNhdGFsb2d1ZSgpYCBsaXN0cyB0ZXJyYWluIHdpdGggaXRzIHN0YWlycyBhbmQgZmlyZSBmbGFncywgYW5kIHRoZSBib2x0IGFuZCBleHBsb3Npb24gZXZlbnRzIG5hbWUgdGhlaXIgZWxlbWVudC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0dF0oTU9EX1NFQU1TLm1kIzR0LXJlYWRzLWZvci12aXN1YWwtZWZmZWN0cykuCgpBIG1lbnUgbW9kIGNhbiByZWFkIHRoZSBjaGFyYWN0ZXIgc2hlZXQgYXMgZGF0YSB3aXRoIGBjdHguY2hhcmFjdGVyLnNoZWV0KClgLCByZW5hbWUgYW55IHNhdmVkIGNoYXJhY3RlciwgcmVhZCBhbmQgY2hhbmdlIHRoZSBnYW1lJ3Mgb3B0aW9ucyB3aXRoIGBjdHgub3B0aW9uc2AsIGFuZCBlZGl0IHRoZSBwbGF5ZXIncyBrZXltYXBzIHdpdGggYGN0eC5rZXliaW5kaW5nc2AuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHVdKE1PRF9TRUFNUy5tZCM0dS1jaGFyYWN0ZXItc2hlZXQtc2F2ZXMtb3B0aW9ucy1hbmQta2V5bWFwcykuCgpBIG1vZCBjYW4gZHJhdyBpdHMgb3duIGtub3dsZWRnZSBicm93c2VyIHdpdGggYGN0eC5rbm93bGVkZ2VgOiB0aGUgY2F0ZWdvcmllcywgdGhlaXIga25vd24gZW50cmllcywgYW5kIGVhY2ggZW50cnkncyByZWNhbGwgcGFnZS4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0dl0oTU9EX1NFQU1TLm1kIzR2LWtub3dsZWRnZS1icm93c2VyKS4KCkEgbW9kIGNhbiBkcmF3IGEgcnVuIGpvdXJuYWwgZnJvbSBgY3R4LmNoYXJhY3Rlci5oaXN0b3J5KClgIGFuZCBhIHBvc3QtbW9ydGVtIGZyb20gdGhlIHJlcG9ydCBgY3R4LmNoYXJhY3Rlci5vblJ1bkVuZGAgZGVsaXZlcnMuIFNlZSBbTU9EX1NFQU1TLm1kIHNlY3Rpb24gNHddKE1PRF9TRUFNUy5tZCM0dy1ydW4tam91cm5hbC1hbmQtZW5kLW9mLXJ1bi1yZXBvcnQpLgojIyMgQW5zd2VyaW5nIHRoZSBvcGVuIHByb21wdAoKV2l0aCBgc3RhdGU6aW50ZXJhY3Rpb24ucmVhZGAsIGBjdHguc25hcHNob3QoKS5wcm9tcHRgIGRlc2NyaWJlcyB0aGUgcXVlc3Rpb24gY3VycmVudGx5IGhvbGRpbmcgaW5wdXQuIEEgbW9kIHdpdGggYGlucHV0OnByb21wdC5yZXBseWAgYWxzbyByZWNlaXZlcyBgY3R4LnByb21wdC5yZXBseShwcm9tcHRJZCwgYW5zd2VyKWAsIHdoaWNoIHNlbmRzIGEgdHlwZWQgYW5zd2VyIHRocm91Z2ggdGhlIGdhbWUncyBleGlzdGluZyBoYW5kbGVyLiBJbnZhbGlkIG9yIHN0YWxlIHJlcGxpZXMgbGVhdmUgdGhlIHF1ZXN0aW9uIG9wZW4gYW5kIHJldHVybiBhIHJlYXNvbi4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0al0oTU9EX1NFQU1TLm1kIzRqLXR5cGVkLXByb21wdHMtYW5kLXJlcGxpZXMpIGZvciB0aGUga2luZHMgYW5kIGFuc3dlcnMuCgpTdG9yZSBxdWFudGl0eSBwcm9tcHRzIGluY2x1ZGUgdGhlIHVuaXQgcHJpY2UsIGN1cnJlbnQgdG90YWwgYW5kIGdvbGQuIFJlcGx5IHdpdGggYHsgYWN0aW9uOiAiY2FuY2VsIiB9YCB0byBjYW5jZWwgYSBxdWFudGl0eSBxdWVzdGlvbi4gVGhlIHJlc3QgcHJvbXB0IGhhcyBhIHN0YWJsZSB0YWcsIGFuZCBhIGAtbW9yZS1gIHBhdXNlIGFjY2VwdHMgYHsgYWN0aW9uOiAiYWNrbm93bGVkZ2UiIH1gLiBTZWUgW01PRF9TRUFNUy5tZCBzZWN0aW9uIDRqXShNT0RfU0VBTVMubWQjNGotdHlwZWQtcHJvbXB0cy1hbmQtcmVwbGllcykuCgojIyMgRW5naW5lLXdpZGUgc2V0dGluZ3MgeW91IGNoYW5nZSB0aHJvdWdoIGBjdHguY29yZWAsIG5vdCB0aHJvdWdoIGEgaG9vawoKQSBmZXcgZW5naW5lIGRlY2lzaW9ucyBhcmUgbm90IG1hZGUgaW5zaWRlIGEgdHVybiBhbmQgaGF2ZSBubyBnYW1lIHN0YXRlIHRvIGhhbmcgYSBob29rIG9uLiBUaG9zZSBhcmUgZXhwb3NlZCBhcyBhIG1vZHVsZS1sZXZlbCBwb2xpY3kgeW91IHNldCBvbmNlLCBmcm9tIGBob29rcyhjdHgpYCwgd2hpY2ggaXMgdGhlIGVhcmxpZXN0IHBvaW50IHlvdXIgY29kZSBydW5zOiBiZWZvcmUgYHN0YXJ0R2FtZWAsIGFuZCBiZWZvcmUgYm9vdCByZWFkcyBhbnl0aGluZy4KClRoZXJlIGlzIG9uZSBzbyBmYXI6Cgp8IENhbGwgfCBDaGFuZ2VzIHwgRmFpdGhmdWwgZGVmYXVsdCB8CnwtLS18LS0tfC0tLXwKfCBgY3R4LmNvcmUuc2V0UHJlZkVycm9yUG9saWN5KHBvbGljeSBcfCBudWxsKWAgfCBXaGF0IGEgcHJlZiBmaWxlIGRvZXMgd2l0aCBhIGxpbmUgaXQgY2Fubm90IHBhcnNlLiBgeyBjb250aW51ZUFmdGVyRXJyb3IsIHJlcG9ydExpbWl0IH1gLCB3aGV0aGVyIHRoZSByZXN0IG9mIHRoZSBmaWxlIGlzIHN0aWxsIGFwcGxpZWQsIGFuZCBob3cgbWFueSBlcnJvcnMgdGhlIHBsYXllciBpcyB0b2xkIGFib3V0LiB8IGBVUFNUUkVBTV9QUkVGX0VSUk9SX1BPTElDWWA6IHN0b3AgYXQgdGhlIGZpcnN0IGJhZCBsaW5lLCB3aGljaCBpcyB3aGF0IGBwcm9jZXNzX3ByZWZfZmlsZV9uYW1lZGAgZG9lcyBpbiA0LjIuNi4gfAoKYGBganMKaG9va3MoY3R4KSB7CiAgaWYgKGN0eC5mbGFnc1sibXltb2QuZm9yZ2l2aW5nUHJlZkZpbGVzIl0pIHsKICAgIGN0eC5jb3JlLnNldFByZWZFcnJvclBvbGljeSh7IGNvbnRpbnVlQWZ0ZXJFcnJvcjogdHJ1ZSwgcmVwb3J0TGltaXQ6IDIwIH0pOwogIH0KICByZXR1cm4ge307Cn0KYGBgCgpUaGUgc2FtZSBydWxlcyBhcHBseSBoZXJlIGFzIGluIHRoZSByZXN0IG9mIHRoZSBtb2Qgc3lzdGVtOgoKLSBMYXN0IGxvYWQgd2lucywgYW5kIHRoZXJlIGlzIG9ubHkgb25lIHdpbm5lci4gVGhlIGhvc3QgY2FsbHMgZWFjaCBlbmFibGVkIG1vZCdzIGBob29rc2AgaW4gbG9hZCBvcmRlciwgc28gdGhlIGxhc3QgbW9kIHRvIHNldCBhIHBvbGljeSBpcyB0aGUgb25lIHRoYXQgc3RhbmRzLCB3aGljaCBtYXRjaGVzIHdoYXQgdGhlIG1vZCBtYW5hZ2VyJ3Mgcm93IHRlbGxzIHRoZSBwbGF5ZXIgKCJNb3ZlIGxhdGVyIChsb2FkcyBsYXN0LCB3aW5zIGNvbmZsaWN0cykiKS4gVHdvIHBvbGljaWVzIGNhbm5vdCBiZSBtZXJnZWQgaW50byBhIHRoaXJkIHRoYXQgaXMgZWl0aGVyIG9mIHRoZW0sIHdoaWNoIGlzIHdoeSB0aGlzIGlzIG5vdCBhIGBNb2RIb29rc2AgbWVtYmVyLiBJZiB5b3VyIG1vZCBjYXJlcywgc2F5IHNvIGluIGl0cyBSRUFETUU7IGEgcGxheWVyIHdobyBpbnN0YWxscyB0d28gbW9kcyB3aXRoIG9waW5pb25zIGFib3V0IHRoZSBzYW1lIHBvbGljeSBnZXRzIHRoZSBsYXRlciBvbmUuCi0gT25seSBzZXQgaXQgd2hlbiB5b3VyIGZsYWcgaXMgb24uIFNldHRpbmcgdGhlIGZhaXRoZnVsIGRlZmF1bHQgZXhwbGljaXRseSBpcyBub3QgdGhlIHNhbWUgYXMgbGVhdmluZyBpdCBhbG9uZTogaXQgc3RpbGwgbWFrZXMgeW91ciBtb2QgdGhlIHdpbm5lciBhbmQgc3RpbGwgb3ZlcnJpZGVzIGEgbW9kIGxvYWRlZCBiZWZvcmUgeW91cnMuIElmIHRoZSBwbGF5ZXIgc3dpdGNoZWQgeW91ciBwYXRjaCBvZmYsIGRvIG5vdCBjYWxsIGl0IGF0IGFsbC4KLSBEaXNhYmxpbmcgeW91ciBtb2QgcmVtb3ZlcyB0aGUgcG9saWN5LiBBIG1vZHVsZS1sZXZlbCB2YWx1ZSBjb3VsZCBvdXRsaXZlIGEgbW9kIGJlaW5nIGRpc2FibGVkLCBidXQgZGlzYWJsaW5nIG5ldmVyIHRha2VzIGVmZmVjdCBpbnNpZGUgb25lIHByb2Nlc3M6IHRoZSBtYW5hZ2VyIHByb21wdHMgdG8gc2F2ZSBhbmQgcmVsb2FkcywgYW5kIGFmdGVyIHRoZSByZWxvYWQgeW91ciBgaG9va3NgIGlzIG5vdCBjYWxsZWQsIHNvIG5vdGhpbmcgaW5zdGFsbHMgYSBwb2xpY3kgYW5kIHRoZSBlbmdpbmUgaXMgYmFjayBvbiBpdHMgZmFpdGhmdWwgZGVmYXVsdC4gYHNldFByZWZFcnJvclBvbGljeShudWxsKWAgZG9lcyB0aGUgc2FtZSByZXNldCBmb3IgYSB0ZXN0LgoKR3VhcmQgdGhlIGNhbGwgaWYgeW91ciBgZW5naW5lYCByYW5nZSBhbGxvd3MgYSB2ZXJzaW9uIHRoYXQgcHJlZGF0ZXMgdGhlIHNlYW06IGB0eXBlb2YgY3R4LmNvcmUuc2V0UHJlZkVycm9yUG9saWN5ID09PSAiZnVuY3Rpb24iYC4gVGhlIHJhbmdlIGlzIHRoZSByZWFsIGdhdGUgYW5kIHRoZSBjaGVjayBpcyBhIGJhY2t1cC4gV3JpdGUgYSBgY3R4LmxvZ2AgbGluZSB3aGVuIHRoZSBjaGVjayBmYWlscywgc28geW91ciBtb2QgaXMgbm90IHNpbGVudGx5IGluZXJ0LgoKIyMjIGBwcmVmc2A6IHRoZSBwbGFjZSBmb3IgZGF0YSB0aGF0IG91dGxpdmVzIGEgY2hhcmFjdGVyCgpZb3VyIG1vZCBoYXMgdHdvIHBsYWNlcyB0byBwdXQgZGF0YSBhbmQgdGhleSBhcmUgbm90IGludGVyY2hhbmdlYWJsZS4KCnwgfCBsaXZlcyBpbiB8IGRpZXMgd2hlbiB8IGZvciB8CnwtLS18LS0tfC0tLXwtLS18CnwgeW91ciBzYXZlIGJhZyAodGhyb3VnaCBgbWlncmF0ZUJhZ2ApIHwgdGhlIGNoYXJhY3RlcidzIHNhdmUgZmlsZSB8IHRoYXQgY2hhcmFjdGVyIGRvZXMgfCB3aGF0IGhhcHBlbmVkIHRvIHRoaXMgY2hhcmFjdGVyIHwKfCBgY3R4LnByZWZzYCB8IHRoZSBwbGF5ZXIncyBpbnN0YWxsIHwgbmV2ZXIsIHVudGlsIHlvdSBjbGVhciBpdCB8IHdoYXQgdGhpcyBwbGF5ZXIgbGlrZXMgfAoKYHByZWZzYCBpcyBvbmUgSlNPTiB2YWx1ZSwgcmVwbGFjZWQgd2hvbGUsIHNjb3BlZCB0byB5b3VyIG1vZCdzIGlkIGJ5IHRoZSBob3N0Ogp5b3UgY2Fubm90IHJlYWQgYW5vdGhlciBtb2QncywgYW5kIHBhc3NpbmcgYSBkaWZmZXJlbnQgaWQgaXMgbm90IGEgdGhpbmcgeW91IGNhbgpkby4gU2V0dGluZyBgbnVsbGAgZm9yZ2V0cyBpdC4gRXZlcnkgZmFpbHVyZSBpcyBzd2FsbG93ZWQgYW5kIGxvZ2dlZCByYXRoZXIgdGhhbgp0aHJvd24gYXQgeW91OiBhIGZ1bGwgZGlzayBtdXN0IG5vdCB0YWtlIHlvdXIgbW9kIGRvd24gZnJvbSBpbnNpZGUgYSBob29rLgoKV2hlcmUgdGhlcmUgaXMgbm8gc3RvcmFnZSBhdCBhbGwsIGBwcmVmc2Agc3RpbGwgZXhpc3RzIGFuZCBzaW1wbHkgbmV2ZXIKcmVtZW1iZXJzLCBzbyBhIG1vZCB3cml0dGVuIGFnYWluc3QgaXQgcnVucyBvbiBhIGZyb250IGVuZCB0aGF0IGhhcyBub25lLgoKUmVhY2ggZm9yIGBsb2NhbFN0b3JhZ2VgIHlvdXJzZWxmIGFuZCB5b3UgaGF2ZSBoYXJkLWNvZGVkIGEgYnJvd3NlciBpbnRvIGEgbW9kCnRoYXQgd291bGQgb3RoZXJ3aXNlIHJ1biBhbnl3aGVyZSB0aGUgZ2FtZSBkb2VzLgoKIyMgU2V2ZXJhbCBzY3JpcHRzCgpTcGxpdCB5b3VyIHBsdWdpbiB1cCBob3dldmVyIHlvdSBsaWtlIGFuZCBpbXBvcnQgdGhlIHBpZWNlcyByZWxhdGl2ZWx5OgoKYGBganMKLy8gcGx1Z2luLmpzCmltcG9ydCB7IHJvbGwgfSBmcm9tICIuL2xpYi9kaWNlLmpzIjsKaW1wb3J0IHsgZGVzY3JpYmUgfSBmcm9tICIuL2xpYi9mb3JtYXQuanMiOwpgYGAKClR3byBydWxlcywgYm90aCBvZiB0aGVtIHRoaW5ncyBhIGJyb3dzZXIgY2Fubm90IGRvIHJhdGhlciB0aGFuIGNob2ljZXM6CgotICoqUHV0IHRoZSBleHRlbnNpb24gb24uKiogYCIuL2xpYi9kaWNlLmpzImAsIG5vdCBgIi4vbGliL2RpY2UiYC4gRXh0ZW5zaW9ubGVzcwogIHJlc29sdXRpb24gaXMgYSBOb2RlIGFuZCBidW5kbGVyIGNvbnZlbmllbmNlOyBubyBicm93c2VyIGhhcyBldmVyIGRvbmUgaXQuCi0gKipObyBjeWNsZXMuKiogVHdvIGZpbGVzIHRoYXQgaW1wb3J0IGVhY2ggb3RoZXIgY2Fubm90IGJvdGggYmUgbG9hZGVkIGZyb20gYQogIGJyb3dzZXIgZm9sZGVyOiBhIGZpbGUncyBhZGRyZXNzIHRoZXJlIG9ubHkgZXhpc3RzIG9uY2UgaXRzIHRleHQgaXMgZmluYWwsIGFuZCBhCiAgY3ljbGUgbmVlZHMgYm90aCBhZGRyZXNzZXMgYXQgb25jZS4gTW92ZSB0aGUgc2hhcmVkIHBhcnQgaW50byBhIHRoaXJkIGZpbGUuCgpBbnl0aGluZyBlbHNlIHdvcmtzLCBpbiBhcyBtYW55IHN1YmRpcmVjdG9yaWVzIGFzIHlvdSB3YW50LiBJZiBhIHNjcmlwdCBpcyBtaXNzaW5nCm9yIHR3byBpbXBvcnQgZWFjaCBvdGhlciwgdGhlIG1vZCBtYW5hZ2VyIG5hbWVzICp0aG9zZSogZmlsZXMsIG5vdCB5b3VyIGVudHJ5CnBvaW50LgoKIyMgSW1hZ2VzLCBzb3VuZHMsIGFuZCB5b3VyIG93biBkYXRhCgpBc2sgZm9yIGEgVVJMOyBkbyBub3QgYnVpbGQgYSBwYXRoLgoKYGBganMKcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgY3R4LmFzc2V0VXJsKCJ0aWxlcy9vcmMucG5nIikudGhlbigodXJsKSA9PiB7CiAgICBpZiAodXJsKSB7IC8qIGFuIDxpbWc+LCBhIGNhbnZhcyBkcmF3LCBhIHRleHR1cmUgKi8gfQogIH0pOwp9CgovLyBkYXRhIHRvbyAtIHlvdXIgb3duIEpTT04sIG5vdCBhIHJlY29yZCBjb250cmlidXRpb24KY29uc3Qgc3Bhd25zID0gYXdhaXQgZmV0Y2goYXdhaXQgY3R4LmFzc2V0VXJsKCJkYXRhL3NwYXducy5qc29uIikpLnRoZW4oKHIpID0+IHIuanNvbigpKTsKYGBgCgpPbiBkZXNrdG9wIHRoYXQgVVJMIGlzIGFuIGBodHRwOmAgb25lIHVuZGVyIHRoZSBzaGVsbCdzIG93biBzZXJ2ZXI7IGluIGEgYnJvd3Nlcgp0YWIgaXQgaXMgYSBgYmxvYjpgLiBBIG1vZCB0aGF0IGhhcmQtY29kZXMgZWl0aGVyIGlzIGEgbW9kIHRoYXQgcnVucyBvbiBvbmUgb2YgdGhlCnR3byBmcm9udCBlbmRzLiBUaGUgVVJMIGxhc3RzIGZvciB0aGUgc2Vzc2lvbiwgYW5kIGFza2luZyB0d2ljZSBnaXZlcyB5b3UgdGhlIHNhbWUKb25lLgoKYGN0eC5hc3NldFVybGAgb25seSBldmVyIHJlYWNoZXMgKip5b3VyIG93bioqIGZvbGRlcjogdGhlIGlkIGlzIGZpeGVkIGJ5IHRoZSBob3N0LAphbmQgYSBwYXRoIHRoYXQgY2xpbWJzIG91dCBvZiBpdCBpcyByZWZ1c2VkLgoKIyMgQmFyZSBzcGVjaWZpZXJzIHN0aWxsIGRvIG5vdCB3b3JrCgpgaW1wb3J0IHsgdHVubmVsQXV4IH0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtY29yZSJgIGNhbm5vdCByZXNvbHZlIGZyb20gYSBmb2xkZXIsIGFuZCB5b3UgZG8gbm90IG5lZWQgaXQ6IHRoZSBlbmdpbmUgaXMgYWxyZWFkeSBsaXZlIGFzIGBjdHguY29yZWAuIEl0IGlzIHRoZSBvbmUgaW1wb3J0IGEgZm9sZGVyIHBsdWdpbiBjYW5ub3QgaGF2ZSwgYW5kIHdoZW4gYSBwbHVnaW4gdHJpZXMgaXQsIHRoZSBtb2QgbWFuYWdlciBleHBsYWlucyB0aGlzIGluc3RlYWQgb2Ygc2hvd2luZyB0aGUgYnJvd3NlcidzIG93biBlcnJvci4KCiMjIFZlcnNpb24gY29udHJhY3QKCmBtb2RBcGlgIGlzIGFuIGludGVnZXIsIGFuZCB0aGUgaG9zdCBhY2NlcHRzIGEgd2luZG93OiBldmVyeXRoaW5nIGZyb20gYE1PRF9BUElfTUlOYCB1cCB0byBgTU9EX0FQSV9WRVJTSU9OYCBpbmNsdXNpdmUgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1wbHVnaW4udHNgKS4gQSBwbHVnaW4gaW5zaWRlIHRoZSB3aW5kb3cgYnV0IGJlbG93IHRoZSBjdXJyZW50IHZlcnNpb24gbG9hZHMgYW5kIGlzIHJlcG9ydGVkIGFzIERFUFJFQ0FURUQsIHdoaWNoIGdpdmVzIGl0cyBhdXRob3IgYSByZWxlYXNlJ3Mgd2FybmluZyBiZWZvcmUgdGhlIG1pbmltdW0gbW92ZXMgcGFzdCBpdC4gVG9kYXkgYE1PRF9BUElfTUlOYCBhbmQgYE1PRF9BUElfVkVSU0lPTmAgYXJlIGJvdGggYDFgLCBzbyB0aGUgd2luZG93IGlzIG9uZSB2YWx1ZSB3aWRlIGFuZCBiZWhhdmVzIGxpa2UgYW4gZXhhY3QgbWF0Y2gsIGJ1dCB0aGUgY29kZSBjaGVja3MgYSB3aW5kb3csIGFuZCBgTU9EX0NPTVBBVElCSUxJVFkubWRgIGRvY3VtZW50cyB0aGUgdHdvLXJlbGVhc2UgcnVsZSBidWlsdCBvbiBpdC4KCk91dHNpZGUgdGhlIHdpbmRvdyB0aGUgcGx1Z2luIGRvZXMgbm90IGxvYWQsIGFuZCB0aGUgbW9kIG1hbmFnZXIgbmFtZXMgYm90aCBudW1iZXJzIGFuZCB3aGljaCBzaWRlIGlzIGJlaGluZDogYSB0b28tbmV3IG1vZCBuZWVkcyBhIG5ld2VyIGdhbWUsIGFuZCBhIHRvby1vbGQgb25lIG5lZWRzIGEgbW9kIHVwZGF0ZS4gQSBiYXJlICJpbmNvbXBhdGlibGUiIHdvdWxkIHNlbmQgdGhlIHBsYXllciB0byB0aGUgd3JvbmcgcGxhY2UuCgpJdCBpcyBkZWNsYXJlZCBpbiB0aGUgbWFuaWZlc3QsIG5vdCBvbmx5IGluc2lkZSBgcGx1Z2luLmpzYCwgc28gYW4gaW5jb21wYXRpYmxlIHBsdWdpbiBjYW4gYmUgcmVmdXNlZCBiZWZvcmUgaXQgaXMgaW1wb3J0ZWQuIEEgdmVyc2lvbiBjaGVjayBpbnNpZGUgdGhlIG1vZHVsZSBvbmx5IHJ1bnMgYWZ0ZXIgdGhlIG1vZHVsZSdzIHRvcC1sZXZlbCBjb2RlIGhhcyBhbHJlYWR5IGV4ZWN1dGVkLCB3aGljaCBpcyB0b28gbGF0ZSBmb3IgY29kZSBsb2FkZWQgZnJvbSBhIGZvbGRlciBhbnlvbmUgY2FuIHdyaXRlIGludG8uCgpBIHNjaGVtYSAyIG1hbmlmZXN0IHN0YXRlcyBgYXBpYCwgYSBzZW12ZXIgcmFuZ2UsIGluc3RlYWQgb2YgYG1vZEFwaWAuIFRoZSBnYW1lIHJ1bnMgYW4gYGluLXByb2Nlc3NgIG1vZCB3aGVuIHRoZSByYW5nZSBpbmNsdWRlcyBBUEkgMS4wLjAsIGFuZCBhIGB3b3JrZXJgIG1vZCB3aGVuIGl0IGluY2x1ZGVzIHRoZSBXb3JrZXIgcHJldmlldyBBUEksIGAyLjAuMC13b3JrZXJgLiBBIHJhbmdlIHRoYXQgaW5jbHVkZXMgbmVpdGhlciBpcyByZWZ1c2VkLCBhbmQgdGhlIE1vZHMgc2NyZWVuIG5hbWVzIHRoZSByYW5nZSBhbmQgdGhlIHJ1bnRpbWUuIEJlY2F1c2UgYDIuMC4wLXdvcmtlcmAgaXMgYSBwcmVyZWxlYXNlLCBhIHJhbmdlIG92ZXIgdGhlIHN0YWJsZSBBUEkgMiBzdWNoIGFzIGBeMi4wLjBgIGxlYXZlcyBpdCBvdXQsIHNvIGEgbW9kIHdyaXR0ZW4gZm9yIHRvZGF5J3MgV29ya2VyIEFCSSBpcyBuZXZlciB0YWtlbiBmb3IgYW4gQVBJIDIgbW9kLgoKIyMgV2hhdCBoYXMgdG8gYmUgdHJ1ZSBiZWZvcmUgeW91ciBjb2RlIHJ1bnMKCkluIG9yZGVyLCBhbmQgYWxsIG9mIGl0IGJlZm9yZSB0aGUgaW1wb3J0OgoKMS4gdGhlIGZvbGRlciBzaGlwcyBgcGx1Z2luLmpzYCAoZnJvbSB0aGUgZGlyZWN0b3J5IGxpc3RpbmcsIHdpdGggbm8gcHJvYmluZyk7CjIuIHRoZSBtb2QgaXMgKiplbmFibGVkKiosIHNpbmNlIGEgZGlzYWJsZWQgbW9kJ3MgY29kZSBkb2VzIG5vdCBleGlzdCwgdGhlIHNhbWUgcnVsZSBhcwogICBhIGRpc2FibGVkIG1vZCdzIHBhdGNoZXM7CjMuIHRoZSBtYW5pZmVzdCBkZWNsYXJlcyB0aGUgYHBsdWdpbmAgZmFjZXQgKHZpYSBgc2hhcGVgIG9yIGBmYWNldHNgKTsKNC4gYG1vZEFwaWAgbWF0Y2hlczsKNS4gdGhlIHBsYXllciBoYXMgKipjb25zZW50ZWQqKiB0byBldmVyeSBjYXBhYmlsaXR5IHRoZSBtYW5pZmVzdCByZXF1ZXN0cy4KClRoZW4gdGhlIG1vZHVsZSBpcyBpbXBvcnRlZCBhbmQgaXRzIGRlZmF1bHQgZXhwb3J0IGlzIHNoYXBlLWNoZWNrZWQuCgpOb3RoaW5nIGFib3V0IGEgYmFkIHBsdWdpbiBjYW4gc3RvcCB0aGUgZ2FtZSBib290aW5nLiBBIGhhbmQtZWRpdGVkIG1hbmlmZXN0LCBhCmhhbGYtZmluaXNoZWQgZG93bmxvYWQsIGEgcGx1Z2luIHRoYXQgdGhyb3dzIGF0IGltcG9ydCBvciBpbnNpZGUgYGhvb2tzKClgOiBlYWNoCmJlY29tZXMgb25lIGxpbmUgdGhlIG1vZCBtYW5hZ2VyIHNob3dzLCBhbmQgdGhlIG90aGVyIG1vZHMgY2Fycnkgb24uCgojIyMgTWVzc2FnZSB0eXBlcyBhcmUgZGVjbGFyZWQgYXMgREFUQSwgbm90IGluIGByZWdpc3RlcigpYAoKYHJlZ2lzdGVyKClgIHJ1bnMgYWZ0ZXIgdGhlIGdhbWUgaGFzIGJlZW4gYm91bmQgKDM4NCB0b3AtbGV2ZWwgc3RhdGVtZW50cyBhZnRlciksIHNvIGEgbWVzc2FnZSB0eXBlIGRlY2xhcmVkIHRoZXJlIGlzIGRlY2xhcmVkIGFmdGVyIGV2ZXJ5IHJlY29yZCB0aGF0IGNvdWxkIGhhdmUgbmFtZWQgaXQuIEEgY29udGVudC1vbmx5IHBhY2sgaGFzIG5vIGByZWdpc3RlcigpYCBhdCBhbGwsIHNvIHRoZSBwYWNrcyBtb3N0IGxpa2VseSB0byBuZWVkIGEgbWVzc2FnZSB0eXBlIGNvdWxkIG5vdCBkZWNsYXJlIG9uZSB0aGVyZSBhbnl3YXkuCgpTbyBpZiB5b3VyIHBhY2sncyBvd24gc3BlbGwsIGJsb3cgbWV0aG9kLCBzdW1tb24gb3IgcHJvamVjdGlvbiBjYXJyaWVzIGEgYG1zZ3Q6YCwgc2hpcCB0aGUgdHlwZSBhcyBhIGBtZXNzYWdlX3R5cGVgIHJlY29yZCBmaWxlIGluc3RlYWQ6CgpgYGBqc29uCnsgInJlY29yZHMiOiBbCiAgeyAibmFtZSI6ICJTT1VMRklSRSIsICJzb3VuZCI6ICJzb3VsZmlyZSIsICJzb3VuZHMiOiAic2Zfb25lIHNmX3R3byIgfQpdIH0KYGBgCgpgbmFtZWAgaXMgdGhlIGJhcmUgYE1TR19gIG5hbWUgYSBgbXNndDpgIHVzZXMsIGBzb3VuZGAgaXMgdGhlIGBzb3VuZC5wcmZgIGtleSB0aGUgdHlwZSBwbGF5cyB1bmRlciwgYW5kIGBzb3VuZHNgIGlzIHRoZSBzcGFjZS1zZXBhcmF0ZWQgc2FtcGxlIGxpc3QgYm91bmQgdG8gaXQuIFRoZSByZWNvcmQgY2FycmllcyBhbGwgdGhyZWUgc28gdGhhdCBhIHBhY2sgY2FuIGJpbmQgc2FtcGxlcyB0byB0aGUgdHlwZSBpdCBuYW1lcywgbm90IGp1c3QgbmFtZSBpdC4gTm8gY2FwYWJpbGl0eSBhbmQgbm8gYHBsdWdpbi5qc2AgYXJlIG5lZWRlZC4gSXQgaXMgYSByZWNvcmQgZmlsZSBsaWtlIGFueSBvdGhlciwgYW5kIGEgcGFjayBjYW4gYWxyZWFkeSBhZGQgYSBwcm9qZWN0aW9uLCBhIG1vbnN0ZXIsIGFuIGFydGlmYWN0IGFuZCBhbiBlZ28gaXRlbSB3aXRob3V0IGEgY2FwYWJpbGl0eSwgc28gZ2F0aW5nIHRoaXMgb25lIHJlY29yZCBmaWxlIHdvdWxkIHByb3RlY3Qgbm90aGluZy4KCkRlY2xhcmF0aW9ucyBhcmUgYWRkaXRpdmUsIGF0dHJpYnV0ZWQgdG8gdGhlIHBhY2sgdGhhdCBjb2luZWQgdGhlbSwgYW5kIGlkZW1wb3RlbnQgYWNyb3NzIHRoZSBuZXctZ2FtZSBhbmQgbG9hZCBwYXRocy4gVGhleSBuZXZlciB0aHJvdzogYSByZWZ1c2VkIGRlY2xhcmF0aW9uIGxvc2VzIHRoYXQgb25lIG1lc3NhZ2UgdHlwZSBhbmQgcmVwb3J0cyBpdCBpbnN0ZWFkIG9mIHN0b3BwaW5nIHRoZSBib290LgoKYGhvc3QubWVzc2FnZXMuZGVmaW5lKC4uLilgIHN0aWxsIGV4aXN0cyBhbmQgaXMgc3RpbGwgdGhlIHJpZ2h0IGNhbGwgZm9yIGEgdHlwZSBhIHBsdWdpbiBjb2lucyBhdCBydW50aW1lLCBmb3IgZXhhbXBsZSB0byByZS1wb2ludCBzb3VuZHMuIEl0IGlzIG9ubHkgdGhlIHdyb25nIHBsYWNlIGZvciBhIHR5cGUgeW91ciBvd24gcmVjb3JkcyBuYW1lLgoKIyMgRnJvbnQtZW5kIHJlcGxhY2VtZW50CgpgZnJvbnRlbmQoY3R4KWAgaXMgYW4gb3B0aW9uYWwgYHBsdWdpbi5qc2AgbWVtYmVyLiBJdCByZXR1cm5zIGEgc2luayBmb3IgdGhlCmxpdmUgbWFwIHN0cmVhbSAob3IgYHVuZGVmaW5lZGAgdG8gZGVjbGluZSk6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAxLAogIGZyb250ZW5kKGN0eCkgewogICAgcmV0dXJuIHsKICAgICAgcHJlc2VudChmcmFtZSkgewogICAgICAgIC8vIGZyYW1lLmNlbGxzOiBzZW1hbnRpYyB0ZXJyYWluL29jY3VwYW50IGxheWVycyBhbmQgdmlzaWJpbGl0eSwKICAgICAgICAvLyBub3QgdGVybWluYWwgY2hhcmFjdGVycyB0aGF0IG5lZWQgcmV2ZXJzZS1wYXJzaW5nLgogICAgICB9LAogICAgfTsKICB9LAp9OwpgYGAKCkEgY29tcGxldGUgd29ya2VkIGV4YW1wbGUgbGl2ZXMgaW4gYHNhbXBsZXMvYmx1ZXByaW50LXZpZXcvYCwgYSBmb2xkZXIgeW91IGNhbiBjb3B5IHN0cmFpZ2h0IGludG8gYSBtb2RzIGZvbGRlci4gSXQgZHJhd3MgYSBibHVlcHJpbnQgb2YgdGhlIGR1bmdlb24gZnJvbSB0aGUgZnJhbWUncyBzZW1hbnRpYyBsYXllcnMuIGBwYWNrYWdlcy93ZWIvc3JjL3NhbXBsZS1ibHVlcHJpbnQubm9kZS50ZXN0LnRzYCBsb2FkcyB0aGF0IGZvbGRlciBieSBwYXRoIGFuZCByZWNvcmRzIHdoYXQgaXQgZHJhd3MsIHNvIHRoZSBzYW1wbGUgaXMgdGVzdGVkIGNvZGUuIEl0IGhhcyBhbHNvIGJlZW4gcnVuIGluIHRoZSBpbnN0YWxsZWQgZGVza3RvcCBidWlsZCwgd2hpY2ggaXMgd2hlcmUgdGhlIG1pc3Npbmcgdmlld3BvcnQgZ2VvbWV0cnkgc2hvd2VkIHVwIGFzIGEgcmVhbCBwcm9ibGVtOyBzZWUgW1doZXJlIHlvdSBtYXkgZHJhd10oI3doZXJlLXlvdS1tYXktZHJhdy1mcmFtZXJlZ2lvbnMpIGJlbG93IGZvciB3aGF0IGl0IHJlYWRzIG5vdy4KClRoZSBtYW5pZmVzdCBtdXN0IHJlcXVlc3QgYGRpc3BsYXk6cmVwbGFjZWAsIGFuZCB0aGUgcGxheWVyIG11c3QgYXBwcm92ZSBpdDoKCmBgYGpzb24KeyAic2hhcGUiOiAicGx1Z2luIiwgImNhcGFiaWxpdGllcyI6IFsiZGlzcGxheTpyZXBsYWNlIl0gfQpgYGAKCkRlY2xhcmluZyBgZnJvbnRlbmRgIHdpdGhvdXQgaXQgaXMgcmVwb3J0ZWQgYnkgbmFtZSwgYW5kIHRoZSBnYW1lIGtlZXBzIGRyYXdpbmcuIEl0IGlzIG5vdCBhIGByZWdpc3RyeTpgIGRvbWFpbiwgYW5kIGByZWdpc3RyeToqYCBkb2VzIG5vdCBjb3ZlciBpdDogYW4gb3ZlcnJpZGUgZ3JhbnQgY2hhbmdlcyBvbmUgbmFtZWQgZ2FtZSBzeXN0ZW0gYW1vbmcgbWFueSwgd2hpbGUgdGhpcyBvbmUgbWVhbnMgZXZlcnl0aGluZyB0aGUgcGxheWVyIHNlZXMgb2YgdGhlIGR1bmdlb24gY29tZXMgZnJvbSB0aGUgbW9kLiBgY29udHJvbGxlcmAgcmVxdWlyZXMgYGNvbW1hbmQ6YWRkYCBmb3IgdGhlIHNhbWUgcmVhc29uLgoKRm9yIFR5cGVTY3JpcHQsIGltcG9ydCB0aGUgcHVibGljIGRhdGEgY29udHJhY3QgdHlwZS1vbmx5IGZyb20gdGhlIFNESzogYGltcG9ydCB0eXBlIHsgV29ybGRGcmFtZSwgV29ybGRGcmFtZVNpbmsgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrImAuIFRoZSBidWlsZCBlcmFzZXMgdGhhdCBpbXBvcnQsIHNvIGEgZm9sZGVyIHBsdWdpbiBzdGlsbCBoYXMgbm8gYmFyZSBydW50aW1lIGRlcGVuZGVuY3kuIFRoZXJlIGlzIG9uZSBzbG90LCBhbmQgdGhlIGxhc3QgZWxpZ2libGUgbW9kIGluIGxvYWQgb3JkZXIgd2luczsgZWFybGllciBmcm9udGVuZCBmYWN0b3JpZXMgYXJlIG5vdCBjYWxsZWQuIFRoZSBob3N0IGhhbmRzIHRoZSB3aW5uZXIgYSBmcm96ZW4sIHN0cnVjdHVyYWxseSBvd25lZCBzbmFwc2hvdCBwZXIgcmVhbCBtYXAgcmVwYWludC4gWW91IGNhbiBrZWVwIGl0IGZvciBhbiBhbmltYXRpb24gZnJhbWUsIGJ1dCBpdCBjYW5ub3QgZXhwb3NlIG9yIG11dGF0ZSB0aGUgbGl2ZSBwbGF5ZXItZ3JpZCBvYmplY3QuIEEgZnJvbnRlbmQgdGhhdCB0aHJvd3MgbG9zZXMgdGhhdCBkaXNwbGF5IGF0dGVtcHQsIGFuZCB0aGUgZ2FtZSdzIG93biByZW5kZXJlciB0YWtlcyBvdmVyIGFnYWluLgoKVGhlIGdhbWUncyBvd24gcmVuZGVyZXIgaXMgY2FuZGlkYXRlIHplcm8gaW4gdGhlIHNhbWUgbGlzdC4gSXQgZGVjbGFyZXMgYGZyb250ZW5kYCBhbmQgYGRpc3BsYXk6cmVwbGFjZWAgdGhlIHNhbWUgd2F5IGEgbW9kIGRvZXMsIGFuZCBpdCB3aW5zIHdoZW5ldmVyIG5vIG1vZCBvdXRyYW5rcyBpdDsgdGhlIHNlbGVjdGlvbiBuZXZlciBmYWxscyB0aHJvdWdoIHRvIGl0IGFzIGEgZmFsbGJhY2suIFNvIHRoZSBzZWFtIGlzIHByb3ZlbiBhZ2FpbnN0IGEgcmVhbCBmcm9udCBlbmQ6IHRoZSBvbmUgdGhlIGdhbWUgc2hpcHMgaXMgYnVpbHQgdGhyb3VnaCBpdC4KClRoaXMgcmVwbGFjZXMgdGhlIG1hcCBkaXNwbGF5IG9ubHkuIE1lbnVzIHN0aWxsIHVzZSBgcmVnaXN0cnk6bWVudWAsIGFuZCBpbnB1dCBzdGlsbCBlbnRlcnMgdGhyb3VnaCB0aGUgaG9zdCdzIGRldmljZS1uZXV0cmFsIGlucHV0IGRvb3I7IGdhbWVwYWQgYmluZGluZ3MgYW5kIHdob2xlLXNjcmVlbiBvd25lcnNoaXAgYXJlIGxhdGVyIHNlYW1zLgoKIyMjIFdoZXJlIHlvdSBtYXkgZHJhdzogYGZyYW1lLnJlZ2lvbnNgCgpFdmVyeSBmcmFtZSBjYXJyaWVzIHRoZSBuYW1lZCBwYXJ0cyBvZiB0aGUgc2NyZWVuLCBzbyBhIGZyb250IGVuZCBubyBsb25nZXIgaGFzCnRvIGd1ZXNzIHdoZXJlIHRoZSBtYXAgaXM6CgpgYGBqcwpwcmVzZW50KGZyYW1lKSB7CiAgY29uc3QgYm94ID0gZnJhbWUucmVnaW9ucz8ubWFwPy5waXhlbHM7CiAgaWYgKCFib3gpIHJldHVybjsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGdlb21ldHJ5OiBkcmF3IE5PVEhJTkcKICBjYW52YXMuc3R5bGUubGVmdCA9IGAke2JveC54fXB4YDsKICBjYW52YXMuc3R5bGUudG9wID0gYCR7Ym94Lnl9cHhgOwogIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke2JveC53aWR0aH1weGA7CiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2JveC5oZWlnaHR9cHhgOwogIC8vIC4uLgp9CmBgYAoKYHJlZ2lvbnNgIGhhcyBgbWFwYCwgYW5kLCBkZXBlbmRpbmcgb24gdGhlIHBsYXllcidzIHNpZGViYXIgbW9kZSwgYG1lc3NhZ2VzYCwKYHNpZGViYXJgIGFuZCBgc3RhdHVzYC4gRWFjaCBjYXJyaWVzIGBjZWxsc2AgKGEgcmVjdGFuZ2xlIG9mIHRoZSBjaGFyYWN0ZXIgZ3JpZCkKYW5kIGBwaXhlbHNgIChDU1MgcGl4ZWxzIGluIHRoZSBnYW1lIHdpbmRvdydzIGNvb3JkaW5hdGUgc3BhY2UsIHRoZSBzcGFjZQpgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClgIGFuc3dlcnMgaW4pLiBgbWFwYCBpcyB5b3VycyB3aGlsZSB5b3UgaG9sZCB0aGUKZGlzcGxheTsgdGhlIG90aGVycyBhcmUgY29yZSdzIGFuZCBhcmUgcHVibGlzaGVkIHNvIHlvdSBjYW4gc3RheSBvZmYgdGhlbSwgb3IKY292ZXIgdGhlbSBrbm93aW5nIHdoYXQgeW91IGFyZSBjb3ZlcmluZy4KClRocmVlIHRoaW5ncyB3b3J0aCBrbm93aW5nOgoKLSAqKlRoZSBuYW1lcyBhcmUgcm9sZXMsIG5vdCBwbGFjZXMuKiogYHNpZGViYXJgIGlzIHRoZSAxMy1jb2x1bW4gbGVmdCBjb2x1bW4gaW4KICB0aGUgY2xhc3NpYyBsYXlvdXQgYW5kIGEgb25lLWxpbmUgaGVhZGVyIHVuZGVyIHRoZSBtZXNzYWdlcyBpbiB0aGUgY29tcGFjdAogIG9uZSwgYW5kIGl0IGlzICoqYWJzZW50Kiogd2hlbiB0aGUgcGxheWVyIGhhcyB0dXJuZWQgdGhlIHZpdGFscyBvZmYuIFJlYWQgaXQKICBldmVyeSBmcmFtZSByYXRoZXIgdGhhbiBjYWNoaW5nIGl0OiBpdCBtb3ZlcyBvbiBhIHJlc2l6ZSwgb24gYSBzaWRlYmFyLW1vZGUKICBjaGFuZ2UsIGFuZCB3aGVuIGEgbmFycm93IHdpbmRvdyBmb3JjZXMgdGhlIGNvbXBhY3QgbGF5b3V0LgotICoqYHJlZ2lvbnNgIGlzIG9wdGlvbmFsLioqIEEgaG9zdCB3aXRoIG5vIGZpdHRlZCBzdXJmYWNlIGhhcyBub25lIHRvIGdpdmUuCiAgVHJlYXQgdGhhdCBhcyAiZHJhdyBub3RoaW5nIiwgbm90IGFzICJmYWxsIGJhY2sgdG8gdGhlIHdpbmRvdyI6IGZhbGxpbmcgYmFjawogIHJlaW50cm9kdWNlcyB0aGUgZGVmZWN0IGJlbG93LCBpbnRlcm1pdHRlbnRseS4KLSAqKlRoZSBtYXAgaXMgb25lIGNvbHVtbiBuYXJyb3dlciB0aGFuIHRoZSBzY3JlZW4uKiogVGhhdCBpcyB1cHN0cmVhbSdzIG93bgogIHJ1bGUgKGBTQ1JFRU5fV0lEYCByZXNlcnZlcyB0aGUgcmlnaHRtb3N0IGNvbHVtbiksIG5vdCBhIHJvdW5kaW5nIGVycm9yLgoKVGhlIGZvdXIgcmVnaW9ucyBjdXJyZW50bHkgdGlsZSB0aGUgc2NyZWVuIHdpdGhvdXQgb3ZlcmxhcHBpbmcsIGFuZCB0aGUgc2V0IGlzIGNsb3NlZC4gTmVpdGhlciB3aWxsIHN0YXkgdHJ1ZS4gVGhlIFVJIHNlYW0gKGBNT0RfUkVBQ0gubWRgIGdhcCAyMSkgbWFrZXMgYSBmdWxsIHNjcmVlbiBjb21wb3NlZCBvZiByZWdpb25zIGluc3RlYWQgb2YgY292ZXJpbmcgdGhlbSwgc28gcmVnaW9ucyB3aWxsIG92ZXJsYXAsIGdhaW4gYSBzdGFja2luZyBvcmRlciwgYW5kIGJlIGNyZWF0YWJsZSBieSBhIG1vZDsgdGhlIHB1cnBvc2UgaXMgYSBmbG9hdGluZyB3aW5kb3cgb3ZlciBhIG1hcCB0aGF0IGlzIHN0aWxsIGJlaW5nIGRyYXduLiBOb3RoaW5nIGluIHRoZSBjb2RlIGFib3ZlIGNoYW5nZXMgd2hlbiB0aGF0IGxhbmRzLCBidXQgY29kZSB0aGF0IGluZmVycyBkaXNqb2ludG5lc3MgYnJlYWtzLiBSZWFkIGByZWdpb25zLm1hcGAgYW5kIGRyYXcgaW4gaXQ7IGRvIG5vdCBjb21wdXRlIHlvdXIgcmVjdGFuZ2xlIGJ5IHN1YnRyYWN0aW5nIHRoZSBvdGhlcnMuCgpDb3ZlcmluZyB0aGUgd2luZG93IGNvc3RzIHRoZSBwbGF5ZXIgZXZlcnl0aGluZyBlbHNlIG9uIGl0LiBCZWZvcmUgcmVnaW9ucyBleGlzdGVkLCBydW5uaW5nIHRoZSBzYW1wbGUgaW4gdGhlIGluc3RhbGxlZCBidWlsZCBzaG93ZWQgdGhlIHByb2JsZW06IGBkaXNwbGF5OnJlcGxhY2VgIHJlcGxhY2VzIHRoZSBtYXAgb25seSwgc28gY29yZSBzdG9wcyBkcmF3aW5nIHRoZSBkdW5nZW9uIGJ1dCBnb2VzIG9uIGRyYXdpbmcgdGhlIHNpZGViYXIsIHRoZSBtZXNzYWdlIGxpbmUgYW5kIGV2ZXJ5IG1lbnUuIEEgZnJvbnQgZW5kIHRoYXQgY292ZXJlZCB0aGUgd2luZG93IHBhaW50ZWQgb3ZlciBhbGwgb2YgdGhhdCwgc28gdGhlIHBsYXllciBjb3VsZCBub3QgcmVhZCB0aGVpciBoaXQgcG9pbnRzLCBzZWUgYSBtZXNzYWdlLCBvciBvcGVuIHRoZSBNb2RzIHNjcmVlbiB0byB0dXJuIHRoZSBtb2Qgb2ZmLCBhbmQgaGFkIHRvIGVkaXQgdGhlIGVuYWJsZWQgc2V0IGJ5IGhhbmQuCgpBIGZyb250IGVuZCBtYXkgc3RpbGwgdGFrZSB0aGUgd2hvbGUgd2luZG93LCBhbmQgYW4gaXNvbWV0cmljIG9yIDNEIHZpZXcgbWF5IHdhbnQgdG8uIFdpdGggcmVnaW9ucywgdGhhdCBpcyBhIGNob2ljZSBtYWRlIGtub3dpbmcgd2hhdCBnZXRzIGNvdmVyZWQsIGluc3RlYWQgb2YgdGhlIG9ubHkgb3B0aW9uIGEgbW9kIGhhZC4KCiMjIyBLbm93aW5nIHdoZW4geW91IGFyZSBjb3ZlcmVkOiBgZnJhbWUuc3RhY2tgCgpgZnJhbWUucmVnaW9uc2Agc2F5cyB3aGVyZSB0aGUgbWFwIGlzLiBgZnJhbWUuc3RhY2tgIHNheXMgd2hhdCBpcyBvbiB0b3Agb2YgaXQ6CmV2ZXJ5IHJlZ2lvbiBvbiBzY3JlZW4sIGJvdHRvbSB0byB0b3AsIGJlZ2lubmluZyB3aXRoIHRoZSBmb3VyIGJhc2UgdGlsZXMKYHJlZ2lvbnNgIG5hbWVzLiBBIHJlZ2lvbiBsYXRlciBpbiB0aGUgYXJyYXkgaXMgZHJhd24gb3ZlciBvbmUgZWFybGllciBpbiBpdC4KRmluZCB0aGUgZW50cnkgd2hvc2UgYGlkYCBpcyBgIm1hcCJgOyBpZiBhbnkgZW50cnkgYWZ0ZXIgaXQgb3ZlcmxhcHMgaXRzIGBjZWxsc2AsCmhpZGUgeW91ciBkaXNwbGF5LgoKYGBganMKZnVuY3Rpb24gY292ZXJlZFVwKGZyYW1lKSB7CiAgY29uc3Qgc3RhY2sgPSBmcmFtZS5zdGFjazsKICBpZiAoIXN0YWNrKSByZXR1cm4gZmFsc2U7ICAgICAgICAgICAgICAgICAgLy8gdGhpcyBob3N0IHB1Ymxpc2hlcyBub25lCiAgY29uc3QgYXQgPSBzdGFjay5maW5kSW5kZXgoKHIpID0+IHIuaWQgPT09ICJtYXAiKTsKICBpZiAoYXQgPCAwKSByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgLy8gYSBzdGFjayB0aGF0IHN0b3BwZWQgbmFtaW5nIHRoZSBtYXAKICBjb25zdCBtYXAgPSBzdGFja1thdF0uY2VsbHM7CiAgcmV0dXJuIHN0YWNrLnNsaWNlKGF0ICsgMSkuc29tZSgocikgPT4KICAgIHIuY2VsbHMuY29sIDwgbWFwLmNvbCArIG1hcC5jb2xzICYmIG1hcC5jb2wgPCByLmNlbGxzLmNvbCArIHIuY2VsbHMuY29scyAmJgogICAgci5jZWxscy5yb3cgPCBtYXAucm93ICsgbWFwLnJvd3MgJiYgbWFwLnJvdyA8IHIuY2VsbHMucm93ICsgci5jZWxscy5yb3dzKTsKfQpgYGAKCmBzYW1wbGVzL2JsdWVwcmludC12aWV3L3BsdWdpbi5qc2Agc2hpcHMgdGhpcyBmdW5jdGlvbi4gVGhlIGdhbWUncyBvd24gdmVyc2lvbiBpcyBgb2NjbHVkZXJzT2ZgIGluIGBwYWNrYWdlcy93ZWIvc3JjL3JlZ2lvbnMudHNgLCB3aXRoIGByZWdpb25zSW50ZXJzZWN0YCAodGhlIGZvdXIgY29tcGFyaXNvbnMgYWJvdmUpIGJlc2lkZSBpdC4gTmVpdGhlciBpcyByZWFjaGFibGUgZnJvbSBhIG1vZCwgYmVjYXVzZSBvZiBob3cgbW9kcyBhcmUgbG9hZGVkOiBhIG1vZHVsZSBmZXRjaGVkIGZyb20gYSBtb2QgZm9sZGVyIGNhbm5vdCByZXNvbHZlIGEgcGFja2FnZSBieSBuYW1lLCBzbyBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCBtYXJrcyBldmVyeSBiYXJlIHNwZWNpZmllciBleHRlcm5hbCBhbmQgZmFpbHMgdGhlIGJ1aWxkIGlmIGFueSBzdXJ2aXZlLiBUeXBlcyBjcm9zcyB0aGF0IGxpbmUgYmVjYXVzZSB0aGUgYnVpbGQgZXJhc2VzIHRoZW07IGZ1bmN0aW9ucyBkbyBub3QuIFB1Ymxpc2hpbmcgdGhlc2UgdHdvIHRocm91Z2ggdGhlIFNESyB3b3VsZCBwdWJsaXNoIG1lbWJlcnMgbm8gbW9kIGNvdWxkIGltcG9ydCwgc28gd3JpdGUgeW91ciBvd24gYXMgYWJvdmUuIEl0IGlzIG5pbmUgbGluZXM7IGtlZXAgdGhlIGB1bmRlZmluZWRgIGNhc2UgaW4gcGFydGljdWxhci4KClRoZSBob3N0IHRlbGxzIHlvdSB3aGVuIHRoZSBzdGFjayBjaGFuZ2VzLiBUaGUgZ2FtZSdzIG93biBzY3JlZW5zICh0aGUgaW52ZW50b3J5LCB0aGUga25vd2xlZGdlIGJyb3dzZXIsIHRoZSBNb2RzIHNjcmVlbiB5b3Ugd291bGQgdXNlIHRvIHR1cm4gdGhpcyBtb2Qgb2ZmKSByZXBhaW50IHRoZSB0ZXJtaW5hbCB3aXRob3V0IHByb2R1Y2luZyBhIHdvcmxkIGZyYW1lLCBiZWNhdXNlIGEgc2NyZWVuIHJlZHJhd3MgZnJvbSBpdHMgb3duIGtleSBsb29wLiBTbyB3aGVuIHRoZSBzdGFjayBjaGFuZ2VzIHdpdGggbm8gbmV3IGZyYW1lIGJlaGluZCBpdCwgdGhlIGhvc3QgcHJlc2VudHMgeW91ciBsYXN0IGZyYW1lIGFnYWluIHdpdGggYHN0YWNrYCB1cGRhdGVkLiBUaGUgY2VsbHMgYXJlIHRoZSBvbmVzIHlvdSBhbHJlYWR5IGRyZXcuIFByb2plY3RpbmcgYSBmcmVzaCB3b3JsZCBmcmFtZSBmcm9tIGEgc2hlbGwgdGhhdCBpcyBub3QgaW4gYSByZXBhaW50IHdvdWxkIG1lYW4gaW52ZW50aW5nIG9uZSwgYW5kIG5vdGhpbmcgaGFzIHJ1biB0aGF0IGNvdWxkIGhhdmUgY2hhbmdlZCB0aGUgZHVuZ2Vvbi4gT25seSB0aGUgc3RhY2sgY2hhbmdlZCwgc28gdGhhdCBpcyB0aGUgcGFydCB0byByZWFkLgoKVGhlIG5vdGlmaWNhdGlvbiBmaXJlcyB3aGVuIHRoZSBjb21wb3NpdGUgY2hhbmdlcywgbm90IGV2ZXJ5IHRpbWUgaXQgaXMgcmVjb21wdXRlZCwgc2luY2Ugbm90aWZ5aW5nIG9uIGV2ZXJ5IHJlY29tcG9zZSB3b3VsZCBkb3VibGUgZXZlcnkgcmVwYWludCB3aXRoIG5vIG5ldyBpbmZvcm1hdGlvbi4KCkEgc3RhY2sgY2FuIGdpdmUgeW91IHRocmVlIGFuc3dlcnMuIEFuIGVtcHR5IHN0YWNrLCBvciBvbmUgd2hvc2UgZW50cmllcyBkbyBub3Qgb3ZlcmxhcCB5b3UsIG1lYW5zIG5vdGhpbmcgaXMgb3ZlciB5b3UuIEEgbWlzc2luZyBgc3RhY2tgIG1lYW5zIHRoaXMgaG9zdCBwdWJsaXNoZXMgbm9uZSwgc28gbm90aGluZyBpcyBrbm93bjsgZHJhdyBhbnl3YXksIGJlY2F1c2UgYHBsYWNlKClgIGFscmVhZHkgZGVjbGluZXMgd2hlbiB0aGVyZSBpcyBubyBwaXhlbCBnZW9tZXRyeSB0byBkcmF3IGludG8uIEEgc3RhY2sgdGhhdCBpcyBwdWJsaXNoZWQgYnV0IGRvZXMgbm90IGNvbnRhaW4gYCJtYXAiYCBjb21lcyBmcm9tIGEgaG9zdCB0aGF0IGhhcyBzdG9wcGVkIGRlc2NyaWJpbmcgdGhlIG1hcCwgYW5kIHlvdSBzaG91bGQgdHJlYXQgdGhhdCBhcyBjb3ZlcmVkLiBJZiB5b3UgdHJlYXQgaXQgYXMgY2xlYXIsIHlvdXIgY2FudmFzIGtlZXBzIHBhaW50aW5nIG92ZXIgd2hhdGV2ZXIgcmVwbGFjZWQgdGhlIG1hcCwgaW5kZWZpbml0ZWx5LCB3aXRoIG5vIGVycm9yIGFueXdoZXJlLgoKQSBIVUQgcmVnaW9uIG93bmVyIHJlYWRzIHRoZSBzYW1lIGZpZWxkIG9uIGBIdWRGcmFtZWAsIGFza2luZyBhYm91dCBpdHMgb3duIHNlY3Rpb24ncyBgcmVnaW9uLm5hbWVgLgoKT25lIGdhcCByZW1haW5zOiBhIG1vZCBwcmVzZW50ZXIgaG9sZGluZyBhIHNjcmVlbiBkb2VzIG5vdCBwdXNoIGEgcmVnaW9uLCBzbyB0aGUgY2hlY2sgYWJvdmUgcmVwb3J0cyBub3RoaW5nIG92ZXIgdGhlIG1hcCB3aGlsZSBhIHByZXNlbnRlci1vd25lZCBzY3JlZW4gaXMgdXAuIFRoZSBub3RpZmljYXRpb24gaXMgY29ycmVjdCBmb3IgZXZlcnkgcmVnaW9uIHRoYXQgaXMgcHVzaGVkOyB0b2RheSB0aGUgdGV4dC1zY3JlZW4gcGF0aCBpcyB3aGF0IHB1c2hlcyB0aGVtLgoKIyMgVGhlIEhVRCwgcmVnaW9uIGJ5IHJlZ2lvbgoKYGh1ZChjdHgpYCBpcyB0aGUgY29tcGFuaW9uIHRvIGBmcm9udGVuZChjdHgpYC4gYGZyb250ZW5kYCBjb3ZlcnMgdGhlIGR1bmdlb247IGBodWRgIGNvdmVycyBldmVyeXRoaW5nIGFyb3VuZCBpdCAodGhlIG1lc3NhZ2UgbGluZSwgdGhlIHZpdGFscyBhbmQgdGhlIHN0YXR1cyBsaW5lKSwgYW5kIHVubGlrZSB0aGUgbWFwIGl0IGlzIG93bmVkIG9uZSByZWdpb24gYXQgYSB0aW1lOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICBodWQoY3R4KSB7CiAgICBjb25zdCBjYW52YXMgPSBtYWtlTXlQYW5lbChnbG9iYWxUaGlzLmRvY3VtZW50KTsKICAgIHJldHVybiB7CiAgICAgIHNpZGViYXI6IHsKICAgICAgICBwcmVzZW50KHNlY3Rpb24sIGZyYW1lKSB7CiAgICAgICAgICBjb25zdCBib3ggPSBzZWN0aW9uLnJlZ2lvbj8ucGl4ZWxzOwogICAgICAgICAgaWYgKCFib3gpIHJldHVybjsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGdlb21ldHJ5OiBkcmF3IG5vdGhpbmcKICAgICAgICAgIHBsYWNlT24oY2FudmFzLCBib3gpOwogICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBzZWN0aW9uLmVudHJpZXMpIHsKICAgICAgICAgICAgZHJhdyhlbnRyeS5rZXksIHRleHRPZihlbnRyeSksIGlua0ZvcihlbnRyeS5ydW5zWzBdPy5jb2xvcikpOwogICAgICAgICAgfQogICAgICAgIH0sCiAgICAgIH0sCiAgICB9OwogIH0sCn07CmBgYAoKUmV0dXJuIGEgc2luayBmb3IgZWFjaCByZWdpb24geW91IGFyZSB0YWtpbmcgYW5kIG9taXQgdGhlIHJlc3Q7IHRob3NlIHN0YXkgdGhlIGdhbWUncyBhbmQga2VlcCBiZWluZyBkcmF3bi4gUmV0dXJuaW5nIGB1bmRlZmluZWRgIG9yIGB7fWAgZGVjbGluZXMgZXZlcnl0aGluZywgd2hpY2ggaXMgdGhlIHJpZ2h0IGFuc3dlciBvbiBhIGhvc3QgeW91IGNhbm5vdCBkcmF3IG9uLiBBIGZhY3RvcnkgdGhhdCB0aHJvd3MgYWxzbyBsb3NlcyB5b3VyIHJlZ2lvbnMsIGJ1dCBpdCBpcyByZXBvcnRlZCBhcyB5b3VyIG1vZCdzIGZhdWx0LCBhbmQgaGF2aW5nIG5vIGRvY3VtZW50IHRvIGRyYXcgb24gaXMgbm90IGEgZmF1bHQuCgpFYWNoIHJlZ2lvbiBuZWVkcyBpdHMgb3duIGNhcGFiaWxpdHksIG9yIHRoZSB3aWxkY2FyZCBmb3IgYWxsIHRocmVlOgoKYGBganNvbgp7ICJzaGFwZSI6ICJwbHVnaW4iLCAiY2FwYWJpbGl0aWVzIjogWyJ1aTpzaWRlYmFyLnJlcGxhY2UiXSB9CmBgYAoKYHVpOm1lc3NhZ2VzLnJlcGxhY2VgLCBgdWk6c2lkZWJhci5yZXBsYWNlYCwgYHVpOnN0YXR1cy5yZXBsYWNlYCwgYHVpOioucmVwbGFjZWAuIFRoZXJlIGlzIG5vIGB1aTptYXAucmVwbGFjZWA6IHRoZSBkdW5nZW9uIGJlbG9uZ3MgdG8gYGRpc3BsYXk6cmVwbGFjZWAsIGFuZCBvbmUgcmVnaW9uIGFuc3dlcmluZyB0byB0d28gY2FwYWJpbGl0aWVzIHdvdWxkIGdpdmUgdHdvIGFuc3dlcnMgdG8gd2hvIGRyYXdzIGl0LiBUaGUgdHdvIGRvIG5vdCBjb3ZlciBlYWNoIG90aGVyIGluIGVpdGhlciBkaXJlY3Rpb246IGhvbGRpbmcgdGhlIG1hcCBkb2VzIG5vdCBsZXQgeW91IGRyYXcgdGhlIHZpdGFscywgYW5kIGhvbGRpbmcgdGhlIHdob2xlIGludGVyZmFjZSBkb2VzIG5vdCBsZXQgeW91IGRyYXcgdGhlIG1hcC4KClRoZSBjYXBhYmlsaXR5IGlzIHRoZSBjbGFpbS4gVGhlIGhvc3QgcGlja3MgZWFjaCByZWdpb24ncyBvd25lciBmcm9tIHRoZSBtYW5pZmVzdHMgYmVmb3JlIGl0IGNhbGxzIGFueWJvZHkncyBgaHVkKClgLCBzbyBhIG1vZCB0aGF0IGxvc2VzIGlzIG5ldmVyIGNvbnN0cnVjdGVkIGFuZCBjYW5ub3QgbW91bnQgVUkgaXQgd2lsbCBuZXZlciBkcmF3IGludG8uIFRoYXQgaGFzIHR3byBjb25zZXF1ZW5jZXMgZm9yIHlvdXIgbWFuaWZlc3Q6CgotIEEgc2luayBmb3IgYSByZWdpb24geW91IGRpZCBub3QgYXNrIGZvciBpcyBkcm9wcGVkIGFuZCByZXBvcnRlZCBieSBuYW1lLgotIEEgcmVnaW9uIHlvdSB3b24gYW5kIHRoZW4gZGVjbGluZWQgZ29lcyBiYWNrIHRvIHRoZSBnYW1lLCBub3Qgb24gdG8gdGhlIG5leHQgY2xhaW1hbnQuIEFzayBvbmx5IGZvciB0aGUgcmVnaW9ucyB5b3UgYWN0dWFsbHkgZHJhdy4KCk9uIGV2ZXJ5IHJlcGFpbnQgeW91IGdldCB5b3VyIG93biBgc2VjdGlvbmAgcGx1cyB0aGUgd2hvbGUgYGZyYW1lYCwgYm90aCBmcm96ZW4gYW5kIHN0cnVjdHVyYWxseSB5b3Vycywgc28ga2VlcGluZyBvbmUgdG8gYW5pbWF0ZSBmcm9tIGlzIHNhZmUuIFRoZSBmcmFtZSB0ZWxscyB5b3Ugd2hhdCBhIHNlY3Rpb24gbWVhbnM6IGBmcmFtZS50YXJnZXRpbmdgIHNheXMgdGhlIG1lc3NhZ2Ugcm93IGlzIGEgbG9vayBkZXNjcmlwdGlvbiBpbnN0ZWFkIG9mIGEgbWVzc2FnZSwgYW5kIGBmcmFtZS5sYXlvdXRgIChgImxlZnQiIHwgInRvcCIgfCAibm9uZSJgKSBzYXlzIHdoZXRoZXIgdGhlIHZpdGFscyBhcmUgYSBjb2x1bW4sIGEgb25lLWxpbmUgaGVhZGVyLCBvciB0dXJuZWQgb2ZmLiBVbmRlciBgIm5vbmUiYCB0aGVyZSBpcyBubyBgc2lkZWJhcmAgc2VjdGlvbiBhdCBhbGwgYW5kIHlvdXIgc2luayBpcyBub3QgY2FsbGVkLCBiZWNhdXNlIHRoZSBwbGF5ZXIgdHVybmVkIHRoZSB2aXRhbHMgb2ZmLgoKUmVhZCBgZW50cnkua2V5YCAob25lIG9mIGBocGAsIGBzcGAsIGBhY2AsIGBkZXB0aGAsIGBzdGF0ZWApLCB3aGljaCBpcyB0aGUgZW5naW5lJ3Mgb3duIGBzaWRlX2hhbmRsZXJzW11gIC8gYHN0YXR1c19oYW5kbGVyc1tdYCBuYW1lIG1pbnVzIGl0cyBgcHJ0X2AgcHJlZml4LCBhbmQgYHJ1bi5jb2xvcmAsIGl0cyBgQ09MT1VSXypgIGF0dHJpYnV0ZS4gUmVzb2x2ZSB0aGUgY29sb3VyIHRocm91Z2ggYGN0eC5jb3JlLkNPTE9VUl9MX0dSRUVOYCBhbmQgZnJpZW5kcyBieSBuYW1lLCBuZXZlciBieSB0aGUgbnVtYmVyIGl0IGN1cnJlbnRseSBoYXMuIGBydW4uY3NzYCBhbmQgYGVudHJ5LnNjcmVlbmAgYXJlIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCdzIG93biBwcm9qZWN0aW9uOiB1c2VmdWwgZm9yIGEgdGV4dC1tb2RlIHJlcGxhY2VtZW50LCBhbmQgc2FmZSB0byBpZ25vcmUgaWYgeW91IGFyZSBkcmF3aW5nIHlvdXIgb3duLgoKQSBmYXVsdCBjb3N0cyB5b3Ugb25lIHJlZ2lvbi4gSWYgeW91ciBgc3RhdHVzYCBzaW5rIHRocm93cywgdGhlIGdhbWUgcmVzdW1lcyBkcmF3aW5nIHRoZSBzdGF0dXMgbGluZSBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlc3Npb24gYW5kIHJlcG9ydHMgeW91ciBtb2QgYnkgbmFtZTsgeW91ciBgc2lkZWJhcmAga2VlcHMgZHJhd2luZywgYW5kIHRoZSBwbGF5ZXIga2VlcHMgdGhlaXIgZ2FtZS4KCkRyYXcgYmFycyBmcm9tIGBlbnRyeS52YWx1ZXNgLCBuZXZlciBmcm9tIHRoZSB0ZXh0LiBBbiBlbnRyeSBjYXJyaWVzIHRoZSBudW1iZXJzIGl0cyB0ZXh0IHdhcyBmb3JtYXR0ZWQgZnJvbSwgc28gaGl0IHBvaW50cyBhcnJpdmUgYXMgYHsgY3VycmVudDogNywgbWF4OiAzNCB9YCBiZXNpZGUgYCJIUCAgIDcvICAzNCJgLiBQYXJzaW5nIHRoZSBzdHJpbmcgd29ya3Mgb25seSB1bnRpbCBzb21lYm9keSBsb2FkcyBhIHByZWYgZmlsZSwgcGxheXMgaW4gYW5vdGhlciBsYW5ndWFnZSwgb3IgaW5zdGFsbHMgYSBjb250ZW50IHBhY2sgdGhhdCB3aWRlbnMgYSBmaWVsZC4KClRoZSBjb252ZW50aW9uIGlzIGEgc2luZ2xlIHJ1bGUuIGBjdXJyZW50YCBhbmQgYG1heGAgdG9nZXRoZXIgbWVhbiB0aGUgZmllbGQgaXMgYSBwcm9wb3J0aW9uLCBhbmQgYGN1cnJlbnQgLyBtYXhgIGlzIG1lYW5pbmdmdWwuIEV2ZXJ5IG90aGVyIGtleSBpcyBhIHBsYWluIG5hbWVkIHF1YW50aXR5LiBBIGZpZWxkIHdpdGggdHdvIG51bWJlcnMgdGhhdCBhcmUgbm90IGEgcmF0aW8gYXZvaWRzIHRob3NlIG5hbWVzOiBhIHN0YXQgcHVibGlzaGVzIGB1c2VgIC8gYGN1cmAgLyBgbWF4YCwgYmVjYXVzZSBgMTE4YCBpcyBhbiBlbmNvZGluZyBtZWFuaW5nIDE4LzEwMCwgYW5kIGEgYmFyIG92ZXIgaXQgd291bGQgc2hvdyBhIG1heGVkIGNoYXJhY3RlciBhdCAxNSUuIFNvIGBpZiAodi5jdXJyZW50ICE9PSB1bmRlZmluZWQgJiYgdi5tYXggIT09IHVuZGVmaW5lZCkgZHJhd0JhcigpIGVsc2UgZHJhd1RleHQoKWAgaXMgc2FmZSBvbiBldmVyeSBmaWVsZCwgaW5jbHVkaW5nIG9uZXMgYWRkZWQgYWZ0ZXIgeW91IHNoaXBwZWQuCgpBIG1pc3NpbmcgdmFsdWUgYWx3YXlzIG1lYW5zIHRoZSBnYW1lIGRvZXMgbm90IGtub3csIG5ldmVyIHplcm86IHRoZSBtb25zdGVyIGhlYWx0aCBiYXIgcHVibGlzaGVzIG5vdGhpbmcgd2hpbGUgaXQgcmVhZHMgYFstLS0tLS0tLS0tXWAsIGFuZCBgc3BgIGlzIGFic2VudCBmb3IgYSBjbGFzcyB3aXRoIG5vIG1hbmEgaW5zdGVhZCBvZiBgMC8wYC4gVGhlIGZ1bGwgcGVyLWZpZWxkIGtleSBsaXN0IGlzIG9uIGBIdWRWYWx1ZXNgIGluIHRoZSBTREsuCgpgc2FtcGxlcy92aXRhbHMtcGFuZWwvYCBpcyBhIGNvbXBsZXRlIHdvcmtlZCBleGFtcGxlOiBpdCB0YWtlcyBgc2lkZWJhcmAgYWxvbmUgYW5kIGxlYXZlcyB0aGUgcmVzdCBvZiB0aGUgc2NyZWVuIHRvIHRoZSBnYW1lLgoKIyMgYG1lbnUoY3R4KWA6IGFzayB0aGUgZ2FtZSdzIHF1ZXN0aW9ucyB5b3VyIG93biB3YXkKCmBtZW51KGN0eClgIGlzIHRoZSB0aGlyZCBvd25lciBzZWFtLCBhbmQgaXQgd29ya3MgZGlmZmVyZW50bHkgZnJvbSB0aGUgZmlyc3QgdHdvOiBhIEhVRCBzZWN0aW9uIGlzIGRyYXduLCB3aGlsZSBhIG1lbnUgaXMgYXNrZWQuIFRoZSBib3VuZGFyeSBpcyBgYXNrKHF1ZXN0aW9uKSAtPiBhbnN3ZXJgLCBhbmQgdGFraW5nIGEgcXVlc3Rpb24gbWVhbnMgaGFuZGxpbmcgdGhlIHBsYXllcidzIGNob2ljZSBhcyB3ZWxsIGFzIGRyYXdpbmcgdGhlIG1lbnUuCgpgYGBqcwptZW51KGN0eCkgewogIHJldHVybiB7CiAgICBhc2socXVlc3Rpb24pIHsKICAgICAgaWYgKHF1ZXN0aW9uLmlkICE9PSAiY29yZTpnYW1lLW1lbnUiKSByZXR1cm4gdW5kZWZpbmVkOyAgIC8vIGRlY2xpbmUKICAgICAgcmV0dXJuIGRyYXdEaWFsQW5kV2FpdChxdWVzdGlvbik7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtPiBNZW51QW5zd2VyCiAgICB9LAogIH07Cn0KYGBgCgpJdCBpcyBnYXRlZCBieSB0aGUgc2luZ2xlIGB1aTptZW51LnJlcGxhY2VgIGNhcGFiaWxpdHkgKG9yIHRoZSB3aWxkY2FyZCBgdWk6Ki5yZXBsYWNlYCkuIE9uZSBncmFudCBjb3ZlcnMgZXZlcnkgbWVudSBpbnN0ZWFkIG9mIG9uZSBwZXIgbWVudSBpZDogdGhlcmUgYXJlIGFib3V0IDUwIG9mIHRoZW0sIGFuZCA1MCBjYXBhYmlsaXR5IHN0cmluZ3Mgd291bGQgbWFrZSBhIGNvbnNlbnQgbGlzdCBub2JvZHkgY291bGQgcmVhZC4KCkRlY2xpbmluZyBpcyB0aGUgbm9ybWFsIGNhc2UuIFlvdXIgcHJlc2VudGVyIGlzIG9mZmVyZWQgZXZlcnkgbWVudSB0aGUgZ2FtZSBhc2tzIGFuZCByZXR1cm5zIGB1bmRlZmluZWRgIGZyb20gYGFza2AgZm9yIHRoZSBvbmVzIGl0IGhhcyBubyBiZXR0ZXIgd2F5IHRvIHByZXNlbnQ7IHRoZSBnYW1lIHRoZW4gYXNrcyB0aG9zZSBpdHMgb3duIHdheS4gQSByYWRpYWwgZGlhbCBmb3Igc2l4IGNvbW1hbmQgdmVyYnMgaGFzIG5vIHJlYXNvbiB0byB0b3VjaCB0aGUgbW9kIG1hbmFnZXIncyB0aGlydHktcm93IGxpc3QuIERlY2xpbmluZyBjb3N0cyBub3RoaW5nOiB5b3UgZHJldyBub3RoaW5nLCBhbmQgbm90aGluZyBpcyBsZWZ0IGhhbGYtb3duZWQuCgpBbnN3ZXIgYnkgdGhlIGNob2ljZSdzIHN0YWJsZSBgaWRgLCBuZXZlciBieSBhbiBpbmRleC4gQW4gaW5kZXggZGVzY3JpYmVzIGEgbGF5b3V0LCBhbmQgb25jZSB5b3UgaGF2ZSBncm91cGVkIHRoZSBjaG9pY2VzIGludG8gdGhlIHdlZGdlcyBvZiBhIGRpYWwgeW91IGhhdmUgbm8gaW5kZXggdGhlIGdhbWUgd291bGQgcmVjb2duaXNlLiBSZWFkIGBjaG9pY2Uuc2VtYW50aWNgIChge2tpbmQsIHJlZn1gKSBmb3Igd2hhdCBhIGNob2ljZSBtZWFucyBpbmRlcGVuZGVudCBvZiBpdHMgd29yZGluZywgYW5kIGBxdWVzdGlvbi5pZGAgdG8gcmVjb2duaXNlIHdoaWNoIHF1ZXN0aW9uIHlvdSBhcmUgYmVpbmcgYXNrZWQuCgpUaGUgYW5zd2VycyBhcmUgYGNob29zZWAsIGBjYW5jZWxgLCBgY29tbWFuZGAgYW5kIGBvcHRpb25zYC4gYGNvbW1hbmRgIHJ1bnMgb25lIG9mIGBxdWVzdGlvbi5jb21tYW5kc2AsIHRoZSBjYWxsZXIncyBvd24gaGFuZGxlciwgZXhhY3RseSBhcyBwcmVzc2luZyB0aGUga2V5IHdvdWxkLCBhbmQgdGhlIHF1ZXN0aW9uIGlzIHRoZW4gYXNrZWQgYWdhaW4gdW5sZXNzIHRoYXQgaGFuZGxlciByZXNvbHZlZCBpdC4gVGhhdCBpcyBob3cgYSByZWltYWdpbmVkIHN0b3JlIGNhbiBvZmZlciAiYnV5IiB3aXRob3V0IGtub3dpbmcgd2hhdCBidXlpbmcgZG9lcy4gWW91IGNhbm5vdCBpbnZlbnQgdGhvc2Uga2V5czsgdGhleSBiZWxvbmcgdG8gd2hvZXZlciBvcGVuZWQgdGhlIG1lbnUuCgpUaHJvd2luZyBjb3N0cyB5b3UgdGhlIHNlYW0gZm9yIHRoZSBzZXNzaW9uLCBvbiBldmVyeSBtZW51LCB3aGVyZWFzIGluIGBodWRgIGEgZmF1bHQgY29zdHMgb25lIHJlZ2lvbi4gQSBwcmVzZW50ZXIgdGhhdCB0aHJvd3Mgb24gb25lIHF1ZXN0aW9uIHVzdWFsbHkgdGhyb3dzIG9uIGFsbCBvZiB0aGVtLCBhbmQgb25lIHJlcG9ydCBpcyBiZXR0ZXIgdGhhbiBhIHJlcG9ydCBldmVyeSB0aW1lIHRoZSBwbGF5ZXIgb3BlbnMgYW55dGhpbmcuIEFuc3dlcnMgdGhhdCBjYW5ub3QgYmUgaG9ub3VyZWQgKGFuIHVua25vd24gY2hvaWNlIGlkLCBhIGNob2ljZSBvbiBhIGJyb3dzZS1vbmx5IHF1ZXN0aW9uLCBhIGNvbW1hbmQga2V5IHRoYXQgd2FzIG5ldmVyIG9mZmVyZWQpIGNvc3QgeW91IHRoYXQgbWVudSBvbmx5LCBhbmQgYXJlIHJlcG9ydGVkLgoKQSBtZW51IHN0aWxsIGhhcyBubyBwdWJsaXNoZWQgcmVnaW9uIG9mIGl0cyBvd24sIGFsdGhvdWdoIG92ZXJsYXBwaW5nLCBvcmRlcmVkLCBtb2QtY3JlYXRlZCByZWdpb25zIGhhdmUgc2luY2UgbGFuZGVkOyBzZWUgW2ByZWdpb25zKGN0eClgXSgjcmVnaW9uc2N0eC1wdXQtZnVybml0dXJlLW9mLXlvdXItb3duLW9uLXRoZS1zY3JlZW4pLiBgcmVnaW9ucy50c2AgbmFtZXMgdGhlIGZvdXIgcGFydHMgb2YgdGhlIHNjcmVlbiB0aGF0IHRpbGUgaXQsIGFuZCBhIGZsb2F0aW5nIG1lbnUgb3ZlcmxhcHMgYnkgZGVmaW5pdGlvbi4gYHF1ZXN0aW9uLnN0eWxlYCB0ZWxscyB5b3Ugd2hldGhlciB0aGUgZ2FtZSB3b3VsZCBoYXZlIGNsZWFyZWQgdGhlIHNjcmVlbiAoYCJzY3JlZW4iYCkgb3IgZHJhd24gYSBib3ggb3ZlciBhIHN0aWxsLXZpc2libGUgbWFwIChgIm92ZXJsYXkiYCkuCgpgc2FtcGxlcy9jb21tYW5kLWRpYWwvYCBpcyBhIGNvbXBsZXRlIHdvcmtlZCBleGFtcGxlOiBpdCB0YWtlcyB0aGUgZ2FtZSBtZW51IGFuZApkZWNsaW5lcyBldmVyeSBvdGhlciBxdWVzdGlvbiBpbiB0aGUgZ2FtZS4KCiMjIGBzY3JlZW4oY3R4KWA6IHNob3cgdGhlIGdhbWUncyBmdWxsIHNjcmVlbnMgeW91ciBvd24gd2F5Cgpgc2NyZWVuKGN0eClgIGlzIHRoZSBmb3VydGggb3duZXIgc2VhbSwgYW5kIGl0IHJlYWNoZXMgdGhlIGNvbnRlbnQgb2YgYSBzY3JlZW4gd2hlcmUgdGhlIG90aGVycyByZWFjaCB0aGUgZnJhbWUuIEJlZm9yZSBpdCBleGlzdGVkLCB0aGUgaW52ZW50b3J5IGFycml2ZWQgYXMgYFNjcmVlbkxpbmVbXWAsIHJvd3Mgb2YgY2hhcmFjdGVycyBhbmQgY29sb3Vycywgc28gYSBtb2QgdGhhdCB3YW50ZWQgdG8gZHJhdyBpdGVtcyBhcyBzcHJpdGUgY2FyZHMgd291bGQgaGF2ZSBoYWQgdG8gcGFyc2UgYCJhKSBhIFBvdGlvbiBvZiBDdXJlIExpZ2h0IFdvdW5kcyAgICAgICA0LjAgbGIiYCBiYWNrIGludG8gYSBuYW1lIGFuZCBhIHdlaWdodCwgYW5kIHdvdWxkIGJyZWFrIHRoZSBkYXkgYSBwcmVmIGZpbGUgY2hhbmdlZCBhIGNvbG91ciBvciBhIHRyYW5zbGF0aW9uIGNoYW5nZWQgYSB3aWR0aC4gQSBzY3JlZW4gbm93IGFycml2ZXMgYXMgYSBkb2N1bWVudCBvZiBibG9ja3MuCgpgYGBqcwpzY3JlZW4oY3R4KSB7CiAgcmV0dXJuIHsKICAgIHNob3codmlldykgewogICAgICBpZiAodmlldy5pZCAhPT0gImNvcmU6aW52ZW50b3J5IikgcmV0dXJuIHVuZGVmaW5lZDsgICAgICAgIC8vIGRlY2xpbmUKICAgICAgY29uc3QgdGFibGUgPSB2aWV3LmJsb2Nrcy5maW5kKChiKSA9PiBiLmtpbmQgPT09ICJ0YWJsZSIpOwogICAgICBkcmF3Q2FyZHModGFibGUucm93cyk7ICAgICAgICAgICAgLy8gcm93LmNlbGxzLm5hbWUudGV4dCwgcm93LnNlbWFudGljLCAuLi4KICAgICAgcmV0dXJuIHsgZGlzbWlzc2VkOiB3aGVuVGhlUGxheWVyQ2xvc2VzKCkgfTsKICAgIH0sCiAgfTsKfQpgYGAKCkl0IGlzIGdhdGVkIGJ5IHRoZSBzaW5nbGUgYHVpOnNjcmVlbi5yZXBsYWNlYCBjYXBhYmlsaXR5IChvciB0aGUgd2lsZGNhcmQgYHVpOioucmVwbGFjZWApLCBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBgbWVudWA6IG9uZSBncmFudCBjb3ZlcnMgZXZlcnkgc2NyZWVuLCBhbmQgeW91IGNob29zZSBwZXIgc2NyZWVuIGJ5IGRlY2xpbmluZy4KCkEgbGlzdCBpcyBhIGB0YWJsZWAsIGFuZCBjZWxscyBhcmUgYWRkcmVzc2VkIGJ5IGNvbHVtbiBrZXkuIENvbHVtbnMgaGF2ZSBzdGFibGUga2V5cyAoYG5hbWVgLCBgc2xvdGAsIGB3ZWlnaHRgLCBgdHVybmApLCBzbyB5b3UgcmVhZCBgcm93LmNlbGxzLm5hbWUudGV4dGAgYW5kIG5ldmVyIGNvdW50IGNoYXJhY3RlcnMuIEEgY29sdW1uIGFsc28gcHVibGlzaGVzIHRocmVlIGZhY3RzIGFib3V0IHRoZSB0ZXJtaW5hbCdzIGxheW91dCwgYWxsIG9mIHdoaWNoIHlvdSBhcmUgZnJlZSB0byBpZ25vcmU6IGB3aWR0aGAgKHRoZSBmaWVsZCB3aWR0aCB3aGVyZSB1cHN0cmVhbSBmaXhlZCBvbmUpLCBgZ2FwYCAoY29sdW1ucyBvZiBzcGFjZSBiZWZvcmUgaXQ7IHRoZSBoaXN0b3J5IHNjcmVlbiB3cml0ZXMgYCIlMTBsZCU3ZCcgICVzImAsIHdpdGggbm8gZ2FwIGJlZm9yZSB0aGUgZGVwdGggYW5kIHR3byBiZWZvcmUgdGhlIG5vdGUpIGFuZCBgcGFkYCAoZmFsc2Ugd2hlcmUgdGhlIGdhbWUgZG9lcyBub3QgbGluZSB0aGUgY29sdW1uIHVwLCBhcyB3aXRoIHRoZSBvYmplY3QgbGlzdCdzIGxvY2F0aW9uLCB3aGljaCBzaW1wbHkgZm9sbG93cyB0aGUgbmFtZSkuIFRoZXNlIGFyZSBwdWJsaXNoZWQgYmVzaWRlIHRoZSBkYXRhIGluc3RlYWQgb2YgYmVpbmcgYmFrZWQgaW50byBpdCBhcyBwYWRkaW5nLCBzbyBib3RoIGEgdGVybWluYWwgcmVuZGVyaW5nIGFuZCB5b3VyIG93biBjYW4gY29tZSBmcm9tIG9uZSBtb2RlbC4KCmByb3cuc2VtYW50aWNgIGlzIHRoZSBzYW1lIGB7a2luZCwgcmVmfWAgYSBgTWVudUNob2ljZWAgY2Fycmllcywgc28gYW4gaXRlbSBpcyB0aGUgc2FtZSB0aGluZyB0byB5b3Ugd2hldGhlciB0aGUgZ2FtZSBpcyBsaXN0aW5nIGl0IG9yIGFza2luZyB5b3UgdG8gcGljayBpdDogYW4gaW52ZW50b3J5IHJvdyBhbmQgaXRzIHBpY2tlciBjaG9pY2Ugc2hhcmUgYW4gaWQuIEFuIGVtcHR5IGVxdWlwbWVudCBzbG90IGlzIGB7a2luZDogInNsb3QifWAgaW5zdGVhZCBvZiBhbiBpdGVtLiBgcm93LmNvbG9yYCBpcyB0aGUgb2JqZWN0J3Mgb3duIGF0dHIgYXMgQ1NTLCBhbmQgYHJvdy50YWdgIGlzIHRoZSBsZXR0ZXIgdGhlIHRlcm1pbmFsIHdvdWxkIG9mZmVyLgoKTnVtYmVycyBjb21lIHdpdGggdGhlIHRleHQuIGBjZWxsLnZhbHVlc2AgZm9sbG93cyB0aGUgSFVEJ3MgY29udmVudGlvbjogYGN1cnJlbnRgIGFuZCBgbWF4YCB0b2dldGhlciBtZWFuIGEgcHJvcG9ydGlvbiwgZXZlcnkgb3RoZXIga2V5IGlzIGEgbmFtZWQgcXVhbnRpdHksIGFuZCBhIG1pc3Npbmcga2V5IG1lYW5zIHRoZSBnYW1lIGRvZXMgbm90IGtub3cgdGhlIHZhbHVlLiBBIHdlaWdodCBjZWxsIHB1Ymxpc2hlcyBge2VhY2gsIHRvdGFsLCBudW1iZXJ9YCBpbiB0ZW50aHMgb2YgYSBwb3VuZCwgc28geW91IGNhbiBmb3JtYXQgaXQgeW91ciBvd24gd2F5LgoKQ2hlY2sgYHJvdy52YWx1ZXNgIGFzIHdlbGwgYXMgYGNlbGwudmFsdWVzYC4gVGhlIG1vZGVsIG1heSBjYXJyeSBtb3JlIHRoYW4gdGhlIHJlbmRlcmluZywgbmV2ZXIgbGVzcywgc28gYSBudW1iZXIgdGhlIHRlcm1pbmFsIGhhcyBubyBjb2x1bW4gZm9yIGxpdmVzIG9uIHRoZSByb3c6IHRoZSBxdWl2ZXIgcHVibGlzaGVzIGl0cyB3ZWlnaHQgdGhhdCB3YXksIHRoZSBvYmplY3QgbGlzdCBwdWJsaXNoZXMgZWFjaCBvZmZzZXQgYXMgYHtkeSwgZHh9YCBhcyB3ZWxsIGFzIGAiMiBOIDAgVyJgLCBhbmQgdGhlIHBsYXllciBoaXN0b3J5IGluY2x1ZGVzIHRoZSBjaGFyYWN0ZXIgbGV2ZWwgaXQgbmV2ZXIgcHJpbnRzLiBUaG9zZSBhcmUgdGhlIG51bWJlcnMgYSBwcmVzZW50ZXIgbmVlZHMgYW5kIGEgdGV4dCBzY3JlZW4gY2Fubm90IHNob3cuCgpQcm9zZSBhcnJpdmVzIHVud3JhcHBlZCwgaW4gYSBgdGV4dGAgYmxvY2suIGBwYXJhZ3JhcGhzYCBpcyBhIHJ1biBzdHJlYW0gcGVyIHBhcmFncmFwaCwgc3BsaXQgd2hlcmUgdGhlIGdhbWUgbWVhbnQgYSBicmVhayBhbmQgbm93aGVyZSBlbHNlLCBzbyB0aGUgb2JqZWN0IHJlY2FsbCwgdGhlIG9iamVjdCBjb21wYXJpc29uIGFuZCB0aGUgbW9uc3RlciByZWNhbGwgaGFuZCB5b3UgdGhlIHRleHQgYW5kIGxldCB5b3UgY2hvb3NlIHRoZSB3aWR0aC4gQSBgbGluZXNgIGJsb2NrLCBieSBjb250cmFzdCwgaGFzIGFscmVhZHkgYmVlbiBicm9rZW4gaW50byB0ZXJtaW5hbC13aWR0aCByb3dzLCBhbmQgcmUtZmxvd2luZyB0aG9zZSB0byBhIHBhbmVsIG9mIHlvdXIgb3duIHNpemUgbWVhbnMgdW5kb2luZyB0aGUgZ2FtZSdzIHdyYXAgZmlyc3QgYW5kIGd1ZXNzaW5nIHdoaWNoIGJyZWFrcyB3ZXJlIHRoZSBnYW1lJ3MgYW5kIHdoaWNoIHdlcmUgdGhlIHNlbnRlbmNlJ3MuIGBibG9jay5jb2xvcmAgaXMgdGhlIHByb3NlJ3MgZGVmYXVsdCBjb2xvdXIsIGZvciB0aGUgcGFydHMgbm8gcnVuIHNldHMuCgpgYmxvY2suZmxvd2AgbmFtZXMgd2hpY2ggb2YgQW5nYmFuZCdzIHR3byB3cmFwcGluZyByb3V0aW5lcyBsYWlkIHRoZSBwcm9zZSBvdXQsIGZvciBhIHByZXNlbnRlciB0aGF0IHdhbnRzIHRvIHJlcHJvZHVjZSB0aGUgdGVybWluYWwgaW5zdGVhZCBvZiByZS1mbG93aW5nLiBBYnNlbnQgbWVhbnMgYHRleHRibG9ja19jYWxjdWxhdGVfbGluZXNgLCB3aGljaCBjb3ZlcnMgZXZlcnkgcGFnZSBidXQgb25lOyBgInRleHQtb3V0ImAgbWVhbnMgYHRleHRfb3V0X3RvX3NjcmVlbmAsIHVzZWQgb25seSBmb3IgdGhlIGNoYXJhY3RlciBzaGVldCdzIGhpc3RvcnkuIFRoZSB0d28gZGlmZmVyIGJ5IHR3byBjb2x1bW5zIGFuZCBieSB3aGV0aGVyIGEgc2VudGVuY2UncyBzZWNvbmQgc3BhY2Ugc3Vydml2ZXMgYSBsaW5lIGJyZWFrLCBzbyBhIHJlbmRlcmVyIHRoYXQgYXNzdW1lZCBvbmUgcnVsZSBmb3IgYm90aCB3YXMgd3Jvbmcgb24gb25lIG9mIHRoZW0uIE1vc3QgcHJlc2VudGVycyBjYW4gaWdub3JlIHRoaXM7IGl0IG1hdHRlcnMgb25seSBpZiB5b3UgYXJlIHdyYXBwaW5nIHRoZSB3YXkgdGhlIHRlcm1pbmFsIGRvZXMgaW5zdGVhZCBvZiBhdCBhIHdpZHRoIG9mIHlvdXIgb3duLgoKQW4gYGFydGAgYmxvY2sga2VlcHMgdGhlIHBpY3R1cmUgYW5kIHRoZSB0ZXh0IG9uIGl0IHNlcGFyYXRlLiBJdHMgYGxpbmVzYCBhcmUgdGhlIHBpY3R1cmUgKHRoZSB0b21ic3RvbmUgb3IgdGhlIHdpbm5lcidzIGNyb3duKSwgYW5kIGl0cyBgZmllbGRzYCBhcmUgdGhlIHRleHQgdGhlIGdhbWUgd3JpdGVzIG9udG8gdGhlIHBpY3R1cmUuIFVwc3RyZWFtJ3MgdG9tYnN0b25lIGlzIG9uZSBkcmF3aW5nIHdpdGggdGhlIGNoYXJhY3RlcidzIGRldGFpbHMgYnVybmVkIGludG8gY29sdW1ucyA4LTM5LCBzbyBhIHByZXNlbnRlciBoYW5kZWQgb25seSB0aGUgZHJhd2luZyB3b3VsZCBoYXZlIHRvIGtub3cgdGhhdCB0byBnZXQgdGhlIG5hbWUgYmFjay4gSW5zdGVhZCwgZWFjaCBmaWVsZCBjYXJyaWVzIGEgc3RhYmxlIGBrZXlgIChgbmFtZWAsIGB0aXRsZWAsIGBjbGFzc2AsIGBsZXZlbGAsIGBleHBgLCBgZ29sZGAsIGBkZWF0aGAsIGBraWxsZXJgLCBgZGF0ZWApLCBpdHMgYHRleHRgLCBhbmQgYHZhbHVlc2Agd2hlcmUgdGhlIHRleHQgaXMgYSBmb3JtYXR0ZWQgbnVtYmVyLiBUaGUgYHJvd2AvYHgxYC9geDJgIGJlc2lkZSB0aGVtIGFyZSB3aGVyZSB0aGUgZmFpdGhmdWwgdGVybWluYWwgcHV0cyBlYWNoIG9uZTsgaWdub3JlIHRoZW0gYW5kIGRyYXcgYSByZWFsIGdyYXZlc3RvbmUuIEEgZmllbGQgd2l0aCBubyBiYW5kIGlzIGNlbnRyZWQgb24gdGhlIGZ1bGwgd2lkdGgsIGFzIHVwc3RyZWFtIGRvZXMgZm9yIHRoZSB3aW5uZXIncyBiYW5uZXIuCgpBIGNvbHVtbiBjYW4gY2FycnkgYSBwaWN0dXJlLCBhbmQgYSB0YWJsZSBjYW4gY2FycnkgaXRzIHNwYWNpbmcuIFRoZSBjaGFyYWN0ZXIgc2hlZXQncyBmbGFnIGdyaWQgaGFzIG9uZSBjb2x1bW4gcGVyIGVxdWlwbWVudCBzbG90LCBhbmQgdXBzdHJlYW0gZHJhd3MgdGhlIHdvcm4gaXRlbSdzIGdseXBoIG92ZXIgZWFjaC4gVGhhdCBnbHlwaCBkZXNjcmliZXMgdGhlIGNvbHVtbiAod2hhdCBpcyBpbiB0aGlzIHNsb3QpLCBzbyBpdCBhcnJpdmVzIGFzIGBjb2x1bW4uZ2x5cGhgIGluc3RlYWQgb2YgYXMgYSBmaXJzdCByb3cgeW91IHdvdWxkIGhhdmUgdG8ga25vdyB0byBza2lwOyBkcmF3IHRoZSBpdGVtJ3MgaWNvbiB0aGVyZS4gVHdvIG1vcmUgbGF5b3V0IGZhY3RzIGFyZSBwdWJsaXNoZWQgYmVzaWRlIHRoZSBkYXRhOiBgaGVhZGVyQ29sb3JgIGlzIHRoZSBoZWFkZXIgcm93J3MgY29sb3VyIHdoZXJlIHRoZSBnYW1lIGNvbG91cnMgaXQsIGFuZCBgZ2FwQWZ0ZXJgIGlzIHRoZSBudW1iZXIgb2YgYmxhbmsgcm93cyB0aGUgZmFpdGhmdWwgdGVybWluYWwgbGVhdmVzIHVuZGVyIGEgdGFibGUuIEEgYHRleHRgIGJsb2NrJ3MgYHdyYXBgIGRvZXMgdGhlIHNhbWUgZm9yIHByb3NlOiBpdCBpcyB0aGUgd2lkdGggdXBzdHJlYW0gd3JhcHMgYXQgKDcyIGZvciB0aGUgY2hhcmFjdGVyIGhpc3Rvcnkgb24gYW4gODAtY29sdW1uIHNjcmVlbiksIGFsd2F5cyBhbiB1cHBlciBib3VuZCBhbmQgbmV2ZXIgYSBtaW5pbXVtLiBJZ25vcmUgYWxsIGZvdXIgaWYgeW91IGxheSB0aGluZ3Mgb3V0IHlvdXJzZWxmLgoKTm90IGV2ZXJ5IHNjcmVlbiBoYXMgYSBtb2RlbCB5ZXQuIGBNT0RFTExFRF9TQ1JFRU5TYCAoYHBhY2thZ2VzL3dlYi9zcmMvc2NyZWVuLXZpZXcudHNgKSBuYW1lcyB0aGUgb25lcyB0aGF0IGRvLCB0aGlydHktbmluZSB0b2RheTogdGhlIGludmVudG9yeSwgdGhlIGVxdWlwbWVudCwgdGhlIHF1aXZlciwgdGhlIG9iamVjdCBsaXN0LCB0aGUgbW9uc3RlciBsaXN0LCB0aGUgbWVzc2FnZSBoaXN0b3J5LCB0aGUgcGxheWVyIGhpc3RvcnksIHRoZSBvYmplY3QgcmVjYWxsLCB0aGUgb2JqZWN0IGNvbXBhcmlzb24sIHRoZSBtb25zdGVyIHJlY2FsbCwgdGhlIHRvbWJzdG9uZSwgdGhlIHdpbm5lciwgdGhlIGNoYXJhY3RlciBzaGVldCdzIHR3byBwYWdlcyAoYGNvcmU6Y2hhcmFjdGVyYCBhbmQgYGNvcmU6Y2hhcmFjdGVyLWZsYWdzYCksIHRoZSBrbm93bGVkZ2UgYnJvd3NlcidzIHNldmVuIHJlY2FsbCBwYWdlcyAoYGNvcmU6cnVuZS1yZWNhbGxgLCBgY29yZTpmZWF0dXJlLXJlY2FsbGAsIGBjb3JlOnRyYXAtcmVjYWxsYCwgYGNvcmU6c2hhcGUtcmVjYWxsYCwgYGNvcmU6YXJ0aWZhY3QtcmVjYWxsYCwgYGNvcmU6ZWdvLXJlY2FsbGAsIGBjb3JlOm9iamVjdC1raW5kLXJlY2FsbGApLCB0aGUgZm91ciBoZWxwIHBhZ2VzIChgY29yZTpoZWxwLWNvbW1hbmRzYCwgYGNvcmU6aGVscC1zeW1ib2xzYCwgYGNvcmU6aGVscC1ndWlkZWAsIGBjb3JlOmhlbHAtY29tbXVuaXR5YCksIHRoZSBlcXVpcG1lbnQtY29tcGFyaXNvbiBzY3JlZW4ncyB0d28gaGVscCBvdmVybGF5cyAoYGNvcmU6ZXF1aXAtY21wLWhlbHBgLCBgY29yZTplcXVpcC1jbXAtc2VsZWN0LWhlbHBgKSwgdGhlIG1vZCBtYW5hZ2VyJ3MgZm91ciBsaXN0aW5ncyAoYGNvcmU6bW9kLXVwZGF0ZXNgLCBgY29yZTptb2QtYXV0by1zb3J0YCwgYGNvcmU6bW9kLWNhcGFiaWxpdGllc2AsIGBjb3JlOm1vZC1jb25mbGljdHNgKSwgdGhlIGhhbGwgb2YgZmFtZSAoYGNvcmU6aGFsbC1vZi1mYW1lYCksIHRoZSBrbm93bGVkZ2UgbWVudSdzIHN0b3JlIHZpZXcgKGBjb3JlOnN0b3JlLWtub3dsZWRnZWApLCB0aGUgdXBkYXRlIGFuZCByZXBvcnQgcGFnZXMgKGBjb3JlOnVwZGF0ZWAsIGBjb3JlOnJlcG9ydGApLCBhbmQgd2l6YXJkIG1vZGUncyB0d28gZGVidWcgcmVhZG91dHMgKGBjb3JlOndpemFyZC1rZXlsb2dgLCBgY29yZTp3aXphcmQtaXRlbWApLiBFdmVyeXRoaW5nIGVsc2UgYXJyaXZlcyB1bmRlciB0aGUgc2hhcmVkIGlkIGBjb3JlOnRleHRgIHdpdGggYSBzaW5nbGUgYGxpbmVzYCBibG9jayBvZiBwcmUtd3JhcHBlZCByb3dzLCB3aGljaCBpcyBlbm91Z2ggdG8gcmVza2luIGEgZnJhbWUgYnV0IG5vdCB0byByZWltYWdpbmUgYSBsaXN0aW5nLCBzbyBjaGVjayBgdmlldy5pZGAuCgpNb3N0IG9mIHdoYXQgcmVtYWlucyB1bmRlciBgY29yZTp0ZXh0YCBpcyBwcm9zZS4gT2YgdGhlIHRoaXJ0eS10d28gYHNob3dUZXh0U2NyZWVuYCBjYWxsIHNpdGVzIGluIHRoZSBtb2QgbWFuYWdlciBhcyBvZiBBdWd1c3QgMjAyNiwgdHdlbnR5LWZvdXIgc2hvdyBwcm9zZTogd2FybmluZ3MsIG91dGNvbWUgcmVwb3J0cywgZXJyb3IgZXhwbGFuYXRpb25zIGFuZCBhIG1vZCBhdXRob3IncyBvd24gZGVzY3JpcHRpb24sIHdoaWNoIGEgcHJlc2VudGVyIGdhaW5zIG5vdGhpbmcgYnkgYWRkcmVzc2luZyBmaWVsZCBieSBmaWVsZC4gVGhlIHNjcmVlbnMgdGhhdCBzdGlsbCBuZWVkIGEgbW9kZWwgYXJlIGxpc3RlZCBpbiBgTU9EX1JFQUNILm1kYCBnYXAgMjE6IHRoZSBzcGVsbCBsaXN0cywgd2hpY2ggYmVsb25nIHRvIHRoZSBtZW51IHNlYW0sIGFuZCB0aGUgaW5zdGFsbC1yZWZ1c2FsIHNjcmVlbnMsIHdoaWNoIHRoZSBtb2RlbCBjYW4gbm93IHJlcHJlc2VudCBidXQgd2hpY2ggYXJlIG5vdCB5ZXQgd2lyZWQgdG8gaXQgKHNlZSB0aGUgbmV4dCBzZWN0aW9uKS4KCiMjIyBSZWdpb25zIGFyZSBzdGFja2VkLCBhbmQgYSBzY3JlZW4gaXMgb25lIG9mIHRoZW0KCmB1aS1zdGFjay50c2AgaG9sZHMgdGhlIGxpdmUgc3RhY2suIGBwdXNoUmVnaW9uYCBhZGRzIGEgcmVnaW9uLCB0aGUgcmV0dXJuZWQKaGFuZGxlJ3MgYHJlbGVhc2UoKWAgcmVtb3ZlcyBpdCwgYHJlbGF5b3V0U3RhY2tgIHJlLXBsYWNlcyBldmVyeSByZWdpb24gd2hlbiB0aGUKdGVybWluYWwgY2hhbmdlcyBzaGFwZSwgYW5kIGBwYWludFJlZ2lvblN0YWNrYCBkcmF3cyB0aGUgb25lcyB0aGF0IHdhbnQgYQpwYWludGVyLCBib3R0b20gYmFuZCB0byB0b3AsIGVhY2ggdGhyb3VnaCBhIHN1cmZhY2UgY2xpcHBlZCB0byBpdHMgb3duCnJlY3RhbmdsZS4KCmBwbGFjZShncmlkKWAgaXMgY2FsbGVkIG9uIGV2ZXJ5IGxheW91dCBjaGFuZ2UsIHNvIGl0cyBjb250cmFjdCBpcyBuYXJyb3c6IHJldHVybiBhIHJlY3RhbmdsZSBhbmQgZG8gbm8gd29yay4gRG8gbm90IHBhaW50IGluIGl0LCByZWFkIHRoZSBnYW1lIGluIGl0LCBvciB0aHJvdyBmcm9tIGl0LCBiZWNhdXNlIGEgcmVzaXplIGNhbiBhcnJpdmUgYmV0d2VlbiBhbnkgdHdvIGtleXN0cm9rZXMuIEl0IHJ1bnMgaW5zaWRlIGEgdHJ5L2NhdGNoIHNvIG9uZSBhdXRob3IncyBtaXN0YWtlIGNhbm5vdCBicmVhayB0aGUgcmVsYXlvdXQgZm9yIGV2ZXJ5IG90aGVyIHJlZ2lvbiwgYW5kIGEgcmVnaW9uIHdob3NlIGBwbGFjZSgpYCB0aHJvd3Mgb3Igd2hvc2UgcmVjdGFuZ2xlIHJ1bnMgb2ZmIHRoZSBncmlkIGlzIHJlY29yZGVkIGluIGByZWdpb25TdGFja0ZhdWx0cygpYCBpbnN0ZWFkIG9mIGJlaW5nIHNpbGVudGx5IG9taXR0ZWQsIHdoaWNoIHdvdWxkIGxlYXZlIGEgbWlzc2luZyB3aW5kb3cgd2l0aCBub3RoaW5nIHRvIHNlYXJjaCBmb3IuCgpgcGFpbnQoc3VyZmFjZSlgIGlzIG9wdGlvbmFsLCBhbmQgY29yZSB1c3VhbGx5IGxlYXZlcyBpdCBvdXQ6IGEgc2NyZWVuIHRoYXQgb3ducyB0aGUga2V5Ym9hcmQgcmVwYWludHMgaXRzZWxmIHdoZW4gYSBrZXkgYXJyaXZlcy4gR2l2ZSB5b3VyIHJlZ2lvbiBhIHBhaW50ZXIgd2hlbiB5b3Ugd2FudCBpdCByZWRyYXduIGV2ZXJ5IGZyYW1lLCBzdWNoIGFzIGEgSFVEIHdpbmRvdyBvdmVyIGEgbGl2ZSBtYXAuCgpBIGNvcmUgc2NyZWVuIG9jY3VwaWVzIGBjb3JlOnNjcmVlbmAgb24gdGhlIGBtb2RhbGAgYmFuZCwgYW5kIGl0cyByZWN0YW5nbGUgaXMgdGhlIHdob2xlIHRlcm1pbmFsLCBwZXJtYW5lbnRseS4gQSBtb2QgdGhhdCB3YW50cyBhIHBhbmVsIGRlY2xhcmVzIGl0cyBvd24gcmVnaW9uIGluc3RlYWQgb2YgYXNraW5nIGNvcmUgdG8gbWFrZSByb29tLCBiZWNhdXNlIHNocmlua2luZyBjb3JlJ3Mgc2NyZWVucyB3b3VsZCBtb3ZlIHBpY3R1cmVzIHRoYXQgdXBzdHJlYW0tY2l0ZWQgcGFyaXR5IHRlc3RzIHBpbiBieXRlIGZvciBieXRlLCBhbmQgbm8gbW9kIHdvdWxkIGdhaW4gZnJvbSBpdC4gVG8gZmluZCBvdXQgd2hldGhlciBhbnl0aGluZyBpcyBvdmVyIHRoZSBtYXAgYmVmb3JlIHlvdSBkcmF3IG9uIGl0LCByZWFkIGBmcmFtZS5zdGFja2A7IHNlZSBbS25vd2luZyB3aGVuIHlvdSBhcmUgY292ZXJlZF0oI2tub3dpbmctd2hlbi15b3UtYXJlLWNvdmVyZWQtZnJhbWVzdGFjaykuIENvcmUncyBvd24gdmVyc2lvbiBvZiB0aGF0IGNoZWNrIGlzIGBvY2NsdWRlcnNPZmAgKGBwYWNrYWdlcy93ZWIvc3JjL3JlZ2lvbnMudHNgKSwgd2hpY2ggaXMgaG9zdC1pbnRlcm5hbCBhbmQgcmV0dXJucyBgdW5kZWZpbmVkYCwgbm90IGBbXWAsIHdoZW4geW91IG5hbWUgYSByZWdpb24gdGhhdCBpcyBub3QgaW4gdGhlIHN0YWNrLCBzbyBhIHR5cG8gc2hvd3MgdXAgYXMgYSBxdWVzdGlvbiB3aXRoIG5vIGFuc3dlciBpbnN0ZWFkIG9mIGFzIGdvb2QgbmV3cy4gS2VlcCB0aGF0IGRpc3RpbmN0aW9uIGluIHlvdXIgb3duIGNvcHkuCgojIyMgU3RhbmRpbmcgYXNpZGUgZm9yIHRoZSBnYW1lJ3Mgb3duIHByb21wdAoKQSBzY3JlZW4ncyBgYWN0aW9uc2AgYXJlIHRoZSBnYW1lJ3Mgb3duIGNvbW1hbmRzLCBhbmQgc29tZSBvZiB0aGVtIGFzayB0aGUgcGxheWVyIGEgcXVlc3Rpb24gb24gdGhlIGZhaXRoZnVsIHRlcm1pbmFsIHVuZGVybmVhdGggeW91ciBvdmVybGF5LiBUaGUgY2hhcmFjdGVyIHNoZWV0J3MgYGNgIChyZW5hbWUpIG9wZW5zIGEgbmFtZSBwcm9tcHQsIGFuZCBpdHMgYGZgIChkdW1wIHRvIGZpbGUpIGFza3MgZm9yIGEgZmlsZW5hbWUuIElmIHlvdXIgb3ZlcmxheSBrZWVwcyBkcmF3aW5nLCB0aGUgcGxheWVyIGlzIGFuc3dlcmluZyBhIHF1ZXN0aW9uIHRoZXkgY2Fubm90IHNlZSwgYW5kIGJlY2F1c2UgdGhlIHJlbmFtZSByZWFjaGVzIGBwZXJzaXN0U2F2ZSgpYCwgdHdvIGtleXN0cm9rZXMgKGBjYCB0aGVuIEVudGVyKSBvbmNlIHdyb3RlIHRoZSBzYXZlIHdpdGggbm90aGluZyB2aXNpYmxlIG9uIHNjcmVlbiBhdCBhbGwuIEVzY2FwZSB3YXMgdGhlIG9ubHkga2V5IHRoYXQgZ290IG91dCB3aXRob3V0IHdyaXRpbmcgaXQuCgpGb3JiaWRkaW5nIHByb21wdHMgaW5zaWRlIGBTY3JlZW5Ib3N0Lmludm9rZWAgd291bGQgbWFrZSB0aGUgYWN0aW9ucyBhIG1vZCBjYW4gb2ZmZXIgYSBzdHJpY3Qgc3Vic2V0IG9mIHRoZSBnYW1lJ3MsIHdoaWNoIGRlZmVhdHMgdGhlIHB1cnBvc2Ugb2YgdGhlIHNlYW0uIFRoZSBnYW1lIGFubm91bmNlcyB0aGUgcHJvbXB0IGJlZm9yZSBpdCBsYW5kcyBpbnN0ZWFkOiBhIHByZXNlbnRlciB0aGF0IGNhbiBzdGFuZCBhc2lkZSBpcyB0b2xkIHdoYXQgaXMgY29taW5nLCBhd2FpdGVkIHdoaWxlIGl0IGFuaW1hdGVzIG91dCwgYW5kIGdpdmVuIGl0cyBzY3JlZW4gYmFjayBhZnRlcndhcmRzLgoKICAgIHNob3codmlldywgaG9zdCkgewogICAgICByZXR1cm4gewogICAgICAgIGRpc21pc3NlZCwKICAgICAgICB5aWVsZFRlcm1pbmFsKHJlcXVlc3QpIHsKICAgICAgICAgIC8vIHJlcXVlc3Q6IGEgUHJvbXB0UmVxdWVzdCB3aGlsZSB0aGUgZ2FtZSBuZWVkcyB0aGUgdGVybWluYWwsCiAgICAgICAgICAvLyAgICAgICAgICBudWxsIHdoZW4geW91IGNhbiB0YWtlIGl0IGJhY2suCiAgICAgICAgICBjYW52YXMuc3R5bGUuZGlzcGxheSA9IHJlcXVlc3QgPT09IG51bGwgPyAiYmxvY2siIDogIm5vbmUiOwogICAgICAgIH0sCiAgICAgIH07CiAgICB9CgpUaGUgcmVxdWVzdCBzYXlzIHdoYXQgaXMgYmVpbmcgYXNrZWQgKGBsYWJlbGApLCB3aGljaCBvZiB5b3VyIGBhY3Rpb25zYCBsZWQgdGhlcmUKKGBhY3Rpb25gKSwgYSBzdGFibGUgaWRlbnRpdHkgeW91IGNhbiBtYXRjaCBvbiB3aXRob3V0IHBhcnNpbmcgcHJvc2UgKGBpZGAsIGUuZy4KYCJjaGFyc2hlZXQ6cmVuYW1lImApLCBob3cgbXVjaCBvZiB0aGUgdGVybWluYWwgaXQgbmVlZHMgKGBleHRlbnRgOiBgImxpbmUiYCBmb3IgYQpyb3ctMCBwcm9tcHQsIGAic2NyZWVuImAgZm9yIG9uZSB0aGF0IGNsZWFycyB0aGUgZ3JpZCkgYW5kIHRoZSByZWN0YW5nbGUgaXQgd2lsbApsYW5kIGluIChgY2xpcGApLiBBIGAibGluZSJgIHByb21wdCBvbmx5IG5lZWRzIHJvdyAwLCBzbyB5b3UgbWF5IGtlZXAgZHJhd2luZwpldmVyeXRoaW5nIGJlbG93IGl0LgoKV2hhdGV2ZXIgeW91IHJldHVybiBpcyBhd2FpdGVkLCBzbyBhIGZhZGUtb3V0IHdvcmtzLCBhbmQgdGhlIHByb21wdCBkb2VzIG5vdCBsYW5kIHVudGlsIGl0IGZpbmlzaGVzLiBUaGVyZSBpcyBubyB0aW1lb3V0LgoKYHlpZWxkVGVybWluYWxgIGlzIG9wdGlvbmFsLiBMZWF2aW5nIGl0IG91dCBpcyBub3QgYW4gZXJyb3IsIGJ1dCBpdCBpcyByZXBvcnRlZCBvbmNlIGJ5IG5hbWUsIHdpdGggdGhlIG1lbWJlciB0byBhZGQgc3BlbGxlZCBvdXQsIGFuZCB0aGUgZ2FtZSBkcmF3cyBpdHMgcHJvbXB0IG92ZXIgeW91ciBzY3JlZW4gYW55d2F5LiBUaGUgY29tbWFuZCBhbHdheXMgcnVucywgc28geW91ciBhY3Rpb25zIGFyZSBuZXZlciBhIHNtYWxsZXIgc2V0IHRoYW4gdGhlIGdhbWUncy4KCkl0IGlzIG9uIHRoZSBwdWJsaXNoZWQgdHlwZSBpbiBib3RoIGNvcGllczogYFNjcmVlblNob3duYCBpbiB0aGUgaG9zdCdzIGBwYWNrYWdlcy93ZWIvc3JjL3NjcmVlbi12aWV3LnRzYCBhbmQgaW4gdGhlIFNESydzIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zY3JlZW4udHNgLCB0b2dldGhlciB3aXRoIHRoZSB0eXBlcyB0aGF0IGRlc2NyaWJlIHRoZSBhbm5vdW5jZW1lbnQsIGBQcm9tcHRSZXF1ZXN0YCBhbmQgYFByb21wdEV4dGVudGAuIEZvciBUeXBlU2NyaXB0LCBpbXBvcnQgYWxsIHRocmVlIHR5cGUtb25seSBmcm9tIHRoZSBTREssIHdoaWNoIHRoZSBidWlsZCBlcmFzZXMgbGlrZSBhbnkgb3RoZXIgdHlwZSBpbXBvcnQ6CgpgYGB0cwppbXBvcnQgdHlwZSB7CiAgUHJvbXB0UmVxdWVzdCwKICBTY3JlZW5QcmVzZW50ZXIsCiAgU2NyZWVuU2hvd24sCn0gZnJvbSAiQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNkayI7CmBgYAoKVW50aWwgMjAyNi0wOC0xNCB0aGUgbWVtYmVyIHdhcyBkZWNsYXJlZCBvbmx5IG9uIGEgaG9zdC1sb2NhbCBgWWllbGRpbmdTY3JlZW5gLCBhbmQgdGhlIG1lY2hhbmlzbSB3b3JrZWQgYW55d2F5LCB3aGljaCBtYWRlIHRoZSBnYXAgZWFzeSB0byBtaXNzLiBBbiB1bnB1Ymxpc2hlZCBtZW1iZXIgZG9lcyBub3Qgc3RvcCBhIG1vZCBpbXBsZW1lbnRpbmcgaXQ6IGB0c2NgIGFjY2VwdHMgYHNob3c6ICgpID0+ICh7IGRpc21pc3NlZCwgeWllbGRUZXJtaW5hbCB9KWAgYWdhaW5zdCBhIGBTY3JlZW5TaG93biB8IHVuZGVmaW5lZGAgcmV0dXJuIHdpdGggbm8gY2FzdCBhbmQgbm8gZXhjZXNzLXByb3BlcnR5IGVycm9yLiBXaGF0IGl0IHByZXZlbnRzIGlzIGZpbmRpbmcgb3V0IHRoYXQgdGhlIG1lbWJlciBleGlzdHMsIGFuZCBnZXR0aW5nIGFuIGVycm9yIHdoZW4geW91IGdldCBpdCB3cm9uZzogYHlpZWxkVGVybWluYWwocmVxdWVzdDogc3RyaW5nKWAgY29tcGlsZWQsIGFuZCB3YXMgaGFuZGVkIGEgYFByb21wdFJlcXVlc3RgIGF0IHJ1bnRpbWUuCgpgcGFja2FnZXMvbW9kLXNkay9zcmMvc2NyZWVuLWFiaS1hZ3JlZW1lbnQudGVzdC50c2Aga2VlcHMgdGhlIHR3byBjb3BpZXMgaW4gYWdyZWVtZW50OiB0aGUgbWVtYmVyIGxpc3QsIGB5aWVsZFRlcm1pbmFsYCdzIHNpZ25hdHVyZSBjaGFyYWN0ZXIgZm9yIGNoYXJhY3RlciwgdGhlIGRvYy1jb21tZW50IHNlbnRlbmNlIHRoYXQgZGVzY3JpYmVzIGl0LCBhbmQgYFByb21wdFJlcXVlc3RgJ3Mgb3duIGZpZWxkIGxpc3QgYW5kIHR5cGVzLiBJdCByZWFkcyBib3RoIHNvdXJjZSBmaWxlcywgYmVjYXVzZSBpbXBvcnRpbmcgYm90aCB0eXBlcyB3b3VsZCBwcm92ZSBub3RoaW5nOiB0d28gc3RydWN0dXJhbGx5IGlkZW50aWNhbCBpbnRlcmZhY2VzIGFyZSBvbmUgdHlwZSB0byB0aGUgY29tcGlsZXIsIHdoaWNoIGlzIHRoZSBzYW1lIGJsaW5kIHNwb3QgdGhhdCBsZXQgdGhlIG1lbWJlciBzaGlwIHVucHVibGlzaGVkLgoKRXZlcnkgYWN0aW9uIGluIHRoZSBgU0NSRUVOX1BST01QVFNgIGNlbnN1cyBpcyBhbm5vdW5jZWQuIGBjaGFyc2hlZXQudHNgIGNvdmVycyBgY29yZTpjaGFyYWN0ZXJgIGFuZCBgY29yZTpjaGFyYWN0ZXItZmxhZ3NgIChgcmVuYW1lYCwgYGZpbGVgKTsgYG1haW4udHNgIGNvdmVycyBgY29yZTpyZXBvcnRgJ3MgYGRlc2NyaWJlYCBhbmQgYGNvcmU6dXBkYXRlYCdzIGBtb2RzYC4gVGhlIGBtb2RzYCBhY3Rpb24gb3BlbnMgYSB3aG9sZSBuZXN0ZWQgcGFnZSAoYHNob3dNb2RVcGdyYWRlc2ApIHdob3NlIG93biBzY3JlZW5zIHdvdWxkIGNvbWUgYmFjayByb3VuZCB0byB0aGUgcHJlc2VudGVyIHRoYXQgaXMgYWxyZWFkeSBob2xkaW5nIGBjb3JlOnVwZGF0ZWAuIFdoaWxlIHlvdSBhcmUgc3RhbmRpbmcgYXNpZGUgeW91IGFyZSBub3Qgb2ZmZXJlZCB0aGVtOyB0aGUgZ2FtZSBzaG93cyB0aG9zZSBpdHNlbGYsIGJlY2F1c2Ugb2ZmZXJpbmcgdGhlbSB3b3VsZCBhc2sgeW91IHRvIGRyYXcgb3ZlciB0aGUgdGVybWluYWwgeW91IGp1c3QgY2xlYXJlZC4KCiMjIyBBIHJvdyB3aXRoIGEgcGFyYWdyYXBoCgpgU2NyZWVuUm93LmRldGFpbGAgaXMgcHJvc2UgYXR0YWNoZWQgdG8gb25lIHJvdyBvZiBhIHRhYmxlLiBJdCBpcyBhCmBTY3JlZW5Qcm9zZWAsIHRoZSBzYW1lIGB7IHBhcmFncmFwaHMsIGluZGVudD8sIHdyYXA/LCBmbG93PywgY29sb3I/IH1gIGEKYHRleHRgIGJsb2NrIGlzIG1hZGUgb2YsIHNvIGEgcHJlc2VudGVyIHRoYXQgY2FuIGFscmVhZHkgZHJhdyBhIHByb3NlIGJsb2NrIGNhbgpkcmF3IGEgZGV0YWlsLCBhbmQgb25lIHRoYXQgb25seSB3YW50cyB0aGUgcmVjb3JkIGNhbiBpZ25vcmUgaXQuCgpUaGUgcnVsZSBmb3IgdGVsbGluZyB0aGUgdHdvIGFwYXJ0IGlzIHVuY2hhbmdlZCwgYW5kIGl0IGV4cGxhaW5zIHRoZSBzaGFwZSBvZiBgZGV0YWlsYDogc3RydWN0dXJlIGlzIHdoYXQgaGFzIGtleXMsIGFuZCBwcm9zZSBpcyB3aGF0IGhhcyBwYXJhZ3JhcGhzLiBBbnl0aGluZyB5b3UgbmVlZCB0byByZWFjaCBieSBuYW1lIGlzIGEgY2VsbCwgYWRkcmVzc2VkIGJ5IGl0cyBjb2x1bW4ga2V5LiBBIGRldGFpbCBoYXMgbm8ga2V5IGFuZCBjYW5ub3QgYmUgYWRkcmVzc2VkLiBJZiB5b3UgZmluZCB5b3Vyc2VsZiBwYXJzaW5nIG9uZSwgd2hhdCB5b3UgYXJlIHBhcnNpbmcgaXMgYSBjb2x1bW4gdGhlIHNjcmVlbiBoYXMgbm90IGRlY2xhcmVkIHlldCwgc28gcmVwb3J0IGl0IGFzIGEgYnVnIGluc3RlYWQgb2Ygc3BsaXR0aW5nIHRoZSBzdHJpbmcuIFRoZSBpZHMgYmVoaW5kIGEgZGVwZW5kZW5jeSBjeWNsZSBsaWtlIGBBIC0+IEIgLT4gQWAgYXJlIG9uIGBzZW1hbnRpYy5kYXRhYCwgd2hlcmUgYGF1dG9Tb3J0U2NyZWVuYCBhbHJlYWR5IHB1dHMgdGhlbS4KCkEgZGV0YWlsIG5ldmVyIGFmZmVjdHMgbGF5b3V0IGJleW9uZCBpdHMgb3duIHJvdy4gSXQgaXMgbm90IGNvbnN1bHRlZCB3aGVuIGNvbHVtbiB3aWR0aHMgYXJlIGNvbXB1dGVkLCBzbyBhIGxvbmcgcGFyYWdyYXBoIGNhbm5vdCB3aWRlbiBhIGNvbHVtbiBvciBtb3ZlIHRoZSByb3cgYWJvdmUgaXQsIGFuZCBhIHJvdyB3aXRob3V0IGEgZGV0YWlsIGlzIGxhaWQgb3V0IHRoZSBzYW1lIHdoZXRoZXIgb3Igbm90IGl0cyBuZWlnaGJvdXJzIGhhdmUgb25lLiBJdCBhZGRzIG5vIHRoaXJkIHdyYXBwaW5nIHJ1bGUgZWl0aGVyOiBpdCBpcyBsYWlkIG91dCBieSB0aGUgc2FtZSBmdW5jdGlvbiBhcyBhIGB0ZXh0YCBibG9jaywgYW5kIGNob29zZXMgYmV0d2VlbiBBbmdiYW5kJ3MgdHdvIGFsZ29yaXRobXMgdGhyb3VnaCB0aGUgc2FtZSBgZmxvd2AgZmllbGQuCgpUaHJlZSBzY3JlZW5zIG5lZWRlZCB0aGlzOiB0aGUgaW5zdGFsbCByZWZ1c2FsLCBhIGRyb3BwZWQgYXV0by1zb3J0IHN1Z2dlc3Rpb24sIGFuZCBhIGRlY2xhcmVkLWNvbmZsaWN0IGNsYWltLiBFYWNoIGlzIGEgcmVjb3JkIHdpdGggYSBwYXJhZ3JhcGggYXR0YWNoZWQsIGFuZCB0aGV5IGhhZCBiZWVuIHN0dWNrIGF0IGBsaW5lc2AgYmVjYXVzZSB0aGVyZSB3YXMgbm93aGVyZSB0byBwdXQgdGhlIHBhcmFncmFwaC4gQ3V0dGluZyB0aGUgcGFyYWdyYXBoIGludG8gcm93IGZyYWdtZW50cyB3b3VsZCBoYXZlIGxlZnQgdGhlbSBhcyBgbGluZXNgIGluIGFsbCBidXQgbmFtZSwgc2luY2UgYSBwcmVzZW50ZXIgd291bGQgc3RpbGwgaGF2ZSBoYWQgdG8ga25vdyB0aGF0IHNvbWUgcm93cyBjb250aW51ZSBvdGhlcnMuCgpUaGUgc2V2ZW4gcmVjYWxsIHBhZ2VzIGFyZSBhbGwgYHRleHRgIGJsb2NrcywgYW5kIHRoZXkgaGF2ZSBzZXZlbiBpZHMgaW5zdGVhZCBvZiBvbmUgc28gdGhhdCBhIG1vZCBjYW4gdGVsbCB0aGVtIGFwYXJ0LCBmb3IgZXhhbXBsZSB0byBkcmF3IGFuIGFydGlmYWN0J3MgcGFnZSBhcyBhIHBsYXF1ZSBhbmQgYSB0cmFwJ3MgYXMgYSB3YXJuaW5nIGNhcmQuIElmIHlvdSBvbmx5IHdhbnQgdG8gcmVzdHlsZSBwcm9zZSwgbWF0Y2ggb24gYWxsIHNldmVuIChvciBvbiBgYmxvY2sua2luZCA9PT0gInRleHQiYCk7IG5vdGhpbmcgaW4gYSBwcm9zZSBwYW5lbCBuZWVkcyB0byBrbm93IHdoaWNoIG9uZSBpdCBoYXMuCgpUaGUgcGxheWVyIGRpc21pc3NlcyBhIHNjcmVlbiBpbnN0ZWFkIG9mIGFuc3dlcmluZyBpdCwgd2hpY2ggaXMgdGhlIG9uZSBkaWZmZXJlbmNlIGluIHNoYXBlIGZyb20gYG1lbnVgLiBgc2hvd2AgZGVjbGluZXMgYnkgcmV0dXJuaW5nIGB1bmRlZmluZWRgIHN5bmNocm9ub3VzbHksIGFuZCB0YWtlcyB0aGUgc2NyZWVuIGJ5IHJldHVybmluZyBgeyBkaXNtaXNzZWQgfWAsIGEgcHJvbWlzZSB5b3UgcmVzb2x2ZSB3aGVuIHRoZSBwbGF5ZXIgY2xvc2VzIGl0LiBPbmNlIHRoZSBwcm9taXNlIG1lYW5zICJ0aGV5IGNsb3NlZCBpdCIsIHRoZXJlIGlzIG5vIGFuc3dlciB2YWx1ZSBsZWZ0IHRvIGRlY2xpbmUgd2l0aCwgYW5kIHRoZSBkZWNpc2lvbiBuZXZlciBuZWVkcyB0byBiZSBhc3luYyBhbnl3YXksIHNpbmNlIHlvdSBtYXRjaCBvbiBgdmlldy5pZGAuIFJlc29sdmluZyBgZGlzbWlzc2VkYCBpcyB0aGUgd2hvbGUgY29udHJhY3Q6IGlmIHlvdXIgcHJlc2VudGVyIG5ldmVyIHJlc29sdmVzIGl0LCB0aGUgcGxheWVyIGNhbm5vdCBnZXQgYmFjayB0byB0aGUgZ2FtZS4KClNvbWUgc2NyZWVucyBjYW4gYmUgYWN0ZWQgb24sIGFuZCB0aG9zZSBnaXZlIHlvdSBhIHdheSBiYWNrIGludG8gdGhlIGdhbWUuIE1vc3Qgc2NyZWVucyBhcmUgb25seSBkaXNtaXNzZWQsIGJ1dCB0aGUgY2hhcmFjdGVyIHNoZWV0IGFsc28gb2ZmZXJzIHJlbmFtaW5nLCBhIGNoYXJhY3RlciBkdW1wIGFuZCB0aGUgcGFnZSBjeWNsZSBmcm9tIHRoZSBzYW1lIG1vZGFsLCBhcyB1cHN0cmVhbSBkb2VzLCBhbmQgYSBwcmVzZW50ZXIgdGhhdCB0b29rIHRoZSBzaGVldCB3aXRob3V0IHJlYWNoaW5nIHRob3NlIHdvdWxkIHF1aWV0bHkgdGFrZSB0aGUgY29tbWFuZHMgYXdheSBmcm9tIHRoZSBwbGF5ZXIuIFRoZSB2aXNpYmxlLW1vbnN0ZXIgbGlzdCBoYXMgYSBzaW5nbGUgYWN0aW9uLCBgc29ydC1leHBgIChgeGApLCB3aGljaCBmbGlwcyB0aGUgc29ydCBiZXR3ZWVuIGRlcHRoIGFuZCBleHBlcmllbmNlLiBgdmlldy5hY3Rpb25zYCBwdWJsaXNoZXMgdGhlc2UgYXMgZGF0YTogYSBzdGFibGUgYGlkYCAoYHJlbmFtZWAsIGBmaWxlYCwgYHBhZ2UtbmV4dGAsIGBwYWdlLXByZXZgKSwgdGhlIGBrZXlgIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCBsaXN0ZW5zIGZvciwgYW5kIHRoZSBnYW1lJ3Mgb3duIGBsYWJlbGAuIGBzaG93KHZpZXcsIGhvc3QpYCBoYW5kcyB5b3UgYSBgU2NyZWVuSG9zdGAgd2hvc2UgYGludm9rZShpZClgIHJ1bnMgb25lLgoKYGBganMKc2hvdyh2aWV3LCBob3N0KSB7CiAgaWYgKHZpZXcuaWQgIT09ICJjb3JlOmNoYXJhY3RlciIpIHJldHVybiB1bmRlZmluZWQ7CiAgbGV0IHNob3duID0gdmlldzsKICBjb25zdCBvbktleSA9IChldikgPT4gewogICAgY29uc3QgYWN0aW9uID0gc2hvd24uYWN0aW9ucyAmJiBzaG93bi5hY3Rpb25zLmZpbmQoKGEpID0+IGEua2V5ID09PSBldi5rZXkpOwogICAgaWYgKCFhY3Rpb24pIHJldHVybjsKICAgIGhvc3QuaW52b2tlKGFjdGlvbi5pZCkudGhlbigobmV4dCkgPT4gewogICAgICBpZiAoIW5leHQpIHJldHVybiBjbG9zZSgpOyAgIC8vIHRoZSBnYW1lIGhhcyB0YWtlbiB0aGUgc2NyZWVuIGJhY2sKICAgICAgc2hvd24gPSBuZXh0OyAgICAgICAgICAgICAgICAvLyB0aGUgc2FtZSBzaGVldCByZW5hbWVkLCBvciB0aGUgb3RoZXIgcGFnZQogICAgICBwYWludChzaG93bik7CiAgICB9KTsKICB9OwogIC4uLgp9CmBgYAoKYGludm9rZWAgcnVucyB0aGUgZ2FtZSdzIGNvZGUgKGEgcmVuYW1lIHN0aWxsIG9wZW5zIHRoZSBnYW1lJ3MgcHJvbXB0LCBhbmQgYSBkdW1wIHN0aWxsIHdyaXRlcyB0aGUgZ2FtZSdzIGZpbGUpIGFuZCByZXNvbHZlcyB3aXRoIHdoYXQgdGhlIHBsYXllciBzaG91bGQgc2VlIG5leHQ6IHVzdWFsbHkgdGhlIHNhbWUgc2NyZWVuIHdpdGggbmV3IGNvbnRlbnQsIG9yIHRoZSBuZXh0IHBhZ2UuIGB1bmRlZmluZWRgIG1lYW5zIHRoZSBnYW1lIGhhcyB0YWtlbiB0aGUgc2NyZWVuIGJhY2s7IHJlc29sdmUgYGRpc21pc3NlZGAgd2hlbiB5b3Ugc2VlIGl0LiBBbiBpZCB0aGlzIGVuZ2luZSBkb2VzIG5vdCBrbm93IGlzIGEgbm8tb3AgdGhhdCBoYW5kcyB0aGUgY3VycmVudCB2aWV3IGJhY2ssIHNvIGFza2luZyBmb3IgYSBuZXdlciBjb21tYW5kIGNhbiBuZXZlciBjbG9zZSB0aGUgcGxheWVyJ3Mgc2NyZWVuLiBgaG9zdGAgYXJyaXZlcyBvbmx5IHdoZXJlIGBhY3Rpb25zYCBkb2VzLCBhbmQgaXQgaXMgYSBzZWNvbmQgcGFyYW1ldGVyIGluc3RlYWQgb2YgYSBmaWVsZCBvZiB0aGUgdmlldyBiZWNhdXNlIGEgdmlldyBpcyBmcm96ZW4gZGF0YSBhbmQgYSB3YXkgYmFjayBpbnRvIHRoZSBnYW1lIGNhbm5vdCBiZS4KClRocm93aW5nIGNvc3RzIHlvdSB0aGUgc2VhbSBmb3IgdGhlIHNlc3Npb24sIGFzIHdpdGggYG1lbnVgLiBJZiB5b3UgdGhyb3cgd2hpbGUgYSBzY3JlZW4gaXMgb3Blbiwgb3IgcmVqZWN0IGBkaXNtaXNzZWRgLCB0aGUgZ2FtZSByZXBvcnRzIHlvdXIgbW9kIGJ5IG5hbWUgYW5kIHNob3dzIHRoZSBzY3JlZW4gaXRzZWxmLCBzbyB0aGUgcGxheWVyIGlzIG5ldmVyIGxlZnQgc3RhcmluZyBhdCBhIGRlYWQgb3ZlcmxheSB3aXRoIG5vIHdheSBvdXQuIFRoYXQgcmVjb3ZlcnkgZXhpc3RzIHNvIGEgYnVnIGRvZXMgbm90IGNvc3QgYSBjaGFyYWN0ZXI7IGRvIG5vdCByZWx5IG9uIGl0IGFzIG5vcm1hbCBiZWhhdmlvdXIuCgoqKkEgc2NyZWVuIGhhcyBubyBwdWJsaXNoZWQgcmVnaW9uIGVpdGhlci4qKiBJdCBjb3ZlcnMgdGhlIHdpbmRvdywgZm9yIHRoZSBzYW1lCnJlYXNvbiBhIGZsb2F0aW5nIG1lbnUgZG9lcy4KCmBzYW1wbGVzL3Nwcml0ZS1pbnZlbnRvcnkvYCBpcyBhIGNvbXBsZXRlIHdvcmtlZCBleGFtcGxlOiBpdCBkcmF3cyB0aGUgaW52ZW50b3J5LAp0aGUgZXF1aXBtZW50IGFuZCB0aGUgcXVpdmVyIGFzIGl0ZW0gY2FyZHMsIGxheXMgdGhlIHJlY2FsbCBwYWdlcyBvdXQgaW50byBhCnBhbmVsIG9mIGl0cyBvd24gd2lkdGggYnkgbWVhc3VyaW5nIHRoZW0sIGFuZCBkZWNsaW5lcyBldmVyeSBvdGhlciBzY3JlZW4uCgojIyBgYmlydGgoY3R4KWA6IHJ1biBjaGFyYWN0ZXIgY3JlYXRpb24geW91ciBvd24gd2F5CgpgYmlydGgoY3R4KWAgaGFuZHMgYSBtb2QgY2hhcmFjdGVyIGNyZWF0aW9uLCBmcm9tIHRoZSByYWNlIGNob2ljZSB0byB0aGUgc3RhcnQgb2YgcGxheS4gSXQgbmVlZHMgYHVpOmJpcnRoLnJlcGxhY2VgIChvciBgdWk6Ki5yZXBsYWNlYCkuCgpgYGBqcwpiaXJ0aChjdHgpIHsKICByZXR1cm4gewogICAgc2hvdyhzZXNzaW9uKSB7CiAgICAgIGNvbnN0IHsgcmFjZXMsIGNsYXNzZXMgfSA9IHNlc3Npb24uY2F0YWxvZ3VlKCk7CiAgICAgIG9wZW5XaXphcmQoewogICAgICAgIHJhY2VzLAogICAgICAgIGNsYXNzZXMsCiAgICAgICAgZHJhZnQ6ICgpID0+IHNlc3Npb24uZHJhZnQoKSwgICAgICAgIC8vIHN0YXRzLCBuYW1lLCBiYWNrZ3JvdW5kLCBwcmV2aWV3CiAgICAgICAgcGljazogKHJhY2UsIGNscykgPT4geyBzZXNzaW9uLmNob29zZVJhY2UocmFjZSk7IHNlc3Npb24uY2hvb3NlQ2xhc3MoY2xzKTsgfSwKICAgICAgICBidXk6IChzdGF0KSA9PiBzZXNzaW9uLmJ1eShzdGF0KSwKICAgICAgICBzdGFydDogKCkgPT4gc2Vzc2lvbi5hY2NlcHQoKSwgICAgICAgLy8gdGhlIHBhZ2UgcmVsb2FkcyBpbnRvIHRoZSBuZXcgY2hhcmFjdGVyCiAgICAgICAgYmFjazogKCkgPT4gc2Vzc2lvbi5jYW5jZWwoKSwgICAgICAgIC8vIGJhY2sgdG8gdGhlIHRpdGxlIHNjcmVlbgogICAgICB9KTsKICAgICAgcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFrZSBpdDsgcmV0dXJuIHVuZGVmaW5lZCB0byBkZWNsaW5lCiAgICB9LAogIH07Cn0KYGBgCgpFdmVyeSBjaGFuZ2UgZ29lcyB0aHJvdWdoIHRoZSBnYW1lJ3Mgb3duIHJ1bGVzIGFuZCBhbnN3ZXJzIGB7IG9rOiB0cnVlIH1gIG9yIGB7IG9rOiBmYWxzZSwgcmVhc29uIH1gLCBzbyB0aGUgd2l6YXJkIG5ldmVyIGNvbXB1dGVzIHBvaW50IGNvc3RzIG9yIHN1Z2dlc3RlZCBzdGF0cyBpdHNlbGYuIEtlZXAgY2FsbGluZyBgZHJhZnQoKWAgYWZ0ZXIgZWFjaCBjaGFuZ2U6IGl0IGlzIHRoZSBjaGFyYWN0ZXIgYXMgdGhlIGdhbWUgd291bGQgc3RhcnQgaXQsIHdpdGggdGhlIHByZXZpZXcgYnVpbHQgdGhlIHdheSB0aGUgYmlydGggc2NyZWVuIGJ1aWxkcyBpdC4gU2VlIFtNT0RfU0VBTVMubWQgc2VjdGlvbiA0eF0oTU9EX1NFQU1TLm1kIzR4LWNoYXJhY3Rlci1jcmVhdGlvbikgZm9yIHRoZSBmdWxsIHNlc3Npb24uCgojIyBgcmVnaW9ucyhjdHgpYDogcHV0IGZ1cm5pdHVyZSBvZiB5b3VyIG93biBvbiB0aGUgc2NyZWVuCgpgcmVnaW9ucyhjdHgpYCBpcyB0aGUgZmlmdGggb3duZXIgc2VhbSwgYW5kIHRoZSBvbmx5IG9uZSB3aXRoIG5vIHdpbm5lci4gVGhlIG90aGVyIGZvdXIgZWFjaCBkZWNpZGUgd2hvIGdldHMgc29tZXRoaW5nLCBiZWNhdXNlIHRoZSBtYXAsIGEgSFVEIHJlZ2lvbiwgdGhlIG1lbnUgc2VhbSBhbmQgdGhlIHNjcmVlbiBzZWFtIGFyZSBlYWNoIGEgc2luZ2xlIHRoaW5nIHRoYXQgdHdvIG1vZHMgY2Fubm90IGJvdGggaGF2ZS4gUmVnaW9ucyB3b3JrIGRpZmZlcmVudGx5OiB3aGVuIHR3byBtb2RzIGJvdGggZGVjbGFyZSBvbmUsIHRoZXkgZG8gbm90IGNvbXBldGUuIFRoZXkgYXJlIHR3byBwaWVjZXMgb2YgZnVybml0dXJlIHRoYXQgY29leGlzdCwgZWFjaCBhdCBpdHMgb3duIGJhbmQsIGluIGxvYWQgb3JkZXIuIExvYWQgb3JkZXIgbWF0dGVycyBoZXJlIG9ubHkgaW4gdGhlIG9yZGluYXJ5IHNlbnNlIHRoYXQsIHdpdGhpbiBhIGJhbmQsIHRoZSBsYXRlci1sb2FkZWQgcmVnaW9uIGRyYXdzIG9uIHRvcC4KCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCiAgcmVnaW9ucyhjdHgpIHsKICAgIHJldHVybiBbewogICAgICBpZDogImNhcnJpZWQiLAogICAgICBsYXllcjogIm92ZXJsYXkiLAogICAgICBwbGFjZTogKGdyaWQpID0+ICh7IHg6IGdyaWQuY29scyAtIDE4LCB5OiAxLCB3OiAxNywgaDogMSB9KSwKICAgICAgcGFpbnQ6IChzdXJmYWNlKSA9PiBzdXJmYWNlLnB1dCgwLCAwLCBgQ2FycmllZCAke3dlaWdodCgpfSBsYmApLAogICAgfV07CiAgfSwKfTsKYGBgCgpJdCByZXF1aXJlcyBgdWk6cmVnaW9uLmNyZWF0ZWAuIGB1aToqLnJlcGxhY2VgIGRvZXMgbm90IGdyYW50IGl0OiB0aGF0IHdpbGRjYXJkIGNvdmVycyB3aGljaCBvZiB0aGUgZ2FtZSdzIG93biByZWdpb25zIGNoYW5nZSBoYW5kcywgYW5kIGFkZGluZyBhIHJlZ2lvbiBvZiB5b3VyIG93biBpcyBhIHNlcGFyYXRlIHRoaW5nIGZvciB0aGUgcGxheWVyIHRvIGFncmVlIHRvLiBEZWNsYXJpbmcgYHJlZ2lvbnMoKWAgd2l0aG91dCB0aGUgY2FwYWJpbGl0eSBpcyByZXBvcnRlZCBieSBuYW1lLCB3aXRoIHRoZSBmaXggc3BlbGxlZCBvdXQsIGluc3RlYWQgb2Ygc2lsZW50bHkgZHJhd2luZyBub3RoaW5nLgoKWW91ciBpZCBpcyBuYW1lc3BhY2VkOiBkZWNsYXJlIGAiY2FycmllZCJgIGFuZCB0aGUgbGl2ZSBzdGFjayBob2xkcyBgbXktbW9kOmNhcnJpZWRgLiBUaGlzIG1hdHRlcnMgZm9yIGNvcnJlY3RuZXNzLiBBIG1vZCBuYW1pbmcgaXRzIHJlZ2lvbiBgbWFwYCB3b3VsZCBwdXQgYSBzZWNvbmQgYG1hcGAgaW4gdGhlIHN0YWNrLCBhbmQgYG9jY2x1ZGVyc09mYCBhbnN3ZXJzIGFib3V0IHRoZSBmaXJzdCBtYXRjaCwgc28gYSBmcm9udCBlbmQncyBvbmUgcXVlc3Rpb24gY291bGQgcXVpZXRseSBzdGFydCBiZWluZyBhbnN3ZXJlZCBhYm91dCBzb21lYm9keSBlbHNlJ3MgcmVjdGFuZ2xlLgoKRmFpbHVyZSBpcyBwZXIgZGVjbGFyYXRpb24sIG5vdCBwZXIgbW9kLiBBIHJlY3RhbmdsZSB3aXRoIG5vIGBwYWludGAsIGEgYmFuZCB0aGF0IGRvZXMgbm90IGV4aXN0LCBhIGR1cGxpY2F0ZSBuYW1lLCBvciBhIGBwYWludGAgdGhhdCB0aHJvd3Mgb24gaXRzIGZpcnN0IGZyYW1lIGVhY2ggY29zdHMgdGhhdCBvbmUgcmVnaW9uLCBpcyByZXBvcnRlZCBvbmNlLCBhbmQgbGVhdmVzIHlvdXIgb3RoZXIgcmVnaW9ucyBhbmQgZXZlcnkgb3RoZXIgbW9kJ3MgYWxvbmUuCgpBIGZhdWx0aW5nIHJlZ2lvbiBpcyB3aXRoZHJhd24gaW5zdGVhZCBvZiBiZWluZyBsZWZ0IGVtcHR5LiBUaGlzIGRpZmZlcnMgZnJvbSBjb3JlOiBgdWktc3RhY2sudHNgIGxlYXZlcyBhIGZhdWx0ZWQgY29yZSBzY3JlZW4gaW4gdGhlIGNvbXBvc2l0ZSwgd2hpY2ggaXMgcmlnaHQgZm9yIHNvbWV0aGluZyB0aGF0IHN0aWxsIG93bnMgdGhlIGtleWJvYXJkLiBBIGRlY29yYXRpdmUgcGFuZWwgaGFzIG5vIHN1Y2ggY2xhaW0uIExlZnQgaW4gdGhlIHN0YWNrIGl0IHdvdWxkIGJlIGEgcGhhbnRvbSBvY2NsdWRlciwgYW5kIGEgcmVwbGFjZW1lbnQgZnJvbnQgZW5kIGFza2luZyBgb2NjbHVkZXJzT2Yoc3RhY2ssICJtYXAiKWAgd291bGQgaGlkZSBpdHMgY2FudmFzIGZvciBhIHJlZ2lvbiB0aGF0IGhhcyBkcmF3biBub3RoaW5nIHNpbmNlIGl0cyBmaXJzdCBmcmFtZS4gU28gdGhlIGhhbmRsZSBpcyByZWxlYXNlZCwgYW5kIHRoZSByZWdpb24gZGlzYXBwZWFycyB3aXRoIGEgbWVzc2FnZSBpbnN0ZWFkIG9mIGxpbmdlcmluZyB3aXRob3V0IG9uZS4KCmBwbGFjZShncmlkKWAgbXVzdCBiZSBjaGVhcCwgdG90YWwgYW5kIHB1cmUuIEl0IHJ1bnMgZm9yIGV2ZXJ5IG9wZW4gcmVnaW9uIG9uIGV2ZXJ5IGZyYW1lIGFuZCBvbiBldmVyeSByZXNpemU6IG5vIGdhbWUgcmVhZHMsIG5vIHBhaW50aW5nLCBhbmQgbm8gYWxsb2NhdGlvbiB5b3UgY2FuIGF2b2lkLiBSZXR1cm4gdGhlIHJlY3RhbmdsZSBmb3IgYSB0ZXJtaW5hbCBvZiB0aGF0IHNpemU7IGEgcmVjdGFuZ2xlIHRoYXQgcnVucyBvZmYgdGhlIGdyaWQgaXMgcmVjb3JkZWQgaW4gYHJlZ2lvblN0YWNrRmF1bHRzKClgIGluc3RlYWQgb2YgYmVpbmcgZHJhd24uCgpUaGUgYHN5c3RlbWAgbGF5ZXIgaXMgcmVzZXJ2ZWQgZm9yIHRoZSBnYW1lLiBBc2tpbmcgZm9yIGl0IGlzIHJlZnVzZWQgd2l0aCBpdHMgb3duIG1lc3NhZ2UgaW5zdGVhZCBvZiBhIGdlbmVyaWMgYmFkLWJhbmQgb25lLCBiZWNhdXNlIGl0IGlzIGEgcmVhbCBiYW5kICh0aGUgdG9wIG9uZSkgYW5kIHRoZSByZWZ1c2FsIGlzIGludGVudGlvbmFsLCBub3QgYSBzaWduIG9mIGEgdHlwby4gVGhlIG1vZCBtYW5hZ2VyIGFuZCBmYXVsdCByZXBvcnRzIGhhdmUgdG8gYmUgZHJhd2FibGUgYWJvdmUgZXZlcnkgbW9kLCBpbmNsdWRpbmcgb25lIHRoYXQgaGFzIGdvbmUgd3JvbmcuIFVzZSBgIm92ZXJsYXkiYCBmb3IgZnVybml0dXJlLCBvciBgIm1vZGFsImAgZm9yIHNvbWV0aGluZyB0aGF0IG5lZWRzIHRoZSBwbGF5ZXIncyBhdHRlbnRpb24uCgojIyBDYXBhYmlsaXRpZXMKClRoZSBgR3JpZFN1cmZhY2VgIHJlbmRlcmluZyBjb250cmFjdCBpcyBob3N0IGluZnJhc3RydWN0dXJlLCBub3QgYSByZWdpc3RyeSBjYXBhYmlsaXR5LiBgZnJvbnRlbmRgIGlzIGEgZGlyZWN0IGBNb2RQbHVnaW5gIG1lbWJlciBiZWNhdXNlIGl0IHNlbGVjdHMgb25lIGRpc3BsYXkgb3duZXIgaW5zdGVhZCBvZiByZWdpc3RlcmluZyBhbiBpbmRlcGVuZGVudCBnYW1lIGJlaGF2aW91ciwgYW5kIGZvciB0aGUgc2FtZSByZWFzb24gaXQgaGFzIGEgY2FwYWJpbGl0eSBraW5kIG9mIGl0cyBvd24sIGBkaXNwbGF5OnJlcGxhY2VgLiBgaHVkYCBoYXMgdGhlIHNhbWUgc2hhcGUgb25lIGxldmVsIGZpbmVyOiBhIGRpcmVjdCBtZW1iZXIgYmVjYXVzZSBpdCBzZWxlY3RzIGFuIG93bmVyLCBnYXRlZCBwZXIgcmVnaW9uIGJ5IGB1aTo8cmVnaW9uPi5yZXBsYWNlYCwgYmVjYXVzZSBhIG1vZCB0aGF0IGRyYXdzIGhpdCBwb2ludHMgYXMgYSBiYXIgaGFzIG5vIGJ1c2luZXNzIHRha2luZyB0aGUgbWVzc2FnZSBsb2cgYXMgd2VsbCwgYW5kIGEgcGxheWVyIGdpdmluZyBjb25zZW50IHNob3VsZCBiZSB0b2xkIHdoaWNoIHBhcnQgb2YgdGhlIHNjcmVlbiBpcyBjaGFuZ2luZyBoYW5kcy4gYG1lbnVgIGlzIHRoZSB0aGlyZCwgZ2F0ZWQgYnkgYHVpOm1lbnUucmVwbGFjZWAgZm9yIGFsbCBtZW51cyBhdCBvbmNlLCBiZWNhdXNlIHRoZSB1bml0IGEgcGxheWVyIGNhbiB3ZWlnaCBpcyAidGhlIGdhbWUncyBtZW51cyIsIG5vdCBmaWZ0eSBpbmRpdmlkdWFsIHNjcmVlbnMuIEFsbCB0aHJlZSBgdWk6KmAgZ3JhbnRzIGFuZCBgZGlzcGxheTpyZXBsYWNlYCBhcmUgc2VwYXJhdGUga2luZHMgaW4gYm90aCBkaXJlY3Rpb25zOiBhIG1vZCBob2xkaW5nIHRoZSBkdW5nZW9uIGNhbm5vdCBkcmF3IHRoZSB2aXRhbHMsIGFuZCBhIG1vZCBob2xkaW5nIGV2ZXJ5IG1lbnUgY2Fubm90IGRyYXcgdGhlIGR1bmdlb24uCgpgdWk6PHJlZ2lvbj4uPGFjdGlvbj5gIGhhcyB0aHJlZSBhY3Rpb25zLCBhbmQgdGhlIGFjdGlvbiBpcyBjb21wYXJlZCBhcyB3ZWxsIGFzIHRoZSByZWdpb24uIGByZXBsYWNlYCBoYW5kcyBvdmVyIHNvbWV0aGluZyB0aGUgZ2FtZSBhbHJlYWR5IGRyYXdzLiBgcmVnaW9uLmNyZWF0ZWAgYWRkcyBhIHJlY3RhbmdsZSBvZiB0aGUgZ2FtZSdzIG93biBjaGFyYWN0ZXIgZ3JpZCBiZXNpZGUgaXQuIGBwYW5lbC5tb3VudGAgcHV0cyByZWFsIEhUTUwgb24gdGhlIHBhZ2UgYWJvdmUgdGhlIGdhbWUsIHJlYWNoZWQgdGhyb3VnaCBgY3R4LnVpYCBpbnN0ZWFkIG9mIGEgYE1vZFBsdWdpbmAgbWVtYmVyLCBiZWNhdXNlIGEgcGFuZWwgb3BlbnMgd2hlbiB0aGUgcGxheWVyIGFza3MgZm9yIG9uZSBpbnN0ZWFkIG9mIGJlaW5nIGRlY2xhcmVkIG9uY2UgYXQgbG9hZC4gYHVpOioucmVwbGFjZWAgY292ZXJzIG5laXRoZXIgb2YgdGhlIG90aGVyIHR3bzogdGhlIHdpbGRjYXJkIGNvdmVycyB3aGljaCBvZiB0aGUgZ2FtZSdzIHJlZ2lvbnMgY2hhbmdlIGhhbmRzLCBhbmQgYWRkaW5nIGZ1cm5pdHVyZSBvciBtb3VudGluZyBhIHdlYiBwYWdlIGFyZSBzZXBhcmF0ZSB0aGluZ3MgZm9yIGEgcGxheWVyIHRvIGFncmVlIHRvLiBgdWk6cmVnaW9uYCwgYHVpOnBhbmVsYCBhbmQgYHVpOnRpdGxlYCBhcmUga2luZHMgb2YgdGhlaXIgb3duLCBhbmQgbm8gYHVpOmAgZ3JhbnQgY292ZXJzIGFub3RoZXIuCgpgbW9kOmAgaGFzIHR3byBhY3Rpb25zLCBhbmQgbmVpdGhlciBncmFudCBpbmNsdWRlcyB0aGUgb3RoZXIuIGBtb2Q6aW5zdGFsbGAgcHV0cyBhIGNvbnRlbnQgcGFjayBpbiB0aGUgcGxheWVyJ3MgbGlicmFyeSwgc3dpdGNoZWQgb2ZmLCBzbyB0aGUgcGxheWVyIHN0aWxsIG1lZXRzIGl0IG9uIHRoZSBNb2RzIHNjcmVlbiBhbmQgcmVhZHMgaXRzIG93biBjYXBhYmlsaXR5IGxpc3QgYmVmb3JlIHR1cm5pbmcgaXQgb24uIGBtb2Q6c2Vzc2lvbmAgbG9hZHMgYSBwYWNrIGZvciB0aGUgcmVzdCBvZiB0aGUgc2Vzc2lvbiBhbmQgdHVybnMgaXQgb24gYXQgdGhlIG5leHQgcmVsb2FkLCBza2lwcGluZyBib3RoIG9mIHRob3NlIHN0ZXBzLCBzbyB0aGUgaW5zdGFsbCBncmFudCBjYW5ub3QgY292ZXIgaXQuIGBncmFudENvdmVyc2AgY29tcGFyZXMgdGhlIGFjdGlvbiwgdGhlIHNhbWUgcnVsZSBgdWk6YCBuZWVkZWQgKCMyNjEpLiBCb3RoIHJlZnVzZSBhbiBhcmNoaXZlIHRoYXQgc2hpcHMgY29kZSBvciB3aG9zZSBtYW5pZmVzdCBhc2tzIGZvciBhIGNhcGFiaWxpdHksIHNvIG5laXRoZXIgY2FuIGJlIHVzZWQgdG8gcnVuIGNvZGUgYSBtb2Qgd3JvdGUuIGBtb2Q6cmVhZGAgbG9va3MgYSBtb2QgdXAgYXQgYSByZXBvc2l0b3J5IGFkZHJlc3Mgd2l0aG91dCBpbnN0YWxsaW5nIGFueXRoaW5nOyBpdCBpcyBhIGtpbmQgb2YgaXRzIG93biwgYW5kIG5laXRoZXIgYG1vZDpgIGdyYW50IGNvdmVycyBpdC4KCkEgc2Vzc2lvbi1vbmx5IGxvYWQgaXMgbGltaXRlZCBpbiBsaWZldGltZSwgbm90IGluIHByaXZpbGVnZS4gQSBzZXNzaW9uLWxvYWRlZCBwYWNrIGNvbXBvc2VzIGludG8gdGhlIGdhbWUgb24gdGhlIHNhbWUgdGVybXMgYXMgYW4gaW5zdGFsbGVkIG9uZS4gT25seSB0aGUgYXJjaGl2ZSBpcyBzaG9ydC1saXZlZDogd2hhdCB0aGUgcmVjb3JkcyBkaWQgdG8gYSBjaGFyYWN0ZXIsIGFuZCBhbnl0aGluZyBhIG1vZCB3cm90ZSB3aGlsZSB0aGV5IHdlcmUgbG9hZGVkLCBvdXRsaXZlcyB0aGUgc2Vzc2lvbiBleGFjdGx5IGFzIGl0IHdvdWxkIGhhdmUgaWYgdGhlIG1vZCBoYWQgYmVlbiBpbnN0YWxsZWQuIFdoYXQgdGhlIHNlc3Npb24gdGllciBkb2VzIGdpdmUgYSBwbGF5ZXIgaXMgdGhhdCBpdCBjYW5ub3QgYWNjdW11bGF0ZTogdGhlIG1vZCBpcyBsaXN0ZWQgYW5kIG1hcmtlZCwgaXQgY2FuIGJlIGRyb3BwZWQsIGFuZCBjbG9zaW5nIHRoZSBnYW1lIGZvcmdldHMgaXQuCgpUaGF0IGxpZmV0aW1lIGlzIGEgc3Ryb25nIGNvbnZlbnRpb24sIG5vdCBhbiBlbmZvcmNlZCBib3VuZGFyeS4gVGhlIGFyY2hpdmUgbGl2ZXMgaW4gYHNlc3Npb25TdG9yYWdlYCwgd2hpY2ggc3Vydml2ZXMgYSByZWxvYWQgKHRoYXQgaXMgd2hhdCBtYWtlcyB0aGUgdGllciB3b3JrLCBzaW5jZSBhIHJlbG9hZCBpcyB3aGF0IGFwcGxpZXMgYSBtb2QpLiBBIGJyb3dzZXIgYWxzbyByZXN0b3JlcyBpdCB3aGVuIGl0IHJlc3RvcmVzIGEgY2xvc2VkIG9yIGNyYXNoZWQgd2luZG93LCBhbmQgYSB3aW5kb3cgdGhlIHBhZ2UgaXRzZWxmIG9wZW5zIGluaGVyaXRzIGEgY29weSBvZiBpdC4gU28gImdvbmUgd2hlbiB5b3UgY2xvc2UgdGhlIGdhbWUiIGlzIHdoYXQgbm9ybWFsbHkgaGFwcGVucywgbm90IGEgZ3VhcmFudGVlLiBUaGUgbWl0aWdhdGlvbiBpcyB2aXNpYmlsaXR5OiBhIHNlc3Npb24gbW9kIGlzIGFsd2F5cyBvbiB0aGUgbGlzdCwgYWx3YXlzIG1hcmtlZCwgYW5kIGFsd2F5cyBkcm9wcGFibGUsIHNvIGl0IGNhbiBuZXZlciBzaXQgdGhlcmUgdW5ub3RpY2VkLgoKYHNoYXJlZDpgIGhhcyB0d28gYWN0aW9ucywgYW5kIG5laXRoZXIgZ3JhbnQgaW5jbHVkZXMgdGhlIG90aGVyLiBBIG1vZCB0aGF0IHJlYWRzIHdoYXQgb3RoZXJzIHNoYXJlIGlzIG5vdCBhYmxlIHRvIHB1Ymxpc2gsIGFuZCB0aGUgcmV2ZXJzZS4gUHVibGlzaGluZyBuZWVkcyBpdHMgb3duIGdyYW50IHNvIHRoZSBwbGF5ZXIgY2FuIHNlZSBmcm9tIHRoZSBNb2RzIHNjcmVlbiB3aGljaCBtb2RzIGhhbmQgZGF0YSB0byBvdGhlciBtb2RzLCBub3Qgb25seSB3aGljaCBtb2RzIHRha2UgaXQuCgpgdWk6cGFuZWwubW91bnRgIGlzIG5vdCBhIGZlbmNlIGFyb3VuZCB0aGUgRE9NLiBZb3VyIGBwbHVnaW4uanNgIHJ1bnMgaW4gdGhlIHBhZ2UncyBvd24gcmVhbG0sIHNvIGBkb2N1bWVudGAgaXMgYXZhaWxhYmxlIHRvIGl0IHdpdGggb3Igd2l0aG91dCBhbnkgY2FwYWJpbGl0eSwgYW5kIGEgbW9kIHRoYXQgbmV2ZXIgZGVjbGFyZXMgdGhpcyBjYW4gc3RpbGwgYXBwZW5kIGFuIGVsZW1lbnQgdG8gdGhlIGJvZHkuIFdoYXQgdGhlIGdyYW50IGNhcnJpZXMgaXMgYSBsaW5lIHRoZSBwbGF5ZXIgcmVhZHMgZmlyc3QsIGEgY29udGFpbmVyIHRoZSBob3N0IG93bnMgYW5kIGNhbiB0YWtlIGF3YXksIGFuZCBvbmUgdGhpbmcgYSBtb2QgY2Fubm90IGRvIHdpdGhvdXQgaXQ6IHN0YW5kIHRoZSBnYW1lJ3MgaW5wdXQgZG9vciBkb3duLCBzbyBhIHJlYWwgYDxpbnB1dD5gIGluc2lkZSB5b3VyIHBhbmVsIGNhbiBiZSB0eXBlZCBpbnRvIGluc3RlYWQgb2YgdGhlIGtleXN0cm9rZXMgYmVpbmcgcmVhZCBhcyBnYW1lIGNvbW1hbmRzLgoKYFdvcmxkRnJhbWVgIGluIGBwYWNrYWdlcy93ZWIvc3JjL3dvcmxkLXZpZXcudHNgIGlzIGxpdmUuIGByZW5kZXIoKWAgY2FsbHMgdGhlIGV4dHJhY3RlZCBgd29ybGQtcmVuZGVyLWRhdGEudHNgIHdpdGggdGhlIHJlYWwgbWFwLWtub3dsZWRnZSByZWFkcyBhbmQgcGFzc2VzIHRoZSByZXN1bHRpbmcgZnJhbWUgdG8gYSBgV29ybGRGcmFtZVNpbmtgLiBUaGUgZGVmYXVsdCBnbHlwaCB0ZXJtaW5hbCBpcyB0aGF0IHNpbmssIGFuZCBpdCBjb25zdW1lcyB0aGUgZnJhbWUncyBmYWxsYmFjayB2aXN1YWwgcHJvamVjdGlvbiwgaW5jbHVkaW5nIHRoZSB0ZXJyYWluLXVuZGVyLWZvcmVncm91bmQgdGlsZSBpbnB1dHMgZm9yIGEgcGF0aCBvdmVyIG90aGVyd2lzZSBiYXJlIHNlZW4gdGVycmFpbi4gVGhlIGZyYW1lIGNhcnJpZXMgc2VtYW50aWMgZmVhdHVyZSwgdHJhcCwgb2JqZWN0IGFuZCBtb25zdGVyIGlkcywgdmlzaWJpbGl0eSwgb3JkZXJlZCBsYXllcnMsIHRoZSBjdXJzb3IgYW5kIHBsYXllciBwbGFjZW1lbnQsIHNvIGEgc2VsZWN0ZWQgZnJvbnQgZW5kIGNhbiBidWlsZCBhbiBpc29tZXRyaWMgb3IgM0QgdmlldyB3aXRob3V0IGRlY29kaW5nIHRlcm1pbmFsIGdseXBocy4gQXMgYSBjb250cm9sLCB0aGUgaG9zdCBydW5zIHRoZSBzYW1lIHByb2R1Y2VyIGByZW5kZXIoKWAgdXNlcywgY2hlY2tzIGl0cyB1bm1vZGRlZCBwcmUtZnJhbWUgZ2x5cGggdHVwbGVzLCBhbmQgdGVlcyB0aGF0IGV4YWN0IGZyYW1lIHRvIGFuIGluZGVwZW5kZW50IGhvc3Qgc2luayBpbiB0aGUgc2FtZSBjYWxsLiBUaGUgc2VsZWN0ZWQgZnJvbnRlbmQgcmVjZWl2ZXMgYSBmcm96ZW4gY29weSBvZiB0aGF0IGZyYW1lOyB3aGVuIG5vIGZyb250ZW5kIGlzIHNlbGVjdGVkLCBvciBub25lIGV4aXN0cywgdGhlIGdseXBoIHNpbmsgc3RheXMgYWN0aXZlIHVuY2hhbmdlZC4KClRoZSBzYW1lIGlzIHRydWUgb2YgYFVpSW5wdXRgIGluIGBwYWNrYWdlcy93ZWIvc3JjL2lucHV0LWRvb3IudHNgLiBJdCBpcyB0aGUgc2luZ2xlIGRldmljZS1uZXV0cmFsIHJvdXRlIGJ5IHdoaWNoIGtleWJvYXJkIGFuZCBrZXltYXAgaW5wdXQgcmVhY2hlcyBzY3JlZW5zOyBpdHMgZGlyZWN0aW9uIGNhcnJpZXMgYW4gYW5hbG9nIHZlY3RvciBhbmQgYW5nbGUuIEEgcGx1Z2luIHRoYXQgZGVjbGFyZXMgYW5kIGlzIGdyYW50ZWQgYGtleW1hcDp3cml0ZWAgcmVjZWl2ZXMgYGN0eC5rZXltYXBzYCBkdXJpbmcgYSBsaXZlIGdhbWUuIGBiaW5kKClgIGNsYWltcyBvbmx5IGEgZnJlZSB0cmlnZ2VyLCBgZW50cmllcygpYCBsaXN0cyBvbmx5IGJpbmRpbmdzIHRoZSBjYWxsaW5nIG1vZCBvd25zLCBhbmQgYHJlYmluZCgpYCBhbmQgYHJlbW92ZSgpYCBjYW4gY2hhbmdlIG9ubHkgdGhvc2Ugb3duZWQgYmluZGluZ3MuIFRocm91Z2ggYGN0eC5rZXltYXBzYCBhIHBsdWdpbiBjYW5ub3QgcmVhZCwgb3ZlcndyaXRlLCBvciByZW1vdmUgdGhlIHBsYXllcidzIGJpbmRpbmdzIG9yIGFub3RoZXIgbW9kJ3MgYmluZGluZ3MuIEVkaXRpbmcgdGhvc2UgaXMgYSBzZXBhcmF0ZSBncmFudCwgYGtleW1hcDplZGl0YCwgd2hpY2ggaGFuZHMgdGhlIHBsdWdpbiBgY3R4LmtleWJpbmRpbmdzYCwgdGhlIHNhbWUgZWRpdG9yIGFzIHRoZSBnYW1lJ3Mgb3duIGtleW1hcCBzY3JlZW4uIEEgcGxheWVyIGNoYW5nZSBjbGVhcnMgdGhlIG1vZCBjbGFpbSwgYW5kIGJpbmRpbmdzIHN0aWxsIG93bmVkIGJ5IGEgZGVwYXJ0aW5nIG1vZCBhcmUgcmVtb3ZlZCBkdXJpbmcgaG9zdCB0ZWFyZG93bi4gU3RvcmVkIHBsYXllciBrZXltYXBzIGFyZSBldmFsdWF0ZWQgZmlyc3Qgd2hlbiB0aGUgcm9vdCBvd25zIGlucHV0OyBzY29yZSBwYWdlcywgbW9kYWxzLCBhbmQgcnVuIGludGVycnVwdGlvbiBrZWVwIHRoZWlyIG93biBsaXRlcmFsLWtleSBnYXRlcywgc28gYSBtb2QgbXVzdCBub3QgdXNlIGluamVjdGVkIGlucHV0IHRvIG91dHJhbmsgdGhlIHBsYXllcidzIGNob3NlbiBtYXBwaW5nIG9yIGFuIGFjdGl2ZSBzY3JlZW4uCgpgcmVnaXN0ZXJgIHJlYWNoZXMgZWlnaHRlZW4gcmVnaXN0cmllcywgZWFjaCBnYXRlZCBieSBhIGNhcGFiaWxpdHkgeW91ciBtYW5pZmVzdCBtdXN0IGRlY2xhcmUgYW5kIHRoZSBwbGF5ZXIgbXVzdCBhZ3JlZSB0by4gYFJFR0lTVFJZX0NBUEFCSUxJVElFU2AgaW4gYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCBtYXBzIGVhY2ggZmFjYWRlIHRvIGl0cyBjYXBhYmlsaXR5IHN0cmluZywgYW5kIHRoZSB0YWJsZSBiZWxvdyBzYXlzIHdoYXQgZWFjaCBvbmUgb3BlbnM6Cgp8IENhcGFiaWxpdHkgfCBXaGF0IGl0IG9wZW5zIHwKfC0tLXwtLS18CnwgYHJlZ2lzdHJ5OmVmZmVjdGAgfCBhZGQgYSBuZXcgZWZmZWN0IGNvZGUsIG9yIHJlcGxhY2UgYSBjb3JlIG9uZTogY29tYmF0LCBoZWFsaW5nLCB0ZWxlcG9ydCwgZGV0ZWN0aW9uIHwKfCBgcmVnaXN0cnk6cm9vbWAgfCByb29tIGFuZCBsZXZlbCBidWlsZGVycywgcmVmZXJlbmNlZCBmcm9tIGEgZHVuZ2VvbiBwcm9maWxlIHwKfCBgcmVnaXN0cnk6cHJvZmlsZWAgfCB3aG9sZS1jYXZlIGJ1aWxkZXJzIGFuZCBkdW5nZW9uIHByb2ZpbGVzOiBhIG5ldyAqa2luZCogb2YgbGV2ZWwsIGFuZCB3aGljaCBraW5kIHlvdSBnZXQgYXQgYSBkZXB0aCB8CnwgYHJlZ2lzdHJ5OmJsb3dgIHwgd2hhdCBhIG1vbnN0ZXIncyBhdHRhY2tzIGRvIHRvIHlvdSwgYW5kIG5ldyBraW5kcyBvZiBhdHRhY2s6IGBkZWZpbmUoKWAgdGFrZXMgb25lIGRlc2NyaXB0aW9uIGFuZCB0aGUgZW5naW5lIGRlcml2ZXMgYm90aCBvZiB0aGUgaGFuZGxlcnMgaXQgbmVlZHMgfAp8IGByZWdpc3RyeTpzdG9yZWAgfCB3aGF0IGEgc2hvcCB3aWxsIGJ1eSwgYW5kIGhvdyBtYW55IG9mIGEgdGhpbmcgaXQgc3RvY2tzIHwKfCBgcmVnaXN0cnk6Y29tbWFuZGAgfCB3aGF0IGEgcGxheWVyIGNvbW1hbmQgKmRvZXMqLCBhbmQgd2hhdCBpdCBpcyBDQUxMRUQ6IGBjb21tYW5kcy5yZWdpc3Rlcihjb2RlLCBhY3Rpb24pYCBmb3IgdGhlIGJlaGF2aW91ciwgYGNvbW1hbmRzLnNldFZlcmIoY29kZSwgdmVyYilgIGZvciB0aGUgdmVyYiB0aGUgYCFgLWluc2NyaXB0aW9uIGNvbmZpcm0gcmVhZHMuIFNraXAgdGhlIHZlcmIgYW5kIGEgcGxheWVyIHdobyBoYXMgaW5zY3JpYmVkIGAhemAgb24gYSBQb3Rpb24gb2YgRGVhdGggaXMgYXNrZWQgIlJlYWxseSAqKmRvIHRoYXQgd2l0aCoqIHlvdXIgUG90aW9uIG9mIERlYXRoPyIgaW5zdGVhZCBvZiB5b3VyIGNvbW1hbmQncyBvd24gbmFtZTsgYGNvbW1hbmRzLnZlcmJGb3IoY29kZSlgIHJldHVybnMgd2hhdCBpcyBpbnN0YWxsZWQsIHNvIGEgbGF0ZXIgbW9kIGNhbiB3cmFwIGFuIGVhcmxpZXIgb25lJ3MgfAp8IGByZWdpc3RyeTptb25zdGVyYCB8IGEgaG9vayBhdCB0aGUgdG9wIG9mIGV2ZXJ5IG1vbnN0ZXIncyB0dXJuOyByZXR1cm4gdHJ1ZSB0byB0YWtlIHRoZSB0dXJuIG92ZXIgfAp8IGByZWdpc3RyeTpwcm9qZWN0aW9uYCB8IHdoYXQgYSBwcm9qZWN0aW9uIGRvZXMgdG8gdGVycmFpbiwgZmxvb3IgaXRlbXMgYW5kIHRoZSBwbGF5ZXI6IGBwcm9qZWN0aW9ucy5mZWF0YCAvIGAub2JqYCAvIGAucGxheWVyYCwgb25lIHByb2plY3Rpb24gYGNvZGVgIGF0IGEgdGltZS4gVGhpcyBpcyB0aGUgYmVoYXZpb3VyIGhhbGYgb2YgYWRkaW5nIHlvdXIgb3duIGVsZW1lbnQ6IHRoZSBgcHJvamVjdGlvbi5qc29uYCByZWNvcmQgbWFrZXMgaXQgZXhpc3QsIHRoZXNlIHRocmVlIG1ha2UgaXQgKmRvKiBzb21ldGhpbmcgfAp8IGByZWdpc3RyeTp1aS1lbnRyeWAgfCB3aGF0IGEgYGNvbWJpbmU6YCBvciBhbiBgZW50cnktcmVuZGVyZXI6YCBgY29kZTpgICptZWFucyogb24gdGhlIHNlY29uZCBjaGFyYWN0ZXIgc2NyZWVuIGFuZCB0aGUgZXF1aXBtZW50IGNvbXBhcmlzb246IGB1aUVudHJ5LmNvbWJpbmVycy5zZXQoIm15LW1vZDp3b3JzdC1vZiIsIC4uLilgIChob3cgYSByb3cncyBwZXItc2xvdCB2YWx1ZXMgcmVkdWNlIHRvIHRoZSBvbmUgdGhhdCBjb2xvdXJzIGl0cyBsYWJlbCkgYW5kIGB1aUVudHJ5LmJhY2tlbmRzLnNldCgibXktbW9kOmJhcnMiLCAuLi4pYCAoaG93IGEgdmFsdWUgYmVjb21lcyBhIGNlbGwgc3ltYm9sIGFuZCBjb2xvdXIpLiBBZGRpbmcgYSBgdWlfZW50cnkuanNvbmAgUk9XIG5lZWRzIG5vIGNhcGFiaWxpdHk7IGEgcm93IG5hbWluZyBhIGNvbWJpbmVyIG9yIHJlbmRlcmVyIG5vdGhpbmcgYW5zd2VycyBmb3IgZHJhd3MgYXMgYW4gZW1wdHkgcm93IHJhdGhlciB0aGFuIGZhaWxpbmcsIHNvIHRoaXMgaXMgd2hhdCBtYWtlcyB5b3VyIHJvdyBtZWFuIHNvbWV0aGluZyB8CnwgYHJlZ2lzdHJ5OmdseXBoYCB8IHdoYXQgb25lIGNoYXJhY3RlciBvZiBhIHJvb20tdGVtcGxhdGUgb3IgdmF1bHQgbGF5b3V0IG1lYW5zIHdoZW4gdGhlIGxldmVsIGlzIGRyYXduOiBgZ2x5cGhzLnNldCgidmF1bHQiLCAiUSIsIC4uLilgLiBUaGUgYmVoYXZpb3VyIGhhbGYgb2Ygc2hpcHBpbmcgYSB2YXVsdCB3aXRoIGEgc3ltYm9sIGNvcmUgaGFzIG5ldmVyIHNlZW4gfAp8IGByZWdpc3RyeTplZmZlY3QtaW5mb2AgfCB3aGF0IHRoZSBnYW1lICpzYXlzKiBhYm91dCBhbiBlZmZlY3Q6IGBlZmZlY3RJbmZvLnRleHRgICh0aGUgbWVudSByb3cgYW5kIHRoZSByZWNhbGwgc2VudGVuY2UpLCBgLnN1bW1hcnlgICh0aGUgb2JqZWN0IHByb3BlcnRpZXMgYW4gYWN0aXZhdGlvbiBncmFudHMpLCBgLnN1YnR5cGVgICh0aGUgbmFtZWQgc3VidHlwZXMgaXQgYWNjZXB0cykgYW5kIGAucmVxdWVzdGAgKHdoaWNoIGl0ZW0gaXQgcHJvbXB0cyBmb3IpLiBUaGlzIGlzIHRoZSBkZXNjcmlwdGlvbiBoYWxmIG9mIGByZWdpc3RyeTplZmZlY3RgOiB3aXRob3V0IGl0IHlvdXIgbmV3IGVmZmVjdCB3b3JrcyBhbmQgdGhlIGdhbWUgaGFzIG5vdGhpbmcgdG8gc2F5IGFib3V0IGl0IHwKfCBgcmVnaXN0cnk6dHZhbGAgfCB3aGF0IGFuIGl0ZW0gQ0xBU1MgKmlzKjogYHR2YWwuY2xhc3Nlc2AgKGtleWVkIG9uIHRoZSBwcmVkaWNhdGUncyBvd24gbmFtZSwgc28gYGhhbmRsZXJGb3IoInR2YWxJc1dlYXBvbiIpYCByZXR1cm5zIGNvcmUncyBhcm0gYW5kIGEgbW9kIE9ScyBpdHMgb3duIHR2YWwgaW50byBpdCksIGAuZ29vZGAgKHdoZXRoZXIgYSB0ZW1wbGF0ZSBjb3VudHMgYXMgZ29vZCBmb3IgYWxsb2NhdGlvbiksIGAudmFsdWVCYXNlYCAod2hhdCBhbiB1bmlkZW50aWZpZWQgaXRlbSBvZiB0aGUgY2xhc3MgaXMgd29ydGgpLCBgLnZhbHVlQWRqdXN0YCAoYSBwb3N0LWNvbXB1dGF0aW9uIG51ZGdlIHRvIGBvYmplY3RfdmFsdWVfcmVhbGAncyBvd24gZmFpdGhmdWwgcmVzdWx0IC0gYHsgcmVnLCBvYmosIHF0eSwgYmFzZVZhbHVlLCB0b3RhbEFjIH1gIGluLCBhIHBvc3NpYmx5LWRpZmZlcmVudCBudW1iZXIgb3V0OyB1bnJlZ2lzdGVyZWQgaXMgYSBuby1vcCkgYW5kIGAuYmFzZW5hbWVgICh3aGF0IHRoZSBjbGFzcyBpcyBDQUxMRUQgLSB3aXRob3V0IGl0IGV2ZXJ5IG1lc3NhZ2UsIG1lbnUgcm93IGFuZCBzaG9wIGxpbmUgbmFtaW5nIHRoZSBjbGFzcyByZWFkcyB0aGUgbGl0ZXJhbCAiKG5vdGhpbmcpIikuIFNoaXBwaW5nIGEgbmV3ICppdGVtKiBuZWVkcyBubyBjYXBhYmlsaXR5OyB0aGlzIGlzIHRoZSBjbGFzcyB8CnwgYHJlZ2lzdHJ5OnJhbmRhcnRgIHwgaG93IFJBTkRPTSBhcnRpZmFjdHMgYXJlIGJ1aWx0OiBgcmFuZGFydC5hYmlsaXRpZXNgICh3aGF0IGEgcG93ZXIgZG9lcyksIGAucHJlcGAgKHdoYXQgYW4gaXRlbSBjbGFzcyBzdGFydHMgd2l0aCksIGAuY2Vuc3VzYCAod2hpY2ggZnJlcXVlbmN5IGJ1Y2tldCBpdCBmZWVkcykgYW5kIGAucmVkdW5kYW5jeWAgKHdoZXRoZXIgYW4gYWN0aXZhdGlvbiBkdXBsaWNhdGVzIHNvbWV0aGluZyB0aGUgYXJ0aWZhY3QgYWxyZWFkeSBoYXMpLiBTaGlwcGluZyBhICpmaXhlZCogYXJ0aWZhY3QgbmVlZHMgbm8gY2FwYWJpbGl0eTsgdGhpcyBpcyB0aGUgZ2VuZXJhdG9yIHwKfCBgcmVnaXN0cnk6cnVuZWAgfCB3aGF0IGEgcnVuZSBpczogdGhlIHVuaXQgb2Ygb2JqZWN0IGtub3dsZWRnZS4gYHJ1bmUuZGVzY2AgKHRoZSByZWNhbGwgbGluZSksIGAubmFtZWAgKHRoZSBkaXNwbGF5IGRlY29yYXRpb24pLCBgLmtub3dzYCAvIGAubGVhcm5gICh0aGUga25vd2xlZGdlIHBhaXIsIGhhbmRlZCB0aGUgcGxheWVyIHNvIHlvdXIgbW9kIGtlZXBzIHRoZSBzdG9yZSwgc2luY2UgY29yZSBoYXMgbm8gc2xvdCBmb3IgaXQpLCBgLm9iamVjdEhhc2AgKHdoZXRoZXIgYW4gaXRlbSBjYXJyaWVzIGl0KSBhbmQgYC5tb2RNZXNzYWdlYCAodGhlICJZb3UgZmVlbCBzdHJvbmdlciEiIGxpbmUsIGtleWVkIG9uIHRoZSBtb2RpZmllcikuIFBsdXMgYC5jb250cmlidXRlYCwgd2hpY2ggcHV0cyB5b3VyIHJ1bmUgaW50byB0aGUgbGlzdCBldmVyeSBjb25zdW1lciBlbnVtZXJhdGVzOyB3aXRob3V0IGl0LCB0aGUgc2l4IGhhbmRsZXJzIGFib3ZlIGFyZSBuZXZlciBjYWxsZWQgfAp8IGByZWdpc3RyeTp2b2NhYmAgfCBkZWNsYXJlIGdlbnVpbmVseSBuZXcgdm9jYWJ1bGFyeSAoZmxhZ3MsIHN0YXRzLCBtb2QtY29pbmVkIGtpbmRzKSBhbmQgc3RvcmUgcGVyLWVudGl0eSB2YWx1ZXMgfAp8IGByZWdpc3RyeTptZXNzYWdlYCB8IG1lc3NhZ2UgVFlQRVM6IGBtZXNzYWdlcy5kZWZpbmUobmFtZSwgc291bmQ/KWAgY29pbnMgb25lIGFuZCByZXR1cm5zIGl0cyBudW1iZXIsIGAubG9va3VwKG5hbWUpYCBmaW5kcyBhbiBleGlzdGluZyBvbmUsIGAudHlwZXMoKWAgbGlzdHMgd2hhdCBoYXMgYmVlbiBhZGRlZCwgYC5hZGRTb3VuZHMoLi4uKWAgYXR0YWNoZXMgc291bmRzLiBBZGRpbmcgYSBgbWVzc2FnZV90eXBlLmpzb25gIFJFQ09SRCBuZWVkcyBubyBjYXBhYmlsaXR5LCB0aGUgc2FtZSB3YXkgYWRkaW5nIGFuIGl0ZW0gZG9lczsgdGhpcyBpcyB0aGUgY29kZSBoYWxmLCBmb3IgYSB0eXBlIHlvdXIgb3duIHBsdWdpbiByYWlzZXMgfAp8IGByZWdpc3RyeTptZW51YCB8IHJld3JpdGUgb25lIHN0YWJsZSBtZW51IGlkJ3Mgc2VtYW50aWMgcm93cy4gYG1lbnVzLmhhbmRsZXJGb3IoaWQpYCByZXR1cm5zIHRoZSBlYXJsaWVyIHRyYW5zZm9ybWVyLCBzbyBhIGxhdGVyIG1vZCB3cmFwcyBpdCBiZWZvcmUgY2FsbGluZyBgbWVudXMucmVnaXN0ZXIoaWQsIC4uLilgOyBhIHRocm93IG9yIGEgbm9uLXJvdy1hcnJheSByZXN1bHQgaXMgcmVwb3J0ZWQgYWdhaW5zdCB0aGF0IG1vZCBhbmQgbGVhdmVzIHRoZSBvcmlnaW5hbCBtZW51IHVzYWJsZS4gYG1lbnVzLmFkZEFjdGlvbigiY29yZTpnYW1lLW1lbnUiLCBhY3Rpb24sIGxhYmVsLCBoYW5kbGVyKWAgYWRkcyBhIG5hbWVzcGFjZWQsIHJ1bm5hYmxlIHJvdyB0byB0aGUgRXNjYXBlIEdhbWUgbWVudTsgaXQgaXMgdGhlIGRvb3IgZm9yIGEgbW9kLW93bmVkIGNhbGxiYWNrIHJhdGhlciB0aGFuIGEgcmV3cml0ZSBvZiBhIGNvcmUgYWN0aW9uIHwKfCBgcmVnaXN0cnk6dGlsZXNgIHwgc3VwcGx5IHRpbGVzIGZvciBjb250ZW50IHRoZSBsb2FkZWQgdGlsZSBwYWNrIGRvZXMgbm90IGRyYXcsIHdoaWNoIGluIHByYWN0aWNlIG1lYW5zIGNvbnRlbnQgYSBtb2QgYWRkZWQuIGB0aWxlcy5yZWdpc3RlcihmaWxsZXIpYCBpbnN0YWxscyBvbmUgZmlsbGVyIHBlciBtb2Q7IGV2ZXJ5IHJlZ2lzdGVyZWQgZmlsbGVyIHJ1bnMsIGluIGxvYWQgb3JkZXIsIGFmdGVyIHRoZSBwYWNrJ3Mgb3duIHByZWZzIGFuZCBldmVyeSBtb2Qncy4gQSBmaWxsZXIgY2FuIG9ubHkgd3JpdGUgd2hlcmUgbm90aGluZyBpcyBhc3NpZ25lZCwgc28gaXQgY2Fubm90IHJlcGFpbnQgdGhlIHRpbGUgc2V0IGFuZCB0d28gbW9kcyBjYW5ub3QgZmlnaHQgb3ZlciBhbiBpbmRleC4gVGhlIHNhbWUgc2VhbSBhbHNvIG9mZmVycyByZXBhaW50aW5nIGluIHBsYWNlIChgZmlsbC50cmFuc2Zvcm1gLCBhIG1pcnJvciBhbmQvb3IgYSBwYWxldHRlIHJlbWFwIG92ZXIgYW4gZXhpc3RpbmcgdGlsZSkgYW5kIHRoZSBwbGF5ZXIncyBvd24gY2VsbCAoYHRpbGVzLnBsYXllcmAsIGFza2VkIG9uY2UgcGVyIGZyYW1lIHdoYXQgdGhlIGNoYXJhY3RlcidzIGNlbGwgc2hvdWxkIHNob3cpLiBTZWUgW0ZpbGxpbmcgdGlsZXNdKCNmaWxsaW5nLXRpbGVzKSBhbmQgW1JlcGFpbnRpbmcgYSB0aWxlLCBhbmQgZHJhd2luZyB0aGUgcGxheWVyJ3Mgb3duIGNlbGxdKCNyZXBhaW50aW5nLWEtdGlsZS1hbmQtZHJhd2luZy10aGUtcGxheWVycy1vd24tY2VsbCkgfAoKVG91Y2hpbmcgYSBmYWNhZGUgeW91IGRpZCBub3QgZGVjbGFyZSB0aHJvd3MsIGV2ZW4gaWYgdGhlIHBsYXllciBjb25zZW50ZWQgdG8gc29tZXRoaW5nIGVsc2UuIENvbnNlbnQgbWVhbnMgdGhlIHBsYXllciBhbGxvd2VkIHRoZXNlIGRvbWFpbnMsIGFuZCB0aGUgbWFuaWZlc3QgbWVhbnMgeW91IGFza2VkIGZvciB0aGVtOyB5b3UgbmVlZCBib3RoLgoKRXZlcnkgY2FwYWJpbGl0eSBpcyBkZWZpbmVkIG9uY2UsIGluIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9jYXBhYmlsaXR5LXZvY2FidWxhcnkudHNgOiBpdHMgYXJndW1lbnQsIHRoZSBzZW50ZW5jZSB0aGUgcGxheWVyIGlzIGFza2VkIHRvIGFncmVlIHRvLCB3aGF0IHN0b3BzIHdvcmtpbmcgd2l0aG91dCBpdCwgd2hldGhlciB0aGUgbW9kIGNhbiBzdGlsbCBzdGFydCB3aXRob3V0IGl0LCB3aGV0aGVyIHRoZSBjb25zZW50IHNjcmVlbiBoaWdobGlnaHRzIGl0LCBhbmQgd2hpY2gga2luZHMgb2YgbW9kIG1heSBob2xkIGl0LiBgcGFyc2VDYXBhYmlsaXR5YCBhbmQgYGdyYW50Q292ZXJzYCBpbiBgY2FwYWJpbGl0aWVzLnRzYCByZWFkIHRoYXQgbGlzdCwgYW5kIHNvIGRvZXMgdGhlIGNvbnNlbnQgc2NyZWVuIChgcGFja2FnZXMvd2ViL3NyYy9jYXBhYmlsaXR5LWRlc2NyaWJlLnRzYCkuIGBwYXJzZUNhcGFiaWxpdHlgIHRocm93cyBvbiBhIHN0cmluZyB0aGUgbGlzdCBkb2VzIG5vdCBrbm93LCBhbmQgdGhlIGNvbnNlbnQgc2NyZWVuIHNob3dzIHN1Y2ggYSBzdHJpbmcgYXMgYW4gdW5yZWNvZ25pemVkLCBoaWdoLXJpc2sgZ3JhbnQuCgpQbGF5ZXJzIGFuc3dlciBmb3IgdGhlIHdob2xlIGxpc3QgaW4gb25lIGdvLiBZb3VyIG1vZCBzdGF5cyBvZmYgdW50aWwgdGhleSBoYXZlIHNhaWQgeWVzIHRvIGV2ZXJ5IGNhcGFiaWxpdHkgaW4gaXRzIG1hbmlmZXN0LCB3aGljaCBtZWFucyB0aGUgbm90ZXMgb24gd2hhdCBzdG9wcyB3b3JraW5nIHdpdGhvdXQgYSBncmFudCB0ZWxsIHlvdSBob3cgeW91ciBjb2RlIHNob3VsZCBiZWhhdmUgd2hlbiBhIGNoZWNrIGZhaWxzLgoKVGhyZWUgY2FwYWJpbGl0aWVzIHRha2UgYW4gYXJndW1lbnQuIGBldmVudDo8bmFtZT5gIGFuZCBgc3RhdGU6PGRvbWFpbj4ucmVhZGAgdGFrZSBhIGxvd2VyY2FzZSBrZWJhYi1jYXNlIHdvcmQsIHN1Y2ggYXMgYHR1cm4tc3RhcnRgIG9yIGBtb25zdGVyc2AuIGBuZXR3b3JrOjxob3N0PmAgdGFrZXMgYSBob3N0IG5hbWUgb3IgYW4gYWRkcmVzcyBpbiBicmFja2V0cywgd2l0aCBhbiBvcHRpb25hbCBwb3J0IGZyb20gMSB0byA2NTUzNTsgd2l0aG91dCBhIHBvcnQgaXQgY292ZXJzIHRoZSBzY2hlbWUncyBkZWZhdWx0IHBvcnQgb25seS4gYG5ldHdvcms6bG9jYWxgIGNvdmVycyB0aGlzIGNvbXB1dGVyIGFuZCB0aGUgcHJpdmF0ZSBhZGRyZXNzIHJhbmdlcyBvbiBhbnkgcG9ydC4KCkZvdXIgZ3JhbnRzIGFyZSB3aWxkY2FyZHMsIGFuZCBlYWNoIHJhbmdlcyBvdmVyIGl0cyBvbmUgYXJndW1lbnQgYW5kIG5vdGhpbmcgZWxzZTogYHN0YXRlOioucmVhZGAsIGByZWdpc3RyeToqYCwgYG5ldHdvcms6KmAgYW5kIGB1aToqLnJlcGxhY2VgLiBXaGVyZSBhIGtpbmQgaGFzIG1vcmUgdGhhbiBvbmUgYWN0aW9uLCB0aGUgYWN0aW9uIGlzIGNvbXBhcmVkIHRvbywgc28gYGRlYnVnOnNwYXduYCBkb2VzIG5vdCBjb3ZlciBgZGVidWc6d2l6YXJkYCBhbmQgYHByZWZzOnJlYWRgIGRvZXMgbm90IGNvdmVyIGBwcmVmczp3cml0ZWAuCgpGaXZlIGNhcGFiaWxpdGllcyBydW4gdGhlIGdhbWUncyBvd24gbWFuYWdlbWVudDogYG1vZDppbnN0YWxsYCwgYG1vZDpzZXNzaW9uYCwgYHNlc3Npb246Y29udHJvbGAsIGBwcm9maWxlczptYW5hZ2VgIGFuZCBgc2NyZWVuczptYW5hZ2VgLiBPbmx5IGZpcnN0LXBhcnR5IG1vZHMgYXJlIG1lYW50IHRvIGhvbGQgdGhlbSwgYW5kIHRoZXkgYXJlIGxlZnQgb3V0IG9mIHRoZSBwdWJsaWMgbGlzdC4gYHN0YXRlOm1hcC1hY3R1YWwucmVhZGAsIHRoZSByZWFsIG1hcCByYXRoZXIgdGhhbiB3aGF0IHRoZSBjaGFyYWN0ZXIgaGFzIGZvdW5kLCBpcyBmaXJzdC1wYXJ0eSBvbmx5IGFzIHdlbGwuIEEgZ3JhbnQgaGFzIHRvIG5hbWUgaXQ7IGBzdGF0ZToqLnJlYWRgIGdpdmVzIGV2ZXJ5IG90aGVyIHN0YXRlIGRvbWFpbiBhbmQgbm90IHRoaXMgb25lLiBUaGUgZ2FtZSBkb2VzIG5vdCB5ZXQgY2hlY2sgYSBtb2QncyBraW5kIHdoZW4gaXQgbG9hZHMsIHNvIGEgbW9kIHRoYXQgZGVjbGFyZXMgb25lIG9mIHRoZXNlIGlzIG5vdCByZWZ1c2VkIGZvciBpdC4KCkluIHRoZSB0YWJsZSwgImFueSBjb2RlIG1vZCIgbWVhbnMgZmlyc3QtcGFydHksIHJldmlld2VkLCBzaWRlbG9hZGVkIGFuZCBXb3JrZXIgbW9kcywgYW5kICJpbi1wcm9jZXNzIiBtZWFucyBldmVyeSBraW5kIGV4Y2VwdCBXb3JrZXIgbW9kcy4gQSBtb2Qgd2l0aCBubyBjb2RlIGhvbGRzIG5vIGNhcGFiaWxpdGllcy4KCnwgQ2FwYWJpbGl0eSB8IFdoYXQgdGhlIHBsYXllciByZWFkcyB8IFdpdGhvdXQgaXQgfCBIaWdobGlnaHRlZCB8IEhlbGQgYnkgfAp8LS0tfC0tLXwtLS18LS0tfC0tLXwKfCBgY29tbWFuZDphZGRgIHwgQWRkIG5ldyBwbGF5ZXIgY29tbWFuZHMgfCBUaGUgY29tbWFuZHMgdGhpcyBtb2QgYWRkcyBhcmUgbm90IGF2YWlsYWJsZS4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGBjb21tYW5kOnN1Ym1pdGAgfCBBc2sgdGhlIGdhbWUgdG8gcnVuIGNvbW1hbmRzIGJ5IHRoZWlyIG5hbWVzLCB0aGUgd2F5IHlvdXIgb3duIGtleXMgZG8gfCBUaGUgbW9kIGNhbm5vdCBhc2sgdGhlIGdhbWUgdG8gcnVuIGNvbW1hbmRzIGZvciB5b3UuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKfCBgaW5wdXQ6aW50ZW50YCB8IEFjdCBvbiB5b3VyIGNoYXJhY3RlcidzIGJlaGFsZiB3aXRoIHRoZSBzYW1lIGNvbW1hbmRzIHlvdXIgb3duIGtleXMgdXNlIHwgVGhlIG1vZCBjYW5ub3QgbW92ZSBvciBhY3QgZm9yIHlvdXIgY2hhcmFjdGVyLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGBpbnB1dDpwcm9tcHQucmVwbHlgIHwgQW5zd2VyIHRoZSBnYW1lJ3MgY3VycmVudCBxdWVzdGlvbiB0aHJvdWdoIGl0cyBpbnB1dCBoYW5kbGVyIHwgVGhlIG1vZCBjYW5ub3QgYW5zd2VyIHRoZSBnYW1lJ3MgcXVlc3Rpb25zIGZvciB5b3UsIHNvIHlvdSBhbnN3ZXIgdGhlbSB5b3Vyc2VsZi4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgc2F2ZXM6bWFuYWdlYCB8IExpc3QsIGxvYWQsIHJlbmFtZSBhbmQgZGVsZXRlIHlvdXIgY2hhcmFjdGVyczsgZGVsZXRpb24gYXNrcyB5b3UgZmlyc3QgfCBUaGUgbW9kJ3Mgb3duIGNoYXJhY3RlciBsaXN0IGRvZXMgbm90IGFwcGVhcjsgdGhlIGdhbWUncyBsaXN0IHN0aWxsIHdvcmtzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTp0aXRsZWAgfCBBZGQgdGl0bGUgc2NyZWVuIGFjdGlvbnMgfCBUaGUgbW9kJ3MgZW50cmllcyBvbiB0aGUgdGl0bGUgc2NyZWVuIGRvIG5vdCBhcHBlYXIuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgc2hhcmVkOnJlYWRgIHwgUmVhZCBkYXRhIG90aGVyIG1vZHMgc2hhcmUgfCBUaGUgbW9kIGNhbm5vdCBzZWUgd2hhdCBvdGhlciBtb2RzIHNoYXJlIHdpdGggaXQuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgc2hhcmVkOnB1Ymxpc2hgIHwgU2hhcmUgZGF0YSB3aXRoIG90aGVyIG1vZHMgfCBPdGhlciBtb2RzIGNhbm5vdCBzZWUgd2hhdCB0aGlzIG1vZCBzaGFyZXMuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBgZGlzcGxheTpyZXBsYWNlYCB8IERyYXcgdGhlIGR1bmdlb24gaXRzZWxmIC0gZXZlcnl0aGluZyB5b3Ugc2VlIG9mIHRoZSBtYXAgY29tZXMgZnJvbSB0aGlzIG1vZCBpbnN0ZWFkIG9mIHRoZSBnYW1lIHwgVGhlIGdhbWUgZHJhd3MgdGhlIG1hcCBpdHNlbGYgYW5kIHRoaXMgbW9kJ3MgdmlldyBpcyBub3QgdXNlZC4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgZGlzcGxheTpmaWx0ZXJgIHwgQXBwbHkgYSB2aXN1YWwgcG9zdC1wcm9jZXNzaW5nIGZpbHRlciB0byB0aGUgZ2FtZSdzIHRlcm1pbmFsIGNhbnZhcyBhbmQgcGFuZWxzIHwgVGhlIGdhbWUncyBzY3JlZW4gaXMgc2hvd24gd2l0aG91dCB0aGlzIG1vZCdzIGZpbHRlci4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGB1aToqLnJlcGxhY2VgIHwgRHJhdyB0aGUgd2hvbGUgaW50ZXJmYWNlIGFyb3VuZCB0aGUgbWFwIC0geW91ciBtZXNzYWdlcywgeW91ciB2aXRhbHMsIHRoZSBzdGF0dXMgbGluZSwgZXZlcnkgbWVudSBhbmQgZXZlcnkgZnVsbCBzY3JlZW4gYWxsIGNvbWUgZnJvbSB0aGlzIG1vZCB8IFRoZSBnYW1lIGRyYXdzIGl0cyBvd24gaW50ZXJmYWNlIGFyb3VuZCB0aGUgbWFwLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTptZXNzYWdlcy5yZXBsYWNlYCB8IERyYXcgdGhlIG1lc3NhZ2UgbGluZSBhdCB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gaW5zdGVhZCBvZiB0aGUgZ2FtZSB8IFRoZSBnYW1lIGRyYXdzIGl0cyBvd24gbWVzc2FnZSBsaW5lLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpzaWRlYmFyLnJlcGxhY2VgIHwgRHJhdyB0aGUgdml0YWxzIHBhbmVsIC0geW91ciBoaXQgcG9pbnRzLCBmb29kLCBhcm1vdXIgYW5kIGRlcHRoIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBkcmF3cyBpdHMgb3duIHZpdGFscyBwYW5lbC4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6c3RhdHVzLnJlcGxhY2VgIHwgRHJhdyB0aGUgc3RhdHVzIGxpbmUgYWxvbmcgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBkcmF3cyBpdHMgb3duIHN0YXR1cyBsaW5lLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTptZW51LnJlcGxhY2VgIHwgRHJhdyB0aGUgbWVudXMgYW5kIGNob2ljZXMgdGhlIGdhbWUgb2ZmZXJzIHlvdSBpbnN0ZWFkIG9mIHRoZSBnYW1lIHwgVGhlIGdhbWUgc2hvd3MgaXRzIG93biBtZW51cy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6c2NyZWVuLnJlcGxhY2VgIHwgRHJhdyB0aGUgZnVsbCBzY3JlZW5zIC0geW91ciBpbnZlbnRvcnksIGNoYXJhY3RlciBzaGVldCBhbmQgdGhlIHJlc3QgaW5zdGVhZCBvZiB0aGUgZ2FtZSB8IFRoZSBnYW1lIHNob3dzIGl0cyBvd24gZnVsbCBzY3JlZW5zLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpiaXJ0aC5yZXBsYWNlYCB8IERyYXcgdGhlIGNoYXJhY3RlciBjcmVhdGlvbiBzY3JlZW5zIGluc3RlYWQgb2YgdGhlIGdhbWUgfCBUaGUgZ2FtZSBzaG93cyBpdHMgb3duIGNoYXJhY3RlciBjcmVhdGlvbiBzY3JlZW5zLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGB1aTpyZWdpb24uY3JlYXRlYCB8IEFkZCBmdXJuaXR1cmUgb2YgaXRzIG93biB0byB5b3VyIHNjcmVlbiAtIHBhbmVscyB0aGlzIG1vZCBkcmF3cyBpdHNlbGYsIG92ZXIgdGhlIG1hcCBhbmQgYmVzaWRlIHRoZSBnYW1lJ3Mgb3duIHwgVGhlIHBhbmVscyB0aGlzIG1vZCBkcmF3cyBvbiB0aGUgZ2FtZSBzY3JlZW4gZG8gbm90IGFwcGVhci4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgdWk6cGFuZWwubW91bnRgIHwgRHJhdyBpdHMgb3duIGludGVyZmFjZSBvdmVyIHRoZSBnYW1lIHdpdGggcmVhbCB3ZWIgcGFnZXMgLSBpdCBjYW4gbG9vayBleGFjdGx5IGxpa2UgdGhlIGdhbWUncyBvd24gc2NyZWVucywgY292ZXIgdGhlbSBjb21wbGV0ZWx5LCBhbmQgcmVhZCB3aGF0ZXZlciB5b3UgdHlwZSwgcGFzdGUgb3IgZHJvcCBpbnRvIGl0IHwgVGhlIG1vZCdzIG93biB3aW5kb3dzIG92ZXIgdGhlIGdhbWUgZG8gbm90IG9wZW4uIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHVpOnJlZ2lvbmAgfCBBZGQgYW5kIHVwZGF0ZSBhIGhvc3QtcGFpbnRlZCB0ZXh0IHJlZ2lvbiBvbiB0aGUgZ2FtZSBzY3JlZW4gfCBUaGUgdGV4dCBhcmVhIHRoaXMgbW9kIGZpbGxzIG9uIHRoZSBnYW1lIHNjcmVlbiBzdGF5cyBlbXB0eS4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAp8IGB1aTpwYW5lbGAgfCBTaG93IHBhbmVscyBvZiBidXR0b25zIGFuZCB0ZXh0IHRoYXQgdGhlIGdhbWUgZHJhd3MgZm9yIHRoaXMgbW9kIHwgVGhlIHBhbmVscyB0aGlzIG1vZCBhc2tzIHRoZSBnYW1lIHRvIGRyYXcgZG8gbm90IGFwcGVhci4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYGJhY2t1cDpmb2xkZXJgIHwgV3JpdGUgZmlsZXMgaW50byBhIGZvbGRlciB5b3UgcGljayAoaXQgbmV2ZXIgbGVhcm5zIHRoZSBmb2xkZXIncyByZWFsIHBhdGgsIG9ubHkgd2hldGhlciBhIHdyaXRlIHN1Y2NlZWRlZCkgfCBUaGUgbW9kIGNhbm5vdCB3cml0ZSBiYWNrdXBzIHRvIGEgZm9sZGVyIHlvdSBwaWNrLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYG1vZDpyZWFkYCB8IExvb2sgdXAgYSBtb2QgYXQgYSByZXBvc2l0b3J5IGFkZHJlc3MsIHRoZSBzYW1lIHdheSBpbnN0YWxsaW5nIG9uZSBkb2VzIC0gaXRzIG5hbWUsIGRlc2NyaXB0aW9uLCBhdXRob3IsIHZlcnNpb24gYW5kIGZpbGUgbGlzdGluZyAtIGJ5IHJlYWNoaW5nIG91dCB0byB0aGF0IHJlcG9zaXRvcnkgb24geW91ciBiZWhhbGYuIE5vdGhpbmcgaXMgaW5zdGFsbGVkIGFuZCBub3RoaW5nIGlzIGFkZGVkIHRvIHlvdXIgbGlicmFyeSB8IFRoZSBtb2QgY2Fubm90IGxvb2sgdXAgb3RoZXIgbW9kcyBieSB0aGVpciByZXBvc2l0b3J5IGFkZHJlc3MuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYGRlYnVnOnNwYXduYCB8IENvbmp1cmUgaXRlbXMgYW5kIGNyZWF0dXJlcyBpbnRvIHlvdXIgZ2FtZSwgdGhlIHdheSB0aGUgZGVidWcgY29tbWFuZHMgZG8gLSBpdCBhc2tzIGZpcnN0LCBhbmQgdGhlIGNoYXJhY3RlciBpdCBoYXBwZW5zIHRvIGlzIG1hcmtlZCBmb3IgZ29vZCBhbmQgY2FuIG5vIGxvbmdlciBiZSBzY29yZWQgfCBUaGUgbW9kIGNhbm5vdCBjcmVhdGUgaXRlbXMgb3IgY3JlYXR1cmVzIGluIHlvdXIgZ2FtZS4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgZGVidWc6d2l6YXJkYCB8IFVzZSB0aGUgZ2FtZSdzIGRlYnVnIGNvbW1hbmRzIHRvIHRlc3Qgd2l0aCAtIGRlcHRoLCBleHBlcmllbmNlLCBnb2xkLCBpdGVtcywgY3JlYXR1cmVzIC0gYWZ0ZXIgc3RvcHBpbmcgdGhpcyBzZXNzaW9uIGZyb20gYmVpbmcgc2F2ZWQgYXQgYWxsLiBZb3VyIGNoYXJhY3RlciBvbiBkaXNrIGtlZXBzIHdoYXRldmVyIHRoZSBsYXN0IHNhdmUgbGVmdCBhbmQgbm90aGluZyBhZnRlciB0aGF0IGlzIHdyaXR0ZW4sIHdoaWNoIGNhbm5vdCBiZSB1bmRvbmUgd2l0aG91dCByZWxvYWRpbmcgfCBUaGUgbW9kIGNhbm5vdCB1c2UgdGhlIGdhbWUncyBkZWJ1ZyBjb21tYW5kcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBga2V5bWFwOndyaXRlYCB8IENyZWF0ZSBuZXcgc2hvcnRjdXQga2V5bWFwcyBpbiB5b3VyIGN1cnJlbnQga2V5c2V0IHdpdGhvdXQgcmVwbGFjaW5nIHlvdXIgZXhpc3Rpbmcgc2hvcnRjdXRzIHwgVGhlIHNob3J0Y3V0IGtleXMgdGhpcyBtb2Qgb2ZmZXJzIHRvIGFkZCBhcmUgbm90IGNyZWF0ZWQuIHwgbm8gfCBpbi1wcm9jZXNzIHwKfCBga2V5bWFwOmVkaXRgIHwgQ2hhbmdlLCByZXBsYWNlIGFuZCByZW1vdmUgYW55IG9mIHlvdXIga2V5bWFwcyBpbiB0aGUgY3VycmVudCBrZXlzZXQsIGFuZCByZWFkIHRoZSBuZXh0IGtleSB5b3UgcHJlc3MgdG8gYmluZCBpdCB8IFRoZSBtb2QncyBrZXltYXAgZWRpdG9yIGNhbm5vdCBjaGFuZ2UgeW91ciBrZXltYXBzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGBvcHRpb25zOndyaXRlYCB8IENoYW5nZSB5b3VyIHVzZXIgaW50ZXJmYWNlIG9wdGlvbnMgYW5kIGRlbGF5IHNldHRpbmdzLCBhcyB0aGUgb3B0aW9ucyBtZW51IGRvZXM7IGJpcnRoIGFuZCBjaGVhdCBvcHRpb25zIHN0YXkgeW91cnMgdG8gc2V0IHwgVGhlIG1vZCBjYW5ub3QgY2hhbmdlIHlvdXIgb3B0aW9uczsgdGhlIG9wdGlvbnMgbWVudSBzdGlsbCB3b3Jrcy4gfCBubyB8IGluLXByb2Nlc3MgfAp8IGBxdWVyeTpzbmFwc2hvdGAgfCBSZWFkIHRoZSBob3N0J3MgbmFtZWQsIGNsb25lZCBlbmdpbmUgYW5kIGNvbnRlbnQgc25hcHNob3RzIHwgVGhlIG1vZCBjYW5ub3QgcmVhZCB0aGUgZ2FtZSdzIHNuYXBzaG90cy4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYHBvbGljeTppbnN0YWxsYCB8IEluc3RhbGwgZGVjbGFyZWQgaG9zdC1zaWRlIHBvbGljaWVzIHRoYXQgdGhlIGdhbWUgZXZhbHVhdGVzIHN5bmNocm9ub3VzbHkgfCBUaGUgcnVsZXMgdGhpcyBtb2QgZGVjbGFyZXMgZm9yIHRoZSBnYW1lIHRvIGFwcGx5IGFyZSBub3QgaW5zdGFsbGVkLiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYGhvb2s6cmVzcG9uZGAgfCBBbnN3ZXIgYXBwcm92ZWQgYXN5bmNocm9ub3VzIGdhbWUgZGVjaXNpb25zIHdpdGggYSBzYWZlIHRpbWVvdXQgZmFsbGJhY2sgfCBUaGUgZ2FtZSBtYWtlcyB0aG9zZSBkZWNpc2lvbnMgd2l0aG91dCBhc2tpbmcgdGhpcyBtb2QuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKfCBgcmVnaXN0cnk6ZGVjbGFyZWAgfCBEZWNsYXJlIGhvc3Qtb3duZWQgY29tbWFuZHMgb3IgY29udGVudCB1c2luZyBhcHByb3ZlZCBkYXRhIHNjaGVtYXMgfCBUaGUgY29tbWFuZHMgYW5kIGNvbnRlbnQgdGhpcyBtb2QgZGVjbGFyZXMgYXJlIG5vdCBhZGRlZC4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAp8IGBwcmVmczpyZWFkYCB8IFJlYWQgdGhlIHNldHRpbmdzIHRoaXMgbW9kIHNhdmVkIGVhcmxpZXIgfCBUaGUgbW9kIHN0YXJ0cyBmcm9tIGl0cyBkZWZhdWx0cyBlYWNoIHRpbWUuIHwgbm8gfCBhbnkgY29kZSBtb2QgfAp8IGBwcmVmczp3cml0ZWAgfCBTYXZlIGl0cyBvd24gc2V0dGluZ3MgYmV0d2VlbiBzZXNzaW9ucyB8IENoYW5nZXMgdG8gdGhlIG1vZCdzIHNldHRpbmdzIGFyZSBsb3N0IHdoZW4geW91IGNsb3NlIHRoZSBnYW1lLiB8IG5vIHwgYW55IGNvZGUgbW9kIHwKfCBgYXNzZXQ6cmVhZGAgfCBSZWFkIGZpbGVzIHRoYXQgY2FtZSB3aXRoIHRoaXMgbW9kIHwgVGhlIG1vZCBjYW5ub3Qgb3BlbiB0aGUgaW1hZ2VzIGFuZCBkYXRhIGZpbGVzIGl0IHNoaXBzIHdpdGguIHwgbm8gfCBhbnkgY29kZSBtb2QgfAp8IGBzdGF0ZToqLnJlYWRgIHwgUmVhZCBBTEwgZ2FtZSBzdGF0ZSwgZXhjZXB0IHRoZSBwYXJ0cyBvZiB0aGUgbWFwIHlvdXIgY2hhcmFjdGVyIGhhcyBub3QgZm91bmQgfCBUaGUgbW9kIGNhbm5vdCByZWFkIHRoZSBnYW1lIHN0YXRlIGl0IHVzZXMuIHwgeWVzIHwgYW55IGNvZGUgbW9kIHwKfCBgc3RhdGU6bWFwLWFjdHVhbC5yZWFkYCB8IFNlZSB3aGF0IHRoZSBtYXAgcmVhbGx5IGhvbGRzLCBpbmNsdWRpbmcgdHJhcHMsIGl0ZW1zLCB0ZXJyYWluIGFuZCBjcmVhdHVyZXMgeW91ciBjaGFyYWN0ZXIgaGFzIG5vdCBmb3VuZCB8IFRoZSBtb2Qgc2VlcyBvbmx5IHdoYXQgeW91ciBjaGFyYWN0ZXIgaGFzIGZvdW5kLiB8IHllcyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBuZXR3b3JrOipgIHwgU2VuZCBuZXR3b3JrIHJlcXVlc3RzIHRvIEFOWSBob3N0ICh5b3VyIGRhdGEgY291bGQgbGVhdmUgdGhpcyBkZXZpY2UpIHwgVGhlIG1vZCBjYW5ub3QgcmVhY2ggdGhlIGludGVybmV0LiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYG5ldHdvcms6bG9jYWxgIHwgU2VuZCBuZXR3b3JrIHJlcXVlc3RzIHRvIHNlcnZlcnMgb24gdGhpcyBjb21wdXRlciBvciB5b3VyIGxvY2FsIG5ldHdvcmsgfCBUaGUgbW9kIGNhbm5vdCByZWFjaCBzZXJ2ZXJzIG9uIHRoaXMgY29tcHV0ZXIgb3IgeW91ciBsb2NhbCBuZXR3b3JrLiB8IHllcyB8IGFueSBjb2RlIG1vZCB8CnwgYHJlZ2lzdHJ5OipgIHwgT3ZlcnJpZGUgQU5ZIGdhbWUgc3lzdGVtIC0gZWZmZWN0cywgbGV2ZWwgYW5kIGR1bmdlb24gZ2VuZXJhdGlvbiwgbW9uc3RlciBhdHRhY2tzLCBzaG9wcywgY29tbWFuZHMsIG1vbnN0ZXIgQUksIHdoYXQgc3BlbGxzIGFuZCBicmVhdGhzIGRvLCB3aGF0IGEgdmF1bHQgc3ltYm9sIG1lYW5zLCBhbmQgdm9jYWJ1bGFyeSAoZnVsbCB0cnVzdGVkLCBpbi1wcm9jZXNzIGFjY2VzcykgfCBOb25lIG9mIHRoZSBnYW1lIHN5c3RlbXMgdGhpcyBtb2QgY2hhbmdlcyBhcmUgY2hhbmdlZCwgYW5kIHRoZSBtb2QgZG9lcyBub3Qgc3RhcnQuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OmVmZmVjdGAgfCBPdmVycmlkZSBlZmZlY3QsIGNvbWJhdCwgYW5kIG1hZ2ljIGxvZ2ljIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6cm9vbWAgfCBPdmVycmlkZSBkdW5nZW9uIC8gbGV2ZWwgZ2VuZXJhdGlvbiB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnByb2ZpbGVgIHwgQWRkIG5ldyBraW5kcyBvZiBkdW5nZW9uIGxldmVsLCBhbmQgY2hhbmdlIHdoaWNoIGtpbmQgeW91IGdldCBhdCBhIGRlcHRoIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Ymxvd2AgfCBDaGFuZ2Ugd2hhdCBtb25zdGVyIGF0dGFja3MgZG8gdG8geW91LCBhbmQgYWRkIG5ldyBraW5kcyBvZiBhdHRhY2sgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpzdG9yZWAgfCBDaGFuZ2Ugd2hhdCBzaG9wcyBidXkgZnJvbSB5b3UgYW5kIHdoYXQgdGhleSBrZWVwIGluIHN0b2NrIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Y29tbWFuZGAgfCBDaGFuZ2Ugd2hhdCBwbGF5ZXIgY29tbWFuZHMgZG8gKGFuZCBhZGQgY29tbWFuZHMpIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6bW9uc3RlcmAgfCBPdmVycmlkZSBtb25zdGVyIEFJICh0YWtlIG92ZXIgbW9uc3RlciB0dXJucykgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpwcm9qZWN0aW9uYCB8IENoYW5nZSB3aGF0IHNwZWxscywgYnJlYXRocyBhbmQgb3RoZXIgZWxlbWVudHMgZG8gdG8gdGhlIGR1bmdlb24sIHRvIGl0ZW1zIG9uIHRoZSBmbG9vciwgYW5kIHRvIHlvdSB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnVpLWVudHJ5YCB8IENoYW5nZSBob3cgeW91ciByZXNpc3RhbmNlcywgYWJpbGl0aWVzIGFuZCBzdGF0IG1vZGlmaWVycyBhcmUgd29ya2VkIG91dCBhbmQgZHJhd24gb24gdGhlIGNoYXJhY3RlciBzaGVldCBhbmQgdGhlIGVxdWlwbWVudCBjb21wYXJpc29uIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6Z2x5cGhgIHwgQ2hhbmdlIHdoYXQgdGhlIHN5bWJvbHMgaW4gYSByb29tIG9yIHZhdWx0IGxheW91dCBtZWFuIHdoZW4gYSBsZXZlbCBpcyBkcmF3biB8IFRoZSBtb2QgZG9lcyBub3Qgc3RhcnQsIGJlY2F1c2UgaXQgaW5zdGFsbHMgdGhpcyBjaGFuZ2UgYXMgaXQgbG9hZHMuIHwgeWVzIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OmVmZmVjdC1pbmZvYCB8IENoYW5nZSB3aGF0IHRoZSBnYW1lIHRlbGxzIHlvdSBhYm91dCBhIHNwZWxsLCBwb3Rpb24gb3Igd2FuZCBlZmZlY3QgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTpyYW5kYXJ0YCB8IENoYW5nZSBob3cgcmFuZG9tIGFydGlmYWN0cyBhcmUgYnVpbHQgLSB3aGF0IHBvd2VycyB0aGV5IGNhbiBnZXQsIGFuZCB3aGF0IGVhY2gga2luZCBvZiBpdGVtIHN0YXJ0cyB3aXRoIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6cnVuZWAgfCBUZWFjaCB0aGUgZ2FtZSBhYm91dCBhIG5ldyBraW5kIG9mIFJVTkUgLSB3aGF0IGl0IGlzIGNhbGxlZCwgd2hhdCBhbiBpdGVtIGNhcnJpZXMsIGFuZCBob3cgdGhlIHBsYXllciBsZWFybnMgaXQgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IHllcyB8IGluLXByb2Nlc3MgfAp8IGByZWdpc3RyeTp0dmFsYCB8IFRlYWNoIHRoZSBnYW1lIGFib3V0IGEgbmV3IGtpbmQgb2YgaXRlbSAtIHdoZXRoZXIgaXQgY2FuIGJlIHdvcm4gb3Igd2llbGRlZCwgaG93IGl0IGlzIHByaWNlZCwgYW5kIHdoZXRoZXIgaXQgaGFzIGFuIHVuaWRlbnRpZmllZCBmbGF2b3VyIHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6dm9jYWJgIHwgQWRkIG5ldyB2b2NhYnVsYXJ5IC0gZmxhZ3MsIHN0YXRzLCBhbmQgb3RoZXIgdGVybXMgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5Om1lbnVgIHwgUmV3cml0ZSBvbmUgbmFtZWQgZ2FtZSBtZW51J3Mgc2VtYW50aWMgcm93cyBhbmQgbGF5b3V0IHwgVGhlIG1vZCBkb2VzIG5vdCBzdGFydCwgYmVjYXVzZSBpdCBpbnN0YWxscyB0aGlzIGNoYW5nZSBhcyBpdCBsb2Fkcy4gfCB5ZXMgfCBpbi1wcm9jZXNzIHwKfCBgcmVnaXN0cnk6bWVzc2FnZWAgfCBBZGQgbmV3IG1lc3NhZ2UgdHlwZXMsIGFuZCBjaG9vc2Ugd2hpY2ggc291bmRzIHBsYXkgZm9yIHRoZW0gfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYHJlZ2lzdHJ5OnRpbGVzYCB8IFN1cHBseSB0aWxlcyBmb3IgY3JlYXR1cmVzIGFuZCBpdGVtcyB5b3VyIHRpbGUgc2V0IGRvZXMgbm90IGRyYXcgfCBUaGUgbW9kIGRvZXMgbm90IHN0YXJ0LCBiZWNhdXNlIGl0IGluc3RhbGxzIHRoaXMgY2hhbmdlIGFzIGl0IGxvYWRzLiB8IG5vIHwgaW4tcHJvY2VzcyB8CnwgYHByb2ZpbGVzOm1hbmFnZWAgfCBDcmVhdGUgcHJvZmlsZXMgYW5kIHN3aXRjaCBiZXR3ZWVuIHRoZW0gfCBUaGUgbW9kIGNhbm5vdCBjcmVhdGUgcHJvZmlsZXMgb3Igc3dpdGNoIGJldHdlZW4gdGhlbS4gfCB5ZXMgfCBmaXJzdC1wYXJ0eSBvbmx5IHwKfCBgc2Vzc2lvbjpjb250cm9sYCB8IFNhdmUgdGhlIGdhbWUsIHJldHVybiB0byB0aGUgdGl0bGUgc2NyZWVuLCBvciBxdWl0IHwgVGhlIG1vZCBjYW5ub3Qgc2F2ZSB0aGUgZ2FtZSwgbGVhdmUgaXQgb3IgcXVpdCBmb3IgeW91LiB8IG5vIHwgZmlyc3QtcGFydHkgb25seSB8CnwgYHNjcmVlbnM6bWFuYWdlYCB8IERyYXcgdGhlIGdhbWUncyBtb2QsIHByb2ZpbGUgYW5kIHNldHRpbmdzIHNjcmVlbnMgaW4gaXRzIG93biBsb29rIHwgVGhlIGdhbWUncyBvd24gbWFuYWdlbWVudCBzY3JlZW5zIGFyZSBzaG93biBpbnN0ZWFkLiB8IHllcyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBtb2Q6aW5zdGFsbGAgfCBBZGQgY29udGVudCBtb2RzIHRvIHlvdXIgbGlicmFyeSAtIHJlY29yZHMgYW5kIHR3ZWFrcywgbmV2ZXIgY29kZSwgYW5kIHRoZXkgYXJyaXZlIHN3aXRjaGVkIG9mZiB1bnRpbCB5b3UgcmVhZCB3aGF0IHRoZXkgYXNrIGZvciBhbmQgdHVybiB0aGVtIG9uIHlvdXJzZWxmIHwgVGhlIG1vZCBjYW5ub3QgYWRkIG1vZHMgdG8geW91ciBsaWJyYXJ5LiB8IHllcyB8IGZpcnN0LXBhcnR5IG9ubHkgfAp8IGBtb2Q6c2Vzc2lvbmAgfCBQdXQgY29udGVudCBtb2RzIGludG8gdGhlIGdhbWUgZm9yIHRoZSByZXN0IG9mIHRoaXMgc2Vzc2lvbiAtIHJlY29yZHMgYW5kIHR3ZWFrcywgbmV2ZXIgY29kZSAtIHdoaWNoIHN0YXJ0IHdvcmtpbmcgYXMgc29vbiBhcyB0aGUgZ2FtZSByZWxvYWRzLCB3aXRob3V0IHdhaXRpbmcgdG8gYmUgc3dpdGNoZWQgb24uIFRoZSBtb2QgaXMgZm9yZ290dGVuIHdoZW4geW91IGNsb3NlIHRoZSBnYW1lOyB3aGF0IGl0IGRpZCB0byBhIGNoYXJhY3RlciBpcyBub3QgfCBUaGUgbW9kIGNhbm5vdCBsb2FkIHRlc3QgY29udGVudCBpbnRvIHRoaXMgc2Vzc2lvbi4gfCB5ZXMgfCBmaXJzdC1wYXJ0eSBvbmx5IHwKfCBgZXZlbnQ6PG5hbWU+YCB8IE9ic2VydmUgdGhlICJ7bmFtZX0iIGdhbWUgZXZlbnQgfCBUaGUgbW9kIGlzIG5vdCB0b2xkIHdoZW4gdGhpcyBldmVudCBoYXBwZW5zLiB8IG5vIHwgYW55IGNvZGUgbW9kIHwKfCBgc3RhdGU6PGRvbWFpbj4ucmVhZGAgfCBSZWFkIHtkb21haW59IGdhbWUgc3RhdGUgfCBUaGUgbW9kIGNhbm5vdCByZWFkIHRoaXMgcGFydCBvZiB0aGUgZ2FtZSBzdGF0ZS4gfCBubyB8IGFueSBjb2RlIG1vZCB8CnwgYG5ldHdvcms6PGhvc3Q+YCB8IFNlbmQgbmV0d29yayByZXF1ZXN0cyB0byB7aG9zdH0gfCBUaGUgbW9kIGNhbm5vdCByZWFjaCB0aGlzIHNlcnZlci4gfCB5ZXMgfCBhbnkgY29kZSBtb2QgfAoKIyMjIFdoYXQgYSBjYXBhYmlsaXR5IGdhdGVzLCBhbmQgd2hhdCBpdCBkb2VzIG5vdAoKVGhlIHJ1bGUgYWJvdmUgaXMgYWNjdXJhdGUsIGJ1dCBuYXJyb3dlciB0aGFuIGl0IGxvb2tzOiB0aGUgZ2F0ZSBpcyBvbiB0aGUgZmFjYWRlLCBub3Qgb24gdGhlIHJlZ2lzdHJ5IGJlaGluZCBpdC4gQSBgcmVnaXN0cnk6KmAgY2FwYWJpbGl0eSBpcyBhIGRlY2xhcmF0aW9uLCBhbmQgd2hhdCBpdCBnaXZlcyB5b3UgaXMgcmVhbCBidXQgbGltaXRlZDoKCi0gdGhlIHBsYXllciBzZWVzIHRoZSBsaXN0LCBpbiBwbGFpbiBsYW5ndWFnZSwgYmVmb3JlIGNvbnNlbnRpbmc7Ci0gdGhlIGNvbmZsaWN0IHJlcG9ydCBhbmQgdGhlIG1hbmFnZXIgcm93IGFyZSBidWlsdCBmcm9tIGl0OwotIGFuIGF1dGhvciB3aG8gZm9yZ290IHRvIGRlY2xhcmUgYSBkb21haW4gZ2V0cyBhIGNsZWFyIHRocm93IHdpdGggdGhlIGNhcGFiaWxpdHkgbmFtZSBpbiBpdCwgaW5zdGVhZCBvZiBhIHNpbGVudCBzdXJwcmlzZSBsYXRlci4KCkl0IGRvZXMgbm90IGZlbmNlIG9mZiB0aGUgcmVnaXN0cnkuIFlvdXIgYHJlZ2lzdGVyKGhvc3QsIGN0eClgIGlzIGhhbmRlZCB0aHJlZSBzZXRzIG9mIG9iamVjdHMgd2l0aCBubyBjYXBhYmlsaXR5IGNoZWNrIGF0IGFsbCwgYmVjYXVzZSBhIG1vZCBpcyBtZWFudCB0byBiZSBhYmxlIHRvIGxvb2sgYXQgZXZlcnl0aGluZyB3aXRob3V0IGRlY2xhcmluZyBhbnl0aGluZzoKCnwgSGFuZGVkIHRvIHlvdSB1bmdhdGVkIHwgVGhlIGdhdGVkIGZhY2FkZSBpdCBpcyB0aGUgdHdpbiBvZiB8CnwtLS18LS0tfAp8IGBjdHgucmVnaXN0cmllcy5yb29tc2AsIGAucHJvZmlsZXNgLCBgLnJvb21zLmdseXBoc2AgfCBgcmVnaXN0cnk6cm9vbWAsIGByZWdpc3RyeTpwcm9maWxlYCwgYHJlZ2lzdHJ5OmdseXBoYCB8CnwgYGN0eC5zdGF0ZS5ibG93RWZmZWN0c2AsIGAuc3RvcmVCZWhhdmlvdXJgLCBgLnByb2plY3Rpb25IYW5kbGVyc2AsIGAudWlFbnRyeWAsIGAuY29tbWFuZFZlcmJzYCwgYC5tb25zdGVyVHVybkhvb2tgIHwgYHJlZ2lzdHJ5OmJsb3dgLCBgcmVnaXN0cnk6c3RvcmVgLCBgcmVnaXN0cnk6cHJvamVjdGlvbmAsIGByZWdpc3RyeTp1aS1lbnRyeWAsIGByZWdpc3RyeTpjb21tYW5kYCwgYHJlZ2lzdHJ5Om1vbnN0ZXJgIHwKfCBgY3R4LmNvcmUudHZhbFJlZ2lzdHJ5KClgLCBgLnJ1bmVSZWdpc3RyeSgpYCwgYC5yYW5kYXJ0UmVnaXN0cnkoKWAsIGAuZWZmZWN0SW5mb1JlZ2lzdHJ5KClgLCBgLm1lc3NhZ2VUeXBlc2AsIGAuc291bmRQcmVmUmVnaXN0cnlgIHwgYHJlZ2lzdHJ5OnR2YWxgLCBgcmVnaXN0cnk6cnVuZWAsIGByZWdpc3RyeTpyYW5kYXJ0YCwgYHJlZ2lzdHJ5OmVmZmVjdC1pbmZvYCwgYHJlZ2lzdHJ5Om1lc3NhZ2VgIHwKCmBjdHguYXV0aG9yaW5nYCBhbmQgYGN0eC5jb21wb3NlZFJlY29yZHNgIGFyZSB1bmdhdGVkIHRvbywgZm9yIGEgZGlmZmVyZW50IHJlYXNvbjogdGhleSBhcmUgbm90IHR3aW5zIG9mIGFueSBnYXRlZCBmYWNhZGUuIFRoZSBiYXJyZWwgaXMgcHVyZSBmdW5jdGlvbnMgb3ZlciBkYXRhIHlvdSBwYXNzIGluLCBhbmQgdGhlIHJlY29yZHMgYXJlIGNvbnRlbnQgdGhlIHBsYXllciBhbHJlYWR5IGhhcywgaW4gdGhlIHNoYXBlIGl0IHdhcyByZWFkIGluLiBOZWl0aGVyIGlzIGEgc2Vjb25kIHJvdXRlIHRvIGEgZ2F0ZWQgZmFjYWRlLgoKVGhvc2UgYXJlIHRoZSBzYW1lIGxpdmUgb2JqZWN0cywgYnkgaWRlbnRpdHksIG5vdCBjb3BpZXMuIGBjdHguY29yZWAgYWxzbyBleHBvcnRzIGBjcmVhdGVNb2RSZWdpc3RyeUhvc3RgIGl0c2VsZiwgd2hpY2ggZ3JhbnRzIGV2ZXJ5IGRvbWFpbiB3aGVuIGNhbGxlZCB3aXRob3V0IGEgY2FwYWJpbGl0eSBzZXQsIHNvIGFueXRoaW5nIGhvbGRpbmcgdGhlIG5hbWVzcGFjZSBpcyBvbmUgY2FsbCBhd2F5IGZyb20gYW4gdW5nYXRlZCBob3N0LgoKVGhhdCBmb2xsb3dzIGZyb20gaG93IHBsdWdpbnMgcnVuLiBBIHRydXN0ZWQgcGx1Z2luIHJ1bnMgaW4tcHJvY2Vzcywgc3luY2hyb25vdXNseSwgaG9sZGluZyB0aGUgZW5naW5lIG5hbWVzcGFjZSwgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5IHdheSBhIGhhbmRsZXIgY2FuIHRvdWNoIHRoZSBsaXZlIGBybmdgLCBgY2h1bmtgIGFuZCBgcGxheWVyYCBkZWVwIGluc2lkZSBhIHR1cm4gKHRoZSByZWFzb25pbmcgaXMgaW4gYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCwgdW5kZXIgV0hZIElOLVBST0NFU1MgQU5EIFRSVVNURUQpLiBOb3RoaW5nIHJlYWNoYWJsZSBmcm9tIHRoYXQgbmFtZXNwYWNlIGNhbiBiZSB3aXRoaGVsZCBmcm9tIGNvZGUgYWxyZWFkeSBpbnNpZGUgaXQsIGFuZCBhIHJlYWQtb25seSB2aWV3IG92ZXIgYGN0eC5yZWdpc3RyaWVzYCB3b3VsZCBjbG9zZSB0aHJlZSBvZiB0aGUgZmlmdGVlbiB0d2lucyBhYm92ZSB3aGlsZSBsb29raW5nIGFzIHRob3VnaCBpdCBoYWQgY2xvc2VkIGFsbCBvZiB0aGVtLiBgcGFja2FnZXMvd2ViL3NyYy9jYXBhYmlsaXR5LWdhdGUtcmVhY2gudGVzdC50c2AgdGVzdHMgYm90aCBoYWx2ZXM6IHRoZSBnYXRlIHJlZnVzaW5nLCBhbmQgdGhlIHR3aW4gcmVhY2hpbmcuCgpUaGUgc2FtZSBob2xkcyBmb3Igb3RoZXIgY2FwYWJpbGl0eSBmYW1pbGllcyBpbiB0aGUgaW4tcHJvY2VzcyB0aWVyLiBgc3RhdGU6PGRvbWFpbj4ucmVhZGAgZ2F0ZXMgdGhlIHBlcmNlaXZlIGZhY2FkZSdzIGFjY2Vzc29ycyBwZXIgZG9tYWluLCBidXQgYGN0eC5zdGF0ZWAgaXMgdGhlIHdob2xlIGxpdmUgYEdhbWVTdGF0ZWAuIGBuZXR3b3JrOjxob3N0PmAgZ2F0ZXMgYGN0eC5uZXRgLCB3aGljaCByZWZ1c2VzIGEgcmVxdWVzdCB0byBhbiB1bmRlY2xhcmVkIGhvc3QsIGJ1dCBhIHBsdWdpbiBpcyBhbiBFUyBtb2R1bGUgaW4gdGhlIGdhbWUncyBvd24gcGFnZSB3aXRoIHRoZSBnbG9iYWwgYGZldGNoYCBpbiBzY29wZS4KCldvcmtlciBtb2RzIGFyZSBkaWZmZXJlbnQuIEEgV29ya2VyIHNpdHMgYmVoaW5kIGEgbWVzc2FnZSBwb3J0IGFuZCBnZXRzIHRoZSBwZXJjZWl2ZSwgYWN0IGFuZCBldmVudCBjYWxscyB0aGUgYnJva2VyIG9mZmVycywgd2l0aCBubyBgY3R4LmNvcmVgLCBgY3R4LnN0YXRlYCBvciBgY3R4LnJlZ2lzdHJpZXNgIHRvIGdvIGFyb3VuZCB0aGVtLCBzbyBhIGNhcGFiaWxpdHkgaXQgbGFja3Mgc3RheXMgb3V0IG9mIHJlYWNoLiBUaGUgYnJva2VyIGluIGBwYWNrYWdlcy93ZWIvc3JjL21vZC13b3JrZXIvaG9zdC50c2AgbWF0Y2hlcyBlYWNoIHJlcXVlc3QgYWdhaW5zdCBvbmUgZXhhY3Qgc3RyaW5nLiBBIHN0YXRlIHN1YnNjcmlwdGlvbiwgZm9yIGV4YW1wbGUsIG5lZWRzIGBzdGF0ZTptb2RlbC5yZWFkYCBpdHNlbGYsIGFuZCBgc3RhdGU6Ki5yZWFkYCBkb2VzIG5vdCBzdGFuZCBpbiBmb3IgaXQgdGhlcmUuIE9uZSBjYXBhYmlsaXR5IHN0cmluZyBjYW4gdGhlcmVmb3JlIG1lYW4gYSBoYXJkIHdhbGwgZm9yIGEgV29ya2VyIG1vZCBhbmQgYSBkZWNsYXJhdGlvbiBmb3IgYW4gaW4tcHJvY2VzcyBwbHVnaW47IHRoZSByZXN0IG9mIHRoaXMgc2VjdGlvbiBpcyBhYm91dCBpbi1wcm9jZXNzIHBsdWdpbnMuCgpGb3IgaW4tcHJvY2VzcyBwbHVnaW5zLCB0aGUgcmVhbCBib3VuZGFyeSBpcyB0aGUgaW5zdGFsbC4gQSBtb2QgaXMgY29kZSwgbm9ib2R5IGluIHRoaXMgcHJvamVjdCByZXZpZXdzIGl0LCBhbmQgdGhlIHBsYXllciBtYWtlcyB0aGF0IGRlY2lzaW9uIHdpdGggdGhlIHRvZ2dsZSBvbiB0aGUgTW9kcyBzY3JlZW4gKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1jb25zZW50LnRzYCkuIFNvIHRoZSBjb25zZW50IHNjcmVlbiBzaG93cyB0aGUgaW4tcHJvY2VzcyB3YXJuaW5nIGZvciBhbnkgbW9kIHRoYXQgc2hpcHMgY29kZSwgd2hhdGV2ZXIgaXRzIGRlY2xhcmVkIGxpc3Qgc2F5cywgYW5kIHRoZSBtYW5hZ2VyIHJvdyBmb3IgYSBwbHVnaW4gdGhhdCBkZWNsYXJlcyBub3RoaW5nIHNheXMgc28gaW5zdGVhZCBvZiBsb29raW5nIHJlYXNzdXJpbmcuCgpTbyBkZWNsYXJlIHdoYXQgeW91IG92ZXJyaWRlLiBUaGUgdGhyb3cgaXMgbm90IHRoZSBvbmx5IHJlYXNvbjogdGhlIGRlY2xhcmF0aW9uIGlzIHdoYXQgdGhlIHBsYXllciByZWFkcyBhbmQgd2hhdCB0aGUgY29uZmxpY3QgcmVwb3J0IGlzIGJ1aWx0IGZyb20uIElmIHlvdSByZWFjaCBhIHJlZ2lzdHJ5IGFyb3VuZCBpdHMgZmFjYWRlLCB0aGUgcGxheWVyIGhhcyBjb25zZW50ZWQgdG8gYSBtb2QgdGhhdCBkaWQgbm90IHNheSB3aGF0IGl0IGRvZXMsIGFuZCB0aGUgbWFuYWdlciBjYW5ub3Qgc2VlIHRoZSBjbGFzaCB0byByZXBvcnQgaXQuCgojIyMgT3ZlcndyaXRpbmcgYW5kIGV4dGVuZGluZzogeW91cnMsIGNvcmUncywgb3Igc29tZWJvZHkgZWxzZSdzCgpFdmVyeSByZWdpc3RyeSBoZXJlIGlzIGtleWVkLCBhbmQgeW91IHdyaXRlICoqb25lIGtleSBhdCBhIHRpbWUqKi4gVGhhdCBpcyB3aGF0Cm1ha2VzIHR3byBtb2RzIGFibGUgdG8gdG91Y2ggdGhlIHNhbWUgc3lzdGVtOiB0aGUgbGFzdCBvbmUgdG8gd3JpdGUgYSBrZXkgd2lucwp0aGF0IGtleSwgYW5kIGV2ZXJ5IG90aGVyIGtleSBlaXRoZXIgbW9kIHdyb3RlIHN1cnZpdmVzLiBIYW5kaW5nIG92ZXIgYSB3aG9sZQp0YWJsZSBpbnN0ZWFkIHdvdWxkIG1lYW4gdGhlIHNlY29uZCBtb2QgbG9hZGVkIHNpbGVudGx5IGVyYXNlZCB0aGUgZmlyc3QuCgpFYWNoIGZhY2FkZSBhbHNvIGhhbmRzIGJhY2sgd2hhdCBpcyBpbnN0YWxsZWQgKnJpZ2h0IG5vdyosIHNvIGV4dGVuZGluZyBpcyB0aGUKc2FtZSBtb3ZlIGFzIHJlcGxhY2luZzoKCmBgYGpzCnJlZ2lzdGVyKGhvc3QpIHsKICAvLyBZb3VyIG93biBlbGVtZW50LCBnaXZlbiBhIGJvZHkuCiAgaG9zdC5wcm9qZWN0aW9ucy5wbGF5ZXIuc2V0KCJmcm9zdDpyaW1lIiwgKGN0eCkgPT4gewogICAgY3R4Lm1zZygiVGhlIHJpbWUgYml0ZXMgZGVlcGVyIHRoYW4gY29sZC4iKTsKICAgIGN0eC5pbmNUaW1lZChUTURfU0xPVywgNSwgdHJ1ZSk7CiAgfSk7CgogIC8vIENvcmUncyBGSVJFLCBleHRlbmRlZC4gYHByZXZpb3VzYCBpcyBjb3JlJ3MgaGFuZGxlciwgb3IsIGlmIGEgbW9kIGxvYWRlZAogIC8vIGJlZm9yZSB5b3VycyBhbHJlYWR5IHJlcGxhY2VkIGl0LCBUSEVJUlMuIFlvdSBkbyBub3QgbmVlZCB0byBrbm93IHdoaWNoLgogIGNvbnN0IHByZXZpb3VzID0gaG9zdC5wcm9qZWN0aW9ucy5wbGF5ZXIuaGFuZGxlckZvcigiRklSRSIpOwogIGhvc3QucHJvamVjdGlvbnMucGxheWVyLnNldCgiRklSRSIsIChjdHgpID0+IHsKICAgIHByZXZpb3VzKGN0eCk7CiAgICBjdHgubXNnKCJZb3VyIGNsb2FrIHNtb3VsZGVycy4iKTsKICB9KTsKfQpgYGAKCmBoYW5kbGVyRm9yYCBpcyBvbiBldmVyeSBmYWNhZGUgaW4gdGhlIHRhYmxlIGFib3ZlOiBgYmxvd3MuaGFuZGxlckZvcmAsCmBzdG9yZXMud2lsbEJ1eUZvcmAsIGBwcm9maWxlcy5idWlsZGVyYC4gUmVhY2ggZm9yIGl0IGJlZm9yZSByZWltcGxlbWVudGluZwphbnl0aGluZzogYSB3cmFwcGVyIHN1cnZpdmVzIGEgY29yZSBjaGFuZ2UgdGhhdCBhIGNvcHkgZG9lcyBub3QuCgpNZW51cyBhcmUgZGVjbGFyZWQgYnkgc3RhYmxlIGlkcyBzdWNoIGFzIGBjb3JlOmdhbWUtbWVudWAgYW5kCmBjb3JlOmtub3dsZWRnZS1ncm91cGAsIG5ldmVyIHRoZWlyIGxvY2FsaXplZCB0aXRsZXMuIEVhY2ggcm93IGhhcyBhIHN0YWJsZQpgaWRgIHBsdXMgYHNlbWFudGljOiB7IGtpbmQsIHJlZj8sIGRhdGE/IH1gOiBhIGNvbW1hbmQgd2hlZWwgY2FuIHVzZSBhIGNvbW1hbmQKcm93J3MgYHJlZmAsIHdoaWxlIGFuIGludmVudG9yeSBncmlkIGNhbiB1c2UgYW4gaXRlbSByb3cgd2l0aG91dCByZXZlcnNlLXBhcnNpbmcKdGhlIGxhYmVsLiBBIHRyYW5zZm9ybWVyIHJlY2VpdmVzIHRob3NlIHJvd3MsIG1heSBhZGQvcmVtb3ZlL3Jlb3JkZXIvcmVsYWJlbCwKYW5kIHJldHVybnMgdGhlIHJlcGxhY2VtZW50IHJvdyBhcnJheToKCmBgYGpzCnJlZ2lzdGVyKGhvc3QpIHsKICBjb25zdCBwcmV2aW91cyA9IGhvc3QubWVudXMuaGFuZGxlckZvcigiY29yZTpnYW1lLW1lbnUiKTsKICBob3N0Lm1lbnVzLnJlZ2lzdGVyKCJjb3JlOmdhbWUtbWVudSIsIChpZCwgcm93cykgPT4gWwogICAgLi4uKHByZXZpb3VzID8gcHJldmlvdXMoaWQsIHJvd3MpIDogcm93cyksCiAgICB7IGlkOiAibXktbW9kOnJlc3QiLCBsYWJlbDogIlJlc3QiLCBzZW1hbnRpYzogeyBraW5kOiAiY29tbWFuZCIsIHJlZjogInJlc3QiIH0gfSwKICBdKTsKfQpgYGAKClRoYXQgdHJhbnNmb3JtZXIgY2hhbmdlcyBwcmVzZW50YXRpb24gb25seTogYSByb3cgaXQgaW52ZW50cyBoYXMgbm8gY29yZSBhY3Rpb24KYmVoaW5kIGl0LiBUbyBhZGQgYSAqKnJ1bm5hYmxlKiogcm93IG9mIHlvdXIgb3duLCBkZWNsYXJlIGByZWdpc3RyeTptZW51YCBhbmQKdXNlIGBhZGRBY3Rpb25gIGluc3RlYWQuIFRoZSBob3N0IG5hbWVzcGFjZXMgYGFjdGlvbmAgYnkgeW91ciBtb2QgaWQsIGFwcGVuZHMKdGhlIHJvdyB0byB0aGUgRXNjYXBlIEdhbWUgbWVudSwgYW5kIGNhbGxzIG9ubHkgeW91ciBoYW5kbGVyIHdoZW4gdGhlIHBsYXllcgpzZWxlY3RzIGl0LiBUaGUgaGFuZGxlciBiZWdpbnMgaW4gdGhlIHNlbGVjdGlvbiBnZXN0dXJlLCBzbyBpdCBtYXkgb3BlbiBhCmJyb3dzZXIgZm9sZGVyIHBpY2tlci4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGhvc3QubWVudXMuYWRkQWN0aW9uKAogICAgImNvcmU6Z2FtZS1tZW51IiwKICAgICJjaG9vc2UtYmFja3VwLWZvbGRlciIsCiAgICAiQ2hvb3NlIGJhY2t1cCBmb2xkZXIuLi4iLAogICAgYXN5bmMgKCkgPT4gewogICAgICBjb25zdCBuYW1lID0gYXdhaXQgY3R4LmJhY2t1cEZvbGRlcj8uY2hvb3NlKCk7CiAgICAgIGN0eC5sb2cobmFtZSA/IGBVc2luZyBiYWNrdXAgZm9sZGVyOiAke25hbWV9YCA6ICJCYWNrdXAgZm9sZGVyIHVuY2hhbmdlZC4iKTsKICAgIH0sCiAgKTsKfQpgYGAKCmBjb3JlOmdhbWUtbWVudWAgaXMgdGhlIG9ubHkgYWN0aW9uIGxvY2F0aW9uIGluIHRoaXMgQVBJIHZlcnNpb24uIEEgY2FsbGJhY2sKdGhhdCB0aHJvd3MgaXMgcmVwb3J0ZWQgYWdhaW5zdCBpdHMgbW9kIGFuZCByZXR1cm5zIHRoZSBwbGF5ZXIgdG8gdGhlIEdhbWUgbWVudTsKaXQgbmV2ZXIgZmFsbHMgdGhyb3VnaCB0byBhIHNpbWlsYXJseSBwb3NpdGlvbmVkIGNvcmUgcm93LgoKUGx1Z2luIGNvZGUgcnVucyAqKmluIHByb2Nlc3MsIHN5bmNocm9ub3VzbHkqKiwgd2l0aCB0aGUgc2FtZSBhY2Nlc3MgdG8gdGhlIHJuZywKdGhlIGNodW5rLCB0aGUgcGxheWVyIGFuZCB0aGUgbW9uc3RlciB0aGF0IGNvcmUgaGFzLCBiZWNhdXNlIGEgZGVlcCBvdmVycmlkZQpjYW5ub3QgY3Jvc3MgYW4gYXN5bmMsIGlzb2xhdGVkIFdvcmtlciBib3VuZGFyeS4gU28gaXQgaXMgdHJ1c3RlZCBjb2RlLCBleGFjdGx5IGFzCml0IGlzIGluIFNLU0Ugb3IgRm9yZ2UsIGFuZCB0aGUgY29uc2VudCBwcm9tcHQgaXMgdGhlIGJvdW5kYXJ5LiBJZiB5b3VyIG1vZCBvbmx5Cm5lZWRzIHRvIHJlYWN0IHRvIGV2ZW50cyByYXRoZXIgdGhhbiBvdmVycmlkZSBzeXN0ZW1zLCB0aGUgdW50cnVzdGVkIFdvcmtlciB0aWVyCmV4aXN0cyBmb3IgdGhhdCBhbmQgbmVlZHMgbm8gdHJ1c3QgYXQgYWxsLgoKIyMgVGVzdGluZyB5b3VycwoKUG9pbnQgdGhlIGdhbWUgYXQgeW91ciBmb2xkZXIgYW5kIHJlYWQgdGhlIG1vZCBtYW5hZ2VyOiBpdCBsaXN0cyB3aGF0IHdhcyBmb3VuZCwKYW5kIG9uZSBsaW5lIHBlciBwYWNrIGl0IGNvdWxkIG5vdCB1c2UuIGBXaGVyZSBtb2RzIGNvbWUgZnJvbWAgbmFtZXMgdGhlIGV4YWN0CmRpcmVjdG9yeS4KClRoZSBsb2FkZXIgaXRzZWxmIGlzIGNvdmVyZWQgYnkgYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWNvZGUudGVzdC50c2AgKHRoZSBnYXRlcywKd2l0aCB0aGUgaW1wb3J0ZXIgaW5qZWN0ZWQgc28gYW4gYWJzZW5jZSBvZiBleGVjdXRpb24gY2FuIGJlIGFzc2VydGVkKSBhbmQKYG1vZC1jb2RlLm5vZGUudGVzdC50c2AgKGEgcmVhbCBmb2xkZXIgb24gZGlzaywgYSByZWFsIGR5bmFtaWMgaW1wb3J0LCBhIHJlYWwKYE1vZEhvb2tzYCBjb21pbmcgYmFjayBvdXQpLiBUaGUgc2Vjb25kIGlzIHRoZSBvbmUgd29ydGggY29weWluZyBpZiB5b3Ugd2FudCBhCmhhcm5lc3Mgb2YgeW91ciBvd24uCg=="
  },
  {
    "id": "api2",
    "path": "API2.md",
    "audience": "advanced",
    "title": "Mod API 2",
    "note": "The next plugin API: domains, results, events, hooks and storage.",
    "encoded": "IyBNb2QgQVBJIDIKCkFQSSAyIGlzIHRoZSBzZXQgb2YgY2FsbHMgYSBtb2QncyBjb2RlIGdldHMgZnJvbSB0aGUgZ2FtZTogd2hhdCBpdCBjYW4gcmVhZCwgd2hhdCBpdCBjYW4gZG8sIGFuZCB3aGF0IGl0IGhlYXJzLiBFdmVyeSBjYWxsIHJldHVybnMgcGxhaW4gZGF0YSwgYSBwZXJtaXNzaW9uIHRoZSBwbGF5ZXIgdHVybmVkIGRvd24gY29tZXMgYmFjayBhcyBhIHJlc3VsdCB5b3UgY2FuIGNoZWNrLCBhbmQgcmVhZHMgc2hvdyB0aGUgZ2FtZSBhcyB0aGUgcGxheWVyIGtub3dzIGl0LiBUaGUgdHlwZXMgYXJlIGluIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCwgYW5kIHRoZSBpbi1wcm9jZXNzIGhvc3QgaXMgaW4gdGhlIHdlYiBwYWNrYWdlIChgcGFja2FnZXMvd2ViL3NyYy9tb2QtYXBpMi1ob3N0LnRzYCkuCgpTdGF0dXM6IHRoZSB0eXBlcywgdGhlIHZlcnNpb24gY2hlY2sgYW5kIHRoZSBpbi1wcm9jZXNzIGhvc3QgYXJlIGJ1aWx0LCBidXQgdGhlIGZvbGRlciBsb2FkZXIgZG9lcyBub3QgcnVuIGFuIEFQSSAyIG1vZCB5ZXQuIEEgbWFuaWZlc3QgYXQgc2NoZW1hIDIgZGVjbGFyZXMgYW4gYGFwaWAgcmFuZ2UuIEFuIGluLXByb2Nlc3MgbW9kIHdob3NlIHJhbmdlIGFkbWl0cyBBUEkgMSAoYDEuMC4wYCkgbG9hZHMgYXMgYW4gQVBJIDEgcGx1Z2luLCBhbmQgb25lIHdob3NlIHJhbmdlIGFkbWl0cyBvbmx5IEFQSSAyIGlzIHJlZnVzZWQgd2l0aCB0aGUgcHJvYmxlbSB0aGF0IGl0IG5lZWRzIGEgbW9kIEFQSSB0aGlzIGJ1aWxkIGRvZXMgbm90IHByb3ZpZGUuIGBhcGkyUGx1Z2luYCBpbiBgcGFja2FnZXMvd2ViL3NyYy9tb2QtYXBpMi1zaGltLnRzYCB3cmFwcyBhIGRlZmluaXRpb24gYXMgYW4gQVBJIDEgcGx1Z2luIHdpdGggYGFwaTogMWAsIHNvIHRoZSBleGlzdGluZyBsb2FkZXIgY2FuIHJlZ2lzdGVyIGl0IHdpdGggdGhlIHNhbWUgZ3JhbnRzIGFuZCBob29rIGNvbXBvc2l0aW9uLCBidXQgdGhlIGxvYWRlciBuZXZlciBjYWxscyBpdCBieSBpdHNlbGYuIFRoZSBXb3JrZXIgcnVudGltZSBkZWNsYXJlcyB0aGUgQVBJIGAyLjAuMC13b3JrZXJgIGFuZCBrZWVwcyBpdHMgb3duIG1lc3NhZ2UgcHJvdG9jb2wgKHNlZSBgUExVR0lOX1NBTkRCT1hfREVTSUdOLm1kYCBhbmQgYFdPUktFUl9JU09MQVRJT04ubWRgKS4gVGhhdCB2ZXJzaW9uIGlzIGEgcHJlcmVsZWFzZSwgc28gbm8gc3RhYmxlIDIueCByYW5nZSBhZG1pdHMgaXQuIEFQSSAxIHBsdWdpbnMgcnVuIHVuY2hhbmdlZC4KCiMjIEEgbW9kIGluIEFQSSAyCgpBIG1vZCdzIGNvZGUgZGVmYXVsdC1leHBvcnRzIGEgZGVmaW5pdGlvbjoKCmBgYHRzCmltcG9ydCB7IGRlZmluZUFwaTJNb2QgfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKCmV4cG9ydCBkZWZhdWx0IGRlZmluZUFwaTJNb2QoewogIGFwaTogIj49Mi4wLjAgPDMuMC4wIiwKICBob29rczogKHsgZmxhZ3MgfSkgPT4gKHsKICAgIG1lc3NhZ2VUZXh0OiAocmF3KSA9PiAoZmxhZ3NbInNob3V0Il0gPyByYXcudG9VcHBlckNhc2UoKSA6IHJhdyksCiAgfSksCiAgYXN5bmMgc3RhcnQobW9kKSB7CiAgICBjb25zdCBtb25zdGVycyA9IGF3YWl0IG1vZC52aWV3Lm1vbnN0ZXJzKCk7CiAgICBpZiAoIW1vbnN0ZXJzLm9rKSB7CiAgICAgIG1vZC5tZXRhLmxvZyhgbm8gbW9uc3RlciBsaXN0OiAke21vbnN0ZXJzLnJlYXNvbn1gKTsKICAgICAgcmV0dXJuOwogICAgfQogICAgbW9kLm1ldGEubG9nKGAke21vbnN0ZXJzLnZhbHVlLmxlbmd0aH0gbW9uc3RlcnMgaW4gc2lnaHRgKTsKICB9LAp9KTsKYGBgCgpgaG9va3NgIGlzIGFza2VkIG9uY2Ugd2hlbiBjb250ZW50IGNvbXBvc2VzIGFuZCBnZXRzIG9ubHkgdGhlIG1vZCdzIGlkIGFuZCBmbGFncy4gYHN0YXJ0YCBydW5zIHdoZW4gdGhlIGdhbWUgaXMgcmVhZHkgYW5kIGdldHMgdGhlIEFQSS4gYHN0b3BgIHJ1bnMgYmVmb3JlIHRoZSBtb2QgaXMgdGFrZW4gZG93biwgYG1pZ3JhdGVCYWcoZGF0YSwgZnJvbVNjaGVtYSlgIGJyaW5ncyB0aGUgbW9kJ3MgY2hhcmFjdGVyIGRhdGEgZm9yd2FyZCwgYW5kIGBwcmVmc2AgZGVjbGFyZXMgaG93IHN0b3JlZCBwcmVmZXJlbmNlcyBtaWdyYXRlIChzZWUgU3RvcmFnZSkuCgpgY2hlY2tBcGkyRGVmaW5pdGlvbmAsIHRoZSBjaGVjayBgYXBpMlBsdWdpbmAgcnVucywgcmVmdXNlcyBhIGRlZmluaXRpb24gd2l0aCBuZWl0aGVyIGBob29rc2Agbm9yIGBzdGFydGAsIGEgbWVtYmVyIHRoYXQgaXMgbm90IGEgZnVuY3Rpb24sIGEgYHByZWZzLnZlcnNpb25gIHRoYXQgaXMgbm90IGEgd2hvbGUgbnVtYmVyIGZyb20gMSwgYW5kIGFuIGBhcGlgIHJhbmdlIHRoaXMgaG9zdCdzIHZlcnNpb24gZG9lcyBub3Qgc2F0aXNmeS4KCiMjIFZlcnNpb25zCgpgYXBpYCBpcyBhIHNlbXZlciByYW5nZSBvdmVyIHRoZSBBUEkncyBvd24gdmVyc2lvbiwgYE1PRF9BUEkyX1ZFUlNJT05gIChub3cgYDIuMC4wYCkuIFRoZSBnYW1lJ3MgdmVyc2lvbiBpcyBmb3IgZGlhZ25vc3RpY3Mgb25seS4gVGhlIG1pbm9yIG51bWJlciByaXNlcyB3aGVuIHRoZSBBUEkgZ2FpbnMgYSBjYWxsLiBUaGUgbWFqb3IgbnVtYmVyIHJpc2VzIHdoZW4gYW4gZXhpc3RpbmcgY2FsbCBjaGFuZ2VzIG9yIGdvZXMgYXdheSwgc28gYD49Mi4wLjAgPDMuMC4wYCAoYE1PRF9BUEkyX0RFRkFVTFRfUkFOR0VgKSBpcyB0aGUgcmFuZ2UgdG8gZGVjbGFyZS4KCkEgbG9hZGVyIGNhbGxzIGBhcGlSYW5nZVZlcmRpY3QocmFuZ2UpYCBiZWZvcmUgaW1wb3J0aW5nIGFueSBtb2QgY29kZS4gSXQgcmV0dXJucyBgeyBvazogdHJ1ZSB9YCwgb3IgYG9rOiBmYWxzZWAgd2l0aCBhIGBjb2RlYCBhbmQgYSBgd2h5YCBzZW50ZW5jZSBuYW1pbmcgYm90aCB2ZXJzaW9ucy4gVGhlIGNvZGUgaXMgYG1hbGZvcm1lZGAgd2hlbiB0aGUgcmFuZ2UgaXMgbWlzc2luZyBvciBkb2VzIG5vdCBwYXJzZS4gSXQgaXMgYHRvby1uZXdgIHdoZW4gZXZlcnkgdmVyc2lvbiB0aGUgcmFuZ2UgbmFtZXMgaGFzIGEgaGlnaGVyIG1ham9yIG51bWJlciB0aGFuIHRoaXMgZ2FtZSdzIEFQSSwgc28gdGhlIG1vZCBuZWVkcyBhIG5ld2VyIGdhbWUsIGFuZCBgdG9vLW9sZGAgd2hlbiBldmVyeSBvbmUgaGFzIGEgbG93ZXIgbWFqb3IgbnVtYmVyLCBzbyB0aGUgbW9kIG5lZWRzIGFuIHVwZGF0ZS4gQW55IG90aGVyIG1pc3MgaXMgYG91dHNpZGVgLCBzdWNoIGFzIGA+PTIuMS4wIDwzLjAuMGAgb24gYSBnYW1lIHdpdGggQVBJIDIuMC4wLgoKIyMgUmVzdWx0cwoKRXZlcnkgY2FsbCByZXR1cm5zIGEgcHJvbWlzZSBvZiBhbiBgQXBpMlJlc3VsdGAuIENoZWNrIGBva2AgYmVmb3JlIHVzaW5nIGB2YWx1ZWA6Cgp8IGByZWFzb25gIHwgV2hlbiB8IEV4dHJhIGZpZWxkcyB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCAobm9uZSwgYG9rOiB0cnVlYCkgfCBUaGUgY2FsbCB3b3JrZWQuIHwgYHZhbHVlYCB8CnwgYG5vdC1ncmFudGVkYCB8IFRoZSBtb2QgbGFja3MgdGhlIHBlcm1pc3Npb24gdGhlIGNhbGwgbmVlZHMuIHwgYGNhcGFiaWxpdHlgLCB0aGUgc3RyaW5nIHRvIGFzayBmb3IsIGFuZCBgbWVzc2FnZWAgfAp8IGB1bmF2YWlsYWJsZWAgfCBOb3RoaW5nIHRvIGFuc3dlciB5ZXQ6IG5vIGdhbWUgcnVubmluZywgbm8gY2hhcmFjdGVyLCBvciBhIGZyb250IGVuZCB3aXRob3V0IHRoYXQgZmVhdHVyZS4gfCBgbWVzc2FnZWAgfAp8IGByZWZ1c2VkYCB8IFRoZSBnYW1lIHR1cm5lZCB0aGUgcmVxdWVzdCBkb3duOiBhIHN0YWxlIGlucHV0IHRva2VuLCBhIGtleSBhbHJlYWR5IGJvdW5kLCBhIHJlY29yZCB0aGF0IGRvZXMgbm90IGV4aXN0LiB8IGBjb2RlYCwgYG1lc3NhZ2VgIHwKCkEgY2FsbCBuZXZlciB0aHJvd3MgZm9yIGEgbWlzc2luZyBwZXJtaXNzaW9uLiBgaXNOb3RHcmFudGVkKHJlc3VsdClgIHRlbGxzIGEgbWlzc2luZyBwZXJtaXNzaW9uIGFwYXJ0IGZyb20gdGhlIG90aGVyIGZhaWx1cmVzLCBhbmQgYG1vZC5tZXRhLmdyYW50ZWQoY2FwYWJpbGl0eSlgIGFuc3dlcnMgd2l0aG91dCBtYWtpbmcgYSBjYWxsLiBQZXJtaXNzaW9ucyB1c2UgdGhlIHNhbWUgc3RyaW5ncyBhcyBBUEkgMSAoYHN0YXRlOm1vbnN0ZXJzLnJlYWRgLCBgaW5wdXQ6aW50ZW50YCwgYGV2ZW50Om1lc3NhZ2VgKSwgdHlwZWQgYXMgYEFwaTJDYXBhYmlsaXR5YC4gQSBmYXVsdCBpbnNpZGUgdGhlIGhvc3QgdGhhdCBpcyBub3QgYSBwZXJtaXNzaW9uIGNoZWNrIHN0aWxsIHJlamVjdHMgdGhlIHByb21pc2UsIGFzIGl0IHdvdWxkIGluIEFQSSAxLgoKIyMgVGhlIGRvbWFpbnMKCnwgRG9tYWluIHwgV2hhdCBpdCBob2xkcyB8IFBlcm1pc3Npb24gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYG1ldGFgIHwgVGhlIG1vZCdzIGBpZGAsIGBmbGFnc2AgYW5kIGB0aWVyYCwgdGhlIEFQSSBhbmQgZ2FtZSB2ZXJzaW9ucyAoYGFwaWAsIGBlbmdpbmVgKSwgYG5ld0NoYXJhY3RlcmAsIGBncmFudGVkKGNhcGFiaWxpdHkpYCwgYGxvZ2AsIGl0cyBudW1lcmljIHNldHRpbmdzIChgc2V0dGluZ3NgLCBgc2V0U2V0dGluZ2ApLCBhbmQgdGhlIGVuYWJsZWQgbW9kcyAoYG1vZHNgKS4gfCBOb25lIHwKfCBgdmlld2AgfCBUaGUga25vd24gd29ybGQ6IGB3b3JsZCgpYCwgYHBsYXllcigpYCwgYG1vbnN0ZXJzKClgLCBgbGV2ZWwoKWAsIGBpbnB1dCgpYCwgYW5kIGBpc0N1cnJlbnQodG9rZW4pYC4gfCBgc3RhdGU6cGxheWVyLnJlYWRgLCBgc3RhdGU6bW9uc3RlcnMucmVhZGAsIGBzdGF0ZTptYXAucmVhZGAgYW5kIGBzdGF0ZTppbnRlcmFjdGlvbi5yZWFkYCBmb3IgdGhlIHNpbmdsZSBwYXJ0cywgb3IgYHN0YXRlOioucmVhZGA7IG5vbmUgZm9yIGB3b3JsZCgpYCBhbmQgYGlzQ3VycmVudGAgfAp8IGBhY3RgIHwgYHN1Ym1pdCh0b2tlbiwgaW50ZW50KWAsIGBhbnN3ZXIocHJvbXB0SWQsIGFuc3dlcilgLCBhbmQgYGNvbnRyb2xsZXJgLCB3aGljaCB3b3JrcyBvbmx5IHdoaWxlIHRoZSBtb2QgaG9sZHMgdGhlIGtleWJvYXJkLiB8IGBpbnB1dDppbnRlbnRgLCBgaW5wdXQ6cHJvbXB0LnJlcGx5YDsgbm9uZSBmb3IgYGNvbnRyb2xsZXJgIHwKfCBgZXZlbnRzYCB8IGBvbihuYW1lLCBsaXN0ZW5lcilgIGFuZCBgb2ZmKHN1YnNjcmlwdGlvbilgLiB8IGBldmVudDo8bmFtZT5gIHwKfCBgaG9va3NgIHwgVGhlIGhvb2tzIHRoaXMgZ2FtZSBydW5zIChgYXZhaWxhYmxlYCkgYW5kIHRoZSBvbmVzIHRoaXMgbW9kIGRlY2xhcmVkIChgYWN0aXZlYCkuIHwgTm9uZSB8CnwgYGNvbnRlbnRgIHwgVGhlIG1vZCdzIG93biBmaWxlcyAoYG93bmAsIGBhc3NldGApLCB0aGUgcnVubmluZyBnYW1lJ3MgcmVjb3JkcyAoYHJlY29yZHMoZmlsZSlgKSwgYW5kIGBsb29rdXAoeyBmaWxlLCBrZXkgfSlgIGJ5IHRoZSBrZXkgYHJlY29yZEtleWAgZGVyaXZlcy4gfCBOb25lIHwKfCBgdWlgIHwgSG9zdC1kcmF3biBwYW5lbHMgKGBtb3VudGAsIGBwYXRjaGApIGFuZCB0aGUgbW9kJ3Mga2V5IGJpbmRpbmdzIChga2V5c2ApLiB8IGB1aTpwYW5lbC5tb3VudGAsIGBrZXltYXA6d3JpdGVgIHwKfCBgc3RvcmVgIHwgYHByZWZzYCwga2VwdCBhcGFydCBmcm9tIGFueSBjaGFyYWN0ZXIsIGFuZCBgY2hhcmFjdGVyYCwga2VwdCBpbiB0aGUgY3VycmVudCBjaGFyYWN0ZXIncyBzYXZlLiB8IE5vbmUgfAp8IGBuZXRgIHwgUmVxdWVzdHMgdG8gdGhlIGhvc3RzIHRoZSBtYW5pZmVzdCBuYW1lcywgd2l0aCBjcmVkZW50aWFscyBwYXNzZWQgYnkgcmVmZXJlbmNlLiBQcmVzZW50IG9ubHkgd2hlbiB0aGUgbWFuaWZlc3QgYXNrcyBmb3IgYSBgbmV0d29yazpgIHBlcm1pc3Npb24uIHwgYG5ldHdvcms6PGhvc3Q+YCB8CnwgYG1hbmFnZWAgfCBQcm9maWxlcyBhbmQgc2Vzc2lvbiBjb250cm9sLiBGaXJzdC1wYXJ0eSBtb2RzIG9ubHkuIHwgYHByb2ZpbGVzOm1hbmFnZWAsIGBzZXNzaW9uOmNvbnRyb2xgIHwKfCBgdHJ1dGhgIHwgRXZlcnkgbW9uc3RlciBhbmQgdGhlIHJlYWwgbWFwLiBUaGUgZmlyc3QtcGFydHkgYXV0b3BsYXllciBvbmx5LiB8IE5vbmUgYmV5b25kIHRoZSBhbGxvd2xpc3QgfAoKIyMjIFdoYXQgYHZpZXdgIHNob3dzCgpgdmlld2AgaXMgYnVpbHQgZnJvbSBjb3JlJ3Mga25vd24gd29ybGQgKGBidWlsZEtub3duV29ybGRgIGluIGBwYWNrYWdlcy9jb3JlL3NyYy9hZ2VudC9rbm93bi13b3JsZC50c2ApLiBFYWNoIG1vbnN0ZXIgaW4gaXQgaXMgb25lIHRoZSBwbGF5ZXIgcGVyY2VpdmVzLCB3aXRoIHRoZSBsb29rIGNvbW1hbmQncyBoZWFsdGggYmFuZCBhbmQgc3RhdHVzZXMsIGl0cyByYWNlJ3MgbmF0aXZlIGRlcHRoIGFuZCBzcGVlZCwgYW5kIHRoZSByYWNlIGZsYWdzIGFuZCBzcGVsbHMgdGhlIHBsYXllcidzIG1vbnN0ZXIgbWVtb3J5IGhhcyBsZWFybmVkLiBUaGUgbWFwIGlzIHRoZSBvbmUgdGhlIHBsYXllciByZW1lbWJlcnMsIGFuZCBpdGVtcyBzaG93IG9ubHkgd2hhdCB0aGUgcGxheWVyIGhhcyBpZGVudGlmaWVkLiBBIG1vbnN0ZXIgdGhlIHBsYXllciBkb2VzIG5vdCBwZXJjZWl2ZSBpcyBub3QgaW4gYW55IHBhcnQgb2YgaXQsIHNvIGNoYW5naW5nIHRoYXQgbW9uc3RlciBjaGFuZ2VzIG5vdGhpbmcgYSBtb2QgY2FuIHJlYWQuIGB3b3JsZCgpYCByZXR1cm5zIGV2ZXJ5IHBhcnQgYXQgb25jZTogdGhlIHBsYXllciwgaW52ZW50b3J5LCBlcXVpcG1lbnQsIHF1aXZlciwgdGhlIG9iamVjdHMgdW5kZXIgdGhlIHBsYXllciwgbW9uc3RlcnMsIHRhcmdldCwgc3RvcmVzLCBzcGVsbGJvb2tzIGFuZCB0aGUgcmVtZW1iZXJlZCBsZXZlbCwgd2l0aCBgbnVsbGAgZm9yIGVhY2ggcGFydCB0aGUgbW9kIGhhcyBubyBwZXJtaXNzaW9uIGZvci4gSXQgbmV2ZXIgaG9sZHMgdGhlIHJlYWwgbWFwLiBUaGUgc2luZ2xlLXBhcnQgY2FsbHMgYW5zd2VyIGBub3QtZ3JhbnRlZGAgaW5zdGVhZC4KCmB3b3JsZCgpYCwgYGxldmVsKClgIGFuZCBgaW5wdXQoKWAgY2FycnkgYSBgdG9rZW5gIG5hbWluZyB0aGUgaW5wdXQgd2FpdCB0aGV5IHdlcmUgcmVhZCBhdCwgYW5kIGBpc0N1cnJlbnQodG9rZW4pYCBzYXlzIHdoZXRoZXIgdGhhdCB3YWl0IGlzIHN0aWxsIHRoZSBjdXJyZW50IG9uZS4gYGFjdC5zdWJtaXRgIHRha2VzIHRoZSB0b2tlbiwgYW5kIGEgdG9rZW4gZnJvbSBhbiBvbGRlciB3YWl0IGNvbWVzIGJhY2sgYHJlZnVzZWRgLgoKIyMjIFRoZSBjb250cm9sbGVyCgpgYWN0LmNvbnRyb2xsZXJgIGhhcyBgb3ducygpYCwgYHNldFN0YXR1cyhzdGF0dXMpYCwgYG1hcmtOb25kZXRlcm1pbmlzdGljKClgIGFuZCBgcmVsZWFzZShyZWFzb24pYC4gRXZlcnkgY2FsbCBidXQgYG93bnMoKWAgYW5zd2VycyBgcmVmdXNlZGAgd2l0aCB0aGUgY29kZSBgbm90LW93bmVyYCB1bmxlc3MgdGhlIG1vZCBob2xkcyB0aGUga2V5Ym9hcmQuIEFuIEFQSSAyIGRlZmluaXRpb24gaGFzIG5vIG1lbWJlciB0aGF0IHRha2VzIHRoZSBrZXlib2FyZDsgaW4gQVBJIDEgdGhhdCBpcyB0aGUgcGx1Z2luJ3MgYGNvbnRyb2xsZXJgLgoKIyMjIFBhbmVscwoKYHVpLm1vdW50YCB0YWtlcyB0aGUgc2FtZSBwYW5lbCBncmFtbWFyIGFzIFdvcmtlciBtb2RzOiBgdGV4dGAsIGBidXR0b25gLCBgcm93YCBhbmQgYGNvbHVtbmAgbm9kZXMgdW5kZXIgYSBwYW5lbCBgaWRgLiBUaGUgYGlkYCBhbmQgZWFjaCBidXR0b24ncyBgYWN0aW9uYCBhcmUgbG93ZXItY2FzZSBsZXR0ZXJzLCBkaWdpdHMgYW5kIGh5cGhlbnMsIHN0YXJ0IHdpdGggYSBsZXR0ZXIsIGFuZCBydW4gdG8gNjQgY2hhcmFjdGVycyBhdCBtb3N0LiBBIHRleHQgaG9sZHMgdXAgdG8gNDA5NiBjaGFyYWN0ZXJzLCBhIHJvdyBvciBjb2x1bW4gdXAgdG8gMzIgY2hpbGRyZW4sIGFuZCB0aGUgdHJlZSBuZXN0cyB1cCB0byAxNiBkZWVwLiBUaGUgaG9zdCBkcmF3cyB0aGUgcGFuZWwsIGFuZCBgb25BY3Rpb25gIGhlYXJzIHRoZSBgYWN0aW9uYCBvZiBlYWNoIGJ1dHRvbiB0aGUgcGxheWVyIHVzZXMuIGB1aS5wYXRjaGAgcmVwbGFjZXMgdGhlIHRpdGxlIChgbnVsbGAgcmVtb3ZlcyBpdCksIHRoZSB0cmVlLCBvciBgdmlzaWJsZWAuIEEgcGFuZWwgb3V0c2lkZSB0aGUgZ3JhbW1hciwgYSBzZWNvbmQgcGFuZWwgd2l0aCBhbiBpZCBhbHJlYWR5IG1vdW50ZWQsIG9yIGEgcGF0Y2ggdG8gYSBwYW5lbCB0aGF0IGlzIG5vdCBtb3VudGVkIGNvbWVzIGJhY2sgYHJlZnVzZWRgIHdpdGggdGhlIGNvZGUgYGJhZC1wYW5lbGAuIEEgbW9kIGluIEFQSSAyIGRvZXMgbm90IGdldCBhIERPTSBlbGVtZW50LgoKIyMgRXZlbnRzCgpBbiBldmVudCBhcnJpdmVzIG9ubHkgd2hlbiB0aGUgcGxheWVyIGNvdWxkIGtub3cgYWJvdXQgaXQuIEEgYGNvbWJhdC1vdXRjb21lYCBhcnJpdmVzIHdoZW4gdGhlIHBsYXllciBhdHRhY2tlZCBvciB3YXMgdGhlIHRhcmdldCwgb3Igd2hlbiB0aGUgZ2FtZSBtYXJrcyBpdCBhcyBzZWVuLCBhbmQgb25lIHdoZXJlIG5laXRoZXIgc2lkZSBpcyB0aGUgcGxheWVyIG9yIGEgbW9uc3RlciB0aGUgcGxheWVyIHBlcmNlaXZlcyBkb2VzIG5vdCBhcnJpdmUgYXQgYWxsLiBBIGBtb3Rpb25gIG9yIGBoZWFsYCBieSB0aGUgcGxheWVyIGFsd2F5cyBhcnJpdmVzOyBvbmUgYnkgYSBtb25zdGVyIGFycml2ZXMgb25seSB3aGVuIHRoZSBwbGF5ZXIgcGVyY2VpdmVzIHRoYXQgbW9uc3RlciBhbmQgc2F3IGl0IGhhcHBlbi4gQSBtb25zdGVyIGFwcGVhcnMgYXMgYHsgbW9uc3RlcjogaWQgfWAsIHdpdGggdGhlIGlkIHRoZSB2aWV3IHVzZXMsIHdoaWxlIHRoZSBwbGF5ZXIgcGVyY2VpdmVzIGl0LCBhbmQgYXMgYCJ1bnNlZW4iYCBvdGhlcndpc2UsIHdoaWNoIGluY2x1ZGVzIGEgbW9uc3RlciB3aG9zZSByZWNvcmQgaXMgZ29uZSBieSB0aGUgdGltZSB0aGUgZXZlbnQgaXMgc2VudC4gRGFtYWdlIGFuZCBoZWFsaW5nIGFtb3VudHMgYXJlIGdpdmVuIG9ubHkgZm9yIHRoZSBwbGF5ZXIsIGFzIGBwbGF5ZXJEYW1hZ2VgIGFuZCBgcGxheWVyQW1vdW50YC4KCnwgRXZlbnQgfCBQYXlsb2FkIHwKfCAtLS0gfCAtLS0gfAp8IGBtZXNzYWdlYCB8IGB7IHRleHQsIHR5cGUgfWAgfAp8IGBkdW5nZW9ubGV2ZWxgIHwgYHsgZGVwdGgsIGxldmVsSWQsIGNhdXNlLCBhcmVuYSB9YCB8CnwgYGNvbWJhdC1vdXRjb21lYCB8IGB7IGF0dGFja2VyLCB0YXJnZXQsIGtpbmQsIGhpdCwgZGllZCwgZ3JpZCwgcGxheWVyRGFtYWdlPyB9YCB8CnwgYG1vdGlvbmAgfCBgeyB3aG8sIGZyb20sIHRvLCBraW5kIH1gIHwKfCBgaGVhbGAgfCBgeyB3aG8sIGdyaWQsIHBsYXllckFtb3VudD8gfWAgfAp8IGBwbGF5ZXItY29tbWFuZGAgfCBgeyBjb2RlLCBkaXI/LCBwaGFzZSwgdG9rZW4gfWAgfAp8IGBkcml2ZXItY2hhbmdlZGAgfCBgeyBraW5kOiAicGxheWVyIiB9YCBvciBgeyBraW5kOiAiY29udHJvbGxlciIsIG93bmVyLCBsYWJlbD8sIHJlYXNvbj8gfWA6IHdobyBob2xkcyB0aGUga2V5Ym9hcmQgfAp8IGBocGAgYG1hbmFgIGBnb2xkYCBgZXhwZXJpZW5jZWAgYHBsYXllcmxldmVsYCBgc3RhdHVzYCB8IGBudWxsYCB8CnwgYGludmVudG9yeWAgYGVxdWlwbWVudGAgYG1vbnN0ZXJsaXN0YCBgaXRlbWxpc3RgIHwgYG51bGxgIHwKfCBgZW50ZXItc3RvcmVgIHwgYG51bGxgOiB0aGUgcGxheWVyIHdhbGtlZCBpbnRvIGEgc2hvcC4gfAp8IGBsZWF2ZS1zdG9yZWAgfCBgbnVsbGA6IHRoZSBwbGF5ZXIgbGVmdCB0aGUgc2hvcC4gfAp8IGBlbnRlci13b3JsZGAgfCBgbnVsbGA6IGEgZ2FtZSBpcyBzdGFydGluZyB0byBydW4uIHwKfCBgbGVhdmUtd29ybGRgIHwgYG51bGxgOiB0aGUgZ2FtZSBpcyBzdG9wcGluZy4gfAoKQSBgbnVsbGAgcGF5bG9hZCBpcyBhIG5vdGljZSB0aGF0IHNvbWV0aGluZyBjaGFuZ2VkOiByZWFkIHRoZSB2aWV3IGZvciB0aGUgbmV3IHZhbHVlLiBMZXZlbCBnZW5lcmF0aW9uLCBib2x0cywgbWlzc2lsZXMgYW5kIGV4cGxvc2lvbnMgaGF2ZSBubyBBUEkgMiBldmVudCwgc2luY2UgdGhleSBzaG93IHRoaW5ncyB0aGUgcGxheWVyIGRpZCBub3Qgc2VlLgoKYGV2ZW50cy5vbmAgYW5zd2VycyBgcmVmdXNlZGAgd2l0aCBgdW5rbm93bi1ldmVudGAgZm9yIGEgbmFtZSBub3QgaW4gdGhpcyB0YWJsZSwgYG5vdC1ncmFudGVkYCB3aXRob3V0IGBldmVudDo8bmFtZT5gLCBhbmQgYHVuYXZhaWxhYmxlYCBiZWZvcmUgYSBnYW1lIGlzIHJ1bm5pbmcuIFRoZSBsaXN0ZW5lciBnZXRzIHRoZSBwYXlsb2FkIGFsb25lLgoKIyMgSG9va3MKCkFuIEFQSSAyIG1vZCBkZWNsYXJlcyBpdHMgaG9va3MgaW4gYGhvb2tzKGNvbnRleHQpYC4gRWFjaCBvbmUgZ2V0cyBwbGFpbiwgZnJvemVuIGRhdGEgYW5kIHJldHVybnMgcGxhaW4gZGF0YS4gVGhlIGhvc3QgY29tcG9zZXMgdGhlbSB3aXRoIGV2ZXJ5IG90aGVyIG1vZCdzIGhvb2tzIGluIGxvYWQgb3JkZXIsIHRoZSBzYW1lIHdheSBpdCBjb21wb3NlcyBBUEkgMSBob29rcy4KCmBtZXNzYWdlVGV4dGAsIGBzY3JlZW5UZXh0YCwgYGNoYXJhY3RlckJhY2tncm91bmRgLCBgb2JqZWN0SW5mb1RleHRgLCBgZWZmZWN0SW50cm9gIGFuZCBgaGlzdG9yeURpc3BsYXlgIHJlc3RhdGUgdGV4dC4gYGhpc3RvcnlBZGRgIHJldHVybnMgYHsga2VlcCwgd2hhdD8sIGV4cGFuZFVzZXJJbnB1dD8gfWAsIGFuZCBhbiBlbnRyeSBpcyB3cml0dGVuIG9ubHkgaWYgZXZlcnkgbW9kIGtlZXBzIGl0LiBgb2JqZWN0TGlzdFRpZWJyZWFrYCwgYHNhdmVOb2lzZVNjZW50YCBhbmQgYHNoYXBlTGVhcm5PYnZpb3VzRmxhZ3NEaXJlY3RseWAgYW5zd2VyIGEgcXVlc3Rpb24uIGBvcHRpb25zQ2hhbmdlZGAsIGBhYmlsaXR5R2FpbmVkYCwgYG1vbnN0ZXJCZWNhbWVWaXNpYmxlYCBhbmQgYGFydGlmYWN0SWRlbnRpZmllZGAgdGVsbCB0aGUgbW9kIHNvbWV0aGluZyBoYXBwZW5lZC4KClRoZXNlIEFQSSAxIGhvb2tzIGhhdmUgbm8gQVBJIDIgZm9ybToKCnwgSG9vayB8IFdoeSB8IEluc3RlYWQgfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYG5ld0NoYXJhY3RlcmAsIGB3YWxrQmxvY2tlZEJ5RGlnZ2FibGVgLCBgbGV2ZWxHZW5lcmF0ZWRgLCBgcGFydGlhbFN0YWNrTWVyZ2VgLCBgcGFja092ZXJmbG93VmljdGltYCwgYGxldmVsUmV2aXNpdGVkYCB8IFRoZXkgcGFzcyBsaXZlIGdhbWUgb2JqZWN0cyBvciB0aGUgd2hvbGUgZ2FtZSBzdGF0ZS4gfCBBbiBBUEkgMSBwbHVnaW4uIHwKfCBgcHJvamVjdGlvblJhZGl1c2AgfCBJdCBydW5zIGZvciBwcm9qZWN0aW9ucyB0aGUgcGxheWVyIG5ldmVyIHNlZXMuIHwgQW4gQVBJIDEgcGx1Z2luLiB8CnwgYGFydGlmYWN0Q29tbWl0YCB8IEl0IHJ1bnMgd2hlbiBhbiBhcnRpZmFjdCBpcyBnZW5lcmF0ZWQsIGJlZm9yZSB0aGUgcGxheWVyIGhhcyBzZWVuIGl0LiB8IGBhcnRpZmFjdElkZW50aWZpZWRgIGZvciB3aGF0IHRoZSBwbGF5ZXIgbGVhcm5zLiB8CgojIyBTdG9yYWdlCgpgc3RvcmUucHJlZnMuZ2V0KClgIGFuZCBgc2V0KHZhbHVlKWAgaG9sZCBvbmUgSlNPTiB2YWx1ZSBwZXIgbW9kLCBhbmQgYHNldChudWxsKWAgcmVtb3ZlcyBpdC4gQSBtb2QgdGhhdCBjaGFuZ2VzIHRoZSBzaGFwZSBvZiB3aGF0IGl0IHN0b3JlcyBkZWNsYXJlcyBgcHJlZnM6IHsgdmVyc2lvbiwgbWlncmF0ZSh2YWx1ZSwgZnJvbVZlcnNpb24pIH1gLCB3aXRoIGB2ZXJzaW9uYCBhIHdob2xlIG51bWJlciBmcm9tIDEuIFRoZSBob3N0IHN0b3JlcyB0aGUgdmVyc2lvbiBiZXNpZGUgdGhlIHZhbHVlLCBjYWxscyBgbWlncmF0ZWAgb25jZSBvbiB0aGUgZmlyc3QgcmVhZCBhZnRlciBhbiB1cGdyYWRlLCBhbmQgd3JpdGVzIHRoZSByZXN1bHQgYmFjay4gQSB2YWx1ZSBzdG9yZWQgYmVmb3JlIHRoZSBtb2QgZGVjbGFyZWQgYSB2ZXJzaW9uIGNvdW50cyBhcyB2ZXJzaW9uIDAuCgpgc3RvcmUuY2hhcmFjdGVyYCBob2xkcyBvbmUgSlNPTiB2YWx1ZSBpbiB0aGUgY3VycmVudCBjaGFyYWN0ZXIncyBzYXZlLCBzdGFtcGVkIHdpdGggdGhlIG1hbmlmZXN0J3MgYHNhdmVTY2hlbWFgLCBhbmQgYW5zd2VycyBgdW5hdmFpbGFibGVgIHVudGlsIGEgY2hhcmFjdGVyIGV4aXN0cy4gYG1pZ3JhdGVCYWcoZGF0YSwgZnJvbVNjaGVtYSlgIGJyaW5ncyBpdCBmb3J3YXJkIHdoZW4gYHNhdmVTY2hlbWFgIHJpc2VzLgoKIyMgTmV0d29yayBhbmQgY3JlZGVudGlhbHMKCmBuZXQucmVxdWVzdCh7IHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5LCB0aW1lb3V0TXMgfSlgIHNlbmRzIGEgcmVxdWVzdCB0byBhIGhvc3QgdGhlIG1hbmlmZXN0IG5hbWVzIGFuZCBhbnN3ZXJzIGB7IHN0YXR1cywgaGVhZGVycywgYm9keSB9YCB3aGF0ZXZlciB0aGUgc3RhdHVzLiBBIGhlYWRlciBjYW4gaG9sZCBgbW9kLm5ldC5jcmVkZW50aWFsKCJhcGkta2V5IilgIGluIHBsYWNlIG9mIGEgc3RyaW5nLiBUaGUgaG9zdCBwdXRzIHRoZSBzdG9yZWQgdmFsdWUgaW4gYXMgdGhlIHdob2xlIGhlYWRlciB2YWx1ZSwgYW5kIHRoZSBtb2QgbmV2ZXIgcmVhZHMgaXQgYmFjay4gYG5ldC5jcmVkZW50aWFsc2Aga2VlcHMgY3JlZGVudGlhbHMgYnkgbmFtZTogYHNldChuYW1lLCB2YWx1ZSwgaG9zdHMpYCBzdG9yZXMgb25lIHRvIGJlIHNlbnQgb25seSB0byB0aG9zZSBob3N0cywgYGZyb21FbnZpcm9ubWVudChuYW1lLCB2YXJpYWJsZXMsIGhvc3RzKWAgdGFrZXMgaXQgZnJvbSB0aGUgZmlyc3QgZW52aXJvbm1lbnQgdmFyaWFibGUgdGhhdCBpcyBzZXQgKGRlc2t0b3AgYXBwIG9ubHksIGFuZCB0aGUgcGxheWVyIGlzIGFza2VkKSwgYHN0YXR1cyhuYW1lKWAgc2F5cyB3aGV0aGVyIG9uZSBpcyBzZXQgYW5kIHdoZXJlIGl0IGlzIGtlcHQgKGBvc2AsIGBlbnZpcm9ubWVudGAgb3IgYHBhZ2VgKSwgYW5kIGByZW1vdmUobmFtZSlgIGRlbGV0ZXMgaXQuIEEgY3JlZGVudGlhbCBjYWxsIHRoYXQgZmFpbHMgYW5zd2VycyBgcmVmdXNlZGAgd2l0aCB0aGUgY29kZSBgY3JlZGVudGlhbGAuCgpBIHJlcXVlc3QgdG8gYSBob3N0IHRoZSBtYW5pZmVzdCBkb2VzIG5vdCBuYW1lIGFuc3dlcnMgYG5vdC1ncmFudGVkYCB3aXRoIGBuZXR3b3JrOjxob3N0PmAuIEFueSBvdGhlciBmYWlsdXJlIGlzIGByZWZ1c2VkYCB3aXRoIGEgbmV0IHByb2JsZW0gY29kZTogYHRpbWVvdXRgLCBgdG9vLWxhcmdlYCwgYHJlZGlyZWN0YCwgYHVucmVhY2hhYmxlYCBvciBgYmFkLXJlcXVlc3RgLiBBIGNyZWRlbnRpYWwgdGhhdCBpcyBub3Qgc2V0IGdpdmVzIGBzZWNyZXQtbWlzc2luZ2AsIGFuZCBvbmUgbm90IHNldCB1cCBmb3IgdGhlIHJlcXVlc3QncyBob3N0IGdpdmVzIGBzZWNyZXQtaG9zdGAuCgojIyBGaXJzdC1wYXJ0eSBzZWFtcwoKYG1hbmFnZWAgYW5kIGB0cnV0aGAgZXhpc3Qgb25seSBmb3IgYSBtb2QgdGhlIGxvYWRlciBuYW1lcyBmaXJzdC1wYXJ0eSwgYW5kIHRoZXkgYXJlIGFic2VudCBmcm9tIGV2ZXJ5IG90aGVyIG1vZCdzIEFQSTogdGVzdCBgaWYgKG1vZC50cnV0aClgIGFuZCB0aGVyZSBpcyBub3RoaW5nIHRvIHJlcXVlc3QuIGBtYW5hZ2VgIGJlbG9uZ3MgdG8gdGhlIGZpcnN0LXBhcnR5IHByZXNlbnRhdGlvbiBtb2QuIGBtYW5hZ2UucHJvZmlsZXNgIGxpc3RzIGFuZCBjcmVhdGVzIHBsYXllciBwcm9maWxlcywgc2V0cyB3aGljaCBtb2RzIGEgcHJvZmlsZSBlbmFibGVzLCBhbmQgc3dpdGNoZXMgcHJvZmlsZSwgdW5kZXIgYHByb2ZpbGVzOm1hbmFnZWAuIGBtYW5hZ2Uuc2Vzc2lvbmAgc2F2ZXMsIGV4aXRzIHRvIHRoZSB0aXRsZSBzY3JlZW4gb3IgcXVpdHMgdW5kZXIgYHNlc3Npb246Y29udHJvbGAsIHdpdGhvdXQgYXNraW5nIHRoZSBwbGF5ZXIgdG8gY29uZmlybSwgc28gYSBtb2QgYXNrcyBmaXJzdCBpbiBpdHMgb3duIHBhbmVsLiBgdHJ1dGhgIGJlbG9uZ3MgdG8gdGhlIGZpcnN0LXBhcnR5IGF1dG9wbGF5ZXIgYW5kIG5lZWRzIG5vIHBlcm1pc3Npb24sIGFuZCBubyB3aWxkY2FyZCBncmFudCByZWFjaGVzIGl0LiBgdHJ1dGgubW9uc3RlcnMoKWAgbGlzdHMgZXZlcnkgbW9uc3RlciB3aXRoIGV4YWN0IGhpdCBwb2ludHMgYW5kIHNwZWVkLCBhbmQgYHRydXRoLmxldmVsKClgIGdpdmVzIHRoZSByZWFsIG1hcC4gQW4gYXV0b3BsYXllciB1c2VzIGl0IHRvIHBsYW4gYW5kIHN0aWxsIGFjdHMgdGhyb3VnaCBgYWN0YCwgb24gd2hhdCB0aGUgcGxheWVyIGtub3dzLgoKIyMgTW92aW5nIGZyb20gQVBJIDEKCk1vc3Qgb2YgdGhlIEFQSSAxIGNvbnRleHQgaGFzIGEgZGlyZWN0IGhvbWUgaW4gQVBJIDIuIGBBUEkxX0NPTlRFWFRfTUFQYCBpbiBgcGFja2FnZXMvd2ViL3NyYy9tb2QtYXBpMi1zaGltLnRzYCBuYW1lcyBldmVyeSBtZW1iZXIgYW5kIHdoZXJlIGl0IHdlbnQsIG9yIHdoeSBpdCBoYXMgbm8gQVBJIDIgZm9ybS4gW01JR1JBVElOR19UT19BUEkyLm1kXShNSUdSQVRJTkdfVE9fQVBJMi5tZCkgd2Fsa3MgdGhyb3VnaCB0aGUgbW92ZSBvbmUgZG9tYWluIGF0IGEgdGltZSwgaW5jbHVkaW5nIHRoZSBtZW1iZXJzIEFQSSAyIGRvZXMgbm90IGhhdmUuIFRoZSBtYWluIGNoYW5nZXM6Cgp8IEFQSSAxIHwgQVBJIDIgfAp8IC0tLSB8IC0tLSB8CnwgYGN0eC5pZGAsIGBjdHguZmxhZ3NgLCBgY3R4LnNldHRpbmdzYCwgYGN0eC5tb2RzYCwgYGN0eC5sb2dgLCBgY3R4Lm5ld0NoYXJhY3RlcmAgfCBgbWV0YWAgfAp8IGBjdHguc3RhdGVgLCBgY3R4LmNvcmVgLCBgY3R4LnJlZ2lzdHJpZXNgIHwgYHZpZXdgIGZvciByZWFkcywgYGFjdGAgZm9yIGNvbW1hbmRzLCBgY29udGVudC5yZWNvcmRzYCBmb3IgZGF0YSB8CnwgYGN0eC5pbnNwZWN0YCwgYGN0eC5rbm93bkxldmVsYCwgYGN0eC5jaGFyYWN0ZXJgIHwgYHZpZXcubW9uc3RlcnNgLCBgdmlldy5sZXZlbGAsIGB2aWV3LnBsYXllcmAgfAp8IGBjdHguc25hcHNob3RgLCBgY3R4LmludGVudGAsIGBjdHgucHJvbXB0YCB8IGB2aWV3LmlucHV0YCwgYGFjdC5zdWJtaXRgLCBgYWN0LmFuc3dlcmAgfAp8IGBjdHguZXZlbnRzLm9uKHR5cGUsICh0eXBlLCBkYXRhKSA9PiAuLi4pYCB8IGBldmVudHMub24obmFtZSwgKHBheWxvYWQpID0+IC4uLilgLCB3aGljaCByZXR1cm5zIGEgc3Vic2NyaXB0aW9uIHwKfCBgY3R4LnVpYCAoYSBET00gZWxlbWVudCkgfCBgdWkubW91bnRgIHdpdGggdGhlIHBhbmVsIGdyYW1tYXIgfAp8IGBjdHgua2V5bWFwc2AsIGBjdHgua2V5YmluZGluZ3NgIHwgYHVpLmtleXNgIHwKfCBgY3R4LnByZWZzYCwgYGN0eC5jaGFyYWN0ZXJTdG9yZWAgfCBgc3RvcmUucHJlZnNgLCBgc3RvcmUuY2hhcmFjdGVyYCB8CnwgYGN0eC5kYXRhYCwgYGN0eC5hc3NldFVybGAsIGBjdHguY29tcG9zZWRSZWNvcmRzYCB8IGBjb250ZW50Lm93bmAsIGBjb250ZW50LmFzc2V0YCwgYGNvbnRlbnQucmVjb3Jkc2AgfAp8IGBjdHgubmV0YCB8IGBuZXRgLCB3aXRoIGNyZWRlbnRpYWxzIGJ5IHJlZmVyZW5jZSB8CnwgYGN0eC5wcm9maWxlc2AsIGBjdHguc2Vzc2lvbmAgfCBgbWFuYWdlYCwgZmlyc3QtcGFydHkgb25seSB8Cg=="
  },
  {
    "id": "api2-migration",
    "path": "MIGRATING_TO_API2.md",
    "audience": "advanced",
    "title": "Moving to API 2",
    "note": "Taking a plugin from API 1 to API 2, and what has no API 2 form yet.",
    "encoded": "IyBNb3ZpbmcgYSBtb2QgZnJvbSBBUEkgMSB0byBBUEkgMgoKVGhpcyBndWlkZSB0YWtlcyBhbiBBUEkgMSBwbHVnaW4gKGEgYHBsdWdpbi5qc2Agd2hvc2UgZGVmYXVsdCBleHBvcnQgaGFzIGBhcGk6IDFgKSB0byBtb2QgQVBJIDIsIGluIHRoZSBvcmRlciB0aGUgd29yayB1c3VhbGx5IGdvZXM6IGNoZWNrIHdoYXQgY2FuIG1vdmUsIGNvbnZlcnQgdGhlIG1hbmlmZXN0LCBjaGFuZ2UgdGhlIHNoYXBlIG9mIHRoZSBjb2RlLCB0aGVuIGdvIHRocm91Z2ggZWFjaCBwYXJ0IG9mIHRoZSBvbGQgYGN0eGAuIFtBUEkyLm1kXShBUEkyLm1kKSBkZXNjcmliZXMgQVBJIDIgaXRzZWxmLiBUaGUgdHlwZXMgYXJlIGluIGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYC4KCiMjIFdoYXQgd29ya3Mgb24gdGhpcyBidWlsZAoKVGhlIFNESyBoYXMgdGhlIEFQSSAyIHR5cGVzIChgTW9kQXBpMmAsIGBBcGkyTW9kRGVmaW5pdGlvbmAsIGBBcGkyUmVzdWx0YCksIHRoZSB2ZXJzaW9uIGNoZWNrIGBhcGlSYW5nZVZlcmRpY3RgLCBhbmQgdGhlIG1hbmlmZXN0IGNvbnZlcnRlciBgY29udmVydE1hbmlmZXN0VjFgLiBUaGUgd2ViIGhvc3QgaGFzIGFuIGluLXByb2Nlc3MgQVBJIDIgaG9zdCAoYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWFwaTItaG9zdC50c2ApIGFuZCBgYXBpMlBsdWdpbmAgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1hcGkyLXNoaW0udHNgKSwgd2hpY2ggd3JhcHMgYW4gQVBJIDIgZGVmaW5pdGlvbiBzbyBpdCBydW5zIHRocm91Z2ggdGhlIEFQSSAxIGxvYWRlciB3aXRoIHRoZSBzYW1lIHBlcm1pc3Npb25zIGFuZCB0aGUgc2FtZSBob29rIGNvbXBvc2l0aW9uLgoKVGhlIGZvbGRlciBsb2FkZXIgZG9lcyBub3QgY2FsbCBgYXBpMlBsdWdpbmAgeWV0LCBhbmQgdGhlIFNESyBkb2VzIG5vdCBleHBvcnQgaXQuIEEgbWFuaWZlc3QgdGhhdCBkZWNsYXJlcyBydW50aW1lIGBpbi1wcm9jZXNzYCB3aXRoIGFuIEFQSSAyIHJhbmdlIHN1Y2ggYXMgYD49Mi4wLjAgPDMuMC4wYCBpcyByZWZ1c2VkIHdpdGggdGhlIGxpbmUgYG5lZWRzIG1vZCBBUEkgPj0yLjAuMCA8My4wLjAgaW4gcnVudGltZSAiaW4tcHJvY2VzcyIsIHdoaWNoIHRoaXMgYnVpbGQgZG9lcyBub3QgcHJvdmlkZWAuIGBuZW8tYW5nYmFuZC1tb2QtYnVpbGRgIGFsc28gcmVmdXNlcyBhIGRlZmF1bHQgZXhwb3J0IHdpdGhvdXQgYW4gaW50ZWdlciBgYXBpYC4gT24gdGhpcyBidWlsZCB5b3UgY2FuIHNoaXAgdGhlIHNjaGVtYSAyIG1hbmlmZXN0LCB3aGljaCBrZWVwcyB0aGUgbW9kIG9uIEFQSSAxLCBhbmQgeW91IGNhbiB3cml0ZSBhbmQgdHlwZWNoZWNrIHRoZSBBUEkgMiBjb2RlLCBidXQgdGhlIGdhbWUgY2Fubm90IGxvYWQgaXQgZnJvbSBhIGZvbGRlci4KCiMjIFN0ZXAgMTogY2hlY2sgd2hhdCBoYXMgbm8gQVBJIDIgZm9ybQoKQSBtb2QgaGFzIG9uZSBlbnRyeSBtb2R1bGUgYW5kIG9uZSBBUEkuIElmIGl0IG5lZWRzIGFueXRoaW5nIGluIHRoaXMgdGFibGUsIGl0IHN0YXlzIG9uIEFQSSAxIHVudGlsIEFQSSAyIGhhcyBhIHJlcGxhY2VtZW50LgoKfCBBUEkgMSB8IEluIEFQSSAyIHwKfCAtLS0gfCAtLS0gfAp8IGByZWdpc3Rlcihob3N0LCBjdHgpYCdzIHJlZ2lzdHJ5IGhvc3Q6IGV2ZXJ5IGByZWdpc3RyeToqYCBvdmVycmlkZSAoZWZmZWN0cywgcm9vbXMsIHN0b3JlcywgY29tbWFuZHMsIG1vbnN0ZXIgQUkgYW5kIHRoZSByZXN0KSB8IE5vbmUuIHwKfCBUaGUgYGNvbnRyb2xsZXJgLCBgZnJvbnRlbmRgLCBgaHVkYCwgYG1lbnVgLCBgc2NyZWVuYCwgYGJpcnRoYCBhbmQgYHJlZ2lvbnNgIHBsdWdpbiBtZW1iZXJzIHwgTm9uZS4gQW4gQVBJIDIgbW9kIGNhbm5vdCB0YWtlIHRoZSBrZXlib2FyZCwgZHJhdyB0aGUgbWFwLCBvciBwcmVzZW50IG1lbnVzIGFuZCBzY3JlZW5zLiB8CnwgVGhlIGhvb2tzIGBuZXdDaGFyYWN0ZXJgLCBgd2Fsa0Jsb2NrZWRCeURpZ2dhYmxlYCwgYGxldmVsR2VuZXJhdGVkYCwgYHBhcnRpYWxTdGFja01lcmdlYCwgYHBhY2tPdmVyZmxvd1ZpY3RpbWAsIGBsZXZlbFJldmlzaXRlZGAsIGBwcm9qZWN0aW9uUmFkaXVzYCBhbmQgYGFydGlmYWN0Q29tbWl0YCB8IE5vbmUgKHNlZSBTdGVwIDgpLiB8CnwgYGN0eC5kaXNwbGF5YCwgYGN0eC5zdWJ3aW5kb3dzYCwgYGN0eC50aWxlc2AsIGBjdHgua2V5UmVwZWF0YCB8IE5vbmUuIFRoZXkgcmVhY2ggdGhlIGhvc3QncyBvd24gZHJhd2luZyBhbmQgaW5wdXQgdGltaW5nLiB8CnwgYGN0eC50aXRsZWAgfCBOb25lLiBUaXRsZS1zY3JlZW4gYWN0aW9ucyBiZWxvbmcgdG8gdGhlIGZpcnN0LXBhcnR5IHByZXNlbnRhdGlvbiBtb2QuIHwKfCBgY3R4LmF1dGhvcmluZ2AgfCBOb25lIGF0IHJ1biB0aW1lLiBUaGUgU0RLIGlzIGEgYnVpbGQtdGltZSBwYWNrYWdlLiB8CnwgYGN0eC5kZWJ1Z2AsIGBjdHgud2l6YXJkYCB8IE5vbmUgZm9yIHB1YmxpYyBtb2RzLiBEZWJ1ZyB0b29scyBhcmUgZmlyc3QtcGFydHkuIHwKfCBgY3R4Lmtub3dsZWRnZWAsIGBjdHguc2hhcmVkYCwgYGN0eC5iYWNrdXBGb2xkZXJgIHwgTm90IGluIEFQSSAyIHlldC4gfAp8IGBjdHguc2F2ZXNgLCBgY3R4Lmluc3RhbGxNb2RgLCBgY3R4LnJlbG9hZEdhbWVgLCBgY3R4LmxvYWRNb2RGb3JTZXNzaW9uYCwgYGN0eC5yZWFkTW9kYCB8IE5vdCBpbiBBUEkgMiB5ZXQuIGBBUEkxX0NPTlRFWFRfTUFQYCBsaXN0cyB0aGVtIGFzIGxhdGVyIGZpcnN0LXBhcnR5IGBtYW5hZ2VgIG1lbWJlcnMuIHwKfCBgY3R4Lm9wdGlvbnMuc2V0YCwgYGN0eC5rZXliaW5kaW5nc2AgfCBOb3QgaW4gQVBJIDIuIFRoZSBgb3B0aW9uc0NoYW5nZWRgIGhvb2sgcmVhZHMgb3B0aW9ucyBhZnRlciBhIGNoYW5nZSwgYW5kIGB1aS5rZXlzYCByZWFjaGVzIG9ubHkgYmluZGluZ3MgdGhlIG1vZCBvd25zLiB8CnwgYGN0eC5zZXR0aW5ncy5vbkNoYW5nZWAgfCBOb25lLiBSZWFkIGBtZXRhLnNldHRpbmdzKClgIGFnYWluLiB8CnwgYGN0eC5jaGFyYWN0ZXIuc2hlZXQoKWAsIGBoaXN0b3J5KClgLCBgcnVuUmVwb3J0KClgLCBgb25SdW5FbmQoKWAgfCBOb25lLiBgdmlldy5wbGF5ZXIoKWAgaGFzIHRoZSBudW1iZXJzIGZyb20gdGhlIGNoYXJhY3RlciBzaGVldC4gfAp8IGBjdHguaW5zcGVjdGAncyB0ZXh0IGFuZCBnZW9tZXRyeTogaXRlbSBkZXNjcmlwdGlvbnMsIG1vbnN0ZXIgcmVjYWxsLCBzcGVsbCBpbmZvLCBsb2Fkb3V0IGNvbXBhcmlzb24sIGl0ZW0gdGVzdGVyLCBwcm9qZWN0aW9uIHBhdGgsIGJsYXN0IGFyZWEgfCBOb25lLiBgdmlld2AgcmV0dXJucyB0aGUgZGF0YSBiZWhpbmQgdGhlbS4gfAp8IGBjdHguaW50ZW50LmNhdGFsb2d1ZSgpYCB8IE5vbmUuIHwKfCBgY3R4LnNuYXBzaG90KClgJ3MgYHJlc3RpbmdgLCBgbWVzc2FnZXNgLCBgc3RvcmVTdGF0dXNgLCBgYWN0aXZlQmxhc3RgLCBgY29yZWAgYW5kIGBmcmFtZWAgfCBOb3QgaW4gYHZpZXcuaW5wdXQoKWAuIGB2aWV3LndvcmxkKClgIGNvdmVycyB3aGF0IGBjb3JlYCBoZWxkLiB8CgpgQVBJMV9DT05URVhUX01BUGAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvbW9kLWFwaTItc2hpbS50c2AgbmFtZXMsIGZvciBldmVyeSBtZW1iZXIgb2YgdGhlIEFQSSAxIGNvbnRleHQsIHdoZXJlIGl0IHdlbnQgaW4gQVBJIDIgb3Igd2h5IGl0IGhhcyBub25lLgoKIyMgU3RlcCAyOiBjb252ZXJ0IHRoZSBtYW5pZmVzdAoKU2NoZW1hIDIgd3JhcHMgdGhlIG1hbmlmZXN0IGluIGEgZG9jdW1lbnQ6IGB7ICJmb3JtYXQiOiAibmVvLWFuZ2JhbmQvbW9kL21hbmlmZXN0IiwgInNjaGVtYVZlcnNpb24iOiAyLCAiZGF0YSI6IHsgLi4uIH0gfWAuIFRoZSBnYW1lIHJlYWRzIGEgYmFyZSBzY2hlbWEgMSBtYW5pZmVzdCwgYSBzY2hlbWEgMSBkb2N1bWVudCBhbmQgYSBzY2hlbWEgMiBkb2N1bWVudC4gYE1vZFByb2plY3QuZW1pdCgpYCBhbHJlYWR5IHdyaXRlcyBzY2hlbWEgMi4gRm9yIGEgaGFuZC13cml0dGVuIG1hbmlmZXN0LCBydW4gdGhlIGNvbnZlcnRlciBvbmNlIGZyb20gYSBOb2RlIHNjcmlwdCBpbiB5b3VyIG1vZCdzIHJlcG9zaXRvcnk6CgpgYGBqcwppbXBvcnQgeyByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICJub2RlOmZzIjsKaW1wb3J0IHsgY29udmVydE1hbmlmZXN0VjEsIG1vZE1hbmlmZXN0Rm9ybWF0LCBzZXJpYWxpemVEb2N1bWVudCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiOwoKY29uc3QgdjEgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYygibWFuaWZlc3QuanNvbiIsICJ1dGY4IikpOwp3cml0ZUZpbGVTeW5jKCJtYW5pZmVzdC5qc29uIiwgc2VyaWFsaXplRG9jdW1lbnQobW9kTWFuaWZlc3RGb3JtYXQsIGNvbnZlcnRNYW5pZmVzdFYxKHYxKSkpOwpgYGAKCmBzZXJpYWxpemVEb2N1bWVudGAgdmFsaWRhdGVzIHRoZSByZXN1bHQgYW5kIHRocm93cyBgRG9jdW1lbnRWYWxpZGF0aW9uRXJyb3JgIHdoZW4gaXQgZG9lcyBub3QgcGFzcy4gYG1hbmlmZXN0VG9WMmAgZG9lcyB0aGUgc2FtZSBqb2IgZm9yIGEgYFBhY2tNYW5pZmVzdGAgYWxyZWFkeSBpbiBtZW1vcnkuCgpCZWZvcmUsIHRoZSBzY2hlbWEgMSBtYW5pZmVzdCBvZiBgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbmA6CgpgYGBqc29uCnsKICAiaWQiOiAidHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbiIsCiAgIm5hbWUiOiAiVHV0b3JpYWwgNjogQWRkIGFuIE9wdGlvbiIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJwbHVnaW4iLAogICJtb2RBcGkiOiAxLAogICJlbmdpbmUiOiAiPj0wLjIwLjAiLAogICJhdXRob3IiOiAibmVvc3RyeWRlciIsCiAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlciIsCiAgImRlc2NyaXB0aW9uIjogIi4uLiIsCiAgInJ1bGVzIjogW3sgImZsYWciOiAidHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbi5jb25ncmF0dWxhdGUiLCAidGl0bGUiOiAiLi4uIiwgImRlc2NyaXB0aW9uIjogIi4uLiIsICJkZWZhdWx0IjogZmFsc2UgfV0KfQpgYGAKCkFmdGVyLCBhcyB0aGUgY29udmVydGVyIHdyaXRlcyBpdCAoZGVzY3JpcHRpb25zIHNob3J0ZW5lZCBoZXJlKToKCmBgYGpzb24KewogICJmb3JtYXQiOiAibmVvLWFuZ2JhbmQvbW9kL21hbmlmZXN0IiwKICAic2NoZW1hVmVyc2lvbiI6IDIsCiAgImRhdGEiOiB7CiAgICAiaWQiOiAidHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbiIsCiAgICAibmFtZSI6ICJUdXRvcmlhbCA2OiBBZGQgYW4gT3B0aW9uIiwKICAgICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAgICJhcGkiOiAiPj0xLjAuMCA8Mi4wLjAiLAogICAgInJ1bnRpbWUiOiAiaW4tcHJvY2VzcyIsCiAgICAiZW5naW5lIjogewogICAgICAicmFuZ2UiOiAiPj0wLjIwLjAiLAogICAgICAiYmVjYXVzZSI6ICJDYXJyaWVkIG92ZXIgZnJvbSBhIHNjaGVtYSAxIG1hbmlmZXN0LCB3aGljaCBnYXZlIG5vIHJlYXNvbi4iCiAgICB9LAogICAgImRlc2NyaXB0aW9uIjogIi4uLiIsCiAgICAiYXV0aG9yIjogIm5lb3N0cnlkZXIiLAogICAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAgICJyZXBvc2l0b3J5IjogImh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyIiwKICAgICJzaGFwZSI6ICJwbHVnaW4iLAogICAgInJ1bGVzIjogW3sgImZsYWciOiAidHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbi5jb25ncmF0dWxhdGUiLCAidGl0bGUiOiAiLi4uIiwgImRlc2NyaXB0aW9uIjogIi4uLiIsICJkZWZhdWx0IjogZmFsc2UgfV0KICB9Cn0KYGBgCgpXaGF0IHRoZSBjb252ZXJ0ZXIgY2hhbmdlczoKCnwgU2NoZW1hIDEgfCBTY2hlbWEgMiB8CnwgLS0tIHwgLS0tIHwKfCBgIm1vZEFwaSI6IDFgLCBgcnVudGltZWAgYWJzZW50IG9yIGAiaW4tcHJvY2VzcyJgIHwgYCJydW50aW1lIjogImluLXByb2Nlc3MiYCwgYCJhcGkiOiAiPj0xLjAuMCA8Mi4wLjAiYCB8CnwgYCJtb2RBcGkiOiAyYCwgYCJydW50aW1lIjogIndvcmtlciJgLCBgd29ya2VyRW50cnlgIHwgYCJydW50aW1lIjogIndvcmtlciJgLCBgImFwaSI6ICIyLjAuMC13b3JrZXIiYCwgYGVudHJ5YCB8CnwgTm8gYG1vZEFwaWAgYW5kIG5vIGBwbHVnaW5gIGZhY2V0IHwgYCJydW50aW1lIjogImRhdGEiYCwgYCJhcGkiOiAiKiJgIHwKfCBgImVuZ2luZSI6ICI8cmFuZ2U+ImAgfCBgImVuZ2luZSI6IHsgInJhbmdlIiwgImJlY2F1c2UiIH1gLCB3aXRoIHRoZSBwbGFjZWhvbGRlciByZWFzb24gc2hvd24gYWJvdmUgfAp8IGBkZXBlbmRlbmNpZXNgIHwgYGRlcGVuZGVuY2llcy5yZXF1aXJlZGAsIGVhY2ggYXMgYHsgInJhbmdlIiB9YCB8CnwgYG9wdGlvbmFsRGVwZW5kZW5jaWVzYCB8IGBkZXBlbmRlbmNpZXMub3B0aW9uYWxgIHwKfCBBIGBjb21wYXRgIGNsYWltIG9mIGBjb25mbGljdHNgIHdpdGggbm8gYHNjb3BlYCwgdGhlIG9ubHkgb25lIGZvciB0aGF0IG1vZCwgd2hpY2ggaXMgbm90IGFsc28gYSBkZXBlbmRlbmN5IHwgYGRlcGVuZGVuY2llcy5jb25mbGljdHNgLCBhcyBgeyAicmFuZ2UiPywgImJlY2F1c2UiIH1gIHwKfCBFdmVyeSBvdGhlciBgY29tcGF0YCBjbGFpbSB8IGBjb21wYXRgLCB1bmNoYW5nZWQgfAp8IGBjaGFuZ2Vsb2dgLCBgc2NyZWVuc2hvdHNgIHwgYGxpc3RpbmcuY2hhbmdlbG9nYCwgYGxpc3Rpbmcuc2NyZWVuc2hvdHNgIHwKfCBFdmVyeSBvdGhlciBmaWVsZCB8IEtlcHQgdW5kZXIgdGhlIHNhbWUgbmFtZSB8CgpUaGUgY29udmVydGVyIHRocm93cyBgTWFuaWZlc3RDb252ZXJzaW9uRXJyb3JgIGZvciBhIG1vZCB0aGF0IHNoaXBzIGNvZGUgd2l0aG91dCBhIGBtb2RBcGlgIChhZGQgYCJtb2RBcGkiOiAxYCBmaXJzdCkgYW5kIGZvciBhbnkgb3RoZXIgYG1vZEFwaWAgdmFsdWUuCgpBZnRlciBjb252ZXJ0aW5nLCByZXBsYWNlIHRoZSBwbGFjZWhvbGRlciBgYmVjYXVzZWAgdW5kZXIgYGVuZ2luZWAgd2l0aCB0aGUgcmVhbCByZWFzb24gdGhlIG1vZCBuZWVkcyB0aGF0IGdhbWUgdmVyc2lvbiwgb3IgcmVtb3ZlIGBlbmdpbmVgIGlmIG5vdGhpbmcgbmVlZHMgaXQuIEEgcmVxdWlyZWQgb3Igb3B0aW9uYWwgZGVwZW5kZW5jeSBjYW4gY2FycnkgaXRzIG93biBgYmVjYXVzZWAuIFNjaGVtYSAyIGFsc28gYWRkcyBgdGV4dGAgKGEgZGVmYXVsdCBsb2NhbGUgYW5kIG9uZSBzdHJpbmdzIGZpbGUgcGVyIGxvY2FsZSksIGBsaXN0aW5nLnRhZ3NgIGFuZCBgYnVkZ2V0YC4KCmBidWRnZXQubXNQZXJUdXJuYCBpcyB0aGUgdGltZSB0aGUgbW9kIGFza3MgZm9yIHBlciBnYW1lIHR1cm4sIGFib3ZlIDAgYW5kIGF0IG1vc3QgNTAwIG1pbGxpc2Vjb25kcy4gVGhlIGhvc3QgZG9lcyBub3QgcmVhZCBpdCB5ZXQsIHNvIGV2ZXJ5IG1vZCBpcyBoZWxkIHRvIHRoZSBkZWZhdWx0IG9mIDUwIG1zLiBPbmx5IHRoZSBzeW5jaHJvbm91cyBwYXJ0IG9mIGVhY2ggY2FsbCBpbnRvIHRoZSBtb2QgaXMgdGltZWQuIEEgdHVybiBvdmVyIHRoZSBidWRnZXQgd3JpdGVzIGEgd2FybmluZyB0byB0aGUgbG9nLiBBIHRocm93LCBhIHJlamVjdGVkIHByb21pc2UsIG9yIGEgc2Vjb25kIHR1cm4gb3ZlciA1MDAgbXMgd2l0aGluIDIwMCBnYW1lIHR1cm5zIGNvdW50cyBhcyBhIGZhdWx0LCBhbmQgdGhyZWUgZmF1bHRzIHdpdGhpbiAyMDAgZ2FtZSB0dXJucyBzd2l0Y2ggdGhlIG1vZCBvZmYgdW50aWwgdGhlIGdhbWUgbmV4dCBzdGFydHMuCgpUaGUgdmFsaWRhdG9yIGFsc28gY2hlY2tzIHRoYXQgdGhlIGZpZWxkcyBhZ3JlZS4gQSBgZGF0YWAgbW9kIGhhcyBubyBgZW50cnlgLCBubyBgcGx1Z2luYCBmYWNldCBhbmQgbm8gYC5qc2Agb3IgYC5tanNgIGZpbGUgaW4gaXRzIHBheWxvYWQuIEFuIGBpbi1wcm9jZXNzYCBtb2QncyBlbnRyeSBpcyBgcGx1Z2luLmpzYCwgYSBgd29ya2VyYCBtb2QgbmFtZXMgaXRzIGBlbnRyeWAsIGFuZCBhIG1vZCB0aGF0IHJ1bnMgY29kZSBsaXN0cyBgcGx1Z2luYCBpbiBgZmFjZXRzYCB3aGVuIGl0IGxpc3RzIGZhY2V0cyBhdCBhbGwuIEEgbW9kIGlkIGFwcGVhcnMgaW4gYXQgbW9zdCBvbmUgb2YgYHJlcXVpcmVkYCwgYG9wdGlvbmFsYCBhbmQgYGNvbmZsaWN0c2AsIGFuZCBhIG1vZCBjYW5ub3QgbGlzdCBpdHNlbGYuCgpUaGUgYGFwaWAgcmFuZ2UgZGVjaWRlcyB3aGV0aGVyIHRoZSBtb2QgbG9hZHMuIGA+PTEuMC4wIDwyLjAuMGAga2VlcHMgaXQgb24gQVBJIDEsIHdoaWNoIHRoaXMgYnVpbGQgbG9hZHMuIEFuIEFQSSAyIG1vZCBkZWNsYXJlcyBgPj0yLjAuMCA8My4wLjBgIChgTU9EX0FQSTJfREVGQVVMVF9SQU5HRWApLCBpbiBib3RoIHRoZSBtYW5pZmVzdCBhbmQgdGhlIGNvZGUncyBvd24gYGFwaWAuIGBhcGlSYW5nZVZlcmRpY3QocmFuZ2UpYCBhbnN3ZXJzIGB7IG9rOiB0cnVlIH1gIG9yIG9uZSBvZiBmb3VyIGNvZGVzOiBgdG9vLW5ld2AgKHRoZSBtb2QgbmVlZHMgYSBuZXdlciBnYW1lKSwgYHRvby1vbGRgICh0aGUgbW9kIG5lZWRzIGFuIHVwZGF0ZSksIGBvdXRzaWRlYCAodGhlIHJhbmdlIG1pc3NlcyB0aGlzIHZlcnNpb24gZm9yIGFub3RoZXIgcmVhc29uKSBhbmQgYG1hbGZvcm1lZGAuCgojIyBTdGVwIDM6IGNoYW5nZSB0aGUgc2hhcGUgb2YgdGhlIGNvZGUKCkFuIEFQSSAyIG1vZCBkZWZhdWx0LWV4cG9ydHMgYW4gYEFwaTJNb2REZWZpbml0aW9uYDoKCnwgQVBJIDEgYE1vZFBsdWdpbmAgfCBBUEkgMiBgQXBpMk1vZERlZmluaXRpb25gIHwKfCAtLS0gfCAtLS0gfAp8IGBhcGk6IDFgIHwgYGFwaTogIj49Mi4wLjAgPDMuMC4wImAgfAp8IGBob29rcyhjdHgpYCB8IGBob29rcyh7IGlkLCBmbGFncyB9KWAgfAp8IGByZWdpc3Rlcihob3N0LCBjdHgpYCB8IGBzdGFydChtb2QpYCwgd2hpY2ggbWF5IGJlIGFzeW5jLiBBIHJlamVjdGVkIHByb21pc2UgaXMgd3JpdHRlbiB0byB0aGUgbW9kJ3MgbG9nLiB8CnwgYG1pZ3JhdGVCYWcoZGF0YSwgZnJvbVNjaGVtYSwgY3R4KWAgfCBgbWlncmF0ZUJhZyhkYXRhLCBmcm9tU2NoZW1hKWAsIHdoaWNoIHJlY2VpdmVzIGEgY29weSB8CnwgYHVuaW5zdGFsbCgpYCB8IGBzdG9wKClgIHwKfCBObyBlcXVpdmFsZW50IHwgYHByZWZzOiB7IHZlcnNpb24sIG1pZ3JhdGUgfWAgKHNlZSBTdGVwIDEwKSB8CgpBIGRlZmluaXRpb24gZGVjbGFyZXMgYGhvb2tzYCwgYHN0YXJ0YCBvciBib3RoLCBhbmQgYHByZWZzLnZlcnNpb25gIGlzIGEgd2hvbGUgbnVtYmVyIGZyb20gMS4KCkJlZm9yZToKCmBgYHRzCmltcG9ydCB0eXBlIHsgTW9kSG9va3MsIE1vZFBsdWdpbkNvbnRleHQsIE1vZFJlZ2lzdHJ5SG9zdCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLWNvcmUiOwoKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICBob29rcyhjdHg6IE1vZFBsdWdpbkNvbnRleHQpOiBNb2RIb29rcyB8IHVuZGVmaW5lZCB7CiAgICBpZiAoY3R4LmZsYWdzWyJteS1tb2Quc2hvdXQiXSAhPT0gdHJ1ZSkgcmV0dXJuIHVuZGVmaW5lZDsKICAgIHJldHVybiB7IG1lc3NhZ2VUZXh0OiAocmF3KSA9PiByYXcudG9VcHBlckNhc2UoKSB9OwogIH0sCiAgcmVnaXN0ZXIoX2hvc3Q6IE1vZFJlZ2lzdHJ5SG9zdCwgY3R4OiBNb2RQbHVnaW5Db250ZXh0KTogdm9pZCB7CiAgICBjdHgubG9nKCJzdGFydGVkIik7CiAgfSwKICB1bmluc3RhbGwoKTogdm9pZCB7fSwKfTsKYGBgCgpBZnRlcjoKCmBgYHRzCmltcG9ydCB0eXBlIHsgQXBpMk1vZERlZmluaXRpb24gfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6ICI+PTIuMC4wIDwzLjAuMCIsCiAgaG9va3M6ICh7IGZsYWdzIH0pID0+CiAgICBmbGFnc1sibXktbW9kLnNob3V0Il0gPT09IHRydWUgPyB7IG1lc3NhZ2VUZXh0OiAocmF3KSA9PiByYXcudG9VcHBlckNhc2UoKSB9IDogdW5kZWZpbmVkLAogIHN0YXJ0KG1vZCkgewogICAgbW9kLm1ldGEubG9nKCJzdGFydGVkIik7CiAgfSwKICBzdG9wKCkge30sCn0gc2F0aXNmaWVzIEFwaTJNb2REZWZpbml0aW9uOwpgYGAKCkltcG9ydCB0aGUgU0RLIHdpdGggYGltcG9ydCB0eXBlYCBhbmQgY2hlY2sgdGhlIG9iamVjdCB3aXRoIGBzYXRpc2ZpZXNgLiBgZGVmaW5lQXBpMk1vZChkZWZpbml0aW9uKWAgcmV0dXJucyBpdHMgYXJndW1lbnQgYW5kIGdpdmVzIHRoZSBzYW1lIGNoZWNrLCBidXQgaXQgaXMgYSB2YWx1ZSBpbXBvcnQsIGFuZCBhIG1vZHVsZSBsb2FkZWQgZnJvbSBhIG1vZCBmb2xkZXIgY2Fubm90IHJlc29sdmUgYSBwYWNrYWdlIGJ5IG5hbWUuIGBuZW8tYW5nYmFuZC1tb2QtYnVpbGRgIHJlZnVzZXMgYW55IHN1Y2ggaW1wb3J0IGxlZnQgaW4gYHBsdWdpbi5qc2AuCgojIyBTdGVwIDQ6IGhhbmRsZSByZXN1bHRzIGluc3RlYWQgb2YgZXhjZXB0aW9ucwoKSW4gQVBJIDEgYSBwZXJtaXNzaW9uIHRoZSBwbGF5ZXIgcmVmdXNlZCBzaG93cyB1cCBhcyBhIG1pc3NpbmcgYGN0eGAgbWVtYmVyIChgY3R4LnVpYCBpcyB1bmRlZmluZWQpIG9yIGFzIGFuIGBBZ2VudENhcGFiaWxpdHlFcnJvcmAgdGhyb3duIGJ5IHRoZSBjYWxsLiBJbiBBUEkgMiBldmVyeSBkb21haW4gaXMgcHJlc2VudCBhbmQgZXZlcnkgbWV0aG9kIHJldHVybnMgYSBwcm9taXNlIG9mIGFuIGBBcGkyUmVzdWx0YC4gQ2hlY2sgYG9rYCBiZWZvcmUgcmVhZGluZyBgdmFsdWVgOgoKYGBgdHMKY29uc3QgbW9uc3RlcnMgPSBhd2FpdCBtb2Qudmlldy5tb25zdGVycygpOwppZiAobW9uc3RlcnMub2spIHsKICBtb2QubWV0YS5sb2coYCR7bW9uc3RlcnMudmFsdWUubGVuZ3RofSBtb25zdGVycyBpbiB2aWV3YCk7Cn0gZWxzZSBpZiAobW9uc3RlcnMucmVhc29uID09PSAibm90LWdyYW50ZWQiKSB7CiAgbW9kLm1ldGEubG9nKGBtb25zdGVyIGNvdW50IGlzIG9mZjogaXQgbmVlZHMgJHttb25zdGVycy5jYXBhYmlsaXR5fWApOwp9IGVsc2UgewogIG1vZC5tZXRhLmxvZyhtb25zdGVycy5tZXNzYWdlKTsKfQpgYGAKCkEgZmFpbHVyZSBpcyBgbm90LWdyYW50ZWRgICh3aXRoIHRoZSBgY2FwYWJpbGl0eWAgdG8gYXNrIGZvciksIGB1bmF2YWlsYWJsZWAgKG5vIGdhbWUgeWV0LCBubyBjaGFyYWN0ZXIgeWV0LCBvciBhIGZyb250IGVuZCB3aXRob3V0IHRoZSBmZWF0dXJlKSBvciBgcmVmdXNlZGAgKHdpdGggYSBgY29kZWApLiBFdmVyeSBmYWlsdXJlIGhhcyBhIGBtZXNzYWdlYC4gYGlzTm90R3JhbnRlZChyZXN1bHQpYCBpbiB0aGUgU0RLIG1ha2VzIHRoZSBzYW1lIGNoZWNrIGFzIGByZXN1bHQucmVhc29uID09PSAibm90LWdyYW50ZWQiYCwgdGhvdWdoIGNvZGUgYnVpbHQgd2l0aCBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCBoYXMgdG8gd3JpdGUgdGhlIGNvbXBhcmlzb24gb3V0IGZvciB0aGUgaW1wb3J0IHJlYXNvbiBpbiBTdGVwIDMuIGBtb2QubWV0YS5ncmFudGVkKCJldmVudDptZXNzYWdlIilgIGFuc3dlcnMgd2hldGhlciBhIHBlcm1pc3Npb24gaXMgZ3JhbnRlZCB3aXRob3V0IG1ha2luZyBhIGNhbGwuIEEgZmF1bHQgdGhhdCBpcyBub3QgYSBwZXJtaXNzaW9uIHByb2JsZW0gc3RpbGwgcmVqZWN0cyB0aGUgcHJvbWlzZS4KCiMjIFN0ZXAgNTogbW92ZSByZWFkcyB0byBgdmlld2AgYW5kIGBjb250ZW50YAoKfCBBUEkgMSB8IEFQSSAyIHwgUGVybWlzc2lvbiB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBgY3R4LnN0YXRlLmFjdG9yLnBsYXllcmAsIGBjdHguY2hhcmFjdGVyLmtleSgpYCB8IGB2aWV3LnBsYXllcigpYCB8IGBzdGF0ZTpwbGF5ZXIucmVhZGAgfAp8IGBjdHguc3RhdGUubW9uc3RlcnNgLCBgY3R4Lmluc3BlY3RgIHwgYHZpZXcubW9uc3RlcnMoKWAsIGB2aWV3LndvcmxkKClgIHwgYHN0YXRlOm1vbnN0ZXJzLnJlYWRgIHwKfCBgY3R4Lmtub3duTGV2ZWwoKWAgfCBgdmlldy5sZXZlbCgpYCB8IGBzdGF0ZTptYXAucmVhZGAgfAp8IGBjdHguc25hcHNob3QoKWAsIGBjdHguZHJpdmVyKClgIHwgYHZpZXcuaW5wdXQoKWAgKGB0b2tlbmAsIGBkcml2ZXJgLCBgcGhhc2VgLCBgbWVzc2FnZVBlbmRpbmdgLCBgcHJvbXB0YCkgfCBgc3RhdGU6aW50ZXJhY3Rpb24ucmVhZGAgfAp8IEFsbCBvZiB0aGUgYWJvdmUgYXQgb25jZSB8IGB2aWV3LndvcmxkKClgLCB3aXRoIGBudWxsYCBmb3IgZWFjaCBwYXJ0IHRoZSBtb2QgbWF5IG5vdCByZWFkIHwgRWFjaCBwYXJ0J3Mgb3duIHwKfCBgY3R4LnJlZ2lzdHJpZXNgLCBgY3R4LmNvbXBvc2VkUmVjb3Jkc2AgfCBgY29udGVudC5yZWNvcmRzKGZpbGUpYCwgYGNvbnRlbnQubG9va3VwKHsgZmlsZSwga2V5IH0pYCB8IE5vbmUgfAp8IGBjdHguZGF0YWAsIGBjdHguYXNzZXRVcmwocGF0aClgIHwgYGNvbnRlbnQub3duKClgLCBgY29udGVudC5hc3NldChwYXRoKWAgfCBOb25lIHwKfCBgY3R4LmNvcmVgIHwgTm9uZSB8IHwKCmB2aWV3YCBzaG93cyB0aGUgZ2FtZSBhcyB0aGUgcGxheWVyIGtub3dzIGl0LiBJdCBsaXN0cyBvbmx5IHRoZSBtb25zdGVycyB0aGUgcGxheWVyIHBlcmNlaXZlcywgd2l0aCBhIGhlYWx0aCBiYW5kIChgdW5odXJ0YCB0byBgYWxtb3N0YCkgaW4gcGxhY2Ugb2YgaGl0IHBvaW50cywgdGhlIHJhY2UncyBiYXNlIHNwZWVkIGluIHBsYWNlIG9mIGl0cyBjdXJyZW50IHNwZWVkLCBhbmQgb25seSB0aGUgZmxhZ3MgYW5kIHNwZWxscyB0aGUgcGxheWVyJ3MgbW9uc3RlciBtZW1vcnkgaGFzIGxlYXJuZWQuIEl0ZW1zIHNob3cgd2hhdCB0aGUgcGxheWVyIGhhcyBpZGVudGlmaWVkLCBhbmQgdGhlIGxldmVsIGlzIHRoZSByZW1lbWJlcmVkIG1hcCwgbmV2ZXIgdGhlIHJlYWwgb25lLiBBbiBBUEkgMSBtb2QgdGhhdCByZWFkIGBjdHguc3RhdGVgIHNhdyBldmVyeSBtb25zdGVyIG9uIHRoZSBsZXZlbCBhbmQgaXRzIGV4YWN0IGhpdCBwb2ludHMsIHNvIGNvZGUgdGhhdCBjb3VudGVkIG9yIHRyYWNrZWQgaGlkZGVuIG1vbnN0ZXJzIGhhcyBubyBkaXJlY3QgdHJhbnNsYXRpb24uCgpCZWZvcmU6CgpgYGB0cwpjb25zdCBzdGF0ZSA9IGN0eC5zdGF0ZTsKaWYgKCFzdGF0ZSkgcmV0dXJuOwpjb25zdCBwID0gc3RhdGUuYWN0b3IucGxheWVyOwpjdHgubG9nKGBIUCAke3AuY2hwfS8ke3AubWhwfWApOwpjb25zdCB3b3VuZGVkID0gc3RhdGUubW9uc3RlcnMuZmlsdGVyKChtKSA9PiBtICE9PSBudWxsICYmIG0uaHAgPCBtLm1heGhwKTsKY3R4LmxvZyhgJHt3b3VuZGVkLmxlbmd0aH0gd291bmRlZCBtb25zdGVycyBvbiB0aGUgbGV2ZWxgKTsKY29uc3QgY2F0ID0gY3R4LnJlZ2lzdHJpZXM/Lm1vbnN0ZXJzLnJhY2VzLmZpbmQoKHIpID0+IHIubmFtZSA9PT0gIlNjcmF3bnkgY2F0Iik7CmN0eC5sb2coYGZvdW5kIGF0IGRlcHRoICR7U3RyaW5nKGNhdD8ubGV2ZWwpfWApOwpgYGAKCkFmdGVyOgoKYGBgdHMKY29uc3QgcGxheWVyID0gYXdhaXQgbW9kLnZpZXcucGxheWVyKCk7CmlmIChwbGF5ZXIub2spIG1vZC5tZXRhLmxvZyhgSFAgJHtwbGF5ZXIudmFsdWUuaHB9LyR7cGxheWVyLnZhbHVlLm1heEhwfWApOwpjb25zdCBtb25zdGVycyA9IGF3YWl0IG1vZC52aWV3Lm1vbnN0ZXJzKCk7CmlmIChtb25zdGVycy5vaykgewogIGNvbnN0IHdvdW5kZWQgPSBtb25zdGVycy52YWx1ZS5maWx0ZXIoKG0pID0+IG0uaGVhbHRoICE9PSAidW5odXJ0Iik7CiAgbW9kLm1ldGEubG9nKGAke3dvdW5kZWQubGVuZ3RofSB3b3VuZGVkIG1vbnN0ZXJzIGluIHZpZXdgKTsKfQpjb25zdCBjYXQgPSBhd2FpdCBtb2QuY29udGVudC5sb29rdXAoeyBmaWxlOiAibW9uc3RlciIsIGtleTogInNjcmF3bnktY2F0IiB9KTsKaWYgKGNhdC5vaykgbW9kLm1ldGEubG9nKGBmb3VuZCBhdCBkZXB0aCAke1N0cmluZyhjYXQudmFsdWVbImRlcHRoIl0pfWApOwpgYGAKCmBjb250ZW50LnJlY29yZHMoZmlsZSlgIHJldHVybnMgdGhlIHJlY29yZHMgdGhlIHJ1bm5pbmcgZ2FtZSB3YXMgY29tcG9zZWQgZnJvbSwgbW9kIHJlY29yZHMgaW5jbHVkZWQsIGFzIEpTT04uIFRoZSBmaWVsZCBuYW1lcyBhcmUgdGhlIEpTT04gbmFtZXMgKGBkZXB0aGAsIGBoaXQtcG9pbnRzYCksIG5vdCB0aGUgbmFtZXMgb24gdGhlIGJvdW5kIG9iamVjdHMgaW4gYGN0eC5yZWdpc3RyaWVzYCAoYGxldmVsYCwgYGF2Z0hwYCBhbmQgc28gb24pLiBgY29udGVudC5sb29rdXBgIGZpbmRzIGEgcmVjb3JkIGJ5IHRoZSBrZXkgdGhlIFNESydzIGByZWNvcmRLZXlgIGRlcml2ZXMsIHdoaWNoIGZvciBhIG5hbWVkIHJlY29yZCBpcyBhIHNsdWcgb2YgdGhlIG5hbWUgKGBTY3Jhd255IGNhdGAgYmVjb21lcyBgc2NyYXdueS1jYXRgKS4gQW4gdW5rbm93biBmaWxlIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYHVua25vd24tZmlsZWAsIGFuZCBhbiB1bmtub3duIGtleSBgcmVmdXNlZGAgd2l0aCBgdW5rbm93bi1yZWNvcmRgLgoKYGN0eC5jb3JlYCBoYXMgbm8gQVBJIDIgY291bnRlcnBhcnQuIEVuZ2luZSBmdW5jdGlvbnMgYXJlIG5vdCByZWFjaGFibGUsIGFuZCBjb25zdGFudHMgc3VjaCBhcyBgY3R4LmNvcmUuVFZgIGFyZSBub3QgaGFuZGVkIG92ZXI6IGBLbm93bkl0ZW0udHZhbGAgaXMgYSBwbGFpbiBudW1iZXIsIHNvIGEgbW9kIHRoYXQgY29tcGFyZWQgYWdhaW5zdCBgVFYuU1dPUkRgIGtlZXBzIHRoYXQgbnVtYmVyIGl0c2VsZi4KCiMjIFN0ZXAgNjogbW92ZSBhY3Rpb25zIHRvIGBhY3RgCgpgY3R4LmludGVudC5zdWJtaXQodG9rZW4sIGludGVudClgIGJlY29tZXMgYGFjdC5zdWJtaXQodG9rZW4sIGludGVudClgIChwZXJtaXNzaW9uIGBpbnB1dDppbnRlbnRgKSwgYW5kIGBjdHgucHJvbXB0LnJlcGx5KGlkLCBhbnN3ZXIpYCBiZWNvbWVzIGBhY3QuYW5zd2VyKHByb21wdElkLCBhbnN3ZXIpYCAocGVybWlzc2lvbiBgaW5wdXQ6cHJvbXB0LnJlcGx5YCkuIFRoZSB0b2tlbiBjb21lcyBmcm9tIGB2aWV3LmlucHV0KClgIG9yIGB2aWV3LndvcmxkKClgLiBXaGVuIHRoZSBnYW1lIHR1cm5zIHRoZSBpbnRlbnQgZG93biAoYSBzdGFsZSB0b2tlbiwgZm9yIG9uZSksIHRoZSBhbnN3ZXIgaXMgYHJlZnVzZWRgIHdpdGggdGhlIGdhbWUncyBjb2RlIGFuZCByZWFzb24uCgpCZWZvcmU6CgpgYGB0cwpjb25zdCBzbmFwID0gY3R4LnNuYXBzaG90Py4oKTsKaWYgKCFzbmFwIHx8ICFjdHguaW50ZW50KSByZXR1cm47CmNvbnN0IHJlc3VsdCA9IGN0eC5pbnRlbnQuc3VibWl0KHNuYXAudG9rZW4sIHsga2luZDogInN0b3AtcmVzdGluZyIgfSk7CmlmICghcmVzdWx0LmFjY2VwdGVkKSBjdHgubG9nKHJlc3VsdC5yZWFzb24gPz8gInJlZnVzZWQiKTsKYGBgCgpBZnRlcjoKCmBgYHRzCmNvbnN0IGlucHV0ID0gYXdhaXQgbW9kLnZpZXcuaW5wdXQoKTsKaWYgKCFpbnB1dC5vaykgcmV0dXJuOwpjb25zdCBkb25lID0gYXdhaXQgbW9kLmFjdC5zdWJtaXQoaW5wdXQudmFsdWUudG9rZW4sIHsga2luZDogInN0b3AtcmVzdGluZyIgfSk7CmlmICghZG9uZS5vaykgbW9kLm1ldGEubG9nKGRvbmUubWVzc2FnZSk7CmBgYAoKYGFjdC5jb250cm9sbGVyYCBoYXMgYG93bnMoKWAsIGBzZXRTdGF0dXMoKWAsIGBtYXJrTm9uZGV0ZXJtaW5pc3RpYygpYCBhbmQgYHJlbGVhc2UoKWAsIHRoZSBzYW1lIGpvYnMgYXMgYGN0eC5jb250cm9sbGVyYC4gT25seSB0aGUgbW9kIHRoYXQgaW5zdGFsbGVkIHRoZSBnYW1lJ3MgY29udHJvbGxlciBob2xkcyB0aGUga2V5Ym9hcmQsIGFuZCBhbiBBUEkgMiBkZWZpbml0aW9uIGhhcyBubyBtZW1iZXIgdGhhdCBpbnN0YWxscyBvbmUsIHNvIGBvd25zKClgIGFuc3dlcnMgZmFsc2UgYW5kIHRoZSBvdGhlciB0aHJlZSBhbnN3ZXIgYHJlZnVzZWRgIHdpdGggYG5vdC1vd25lcmAuIEFuIGF1dG9wbGF5ZXIgc3RheXMgb24gQVBJIDEuCgojIyBTdGVwIDc6IG1vdmUgZXZlbnQgbGlzdGVuZXJzCgpBUEkgMSBjYWxscyBhIGxpc3RlbmVyIHdpdGggdGhlIGV2ZW50IG5hbWUgZmlyc3QsIGFuZCBgY3R4LmV2ZW50cy5vbmAgdGhyb3dzIHdoZW4gdGhlIHBlcm1pc3Npb24gaXMgbWlzc2luZy4gQVBJIDIgY2FsbHMgdGhlIGxpc3RlbmVyIHdpdGggdGhlIHBheWxvYWQgb25seSBhbmQgYW5zd2VycyB3aXRoIGEgc3Vic2NyaXB0aW9uIHRvIHBhc3MgdG8gYG9mZmAuIEVhY2ggZXZlbnQgc3RpbGwgbmVlZHMgYGV2ZW50OjxuYW1lPmAuCgpCZWZvcmU6CgpgYGB0cwpjdHguZXZlbnRzPy5vbigibWVzc2FnZSIsIChfdHlwZSwgZGF0YSkgPT4gewogIGlmIChkYXRhLm1zZz8uc3RhcnRzV2l0aCgiWW91IGZlZWwiKSkgY3R4LmxvZyhkYXRhLm1zZyk7Cn0pOwpgYGAKCkFmdGVyOgoKYGBgdHMKY29uc3Qgc3ViID0gYXdhaXQgbW9kLmV2ZW50cy5vbigibWVzc2FnZSIsIChldmVudCkgPT4gewogIGlmIChldmVudC50ZXh0LnN0YXJ0c1dpdGgoIllvdSBmZWVsIikpIG1vZC5tZXRhLmxvZyhldmVudC50ZXh0KTsKfSk7CmlmICghc3ViLm9rKSByZXR1cm47Ci8vIGxhdGVyCmF3YWl0IG1vZC5ldmVudHMub2ZmKHN1Yi52YWx1ZSk7CmBgYAoKVGhlIHBheWxvYWRzIGNoYW5nZSBhcyB3ZWxsOgoKfCBFdmVudCB8IEFQSSAxIHBheWxvYWQgfCBBUEkgMiBwYXlsb2FkIHwKfCAtLS0gfCAtLS0gfCAtLS0gfAp8IGBtZXNzYWdlYCB8IGB7IG1zZywgdHlwZSB9YCwgd2hlcmUgYG1zZ2AgbWF5IGJlIG51bGwgfCBgeyB0ZXh0LCB0eXBlIH1gIHwKfCBgY29tYmF0LW91dGNvbWVgIHwgRXZlcnkgb3V0Y29tZSwgd2l0aCBgc2VlbmAsIGV4YWN0IGBkYW1hZ2VgLCBhbmQgbW9uc3RlcnMgYnkgaW5kZXggfCBPbmx5IG91dGNvbWVzIHRoZSBwbGF5ZXIgdG9vayBwYXJ0IGluIG9yIHNhdy4gYHBsYXllckRhbWFnZWAgb25seSB3aGVuIHRoZSB0YXJnZXQgaXMgdGhlIHBsYXllci4gfAp8IGBoZWFsYCB8IEV2ZXJ5IGhlYWwsIHdpdGggYHNlZW5gIGFuZCBgYW1vdW50YCB8IE9ubHkgaGVhbHMgdGhlIHBsYXllciBzYXcuIGBwbGF5ZXJBbW91bnRgIG9ubHkgZm9yIHRoZSBwbGF5ZXIuIHwKfCBgbW90aW9uYCB8IEV2ZXJ5IG1vdmUsIHdpdGggYHNlZW5gIHwgT25seSBtb3ZlcyB0aGUgcGxheWVyIHNhdy4gfAp8IGBwbGF5ZXItY29tbWFuZGAgfCBgeyBjb2RlLCBkaXI/LCBhcmdzPywgcmVwZWF0cz8sIHBoYXNlLCB0b2tlbiB9YCB8IGB7IGNvZGUsIGRpcj8sIHBoYXNlLCB0b2tlbiB9YCB8CnwgYGR1bmdlb25sZXZlbGAsIGBkcml2ZXItY2hhbmdlZGAgfCBVbmNoYW5nZWQgfCBVbmNoYW5nZWQgfAp8IGBocGAsIGBtYW5hYCwgYGdvbGRgLCBgZXhwZXJpZW5jZWAsIGBwbGF5ZXJsZXZlbGAsIGBzdGF0dXNgLCBgaW52ZW50b3J5YCwgYGVxdWlwbWVudGAsIGBtb25zdGVybGlzdGAsIGBpdGVtbGlzdGAsIGBlbnRlci1zdG9yZWAsIGBsZWF2ZS1zdG9yZWAsIGBlbnRlci13b3JsZGAsIGBsZWF2ZS13b3JsZGAgfCBOb3RoaW5nIHwgYG51bGxgLiBSZWFkIGB2aWV3YCBmb3IgdGhlIG5ldyB2YWx1ZS4gfAoKSW4gQVBJIDIgYSBtb25zdGVyIGFwcGVhcnMgYXMgYHsgbW9uc3RlcjogaWQgfWAgd2hpbGUgdGhlIHBsYXllciBwZXJjZWl2ZXMgaXQgYW5kIGFzIGAidW5zZWVuImAgb3RoZXJ3aXNlLCBhbmQgYSBtb3ZlIG9yIGhlYWwgYnkgYW4gdW5zZWVuIG1vbnN0ZXIgaXMgbm90IGRlbGl2ZXJlZC4KClRob3NlIDIxIGV2ZW50cyBhcmUgYWxsIEFQSSAyIGRlbGl2ZXJzLiBgZXZlbnRzLm9uYCBhbnN3ZXJzIGByZWZ1c2VkYCB3aXRoIGB1bmtub3duLWV2ZW50YCBmb3IgYW55IG90aGVyIG5hbWUsIGluY2x1ZGluZyBgbWFwYCwgYHN0YXRzYCwgYGFjYCwgYGxpZ2h0YCwgYGZlZWxpbmdgLCBgcGxheWVybW92ZWRgLCBgYm9sdGAsIGBtaXNzaWxlYCwgYGV4cGxvc2lvbmAsIGBzb3VuZGAsIGBiZWxsYCwgYGVudGVyLWRlYXRoYCwgYGxlYXZlLWRlYXRoYCwgYGVudGVyLWJpcnRoYCBhbmQgdGhlIGxldmVsLWdlbmVyYXRpb24gZXZlbnRzIChgZ2VuLWxldmVsLXN0YXJ0YCBhbmQgdGhlIHJlc3QpLiBUaGUgU0RLIHN0YXRlcyB0aGUgcmVhc29uIGZvciB0aGUgZ2VuZXJhdGlvbiBldmVudHMgYW5kIGZvciBib2x0cyBhbmQgbWlzc2lsZXM6IHRoZXkgc2hvdyB0aGluZ3MgdGhlIHBsYXllciBkaWQgbm90IHNlZSwgc3VjaCBhcyBob3cgYSBsZXZlbCB3YXMgYnVpbHQgb3IgdGhlIHBhdGggb2YgYSBib2x0IG91dCBvZiB2aWV3LgoKIyMgU3RlcCA4OiBtb3ZlIGhvb2tzCgpBbiBBUEkgMiBtb2QgcmV0dXJucyBpdHMgaG9va3MgZnJvbSBgaG9va3MoeyBpZCwgZmxhZ3MgfSlgLCB3aGljaCBpcyBhc2tlZCBvbmNlIHdoZW4gY29udGVudCBjb21wb3Nlcy4gRWFjaCBob29rIGdldHMgcGxhaW4sIGZyb3plbiBkYXRhIGFuZCByZXR1cm5zIHBsYWluIGRhdGEsIGFuZCB0aGUgaG9zdCBjb21wb3NlcyBpdCB3aXRoIGV2ZXJ5IG90aGVyIG1vZCdzIGhvb2tzIGluIGxvYWQgb3JkZXIsIGFzIGl0IGRvZXMgZm9yIEFQSSAxLiBIb29rcyBhcmUgc3luY2hyb25vdXMgYW5kIHRoZSBBUEkgaXMgYXN5bmNocm9ub3VzLCBzbyBhIGhvb2sgY2Fubm90IGNhbGwgYHZpZXdgLiBLZWVwIHdoYXQgYSBob29rIG5lZWRzIGluIHlvdXIgbW9kdWxlIGFuZCB1cGRhdGUgaXQgZnJvbSBgc3RhcnRgIG9yIGZyb20gZXZlbnRzLgoKYGBgdHMKbGV0IGxvZzogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCA9ICgpID0+IHt9OwoKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogIj49Mi4wLjAgPDMuMC4wIiwKICBob29rczogKCkgPT4gKHsKICAgIG1vbnN0ZXJCZWNhbWVWaXNpYmxlOiAobW9uc3RlcikgPT4gbG9nKGAke21vbnN0ZXIucmFjZX0gKCR7bW9uc3Rlci5sb29rfSkgY29tZXMgaW50byB2aWV3YCksCiAgICBhcnRpZmFjdElkZW50aWZpZWQ6IChmb3VuZCkgPT4gbG9nKGBpZGVudGlmaWVkICR7Zm91bmQubmFtZX1gKSwKICAgIG9iamVjdExpc3RUaWVicmVhazogKGEsIGIpID0+IGEuZHkgLSBiLmR5IHx8IGEuZHggLSBiLmR4LAogICAgaGlzdG9yeUFkZDogKGVudHJ5KSA9PiAoeyBrZWVwOiAhZW50cnkuZHVwbGljYXRlIH0pLAogIH0pLAogIHN0YXJ0KG1vZCkgewogICAgbG9nID0gKG1lc3NhZ2UpID0+IG1vZC5tZXRhLmxvZyhtZXNzYWdlKTsKICB9LAp9IHNhdGlzZmllcyBBcGkyTW9kRGVmaW5pdGlvbjsKYGBgCgpgbW9uc3RlckJlY2FtZVZpc2libGVgIHJlY2VpdmVzIGEgYEtub3duTW9uc3RlcmA6IHJhY2UsIGdyaWQsIGhlYWx0aCBiYW5kLCBsb29rIHN0YXR1c2VzLCBhbmQgdGhlIGZsYWdzIGFuZCBzcGVsbHMgdGhlIHBsYXllciBoYXMgbGVhcm5lZCwgd2l0aCBubyBoaXQgcG9pbnRzLiBgYXJ0aWZhY3RJZGVudGlmaWVkYCByZWNlaXZlcyBgeyBuYW1lLCBhcnRpZmFjdEluZGV4IH1gLiBBUEkgMSBob29rcyBvbiB0aGlzIGJ1aWxkIHJlY2VpdmUgdGhlIHNhbWUgdmFsdWVzLiBCb3RoIGhvb2tzIHVzZWQgdG8gaGFuZCBvdmVyIHRoZSBsaXZlIGBNb25zdGVyYCwgYW5kIHRoZSBsaXZlIG9iamVjdCB3aXRoIGl0cyBgQXJ0aWZhY3RgLCBzbyBBUEkgMSBjb2RlIHRoYXQgcmVhZCBvdGhlciBmaWVsZHMgb2ZmIHRoZW0gbmVlZHMgY2hhbmdpbmcgZWl0aGVyIHdheS4KCmBoaXN0b3J5QWRkYCByZXR1cm5zIGEgZGVjaXNpb24sIGB7IGtlZXAsIHdoYXQ/LCBleHBhbmRVc2VySW5wdXQ/IH1gLCBpbiBwbGFjZSBvZiBjaGFuZ2luZyB0aGUgZW50cnkgaXQgd2FzIGdpdmVuIGFuZCByZXR1cm5pbmcgYSBib29sZWFuLiBBbiBlbnRyeSBpcyB3cml0dGVuIG9ubHkgaWYgZXZlcnkgbW9kIGtlZXBzIGl0LiBgb2JqZWN0TGlzdFRpZWJyZWFrYCBrZWVwcyBpdHMgYHsgZHksIGR4IH1gIGFyZ3VtZW50cywgYnV0IGBjdHguY29yZS5vYmplY3RMaXN0U3RhbmRhcmRDb21wYXJlYCBoYXMgbm8gQVBJIDIgZm9ybSwgc28gdGhlIGNvbXBhcmlzb24gaXMgd3JpdHRlbiBpbiB0aGUgbW9kLiBUaGUgb3RoZXIgaG9va3Mgd2l0aCBhbiBBUEkgMiBmb3JtIGtlZXAgdGhlaXIgQVBJIDEgYXJndW1lbnRzIGFzIHBsYWluIGRhdGE6IGBtZXNzYWdlVGV4dGAsIGBzY3JlZW5UZXh0YCwgYGNoYXJhY3RlckJhY2tncm91bmRgLCBgb2JqZWN0SW5mb1RleHRgLCBgZWZmZWN0SW50cm9gLCBgaGlzdG9yeURpc3BsYXlgLCBgc2F2ZU5vaXNlU2NlbnRgLCBgc2hhcGVMZWFybk9idmlvdXNGbGFnc0RpcmVjdGx5YCwgYG9wdGlvbnNDaGFuZ2VkYCBhbmQgYGFiaWxpdHlHYWluZWRgLiBgbW9kLmhvb2tzLmF2YWlsYWJsZWAgbGlzdHMgdGhlIGhvb2tzIHRoaXMgZ2FtZSBydW5zLCBhbmQgYG1vZC5ob29rcy5hY3RpdmVgIHRoZSBvbmVzIHRoZSBtb2QgZGVjbGFyZWQuCgpUaGVzZSBob29rcyBoYXZlIG5vIEFQSSAyIGZvcm06Cgp8IEhvb2sgfCBXaHkgfCBNZWFud2hpbGUgfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYG5ld0NoYXJhY3RlcmAsIGB3YWxrQmxvY2tlZEJ5RGlnZ2FibGVgLCBgbGV2ZWxHZW5lcmF0ZWRgLCBgcGFydGlhbFN0YWNrTWVyZ2VgLCBgcGFja092ZXJmbG93VmljdGltYCwgYGxldmVsUmV2aXNpdGVkYCB8IFRoZXkgcGFzcyBsaXZlIGdhbWUgb2JqZWN0cyBvciB0aGUgd2hvbGUgZ2FtZSBzdGF0ZS4gfCBLZWVwIHRoZSBtb2Qgb24gQVBJIDEuIEZvciB0aGUgbW9kJ3Mgb3duIHNldHVwIGF0IHRoZSBzdGFydCBvZiBhIGxpZmUsIGBtZXRhLm5ld0NoYXJhY3RlcmAgdGVsbHMgYHN0YXJ0YCB3aGV0aGVyIHRoZSBjaGFyYWN0ZXIgd2FzIGp1c3QgY3JlYXRlZC4gSXQgY2Fubm90IGNoYW5nZSB0aGUgZ2FtZSBzdGF0ZSB0aGUgd2F5IGBuZXdDaGFyYWN0ZXJgIGNhbi4gfAp8IGBwcm9qZWN0aW9uUmFkaXVzYCB8IEl0IHJ1bnMgZm9yIHByb2plY3Rpb25zIHRoZSBwbGF5ZXIgbmV2ZXIgc2Vlcy4gfCBLZWVwIHRoZSBtb2Qgb24gQVBJIDEuIHwKfCBgYXJ0aWZhY3RDb21taXRgIHwgSXQgcnVucyB3aGVuIGFuIGFydGlmYWN0IGlzIGdlbmVyYXRlZCwgYmVmb3JlIHRoZSBwbGF5ZXIgaGFzIHNlZW4gaXQuIHwgYGFydGlmYWN0SWRlbnRpZmllZGAgZm9yIHdoYXQgdGhlIHBsYXllciBsZWFybnMsIG9yIGtlZXAgdGhlIG1vZCBvbiBBUEkgMS4gfAoKIyMgU3RlcCA5OiBtb3ZlIHBhbmVscyBhbmQga2V5cwoKYGN0eC51aS5vcGVuUGFuZWxgIGhhbmRzIG92ZXIgYSBzaGFkb3cgcm9vdCB0byBmaWxsIHdpdGggSFRNTC4gQVBJIDIgaGFzIG5vIERPTTogYHVpLm1vdW50KHBhbmVsLCBvbkFjdGlvbilgIHRha2VzIGEgdHJlZSBvZiBgdGV4dGAsIGBidXR0b25gLCBgcm93YCBhbmQgYGNvbHVtbmAgbm9kZXMsIHRoZSBob3N0IGRyYXdzIGl0LCBhbmQgYG9uQWN0aW9uYCBoZWFycyB0aGUgYGFjdGlvbmAgb2YgZWFjaCBidXR0b24gdGhlIHBsYXllciB1c2VzLiBJdCBuZWVkcyB0aGUgYHVpOnBhbmVsLm1vdW50YCBwZXJtaXNzaW9uLgoKQmVmb3JlOgoKYGBgdHMKaWYgKCFjdHgudWkpIHJldHVybjsKY29uc3QgcGFuZWwgPSBjdHgudWkub3BlblBhbmVsKHsgaWQ6ICJub3RlcyIsIGxhYmVsOiAiTm90ZXMiIH0pOwpwYW5lbC5yb290LmlubmVySFRNTCA9IGA8cD5TYXZlZC48L3A+PGJ1dHRvbiBpZD0iY2xlYXIiPkNsZWFyPC9idXR0b24+YDsKcGFuZWwucm9vdC5nZXRFbGVtZW50QnlJZCgiY2xlYXIiKT8uYWRkRXZlbnRMaXN0ZW5lcigiY2xpY2siLCAoKSA9PiBjdHgucHJlZnMuc2V0KG51bGwpKTsKYGBgCgpBZnRlcjoKCmBgYHRzCmNvbnN0IHNob3duID0gYXdhaXQgbW9kLnVpLm1vdW50KAogIHsKICAgIGlkOiAibm90ZXMiLAogICAgdGl0bGU6ICJOb3RlcyIsCiAgICByb290OiB7CiAgICAgIHR5cGU6ICJjb2x1bW4iLAogICAgICBjaGlsZHJlbjogWwogICAgICAgIHsgdHlwZTogInRleHQiLCB0ZXh0OiAiU2F2ZWQuIiB9LAogICAgICAgIHsgdHlwZTogImJ1dHRvbiIsIGxhYmVsOiAiQ2xlYXIiLCBhY3Rpb246ICJjbGVhciIgfSwKICAgICAgXSwKICAgIH0sCiAgfSwKICAoYWN0aW9uKSA9PiB7CiAgICBpZiAoYWN0aW9uID09PSAiY2xlYXIiKSB2b2lkIG1vZC5zdG9yZS5wcmVmcy5zZXQobnVsbCk7CiAgfSwKKTsKaWYgKHNob3duLm9rKSBhd2FpdCBtb2QudWkucGF0Y2goc2hvd24udmFsdWUucGFuZWxJZCwgeyB2aXNpYmxlOiBmYWxzZSB9KTsKYGBgCgpBIHBhbmVsIGBpZGAgYW5kIGVhY2ggYnV0dG9uIGBhY3Rpb25gIGFyZSBsb3dlci1jYXNlIGxldHRlcnMsIGRpZ2l0cyBhbmQgaHlwaGVucywgc3RhcnRpbmcgd2l0aCBhIGxldHRlciwgdXAgdG8gNjQgY2hhcmFjdGVycy4gQSB0ZXh0IG9yIGxhYmVsIGhvbGRzIHVwIHRvIDQwOTYgY2hhcmFjdGVycywgYSByb3cgb3IgY29sdW1uIHVwIHRvIDMyIGNoaWxkcmVuLCBhbmQgdGhlIHRyZWUgbmVzdHMgdXAgdG8gMTYgbGV2ZWxzIGRlZXAuIFRoZSBob3N0IHBsYWNlcyB0aGUgcGFuZWwgYW5kIHN0eWxlcyBpdCwgYW5kIG1vdW50aW5nIGFuIGlkIHRoYXQgaXMgYWxyZWFkeSBtb3VudGVkIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYGJhZC1wYW5lbGAuIGB1aS5wYXRjaGAgY2hhbmdlcyB0aGUgdGl0bGUsIHJlcGxhY2VzIHRoZSB0cmVlIG9yIGhpZGVzIGFuZCBzaG93cyB0aGUgcGFuZWwuIFRpbGVkIHBhbmVsIGtpbmRzIChgY3R4LnVpLnJlZ2lzdGVyUGFuZWxLaW5kYCkgaGF2ZSBubyBBUEkgMiBmb3JtLgoKYGN0eC5rZXltYXBzYCBiZWNvbWVzIGB1aS5rZXlzYCwgd2l0aCBgYmluZCh0cmlnZ2VyLCBhY3Rpb24pYCwgYGxpc3QoKWAgYW5kIGByZW1vdmUodHJpZ2dlcilgIHVuZGVyIHRoZSBzYW1lIGBrZXltYXA6d3JpdGVgIHBlcm1pc3Npb24uIGBiaW5kYCBhbnN3ZXJzIGByZWZ1c2VkYCB3aXRoIGB0cmlnZ2VyLXRha2VuYCBmb3IgYSBrZXkgdGhhdCBpcyBub3QgZnJlZSBpbiB0aGUgY3VycmVudCBrZXlzZXQuIFRoZXJlIGlzIG5vIGByZWJpbmRgIG9yIGBpc0JpbmRhYmxlVHJpZ2dlcktleWA6IHJlbW92ZSB0aGUgYmluZGluZyBhbmQgYmluZCBhZ2Fpbi4KCiMjIFN0ZXAgMTA6IG1vdmUgc3RvcmFnZQoKYGN0eC5wcmVmc2AgYmVjb21lcyBgc3RvcmUucHJlZnNgIGFuZCBgY3R4LmNoYXJhY3RlclN0b3JlYCBiZWNvbWVzIGBzdG9yZS5jaGFyYWN0ZXJgLCBlYWNoIHdpdGggYGdldCgpYCBhbmQgYHNldCh2YWx1ZSlgLiBCb3RoIGhvbGQgSlNPTiwgYW5kIGBzZXQobnVsbClgIHJlbW92ZXMgdGhlIHZhbHVlLiBgc3RvcmUuY2hhcmFjdGVyYCBhbnN3ZXJzIGB1bmF2YWlsYWJsZWAgdW50aWwgYSBjaGFyYWN0ZXIgZXhpc3RzLgoKQSBtb2QgdGhhdCBjaGFuZ2VzIHRoZSBzaGFwZSBvZiBpdHMgc3RvcmVkIHByZWZlcmVuY2VzIGRlY2xhcmVzIGBwcmVmczogeyB2ZXJzaW9uLCBtaWdyYXRlKHZhbHVlLCBmcm9tVmVyc2lvbikgfWAuIFRoZSBob3N0IGtlZXBzIHRoZSB2ZXJzaW9uIGJlc2lkZSB0aGUgdmFsdWUsIGNhbGxzIGBtaWdyYXRlYCBvbiB0aGUgZmlyc3QgcmVhZCBvZiBhbiBvbGRlciB2YWx1ZSBhbmQgd3JpdGVzIHRoZSByZXN1bHQgYmFjay4gQSB2YWx1ZSBzdG9yZWQgd2l0aG91dCBhIHZlcnNpb24sIHdoaWNoIGluY2x1ZGVzIGV2ZXJ5dGhpbmcgYW4gQVBJIDEgbW9kIHdyb3RlIHRocm91Z2ggYGN0eC5wcmVmc2AsIGFycml2ZXMgd2l0aCBgZnJvbVZlcnNpb25gIDAsIHNvIGEgcGxheWVyJ3MgQVBJIDEgcHJlZmVyZW5jZXMgY2Fycnkgb3Zlci4KCkNoYXJhY3RlciBkYXRhIGtlZXBzIHVzaW5nIGBzYXZlU2NoZW1hYCBpbiB0aGUgbWFuaWZlc3QgYW5kIGBtaWdyYXRlQmFnYCwgd2hpY2ggbm93IGdldHMgYSBjb3B5IG9mIHRoZSBkYXRhIGFuZCBubyBgY3R4YC4KCkJlZm9yZToKCmBgYHRzCmNvbnN0IGNvbG91ciA9IGN0eC5wcmVmcy5nZXQoKSBhcyBzdHJpbmcgfCBudWxsOwpjdHgucHJlZnMuc2V0KGNvbG91ciA/PyAicmVkIik7CmN0eC5jaGFyYWN0ZXJTdG9yZT8uc2V0KHsga2lsbHM6IDMgfSk7CmBgYAoKQWZ0ZXI6CgpgYGB0cwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAiPj0yLjAuMCA8My4wLjAiLAogIHByZWZzOiB7CiAgICB2ZXJzaW9uOiAxLAogICAgbWlncmF0ZTogKHZhbHVlLCBmcm9tVmVyc2lvbikgPT4gKGZyb21WZXJzaW9uID09PSAwID8geyBjb2xvdXI6IHZhbHVlIH0gOiB2YWx1ZSksCiAgfSwKICBtaWdyYXRlQmFnOiAoZGF0YSwgZnJvbVNjaGVtYSkgPT4gKGZyb21TY2hlbWEgPCAyID8geyBraWxsczogZGF0YSB9IDogZGF0YSksCiAgYXN5bmMgc3RhcnQobW9kKSB7CiAgICBjb25zdCBwcmVmcyA9IGF3YWl0IG1vZC5zdG9yZS5wcmVmcy5nZXQoKTsKICAgIGlmIChwcmVmcy5vayAmJiBwcmVmcy52YWx1ZSA9PT0gbnVsbCkgYXdhaXQgbW9kLnN0b3JlLnByZWZzLnNldCh7IGNvbG91cjogInJlZCIgfSk7CiAgICBhd2FpdCBtb2Quc3RvcmUuY2hhcmFjdGVyLnNldCh7IGtpbGxzOiAzIH0pOwogIH0sCn0gc2F0aXNmaWVzIEFwaTJNb2REZWZpbml0aW9uOwpgYGAKCiMjIFN0ZXAgMTE6IG1vdmUgbmV0d29yayByZXF1ZXN0cwoKYGN0eC5uZXRgIGJlY29tZXMgYG5ldGAsIHByZXNlbnQgd2hlbiB0aGUgbWFuaWZlc3QgbmFtZXMgYXQgbGVhc3Qgb25lIGhvc3Qgd2l0aCBgbmV0d29yazo8aG9zdD5gLCBgbmV0d29yazpsb2NhbGAgb3IgYG5ldHdvcms6KmAuIGBuZXQucmVxdWVzdCh7IHVybCwgbWV0aG9kLCBoZWFkZXJzLCBib2R5LCB0aW1lb3V0TXMgfSlgIGFuc3dlcnMgd2l0aCBgeyBzdGF0dXMsIGhlYWRlcnMsIGJvZHkgfWAgZm9yIGFueSBIVFRQIHN0YXR1cy4gQSBoZWFkZXIgdGhhdCBuZWVkcyBhIHNlY3JldCB0YWtlcyBgbW9kLm5ldC5jcmVkZW50aWFsKCJuYW1lIilgIGFzIGl0cyB2YWx1ZSwgYW5kIHRoZSBob3N0IGZpbGxzIGluIHRoZSB3aG9sZSBoZWFkZXIgdmFsdWUgZnJvbSB0aGUgY3JlZGVudGlhbCBvZiB0aGF0IG5hbWUuIGBuZXQuY3JlZGVudGlhbHNgIGhhcyBgc3RhdHVzYCwgYHNldGAsIGBmcm9tRW52aXJvbm1lbnRgIGFuZCBgcmVtb3ZlYCwgdGhlIGpvYnMgb2YgYGN0eC5uZXQuc2VjcmV0c2AuIEEgcmVxdWVzdCB0byBhIGhvc3QgdGhlIG1hbmlmZXN0IGRvZXMgbm90IG5hbWUgYW5zd2VycyBgbm90LWdyYW50ZWRgIHdpdGggYG5ldHdvcms6PGhvc3Q+YCwgYW5kIGFueSBvdGhlciBmYWlsdXJlIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYSBuZXQgcHJvYmxlbSBjb2RlLgoKYGBgdHMKaWYgKCFtb2QubmV0KSByZXR1cm47CmNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbW9kLm5ldC5yZXF1ZXN0KHsKICB1cmw6ICJodHRwczovL2V4YW1wbGUuY29tL3J1bnMiLAogIG1ldGhvZDogIlBPU1QiLAogIGhlYWRlcnM6IHsgImNvbnRlbnQtdHlwZSI6ICJhcHBsaWNhdGlvbi9qc29uIiwgIngtYXBpLWtleSI6IG1vZC5uZXQuY3JlZGVudGlhbCgiYXBpLWtleSIpIH0sCiAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBkZXB0aDogNSB9KSwKfSk7CmlmICghcmVzcG9uc2Uub2spIG1vZC5tZXRhLmxvZyhyZXNwb25zZS5tZXNzYWdlKTsKYGBgCgojIyBTdGVwIDEyOiB0aGUgcmVzdCBvZiB0aGUgY29udGV4dAoKfCBBUEkgMSB8IEFQSSAyIHwKfCAtLS0gfCAtLS0gfAp8IGBjdHguaWRgLCBgY3R4LmVuZ2luZWAsIGBjdHguZmxhZ3NgLCBgY3R4Lm5ld0NoYXJhY3RlcmAsIGBjdHgubG9nYCB8IGBtZXRhLmlkYCwgYG1ldGEuZW5naW5lYCwgYG1ldGEuZmxhZ3NgLCBgbWV0YS5uZXdDaGFyYWN0ZXJgLCBgbWV0YS5sb2dgIHwKfCBgY3R4LmFwaWAgKGFuIGludGVnZXIpIHwgYG1ldGEuYXBpYCwgYSB2ZXJzaW9uIHN0cmluZyBzdWNoIGFzIGAiMi4wLjAiYCB8CnwgYGN0eC5zZXR0aW5ncy5nZXRgLCBgY3R4LnNldHRpbmdzLmFsbGAsIGBjdHguc2V0dGluZ3Muc2V0YCB8IGBtZXRhLnNldHRpbmdzKClgLCBgbWV0YS5zZXRTZXR0aW5nKGlkLCB2YWx1ZSlgLiBBbiB1bmtub3duIGlkIGFuc3dlcnMgYHJlZnVzZWRgIHdpdGggYHVua25vd24tc2V0dGluZ2AuIHwKfCBgY3R4Lm1vZHMoKWAgfCBgbWV0YS5tb2RzKClgIHwKfCBgY3R4Lm9wdGlvbnNgIHwgVGhlIGBvcHRpb25zQ2hhbmdlZGAgaG9vaywgYWZ0ZXIgdGhlIHBsYXllciBjaGFuZ2VzIGFuIG9wdGlvbiB8CnwgYGN0eC5wcm9maWxlc2AsIGBjdHguc2Vzc2lvbmAgfCBgbWFuYWdlLnByb2ZpbGVzYCwgYG1hbmFnZS5zZXNzaW9uYCwgZmlyc3QtcGFydHkgb25seSB8CgpgbWV0YS5lbmdpbmVgIGlzIGZvciBkaWFnbm9zdGljczogZGVjaWRlIG9uIGBtZXRhLmFwaWAsIG5ldmVyIG9uIHRoZSBnYW1lIHZlcnNpb24uIGBtYW5hZ2VgIGFuZCBgdHJ1dGhgIGV4aXN0IG9ubHkgZm9yIG1vZHMgdGhlIGdhbWUncyBidWlsZCBuYW1lcyBhcyBmaXJzdC1wYXJ0eSwgYW5kIG5vdGhpbmcgb24gdGhpcyBidWlsZCBuYW1lcyBvbmUgeWV0LCBzbyBib3RoIGFyZSBhYnNlbnQgZm9yIGV2ZXJ5IG1vZC4KCiMjIFJ1bnRpbWUgdGllcnMKCkFuIGluLXByb2Nlc3MgbW9kIHJ1bnMgaW4gdGhlIGdhbWUncyBvd24gcGFnZS4gQVBJIDIgYnVpbHQgdGhyb3VnaCB0aGUgaW4tcHJvY2VzcyBob3N0IGdvZXMgdGhyb3VnaCB0aGUgc2FtZSBwZXJtaXNzaW9ucyBhbmQgZmFjYWRlcyBhcyBBUEkgMSBhbmQgaGFuZHMgdGhlIG1vZCBjb3BpZXMgb2YgZGF0YSwgYnV0IGl0IGRvZXMgbm90IGlzb2xhdGUgdGhlIGNvZGU6IHRoZSBtb2R1bGUgc3RpbGwgcnVucyBpbiB0aGUgcGFnZSB3aXRoIHRoZSBwYWdlJ3Mgb3duIGFjY2VzcywgYXMgYW4gQVBJIDEgcGx1Z2luIGRvZXMgKFtQTFVHSU5TLm1kXShQTFVHSU5TLm1kKSkuCgpBIFdvcmtlciBtb2QgcnVucyBpbiBhbiBvcGFxdWUtb3JpZ2luIFdvcmtlciBpbnNpZGUgYSBzYW5kYm94ZWQgZnJhbWUsIGFuZCB0YWxrcyB0byB0aGUgZ2FtZSBvbmx5IHRocm91Z2ggYSBtZXNzYWdlIHBvcnQgKFtXT1JLRVJfSVNPTEFUSU9OLm1kXShXT1JLRVJfSVNPTEFUSU9OLm1kKSkuIE9uIHRoaXMgYnVpbGQgdGhlIFdvcmtlciBydW50aW1lIHJ1bnMgdGhlIHByZXZpZXcgV29ya2VyIGludGVyZmFjZSwgZGVjbGFyZWQgaW4gc2NoZW1hIDEgYXMgYCJtb2RBcGkiOiAyYCB3aXRoIGAicnVudGltZSI6ICJ3b3JrZXIiYCBhbmQgYSBgd29ya2VyRW50cnlgLCBhbmQgaW4gc2NoZW1hIDIgYXMgYCJhcGkiOiAiMi4wLjAtd29ya2VyImAuIFRoYXQgdmVyc2lvbiBpcyBhIHByZXJlbGVhc2Ugb2YgMi4wLjAsIHNvIGEgc3RhYmxlIEFQSSAyIHJhbmdlIGRvZXMgbm90IGluY2x1ZGUgaXQsIGFuZCBhIG1vZCB3cml0dGVuIGZvciB0aGUgcHJldmlldyBpcyBub3QgYW4gQVBJIDIgbW9kLgoKTW92aW5nIGEgbW9kIGludG8gYSBXb3JrZXIgY29zdHMgaXQgdGhlc2UgdGhpbmdzOgoKLSBUaGUgRE9NLiBBIFdvcmtlciBoYXMgbm8gZG9jdW1lbnQsIHNvIGRyYXdpbmcgZ29lcyB0aHJvdWdoIGhvc3QtZHJhd24gcGFuZWxzIGFuZCByZWdpb25zLgotIFRoZSBuZXR3b3JrLiBUaGUgcGFnZSdzIHBvbGljeSByZWZ1c2VzIGV2ZXJ5IGNvbm5lY3Rpb24gYW5kIHRoZSBXb3JrZXIncyBuZXR3b3JrIGdsb2JhbHMgYXJlIGRlbGV0ZWQgYmVmb3JlIHRoZSBtb2QgbG9hZHMsIGFuZCB0aGUgcHJldmlldyBpbnRlcmZhY2UgaGFzIG5vIG5ldHdvcmsgcmVxdWVzdC4KLSBUaGUgZ2FtZSdzIHN0b3JhZ2UuIFRoZSBvcGFxdWUgb3JpZ2luIGdpdmVzIHRoZSBXb3JrZXIgbm9uZSBvZiB0aGUgZ2FtZSdzIEluZGV4ZWREQiwgQ2FjaGUgU3RvcmFnZSBvciBmaWxlcy4gUHJlZmVyZW5jZXMgZ28gdGhyb3VnaCB0aGUgaG9zdC4KLSBJbXBvcnRzIGJ5IHBhY2thZ2UgbmFtZS4gQSBXb3JrZXIgbW9kIGltcG9ydHMgb25seSBpdHMgb3duIGZpbGVzIGJ5IHJlbGF0aXZlIHBhdGgsIHdpdGggbm8gaW1wb3J0IGN5Y2xlcywgYXQgbW9zdCAyNTYgc2NyaXB0IGZpbGVzIGFuZCAxNiw3NzcsMjE2IGNoYXJhY3RlcnMgb2Ygc291cmNlLiBCdW5kbGUgYSBwYWNrYWdlIGluLgotIGBpbXBvcnQubWV0YS51cmxgIGFuZCBjb21wdXRlZCBkeW5hbWljIGltcG9ydHMgb2YgdGhlIG1vZCdzIG93biBmaWxlcywgYmVjYXVzZSBlYWNoIG1vZHVsZSBpcyBhIGBkYXRhOmAgVVJMLiBSZWFkIGZpbGVzIHRocm91Z2ggdGhlIGhvc3QncyBhc3NldCByZXF1ZXN0LgotIGBldmFsYCwgbmVzdGVkIFdvcmtlcnMgYW5kIGBCcm9hZGNhc3RDaGFubmVsYC4KLSBMaXZlIG9iamVjdHMgb2YgYW55IGtpbmQuIEV2ZXJ5dGhpbmcgY3Jvc3NlcyB0aGUgcG9ydCBhcyBzdHJ1Y3R1cmVkLWNsb25lIGRhdGEuCgpUaGUgV29ya2VyIHRpZXIncyBBUEkgMiBkZXRhaWxzIGFyZSBhZGRlZCBoZXJlIHdoZW4gdGhhdCBydW50aW1lIGxhbmRzLgoKIyMgQ2hlY2tsaXN0CgoxLiBDaGVjayBTdGVwIDEncyB0YWJsZS4gSWYgdGhlIG1vZCBuZWVkcyBhbnl0aGluZyB0aGVyZSwga2VlcCBpdCBvbiBBUEkgMS4KMi4gQ29udmVydCB0aGUgbWFuaWZlc3Qgd2l0aCBgY29udmVydE1hbmlmZXN0VjFgIGFuZCBmaXggdGhlIGBlbmdpbmVgIHJlYXNvbiBpdCB3cml0ZXMuCjMuIFNldCBgYXBpYCB0byBgPj0yLjAuMCA8My4wLjBgIGluIHRoZSBtYW5pZmVzdCBhbmQgaW4gdGhlIGRlZmluaXRpb24sIGFuZCBkZWZhdWx0LWV4cG9ydCB0aGUgZGVmaW5pdGlvbiB3aXRoIGBzYXRpc2ZpZXMgQXBpMk1vZERlZmluaXRpb25gLgo0LiBSZW5hbWUgYHJlZ2lzdGVyYCB0byBgc3RhcnRgIGFuZCBgdW5pbnN0YWxsYCB0byBgc3RvcGAsIGRyb3AgYGN0eGAgZnJvbSBgbWlncmF0ZUJhZ2AsIGFuZCBnaXZlIGBob29rc2Agb25seSBgeyBpZCwgZmxhZ3MgfWAuCjUuIENoZWNrIGBva2Agb24gZXZlcnkgY2FsbCByZXN1bHQsIGFuZCBoYW5kbGUgYG5vdC1ncmFudGVkYCBieSBzd2l0Y2hpbmcgb2ZmIHRoZSBmZWF0dXJlIHRoYXQgbmVlZHMgaXQuCjYuIFJlcGxhY2UgYGN0eC5zdGF0ZWAsIGBjdHguY29yZWAgYW5kIGBjdHgucmVnaXN0cmllc2AgcmVhZHMgd2l0aCBgdmlld2AgYW5kIGBjb250ZW50YCwgYW5kIGV4cGVjdCBvbmx5IHdoYXQgdGhlIHBsYXllciBrbm93cy4KNy4gTW92ZSBsaXN0ZW5lcnMgdG8gYGV2ZW50cy5vbmAsIHJlYWQgdGhlIHBheWxvYWQgYWxvbmUsIGFuZCBkcm9wIGV2ZW50cyBBUEkgMiBkb2VzIG5vdCBkZWxpdmVyLgo4LiBVcGRhdGUgYG1vbnN0ZXJCZWNhbWVWaXNpYmxlYCwgYGFydGlmYWN0SWRlbnRpZmllZGAgYW5kIGBoaXN0b3J5QWRkYCB0byB0aGVpciBuZXcgYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzLgo5LiBSZWJ1aWxkIHBhbmVscyBhcyBgdWkubW91bnRgIHRyZWVzIGFuZCBrZXltYXBzIGFzIGB1aS5rZXlzYC4KMTAuIERlY2xhcmUgYHByZWZzYCB3aXRoIGEgbWlncmF0aW9uIHRoYXQgcmVhZHMgdmVyc2lvbiAwLCBzbyBleGlzdGluZyBwcmVmZXJlbmNlcyBjYXJyeSBvdmVyLgo="
  },
  {
    "id": "compatibility",
    "path": "MOD_COMPATIBILITY.md",
    "audience": "advanced",
    "title": "Compatibility",
    "note": "What an engine release can change and how a mod stays loadable.",
    "encoded": "IyBXaGF0IGFuIGVuZ2luZSByZWxlYXNlIG1heSBicmVhaywgYW5kIHdoYXQgaXQgbWF5IG5vdAoKSWYgeW91IHB1Ymxpc2ggbW9kcywgeW91IHdhbnQgdG8ga25vdyB3aGljaCBvZiB0aGVtIHN0b3Agd29ya2luZyB3aGVuIHRoZSBnYW1lIHVwZGF0ZXMsIGFuZCB3aGF0IHlvdSBoYXZlIHRvIGRvIGFib3V0IGl0LgoKPiBBIG1vZCB0aGF0IGlzIHB1cmUgZGF0YSBzaG91bGQgc3Vydml2ZSBlbmdpbmUgcmVsZWFzZXMgd2l0aG91dCBiZWluZyByZXB1Ymxpc2hlZC4gQSBtb2QgdGhhdCBzaGlwcyBjb2RlIHNob3VsZCBzdXJ2aXZlIHBhdGNoIGFuZCBtaW5vciByZWxlYXNlcywgYW5kIGdldCBhIHJlbGVhc2UncyB3YXJuaW5nIGJlZm9yZSBhbiBBQkkgY2hhbmdlIHN0cmFuZHMgaXQuIFRoYXQgQUJJIGluY2x1ZGVzIGEgbmFtZWQgc3Vic2V0IG9mIGBjdHguY29yZWA7IHRoZSByZXN0IG9mIHRoYXQgbmFtZXNwYWNlIGlzIGFuIGVzY2FwZSBoYXRjaC4KClRoZXNlIHJ1bGVzIGRhdGUgZnJvbSAyMDI2LTA4LTAyLiBCZWZvcmUgdGhlbiwgdGhyZWUgb2YgdGhlIGZvdXIgZ2F0ZXMgYmVsb3cgd2VyZSBzdHJpY3RlciB0aGFuIHRoZXkgbmVlZGVkIHRvIGJlLCBhbmQgdGhlIGZvdXJ0aCwgYGN0eC5jb3JlYCwgaGFkIG5vIGdhdGUgYXQgYWxsLgojIyBUaGUgZm91ciB0aGluZ3MgdGhhdCBjYW4gc3RyYW5kIGEgbW9kCgp8ICMgfCBHYXRlIHwgV2hhdCBpdCBqdWRnZXMgfCBPbiBmYWlsdXJlIHwKfC0tLXwtLS18LS0tfC0tLXwKfCAxIHwgYGVuZ2luZWAgfCBhIHNlbXZlciByYW5nZSBvdmVyIGBFTkdJTkVfVkVSU0lPTmAgfCAqKndhcm5zKiogZm9yIGRhdGEsICoqcmVmdXNlcyoqIGNvZGUgfAp8IDIgfCBgbW9kQXBpYCB8IHRoZSBwbHVnaW4gQUJJLCBhbiBpbnRlZ2VyIHwgcmVmdXNlcyBvdXRzaWRlIHRoZSBhY2NlcHRlZCB3aW5kb3cgfAp8IDMgfCBhIHBhdGNoIHRhcmdldCB8IG9uZSBgcGF0Y2hlc2AgLyBgZmllbGRQYXRjaGVzYCAvIGByZW1vdmVzYCByZWYgfCAqKnNraXBzIHRoYXQgb3AqKiwga2VlcHMgdGhlIG1vZCB8CnwgNCB8IGBjdHguY29yZWAgfCBhIGd1YXJhbnRlZWQgbmFtZSBkaXNhcHBlYXJpbmc7IGFueSBvdGhlciBleHBvcnQgYSBwbHVnaW4gYWN0dWFsbHkgY2FsbHMgfCBub3RoaW5nIGhhcHBlbnMgYXQgbG9hZCB0aW1lLiBBIGd1YXJhbnRlZWQgbmFtZSBjYW4gb25seSBiZSByZW1vdmVkIGZyb20gdGhlIGVuZ2luZSB3aXRoIGFuIGFsaWFzIG9yIGEgdHdvLXJlbGVhc2UgQUJJIGJ1bXA7IHNlZSBiZWxvdy4gfAoKIyMjIDEuIGBlbmdpbmVgIGlzIGEgbGFiZWwgb24gZGF0YSBhbmQgYSBnYXRlIG9uIGNvZGUKCmBlbmdpbmVgIHJlY29yZHMgd2hpY2ggYnVpbGRzIHRoZSBhdXRob3IgdGVzdGVkLCBhbmQgZm9yIGEgZGF0YSBwYWNrIHRoZSBnYW1lIHRyZWF0cyBpdCBhcyBpbmZvcm1hdGlvbiBvbmx5LiBVbnRpbCAyMDI2LTA4LTAyIHRoZSBob3N0IHJlZnVzZWQgYW55IHBhY2sgb3V0c2lkZSBpdHMgcmFuZ2UsIHNvIGEgcGFjayBvZiBwdXJlIEpTT04gc3RvcHBlZCBsb2FkaW5nIG92ZXIgb25lIHN0cmluZyBpbiBpdHMgbWFuaWZlc3QuCgpUaGUgcmFuZ2Ugb25seSBibG9ja3MgYSBwYWNrIHRoYXQgc2hpcHMgY29kZS4gVGhlIGdhbWUgdGVsbHMgdGhlIHR3byBhcGFydCBieSBgbW9kQXBpYCwgd2hpY2ggdGhlIG1hbmlmZXN0IHJlcXVpcmVzIG9mIGV2ZXJ5IHBhY2sgd2l0aCBhIGBwbHVnaW4uanNgIGFuZCBvZiBubyBvdGhlci4gQ29kZSBpcyB3aGF0IGJyZWFrcyBhY3Jvc3MgYSByZWxlYXNlLCBiZWNhdXNlIGl0IGNhbGxzIGZ1bmN0aW9ucyBhbmQgYSByZW5hbWVkIGZ1bmN0aW9uIGlzIGEgY3Jhc2guIFRpbGUgcGFja3MgY291bnQgYXMgZGF0YTogYSBzdGFsZSBtYXBwaW5nIGxvc2VzIGluZGl2aWR1YWwgdGlsZXMgdG8gdGhlIEFTQ0lJIGZhbGxiYWNrLCB3aGljaCB0aGUgcGxheWVyIGNhbiBzZWUsIGFuZCB0aGF0IGlzIGJldHRlciB0aGFuIGEgd2hvbGUgdGlsZXNldCBmYWlsaW5nIHRvIGxvYWQuCgoqKldoYXQgdG8gd3JpdGUuKiogQSBtaW5pbXVtLCBub3QgYSBjYXJldDoKCmBgYGpzb24KImVuZ2luZSI6ICI+PTAuMTMuMCIKYGBgCgpPbiBhIGAwLnhgIHZlcnNpb24sIGBeMC4xMy4wYCBtZWFucyAwLjEzLnggb25seSwgc28gaXQgZXhjbHVkZXMgMC4xNC4wIGFuZCBlYXJucyB0aGUgbW9kIGEgd2FybmluZyBvbiBldmVyeSBtaW5vciByZWxlYXNlLiBVc2UgYSB0d28tc2lkZWQgcmFuZ2Ugb25seSB3aGVuIHRoZSBtb2QgaXMga25vd24gdG8gYnJlYWsgYWJvdmUgc29tZSB2ZXJzaW9uLiBBIGRhdGEgcGFjayBjYW4gbGVhdmUgdGhlIGZpZWxkIG91dCBlbnRpcmVseTsgdGhlIGNvcmUgY29udGVudCBwYWNrIGNvbWVzIGNsb3NlIHRvIHRoYXQgd2l0aCBgIj49MC4xLjAiYC4KCiMjIyMgQSByYW5nZSB0aGlzIGJ1aWxkIGZhaWxzIGlzIG5vIGxvbmdlciB0aGUgZW5kIG9mIHRoZSByb2FkCgpVbnRpbCAyMDI2LTA4LTIxLCBhIGNvZGUgcGFjayB3aG9zZSBuZXdlc3QgcmVsZWFzZSBkZWNsYXJlZCBhIHJhbmdlIG91dHNpZGUgdGhpcyBidWlsZCB3YXMgcmVmdXNlZCBvdXRyaWdodC4gVGhlIHJvdyByZWFkIGB3aWxsIG5vdCBydW4gb24gdGhpcyB2ZXJzaW9uYCwgZXZlbiB3aGVuIHRoZSBzYW1lIHJlcG9zaXRvcnkgaGVsZCBhbiBvbGRlciByZWxlYXNlIHRoYXQgd291bGQgcnVuLiBZb3UgY291bGQgaW5zdGFsbCB0aGF0IHJlbGVhc2UgYnkgcGFzdGluZyBhIGBnaXRodWIuY29tL293bmVyL3JlcG8vdHJlZS88dGFnPmAgVVJMIGludG8gKipBZGQgZnJvbSBhIHJlcG9zaXRvcnkgYWRkcmVzcyoqLCBidXQgdGhlIGdhbWUgbmV2ZXIgbG9va2VkIGZvciBpdCBvciBtZW50aW9uZWQgaXQuCgpEaXNjb3Zlcnkgbm93IHdhbGtzIGEgcmVwb3NpdG9yeSdzIHRhZ3MgbmV3ZXN0IGZpcnN0IGFuZCBvZmZlcnMgdGhlIG5ld2VzdCByZWxlYXNlIHRoaXMgYnVpbGQgd2lsbCBydW4uIFRoZSB3YWxrIGZvbGxvd3MgdGhlc2UgcnVsZXM6CgotICoqVGhlIGxvYWRlcidzIG93biBydWxlIGp1ZGdlcyBlYWNoIGNhbmRpZGF0ZSoqLCBzbyBhbnkgdmVyc2lvbiBhIHNjcmVlbiBvZmZlcnMgaXMgb25lIHRoZSBsb2FkZXIgYWNjZXB0cy4gVGhlIGluc3RhbGwgc2NyZWVuIGFuZCAqVXBkYXRlIGluc3RhbGxlZCBtb2RzKiBzaGFyZSB0aGUgc2FtZSB3YWxrLCBzbyB0aGV5IGNhbm5vdCBkaXNhZ3JlZSBhYm91dCB3aGF0IHJ1bnMuCi0gKipVc3VhbGx5IG9ubHkgb25lIG1hbmlmZXN0IGlzIHJlYWQuKiogVGhlIHdhbGsgc3RvcHMgYXQgdGhlIGZpcnN0IGNhbmRpZGF0ZSBpdCBhY2NlcHRzLCB3aGljaCBpcyBuZWFybHkgYWx3YXlzIHRoZSBuZXdlc3QgcmVsZWFzZSwgc28gYSBtb2QgdGhhdCBrZWVwcyB1cCBjb3N0cyBubyBtb3JlIHRoYW4gYmVmb3JlLiBNYW5pZmVzdHMgY29tZSBmcm9tIGByYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tYCwgd2hpY2ggaXMgdW5tZXRlcmVkLCByYXRoZXIgdGhhbiBmcm9tIHRoZSBHaXRIdWIgQVBJLCB3aG9zZSBsaW1pdCBvZiBzaXh0eSByZXF1ZXN0cyBhbiBob3VyIGEgc2luZ2xlIHNjcmVlbiBvZiBtb2Qgcm93cyBjb3VsZCB1c2UgdXAuCi0gKipUaGUgd2FsayBzdG9wcyBhZnRlciBlaWdodCB2ZXJzaW9ucyoqIChgTUFYX1ZFUlNJT05TX1RSSUVEYCkuIElmIGEgbW9kJ3MgbGFzdCBlaWdodCByZWxlYXNlcyBhbGwgd2FudCBhIG5ld2VyIGdhbWUsIHRoZSByZWZ1c2FsIHRlbGxzIHRoZSBwbGF5ZXIgdG8gdXBkYXRlIHRoZSBnYW1lIGFuZCBzYXlzIGhvdyBtYW55IHJlbGVhc2VzIHdlcmUgdHJpZWQuCi0gKipBIHBpbm5lZCB0YWcgaXMgbmV2ZXIgd2Fsa2VkIHBhc3QuKiogSWYgdGhlIHBsYXllciBuYW1lZCBhIHZlcnNpb24gYW5kIGl0IHdpbGwgbm90IHJ1biwgdGhlIHBpbiBpcyByZWZ1c2VkIHJhdGhlciB0aGFuIHN3YXBwZWQgZm9yIGEgZGlmZmVyZW50IHJlbGVhc2UuCi0gKipBIGRhdGEgcGFjayBvdXQgb2YgcmFuZ2UgaXMgbm90IHdhbGtlZCBwYXN0IGVpdGhlciwqKiBiZWNhdXNlIGdhdGUgMSBsZXRzIGl0IGxvYWQuIEl0cyBuZXdlc3QgcmVsZWFzZSBpcyBvZmZlcmVkLCB3aXRoIHRoZSB3YXJuaW5nIGFib3V0IHRoZSByYW5nZS4KLSAqKlRoZSBza2lwcGVkIHJlbGVhc2UgaXMgbmFtZWQuKiogVGhlIHJvdywgdGhlIGRldGFpbCBwYW5lIGFuZCB0aGUgcmVmdXNhbCBzY3JlZW4gYWxsIHNheSB3aGljaCBuZXdlciByZWxlYXNlIHdhcyBwYXNzZWQgb3ZlciBhbmQgd2h5LiBXaXRob3V0IHRoYXQsIGEgcGxheWVyIG9mZmVyZWQgMC4xNC40IHdoaWxlIHRoZSBtb2QncyBmcm9udCBwYWdlIHNob3dzIDAuMTUuMCB3b3VsZCBhc3N1bWUgdGhlIGdhbWUgb3IgdGhlIGxpc3RpbmcgaXMgYnJva2VuLCB3aGVuIDAuMTUuMCBzaW1wbHkgd2FudHMgYSBuZXdlciBnYW1lLgotICoqIlVwZGF0ZSB0aGUgZ2FtZSIgYXBwZWFycyBvbmx5IHdoZW4gYSBuZXdlciBnYW1lIHdvdWxkIGhlbHAuKiogR2F0ZSAxIGRvZXMgbm90IHNheSB3aGljaCBzaWRlIGlzIGJlaGluZCwgc2luY2UgYD49MC4yNC4wYCB3YW50cyBhIG5ld2VyIGdhbWUgYW5kIGA8MC41LjBgIHdhbnRzIGFuIG9sZGVyIG9uZS4gQSBzY3JlZW4gb2ZmZXJpbmcgYW4gb2xkZXIgcmVsZWFzZSBhbnN3ZXJzIHRoYXQgcXVlc3Rpb24gc2VwYXJhdGVseSBieSBwcm9iaW5nOiBgbmV3ZXJHYW1lQ291bGRSdW5gIHRyaWVzIHRoZSBuZXh0IG5pbmUgcGF0Y2hlcywgdGhlIG5leHQgbmluZSBtaW5vcnMgYW5kIHRoZSBuZXh0IG5pbmUgbWFqb3JzIGFib3ZlIHRoZSBydW5uaW5nIHZlcnNpb24sIHBsdXMgb25lIGZhci1mdXR1cmUgdmVyc2lvbiBmb3IgYW4gb3BlbiB1cHBlciBib3VuZC4gSWYgbm9uZSBvZiB0aG9zZSBzYXRpc2ZpZXMgdGhlIHJhbmdlLCB0aGUgc2NyZWVuIG5hbWVzIGJvdGggdmVyc2lvbnMgYW5kIGdpdmVzIG5vIGFkdmljZS4KLSAqKk5vIHVwZGF0ZSBpcyBvZmZlcmVkIHRoYXQgdGhlIGxvYWRlciB3b3VsZCByZWZ1c2UuKiogKlVwZGF0ZSBpbnN0YWxsZWQgbW9kcyogY291bnRzIG9ubHkgcmVsZWFzZXMgdGhhdCBydW4gb24gdGhpcyBidWlsZCwgc28gYSBtb2QgYWxyZWFkeSBvbiB0aGUgbmV3ZXN0IHJ1bm5hYmxlIHJlbGVhc2Ugc2hvd3MgYXMgY3VycmVudCByYXRoZXIgdGhhbiBvdXQgb2YgZGF0ZS4gQmVzaWRlIHRoYXQsIHRoZSBzY3JlZW4gc2hvd3MgaG93IG1hbnkgbW9kcyBoYXZlIGEgbmV3ZXIgcmVsZWFzZSB3YWl0aW5nIG9uIGEgbmV3ZXIgZ2FtZS4KLSAqKklmIGEgbWFuaWZlc3QgY2Fubm90IGJlIHJlYWQsIHRoZSB1cGRhdGUgaXMgc3RpbGwgb2ZmZXJlZC4qKiBPbmUgZmFpbGVkIHJlcXVlc3QgaXMgbm8gZXZpZGVuY2UgdGhhdCB0aGUgcmVsZWFzZSB3aWxsIG5vdCBydW4uIFRoZSBpbnN0YWxsIHBhdGggcmVwZWF0cyB0aGUgd2FsayBvdmVyIGEgbGl2ZSBjb25uZWN0aW9uIGFuZCBzdGVwcyBiYWNrIHRvIGFuIG9sZGVyIHJlbGVhc2UgdGhlcmUgaWYgaXQgbmVlZHMgdG8uCgoqKldoYXQgdGhpcyBtZWFucyBmb3IgYXV0aG9ycy4qKiBBIHJhbmdlIHN0cmljdGVyIHRoYW4gdGhlIG1vZCBuZWVkcyBub3cgY29zdHMgcGxheWVycyB5b3VyIG5ld2VzdCByZWxlYXNlIGluc3RlYWQgb2YgdGhlIHdob2xlIG1vZC4gVGhhdCBzdGlsbCBodXJ0cywgc28gb25seSB3cml0ZSBhIHR3by1zaWRlZCByYW5nZSB5b3UgbWVhbi4gSXQgYWxzbyBtZWFucyBhIGNvcnJlY3RlZCByYW5nZSBpbiBhIG5ldyByZWxlYXNlIHJlYWNoZXMgcGxheWVycyBzdHJhaWdodCBhd2F5LCBiZWNhdXNlIHRoZSB3YWxrIGZpbmRzIGl0IHdpdGhvdXQgdGhlIGdhbWUgaGF2aW5nIHRvIHVwZGF0ZSBmaXJzdC4KIyMjIDIuIGBtb2RBcGlgIGFjY2VwdHMgYSB3aW5kb3cKCmBNT0RfQVBJX1ZFUlNJT05gIGlzIHdoYXQgdGhpcyBob3N0IGltcGxlbWVudHM7IGBNT0RfQVBJX01JTmAgaXMgdGhlIG9sZGVzdCBpdApzdGlsbCBhY2NlcHRzLiBFdmVyeXRoaW5nIGluIGJldHdlZW4gbG9hZHMsIGFuZCBhbnl0aGluZyBiZWxvdyB0aGUgY3VycmVudAp2ZXJzaW9uIGlzIHJlcG9ydGVkIHRvIGl0cyBhdXRob3IgYXMgcnVubmluZyBvbiBhIGNvbXBhdGliaWxpdHkgcGF0aC4KClVudGlsIDIwMjYtMDgtMDIgdGhlIGNoZWNrIHdhcyBgZGVjbGFyZWQgIT09IE1PRF9BUElfVkVSU0lPTmAsIHNvIHRoZSBkYXkgdGhlIG51bWJlciBtb3ZlZCwgZXZlcnkgbW9kIHN0b3BwZWQgbG9hZGluZyBhdCBvbmNlLCBiZWZvcmUgYW55IGF1dGhvciBjb3VsZCByZWFjdCBhbmQgd2hldGhlciBvciBub3QgdGhlIGNoYW5nZSBhZmZlY3RlZCB0aGVtLgoKKipBIGJ1bXAgbm93IHRha2VzIHR3byByZWxlYXNlczoqKgoKMS4gU2hpcCB0aGUgbmV3IGJlaGF2aW91ci4gTGVhdmUgYE1PRF9BUElfTUlOYCB3aGVyZSBpdCBpcy4gS2VlcCBob25vdXJpbmcgdGhlIG9sZCBjb250cmFjdCBmb3IgcGx1Z2lucyB0aGF0IGRlY2xhcmVkIHRoZSBvbGQgbnVtYmVyOyBgTG9hZGVkTW9kUGx1Z2luLmFwaWAgY2FycmllcyB3aGF0IGVhY2ggb25lIGRlY2xhcmVkLCB3aGljaCBpcyB3aGF0IG1ha2VzIHRoYXQgcG9zc2libGUuIEF1dGhvcnMgc3RhcnQgc2VlaW5nIHRoZSBkZXByZWNhdGlvbiBsaW5lLgoyLiBSYWlzZSBgTU9EX0FQSV9NSU5gLiBEZWxldGUgdGhlIG9sZCBwYXRoLgoKSWYgYSBjaGFuZ2UgY2Fubm90IGJlIGNvbmRpdGlvbmVkIG9uIHRoZSBkZWNsYXJlZCB2ZXJzaW9uLCBib3RoIGNvbnN0YW50cyBtb3ZlIGluIG9uZSBzdGVwLiBBIHRlc3QgZmFpbHMgd2hlbiB0aGUgdHdvIGNvbnN0YW50cyBzdG9wIG1ha2luZyBzZW5zZSB0b2dldGhlci4KCiMjIyAzLiBBIG1pc3NpbmcgcGF0Y2ggdGFyZ2V0IGNvc3RzIHRoZSBwYXRjaCwgbm90IHRoZSBtb2QKCkEgYGZpZWxkUGF0Y2hgIGFpbWVkIGF0IGEgcmVjb3JkIHRoYXQgbm8gbG9uZ2VyIGV4aXN0cyB1c2VkIHRvIHRocm93LCBhbmQgdGhlIGhvc3QgYW5zd2VycyBhIHRocm93IGJ5IGRyb3BwaW5nIHRoZSB3aG9sZSBwYWNrLiBBIG1vZCBwYXRjaGluZyBmb3J0eSBtb25zdGVycyBsb3N0IGFsbCBmb3J0eSwgYWxvbmcgd2l0aCBpdHMgY29kZSwgaXRzIHJ1bGVzIGFuZCBpdHMgdGlsZXMsIGJlY2F1c2Ugb25lIG9mIHRoZSBmb3J0eSBoYWQgYmVlbiByZW5hbWVkLgoKTm93IGl0IGlzIG9uZSByZXBvcnRlZCBsaW5lIG9uIHRoYXQgbW9kJ3Mgcm93LCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHBhY2sgc3RpbGwgYXBwbGllcy4gVGhlIGxpbmUgc3VnZ2VzdHMgdGhlIHRhcmdldCBtYXkgaGF2ZSBiZWVuIHJlbmFtZWQsIHNpbmNlIHRoYXQgaXMgdGhlIGxpa2VsaWVzdCBjYXVzZS4KClRoZSBjb21wb3NlcidzIG90aGVyIG1lcmdlIHBhdGggYWx3YXlzIGJlaGF2ZWQgdGhpcyB3YXkuIE9mIGNvcmUncyA0NCByZWNvcmQgZmlsZXMsIDIwIHRha2UgYSAicGFzc3Rocm91Z2giIHBhdGggdGhhdCByZXBvcnRlZCBhbmQgY2FycmllZCBvbiwgYW5kIDI0IHRha2UgYSAiY29tcG9zYWJsZSIgcGF0aCB0aGF0IHRocmV3LiBUaGUgc3BsaXQgd2FzIG5ldmVyIGNob3NlbjsgaXQgZm9sbG93cyBmcm9tIHRoZSBzaGFwZSBvZiBjb3JlJ3Mgb3duIHJlY29yZHMuCgpBIHBhdGNoIGNhbiBhcHBseSBjbGVhbmx5IGFuZCBzdGlsbCBuYW1lIHNvbWV0aGluZyB0aGF0IGRvZXMgbm90IGV4aXN0LiBVbnRpbCAyMDI2LTA4LTIwIHRoYXQgd2FzIHdvcnNlIHRoYW4gYSBtaXNzaW5nIHRhcmdldCwgYmVjYXVzZSB0aGUgY29tcG9zZXIgYWNjZXB0ZWQgaXQgYW5kIHRoZSBiaW5kZXIgdGhyZXcuIFN0b3JlIHN0b2NrIHRhYmxlcyBtYWRlIHRoaXMgY29tbW9uOiBgYXBwZW5kYCBleGlzdHMgc28gbW9kIEEgY2FuIHN0b2NrIGFuIGl0ZW0gdGhhdCBtb2QgQiBkZWZpbmVzLCB0dXRvcmlhbCAyIHRlYWNoZXMgZXhhY3RseSB0aGF0IHBhdGNoLCBhbmQgZGlzYWJsaW5nIG1vZCBCIGxlZnQgYW4gYXBwZW5kZWQgbGluZSBpbiB0aGUgYG5vcm1hbGAgdGFibGUgbmFtaW5nIG5vdGhpbmcuIGBiaW5kU3RvcmVgIHRocmV3IGBzdG9yZTogdW5rbm93biBzdmFsYCBmcm9tIGluc2lkZSBgYmluZENvcmVgLCB3aGljaCB0aGUgaG9zdCBydW5zIGF0IG1vZHVsZSB0b3AgbGV2ZWwsIHNvIG9uZSBsaW5lIGluIG9uZSBzaG9wJ3Mgc3RvY2sgdGFibGUgYnJvdWdodCB1cCB0aGUgY3Jhc2ggc2NyZWVuIGluc3RlYWQgb2YgdGhlIGdhbWUuCgpCaW5kZXJzIG5vdyBhcHBseSBnYXRlIDMncyBydWxlOiB0aGUgbGluZSBpcyBkcm9wcGVkLCB0aGUgbW9kIGlzIHRvbGQgb24gaXRzIG93biByb3csIGFuZCB0aGUgcmVzdCBvZiB0aGF0IHN0b3JlIGFuZCBldmVyeSBvdGhlciBzdG9yZSBhcmUgdW50b3VjaGVkLiBDb3JlJ3Mgb3duIGRhdGEgc3RpbGwgdGhyb3dzLiBSZWNvcmQgcHJvdmVuYW5jZSB0ZWxscyB0aGUgdHdvIGFwYXJ0OiBhbiB1bnJlc29sdmFibGUgZW50cnkgaW4gYSBzdG9yZSBubyBwYWNrIGhhcyB0b3VjaGVkIGlzIGNvcmUncyBtaXN0YWtlIGFuZCBmYWlscyBsb3VkbHksIGFuZCBpbiBhIGdhbWUgd2l0aCBubyBtb2RzIHRoYXQgY292ZXJzIGV2ZXJ5IHN0b3JlLgoKVGhpcyBjb3ZlcnMgZXZlcnkgZmllbGQgb2YgYSBzdG9yZSByZWNvcmQgdGhhdCBhIHBhdGNoIGNhbiByZWFjaC4gYG5vcm1hbGAsIGBhbHdheXNgIGFuZCBgYnV5YCBlYWNoIGxvc2Ugb25seSB0aGUgZW50cnkgdGhhdCByZXNvbHZlZCB0byBub3RoaW5nLiBUaGUgYHN0b3JlOmAgZW50cmFuY2UgZmVhdHVyZSBpcyBhIHNjYWxhciwgc28gdGhlcmUgaXMgbm8gc2luZ2xlIGVudHJ5IHRvIGRyb3A6IHRoZSByZWNvcmQgc3RheXMgd2l0aCBhbiBlbnRyYW5jZSB0aGF0IG1hdGNoZXMgbm90aGluZywgdGhlIHNob3AgY2Fubm90IGJlIGVudGVyZWQsIGFuZCB0aGUgbW9kIGlzIHRvbGQuIFRoZSByZWNvcmQgc3RheXMgaW4gdGhlIHN0b3JlIGxpc3QgYmVjYXVzZSB0aGF0IGxpc3QgaXMgcmVhZCBieSBwb3NpdGlvbiwgYW5kIHJlbW92aW5nIG9uZSB3b3VsZCByZW51bWJlciBldmVyeSBsYXRlciBzdG9yZSBhbmQgbW92ZSBhIHNhdmVkIGdhbWUncyBzdG9jayBiZXR3ZWVuIHNob3BzLgpUaGUgb3duZXIgbGlzdCByZXNvbHZlcyBubyBuYW1lcywgc28gaXQgaGFzIG5vIHBlci1lbnRyeSBtaXNzIHRvIGRyb3AsIGJ1dCB0aGUgZmllbGQgY2FuIGdvIG1pc3NpbmcgZW50aXJlbHkuIFRoYXQgaXMgYSBkaWZmZXJlbnQgZmFpbHVyZSBmcm9tIHRoZSB3cm9uZy1zaGFwZSBjYXNlIHRoZSBjb21wb3NlciBoYW5kbGVzIChzZWUgIkEgcGF0Y2ggY2Fubm90IG1ha2UgYSBmaWVsZCB1bnJlYWRhYmxlIiBiZWxvdykuIEEgYHJlcGxhY2VzYCBib2R5IG9uIGEgcmVjb3JkIGEgbW9kIG93bnMgbWF5IGRyb3AgYG93bmVyOmAgYXMgcGFydCBvZiBhIHRvdGFsIGNvbnZlcnNpb24sIGFuZCB0aGUgY29tcG9zZXIncyBzaGFwZSBndWFyZCBkb2VzIG5vdCByZXN0b3JlIGFuIGFic2VudCBmaWVsZCwgc28gYG93bmVyOiB1bmRlZmluZWRgIHVzZWQgdG8gcmVhY2ggYHJlYy5vd25lci5tYXBgIGFzIGEgYmFyZSBgVHlwZUVycm9yYCBuYW1pbmcgbm8gcGFjay4gVGhlIHN0b3JlIGJpbmRlciBub3cgZ3VhcmRzIHRoZSBmaWVsZCBpdHNlbGY6IGEgbWlzc2luZyBvciBtYWxmb3JtZWQgb3duZXIgbGlzdCBiZWNvbWVzIGFuIGVtcHR5IGxpc3QgYW5kIGlzIHJlcG9ydGVkIGFnYWluc3Qgd2hpY2hldmVyIHBhY2sgaXMgcmVzcG9uc2libGUsIGxpa2UgZXZlcnkgb3RoZXIgZmllbGQgb24gdGhlIHJlY29yZCAoIzgpLgoKKipBIHBhdGNoIGNhbm5vdCBtYWtlIGEgZmllbGQgdW5yZWFkYWJsZS4qKiBUaGUgcmVjb3JkIGNoZWNrIGFscmVhZHkgdGVzdGVkIHNoYXBlIG9uIHRoZSBsb2FkIHBhdGggd2l0aCBgZmllbGQvdHlwZWAsIGJ1dCB0aGF0IGNoZWNrIG9ubHkgcmVwb3J0cywgYmVjYXVzZSB0aGUgYmx1ZXByaW50IGl0IHJlYWRzIGlzIGEgbWVhc3VyZW1lbnQgb2YgY29yZSdzIHJlY29yZHMgYW5kIGEgdmFsdWUgb3V0c2lkZSBpdCBjYW4gYmUgbGVnYWwgKGEgbW9kIGludmVudGluZyBhIG5ldyB0dmFsIGlzIHVzaW5nIHRoZSBtb2Qgc3lzdGVtIGFzIGludGVuZGVkKS4gVGhhdCB3b3JrcyBmb3Igc2NhbGFyIHZhbHVlcyBhbmQgZmFpbHMgZm9yIGxpc3RzOiBldmVyeSBiaW5kZXIgcmVhZHMgYSBsaXN0IGZpZWxkIGJ5IGl0ZXJhdGluZyBpdCwgc28gYSBsaXN0IGZpZWxkIGhvbGRpbmcgYSBzdHJpbmcsIGEgbnVtYmVyIG9yIGBudWxsYCBiZWNvbWVzIGEgYFR5cGVFcnJvcmAgaW5zaWRlIGBiaW5kQ29yZWAgaW5zaWRlIGBzdGFydEdhbWVgLCBhbmQgb25lIGZpZWxkIGJyaW5ncyB1cCB0aGUgY3Jhc2ggc2NyZWVuLiBUaGUgY29tcG9zZXIgbm93IHJlZnVzZXMgdGhhdCBvbmUgY2FzZTogdGhlIGZpZWxkIGdvZXMgYmFjayB0byB3aGF0IHRoZSByZWNvcmQgaGFkIGJlZm9yZSwgdGhlIHBhY2sgaXMgdG9sZCBvbiBpdHMgb3duIHJvdywgYW5kIHRoZSByZXN0IG9mIHRoZSBwYXRjaCBhcHBsaWVzLgoKSXQgbGVhdmVzIHR3byBjYXNlcyBhbG9uZToKCi0gQSBzY2FsYXIgb2YgdGhlIHdyb25nIHR5cGUgaXMgb25seSByZXBvcnRlZC4gYHdlaWdodGAgYXMgYCI0MCJgIGlzIHJlYWRhYmxlLCBzb21lIGJpbmRlcnMgY29lcmNlIGl0LCBhbmQgdGhlIG1lYXN1cmVtZW50IGNhbm5vdCBwcm92ZSBpdCBpcyB3cm9uZy4KLSBBIGZpZWxkIHRoZSBwYXRjaCByZW1vdmVzIGlzIG5vdCBwdXQgYmFjay4gRHJvcHBpbmcgZmllbGRzIGlzIGhvdyBhIHRvdGFsIGNvbnZlcnNpb24gd29ya3M6IGByZXBsYWNlc2Agc3dhcHMgdGhlIHdob2xlIHJlY29yZCwgYW5kIGEgbW9uc3RlciByZXdyaXR0ZW4gYXMgYHtuYW1lLCBocH1gIGhhcyBubyBgZmxhZ3NgLiBSZXN0b3JpbmcgdGhlIGZpZWxkIHdvdWxkIHVuZG8gYSBzdXBwb3J0ZWQgZmVhdHVyZS4gQW4gYWJzZW50IHJlcXVpcmVkIGZpZWxkIGlzIHJlcG9ydGVkIChgZmllbGQvcmVxdWlyZWRgKS4gUmVmdXNpbmcgYSByZWNvcmQgdGhhdCB0aGUgbW9kIGl0c2VsZiBvd25zIGlzIHRoZSBiaW5kZXJzJyBqb2IsIGFuZCB0aGUgc3RvcmUgYmluZGVyJ3MgYG93bmVyOmAgZ3VhcmQgYWJvdmUgZG9lcyB0aGF0IHdoZXJlIGl0IGlzIHJlYWNoYWJsZSB0b2RheS4KCkVnb3MgZ2V0IHRoZSBzYW1lIHRyZWF0bWVudCBhcyBzdG9yZXMuIEFuIGVnbydzIGBpdGVtOmAgbGlzdCBuYW1lcyBzcGVjaWZpYyBiYXNlIGtpbmRzIGFuZCBhY2NlcHRzIHRoZSBzYW1lIGBhcHBlbmRgLCBzbyBpdCBoYWQgdGhlIHNhbWUgZGVmZWN0IGFuZCBub3cgYmVoYXZlcyB0aGUgc2FtZSB3YXk6IHRoZSBsaW5lIGlzIGRyb3BwZWQsIHRoZSBlZ28ga2VlcHMgaXRzIG90aGVyIGNhbmRpZGF0ZXMsIGFuZCB0aGUgbW9kIGlzIHRvbGQuIFRoZSBjb3JlLXZlcnN1cy1tb2QgY2hlY2sgbGl2ZXMgaW4gb25lIHNoYXJlZCBgZmllbGRPd25lcmAgaW4gYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWZ1c2FsLnRzYCwgc28gdHdvIGJpbmRlcnMgY2Fubm90IGp1ZGdlIHRoZSBzYW1lIHByb3ZlbmFuY2UgZGlmZmVyZW50bHkuIEFueSBiaW5kZXIgdGhhdCByZXNvbHZlcyBuYW1lcyBmcm9tIGEgbGlzdCBhIG1vZCBjYW4gYXBwZW5kIHRvIHNob3VsZCB1c2UgaXQgcmF0aGVyIHRoYW4gYSBydWxlIG9mIGl0cyBvd24uCkEgcGFzcyBvdmVyIGV2ZXJ5IGJpbmRlciAoIzgpIGZvdW5kIHNpeCBtb3JlIGNhc2VzIG9mIHRoZSBzYW1lIHNoYXBlIGFuZCBmaXhlZCB0aGVtIHRoZSBzYW1lIHdheTogYW4gYXJ0aWZhY3QncyBgZmxhZ3M6YCBhbmQgYHZhbHVlczpgIHRva2VucywgYSBjdXJzZSdzIGB0eXBlOmAgZW50cmllcywgYSBtb25zdGVyJ3MgYGJhc2U6YCAodGhlIHdob2xlIHJhY2UsIGxpa2UgdGhlIGFydGlmYWN0J3MgYGJhc2Utb2JqZWN0OmApLCBgZnJpZW5kcy1iYXNlOmAsIGBmcmllbmRzOmAgYW5kIGBzaGFwZTpgIChvbmUgZW50cnkgZWFjaCksIGFuZCBhIHRlcnJhaW4gZmVhdHVyZSdzIGBtaW1pYzpgLiBUd28gZmllbGRzIGRpZCBub3QgbmVlZCBpdC4gQW4gYXJ0aWZhY3QncyBgYWN0OmAgcmVzb2x2ZXMgdGhlIHdheSB1cHN0cmVhbSdzIGBmaW5kYWN0YCBkb2VzLCBzaWxlbnRseSB0byBub3RoaW5nLCBhbmQgaXQgZG9lcyB0aGF0IG9uIGNvcmUncyBvd24gZGF0YSB0b28sIHNvIHJlZnVzaW5nIGEgbW9kJ3MgdmVyc2lvbiB3b3VsZCBtYWtlIHRoZSBzYW1lIG1pc3Rha2UgbG91ZGVyIGZvciBtb2RzIHRoYW4gZm9yIGNvcmUuIFRoZSB0cmFwIGJpbmRlciByZXNvbHZlcyBubyBuYW1lcyBmcm9tIGFuIGFwcGVuZGFibGUgbGlzdCwgb25seSBmcm9tIGZpeGVkIGNvbXBpbGVkIHRhYmxlcy4KCmBjb21wb3NlUGFja3NgJ3MgYGZpZWxkUGF0Y2hlc2AgbG9vcCBhbHNvIGNhbGxlZCBgYXBwbHlGaWVsZFBhdGNoYCB3aXRob3V0IGdvaW5nIHRocm91Z2ggYHJlZnVzZSgpYCwgc28gYSBtYWxmb3JtZWQgb3AgKGFuIGBhcHBlbmRgIHdpdGggYHZhbHVlYCBpbnN0ZWFkIG9mIGB2YWx1ZXNgLCBzYXkpIHRvb2sgZG93biB0aGUgd2hvbGUgcGFjaywgb3IgZXZlcnkgaW5zdGFsbGVkIG1vZCB3aGVuIHRoZSByYXcgZXJyb3IgbmFtZWQgbm9uZSBvZiB0aGVtLiBJdCBpcyBub3cgcmVmdXNlZCB0aGUgc2FtZSB3YXkgYSBtaXNzaW5nIHBhdGNoIHRhcmdldCBpcy4KIyMjIDQuIGBjdHguY29yZWAgaXMgaGFuZGVkIG92ZXIgd2hvbGU7IGEgbmFtZWQgc3Vic2V0IG9mIGl0IGlzIGd1YXJhbnRlZWQKCmBNb2RQbHVnaW5Db250ZXh0LmNvcmVgIGlzIHRoZSBsaXZlIGNvcmUgbW9kdWxlIG5hbWVzcGFjZTogdGhlIHdob2xlIGVuZ2luZSwgYWJvdXQgdHdvIHRob3VzYW5kIHJ1bnRpbWUgZXhwb3J0cywgcmF0aGVyIHRoYW4gYSBjdXJhdGVkIHNsaWNlIHRoYXQgd291bGQgZHJpZnQgb3V0IG9mIGRhdGUuIGBwYWNrYWdlcy9jb3JlL21vZC1hcGktc3VyZmFjZS5qc29uYCByZWNvcmRzIHRoZSBzdXJmYWNlLCBhbmQgYG1vZC1jb3JlLXN1cmZhY2UudGVzdC50c2AgZmFpbHMgb24gYW55IGRpZmZlcmVuY2UgaW4gZWl0aGVyIGRpcmVjdGlvbiwgc28gZXZlcnkgcmVtb3ZhbCBhbmQgZXZlcnkgYWRkaXRpb24gc2hvd3MgdXAgYXMgYSBkaWZmLgoKYE1PRF9BUElfVkVSU0lPTmAgZG9lcyBub3QgY292ZXIgdGhpcyBuYW1lc3BhY2UuIEl0IHZlcnNpb25zIHRoZSBwbHVnaW4gY29udHJhY3QgaXRzZWxmOiB0aGUgbWVtYmVycyBvZiBgTW9kUGx1Z2luYCwgd2hhdCB0aGUgaG9zdCBwYXNzZXMsIGFuZCB3aGVuIGl0IGNhbGxzIHRoZW0uIEEgY29yZSBmdW5jdGlvbiBjYW4gYmUgcmVuYW1lZCB3aXRob3V0IGNoYW5naW5nIGFueSBvZiB0aGF0LCBzbyB0aGUgbnVtYmVyIGEgbW9kIGF1dGhvciBjaGVja3Mgc2F5cyBub3RoaW5nIGFib3V0IHRoZSBmdW5jdGlvbnMgdGhlaXIgcGx1Z2luIGNhbGxzIG1vc3QuCgpUaGUgbmFtZXNwYWNlIGlzIHRvbyB3aWRlIHRvIHByb21pc2UgYWxsIG9mIGl0OiBmb3JiaWRkaW5nIHRoZSByZW1vdmFsIG9mIGFueSBvZiB0aG9zZSBuYW1lcyB3b3VsZCBmcmVlemUgdGhlIHBvcnQuIFRoZSBwcm9taXNlIGNvdmVycyB0aGUgMjMgbmFtZXMgYmVsb3csIHRoZSBvbmVzIGZpcnN0LXBhcnR5IHBsdWdpbnMgY2FsbGVkIHdoZW4gdGhlIGxpc3Qgd2FzIGRyYXduIHVwLCBhbmQgdGhlIGxpc3QgaGFzIG5vdCBncm93biBzaW5jZS4gRmlyc3QtcGFydHkgbW9kcyByZWFkIDYxIG5hbWVzIGZyb20gYGN0eC5jb3JlYCBhcyBvZiAyMDI2LTEwLTAzLCBzbyA0MSBvZiB0aGVtIGFyZSBvdXRzaWRlIHRoZSBwcm9taXNlLCBhbmQgdGhyZWUgb2YgdGhlIGd1YXJhbnRlZWQgbmFtZXMgYXJlIG5vIGxvbmdlciByZWFkIGJ5IGFueSBvZiB0aGVtLiBUaG9zZSA0MSBhcmUgdGhlIGVzY2FwZSBoYXRjaCBkZXNjcmliZWQgYmVsb3csIHRoZSBzYW1lIGFzIGZvciBhbnlvbmUgZWxzZSdzIG1vZC4KfCBFeHBvcnQgfCBgdHlwZW9mYCB8IENhbGxlZCBieSB8CnwtLS18LS0tfC0tLXwKfCBgRERHUklEYCB8IG9iamVjdCB8IG5vbmUgfAp8IGBGRUFUYCB8IG9iamVjdCB8IGJvcmcsIGJ1Zy1maXhlcyB8CnwgYE1PTl9SQUNFX0ZMQUdfRU5UUklFU2AgfCBvYmplY3QgfCBib3JnIHwKfCBgTU9OX1NQRUxMX0VOVFJJRVNgIHwgb2JqZWN0IHwgYm9yZyB8CnwgYE9wdGlvblN0YXRlYCB8IGZ1bmN0aW9uIHwgcW9sIHwKfCBgUkVTVF9DT01QTEVURWAgfCBudW1iZXIgfCBib3JnIHwKfCBgUlNGYCB8IG9iamVjdCB8IGJvcmcgfAp8IGBSbmdgIHwgZnVuY3Rpb24gfCBib3JnIHwKfCBgVFZgIHwgb2JqZWN0IHwgYm9yZywgcW9sIHwKfCBgZGVzY3JpYmVMb29rR3JpZGAgfCBmdW5jdGlvbiB8IGFueWJhbmR1aSB8CnwgYGdlYXJPYmplY3RGb3JVc2VgIHwgZnVuY3Rpb24gfCBub25lIHwKfCBga25vd25QaWxlYCB8IGZ1bmN0aW9uIHwgYW55YmFuZHVpIHwKfCBgbG9jYCB8IGZ1bmN0aW9uIHwgYnVnLWZpeGVzIHwKfCBgbW92ZW1lbnRUdW5uZWxUZXN0YCB8IGZ1bmN0aW9uIHwgcW9sIHwKfCBgcGFyc2VUaWxlUHJlZnNgIHwgZnVuY3Rpb24gfCB1cHN0cmVhbS1jYXRjaHVwIHwKfCBgcGxhY2VTdGFpcnNgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGBwbGF5ZXJDb25mdXNlRGlyYCB8IGZ1bmN0aW9uIHwgbm9uZSB8CnwgYHNldFByZWZFcnJvclBvbGljeWAgfCBmdW5jdGlvbiB8IHFvbCB8CnwgYHNxdWFyZUlzRW1wdHlgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGBzcXVhcmVJc05vU3RhaXJzYCB8IGZ1bmN0aW9uIHwgYnVnLWZpeGVzIHwKfCBgc3F1YXJlSXNWaXNpYmxlVHJhcGAgfCBmdW5jdGlvbiB8IGFueWJhbmR1aSB8CnwgYHNxdWFyZU51bVdhbGxzQWRqYWNlbnRgIHwgZnVuY3Rpb24gfCBidWctZml4ZXMgfAp8IGB0dW5uZWxBdXhgIHwgZnVuY3Rpb24gfCBxb2wgfAoKQnkgbW9kLCBib3JnIHJlYWRzIDcgb2YgdGhlc2UsIGJ1Zy1maXhlcyA2LCBxb2wgNSwgYW55YmFuZHVpIDMgYW5kIHVwc3RyZWFtLWNhdGNodXAgMS4gZmVhdHVyZS1yZXN0b3JhdGlvbiBhbmQgc3F1aXJlIHJlYWQgb25seSB1bmd1YXJhbnRlZWQgbmFtZXMsIGFuZCBsaW5vbGV1bSBhbmQgZm9yZ2UgcmVhZCBub25lOiBsaW5vbGV1bSByZWFjaGVzIHRoZSBnYW1lIHRocm91Z2ggYGhvc3QudGlsZXNgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgLCBhbmQgZm9yZ2UgaG9sZHMgYGN0eC5jb3JlYCB3aXRob3V0IHJlYWRpbmcgYSBuYW1lIGZyb20gaXQuCgpgcGFja2FnZXMvY29yZS9tb2QtY29yZS1ndWFyYW50ZWVkLmpzb25gIGhvbGRzIHRoZSBsaXN0LCBhbmQgYG1vZC1jb3JlLWd1YXJhbnRlZWQudGVzdC50c2AgZmFpbHMgaWYgYW55IG9mIHRob3NlIG5hbWVzIGlzIG1pc3NpbmcgZnJvbSB0aGUgbmFtZXNwYWNlIGEgcGx1Z2luIHJlY2VpdmVzIG9yIGl0cyBgdHlwZW9mYCBoYXMgY2hhbmdlZC4gUmVtb3Zpbmcgb25lIGlzIGEgY29tcGF0aWJpbGl0eSBicmVhayB0aGF0IG5lZWRzIGVpdGhlciBhbiBhbGlhcyB1bmRlciB0aGUgb2xkIG5hbWUgb3IgdGhlIHR3by1yZWxlYXNlIGBtb2RBcGlgIHBhdGg7IHVwZGF0aW5nIGBtb2QtYXBpLXN1cmZhY2UuanNvbmAgYWxvbmUgZG9lcyBub3QgY292ZXIgaXQuCkV2ZXJ5dGhpbmcgZWxzZSBvbiBgY3R4LmNvcmVgIGlzIGFuIGVzY2FwZSBoYXRjaC4gQSBwbHVnaW4gbWF5IGNhbGwgaXQsIGJ1dCBhIHJlbmFtZSBvciByZW1vdmFsIG9mIGFuIHVuZ3VhcmFudGVlZCBuYW1lIGNhbiBzaGlwIGluIGFueSByZWxlYXNlLCByZWNvcmRlZCBpbiB0aGUgdGFibGUgYmVsb3cuIFVzZSBhIHNlYW0gKGBNb2RIb29rc2AsIGBjdHgucmVnaXN0cmllc2AsIGEgY2FwYWJpbGl0eS1nYXRlZCBmYWNhZGUpIHdoZW4gb25lIGV4aXN0czsgY2FsbGluZyBhbiB1bmd1YXJhbnRlZWQgbmFtZSB0aWVzIHRoZSBwbHVnaW4gdG8gdGhhdCBlbmdpbmUgcmVsZWFzZS4KCkZvciB0aGUgcmVzdCBvZiB0aGUgbmFtZXNwYWNlLCB0aGUgb25seSBtZWNoYW5pc20gaXMgdGhlIHJhdGNoZXQgZGVzY3JpYmVkIGFib3ZlOiBgcGFja2FnZXMvY29yZS9tb2QtYXBpLXN1cmZhY2UuanNvbmAgcmVjb3JkcyBldmVyeSBydW50aW1lIGV4cG9ydCwgYW5kIGBtb2QtY29yZS1zdXJmYWNlLnRlc3QudHNgIGZhaWxzIHdoZW4gdGhlIHNldCBjaGFuZ2VzIGluIGVpdGhlciBkaXJlY3Rpb24uCgotIEEgcmVtb3ZhbCBvciByZW5hbWUgb2YgYW4gdW5ndWFyYW50ZWVkIG5hbWUgZmFpbHMgQ0kgYW5kIGxpc3RzIHRoZSBuYW1lcy4gVGhlIGZpeCBpcyB0byBrZWVwIHRoZSBvbGQgbmFtZSBhcyBhbiBhbGlhcywgb3IgdG8gcmVjb3JkIHRoZSBicmVhayBpbiB0aGUgcmVtb3ZhbHMgdGFibGUgYmVsb3cgYW5kIHNoaXAgaXQuIEEgZ3VhcmFudGVlZCBuYW1lIGNhbm5vdCB0YWtlIHRoZSBzZWNvbmQgcm91dGUuCi0gQW4gYWRkaXRpb24gYWxzbyBmYWlscywgYW5kIHRoZSBmaXggaXMgb25lIGNvbW1hbmQ6IGBub2RlIHRvb2xzL2FwaS1zdXJmYWNlLm1qcyAtLXVwZGF0ZWAuIEFkZGl0aW9ucyBoYXZlIHRvIGJlIHJlY29yZGVkIGJlY2F1c2UgYW4gZXhwb3J0IGFkZGVkIGluIG9uZSByZWxlYXNlIGFuZCByZW1vdmVkIGluIHRoZSBuZXh0IHdvdWxkIG90aGVyd2lzZSBuZXZlciBhcHBlYXIgaW4gdGhlIGJhc2VsaW5lLCBhbmQgaXRzIHJlbW92YWwgd291bGQgZ28gdW5ub3RpY2VkLgoKIyMjIyBUaGVyZSBhcmUgdHdvIHN1Y2ggbmFtZXNwYWNlcyBub3csIHdhdGNoZWQgdGhlIHNhbWUgd2F5CgpgY3R4LmF1dGhvcmluZ2AgaXMgdGhlIG1vZCBTREsncyBwdWJsaWMgYmFycmVsLCBoYW5kZWQgb3ZlciB3aG9sZSBmb3IgdGhlIHNhbWUgcmVhc29uIGFzIGBjdHguY29yZWA6IGEgaGFuZC1waWNrZWQgc3Vic2V0IHdvdWxkIGJlIGEgc2Vjb25kIGxpc3QgdG8gbWFpbnRhaW4sIGFuZCBpdCB3b3VsZCBsYWcgYmVoaW5kIHdoYXRldmVyIGZ1bmN0aW9uIGFuIGF1dGhvciBuZWVkcyBuZXh0LiBJdCBoYXMgdGhlIHJhdGNoZXQgYnV0IG5vIGd1YXJhbnRlZWQgc3Vic2V0LgoKQmVmb3JlIHBsdWdpbnMgcmVjZWl2ZWQgaXQsIGEgcmVuYW1lIGluc2lkZSB0aGUgU0RLIHdhcyBjYXVnaHQgYnkgYHRzYyAtYmAgb3ZlciB0aGlzIHJlcG9zaXRvcnksIGJlY2F1c2UgZXZlcnkgY29uc3VtZXIgd2FzIGluIHRoZSByZXBvc2l0b3J5LiBBIHBsdWdpbiBzaGlwcyBhcyBidWlsdCBKYXZhU2NyaXB0IGFuZCByZXNvbHZlcyBubyBzcGVjaWZpZXIsIHNvIHRoZSBjb21waWxlciBuZXZlciBzZWVzIGl0cyBjYWxscy4gVGhlIFNESyB0aGVyZWZvcmUgZ2V0cyB0aGUgc2FtZSByYXRjaGV0IGFzIGNvcmU6IGBwYWNrYWdlcy9tb2Qtc2RrL21vZC1zZGstYXBpLXN1cmZhY2UuanNvbmAgcmVjb3JkcyB0aGUgc3VyZmFjZSwgYG1vZC1hdXRob3Jpbmctc3VyZmFjZS50ZXN0LnRzYCBmYWlscyBvbiBhIGNoYW5nZSBpbiBlaXRoZXIgZGlyZWN0aW9uLCBhbmQgYG5vZGUgdG9vbHMvYXBpLXN1cmZhY2UubWpzYCBjaGVja3MgYW5kIHVwZGF0ZXMgYm90aCBiYXNlbGluZXMgaW4gb25lIHJ1bi4KClRoZSBTREsgYmFycmVsIG5hbWVzIGl0cyBleHBvcnRzIG9uZSBieSBvbmUgaW5zdGVhZCBvZiByZS1leHBvcnRpbmcgZXZlcnl0aGluZzogYGFwcGx5RmllbGRQb2xpY3lgIGlzIGxlZnQgb3V0IG9mIGl0cyBgaW5kZXgudHNgLCBhbmQgYSBjb21tZW50IHRoZXJlIHNheXMgd2h5LiBBIHJlbW92YWwgZnJvbSB0aGUgYmFycmVsIGlzIHJlY29yZGVkIGluIHRoZSB0YWJsZSBiZWxvdyBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBhIGNvcmUgcmVtb3ZhbC4KCiMjIyMgQWRkaXRpb25zLCB3aGljaCBzdHJhbmQgbm9ib2R5CgpBbiBhZGRlZCBgY3R4YCBmaWVsZCBjYW5ub3QgYnJlYWsgYW4gZXhpc3RpbmcgcGx1Z2luLCBiZWNhdXNlIGEgcGx1Z2luIG5ldmVyIHJlYWRzIGEgbmFtZSBpdCBkb2VzIG5vdCBrbm93IGFib3V0LiBgTU9EX0FQSV9WRVJTSU9OYCBkb2VzIG5vdCBtb3ZlIGZvciBvbmUgKGl0cyBkb2MgY29tbWVudCBzYXlzIHNvKSwgYW5kIGFkZGl0aW9ucyBhcmUgbGlzdGVkIGhlcmUgc28gYXV0aG9ycyBjYW4gZmluZCB0aGVtLgp8IFZlcnNpb24gfCBGaWVsZCB8IFdoYXQgaXQgaXMgfAp8LS0tfC0tLXwtLS18CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0yMikgfCBgY3R4LmF1dGhvcmluZ2AgfCBUaGUgbW9kIFNESydzIHB1YmxpYyBiYXJyZWw6IGJsdWVwcmludHMsIGBwZWVyc0ZvcmAsIGBzdWdnZXN0RmllbGRzYCwgYGNoZWNrUmVjb3Jkc2AsIGBNb2RQcm9qZWN0YCBhbmQgdGhlIHJlc3Qgb2YgdGhlIGF1dGhvcmluZyBzdGFjay4gQWx3YXlzIHByZXNlbnQsIHNpbmNlIHRoZXNlIGFyZSBwdXJlIGZ1bmN0aW9ucyBvdmVyIGRhdGEgdGhlIGNhbGxlciBzdXBwbGllcyBhbmQgbmVlZCBubyBib290IHN0YXRlLiBOb3QgY2FwYWJpbGl0eS1nYXRlZCwgZm9yIHRoZSBzYW1lIHJlYXNvbnMgYGNhcGFiaWxpdHktZ2F0ZS1yZWFjaC50ZXN0LnRzYCByZWNvcmRzIGZvciBgY3R4LmNvcmVgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgOiBub3RoaW5nIGhlcmUgcmVhZHMgZ2FtZSBzdGF0ZSBvciBtdXRhdGVzIGEgcmVnaXN0cnksIGFuZCBhbnlvbmUgY2FuIGdldCBldmVyeSBuYW1lIGJ5IGluc3RhbGxpbmcgdGhlIHB1Ymxpc2hlZCBucG0gcGFja2FnZS4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5jb21wb3NlZFJlY29yZHNgIHwgRXZlcnkgY29udGVudCByZWNvcmQgdGhlIHJ1bm5pbmcgZ2FtZSB3YXMgY29tcG9zZWQgZnJvbSwgYXMgSlNPTiwga2V5ZWQgYnkgcGFjay1maWxlIHN0ZW0gd2l0aG91dCB0aGUgZXh0ZW5zaW9uLiBJdCBpcyB0aGUgdW5ib3VuZCBjb3VudGVycGFydCBvZiBgY3R4LnJlZ2lzdHJpZXNgIGFuZCB0aGUgc2hhcGUgdGhlIGF1dGhvcmluZyBmdW5jdGlvbnMgYWJvdmUgYWNjZXB0LiBgcmVnaXN0cmllcy5tb25zdGVycy5yYWNlc2AgaXMgYm91bmQsIHNvIGl0IGhhcyBuZWl0aGVyIHRoZSBKU09OIGtleSBuYW1lcyBub3IgdGhlIGZpZWxkcyB0aGF0IGJvdW5kIHRvIG5vdGhpbmcsIGFuZCBhIHBlZXIgdGFibGUgY2Fubm90IGJlIGJ1aWx0IGZyb20gaXQuIE1vZC1hZGRlZCByZWNvcmRzIGFwcGVhciBvbiB0aGUgc2FtZSB0ZXJtcyBhcyBjb3JlJ3MsIGVhY2ggd2l0aCBpdHMgcHJvdmVuYW5jZS4gQWJzZW50IGR1cmluZyBjb250ZW50IGNvbXBvc2l0aW9uLCBmb3IgdGhlIHNhbWUgcmVhc29uIGByZWdpc3RyaWVzYCBpcy4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5yZWxvYWRHYW1lYCB8IFRoZSBnYW1lJ3Mgb3duIG1vZC1jaGFuZ2UgcmVsb2FkLCBzbyBhIG1vZCB0aGF0IGluc3RhbGxlZCBzb21ldGhpbmcgY2FuIGFwcGx5IGl0OiBldmVyeSBwbHVnaW4ncyBgdW5pbnN0YWxsKClgIHJ1bnMsIHRoZSBhdXRvcGxheWVyIGhhbmRzIHRoZSBrZXlib2FyZCBiYWNrLCB0aGUgbGl2ZSBjaGFyYWN0ZXIncyBzdGF0ZSBpcyByZWNvcmRlZCwgYW5kIHRoZSBzZXNzaW9uIHJlc3VtZXMgdGhhdCBjaGFyYWN0ZXIgaW5zdGVhZCBvZiByZXR1cm5pbmcgdG8gdGhlIHRpdGxlIHNjcmVlbi4gSXQgc2l0cyBiZWhpbmQgYG1vZDppbnN0YWxsYCByYXRoZXIgdGhhbiBhIGNhcGFiaWxpdHkgb2YgaXRzIG93biwgYmVjYXVzZSBjb250ZW50IGNvbXBvc2VzIGF0IGxvYWQsIGFuZCBhbiBpbnN0YWxsIHRoYXQgY2Fubm90IGJlIGZvbGxvd2VkIGJ5IGEgcmVsb2FkIGxlYXZlcyB0aGUgcGxheWVyIHdpdGggc29tZXRoaW5nIHRoZSBydW5uaW5nIGdhbWUgd2lsbCBuZXZlciBsb2FkLiBBIHBsdWdpbiBjYW4gYWxyZWFkeSByZWFjaCBgbG9jYXRpb25gIHdpdGhvdXQgYW55IGdyYW50LCBzbyB0aGlzIGFkZHMgbm8gbmV3IHBvd2VyIHRvIHJlbG9hZDsgaXQgcGVyZm9ybXMgdGhlIGZvdXIgc3RlcHMgYSBtb2QgY2Fubm90IHRha2UgZm9yIGl0c2VsZi4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMjIpIHwgYGN0eC5pbnN0YWxsTW9kKC4uLikubGluZXNgIHwgQSBmaWVsZCBvbiBib3RoIGFybXMgb2YgdGhlIGV4aXN0aW5nIGluc3RhbGwgb3V0Y29tZTogdGhlIHdvcmRpbmcgdGhlIE1vZHMgc2NyZWVuIHByaW50cyBmb3IgdGhhdCBvdXRjb21lLCBpbmNsdWRpbmcgb25lIHJvdyBwZXIgdW5tZXQgcmVxdWlyZW1lbnQgd2l0aCB0aGUgYXV0aG9yJ3MgYWR2aWNlIHVuZGVyIGVhY2guIEEgbW9kIGJ1aWx0IGluIHRoZSBnYW1lIGZhaWxzIGEgcmVxdWlyZW1lbnQgaW4gdGhlIHNhbWUgd29yZHMgYXMgYSBkb3dubG9hZGVkIG1vZC4gYHByb2JsZW1gIGlzIHVuY2hhbmdlZCBhbmQgaXMgc3RpbGwgb25lIGNvbXBsZXRlIHNlbnRlbmNlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOS0wMSkgfCBgTW9kUmVnaXN0cnlIb3N0Lm1lbnVzLmFkZEFjdGlvbmAgfCBBIGNhcGFiaWxpdHktZ2F0ZWQgYWRkaXRpdmUgY29tcGFuaW9uIHRvIGBtZW51cy5yZWdpc3RlcmA6IGEgcGx1Z2luIGRlY2xhcmluZyBgcmVnaXN0cnk6bWVudWAgY2FuIGFkZCBvbmUgbGFiZWxsZWQsIG5hbWVzcGFjZWQgY2FsbGJhY2sgcm93IHRvIGBjb3JlOmdhbWUtbWVudWAuIEV4aXN0aW5nIG1lbnUgdHJhbnNmb3JtZXJzIGtlZXAgdGhlaXIgYmVoYXZpb3VyLCBhbmQgYW4gZXhpc3RpbmcgcGx1Z2luIG5laXRoZXIgY2FsbHMgbm9yIG9ic2VydmVzIHRoZSBuZXcgbWV0aG9kLCBzbyB0aGlzIGlzIGEgYmFja3dhcmQtY29tcGF0aWJsZSBBUEkgYWRkaXRpb24gYW5kIGRvZXMgbm90IG1vdmUgYE1PRF9BUElfVkVSU0lPTmAuIHwKfCB1bnJlbGVhc2VkICgyMDI2LTA5LTA1KSB8IGBjdHgua2V5bWFwcy5lbnRyaWVzYCwgYC5yZWJpbmRgLCBhbmQgYC5yZW1vdmVgIHwgVGhlIGV4aXN0aW5nIGBrZXltYXA6d3JpdGVgIGZhY2FkZSBub3cgcmVjb3JkcyBhbiBvd25lciBmb3IgZWFjaCBiaW5kaW5nIGl0IGNyZWF0ZXMuIEEgbW9kIGNhbiBlbnVtZXJhdGUsIHJlcGxhY2UsIGFuZCByZW1vdmUgb25seSBpdHMgb3duIGJpbmRpbmdzIGluIHRoZSBhY3RpdmUga2V5c2V0OyBpdCBjYW5ub3QgbGVhcm4sIG92ZXJ3cml0ZSwgb3IgcmVtb3ZlIHBsYXllciBiaW5kaW5ncyBvciBhbm90aGVyIG1vZCdzLiBQbGF5ZXIga2V5bWFwIGVkaXRzIGNsZWFyIGEgY2xhaW0sIGFuZCB0aGUgbW9kLWNoYW5nZSB0ZWFyZG93biByZW1vdmVzIGNsYWltcyB0aGF0IHJlbWFpbiwgc28gYSBkaXNhYmxlZCBtb2QgaGFzIG5vIHN1cnZpdmluZyBrZXlib2FyZCBiaW5kaW5nLiBFeGlzdGluZyBgYmluZGAgcmVtYWlucyBmcmVlLXRyaWdnZXItb25seSwgc28gdGhpcyBpcyBhIGJhY2t3YXJkLWNvbXBhdGlibGUgQVBJIGFkZGl0aW9uIGFuZCBkb2VzIG5vdCBtb3ZlIGBNT0RfQVBJX1ZFUlNJT05gLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOS0wMikgfCBBUEktMiBXb3JrZXIgQUJJIHwgYG1vZEFwaTogMmAgcGx1cyBgcnVudGltZTogIndvcmtlciJgIGFuZCBhIG1vZC1yZWxhdGl2ZSBgd29ya2VyRW50cnlgIHNlbGVjdHMgYSBkZWRpY2F0ZWQgbW9kdWxlIFdvcmtlciBib290ZWQgYnkgaG9zdCBjb2RlLCBpbnN0ZWFkIG9mIGltcG9ydGluZyBgcGx1Z2luLmpzYCBpbnRvIHRoZSByZW5kZXJlci4gSXRzIGluZGVwZW5kZW50bHkgdmVyc2lvbmVkIHByb3RvY29sIHN0YXJ0cyB3aXRoIGltbXV0YWJsZSBpbml0IGRhdGEsIGxvZ3MsIGFzeW5jIHByZWZlcmVuY2VzLCBvd24tYXNzZXQgYnl0ZXMsIGJhZyBtaWdyYXRpb24sIHNlbWFudGljIGNvbW1hbmRzLCByZW5kZXItY29hbGVzY2VkIHN0YXRlIGFuZCBkaXNwbGF5IHNuYXBzaG90cywgYW5kIGhvc3QtcmVuZGVyZWQgZGVjbGFyYXRpdmUgcGFuZWxzLiBUaGUgaW50ZW5kZWQgZmluYWwgc3VyZmFjZSBhbHNvIGFkZHMgdmVyc2lvbmVkIHJlYWQgc25hcHNob3RzLCBob3N0LWNhY2hlZCBwb2xpY2llcyBmb3Igc3luY2hyb25vdXMgcGF0aHMsIGFzeW5jIGhvb2sgZGVjaXNpb25zIHdpdGggdmFsaWRhdGVkIHBhdGNoZXMsIGRlY2xhcmF0aXZlIHJlZ2lzdHJ5L2NvbnRlbnQgYW5kIHRpbGUgZGVjbGFyYXRpb25zLCBjYWNoZWQgZnJvbnRlbmQvSFVEL3JlZ2lvbiBkaXNwbGF5IGxpc3RzLCBzZW1hbnRpYyBrZXltYXAvZGVidWcvd2l6YXJkL3N0b3JhZ2Ugb3BlcmF0aW9ucywgYW5kIG1lZGlhdGVkIG1vZCBsaWZlY3ljbGUgYWN0aW9ucy4gQVBJLTEgcmVtYWlucyBhcyB0cnVzdGVkIGNvbXBhdGliaWxpdHkgY29kZSBmb3Igbm93OyB0aGUgcGxhbiBpcyB0byBtb3ZlIGV2ZXJ5IHNoaXBwZWQgbW9kIHRvIEFQSS0yIHJhdGhlciB0aGFuIGtlZXAgYm90aCBBUElzIHBlcm1hbmVudGx5LiB8CgojIyMjIFJlbW92YWxzIHRha2VuIGtub3dpbmdseQoKRm91ciBvZiB0aGUgc2l4IHJvd3MgYXJlIG9uZSByZW1vdmFsOiB0aGUgcGFyc2UtZXJyb3IgbGltaXQsIHdoaWNoIGhhZCBubyBjb3VudGVycGFydCBpbiBBbmdiYW5kIDQuMi42IGFuZCBzbyBkaWQgbm90IGJlbG9uZyBpbiBhIHBvcnQuIGBmaWxsVGlsZXNGcm9tS2luYCBpcyB0aGUgc2FtZSBraW5kIG9mIHJlbW92YWwsIGFuZCB0aGUgZmlyc3Qgb2YgdGhlc2UgdG8gaGF2ZSBzaGlwcGVkIGluIGEgcmVsZWFzZS4KCnwgVmVyc2lvbiB8IEV4cG9ydCB8IFdoeSB8IFdoYXQgdG8gdXNlIGluc3RlYWQgfAp8LS0tfC0tLXwtLS18LS0tfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTIpIHwgYG9wdGlvbkZpbGVFcnJvck1lc3NhZ2VgIHwgSXRzIHdob2xlIHN1YmplY3QgaXMgZ29uZS4gVGhlIGN1c3RvbS1vcHRpb25zIHJlYWRlciB3YXMgYSBwb3J0IG9mIHVwc3RyZWFtICoqbWFzdGVyKioncyBgc3RydWN0IHBhcnNlcmAgZ3JhbW1hcjsgIzE0OSByZXdyb3RlIGl0IHRvIDQuMi42J3MgaGFuZC1yb2xsZWQgcmVhZCBsb29wLCB3aGljaCBoYXMgbm8gYHBhcnNlcl9zdGF0ZWAgdG8gZm9ybWF0IC0gaXQgZW1pdHMgdGhyZWUgcGxhaW4gYG1zZygpYCBsaW5lcyBpbnN0ZWFkLiB8IGBwcmVmRXJyb3JNZXNzYWdlYCAoYHZpc3VhbHMvcHJlZnMudHNgKSwgd2hpY2ggZm9ybWF0cyB0aGUgaWRlbnRpY2FsIGBQYXJzZSBlcnJvciBpbiAlcyBsaW5lICVkIGNvbHVtbiAlZDogJXM6ICVzYCBmcm9tIHRoZSBzYW1lIGBQYXJzZXJTdGF0ZWAuIEl0IHdhcyBhbHdheXMgdGhlIHNhbWUgZnVuY3Rpb247IHRoaXMgb25lIHdhcyB0aGUgZHVwbGljYXRlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgUEFSU0VfRVJST1JfTElNSVRgIHwgVGhlIHBvcnQncyBvd24gY2FwIG9mIDIwIHBhcnNlIGVycm9ycyBwZXIgZmlsZS4gQSBjaXRhdGlvbiBzd2VlcCAoIzI2OCkgZm91bmQgbm8gYFBBUlNFX0VSUk9SX0xJTUlUYCwgbm8gYGdldF9wYXJzZXJfZXJyb3JfbGltaXRgIGFuZCBubyBlcnJvciBDT1VOVCBhbnl3aGVyZSBpbiA0LjIuNiAtIGBwcm9jZXNzX3ByZWZfZmlsZV9uYW1lZGAgKGB1aS1wcmVmcy5jYCBMMTIyNS0xMjMxKSBgYnJlYWtgcyBvbiB0aGUgRklSU1QgYmFkIGxpbmUgLSBzbyBpdCB3YXMgYW4gaW1wcm92ZW1lbnQgdGhlIHBvcnQgaGFkIGFkZGVkLCBhbmQgdGhlIHBvcnQgYWRkcyBub3RoaW5nICgjMjcyKS4gfCBOb3RoaW5nIGluIGNvcmU6IHRoZSBudW1iZXIgd2FzIG5ldmVyIGEgZmFjdCBhYm91dCBBbmdiYW5kLiBBIG1vZCB0aGF0IHdhbnRzIGEgY2FwIGNob29zZXMgaXRzIG93biBhbmQgcGFzc2VzIGl0IGFzIGBQcmVmRXJyb3JQb2xpY3kucmVwb3J0TGltaXRgIHRvIGBzZXRQcmVmRXJyb3JQb2xpY3lgIChgdmlzdWFscy9wcmVmcy50c2ApLiBUaGUgYHFvbGAgbW9kIHVzZXMgMjAsIHNvIGEgcGxheWVyIHNlZXMgdGhlIGZhbWlsaWFyIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYGdldFBhcnNlckVycm9yTGltaXRgIHwgVGhlIHJlYWRlciBmb3IgdGhlIGFib3ZlLCBpbmNsdWRpbmcgYSBgUEFSU0VfRVJST1JfTElNSVRgIGVudmlyb25tZW50IG92ZXJyaWRlIHRoYXQgbm8gdXBzdHJlYW0gYnVpbGQgaGFzLiBSZW1vdmVkIHdpdGggaXRzIHN1YmplY3QgKCMyNzIpLiB8IGBwcmVmRXJyb3JQb2xpY3koKWAsIHdoaWNoIGFuc3dlcnMgd2l0aCB0aGUgcG9saWN5IGluIGZvcmNlIC0gYFVQU1RSRUFNX1BSRUZfRVJST1JfUE9MSUNZYCB1bmxlc3MgYSBtb2QgaW5zdGFsbGVkIGFub3RoZXIuIEl0IGFuc3dlcnMgYSByaWNoZXIgcXVlc3Rpb24sIGJlY2F1c2Ugb25lIG51bWJlciBjb3VsZCBub3QgZXhwcmVzcyBib3RoICJrZWVwIHJlYWRpbmciIGFuZCAia2VlcCByZXBvcnRpbmciLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgc2V0UGFyc2VyRXJyb3JMaW1pdGAgfCBUaGUgdGVzdCBzZWFtIGZvciB0aGUgYWJvdmUuIE5vdGhpbmcgaW4gdGhlIGdhbWUgZXZlciBjYWxsZWQgaXQsIGFuZCBpdHMgc3ViamVjdCBpcyBnb25lICgjMjcyKS4gfCBgc2V0UHJlZkVycm9yUG9saWN5KHBvbGljeSBcfCBudWxsKWAsIHdoaWNoIGlzIGEgcmVhbCBzZWFtIHJhdGhlciB0aGFuIGEgdGVzdCBob29rOiBpdCBpcyB0aGUgZG9jdW1lbnRlZCB3YXkgYSBtb2QgY2hhbmdlcyB3aGF0IGEgYmFkIHByZWYgbGluZSBjb3N0cywgYW5kIGBudWxsYCByZXN0b3JlcyA0LjIuNidzIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYHBhcnNlUGFyc2VyRXJyb3JMaW1pdEVudmAgfCBQYXJzZWQgYFBBUlNFX0VSUk9SX0xJTUlUYCBvdXQgb2YgdGhlIGVudmlyb25tZW50IHdpdGggQydzIGBzdHJ0b2xgIHJ1bGVzLCBzbyBhIGhvc3QgY291bGQgc2V0IHRoZSBjYXAgd2l0aG91dCBvd25pbmcgdGhlIHJ1bGUuIFRoZXJlIGlzIG5vIGNhcCBhbmQgbm8gZW52aXJvbm1lbnQgdmFyaWFibGUgKCMyNzIpLiB8IE5vdGhpbmcuIEEgbW9kIHRoYXQgd2FudHMgaXRzIHBvbGljeSBjb25maWd1cmFibGUgb3ducyB0aGF0IGRlY2lzaW9uLCBhbmQgYGN0eC5wcmVmc2AgaXMgd2hlcmUgYSBtb2Qga2VlcHMgYSBwbGF5ZXIncyBhbnN3ZXIgdG8gaXQuIHwKfCAwLjIzLjAgfCBgZmlsbFRpbGVzRnJvbUtpbmAgfCBUaGUgcG9ydCdzIG93biBydWxlIHRoYXQgYSBtb2QtYWRkZWQgbW9uc3RlciB3aXRoIG5vIHRpbGUgaXMgZHJhd24gd2l0aCB0aGUgdGlsZSBvZiBhIHJhY2Ugc2hhcmluZyBpdHMgYGJhc2VgLCBhbmQgYW4gYWRkZWQgb2JqZWN0IGtpbmQgd2l0aCBhIGtpbmQgc2hhcmluZyBpdHMgYHR2YWxgLiBTaGlwcGVkIGluIDAuMjIuMCBhbmQgcmVtb3ZlZCBpbiAwLjIzLjA6IDQuMi42IGhhcyBubyBjb25jZXB0IG9mIGEgbW9kLWFkZGVkIHJlY29yZCBhbmQgc28gbm8gb3BpbmlvbiBhYm91dCBob3cgb25lIHNob3VsZCBsb29rLCBhbmQgYm9ycm93aW5nIHRoZSBsb3dlc3QtaW5kZXggcmVsYXRpdmUncyBwaWN0dXJlIGlzIGEgc3R5bGUgY2hvaWNlIHJhdGhlciB0aGFuIHBvcnRlZCBiZWhhdmlvdXIuIEl0IGFsc28gbWFkZSB0aGF0IGNob2ljZSBmb3IgdGlsZSBzZXRzIHRoZSBnYW1lIGRvZXMgbm90IG93bjogYSBwYWNrIGRyYXduIGluIDIwMDMgaGFzIG5vIGFydCBmb3IgY29udGVudCBhZGRlZCB0d2VudHkgeWVhcnMgbGF0ZXIsIGFuZCBhIHNpYmxpbmcncyBwaWN0dXJlIHRoZXJlIG1pc2xlYWRzIHdoZXJlIGEgcGxhaW4gbGV0dGVyIGRvZXMgbm90LiBUaGUgcG9ydCBhZGRzIG5vdGhpbmcgKCMyNzIpLiB8IEl0IGJlY2FtZSBhIHNlYW0sIGByZWdpc3RyeTp0aWxlc2AuIEEgdGlsZXNldCBtb2QgcmVnaXN0ZXJzIGEgZmlsbGVyIHRocm91Z2ggYGhvc3QudGlsZXMucmVnaXN0ZXJgLCByZWFkcyB3aGF0IHRoZSBnYW1lIGNvbnRhaW5zIHRocm91Z2ggYGN0eC5yZWdpc3RyaWVzYCwgYW5kIHdyaXRlcyB0aHJvdWdoIGBUaWxlRmlsbGAsIHdoaWNoIHJlamVjdHMgYW55IHRpbGUgdGhhdCBzb21ldGhpbmcgZWxzZSBhbHJlYWR5IGFzc2lnbmVkLiBgbmVvLWxpbm9sZXVtYCAwLjE1LjAgY2FycmllcyB0aGUgcnVsZSB0aGF0IHVzZWQgdG8gbGl2ZSBoZXJlLCBhcHBsaWVkIHRvIGxpbm9sZXVtIHBhY2tzIG9ubHkuIEl0cyB0aHJlZSBzdXBwb3J0aW5nIHR5cGVzIHdlcmUgcmVtb3ZlZCB3aXRoIGl0IChgS2luVGlsZURlcHNgLCBgS2luVGlsZUZpbGxgLCBgS2luVGlsZURlcml2YXRpb25gKTsgYXMgdHlwZXMsIHRoZXkgbmV2ZXIgYXBwZWFyZWQgaW4gdGhlIHN1cmZhY2UgbGlzdC4gfAoKYHBhcnNlQ3VzdG9tT3B0aW9uc1RleHRgIGtlZXBzIGl0cyBuYW1lIGJ1dCBjaGFuZ2VkIHNoYXBlIG9uIDIwMjYtMDgtMTIuIEl0IHJldHVybnMgYHN0cmluZ1tdYCAodGhlIG1lc3NhZ2VzKSBpbnN0ZWFkIG9mIGBQYXJzZXJTdGF0ZVtdYCwgYW5kIGl0cyBmb3VydGggcGFyYW1ldGVyLCBgZXJyb3JMaW1pdGAsIGlzIGdvbmUgYmVjYXVzZSA0LjIuNidzIHJlYWRlciBoYXMgbm8gZXJyb3IgY2FwLiBBIHBsdWdpbiBjYWxsaW5nIGl0IGZvciBpdHMgb3duIGRpYWdub3N0aWNzIGdldHMgYSB0eXBlIGVycm9yIGF0IGJ1aWxkIGFuZCBhIGRpZmZlcmVudCBhcnJheSBhdCBydW50aW1lLiBUaGVyZSBpcyBubyBhbGlhcywgYmVjYXVzZSB0aGUgY2FsbCBub3cgcmV0dXJucyBkaWZmZXJlbnQgZGF0YSBhbmQgYW4gYWxpYXMgY291bGQgbm90IGdpdmUgYmFjayB0aGUgb2xkIHJlc3VsdC4KCmBDZWxsVmlldy50cmFwYCBrZWVwcyBpdHMgbmFtZSBidXQgY2hhbmdlZCBtZWFuaW5nICh1bnJlbGVhc2VkLCAyMDI2LTA4LTIxKS4gSXQgdXNlZCB0byBtZWFuICJ0aGlzIGdyaWQgaG9sZHMgYW55IHRyYXAgcmVjb3JkIjsgaXQgbm93IG1hdGNoZXMgYHNxdWFyZV9pc2Rpc2FybWFibGV0cmFwYCwgYSB2aXNpYmxlIHBsYXllciB0cmFwIHRoYXQgaXMgbm90IGFscmVhZHkgZGlzYWJsZWQuCgpUaGUgZmllbGQgd2FzIGNoYW5nZWQgaW4gcGxhY2UsIHdpdGggbm8gc2Vjb25kIGZpZWxkIGFsb25nc2lkZSBpdCwgYmVjYXVzZSB0aGUgb2xkIHZhbHVlIHdhcyBzaW1wbHkgd3JvbmcuIFRoZSB0cmFwIGxpc3QgYWxzbyBob2xkcyBhIGNsb3NlZCBkb29yJ3MgbG9jayAoYHNxdWFyZV9zZXRfZG9vcl9sb2NrYCwgZmxhZ2dlZCBgTE9DSyB8IElOVklTSUJMRWApLCBhIGdseXBoIG9mIHdhcmRpbmcsIGEgd2ViIGFuZCBhIGRlY295LiBOb25lIG9mIHRob3NlIGlzIGEgdHJhcCB0aGUgcGxheWVyIGNhbiBzZWUgb3IgdGhhdCBgZGlzYXJtYCB3aWxsIGFjdCBvbiwgc28gYSBtb2QgcmVhZGluZyB0aGUgb2xkIGZpZWxkIHNhdyBhIGxvY2tlZCBkb29yIGFzIHNvbWV0aGluZyB0byBkaXNhcm0uIGBkaXNhcm1gIHJlZnVzZXMgaXQgd2l0aG91dCBzcGVuZGluZyBhIHR1cm4sIHNvIGEgbW9kIHRoYXQga2VwdCBjaG9vc2luZyB0byBkaXNhcm0gd291bGQgaGFuZy4gVGhlIG9sZCBtZWFuaW5nIGFsc28gYnJva2UgdGhlIHJ1bGUgc3RhdGVkIG9uIHRoZSBuZWlnaGJvdXJpbmcgYHRyYXBHbHlwaGA6IGEgdHJhcCB0aGUgcGxheWVyIGhhcyBub3QgZm91bmQgaXMgbm90IG9uIHRoZSBzY3JlZW4sIHNvIGl0IGlzIG5vdCBpbiB0aGUgdmlldy4KCioqV2hhdCB0byBkbyBhYm91dCBpdC4qKiBBIG1vZCB0aGF0IHVzZWQgYHRyYXBgIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGRpc2FybSBuZWVkcyBubyBjaGFuZ2UgYW5kIG5vIGxvbmdlciBoYW5ncy4gQSBtb2QgdGhhdCB1c2VkIGl0IHRvIGFzayB3aGV0aGVyIGFueXRoaW5nIGluIHRoZSB0cmFwIGxpc3QgaXMgaGVyZSAoYSBtYXAgb3ZlcmxheSBjb3VudGluZyBnbHlwaHMgb2Ygd2FyZGluZywgc2F5KSBub3cgZ2V0cyBgZmFsc2VgIGZvciBhIGdseXBoIGFuZCBzaG91bGQgcmVhZCBgdHJhcEdseXBoYCBpbnN0ZWFkLCB3aGljaCBpcyBwcmVzZW50IGZvciBldmVyeSB0cmFwIHRoZSBwbGF5ZXIgY2FuIHNlZSwgZ2x5cGhzIGluY2x1ZGVkLgoKYFByb2Nlc3NQcmVmT3B0aW9uc2AgY2hhbmdlZCBzaGFwZSBmb3IgdGhlIHNhbWUgcmVhc29uICgjMjcyLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTQpOiBgZXJyb3JMaW1pdD86IG51bWJlcmAgaXMgbm93IGBlcnJvclBvbGljeT86IFByZWZFcnJvclBvbGljeWAuIEEgcGx1Z2luIHRoYXQgY2FsbGVkIGBwcm9jZXNzUHJlZlRleHQodGV4dCwgZGVwcywgc2luaywgeyBlcnJvckxpbWl0OiAwIH0pYCBnZXRzIGEgdHlwZSBlcnJvciBhdCBidWlsZCwgYW5kIHRoZSBmaXggaXMgYHsgZXJyb3JQb2xpY3k6IHsgY29udGludWVBZnRlckVycm9yOiB0cnVlLCByZXBvcnRMaW1pdDogMCB9IH1gLiBUaGVyZSBpcyBubyBhbGlhcywgYmVjYXVzZSBvbmUgbnVtYmVyIG1peGVkIHVwICJzdG9wIGFwcGx5aW5nIHRoZSBmaWxlIiB3aXRoICJzdG9wIGNvbGxlY3RpbmcgZXJyb3JzIiwgYW5kIG9ubHkgdGhlIHNlY29uZCBpcyBzb21ldGhpbmcgYSBwbGF5ZXIgd2FudHMgY2FwcGVkLiBGb3VyIG5hbWVzIGFycml2ZWQgd2l0aCBpdDogdGhlIHR5cGUgYFByZWZFcnJvclBvbGljeWAsIHdoaWNoIGFzIGEgdHlwZSBuZXZlciBhcHBlYXJzIGluIHRoZSBzdXJmYWNlIGxpc3QsIGFuZCB0aGUgcnVudGltZSBleHBvcnRzIGBVUFNUUkVBTV9QUkVGX0VSUk9SX1BPTElDWWAsIGBwcmVmRXJyb3JQb2xpY3koKWAgYW5kIGBzZXRQcmVmRXJyb3JQb2xpY3koKWAuCmBtc2d0KHNpbmtzLCB0eXBlLCB0ZXh0KWAga2VlcHMgaXRzIG5hbWUgYW5kIHNpZ25hdHVyZSBidXQgbm8gbG9uZ2VyIHRvdWNoZXMgYHNpbmtzLnNvdW5kYCAoIzIzOSwgdW5yZWxlYXNlZCAyMDI2LTA4LTEzKS4gSXQgdXNlZCB0byBjYWxsIGJvdGggc2lua3MgaXRzZWxmOyB0aGUgaG9zdCdzIGBtc2dgIHNpbmsgaXMgbm93IGBtc2d0YCwgc28gZG9pbmcgYm90aCB3b3VsZCBwbGF5IHRoZSBzb3VuZCB0d2ljZS4gTm90aGluZyBicmVha3MgYXQgYnVpbGQgdGltZSwgYW5kIHRoZSBjb21tb24gY2FzZSBpcyB1bmNoYW5nZWQ6IGEgcGx1Z2luIHRoYXQgY2FsbHMgYG1zZ3QoY3R4LnN0YXRlLCAiSFVOR1JZIiwgIi4uLiIpYCBzdGlsbCBnZXRzIHRoZSBtZXNzYWdlIGFuZCB0aGUgc291bmQsIGJlY2F1c2UgdGhlIHN0YXRlJ3Mgc2luayBzdXBwbGllcyBpdC4gVGhlIGNoYW5nZSBhZmZlY3RzIGEgcGx1Z2luIHRoYXQgYmluZHMgaXRzIG93biBub24tc291bmRpbmcgYG1zZ2AgaW50byBhIGBNZXNzYWdlU2lua3NgIGFuZCByZWxpZWQgb24gYG1zZ3RgIHRvIGNhbGwgYHNvdW5kYCBzZXBhcmF0ZWx5LiBUaGF0IHBsdWdpbiBub3cgZ29lcyBxdWlldCwgYW5kIHRoZSBmaXggaXMgdG8gbWFrZSBpdHMgc2luayB0eXBlLWF3YXJlIHdpdGggdGhlIGV4cG9ydGVkIGBtZXNzYWdlU291bmQodHlwZSlgLCB0aGUgc2FtZSBvbmUtbGluZSBydWxlIGB3ZWIvc3JjL21haW4udHNgIHVzZXMuIFRoZXJlIGlzIG5vIGFsaWFzLCBiZWNhdXNlIHR3byBmdW5jdGlvbnMgdGhhdCBkaWZmZXIgb25seSBpbiB3aGV0aGVyIHRoZXkgcGxheSB0aGUgc291bmQgdHdpY2Ugd291bGQgYmUgd29yc2UgdGhhbiBvbmUgcnVsZS4KCkluIHRoZSBTREsgcmF0aGVyIHRoYW4gYGN0eC5jb3JlYCwgYFBhcnNlZENhcGFiaWxpdHlgIGdhaW5lZCBhIGB7IGtpbmQ6ICJkaXNwbGF5IjsgYWN0aW9uOiAicmVwbGFjZSIgfWAgdmFyaWFudCAoIzE0MCwgdW5yZWxlYXNlZCAyMDI2LTA4LTEzKSwgYmVjYXVzZSBgTW9kUGx1Z2luLmZyb250ZW5kYCBub3cgcmVxdWlyZXMgYGRpc3BsYXk6cmVwbGFjZWAuIENvZGUgdGhhdCBidWlsZHMgYSBjYXBhYmlsaXR5IHN0cmluZyBpcyB1bmFmZmVjdGVkLiBBIHBsdWdpbiB0aGF0IGBzd2l0Y2hgZXMgZXhoYXVzdGl2ZWx5IG92ZXIgYHBhcnNlQ2FwYWJpbGl0eWAncyByZXN1bHQgaW4gVHlwZVNjcmlwdCBnZXRzIGEgY29tcGlsZSBlcnJvciBuYW1pbmcgdGhlIG5ldyBhcm0sIHdoaWNoIGlzIGludGVuZGVkOiBhIG1vZCB0aGF0IHNob3dzIHRoZSBjYXBhYmlsaXR5IGxpc3QgaW4gaXRzIG93biBVSSBzaG91bGQgbGVhcm4gdGhhdCBhIGtpbmQgZXhpc3RzIGl0IGRvZXMgbm90IGRlc2NyaWJlLiBBdCBydW50aW1lIHRoZSBjaGFuZ2UgaXMgYWRkaXRpdmUsIGFuZCBhbiBvbGRlciBidWlsZCBuZXZlciBlbWl0cyB0aGUgbmV3IHZhcmlhbnQuCgpgUGFyc2VkQ2FwYWJpbGl0eWAgY2hhbmdlZCBhZ2FpbiBpbiB0aGUgc2FtZSB3YXk6IGl0IGdhaW5lZCBgeyBraW5kOiAidWkiOyByZWdpb246IHN0cmluZzsgYWN0aW9uOiAicmVwbGFjZSIgfWAsIGFuZCBgQ29udGVzdGVkTGF5ZXJgIGdhaW5lZCBgImh1ZCJgICgjMjUzLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTMpLCBiZWNhdXNlIGBNb2RQbHVnaW4uaHVkYCByZXF1aXJlcyBgdWk6PHJlZ2lvbj4ucmVwbGFjZWAgYW5kIHRoZSBjb25mbGljdCByZXBvcnQgbm93IGhhcyBhIHNsb3QgZm9yIGVhY2ggSFVEIHJlZ2lvbi4gQW4gZXhoYXVzdGl2ZSBgc3dpdGNoYCBvdmVyIGVpdGhlciB0eXBlIGdldHMgYSBjb21waWxlIGVycm9yIG5hbWluZyB0aGUgbmV3IGFybSwgYXMgaW50ZW5kZWQuIGBNb2RQbHVnaW5gIGl0c2VsZiBvbmx5IGdhaW5lZCBhbiBvcHRpb25hbCBtZW1iZXIsIHNvIG5vIGV4aXN0aW5nIHBsdWdpbidzIHNoYXBlIGNoYW5nZXMuCgpUd28gbW9yZSBTREsgYWRkaXRpb25zIGJyZWFrIG5vdGhpbmcgYW5kIGFyZSBsaXN0ZWQgYmVjYXVzZSBldmVyeSBzaGFwZSBjaGFuZ2UgaXMgcmVjb3JkZWQsIHdoZXRoZXIgb3Igbm90IGl0IHN0cmFuZHMgYW55b25lLiBgV29ybGRGcmFtZWAgYW5kIGBIdWRGcmFtZWAgZWFjaCBnYWluZWQgYW4gb3B0aW9uYWwgYHN0YWNrYCAoYHJlYWRvbmx5IExpdmVSZWdpb25bXSB8IHVuZGVmaW5lZGApLCBhbmQgYExpdmVSZWdpb25gIGFuZCBgUmVnaW9uTGF5ZXJgIGFyZSBub3cgZXhwb3J0ZWQgZnJvbSB0aGUgU0RLICgjMjYxLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTQpLiBBbiBvcHRpb25hbCBtZW1iZXIgb24gYW4gaW50ZXJmYWNlIGEgcGx1Z2luIHJlY2VpdmVzIGNhbm5vdCBicmVhayBpdCwgYmVjYXVzZSBjb2RlIHRoYXQgcmVhZHMgYSBmcmFtZSBzdGlsbCBjb21waWxlcy4gQSBob3N0IHRoYXQgcHVibGlzaGVzIG5vIHN0YWNrIGxlYXZlcyBpdCBgdW5kZWZpbmVkYCwgYW5kIHRoYXQgaGFzIGl0cyBvd24gbWVhbmluZywgc28gYSBmcm9udCBlbmQgbXVzdCBub3QgdHJlYXQgYSBtaXNzaW5nIHN0YWNrIGFzICJub3RoaW5nIGlzIGNvdmVyaW5nIG1lIi4gU2VlIFtQTFVHSU5TLm1kXShQTFVHSU5TLm1kI2tub3dpbmctd2hlbi15b3UtYXJlLWNvdmVyZWQtZnJhbWVzdGFjaykuIFRoZSBgUGFyc2VkQ2FwYWJpbGl0eWAgY2hhbmdlcyBhYm92ZSBicm9rZSBleGhhdXN0aXZlIGBzd2l0Y2hgZXMgYmVjYXVzZSBwbHVnaW5zIGluc3BlY3QgY2FwYWJpbGl0aWVzOyBwbHVnaW5zIGRvIG5vdCBzd2l0Y2ggZXhoYXVzdGl2ZWx5IG92ZXIgZnJhbWVzLgpPbmUgU0RLIGNoYW5nZSByZW1vdmVzIGEgbmFtZSByYXRoZXIgdGhhbiByZXNoYXBpbmcgaXQ6IGBhcHBseUZpZWxkUG9saWN5YCBpcyBnb25lIGZyb20gdGhlIHBhY2thZ2UgaW5kZXggKCMyODUsIHVucmVsZWFzZWQgMjAyNi0wOC0xNSkuIEl0IGJlY2FtZSBwdWJsaWMgYnkgYWNjaWRlbnQgdGhyb3VnaCBgZXhwb3J0ICogZnJvbSAiLi9maWVsZHMuanMiYCwgYW5kIG91dHNpZGUgdGhlIFNESyBpdCB3YXMgYm90aCB1bnVzYWJsZSBhbmQgZGFuZ2Vyb3VzLiBUaGUgZnVuY3Rpb24ganVkZ2VzIGEgbmFtZXNwYWNlIHRyZXNwYXNzIGZyb20gYSBgRmllbGRQcm92ZW5hbmNlYCBtYXAgYnVpbHQgZHVyaW5nIGNvbXBvc2l0aW9uLCBhbmQgdGhlIGFjY2Vzc29yIHRoYXQgYnVpbGRzIG9uZSAoYGZpZWxkUHJvdmVuYW5jZU9mYCkgd2FzIG5ldmVyIGV4cG9ydGVkLiBBbiBvdXRzaWRlIGNhbGxlciBjb3VsZCB0aGVyZWZvcmUgb25seSB1c2UgdGhlIHRocmVlLWFyZ3VtZW50IGZvcm0sIHdob3NlIGRlZmF1bHRzIGFyZSBlbXB0eSBtYXBzOiBpdCBzdHJpcHMgdW5kZWNsYXJlZCBrZXlzLCBmaW5kcyBubyByZWNvcmRlZCB3cml0ZXIgZm9yIGFueXRoaW5nLCBqdWRnZXMgbm8gd3JpdGUgYSB0cmVzcGFzcywgYW5kIHJldHVybnMgYSBmYXVsdCBsaXN0IHRoYXQgbG9va3MgZXhhY3RseSBsaWtlIGEgY2xlYW4gcGFzcywgc28gdGhlIGNhbGxlciB0cnVzdHMgYSBjaGVjayB0aGF0IG5ldmVyIHJhbi4gVGhlIHR3byBwcm92ZW5hbmNlIHBhcmFtZXRlcnMgYXJlIG5vdyByZXF1aXJlZCB0b28sIHNvIHRoZSBzYW1lIG1pc3Rha2UgaXMgYSBjb21waWxlIGVycm9yIGluc2lkZSB0aGUgU0RLLiBOb3RoaW5nIGluIHRoaXMgcmVwb3NpdG9yeSBvciB0aGUgZm91ciBtb2QgcmVwb3NpdG9yaWVzIGNhbGxlZCBpdCwgc28gbm8gYXV0aG9yIGlzIHN0cmFuZGVkOyB0aGUgd2F5IHRvIGFwcGx5IHRoZSBydWxlIGlzIGBjb21wb3NlQ29udGVudFBhY2tzYCwgd2hpY2ggc3VwcGxpZXMgYm90aCBtYXBzIGFuZCBhbHdheXMgaGFzLiBgY2hlY2tVbnF1YWxpZmllZGAsIGBkZWNsYXJlZEZpZWxkc2AsIGBmaWVsZE93bmVyYCwgYGlzRXh0ZW5zaW9uS2V5YCBhbmQgYEZJRUxEX1RZUEVTYCBhcmUgdW5hZmZlY3RlZCwgYW5kIHRoZSBpbmRleCBub3cgbmFtZXMgdGhlbSBleHBsaWNpdGx5IGluc3RlYWQgb2YgdXNpbmcgdGhlIHdpbGRjYXJkIHRoYXQgbGV0IGBhcHBseUZpZWxkUG9saWN5YCBvdXQuCgpUd28gZmllbGQgcmVuYW1lcyBhcmUgaW52aXNpYmxlIHRvIHRoZSBleHBvcnQgcmF0Y2hldCwgd2hpY2ggY29tcGFyZXMgb25seSB0aGUgc2V0IG9mIGV4cG9ydGVkIG5hbWVzIGFuZCBub3QgdGhlIHNoYXBlIG9mIHdoYXQgZWFjaCBvbmUgcmV0dXJucyAoIzI4MywgdW5yZWxlYXNlZCAyMDI2LTA4LTE1KS4gVGhlIHVpLWVudHJ5IGNvbmZpZyBhIHBsdWdpbiBnZXRzIGZyb20gYGJ1aWxkVWlFbnRyeUNvbmZpZ2AgY2hhbmdlZCB0d28gZmllbGRzOgoKfCBXYXMgfCBOb3cgfCBXaHkgbm90IGFsaWFzZWQgfAp8LS0tfC0tLXwtLS18CnwgYFVpRW50cnkuY29tYmluZXJJbmRleDogbnVtYmVyYCAoMS1iYXNlZCBpbnRvIGNvcmUncyBuaW5lKSB8IGBVaUVudHJ5LmNvbWJpbmVyTmFtZTogc3RyaW5nYCB8IFRoZSBpbmRleCBpcyBhIHBvc2l0aW9uIGluIGNvcmUncyBvd24gY29tcGlsZWQgdGFibGUsIHNvIGEgY29tYmluZXIgYSBtb2QgcmVnaXN0ZXJzIGhhcyBub25lOyBrZWVwaW5nIGl0IHdvdWxkIGhhdmUgZml4ZWQgdGhlIHRhYmxlIGF0IG5pbmUgZW50cmllcyBhbmQgbWFkZSBgcmVnaXN0cnk6dWktZW50cnlgIHVzZWxlc3MuIEtlZXBpbmcgYm90aCB3b3VsZCBnaXZlIG9uZSB0aGluZyB0d28gaWRlbnRpdGllcyBhbmQgbmVlZCBhIHJ1bGUgYWJvdXQgd2hpY2ggd2lucy4gfAp8IGBSZW5kZXJlckluZm8uYmFja2VuZEluZGV4OiBudW1iZXJgICgwLi41KSwgYFJlbmRlcmVySW5mby5jb21iaW5lckluZGV4OiBudW1iZXJgIHwgYFJlbmRlcmVySW5mby5iYWNrZW5kTmFtZTogc3RyaW5nYCwgYFJlbmRlcmVySW5mby5jb21iaW5lck5hbWU6IHN0cmluZ2AgfCBTYW1lIHJlYXNvbiBhbmQgc2FtZSBmaXg6IHJlYWQgdGhlIG5hbWUuIGBSZW5kZXJlckluZm9gIGlzIG5vdyBhbHNvIGFuIGV4cG9ydGVkIHR5cGUsIHdoaWNoIGEgcGx1Z2luIHdyaXRpbmcgYSByZW5kZXJlciBiYWNrZW5kIG5lZWRzIGluIG9yZGVyIHRvIG5hbWUgaXQuIHwKCk5vdGhpbmcgZWxzZSBpbiBgVWlFbnRyeUNvbmZpZ2AgY2hhbmdlZC4gQSBwbHVnaW4gdGhhdCBvbmx5IGNhbGxzIGBjaGFyYWN0ZXJHcmlkYCwgYGVxdWlwQ21wU3VtbWFyeWAsIGBhcHBseVJlbmRlcmVyYCBvciBgY29tYmluZVZhbHVlc2AgaXMgdW5hZmZlY3RlZDogZWFjaCBnYWluZWQgYW4gb3B0aW9uYWwgdHJhaWxpbmcgcmVnaXN0cnkgYXJndW1lbnQgYW5kIGJlaGF2ZXMgYXMgYmVmb3JlIHdoZW4gaXQgaXMgb21pdHRlZC4KQW4gQVBJLTIgV29ya2VyIG1vZCdzIG1vZHVsZSBncmFwaCBoYXMgYSBuYXJyb3dlciBzaGFwZSAodW5yZWxlYXNlZCwgMjAyNi0xMC0wNCksIGJlY2F1c2UgdGhlIG1vZCBub3cgcnVucyBpbiBhIHNhbmRib3ggdGhhdCBjYW5ub3QgbG9hZCB0aGUgZ2FtZSdzIFVSTHMgYW5kIHJlY2VpdmVzIGl0cyBtb2R1bGVzIGFzIHRleHQgdGhlIGdhbWUgcmVhZCBmb3IgaXQuIEl0cyBpbXBvcnRzIG11c3QgYmUgcmVsYXRpdmUgcGF0aHMgdG8gaXRzIG93biBmaWxlcywgd2l0aCBubyBjeWNsZXM7IGEgYmFyZSBwYWNrYWdlIG5hbWUsIGFub3RoZXIgb3JpZ2luIG9yIGEgcGF0aCBvdXQgb2YgdGhlIGVudHJ5J3MgZm9sZGVyIGZhaWxzIHRoZSBtb2QgYXQgc3RhcnQgd2l0aCB0aGUgZmlsZSBuYW1lZC4gSW5zaWRlIHRoZSBzYW5kYm94IGVhY2ggbW9kdWxlIGlzIGEgYGRhdGE6YCBVUkwsIHNvIGBpbXBvcnQubWV0YS51cmxgIGFuZCBjb21wdXRlZCBkeW5hbWljIGltcG9ydHMgbm8gbG9uZ2VyIGZpbmQgdGhlIG1vZCdzIGZpbGVzLCBhbmQgYGZldGNoYCBpcyBnb25lLiBBIG1vZCBidW5kbGVkIGludG8gb25lIGZpbGUgd2l0aCBpdHMgYXNzZXRzIHJlYWQgdGhyb3VnaCB0aGUgYXNzZXQgcmVxdWVzdCBuZWVkcyBubyBjaGFuZ2UuIFtXT1JLRVJfSVNPTEFUSU9OLm1kXShXT1JLRVJfSVNPTEFUSU9OLm1kKSBoYXMgdGhlIGRldGFpbHMuCgpPdXRzaWRlIHRoZSBndWFyYW50ZWVkIHN1YnNldCwgYGN0eC5jb3JlYCBjYW4gY2hhbmdlIGluIGFueSByZWxlYXNlOyB0aGUgcmF0Y2hldCBtYWtlcyBlYWNoIGJyZWFrIHZpc2libGUgaW4gdGhpcyByZXBvc2l0b3J5IGJlZm9yZSBpdCByZWFjaGVzIGEgcGxheWVyJ3MgYnJvd3Nlci4gVGhlIGd1YXJhbnRlZSBjb3ZlcnMgYSB0b3AtbGV2ZWwgbmFtZSBhbmQgaXRzIGB0eXBlb2ZgLCBzbyBuZXN0ZWQga2V5cyBvbiBhIGd1YXJhbnRlZWQgb2JqZWN0IChgRkVBVC5NT1JFYCwgYFRWLlNXT1JEYCwgYFJTRi5CUl9GSVJFYCkgYXJlIHJlY29yZGVkIGxpa2UgYW55IG90aGVyIHNoYXBlIGNoYW5nZS4gYE1vZEhvb2tzYCBpcyBhIGNsb3NlZCBpbnRlcmZhY2Ugb2YgMjIgbWVtYmVycywgYW5kIHRoZSBidWctZml4ZXMgbW9kIGFsb25lIHVzZXMgbmluZSBvZiB0aGVtLiBJZiBhdXRob3JzIGtlZXAgY2FsbGluZyB1bmd1YXJhbnRlZWQgYGN0eC5jb3JlYCBuYW1lcyB0byBnZXQgcGFzdCBpdCwgdGhlIGFuc3dlciBpcyB0byBncm93IHRoZSBzZWFtIG9yIGFkZCBuYW1lcyB0byB0aGUgZ3VhcmFudGVlZCBzdWJzZXQsIHJhdGhlciB0aGFuIHJlc3RyaWN0aW5nIHRoZSBuYW1lc3BhY2UuCgpgbW9uc3RlckJlY2FtZVZpc2libGVgIGFuZCBgYXJ0aWZhY3RJZGVudGlmaWVkYCBrZWVwIHRoZWlyIG5hbWVzIGJ1dCBjaGFuZ2VkIGFyZ3VtZW50cyAodW5yZWxlYXNlZCwgMjAyNi0xMC0wNCkuIGBtb25zdGVyQmVjYW1lVmlzaWJsZShtb24pYCB1c2VkIHRvIHBhc3MgdGhlIGxpdmUgYE1vbnN0ZXJgIGFuZCBub3cgcGFzc2VzIGEgYEtub3duTW9uc3RlcmAuIGBhcnRpZmFjdElkZW50aWZpZWRgIHVzZWQgdG8gdGFrZSB0d28gYXJndW1lbnRzLCB0aGUgbGl2ZSBgR2FtZU9iamVjdGAgYW5kIGl0cyBgQXJ0aWZhY3RgIHJlY29yZCwgYW5kIG5vdyB0YWtlcyBvbmUsIGB7IG5hbWUsIGFydGlmYWN0SW5kZXggfWAuIFRoZSBsaXZlIG9iamVjdHMgdG9sZCBhIG1vZCB0aGluZ3MgdGhlIHBsYXllciBkb2VzIG5vdCBrbm93LCBzdWNoIGFzIGEgbW9uc3RlcidzIGV4YWN0IGhpdCBwb2ludHMgYW5kIGV2ZXJ5IHNwZWxsIGl0cyByYWNlIGhhcywgYW5kIGEgbW9kIGNvdWxkIGNoYW5nZSB0aGVtLiBObyBmaXJzdC1wYXJ0eSBtb2QgaGFuZGxlcyBlaXRoZXIgaG9vay4KClRoaXMgaXMgYSBicmVha2luZyBjaGFuZ2UgaW5zaWRlIEFQSSAxLiBgTU9EX0FQSV9WRVJTSU9OYCBhbmQgYE1PRF9BUElfTUlOYCBhcmUgYm90aCBzdGlsbCAxLCBhbmQgdGhlIGhvc3QgaGFzIG5vIHBhdGggdGhhdCBwYXNzZXMgdGhlIG9sZCBhcmd1bWVudHMsIHNvIG5vIGxvYWQtdGltZSBjaGVjayByZXBvcnRzIGEgcGx1Z2luIHdyaXR0ZW4gZm9yIHRoZW06IGl0IGxvYWRzLCBhbmQgaXRzIGhhbmRsZXIgZ2V0cyB0aGUgbmV3IG9uZXMuIEEgcmVhZCB0aGUgbmV3IG9iamVjdCBjYW5ub3QgYW5zd2VyLCBzdWNoIGFzIGBtb24ucmFjZS5uYW1lYCBvciBgbW9uLmhwYCwgZ2l2ZXMgYHVuZGVmaW5lZGAgd2l0aG91dCBhbiBlcnJvci4gQSBoYW5kbGVyIHRoYXQgcmVhZHMgYSBwcm9wZXJ0eSBvZiB0aGUgb2xkIHNlY29uZCBhcmd1bWVudCwgc3VjaCBhcyBgYXJ0aWZhY3QuYWlkeGAsIHRocm93cywgYmVjYXVzZSB0aGF0IGFyZ3VtZW50IGlzIG5vdyBgdW5kZWZpbmVkYC4gQSB0aHJvdyBmcm9tIGVpdGhlciBob29rIHN3aXRjaGVzIHRoYXQgaG9vayBvZmYgZm9yIHRoZSBzZXNzaW9uIGFuZCBzdG9wcyBzYXZpbmcsIGFzIGBNT0RfU0VBTVMubWRgIGRlc2NyaWJlcywgYW5kIGl0IGNvdW50cyB0b3dhcmQgdGhlIHRocmVlIGZhaWx1cmVzIHRoYXQgc3dpdGNoIHRoZSB3aG9sZSBtb2Qgb2ZmLiBUbyBwb3J0IGEgaGFuZGxlciwgcmVhZCBgbW9uLnJhY2VgIHdoZXJlIGl0IHJlYWQgYG1vbi5yYWNlLm5hbWVgLCBrZWVwIGBtb24uZ3JpZGAsIGFuZCByZWFkIGBuYW1lYCBhbmQgYGFydGlmYWN0SW5kZXhgIHdoZXJlIGl0IHJlYWQgYGFydGlmYWN0Lm5hbWVgIGFuZCBgYXJ0aWZhY3QuYWlkeGAuIEEgbW9kIGFsbG93ZWQgdG8gcmVhZCBnYW1lIHN0YXRlIGNhbiBzdGlsbCBmaW5kIHRoZSBsaXZlIG1vbnN0ZXIgYnkgaXRzIGBpZGAuCgojIyBXaGF0IGlzICpub3QqIGEgY29tcGF0aWJpbGl0eSBtZWNoYW5pc20KCi0gKipTYXZlIGRhdGEuKiogQSBtb2QncyBvd24gYmFnIGluIHRoZSBwbGF5ZXIncyBzYXZlIGlzIG1pZ3JhdGVkIGJ5IHRoZSBtb2QsIHZpYQogIGBNb2RQbHVnaW4ubWlncmF0ZUJhZ2AgYW5kIGBzYXZlU2NoZW1hYC4gQ29yZSByb3VuZC10cmlwcyB0aGUgYmFnIHZlcmJhdGltIGFuZAogIG5ldmVyIHJlYWRzIGl0LCBzbyBvbmx5IHRoZSBtb2Qga25vd3Mgd2hhdCBpdHMgb3duIGRhdGEgbWVhbnMuCi0gKipMb2FkIG9yZGVyLioqIE5vdGhpbmcgaGVyZSBjaGFuZ2VzIHdobyB3aW5zIGEgY29uZmxpY3QuIFRoYXQgaXMKICBNT0RfTElGRUNZQ0xFLm1kIHNlY3Rpb24gMywgYW5kIHRoZSBhbnN3ZXIgaXMgYWx3YXlzIHRoZSBtb2QgdGhhdCBsb2FkcyBsYXN0LgoKIyMgV2hvIGZpbmRzIG91dCBmaXJzdAoKVGhlICoqbW9kIGNhbmFyeSoqIChgLmdpdGh1Yi93b3JrZmxvd3MvbW9kLWNhbmFyeS55bWxgKSBjaGVja3MgdGhlIFJlY29tbWVuZGVkIG1vZHMgbGlzdCBhZ2FpbnN0IHRoaXMgYnVpbGQgZGFpbHkgYW5kIHdoZW5ldmVyIHRoZSBsaXN0IGNoYW5nZXMuIEV2ZXJ5IHJlcG9zaXRvcnkgaW4gYG1vZHMvcmVnaXN0cnkuanNvbmAsIGNvbW11bml0eSBtb2RzIGluY2x1ZGVkLCBpcyBkaXNjb3ZlcmVkIHRoZSB3YXkgdGhlIGdhbWUgZGlzY292ZXJzIGl0LCBhbmQgaXRzIG1hbmlmZXN0IGdvZXMgdGhyb3VnaCB0aGUgc2FtZSBjaGVja3MgdGhpcyBidWlsZCBhcHBsaWVzIGF0IGluc3RhbGwgYW5kIGxvYWQgdGltZS4gQW4gZW5naW5lIHJlbGVhc2UgdGhhdCB3b3VsZCBzdHJhbmQgYSBsaXN0ZWQgbW9kIHNob3dzIHVwIGluIHRoZSBjYW5hcnkgcmF0aGVyIHRoYW4gaW4gYSBwbGF5ZXIncyBpbnN0YWxsLiBJdCBkb2VzIHRoZSBqb2Igb2YgU01BUEkncyBjb21wYXRpYmlsaXR5IGxpc3QgYXV0b21hdGljYWxseSwgYW5kIGl0IGxldHMgYSByZWxlYXNlIGJlIGhlbGQgYmFjayBiZWZvcmUgaXQgc2hpcHMuCgpUaGF0IGNvdmVycyBjdXJhdGVkIG1vZHMgb25seS4gQSBtb2Qgbm9ib2R5IGhhcyBsaXN0ZWQgZmluZHMgb3V0IHRoZSBzYW1lIHdheSBldmVyeSBtb2QgYWx3YXlzIGhhcywgd2hpY2ggaXMgd2h5IHRoZSBnYXRlcyBhYm92ZSBkZWdyYWRlIGluc3RlYWQgb2YgcmVmdXNpbmcuCgojIyBQcmlvciBhcnQsIGFuZCB3aGVyZSB0aGlzIGRlbGliZXJhdGVseSBkaWZmZXJzCgotICoqW1NNQVBJXShodHRwczovL2dpdGh1Yi5jb20vUGF0aG9zY2hpbGQvU01BUEkpKiogKFN0YXJkZXcgVmFsbGV5KSBpcyB0aGUgbW9kZWwKICBmb3IgbW9zdCBvZiB0aGlzOiBpdCByZXdyaXRlcyBtb2RzJyBjb21waWxlZCBjb2RlIGZvciByZW5hbWVkIG1lbWJlcnMsIGRldGVjdHMKICBhbiBpbmNvbXBhdGlibGUgbW9kIGFuZCBkaXNhYmxlcyBpdCB3aXRoIGEgY2xlYXIgbWVzc2FnZSByYXRoZXIgdGhhbiBsZXR0aW5nIGl0CiAgY3Jhc2ggdGhlIGdhbWUsIGFuZCBwdWJsaXNoZXMgYSBsaXZlIGNvbXBhdGliaWxpdHkgbGlzdC4gVGhlIGxlc3NvbiB0YWtlbiBoZXJlCiAgaXMgdGhlICpvcmRlcmluZyogLSBkZWdyYWRlLCByZXBvcnQsIGFuZCBvbmx5IHJlZnVzZSB3aGF0IGdlbnVpbmVseSBjYW5ub3QgcnVuLgogIE5vdCB0YWtlbjogdGhlIElMIHJld3JpdGluZywgd2hpY2ggaGFzIG5vIGVxdWl2YWxlbnQgZm9yIGEgSmF2YVNjcmlwdCBtb2R1bGUKICBhbmQgd291bGQgYmUgdGhlIHdyb25nIHRvb2wgYW55d2F5LgotICoqW0ZhY3RvcmlvXShodHRwczovL2x1YS1hcGkuZmFjdG9yaW8uY29tL2xhdGVzdC9hdXhpbGlhcnkvZGF0YS1saWZlY3ljbGUuaHRtbCkqKgogIHN1cHBsaWVzIG1pZ3JhdGlvbnMgaW4gdHdvIGZsYXZvdXJzIC0gSlNPTiB0byByZW5hbWUgYSBwcm90b3R5cGUsIEx1YSB0byBmaXggdXAKICBhIGxvYWRlZCBzYXZlIC0gYW5kIHJlbWVtYmVycyBwZXIgc2F2ZSB3aGljaCBoYXZlIHJ1bi4gYG1pZ3JhdGVCYWdgIGlzIHRoZQogIHNlY29uZCBvZiB0aG9zZS4gVGhlIGZpcnN0IGlzIHRoZSBzaGFwZSBhIGNvcmUtc2lkZSByZW5hbWUgYWxpYXMgd291bGQgdGFrZSBpZgogIG9uZSBpcyBldmVyIG5lZWRlZDsgbm90aGluZyBuZWVkcyBpdCB5ZXQsIGJlY2F1c2UgY29yZSdzIHJlY29yZCBuYW1lcyBhcmUKICB1cHN0cmVhbSBBbmdiYW5kJ3MgYW5kIHRoZSBwYXJpdHkgbWFuZGF0ZSBrZWVwcyB0aGVtIHN0aWxsLgotICoqTmVvRm9yZ2UgYW5kIEZhY3RvcmlvIGJvdGggYmxvY2sqKiBvbiBhIGRlY2xhcmVkIGluY29tcGF0aWJpbGl0eS4gVGhpcyBlbmdpbmUgZG9lcyBub3Q6IGFuIGF1dGhvcidzIGRlY2xhcmF0aW9uIGlzIHNob3duIHdpdGggdGhlaXIgcmVhc29uIGFuZCBuZXZlciBvdmVycmlkZXMgdGhlIHBsYXllcidzIHNldHVwLgo="
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
        text: "The SDK documentation, bundled with this workshop when it was built. Pick a lesson on the right, or use the advanced references when you need the full contract behind a content file or plugin.js."
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
    h("div", { class: "mb-filename", text: `SDK docs / ${document.path}` }),
    h("div", { class: "mb-why", text: "Read-only. Ctrl+F finds text in this document." }),
    reader.el
  );
  const beginner = asideSection("Beginner path", "7 lessons");
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
      text: "Requirements first, then the complete authoring and plugin contracts."
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
 * The entry point, written for mod API 1, which this game loads.
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
 * The entry point, written for mod API 2. This version of the game does not load
 * an API 2 mod from a folder yet; a later one will.
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
      shop.acts.createFile(newName.value.trim(), newName.value.trim() === PLUGIN ? PLUGIN_TEMPLATE : "");
      newName.value = "";
    }
  });
  const plugin = button({
    label: `Start a ${PLUGIN}`,
    tiny: true,
    tip: "Writes a working API 1 entry point with nothing in it yet, so a mod that runs code is one file away. The manifest gets the plugin facet and the API range with it, since a mod that ships code without declaring it installs and then does nothing.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE)
  });
  const pluginApi2 = button({
    label: `Start an API 2 ${PLUGIN}`,
    tiny: true,
    tip: "Writes an entry point for mod API 2 instead, and the manifest names the API 2 range. Use it to get a script ready for a later version of the game.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE_API2)
  });
  const apiNote = h(
    "div",
    { class: "mb-why" },
    "This game loads API 1 scripts. An API 2 script is for a later version of the game and does not run here yet."
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
    h("div", { class: "mb-row-actions" }, pluginApi2, api2Docs),
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
    take(async (id) => shop.acts.forkZip(new Uint8Array(await picked.arrayBuffer()), id));
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
      const open = group === "essentials" ? state.collapsed[group] !== true : state.collapsed[group] !== true && (group !== "advanced" || state.showAllFields);
      block.setOpen(open);
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
          tip: `Open the SDK document ${lesson.tutorial}. It builds the same mod with a text editor and pins the finished version with a test.`
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
      h("li", null, button({ label: "Read the seven tutorials", onClick: () => shop.acts.go({ at: "docs", doc: "tutorials" }) })),
      h("li", null, button({ label: "Read the plugin API", onClick: () => shop.acts.go({ at: "docs", doc: "plugins" }) })),
      h("li", null, button({ label: "Read the authoring API", onClick: () => shop.acts.go({ at: "docs", doc: "authoring" }) })),
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
          h("b", { text: "This game will not run it yet. " }),
          "The plugin.js here is written for mod API 2, and this version of the game loads API 1 plugins only, so it refuses the mod when the Mods screen loads it. Keep it for a later version, or start the script again from the API 1 template."
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
    cancel: deps.clearTimeout ?? ((handle) => clearTimeout(handle))
  };
}
function runLaunchSequence(onPhase, deps = {}) {
  const { after, cancel } = timerFns(deps);
  let phase = "brand";
  let handle;
  let finished = false;
  const tick = () => {
    const next = nextLaunchPhase(phase);
    if (next === void 0) {
      finished = true;
      return;
    }
    phase = next;
    onPhase(phase);
    if (nextLaunchPhase(phase) !== void 0) handle = after(tick, LAUNCH_STEP_MS);
    else finished = true;
  };
  onPhase(phase);
  handle = after(tick, LAUNCH_STEP_MS);
  return {
    get phase() {
      return phase;
    },
    skip() {
      if (finished) return;
      cancel(handle);
      finished = true;
      const last = LAUNCH_PHASES[LAUNCH_PHASES.length - 1];
      if (last !== void 0 && phase !== last) {
        phase = last;
        onPhase(phase);
      }
    },
    dispose() {
      if (!finished) cancel(handle);
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
  const existing = doc2.getElementById(HOST_ID);
  if (existing) existing.remove();
  const host = doc2.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.setAttribute("aria-label", options.label);
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = String(Z);
  host.style.height = "100dvh";
  host.style.width = "100vw";
  const root = host.attachShadow({ mode: "open" });
  const style = doc2.createElement("style");
  style.textContent = THEME_CSS;
  root.appendChild(style);
  doc2.body.appendChild(host);
  const closeHandlers = [];
  const keyHandlers = [];
  let open = true;
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
  const deepest = (event) => event.composedPath()[0] ?? event.target;
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
    if (!open) return;
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
    if (!open) return;
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
    if (!open) return;
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
  const overlay = {
    root,
    get open() {
      return open;
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
      if (!open) return;
      open = false;
      for (const [type, listener, capture] of listeners) {
        win?.removeEventListener(type, listener, capture);
      }
      for (const key of [...heldKeys]) releaseKey(key);
      for (const button2 of [...heldButtons]) releaseButton(button2);
      host.remove();
      for (const handler of [...closeHandlers]) handler();
    }
  };
  return overlay;
}

// src/workshop.ts
function openWorkshop(ctx, doc2) {
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
  const overlay = mountOverlay(doc2, { label: "ModForge" });
  let closed = false;
  let launchHandle;
  const handle = {
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
    closeWorkshop: () => handle.close(),
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
      handle.close();
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
  return handle;
}

// plugin.ts
var TAB = " Build a mod ";
var TAB_INK = "#e0bb64";
var TAB_GROUND = "#222721";
var plugin_default = {
  api: 1,
  /**
   * One region, one row, in the bottom right, painted in text.
   *
   * `place` is called on every frame and has to be cheap, total and pure, so it
   * does arithmetic and nothing else. It clamps rather than refusing on a grid too
   * small for the label, because returning a rectangle outside the grid would be
   * this mod's fault and not the terminal's.
   */
  regions(ctx) {
    if (ctx.flags[FLAG.showTab] !== true) return [];
    let handle;
    const open = () => {
      if (handle?.open === true) return;
      const doc2 = globalThis.document;
      handle = openWorkshop(ctx, doc2);
      if (handle === void 0) {
        ctx.log?.("no document to build the workshop into, so there is nothing to open");
      }
    };
    return [
      {
        id: "workshop",
        layer: "overlay",
        place(grid) {
          const cols = Math.min(TAB.length, Math.max(1, grid.cols));
          return {
            col: Math.max(0, grid.cols - cols),
            row: Math.max(0, grid.rows - 1),
            cols,
            rows: 1
          };
        },
        paint(surface) {
          const size = surface.size();
          if (size.cols <= 0 || size.rows <= 0) return;
          surface.print(0, 0, TAB.slice(0, size.cols), TAB_INK, TAB_GROUND);
        },
        input(pointer) {
          if (pointer.kind !== "tap") return;
          open();
        }
      }
    ];
  }
};
export {
  plugin_default as default
};
