import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
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

describe("InstrumentTable", () => {
  beforeEach(() => {
    vi.mocked(client.listInstruments).mockResolvedValue(MIXED_PAGE);
  });

  // TC-COMP-131 (T009): active and retired instruments render in one
  // table, and retired rows carry the secondary lifecycle badge and
  // muted-foreground styling (DAC-E2-S4-4).
  it("renders active and retired instruments together in one table, retired rows marked distinctly", async () => {
    render(<InstrumentTable />);

    const table = await screen.findByRole("table");
    expect(within(table).getByText("AAPL")).toBeInTheDocument();
    const retiredRow = within(table).getByText("MSFT").closest("tr") as HTMLElement;
    expect(within(retiredRow).getByText(/retired/i)).toHaveAttribute("data-variant", "secondary");
    expect(within(retiredRow).getByText("MSFT")).toHaveClass("text-muted-foreground");
  });

  it("shows the active/retired count against AC-4's ceiling", async () => {
    render(<InstrumentTable />);
    expect(await screen.findByText(/1 active, 1 retired/i)).toBeInTheDocument();
  });

  // T018: filtering issues a server-side request via the typed client
  // rather than filtering only the currently loaded page (component design
  // section 2.6).
  it("issues a server-side request when the symbol filter changes", async () => {
    const user = userEvent.setup();
    render(<InstrumentTable />);
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    const filterInput = screen.getByRole("textbox", { name: /filter by symbol/i });
    await user.type(filterInput, "AAP");
    await user.tab();

    await waitFor(() => {
      expect(client.listInstruments).toHaveBeenCalledWith(
        expect.objectContaining({ symbol: "AAP" }),
      );
    });
  });

  it("issues a server-side request when the lifecycle filter changes", async () => {
    const user = userEvent.setup();
    render(<InstrumentTable />);
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.selectOptions(screen.getByRole("combobox", { name: /lifecycle/i }), "retired");

    await waitFor(() => {
      expect(client.listInstruments).toHaveBeenCalledWith(
        expect.objectContaining({ lifecycle: "retired" }),
      );
    });
  });

  // IR-001: at AC-4's volume the server paginates (DEFAULT_PAGE_SIZE), so a
  // second page must be reachable rather than silently truncated. A "Load
  // more" control consumes `nextCursor` and appends the next page's rows to
  // the ones already rendered, and the toolbar's own counts must remain
  // trustworthy once every row is loaded.
  it("consumes nextCursor via a load-more control so a second page is reachable", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listInstruments).mockResolvedValueOnce({
      rows: [{ instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const }],
      activeCount: 2,
      retiredCount: 0,
      nextCursor: "cursor-2",
    });
    render(<InstrumentTable />);

    const table = await screen.findByRole("table");
    expect(within(table).getByText("AAPL")).toBeInTheDocument();
    expect(within(table).queryByText("MSFT")).not.toBeInTheDocument();

    vi.mocked(client.listInstruments).mockResolvedValueOnce({
      rows: [{ instrumentId: 2, symbol: "MSFT", lifecycle: "active" as const }],
      activeCount: 2,
      retiredCount: 0,
      nextCursor: null,
    });

    const loadMore = screen.getByRole("button", { name: /load more/i });
    await user.click(loadMore);

    await waitFor(() => {
      expect(client.listInstruments).toHaveBeenLastCalledWith(
        expect.objectContaining({ cursor: "cursor-2" }),
      );
    });
    expect(await within(table).findByText("MSFT")).toBeInTheDocument();
    // AAPL is still there too — the second page is appended, not swapped in.
    expect(within(table).getByText("AAPL")).toBeInTheDocument();
    // The control disappears once there is no further page to load.
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });

  // IR-002: the retire confirmation's in-flight-run sentence must be
  // reachable from the real production path — opening the dialog through
  // the row action, not only by constructing RetireDialog directly.
  it("shows the retire dialog's in-flight-run sentence through the real row action", async () => {
    const user = userEvent.setup();
    render(<InstrumentTable />);
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Stop acquiring AAPL" }));

    expect(
      await screen.findByText(/a run is in progress and will still acquire aapl this time/i),
    ).toBeInTheDocument();
  });

  // IR-004: a failed retirement must not be presented as a completed one —
  // the dialog stays open with a visible error naming the operation and the
  // symbol, and the table is not silently reloaded as if it had succeeded.
  it("reports a failed retirement instead of closing the dialog as if it had succeeded", async () => {
    const user = userEvent.setup();
    vi.mocked(client.retireInstrument).mockRejectedValueOnce(new Error("already retired"));
    render(<InstrumentTable />);
    await screen.findByRole("table");
    vi.mocked(client.listInstruments).mockClear();

    await user.click(screen.getByRole("button", { name: "Stop acquiring AAPL" }));
    await user.click(screen.getByRole("button", { name: "Stop acquiring" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/stopping acquisition for aapl failed/i);
    expect(alert.textContent).toMatch(/already retired/i);
    // The dialog is still open — a failed retirement is not presented as
    // a completed one — and the table was not reloaded.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(client.listInstruments).not.toHaveBeenCalled();
  });

  // IR-006: the dialog traps focus and returns it to the triggering row
  // action on close, rather than leaving a keyboard user with no focus
  // position in a potentially 3000-row table.
  it("returns focus to the triggering row action when the dialog is cancelled", async () => {
    const user = userEvent.setup();
    render(<InstrumentTable />);
    await screen.findByRole("table");

    const triggerButton = screen.getByRole("button", { name: "Stop acquiring AAPL" });
    await user.click(triggerButton);
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(triggerButton).toHaveFocus();
  });
});
