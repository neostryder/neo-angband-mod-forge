// forge - generated from plugin.ts by neo-angband-mod-build
// (@rpgm-tools/neo-angband-mod-sdk). Edit the TypeScript source, not this file.

// src/host/context.ts
var FLAG = {
  showTab: "builder.showTab",
  keepDrafts: "builder.keepDrafts",
  cheatSpawn: "builder.cheatSpawn"
};

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
    const out = [{ path: "manifest.json", contents: `${JSON.stringify(this.manifest(), null, 2)}
` }];
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
function provenanceOf(record) {
  if (!isRecord(record)) return void 0;
  const from = record["$from"];
  if (isRecord(from) && typeof from["owner"] === "string") return { owner: from["owner"] };
  return void 0;
}
function satisfies(version, range) {
  if (range.trim() === "*" || range.trim() === "") return true;
  const m = /^>=\s*(\d+)\.(\d+)\.(\d+)/.exec(range.trim());
  if (!m) return true;
  const v = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!v) return false;
  for (let i = 1; i <= 3; i++) {
    const have = Number(v[i] ?? 0);
    const need = Number(m[i] ?? 0);
    if (have > need) return true;
    if (have < need) return false;
  }
  return true;
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
  satisfies
};

// src/host/seams.ts
var NO_AUTHORING = "This game cannot hand the workshop its authoring library yet, so every number below is measured from the workshop's own demonstration content instead of from the game.";
var NO_RECORDS = "This game cannot hand the workshop its own content yet, so the records you can base something on are the workshop's demonstration set rather than the real game's.";
var NO_INSTALL = "This game has no way for a mod to install another mod, so the workshop saves the finished mod as a file and you add it with Import a zip on the Mods screen. That path is two extra steps and leaves you holding a file you can read, keep and share.";
var NO_SESSION = "This game has no way to load a mod for one session, so trying one means installing it: the workshop saves the finished mod as a file, you add it with Import a zip on the Mods screen, turn it on and reload. That leaves the mod in your library, which is where you want it once it is finished anyway.";
var NO_WIZARD_SEAM = "This game cannot lend the workshop its debug commands, so nothing can be put in front of you and nowhere can be jumped to. Forge the mod, try it for the session, reload, and go and find the thing yourself.";
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
      why: "This game gives the workshop nowhere to keep unfinished work, so nothing here will survive a reload. Finish a mod and save the file.",
      bytes
    };
  }
  if (bytes > SIZE_CEILING) {
    return {
      ok: false,
      why: `There is more unfinished work here than the workshop will keep (${Math.round(bytes / 1024)}KB against a ${Math.round(SIZE_CEILING / 1024)}KB limit). Finish or delete a mod, and save the file for anything you want to keep.`,
      bytes
    };
  }
  try {
    prefs.set(encoded);
  } catch (e) {
    return { ok: false, why: `Keeping this failed: ${String(e)}`, bytes };
  }
  let back;
  try {
    back = prefs.get();
  } catch (e) {
    return { ok: false, why: `Keeping this appeared to work and could not be read back: ${String(e)}`, bytes };
  }
  if (JSON.stringify(back) !== text) {
    return {
      ok: false,
      why: "The workshop wrote this and read back something else, which means the store quietly ran out of room. Nothing here will survive a reload. Save the file for anything you want to keep.",
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
      says: `Nothing here yet gives this record an identity. ${file} takes one from ${api.keyDescription(file)}.`
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
      says: `This would come out as "${key}", which is already ${from === "core" ? "the base game's" : `${from}'s`} "${name}". Two records with one identity make both of them unaddressable, so change something ${api.keyDescription(file)} draws on.`
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
  if (code) manifest.modApi = MOD_API;
  if (draft.fields.length > 0) manifest.fields = [...draft.fields];
  if (draft.sections && draft.sections.length > 0) {
    manifest.sections = draft.sections.map(({ changes: _changes, ...section }) => ({ ...section }));
  }
  return { ...manifest, ...draft.manifestExtras ?? {} };
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
    return `Trying it for one session takes content only, and this mod ships ${scripts.join(", ")}. Save it as a file and add it with Import a zip on the Mods screen instead: that door runs code, and it asks you first.`;
  }
  const wanted = (draft.manifestExtras ?? {})["capabilities"];
  if (Array.isArray(wanted) && wanted.length > 0) {
    return `Trying it for one session takes content only, and this mod's manifest asks for ${wanted.join(", ")}. A capability is something a player grants, so it is granted in the mod manager: save this as a file and add it with Import a zip.`;
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
    return `${path} is written from what the mod does to ${path.slice(0, -".json".length)} records, so it is not a file to create by hand. Add or change one and it appears in this list, ready to edit.`;
  }
  const taken = projectFiles(api, draft).map((file) => file.path.toLowerCase());
  if (taken.includes(path.toLowerCase())) return "There is already a file with that name.";
  return void 0;
}
function pathNote(api, path) {
  if (classify(api, path) !== "extra") return void 0;
  if (!path.includes("/") && path.endsWith(".json") && path !== MANIFEST) {
    return "The game reads every top-level JSON file as a record file. This one is not a record file the game knows, so it will be loaded and contribute nothing. Put it in a folder - data/ is the usual one - to have it treated as data your own code reads.";
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
      return writeManifest(draft, text);
    case "records":
      return writeRecordFile(draft, path.slice(0, -".json".length), text);
    case "extra":
      return { ok: true, draft: { ...draft, extras: { ...draft.extras ?? {}, [path]: text } } };
  }
}
function writeFileBytes(api, draft, path, bytes) {
  const shape = pathShapeProblem(path);
  if (shape !== void 0) return { ok: false, why: shape };
  const kind = classify(api, path);
  if (kind !== "extra") {
    return {
      ok: false,
      why: `${path} is written from what the mod does, as text the workshop generates or parses, so it cannot hold raw bytes.`
    };
  }
  return { ok: true, draft: { ...draft, extras: { ...draft.extras ?? {}, [path]: bytes } } };
}
function deleteFile(api, draft, path) {
  if (classify(api, path) !== "extra") {
    return {
      ok: false,
      why: `${path} is written from what the mod contains, so there is nothing to delete. Take the changes out instead.`
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
var DERIVED = ["shape", "facets", "group", "dependencies", "affectsGameplay", "modApi", "sections"];
function writeManifest(draft, text) {
  const parsed = parseObject(text, "The manifest");
  if (!parsed.ok) return parsed;
  const raw = parsed.value;
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
  const derivedNow = manifestFor({ ...next, manifestExtras: {} });
  const extras = {};
  for (const [key, value] of Object.entries(raw)) {
    if (OWNED.includes(key)) continue;
    if (DERIVED.includes(key) && JSON.stringify(derivedNow[key]) === JSON.stringify(value)) {
      continue;
    }
    extras[key] = value;
  }
  if (scriptFiles(next).length > 0) {
    const facets = extras["facets"];
    if (facets !== void 0 && !(Array.isArray(facets) && facets.includes("plugin"))) {
      return {
        ok: false,
        why: `This mod ships ${scriptFiles(next).join(", ")}, so "facets" has to include "plugin" or the game will not run the code at all. Leave the line out and the workshop writes it.`
      };
    }
    if (extras["modApi"] !== void 0 && typeof extras["modApi"] !== "number") {
      return {
        ok: false,
        why: `"modApi" has to be a whole number. It is the plugin ABI the code is written against.`
      };
    }
  }
  return { ok: true, draft: { ...next, manifestExtras: extras } };
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
        return { ok: false, why: `"fieldPatches" in ${file}.json has to be an object of reference to operations.` };
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
        return { ok: false, why: `"replaces" in ${file}.json has to be an object of reference to record.` };
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
    return "Another mod doing the same thing keeps its change and you keep yours.";
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
  /** Whether an id can be used, and why not when it cannot. */
  idProblem(id) {
    if (id === "") return "A mod needs an id.";
    if (!ID_RE2.test(id)) {
      return "An id is lower case, starts with a letter, and uses only letters, digits and hyphens.";
    }
    if (this.deps.store.get().drafts[id]) return "There is already an unfinished mod with that id.";
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
   */
  openFile(path) {
    const draft = openDraft(this.deps.store.get());
    if (!draft) return;
    const text = fileText(this.deps.api, draft, path);
    this.deps.store.view((state) => {
      const held = state.buffers[path];
      const dirty = held !== void 0 && held.text !== held.from;
      if (text === void 0 || dirty) return { route: { at: "files", path } };
      return { route: { at: "files", path }, buffers: { ...state.buffers, [path]: { text, from: text } } };
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
        `${outcome.id} ${outcome.version} is installed. It takes effect after a reload, because enabling a mod always does.`,
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
        `${outcome.id} cannot be tried this way here: this window will not keep it across the reload the game needs to pick it up. Save it as a file and install it instead.`,
        "bad"
      );
      return;
    }
    if (this.deps.seams.session.reloadByHand) {
      this.notice(
        `${outcome.id} ${outcome.version} is loaded for this session. Reload the game to play it. It is not in your mods and it is gone when you close the game - but whatever it does to the character who plays it is not.`,
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
      "It never asks what JSON is, and it never hides it either: every screen can show the exact file it is about to write, and a mod it built can be taken away, hand-edited, and brought back."
    ]
  },
  {
    title: "What it does",
    paragraphs: [
      "Adds records - a new monster, item or spell, based on something that already exists, so it arrives with real shape and scale and none of its powers until you add them.",
      "Adjusts records the game already owns, shipping the difference rather than the whole record, so two mods changing different fields of the same thing both keep working.",
      "Retunes a whole file at once - every potion cheaper, every dragon faster - one adjustment applied across everything that matches a filter, each written as its own entry.",
      "Checks as you type: a name collision, a field nothing in the file uses, a reference to something no loaded pack defines. Errors, warnings and advice are kept apart."
    ]
  },
  {
    title: "Editing the files directly",
    paragraphs: [
      `Every screen above asks a question and writes the answer into a file. "Edit the files directly", reached from a mod's own page, shows those files - the same mod, printed, not a second copy of it. A change made there shows up on every other screen, and the other way round.`
    ]
  },
  {
    title: "The game it reads",
    paragraphs: [
      "On Neo Angband 1.0.0 the workshop reads the authoring SDK and the complete set of records composed for this running game, including enabled content mods. Its suggestions, comparisons and checks are about what is actually loaded.",
      "A small demonstration set remains for the standalone preview and partial test hosts. If either live-data surface is missing, an undismissable banner says so. That banner is hidden on the normal in-game path."
    ]
  },
  {
    title: "Reading more",
    paragraphs: [
      "The real SDK tutorials and authoring references are bundled under Docs in the workshop. The full ModForge README and engine seam decisions remain in the repository this mod shipped from: neo-angband-mod-forge."
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
  return h(
    "button",
    {
      class: "mb-listrow",
      type: "button",
      aria: { selected: options.selected === true ? "true" : "false" },
      ...options.tip === void 0 ? {} : { tip: options.tip },
      on: { click: options.onClick }
    },
    options.badge === void 0 ? h("span", { class: "mb-badge", text: " " }) : h("span", { class: "mb-badge", text: options.badge }),
    h(
      "span",
      { class: "mb-listrow-main" },
      h("span", { class: "mb-listrow-name", text: options.name }),
      options.meta === void 0 ? null : h("span", { class: "mb-listrow-meta", text: options.meta })
    ),
    h("span", { class: "mb-row-acts" }, tags)
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
  essentials: "The handful of fields that decide what this thing is. Get these right and the rest can wait.",
  identity: "What it is called, what family it belongs to, and roughly where it sits.",
  combat: "What it does in a fight, or what it does when it is used.",
  traits: "Named properties. Ticking one is the safest kind of change: another mod ticking a different one keeps both.",
  references: "Fields that name another record. A name nothing defines is the single most common way a first mod fails.",
  generation: "How often and how deep the game will produce it on its own.",
  presentation: "The letter, the colour, and the words the player reads.",
  tables: "Fields that hold a list. Adding a row composes with other mods; replacing the list does not.",
  advanced: "Fields core uses rarely. Nothing here is wrong, it is just not where to start."
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
    blurb: "One record is one kind of thing that can be met, from a rat to something with a name.",
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
    blurb: "A one-of-a-kind version of an item the game already has. Adjustments, not a new thing.",
    badge: "*",
    essentials: ["name", "base-object", "level", "cost", "weight"],
    featured: true
  },
  {
    file: "ego_item",
    title: "Item qualities",
    blurb: "The of-Slay-Evil half of an item's name. Declares which kinds it can land on.",
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
        text: mode === "new" ? "The workshop will fill a new record in from the one you pick: its shape, its scale, and the values its neighbours in the game actually carry. It will not copy its attacks, its flags, its spells or anything else that would hand out powers you did not ask for." : "Your mod will ship the difference rather than the record, so the base game keeps owning it and two mods adjusting different fields of it both work."
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
    tip: "Three numbers with dots between them, like 0.1.0. Anything else is refused before the mod is even read.",
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
    tip: "The first time this mod is installed, the game records where it came from and refuses any later install that claims somewhere else. Leave it as the local address unless you actually own the repository you name.",
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
    tip: "Which builds of the game this was written against. A minimum rather than an exact version: a mod pinned to one release opts itself into a warning on every update. The workshop will not write a range that excludes the build you are running.",
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
  const derivedCard = card({ title: "Written for you", note: "from what you actually did", open: true });
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
      tip: "The same mod, as the text files it ships. Everything here is in them, and saving one puts what you wrote back into the mod. It is also the only way to add a script, a manifest key no screen offers, or a record file grouped into sections.",
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
    engine.setProblem(
      shop.api.satisfies(shop.seams.engine, current.engine) ? void 0 : `This range excludes the build you are running (${shop.seams.engine}), so you could not install what you are making.`
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
        ". A mod may only adjust a record whose owner it names, and a change that is refused for want of that costs you the change and not the mod, silently. So the workshop writes these down the moment you pick something to change."
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
        "The manifest above is real, and a mod that changes nothing changes nothing.",
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
      out.push({ ...where, message: "This block comment is never closed. It swallows everything after it." });
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
      out.push({ ...positionAt(text, i), message: `A closing ${ch} with nothing open to close.` });
      continue;
    }
    if (PARTNER[top.ch] !== ch) {
      out.push({
        ...positionAt(text, i),
        message: `A ${ch} closes the ${top.ch} opened on line ${positionAt(text, top.at).line}, which wanted ${PARTNER[top.ch]}.`
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
    "encoded": "IyBUdXRvcmlhbCAxOiBDaGFuZ2Ugb25lIHRoaW5nCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBkYWdnZXJzIHRoYXQgaGl0IGhhcmRlciBhbmQgY29zdCB0ZW4gdGltZXMgYXMgbXVjaC4KCioqV2hhdCB5b3UgbmVlZDoqKiBhIHRleHQgZWRpdG9yLiBUaGF0IGlzIHRoZSB3aG9sZSBsaXN0LiBObyBjb21waWxlciwgbm8KdG9vbGNoYWluLCBubyBhY2NvdW50LCBhbmQgbm8gY29weSBvZiB0aGUgZ2FtZSdzIHNvdXJjZSBjb2RlLgoKKipUaW1lOioqIGFib3V0IGZpdmUgbWludXRlcywgbW9zdCBvZiBpdCBmaW5kaW5nIHRoZSBNb2RzIG1lbnUuCgotLS0KCiMjIFRoZSB3aG9sZSBtb2QKCkEgbW9kIGlzIGEgZm9sZGVyLiBNYWtlIG9uZSBhbnl3aGVyZSB5b3UgbGlrZSwgY2FsbCBpdCBgbXktZmlyc3QtbW9kYCwgYW5kIHB1dAp0d28gZmlsZXMgaW4gaXQ6CgpgYGAKbXktZmlyc3QtbW9kLwogIG1hbmlmZXN0Lmpzb24KICBvYmplY3QuanNvbgpgYGAKCmBtYW5pZmVzdC5qc29uYCBzYXlzIHdobyB0aGUgbW9kIGlzLiBDb3B5IHRoaXMgZXhhY3RseToKCmBgYGpzb24KewogICJpZCI6ICJteS1maXJzdC1tb2QiLAogICJuYW1lIjogIk15IEZpcnN0IE1vZCIsCiAgInZlcnNpb24iOiAiMS4wLjAiLAogICJzaGFwZSI6ICJjb250ZW50IiwKICAiZW5naW5lIjogIj49MC4yMC4wIiwKICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20veW91L215LWZpcnN0LW1vZCIsCiAgImRlcGVuZGVuY2llcyI6IHsgImNvcmUiOiAiKiIgfSwKICAiZGVzY3JpcHRpb24iOiAiRGFnZ2VycyBoaXQgaGFyZGVyIGFuZCBjb3N0IG1vcmUuIgp9CmBgYAoKYHJlcG9zaXRvcnlgIGlzIHJlcXVpcmVkIGV2ZW4gZm9yIGEgbW9kIHlvdSBuZXZlciBwdWJsaXNoLiBJdCBpcyB0aGUgbW9kJ3MKaWRlbnRpdHkgYWNyb3NzIGV2ZXJ5IHdheSBvZiBnZXR0aW5nIGl0OiB0aGUgZ2FtZSBwaW5zIGFuIGluc3RhbGxlZCBtb2QgdG8gdGhlCnJlcG9zaXRvcnkgaXQgY2FtZSBmcm9tIGFuZCByZWZ1c2VzIGEgcmVwbGFjZW1lbnQgZnJvbSBhbnl3aGVyZSBlbHNlLCBzbyBhIG1vZAp0aGF0IG5hbWVzIG5vd2hlcmUgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IGFueXRoaW5nIGNsYWltaW5nIGl0cyBpZC4gUG9pbnQgaXQKd2hlcmV2ZXIgeW91IGludGVuZCB0byBwdWJsaXNoLCBvciB3aGVyZXZlciB5b3Ugd291bGQgaWYgeW91IGRpZC4KCmBvYmplY3QuanNvbmAgaXMgdGhlIGNoYW5nZToKCmBgYGpzb24KewogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpzd29yZC0tZGFnZ2VyIjogWwogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJhdHRhY2suaGQiLCAidmFsdWUiOiAiMWQ2IiB9LAogICAgICB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJjb3N0IiwgInZhbHVlIjogMzAwIH0KICAgIF0KICB9Cn0KYGBgCgpUaGF0IGlzIGEgY29tcGxldGUsIHdvcmtpbmcgbW9kLiBUd28gZmlsZXMsIHR3ZW50eSBsaW5lcy4KCiMjIFdoYXQgdGhvc2Ugc2l4IGxpbmVzIGFyZSBzYXlpbmcKCioqYG9iamVjdC5qc29uYCoqIGlzIHRoZSBuYW1lIG9mIG9uZSBvZiB0aGUgZ2FtZSdzIGRhdGEgZmlsZXMuIFRoZSBiYXNlIGdhbWUKc2hpcHMgYW4gYG9iamVjdC5qc29uYCBmdWxsIG9mIGV2ZXJ5IGl0ZW0gaW4gQW5nYmFuZCwgYW5kIHlvdXIgZmlsZSBjb250cmlidXRlcwp0byAqdGhhdCogZmlsZS4gSWYgeW91IHdhbnRlZCB0byBjaGFuZ2UgYSBtb25zdGVyIHlvdSB3b3VsZCB3cml0ZSBgbW9uc3Rlci5qc29uYAppbnN0ZWFkOyB0aGUgZmlsZSBuYW1lIGlzIGhvdyB0aGUgZ2FtZSBrbm93cyB3aGF0IHlvdSBhcmUgdGFsa2luZyBhYm91dC4KCioqYGNvcmU6c3dvcmQtLWRhZ2dlcmAqKiBuYW1lcyB0aGUgcmVjb3JkIHlvdSBhcmUgY2hhbmdpbmcuIFRoZSBgY29yZTpgIGhhbGYgc2F5cwp3aG9zZSByZWNvcmQgaXQgaXM6IHRoZSBiYXNlIGdhbWUncywgYXMgb3Bwb3NlZCB0byB5b3VycyBvciBhbm90aGVyIG1vZCdzLiBUaGUKcmVzdCBpcyB0aGUgZGFnZ2VyJ3MgaWRlbnRpdHkgd2l0aGluIGl0cyBmaWxlIC0gZm9yIGFuIG9iamVjdCwgaXRzIGB0eXBlYCBhbmQKaXRzIGBuYW1lYCBqb2luZWQgYnkgYC0tYC4gWW91IGRvIG5vdCBoYXZlIHRvIG1lbW9yaXNlIHRoZXNlOiB0eXBlIHlvdXIgYmVzdApndWVzcywgYW5kIGlmIGl0IGlzIHdyb25nIHRoZSBnYW1lIHRlbGxzIHlvdSAqd2hpY2ggcnVsZSBidWlsZHMgdGhlIHJlZiosIHNvIHlvdQpjYW4gd29yayBpdCBvdXQgZnJvbSB0aGUgcmVjb3JkIHlvdSB3ZXJlIGFpbWluZyBhdC4gSXQgZG9lcyBub3QgaGFuZCB5b3UgYSBsaXN0Cm9mIGNhbmRpZGF0ZXMsIGFuZCB0aGVyZSBpcyBubyAiZGlkIHlvdSBtZWFuIiBmb3IgcmVmcy4KCkEgcmVmIHRoYXQgcmVzb2x2ZXMgdG8gbm90aGluZyBjb3N0cyB5b3UgdGhhdCBvbmUgY29udHJpYnV0aW9uLCBub3QgdGhlIHdob2xlCm1vZDogdGhlIGdhbWUgc2tpcHMgaXQsIHJlcG9ydHMgaXQgb24geW91ciBtb2QncyByb3cgaW4gdGhlIG1vZCBtYW5hZ2VyLCBhbmQKbG9hZHMgZXZlcnl0aGluZyBlbHNlIHlvdSB3cm90ZS4KCioqYGZpZWxkUGF0Y2hlc2AqKiBpcyBhIGxpc3Qgb2Ygc21hbGwgZWRpdHMsIGVhY2ggbmFtaW5nIGEgcGF0aCBpbnRvIHRoZSByZWNvcmQKYW5kIGEgbmV3IHZhbHVlLiBgYXR0YWNrLmhkYCBpcyB0aGUgZGFtYWdlIGRpY2U7IGBjb3N0YCBpcyB0aGUgYmFzZSBwcmljZSBpbgpnb2xkLiBFdmVyeXRoaW5nIHlvdSBkbyBub3QgbWVudGlvbiBpcyBsZWZ0IGV4YWN0bHkgYXMgdGhlIGJhc2UgZ2FtZSBoYXMgaXQuClRoaXMgaXMgYSBjaGFuZ2UgdG8gdHdvIG51bWJlcnMsIG5vdCBhIHJlcGxhY2VtZW50IG9mIHRoZSBkYWdnZXIuCgoqKmAiZGVwZW5kZW5jaWVzIjogeyAiY29yZSI6ICIqIiB9YCoqIGlzIHlvdSBzYXlpbmcgIkkgYW0gbW9kaWZ5aW5nIHRoZSBiYXNlCmdhbWUncyBzdHVmZi4iIFdpdGhvdXQgaXQgdGhlIGdhbWUgcmVmdXNlcyB0aGUgcGF0Y2guIFRoYXQgaXMgZGVsaWJlcmF0ZTogYSBtb2QKbWF5IG9ubHkgY2hhbmdlIHJlY29yZHMgYmVsb25naW5nIHRvIHNvbWV0aGluZyBpdCBoYXMgZGVjbGFyZWQsIHNvIGEgbW9kIGNhbgpuZXZlciBxdWlldGx5IHJlYWNoIGludG8gYW5vdGhlciBtb2QgaXQgbmV2ZXIgbWVudGlvbmVkLgoKIyMgUnVubmluZyBpdAoKKipPbiB0aGUgZGVza3RvcCBidWlsZDoqKiBwdXQgeW91ciBgbXktZmlyc3QtbW9kYCBmb2xkZXIgaW50byB0aGUgYG1vZHMvYCBmb2xkZXIKdGhhdCBzaXRzIGJlc2lkZSB0aGUgZ2FtZSwgYW5kIHN0YXJ0IHRoZSBnYW1lLiBQcmVzcyBgRXNjYXBlYCwgY2hvb3NlICoqTW9kcyoqLApmaW5kICpNeSBGaXJzdCBNb2QqLCB0dXJuIGl0IG9uLCBhbmQgY2hvb3NlICoqQXBwbHkgY2hhbmdlcyBhbmQgcmVsb2FkKiouCgoqKkluIGEgYnJvd3NlcjoqKiBwcmVzcyBgRXNjYXBlYCwgY2hvb3NlICoqTW9kcyoqLCBjaG9vc2UgKipDaG9vc2UgYSBtb2RzCmZvbGRlci4uLioqLCBhbmQgcG9pbnQgaXQgYXQgdGhlIGZvbGRlciAqY29udGFpbmluZyogYG15LWZpcnN0LW1vZGAuIFRoZW4gdHVybiBpdApvbiBhbmQgcmVsb2FkIGFzIGFib3ZlLiBUaGUgZ2FtZSByZW1lbWJlcnMgdGhlIGZvbGRlciwgc28gZWRpdGluZyBhIGZpbGUgYW5kCnJlbG9hZGluZyB0aGUgcGFnZSBpcyB5b3VyIHdob2xlIGVkaXQtYW5kLXRlc3QgbG9vcC4KCiMjIFdoYXQgeW91IHNob3VsZCBzZWUKCkJ1eSBhIGRhZ2dlciBpbiB0aGUgKipXZWFwb24gU21pdGhzKiogKHRoZSBgM2Agb24gdGhlIHRvd24gbWFwKSAtIHRoYXQgaXMgdGhlCnNob3AgdGhhdCBzdG9ja3MgZGFnZ2Vycywgbm90IHRoZSBHZW5lcmFsIFN0b3JlLiBJdCBub3cgY29zdHMgYXJvdW5kIDMwMCBnb2xkCnJhdGhlciB0aGFuIGFyb3VuZCAzMC4gSW5zcGVjdCBpdCB3aXRoIGBJYCBhbmQgaXRzIGRhbWFnZSByZWFkcyBgMWQ2YC4gSGl0CnNvbWV0aGluZyB3aXRoIGl0IGFuZCBpdCBodXJ0cyBtb3JlLgoKVHVybiB0aGUgbW9kIG9mZiBhbmQgY2hvb3NlICoqQXBwbHkgY2hhbmdlcyBhbmQgcmVsb2FkKiosIGFuZCBkYWdnZXJzIGFyZQpvcmRpbmFyeSBhZ2Fpbi4gVGhhdCBpcyB0aGUgcGFydCB3b3J0aCBwYXVzaW5nIG9uOiB5b3VyIGNoYW5nZSBpcyBhIGxheWVyIG92ZXIKdGhlIGJhc2UgZ2FtZSwgbm90IGFuIGVkaXQgdG8gaXQuIE5vdGhpbmcgb24geW91ciBtYWNoaW5lIHdhcyBtb2RpZmllZCwgYW5kIHRoZQpnYW1lIHVuZGVybmVhdGggaXMgc3RpbGwgdGhlIHZhbmlsbGEgb25lLgoKIyMgVHJ5IGNoYW5naW5nIHRoaXMKCi0gTWFrZSB0aGUgZGFnZ2VyICoqbGlnaHRlcioqOiBhZGQgYHsgIm9wIjogInNldCIsICJwYXRoIjogIndlaWdodCIsICJ2YWx1ZSI6IDQgfWAuCi0gQ2hhbmdlIGEgKiptb25zdGVyKiogaW5zdGVhZC4gQWRkIGEgYG1vbnN0ZXIuanNvbmAgd2l0aAogIGB7ICJmaWVsZFBhdGNoZXMiOiB7ICJjb3JlOnNvbGRpZXItYW50IjogWyB7ICJvcCI6ICJzZXQiLCAicGF0aCI6ICJoaXQtcG9pbnRzIiwgInZhbHVlIjogNjAgfSBdIH0gfWAKICBhbmQgbWVldCBhIHZlcnkgdW5yZWFzb25hYmxlIGFudCBvbiBsZXZlbCAxLgotIEJyZWFrIGl0IG9uIHB1cnBvc2UuIENoYW5nZSBgY29yZTpzd29yZC0tZGFnZ2VyYCB0byBgY29yZTpzd29yZC0tZGFnZ2VycmAgYW5kCiAgcmVsb2FkLiBSZWFkIHRoZSBlcnJvcjogdGhhdCBtZXNzYWdlIGlzIHlvdXIgbWFpbiBkZWJ1Z2dpbmcgdG9vbCwgYW5kIGl0IGlzCiAgd29ydGggc2VlaW5nIG9uY2Ugd2hpbGUgeW91IGFscmVhZHkga25vdyB3aGF0IGlzIHdyb25nLgoKIyMgVGhlIGZpbmlzaGVkIHZlcnNpb24KCmBzYW1wbGVzL3R1dG9yaWFscy90dXRvcmlhbC0wMS10d2Vhay1hLXZhbHVlL2AgaW4gdGhpcyByZXBvc2l0b3J5IGlzIGV4YWN0bHkgdGhpcyBtb2QuCkl0IGlzIG5vdCBhIGNvcHkgb2YgdGhlIHR1dG9yaWFsLiBJdCBpcyBhIG1vZCB0aGF0IGdldHMgbG9hZGVkIGFuZCBjaGVja2VkCmFnYWluc3QgdGhlIHJlYWwgZ2FtZSBkYXRhIG9uIGV2ZXJ5IHRlc3QgcnVuLCBzbyBpZiBhbnl0aGluZyBvbiB0aGlzIHBhZ2UgZXZlcgpzdG9wcyBiZWluZyB0cnVlLCB0aGUgYnVpbGQgZmFpbHMuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgMjogQWRkIGFuIGl0ZW1dKDAyLWFkZC1hbi1pdGVtLm1kKSwgdGhlIHNhbWUgaWRlYSwgYnV0CmNyZWF0aW5nIHNvbWV0aGluZyB0aGUgZ2FtZSBoYXMgbmV2ZXIgc2VlbiBpbnN0ZWFkIG9mIGFkanVzdGluZyBzb21ldGhpbmcgaXQKaGFzLgo="
  },
  {
    "id": "tutorial-02",
    "path": "tutorials/02-add-an-item.md",
    "audience": "beginner",
    "title": "2. Add an item",
    "note": "Make a record the base game has never seen.",
    "encoded": "IyBUdXRvcmlhbCAyOiBBZGQgYW4gaXRlbQoKKipXaGF0IHlvdSB3aWxsIG1ha2U6Kiogb25lIG5ldyBwaWVjZSBvZiBhcm1vdXIgdGhlIGJhc2UgZ2FtZSBoYXMgbmV2ZXIgaGVhcmQKb2YsIGZpbmRhYmxlIGluIHRoZSBkdW5nZW9uIGFuZCBidXlhYmxlIGluIHRvd24uCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCAxXSgwMS10d2Vhay1hLXZhbHVlLm1kKSwgd2hpY2ggZXhwbGFpbnMgd2hhdCBhIG1vZApmb2xkZXIgaXMgYW5kIGhvdyB0byBsb2FkIG9uZS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCi0tLQoKIyMgVGhlIHdob2xlIG1vZAoKYGBgCm15LWl0ZW0tbW9kLwogIG1hbmlmZXN0Lmpzb24KICBvYmplY3QuanNvbgpgYGAKCmBtYW5pZmVzdC5qc29uYCwgc2FtZSBzaGFwZSBhcyBsYXN0IHRpbWUsIGRpZmZlcmVudCBpZDoKCmBgYGpzb24KewogICJpZCI6ICJteS1pdGVtLW1vZCIsCiAgIm5hbWUiOiAiTXkgSXRlbSBNb2QiLAogICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAic2hhcGUiOiAiY29udGVudCIsCiAgImVuZ2luZSI6ICI+PTAuMjAuMCIsCiAgImF1dGhvciI6ICJ5b3VyIG5hbWUiLAogICJsaWNlbnNlIjogIkdQTC0yLjAtb25seSIsCiAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3lvdS9teS1pdGVtLW1vZCIsCiAgImRlcGVuZGVuY2llcyI6IHsgImNvcmUiOiAiKiIgfSwKICAiZGVzY3JpcHRpb24iOiAiQWRkcyBhIHBhZGRlZCBqZXJraW4uIgp9CmBgYAoKYG9iamVjdC5qc29uYDoKCmBgYGpzb24KewogICJyZWNvcmRzIjogWwogICAgewogICAgICAibmFtZSI6ICJQYWRkZWQgSmVya2lufiIsCiAgICAgICJ0eXBlIjogInNvZnQgYXJtb3IiLAogICAgICAiZ3JhcGhpY3MiOiB7ICJnbHlwaCI6ICIoIiwgImNvbG9yIjogIlUiIH0sCiAgICAgICJsZXZlbCI6IDEsCiAgICAgICJ3ZWlnaHQiOiA2MCwKICAgICAgImNvc3QiOiAxMiwKICAgICAgImFsbG9jIjogeyAiY29tbW9uIjogMjAsICJtaW5tYXgiOiAiMSB0byA0MCIgfSwKICAgICAgImF0dGFjayI6IHsgImhkIjogIjBkMCIsICJ0by1oIjogIjAiLCAidG8tZCI6ICIwIiB9LAogICAgICAiYXJtb3IiOiB7ICJhYyI6IDUsICJ0by1hIjogIjAiIH0sCiAgICAgICJkZXNjIjogWyJBIHF1aWx0ZWQgamFja2V0IHN0dWZmZWQgd2l0aCB3b29sLiBJdCBpcyB3YXJtLCBhbmQgdmVyeSBzbGlnaHRseSBwcm90ZWN0aXZlLiJdCiAgICB9CiAgXQp9CmBgYAoKIyMgV2hhdCBjaGFuZ2VkIGZyb20gVHV0b3JpYWwgMQoKT25lIHdvcmQ6IGByZWNvcmRzYCBpbnN0ZWFkIG9mIGBmaWVsZFBhdGNoZXNgLgoKYGZpZWxkUGF0Y2hlc2AgZWRpdHMgc29tZXRoaW5nIHRoYXQgYWxyZWFkeSBleGlzdHMuIGByZWNvcmRzYCAqKmFkZHMqKiBzb21ldGhpbmcsCmFuZCB5b3VyIG1vZCBvd25zIHdoYXQgaXQgYWRkcy4gRXZlcnl0aGluZyBlbHNlIHlvdSBsZWFybmVkIHN0aWxsIGFwcGxpZXM6IHNhbWUKZm9sZGVyLCBzYW1lIG1hbmlmZXN0LCBzYW1lIHdheSBvZiBsb2FkaW5nIGl0LgoKIyMgUmVhZGluZyB0aGUgcmVjb3JkCgpNb3N0IG9mIGl0IGlzIEFuZ2JhbmQncyBvd24gdm9jYWJ1bGFyeSByYXRoZXIgdGhhbiBhbnl0aGluZyB0aGlzIHByb2plY3QKaW52ZW50ZWQsIHdoaWNoIG1lYW5zIHRoZSBiYXNlIGdhbWUncyBvd24gZGF0YSBpcyB5b3VyIHJlZmVyZW5jZSBtYW51YWwuIElmIHlvdQp3YW50IHRvIGtub3cgd2hhdCBhIGZpZWxkIGRvZXMsIGZpbmQgYW4gaXRlbSB0aGF0IGFscmVhZHkgZG9lcyBpdCBhbmQgY29weSBob3cKaXQgc2F5cyBzby4KCi0gKipgbmFtZWAqKjogdGhlIHRyYWlsaW5nIGB+YCBpcyB3aGVyZSB0aGUgcGx1cmFsIGdvZXMuICJQYWRkZWQgSmVya2lufiIKICBkaXNwbGF5cyBhcyAqYSBQYWRkZWQgSmVya2luKiBhbmQgKjIgUGFkZGVkIEplcmtpbnMqLiBBbiBpdGVtIHdob3NlIG5hbWUgc3RhcnRzCiAgd2l0aCBgJmAgKGAiJiBEYWdnZXJ+ImApIHRha2VzIGFuIGFydGljbGUuIFRoZXNlIG1hcmtzIGFyZSB0aGUgb3JpZ2luYWwgZ2FtZSdzCiAgY29udmVudGlvbiwgYW5kIHRoZXkgYXJlIHdoeSB5b3Ugc2hvdWxkIGNvcHkgYW4gZXhpc3RpbmcgbmFtZSdzIHB1bmN0dWF0aW9uCiAgcmF0aGVyIHRoYW4gaW52ZW50IGl0LgotICoqYHR5cGVgKio6IHdoaWNoIGtpbmQgb2YgaXRlbSB0aGlzIGlzLiBgc29mdCBhcm1vcmAgcHV0cyBpdCBpbiB0aGUgYm9keQogIGFybW91ciBzbG90IGFuZCBpbiB0aGUgYXJtb3VyeSdzIHN0b2NrLiBVc2Ugb25lIHRoZSBnYW1lIGFscmVhZHkgaGFzOwogIFtUdXRvcmlhbCA0XSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkncyBmb2xsb3ctb24gcmVhZGluZyBjb3ZlcnMgaW52ZW50aW5nIGEKICB3aG9sbHkgbmV3IGl0ZW0gY2xhc3MuCi0gKipgbGV2ZWxgKio6IHRoZSBkZXB0aCBhdCB3aGljaCBpdCBzdGFydHMgYXBwZWFyaW5nLgotICoqYGFsbG9jYCoqOiBob3cgb2Z0ZW4sIGFuZCBiZXR3ZWVuIHdoaWNoIGRlcHRocy4gYGNvbW1vbjogMjBgIGlzIHJvdWdobHkgdGhlCiAgZnJlcXVlbmN5IG9mIG9yZGluYXJ5IGVhcmx5IGdlYXI7IGAiMSB0byA0MCJgIGlzIHRoZSBkZXB0aCB3aW5kb3cuCi0gKipgYXJtb3IuYWNgKio6IHRoZSBhcm1vdXIgaXQgZ2l2ZXMuIFNvZnQgTGVhdGhlciBBcm1vdXIgaGFzIDggYW5kIGNvc3RzIDIwLAogIHNvIDUgZm9yIDEyIGdvbGQgaXMgYSBkZWxpYmVyYXRlbHkgd29yc2UsIGNoZWFwZXIgb3B0aW9uLgotICoqYGRlc2NgKio6IGFuIGFycmF5IG9mIGxpbmVzLCBzaG93biB3aGVuIHRoZSBwbGF5ZXIgaW5zcGVjdHMgaXQuCgoqKldoZXJlIHRvIGdldCB0aGUgbnVtYmVycy4qKiBPcGVuIGBwYWNrYWdlcy9jb250ZW50L3BhY2svb2JqZWN0Lmpzb25gIGluIHRoaXMKcmVwb3NpdG9yeSBhbmQgZmluZCBhbiBpdGVtIGxpa2UgdGhlIG9uZSB5b3Ugd2FudC4gVGhhdCBmaWxlIGlzIHRoZSBiYXNlIGdhbWUncwpvd24gZGF0YSwgaW4gZXhhY3RseSB0aGUgZm9ybWF0IHlvdXIgbW9kIHdyaXRlcywgc28gdGhlIG5lYXJlc3QgZXhpc3RpbmcgaXRlbSBpcwphbHdheXMgYSB3b3JraW5nIHRlbXBsYXRlLiBUaGVyZSBpcyBhbHNvIGEgaGVscGVyIHRoYXQgZG9lcyB0aGlzIGZvciB5b3U6CmBkcmFmdFJlY29yZGAgZmlsbHMgaW4gYSBuZXcgcmVjb3JkIGZyb20gdGhlIGdhbWUncyBjb21wYXJhYmxlIHJlY29yZHMsIGluY2x1ZGluZwphIHNlbnNpYmxlIHByaWNlLiBTZWUgW0FVVEhPUklORy5tZF0oLi4vQVVUSE9SSU5HLm1kKS4KCiMjIFdoYXQgeW91IHNob3VsZCBzZWUKCllvdXIgaXRlbSBleGlzdHMgaW4gdGhlIGdhbWUgYXMgc29vbiBhcyB0aGUgbW9kIGlzIG9uOiBpdCBnZW5lcmF0ZXMgaW4gdGhlCmR1bmdlb24gaW5zaWRlIGl0cyBvd24gZGVwdGggd2luZG93LCBtb25zdGVycyBjYW4gYmUgY2Fycnlpbmcgb25lLCBhbmQgd2VhcmluZyBpdApyYWlzZXMgeW91ciBhcm1vdXIgY2xhc3MgYnkgNS4gQ29uZmlybSBpdCB0aGUgcXVpY2sgd2F5IHdpdGggd2l6YXJkIG1vZGUsIG9yIGRpdmUKdW50aWwgb25lIGRyb3BzLgoKKipObyBzaG9wIHN0b2NrcyBpdCB5ZXQqKiwgYW5kIHRoYXQgaXMgbm90IGEgYnVnIGluIHlvdXIgbW9kIC0gYSBzaG9wJ3Mgc3RvY2sKY29tZXMgZnJvbSB0aGF0IHNob3AncyBvd24gdGFibGUsIGFuZCBub3RoaW5nIGhhcyBwdXQgeW91ciBpdGVtIGluIG9uZS4gVGhlCnNlY3Rpb24gYmVsb3cgZG9lcyB0aGF0LgoKWW91ciBpdGVtIGlzIGBteS1pdGVtLW1vZDpzb2Z0LWFybW9yLS1wYWRkZWQtamVya2luYCBhcyBmYXIgYXMgdGhlIGdhbWUgaXMKY29uY2VybmVkLiBBbiBgb2JqZWN0YCByZWNvcmQncyBpZGVudGl0eSBpcyBpdHMgYHR5cGVgIGFuZCBpdHMgYG5hbWVgIGpvaW5lZCBieQpgLS1gLCB3aGljaCBpcyB3aHkgdGhlIHJlZiBpcyBub3Qgc2ltcGx5IHRoZSBuYW1lIC0gYW5kIGl0IGlzIHRoZSBzYW1lIHJ1bGUgdGhhdAptYWRlIHR1dG9yaWFsIDEncyBkYWdnZXIgYGNvcmU6c3dvcmQtLWRhZ2dlcmAuIFRoZSBgbXktaXRlbS1tb2Q6YCBoYWxmIGlzIHlvdXIKb3duIG5hbWVzcGFjZSwgc28geW91ciBpdGVtIGNhbiBuZXZlciBjb2xsaWRlIHdpdGggdGhlIGJhc2UgZ2FtZSdzIG9yIHdpdGgKYW5vdGhlciBtb2QncywgZXZlbiBpZiB5b3UgYm90aCBhZGQgYSBQYWRkZWQgSmVya2luLgoKIyMgVHJ5IGNoYW5naW5nIHRoaXMKCi0gTWFrZSBpdCAqKmN1cnNlZC1jaGVhcCBhbmQgaGVhdnkqKjogYHdlaWdodGAgMjAwLCBgY29zdGAgMi4KLSBNYWtlIGl0ICoqcmFyZSBhbmQgZGVlcCoqOiBgbGV2ZWxgIDMwLCBgYWxsb2NgIGB7ICJjb21tb24iOiAzLCAibWlubWF4IjogIjMwIHRvIDEwMCIgfWAuCi0gQWRkIGEgKipzZWNvbmQgaXRlbSoqIGluIHRoZSBzYW1lIGByZWNvcmRzYCBhcnJheS4gQSBtb2QgY2FuIGFkZCBhcyBtYW55IGFzIGl0CiAgbGlrZXM7IHRoZSBhcnJheSBpcyBhIGxpc3QuCi0gR2l2ZSBpdCBhbiAqKmVnbyoqIHBvc3NpYmlsaXR5LCBvciBhIGZsYWcuIEZpbmQgYW4gaXRlbSBpbiB0aGUgYmFzZSBnYW1lJ3MKICBgb2JqZWN0Lmpzb25gIHRoYXQgaGFzIHRoZSBwcm9wZXJ0eSB5b3Ugd2FudCBhbmQgY29weSB0aGUgZmllbGQgYWNyb3NzLgoKIyMgV2hhdCB5b3VyIGl0ZW0gam9pbnMgYXV0b21hdGljYWxseQoKVGhpcyBpcyB0aGUgcGFydCB3b3J0aCBrbm93aW5nLCBiZWNhdXNlIGl0IGlzIHRoZSBwYXJ0IHlvdSBkbyBub3QgaGF2ZSB0byBidWlsZC4KWW91ciBQYWRkZWQgSmVya2luIGlzIGEgc29mdCBhcm1vdXIsIGFuZCB0aGUgZ2FtZSB0cmVhdHMgaXQgYXMgb25lIGV2ZXJ5d2hlcmU6CgotICoqRWdvcywgcnVuZXMgYW5kIGJyYW5kcyBhcHBseSB0byBpdC4qKiBBbiBlZ28gZGVjbGFyZXMgdGhlICpraW5kcyogb2YgaXRlbSBpdAogIGNhbiBsYW5kIG9uLCBub3QgYSBsaXN0IG9mIG5hbWVkIG9uZXM6ICJvZiBSZXNpc3QgQWNpZCIgc2F5cyBgc29mdCBhcm1vcmAsIHNvCiAgaXQgc2F5cyB5b3VyIGplcmtpbiB0b28uIEEgKipQYWRkZWQgSmVya2luIG9mIFJlc2lzdCBGaXJlKiogaXMgYSB0aGluZyBhIHBsYXllcgogIGNhbiBmaW5kLCBhbmQgbm9ib2R5IGhhZCB0byBhZGQgaXQgdG8gYSBsaXN0LgotICoqUXVhbGl0eSBlbmNoYW50bWVudCBhcHBsaWVzLioqIEl0IGNhbiB0dXJuIHVwIGFzIGBbNSwrNl1gLCBhbmQgaXRzIHByaWNlIGlzCiAgcmVjb21wdXRlZCBmcm9tIHdoYXQgaXQgZW5kZWQgdXAgYmVpbmcgcmF0aGVyIHRoYW4gZnJvbSB0aGUgYGNvc3RgIHlvdSB3cm90ZS4KLSAqKkl0IGlzIGdlbmVyYXRlZCBpbiB0aGUgZHVuZ2VvbioqIGF0IHRoZSBkZXB0aHMgeW91ciBgYWxsb2NgIG5hbWVzLCBhbmQgaXQgaXMKICBpbiB0aGUgZHJvcCB0YWJsZXMgZnJvbSB0aGUgbW9tZW50IHRoZSBtb2QgaXMgb24uCi0gKipTaG9wcyB3aWxsIGJ1eSBpdCwqKiBiZWNhdXNlIGEgc2hvcCdzIGJ1eSBsaXN0IGlzIGJ5IGl0ZW0ga2luZCB0b28uCgojIyBPbmUgdGhpbmcgdGhhdCBkb2VzIE5PVCBoYXBwZW46IGEgcGljdHVyZQoKSW4gQVNDSUkgeW91ciBqZXJraW4gZHJhd3Mgd2l0aCBpdHMgY2xhc3MncyBvd24gc3ltYm9sIGFuZCBuZWVkcyBub3RoaW5nIGZyb20geW91LgoqKkluIHRpbGUgbW9kZSBpdCBoYXMgbm8gcGljdHVyZSBhbmQgdGhlIGdhbWUgd2lsbCBub3QgaW52ZW50IG9uZS4qKiBBIHRpbGUgc2V0Cm1hcHMgKm5hbWVkKiBpdGVtcyB0byBwaWN0dXJlcyBhbmQgaGFzIG5ldmVyIGhlYXJkIG9mIHlvdXJzLCBzbyBhIHBsYXllciBpbiB0aWxlCm1vZGUgc2VlcyBhIGxldHRlciBhbW9uZyBwaWN0dXJlcy4gVGhlIGdhbWUgdXNlZCB0byBndWVzcyAtIGl0IGRyZXcgYW4gYWRkZWQgaXRlbQp3aXRoIHRoZSB0aWxlIG9mIGFub3RoZXIgaXRlbSBzaGFyaW5nIGl0cyBgdHZhbGAgLSBhbmQgdGhhdCBndWVzcyB3YXMgcmVtb3ZlZCBpbgowLjIzLjA6IEFuZ2JhbmQgNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYW4gaXRlbSBhIG1vZCBhZGRlZCwgc28gaXQgaGFzIG5vIG9waW5pb24KYWJvdXQgd2hhdCBvbmUgc2hvdWxkIGxvb2sgbGlrZSwgYW5kIG1ha2luZyB0aGF0IGNhbGwgb24gYmVoYWxmIG9mIHNvbWVib2R5J3MgYXJ0CmlzIHRoZSB0aWxlIHNldCdzIGpvYiByYXRoZXIgdGhhbiB0aGUgcG9ydCdzLgoKU28gaWYgeW91IHNoaXAgY29udGVudCwgc2hpcCB0aWxlcyBmb3IgaXQsIGFuZCBpZiB5b3UgZG8gbm90LCBzYXkgc28gaW4geW91ciBtb2QncwpkZXNjcmlwdGlvbiBhbmQgcG9pbnQgcGxheWVycyBhdCBhIHRpbGUgbW9kIHRoYXQgZmlsbHMgYmxhbmtzOgoKPiBObyB0aWxlcyBvZiBpdHMgb3duOiBpbiB0aWxlIG1vZGUgdGhlIFBhZGRlZCBKZXJraW4gZHJhd3MgYXMgYSBsZXR0ZXIuIEluc3RhbGwKPiBbbGlub2xldW1dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1saW5vbGV1bSkgYW5kIGl0IGlzCj4gZHJhd24gZnJvbSBhbm90aGVyIGl0ZW0gb2YgaXRzIHR5cGUgaW5zdGVhZC4KCkxpbm9sZXVtIGRyYXdzIGFuIGFkZGVkIGl0ZW0gZnJvbSBhIGtpbmQgc2hhcmluZyBpdHMgYHR2YWxgLCB3aXRoIHRoZSBjb2xvdXIKdHVybmVkLCB1bmRlciBpdHMgb3duIHRpbGUgcGFja3MuIFVuZGVyIEFuZ2JhbmQncyBvd24gdGlsZSBzaGVldHMgYW4gYWRkZWQgaXRlbQprZWVwcyBpdHMgbGV0dGVyLCBiZWNhdXNlIHRob3NlIHNoZWV0cyBhcmUgYSBmaXhlZCBncmlkIHdpdGggbm8gc3BhcmUgY2VsbCBmb3IgYQp2YXJpYW50LiAqKkRvIG5vdCBtYWtlIGl0IGEgZGVwZW5kZW5jeToqKiB5b3VyIG1vZCBpcyBjb21wbGV0ZSBpbiBBU0NJSSB3aXRoIG5vCnRpbGUgc2V0IGF0IGFsbCwgYW5kIGEgcGxheWVyIHVzaW5nIGEgZGlmZmVyZW50IHNldCBzaG91bGQgbm90IGhhdmUgdG8gaW5zdGFsbCBvbmUKdGhleSB3aWxsIG5vdCBsb29rIGF0LgoKIyMgUHV0dGluZyBpdCBpbiBhIHNob3AKCk9uZSB0aGluZyBkb2VzIG5vdCBoYXBwZW4gb24gaXRzIG93bjogYSBzaG9wIHdpbGwgbm90ICoqc3RvY2sqKiB5b3VyIGl0ZW0uIFRoYXQKaXMgdHJ1ZSBvZiB0aGUgb3JpZ2luYWwgZ2FtZSB0b286IGEgc3RvcmUncyBzdG9jayBsaXN0IG5hbWVzIHNwZWNpZmljIGl0ZW1zLCBzbwphIG5ldyBvbmUgaGFzIHRvIGJlIHB1dCBvbiB0aGUgbGlzdC4KCkFkZGluZyBhIGxpbmUgdG8gYSBsaXN0IGlzIG9uZSBvcC4gTWFrZSBhIGBzdG9yZS5qc29uYCBiZXNpZGUgeW91ciBgb2JqZWN0Lmpzb25gOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN0b3JlLWFybW9yIjogWwogICAgICB7CiAgICAgICAgIm9wIjogImFwcGVuZCIsCiAgICAgICAgInBhdGgiOiAibm9ybWFsIiwKICAgICAgICAidmFsdWVzIjogW3sgInR2YWwiOiAic29mdCBhcm1vciIsICJzdmFsIjogIlBhZGRlZCBKZXJraW4iIH1dCiAgICAgIH0KICAgIF0KICB9Cn0KYGBgCgpSZXN0YXJ0LCB3YWxrIGludG8gdGhlIEFybW91cnksIGFuZCB5b3VyIGplcmtpbiBpcyBpbiB0aGUgcm90YXRpb24gd2l0aApldmVyeXRoaW5nIGVsc2UsIHNvbWV0aW1lcyBpbiBzdG9jaywgc29tZXRpbWVzIG5vdCwgYXQgd2hhdGV2ZXIgZW5jaGFudG1lbnQgdGhlCnN0b3JlIHJvbGxlZCwgcHJpY2VkIGZyb20gd2hhdCBpdCB0dXJuZWQgb3V0IHRvIGJlLiBUaGUgc3RvY2sgcm9sbCBwaWNrcyBmcm9tIHRoZQpzdG9yZSdzIG93biB0YWJsZSBhbmQgZG9lcyBub3QgY29uc3VsdCB5b3VyIGl0ZW0ncyBgYWxsb2NgIHdpbmRvdywgc28gYSBzaG9wIGNhbgpvZmZlciBpdCBhdCBhbnkgZGVwdGg7IGBhbGxvY2AgZ292ZXJucyB3aGVyZSBpdCBnZW5lcmF0ZXMgaW4gdGhlIGR1bmdlb24uCgpUaHJlZSB0aGluZ3Mgd29ydGgga25vd2luZyBhYm91dCB0aGF0IHBhdGNoOgoKLSAqKmBjb3JlOnN0b3JlLWFybW9yYCoqIGlzIHRoZSBzdG9yZSdzIHJlY29yZCBpZDogaXRzIGNvZGUsIGBTVE9SRV9BUk1PUmAsCiAgbG93ZXJjYXNlZCB3aXRoIGBfYCB0dXJuZWQgaW50byBgLWAuIFRoYXQgcnVsZSBpcyB0aGUgU1RPUkUgZmlsZSdzLCBub3QgYQogIHVuaXZlcnNhbCBvbmUgLSBlYWNoIGRhdGEgZmlsZSBkZWNsYXJlcyB3aGF0IGlkZW50aWZpZXMgaXRzIHJlY29yZHMsIGFuZCB0aGUKICB0YWJsZSBvZiB0aGVtIGlzIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9yZWNvcmQta2V5LnRzYC4gTW9zdCBmaWxlcyB1c2UgYG5hbWVgOwogIGBvYmplY3RgIHVzZXMgYHR5cGVgIHBsdXMgYG5hbWVgOyBgYnJhbmRgLCBgc2xheWAgYW5kIGBwcm9qZWN0aW9uYCB1c2UgYGNvZGVgOwogIGBjb25zdGFudHNgIGFuZCBgdmlzdWFsc2AgaGF2ZSBvbmUgcmVjb3JkIGVhY2ggYW5kIGFyZSBuYW1lZCBieSB0aGUgZmlsZS4KLSAqKmBub3JtYWxgIGlzIHRoZSAibWF5IHN0b2NrIiB0YWJsZTsgYGFsd2F5c2AgaXMgdGhlIHN0YXBsZXMuKiogQXBwZW5kaW5nIHRvCiAgYGFsd2F5c2AgbWVhbnMgYSBzaG9wIGtlZXBzIG9uZSBvbiB0aGUgc2hlbGYgYXQgYWxsIHRpbWVzLCB3aGljaCBmb3IgbW9zdAogIGl0ZW1zIGlzIG5vdCB3aGF0IHlvdSB3YW50IC0gYW5kIG5vdGUgdGhlIEFybW91cnkgc2hpcHMgbm8gYGFsd2F5c2AgbGlzdCBhdAogIGFsbCwgc28gYXBwZW5kaW5nIHRvIG9uZSB0aGVyZSBoYXMgbm90aGluZyB0byBhcHBlbmQgdG8gYW5kIGlzIHJlcG9ydGVkIHJhdGhlcgogIHRoYW4gd29ya2luZyBxdWlldGx5LgotICoqYHN2YWxgIGlzIHRoZSBpdGVtJ3MgbmFtZSB3aXRob3V0IHRoZSBgfmAuKiogSWYgaXQgZG9lcyBub3QgbWF0Y2ggYW4gaXRlbQogIHRoYXQgZXhpc3RzLCB0aGUgZ2FtZSBkcm9wcyB0aGF0IG9uZSBsaW5lIGZyb20gdGhlIHNob3AncyB0YWJsZSBhbmQgcmVwb3J0cyBpdAogIGFnYWluc3QgeW91ciBtb2QgaW4gdGhlIG1vZCBtYW5hZ2VyLCBzbyBhIHR5cG8gY29zdHMgeW91IGEgbGluZSBhbmQgdGVsbHMgeW91CiAgd2hpY2ggb25lLCByYXRoZXIgdGhhbiBiZWluZyBzaWxlbnQgb3IgdGFraW5nIHRoZSBnYW1lIGRvd24gd2l0aCBpdC4KCioqYGFwcGVuZGAgaXMgd2h5IHR3byBzaG9wIG1vZHMgY2FuIGNvZXhpc3QuKiogSXQgYWRkcyB0byB0aGUgbGlzdCByYXRoZXIgdGhhbgpyZXN0YXRpbmcgaXQsIHNvIGNvcmUncyBvd24gZWlnaHRlZW4gZW50cmllcyBzdGF5LCBhbmQgYSBzZWNvbmQgbW9kIGFwcGVuZGluZyB0bwp0aGUgc2FtZSBzdG9yZSBrZWVwcyBpdHMgZW50cnkgdG9vLiBOb2JvZHkgaGFzIHRvIGNvcHkgYSBsaXN0IG91dCBvZiB0aGUgYmFzZQpnYW1lJ3MgZGF0YSBhbmQgd2F0Y2ggaXQgZ28gc3RhbGUuIEl0cyBjb3VudGVycGFydCBpcyBgcmVtb3ZlVmFsdWVgLCB3aGljaCBkcm9wcwphbiBlbnRyeSwgYW5kIHRoYXQgb25lICpjYW4qIHRha2Ugb3V0IHNvbWV0aGluZyBhbm90aGVyIG1vZCBhZGRlZCwgc28gdGhlIGdhbWUKcmVwb3J0cyBpdCBhcyBhIGNvbmZsaWN0IGFuZCB0aGUgbW9kIHRoYXQgbG9hZHMgbGFzdCB3aW5zLgoKVGhlcmUgaXMgb25lIHdyaW5rbGU6IHlvdXIgYHN0b3JlLmpzb25gIG5hbWVzIHlvdXIgaXRlbSwgc28gaXQgb25seSBtYWtlcyBzZW5zZQp3aGlsZSB5b3VyIGBvYmplY3QuanNvbmAgaXMgYWxzbyBsb2FkZWQuIEtlZXAgYm90aCBpbiB0aGUgc2FtZSBtb2QsIHdoaWNoIGlzIHdoYXQKdGhpcyB0dXRvcmlhbCBkb2VzLiBJZiB5b3UgZG8gc3BsaXQgdGhlbSAoYSBzaG9wIG1vZCB0aGF0IHN0b2NrcyBhbm90aGVyIG1vZCdzCml0ZW0gaXMgYSBwZXJmZWN0bHkgcmVhc29uYWJsZSB0aGluZyB0byB3cml0ZSksIHRoZW4gdGhlIGRheSB0aGUgb3RoZXIgbW9kIGlzCnR1cm5lZCBvZmYsIHlvdXIgYXBwZW5kZWQgbGluZSBuYW1lcyBub3RoaW5nLiBUaGUgc2hvcCBsb3NlcyB0aGF0IGxpbmUsIHRoZSBtb2QKbWFuYWdlciBzYXlzIHNvIG9uIHlvdXIgbW9kJ3Mgcm93LCBhbmQgZXZlcnl0aGluZyBlbHNlIGluIHRoZSBBcm1vdXJ5IGlzIGV4YWN0bHkKYXMgaXQgd2FzLiBEZWNsYXJlIHRoZSBvdGhlciBtb2QgaW4geW91ciBgZGVwZW5kZW5jaWVzYCBzbyB0aGUgcGxheWVyIGlzIHRvbGQKYmVmb3JlIHRoZXkgZ2V0IHRoZXJlLgoKIyMgVGhlIGZpbmlzaGVkIHZlcnNpb24KCmBzYW1wbGVzL3R1dG9yaWFscy90dXRvcmlhbC0wMi1hZGQtYW4taXRlbS9gLCB3aGljaCBpcyBsb2FkZWQgYW5kIGNvbXBvc2VkIGFnYWluc3QgdGhlCnJlYWwgZ2FtZSBkYXRhIG9uIGV2ZXJ5IHRlc3QgcnVuLgoKLS0tCgoqKk5leHQ6KiogW1R1dG9yaWFsIDM6IEFkZCBhIG1vbnN0ZXJdKDAzLWFkZC1hLW1vbnN0ZXIubWQpLCB0aGUgc2FtZSBtb3ZlIGluIGEKZGlmZmVyZW50IGZpbGUsIGFuZCB0aGUgb25lIGdvdGNoYSB0aGF0IG5vIGVycm9yIG1lc3NhZ2Ugd2lsbCBjYXRjaCBmb3IgeW91Lgo="
  },
  {
    "id": "tutorial-03",
    "path": "tutorials/03-add-a-monster.md",
    "audience": "beginner",
    "title": "3. Add a monster",
    "note": "Build the same idea in another record file.",
    "encoded": "IyBUdXRvcmlhbCAzOiBBZGQgYSBtb25zdGVyCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBhIGNhcnBlbnRlciBhbnQsIGEgc2xpZ2h0bHkgbmFzdGllciBjb3VzaW4gb2YgdGhlCnNvbGRpZXIgYW50LCBsaXZpbmcgb24gZHVuZ2VvbiBsZXZlbCAyLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgMl0oMDItYWRkLWFuLWl0ZW0ubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBUaGUgd2hvbGUgbW9kCgpgYGAKbXktbW9uc3Rlci1tb2QvCiAgbWFuaWZlc3QuanNvbgogIG1vbnN0ZXIuanNvbgpgYGAKCmBtYW5pZmVzdC5qc29uYCBpcyB0aGUgc2FtZSBhcyBiZWZvcmUgd2l0aCBhIG5ldyBgaWRgIGFuZCBgZGVzY3JpcHRpb25gLiBUaGUgbmV3CmZpbGUgaXMgYG1vbnN0ZXIuanNvbmA6CgpgYGBqc29uCnsKICAicmVjb3JkcyI6IFsKICAgIHsKICAgICAgIm5hbWUiOiAiY2FycGVudGVyIGFudCIsCiAgICAgICJiYXNlIjogImFudCIsCiAgICAgICJjb2xvciI6ICJ1IiwKICAgICAgInNwZWVkIjogMTEwLAogICAgICAiaGl0LXBvaW50cyI6IDExLAogICAgICAiaGVhcmluZyI6IDEwLAogICAgICAic21lbGwiOiAyMCwKICAgICAgImFybW9yLWNsYXNzIjogNiwKICAgICAgInNsZWVwaW5lc3MiOiA0MCwKICAgICAgImRlcHRoIjogMiwKICAgICAgInJhcml0eSI6IDEsCiAgICAgICJleHBlcmllbmNlIjogNiwKICAgICAgImJsb3ciOiBbeyAibWV0aG9kIjogIkJJVEUiLCAiZWZmZWN0IjogIkhVUlQiLCAiZGFtYWdlIjogIjFkNCIgfV0sCiAgICAgICJkZXNjIjogWyJBIGJpZyBicm93biBhbnQgd2l0aCBqYXdzIHRoYXQgc3RyaXAgd29vZC4gSXQgaXMgbm90IGZ1c3N5IGFib3V0IHdoYXQgZWxzZSB0aGV5IHN0cmlwLiJdCiAgICB9CiAgXQp9CmBgYAoKIyMgVGhlIG9uZSB0aGluZyB0aGF0IHdpbGwgYml0ZSB5b3UKCioqYGJhc2VgLioqCgpFdmVyeSBtb25zdGVyIGluaGVyaXRzIGZyb20gYSAqbW9uc3RlciBiYXNlKiwgdGhlIHRlbXBsYXRlIHRoYXQgZGVjaWRlcyBpdHMKc3ltYm9sIG9uIHRoZSBtYXAsIHdoYXQgaXQgaXMgbWFkZSBvZiwgd2hpY2ggYXR0YWNrcyBpdCBjYW4gaGF2ZSwgYW5kIGEgcGlsZSBvZgpvdGhlciBkZWZhdWx0cy4gYGFudGAgaXMgb25lIHRoZSBiYXNlIGdhbWUgc2hpcHMuIFNvIGFyZSBgY2FuaW5lYCwgYG9yY2AsCmBkcmFnb25gLCBhbmQgZmlmdHktb2RkIG90aGVycyAtIHRoZSBmaWxlIGlzCmBwYWNrYWdlcy9jb250ZW50L3BhY2svbW9uc3Rlcl9iYXNlLmpzb25gIGFuZCBpdCBob2xkcyA1NiByZWNvcmRzIGluIHRvdGFsLCBzbyBpdAppcyBzaG9ydCBlbm91Z2ggdG8gcmVhZC4KCkdldCBpdCB3cm9uZyBhbmQgeW91IGdldCB0b2xkIHR3aWNlLCB3aGljaCBpcyB3b3J0aCBrbm93aW5nIGJlZm9yZSB5b3UgZ28gbG9va2luZwpmb3IgYSBzdWJ0bGVyIGV4cGxhbmF0aW9uLiBgYmFzZWAgaXMgYSBkZWNsYXJlZCByZWZlcmVuY2UsIHNvIGNvbXBvc2l0aW9uIHJlcG9ydHMKaXQgYnkgbmFtZTogKmJhc2UgbmFtZXMgdGhlIG1vbnN0ZXIgYmFzZSAiYXVudCIsIGFuZCBubyBsb2FkZWQgcGFjayBkZWZpbmVzIGl0IGluCm1vbnN0ZXJfYmFzZSosIG9uIHlvdXIgbW9kJ3Mgcm93LiBBbmQgdGhlIG1vbnN0ZXIgYmluZGVyIHRoZW4gcmVmdXNlcyB0byBidWlsZCB0aGUKcmVjb3JkIGF0IGFsbCByYXRoZXIgdGhhbiBidWlsZGluZyBhIG1vbnN0ZXIgd2l0aCBubyB0ZW1wbGF0ZS4gU286IGNvcHkgdGhlIGBiYXNlYApmcm9tIGEgcmVhbCBtb25zdGVyIG9mIHRoZSBraW5kIHlvdSBhcmUgbWFraW5nLCBhbmQgY2hlY2sgaXQgYWdhaW5zdApgbW9uc3Rlcl9iYXNlLmpzb25gIGlmIHlvdSB0eXBlZCBpdCBmcm9tIG1lbW9yeS4KClRoaXMgaXMgdGhlIHNpbmdsZSBtb3N0IGNvbW1vbiB3YXkgYSBmaXJzdCBtb25zdGVyIG1vZCBmYWlscywgd2hpY2ggaXMgd2h5IHRoZQp0dXRvcmlhbCdzIG93biB0ZXN0IGFzc2VydHMgdGhlIGJhc2UgZXhpc3RzIHJhdGhlciB0aGFuIHRydXN0aW5nIGl0LgoKIyMgUmVhZGluZyB0aGUgcmVzdAoKU2FtZSBwcmluY2lwbGUgYXMgaXRlbXM6IGZpbmQgYSBtb25zdGVyIGNsb3NlIHRvIHdoYXQgeW91IHdhbnQgaW4KYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9tb25zdGVyLmpzb25gIGFuZCBjb3B5IGl0cyBzaGFwZS4KCi0gKipgc3BlZWRgKio6IDExMCBpcyBub3JtYWwgd2Fsa2luZyBwYWNlLCB0aGUgc2FtZSBhcyBhbiB1bmhhc3RlZCBwbGF5ZXIuIDEyMAogIGlzIGZhc3QgZW5vdWdoIHRvIGJlIGdlbnVpbmVseSBkYW5nZXJvdXMuCi0gKipgZGVwdGhgKiogYW5kICoqYHJhcml0eWAqKjogd2hlcmUgaXQgbGl2ZXMgYW5kIGhvdyBvZnRlbiBpdCBzaG93cyB1cCB0aGVyZS4KLSAqKmBleHBlcmllbmNlYCoqOiBub3QgYSBmbGF0IGF3YXJkLiBXaGF0IHRoZSBwbGF5ZXIgYWN0dWFsbHkgZ2V0cyBpcwogIGBleHBlcmllbmNlICogdGhlIG1vbnN0ZXIncyBsZXZlbCAvIHRoZSBwbGF5ZXIncyBsZXZlbGAsIHNvIHRoZSBzYW1lIG1vbnN0ZXIgaXMKICB3b3J0aCBzdGVhZGlseSBsZXNzIGFzIHRoZSBjaGFyYWN0ZXIgZ3Jvd3MuCi0gKipgc2xlZXBpbmVzc2AqKjogaG93IGxpa2VseSBpdCBpcyB0byBiZSBhc2xlZXAgd2hlbiB5b3UgYXJyaXZlLiAwIG1lYW5zIGl0IGlzCiAgYWx3YXlzIGF3YWtlIGFuZCBjb21pbmcgZm9yIHlvdS4KLSAqKmBibG93YCoqOiBhIGxpc3QuIEVhY2ggZW50cnkgaXMgYSBgbWV0aG9kYCAoaG93IGl0IGF0dGFja3MpLCBhbiBgZWZmZWN0YAogICh3aGF0IHRoYXQgZG9lcyB0byB5b3UpLCBhbmQgYGRhbWFnZWAgZGljZS4gVGhyZWUgYmxvd3MgbWVhbnMgdGhyZWUgYXR0YWNrcyBwZXIKICB0dXJuLiBUaGUgYXZhaWxhYmxlIG1ldGhvZHMgYW5kIGVmZmVjdHMgYXJlIGluIGBibG93X21ldGhvZHMuanNvbmAgYW5kCiAgYGJsb3dfZWZmZWN0cy5qc29uYCBiZXNpZGUgdGhlIG1vbnN0ZXIgZmlsZS4KLSAqKmBjb2xvcmAqKjogYSBzaW5nbGUgbGV0dGVyLCBhbmQgdGhlIGNhc2UgbWF0dGVycy4gYHVgIGlzIFVtYmVyIChicm93biksIGB5YAogIGlzIFllbGxvdywgYHdgIGlzIFdoaXRlIC0gYFdgIGlzIExpZ2h0IFNsYXRlLCB3aGljaCBpcyB3aGF0IHRoZSBzb2xkaWVyIGFudAogIGFjdHVhbGx5IGlzLiBgcGFja2FnZXMvY29yZS9zcmMvY29sb3IudHNgIGlzIHRoZSBjaGFydC4KCiMjIFdoYXQgeW91IHNob3VsZCBzZWUKClN0YXJ0IGEgY2hhcmFjdGVyLCBkZXNjZW5kIHRvIGxldmVsIDIsIGFuZCBsb29rIGZvciBhIGJyb3duIGBhYC4gTG9vayBpdCB1cCB3aXRoCmAvYCBvciByZWNhbGwgaXQgd2l0aCBgbGAgYW5kIHRoZSBnYW1lIHdpbGwgZGVzY3JpYmUgaXQgdXNpbmcgdGhlIHRleHQgeW91IHdyb3RlLgoKIyMgVHJ5IGNoYW5naW5nIHRoaXMKCi0gTWFrZSBpdCBhICoqdW5pcXVlKio6IGFkZCBgImZsYWdzIjogWyJVTklRVUUiXWAsIGdpdmUgaXQgYSBjYXBpdGFsaXNlZCBwcm9wZXIKICBuYW1lIGFuZCBhIGxvdCBtb3JlIGhpdCBwb2ludHMuCi0gR2l2ZSBpdCBhICoqc2Vjb25kIGJsb3cqKiBieSBhZGRpbmcgYW5vdGhlciBlbnRyeSB0byB0aGUgYGJsb3dgIGFycmF5LgotIE1ha2UgaXQgKipmYXN0IGFuZCBmcmFnaWxlKio6IGBzcGVlZGAgMTMwLCBgaGl0LXBvaW50c2AgNC4KLSBBZGQgYSB3aG9sZSAqKmZhbWlseSoqOiBzZXZlcmFsIHJlY29yZHMgaW4gb25lIGFycmF5LCBzaGFyaW5nIGEgYmFzZS4KCiMjIFRyeSBicmVha2luZyBpdAoKQ2hhbmdlIGAiYmFzZSI6ICJhbnQiYCB0byBgImJhc2UiOiAiYXVudCJgIGFuZCByZWxvYWQuIE5vdGljZSB3aGF0IGRvZXMgKmFuZCBkb2VzCm5vdCogaGFwcGVuLiBUaGF0IGlzIHRoZSBmYWlsdXJlIG1vZGUgZGVzY3JpYmVkIGFib3ZlLCBhbmQgaXQgaXMgbXVjaCBlYXNpZXIgdG8KcmVjb2duaXNlIGxhdGVyIGlmIHlvdSBoYXZlIHNlZW4gaXQgb25jZSBvbiBwdXJwb3NlLgoKIyMgV2hhdCBpdCBsb29rcyBsaWtlLCBhbmQgdGhlIG9uZSB0aGluZyB5b3UgaGF2ZSB0byBhc2sgZm9yCgpZb3VyIGFudCBhbHJlYWR5IGhhcyBhbiBhcHBlYXJhbmNlLCBhbmQgeW91IG9ubHkgd3JvdGUgaGFsZiBvZiBpdDoKCi0gKipgImNvbG9yIjogInUiYCoqIGlzIHlvdXJzOiB1bWJlciwgc28gaXQgZHJhd3MgYXMgYSBicm93biBgYWAgYW5kIHJlYWRzIGFzIGEKICBkaWZmZXJlbnQgY3JlYXR1cmUgZnJvbSB0aGUgd2hpdGUgYGFgIGJlc2lkZSBpdC4KLSAqKlRoZSBsZXR0ZXIgYGFgIGlzIG5vdCB5b3Vycy4qKiBJdCBjb21lcyBmcm9tIGAiYmFzZSI6ICJhbnQiYCwgYWxvbmcgd2l0aAogIGV2ZXJ5dGhpbmcgZWxzZSB0aGUgdGVtcGxhdGUgY2Fycmllcy4gQ2hhbmdlIHRoZSBiYXNlIGFuZCB0aGUgbGV0dGVyIGNoYW5nZXMuCgoqKkluIGEgdGlsZSBzZXQsIHlvdXIgYW50IGhhcyBubyBwaWN0dXJlLCBhbmQgdGhlIGdhbWUgd2lsbCBub3QgaW52ZW50IG9uZS4qKiBBCnRpbGUgc2V0IG1hcHMgKm5hbWVkKiBtb25zdGVycyB0byBwaWN0dXJlcyBhbmQgaGFzIG5ldmVyIGhlYXJkIG9mIHlvdXJzLCBzbyBpbgp0aWxlIG1vZGUgYSBwbGF5ZXIgc2VlcyB5b3VyIGJyb3duIGBhYCBzdGFuZGluZyBhbW9uZyBwaWN0dXJlcy4gVGhlIGdhbWUgdXNlZCB0bwpndWVzcyAtIGl0IGRyZXcgYW4gYWRkZWQgbW9uc3RlciB3aXRoIHRoZSB0aWxlIG9mIGEgcmVsYXRpdmUgc2hhcmluZyBpdHMgYGJhc2VgIC0KYW5kIHRoYXQgZ3Vlc3Mgd2FzIHJlbW92ZWQgaW4gMC4yMy4wLCBiZWNhdXNlIE5lbyBBbmdiYW5kIGlzIGEgZmFpdGhmdWwgcG9ydCBvZgo0LjIuNiBhbmQgNC4yLjYgaGFzIG5vIG9waW5pb24gYWJvdXQgd2hhdCBhIGNyZWF0dXJlIGl0IGhhcyBuZXZlciBoZWFyZCBvZiBzaG91bGQKbG9vayBsaWtlLiBEZWNpZGluZyB0aGF0IG9uIGJlaGFsZiBvZiBzb21lYm9keSdzIGFydCBpcyB0aGUgdGlsZSBzZXQncyBjYWxsLCBub3QKdGhlIHBvcnQncy4KCioqU28gc2hpcCB0aWxlcyB3aXRoIHlvdXIgY29udGVudCBpZiB5b3UgY2FuLCBhbmQgc2F5IHdoYXQgaGFwcGVucyBpZiB5b3UgZG8gbm90LioqClR3byBzZW50ZW5jZXMgaW4geW91ciBtb2QncyBkZXNjcmlwdGlvbiBhcmUgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBhIHBsYXllcgp0aGlua2luZyB5b3VyIG1vZCBpcyBicm9rZW4gYW5kIGEgcGxheWVyIGtub3dpbmcgd2hhdCB0aGV5IGFyZSBsb29raW5nIGF0OgoKPiBJbmNsdWRlcyB0aWxlcyBmb3IgdGhlIGNhcnBlbnRlciBhbnQuCgpvcgoKPiBObyB0aWxlcyBvZiBpdHMgb3duOiBpbiB0aWxlIG1vZGUgdGhlIGNhcnBlbnRlciBhbnQgZHJhd3MgYXMgYSBsZXR0ZXIuIEluc3RhbGwKPiBbbGlub2xldW1dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1saW5vbGV1bSkgYW5kIGl0IGlzCj4gZHJhd24gZnJvbSBpdHMgZmFtaWx5IGluc3RlYWQuCgpUaGF0IHNlY29uZCBvbmUgaXMgYSByZWFsIGZhbGxiYWNrIHJhdGhlciB0aGFuIGEgc2hydWcuIExpbm9sZXVtLCB0aGUgbG9vc2UtcGFjawp0aWxlIG1vZCwgZmlsbHMgY29udGVudCBub3RoaW5nIGRyZXc6IGFuIGFkZGVkIG1vbnN0ZXIgaXMgZHJhd24gZnJvbSBhIHJlbGF0aXZlCnNoYXJpbmcgaXRzIGBiYXNlYCB3aXRoIHRoZSBjb2xvdXIgdHVybmVkLCBzbyB5b3VyIGNhcnBlbnRlciBhbnQgcmVhZHMgYXMgYW4gYW50CndpdGhvdXQgYmVpbmcgcGl4ZWwtaWRlbnRpY2FsIHRvIHRoZSBiYXNlIGdhbWUncy4gSXQgYXBwbGllcyB0byBMaW5vbGV1bSdzIG93bgpwYWNrcyBvbmx5IC0gdW5kZXIgQW5nYmFuZCdzIG93biB0aWxlIHNoZWV0cyB0aGVyZSBpcyBubyBzcGFyZSBjZWxsIGZvciBhIHZhcmlhbnQsCnNvIGEgbGV0dGVyIGlzIHdoYXQgYW4gYWRkZWQgY3JlYXR1cmUgZ2V0cyAtIGFuZCB5b3VyIHBsYXllcnMgdHVybiBpdCBvbgp0aGVtc2VsdmVzLiAqKkl0IGlzIG5vdCBhIGRlcGVuZGVuY3k6KiogeW91ciBtb2QgaXMgY29tcGxldGUgYW5kIGNvcnJlY3QgaW4gQVNDSUkKd2l0aCBubyB0aWxlIHNldCBhdCBhbGwsIHNvIGRvIG5vdCByZXF1aXJlIGl0LiBQb2ludCBhdCBpdCwgYW5kIGxldCB0aGUgcGxheWVyCmNob29zZS4KClRoaXMgaXMgYWxzbyB3aHkgYGJhc2VgIGlzIHdvcnRoIGNob29zaW5nIHdpdGggY2FyZSByYXRoZXIgdGhhbiBmaWxsaW5nIGluOiBpdCBpcwp0aGUgc2luZ2xlIGZpZWxkIHRoYXQgZGVjaWRlcyB0aGUgbGV0dGVyLCB0aGUgdGVtcGxhdGUsIGFuZCwgZm9yIGFueW9uZSBydW5uaW5nIGEKdGlsZSBtb2QgdGhhdCBmaWxscyBibGFua3MsIHRoZSBmYW1pbHkgaXQgYm9ycm93cyBmcm9tLgoKSWYgeW91IHdhbnQgYSAqc3BlY2lmaWMqIHBpY3R1cmUsIGEgbW9kIGNhbiBzYXkgc28uIEJvdGggcm91dGVzIGFyZSBwYXN0IHdoYXQgdGhpcwp0dXRvcmlhbCBjb3ZlcnMsIGFuZCB0aGV5IGRpZmZlciBtb3JlIHRoYW4gdGhleSBsb29rOgoKLSAqKlBvaW50IGF0IGEgcGljdHVyZSB0aGF0IGFscmVhZHkgZXhpc3RzLioqIFNoaXAgYSBgLnByZmAgYXMgYSBgcHJlZnNgCiAgcmVzb3VyY2UsIGFuZCBpdHMgYG1vbnN0ZXI6Y2FycGVudGVyIGFudDo8YXR0cj46PGNoYXI+YCBsaW5lIGxheWVycyBvdmVyIHRoZQogIHBsYXllcidzIHRpbGUgc2V0IGFuZCB3aW5zIG92ZXIgYW55dGhpbmcgYSB0aWxlIG1vZCB3b3VsZCBoYXZlIGZpbGxlZCBpbi4gT25lCiAgbGluZSwgbm8gYXJ0LCBidXQgdGhlIG51bWJlcnMgYXJlICphdGxhcyBjb29yZGluYXRlcyosIHNvIHRoZXkgYXJlIGNvcnJlY3QgZm9yCiAgb25lIHBhY2sgYW5kIHdyb25nIGZvciBldmVyeSBvdGhlci4gUmVhY2ggZm9yIHRoaXMgd2hlbiB5b3VyIG1vZCBzaGlwcyBvcgogIHJlcXVpcmVzIGEgcGFydGljdWxhciBzZXQuCi0gKipTaGlwIGEgd2hvbGUgdGlsZSBzZXQuKiogQSBtb2Qgd2l0aCB0aGUgYHRpbGVzYCBmYWNldCBjb250cmlidXRlcyBhIGdyYXBoaWNzCiAgbW9kZSBvZiBpdHMgb3duIChgdGlsZVBhY2tzYCksIHdoaWNoIGlzIGhvdyB0aGUgTGlub2xldW0gc2V0cyBhcmUgZGVsaXZlcmVkLgogIFRoYXQgaXMgYSBzZXQgdGhlIHBsYXllciBjaG9vc2VzIGZyb20gdGhlIEdyYXBoaWNzIG1lbnUsIG5vdCBvbmUgcGljdHVyZSBhZGRlZAogIHRvIHNvbWVib2R5IGVsc2UncyBzZXQsIHdoaWNoIG5vdGhpbmcgc3VwcG9ydHMgdG9kYXkuCgpTZWUgW21vZGRpbmcvUkVBRE1FLm1kXSguLi9SRUFETUUubWQpIGZvciBib3RoLgoKIyMgQ2hhbmdpbmcgYSBtb25zdGVyIHRoYXQgYWxyZWFkeSBleGlzdHMKCk9uZSBmaWxlIGNhbiBib3RoIGFkZCByZWNvcmRzIGFuZCBwYXRjaCB0aGVtLCBhbmQgdGhlIGZpbmlzaGVkIG1vZCBkb2VzLCBzbyB0aGUKbWlycm9yIG9mIFtUdXRvcmlhbCAxXSgwMS10d2Vhay1hLXZhbHVlLm1kKSBpcyB3b3J0aCBzZWVpbmcgb24gYSBtb25zdGVyOgoKYGBganNvbgp7CiAgInJlY29yZHMiOiBbIC4uLiB5b3VyIGNhcnBlbnRlciBhbnQgLi4uIF0sCiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOmdpYW50LWJsYWNrLWFudCI6IFsKICAgICAgeyAib3AiOiAiYWRkIiwgInBhdGgiOiAiaGl0LXBvaW50cyIsICJ2YWx1ZSI6IDMgfSwKICAgICAgeyAib3AiOiAiYWRkRmxhZyIsICJwYXRoIjogImZsYWdzIiwgImZsYWciOiAiR1JPVVBfQUkiIH0KICAgIF0KICB9Cn0KYGBgCgpHaWFudCBibGFjayBhbnRzIG5vdyBoYXZlIGEgbGl0dGxlIG1vcmUgaGVhbHRoIGFuZCBodW50IGluIGdyb3Vwcy4gVHdvIHRoaW5ncwp0aGF0IHNlY3Rpb24gaXMgdGVhY2hpbmcgYmV5b25kIHRoZSBvcHMgdGhlbXNlbHZlczoKCi0gKipgYWRkYCBpcyBub3QgYHNldGAuKiogYHsib3AiOiAiYWRkIiwgInBhdGgiOiAiaGl0LXBvaW50cyIsICJ2YWx1ZSI6IDN9YCBtZWFucwogICJ0aHJlZSBtb3JlIHRoYW4gd2hhdGV2ZXIgaXQgaXMiLCBzbyBpdCBzdGlsbCBkb2VzIHRoZSByaWdodCB0aGluZyBpZiB0aGUgYmFzZQogIGdhbWUgcmV0dW5lcyB0aGUgbW9uc3RlciwgYW5kIGl0IHN0aWxsIGRvZXMgdGhlIHJpZ2h0IHRoaW5nIGlmIGFub3RoZXIgbW9kCiAgY2hhbmdlZCBpdCBmaXJzdC4gYHNldGAgd291bGQgc2lsZW50bHkgdW5kbyBib3RoLgotICoqYGFkZEZsYWdgIGNvbXBvc2VzLioqIFR3byBtb2RzIGFkZGluZyBkaWZmZXJlbnQgZmxhZ3MgdG8gdGhlIHNhbWUgbW9uc3RlciBib3RoCiAgZ2V0IHRoZWlyIGZsYWc7IG5laXRoZXIgaXMgYSBjb25mbGljdC4gVGhhdCBpcyB0cnVlIG9mIGBhZGRGbGFnYCwgYHJlbW92ZUZsYWdgCiAgYW5kIGBhcHBlbmRgLCBhbmQgbm90IHRydWUgb2YgYHNldGAsIGBtZXJnZWAsIGBhZGRgIG9yIGBtdWxgLiBGb3IgdGhvc2UsIHR3bwogIG1vZHMgb24gdGhlIHNhbWUgZmllbGQgaXMgYSByZXBvcnRlZCBjb25mbGljdCBhbmQgdGhlIG9uZSB0aGF0IGxvYWRzIGxhc3Qgd2lucy4KCkEgcGF0Y2hlZCBtb25zdGVyIGtlZXBzIGl0cyBwaWN0dXJlLCBiZWNhdXNlIHRoZSB0aWxlIHNldCBhbHJlYWR5IGtub3dzIGl0IGJ5Cm5hbWUuIE9ubHkgdGhlIGFudCB5b3UgKmFkZGVkKiBoYXMgbm90aGluZyBkcmF3biBmb3IgaXQuCgojIyBUaGUgZmluaXNoZWQgdmVyc2lvbgoKYHNhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTAzLWFkZC1hLW1vbnN0ZXIvYCBpbiB0aGlzIHJlcG9zaXRvcnkgaXMgZXhhY3RseQp0aGlzIG1vZC4gSXQgaXMgbm90IGEgY29weSBvZiB0aGUgdHV0b3JpYWwuIEl0IGlzIGEgbW9kIHRoYXQgZ2V0cyBsb2FkZWQgYW5kCmNoZWNrZWQgYWdhaW5zdCB0aGUgcmVhbCBnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4sIHNvIGlmIGFueXRoaW5nIG9uIHRoaXMKcGFnZSBldmVyIHN0b3BzIGJlaW5nIHRydWUsIHRoZSBidWlsZCBmYWlscy4KCi0tLQoKKipOZXh0OioqIFtUdXRvcmlhbCA0OiBDaGFuZ2UgYSBzcGVsbF0oMDQtY2hhbmdlLWEtc3BlbGwubWQpLCByZWFjaGluZyBpbnRvIGEKY2xhc3MncyBzcGVsbCBsaXN0LCBhbmQgd2hhdCBhIHBvc2l0aW9uYWwgcGF0aCBjb3N0cyB5b3UuCg=="
  },
  {
    "id": "tutorial-04",
    "path": "tutorials/04-change-a-spell.md",
    "audience": "beginner",
    "title": "4. Change a spell",
    "note": "Reach into a class and understand a positional path.",
    "encoded": "IyBUdXRvcmlhbCA0OiBDaGFuZ2UgYSBzcGVsbAoKKipXaGF0IHlvdSB3aWxsIG1ha2U6KiogYSBQcmllc3Qgd2hvc2UgTWlub3IgSGVhbGluZyBjb3N0cyAxIG1hbmEgaW5zdGVhZCBvZiAyCmFuZCBhbG1vc3QgbmV2ZXIgZmFpbHMuCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCAzXSgwMy1hZGQtYS1tb25zdGVyLm1kKS4KCioqVGltZToqKiB0ZW4gbWludXRlcy4KCi0tLQoKIyMgVGhlIHdob2xlIG1vZAoKYGBgCm15LXNwZWxsLW1vZC8KICBtYW5pZmVzdC5qc29uCiAgY2xhc3MuanNvbgpgYGAKCmBjbGFzcy5qc29uYDoKCmBgYGpzb24KewogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTpwcmllc3QiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImJvb2suMC5zcGVsbC4yLm1hbmEiLCAidmFsdWUiOiAxIH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImJvb2suMC5zcGVsbC4yLmZhaWwiLCAidmFsdWUiOiA1IH0KICAgIF0KICB9Cn0KYGBgCgpUaGlzIGlzIFR1dG9yaWFsIDEncyBgZmllbGRQYXRjaGVzYCBhZ2FpbiwgcG9pbnRlZCBhdCBhIGNsYXNzIGluc3RlYWQgb2YgYW4gaXRlbS4KTm90aGluZyBuZXcgaXMgYmVpbmcgaW50cm9kdWNlZCBleGNlcHQgKndoZXJlIHlvdSBhcmUgcG9pbnRpbmcqLgoKIyMgUmVhZGluZyB0aGUgcGF0aAoKYGJvb2suMC5zcGVsbC4yLm1hbmFgIHdhbGtzIGRvd24gdGhyb3VnaCB0aGUgUHJpZXN0J3MgcmVjb3JkOgoKLSBgYm9vay4wYDogdGhlIFByaWVzdCdzIGZpcnN0IHNwZWxsIGJvb2suCi0gYHNwZWxsLjJgOiB0aGUgdGhpcmQgc3BlbGwgaW4gaXQgKGNvdW50aW5nIGZyb20gemVybykuIFRoYXQgaXMgTWlub3IgSGVhbGluZy4KLSBgbWFuYWA6IGl0cyBjb3N0LgoKYGZhaWxgIGlzIHRoZSBwZXJjZW50YWdlIGNoYW5jZSB0aGUgc3BlbGwgZml6emxlcywgYmVmb3JlIHlvdXIgY2hhcmFjdGVyJ3Mgb3duCnN0YXRzIGFkanVzdCBpdC4KClRvIGZpbmQgdGhlIHNwZWxsIHlvdSB3YW50LCBvcGVuIGBwYWNrYWdlcy9jb250ZW50L3BhY2svY2xhc3MuanNvbmAsIGZpbmQgeW91cgpjbGFzcywgYW5kIGNvdW50LiBCb29rcyBhbmQgc3BlbGxzIGFyZSBpbiB0aGUgb3JkZXIgdGhleSBhcHBlYXIgaW4gdGhlIGdhbWUncyBvd24Kc3BlbGwgbWVudSwgc28geW91IGNhbiBjb3VudCB0aGVtIG9uIHNjcmVlbiBpbnN0ZWFkIGlmIHRoYXQgaXMgZWFzaWVyLgoKIyMgVGhlIGNhdGNoIHdvcnRoIGtub3dpbmcgbm93CgoqKkEgbnVtYmVyIGluIHRoYXQgcGF0aCBpcyBhIHBvc2l0aW9uLCBub3QgYSBuYW1lLioqCgpgc3BlbGwuMmAgbWVhbnMgIndoYXRldmVyIGlzIHRoaXJkIiwgbm90ICJNaW5vciBIZWFsaW5nIi4gSWYgYW5vdGhlciBtb2QgaW5zZXJ0cwphIHNwZWxsIGFib3ZlIGl0LCBvciBpZiBhIGZ1dHVyZSByZWxlYXNlIG9mIHRoZSBiYXNlIGdhbWUgcmVvcmRlcnMgdGhhdCBib29rLAp5b3VyIHBhdGNoIGxhbmRzIG9uIGEgKmRpZmZlcmVudCBzcGVsbCogYW5kIGtlZXBzIHdvcmtpbmcgc2lsZW50bHkuIE5vdGhpbmcgaXMKYnJva2VuLCBzbyBub3RoaW5nIGNvbXBsYWluczsgeW91IGp1c3QgcXVpZXRseSByZXR1bmVkIHRoZSB3cm9uZyB0aGluZy4KClRoZXJlIGlzIG5vIHdheSBhcm91bmQgdGhhdCB0b2RheSwgYW5kIHByZXRlbmRpbmcgb3RoZXJ3aXNlIHdvdWxkIGJlIHdvcnNlIHRoYW4Kc2F5aW5nIGl0OiBwb3NpdGlvbmFsIHBhdGhzIGFyZSBob3cgdGhlIGRhdGEgaXMgc2hhcGVkLiBXaGF0IHlvdSBjYW4gZG8gaXMga25vdwppdC4gSWYgeW91IHB1Ymxpc2ggYSBzcGVsbCBtb2QsIHNheSB3aGljaCByZWxlYXNlIHlvdSBidWlsdCBpdCBhZ2FpbnN0LCBhbmQKcmUtY2hlY2sgaXQgd2hlbiB0aGUgZ2FtZSB1cGRhdGVzLiAoVGhlIHR1dG9yaWFsJ3Mgb3duIHRlc3QgYXNzZXJ0cyB0aGF0CmBib29rLjAuc3BlbGwuMmAgaXMgc3RpbGwgY2FsbGVkIE1pbm9yIEhlYWxpbmcsIHByZWNpc2VseSBzbyB0aGlzIHBhZ2UgY2Fubm90IGdvCnF1aWV0bHkgd3JvbmcuKQoKIyMgQWRkaW5nIGEgc3BlbGwgcmF0aGVyIHRoYW4gY2hhbmdpbmcgb25lCgpTYW1lIG1lY2hhbmlzbSwgb25lIGV4dHJhIHN0ZXAuIGBzZXRgIGEgd2hvbGUgc3BlbGwgb2JqZWN0IGF0IHRoZSBuZXh0IGZyZWUKaW5kZXgsIHRoZW4gcmFpc2UgdGhlIGJvb2sncyBgc3BlbGxzYCBjb3VudCBzbyB0aGUgZ2FtZSBrbm93cyB0aGUgYm9vayBnb3QKbG9uZ2VyOgoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnByaWVzdCI6IFsKICAgICAgeyAib3AiOiAic2V0IiwgInBhdGgiOiAiYm9vay4yLnNwZWxsLjYiLCAidmFsdWUiOiB7ICJuYW1lIjogIlRlbGVwb3J0IE90aGVyIiwgImxldmVsIjogMTgsICJtYW5hIjogMTAsICJmYWlsIjogMzAsICJleHAiOiAyMCwgImVmZmVjdCI6IFsgeyAiZWZmIjogIkJPTFRfU1RBVFVTIiwgInR5cGUiOiAiQVdBWV9BTEwiLCAiZGljZSI6ICIkQiIsICJleHByIjogWyB7ICJuYW1lIjogIkIiLCAiYmFzZSI6ICJQTEFZRVJfTEVWRUwiLCAiZXhwciI6ICIqIDMiIH0gXSB9IF0sICJkZXNjIjogWyJQcm9kdWNlcyBhIGJvbHQgdGhhdCB0ZWxlcG9ydHMgYXdheSB0aGUgZmlyc3QgbW9uc3RlciBpbiBpdHMgcGF0aC4iXSB9IH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImJvb2suMi5zcGVsbHMiLCAidmFsdWUiOiA3IH0KICAgIF0KICB9Cn0KYGBgCgpUaGF0IGlzIG5vdCBhbiBpbnZlbnRlZCBleGFtcGxlLiBJdCBpcyB3aGF0IHRoZSByZWFsIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QKZG9lcyB0byBnaXZlIHRoZSBQcmllc3QgYmFjayBhIHNwZWxsIGEgbGF0ZXIgdmVyc2lvbiBvZiBBbmdiYW5kIGRyb3BwZWQsIGFuZCB0aGUKZm91ciBudW1iZXJzIGFyZSB0aGUgb25lcyBpdCBzaGlwcy4KClRoZXkgYXJlIHdvcnRoIGEgbW9tZW50LCBiZWNhdXNlIHRoZXkgYXJlIG5vdCB0aGUgbnVtYmVycyB0aGUgb2xkIGdhbWUgdXNlZC4KQW5nYmFuZCA0LjEuMiBnYXZlIHRoZSBQcmllc3QgdGhpcyBzcGVsbCBhcyBgVGVsZXBvcnQgT3RoZXI6MjA6MjA6ODA6MTZgLCBpbiB0aGF0CmZpbGUncyBgbmFtZTpsZXZlbDptYW5hOmZhaWw6ZXhwYCBvcmRlciwgYW5kIHRob3NlIHJlY29yZHMgYXJlIGluIHRoaXMgcmVwb3NpdG9yeQphdCBgcmVmZXJlbmNlL2xpYi9nYW1lZGF0YS9vbGRfY2xhc3MudHh0YC4gQW5nYmFuZCA0LjIgdGhlbiByZXByaWNlZCBzcGVsbHMgdG8KY29zdCB0aGUgc2FtZSBpbiBldmVyeSBjbGFzcyB0aGF0IGhhcyB0aGVtLCBzbyBib3RoIGNsYXNzZXMgdGhhdCBzdGlsbCBoYXZlIHRoaXMKb25lIHBheSAxMCBtYW5hIGF0IDMwIHBlcmNlbnQgZmFpbHVyZS4gUXVvdGluZyAyMCBhbmQgODAgaW50byB0aGUgY3VycmVudCBnYW1lCndvdWxkIGNoYXJnZSBhIFByaWVzdCB0d2ljZSB0aGUgbWFuYSBvZiB0aGUgaWRlbnRpY2FsIHNwZWxsIGluIGEgTWFnZSdzIGJvb2suIEdldAp0aGUgb2xkIGRhdGEgYW5kIHJlYWQgaXQsIHRoZW4gY2hlY2sgd2hldGhlciB0aGUgdW5pdHMgaXQgaXMgd3JpdHRlbiBpbiBzdGlsbCBtZWFuCndoYXQgdGhleSBtZWFudDogW0ZlYXR1cmUgcmVzdG9yYXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvbW9kZGluZy9GRUFUVVJFX1JFU1RPUkFUSU9OLm1kKSBpcyB0aGUgcnVsZSB0aGlzCmZvbGxvd3MsIGFuZCBpdHMgd29ya2VkIGV4YW1wbGUgaXMgdGhpcyBleGFjdCBzcGVsbC4KClRoZSBgZWZmZWN0YCBibG9jayBpcyB0aGUgZ2FtZSdzIG93biBlZmZlY3Qgdm9jYWJ1bGFyeTogYEJPTFRfU1RBVFVTYCwKYFBMQVlFUl9MRVZFTGAsIGRpY2UgZXhwcmVzc2lvbnMuIFlvdSBhcmUgbm90IGxpbWl0ZWQgdG8gdGhlIGVmZmVjdHMgdGhlIGJhc2UKZ2FtZSBzaGlwcywgYnV0IGludmVudGluZyBhIG5ldyBvbmUgaXMgYSBjb2RlIGpvYiByYXRoZXIgdGhhbiBhIGRhdGEgam9iOyB0aGF0CmlzIFtUdXRvcmlhbCA1XSgwNS1ob29rLWJlaGF2aW91ci5tZCkgYW5kIHRoZSBwYWdlcyBiZXlvbmQgaXQuCgojIyBXaGF0IHlvdSBzaG91bGQgc2VlCgpSb2xsIGEgUHJpZXN0LCBsZWFybiBNaW5vciBIZWFsaW5nLCBhbmQgb3BlbiB0aGUgc3BlbGwgbWVudS4gSXRzIG1hbmEgY29zdCByZWFkcwoxIGFuZCBpdHMgZmFpbHVyZSByYXRlIGlzIGZhciBsb3dlciB0aGFuIGFuIHVubW9kZGVkIFByaWVzdCdzIGF0IHRoZSBzYW1lIGxldmVsLgoKIyMgVHJ5IGNoYW5naW5nIHRoaXMKCi0gUmV0dW5lIGEgKipkaWZmZXJlbnQgY2xhc3MqKjogYGNvcmU6bWFnZWAsIGBjb3JlOnJhbmdlcmAsIGBjb3JlOnBhbGFkaW5gLgotIE1vdmUgYSBzcGVsbCAqKmVhcmxpZXIqKjogc2V0IGl0cyBgbGV2ZWxgIHRvIDEgYW5kIGdldCBpdCBhdCBjaGFyYWN0ZXIKICBjcmVhdGlvbi4KLSBNYWtlIGEgY2xhc3MgKip3b3JzZSoqIGF0IHNvbWV0aGluZywgd2hpY2ggaXMgb2Z0ZW4gd2hhdCBtYWtlcyBhIHZhcmlhbnQKICBpbnRlcmVzdGluZyByYXRoZXIgdGhhbiBhIGNoZWF0LgoKIyMgVGhlIGZpbmlzaGVkIHZlcnNpb24KCmBzYW1wbGVzL3R1dG9yaWFscy90dXRvcmlhbC0wNC1jaGFuZ2UtYS1zcGVsbC9gLgoKLS0tCgoqKk5leHQ6KiogW1R1dG9yaWFsIDU6IEhvb2sgYmVoYXZpb3VyXSgwNS1ob29rLWJlaGF2aW91ci5tZCksIHRoZSBmaXJzdCB0dXRvcmlhbAp3aGVyZSB5b3VyIG1vZCBydW5zIGNvZGUgaW5zdGVhZCBvZiBzaGlwcGluZyBkYXRhLgo="
  },
  {
    "id": "tutorial-05",
    "path": "tutorials/05-hook-behaviour.md",
    "audience": "beginner",
    "title": "5. Hook behaviour",
    "note": "Write a ten-line plugin that changes behaviour.",
    "encoded": "IyBUdXRvcmlhbCA1OiBIb29rIG9uZSBwaWVjZSBvZiBiZWhhdmlvdXIKCioqV2hhdCB5b3Ugd2lsbCBtYWtlOioqIHRoZSBnYW1lIGNvbmdyYXR1bGF0aW5nIHlvdSB3aGVuIHlvdSBnYWluIGEgbGV2ZWwuCgoqKkJlZm9yZSB0aGlzOioqIFtUdXRvcmlhbCA0XSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkuCgoqKlRpbWU6KiogdGVuIG1pbnV0ZXMuCgoqKk5ldyBpZGVhOioqIHlvdXIgbW9kIHJ1bnMgY29kZS4gU3RpbGwgbm8gY29tcGlsZXIsIG5vIGJ1aWxkIHN0ZXAsIG5vCmRlcGVuZGVuY2llcywganVzdCBvbmUgYC5qc2AgZmlsZSBiZXNpZGUgdGhlIG1hbmlmZXN0LgoKLS0tCgojIyBUaGUgd2hvbGUgbW9kCgpgYGAKbXktY29kZS1tb2QvCiAgbWFuaWZlc3QuanNvbgogIHBsdWdpbi5qcwpgYGAKCmBtYW5pZmVzdC5qc29uYCBnYWlucyB0d28gbGluZXMgY29tcGFyZWQgdG8gdGhlIGNvbnRlbnQgbW9kczoKCmBgYGpzb24KewogICJpZCI6ICJteS1jb2RlLW1vZCIsCiAgIm5hbWUiOiAiTXkgQ29kZSBNb2QiLAogICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAic2hhcGUiOiAicGx1Z2luIiwKICAibW9kQXBpIjogMSwKICAiZW5naW5lIjogIj49MC4yMC4wIiwKICAiYXV0aG9yIjogInlvdXIgbmFtZSIsCiAgImxpY2Vuc2UiOiAiR1BMLTIuMC1vbmx5IiwKICAicmVwb3NpdG9yeSI6ICJodHRwczovL2dpdGh1Yi5jb20veW91L215LWNvZGUtbW9kIiwKICAiZGVzY3JpcHRpb24iOiAiQ29uZ3JhdHVsYXRlcyB5b3Ugb24gZ2FpbmluZyBhIGxldmVsLiIKfQpgYGAKCmBzaGFwZWAgaXMgYHBsdWdpbmAgcmF0aGVyIHRoYW4gYGNvbnRlbnRgLCBhbmQgYG1vZEFwaWAgc2F5cyB3aGljaCB2ZXJzaW9uIG9mIHRoZQpwbHVnaW4gY29udHJhY3QgdGhlIGZpbGUgaXMgd3JpdHRlbiBhZ2FpbnN0LiBUaGF0IGlzIHRoZSB3aG9sZSBkaWZmZXJlbmNlLgoKYHBsdWdpbi5qc2A6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAxLAoKICBob29rcygpIHsKICAgIHJldHVybiB7CiAgICAgIG1lc3NhZ2VUZXh0OiAocmF3KSA9PgogICAgICAgIHJhdy5zdGFydHNXaXRoKCJXZWxjb21lIHRvIGxldmVsICIpID8gYENvbmdyYXR1bGF0aW9ucyEgJHtyYXd9YCA6IHJhdywKICAgIH07CiAgfSwKfTsKYGBgCgpUZW4gbGluZXMsIGFuZCB0aGF0IGlzIHRoZSBlbnRpcmUgbW9kLgoKIyMgV2hhdCBpcyBoYXBwZW5pbmcKCkEgbW9kIHRoYXQgcnVucyBjb2RlICoqZGVmYXVsdC1leHBvcnRzIG9uZSBvYmplY3QqKi4gVGhlIGdhbWUgbG9va3MgYXQgdGhhdApvYmplY3QgYW5kIGFza3MgaXQgcXVlc3Rpb25zLgoKYGhvb2tzKClgIHJldHVybnMgYSBwbGFpbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgKipiZWhhdmlvdXIgcG9pbnRzKiosIHBsYWNlcwp3aGVyZSB0aGUgZ2FtZSB3aWxsIGNvbnN1bHQgYSBtb2QgYmVmb3JlIGRvaW5nIHNvbWV0aGluZy4gVGhlcmUgYXJlIGVpZ2h0IG9mCnRoZW0uIFlvdSBzdXBwbHkgdGhlIG9uZXMgeW91IGNhcmUgYWJvdXQgYW5kIG9taXQgdGhlIHJlc3Q7IGEga2V5IHlvdSBkbyBub3QKd3JpdGUgaXMgYSBwbGFjZSB0aGUgZ2FtZSBuZXZlciBhc2tzIHlvdSBhYm91dCwgYW5kIGl0IGNvc3RzIG5vdGhpbmcuCgpgbWVzc2FnZVRleHRgIGlzIHRoZSBzaW1wbGVzdCBvbmUuIEV2ZXJ5IHBsYXllci12aXNpYmxlIG1lc3NhZ2UgcGFzc2VzIHRocm91Z2gKaXQgb24gaXRzIHdheSB0byB0aGUgbWVzc2FnZSBsaW5lLCBhbmQgd2hhdGV2ZXIgeW91IHJldHVybiBpcyB3aGF0IGlzIHNob3duLgoKKipOb3RlIHdoYXQgaXMgKm5vdCogaGVyZS4qKiBUaGVyZSBhcmUgbm8gaW1wb3J0cy4gYHBsdWdpbi5qc2AgaXMgYSBwbGFpbiBFUwptb2R1bGUgdGhhdCB0aGUgZ2FtZSBsb2FkcyBmcm9tIHlvdXIgZm9sZGVyOyBpdCBkb2VzIG5vdCBpbXBvcnQgdGhlIGVuZ2luZSwKYmVjYXVzZSB0aGUgZW5naW5lIGlzIHBhc3NlZCAqaW4qIHRvIHRoZSBmdW5jdGlvbnMgdGhhdCBuZWVkIGl0LiBUaGF0IGlzIHdoYXQKa2VlcHMgYSBtb2QgZnJvbSBoYXZpbmcgdG8gYmUgYnVpbHQsIGJ1bmRsZWQsIG9yIGtlcHQgaW4gc3RlcCB3aXRoIHRoZSBnYW1lJ3MKaW50ZXJuYWwgbW9kdWxlIGxheW91dC4gSWYgeW91IHdhbnQgbW9yZSB0aGFuIG9uZSBmaWxlLCB5b3UgY2FuIGBpbXBvcnQKIi4vbGliL3doYXRldmVyLmpzImAgZnJvbSB5b3VyIG93biBmb2xkZXI7IHJlbGF0aXZlIHBhdGhzIHdvcmsgb24gYm90aCB0aGUKZGVza3RvcCBhbmQgYnJvd3NlciBidWlsZHMuCgojIyBPbmUgcnVsZSBhYm91dCB0aGlzIGhvb2sKCkEgbWVzc2FnZSBob29rIG1heSAqKnJlc3RhdGUqKiBhIG1lc3NhZ2UuIEl0IG11c3QgbmV2ZXIgY2hhbmdlIHdoYXQgYSBtZXNzYWdlCm1lYW5zLgoKIkNvbmdyYXR1bGF0aW9ucyEiIGluIGZyb250IG9mIGEgbGV2ZWwtdXAgaXMgYSByZXN0YXRlbWVudDogc2FtZSBmYWN0LCBtb3JlCmVudGh1c2lhc20uIFR1cm5pbmcgKiJZb3UgYXJlIHBvaXNvbmVkLiIqIGludG8gKiJZb3UgZmVlbCBmaW5lLiIqIGlzIG5vdCwgYW5kIGEKbW9kIHRoYXQgZG9lcyBpdCBoYXMgbWFkZSB0aGUgZ2FtZSBsaWUgdG8gdGhlIHBsYXllciBhYm91dCB0aGVpciBvd24gY2hhcmFjdGVyLgoKVGhpcyBpcyBub3QgdGhlIGVuZ2luZSBzdG9wcGluZyB5b3U7IHRoZSBlbmdpbmUgd2lsbCBoYXBwaWx5IHJldHVybiB3aGF0ZXZlciB5b3UKd3JpdGUuIEl0IGlzIHRoZSBsaW5lIGJldHdlZW4gYSBtb2QgdGhhdCBjaGFuZ2VzIHRoZSBnYW1lIGFuZCBhIG1vZCB0aGF0IGJyZWFrcwppdCwgYW5kIHRoaXMgaG9vayBpcyB0aGUgZWFzaWVzdCBwbGFjZSBpbiB0aGUgd2hvbGUgc3lzdGVtIHRvIGNyb3NzIGl0IGJ5CmFjY2lkZW50LgoKIyMgVGhlIG1pc3Rha2UgdG8gYXZvaWQKCmBgYGpzCm1lc3NhZ2VUZXh0OiAocmF3KSA9PiAocmF3LnN0YXJ0c1dpdGgoIldlbGNvbWUgdG8gbGV2ZWwgIikgPyBgQ29uZ3JhdHVsYXRpb25zISAke3Jhd31gIDogcmF3KSwKLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXl5eXgpgYGAKClRoYXQgdHJhaWxpbmcgYDogcmF3YCBtYXR0ZXJzIGVub3Jtb3VzbHkuIFlvdXIgZnVuY3Rpb24gc2VlcyAqKmV2ZXJ5KiogbWVzc2FnZQp0aGUgZ2FtZSBwcmludHMsIHNvIG9uZSB0aGF0IGZvcmdldHMgdG8gcmV0dXJuIHRoZSBvcmlnaW5hbCB0ZXh0IGZvciBjYXNlcyBpdApkb2VzIG5vdCBjYXJlIGFib3V0IGRlbGV0ZXMgdGhlIHJlc3Qgb2YgdGhlIGdhbWUncyBvdXRwdXQuIFdoYXRldmVyIHlvdXIgaG9vawpkb2VzLCB0aGUgZGVmYXVsdCBicmFuY2ggcmV0dXJucyB3aGF0IGl0IHdhcyBnaXZlbi4KCiMjIFJ1bm5pbmcgaXQKCkV4YWN0bHkgYXMgYmVmb3JlOiB0aGUgYG1vZHMvYCBmb2xkZXIgb24gdGhlIGRlc2t0b3AgYnVpbGQsIG9yICoqQ2hvb3NlIGEgbW9kcwpmb2xkZXIuLi4qKiBpbiBhIGJyb3dzZXIuIEEgY29kZSBtb2QgaXMgbG9hZGVkIGZyb20gYSBmb2xkZXIgdGhlIHNhbWUgd2F5IGEgZGF0YQptb2QgaXMuCgojIyBXaGF0IHlvdSBzaG91bGQgc2VlCgpHYWluIGEgbGV2ZWwuIFRoZSBtZXNzYWdlIHJlYWRzICoiQ29uZ3JhdHVsYXRpb25zISBXZWxjb21lIHRvIGxldmVsIDIuIioKClR1cm4gdGhlIG1vZCBvZmYsIHJlbG9hZCwgYW5kIGl0IHJlYWRzICoiV2VsY29tZSB0byBsZXZlbCAyLiIqIGFnYWluLgoKIyMgVHJ5IGNoYW5naW5nIHRoaXMKCi0gQ29uZ3JhdHVsYXRlICoqbG91ZGx5Kio6IGBgIGAqKiogJHtyYXcudG9VcHBlckNhc2UoKX0gKioqYCBgYC4KLSBSZWFjdCB0byBhICoqZGlmZmVyZW50KiogbWVzc2FnZS4gRmluZCBvbmUgeW91IGxpa2UgaW4gdGhlIGdhbWUgYW5kIG1hdGNoIG9uCiAgaXQuCi0gQWRkIGEgKipzZWNvbmQqKiBob29rLiBgc2F2ZU5vaXNlU2NlbnRgIGFuZCBgb2JqZWN0TGlzdFRpZWJyZWFrYCBhcmUgdHdvIG9mIHRoZQogIG90aGVyIHNldmVuOyBzZWUgW01PRF9TRUFNUy5tZF0oLi4vTU9EX1NFQU1TLm1kKSBmb3Igd2hhdCBlYWNoIG9uZSBpcyBhc2tlZCBhbmQKICB3aGVuLgotIFByaW50IHNvbWV0aGluZyB0byB0aGUgY29uc29sZSBmcm9tIGluc2lkZSB0aGUgaG9vayBhbmQgd2F0Y2ggaG93IG9mdGVuIGl0IGlzCiAgY2FsbGVkLiBJdCBpcyBhIGdvb2Qgd2F5IHRvIGdldCBhIGZlZWwgZm9yIHRoZSBnYW1lJ3MgbWVzc2FnZSB2b2x1bWUuCgojIyBUaGUgZmluaXNoZWQgdmVyc2lvbgoKYHNhbXBsZXMvdHV0b3JpYWxzL3R1dG9yaWFsLTA1LWhvb2stYmVoYXZpb3VyL2AsIHdoaWNoIHJlYWxseSBpcyBpbXBvcnRlZCBhbmQgcmVhbGx5IGlzCmZvbGRlZCB0aHJvdWdoIHRoZSBnYW1lJ3Mgb3duIGhvb2sgY29tcG9zaXRpb24gb24gZXZlcnkgdGVzdCBydW4uIFRoZSB0ZXN0IHdvdWxkCmZhaWwgaWYgdGhpcyBwYWdlJ3MgY29kZSBzdG9wcGVkIHdvcmtpbmcuCgotLS0KCioqTmV4dDoqKiBbVHV0b3JpYWwgNjogQWRkIGFuIG9wdGlvbl0oMDYtYWRkLWFuLW9wdGlvbi5tZCksIHRoZSBzYW1lIG1vZCwgd2l0aCBhCnN3aXRjaCB0aGUgcGxheWVyIGNvbnRyb2xzLgo="
  },
  {
    "id": "tutorial-06",
    "path": "tutorials/06-add-an-option.md",
    "audience": "beginner",
    "title": "6. Add an option",
    "note": "Let a player switch your change on and off.",
    "encoded": "IyBUdXRvcmlhbCA2OiBBZGQgYW4gb3B0aW9uCgoqKldoYXQgeW91IHdpbGwgbWFrZToqKiBUdXRvcmlhbCA1J3MgbW9kLCB3aXRoIGEgc3dpdGNoIHRoZSBwbGF5ZXIgY2FuIHR1cm4gb24KYW5kIG9mZiwgZnJvbSB0aGUgZ2FtZSwgd2l0aG91dCBlZGl0aW5nIGFueXRoaW5nLgoKKipCZWZvcmUgdGhpczoqKiBbVHV0b3JpYWwgNV0oMDUtaG9vay1iZWhhdmlvdXIubWQpLgoKKipUaW1lOioqIHRlbiBtaW51dGVzLgoKLS0tCgojIyBUaGUgd2hvbGUgbW9kCgpTYW1lIHR3byBmaWxlcy4gYG1hbmlmZXN0Lmpzb25gIGdhaW5zIGEgYHJ1bGVzYCBibG9jazoKCmBgYGpzb24KewogICJpZCI6ICJteS1vcHRpb24tbW9kIiwKICAibmFtZSI6ICJNeSBPcHRpb24gTW9kIiwKICAidmVyc2lvbiI6ICIxLjAuMCIsCiAgInNoYXBlIjogInBsdWdpbiIsCiAgIm1vZEFwaSI6IDEsCiAgImVuZ2luZSI6ICI+PTAuMjAuMCIsCiAgImF1dGhvciI6ICJ5b3VyIG5hbWUiLAogICJsaWNlbnNlIjogIkdQTC0yLjAtb25seSIsCiAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3lvdS9teS1vcHRpb24tbW9kIiwKICAiZGVzY3JpcHRpb24iOiAiQ29uZ3JhdHVsYXRlcyB5b3Ugb24gZ2FpbmluZyBhIGxldmVsLCBpZiB5b3Ugd2FudCBpdCB0by4iLAogICJydWxlcyI6IFsKICAgIHsKICAgICAgImZsYWciOiAibXktb3B0aW9uLW1vZC5jb25ncmF0dWxhdGUiLAogICAgICAidGl0bGUiOiAiQ29uZ3JhdHVsYXRlIG1lIG9uIGdhaW5pbmcgYSBsZXZlbCIsCiAgICAgICJkZXNjcmlwdGlvbiI6ICJQdXRzIFwiQ29uZ3JhdHVsYXRpb25zIVwiIGluIGZyb250IG9mIHRoZSBsZXZlbC11cCBtZXNzYWdlLiBOb3RoaW5nIGVsc2UgY2hhbmdlcy4iLAogICAgICAiZGVmYXVsdCI6IGZhbHNlCiAgICB9CiAgXQp9CmBgYAoKYHBsdWdpbi5qc2AgZ2FpbnMgb25lIGxpbmU6CgpgYGBqcwpleHBvcnQgZGVmYXVsdCB7CiAgYXBpOiAxLAoKICBob29rcyhjdHgpIHsKICAgIGlmIChjdHguZmxhZ3NbIm15LW9wdGlvbi1tb2QuY29uZ3JhdHVsYXRlIl0gIT09IHRydWUpIHJldHVybiB7fTsKICAgIHJldHVybiB7CiAgICAgIG1lc3NhZ2VUZXh0OiAocmF3KSA9PgogICAgICAgIHJhdy5zdGFydHNXaXRoKCJXZWxjb21lIHRvIGxldmVsICIpID8gYENvbmdyYXR1bGF0aW9ucyEgJHtyYXd9YCA6IHJhdywKICAgIH07CiAgfSwKfTsKYGBgCgpUaGF0IGlzIHRoZSBlbnRpcmUgZmVhdHVyZS4gVGhlcmUgaXMgbm8gc2V0dGluZ3MgQVBJIHRvIGxlYXJuLCBubyBzdG9yYWdlIHRvCm1hbmFnZSwgYW5kIG5vIHNjcmVlbiB0byBidWlsZC4KCiMjIEhvdyBpdCB3b3JrcwoKWW91ICoqZGVjbGFyZSoqIHRoZSBzd2l0Y2ggaW4gdGhlIG1hbmlmZXN0LiBUaGUgZ2FtZSBidWlsZHMgdGhlIHNjcmVlbiwgc2hvd3MKeW91ciBgdGl0bGVgIGFuZCBgZGVzY3JpcHRpb25gLCByZW1lbWJlcnMgd2hhdCB0aGUgcGxheWVyIGNob3NlLCBhbmQgcHV0cyB0aGUKYW5zd2VyIGluIGBjdHguZmxhZ3NgIGJlZm9yZSB5b3VyIGNvZGUgcnVucy4KClNvIHJlYWRpbmcgYSBzZXR0aW5nIGlzIGEgcGxhaW4gcHJvcGVydHkgbG9va3VwLiBgdGl0bGVgIGFuZCBgZGVzY3JpcHRpb25gIGFyZQp3aGF0IHRoZSBwbGF5ZXIgcmVhZHMsIHNvIHdyaXRlIHRoZW0gZm9yIGEgcGxheWVyOiBzYXkgd2hhdCB0dXJuaW5nIGl0IG9uIGRvZXMsCm5vdCB3aGF0IGl0IGRvZXMgaW50ZXJuYWxseS4KClRoZSBmbGFnIG5hbWUgaXMgcHJlZml4ZWQgd2l0aCB5b3VyIG1vZCdzIGlkIGJ5IGNvbnZlbnRpb24sIGFuZCB0aGF0IGNvbnZlbnRpb24KaXMgd29ydGgga2VlcGluZy4gSXQgaXMgbm90IGJlY2F1c2UgYGN0eC5mbGFnc2AgaXMgc2hhcmVkIC0gdGhlIGhvc3Qgc2xpY2VzIHRoYXQKcGVyIG1vZCwgc28geW91IGNhbm5vdCBzZWUgYW5vdGhlciBtb2QncyB0b2dnbGVzIGFuZCB0aGV5IGNhbm5vdCBzZWUgeW91cnMuIEl0IGlzCmJlY2F1c2UgdGhlIHBsYXllcidzIFNBVkVEIGNob2ljZXMgYWxsIGxpdmUgaW4gb25lIGZsYXQgbWFwLCBrZXllZCBieSBmbGFnIG5hbWUsCnNvIHR3byBtb2RzIHRoYXQgYm90aCBjYWxsZWQgYSBmbGFnIGBjb25ncmF0dWxhdGVgIHdvdWxkIGJlIHNoYXJpbmcgb25lIHN0b3JlZApzZXR0aW5nLgoKIyMgV2hlcmUgdGhlIGNoZWNrIGdvZXMsIGFuZCB3aHkgaXQgbWF0dGVycwoKTG9vayBhdCB3aGVyZSB0aGUgYGlmYCBpcy4gSXQgaXMgaW4gYGhvb2tzYCwgZGVjaWRpbmcgKip3aGV0aGVyIHRvIHN1cHBseSB0aGUKaG9vayBhdCBhbGwqKiwgbm90IGluc2lkZSBgbWVzc2FnZVRleHRgLCByZXR1cm5pbmcgYHJhd2AgdW5jaGFuZ2VkLgoKQm90aCBsb29rIGlkZW50aWNhbCB0byB0aGUgcGxheWVyLiBUaGV5IGFyZSBub3QgdGhlIHNhbWUgdGhpbmc6CgotICoqQ2hlY2tpbmcgaW5zaWRlIHRoZSBob29rKiogbWVhbnMgdGhlIGdhbWUgY2FsbHMgeW91ciBmdW5jdGlvbiBmb3IgZXZlcnkKICBtZXNzYWdlIGl0IGV2ZXIgcHJpbnRzLCBmb3JldmVyLCBhbmQgeW91ciBmdW5jdGlvbiBkZWNpZGVzIHRvIGRvIG5vdGhpbmcuCi0gKipDaGVja2luZyBhcm91bmQgdGhlIGhvb2sqKiBtZWFucyB0aGF0IHdoZW4gdGhlIG9wdGlvbiBpcyBvZmYsIHlvdSBzdXBwbGllZCBubwogIGhvb2ssIHNvIHRoZSBnYW1lIHJ1bnMgaXRzIG93biB1bnRvdWNoZWQgcGF0aCBhbmQgeW91ciBtb2QgaXMgbm90IGluIGl0IGF0IGFsbC4KClRoZSBzZWNvbmQgaXMgdGhlIHNoYXBlIHRvIHJlYWNoIGZvci4gQSBkaXNhYmxlZCBvcHRpb24gc2hvdWxkIGNvc3Qgbm90aGluZyBhbmQKc2hvdWxkIGJlIGluZGlzdGluZ3Vpc2hhYmxlIGZyb20geW91ciBtb2Qgbm90IGV4aXN0aW5nLiBUaGF0IGlzIG5vdAptaWNyby1vcHRpbWlzYXRpb24uIEl0IGlzIHdoYXQgbWFrZXMgaXQgKnRydWUqIHRoYXQgdHVybmluZyBzb21ldGhpbmcgb2ZmIGdpdmVzCnlvdSB0aGUgYmFzZSBnYW1lIGJhY2suCgojIyBEZWZhdWx0IG9mZgoKYCJkZWZhdWx0IjogZmFsc2VgLCBhbmQgdGhpcyBpcyB3b3J0aCBzdGF0aW5nIGFzIGEgaGFiaXQgcmF0aGVyIHRoYW4gYSBkZXRhaWw6CioqYSBtb2QgYmVpbmcgZW5hYmxlZCBzaG91bGQgbm90IGJlIHRoZSBzYW1lIGFzIGFsbCBvZiBpdHMgZmVhdHVyZXMgYmVpbmcgb24uKioKClNvbWVvbmUgaW5zdGFsbHMgeW91ciBtb2QgYmVjYXVzZSB0aGV5IHdhbnQgb25lIHRoaW5nIGluIGl0LiBTaGlwcGluZyBldmVyeQp0b2dnbGUgb24gbWVhbnMgdGhleSBnZXQgZml2ZSBjaGFuZ2VzIHRoZXkgZGlkIG5vdCBhc2sgZm9yIGFuZCBub3cgaGF2ZSB0bwpkaXNjb3ZlciBhIHNldHRpbmdzIHNjcmVlbiB0byB1bmRvLiBTaGlwIHRoZW0gb2ZmLCBkZXNjcmliZSBlYWNoIG9uZSBjbGVhcmx5LCBhbmQKbGV0IHRoZW0gY2hvb3NlLgoKVGhlIGZpcnN0LXBhcnR5IGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2Qgd29ya3MgZXhhY3RseSB0aGlzIHdheTogZW5hYmxpbmcgaXQKY2hhbmdlcyBub3RoaW5nIGF0IGFsbCB1bnRpbCB5b3UgcGljayBhIGZlYXR1cmUuCgojIyBXaGF0IHlvdSBzaG91bGQgc2VlCgpFbmFibGUgdGhlIG1vZCBhbmQgcmVsb2FkLiBOb3RoaW5nIGNoYW5nZXMgeWV0LCBhbmQgdGhhdCBpcyBjb3JyZWN0LgoKUHJlc3MgYEVzY2FwZWAsIGNob29zZSAqKk1vZHMqKiwgY2hvb3NlIHlvdXIgbW9kLCBhbmQgeW91IHdpbGwgZmluZCAqQ29uZ3JhdHVsYXRlCm1lIG9uIGdhaW5pbmcgYSBsZXZlbCogb24gaXRzIG93biBzY3JlZW4sIG9mZi4gVHVybiBpdCBvbiwgY2hvb3NlICoqQXBwbHkgY2hhbmdlcwphbmQgcmVsb2FkKiosIGFuZCBnYWluIGEgbGV2ZWwuCgojIyBUcnkgY2hhbmdpbmcgdGhpcwoKLSBBZGQgYSAqKnNlY29uZCoqIG9wdGlvbiwgY29udHJvbGxpbmcgc29tZXRoaW5nIGVsc2UsIGFuZCBzZWUgYm90aCBhcHBlYXIuCi0gTWFrZSBvbmUgKipkZWZhdWx0IG9uKiogYW5kIG5vdGljZSBob3cgZGlmZmVyZW50bHkgdGhlIG1vZCBmZWVscyB0byBpbnN0YWxsLgogIFRoZW4gZGVjaWRlIHdoZXRoZXIgeW91IHdlcmUgcmlnaHQuCi0gUmVuYW1lIGEgcnVsZSBmbGFnIG9yIGEgc2VjdGlvbiBhbmQgcmVhZCBhYm91dCBgcmVuYW1lZFJ1bGVGbGFnc2AgYW5kCiAgYHJlbmFtZWRTZWN0aW9uRmxhZ3NgIGluIFtBVVRIT1JJTkcubWRdKC4uL0FVVEhPUklORy5tZCksIHNpbmNlIHRoZXJlIGlzIGEKICBzdXBwb3J0ZWQgd2F5IHRvIGRvIGVpdGhlciB3aXRob3V0IGxvc2luZyBldmVyeW9uZSdzIHNhdmVkIGNob2ljZS4KCiMjIFRoZSBmaW5pc2hlZCB2ZXJzaW9uCgpgc2FtcGxlcy90dXRvcmlhbHMvdHV0b3JpYWwtMDYtYWRkLWFuLW9wdGlvbi9gLiBJdHMgdGVzdCBhc3NlcnRzIHRoZSBpbnRlcmVzdGluZyBoYWxmOgp0aGF0IHdpdGggdGhlIG9wdGlvbiBvZmYsIHRoZSBtb2Qgc3VwcGxpZXMgKipubyBob29rIGF0IGFsbCoqLgoKLS0tCgojIyBZb3UgaGF2ZSBmaW5pc2hlZCB0aGUgY29yZSBzaXgKClNpeCBtb2RzLCBhbmQgYmV0d2VlbiB0aGVtIHRoZXkgY292ZXIgdGhlIHNoYXBlIG9mIG5lYXJseSBldmVyeXRoaW5nIGVsc2U6CmNoYW5naW5nIGRhdGEsIGFkZGluZyBkYXRhLCBydW5uaW5nIGNvZGUsIGFuZCBsZXR0aW5nIHRoZSBwbGF5ZXIgZGVjaWRlLgoKKipPbmUgbW9yZSwgaWYgeW91IHdhbnQgaXQ6KiogW1R1dG9yaWFsIDddKDA3LWFkZC1hbi1hcnRpZmFjdC5tZCkgYWRkcyBhbgphcnRpZmFjdC4gSXQgaXMgdGhlIG9kZCBvbmUgb3V0LCBiZWNhdXNlIGFuIGFydGlmYWN0IGlzIGEgbGF5ZXIgb3ZlciBhbiBpdGVtCnJhdGhlciB0aGFuIGFuIGl0ZW0sIHNvIGl0IGlzIHdvcnRoIGRvaW5nIG9uY2UgZXZlbiB0aG91Z2ggbm90aGluZyBuZXcgYWJvdXQgdGhlCm1vZCBzeXN0ZW0gaXMgaW4gaXQuCgpXaGVyZSB0byBnbyBhZnRlciB0aGF0IGRlcGVuZHMgb24gd2hhdCB5b3Ugd2FudCB0byBidWlsZC4gU2VlClt0aGUgbGVhcm5pbmcgcGF0aF0oUkVBRE1FLm1kI2FmdGVyLXRoZS10dXRvcmlhbHMpLgo="
  },
  {
    "id": "tutorial-07",
    "path": "tutorials/07-add-an-artifact.md",
    "audience": "beginner",
    "title": "7. Add an artifact",
    "note": "Build on top of an item and keep it composable.",
    "encoded": "IyBUdXRvcmlhbCA3OiBBZGQgYW4gYXJ0aWZhY3QKCioqV2hhdCB5b3Ugd2lsbCBtYWtlOioqIHRoZSBMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllLCBhIG9uZS1vZi1hLWtpbmQKc2hpZWxkIHRoYXQgdHVybnMgdXAgc29tZXdoZXJlIGFyb3VuZCBkdW5nZW9uIGxldmVsIDEyIGFuZCBuZXZlciB0dXJucyB1cCB0d2ljZS4KCioqQmVmb3JlIHRoaXM6KiogW1R1dG9yaWFsIDJdKDAyLWFkZC1hbi1pdGVtLm1kKS4gVHV0b3JpYWxzIDMgdG8gNiBhcmUgbm90CnJlcXVpcmVkIGZvciB0aGlzIG9uZSwgYnV0IDIgaXM6IGFuIGFydGlmYWN0IHN0YW5kcyBvbiB0b3Agb2YgYW4gb3JkaW5hcnkgaXRlbSwKc28gaXQgaGVscHMgdG8gaGF2ZSBhZGRlZCBvbmUgZmlyc3QuCgoqKlRpbWU6KiogdGVuIG1pbnV0ZXMuCgotLS0KCiMjIFdoYXQgYW4gYXJ0aWZhY3QgYWN0dWFsbHkgaXMKClRoaXMgaXMgdGhlIHdob2xlIHR1dG9yaWFsLCBzbyBpdCBpcyB3b3J0aCBnZXR0aW5nIHN0cmFpZ2h0IGJlZm9yZSB5b3UgdHlwZQphbnl0aGluZy4KCkFuIGFydGlmYWN0IGlzICoqbm90KiogYSBuZXcga2luZCBvZiBpdGVtLiBJdCBpcyBhIHNldCBvZiBhZGp1c3RtZW50cyB0byBhbiBpdGVtCnRoZSBnYW1lIGFscmVhZHkgaGFzLiAiVGhlIExlYXRoZXIgU2hpZWxkIG9mIHRoZSBXYXRjaGZ1bCBFeWUiIGlzIGEgcmVhbCBsZWF0aGVyCnNoaWVsZCwgb3V0IG9mIHRoZSByZWFsIGxlYXRoZXIgc2hpZWxkIGVudHJ5IGluIGBvYmplY3QuanNvbmAsIHdpdGggYSBkaWZmZXJlbnQKbmFtZSwgYmV0dGVyIG51bWJlcnMsIGFuZCBzb21lIGZsYWdzIGJvbHRlZCBvbi4gVGhhdCBpcyB3aHkgdGhlIHJlY29yZCBoYXMgYQpmaWVsZCBjYWxsZWQgYGJhc2Utb2JqZWN0YCBhbmQgd2h5IGFsbW9zdCBldmVyeSBvdGhlciBmaWVsZCBpcyBhIG51bWJlcjogeW91IGFyZQpkZXNjcmliaW5nIHRoZSBkaWZmZXJlbmNlLCBub3QgdGhlIHRoaW5nLgoKVHdvIGNvbnNlcXVlbmNlcyBmb2xsb3cgZnJvbSB0aGF0LCBhbmQgdGhleSBhcmUgd2hhdCBtYWtlcyBhcnRpZmFjdHMgZmVlbApkaWZmZXJlbnQgZnJvbSB0dXRvcmlhbCAyOgoKLSAqKkl0IGlzIHVuaXF1ZS4qKiBUaGUgZ2FtZSBnZW5lcmF0ZXMgZWFjaCBhcnRpZmFjdCBhdCBtb3N0IG9uY2UgcGVyIGNoYXJhY3Rlci4KICBUaGVyZSBpcyBubyBgYWxsb2NgIGZpZ2h0IHdpdGggYSBodW5kcmVkIG90aGVyIHNoaWVsZHM7IHRoZXJlIGlzIG9uZSBvZiB0aGVzZSwKICBvciB0aGVyZSBpcyBub3Qgb25lIHlldC4KLSAqKkl0IGluaGVyaXRzIHNvbWUgdGhpbmdzIGFuZCBub3Qgb3RoZXJzLioqIFRoZSBiYXNlIG9iamVjdCBzdXBwbGllcyB0aGUKICBraW5kJ3MgZmxhZ3MsIGFuZCBpdHMgYWN0aXZhdGlvbiB3aGVuIHlvdXIgYXJ0aWZhY3QgZGVjbGFyZXMgbm9uZS4gSXQgZG9lcyBOT1QKICBzdXBwbHkgdGhlIG51bWJlcnM6IGB3ZWlnaHRgLCBgYWNgLCBgdG8tYWAsIGB0by1oYCwgYHRvLWRgIGFuZCB0aGUgZGFtYWdlIGRpY2UKICBhbGwgY29tZSBmcm9tIHRoZSBhcnRpZmFjdCByZWNvcmQsIGFuZCBvbmUgeW91IGxlYXZlIG91dCBiaW5kcyB0byB6ZXJvIHJhdGhlcgogIHRoYW4gdG8gdGhlIGJhc2Ugb2JqZWN0J3MgdmFsdWUuIFNheSB0aGVtLiBBCiAgbGVhdGhlciBzaGllbGQncyB3ZWlnaHQgY2xhc3MsIGl0cyBtYXRlcmlhbCwgaG93IGl0IHJlYWN0cyB0byBhY2lkOiBhbGwgb2YgdGhhdAogIGFycml2ZXMgZm9yIGZyZWUgYmVjYXVzZSB5b3UgbmFtZWQgdGhlIGJhc2UuCgojIyBUaGUgd2hvbGUgbW9kCgpgYGAKbXktYXJ0aWZhY3QtbW9kLwogIG1hbmlmZXN0Lmpzb24KICBhcnRpZmFjdC5qc29uCmBgYAoKYG1hbmlmZXN0Lmpzb25gIGlzIHRoZSBzYW1lIHNoYXBlIGFzIGV2ZXJ5IHR1dG9yaWFsIGJlZm9yZSB0aGlzLCB3aXRoIGl0cyBvd24KYGlkYCBhbmQgYGRlc2NyaXB0aW9uYCwgYW5kIG9uZSBkaWZmZXJlbmNlIHdvcnRoIG5vdGljaW5nOiBpdHMgYGVuZ2luZWAgZmxvb3IgaXMKYD49MC4yMi4wYCByYXRoZXIgdGhhbiBgPj0wLjIwLjBgLCBiZWNhdXNlIHRoYXQgaXMgdGhlIHJlbGVhc2UgdGhlIGJlaGF2aW91ciB0aGlzCnBhZ2UgcmVsaWVzIG9uIGxhbmRlZCBpbi4gQW4gYGVuZ2luZWAgcmFuZ2UgaXMgYSBjbGFpbSBhYm91dCB3aGljaCBidWlsZHMgYSBtb2QKd2FzIHdyaXR0ZW4gYWdhaW5zdCwgc28gaXQgbW92ZXMgd2hlbiB3aGF0IHRoZSBtb2QgZGVwZW5kcyBvbiBtb3Zlcy4gVGhlIG5ldyBmaWxlCmlzIGBhcnRpZmFjdC5qc29uYDoKCmBgYGpzb24KewogICJyZWNvcmRzIjogWwogICAgewogICAgICAibmFtZSI6ICJvZiB0aGUgV2F0Y2hmdWwgRXllIiwKICAgICAgImJhc2Utb2JqZWN0IjogewogICAgICAgICJ0dmFsIjogInNoaWVsZCIsCiAgICAgICAgInN2YWwiOiAiTGVhdGhlciBTaGllbGQiCiAgICAgIH0sCiAgICAgICJsZXZlbCI6IDEyLAogICAgICAid2VpZ2h0IjogNTAsCiAgICAgICJjb3N0IjogMTQwMDAsCiAgICAgICJhbGxvYyI6IHsKICAgICAgICAiY29tbW9uIjogMTAsCiAgICAgICAgIm1pbm1heCI6ICIxMiB0byA3MCIKICAgICAgfSwKICAgICAgImF0dGFjayI6IHsKICAgICAgICAiaGQiOiAiMGQwIiwKICAgICAgICAidG8taCI6IDAsCiAgICAgICAgInRvLWQiOiAwCiAgICAgIH0sCiAgICAgICJhcm1vciI6IHsKICAgICAgICAiYWMiOiA4LAogICAgICAgICJ0by1hIjogMTAKICAgICAgfSwKICAgICAgImZsYWdzIjogWyJTRUVfSU5WSVMiLCAiUFJPVF9GRUFSIl0sCiAgICAgICJ2YWx1ZXMiOiBbIklORlJBWzJdIiwgIlJFU19EQVJLWzFdIl0sCiAgICAgICJkZXNjIjogWwogICAgICAgICJBIHJvdW5kIHNoaWVsZCBvZiBib2lsZWQgbGVhdGhlciwgaXRzIGJvc3Mgd29ya2VkIGludG8gYSBzaW5nbGUgb3BlbiBleWUuIiwKICAgICAgICAiICBUaGUgZXllIGRvZXMgbm90IGJsaW5rLCBhbmQgbmVpdGhlciwgd2hpbGUgeW91IGNhcnJ5IGl0LCBkbyB5b3UuIgogICAgICBdCiAgICB9CiAgXQp9CmBgYAoKVHVybiBpdCBvbiwgcm9sbCBhIGNoYXJhY3RlciwgYW5kIGdvIGRvd24uIFNvbWV3aGVyZSBiZXR3ZWVuIGxldmVsIDEyIGFuZCBsZXZlbAo3MCB5b3Ugd2lsbCBmaW5kIGl0LCBvbmNlLgoKIyMgVGhlIG5hbWUgaXMgbm90IHRoZSBuYW1lCgpMb29rIGF0IGBuYW1lYCBhZ2FpbjoKCmBgYGpzb24KIm5hbWUiOiAib2YgdGhlIFdhdGNoZnVsIEV5ZSIKYGBgCgpUaGF0IGlzIG5vdCBhIG1pc3Rha2UgYW5kIGl0IGlzIG5vdCBzaG9ydGhhbmQuIEFuIGFydGlmYWN0J3MgbmFtZSBpcyB0aGUgcGFydAp0aGF0IGdvZXMgKiphZnRlcioqIHRoZSBiYXNlIG9iamVjdCdzIG5hbWUsIGJlY2F1c2UgdGhlIGdhbWUgYXNzZW1ibGVzIHRoZSBmdWxsCm5hbWUgZnJvbSBib3RoIGhhbHZlczogYExlYXRoZXIgU2hpZWxkYCBwbHVzIGBvZiB0aGUgV2F0Y2hmdWwgRXllYCBnaXZlcyB5b3UgKnRoZQpMZWF0aGVyIFNoaWVsZCBvZiB0aGUgV2F0Y2hmdWwgRXllKiBpbiB0aGUgaXRlbSBsaXN0LgoKVGhpcyBpcyB3aHkgYXJ0aWZhY3QgbmFtZXMgaW4gdGhlIGJhc2UgZ2FtZSByZWFkIHRoZSB3YXkgdGhleSBkby4gTG9vayBpbgpgcGFja2FnZXMvY29udGVudC9wYWNrL2FydGlmYWN0Lmpzb25gIGFuZCB5b3Ugd2lsbCBmaW5kIGBvZiBHYWxhZHJpZWxgLCB3aGljaApiZWNvbWVzIHRoZSBQaGlhbCBvZiBHYWxhZHJpZWwsIGFsb25nc2lkZSBgJ0FuZ3Jpc3QnYCwgaW4gcXVvdGVzLCB3aGljaCBpcyBhCnByb3BlciBuYW1lIHRoYXQgcmVwbGFjZXMgdGhlIGJhc2UgbmFtZSByYXRoZXIgdGhhbiBmb2xsb3dpbmcgaXQuIFBpY2sgd2hpY2hldmVyCnJlYWRzIGNvcnJlY3RseSBmb3Igd2hhdCB5b3UgYXJlIG1ha2luZywgYW5kIHJlbWVtYmVyIHRoYXQgeW91IGFyZSB3cml0aW5nIGhhbGYKYSBuYW1lLgoKQWxzbyBub3RlIHdoYXQgaXMgKiphYnNlbnQqKjogbm8gYCZgLCBubyBgfmAuIFR1dG9yaWFsIDIncyBpdGVtIHdhcwpgIlBhZGRlZCBKZXJraW5+ImAsIHdpdGggYSBgfmAgbWFya2luZyB3aGVyZSB0aGUgcGx1cmFsIGdvZXMuIEFuIGFydGlmYWN0IGlzCnVuaXF1ZSwgc28gaXQgaXMgbmV2ZXIgcGx1cmFsLCBhbmQgaXQgbmV2ZXIgbmVlZHMgYW4gYXJ0aWNsZSBjaG9zZW4gZm9yIGl0LiBJZgp5b3UgY2FycnkgdHV0b3JpYWwgMidzIGhhYml0cyBvdmVyIHlvdSB3aWxsIGVuZCB1cCB3aXRoIGFuIGl0ZW0gY2FsbGVkICp0aGUKTGVhdGhlciBTaGllbGQgb2YgdGhlIFdhdGNoZnVsIEV5ZX4qLgoKIyMgVGhlIG9uZSB0aGluZyB0aGF0IHdpbGwgYml0ZSB5b3UKCioqYGJhc2Utb2JqZWN0YC4qKgoKQm90aCBoYWx2ZXMgb2YgaXQgaGF2ZSB0byBuYW1lIHNvbWV0aGluZyByZWFsOgoKLSAqKmB0dmFsYCoqIGlzIHRoZSBpdGVtIHR5cGUsIGFuZCBpdCBjb21lcyBmcm9tIGBvYmplY3RfYmFzZS5qc29uYC4gYHNoaWVsZGAsCiAgYHN3b3JkYCwgYGhhcmQgYXJtb3JgLCBgbGlnaHRgLCBgcmluZ2AuIE5vdGUgdGhlIEFtZXJpY2FuIHNwZWxsaW5nIG9uIHRoZQogIGFybW91ciBvbmVzLCB3aGljaCBjYXRjaGVzIHBlb3BsZSwgYW5kIG5vdGUgdGhhdCB0aGVzZSBhcmUgdGhlIGJhc2UgZ2FtZSdzCiAgb3duIHN0cmluZ3MgcmF0aGVyIHRoYW4gYW55dGhpbmcgeW91IGdldCB0byBjaG9vc2UuCi0gKipgc3ZhbGAqKiBpcyB0aGUgYmFzZSBvYmplY3QncyBuYW1lIGluc2lkZSB0aGF0IHR5cGUsIGZyb20gYG9iamVjdC5qc29uYCwgd2l0aAogIHRoZSBgJmAgYW5kIGB+YCBkZWNvcmF0aW9uIHN0cmlwcGVkIG9mZi4gVGhlIGVudHJ5IHJlYWRzCiAgYCImIExlYXRoZXIgU2hpZWxkfiJgOyB5b3Ugd3JpdGUgYCJMZWF0aGVyIFNoaWVsZCJgLgoKR2V0IHRoZSBgdHZhbGAgd3JvbmcgYW5kIHlvdXIgYXJ0aWZhY3QgaXMgZHJvcHBlZCwgd2l0aCBhIGxpbmUgaW4gdGhlIG1vZAptYW5hZ2VyIHNheWluZyB3aGljaCByZWNvcmQgYW5kIHdoeS4gVGhhdCBpcyBhIHJlYWwgYW5zd2VyIGFuZCB5b3UgY2FuIGFjdCBvbiBpdC4KCkdldCB0aGUgKipgc3ZhbGAqKiB3cm9uZyBhbmQgc29tZXRoaW5nIHNuZWFraWVyIGhhcHBlbnM6IHRoZSBnYW1lIGRvZXMgbm90CnJlZnVzZS4gSXQgY3JlYXRlcyBhbiBpbnZpc2libGUgcGxhY2Vob2xkZXIgYmFzZSBvYmplY3QgZm9yIHlvdSBhbmQgYnVpbGRzIHlvdXIKYXJ0aWZhY3Qgb24gdGhhdCBpbnN0ZWFkLCBiZWNhdXNlIHRoYXQgaXMgZXhhY3RseSBob3cgdGhlIGJhc2UgZ2FtZSdzIG93bgpQaGlhbCwgU3RhciBhbmQgQXJrZW5zdG9uZSB3b3JrOiB0aG9zZSB0aHJlZSBoYXZlIG5vIG9yZGluYXJ5IHZlcnNpb24gYW55d2hlcmUgaW4KYG9iamVjdC5qc29uYC4gVGhlIGJlaGF2aW91ciBpcyBjb3JyZWN0IGFuZCBpdCBpcyBsb2FkLWJlYXJpbmcuIEl0IGlzIGFsc28KZGlzdGluZ3Vpc2hhYmxlIGZyb20gYSBtaXNzcGVsbGluZywgdGhvdWdoLCBhbmQgdGhhdCBpcyB0aGUgcGFydCB3b3J0aCBrbm93aW5nOgpgYmFzZS1vYmplY3Quc3ZhbGAgaXMgYSBkZWNsYXJlZCByZWZlcmVuY2UsIHNvIGEgdHlwbyBpcyByZXBvcnRlZCBieSBuYW1lIG9uIHlvdXIKbW9kJ3Mgcm93IC0gKmJhc2Utb2JqZWN0LnN2YWwgbmFtZXMgdGhlIGJhc2Ugb2JqZWN0IHRoZSBhcnRpZmFjdCBpcyBidWlsdCBvbgoibGV0aGVyIHNoaWVsZCIsIGFuZCBubyBsb2FkZWQgcGFjayBkZWZpbmVzIGl0IGluIG9iamVjdCouClRoZSBzeW1wdG9tIGlzIGFuIGFydGlmYWN0IHRoYXQgZ2VuZXJhdGVzIGFuZCBlcXVpcHMgYnV0IHdob3NlIGJhc2UgaXMgYSBibGFuazoKbm8gd2VpZ2h0IGNsYXNzLCBub25lIG9mIHRoZSBiYXNlJ3Mgb3duIGJlaGF2aW91ciwgYW4gaXRlbSB0aGF0IGlzIHNvbWVob3cgbm90CnJlYWxseSBhIHNoaWVsZC4KClNvOiAqKmNvcHkgdGhlIGBzdmFsYCBvdXQgb2YgYG9iamVjdC5qc29uYC4qKiBEbyBub3QgdHlwZSBpdCBmcm9tIG1lbW9yeS4gVGhpcyBpcwp0aGUgb25lIGZpZWxkIGluIHRoaXMgZmlsZSB3aGVyZSBhIHR5cG8gcHJvZHVjZXMgYSB3b3JraW5nIGdhbWUgYW5kIGEgd3JvbmcKaXRlbS4KCiMjIFBhdGNoaW5nIGFuIGFydGlmYWN0IHRoZSBnYW1lIGFscmVhZHkgaGFzCgpUaGUgc2FtZSBmaWxlIGNhbiBjaGFuZ2UgYW4gZXhpc3RpbmcgYXJ0aWZhY3QsIHRoZSBzYW1lIHdheSB0dXRvcmlhbCAzIGNoYW5nZWQgYW4KZXhpc3RpbmcgbW9uc3Rlci4gQWRkIHRoaXMgYmVzaWRlIHlvdXIgYHJlY29yZHNgOgoKYGBganNvbgogICJmaWVsZFBhdGNoZXMiOiB7CiAgICAiY29yZTphbmdyaXN0IjogWwogICAgICB7ICJvcCI6ICJhZGQiLCAicGF0aCI6ICJhcm1vci50by1hIiwgInZhbHVlIjogMyB9CiAgICBdCiAgfQpgYGAKCmBhZGRgIGlzIHJlbGF0aXZlOiB0aHJlZSBtb3JlIHBvaW50cyBvZiBhcm1vdXIgdGhhbiBBbmdyaXN0IGFscmVhZHkgaGFkLCB3aGF0ZXZlcgp0aGF0IGlzLiBVc2UgYGFkZGAgcmF0aGVyIHRoYW4gYHNldGAgZm9yIGFueXRoaW5nIHlvdSBhcmUgYWRqdXN0aW5nIHJhdGhlciB0aGFuCmRlY2lkaW5nLCBhbmQgeW91ciBtb2Qgd2lsbCBzdXJ2aXZlIHRoZSBiYXNlIGdhbWUgcmV0dW5pbmcgdGhlIG51bWJlciB1bmRlcm5lYXRoCnlvdS4KClRoZSByZWYgaXMgYGNvcmU6YCBwbHVzIHRoZSBhcnRpZmFjdCdzIG5hbWUgaW4gbG93ZXIgY2FzZSB3aXRoIHRoZSBwdW5jdHVhdGlvbgpkcm9wcGVkLCBzbyBgJ0FuZ3Jpc3QnYCBpcyBgY29yZTphbmdyaXN0YC4gSWYgYSByZWYgZG9lcyBub3QgcmVzb2x2ZSwgdGhlIGxvYWRlcgp0ZWxscyB5b3Ugc28gYnkgbmFtZTsgdGhhdCBpcyB0aGUgZnJpZW5kbHkgZmFpbHVyZSwgYW5kIGl0IGlzIHdoYXQKYG5weCBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIGlzIGZvci4KCiMjIFdoYXQgdG8gZmlkZGxlIHdpdGgKCkV2ZXJ5dGhpbmcgYmVsb3cgYGJhc2Utb2JqZWN0YCBpcyB0aGUgZnVuIHBhcnQuCgotICoqYGxldmVsYCoqIGlzIGhvdyBkZWVwIHRoZSBnYW1lIGNvbnNpZGVycyB0aGUgYXJ0aWZhY3QgdG8gYmUsIHdoaWNoIGZlZWRzCiAgaW50byBob3cgaXQgaXMgcHJpY2VkIGFuZCBob3cgZ29vZCBpdCBpcyBhbGxvd2VkIHRvIGJlLgotICoqYGFsbG9jYCoqIGlzIGBjb21tb25gLCB0aGUgd2VpZ2h0aW5nIGFnYWluc3QgZXZlcnl0aGluZyBlbHNlIGVsaWdpYmxlLCBhbmQKICBgbWlubWF4YCwgdGhlIGRlcHRoIGJhbmQgaXQgY2FuIGFwcGVhciBpbi4gYCIxMiB0byA3MCJgIG1lYW5zIGl0IHdpbGwgbm90IGJlCiAgZ2VuZXJhdGVkIHNoYWxsb3dlciB0aGFuIDEyIG9yIGRlZXBlciB0aGFuIDcwLgotICoqYGFybW9yLmFjYCoqIHJlcGxhY2VzIHRoZSBiYXNlIG9iamVjdCdzIGFybW91ciBjbGFzcywgYW5kICoqYGFybW9yLnRvLWFgKiogaXMKICB0aGUgYm9udXMgb24gdG9wLiBPbiBhIHdlYXBvbiB5b3Ugd291bGQgYmUgcmVhY2hpbmcgZm9yIGBhdHRhY2suaGRgLCBgdG8taGAgYW5kCiAgYHRvLWRgIGluc3RlYWQuCi0gKipgZmxhZ3NgKiogYXJlIHRoZSB5ZXMtb3Itbm8gcHJvcGVydGllczogYFNFRV9JTlZJU2AsIGBQUk9UX0ZFQVJgLAogIGBGUkVFX0FDVGAsIGBSRUdFTmAsIGFuZCBhIGxvbmcgbGlzdCBtb3JlLgotICoqYHZhbHVlc2AqKiBhcmUgdGhlIG9uZXMgdGhhdCBjYXJyeSBhIG51bWJlciwgd3JpdHRlbiB3aXRoIHRoZSBudW1iZXIgaW4KICBzcXVhcmUgYnJhY2tldHM6IGBJTkZSQVsyXWAsIGBSRVNfREFSS1sxXWAsIGBTVFJbMl1gLCBgU1BFRURbNV1gLgoKQm90aCBsaXN0cyBhcmUgaW4gYHBhY2thZ2VzL2NvbnRlbnQvcGFjay9vYmplY3RfcHJvcGVydHkuanNvbmAuIE9uZSBjYXRjaCB3aGVuCnlvdSBnbyBsb29raW5nOiBhIHJlc2lzdGFuY2UncyBgY29kZWAgdGhlcmUgaXMgdGhlIGJhcmUgZWxlbWVudAooYHJlc2lzdGFuY2U6REFSS2ApLCBhbmQgdGhlIHRva2VuIHlvdSB3cml0ZSBpbiBgdmFsdWVzYCBpcyBgUkVTX2AgcGx1cyB0aGF0CmVsZW1lbnQsIGFzc2VtYmxlZCB3aGVuIHRoZSByZWNvcmQgYmluZHMuIEdyZXBwaW5nIHRoZSBmaWxlIGZvciBgUkVTX0RBUktgIGZpbmRzCm5vdGhpbmcuIEZsYWdzIGFuZCBtb2RpZmllcnMgYXJlIHNwZWxsZWQgb3V0CnVuZGVyIGBjb2RlYCwgd2hpY2ggaXMgdGhlIGZpbGUgdG8gaGF2ZSBvcGVuIHdoaWxlIHlvdSB3cml0ZSB0aGlzIHJhdGhlciB0aGFuIHRoZQpvbmUgdG8gZ3Vlc3MgYXQuIEEgZmxhZyBvciBhIHZhbHVlIHRoZSBnYW1lIGRvZXMgbm90IHJlY29nbmlzZSBpcyByZWZ1c2VkIHdoZW4KeW91ciBtb2QgbG9hZHMsIHdoaWNoIGlzIHRoZSBnb29kIG91dGNvbWU7IHlvdSBnZXQgdG9sZCwgYmVmb3JlIHlvdSBwbGF5LgoKSWYgeW91IHdhbnQgYW4gYXJ0aWZhY3QgdGhhdCBkb2VzIHNvbWV0aGluZyB3aGVuIHlvdSBhY3RpdmF0ZSBpdCwgdGhhdCBpcyBgYWN0YApwbHVzIGB0aW1lYCwgYW5kIHRoZSBuYW1lcyBjb21lIGZyb20gYGFjdGl2YXRpb24uanNvbmAuIENvcHkgYSBiYXNlLWdhbWUgYXJ0aWZhY3QKdGhhdCBhbHJlYWR5IGFjdGl2YXRlcyBhbmQgY2hhbmdlIHRoZSBudW1iZXJzIGJlZm9yZSB3cml0aW5nIG9uZSBmcm9tIHNjcmF0Y2guCgojIyBXaGF0IHlvdSBsZWFybmVkCgotIEFuIGFydGlmYWN0IGlzIGEgKipsYXllciBvdmVyIGFuIGV4aXN0aW5nIGl0ZW0qKiwgbm90IGEgbmV3IGl0ZW0sIHdoaWNoIGlzIHdoeQogIGBiYXNlLW9iamVjdGAgZXhpc3RzIGFuZCB3aHkgdGhlIHJlc3QgaXMgbW9zdGx5IG51bWJlcnMuCi0gSXRzIGBuYW1lYCBpcyBvbmx5ICoqaGFsZiBhIG5hbWUqKiwgYW5kIGl0IHRha2VzIG5vbmUgb2YgdGhlIGAmYCBhbmQgYH5gCiAgZGVjb3JhdGlvbiBhbiBvcmRpbmFyeSBpdGVtJ3MgbmFtZSBuZWVkcy4KLSBBIHdyb25nIGB0dmFsYCBnZXRzIHJlcG9ydGVkLiBBIHdyb25nIGBzdmFsYCAqKnNpbGVudGx5IGludmVudHMgYSBiYXNlIG9iamVjdCoqLAogIGJlY2F1c2UgdGhlIGJhc2UgZ2FtZSBuZWVkcyB0aGF0IGJlaGF2aW91ciBmb3IgdGhlIFBoaWFsLiBDb3B5IHRoZSBzdmFsLgotIGBhZGRgIGJlYXRzIGBzZXRgIHdoZW4geW91IGFyZSBhZGp1c3RpbmcgYSBudW1iZXIgdGhlIGJhc2UgZ2FtZSBvd25zLgoKIyMgVGhlIGZpbmlzaGVkIHZlcnNpb24KCmBzYW1wbGVzL3R1dG9yaWFscy90dXRvcmlhbC0wNy1hZGQtYW4tYXJ0aWZhY3QvYCBpbiB0aGlzIHJlcG9zaXRvcnkgaXMgZXhhY3RseQp0aGlzIG1vZC4gSXQgaXMgbm90IGEgY29weSBvZiB0aGUgdHV0b3JpYWwuIEl0IGlzIGEgbW9kIHRoYXQgZ2V0cyBsb2FkZWQgYW5kCmNoZWNrZWQgYWdhaW5zdCB0aGUgcmVhbCBnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4sIHNvIGlmIGFueXRoaW5nIG9uIHRoaXMKcGFnZSBldmVyIHN0b3BzIGJlaW5nIHRydWUsIHRoZSBidWlsZCBmYWlscy4KCioqTmV4dDoqKiBub3RoaW5nLCB0aGlzIGlzIHRoZSBsYXN0IG9uZS4gV2hhdCBpcyB3b3J0aCByZWFkaW5nIGFmdGVyIHRoZXNlIGlzCmxpc3RlZCBhdCB0aGUgZW5kIG9mIHRoZSBbdHV0b3JpYWwgaW5kZXhdKFJFQURNRS5tZCksIGFuZApbUkVRVUlSRU1FTlRTLm1kXSguLi9SRVFVSVJFTUVOVFMubWQpIGlzIHRoZSBvbmUgdG8gcmVhZCBmaXJzdCBpZiB5b3UgYXJlIGFib3V0CnRvIHNoYXJlIGEgbW9kIHdpdGggc29tZWJvZHkuCg=="
  },
  {
    "id": "tutorials",
    "path": "tutorials/README.md",
    "audience": "beginner",
    "title": "The beginner path",
    "note": "How the seven lessons fit together, and what to read next.",
    "encoded": "IyBNYWtlIGEgbW9kCgoqKk5ldmVyIG1hZGUgYSBtb2QgYmVmb3JlPyBUaGF0IGlzIGZpbmUuKiogVGhlc2Ugc2V2ZW4gdHV0b3JpYWxzIGFzc3VtZSB5b3UgY2FuCmVkaXQgYSB0ZXh0IGZpbGUgYW5kIG5vdGhpbmcgZWxzZS4gVGhlIGZpcnN0IG9uZSB0YWtlcyBhYm91dCBmaXZlIG1pbnV0ZXMgYW5kCmNoYW5nZXMgdGhlIGdhbWUuCgpZb3UgZG8gbm90IG5lZWQgdG8ga25vdyBUeXBlU2NyaXB0LiBZb3UgZG8gbm90IG5lZWQgYSBjb21waWxlciwgYSBidWlsZCBzdGVwLCBhbgphY2NvdW50LCBvciBhIGNvcHkgb2YgQW5nYmFuZCdzIHNvdXJjZS4gQSBtb2QgaXMgYSBmb2xkZXIgd2l0aCBhIGNvdXBsZSBvZiBmaWxlcwppbiBpdC4KCi0tLQoKIyMgVGhlIHNldmVuIHR1dG9yaWFscwoKRWFjaCBvbmUgdGVhY2hlcyBleGFjdGx5IG9uZSBpZGVhIGFuZCBlbmRzIHdpdGggc29tZXRoaW5nIHlvdSBjYW4gc2VlIG9uIHNjcmVlbi4KCnwgfCBUdXRvcmlhbCB8IFdoYXQgeW91IGxlYXJuIHwgRmlsZXMgfAp8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLSB8CnwgMSB8IFtDaGFuZ2Ugb25lIHRoaW5nXSgwMS10d2Vhay1hLXZhbHVlLm1kKSB8IEVkaXRpbmcgYSB2YWx1ZSB0aGUgZ2FtZSBhbHJlYWR5IGhhcyB8IDIgfAp8IDIgfCBbQWRkIGFuIGl0ZW1dKDAyLWFkZC1hbi1pdGVtLm1kKSB8IEFkZGluZyBzb21ldGhpbmcgdGhlIGdhbWUgaGFzIG5ldmVyIHNlZW4gfCAzIHwKfCAzIHwgW0FkZCBhIG1vbnN0ZXJdKDAzLWFkZC1hLW1vbnN0ZXIubWQpIHwgVGhlIHNhbWUgbW92ZSBpbiBhbm90aGVyIGZpbGUsIHBsdXMgdGhlIG9uZSBmaWVsZCB0aGF0IHdpbGwgYml0ZSB5b3UgfCAyIHwKfCA0IHwgW0NoYW5nZSBhIHNwZWxsXSgwNC1jaGFuZ2UtYS1zcGVsbC5tZCkgfCBSZWFjaGluZyBpbnRvIGEgY2xhc3MsIGFuZCB3aGF0IGEgcG9zaXRpb25hbCBwYXRoIGNvc3RzIHwgMiB8CnwgNSB8IFtIb29rIGJlaGF2aW91cl0oMDUtaG9vay1iZWhhdmlvdXIubWQpIHwgWW91ciBtb2QgcnVubmluZyBjb2RlLCBpbiB0ZW4gbGluZXMgfCAyIHwKfCA2IHwgW0FkZCBhbiBvcHRpb25dKDA2LWFkZC1hbi1vcHRpb24ubWQpIHwgTGV0dGluZyB0aGUgcGxheWVyIHN3aXRjaCB5b3VyIGNoYW5nZSBvbiBhbmQgb2ZmIHwgMiB8CnwgNyB8IFtBZGQgYW4gYXJ0aWZhY3RdKDA3LWFkZC1hbi1hcnRpZmFjdC5tZCkgfCBCdWlsZGluZyBvbiB0b3Agb2YgYW4gaXRlbSB0aGUgZ2FtZSBhbHJlYWR5IGhhcyB8IDIgfAoKRG8gdGhlbSBpbiBvcmRlciBpZiB5b3UgYXJlIG5ldy4gVGhleSBidWlsZCBvbiBlYWNoIG90aGVyLCBhbmQgZWFjaCBvbmUgaXMgc2hvcnQKZW5vdWdoIHRvIHJlYWQgaW4gZnVsbCBiZWZvcmUgeW91IHR5cGUgYW55dGhpbmcuIFR1dG9yaWFsIDcgaXMgdGhlIG9uZSBleGNlcHRpb246Cml0IG5lZWRzIHR1dG9yaWFsIDIgYW5kIG5vdGhpbmcgZWxzZSwgc28geW91IGNhbiBqdW1wIHRvIGl0IGlmIGFuIGFydGlmYWN0IGlzCndoYXQgYnJvdWdodCB5b3UgaGVyZS4KCioqVGhlc2UgYXJlIG5vdCBzbmlwcGV0cy4qKiBFdmVyeSB0dXRvcmlhbCdzIGZpbmlzaGVkIG1vZCBpcyBhIHJlYWwgZm9sZGVyIGluCnRoaXMgcmVwb3NpdG9yeSB1bmRlciBgc2FtcGxlcy90dXRvcmlhbHMvYCwgbG9hZGVkIGFuZCBjaGVja2VkIGFnYWluc3QgdGhlIGFjdHVhbApnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4sIGluY2x1ZGluZyBhIGNoZWNrIHRoYXQgZWFjaCBvbmUgd291bGQgYmUgYWNjZXB0ZWQKYnkgdGhlIHNhbWUgZm9sZGVyIHJlYWRlciB0aGUgZ2FtZSBpdHNlbGYgdXNlcy4gSWYgYSB0dXRvcmlhbCBldmVyIHN0b3BzIHdvcmtpbmcsCnRoZSBidWlsZCBmYWlscyBiZWZvcmUgeW91IGZpbmQgb3V0IHRoZSBoYXJkIHdheS4KCioqWW91IGNhbiBydW4gdGhlbSB3aXRob3V0IHR5cGluZyBhbnl0aGluZy4qKiBDb3B5IGFueSBvZiB0aGUgc2V2ZW4gZm9sZGVycyBvdXQgb2YKYHNhbXBsZXMvdHV0b3JpYWxzL2AgaW50byB0aGUgYG1vZHMvYCBmb2xkZXIgYmVzaWRlIHRoZSBkZXNrdG9wIGJ1aWxkIChvciBwb2ludCBhCmJyb3dzZXIgYXQgYHNhbXBsZXMvdHV0b3JpYWxzL2Agd2l0aCAqKkNob29zZSBhIG1vZHMgZm9sZGVyLi4uKiopLCBhbmQgdGhleSB0dXJuCm9uIGZyb20gdGhlIE1vZHMgc2NyZWVuIGxpa2UgYW55IG90aGVyIG1vZC4gVGhleSBhcmUgbmFtZWQgYHR1dG9yaWFsLTAxLS4uLmAgdG8KYHR1dG9yaWFsLTA3LS4uLmAgc28gYWxsIHNldmVuIGNhbiBzaXQgdGhlcmUgYXQgb25jZS4gVHlwaW5nIHlvdXIgb3duIGlzIHN0aWxsIHRoZQpiZXR0ZXIgd2F5IHRvIGxlYXJuLCBidXQgaGF2aW5nIGEga25vd24tZ29vZCBjb3B5IHRvIGNvbXBhcmUgYWdhaW5zdCBpcyB3b3J0aCBhCmxvdCB3aGVuIHlvdXJzIGRvZXMgbm90IHdvcmsgYW5kIHlvdSBjYW5ub3Qgc2VlIHdoeS4KCi0tLQoKIyMgV2h5IG5vdCBqdXN0IGVkaXQgQW5nYmFuZD8KCllvdSBhYnNvbHV0ZWx5IGNhbi4gQW5nYmFuZCBoYXMgYmVlbiBjdXN0b21pc2FibGUgZnJvbSB0ZXh0IGZpbGVzIGZvciBkZWNhZGVzLAphbmQgaWYgZWRpdGluZyB0aGVtIGlzIHdvcmtpbmcgZm9yIHlvdSwgbm90aGluZyBoZXJlIGlzIHRyeWluZyB0byB0YWxrIHlvdSBvdXQgb2YKaXQuCgpOZW8gQW5nYmFuZCBpcyBmb3Igd2hlbiB5b3Ugd291bGQgcmF0aGVyIHlvdXIgY2hhbmdlIGJlIGEgKipwb3J0YWJsZSB0aGluZyoqIHRoYW4KYW4gZWRpdDoKCi0gKipUaGUgYmFzZSBnYW1lIHN0YXlzIHVudG91Y2hlZC4qKiBZb3VyIGNoYW5nZSBpcyBhIGxheWVyIG92ZXIgaXQsIG5vdCBhCiAgbW9kaWZpY2F0aW9uIG9mIGl0LgotICoqSXQgaGFzIGFuIG9mZiBzd2l0Y2gqKiwgYW5kIHR1cm5pbmcgaXQgb2ZmIGdpdmVzIGJhY2sgdGhlIHVubW9kaWZpZWQgZ2FtZQogIGV4YWN0bHkuCi0gKipZb3Ugc2hhcmUgYSBmb2xkZXIgb3IgYSByZXBvc2l0b3J5IGxpbmsqKiwgbm90IGEgZm9yayBhbmQgbm90IGEgcGF0Y2ggZmlsZS4KLSAqKlNldmVyYWwgbW9kcyBjb21iaW5lKiosIGZyb20gc2V2ZXJhbCBwZW9wbGUsIHdpdGhvdXQgYW55IG9mIHRoZW0gaGF2aW5nIHRvCiAga25vdyBhYm91dCBlYWNoIG90aGVyLgotICoqWW91IGNhbiBleHBvc2Ugc2V0dGluZ3MqKiBzbyB0aGUgcGVvcGxlIHVzaW5nIGl0IGNhbiB0dW5lIGl0IHdpdGhvdXQgZWRpdGluZwogIGl0LgotICoqVGhlIGdhbWUgY2FuIHVwZGF0ZSB1bmRlcm5lYXRoIGl0Kiogd2l0aG91dCB5b3UgcmUtYXBwbHlpbmcgYW55dGhpbmcuCi0gKipJdCBzY2FsZXMgYWxsIHRoZSB3YXkgdXAuKiogVGhlIHNhbWUgc3lzdGVtIHRoYXQgY2hhbmdlcyBvbmUgbnVtYmVyIGNhbiBjYXJyeQogIGFuIGVudGlyZSB2YXJpYW50LgoKVGhhdCBsYXN0IHBvaW50IGlzIHRoZSByZWFsIG9uZS4gVGhlIHNwZWN0cnVtIHJ1bnMgZnJvbToKCj4gKiJJIG1pc3MgdGhpcyBvbmUgZmVhdHVyZS4iKgoKdG86Cgo+ICoiSSB3YW50IHRvIGJ1aWxkIHRoZSBuZXh0IFpBbmdiYW5kLiIqCgphbmQgYm90aCBlbmRzIHVzZSB0aGUgc2FtZSBtZWNoYW5pc20uIFR1dG9yaWFsIDEgaXMgdGhlIGZpcnN0IGVuZC4gTm90aGluZwpzdHJ1Y3R1cmFsIHN0YW5kcyBiZXR3ZWVuIGl0IGFuZCB0aGUgc2Vjb25kOiBhIHRvdGFsIGNvbnZlcnNpb24gaXMgdGhpcyBzYW1lCnN5c3RlbSB1c2VkIGF0IGZ1bGwgdGhyb3R0bGU6IGRlcGVuZCBvbiB0aGUgYmFzZSBnYW1lLCByZXBsYWNlIHdoYXQgeW91IGRvIG5vdAp3YW50LCBhZGQgeW91ciBvd24gd29ybGQuCgotLS0KCiMjIFZhbmlsbGEgc3RheXMgdmFuaWxsYQoKQSBmYWlyIHdvcnJ5IGFib3V0IGVhc3kgbW9kZGluZyBpcyB0aGF0IGEgY29tbXVuaXR5IGVuZHMgdXAgd2l0aCBhIHRob3VzYW5kCnBlcnNvbmFsIHZlcnNpb25zIG9mIHRoZSBnYW1lIGFuZCBubyBzaGFyZWQgZ3JvdW5kLgoKVGhhdCBpcyBub3Qgd2hhdCB0aGlzIGlzIGZvciwgYW5kIHRoZSBkZXNpZ24gc2F5cyBzbzoKCi0gKipUaGUgYmFzZSBnYW1lIHNoaXBzIGFzIHRoZSBzaGFyZWQgdmFuaWxsYSB0YXJnZXQqKiwgdGhlIGxhdGVzdCBvZmZpY2lhbAogIEFuZ2JhbmQgcmVsZWFzZSwgZmFpdGhmdWxseSwgd2l0aCBubyBtb2RzIGVuYWJsZWQuIFRoYXQgaXMgd2hhdCBhbiB1bnRvdWNoZWQKICBpbnN0YWxsIGdpdmVzIHlvdSBhbmQgd2hhdCB0aGUgcHJvamVjdCBtZWFzdXJlcyBpdHNlbGYgYWdhaW5zdC4KLSAqKlRoaXMgcHJvamVjdCBidW5kbGVzIG5vIG1vZHMgYXQgYWxsLioqIE5vdCBldmVuIHRoZSBhdXRob3Incy4gRXZlcnkgb25lIG9mCiAgdGhlbSBpbnN0YWxscyB0aGUgc2FtZSB3YXkgeW91cnMgd291bGQuCi0gKipFdmVyeSBtb2QgaXMgYSBsYXllciB5b3UgY2FuIG5hbWUsIGxpc3QsIGFuZCByZW1vdmUuKiogQSBnYW1lJ3MgZW5hYmxlZCBtb2RzCiAgYW5kIHZlcnNpb25zIGFyZSByZWNvcmRlZCBpbiBpdHMgZGlhZ25vc3RpY3MgYW5kIHdyaXR0ZW4gaW50byB0aGUgY2hhcmFjdGVyCiAgZHVtcCwgc28gYW55IHR3byBwZW9wbGUgY2FuIHRlbGwgd2hldGhlciB0aGV5IHdlcmUgcGxheWluZyB0aGUgc2FtZSB0aGluZy4KCk1vZHMgYXJlIGhvdyB5b3UgZXhwZXJpbWVudCAqd2l0aG91dCogZnJhZ21lbnRpbmcgdGhlIGJhc2VsaW5lLCBub3QgaW5zdGVhZCBvZgpoYXZpbmcgb25lLgoKLS0tCgojIyBXaGF0IHdvdWxkIEkgZXZlbiBtb2Q/CgpJZiB5b3Ugd2FudCBhIHN0YXJ0aW5nIHBvaW50IHJhdGhlciB0aGFuIGEgYmxhbmsgZm9sZGVyOgoKLSBCcmluZyBiYWNrIGEgZmVhdHVyZSBhbiBvbGRlciBBbmdiYW5kIGhhZCBhbmQgYSBuZXdlciBvbmUgZHJvcHBlZAotIEFkZCBhIG1vbnN0ZXIsIG9yIGEgZmFtaWx5IG9mIHRoZW0KLSBBZGQgYW4gYXJ0aWZhY3Qgd29ydGggZGVzY2VuZGluZyBmb3IsIHdoaWNoIGlzIFt0dXRvcmlhbCA3XSgwNy1hZGQtYW4tYXJ0aWZhY3QubWQpCi0gV3JpdGUgYSBuZXcgc3BlbGwsIG9yIG1vdmUgb25lIHRvIGEgY2xhc3MgdGhhdCBuZXZlciBnb3QgaXQKLSBDaGFuZ2Ugd2hhdCB0aGUgc3RvcmVzIHN0b2NrLCBvciBob3cgdGhleSBwcmljZSBpdAotIEFkZCBhIHF1YWxpdHktb2YtbGlmZSBiZWhhdmlvdXIgdGhhdCBoYXMgYmVlbiBhbm5veWluZyB5b3UgZm9yIHllYXJzCi0gUmVwbGFjZSB0aGUgZ3JhcGhpY3MKLSBBdXRvbWF0ZSBzb21ldGhpbmcgdGVkaW91cwotIEJ1aWxkIGEgdGhlbWVkIGNvbnRlbnQgcGFjaywgYSB3aG9sZSBkdW5nZW9uJ3Mgd29ydGggb2Ygb25lIGlkZWEKLSBUcnkgYSBtZWNoYW5pYyBub2JvZHkgaGFzIHRyaWVkLCBhbmQgZmluZCBvdXQgd2h5IG5vYm9keSBoYXMKLSBSZWJhbGFuY2UgYSBjbGFzcyB5b3UgdGhpbmsgaGFzIGFsd2F5cyBiZWVuIHdyb25nCi0gRXZlbnR1YWxseTogeW91ciBvd24gdmFyaWFudAoKVGhlIFtmZWF0dXJlIHJlc3RvcmF0aW9uXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL21vZGRpbmcvRkVBVFVSRV9SRVNUT1JBVElPTi5tZCkgaWRlYSBpbiBwYXJ0aWN1bGFyIGNhbWUKc3RyYWlnaHQgb3V0IG9mIGEgcGxheWVyIGNvbnZlcnNhdGlvbiwgYW5kIGl0IHR1cm5lZCBpbnRvIGEgc2hpcHBlZCBtb2QuCgotLS0KCiMjIEFmdGVyIHRoZSB0dXRvcmlhbHMKClJvdWdobHkgaW4gb3JkZXIgb2YgaG93IG11Y2ggeW91IG5lZWQgdG8ga25vdzoKCjEuICoqW1JFUVVJUkVNRU5UUy5tZF0oLi4vUkVRVUlSRU1FTlRTLm1kKSoqOiBleGFjdGx5IHdoYXQgYSBtb2QgbXVzdCBwcm92aWRlIHRvCiAgIGJlIGluc3RhbGxhYmxlLiBHZW5lcmF0ZWQgZnJvbSB0aGUgcnVsZXMgdGhlIGdhbWUgYWN0dWFsbHkgZW5mb3JjZXMsIHNvIGl0CiAgIGNhbm5vdCBnbyBzdGFsZS4gUnVuIHRoZW0gYWdhaW5zdCB5b3VyIG93biBmb2xkZXIgd2l0aAogICBgbnB4IG5lby1hbmdiYW5kLW1vZC1jaGVjayBwYXRoL3RvL3lvdXItbW9kYC4KMi4gKipbQVVUSE9SSU5HLm1kXSguLi9BVVRIT1JJTkcubWQpKio6IHRoZSBzaG9ydGN1dHMuIGBkcmFmdFJlY29yZGAgZmlsbHMgaW4gYQogICBuZXcgcmVjb3JkIGZyb20gdGhlIGdhbWUncyBvd24gY29tcGFyYWJsZSBvbmVzLCBgY2hlY2tSZWNvcmRzYCBuYW1lcyBldmVyeSB3YXkKICAgeW91ciBkYXRhIHdpbGwgc2lsZW50bHkgbm90IHdvcmssIGFuZCBgTW9kUHJvamVjdGAgY29tcG9zZXMgYSB3aG9sZSBtb2QgdGhyb3VnaAogICB0aGUgcmVhbCBwaXBlbGluZSBiZWZvcmUgeW91IGxvYWQgaXQuIFJlYWQgdGhpcyBiZWZvcmUgd3JpdGluZyBtdWNoIGJ5IGhhbmQuCjMuICoqW1RoZSBtb2RkaW5nIGh1Yl0oLi4vUkVBRE1FLm1kKSoqOiBwYWNrIGFuYXRvbXksIHJlY29yZCBjb21wb3NpdGlvbiwKICAgbmFtZXNwYWNlZCBmaWVsZHMgb2YgeW91ciBvd24sIGFuZCB0aGUgaG9uZXN0IHRhYmxlIG9mIHdoYXQgaXMgYnVpbHQgdG9kYXkKICAgdmVyc3VzIHdoYXQgaXMgc3RpbGwgYSBkZXNpZ24uCjQuICoqW01PRF9TRUFNUy5tZF0oLi4vTU9EX1NFQU1TLm1kKSoqOiB0aGUgYmVoYXZpb3VyIGhvb2tzIGluIGZ1bGwsIGFuZCBob3cKICAgc2V2ZXJhbCBtb2RzJyBhbnN3ZXJzIGFyZSBjb21iaW5lZC4KNS4gKipbUExVR0lOUy5tZF0oLi4vUExVR0lOUy5tZCkqKiwgdGhlIHBsdWdpbiBjb250cmFjdCBpbiBkZXB0aDogdGhlIGNhcGFiaWxpdHkKICAgcmVnaXN0cmllcywgd2hhdCBhIHBsdWdpbiBjYW4gcmVhY2gsIGFuZCBjb25zZW50Lgo2LiAqKltNT0RfQ09NUEFUSUJJTElUWS5tZF0oLi4vTU9EX0NPTVBBVElCSUxJVFkubWQpKio6IHdoYXQgYW4gZW5naW5lIHJlbGVhc2UKICAgbWF5IGFuZCBtYXkgbm90IGJyZWFrLCBhbmQgd2hhdCB0byB3cml0ZSBpbiBgZW5naW5lYC4gUmVhZCB0aGlzIGJlZm9yZQogICBwdWJsaXNoaW5nLgo3LiAqKltNT0RfUkVBQ0gubWRdKC4uL01PRF9SRUFDSC5tZCkqKjogdGhlIG1lYXN1cmVkIGFuc3dlciB0byAiY2FuIGEgbW9kCiAgIGFjdHVhbGx5IGRvIFgiLiBMb25nLCBhbmQgdGhlIHBsYWNlIHRvIGNoZWNrIGEgY2FwYWJpbGl0eSBjbGFpbSBiZWZvcmUgeW91CiAgIGJ1aWxkIG9uIGl0LgoKKipSZWZlcmVuY2UgZG9jdW1lbnRzIGVudW1lcmF0ZTsgdHV0b3JpYWxzIHRlYWNoLioqIElmIHlvdSBhcmUgc3R1Y2sgb24gImhvdyBkbyBJCnN0YXJ0IiwgeW91IHdhbnQgYSB0dXRvcmlhbC4gSWYgeW91IGFyZSBzdHVjayBvbiAid2hhdCBpcyB0aGlzIGZpZWxkIGNhbGxlZCIsIHlvdQp3YW50IHRoZSByZWZlcmVuY2UuCgotLS0KCiMjIFJlYWQgYSByZWFsIG1vZAoKVGhlIGZpcnN0LXBhcnR5IG1vZHMgYXJlIGRlbGliZXJhdGVseSByZWFkYWJsZSwgYW5kIHRoZXkgZ2V0IHByb2dyZXNzaXZlbHkgbW9yZQppbnZvbHZlZDoKCnwgTW9kIHwgUmVhZCBpdCBmb3IgfAp8IC0tLSB8IC0tLSB8CnwgW3Vwc3RyZWFtLWNhdGNodXBdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC11cHN0cmVhbS1jYXRjaHVwKSB8IEFib3V0IHRoZSBzbWFsbGVzdCB1c2VmdWwgbW9kIHRoZXJlIGlzOiBvbmUgZmxhZywgb25lIHJlZ2lzdHJ5IGZpbGxlciwgYW5kIGEgUkVBRE1FIHRoYXQgY2l0ZXMgZXZlcnkgbGluZSBvZiBpdCB8CnwgW2ZlYXR1cmUtcmVzdG9yYXRpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1mZWF0dXJlLXJlc3RvcmF0aW9uKSB8IEEgc21hbGwgbW9kIHRoYXQgaXMgYm90aCBkYXRhIGFuZCBjb2RlLCB3aXRoIGV2ZXJ5IGZlYXR1cmUgYmVoaW5kIGl0cyBvd24gc3dpdGNoIHwKfCBbcW9sXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtcW9sKSB8IEJlaGF2aW91ciBob29rcyBpbiBhIHNoaXBwZWQgbW9kIHwKfCBbYnVnLWZpeGVzXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtYnVnLWZpeGVzKSB8IE1hbnkgc21hbGwsIGluZGVwZW5kZW50LCBpbmRpdmlkdWFsbHktc3dpdGNoYWJsZSBjaGFuZ2VzIHwKfCBbbGlub2xldW1dKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kLW1vZC1saW5vbGV1bSkgfCBBIHdob2xlIGFsdGVybmF0aXZlIHRpbGUgZW5naW5lLCBhbmQgYSBtb2QgdGhhdCBzaGlwcyBhcnQgfAp8IFtib3JnXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtYm9yZykgfCBBIG1vZCB0aGF0IHBsYXlzIHRoZSBnYW1lIHwKCk5vbmUgb2YgdGhlbSBpcyBidW5kbGVkIHdpdGggdGhlIGdhbWUgYW5kIG5vbmUgdGFrZXMgYSBwcml2YXRlIHBhdGggaW4uIFRoZXkKaW5zdGFsbCB0aGUgd2F5IHlvdXJzIGRvZXMsIHdoaWNoIGlzIHRoZSBvbmx5IHdheSB0byBrbm93IHRoYXQgcm91dGUgd29ya3MuCgotLS0KCiMjIFN0dWNrPwoKKipbVGhlIFJQR00gVG9vbHMgRGlzY29yZF0oaHR0cHM6Ly9kaXNjb3JkLmdnL1llZ3R3YkhUQlEpKio6IG5vIEdpdEh1YiBhY2NvdW50Cm5lZWRlZCwgYW5kICJjYW4gYSBtb2QgZG8gWD8iIGlzIGV4YWN0bHkgdGhlIHF1ZXN0aW9uIHdvcnRoIGFza2luZyBiZWZvcmUgeW91CmJ1aWxkIGFyb3VuZCBhIGd1ZXNzLgo="
  },
  {
    "id": "overview",
    "path": "README.md",
    "audience": "beginner",
    "title": "Modding overview",
    "note": "The SDK front door and pack anatomy.",
    "encoded": "IyBNb2RkaW5nIE5lbyBBbmdiYW5kCgo+ICMjIE5ldyB0byB0aGlzPyBEb24ndCBzdGFydCBoZXJlLgo+Cj4gKipbTWFrZSBhIG1vZF0odHV0b3JpYWxzL1JFQURNRS5tZCkqKiBpcyB0aGUgZnJvbnQgZG9vcjogc2V2ZW4gc2hvcnQgdHV0b3JpYWxzLAo+IHRoZSBmaXJzdCBvZiB3aGljaCBpcyB0d28gZmlsZXMgYW5kIHRha2VzIGFib3V0IGZpdmUgbWludXRlcy4gVGhpcyBwYWdlIGlzIHRoZQo+IHJlZmVyZW5jZTogaXQgZW51bWVyYXRlcywgaXQgZG9lcyBub3QgdGVhY2guCgpNb2RkYWJpbGl0eSBpcyBhIHJhdGlmaWVkIHBpbGxhciBvZiB0aGlzIHByb2plY3QgKFBPUlRfUExBTi5tZCBkZWNpc2lvbnMKMTMtMjEpOiBldmVyeSBhc3BlY3Qgb2YgdGhlIGdhbWUgaXMgb3BlbiB0byBtb2RzLCBpbmNsdWRpbmcgY2FwYWJpbGl0aWVzCnRoYXQgZG8gbm90IGV4aXN0IGluIHRoZSBiYXNlIHJlc291cmNlcy4gVGhlIGJhc2UgZ2FtZSBpcyBpdHNlbGYgYSBwYWNrCigiY29yZSIsIHBhY2sgemVybykgbG9hZGVkIHRocm91Z2ggdGhlIHNhbWUgcGlwZWxpbmUgeW91ciBtb2QgdXNlcyAtIGlmCmNvcmUgY2FuIGRvIGl0LCB5b3VyIG1vZCBjYW4gZG8gaXQsIHJlZGVmaW5lIGl0LCBvciBkZWxldGUgaXQuIENvcmUgaXMKcGFyaXR5IHBsdXMgdGhlIG1vZCBhcmNoaXRlY3R1cmUgb25seTsgZXZlcnl0aGluZyBlbHNlIC0gdGhlIGZpdmUgZmlyc3QtcGFydHkKbW9kcyBpbmNsdWRlZCAtIGlzIGEgbW9kIChkZWNpc2lvbnMgMTctMTgpLiBDaGVhdHkgbW9kcyBhcmUgYWxsb3dlZDogdGhlIGVuZ2luZQp3YXJucyBhbmQgbGFiZWxzLCBpdCBkb2VzIG5vdCBmb3JiaWQuCgpUaGlzIGRpcmVjdG9yeSBpcyB0aGUgbW9kZGluZyBTREsgZG9jdW1lbnRhdGlvbiBzZXQuIEl0IGdyb3dzIHdpdGggdGhlCmVuZ2luZTsgZWFjaCBwYWdlIGRvY3VtZW50cyBzdXJmYWNlcyB0aGF0IGV4aXN0IGFuZCBhcmUgdGVzdGVkLiBGb3IgdGhlCm92ZXJhbGwgZGVzaWduIGFuZCB0aGUgbW9kZGFibGUtc3VyZmFjZSBtYXRyaXgsIHJlYWQgYGRvY3MvTU9EUy5tZGAuCgoqKkp1c3Qgd2FudCB0byBpbnN0YWxsIG9uZT8qKiBUaGF0IGlzClt0aHJlZSBrZXlwcmVzc2VzXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC9ibG9iL21hc3Rlci9kb2NzL01PRFMubWQjZ2V0dGluZy1hLW1vZC1pbi1vbmUtcGFyYWdyYXBoKSwgbm90IHRoaXMgcGFnZS4KCioqV3JpdGluZyBvbmUsIGFuZCB3YW50IHRvIHRhbGsgdG8gc29tZW9uZT8qKgpbVGhlIFJQR00gVG9vbHMgRGlzY29yZF0oaHR0cHM6Ly9kaXNjb3JkLmdnL1llZ3R3YkhUQlEpIGlzIHRoZSBwbGFjZSAtIHRoZQpzZWFtcyBhcmUgbmV3LCBhbmQgImNhbiBhIG1vZCBkbyBYIiBpcyBleGFjdGx5IHRoZSBxdWVzdGlvbiB3b3J0aCBhc2tpbmcKYmVmb3JlIHlvdSBidWlsZCBhcm91bmQgYW4gYW5zd2VyIHlvdSBndWVzc2VkLgoKIyMgU3VyZmFjZSBzdGF0dXM6IGNvbXBsZXRlLCBXSVAsIG5vdCB5ZXQKClRoaXMgZGlyZWN0b3J5IGhvbGRzIGJvdGggKipidWlsdC10b2RheSoqIHBhZ2VzIGFuZCAqKmRlc2lnbi1vZi1yZWNvcmQqKiBwYWdlcywKYW5kIGFuIGF1dGhvciB3aG8gY2Fubm90IHRlbGwgd2hpY2ggaXMgd2hpY2ggYnVpbGRzIGFnYWluc3QgdGhlIHdyb25nIG9uZS4gRXZlcnkKc3VyZmFjZSBiZWxvdyBjYXJyaWVzIG9uZSBvZiB0aHJlZSB3b3JkcywgYW5kIHRoZXkgYXJlIG1lYW50IGxpdGVyYWxseToKCi0gKipDb21wbGV0ZSoqOiBidWlsdCwgdGVzdGVkLCBhbmQgZHJpdmVuIGVuZCB0byBlbmQgYXQgbGVhc3Qgb25jZSBhbG9uZyB0aGUKICBwYXRoIGEgcGxheWVyJ3MgaW5zdGFsbCBhY3R1YWxseSB1c2VzLiBXcml0ZSBhZ2FpbnN0IGl0IHRvZGF5LgotICoqV0lQKio6IHBhcnRseSBidWlsdC4gV2hhdCBleGlzdHMgaXMgcmVhbCBhbmQgaXMgbm90IGdvaW5nIHRvIGJlIHRha2VuIGF3YXksCiAgYnV0IHRoZSBzdXJmYWNlIGRvZXMgbm90IHlldCBjb3ZlciBldmVyeXRoaW5nIGl0cyBuYW1lIHN1Z2dlc3RzLiBSZWFkIHRoZQogIGxpbmtlZCByb3cgYmVmb3JlIGFzc3VtaW5nIHRoZSBwYXJ0IHlvdSBuZWVkIGlzIGluLgotICoqTm90IHlldCoqOiB0aGVyZSBpcyBubyBzZWFtLiBXaGF0ZXZlciB0aGUgZGVzaWduIHBhZ2VzIHNheSBhYm91dCBpdCBpcyBhCiAgcHJvcG9zYWwuIERvIG5vdCBidWlsZCBhcm91bmQgaXQsIGFuZCBkbyBub3QgYnVpbGQgYSAqd29ya2Fyb3VuZCogZWl0aGVyOiBhCiAgd29ya2Fyb3VuZCByZWFjaGVzIHRocm91Z2ggc29tZXRoaW5nIHRoYXQgd2FzIG5ldmVyIGEgc2VhbSwgYW5kIGl0IGlzIGV4YWN0bHkKICB3aGF0IHRoZSByZWFsIHNlYW0gYnJlYWtzIHdoZW4gaXQgbGFuZHMuIEFzayBvbiB0aGUgRGlzY29yZCBpbnN0ZWFkLgoKYE1PRF9SRUFDSC5tZGAgaXMgd2hlcmUgZWFjaCBvZiB0aGVzZSBpcyBtZWFzdXJlZCwgb25lIHJvdyBwZXIgY2FwYWJpbGl0eTsgdGhlCnRhYmxlIGJlbG93IGlzIGFuIGluZGV4IGludG8gaXQuIGBtb2RkaW5nLXN0YXR1cy50ZXN0LnRzYCByZWFkcyBib3RoIGZpbGVzIGFuZApmYWlscyBpZiBhIHN0YXR1cyBoZXJlIHN0b3BzIG1hdGNoaW5nIHRoZSBtZWFzdXJlbWVudCB0aGVyZSwgc28gdGhlIHR3byBjYW5ub3QKZHJpZnQgc2lsZW50bHksIHdoaWNoIGlzIHRoZSBvbmx5IHJlYXNvbiBhIHN1bW1hcnkgdGFibGUgbGlrZSB0aGlzIGlzIHNhZmUgdG8Kd3JpdGUgZG93biBhdCBhbGwuCgp8IFdoYXQgeW91IHdhbnQgdG8gZG8gfCBTdGF0dXMgfCBNZWFzdXJlZCBpbiB8CnwgLS0tIHwgLS0tIHwgLS0tIHwKfCBDaGFuZ2UgYW55IHZhbHVlIGluIGFueSBnYW1lZGF0YSBmaWxlLCBhZGQgYSBrZXksIHJlbW92ZSBhIGtleSwgb24gYW55IHJlY29yZCwgaW5jbHVkaW5nIHRoZSBvbmVzIHdpdGggcmVwZWF0ZWQgbmFtZXMgfCAqKkNvbXBsZXRlKiogfCBnYXAgMiB8CnwgQWRkIHJlY29yZHMgY29yZSBoYXMgbmV2ZXIgc2Vlbjogb2JqZWN0cywgbW9uc3RlcnMsIGVnb3MsIGFydGlmYWN0cywgYW5kIHdob2xlIG5ldyBpdGVtICoqY2xhc3NlcyoqICh0dmFscykgfCAqKkNvbXBsZXRlKiogfCBnYXAgMjAgfAp8IEV4dGVuZCBhIHJlY29yZCB3aXRoIGZpZWxkcyBvZiB5b3VyIG93biwgaW4geW91ciBvd24gbmFtZXNwYWNlIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDE2IHwKfCBTaGlwIHJlYWwgKipjb2RlKiogdGhhdCBydW5zIGluIHRoZSBnYW1lLCBpbnN0YWxsZWQgZnJvbSBkaXNrIHdpdGggbm8gYnVpbGQgc3RlcCBoZXJlIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDEgfAp8IENoYW5nZSBiZWhhdmlvdXI6IHRoZSBgTW9kSG9va3NgIHBvaW50cywgcGx1cyB0aGUga2V5ZWQgcmVnaXN0cmllcyBsaXN0ZWQgaW4gYE1PRF9SRUFDSC5tZGAsIGl0ZW0gKGMpIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDMgfAp8IE1vbnN0ZXIgY29tYmF0OiBibG93IGVmZmVjdHMsIHJlY29yZGluZyBhbmQgbGl2ZSBwYXRocywgb25lIHJlZ2lzdHJhdGlvbiBmb3IgYm90aCB8ICoqQ29tcGxldGUqKiB8IGdhcCA0IHwKfCBTdG9yZSBiZWhhdmlvdXI6IHRoZSBidXkgcnVsZSBhbmQgc3RhY2sgc2l6ZXMgfCAqKkNvbXBsZXRlKiogfCBnYXAgNSB8CnwgTGV2ZWwgZ2VuZXJhdGlvbjogeW91ciBvd24gd2hvbGUtY2F2ZSBidWlsZGVyIGFuZCB0aGUgcHJvZmlsZSB0aGF0IHNlbGVjdHMgaXQgfCAqKkNvbXBsZXRlKiogfCBnYXAgNiB8CnwgVmF1bHRzIGFuZCByb29tIHRlbXBsYXRlcyBkcmF3biB3aXRoIHN5bWJvbHMgY29yZSBoYXMgbmV2ZXIgZGVjb2RlZCB8ICoqQ29tcGxldGUqKiB8IGdhcCAxNyB8CnwgUmFuZG9tIGFydGlmYWN0czogcmVhY2ggdGhlICoqZ2VuZXJhdG9yKiosIG5vdCBqdXN0IHNoaXAgYSBmaXhlZCBhcnRpZmFjdCB8ICoqQ29tcGxldGUqKiB8IGdhcCAxOSB8CnwgQW4gZWZmZWN0IG9mIHlvdXIgb3duIHRoYXQgdGhlIGdhbWUgY2FuICoqZGVzY3JpYmUqKiB0byB0aGUgcGxheWVyIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDE4IHwKfCBUaWxlIHBhY2tzOiByZWdpc3RlciBhIEdyYXBoaWNzIHJvdywgc2hpcCB5b3VyIG93biBhcnQsIGVpdGhlciB0aWxlIGVuZ2luZSB8ICoqQ29tcGxldGUqKiB8IGdhcCA4IHwKfCBTb3VuZHMsIGZvbnRzLCBzcGxhc2ggYXJ0LCBoZWxwIHRleHQsIGFuZCBgLnByZmAgZWZmZWN0cywgaW5jbHVkaW5nIGNsYXNzaWMgVElMRSBhc3NpZ25tZW50cyBsYXllcmVkIG92ZXIgYSBncmFwaGljcyBwYWNrIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDcgfAp8IExvY2FsaXphdGlvbiwgbm90IGEgc3RyaW5nIHRhYmxlOyB0aGUgc3RydWN0dXJhbCBzZWFtIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDE0IHwKfCBIYXZlIHlvdXIgcmVjb3JkcyBzY2hlbWEtY2hlY2tlZCBiZWZvcmUgdGhleSByZWFjaCB0aGUgZ2FtZSB8ICoqQ29tcGxldGUqKiB8IGdhcCAxMiB8CnwgU3Vydml2ZSBhIGJyb2tlbiBtb2QgYXQgYm9vdCwgd2l0aCB0aGUgZmF1bHQgbmFtZWQgYW5kIGF0dHJpYnV0ZWQgfCAqKkNvbXBsZXRlKiogfCBnYXAgMTMgfAp8IEtub3cgd2hpY2ggbW9kIGFkZGVkIG9yIGNoYW5nZWQgYSByZWNvcmQsIGluIHRoZSBydW5uaW5nIGdhbWUgYW5kIGluIHRoZSBzYXZlIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDEwIHwKfCBMb2FkIG9yZGVyIHRoYXQgbWVhbnMgd2hhdCB0aGUgbWFuYWdlciBzYXlzIGl0IG1lYW5zIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDExIHwKfCAqKlJlcGxhY2UgdGhlIGZyb250IGVuZCoqOiBkcmF3IHRoZSB3b3JsZCB5b3Vyc2VsZiwgYW55IHdheSB5b3UgbGlrZSB8ICoqQ29tcGxldGUqKiB8IGdhcCA5IHwKfCBLbm93ICoqd2hlcmUgeW91IG1heSBkcmF3Kio6IG5hbWVkIHJlZ2lvbnMsIGluIGdyaWQgY2VsbHMgYW5kIENTUyBwaXhlbHMsIG9uIGV2ZXJ5IGZyYW1lIHwgKipDb21wbGV0ZSoqIHwgZ2FwIDkgfAp8IERyaXZlIHRoZSBnYW1lIHByb2dyYW1tYXRpY2FsbHk6IGFuIGF1dG9wbGF5ZXIsIGEgYm90LCBhIHRlc3QgaGFybmVzcyB8ICoqQ29tcGxldGUqKiB8IGBCT1JHLm1kYCwgYE1vZFBsdWdpbi5jb250cm9sbGVyYCB8CnwgTWVudXM6IGFkZCwgcmVvcmRlciwgcmV0aXRsZSBhbmQgcmUtdGFnICoqcm93cyoqIChgcmVnaXN0cnk6bWVudWApLiBIb3cgYSBtZW51IGlzICoqcHJlc2VudGVkKiogaXMgbm90IHJlYWNoYWJsZSB8ICoqV0lQKiogfCBnYXAgMjEgfAp8ICoqUmVwbGFjZSB0aGUgVUkqKjogdGhlIEhVRCwgdGhlIHN0YXR1cyBsaW5lLCB0aGUgbWVzc2FnZSBhcmVhLCBtZW51IHByZXNlbnRhdGlvbiwgdGhlIH41MCBmdWxsIHNjcmVlbnMgfCAqKk5vdCB5ZXQqKiB8IGdhcCAyMSB8CnwgT3duIGEgSFVEIHJlZ2lvbiAobWVzc2FnZXMsIHZpdGFscywgc3RhdHVzKSB3aXRoIGNvcmUgZHJhd2luZyB0aGUgb25lcyB5b3UgZG8gbm90IGNsYWltLCBvciAqKmNyZWF0ZSBhIHJlZ2lvbiBvZiB5b3VyIG93bioqOiBvcmRlcmVkLCBvdmVybGFwcGluZywgdHJhbnNwYXJlbnQsIGNvbXBvc2l0ZWQsIGFuZCBvd25pbmcgcG9pbnRlciBpbnB1dCBvbiB0aGUgY2VsbHMgaXQgcGFpbnRzIHwgKipXSVAqKiB8IGdhcCAyMSB8CnwgUmV0aXRsZSwgcmVncm91cCwgcmVvcmRlciwgcmUtdGFnIG9yIHJlYmluZCBhbiBleGlzdGluZyB3ZWIga2V5cHJlc3MgY29tbWFuZCAoYHJlZ2lzdHJ5Om1lbnVgKTsgdGhlIGNvbW1hbmQncyBjbG9zdXJlIHN0YXlzIHNoZWxsLXByaXZhdGUgfCAqKkNvbXBsZXRlKiogfCBgTU9EX1JFQUNILm1kYCByb3cgMjMgfAp8IFJlbmFtZSBvbmUgb2YgeW91ciBvd24gcnVsZSBmbGFncyBvciBzZWN0aW9ucyB3aXRob3V0IGxvc2luZyB0aGUgcGxheWVyJ3Mgc2F2ZWQgY2hvaWNlIChgcmVuYW1lZFJ1bGVGbGFnc2AsIGByZW5hbWVkU2VjdGlvbkZsYWdzYCkgfCAqKkNvbXBsZXRlKiogfCBgQVVUSE9SSU5HLm1kYCB8CnwgUmViaW5kIGtleXMsIG9yIGFkZCBhIGdhbWVwYWQ6IGBpbnB1dC1kb29yLnRzYCBpcyBob3N0IGluZnJhc3RydWN0dXJlLCBub3QgYSBzZWFtIHwgKipOb3QgeWV0KiogfCBgTU9EX1NFQU1TLm1kYCB8CnwgQ2hhbmdlIHRoZSBtZXNzYWdlIHRhYmxlLCB0aGUgYE1TR19gLT5zb3VuZCBtYXAsIG9yIHRoZSBwcmVmLWZpbGUgaGFuZGxlcnMgfCAqKkNvbXBsZXRlKiogfCBgTU9EX1JFQUNILm1kYCByb3dzIDIwLCAyMSwgOCB8CnwgQ2hhbmdlIHRoZSBtb25zdGVyIHNwZWxsIHRhYmxlIG9yIHRoZSBjb21tYW5kIHRhYmxlIHwgKipOb3QgeWV0KiogfCBgTU9EX1JFQUNILm1kYCByb3dzIDIyLCAxOSB8CnwgSW5zdGFsbCwgdXBkYXRlIGFuZCB1bmluc3RhbGwgVVg6IHJhdGlmaWVkIGluIGZ1bGwsIGJ1aWx0IGluIHBhcnQgfCAqKldJUCoqIHwgYE1PRF9MSUZFQ1lDTEUubWRgIHwKClR3byB0aGluZ3MgdGhpcyB0YWJsZSBkZWxpYmVyYXRlbHkgZG9lcyBub3QgZG8uIEl0IGRvZXMgbm90IHJhbmsgc3VyZmFjZXMgYnkgaG93Cm11Y2ggd29yayB0aGV5IHdlcmUsIGFuZCBpdCBkb2VzIG5vdCBwcm9taXNlIGRhdGVzLiBBICoqTm90IHlldCoqIHJvdyBpcyBub3QgYQpxdWV1ZSBwb3NpdGlvbjsgc29tZSBvZiB0aGVtIGFyZSBvbmUgdGFzayBhd2F5IGFuZCBzb21lIGFyZSBhIGRlc2lnbiBhcmd1bWVudAp0aGF0IGhhcyBub3QgYmVlbiBzZXR0bGVkLgoKIyMgQ29udGVudHMKCi0gYHR1dG9yaWFscy9gOiAqKnRoZSBiZWdpbm5lciBwYXRoKiogLSBzZXZlbiB0aW55IG1vZHMsIG9uZSBpZGVhIGVhY2gsIGVhY2gKICBlbmRpbmcgaW4gc29tZXRoaW5nIHZpc2libGUgb24gc2NyZWVuLiBUaGUgZmluaXNoZWQgbW9kIGZvciBldmVyeSB0dXRvcmlhbCBpcwogIGEgcmVhbCBmb2xkZXIgdW5kZXIgYHNhbXBsZXMvdHV0b3JpYWxzL2AgdGhhdCBnZXRzIGNvbXBvc2VkIGFnYWluc3QgdGhlIHJlYWwKICBnYW1lIGRhdGEgb24gZXZlcnkgdGVzdCBydW4sIHNvIGEgdHV0b3JpYWwgY2Fubm90IHF1aWV0bHkgc3RvcCB3b3JraW5nLgogIFN0YXJ0IHRoZXJlIGlmIHlvdSBoYXZlIG5vdCB3cml0dGVuIGEgbW9kIGZvciB0aGlzIGdhbWUgYmVmb3JlLgotIGBGRUFUVVJFX1JFU1RPUkFUSU9OLm1kYDogYnJpbmdpbmcgYmFjayBtZWNoYW5pY3MgdGhhdCBsYXRlciB2ZXJzaW9ucyBvZgogIEFuZ2JhbmQgZHJvcHBlZCwgd2l0aG91dCBjaGFuZ2luZyB2YW5pbGxhIC0gdGhlIHJlc2VhcmNoIHJ1bGVzIHRoYXQga2VlcCBhCiAgcmVzdG9yYXRpb24gaG9uZXN0LCBhbmQgd2h5IHJlc3RvcmF0aW9uIGlzIHRoZSBiZXN0IGF2YWlsYWJsZSB0ZXN0IG9mIHdoZXRoZXIKICB0aGUgbW9kIHN5c3RlbSBpcyByZWFsLgotIFRoaXMgcGFnZTogcGFjayBhbmF0b215LCBtYW5pZmVzdHMsIGFuZCByZWNvcmQgY29tcG9zaXRpb24gKGxpdmUgdG9kYXksCiAgYmFja2VkIGJ5IGBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCkuCi0gYFJFUVVJUkVNRU5UUy5tZGA6ICoqZXhhY3RseSB3aGF0IGEgbW9kIG11c3QgcHJvdmlkZSoqLCBhbmQgdGhlIG9uZSBwYWdlIGhlcmUKICB0aGF0IGNhbm5vdCBnbyBzdGFsZSAtIGl0IGlzIEdFTkVSQVRFRCBmcm9tIHRoZSBydWxlcyB0aGUgZ2FtZSBlbmZvcmNlcwogIChgcGFja2FnZXMvbW9kLXNkay9zcmMvc3RhbmRhcmRzLnRzYCksIGFuZCBhIHRlc3QgZmFpbHMgaWYgdGhlIHR3byBldmVyCiAgZGlzYWdyZWUuIFJ1biB0aG9zZSBzYW1lIHJ1bGVzIGFnYWluc3QgeW91ciBvd24gZm9sZGVyIGJlZm9yZSBwdWJsaXNoaW5nOgogIGBucHggbmVvLWFuZ2JhbmQtbW9kLWNoZWNrIHBhdGgvdG8veW91ci1tb2RgLiBTdGFydCBoZXJlLgotIGBBVVRIT1JJTkcubWRgOiB0aGUgU0hPUlRDVVRTIC0gYGRyYWZ0UmVjb3JkYCBmaWxscyBhIG5ldyByZWNvcmQgZnJvbSBjb3JlJ3MKICBvd24gY29tcGFyYWJsZSByZWNvcmRzIChpbmNsdWRpbmcgaXRzIHByaWNlKSwgYGNoZWNrUmVjb3Jkc2AgbmFtZXMgZXZlcnkgd2F5CiAgaXQgd2lsbCBzaWxlbnRseSBub3Qgd29yaywgYW5kIGBNb2RQcm9qZWN0YCBhc3NlbWJsZXMgYSB3aG9sZSBtb2QgYW5kIGNvbXBvc2VzCiAgaXQgdGhyb3VnaCB0aGUgcmVhbCBwaXBlbGluZSBiZWZvcmUgc2F5aW5nIGFueXRoaW5nLiBSZWFkIHRoaXMgYmVmb3JlIHdyaXRpbmcKICBhIHJlY29yZCBieSBoYW5kLgotIGBNT0RfTElGRUNZQ0xFLm1kYDogaG93IHNhdmVzIHN0YXkgc2FmZSBhY3Jvc3MgaW5zdGFsbC91cGRhdGUvCiAgdW5pbnN0YWxsLCBpbnN0YWxsaW5nIGZyb20gZ2l0IChhbmQgYSBmdXR1cmUgbWFya2V0cGxhY2UpLCBtdWx0aS1tb2QKICBjb21wb3NpdGlvbiBhbmQgY29uZmxpY3QgcmVzb2x1dGlvbiwgdW5pbnN0YWxsIHJlY292ZXJ5LCBhbmQgdGhlIFVYCiAgcHJpbmNpcGxlcy4gUkFUSUZJRUQgKGRlY2lzaW9uIDE5KTsgbm90IHlldCBmdWxseSBidWlsdC4KLSBgUExVR0lOUy5tZGA6IHNoaXBwaW5nIENPREUgaW4gYSBtb2QgZm9sZGVyLCBmb3IgYSBtb2QgdGhhdCBhIG1hbmlmZXN0CiAgYW5kIGEgZmV3IHJlY29yZCBmaWxlcyBjYW5ub3QgZXhwcmVzcyAtIGBwbHVnaW4uanNgLCBpdHMgYGhvb2tzKGN0eClgLwogIGByZWdpc3Rlcihob3N0LCBjdHgpYCBlbnRyeSBwb2ludHMsIGFuZCB0aGUgZG9vcnMgZWFjaCBvcGVucyBvbnRvIGEgbGl2ZQogIGdhbWUuCi0gYE1PRF9TRUFNUy5tZGA6IHRoZSBDT1JFIHNlYW1zIGEgbW9kIHJlYWNoZXMgdGhyb3VnaCAtIHRoZSBgTW9kSG9va3NgCiAgYmVoYXZpb3VyIGludGVyZmFjZSwgaXRzIHBlci1ob29rIGZvbGQgcnVsZXMsIGFuZCBob3cgYSBwYXRjaCBpcyB0dXJuZWQKICBvbi4gRGVzY3JpYmVzIHdoYXQgaXMgYnVpbHQuCi0gYFJFR0lPTl9JTlBVVC5tZGA6IGhvdyBwb2ludGVyIHRhcHMsIGNvbnRleHQgbWVudXMgYW5kIGxvbmctcHJlc3NlcyByb3V0ZQogIGJ5IHBlci1jZWxsIHJlZ2lvbiBvd25lcnNoaXAgcmF0aGVyIHRoYW4gYnkgcmVjdGFuZ2xlLiBMYW5kZWQ7IGhpc3RvcmljYWwKICBkZXNpZ24gcmVjb3JkLgotIGBDTE9VRF9CQUNLVVBfREVTSUdOLm1kYDogYSBwbGF5ZXItY2hvc2VuIHNhdmUtYmFja3VwIGZvbGRlciBhcyBhIGBxb2xgCiAgZmVhdHVyZSAtIHRoZSB0d28gc21hbGwgaG9zdCBzZWFtcyBpdCBuZWVkcywgYW5kIHdoeSB0aGUgdHJpZ2dlciBpcwogIGJsb2NrZWQgb24gYSBzZWFtIHRoYXQgZG9lcyBub3QgZXhpc3QgeWV0IGV2ZW4gdGhvdWdoIHRoZSBlbmdpbmUgc2lkZSBpcwogIGRvbmUuCi0gYE1PRF9DT01QQVRJQklMSVRZLm1kYDogd2hhdCBhbiBlbmdpbmUgcmVsZWFzZSBtYXkgYW5kIG1heSBub3QgYnJlYWssIGFuZAogIHdoYXQgeW91IGhhdmUgdG8gZG8gYWJvdXQgaXQuIFRoZSBmb3VyIGdhdGVzIHRoYXQgY2FuIHN0cmFuZCBhIG1vZCwgd2hhdAogIHRvIHdyaXRlIGluIGBlbmdpbmVgLCB0aGUgdHdvLXJlbGVhc2UgcnVsZSBmb3IgYW4gQUJJIGJ1bXAsIGFuZCB0aGUgaG9uZXN0CiAgZ2FwIGFyb3VuZCBgY3R4LmNvcmVgLiBSZWFkIHRoaXMgYmVmb3JlIHB1Ymxpc2hpbmcgYW55dGhpbmcuCi0gYE1PRF9SRUFDSC5tZGA6IHRoZSBNRUFTVVJFRCBhbnN3ZXIgdG8gImhvdyBtdWNoIG9mIHRoZSBnYW1lIGNhbiBhIG1vZAogIGFjdHVhbGx5IG1ha2Ugb3ZlciB0b2RheSIgLSBob29rIGNvdW50LCBhIGNlbnN1cyBvZiB0aGUgcG9ydCdzIGRpc3BhdGNoCiAgdGFibGVzIGFuZCB3aGljaCBhcmUgbW9kLXJlYWNoYWJsZSwgd2hhdCBkYXRhIGxheWVyaW5nIHJlYWxseSBzdXBwb3J0cywKICB3aGF0IHJlc291cmNlcyBhcmUgb3ZlcnJpZGFibGUsIGFuZCB0aGUgZ2FwIGxpc3QuIFJlYWQgdGhpcyBiZWZvcmUKICB0cnVzdGluZyBhIGNhcGFiaWxpdHkgY2xhaW0gb24gYW55IG90aGVyIHBhZ2U6IHRoaXMgZGlyZWN0b3J5IGNvbnRhaW5zCiAgYm90aCBkZXNpZ24tb2YtcmVjb3JkIHBhZ2VzIGFuZCBidWlsdC10b2RheSBwYWdlcywgYW5kIHRoZSB0d28gYXJlIG5vdAogIHRoZSBzYW1lIHRoaW5nLgotICoqUmVwbGFjaW5nIHRoZSB3aG9sZSBmcm9udCBlbmQqKiAoYW4gOC8xNi1iaXQgbWVudSBzaGVsbCwgaXNvbWV0cmljLCBmdWxsIDNELAogIGZpcnN0LXBlcnNvbiwgY29udHJvbGxlci1kcml2ZW4pIGlzIGEgZGVzaWduIHRoYXQgaGFzIGJlZW4gd3JpdHRlbiBkb3duIGFuZAogIG1lYXN1cmVkLCBidXQgKip0aGUgc2VhbXMgZm9yIGl0IGRvIG5vdCBleGlzdCB5ZXQqKi4gVHdvIGZhY3RzIGZyb20gdGhhdCB3b3JrCiAgYXJlIHdvcnRoIGtub3dpbmcgaGVyZTogY29yZSBpcyBhbHJlYWR5IGhlYWRsZXNzIGFuZCBuZWVkcyBubyBjaGFuZ2UgZm9yIGFueQogIG9mIGl0LCBhbmQgd2hhdCBzdGFuZHMgaW4gdGhlIHdheSBpcyBgR2x5cGhUZXJtYCwgd2hpY2ggaXMgYm90aCB0aGUgc3VyZmFjZQogIGFuZCB0aGUgaW5wdXQgZG9vci4gVGhlIHBsYW4gaXRzZWxmIGlzIGluIHRoZSBwcml2YXRlIHdvcmtpbmcgcmVjb3JkIChzZWUKICBbLi4vV09SS0lOR19SRUNPUkQubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvV09SS0lOR19SRUNPUkQubWQpKSBiZWNhdXNlIGl0IGlzIGEgcHJvcG9zYWwgdW5kZXIKICBhcmd1bWVudCByYXRoZXIgdGhhbiBhbiBBUEkgYW55b25lIGNhbiBidWlsZCBhZ2FpbnN0LgotIGBkb2NzL0xJTk9MRVVNLm1kYDogdGlsZSBwYWNrcyBhbmQgY29udmVydGluZyB0aGUgY2xhc3NpYyB0aWxlc2V0cy4KLSBgQlVHX0ZJWEVTLm1kYDogdGhlIGBidWctZml4ZXNgIG1vZCAtIGl0cyBkZXNpZ24gb2YgcmVjb3JkIGFuZAogIHJlZmVyZW5jZWQgY2hhbmdlbG9nIGZvciB1cHN0cmVhbSBjcmFzaC9jb3JydXB0aW9uL3NhdmUvZGV0ZXJtaW5pc20gZml4ZXMKICB0aGF0IGNvcmUgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IGNhcnJ5IChkZWNpc2lvbiAyNCkuIERlc2lnbiBvZiByZWNvcmQ7CiAgcGF0Y2hlcyBsYW5kIHdpdGggdGhlIG1vZCBydW50aW1lIGFuZCB0aGUgc3lzdGVtcyB0aGV5IHRvdWNoLgotIGBVUFNUUkVBTV9DQVRDSFVQX01PRF9TQ09QRS5tZGA6IHdoZXJlIGEgaHlwb3RoZXRpY2FsICJ1cHN0cmVhbSBjYXRjaC11cCIKICBtb2QgKHBvc3QtNC4yLjYgdXBzdHJlYW0gZml4ZXMpIHdvdWxkIGRyYXcgaXRzIGxpbmUgYWdhaW5zdCBgYnVnLWZpeGVzYC4KICBTY29wZSBvZiByZWNvcmQ7IG5vIHJlcG9zaXRvcnkgb3IgY29kZSBleGlzdHMgeWV0LgotIENvbWluZyBhcyB0aGUgZW5naW5lIGxhbmRzIHRoZW0gKFA3IGRlbGl2ZXJhYmxlcyk6IGhhbmRsZXIgcmVnaXN0cnkKICBjYXRhbG9nIChlZmZlY3RzLCBjb21tYW5kcywgcm9vbSBidWlsZGVycyksIHRoZSBzYW5kYm94IGNhcGFiaWxpdHkKICByZWZlcmVuY2UgZm9yIHNjcmlwdGVkIHBsdWdpbnMsIGRpYWxvZy9xdWVzdC9zaG9wIGNvb2tib29rcywgdGhlCiAgYG5lby1wYWNrYCB2YWxpZGF0b3IvYnVuZGxlciwgYW5kIHB1Ymxpc2hpbmcgZ3VpZGFuY2UuCgojIyBUaGUgZmlyc3QtcGFydHkgbW9kcwoKU2V2ZW4sICoqbm9uZSBvZiB0aGVtIGJ1bmRsZWQqKiwgYWxsIE9GRiB1bnRpbCBlbmFibGVkIChzZWUKYERFRkFVTFRfRU5BQkxFRF9NT0RTYCAtIGFuIHVudG91Y2hlZCBpbnN0YWxsIGlzIHRoZSBmYWl0aGZ1bCBiYXNlIGdhbWUgd2l0aCBubyBtb2QKbG9hZGVkKS4gRWFjaCBsaXZlcyBpbiBpdHMgb3duIHJlcG9zaXRvcnkgYW5kIGFycml2ZXMgdGhyb3VnaCB0aGUgbW9kIG1hbmFnZXIncwoqSW5zdGFsbCBhIG1vZC4uLiogcm93OgoKfCBpZCB8IHNoYXBlIHwgd2hlcmUgaXQgbGl2ZXMgfCB3aGF0IGl0IGFkZHMgfAp8IC0tLSB8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYHFvbGAgfCBjb250ZW50IHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtcW9sKSB8IEdlbnVpbmVseSBuZXcgY29udmVuaWVuY2VzLCBjdXJyZW50bHkganVzdCBhdXRvLWRpZyBvbiB3YWxrLiBCdWlsdC1pbiBBbmdiYW5kIGA9YCBvcHRpb25zIGFyZSBOT1QgaGVyZTogdGhleSBzaGlwIGluIGNvcmUgYXQgdGhlaXIgdXBzdHJlYW0gZGVmYXVsdHMuIFNlZSBgUU9MLm1kYC4gfAp8IGBidWctZml4ZXNgIHwgY29udGVudCB8IFtvd24gcmVwb10oaHR0cHM6Ly9naXRodWIuY29tL25lb3N0cnlkZXIvbmVvLWFuZ2JhbmQtbW9kLWJ1Zy1maXhlcykgfCBBbiB1bm9mZmljaWFsIHBhdGNoIHNldCBmb3IgdXBzdHJlYW0gYnVncyBjb3JlIGRlbGliZXJhdGVseSBrZWVwcy4gU2VlIGBCVUdfRklYRVMubWRgLiB8CnwgYGxpbm9sZXVtYCB8IHRpbGVzIHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtbGlub2xldW0pIHwgQW4gQUxURVJOQVRJVkUgdGlsZSBlbmdpbmU6IHRoZSBMaW5vbGV1bSBsb29zZS1wYWNrIGZvcm1hdCAoaW5kaXZpZHVhbCBQTkdzIGFkZHJlc3NlZCBieSByZWFkYWJsZSB0YXJnZXQgbWFwcywgcGx1cyB2YXJpYW50IHBvb2xzKS4gSXQgZG9lcyBOT1Qgc3VwcGx5IHRoZSBnYW1lJ3MgZ3JhcGhpY3MgLSBhbGwgZml2ZSB1cHN0cmVhbSB0aWxlIHNldHMgKE9yaWdpbmFsIC8gQWRhbSBCb2x0IC8gRGF2aWQgR2VydmFpcyAvIE5vbWFkIC8gU2hvY2tib2x0IERhcmsgYW5kIExpZ2h0KSBhcmUgY29yZSBjb250ZW50IChgZ3JhZm1vZGUuY2AgLyBgbGliL3RpbGVzL2xpc3QudHh0YCkgYW5kIGFwcGVhciBpbiB0aGUgR3JhcGhpY3Mgc2NyZWVuIHdpdGggbm8gbW9kIGVuYWJsZWQuIEl0IHNoaXBzIGFsbCBzaXggY29udmVydGVkIHRvIGxvb3NlIHBhY2tzLCBzbyB5b3UgY2FuIGNvbXBhcmUgdGhlIHR3byBlbmdpbmVzIG9uIGlkZW50aWNhbCBhcnQuIERlY2xhcmUgYSBwYWNrIHdpdGggYHsgImdyYWZJRCI6ID49MTAwLCAiZW5naW5lIjogImxpbm9sZXVtIiwgIm1lbnVuYW1lIjogIi4uLiIsICJwYXRoIjogIi4uLiIgfWAgLSBgZW5naW5lYCBuYW1lcyB0aGUgRk9STUFUIGFuZCB0aGUgbW9kIHRoYXQgc2hpcHMgdGhlIHNpeCBjb252ZXJ0ZWQgcGFja3Mgc2hhcmVzIHRoZSBzYW1lIGlkLiBTaW5jZSBpdHMgMC4xNS4wIGl0IGFsc28gY2FycmllcyB0aGUgb25lIHJ1bGUgdGhlIEdBTUUgdXNlZCB0byBob2xkOiBjb250ZW50IGEgbW9kIGFkZGVkLCB3aXRoIG5vIHRpbGUgYW55d2hlcmUsIGlzIGRyYXduIGZyb20gaXRzIG5lYXJlc3QgcmVsYXRpdmUgd2l0aCB0aGUgY29sb3VyIHR1cm5lZCAtIHVuZGVyIGl0cyBvd24gcGFja3Mgb25seSwgdGhyb3VnaCBgcmVnaXN0cnk6dGlsZXNgLiBTZWUgYGRvY3MvTElOT0xFVU0ubWRgLiB8CnwgYGJvcmdgIHwgcGx1Z2luIHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtYm9yZykgfCBBbiBhdXRvbWF0aWMgcGxheWVyLCBkcml2aW5nIHRoZSBnYW1lIHRocm91Z2ggdGhlIHNhbWUgcGVyY2VpdmUvYWN0IEFQSSBhbnkgdGhpcmQtcGFydHkgYXV0b21hdGlvbiB3b3VsZCB1c2UuIFRoZSB3aG9sZSBwb3J0IGxpdmVzIHRoZXJlLCB3aXRoIGl0cyBvd24gcmVsZWFzZSB0YWdzIGFuZCBpdHMgb3duIHN1aXRlLCBpbmNsdWRpbmcgb25lIHRoYXQgZHJpdmVzIHRoZSBCVUlMVCBgcGx1Z2luLmpzYC4gSW5zdGFsbGluZyBhbmQgZW5hYmxpbmcgaXQgZG9lcyBub3QgaGFuZCBpdCB5b3VyIGNoYXJhY3RlcjsgaXRzICJMZXQgdGhlIEJvcmcgcGxheSIgdG9nZ2xlIGRvZXMuIHwKfCBgZmVhdHVyZS1yZXN0b3JhdGlvbmAgfCBjb250ZW50ICsgcGx1Z2luIHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtZmVhdHVyZS1yZXN0b3JhdGlvbikgfCBCZWxvdmVkIEFuZ2JhbmQgZmVhdHVyZXMgdGhhdCBhIGxhdGVyIHZlcnNpb24gcXVpZXRseSBkcm9wcGVkLCBicm91Z2h0IGJhY2sgb25lIG5hbWVkIHRvZ2dsZSBhdCBhIHRpbWUsIGV2ZXJ5IHRvZ2dsZSBvZmYgYnkgZGVmYXVsdC4gYFRlbGVwb3J0IE90aGVyYCAoY29udGVudDogYSBgZmllbGRQYXRjaGVzYCBhZGRpdGlvbiB0byB0aGUgUHJpZXN0LCBQYWxhZGluIGFuZCBSYW5nZXIncyBvd24gYm9va3MsIHdobyBsb3N0IHRoZSBzcGVsbCBzb21ld2hlcmUgYmV0d2VlbiBhbiBlYXJsaWVyIEFuZ2JhbmQgYW5kIDQuMi42IHdoaWxlIHRoZSBNYWdlIGFuZCB0aGUgUm9ndWUga2VwdCBpdCkgYW5kIHN0b3JlIGRpc2NvdW50cyAocGx1Z2luOiA0LjIuNiBkcm9wcGVkIHRoZSBkaXNjb3VudCByb2xsIGVudGlyZWx5LCBzbyB0aGlzIHJlc3RvcmF0aW9uIGluc3RhbGxzIGEgYHJlZ2lzdHJ5OnN0b3JlYCBkaXNjb3VudC1yb2xsIGhhbmRsZXIgaW5zdGVhZCBvZiBwYXRjaGluZyBkYXRhIHRoYXQgbm8gbG9uZ2VyIGV4aXN0cykuIHwKfCBgZm9yZ2VgIHwgcGx1Z2luIHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtZm9yZ2UpIHwgQW4gaW4tZ2FtZSB3b3Jrc2hvcCBmb3IgYnVpbGRpbmcgb3RoZXIgbW9kcyB3aXRob3V0IGxlYXZpbmcgdGhlIGdhbWU6IHBpY2sgYW4gZXhpc3RpbmcgcmVjb3JkLCBzZWUgaXRzIG5laWdoYm91cnMsIGNoYW5nZSB3aGF0IHdvdWxkIGhhdmUgdG8gY2hhbmdlLCBhbmQgcGFjayB0aGUgcmVzdWx0IHVwIHRvIHRyeSBpbi1zZXNzaW9uLCBpbnN0YWxsLCBvciBoYW5kIG9mZiBhcyBhIGZpbGUuIEVhcmx5IC0gdGhlIHdvcmtzaG9wJ3Mgb3duIGNvbnRlbnQgaXMgYSBkZW1vbnN0cmF0aW9uIGZpeHR1cmUgdW50aWwgdGhlIHJlbWFpbmluZyBlbmdpbmUgc2VhbXMgbGFuZC4gU2VlIGBkb2NzL0VOR0lORV9TRUFNUy5tZGAgaW4gaXRzIG93biByZXBvc2l0b3J5LiB8CnwgYHVwc3RyZWFtLWNhdGNodXBgIHwgcGx1Z2luIHwgW293biByZXBvXShodHRwczovL2dpdGh1Yi5jb20vbmVvc3RyeWRlci9uZW8tYW5nYmFuZC1tb2QtdXBzdHJlYW0tY2F0Y2h1cCkgfCBDaGFuZ2VzIHVwc3RyZWFtIEFuZ2JhbmQgYWNjZXB0ZWQgYWZ0ZXIgdGhlIGA0LjIuNmAgdGFnIGNvcmUgaXMgcGlubmVkIHRvLCBjaXRlZCBieSBTSEEsIG9uZSB0b2dnbGUgcGVyIENMQVNTIG9mIGNoYW5nZSBhbmQgZXZlcnkgb25lIG9mZiBieSBkZWZhdWx0LiBJdHMgZmlyc3Qgc2xpY2UgaXMgdGhlIGZvdXIgcG9zdC00LjIuNiB0aWxlLWFzc2lnbm1lbnQgY29tbWl0cywgYXBwbGllZCB0aHJvdWdoIGByZWdpc3RyeTp0aWxlc2AgcmF0aGVyIHRoYW4gYXMgYSBgcHJlZnNgIHJlc291cmNlIGJlY2F1c2UgYSBtb2QncyBwcmVmIGZpbGUgaXMgcmVwbGF5ZWQgaW50byBFVkVSWSB0aWxlIG1hcCBhbmQgdGhlIGtpbmQgZm9yYmlkcyBhIHNsb3QsIHNvIG5vdGhpbmcgY291bGQgc2NvcGUgaXQgdG8gdGhlIG9uZSBzaGVldCB1cHN0cmVhbSB3cm90ZSBpdCBmb3IuIFRoZSBib3VuZGFyeSBhZ2FpbnN0IGBidWctZml4ZXNgIGlzIGEgc2luZ2xlIHF1ZXN0aW9uOiBhbiBhY2NlcHRlZCB1cHN0cmVhbSBjb21taXQgZXhpc3RzLCBvciBpdCBkb2VzIG5vdC4gVGhpcyBtb2QgZXhwaXJlcyAtIGEgcmViYXNlbGluZSBvbnRvIGEgbmV3ZXIgdXBzdHJlYW0gdGFnIG1ha2VzIGV2ZXJ5IHJvdyBpbiBpdCByZWR1bmRhbnQuIFNlZSBgVVBTVFJFQU1fQ0FUQ0hVUF9NT0RfU0NPUEUubWRgLiB8CgoqKkZpcnN0LXBhcnR5IGlzIG5vdCBhIHNob3J0Y3V0LioqIEFsbCBzZXZlbiB0YWtlIHRoZSBzYW1lIHJvdXRlIGludG8gdGhlIGdhbWUgYXMgYW55Ym9keSBlbHNlJ3MgbW9kLCBhbmQgdGhhdCBpcyBvbiBwdXJwb3NlOiBidW5kbGluZyB0aGUgYXV0aG9yJ3Mgb3duIG1vZHMgd291bGQgaGF2ZSBoaWRkZW4gZXZlcnkgZGVmZWN0IGluIHRoZSBpbnN0YWxsIHBhdGggYmVoaW5kIG1vZHMgdGhhdCBuZXZlciB1c2VkIGl0LiBUaGUgZG93bmxvYWQgcm91dGUsIHRoZSBmb2xkZXIgY29kZSBsb2FkZXIgYW5kIHRoZSBwbHVnaW4gQUJJIGFsbCB3b3JrIGJlY2F1c2Ugbm90aGluZyBpcyBleGVtcHQgZnJvbSB0aGVtLiBXaGF0IGZpcnN0LXBhcnR5IGJ1eXMgaXMgdGhhdCB0aGVzZSBzZXZlbiBhcmUgYWxzbyB0aGUgcmVmZXJlbmNlIGV4YW1wbGVzIC0gcmVhZCB0aGVtIHRvIGxlYXJuIHRoZSBzZWFtcy4KCkVuYWJsZSBvbmUgaW4gdGhlIGluLWFwcCBtb2QgbWFuYWdlciAoZ2FtZSBtZW51IC0+IE1vZHMpLCBvciB3aXRoCmA/bW9kcz1xb2wsYnVnLWZpeGVzLGxpbm9sZXVtYCBmb3IgYSBvbmUtb2ZmLgoKKipUaGUgbW9kIGlzIHRoZSB1bml0IHlvdSBzd2l0Y2g7IGl0cyBwYXRjaGVzIHJpZGUgd2l0aCBpdC4qKiBXaGlsZSBhIG1vZCBpcwpkaXNhYmxlZCBpdHMgcGF0Y2hlcyBETyBOT1QgRVhJU1QgLSBpdHMgY29kZSBpcyBuZXZlciBjYWxsZWQsIG5vIGhvb2sgaXMKaW5zdGFsbGVkLCBub3RoaW5nIGFwcGVhcnMgaW4gdGhlIG1lbnUsIGFuZCBjb3JlIHJ1bnMgdGhlIGZhaXRoZnVsIGJhc2UgZ2FtZS4gQSBtb2QgdGhhdApjaGFuZ2VzIEJFSEFWSU9VUiBkb2VzIHNvIGJ5IGRlZmF1bHQtZXhwb3J0aW5nIGBNb2RIb29rc2AgZnJvbSBpdHMgb3duCmBwbHVnaW4udHNgOyBjb3JlIGhvbGRzIG9uZSBjb21wb3NlZCBgTW9kSG9va3NgIGFuZCBuZXZlciBsZWFybnMgd2hpY2ggbW9kCnN1cHBsaWVkIHdoYXQgKGBkb2NzL21vZGRpbmcvTU9EX1NFQU1TLm1kYCkuCkVuYWJsaW5nIHRoZSBtb2QgdHVybnMgaXRzIHdob2xlIHBhdGNoIHNldCBvbiBhdCBvbmNlLAphbmQgZWFjaCBwYXRjaCBpcyB0aGVuIGluZGl2aWR1YWxseSBzd2l0Y2hhYmxlIG9uIHRoYXQgbW9kJ3Mgb3duIHNjcmVlbgooTW9kcyAtPiB0aGUgbW9kIC0+IEZpeGVzICYgdHdlYWtzKSwgc28geW91IGNhbiB0YWtlIHRoZSBzZXQgbWludXMgb25lLgpUaGF0IGlzIGFsbCBgZGVmYXVsdDogdHJ1ZWAgb24gYSBydWxlIG1lYW5zOgoib24gb25jZSBpdHMgb3duIG1vZCBpcyBvbiIgLSBuZXZlciAib24gaW4gYSBmcmVzaCBpbnN0YWxsIi4KClRoZSBgZGVtby0qYCBkaXJlY3RvcmllcyBhbG9uZ3NpZGUgdGhlbSBhcmUgTk9UIHNoaXBwZWQgbW9kcy4gVGhleSBhcmUgdGhlCmZyYW1ld29yayBwcm9vZnMgLSBvbmUgcGVyIFNESyBsb2FkIHBhdGggKGEgY29udGVudCBwYWNrIHRoYXQgcGF0Y2hlcyBhIGNvcmUKbW9uc3RlciwgYSBzYW5kYm94ZWQgd29ya2VyIHBsdWdpbiwgYSB0cnVzdGVkIGluLXByb2Nlc3MgcGx1Z2luKSAtIGFuZCBleGlzdApzbyBhbGwgdGhyZWUgcGF0aHMgc3RheSBleGVyY2lzZWQgaW4gZGV2IGFuZCBpbiB0aGUgdGVzdCBzdWl0ZS4gRGlzY292ZXJ5CmRyb3BzIHRoZW0gZnJvbSByZWxlYXNlIGJ1aWxkcyAoYGlzU2hpcHBlZE1vZGAgaW4gYG1vZC1zdG9yZS50c2ApLiBTaW5jZSBub3RoaW5nCmVsc2UgaXMgYnVuZGxlZCwgYSByZWxlYXNlIGJ1aWxkJ3MgZGlzY292ZXJlZCBtb2Qgc2V0IGlzIEVNUFRZIGFuZCBhIHBsYXllcidzIG1vZAptYW5hZ2VyIGxpc3RzIGV4YWN0bHkgd2hhdCB0aGV5IGluc3RhbGxlZCAtIHdoaWNoIGlzIGFzc2VydGVkLCBub3QgYXNzdW1lZAooYG1vZC1zdG9yZS50ZXN0LnRzYCwgImEgcmVsZWFzZSBidWlsZCdzIGNvbnRlbnQgY2F0YWxvZyBpcyBFTVBUWSIpLgoKT25lIGRlbW8gZG9lcyBjYXJyeSBpdHMgd2VpZ2h0IGJleW9uZCBiZWluZyBhbiBleGFtcGxlOiBgZGVtby1ob29rc2AgaXMgdGhlIG9ubHkKbW9kIGluIHRoZSBidWlsZCB3aXRoIGEgYHBsdWdpbi50c2AsIHNvIGl0IGlzIHdoYXQga2VlcHMgdGhlIE1vZEhvb2tzIGRpc2NvdmVyeQpwYXRoIGFuZCBpdHMgZ3VhcmRzIGZyb20gZ29pbmcgdmFjdW91cyBub3cgdGhhdCB0aGUgcmVhbCBtb2RzIGhhdmUgbGVmdC4gQSBnbG9iCm1hdGNoaW5nIG5vdGhpbmcgcGFzc2VzIGV2ZXJ5IGFzc2VydGlvbiBhYm91dCB3aGF0IGl0IG1hdGNoZWQuCgojIyBQYWNrIGFuYXRvbXkKCkEgcGFjayBpcyBhIGRpcmVjdG9yeSAob3IgYXJjaGl2ZSkgd2l0aCBhIG1hbmlmZXN0IGFuZCBjb250ZW50IGZpbGVzOgoKYGBgCm15LWZyb3N0LXBhY2svCiAgbWFuaWZlc3QuanNvbiAgICAgIDwtIHRoZSBtYW5pZmVzdDsgdGhlIGZpbGUgdGhhdCBtYWtlcyB0aGlzIGEgbW9kCiAgbW9uc3Rlci5qc29uICAgICAgIDwtIGNvbnRyaWJ1dGlvbnMgdG8gdGhlICJtb25zdGVyIiByZWNvcmQgZmlsZQogIG9iamVjdC5qc29uICAgICAgICA8LSBjb250cmlidXRpb25zIHRvIHRoZSAib2JqZWN0IiByZWNvcmQgZmlsZQogIC4uLgpgYGAKCiMjIyBUaGUgbWFuaWZlc3QgKGBtYW5pZmVzdC5qc29uYCkKCmBgYGpzb24KewogICJpZCI6ICJmcm9zdCIsCiAgIm5hbWUiOiAiVGhlIEZyb3N0IERlcHRocyIsCiAgInZlcnNpb24iOiAiMS4yLjAiLAogICJzaGFwZSI6ICJjb250ZW50IiwKICAiZGVwZW5kZW5jaWVzIjogeyAiY29yZSI6ICIqIiB9LAogICJhdXRob3IiOiAiWW91IiwKICAibGljZW5zZSI6ICJDQy1CWS00LjAiCn0KYGBgCgotIGBpZGA6IGxvd2VyY2FzZSBrZWJhYi1jYXNlLCB1bmlxdWUgYW1vbmcgbG9hZGVkIHBhY2tzLiBJdCBiZWNvbWVzIHlvdXIKICBuYW1lc3BhY2U6IGEgbW9uc3RlciB5b3UgYWRkIG5hbWVkICJGcm9zdCBXeXJtIiBpcyBgZnJvc3Q6ZnJvc3Qtd3lybWAKICBldmVyeXdoZXJlIC0gaW4gb3RoZXIgcGFja3MsIGluIHRpbGUtcGFjayB0YXJnZXRzLCBpbiBzYXZlZmlsZXMuCi0gYHNoYXBlYDogYGNvbnRlbnRgIChkZWNsYXJhdGl2ZSBKU09OKSwgYHRpbGVzYCAoTGlub2xldW0gdGlsZSBwYWNrKSwKICBvciBgcGx1Z2luYCAoc2FuZGJveGVkIHNjcmlwdCkuCi0gYGRlcGVuZGVuY2llc2A6IHBhY2tzIHRoYXQgbXVzdCBsb2FkIGJlZm9yZSB5b3Vycy4gRGVjbGFyaW5nIGEKICBkZXBlbmRlbmN5IGlzIGFsc28gYSBwZXJtaXNzaW9uOiB5b3UgbWF5IG9ubHkgcGF0Y2gsIHJlcGxhY2UsIG9yCiAgcmVtb3ZlIHJlY29yZHMgb3duZWQgYnkgcGFja3MgeW91IGRlY2xhcmUgaGVyZS4KLSBMb2FkIG9yZGVyIGlzIHJlc29sdmVkIGRldGVybWluaXN0aWNhbGx5IChkZXBlbmRlbmNpZXMgZmlyc3QsCiAgYWxwaGFiZXRpY2FsIHRpZXMpLCBzbyB0aGUgc2FtZSBwYWNrIHNldCBjb21wb3NlcyBpZGVudGljYWxseSBvbgogIGV2ZXJ5IG1hY2hpbmUuIEN5Y2xlcyBhbmQgbWlzc2luZyBkZXBlbmRlbmNpZXMgZmFpbCBsb3VkbHkgYXQgbG9hZC4KCiMjIyBSZWNvcmQgY29tcG9zaXRpb24KCkVhY2ggY29udGVudCBmaWxlIG1heSBhZGQsIHBhdGNoLCByZXBsYWNlLCBhbmQgcmVtb3ZlIHJlY29yZHM6CgpgYGBqc29uCnsKICAicmVjb3JkcyI6IFsKICAgIHsgIm5hbWUiOiAiRnJvc3QgV3lybSIsICJocCI6IDQwMCwgImZsYWdzIjogWyJDT0xEIiwgIkRSQUdPTiJdIH0KICBdLAogICJwYXRjaGVzIjogewogICAgImNvcmU6a29ib2xkIjogeyAiaHAiOiAxMiwgImRlc2MiOiAiQSB0b3VnaGVyIGxpdHRsZSBrb2JvbGQuIiB9CiAgfSwKICAicmVwbGFjZXMiOiB7CiAgICAiY29yZTpncmlwLWZhcm1lci1tYWdnb3Qtcy1kb2ciOiB7ICJuYW1lIjogIkdyaXAiLCAiaHAiOiA1MCB9CiAgfSwKICAicmVtb3ZlcyI6IFsiY29yZTpmYW5nLWZhcm1lci1tYWdnb3Qtcy1kb2ciXQp9CmBgYAoKLSBgcmVjb3Jkc2AgYWRkcyBuZXcgZW50cmllczsgeW91ciBwYWNrIG93bnMgdGhlbS4KLSBgcGF0Y2hlc2AgZGVlcC1tZXJnZXMgb250byBhbiBleGlzdGluZyByZWNvcmQ6IG9iamVjdHMgbWVyZ2Uga2V5IGJ5CiAga2V5LCBhcnJheXMgYW5kIHNjYWxhcnMgYXJlIHJlcGxhY2VkIHdob2xlLCBhbmQgYW4gZXhwbGljaXQgYG51bGxgCiAgZGVsZXRlcyBhIGtleS4KLSBgcmVwbGFjZXNgIHN3YXBzIHRoZSByZWNvcmQgYm9keSB3aG9sZXNhbGUgKHRoZSByZWYgYW5kIG93bmVyIHN0YXkpLgotIGByZW1vdmVzYCBkZWxldGVzIHRoZSByZWNvcmQgZnJvbSB0aGUgY29tcG9zZWQgZ2FtZS4KLSBgZmllbGRQYXRjaGVzYCBhcHBsaWVzIHR5cGVkIG9wcyB0byBkb3QtcGF0aHMgKGBzZXRgLCBgbWVyZ2VgLAogIGBhZGRGbGFnYCwgYHJlbW92ZUZsYWdgLCBgYWRkYCwgYG11bGAsIGBhcHBlbmRgLCBgcmVtb3ZlVmFsdWVgKSAtIHNlZQogIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9wYXRjaC50c2AuIGBhcHBlbmRgIGFkZHMgZW50cmllcyB0byBhIGxpc3QKICB3aXRob3V0IHJlc3RhdGluZyBpdCwgd2hpY2ggaXMgaG93IGEgbW9kIHB1dHMgYW4gaXRlbSBpbiBhIHNob3AncwogIHN0b2NrOyBgcmVtb3ZlVmFsdWVgIHRha2VzIGFuIGVudHJ5IG91dCBhZ2Fpbi4KLSBNb2RpZnlpbmcgYSByZWNvcmQgeW91IGRvIG5vdCBvd24gcmVxdWlyZXMgZGVjbGFyaW5nIGl0cyBvd25lciBpbgogIGBkZXBlbmRlbmNpZXNgOyBjb21wb3NlIHRocm93cyBvdGhlcndpc2UuCgojIyMjIFdoYXQgYSByZWYgbG9va3MgbGlrZSB3aGVuIGNvcmUgc2hpcHMgdGhlIG5hbWUgdHdpY2UKCkEgcmVmIGlzIGA8cGFjaz46PHNsdWcgb2YgdGhlIHJlY29yZCdzIGlkZW50aXR5PmAuIEZvciBtb3N0IGZpbGVzIHRoYXQKaWRlbnRpdHkgaXMgdGhlIHJlY29yZCdzIGBuYW1lYCwgc28gYGNvcmU6a29ib2xkYCBpcyBhIG1vbnN0ZXIgYW5kCmBteXBhY2s6ZnJvc3Qtd3lybWAgaXMgeW91cnMuIFR3byBjYXNlcyBuZWVkIG1vcmU6CgotICoqRmlsZXMga2V5ZWQgYnkgc29tZXRoaW5nIG90aGVyIHRoYW4gYG5hbWVgLioqIGBzdG9yZWAgaXMga2V5ZWQgYnkgaXRzCiAgYFNUT1JFXypgIGNvZGUsIGBicmFuZGAgYW5kIGBzbGF5YCBieSBgY29kZWAsIGBvYmplY3RfYmFzZWAgYnkgdHZhbCwKICBgY29uc3RhbnRzYCBieSB0aGUgZmlsZSBpdHNlbGYgKGBjb3JlOmNvbnN0YW50c2AsIHdoaWNoIGlzIHdoYXQgYQogIGBmaWVsZFBhdGNoYCBhZ2FpbnN0IGEgZ2FtZSBjb25zdGFudCB0YXJnZXRzKS4gVGhlIGZ1bGwgdGFibGUgaXMKICBgcGFja2FnZXMvbW9kLXNkay9zcmMvcmVjb3JkLWtleS50c2A7IHRoZSBsb2FkZXIgbmFtZXMgdGhlIGlkZW50aXR5IGluCiAgZXZlcnkgZXJyb3IgaXQgcmVwb3J0cywgc28geW91IHJhcmVseSBoYXZlIHRvIGxvb2sgaXQgdXAuCi0gKipOYW1lcyBjb3JlIGdlbnVpbmVseSByZXBlYXRzLioqIGBlZ29faXRlbWAgc2hpcHMgIm9mIEFjaWQiIG1vcmUgdGhhbgogIG9uY2UgLSBvbmUgZm9yIG1lbGVlIHdlYXBvbnMsIG9uZSBmb3IgYW1tdW5pdGlvbiAtIHNvIGBjb3JlOm9mLWFjaWRgCiAgbmFtZXMgbmVpdGhlci4gQWRkIGEgYCNgIGFuZCB0aGUgaXRlbSB0eXBlcyBpdCBhcHBsaWVzIHRvOgogIGBjb3JlOm9mLWFjaWQjc2hvdC1hcnJvdy1ib2x0YC4gV3JpdGUgdGhlIHBsYWluIHJlZiBhbmQgdGhlIGxvYWRlcgogIHJlZnVzZXMgaXQgKmFuZCBsaXN0cyB0aGUgb25lcyB0aGF0IHdvcmsqLCBzbyB0aGUgZXJyb3IgdGVsbHMgeW91IHdoYXQKICB0byB0eXBlLgoKVGhlIGAqYCBhbmQgYCtgIGluIGFuIEFuZ2JhbmQgbmFtZSBhcmUgcGFydCBvZiBpdDogYCpIZWFsaW5nKmAgaXMKYGNvcmU6cG90aW9uLS1zdGFyLWhlYWxpbmctc3RhcmAsIGRpc3RpbmN0IGZyb20gYEhlYWxpbmdgLgoKIyMjIyBBZGRpbmcgeW91ciBvd24gZmllbGRzIHRvIGEgY29yZSByZWNvcmQKCkEgcGF0Y2ggaXMgbm90IGxpbWl0ZWQgdG8gdGhlIGZpZWxkcyBjb3JlIGRlZmluZXMuIFlvdSBjYW4gaW50cm9kdWNlIHlvdXIgb3duIC0KZGVjbGFyZSB0aGVtIGluIHlvdXIgbWFuaWZlc3QsIGFuZCB3cml0ZSB0aGVtIG5hbWVzcGFjZWQgd2l0aCB5b3VyIG1vZCBpZC4KCmBgYGpzb24KImZpZWxkcyI6IFsKICB7ICJuYW1lIjogImJsZWVkIiwgImZpbGVzIjogWyJvYmplY3QiLCAiZWdvX2l0ZW0iXSwgInR5cGUiOiAib2JqZWN0IiwKICAgICJsYWJlbCI6ICJCbGVlZCIgfQpdCmBgYAoKYGBganNvbgp7CiAgImZpZWxkUGF0Y2hlcyI6IHsKICAgICJjb3JlOnN3b3JkLS1kYWdnZXIiOiBbCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImF0dGFjay5oZCIsICJ2YWx1ZSI6ICIxZDUiIH0sCiAgICAgIHsgIm9wIjogInNldCIsICJwYXRoIjogImdvcmU6YmxlZWQiLAogICAgICAgICJ2YWx1ZSI6IHsgImRpY2UiOiAiMWQzIiwgInR1cm5zIjogNSB9IH0KICAgIF0KICB9Cn0KYGBgCgpUaGUgZmlyc3Qgb3AgcmV0dW5lcyBhIGZpZWxkIGNvcmUgb3ducyAtIHRoZSBkYWdnZXIgbm93IHJlYWxseSByb2xscyAxZDUuIFRoZQpzZWNvbmQgYWRkcyBvbmUgY29yZSBkb2VzIG5vdCwgYW5kIGEgcGx1Z2luIHJlYWRzIGl0IGJhY2sgYXMKYGtpbmQuZXh0WyJnb3JlOmJsZWVkIl1gLgoKKipXaHkgbmFtZXNwYWNlZC4qKiBXaG9ldmVyIHNoaXBzIGZpcnN0IHdvdWxkIG90aGVyd2lzZSB0YWtlIGBibGVlZGAsIGFuZCBldmVyeQpsYXRlciBtb2QgZWl0aGVyIGNvbGxpZGVzIHdpdGggaXQgb3Igd29ya3MgYXJvdW5kIGl0LiBRdWFsaWZ5aW5nIGJ5IHlvdXIgbW9kIGlkCm1ha2VzIHRoZSBjb2xsaXNpb24gaW1wb3NzaWJsZSwgYW5kIG1ha2VzIGRlbGliZXJhdGUgaW50ZXJvcCBwb3NzaWJsZSBpbiB0aGUKc2FtZSBzdHJva2UgLSB3cml0aW5nIGBnb3JlOmJsZWVkYCBmcm9tIGEgZGlmZmVyZW50IG1vZCBpcyB1bmFtYmlndW91c2x5IGFuCmF0dGVtcHQgdG8gZXh0ZW5kICpnb3JlJ3MqIGZpZWxkLiBJdCBpcyB0aGUgc2FtZSBydWxlIHRoZSB2b2NhYnVsYXJ5IHJlZ2lzdHJ5CmFscmVhZHkgdXNlcyBmb3IgdGVybXMgKGBnb3JlOmx1Y2tgKSwgc28gdGhlcmUgaXMgb25lIHJ1bGUsIG5vdCB0d28uCgoqKldyaXRpbmcgYW5vdGhlciBtb2QncyBmaWVsZC4qKiBUbyB3cml0ZSBgZ29yZTpibGVlZGAgZnJvbSBhIG1vZCBvdGhlciB0aGFuCmBnb3JlYCwgZGVjbGFyZSBgZ29yZWAgaW4gYGRlcGVuZGVuY2llc2Agb3IgYG9wdGlvbmFsRGVwZW5kZW5jaWVzYC4gT3RoZXJ3aXNlCnRoZSB3cml0ZSBpcyByZWZ1c2VkLCB0aGUgZmllbGQgaXMgcm9sbGVkIGJhY2ssIGFuZCB0aGUgZmF1bHQgbmFtZXMgeW91ciBtb2Q7CmxhdGVyIGVkaXRzIHRvIHRoYXQgZmllbGQgbWFkZSBmcm9tIHRoZSByZWZ1c2VkIHZhbHVlIGFyZSByb2xsZWQgYmFjayB0b28uCgoqKldoeSBkZWNsYXJlZC4qKiBBIG5hbWVzcGFjZWQga2V5IHRoYXQgbm8gbG9hZGVkIG1vZCBkZWNsYXJlcyBpcyBzdHJpcHBlZCBhdApjb21wb3NpdGlvbiBhbmQgcmVwb3J0ZWQgYnkgbmFtZSwgYW5kIHNvIGlzIG9uZSB3cml0dGVuIG9udG8gYSBmaWxlIHRoZQpkZWNsYXJhdGlvbiBkb2VzIG5vdCBsaXN0LCBvciBvbmUgd2hvc2Ugc2hhcGUgZG9lcyBub3QgbWF0Y2ggaXRzIGB0eXBlYC4gVGhlCmRlY2xhcmF0aW9uIGNvc3RzIG9uZSBtYW5pZmVzdCBsaW5lIGFuZCBidXlzIHRoZSBlcnJvciBtZXNzYWdlOiB3aXRob3V0IGl0LCBhCnR5cG8gbG9va3MgZXhhY3RseSBsaWtlIGEgZGVsaWJlcmF0ZSBuZXcgZmllbGQsIHNvIHlvdSB3b3VsZCBzZWUgeW91ciBkYXRhCmFycml2ZSBhbmQgY29uY2x1ZGUgdGhlIHBhdGNoIHdvcmtlZC4KCkFuICp1bnF1YWxpZmllZCoga2V5IGNvcmUgZG9lcyBub3Qga25vdyBpcyBub3QgdHJlYXRlZCBhcyBhIGZpZWxkIGF0IGFsbCAtCmBhdGFja2AgaXMgYSBtaXNzcGVsbGluZyBvZiBgYXR0YWNrYCwgbm90IGEgbmV3IGF0dHJpYnV0ZSAtIGFuZCB0aGUgZ2FtZSByZXBvcnRzCml0IHdpdGggY29yZSdzIG5lYXJlc3QgcmVhbCBmaWVsZCBuYW1lZC4KCkEgZHJvcHBlZCBmaWVsZCBjb3N0cyB0aGUgZmllbGQsIG5vdCB0aGUgbW9kOiBldmVyeXRoaW5nIGVsc2UgdGhhdCBwYXRjaCBkaWQKc3RpbGwgYXBwbGllcy4KCmBleHRgIGlzIGFic2VudCBlbnRpcmVseSBvbiBhbiB1bm1vZGRlZCByZWNvcmQsIHNvIGl0cyBwcmVzZW5jZSBtZWFucyBhIG1vZCBwdXQKc29tZXRoaW5nIHRoZXJlLCBhbmQgaXQgaG9sZHMgT05MWSB5b3VyIGtleXMgLSBjb3JlJ3Mgb3duIGZpZWxkcyBhcmUgbmV2ZXIKY29waWVkIGludG8gaXQsIGJlY2F1c2UgYSBtb2QgcmVhZGluZyBhIHByZS1iaW5kIGNvcHkgb2YgYSBmaWVsZCBpdCBkaWQgbm90IGFkZAp3b3VsZCBiZSByZWFkaW5nIGEgdmFsdWUgdGhhdCBjYW4gZGlzYWdyZWUgd2l0aCB0aGUgYm91bmQgb25lIGZvcmV2ZXIgd2l0aG91dAplaXRoZXIgYmVpbmcgd3JvbmcuIEl0IGlzIGZyb3plbiwgc28gb25lIG1vZCBjYW5ub3QgcmV3cml0ZSB3aGF0IGFub3RoZXIgcmVhZHMuCgpgZmllbGRzYCBlbnRyaWVzIHRha2U6Cgp8IGtleSB8IHJlcXVpcmVkIHwgbWVhbmluZyB8CnwtLS18LS0tfC0tLXwKfCBgbmFtZWAgfCB5ZXMgfCBiYXJlIG5hbWUsIG5vIGNvbG9uIC0gdGhlIG5hbWVzcGFjZSBpcyBhZGRlZCBmb3IgeW91IHwKfCBgZmlsZXNgIHwgeWVzIHwgdGhlIHJlY29yZCBmaWxlcyBpdCBtYXkgYXBwZWFyIG9uOyBhIG1pc3BsYWNlbWVudCBpcyBhbiBlcnJvciB8CnwgYHR5cGVgIHwgbm8gfCBgc3RyaW5nYCwgYG51bWJlcmAsIGBib29sZWFuYCwgYG9iamVjdGAsIGBhcnJheWAsIG9yIGBhbnlgIHwKfCBgbGFiZWxgLCBgZGVzY2AgfCBubyB8IGZvciBhIG1vZCBtYW5hZ2VyIG9yIGEgY2hhcmFjdGVyIHNoZWV0IHwKCkNvcmUgbmV2ZXIgcmVhZHMgYGV4dGAuIERhdGEgYWxvbmUgY2hhbmdlcyBub3RoaW5nOiB0aGUgZ2FtZSBkb2VzIG5vdCBrbm93CndoYXQgImJsZWVkIiBtZWFucywgc28gYSBtb2QgdGhhdCBhZGRzIHRoZSBmaWVsZCBhbHNvIHN1cHBsaWVzIHRoZSBiZWhhdmlvdXIgLQphIGByZWdpc3RyeTplZmZlY3RgIGhhbmRsZXIgZm9yIHdoYXQgYmxlZWRpbmcgZG9lcywgb3IgYSBgcmVnaXN0cnk6Ymxvd2AKaGFuZGxlciBmb3IgYSBtb25zdGVyIGF0dGFjayB0aGF0IGFwcGxpZXMgaXQuIEFkZGluZyB0aGUgZmllbGQgaXMgd2hhdCBtYWtlcwp0aGUgZGF0YSBoYWxmIHBvc3NpYmxlOyB0aGUgcGx1Z2luIGlzIHdoYXQgbWFrZXMgaXQgaGFwcGVuLgoKV2hpY2gga2V5cyBjb3VudCBhcyBjb3JlJ3MgaXMgbWVhc3VyZWQgZnJvbSBjb3JlJ3Mgb3duIGdhbWVkYXRhIHJhdGhlciB0aGFuCmRlY2xhcmVkIChgcGFja2FnZXMvY29yZS9zcmMvbW9kL3JlY29yZC1rZXlzLnRzYCwgZ2VuZXJhdGVkIGFuZCByZS1kZXJpdmVkIGJ5Cml0cyB0ZXN0IGluIGJvdGggZGlyZWN0aW9ucyksIHNvIHRoZSBib3VuZGFyeSBjYW5ub3QgZHJpZnQgYXMgdGhlIHBhY2sgZ3Jvd3MuCgo+ICoqVGhlIG9sZCBsaW1pdGF0aW9uIGhlcmUgaXMgZ29uZSwgYW5kIHRoaXMgbm90ZSByZXBsYWNlcyBpdC4qKiBVbnRpbAo+IDIwMjYtMDctMjkgYSBwZXItcmVjb3JkIG9wIGFpbWVkIGF0IGFueSBvZiB0aGUgMjAgbm9uLW5hbWUta2V5ZWQgZmlsZXMKPiB3YXMgc2lsZW50bHkgZHJvcHBlZCwgYW5kIHVudGlsIDIwMjYtMDgtMDggYSBmdXJ0aGVyIDczIGluZGl2aWR1YWwKPiByZWNvcmRzIC0gNjEgb2YgYGVnb19pdGVtYCdzIDEwNyBhbW9uZyB0aGVtIC0gd2VyZSBhZGRyZXNzYWJsZSBieSBubwo+IHJlZiBhdCBhbGwuIEJvdGggYXJlIGNsb3NlZCBhbmQgbWVhc3VyZWQ6ICoqZXZlcnkgcmVjb3JkIG9mIGV2ZXJ5Cj4gc2hpcHBlZCBmaWxlIGlzIG5vdyByZWFjaGFibGUqKiwgZXhjZXB0IGBoaXN0b3J5YCwgd2hvc2UgcmVjb3JkcyBhcmUKPiBge2NoYXJ0LCBwaHJhc2V9YCB3aXRoIG5vdGhpbmcgaW4gdGhlbSB0aGF0IGlzIG5vdCBhIHZhbHVlIGEgbW9kIHdvdWxkCj4gY2hhbmdlLiBBbiBvcCBhZ2FpbnN0IGBoaXN0b3J5YCBpcyByZXBvcnRlZCwgbmV2ZXIgZHJvcHBlZC4KPiBgTU9EX1JFQUNILm1kYCBjYXJyaWVzIHRoZSBtZWFzdXJlbWVudC4KClRvdGFsIGNvbnZlcnNpb25zIGFyZSB0aGUgc2FtZSBtZWNoYW5pc20gYXQgZnVsbCB0aHJvdHRsZTogZGVwZW5kIG9uCmBjb3JlYCwgcmVwbGFjZSBvciByZW1vdmUgd2hhdCB5b3UgZG8gbm90IHdhbnQsIGFkZCB5b3VyIG93biB3b3JsZC4KCiMjIyBBZGRpbmcgdGhpbmdzIHRoYXQgZG8gbm90IGV4aXN0IGluIHRoZSBiYXNlIGdhbWUKClR3byBsZXZlbHM6CgoxLiBOZXcgcmVjb3JkcyBvZiBleGlzdGluZyB0eXBlcyAodGhlIEpTT04gYWJvdmUpIC0gcHVyZSBkYXRhLCBzYWZlIGJ5CiAgIGNvbnN0cnVjdGlvbiwgdmFsaWRhdGVkIGFnYWluc3QgdGhlIHNhbWUgc2NoZW1hcyBjb3JlIHVzZXMuCjIuIE5ldyBjYXBhYmlsaXRpZXMgLSBuZXcgZWZmZWN0IG9wY29kZXMsIG5ldyBjb21tYW5kcywgbmV3IHJvb20KICAgYnVpbGRlcnMsIG1vbnN0ZXItQUkgb3ZlcnJpZGVzLCBuZXcgdm9jYWJ1bGFyeSB0ZXJtcy4gVGhlc2UgZ28KICAgdGhyb3VnaCB0aGUgY2FwYWJpbGl0eS1nYXRlZCByZWdpc3RyeSBob3N0CiAgIChgcGFja2FnZXMvY29yZS9zcmMvbW9kL3JlZ2lzdHJ5LWhvc3QudHNgKSwgYW5kIHRoZXkgcmVxdWlyZSBhCiAgICoqVFJVU1RFRCBpbi1wcm9jZXNzKiogcGx1Z2luIC0geW91ciBtb2QgZm9sZGVyJ3MgYHBsdWdpbi5qc2AgLSBub3QgdGhlCiAgIHNhbmRib3hlZCBXb3JrZXIgdGllci4gQSBXb3JrZXIgaXMgYXN5bmMgYnkgY29uc3RydWN0aW9uIGFuZCBjYW5ub3QKICAgc3VwcGx5IGEgaGFuZGxlciB0aGF0IHJ1bnMgc3luY2hyb25vdXNseSB3aXRoIGxpdmUgYHJuZ2AgLyBgY2h1bmtgIC8KICAgYHBsYXllcmAgYWNjZXNzIGRlZXAgaW5zaWRlIHRoZSB0dXJuLiBUaGUgc2FuZGJveGVkIHRpZXIga2VlcHMgdGhlCiAgIHJlYWN0aXZlIHBlcmNlaXZlL2FjdC9ldmVudCBzdXJmYWNlIGFuZCBub25lIG9mIHRoZSByZWdpc3RyaWVzLgogICBUcnVzdCBpcyBleHBsaWNpdDogdGhlIHBsdWdpbiBkZWNsYXJlcyBlYWNoIGByZWdpc3RyeToqYCBjYXBhYmlsaXR5CiAgIGluIGl0cyBtYW5pZmVzdCBhbmQgdGhlIHVzZXIgY29uc2VudHMgYXQgaW5zdGFsbC4gKipFeHBsaWNpdCBpcyBub3QKICAgdGhlIHNhbWUgYXMgZW5mb3JjZWQqKiwgYW5kIHRoZSBkaWZmZXJlbmNlIGlzIHdvcnRoIGtub3dpbmcgYmVmb3JlCiAgIGJ1aWxkaW5nIG9uIGl0OiB0aGUgY2FwYWJpbGl0eSBnYXRlcyB0aGUgZmFjYWRlLCB3aGlsZSB0aGUgc2FtZSBsaXZlCiAgIHJlZ2lzdHJpZXMgYWxzbyBhcnJpdmUgdW5nYXRlZCB0aHJvdWdoIGBjdHguY29yZWAsIGBjdHguc3RhdGVgIGFuZAogICBgY3R4LnJlZ2lzdHJpZXNgLCBiZWNhdXNlIGEgbW9kIGlzIG1lYW50IHRvIGJlIGFibGUgdG8gcmVhZAogICBldmVyeXRoaW5nIHdpdGhvdXQgZGVjbGFyaW5nIGFueXRoaW5nLiBQTFVHSU5TLm1kJ3MKICAgIldoYXQgYSBjYXBhYmlsaXR5IGdhdGVzLCBhbmQgd2hhdCBpdCBkb2VzIG5vdCIgaGFzIHRoZSB0YWJsZSBvZgogICB0d2lucyBhbmQgdGhlIHJlYXNvbiB0aGUgYm91bmRhcnkgaXMgdGhlIGluc3RhbGwgcmF0aGVyIHRoYW4gdGhlCiAgIGxpc3QuCgo+ICoqVGhpcyBsaW1pdGF0aW9uIGlzIENMT1NFRCwgYW5kIHdoYXQgZm9sbG93cyBpcyB3aGF0IHJlcGxhY2VkIGl0LioqIFVudGlsIHRoZQo+IHBsdWdpbiBBQkkgbGFuZGVkLCBib3RoIGNvZGUgcGF0aHMgd2VyZSBidWlsZC10aW1lIFZpdGUgZ2xvYnMgb3Zlcgo+IGBwYWNrYWdlcy93ZWIvbW9kcy9gLCBzbyBvbmx5IGEgbW9kIGNvbXBpbGVkIGludG8gdGhlIHdlYiBidW5kbGUgY291bGQgcmVhY2ggYQo+IHJlZ2lzdHJ5IGFuZCBhIG1vZCBpbnN0YWxsZWQgZnJvbSBkaXNrIGNvdWxkIHN1cHBseSBnYW1lZGF0YSBKU09OIGFuZCBub3RoaW5nCj4gZWxzZS4gVGhhdCBpcyBubyBsb25nZXIgdHJ1ZS4gQSBtb2QgZm9sZGVyIHNoaXBzIGBwbHVnaW4uanNgIGJlc2lkZSBpdHMKPiBgbWFuaWZlc3QuanNvbmAsIHRoZSBob3N0IGxvYWRzIGl0IGZyb20gd2hlcmV2ZXIgdGhlIGZvbGRlciBpcyAoYSBsb29wYmFjayBVUkwKPiBvbiBkZXNrdG9wLCBhIHJld3JpdHRlbiBtb2R1bGUgZ3JhcGggaW4gYSBicm93c2VyIHRhYikgYW5kIGNhbGxzCj4gYHJlZ2lzdGVyKGhvc3QsIGN0eClgIG9uIGl0IGxpa2UgYW55IG90aGVyIC0gYHBhY2thZ2VzL3dlYi9zcmMvbW9kLXBsdWdpbi50c2AKPiBpcyB0aGUgY29udHJhY3QgYW5kIGBtYWluLnRzYCdzIGBhY3RpdmVNb2RDb2RlKCkucGx1Z2luc2AgbG9vcCBpcyB0aGUgY2FsbGVyLgo+IFRoZSBzaGlwcGVkIGBmZWF0dXJlLXJlc3RvcmF0aW9uYCBtb2QgcmVhY2hlcyBgcmVnaXN0cnk6c3RvcmVgIHRoaXMgd2F5LCBmcm9tCj4gaXRzIG93biByZXBvc2l0b3J5LCB0aHJvdWdoIHRoZSBzYW1lIGluc3RhbGwgcm91dGUgYW55b25lJ3MgbW9kIHVzZXMuCj4KPiBXaGF0IGlzIHN0aWxsIHRydWU6IHRoZSByZWdpc3RyaWVzIGNvdmVyIGEgc2V0IG9mIGRvbWFpbnMsIG5vdCB0aGUgd2hvbGUKPiBlbmdpbmUsIGFuZCBtb3N0IG9mIHRoZSBwb3J0J3MgZGlzcGF0Y2ggdGFibGVzIGhhdmUgbm8gcmVnaXN0cnkgYXQgYWxsLgo+IGBNT0RfUkVBQ0gubWRgIGhhcyB0aGUgY2Vuc3VzLCBhbmQgaXQgaXMgdGhlIG51bWJlciB0byBjaGVjayBiZWZvcmUgYnVpbGRpbmcKPiBvbiBhIGNhcGFiaWxpdHkgY2xhaW0uCgojIyBWZXJzaW9uaW5nIGFuZCBzdGFiaWxpdHkKCmBAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrYCBpcyB0aGUgdmVyc2lvbmVkIHN1cmZhY2UgbW9kIGF1dGhvcnMgYnVpbGQKYWdhaW5zdC4gVHlwZXMgYXJlIGV4cG9ydGVkIGZvciBUeXBlU2NyaXB0IGF1dGhvcnM7IGV2ZXJ5dGhpbmcgaXMgcGxhaW4KSlNPTiBhdCByZXN0LiBCcmVha2luZyBjaGFuZ2VzIHRvIHBhY2sgc2VtYW50aWNzIGJ1bXAgdGhlIFNESyBtYWpvcgp2ZXJzaW9uIGFuZCBhcmUgY2FsbGVkIG91dCBpbiByZWxlYXNlIG5vdGVzLgoKKipgTU9EX0NPTVBBVElCSUxJVFkubWRgIGlzIHRoZSBwYWdlIHRoYXQgYW5zd2VycyAid2lsbCBteSBtb2Qgc3RpbGwgd29yayIuKioKSW4gb25lIGxpbmU6IGEgZGF0YS1vbmx5IG1vZCBzaG91bGQgc3Vydml2ZSBlbmdpbmUgcmVsZWFzZXMgd2l0aG91dCBiZWluZwpyZXB1Ymxpc2hlZCwgYW5kIGEgbW9kIHRoYXQgc2hpcHMgY29kZSBnZXRzIGEgcmVsZWFzZSdzIHdhcm5pbmcgYmVmb3JlIGFuIEFCSQpjaGFuZ2Ugc3RyYW5kcyBpdC4gVGhhdCBwYWdlIGhhcyB0aGUgbWVjaGFuaXNtcywgdGhlIG1lYXN1cmVtZW50cyBiZWhpbmQgdGhlbSwKYW5kIHRoZSBvbmUgcGxhY2UgdGhlIHByb21pc2UgZG9lcyBub3QgeWV0IGhvbGQgKGBjdHguY29yZWApLgoKIyMgTGljZW5zaW5nIGZvciBtb2QgYXV0aG9ycwoKVGhlIGVuZ2luZSBpcyBkdWFsLWxpY2Vuc2VkIEdQTHYyLW9yLUFuZ2JhbmQtbGljZW5zZSAoc2VlIExJQ0VOU0UubWQpLgpEZWNsYXJhdGl2ZSBjb250ZW50IHBhY2tzIGFuZCB0aWxlIHBhY2tzIGFyZSB5b3VyIG93biBpbmRlcGVuZGVudCB3b3JrczsKbGljZW5zZSB0aGVtIGFzIHlvdSB3aXNoLiBEaXN0cmlidXRlZCBzY3JpcHRlZCBwbHVnaW5zIGFyZSBzYWZlc3QKdHJlYXRlZCBhcyBHUEx2MiBkZXJpdmF0aXZlcy4gU2VlIHRoZSBub3RlIGF0IHRoZSBlbmQgb2YgZG9jcy9NT0RTLm1kLgo="
  },
  {
    "id": "requirements",
    "path": "REQUIREMENTS.md",
    "audience": "advanced",
    "title": "Requirements",
    "note": "The rules the game enforces before it installs a mod.",
    "encoded": "PCEtLSBHRU5FUkFURUQgZnJvbSBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHMgLSBkbyBub3QgZWRpdCBieSBoYW5kLiAtLT4KPCEtLSBSdW46IG5vZGUgcGFja2FnZXMvbW9kLXNkay9iaW4vbmVvLWFuZ2JhbmQtbW9kLWNoZWNrLm1qcyAtLXdyaXRlLWRvY3MgLS0+CgojIFdoYXQgYSBtb2QgbXVzdCBwcm92aWRlCgpFdmVyeSBydWxlIGJlbG93IGlzIENPREUsIGluIGBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zdGFuZGFyZHMudHNgLiBUaGUgc2FtZQpmdW5jdGlvbiB0aGF0IGdlbmVyYXRlZCB0aGlzIHBhZ2UgaXMgdGhlIG9uZSB0aGUgZ2FtZSBydW5zIHdoZW4gaXQgaW5zdGFsbHMgYQptb2QsIGFuZCB0aGUgb25lIGBuZW8tYW5nYmFuZC1tb2QtY2hlY2tgIHJ1bnMgZm9yIHlvdSBiZWZvcmUgeW91IHB1Ymxpc2guIFNvCnRoaXMgcGFnZSBjYW5ub3QgZmFsbCBiZWhpbmQgdGhlIGdhbWU6IGlmIGEgcnVsZSBjaGFuZ2VzLCB0aGlzIHRleHQgY2hhbmdlcyB3aXRoCml0LCBhbmQgYSB0ZXN0IGZhaWxzIGlmIGl0IGRvZXMgbm90LgoKQ2hlY2sgeW91ciBtb2Q6CgpgYGAKbnB4IG5lby1hbmdiYW5kLW1vZC1jaGVjayBwYXRoL3RvL3lvdXItbW9kCmBgYAoKIyMgUmVxdWlyZWQKCkEgbW9kIHRoYXQgZmFpbHMgYW55IG9mIHRoZXNlIGNhbm5vdCB3b3JrLCBhbmQgdGhlIGdhbWUgcmVmdXNlcyB0byBpbnN0YWxsIGl0LgoKIyMjIFNoaXAgbWFuaWZlc3QuanNvbiBhdCB0aGUgcm9vdCBvZiB0aGUgbW9kIGZvbGRlcgoKYG1hbmlmZXN0LXByZXNlbnRgCgpJdCBpcyBob3cgdGhlIGdhbWUgcmVjb2duaXNlcyBhIGZvbGRlciBhcyBhIG1vZCBhdCBhbGwuIEEgZm9sZGVyIHdpdGhvdXQgb25lIGlzIG5vdCBsb2FkZWQsIG5vdCBsaXN0ZWQsIGFuZCBub3QgcmVwb3J0ZWQgYXMgYnJva2VuIC0gaXQgaXMgc2ltcGx5IG5vdCBhIG1vZC4KCiMjIyBNYWtlIG1hbmlmZXN0Lmpzb24gdmFsaWQgSlNPTgoKYG1hbmlmZXN0LWpzb25gCgpJdCBpcyByZWFkIGJlZm9yZSBhbnl0aGluZyBlbHNlLiBBIHRyYWlsaW5nIGNvbW1hIHN0b3BzIHRoZSB3aG9sZSBtb2QgbG9hZGluZy4KCiMjIyBEZWNsYXJlIGlkLCBuYW1lLCB2ZXJzaW9uIGFuZCBzaGFwZSwgYW5kIG5vdGhpbmcgbWFsZm9ybWVkCgpgbWFuaWZlc3QtZmllbGRzYAoKVGhlc2UgZm91ciBhcmUgd2hhdCB0aGUgbWFuYWdlciBsaXN0cyBhbmQgd2hhdCB0aGUgbG9hZGVyIGtleXMgZXZlcnl0aGluZyBieS4gVGhlIGNoZWNrIGlzIHRoZSBnYW1lJ3MgT1dOIHZhbGlkYXRvciwgc28gdGhpcyBjYW5ub3QgcGFzcyBoZXJlIGFuZCBmYWlsIHRoZXJlLgoKIyMjIFNheSB3aGVyZSB0aGUgbW9kIGxpdmVzLCBpbiBgcmVwb3NpdG9yeWAKCmBkZWNsYXJlLWEtcmVwb3NpdG9yeWAKCkl0IGlzIHRoZSBtb2QncyBpZGVudGl0eSBhY3Jvc3MgZXZlcnkgd2F5IG9mIGdldHRpbmcgaXQuIFRoZSBnYW1lIHBpbnMgYW4gaW5zdGFsbGVkIG1vZCB0byB0aGUgcmVwb3NpdG9yeSBpdCBjYW1lIGZyb20gYW5kIHdpbGwgbm90IGxldCBhIGRpZmZlcmVudCBvbmUgcmVwbGFjZSBpdCwgc28gYSBtb2QgdGhhdCBuYW1lcyBub3doZXJlIGNhbiBiZSBxdWlldGx5IG92ZXJ3cml0dGVuIGJ5IGFueXRoaW5nIHRoYXQgY2xhaW1zIGl0cyBpZC4gSXQgaXMgYWxzbyB0aGUgb25seSByb3V0ZSBieSB3aGljaCBhbiB1cGRhdGUgY2FuIGV2ZXIgYmUgb2ZmZXJlZCwgYW5kIHRoZSBvbmx5IHRoaW5nIGEgcGxheWVyIGhhcyB0byBnbyBhbmQgcmVhZCBhYm91dCB0aGUgbW9kLiBSZXF1aXJlZCBvZiBhbiBhcmNoaXZlIGV4YWN0bHkgYXMgaXQgaXMgb2YgYSBjaGVja291dDogYSBtb2QgaGFuZGVkIG92ZXIgYXMgYSB6aXAgaXMgdGhlIHNhbWUgbW9kLCBhbmQgaXQgbXVzdCBub3QgYmUgYWJsZSB0byBhcnJpdmUga25vd2luZyBsZXNzIGFib3V0IGl0c2VsZiB0aGFuIHRoZSBzYW1lIGZpbGVzIGZldGNoZWQgZnJvbSBhIHJlcG9zaXRvcnkgd291bGQuCgojIyMgTmFtZSB0aGUgYXV0aG9yCgpgY3JlZGl0LWFuLWF1dGhvcmAKClRoZSBnYW1lIHNob3dzIGl0IGJlc2lkZSB0aGUgbW9kJ3MgbmFtZSwgc28gYSBwbGF5ZXIgY2FuIHRlbGwgdHdvIG1vZHMgb2YgdGhlIHNhbWUgbmFtZSBhcGFydCBhbmQga25vd3Mgd2hvc2Ugd29yayB0aGV5IGFyZSBhYm91dCB0byBydW4uIEEgcm93IHdpdGggbm8gYXV0aG9yIGlzIGEgcm93IHRoYXQgYXNrcyBzb21lYm9keSB0byB0cnVzdCBub2JvZHkgaW4gcGFydGljdWxhci4gVXNlIHRoZSBuYW1lIHlvdSB3YW50IHNob3duIC0gaXQgc2hhcmVzIGEgbGluZSB3aXRoIHRoZSBtb2QncyBuYW1lIGFuZCB2ZXJzaW9uLCBzbyBrZWVwIGl0IHNob3J0OyBhbnl0aGluZyBsb25nZXIgYmVsb25ncyBpbiBgZGVzY3JpcHRpb25gLgoKIyMjIERlY2xhcmUgdGhlIGVuZ2luZSByYW5nZSB0aGUgbW9kIHdhcyB3cml0dGVuIGFnYWluc3QKCmBlbmdpbmUtcmFuZ2VgCgpXaXRob3V0IGl0IHRoZSBtb2QgaXMgb2ZmZXJlZCB0byBldmVyeSB2ZXJzaW9uIG9mIHRoZSBnYW1lIGZvcmV2ZXIsIGluY2x1ZGluZyB0aGUgb25lIHRoYXQgY2hhbmdlcyB0aGUgdGhpbmcgaXQgZGVwZW5kcyBvbi4gV2l0aCBpdCwgYSBwbGF5ZXIgaXMgdG9sZCB0aGUgbW9kIGlzIHRvbyBvbGQgaW5zdGVhZCBvZiB3YXRjaGluZyBpdCBtaXNiZWhhdmUuIFRoaXMgd2FzIGFkdmljZSB1bnRpbCBpdCB3YXMgbWVhc3VyZWQ6IGV2ZXJ5IG1vZCB0aGF0IGhhZCBzaGlwcGVkIGRlY2xhcmVkIG9uZSwgYW5kIHRoZSBtb2RzIHRoYXQgZGlkIG5vdCB3ZXJlIHRoZSBvbmVzIG5vdGhpbmcgaGFkIGNoZWNrZWQuCgojIyMgRGVjbGFyZSBtb2RBcGkgaWYgdGhlIG1vZCBzaGlwcyBwbHVnaW4uanMKCmBwbHVnaW4tZGVjbGFyZXMtbW9kYXBpYAoKVGhlIGhvc3QgcmVmdXNlcyBhbiBpbmNvbXBhdGlibGUgcGx1Z2luIEJFRk9SRSBpbXBvcnRpbmcgaXQsIHdoaWNoIGl0IGNhbiBvbmx5IGRvIGZyb20gdGhlIG1hbmlmZXN0IC0gYSB2ZXJzaW9uIGNoZWNrIGluc2lkZSB0aGUgbW9kdWxlIHJ1bnMgYWZ0ZXIgdGhlIG1vZHVsZSdzIHRvcC1sZXZlbCBjb2RlIGFscmVhZHkgaGFzLiBXaXRob3V0IG1vZEFwaSB0aGVyZSBpcyBub3RoaW5nIHRvIGNoZWNrIGFnYWluc3QsIGFuZCB0aGUgbW9kJ3MgY29kZSBpcyBsb2FkZWQgb24gZmFpdGguCgojIyMgU2F5IHRoZSBtb2QgY29udGFpbnMgY29kZSwgaWYgaXQgc2hpcHMgcGx1Z2luLmpzCgpgcGx1Z2luLWRlY2xhcmVzLWZhY2V0YAoKVGhlIG1hbmFnZXIgdGVsbHMgYSBwbGF5ZXIgd2hldGhlciBhIG1vZCBpcyBkYXRhIG9yIGNvZGUsIGFuZCB0aGF0IGFuc3dlciBkZWNpZGVzIGhvdyBtdWNoIHRoZXkgYXJlIHRydXN0aW5nLiBBIG1vZCBzaGlwcGluZyBjb2RlIHdoaWxlIHByZXNlbnRpbmcgYXMgY29udGVudCBpcyBtaXNsZWFkaW5nIHdoZXRoZXIgb3Igbm90IHRoZSBhdXRob3IgbWVhbnQgaXQgdG8gYmUuCgojIyMgRGVjbGFyZSBjb21taXR0ZWQgLnppcCBhcmNoaXZlcyBpbiBwYXlsb2FkLmFyY2hpdmVzCgpgYXJjaGl2ZXMtZGVjbGFyZWRgCgpOb3RoaW5nIGNhbiB0ZWxsIGZyb20gYSBmaWxlIGxpc3Qgd2hldGhlciBhIC56aXAgaXMgYSBwYWNrIHRvIFVOUEFDSyBvciBhIGZpbGUgdG8gc3RvcmUgYXMtaXMgLSBvbmx5IHRoZSBtYW5pZmVzdCBjYW4gc2F5LiBBbiB1bmRlY2xhcmVkIGFyY2hpdmUgaXMgaW5zdGFsbGVkIHVub3BlbmVkLCBzbyB0aGUgbW9kIGlzIHByZXNlbnQsIGxpc3RlZCwgZW5hYmxlZCwgYW5kIGRvZXMgbm90aGluZy4KCiMjIFJlY29tbWVuZGVkCgpBZHZpY2UuIE5vbmUgb2YgdGhlc2UgYmxvY2tzIGFuIGluc3RhbGw7IGFsbCBvZiB0aGVtIGFyZSB0aGluZ3MgcGxheWVycyBub3RpY2UuCgojIyMgUHVibGlzaCBzb21ld2hlcmUgdGhlIGdhbWUgY2FuIGNoZWNrIGZvciB1cGRhdGVzCgpgdXBkYXRlcy1jYW4tYmUtb2ZmZXJlZGAKCmByZXBvc2l0b3J5YCBtYXkgbmFtZSBhbnkgaG9zdCwgYW5kIHRoZSBnYW1lIHdpbGwgaW5zdGFsbCB0aGUgbW9kIGZyb20gYSB6aXAgZWl0aGVyIHdheSAtIGJ1dCB0aGUgb25seSBob3N0IGl0IGNhbiBBU0sgZm9yIG5ld2VyIHZlcnNpb25zIGlzIEdpdEh1Yi4gQSBtb2QgcHVibGlzaGVkIGVsc2V3aGVyZSBpcyBsaXN0ZWQgd2l0aCBhIG5vdGUgc2F5aW5nIGl0IGNhbm5vdCBiZSBjaGVja2VkLCBhbmQgaXRzIHBsYXllcnMgdXBkYXRlIGl0IGJ5IGhhbmQgb3Igbm90IGF0IGFsbC4gVGhpcyBpcyBhIGxpbWl0YXRpb24gb2YgdGhlIGdhbWUsIG5vdCBhIGp1ZGdlbWVudCBhYm91dCB0aGUgaG9zdC4KCiMjIyBVc2UgYSB2ZXJzaW9uIHRoZSB1cGRhdGUgY2hlY2sgY2FuIG9yZGVyCgpgdmVyc2lvbi1vcmRlcmFibGVgCgpVcGRhdGVzIGFyZSBvZmZlcmVkIGJ5IGNvbXBhcmluZyB2ZXJzaW9ucy4gT25lIHRoYXQgY2Fubm90IGJlIG9yZGVyZWQgYWdhaW5zdCBpdHMgcHJlZGVjZXNzb3IgaXMgbmV2ZXIgcmVwb3J0ZWQgYXMgbmV3ZXIsIHNvIHRoZSBtb2Qgc2lsZW50bHkgc3RvcHMgdXBkYXRpbmcuCgojIyMgV3JpdGUgYSBkZXNjcmlwdGlvbgoKYGRlc2NyaWJlLWl0c2VsZmAKCkl0IGlzIHRoZSBvbmx5IHRoaW5nIGEgcGxheWVyIGhhcyB0byBkZWNpZGUgYnksIHNpbmNlIG5vdGhpbmcgZWxzZSBpbiB0aGUgZ2FtZSBrbm93cyB3aGF0IHRoZSBtb2QgZG9lcy4gQSByb3cgd2l0aCBubyBkZXNjcmlwdGlvbiBpcyBhIHJvdyBub2JvZHkgaW5zdGFsbHMuCgojIyMgU3RhdGUgYSBsaWNlbmNlCgpgc3RhdGUtYS1saWNlbmNlYAoKQSBtb2Qgd2l0aCBubyBsaWNlbmNlIGNhbm5vdCBsZWdhbGx5IGJlIHJlZGlzdHJpYnV0ZWQgYnkgYW55b25lLCBpbmNsdWRpbmcgYSBwbGF5ZXIgc2hhcmluZyB0aGVpciBzZXR1cC4gQ29udmVydGluZyBzb21lYm9keSBlbHNlJ3MgYXJ0IGhhcyBpdHMgb3duIHRlcm1zIG9uIHRvcCBvZiB0aGF0Lgo="
  },
  {
    "id": "authoring",
    "path": "AUTHORING.md",
    "audience": "advanced",
    "title": "Authoring API",
    "note": "Draft records, validation, projects, resources, and sections.",
    "encoded": "IyBBdXRob3Jpbmcgc2hvcnRjdXRzOiBkcmFmdGluZyBhIHJlY29yZCB0aGF0IGFjdHVhbGx5IHdvcmtzCgpBZGRpbmcgYSByZWNvcmQgdG8gYSBwYWNrIGhhcyBuZXZlciBiZWVuIHRoZSBoYXJkIHBhcnQuIEl0IGlzIEpTT04sIGFuZApjb21wb3NpdGlvbiB0YWtlcyBpdC4gQWRkaW5nIGEgcmVjb3JkIHRoYXQgKip3b3JrcyoqIGlzIHRoZSBoYXJkIHBhcnQsIGFuZCBpdCBpcwpoYXJkIGluIGEgd2F5IG5vIGVycm9yIG1lc3NhZ2UgcmVhY2hlczoKCi0gYW4gb2JqZWN0IHdpdGggbm8gYGFsbG9jYCBpcyBsZWdhbCwgbG9hZHMgY2xlYW5seSwgYW5kIG5ldmVyIGFwcGVhcnMgaW4gdGhlCiAgZHVuZ2VvbjsKLSBhIG1vbnN0ZXIgd2hvc2UgYGJhc2VgIGlzIG1pc3NwZWxsZWQgaXMgbGVnYWwsIGxvYWRzIGNsZWFubHksIGFuZCBiaW5kcyB0bwogIG5vdGhpbmc7Ci0gYSBmb3J0eS1maXJzdCBwb3Rpb24gaXMgbGVnYWwsIGxvYWRzIGNsZWFubHksIGFuZCBjb25zdW1lcyB0aGUgbGFzdCB1bnVzZWQKICBmbGF2b3VyLCBzbyBzb21lIG90aGVyIHBvdGlvbiBxdWlldGx5IHN0b3BzIGJlaW5nIGRpc3Rpbmd1aXNoYWJsZS4KCk5vdGhpbmcgaW4gdGhlIHBpcGVsaW5lIGNhbiBzYXkgYW55IG9mIHRoYXQsIGJlY2F1c2Ugbm90aGluZyBpbiB0aGUgcGlwZWxpbmUKa25vd3Mgd2hhdCBhIHdvcmtpbmcgcmVjb3JkIGxvb2tzIGxpa2UuIENvcmUncyBvd24gMywyNzkgcmVjb3JkcyBrbm93LCBhbmQgdGhlClNESyBhc2tzIHRoZW0uCgpFdmVyeXRoaW5nIG9uIHRoaXMgcGFnZSBpcyBpbiBgQHJwZ20tdG9vbHMvbmVvLWFuZ2JhbmQtbW9kLXNka2AgYW5kIG5lZWRzIG5vCmdhbWUgcnVubmluZy4KCiMjIFR3byB3YXlzIGluLCBhbmQgdGhlIGBpbXBvcnRgIGlzIG9ubHkgb25lIG9mIHRoZW0KCkFuIG9mZmxpbmUgdG9vbCBpbnN0YWxscyB0aGUgcGFja2FnZSBhbmQgaW1wb3J0cyBpdCwgd2hpY2ggaXMgd2hhdCBldmVyeSBleGFtcGxlCmJlbG93IGRvZXMuIFRoYXQgcGF0aCBuZWVkcyBjb3JlJ3MgcmVjb3JkcyBmcm9tIHNvbWV3aGVyZSwgYW5kIGBjb3JlUmVjb3Jkc2AgaW4KdGhvc2UgZXhhbXBsZXMgaXMgdGhhdDogdGhlIHBhY2sncyBKU09OLCBrZXllZCBieSBmaWxlIHN0ZW0uCgoqKkEgcGx1Z2luIGluc2lkZSBhIHJ1bm5pbmcgZ2FtZSB0YWtlcyBuZWl0aGVyIHN0ZXAuKiogQSBwbHVnaW4gcmVzb2x2ZXMgbm8gYmFyZQpzcGVjaWZpZXIsIHNvIHRoZSBpbXBvcnQgd291bGQgbm90IHdvcms7IGFuZCBpdCBkb2VzIG5vdCBuZWVkIGEgY29weSBvZiBjb3JlJ3MKcmVjb3JkcywgYmVjYXVzZSB0aGUgZ2FtZSBpdCBpcyBydW5uaW5nIGluIGFscmVhZHkgY29tcG9zZWQgdGhlbS4gQm90aCBhcnJpdmUgb24KYGN0eGA6CgpgYGBqcwpyZWdpc3Rlcihob3N0LCBjdHgpIHsKICBjb25zdCByZWNvcmRzID0gY3R4LmNvbXBvc2VkUmVjb3JkczsgICAgICAgICAgICAgIC8vIHRoZSBjb3JlUmVjb3JkcyBhcmd1bWVudAogIGlmICghcmVjb3JkcykgcmV0dXJuOwogIGNvbnN0IGRyYWZ0ZWQgPSBjdHguYXV0aG9yaW5nLmRyYWZ0UmVjb3JkKCAgICAgICAgLy8gdGhlIGltcG9ydGVkIGJhcnJlbAogICAgIm9iamVjdCIsCiAgICB7IG5hbWU6ICImIFNsdWRnZSBEYWdnZXJ+IiwgdHlwZTogInN3b3JkIiwgbGV2ZWw6IDIwIH0sCiAgICByZWNvcmRzLAogICk7Cn0KYGBgCgpgY3R4LmNvbXBvc2VkUmVjb3Jkc2AgaXMgYmV0dGVyIHRoYW4gYSBzaGlwcGVkIGNvcHkgb2YgdGhlIHBhY2sgd291bGQgYmU6IGl0IGlzCndoYXQgVEhJUyBnYW1lIGNvbXBvc2VkLCBzbyBldmVyeSBlbmFibGVkIG1vZCdzIHJlY29yZHMgYXJlIGluIGl0IHRvbywgZWFjaApjYXJyeWluZyBpdHMgcHJvdmVuYW5jZS4gQSB0b29sIGRyYWZ0aW5nIGFnYWluc3QgYSBidW5kbGVkIHNuYXBzaG90IGNvdWxkIG5vdCBzZWUKdGhlbSBhbmQgd291bGQgcmVwb3J0IGEgcmVmZXJlbmNlIHRvIGFub3RoZXIgbW9kJ3Mgc3dvcmQgYXMgZGFuZ2xpbmcuIFNlZQpbUExVR0lOUy5tZF0oUExVR0lOUy5tZCNhdXRob3JpbmctY3R4YXV0aG9yaW5nLWFuZC1jdHhjb21wb3NlZHJlY29yZHMpIGZvciB0aGUKZ3VhcmQgcnVsZXMgYW5kIHdoYXQgZWFjaCBmaWVsZCBpcyBhYnNlbnQgZm9yLgoKIyMgV3JpdGluZyBhbm90aGVyIG1vZCdzIGV4dGVuc2lvbiBmaWVsZAoKWW91ciBtb2QgbWF5IHdyaXRlIGA8b3duZXI+OjxmaWVsZD5gIG9ubHkgYWZ0ZXIgZGVjbGFyaW5nIGA8b3duZXI+YCBpbgpgZGVwZW5kZW5jaWVzYCBvciBgb3B0aW9uYWxEZXBlbmRlbmNpZXNgLiBXaXRob3V0IHRoYXQgZGVjbGFyYXRpb24gdGhlIHdyaXRlCmlzIHJlZnVzZWQsIHRoZSBmaWVsZCBpcyByb2xsZWQgYmFjaywgYW5kIHRoZSBmYXVsdCBuYW1lcyB5b3VyIG1vZDsgbGF0ZXIgZWRpdHMKdG8gdGhhdCBmaWVsZCBtYWRlIGZyb20gdGhlIHJlZnVzZWQgdmFsdWUgYXJlIHJvbGxlZCBiYWNrIHRvby4gRGVjbGFyZSB5b3VyIG93bgpmaWVsZHMgdW5kZXIgeW91ciBvd24gaWQgYXMgdXN1YWwuCgotLS0KCiMjIFRoZSBvbmUtY2FsbCB2ZXJzaW9uCgpgYGB0cwppbXBvcnQgeyBkcmFmdFJlY29yZCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiOwoKY29uc3QgeyByZWNvcmQsIHN1Z2dlc3Rpb25zLCBmaW5kaW5ncywgbW9kZWxsZWRPbiB9ID0gZHJhZnRSZWNvcmQoCiAgIm9iamVjdCIsCiAgeyBuYW1lOiAiJiBTbHVkZ2UgRGFnZ2VyfiIsIHR5cGU6ICJzd29yZCIsIGxldmVsOiAyMCB9LAogIGNvcmVSZWNvcmRzLCAgICAgICAgICAvLyB7IG9iamVjdDogWy4uLl0sIG9iamVjdF9iYXNlOiBbLi4uXSwgLi4uIH0KKTsKYGBgCgpgcmVjb3JkYCBjb21lcyBiYWNrIGNvbXBsZXRlOgoKYGBganNvbgp7CiAgInR5cGUiOiAic3dvcmQiLAogICJncmFwaGljcyI6IHsgImdseXBoIjogInwiLCAiY29sb3IiOiAiVyIgfSwKICAibGV2ZWwiOiAyMCwKICAid2VpZ2h0IjogMTQwLAogICJjb3N0IjogMzAwLAogICJhbGxvYyI6IHsgImNvbW1vbiI6IDIwLCAibWlubWF4IjogIjIwIHRvIDEwMCIgfSwKICAiYXR0YWNrIjogeyAiaGQiOiAiM2Q1IiwgInRvLWgiOiAiMCIsICJ0by1kIjogIjAiIH0sCiAgIm5hbWUiOiAiJiBTbHVkZ2UgRGFnZ2VyfiIsCiAgInBvd2VyIjogOAp9CmBgYAoKYG1vZGVsbGVkT25gIHNheXMgYCImIEthdGFuYX4iYCwgYW5kIGV2ZXJ5IG51bWJlciB0aGF0IHdhcyBjaG9zZW4gY2FycmllcyBpdHMKZXZpZGVuY2U6CgpgYGAKY29zdCAgID0gMzAwICA8LSB0aGUgbWVkaWFuIG9mIHRoZSA3IGNvcmUgb2JqZWN0IHJlY29yZHMgY2xvc2VzdCB0byBsZXZlbCAyMCB3aXRoIHR5cGUgInN3b3JkIgp3ZWlnaHQgPSAxNDAgIDwtIHRoZSBtZWRpYW4gb2YgdGhlIDcgY29yZSBvYmplY3QgcmVjb3JkcyBjbG9zZXN0IHRvIGxldmVsIDIwIHdpdGggdHlwZSAic3dvcmQiCmBgYAoKYGZpbmRpbmdzYCBob2xkcyB3aGF0IGlzIHN0aWxsIHdyb25nIHdpdGggaXQ6IGhlcmUsIG9uZSBoaW50IHRoYXQgaXQgaGFzIG5vCmBkZXNjYC4KCiMjIyBXaHkgIm1vZGVsbGVkIG9uIiwgbm90ICJhc3NlbWJsZWQgZnJvbSBkZWZhdWx0cyIKClRoZSBmaXJzdCB2ZXJzaW9uIG9mIHRoaXMgYnVpbHQgdGhlIHNoYXBlIGZyb20gaG93IG9mdGVuIGVhY2ggZmllbGQgYXBwZWFycwphY3Jvc3MgdGhlIHdob2xlIGZpbGUsIGFuZCBwcm9kdWNlZCBhIHN3b3JkIGNhcnJ5aW5nIGFuIGBhcm1vcmAgYmxvY2ssIGJlY2F1c2UKNTklIG9mIGNvcmUncyBvYmplY3RzIGhhdmUgb25lLiAqKkZpZWxkIGZyZXF1ZW5jeSBhY3Jvc3MgYSBmaWxlIGlzIG5vdCBhIGZhY3QKYWJvdXQgYW55IHJlY29yZCBpbiBpdC4qKiBTbyB0aGUgc2hhcGUgaXMgdGFrZW4gZnJvbSBjb3JlJ3MgbmVhcmVzdCBjb21wYXJhYmxlCnJlY29yZCBhbmQgb25seSB0aGUgbnVtYmVycyBhcmUgYXZlcmFnZWQuCgpBIG1vZGVsIG5ldmVyIGxlbmRzIHRoZSBmaWVsZHMgdGhhdCB3b3VsZCBjb25mZXIgYmVoYXZpb3VyIG9yIGlkZW50aXR5OgpgZmxhZ3NgLCBgdmFsdWVzYCwgYHNsYXlgLCBgYnJhbmRgLCBgY3Vyc2VgLCBgZWZmZWN0YCwgYGFjdGAsIGBibG93YCwgYHNwZWxsc2AsCmBuYW1lYCwgYGRlc2NgLCBgbXNnYC4gQSB0ZW1wbGF0ZSB0aGF0IHF1aWV0bHkgZ3JhbnRzIHBvd2VycyBoYW5kcyB5b3UgYW4gaXRlbQp0aGF0IGRvZXMgdGhpbmdzIHlvdSBuZXZlciBhc2tlZCBmb3IgYW5kIHdvdWxkIG5vdCB0aGluayB0byBsb29rIGZvci4KCi0tLQoKIyMgVGhlIHBpZWNlcywgc2VwYXJhdGVseQoKRXZlcnkgc3RlcCBvZiBgZHJhZnRSZWNvcmRgIGlzIGNhbGxhYmxlIG9uIGl0cyBvd24uCgp8IENhbGwgfCBBbnN3ZXJzIHwKfC0tLXwtLS18CnwgYGRlc2NyaWJlRmlsZShmaWxlKWAgfCB3aGF0IGRvZXMgYSByZWNvcmQgb2YgdGhpcyBraW5kIGNvbnRhaW4/IHwKfCBgcmVxdWlyZWRGaWVsZHMoZmlsZSlgIHwgd2hhdCBkbyAqKmFsbCoqIG9mIGNvcmUncyByZWNvcmRzIGhlcmUgY2Fycnk/IHwKfCBgZmllbGRVc2FnZShmaWxlKWAgfCBldmVyeSBmaWVsZCwgbW9zdC11c2VkIGZpcnN0LCB3aXRoIGl0cyBzaGFyZSB8CnwgYHRlbXBsYXRlUmVjb3JkKGZpbGUsIHNjb3BlKWAgfCBhIHN0YXJ0aW5nIHJlY29yZDogYCJyZXF1aXJlZCJgLCBgImNvbW1vbiJgIChkZWZhdWx0KSBvciBgImFsbCJgIHwKfCBgcGVlcnNGb3IoZmlsZSwgZHJhZnQsIHJlY29yZHMpYCB8IHdoaWNoIG9mIGNvcmUncyByZWNvcmRzIGFyZSBjb21wYXJhYmxlIHRvIHRoaXMgb25lIHwKfCBgc3VnZ2VzdEZpZWxkcyhmaWxlLCBkcmFmdCwgcmVjb3JkcylgIHwgd2hhdCBjb3JlJ3MgY29tcGFyYWJsZSByZWNvcmRzIHdvdWxkIHB1dCBpbiB0aGUgZ2FwcyB8CnwgYGNoZWNrUmVjb3JkcyhzdWJqZWN0LCBhbGwpYCB8IGV2ZXJ5IHdheSB0aGVzZSByZWNvcmRzIHdpbGwgc2lsZW50bHkgbm90IHdvcmsgfAp8IGBSRUNPUkRfQkxVRVBSSU5UU2AgfCB0aGUgcmF3IG1lYXN1cmVtZW50OiBwZXIgZmlsZSwgcGVyIGZpZWxkLCBjb3VudCAvIHR5cGVzIC8gcmFuZ2UgLyBvYnNlcnZlZCB2YWx1ZXMgfAoKIyMjICJXaGF0IHNob3VsZCBpdCBjb3N0PyIKCkEgcHJpY2UgaXMgbm90IGRlcml2YWJsZSBmcm9tIGZpcnN0IHByaW5jaXBsZXMgKEFuZ2JhbmQncyBjb3N0cyBhcmUgaGFuZC1zZXQpCmJ1dCBpdCAqKmlzKiogZGVyaXZhYmxlIGZyb20gcHJlY2VkZW50LCBhbmQgcHJlY2VkZW50IGlzIHdoYXQgY29yZSdzIDM3NSBvYmplY3RzCmFyZS4gYHN1Z2dlc3RGaWVsZHNgIG5hcnJvd3MgdHdpY2U6IHRvIHRoZSBzYW1lIGl0ZW0gdHlwZSwgdGhlbiB0byB0aGUgc2V2ZW4KcmVjb3JkcyBuZWFyZXN0IGluIGxldmVsLiBPbmx5IG51bWVyaWMgZmllbGRzIGFyZSBzdWdnZXN0ZWQ7IGEgbmFtZSwgYQpkZXNjcmlwdGlvbiBvciBhIHNldCBvZiBmbGFncyBpcyBhIGRlc2lnbiBkZWNpc2lvbi4KCldpdGggbm8gY29tcGFyYWJsZSByZWNvcmQgaXQgZmFsbHMgYmFjayB0byB0aGUgZmlsZS13aWRlIG1lZGlhbiBhbmQgc2F5cyBzbyBpbgp0aGUgZXZpZGVuY2UgbGluZSwgc28gYSB3ZWFrIHN1Z2dlc3Rpb24gaXMgbmV2ZXIgZHJlc3NlZCB1cCBhcyBhIHN0cm9uZyBvbmUuCgotLS0KCiMjIFdoYXQgYGNoZWNrUmVjb3Jkc2AgZmluZHMKClR3byBhcmd1bWVudHMsIGFuZCB0aGUgc3BsaXQgaXMgdGhlIHdob2xlIGRlc2lnbjoKCmBgYHRzCmNoZWNrUmVjb3JkcyhzdWJqZWN0LCBhbGwpCmBgYAoKYHN1YmplY3RgIGlzIHdoYXQgaXMgKipyZXBvcnRlZCBvbioqOiB5b3VyIHJlY29yZHMuIGBhbGxgIGlzIHdoYXQgdGhleSBtYXkKKipyZXNvbHZlIGFnYWluc3QqKjogY29yZSBwbHVzIGV2ZXJ5IGxvYWRlZCBwYWNrLiBDaGVja2luZyBhIG1vZCBhZ2FpbnN0IGl0c2VsZgp3b3VsZCByZXBvcnQgZXZlcnkgcmVmZXJlbmNlIHRvIGNvcmUgYXMgYnJva2VuLgoKRmluZGluZ3MgYXJlIGdyYWRlZCwgYW5kICoqbm90aGluZyBoZXJlIHJlZnVzZXMgYW55dGhpbmcqKi4gVGhlIHJlZnVzYWxzIGxpdmUgaW4KdGhlIG1hbmlmZXN0IHZhbGlkYXRvciBhbmQgdGhlIGRlY2xhcmVkLWZpZWxkIHJ1bGUsIHdoZXJlIHRoZSBydWxlcyBhcmUgdGhlCmVuZ2luZSdzIG93bi4KCiMjIyBJdCBhbHNvIHJ1bnMgd2hlbiB0aGUgR0FNRSBsb2FkcyB5b3VyIG1vZAoKU2luY2UgMjAyNi0wOC0wOSB0aGlzIGlzIG5vdCBvbmx5IGEgYnVpbGQtdGltZSB0b29sLiBgY29tcG9zZUNvbnRlbnRQYWNrc2AsIHRoZQpmdW5jdGlvbiBldmVyeSBob3N0IGNvbXBvc2VzIHRocm91Z2gsIHJ1bnMgdGhlIHNhbWUgY2hlY2sgb3ZlciBldmVyeSBwYWNrIGl0CmxvYWRzIGFuZCBwdXRzIHdoYXQgaXQgZmluZHMgb24gdGhhdCBtb2QncyBvd24gcm93IGluIHRoZSBtb2QgbWFuYWdlciwgc28gYQpwbGF5ZXIgd2hvIGluc3RhbGxzIHlvdXIgbW9kIGZyb20gYSB6aXAgc2VlcyB0aGUgc2FtZSBzZW50ZW5jZXMgeW91IGRvLiBUaHJlZQpkaWZmZXJlbmNlcyBmcm9tIGBidWlsZCgpYCwgYWxsIGRlbGliZXJhdGU6CgotICoqYHdhcm5gIGFuZCBhYm92ZSBvbmx5LioqIEEgYGhpbnRgIGlzIGRyYWZ0aW5nIGFkdmljZSBhbmQgYmVsb25ncyB3aGVyZSB5b3UKICBhcmUgbG9va2luZyBhdCB0aGUgZHJhZnQuIE9uIGEgcGxheWVyJ3Mgc2NyZWVuIGRvemVucyBvZiB0aGVtIHdvdWxkIGJ1cnkgdGhlCiAgb25lIGxpbmUgdGhhdCBtYXR0ZXJzLgotICoqVGhlIGJhc2UgZ2FtZSBpcyBub3QgcmVwb3J0ZWQgb24uKiogQ29yZSdzIG93biBkYXRhIHJhaXNlcyB3YXJuaW5ncyBhZ2FpbnN0CiAgY29yZSdzIG93biBibHVlcHJpbnQ7IHRob3NlIGFyZSB1cHN0cmVhbSB3YXJ0cyB0aGUgcG9ydCBrZWVwcyBvbiBwdXJwb3NlLgotICoqQSBwYXRjaCBpcyBjaGVja2VkIGFzIHRoZSByZWNvcmQgaXQgcHJvZHVjZWQqKiwgbm90IGFzIHlvdSB3cm90ZSBpdCwgc28KICBgeyJzcGVlZCI6IDEyMH1gIGlzIG5vdCBhIHJlY29yZCBtaXNzaW5nIHR3ZW50eSBmaWVsZHMuCgpUaGUgcHJhY3RpY2FsIGNvbnNlcXVlbmNlOiAqKnlvdXIgYGJ1aWxkKClgIG91dHB1dCBpcyB3aGF0IHlvdXIgdXNlcnMgd2lsbCBzZWUuKioKSWYgaXQgaXMgY2xlYW4gYXQgYHdhcm5gLCB0aGVpciBtb2QgbWFuYWdlciBpcyBxdWlldC4gVGhlcmUgaXMgbm90aGluZyBleHRyYSB0bwpydW4gYW5kIG5vdGhpbmcgdG8gb3B0IGludG8uCgp8IExldmVsIHwgTWVhbmluZyB8IEV4YW1wbGVzIHwKfC0tLXwtLS18LS0tfAp8IGBlcnJvcmAgfCB0aGUgcmVjb3JkIGNhbm5vdCB3b3JrIHwgYSByZXF1aXJlZCBmaWVsZCBpcyBhYnNlbnQ7IGFuIGFydGlmYWN0IHdpdGggbm8gYGJhc2Utb2JqZWN0YCB8CnwgYHdhcm5gIHwgaXQgbG9hZHMgYW5kIHdpbGwgbm90IGRvIHdoYXQgaXQgbG9va3MgbGlrZSBpdCBkb2VzIHwgYSBkYW5nbGluZyByZWZlcmVuY2U7IG5vIGBhbGxvY2A7IGEgZmllbGQgd3JpdHRlbiBhcyB0aGUgd3JvbmcgdHlwZSB8CnwgYGhpbnRgIHwgd29ydGggYSBsb29rIHwgYW4gdW5mYW1pbGlhciBmaWVsZCBuYW1lICh3aXRoIGEgImRpZCB5b3UgbWVhbiIpOyBubyBgZGVzY2A7IG5vdGhpbmcgdG8gYXR0YWNrIHdpdGggfAoKIyMjIERhbmdsaW5nIHJlZmVyZW5jZXMKCmBSRUZFUkVOQ0VfRURHRVNgIGRlY2xhcmVzIDM3IGZpZWxkcyB0aGF0IG5hbWUgYW5vdGhlciByZWNvcmQ6IGBvYmplY3QudHlwZWAKaW50byBgb2JqZWN0X2Jhc2VgLCBgbW9uc3Rlci5iYXNlYCBpbnRvIGBtb25zdGVyX2Jhc2VgLCBgZWdvX2l0ZW0uc2xheWAgaW50bwpgc2xheWAsIGBhcnRpZmFjdC5hY3RgIGludG8gYGFjdGl2YXRpb25gLCBhbmQgc28gb24uIEV2ZXJ5IGVkZ2UgaXMgbWVhc3VyZWQKYWdhaW5zdCBjb3JlJ3Mgb3duIGRhdGEgYnkgYHJlZmVyZW5jZXMudGVzdC50c2AsIHNvIGFuIGVkZ2UgdGhhdCBpcyB3cm9uZyBpcyBhCnRlc3QgZmFpbHVyZSByYXRoZXIgdGhhbiBhIGZhbHNlIGFsYXJtIGluIHlvdXIgbW9kLgoKUmVmZXJlbmNlcyByZXNvbHZlIGFnYWluc3QgKipjb3JlIHBsdXMgeW91ciBvd24gbmV3IHJlY29yZHMqKiwgc28gYSBtb2QgdGhhdAphZGRzIGFuIGBvYmplY3RfYmFzZWAgYW5kIHRoZW4gYW4gb2JqZWN0IG9mIHRoYXQgbmV3IHR2YWwgaXMgbm90IHRvbGQgaXRzIG93bgp0dmFsIGlzIG1pc3NpbmcuCgpBbiB1bnJlc29sdmVkIHJlZmVyZW5jZSBpcyBhICoqd2FybmluZywgbmV2ZXIgYSByZWZ1c2FsKiosIGFuZCB0aGUgcmVhc29uIGlzCnJlY29yZGVkOiBjb3JlJ3Mgb3duIGRhdGEgY29udGFpbnMgcmVmZXJlbmNlcyB0aGF0IGRvIG5vdCByZXNvbHZlLgpgYXJ0aWZhY3QudHh0YCBzYXlzIGBiYXNlLW9iamVjdDpzb2Z0IGFybW91cjouLi5gIHdoaWxlIGBvYmplY3RfYmFzZS50eHRgIGFuZApgbGlzdC10dmFscy5oYCBib3RoIHNwZWxsIGl0IGBzb2Z0IGFybW9yYDsgZm91cnRlZW4gYXJ0aWZhY3QgYmFzZSBvYmplY3RzCihQaGlhbCwgQXJrZW5zdG9uZSwgc2V2ZXJhbCByaW5ncykgbmFtZSBzdmFscyBgb2JqZWN0LnR4dGAgbmV2ZXIgZGVmaW5lcy4gVGhvc2UKYXJlIEFuZ2JhbmQgNC4yLjYncywgcmVwcm9kdWNlZCBleGFjdGx5IHVuZGVyIHRoZSBwYXJpdHkgbWFuZGF0ZS4gQSBydWxlIHN0cmljdAplbm91Z2ggdG8gcmVqZWN0IHRoZW0gd291bGQgcmVqZWN0IEFuZ2JhbmQuCgojIyMgQ29tcGFuaW9uIHN0ZXBzCgpgQ09NUEFOSU9OX1JVTEVTYCBpcyB0aGUgbGlzdCBvZiB0aGluZ3MgdGhlIHJlY29yZCBpcyBmaW5lIHdpdGhvdXQgYW5kICoqeW91KioKYXJlIG5vdC4gVGhleSBhcmUgYWxsIHdhcm5pbmdzIG9yIGhpbnRzLCBiZWNhdXNlIGV2ZXJ5IG9uZSBvZiB0aGVtIGlzIGxlZ2FsOgphbiBvYmplY3Qgd2l0aCBubyBgYWxsb2NgIGlzIGV4YWN0bHkgaG93IGNvcmUgZGVmaW5lcyBhbiBpdGVtIHRoYXQgb25seSBjb21lcwpmcm9tIGEgc3RvcmUuCgpUaGUgb25lIHRoYXQgaXMgbm90IGEgcGVyLXJlY29yZCBydWxlOiAqKmZsYXZvdXIgcHJlc3N1cmUuKiogQW5nYmFuZCBoYW5kcyBlYWNoCm9iamVjdCBvZiBhIGZsYXZvdXJlZCB0eXBlIGl0cyBvd24gZmxhdm91ciAoYHBvdGlvbmAsIGBzY3JvbGxgLCBgcmluZ2AsCmBhbXVsZXRgLCBgc3RhZmZgLCBgd2FuZGAsIGByb2RgLCBgbXVzaHJvb21gKTsgcGFzdCB0aGF0IHBvaW50IHVuaWRlbnRpZmllZAppdGVtcyBzdGFydCBzaGFyaW5nLiBDb3JlIHNoaXBzIDU5IHBvdGlvbiBmbGF2b3VycyBmb3IgNDEgcG90aW9ucywgc28gdGhlcmUgaXMKcm9vbSBmb3IgZWlnaHRlZW4gbW9yZSBiZWZvcmUgaXQgYml0ZXMuIENvdW50ZWQgZnJvbSB0aGUgY29tcG9zZWQgZGF0YSwgc28gYSBtb2QKdGhhdCBhZGRzIGZsYXZvdXJzIGFzIHdlbGwgYXMgb2JqZWN0cyBnZXRzIHRoZSBjcmVkaXQgZm9yIHRoZW0uCgotLS0KCiMjIEFzc2VtYmxpbmcgYSB3aG9sZSBtb2QKCmBNb2RQcm9qZWN0YCBpcyB0aGUgc2FtZSBzaG9ydGN1dHMgd3JhcHBlZCBhcm91bmQgYSBtYW5pZmVzdCwgYW5kIGl0IGNvbXBvc2VzCnRocm91Z2ggdGhlIHJlYWwgcGlwZWxpbmUgYmVmb3JlIGl0IHNheXMgYW55dGhpbmcuCgpgYGB0cwppbXBvcnQgeyBtb2RQcm9qZWN0LCBkcmFmdFJlY29yZCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiOwoKY29uc3QgYnVpbGQgPSBtb2RQcm9qZWN0KHsKICBpZDogInNsdWRnZSIsCiAgbmFtZTogIlNsdWRnZSIsCiAgdmVyc2lvbjogIjEuMC4wIiwKICBzaGFwZTogImNvbnRlbnQiLAogIGF1dGhvcjogInlvdSIsCiAgcmVwb3NpdG9yeTogImh0dHBzOi8vZ2l0aHViLmNvbS95b3Uvc2x1ZGdlIiwKICBlbmdpbmU6ICI+PTAuMTkuMCIsCiAgZGVwZW5kZW5jaWVzOiB7IGNvcmU6ICIqIiB9LAp9KQogIC5kZWNsYXJlRmllbGQoeyBuYW1lOiAic2x1ZGdlIiwgZmlsZXM6IFsib2JqZWN0Il0sIHR5cGU6ICJvYmplY3QiIH0pCiAgLmFkZCgibW9uc3RlciIsIGRyYWZ0UmVjb3JkKCJtb25zdGVyIiwgeyBuYW1lOiAic2x1ZGdlIGZpZW5kIiwgYmFzZTogImlja3kgdGhpbmciLCBkZXB0aDogMjUgfSwgY29yZSkucmVjb3JkKQogIC5wYXRjaEZpZWxkcygib2JqZWN0IiwgImNvcmU6c3dvcmQtLWRhZ2dlciIsIFsKICAgIHsgb3A6ICJzZXQiLCBwYXRoOiAic2x1ZGdlOnNsdWRnZSIsIHZhbHVlOiB7IHR1cm5zOiA1IH0gfSwKICBdKQogIC5idWlsZChjb3JlUGFjayk7CgpidWlsZC5maWxlczsgICAgIC8vIFt7IHBhdGg6ICJtYW5pZmVzdC5qc29uIiwgY29udGVudHMgfSwgeyBwYXRoOiAibW9uc3Rlci5qc29uIiwgY29udGVudHMgfSwgLi4uXQpidWlsZC5maW5kaW5nczsgIC8vIHdvcnN0IGZpcnN0CmJ1aWxkLnByb2JsZW1zOyAgLy8gY29tcG9zaXRpb24ncyBvd24gcmVmdXNhbHMKYnVpbGQub2s7ICAgICAgICAvLyBmYWxzZSBpZiBhbnl0aGluZyBpcyBhdCBgZXJyb3JgCmBgYAoKVGhyZWUgdGhpbmdzIGl0IGRlbGliZXJhdGVseSBkb2VzOgoKLSAqKk5vIGZpbGVzeXN0ZW0uKiogYGVtaXQoKWAgaGFuZHMgYmFjayBwYXRocyBhbmQgYnl0ZXM7IHdyaXRpbmcgdGhlbSBpcyB5b3Vycy4KICBUaGUgc2FtZSBidWlsZGVyIHdvcmtzIGZyb20gYSBDTEksIGZyb20gYSB0ZXN0LCBhbmQgZnJvbSBhbiBpbi1nYW1lIGVkaXRvci4KLSAqKkNoZWNrcyB0aGUgY29tcG9zZWQgcmVzdWx0KiosIG5vdCB0aGUgZHJhZnQuIEEgcGF0Y2ggdGhhdCBicmVha3MgYSByZWZlcmVuY2UKICBpcyBpbnZpc2libGUgaW4geW91ciBvd24gZmlsZXMsIGJlY2F1c2UgeW91ciBmaWxlcyBkbyBub3QgY29udGFpbiB0aGUgcmVjb3JkCiAgaXQgYnJva2UuCi0gKipSZXBvcnRzIGluc3RlYWQgb2YgdGhyb3dpbmcuKiogQSBtaXNzaW5nIGRlcGVuZGVuY3kgaXMgYW4gYGVycm9yYCBmaW5kaW5nLAogIG5vdCBhIHN0YWNrIHRyYWNlLgoKYGJ1aWxkLm9rYCBpZ25vcmVzIHdhcm5pbmdzIG9uIHB1cnBvc2U6IGV2ZXJ5IHdhcm5pbmcgaXQgY2FuIHByb2R1Y2UgaXMKc29tZXRoaW5nIGNvcmUncyBvd24gZGF0YSBkb2VzIHNvbWV3aGVyZSwgc28gYSBidWlsZGVyIHRoYXQgcmVmdXNlZCBvbiB0aGVtCndvdWxkIHJlZnVzZSB0byBidWlsZCBBbmdiYW5kLgoKLS0tCgojIyBXaGF0IGEgbW9kIGNhbiBhZGQgYSByZWNvcmQgdG86IDQxIG9mIDQ0IGZpbGVzCgoqKk1lYXN1cmVkIG92ZXIgdGhlIHNoaXBwZWQgcGFjayoqLCBhbmQgaXQgdXNlZCB0byBiZSAyNC4gQ29tcG9zaXRpb24gbWVyZ2VzIGEKZmlsZSBwZXIgcmVjb3JkIHdoZW4gZXZlcnkgcmVjb3JkIGhhcyBhIHJlZiBubyBzaWJsaW5nIGNsYWltcywgYW5kIGl0IGFza3MKYHBhY2thZ2VzL21vZC1zZGsvc3JjL3JlY29yZC1rZXkudHNgIHdoYXQgYSByZWYgaXMsIHdoaWNoIGlzIGBuYW1lYCBmb3IgbW9zdApmaWxlcyBhbmQgc29tZXRoaW5nIGVsc2Ugd2hlcmUgdXBzdHJlYW0ncyBpZGVudGl0eSBpcyBzb21ldGhpbmcgZWxzZS4KClVudGlsIDIwMjYtMDgtMDggdGhlIHRlc3Qgd2FzICJhIHVuaXF1ZSBgbmFtZWAiLCBhbmQgdGhyZWUgZmlsZXMgZmFpbGVkIGl0IG9uCmNvcmUncyBvd24gZGF0YSwgYmVjYXVzZSBBbmdiYW5kJ3MgY29udmVudGlvbiBmb3IgYSBncmVhdGVyIGZvcm0gaXMgdG8gcmV1c2UgdGhlCm5hbWUgd2l0aCBtYXJrczogYEFjcXVpcmVtZW50YCBhbmQgYCpBY3F1aXJlbWVudCpgLCBgTGl0dGxlIGVydXB0aW9uYCBhbmQKYExpdHRsZSBlcnVwdGlvbitgLCBhbmQgYGVnb19pdGVtYCBzaGlwcyAyMyBuYW1lcyB0d2ljZSBvdmVyLiBTbyBhIG1vZCBhZGRpbmcKb25lIG9iamVjdCByZXBsYWNlZCBhbGwgMzc1IG9mIGNvcmUncywgb25lIGVnbyByZXBsYWNlZCBhbGwgMTA3LCBvbmUgdmF1bHQgYWxsCjE2Mi4gVGhvc2Ugd2VyZSB0aGUgdGhyZWUgZmlsZXMgbW9zdCB3b3J0aCBhZGRpbmcgdG8uIFRoZXkgbm93IG1lcmdlIHBlciByZWNvcmQ6Cgp8IEZpbGUgfCBSZWNvcmRzIHwgQSBtb2QgYWRkaW5nIG9uZSByZWNvcmQuLi4gfAp8LS0tfC0tLXwtLS18CnwgYG9iamVjdGAgfCAzNzUgfCBhZGRzIG9uZSwgMzc2IHwKfCBgZWdvX2l0ZW1gIHwgMTA3IHwgYWRkcyBvbmUsIDEwOCB8CnwgYHZhdWx0YCB8IDE2MiB8IGFkZHMgb25lLCAxNjMgfAp8IGBzdG9yZWAsIGBmbGF2b3JgLCBgYnJhbmRgLCBgc2xheWAsIGBvYmplY3RfYmFzZWAsIGB0cmFwYCwgYG5hbWVzYCwgLi4uIHwgLSB8IGFkZHMgb25lLCBrZXllZCBieSB3aGF0ZXZlciB1cHN0cmVhbSBrZXlzIGl0IGJ5IHwKCioqVGhlIHRocmVlIHRoYXQgc3RpbGwgdGFrZSBhIHdob2xlIGZpbGUsIGFuZCB3aHkuKiogYGNvbnN0YW50c2AgYW5kIGB2aXN1YWxzYAphcmUgY29uZmlnIHNpbmdsZXRvbnM6IHRoZWlyIGlkZW50aXR5ICppcyogdGhlIGZpbGUsIHRoZSBob3N0IGJpbmRzIGV4YWN0bHkgb25lLAphbmQgIkkgc2hpcHBlZCBgY29uc3RhbnRzLmpzb25gIiBtZWFucyAidXNlIG1pbmUiLiBgaGlzdG9yeWAgaGFzIG5vIHBlci1yZWNvcmQKaWRlbnRpdHkgYXQgYWxsOiBhIGhpc3RvcnkgcmVjb3JkIGlzIGB7Y2hhcnQ6e2NoYXJ0LG5leHQscm9sbH0sIHBocmFzZX1gIGFuZApldmVyeSBwYXJ0IG9mIHRoYXQgaXMgYSB2YWx1ZSBhIG1vZCB3b3VsZCBsZWdpdGltYXRlbHkgY2hhbmdlLiBGb3IgdGhvc2UgdGhyZWUsCmBNb2RQcm9qZWN0LmJ1aWxkYCBzdGlsbCByYWlzZXMgYGZpbGUvd2hvbGUtZmlsZS1yZXBsYWNlbWVudGAgYXMgYW4gYGVycm9yYCwKYmVjYXVzZSByZXBsYWNpbmcgdGhlIGJhc2UgZ2FtZSdzIGNvcHkgb2YgYSBmaWxlIGlzIG5vdCBzb21ldGhpbmcgdG8gZGlzY292ZXIKZnJvbSBhIGxpbmUgaW4gYSBsaXN0LgoKIyMjIFdoYXQgYSByZWNvcmQgaXMgY2FsbGVkCgpSZWZzIGRpZCBub3QgbW92ZS4gVGhlIHBlci1yZWNvcmQgaWRlbnRpdHkgd2FzIGFscmVhZHkgd2hhdApgcGF0Y2hGaWVsZHNgIC8gYHJlcGxhY2VgIC8gYHJlbW92ZWAgdXNlZCwgc28gZXZlcnkgcmVmIHRoYXQgcmVzb2x2ZWQgYmVmb3JlCnN0aWxsIHJlc29sdmVzOgoKLSBgb2JqZWN0YCBpcyBgdHlwZSArIG5hbWVgLCBzbyB0aGUgRGFnZ2VyIGlzIGBjb3JlOnN3b3JkLS1kYWdnZXJgOwotIGBlZ29faXRlbWAgaXMgYG5hbWVgLCBwbHVzIGEgYCNgIGRpc2NyaW1pbmF0b3Igd2hlcmUgY29yZSBzaGlwcyBhIG5hbWUgdHdpY2UsCiAgYXMgaW4gYGNvcmU6b2YtYWNpZCNzaG90LWFycm93YDsKLSBgc3RvcmVgIGlzIGl0cyBgU1RPUkVfKmAgY29kZSwgYGJyYW5kYCBhbmQgYHNsYXlgIHRoZWlyIGBjb2RlYCwgYGZsYXZvcmAgaXRzCiAgYmFzZSB0dmFsLCBhbmQgc28gb24uCgpBIHJlY29yZCBhbnN3ZXJzIHRvICoqc2V2ZXJhbCoqIHJlZnM6IGl0cyBiYXNlIGtleSwgaXRzIGRpc2NyaW1pbmF0ZWQgZm9ybSwgYW5kCnRoZSBwcmUtMjAyNi0wOC0wOCBsb3NzeSBzbHVnIGFzIGFuIGFsaWFzLCBzbyBub3RoaW5nIGFuIGF1dGhvciB3cm90ZSBhZ2FpbnN0IGFuCm9sZGVyIGVuZ2luZSBzdG9wcyB3b3JraW5nLiBBbiBhbGlhcyBpcyBkcm9wcGVkIHdoZXJlIGl0IHdvdWxkIHNoYWRvdyBhCipkaWZmZXJlbnQqIHJlY29yZCdzIHJlYWwgbmFtZTogYCpIZWFsaW5nKmAncyBvbGQgcmVmIGlzIHBsYWluIGBIZWFsaW5nYCdzCmN1cnJlbnQgb25lLCBhbmQgYSByZWNvcmQncyBvd24gaGlzdG9yeSBtdXN0IG5vdCBjb3N0IGFub3RoZXIgcmVjb3JkIGl0cyBuYW1lLgoKVGhhdCBpcyAqKjggb2YgdGhlIHBhY2sncyAxOSBsZWdhY3kgYWxpYXNlcyoqLCBhbmQgaXQgZGVwZW5kcyBvbiBjb3JlJ3MgZGF0YQpyYXRoZXIgdGhhbiBvbiB0aGUgbWFyay4gYCpBY3F1aXJlbWVudCpgIGxvc2VzIGl0cyBhbGlhcywgYmVjYXVzZSBjb3JlIHNoaXBzIGEKcGxhaW4gYEFjcXVpcmVtZW50YCBzY3JvbGwuIGAqRGVzdHJ1Y3Rpb24qYCBrZWVwcyBib3RoIG9mIGl0cywgYXMgYSBzY3JvbGwgYW5kCmFzIGEgc3RhZmYsIGJlY2F1c2UgY29yZSBzaGlwcyBubyBwbGFpbiBgRGVzdHJ1Y3Rpb25gIGF0IGFsbCwgc28gdGhlcmUgaXMKbm90aGluZyBmb3IgaXQgdG8gc2hhZG93LiBgb2YgKlNsYXkgT3JjKmAgbG9zZXMgaXRzIGFuZCBgb2YgKlNsYXkgQW5pbWFsKmAga2VlcHMKaXRzLCBmb3IgdGhlIHNhbWUgcmVhc29uLiBUaGUgZnVsbCBjZW5zdXMgaXMgYXNzZXJ0ZWQgcm93IGJ5IHJvdyBpbgpgcmVjb3JkLWtleS50ZXN0LnRzYCwgc28gdGhlIGNvdW50IGNhbm5vdCBkcmlmdCBiYWNrIGludG8gcHJvc2UuCgpOb25lIG9mIHRoZSA4IGNvc3QgYW55Ym9keSBhIHdvcmtpbmcgcmVmOiBldmVyeSBmaWxlIGNhcnJ5aW5nIGEgbGVnYWN5IGFsaWFzIGlzCm9uZSB0aGF0IGhhZCAqbm8qIHBlci1yZWNvcmQgYWRkcmVzc2luZyBiZWZvcmUgdGhlIGtleSB0YWJsZSBleGlzdGVkLgoKIyMjIFdoZXJlIGEgbmV3IHJlY29yZCBsYW5kcywgYW5kIHdoeSBpdCBtYXR0ZXJzCgpBdCB0aGUgKiplbmQqKiwgYWZ0ZXIgY29yZSdzLiBUaGF0IGlzIG5vdCBjb3NtZXRpYy4gVXBzdHJlYW0ncyBgc3ZhbGAgaXMgbm90IGEKZmllbGQgaW4gdGhlIGRhdGE6IGl0IGlzIGEgY291bnRlciwgYnVtcGVkIHBlciBvYmplY3QgYmFzZSBpbiBmaWxlIG9yZGVyCihgcGFyc2Vfb2JqZWN0X3R5cGVgLCBgcmVmZXJlbmNlL3NyYy9vYmotaW5pdC5jYCksIGFuZCBga2lkeGAgaXMgdGhlIHBvc2l0aW9uIGluCnRoZSBmaWxlLiBBcHBlbmRlZCwgZXZlcnkgb25lIG9mIGNvcmUncyAzNzUgb2JqZWN0cyBrZWVwcyBpdHMgaW5kZXgsIG5hbWUsIHR2YWwKYW5kIHN2YWwsIGFuZCB0aGUgbmV3IG9uZSB0YWtlcyB0aGUgbmV4dCBmcmVlIHN2YWwgb2YgaXRzIG93biBiYXNlLiBQcmVwZW5kZWQsCmV2ZXJ5IHN3b3JkIGluIHRoZSBnYW1lIHdvdWxkIHNoaWZ0IGJ5IG9uZS4KCkNvbXBvc2l0aW9uIGFwcGVuZHMgYmVjYXVzZSBjb3JlIGlzIHBhY2sgemVybyBhbmQgYSBtb2QgdGhhdCBkZWNsYXJlcyBgY29yZWAgYXMKYSBkZXBlbmRlbmN5IGxvYWRzIGFmdGVyIGl0LiBgcGFja2FnZXMvd2ViL3NyYy9tb2QtYWRkZWQtcmVjb3JkLnRlc3QudHNgIGJpbmRzCmNvcmUncyBwYWNrIHdpdGggYW5kIHdpdGhvdXQgb25lIGFkZGVkIG9iamVjdCBhbmQgYXNzZXJ0cyB0aGUgd2hvbGUgdGFibGUsIG5vdCBhCnNhbXBsZS4gVGhlIG9uZSB0aGluZyB0aGF0IGRvZXMgbW92ZSBpcyB0aGUgdGFpbCBvZiBkdW1teSBraW5kcyBgYmluZENvcmVgCmNyZWF0ZXMgZm9yIHNwZWNpYWwgYXJ0aWZhY3RzIHdob3NlIGJhc2Ugc3ZhbCBgb2JqZWN0LnR4dGAgbmV2ZXIgZGVmaW5lcyAodGhlClBoaWFsLCB0aGUgU3RhciwgdGhlIHJpbmdzIG9mIHBvd2VyKTsgdGhlaXIgYXJyYXkgaW5kZXggc2hpZnRzIGJ5IG9uZSBhbmQKbm90aGluZyBkZXBlbmRzIG9uIGl0LCBiZWNhdXNlIGEgc2F2ZWZpbGUgc3RvcmVzIGEgbmFtZXNwYWNlZCBzdHJpbmcgYGtpbmRJZGAKcmF0aGVyIHRoYW4gYSBga2lkeGAuCgojIyMgWW91ciBhcnRpZmFjdCBhbmQgdGhlIGBiaXJ0aF9yYW5kYXJ0c2Agb3B0aW9uCgpBbiBhcnRpZmFjdCB5b3VyIG1vZCBhZGRzICoqc3Vydml2ZXMqKiBhIGNoYXJhY3RlciBib3JuIHdpdGggcmFuZG9tIGFydGlmYWN0cwp0dXJuZWQgb24uIEV2ZXJ5IG90aGVyIGFydGlmYWN0IGluIHRoZSBnYW1lIGlzIHJlZGVzaWduZWQgaW50byBhIGRpZmZlcmVudCBpdGVtOwp5b3VycyBrZWVwcyB0aGUgbmFtZSwgdGhlIGJhc2Ugb2JqZWN0IGFuZCB0aGUgbnVtYmVycyB5b3Ugd3JvdGUuCgpUaGF0IGlzIG1lYXN1cmVkLCBpbiBgcGFja2FnZXMvY29yZS9zcmMvb2JqL3JhbmRhcnQtbW9kLWFydGlmYWN0LnRlc3QudHNgLCBhbmQgaXQKaXMgd29ydGgga25vd2luZyBXSFksIGJlY2F1c2UgdGhlIG1lY2hhbmlzbSBpcyBwb3NpdGlvbiByYXRoZXIgdGhhbiBhIHJ1bGUuClVwc3RyZWFtJ3MgYGRlc2lnbl9hcnRpZmFjdGAgbG9va3MgdXAgYW4gYXJ0aWZhY3QncyBiYXNlIGtpbmQgb25jZSBhbmQgaXRzCnNraXAtdGhlLWZpeGVkLWFydGlmYWN0cyBsb29wIG5ldmVyIHJlZnJlc2hlcyB0aGF0IGxvb2t1cCwgc28gdGhlIG1vbWVudCB0aGUgbG9vcApzdGFydHMgb24gYSBxdWVzdCBhcnRpZmFjdCBpdCBrZWVwcyBza2lwcGluZyB0byB0aGUgZW5kIG9mIHRoZSBhcnJheS4gQW5nYmFuZCdzCnR3byBxdWVzdCBhcnRpZmFjdHMgYXJlIHRoZSBsYXN0IHR3byByZWNvcmRzIGluIHRoZSBmaWxlLCBhbmQgeW91ciByZWNvcmRzIGFyZQphcHBlbmRlZCBhZnRlciBjb3JlJ3MsIHdoaWNoIHB1dHMgdGhlbSBiZWhpbmQgdGhlIHBvaW50IHdoZXJlIHRoZSBza2lwcGluZwpzdGFydHMuIFRoZSBwb3J0IHJlcHJvZHVjZXMgdGhlIHF1aXJrIGV4YWN0bHksIGJlY2F1c2UgYSBiZWhhdmlvdXJhbCB3YXJ0IGEKcGxheWVyIGNhbiBvYnNlcnZlIGlzIGNvcmUncyB0byBrZWVwLgoKVHdvIGNvbnNlcXVlbmNlcyBmb3IgYW4gYXV0aG9yLiBZb3VyIGFydGlmYWN0IGlzIG5vdCBhIHJhbmRvbSBhcnRpZmFjdCBldmVuIGluIGEKcmFuZG9tLWFydGlmYWN0IGdhbWUsIHNvIGEgcGxheWVyIHdobyBjaG9zZSB0aGF0IG9wdGlvbiB0byBiZSBzdXJwcmlzZWQgd2lsbApzdGlsbCBtZWV0IHlvdXJzIGFzIHlvdSBkZXNpZ25lZCBpdC4gQW5kIG5vdGhpbmcgYWJvdXQgdGhhdCBpcyBhIGd1YXJhbnRlZSB0aGUKcG9ydCBtYWtlcyBvbiBwdXJwb3NlLCBzbyB0aGUgdGVzdCBhYm92ZSBhbHNvIG1lYXN1cmVzIHRoZSBjb252ZXJzZSBjYXNlOiBpZiB0aGUKb3JkZXIgcmVjb3JkcyBhcmUgYm91bmQgaW4gZXZlciBjaGFuZ2VzLCBpdCBmYWlscyBhbmQgbmFtZXMgdGhlIHJlYXNvbi4KCi0tLQoKIyMgU2hpcHBpbmcgcmVzb3VyY2VzOiBzb3VuZHMsIGEgZm9udCwgcHJlZiBmaWxlcywgaGVscCBwYWdlcywgYXJ0CgpSZWNvcmRzIGFyZSBub3QgdGhlIG9ubHkgdGhpbmcgYSBtb2QgZm9sZGVyIGNhbiBob2xkLiBTaXggb3RoZXIgY2F0ZWdvcmllcyBhcmUKZGVjbGFyZWQgaW4gb25lIGByZXNvdXJjZXNgIGFycmF5IGluIHlvdXIgbWFuaWZlc3QsIGVhY2ggbmFtaW5nIGEgYGtpbmRgIGFuZCBhCmBwYXRoYCAqKmluc2lkZSB5b3VyIG1vZCBmb2xkZXIqKi4gVGhlIGtpbmRzIGFyZSBgc291bmRgLCBgZm9udGAsIGBwcmVmc2AsCmBoZWxwYCwgYGFydGAgYW5kIGBsb2NhbGVgIChgUmVzb3VyY2VLaW5kYCwKYHBhY2thZ2VzL21vZC1zZGsvc3JjL3Jlc291cmNlcy50c2ApOgoKYGBganNvbgoicmVzb3VyY2VzIjogWwogIHsgImtpbmQiOiAic291bmQiLCAicGF0aCI6ICJzb3VuZHMiIH0sCiAgeyAia2luZCI6ICJmb250IiwgICJwYXRoIjogImZvbnRzL3Rlcm1pbmFsLmpzb24iIH0sCiAgeyAia2luZCI6ICJwcmVmcyIsICJwYXRoIjogInByZWZzL2NvbG91cnMucHJmIiB9LAogIHsgImtpbmQiOiAiaGVscCIsICAicGF0aCI6ICJoZWxwL2xvcmUudHh0IiwgInNsb3QiOiAibG9yZSIsICJuYW1lIjogIlRoZSBsb3JlIiB9LAogIHsgImtpbmQiOiAiYXJ0IiwgICAicGF0aCI6ICJhcnQvc3BsYXNoLnR4dCIsICJzbG90IjogInNwbGFzaCIgfQpdCmBgYAoKYHBhdGhgIGlzIG5ldmVyIGEgVVJMLiBZb3UgY2Fubm90IGtub3cgd2hlcmUgdGhlIGdhbWUgaXMgc2VydmluZyB5b3VyIG1vZCBmcm9tLAphbmQgdHdvIG9mIHRoZSB0aHJlZSBwbGFjZXMgYSBtb2QgY2FuIGxpdmUgaGF2ZSBubyBwYXRoIGF0IGFsbDogYSBmb2xkZXIgdGhlCnBsYXllciBwaWNrZWQsIGFuZCBhIG1vZCBpbnN0YWxsZWQgZnJvbSBhIHJlcG9zaXRvcnksIHdoaWNoIGxpdmVzIGluIHRoZQpicm93c2VyJ3MgZGF0YWJhc2UuIFRoZSBob3N0IGNvbXBvc2VzIHlvdXIgcGF0aCB3aXRoIHlvdXIgbW9kJ3Mgb3duIHJlc29sdmVyLgoKfCBraW5kIHwgd2hhdCBpdCBpcyB8IHNldmVyYWwgbW9kcz8gfAp8IC0tLSB8IC0tLSB8IC0tLSB8CnwgYHNvdW5kYCB8IGEgKipkaXJlY3RvcnkqKiBvZiBzYW1wbGVzIG5hbWVkIGFzIGBzb3VuZC5wcmZgIG5hbWVzIHRoZW0sIGAubXAzYCBvciBgLm9nZ2AgfCB0aGUgbGFzdCBlbmFibGVkIG9uZSB3aW5zIHwKfCBgZm9udGAgfCBhIGJpdG1hcCBmb250LCBgeyAidyIsICJoIiwgImdseXBocyIgfWAsIG9uZSBzY2FubGluZSBudW1iZXIgcGVyIHJvdyB8IHRoZSBsYXN0IGVuYWJsZWQgb25lIHdpbnMgfAp8IGBwcmVmc2AgfCBhIGAucHJmYCBpbiB1aS1wcmVmcy5jJ3Mgb3duIGdyYW1tYXI7IEFTQ0lJIGdseXBocywgY29sb3VycyBhbmQgc291bmQgcHJlZnMgYXBwbHkgYXQgaW5zdGFsbCwgYW5kIFRJTEUgYXNzaWdubWVudHMgbGF5ZXIgb3ZlciBhIGdyYXBoaWNzIHBhY2sncyBvd24gcHJlZnMgb24gZXZlcnkgbWFwIGJ1aWxkIHwgKiphbGwgb2YgdGhlbSBhcHBseSoqLCBpbiBsb2FkIG9yZGVyIHwKfCBgaGVscGAgfCBvbmUgcGFnZSBvZiBwbGFpbiB0ZXh0IHwgcGVyIGBzbG90YCB8CnwgYGFydGAgfCBvbmUgc2NyZWVuIG9mIGB7Y29sb3VyfS4uLnsvfWAgbWFya3VwIHwgcGVyIGBzbG90YCB8CnwgYGxvY2FsZWAgfCBvbmUgbGFuZ3VhZ2UsIGBzbG90YCBiZWluZyBpdHMgQkNQIDQ3IHRhZyB8IHBlciBgc2xvdGAgfAoKRm91ciB0aGluZ3MgdGhhdCB3aWxsIG90aGVyd2lzZSBjb3N0IHlvdSBhbiBhZnRlcm5vb246CgotICoqQSBgLnByZmAncyBgJTpgIGluY2x1ZGVzIHJlc29sdmUgYmVzaWRlIHRoZSBmaWxlIHlvdSBkZWNsYXJlZC4qKiBUaGV5IGFyZQogIGZvbGxvd2VkICh0aGV5IHdlcmUgc2lsZW50bHkgc2tpcHBlZCBiZWZvcmUgIzI3OCksIHRvIHRoZSBzYW1lIGRlcHRoIHRoZQogIHBhcnNlciBhbGxvd3MsIGFuZCBldmVyeSBvbmUgb2YgdGhlbSwgaW5jbHVkaW5nIGFuIGluY2x1ZGUncyBvd24gaW5jbHVkZXMsCiAgaXMgbG9va2VkIHVwIGluIHRoZSBkaXJlY3Rvcnkgb2YgdGhlIGBwYXRoYCBpbiB5b3VyIG1hbmlmZXN0LiBTbwogIGBwcmVmcy9jb2xvdXJzLnByZmAgc2F5aW5nIGAlOnNoYXJlZC5wcmZgIHJlYWRzIGBwcmVmcy9zaGFyZWQucHJmYC4gQSBuYW1lCiAgdGhhdCBkb2VzIG5vdCByZXNvbHZlIGlzIHNraXBwZWQgd2l0aG91dCBhIG1lc3NhZ2UsIHdoaWNoIGlzIHdoYXQgdXBzdHJlYW0KICBkb2VzOyBpZiBhIHJ1bGUgb2YgeW91cnMgaXMgbm90IHRha2luZyBlZmZlY3QsIGNoZWNrIHRoZSBzcGVsbGluZyBvZiB0aGUKICBpbmNsdWRlIGJlZm9yZSBhbnl0aGluZyBlbHNlLgotICoqQSBgLmpzb25gIHJlc291cmNlIG11c3Qgc2l0IGluIGEgc3ViZGlyZWN0b3J5LioqIEEgdG9wLWxldmVsIGAuanNvbmAgaXMgcmVhZAogIGFzIGEgcmVjb3JkIGNvbnRyaWJ1dGlvbiwgc28gYGZvbnQuanNvbmAgd291bGQgYmUgaGFuZGVkIHRvIHRoZSByZWNvcmQKICBjb21wb3Nlciwgd2hpY2ggaGFzIG5vIGNvbnRlbnQgZmlsZSBieSB0aGF0IG5hbWUsIGFuZCB5b3VyIG1vZCB3b3VsZCBsb2FkIHdpdGgKICBubyBmb250IGFuZCBubyBjb21wbGFpbnQgYW55d2hlcmUuIGBmb250cy9mb250Lmpzb25gIGlzIGZpbmUuCi0gKipgYXJ0YCBpcyB0ZXh0LCBub3QgYW4gaW1hZ2UuKiogVGhlIHRlcm1pbmFsIGlzIGEgZ2x5cGggZ3JpZDsgbm90aGluZyBwYWludHMgYQogIGJpdG1hcCBpbnRvIGl0LiBVcHN0cmVhbSdzIG93biBzcGxhc2ggaXMgdGV4dCAoYGxpYi9zY3JlZW5zL25ld3MudHh0YCksIGFuZAogIGAkVkVSU0lPTmAgaXMgc3Vic3RpdHV0ZWQgaW4geW91cnMgZXhhY3RseSBhcyBpdCBpcyBpbiB0aGF0IG9uZS4gWW91ciBhcnQgaXMKICBjbGFtcGVkIHRvIDIxIHJvd3MgYW5kIHRoZSB0d28gY3JlZGl0IGxpbmVzIGFyZSBhcHBlbmRlZCBhZnRlciBpdC4KLSAqKkEgYGhlbHBgIHNsb3QgdGhhdCBtYXRjaGVzIG9uZSBvZiB0aGUgZ2FtZSdzIFJFUExBQ0VTIHRoYXQgcGFnZSoqOyBhbnkgb3RoZXIKICBzbG90IGFkZHMgb25lLiBUaGUgaWRzIGFyZSBgY29tbWFuZHNgLCBgc3ltYm9sc2AsIGBndWlkZWAsIGBjb21tdW5pdHlgLiBVc2Ugb25lCiAgb2YgdGhvc2UgaWYgeW91ciBjb252ZXJzaW9uJ3Mga2V5cyBhcmUgbm90IEFuZ2JhbmQnczsgdXNlIHlvdXIgb3duIG90aGVyd2lzZS4KCiMjIyBXaGF0IGhhcHBlbnMgd2hlbiBhIHJlc291cmNlIGlzIHdyb25nCgpOb3RoaW5nIGlzIHRha2VuIGF3YXkgZXhjZXB0IHRoYXQgcmVzb3VyY2UuIEEgcHJlZiBmaWxlIHRoYXQgd2lsbCBub3QgcGFyc2UgY29zdHMKeW91IHRoZSBwcmVmIGZpbGUsIG5vdCB5b3VyIHJlY29yZHMsIG5vdCB5b3VyIHNvdW5kIHBhY2ssIG5vdCB0aGUgbW9kLiBCdXQgaXQgaXMKbmV2ZXIgc2lsZW50OiB3aGF0ZXZlciBjb3VsZCBub3QgYmUgdXNlZCBpcyB3cml0dGVuIG9uIHlvdXIgbW9kJ3Mgcm93IGluIHRoZSBtb2QKbWFuYWdlciwgaW4gYSBzZW50ZW5jZSBzYXlpbmcgd2hhdCB3YXMgd3Jvbmcgd2l0aCBpdC4KClRocmVlIGNoZWNrcyBydW4sIGFuZCB0aGUgbGFzdCBvbmUgY2FuIG9ubHkgcnVuIG9uIHRoZSBwbGF5ZXIncyBtYWNoaW5lOgoKMS4gKipZb3VyIGRlY2xhcmF0aW9uKiosIGF0IGJ1aWxkIHRpbWUgYW5kIGFnYWluIGF0IGxvYWQ6IGFuIHVua25vd24ga2luZCwgYSBwYXRoCiAgIGxlYXZpbmcgeW91ciBmb2xkZXIsIGFuIGV4dGVuc2lvbiB0aGUga2luZCBjYW5ub3QgYmUsIGEgc2xvdCBubyBzY3JlZW4gcGFpbnRzLgogICBBIGBzbG90YCBvbiBhIGtpbmQgdGhhdCBoYXMgbm8gc2xvdHMgaXMgcmVmdXNlZCByYXRoZXIgdGhhbiBpZ25vcmVkLCBiZWNhdXNlIGEKICAgc2lsZW50bHkgZHJvcHBlZCBrZXkgaXMgYSBiZWxpZWYgb2YgeW91cnMgdGhhdCB3b3VsZCBzdXJ2aXZlIHRvIHNoaXAuCjIuICoqWW91ciBmaWxlIGxpc3QuKiogQSBtb2QgcmVhZCBmcm9tIGEgZm9sZGVyIG9yIGluc3RhbGxlZCBmcm9tIGEgcmVwb3NpdG9yeQogICBhcnJpdmVzIHdpdGggZXZlcnkgZmlsZW5hbWUgaXQgaG9sZHMsIHNvIGEgdHlwbyBpcyBjYXVnaHQgd2l0aG91dCBhIHNpbmdsZQogICByZXF1ZXN0LiAoTm90IGF2YWlsYWJsZSBmb3IgYSBtb2QgY29tcGlsZWQgaW50byB0aGUgYXBwOyBjaGVjayAzIGNhdGNoZXMKICAgdGhvc2UuKQozLiAqKlRoZSBtYWNoaW5lLioqIFdoZXRoZXIgdGhpcyBidWlsZCBjYW4gcGxheSBgLm1wM2Agb3IgYC5vZ2dgIGF0IGFsbCwgYW5kCiAgIHdoZXRoZXIgeW91ciBmb250IEpTT04gaXMgc3RydWN0dXJhbGx5IGEgZm9udC4gT25seSBvcGVuaW5nIHRoZSBmaWxlIGNhbiBzYXkuCgpgZGVtby1yZXNvdXJjZXNgIGlzIGEgd29ya2luZyBleGFtcGxlIG9mIGZvdXIgb2YgdGhlIHNpeCwgYW5kCmBwYWNrYWdlcy93ZWIvc3JjL21vZC1yZXNvdXJjZXMubm9kZS50ZXN0LnRzYCByZWFkcyBpdCBmcm9tIGRpc2sgaW4gQ0kuIEl0IGlzIG5vdAphIG1vZCB5b3UgY2FuIGluc3RhbGw6IHRoZSBgZGVtby0qYCBtb2RzIHVuZGVyIGBwYWNrYWdlcy93ZWIvbW9kcy9gIGFyZSBmcmFtZXdvcmsKcHJvb2ZzIGNvbXBpbGVkIGludG8gREVWIGJ1aWxkcyBvbmx5LCBhbmQgZGlzY292ZXJ5IHN0cmlwcyB0aGVtIGZyb20gYSByZWxlYXNlCmJ1aWxkIChgaXNTaGlwcGVkTW9kYCwgYHBhY2thZ2VzL3dlYi9zcmMvbW9kLXN0b3JlLnRzYCkuIFJlYWQgaXQgaW4gdGhpcwpyZXBvc2l0b3J5IHJhdGhlciB0aGFuIGxvb2tpbmcgZm9yIGl0IGluIHRoZSBnYW1lLgoKLS0tCgojIyBUcmFuc2xhdGluZyB0aGUgZ2FtZQoKRW5nbGlzaCBzaGlwcyBpbiB0aGUgZ2FtZSBhbmQgaXMgd2hhdCBhIHBsYXllciBzZWVzIHdpdGggbm8gbW9kIGluc3RhbGxlZC4gQQp0cmFuc2xhdGlvbiBpcyBhIGBsb2NhbGVgIHJlc291cmNlLCBhIEpTT04gZmlsZSB3aG9zZSBgc2xvdGAgaXMgaXRzIGxhbmd1YWdlCnRhZzoKCmBgYGpzb24KewogICJ0YWciOiAiZGUiLAogICJuYW1lIjogIkRldXRzY2giLAogICJtZXNzYWdlcyI6IHsKICAgICJoZWxwLmNvbW1hbmRzLmxhYmVsIjogIlZlcmbDvGdiYXJlIEJlZmVobGUiLAogICAgInNob3Auc3RvY2siOiAie24sIHBsdXJhbCwgb25lIHsjIEdlZ2Vuc3RhbmR9IG90aGVyIHsjIEdlZ2Vuc3TDpG5kZX19IgogIH0KfQpgYGAKCmB0YWdgIG11c3QgbWF0Y2ggdGhlIGBzbG90YCB0aGF0IGRlY2xhcmVkIHRoZSBmaWxlLiBUaGV5IGFyZSB0d28gc3RhdGVtZW50cyBvZgp0aGUgc2FtZSBmYWN0IGFuZCB0aGUgY2hlY2sgcmVmdXNlcyB0aGVtIHdoZW4gdGhleSBkaXNhZ3JlZTogdGhlIHNsb3QgZGVjaWRlcwp3aGljaCBsYW5ndWFnZSB5b3VyIGZpbGUgKmlzIG9mZmVyZWQgYXMqLCBhbmQgdGhlIHRhZyBkZWNpZGVzIHdoYXQgaXQgKmlzKi4KCioqWW91IGRvIG5vdCBoYXZlIHRvIHRyYW5zbGF0ZSBldmVyeXRoaW5nLioqIEEgbWlzc2luZyBpZCBmYWxscyBiYWNrIHRocm91Z2ggdGhlCnJlZ2lvbiAoYHB0LUJSYCAtPiBgcHRgKSB0byBFbmdsaXNoLCBzbyBhIHBhcnRpYWwgY2F0YWxvZ3VlIHJlYWRzIGFzIHBhcnQgRW5nbGlzaApyYXRoZXIgdGhhbiBhcyBhIHNjcmVlbiBvZiBibGFua3MuCgojIyMgUGF0dGVybnMsIG5vdCBzZW50ZW5jZXMgeW91IGdsdWUgdG9nZXRoZXIKCk1lc3NhZ2VzIGFyZSBbSUNVIE1lc3NhZ2VGb3JtYXRdKGh0dHBzOi8vdW5pY29kZS1vcmcuZ2l0aHViLmlvL2ljdS91c2VyZ3VpZGUvZm9ybWF0X3BhcnNlL21lc3NhZ2VzLyksCmEgc3Vic2V0LCBidXQgdGhlIG9yZGluYXJ5IG9uZSwgc28gb3JkaW5hcnkgdHJhbnNsYXRpb24gdG9vbHMgY2FuIGVkaXQgeW91cgpmaWxlOgoKfCB5b3Ugd3JpdGUgfCB5b3UgZ2V0IHwKfCAtLS0gfCAtLS0gfAp8IGB7bmFtZX1gIHwgdGhlIHZhbHVlIHwKfCBge24sIG51bWJlcn1gIHwgZ3JvdXBlZCBmb3IgeW91ciBsb2NhbGUgKGAxLjIzNC41NjdgIGluIEdlcm1hbikgfAp8IGB7biwgcGx1cmFsLCBvbmUgeyMgcmluZ30gb3RoZXIgeyMgcmluZ3N9fWAgfCB0aGUgcmlnaHQgYXJtLCBgI2AgYmVpbmcgdGhlIG51bWJlciB8CnwgYHtuLCBwbHVyYWwsID0wIHtub3RoaW5nfSBvdGhlciB7I319YCB8IGFuIGV4YWN0IHZhbHVlIHNob3J0LWNpcmN1aXRzIHRoZSBydWxlcyB8CnwgYHtnLCBzZWxlY3QsIG1hbGUge0VyfSBmZW1hbGUge1NpZX0gb3RoZXIge0VzfX1gIHwgYW4gZXhhY3QgbWF0Y2ggfAp8IGB7biwgc2VsZWN0b3JkaW5hbCwgb25lIHsjLn0gb3RoZXIgeyMufX1gIHwgb3JkaW5hbHMgfAp8IGAne2AgfCBhIGxpdGVyYWwgYnJhY2UgfAoKKipVc2UgdGhlIHBsdXJhbCBhcm1zIHlvdXIgbGFuZ3VhZ2UgYWN0dWFsbHkgaGFzLioqIFRoZXkgY29tZSBmcm9tIHRoZSBwbGF0Zm9ybSdzCm93biBydWxlcywgc28gUG9saXNoIGdldHMgYG9uZWAvYGZld2AvYG1hbnlgL2BvdGhlcmAgYW5kIEFyYWJpYyBnZXRzIHNpeCwgYW5kIHRoZQpnYW1lIG5ldmVyIGhhcyB0byBrbm93IHdoaWNoLiBXcml0aW5nIGEgYmFyZSBge259IFJpbmdlYCBhbmQgbGV0dGluZyB0aGUgbnVtYmVyCmRvIHRoZSB3b3JrIGlzIHRoZSBzaW5nbGUgbW9zdCBjb21tb24gd2F5IGEgdHJhbnNsYXRpb24gZW5kcyB1cCB3cm9uZy4KCiMjIyBXaGVuIHdvcmRzIGFyZSBub3QgZW5vdWdoCgpTb21lIHRleHQgaXMgKmFzc2VtYmxlZCosIG5vdCB3cml0dGVuLiBBbiBvYmplY3QncyBuYW1lIGlzIGJ1aWx0IGZyb20gYSBwYXR0ZXJuCmxpa2UgYCYgU2Nyb2xsfiB0aXRsZWQgI2AuIFRoZSBgfmAgaXMgYW4gRW5nbGlzaCBwbHVyYWxpemVyLCB0aGUgYCZgIGJlY29tZXMKYGFgL2BhbmAgYnkgdGhlIHZvd2VsIGFmdGVyIGl0LCBhbmQgdGhlIGNvdW50IGdvZXMgaW4gZnJvbnQuIElmIHlvdXIgbGFuZ3VhZ2UKY291bnRzIHdpdGggYSBjbGFzc2lmaWVyLCBpbmZsZWN0cyBmb3IgY2FzZSwgb3IgaGFzIG5vIHBsdXJhbCBgc2AsIG5vIGFtb3VudCBvZgp3b3JkIHJlcGxhY2VtZW50IHdpbGwgZ2V0IHlvdSB0aGVyZS4KCkZvciB0aGF0LCBhIGxvY2FsZSByZXBsYWNlcyB0aGUgKipmdW5jdGlvbioqLiBUaG9zZSBsaXZlIGluIGNvZGUsIHNvIGEKdHJhbnNsYXRpb24gdGhhdCBuZWVkcyB0aGVtIHNoaXBzIGEgYHBsdWdpbi5qc2AgYWxvbmdzaWRlIGl0cyBKU09OIGFuZCBjYWxscwpjb3JlJ3MgYHJlZ2lzdGVyTG9jYWxlYCB3aXRoIGl0cyBvd24gYGZvcm1zYDoKCmBgYGpzCmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlcihob3N0LCBjdHgpIHsKICBjb25zdCBjb3JlID0gY3R4LmNvcmUuY29yZUZvcm1zKCk7CiAgY3R4LmNvcmUucmVnaXN0ZXJMb2NhbGUoewogICAgdGFnOiAiZGUiLAogICAgZm9ybXM6IHsKICAgICAgLy8gRW5nbGlzaCdzIG1hY2hpbmVyeSBmb3IgZXZlcnl0aGluZyBleGNlcHQgdGhlIG5vdW5zIHlvdSBjYXJlIGFib3V0CiAgICAgIG9iamVjdE5hbWVGb3JtYXQ6IChmbXQsIG1vZHN0ciwgcGx1cmFsKSA9PgogICAgICAgIGZtdC5pbmNsdWRlcygiU2Nyb2xsIikKICAgICAgICAgID8gKHBsdXJhbCA/ICJSb2xsZW4iIDogIlJvbGxlIikKICAgICAgICAgIDogY29yZS5vYmplY3ROYW1lRm9ybWF0KGZtdCwgbW9kc3RyLCBwbHVyYWwpLAogICAgfSwKICB9KTsKfQpgYGAKCmBjb3JlRm9ybXMoKWAgaXMgd2hhdCBtYWtlcyB0aGlzIGEgc21hbGwgam9iIHJhdGhlciB0aGFuIGEgcmV3cml0ZTogdGFrZQpFbmdsaXNoJ3MgaW1wbGVtZW50YXRpb24sIHNwZWNpYWwtY2FzZSB3aGF0IHlvdXIgbGFuZ3VhZ2UgZG9lcyBkaWZmZXJlbnRseSwgYW5kCmRlbGVnYXRlIHRoZSByZXN0LgoKIyMjIEZpbmRpbmcgd2hhdCBpcyBub3QgdHJhbnNsYXRlZCB5ZXQKCk5vdCBldmVyeSBzdHJpbmcgaW4gdGhlIGdhbWUgaGFzIGJlZW4gcm91dGVkIHRocm91Z2ggdGhlIHRyYW5zbGF0b3IgeWV0LiBBCioqcHNldWRvLWxvY2FsZSoqIGlzIGhvdyB5b3UgZmluZCB0aGUgb25lcyB0aGF0IGhhdmUgbm90OiB0aGUgYnVuZGxlZApgZGVtby1yZXNvdXJjZXNgIG1vZCBzaGlwcyBgZW4tWEFgLCByZWFkYWJsZSBFbmdsaXNoIHdpdGggZXZlcnkgbGV0dGVyIGFjY2VudGVkCmFuZCBldmVyeSBzdHJpbmcgYnJhY2tldGVkLiBFbmFibGUgaXQsIHN3aXRjaCB0byBpdCB3aXRoIGA/bGFuZz1lbi1YQWAsIGFuZAphbnl0aGluZyBzdGlsbCBpbiBwbGFpbiBBU0NJSSBvbiB0aGUgc2NyZWVuIGlzIGEgc3RyaW5nIHRoYXQgY2Fubm90IHlldCBiZQp0cmFuc2xhdGVkLiBUaG9zZSBhcmUgd29ydGggcmVwb3J0aW5nLgoKLS0tCgojIyBSZW5hbWluZyBhIHBsYXllci10b2dnbGVhYmxlIHJ1bGUKCkEgcnVsZSBgZmxhZ2AgaXMgZHVyYWJsZSBQTEFZRVIgU1RBVEUsIG5vdCBhbiBpbnRlcm5hbCBuYW1lLiBUaGUgcGxheWVyJ3MgYW5zd2VyCmlzIHN0b3JlZCBhZ2FpbnN0IHRoYXQgZXhhY3Qgc3RyaW5nIGluIHRoZSBob3N0J3Mgb3duIHN0b3JlLCBzbyByZXBsYWNpbmcgYSBmbGFnCm91dHJpZ2h0IG9ycGhhbnMgdGhlaXIgYW5zd2VyOiB0aGUgbG9va3VwIG1pc3NlcywgdGhlIHJ1bGUgZmFsbHMgYmFjayB0byBpdHMKZGVjbGFyZWQgYGRlZmF1bHRgLCBhbmQgc29tZW9uZSB3aG8gZGVsaWJlcmF0ZWx5IHR1cm5lZCB5b3VyIGZpeCBPRkYgZ2V0cyBpdApiYWNrIE9OIHdpdGhvdXQgYmVpbmcgdG9sZC4gRm9yIGEgYnVnLWZpeGVzIG1vZCwgd2hvc2UgZGVmYXVsdHMgYXJlIGFsbCBvbiwgdGhhdAppcyB0aGUgZ2FtZSBxdWlldGx5IHJlLWFwcGx5aW5nIGEgY2hhbmdlIHRoZXkgaGFkIHJlamVjdGVkLgoKU28gZG8gbm90IHNpbXBseSByZXBsYWNlIG9uZS4gTWFwIGVhY2ggcmV0aXJlZCBmbGFnIHRvIGl0cyBjdXJyZW50IHJ1bGUgdW5kZXIKYHJlbmFtZWRSdWxlRmxhZ3NgOgoKYGBganNvbgoicmVuYW1lZFJ1bGVGbGFncyI6IHsKICAiYnVnLWZpeGVzLmF0b21pYy1zYXZlIjogImJ1Zy1maXhlcy5zYXZlLXNhZmV0eSIsCiAgImJ1Zy1maXhlcy5hdG9taWMtY3Jhc2giOiAiYnVnLWZpeGVzLnNhdmUtc2FmZXR5Igp9CmBgYAoKRXZlcnkgZGVzdGluYXRpb24gbXVzdCBiZSBvbmUgb2YgdGhpcyBtYW5pZmVzdCdzIGN1cnJlbnQgYHJ1bGVzYC4gVGhlIHNvdXJjZQptdXN0IE5PVCBiZTogYSBmbGFnIHlvdSBzdGlsbCBkZWNsYXJlIGlzIGxpdmUsIGFuZCBjb25zdW1pbmcgaXRzIHN0b3JlZCBjaG9pY2UKYXMgcmV0aXJlZCB3b3VsZCBkZXN0cm95IGEgc2V0dGluZyB5b3UgYXJlIHN0aWxsIGV4cG9zaW5nLiBSZW5hbWluZyBhIGZsYWcgdG8KaXRzZWxmIGlzIHJlZnVzZWQgZm9yIHRoZSBzYW1lIHJlYXNvbi4KClRoZSBob3N0IG1pZ3JhdGVzIGl0cyBzYXZlZCBjaG9pY2VzIHdoZW4gaXQgbG9hZHMgeW91ciBlbmFibGVkIG1vZCwgYmVmb3JlIGl0CnJlc29sdmVzIGRlZmF1bHRzLiBXaGVyZSBzZXZlcmFsIHJldGlyZWQgZmxhZ3MgYmVjb21lIG9uZSBydWxlLCB0aGUgcmVzdWx0IGlzIG9uCmlmIEFOWSBvZiB0aGVtIHdhcyBvbjogdHVybmluZyBvZmYgYSBmaXggdGhlIHBsYXllciBoYWQgb24gd291bGQgcmVpbnRyb2R1Y2UgYQpidWcgdGhleSBoYWQgY2hvc2VuIHRvIGJlIHJpZCBvZiwgYW5kIHJlLWVuYWJsaW5nIGEgc2libGluZyBpcyB0aGUgc21hbGxlcgpzdXJwcmlzZTogdGhleSBjYW4gc3RpbGwgdHVybiB0aGUgd2hvbGUgcnVsZSBvZmYuIEEgY2hvaWNlIGFscmVhZHkgcmVjb3JkZWQgZm9yCnRoZSBjdXJyZW50IGZsYWcgd2lucyBvdXRyaWdodCwgc2luY2UgaXQgd2FzIG1hZGUgYWdhaW5zdCB0aGUgbmV3IHJlbGVhc2UuIFRoZQpvbGQgZW50cmllcyBhcmUgdGhlbiBjb25zdW1lZCwgc28gbG9hZGluZyBhZ2FpbiBjaGFuZ2VzIG5vdGhpbmcuCgotLS0KCiMjIFJlbmFtaW5nIGEgc2VjdGlvbiBvciB0dXJuaW5nIGEgcnVsZSBpbnRvIGEgc2VjdGlvbgoKU2VjdGlvbnMgcGVyc2lzdCB0aGVpciBjaG9pY2VzIHNlcGFyYXRlbHkgZnJvbSBydWxlcywgdW5kZXIgdGhlIG93bmluZyBtb2QgYW5kCnRoZSBzZWN0aW9uJ3MgYGlkYC4gSWYgeW91IHJlbmFtZSBhIHNlY3Rpb24sIG9yIHByb21vdGUgYSBgcnVsZXNbXWAgZW50cnkgaW50byBhCnNlY3Rpb24gc28gaXQgY2FuIGdhdGUgY29udGVudCwgcHV0IGl0cyBvbGQgbmFtZXMgaW4gdGhlIG5ldyBzZWN0aW9uJ3MKYHJlbmFtZWRTZWN0aW9uRmxhZ3NgIGxpc3Q6CgpgYGBqc29uCiJzZWN0aW9ucyI6IFsKICB7CiAgICAiaWQiOiAidGV4dC1jb3JyZWN0aW9ucyIsCiAgICAidGl0bGUiOiAiVGV4dCBjb3JyZWN0aW9ucyIsCiAgICAiZmxhZyI6ICJidWdmaXgudGV4dEFuZEhpc3RvcnkiLAogICAgInJlbmFtZWRTZWN0aW9uRmxhZ3MiOiBbImJ1Z2ZpeC50ZXh0QW5kSGlzdG9yeSIsICJvbGQtdGV4dC1jb3JyZWN0aW9ucyJdCiAgfQpdCmBgYAoKRWFjaCBuYW1lIG1heSBmaW5kIGVpdGhlciBhIHJldGlyZWQgcnVsZSBjaG9pY2Ugb3IgYSByZXRpcmVkIHNlY3Rpb24gY2hvaWNlLiBGb3IKYSBwcmV2aW91cyBzZWN0aW9uIHVzaW5nIGl0cyBkZWZhdWx0IGZsYWcsIHRoYXQgbmFtZSBpcyBpdHMgb2xkIGBpZGAsIHdoaWNoIGlzCmFsc28gdGhlIGtleSB0aGUgaG9zdCBzdG9yZWQ7IGEgcHJldmlvdXMgc2VjdGlvbiB3aXRoIGEgY3VzdG9tIGBmbGFnYCBzdGlsbCB1c2VzCml0cyBvbGQgYGlkYCBmb3IgdGhpcyBwdXJwb3NlLiBMaXN0aW5nIHRoZSBjdXJyZW50IGBmbGFnYCBpcyB2YWxpZCBhbmQgaXMgaG93IGEKcnVsZSB0aGF0IGJlY2FtZSBhIHNlY3Rpb24gdW5kZXIgdGhlIHNhbWUgbmFtZSBwcmVzZXJ2ZXMgaXRzIGV4aXN0aW5nIGNob2ljZS4KCkFuIGV4cGxpY2l0IGNob2ljZSBhbHJlYWR5IHN0b3JlZCBmb3IgdGhlIGN1cnJlbnQgc2VjdGlvbiB3aW5zLiBPdGhlcndpc2UgdGhlCmhvc3QgY2hlY2tzIGByZW5hbWVkU2VjdGlvbkZsYWdzYCBpbiBsaXN0IG9yZGVyIGFuZCBjb3BpZXMgdGhlIGZpcnN0IG1hdGNoaW5nCmNob2ljZSBpbnRvIHRoZSBjdXJyZW50IHNlY3Rpb247IGlmIGJvdGggc3RvcmVzIGhhcHBlbiB0byBjYXJyeSB0aGUgc2FtZSBvbGQKbmFtZSwgdGhlIG9sZCBzZWN0aW9uIGNob2ljZSB3aW5zLiBJdCBjb25zdW1lcyByZXRpcmVkIGVudHJpZXMgYWZ0ZXJ3YXJkcywgc28gYQpsYXRlciBsb2FkIGlzIHVuY2hhbmdlZC4gV2l0aCBubyBjdXJyZW50IG9yIHJldGlyZWQgY2hvaWNlLCB0aGUgc2VjdGlvbiB1c2VzIGl0cwpkZWNsYXJlZCBgZGVmYXVsdGAgYXMgdXN1YWwuCgotLS0KCiMjIEZyb250LWVuZCBncm91bmR3b3JrCgpUaGUgaG9zdCBkcmF3cyB0aHJvdWdoIGEgcmVuZGVyZXItbmV1dHJhbCBgR3JpZFN1cmZhY2VgLCBhbmQgaXRzIGV4aXN0aW5nIGNhbnZhcwp0ZXJtaW5hbCBpcyBtZXJlbHkgb25lIGltcGxlbWVudGF0aW9uLiBNZW51cyBhcmUgbm93IGRlY2xhcmF0aXZlIGZyb250LWVuZCBkYXRhOgpyZXF1ZXN0IGByZWdpc3RyeTptZW51YCBhbmQgdXNlIGBob3N0Lm1lbnVzLnJlZ2lzdGVyKCJjb3JlOmdhbWUtbWVudSIsIGZuKWAgdG8KcmV3cml0ZSBvbmUgbmFtZWQgbWVudSdzIHJvd3MuIFRoZSBpZCBpcyBzdGFibGUgYW5kIG5ldmVyIGEgbG9jYWxpemVkIHRpdGxlOwplYWNoIHJvdyBjYXJyaWVzIGEgc3RhYmxlIGlkIHBsdXMgYHNlbWFudGljLmtpbmRgLCBvcHRpb25hbCBgc2VtYW50aWMucmVmYCwgYW5kCnNtYWxsIHNjYWxhciBgc2VtYW50aWMuZGF0YWAsIHNvIGFuIGFsdGVybmF0aXZlIGxheW91dCB3b3JrcyBmcm9tIG1lYW5pbmcgcmF0aGVyCnRoYW4gcGFyc2luZyBpdHMgbGFiZWwuIENhbGwgYGhvc3QubWVudXMuaGFuZGxlckZvcihpZClgIGJlZm9yZSByZWdpc3RlcmluZyB3aGVuCnlvdSBuZWVkIHRvIHdyYXAgYSB0cmFuc2Zvcm1lciBpbnN0YWxsZWQgYnkgYW4gZWFybGllciBtb2QuIEEgZmFpbGVkIHRyYW5zZm9ybQppcyByZXBvcnRlZCBhbmQgdGhlIHVubW9kaWZpZWQgbWVudSBzdGF5cyBvcGVuYWJsZS4KCmBNb2RQbHVnaW4uZnJvbnRlbmQ/KGN0eClgIGlzIG5vdyB0aGUgb25lIG1hcC1kaXNwbGF5IHNsb3QuIFRoZSBsYXRlciBlbmFibGVkCmZyb250ZW5kIHdpbnMsIGFuZCBvbmx5IHRoYXQgZmFjdG9yeSBpcyBpbnZva2VkOyByZXR1cm4gYSBgV29ybGRGcmFtZVNpbmtgIG9yCmB1bmRlZmluZWRgIHRvIHByZXNlcnZlIHRoZSBnbHlwaCB0ZXJtaW5hbC4gVGhlIGhvc3QgaW52b2tlcyB0aGUgZXh0cmFjdGVkCndvcmxkLXJlbmRlci1kYXRhIHByb2R1Y2VyIGZyb20gaXRzIGFjdHVhbCBtYXAgcmVwYWludCBhbmQgcGFzc2VzIHRoZSB3aW5uZXIgYQpmcm96ZW4sIHJlbmRlcmVyLW5ldXRyYWwgYFdvcmxkRnJhbWVgIHNuYXBzaG90OiBncmlkcyByZXRhaW4gc2VtYW50aWMKdGVycmFpbiwgdHJhcCwgb2JqZWN0LCBtb25zdGVyLCBhbmQgcGF0aCBpZHMgcGx1cyBzZWVuL3JlbWVtYmVyZWQvdW5rbm93biBzdGF0ZSwKd2hpbGUgdGhlIGdseXBoIHByb2plY3Rpb24gaXMgb25seSB0aGUgY3VycmVudCB0ZXJtaW5hbCBmYWxsYmFjayAoaW5jbHVkaW5nIGl0cwp0ZXJyYWluLXVuZGVyLWZvcmVncm91bmQgdGlsZSBpbnB1dHMsIGV2ZW4gZm9yIGEgcGF0aCBvdmVyIG90aGVyd2lzZSBiYXJlIHNlZW4KdGVycmFpbikuIFRoYXQgbWFrZXMgdGhlCndvcmxkIGRhdGEgcmVhZHkgZm9yIGFuIGlzb21ldHJpYyBvciAzRCBjb25zdW1lci4gVHlwZVNjcmlwdCBtb2RzIGNhbiB3cml0ZQpgaW1wb3J0IHR5cGUgeyBXb3JsZEZyYW1lLCBXb3JsZEZyYW1lU2luayB9IGZyb20KIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLW1vZC1zZGsiYDsgaXQgaXMgdHlwZS1vbmx5LCBzbyBpdCBkb2VzIG5vdCB2aW9sYXRlIHRoZQpmb2xkZXItcGx1Z2luIG5vLWJhcmUtcnVudGltZS1pbXBvcnQgcnVsZS4gSXRzIFBoYXNlLTQgY29udHJvbApleGVjdXRlcyB0aGUgc2FtZSBwcm9kdWNlciBgbWFpbi50c2AgY2FsbHMsIGNoZWNrcyB0aGUgdW5tb2RkZWQgZ2x5cGggc2luaydzCnByZS1mcmFtZSBgdGVybS5wdXRgIHR1cGxlcywgYW5kIHByb3ZlcyBhbiBpbmRlcGVuZGVudGx5IG93bmVkIGhvc3Qgc2luawpyZWNlaXZlcyB0aGF0IGV4YWN0IGZyYW1lIGluIHRoZSBzYW1lIGNhbGwuIFRoZSBQaGFzZS01IGRpc2sgZml4dHVyZSBwcm92ZXMgdGhlCmxhdGVyIHBsdWdpbiByZWNlaXZlcyBpdCBhbmQgYW4gdW5tb2RkZWQgY29udHJvbCBwcmVzZXJ2ZXMgZ2x5cGggcGFpbnRpbmcuIFRoZQpzbmFwc2hvdCBoYXMgbm8gbXV0YWJsZSBwbGF5ZXItZ3JpZCBhbGlhcywgc28gYSBmcm9udGVuZCBjYW4gcmV0YWluIGEgZnJhbWUKd2l0aG91dCByZXRhaW5pbmcgbGl2ZSBnYW1lIHN0YXRlLgoKSW5wdXQgZm9sbG93cyB0aGUgc2FtZSBzdGFnZWQgcnVsZS4gYFVpSW5wdXRgIGlzIGF2YWlsYWJsZSB0byBob3N0IGNvZGUgdGhyb3VnaAp0aGUgb25lIGlucHV0IGRvb3IgYW5kIGNhbiByZXByZXNlbnQgYSBjb250aW51b3VzIGRpcmVjdGlvbiAodmVjdG9yLCBtYWduaXR1ZGUsCmFuZ2xlKSB3aXRob3V0IHRyYW5zbGF0aW5nIGl0IHRvIGEga2V5Ym9hcmQgYXJyb3cuIEEgZnJvbnQtZW5kIG1lbWJlciBET0VTCmV4aXN0IC0gYE1vZFBsdWdpbi5mcm9udGVuZD8oY3R4KWAsIGdhdGVkIGJ5IGBkaXNwbGF5OnJlcGxhY2VgLCBhbmQgcG9pbnRlciBpbnB1dAphcnJpdmVzIHBlciByZWdpb24gdGhyb3VnaCBgUmVnaW9uRGVjbGFyYXRpb24uaW5wdXRgIC0gc28gd2hhdCBpcyBzdGlsbCBhYnNlbnQgaXMKbmFycm93ZXIgdGhhbiAibm8gc2VhbSI6IHRoZXJlIGlzIG5vIHBsdWdpbiBtZW1iZXIgZm9yIHJlYmluZGluZyBLRVlTLCBhbmQKYGlucHV0LWRvb3IudHNgIGlzIGhvc3QgaW5mcmFzdHJ1Y3R1cmUgcmF0aGVyIHRoYW4gYSBjYXBhYmlsaXR5LiBEbyBub3QgYnVpbGQgb24Ka2V5IHJlYmluZGluZyB1bnRpbCBpdCBoYXMgb25lLiBQbGF5ZXIga2V5bWFwcyBrZWVwIHByZWNlZGVuY2Ugb3ZlciBhbnkgbGF0ZXIKaW5wdXQgY29uc3VtZXIgd2hpbGUgdGhlIHJvb3Qgb3ducyBpbnB1dDsgYW4gYWN0aXZlIG1vZGFsLCBzY29yZSBzY3JlZW4sIG9yIHJ1bgppbnRlcnJ1cHRpb24gY29udGludWVzIHRvIHJlY2VpdmUgdGhlIHBsYXllcidzIGxpdGVyYWwga2V5IGZpcnN0LgoKIyMgS25vd2luZyB3aGljaCBtb2QgYSByZWNvcmQgY2FtZSBmcm9tCgpFdmVyeSByZWNvcmQgdGhlIGdhbWUgYmluZHMgY2FycmllcyBgZnJvbWAgd2hlbiBhIG1vZCB3YXMgaW52b2x2ZWQuIFJlYWNoIGEgYm91bmQKcmVjb3JkIHRoZSB3YXkgdGhlIGJpbmRpbmcgZXhwb3NlcyBpdCAtIGEgbW9uc3RlciByYWNlIHRocm91Z2ggdGhlIGJpbmRpbmcncwpgcmFjZXNgIGFycmF5LCBhbiBvYmplY3Qga2luZCB0aHJvdWdoIGByZWdpc3RyaWVzLm9iamVjdHMua2luZHNgLCBhbmQgc28gb247CnRoZXJlIGlzIG5vIHNpbmdsZSBgbG9va3VwYCBoZWxwZXIgZm9yIGV2ZXJ5IHJlY29yZCB0eXBlOgoKYGBganMKY29uc3QgcmFjZSA9IHNvbWVCb3VuZFJhY2U7ICAgLy8gZS5nLiBmcm9tIGN0eC5yZWdpc3RyaWVzCnJhY2UuZnJvbTsgICAgICAgICAgICAvLyB7IG93bmVyOiAiZGVtby1tb2R0ZXN0IiB9ICAgICAgICAtIGEgbW9kIEFEREVEIGl0CnNvbWVDb3JlUmFjZS5mcm9tOyAgICAvLyB7IG93bmVyOiAiY29yZSIsIG1vZGlmaWVkQnk6IFsicW9sIl0gfSAtIGEgbW9kIENIQU5HRUQgaXQKYW5vdGhlckNvcmVSYWNlLmZyb207IC8vIHVuZGVmaW5lZCAgICAgICAgICAgICAgICAgICAgICAgICAgLSBjb3JlJ3MsIHVudG91Y2hlZApgYGAKCmB1bmRlZmluZWRgIGlzIHRoZSBjb21tb24gY2FzZSBhbmQgaXQgbWVhbnMgImNvcmUncyBvd24sIGFuZCBub3RoaW5nIHRvdWNoZWQKaXQiLCBleGFjdGx5IGFzIGBleHRgIGRvZXMuIFNvIGEgcGx1Z2luIG5ldmVyIGhhcyB0byB0ZWxsICJubyBtb2QiIGZyb20gImEgbW9kCnRoYXQgbGVmdCBubyBtYXJrIiwgYW5kIGEgY2hlY2sgbGlrZSBgaWYgKHJhY2UuZnJvbSkgLi4uYCByZWFkcyBjb3JyZWN0bHkuCgpgb3duZXJgIGlzIHRoZSBwYWNrIHRoYXQgQURERUQgdGhlIHJlY29yZC4gQSBwYXRjaCBkb2VzIG5vdCB0cmFuc2ZlciBvd25lcnNoaXA6CmlmIHlvdXIgbW9kIHJlbmFtZXMgb25lIG9mIGNvcmUncyBtb25zdGVycywgdGhhdCBtb25zdGVyIGlzIHN0aWxsIGNvcmUncyAtIHR1cm4KeW91ciBtb2Qgb2ZmIGFuZCBpdCBpcyBzdGlsbCB0aGVyZSAtIHNvIGBvd25lcmAgc3RheXMgYGNvcmVgIGFuZCB5b3VyIGlkIGpvaW5zCmBtb2RpZmllZEJ5YC4gVGhpcyBtYXR0ZXJzIGJleW9uZCBib29ra2VlcGluZywgYmVjYXVzZSAqKmBvd25lcmAgaXMgdGhlCm5hbWVzcGFjZSBhIHNhdmVmaWxlIHN0b3JlcyB0aGUgcmVjb3JkIHVuZGVyKiouIEEgbW9uc3RlciB5b3VyIG1vZCBhZGRzIGlzIHNhdmVkCmFzIGB5b3VybW9kOml0cy1uYW1lYDsgaWYgaXQgd2VyZSBzYXZlZCBhcyBgY29yZTppdHMtbmFtZWAsIGEgcGxheWVyIHdobyByZW1vdmVkCnlvdXIgbW9kIHdvdWxkIGhhdmUgYSBzYXZlIGFza2luZyB0aGUgYmFzZSBnYW1lIGZvciBjb250ZW50IGl0IGhhcyBuZXZlciBoZWFyZApvZiwgd2l0aCBub3RoaW5nIGluIHRoZSBpZCB0byBzYXkgd2hvIHNob3VsZCBoYXZlIHN1cHBsaWVkIGl0LgoKWW91IGRvIG5vdCB3cml0ZSBgZnJvbWAgYW5kIHlvdSBjYW5ub3Q6IGl0IGlzIHN0YW1wZWQgYnkgdGhlIGNvbXBvc2VyIHVuZGVyIGEKcmVzZXJ2ZWQga2V5IHRoYXQgbm8gbW9kIGNhbiBtaW50LCBiZWNhdXNlIGEgbW9kJ3Mgb3duIGZpZWxkcyBtdXN0IGJlIG5hbWVzcGFjZWQKYW5kIHRoZSByZXNlcnZlZCBrZXkgaXMgbm90LiBXcml0aW5nIGAiJGZyb20iYCBpbnRvIHlvdXIgb3duIEpTT04gYnkgaGFuZCBpcwppZ25vcmVkLgoKIyMgUmVnZW5lcmF0aW5nIHRoZSBibHVlcHJpbnQgdGFibGUKCmBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9ibHVlcHJpbnRzLnRzYCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgc2hpcHBlZCBwYWNrOgoKYGBgYmFzaApub2RlIHBhY2thZ2VzL21vZC1zZGsvc2NyaXB0cy9nZW4tYmx1ZXByaW50cy5tanMKYGBgCgpEbyBub3QgZWRpdCBpdCBieSBoYW5kLiBgYmx1ZXByaW50cy50ZXN0LnRzYCByZS1kZXJpdmVzIHRoZSB3aG9sZSB0YWJsZSBmcm9tCmBwYWNrYWdlcy9jb250ZW50L3BhY2tgIGFuZCBmYWlscyBpbiBib3RoIGRpcmVjdGlvbnMsIGFuZCBzZXBhcmF0ZWx5IGFzc2VydHMKdGhhdCBpdCBhZ3JlZXMsIGZpbGUgZm9yIGZpbGUsIHdpdGggY29yZSdzIG93biBnZW5lcmF0ZWQgYENPUkVfUkVDT1JEX0tFWVNgOgp0aGUgZGF5IHRob3NlIHR3byBkaXNhZ3JlZSBpcyB0aGUgZGF5IGEgZmllbGQgaXMgYW4gZXh0ZW5zaW9uIGF0IG9uZSBlbmQgYW5kIGEKY29yZSBmaWVsZCBhdCB0aGUgb3RoZXIuCg=="
  },
  {
    "id": "plugins",
    "path": "PLUGINS.md",
    "audience": "advanced",
    "title": "Plugin API",
    "note": "plugin.js, hooks, resources, regions, capabilities, and testing.",
    "encoded": "IyBNb2QgcGx1Z2luczogc2hpcHBpbmcgQ09ERSBpbiBhIG1vZCBmb2xkZXIKCkEgbW9kIHRoYXQgb25seSBjaGFuZ2VzIHJlY29yZHMgbmVlZHMgbm8gY29kZTogZHJvcCBgbWFuaWZlc3QuanNvbmAgcGx1cyBvbmUKYDxyZWNvcmQtdHlwZT4uanNvbmAgcGVyIHRoaW5nIHlvdSBjaGFuZ2UgaW50byBhIGZvbGRlciBhbmQgeW91IGFyZSBkb25lIChzZWUKWy4uL01PRFMubWRdKGh0dHBzOi8vZ2l0aHViLmNvbS9uZW9zdHJ5ZGVyL25lby1hbmdiYW5kL2Jsb2IvbWFzdGVyL2RvY3MvTU9EUy5tZCkpLiBUaGlzIGRvY3VtZW50IGlzIGZvciB0aGUgb3RoZXIga2luZDogYSBtb2QgdGhhdCBjaGFuZ2VzCipiZWhhdmlvdXIqLgoKPiAqKkEgYnJlYWtpbmcgbW9kIEFQSSBjaGFuZ2UgaXMgbm93IGEgTUFKT1IgdmVyc2lvbiBidW1wLioqIEJlZm9yZSAxLjAsIHRoZQo+IEFQSSBjb3VsZCBjaGFuZ2Ugb24gYW55IG1pbm9yIHJlbGVhc2U7IGZyb20gMS4wLjAgb24sIGEgcGx1Z2luIHdyaXR0ZW4KPiBhZ2FpbnN0IHRoZSBjdXJyZW50IEFQSSBrZWVwcyBsb2FkaW5nIGFjcm9zcyBwYXRjaCBhbmQgbWlub3IgcmVsZWFzZXMsIGFuZAo+IHRoZSBkZXByZWNhdGlvbiB3aW5kb3cgZGVzY3JpYmVkIGJlbG93IHN0aWxsIGdpdmVzIGFuIGF1dGhvciBhIHJlbGVhc2Uncwo+IHdhcm5pbmcgYmVmb3JlIGEgcmVhbCBicmVhayBsYW5kcy4gU2VlIFtWZXJzaW9uIGNvbnRyYWN0XSgjdmVyc2lvbi1jb250cmFjdCkuCgojIyBUaGUgc2hhcGUKCkEgbW9kIGlzIGEgKipmb2xkZXIqKiwgYW5kIGl0IG1heSBob2xkIGFzIG11Y2ggYXMgaXQgbmVlZHMgdG86IHNldmVyYWwgc2NyaXB0cywKcmVjb3JkcywgaW1hZ2VzLCBzb3VuZHMsIGRhdGEgb2YgaXRzIG93bi4KCmBgYAptb2RzL215LW1vZC8KICBtYW5pZmVzdC5qc29uCiAgcGx1Z2luLmpzICAgICAgICAgIDwtIHRoZSBlbnRyeSBwb2ludCwgZGVmYXVsdC1leHBvcnRpbmcgYSBwbHVnaW4KICBsaWIvZGljZS5qcyAgICAgICAgPC0gbW9yZSBzY3JpcHRzOyBpbXBvcnQgdGhlbSByZWxhdGl2ZWx5CiAgbGliL2Zvcm1hdC5qcwogIG1vbnN0ZXIuanNvbiAgICAgICA8LSBhIHJlY29yZCBjb250cmlidXRpb24gKG5lZWRzIHRoZSAiY29udGVudCIgZmFjZXQgdG9vKQogIHRpbGVzL29yYy5wbmcgICAgICA8LSBhbiBpbWFnZTogYXdhaXQgY3R4LmFzc2V0VXJsKCJ0aWxlcy9vcmMucG5nIikKICBkYXRhL3NwYXducy5qc29uICAgPC0geW91ciBvd24gZGF0YSAobmVzdGVkIC5qc29uIGlzIGFuIGFzc2V0LCBub3QgYSByZWNvcmQpCiAgUkVBRE1FLm1kCmBgYAoKT25seSBgcGx1Z2luLmpzYCBpcyBsb2FkZWQgYnkgbmFtZS4gRXZlcnl0aGluZyBlbHNlIHlvdXIgY29kZSByZWFjaGVzIGl0c2VsZjoKc2NyaXB0cyBieSBpbXBvcnRpbmcgdGhlbSwgZXZlcnl0aGluZyBlbHNlIHRocm91Z2ggYGN0eC5hc3NldFVybGAuCgpgbWFuaWZlc3QuanNvbmAgbXVzdCBkZWNsYXJlIHRoZSAqKmBwbHVnaW5gIGZhY2V0KiogYW5kIGBtb2RBcGlgLgoKQSBtb2QgdGhhdCBvbmx5IHJ1bnMgY29kZSBjYW4gc2F5IGAic2hhcGUiOiAicGx1Z2luImAgYW5kIHN0b3AgdGhlcmUuIEEgbW9kIHRoYXQKY29udHJpYnV0ZXMgKipib3RoKiogcmVjb3JkcyBhbmQgY29kZSAodGhlIG9yZGluYXJ5IGNhc2UsIGUuZy4gYSBuZXcgbW9uc3RlcgpwbHVzIHRoZSBiZWhhdmlvdXIgdGhhdCBtYWtlcyBpdCBpbnRlcmVzdGluZykgbGlzdHMgYm90aCBmYWNldHM6CgpgYGBqc29uCnsgInNoYXBlIjogImNvbnRlbnQiLCAiZmFjZXRzIjogWyJjb250ZW50IiwgInBsdWdpbiJdIH0KYGBgCgpgZmFjZXRzYCBtdXN0IGNvbnRhaW4gYHNoYXBlYCwgc28gdGhlIHR3byBjYW4gbmV2ZXIgY29udHJhZGljdCBlYWNoIG90aGVyLiBFaXRoZXIKc3BlbGxpbmcgd29ya3MgKGBzaGFwZWAgaXMganVzdCB0aGUgcHJpbWFyeSBraW5kLCBhbmQgd2hhdCB0aGUgbW9kIG1hbmFnZXIKZGlzcGxheXMpLgoKPiBVbnRpbCAyMDI2LTA3LTI5IGBzaGFwZWAgd2FzICoqZXhjbHVzaXZlKiosIGFuZCB0aGUgbG9hZGVyIGdhdGVkIGNvZGUgb24KPiBgInBsdWdpbiJgIHdoaWxlIGNvbXBvc2l0aW9uIGdhdGVkIHJlY29yZHMgb24gYCJjb250ZW50ImAuIEEgZm9sZGVyIGxpa2UgdGhlIG9uZQo+IGFib3ZlIHRoZXJlZm9yZSBjb3VsZCBub3Qgd29yazogZGVjbGFyaW5nIGBwbHVnaW5gIGRyb3BwZWQgYG1vbnN0ZXIuanNvbmAKPiBzaWxlbnRseSwgYW5kIGRlY2xhcmluZyBgY29udGVudGAgcmVmdXNlZCB0aGUgY29kZS4gSWYgeW91IHdyb3RlIGEgbW9kIGFnYWluc3QKPiB0aGUgb2xkZXIgdGV4dCBhbmQgZm91bmQgaGFsZiBvZiBpdCBpbmVydCwgdGhhdCB3YXMgdGhpcywgYW5kIGBmYWNldHNgIGlzIHRoZSBmaXguCgpgYGBqc29uCnsKICAiaWQiOiAibXktbW9kIiwKICAibmFtZSI6ICJNeSBNb2QiLAogICJ2ZXJzaW9uIjogIjEuMC4wIiwKICAic2hhcGUiOiAicGx1Z2luIiwKICAibW9kQXBpIjogMSwKICAiYWZmZWN0c0dhbWVwbGF5IjogdHJ1ZSwKICAiY2FwYWJpbGl0aWVzIjogWyJyZWdpc3RyeTplZmZlY3QiXSwKICAiZGVzY3JpcHRpb24iOiAiV2hhdCB0aGlzIGRvZXMsIGluIHlvdXIgb3duIHdvcmRzLiBUaGUgbW9kIG1hbmFnZXIgc2hvd3MgdGhpcy4iCn0KYGBgCgpgcGx1Z2luLmpzYDoKCmBgYGpzCmV4cG9ydCBkZWZhdWx0IHsKICBhcGk6IDEsCgogIC8vIEJlaGF2aW91cjogZm9sZGVkIGludG8gdGhlIG9uZSBNb2RIb29rcyB0aGUgZW5naW5lIGNvbnN1bHRzLgogIGhvb2tzKGN0eCkgewogICAgaWYgKCFjdHguZmxhZ3MubXlUb2dnbGUpIHJldHVybiB1bmRlZmluZWQ7ICAgLy8gYSBydWxlIHRoZSBwbGF5ZXIgdHVybmVkIG9mZgogICAgcmV0dXJuIHsKICAgICAgbWVzc2FnZVRleHQ6IChyYXcpID0+IHJhdy5yZXBsYWNlKCJZb3UgaGF2ZSIsICJUaG91IGhhc3QiKSwKICAgIH07CiAgfSwKCiAgLy8gU3lzdGVtIG92ZXJyaWRlczogY2FwYWJpbGl0eS1nYXRlZCByZWdpc3RyaWVzLgogIHJlZ2lzdGVyKGhvc3QsIGN0eCkgewogICAgaG9zdC5lZmZlY3RzLnJlZ2lzdGVyKCJNWV9FRkZFQ1QiLCB7CiAgICAgIGhhbmRsZXI6IChjb250ZXh0KSA9PiB7IC8qIHJ1bnMgaW5zaWRlIGVmZmVjdF9kbywgbGl2ZSBzdGF0ZSAqLyByZXR1cm4gdHJ1ZTsgfSwKICAgIH0pOwogIH0sCn07CmBgYAoKRXZlcnkgbWVtYmVyIGlzIG9wdGlvbmFsLCBhbmQgdGhlIHR3byBhYm92ZSBhcmUgb25seSB0aGUgdHdvIG1vc3QgY29tbW9uLiBUaGUKZnVsbCBzZXQgaXMgYGhvb2tzYCwgYHJlZ2lzdGVyYCwgYGNvbnRyb2xsZXJgLCBgZnJvbnRlbmRgLCBgaHVkYCwgYG1lbnVgLApgc2NyZWVuYCBhbmQgYHJlZ2lvbnNgLCBwbHVzIGBtaWdyYXRlQmFnYCBhbmQgYHVuaW5zdGFsbGAuIEEgcGx1Z2luIGlzIHJlZnVzZWQKb25seSB3aGVuIEFMTCBlaWdodCBvZiB0aGUgZmlyc3QgZ3JvdXAgYXJlIGFic2VudCwgYmVjYXVzZSBhIG1vZCB3aXRoIG5vIGNvZGUKc2ltcGx5IHNoaXBzIG5vIGBwbHVnaW4uanNgIC0gc28gYSBwbHVnaW4gd2hvc2Ugb25seSBtZW1iZXIgaXMgYGZyb250ZW5kYCwgb3IKYGNvbnRyb2xsZXJgLCBvciBgcmVnaW9uc2AsIGxvYWRzIGZpbmUuIGBtaWdyYXRlQmFnYCBkZWxpYmVyYXRlbHkgZG9lcyBub3QgY291bnQKYXMgY29kZSBvZiBpdHMgb3duOiBhIHBsdWdpbiB0aGF0IGNhbiBvbmx5IG1pZ3JhdGUgYSBiYWcgaXQgbmV2ZXIgd3JpdGVzIGhhcwpub3RoaW5nIHRvIG1pZ3JhdGUuCgojIyBZb3VyIG93biBzYXZlZCBkYXRhLCBhbmQgY2hhbmdpbmcgaXRzIHNoYXBlCgpZb3UgbWF5IGtlZXAgd2hhdGV2ZXIgSlNPTiB5b3UgbGlrZSBpbiB0aGUgcGxheWVyJ3Mgc2F2ZSwgdW5kZXIgeW91ciBtb2QncyBpZC4KVGhlIGVuZ2luZSByb3VuZC10cmlwcyBpdCB2ZXJiYXRpbSBhbmQgbmV2ZXIgcmVhZHMgaXQuIEl0IGlzIHN0b3JlZCB3aXRoIGEKYHNjaGVtYWAgbnVtYmVyLCB3aGF0ZXZlciB5b3VyIG1hbmlmZXN0J3MgYHNhdmVTY2hlbWFgIHdhcyB3aGVuIGl0IHdhcyB3cml0dGVuLgoKKipUaGUgYmFnIGlzIG5vdCBvbiBgY3R4LnN0YXRlYC4qKiBgR2FtZVN0YXRlYCBkb2VzIG5vdCBjYXJyeSB0aGUgYmFncyBhdCBhbGw7CnRoZXkgbGl2ZSBvbiB0aGUgYFN0YXJ0ZWRHYW1lYCB0aGUgaG9zdCBob2xkcywgd2hpY2ggaXMgd2hhdCBgc2F2ZUdhbWVgIHJlYWRzLgpZb3VyIGhhbmRsZSBvbiB5b3VyIG93biBiYWcgaXMgdGhlIGBkYXRhYCBhcmd1bWVudCBgbWlncmF0ZUJhZ2AgaXMgZ2l2ZW4sIGFuZCB0aGUKdmFsdWUgdGhlIGhvc3Qgd3JpdGVzIGJhY2sgZm9yIHlvdS4gUmVhY2hpbmcgZm9yIGBjdHguc3RhdGUubW9kc2AgZmluZHMgbm90aGluZywKYmVjYXVzZSB0aGVyZSBpcyBubyBzdWNoIGZpZWxkLgoKV2hlbiB5b3UgY2hhbmdlIHRoZSBTSEFQRSBvZiB0aGF0IGRhdGEsIGJ1bXAgYHNhdmVTY2hlbWFgIGFuZCBzaGlwIGEKYG1pZ3JhdGVCYWdgOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICBob29rcyhjdHgpIHsgLyogLi4uICovIH0sCgogIC8vIENhbGxlZCBhdCBtb2QtbG9hZCB0aW1lLCBCRUZPUkUgcmVnaXN0ZXIoKSwgd2hlbiB0aGUgYmFnIGluIHRoZSBzYXZlIGlzCiAgLy8gYmVoaW5kIHlvdXIgbWFuaWZlc3QncyBzYXZlU2NoZW1hLiBSZXR1cm4gdGhlIHNhbWUgZGF0YSBpbiB0aGUgbmV3IHNoYXBlLgogIG1pZ3JhdGVCYWcoZGF0YSwgZnJvbVNjaGVtYSwgY3R4KSB7CiAgICBpZiAoZnJvbVNjaGVtYSA8IDIpIHJldHVybiB7IGtpbGxzOiBPYmplY3Qua2V5cyhkYXRhLmtpbGxlZCA/PyB7fSkubGVuZ3RoIH07CiAgICByZXR1cm4gZGF0YTsKICB9LAp9OwpgYGAKCk9ubHkgeW91IGNhbiBkbyB0aGlzOiBub2JvZHkgZWxzZSBrbm93cyB3aGF0IGlzIGluIHRoZXJlLiBXaGF0IHRoZSBnYW1lIGRvZXMKYXJvdW5kIGl0OgoKfCBTaXR1YXRpb24gfCBXaGF0IGhhcHBlbnMgfAp8LS0tfC0tLXwKfCBiYWcgYmVoaW5kIGBzYXZlU2NoZW1hYCwgYG1pZ3JhdGVCYWdgIHByZXNlbnQgfCBpdCBydW5zLCBhbmQgdGhlIHNjaGVtYSBpcyBzdGFtcGVkIGZvcndhcmQgfAp8IGJhZyBiZWhpbmQgYHNhdmVTY2hlbWFgLCAqKm5vKiogYG1pZ3JhdGVCYWdgIHwgdGhlIG9sZCBkYXRhIGlzIGtlcHQgKipleGFjdGx5IGFzIGl0IHdhcyoqLCBhbmQgdGhlIHBsYXllciBpcyB0b2xkIHlvdXIgbW9kIGhhcyBkYXRhIGl0IG1heSBub3QgdW5kZXJzdGFuZC4gVGhlIHNjaGVtYSBpcyAqbm90KiBzdGFtcGVkIGZvcndhcmQsIHNvIHlvdSB3b3VsZCBiZSBoYW5kZWQgb2xkIGRhdGEgbGFiZWxsZWQgbmV3IHwKfCBgbWlncmF0ZUJhZ2AgdGhyb3dzLCBvciByZXR1cm5zIG5vdGhpbmcgfCB0aGUgb2xkIGJhZyBzdGFuZHMsIGFuZCB0aGUgcmVhc29uIGdvZXMgb24geW91ciBtb2QncyByb3cgfAp8IGJhZyAqKmFoZWFkKiogb2YgYHNhdmVTY2hlbWFgICh0aGUgcGxheWVyIHJvbGxlZCB5b3UgYmFjaykgfCBub3RoaW5nIGlzIGNoYW5nZWQsIGFuZCB0aGUgcGxheWVyIGlzIHRvbGQuIEEgbWlncmF0aW9uIGJhY2t3YXJkcyBpcyBzb21ldGhpbmcgb25seSB5b3UgY291bGQgd3JpdGUgfAp8IHlvdSBkZWNsYXJlIG5vIGBzYXZlU2NoZW1hYCB8IG5vdGhpbmcgaGFwcGVucywgZXZlciB8CgpJZiB5b3Ugd291bGQgcmF0aGVyIGJyYW5jaCBvbiB0aGUgc2NoZW1hIGlubGluZSB0aGFuIHNoaXAgYSBtaWdyYXRvciwgeW91IGNhbjoKdGhlIGJhZyBjYXJyaWVzIGl0cyBvd24gYHNjaGVtYWAgYW5kIHlvdSBjYW4gcmVhZCBpdC4gT21pdHRpbmcgYG1pZ3JhdGVCYWdgCiphZnRlciogYnVtcGluZyBgc2F2ZVNjaGVtYWAgaXMgdGhlIGNhc2UgdGhlIGdhbWUgcmVwb3J0cywgYmVjYXVzZSBpdCBjYW5ub3QgdGVsbAp0aGF0IGFwYXJ0IGZyb20gYW4gb3ZlcnNpZ2h0LgoKIyMgV2h5IHRoZSBlbmdpbmUgaXMgbm90IGltcG9ydGVkCgpgY3R4LmNvcmVgICoqaXMqKiB0aGUgZW5naW5lOiB0aGUgc2FtZSBsaXZlIG1vZHVsZSBpbnN0YW5jZSB0aGUgZ2FtZSBpcyBydW5uaW5nCm9uLCBwYXNzZWQgaW4gcmF0aGVyIHRoYW4gaW1wb3J0ZWQuCgpUaGlzIGlzIG5vdCBhIGxpbWl0YXRpb24sIGl0IGlzIHRoZSBwb2ludC4gQSBiYXJlIHNwZWNpZmllciBsaWtlCmBpbXBvcnQgeyB0dW5uZWxBdXggfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1jb3JlImAgY2Fubm90IHJlc29sdmUgaW4gYSBtb2R1bGUgZmV0Y2hlZApmcm9tIGEgZm9sZGVyLCBhbmQgYnVuZGxpbmcgdGhlIGVuZ2luZSBpbnRvIHlvdXIgcGx1Z2luIHdvdWxkIGdpdmUgeW91IHlvdXIgKm93bioKY29weSBvZiBldmVyeSByZWdpc3RyeSBhbmQgc2luZ2xldG9uOiB5b3VyIGVmZmVjdCBoYW5kbGVyIHdvdWxkIGxhbmQgb24gYSByZWdpc3RyeQp0aGUgaW50ZXJwcmV0ZXIgbmV2ZXIgY29uc3VsdHMsIGFuZCB5b3VyIG1vZCB3b3VsZCBhcHBlYXIgdG8gZG8gbm90aGluZyBhdCBhbGwsCndpdGggbm8gZXJyb3IgYW55d2hlcmUuIE9uZSBpbnN0YW5jZSwgcGFzc2VkIGluLCBtYWtlcyB0aGF0IGZhaWx1cmUgaW1wb3NzaWJsZS4KCldoYXQgYGN0eGAgY2FycmllczoKCnwgRmllbGQgfCBXaGF0IGl0IGlzIHwKfC0tLXwtLS18CnwgYGlkYCB8IHlvdXIgbW9kJ3MgaWQsIHdoaWNoIGlzIGFsc28gaXRzIGZvbGRlciBuYW1lIHwKfCBgYXBpYCB8IHRoZSBBQkkgdmVyc2lvbiB0aGUgKipob3N0KiogaW1wbGVtZW50cyB8CnwgYGVuZ2luZWAgfCB0aGUgZW5naW5lIHZlcnNpb24sIGlmIHlvdSB3YW50IHRvIGFkYXB0IHJhdGhlciB0aGFuIHJlZnVzZSB8CnwgYGZsYWdzYCB8ICoqeW91cioqIHJlc29sdmVkIHJ1bGUgdG9nZ2xlczogYGNob2ljZXNbZmxhZ10gPz8gcnVsZS5kZWZhdWx0YCwgc2xpY2VkIHRvIHRoZSBydWxlcyB5b3VyIG93biBtYW5pZmVzdCBkZWNsYXJlcyB8CnwgYGNvcmVgIHwgdGhlIGxpdmUgZW5naW5lIG5hbWVzcGFjZTogY29yZSdzIGVudGlyZSBwdWJsaWMgQVBJIHwKfCBgc3RhdGVgIHwgdGhlIGxpdmUgYEdhbWVTdGF0ZWAuIEhhbmRlZCB0byBgcmVnaXN0ZXJgLCBgbWlncmF0ZUJhZ2AsIGBjb250cm9sbGVyYCBhbmQgZXZlcnkgZGlzcGxheSBzZWFtOyAqKm5ldmVyKiogdG8gYGhvb2tzYCwgYmVjYXVzZSB0aGUgaG9zdCBjb21wb3NlcyBob29rcyBiZWZvcmUgYSBnYW1lIGV4aXN0cyB8CnwgYGFzc2V0VXJsYCB8IGAocGF0aCkgPT4gUHJvbWlzZTxzdHJpbmcgXHwgbnVsbD5gLCBhIFVSTCBmb3Igb25lIG9mICp5b3VyKiBmaWxlcyB8CnwgYGRhdGFgIHwgeW91ciBvd24gcmVjb3JkIGZpbGVzLCBwYXJzZWQsIGtleWVkIHdpdGhvdXQgYC5qc29uYCB8CnwgYHByZWZzYCB8IGB7IGdldCgpLCBzZXQodmFsdWUpIH1gLCBvbmUgSlNPTiB2YWx1ZSBvZiAqKnlvdXJzKiosIGtlcHQgb3V0c2lkZSBldmVyeSBzYXZlIHwKfCBgbmV3Q2hhcmFjdGVyYCB8IHdoZXRoZXIgdGhpcyBzZXNzaW9uJ3MgY2hhcmFjdGVyIHdhcyBqdXN0IGNyZWF0ZWQsIHJhdGhlciB0aGFuIGxvYWRlZCB8CnwgYHJlZ2lzdHJpZXNgIHwgdGhlIHdob2xlIGJvdW5kIGBDb3JlUmVnaXN0cmllc2A6IGV2ZXJ5IHJhY2UsIGtpbmQsIGZlYXR1cmUsIHRyYXAsIHN0b3JlLCBwcm9qZWN0aW9uLCByb29tLCBwcm9maWxlLCBjb25zdGFudCwgcXVlc3QgYW5kIGhpbnQgdGhpcyBzZXNzaW9uIGFjdHVhbGx5IHJ1bnMgb24gKGFic2VudCBkdXJpbmcgY29udGVudCBjb21wb3NpdGlvbikgfAp8IGBsb2dgIHwgYSBkaWFnbm9zdGljIGxpbmU7IHRoZSBob3N0IGRlY2lkZXMgd2hlcmUgaXQgZ29lcyB8CnwgYGJhY2t1cEZvbGRlcmAgfCBwcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBiYWNrdXA6Zm9sZGVyYCBhbmQgdGhlIHBsYXRmb3JtIGNhbiBhY3R1YWxseSBvZmZlciBhIGZvbGRlciBwaWNrZXI7IGFic2VudCBldmVyeXdoZXJlIGVsc2UsIHNvIHRlc3QgZm9yIGl0IHJhdGhlciB0aGFuIGFzc3VtaW5nIGl0IHwKfCBgZGVidWdgIHwgYHsgc3Bhd25PYmplY3Qoa2luZCksIHNwYXduTW9uc3RlcihyYWNlKSB9YCwgY29uanVyaW5nIG9uZSBpdGVtIG9yIGNyZWF0dXJlIGludG8gdGhlIGxpdmUgZ2FtZS4gUHJlc2VudCBvbmx5IHdoZW4geW91ciBtYW5pZmVzdCBkZWNsYXJlZCBgZGVidWc6c3Bhd25gIGFuZCB0aGVyZSBpcyBhIGdhbWUgdG8gY29uanVyZSBpbnRvLiBUaGUgKipmaXJzdCoqIHVzZSBpbiBhIGNoYXJhY3RlciBhc2tzIHRoZSBnYW1lJ3Mgb3duIGRlYnVnIHF1ZXN0aW9uIGFuZCBtYXJrcyB0aGF0IGNoYXJhY3RlciBwZXJtYW5lbnRseSwgc28gdGVsbCB0aGUgcGxheWVyIGJlZm9yZSB0aGV5IHByZXNzIHlvdXIgYnV0dG9uIHwKfCBgd2l6YXJkYCB8IHRoZSBnYW1lJ3Mgd2hvbGUgZGVidWcgc2V0IC0gZGVwdGgsIGV4cGVyaWVuY2UsIGdvbGQsIHN0YXRzLCBhY3F1aXJlbWVudCwgbWFwcGluZywgcGx1cyBhIGNhdGFsb2d1ZSBvZiBldmVyeSBpdGVtLCBjcmVhdHVyZSBhbmQgYXJ0aWZhY3QgdGhpcyBnYW1lIGhhcyBhbmQgd2hpY2ggcGFjayBhZGRlZCBlYWNoLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBkZWJ1Zzp3aXphcmRgIGFuZCB0aGVyZSBpcyBhIGdhbWUgdG8gZHJpdmUuICoqRXZlcnkgbWV0aG9kIHJlZnVzZXMgdW50aWwgeW91IGNhbGwgYHNhbmRib3goKWAqKiwgd2hpY2ggY3V0cyB0aGUgc2Vzc2lvbiBsb29zZSBmcm9tIGl0cyBzYXZlIHNsb3QgYW5kIGNhbm5vdCBiZSB1bmRvbmU6IHRoZSBjaGFyYWN0ZXIgb24gZGlzayBrZWVwcyB3aGF0ZXZlciB0aGUgbGFzdCBzYXZlIGxlZnQsIGFuZCBub3RoaW5nIGFmdGVyIHRoYXQgaXMgd3JpdHRlbi4gQ2FsbCBgYXR0YWNoZWQoKWAgZmlyc3QgdG8gZ2V0IHRoZSBuYW1lIGZvciB0aGUgcXVlc3Rpb24geW91IHB1dCB0byB0aGUgcGxheWVyLiBTZWUgYE1PRF9TRUFNUy5tZGAgc2VjdGlvbiA0ZiB8CnwgYGluc3RhbGxNb2RgIHwgYChieXRlcykgPT4gUHJvbWlzZTx7b2ssIGlkLCB2ZXJzaW9uLCBsaW5lc30gXHwge29rLCBwcm9ibGVtLCBsaW5lc30+YCwgaW5zdGFsbGluZyBhICoqY29udGVudCoqIG1vZCBmcm9tIHRoZSBieXRlcyBvZiBhbiBhcmNoaXZlLiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBtb2Q6aW5zdGFsbGAuIENvZGUgaXMgcmVmdXNlZCwgYW5kIHdoYXQgeW91IGluc3RhbGwgbGFuZHMgKipzd2l0Y2hlZCBvZmYqKiAtIHRoZSBwbGF5ZXIgZW5hYmxlcyBpdCB0aGVtc2VsdmVzLCBhbmQgYSBtb2QgdGFrZXMgZWZmZWN0IG9uIHJlbG9hZC4gYGxpbmVzYCBpcyB0aGUgd29yZGluZyB0aGUgTW9kcyBzY3JlZW4gcHJpbnRzIGZvciB0aGUgc2FtZSBvdXRjb21lLCBwZXItcmVxdWlyZW1lbnQgcm93cyBhbmQgYWxsOyBwcmludCBpdCByYXRoZXIgdGhhbiB3cml0aW5nIGEgc2Vjb25kIHZvY2FidWxhcnkgZm9yIG9uZSBjb25jZXB0IHwKfCBgcmVsb2FkR2FtZWAgfCBgKCkgPT4gUHJvbWlzZTx2b2lkPmAsIHRoZSBnYW1lJ3Mgb3duIG1vZC1jaGFuZ2UgcmVsb2FkOiBldmVyeSBwbHVnaW4ncyBgdW5pbnN0YWxsKClgLCB0aGUgYXV0b3BsYXllcidzIGtleWJvYXJkIGhhbmRlZCBiYWNrLCB0aGUgbGl2ZSBjaGFyYWN0ZXIgd3JpdHRlbiBkb3duLCBhbmQgdGhlIHNlc3Npb24gcmVzdW1lZCBvbiB0aGF0IGNoYXJhY3Rlci4gUHJlc2VudCBvbiBleGFjdGx5IHRoZSB0ZXJtcyBgaW5zdGFsbE1vZGAgaXMsIGJlY2F1c2UgaW5zdGFsbGluZyBzb21ldGhpbmcgdGhlIHByb2Nlc3Mgd2lsbCBuZXZlciBsb2FkIGlzIGhhbGYgYW4gYWN0LiBOb3QgYSBwZXJtaXNzaW9uIC0gYSBwbHVnaW4gcmVhY2hlcyBgbG9jYXRpb25gIHJlZ2FyZGxlc3MgLSBidXQgYGxvY2F0aW9uLnJlbG9hZCgpYCBza2lwcyBhbGwgZm91ciBzdGVwcywgYW5kIHRoZSB0aGlyZCBpcyB0aGUgcGxheWVyJ3MgcHJvZ3Jlc3MgfAp8IGBsb2FkTW9kRm9yU2Vzc2lvbmAgfCBgKGJ5dGVzKSA9PiBQcm9taXNlPHtvaywgaWQsIHZlcnNpb24sIHN1cnZpdmVzUmVsb2FkfSBcfCB7b2ssIHByb2JsZW19PmAsIGxvYWRpbmcgYSAqKmNvbnRlbnQqKiBtb2QgZm9yIHRoaXMgc2Vzc2lvbiBvbmx5LiBQcmVzZW50IG9ubHkgd2hlbiB5b3VyIG1hbmlmZXN0IGRlY2xhcmVkIGBtb2Q6c2Vzc2lvbmAuIENvZGUgaXMgcmVmdXNlZCBvbiB0aGUgc2FtZSB0ZXJtcy4gSXQgaXMgKipvbioqIGZyb20gdGhlIG5leHQgcmVsb2FkIHJhdGhlciB0aGFuIHdhaXRpbmcgdG8gYmUgc3dpdGNoZWQgb24sIGFuZCB0aGUgYXJjaGl2ZSBpcyBmb3Jnb3R0ZW4gd2hlbiB0aGUgZ2FtZSBjbG9zZXMgLSBidXQgd2hhdCBpdCBkaWQgdG8gYSBjaGFyYWN0ZXIgaXMgbm90LiBTYXkgdGhhdCB0byB0aGUgcGxheWVyIHwKfCBgdWlgIHwgYHsgb3BlblBhbmVsKHNwZWMpLCBvcGVuUGFuZWxzIH1gLCBwYW5lbHMgb2YgKipyZWFsIEhUTUwqKiByYXRoZXIgdGhhbiBjaGFyYWN0ZXIgY2VsbHMuIFByZXNlbnQgb25seSB3aGVuIHlvdXIgbWFuaWZlc3QgZGVjbGFyZWQgYHVpOnBhbmVsLm1vdW50YDsgYWJzZW50IGV2ZXJ5d2hlcmUgZWxzZSwgc28gdGVzdCBmb3IgaXQuIFNlZSBgTU9EX1NFQU1TLm1kYCBzZWN0aW9uIDRiIC0gdGhlIHR3byB0aGluZ3MgdGhhdCBzdXJwcmlzZSBldmVyeWJvZHkgYXJlIHRoYXQgRXNjYXBlIGlzIHRoZSBwbGF5ZXIncyBhbmQgdGhhdCBhIG5vbi1tb2RhbCBwYW5lbCdzIGNvbnRhaW5lciB0YWtlcyBubyBwb2ludGVyIGV2ZW50cyB8CgpgZmxhZ3NgIGlzIHNsaWNlZCBwZXIgbW9kIG9uIHB1cnBvc2U6IGEgbW9kIG11c3Qgbm90IGJlIGFibGUgdG8gcmVhZCBvciBhY3Qgb24KYW5vdGhlciBtb2QncyB0b2dnbGVzLCBvciBpdHMgYmVoYXZpb3VyIHdvdWxkIHNpbGVudGx5IGRlcGVuZCBvbiB3aGljaCBvdGhlciBtb2RzCnRoZSBwbGF5ZXIgaGFwcGVuZWQgdG8gZW5hYmxlLgoKIyMjIGBzdGF0ZWAgaXMgYWJzZW50IGluIGBob29rc2AsIGFuZCBpdCBhbHdheXMgd2lsbCBiZQoKVGhlIHJvdyBhYm92ZSBpcyBlYXN5IHRvIHNraW0gcGFzdCBhbmQgaXQgaXMgbG9hZC1iZWFyaW5nLiBUaGUgaG9zdCBjb21wb3NlcwpldmVyeSBlbmFibGVkIG1vZCdzIGhvb2tzICoqYmVmb3JlIGl0IHN0YXJ0cyB0aGUgZ2FtZSoqLCBiZWNhdXNlIHRoZSBjb21wb3NlZApgTW9kSG9va3NgIGlzIGFuIGFyZ3VtZW50IHRvIGBzdGFydEdhbWVgLCBzbyB0aGVyZSBpcyBubyBgR2FtZVN0YXRlYCB0byBoYW5kIHlvdQp5ZXQsIGFuZCB0aGVyZSBuZXZlciBjYW4gYmUuIGBob29rcyhjdHgpYCBpcyBhIGZhY3Rvcnkgb3ZlciB5b3VyIGZsYWdzOyBhbnl0aGluZwpuZWVkaW5nIHRoZSBsaXZlIGdhbWUgYmVsb25ncyBpbiBgcmVnaXN0ZXIoaG9zdCwgY3R4KWAsIHdoaWNoIHJ1bnMgb25jZSB3aXRoIHRoZQpnYW1lIGJ1aWx0LgoKSWYgeW91IG5lZWQgdGhlIGVuZ2luZSBhdCBgaG9va3NgIHRpbWUgZm9yIHNvbWV0aGluZyB0aGF0IGlzIG5vdCB0aGUgbGl2ZSBnYW1lCihjbGFzc2lmeWluZyBvcHRpb24gbmFtZXMsIHJlYWRpbmcgYSBjb25zdGFudCksIGBjdHguY29yZWAgaXMgdGhlcmUgYW5kIGlzIHRoZQpzYW1lIG1vZHVsZSBpbnN0YW5jZSB0aGUgZ2FtZSBydW5zIG9uLgoKIyMjIGByZWdpc3RyaWVzYCBpcyB0aGUgY29udGVudCwgd2hlcmUgYHN0YXRlYCBpcyB0aGUgbGV2ZWwKClRoZXNlIHR3byBhcmUgZWFzeSB0byBjb25mdXNlIGFuZCB0aGUgZGlmZmVyZW5jZSBkZWNpZGVzIHdoZXRoZXIgYSB3aG9sZSBjbGFzcyBvZgptb2QgY2FuIGJlIHdyaXR0ZW4gYXQgYWxsLgoKYHN0YXRlYCBpcyAqKnRoaXMgbGV2ZWwqKjogdGhlIG1vbnN0ZXJzIHN0YW5kaW5nIG9uIGl0LCB0aGUgb2JqZWN0cyBseWluZyBvbiBpdCwKdGhlIHBsYXllci4gSXQgaXMgd2hhdCB5b3UgcmVhZCB0byBkcmF3IGEgZnJhbWUgb3IgdG8gYW5zd2VyIGEgcXVlc3Rpb24gYWJvdXQKc29tZXRoaW5nIGluIGZyb250IG9mIHRoZSBwbGF5ZXIgcmlnaHQgbm93LgoKYHJlZ2lzdHJpZXNgIGlzICoqd2hhdCB0aGUgZ2FtZSBpcyBtYWRlIG9mKio6IGByZWdpc3RyaWVzLm1vbnN0ZXJzLnJhY2VzYCBpcyBldmVyeQpyYWNlIHRoZSBwYWNrIGRlZmluZXMsIGF0IGl0cyByZWFsIGByaWR4YDsgYHJlZ2lzdHJpZXMub2JqZWN0cy5raW5kc2AgaXMgZXZlcnkKb2JqZWN0IGtpbmQsIGF0IGl0cyByZWFsIGBraWR4YDsgYW5kIGZlYXR1cmVzLCB0cmFwcywgc3RvcmVzIGFuZCBwcm9qZWN0aW9ucyBhcmUKdGhlcmUgb24gdGhlIHNhbWUgdGVybXMuIFlvdSBuZWVkIGl0IHdoZW5ldmVyIHlvdXIgcXVlc3Rpb24gaXMgYWJvdXQgYSB0aGluZyBieQpJTkRFWCByYXRoZXIgdGhhbiBieSBwcmVzZW5jZSAtIHdoYXQgYSBjcmVhdHVyZSB5b3UgYXJlIG1lcmVseSByZW1lbWJlcmluZyBjYW4gZG8sCndoYXQgYW4gaXRlbSB5b3UgaGF2ZSBuZXZlciBzZWVuIGlzIHdvcnRoLCB3aGljaCBraW5kcyBzaGFyZSBhIGB0dmFsYC4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHJhY2VzID0gY3R4LnJlZ2lzdHJpZXM/Lm1vbnN0ZXJzLnJhY2VzOwogIGlmICghcmFjZXMpIHJldHVybjsgICAgICAgICAgICAgICAgIC8vIGNvbXBvc2l0aW9uIHRpbWUsIG9yIGFuIG9sZGVyIGhvc3QKICBjb25zdCBieVJpZHggPSBuZXcgTWFwKHJhY2VzLm1hcCgocikgPT4gW3IucmlkeCwgcl0pKTsKfQpgYGAKClRocmVlIHRoaW5ncyBhYm91dCBpdDoKCi0gKipJdCBpcyB0aGUgd2hvbGUgYENvcmVSZWdpc3RyaWVzYCwgbm90IGEgY3VyYXRlZCBzbGljZSoqLCBmb3IgdGhlIHJlYXNvbgogIGBjdHguY29yZWAgaXMgdGhlIHdob2xlIG5hbWVzcGFjZTogYSBjdXJhdGVkIGxpc3QgaXMgdGhlIHRoaW5nIHRoYXQgZHJpZnRzLiBTZWUKICBNT0RfQ09NUEFUSUJJTElUWS5tZCBkZWNpc2lvbiAxOC4KLSAqKkEgbW9kJ3MgY29udGVudCBpcyBpbiBpdCBvbiBleGFjdGx5IHRoZSBzYW1lIHRlcm1zIGFzIGNvcmUncy4qKiBCaW5kaW5nIHJ1bnMKICBhZnRlciBldmVyeSBlbmFibGVkIG1vZCBoYXMgY29tcG9zZWQgaXRzIGNvbnRlbnQsIGFuZCBtb2RzIGFwcGVuZCwgc28gYSBtb25zdGVyCiAgYSBtb2QgYWRkZWQgaXMgYSBgTW9uc3RlclJhY2VgIGF0IGEgcmVhbCBgcmlkeGAgYW5kIGFuIGl0ZW0gYSBtb2QgYWRkZWQgaXMgYW4KICBgT2JqZWN0S2luZGAgYXQgYSByZWFsIGBraWR4YC4gTm90aGluZyBpbiBhIGxvb2t1cCBkaXN0aW5ndWlzaGVzIHRoZW07IHRoZSBvbmx5CiAgbWFya2VyIGlzIHRoZSBvcHRpb25hbCBgZnJvbWAgcHJvdmVuYW5jZSBmaWVsZCwgYW5kIG1vc3QgY29uc3VtZXJzIHNob3VsZCBub3QKICByZWFkIGl0LiAqKlRoaXMgaXMgd2hhdCBtYWtlcyBtb2RkZWQgY29udGVudCB3b3JrIHRoZSBzYW1lIGFzIHZhbmlsbGEgY29udGVudAogIHdpdGhvdXQgYW55Ym9keSBhcnJhbmdpbmcgaXQqKiAtIHRoZSBhbHRlcm5hdGl2ZSBpcyBldmVyeSBjb25zdW1lciBrZWVwaW5nIGl0cwogIG93biB0YWJsZSBvZiBjb3JlJ3MgY29udGVudCBhbmQgc2lsZW50bHkgaWdub3JpbmcgZXZlcnl0aGluZyBhIG1vZCBhZGRlZC4KLSAqKkd1YXJkIGl0LioqIEl0IGlzIGFic2VudCBkdXJpbmcgY29udGVudCBjb21wb3NpdGlvbiAoYXQgdGhhdCBwb2ludCB0aGlzIGlzCiAgd2hhdCBpcyBiZWluZyBidWlsdCkgYW5kIGFic2VudCBvbiBhbnkgaG9zdCBvbGRlciB0aGFuIDIwMjYtMDgtMjEsIHNvCiAgYGlmICghY3R4LnJlZ2lzdHJpZXMpIHJldHVybjtgIGlzIHRoZSBzaGFwZSwgdGhlIHNhbWUgb25lIGBjdHguYmFja3VwRm9sZGVyYAogIHVzZXMuCi0gKipJdCBpcyB0aGUgUkVBRCBzZWFtLCBhbmQgaXQgaXMgbm90IHJlYWQtb25seS4qKiBUaGVzZSBhcmUgdGhlIGxpdmUgb2JqZWN0cwogIHRoZSBlbmdpbmUgcnVucyBvbiwgc28gYHJlZ2lzdHJpZXMucm9vbXNgLCBgcmVnaXN0cmllcy5wcm9maWxlc2AgYW5kCiAgYHJlZ2lzdHJpZXMucm9vbXMuZ2x5cGhzYCBjYXJyeSB0aGUgc2FtZSBtdXRhdG9ycyB0aGUgY2FwYWJpbGl0eS1nYXRlZCBmYWNhZGVzCiAgd3JpdGUgdGhyb3VnaC4gVXNlIHRoZSBmYWNhZGUgYW5kIGRlY2xhcmUgdGhlIGNhcGFiaWxpdHk6IHNlZQogIFtXaGF0IGEgY2FwYWJpbGl0eSBnYXRlcywgYW5kIHdoYXQgaXQgZG9lcyBub3RdKCN3aGF0LWEtY2FwYWJpbGl0eS1nYXRlcy1hbmQtd2hhdC1pdC1kb2VzLW5vdCkKICBmb3Igd2h5IHRoZSBnYXRlIGNhbm5vdCBzdG9wIHlvdSBhbmQgd2h5IGRlY2xhcmluZyBzdGlsbCBtYXR0ZXJzLgoKIyMjIEF1dGhvcmluZzogYGN0eC5hdXRob3JpbmdgIGFuZCBgY3R4LmNvbXBvc2VkUmVjb3Jkc2AKCkZvciBhIG1vZCB0aGF0IFdSSVRFUyBjb250ZW50IHJhdGhlciB0aGFuIG9uZSB0aGF0IHBsYXlzIGl0LiBBIHRvb2wgdGhhdCBoZWxwcyBhbgphdXRob3IgZHJhZnQgYSBtb25zdGVyIG5lZWRzIHR3byB0aGluZ3MgdGhlIHNlYW1zIGFib3ZlIGNhbm5vdCBnaXZlIGl0OiB0aGUKZnVuY3Rpb25zIHRoYXQga25vdyB3aGF0IGEgd2VsbC1mb3JtZWQgcmVjb3JkIGxvb2tzIGxpa2UsIGFuZCB0aGUgcmVjb3JkcyB0aGUKZ2FtZSB3YXMgYWN0dWFsbHkgY29tcG9zZWQgZnJvbS4KCmBjdHguYXV0aG9yaW5nYCBpcyB0aGUgbW9kIFNESydzIHB1YmxpYyBiYXJyZWwsIGxpdmUgYW5kIGFsd2F5cyBwcmVzZW50LgpgUkVDT1JEX0JMVUVQUklOVFNgIGFuZCBgYmx1ZXByaW50Rm9yYCBjYXJyeSBldmVyeSBmaWVsZCdzIG1lYXN1cmVkIHNoYXBlLCB0eXBlCnNldCBhbmQgcmFuZ2U7IGBmaWVsZFVzYWdlYCBhbmQgYHJlcXVpcmVkRmllbGRzYCBzYXkgaG93IGNvbW1vbiBhIGZpZWxkIGlzOwpgcGVlcnNGb3JgIGJ1aWxkcyBhIHRhYmxlIG9mIGNvbXBhcmFibGUgcmVjb3JkcyB3aXRoIHRoZSBzZW50ZW5jZSBzYXlpbmcgd2h5IHRoZXkKYXJlIGNvbXBhcmFibGU7IGBzdWdnZXN0RmllbGRzYCBwcm9wb3NlcyBhIHZhbHVlIHdpdGggaXRzIHJlYXNvbjsgYGNoZWNrUmVjb3Jkc2AKYW5kIGBDT01QQU5JT05fUlVMRVNgIHZhbGlkYXRlIGF0IHRoZSB0aHJlZSBsZXZlbHMgdGhlIHJ1bm5pbmcgZ2FtZSB1c2VzOyBhbmQKYE1vZFByb2plY3RgIGFzc2VtYmxlcyBhbmQgZW1pdHMgYSBtb2QgZm9sZGVyLiBJdCBpcyB1bmdhdGVkLCBiZWNhdXNlIHRoZXNlIGFyZQpwdXJlIGZ1bmN0aW9ucyBvdmVyIGRhdGEgeW91IHBhc3MgdGhlbS4KCmBjdHguY29tcG9zZWRSZWNvcmRzYCBpcyB0aGUgVU5CT1VORCB0d2luIG9mIGBjdHgucmVnaXN0cmllc2A6IGV2ZXJ5IHJlY29yZCB0aGUKcnVubmluZyBnYW1lIGNvbXBvc2VkLCBhcyBKU09OLCBrZXllZCBieSBwYWNrLWZpbGUgc3RlbSB3aXRoIG5vIGV4dGVuc2lvbi4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGNvbnN0IHJlY29yZHMgPSBjdHguY29tcG9zZWRSZWNvcmRzOwogIGlmICghcmVjb3JkcykgcmV0dXJuOyAgICAgICAgICAgICAgIC8vIGNvbXBvc2l0aW9uIHRpbWUsIG9yIGFuIG9sZGVyIGhvc3QKICBjb25zdCB7IHBlZXJzLCBiZWNhdXNlIH0gPSBjdHguYXV0aG9yaW5nLnBlZXJzRm9yKAogICAgIm1vbnN0ZXIiLAogICAgeyBuYW1lOiAiV2FyZyBtYXRyaWFyY2giLCBiYXNlOiAiY2FuaW5lIiwgZGVwdGg6IDIyIH0sCiAgICByZWNvcmRzLAogICk7CiAgY3R4LmxvZyhgJHtwZWVycy5sZW5ndGh9IGNvbXBhcmFibGUgbW9uc3RlcnM6ICR7YmVjYXVzZX1gKTsKfQpgYGAKCi0gKipVc2UgYGNvbXBvc2VkUmVjb3Jkc2AsIG5vdCBgcmVnaXN0cmllc2AsIGZvciBhbnl0aGluZyB0aGUgU0RLIHRha2VzLioqIEV2ZXJ5CiAgYHJlY29yZHNgIHBhcmFtZXRlciBpbiB0aGUgYXV0aG9yaW5nIGZ1bmN0aW9ucyBpcyBrZXllZCBieSBmaWxlIHN0ZW0gYW5kIGhvbGRzCiAgcmF3IEpTT04uIGByZWdpc3RyaWVzLm1vbnN0ZXJzLnJhY2VzYCBpcyBib3VuZDogdGhlIGJpbmRlciByZXNvbHZlZCBgYmFzZWAgaW50bwogIGEgcG9pbnRlciBhbmQgZHJvcHBlZCB0aGUgc3RyaW5nLCBzbyBhIHBlZXIgdGFibGUgZ3JvdXBlZCBvbiBgYmFzZWAgY2Fubm90IGJlCiAgYnVpbHQgZnJvbSBpdCwgYW5kIG5laXRoZXIgY2FuIGEgcXVlc3Rpb24gYWJvdXQgYSBmaWVsZCB0aGF0IGJvdW5kIHRvIG5vdGhpbmcuCi0gKipNb2QtYWRkZWQgcmVjb3JkcyBhcmUgaW4gaXQgb24gdGhlIHNhbWUgdGVybXMgYXMgY29yZSdzKiosIGV4YWN0bHkgYXMgdGhleQogIGFyZSBpbiBgcmVnaXN0cmllc2AsIGVhY2ggY2FycnlpbmcgaXRzIHByb3ZlbmFuY2UuIEEgZHJhZnQgYmFzZWQgb24gYW5vdGhlcgogIG1vZCdzIHN3b3JkIGhhcyBhY3F1aXJlZCBhIGRlcGVuZGVuY3ksIGFuZCB0aGlzIGlzIHdoYXQgbGV0cyB5b3Ugc2VlIHRoYXQgYXQKICB0aGUgbW9tZW50IHRoZSBiYXNlIGlzIGNob3NlbiByYXRoZXIgdGhhbiBhdCBpbnN0YWxsIHRpbWUuCi0gKipHdWFyZCBgY29tcG9zZWRSZWNvcmRzYCwgbm90IGBhdXRob3JpbmdgLioqIFRoZSByZWNvcmRzIGFyZSBhYnNlbnQgZHVyaW5nCiAgY29udGVudCBjb21wb3NpdGlvbiwgZm9yIHRoZSByZWFzb24gYHJlZ2lzdHJpZXNgIGlzLiBUaGUgYmFycmVsIGlzIG5vdDogaXQKICB3YWl0cyBvbiBub3RoaW5nIGFuZCBpcyB0aGVyZSBvbiBldmVyeSBjb250ZXh0LiBBbiBvbGRlciBob3N0IGhhcyBuZWl0aGVyLCBzbwogIGBpZiAoIWN0eC5jb21wb3NlZFJlY29yZHMpIHJldHVybjtgIGNvdmVycyBib3RoLgotICoqSXQgaG9sZHMgcmVjb3JkIG9iamVjdHMgb25seS4qKiBQYXNzdGhyb3VnaCBmaWxlcyBjYW4gY2FycnkgYXJyYXlzIGFuZAogIHNjYWxhcnMsIGFuZCB0aGUgaG9zdCBuYXJyb3dzIHRocm91Z2ggdGhlIFNESydzIG93biBgY29tcG9zZWRPYmplY3RzYCBiZWZvcmUKICBoYW5kaW5nIGl0IG92ZXIsIHNvIHRoZSBhdXRob3JpbmcgZnVuY3Rpb25zIG5ldmVyIG1lZXQgYW4gZWxlbWVudCB0aGV5IGNhbm5vdAogIHJlYWQuCgojIyMgRmlsbGluZyB0aWxlcwoKYHJlZ2lzdHJ5OnRpbGVzYCBpcyB0aGUgc2VhbSBmb3Igb25lIG5hcnJvdyB0aGluZzogKiphIHBpY3R1cmUgZm9yIGNvbnRlbnQgdGhlCmxvYWRlZCB0aWxlIHBhY2sgaGFzIG5ldmVyIGhlYXJkIG9mLioqIE5vIHRpbGUgc2V0IHdhcyBidWlsdCBrbm93aW5nIGFib3V0IHlvdXIKbW9kLCBzbyBpbiB0aWxlIG1vZGUgYSBjcmVhdHVyZSB5b3UgYWRkZWQgaXMgYSBjb2xvdXJlZCBsZXR0ZXIgc3RhbmRpbmcgaW4gYQp0aWxlZCBkdW5nZW9uLCBhbmQgdGhlIG9ubHkgcG9ydGFibGUgYWx0ZXJuYXRpdmUgdXNlZCB0byBiZSBvbmUgcHJlZiBmaWxlIHBlcgp0aWxlIHNldCBuYW1pbmcgYXRsYXMgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHVubWFpbnRhaW5hYmxlLgoKYGBganMKcmVnaXN0ZXIoaG9zdCwgY3R4KSB7CiAgaG9zdC50aWxlcy5yZWdpc3RlcigoZmlsbCkgPT4gewogICAgaWYgKGZpbGwucGFjay5lbmdpbmUgIT09ICJsaW5vbGV1bSIpIHJldHVybjsgICAvLyBvbmx5IHBhY2tzIHlvdSBrbm93CiAgICBjb25zdCByYWNlcyA9IGN0eC5yZWdpc3RyaWVzPy5tb25zdGVycy5yYWNlczsKICAgIGlmICghcmFjZXMpIHJldHVybjsKICAgIGZvciAoY29uc3QgcmFjZSBvZiByYWNlcykgewogICAgICBpZiAoZmlsbC5tb25zdGVyVGlsZShyYWNlLnJpZHgpKSBjb250aW51ZTsgICAvLyBzb21lYm9keSBkcmV3IGl0IGFscmVhZHkKICAgICAgY29uc3QgZG9ub3IgPSBmaWxsLm1vbnN0ZXJUaWxlKDApOwogICAgICBpZiAoZG9ub3IpIGZpbGwuZmlsbE1vbnN0ZXIocmFjZS5yaWR4LCBmaWxsLmRlcml2ZShkb25vciwgOTApID8/IHsgLi4uZG9ub3IgfSk7CiAgICB9CiAgfSk7Cn0KYGBgCgotICoqWW91IGNhbm5vdCByZXBhaW50IHRoZSB0aWxlIHNldC4qKiBgZmlsbE1vbnN0ZXJgIC8gYGZpbGxPYmplY3RgIHdyaXRlIG9ubHkKICB3aGVyZSBub3RoaW5nIGlzIGFzc2lnbmVkIGFuZCByZXR1cm4gYGZhbHNlYCBvdGhlcndpc2UuIEV2ZXJ5IHByZWYgbGF5ZXIgLSB0aGUKICBwYWNrJ3Mgb3duLCB0aGVuIGVhY2ggZW5hYmxlZCBtb2QncyAtIHJ1bnMgYmVmb3JlIGFueSBmaWxsZXIsIHNvIGEgdGlsZSBhbgogIGF1dGhvciBuYW1lZCBpcyBub3QgYSBibGFuay4gVGhhdCBhbHNvIG1lYW5zIHR3byBtb2RzIGNhbm5vdCBmaWdodDogd2hvZXZlcgogIGFza3MgZmlyc3QgZm9yIGFuIGluZGV4IGdldHMgaXQsIGFuZCBuZWl0aGVyIGNhbiB1bmRvIHRoZSBvdGhlci4KLSAqKmBkZXJpdmUoZG9ub3IsIGh1ZSlgIG1heSByZXR1cm4gYG51bGxgLCBhbmQgdXN1YWxseSBkb2VzLioqIEl0IGFza3MgdGhlCiAgZW5naW5lIGZvciBhIHRpbGUgZHJhd2luZyB0aGUgZG9ub3IncyBhc3NldCB3aXRoIGl0cyBodWUgcm90YXRlZC4gQSB0aWxlc2hlZXQKICBjYW5ub3Q6IGl0cyB0aWxlcyBhcmUgY2VsbHMgb2YgYSBmaXhlZCBhdGxhcyBhbmQgdGhlcmUgaXMgbm8gc3BhcmUgY2VsbCBmb3IgYQogIHZhcmlhbnQsIHNvIGl0IGFsd2F5cyBhbnN3ZXJzIGBudWxsYC4gQSBsb29zZSBwYWNrIGNhbiwgdW5sZXNzIHRoZSBkb25vcidzCiAgYXNzZXQgaXMgbm90IG9uZSBvZiBpdHMgb3duLiBGYWxsIGJhY2sgdG8gYSBwbGFpbiBjb3B5LgotICoqQ2hlY2sgYGZpbGwucGFja2AuKiogQSB0aWxlc2V0IG1vZCdzIHJ1bGUgaXMgcmlnaHQgZm9yIGl0cyBvd24gYXJ0IGFuZCBhCiAgZ3Vlc3MgYWJvdXQgYW55Ym9keSBlbHNlJ3MuIERlY2xpbmluZyBhIHBhY2sgeW91IGRvIG5vdCBvd24gaXMgdGhlIG5vcm1hbCBjYXNlLAogIG5vdCBhbiBlZGdlIG9uZS4KLSAqKlRoZSBnYW1lIGhhcyBubyBvcGluaW9uIGFib3V0IHdobyBkZXNlcnZlcyBhIHRpbGUuKiogSXQgdXNlZCB0bzogMC4yMi4wCiAgc2hpcHBlZCBhIHJ1bGUgaW4gY29yZSB0aGF0IGRyZXcgYSBtb2QtYWRkZWQgbW9uc3RlciBmcm9tIGEgcmFjZSBzaGFyaW5nIGl0cwogIGBiYXNlYCwgYW5kIDAuMjMuMCByZW1vdmVkIGl0LCBiZWNhdXNlIEFuZ2JhbmQgNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYSByZWNvcmQKICBhIG1vZCBhZGRlZCBhbmQgdGhlIHBvcnQgYWRkcyBub3RoaW5nLiBUaGF0IHJ1bGUgbm93IGxpdmVzIGluIGBsaW5vbGV1bWAsCiAgd2hpY2ggaXMgdGhlIHdvcmtlZCBleGFtcGxlLiBOb3RlIHdoYXQgaXQgZG9lcyBOT1QgZmlsbDogcmluZ3MsIGFtdWxldHMsCiAgbXVzaHJvb21zIGFuZCBmb29kIGFyZSBkcmF3biBieSBGTEFWT1VSIGFuZCB0aGVpciBraW5kIHNsb3RzIGFyZSBibGFuayBvbgogIHB1cnBvc2UsIGFuZCBhbiBvbGRlciBwYWNrIGhhcyBubyBhcnQgZm9yIGNvbnRlbnQgYWRkZWQgc2luY2UgaXQgd2FzIGRyYXduIC0KICBib3RoIGFyZSBibGFua3Mgd2hlcmUgYSBsZXR0ZXIgaXMgdGhlIGhvbmVzdCBhbnN3ZXIsIHNvIHRoZSBydWxlIGlzIHJlc3RyaWN0ZWQKICB0byByZWNvcmRzIGEgbW9kIGFkZGVkLCBieSBwcm92ZW5hbmNlLgoKSWYgeW91IGFyZSBzaGlwcGluZyBjb250ZW50IHJhdGhlciB0aGFuIHRpbGVzOiAqKmRyYXcgeW91ciBvd24uKiogQSBmYWxsYmFjayBpcwpmb3IgdGhlIG1vZHMgdGhhdCBkbyBub3QsIGFuZCBpdCBjYW5ub3Qga25vdyB3aGF0IHlvdSBtZWFudC4KCiMjIyBSZXBhaW50aW5nIGEgdGlsZSwgYW5kIGRyYXdpbmcgdGhlIHBsYXllcidzIG93biBjZWxsCgpUd28gbW9yZSB0aGluZ3MgbGl2ZSBvbiB0aGUgc2FtZSBgcmVnaXN0cnk6dGlsZXNgIHNlYW0sIGFuZCBuZWl0aGVyIGlzIGZpbGxpbmcgYQpibGFuazogYm90aCBzdGFydCBmcm9tIGEgdGlsZSB0aGF0IGFscmVhZHkgaGFzIGEgcGljdHVyZS4KCioqYGZpbGwudHJhbnNmb3JtKGRvbm9yLCBzcGVjKWAqKiBpcyBgZGVyaXZlYCdzIHNpYmxpbmcsIGZvciB3aGVuIHJvdGF0aW5nIHRoZQpkb25vcidzIG93biBodWUgaXMgbm90IHdoYXQgeW91IHdhbnQuIGBkZXJpdmVgIGtlZXBzIHRoZSBkb25vcidzIGNvbG91cnMgYW5kCnR1cm5zIHRoZW0sIHdoaWNoIGlzIGEgbm8tb3Agb24gZ3JleTsgYHRyYW5zZm9ybWAgcmVwbGFjZXMgdGhlIHBhbGV0dGUgb3V0cmlnaHQuCkV2ZXJ5IHBpeGVsIGlzIGluZGV4ZWQgYnkgYnJpZ2h0bmVzcyBpbnRvIGEgcmFtcCB5b3UgaGFuZCBvdmVyIGFuZCByZXBhaW50ZWQKd2l0aCB0aGUgY29sb3VyIHRoYXQgaW5kZXggbmFtZXMsIGRhcmtlc3QgZmlyc3QsIHNvIHRoZSByZXN1bHQgaXMgaW4gWU9VUgpjb2xvdXJzIHdoYXRldmVyIHRoZSBkb25vcidzIHdlcmUgLSBncmV5IGRvbm9ycyBpbmNsdWRlZCAtIGFuZCBhbHBoYSBjYXJyaWVzCnRocm91Z2ggdW50b3VjaGVkLCBzbyB0aGUgc2lsaG91ZXR0ZSBzdGF5cyB0aGUgZG9ub3IncyBleGFjdGx5LiBJdCBjYW4gYWxzbwptaXJyb3IgdGhlIHBpY3R1cmUgaG9yaXpvbnRhbGx5LCBpbmRlcGVuZGVudGx5IG9mIHRoZSByYW1wLiBMaWtlIGBkZXJpdmVgLCBpdApyZXR1cm5zIGBudWxsYCBvbiBhIGZpeGVkIHRpbGVzaGVldCAobm8gc3BhcmUgY2VsbCBmb3IgYSB2YXJpYW50KSBhbmQgb24gdGhlCnNhbWUgb3RoZXIgdHdvIHJlZnVzYWxzOyBmYWxsIGJhY2sgdG8gYSBwbGFpbiBjb3B5LgoKYGBganMKY29uc3QgdGlsZSA9IGZpbGwudHJhbnNmb3JtKGRvbm9yLCB7IG1pcnJvcjogdHJ1ZSwgcmFtcDogW1syMCwgMTAsIDMwXSwgWzkwLCA0MCwgMTEwXSwgWzE4MCwgMTIwLCAyMjBdXSB9KTsKYGBgCgoqKmB0aWxlcy5wbGF5ZXIocHJvdmlkZXIpYCoqIGFuc3dlcnMgYSBkaWZmZXJlbnQgcXVlc3Rpb24sIG9uY2UgcGVyIGZyYW1lCnJhdGhlciB0aGFuIG9uY2UgcGVyIG1hcCBidWlsZDogZ2l2ZW4gd2hvIHRoZSBjaGFyYWN0ZXIgaXMgcmlnaHQgbm93LCBpcyB0aGVyZQphIHRpbGUgdGhhdCBmaXRzIGJldHRlciB0aGFuIHRoZSBwYWNrJ3Mgb3duIHBsYXllciBwaWN0dXJlPyBUaGUgcGxheWVyIGlzIHJhY2UKMCBpbiB0aGUgbW9uc3RlciB0aWxlIHRhYmxlIGFuZCBldmVyeSBzaGlwcGVkIHBhY2sgYXNzaWducyBpdCwgc28gdGhlcmUgaXMgbm8KYmxhbmsgaGVyZSBmb3IgYSBmaWxsZXIgdG8gd3JpdGUgaW50byAtIHRoaXMgYXNrcyBpbnN0ZWFkIG9mIGZpbGxpbmcsIGFuZApgbnVsbGAgbWVhbnMgIm5vIiwgd2hpY2ggaXMgYWxzbyB3aGF0IGhhcHBlbnMgd2l0aCBubyBwcm92aWRlciBpbnN0YWxsZWQgYXQKYWxsLiBGaXJzdCBub24tbnVsbCBhbnN3ZXIgaW4gbG9hZCBvcmRlciB3aW5zLCBzbyB0d28gc3VjaCBtb2RzIGNhbiBjb2V4aXN0LgoKYGBganMKaG9zdC50aWxlcy5wbGF5ZXIoKHZpZXcpID0+IHsKICBpZiAoIXZpZXcuc2hhcGUpIHJldHVybiBudWxsOyAgICAgICAgICAvLyBub3JtYWwgc2hhcGU6IGxldCB0aGUgcGFjayBkcmF3IGl0CiAgcmV0dXJuIHNoYXBlVGlsZUZvcih2aWV3LnNoYXBlLCB2aWV3LmxldmVsLCB2aWV3LmNscywgdmlldy5yYWNlKTsKfSk7CmBgYAoKVGhlIHZpZXcgeW91IGdldCAoYHNoYXBlYCwgYGxldmVsYCwgYGNsc2AsIGByYWNlYCkgaXMgZGVsaWJlcmF0ZWx5IG5vdCB0aGUgbGl2ZQpwbGF5ZXIgcmVjb3JkIC0gbmFtaW5nIGZhY3RzIHJhdGhlciB0aGFuIGhhbmRpbmcgb3ZlciBzb21ldGhpbmcgYSByZW5kZXItdGltZQpob29rIGNvdWxkIG11dGF0ZS4gQmVjYXVzZSB0aGlzIHJ1bnMgaW5zaWRlIHRoZSByZW5kZXIgcGF0aCwgdGhlIHByb3ZpZGVyIG11c3QKYmUgYSBsb29rdXA6IGFsbG9jYXRlIHdoYXRldmVyIHRpbGVzIHlvdXIgYW5zd2VycyBuZWVkICh3aXRoIGB0cmFuc2Zvcm1gLCBkdXJpbmcKdGhlIGZpbGwpIGFuZCByZWFkIHRoZSB0YWJsZSBoZXJlLiBBIHByb3ZpZGVyIHRoYXQgdGhyb3dzIGxvc2VzIHRoYXQgb25lCmZyYW1lJ3MgYW5zd2VyIGFuZCBub3RoaW5nIGVsc2UuCgojIyMgRW5naW5lLXdpZGUgc2V0dGluZ3MgeW91IGNoYW5nZSB0aHJvdWdoIGBjdHguY29yZWAsIG5vdCB0aHJvdWdoIGEgaG9vawoKQSBmZXcgb2YgdGhlIGVuZ2luZSdzIGRlY2lzaW9ucyBhcmUgbm90IHRha2VuIGluc2lkZSBhIHR1cm4gYW5kIGhhdmUgbm8gZ2FtZQpzdGF0ZSB0byBoYW5nIGEgaG9vayBvbi4gVGhvc2UgYXJlIGV4cG9zZWQgYXMgYSAqKm1vZHVsZS1sZXZlbCBwb2xpY3kqKiB5b3Ugc2V0Cm9uY2UsIGFuZCBgaG9va3MoY3R4KWAgaXMgd2hlcmUgeW91IHNldCBpdDogaXQgaXMgdGhlIGVhcmxpZXN0IG1vbWVudCB5b3VyIGNvZGUKcnVucywgYmVmb3JlIGBzdGFydEdhbWVgLCBhbmQgYmVmb3JlIGJvb3QgcmVhZHMgYW55dGhpbmcuCgpUaGUgb25lIHRoYXQgZXhpc3RzIHRvZGF5OgoKfCBDYWxsIHwgQ2hhbmdlcyB8IEZhaXRoZnVsIGRlZmF1bHQgfAp8LS0tfC0tLXwtLS18CnwgYGN0eC5jb3JlLnNldFByZWZFcnJvclBvbGljeShwb2xpY3kgXHwgbnVsbClgIHwgV2hhdCBhIHByZWYgZmlsZSBkb2VzIHdpdGggYSBsaW5lIGl0IGNhbm5vdCBwYXJzZS4gYHsgY29udGludWVBZnRlckVycm9yLCByZXBvcnRMaW1pdCB9YCwgd2hldGhlciB0aGUgcmVzdCBvZiB0aGUgZmlsZSBpcyBzdGlsbCBhcHBsaWVkLCBhbmQgaG93IG1hbnkgZXJyb3JzIHRoZSBwbGF5ZXIgaXMgdG9sZCBhYm91dC4gfCBgVVBTVFJFQU1fUFJFRl9FUlJPUl9QT0xJQ1lgOiBzdG9wIGF0IHRoZSBmaXJzdCBiYWQgbGluZSwgd2hpY2ggaXMgd2hhdCBgcHJvY2Vzc19wcmVmX2ZpbGVfbmFtZWRgIGRvZXMgaW4gNC4yLjYuIHwKCmBgYGpzCmhvb2tzKGN0eCkgewogIGlmIChjdHguZmxhZ3NbIm15bW9kLmZvcmdpdmluZ1ByZWZGaWxlcyJdKSB7CiAgICBjdHguY29yZS5zZXRQcmVmRXJyb3JQb2xpY3koeyBjb250aW51ZUFmdGVyRXJyb3I6IHRydWUsIHJlcG9ydExpbWl0OiAyMCB9KTsKICB9CiAgcmV0dXJuIHt9Owp9CmBgYAoKVGhyZWUgcnVsZXMsIGFuZCB0aGV5IGFyZSB0aGUgc2FtZSBydWxlcyB0aGUgcmVzdCBvZiB0aGUgbW9kIHN5c3RlbSBydW5zIG9uOgoKLSAqKkxhc3QgbG9hZCB3aW5zLCBhbmQgdGhlcmUgaXMgZXhhY3RseSBvbmUgd2lubmVyLioqIFRoZSBob3N0IGNhbGxzIGVhY2gKICBlbmFibGVkIG1vZCdzIGBob29rc2AgaW4gbG9hZCBvcmRlciwgc28gdGhlIGxhc3QgbW9kIHRvIHNldCBhIHBvbGljeSBpcyB0aGUgb25lCiAgdGhhdCBzdGFuZHMsIHRoZSBzYW1lIHByb21pc2UgdGhlIG1vZCBtYW5hZ2VyJ3Mgcm93IG1ha2VzIHRoZSBwbGF5ZXIgKCJNb3ZlCiAgbGF0ZXIgKGxvYWRzIGxhc3QsIHdpbnMgY29uZmxpY3RzKSIpLiBUaGVyZSBpcyBub3RoaW5nIHRvIGZvbGQ6IHR3byBwb2xpY2llcwogIGNhbm5vdCBiZSBtZXJnZWQgaW50byBhIHRoaXJkIHRoYXQgaXMgZWl0aGVyIG9mIHRoZW0sIHdoaWNoIGlzIHdoeSB0aGlzIGlzIG5vdAogIGEgYE1vZEhvb2tzYCBtZW1iZXIuIElmIHlvdXIgbW9kIGNhcmVzLCBzYXkgc28gaW4gaXRzIFJFQURNRTsgYSBwbGF5ZXIgd2hvCiAgaW5zdGFsbHMgdHdvIG1vZHMgd2l0aCBvcGluaW9ucyBhYm91dCB0aGUgc2FtZSBwb2xpY3kgd2lsbCBnZXQgdGhlIGxhdGVyIG9uZS4KLSAqKk9ubHkgc2V0IGl0IHdoZW4geW91ciBmbGFnIGlzIG9uLioqIFNldHRpbmcgdGhlIGZhaXRoZnVsIGRlZmF1bHQgZXhwbGljaXRseQogIGlzIG5vdCB0aGUgc2FtZSBhcyBub3Qgc2V0dGluZyBpdDogaXQgc3RpbGwgbWFrZXMgeW91ciBtb2QgdGhlIHdpbm5lciwgYW5kCiAgc3RpbGwgb3ZlcnJpZGVzIGEgbW9kIGxvYWRlZCBiZWZvcmUgeW91LiBBIHBhdGNoIHRoZSBwbGF5ZXIgc3dpdGNoZWQgb2ZmIG11c3QKICBub3QgY2FsbCBhdCBhbGwuCi0gKipUdXJuaW5nIHlvdXIgbW9kIG9mZiByZWFsbHkgZG9lcyB0YWtlIGl0IGF3YXkuKiogQSBtb2R1bGUtbGV2ZWwgdmFsdWUgd291bGQKICBvdGhlcndpc2Ugb3V0bGl2ZSBhIG1vZCBiZWluZyBkaXNhYmxlZCwgYnV0IGRpc2FibGluZyBkb2VzIG5vdCB0YWtlIGVmZmVjdAogIGluc2lkZSBvbmUgcHJvY2Vzcy4gVGhlIG1hbmFnZXIgcHJvbXB0cyB0byBzYXZlIGFuZCByZWxvYWRzLCBhbmQgYWZ0ZXIgdGhlCiAgcmVsb2FkIHlvdXIgYGhvb2tzYCBpcyBuZXZlciBjYWxsZWQsIHNvIG5vdGhpbmcgaW5zdGFsbHMgYSBwb2xpY3kgYW5kIHRoZQogIGVuZ2luZSBpcyBiYWNrIG9uIGl0cyBmYWl0aGZ1bCBkZWZhdWx0LiBgc2V0UHJlZkVycm9yUG9saWN5KG51bGwpYCBpcyB0aGUgc2FtZQogIHNlYW0gZm9yIGEgdGVzdC4KCkd1YXJkIHRoZSBjYWxsIGlmIHlvdXIgYGVuZ2luZWAgcmFuZ2UgYWxsb3dzIGEgdmVyc2lvbiB0aGF0IHByZWRhdGVzIHRoZSBzZWFtOgpgdHlwZW9mIGN0eC5jb3JlLnNldFByZWZFcnJvclBvbGljeSA9PT0gImZ1bmN0aW9uImAuIFRoZSByYW5nZSBpcyB0aGUgZ2F0ZTsgdGhhdApjaGVjayBpcyB0aGUgc2VhdGJlbHQsIGFuZCBhIGBjdHgubG9nYCBsaW5lIHdoZW4gaXQgZmlyZXMgaXMgd2hhdCBzdG9wcyBhIG1vZApiZWluZyBzaWxlbnRseSBpbmVydC4KCiMjIyBgcHJlZnNgOiB0aGUgcGxhY2UgZm9yIGRhdGEgdGhhdCBvdXRsaXZlcyBhIGNoYXJhY3RlcgoKWW91ciBtb2QgaGFzIHR3byBwbGFjZXMgdG8gcHV0IGRhdGEgYW5kIHRoZXkgYXJlIG5vdCBpbnRlcmNoYW5nZWFibGUuCgp8IHwgbGl2ZXMgaW4gfCBkaWVzIHdoZW4gfCBmb3IgfAp8LS0tfC0tLXwtLS18LS0tfAp8IHlvdXIgc2F2ZSBiYWcgKHRocm91Z2ggYG1pZ3JhdGVCYWdgKSB8IHRoZSBjaGFyYWN0ZXIncyBzYXZlIGZpbGUgfCB0aGF0IGNoYXJhY3RlciBkb2VzIHwgd2hhdCBoYXBwZW5lZCB0byB0aGlzIGNoYXJhY3RlciB8CnwgYGN0eC5wcmVmc2AgfCB0aGUgcGxheWVyJ3MgaW5zdGFsbCB8IG5ldmVyLCB1bnRpbCB5b3UgY2xlYXIgaXQgfCB3aGF0IHRoaXMgcGxheWVyIGxpa2VzIHwKCmBwcmVmc2AgaXMgb25lIEpTT04gdmFsdWUsIHJlcGxhY2VkIHdob2xlLCBzY29wZWQgdG8geW91ciBtb2QncyBpZCBieSB0aGUgaG9zdDoKeW91IGNhbm5vdCByZWFkIGFub3RoZXIgbW9kJ3MsIGFuZCBwYXNzaW5nIGEgZGlmZmVyZW50IGlkIGlzIG5vdCBhIHRoaW5nIHlvdSBjYW4KZG8uIFNldHRpbmcgYG51bGxgIGZvcmdldHMgaXQuIEV2ZXJ5IGZhaWx1cmUgaXMgc3dhbGxvd2VkIGFuZCBsb2dnZWQgcmF0aGVyIHRoYW4KdGhyb3duIGF0IHlvdTogYSBmdWxsIGRpc2sgbXVzdCBub3QgdGFrZSB5b3VyIG1vZCBkb3duIGZyb20gaW5zaWRlIGEgaG9vay4KCldoZXJlIHRoZXJlIGlzIG5vIHN0b3JhZ2UgYXQgYWxsLCBgcHJlZnNgIHN0aWxsIGV4aXN0cyBhbmQgc2ltcGx5IG5ldmVyCnJlbWVtYmVycywgc28gYSBtb2Qgd3JpdHRlbiBhZ2FpbnN0IGl0IHJ1bnMgb24gYSBmcm9udCBlbmQgdGhhdCBoYXMgbm9uZS4KClJlYWNoIGZvciBgbG9jYWxTdG9yYWdlYCB5b3Vyc2VsZiBhbmQgeW91IGhhdmUgaGFyZC1jb2RlZCBhIGJyb3dzZXIgaW50byBhIG1vZAp0aGF0IHdvdWxkIG90aGVyd2lzZSBydW4gYW55d2hlcmUgdGhlIGdhbWUgZG9lcy4KCiMjIFNldmVyYWwgc2NyaXB0cwoKU3BsaXQgeW91ciBwbHVnaW4gdXAgaG93ZXZlciB5b3UgbGlrZSBhbmQgaW1wb3J0IHRoZSBwaWVjZXMgcmVsYXRpdmVseToKCmBgYGpzCi8vIHBsdWdpbi5qcwppbXBvcnQgeyByb2xsIH0gZnJvbSAiLi9saWIvZGljZS5qcyI7CmltcG9ydCB7IGRlc2NyaWJlIH0gZnJvbSAiLi9saWIvZm9ybWF0LmpzIjsKYGBgCgpUd28gcnVsZXMsIGJvdGggb2YgdGhlbSB0aGluZ3MgYSBicm93c2VyIGNhbm5vdCBkbyByYXRoZXIgdGhhbiBjaG9pY2VzOgoKLSAqKlB1dCB0aGUgZXh0ZW5zaW9uIG9uLioqIGAiLi9saWIvZGljZS5qcyJgLCBub3QgYCIuL2xpYi9kaWNlImAuIEV4dGVuc2lvbmxlc3MKICByZXNvbHV0aW9uIGlzIGEgTm9kZSBhbmQgYnVuZGxlciBjb252ZW5pZW5jZTsgbm8gYnJvd3NlciBoYXMgZXZlciBkb25lIGl0LgotICoqTm8gY3ljbGVzLioqIFR3byBmaWxlcyB0aGF0IGltcG9ydCBlYWNoIG90aGVyIGNhbm5vdCBib3RoIGJlIGxvYWRlZCBmcm9tIGEKICBicm93c2VyIGZvbGRlcjogYSBmaWxlJ3MgYWRkcmVzcyB0aGVyZSBvbmx5IGV4aXN0cyBvbmNlIGl0cyB0ZXh0IGlzIGZpbmFsLCBhbmQgYQogIGN5Y2xlIG5lZWRzIGJvdGggYWRkcmVzc2VzIGF0IG9uY2UuIE1vdmUgdGhlIHNoYXJlZCBwYXJ0IGludG8gYSB0aGlyZCBmaWxlLgoKQW55dGhpbmcgZWxzZSB3b3JrcywgaW4gYXMgbWFueSBzdWJkaXJlY3RvcmllcyBhcyB5b3Ugd2FudC4gSWYgYSBzY3JpcHQgaXMgbWlzc2luZwpvciB0d28gaW1wb3J0IGVhY2ggb3RoZXIsIHRoZSBtb2QgbWFuYWdlciBuYW1lcyAqdGhvc2UqIGZpbGVzLCBub3QgeW91ciBlbnRyeQpwb2ludC4KCiMjIEltYWdlcywgc291bmRzLCBhbmQgeW91ciBvd24gZGF0YQoKQXNrIGZvciBhIFVSTDsgZG8gbm90IGJ1aWxkIGEgcGF0aC4KCmBgYGpzCnJlZ2lzdGVyKGhvc3QsIGN0eCkgewogIGN0eC5hc3NldFVybCgidGlsZXMvb3JjLnBuZyIpLnRoZW4oKHVybCkgPT4gewogICAgaWYgKHVybCkgeyAvKiBhbiA8aW1nPiwgYSBjYW52YXMgZHJhdywgYSB0ZXh0dXJlICovIH0KICB9KTsKfQoKLy8gZGF0YSB0b28gLSB5b3VyIG93biBKU09OLCBub3QgYSByZWNvcmQgY29udHJpYnV0aW9uCmNvbnN0IHNwYXducyA9IGF3YWl0IGZldGNoKGF3YWl0IGN0eC5hc3NldFVybCgiZGF0YS9zcGF3bnMuanNvbiIpKS50aGVuKChyKSA9PiByLmpzb24oKSk7CmBgYAoKT24gZGVza3RvcCB0aGF0IFVSTCBpcyBhbiBgaHR0cDpgIG9uZSB1bmRlciB0aGUgc2hlbGwncyBvd24gc2VydmVyOyBpbiBhIGJyb3dzZXIKdGFiIGl0IGlzIGEgYGJsb2I6YC4gQSBtb2QgdGhhdCBoYXJkLWNvZGVzIGVpdGhlciBpcyBhIG1vZCB0aGF0IHJ1bnMgb24gb25lIG9mIHRoZQp0d28gZnJvbnQgZW5kcy4gVGhlIFVSTCBsYXN0cyBmb3IgdGhlIHNlc3Npb24sIGFuZCBhc2tpbmcgdHdpY2UgZ2l2ZXMgeW91IHRoZSBzYW1lCm9uZS4KCmBjdHguYXNzZXRVcmxgIG9ubHkgZXZlciByZWFjaGVzICoqeW91ciBvd24qKiBmb2xkZXI6IHRoZSBpZCBpcyBmaXhlZCBieSB0aGUgaG9zdCwKYW5kIGEgcGF0aCB0aGF0IGNsaW1icyBvdXQgb2YgaXQgaXMgcmVmdXNlZC4KCiMjIEJhcmUgc3BlY2lmaWVycyBzdGlsbCBkbyBub3Qgd29yawoKYGltcG9ydCB7IHR1bm5lbEF1eCB9IGZyb20gIkBycGdtLXRvb2xzL25lby1hbmdiYW5kLWNvcmUiYCBjYW5ub3QgcmVzb2x2ZSBmcm9tIGEgZm9sZGVyLCBhbmQKdGhlcmUgaXMgbm90aGluZyB0byBpbXBvcnQ6IHRoZSBlbmdpbmUgaXMgYGN0eC5jb3JlYCwgYWxyZWFkeSBsaXZlLiBUaGF0IGlzIHRoZSBvbmUKaW1wb3J0IGEgZm9sZGVyIHBsdWdpbiBjYW5ub3QgaGF2ZSwgYW5kIHRoZSBtb2QgbWFuYWdlciBzYXlzIHNvIGluc3RlYWQgb2YKcmVwZWF0aW5nIHRoZSBicm93c2VyJ3MgbWVzc2FnZS4KCiMjIFZlcnNpb24gY29udHJhY3QKCmBtb2RBcGlgIGlzIGFuIGludGVnZXIsIGFuZCB0aGUgaG9zdCBhY2NlcHRzIGEgKip3aW5kb3cqKjogZXZlcnl0aGluZyBmcm9tCmBNT0RfQVBJX01JTmAgdXAgdG8gYE1PRF9BUElfVkVSU0lPTmAgaW5jbHVzaXZlCihgcGFja2FnZXMvd2ViL3NyYy9tb2QtcGx1Z2luLnRzYCkuIEEgcGx1Z2luIGluc2lkZSB0aGUgd2luZG93IGJ1dCBiZWxvdyB0aGUKY3VycmVudCB2ZXJzaW9uIGxvYWRzIGFuZCBpcyByZXBvcnRlZCBhcyBERVBSRUNBVEVELCB3aGljaCBpcyB3aGF0IGdpdmVzIGl0cwphdXRob3IgYSByZWxlYXNlJ3Mgd2FybmluZyBiZWZvcmUgdGhlIG51bWJlciB0aGF0IHdvdWxkIHN0cmFuZCBpdCBtb3Zlcy4gVG9kYXkKYE1PRF9BUElfTUlOYCBhbmQgYE1PRF9BUElfVkVSU0lPTmAgYXJlIGJvdGggYDFgLCBzbyB0aGUgd2luZG93IGlzIG9uZSB2YWx1ZSB3aWRlCmFuZCBhbiBleGFjdCBtYXRjaCBhbmQgYSB3aW5kb3cgYXJlIGluZGlzdGluZ3Vpc2hhYmxlIGZyb20gdGhlIG91dHNpZGUgLSBidXQgdGhlCm1lY2hhbmlzbSBpcyB0aGUgd2luZG93LCBhbmQgYE1PRF9DT01QQVRJQklMSVRZLm1kYCBpcyB3aGVyZSB0aGUgdHdvLXJlbGVhc2UgcnVsZQp0aGF0IHJpZGVzIG9uIGl0IGlzIHdyaXR0ZW4gZG93bi4KCk91dHNpZGUgdGhlIHdpbmRvdyB0aGUgcGx1Z2luIGRvZXMgbm90IGxvYWQsIGFuZCB0aGUgbW9kIG1hbmFnZXIgbmFtZXMgYm90aApudW1iZXJzIGFuZCB3aGljaCBzaWRlIGlzIGJlaGluZDogYSB0b28tbmV3IG1vZCBuZWVkcyBhIG5ld2VyIGdhbWUsIGEgdG9vLW9sZCBvbmUKbmVlZHMgYSBtb2QgdXBkYXRlLCBhbmQgImluY29tcGF0aWJsZSIgb24gaXRzIG93biBzZW5kcyB0aGUgcGxheWVyIHRvIHRoZSB3cm9uZwpwbGFjZS4KCkl0IGlzIGRlY2xhcmVkIGluIHRoZSAqKm1hbmlmZXN0KiosIG5vdCBvbmx5IGluc2lkZSBgcGx1Z2luLmpzYCwgc28gYW4gaW5jb21wYXRpYmxlCnBsdWdpbiBjYW4gYmUgcmVmdXNlZCAqYmVmb3JlKiBpdCBpcyBpbXBvcnRlZC4gQSB2ZXJzaW9uIGNoZWNrIGluc2lkZSB0aGUgbW9kdWxlCmNhbiBvbmx5IHJ1biBhZnRlciB0aGUgbW9kdWxlJ3MgdG9wLWxldmVsIGNvZGUgaGFzIGFscmVhZHkgZXhlY3V0ZWQsIHdoaWNoIGlzIHRoZQp3cm9uZyBvcmRlciBmb3IgY29kZSB0aGF0IGNhbWUgb3V0IG9mIGEgZm9sZGVyIGFueW9uZSBjYW4gd3JpdGUgaW50by4KCiMjIFdoYXQgaGFzIHRvIGJlIHRydWUgYmVmb3JlIHlvdXIgY29kZSBydW5zCgpJbiBvcmRlciwgYW5kIGFsbCBvZiBpdCBiZWZvcmUgdGhlIGltcG9ydDoKCjEuIHRoZSBmb2xkZXIgc2hpcHMgYHBsdWdpbi5qc2AgKGZyb20gdGhlIGRpcmVjdG9yeSBsaXN0aW5nLCB3aXRoIG5vIHByb2JpbmcpOwoyLiB0aGUgbW9kIGlzICoqZW5hYmxlZCoqLCBzaW5jZSBhIGRpc2FibGVkIG1vZCdzIGNvZGUgZG9lcyBub3QgZXhpc3QsIHRoZSBzYW1lIHJ1bGUgYXMKICAgYSBkaXNhYmxlZCBtb2QncyBwYXRjaGVzOwozLiB0aGUgbWFuaWZlc3QgZGVjbGFyZXMgdGhlIGBwbHVnaW5gIGZhY2V0ICh2aWEgYHNoYXBlYCBvciBgZmFjZXRzYCk7CjQuIGBtb2RBcGlgIG1hdGNoZXM7CjUuIHRoZSBwbGF5ZXIgaGFzICoqY29uc2VudGVkKiogdG8gZXZlcnkgY2FwYWJpbGl0eSB0aGUgbWFuaWZlc3QgcmVxdWVzdHMuCgpUaGVuIHRoZSBtb2R1bGUgaXMgaW1wb3J0ZWQgYW5kIGl0cyBkZWZhdWx0IGV4cG9ydCBpcyBzaGFwZS1jaGVja2VkLgoKTm90aGluZyBhYm91dCBhIGJhZCBwbHVnaW4gY2FuIHN0b3AgdGhlIGdhbWUgYm9vdGluZy4gQSBoYW5kLWVkaXRlZCBtYW5pZmVzdCwgYQpoYWxmLWZpbmlzaGVkIGRvd25sb2FkLCBhIHBsdWdpbiB0aGF0IHRocm93cyBhdCBpbXBvcnQgb3IgaW5zaWRlIGBob29rcygpYDogZWFjaApiZWNvbWVzIG9uZSBsaW5lIHRoZSBtb2QgbWFuYWdlciBzaG93cywgYW5kIHRoZSBvdGhlciBtb2RzIGNhcnJ5IG9uLgoKIyMjIE1lc3NhZ2UgdHlwZXMgYXJlIGRlY2xhcmVkIGFzIERBVEEsIG5vdCBpbiBgcmVnaXN0ZXIoKWAKCmByZWdpc3RlcigpYCBydW5zIGFmdGVyIHRoZSBnYW1lIGhhcyBiZWVuIGJvdW5kLCAqKjM4NCB0b3AtbGV2ZWwgc3RhdGVtZW50cwphZnRlcioqLCBtZWFzdXJlZCByYXRoZXIgdGhhbiBlc3RpbWF0ZWQsIHNvIGEgbWVzc2FnZSB0eXBlIGRlY2xhcmVkIHRoZXJlIGlzCmRlY2xhcmVkIGFmdGVyIGV2ZXJ5IHJlY29yZCB0aGF0IGNvdWxkIGhhdmUgbmFtZWQgaXQuIEFuZCBhIGNvbnRlbnQtb25seSBwYWNrIGhhcwpubyBgcmVnaXN0ZXIoKWAgYXQgYWxsLCBzbyBmb3IgdGhlIHBhY2tzIG1vc3QgbGlrZWx5IHRvIHdhbnQgb25lIHRoaXMgd2FzIG5vdApsYXRlLCBpdCB3YXMgdW5yZWFjaGFibGUuCgpTbyBpZiB5b3VyIHBhY2sncyBvd24gc3BlbGwsIGJsb3cgbWV0aG9kLCBzdW1tb24gb3IgcHJvamVjdGlvbiBjYXJyaWVzIGEgYG1zZ3Q6YCwKc2hpcCB0aGUgdHlwZSBhcyBhIGBtZXNzYWdlX3R5cGVgIHJlY29yZCBmaWxlIGluc3RlYWQ6CgpgYGBqc29uCnsgInJlY29yZHMiOiBbCiAgeyAibmFtZSI6ICJTT1VMRklSRSIsICJzb3VuZCI6ICJzb3VsZmlyZSIsICJzb3VuZHMiOiAic2Zfb25lIHNmX3R3byIgfQpdIH0KYGBgCgpgbmFtZWAgaXMgdGhlIGJhcmUgYE1TR19gIG5hbWUgYSBgbXNndDpgIHNwZWxscywgYHNvdW5kYCBpcyB0aGUgYHNvdW5kLnByZmAga2V5CnRoZSB0eXBlIHBsYXlzIHVuZGVyLCBhbmQgYHNvdW5kc2AgaXMgdGhlIHNwYWNlLXNlcGFyYXRlZCBzYW1wbGUgbGlzdCBib3VuZCB0bwppdCwgYWxsIHRocmVlLCBiZWNhdXNlIGEgcGFjayB0aGF0IGNvdWxkIG5hbWUgYSB0eXBlIGFuZCBuZXZlciBiaW5kIGEgc2FtcGxlIHRvCml0IHdvdWxkIGJlIGhhbGYgYSBjYXBhYmlsaXR5LiAqKk5vIGNhcGFiaWxpdHkgYW5kIG5vIGBwbHVnaW4uanNgIGFyZSBuZWVkZWQqKjogaXQKaXMgYSByZWNvcmQgZmlsZSBsaWtlIGFueSBvdGhlciwgYW5kIGdhdGluZyBvbmUgcmVjb3JkIGZpbGUgd2hpbGUgYSBwYWNrIG1heQphbHJlYWR5IGFkZCBhIHByb2plY3Rpb24sIGEgbW9uc3RlciwgYW4gYXJ0aWZhY3QgYW5kIGFuIGVnbyBpdGVtIHVuZ2F0ZWQgd291bGQgYmUKYSBmZW5jZSB3aXRoIG5vIHdhbGwgYXR0YWNoZWQuCgpEZWNsYXJhdGlvbnMgYXJlIGFkZGl0aXZlLCBhdHRyaWJ1dGVkIHRvIHRoZSBwYWNrIHRoYXQgY29pbmVkIHRoZW0sIGlkZW1wb3RlbnQKYWNyb3NzIHRoZSBuZXctZ2FtZSBhbmQgbG9hZCBwYXRocywgYW5kICoqbmV2ZXIgdGhyb3cqKjogYSByZWZ1c2VkIGRlY2xhcmF0aW9uCmxvc2VzIG9uZSBtZXNzYWdlIHR5cGUgYW5kIHJlcG9ydHMgaXQgcmF0aGVyIHRoYW4gdGFraW5nIHRoZSBib290IGRvd24uCgpgaG9zdC5tZXNzYWdlcy5kZWZpbmUoLi4uKWAgc3RpbGwgZXhpc3RzIGFuZCBpcyBzdGlsbCB0aGUgcmlnaHQgY2FsbCBmb3IgYSB0eXBlIGEKcGx1Z2luIGNvaW5zIGF0IHJ1bnRpbWUsIGUuZy4gdG8gcmUtcG9pbnQgc291bmRzLiBJdCBpcyBvbmx5IHRoZSB3cm9uZyBwbGFjZSBmb3IKYSB0eXBlIHlvdXIgb3duIHJlY29yZHMgbmFtZS4KCiMjIEZyb250LWVuZCByZXBsYWNlbWVudAoKYGZyb250ZW5kKGN0eClgIGlzIGFuIG9wdGlvbmFsIGBwbHVnaW4uanNgIG1lbWJlci4gSXQgcmV0dXJucyBhIHNpbmsgZm9yIHRoZQpsaXZlIG1hcCBzdHJlYW0gKG9yIGB1bmRlZmluZWRgIHRvIGRlY2xpbmUpOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICBmcm9udGVuZChjdHgpIHsKICAgIHJldHVybiB7CiAgICAgIHByZXNlbnQoZnJhbWUpIHsKICAgICAgICAvLyBmcmFtZS5jZWxsczogc2VtYW50aWMgdGVycmFpbi9vY2N1cGFudCBsYXllcnMgYW5kIHZpc2liaWxpdHksCiAgICAgICAgLy8gbm90IHRlcm1pbmFsIGNoYXJhY3RlcnMgdGhhdCBuZWVkIHJldmVyc2UtcGFyc2luZy4KICAgICAgfSwKICAgIH07CiAgfSwKfTsKYGBgCgpBIGNvbXBsZXRlIHdvcmtlZCBleGFtcGxlIGxpdmVzIGluICoqYHNhbXBsZXMvYmx1ZXByaW50LXZpZXcvYCoqLCBhIGZvbGRlciB5b3UKY2FuIGNvcHkgc3RyYWlnaHQgaW50byBhIG1vZHMgZm9sZGVyLiBJdCBkcmF3cyBhIGJsdWVwcmludCBvZiB0aGUgZHVuZ2VvbiBmcm9tCnRoZSBmcmFtZSdzIHNlbWFudGljIGxheWVycywgYW5kIGBwYWNrYWdlcy93ZWIvc3JjL3NhbXBsZS1ibHVlcHJpbnQubm9kZS50ZXN0LnRzYApsb2FkcyB0aGF0IGZvbGRlciBieSBwYXRoIGFuZCByZWNvcmRzIHdoYXQgaXQgZHJhd3MsIHNvIHRoZSBzYW1wbGUgaXMgY2hlY2tlZApjb2RlIHJhdGhlciB0aGFuIGFuIGlsbHVzdHJhdGlvbi4gSXQgaGFzIGFsc28gYmVlbiBydW4gaW4gdGhlIGluc3RhbGxlZCBkZXNrdG9wCmJ1aWxkLCB3aGljaCBpcyB3aGVyZSB0aGUgbWlzc2luZyB2aWV3cG9ydCBnZW9tZXRyeSBzdG9wcGVkIGJlaW5nIHRoZW9yZXRpY2FsOwpzZWUgKipXaGVyZSB5b3UgbWF5IGRyYXcqKiBiZWxvdyBmb3Igd2hhdCBpdCBub3cgcmVhZHMgaW5zdGVhZC4KClRoZSBtYW5pZmVzdCBtdXN0IHJlcXVlc3QgKipgZGlzcGxheTpyZXBsYWNlYCoqLCBhbmQgdGhlIHBsYXllciBtdXN0IGFwcHJvdmUgaXQ6CgpgYGBqc29uCnsgInNoYXBlIjogInBsdWdpbiIsICJjYXBhYmlsaXRpZXMiOiBbImRpc3BsYXk6cmVwbGFjZSJdIH0KYGBgCgpEZWNsYXJpbmcgYGZyb250ZW5kYCB3aXRob3V0IGl0IGlzIHJlcG9ydGVkIGJ5IG5hbWUgYW5kIHRoZSBnYW1lIGtlZXBzIGRyYXdpbmcuCkl0IGlzIGRlbGliZXJhdGVseSBub3QgYSBgcmVnaXN0cnk6YCBkb21haW4gYW5kICoqYHJlZ2lzdHJ5OipgIGRvZXMgbm90IGNvdmVyCml0Kio6IGFuIG92ZXJyaWRlIGdyYW50IGNoYW5nZXMgb25lIG5hbWVkIGdhbWUgc3lzdGVtIGFtb25nIG1hbnksIHdoaWxlIHRoaXMgb25lCm1lYW5zIGV2ZXJ5dGhpbmcgdGhlIHBsYXllciBzZWVzIG9mIHRoZSBkdW5nZW9uIGNvbWVzIGZyb20gdGhlIG1vZC4gVGhhdCBpcyB0aGUKc2FtZSByZWFzb25pbmcgdGhhdCBtYWtlcyBgY29udHJvbGxlcmAgcmVxdWlyZSBgY29tbWFuZDphZGRgLgoKRm9yIFR5cGVTY3JpcHQsIGltcG9ydCB0aGUgcHVibGljIGRhdGEgY29udHJhY3QgdHlwZS1vbmx5IGZyb20gdGhlIFNESzoKYGltcG9ydCB0eXBlIHsgV29ybGRGcmFtZSwgV29ybGRGcmFtZVNpbmsgfSBmcm9tCiJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrImAuIFRoZSBidWlsZCBlcmFzZXMgdGhhdCBpbXBvcnQsIHNvIGEgZm9sZGVyCnBsdWdpbiBzdGlsbCBoYXMgbm8gYmFyZSBydW50aW1lIGRlcGVuZGVuY3kuIFRoZXJlIGlzIG9uZSBzbG90IGFuZCB0aGUgKipsYXN0CmVsaWdpYmxlIG1vZCBpbiBsb2FkIG9yZGVyIHdpbnMqKjsgZWFybGllciBmcm9udGVuZCBmYWN0b3JpZXMgYXJlIG5vdCBjYWxsZWQuClRoZSBob3N0IGhhbmRzIHRoZSB3aW5uZXIgYSBmcm96ZW4sIHN0cnVjdHVyYWxseSBvd25lZCBzbmFwc2hvdCBwZXIgcmVhbCBtYXAKcmVwYWludC4gSXQgaXMgc2FmZSB0byByZXRhaW4gZm9yIGFuIGFuaW1hdGlvbiBmcmFtZSwgYnV0IGNhbm5vdCBleHBvc2Ugb3IKbXV0YXRlIHRoZSBsaXZlIHBsYXllci1ncmlkIG9iamVjdC4gQSBmcm9udGVuZCB0aGF0IHRocm93cyBsb3NlcyBpdHMgZGlzcGxheQphdHRlbXB0IGFuZCB0aGUgZ2FtZSdzIG93biByZW5kZXJlciByZXN1bWVzLgoKKipUaGUgZ2FtZSdzIHJlbmRlcmVyIGNvbXBldGVzIGluIHRoYXQgc2FtZSBsaXN0LCBhcyBjYW5kaWRhdGUgemVyby4qKiBJdApkZWNsYXJlcyBgZnJvbnRlbmRgIGFuZCBgZGlzcGxheTpyZXBsYWNlYCBleGFjdGx5IGFzIGEgbW9kIGRvZXMsIGFuZCBpdCB3aW5zCndoZW5ldmVyIG5vIG1vZCBvdXRyYW5rcyBpdCAtIGl0IGlzIG5vdCBhIGZhbGxiYWNrIHRoZSBzZWxlY3Rpb24gZmFsbHMgdGhyb3VnaAp0by4gVGhhdCBpcyB3aGF0IG1ha2VzIHRoZSBzZWFtJ3MgY2xhaW0gY2hlY2thYmxlIHJhdGhlciB0aGFuIGFzcGlyYXRpb25hbDogaWYKaXQgY291bGQgbm90IGV4cHJlc3MgdGhlIGZyb250IGVuZCB0aGUgZ2FtZSBhbHJlYWR5IHNoaXBzLCAiYSBtb2QgY2FuIHJlcGxhY2UKdGhlIGZyb250IGVuZCIgd291bGQgYmUgYSBjbGFpbSBhYm91dCBhIHNoYXBlIG5vYm9keSBoYWQgYnVpbHQgdGhyb3VnaCBpdC4KClRoaXMgcmVwbGFjZXMgdGhlIG1hcCBkaXNwbGF5IG9ubHkuIE1lbnVzIHN0aWxsIHVzZSBgcmVnaXN0cnk6bWVudWAsIGFuZCBpbnB1dApzdGlsbCBlbnRlcnMgdGhyb3VnaCB0aGUgaG9zdCdzIGRldmljZS1uZXV0cmFsIGlucHV0IGRvb3I7IGdhbWVwYWQgYmluZGluZ3MgYW5kCndob2xlLXNjcmVlbiBvd25lcnNoaXAgYXJlIGxhdGVyIHNlYW1zLgoKIyMjIFdoZXJlIHlvdSBtYXkgZHJhdzogYGZyYW1lLnJlZ2lvbnNgCgpFdmVyeSBmcmFtZSBjYXJyaWVzIHRoZSBuYW1lZCBwYXJ0cyBvZiB0aGUgc2NyZWVuLCBzbyBhIGZyb250IGVuZCBubyBsb25nZXIgaGFzCnRvIGd1ZXNzIHdoZXJlIHRoZSBtYXAgaXM6CgpgYGBqcwpwcmVzZW50KGZyYW1lKSB7CiAgY29uc3QgYm94ID0gZnJhbWUucmVnaW9ucz8ubWFwPy5waXhlbHM7CiAgaWYgKCFib3gpIHJldHVybjsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGdlb21ldHJ5OiBkcmF3IE5PVEhJTkcKICBjYW52YXMuc3R5bGUubGVmdCA9IGAke2JveC54fXB4YDsKICBjYW52YXMuc3R5bGUudG9wID0gYCR7Ym94Lnl9cHhgOwogIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke2JveC53aWR0aH1weGA7CiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2JveC5oZWlnaHR9cHhgOwogIC8vIC4uLgp9CmBgYAoKYHJlZ2lvbnNgIGhhcyBgbWFwYCwgYW5kLCBkZXBlbmRpbmcgb24gdGhlIHBsYXllcidzIHNpZGViYXIgbW9kZSwgYG1lc3NhZ2VzYCwKYHNpZGViYXJgIGFuZCBgc3RhdHVzYC4gRWFjaCBjYXJyaWVzIGBjZWxsc2AgKGEgcmVjdGFuZ2xlIG9mIHRoZSBjaGFyYWN0ZXIgZ3JpZCkKYW5kIGBwaXhlbHNgIChDU1MgcGl4ZWxzIGluIHRoZSBnYW1lIHdpbmRvdydzIGNvb3JkaW5hdGUgc3BhY2UsIHRoZSBzcGFjZQpgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClgIGFuc3dlcnMgaW4pLiBgbWFwYCBpcyB5b3VycyB3aGlsZSB5b3UgaG9sZCB0aGUKZGlzcGxheTsgdGhlIG90aGVycyBhcmUgY29yZSdzIGFuZCBhcmUgcHVibGlzaGVkIHNvIHlvdSBjYW4gc3RheSBvZmYgdGhlbSwgb3IKY292ZXIgdGhlbSBrbm93aW5nIHdoYXQgeW91IGFyZSBjb3ZlcmluZy4KClRocmVlIHRoaW5ncyB3b3J0aCBrbm93aW5nOgoKLSAqKlRoZSBuYW1lcyBhcmUgcm9sZXMsIG5vdCBwbGFjZXMuKiogYHNpZGViYXJgIGlzIHRoZSAxMy1jb2x1bW4gbGVmdCBjb2x1bW4gaW4KICB0aGUgY2xhc3NpYyBsYXlvdXQgYW5kIGEgb25lLWxpbmUgaGVhZGVyIHVuZGVyIHRoZSBtZXNzYWdlcyBpbiB0aGUgY29tcGFjdAogIG9uZSwgYW5kIGl0IGlzICoqYWJzZW50Kiogd2hlbiB0aGUgcGxheWVyIGhhcyB0dXJuZWQgdGhlIHZpdGFscyBvZmYuIFJlYWQgaXQKICBldmVyeSBmcmFtZSByYXRoZXIgdGhhbiBjYWNoaW5nIGl0OiBpdCBtb3ZlcyBvbiBhIHJlc2l6ZSwgb24gYSBzaWRlYmFyLW1vZGUKICBjaGFuZ2UsIGFuZCB3aGVuIGEgbmFycm93IHdpbmRvdyBmb3JjZXMgdGhlIGNvbXBhY3QgbGF5b3V0LgotICoqYHJlZ2lvbnNgIGlzIG9wdGlvbmFsLioqIEEgaG9zdCB3aXRoIG5vIGZpdHRlZCBzdXJmYWNlIGhhcyBub25lIHRvIGdpdmUuCiAgVHJlYXQgdGhhdCBhcyAiZHJhdyBub3RoaW5nIiwgbm90IGFzICJmYWxsIGJhY2sgdG8gdGhlIHdpbmRvdyI6IGZhbGxpbmcgYmFjawogIHJlaW50cm9kdWNlcyB0aGUgZGVmZWN0IGJlbG93LCBpbnRlcm1pdHRlbnRseS4KLSAqKlRoZSBtYXAgaXMgb25lIGNvbHVtbiBuYXJyb3dlciB0aGFuIHRoZSBzY3JlZW4uKiogVGhhdCBpcyB1cHN0cmVhbSdzIG93bgogIHJ1bGUgKGBTQ1JFRU5fV0lEYCByZXNlcnZlcyB0aGUgcmlnaHRtb3N0IGNvbHVtbiksIG5vdCBhIHJvdW5kaW5nIGVycm9yLgoKKipUd28gcHJvcGVydGllcyB0aGUgZm91ciByZWdpb25zIGhhdmUgdG9kYXkgdGhhdCB3aWxsIG5vdCBob2xkIGZvcmV2ZXIuKiogVGhleQp0aWxlIHRoZSBzY3JlZW4gd2l0aG91dCBvdmVybGFwcGluZywgYW5kIHRoZSBzZXQgaXMgY2xvc2VkLiBOZWl0aGVyIGlzIGEgcHJvbWlzZToKdGhlIFVJIHNlYW0gKGBNT0RfUkVBQ0gubWRgIGdhcCAyMSkgaXMgZGVjaWRlZCB0byBtYWtlIGEgZnVsbCBzY3JlZW4gKipjb21wb3NlZApvZioqIHJlZ2lvbnMgcmF0aGVyIHRoYW4gY292ZXJpbmcgdGhlbSwgd2hpY2ggbWVhbnMgcmVnaW9ucyB3aWxsIG92ZXJsYXAsIGdhaW4gYQpzdGFja2luZyBvcmRlciwgYW5kIGJlIGNyZWF0YWJsZSBieSBhIG1vZDogYSBmbG9hdGluZyB3aW5kb3cgb3ZlciBhIG1hcCB0aGF0IGlzCnN0aWxsIGJlaW5nIGRyYXduIGlzIHRoZSB3aG9sZSBwb2ludCBvZiBpdC4gTm90aGluZyBpbiB0aGUgY29kZSBhYm92ZSBjaGFuZ2VzCndoZW4gdGhhdCBsYW5kczsgY29kZSB0aGF0ICppbmZlcnMqIGRpc2pvaW50bmVzcyBkb2VzLiBSZWFkIGByZWdpb25zLm1hcGAgYW5kCmRyYXcgaW4gaXQ7IGRvIG5vdCBjb21wdXRlIHlvdXIgcmVjdGFuZ2xlIGJ5IHN1YnRyYWN0aW5nIHRoZSBvdGhlcnMuCgoqKkNvdmVyaW5nIHRoZSB3aW5kb3cgY29zdHMgdGhlIHBsYXllciBldmVyeXRoaW5nIGVsc2Ugb24gaXQuKiogQmVmb3JlIHJlZ2lvbnMKZXhpc3RlZCwgcnVubmluZyB0aGUgc2FtcGxlIGluIHRoZSBpbnN0YWxsZWQgYnVpbGQgbWFkZSB0aGlzIHBsYWluOgpgZGlzcGxheTpyZXBsYWNlYCByZWFsbHkgZG9lcyByZXBsYWNlIHRoZSBtYXAgb25seTogY29yZSBzdG9wcyBkcmF3aW5nIHRoZQpkdW5nZW9uIGFuZCBnb2VzIG9uIGRyYXdpbmcgdGhlIHNpZGViYXIsIHRoZSBtZXNzYWdlIGxpbmUgYW5kIGV2ZXJ5IG1lbnUsIGJ1dCBhCmZyb250IGVuZCB0aGF0IGNvdmVycyB0aGUgd2luZG93IHBhaW50cyBvdmVyIGFsbCBvZiBpdCwgc28geW91IGNvdWxkIG5vdCByZWFkCnlvdXIgaGl0IHBvaW50cywgc2VlIGEgbWVzc2FnZSwgb3Igb3BlbiB0aGUgTW9kcyBzY3JlZW4gdG8gdHVybiB0aGUgbW9kIG9mZi4gWW91CndvdWxkIGhhdmUgaGFkIHRvIGVkaXQgdGhlIGVuYWJsZWQgc2V0IGJ5IGhhbmQuCgpBIGZyb250IGVuZCBpcyBzdGlsbCAqYWxsb3dlZCogdG8gdGFrZSB0aGUgd2hvbGUgd2luZG93OyBhbiBpc29tZXRyaWMgb3IgM0QgdmlldwptYXkgd2FudCB0by4gV2hhdCB0aGUgcmVnaW9ucyBjaGFuZ2UgaXMgdGhhdCBpdCBpcyBub3cgYSBkZWNpc2lvbiwgdGFrZW4ga25vd2luZwp3aGF0IGlzIGJlaW5nIGNvdmVyZWQsIHJhdGhlciB0aGFuIHRoZSBvbmx5IHRoaW5nIGEgbW9kIGNvdWxkIGRvLgoKIyMjIEtub3dpbmcgd2hlbiB5b3UgYXJlIGNvdmVyZWQ6IGBmcmFtZS5zdGFja2AKCmBmcmFtZS5yZWdpb25zYCBzYXlzIHdoZXJlIHRoZSBtYXAgaXMuIGBmcmFtZS5zdGFja2Agc2F5cyB3aGF0IGlzIG9uIHRvcCBvZiBpdDoKZXZlcnkgcmVnaW9uIG9uIHNjcmVlbiwgYm90dG9tIHRvIHRvcCwgYmVnaW5uaW5nIHdpdGggdGhlIGZvdXIgYmFzZSB0aWxlcwpgcmVnaW9uc2AgbmFtZXMuIEEgcmVnaW9uIGxhdGVyIGluIHRoZSBhcnJheSBpcyBkcmF3biBvdmVyIG9uZSBlYXJsaWVyIGluIGl0LgpGaW5kIHRoZSBlbnRyeSB3aG9zZSBgaWRgIGlzIGAibWFwImA7IGlmIGFueSBlbnRyeSBhZnRlciBpdCBvdmVybGFwcyBpdHMgYGNlbGxzYCwKaGlkZSB5b3VyIGRpc3BsYXkuCgpgYGBqcwpmdW5jdGlvbiBjb3ZlcmVkVXAoZnJhbWUpIHsKICBjb25zdCBzdGFjayA9IGZyYW1lLnN0YWNrOwogIGlmICghc3RhY2spIHJldHVybiBmYWxzZTsgICAgICAgICAgICAgICAgICAvLyB0aGlzIGhvc3QgcHVibGlzaGVzIG5vbmUKICBjb25zdCBhdCA9IHN0YWNrLmZpbmRJbmRleCgocikgPT4gci5pZCA9PT0gIm1hcCIpOwogIGlmIChhdCA8IDApIHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAvLyBhIHN0YWNrIHRoYXQgc3RvcHBlZCBuYW1pbmcgdGhlIG1hcAogIGNvbnN0IG1hcCA9IHN0YWNrW2F0XS5jZWxsczsKICByZXR1cm4gc3RhY2suc2xpY2UoYXQgKyAxKS5zb21lKChyKSA9PgogICAgci5jZWxscy5jb2wgPCBtYXAuY29sICsgbWFwLmNvbHMgJiYgbWFwLmNvbCA8IHIuY2VsbHMuY29sICsgci5jZWxscy5jb2xzICYmCiAgICByLmNlbGxzLnJvdyA8IG1hcC5yb3cgKyBtYXAucm93cyAmJiBtYXAucm93IDwgci5jZWxscy5yb3cgKyByLmNlbGxzLnJvd3MpOwp9CmBgYAoKYHNhbXBsZXMvYmx1ZXByaW50LXZpZXcvcGx1Z2luLmpzYCBzaGlwcyBleGFjdGx5IHRoaXMuIFRoZSBnYW1lJ3Mgb3duIGNvcHkgb2YgdGhlCnF1ZXN0aW9uIGlzIGBvY2NsdWRlcnNPZmAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvcmVnaW9ucy50c2AsIHdpdGgKYHJlZ2lvbnNJbnRlcnNlY3RgICh0aGUgZm91ciBjb21wYXJpc29ucyBhYm92ZSkgYmVzaWRlIGl0LiBOZWl0aGVyIGlzIHJlYWNoYWJsZQpmcm9tIGEgbW9kLCBhbmQgdGhhdCBpcyBhIHByb3BlcnR5IG9mIGhvdyBhIG1vZCBpcyBsb2FkZWQgcmF0aGVyIHRoYW4gYW4Kb3ZlcnNpZ2h0OiBhIG1vZHVsZSBmZXRjaGVkIGZyb20gYSBtb2QgZm9sZGVyIGNhbm5vdCByZXNvbHZlIGEgcGFja2FnZSBieSBuYW1lLApzbyBgbmVvLWFuZ2JhbmQtbW9kLWJ1aWxkYCBtYXJrcyBldmVyeSBiYXJlIHNwZWNpZmllciBleHRlcm5hbCBhbmQgZmFpbHMgdGhlCmJ1aWxkIG9uIGFueSB0aGF0IHN1cnZpdmUuICoqVHlwZXMgY3Jvc3MgdGhhdCBsaW5lLCBiZWNhdXNlIHRoZSBidWlsZCBlcmFzZXMKdGhlbTsgZnVuY3Rpb25zIGRvIG5vdC4qKiBQdWJsaXNoaW5nIHRoZXNlIHR3byB0aHJvdWdoIHRoZSBTREsgd291bGQgdGhlcmVmb3JlCnB1Ymxpc2ggYSBtZW1iZXIgbm8gbW9kIGNvdWxkIGltcG9ydC4gU28gd3JpdGUgeW91ciBvd24gYXMgYWJvdmU6IGl0IGlzIG5pbmUKbGluZXMsIGFuZCBrZWVwIHRoZSBgdW5kZWZpbmVkYCBjYXNlLCB3aGljaCBpcyB0aGUgcGFydCB3b3J0aCBjb3B5aW5nLgoKKipZb3Ugd2lsbCBiZSB0b2xkLioqIFRoZSBnYW1lJ3Mgb3duIHNjcmVlbnMgKHRoZSBpbnZlbnRvcnksIHRoZSBrbm93bGVkZ2UKYnJvd3NlciwgdGhlIE1vZHMgc2NyZWVuIHlvdSB3b3VsZCB1c2UgdG8gdHVybiB0aGlzIG1vZCBvZmYpIHJlcGFpbnQgdGhlCnRlcm1pbmFsICp3aXRob3V0IHByb2R1Y2luZyBhIHdvcmxkIGZyYW1lKiwgYmVjYXVzZSBhIHNjcmVlbiByZWRyYXdzIGZyb20gaXRzIG93bgprZXkgbG9vcC4gU28gd2hlbiB0aGUgc3RhY2sgY2hhbmdlcyB3aXRoIG5vdGhpbmcgYmVoaW5kIGl0LCB0aGUgaG9zdCBwcmVzZW50cwp5b3VyICoqbGFzdCoqIGZyYW1lIGFnYWluIHdpdGggYHN0YWNrYCB1cGRhdGVkLiBUaGUgY2VsbHMgd2lsbCBiZSB0aGUgb25lcyB5b3UKYWxyZWFkeSBkcmV3OyB0aGF0IGlzIGRlbGliZXJhdGUuIFJlLXByb2plY3RpbmcgdGhlIHdvcmxkIGZyb20gYSBzaGVsbCB0aGF0IGlzCm5vdCBpbiBhIHJlcGFpbnQgd291bGQgYmUgaW52ZW50aW5nIGEgZnJhbWUsIGFuZCBub3RoaW5nIGhhcyBydW4gdGhhdCBjb3VsZCBoYXZlCmNoYW5nZWQgdGhlIGR1bmdlb24uIFRoZSBzdGFjayBpcyB0aGUgcGFydCB0aGF0IGNoYW5nZWQsIGFuZCBpdCBpcyB0aGUgcGFydCB0bwpyZWFkLgoKVGhlIG5vdGlmaWNhdGlvbiBmaXJlcyB3aGVuIHRoZSBjb21wb3NpdGUgKipjaGFuZ2VzKiosIG5vdCBldmVyeSB0aW1lIGl0IGlzCnJlY29tcHV0ZWQ6IGEgbGlzdGVuZXIgb24gZXZlcnkgcmVjb21wb3NlIHdvdWxkIGRvdWJsZSBldmVyeSByZXBhaW50IGZvciBuZXdzCnRoYXQgaGFkIG5vdCBjaGFuZ2VkLgoKKipUaGVyZSBhcmUgVEhSRUUgYW5zd2VycyBoZXJlLCBub3QgdHdvLCBhbmQgdGhlIHRoaXJkIGlzIHRoZSBvbmUgd29ydGggd3JpdGluZwpkb3duLioqIEFuIGVtcHR5IHN0YWNrLCBvciBvbmUgd2hvc2UgZW50cmllcyBkbyBub3Qgb3ZlcmxhcCB5b3UsIG1lYW5zIG5vdGhpbmcgaXMKb3ZlciB5b3UuIEEgKiptaXNzaW5nKiogYHN0YWNrYCBtZWFucyB0aGlzIGhvc3QgcHVibGlzaGVzIG5vbmUsIHNvIG5vdGhpbmcgaXMKa25vd24sIHNvIGRyYXcsIGJlY2F1c2UgYHBsYWNlKClgIGFscmVhZHkgZGVjbGluZXMgd2hlbiB0aGVyZSBpcyBubyBwaXhlbApnZW9tZXRyeSB0byBkcmF3IGludG8uIEJ1dCBhIHN0YWNrIHRoYXQgKippcyoqIHB1Ymxpc2hlZCBhbmQgZG9lcyAqKm5vdCBjb250YWluCmAibWFwImAqKiBpcyBhIGhvc3QgdGhhdCBoYXMgc3RvcHBlZCBkZXNjcmliaW5nIHRoZSBtYXAsIGFuZCB0aGF0IGlzIENPVkVSRUQsIG5vdApjbGVhci4gQ29sbGFwc2luZyB0aGF0IGNhc2UgaW50byAibm90aGluZyBpcyBvdmVyIG1lIiBpcyBob3cgYSBtb2QgY2FudmFzIGVuZHMgdXAKY2hlZXJmdWxseSBwYWludGluZyBvdmVyIHdoYXRldmVyIHJlcGxhY2VkIHRoZSBtYXAsIGZvciBldmVyLCB3aXRoIG5vIGVycm9yCmFueXdoZXJlLgoKQSBIVUQgcmVnaW9uIG93bmVyIHJlYWRzIHRoZSBzYW1lIGZpZWxkIG9uIGBIdWRGcmFtZWAsIGFza2luZyBhYm91dCBpdHMgb3duCnNlY3Rpb24ncyBgcmVnaW9uLm5hbWVgLgoKKipXaGF0IHRoaXMgZG9lcyBub3QgeWV0IHJlYWNoOioqIGEgbW9kICpwcmVzZW50ZXIqIGhvbGRpbmcgYSBzY3JlZW4gZG9lcyBub3QKcHVzaCBhIHJlZ2lvbiwgc28gdGhlIGNoZWNrIGFib3ZlIGFuc3dlcnMgIm5vdGhpbmcgaXMgb3ZlciBtZSIgd2hpbGUgYQpwcmVzZW50ZXItb3duZWQgc2NyZWVuIGlzIHVwLiBUaGF0IGlzIGluY29tcGxldGVuZXNzLCBub3Qgd3JvbmduZXNzOiB0aGUKbm90aWZpY2F0aW9uIGlzIGNvcnJlY3QgZm9yIGV2ZXJ5IHJlZ2lvbiB0aGF0ICppcyogcHVzaGVkLCBhbmQgdG9kYXkgdGhlCnRleHQtc2NyZWVuIHBhdGggaXMgd2hhdCBwdXNoZXMgdGhlbS4KCiMjIFRoZSBIVUQsIHJlZ2lvbiBieSByZWdpb24KCmBodWQoY3R4KWAgaXMgdGhlIGNvbXBhbmlvbiB0byBgZnJvbnRlbmQoY3R4KWAuIGBmcm9udGVuZGAgaXMgdGhlIGR1bmdlb247IGBodWRgCmlzIGV2ZXJ5dGhpbmcgYXJvdW5kIGl0OiB0aGUgbWVzc2FnZSBsaW5lLCB0aGUgdml0YWxzLCB0aGUgc3RhdHVzIGxpbmUsIGFuZAp1bmxpa2UgdGhlIG1hcCwgKippdCBpcyBvd25lZCBvbmUgcmVnaW9uIGF0IGEgdGltZSoqOgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICBodWQoY3R4KSB7CiAgICBjb25zdCBjYW52YXMgPSBtYWtlTXlQYW5lbChnbG9iYWxUaGlzLmRvY3VtZW50KTsKICAgIHJldHVybiB7CiAgICAgIHNpZGViYXI6IHsKICAgICAgICBwcmVzZW50KHNlY3Rpb24sIGZyYW1lKSB7CiAgICAgICAgICBjb25zdCBib3ggPSBzZWN0aW9uLnJlZ2lvbj8ucGl4ZWxzOwogICAgICAgICAgaWYgKCFib3gpIHJldHVybjsgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGdlb21ldHJ5OiBkcmF3IG5vdGhpbmcKICAgICAgICAgIHBsYWNlT24oY2FudmFzLCBib3gpOwogICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBzZWN0aW9uLmVudHJpZXMpIHsKICAgICAgICAgICAgZHJhdyhlbnRyeS5rZXksIHRleHRPZihlbnRyeSksIGlua0ZvcihlbnRyeS5ydW5zWzBdPy5jb2xvcikpOwogICAgICAgICAgfQogICAgICAgIH0sCiAgICAgIH0sCiAgICB9OwogIH0sCn07CmBgYAoKUmV0dXJuIGEgc2luayBmb3IgZWFjaCByZWdpb24geW91IGFyZSB0YWtpbmcgYW5kIG9taXQgdGhlIHJlc3Q7IHRoZXkgc3RheSB0aGUKZ2FtZSdzIGFuZCBrZWVwIGJlaW5nIGRyYXduLiBgdW5kZWZpbmVkYCBvciBge31gIGRlY2xpbmVzIGV2ZXJ5dGhpbmcsIHdoaWNoIGlzCnRoZSByaWdodCBhbnN3ZXIgb24gYSBob3N0IHlvdSBjYW5ub3QgZHJhdyBvbjogYSAqdGhyb3dpbmcqIGZhY3RvcnkgYWxzbyBsb3Nlcwp5b3VyIHJlZ2lvbnMgYnV0IGlzIHJlcG9ydGVkIGFzIHlvdXIgZmF1bHQsIGFuZCAidGhlcmUgaXMgbm8gZG9jdW1lbnQgaGVyZSIgaXMKbm90IGEgZmF1bHQuCgpFYWNoIHJlZ2lvbiBuZWVkcyBpdHMgb3duIGNhcGFiaWxpdHksIG9yIHRoZSB3aWxkY2FyZCBmb3IgYWxsIHRocmVlOgoKYGBganNvbgp7ICJzaGFwZSI6ICJwbHVnaW4iLCAiY2FwYWJpbGl0aWVzIjogWyJ1aTpzaWRlYmFyLnJlcGxhY2UiXSB9CmBgYAoKYHVpOm1lc3NhZ2VzLnJlcGxhY2VgLCBgdWk6c2lkZWJhci5yZXBsYWNlYCwgYHVpOnN0YXR1cy5yZXBsYWNlYCwKYHVpOioucmVwbGFjZWAuIFRoZXJlIGlzIGRlbGliZXJhdGVseSBubyBgdWk6bWFwLnJlcGxhY2VgOiB0aGUgZHVuZ2VvbiBpcwpgZGlzcGxheTpyZXBsYWNlYCdzLCBhbmQgb25lIHJlZ2lvbiBhbnN3ZXJpbmcgdG8gdHdvIGNhcGFiaWxpdGllcyB3b3VsZCBiZSB0d28KYW5zd2VycyB0byAid2hvIGRyYXdzIHRoaXMiLiBUaGUgdHdvIGRvIG5vdCBjb3ZlciBlYWNoIG90aGVyIGluIGVpdGhlcgpkaXJlY3Rpb246IGhvbGRpbmcgdGhlIG1hcCBkb2VzIG5vdCBsZXQgeW91IGRyYXcgdGhlIHZpdGFscywgYW5kIGhvbGRpbmcgdGhlCndob2xlIGludGVyZmFjZSBkb2VzIG5vdCBsZXQgeW91IGRyYXcgdGhlIG1hcC4KCioqVGhlIGNhcGFiaWxpdHkgaXMgdGhlIGNsYWltLioqIFRoZSBob3N0IHBpY2tzIGVhY2ggcmVnaW9uJ3Mgb3duZXIgZnJvbSB0aGUKKm1hbmlmZXN0cyosIGJlZm9yZSBpdCBjYWxscyBhbnlib2R5J3MgYGh1ZCgpYCwgc28gYSBtb2QgdGhhdCBsb3NlcyBpcyBuZXZlcgpjb25zdHJ1Y3RlZCBhbmQgY2Fubm90IG1vdW50IFVJIGl0IHdpbGwgbmV2ZXIgZHJhdyBpbnRvLiBUd28gY29uc2VxdWVuY2VzIGZvbGxvdywKYW5kIGJvdGggYXJlIHdvcnRoIGtub3dpbmcgYmVmb3JlIHlvdSB3cml0ZSB0aGUgbWFuaWZlc3Q6CgotIEEgc2luayBmb3IgYSByZWdpb24geW91IGRpZCBub3QgYXNrIGZvciBpcyAqKmRyb3BwZWQgYW5kIHJlcG9ydGVkIGJ5IG5hbWUqKi4KLSBBIHJlZ2lvbiB5b3Ugd29uIGFuZCB0aGVuIGRlY2xpbmVkIGdvZXMgYmFjayB0byB0aGUgKipnYW1lKiosIG5vdCBvbiB0byB0aGUKICBuZXh0IGNsYWltYW50LiBBc2sgZm9yIHRoZSByZWdpb25zIHlvdSBhY3R1YWxseSBkcmF3LgoKKipXaGF0IHlvdSBnZXQgb24gZXZlcnkgcmVwYWludCoqIGlzIHlvdXIgb3duIGBzZWN0aW9uYCBwbHVzIHRoZSB3aG9sZSBgZnJhbWVgLApib3RoIGZyb3plbiBhbmQgc3RydWN0dXJhbGx5IHlvdXJzLCBzbyByZXRhaW5pbmcgb25lIHRvIGFuaW1hdGUgZnJvbSBpcyBzYWZlLiBUaGUKZnJhbWUgaXMgdGhlIGNvbnRleHQgdGhhdCBjaGFuZ2VzIHdoYXQgYSBzZWN0aW9uICptZWFucyo6IGBmcmFtZS50YXJnZXRpbmdgIHNheXMKdGhlIG1lc3NhZ2Ugcm93IGlzIGEgbG9vay1kZXNjcmlwdGlvbiByYXRoZXIgdGhhbiBhIG1lc3NhZ2UsIGFuZCBgZnJhbWUubGF5b3V0YAooYCJsZWZ0IiB8ICJ0b3AiIHwgIm5vbmUiYCkgc2F5cyB3aGV0aGVyIHRoZSB2aXRhbHMgYXJlIGEgY29sdW1uLCBhIG9uZS1saW5lCmhlYWRlciwgb3IgdHVybmVkIG9mZi4gVW5kZXIgYCJub25lImAgdGhlcmUgaXMgbm8gYHNpZGViYXJgIHNlY3Rpb24gYXQgYWxsIGFuZAp5b3VyIHNpbmsgaXMgc2ltcGx5IG5vdCBjYWxsZWQ6IHRoZSBwbGF5ZXIgdHVybmVkIHRoZSBmdXJuaXR1cmUgb2ZmLCB3aGljaCBpcyBhCmNob2ljZSB0byByZXNwZWN0IHJhdGhlciB0aGFuIG9uZSB0byBzdHlsZS4KClJlYWQgYGVudHJ5LmtleWAsIG9uZSBvZiBgaHBgLCBgc3BgLCBgYWNgLCBgZGVwdGhgLCBgc3RhdGVgOiB0aGUgZW5naW5lJ3Mgb3duCmBzaWRlX2hhbmRsZXJzW11gIC8gYHN0YXR1c19oYW5kbGVyc1tdYCBuYW1lIG1pbnVzIGl0cyBgcHJ0X2AgcHJlZml4LCBhbmQKYHJ1bi5jb2xvcmAsIGl0cyBgQ09MT1VSXypgIGF0dHJpYnV0ZSwgd2hpY2ggeW91IHJlc29sdmUgdGhyb3VnaApgY3R4LmNvcmUuQ09MT1VSX0xfR1JFRU5gIGFuZCBmcmllbmRzICoqYnkgbmFtZSoqLCBuZXZlciBieSB0aGUgbnVtYmVyIGl0CmN1cnJlbnRseSBoYXMuIGBydW4uY3NzYCBhbmQgYGVudHJ5LnNjcmVlbmAgYXJlIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCdzIG93bgpwcm9qZWN0aW9uOiB0aGVyZSBmb3IgYSB0ZXh0LW1vZGUgcmVwbGFjZW1lbnQsIGFuZCB0aGUgdGhpbmcgdG8gaWdub3JlIGlmIHlvdSBhcmUKZHJhd2luZyB5b3VyIG93bi4KCioqQSBmYXVsdCBjb3N0cyB5b3Ugb25lIHJlZ2lvbi4qKiBJZiB5b3VyIGBzdGF0dXNgIHNpbmsgdGhyb3dzLCB0aGUgZ2FtZSByZXN1bWVzCmRyYXdpbmcgdGhlIHN0YXR1cyBsaW5lIGZvciB0aGUgcmVzdCBvZiB0aGUgc2Vzc2lvbiBhbmQgc2F5cyBzbyBieSBuYW1lOyB5b3VyCmBzaWRlYmFyYCBrZWVwcyBkcmF3aW5nLCBhbmQgdGhlIHBsYXllciBrZWVwcyB0aGVpciBnYW1lLgoKKipEcmF3IGJhcnMgZnJvbSBgZW50cnkudmFsdWVzYCwgbmV2ZXIgZnJvbSB0aGUgdGV4dC4qKiBBbiBlbnRyeSBjYXJyaWVzIHRoZQpudW1iZXJzIGl0cyB0ZXh0IHdhcyBmb3JtYXR0ZWQgZnJvbSwgc28gaGl0IHBvaW50cyBhcnJpdmUgYXMKYHsgY3VycmVudDogNywgbWF4OiAzNCB9YCBiZXNpZGUgYCJIUCAgIDcvICAzNCJgLiBQYXJzaW5nIHRoZSBzdHJpbmcgd29ya3MgcmlnaHQKdXAgdW50aWwgc29tZWJvZHkgbG9hZHMgYSBwcmVmIGZpbGUsIHBsYXlzIGluIGFub3RoZXIgbGFuZ3VhZ2UsIG9yIGEgY29udGVudCBwYWNrCndpZGVucyBhIGZpZWxkOiBpdCBpcyB0aGUgcmV2ZXJzZS1lbmdpbmVlcmluZyB0aGlzIHNlYW0gZXhpc3RzIHRvIGVuZC4KClRoZSBjb252ZW50aW9uIGlzIG9uZSBydWxlIGFuZCBpdCBpcyB3b3J0aCByZWFkaW5nIG9uY2UuICoqYGN1cnJlbnRgIGFuZCBgbWF4YApUT0dFVEhFUiBtZWFuIHRoZSBmaWVsZCBpcyBhIHByb3BvcnRpb24qKiwgYW5kIGBjdXJyZW50IC8gbWF4YCBpcyBtZWFuaW5nZnVsLgpFdmVyeSBvdGhlciBrZXkgaXMgYSBwbGFpbiBuYW1lZCBxdWFudGl0eS4gQSBmaWVsZCB3aXRoIHR3byBudW1iZXJzIHRoYXQgYXJlICpub3QqCmEgcmF0aW8gZGVsaWJlcmF0ZWx5IGF2b2lkcyB0aG9zZSBuYW1lczogYSBzdGF0IHB1Ymxpc2hlcyBgdXNlYCAvIGBjdXJgIC8gYG1heGAsCmJlY2F1c2UgYDExOGAgaXMgYW4gZW5jb2RpbmcgbWVhbmluZyAxOC8xMDAgYW5kIGEgYmFyIG92ZXIgaXQgd291bGQgcmVwb3J0IGEgbWF4ZWQKY2hhcmFjdGVyIGFzIDE1JS4gU28gYGlmICh2LmN1cnJlbnQgIT09IHVuZGVmaW5lZCAmJiB2Lm1heCAhPT0gdW5kZWZpbmVkKSBkcmF3QmFyKCkKZWxzZSBkcmF3VGV4dCgpYCBpcyBzYWZlIG9uIGV2ZXJ5IGZpZWxkLCBpbmNsdWRpbmcgb25lcyBhZGRlZCBhZnRlciB5b3Ugc2hpcHBlZC4KCkFic2VudCBhbHdheXMgbWVhbnMgKnRoZSBnYW1lIGRvZXMgbm90IGtub3cqLCBuZXZlciB6ZXJvOiB0aGUgbW9uc3RlciBoZWFsdGggYmFyCnB1Ymxpc2hlcyBub3RoaW5nIHdoaWxlIGl0IHJlYWRzIGBbLS0tLS0tLS0tLV1gLCBhbmQgYHNwYCBpcyBhYnNlbnQgZm9yIGEgY2xhc3MKd2l0aCBubyBtYW5hIHJhdGhlciB0aGFuIGAwLzBgLiBUaGUgZnVsbCBwZXItZmllbGQga2V5IGxpc3QgaXMgb24gYEh1ZFZhbHVlc2AgaW4KdGhlIFNESy4KCmBzYW1wbGVzL3ZpdGFscy1wYW5lbC9gIGlzIGEgY29tcGxldGUgd29ya2VkIGV4YW1wbGU6IGl0IHRha2VzIGBzaWRlYmFyYCBhbG9uZQphbmQgbGVhdmVzIHRoZSByZXN0IG9mIHRoZSBzY3JlZW4gdG8gdGhlIGdhbWUuCgojIyBgbWVudShjdHgpYDogYXNrIHRoZSBnYW1lJ3MgcXVlc3Rpb25zIHlvdXIgb3duIHdheQoKVGhlIHRoaXJkIG93bmVyIHNlYW0sIGFuZCB0aGUgb25lIHRoYXQgaXMgZGlmZmVyZW50IGluIGtpbmQuIEEgSFVEIHNlY3Rpb24gaXMKKipkcmF3bioqOyBhIG1lbnUgaXMgKiphc2tlZCoqLiBTbyB0aGUgYm91bmRhcnkgaXMgbm90IGBwcmVzZW50KGZyYW1lKWAgYnV0CmBhc2socXVlc3Rpb24pIC0+IGFuc3dlcmAsIGFuZCB0YWtpbmcgYSBxdWVzdGlvbiBtZWFucyB0YWtpbmcgaXRzIGlucHV0IHRvbzogYQpwcmVzZW50YXRpb24gdGhhdCBjb3VsZCBub3QgYWNjZXB0IGEgY2hvaWNlIHdvdWxkIG5vdCBiZSBhIHByZXNlbnRhdGlvbiBvZiBhCm1lbnUuCgpgYGBqcwptZW51KGN0eCkgewogIHJldHVybiB7CiAgICBhc2socXVlc3Rpb24pIHsKICAgICAgaWYgKHF1ZXN0aW9uLmlkICE9PSAiY29yZTpnYW1lLW1lbnUiKSByZXR1cm4gdW5kZWZpbmVkOyAgIC8vIGRlY2xpbmUKICAgICAgcmV0dXJuIGRyYXdEaWFsQW5kV2FpdChxdWVzdGlvbik7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtPiBNZW51QW5zd2VyCiAgICB9LAogIH07Cn0KYGBgCgpHYXRlZCBieSB0aGUgc2luZ2xlIGB1aTptZW51LnJlcGxhY2VgIGNhcGFiaWxpdHkgKG9yIHRoZSB3aWxkY2FyZApgdWk6Ki5yZXBsYWNlYCkuICoqT25lIGdyYW50IGZvciBldmVyeSBtZW51KiosIG5vdCBvbmUgcGVyIG1lbnUgaWQ6IHRoZXJlIGFyZQp+NTAgb2YgdGhlbSwgYW5kIDUwIGNhcGFiaWxpdHkgc3RyaW5ncyB3b3VsZCBiZSBhIGNvbnNlbnQgbGlzdCBub2JvZHkgY291bGQgcmVhZC4KCioqRGVjbGluaW5nIGlzIHRoZSBub3JtYWwgY2FzZSwgbm90IGEgZmFpbHVyZSBwYXRoLioqIFlvdXIgcHJlc2VudGVyIGlzIG9mZmVyZWQKZXZlcnkgbWVudSB0aGUgZ2FtZSBhc2tzLCBhbmQgcmV0dXJucyBgdW5kZWZpbmVkYCBmcm9tIGBhc2tgIGZvciB0aGUgb25lcyB5b3UKaGF2ZSBubyBiZXR0ZXIgd2F5IHRvIHByZXNlbnQ7IHRoZSBnYW1lIHRoZW4gYXNrcyB0aG9zZSBpdHMgb3duIHdheS4gQSByYWRpYWwKZGlhbCBmb3Igc2l4IGNvbW1hbmQgdmVyYnMgZ2VudWluZWx5IGhhcyBubyBvcGluaW9uIGFib3V0IHRoZSBtb2QgbWFuYWdlcidzCnRoaXJ0eS1yb3cgbGlzdC4gRGVjbGluaW5nIGNvc3RzIG5vdGhpbmc6IHlvdSBkcmV3IG5vdGhpbmcsIGFuZCB0aGVyZSBpcyBubwpzdXJmYWNlIGxlZnQgaGFsZi1vd25lZC4KCioqQW5zd2VyIGJ5IHRoZSBjaG9pY2UncyBzdGFibGUgYGlkYCwgbmV2ZXIgYnkgYW4gaW5kZXguKiogQW4gaW5kZXggaXMgYSBmYWN0CmFib3V0IGEgbGF5b3V0LCBhbmQgaWYgeW91IGhhdmUgZ3JvdXBlZCB0aGUgY2hvaWNlcyBpbnRvIHRoZSB3ZWRnZXMgb2YgYSBkaWFsIHlvdQpoYXZlIG5vIGluZGV4IHRoZSBnYW1lIHdvdWxkIHJlY29nbmlzZS4gUmVhZCBgY2hvaWNlLnNlbWFudGljYCAoYHtraW5kLCByZWZ9YCkgZm9yCndoYXQgYSBjaG9pY2UgKm1lYW5zKiwgaW5kZXBlbmRlbnQgb2YgaXRzIHdvcmRpbmcsIGFuZCBgcXVlc3Rpb24uaWRgIHRvIHJlY29nbmlzZQp3aGljaCBxdWVzdGlvbiB5b3UgYXJlIGJlaW5nIGFza2VkLgoKVGhlIGFuc3dlcnMgYXJlIGBjaG9vc2VgLCBgY2FuY2VsYCwgYGNvbW1hbmRgIGFuZCBgb3B0aW9uc2AuICoqYGNvbW1hbmRgIHJ1bnMgb25lCm9mIGBxdWVzdGlvbi5jb21tYW5kc2AqKiwgdGhlIGNhbGxlcidzIG93biBoYW5kbGVyLCBleGFjdGx5IGFzIHRoZSBrZXkgd291bGQsCmFuZCB0aGUgcXVlc3Rpb24gaXMgdGhlbiBhc2tlZCAqYWdhaW4qIHVubGVzcyB0aGF0IGhhbmRsZXIgcmVzb2x2ZWQgaXQuIFRoYXQgaXMKaG93IGEgcmVpbWFnaW5lZCBzdG9yZSBjYW4gb2ZmZXIgImJ1eSIgd2l0aG91dCBrbm93aW5nIHdoYXQgYnV5aW5nIGRvZXMuIFlvdQpjYW5ub3QgaW52ZW50IHRob3NlIGtleXM7IHRoZXkgYmVsb25nIHRvIHdob2V2ZXIgb3BlbmVkIHRoZSBtZW51LgoKKipUaHJvd2luZyBjb3N0cyB5b3UgdGhlIHNlYW0gZm9yIHRoZSBzZXNzaW9uLCBvbiBldmVyeSBtZW51KiosIHVubGlrZSBgaHVkYCwKd2hlcmUgYSBmYXVsdCBjb3N0cyBvbmUgcmVnaW9uLiBBIHByZXNlbnRlciB0aGF0IHRocm93cyBvbiBvbmUgcXVlc3Rpb24gZ2VuZXJhbGx5CnRocm93cyBvbiBhbGwgb2YgdGhlbSwgYW5kIG9uZSByZXBvcnQgYmVhdHMgYSByZXBvcnQgZXZlcnkgdGltZSB0aGUgcGxheWVyIG9wZW5zCmFueXRoaW5nLiBBbnN3ZXJzIHRoYXQgY2Fubm90IGJlIGhvbm91cmVkIChhbiB1bmtub3duIGNob2ljZSBpZCwgYSBjaG9pY2Ugb24gYQpicm93c2Utb25seSBxdWVzdGlvbiwgYSBjb21tYW5kIGtleSB0aGF0IHdhcyBuZXZlciBvZmZlcmVkKSBjb3N0IHlvdSAqdGhhdCBtZW51Cm9ubHkqLCBhbmQgYXJlIHJlcG9ydGVkLgoKKipBIG1lbnUgc3RpbGwgaGFzIG5vIHB1Ymxpc2hlZCByZWdpb24gb2YgaXRzIG93bioqLCB0aG91Z2ggb3ZlcmxhcHBpbmcsIG9yZGVyZWQsCm1vZC1jcmVhdGVkIHJlZ2lvbnMgaGF2ZSBzaW5jZSBsYW5kZWQ7IHNlZSBbYHJlZ2lvbnMoY3R4KWBdKCNyZWdpb25zY3R4LXB1dC1mdXJuaXR1cmUtb2YteW91ci1vd24tb24tdGhlLXNjcmVlbikuCmByZWdpb25zLnRzYCBuYW1lcyB0aGUgZm91ciBwYXJ0cyBvZiB0aGUgc2NyZWVuIHRoYXQgdGlsZSBpdCwgYW5kIGEgZmxvYXRpbmcgbWVudQppcyBieSBkZWZpbml0aW9uIG9uZSB0aGF0IG92ZXJsYXBzLiBgcXVlc3Rpb24uc3R5bGVgIHRlbGxzIHlvdSB3aGV0aGVyIHRoZSBnYW1lCndvdWxkIGhhdmUgY2xlYXJlZCB0aGUgc2NyZWVuIChgInNjcmVlbiJgKSBvciBkcmF3biBhIGJveCBvdmVyIGEgc3RpbGwtdmlzaWJsZQptYXAgKGAib3ZlcmxheSJgKS4KCmBzYW1wbGVzL2NvbW1hbmQtZGlhbC9gIGlzIGEgY29tcGxldGUgd29ya2VkIGV4YW1wbGU6IGl0IHRha2VzIHRoZSBnYW1lIG1lbnUgYW5kCmRlY2xpbmVzIGV2ZXJ5IG90aGVyIHF1ZXN0aW9uIGluIHRoZSBnYW1lLgoKIyMgYHNjcmVlbihjdHgpYDogc2hvdyB0aGUgZ2FtZSdzIGZ1bGwgc2NyZWVucyB5b3VyIG93biB3YXkKClRoZSBmb3VydGggb3duZXIgc2VhbSwgYW5kIHRoZSBvbmUgdGhhdCByZWFjaGVzIHRoZSAqKmNvbnRlbnQqKiByYXRoZXIgdGhhbiB0aGUKZnJhbWUuIEJlZm9yZSBpdCwgdGhlIGludmVudG9yeSBhcnJpdmVkIGFzIGBTY3JlZW5MaW5lW11gLCBhIHJvdyBvZiBjaGFyYWN0ZXJzCmFuZCBhIGNvbG91ciwgc28gYSBtb2Qgd2FudGluZyB0byBkcmF3IGl0ZW1zIGFzIHNwcml0ZSBjYXJkcyB3b3VsZCBoYXZlIGhhZCB0bwpwYXJzZSBgImEpIGEgUG90aW9uIG9mIEN1cmUgTGlnaHQgV291bmRzICAgICAgIDQuMCBsYiJgIGJhY2sgaW50byBhIG5hbWUgYW5kIGEKd2VpZ2h0LCBhbmQgd291bGQgYnJlYWsgdGhlIGRheSBhIHByZWYgZmlsZSBjaGFuZ2VkIGEgY29sb3VyIG9yIGEgdHJhbnNsYXRpb24KY2hhbmdlZCBhIHdpZHRoLiBBIHNjcmVlbiBub3cgYXJyaXZlcyBhcyBhICoqZG9jdW1lbnQgb2YgYmxvY2tzKiouCgpgYGBqcwpzY3JlZW4oY3R4KSB7CiAgcmV0dXJuIHsKICAgIHNob3codmlldykgewogICAgICBpZiAodmlldy5pZCAhPT0gImNvcmU6aW52ZW50b3J5IikgcmV0dXJuIHVuZGVmaW5lZDsgICAgICAgIC8vIGRlY2xpbmUKICAgICAgY29uc3QgdGFibGUgPSB2aWV3LmJsb2Nrcy5maW5kKChiKSA9PiBiLmtpbmQgPT09ICJ0YWJsZSIpOwogICAgICBkcmF3Q2FyZHModGFibGUucm93cyk7ICAgICAgICAgICAgLy8gcm93LmNlbGxzLm5hbWUudGV4dCwgcm93LnNlbWFudGljLCAuLi4KICAgICAgcmV0dXJuIHsgZGlzbWlzc2VkOiB3aGVuVGhlUGxheWVyQ2xvc2VzKCkgfTsKICAgIH0sCiAgfTsKfQpgYGAKCkdhdGVkIGJ5IHRoZSBzaW5nbGUgYHVpOnNjcmVlbi5yZXBsYWNlYCBjYXBhYmlsaXR5IChvciB0aGUgd2lsZGNhcmQKYHVpOioucmVwbGFjZWApLCBvbiB0aGUgc2FtZSBiYXJnYWluIGFzIGBtZW51YDogKipvbmUgZ3JhbnQgZm9yIGV2ZXJ5IHNjcmVlbioqLAphbmQgdGhlIGZpbmUgY2hvaWNlIG1hZGUgcGVyIHNjcmVlbiBieSBkZWNsaW5pbmcuCgoqKkEgbGlzdCBpcyBhIGB0YWJsZWAsIGFuZCBjZWxscyBhcmUgYWRkcmVzc2VkIGJ5IGNvbHVtbiBrZXkuKiogQ29sdW1ucyBoYXZlCnN0YWJsZSBrZXlzOiBgbmFtZWAsIGBzbG90YCwgYHdlaWdodGAsIGB0dXJuYCwgc28geW91IHJlYWQgYHJvdy5jZWxscy5uYW1lLnRleHRgCmFuZCBuZXZlciBjb3VudCBjaGFyYWN0ZXJzLiBBIGNvbHVtbiBwdWJsaXNoZXMgdGhyZWUgZmFjdHMgYWJvdXQgdGhlICp0ZXJtaW5hbCdzKgpsYXlvdXQsIGFsbCBvZiB3aGljaCB5b3UgYXJlIGZyZWUgdG8gaWdub3JlOiBgd2lkdGhgICh0aGUgZmllbGQgd2lkdGggd2hlcmUKdXBzdHJlYW0gZml4ZWQgb25lKSwgYGdhcGAgKGNvbHVtbnMgb2Ygc3BhY2UgYmVmb3JlIGl0LCBhcyB0aGUgaGlzdG9yeSBzY3JlZW4gd3JpdGVzCmAiJTEwbGQlN2QnICAlcyJgLCBubyBnYXAgYmVmb3JlIHRoZSBkZXB0aCBhbmQgdHdvIGJlZm9yZSB0aGUgbm90ZSkgYW5kIGBwYWRgCihmYWxzZSB3aGVyZSB0aGUgZ2FtZSBkb2VzICoqbm90KiogbGluZSB0aGUgY29sdW1uIHVwLCBhcyB0aGUgb2JqZWN0IGxpc3Qncwpsb2NhdGlvbiBzaW1wbHkgZm9sbG93cyB0aGUgbmFtZSkuIFRoZXkgYXJlIHB1Ymxpc2hlZCAqYmVzaWRlKiB0aGUgZGF0YSByYXRoZXIKdGhhbiBiYWtlZCBpbnRvIGl0IGFzIHBhZGRpbmcsIHdoaWNoIGlzIHdoYXQgbWFrZXMgYm90aCByZW5kZXJpbmdzIHBvc3NpYmxlIGZyb20Kb25lIG1vZGVsLgoKKipBIHJvdyBtZWFucyBzb21ldGhpbmcuKiogYHJvdy5zZW1hbnRpY2AgaXMgdGhlIHNhbWUgYHtraW5kLCByZWZ9YCBhIGBNZW51Q2hvaWNlYApjYXJyaWVzLCBzbyBhbiBpdGVtIGlzIG9uZSB0aGluZyB0byB5b3Ugd2hldGhlciB0aGUgZ2FtZSBpcyBsaXN0aW5nIGl0IG9yIGFza2luZwp5b3UgdG8gcGljayBvbmU6IGFuIGludmVudG9yeSByb3cgYW5kIGl0cyBwaWNrZXIgY2hvaWNlIHNoYXJlIGFuIGlkLiBBbiBlbXB0eQplcXVpcG1lbnQgc2xvdCBpcyBge2tpbmQ6ICJzbG90In1gIHJhdGhlciB0aGFuIGFuIGl0ZW0uIGByb3cuY29sb3JgIGlzIHRoZQpvYmplY3QncyBvd24gYXR0ciBhcyBDU1MsIGFuZCBgcm93LnRhZ2AgdGhlIGxldHRlciB0aGUgdGVybWluYWwgd291bGQgb2ZmZXIuCgoqKk51bWJlcnMgY29tZSB3aXRoIHRoZSB0ZXh0LioqIGBjZWxsLnZhbHVlc2AgZm9sbG93cyB0aGUgSFVEJ3MgY29udmVudGlvbgpleGFjdGx5OiBgY3VycmVudGAgKyBgbWF4YCAqdG9nZXRoZXIqIG1lYW4gYSBwcm9wb3J0aW9uOyBldmVyeSBvdGhlciBrZXkgaXMgYQpuYW1lZCBxdWFudGl0eTsgYWJzZW50IG1lYW5zIHRoZSBnYW1lIGRvZXMgbm90IGtub3cgaXQuIEEgd2VpZ2h0IGNlbGwgcHVibGlzaGVzCmB7ZWFjaCwgdG90YWwsIG51bWJlcn1gIGluIHRlbnRocyBvZiBhIHBvdW5kLCBzbyB5b3UgZm9ybWF0IGl0IHlvdXIgb3duIHdheS4KCioqQ2hlY2sgYHJvdy52YWx1ZXNgIGFzIHdlbGwgYXMgYGNlbGwudmFsdWVzYC4qKiBUaGUgbW9kZWwgaXMgYWxsb3dlZCB0byBjYXJyeQoqbW9yZSogdGhhbiB0aGUgcmVuZGVyaW5nLCBuZXZlciBsZXNzLCBzbyBhIG51bWJlciB0aGUgdGVybWluYWwgaGFzIG5vIGNvbHVtbiBmb3IKbGl2ZXMgb24gdGhlIHJvdzogdGhlIHF1aXZlciBwdWJsaXNoZXMgaXRzIHdlaWdodCB0aGF0IHdheSwgdGhlIG9iamVjdCBsaXN0IGl0cwpvZmZzZXQgYXMgYHtkeSwgZHh9YCByYXRoZXIgdGhhbiBvbmx5IGFzIGAiMiBOIDAgVyJgLCB0aGUgcGxheWVyIGhpc3RvcnkgdGhlCmNoYXJhY3RlciBsZXZlbCBpdCBuZXZlciBwcmludHMuIFRob3NlIGFyZSBleGFjdGx5IHRoZSBudW1iZXJzIGEgcHJlc2VudGVyIG5lZWRzCmFuZCBhIHRleHQgc2NyZWVuIGNhbm5vdCBzaG93LgoKKipQcm9zZSBhcnJpdmVzIFVOV1JBUFBFRCwgaW4gYSBgdGV4dGAgYmxvY2suKiogYHBhcmFncmFwaHNgIGlzIGEgcnVuIHN0cmVhbSBwZXIKcGFyYWdyYXBoLCBzcGxpdCB3aGVyZSB0aGUgZ2FtZSBtZWFudCBhIGJyZWFrIGFuZCBub3doZXJlIGVsc2UsIHNvIHRoZSBvYmplY3QKcmVjYWxsLCB0aGUgb2JqZWN0IGNvbXBhcmlzb24gYW5kIHRoZSBtb25zdGVyIHJlY2FsbCBoYW5kIHlvdSB0aGUgdGV4dCBhbmQgbGV0Cip5b3UqIGNob29zZSB0aGUgd2lkdGguIFRoYXQgaXMgdGhlIGRpZmZlcmVuY2UgdGhlIGJsb2NrIGV4aXN0cyBmb3I6IGEgYGxpbmVzYApibG9jayBoYXMgYWxyZWFkeSBiZWVuIGJyb2tlbiBpbnRvIHRlcm1pbmFsLXdpZHRoIHJvd3MsIGFuZCByZS1mbG93aW5nIHRob3NlIHRvIGEKcGFuZWwgb2YgeW91ciBvd24gc2l6ZSBtZWFucyB1bmRvaW5nIHRoZSBnYW1lJ3Mgd3JhcCBmaXJzdCBhbmQgZ3Vlc3Npbmcgd2hpY2gKYnJlYWtzIHdlcmUgdGhlIGdhbWUncyBhbmQgd2hpY2ggd2VyZSB0aGUgc2VudGVuY2Uncy4gYGJsb2NrLmNvbG9yYCBpcyB0aGUKcHJvc2UncyBkZWZhdWx0LCBmb3IgdGhlIHBhcnRzIG5vIHJ1biBzcGVha3MgZm9yLgoKYGJsb2NrLmZsb3dgIG5hbWVzICoqd2hpY2gqKiBvZiBBbmdiYW5kJ3MgdHdvIHdyYXBzIGxhaWQgdGhlIHByb3NlIG91dCwgZm9yIGEKcHJlc2VudGVyIHRoYXQgd2FudHMgdG8gcmVwcm9kdWNlIHRoZSB0ZXJtaW5hbCByYXRoZXIgdGhhbiByZS1mbG93LiBBYnNlbnQgbWVhbnMKYHRleHRibG9ja19jYWxjdWxhdGVfbGluZXNgLCB3aGljaCBpcyBldmVyeSBwYWdlIGJ1dCBvbmU7IGAidGV4dC1vdXQiYCBtZWFucwpgdGV4dF9vdXRfdG9fc2NyZWVuYCwgd2hpY2ggaXMgdGhlIGNoYXJhY3RlciBzaGVldCdzIGhpc3RvcnkgYW5kIG5vdGhpbmcgZWxzZS4KVGhleSBkaWZmZXIgYnkgdHdvIGNvbHVtbnMgYW5kIGJ5IHdoZXRoZXIgYSBzZW50ZW5jZSdzIHNlY29uZCBzcGFjZSBzdXJ2aXZlcyBhCmJyZWFrLCBzbyBhIHJlbmRlcmVyIHRoYXQgYXNzdW1lZCBvbmUgcnVsZSBmb3IgYm90aCB3YXMgd3Jvbmcgb24gb25lIG9mIHRoZW0uCk1vc3QgcHJlc2VudGVycyBjYW4gaWdub3JlIHRoaXMgZW50aXJlbHk6IGl0IG1hdHRlcnMgb25seSBpZiB5b3UgYXJlIHdyYXBwaW5nCiphcyB0aGUgdGVybWluYWwgd291bGQqIHJhdGhlciB0aGFuIGF0IGEgd2lkdGggb2YgeW91ciBvd24uCgoqKkFydCBhbmQgdGhlIHdyaXRpbmcgb24gaXQgYXJlIHNlcGFyYXRlLioqIEFuIGBhcnRgIGJsb2NrJ3MgYGxpbmVzYCBhcmUgdGhlCnBpY3R1cmUsIHRoZSB0b21ic3RvbmUgb3IgdGhlIHdpbm5lcidzIGNyb3duLCBhbmQgaXRzIGBmaWVsZHNgIGFyZSB0aGUgdGV4dCB0aGUKZ2FtZSB3cml0ZXMgKm9udG8qIHRoZSBwaWN0dXJlLiBVcHN0cmVhbSdzIHRvbWJzdG9uZSBpcyBvbmUgZHJhd2luZyB3aXRoIHRoZQpjaGFyYWN0ZXIgYnVybmVkIGludG8gY29sdW1ucyA4LTM5IG9mIGl0LCBzbyBhIHByZXNlbnRlciBoYW5kZWQgb25seSB0aGUgZHJhd2luZwp3b3VsZCBoYXZlIHRvIGtub3cgdGhhdCB0byBnZXQgdGhlIG5hbWUgYmFjay4gSW5zdGVhZCBlYWNoIGZpZWxkIGNhcnJpZXMgYSBzdGFibGUKYGtleWAgKGBuYW1lYCwgYHRpdGxlYCwgYGNsYXNzYCwgYGxldmVsYCwgYGV4cGAsIGBnb2xkYCwgYGRlYXRoYCwgYGtpbGxlcmAsCmBkYXRlYCksIGl0cyBgdGV4dGAsIGFuZCBgdmFsdWVzYCB3aGVyZSB0aGUgdGV4dCBpcyBhIGZvcm1hdHRlZCBudW1iZXIuIFRoZQpgcm93YC9geDFgL2B4MmAgYmVzaWRlIHRoZW0gYXJlIHdoZXJlIHRoZSAqZmFpdGhmdWwgdGVybWluYWwqIHB1dHMgZWFjaCBvbmU7Cmlnbm9yZSB0aGVtIGFuZCBkcmF3IGEgcmVhbCBncmF2ZXN0b25lLiBBIGZpZWxkIHdpdGggbm8gYmFuZCBpcyBjZW50cmVkIG9uIHRoZQpmdWxsIHdpZHRoLCB3aGljaCBpcyB3aGF0IHVwc3RyZWFtIGRvZXMgZm9yIHRoZSB3aW5uZXIncyBiYW5uZXIuCgoqKkEgY29sdW1uIGNhbiBjYXJyeSBhIHBpY3R1cmUsIGFuZCBhIHRhYmxlIGNhbiBzcGFjZSBpdHNlbGYuKiogVGhlIGNoYXJhY3RlcgpzaGVldCdzIGZsYWcgZ3JpZCBoYXMgb25lIGNvbHVtbiBwZXIgZXF1aXBtZW50IHNsb3QsIGFuZCB1cHN0cmVhbSBkcmF3cyB0aGUgKndvcm4KaXRlbSdzKiBnbHlwaCBvdmVyIGVhY2guIFRoYXQgaXMgYSBmYWN0IGFib3V0IHRoZSBjb2x1bW4gKHdoYXQgaXMgaW4gdGhpcyBzbG90KSwKc28gaXQgYXJyaXZlcyBhcyBgY29sdW1uLmdseXBoYCByYXRoZXIgdGhhbiBhcyBhIGZpcnN0IHJvdyB5b3Ugd291bGQgaGF2ZSB0byBrbm93CnRvIHNraXA7IGRyYXcgdGhlIGl0ZW0ncyBpY29uIHRoZXJlLiBUd28gbW9yZSBsYXlvdXQgZmFjdHMgcHVibGlzaGVkIGJlc2lkZSB0aGUKZGF0YSByYXRoZXIgdGhhbiBiYWtlZCBpbnRvIGl0OiBgaGVhZGVyQ29sb3JgIGlzIHRoZSBoZWFkZXIgcm93J3MgY29sb3VyIHdoZXJlIHRoZQpnYW1lIGNvbG91cnMgaXQsIGFuZCBgZ2FwQWZ0ZXJgIGlzIHRoZSBibGFuayByb3dzIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCBsZWF2ZXMKdW5kZXIgYSB0YWJsZS4gQSBgdGV4dGAgYmxvY2sncyBgd3JhcGAgaXMgdGhlIHNhbWUgaWRlYSBmb3IgcHJvc2U6IHRoZSB3aWR0aAoqdXBzdHJlYW0qIHdyYXBzIGF0ICg3MiBmb3IgdGhlIGNoYXJhY3RlciBoaXN0b3J5IG9uIGFuIDgwLWNvbHVtbiBzY3JlZW4pLCBhbHdheXMKYSBjbGFtcCBhbmQgbmV2ZXIgYSBtaW5pbXVtLiBJZ25vcmUgYWxsIGZvdXIgaWYgeW91IGxheSB0aGluZ3Mgb3V0IHlvdXJzZWxmLgoKKipOb3QgZXZlcnkgc2NyZWVuIGhhcyBhIG1vZGVsIHlldC4qKiBgTU9ERUxMRURfU0NSRUVOU2AKKGBwYWNrYWdlcy93ZWIvc3JjL3NjcmVlbi12aWV3LnRzYCkgbmFtZXMgdGhlIG9uZXMgdGhhdCBkbywgdG9kYXkgdGhpcnR5LW5pbmU6IHRoZQppbnZlbnRvcnksIHRoZSBlcXVpcG1lbnQsIHRoZSBxdWl2ZXIsIHRoZSBvYmplY3QgbGlzdCwgdGhlIG1vbnN0ZXIgbGlzdCwgdGhlCm1lc3NhZ2UgaGlzdG9yeSwgdGhlCnBsYXllciBoaXN0b3J5LCB0aGUgb2JqZWN0IHJlY2FsbCwgdGhlIG9iamVjdCBjb21wYXJpc29uLCB0aGUgbW9uc3RlciByZWNhbGwsIHRoZQp0b21ic3RvbmUsIHRoZSB3aW5uZXIsIHRoZSBjaGFyYWN0ZXIgc2hlZXQncyB0d28gcGFnZXMgKGBjb3JlOmNoYXJhY3RlcmAgYW5kCmBjb3JlOmNoYXJhY3Rlci1mbGFnc2ApLCB0aGUga25vd2xlZGdlIGJyb3dzZXIncyBzZXZlbiByZWNhbGwgcGFnZXMKKGBjb3JlOnJ1bmUtcmVjYWxsYCwgYGNvcmU6ZmVhdHVyZS1yZWNhbGxgLCBgY29yZTp0cmFwLXJlY2FsbGAsCmBjb3JlOnNoYXBlLXJlY2FsbGAsIGBjb3JlOmFydGlmYWN0LXJlY2FsbGAsIGBjb3JlOmVnby1yZWNhbGxgLApgY29yZTpvYmplY3Qta2luZC1yZWNhbGxgKSwgdGhlIGZvdXIgaGVscCBwYWdlcyAoYGNvcmU6aGVscC1jb21tYW5kc2AsCmBjb3JlOmhlbHAtc3ltYm9sc2AsIGBjb3JlOmhlbHAtZ3VpZGVgLCBgY29yZTpoZWxwLWNvbW11bml0eWApLCB0aGUKZXF1aXBtZW50LWNvbXBhcmlzb24gc2NyZWVuJ3MgdHdvIGhlbHAgb3ZlcmxheXMgKGBjb3JlOmVxdWlwLWNtcC1oZWxwYCwKYGNvcmU6ZXF1aXAtY21wLXNlbGVjdC1oZWxwYCksIHRoZSBtb2QgbWFuYWdlcidzIGZvdXIgbGlzdGluZ3MKKGBjb3JlOm1vZC11cGRhdGVzYCwgYGNvcmU6bW9kLWF1dG8tc29ydGAsIGBjb3JlOm1vZC1jYXBhYmlsaXRpZXNgLApgY29yZTptb2QtY29uZmxpY3RzYCksIHRoZSBoYWxsIG9mIGZhbWUgKGBjb3JlOmhhbGwtb2YtZmFtZWApLCB0aGUga25vd2xlZGdlCm1lbnUncyBzdG9yZSB2aWV3IChgY29yZTpzdG9yZS1rbm93bGVkZ2VgKSwgdGhlIHVwZGF0ZSBhbmQgcmVwb3J0IHBhZ2VzCihgY29yZTp1cGRhdGVgLCBgY29yZTpyZXBvcnRgKSwgYW5kIHdpemFyZCBtb2RlJ3MgdHdvIGRlYnVnIHJlYWRvdXRzCihgY29yZTp3aXphcmQta2V5bG9nYCwgYGNvcmU6d2l6YXJkLWl0ZW1gKS4gRXZlcnl0aGluZyBlbHNlIGFycml2ZXMgdW5kZXIgdGhlCnNoYXJlZCBpZCBgY29yZTp0ZXh0YCB3aXRoIGEgc2luZ2xlIGBsaW5lc2AgYmxvY2sgb2YgcHJlLXdyYXBwZWQgcm93czogZW5vdWdoIHRvCnJlc2tpbiBhIGZyYW1lLCBub3QgZW5vdWdoIHRvIHJlaW1hZ2luZSBhIGxpc3RpbmcuICoqQ2hlY2sgYHZpZXcuaWRgLioqCgpXaGF0IGlzIGxlZnQgdW5kZXIgYGNvcmU6dGV4dGAgaXMgbm93IG1vc3RseSB0aGVyZSBvbiBwdXJwb3NlLiBFdmVyeQpgc2hvd1RleHRTY3JlZW5gIGNhbGwgc2l0ZSBpbiB0aGUgbW9kIG1hbmFnZXIgd2FzIHJlYWQgb25lIGF0IGEgdGltZSBpbiBBdWd1c3QKMjAyNiBhbmQgdHdlbnR5LWZvdXIgb2YgdGhlIHRoaXJ0eS10d28gd2VyZSBydWxlZCAqKnByb3NlKio6IHdhcm5pbmdzLCBvdXRjb21lCnJlcG9ydHMsIGVycm9yIGV4cGxhbmF0aW9ucyBhbmQgYSBtb2QgYXV0aG9yJ3Mgb3duIGRlc2NyaXB0aW9uLCB3aGljaCBhcmUKc2VudGVuY2VzIGEgaHVtYW4gcmVhZHMgYW5kIHdoaWNoIGEgcHJlc2VudGVyIGdhaW5zIG5vdGhpbmcgYnkgYWRkcmVzc2luZyBmaWVsZApieSBmaWVsZC4gVGhlIHNjcmVlbnMgdGhhdCBhcmUgc3RpbGwgZ2VudWluZWx5IHVuZmluaXNoZWQgYXJlIG5hbWVkIGluCmBNT0RfUkVBQ0gubWRgIGdhcCAyMSByYXRoZXIgdGhhbiBsZWZ0IGZvciB5b3UgdG8gZGlzY292ZXI6IHRoZSBzcGVsbCBsaXN0cywKd2hpY2ggYmVsb25nIHRvIHRoZSBtZW51IHNlYW07IGFuZCB0aGUgaW5zdGFsbC1yZWZ1c2FsIHNjcmVlbnMsIHdoaWNoIGFyZSBubwpsb25nZXIgYmxvY2tlZCBieSB0aGUgbW9kZWwgYnV0IGFyZSBub3QgeWV0IHdpcmVkIHRvIGl0IChzZWUgdGhlIG5leHQgc2VjdGlvbikuCgojIyMgUmVnaW9ucyBhcmUgc3RhY2tlZCwgYW5kIGEgc2NyZWVuIGlzIG9uZSBvZiB0aGVtCgpgdWktc3RhY2sudHNgIGhvbGRzIHRoZSBsaXZlIHN0YWNrLiBgcHVzaFJlZ2lvbmAgYWRkcyBhIHJlZ2lvbiwgdGhlIHJldHVybmVkCmhhbmRsZSdzIGByZWxlYXNlKClgIHJlbW92ZXMgaXQsIGByZWxheW91dFN0YWNrYCByZS1wbGFjZXMgZXZlcnkgcmVnaW9uIHdoZW4gdGhlCnRlcm1pbmFsIGNoYW5nZXMgc2hhcGUsIGFuZCBgcGFpbnRSZWdpb25TdGFja2AgZHJhd3MgdGhlIG9uZXMgdGhhdCB3YW50IGEKcGFpbnRlciwgYm90dG9tIGJhbmQgdG8gdG9wLCBlYWNoIHRocm91Z2ggYSBzdXJmYWNlIGNsaXBwZWQgdG8gaXRzIG93bgpyZWN0YW5nbGUuCgpgcGxhY2UoZ3JpZClgIGlzIGNhbGxlZCBvbiAqKmV2ZXJ5KiogbGF5b3V0IGNoYW5nZSwgc28gaXRzIGNvbnRyYWN0IGlzIG5hcnJvdzoKKipyZXR1cm4gYSByZWN0YW5nbGUgYW5kIGRvIG5vIHdvcmsuKiogRG8gbm90IHBhaW50IGluIGl0LCBkbyBub3QgcmVhZCB0aGUgZ2FtZQppbiBpdCwgYW5kIGRvIG5vdCB0aHJvdyBmcm9tIGl0OiBhIHJlc2l6ZSBjYW4gYXJyaXZlIGJldHdlZW4gYW55IHR3bwprZXlzdHJva2VzLiBJdCBydW5zIGluc2lkZSBhIHRyeS9jYXRjaCBzbyBvbmUgYXV0aG9yJ3MgbWlzdGFrZSBjYW5ub3QgdGFrZSBkb3duCnRoZSByZWxheW91dCBmb3IgZXZlcnkgb3RoZXIgcmVnaW9uLCBhbmQgYSByZWdpb24gd2hvc2UgYHBsYWNlKClgIHRocm93cyBvcgp3aG9zZSByZWN0YW5nbGUgcnVucyBvZmYgdGhlIGdyaWQgaXMgcmVjb3JkZWQgaW4gYHJlZ2lvblN0YWNrRmF1bHRzKClgIHJhdGhlcgp0aGFuIHNpbGVudGx5IG9taXR0ZWQuIEEgc2lsZW50bHkgb21pdHRlZCByZWdpb24gaXMgYSB3aW5kb3cgdGhhdCBpcyBzaW1wbHkgbm90CnRoZXJlLCB3aXRoIG5vdGhpbmcgdG8gc2VhcmNoIGZvci4KCmBwYWludChzdXJmYWNlKWAgaXMgb3B0aW9uYWwsIGFuZCBpdHMgYWJzZW5jZSBpcyB0aGUgbm9ybWFsIGNhc2UgZm9yIGNvcmU6IGEKc2NyZWVuIHRoYXQgb3ducyB0aGUga2V5Ym9hcmQgcmVwYWludHMgaXRzZWxmIHdoZW4gYSBrZXkgYXJyaXZlcy4gR2l2ZSB5b3VyCnJlZ2lvbiBhIHBhaW50ZXIgd2hlbiB5b3Ugd2FudCBpdCByZWRyYXduIGV2ZXJ5IGZyYW1lOiBhIEhVRCB3aW5kb3cgb3ZlciBhCmxpdmUgbWFwLgoKQSBjb3JlIHNjcmVlbiBvY2N1cGllcyBgY29yZTpzY3JlZW5gIG9uIHRoZSBgbW9kYWxgIGJhbmQgYW5kIGl0cyByZWN0YW5nbGUgaXMKdGhlIHdob2xlIHRlcm1pbmFsLiAqKlRoYXQgaXMgbm90IGEgcGxhY2Vob2xkZXIgYW5kIGl0IHdpbGwgbm90IHNocmluay4qKiBBIG1vZAp0aGF0IHdhbnRzIGEgcGFuZWwgZGVjbGFyZXMgaXRzIG93biByZWdpb24gcmF0aGVyIHRoYW4gYXNraW5nIGNvcmUgdG8gbWFrZSByb29tOwpzaHJpbmtpbmcgY29yZSdzIHNjcmVlbnMgd291bGQgbW92ZSBwaWN0dXJlcyB0aGF0IHVwc3RyZWFtLWNpdGVkIHBhcml0eSB0ZXN0cwpwaW4gYnl0ZSBmb3IgYnl0ZSwgZm9yIHRoZSBiZW5lZml0IG9mIG5vIG1vZC4gVG8gZmluZCBvdXQgd2hldGhlciBhbnl0aGluZyBpcwpvdmVyIHRoZSBtYXAgYmVmb3JlIHlvdSBkcmF3IG9uIGl0LCByZWFkIGBmcmFtZS5zdGFja2A7IHNlZQpbS25vd2luZyB3aGVuIHlvdSBhcmUgY292ZXJlZF0oI2tub3dpbmctd2hlbi15b3UtYXJlLWNvdmVyZWQtZnJhbWVzdGFjaykuIENvcmUncwpvd24gdmVyc2lvbiBvZiB0aGUgcXVlc3Rpb24gaXMgYG9jY2x1ZGVyc09mYCAoYHBhY2thZ2VzL3dlYi9zcmMvcmVnaW9ucy50c2ApLAp3aGljaCBpcyBob3N0LWludGVybmFsIGFuZCByZXR1cm5zIGB1bmRlZmluZWRgLCBub3QgYFtdYCwgd2hlbiB5b3UgbmFtZSBhIHJlZ2lvbgp0aGF0IGlzIG5vdCBpbiB0aGUgc3RhY2ssIHNvIGEgdHlwbyByZWFkcyBhcyBhIHF1ZXN0aW9uIHlvdSBjYW5ub3QgYW5zd2VyIHJhdGhlcgp0aGFuIGFzIGdvb2QgbmV3cy4gWW91ciBvd24gY29weSBzaG91bGQga2VlcCB0aGF0IGRpc3RpbmN0aW9uLgoKIyMjIFN0YW5kaW5nIGFzaWRlIGZvciB0aGUgZ2FtZSdzIG93biBwcm9tcHQKCkEgc2NyZWVuJ3MgYGFjdGlvbnNgIGFyZSB0aGUgZ2FtZSdzIG93biBjb21tYW5kcywgYW5kIHNvbWUgb2YgdGhlbSBhc2sgdGhlIHBsYXllcgphIHF1ZXN0aW9uIG9uIHRoZSBmYWl0aGZ1bCB0ZXJtaW5hbCB1bmRlcm5lYXRoIHlvdS4gVGhlIGNoYXJhY3RlciBzaGVldCdzIGBjYAoocmVuYW1lKSBvcGVucyBhIG5hbWUgcHJvbXB0OyBpdHMgYGZgIChkdW1wIHRvIGZpbGUpIGFza3MgZm9yIGEgZmlsZW5hbWUuIFlvdXIKb3ZlcmxheSBpcyBvbiB0b3Agb2YgdGhhdCB0ZXJtaW5hbC4gSWYgeW91IGtlZXAgZHJhd2luZywgdGhlIHBsYXllciBpcyBhbnN3ZXJpbmcKYSBxdWVzdGlvbiB0aGV5IGNhbm5vdCBzZWUsIGFuZCB0aGUgcmVuYW1lIHJlYWNoZXMgYHBlcnNpc3RTYXZlKClgLCBzbyAqKnR3bwprZXlzdHJva2VzLCBgY2AgdGhlbiBFbnRlciwgd3JvdGUgdGhlIHNhdmUgd2l0aCBub3RoaW5nIHZpc2libGUgb24gc2NyZWVuIGF0CmFsbC4qKiBFc2NhcGUgd2FzIHRoZSBvbmx5IGtleSB0aGF0IGdvdCBvdXQgd2l0aG91dCB3cml0aW5nIGl0LgoKVGhlIGZpeCBpcyAqbm90KiBhIHJ1bGUgYWdhaW5zdCBwcm9tcHRpbmcgaW5zaWRlIGBTY3JlZW5Ib3N0Lmludm9rZWAuIFRoYXQgd291bGQKbWFrZSB0aGUgYWN0aW9ucyBhIG1vZCBjYW4gb2ZmZXIgYSBzdHJpY3Qgc3Vic2V0IG9mIHRoZSBnYW1lJ3MsIHdoaWNoIGlzIHRoZQpvcHBvc2l0ZSBvZiB3aGF0IHRoaXMgc2VhbSBpcyBmb3IuIEluc3RlYWQgKip0aGUgZ2FtZSBhbm5vdW5jZXMgdGhlIHByb21wdCBiZWZvcmUKaXQgbGFuZHMqKjogYSBwcmVzZW50ZXIgdGhhdCBjYW4gc3RhbmQgYXNpZGUgaXMgdG9sZCB3aGF0IGlzIGNvbWluZywgYXdhaXRlZCB3aGlsZQppdCBhbmltYXRlcyBvdXQsIGFuZCBnaXZlbiBpdHMgc2NyZWVuIGJhY2sgYWZ0ZXJ3YXJkcy4KCiAgICBzaG93KHZpZXcsIGhvc3QpIHsKICAgICAgcmV0dXJuIHsKICAgICAgICBkaXNtaXNzZWQsCiAgICAgICAgeWllbGRUZXJtaW5hbChyZXF1ZXN0KSB7CiAgICAgICAgICAvLyByZXF1ZXN0OiBhIFByb21wdFJlcXVlc3Qgd2hpbGUgdGhlIGdhbWUgbmVlZHMgdGhlIHRlcm1pbmFsLAogICAgICAgICAgLy8gICAgICAgICAgbnVsbCB3aGVuIHlvdSBjYW4gdGFrZSBpdCBiYWNrLgogICAgICAgICAgY2FudmFzLnN0eWxlLmRpc3BsYXkgPSByZXF1ZXN0ID09PSBudWxsID8gImJsb2NrIiA6ICJub25lIjsKICAgICAgICB9LAogICAgICB9OwogICAgfQoKVGhlIHJlcXVlc3Qgc2F5cyB3aGF0IGlzIGJlaW5nIGFza2VkIChgbGFiZWxgKSwgd2hpY2ggb2YgeW91ciBgYWN0aW9uc2AgbGVkIHRoZXJlCihgYWN0aW9uYCksIGEgc3RhYmxlIGlkZW50aXR5IHlvdSBjYW4gbWF0Y2ggb24gd2l0aG91dCBwYXJzaW5nIHByb3NlIChgaWRgLCBlLmcuCmAiY2hhcnNoZWV0OnJlbmFtZSJgKSwgaG93IG11Y2ggb2YgdGhlIHRlcm1pbmFsIGl0IG5lZWRzIChgZXh0ZW50YDogYCJsaW5lImAgZm9yIGEKcm93LTAgcHJvbXB0LCBgInNjcmVlbiJgIGZvciBvbmUgdGhhdCBjbGVhcnMgdGhlIGdyaWQpIGFuZCB0aGUgcmVjdGFuZ2xlIGl0IHdpbGwKbGFuZCBpbiAoYGNsaXBgKS4gQSBgImxpbmUiYCBwcm9tcHQgb25seSBuZWVkcyByb3cgMCwgc28geW91IG1heSBrZWVwIGRyYXdpbmcKZXZlcnl0aGluZyBiZWxvdyBpdC4KCioqV2hhdGV2ZXIgeW91IHJldHVybiBpcyBhd2FpdGVkKiosIHNvIGEgZmFkZS1vdXQgaXMgbGVnaXRpbWF0ZSBhbmQgdGhlIHByb21wdAp3aWxsIG5vdCBsYW5kIHVudGlsIGl0IGhhcyBmaW5pc2hlZC4gVGhlcmUgaXMgbm8gdGltZW91dC4KCmB5aWVsZFRlcm1pbmFsYCBpcyBvcHRpb25hbCwgYW5kIG9taXR0aW5nIGl0IGlzIG5vdCBhbiBlcnJvciwgYnV0IGl0IGlzIHJlcG9ydGVkCm9uY2UsIGJ5IG5hbWUsIHdpdGggdGhlIG1lbWJlciB0byBhZGQgc3BlbGxlZCBvdXQgaW4gdGhlIHNlbnRlbmNlLCBhbmQgdGhlIGdhbWUKZHJhd3MgaXRzIHByb21wdCBvdmVyIHlvdXIgc2NyZWVuIGFueXdheS4gSXQgbmV2ZXIgcmVmdXNlcyB0byBydW4gdGhlIGNvbW1hbmQ6CnlvdXIgYWN0aW9ucyBhcmUgbm90IGEgc21hbGxlciBzZXQgdGhhbiB0aGUgZ2FtZSdzLgoKKipJdCBpcyBvbiB0aGUgcHVibGlzaGVkIHR5cGUqKiwgaW4gYm90aCBjb3BpZXM6IGBTY3JlZW5TaG93bmAgaW4gdGhlIGhvc3QncwpgcGFja2FnZXMvd2ViL3NyYy9zY3JlZW4tdmlldy50c2AgYW5kIGluIHRoZSBTREsncwpgcGFja2FnZXMvbW9kLXNkay9zcmMvc2NyZWVuLnRzYCwgdG9nZXRoZXIgd2l0aCB0aGUgdm9jYWJ1bGFyeSBvZiB0aGUKYW5ub3VuY2VtZW50LCBgUHJvbXB0UmVxdWVzdGAgYW5kIGBQcm9tcHRFeHRlbnRgLiBGb3IgVHlwZVNjcmlwdCwgdGFrZSBhbGwgdGhyZWUKdHlwZS1vbmx5IGZyb20gdGhlIFNESywgd2hpY2ggdGhlIGJ1aWxkIGVyYXNlcyBsaWtlIGFueSBvdGhlciB0eXBlIGltcG9ydDoKCmBgYHRzCmltcG9ydCB0eXBlIHsKICBQcm9tcHRSZXF1ZXN0LAogIFNjcmVlblByZXNlbnRlciwKICBTY3JlZW5TaG93biwKfSBmcm9tICJAcnBnbS10b29scy9uZW8tYW5nYmFuZC1tb2Qtc2RrIjsKYGBgCgpJdCB3YXMgbm90IGFsd2F5cywgYW5kIHdoYXQgdGhhdCBjb3N0IGlzIHdvcnRoIGtub3dpbmcgYmVjYXVzZSBpdCBpcyBpbnZpc2libGU6CnVudGlsIDIwMjYtMDgtMTQgdGhlIG1lbWJlciB3YXMgZGVjbGFyZWQgb25seSBvbiBhIGhvc3QtbG9jYWwgYFlpZWxkaW5nU2NyZWVuYAphbmQgdGhlIG1lY2hhbmlzbSB3b3JrZWQgYW55d2F5LiBOb3QgcHVibGlzaGluZyBhIG1lbWJlciBkb2VzIG5vdCBzdG9wIGEgbW9kCmltcGxlbWVudGluZyBpdDogYHRzY2AgYWNjZXB0cyBgc2hvdzogKCkgPT4gKHsgZGlzbWlzc2VkLCB5aWVsZFRlcm1pbmFsIH0pYAphZ2FpbnN0IGEgYFNjcmVlblNob3duIHwgdW5kZWZpbmVkYCByZXR1cm4gd2l0aCBubyBjYXN0IGFuZCBubyBleGNlc3MtcHJvcGVydHkKZXJyb3IuIFdoYXQgaXQgc3RvcHMgaXMgKmxlYXJuaW5nIHRoYXQgdGhlIG1lbWJlciBleGlzdHMqLCBhbmQgKmJlaW5nIHRvbGQgd2hlbgp5b3UgZ2V0IGl0IHdyb25nKjogYHlpZWxkVGVybWluYWwocmVxdWVzdDogc3RyaW5nKWAgY29tcGlsZWQgYW5kIHdhcyBoYW5kZWQgYQpgUHJvbXB0UmVxdWVzdGAgYXQgcnVudGltZS4KCmBwYWNrYWdlcy9tb2Qtc2RrL3NyYy9zY3JlZW4tYWJpLWFncmVlbWVudC50ZXN0LnRzYCBob2xkcyB0aGUgdHdvIGNvcGllcyBpbgphZ3JlZW1lbnQ6IHRoZSBtZW1iZXIgbGlzdCwgYHlpZWxkVGVybWluYWxgJ3Mgc2lnbmF0dXJlIGNoYXJhY3RlciBmb3IgY2hhcmFjdGVyLAp0aGUgc2VudGVuY2UgYWJvdmUsIGFuZCBgUHJvbXB0UmVxdWVzdGAncyBvd24gZmllbGQgbGlzdCBhbmQgdHlwZXMuIEl0IHJlYWRzIGJvdGgKKipmaWxlcyoqOyBpbXBvcnRpbmcgYm90aCB0eXBlcyB3b3VsZCBwcm92ZSBub3RoaW5nLCBiZWNhdXNlIHR3byBzdHJ1Y3R1cmFsbHkKaWRlbnRpY2FsIGludGVyZmFjZXMgYXJlIG9uZSB0eXBlIHRvIHRoZSBjb21waWxlciwgd2hpY2ggaXMgdGhlIHNhbWUgYmxpbmRuZXNzCnRoYXQgbGV0IHRoZSBtZW1iZXIgc2hpcCB1bnB1Ymxpc2hlZC4KCioqRXZlcnkgYWN0aW9uIGluIHRoZSBgU0NSRUVOX1BST01QVFNgIGNlbnN1cyBpcyBhbm5vdW5jZWQuKiogYGNoYXJzaGVldC50c2AKY292ZXJzIGBjb3JlOmNoYXJhY3RlcmAgYW5kIGBjb3JlOmNoYXJhY3Rlci1mbGFnc2AgKGByZW5hbWVgLCBgZmlsZWApOyBgbWFpbi50c2AKY292ZXJzIGBjb3JlOnJlcG9ydGAncyBgZGVzY3JpYmVgIGFuZCBgY29yZTp1cGRhdGVgJ3MgYG1vZHNgLiBUaGUgbGFzdCBvZiB0aG9zZSBpcwp0aGUgaW50ZXJlc3Rpbmcgb25lOiBgbW9kc2Agb3BlbnMgYSB3aG9sZSBuZXN0ZWQgcGFnZSAoYHNob3dNb2RVcGdyYWRlc2ApIHdob3NlCm93biBzY3JlZW5zIGNvbWUgYmFjayByb3VuZCB0byB0aGUgcHJlc2VudGVyIHRoYXQgaXMgKmFscmVhZHkqIGhvbGRpbmcKYGNvcmU6dXBkYXRlYC4gV2hpbGUgeW91IGFyZSBzdG9vZCBhc2lkZSB5b3UgYXJlIHNpbXBseSBub3Qgb2ZmZXJlZCB0aGVtOyB0aGUKZ2FtZSBzaG93cyB0aG9zZSBpdHNlbGYsIGJlY2F1c2UgcmUtb2ZmZXJpbmcgd291bGQgYXNrIHlvdSB0byBkcmF3IG92ZXIgdGhlIHZlcnkKdGVybWluYWwgeW91IGp1c3QgY2xlYXJlZC4KCiMjIyBBIHJvdyB3aXRoIGEgcGFyYWdyYXBoCgpgU2NyZWVuUm93LmRldGFpbGAgaXMgcHJvc2UgYXR0YWNoZWQgdG8gb25lIHJvdyBvZiBhIHRhYmxlLiBJdCBpcyBhCmBTY3JlZW5Qcm9zZWAsIHRoZSBzYW1lIGB7IHBhcmFncmFwaHMsIGluZGVudD8sIHdyYXA/LCBmbG93PywgY29sb3I/IH1gIGEKYHRleHRgIGJsb2NrIGlzIG1hZGUgb2YsIHNvIGEgcHJlc2VudGVyIHRoYXQgY2FuIGFscmVhZHkgZHJhdyBhIHByb3NlIGJsb2NrIGNhbgpkcmF3IGEgZGV0YWlsLCBhbmQgb25lIHRoYXQgb25seSB3YW50cyB0aGUgcmVjb3JkIGNhbiBpZ25vcmUgaXQuCgpUaGUgcnVsZSBmb3IgdGVsbGluZyB0aGUgdHdvIGFwYXJ0IGhhcyBub3QgY2hhbmdlZCwgYW5kIGl0IGlzIHdoeSBgZGV0YWlsYCBpcwpzaGFwZWQgdGhpcyB3YXk6ICoqc3RydWN0dXJlIGlzIHdoYXQgaGFzIGtleXM7IHByb3NlIGlzIHdoYXQgaGFzIHBhcmFncmFwaHMuKioKQW55dGhpbmcgeW91IG5lZWQgdG8gcmVhY2ggYnkgbmFtZSBpcyBhIGNlbGwsIGFkZHJlc3NlZCBieSBpdHMgY29sdW1uIGtleS4gQQpkZXRhaWwgaGFzIG5vIGtleSBhbmQgaXMgbm90IGFkZHJlc3NhYmxlLCBhbmQgdGhhdCBpcyBkZWxpYmVyYXRlOiBpZiB5b3UgZmluZAp5b3Vyc2VsZiBwYXJzaW5nIGEgZGV0YWlsLCB0aGUgdGhpbmcgeW91IGFyZSBwYXJzaW5nIGlzIGEgY29sdW1uIHRoZSBzY3JlZW4gaGFzCm5vdCBkZWNsYXJlZCB5ZXQsIGFuZCB0aGF0IGlzIGEgYnVnIHRvIHJlcG9ydCByYXRoZXIgdGhhbiBhIHN0cmluZyB0byBzcGxpdC4gVGhlCmlkcyBiZWhpbmQgYSBkZXBlbmRlbmN5IGN5Y2xlIGxpa2UgYEEgLT4gQiAtPiBBYCBhcmUgb24gYHNlbWFudGljLmRhdGFgLCB3aGVyZQpgYXV0b1NvcnRTY3JlZW5gIGFscmVhZHkgcHV0cyB0aGVtLgoKQSBkZXRhaWwgbmV2ZXIgYWZmZWN0cyBsYXlvdXQgYmV5b25kIGl0cyBvd24gcm93LiBJdCBpcyBub3QgY29uc3VsdGVkIHdoZW4KY29sdW1uIHdpZHRocyBhcmUgY29tcHV0ZWQsIHNvIGEgbG9uZyBwYXJhZ3JhcGggY2Fubm90IHdpZGVuIGEgY29sdW1uIG9yIG1vdmUKdGhlIHJvdyBhYm92ZSBpdCwgYW5kIGEgcm93IHdpdGhvdXQgYSBkZXRhaWwgaXMgbGFpZCBvdXQgaWRlbnRpY2FsbHkgd2hldGhlciBvcgpub3QgaXRzIG5laWdoYm91cnMgaGF2ZSBvbmUuIEl0IGFsc28gaW50cm9kdWNlcyBubyB0aGlyZCB3cmFwcGluZyBydWxlOiBpdCBpcwpsYWlkIG91dCBieSB0aGUgc2FtZSBmdW5jdGlvbiBhIGB0ZXh0YCBibG9jayBpcywgYW5kIHNheXMgd2hpY2ggb2YgQW5nYmFuZCdzIHR3bwphbGdvcml0aG1zIGl0IHdhbnRzIHRocm91Z2ggdGhlIHNhbWUgYGZsb3dgIGZpZWxkLgoKVGhpcyB3YXMgYWRkZWQgYmVjYXVzZSB0aHJlZSBzY3JlZW5zICh0aGUgaW5zdGFsbCByZWZ1c2FsLCBhIGRyb3BwZWQgYXV0by1zb3J0CnN1Z2dlc3Rpb24sIGEgZGVjbGFyZWQtY29uZmxpY3QgY2xhaW0pIGFyZSBlYWNoICoqYSByZWNvcmQgd2l0aCBhIHBhcmFncmFwaAphdHRhY2hlZCoqLCBhbmQgaGFkIGJlZW4gc3R1Y2sgYXQgYGxpbmVzYCBiZWNhdXNlIHRoZXJlIHdhcyBub3doZXJlIHRvIHB1dCB0aGUKcGFyYWdyYXBoLiBDdXR0aW5nIGl0IGludG8gcm93IGZyYWdtZW50cyB3b3VsZCBoYXZlIG1hZGUgdGhlbSBgbGluZXNgIHdlYXJpbmcgYQpjb3N0dW1lOiBhIHByZXNlbnRlciB3b3VsZCBzdGlsbCBoYXZlIGhhZCB0byBrbm93IHRoYXQgc29tZSByb3dzIGNvbnRpbnVlCm90aGVycy4KClRoZSBzZXZlbiByZWNhbGwgcGFnZXMgYXJlIGFsbCBgdGV4dGAgYmxvY2tzLCBhbmQgdGhleSBhcmUgc2V2ZW4gaWRzIHJhdGhlciB0aGFuCm9uZSBvbiBwdXJwb3NlOiBhIG1vZCB0aGF0IGRyYXdzIGFuIGFydGlmYWN0J3MgcGFnZSBhcyBhIHBsYXF1ZSBhbmQgYSB0cmFwJ3MgYXMgYQp3YXJuaW5nIGNhcmQgaGFzIHRvIGJlIGFibGUgdG8gdGVsbCB0aGVtIGFwYXJ0LCBhbmQgYSBzaGFyZWQgaWQgY2Fubm90LiBJZiB5b3UKb25seSB3YW50IHRvIHJlc3R5bGUgcHJvc2UsIG1hdGNoIG9uIGFsbCBzZXZlbiAob3Igb24gYGJsb2NrLmtpbmQgPT09ICJ0ZXh0ImApCmFuZCB5b3UgYXJlIGRvbmU6IG5vdGhpbmcgaW4gYSBwcm9zZSBwYW5lbCBuZWVkcyB0byBrbm93IHdoaWNoIG9mIHRoZW0gaXQgaGFzLgoKKipBIHNjcmVlbiBpcyBkaXNtaXNzZWQsIG5vdCBhbnN3ZXJlZCoqLCB3aGljaCBpcyB0aGUgb25lIHNoYXBlIGRpZmZlcmVuY2UgZnJvbQpgbWVudWAuIGBzaG93YCBkZWNsaW5lcyBieSByZXR1cm5pbmcgYHVuZGVmaW5lZGAgKipzeW5jaHJvbm91c2x5KiogYW5kIHRha2VzIHRoZQpzY3JlZW4gYnkgcmV0dXJuaW5nIGB7IGRpc21pc3NlZCB9YCwgYSBwcm9taXNlIHlvdSByZXNvbHZlIHdoZW4gdGhlIHBsYXllciBjbG9zZXMKaXQuIFRoZXJlIGlzIG5vIGFuc3dlciB2YWx1ZSBsZWZ0IHRvIGRlY2xpbmUgd2l0aCBvbmNlIHRoZSBwcm9taXNlIG1lYW5zICJ0aGV5CmNsb3NlZCBpdCIsIGFuZCBkZWNpZGluZyBuZXZlciBuZWVkcyB0byBiZSBhc3luYyBhbnl3YXksIHNpbmNlIHlvdSBtYXRjaCBvbiBgdmlldy5pZGAuClJlc29sdmluZyBgZGlzbWlzc2VkYCBpcyB0aGUgd2hvbGUgY29udHJhY3Q6IGEgcHJlc2VudGVyIHRoYXQgZm9yZ2V0cyBpcyBhIGdhbWUKdGhlIHBsYXllciBjYW5ub3QgZ2V0IGJhY2sgdG8uCgoqKlNvbWUgc2NyZWVucyBjYW4gYmUgYWN0ZWQgb24sIGFuZCB0aG9zZSBoYW5kIHlvdSBhIHdheSBiYWNrIGluLioqIE1vc3Qgc2NyZWVucwphcmUgb25seSBkaXNtaXNzZWQuIFRoZSBjaGFyYWN0ZXIgc2hlZXQgaXMgbm90OiB1cHN0cmVhbSBvZmZlcnMgcmVuYW1pbmcsIGEKY2hhcmFjdGVyIGR1bXAgYW5kIHRoZSBwYWdlIGN5Y2xlIGZyb20gdGhlIHNhbWUgbW9kYWwsIGFuZCBhIHByZXNlbnRlciB0aGF0IHRvb2sKdGhlIHNoZWV0IHdpdGhvdXQgYmVpbmcgYWJsZSB0byByZWFjaCB0aGVtIHdvdWxkIHF1aWV0bHkgdGFrZSB0aG9zZSBjb21tYW5kcyBhd2F5CmZyb20gdGhlIHBsYXllci4gVGhlIHZpc2libGUtbW9uc3RlciBsaXN0IGlzIHRoZSBvdGhlciBvbmU6IGEgc2luZ2xlIGFjdGlvbiwKYHNvcnQtZXhwYCAoYHhgKSwgd2hpY2ggZmxpcHMgdGhlIHNvcnQgYmV0d2VlbiBkZXB0aCBhbmQgZXhwZXJpZW5jZS4gU28gYHZpZXcuYWN0aW9uc2AgcHVibGlzaGVzIHRoZW0gYXMgZGF0YTogYSBzdGFibGUgYGlkYAooYHJlbmFtZWAsIGBmaWxlYCwgYHBhZ2UtbmV4dGAsIGBwYWdlLXByZXZgKSwgdGhlIGBrZXlgIHRoZSAqZmFpdGhmdWwgdGVybWluYWwqCmxpc3RlbnMgZm9yLCBhbmQgdGhlIGdhbWUncyBvd24gYGxhYmVsYCwgYW5kIGBzaG93KHZpZXcsIGhvc3QpYCBoYW5kcyB5b3UgYQpgU2NyZWVuSG9zdGAgd2hvc2UgYGludm9rZShpZClgIHJ1bnMgb25lLgoKYGBganMKc2hvdyh2aWV3LCBob3N0KSB7CiAgaWYgKHZpZXcuaWQgIT09ICJjb3JlOmNoYXJhY3RlciIpIHJldHVybiB1bmRlZmluZWQ7CiAgbGV0IHNob3duID0gdmlldzsKICBjb25zdCBvbktleSA9IChldikgPT4gewogICAgY29uc3QgYWN0aW9uID0gc2hvd24uYWN0aW9ucyAmJiBzaG93bi5hY3Rpb25zLmZpbmQoKGEpID0+IGEua2V5ID09PSBldi5rZXkpOwogICAgaWYgKCFhY3Rpb24pIHJldHVybjsKICAgIGhvc3QuaW52b2tlKGFjdGlvbi5pZCkudGhlbigobmV4dCkgPT4gewogICAgICBpZiAoIW5leHQpIHJldHVybiBjbG9zZSgpOyAgIC8vIHRoZSBnYW1lIGhhcyB0YWtlbiB0aGUgc2NyZWVuIGJhY2sKICAgICAgc2hvd24gPSBuZXh0OyAgICAgICAgICAgICAgICAvLyB0aGUgc2FtZSBzaGVldCByZW5hbWVkLCBvciB0aGUgb3RoZXIgcGFnZQogICAgICBwYWludChzaG93bik7CiAgICB9KTsKICB9OwogIC4uLgp9CmBgYAoKYGludm9rZWAgcnVucyB0aGUgKipnYW1lJ3MqKiBjb2RlOiBhIHJlbmFtZSBzdGlsbCBvcGVucyB0aGUgZ2FtZSdzIHByb21wdCwgYSBkdW1wCnN0aWxsIHdyaXRlcyB0aGUgZ2FtZSdzIGZpbGUsIGFuZCByZXNvbHZlcyB3aXRoIHdoYXQgdGhlIHBsYXllciBzaG91bGQgYmUgbG9va2luZwphdCBuZXh0OiB1c3VhbGx5IHRoZSBzYW1lIHNjcmVlbiB3aXRoIG5ldyBjb250ZW50LCBvciB0aGUgbmV4dCBwYWdlLiBgdW5kZWZpbmVkYAptZWFucyB0aGUgZ2FtZSBoYXMgdGFrZW4gdGhlIHNjcmVlbiBiYWNrOyByZXNvbHZlIGBkaXNtaXNzZWRgIHdoZW4geW91IHNlZSBpdC4gQW4KaWQgdGhpcyBlbmdpbmUgaGFzIG5vdCBnb3QgaXMgYSBuby1vcCB0aGF0IGhhbmRzIHRoZSBjdXJyZW50IHZpZXcgYmFjaywgc28gYXNraW5nCmZvciBhIG5ld2VyIGNvbW1hbmQgY2FuIG5ldmVyIGNsb3NlIHRoZSBwbGF5ZXIncyBzY3JlZW4uIGBob3N0YCBhcnJpdmVzIG9ubHkgd2hlcmUKYGFjdGlvbnNgIGRvZXMsIGFuZCBpdCBpcyBhIHNlY29uZCBwYXJhbWV0ZXIgcmF0aGVyIHRoYW4gYSBmaWVsZCBvZiB0aGUgdmlldwpiZWNhdXNlIGEgdmlldyBpcyBmcm96ZW4gZGF0YSBhbmQgYSB3YXkgYmFjayBpbnRvIHRoZSBnYW1lIGNhbm5vdCBiZS4KCioqVGhyb3dpbmcgY29zdHMgeW91IHRoZSBzZWFtIGZvciB0aGUgc2Vzc2lvbioqLCBhcyB3aXRoIGBtZW51YC4gSWYgeW91IHRocm93CndoaWxlIGEgc2NyZWVuIGlzICpvcGVuKiwgb3IgcmVqZWN0IGBkaXNtaXNzZWRgLCB0aGUgZ2FtZSByZXBvcnRzIHlvdSBieSBuYW1lIGFuZAoqKnNob3dzIHRoZSBzY3JlZW4gaXRzZWxmKio6IGEgcGxheWVyIGxlZnQgc3RhcmluZyBhdCBhIGRlYWQgb3ZlcmxheSBoYXMgbm8gd2F5Cm91dC4gVGhhdCByZWNvdmVyeSBleGlzdHMgc28gYSBidWcgaXMgbm90IGEgbG9zdCBjaGFyYWN0ZXIsIG5vdCBhcyBhIHBsYWNlIHRvIGJlCnJlbGF4ZWQuCgoqKkEgc2NyZWVuIGhhcyBubyBwdWJsaXNoZWQgcmVnaW9uIGVpdGhlci4qKiBJdCBjb3ZlcnMgdGhlIHdpbmRvdywgZm9yIHRoZSBzYW1lCnJlYXNvbiBhIGZsb2F0aW5nIG1lbnUgZG9lcy4KCmBzYW1wbGVzL3Nwcml0ZS1pbnZlbnRvcnkvYCBpcyBhIGNvbXBsZXRlIHdvcmtlZCBleGFtcGxlOiBpdCBkcmF3cyB0aGUgaW52ZW50b3J5LAp0aGUgZXF1aXBtZW50IGFuZCB0aGUgcXVpdmVyIGFzIGl0ZW0gY2FyZHMsIGxheXMgdGhlIHJlY2FsbCBwYWdlcyBvdXQgaW50byBhCnBhbmVsIG9mIGl0cyBvd24gd2lkdGggYnkgbWVhc3VyaW5nIHRoZW0sIGFuZCBkZWNsaW5lcyBldmVyeSBvdGhlciBzY3JlZW4uCgojIyBgcmVnaW9ucyhjdHgpYDogcHV0IGZ1cm5pdHVyZSBvZiB5b3VyIG93biBvbiB0aGUgc2NyZWVuCgpUaGUgZmlmdGggb3duZXIgc2VhbSwgYW5kICoqdGhlIG9ubHkgb25lIG5vYm9keSB3aW5zLioqCgpUaGUgb3RoZXIgZm91ciBlYWNoIGFuc3dlciAqd2hvIGdldHMgaXQqLCBiZWNhdXNlIHRoZSBtYXAsIGEgSFVEIHJlZ2lvbiwgdGhlIG1lbnUKc2VhbSBhbmQgdGhlIHNjcmVlbiBzZWFtIGFyZSBlYWNoIG9uZSB0aGluZyBhbmQgdHdvIG1vZHMgY2Fubm90IGJvdGggaGF2ZSBpdC4gQQpyZWdpb24gaXMgbm90IG9uZSB0aGluZy4gVHdvIG1vZHMgdGhhdCBib3RoIGRlY2xhcmUgYSByZWdpb24gYXJlIG5vdCBpbgpjb250ZW50aW9uIGF0IGFsbDogdGhleSBhcmUgdHdvIHBpZWNlcyBvZiBmdXJuaXR1cmUsIGFuZCB0aGV5ICoqY29leGlzdCoqLCBlYWNoCmF0IGl0cyBvd24gYmFuZCwgaW4gbG9hZCBvcmRlci4gIkxhc3QgbG9hZCB3aW5zIiBhcHBlYXJzIGhlcmUgb25seSBpbiBpdHMKb3JkaW5hcnkgZm9ybTogd2l0aGluIGEgYmFuZCwgdGhlIGxhdGVyLWxvYWRlZCByZWdpb24gZHJhd3Mgb24gdG9wLgoKYGBganMKZXhwb3J0IGRlZmF1bHQgewogIGFwaTogMSwKICByZWdpb25zKGN0eCkgewogICAgcmV0dXJuIFt7CiAgICAgIGlkOiAiY2FycmllZCIsCiAgICAgIGxheWVyOiAib3ZlcmxheSIsCiAgICAgIHBsYWNlOiAoZ3JpZCkgPT4gKHsgeDogZ3JpZC5jb2xzIC0gMTgsIHk6IDEsIHc6IDE3LCBoOiAxIH0pLAogICAgICBwYWludDogKHN1cmZhY2UpID0+IHN1cmZhY2UucHV0KDAsIDAsIGBDYXJyaWVkICR7d2VpZ2h0KCl9IGxiYCksCiAgICB9XTsKICB9LAp9OwpgYGAKClJlcXVpcmVzICoqYHVpOnJlZ2lvbi5jcmVhdGVgKiouIE5vdGUgdGhhdCBgdWk6Ki5yZXBsYWNlYCBkb2VzICoqbm90KiogZ3JhbnQgaXQ6CnRoZSB3aWxkY2FyZCByYW5nZXMgb3ZlciB3aGljaCBvZiB0aGUgKmdhbWUncyogcmVnaW9ucyBjaGFuZ2VzIGhhbmRzLCBhbmQgYWRkaW5nCm9uZSBvZiB5b3VyIG93biBpcyBhIGRpZmZlcmVudCBzZW50ZW5jZSBmb3IgdGhlIHBsYXllciB0byBhZ3JlZSB0by4gRGVjbGFyaW5nCmByZWdpb25zKClgIHdpdGhvdXQgdGhlIGNhcGFiaWxpdHkgaXMgcmVwb3J0ZWQgYnkgbmFtZSB3aXRoIHRoZSBmaXggaW4gdGhlCnNlbnRlbmNlLCByYXRoZXIgdGhhbiBzaWxlbnRseSBkcmF3aW5nIG5vdGhpbmcuCgoqKllvdXIgaWQgaXMgbmFtZXNwYWNlZC4qKiBEZWNsYXJlIGAiY2FycmllZCJgIGFuZCB0aGUgbGl2ZSBzdGFjayBjYXJyaWVzCmBteS1tb2Q6Y2FycmllZGAuIFRoYXQgaXMgYSBjb3JyZWN0bmVzcyBydWxlIHJhdGhlciB0aGFuIHRpZGluZXNzOiBhIG1vZCBuYW1pbmcKaXRzIHJlZ2lvbiBgbWFwYCB3b3VsZCBwdXQgYSBzZWNvbmQgYG1hcGAgaW4gdGhlIHN0YWNrLCBhbmQgYG9jY2x1ZGVyc09mYCBhbnN3ZXJzCmFib3V0IHRoZSAqKmZpcnN0KiogbWF0Y2gsIHNvIGEgZnJvbnQgZW5kJ3Mgb25lIHF1ZXN0aW9uIHdvdWxkIHF1aWV0bHkgc3RhcnQKYmVpbmcgYW5zd2VyZWQgYWJvdXQgc29tZWJvZHkgZWxzZSdzIHJlY3RhbmdsZS4KCioqVGhlIHVuaXQgb2YgZmFpbHVyZSBpcyB0aGUgZGVjbGFyYXRpb24sIG5vdCB0aGUgbW9kLioqIEEgcmVjdGFuZ2xlIHdpdGggbm8KYHBhaW50YCwgYSBiYW5kIHRoYXQgZG9lcyBub3QgZXhpc3QsIGEgZHVwbGljYXRlIG5hbWUsIGEgYHBhaW50YCB0aGF0IHRocm93cyBvbgppdHMgZmlyc3QgZnJhbWUsIGFuZCBlYWNoIGNvc3RzIGV4YWN0bHkgdGhhdCBvbmUgcmVnaW9uLCBpcyByZXBvcnRlZCBvbmNlLCBhbmQKbGVhdmVzIHlvdXIgb3RoZXJzIGFuZCBldmVyeSBvdGhlciBtb2QncyBhbG9uZS4KCioqQSBmYXVsdGluZyByZWdpb24gaXMgd2l0aGRyYXduLCBub3QgbGVmdCBlbXB0eS4qKiBUaGlzIGlzIHRoZSBvbmUgcGxhY2UgdGhlCm1lY2hhbmljYWwgYW5zd2VyIGlzIHdyb25nOiBgdWktc3RhY2sudHNgIGxlYXZlcyBhIGZhdWx0ZWQgY29yZSBzY3JlZW4gaW4gdGhlCmNvbXBvc2l0ZSwgd2hpY2ggaXMgcmlnaHQgZm9yIHNvbWV0aGluZyB0aGF0IHN0aWxsIG93bnMgdGhlIGtleWJvYXJkLiBZb3VyCmRlY29yYXRpdmUgcGFuZWwgaGFzIG5vIHN1Y2ggY2xhaW06IGxlZnQgaW4gdGhlIHN0YWNrIGl0IGlzIGEgcGhhbnRvbQoqKm9jY2x1ZGVyKiosIGFuZCBhIHJlcGxhY2VtZW50IGZyb250IGVuZCBhc2tpbmcgYG9jY2x1ZGVyc09mKHN0YWNrLCAibWFwIilgCndvdWxkIHN0YW5kIGl0cyBjYW52YXMgZG93biBmb3IgYSByZWdpb24gdGhhdCBoYXMgZHJhd24gbm90aGluZyBzaW5jZSB0aGUgZmlyc3QKZnJhbWUuIFNvIHRoZSBoYW5kbGUgaXMgcmVsZWFzZWQgYW5kIHRoZSByZWdpb24gdmFuaXNoZXMgKndpdGgqIGEgbWVzc2FnZSByYXRoZXIKdGhhbiBwZXJzaXN0aW5nIHdpdGhvdXQgb25lLgoKKipgcGxhY2UoZ3JpZClgIG11c3QgYmUgY2hlYXAsIHRvdGFsIGFuZCBwdXJlLioqIEl0IHJ1bnMgZm9yIGV2ZXJ5IG9wZW4gcmVnaW9uIG9uCmV2ZXJ5IGZyYW1lIGFuZCBvbiBldmVyeSByZXNpemUuIE5vIGdhbWUgcmVhZHMsIG5vIHBhaW50aW5nLCBubyBhbGxvY2F0aW9uIHlvdQpjYW4gYXZvaWQuIFJldHVybiB0aGUgcmVjdGFuZ2xlIGZvciBhIHRlcm1pbmFsIG9mIHRoYXQgc2l6ZTsgb25lIHRoYXQgcnVucyBvZmYKdGhlIGdyaWQgaXMgcmVjb3JkZWQgaW4gYHJlZ2lvblN0YWNrRmF1bHRzKClgIHJhdGhlciB0aGFuIGRyYXduLgoKKipUaGUgYHN5c3RlbWAgbGF5ZXIgaXMgcmVzZXJ2ZWQgdG8gdGhlIGdhbWUqKiBhbmQgYXNraW5nIGZvciBpdCBpcyByZWZ1c2VkIHdpdGgKaXRzIG93biBzZW50ZW5jZSByYXRoZXIgdGhhbiBhIGdlbmVyaWMgYmFkLWJhbmQgb25lOiBpdCBpcyBhIHJlYWwgYmFuZCwgaXQgaXMKdGhlIHRvcCBvbmUsIGFuZCB0aGUgcmVhc29uIHlvdSBtYXkgbm90IGhhdmUgaXQgaXMgYSByZWFzb24gcmF0aGVyIHRoYW4gYSB0eXBvLgpUaGUgbW9kIG1hbmFnZXIgYW5kIGEgZmF1bHQgcmVwb3J0IGhhdmUgdG8gYmUgZHJhd2FibGUgKmFib3ZlKiBhIG1vZCwgaW5jbHVkaW5nCmFib3ZlIG9uZSB0aGF0IGhhcyBnb25lIHdyb25nLiBVc2UgYCJvdmVybGF5ImAgZm9yIGZ1cm5pdHVyZSwgb3IgYCJtb2RhbCJgIGZvcgpzb21ldGhpbmcgdGhhdCB0YWtlcyB0aGUgcGxheWVyJ3MgYXR0ZW50aW9uLgoKIyMgQ2FwYWJpbGl0aWVzCgpUaGUgYEdyaWRTdXJmYWNlYCByZW5kZXJpbmcgY29udHJhY3QgaXMgaG9zdCBpbmZyYXN0cnVjdHVyZSwgbm90IGEgcmVnaXN0cnkKY2FwYWJpbGl0eS4gYGZyb250ZW5kYCBpcyBhIGRpcmVjdCBgTW9kUGx1Z2luYCBtZW1iZXIgYmVjYXVzZSBpdCBzZWxlY3RzIG9uZQpkaXNwbGF5IG93bmVyIHJhdGhlciB0aGFuIHJlZ2lzdGVyaW5nIGFuIGluZGVwZW5kZW50IGdhbWUgYmVoYXZpb3VyIC0gYW5kIGl0IGlzCmdhdGVkIGJ5IGBkaXNwbGF5OnJlcGxhY2VgLCBpdHMgb3duIGNhcGFiaWxpdHkga2luZCwgZm9yIHRoZSBzYW1lIHJlYXNvbi4gYGh1ZGAKaXMgdGhlIHNhbWUgc2hhcGUgb25lIGxldmVsIGZpbmVyOiBhIGRpcmVjdCBtZW1iZXIgYmVjYXVzZSBpdCBzZWxlY3RzIGFuIG93bmVyLAphbmQgZ2F0ZWQgYnkgYHVpOjxyZWdpb24+LnJlcGxhY2VgIC0gcGVyIHJlZ2lvbiwgYmVjYXVzZSBhIG1vZCBkcmF3aW5nIGhpdCBwb2ludHMKYXMgYSBiYXIgaGFzIG5vIGJ1c2luZXNzIHRha2luZyB0aGUgbWVzc2FnZSBsb2cgd2l0aCBpdCwgYW5kIGJlY2F1c2UgYSBwbGF5ZXIKY29uc2VudGluZyBkZXNlcnZlcyB0byBiZSB0b2xkIHdoaWNoIHBhcnQgb2YgdGhlaXIgc2NyZWVuIGlzIGNoYW5naW5nIGhhbmRzLgpgbWVudWAgaXMgdGhlIHRoaXJkLCBnYXRlZCBieSBgdWk6bWVudS5yZXBsYWNlYCAtIGFuZCBkZWxpYmVyYXRlbHkgTk9UIHBlciBtZW51CmlkLCBiZWNhdXNlIHRoZSB1bml0IGEgcGxheWVyIGNhbiB3ZWlnaCBpcyAidGhlIGdhbWUncyBtZW51cyIsIG5vdCBmaWZ0eQppbmRpdmlkdWFsIHNjcmVlbnMuIEFsbCB0aHJlZSBgdWk6KmAgZ3JhbnRzIGFuZCBgZGlzcGxheTpyZXBsYWNlYCBhcmUgc2VwYXJhdGUKa2luZHMgaW4gYm90aCBkaXJlY3Rpb25zOiBhIG1vZCBob2xkaW5nIHRoZSBkdW5nZW9uIGNhbm5vdCBkcmF3IHRoZSB2aXRhbHMsIGFuZCBhCm1vZCBob2xkaW5nIGV2ZXJ5IG1lbnUgY2Fubm90IGRyYXcgdGhlIGR1bmdlb24uCgpgdWk6YCBoYXMgdGhyZWUgQUNUSU9OUywgbm90IG9uZSwgYW5kIHRoZSBhY3Rpb24gaXMgY29tcGFyZWQgYXMgd2VsbCBhcyB0aGUKcmVnaW9uLiBgcmVwbGFjZWAgaGFuZHMgb3ZlciBzb21ldGhpbmcgdGhlIGdhbWUgYWxyZWFkeSBkcmF3cy4gYHJlZ2lvbi5jcmVhdGVgCmFkZHMgYSByZWN0YW5nbGUgb2YgdGhlIGdhbWUncyBvd24gY2hhcmFjdGVyIGdyaWQgYmVzaWRlIGl0LiBgcGFuZWwubW91bnRgIHB1dHMKcmVhbCBIVE1MIG9uIHRoZSBwYWdlIGFib3ZlIHRoZSBnYW1lLCByZWFjaGVkIHRocm91Z2ggYGN0eC51aWAgcmF0aGVyIHRoYW4KdGhyb3VnaCBhIGBNb2RQbHVnaW5gIG1lbWJlciwgYmVjYXVzZSBhIHBhbmVsIGlzIG9wZW5lZCB3aGVuIHRoZSBwbGF5ZXIgYXNrcyBmb3IKb25lIHJhdGhlciB0aGFuIGRlY2xhcmVkIG9uY2UgYXQgbG9hZC4gYHVpOioucmVwbGFjZWAgY292ZXJzIG5vbmUgb2YgdGhlIG90aGVyCnR3bzogdGhlIHdpbGRjYXJkIHJhbmdlcyBvdmVyIFdISUNIIG9mIHRoZSBnYW1lJ3MgcmVnaW9ucyBjaGFuZ2VzIGhhbmRzLCBhbmQKYWRkaW5nIGZ1cm5pdHVyZSBvciBtb3VudGluZyBhIHdlYiBwYWdlIGFyZSBkaWZmZXJlbnQgc2VudGVuY2VzIGZvciBhIHBsYXllciB0bwphZ3JlZSB0by4KCmBtb2Q6YCBoYXMgdHdvIEFDVElPTlMsIGFuZCBuZWl0aGVyIGdyYW50IGNhcnJpZXMgdGhlIG90aGVyLiBgbW9kOmluc3RhbGxgIHB1dHMgYQpjb250ZW50IHBhY2sgaW4gdGhlIHBsYXllcidzIGxpYnJhcnkgKipzd2l0Y2hlZCBvZmYqKiwgYW5kIHRoYXQgd2FpdGluZyBpcyBleGFjdGx5CndoeSBvbmUgc2VudGVuY2Ugb24gYSBjb25zZW50IGxpc3QgaXMgYSBwcm9wb3J0aW9uYXRlIHByaWNlIGZvciBpdDogdGhlIHBsYXllcgpzdGlsbCBtZWV0cyB0aGUgYXJyaXZpbmcgbW9kIG9uIHRoZSBNb2RzIHNjcmVlbiBhbmQgc3RpbGwgcmVhZHMgaXRzIG93biBsaXN0LgpgbW9kOnNlc3Npb25gIGxvYWRzIG9uZSBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlc3Npb24sIG9uIGZyb20gdGhlIG5leHQgcmVsb2FkLAp3aXRob3V0IGFueSBvZiB0aGF0IC0gc28gaXQgaXMgTU9SRSwgbm90IGxlc3MsIGFuZCBpdCBjYW5ub3QgYmUgc29sZCB1bmRlciB0aGUKaW5zdGFsbCBsaW5lLiBgZ3JhbnRDb3ZlcnNgIGNvbXBhcmVzIHRoZSBhY3Rpb24sIHdoaWNoIGlzIHRoZSBgdWk6YCBsZXNzb24gKCMyNjEpCmFwcGxpZWQgYmVmb3JlIGl0IGNvdWxkIGJlIHJlLWxlYXJuZWQgaGVyZS4gQm90aCByZWZ1c2UgY29kZSBhbmQgYm90aCByZWZ1c2UgYW4KYXJjaGl2ZSB3aG9zZSBtYW5pZmVzdCBhc2tzIGZvciBhIGNhcGFiaWxpdHksIHNvIG5laXRoZXIgaXMgYSByb3V0ZSB0byBydW5uaW5nCnNvbWV0aGluZyBhIG1vZCB3cm90ZS4KCioqIk9ubHkgZm9yIHRoaXMgc2Vzc2lvbiIgaXMgYSBsaWZldGltZSwgbm90IGEgcHJpdmlsZWdlKiosIGFuZCB0aGUgZG9jcyB3aWxsIG5vdAppbXBseSBvdGhlcndpc2UuIEEgc2Vzc2lvbi1sb2FkZWQgcGFjayBjb21wb3NlcyBpbnRvIHRoZSBnYW1lIG9uIHRoZSBzYW1lIHRlcm1zIGFzCmFuIGluc3RhbGxlZCBvbmUuIFdoYXQgaXMgc2hvcnQtbGl2ZWQgaXMgdGhlIGFyY2hpdmU6IHdoYXQgdGhlIHJlY29yZHMgZGlkIHRvIGEKY2hhcmFjdGVyLCBhbmQgYW55dGhpbmcgYSBtb2Qgd3JvdGUgd2hpbGUgdGhleSB3ZXJlIGxvYWRlZCwgb3V0bGl2ZXMgdGhlIHNlc3Npb24KZXhhY3RseSBhcyBpdCB3b3VsZCBoYXZlIGlmIHRoZSBtb2QgaGFkIGJlZW4gaW5zdGFsbGVkLiBUaGUgb25lIHRoaW5nIHRoZSBzZXNzaW9uCnRpZXIgZ2VudWluZWx5IGJ1eXMgYSBwbGF5ZXIgaXMgdGhhdCBpdCBjYW5ub3QgYWNjdW11bGF0ZTogdGhlIG1vZCBpcyBsaXN0ZWQgYW5kCm1hcmtlZCwgaXQgY2FuIGJlIGRyb3BwZWQsIGFuZCBjbG9zaW5nIHRoZSBnYW1lIGZvcmdldHMgaXQuCgpBbmQgdGhlIGxpZmV0aW1lIGlzIGEgc3Ryb25nIGNvbnZlbnRpb24gcmF0aGVyIHRoYW4gYW4gZW5mb3JjZWQgYm91bmRhcnkuIFRoZQphcmNoaXZlIGxpdmVzIGluIGBzZXNzaW9uU3RvcmFnZWAsIHdoaWNoIHN1cnZpdmVzIGEgcmVsb2FkIC0gdGhhdCBpcyB3aGF0IG1ha2VzCnRoZSB0aWVyIHdvcmsgYXQgYWxsLCBzaW5jZSBhIHJlbG9hZCBpcyB3aGF0IGFwcGxpZXMgYSBtb2QgLSBhbmQgd2hpY2ggYSBicm93c2VyCnJlc3RvcmVzIHdoZW4gaXQgcmVzdG9yZXMgYSBjbG9zZWQgb3IgY3Jhc2hlZCB3aW5kb3csIGFuZCB3aGljaCBhIHdpbmRvdyB0aGUgcGFnZQppdHNlbGYgb3BlbnMgaW5oZXJpdHMgYSBjb3B5IG9mLiBTbyAiZ29uZSB3aGVuIHlvdSBjbG9zZSB0aGUgZ2FtZSIgaXMgd2hhdApub3JtYWxseSBoYXBwZW5zIHJhdGhlciB0aGFuIGEgZ3VhcmFudGVlLCBhbmQgdGhlIG1pdGlnYXRpb24gaXMgdmlzaWJpbGl0eTogYQpzZXNzaW9uIG1vZCBpcyBhbHdheXMgb24gdGhlIGxpc3QsIGFsd2F5cyBtYXJrZWQsIGFuZCBhbHdheXMgZHJvcHBhYmxlLCBzbyBpdCBjYW4KbmV2ZXIgYmUgcXVpZXRseSByZXNpZGVudC4KCldoYXQgYHVpOnBhbmVsLm1vdW50YCBpcywgYW5kIGlzIG5vdCwgc3RhdGVkIGhlcmUgYmVjYXVzZSB0aGUgZGlmZmVyZW5jZSBpcyB0aGUKd2hvbGUgb2YgaXQuIEl0IGlzIG5vdCBhIGZlbmNlIGFyb3VuZCB0aGUgRE9NOiB5b3VyIGBwbHVnaW4uanNgIHJ1bnMgaW4gdGhlCnBhZ2UncyBvd24gcmVhbG0sIHNvIGBkb2N1bWVudGAgaXMgYW1iaWVudCB0byBpdCB3aXRoIG9yIHdpdGhvdXQgYW55IGNhcGFiaWxpdHksCmFuZCBhIG1vZCB0aGF0IG5ldmVyIGRlY2xhcmVzIHRoaXMgY2FuIHN0aWxsIGFwcGVuZCBhbiBlbGVtZW50IHRvIHRoZSBib2R5LiBXaGF0CnRoZSBncmFudCBjYXJyaWVzIGlzIGEgc2VudGVuY2UgdGhlIHBsYXllciByZWFkcyBmaXJzdCwgYSBjb250YWluZXIgdGhlIGhvc3Qgb3ducwphbmQgY2FuIHRha2UgYXdheSwgYW5kIG9uZSB0aGluZyBhIG1vZCBnZW51aW5lbHkgY2Fubm90IGRvIHdpdGhvdXQgaXQgLSBzdGFuZCB0aGUKZ2FtZSdzIGlucHV0IGRvb3IgZG93biwgc28gYSByZWFsIGA8aW5wdXQ+YCBpbnNpZGUgeW91ciBwYW5lbCBjYW4gYmUgdHlwZWQgaW50bwppbnN0ZWFkIG9mIHRoZSBrZXlzdHJva2VzIGJlaW5nIHJlYWQgYXMgZ2FtZSBjb21tYW5kcy4KClRoZSBsaXZlIGBXb3JsZEZyYW1lYCBpbgpgcGFja2FnZXMvd2ViL3NyYy93b3JsZC12aWV3LnRzYDogYHJlbmRlcigpYCBpbnZva2VzIHRoZSBleHRyYWN0ZWQKYHdvcmxkLXJlbmRlci1kYXRhLnRzYCB3aXRoIHRoZSBhY3R1YWwgbWFwLWtub3dsZWRnZSByZWFkcyBhbmQgcGFzc2VzIGl0cwpmcmFtZSB0byBhIGBXb3JsZEZyYW1lU2lua2A7IHRoZSBkZWZhdWx0IGdseXBoIHRlcm1pbmFsCmlzIHRoYXQgc2luayBhbmQgY29uc3VtZXMgaXRzIGZhbGxiYWNrIHZpc3VhbApwcm9qZWN0aW9uLCBpbmNsdWRpbmcgdGhlIHRlcnJhaW4tdW5kZXItZm9yZWdyb3VuZCB0aWxlIGlucHV0cyBmb3IgYSBwYXRoIG92ZXIKb3RoZXJ3aXNlIGJhcmUgc2VlbiB0ZXJyYWluLiBUaGUgZnJhbWUKY2FycmllcyBzZW1hbnRpYyBmZWF0dXJlL3RyYXAvb2JqZWN0L21vbnN0ZXIgaWRzLAp2aXNpYmlsaXR5LCBvcmRlcmVkIGxheWVycywgY3Vyc29yLCBhbmQgcGxheWVyIHBsYWNlbWVudCwgc28gYSBzZWxlY3RlZCBmcm9udAplbmQgY2FuIG1ha2UgYW4gaXNvbWV0cmljIG9yIDNEIHZpZXcgd2l0aG91dCBkZWNvZGluZyB0ZXJtaW5hbCBnbHlwaHMuClRoZSBQaGFzZS00IGNvbnRyb2wgZXhlY3V0ZXMgdGhlIHNhbWUgcHJvZHVjZXIgdXNlZCBieSBgcmVuZGVyKClgLCBjaGVja3MgaXRzCnVubW9kZGVkIHByZS1mcmFtZSBnbHlwaCB0dXBsZXMsIGFuZCB0ZWVzIHRoYXQgZXhhY3QgZnJhbWUgdG8gYW4gaW5kZXBlbmRlbnQKaG9zdCBzaW5rIGluIHRoZSBzYW1lIGNhbGwuClRoZSBzZWxlY3RlZCBmcm9udGVuZCByZWNlaXZlcyBhIGZyb3plbiBjb3B5IG9mIHRoYXQgZnJhbWU7IHRoZSB1bnNlbGVjdGVkIGFuZAphYnNlbnQgcGF0aHMgbGVhdmUgdGhlIGV4YWN0IGdseXBoIHNpbmsgYWN0aXZlLgoKVGhlIHNhbWUgaXMgdHJ1ZSBvZiBgVWlJbnB1dGAgaW4gYHBhY2thZ2VzL3dlYi9zcmMvaW5wdXQtZG9vci50c2AuIEl0IGlzIHRoZQpzaW5nbGUgZGV2aWNlLW5ldXRyYWwgcm91dGUgYnkgd2hpY2gga2V5Ym9hcmQgYW5kIGtleW1hcCBpbnB1dCByZWFjaGVzIHNjcmVlbnM7Cml0cyBkaXJlY3Rpb24gY2FycmllcyBhbiBhbmFsb2cgdmVjdG9yIGFuZCBhbmdsZS4gSXQgZG9lcyBub3QgZ3JhbnQgYSBwbHVnaW4gYQpiaW5kaW5nIHJlZ2lzdHJ5IGluIHRoaXMgcGhhc2UuIFN0b3JlZCBwbGF5ZXIga2V5bWFwcyBhcmUgZXZhbHVhdGVkIGZpcnN0IHdoZW4KdGhlIHJvb3Qgb3ducyBpbnB1dDsgc2NvcmUgcGFnZXMsIG1vZGFscywgYW5kIHJ1biBpbnRlcnJ1cHRpb24gcmV0YWluIHRoZWlyCmV4aXN0aW5nIGxpdGVyYWwta2V5IGdhdGVzLCBzbyBhIG1vZCBtdXN0IG5vdCB1c2UgaW5qZWN0ZWQgaW5wdXQgdG8gb3V0cmFuayB0aGUKcGxheWVyJ3MgY2hvc2VuIG1hcHBpbmcgb3IgYW4gYWN0aXZlIHNjcmVlbi4KCmByZWdpc3RlcmAgcmVhY2hlcyBlaWdodGVlbiByZWdpc3RyaWVzLCBlYWNoIGdhdGVkIGJ5IGEgY2FwYWJpbGl0eSB5b3VyIG1hbmlmZXN0Cm11c3QgZGVjbGFyZSAqKmFuZCoqIHRoZSBwbGF5ZXIgbXVzdCBjb25zZW50IHRvLiBgUkVHSVNUUllfQ0FQQUJJTElUSUVTYAooYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCkgaXMgdGhlIG9uZSBwbGFjZSB0aGUgdm9jYWJ1bGFyeSBpcwp3cml0dGVuIGRvd24sIGFuZCB0aGUgdGFibGUgYmVsb3cgaXMgYSByZWFkaW5nIG9mIGl0OgoKfCBDYXBhYmlsaXR5IHwgV2hhdCBpdCBvcGVucyB8CnwtLS18LS0tfAp8IGByZWdpc3RyeTplZmZlY3RgIHwgYWRkIGEgbmV3IGVmZmVjdCBjb2RlLCBvciByZXBsYWNlIGEgY29yZSBvbmU6IGNvbWJhdCwgaGVhbGluZywgdGVsZXBvcnQsIGRldGVjdGlvbiB8CnwgYHJlZ2lzdHJ5OnJvb21gIHwgcm9vbSBhbmQgbGV2ZWwgYnVpbGRlcnMsIHJlZmVyZW5jZWQgZnJvbSBhIGR1bmdlb24gcHJvZmlsZSB8CnwgYHJlZ2lzdHJ5OnByb2ZpbGVgIHwgd2hvbGUtY2F2ZSBidWlsZGVycyBhbmQgZHVuZ2VvbiBwcm9maWxlczogYSBuZXcgKmtpbmQqIG9mIGxldmVsLCBhbmQgd2hpY2gga2luZCB5b3UgZ2V0IGF0IGEgZGVwdGggfAp8IGByZWdpc3RyeTpibG93YCB8IHdoYXQgYSBtb25zdGVyJ3MgYXR0YWNrcyBkbyB0byB5b3UsIGFuZCBuZXcga2luZHMgb2YgYXR0YWNrOiBgZGVmaW5lKClgIHRha2VzIG9uZSBkZXNjcmlwdGlvbiBhbmQgdGhlIGVuZ2luZSBkZXJpdmVzIGJvdGggb2YgdGhlIGhhbmRsZXJzIGl0IG5lZWRzIHwKfCBgcmVnaXN0cnk6c3RvcmVgIHwgd2hhdCBhIHNob3Agd2lsbCBidXksIGFuZCBob3cgbWFueSBvZiBhIHRoaW5nIGl0IHN0b2NrcyB8CnwgYHJlZ2lzdHJ5OmNvbW1hbmRgIHwgd2hhdCBhIHBsYXllciBjb21tYW5kICpkb2VzKiwgYW5kIHdoYXQgaXQgaXMgQ0FMTEVEOiBgY29tbWFuZHMucmVnaXN0ZXIoY29kZSwgYWN0aW9uKWAgZm9yIHRoZSBiZWhhdmlvdXIsIGBjb21tYW5kcy5zZXRWZXJiKGNvZGUsIHZlcmIpYCBmb3IgdGhlIHZlcmIgdGhlIGAhYC1pbnNjcmlwdGlvbiBjb25maXJtIHJlYWRzLiBTa2lwIHRoZSB2ZXJiIGFuZCBhIHBsYXllciB3aG8gaGFzIGluc2NyaWJlZCBgIXpgIG9uIGEgUG90aW9uIG9mIERlYXRoIGlzIGFza2VkICJSZWFsbHkgKipkbyB0aGF0IHdpdGgqKiB5b3VyIFBvdGlvbiBvZiBEZWF0aD8iIGluc3RlYWQgb2YgeW91ciBjb21tYW5kJ3Mgb3duIG5hbWU7IGBjb21tYW5kcy52ZXJiRm9yKGNvZGUpYCByZXR1cm5zIHdoYXQgaXMgaW5zdGFsbGVkLCBzbyBhIGxhdGVyIG1vZCBjYW4gd3JhcCBhbiBlYXJsaWVyIG9uZSdzIHwKfCBgcmVnaXN0cnk6bW9uc3RlcmAgfCBhIGhvb2sgYXQgdGhlIHRvcCBvZiBldmVyeSBtb25zdGVyJ3MgdHVybjsgcmV0dXJuIHRydWUgdG8gdGFrZSB0aGUgdHVybiBvdmVyIHwKfCBgcmVnaXN0cnk6cHJvamVjdGlvbmAgfCB3aGF0IGEgcHJvamVjdGlvbiBkb2VzIHRvIHRlcnJhaW4sIGZsb29yIGl0ZW1zIGFuZCB0aGUgcGxheWVyOiBgcHJvamVjdGlvbnMuZmVhdGAgLyBgLm9iamAgLyBgLnBsYXllcmAsIG9uZSBwcm9qZWN0aW9uIGBjb2RlYCBhdCBhIHRpbWUuIFRoaXMgaXMgdGhlIGJlaGF2aW91ciBoYWxmIG9mIGFkZGluZyB5b3VyIG93biBlbGVtZW50OiB0aGUgYHByb2plY3Rpb24uanNvbmAgcmVjb3JkIG1ha2VzIGl0IGV4aXN0LCB0aGVzZSB0aHJlZSBtYWtlIGl0ICpkbyogc29tZXRoaW5nIHwKfCBgcmVnaXN0cnk6dWktZW50cnlgIHwgd2hhdCBhIGBjb21iaW5lOmAgb3IgYW4gYGVudHJ5LXJlbmRlcmVyOmAgYGNvZGU6YCAqbWVhbnMqIG9uIHRoZSBzZWNvbmQgY2hhcmFjdGVyIHNjcmVlbiBhbmQgdGhlIGVxdWlwbWVudCBjb21wYXJpc29uOiBgdWlFbnRyeS5jb21iaW5lcnMuc2V0KCJteS1tb2Q6d29yc3Qtb2YiLCAuLi4pYCAoaG93IGEgcm93J3MgcGVyLXNsb3QgdmFsdWVzIHJlZHVjZSB0byB0aGUgb25lIHRoYXQgY29sb3VycyBpdHMgbGFiZWwpIGFuZCBgdWlFbnRyeS5iYWNrZW5kcy5zZXQoIm15LW1vZDpiYXJzIiwgLi4uKWAgKGhvdyBhIHZhbHVlIGJlY29tZXMgYSBjZWxsIHN5bWJvbCBhbmQgY29sb3VyKS4gQWRkaW5nIGEgYHVpX2VudHJ5Lmpzb25gIFJPVyBuZWVkcyBubyBjYXBhYmlsaXR5OyBhIHJvdyBuYW1pbmcgYSBjb21iaW5lciBvciByZW5kZXJlciBub3RoaW5nIGFuc3dlcnMgZm9yIGRyYXdzIGFzIGFuIGVtcHR5IHJvdyByYXRoZXIgdGhhbiBmYWlsaW5nLCBzbyB0aGlzIGlzIHdoYXQgbWFrZXMgeW91ciByb3cgbWVhbiBzb21ldGhpbmcgfAp8IGByZWdpc3RyeTpnbHlwaGAgfCB3aGF0IG9uZSBjaGFyYWN0ZXIgb2YgYSByb29tLXRlbXBsYXRlIG9yIHZhdWx0IGxheW91dCBtZWFucyB3aGVuIHRoZSBsZXZlbCBpcyBkcmF3bjogYGdseXBocy5zZXQoInZhdWx0IiwgIlEiLCAuLi4pYC4gVGhlIGJlaGF2aW91ciBoYWxmIG9mIHNoaXBwaW5nIGEgdmF1bHQgd2l0aCBhIHN5bWJvbCBjb3JlIGhhcyBuZXZlciBzZWVuIHwKfCBgcmVnaXN0cnk6ZWZmZWN0LWluZm9gIHwgd2hhdCB0aGUgZ2FtZSAqc2F5cyogYWJvdXQgYW4gZWZmZWN0OiBgZWZmZWN0SW5mby50ZXh0YCAodGhlIG1lbnUgcm93IGFuZCB0aGUgcmVjYWxsIHNlbnRlbmNlKSwgYC5zdW1tYXJ5YCAodGhlIG9iamVjdCBwcm9wZXJ0aWVzIGFuIGFjdGl2YXRpb24gZ3JhbnRzKSwgYC5zdWJ0eXBlYCAodGhlIG5hbWVkIHN1YnR5cGVzIGl0IGFjY2VwdHMpIGFuZCBgLnJlcXVlc3RgICh3aGljaCBpdGVtIGl0IHByb21wdHMgZm9yKS4gVGhpcyBpcyB0aGUgZGVzY3JpcHRpb24gaGFsZiBvZiBgcmVnaXN0cnk6ZWZmZWN0YDogd2l0aG91dCBpdCB5b3VyIG5ldyBlZmZlY3Qgd29ya3MgYW5kIHRoZSBnYW1lIGhhcyBub3RoaW5nIHRvIHNheSBhYm91dCBpdCB8CnwgYHJlZ2lzdHJ5OnR2YWxgIHwgd2hhdCBhbiBpdGVtIENMQVNTICppcyo6IGB0dmFsLmNsYXNzZXNgIChrZXllZCBvbiB0aGUgcHJlZGljYXRlJ3Mgb3duIG5hbWUsIHNvIGBoYW5kbGVyRm9yKCJ0dmFsSXNXZWFwb24iKWAgcmV0dXJucyBjb3JlJ3MgYXJtIGFuZCBhIG1vZCBPUnMgaXRzIG93biB0dmFsIGludG8gaXQpLCBgLmdvb2RgICh3aGV0aGVyIGEgdGVtcGxhdGUgY291bnRzIGFzIGdvb2QgZm9yIGFsbG9jYXRpb24pIGFuZCBgLnZhbHVlQmFzZWAgKHdoYXQgYW4gdW5pZGVudGlmaWVkIGl0ZW0gb2YgdGhlIGNsYXNzIGlzIHdvcnRoKSBhbmQgYC5iYXNlbmFtZWAgKHdoYXQgdGhlIGNsYXNzIGlzIENBTExFRCAtIHdpdGhvdXQgaXQgZXZlcnkgbWVzc2FnZSwgbWVudSByb3cgYW5kIHNob3AgbGluZSBuYW1pbmcgdGhlIGNsYXNzIHJlYWRzIHRoZSBsaXRlcmFsICIobm90aGluZykiKS4gU2hpcHBpbmcgYSBuZXcgKml0ZW0qIG5lZWRzIG5vIGNhcGFiaWxpdHk7IHRoaXMgaXMgdGhlIGNsYXNzIHwKfCBgcmVnaXN0cnk6cmFuZGFydGAgfCBob3cgUkFORE9NIGFydGlmYWN0cyBhcmUgYnVpbHQ6IGByYW5kYXJ0LmFiaWxpdGllc2AgKHdoYXQgYSBwb3dlciBkb2VzKSwgYC5wcmVwYCAod2hhdCBhbiBpdGVtIGNsYXNzIHN0YXJ0cyB3aXRoKSwgYC5jZW5zdXNgICh3aGljaCBmcmVxdWVuY3kgYnVja2V0IGl0IGZlZWRzKSBhbmQgYC5yZWR1bmRhbmN5YCAod2hldGhlciBhbiBhY3RpdmF0aW9uIGR1cGxpY2F0ZXMgc29tZXRoaW5nIHRoZSBhcnRpZmFjdCBhbHJlYWR5IGhhcykuIFNoaXBwaW5nIGEgKmZpeGVkKiBhcnRpZmFjdCBuZWVkcyBubyBjYXBhYmlsaXR5OyB0aGlzIGlzIHRoZSBnZW5lcmF0b3IgfAp8IGByZWdpc3RyeTpydW5lYCB8IHdoYXQgYSBSVU5FIGlzOiB0aGUgdW5pdCBvZiBvYmplY3Qga25vd2xlZGdlLiBgcnVuZS5kZXNjYCAodGhlIHJlY2FsbCBsaW5lKSwgYC5uYW1lYCAodGhlIGRpc3BsYXkgZGVjb3JhdGlvbiksIGAua25vd3NgIC8gYC5sZWFybmAgKHRoZSBrbm93bGVkZ2UgcGFpciwgaGFuZGVkIHRoZSBwbGF5ZXIgc28gWU9VUiBtb2Qga2VlcHMgdGhlIHN0b3JlLCBzaW5jZSBjb3JlIG5ldmVyIGdyZXcgYSBzbG90IGZvciBpdCksIGAub2JqZWN0SGFzYCAod2hldGhlciBhbiBpdGVtIGNhcnJpZXMgaXQpIGFuZCBgLm1vZE1lc3NhZ2VgICh0aGUgIllvdSBmZWVsIHN0cm9uZ2VyISIgbGluZSwga2V5ZWQgb24gdGhlIG1vZGlmaWVyKS4gUGx1cyBgLmNvbnRyaWJ1dGVgLCB3aGljaCBpcyBob3cgeW91ciBydW5lIGdldHMgaW50byB0aGUgbGlzdCBldmVyeSBjb25zdW1lciBlbnVtZXJhdGVzLCBhbmQgd2l0aG91dCBpdCB0aGUgc2l4IHRhYmxlcyBhYm92ZSBhcmUgaGFuZGxlcnMgbm90aGluZyBldmVyIGNhbGxzIHwKfCBgcmVnaXN0cnk6dm9jYWJgIHwgZGVjbGFyZSBnZW51aW5lbHkgbmV3IHZvY2FidWxhcnkgKGZsYWdzLCBzdGF0cywgbW9kLWNvaW5lZCBraW5kcykgYW5kIHN0b3JlIHBlci1lbnRpdHkgdmFsdWVzIHwKfCBgcmVnaXN0cnk6bWVzc2FnZWAgfCBtZXNzYWdlIFRZUEVTOiBgbWVzc2FnZXMuZGVmaW5lKG5hbWUsIHNvdW5kPylgIGNvaW5zIG9uZSBhbmQgcmV0dXJucyBpdHMgbnVtYmVyLCBgLmxvb2t1cChuYW1lKWAgZmluZHMgYW4gZXhpc3Rpbmcgb25lLCBgLnR5cGVzKClgIGxpc3RzIHdoYXQgaGFzIGJlZW4gYWRkZWQsIGAuYWRkU291bmRzKC4uLilgIGF0dGFjaGVzIHNvdW5kcy4gQWRkaW5nIGEgYG1lc3NhZ2VfdHlwZS5qc29uYCBSRUNPUkQgbmVlZHMgbm8gY2FwYWJpbGl0eSwgdGhlIHNhbWUgd2F5IGFkZGluZyBhbiBpdGVtIGRvZXM7IHRoaXMgaXMgdGhlIGNvZGUgaGFsZiwgZm9yIGEgdHlwZSB5b3VyIG93biBwbHVnaW4gcmFpc2VzIHwKfCBgcmVnaXN0cnk6bWVudWAgfCByZXdyaXRlIG9uZSBzdGFibGUgbWVudSBpZCdzIHNlbWFudGljIHJvd3MuIGBtZW51cy5oYW5kbGVyRm9yKGlkKWAgcmV0dXJucyB0aGUgZWFybGllciB0cmFuc2Zvcm1lciwgc28gYSBsYXRlciBtb2Qgd3JhcHMgaXQgYmVmb3JlIGNhbGxpbmcgYG1lbnVzLnJlZ2lzdGVyKGlkLCAuLi4pYDsgYSB0aHJvdyBvciBhIG5vbi1yb3ctYXJyYXkgcmVzdWx0IGlzIHJlcG9ydGVkIGFnYWluc3QgdGhhdCBtb2QgYW5kIGxlYXZlcyB0aGUgb3JpZ2luYWwgbWVudSB1c2FibGUgfAp8IGByZWdpc3RyeTp0aWxlc2AgfCBzdXBwbHkgdGlsZXMgZm9yIGNvbnRlbnQgdGhlIGxvYWRlZCB0aWxlIHBhY2sgZG9lcyBub3QgZHJhdywgd2hpY2ggaW4gcHJhY3RpY2UgbWVhbnMgY29udGVudCBhIG1vZCBhZGRlZC4gYHRpbGVzLnJlZ2lzdGVyKGZpbGxlcilgIGluc3RhbGxzIG9uZSBmaWxsZXIgcGVyIG1vZDsgZXZlcnkgcmVnaXN0ZXJlZCBmaWxsZXIgcnVucywgaW4gbG9hZCBvcmRlciwgYWZ0ZXIgdGhlIHBhY2sncyBvd24gcHJlZnMgYW5kIGV2ZXJ5IG1vZCdzLiBJdCBjYW4gb25seSB3cml0ZSB3aGVyZSBOT1RISU5HIGlzIGFzc2lnbmVkLCBzbyBpdCBjYW5ub3QgcmVwYWludCB0aGUgdGlsZSBzZXQgZXZlbiBieSBtaXN0YWtlIGFuZCB0d28gbW9kcyBjYW5ub3QgZmlnaHQgb3ZlciBhbiBpbmRleC4gVGhlIHNhbWUgc2VhbSBhbHNvIGdyZXcgYSByZXBhaW50LWluLXBsYWNlIGRvb3IgKGBmaWxsLnRyYW5zZm9ybWAsIG1pcnJvciBhbmQvb3IgYSBwYWxldHRlIHJlbWFwIG92ZXIgYW4gZXhpc3RpbmcgdGlsZSkgYW5kIGEgcGxheWVyLWNlbGwgZG9vciAoYHRpbGVzLnBsYXllcmAsIGFza2VkIG9uY2UgcGVyIGZyYW1lIHdoYXQgdGhlIGNoYXJhY3RlcidzIG93biBjZWxsIHNob3VsZCBzaG93KS4gU2VlIFtGaWxsaW5nIHRpbGVzXSgjZmlsbGluZy10aWxlcykgYW5kIFtSZXBhaW50aW5nIGEgdGlsZSwgYW5kIGRyYXdpbmcgdGhlIHBsYXllcidzIG93biBjZWxsXSgjcmVwYWludGluZy1hLXRpbGUtYW5kLWRyYXdpbmctdGhlLXBsYXllcnMtb3duLWNlbGwpIHwKCkEgZmFjYWRlIHlvdSBkaWQgbm90IGRlY2xhcmUgdGhyb3dzIHdoZW4geW91IHRvdWNoIGl0LCBldmVuIGlmIHRoZSBwbGF5ZXIKY29uc2VudGVkIHRvIHNvbWV0aGluZyBlbHNlLiBDb25zZW50IHNheXMgdGhlIHBsYXllciBhbGxvd2VkIHRoZXNlIGRvbWFpbnM7IHRoZQptYW5pZmVzdCBzYXlzIHlvdSBhc2tlZCBmb3IgdGhlbTsgYm90aCBtdXN0IGhvbGQuCgojIyMgV2hhdCBhIGNhcGFiaWxpdHkgZ2F0ZXMsIGFuZCB3aGF0IGl0IGRvZXMgbm90CgpUaGUgc2VudGVuY2UgYWJvdmUgaXMgZXhhY3RseSB0cnVlIGFuZCBpdCBpcyBuYXJyb3dlciB0aGFuIGl0IGxvb2tzLiAqKlRoZSBnYXRlCmlzIG9uIHRoZSBmYWNhZGUsIG5vdCBvbiB0aGUgcmVnaXN0cnkgYmVoaW5kIGl0LioqIEEgYHJlZ2lzdHJ5OipgIGNhcGFiaWxpdHkgaXMgYQpERUNMQVJBVElPTiwgYW5kIHdoYXQgaXQgYnV5cyBpcyByZWFsIGJ1dCBib3VuZGVkOgoKLSB0aGUgcGxheWVyIHNlZXMgdGhlIGxpc3QsIGluIHBsYWluIGxhbmd1YWdlLCBiZWZvcmUgY29uc2VudGluZzsKLSB0aGUgY29uZmxpY3QgcmVwb3J0IGFuZCB0aGUgbWFuYWdlciByb3cgYXJlIGJ1aWx0IGZyb20gaXQ7Ci0gYW4gYXV0aG9yIHdobyBmb3Jnb3QgdG8gZGVjbGFyZSBhIGRvbWFpbiBnZXRzIGEgY2xlYXIgdGhyb3cgd2l0aCB0aGUKICBjYXBhYmlsaXR5IG5hbWUgaW4gaXQsIHJhdGhlciB0aGFuIGEgc2lsZW50IHN1cnByaXNlIGxhdGVyLgoKV2hhdCBpdCBpcyAqKm5vdCoqIGlzIGEgZmVuY2UgYXJvdW5kIHRoZSByZWdpc3RyeS4gWW91ciBgcmVnaXN0ZXIoaG9zdCwgY3R4KWAgaXMKaGFuZGVkIHRocmVlIHRoaW5ncyB3aXRoIG5vIGNhcGFiaWxpdHkgY2hlY2sgYXQgYWxsLCBiZWNhdXNlIGEgbW9kIGlzIG1lYW50IHRvIGJlCmFibGUgdG8gTE9PSyBhdCBldmVyeXRoaW5nIHdpdGhvdXQgZGVjbGFyaW5nIGFueXRoaW5nOgoKfCBIYW5kZWQgdG8geW91IHVuZ2F0ZWQgfCBUaGUgZ2F0ZWQgZmFjYWRlIGl0IGlzIHRoZSB0d2luIG9mIHwKfC0tLXwtLS18CnwgYGN0eC5yZWdpc3RyaWVzLnJvb21zYCwgYC5wcm9maWxlc2AsIGAucm9vbXMuZ2x5cGhzYCB8IGByZWdpc3RyeTpyb29tYCwgYHJlZ2lzdHJ5OnByb2ZpbGVgLCBgcmVnaXN0cnk6Z2x5cGhgIHwKfCBgY3R4LnN0YXRlLmJsb3dFZmZlY3RzYCwgYC5zdG9yZUJlaGF2aW91cmAsIGAucHJvamVjdGlvbkhhbmRsZXJzYCwgYC51aUVudHJ5YCwgYC5jb21tYW5kVmVyYnNgLCBgLm1vbnN0ZXJUdXJuSG9va2AgfCBgcmVnaXN0cnk6Ymxvd2AsIGByZWdpc3RyeTpzdG9yZWAsIGByZWdpc3RyeTpwcm9qZWN0aW9uYCwgYHJlZ2lzdHJ5OnVpLWVudHJ5YCwgYHJlZ2lzdHJ5OmNvbW1hbmRgLCBgcmVnaXN0cnk6bW9uc3RlcmAgfAp8IGBjdHguY29yZS50dmFsUmVnaXN0cnkoKWAsIGAucnVuZVJlZ2lzdHJ5KClgLCBgLnJhbmRhcnRSZWdpc3RyeSgpYCwgYC5lZmZlY3RJbmZvUmVnaXN0cnkoKWAsIGAubWVzc2FnZVR5cGVzYCwgYC5zb3VuZFByZWZSZWdpc3RyeWAgfCBgcmVnaXN0cnk6dHZhbGAsIGByZWdpc3RyeTpydW5lYCwgYHJlZ2lzdHJ5OnJhbmRhcnRgLCBgcmVnaXN0cnk6ZWZmZWN0LWluZm9gLCBgcmVnaXN0cnk6bWVzc2FnZWAgfAoKYGN0eC5hdXRob3JpbmdgIGFuZCBgY3R4LmNvbXBvc2VkUmVjb3Jkc2AgYXJlIHVuZ2F0ZWQgdG9vLCBhbmQgZm9yIGEgZGlmZmVyZW50CnJlYXNvbiB3b3J0aCBrZWVwaW5nIHNlcGFyYXRlIGZyb20gdGhlIG9uZSBhYm92ZTogdGhleSBhcmUgbm90IHR3aW5zIG9mIGFueXRoaW5nLgpUaGUgYmFycmVsIGlzIHB1cmUgZnVuY3Rpb25zIG92ZXIgZGF0YSB5b3UgcGFzcyBpbiwgYW5kIHRoZSByZWNvcmRzIGFyZSB0aGUKY29udGVudCB0aGUgcGxheWVyIGFscmVhZHkgaGFzLCBpbiB0aGUgc2hhcGUgaXQgd2FzIHJlYWQgaW4uIE5vdGhpbmcgdGhlcmUgaXMgYQpzZWNvbmQgcm91dGUgdG8gYSBnYXRlZCBkb29yLgoKVGhvc2UgYXJlIHRoZSBzYW1lIGxpdmUgb2JqZWN0cywgYnkgaWRlbnRpdHksIG5vdCBjb3BpZXMuIGBjdHguY29yZWAgYWxzbyBleHBvcnRzCmBjcmVhdGVNb2RSZWdpc3RyeUhvc3RgIGl0c2VsZiwgd2hpY2ggZ3JhbnRzIGV2ZXJ5IGRvbWFpbiB3aGVuIGl0IGlzIGNhbGxlZAp3aXRob3V0IGEgY2FwYWJpbGl0eSBzZXQsIHNvIGFuIHVuZ2F0ZWQgaG9zdCBpcyBvbmUgY2FsbCBhd2F5IGZvciBhbnl0aGluZwpob2xkaW5nIHRoZSBuYW1lc3BhY2UuCgoqKlRoaXMgaXMgaW5oZXJlbnQsIG5vdCBhbiBvdmVyc2lnaHQgd2FpdGluZyB0byBiZSBmaXhlZC4qKiBBIHRydXN0ZWQgcGx1Z2luIHJ1bnMKaW4tcHJvY2Vzcywgc3luY2hyb25vdXNseSwgaG9sZGluZyB0aGUgZW5naW5lIG5hbWVzcGFjZSwgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5CndheSBhIGhhbmRsZXIgY2FuIHRvdWNoIHRoZSBsaXZlIGBybmdgLCBgY2h1bmtgIGFuZCBgcGxheWVyYCBkZWVwIGluc2lkZSBhIHR1cm4KKHRoZSByZWFzb25pbmcgaXMgaW4gYHBhY2thZ2VzL2NvcmUvc3JjL21vZC9yZWdpc3RyeS1ob3N0LnRzYCwgdW5kZXIgV0hZCklOLVBST0NFU1MgQU5EIFRSVVNURUQpLiBOb3RoaW5nIHJlYWNoYWJsZSBmcm9tIGluc2lkZSB0aGF0IG5hbWVzcGFjZSBjYW4gYmUKd2l0aGhlbGQgZnJvbSBjb2RlIGFscmVhZHkgaW5zaWRlIGl0LCBhbmQgYSByZWFkLW9ubHkgdmlldyBvdmVyIGBjdHgucmVnaXN0cmllc2AKd291bGQgY2xvc2UgdGhyZWUgb2YgdGhlIGZpZnRlZW4gdHdpbnMgYWJvdmUgd2hpbGUgcmVhZGluZyBhcyB0aG91Z2ggaXQgaGFkCmNsb3NlZCB0aGUgY2xhc3MuIGBwYWNrYWdlcy93ZWIvc3JjL2NhcGFiaWxpdHktZ2F0ZS1yZWFjaC50ZXN0LnRzYCBtZWFzdXJlcyBib3RoCmhhbHZlcyAtIHRoZSBnYXRlIHJlZnVzaW5nLCBhbmQgdGhlIHR3aW4gcmVhY2hpbmcgLSBzbyB0aGlzIHBhZ2UgY2Fubm90IHF1aWV0bHkKZHJpZnQgaW50byBjbGFpbWluZyBjb250YWlubWVudC4KCioqYHJlZ2lzdHJ5OipgIGlzIG5vdCB0aGUgb25seSBmYW1pbHkgdGhpcyBpcyB0cnVlIG9mLCBpbiB0aGUgaW4tcHJvY2VzcyB0aWVyLioqCmBzdGF0ZTo8ZG9tYWluPi5yZWFkYCBnYXRlcyB0aGUgcGVyY2VpdmUgZmFjYWRlJ3MgYWNjZXNzb3JzIHBlciBkb21haW4sIGFuZApgY3R4LnN0YXRlYCBpcyB0aGUgd2hvbGUgbGl2ZSBgR2FtZVN0YXRlYC4gYG5ldHdvcms6PGhvc3Q+YCBnYXRlcyB0aGUgYWN0CmZhY2FkZSdzIHJlcXVlc3QgaGVscGVyLCBhbmQgYSBwbHVnaW4gaXMgYW4gRVMgbW9kdWxlIGluIHRoZSBnYW1lJ3Mgb3duIHBhZ2Ugd2l0aAp0aGUgZ2xvYmFsIGBmZXRjaGAgaW4gc2NvcGUuIFNhbWUgc2hhcGUsIHNhbWUgcmVhc29uLgoKKipXaGVyZSB0aGVzZSBjYXBhYmlsaXRpZXMgQVJFIGVuZm9yY2VtZW50IGlzIHRoZSBzYW5kYm94ZWQgV29ya2VyIHRpZXIuKiogVGhhdAp0aWVyIGlzIGlzb2xhdGVkIGJ5IGNvbnN0cnVjdGlvbjogaXQgZ2V0cyB0aGUgcmVhY3RpdmUgcGVyY2VpdmUgLyBhY3QgLyBldmVudApzdXJmYWNlIGFjcm9zcyBhIG1lc3NhZ2UgYm91bmRhcnkgYW5kIG5vbmUgb2YgYGN0eC5jb3JlYCwgYGN0eC5zdGF0ZWAgb3IKYGN0eC5yZWdpc3RyaWVzYCwgc28gdGhlcmUgaXMgbm8gdHdpbiB0byByZWFjaCBhbmQgYSBkZW5pZWQgZG9tYWluIGlzIGRlbmllZC4gVGhlCnNhbWUgY2FwYWJpbGl0eSBzdHJpbmcgdGhlcmVmb3JlIG1lYW5zIGNvbnRhaW5tZW50IG9uIG9uZSBzaWRlIG9mIHRoYXQgYm91bmRhcnkKYW5kIGRlY2xhcmF0aW9uIG9uIHRoZSBvdGhlciwgd2hpY2ggaXMgd2h5IHRoaXMgc2VjdGlvbiBpcyBhYm91dCB0aGUgaW4tcHJvY2Vzcwp0aWVyIHNwZWNpZmljYWxseS4KCioqVGhlIGJvdW5kYXJ5IHRoYXQgSVMgcmVhbCBpcyB0aGUgaW5zdGFsbC4qKiBBIG1vZCBpcyBjb2RlLCBub3RoaW5nIGluIHRoaXMKcHJvamVjdCByZXZpZXdzIGl0LCBhbmQgdGhlIHRvZ2dsZSBvbiB0aGUgTW9kcyBzY3JlZW4gaXMgd2hlcmUgdGhhdCBkZWNpc2lvbiBnZXRzCm1hZGUgKGBwYWNrYWdlcy93ZWIvc3JjL21vZC1jb25zZW50LnRzYCkuIFRoZSBjb25zZW50IHNjcmVlbiB0aGVyZWZvcmUgc2F5cyB0aGUKaW4tcHJvY2VzcyBsaW5lIGZvciBhbnkgbW9kIHRoYXQgc2hpcHMgY29kZSwgd2hhdGV2ZXIgaXRzIGRlY2xhcmVkIGxpc3QgbG9va3MKbGlrZSwgYW5kIHRoZSBtYW5hZ2VyIHJvdyBvbiBhIHBsdWdpbiBkZWNsYXJpbmcgbm90aGluZyBzYXlzIHNvIHJhdGhlciB0aGFuCnJlYWRpbmcgYXMgYSByZWFzc3VyYW5jZS4KCioqU28gZGVjbGFyZSB3aGF0IHlvdSBvdmVycmlkZS4qKiBOb3QgYmVjYXVzZSB0aGUgdGhyb3cgaXMgdGhlIG9ubHkgdGhpbmcKc3RvcHBpbmcgeW91LCBidXQgYmVjYXVzZSB0aGUgZGVjbGFyYXRpb24gaXMgd2hhdCB0aGUgcGxheWVyIHJlYWRzIGFuZCB3aGF0IHRoZQpjb25mbGljdCByZXBvcnQgaXMgbWFkZSBvZi4gUmVhY2hpbmcgYSByZWdpc3RyeSBhcm91bmQgaXRzIGZhY2FkZSBtZWFucyB0aGUKcGxheWVyIGNvbnNlbnRlZCB0byBhIG1vZCB0aGF0IGRpZCBub3Qgc2F5IHdoYXQgaXQgZG9lcywgYW5kIHRoZSBtYW5hZ2VyIHdpbGwKcmVwb3J0IGEgY2xhc2ggaXQgaGFzIG5vIHdheSB0byBzZWUuCgojIyMgT3ZlcndyaXRpbmcgYW5kIGV4dGVuZGluZzogeW91cnMsIGNvcmUncywgb3Igc29tZWJvZHkgZWxzZSdzCgpFdmVyeSByZWdpc3RyeSBoZXJlIGlzIGtleWVkLCBhbmQgeW91IHdyaXRlICoqb25lIGtleSBhdCBhIHRpbWUqKi4gVGhhdCBpcyB3aGF0Cm1ha2VzIHR3byBtb2RzIGFibGUgdG8gdG91Y2ggdGhlIHNhbWUgc3lzdGVtOiB0aGUgbGFzdCBvbmUgdG8gd3JpdGUgYSBrZXkgd2lucwp0aGF0IGtleSwgYW5kIGV2ZXJ5IG90aGVyIGtleSBlaXRoZXIgbW9kIHdyb3RlIHN1cnZpdmVzLiBIYW5kaW5nIG92ZXIgYSB3aG9sZQp0YWJsZSBpbnN0ZWFkIHdvdWxkIG1lYW4gdGhlIHNlY29uZCBtb2QgbG9hZGVkIHNpbGVudGx5IGVyYXNlZCB0aGUgZmlyc3QuCgpFYWNoIGZhY2FkZSBhbHNvIGhhbmRzIGJhY2sgd2hhdCBpcyBpbnN0YWxsZWQgKnJpZ2h0IG5vdyosIHNvIGV4dGVuZGluZyBpcyB0aGUKc2FtZSBtb3ZlIGFzIHJlcGxhY2luZzoKCmBgYGpzCnJlZ2lzdGVyKGhvc3QpIHsKICAvLyBZb3VyIG93biBlbGVtZW50LCBnaXZlbiBhIGJvZHkuCiAgaG9zdC5wcm9qZWN0aW9ucy5wbGF5ZXIuc2V0KCJmcm9zdDpyaW1lIiwgKGN0eCkgPT4gewogICAgY3R4Lm1zZygiVGhlIHJpbWUgYml0ZXMgZGVlcGVyIHRoYW4gY29sZC4iKTsKICAgIGN0eC5pbmNUaW1lZChUTURfU0xPVywgNSwgdHJ1ZSk7CiAgfSk7CgogIC8vIENvcmUncyBGSVJFLCBleHRlbmRlZC4gYHByZXZpb3VzYCBpcyBjb3JlJ3MgaGFuZGxlciwgb3IsIGlmIGEgbW9kIGxvYWRlZAogIC8vIGJlZm9yZSB5b3VycyBhbHJlYWR5IHJlcGxhY2VkIGl0LCBUSEVJUlMuIFlvdSBkbyBub3QgbmVlZCB0byBrbm93IHdoaWNoLgogIGNvbnN0IHByZXZpb3VzID0gaG9zdC5wcm9qZWN0aW9ucy5wbGF5ZXIuaGFuZGxlckZvcigiRklSRSIpOwogIGhvc3QucHJvamVjdGlvbnMucGxheWVyLnNldCgiRklSRSIsIChjdHgpID0+IHsKICAgIHByZXZpb3VzKGN0eCk7CiAgICBjdHgubXNnKCJZb3VyIGNsb2FrIHNtb3VsZGVycy4iKTsKICB9KTsKfQpgYGAKCmBoYW5kbGVyRm9yYCBpcyBvbiBldmVyeSBmYWNhZGUgaW4gdGhlIHRhYmxlIGFib3ZlOiBgYmxvd3MuaGFuZGxlckZvcmAsCmBzdG9yZXMud2lsbEJ1eUZvcmAsIGBwcm9maWxlcy5idWlsZGVyYC4gUmVhY2ggZm9yIGl0IGJlZm9yZSByZWltcGxlbWVudGluZwphbnl0aGluZzogYSB3cmFwcGVyIHN1cnZpdmVzIGEgY29yZSBjaGFuZ2UgdGhhdCBhIGNvcHkgZG9lcyBub3QuCgpNZW51cyBhcmUgZGVjbGFyZWQgYnkgc3RhYmxlIGlkcyBzdWNoIGFzIGBjb3JlOmdhbWUtbWVudWAgYW5kCmBjb3JlOmtub3dsZWRnZS1ncm91cGAsIG5ldmVyIHRoZWlyIGxvY2FsaXplZCB0aXRsZXMuIEVhY2ggcm93IGhhcyBhIHN0YWJsZQpgaWRgIHBsdXMgYHNlbWFudGljOiB7IGtpbmQsIHJlZj8sIGRhdGE/IH1gOiBhIGNvbW1hbmQgd2hlZWwgY2FuIHVzZSBhIGNvbW1hbmQKcm93J3MgYHJlZmAsIHdoaWxlIGFuIGludmVudG9yeSBncmlkIGNhbiB1c2UgYW4gaXRlbSByb3cgd2l0aG91dCByZXZlcnNlLXBhcnNpbmcKdGhlIGxhYmVsLiBBIHRyYW5zZm9ybWVyIHJlY2VpdmVzIHRob3NlIHJvd3MsIG1heSBhZGQvcmVtb3ZlL3Jlb3JkZXIvcmVsYWJlbCwKYW5kIHJldHVybnMgdGhlIHJlcGxhY2VtZW50IHJvdyBhcnJheToKCmBgYGpzCnJlZ2lzdGVyKGhvc3QpIHsKICBjb25zdCBwcmV2aW91cyA9IGhvc3QubWVudXMuaGFuZGxlckZvcigiY29yZTpnYW1lLW1lbnUiKTsKICBob3N0Lm1lbnVzLnJlZ2lzdGVyKCJjb3JlOmdhbWUtbWVudSIsIChpZCwgcm93cykgPT4gWwogICAgLi4uKHByZXZpb3VzID8gcHJldmlvdXMoaWQsIHJvd3MpIDogcm93cyksCiAgICB7IGlkOiAibXktbW9kOnJlc3QiLCBsYWJlbDogIlJlc3QiLCBzZW1hbnRpYzogeyBraW5kOiAiY29tbWFuZCIsIHJlZjogInJlc3QiIH0gfSwKICBdKTsKfQpgYGAKClBsdWdpbiBjb2RlIHJ1bnMgKippbiBwcm9jZXNzLCBzeW5jaHJvbm91c2x5KiosIHdpdGggdGhlIHNhbWUgYWNjZXNzIHRvIHRoZSBybmcsCnRoZSBjaHVuaywgdGhlIHBsYXllciBhbmQgdGhlIG1vbnN0ZXIgdGhhdCBjb3JlIGhhcywgYmVjYXVzZSBhIGRlZXAgb3ZlcnJpZGUKY2Fubm90IGNyb3NzIGFuIGFzeW5jLCBpc29sYXRlZCBXb3JrZXIgYm91bmRhcnkuIFNvIGl0IGlzIHRydXN0ZWQgY29kZSwgZXhhY3RseSBhcwppdCBpcyBpbiBTS1NFIG9yIEZvcmdlLCBhbmQgdGhlIGNvbnNlbnQgcHJvbXB0IGlzIHRoZSBib3VuZGFyeS4gSWYgeW91ciBtb2Qgb25seQpuZWVkcyB0byByZWFjdCB0byBldmVudHMgcmF0aGVyIHRoYW4gb3ZlcnJpZGUgc3lzdGVtcywgdGhlIHVudHJ1c3RlZCBXb3JrZXIgdGllcgpleGlzdHMgZm9yIHRoYXQgYW5kIG5lZWRzIG5vIHRydXN0IGF0IGFsbC4KCiMjIFRlc3RpbmcgeW91cnMKClBvaW50IHRoZSBnYW1lIGF0IHlvdXIgZm9sZGVyIGFuZCByZWFkIHRoZSBtb2QgbWFuYWdlcjogaXQgbGlzdHMgd2hhdCB3YXMgZm91bmQsCmFuZCBvbmUgbGluZSBwZXIgcGFjayBpdCBjb3VsZCBub3QgdXNlLiBgV2hlcmUgbW9kcyBjb21lIGZyb21gIG5hbWVzIHRoZSBleGFjdApkaXJlY3RvcnkuCgpUaGUgbG9hZGVyIGl0c2VsZiBpcyBjb3ZlcmVkIGJ5IGBwYWNrYWdlcy93ZWIvc3JjL21vZC1jb2RlLnRlc3QudHNgICh0aGUgZ2F0ZXMsCndpdGggdGhlIGltcG9ydGVyIGluamVjdGVkIHNvIGFuIGFic2VuY2Ugb2YgZXhlY3V0aW9uIGNhbiBiZSBhc3NlcnRlZCkgYW5kCmBtb2QtY29kZS5ub2RlLnRlc3QudHNgIChhIHJlYWwgZm9sZGVyIG9uIGRpc2ssIGEgcmVhbCBkeW5hbWljIGltcG9ydCwgYSByZWFsCmBNb2RIb29rc2AgY29taW5nIGJhY2sgb3V0KS4gVGhlIHNlY29uZCBpcyB0aGUgb25lIHdvcnRoIGNvcHlpbmcgaWYgeW91IHdhbnQgYQpoYXJuZXNzIG9mIHlvdXIgb3duLgo="
  },
  {
    "id": "compatibility",
    "path": "MOD_COMPATIBILITY.md",
    "audience": "advanced",
    "title": "Compatibility",
    "note": "What an engine release can change and how a mod stays loadable.",
    "encoded": "IyBXaGF0IGFuIGVuZ2luZSByZWxlYXNlIG1heSBicmVhaywgYW5kIHdoYXQgaXQgbWF5IG5vdAoKVGhpcyBpcyB0aGUgcHJvbWlzZSBhIG1vZCBhdXRob3IgaXMgb3dlZDogKip3aGljaCBvZiBteSBtb2RzIHN0b3Agd29ya2luZyB3aGVuCnRoZSBnYW1lIHVwZGF0ZXMsIGFuZCB3aGF0IGRvIEkgaGF2ZSB0byBkbyBhYm91dCBpdD8qKgoKVGhlIHNob3J0IGFuc3dlciwgYW5kIHRoZSB0YXJnZXQgdGhlIHJlc3Qgb2YgdGhpcyBkb2N1bWVudCBleHBsYWluczoKCj4gQSBtb2QgdGhhdCBpcyBwdXJlIGRhdGEgc2hvdWxkIHN1cnZpdmUgZW5naW5lIHJlbGVhc2VzIHdpdGhvdXQgYmVpbmcKPiByZXB1Ymxpc2hlZC4gQSBtb2QgdGhhdCBzaGlwcyBjb2RlIHNob3VsZCBzdXJ2aXZlIHBhdGNoIGFuZCBtaW5vciByZWxlYXNlcywKPiBhbmQgZ2V0IGEgcmVsZWFzZSdzIHdhcm5pbmcgYmVmb3JlIGFuIEFCSSBjaGFuZ2Ugc3RyYW5kcyBpdC4KCldyaXR0ZW4gZG93biBvbiAyMDI2LTA4LTAyLCBhZnRlciBtZWFzdXJpbmcgaG93IHRoZSBmb3VyIGdhdGVzIGFjdHVhbGx5IGJlaGF2ZWQuClRocmVlIG9mIHRoZSBmb3VyIHdlcmUgc3RyaWN0ZXIgdGhhbiB0aGV5IG5lZWRlZCB0byBiZSwgYW5kIHRoZSBmb3VydGggZGlkIG5vdApleGlzdC4KCiMjIFRoZSBmb3VyIHRoaW5ncyB0aGF0IGNhbiBzdHJhbmQgYSBtb2QKCnwgIyB8IEdhdGUgfCBXaGF0IGl0IGp1ZGdlcyB8IE9uIGZhaWx1cmUgfAp8LS0tfC0tLXwtLS18LS0tfAp8IDEgfCBgZW5naW5lYCB8IGEgc2VtdmVyIHJhbmdlIG92ZXIgYEVOR0lORV9WRVJTSU9OYCB8ICoqd2FybnMqKiBmb3IgZGF0YSwgKipyZWZ1c2VzKiogY29kZSB8CnwgMiB8IGBtb2RBcGlgIHwgdGhlIHBsdWdpbiBBQkksIGFuIGludGVnZXIgfCByZWZ1c2VzIG91dHNpZGUgdGhlIGFjY2VwdGVkIHdpbmRvdyB8CnwgMyB8IGEgcGF0Y2ggdGFyZ2V0IHwgb25lIGBwYXRjaGVzYCAvIGBmaWVsZFBhdGNoZXNgIC8gYHJlbW92ZXNgIHJlZiB8ICoqc2tpcHMgdGhhdCBvcCoqLCBrZWVwcyB0aGUgbW9kIHwKfCA0IHwgYGN0eC5jb3JlYCB8IGFueSBvZiB0aGUgZW5naW5lJ3MgfjE5NTAgZXhwb3J0cyB8IG5vdGhpbmcuIFNlZSBiZWxvdy4gfAoKIyMjIDEuIGBlbmdpbmVgIGlzIGEgbGFiZWwgb24gZGF0YSBhbmQgYSBnYXRlIG9uIGNvZGUKCmBlbmdpbmVgIHNheXMgd2hpY2ggYnVpbGRzIHRoZSBhdXRob3IgKnRlc3RlZCouIFVudGlsIDIwMjYtMDgtMDIgdGhlIGhvc3QgcmVhZAp0aGF0IGFzIGEgZGVtYW5kIGFuZCByZWZ1c2VkIGFueSBwYWNrIG91dHNpZGUgaXQgLSBzbyBhIHBhY2sgb2YgSlNPTiB3ZW50IGRhcmsKYmVjYXVzZSBvZiBhIHN0cmluZyBpbiBpdHMgbWFuaWZlc3QsIHdoaWNoIGlzIHJhdGlmaWVkIGRlY2lzaW9uIDE4ICgidGhlIGVuZ2luZQpsYWJlbHMsIGl0IGRvZXMgbm90IGZvcmJpZCIpIGFwcGxpZWQgYmFja3dhcmRzLgoKTm93IHRoZSByYW5nZSBvbmx5ICoqYmxvY2tzKiogYSBwYWNrIHRoYXQgc2hpcHMgY29kZSwgYW5kIGBtb2RBcGlgIGlzIHRoZSBzaWduYWw6CnRoZSBtYW5pZmVzdCBhbHJlYWR5IHJlcXVpcmVzIGl0IG9mIGV4YWN0bHkgdGhlIHBhY2tzIHdpdGggYSBgcGx1Z2luLmpzYC4gQ29kZSBpcwp3aGF0IGdlbnVpbmVseSBicmVha3MgYWNyb3NzIGEgcmVsZWFzZSAtIGl0IGNhbGxzIGZ1bmN0aW9ucywgYW5kIGEgcmVuYW1lZApmdW5jdGlvbiBpcyBhIGNyYXNoLiBBIHRpbGUgcGFjayBpcyBkYXRhIHRvbywgb24gdGhlIHNhbWUgcmVhc29uaW5nOiBhIHN0YWxlCm1hcHBpbmcgbG9zZXMgaW5kaXZpZHVhbCB0aWxlcyB0byB0aGUgQVNDSUkgZmFsbGJhY2ssIHdoaWNoIHRoZSBwbGF5ZXIgY2FuIHNlZSwKYW5kIHRoYXQgYmVhdHMgYSB3aG9sZSB0aWxlc2V0IGdvaW5nIGRhcmsuCgoqKldoYXQgdG8gd3JpdGUuKiogQSBtaW5pbXVtLCBub3QgYSBjYXJldDoKCmBgYGpzb24KImVuZ2luZSI6ICI+PTAuMTMuMCIKYGBgCgpgXjAuMTMuMGAgb24gYSBgMC54YCB2ZXJzaW9uIG1lYW5zICowLjEzLnggb25seSosIHNvIGl0IGV4Y2x1ZGVzIDAuMTQuMCAtIHdoaWNoCmlzIGhvdyBhbiBhdXRob3IgYWNjaWRlbnRhbGx5IG9wdHMgaW50byBhIHdhcm5pbmcgb24gZXZlcnkgbWlub3IgcmVsZWFzZS4gQQp0d28tc2lkZWQgcmFuZ2UgaXMgZm9yIGEgbW9kIHRoYXQgZ2VudWluZWx5IGtub3dzIGl0IGJyZWFrcyBhYm92ZSBzb21lIHZlcnNpb24uCk9taXR0aW5nIHRoZSBmaWVsZCBlbnRpcmVseSBpcyBhIHJlYXNvbmFibGUgY2hvaWNlIGZvciBhIGRhdGEgcGFjaywgYW5kIHRoZQpjb3JlIGNvbnRlbnQgcGFjayBkb2VzIGV4YWN0bHkgdGhhdCBpbiBzcGlyaXQgd2l0aCBgIj49MC4xLjAiYC4KCiMjIyMgQSByYW5nZSB0aGlzIGJ1aWxkIGZhaWxzIGlzIG5vIGxvbmdlciB0aGUgZW5kIG9mIHRoZSByb2FkCgpVbnRpbCAyMDI2LTA4LTIxIGEgY29kZSBwYWNrIHdob3NlIG5ld2VzdCByZWxlYXNlIGRlY2xhcmVkIGEgcmFuZ2UgdGhpcyBidWlsZCBzaXRzCm91dHNpZGUgd2FzIHNpbXBseSByZWZ1c2VkLiBUaGUgcm93IHJlYWQgYHdpbGwgbm90IHJ1biBvbiB0aGlzIHZlcnNpb25gIGFuZCBzdG9wcGVkCnRoZXJlLCBldmVuIHdoZW4gdGhlIHNhbWUgcmVwb3NpdG9yeSBzdGlsbCBoZWxkIGEgcmVsZWFzZSB0aGF0IHJhbiBwZXJmZWN0bHkuCkluc3RhbGxpbmcgdGhhdCBvbGRlciByZWxlYXNlIHdhcyBwb3NzaWJsZSB0aGUgd2hvbGUgdGltZSBieSBwYXN0aW5nIGEKYGdpdGh1Yi5jb20vb3duZXIvcmVwby90cmVlLzx0YWc+YCBVUkwgaW50byAqKkFkZCBmcm9tIGEgcmVwb3NpdG9yeSBhZGRyZXNzKiosIHNvCndoYXQgd2FzIG1pc3Npbmcgd2FzIG5ldmVyIHRoZSBjYXBhYmlsaXR5LiBOb3RoaW5nIGxvb2tlZCwgYW5kIG5vdGhpbmcgc2FpZC4KCkRpc2NvdmVyeSBub3cgd2Fsa3MgYSByZXBvc2l0b3J5J3MgdGFncyBuZXdlc3QgZmlyc3QgYW5kIG9mZmVycyB0aGUgbmV3ZXN0IHJlbGVhc2UKdGhpcyBidWlsZCB3aWxsIGFjdHVhbGx5IHJ1bi4gV2hhdCB0aGF0IHdhbGsgZ3VhcmFudGVlczoKCi0gKipUaGUgc2FtZSBnYXRlIGRlY2lkZXMuKiogRWFjaCBjYW5kaWRhdGUgaXMganVkZ2VkIGJ5IHRoZSBsb2FkZXIncyBvd24gcnVsZSwgc28KICBhIHZlcnNpb24gYSBzY3JlZW4gb2ZmZXJzIGlzIGEgdmVyc2lvbiBsb2FkIHRpbWUgYWNjZXB0cy4gVGhlcmUgaXMgbm8gc2Vjb25kCiAgb3BpbmlvbiBhYm91dCB3aGF0ICJydW5uYWJsZSIgbWVhbnM6IHRoZSBpbnN0YWxsIHNjcmVlbiBhbmQgKlVwZGF0ZSBpbnN0YWxsZWQKICBtb2RzKiBzaGFyZSB0aGUgb25lIHdhbGssIGJlY2F1c2UgdHdvIHdhbGtzIHdvdWxkIGJlIHR3byBjaGFuY2VzIHRvIGRpc2FncmVlLgotICoqT25lIG1hbmlmZXN0IHJlYWQgaW4gdGhlIG9yZGluYXJ5IGNhc2UuKiogVGhlIGxvb3Agc3RvcHMgYXQgdGhlIGZpcnN0IGNhbmRpZGF0ZQogIGl0IGFjY2VwdHMsIGFuZCB0aGUgbmV3ZXN0IHJlbGVhc2UgaXMgbmVhcmx5IGFsd2F5cyB0aGF0IGNhbmRpZGF0ZSwgc28gYSBtb2QgdGhhdAogIGlzIGtlZXBpbmcgdXAgY29zdHMgZXhhY3RseSB3aGF0IGl0IGNvc3QgYmVmb3JlLiBNYW5pZmVzdHMgYXJlIHJlYWQgZnJvbQogIGByYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tYCwgd2hpY2ggaXMgdW5tZXRlcmVkLCByYXRoZXIgdGhhbiBmcm9tIHRoZSBBUEksIHdob3NlCiAgc2l4dHkgcmVxdWVzdHMgYW4gaG91ciBhIHNjcmVlbmZ1bCBvZiBtb2Qgcm93cyB3b3VsZCBzcGVuZCBvbiBub3RoaW5nIGJ1dAogIHdhbGtpbmcuCi0gKipUaGUgd2FsayBpcyBib3VuZGVkIGF0IGVpZ2h0IHZlcnNpb25zKiogKGBNQVhfVkVSU0lPTlNfVFJJRURgKS4gQSBtb2Qgd2hvc2UKICBsYXN0IGVpZ2h0IHJlbGVhc2VzIGFsbCB3YW50IGEgbmV3ZXIgZ2FtZSBpcyB0ZWxsaW5nIHRoZSBwbGF5ZXIgdG8gdXBkYXRlIHRoZQogIGdhbWUsIGFuZCB0aGF0IGlzIHdoYXQgdGhlIHJlZnVzYWwgdGhlbiBzYXlzLCBhbG9uZyB3aXRoIGhvdyBtYW55IHJlbGVhc2VzIHdlcmUKICB0cmllZC4KLSAqKkEgcGlubmVkIHRhZyBpcyBuZXZlciB3YWxrZWQgcGFzdC4qKiBBIHBsYXllciB3aG8gbmFtZWQgYSB2ZXJzaW9uIGlzIG93ZWQgdGhhdAogIHZlcnNpb24sIHNvIGEgcGluIHRoYXQgd2lsbCBub3QgcnVuIGlzIHJlZnVzZWQgYXMgYSBwaW4gcmF0aGVyIHRoYW4gcXVpZXRseQogIGJlY29taW5nIGEgZGlmZmVyZW50IGluc3RhbGwgdGhhbiB0aGUgb25lIHRoYXQgd2FzIGFza2VkIGZvci4KLSAqKkEgZGF0YSBwYWNrIG91dCBvZiByYW5nZSBpcyBuZXZlciB3YWxrZWQgcGFzdCBlaXRoZXIsKiogYmVjYXVzZSBnYXRlIDEgbGV0cyBpdAogIGxvYWQuIEl0cyBuZXdlc3QgcmVsZWFzZSBpcyBzdGlsbCB0aGUgb25lIG9mZmVyZWQsIHN0aWxsIGNhcnJ5aW5nIHRoZSBsaW5lIGFib3V0CiAgdGhlIHJhbmdlLgotICoqVGhlIHJlbGVhc2UgdGhhdCB3YXMgcGFzc2VkIG92ZXIgaXMgbmFtZWQuKiogQSBwbGF5ZXIgb2ZmZXJlZCAwLjE0LjQgd2hpbGUgdGhlCiAgbW9kJ3MgZnJvbnQgcGFnZSBzaG93cyAwLjE1LjAgd291bGQgb3RoZXJ3aXNlIGNvbmNsdWRlIHRoZSBnYW1lIGlzIGJyb2tlbiBvciB0aGUKICBsaXN0aW5nIGlzIHN0YWxlLCB3aGVuIHRoZSByZWFsIGFuc3dlciBpcyB0aGF0IDAuMTUuMCB3YW50cyBhIG5ld2VyIGdhbWUuIFRoZQogIHJvdywgdGhlIGRldGFpbCBwYW5lIGFuZCB0aGUgcmVmdXNhbCBzY3JlZW4gYWxsIHNheSB3aGljaCBuZXdlciByZWxlYXNlIHdhcwogIHN0ZXBwZWQgcGFzdCBhbmQgd2h5LgotICoqIlVwZGF0ZSB0aGUgZ2FtZSIgaXMgc2FpZCBvbmx5IHdoZW4gYSBuZXdlciBnYW1lIGlzIHdoYXQgd291bGQgaGVscC4qKiBHYXRlIDEKICBkZWxpYmVyYXRlbHkgcmVmdXNlcyB0byBzYXkgd2hpY2ggc2lkZSBpcyBiZWhpbmQsIGJlY2F1c2UgYD49MC4yNC4wYCB3YW50cyBhCiAgbmV3ZXIgZ2FtZSBhbmQgYDwwLjUuMGAgd2FudHMgYW4gb2xkZXIgb25lLCBhbmQgYSBjb25maWRlbnQgaW5zdHJ1Y3Rpb24gd291bGQgYmUKICB3cm9uZyBoYWxmIHRoZSB0aW1lIG9uIHRoZSBvbmUgbGluZSBhIHBsYXllciBhY3RzIG9uLiBBIHNjcmVlbiB0aGF0IGhhcyBkZWNpZGVkCiAgdG8gb2ZmZXIgYW4gb2xkZXIgcmVsZWFzZSBzdGlsbCBoYXMgdG8gYW5zd2VyIHRoZSBxdWVzdGlvbiwgc28gaXQgaXMgYW5zd2VyZWQKICBzZXBhcmF0ZWx5IGFuZCBieSBwcm9iaW5nOiBgbmV3ZXJHYW1lQ291bGRSdW5gIHRyaWVzIHRoZSBuZXh0IG5pbmUgcGF0Y2hlcywgdGhlCiAgbmV4dCBuaW5lIG1pbm9ycyBhbmQgdGhlIG5leHQgbmluZSBtYWpvcnMgYWJvdmUgdGhlIHJ1bm5pbmcgdmVyc2lvbiwgcGx1cyBvbmUKICBmYXItZnV0dXJlIHZlcnNpb24gZm9yIGFuIG9wZW4gdXBwZXIgYm91bmQuIFdoZXJlIG5vbmUgb2YgdGhvc2Ugc2F0aXNmaWVzIHRoZQogIHJhbmdlLCBib3RoIHZlcnNpb25zIGFyZSBuYW1lZCBhbmQgbm90aGluZyBpcyBhZHZpc2VkLCB3aGljaCBpcyB0aGUgc2FtZQogIHJlc3RyYWludCB0aGUgdmVyZGljdCBpdHNlbGYgc2hvd3MuCi0gKipBbiB1cGRhdGUgaXMgbmV2ZXIgb2ZmZXJlZCB0aGF0IHRoZSBsb2FkZXIgd291bGQgcmVmdXNlLioqICpVcGRhdGUgaW5zdGFsbGVkCiAgbW9kcyogY291bnRzIG9ubHkgcmVsZWFzZXMgdGhhdCBydW4gaGVyZSwgc28gYSBtb2QgYWxyZWFkeSBzaXR0aW5nIG9uIHRoZSBuZXdlc3QKICByZWxlYXNlIHRoaXMgYnVpbGQgY2FuIHJ1biByZWFkcyBhcyBleGFjdGx5IHRoYXQgcmF0aGVyIHRoYW4gYXMgb3V0IG9mIGRhdGUsIGFuZAogIHRoZSBudW1iZXIgb2YgbW9kcyBob2xkaW5nIGEgcmVsZWFzZSBiYWNrIGZvciBhIG5ld2VyIGdhbWUgaXMgc2hvd24gYmVzaWRlIGl0LgotICoqQSBtYW5pZmVzdCB0aGF0IGNvdWxkIG5vdCBiZSByZWFkIGtlZXBzIHRoZSBvcHRpbWlzdGljIGFuc3dlci4qKiBXaXRoaG9sZGluZyBhbgogIHVwZGF0ZSBvdmVyIG9uZSBmYWlsZWQgcmVxdWVzdCB3b3VsZCBiZSBhIGNsYWltIGFib3V0IGEgbW9kIG1hZGUgd2l0aG91dCBhc2tpbmcsCiAgd2hpY2ggaXMgdGhlIGZhaWx1cmUgdGhlIHVwZGF0ZSBzY3JlZW4gd2FzIHJlYnVpbHQgdG8gYXZvaWQuIFRoZSBpbnN0YWxsIHBhdGgKICBydW5zIHRoZSBzYW1lIHdhbGsgd2l0aCBhIGxpdmUgY29ubmVjdGlvbiBhbmQgc3RlcHMgYmFjayB0aGVyZS4KCioqV2hhdCB0aGlzIGFza3Mgb2YgYW4gYXV0aG9yLioqIEEgcmFuZ2Ugc3RyaWN0ZXIgdGhhbiB0aGUgbW9kIG5lZWRzIG5vdyBjb3N0cyBhCnBsYXllciB0aGUgbW9kJ3MgbmV3ZXN0IHJlbGVhc2UgcmF0aGVyIHRoYW4gdGhlIG1vZCBpdHNlbGYuIFRoYXQgaXMgYSBzbWFsbGVyIGhhcm0KYW5kIHN0aWxsIGEgcmVhbCBvbmUsIHNvIGEgdHdvLXNpZGVkIHJhbmdlIHNob3VsZCBiZSBvbmUgdGhhdCB3YXMgbWVhbnQuIEl0IGFsc28KbWVhbnMgZml4aW5nIGEgcmFuZ2UgaW4gYSBuZXcgcmVsZWFzZSByZWFjaGVzIHBsYXllcnMgaW1tZWRpYXRlbHk6IHRoZSB3YWxrIGZpbmRzCnRoZSBmaXhlZCByZWxlYXNlIHdpdGhvdXQgdGhlIGdhbWUgaGF2aW5nIHRvIHVwZGF0ZSBmaXJzdC4KCiMjIyAyLiBgbW9kQXBpYCBhY2NlcHRzIGEgd2luZG93CgpgTU9EX0FQSV9WRVJTSU9OYCBpcyB3aGF0IHRoaXMgaG9zdCBpbXBsZW1lbnRzOyBgTU9EX0FQSV9NSU5gIGlzIHRoZSBvbGRlc3QgaXQKc3RpbGwgYWNjZXB0cy4gRXZlcnl0aGluZyBpbiBiZXR3ZWVuIGxvYWRzLCBhbmQgYW55dGhpbmcgYmVsb3cgdGhlIGN1cnJlbnQKdmVyc2lvbiBpcyByZXBvcnRlZCB0byBpdHMgYXV0aG9yIGFzIHJ1bm5pbmcgb24gYSBjb21wYXRpYmlsaXR5IHBhdGguCgpVbnRpbCAyMDI2LTA4LTAyIHRoZSBjaGVjayB3YXMgYGRlY2xhcmVkICE9PSBNT0RfQVBJX1ZFUlNJT05gLCBzbyB0aGUgZGF5IHRoZQpudW1iZXIgbW92ZWQsICoqZXZlcnkgbW9kIGluIGV4aXN0ZW5jZSBzdG9wcGVkIGxvYWRpbmcgYXQgb25jZSoqIC0gYmVmb3JlIGFueQphdXRob3IgY291bGQgcmVhY3QsIGZvciBhIGNoYW5nZSBtb3N0IG9mIHRoZW0gd2VyZSBub3QgYWZmZWN0ZWQgYnkuCgoqKkEgYnVtcCBub3cgdGFrZXMgdHdvIHJlbGVhc2VzOioqCgoxLiBTaGlwIHRoZSBuZXcgYmVoYXZpb3VyLiBMZWF2ZSBgTU9EX0FQSV9NSU5gIHdoZXJlIGl0IGlzLiBLZWVwIGhvbm91cmluZyB0aGUKICAgb2xkIGNvbnRyYWN0IGZvciBwbHVnaW5zIHRoYXQgZGVjbGFyZWQgdGhlIG9sZCBudW1iZXIgLSBgTG9hZGVkTW9kUGx1Z2luLmFwaWAKICAgY2FycmllcyB3aGF0IGVhY2ggb25lIGRlY2xhcmVkLCB3aGljaCBpcyB3aGF0IG1ha2VzIHRoYXQgcG9zc2libGUuIEF1dGhvcnMKICAgc3RhcnQgc2VlaW5nIHRoZSBkZXByZWNhdGlvbiBsaW5lLgoyLiBSYWlzZSBgTU9EX0FQSV9NSU5gLiBEZWxldGUgdGhlIG9sZCBwYXRoLgoKSWYgYSBjaGFuZ2UgZ2VudWluZWx5IGNhbm5vdCBiZSBjb25kaXRpb25lZCBvbiB0aGUgZGVjbGFyZWQgdmVyc2lvbiwgYm90aCBtb3ZlCmluIG9uZSBzdGVwIC0gYW5kIHRoYXQgaXMgYSBkZWNpc2lvbiB0byB0YWtlIGRlbGliZXJhdGVseSwgd2hpY2ggaXMgdGhlIHJlYXNvbgp0aGVyZSBhcmUgdHdvIGNvbnN0YW50cyBhbmQgYSB0ZXN0IHRoYXQgZmFpbHMgd2hlbiB0aGV5IHN0b3AgbWFraW5nIHNlbnNlLgoKIyMjIDMuIEEgbWlzc2luZyBwYXRjaCB0YXJnZXQgY29zdHMgdGhlIHBhdGNoLCBub3QgdGhlIG1vZAoKQSBgZmllbGRQYXRjaGAgYXQgYSByZWNvcmQgdGhhdCBubyBsb25nZXIgZXhpc3RzIHVzZWQgdG8gdGhyb3csIGFuZCB0aGUgaG9zdAphbnN3ZXJzIGEgdGhyb3cgYnkgZHJvcHBpbmcgdGhlIHdob2xlIHBhY2suIFNvIGEgbW9kIHBhdGNoaW5nIGZvcnR5IG1vbnN0ZXJzCmxvc3QgYWxsIGZvcnR5IC0gcGx1cyBpdHMgY29kZSwgaXRzIHJ1bGVzIGFuZCBpdHMgdGlsZXMgLSBiZWNhdXNlIG9uZSBvZiB0aGUKZm9ydHkgaGFkIGJlZW4gcmVuYW1lZC4KCkl0IGlzIG5vdyBvbmUgcmVwb3J0ZWQgbGluZSBvbiB0aGF0IG1vZCdzIHJvdywgYW5kIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgcGFjawpzdGlsbCBhcHBsaWVzLiBUaGUgbGluZSBzYXlzIHRoZSB0YXJnZXQgbWF5IGhhdmUgYmVlbiByZW5hbWVkLCBiZWNhdXNlIHRoYXQgaXMKdGhlIGxpa2VsaWVzdCBjYXVzZSBhbmQgYW4gYXV0aG9yIHdobyBrbm93cyB0aGV5IGdvdCB0aGUgcmVmIHJpZ2h0IHdpbGwKb3RoZXJ3aXNlIGdvIGxvb2tpbmcgaW4gdGhlIHdyb25nIHBsYWNlLgoKVGhpcyBpcyB0aGUgc2FtZSBiZWhhdmlvdXIgdGhlICpvdGhlciogaGFsZiBvZiB0aGUgY29tcG9zZXIgaGFzIGhhZCBhbGwgYWxvbmc6CjIwIG9mIGNvcmUncyA0NCByZWNvcmQgZmlsZXMgdGFrZSBhICJwYXNzdGhyb3VnaCIgbWVyZ2UgcGF0aCB0aGF0IHJlcG9ydGVkIGFuZApjYXJyaWVkIG9uLCBhbmQgMjQgdGFrZSBhICJjb21wb3NhYmxlIiBvbmUgdGhhdCB0aHJldy4gTm9ib2R5IGNob3NlIHRoYXQgc3BsaXQ7Cml0IGZlbGwgb3V0IG9mIHRoZSBzaGFwZSBvZiBjb3JlJ3Mgb3duIHJlY29yZHMuCgoqKkEgcGF0Y2ggdGhhdCBhcHBsaWVzIGNsZWFubHkgY2FuIHN0aWxsIG5hbWUgc29tZXRoaW5nIHRoYXQgaXMgbm90IHRoZXJlLCoqIGFuZAp1bnRpbCAyMDI2LTA4LTIwIHRoYXQgd2FzIGEgKndvcnNlKiBvdXRjb21lIHRoYW4gYSBtaXNzaW5nIHRhcmdldDogdGhlIGNvbXBvc2VyCndhcyBzYXRpc2ZpZWQsIGFuZCB0aGUgYmluZGVyIHRocmV3LiBBIHN0b3JlJ3MgYG5vcm1hbGAgc3RvY2sgdGFibGUgaXMgdGhlIGNhc2UKdGhhdCBtYWRlIGl0IG9yZGluYXJ5OiBgYXBwZW5kYCBleGlzdHMgc28gbW9kIEEgY2FuIHN0b2NrIGFuIGl0ZW0gbW9kIEIgZGVmaW5lcywKdHV0b3JpYWwgMiB0ZWFjaGVzIGV4YWN0bHkgdGhhdCBwYXRjaCwgYW5kIGRpc2FibGluZyBtb2QgQiBsZWZ0IGFuIGFwcGVuZGVkIGxpbmUKbmFtaW5nIG5vdGhpbmcuIGBiaW5kU3RvcmVgIHRocmV3IGBzdG9yZTogdW5rbm93biBzdmFsYCBmcm9tIGluc2lkZSBgYmluZENvcmVgLAp3aGljaCB0aGUgaG9zdCBydW5zIGF0IG1vZHVsZSB0b3AgbGV2ZWwsIHNvIG9uZSBsaW5lIG9mIG9uZSBzaG9wJ3Mgc3RvY2sgdGFibGUKcHJvZHVjZWQgdGhlIGNyYXNoIHNjcmVlbiBhbmQgbm8gZ2FtZS4KClRoZSBydWxlIGlzIG5vdyBnYXRlIDMncyBydWxlIG9uZSBsYXllciBkb3duOiB0aGUgbGluZSBpcyBkcm9wcGVkLCB0aGUgbW9kIGlzCnRvbGQgb24gaXRzIG93biByb3csIGFuZCB0aGUgcmVzdCBvZiB0aGUgc3RvcmUsIGFuZCBldmVyeSBvdGhlciBzdG9yZSwgaXMKdW50b3VjaGVkLiAqKkNvcmUncyBvd24gZGF0YSBzdGlsbCB0aHJvd3MsKiogYW5kIHJlY29yZCBwcm92ZW5hbmNlIGlzIHdoYXQKc2VwYXJhdGVzIHRoZW06IGFuIHVucmVzb2x2YWJsZSBlbnRyeSBpbiBhIHN0b3JlIG5vIHBhY2sgaGFzIHRvdWNoZWQgaXMgY29yZSdzCm1pc3Rha2UgYW5kIGZhaWxzIGxvdWRseSwgd2hpY2ggaXMgZXZlcnkgc3RvcmUgaW4gYSBtb2RsZXNzIGdhbWUuCgpUaGlzIG5vdyBjb3ZlcnMgZXZlcnkgZmllbGQgb2YgYSBzdG9yZSByZWNvcmQgYSBwYXRjaCBjYW4gcmVhY2guIGBub3JtYWxgLApgYWx3YXlzYCBhbmQgYGJ1eWAgZWFjaCBsb3NlIHRoZSBvbmUgZW50cnkgdGhhdCByZXNvbHZlZCB0byBub3RoaW5nLiBUaGUKYHN0b3JlOmAgZW50cmFuY2UgZmVhdHVyZSBpcyBhIHNjYWxhciwgc28gdGhlcmUgaXMgbm8gZW50cnkgdG8gZHJvcCBhbmQgbm90aGluZwpsZWZ0IG9mIHRoZSBzaG9wOiB0aGUgcmVjb3JkIHN1cnZpdmVzIHdpdGggYW4gZW50cmFuY2Ugbm90aGluZyBtYXRjaGVzLCB0aGUgc2hvcApjYW5ub3QgYmUgZW50ZXJlZCwgYW5kIHRoZSBtb2QgaXMgdG9sZC4gSXQgaXMgbm90IHJlbW92ZWQgZnJvbSB0aGUgc3RvcmUgbGlzdCwKYmVjYXVzZSB0aGF0IGxpc3QgaXMgY29uc3VtZWQgcG9zaXRpb25hbGx5OiBkcm9wcGluZyBhIHJlY29yZCB3b3VsZCByZW51bWJlcgpldmVyeSBzdG9yZSBhZnRlciBpdCBhbmQgbW92ZSBhIHNhdmVkIGdhbWUncyBzdG9jayBiZXR3ZWVuIHNob3BzLgoKVGhlIG93bmVyIGxpc3QgcmVzb2x2ZXMgbm8gbmFtZXMgYXQgYWxsLCBzbyB0aGVyZSBpcyBubyBwZXItZW50cnkgbWlzcyB0bwpyZWZ1c2UgdGhlIHdheSBhIHN0b2NrIGxpbmUgaGFzIC0gYnV0IHRoZSBmaWVsZCBjYW4gc3RpbGwgZ28gbWlzc2luZwoqZW50aXJlbHkqLCB3aGljaCBpcyBhIGRpZmZlcmVudCBmYWlsdXJlIHRoYW4gdGhlIHdyb25nLXNoYXBlIG9uZSB0aGUgY29tcG9zZXIKYW5zd2VycyBvbmUgbGV2ZWwgdXAgKGJlbG93KS4gQSBgcmVwbGFjZXNgIGJvZHkgb24gYSByZWNvcmQgYSBtb2Qgb3ducyBjYW4KbGVnaXRpbWF0ZWx5IGRyb3AgYG93bmVyOmAgYXMgcGFydCBvZiBhIHRvdGFsIGNvbnZlcnNpb24sIGFuZCB0aGUgY29tcG9zZXIncwpvd24gc2hhcGUgZ3VhcmQgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IHJlc3RvcmUgYSBmaWVsZCB0aGF0IGlzIHNpbXBseSBhYnNlbnQKKHNlZSAiQSBwYXRjaCBjYW5ub3QgbWFrZSBhIGZpZWxkIHVucmVhZGFibGUiIGJlbG93KSAtIHNvIGBvd25lcjogdW5kZWZpbmVkYAp1c2VkIHRvIHJlYWNoIGByZWMub3duZXIubWFwYCBhcyBhIGJhcmUgYFR5cGVFcnJvcmAgbmFtaW5nIG5vIHBhY2suIFRoZSBzdG9yZQpiaW5kZXIgbm93IGd1YXJkcyB0aGUgZmllbGQgaXRzZWxmOiBhIG1pc3Npbmcgb3IgbWFsZm9ybWVkIG93bmVyIGxpc3QgaXMKZHJvcHBlZCB0byBlbXB0eSBhbmQgcmVwb3J0ZWQgYWdhaW5zdCB3aGljaGV2ZXIgcGFjayBpcyBhbnN3ZXJhYmxlLCB0aGUgc2FtZQp3YXkgZXZlcnkgb3RoZXIgZmllbGQgb24gdGhlIHJlY29yZCBhbHJlYWR5IGlzICgjOCkuCgoqKkEgcGF0Y2ggY2Fubm90IG1ha2UgYSBmaWVsZCB1bnJlYWRhYmxlLioqIFRoZSBjb21wb3NlciBhbHJlYWR5IGNoZWNrZWQgc2hhcGUgb24KdGhlIGxvYWQgcGF0aCB3aXRoIGBmaWVsZC90eXBlYCBpbiB0aGUgcmVjb3JkIGNoZWNrLCBidXQgdGhhdCBjaGVjayByZXBvcnRzIGFuZApuZXZlciByZWZ1c2VzLCBkZWxpYmVyYXRlbHksIGJlY2F1c2UgdGhlIGJsdWVwcmludCBpdCByZWFkcyBpcyBhICptZWFzdXJlbWVudCogb2YKY29yZSdzIHJlY29yZHMgYW5kIGFuIHVubGlzdGVkIHZhbHVlIGlzIGxlZ2FsIChhIG1vZCBpbnZlbnRpbmcgYSBuZXcgdHZhbCBpcwpkb2luZyBzb21ldGhpbmcgdGhlIG1vZCBzeXN0ZW0gZXhpc3RzIHRvIGFsbG93KS4gVGhhdCBpcyByaWdodCBmb3IgYSBzdGF0aXN0aWMKYW5kIHdyb25nIGZvciBjb250YWluZXItbmVzczogZXZlcnkgYmluZGVyIHJlYWRzIGEgbGlzdCBmaWVsZCBieSBpdGVyYXRpbmcgaXQsIHNvCmEgbGlzdCBmaWVsZCBob2xkaW5nIGEgc3RyaW5nLCBhIG51bWJlciBvciBgbnVsbGAgaXMgYSBgVHlwZUVycm9yYCBpbnNpZGUKYGJpbmRDb3JlYCBpbnNpZGUgYHN0YXJ0R2FtZWA6IHRoZSBjcmFzaCBzY3JlZW4sIG92ZXIgb25lIGZpZWxkLiBUaGUgY29tcG9zZXIgbm93CioqcmVmdXNlcyBleGFjdGx5IHRoYXQgY2xhc3MqKjogdGhlIGZpZWxkIGlzIHB1dCBiYWNrIHRvIHdoYXQgdGhlIHJlY29yZCBoYWQKYmVmb3JlLCB0aGUgcGFjayBpcyB0b2xkIG9uIGl0cyBvd24gcm93LCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHBhdGNoIGxhbmRzLgoKVHdvIHRoaW5ncyBpdCBkZWxpYmVyYXRlbHkgZG9lcyBub3QgZG8sIGJvdGggbG9hZC1iZWFyaW5nOgoKLSAqKkEgc2NhbGFyIHdyaXR0ZW4gYXMgdGhlIHdyb25nIHNjYWxhciBzdGF5cyBhIGZpbmRpbmcuKiogYHdlaWdodGAgYXMgYCI0MCJgIGlzCiAgcmVhZGFibGUsIHNvbWUgYmluZGVycyBjb2VyY2UgaXQsIGFuZCB0aGUgbWVhc3VyZW1lbnQgY2Fubm90IHByb3ZlIG90aGVyd2lzZS4KLSAqKkEgZmllbGQgdGhlIHBhdGNoIFJFTU9WRVMgaXMgbm90IHB1dCBiYWNrLioqIERyb3BwaW5nIGEgZmllbGQgaXMgaG93IGEgdG90YWwKICBjb252ZXJzaW9uIHdvcmtzOiBgcmVwbGFjZXNgIHN3YXBzIHRoZSB3aG9sZSByZWNvcmQsIGFuZCBhIG1vbnN0ZXIgcmV3cml0dGVuCiAgYXMgYHtuYW1lLCBocH1gIGxlZ2l0aW1hdGVseSBoYXMgbm8gYGZsYWdzYC4gUmVzdG9yaW5nIGFuIGFic2VudCBmaWVsZCB3b3VsZAogIHNpbGVudGx5IHVuZG8gYSBzdXBwb3J0ZWQgZmVhdHVyZS4gQW4gYWJzZW50IHJlcXVpcmVkIGZpZWxkIGlzIHJlcG9ydGVkCiAgKGBmaWVsZC9yZXF1aXJlZGApLCBhbmQgcmVmdXNpbmcgYSByZWNvcmQgdGhlICptb2QgaXRzZWxmIG93bnMqIGJlbG9uZ3MgaW4KICB0aGUgYmluZGVycyAtIHRoZSBzdG9yZSBiaW5kZXIncyBgb3duZXI6YCBndWFyZCBhYm92ZSBpcyB0aGF0IGNhc2UsIGFwcGxpZWQKICB3aGVyZSBpdCBpcyByZWFjaGFibGUgdG9kYXkuCgoqKlRoaXMgaXMgbm90IGEgc3RvcmUtb25seSBydWxlLioqIEFuIGVnbydzIGBpdGVtOmAgbGlzdCBuYW1lcyBzcGVjaWZpYyBiYXNlCmtpbmRzIGFuZCB0YWtlcyB0aGUgc2FtZSBgYXBwZW5kYCwgc28gaXQgaGFkIHRoZSBzYW1lIGRlZmVjdCBhbmQgbm93IGdldHMgdGhlCnNhbWUgYW5zd2VyOiB0aGUgbGluZSBpcyBkcm9wcGVkLCB0aGUgZWdvIGtlZXBzIGl0cyBvdGhlciBjYW5kaWRhdGVzLCBhbmQgdGhlCm1vZCBpcyB0b2xkLiBUaGUgY29yZS12ZXJzdXMtbW9kIGRlY2lzaW9uIGxpdmVzIGluIGBwYWNrYWdlcy9jb3JlL3NyYy9tb2QvCnJlZnVzYWwudHNgLCBvbmUgYGZpZWxkT3duZXJgLCBzaGFyZWQsIHByZWNpc2VseSBzbyB0aGF0IHR3byBiaW5kZXJzIGNhbm5vdApyZWFjaCBkaWZmZXJlbnQgdmVyZGljdHMgYWJvdXQgdGhlIHNhbWUgcHJvdmVuYW5jZS4gQSBiaW5kZXIgdGhhdCByZXNvbHZlcyBuYW1lcwpmcm9tIGEgbGlzdCBhIG1vZCBjYW4gYXBwZW5kIHRvIHNob3VsZCBiZSByZWFkaW5nIGZyb20gdGhlcmUgcmF0aGVyIHRoYW4KaW52ZW50aW5nIGl0cyBvd24gcnVsZS4KCkEgc3lzdGVtYXRpYyBwYXNzIG92ZXIgZXZlcnkgYmluZGVyICgjOCkgZm91bmQgc2l4IG1vcmUgaW5zdGFuY2VzIG9mIHRoZSBzYW1lCnNoYXBlIGFuZCBjbG9zZWQgdGhlbSB0aGUgc2FtZSB3YXk6IGFuIGFydGlmYWN0J3MgYGZsYWdzOmAgYW5kIGB2YWx1ZXM6YAp0b2tlbnMsIGEgY3Vyc2UncyBgdHlwZTpgIGVudHJpZXMsIGEgbW9uc3RlcidzIGBiYXNlOmAgKHRoZSB3aG9sZSByYWNlLCBzaXplZApsaWtlIHRoZSBhcnRpZmFjdCdzIGBiYXNlLW9iamVjdDpgKSwgYGZyaWVuZHMtYmFzZTpgLCBgZnJpZW5kczpgIGFuZCBgc2hhcGU6YAoob25lIGVudHJ5IGVhY2gpLCBhbmQgYSB0ZXJyYWluIGZlYXR1cmUncyBgbWltaWM6YC4gVHdvIGZpZWxkcyB3ZXJlIGF1ZGl0ZWQgYW5kCmZvdW5kIG5vdCB0byBuZWVkIGl0OiBhbiBhcnRpZmFjdCdzIGBhY3Q6YCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgdXBzdHJlYW0ncyBvd24KYGZpbmRhY3RgIGRvZXMgLSBzaWxlbnRseSwgdG8gbm90aGluZywgb24gY29yZSdzIG93biBkYXRhIHRvbyAtIHNvIHJlZnVzaW5nIGEKbW9kJ3MgdmVyc2lvbiB3b3VsZCBtYWtlIHRoZSBpZGVudGljYWwgbWlzdGFrZSBsb3VkZXIgdGhhbiBjb3JlJ3M7IGFuZCB0aGUgdHJhcApiaW5kZXIgcmVzb2x2ZXMgbm8gbmFtZSBmcm9tIGFuIGFwcGVuZGFibGUgbGlzdCBhdCBhbGwsIG9ubHkgZml4ZWQgY29tcGlsZWQKdGFibGVzLiBgY29tcG9zZVBhY2tzYCdzIGBmaWVsZFBhdGNoZXNgIGxvb3AgYWxzbyByZWFjaGVkIGBhcHBseUZpZWxkUGF0Y2hgCndpdGhvdXQgZ29pbmcgdGhyb3VnaCBgcmVmdXNlKClgLCBzbyBhIG1hbGZvcm1lZCBvcCAoYW4gYGFwcGVuZGAgd2l0aCBgdmFsdWVgCmluc3RlYWQgb2YgYHZhbHVlc2AsIHNheSkgdG9vayBkb3duIHRoZSB3aG9sZSBwYWNrLCBvciBldmVyeSBpbnN0YWxsZWQgbW9kIHdoZW4KdGhlIHJhdyBlcnJvciBuYW1lZCBub25lIG9mIHRoZW07IGl0IGlzIG5vdyByZWZ1c2VkIHRoZSBzYW1lIHdheSBhIG1pc3NpbmcKcGF0Y2ggdGFyZ2V0IGFscmVhZHkgd2FzLgoKIyMjIDQuIFRoZSBoYW5kZWQtaW4gbmFtZXNwYWNlcyBhcmUgbm90IGNvdmVyZWQgYnkgYW55IG9mIHRoZSBhYm92ZSwgYW5kIHRoYXQgaXMgdGhlIGhvbmVzdCBnYXAKCmBNb2RQbHVnaW5Db250ZXh0LmNvcmVgIGlzIHRoZSAqKmxpdmUgY29yZSBtb2R1bGUgbmFtZXNwYWNlKiogLSB0aGUgd2hvbGUgZW5naW5lLAphcm91bmQgMSw5NTAgcnVudGltZSBleHBvcnRzLCBkZWxpYmVyYXRlbHkgbm90IGEgY3VyYXRlZCBzbGljZSAoZGVjaXNpb24gMTgsIGFuZApiZWNhdXNlIGEgY3VyYXRlZCBsaXN0IGlzIHRoZSB0aGluZyB0aGF0IGRyaWZ0cykuIFRoZSBjb3VudCBpcyBub3QgbWFpbnRhaW5lZCBieQpoYW5kOiBgcGFja2FnZXMvY29yZS9tb2QtYXBpLXN1cmZhY2UuanNvbmAgaXMgdGhlIHJlY29yZGVkIHN1cmZhY2UgYW5kCmBtb2QtY29yZS1zdXJmYWNlLnRlc3QudHNgIGZhaWxzIGluIEJPVEggZGlyZWN0aW9ucyBhZ2FpbnN0IGl0LCBzbyBhIHJlbW92YWwgYW5kCmFuIGFkZGl0aW9uIGFyZSBlYWNoIGEgdmlzaWJsZSBkaWZmIHJhdGhlciB0aGFuIGEgbnVtYmVyIHNvbWVib2R5IGhhcyB0bwpyZW1lbWJlciB0byBjaGFuZ2UgaGVyZS4KCmBNT0RfQVBJX1ZFUlNJT05gIGRvZXMgbm90IHZlcnNpb24gaXQuIEl0IHZlcnNpb25zIHRoZSAqc2hhcGUgb2YgdGhlIHBsdWdpbgpjb250cmFjdCo6IHRoZSBtZW1iZXJzIG9mIGBNb2RQbHVnaW5gLCB3aGF0IHRoZSBob3N0IHBhc3Nlcywgd2hlbiBpdCBjYWxscyB0aGVtLgpBIGNvcmUgZnVuY3Rpb24gY2FuIGJlIHJlbmFtZWQgd2l0aG91dCB0b3VjaGluZyBhbnkgb2YgdGhhdCwgc28gdGhlIG9uZSBudW1iZXIgYQptb2QgYXV0aG9yIGNoZWNrcyBzYXlzIG5vdGhpbmcgYWJvdXQgdGhlIHN1cmZhY2UgdGhleSBzcGVuZCBhbGwgdGhlaXIgdGltZQpjYWxsaW5nLgoKV2hhdCBleGlzdHMgbm93IGlzIG5vdCBhIGZlbmNlIGJ1dCBhICoqcmF0Y2hldCoqOgpgcGFja2FnZXMvY29yZS9tb2QtYXBpLXN1cmZhY2UuanNvbmAgcmVjb3JkcyBldmVyeSBydW50aW1lIGV4cG9ydCwgYW5kCmBtb2QtY29yZS1zdXJmYWNlLnRlc3QudHNgIGZhaWxzIHdoZW4gdGhlIHNldCBjaGFuZ2VzIGluIGVpdGhlciBkaXJlY3Rpb24uCgotIEEgKipyZW1vdmFsIG9yIHJlbmFtZSoqIGZhaWxzIENJIHdpdGggdGhlIG5hbWVzLCBhbmQgdGhlIGZpeCBpcyBlaXRoZXIgdG8ga2VlcAogIHRoZSBvbGQgbmFtZSBhcyBhbiBhbGlhcyBvciB0byByZWNvcmQgdGhlIGJyZWFrIGhlcmUgYW5kIHRha2UgaXQga25vd2luZ2x5LgotIEFuICoqYWRkaXRpb24qKiBhbHNvIGZhaWxzLCB3aXRoIGEgb25lLWxpbmUgZml4CiAgKGBub2RlIHRvb2xzL2FwaS1zdXJmYWNlLm1qcyAtLXVwZGF0ZWApLiBUaGF0IGlzIG5vdCBwZWRhbnRyeTogYSBiYXNlbGluZSB0aGF0CiAgdG9sZXJhdGVkIGFkZGl0aW9ucyB3b3VsZCBnbyBzdGFsZSwgYW4gZXhwb3J0IGFkZGVkIGluIG9uZSByZWxlYXNlIGFuZCByZW1vdmVkCiAgaW4gdGhlIG5leHQgd291bGQgbmV2ZXIgaGF2ZSBiZWVuIHJlY29yZGVkLCBhbmQgdGhlIHJlbW92YWwgY2hlY2sgd291bGQgYmUKICBtZWFzdXJpbmcgbm90aGluZy4KCiMjIyMgVGhlcmUgYXJlIHR3byBzdWNoIG5hbWVzcGFjZXMgbm93LCB3YXRjaGVkIHRoZSBzYW1lIHdheQoKYGN0eC5hdXRob3JpbmdgIGlzIHRoZSBtb2QgU0RLJ3MgcHVibGljIGJhcnJlbCwgOTQgcnVudGltZSBleHBvcnRzLCBoYW5kZWQgb3Zlcgp3aG9sZSBvbiBleGFjdGx5IHRoZSB0ZXJtcyBgY3R4LmNvcmVgIGlzIGFuZCBmb3IgZXhhY3RseSB0aGUgc2FtZSByZWFzb246IGEKY3VyYXRlZCBzdWJzZXQgb2YgYW4gYXV0aG9yaW5nIEFQSSBpcyBhIHNlY29uZCBsaXN0IHRvIG1haW50YWluLCBhbmQgdGhlIGZpcnN0CnRoaW5nIHRoYXQgaGFwcGVucyB0byBhIGN1cmF0ZWQgbGlzdCBpcyB0aGF0IGl0IGxhZ3MgdGhlIGZ1bmN0aW9uIHNvbWVib2R5IG5lZWRzLgoKVW50aWwgaXQgd2FzIGhhbmRlZCB0byBhIHBsdWdpbiwgYSByZW5hbWUgaW5zaWRlIHRoZSBTREsgd2FzIGNhdWdodCBieSBgdHNjIC1iYApvdmVyIHRoaXMgcmVwb3NpdG9yeSwgYmVjYXVzZSBldmVyeSBjb25zdW1lciBvZiBpdCB3YXMgaW4gdGhlIHJlcG9zaXRvcnkuIFRoYXQKc3RvcHMgYmVpbmcgdHJ1ZSB0aGUgbW9tZW50IGEgcGx1Z2luIGhvbGRzIHRoZSBuYW1lc3BhY2U6IGEgcGx1Z2luIHNoaXBzIGFzIGJ1aWx0CkphdmFTY3JpcHQgYW5kIHJlc29sdmVzIG5vIHNwZWNpZmllciwgc28gdGhlIGNvbXBpbGVyIG5ldmVyIHNlZXMgdGhlIGNhbGwuIFRoZQpzZWNvbmQgZG9vciB0aGVyZWZvcmUgYXJyaXZlZCBjYXJyeWluZyB0aGUgZmlyc3QgZG9vcidzIGhvbGUsIGFuZCBjbG9zZXMgaXQgdGhlCnNhbWUgd2F5LiBgcGFja2FnZXMvbW9kLXNkay9tb2Qtc2RrLWFwaS1zdXJmYWNlLmpzb25gIGlzIHRoZSByZWNvcmRlZCBzdXJmYWNlLApgbW9kLWF1dGhvcmluZy1zdXJmYWNlLnRlc3QudHNgIGZhaWxzIGluIGJvdGggZGlyZWN0aW9ucyBhZ2FpbnN0IGl0LCBhbmQKYG5vZGUgdG9vbHMvYXBpLXN1cmZhY2UubWpzYCBjaGVja3MgYW5kIHVwZGF0ZXMgYm90aCBiYXNlbGluZXMgaW4gb25lIHJ1bi4KClRoZSBTREsgYmFycmVsIGlzIGEgY29uc2lkZXJlZCBzdXJmYWNlIHJhdGhlciB0aGFuIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIHRvIGJlCmV4cG9ydGVkOiBgYXBwbHlGaWVsZFBvbGljeWAgaXMgZGVsaWJlcmF0ZWx5IGtlcHQgb3V0IG9mIGl0cyBgaW5kZXgudHNgLCBhbmQgc2F5cwpzbyBpbiBhIGNvbW1lbnQgdGhlcmUuIEEgcmVtb3ZhbCBmcm9tIGl0IGlzIHJlY29yZGVkIGluIHRoZSB0YWJsZSBiZWxvdyBvbiB0aGUKc2FtZSB0ZXJtcyBhIGNvcmUgcmVtb3ZhbCBpcy4KCiMjIyMgQWRkaXRpb25zLCB3aGljaCBzdHJhbmQgbm9ib2R5CgpBbiBhZGRlZCBgY3R4YCBmaWVsZCBjYW5ub3QgYnJlYWsgYW4gZXhpc3RpbmcgcGx1Z2luOiBpdCByZWFkcyB3aGF0IGl0IHJlYWRzLCBhbmQKYSBuYW1lIGl0IG5ldmVyIG1lbnRpb25zIGNhbm5vdCBjaGFuZ2UgaXRzIG1lYW5pbmcuIFNvIGBNT0RfQVBJX1ZFUlNJT05gIGRvZXMgbm90Cm1vdmUgZm9yIG9uZSAoaXRzIG93biBkb2MgY29tbWVudCBzYXlzIGFzIG11Y2gpLCBhbmQgdGhlIGFkZGl0aW9ucyBhcmUgcmVjb3JkZWQKaGVyZSBmb3IgZGlzY292ZXJhYmlsaXR5IHJhdGhlciB0aGFuIGFzIGEgd2FybmluZy4KCnwgVmVyc2lvbiB8IEZpZWxkIHwgV2hhdCBpdCBpcyB8CnwtLS18LS0tfC0tLXwKfCB1bnJlbGVhc2VkICgyMDI2LTA4LTIyKSB8IGBjdHguYXV0aG9yaW5nYCB8IFRoZSBtb2QgU0RLJ3MgcHVibGljIGJhcnJlbDogYmx1ZXByaW50cywgYHBlZXJzRm9yYCwgYHN1Z2dlc3RGaWVsZHNgLCBgY2hlY2tSZWNvcmRzYCwgYE1vZFByb2plY3RgIGFuZCB0aGUgcmVzdCBvZiB0aGUgYXV0aG9yaW5nIHN0YWNrLiBBbHdheXMgcHJlc2VudCwgYmVjYXVzZSB0aGVzZSBhcmUgcHVyZSBmdW5jdGlvbnMgb3ZlciBkYXRhIHRoZSBjYWxsZXIgc3VwcGxpZXMgYW5kIHRoZXJlIGlzIG5vIGJvb3Qgc3RhdGUgdGhleSB3YWl0IG9uLiBVbmdhdGVkLCBvbiB0aGUgcmVhc29uaW5nIGBjYXBhYmlsaXR5LWdhdGUtcmVhY2gudGVzdC50c2AgYWxyZWFkeSBwaW5zIGZvciBgY3R4LmNvcmVgIGFuZCBgY3R4LnJlZ2lzdHJpZXNgOiBub3RoaW5nIGhlcmUgcmVhZHMgZ2FtZSBzdGF0ZSwgbm90aGluZyBtdXRhdGVzIGEgcmVnaXN0cnksIGFuZCBldmVyeSBuYW1lIGlzIHJlYWNoYWJsZSB0byBhbnlib2R5IHdobyBjYW4gaW5zdGFsbCB0aGUgcHVibGlzaGVkIG5wbSBwYWNrYWdlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0yMikgfCBgY3R4LmNvbXBvc2VkUmVjb3Jkc2AgfCBFdmVyeSBjb250ZW50IHJlY29yZCB0aGUgcnVubmluZyBnYW1lIHdhcyBjb21wb3NlZCBmcm9tLCBhcyBKU09OLCBrZXllZCBieSBwYWNrLWZpbGUgc3RlbSB3aXRoIG5vIGV4dGVuc2lvbi4gVGhlIFVOQk9VTkQgdHdpbiBvZiBgY3R4LnJlZ2lzdHJpZXNgLCBhbmQgdGhlIHNoYXBlIHRoZSBhdXRob3JpbmcgZnVuY3Rpb25zIGFib3ZlIGFjY2VwdDogYHJlZ2lzdHJpZXMubW9uc3RlcnMucmFjZXNgIGlzIGJvdW5kIGFuZCBjYXJyaWVzIG5laXRoZXIgdGhlIEpTT04ga2V5IG5hbWVzIG5vciB0aGUgZmllbGRzIHRoYXQgYm91bmQgdG8gbm90aGluZywgc28gYSBwZWVyIHRhYmxlIGNhbm5vdCBiZSBidWlsdCBmcm9tIGl0LiBNb2QtYWRkZWQgcmVjb3JkcyBhcmUgaW4gaXQgb24gdGhlIHNhbWUgdGVybXMgYXMgY29yZSdzLCBlYWNoIGNhcnJ5aW5nIGl0cyBwcm92ZW5hbmNlLiBBYnNlbnQgZHVyaW5nIGNvbnRlbnQgY29tcG9zaXRpb24sIGZvciB0aGUgc2FtZSByZWFzb24gYHJlZ2lzdHJpZXNgIGlzLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0yMikgfCBgY3R4LnJlbG9hZEdhbWVgIHwgVGhlIGdhbWUncyBvd24gbW9kLWNoYW5nZSByZWxvYWQsIHNvIGEgbW9kIHRoYXQgaW5zdGFsbGVkIHNvbWV0aGluZyBjYW4gYXBwbHkgaXQ6IGV2ZXJ5IHBsdWdpbidzIGB1bmluc3RhbGwoKWAgcnVucywgdGhlIGF1dG9wbGF5ZXIgaGFuZHMgdGhlIGtleWJvYXJkIGJhY2ssIHRoZSBsaXZlIGNoYXJhY3RlciBpcyB3cml0dGVuIGRvd24sIGFuZCB0aGUgc2Vzc2lvbiByZXN1bWVzIHRoYXQgY2hhcmFjdGVyIGluc3RlYWQgb2YgbGFuZGluZyBvbiB0aGUgdGl0bGUgc2NyZWVuLiBCZWhpbmQgYG1vZDppbnN0YWxsYCByYXRoZXIgdGhhbiBhIGNhcGFiaWxpdHkgb2YgaXRzIG93biwgYmVjYXVzZSBjb250ZW50IGNvbXBvc2VzIGF0IGxvYWQgYW5kIGFuIGluc3RhbGwgYSBtb2QgY2Fubm90IGZvbGxvdyB3aXRoIGEgcmVsb2FkIGxlYXZlcyB0aGUgcGxheWVyIGhvbGRpbmcgc29tZXRoaW5nIHRoZSBwcm9jZXNzIHdpbGwgbmV2ZXIgbG9hZC4gTm90IGEgcGVybWlzc2lvbiB0byByZWxvYWQgLSBhIHBsdWdpbiByZWFjaGVzIGBsb2NhdGlvbmAgd2l0aCBubyBncmFudCAtIGl0IGlzIHRoZSBmb3VyIHN0ZXBzIGEgbW9kIGNhbm5vdCB0YWtlIGZvciBpdHNlbGYuIHwKfCB1bnJlbGVhc2VkICgyMDI2LTA4LTIyKSB8IGBjdHguaW5zdGFsbE1vZCguLi4pLmxpbmVzYCB8IEEgZmllbGQgb24gYm90aCBhcm1zIG9mIHRoZSBleGlzdGluZyBpbnN0YWxsIG91dGNvbWU6IHRoZSB3b3JkaW5nIHRoZSBNb2RzIHNjcmVlbiBpdHNlbGYgcHJpbnRzIGZvciB0aGF0IHNhbWUgb3V0Y29tZSwgaW5jbHVkaW5nIG9uZSByb3cgcGVyIHVubWV0IHJlcXVpcmVtZW50IGFuZCB0aGUgYXV0aG9yJ3MgYWR2aWNlIHVuZGVyIHRoZW0uIEFkZGVkIGJlY2F1c2UgYSBtb2QgYnVpbHQgaW4gdGhlIGdhbWUgbXVzdCBmYWlsIGEgcmVxdWlyZW1lbnQgaW4gdGhlIHNhbWUgd29yZHMgYSBkb3dubG9hZGVkIG1vZCBmYWlscyBpbjsgYHByb2JsZW1gIGlzIHVuY2hhbmdlZCBhbmQgcmVtYWlucyBvbmUgd2hvbGUgc2VudGVuY2UuIHwKCiMjIyMgUmVtb3ZhbHMgdGFrZW4ga25vd2luZ2x5CgpTaXggcm93cywgYW5kIHRoZXkgYXJlIHRoZSBzaGFwZSB0aGUgbWVjaGFuaXNtIGFib3ZlIGlzIGZvci4gRm91ciBvZiB0aGVtIGFyZQpvbmUgcmVtb3ZhbDogdGhlIHBhcnNlLWVycm9yIGxpbWl0LCB3aGljaCBoYWQgbm8gY291bnRlcnBhcnQgaW4gQW5nYmFuZCA0LjIuNgphbmQgc28gaGFkIG5vIGJ1c2luZXNzIGluIGEgcG9ydC4gVGhlIHNpeHRoIGlzIHRoZSBzYW1lIHNoYXBlIGEgcmVsZWFzZSBsYXRlciwKYW5kIHRoZSBmaXJzdCBvbmUgdGhhdCBoYWQgU0hJUFBFRC4KCnwgVmVyc2lvbiB8IEV4cG9ydCB8IFdoeSB8IFdoYXQgdG8gdXNlIGluc3RlYWQgfAp8LS0tfC0tLXwtLS18LS0tfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTIpIHwgYG9wdGlvbkZpbGVFcnJvck1lc3NhZ2VgIHwgSXRzIHdob2xlIHN1YmplY3QgaXMgZ29uZS4gVGhlIGN1c3RvbS1vcHRpb25zIHJlYWRlciB3YXMgYSBwb3J0IG9mIHVwc3RyZWFtICoqbWFzdGVyKioncyBgc3RydWN0IHBhcnNlcmAgZ3JhbW1hcjsgIzE0OSByZXdyb3RlIGl0IHRvIDQuMi42J3MgaGFuZC1yb2xsZWQgcmVhZCBsb29wLCB3aGljaCBoYXMgbm8gYHBhcnNlcl9zdGF0ZWAgdG8gZm9ybWF0IC0gaXQgZW1pdHMgdGhyZWUgcGxhaW4gYG1zZygpYCBsaW5lcyBpbnN0ZWFkLiB8IGBwcmVmRXJyb3JNZXNzYWdlYCAoYHZpc3VhbHMvcHJlZnMudHNgKSwgd2hpY2ggZm9ybWF0cyB0aGUgaWRlbnRpY2FsIGBQYXJzZSBlcnJvciBpbiAlcyBsaW5lICVkIGNvbHVtbiAlZDogJXM6ICVzYCBmcm9tIHRoZSBzYW1lIGBQYXJzZXJTdGF0ZWAuIEl0IHdhcyBhbHdheXMgdGhlIHNhbWUgZnVuY3Rpb247IHRoaXMgb25lIHdhcyB0aGUgZHVwbGljYXRlLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgUEFSU0VfRVJST1JfTElNSVRgIHwgVGhlIHBvcnQncyBvd24gY2FwIG9mIDIwIHBhcnNlIGVycm9ycyBwZXIgZmlsZS4gQSBjaXRhdGlvbiBzd2VlcCAoIzI2OCkgZm91bmQgbm8gYFBBUlNFX0VSUk9SX0xJTUlUYCwgbm8gYGdldF9wYXJzZXJfZXJyb3JfbGltaXRgIGFuZCBubyBlcnJvciBDT1VOVCBhbnl3aGVyZSBpbiA0LjIuNiAtIGBwcm9jZXNzX3ByZWZfZmlsZV9uYW1lZGAgKGB1aS1wcmVmcy5jYCBMMTIyNS0xMjMxKSBgYnJlYWtgcyBvbiB0aGUgRklSU1QgYmFkIGxpbmUgLSBzbyBpdCB3YXMgYW4gaW1wcm92ZW1lbnQgdGhlIHBvcnQgaGFkIGFkZGVkLCBhbmQgdGhlIHBvcnQgYWRkcyBub3RoaW5nICgjMjcyKS4gfCBOb3RoaW5nIGluIGNvcmU6IHRoZSBudW1iZXIgd2FzIG5ldmVyIGEgZmFjdCBhYm91dCBBbmdiYW5kLiBBIG1vZCB0aGF0IHdhbnRzIGEgY2FwIGNob29zZXMgaXRzIG93biBhbmQgcGFzc2VzIGl0IGFzIGBQcmVmRXJyb3JQb2xpY3kucmVwb3J0TGltaXRgIHRvIGBzZXRQcmVmRXJyb3JQb2xpY3lgIChgdmlzdWFscy9wcmVmcy50c2ApLiBUaGUgYHFvbGAgbW9kIHVzZXMgMjAsIHNvIGEgcGxheWVyIHNlZXMgdGhlIGZhbWlsaWFyIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYGdldFBhcnNlckVycm9yTGltaXRgIHwgVGhlIHJlYWRlciBmb3IgdGhlIGFib3ZlLCBpbmNsdWRpbmcgYSBgUEFSU0VfRVJST1JfTElNSVRgIGVudmlyb25tZW50IG92ZXJyaWRlIHRoYXQgbm8gdXBzdHJlYW0gYnVpbGQgaGFzLiBSZW1vdmVkIHdpdGggaXRzIHN1YmplY3QgKCMyNzIpLiB8IGBwcmVmRXJyb3JQb2xpY3koKWAsIHdoaWNoIGFuc3dlcnMgd2l0aCB0aGUgcG9saWN5IGluIGZvcmNlIC0gYFVQU1RSRUFNX1BSRUZfRVJST1JfUE9MSUNZYCB1bmxlc3MgYSBtb2QgaW5zdGFsbGVkIGFub3RoZXIuIEl0IGFuc3dlcnMgYSByaWNoZXIgcXVlc3Rpb24sIGJlY2F1c2Ugb25lIG51bWJlciBjb3VsZCBub3QgZXhwcmVzcyBib3RoICJrZWVwIHJlYWRpbmciIGFuZCAia2VlcCByZXBvcnRpbmciLiB8CnwgdW5yZWxlYXNlZCAoMjAyNi0wOC0xNCkgfCBgc2V0UGFyc2VyRXJyb3JMaW1pdGAgfCBUaGUgdGVzdCBzZWFtIGZvciB0aGUgYWJvdmUuIE5vdGhpbmcgaW4gdGhlIGdhbWUgZXZlciBjYWxsZWQgaXQsIGFuZCBpdHMgc3ViamVjdCBpcyBnb25lICgjMjcyKS4gfCBgc2V0UHJlZkVycm9yUG9saWN5KHBvbGljeSBcfCBudWxsKWAsIHdoaWNoIGlzIGEgcmVhbCBzZWFtIHJhdGhlciB0aGFuIGEgdGVzdCBob29rOiBpdCBpcyB0aGUgZG9jdW1lbnRlZCB3YXkgYSBtb2QgY2hhbmdlcyB3aGF0IGEgYmFkIHByZWYgbGluZSBjb3N0cywgYW5kIGBudWxsYCByZXN0b3JlcyA0LjIuNidzIGJlaGF2aW91ci4gfAp8IHVucmVsZWFzZWQgKDIwMjYtMDgtMTQpIHwgYHBhcnNlUGFyc2VyRXJyb3JMaW1pdEVudmAgfCBQYXJzZWQgYFBBUlNFX0VSUk9SX0xJTUlUYCBvdXQgb2YgdGhlIGVudmlyb25tZW50IHdpdGggQydzIGBzdHJ0b2xgIHJ1bGVzLCBzbyBhIGhvc3QgY291bGQgc2V0IHRoZSBjYXAgd2l0aG91dCBvd25pbmcgdGhlIHJ1bGUuIFRoZXJlIGlzIG5vIGNhcCBhbmQgbm8gZW52aXJvbm1lbnQgdmFyaWFibGUgKCMyNzIpLiB8IE5vdGhpbmcuIEEgbW9kIHRoYXQgd2FudHMgaXRzIHBvbGljeSBjb25maWd1cmFibGUgb3ducyB0aGF0IGRlY2lzaW9uLCBhbmQgYGN0eC5wcmVmc2AgaXMgd2hlcmUgYSBtb2Qga2VlcHMgYSBwbGF5ZXIncyBhbnN3ZXIgdG8gaXQuIHwKfCAwLjIzLjAgfCBgZmlsbFRpbGVzRnJvbUtpbmAgfCBUaGUgcG9ydCdzIG93biBydWxlIHRoYXQgYSBtb2QtYWRkZWQgbW9uc3RlciB3aXRoIG5vIHRpbGUgaXMgZHJhd24gd2l0aCB0aGUgdGlsZSBvZiBhIHJhY2Ugc2hhcmluZyBpdHMgYGJhc2VgLCBhbmQgYW4gYWRkZWQgb2JqZWN0IGtpbmQgd2l0aCBhIGtpbmQgc2hhcmluZyBpdHMgYHR2YWxgLiBTaGlwcGVkIGluIDAuMjIuMCBhbmQgcmVtb3ZlZCBvbmUgcmVsZWFzZSBsYXRlcjogNC4yLjYgaGFzIG5vIGNvbmNlcHQgb2YgYSByZWNvcmQgYSBtb2QgYWRkZWQsIHNvIGl0IGhhcyBubyBvcGluaW9uIGFib3V0IHdoYXQgb25lIHNob3VsZCBsb29rIGxpa2UsIGFuZCAidGhlIGxvd2VzdC1pbmRleCByZWxhdGl2ZSdzIHBpY3R1cmUiIGlzIGF1dGhvcmVkIHRhc3RlIHJhdGhlciB0aGFuIHBvcnRlZCBiZWhhdmlvdXIuIEl0IGFsc28gbWFkZSB0aGF0IGNhbGwgb24gYmVoYWxmIG9mIHRpbGUgc2V0cyB0aGUgZ2FtZSBkb2VzIG5vdCBvd24gLSBhIHBhY2sgZHJhd24gaW4gMjAwMyBoYXMgbm8gYXJ0IGZvciBjb250ZW50IGFkZGVkIHR3ZW50eSB5ZWFycyBsYXRlciwgYW5kIGEgc2libGluZydzIHBpY3R1cmUgdGhlcmUgaXMgYSBjb25maWRlbnQgbGllIHdoZXJlIGEgbGV0dGVyIHdhcyBhbiBob25lc3QgYW5zd2VyLiBUaGUgcG9ydCBhZGRzIG5vdGhpbmcgKCMyNzIsIGFnYWluKS4gfCBUaGUgc2VhbSBpdCBiZWNhbWU6IGByZWdpc3RyeTp0aWxlc2AuIEEgdGlsZXNldCBtb2QgcmVnaXN0ZXJzIGEgZmlsbGVyIHRocm91Z2ggYGhvc3QudGlsZXMucmVnaXN0ZXJgLCByZWFkcyB3aGF0IHRoZSBnYW1lIGlzIG1hZGUgb2YgdGhyb3VnaCBgY3R4LnJlZ2lzdHJpZXNgLCBhbmQgd3JpdGVzIHRocm91Z2ggYSBkb29yIHRoYXQgcmVmdXNlcyBhbnkgdGlsZSBzb21ldGhpbmcgZWxzZSBhc3NpZ25lZCAoYFRpbGVGaWxsYCkuIGBuZW8tbGlub2xldW1gIDAuMTUuMCBjYXJyaWVzIGV4YWN0bHkgdGhlIHJ1bGUgdGhhdCB1c2VkIHRvIGJlIGhlcmUsIGFwcGxpZWQgdG8gbGlub2xldW0gcGFja3Mgb25seS4gSXRzIHRocmVlIHN1cHBvcnRpbmcgdHlwZXMgd2VudCB3aXRoIGl0IChgS2luVGlsZURlcHNgLCBgS2luVGlsZUZpbGxgLCBgS2luVGlsZURlcml2YXRpb25gKTsgYmVpbmcgdHlwZXMsIHRoZXkgbmV2ZXIgYXBwZWFyZWQgaW4gdGhlIHN1cmZhY2UgbGlzdCBhdCBhbGwuIHwKCmBwYXJzZUN1c3RvbU9wdGlvbnNUZXh0YCBzdXJ2aXZlcyBieSBuYW1lIGJ1dCAqKmNoYW5nZWQgc2hhcGUqKiBvbiAyMDI2LTA4LTEyOiBpdApyZXR1cm5zIGBzdHJpbmdbXWAgKHRoZSBtZXNzYWdlcykgcmF0aGVyIHRoYW4gYFBhcnNlclN0YXRlW11gLCBhbmQgaXRzIGZvdXJ0aApgZXJyb3JMaW1pdGAgcGFyYW1ldGVyIGlzIGdvbmUsIGJlY2F1c2UgNC4yLjYncyByZWFkZXIgaGFzIG5vIGVycm9yIGNhcC4gQSBwbHVnaW4KY2FsbGluZyBpdCBmb3IgaXRzIG93biBkaWFnbm9zdGljcyBnZXRzIGEgdHlwZSBlcnJvciBhdCBidWlsZCBhbmQgYSBkaWZmZXJlbnQKYXJyYXkgYXQgcnVudGltZS4gUmVjb3JkZWQgaGVyZSByYXRoZXIgdGhhbiBhbGlhc2VkOiB0aGVyZSBpcyBubyBob25lc3QgYWxpYXMgZm9yCiJ0aGUgc2FtZSBjYWxsIG5vdyBhbnN3ZXJzIGEgZGlmZmVyZW50IHF1ZXN0aW9uLiIKCmBDZWxsVmlldy50cmFwYCBzdXJ2aXZlcyBieSBuYW1lIGJ1dCAqKmNoYW5nZWQgbWVhbmluZyoqLCB1bnJlbGVhc2VkCigyMDI2LTA4LTIxKS4gSXQgdXNlZCB0byBiZSAidGhpcyBncmlkIGhvbGRzIGFueSB0cmFwIHJlY29yZCIgYW5kIGl0IGlzIG5vdwpgc3F1YXJlX2lzZGlzYXJtYWJsZXRyYXBgOiBhIFZJU0lCTEUgUExBWUVSIHRyYXAgdGhhdCBpcyBub3QgYWxyZWFkeSBkaXNhYmxlZC4KClJlY29yZGVkIGhlcmUgcmF0aGVyIHRoYW4ga2VwdCBhbmQgc3VwcGxlbWVudGVkIHdpdGggYSBzZWNvbmQgZmllbGQsIGJlY2F1c2UgdGhlCm9sZCBhbnN3ZXIgd2FzIG5vdCBhIGRpZmZlcmVudCBxdWVzdGlvbiAtIGl0IHdhcyB0aGUgd3JvbmcgYW5zd2VyIHRvIHRoaXMgb25lLiBUaGUKdHJhcCBsaXN0IGlzIGFsc28gd2hlcmUgYSBjbG9zZWQgZG9vcidzIExPQ0sgbGl2ZXMgKGBzcXVhcmVfc2V0X2Rvb3JfbG9ja2AsIGZsYWdnZWQKYExPQ0sgfCBJTlZJU0lCTEVgKSwgYWxvbmcgd2l0aCBhIGdseXBoIG9mIHdhcmRpbmcsIGEgd2ViIGFuZCBhIGRlY295LiBOb25lIG9mCnRob3NlIGlzIGEgdHJhcCBhIHBsYXllciBjYW4gc2VlIG9yIHRoZSBgZGlzYXJtYCBjb21tYW5kIHdpbGwgYWN0IG9uLCBzbyBhIG1vZApyZWFkaW5nIHRoZSBvbGQgZmllbGQgZ290IGEgbG9ja2VkIGRvb3IgcHJlc2VudGVkIGFzIHNvbWV0aGluZyB0byBkaXNhcm0gLSBhbmQKYGRpc2FybWAgcmVmdXNlcyBpdCB3aXRob3V0IHNwZW5kaW5nIGEgdHVybiwgd2hpY2ggdHVybnMgYSBwbGF1c2libGUgZGVjaXNpb24gaW50bwphIGhhbmcuIFRoZSBvbGQgbWVhbmluZyBhbHNvIGNvbnRyYWRpY3RlZCB0aGUgdmlldydzIG93biBydWxlLCBzdGF0ZWQgb24gdGhlCm5laWdoYm91cmluZyBgdHJhcEdseXBoYDogYSB0cmFwIHRoZSBwbGF5ZXIgaGFzIG5vdCBmb3VuZCBpcyBub3Qgb24gdGhlIHNjcmVlbiBhbmQKc28gaXMgbm90IGluIHRoZSB2aWV3LgoKKipXaGF0IHRvIGRvIGFib3V0IGl0LioqIEEgbW9kIHRoYXQgdXNlZCBgdHJhcGAgdG8gZGVjaWRlIHdoZXRoZXIgdG8gZGlzYXJtIG5lZWRzCm5vIGNoYW5nZSBhbmQgc3RvcHMgaGFuZ2luZy4gQSBtb2QgdGhhdCB1c2VkIGl0IHRvIGFzayAiaXMgdGhlcmUgYW55dGhpbmcgaW4gdGhlCnRyYXAgbGlzdCBoZXJlIiAtIGEgbWFwIG92ZXJsYXkgY291bnRpbmcgZ2x5cGhzIG9mIHdhcmRpbmcsIHNheSAtIG5vdyBnZXRzIGBmYWxzZWAKZm9yIGEgZ2x5cGggYW5kIG5lZWRzIHRoZSB0cmFwIGxheWVyIGluc3RlYWQ6IGB0cmFwR2x5cGhgIGlzIHByZXNlbnQgZm9yIGV4YWN0bHkKdGhlIHRyYXBzIHRoZSBwbGF5ZXIgY2FuIHNlZSwgZ2x5cGggaW5jbHVkZWQuCgpgUHJvY2Vzc1ByZWZPcHRpb25zYCAqKmNoYW5nZWQgc2hhcGUqKiBmb3IgdGhlIHNhbWUgcmVhc29uIGFuZCBpbiB0aGUgc2FtZQpkaXJlY3Rpb24gKCMyNzIsIHVucmVsZWFzZWQgMjAyNi0wOC0xNCk6IGl0cyBgZXJyb3JMaW1pdD86IG51bWJlcmAgaXMgbm93CmBlcnJvclBvbGljeT86IFByZWZFcnJvclBvbGljeWAuIEEgcGx1Z2luIHRoYXQgY2FsbGVkCmBwcm9jZXNzUHJlZlRleHQodGV4dCwgZGVwcywgc2luaywgeyBlcnJvckxpbWl0OiAwIH0pYCBnZXRzIGEgdHlwZSBlcnJvciBhdApidWlsZCwgYW5kIHRoZSBmaXggaXMgYHsgZXJyb3JQb2xpY3k6IHsgY29udGludWVBZnRlckVycm9yOiB0cnVlLCByZXBvcnRMaW1pdDogMCB9IH1gLgpOb3QgYWxpYXNlZCwgYmVjYXVzZSB0aGUgb2xkIGZpZWxkIGNvdWxkIG5vdCBzYXkgd2hhdCB0aGUgbmV3IG9uZSBoYXMgdG86IGEKc2luZ2xlIG51bWJlciBjb25mbGF0ZWQgInN0b3AgYXBwbHlpbmcgdGhlIGZpbGUiIHdpdGggInN0b3AgY29sbGVjdGluZyBlcnJvcnMiLAphbmQgdGhlIHNlY29uZCBpcyB0aGUgb25lIGEgcGxheWVyIHdhbnRzIGJvdW5kZWQuIEZvdXIgbmFtZXMgYXJyaXZlZCB3aXRoIGl0OgpgUHJlZkVycm9yUG9saWN5YCwgd2hpY2ggaXMgYSB0eXBlIGFuZCBzbyBuZXZlciBhcHBlYXJzIGluIHRoZSBzdXJmYWNlIGxpc3QsIGFuZAp0aGUgdGhyZWUgcnVudGltZSBleHBvcnRzIGBVUFNUUkVBTV9QUkVGX0VSUk9SX1BPTElDWWAsIGBwcmVmRXJyb3JQb2xpY3koKWAgYW5kCmBzZXRQcmVmRXJyb3JQb2xpY3koKWAuCgpgbXNndChzaW5rcywgdHlwZSwgdGV4dClgIGxpa2V3aXNlICoqa2VlcHMgaXRzIG5hbWUgYW5kIHNpZ25hdHVyZSBidXQgbm8gbG9uZ2VyCnRvdWNoZXMgYHNpbmtzLnNvdW5kYCoqICgjMjM5LCB1bnJlbGVhc2VkIDIwMjYtMDgtMTMpLiBJdCB1c2VkIHRvIGNhbGwgYm90aApoYWx2ZXMgYnkgaGFuZDsgdGhlIGhvc3QncyBgbXNnYCBzaW5rIGlzIG5vdyBgbXNndGAgaXRzZWxmLCBzbyBjYWxsaW5nIGJvdGgKd291bGQgcGxheSB0aGUgc291bmQgdHdpY2UuIE5vdGhpbmcgYnJlYWtzIGF0IGJ1aWxkIHRpbWUgYW5kIHRoZSBjb21tb24gY2FzZSBpcwp1bmNoYW5nZWQgLSBhIHBsdWdpbiB0aGF0IGNhbGxzIGBtc2d0KGN0eC5zdGF0ZSwgIkhVTkdSWSIsICIuLi4iKWAgc3RpbGwgZ2V0cwptZXNzYWdlICphbmQqIHNvdW5kLCBiZWNhdXNlIHRoZSBzdGF0ZSdzIHNpbmsgc3VwcGxpZXMgaXQuIFdoYXQgY2hhbmdlZCBpcyBhCnBsdWdpbiB0aGF0IGJpbmRzIGl0cyAqKm93bioqIG5vbi1zb3VuZGluZyBgbXNnYCBpbnRvIGEgYE1lc3NhZ2VTaW5rc2AgYW5kCnJlbGllZCBvbiBgbXNndGAgdG8gcmVhY2ggYHNvdW5kYCBzZXBhcmF0ZWx5OiB0aGF0IG5vdyBnb2VzIHF1aWV0LCBhbmQgdGhlIGZpeAppcyB0byBtYWtlIGl0cyBzaW5rIHR5cGVkLWF3YXJlIHdpdGggdGhlIGV4cG9ydGVkIGBtZXNzYWdlU291bmQodHlwZSlgLCB0aGUgc2FtZQpvbmUtbGluZSBydWxlIGB3ZWIvc3JjL21haW4udHNgIHVzZXMuIE5vdCBhbGlhc2FibGU6IHR3byBmdW5jdGlvbnMgZGlmZmVyaW5nIG9ubHkKaW4gd2hldGhlciB0aGV5IGRvdWJsZS1maXJlIGlzIHdvcnNlIHRoYW4gb25lIHJ1bGUuCgpPbmUgbW9yZSBzaGFwZSBjaGFuZ2UsIGluIHRoZSBTREsgcmF0aGVyIHRoYW4gaW4gYGN0eC5jb3JlYDogYFBhcnNlZENhcGFiaWxpdHlgCmdhaW5lZCBhIGB7IGtpbmQ6ICJkaXNwbGF5IjsgYWN0aW9uOiAicmVwbGFjZSIgfWAgdmFyaWFudCAoIzE0MCwgdW5yZWxlYXNlZAoyMDI2LTA4LTEzKSwgYmVjYXVzZSBgTW9kUGx1Z2luLmZyb250ZW5kYCBub3cgcmVxdWlyZXMgYGRpc3BsYXk6cmVwbGFjZWAuIE5vdGhpbmcKdGhhdCAqYnVpbGRzKiBhIGNhcGFiaWxpdHkgc3RyaW5nIGJyZWFrczsgd2hhdCBicmVha3MgaXMgYSBwbHVnaW4gdGhhdApgc3dpdGNoYGVzIGV4aGF1c3RpdmVseSBvdmVyIGBwYXJzZUNhcGFiaWxpdHlgJ3MgcmVzdWx0IGluIFR5cGVTY3JpcHQsIHdoaWNoCmdldHMgYSBjb21waWxlIGVycm9yIG5hbWluZyB0aGUgbmV3IGFybS4gVGhhdCBpcyB0aGUgaW50ZW5kZWQgb3V0Y29tZSAtIGEgbW9kCnJlbmRlcmluZyB0aGUgY2FwYWJpbGl0eSBsaXN0IHRvIGl0cyBvd24gVUkgc2hvdWxkIGJlIHRvbGQgYSBraW5kIGV4aXN0cyB0aGF0IGl0CmRvZXMgbm90IGRlc2NyaWJlLiBBZGRpdGl2ZSBhdCBydW50aW1lOiBhbiBvbGRlciBidWlsZCBzaW1wbHkgbmV2ZXIgZW1pdHMgaXQuCgpUaGUgc2FtZSB0aGluZyBoYXBwZW5lZCBvbmNlIG1vcmUsIGZvciB0aGUgc2FtZSByZWFzb24gYW5kIHdpdGggdGhlIHNhbWUKY29uc2VxdWVuY2U6IGBQYXJzZWRDYXBhYmlsaXR5YCBnYWluZWQgYHsga2luZDogInVpIjsgcmVnaW9uOiBzdHJpbmc7IGFjdGlvbjoKInJlcGxhY2UiIH1gIGFuZCBgQ29udGVzdGVkTGF5ZXJgIGdhaW5lZCBgImh1ZCJgICgjMjUzLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTMpLApiZWNhdXNlIGBNb2RQbHVnaW4uaHVkYCByZXF1aXJlcyBgdWk6PHJlZ2lvbj4ucmVwbGFjZWAgYW5kIHRoZSBjb25mbGljdCByZXBvcnQKbm93IGhhcyBhIHNsb3QgcGVyIEhVRCByZWdpb24uIEFuIGV4aGF1c3RpdmUgYHN3aXRjaGAgb3ZlciBlaXRoZXIgZ2V0cyBhIGNvbXBpbGUKZXJyb3IgbmFtaW5nIHRoZSBuZXcgYXJtLCB3aGljaCBpcyB0aGUgaW50ZW5kZWQgb3V0Y29tZS4gYE1vZFBsdWdpbmAgaXRzZWxmIG9ubHkKZ2FpbmVkIGFuIG9wdGlvbmFsIG1lbWJlciwgc28gbm8gZXhpc3RpbmcgcGx1Z2luJ3Mgc2hhcGUgY2hhbmdlcy4KClR3byBtb3JlIFNESyBhZGRpdGlvbnMsIGFuZCB0aGlzIHBhaXIgYnJlYWtzIG5vdGhpbmcgYXQgYWxsLCByZWNvcmRlZCBiZWNhdXNlCnRoZSBlbnRyaWVzIGFib3ZlIGVzdGFibGlzaCB0aGF0IGEgc2hhcGUgY2hhbmdlIGdldHMgd3JpdHRlbiBkb3duIHdoZXRoZXIgb3Igbm90Cml0IHN0cmFuZHMgYW55Ym9keSwgYW5kIGEgcGFnZSB0aGF0IG9ubHkgbGlzdHMgdGhlIHBhaW5mdWwgb25lcyBzdG9wcyBiZWluZyBhCnJlY29yZC4gYFdvcmxkRnJhbWVgIGFuZCBgSHVkRnJhbWVgIGVhY2ggZ2FpbmVkIGFuICoqb3B0aW9uYWwqKiBgc3RhY2tgCihgcmVhZG9ubHkgTGl2ZVJlZ2lvbltdIHwgdW5kZWZpbmVkYCksIGFuZCBgTGl2ZVJlZ2lvbmAgLyBgUmVnaW9uTGF5ZXJgIGFyZSBub3cKZXhwb3J0ZWQgZnJvbSB0aGUgU0RLICgjMjYxLCB1bnJlbGVhc2VkIDIwMjYtMDgtMTQpLiBBbiBvcHRpb25hbCBtZW1iZXIgYWRkZWQgdG8KYW4gaW50ZXJmYWNlIGEgcGx1Z2luICpyZWNlaXZlcyogY2Fubm90IGJyZWFrIGEgcGx1Z2luOiBub3RoaW5nIHRoYXQgcmVhZHMgYQpmcmFtZSBzdG9wcyBjb21waWxpbmcsIGFuZCBhIGhvc3QgdGhhdCBwdWJsaXNoZXMgbm8gc3RhY2sgc2ltcGx5IGxlYXZlcyBpdApgdW5kZWZpbmVkYCwgd2hpY2ggdGhlIHNlYW0gZ2l2ZXMgYSBkaXN0aW5jdCBtZWFuaW5nIHRvIG9uIHB1cnBvc2UsIHNvIGEgZnJvbnQKZW5kIG11c3Qgbm90IHJlYWQgYSBtaXNzaW5nIHN0YWNrIGFzICJub3RoaW5nIGlzIGNvdmVyaW5nIG1lIi4gU2VlCltQTFVHSU5TLm1kXShQTFVHSU5TLm1kI2tub3dpbmctd2hlbi15b3UtYXJlLWNvdmVyZWQtZnJhbWVzdGFjaykuIE5vdGUgdGhlCmFzeW1tZXRyeSB3aXRoIHRoZSBgUGFyc2VkQ2FwYWJpbGl0eWAgcm93cyBhYm92ZTogdGhvc2UgYnJva2UgZXhoYXVzdGl2ZQpgc3dpdGNoYGVzIGJlY2F1c2UgYSBwbHVnaW4gKmluc3BlY3RzKiBhIGNhcGFiaWxpdHksIGFuZCBub2JvZHkgZXhoYXVzdGl2ZWx5CnN3aXRjaGVzIG92ZXIgYSBmcmFtZS4KCk9uZSBTREsgKipyZW1vdmFsKiosIGFuZCBpdCBpcyB0aGUgZmlyc3Qgb24gdGhpcyBwYWdlIHRoYXQgcmVtb3ZlcyBhIG5hbWUgcmF0aGVyCnRoYW4gcmVzaGFwaW5nIG9uZTogYGFwcGx5RmllbGRQb2xpY3lgIGlzIGdvbmUgZnJvbSB0aGUgcGFja2FnZSBpbmRleCAoIzI4NSwKdW5yZWxlYXNlZCAyMDI2LTA4LTE1KS4gSXQgYXJyaXZlZCBwdWJsaWMgYnkgYWNjaWRlbnQ6IHRoZSBpbmRleCBzYWlkCmBleHBvcnQgKiBmcm9tICIuL2ZpZWxkcy5qcyJgLCBhbmQgaXQgd2FzIHVudXNhYmxlIGFuZCBkYW5nZXJvdXMgaW4gdGhlIHNhbWUKYnJlYXRoLiBUaGUgZnVuY3Rpb24ganVkZ2VzIGEgbmFtZXNwYWNlIHRyZXNwYXNzIGZyb20gYSBgRmllbGRQcm92ZW5hbmNlYCBtYXAKYnVpbHQgZHVyaW5nIGNvbXBvc2l0aW9uLCBhbmQgdGhlIGFjY2Vzc29yIHRoYXQgYnVpbGRzIG9uZSAoYGZpZWxkUHJvdmVuYW5jZU9mYCkKd2FzIG5ldmVyIGV4cG9ydGVkLiBTbyB0aGUgb25seSBmb3JtIGFuIG91dHNpZGUgY2FsbGVyIGNvdWxkIHdyaXRlIHdhcyB0aGUKdGhyZWUtYXJndW1lbnQgb25lLCB3aG9zZSBkZWZhdWx0cyBhcmUgZW1wdHkgbWFwczogaXQgc3RyaXBzIHVuZGVjbGFyZWQga2V5cywKZmluZHMgbm8gcmVjb3JkZWQgd3JpdGVyIGZvciBhbnl0aGluZywganVkZ2VzIG5vIHdyaXRlIGEgdHJlc3Bhc3MsIGFuZCBoYW5kcyBiYWNrCmEgZmF1bHQgbGlzdCBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGEgY2xlYW4gcGFzcy4gKipBIGdhdGUgdGhhdCByZXBvcnRzIHN1Y2Nlc3MKd2hpbGUgY2hlY2tpbmcgbm90aGluZyBpcyB3b3JzZSB0aGFuIG5vIGdhdGUqKiwgYmVjYXVzZSB0aGUgY2FsbGVyIHN0b3BzIGxvb2tpbmcuClRoZSB0d28gcHJvdmVuYW5jZSBwYXJhbWV0ZXJzIGFyZSBub3cgcmVxdWlyZWQgYXMgd2VsbCwgc28gdGhlIHNhbWUgbWlzdGFrZSBpcyBhCmNvbXBpbGUgZXJyb3IgaW5zaWRlIHRoZSBTREsuIE5vdGhpbmcgaW4gdGhpcyByZXBvc2l0b3J5IG9yIGluIHRoZSBmb3VyIG1vZApyZXBvc2l0b3JpZXMgY2FsbGVkIGl0LCBzbyBubyBhdXRob3IgaXMgc3RyYW5kZWQ7IHRoZSBkb29yIHRvIHRoZSBydWxlIGlzCmBjb21wb3NlQ29udGVudFBhY2tzYCwgd2hpY2ggc3VwcGxpZXMgYm90aCBtYXBzIGFuZCBhbHdheXMgZGlkLgpgY2hlY2tVbnF1YWxpZmllZGAsIGBkZWNsYXJlZEZpZWxkc2AsIGBmaWVsZE93bmVyYCwgYGlzRXh0ZW5zaW9uS2V5YCBhbmQKYEZJRUxEX1RZUEVTYCBhcmUgdW5hZmZlY3RlZCwgYW5kIGFyZSBub3cgbmFtZWQgZXhwbGljaXRseSByYXRoZXIgdGhhbiBzd2VwdCB1cApieSBhIHdpbGRjYXJkLCB3aGljaCBpcyB3aGF0IGxldCB0aGlzIG9uZSBvdXQgaW4gdGhlIGZpcnN0IHBsYWNlLgoKVHdvICoqZmllbGQgcmVuYW1lcyoqIHRoYXQgdGhlIGV4cG9ydCByYXRjaGV0IGNhbm5vdCBzZWUsIGFuZCB0aGF0IGlzIGV4YWN0bHkgd2h5CnRoZXkgYXJlIHdyaXR0ZW4gaGVyZSAoIzI4MywgdW5yZWxlYXNlZCAyMDI2LTA4LTE1KS4gVGhlIHJhdGNoZXQgY29tcGFyZXMgdGhlIHNldApvZiBleHBvcnRlZCBOQU1FUzsgaXQgc2F5cyBub3RoaW5nIGFib3V0IHRoZSBzaGFwZSBvZiB3aGF0IGEgbmFtZSBoYW5kcyBiYWNrLiBUaGUKdWktZW50cnkgY29uZmlnIGEgcGx1Z2luIGdldHMgZnJvbSBgYnVpbGRVaUVudHJ5Q29uZmlnYCBjaGFuZ2VkIHR3byBmaWVsZHM6Cgp8IFdhcyB8IE5vdyB8IFdoeSBub3QgYWxpYXNlZCB8CnwtLS18LS0tfC0tLXwKfCBgVWlFbnRyeS5jb21iaW5lckluZGV4OiBudW1iZXJgICgxLWJhc2VkIGludG8gY29yZSdzIG5pbmUpIHwgYFVpRW50cnkuY29tYmluZXJOYW1lOiBzdHJpbmdgIHwgVGhlIHNsb3Qgd2FzIHRoZSBidWcuIEl0IGlzIGEgY29vcmRpbmF0ZSBpbnRvIGNvcmUncyBvd24gY29tcGlsZWQgdGFibGUsIHNvIGEgY29tYmluZXIgYSBtb2QgcmVnaXN0ZXJzIGhhcyBub25lLCBhbmQga2VlcGluZyB0aGUgaW5kZXggd291bGQgaGF2ZSBmcm96ZW4gdGhlIHRhYmxlIGF0IG5pbmUgYW5kIG1hZGUgYHJlZ2lzdHJ5OnVpLWVudHJ5YCBpbmVydC4gS2VlcGluZyBCT1RIIHdvdWxkIG1lYW4gdHdvIGlkZW50aXRpZXMgZm9yIG9uZSB0aGluZyBhbmQgYSBydWxlIGFib3V0IHdoaWNoIHdpbnMuIHwKfCBgUmVuZGVyZXJJbmZvLmJhY2tlbmRJbmRleDogbnVtYmVyYCAoMC4uNSksIGBSZW5kZXJlckluZm8uY29tYmluZXJJbmRleDogbnVtYmVyYCB8IGBSZW5kZXJlckluZm8uYmFja2VuZE5hbWU6IHN0cmluZ2AsIGBSZW5kZXJlckluZm8uY29tYmluZXJOYW1lOiBzdHJpbmdgIHwgU2FtZSByZWFzb24sIGFuZCB0aGUgc2FtZSBmaXg6IHJlYWQgdGhlIG5hbWUuIGBSZW5kZXJlckluZm9gIGlzIG5vdyBhbiBleHBvcnRlZCBUWVBFIGFzIHdlbGwsIHdoaWNoIGl0IHdhcyBub3QgYmVmb3JlLCBhbmQgYSBwbHVnaW4gd3JpdGluZyBhIHJlbmRlcmVyIGJhY2tlbmQgbmVlZHMgdG8gbmFtZSBpdC4gfAoKTm90aGluZyBlbHNlIGFib3V0IGBVaUVudHJ5Q29uZmlnYCBtb3ZlZCwgYW5kIGEgcGx1Z2luIHRoYXQgb25seSBjYWxscwpgY2hhcmFjdGVyR3JpZGAsIGBlcXVpcENtcFN1bW1hcnlgLCBgYXBwbHlSZW5kZXJlcmAgb3IgYGNvbWJpbmVWYWx1ZXNgIGlzCnVuYWZmZWN0ZWQ6IGV2ZXJ5IG9uZSBvZiB0aG9zZSBnYWluZWQgYW4gT1BUSU9OQUwgdHJhaWxpbmcgcmVnaXN0cnkgYXJndW1lbnQgYW5kCmJlaGF2ZXMgZXhhY3RseSBhcyBiZWZvcmUgd2hlbiBpdCBpcyBvbWl0dGVkLgoKKipUaGlzIGRvZXMgbm90IG1ha2UgYGN0eC5jb3JlYCBzdGFibGUuKiogSXQgbWFrZXMgYnJlYWtpbmcgaXQgdmlzaWJsZSB0byB0aGUKcGVyc29uIGJyZWFraW5nIGl0LCBpbiB0aGUgcmVwb3NpdG9yeSB3aGVyZSBpdCBoYXBwZW5zLCBiZWZvcmUgaXQgcmVhY2hlcyBhCnBsYXllcidzIGJyb3dzZXIuIFRoZSByZW1haW5pbmcgcHJlc3N1cmUgdmFsdmUgaXMgYE1vZEhvb2tzYCwgd2hpY2ggaXMgYSBjbG9zZWQKaW50ZXJmYWNlIG9mIGVpZ2h0IG1lbWJlcnMgdGhhdCB0aGUgYnVnLWZpeGVzIG1vZCBhbG9uZSBuZWVkZWQgc2l4IG9mIC0gaWYKYXV0aG9ycyBrZWVwIHJlYWNoaW5nIHBhc3QgaXQgaW50byBgY3R4LmNvcmVgLCB0aGF0IGlzIHRoZSBzaWduYWwgdG8gZ3JvdyB0aGUKc2VhbSwgbm90IHRvIGZlbmNlIHRoZSBuYW1lc3BhY2UuCgojIyBXaGF0IGlzICpub3QqIGEgY29tcGF0aWJpbGl0eSBtZWNoYW5pc20KCi0gKipTYXZlIGRhdGEuKiogQSBtb2QncyBvd24gYmFnIGluIHRoZSBwbGF5ZXIncyBzYXZlIGlzIG1pZ3JhdGVkIGJ5IHRoZSBtb2QsIHZpYQogIGBNb2RQbHVnaW4ubWlncmF0ZUJhZ2AgYW5kIGBzYXZlU2NoZW1hYC4gQ29yZSByb3VuZC10cmlwcyB0aGUgYmFnIHZlcmJhdGltIGFuZAogIG5ldmVyIHJlYWRzIGl0LCBzbyBvbmx5IHRoZSBtb2Qga25vd3Mgd2hhdCBpdHMgb3duIGRhdGEgbWVhbnMuCi0gKipMb2FkIG9yZGVyLioqIE5vdGhpbmcgaGVyZSBjaGFuZ2VzIHdobyB3aW5zIGEgY29uZmxpY3QuIFRoYXQgaXMKICBNT0RfTElGRUNZQ0xFLm1kIHNlY3Rpb24gMywgYW5kIHRoZSBhbnN3ZXIgaXMgYWx3YXlzIHRoZSBtb2QgdGhhdCBsb2FkcyBsYXN0LgoKIyMgV2hvIGZpbmRzIG91dCBmaXJzdAoKVGhlICoqbW9kIGNhbmFyeSoqIChgLmdpdGh1Yi93b3JrZmxvd3MvbW9kLWNhbmFyeS55bWxgKSBydW5zIHRoZSBjdXJhdGVkIGxpc3QKYWdhaW5zdCB0aGlzIGJ1aWxkIGRhaWx5IGFuZCB3aGVuZXZlciB0aGUgbGlzdCBjaGFuZ2VzOiBldmVyeSByZXBvc2l0b3J5IGluCmBtb2RzL3JlZ2lzdHJ5Lmpzb25gIGlzIGRpc2NvdmVyZWQgdGhlIHdheSB0aGUgZ2FtZSBkaXNjb3ZlcnMgaXQsIGFuZCBpdHMgbWFuaWZlc3QKaXMgcHV0IHRocm91Z2ggdGhpcyBidWlsZCdzIGdhdGVzLiBTbyBhbiBlbmdpbmUgcmVsZWFzZSB0aGF0IHdvdWxkIHN0cmFuZCBhCmN1cmF0ZWQgbW9kIHNob3dzIHVwIGhlcmUgcmF0aGVyIHRoYW4gaW4gYSBwbGF5ZXIncyBpbnN0YWxsIC0gdGhlIGF1dG9tYXRlZAplcXVpdmFsZW50IG9mIFNNQVBJJ3MgY29tcGF0aWJpbGl0eSBsaXN0LCBhbmQgdGhlIHJlYXNvbiBhIHJlbGVhc2UgY2FuIGJlIGhlbGQKcmF0aGVyIHRoYW4gYXBvbG9naXNlZCBmb3IuCgpUaGF0IGNvdmVycyBjdXJhdGVkIG1vZHMgb25seS4gQSBtb2Qgbm9ib2R5IGhhcyBsaXN0ZWQgZmluZHMgb3V0IHRoZSBzYW1lIHdheQpldmVyeSBtb2QgYWx3YXlzIGhhcywgd2hpY2ggaXMgd2h5IHRoZSBnYXRlcyBhYm92ZSBhcmUgYnVpbHQgdG8gZGVncmFkZSByYXRoZXIKdGhhbiByZWZ1c2UuCgojIyBQcmlvciBhcnQsIGFuZCB3aGVyZSB0aGlzIGRlbGliZXJhdGVseSBkaWZmZXJzCgotICoqW1NNQVBJXShodHRwczovL2dpdGh1Yi5jb20vUGF0aG9zY2hpbGQvU01BUEkpKiogKFN0YXJkZXcgVmFsbGV5KSBpcyB0aGUgbW9kZWwKICBmb3IgbW9zdCBvZiB0aGlzOiBpdCByZXdyaXRlcyBtb2RzJyBjb21waWxlZCBjb2RlIGZvciByZW5hbWVkIG1lbWJlcnMsIGRldGVjdHMKICBhbiBpbmNvbXBhdGlibGUgbW9kIGFuZCBkaXNhYmxlcyBpdCB3aXRoIGEgY2xlYXIgbWVzc2FnZSByYXRoZXIgdGhhbiBsZXR0aW5nIGl0CiAgY3Jhc2ggdGhlIGdhbWUsIGFuZCBwdWJsaXNoZXMgYSBsaXZlIGNvbXBhdGliaWxpdHkgbGlzdC4gVGhlIGxlc3NvbiB0YWtlbiBoZXJlCiAgaXMgdGhlICpvcmRlcmluZyogLSBkZWdyYWRlLCByZXBvcnQsIGFuZCBvbmx5IHJlZnVzZSB3aGF0IGdlbnVpbmVseSBjYW5ub3QgcnVuLgogIE5vdCB0YWtlbjogdGhlIElMIHJld3JpdGluZywgd2hpY2ggaGFzIG5vIGVxdWl2YWxlbnQgZm9yIGEgSmF2YVNjcmlwdCBtb2R1bGUKICBhbmQgd291bGQgYmUgdGhlIHdyb25nIHRvb2wgYW55d2F5LgotICoqW0ZhY3RvcmlvXShodHRwczovL2x1YS1hcGkuZmFjdG9yaW8uY29tL2xhdGVzdC9hdXhpbGlhcnkvZGF0YS1saWZlY3ljbGUuaHRtbCkqKgogIHN1cHBsaWVzIG1pZ3JhdGlvbnMgaW4gdHdvIGZsYXZvdXJzIC0gSlNPTiB0byByZW5hbWUgYSBwcm90b3R5cGUsIEx1YSB0byBmaXggdXAKICBhIGxvYWRlZCBzYXZlIC0gYW5kIHJlbWVtYmVycyBwZXIgc2F2ZSB3aGljaCBoYXZlIHJ1bi4gYG1pZ3JhdGVCYWdgIGlzIHRoZQogIHNlY29uZCBvZiB0aG9zZS4gVGhlIGZpcnN0IGlzIHRoZSBzaGFwZSBhIGNvcmUtc2lkZSByZW5hbWUgYWxpYXMgd291bGQgdGFrZSBpZgogIG9uZSBpcyBldmVyIG5lZWRlZDsgbm90aGluZyBuZWVkcyBpdCB5ZXQsIGJlY2F1c2UgY29yZSdzIHJlY29yZCBuYW1lcyBhcmUKICB1cHN0cmVhbSBBbmdiYW5kJ3MgYW5kIHRoZSBwYXJpdHkgbWFuZGF0ZSBrZWVwcyB0aGVtIHN0aWxsLgotICoqTmVvRm9yZ2UgYW5kIEZhY3RvcmlvIGJvdGggQkxPQ0sqKiBvbiBhIGRlY2xhcmVkIGluY29tcGF0aWJpbGl0eS4gVGhpcyBlbmdpbmUKICBkb2VzIG5vdCwgcGVyIGRlY2lzaW9uIDE4LiBBbiBhdXRob3IncyBkZWNsYXJhdGlvbiBpcyBzaG93biB3aXRoIHRoZWlyIHJlYXNvbgogIGFuZCBuZXZlciBvdmVycmlkZXMgdGhlIHBsYXllcidzIHNldHVwLgo="
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
        text: "The real SDK documentation bundled when this workshop was built. Pick a lesson on the right, or use the advanced references when you need the full contract behind a content file or plugin.js."
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
    return { ...NOTHING, why: "This file is yours, so nothing here has an opinion about what is in it." };
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
 * The entry point. The game imports this and calls what it finds.
 *
 * No imports: a module loaded from a mod folder cannot resolve a package by name.
 * The engine arrives as ctx.core instead, which is the same module instance the
 * game itself is running on.
 */
export default {
  api: 1,

  hooks(ctx) {
    ctx.log?.("hello from a hand-written plugin");
    return {};
  },
};
`;
function filesScreen(shop, path) {
  const main = h("div", { class: "mb-main" });
  const aside = h("div", { class: "mb-aside" });
  const el = h("div", { class: "mb-cols mb-cols-2" }, main, aside);
  const draft = openDraft(shop.store.get());
  if (!draft) {
    main.appendChild(
      empty(
        "?",
        "No mod is open",
        "This screen shows one mod's files, so there is nothing to print yet.",
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
    tip: "Writes a working entry point with nothing in it, so a mod that runs code is one file away. The manifest grows the plugin facet and the ABI number to match, because a mod that ships code without declaring both installs and then does nothing.",
    onClick: () => shop.acts.createFile(PLUGIN, PLUGIN_TEMPLATE)
  });
  const pluginDocs = button({
    label: "Read the plugin API",
    tiny: true,
    kind: "ghost",
    tip: "Open the real SDK reference before you add behaviour to plugin.js.",
    onClick: () => shop.acts.go({ at: "docs", doc: "plugins" })
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
    "Or load one from disk, real bytes and all: ",
    loadFile
  );
  listSection.body.append(
    list,
    h("div", { class: "mb-ed-new" }, newName, add),
    newProblem,
    h("div", { class: "mb-row-actions" }, plugin, pluginDocs),
    loadRow,
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
  const bar = h("div", { class: "mb-row-actions" }, save, overwrite, revert, h("span", { class: "mb-spacer" }), caret, dirty, remove);
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
      onCaret: (line, column) => setText(caret, `line ${line}, column ${column}`)
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
          text: "This is the same mod the other screens edit, printed. Every file here is a file the folder ships, and saving one puts what you wrote back into the mod - so a monster you added on the record screen is in monster.json, and a number you change here is the number that screen shows next time."
        }),
        h("p", {
          text: "It is the way to do the things no screen offers: a script the game runs, a manifest key nothing asks you about, a record file grouped into sections. Pick a file on the right, or add one of your own."
        }),
        h("p", {
          text: "Unsaved text lives in this window and nowhere else. It survives moving between screens and it does not survive reloading the game, so save a file into the mod before you go anywhere."
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
      `${files.length} file${files.length === 1 ? "" : "s"}, ${Math.max(1, Math.round(bytes / 1024))}KB. Unfinished work is kept in a store this install shares with your saves, and the workshop will not use more than ${Math.round(SIZE_CEILING / 1024)}KB of it, so a large file pasted in here is a file to save out as a zip.`
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
      const notes2 = ["Yours. It goes into the mod folder exactly as it is here, byte for byte, and nothing rewrites it."];
      if (refusal !== void 0) notes2.push(refusal);
      setText(about, notes2.join(" "));
      setText(dirty, "saved");
      dirty.dataset["tone"] = "";
      save.disabled = true;
      revert.disabled = true;
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
        `This file carries ${spare.keys.join(", ")}, which the workshop writes through without reading. It ships exactly as typed and nothing on the review screen has checked it.`
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
  return "yours, written through as typed";
}
function aboutKind(kind, path) {
  switch (kind) {
    case "manifest":
      return "The manifest. Saving it puts the fields the details screen shows back into the mod, and keeps every other key exactly as typed - so capabilities, rules and anything else the game understands survive. The id cannot be changed here, because the game treats a renamed mod as a different mod.";
    case "records":
      return `Written from what the mod does to ${path.slice(0, -".json".length)} records. Saving it parses the contributions back into the mod, so the record screens show what you typed here.`;
    default:
      return "Yours. It goes into the mod folder exactly as it is here, and nothing rewrites it.";
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
    return "Quotes, comments and brackets only. This is not a syntax check and there is no compiler in a browser: code that passes here can still be wrong, and the game reports a script it cannot import as a mod that is not working. What it cannot see at all is a mistake inside a template's ${ }, a slash that is a pattern where it looks like a division, and anything that is spelled correctly and means nothing.";
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
    about.length === 0 ? `${standIn ? "The record checks have" : "The game's own record checker has"} nothing to say about this file.` : `${about.length} thing${about.length === 1 ? "" : "s"} ${whose} found here, which is the same checking the record screens show. Click one to go to it.`
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
      text: "All of these work exactly like the ones above. They are down here because a first mod is very rarely a pain message or a room template, not because they are second class."
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
  const unfinishedCard = card({
    title: "Unfinished",
    note: "kept in this install's settings, not in any character's save",
    tip: "Unfinished work does not live in a file. The store it uses can run out of room without saying so, which is why the workshop verifies every write and why a finished mod, saved as a file, is the only save point it will promise you.",
    open: true
  });
  unfinishedCard.body.appendChild(list);
  const el = h("div", { class: "mb-main" }, startCard.el, unfinishedCard.el);
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
          text: "Neither of these writes an answer in. They write the adjustment, so it keeps doing what you meant after a game update retunes the numbers and after another mod has already changed one of them."
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
      tip: "Write the suggested value here. It is a starting point drawn from the game's own records, not an instruction."
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
          tip: "Add another entry just like this one. Cloning something that works is how most content gets made.",
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
  const identityCard = card({ title: "Identity", note: "the name the rest of the modding world will use", open: true });
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
        text: "How much of the game's own content in this file carries each field. A field almost everything has is part of what the thing is."
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
          "Everything below works. Your character on disk is exactly as their last save left them, and reloading the game takes you back to them - anything you do from here is gone when you do."
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
        "These are the game's own debug commands, and using them on a character you are keeping would mean keeping whatever they did to it. So the workshop cuts the session loose from its save slot first, and then nothing at all is written down."
      ),
      h("p", {
        text: who === void 0 || who === "" ? "Nothing is being saved right now in any case, so this costs you nothing." : `${who} keeps whatever their last save left - at most a few seconds of walking behind. Everything after that is discarded, and reloading the game brings them back exactly as they are on disk.`
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
        text: "Everything loaded is the base game's. Content composes when the game loads, so a record you have just written turns up here after you forge the mod and play it - the button in the bar below."
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
      "Daggers that hit harder. A shop with deeper pockets. A monster with three more hit points.",
      "The workshop shows you the record as the game sees it, you nudge a number, and what gets written down is the nudge rather than the answer. That distinction matters more than it looks: three more hit points keeps being what you meant after the base game retunes the monster, and after another mod adjusts it first. A fixed value does not."
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
      "A new sword, a new creature, a new potion. You pick something that already exists to base it on, and the workshop fills the new record in from what its neighbours in the game actually carry, then tells you where every number came from.",
      "It inherits shape and scale and none of its powers. A new orc arrives with the orc's hit points and armour and no attacks at all until you say otherwise, because a tool that handed out a Balrog's breath by accident would be a tool nobody could trust with the easy cases."
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
      "An artifact is not a new kind of item. It is a set of adjustments to an item the game already has, so you are describing the difference rather than the thing.",
      "This is also where the single most common way a first mod fails lives: a field that names another record, spelled slightly wrong. The workshop checks those names against what is actually loaded as you type, and says which file it looked in."
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
      "The most common thing anybody makes is not a new creature. It is a number, moved, across everything of one sort: every potion cheaper, every dragon faster, every shop's purse deeper.",
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
      text: "A mod is a folder with a text file in it. That is the whole idea, and it stays true whether the file is written here or in a text editor. What the workshop does is know what belongs in the file, what the rest of the game already puts there, and which mistakes will not tell you about themselves until you play."
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
          tip: `Open the real SDK document: ${lesson.tutorial}. It builds the same mod with a text editor and pins the finished version with a test.`
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
      text: "The workshop guides record changes, starts a working plugin.js entry point, imports tiles, fonts and sounds as their real bytes, and round-trips sections from record files. It does not invent your plugin's behaviour, preview or validate an asset, or offer a visual editor for sections. The SDK docs below are the path for all of those details."
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
    tip: "Forges it, loads it for this session only, and reloads the game so it takes effect - content always needs a reload. It is not added to your mods and it is gone when you close the game. What it does to the character who plays it is not."
  });
  const install = button({
    label: "Forge and install",
    seal: true,
    onClick: () => void shop.acts.install(),
    tip: "Adds it to your mods for good. Takes effect after a reload, because enabling any mod does."
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
        text: `${size.added} new record${size.added === 1 ? "" : "s"}, ${size.patched} adjusted, ${size.removed} removed, ${current.sections?.length ?? 0} switchable section${(current.sections?.length ?? 0) === 1 ? "" : "s"}, across ${files.length} file${files.length === 1 ? "" : "s"}. Checked against the game exactly as it is loaded right now, mods included, because that is what your changes will actually land on.`
      }),
      ...shop.seams.authoring.demonstration ? [h("p", null, h("b", { text: "These checks are the workshop's own small set, not the game's. " }), shop.seams.authoring.why ?? "")] : []
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
          h("b", { text: "Written through unread. " }),
          `${unchecked.map((entry) => `${entry.path} carries ${entry.keys.join(", ")}`).join("; ")}. The workshop cannot compose or check those, so nothing above is a verdict on them.`
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
        text: "Nothing was refused. Worth knowing that a refused change costs you that change and not the mod, so a mod whose every change was refused installs and does nothing."
      }) : h(
        "ul",
        null,
        ...problems.map((problem) => h("li", { text: problem }))
      )
    );
    const notes = [
      refusal !== void 0 ? h("p", null, h("b", { text: "This one cannot be tried for a session. " }), refusal) : shop.seams.session.available ? h("p", {
        text: "Playing it loads the mod for this session only and reloads the game, because composing content always needs a reload. It is not added to your mods and it is gone when you close the game. It is the real mod and not a preview, so play a character you do not mind changing - next time, with the mod gone, the game treats anything it added as belonging to something not installed."
      }) : h("p", { text: shop.seams.session.why ?? "" }),
      shop.seams.install.available ? h("p", { text: "Installing keeps it, and takes effect after a reload, because enabling any mod does." }) : h("p", { text: shop.seams.install.why ?? "" })
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
    doc: deps.doc,
    core: deps.core,
    ...deps.registries === void 0 ? {} : { registries: deps.registries }
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
    tip: "Take back the last change. Everything you do to a mod is undoable; nothing about the game is touched either way.",
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
    tip: "The SDK's real beginner tutorials and advanced authoring references, bundled into this workshop.",
    onClick: () => deps.acts.go({ at: "docs", doc: "tutorial-01" })
  });
  const about = button({
    label: "About",
    kind: "ghost",
    tiny: true,
    tip: "What ModForge is, in the tool's own words - the same page the launch screen offers on the way in.",
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
      h("label", { class: "mb-switch", tip: "An ink-on-parchment treatment, for anybody who prefers it." }, parchment, h("span", { text: "parchment" })),
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
        return filesScreen(shop, route.path);
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
        tip: "Writes the mod as a zip you can keep, read, edit by hand and give away. Unfinished work lives in this browser's storage, which can quietly run out of room, so this is the only save point the workshop will promise you.",
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
        tip: sessionRefusal(draft) ?? "Forges the mod, loads it for this session only, and reloads the game so it takes effect - content always needs a reload. It is not added to your mods and it is gone when you close the game. What it does to the character who plays it is not, so play one you do not mind changing.",
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
    records: seams.authoring.records,
    core: ctx.core,
    ...ctx.registries === void 0 ? {} : { registries: ctx.registries }
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
