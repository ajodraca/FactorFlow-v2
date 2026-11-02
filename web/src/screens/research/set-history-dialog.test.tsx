import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type JSX, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClassificationApiError, listClassificationSets } from "../../api/classification-client";
import type {
  ClassificationSet,
  ClassificationSetPage,
  FactorSummary,
} from "../../api/classification-types";
import { CELL, RESULTS, SCORE_SET, SHELL_ROUTES, failureSentence } from "./copy";
import { formatDate, formatTimestamp } from "./format";
import { SetHistoryDialog } from "./set-history-dialog";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, listClassificationSets: vi.fn() };
});

const setsMock = vi.mocked(listClassificationSets);

// --- Fixtures (classification-api section 2.7, `SetResponse`) --------------

function factor(qualifiedCount: number, ranked = true): FactorSummary {
  return { qualifiedCount, ranked, minPeerSetSize: 30 };
}

function classificationSet(overrides: Partial<ClassificationSet>): ClassificationSet {
  return {
    setId: "set-x",
    state: "complete",
    classificationDate: "2026-10-16",
    runId: "11111111-2222-4333-8444-555555555555",
    runStartedAt: "2026-10-16T22:30:00Z",
    runOutcome: "succeeded",
    startedAt: "2026-10-16T22:40:00Z",
    endedAt: "2026-10-16T22:48:00Z",
    failureReason: null,
    latestTradingDay: "2026-10-16",
    activeInstruments: 120,
    factors: { value: factor(120), growth: factor(118), momentum: factor(120) },
    ...overrides,
  };
}

const NEWEST = classificationSet({
  setId: "set-3",
  runId: "aaaaaaaa-0000-4000-8000-000000000003",
  runStartedAt: "2026-10-16T22:30:00Z",
});
const FAILED = classificationSet({
  setId: "set-2",
  state: "failed",
  classificationDate: "2026-10-15",
  runId: "aaaaaaaa-0000-4000-8000-000000000002",
  runStartedAt: "2026-10-15T22:30:00Z",
  runOutcome: "partial",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: "2026-10-15T23:03:00Z",
  failureReason: "Factor engine could not read prices",
  factors: { value: factor(12, false), growth: factor(118), momentum: factor(29, false) },
});
const OLDEST = classificationSet({
  setId: "set-1",
  classificationDate: "2026-10-14",
  runId: "aaaaaaaa-0000-4000-8000-000000000001",
  runStartedAt: "2026-10-14T22:30:00Z",
  startedAt: "2026-10-14T22:40:00Z",
  endedAt: "2026-10-14T22:47:00Z",
});
const BUILDING = classificationSet({
  setId: "set-4",
  state: "building",
  classificationDate: "2026-10-17",
  runId: "aaaaaaaa-0000-4000-8000-000000000004",
  runStartedAt: "2026-10-17T22:30:00Z",
  startedAt: "2026-10-17T22:40:00Z",
  endedAt: null,
});

