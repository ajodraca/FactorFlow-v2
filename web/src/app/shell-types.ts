import type { FactorName, LaterSet, RunOutcome } from "../api/classification-types";
import type { ApiError, ApiUnreachableError } from "../api/client";
import type { DataType, RunState } from "../api/types";

/*
 * Types the shell reads the data-health routes and the score summary through
 * (CAP-003-E3-S1; component design owner-shell 2.3). The wire shapes are kept
 * exactly as served: snake_case, ISO-8601 text for every timestamp and date,
 * `| null` for every nullable field, no field added, renamed or widened
 * (DAC-E3-18, DAC-E3-S1-4). Only `ReadState`'s and `ScoreState`'s `checkedAt`
 * is a `Date`, as owner-shell 2.3 writes it.
 */

/**
 * One polled read (owner-shell 2.3). `error` keeps the last good answer so a
 * screen can show it beside the failure.
 */
export type ReadState<T> =
  | { kind: "loading" }
  | { kind: "ok"; data: T; checkedAt: Date }
  | {
      kind: "error";
      error: ApiError | ApiUnreachableError;
      last: { data: T; checkedAt: Date } | null;
    };

/**
 * The score summary's read (owner-shell 2.3). `not_served` is the summary
 * route answering `404 not_found` before it is deployed.
 */
export type ScoreState =
  | { kind: "loading" }
  | { kind: "served"; data: ScoreSummary; checkedAt: Date }
  | { kind: "not_served" }
  | { kind: "error"; error: ApiError | ApiUnreachableError; last: ScoreSummary | null };

/** `Problems` in `AttentionResponse` (data-health-reader 2.2). */
export interface Problems {
  stock_count: number;
  symbols: string[];
  newest_completed_at: string | null;
}

/** `Progress` in `LatestDownload` (data-health-reader 2.2). */
export interface Progress {
  done: number;
  total: number | null;
}

/** `LatestDownload` in `AttentionResponse` (data-health-reader 2.2). */
export interface LatestDownload {
  run_id: string;
  state: RunState;
  requested_at: string;
  started_at: string | null;
  ended_at: string | null;
  progress: Progress;
}

/** `LatestTerminalDownload` in `AttentionResponse` (data-health-reader 2.2). */
export interface LatestTerminalDownload {
  run_id: string;
  state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned";
  ended_at: string;
  failure_reason: string | null;
}

/** `AttentionItem` in `AttentionResponse` (data-health-reader 2.2). */
export interface AttentionItem {
  kind: "data_problems" | "download_not_complete" | "credential_missing";
  recorded_at: string;
  run_id: string | null;
}

/**
 * `GET /api/attention`: `AttentionResponse` (data-health-api 2.4; system
 * design 4.2). Carries `problems.stock_count` for the Data health chip
 * (AC-16).
 */
export interface Attention {
  checked_at: string;
  followed_count: number;
  prices_as_of: string | null;
  credential_present: boolean;
  problems: Problems;
  latest_download: LatestDownload | null;
  latest_terminal_download: LatestTerminalDownload | null;
  items: AttentionItem[];
}

/** `Failure` in `ProblemPageResponse` (data-health-reader 2.2). */
export interface Failure {
  data_type: DataType;
  outcome: "failed" | "not_found";
  reason: string | null;
  attempts: number;
  completed_at: string;
  run_id: string;
}

/** `ProblemRow` in `ProblemPageResponse` (data-health-reader 2.2). */
export interface ProblemRow {
  symbol: string;
  failures: Failure[];
  retryable: boolean;
}

/** `GET /api/data-health/problems`: `ProblemPageResponse` (data-health-api 2.4). */
export interface ProblemPage {
  rows: ProblemRow[];
  next_cursor: string | null;
}

/** `GapDetectionState` in `DailyPricesCheckResponse` (data-health-reader 2.2). */
export interface GapDetectionState {
  available: boolean;
  reason: string | null;
}

/** `DailyPricesCheckResponse` (data-health-api 2.4). */
export interface DailyPricesCheck {
  status: "ok" | "exceptions" | "not_determinable";
  absent_count: number;
  gap_stock_count: number | null;
  behind_count: number;
  latest_session: string | null;
  gap_detection: GapDetectionState;
  exception_count: number;
  exception_symbols: string[];
}

/** `CompanyFinancialsCheckResponse` (data-health-api 2.4). */
export interface CompanyFinancialsCheck {
  status: "ok" | "exceptions";
  absent_count: number;
  problem_count: number;
  as_of: string | null;
  exception_count: number;
  exception_symbols: string[];
}

/** `GET /api/data-health`: `DataHealthResponse` (data-health-api 2.4). */
export interface DataHealth {
  checked_at: string;
  never_acquired: boolean;
  followed_count: number;
  affected_count: number;
  checks: {
    daily_prices: DailyPricesCheck | null;
    company_financials: CompanyFinancialsCheck | null;
  };
  problems: ProblemPage;
}

/**
 * `GET /api/classifications/summary`: `ClassificationSummaryResponse`
 * (`classification_models.py:455-585`), as classification-api publishes it and
 * snake_case as served. Neither redefined nor renamed (DAC-E3-18); the literal
 * unions are CAP-002's own published narrowings, reused by type import.
 */
export interface ScoreSummary {
  never_classified: boolean;
  set: {
    set_id: string;
    classification_date: string;
    run_id: string;
    run_started_at: string;
    run_outcome: RunOutcome;
    state: "complete";
    started_at: string;
    ended_at: string;
    latest_trading_day: string;
    active_instruments: number;
    not_current: boolean;
  } | null;
  later: {
    set_id: string;
    state: LaterSet["state"];
    started_at: string;
    ended_at: string | null;
    failure_reason: string | null;
    run_id: string;
    run_started_at: string;
  } | null;
  factors: Record<
    FactorName,
    { qualified_count: number; ranked: boolean; min_peer_set_size: number }
  >;
  stocks_current: { current_count: number; followed_count: number } | null;
}
