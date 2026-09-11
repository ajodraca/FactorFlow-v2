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
});
