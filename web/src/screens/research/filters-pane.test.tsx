import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ReactNode, useEffect } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/classification-client";
import type { UniverseList, UniverseSummary } from "../../api/classification-types";
import { toListParams } from "../../api/research-query";
import { FILTERS } from "./copy";
import { FiltersPane, type FiltersPaneProps } from "./filters-pane";
import { useResearchQuery } from "./use-research-query";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listUniverses: vi.fn(), listClassifications: vi.fn() };
});

const UNIVERSES: UniverseList = {
  universes: [
    {
      universeId: "u1",
      name: "Tech",
      lifecycle: "active",
      memberCount: 3,
      createdAt: "2026-10-15T17:46:00Z",
      retiredAt: null,
    },
    {
      universeId: "u2",
      name: "Dividend growers",
      lifecycle: "active",
      memberCount: 12,
      createdAt: "2026-10-16T17:46:00Z",
      retiredAt: null,
    },
  ],
  activeCount: 2,
  retiredCount: 0,
  nextCursor: null,
};

const FULL_QUERY =
  "?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&growth.measure=standardisedScore&growth.direction=atMost&growth.value=1.5&hide_incomplete=true&symbol=AA&sort=value_percentile&order=desc";

/**
 * Stands in for the results host (CAP-002-E4-S9): one list request per
 * `query`, keyed on the hook's stable identity, and the search string on show
 * (DEC-0156, Open Gap 1).
 */
function ListProbe() {
  const { query } = useResearchQuery();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    void client.listClassifications(toListParams(query));
  }, [query]);
  return (
    <>
      <output data-testid="search">{location.search.replace(/^\?/, "")}</output>
      <button type="button" onClick={() => navigate(-1)}>
        probe back
      </button>
    </>
  );
}

function renderPane(url = "", props: Partial<FiltersPaneProps> = {}, children?: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[`/research${url}`]}>
      <FiltersPane {...props}>{children}</FiltersPane>
      <ListProbe />
    </MemoryRouter>,
  );
}

const listCalls = () => vi.mocked(client.listClassifications).mock.calls;
const search = () => screen.getByTestId("search").textContent;
const lookIn = () => screen.getByRole("combobox", { name: /^Look in: / });
const findStock = () => screen.getByRole("textbox", { name: "Find a stock" });
const clearFilters = () => screen.queryByRole("button", { name: "Clear filters" });
const hideIncomplete = () =>
  screen.getByRole("checkbox", { name: "Hide stocks with an incomplete score" });

/** Waits for the initial list request and the universes, then forgets the request. */
async function settled(): Promise<void> {
  await waitFor(() => expect(listCalls().length).toBe(1));
  await screen.findByRole("option", { name: "Tech" });
  vi.mocked(client.listClassifications).mockClear();
}

beforeEach(() => {
  vi.mocked(client.listUniverses).mockReset();
  vi.mocked(client.listClassifications).mockReset();
  vi.mocked(client.listUniverses).mockResolvedValue(UNIVERSES);
});

