import { describe, expectTypeOf, it } from "vitest";
import type { ApiError, ApiUnreachableError } from "../api/client";
import type {
  Attention,
  DataHealth,
  ProblemPage,
  ReadState,
  ScoreState,
  ScoreSummary,
} from "./shell-types";

// Every type below is written out here, from data-health-api section 2.4,
// system design section 4.2 and `classification_models.py:455-585`, so the
// assertions compare shell-types.ts against an independent literal rather than
// against itself. `toEqualTypeOf` (never `toMatchTypeOf`) rejects an added,
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
