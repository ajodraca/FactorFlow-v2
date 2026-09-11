import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import InstrumentsScreen from "./index";
import { InstrumentTable } from "./instrument-table";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listInstruments: vi.fn(),
    addInstruments: vi.fn(),
    retireInstrument: vi.fn(),
    getHistoryDepth: vi.fn().mockResolvedValue({ years: null, updatedAt: null }),
  };
});

// TC-COMP-133 (T010): never-populated is distinct from a filter matching
// nothing (DAC-E2-S4-6).
describe("Instruments — empty states are distinct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'No instruments named yet.' with the add field focused when the list has never been populated", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 0,
      retiredCount: 0,
      nextCursor: null,
    });

    render(<InstrumentsScreen />);

    expect(await screen.findByText("No instruments named yet.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /instrument symbol/i })).toHaveFocus();
  });

  it("renders 'No instrument matches this filter.' with a reset control when instruments exist but none match", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 3,
      retiredCount: 1,
      nextCursor: null,
    });

    render(<InstrumentTable />);

    expect(await screen.findByText("No instrument matches this filter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset filter/i })).toBeInTheDocument();
  });
});