// Implements TC-COMP-135 (DAC-E4-S5-2, DAC-E4-3, AC-16): one request per change, URL updated, changes accumulate.
describe("TC-COMP-135: one list request per filter change, URL updated", () => {
  it("issues exactly one request per change, each carrying the mapped parameters of every change so far", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    // (a) a universe in Look in
    await user.selectOptions(lookIn(), "u1");
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ universeId: "u1" });
    expect(search()).toContain("scope=u1");

    // (b) value percentile at least 80, committed on blur
    await user.type(screen.getByRole("textbox", { name: "Value threshold" }), "80");
    await user.tab();
    expect(listCalls().length).toBe(2);
    expect(listCalls()[1]?.[0]).toEqual({ universeId: "u1", valuePercentileMin: "80" });
    expect(search()).toContain("value.measure=percentile&value.direction=atLeast&value.value=80");

    // (c) momentum standardised score at most -0.5: several factors at once
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Measure for momentum" }),
      "standardisedScore",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Direction for momentum" }),
      "atMost",
    );
    expect(listCalls().length).toBe(2);
    await user.type(screen.getByRole("textbox", { name: "Value threshold for momentum" }), "-0.5");
    await user.tab();
    expect(listCalls().length).toBe(3);
    expect(listCalls()[2]?.[0]).toEqual({
      universeId: "u1",
      valuePercentileMin: "80",
      momentumScoreMax: "-0.5",
    });

    // (d) hide incomplete
    await user.click(hideIncomplete());
    expect(listCalls().length).toBe(4);
    expect(listCalls()[3]?.[0]).toEqual({
      universeId: "u1",
      valuePercentileMin: "80",
      momentumScoreMax: "-0.5",
      hideIncomplete: true,
    });
    expect(search()).toContain("hide_incomplete=true");

    // (e) Find a stock: typing issues nothing, Enter issues one
    await user.type(findStock(), "aa");
    expect(listCalls().length).toBe(4);
    await user.keyboard("{Enter}");
    expect(listCalls().length).toBe(5);
    expect(listCalls()[4]?.[0]).toEqual({
      universeId: "u1",
      valuePercentileMin: "80",
      momentumScoreMax: "-0.5",
      hideIncomplete: true,
      symbol: "AA",
    });
    expect(search()).toContain("symbol=AA");
  });

  it("a threshold value committed on Enter issues one request, and the following blur none (DEC-0157)", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.type(screen.getByRole("textbox", { name: "Value threshold" }), "80");
    await user.keyboard("{Enter}");
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ valuePercentileMin: "80" });
    expect(search()).toBe("value.measure=percentile&value.direction=atLeast&value.value=80");

    await user.tab();
    expect(listCalls().length).toBe(1);
  });

  it("blanking a threshold drops that factor's sentence from the URL and the request, in one request", async () => {
    const user = userEvent.setup();
    renderPane(
      "?value.measure=percentile&value.direction=atLeast&value.value=80&growth.measure=standardisedScore&growth.direction=atMost&growth.value=1.5",
    );
    await settled();

    await user.clear(screen.getByRole("textbox", { name: "Value threshold" }));
    await user.tab();

    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ growthScoreMax: "1.5" });
    expect(search()).toBe(
      "growth.measure=standardisedScore&growth.direction=atMost&growth.value=1.5",
    );
  });

  it("never requests the list itself: without a host, no request is made", async () => {
    render(
      <MemoryRouter initialEntries={["/research?symbol=AA"]}>
        <FiltersPane />
      </MemoryRouter>,
    );
    await screen.findByRole("option", { name: "Tech" });

    expect(listCalls().length).toBe(0);
  });
});

