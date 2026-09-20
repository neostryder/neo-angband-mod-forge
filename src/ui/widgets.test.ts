/**
 * @vitest-environment jsdom
 *
 * `listRow`: an action button appended into its own `.mb-row-acts` must not
 * also fire the row's own click, since that button already sits inside the
 * row's `<button>` and a click there bubbles up to it by ordinary DOM rules.
 * See neostryder/neo-angband#170 - the drafts list appended a "Delete" button
 * there, and deleting a draft also reopened the draft just deleted.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDocument } from "./dom.js";
import { button, listRow } from "./widgets.js";

beforeEach(() => {
  useDocument(document);
});

describe("listRow", () => {
  it("does not fire the row's onClick for a click on an action appended into .mb-row-acts, but still fires it for a click on the row itself", () => {
    const onClick = vi.fn();
    const row = listRow({ name: "my-first-mod", onClick });

    /* The same shape a caller uses: find the row's own acts span and append a
     * real button into it, exactly as the drafts list does for "Delete". */
    const acts = row.querySelector(".mb-row-acts");
    if (!acts) throw new Error("listRow did not build a .mb-row-acts span");
    const onDelete = vi.fn();
    acts.appendChild(button({ label: "Delete", onClick: onDelete }));

    const inner = acts.querySelector("button");
    if (!inner) throw new Error("the appended action button is not in the tree");
    inner.click();

    expect(onDelete).toHaveBeenCalledTimes(1);
    /* The whole point: the row's own handler did not also run, which is what
     * would have reopened a draft the click had just deleted. */
    expect(onClick).not.toHaveBeenCalled();

    /* Clicking the row outside its acts span still selects it - the fix has
     * to distinguish where the click landed, not swallow every click. */
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
