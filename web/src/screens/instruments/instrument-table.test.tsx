import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import type { Instrument } from "../../api/types";
import { formatTimestamp } from "../../app/status-region";
import { InstrumentTable } from "./instrument-table";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, listInstruments: vi.fn(), retireInstrument: vi.fn() };
});

const MIXED_PAGE = {
  rows: [
    { instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const },
    { instrumentId: 2, symbol: "MSFT", lifecycle: "retired" as const },
  ],
  activeCount: 1,
  retiredCount: 1,
  nextCursor: null,
};

// Radix Select needs three DOM methods jsdom lacks; the shared setup unstubs
// globals after each test, so ResizeObserver is stubbed per test. jsdom's
// selector engine also recurses on `:fullscreen` and `:modal`, which no element
// can match there, and opening the list then takes about eight seconds, so they
// are answered directly (as web/src/components/ui/select.test.tsx does).
const originalMatches = Element.prototype.matches;
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
  Element.prototype.matches = function matches(this: Element, selector: string) {
    return selector === ":fullscreen" || selector === ":modal"
      ? false
      : originalMatches.call(this, selector);
  };
});

afterAll(() => {
  Element.prototype.matches = originalMatches;
});

function renderTable(props: Parameters<typeof InstrumentTable>[0] = {}) {
  return render(
    <MemoryRouter>
      <InstrumentTable {...props} />
    </MemoryRouter>,
  );
}

function instrumentRows(count: number): Instrument[] {
  return Array.from({ length: count }, (_, index) => ({
    instrumentId: index + 1,
    symbol: `S${index + 1}`,
    lifecycle: "active" as const,
  }));
}