// Implements TC-COMP-136 (DAC-E4-S5-3, DAC-E4-3, AC-16): Clear filters resets every filter and keeps the sort.
describe("TC-COMP-136: Clear filters resets filters and keeps sort", () => {
  it("issues one request with the defaults plus the sort, writes only the sort and the unowned key, resets every control", async () => {
    const user = userEvent.setup();
    renderPane(`${FULL_QUERY}&tab=history`);
    await settled();
    expect(clearFilters()).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ sort: "value_percentile", order: "desc" });
    expect(search()).toBe("tab=history&sort=value_percentile&order=desc");
    expect(lookIn()).toHaveValue("");
    expect(lookIn()).toHaveDisplayValue("All followed stocks");
    for (const factor of ["value", "growth", "momentum"]) {
      expect(screen.getByRole("combobox", { name: `Measure for ${factor}` })).toHaveValue(
        "percentile",
      );
      expect(screen.getByRole("combobox", { name: `Direction for ${factor}` })).toHaveValue(
        "atLeast",
      );
    }
    expect(screen.getByRole("textbox", { name: "Value threshold" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Value threshold for growth" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Value threshold for momentum" })).toHaveValue("");
    expect(hideIncomplete()).not.toBeChecked();
    expect(findStock()).toHaveValue("");
    expect(clearFilters()).not.toBeInTheDocument();
  });

  it("also empties an uncommitted Find a stock draft and its error", async () => {
    const user = userEvent.setup();
    renderPane("?scope=u1");
    await settled();
    await user.type(findStock(), "1!");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(findStock()).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(search()).toBe("");
    expect(listCalls().length).toBe(1);
  });

  it("also resets an uncommitted threshold draft and its field error on a row with no sentence", async () => {
    const user = userEvent.setup();
    renderPane("?scope=u1");
    await settled();
    await user.type(screen.getByRole("textbox", { name: "Value threshold for growth" }), "abc");
    await user.tab();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(listCalls().length).toBe(0);

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    const growth = screen.getByRole("textbox", { name: "Value threshold for growth" });
    expect(growth).toHaveValue("");
    expect(growth).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(search()).toBe("");
    expect(listCalls().length).toBe(1);
  });

  it("also resets select-only changes on a row with no committed sentence", async () => {
    const user = userEvent.setup();
    renderPane("?symbol=AA");
    await settled();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Measure for growth" }),
      "standardisedScore",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Direction for growth" }),
      "atMost",
    );
    expect(listCalls().length).toBe(0);

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByRole("combobox", { name: "Measure for growth" })).toHaveValue("percentile");
    expect(screen.getByRole("combobox", { name: "Direction for growth" })).toHaveValue("atLeast");
    expect(search()).toBe("");
    expect(listCalls().length).toBe(1);
  });

  it("is not rendered when only a sort is set: sort is not a filter", async () => {
    renderPane("?sort=symbol");
    await settled();

    expect(clearFilters()).not.toBeInTheDocument();
  });
});

