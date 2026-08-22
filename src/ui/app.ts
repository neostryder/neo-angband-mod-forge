/**
 * The shell: the frame, the title bar, the status line, and which screen is up.
 *
 * ONE VIEW AT A TIME, disposed on the way out. The routes are cheap to rebuild
 * and expensive to keep warm, and a screen that is not on the screen but is still
 * subscribed to the store is the classic slow leak in a hand-rolled interface.
 * The record editor is the exception in spirit rather than in mechanism: it keeps
 * its field rows in a map across updates, so the caret survives, and it is
 * rebuilt when the route changes because a different record is a different screen.
 *
 * THE ESCAPE LADDER, in order, because Escape means "back out of the innermost
 * thing" and never "throw my work away":
 *
 *  1. a tooltip, if one is showing
 *  2. a level of nesting inside a record
 *  3. the screen, back towards the mod's details
 *  4. the workshop, from the front door
 *
 * There is no step that discards anything, which is the point: the fourth rung
 * only closes a window whose contents were written down on the way in.
 */

import type { AuthoringApi, ComposedRecords } from "../host/authoring.js";
import type { CoreApi, RegistriesLike } from "../host/context.js";
import type { Seams } from "../host/seams.js";
import { fill, h, setText, useDocument } from "./dom.js";
import type { Overlay } from "./overlay.js";
import { installTooltips } from "./tooltip.js";
import type { Tooltips } from "./tooltip.js";
import { baseScreen } from "./screens/base.js";
import { detailsScreen } from "./screens/details.js";
import { kindsScreen } from "./screens/kinds.js";
import { modsScreen } from "./screens/mods.js";
import { rebalanceScreen } from "./screens/rebalance.js";
import { recordScreen } from "./screens/record.js";
import { testScreen } from "./screens/test.js";
import { tourScreen } from "./screens/tour.js";
import { verdictScreen } from "./screens/verdict.js";
import type { Actions } from "./actions.js";
import type { AppState, Route } from "./store.js";
import { openDraft, Store } from "./store.js";
import type { View, Workshop } from "./view.js";
import { button } from "./widgets.js";

export interface AppDeps {
  readonly overlay: Overlay;
  readonly doc: Document;
  readonly store: Store;
  readonly acts: Actions;
  readonly seams: Seams;
  readonly api: AuthoringApi;
  readonly records: ComposedRecords;
  readonly core: CoreApi;
  readonly registries?: RegistriesLike;
}

export interface App {
  dispose(): void;
}