describe("InstrumentTable — followed stocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.mocked(client.listInstruments).mockResolvedValue(MIXED_PAGE);
  });

  // Implements TC-COMP-203
  // Implements TC-COMP-184
  it("renders followed and stopped-following stocks in one virtualised table, stopped ones marked", async () => {
    renderTable();

    const region = await screen.findByRole("region", { name: "Followed stocks" });
    const table = within(region).getByRole("table");
    expect(table).toHaveAttribute("data-variant", "virtualised");
    expect(within(table).getByText("AAPL")).toBeInTheDocument();
    const stoppedRow = within(table).getByText("MSFT").closest("tr") as HTMLElement;
    const badge = within(stoppedRow).getByText("Stopped following");
    expect(badge.closest("[data-variant]")).toHaveAttribute("data-variant", "status-neutral");
    expect(within(table).getByRole("link", { name: "MSFT" })).toHaveClass("text-muted-foreground");
    expect(within(table).getByRole("link", { name: "AAPL" })).not.toHaveClass(
      "text-muted-foreground",
    );
  });

  it("shows the followed and stopped-following counts", async () => {
    renderTable();
    expect(await screen.findByText("1 followed, 1 stopped following")).toBeInTheDocument();
  });

  it("issues a server-side request, after the debounce, when the symbol filter changes", async () => {
    const user = userEvent.setup();
    renderTable();
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.type(screen.getByRole("textbox", { name: "Filter by symbol" }), "AA");

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenCalledWith({ symbol: "AA", lifecycle: undefined }),
    );
    // One request for the typed value; the debounce swallowed the first letter's.
    expect(client.listInstruments).not.toHaveBeenCalledWith({
      symbol: "A",
      lifecycle: undefined,
    });
  });

  // Implements TC-COMP-184
  it("issues a server-side request when the lifecycle filter changes, naming the options in the product's words", async () => {
    const user = userEvent.setup();
    renderTable();
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("combobox", { name: "Lifecycle" }));
    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["All", "Followed", "Stopped following"]);
    await user.click(screen.getByRole("option", { name: "Stopped following" }));

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenCalledWith({
        symbol: undefined,
        lifecycle: "retired",
      }),
    );
  });

  it("sends no lifecycle when All is chosen again", async () => {
    const user = userEvent.setup();
    renderTable();
    await screen.findByRole("table");
    await user.click(screen.getByRole("combobox", { name: "Lifecycle" }));
    await user.click(screen.getByRole("option", { name: "Followed" }));
    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenLastCalledWith({
        symbol: undefined,
        lifecycle: "active",
      }),
    );

    await user.click(screen.getByRole("combobox", { name: "Lifecycle" }));
    await user.click(screen.getByRole("option", { name: "All" }));

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenLastCalledWith({
        symbol: undefined,
        lifecycle: undefined,
      }),
    );
  });

  // IR-001, DAC-E7-11: the second keyset page is asked for by the virtualised
  // paging when the window nears the loaded end, with no button to press.
  it("requests the next keyset page without a click, and keeps both pages", async () => {
    vi.mocked(client.listInstruments)
      .mockResolvedValueOnce({
        rows: [{ instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const }],
        activeCount: 2,
        retiredCount: 0,
        nextCursor: "c1",
      })
      .mockResolvedValueOnce({
        rows: [{ instrumentId: 2, symbol: "MSFT", lifecycle: "active" as const }],
        activeCount: 2,
        retiredCount: 0,
        nextCursor: null,
      });
    renderTable();

    const table = await screen.findByRole("table");
    expect(await within(table).findByText("MSFT")).toBeInTheDocument();
    expect(within(table).getByText("AAPL")).toBeInTheDocument();
    expect(client.listInstruments).toHaveBeenCalledTimes(2);
    expect(client.listInstruments).toHaveBeenLastCalledWith({
      symbol: undefined,
      lifecycle: undefined,
      cursor: "c1",
    });
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });

  it("windows the DOM: 3000 loaded rows render the top window only", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: instrumentRows(3000),
      activeCount: 3000,
      retiredCount: 0,
      nextCursor: null,
    });
    renderTable();

    const table = await screen.findByRole("table");
    expect(table.querySelectorAll("tr[data-row-id]")).toHaveLength(25);
    expect(table).toHaveAttribute("aria-rowcount", "3001");
  });

  // TC-COMP-183: every symbol opens its Coverage row, by the new path.
  // Implements TC-COMP-183
  it("links every symbol to /data/coverage?symbol=, encoded, and to no old path", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [
        { instrumentId: 1, symbol: "AAPL", lifecycle: "active" },
        { instrumentId: 2, symbol: "BRK.B", lifecycle: "active" },
        { instrumentId: 3, symbol: "A&B", lifecycle: "active" },
      ],
      activeCount: 3,
      retiredCount: 0,
      nextCursor: null,
    });
    renderTable();

    const table = await screen.findByRole("table");
    expect(within(table).getByRole("link", { name: "AAPL" })).toHaveAttribute(
      "href",
      "/data/coverage?symbol=AAPL",
    );
    expect(within(table).getByRole("link", { name: "BRK.B" })).toHaveAttribute(
      "href",
      "/data/coverage?symbol=BRK.B",
    );
    expect(within(table).getByRole("link", { name: "A&B" })).toHaveAttribute(
      "href",
      "/data/coverage?symbol=A%26B",
    );
    for (const link of within(table).getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toMatch(/^\/(coverage|instruments|runs)/);
    }
  });

  // IR-002, DAC-E7-S3-2: the confirmation is reachable from the real row action.
  it("opens the stop-following dialog through the row action, with the running-download sentence", async () => {
    const user = userEvent.setup();
    renderTable();
    await screen.findByRole("table");

    const action = screen.getByRole("button", { name: "Stop following AAPL" });
    expect(action).toHaveTextContent("Stop following");
    await user.click(action);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(
      "A download is running and will still download AAPL this time. Stopping takes effect from the next download.",
    );
    // A stopped row has no action.
    expect(screen.queryByRole("button", { name: "Stop following MSFT" })).not.toBeInTheDocument();
  });

  it("stops following once on confirm, then re-reads the list", async () => {
    const user = userEvent.setup();
    vi.mocked(client.retireInstrument).mockResolvedValue(undefined as never);
    renderTable();
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("button", { name: "Stop following AAPL" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Stop following" }));

    await waitFor(() => expect(client.listInstruments).toHaveBeenCalledTimes(1));
    expect(client.retireInstrument).toHaveBeenCalledTimes(1);
    expect(client.retireInstrument).toHaveBeenCalledWith("AAPL");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  // IR-004: a failed stop is not presented as a completed one.
  it("reports a failed stop in the dialog and does not re-read the list", async () => {
    const user = userEvent.setup();
    vi.mocked(client.retireInstrument).mockRejectedValueOnce(new Error("service unavailable"));
    renderTable();
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("button", { name: "Stop following AAPL" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Stop following" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Stopping following AAPL failed: service unavailable",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(client.listInstruments).not.toHaveBeenCalled();
  });

  // IR-001, AC-24: the Stale row of the eight-state table, the last-updated time.
  it("shows when the list was last read, and moves it on when the list is read again", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      const first = new Date("2026-03-02T15:04:05Z");
      const second = new Date("2026-03-02T15:09:30Z");
      vi.setSystemTime(first);
      const { rerender } = renderTable({ refreshToken: 0 });
      await screen.findByRole("table");
      expect(screen.getByText(`Last updated ${formatTimestamp(first)}`)).toBeInTheDocument();

      vi.setSystemTime(second);
      rerender(
        <MemoryRouter>
          <InstrumentTable refreshToken={1} />
        </MemoryRouter>,
      );
      expect(
        await screen.findByText(`Last updated ${formatTimestamp(second)}`),
      ).toBeInTheDocument();
      expect(screen.queryByText(`Last updated ${formatTimestamp(first)}`)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  // IR-002, AC-17, AC-25: one stop per confirmation, and no refusal carried to another stock.
  it("sends one stop when Stop following is activated twice while the first is in flight", async () => {
    const user = userEvent.setup();
    let settle: () => void = () => undefined;
    vi.mocked(client.retireInstrument).mockReturnValue(
      new Promise<never>((resolve) => {
        settle = () => resolve(undefined as never);
      }),
    );
    renderTable();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Stop following AAPL" }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Stop following" });
    await user.click(confirm);
    await user.click(confirm);

    expect(client.retireInstrument).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    settle();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows no refusal of an earlier stop when the dialog is opened again", async () => {
    const user = userEvent.setup();
    vi.mocked(client.retireInstrument).mockRejectedValueOnce(new Error("AAPL is already stopped"));
    renderTable();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Stop following AAPL" }));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Stop following" }),
    );
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Stop following AAPL" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // IR-006, AC-25: focus returns to the row action on cancel.
  it("returns focus to the row action when the dialog is cancelled", async () => {
    const user = userEvent.setup();
    renderTable();
    await screen.findByRole("table");

    const action = screen.getByRole("button", { name: "Stop following AAPL" });
    await user.click(action);
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(action).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders no match with Reset filter, which clears both filters and re-reads", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 3,
      retiredCount: 1,
      nextCursor: null,
    });
    renderTable();

    expect(await screen.findByText("No stock matches this filter.")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Filter by symbol" }), "ZZ");
    await screen.findByText("No stock matches this filter.");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("button", { name: "Reset filter" }));

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenCalledWith({
        symbol: undefined,
        lifecycle: undefined,
      }),
    );
    expect(screen.getByRole("textbox", { name: "Filter by symbol" })).toHaveValue("");
  });

  it("renders a read error as a status with Try again, which re-reads once, and shows no request id", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listInstruments).mockRejectedValueOnce(
      new client.ApiError("service unavailable", "req-42"),
    );
    renderTable();

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Couldn't read followed stocks: service unavailable.");
    expect(document.body.textContent).not.toContain("req-42");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(client.listInstruments).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("shows a loading state, busy, until the first page answers", async () => {
    let resolve: (page: typeof MIXED_PAGE) => void = () => undefined;
    vi.mocked(client.listInstruments).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    renderTable();

    const loading = await screen.findByText("Loading followed stocks…");
    expect(loading.closest("[aria-busy='true']")).not.toBeNull();
    resolve(MIXED_PAGE);
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("has no per-row expander and no Load more button (DEC-0392)", async () => {
    renderTable();
    await screen.findByRole("table");

    expect(screen.queryByRole("button", { name: /^Expand /i })).toBeNull();
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  // DAC-E7-S3-5, AC-14: a recognition marker renders beside the symbol only for
  // a symbol the caller names.
  it("marks a symbol the caller names as Not found, and no other", async () => {
    renderTable({ notFoundSymbols: new Set(["MSFT"]) });

    const table = await screen.findByRole("table");
    const msft = within(table).getByText("MSFT").closest("tr") as HTMLElement;
    const aapl = within(table).getByText("AAPL").closest("tr") as HTMLElement;
    expect(within(msft).getByText("Not found")).toBeInTheDocument();
    expect(within(aapl).queryByText("Not found")).not.toBeInTheDocument();
  });

  it("marks no stock Not found by default", async () => {
    renderTable();
    await screen.findByRole("table");
    expect(screen.queryByText("Not found")).not.toBeInTheDocument();
  });

  // The hand-off pins: what the table asks for, shows and marks beyond the delivered cases.
  // Implements TC-COMP-184
  it("shows each count against its own word", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      ...MIXED_PAGE,
      activeCount: 2,
      retiredCount: 5,
    });
    renderTable();

    expect(await screen.findByText("2 followed, 5 stopped following")).toBeInTheDocument();
  });

  // Implements TC-COMP-184
  it("names All in the lifecycle filter while nothing is filtered", async () => {
    renderTable();
    await screen.findByRole("table");

    expect(screen.getByRole("combobox", { name: "Lifecycle" })).toHaveTextContent("All");
  });

  it("makes each symbol the row's header, and the row action a ghost button", async () => {
    renderTable();

    const table = await screen.findByRole("table");
    const headers = within(table).getAllByRole("rowheader");
    expect(headers.map((header) => header.textContent)).toEqual(["AAPL", "MSFT"]);
    expect(screen.getByRole("button", { name: "Stop following AAPL" })).toHaveAttribute(
      "data-variant",
      "ghost",
    );
  });

  it("appends the next page after the first, and marks the table busy while it loads", async () => {
    let resolve: (page: typeof MIXED_PAGE) => void = () => undefined;
    vi.mocked(client.listInstruments)
      .mockResolvedValueOnce({
        rows: [{ instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const }],
        activeCount: 2,
        retiredCount: 0,
        nextCursor: "c1",
      })
      .mockReturnValueOnce(
        new Promise((done) => {
          resolve = done;
        }),
      );
    renderTable();

    const table = await screen.findByRole("table");
    await waitFor(() => expect(table).toHaveAttribute("aria-busy", "true"));
    resolve({
      rows: [{ instrumentId: 2, symbol: "MSFT", lifecycle: "active" as const }],
      activeCount: 2,
      retiredCount: 0,
      nextCursor: null,
    });

    await within(table).findByText("MSFT");
    expect(
      within(table)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["AAPL", "MSFT"]);
    expect(table).not.toHaveAttribute("aria-busy");
  });

  it("carries both filters on the next page's request", async () => {
    const user = userEvent.setup();
    // A filtered first page has its own first row, as a real one does: the table
    // asks for one page per loaded set, named by its first row and its count.
    vi.mocked(client.listInstruments).mockImplementation(async (query) => ({
      rows: [
        query?.cursor
          ? { instrumentId: 2, symbol: "AAB", lifecycle: "retired" as const }
          : { instrumentId: query?.symbol ? 11 : 1, symbol: "AAA", lifecycle: "retired" as const },
      ],
      activeCount: 0,
      retiredCount: 2,
      nextCursor: query?.cursor ? null : "c1",
    }));
    renderTable();
    await screen.findByText("AAB");
    vi.mocked(client.listInstruments).mockClear();

    await user.type(screen.getByRole("textbox", { name: "Filter by symbol" }), "AA");
    await user.click(screen.getByRole("combobox", { name: "Lifecycle" }));
    await user.click(screen.getByRole("option", { name: "Stopped following" }));

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenCalledWith({
        symbol: "AA",
        lifecycle: "retired",
        cursor: "c1",
      }),
    );
  });

  it("reports a failed next page as a read error, not as a quiet end of the list", async () => {
    vi.mocked(client.listInstruments)
      .mockResolvedValueOnce({
        rows: [{ instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const }],
        activeCount: 2,
        retiredCount: 0,
        nextCursor: "c1",
      })
      .mockRejectedValueOnce(new Error("service unavailable"));
    renderTable();

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Couldn't read followed stocks: service unavailable.",
    );
  });

  it("clears both filters on Reset filter, which is an outline button", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 3,
      retiredCount: 1,
      nextCursor: null,
    });
    renderTable();
    await screen.findByText("No stock matches this filter.");
    await user.click(screen.getByRole("combobox", { name: "Lifecycle" }));
    await user.click(screen.getByRole("option", { name: "Followed" }));
    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenLastCalledWith({
        symbol: undefined,
        lifecycle: "active",
      }),
    );
    await screen.findByText("No stock matches this filter.");
    const reset = screen.getByRole("button", { name: "Reset filter" });
    expect(reset).toHaveAttribute("data-variant", "outline");

    await user.click(reset);

    await waitFor(() =>
      expect(client.listInstruments).toHaveBeenLastCalledWith({
        symbol: undefined,
        lifecycle: undefined,
      }),
    );
    expect(screen.getByRole("combobox", { name: "Lifecycle" })).toHaveTextContent("All");
  });
});
