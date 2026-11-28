import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ApiUnreachableError,
  listAcquisitionRuns,
  retireInstrument,
} from "../../api/client";
import type { AcquisitionRun, DataType } from "../../api/types";
import { fetchProblems } from "../../app/shell-client";
import type {
  DataHealth,
  Failure,
  ProblemPage,
  ProblemRow,
  ReadState,
} from "../../app/shell-types";
import { DOWNLOAD_NOW, FOLLOW_DIFFERENT, SHOW_MORE, STOP_FOLLOWING, TRY_AGAIN } from "./copy";
import { NeedsFixing } from "./needs-fixing";

vi.mock("../../app/shell-client", async () => {
  const actual =
    await vi.importActual<typeof import("../../app/shell-client")>("../../app/shell-client");
  return { ...actual, fetchProblems: vi.fn() };
});

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listAcquisitionRuns: vi.fn(),
    startAcquisitionRun: vi.fn(),
    retireInstrument: vi.fn(),
  };
});

vi.mock("../../components/ui/toast", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

const refresh = vi.fn();
vi.mock("../../app/shell-context", () => ({ useShell: () => ({ refresh }) }));

const fetchSpy = vi.fn();
const problemsMock = vi.mocked(fetchProblems);
const runsMock = vi.mocked(listAcquisitionRuns);
const retireMock = vi.mocked(retireInstrument);

beforeEach(() => {
  problemsMock.mockReset();
  runsMock.mockReset();
  retireMock.mockReset();
  refresh.mockReset();
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  expect(fetchSpy).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

function FAIL(
  dataType: DataType,
  reason: string | null = "[unavailable] gateway timeout",
  attempts = 2,
): Failure {
  return {
    data_type: dataType,
    outcome: "failed",
    reason,
    attempts,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

/** The one `role="status"` element whose text is exactly `text`. */
async function statusReading(text: string): Promise<HTMLElement> {
  await screen.findByText(text);
  const found = screen.getAllByRole("status").filter((el) => el.textContent === text);
  expect(found).toHaveLength(1);
  return found[0] as HTMLElement;
}

function NF(dataType: DataType): Failure {
  return {
    data_type: dataType,
    outcome: "not_found",
    reason: "no such ticker",
    attempts: 1,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

function ROW(symbol: string, failures: Failure[], retryable: boolean): ProblemRow {
  return { symbol, failures, retryable };
}

function DH(over: Partial<DataHealth> = {}): DataHealth {
  return {
    checked_at: "2026-10-30T19:03:12Z",
    never_acquired: false,
    followed_count: 300,
    affected_count: 2,
    checks: { daily_prices: null, company_financials: null },
    problems: {
      rows: [ROW("FBXX", [NF("reference")], false), ROW("KO", [FAIL("prices")], true)],
      next_cursor: null,
    },
    ...over,
  };
}

function ok(data: DataHealth): ReadState<DataHealth> {
  return { kind: "ok", data, checkedAt: new Date("2026-10-30T19:03:12Z") };
}

const SYMS = Array.from({ length: 120 }, (_, i) => `S${String(i).padStart(3, "0")}`);

function PAGE(from: number, to: number, next: string | null): ProblemPage {
  return {
    rows: SYMS.slice(from, to).map((s) => ROW(s, [FAIL("prices")], true)),
    next_cursor: next,
  };
}

const BAD_CURSOR = new ApiError("`cursor` must be a stock symbol.", "req-422", {
  code: "validation_error",
});
const INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Card({
  state,
  onReread,
}: {
  state: ReadState<DataHealth>;
  onReread: () => void;
}): JSX.Element {
  return (
    <MemoryRouter initialEntries={["/data"]}>
      <NeedsFixing dataHealth={state} onReread={onReread} />
    </MemoryRouter>
  );
}

function renderCard(state: ReadState<DataHealth>, onReread: () => void = vi.fn()) {
  const view = render(<Card state={state} onReread={onReread} />);
  return {
    ...view,
    update: (next: ReadState<DataHealth>) =>
      view.rerender(<Card state={next} onReread={onReread} />),
  };
}

function symbols(): string[] {
  return screen
    .getAllByRole("listitem")
    .map((li) => within(li).getAllByRole("link")[0]?.textContent ?? "");
}

function liveText(container: HTMLElement): string {
  return container.querySelector('[aria-live="polite"]')?.textContent ?? "";
}

// Implements TC-COMP-166
describe("Needs fixing rows and Show more (TC-COMP-166, DAC-E6-S3-2, DAC-E6-9, AC-16, AC-25)", () => {
  it("(a) names the region by its heading, counts from affected_count and checks the time", () => {
    renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const heading = screen.getByRole("heading", { level: 2, name: "Needs fixing · 120" });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("region", { name: "Needs fixing · 120" })).toBeInTheDocument();
    expect(
      screen.getByText("From your most recent downloads · checked 14:03:12 CDT"),
    ).toBeInTheDocument();
    expect(symbols()).toEqual(SYMS.slice(0, 50));
  });

  it("(b) Show more appends each page with the served cursor, keeps focus and announces the count", async () => {
    problemsMock
      .mockResolvedValueOnce(PAGE(50, 100, "S099"))
      .mockResolvedValueOnce(PAGE(100, 120, null));
    const { container } = renderCard(
      ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })),
    );
    const user = userEvent.setup();

    const more = screen.getByRole("button", { name: "Show more" });
    expect(more).toHaveAttribute("data-variant", "outline");
    expect(more).not.toHaveAttribute("aria-busy");
    await user.click(more);
    await waitFor(() => expect(symbols()).toEqual(SYMS.slice(0, 100)));
    expect(problemsMock.mock.calls).toEqual([["S049", 50]]);
    expect(screen.getByRole("button", { name: "Show more" })).toHaveFocus();
    expect(liveText(container)).toBe("Showing 100 of 120 stocks");
    const firstAnnouncement = container.querySelector('[aria-live="polite"] span');
    expect(container.querySelector('[aria-live="polite"]')?.closest("ul")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(symbols()).toEqual(SYMS));
    expect(problemsMock.mock.calls).toEqual([
      ["S049", 50],
      ["S099", 50],
    ]);
    expect(liveText(container)).toBe("Showing 120 of 120 stocks");
    expect(container.querySelector('[aria-live="polite"] span')).not.toBe(firstAnnouncement);
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("tabindex", "-1");
    expect(list).toHaveFocus();
  });

  it("(b) marks Show more busy while a page is pending and ignores a second click", async () => {
    const pending = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(pending.promise);
    renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Show more" }));
    const more = screen.getByRole("button", { name: "Show more" });
    expect(more).toHaveAttribute("aria-busy", "true");
    expect(more).not.toHaveAttribute("disabled");
    await user.click(more);
    expect(problemsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve(PAGE(50, 100, "S099"));
    });
    await waitFor(() => expect(symbols()).toHaveLength(100));
    expect(screen.getByRole("button", { name: "Show more" })).not.toHaveAttribute("aria-busy");
  });

  it("(f) ignores a page that resolves after a new aggregate answer", async () => {
    const pending = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(pending.promise);
    const { update } = renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    update(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    await act(async () => {
      pending.resolve(PAGE(50, 100, null));
    });
    expect(symbols()).toEqual(SYMS.slice(0, 50));
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
  });

  it("(f) ignores a page failure that arrives after a new aggregate answer", async () => {
    const pending = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(pending.promise);
    const { update } = renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    update(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    await act(async () => {
      pending.reject(BAD_CURSOR);
    });
    expect(screen.queryByText(/Couldn't read more problems/)).toBeNull();
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
  });

  it("(f) lets the new answer fetch while an outdated page is still pending", async () => {
    const stale = deferred<ProblemPage>();
    const fresh = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(stale.promise).mockReturnValueOnce(fresh.promise);
    const { update } = renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    update(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const more = screen.getByRole("button", { name: "Show more" });
    expect(more).not.toHaveAttribute("aria-busy");
    await user.click(more);
    expect(problemsMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      stale.resolve(PAGE(50, 100, null));
    });
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-busy", "true");
    await act(async () => {
      fresh.resolve(PAGE(50, 100, "S099"));
    });
    await waitFor(() => expect(symbols()).toHaveLength(100));
  });

  it("(c) shows Download now in the header when any loaded row is retryable", () => {
    renderCard(ok(DH()));
    const heading = screen.getByRole("heading", { level: 2 });
    const download = screen.getByRole("button", { name: "Download now" });
    expect(
      heading.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("list")).not.toContainElement(download);
  });

  it("(c) hides Download now when no loaded row is retryable", () => {
    renderCard(
      ok(
        DH({
          affected_count: 1,
          problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null },
        }),
      ),
    );
    expect(screen.queryByRole("button", { name: "Download now" })).toBeNull();
  });

  it("(c) shows Download now once a later page holds a retryable row", async () => {
    problemsMock.mockResolvedValueOnce({
      rows: [ROW("KO", [FAIL("prices")], true)],
      next_cursor: null,
    });
    renderCard(
      ok(
        DH({
          affected_count: 2,
          problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: "FBXX" },
        }),
      ),
    );
    expect(screen.queryByRole("button", { name: "Download now" })).toBeNull();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(await screen.findByRole("button", { name: "Download now" })).toBeInTheDocument();
  });

  it("(d) has no Show more when next_cursor is null", () => {
    renderCard(ok(DH()));
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
  });

  it("(e) renders the rows in the served order", () => {
    renderCard(ok(DH()));
    expect(symbols()).toEqual(["FBXX", "KO"]);
  });
});

// Implements TC-COMP-166
describe("Needs fixing hand-off cases (DAC-E6-9, AC-16, AC-25)", () => {
  it("names the rows list by the card heading", () => {
    renderCard(ok(DH()));
    expect(screen.getByRole("list", { name: "Needs fixing · 2" })).toBeInTheDocument();
  });

  it("reads the checked time from the aggregate, not from when it arrived", () => {
    renderCard({
      kind: "ok",
      data: DH(),
      checkedAt: new Date("2026-10-30T20:00:00Z"),
    });
    expect(
      screen.getByText("From your most recent downloads · checked 14:03:12 CDT"),
    ).toBeInTheDocument();
  });

  it("leaves focus where the owner put it when the last page loads", async () => {
    const pending = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(pending.promise);
    renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    const link = screen.getByRole("link", { name: "S000, show in the coverage table" });
    act(() => link.focus());
    await act(async () => {
      pending.resolve(PAGE(50, 120, null));
    });
    await waitFor(() => expect(symbols()).toHaveLength(120));
    expect(screen.getByRole("link", { name: "S000, show in the coverage table" })).toHaveFocus();
  });

  it("leaves focus where the owner put it when a page fails", async () => {
    const pending = deferred<ProblemPage>();
    problemsMock.mockReturnValueOnce(pending.promise);
    renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    const link = screen.getByRole("link", { name: "S000, show in the coverage table" });
    act(() => link.focus());
    await act(async () => {
      pending.reject(BAD_CURSOR);
    });
    await screen.findByText(/Couldn't read more problems/);
    expect(screen.getByRole("link", { name: "S000, show in the coverage table" })).toHaveFocus();
  });

  it("moves focus once and does not pull it back on later renders", async () => {
    problemsMock.mockResolvedValueOnce(PAGE(50, 120, null));
    const state = ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") }));
    const { update } = renderCard(state);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(screen.getByRole("list")).toHaveFocus());
    const link = screen.getByRole("link", { name: "S000, show in the coverage table" });
    act(() => link.focus());
    update(state);
    expect(link).toHaveFocus();
  });
});

// Implements TC-COMP-167
describe("Show more failure (TC-COMP-166, TC-COMP-167, DAC-E6-9, DAC-E6-S3-3)", () => {
  async function failFirstMore(error: Error) {
    problemsMock.mockRejectedValueOnce(error);
    const onReread = vi.fn();
    const view = renderCard(
      ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })),
      onReread,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    return { ...view, user, onReread };
  }

  it("(a) keeps the loaded rows, names the failure and moves focus to Try again", async () => {
    await failFirstMore(BAD_CURSOR);
    expect(
      await statusReading("Couldn't read more problems: FactorFlow hit an unexpected problem."),
    ).toBeInTheDocument();
    expect(symbols()).toEqual(SYMS.slice(0, 50));
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
    const again = screen.getByRole("button", { name: "Try again" });
    expect(again).toHaveAttribute("data-variant", "outline");
    expect(again).toHaveFocus();
  });

  it("(b) Try again re-reads the aggregate and never fetches a page", async () => {
    const { user, onReread } = await failFirstMore(BAD_CURSOR);
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(onReread).toHaveBeenCalledTimes(1);
    expect(problemsMock).toHaveBeenCalledTimes(1);
  });

  it("(c) restarts from the first page when a new aggregate answer arrives", async () => {
    const { update } = await failFirstMore(BAD_CURSOR);
    await screen.findByText(/Couldn't read more problems/);
    update(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    await waitFor(() => expect(screen.queryByText(/Couldn't read more problems/)).toBeNull());
    expect(symbols()).toEqual(SYMS.slice(0, 50));
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
  });

  it("(c) drops the pages already loaded when a new aggregate answer arrives", async () => {
    problemsMock.mockResolvedValueOnce(PAGE(50, 100, "S099"));
    const { update } = renderCard(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(symbols()).toHaveLength(100));
    update(ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") })));
    await waitFor(() => expect(symbols()).toHaveLength(50));
    problemsMock.mockResolvedValueOnce(PAGE(50, 100, "S099"));
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(symbols()).toHaveLength(100));
    expect(problemsMock.mock.calls).toEqual([
      ["S049", 50],
      ["S049", 50],
    ]);
  });

  it("(d) reads an unreachable server and any other failure the same way", async () => {
    await failFirstMore(UNREACHABLE);
    expect(
      await statusReading("Couldn't read more problems: FactorFlow is not answering."),
    ).toBeInTheDocument();
  });

  it("(d) reads an internal error as an unexpected problem", async () => {
    await failFirstMore(INTERNAL);
    expect(
      await statusReading("Couldn't read more problems: FactorFlow hit an unexpected problem."),
    ).toBeInTheDocument();
  });

  it("(d) never shows a thrown value's own text", async () => {
    await failFirstMore(new TypeError("raw failure text"));
    await screen.findByText(/Couldn't read more problems/);
    expect(document.body.textContent).not.toContain("raw failure text");
  });

  it("(e) shows no request id and no envelope message", async () => {
    await failFirstMore(BAD_CURSOR);
    await screen.findByText(/Couldn't read more problems/);
    for (const leaked of ["req-422", "req-9f3", "must be a stock symbol", "database said no"]) {
      expect(document.body.textContent).not.toContain(leaked);
    }
  });
});

const ZERO = DH({ affected_count: 0, problems: { rows: [], next_cursor: null } });

function RUN(over: Partial<AcquisitionRun> = {}): AcquisitionRun {
  return {
    runId: "r-9",
    state: "succeeded",
    historyDepthYears: 5,
    requestedAt: "2026-10-29T13:59:00Z",
    startedAt: "2026-10-29T14:00:00Z",
    endedAt: "2026-10-29T15:10:00Z",
    instrumentsNamed: 300,
    instrumentsWritten: 300,
    instrumentsFailed: 0,
    failureReason: null,
    ...over,
  };
}

// Implements TC-COMP-152
describe("Nothing needs fixing (TC-COMP-152, DAC-E6-10, AC-13)", () => {
  it("(a) names the last complete download by its start time", async () => {
    runsMock.mockResolvedValueOnce({ runs: [RUN()], nextCursor: null });
    renderCard(ok(ZERO));
    expect(
      await screen.findByText("Last complete download 2026-10-29 09:00 CDT"),
    ).toBeInTheDocument();
    expect(runsMock.mock.calls).toEqual([[{ state: "succeeded", limit: 1 }]]);
    expect(screen.getByText("Nothing needs fixing.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Needs fixing · 0" })).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Download now" })).toBeNull();
  });

  it("(b) says no complete download yet when there is none", async () => {
    runsMock.mockResolvedValueOnce({ runs: [], nextCursor: null });
    renderCard(ok(ZERO));
    expect(await screen.findByText("No complete download yet")).toBeInTheDocument();
    expect(screen.getByText("Nothing needs fixing.")).toBeInTheDocument();
    expect(screen.queryByText(/Last complete download/)).toBeNull();
  });

  it("(c) falls back to the request time when the download has no start time", async () => {
    runsMock.mockResolvedValueOnce({ runs: [RUN({ startedAt: null })], nextCursor: null });
    renderCard(ok(ZERO));
    expect(
      await screen.findByText("Last complete download 2026-10-29 08:59 CDT"),
    ).toBeInTheDocument();
  });

  it("(d) reads the last complete download only when nothing needs fixing", () => {
    renderCard(ok(DH()));
    expect(runsMock).not.toHaveBeenCalled();
  });

  it("(e) shows a busy placeholder, never the empty wording, while the read is pending", async () => {
    const pending = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock.mockReturnValueOnce(pending.promise);
    const { container } = renderCard(ok(ZERO));
    expect(screen.getByText("Nothing needs fixing.")).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText("No complete download yet")).toBeNull();
    await act(async () => {
      pending.resolve({ runs: [], nextCursor: null });
    });
    expect(await screen.findByText("No complete download yet")).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it("(f) names a failed read and retries only that read", async () => {
    runsMock
      .mockRejectedValueOnce(UNREACHABLE)
      .mockResolvedValueOnce({ runs: [], nextCursor: null });
    const onReread = vi.fn();
    renderCard(ok(ZERO), onReread);
    expect(
      await statusReading("Couldn't read the last complete download: FactorFlow is not answering."),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("No complete download yet")).toBeInTheDocument();
    expect(runsMock.mock.calls).toEqual([
      [{ state: "succeeded", limit: 1 }],
      [{ state: "succeeded", limit: 1 }],
    ]);
    expect(onReread).not.toHaveBeenCalled();
  });

  it("(f) shows no envelope text for an internal failure", async () => {
    runsMock.mockRejectedValueOnce(INTERNAL);
    renderCard(ok(ZERO));
    expect(
      await screen.findByText(
        "Couldn't read the last complete download: FactorFlow hit an unexpected problem.",
      ),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("req-9f3");
    expect(document.body.textContent).not.toContain("database said no");
  });

  it("(g) reads again when a new aggregate answer arrives at zero", async () => {
    runsMock.mockResolvedValueOnce({ runs: [], nextCursor: null });
    const { update } = renderCard(ok(ZERO));
    await screen.findByText("No complete download yet");
    runsMock.mockResolvedValueOnce({ runs: [RUN()], nextCursor: null });
    update(ok(DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })));
    expect(
      await screen.findByText("Last complete download 2026-10-29 09:00 CDT"),
    ).toBeInTheDocument();
    expect(runsMock).toHaveBeenCalledTimes(2);
  });

  it("(f) shows the busy placeholder again while Try again reads", async () => {
    const retry = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock.mockRejectedValueOnce(UNREACHABLE).mockReturnValueOnce(retry.promise);
    const { container } = renderCard(ok(ZERO));
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(/Couldn't read the last complete download/)).toBeNull();
    await act(async () => {
      retry.resolve({ runs: [], nextCursor: null });
    });
    expect(await screen.findByText("No complete download yet")).toBeInTheDocument();
  });

  it("(g) ignores a failure that arrives after a newer answer", async () => {
    const stale = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce({ runs: [], nextCursor: null });
    const { update } = renderCard(ok(ZERO));
    update(ok(DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })));
    await screen.findByText("No complete download yet");
    await act(async () => {
      stale.reject(UNREACHABLE);
    });
    expect(screen.getByText("No complete download yet")).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't read the last complete download/)).toBeNull();
  });

  it("(g) ignores a read that finishes after a newer answer", async () => {
    const stale = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce({ runs: [], nextCursor: null });
    const { update } = renderCard(ok(ZERO));
    update(ok(DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })));
    await screen.findByText("No complete download yet");
    await act(async () => {
      stale.resolve({ runs: [RUN()], nextCursor: null });
    });
    expect(screen.getByText("No complete download yet")).toBeInTheDocument();
    expect(screen.queryByText(/Last complete download/)).toBeNull();
  });
});

describe("Needs fixing states and stop following (DAC-E6-9, DAC-E6-12 wiring, DAC-E6-17, AC-24)", () => {
  it("(a) keeps the heading without a count and shows busy placeholders while loading", () => {
    const { container } = renderCard({ kind: "loading" });
    expect(screen.getByRole("heading", { level: 2, name: "Needs fixing" })).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(container.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Download now" })).toBeNull();
  });

  it("(b) replaces the body with the checks' failure sentence and re-reads on Try again", async () => {
    const onReread = vi.fn();
    renderCard(
      {
        kind: "error",
        error: INTERNAL,
        last: { data: DH(), checkedAt: new Date("2026-10-30T19:03:12Z") },
      },
      onReread,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Needs fixing" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Couldn't read the data health checks: FactorFlow hit an unexpected problem.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(document.body.textContent).not.toContain("req-9f3");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onReread).toHaveBeenCalledTimes(1);
  });

  it("(b) reads an unreachable server in the failure sentence", () => {
    renderCard({ kind: "error", error: UNREACHABLE, last: null });
    expect(
      screen.getByText("Couldn't read the data health checks: FactorFlow is not answering."),
    ).toBeInTheDocument();
  });

  it("(c) opens the one dialog from a row and re-reads once the stop is confirmed", async () => {
    retireMock.mockResolvedValueOnce({ lifecycle: "retired", retiredAt: "2026-10-30T19:10:00Z" });
    const onReread = vi.fn();
    renderCard(ok(DH()), onReread);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    const dialog = screen.getByRole("dialog", { name: "Stop following FBXX" });
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await user.click(within(dialog).getByRole("button", { name: "Stop following" }));
    await waitFor(() => expect(onReread).toHaveBeenCalledTimes(1));
    expect(retireMock).toHaveBeenCalledWith("FBXX");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith("attention");
  });

  it("(d) moves focus to the heading when the stopped row leaves", async () => {
    retireMock.mockResolvedValueOnce({ lifecycle: "retired", retiredAt: "2026-10-30T19:10:00Z" });
    const { update } = renderCard(ok(DH()));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Stop following" }),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    update(
      ok(
        DH({
          affected_count: 1,
          problems: { rows: [ROW("KO", [FAIL("prices")], true)], next_cursor: null },
        }),
      ),
    );
    await waitFor(() => expect(symbols()).toEqual(["KO"]));
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 2, name: "Needs fixing · 1" })).toHaveFocus(),
    );
  });

  it("(c) does not reopen an abandoned dialog when the next answer arrives after a failed read", async () => {
    const { update } = renderCard(ok(DH()));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    update({ kind: "error", error: UNREACHABLE, last: null });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    update(ok(DH()));
    expect(await screen.findByRole("button", { name: "Stop following FBXX" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("(e) keeps a refused dialog open and re-reads once when it closes", async () => {
    retireMock.mockRejectedValueOnce(
      new ApiError("instrument 'FBXX' is already retired", "req-409", {
        code: "instrument_already_retired",
      }),
    );
    const onReread = vi.fn();
    renderCard(ok(DH()), onReread);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Stop following" }),
    );
    await screen.findByText(/you already stopped following it/);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onReread).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onReread).toHaveBeenCalledTimes(1);
  });

  it("(e) does not re-read when an internal failure's dialog closes", async () => {
    retireMock.mockRejectedValueOnce(INTERNAL);
    const onReread = vi.fn();
    renderCard(ok(DH()), onReread);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Stop following" }),
    );
    await screen.findByText(/Couldn't stop following FBXX/);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onReread).not.toHaveBeenCalled();
  });
});

const TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

/** Everything a person or a screen reader meets: the page's text and every accessible name written as an attribute. */
function visibleAndAccessibleText(): string {
  const names = Array.from(document.body.querySelectorAll("[aria-label], [title]")).flatMap(
    (el) => [el.getAttribute("aria-label") ?? "", el.getAttribute("title") ?? ""],
  );
  return [document.body.textContent ?? "", ...names].join("\n");
}

// Implements TC-COMP-168
describe("Needs fixing vocabulary (TC-COMP-168, DAC-E6-S3-4, AC-19)", () => {
  const MIXED = DH({
    affected_count: 120,
    problems: {
      rows: [
        ROW("FBXX", [FAIL("prices"), NF("reference")], true),
        ROW("KO", [FAIL("corporate_actions"), FAIL("fundamentals")], true),
        ...PAGE(2, 50, "S049").rows,
      ],
      next_cursor: "S049",
    },
  });

  it("(b) the term scan is not vacuous", () => {
    expect(TERMS.test("one run")).toBe(true);
    expect(TERMS.test("Retired")).toBe(true);
    expect(TERMS.test("Provider credential")).toBe(true);
    expect(TERMS.test("Downloading")).toBe(false);
    expect(TERMS.test("downloads")).toBe(false);
    expect(TERMS.test("corporate_actions")).toBe(false);
  });

  it.each([
    ["loading", { kind: "loading" } as ReadState<DataHealth>],
    ["error", { kind: "error", error: INTERNAL, last: null } as ReadState<DataHealth>],
    ["unreachable", { kind: "error", error: UNREACHABLE, last: null } as ReadState<DataHealth>],
    ["populated", ok(MIXED)],
  ])("(a) uses no domain term in the %s state", (_name, state) => {
    renderCard(state);
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
  });

  it("(a) uses no domain term after Show more, after its failure or in the dialog", async () => {
    problemsMock.mockResolvedValueOnce(PAGE(50, 100, "S099")).mockRejectedValueOnce(BAD_CURSOR);
    renderCard(ok(MIXED));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await screen.findByText("Showing 100 of 120 stocks");
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await screen.findByText(/Couldn't read more problems/);
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    await user.click(
      screen.getAllByRole("button", { name: "Stop following FBXX" })[0] as HTMLElement,
    );
    expect(screen.getByRole("dialog", { name: "Stop following FBXX" })).toBeInTheDocument();
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
  });

  it("(a) uses no domain term when nothing needs fixing, pending, with one download, with none or failed", async () => {
    const pending = deferred<{ runs: AcquisitionRun[]; nextCursor: string | null }>();
    runsMock.mockReturnValueOnce(pending.promise);
    const { update } = renderCard(ok(ZERO));
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    await act(async () => {
      pending.resolve({ runs: [RUN()], nextCursor: null });
    });
    await screen.findByText(/Last complete download/);
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    runsMock.mockResolvedValueOnce({ runs: [], nextCursor: null });
    update(ok(DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })));
    await screen.findByText("No complete download yet");
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    runsMock.mockRejectedValueOnce(UNREACHABLE);
    update(ok(DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })));
    await screen.findByText(/Couldn't read the last complete download/);
    expect(visibleAndAccessibleText()).not.toMatch(TERMS);
  });

  it("(c) labels every control with a copy.ts constant or a name built from the symbol", () => {
    renderCard(ok(DH({ affected_count: 120, problems: { ...DH().problems, next_cursor: "KO" } })));
    const buttons = screen.getAllByRole("button").map((b) => b.textContent);
    expect(buttons).toEqual(expect.arrayContaining([STOP_FOLLOWING, DOWNLOAD_NOW, SHOW_MORE]));
    for (const text of buttons) {
      expect([STOP_FOLLOWING, DOWNLOAD_NOW, SHOW_MORE, TRY_AGAIN]).toContain(text);
    }
    const links = screen.getAllByRole("link").map((l) => l.textContent);
    for (const text of links) {
      expect(["FBXX", "KO", FOLLOW_DIFFERENT]).toContain(text);
    }
    const badges = Array.from(document.querySelectorAll('[data-variant^="status-"]')).map(
      (b) => b.textContent,
    );
    expect(badges.sort()).toEqual(["Failed", "Not found"]);
  });
});
