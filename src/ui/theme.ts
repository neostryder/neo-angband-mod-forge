/**
 * The workshop's look, as one stylesheet inside one shadow root.
 *
 * WHY A SHADOW ROOT. The workshop lives in the same page as the game, and the
 * game's own stylesheet is not this mod's business in either direction: nothing
 * here should be able to restyle the game, and nothing the game or another mod
 * loads should be able to restyle this. An OPEN shadow root, not a closed one -
 * closed buys nothing against code running in the same realm, and open leaves
 * the workshop inspectable, which is worth more than a gesture at privacy.
 *
 * A SHADOW ROOT IS NOT A STYLE RESET. Inheritable properties still cross the
 * boundary, so every layer this mod mounts states its own family, size, line
 * height and colour rather than trusting what the page happens to inherit. The
 * launch and exit layers are siblings of the frame's own scrim and were reading
 * the game's monospace face because of exactly that.
 *
 * NO WEB FONTS. Neo Angband is meant to work offline, and a stylesheet that
 * reaches for a font server is a stylesheet that renders differently the first
 * time somebody opens the workshop on a plane. The display face is a stack of
 * old-style serifs that ship with the three desktop platforms, so the fantasy
 * authority comes from faces the reader already has, and the fallback is a face
 * rather than a shrug.
 *
 * ONE TYPE SCALE, ONE GUTTER, ONE MEASURE. Nine sizes, named for the job rather
 * than the number, and no rule sets a font size any other way. The frame's
 * titlebar, breadcrumb, banner, content and status bar all indent by the same
 * gutter, so the whole window has a single left edge. A screen that is one column
 * caps its width at a reading measure instead of stretching a text field to a
 * thousand pixels, which is what a full-width form actually looks like.
 *
 * WHAT THE FLOURISHES ARE, AND WHAT THEY ARE NOT. Parchment is three low-contrast
 * gradients, an illuminated initial sits on screen titles and nowhere else, and
 * the one irreversible button in the whole workshop wears a wax seal. There are
 * no drifting embers and there is no page-turn transition between screens: both
 * are charming for ninety seconds and then they are in the way of somebody who
 * is forty minutes into editing a table. Motion is 120 to 160 milliseconds of
 * opacity and position, and it is off entirely when the reader has asked for less
 * of it.
 *
 * DARK IS THE DEFAULT because the game behind this is a black canvas, and a
 * bright panel over black is a lamp pointed at the reader. Parchment is offered
 * and it lays an opaque ground under itself so it never reads as translucent
 * paper over a dungeon.
 */

export const THEME_CSS = `
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
  --fs-micro: 11px;   /* a rule id, a count, a measured share */
  --fs-small: 12px;   /* a note, a tag, a table cell, a breadcrumb */
  --fs-ui: 13px;      /* anything the reader operates: controls and list rows */
  --fs-body: 14px;    /* running text */
  --fs-title: 15px;   /* the title on a card */
  --fs-head: 17px;    /* a heading inside a screen */
  --fs-screen: 20px;  /* the screen's own title */
  --fs-brand: 28px;   /* the illuminated initial */
  --fs-hero: 34px;    /* the launch mark, and an empty state's glyph */
  --fs-mark: 42px;    /* the launch screen's own initial, and nothing else */

  --r-sm: 3px;
  --r: 5px;
  --r-lg: 9px;
  --gap: 12px;
  --pad: 16px;
  /* One indent for the titlebar, the breadcrumb, the banner, the content and the
   * status bar, so the window has a single left edge instead of five. */
  --gutter: 16px;
  /* How wide a screen that is one column lets itself get. A form whose text
   * fields are a thousand pixels wide is a form nobody laid out. */
  --page: 900px;
  /* How wide one control gets, so a select holding the word "add" stops being
   * the widest thing on the screen. */
  --control: 560px;

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
  padding: clamp(0px, 2vmin, 26px);
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
  grid-template-columns: minmax(200px, 250px) minmax(0, 1fr) minmax(240px, 320px);
  min-height: 0;
}
.mb-cols.mb-cols-2 { grid-template-columns: minmax(0, 1fr) minmax(260px, 340px); }
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
 * capping it again would take width it needs. Left, not centred: the titlebar,
 * the breadcrumb and the status bar all start at the gutter, and a centred
 * column would be the only thing on screen that does not. */
.mb-body > .mb-main { max-width: var(--page); }

@media (max-width: 1080px) {
  .mb-cols, .mb-cols.mb-cols-2 { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 1fr auto; }
  .mb-rail { border-right: 0; border-bottom: 1px solid var(--edge); max-height: 26vh; }
  .mb-aside { border-left: 0; border-top: 1px solid var(--edge); max-height: 34vh; }
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
