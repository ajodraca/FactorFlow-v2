import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../api/classification-client";
import type {
  UniverseEvent,
  UniverseEventPage,
  UniverseList,
  UniverseSummary,
} from "../../../api/classification-types";
import { ApiUnreachableError } from "../../../api/client";
import UniversesScreen from "./index";

vi.mock("../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../api/classification-client")>(
    "../../../api/classification-client",
  )),
  listUniverses: vi.fn(),
  createUniverse: vi.fn(),
  listUniverseEvents: vi.fn(),
}));

const { ClassificationApiError } = classificationClient;
const listUniverses = vi.mocked(classificationClient.listUniverses);
const listUniverseEvents = vi.mocked(classificationClient.listUniverseEvents);

function universe(
  universeId: string,
  name: string,
  overrides: Partial<UniverseSummary> = {},
): UniverseSummary {
  return {
    universeId,
    name,
    lifecycle: "active",
    memberCount: 12,
    createdAt: "2026-10-16T14:00:00Z",
    retiredAt: null,
    ...overrides,
  };
}

const TECH = universe("u-tech", "Tech", { memberCount: 3 });
const DIVIDEND = universe("u-div", "Dividend growers", { memberCount: 1200 });
const OLD = universe("u-old", "Old ideas", {
  lifecycle: "retired",
  retiredAt: "2026-10-17T03:15:00Z",
});

function page(
  universes: UniverseSummary[],
  counts: { active: number; retired: number },
  nextCursor: string | null = null,
): UniverseList {
  return { universes, activeCount: counts.active, retiredCount: counts.retired, nextCursor };
}

/** Answers by lifecycle: active Tech and Dividend growers, retired Old ideas. */
function answerByLifecycle(): void {
  const counts = { active: 2, retired: 1 };
  listUniverses.mockImplementation(async (params = {}) => {
    if (params.lifecycle === "retired") {
      return page([OLD], counts);
    }
    if (params.lifecycle === "all") {
      return page([TECH, DIVIDEND, OLD], counts);
    }
    return page([TECH, DIVIDEND], counts);
  });
}

