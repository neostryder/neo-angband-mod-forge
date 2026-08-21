/**
 * What you can make, and how its fields are laid out.
 *
 * TWO PROBLEMS, ONE FILE. There are forty-odd record files, and a player who has
 * never modded anything wants about a dozen of them; the rest are real but they
 * are not where anybody starts. And a monster carries up to thirty-three
 * top-level fields, which as one flat list is a wall nobody reads.
 *
 * THE ANSWER TO BOTH IS THE SAME SHAPE: a small hand-written configuration for
 * the kinds people actually reach for, and a generic classifier for everything
 * else. Forty-one bespoke editors would be forty-one things to keep in step with
 * the game's data, and the thirty-ninth would be wrong.
 *
 * THE ORDER OF THE FEATURED LIST IS NOT ALPHABETICAL AND NOT A GUESS. It is
 * ordered by what modding communities actually produce, which across two very
 * large ones is steeply weighted towards the mundane: retunes of an existing
 * number, one new item that is a rebalanced clone of an existing item, one new
 * creature that is a nastier cousin of an existing creature, and a shop that
 * stocks it. Whole overhauls exist and are rare. So the first four rows are
 * items, creatures, shops and character classes, and "everything else" is one row
 * rather than thirty-seven.
 */

import type { AuthoringApi, FieldShape } from "../host/authoring.js";

/** The groups a record's fields are sorted into, in the order they are shown. */
export const FIELD_GROUPS = [
  "essentials",
  "identity",
  "combat",
  "traits",
  "references",
  "generation",
  "presentation",
  "tables",
  "advanced",
] as const;

export type FieldGroup = (typeof FIELD_GROUPS)[number];

export const GROUP_TITLES: Readonly<Record<FieldGroup, string>> = {
  essentials: "Essentials",
  identity: "Identity and place",
  combat: "Combat and effect",
  traits: "Traits and flags",
  references: "What it points at",
  generation: "Where it turns up",
  presentation: "How it looks and reads",
  tables: "Lists and tables",
  advanced: "Everything else",
};

export const GROUP_BLURBS: Readonly<Record<FieldGroup, string>> = {
  essentials: "The handful of fields that decide what this thing is. Get these right and the rest can wait.",
  identity: "What it is called, what family it belongs to, and roughly where it sits.",
  combat: "What it does in a fight, or what it does when it is used.",
  traits: "Named properties. Ticking one is the safest kind of change: another mod ticking a different one keeps both.",
  references: "Fields that name another record. A name nothing defines is the single most common way a first mod fails.",
  generation: "How often and how deep the game will produce it on its own.",
  presentation: "The letter, the colour, and the words the player reads.",
  tables: "Fields that hold a list. Adding a row composes with other mods; replacing the list does not.",
  advanced: "Fields core uses rarely. Nothing here is wrong, it is just not where to start.",
};

/** One content kind, as the picker shows it. */
export interface ContentKind {
  readonly file: string;
  readonly title: string;
  /** One line, in a player's words. Falls back to the engine's own summary. */
  readonly blurb: string;
  /** An emoji-free single character for the kind's badge. */
  readonly badge: string;
  /** The fields to put in the Essentials card, in order. */
  readonly essentials: readonly string[];
  /** True for a kind a first-time author is likely to want. */
  readonly featured: boolean;
}

