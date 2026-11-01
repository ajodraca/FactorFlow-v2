import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../../api/classification-client";
import type { UniverseEvent, UniverseEventPage } from "../../../../api/classification-types";
import { ApiUnreachableError } from "../../../../api/client";
import { HistoryTab } from "./history-tab";

vi.mock("../../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../../api/classification-client")>(
    "../../../../api/classification-client",
  )),
  listUniverseEvents: vi.fn(),
}));

const { ClassificationApiError } = classificationClient;
const listUniverseEvents = vi.mocked(classificationClient.listUniverseEvents);

let nextId = 100;
function event(
  eventType: UniverseEvent["eventType"],
  recordedAt: string,
  recordedOn: string,
  fields: { name?: string; symbol?: string } = {},
): UniverseEvent {
  nextId -= 1;
  return {
    eventId: nextId,
    eventType,
    name: fields.name ?? null,
    symbol: fields.symbol ?? null,
    recordedAt,
    recordedOn,
    filterProvenance: null,
  };
}

const REMOVED = event("member_removed", "2026-10-18T15:00:00Z", "2026-10-18", { symbol: "OLD" });
const RENAMED = event("renamed", "2026-10-17T15:00:00Z", "2026-10-17", {
  name: "Tech and Dividend growers",
});
const ADDED = event("member_added", "2026-10-16T15:00:00Z", "2026-10-16", { symbol: "AAPL" });
const CREATED = event("created", "2026-10-15T14:20:00Z", "2026-10-15", { name: "Tech" });

function page(events: UniverseEvent[], nextCursor: string | null = null): UniverseEventPage {
  return { events, nextCursor };
}

function apiError(code: string) {
  return new ClassificationApiError("ignored envelope message", "req-1", {
    code,
    operation: "list-universe-events",
    resource: "universe",
  });
}

function renderTab(onViewMembersAsOf = vi.fn()) {
  render(
    <MemoryRouter initialEntries={["/research/universes/u-tech?tab=history"]}>
      <Routes>
        <Route
          path="/research/universes/:universeId"
          element={<HistoryTab universeId="u-tech" onViewMembersAsOf={onViewMembersAsOf} />}
        />
        <Route path="/research/stocks/:symbol" element={<p>Stock page</p>} />
        <Route path="/research/universes" element={<p>Universes page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onViewMembersAsOf };
}

/** Lets every settled read and the renders it causes finish. */
async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((settle) => setTimeout(settle, 0));
  });
}

function bodyRows(): HTMLElement[] {
  const table = screen.getByRole("table");
  return within(table).getAllByRole("row").slice(1);
}

beforeEach(() => {
  listUniverseEvents.mockReset();
});

