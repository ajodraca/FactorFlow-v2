import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun, AcquisitionRunPage, RunState } from "../../api/types";
import type { ShellContextValue } from "../../app/shell-context";
import type { Attention, LatestDownload, ReadState } from "../../app/shell-types";
import {
  READ_TARGETS,
  depthYears,
  historyKept,
  interruptedResult,
  partialResult,
  progressOf,
  readFailed,
  recentDownloadsSubline,
  writtenOf,
} from "./copy";
import { RecentDownloads } from "./recent-downloads";

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  listAcquisitionRuns: vi.fn(),
}));

const listMock = vi.mocked(listAcquisitionRuns);

const shell = vi.hoisted(() => ({ value: null as unknown as ShellContextValue }));
vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }));

/** Writes a full shell value; `attention` is loading unless a test gives one. */
function setShell(over: Partial<ShellContextValue> = {}) {
  shell.value = {
    health: { liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null },
    attention: { kind: "loading" },
    scores: { kind: "loading" },
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
    ...over,
  };
}

function LATEST(state: RunState, over: Partial<LatestDownload> = {}): LatestDownload {
  return {
    run_id: "r-9",
    state,
    requested_at: "2026-10-30T18:59:00Z",
    started_at: "2026-10-30T19:00:00Z",
    ended_at: null,
    progress: { done: 812, total: 1236 },
    ...over,
  };
}

function ATT(latest: LatestDownload | null): Attention {
  return {
    checked_at: "2026-10-30T19:03:10Z",
    followed_count: 1236,
    prices_as_of: null,
    credential_present: true,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_download: latest,
    latest_terminal_download: null,
    items: [],
  };
}

function ok(data: Attention, iso: string): ReadState<Attention> {
  return { kind: "ok", data, checkedAt: new Date(iso) };
}

const INTERNAL = new ApiError("instrument table said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");

beforeEach(() => {
  listMock.mockReset();
  setShell();
});

