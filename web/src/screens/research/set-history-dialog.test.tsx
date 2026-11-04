import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type JSX, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassificationApiError, listClassificationSets } from "../../api/classification-client";
import type { ClassificationSet, FactorSummary } from "../../api/classification-types";
import { CELL, RESULTS, SCORE_SET, failureSentence } from "./copy";
import { formatTimestamp } from "./format";
import { SetHistoryDialog } from "./set-history-dialog";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listClassificationSets: vi.fn() };
});

const listMock = vi.mocked(listClassificationSets);

function factor(overrides: Partial<FactorSummary> = {}): FactorSummary {
  return { qualifiedCount: 2846, ranked: true, minPeerSetSize: 30, ...overrides };
}

function makeSet(overrides: Partial<ClassificationSet> = {}): ClassificationSet {
  return {
    setId: "s-1",
    state: "complete",
    classificationDate: "2026-10-16",
    runId: "run-1",
    runStartedAt: "2026-10-16T22:30:00Z",
    runOutcome: "succeeded",
    startedAt: "2026-10-16T22:40:00Z",
    endedAt: "2026-10-16T22:46:00Z",
    failureReason: null,
    latestTradingDay: "2026-10-16",
    activeInstruments: 2846,
    factors: { value: factor(), growth: factor(), momentum: factor() },
    ...overrides,
  };
}

const COMPLETE = makeSet();
const FAILED = makeSet({
  setId: "s-2",
  state: "failed",
  classificationDate: "2026-10-15",
  runId: "run-2",
  runStartedAt: "2026-10-15T22:30:00Z",
  runOutcome: "partial",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: "2026-10-15T22:41:00Z",
  failureReason: "Factor engine could not read prices",
});
const OLDER = makeSet({
  setId: "s-3",
  classificationDate: "2026-10-14",
  runId: "run-3",
  runStartedAt: "2026-10-14T22:30:00Z",
  startedAt: "2026-10-14T22:40:00Z",
  endedAt: "2026-10-14T22:46:00Z",
});
const BUILDING = makeSet({
  setId: "s-4",
  state: "building",
  classificationDate: "2026-10-17",
  runId: "run-4",
  runStartedAt: "2026-10-17T22:30:00Z",
  startedAt: "2026-10-17T22:40:00Z",
  endedAt: null,
});

function Host(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {SCORE_SET.earlierSetsAction}
      </button>
      {open ? <SetHistoryDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function renderHost(): ReturnType<typeof userEvent.setup> {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Host />
    </MemoryRouter>,
  );
  return user;
}

function renderDialog(onClose: () => void = () => undefined): void {
  render(
    <MemoryRouter>
      <SetHistoryDialog onClose={onClose} />
    </MemoryRouter>,
  );
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  listMock.mockReset();
});