// T006: pane behaviour (AC-16, DAC-E4-3, DAC-E4-S5-2, DAC-E4-S5-3; DEC-0156 to DEC-0158).
describe("FiltersPane behaviour", () => {
  it("(a) is the Filters section: heading, then the controls top to bottom in the design's order", async () => {
    renderPane("?symbol=AA");
    await settled();

    const section = screen.getByRole("region", { name: "Filters" });
    expect(
      within(section).getByRole("heading", { level: 2, name: "Find stocks" }),
    ).toBeInTheDocument();
    const nameOf = (control: Element): string =>
      (
        control.getAttribute("aria-label") ??
        (control.id ? section.querySelector(`label[for="${control.id}"]`)?.textContent : null) ??
        control.textContent ??
        ""
      ).trim();
    const controls = Array.from(section.querySelectorAll("input, select, button")).map(nameOf);
    expect(controls).toEqual([
      "Find a stock",
      "Look in: All followed stocks",
      "Measure for value",
      "Direction for value",
      "Value threshold",
      "Measure for growth",
      "Direction for growth",
      "Value threshold for growth",
      "Measure for momentum",
      "Direction for momentum",
      "Value threshold for momentum",
      "Hide stocks with an incomplete score",
      "Clear filters",
    ]);
    expect(findStock()).toHaveAttribute("placeholder", "Symbol");
    expect(within(section).getByText(FILTERS.percentileHelper)).toBeInTheDocument();
    const helper = within(section).getByText(FILTERS.hideIncompleteHelper);
    expect(hideIncomplete().getAttribute("aria-describedby")).toBe(helper.id);
  });

  it("(a) sizes the Hide incomplete box and its target from the theme: a --space-4 box in a --control-min-target row", async () => {
    renderPane();
    await settled();

    expect(hideIncomplete()).toHaveClass("h-4", "w-4");
    expect(hideIncomplete().closest("label")?.style.minHeight).toBe("var(--control-min-target)");
  });

  it("(a) types no owner-facing string in the component: every one is read from copy.ts", () => {
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "filters-pane.tsx"),
      "utf-8",
    );
    expect(source).toMatch(/from "\.\/copy"/);
    expect(source).not.toMatch(/aria-label="/);
    expect(source).not.toMatch(/placeholder="/);
    expect(source).not.toMatch(/>\s*[A-Z][a-z]+[^<{]*</);
  });

  it("(b) lists All followed stocks with the count, then each active universe, and always has a value", async () => {
    renderPane("", { activeInstruments: 2993 });
    await settled();

    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks · 2993", "Tech", "Dividend growers"]);
    expect(lookIn()).toHaveAccessibleName("Look in: All followed stocks");
    expect(lookIn()).toHaveValue("");
    expect((lookIn() as HTMLSelectElement).selectedIndex).toBe(0);
    expect(vi.mocked(client.listUniverses).mock.calls).toEqual([[{ lifecycle: "active" }]]);
  });

  it("(b) lists every active universe across the list's pages by following next_cursor (DEC-0235)", async () => {
    const third: UniverseSummary = {
      universeId: "u3",
      name: "Growth",
      lifecycle: "active",
      memberCount: 5,
      createdAt: "2026-10-17T17:46:00Z",
      retiredAt: null,
    };
    vi.mocked(client.listUniverses)
      .mockResolvedValueOnce({ ...UNIVERSES, activeCount: 3, nextCursor: "c1" })
      .mockResolvedValueOnce({
        universes: [third],
        activeCount: 3,
        retiredCount: 0,
        nextCursor: null,
      });
    renderPane("?scope=u3");
    await screen.findByRole("option", { name: "Growth" });

    expect(vi.mocked(client.listUniverses).mock.calls).toEqual([
      [{ lifecycle: "active" }],
      [{ lifecycle: "active", cursor: "c1" }],
    ]);
    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks", "Tech", "Dividend growers", "Growth"]);
    expect(lookIn()).toHaveValue("u3");
    expect(lookIn()).toHaveAccessibleName("Look in: Growth");
  });

  it("(b) reads just All followed stocks when the count is unknown, and names the chosen universe", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();
    expect(within(lookIn()).getAllByRole("option")[0]).toHaveTextContent(/^All followed stocks$/);

    await user.selectOptions(lookIn(), "u2");

    expect(screen.getByRole("combobox", { name: "Look in: Dividend growers" })).toHaveValue("u2");
  });

  it("(c) choosing All followed stocks after a universe removes scope from the URL", async () => {
    const user = userEvent.setup();
    renderPane("?scope=u1");
    await settled();

    await user.selectOptions(lookIn(), "");

    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({});
    expect(search()).toBe("");
  });

  it("(d) without Look in, a scope in the URL is read, kept by every change and by Clear filters, and never written", async () => {
    const user = userEvent.setup();
    renderPane("?scope=u1", { showLookIn: false }, <p>Members as of</p>);
    await waitFor(() => expect(listCalls().length).toBe(1));
    vi.mocked(client.listClassifications).mockClear();
    expect(screen.queryByRole("combobox", { name: /^Look in/ })).not.toBeInTheDocument();
    expect(client.listUniverses).not.toHaveBeenCalled();

    await user.click(hideIncomplete());
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ universeId: "u1", hideIncomplete: true });
    expect(search()).toBe("scope=u1&hide_incomplete=true");

    const slot = screen.getByText("Members as of");
    const button = screen.getByRole("button", { name: "Clear filters" });
    expect(slot.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(button);
    expect(listCalls().length).toBe(2);
    expect(listCalls()[1]?.[0]).toEqual({ universeId: "u1" });
    expect(search()).toBe("scope=u1");
    expect(clearFilters()).not.toBeInTheDocument();
  });

  it("(d) renders children above Clear filters with Look in too", async () => {
    renderPane("?symbol=AA", {}, <p>Members as of</p>);
    await settled();

    const slot = screen.getByText("Members as of");
    const button = screen.getByRole("button", { name: "Clear filters" });
    expect(slot.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(lookIn().compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each([
    ["", false],
    ["?sort=symbol", false],
    ["?scope=u1", true],
    ["?growth.measure=percentile&growth.direction=atMost&growth.value=20", true],
    ["?hide_incomplete=true", true],
    ["?symbol=AA", true],
  ])("(e) at %j Clear filters is rendered: %s", async (url, rendered) => {
    renderPane(url);
    await settled();

    expect(clearFilters() !== null).toBe(rendered);
  });

  it("(e) without Look in, a scope alone does not make Clear filters appear", async () => {
    renderPane("?scope=u1", { showLookIn: false });
    await waitFor(() => expect(listCalls().length).toBe(1));

    expect(clearFilters()).not.toBeInTheDocument();
  });

  it("(f) Find a stock commits once on Enter and once on blur, nothing on an unchanged blur", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.type(findStock(), "ms");
    await user.keyboard("{Enter}");
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ symbol: "MS" });
    expect(search()).toBe("symbol=MS");

    await user.tab();
    expect(listCalls().length).toBe(1);

    await user.click(findStock());
    await user.type(findStock(), "ft");
    await user.tab();
    expect(listCalls().length).toBe(2);
    expect(listCalls()[1]?.[0]).toEqual({ symbol: "MSFT" });
  });

  it("(f) Esc empties Find a stock and commits no search", async () => {
    const user = userEvent.setup();
    renderPane("?symbol=AA");
    await settled();
    expect(findStock()).toHaveValue("AA");

    await user.click(findStock());
    await user.keyboard("{Escape}");

    expect(findStock()).toHaveValue("");
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({});
    expect(search()).toBe("");
  });

  it("(f) Esc empties an uncommitted Find a stock draft without a write when the URL has no search", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.type(findStock(), "ms");
    await user.keyboard("{Escape}");

    expect(findStock()).toHaveValue("");
    expect(listCalls().length).toBe(0);
    expect(search()).toBe("");
  });

  it("(f) a malformed symbol is a field error with the design's reason and no write", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.type(findStock(), "1!");
    await user.keyboard("{Enter}");

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("1!: not a valid symbol format");
    expect(findStock()).toHaveAttribute("aria-invalid", "true");
    expect(findStock().getAttribute("aria-describedby")?.split(" ")).toContain(alert.id);
    expect(listCalls().length).toBe(0);
    expect(search()).toBe("");
  });

  it("(g) focus stays on the control that changed", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.selectOptions(lookIn(), "u1");
    expect(document.activeElement).toBe(lookIn());

    const measure = screen.getByRole("combobox", { name: "Measure for growth" });
    await user.selectOptions(measure, "standardisedScore");
    expect(document.activeElement).toBe(measure);

    await user.click(hideIncomplete());
    expect(document.activeElement).toBe(hideIncomplete());

    await user.type(screen.getByRole("textbox", { name: "Value threshold" }), "80");
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("combobox", { name: "Measure for growth" }),
    );
  });

  it("(g) after Clear filters focus moves to Find a stock", async () => {
    const user = userEvent.setup();
    renderPane("?symbol=AA");
    await settled();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(clearFilters()).not.toBeInTheDocument();
    expect(document.activeElement).toBe(findStock());
  });

  it("(h) back navigation restores the earlier URL and the controls show the earlier values", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();

    await user.selectOptions(lookIn(), "u1");
    await user.click(hideIncomplete());
    expect(search()).toBe("scope=u1&hide_incomplete=true");

    await user.click(screen.getByRole("button", { name: "probe back" }));
    expect(search()).toBe("scope=u1");
    expect(hideIncomplete()).not.toBeChecked();
    expect(lookIn()).toHaveValue("u1");

    await user.click(screen.getByRole("button", { name: "probe back" }));
    expect(search()).toBe("");
    expect(lookIn()).toHaveValue("");
  });

  it("(h) back navigation over a search restores the earlier symbol in Find a stock", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();
    await user.type(findStock(), "aa");
    await user.keyboard("{Enter}");
    await user.clear(findStock());
    await user.type(findStock(), "ms");
    await user.keyboard("{Enter}");
    expect(search()).toBe("symbol=MS");

    await user.click(screen.getByRole("button", { name: "probe back" }));

    expect(search()).toBe("symbol=AA");
    expect(findStock()).toHaveValue("AA");
  });

  it("(h) back navigation over a search clears a shown field error along with the text it belonged to", async () => {
    const user = userEvent.setup();
    renderPane();
    await settled();
    await user.type(findStock(), "aa");
    await user.keyboard("{Enter}");
    await user.clear(findStock());
    await user.type(findStock(), "1!");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(search()).toBe("symbol=AA");

    await user.click(screen.getByRole("button", { name: "probe back" }));

    expect(search()).toBe("");
    expect(findStock()).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("(i) an unlisted scope adds a selected Unavailable universe option and writes nothing", async () => {
    renderPane("?scope=gone");
    await settled();

    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks", "Tech", "Dividend growers", "Unavailable universe"]);
    expect(lookIn()).toHaveValue("gone");
    expect(lookIn()).toHaveAccessibleName("Look in: Unavailable universe");
    expect(listCalls().length).toBe(0);
    expect(search()).toBe("scope=gone");
  });

  it("(i) a URL scope reads Loading universes… until the list has loaded (DEC-0237)", async () => {
    vi.mocked(client.listUniverses).mockReturnValue(new Promise(() => {}));
    renderPane("?scope=u1");
    await waitFor(() => expect(listCalls().length).toBe(1));

    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks", "Loading universes…"]);
    expect(lookIn()).toHaveValue("u1");
    expect(lookIn()).toHaveAccessibleName("Look in: Loading universes…");
  });

  it("(i) after the list has failed, a URL scope reads the failure's label, not Unavailable universe (DEC-0237)", async () => {
    vi.mocked(client.listUniverses).mockRejectedValue(new Error("fetch failed"));
    renderPane("?scope=u1");
    await screen.findByRole("alert");

    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks", "Could not load your universes"]);
    expect(lookIn()).toHaveValue("u1");
  });

  it("(j) a failed universe list leaves All followed stocks usable and says so without the envelope message", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listUniverses).mockRejectedValue(
      new client.ClassificationApiError("The envelope message", "req-1", {
        code: null,
        operation: "list-universes",
        resource: "universe",
      }),
    );
    renderPane();
    await waitFor(() => expect(listCalls().length).toBe(1));
    vi.mocked(client.listClassifications).mockClear();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Could not load your universes: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(alert.textContent).not.toContain("The envelope message");
    expect(
      within(lookIn())
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["All followed stocks"]);
    expect(lookIn()).toHaveValue("");

    await user.click(hideIncomplete());
    expect(listCalls().length).toBe(1);
    expect(listCalls()[0]?.[0]).toEqual({ hideIncomplete: true });
  });

  it("(j) a failed universe list with a coded reason reads that code's sentence", async () => {
    vi.mocked(client.listUniverses).mockRejectedValue(
      new client.ClassificationApiError("The envelope message", "req-2", {
        code: "validation_error",
        operation: "list-universes",
        resource: "universe",
      }),
    );
    renderPane();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Could not load your universes: FactorFlow could not accept the universe as entered. Check it, then try again.",
    );
  });

  it("(j) an unreachable API reads the same way", async () => {
    vi.mocked(client.listUniverses).mockRejectedValue(new Error("fetch failed"));
    renderPane();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Could not load your universes: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(alert.textContent).not.toContain("fetch failed");
  });
});
