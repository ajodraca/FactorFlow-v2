import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../api/client";
import { fetchAttention, fetchDataHealth, fetchProblems, fetchScoreSummary } from "./shell-client";
import type {
  Attention,
  DataHealth,
  ProblemPage,
  ReadState,
  ScoreState,
  ScoreSummary,
} from "./shell-types";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => response.clone());
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** The URL and init the stub's first call received. */
function firstCall(fetchMock: ReturnType<typeof vi.fn>): {
  url: URL;
  path: string;
  init: RequestInit | undefined;
} {
  const [input, init] = fetchMock.mock.calls[0] as [string, RequestInit | undefined];
  return { url: new URL(input, "http://localhost"), path: input.split("?")[0] ?? "", init };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Every type below is written out here, from data-health-api section 2.4,
// system design section 4.2 and `classification_models.py:455-585`, so the
// assertions compare shell-types.ts against an independent literal rather than
// against itself. `toEqualTypeOf` (not the looser match form) rejects an added,
// renamed or widened field; `npx tsc --noEmit` enforces it.

type RunStateLiteral =
  | "requested"
  | "running"
  | "cancelling"
  | "succeeded"
  | "partial"
  | "failed"
  | "cancelled"
  | "abandoned";

type DataTypeLiteral = "reference" | "prices" | "fundamentals" | "corporate_actions";

type AttentionLiteral = {
  checked_at: string;
  followed_count: number;
  prices_as_of: string | null;
  credential_present: boolean;
  problems: {
    stock_count: number;
    symbols: string[];
    newest_completed_at: string | null;
  };
  latest_download: {
    run_id: string;
    state: RunStateLiteral;
    requested_at: string;
    started_at: string | null;
    ended_at: string | null;
    progress: { done: number; total: number | null };
  } | null;
  latest_terminal_download: {
    run_id: string;
    state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned";
    ended_at: string;
    failure_reason: string | null;
  } | null;
  items: {
    kind: "data_problems" | "download_not_complete" | "credential_missing";
    recorded_at: string;
    run_id: string | null;
  }[];
};

type ProblemPageLiteral = {
  rows: {
    symbol: string;
    failures: {
      data_type: DataTypeLiteral;
      outcome: "failed" | "not_found";
      reason: string | null;
      attempts: number;
      completed_at: string;
      run_id: string;
    }[];
    retryable: boolean;
  }[];
  next_cursor: string | null;
};

type DataHealthLiteral = {
  checked_at: string;
  never_acquired: boolean;
  followed_count: number;
  affected_count: number;
  checks: {
    daily_prices: {
      status: "ok" | "exceptions" | "not_determinable";
      absent_count: number;
      gap_stock_count: number | null;
      behind_count: number;
      latest_session: string | null;
      gap_detection: { available: boolean; reason: string | null };
      exception_count: number;
      exception_symbols: string[];
    } | null;
    company_financials: {
      status: "ok" | "exceptions";
      absent_count: number;
      problem_count: number;
      as_of: string | null;
      exception_count: number;
      exception_symbols: string[];
    } | null;
  };
  problems: ProblemPageLiteral;
};

type ScoreSummaryLiteral = {
  never_classified: boolean;
  set: {
    set_id: string;
    classification_date: string;
    run_id: string;
    run_started_at: string;
    run_outcome: "succeeded" | "partial";
    state: "complete";
    started_at: string;
    ended_at: string;
    latest_trading_day: string;
    active_instruments: number;
    not_current: boolean;
  } | null;
  later: {
    set_id: string;
    state: "building" | "failed";
    started_at: string;
    ended_at: string | null;
    failure_reason: string | null;
    run_id: string;
    run_started_at: string;
  } | null;
  factors: Record<
    "value" | "growth" | "momentum",
    { qualified_count: number; ranked: boolean; min_peer_set_size: number }
  >;
  stocks_current: { current_count: number; followed_count: number } | null;
};

// Implements TC-COMP-068 (DAC-E3-18, DAC-E3-S1-4, AC-8, AC-16): Attention
// mirrors the wire shape field for field, with no field added or renamed.
describe("TC-COMP-068 — Attention mirrors AttentionResponse", () => {
  it("is exactly the wire shape", () => {
    expectTypeOf<Attention>().toEqualTypeOf<AttentionLiteral>();
  });

  it("carries the recorded terminal state and failure_reason", () => {
    expectTypeOf<Attention["latest_terminal_download"]>().toEqualTypeOf<{
      run_id: string;
      state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned";
      ended_at: string;
      failure_reason: string | null;
    } | null>();
  });

  it("carries problems.stock_count as a number (AC-16)", () => {
    expectTypeOf<Attention["problems"]["stock_count"]>().toEqualTypeOf<number>();
  });
});

// The other wire shapes and the two state unions (DAC-E3-18, DAC-E3-S1-4).
describe("shell-types mirror the other wire shapes", () => {
  it("DataHealth is exactly DataHealthResponse", () => {
    expectTypeOf<DataHealth>().toEqualTypeOf<DataHealthLiteral>();
  });

  it("ProblemPage is exactly ProblemPageResponse", () => {
    expectTypeOf<ProblemPage>().toEqualTypeOf<ProblemPageLiteral>();
  });

  it("ScoreSummary is exactly ClassificationSummaryResponse, snake_case as served", () => {
    expectTypeOf<ScoreSummary>().toEqualTypeOf<ScoreSummaryLiteral>();
  });

  it("ReadState<T> is owner-shell 2.3's union", () => {
    expectTypeOf<ReadState<string>>().toEqualTypeOf<
      | { kind: "loading" }
      | { kind: "ok"; data: string; checkedAt: Date }
      | {
          kind: "error";
          error: ApiError | ApiUnreachableError;
          last: { data: string; checkedAt: Date } | null;
        }
    >();
  });

  it("ScoreState is owner-shell 2.3's union", () => {
    expectTypeOf<ScoreState>().toEqualTypeOf<
      | { kind: "loading" }
      | { kind: "served"; data: ScoreSummaryLiteral; checkedAt: Date }
      | { kind: "not_served" }
      | {
          kind: "error";
          error: ApiError | ApiUnreachableError;
          last: ScoreSummaryLiteral | null;
        }
    >();
  });
});

const problemPageFixture = {
  rows: [
    {
      symbol: "KO",
      failures: [
        {
          data_type: "prices",
          outcome: "failed",
          reason: "provider timeout",
          attempts: 3,
          completed_at: "2026-10-15T22:31:00+00:00",
          run_id: "6f1c2a0e-0000-4000-8000-000000000001",
        },
      ],
      retryable: true,
    },
  ],
  next_cursor: "KO",
};

// Implements TC-COMP-067 (DAC-E3-S1-3, AC-13): fetchProblems sends `limit`
// and, only when set, `cursor`; `next_cursor` is returned as served.
describe("TC-COMP-067 — fetchProblems encodes limit and cursor", () => {
  it("sends limit and no cursor when the cursor is undefined", async () => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await expect(fetchProblems(undefined, 50)).resolves.toEqual(problemPageFixture);
    const { url, path } = firstCall(fetchMock);
    expect(path).toBe("/api/data-health/problems");
    expect(url.searchParams.get("limit")).toBe("50");
    expect(url.searchParams.has("cursor")).toBe(false);
  });

  it("sends limit and cursor when the cursor is set", async () => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await expect(fetchProblems("KO", 50)).resolves.toEqual(problemPageFixture);
    const { url } = firstCall(fetchMock);
    expect(url.searchParams.get("limit")).toBe("50");
    expect(url.searchParams.get("cursor")).toBe("KO");
  });

  it("keeps a null next_cursor null", async () => {
    const lastPage = { ...problemPageFixture, next_cursor: null };
    stubFetch(jsonResponse(200, lastPage));
    const page = await fetchProblems(undefined, 50);
    expect(page.next_cursor).toBeNull();
  });
});