function page(sets: ClassificationSet[], nextCursor: string | null = null): ClassificationSetPage {
  return { sets, nextCursor };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function setsFailure(code: string | null = "internal_error"): ClassificationApiError {
  return new ClassificationApiError("raw envelope text that must never render", "req-1", {
    code,
    operation: "list-classification-sets",
    resource: "classification-set",
  });
}

/** The opener S4's as-of line renders, owning the open state, as the screen does. */
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

function renderHost(): void {
  render(
    <MemoryRouter>
      <Host />
    </MemoryRouter>,
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
  const dialog = screen.getByRole("dialog");
  await waitFor(() => expect(within(dialog).getByRole("table")).toBeInTheDocument());
  return dialog;
}

function bodyRows(dialog: HTMLElement): HTMLElement[] {
  const table = within(dialog).getByRole("table");
  return within(table).getAllByRole("row").slice(1);
}

beforeEach(() => {
  setsMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// Implements TC-COMP-180 (T004): DAC-E4-S9-4, AC-21.
describe("TC-COMP-180: Earlier sets opens the history dialog and returns focus", () => {
  it("lists the sets in the API's order, each download named by its linked start time", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([NEWEST, FAILED, OLDEST]));
    renderHost();

    const dialog = await openDialog(user);

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("dialog", { name: SCORE_SET.earlierSetsTitle })).toBe(dialog);
    const rows = bodyRows(dialog);
    expect(rows).toHaveLength(3);
    const expected = [NEWEST, FAILED, OLDEST];
    rows.forEach((row, index) => {
      const set = expected[index] as ClassificationSet;
      const started = formatTimestamp(set.runStartedAt);
      const link = within(row).getByRole("link", { name: SCORE_SET.openDownload(started) });
      expect(link).toHaveAttribute("href", SHELL_ROUTES.download(set.runId));
      expect(link).toHaveTextContent(started);
    });
    expect(formatTimestamp(NEWEST.runStartedAt)).toBe("2026-10-16 17:30 CDT");
    expect(within(rows[0] as HTMLElement).getByRole("link")).toHaveTextContent(
      "2026-10-16 17:30 CDT",
    );
    expect(dialog.textContent).not.toMatch(/#\s*\d/);
    expect(within(dialog).queryByText(/[0-9a-f]{8}-[0-9a-f]{4}/)).toBeNull();
    expect(dialog.textContent).not.toContain(NEWEST.runId);
    expect(setsMock).toHaveBeenCalledTimes(1);
  });

  it("closes by Close and by Escape, returning focus to Earlier sets… each time", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([NEWEST, FAILED, OLDEST]));
    renderHost();
    const opener = screen.getByRole("button", { name: SCORE_SET.earlierSetsAction });

    await openDialog(user);
    await user.click(screen.getByRole("button", { name: SCORE_SET.close }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);

    await openDialog(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("returns focus after a keyboard open, closed either way", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([NEWEST]));
    renderHost();
    const opener = screen.getByRole("button", { name: SCORE_SET.earlierSetsAction });

    opener.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);

    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: SCORE_SET.close }));
    expect(document.activeElement).toBe(opener);
  });

  it("offers no confirm action: Close, and Show more only while a page remains", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValueOnce(page([NEWEST], "c1"));
    renderHost();

    const dialog = await openDialog(user);
    const names = within(dialog)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(names.sort()).toEqual([SCORE_SET.close, SCORE_SET.showMore].sort());
  });
});