// Implements TC-COMP-180 (T004): DAC-E4-S9-4, AC-21.
describe("TC-COMP-180: the Earlier sets dialog opens and returns focus", () => {
  beforeEach(() => {
    listMock.mockResolvedValue({ sets: [COMPLETE, FAILED, OLDER], nextCursor: null });
  });

  it("opens a labelled modal dialog listing the sets in the API's order, one request", async () => {
    const user = renderHost();
    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = await screen.findByRole("dialog", { name: SCORE_SET.earlierSetsTitle });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const table = await within(dialog).findByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0] as HTMLElement).getByText("2026-10-16")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByText("2026-10-15")).toBeInTheDocument();
    expect(within(rows[2] as HTMLElement).getByText("2026-10-14")).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("names each download by its start time as a link, never by a number or id", async () => {
    const user = renderHost();
    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByRole("table");
    for (const set of [COMPLETE, FAILED, OLDER]) {
      const started = formatTimestamp(set.runStartedAt);
      const link = within(dialog).getByRole("link", { name: SCORE_SET.openDownload(started) });
      expect(link).toHaveAttribute("href", `/runs/${set.runId}`);
      expect(link).toHaveTextContent(started);
    }
    expect(formatTimestamp(COMPLETE.runStartedAt)).toBe("2026-10-16 17:30 CDT");
    expect(dialog.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
    expect(dialog.textContent).not.toMatch(/#\d/);
    expect(dialog.textContent).not.toContain("run-1");
  });

  it.each([
    [
      "Close",
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole("button", { name: SCORE_SET.close }));
      },
    ],
    [
      "Escape",
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.keyboard("{Escape}");
      },
    ],
  ])("closing by %s removes the dialog and focuses the opener", async (_name, close) => {
    const user = renderHost();
    const opener = screen.getByRole("button", { name: SCORE_SET.earlierSetsAction });
    await user.click(opener);
    await screen.findByRole("dialog");
    await close(user);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("returns focus to the opener after a keyboard open", async () => {
    const user = renderHost();
    const opener = screen.getByRole("button", { name: SCORE_SET.earlierSetsAction });
    opener.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("has no confirm control: only Close once every set is loaded", async () => {
    const user = renderHost();
    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByRole("table");
    const names = within(dialog)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(names).toEqual([SCORE_SET.close]);
  });
});

// T010: DAC-E4-S9-4, AC-21; Open Gap 3 (DEC-0172).
describe("set history dialog details", () => {
  it("(a) lists the columns in the design's order as native column headers", async () => {
    listMock.mockResolvedValue({ sets: [COMPLETE], nextCursor: null });
    renderDialog();
    const table = await screen.findByRole("table");
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      SCORE_SET.historyColumns.state,
      SCORE_SET.historyColumns.scoresDate,
      SCORE_SET.historyColumns.download,
      SCORE_SET.historyColumns.started,
      SCORE_SET.historyColumns.ended,
      SCORE_SET.historyColumns.valueQualified,
      SCORE_SET.historyColumns.growthQualified,
      SCORE_SET.historyColumns.momentumQualified,
      SCORE_SET.historyColumns.reason,
    ]);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }
    expect(table).toHaveAttribute("data-variant", "history");
  });

  it("(b) shows each state as a word with its tier shape, the times, and the reason as text", async () => {
    listMock.mockResolvedValue({ sets: [BUILDING, COMPLETE, FAILED], nextCursor: null });
    renderDialog();
    const table = await screen.findByRole("table");
    const [building, complete, failed] = within(table).getAllByRole("row").slice(1) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];

    const stateCell = (row: HTMLElement): HTMLElement =>
      within(row).getAllByRole("cell")[0] as HTMLElement;
    const buildingBadge = within(stateCell(building)).getByText(SCORE_SET.updating);
    expect(buildingBadge).toHaveAttribute("data-variant", "status-active");
    expect(buildingBadge.querySelector("svg")).not.toBeNull();
    const completeBadge = within(stateCell(complete)).getByText(SCORE_SET.complete);
    expect(completeBadge).toHaveAttribute("data-variant", "status-good");
    expect(completeBadge.querySelector("svg")).not.toBeNull();
    const failedBadge = within(stateCell(failed)).getByText(SCORE_SET.failed);
    expect(failedBadge).toHaveAttribute("data-variant", "status-critical");
    expect(failedBadge.querySelector("svg")).not.toBeNull();

    // Started and Ended cells (3rd and 4th data cells after State, Scores date, Download).
    const cells = (row: HTMLElement): HTMLElement[] => within(row).getAllByRole("cell");
    expect(cells(complete)[3]).toHaveTextContent(formatTimestamp(COMPLETE.startedAt));
    expect(cells(complete)[4]).toHaveTextContent(formatTimestamp(COMPLETE.endedAt as string));
    expect(cells(building)[3]).toHaveTextContent(formatTimestamp(BUILDING.startedAt));
    expect(cells(building)[4]).toBeEmptyDOMElement();
    expect(cells(failed)[8]).toHaveTextContent("Factor engine could not read prices");
    expect(cells(complete)[8]).toBeEmptyDOMElement();
  });

  it("(b) leaves Ended blank for a building set that carries an end time and for a failed set without one", async () => {
    listMock.mockResolvedValue({
      sets: [
        { ...BUILDING, endedAt: "2026-10-17T22:50:00Z" },
        { ...FAILED, endedAt: null },
      ],
      nextCursor: null,
    });
    renderDialog();
    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    for (const row of rows) {
      expect(within(row).getAllByRole("cell")[4]).toBeEmptyDOMElement();
    }
  });

  it("(b) shows the download's own outcome beside its start time", async () => {
    listMock.mockResolvedValue({ sets: [COMPLETE, FAILED], nextCursor: null });
    renderDialog();
    const table = await screen.findByRole("table");
    const [first, second] = within(table).getAllByRole("row").slice(1) as [
      HTMLElement,
      HTMLElement,
    ];
    expect(within(first).getAllByText(SCORE_SET.complete).length).toBeGreaterThan(0);
    const partial = within(second).getByText(SCORE_SET.partial);
    expect(partial).toHaveAttribute("data-variant", "status-warning");
  });

  it("(c) prints a ranked factor's count and flags an unranked one in text", async () => {
    const unranked = makeSet({
      factors: {
        value: factor({ qualifiedCount: 2846 }),
        growth: factor({ qualifiedCount: 12, ranked: false }),
        momentum: factor({ qualifiedCount: 2700 }),
      },
    });
    listMock.mockResolvedValue({ sets: [unranked], nextCursor: null });
    renderDialog();
    const table = await screen.findByRole("table");
    const row = within(table).getAllByRole("row")[1] as HTMLElement;
    const cells = within(row).getAllByRole("cell");
    expect(cells[5]).toHaveTextContent("2846");
    expect(cells[5]).not.toHaveTextContent(CELL.notEnoughToRank);
    expect(cells[6]).toHaveTextContent(`12 ${CELL.notEnoughToRank}`);
    expect(cells[7]).toHaveTextContent("2700");
    expect(cells[7]).not.toHaveTextContent(CELL.notEnoughToRank);
  });

  it("(d) pages by keyset: first read bare, Show more appends once without duplicates", async () => {
    const user = userEvent.setup();
    const second = deferred<{ sets: ClassificationSet[]; nextCursor: string | null }>();
    listMock.mockResolvedValueOnce({ sets: [COMPLETE, FAILED], nextCursor: "c1" });
    listMock.mockReturnValueOnce(second.promise);
    renderDialog();
    const more = await screen.findByRole("button", { name: SCORE_SET.showMore });
    expect(listMock).toHaveBeenNthCalledWith(1);
    await user.dblClick(more);
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(listMock).toHaveBeenNthCalledWith(2, { cursor: "c1" });
    await act(async () => {
      second.resolve({ sets: [FAILED, OLDER], nextCursor: null });
    });
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(4);
    const dates = within(table)
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[1]?.textContent);
    expect(dates).toEqual(["2026-10-16", "2026-10-15", "2026-10-14"]);
    expect(screen.queryByRole("button", { name: SCORE_SET.showMore })).toBeNull();
  });

  it("(d) keeps focus on Show more after appending", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce({ sets: [COMPLETE], nextCursor: "c1" });
    listMock.mockResolvedValueOnce({ sets: [OLDER], nextCursor: "c2" });
    renderDialog();
    const more = await screen.findByRole("button", { name: SCORE_SET.showMore });
    await user.click(more);
    await waitFor(() =>
      expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3),
    );
    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).toHaveFocus();
  });

  it("(d) moves focus to Close when the last page removes Show more", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce({ sets: [COMPLETE], nextCursor: "c1" });
    listMock.mockResolvedValueOnce({ sets: [OLDER], nextCursor: null });
    renderDialog();
    await user.click(await screen.findByRole("button", { name: SCORE_SET.showMore }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: SCORE_SET.showMore })).toBeNull(),
    );
    expect(screen.getByRole("button", { name: SCORE_SET.close })).toHaveFocus();
  });

  it("(e) shows a status skeleton while the first page loads", async () => {
    const pending = deferred<{ sets: ClassificationSet[]; nextCursor: string | null }>();
    listMock.mockReturnValue(pending.promise);
    renderDialog();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    await act(async () => {
      pending.resolve({ sets: [COMPLETE], nextCursor: null });
    });
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("(e) states a failed read by code in an alert and recovers on Try again", async () => {
    const user = userEvent.setup();
    const error = new ClassificationApiError("raw envelope message", "req-1", {
      code: "internal_error",
      operation: "list-classification-sets",
      resource: "classification-set",
    });
    listMock.mockRejectedValueOnce(error);
    listMock.mockResolvedValueOnce({ sets: [COMPLETE], nextCursor: null });
    renderDialog();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(failureSentence(error));
    expect(alert).not.toHaveTextContent("raw envelope message");
    await user.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("(e) falls back to the unexpected-problem sentence for a network failure", async () => {
    listMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderDialog();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      failureSentence({
        operation: "list-classification-sets",
        resource: "classification-set",
        code: null,
      }),
    );
    expect(alert).not.toHaveTextContent("Failed to fetch");
  });

  it("(e) keeps the loaded rows when the next page fails", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce({ sets: [COMPLETE], nextCursor: "c1" });
    listMock.mockRejectedValueOnce(new TypeError("down"));
    renderDialog();
    await user.click(await screen.findByRole("button", { name: SCORE_SET.showMore }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
    expect(screen.getByRole("button", { name: SCORE_SET.showMore })).toBeInTheDocument();
  });

  it("(f) calls onClose for Close and Escape, starts on Close and traps Tab", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    listMock.mockResolvedValue({ sets: [COMPLETE], nextCursor: null });
    renderDialog(onClose);
    await screen.findByRole("table");
    const close = screen.getByRole("button", { name: SCORE_SET.close });
    expect(close).toHaveFocus();
    const dialog = screen.getByRole("dialog");
    const lastLink = within(dialog).getAllByRole("link").at(-1) as HTMLElement;
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).not.toBe(document.body);
    lastLink.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("(g) ignores a response that arrives after the dialog unmounted", async () => {
    const pending = deferred<{ sets: ClassificationSet[]; nextCursor: string | null }>();
    listMock.mockReturnValue(pending.promise);
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(
      <MemoryRouter>
        <SetHistoryDialog onClose={() => undefined} />
      </MemoryRouter>,
    );
    unmount();
    await act(async () => {
      pending.resolve({ sets: [COMPLETE], nextCursor: null });
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it("(h) renders its text as text: no markup, run number or raw run id", async () => {
    const hostile = makeSet({
      state: "failed",
      failureReason: "<img src=x onerror=alert(1)>",
    });
    listMock.mockResolvedValue({ sets: [hostile], nextCursor: null });
    renderDialog();
    const table = await screen.findByRole("table");
    expect(table.querySelector("img")).toBeNull();
    expect(table).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(screen.getByRole("dialog").textContent).not.toContain("run-1");
  });
});