// Request-encoding edge cases (DAC-E3-S1-3, DAC-E3-18).
describe("fetchProblems request encoding", () => {
  it("sends no cursor for null, the value data-health-ui holds after the last page", async () => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await fetchProblems(null, 50);
    expect(firstCall(fetchMock).url.searchParams.has("cursor")).toBe(false);
  });

  it("sends an empty-string cursor as given, not as the first page", async () => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await fetchProblems("", 50);
    const { url } = firstCall(fetchMock);
    expect(url.searchParams.has("cursor")).toBe(true);
    expect(url.searchParams.get("cursor")).toBe("");
  });

  it("sends a cursor with a slash intact and a limit as given", async () => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await fetchProblems("BRK/B", 7);
    const { url } = firstCall(fetchMock);
    expect(url.searchParams.get("cursor")).toBe("BRK/B");
    expect(url.searchParams.get("limit")).toBe("7");
  });

  it.each([
    ["fetchAttention", () => fetchAttention()],
    ["fetchDataHealth", () => fetchDataHealth()],
    ["fetchProblems", () => fetchProblems(undefined, 50)],
    ["fetchScoreSummary", () => fetchScoreSummary()],
  ])("%s sends GET with Accept: application/json and no method override", async (_name, call) => {
    const fetchMock = stubFetch(jsonResponse(200, problemPageFixture));
    await call();
    const { init } = firstCall(fetchMock);
    expect(init?.method).toBeUndefined();
    expect(new Headers(init?.headers).get("Accept")).toBe("application/json");
  });
});

