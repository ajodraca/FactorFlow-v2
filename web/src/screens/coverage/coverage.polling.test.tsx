import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCoverage, fetchCoverageGapDates } from "../../api/client";
import type { CoverageView } from "../../api/types";
import CoverageScreen from "./index";
import { row, view } from "./test-fixtures";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    fetchCoverage: vi.fn(),
    fetchCoverageGapDates: vi.fn(),
    getHistoryDepth: vi.fn().mockResolvedValue({ years: 5, updatedAt: null }),
    listInstruments: vi
      .fn()
      .mockResolvedValue({ rows: [], activeCount: 3, retiredCount: 0, nextCursor: null }),
  };
});

vi.mock("../runs/run-controls", async () => {
  const { createElement } = await vi.importActual<typeof import("react")>("react");
  return {
    StartRunControl: () => createElement("button", { type: "button" }, "Start acquisition run"),
  };
});

const fetchCoverageMock = vi.mocked(fetchCoverage);
const fetchGapDatesMock = vi.mocked(fetchCoverageGapDates);

beforeEach(() => {
  fetchCoverageMock.mockReset();
  fetchGapDatesMock.mockReset();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-09-06T15:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TC-COMP-039: coverage never auto-polls and shows when it was loaded (DAC-E6-13)", () => {
  // Implements TC-COMP-039
  it("fetches once over ten minutes, and again only on Refresh, keeping rows while pending", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    fetchCoverageMock.mockResolvedValueOnce(view({ rows: [row({ symbol: "KEEP" })] }));
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <CoverageScreen />
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const toolbar = screen.getByTestId("coverage-toolbar");
    expect(fetchCoverageMock).toHaveBeenCalledTimes(1);
    expect(toolbar).toHaveTextContent("Last updated 2026-09-06 10:00:00 America/Chicago");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60_000);
    });
    expect(fetchCoverageMock).toHaveBeenCalledTimes(1);
    expect(fetchGapDatesMock).not.toHaveBeenCalled();
    expect(toolbar).toHaveTextContent("Last updated 2026-09-06 10:00:00 America/Chicago");

    let resolveRefresh: (value: CoverageView) => void = () => undefined;
    fetchCoverageMock.mockReturnValueOnce(
      new Promise<CoverageView>((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    vi.setSystemTime(new Date("2026-09-06T15:10:00Z"));
    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(fetchCoverageMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("rowheader", { name: /\bKEEP\b/ })).toBeInTheDocument();
    expect(screen.queryByText("Loading coverage…")).toBeNull();

    await act(async () => {
      resolveRefresh(view({ rows: [row({ symbol: "KEEP" })] }));
    });
    expect(toolbar).toHaveTextContent("Last updated 2026-09-06 10:10:00 America/Chicago");
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "false");
  });
});