function renderScreen(): void {
  render(
    <MemoryRouter initialEntries={["/research/universes"]}>
      <Routes>
        <Route path="/research/universes" element={<UniversesScreen />} />
        <Route path="/research" element={<p>Research home</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function lifecycleSelect(): HTMLSelectElement {
  return screen.getByRole("combobox") as HTMLSelectElement;
}

function event(
  eventId: number,
  eventType: UniverseEvent["eventType"],
  filterProvenance: unknown = null,
): UniverseEvent {
  return {
    eventId,
    eventType,
    name: eventType === "created" ? "Tech" : null,
    symbol: eventType === "member_added" ? "AAPL" : null,
    recordedAt: "2026-10-16T14:00:00Z",
    recordedOn: "2026-10-16",
    filterProvenance,
  };
}

beforeEach(() => {
  listUniverses.mockReset();
  listUniverseEvents.mockReset();
});

function rowOf(name: string): HTMLElement {
  return screen.getByRole("link", { name }).closest("tr") as HTMLElement;
}

/** The universes table's column header row (data-table section 3: always rendered with the table). */
function columnHeaders(): string[] {
  return screen.getAllByRole("columnheader").map((header) => header.textContent ?? "");
}

function rowNames(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelector("a")?.textContent ?? "")
    .filter((name) => name !== "");
}

// Implements TC-COMP-020 (T006): DAC-E1-S7-4, AC-3.
describe("TC-COMP-020: retired universes appear only under the lifecycle select", () => {
  it("shows active ones by default and retired ones under Retired or All with a secondary badge", async () => {
    const user = userEvent.setup();
    answerByLifecycle();
    renderScreen();

    await screen.findByRole("link", { name: "Tech" });
    expect(listUniverses).toHaveBeenNthCalledWith(1, { lifecycle: "active", limit: 500 });
    expect(screen.queryByText("Old ideas")).not.toBeInTheDocument();
    expect(screen.getByText("2 active, 1 retired")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Universes" })).toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: "Show: Active" });
    expect(select).toHaveAttribute("data-variant", "inline");
    expect(
      within(select)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Active", "Retired", "All"]);
    expect(screen.queryByText("Retired", { selector: "[data-variant=secondary]" })).toBeNull();

    await user.selectOptions(select, "retired");
    await screen.findByRole("link", { name: "Old ideas" });
    expect(listUniverses).toHaveBeenLastCalledWith({ lifecycle: "retired", limit: 500 });
    expect(screen.getByRole("combobox", { name: "Show: Retired" })).toBeInTheDocument();
    const badge = within(rowOf("Old ideas")).getByText("Retired", {
      selector: "[data-variant=secondary]",
    });
    expect(badge).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tech" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dividend growers" })).not.toBeInTheDocument();
    expect(screen.getByText("2 active, 1 retired")).toBeInTheDocument();

    await user.selectOptions(lifecycleSelect(), "all");
    await screen.findByRole("link", { name: "Tech" });
    expect(listUniverses).toHaveBeenLastCalledWith({ lifecycle: "all", limit: 500 });
    expect(rowNames()).toEqual(["Tech", "Dividend growers", "Old ideas"]);
    expect(screen.getAllByText("Retired", { selector: "[data-variant=secondary]" })).toHaveLength(
      1,
    );
    expect(
      within(rowOf("Old ideas")).getByText("Retired", { selector: "[data-variant=secondary]" }),
    ).toBeInTheDocument();
    expect(within(rowOf("Tech")).queryByText("Retired")).toBeNull();
    expect(within(rowOf("Dividend growers")).queryByText("Retired")).toBeNull();
    expect(screen.getByText("2 active, 1 retired")).toBeInTheDocument();
    expect(rowOf("Old ideas").querySelector("th")).toHaveClass("text-muted-foreground");
    expect(rowOf("Tech").querySelector("th")).not.toHaveClass("text-muted-foreground");
  });
});

const PROVENANCE = {
  set_id: "s-1",
  classification_date: "2026-10-15",
  thresholds: { value_percentile_min: 80, momentum_score_min: 0 },
  hide_incomplete: true,
  symbol: "AA",
};

const ORIGIN_CASES: [string, unknown, string][] = [
  [
    "Tech",
    PROVENANCE,
    'Saved from a filter on 2026-10-15: value percentile at least 80, momentum standardised score at least 0.00; search "AA"; stocks with an incomplete score hidden',
  ],
  [
    "Thresholds only",
    { ...PROVENANCE, hide_incomplete: false, symbol: null },
    "Saved from a filter on 2026-10-15: value percentile at least 80, momentum standardised score at least 0.00",
  ],
  [
    "Hidden only",
    { ...PROVENANCE, thresholds: {}, symbol: null },
    "Saved from a filter on 2026-10-15; stocks with an incomplete score hidden",
  ],
  [
    "Maxima",
    {
      ...PROVENANCE,
      thresholds: { growth_percentile_max: 20, value_score_max: -1.5, bogus_key_min: 3 },
      hide_incomplete: false,
      symbol: null,
    },
    "Saved from a filter on 2026-10-15: value standardised score at most -1.50, growth percentile at most 20",
  ],
  [
    "Every bound",
    {
      ...PROVENANCE,
      thresholds: {
        momentum_score_max: "1.255",
        momentum_score_min: "-0.5",
        momentum_percentile_max: 90,
        growth_score_min: 1,
        value_percentile_max: 95,
        value_percentile_min: 10,
      },
      hide_incomplete: false,
      symbol: "",
    },
    "Saved from a filter on 2026-10-15: value percentile at least 10, value percentile at most 95, growth standardised score at least +1.00, momentum percentile at most 90, momentum standardised score at least -0.50, momentum standardised score at most +1.26",
  ],
  [
    "One bound",
    { ...PROVENANCE, thresholds: { growth_score_min: 0.5 }, hide_incomplete: false, symbol: null },
    "Saved from a filter on 2026-10-15: growth standardised score at least +0.50",
  ],
  [
    "No thresholds object",
    { ...PROVENANCE, thresholds: null, symbol: null },
    "Saved from a filter on 2026-10-15; stocks with an incomplete score hidden",
  ],
  ["By hand", null, "Created by hand"],
];

/** Two pages per universe: member events with a cursor, then the `created` event last. */
function answerEvents(provenanceById: Record<string, unknown>): void {
  listUniverseEvents.mockImplementation(
    async (universeId, params = {}): Promise<UniverseEventPage> => {
      if (params.cursor === "c2") {
        return {
          events: [event(2, "member_added"), event(1, "created", provenanceById[universeId])],
          nextCursor: null,
        };
      }
      return { events: [event(4, "member_removed"), event(3, "member_added")], nextCursor: "c2" };
    },
  );
}

// Implements TC-COMP-021 (T007): DAC-E1-S7-5, AC-3.
describe("TC-COMP-021: the origin line names each clause only when it applied", () => {
  it.each(ORIGIN_CASES)("%s", async (name, provenance, expected) => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(page([universe("u-1", name)], { active: 1, retired: 0 }));
    answerEvents({ "u-1": provenance });
    renderScreen();

    const toggle = await screen.findByRole("button", { name: `Show details for ${name}` });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName(`Hide details for ${name}`);

    const line = await screen.findByText(expected);
    // T012: the expander's aria-controls names the detail row it reveals.
    const controlled = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(controlled?.tagName).toBe("TR");
    expect(controlled).toContainElement(line);
    expect(line.childNodes).toHaveLength(1);
    expect(line.firstChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(line.textContent).not.toMatch(/−|bogus/);
    expect(listUniverseEvents).toHaveBeenNthCalledWith(1, "u-1", { limit: 500 });
    expect(listUniverseEvents).toHaveBeenNthCalledWith(2, "u-1", { limit: 500, cursor: "c2" });
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(expected)).not.toBeInTheDocument();
    await user.click(toggle);
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);
  });

  it("stops paging at the created event", async () => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(page([universe("u-1", "Tech")], { active: 1, retired: 0 }));
    listUniverseEvents.mockResolvedValue({
      events: [event(2, "member_added"), event(1, "created", null)],
      nextCursor: "never-read",
    });
    renderScreen();
    await user.click(await screen.findByRole("button", { name: "Show details for Tech" }));
    expect(await screen.findByText("Created by hand")).toBeInTheDocument();
    expect(listUniverseEvents).toHaveBeenCalledTimes(1);
  });
});