const attentionFixtures = [
  {
    checked_at: "2026-10-15T22:40:00+00:00",
    followed_count: 12,
    prices_as_of: "2026-10-15",
    credential_present: true,
    problems: {
      stock_count: 2,
      symbols: ["KO", "BRK/B"],
      newest_completed_at: "2026-10-15T22:31:00+00:00",
    },
    latest_download: {
      run_id: "6f1c2a0e-0000-4000-8000-000000000002",
      state: "running",
      requested_at: "2026-10-15T22:30:00+00:00",
      started_at: "2026-10-15T22:30:05+00:00",
      ended_at: null,
      progress: { done: 4, total: 12 },
    },
    latest_terminal_download: {
      run_id: "6f1c2a0e-0000-4000-8000-000000000001",
      state: "partial",
      ended_at: "2026-10-14T22:31:00+00:00",
      failure_reason: "provider timeout",
    },
    items: [
      { kind: "data_problems", recorded_at: "2026-10-15T22:31:00+00:00", run_id: null },
      {
        kind: "download_not_complete",
        recorded_at: "2026-10-14T22:31:00+00:00",
        run_id: "6f1c2a0e-0000-4000-8000-000000000001",
      },
    ],
  },
  {
    checked_at: "2026-10-15T22:41:00+00:00",
    followed_count: 0,
    prices_as_of: null,
    credential_present: false,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_download: null,
    latest_terminal_download: null,
    items: [],
  },
  {
    checked_at: "2026-10-15T22:42:00+00:00",
    followed_count: 3,
    prices_as_of: "2026-10-14",
    credential_present: true,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_download: {
      run_id: "6f1c2a0e-0000-4000-8000-000000000003",
      state: "requested",
      requested_at: "2026-10-15T22:42:00+00:00",
      started_at: null,
      ended_at: null,
      progress: { done: 0, total: null },
    },
    latest_terminal_download: null,
    items: [],
  },
];

const dataHealthFixtures = [
  {
    checked_at: "2026-10-15T22:40:00+00:00",
    never_acquired: false,
    followed_count: 12,
    affected_count: 2,
    checks: {
      daily_prices: {
        status: "exceptions",
        absent_count: 1,
        gap_stock_count: 3,
        behind_count: 2,
        latest_session: "2026-10-15",
        gap_detection: { available: true, reason: null },
        exception_count: 1,
        exception_symbols: ["KO"],
      },
      company_financials: {
        status: "ok",
        absent_count: 0,
        problem_count: 0,
        as_of: "2026-09-30",
        exception_count: 0,
        exception_symbols: [],
      },
    },
    problems: problemPageFixture,
  },
  {
    checked_at: "2026-10-15T22:41:00+00:00",
    never_acquired: true,
    followed_count: 0,
    affected_count: 0,
    checks: { daily_prices: null, company_financials: null },
    problems: { rows: [], next_cursor: null },
  },
  {
    checked_at: "2026-10-15T22:42:00+00:00",
    never_acquired: false,
    followed_count: 3,
    affected_count: 0,
    checks: {
      daily_prices: {
        status: "not_determinable",
        absent_count: 0,
        gap_stock_count: null,
        behind_count: 0,
        latest_session: null,
        gap_detection: { available: false, reason: "no trading calendar" },
        exception_count: 0,
        exception_symbols: [],
      },
      company_financials: null,
    },
    problems: { rows: [], next_cursor: null },
  },
];

// Implements TC-COMP-068 (AC-8, AC-16, DAC-E3-18): each read requests its exact
// path and resolves the served body unchanged, nullables populated and null.
describe("fetchAttention and fetchDataHealth", () => {
  it.each(attentionFixtures)(
    "fetchAttention requests /api/attention and returns the body",
    async (fixture) => {
      const fetchMock = stubFetch(jsonResponse(200, fixture));
      await expect(fetchAttention()).resolves.toEqual(fixture);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(firstCall(fetchMock).path).toBe("/api/attention");
    },
  );

  it.each(dataHealthFixtures)(
    "fetchDataHealth requests /api/data-health and returns the body",
    async (fixture) => {
      const fetchMock = stubFetch(jsonResponse(200, fixture));
      await expect(fetchDataHealth()).resolves.toEqual(fixture);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(firstCall(fetchMock).path).toBe("/api/data-health");
    },
  );

  it("rejects a 500 envelope with ApiError", async () => {
    stubFetch(
      jsonResponse(500, { error: { code: "internal_error", message: "x", request_id: "req-500" } }),
    );
    await expect(fetchAttention()).rejects.toBeInstanceOf(ApiError);
    await expect(fetchDataHealth()).rejects.toBeInstanceOf(ApiError);
  });

  it("rejects a thrown fetch with ApiUnreachableError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    await expect(fetchAttention()).rejects.toBeInstanceOf(ApiUnreachableError);
    await expect(fetchDataHealth()).rejects.toBeInstanceOf(ApiUnreachableError);
  });
});