const FEATURED: readonly ContentKind[] = [
  {
    file: "object",
    title: "Items",
    blurb: "Weapons, armour, potions, scrolls, rings: anything that can be picked up and carried.",
    badge: "|",
    essentials: ["name", "type", "level", "cost", "weight"],
    featured: true,
  },
  {
    file: "monster",
    title: "Creatures",
    blurb: "One record is one kind of thing that can be met, from a rat to something with a name.",
    badge: "o",
    essentials: ["name", "base", "depth", "hit-points", "speed", "armor-class", "experience"],
    featured: true,
  },
  {
    file: "store",
    title: "Shops",
    blurb: "What each shop stocks, who runs it, and how deep their purse is.",
    badge: "1",
    essentials: ["store", "slots", "turnover"],
    featured: true,
  },
  {
    file: "class",
    title: "Character classes",
    blurb: "What a Warrior or a Priest can do: their spells, their skills, and what they start with.",
    badge: "@",
    essentials: ["name", "stats", "skill-disarm-phys", "max-attacks"],
    featured: true,
  },
  {
    file: "artifact",
    title: "Artifacts",
    blurb: "A one-of-a-kind version of an item the game already has. Adjustments, not a new thing.",
    badge: "*",
    essentials: ["name", "base-object", "level", "cost", "weight"],
    featured: true,
  },
  {
    file: "ego_item",
    title: "Item qualities",
    blurb: "The of-Slay-Evil half of an item's name. Declares which kinds it can land on.",
    badge: "+",
    essentials: ["name", "type", "level", "cost", "rating"],
    featured: true,
  },
  {
    file: "monster_base",
    title: "Creature families",
    blurb: "The families creatures belong to. A creature names one and inherits its letter and its feel.",
    badge: "a",
    essentials: ["name", "glyph", "pain", "desc"],
    featured: true,
  },
  {
    file: "p_race",
    title: "Player races",
    blurb: "What a Dwarf or a Hobbit starts with, and what they are good at.",
    badge: "h",
    essentials: ["name", "stats", "hitdie", "exp"],
    featured: true,
  },
  {
    file: "terrain",
    title: "Terrain",
    blurb: "Floors, walls, doors, rubble and stairs: what a square of the dungeon is.",
    badge: "#",
    essentials: ["name", "code", "graphics", "flags"],
    featured: true,
  },
  {
    file: "trap",
    title: "Traps",
    blurb: "What is waiting on the floor, and what it does when it goes off.",
    badge: "^",
    essentials: ["name", "graphics", "rarity", "effect"],
    featured: true,
  },
  {
    file: "monster_spell",
    title: "Creature spells",
    blurb: "What a caster can throw at you, and what the player is told when it lands.",
    badge: "?",
    essentials: ["name", "hit", "effect", "lore"],
    featured: true,
  },
  {
    file: "brand",
    title: "Brands and slays",
    blurb: "A weapon that burns, or that bites harder into one kind of creature.",
    badge: "!",
    essentials: ["code", "name", "verb", "multiplier"],
    featured: true,
  },
];

const BY_FILE = new Map<string, ContentKind>(FEATURED.map((kind) => [kind.file, kind]));

/** Every kind the engine can compose per record, featured ones first. */
export function contentKinds(api: AuthoringApi): readonly ContentKind[] {
  const out: ContentKind[] = [];
  for (const kind of FEATURED) {
    if (api.blueprintFor(kind.file) !== undefined) out.push(kind);
  }
  for (const file of api.BLUEPRINT_FILES) {
    if (BY_FILE.has(file)) continue;
    if (!composable(file)) continue;
    out.push(generic(api, file));
  }
  return out;
}

/**
 * Three files are not addressable per record, and the workshop does not offer
 * them.
 *
 * `constants` and `visuals` are configuration singletons where the whole file IS
 * the meaning, and `history` has no per-record identity at all - a history
 * record is a chart entry and a phrase, and every part of that is something a
 * mod would legitimately change. Shipping one of them means "use mine instead of
 * the game's", which the project builder promotes to a hard error. That is the
 * format being honest about identity rather than a gap to close.
 */
export function composable(file: string): boolean {
  return file !== "constants" && file !== "visuals" && file !== "history";
}

function generic(api: AuthoringApi, file: string): ContentKind {
  const blurb = api.describeFile(file).split("\n")[0] ?? `Records in ${file}.json.`;
  const usage = api.fieldUsage(file);
  const essentials = usage
    .filter((entry) => entry.share >= 0.9)
    .slice(0, 6)
    .map((entry) => entry.name);
  return {
    file,
    title: humanFile(file),
    blurb,
    badge: (file[0] ?? "?").toUpperCase(),
    essentials: essentials.length > 0 ? essentials : ["name"],
    featured: false,
  };
}

