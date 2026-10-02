import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getHistoryDepth, listAcquisitionRuns, listInstruments } from "../../api/client";
import type { AcquisitionRun, RunState } from "../../api/types";
import { formatTimestamp } from "../../app/status-region";
import RunsScreen from "./index";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listAcquisitionRuns: vi.fn(),
    getHistoryDepth: vi.fn(),
    listInstruments: vi.fn(),
    startAcquisitionRun: vi.fn(),
  };
});

const listRunsMock = vi.mocked(listAcquisitionRuns);

function run(
  state: RunState,
  index: number,
  overrides: Partial<AcquisitionRun> = {},
): AcquisitionRun {
  return {
    runId: `00000000-0000-4000-8000-00000000000${index}`,
    state,
    historyDepthYears: 5,
    requestedAt: `2026-09-0${index}T15:00:00Z`,
    startedAt: `2026-09-0${index}T15:00:05Z`,
    endedAt: `2026-09-0${index}T15:10:00Z`,
    instrumentsNamed: 10,
    instrumentsWritten: 8,
    instrumentsFailed: 2,
    failureReason: null,
    ...overrides,
  };
}

const TERMINAL: AcquisitionRun[] = [
  run("succeeded", 5),
  run("partial", 4),
  run("failed", 3),
  run("cancelled", 2),
  run("abandoned", 1),
];

function renderScreen(): void {
  render(
    <MemoryRouter initialEntries={["/runs"]}>
      <RunsScreen />
    </MemoryRouter>,
  );
}

function rowFor(runId: string): HTMLElement {
  return screen.getByRole("link", { name: runId }).closest("tr") as HTMLElement;
}

beforeEach(() => {
  listRunsMock.mockReset();
  vi.mocked(getHistoryDepth).mockResolvedValue({ years: 5, updatedAt: null });
  vi.mocked(listInstruments).mockResolvedValue({
    rows: [],
    activeCount: 3,
    retiredCount: 0,
    nextCursor: null,
  });
});

// Implements TC-COMP-009
describe("Runs list — outcomes render honestly (AC-9)", () => {
  it("shows each terminal outcome as recorded, partial as a warning", async () => {
    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: null });
    renderScreen();
    await screen.findByRole("table");

    const words: Record<string, string> = {
      succeeded: "Succeeded",
      partial: "Partial",
      failed: "Failed",
      cancelled: "Cancelled",
      abandoned: "Abandoned",
    };
    for (const item of TERMINAL) {
      const badge = within(rowFor(item.runId)).getByTestId("outcome-badge");
      expect(badge).toHaveTextContent(words[item.state]);
      if (item.state !== "succeeded") {
        expect(badge).not.toHaveTextContent("Succeeded");
      }
    }
    expect(within(rowFor(TERMINAL[1].runId)).getByTestId("outcome-badge")).toHaveAttribute(
      "data-variant",
      "status-warning",
    );
  });
});

// Implements TC-COMP-252
describe("Runs list — an abandoned run is explained (DAC-E5-17)", () => {
  it("carries the verbatim explanation, with Start on the same screen", async () => {
    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: null });
    renderScreen();
    await screen.findByRole("table");

    const explanation = within(rowFor(TERMINAL[4].runId)).getByTestId("abandoned-explanation");
    expect(explanation).toHaveTextContent(
      "The process running this acquisition stopped before it finished, and the run was reclaimed. Coverage written before it stopped is kept. Start a new run to continue.",
    );
    expect(screen.getByRole("button", { name: "Start acquisition run" })).toBeInTheDocument();
  });
});

// Implements TC-COMP-288
describe("Runs list — the run id is an anchor to run detail (DAC-E5-S6-4)", () => {
  it("renders the full id as a link, and gives rows no click target", async () => {
    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: null });
    renderScreen();
    await screen.findByRole("table");

    for (const item of TERMINAL) {
      const link = screen.getByRole("link", { name: item.runId });
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", `/runs/${item.runId}`);
    }
    for (const row of screen.getAllByRole("row")) {
      expect(row).not.toHaveAttribute("role", "link");
      expect(row.onclick).toBeNull();
      expect(row).not.toHaveAttribute("onclick");
    }
  });
});