const summaryFixture = {
  never_classified: false,
  set: {
    set_id: "set-1",
    classification_date: "2026-10-15",
    run_id: "6f1c2a0e-0000-4000-8000-000000000004",
    run_started_at: "2026-10-15T22:00:00+00:00",
    run_outcome: "succeeded",
    state: "complete",
    started_at: "2026-10-15T22:00:05+00:00",
    ended_at: "2026-10-15T22:10:00+00:00",
    latest_trading_day: "2026-10-15",
    active_instruments: 12,
    not_current: false,
  },
  later: null,
  factors: {
    value: { qualified_count: 10, ranked: true, min_peer_set_size: 5 },
    growth: { qualified_count: 9, ranked: true, min_peer_set_size: 5 },
    momentum: { qualified_count: 0, ranked: false, min_peer_set_size: 5 },
  },
  stocks_current: { current_count: 11, followed_count: 12 },
};

const notFoundEnvelope = {
  error: {
    code: "not_found",
    message: "No resource exists at this path.",
    resource: "classifications",
    request_id: "req-404",
  },
};

// Implements TC-COMP-066 (DAC-E3-S1-2, AC-24): a summary 404 not_found resolves
// to not_served; every other failure rejects as delivered.
describe("TC-COMP-066 — fetchScoreSummary maps 404 not_found to not_served", () => {
  it("resolves { kind: not_served } on a 404 not_found envelope", async () => {
    const fetchMock = stubFetch(jsonResponse(404, notFoundEnvelope));
    await expect(fetchScoreSummary()).resolves.toEqual({ kind: "not_served" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstCall(fetchMock).path).toBe("/api/classifications/summary");
  });

  it("rejects a 500 with the ApiError, code and request id intact", async () => {
    stubFetch(
      jsonResponse(500, { error: { code: "internal_error", message: "x", request_id: "req-500" } }),
    );
    const caught = await fetchScoreSummary().catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe("internal_error");
    expect((caught as ApiError).requestId).toBe("req-500");
  });

  it("rejects a thrown fetch with ApiUnreachableError, not ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    const caught = await fetchScoreSummary().catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(ApiUnreachableError);
    expect(caught).not.toBeInstanceOf(ApiError);
  });
});

// fetchScoreSummary's success and non-not_found 404 paths (DAC-E3-S1-2, AC-8).
describe("fetchScoreSummary success and other 404s", () => {
  it("resolves the served summary unchanged, snake_case, with no kind key", async () => {
    stubFetch(jsonResponse(200, summaryFixture));
    const summary = await fetchScoreSummary();
    expect(summary).toEqual(summaryFixture);
    expect("kind" in summary).toBe(false);
  });

  it("rejects a 404 whose envelope code is not not_found", async () => {
    stubFetch(
      jsonResponse(404, {
        error: { code: "universe_not_found", message: "x", request_id: "req-u" },
      }),
    );
    const caught = await fetchScoreSummary().catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe("universe_not_found");
  });

  it("rejects a 404 whose body is not the envelope, with a null code", async () => {
    stubFetch(new Response("Not Found", { status: 404 }));
    const caught = await fetchScoreSummary().catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBeNull();
  });
});

// Implements AC-8 "typed reads" (T010, T011, DAC-E3-18): each exported read's
// declared result type is pinned exactly; `npx tsc --noEmit` is the observer.
describe("AC-8 — the exported reads declare their result types", () => {
  it("pins every read's resolved type", () => {
    expectTypeOf(fetchAttention).returns.resolves.toEqualTypeOf<Attention>();
    expectTypeOf(fetchDataHealth).returns.resolves.toEqualTypeOf<DataHealth>();
    expectTypeOf(fetchProblems).returns.resolves.toEqualTypeOf<ProblemPage>();
    expectTypeOf(fetchScoreSummary).returns.resolves.toEqualTypeOf<
      ScoreSummary | Extract<ScoreState, { kind: "not_served" }>
    >();
  });
});