// Implements TC-COMP-022 (T008): DAC-E1-S7-6, AC-3.
describe("TC-COMP-022: never populated is distinct from a lifecycle filter that matches nothing", () => {
  it("(a) never populated: the sentence, a link to Research and focus on New universe…", async () => {
    listUniverses.mockResolvedValue(page([], { active: 0, retired: 0 }));
    renderScreen();
    const sentence = await screen.findByText(
      (_, element) =>
        element?.tagName === "P" &&
        element.textContent ===
          "No universes yet. Create one by picking stocks, or save a result on Research.",
    );
    expect(sentence).toContainElement(screen.getByRole("link", { name: "Research" }));
    expect(screen.getByRole("link", { name: "Research" })).toHaveAttribute("href", "/research");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "New universe…" })).toHaveFocus(),
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("No retired universes.")).not.toBeInTheDocument();
    expect(screen.queryByText("No active universes.")).not.toBeInTheDocument();
  });

  it("(b) nothing retired: No retired universes. with a reset to Active", async () => {
    const user = userEvent.setup();
    listUniverses.mockImplementation(async (params = {}) =>
      params.lifecycle === "retired"
        ? page([], { active: 2, retired: 0 })
        : page([TECH, DIVIDEND], { active: 2, retired: 0 }),
    );
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    await user.selectOptions(lifecycleSelect(), "retired");
    expect(await screen.findByText("No retired universes.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Universes" })).toBeInTheDocument();
    expect(screen.getByText("2 active, 0 retired")).toBeInTheDocument();
    expect(screen.queryByText(/No universes yet/)).not.toBeInTheDocument();
    // DEC-0255: the table keeps its column header row; the sentence and its reset replace the body.
    const table = screen.getByRole("table");
    expect(columnHeaders()).toEqual(["Name", "Lifecycle", "Members", "Created"]);
    expect(table).toContainElement(screen.getByText("No retired universes."));
    expect(screen.getByText("No retired universes.").closest("td")).toHaveAttribute("colspan", "4");
    expect(table).toContainElement(screen.getByRole("button", { name: "Reset filter" }));
    expect(within(table).queryAllByRole("link")).toHaveLength(0);
    expect(within(table).queryAllByRole("rowheader")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "New universe…" })).not.toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Reset filter" }));
    expect(lifecycleSelect().value).toBe("active");
    expect(lifecycleSelect()).toHaveFocus();
    await screen.findByRole("link", { name: "Tech" });
    expect(listUniverses).toHaveBeenCalledTimes(3);
    expect(listUniverses).toHaveBeenLastCalledWith({ lifecycle: "active", limit: 500 });
  });

  it("(c) nothing active but some retired: No active universes. with a reset to All", async () => {
    const user = userEvent.setup();
    listUniverses.mockImplementation(async (params = {}) =>
      params.lifecycle === "active"
        ? page([], { active: 0, retired: 1 })
        : page([OLD], { active: 0, retired: 1 }),
    );
    renderScreen();
    expect(await screen.findByText("No active universes.")).toBeInTheDocument();
    expect(screen.queryByText(/No universes yet/)).not.toBeInTheDocument();
    expect(screen.queryByText("No retired universes.")).not.toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(columnHeaders()).toEqual(["Name", "Lifecycle", "Members", "Created"]);
    expect(table).toContainElement(screen.getByText("No active universes."));
    expect(within(table).queryAllByRole("rowheader")).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Reset filter" }));
    expect(lifecycleSelect().value).toBe("all");
    expect(lifecycleSelect()).toHaveFocus();
    await screen.findByRole("link", { name: "Old ideas" });
    expect(listUniverses).toHaveBeenLastCalledWith({ lifecycle: "all", limit: 500 });
  });
});