// Implements TC-COMP-291
describe("Runs list — never run says so plainly (DAC-E5-S6-7)", () => {
  it("states that no run has been requested, with no table", async () => {
    listRunsMock.mockResolvedValue({ runs: [], nextCursor: null });
    renderScreen();

    expect(
      await screen.findByText("No acquisition run has been requested yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("No run matches this filter.")).not.toBeInTheDocument();
  });

  it("distinguishes a filtered-empty result from never-run, with a reset", async () => {
    const user = userEvent.setup();
    listRunsMock.mockResolvedValueOnce({ runs: TERMINAL, nextCursor: null });
    renderScreen();
    await screen.findByRole("table");

    listRunsMock.mockResolvedValue({ runs: [], nextCursor: null });
    await user.selectOptions(screen.getByRole("combobox", { name: "Outcome" }), "Failed");

    expect(await screen.findByText("No run matches this filter.")).toBeInTheDocument();
    expect(
      screen.queryByText("No acquisition run has been requested yet."),
    ).not.toBeInTheDocument();
    expect(listRunsMock).toHaveBeenLastCalledWith({ state: "failed" });

    await user.click(screen.getByRole("button", { name: "Reset filter" }));
    await waitFor(() => expect(listRunsMock).toHaveBeenLastCalledWith({}));
  });
});

describe("Runs list — columns and timestamps", () => {
  it("names its columns in order and renders timestamps in America/Chicago", async () => {
    listRunsMock.mockResolvedValue({
      runs: [run("succeeded", 1, { startedAt: null, endedAt: null })],
      nextCursor: null,
    });
    renderScreen();
    const table = await screen.findByRole("table");

    const headers = within(table)
      .getAllByRole("columnheader")
      .map((th) => th.textContent);
    expect(headers).toEqual([
      "Run",
      "Outcome",
      "Requested",
      "Started",
      "Ended",
      "Instruments written",
      "Instruments failed",
    ]);
    for (const th of within(table).getAllByRole("columnheader")) {
      expect(th).toHaveAttribute("scope", "col");
    }

    const row = rowFor(run("succeeded", 1).runId);
    expect(row).toHaveTextContent(formatTimestamp(new Date("2026-09-01T15:00:00Z")));
    expect(formatTimestamp(new Date("2026-09-01T15:00:00Z"))).toBe(
      "2026-09-01 10:00:00 America/Chicago",
    );
    expect(within(row).getAllByText("—")).toHaveLength(2);
    expect(within(row).getAllByText("Not recorded")).toHaveLength(2);
  });
});

describe("Runs list — an in-progress run is pinned first", () => {
  it("renders a running run as the first body row even when returned last", async () => {
    const running = run("running", 9, { endedAt: null });
    listRunsMock.mockResolvedValue({
      runs: [TERMINAL[0], TERMINAL[1], running],
      nextCursor: null,
    });
    renderScreen();
    const table = await screen.findByRole("table");

    const bodyRows = within(table).getAllByRole("row").slice(1);
    expect(bodyRows[0]).toBe(rowFor(running.runId));
    expect(bodyRows[0]).toHaveAttribute("data-in-progress", "true");
    expect(bodyRows[1]).not.toHaveAttribute("data-in-progress");
  });
});

describe("Runs list — error", () => {
  it("keeps the heading and toolbar and offers a retry", async () => {
    const user = userEvent.setup();
    listRunsMock.mockRejectedValueOnce(new ApiError("boom", "req-7"));
    renderScreen();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Loading runs failed: boom (request req-7)");
    expect(screen.getByRole("heading", { level: 1, name: "Runs" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Outcome" })).toBeInTheDocument();

    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: null });
    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });
});

describe("Runs list — truncation is disclosed", () => {
  it("says only the most recent runs are shown when more exist", async () => {
    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: "c1" });
    renderScreen();
    await screen.findByRole("table");
    expect(screen.getByText("Showing the 50 most recent runs.")).toBeInTheDocument();
  });

  it("says nothing when the page is complete", async () => {
    listRunsMock.mockResolvedValue({ runs: TERMINAL, nextCursor: null });
    renderScreen();
    await screen.findByRole("table");
    expect(screen.queryByText("Showing the 50 most recent runs.")).not.toBeInTheDocument();
  });
});