export function mountApp(deps: AppDeps): App {
  useDocument(deps.doc);
  const tips: Tooltips = installTooltips(deps.overlay.root, deps.doc);

  const shop: Workshop = {
    store: deps.store,
    acts: deps.acts,
    seams: deps.seams,
    api: deps.api,
    records: deps.records,
    tips,
    doc: deps.doc,
    core: deps.core,
    ...(deps.registries === undefined ? {} : { registries: deps.registries }),
  };

  /* ---------------------------------------------------------------- *
   * Chrome                                                           *
   * ---------------------------------------------------------------- */

  const illum = h("div", { class: "mb-illum", text: "M" });
  const title = h("h1", { class: "mb-title", text: "Mod Builder" });
  const subtitle = h("p", { class: "mb-subtitle" });

  const parchment = h("input", { type: "checkbox" });
  parchment.addEventListener("change", () => deps.overlay.setParchment(parchment.checked));

  const undo = button({
    label: "Undo",
    kind: "ghost",
    tiny: true,
    tip: "Take back the last change. Everything you do to a mod is undoable; nothing about the game is touched either way.",
    onClick: () => deps.store.undo(),
  });
  const redo = button({ label: "Redo", kind: "ghost", tiny: true, onClick: () => deps.store.redo() });
  const guide = button({
    label: "Guide",
    kind: "ghost",
    tiny: true,
    tip: "The four things people usually make, and where the written tutorials for the same ideas are.",
    onClick: () => deps.acts.go({ at: "tour" }),
  });
  const close = button({
    label: "Close",
    tiny: true,
    tip: "Put the workshop away. Unfinished work is kept; nothing is installed until you say so.",
    onClick: () => deps.acts.close(),
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
      undo,
      redo,
      close,
    ),
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

  /* ---------------------------------------------------------------- *
   * Routing                                                          *
   * ---------------------------------------------------------------- */

  let current: View | undefined;
  let currentKey = "";

  const build = (route: Route): View => {
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
    }
  };

  const keyOf = (route: Route): string => JSON.stringify(route);

  const renderChrome = (state: AppState): void => {
    const draft = openDraft(state);
    setText(subtitle, subtitleFor(state, draft?.name));
    setText(illum, (draft?.name.trim().charAt(0) || "M").toUpperCase());

    undo.disabled = !deps.store.canUndo();
    redo.disabled = !deps.store.canRedo();

    /* The banner is the one thing on screen that cannot be dismissed. It is up
     * whenever the numbers being shown are the workshop's own demonstration
     * content rather than the game's, because every suggestion and every peer
     * table under it is then evidence about a fixture. */
    if (deps.seams.authoring.demonstration) {
      banner.style.display = "";
      fill(
        banner,
        h("b", { text: "Demonstration content. " }),
        h("span", { text: deps.seams.authoring.why ?? "" }),
      );
    } else banner.style.display = "none";

    fill(crumbs, ...crumbTrail(state, draft?.name));

    const notice = state.notice;
    setText(statusText, notice?.text ?? statusFor(state, draft));
    statusText.dataset["tone"] = notice?.tone ?? "plain";

    fill(
      statusActs,
      draft === undefined
        ? null
        : button({
            label: "Save it as a file",
            tiny: true,
            tip:
              "Writes the mod as a zip you can keep, read, edit by hand and give away. Unfinished work lives in " +
              "this browser's storage, which can quietly run out of room, so this is the only save point the " +
              "workshop will promise you.",
            onClick: () => deps.acts.download(),
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
      draft === undefined
        ? null
        : button({
            label: "Try it in the game",
            kind: "primary",
            tiny: true,
            tip:
              "Forges the mod, loads it for this session only, and reloads the game so it takes effect - content " +
              "always needs a reload. It is not added to your mods and it is gone when you close the game. What " +
              "it does to the character who plays it is not, so play one you do not mind changing.",
            onClick: () => void deps.acts.loadForSession(),
          }),
      draft === undefined
        ? null
        : button({
            label: "Review it",
            tiny: true,
            tip: "The errors, the files it would write, and the manifest as it will ship.",
            onClick: () => deps.acts.go({ at: "verdict" }),
          }),
    );
  };

  const crumbTrail = (state: AppState, name: string | undefined): HTMLElement[] => {
    const out: HTMLElement[] = [
      h("button", {
        class: "mb-crumb",
        type: "button",
        text: "My mods",
        on: { click: () => deps.acts.go({ at: "mods" }) },
      }),
    ];
    if (name !== undefined && state.route.at !== "mods" && state.route.at !== "tour") {
      out.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      out.push(
        h("button", {
          class: "mb-crumb",
          type: "button",
          text: name,
          on: { click: () => deps.acts.go({ at: "details" }) },
        }),
      );
    }
    const leaf = leafName(state.route);
    if (leaf !== undefined) {
      out.push(h("span", { class: "mb-crumb-sep", text: ">" }));
      out.push(h("button", { class: "mb-crumb", type: "button", text: leaf, aria: { current: "page" } }));
    }
    return out;
  };

  const render = (next: AppState, prev: AppState): void => {
    renderChrome(next);
    const key = keyOf(next.route);
    if (key !== currentKey || current === undefined) {
      current?.dispose();
      currentKey = key;
      current = build(next.route);
      fill(body, current.el);
      /* Focus the first thing that can take it, which is never the close button:
       * arriving on a screen and finding the cursor on the way out is the sort of
       * detail that makes an interface feel like it was assembled rather than
       * designed. */
      current.el.querySelector<HTMLElement>('input:not([type="checkbox"]), textarea, select, button')?.focus();
      return;
    }
    current.update(next, prev);
  };

  const unsubscribe = deps.store.subscribe((next, prev) => render(next, prev));
  render(deps.store.get(), deps.store.get());

  /* ---------------------------------------------------------------- *
   * Keys                                                            *
   * ---------------------------------------------------------------- */

  deps.overlay.onKey((event) => {
    const state = deps.store.get();
    if (event.key === "Escape") {
      if (tips.hide()) return true;
      const route = state.route;
      if (route.at === "record" && route.path !== "") {
        const up = route.path.split(".").slice(0, -1).join(".");
        deps.acts.go({ at: "record", change: route.change, path: up });
        return true;
      }
      /* THE LADDER HAD NO BOTTOM RUNG while a mod was open, and the bug was
       * invisible because nothing about it looked wrong. `details` satisfied
       * `at !== "mods"`, so Escape there navigated to `details` - the route it was
       * already on. `keyOf` was unchanged, so the screen was updated in place and
       * nothing moved. Escape could therefore never reach `close()` with a mod open,
       * and the title bar's button was the only way out of the workshop.
       *
       * Each rung now names where it goes, and the last two are the ones that were
       * missing: details steps out to the mod list, and the mod list closes. */
      if (route.at === "mods") {
        deps.acts.close();
        return true;
      }
      if (route.at === "details" || state.openId === undefined) {
        deps.acts.go({ at: "mods" });
        return true;
      }
      deps.acts.go({ at: "details" });
      return true;
    }
    const chord = event.ctrlKey || event.metaKey;
    if (chord && event.key.toLowerCase() === "z") {
      if (event.shiftKey) deps.store.redo();
      else deps.store.undo();
      return true;
    }
    if (chord && event.key.toLowerCase() === "y") {
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
    current = undefined;
    tips.dispose();
  });

  return {
    dispose() {
      deps.overlay.close();
    },
  };
}

function subtitleFor(state: AppState, name: string | undefined): string {
  if (state.route.at === "tour") return "What people usually make, and where each one is written down";
  if (name === undefined) return "Make your own mod, without leaving the game";
  const size = Object.keys(state.drafts).length;
  return `${name} - ${size} unfinished mod${size === 1 ? "" : "s"} in this install`;
}

function statusFor(state: AppState, draft: { readonly changes: readonly unknown[] } | undefined): string {
  if (draft === undefined) return "Nothing is open.";
  const verdict = state.verdict;
  if (verdict.broke !== undefined) return `The workshop could not check this: ${verdict.broke}`;
  if (verdict.stale || verdict.revision !== state.revision) return "Checking.";
  if (!verdict.build) return `${draft.changes.length} change${draft.changes.length === 1 ? "" : "s"}.`;
  const errors = verdict.build.findings.filter((f) => f.level === "error").length;
  return errors === 0
    ? `${draft.changes.length} change${draft.changes.length === 1 ? "" : "s"}, and this will install.`
    : `${errors} error${errors === 1 ? "" : "s"} to fix before this will install.`;
}

function leafName(route: Route): string | undefined {
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
    default:
      return undefined;
  }
}