function humanFile(file: string): string {
  const words = file.split("_");
  const first = words[0] ?? file;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...words.slice(1)].join(" ");
}

/** The kind record for one file, generated when it is not one of the featured. */
export function kindFor(api: AuthoringApi, file: string): ContentKind {
  return BY_FILE.get(file) ?? generic(api, file);
}

/* ------------------------------------------------------------------ *
 * Sorting a record's fields into groups                               *
 * ------------------------------------------------------------------ */

const NAME_RULES: readonly { readonly group: FieldGroup; readonly test: RegExp }[] = [
  { group: "presentation", test: /^(desc|graphics|color|colour|glyph|msg|lore|verb|message|name-|text)/ },
  { group: "generation", test: /^(alloc|rarity|depth|level|common|minmax|turnover|slots|freq|prob|weight-)/ },
  { group: "combat", test: /^(attack|armor|armour|blow|effect|damage|dice|hit|to-|multiplier|power|rating|mana|fail)/ },
  { group: "traits", test: /^(flags|values|flags-off|resist|ignore|curse|brand|slay)/ },
  { group: "references", test: /^(base|type|code|base-object|item|kind|store|body|shape|mimic|friends|drop|act)/ },
];

const TABLE_KINDS: ReadonlySet<string> = new Set(["array"]);

/**
 * Which group one field belongs to.
 *
 * Name first, shape second. A field called `alloc` is about where a thing turns
 * up whether it is an object or a number, and a field nothing recognises is
 * sorted by what it holds, which is the only thing left to go on.
 */
export function groupOf(kind: ContentKind, field: string, shape: FieldShape | undefined): FieldGroup {
  if (kind.essentials.includes(field)) return "essentials";
  for (const rule of NAME_RULES) {
    if (rule.test.test(field)) return rule.group;
  }
  if (shape) {
    const first = shape.types[0];
    if (first !== undefined && TABLE_KINDS.has(first)) return "tables";
    if (first === "object") return "tables";
    /* A field almost every record carries is part of what the thing IS, whatever
     * it is called. A field one record in twenty carries is not where to start. */
    if (shape.count > 0) return "identity";
  }
  return "advanced";
}

/**
 * The fields to show, in groups, for one record.
 *
 * Every field the record HAS is included even when the blueprint has never seen
 * it, because a hand-edited mod brought back into the workshop must not lose a
 * field just because the workshop did not recognise it. That is the whole of the
 * promise that the workshop never owns anything the folder does not contain.
 */
export function groupFields(
  api: AuthoringApi,
  kind: ContentKind,
  present: readonly string[],
  showAll: boolean,
): ReadonlyMap<FieldGroup, readonly string[]> {
  const blueprint = api.blueprintFor(kind.file);
  const known = blueprint ? Object.keys(blueprint.fields) : [];
  const universe = showAll ? [...new Set([...present, ...known])] : [...new Set([...present, ...kind.essentials])];

  const out = new Map<FieldGroup, string[]>();
  for (const group of FIELD_GROUPS) out.set(group, []);
  for (const field of universe) {
    const group = groupOf(kind, field, blueprint?.fields[field]);
    out.get(group)?.push(field);
  }
  for (const group of FIELD_GROUPS) {
    const list = out.get(group);
    if (!list) continue;
    if (group === "essentials") {
      /* Essentials keep the hand-written order, because that order is the point:
       * it is a reading order for what the thing is. */
      list.sort((a, b) => kind.essentials.indexOf(a) - kind.essentials.indexOf(b));
    } else list.sort((a, b) => a.localeCompare(b));
    if (list.length === 0) out.delete(group);
  }
  return out;
}