describe("HistoryTab", () => {
  // Implements TC-COMP-029 (T008): DAC-E1-S8-6, AC-4.
  it("lists events newest first and shows both names on a rename", async () => {
    listUniverseEvents.mockResolvedValue(page([REMOVED, RENAMED, ADDED, CREATED]));
    renderTab();

    const table = await screen.findByRole("table");
    expect(table).toHaveAttribute("data-variant", "history");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["Recorded at", "Event", "Detail"]);
    const rows = bodyRows();
    expect(rows).toHaveLength(4);
    const cells = rows.map((row) => within(row).getAllByRole("cell"));
    expect(cells.map((row) => row[1].textContent)).toEqual([
      "Stock removed",
      "Renamed",
      "Stock added",
      "Created",
    ]);
    expect(cells[0][0]).toHaveTextContent("2026-10-18 10:00 CDT");
    expect(cells[3][0]).toHaveTextContent("2026-10-15 09:20 CDT");
    expect(cells[1][2]).toHaveTextContent("Tech → Tech and Dividend growers");
    expect(cells[3][2].textContent).toContain("Tech");
    expect(cells[0][2]).toHaveTextContent("OLD");
    expect(cells[2][2]).toHaveTextContent("AAPL");
    expect(listUniverseEvents).toHaveBeenCalledTimes(1);
    expect(listUniverseEvents).toHaveBeenCalledWith("u-tech", { limit: 50 });
  });

  // Implements TC-COMP-029 (T008): the old name is the nearest older created or renamed event's.
  it("takes a rename's old name from the nearest older name-bearing event", async () => {
    const second = event("renamed", "2026-10-19T15:00:00Z", "2026-10-19", { name: "Growth" });
    listUniverseEvents.mockResolvedValue(page([second, REMOVED, RENAMED, ADDED, CREATED]));
    renderTab();

    await screen.findByRole("table");
    const details = bodyRows().map((row) => within(row).getAllByRole("cell")[2].textContent);
    expect(details[0]).toBe("Tech and Dividend growers → Growth");
    expect(details[2]).toBe("Tech → Tech and Dividend growers");
  });

  // Implements T009 (a): the symbol links to the stock's evidence.
  it("links a member event's symbol to the stock page", async () => {
    const user = userEvent.setup();
    listUniverseEvents.mockResolvedValue(page([REMOVED, RENAMED, ADDED, CREATED]));
    renderTab();

    const link = await screen.findByRole("link", { name: "AAPL" });
    expect(link).toHaveAttribute("href", "/research/stocks/AAPL");
    expect(screen.getByRole("link", { name: "OLD" })).toHaveAttribute(
      "href",
      "/research/stocks/OLD",
    );
    await user.click(link);
    expect(await screen.findByText("Stock page")).toBeInTheDocument();
  });

  // Implements T009 (b): only created and member rows offer the as-of view, with the event's date.
  it("offers View members as of this event on created and member rows only", async () => {
    const user = userEvent.setup();
    const retired = event("retired", "2026-10-20T15:00:00Z", "2026-10-20");
    listUniverseEvents.mockResolvedValue(page([retired, REMOVED, RENAMED, ADDED, CREATED]));
    const { onViewMembersAsOf } = renderTab();

    await screen.findByRole("table");
    const rows = bodyRows();
    const offers = rows.map(
      (row) =>
        within(row).queryByRole("button", { name: "View members as of this event" }) !== null,
    );
    expect(offers).toEqual([false, true, false, true, true]);

    await user.click(
      within(rows[3]).getByRole("button", { name: "View members as of this event" }),
    );
    expect(onViewMembersAsOf).toHaveBeenCalledTimes(1);
    expect(onViewMembersAsOf).toHaveBeenCalledWith("2026-10-16");

    await user.click(
      within(rows[4]).getByRole("button", { name: "View members as of this event" }),
    );
    expect(onViewMembersAsOf).toHaveBeenLastCalledWith("2026-10-15");
  });

  // Implements T009 (b): the date is recorded_on, the America/Chicago date (DEC-0065).
  it("uses the Chicago recorded_on date, not the UTC date of recorded_at", async () => {
    const user = userEvent.setup();
    const late = event("member_added", "2026-10-17T03:30:00Z", "2026-10-16", { symbol: "MSFT" });
    listUniverseEvents.mockResolvedValue(page([late, CREATED]));
    const { onViewMembersAsOf } = renderTab();

    await screen.findByRole("table");
    await user.click(
      within(bodyRows()[0]).getByRole("button", { name: "View members as of this event" }),
    );
    expect(onViewMembersAsOf).toHaveBeenCalledWith("2026-10-16");
  });

  // Implements T009 (c).
  it("renders a retired row as Retired with no detail", async () => {
    const retired = event("retired", "2026-10-20T15:00:00Z", "2026-10-20");
    listUniverseEvents.mockResolvedValue(page([retired, CREATED]));
    renderTab();

    await screen.findByRole("table");
    const cells = within(bodyRows()[0]).getAllByRole("cell");
    expect(cells[1]).toHaveTextContent("Retired");
    expect(cells[2].textContent).toBe("");
  });

  // Implements T009 (d): keyset paging at 50 with Load more, appended in order.
  it("reads the next page without a click when a rename's old name is on it", async () => {
    listUniverseEvents
      .mockResolvedValueOnce(page([REMOVED, RENAMED], "c1"))
      .mockResolvedValueOnce(page([ADDED, CREATED], null));
    renderTab();

    await screen.findByRole("table");
    // The rename's old name is on the next page, so it is read without a click.
    await waitFor(() => expect(listUniverseEvents).toHaveBeenCalledTimes(2));
    expect(listUniverseEvents).toHaveBeenNthCalledWith(2, "u-tech", { limit: 50, cursor: "c1" });
    await waitFor(() => expect(bodyRows()).toHaveLength(4));
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  // Implements T009 (d).
  it("shows Load more while a cursor remains and reads that cursor once", async () => {
    const user = userEvent.setup();
    listUniverseEvents
      .mockResolvedValueOnce(page([REMOVED, ADDED], "c1"))
      .mockResolvedValueOnce(page([RENAMED, CREATED], null));
    renderTab();

    await screen.findByRole("table");
    expect(listUniverseEvents).toHaveBeenCalledTimes(1);
    expect(listUniverseEvents).toHaveBeenCalledWith("u-tech", { limit: 50 });
    await user.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => expect(bodyRows()).toHaveLength(4));
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);
    expect(listUniverseEvents).toHaveBeenLastCalledWith("u-tech", { limit: 50, cursor: "c1" });
    const labels = bodyRows().map((row) => within(row).getAllByRole("cell")[1].textContent);
    expect(labels).toEqual(["Stock removed", "Stock added", "Renamed", "Created"]);
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  // Implements T009 (e): a rename at a page boundary reads on until the old name is found.
  it("reads further pages on its own until a rename's old name is found", async () => {
    const filler = event("member_added", "2026-10-16T16:00:00Z", "2026-10-16", { symbol: "MSFT" });
    listUniverseEvents
      .mockResolvedValueOnce(page([REMOVED, RENAMED], "c1"))
      .mockResolvedValueOnce(page([filler], "c2"))
      .mockResolvedValueOnce(page([ADDED, CREATED], null));
    renderTab();

    await waitFor(() => expect(listUniverseEvents).toHaveBeenCalledTimes(3));
    expect(listUniverseEvents).toHaveBeenNthCalledWith(3, "u-tech", { limit: 50, cursor: "c2" });
    await waitFor(() => expect(bodyRows()).toHaveLength(5));
    expect(within(bodyRows()[1]).getAllByRole("cell")[2]).toHaveTextContent(
      "Tech → Tech and Dividend growers",
    );
    for (const row of bodyRows()) {
      expect(within(row).getAllByRole("cell")[2].textContent).not.toBe("Tech and Dividend growers");
    }
  });

  // Implements T009 (e): the automatic read stops at the end of the history.
  it("stops reading on when the cursor ends without an older name", async () => {
    listUniverseEvents
      .mockResolvedValueOnce(page([RENAMED], "c1"))
      .mockResolvedValueOnce(page([ADDED], null));
    renderTab();

    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);
    expect(within(bodyRows()[0]).getAllByRole("cell")[2].textContent).toBe(
      "Tech and Dividend growers",
    );
  });

  // Implements TC-COMP-029 (T008): the old name may be the event directly below.
  it("takes the old name from the event directly below the rename", async () => {
    listUniverseEvents.mockResolvedValue(page([RENAMED, CREATED]));
    renderTab();

    await screen.findByRole("table");
    expect(within(bodyRows()[0]).getAllByRole("cell")[2].textContent).toBe(
      "Tech → Tech and Dividend growers",
    );
    expect(listUniverseEvents).toHaveBeenCalledTimes(1);
  });

  // Implements T009 (e, f): a failed automatic read replaces the body and is not retried alone.
  it("does not retry a failed automatic read on its own", async () => {
    listUniverseEvents
      .mockResolvedValueOnce(page([RENAMED], "c1"))
      .mockRejectedValueOnce(apiError("internal_error"))
      .mockResolvedValue(page([CREATED]));
    renderTab();

    expect(
      await screen.findByText(
        "Could not load the universe's history: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    await flush();
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  // Implements T009 (d): one read per press; focus stays on Load more, then moves to the table.
  it("keeps Load more focused and inert while its page is read", async () => {
    const user = userEvent.setup();
    let settle: (value: UniverseEventPage) => void = () => {};
    listUniverseEvents
      .mockResolvedValueOnce(page([REMOVED], "c1"))
      .mockReturnValueOnce(
        new Promise((done) => {
          settle = done;
        }),
      )
      .mockResolvedValueOnce(page([CREATED], null));
    renderTab();

    const loadMore = await screen.findByRole("button", { name: "Load more" });
    await user.click(loadMore);
    expect(loadMore).toHaveAttribute("aria-disabled", "true");
    expect(loadMore).toHaveFocus();
    await user.click(loadMore);
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);

    await act(async () => settle(page([ADDED], "c2")));
    expect(loadMore).not.toHaveAttribute("aria-disabled");
    expect(loadMore).toHaveFocus();
    expect(bodyRows()).toHaveLength(2);

    await user.click(loadMore);
    await waitFor(() => expect(bodyRows()).toHaveLength(3));
    expect(listUniverseEvents).toHaveBeenLastCalledWith("u-tech", { limit: 50, cursor: "c2" });
    expect(listUniverseEvents).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveFocus();
  });

  it("leaves focus alone when the last page arrives without Load more focused", async () => {
    const user = userEvent.setup();
    let settle: (value: UniverseEventPage) => void = () => {};
    listUniverseEvents.mockResolvedValueOnce(page([REMOVED], "c1")).mockReturnValueOnce(
      new Promise((done) => {
        settle = done;
      }),
    );
    renderTab();

    const loadMore = await screen.findByRole("button", { name: "Load more" });
    await user.click(loadMore);
    loadMore.blur();
    await act(async () => settle(page([CREATED], null)));
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByRole("table")).not.toHaveFocus();
  });

  // Implements T013: a read superseded by a newer one is ignored.
  it("ignores a slower read for a universe it no longer shows", async () => {
    let settleFirst: (value: UniverseEventPage) => void = () => {};
    listUniverseEvents
      .mockReturnValueOnce(
        new Promise((done) => {
          settleFirst = done;
        }),
      )
      .mockResolvedValueOnce(page([CREATED]));
    const { rerender } = render(
      <MemoryRouter>
        <HistoryTab universeId="u-old" onViewMembersAsOf={vi.fn()} />
      </MemoryRouter>,
    );
    rerender(
      <MemoryRouter>
        <HistoryTab universeId="u-tech" onViewMembersAsOf={vi.fn()} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    settleFirst(page([REMOVED, ADDED]));
    await flush();
    expect(bodyRows()).toHaveLength(1);
    expect(listUniverseEvents).toHaveBeenLastCalledWith("u-tech", { limit: 50 });
  });

  // Implements T009 (f): an error replaces the body with the sentence and Try again.
  it("replaces the body with the failure sentence and re-reads on Try again", async () => {
    const user = userEvent.setup();
    listUniverseEvents
      .mockRejectedValueOnce(apiError("internal_error"))
      .mockResolvedValueOnce(page([ADDED, CREATED]));
    renderTab();

    expect(
      await screen.findByText(
        "Could not load the universe's history: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/ignored envelope message/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(bodyRows()).toHaveLength(2));
    expect(listUniverseEvents).toHaveBeenCalledTimes(2);
    expect(listUniverseEvents).toHaveBeenLastCalledWith("u-tech", { limit: 50 });
  });

  // Implements T009 (f): a transport failure states the operation too.
  it("states an unreachable API by operation with Try again", async () => {
    listUniverseEvents.mockRejectedValueOnce(new ApiUnreachableError("offline"));
    renderTab();

    expect(
      await screen.findByText(
        "Could not load the universe's history: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  // Implements T009 (f).
  it("states universe_not_found with a link to Universes", async () => {
    const user = userEvent.setup();
    listUniverseEvents.mockRejectedValueOnce(apiError("universe_not_found"));
    renderTab();

    expect(await screen.findByText("No universe with this address exists.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Universes" });
    expect(link).toHaveAttribute("href", "/research/universes");
    await user.click(link);
    expect(await screen.findByText("Universes page")).toBeInTheDocument();
  });

  // Implements T009 (f): a failed later page replaces the body; Try again reads from page one.
  it("replaces the body when a later page fails and reads from the start on Try again", async () => {
    const user = userEvent.setup();
    listUniverseEvents
      .mockResolvedValueOnce(page([REMOVED, ADDED], "c1"))
      .mockRejectedValueOnce(apiError("cursor_invalid"))
      .mockResolvedValueOnce(page([REMOVED, ADDED, RENAMED, CREATED], null));
    renderTab();

    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(
      await screen.findByText(
        "Could not load the universe's history: the list changed while it was being read. Reload it, then try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(bodyRows()).toHaveLength(4));
    expect(listUniverseEvents).toHaveBeenCalledTimes(3);
    expect(listUniverseEvents).toHaveBeenLastCalledWith("u-tech", { limit: 50 });
  });

  // Implements T009 (g).
  it("renders a busy skeleton, not an empty table, while loading", async () => {
    listUniverseEvents.mockReturnValue(new Promise(() => {}));
    renderTab();

    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveTextContent("Loading…");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
