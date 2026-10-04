import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getAcquisitionRun } from "../../api/client";
import type { AcquisitionRun, RunDetail, RunResult, RunState } from "../../api/types";
import RunDetailScreen from "./detail";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, getAcquisitionRun: vi.fn() };
});

const getMock = vi.mocked(getAcquisitionRun);

function run(state: RunState): AcquisitionRun {
  const terminal = !["requested", "running", "cancelling"].includes(state);
  return {
    runId: "r-1",
    state,
    historyDepthYears: 5,
    requestedAt: "2026-09-06T14:00:00Z",
    startedAt: state === "requested" ? null : "2026-09-06T14:00:05Z",
    endedAt: terminal ? "2026-09-06T14:30:00Z" : null,
    instrumentsNamed: 2,
    instrumentsWritten: 1,
    instrumentsFailed: 0,
    failureReason: null,
  };
}

const ROWS: RunResult[] = [
  {
    instrumentId: 1,
    symbol: "AAPL",
    dataType: "prices",
    outcome: "not_found",
    reason: null,
    attempts: 1,
    completedAt: "2026-09-06T14:10:00Z",
  },
];

function detail(state: RunState, nextCursor: string | null = null): RunDetail {
  return {
    run: run(state),
    counts: {
      instrumentsNamed: 2,
      instrumentsWritten: 1,
      instrumentsFailed: 0,
      resultsByOutcome: { written: 0, unchanged: 0, notFound: 1, failed: 0, skipped: 0 },
    },
    results: ROWS,
    nextCursor,
  };
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={["/runs/r-1"]}>
      <Routes>
        <Route path="/runs/:runId" element={<RunDetailScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Pure fake timers, as runs-screen.polling.test.tsx: the 10 000 ms boundary is exact. */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-06T15:00:00Z"));
  getMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// Implements TC-COMP-097
describe("Run detail polling (DAC-E7-S4-6)", () => {
  it.each<RunState>(["requested", "running", "cancelling"])(
    "polls every 10 000 ms while the run is %s, and stops once it is terminal",
    async (state) => {
      getMock.mockResolvedValueOnce(detail(state)).mockResolvedValue(detail("partial"));
      renderScreen();

      await advance(0);
      screen.getByRole("table");
      expect(getMock).toHaveBeenCalledTimes(1);

      await advance(9_999);
      expect(getMock).toHaveBeenCalledTimes(1);
      await advance(1);
      expect(getMock).toHaveBeenCalledTimes(2);
      expect(getMock).toHaveBeenLastCalledWith("r-1", {});

      await advance(30_000);
      expect(getMock).toHaveBeenCalledTimes(2);
    },
  );

  it("re-requests the filter and page the view currently shows", async () => {
    getMock
      .mockResolvedValueOnce(detail("running"))
      .mockResolvedValueOnce(detail("running", "c1"))
      .mockResolvedValue(detail("running"));
    renderScreen();
    await advance(0);

    fireEvent.change(screen.getByRole("combobox", { name: "Outcome" }), {
      target: { value: "not_found" },
    });
    await advance(0);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await advance(0);
    expect(getMock).toHaveBeenCalledTimes(3);
    expect(getMock).toHaveBeenLastCalledWith("r-1", { outcome: "not_found", cursor: "c1" });

    await advance(10_000);
    expect(getMock).toHaveBeenCalledTimes(4);
    expect(getMock).toHaveBeenLastCalledWith("r-1", { outcome: "not_found", cursor: "c1" });
  });

  it("never polls a run that is terminal on first load", async () => {
    getMock.mockResolvedValue(detail("succeeded"));
    renderScreen();
    await advance(0);
    screen.getByRole("table");

    await advance(10 * 60_000);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it("shows the error and stops when a poll rejects", async () => {
    getMock
      .mockResolvedValueOnce(detail("running"))
      .mockRejectedValueOnce(new ApiError("boom", "req-9"))
      .mockResolvedValue(detail("running"));
    renderScreen();
    await advance(0);

    await advance(10_000);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Loading run r-1 failed: boom (request req-9)",
    );
    await advance(60_000);
    expect(getMock).toHaveBeenCalledTimes(2);
  });

  it("clears its timer on unmount", async () => {
    getMock.mockResolvedValue(detail("running"));
    const view = renderScreen();
    await advance(0);
    screen.getByRole("table");

    view.unmount();
    await advance(10_000);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it("keeps an expanded instrument expanded across a poll", async () => {
    getMock.mockResolvedValue(detail("running"));
    renderScreen();
    await advance(0);

    fireEvent.click(screen.getByRole("button", { name: "Show data types for AAPL" }));
    expect(screen.getByRole("button", { name: "Hide data types for AAPL" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await advance(10_000);
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Hide data types for AAPL" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("updates Last updated after each poll (STD-UI-25)", async () => {
    getMock.mockResolvedValue(detail("running"));
    renderScreen();
    await advance(0);
    expect(
      screen.getByText("Last updated 2026-09-06 10:00:00 America/Chicago"),
    ).toBeInTheDocument();

    await advance(10_000);
    expect(
      screen.getByText("Last updated 2026-09-06 10:00:10 America/Chicago"),
    ).toBeInTheDocument();
  });
});