// T010: the list screen's remaining behaviour (UX design 1.3).
describe("UniversesScreen: loading, errors, paging, columns, sort and expansion", () => {
  it("(a) shows Loading… politely, then an error with the header kept and Try again", async () => {
    const user = userEvent.setup();
    let reject: (reason: unknown) => void = () => undefined;
    listUniverses.mockReturnValueOnce(
      new Promise<UniverseList>((_, fail) => {
        reject = fail;
      }),
    );
    renderScreen();
    expect(screen.getByText("Loading…")).toHaveAttribute("aria-live", "polite");
    reject(
      new ClassificationApiError("RAW-SERVER-PROSE", "req-1", {
        code: "internal_error",
        operation: "list-universes",
        resource: "universe",
      }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Could not load your universes: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(screen.queryByText(/RAW-SERVER-PROSE/)).not.toBeInTheDocument();
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Universes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New universe…" })).toBeInTheDocument();
    // data-table section 4 and UX 1.3 States: the header row stays, the error replaces the body.
    expect(columnHeaders()).toEqual(["Name", "Lifecycle", "Members", "Created"]);
    expect(screen.getByRole("table")).toContainElement(alert);

    answerByLifecycle();
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(lifecycleSelect()).toHaveFocus();
    await screen.findByRole("link", { name: "Tech" });
    expect(listUniverses).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("(b) reads every page at limit 500 (DEC-0101)", async () => {
    listUniverses
      .mockResolvedValueOnce(page([TECH], { active: 2, retired: 0 }, "p2"))
      .mockResolvedValueOnce(page([DIVIDEND], { active: 2, retired: 0 }));
    renderScreen();
    await screen.findByRole("link", { name: "Dividend growers" });
    expect(screen.getByRole("link", { name: "Tech" })).toBeInTheDocument();
    expect(listUniverses).toHaveBeenNthCalledWith(1, { lifecycle: "active", limit: 500 });
    expect(listUniverses).toHaveBeenNthCalledWith(2, {
      lifecycle: "active",
      limit: 500,
      cursor: "p2",
    });
    expect(listUniverses).toHaveBeenCalledTimes(2);
  });

  it("(c) renders Name, Lifecycle, Members and the America/Chicago Created date (DEC-0103)", async () => {
    listUniverses.mockResolvedValue(
      page([universe("u-late", "Late", { createdAt: "2026-10-16T02:30:00Z", memberCount: 1200 })], {
        active: 1,
        retired: 0,
      }),
    );
    renderScreen();
    const link = await screen.findByRole("link", { name: "Late" });
    expect(link).toHaveAttribute("href", "/research/universes/u-late");
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "Name",
      "Lifecycle",
      "Members",
      "Created",
    ]);
    const row = rowOf("Late");
    expect(within(row).getByRole("rowheader")).toContainElement(link);
    const cells = within(row).getAllByRole("cell");
    expect(cells[1]).toHaveTextContent(/^1200$/);
    expect(cells[1]).toHaveClass("text-right", "font-numeric");
    expect(cells[2]).toHaveTextContent(/^2026-10-15$/);
    expect(screen.getByRole("table")).toHaveAttribute("data-variant", "expandable");
  });

  it("(d) sorts Name in the browser, ascending, descending, then unsorted, with no request", async () => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(
      page(
        [
          universe("1", "beta"),
          universe("2", "Alpha"),
          universe("3", "gamma"),
          universe("4", "Beta2"),
          universe("5", "Beta"),
        ],
        { active: 5, retired: 0 },
      ),
    );
    renderScreen();
    await screen.findByRole("link", { name: "Alpha" });
    const header = screen.getAllByRole("columnheader")[0] as HTMLElement;
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(rowNames()).toEqual(["beta", "Alpha", "gamma", "Beta2", "Beta"]);
    await user.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(rowNames()).toEqual(["Alpha", "beta", "Beta", "Beta2", "gamma"]);
    await user.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(rowNames()).toEqual(["gamma", "Beta2", "beta", "Beta", "Alpha"]);
    // data-table section 4: a third activation returns to the loaded order.
    await user.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(rowNames()).toEqual(["beta", "Alpha", "gamma", "Beta2", "Beta"]);
    await user.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(rowNames()).toEqual(["Alpha", "beta", "Beta", "Beta2", "gamma"]);
    expect(listUniverses).toHaveBeenCalledTimes(1);
  });

  it("(e) expansion shows created_at and, for a retired universe, retired_at with the zone", async () => {
    const user = userEvent.setup();
    answerByLifecycle();
    answerEvents({ "u-old": null, "u-tech": null });
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    await user.click(screen.getByRole("button", { name: "Show details for Tech" }));
    const createdLine = await screen.findByText("Created 2026-10-16 09:00 CDT");
    expect(createdLine.closest("td")).toHaveAttribute("colspan", "4");
    expect(screen.queryByText(/^Retired 2026/)).not.toBeInTheDocument();

    await user.selectOptions(lifecycleSelect(), "retired");
    await user.click(await screen.findByRole("button", { name: "Show details for Old ideas" }));
    expect(await screen.findByText("Retired 2026-10-16 22:15 CDT")).toBeInTheDocument();
    expect(screen.getByText("Created 2026-10-16 09:00 CDT")).toBeInTheDocument();
  });

  it("(f) a failed events read shows an inline alert with Try again and no origin", async () => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(page([TECH], { active: 1, retired: 0 }));
    listUniverseEvents.mockRejectedValueOnce(
      new ClassificationApiError("RAW-SERVER-PROSE", "req-2", {
        code: "internal_error",
        operation: "list-universe-events",
        resource: "universe",
      }),
    );
    renderScreen();
    await user.click(await screen.findByRole("button", { name: "Show details for Tech" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Could not load the universe's history: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(screen.queryByText(/Created by hand|Saved from a filter/)).not.toBeInTheDocument();
    expect(screen.queryByText(/RAW-SERVER-PROSE/)).not.toBeInTheDocument();

    listUniverseEvents.mockResolvedValueOnce({
      events: [event(1, "created", null)],
      nextCursor: null,
    });
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("button", { name: "Hide details for Tech" })).toHaveFocus();
    expect(await screen.findByText("Created by hand")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("(f) a created event whose provenance has no date is a failure", async () => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(page([TECH], { active: 1, retired: 0 }));
    listUniverseEvents.mockResolvedValue({
      events: [event(1, "created", { hide_incomplete: true, thresholds: {} })],
      nextCursor: null,
    });
    renderScreen();
    await user.click(await screen.findByRole("button", { name: "Show details for Tech" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/Saved from a filter/)).not.toBeInTheDocument();
  });

  it("keeps the loaded rows, dimmed and busy, while a new selection loads (data-table section 4)", async () => {
    const user = userEvent.setup();
    let answerRetired: (value: UniverseList) => void = () => undefined;
    listUniverses.mockImplementation((params = {}) =>
      params.lifecycle === "retired"
        ? new Promise<UniverseList>((settle) => {
            answerRetired = settle;
          })
        : Promise.resolve(page([TECH, DIVIDEND], { active: 2, retired: 1 })),
    );
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    expect(screen.getByRole("table")).not.toHaveAttribute("aria-busy", "true");

    await user.selectOptions(lifecycleSelect(), "retired");
    expect(screen.getByText("Loading…")).toHaveAttribute("aria-live", "polite");
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("aria-busy", "true");
    expect(within(table).getByRole("link", { name: "Tech" })).toBeInTheDocument();
    expect(rowOf("Tech").closest("tbody")).toHaveClass("opacity-50");

    answerRetired(page([OLD], { active: 2, retired: 1 }));
    await screen.findByRole("link", { name: "Old ideas" });
    expect(screen.getByRole("table")).not.toHaveAttribute("aria-busy", "true");
    expect(rowOf("Old ideas").closest("tbody")).not.toHaveClass("opacity-50");
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  it("drops the kept rows when a read finds no universe at all (T008(a): never populated has no table)", async () => {
    const user = userEvent.setup();
    listUniverses.mockImplementation(async (params = {}) =>
      params.lifecycle === "retired"
        ? page([], { active: 0, retired: 0 })
        : page([TECH], { active: 1, retired: 0 }),
    );
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    await user.selectOptions(lifecycleSelect(), "retired");
    expect(await screen.findByText(/^No universes yet\./)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("ignores a slower read for a selection the owner has already left", async () => {
    const user = userEvent.setup();
    let answerActive: (value: UniverseList) => void = () => undefined;
    listUniverses.mockImplementation((params = {}) =>
      params.lifecycle === "active"
        ? new Promise<UniverseList>((settle) => {
            answerActive = settle;
          })
        : Promise.resolve(page([OLD], { active: 2, retired: 1 })),
    );
    renderScreen();
    await user.selectOptions(lifecycleSelect(), "retired");
    await screen.findByRole("link", { name: "Old ideas" });
    answerActive(page([TECH, DIVIDEND], { active: 2, retired: 1 }));
    await new Promise((settle) => setTimeout(settle, 0));
    expect(screen.queryByRole("link", { name: "Tech" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Old ideas" })).toBeInTheDocument();
  });

  it("(f) a read that never reaches the created event is a failure, not a by-hand origin", async () => {
    const user = userEvent.setup();
    listUniverses.mockResolvedValue(page([TECH], { active: 1, retired: 0 }));
    listUniverseEvents.mockResolvedValue({ events: [event(2, "member_added")], nextCursor: null });
    renderScreen();
    await user.click(await screen.findByRole("button", { name: "Show details for Tech" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Created by hand")).not.toBeInTheDocument();
  });

  it("(g) New universe… is the default button, opens the dialog and gets focus back on Cancel", async () => {
    const user = userEvent.setup();
    answerByLifecycle();
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    const action = screen.getByRole("button", { name: "New universe…" });
    expect(action).toHaveAttribute("data-variant", "default");
    await user.click(action);
    expect(screen.getByRole("dialog", { name: "New universe" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(action).toHaveFocus();
  });

  it("(h) renders nothing of its own when the API is unreachable", async () => {
    listUniverses.mockRejectedValue(new ApiUnreachableError("offline"));
    renderScreen();
    await waitFor(() => expect(screen.queryByText("Loading…")).not.toBeInTheDocument());
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers no delete anywhere (STD-UI-2)", async () => {
    answerByLifecycle();
    renderScreen();
    await screen.findByRole("link", { name: "Tech" });
    expect(screen.queryByRole("button", { name: /delete|remove/i })).not.toBeInTheDocument();
  });
});