// T010: AC-21, DAC-E4-S9-4; DEC-0172.
describe("Set history dialog details", () => {
  it("(a) has the design's nine column headers, in order, on a native history table", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([NEWEST]));
    renderHost();

    const dialog = await openDialog(user);
    const table = within(dialog).getByRole("table");
    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveAttribute("data-variant", "history");
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
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("(b) renders each state as its word and tier, a blank Ended while building, the reason as text", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([BUILDING, NEWEST, FAILED]));
    renderHost();

    const dialog = await openDialog(user);
    const [building, complete, failed] = bodyRows(dialog) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    const cells = (row: HTMLElement): HTMLElement[] => within(row).getAllByRole("cell");

    const stateBadge = (row: HTMLElement): HTMLElement =>
      cells(row)[0]?.querySelector("[data-variant]") as HTMLElement;
    expect(stateBadge(complete)).toHaveTextContent(SCORE_SET.complete);
    expect(stateBadge(complete)).toHaveAttribute("data-variant", "status-good");
    expect(stateBadge(building)).toHaveTextContent(SCORE_SET.updating);
    expect(stateBadge(building)).toHaveAttribute("data-variant", "status-active");
    expect(stateBadge(failed)).toHaveTextContent(SCORE_SET.failed);
    expect(stateBadge(failed)).toHaveAttribute("data-variant", "status-critical");
    for (const row of [building, complete, failed]) {
      // The word and a tier shape, never colour alone.
      expect(stateBadge(row).querySelector("svg[aria-hidden='true']")).not.toBeNull();
    }
    const shapes = [building, complete, failed].map(
      (row) => stateBadge(row).querySelector("svg")?.innerHTML,
    );
    expect(new Set(shapes).size).toBe(3);

    expect(cells(building)[4]?.textContent).toBe("");
    expect(cells(complete)[4]).toHaveTextContent(formatTimestamp(NEWEST.endedAt as string));
    expect(cells(failed)[4]).toHaveTextContent(formatTimestamp(FAILED.endedAt as string));
    expect(cells(failed)[8]?.textContent).toBe("Factor engine could not read prices");
    expect(cells(complete)[8]?.textContent).toBe("");

    expect(cells(complete)[1]?.textContent).toBe(formatDate(NEWEST.classificationDate));
    expect(cells(complete)[3]).toHaveTextContent(formatTimestamp(NEWEST.startedAt));
    // The download's outcome follows its start time (UX design 1.2).
    expect(cells(complete)[2]).toHaveTextContent(SCORE_SET.complete);
    expect(cells(failed)[2]).toHaveTextContent(SCORE_SET.partial);
    expect(cells(failed)[2]?.querySelector("[data-variant='status-warning']")).not.toBeNull();
  });

  it("(b) leaves Ended blank for a building set whatever the read carries", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([{ ...BUILDING, endedAt: "2026-10-17T22:50:00Z" }]));
    renderHost();

    const dialog = await openDialog(user);
    expect(within(bodyRows(dialog)[0] as HTMLElement).getAllByRole("cell")[4]?.textContent).toBe(
      "",
    );
  });

  it("(c) prints each qualified count, followed by Not enough to rank when unranked", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([FAILED]));
    renderHost();

    const dialog = await openDialog(user);
    const cells = within(bodyRows(dialog)[0] as HTMLElement).getAllByRole("cell");
    expect(cells[5]?.textContent).toBe(`12 ${CELL.notEnoughToRank}`);
    expect(cells[6]?.textContent).toBe("118");
    expect(cells[7]?.textContent).toBe(`29 ${CELL.notEnoughToRank}`);
  });

  it("(d) reads the first page with no limit or cursor and appends the next on Show more", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValueOnce(page([BUILDING, NEWEST], "c1"));
    const next = deferred<ClassificationSetPage>();
    setsMock.mockReturnValueOnce(next.promise);
    renderHost();

    const dialog = await openDialog(user);
    expect(setsMock).toHaveBeenNthCalledWith(1);
    const showMore = within(dialog).getByRole("button", { name: SCORE_SET.showMore });
    await user.dblClick(showMore);
    expect(setsMock).toHaveBeenCalledTimes(2);
    expect(setsMock).toHaveBeenNthCalledWith(2, { cursor: "c1" });
    expect(document.activeElement).toBe(showMore);

    // The overlapping row (NEWEST again) is not duplicated.
    await act(async () => {
      next.resolve(page([NEWEST, FAILED, OLDEST], null));
    });
    const rows = bodyRows(dialog);
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => within(row).getByRole("link").textContent)).toEqual(
      [BUILDING, NEWEST, FAILED, OLDEST].map((set) => formatTimestamp(set.runStartedAt)),
    );
    expect(within(dialog).queryByRole("button", { name: SCORE_SET.showMore })).toBeNull();
    expect(setsMock).toHaveBeenCalledTimes(2);
    // Show more left while focused: focus stays in the dialog, on Close, so Escape still closes.
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: SCORE_SET.close }),
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("(d) keeps focus on Show more while a further page remains", async () => {
    const user = userEvent.setup();
    setsMock
      .mockResolvedValueOnce(page([NEWEST], "c1"))
      .mockResolvedValueOnce(page([FAILED], "c2"));
    renderHost();

    const dialog = await openDialog(user);
    const showMore = within(dialog).getByRole("button", { name: SCORE_SET.showMore });
    await user.click(showMore);
    await waitFor(() => expect(bodyRows(dialog)).toHaveLength(2));
    expect(within(dialog).getByRole("button", { name: SCORE_SET.showMore })).toBe(showMore);
    expect(document.activeElement).toBe(showMore);
  });

  it("(e) shows a status skeleton while loading, then the table", async () => {
    const user = userEvent.setup();
    const first = deferred<ClassificationSetPage>();
    setsMock.mockReturnValueOnce(first.promise);
    renderHost();

    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("status")).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(within(dialog).queryByRole("table")).toBeNull();

    await act(async () => {
      first.resolve(page([NEWEST]));
    });
    expect(within(dialog).queryByRole("status")).toBeNull();
    expect(dialog).not.toHaveAttribute("aria-busy");
    expect(within(dialog).getByRole("table")).toBeInTheDocument();
  });

  it("(e) states a failed read by its sentence, never the message, and recovers on Try again", async () => {
    const user = userEvent.setup();
    setsMock.mockRejectedValueOnce(setsFailure()).mockResolvedValueOnce(page([NEWEST]));
    renderHost();

    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const dialog = screen.getByRole("dialog");
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(failureSentence(setsFailure()));
    expect(dialog.textContent).not.toContain("raw envelope text");
    expect(within(dialog).queryByRole("table")).toBeNull();

    await user.click(within(dialog).getByRole("button", { name: RESULTS.tryAgain }));
    expect(setsMock).toHaveBeenCalledTimes(2);
    expect(setsMock).toHaveBeenNthCalledWith(2);
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: SCORE_SET.close }),
    );
    await waitFor(() => expect(within(dialog).getByRole("table")).toBeInTheDocument());
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });

  it("(e) states a network failure with the operation's generic sentence", async () => {
    const user = userEvent.setup();
    setsMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderHost();

    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    const alert = await within(screen.getByRole("dialog")).findByRole("alert");
    expect(alert).toHaveTextContent(
      failureSentence({
        operation: "list-classification-sets",
        resource: "classification-set",
        code: null,
      }),
    );
    expect(alert.textContent).not.toContain("Failed to fetch");
  });

  it("(e) keeps the loaded rows when the next page fails, and Try again reads that page", async () => {
    const user = userEvent.setup();
    setsMock
      .mockResolvedValueOnce(page([NEWEST], "c1"))
      .mockRejectedValueOnce(setsFailure("cursor_stale"))
      .mockResolvedValueOnce(page([FAILED], null));
    renderHost();

    const dialog = await openDialog(user);
    const close = within(dialog).getByRole("button", { name: SCORE_SET.close });
    within(dialog).getByRole("button", { name: SCORE_SET.showMore }).focus();
    await user.keyboard("{Enter}");
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(failureSentence(setsFailure("cursor_stale")));
    expect(bodyRows(dialog)).toHaveLength(1);
    // The focused Show more left with the failure: focus is on Close, not the page.
    expect(document.activeElement).toBe(close);

    const tryAgain = within(dialog).getByRole("button", { name: RESULTS.tryAgain });
    tryAgain.focus();
    await user.keyboard("{Enter}");
    expect(setsMock).toHaveBeenNthCalledWith(3, { cursor: "c1" });
    expect(document.activeElement).toBe(close);
    await waitFor(() => expect(bodyRows(dialog)).toHaveLength(2));
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });

  it("(f) puts initial focus on Close, calls onClose on Escape and Close, and traps Tab", async () => {
    const user = userEvent.setup();
    setsMock.mockResolvedValue(page([NEWEST], "c1"));
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SetHistoryDialog onClose={onClose} />
      </MemoryRouter>,
    );
    const close = screen.getByRole("button", { name: SCORE_SET.close });
    expect(document.activeElement).toBe(close);
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    // Close is the dialog's last control: Tab wraps to its first.
    close.focus();
    await user.tab();
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(within(dialog).getAllByRole("link")[0]);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(close);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(close);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("(g) drops a response that arrives after the dialog closed", async () => {
    const user = userEvent.setup();
    const first = deferred<ClassificationSetPage>();
    setsMock.mockReturnValueOnce(first.promise);
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderHost();

    await user.click(screen.getByRole("button", { name: SCORE_SET.earlierSetsAction }));
    await user.click(screen.getByRole("button", { name: SCORE_SET.close }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await act(async () => {
      first.resolve(page([NEWEST]));
    });
    expect(screen.queryByRole("table")).toBeNull();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it("(h) renders the reason as text, with no markup, run number or raw run id", async () => {
    const user = userEvent.setup();
    const hostile = classificationSet({
      ...FAILED,
      failureReason: "<b>bold</b> reason",
    });
    setsMock.mockResolvedValue(page([hostile]));
    renderHost();

    const dialog = await openDialog(user);
    expect(dialog.querySelector("b")).toBeNull();
    expect(dialog.textContent).toContain("<b>bold</b> reason");
    expect(dialog.textContent).not.toContain(FAILED.runId);
    expect(dialog.textContent).not.toMatch(/#\s*\d/);
  });
});
