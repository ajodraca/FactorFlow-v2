import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun, AcquisitionRunPage } from "../../api/types";
import { interruptedResult, partialResult, recentDownloadsSubline, writtenOf } from "./copy";
import { RecentDownloads } from "./recent-downloads";

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  listAcquisitionRuns: vi.fn(),
}));

const listMock = vi.mocked(listAcquisitionRuns);

beforeEach(() => {
  listMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

/** An `AcquisitionRun` with the defaults of a complete download; independent of the code under test. */
function RUN(over: Partial<AcquisitionRun> = {}): AcquisitionRun {
  return {
    runId: "r-1",
    state: "succeeded",
    historyDepthYears: 5,
    requestedAt: "2026-10-30T13:59:00Z",
    startedAt: "2026-10-30T14:00:00Z",
    endedAt: "2026-10-30T16:30:00Z",
    instrumentsNamed: 1236,
    instrumentsWritten: 1236,
    instrumentsFailed: 0,
    failureReason: null,
    ...over,
  };
}

function PAGE(runs: AcquisitionRun[]): AcquisitionRunPage {
  return { runs, nextCursor: null };
}

function renderRecent() {
  return render(
    <MemoryRouter>
      <RecentDownloads />
    </MemoryRouter>,
  );
}

function regionTable(): HTMLElement {
  return within(screen.getByRole("region", { name: "Recent downloads" })).getByRole("table");
}

/** The body rows, header row excluded. */
function bodyRows(): HTMLElement[] {
  return within(regionTable()).getAllByRole("row").slice(1);
}

/** The three `td` cells of a row: Outcome, Ended, Result. */
function cellsOf(row: HTMLElement): HTMLElement[] {
  return within(row).getAllByRole("cell");
}

function badgeOf(row: HTMLElement): HTMLElement {
  const badge = row.querySelector<HTMLElement>('[data-variant^="status-"]');
  expect(badge).not.toBeNull();
  return badge as HTMLElement;
}

function rowFor(runId: string): HTMLElement {
  const found = bodyRows().filter(
    (row) => within(row).getByRole("link").getAttribute("href") === `/data/downloads/${runId}`,
  );
  expect(found).toHaveLength(1);
  return found[0] as HTMLElement;
}

const FIVE = [
  RUN({
    runId: "r-5",
    state: "partial",
    instrumentsNamed: 1236,
    instrumentsWritten: 1230,
    instrumentsFailed: 6,
  }),
  RUN({ runId: "r-4", state: "abandoned", instrumentsWritten: 611 }),
  RUN({ runId: "r-3", state: "failed", instrumentsWritten: 0, instrumentsFailed: 0 }),
  RUN({ runId: "r-2", state: "cancelled", instrumentsWritten: 400 }),
  RUN({ runId: "r-1" }),
];

describe("Recent downloads rows (TC-COMP-170, DAC-E6-14, DAC-E6-S4-1, AC-12)", () => {
  // Implements TC-COMP-170
  beforeEach(async () => {
    listMock.mockResolvedValue(PAGE(FIVE));
    renderRecent();
    await screen.findByRole("table");
  });

  it("(a) the columns are Started, Outcome, Ended, Result, and each row header links to its download", () => {
    expect(
      within(regionTable())
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Started", "Outcome", "Ended", "Result"]);
    const rows = bodyRows();
    expect(rows).toHaveLength(5);
    rows.forEach((row, index) => {
      const link = within(within(row).getByRole("rowheader")).getByRole("link");
      expect(link).toHaveAccessibleName("2026-10-30 09:00 CDT");
      expect(link.getAttribute("href")).toBe(`/data/downloads/r-${5 - index}`);
    });
  });

  it("(b) a partial download is a warning Partial with its failed count", () => {
    const row = rowFor("r-5");
    expect(badgeOf(row).getAttribute("data-variant")).toBe("status-warning");
    expect(badgeOf(row).textContent).toBe("Partial");
    expect(cellsOf(row)[2]?.textContent).toBe("1,230 of 1,236 stocks, 6 failed");
  });

  it("(c) an abandoned download is a serious Interrupted with its sentence", () => {
    const row = rowFor("r-4");
    expect(badgeOf(row).getAttribute("data-variant")).toBe("status-serious");
    expect(badgeOf(row).textContent).toBe("Interrupted");
    expect(cellsOf(row)[2]?.textContent).toBe(
      "FactorFlow restarted mid-download; 611 kept, the rest picked up next time",
    );
  });

  it("(d) neither Partial nor Interrupted reads as complete", () => {
    for (const id of ["r-5", "r-4"]) {
      const row = rowFor(id);
      expect(row.querySelector('[data-variant="status-good"]')).toBeNull();
      expect(row.textContent).not.toContain("Complete");
    }
  });

  it("(e) the other outcomes use the plain form", () => {
    const complete = rowFor("r-1");
    expect(badgeOf(complete).getAttribute("data-variant")).toBe("status-good");
    expect(badgeOf(complete).textContent).toBe("Complete");
    expect(cellsOf(complete)[2]?.textContent).toBe("1,236 of 1,236 stocks");
    const failed = rowFor("r-3");
    expect(badgeOf(failed).getAttribute("data-variant")).toBe("status-critical");
    expect(badgeOf(failed).textContent).toBe("Failed");
    expect(cellsOf(failed)[2]?.textContent).toBe("0 of 1,236 stocks");
    const cancelled = rowFor("r-2");
    expect(badgeOf(cancelled).getAttribute("data-variant")).toBe("status-neutral");
    expect(badgeOf(cancelled).textContent).toBe("Cancelled by you");
    expect(cellsOf(cancelled)[2]?.textContent).toBe("400 of 1,236 stocks");
  });

  it("(f) each ended download shows its end time", () => {
    for (const row of bodyRows()) {
      expect(cellsOf(row)[1]?.textContent).toBe("2026-10-30 11:30 CDT");
    }
  });
});

describe("Recent downloads Started and Ended cells", () => {
  it("shows the request time for a download that has not started, still linking to it", async () => {
    listMock.mockResolvedValue(
      PAGE([RUN({ runId: "r-9", state: "requested", startedAt: null, endedAt: null })]),
    );
    renderRecent();
    await screen.findByRole("table");
    const link = within(rowFor("r-9")).getByRole("link");
    expect(link).toHaveAccessibleName("2026-10-30 08:59 CDT");
  });

  it("shows an em dash with hidden words, not a time, for a download that has not ended", async () => {
    listMock.mockResolvedValue(
      PAGE([RUN({ runId: "r-9", state: "running", endedAt: null, instrumentsWritten: 700 })]),
    );
    renderRecent();
    await screen.findByRole("table");
    const ended = cellsOf(rowFor("r-9"))[1] as HTMLElement;
    expect(ended.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
    expect(ended.querySelector(".sr-only")?.textContent).toBe("not ended yet");
  });

  it("encodes a run id in the link target", async () => {
    listMock.mockResolvedValue(PAGE([RUN({ runId: "a b/c" })]));
    renderRecent();
    await screen.findByRole("table");
    const link = within(bodyRows()[0] as HTMLElement).getByRole("link");
    expect(link.getAttribute("href")).toBe("/data/downloads/a%20b%2Fc");
  });
});

describe("Recent downloads re-read rule (TC-COMP-171, DAC-E6-S4-2, DAC-E6-14, AC-25)", () => {
  // Implements TC-COMP-171
  it("(a) reads once on load with exactly { limit: 5 } and says when the list answered", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-30T19:03:12Z"));
    listMock.mockResolvedValue(PAGE([RUN({ runId: "r-9", state: "running", endedAt: null })]));
    renderRecent();
    await screen.findByText("Starts when you press Download now · checked 14:03:12 CDT");
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenNthCalledWith(1, { limit: 5 });
  });

  it("(a) says nothing of a check until the list has answered", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    renderRecent();
    expect(screen.getByText("Starts when you press Download now")).toBeInTheDocument();
    expect(screen.queryByText(/checked/)).toBeNull();
  });
});

describe("copy.ts recent downloads and what you follow strings", () => {
  it("(a) the result sentences", () => {
    expect(writtenOf("1,230", "1,236")).toBe("1,230 of 1,236 stocks");
    expect(partialResult("1,230", "1,236", "6")).toBe("1,230 of 1,236 stocks, 6 failed");
    expect(interruptedResult("611")).toBe(
      "FactorFlow restarted mid-download; 611 kept, the rest picked up next time",
    );
  });

  it("(c) the sub-line", () => {
    expect(recentDownloadsSubline(null)).toBe("Starts when you press Download now");
    expect(recentDownloadsSubline("14:03:12 CDT")).toBe(
      "Starts when you press Download now · checked 14:03:12 CDT",
    );
  });
});
