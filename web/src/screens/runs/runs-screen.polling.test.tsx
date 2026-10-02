import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHistoryDepth, listAcquisitionRuns, listInstruments } from "../../api/client";
import type { AcquisitionRun, AcquisitionRunPage, RunState } from "../../api/types";
import RunsScreen from "./index";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listAcquisitionRuns: vi.fn(),
    getHistoryDepth: vi.fn(),
    listInstruments: vi.fn(),
  };
});

const listRunsMock = vi.mocked(listAcquisitionRuns);

function run(state: RunState, id: string): AcquisitionRun {
  return {
    runId: id,
    state,
    historyDepthYears: 5,
    requestedAt: "2026-09-06T14:00:00Z",
    startedAt: null,
    endedAt: null,
    instrumentsNamed: 3,
    instrumentsWritten: 0,
    instrumentsFailed: 0,
    failureReason: null,
  };
}

const TERMINAL_PAGE: AcquisitionRunPage = {
  runs: [run("succeeded", "r-1"), run("cancelled", "r-0")],
  nextCursor: null,
};

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={["/runs"]}>
      <RunsScreen />
    </MemoryRouter>,
  );
}

/**
 * Pure fake timers, not `shouldAdvanceTime`: real milliseconds leaking into
 * the fake clock would make the exact 10 000 ms boundary below flaky. Mocked
 * calls resolve on microtasks, which `advanceTimersByTimeAsync` flushes.
 */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-06T15:00:00Z"));
  listRunsMock.mockReset();
  vi.mocked(getHistoryDepth).mockResolvedValue({ years: 5, updatedAt: null });
  vi.mocked(listInstruments).mockResolvedValue({
    rows: [],
    activeCount: 3,
    retiredCount: 0,
    nextCursor: null,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

// Implements TC-COMP-285
describe("Runs screen polling (DAC-E5-S6-1)", () => {
  it.each<RunState>(["running", "requested", "cancelling"])(
    "polls every 10 000 ms while a %s run is loaded, and stops once all are terminal",
    async (state) => {
      listRunsMock
        .mockResolvedValueOnce({ runs: [run(state, "r-2")], nextCursor: null })
        .mockResolvedValue(TERMINAL_PAGE);
      renderScreen();

      await advance(0);
      screen.getByRole("table");
      expect(listRunsMock).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText("Last updated 2026-09-06 10:00:00 America/Chicago"),
      ).toBeInTheDocument();

      await advance(9_999);
      expect(listRunsMock).toHaveBeenCalledTimes(1);
      await advance(1);
      expect(listRunsMock).toHaveBeenCalledTimes(2);

      await advance(10 * 60_000);
      expect(listRunsMock).toHaveBeenCalledTimes(2);
    },
  );

  it("makes no request at all after an all-terminal first response", async () => {
    listRunsMock.mockResolvedValue(TERMINAL_PAGE);
    renderScreen();
    await advance(0);
    screen.getByRole("table");

    await advance(10 * 60_000);
    expect(listRunsMock).toHaveBeenCalledTimes(1);
  });

  it("clears its timer on unmount", async () => {
    listRunsMock.mockResolvedValue({ runs: [run("running", "r-2")], nextCursor: null });
    const view = renderScreen();
    await advance(0);
    screen.getByRole("table");

    view.unmount();
    await advance(10_000);
    expect(listRunsMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous rows, marked busy, while a poll is in flight", async () => {
    let resolveSecond: (page: AcquisitionRunPage) => void = () => undefined;
    listRunsMock
      .mockResolvedValueOnce({ runs: [run("running", "r-2")], nextCursor: null })
      .mockReturnValueOnce(
        new Promise<AcquisitionRunPage>((done) => {
          resolveSecond = done;
        }),
      );
    renderScreen();
    await advance(0);
    screen.getByRole("table");

    await advance(10_000);
    expect(listRunsMock).toHaveBeenCalledTimes(2);

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("link", { name: "r-2" })).toBeInTheDocument();
    expect(screen.queryByText("Loading runs…")).not.toBeInTheDocument();

    await act(async () => {
      resolveSecond(TERMINAL_PAGE);
    });
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "false");
  });
});