afterEach(() => {
  vi.useRealTimers();
  // AC-17: every read is the delivered endpoint unchanged, exactly { limit: 5 }.
  for (const call of listMock.mock.calls) {
    expect(call).toEqual([{ limit: 5 }]);
  }
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

function ui() {
  return (
    <MemoryRouter>
      <RecentDownloads />
    </MemoryRouter>
  );
}

function renderRecent() {
  return render(ui());
}

const SUBLINE = "Starts when you press Download now";
const RUNNING_PAGE = PAGE([
  RUN({ runId: "r-9", state: "running", endedAt: null, instrumentsWritten: 700 }),
]);

/** Mounts at 19:03:12Z with a running answer checked at 19:03:10Z, and waits for the load read. */
async function mountRunning() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-30T19:03:12Z"));
  listMock.mockResolvedValue(RUNNING_PAGE);
  setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
  const view = renderRecent();
  await screen.findByText(`${SUBLINE} · checked 14:03:12 CDT`);
  return view;
}

async function settle() {
  await act(async () => {});
}

function hrefs(): (string | null)[] {
  return bodyRows().map((row) => within(row).getByRole("link").getAttribute("href"));
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

  it("(b) three running answers give one read each and the time advances", async () => {
    const view = await mountRunning();
    const clocks = ["14:03:22", "14:03:32", "14:03:42"];
    for (let i = 1; i <= 3; i++) {
      vi.setSystemTime(new Date(Date.parse("2026-10-30T19:03:12Z") + 10_000 * i));
      setShell({
        attention: ok(
          ATT(LATEST("running", { progress: { done: 812 + i, total: 1236 } })),
          new Date(Date.parse("2026-10-30T19:03:10Z") + 10_000 * i).toISOString(),
        ),
      });
      view.rerender(ui());
      await screen.findByText(`${SUBLINE} · checked ${clocks[i - 1]} CDT`);
      expect(listMock).toHaveBeenCalledTimes(1 + i);
    }
  });

  it("(c) no new answer, no read", async () => {
    const view = await mountRunning();
    view.rerender(ui());
    await settle();
    expect(listMock).toHaveBeenCalledTimes(1);
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
    view.rerender(ui());
    await settle();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("(d) a failed attention read is not an answer", async () => {
    const view = await mountRunning();
    setShell({
      attention: {
        kind: "error",
        error: INTERNAL,
        last: { data: ATT(LATEST("running")), checkedAt: new Date("2026-10-30T19:03:20Z") },
      },
    });
    view.rerender(ui());
    await settle();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("(e) terminal answers give no read and the time stays", async () => {
    const view = await mountRunning();
    const terminal = [
      ["succeeded", "2026-10-30T19:03:20Z"],
      ["partial", "2026-10-30T19:03:30Z"],
    ] as const;
    for (const [state, at] of terminal) {
      vi.setSystemTime(new Date(at));
      setShell({ attention: ok(ATT(LATEST(state, { ended_at: "2026-10-30T19:05:00Z" })), at) });
      view.rerender(ui());
      await settle();
      expect(listMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(`${SUBLINE} · checked 14:03:12 CDT`)).toBeInTheDocument();
    }
  });

  it("(f) a terminal answer from the start reads once, however many answers follow", async () => {
    listMock.mockResolvedValue(PAGE([RUN({ runId: "r-9" })]));
    setShell({ attention: ok(ATT(LATEST("succeeded")), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    await screen.findByRole("table");
    const answers = [LATEST("succeeded"), LATEST("failed"), null];
    for (const [i, latest] of answers.entries()) {
      setShell({ attention: ok(ATT(latest), `2026-10-30T19:03:${20 + i}Z`) });
      view.rerender(ui());
      await settle();
    }
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("(g) a queued or stopping download counts as not finished", async () => {
    listMock.mockResolvedValue(PAGE([RUN({ runId: "r-9" })]));
    setShell({ attention: ok(ATT(LATEST("succeeded")), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    await screen.findByRole("table");
    setShell({
      attention: ok(
        ATT(LATEST("requested", { progress: { done: 0, total: null } })),
        "2026-10-30T19:03:20Z",
      ),
    });
    view.rerender(ui());
    await settle();
    setShell({ attention: ok(ATT(LATEST("cancelling")), "2026-10-30T19:03:30Z") });
    view.rerender(ui());
    await settle();
    expect(listMock).toHaveBeenCalledTimes(3);
  });

  it("(h) the same answer is never read twice, even when it turns unfinished", async () => {
    listMock.mockResolvedValue(PAGE([RUN({ runId: "r-9" })]));
    setShell({ attention: ok(ATT(LATEST("succeeded")), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    await screen.findByRole("table");
    setShell({ attention: ok(ATT(LATEST("succeeded")), "2026-10-30T19:03:20Z") });
    view.rerender(ui());
    await settle();
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:20Z") });
    view.rerender(ui());
    await settle();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the newest read when an older one answers last", async () => {
    let answerOld: (page: AcquisitionRunPage) => void = () => undefined;
    listMock.mockReturnValueOnce(
      new Promise((resolve) => {
        answerOld = resolve;
      }),
    );
    listMock.mockResolvedValueOnce(PAGE([RUN({ runId: "r-2" })]));
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:20Z") });
    view.rerender(ui());
    await screen.findByRole("table");
    await act(async () => answerOld(PAGE([RUN({ runId: "r-1" })])));
    expect(hrefs()).toEqual(["/data/downloads/r-2"]);
  });

  it("(a) says nothing of a check until the list has answered", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    renderRecent();
    expect(screen.getByText("Starts when you press Download now")).toBeInTheDocument();
    expect(screen.queryByText(/checked/)).toBeNull();
  });
});

const RUNNING_THEN_DONE = PAGE([
  RUN({ runId: "r-9", state: "running", endedAt: null, instrumentsWritten: 700 }),
  RUN({ runId: "r-8" }),
]);

describe("Recent downloads progress and order (DAC-E6-14, AC-12, AC-17, DEC-0384)", () => {
  it("(a) a running download shows determinate progress, not its stored count", async () => {
    listMock.mockResolvedValue(RUNNING_THEN_DONE);
    setShell({ attention: ok(ATT(LATEST("running", { run_id: "r-9" })), "2026-10-30T19:03:10Z") });
    renderRecent();
    await screen.findByRole("table");
    const rows = bodyRows();
    expect(hrefs()[0]).toBe("/data/downloads/r-9");
    const running = rows[0] as HTMLElement;
    expect(badgeOf(running).getAttribute("data-variant")).toBe("status-active");
    expect(badgeOf(running).textContent).toBe("Downloading");
    const ended = cellsOf(running)[1] as HTMLElement;
    expect(ended.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
    expect(ended.querySelector(".sr-only")?.textContent).toBe("not ended yet");
    const result = cellsOf(running)[2] as HTMLElement;
    const bar = within(result).getByRole("progressbar", { name: "812 of 1,236 stocks" });
    expect(bar.getAttribute("aria-valuenow")).toBe("812");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("1236");
    expect(result.textContent).not.toContain("700 of 1,236 stocks");
    expect(result.querySelector('[aria-live="polite"]')?.textContent).toBe("812 of 1,236 stocks");
    expect(within(rows[1] as HTMLElement).queryByRole("progressbar")).toBeNull();
  });

  it("(b) the bar is indeterminate while the total is not known, named by the outcome", async () => {
    listMock.mockResolvedValue(
      PAGE([
        RUN({
          runId: "r-9",
          state: "requested",
          startedAt: null,
          endedAt: null,
          instrumentsNamed: 0,
          instrumentsWritten: 0,
        }),
      ]),
    );
    const latest = LATEST("requested", {
      run_id: "r-9",
      started_at: null,
      progress: { done: 0, total: null },
    });
    setShell({ attention: ok(ATT(latest), "2026-10-30T19:03:10Z") });
    renderRecent();
    await screen.findByRole("table");
    const row = bodyRows()[0] as HTMLElement;
    const bar = within(row).getByRole("progressbar", { name: "Queued" });
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(row.textContent).not.toContain("0 of 0");
    expect(row.textContent).not.toContain("of null");
  });

  it("(d) progress belongs only to the matching, unfinished download", async () => {
    listMock.mockResolvedValue(RUNNING_THEN_DONE);
    setShell({ attention: ok(ATT(LATEST("running", { run_id: "r-7" })), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    await screen.findByRole("table");
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(cellsOf(rowFor("r-9"))[2]?.textContent).toBe("700 of 1,236 stocks");
    setShell({
      attention: ok(ATT(LATEST("succeeded", { run_id: "r-9" })), "2026-10-30T19:03:20Z"),
    });
    view.rerender(ui());
    await settle();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("(e) a running download heads the list, then a queued one, order otherwise kept", async () => {
    listMock.mockResolvedValue(
      PAGE([
        RUN({ runId: "r-6", state: "cancelled" }),
        RUN({ runId: "r-5", state: "requested", startedAt: null, endedAt: null }),
        RUN({ runId: "r-4", state: "running", endedAt: null }),
        RUN({ runId: "r-3", state: "partial" }),
        RUN({ runId: "r-2" }),
      ]),
    );
    renderRecent();
    await screen.findByRole("table");
    expect(hrefs()).toEqual([
      "/data/downloads/r-4",
      "/data/downloads/r-5",
      "/data/downloads/r-6",
      "/data/downloads/r-3",
      "/data/downloads/r-2",
    ]);
  });

  it("(e) a stopping download ranks with the running one", async () => {
    listMock.mockResolvedValue(
      PAGE([
        RUN({ runId: "r-3", state: "requested", startedAt: null, endedAt: null }),
        RUN({ runId: "r-2", state: "cancelling", endedAt: null }),
        RUN({ runId: "r-1" }),
      ]),
    );
    renderRecent();
    await screen.findByRole("table");
    expect(hrefs()).toEqual(["/data/downloads/r-2", "/data/downloads/r-3", "/data/downloads/r-1"]);
  });

  it("(e) an already ordered list renders unchanged", async () => {
    listMock.mockResolvedValue(
      PAGE([
        RUN({ runId: "r-4", state: "running", endedAt: null }),
        RUN({ runId: "r-3", state: "partial" }),
        RUN({ runId: "r-2" }),
      ]),
    );
    renderRecent();
    await screen.findByRole("table");
    expect(hrefs()).toEqual(["/data/downloads/r-4", "/data/downloads/r-3", "/data/downloads/r-2"]);
  });
});

describe("Recent downloads read failure (TC-COMP-155, DAC-E6-17, AC-24)", () => {
  // Implements TC-COMP-155
  it("(a) while loading, the heading stays, the body is busy and no table renders", () => {
    listMock.mockReturnValue(new Promise(() => undefined));
    const { container } = renderRecent();
    expect(screen.getByRole("heading", { level: 2, name: "Recent downloads" })).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("(b) a 500 keeps the heading and says what happened, with Try again", async () => {
    listMock.mockRejectedValue(INTERNAL);
    renderRecent();
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe(
      "Couldn't read recent downloads: FactorFlow hit an unexpected problem.",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Recent downloads" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("(c) neither the request id nor the envelope message reaches the page", async () => {
    listMock.mockRejectedValue(INTERNAL);
    const { container } = renderRecent();
    await screen.findByRole("status");
    expect(container.textContent).not.toContain("req-9f3");
    expect(container.textContent).not.toContain("instrument table said no");
    for (const el of container.querySelectorAll("*")) {
      for (const attr of el.attributes) {
        expect(attr.value).not.toContain("req-9f3");
      }
    }
  });

  it("(d) an unreachable interface says it is not answering", async () => {
    listMock.mockRejectedValue(UNREACHABLE);
    renderRecent();
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Couldn't read recent downloads: FactorFlow is not answering.");
  });

  it("(e) Try again reads once more and shows the table", async () => {
    listMock.mockRejectedValueOnce(INTERNAL);
    listMock.mockResolvedValueOnce(PAGE([RUN({ runId: "r-1" })]));
    renderRecent();
    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await screen.findByRole("table");
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(hrefs()).toEqual(["/data/downloads/r-1"]);
  });

  it("(f) a failed re-read replaces the table but keeps the last answered time", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-30T19:03:12Z"));
    listMock.mockResolvedValueOnce(RUNNING_PAGE);
    listMock.mockRejectedValueOnce(INTERNAL);
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
    const view = renderRecent();
    await screen.findByText(`${SUBLINE} · checked 14:03:12 CDT`);
    vi.setSystemTime(new Date("2026-10-30T19:03:22Z"));
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:20Z") });
    view.rerender(ui());
    await screen.findByRole("status");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Recent downloads" })).toBeInTheDocument();
    expect(screen.getByText(`${SUBLINE} · checked 14:03:12 CDT`)).toBeInTheDocument();
  });
});

/** Visible text plus every accessible name and description source (the DAC-E7-3 scan). */
function visibleAndAccessibleText(container: HTMLElement): string {
  const parts = [container.textContent ?? ""];
  for (const el of container.querySelectorAll("*")) {
    for (const name of ["aria-label", "title"]) {
      const value = el.getAttribute(name);
      if (value !== null) {
        parts.push(value);
      }
    }
    for (const name of ["aria-describedby", "aria-labelledby"]) {
      for (const id of (el.getAttribute(name) ?? "").split(" ").filter((x) => x !== "")) {
        parts.push(container.querySelector(`[id="${id}"]`)?.textContent ?? "");
      }
    }
  }
  return parts.join(" ");
}

const FORBIDDEN =
  /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

const ALL_STATES: RunState[] = [
  "requested",
  "running",
  "cancelling",
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "abandoned",
];

describe("Recent downloads vocabulary and badges (TC-COMP-173, TC-COMP-174, DAC-E6-S4-4, DAC-E6-S4-5)", () => {
  // Implements TC-COMP-173
  // Implements TC-COMP-174
  it("(a) the scan is not vacuous", () => {
    expect(FORBIDDEN.test("one run")).toBe(true);
    expect(FORBIDDEN.test("Retired")).toBe(true);
    expect(FORBIDDEN.test("downloads")).toBe(false);
  });

  it("(a) no state shows a domain term in its text or accessible names", async () => {
    const states: { name: string; arrange: () => void }[] = [
      {
        name: "outcomes",
        arrange: () => listMock.mockResolvedValue(PAGE(FIVE)),
      },
      {
        name: "all eight states",
        arrange: () =>
          listMock.mockResolvedValue(
            PAGE(ALL_STATES.map((state) => RUN({ runId: `r-${state}`, state, endedAt: null }))),
          ),
      },
      {
        name: "determinate progress",
        arrange: () => {
          listMock.mockResolvedValue(RUNNING_THEN_DONE);
          setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
        },
      },
      {
        name: "indeterminate progress",
        arrange: () => {
          listMock.mockResolvedValue(
            PAGE([RUN({ runId: "r-9", state: "requested", startedAt: null, endedAt: null })]),
          );
          setShell({
            attention: ok(
              ATT(LATEST("requested", { started_at: null, progress: { done: 0, total: null } })),
              "2026-10-30T19:03:10Z",
            ),
          });
        },
      },
      { name: "internal failure", arrange: () => listMock.mockRejectedValue(INTERNAL) },
      { name: "unreachable", arrange: () => listMock.mockRejectedValue(UNREACHABLE) },
    ];
    for (const { name, arrange } of states) {
      listMock.mockReset();
      setShell();
      arrange();
      const { container, unmount } = renderRecent();
      await screen.findByRole(
        name.startsWith("internal") || name === "unreachable" ? "status" : "table",
      );
      expect(visibleAndAccessibleText(container), name).not.toMatch(FORBIDDEN);
      unmount();
    }
    // The loading state.
    listMock.mockReset();
    listMock.mockReturnValue(new Promise(() => undefined));
    const loading = renderRecent();
    expect(visibleAndAccessibleText(loading.container)).not.toMatch(FORBIDDEN);
  });

  it("(b) each of the eight states has its own word and a hidden shape", async () => {
    const words: Record<RunState, string> = {
      requested: "Queued",
      running: "Downloading",
      cancelling: "Stopping",
      succeeded: "Complete",
      partial: "Partial",
      failed: "Failed",
      cancelled: "Cancelled by you",
      abandoned: "Interrupted",
    };
    listMock.mockResolvedValue(
      PAGE(ALL_STATES.map((state) => RUN({ runId: `r-${state}`, state, endedAt: null }))),
    );
    renderRecent();
    await screen.findByRole("table");
    for (const state of ALL_STATES) {
      const badge = badgeOf(rowFor(`r-${state}`));
      expect(badge.textContent).toBe(words[state]);
      expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(badge.hasAttribute("aria-label")).toBe(false);
      expect(badge.querySelector("[aria-label]")).toBeNull();
    }
  });

  it("(c) every dash is a hidden-word absence and no cell is empty or null", async () => {
    listMock.mockResolvedValue(
      PAGE(ALL_STATES.map((state) => RUN({ runId: `r-${state}`, state, endedAt: null }))),
    );
    renderRecent();
    await screen.findByRole("table");
    for (const row of bodyRows()) {
      for (const cell of [...cellsOf(row), within(row).getByRole("rowheader")]) {
        expect(cell.textContent).not.toBe("");
        expect(cell.textContent).not.toContain("null");
      }
      const ended = cellsOf(row)[1] as HTMLElement;
      expect(ended.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
      expect(ended.querySelector(".sr-only")?.textContent).toBe("not ended yet");
    }
    for (const dash of screen.getAllByText("—")) {
      expect(dash.getAttribute("aria-hidden")).toBe("true");
      expect(dash.parentElement?.querySelector(".sr-only")).not.toBeNull();
    }
  });

  it("(d) every status badge carries text and a shape, and the bar is named by visible text", async () => {
    listMock.mockResolvedValue(RUNNING_THEN_DONE);
    setShell({ attention: ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z") });
    renderRecent();
    await screen.findByRole("table");
    for (const badge of document.querySelectorAll('[data-variant^="status-"]')) {
      expect(badge.textContent).not.toBe("");
      expect(badge.querySelector("svg")).not.toBeNull();
    }
    const bar = screen.getByRole("progressbar");
    const labelledBy = bar.getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelledBy)?.textContent).toBe("812 of 1,236 stocks");
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

  it("(b) the failed-read sentences", () => {
    expect(readFailed(READ_TARGETS.recentDownloads, "x")).toBe(
      "Couldn't read recent downloads: x.",
    );
    expect(readFailed(READ_TARGETS.whatYouFollow, "x")).toBe("Couldn't read what you follow: x.");
  });

  it("(b) the progress sentence", () => {
    expect(progressOf("812", "1,236")).toBe("812 of 1,236 stocks");
  });

  it("(d) the what-you-follow sentences", () => {
    expect(historyKept("2")).toBe("2 (history kept)");
    expect(depthYears("5")).toBe("5 years");
  });

  it("(c) the sub-line", () => {
    expect(recentDownloadsSubline(null)).toBe("Starts when you press Download now");
    expect(recentDownloadsSubline("14:03:12 CDT")).toBe(
      "Starts when you press Download now · checked 14:03:12 CDT",
    );
  });
});
