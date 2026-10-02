/**
 * Typed fetch layer over the JSON API (component design `owner-web-app`
 * section 2.1, `web/src/api/client.ts`).
 *
 * Same-origin only: the bundle is served by the same process as the API
 * (component design section 4), so every path here is relative and no
 * cross-origin configuration exists.
 */

import type {
  AcquisitionRun,
  AcquisitionRunPage,
  AddInstrumentsResult,
  CoverageDataType,
  CoverageExpansion,
  CoverageGapDetection,
  CoverageRow,
  CoverageView,
  HealthResponse,
  HistoryDepth,
  Instrument,
  InstrumentLifecycle,
  InstrumentListResult,
  PresenceState,
  RunCancelResult,
  RunStartResult,
  RunState,
  SymbolOutcome,
} from "./types";

/** Raised when the API could not be reached or did not answer usefully.
 *
 * The status region distinguishes two failures that a caller must never
 * conflate: the fetch itself failing, which is the API not answering at all
 * (DAC-E1-15, the shell-wide unreachable state), and a successful response
 * reporting `database: "unreachable"`, which is the API answering that its
 * store is down (DAC-E1-S6-2). Only the former reaches a caller as this
 * error; the latter arrives as an ordinary `HealthResponse`.
 */
export class ApiUnreachableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ApiUnreachableError";
  }
}

/**
 * Raised when the API answered with a non-2xx status carrying the shared
 * error envelope (`{"error": {...}}`, component design section 2.3).
 * `requestId` and `message` are exactly what a `ScreenState` `error`
 * variant needs, so a screen can construct one directly from a caught
 * `ApiError` without re-deriving either field.
 *
 * The envelope's `error.message` degrades to a generic sentence when a
 * response answers non-2xx without a body that parses as the envelope
 * shape (this story's tasks-file Notes: CAP-001-E7-S2's error envelope may
 * not have landed yet, and a caller here must not assume its exact shape).
 */
export class ApiError extends Error {
  readonly requestId: string;
  /** The envelope's machine-readable `error.code`, or `null` when absent. */
  readonly code: string | null;
  /**
   * The envelope's `error.state`: the run's actual persisted state, present
   * only on `run_already_terminal` (component design `ingestion-api`
   * section 10). `null` otherwise.
   */
  readonly state: string | null;

  constructor(
    message: string,
    requestId: string,
    details: { code?: string | null; state?: string | null } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.requestId = requestId;
    this.code = details.code ?? null;
    this.state = details.state ?? null;
  }
}

/**
 * Reads a non-2xx JSON response into an `ApiError`, degrading to a generic
 * message when the body does not parse or does not carry the envelope
 * shape, rather than assuming `{"error": {...}}` is always present.
 */
async function toApiError(response: Response): Promise<ApiError> {
  let requestId = "unknown";
  let message = `request failed with status ${response.status}`;
  let code: string | null = null;
  let state: string | null = null;
  try {
    const body = (await response.json()) as {
      error?: { message?: unknown; request_id?: unknown; code?: unknown; state?: unknown };
    };
    if (typeof body.error?.message === "string") {
      message = body.error.message;
    }
    if (typeof body.error?.request_id === "string") {
      requestId = body.error.request_id;
    }
    if (typeof body.error?.code === "string") {
      code = body.error.code;
    }
    if (typeof body.error?.state === "string") {
      state = body.error.state;
    }
  } catch {
    // Body did not parse as JSON at all — the generic message and unknown
    // request id above stand, rather than the caller ever seeing a thrown
    // parse error in place of the request's own failure.
  }
  return new ApiError(message, requestId, { code, state });
}

/**
 * `GET /api/health` (CAP-001-E1-S6).
 *
 * Throws `ApiUnreachableError` on a transport failure or a non-OK status —
 * both are "the API did not answer" from the interface's point of view.
 * Never returns a partially-typed body: a response that does not parse as
 * JSON is a failure to answer, not a health report.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  let response: Response;
  try {
    response = await fetch("/api/health", { headers: { Accept: "application/json" } });
  } catch (cause) {
    throw new ApiUnreachableError("GET /api/health could not be reached", { cause });
  }

  if (!response.ok) {
    throw new ApiUnreachableError(`GET /api/health returned ${response.status}`);
  }

  try {
    return (await response.json()) as HealthResponse;
  } catch (cause) {
    throw new ApiUnreachableError("GET /api/health returned a body that is not JSON", { cause });
  }
}

/**
 * Performs one JSON request against the instruments/settings surface,
 * translating a transport failure into `ApiUnreachableError` (the shell-wide
 * unreachable state, DAC-E1-15) and a non-2xx status into `ApiError` (a
 * screen-level `error` state, never conflated with unreachable).
 */
async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch (cause) {
    throw new ApiUnreachableError(`${init?.method ?? "GET"} ${input} could not be reached`, {
      cause,
    });
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiUnreachableError(
      `${init?.method ?? "GET"} ${input} returned a body that is not JSON`,
      {
        cause,
      },
    );
  }
}

function toSymbolOutcome(row: {
  input_symbol: string;
  normalised_symbol: string | null;
  disposition: string;
  reason: string | null;
}): SymbolOutcome {
  return {
    inputSymbol: row.input_symbol,
    normalisedSymbol: row.normalised_symbol,
    disposition: row.disposition as SymbolOutcome["disposition"],
    reason: row.reason,
  };
}

/**
 * `POST /api/instruments` (component design section 2.3; DAC-E2-3,
 * DAC-E2-S4-1). Single add and Add many share this call: a one-element
 * array for the inline field, the parsed batch for bulk entry.
 *
 * Resolves with the per-symbol disposition on `201` — including a batch
 * with some rejections, which is not a transport-level error — and rejects
 * with `ApiError` on `409` (every symbol a duplicate of an active
 * instrument) or `422` (every symbol malformed), the two statuses the route
 * uses when nothing at all was added or reactivated.
 */
export async function addInstruments(symbols: string[]): Promise<AddInstrumentsResult> {
  const body = await requestJson<{
    added: Parameters<typeof toSymbolOutcome>[0][];
    reactivated: Parameters<typeof toSymbolOutcome>[0][];
    rejected: Parameters<typeof toSymbolOutcome>[0][];
  }>("/api/instruments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbols }),
  });

  return {
    added: body.added.map(toSymbolOutcome),
    reactivated: body.reactivated.map(toSymbolOutcome),
    rejected: body.rejected.map(toSymbolOutcome),
  };
}

/**
 * `DELETE /api/instruments/{symbol}` (component design section 2.3, AC-21).
 * Resolves with the retirement timestamp on `200`; rejects with `ApiError`
 * on `404` (unknown symbol) or `409` (already retired).
 */
export async function retireInstrument(
  symbol: string,
): Promise<{ lifecycle: "retired"; retiredAt: string }> {
  const body = await requestJson<{ lifecycle: "retired"; retired_at: string }>(
    `/api/instruments/${encodeURIComponent(symbol)}`,
    { method: "DELETE" },
  );
  return { lifecycle: body.lifecycle, retiredAt: body.retired_at };
}

/** `GET /api/instruments` filters (component design section 2.6, DAC-E2-10). */
export interface InstrumentListFilters {
  symbol?: string;
  lifecycle?: InstrumentLifecycle;
  limit?: number;
  cursor?: string;
}

/**
 * `GET /api/instruments` (component design section 2.6, DAC-E2-10). Every
 * filter is a query parameter, so filtering and pagination are always
 * server-side across the full result set rather than a client-side scan of
 * the currently loaded page.
 */
export async function listInstruments(
  filters: InstrumentListFilters = {},
): Promise<InstrumentListResult> {
  const query = new URLSearchParams();
  if (filters.symbol) {
    query.set("symbol", filters.symbol);
  }
  if (filters.lifecycle) {
    query.set("lifecycle", filters.lifecycle);
  }
  if (filters.limit !== undefined) {
    query.set("limit", String(filters.limit));
  }
  if (filters.cursor) {
    query.set("cursor", filters.cursor);
  }
  const queryString = query.toString();

  const body = await requestJson<{
    instruments: { instrument_id: number; symbol: string; lifecycle: string }[];
    active_count: number;
    retired_count: number;
    next_cursor: string | null;
  }>(`/api/instruments${queryString ? `?${queryString}` : ""}`);

  return {
    rows: body.instruments.map(
      (row): Instrument => ({
        instrumentId: row.instrument_id,
        symbol: row.symbol,
        lifecycle: row.lifecycle as InstrumentLifecycle,
      }),
    ),
    activeCount: body.active_count,
    retiredCount: body.retired_count,
    nextCursor: body.next_cursor,
  };
}

/** `GET /api/coverage` filters (component design `ingestion-api` section 2.4a). */
export interface CoverageFilters {
  symbol?: string;
  lifecycle?: InstrumentLifecycle;
  cursor?: string;
}

interface WireCoverageInstrument {
  symbol: string;
  lifecycle: InstrumentLifecycle;
  data_types: Record<CoverageDataType, PresenceState>;
  covered_from: string | null;
  covered_to: string | null;
  last_acquired_at: string | null;
  gap_count: number | null;
  depth_short_by_years: number | null;
}

/**
 * `GET /api/coverage` (CAP-001-E6-S3; AC-7, AC-8). Only the filters that
 * are present become query parameters. No `limit`, `from` or `to` is sent:
 * the API's default page size applies, and with both bounds omitted the
 * service covers everything acquired (ingestion-api 2.4a; coverage-service
 * 2.3). `null` and `0` are copied through unchanged, never coerced.
 */
export async function fetchCoverage(filters: CoverageFilters = {}): Promise<CoverageView> {
  const query = new URLSearchParams();
  if (filters.symbol) {
    query.set("symbol", filters.symbol);
  }
  if (filters.lifecycle) {
    query.set("lifecycle", filters.lifecycle);
  }
  if (filters.cursor) {
    query.set("cursor", filters.cursor);
  }
  const queryString = query.toString();

  const body = await requestJson<{
    instruments: WireCoverageInstrument[];
    never_acquired: boolean;
    gap_detection: CoverageGapDetection;
    next_cursor: string | null;
  }>(`/api/coverage${queryString ? `?${queryString}` : ""}`);

  return {
    rows: body.instruments.map(
      (row): CoverageRow => ({
        symbol: row.symbol,
        lifecycle: row.lifecycle,
        dataTypes: row.data_types,
        coveredFrom: row.covered_from,
        coveredTo: row.covered_to,
        lastAcquiredAt: row.last_acquired_at,
        gapCount: row.gap_count,
        depthShortByYears: row.depth_short_by_years,
      }),
    ),
    neverAcquired: body.never_acquired,
    gapDetection: { available: body.gap_detection.available, reason: body.gap_detection.reason },
    nextCursor: body.next_cursor,
  };
}

/**
 * One instrument's gap dates, through `GET /api/coverage`'s provisional
 * `expand` parameter (CAP-001-E6-S4-tasks Open Gap 1). The page is narrowed
 * to that one symbol to keep the incidental coverage read small; only the
 * body's `expanded` key is read. A body without it rejects rather than
 * returning an empty list, which would read as "no gaps".
 */
export async function fetchCoverageGapDates(symbol: string): Promise<CoverageExpansion> {
  const query = new URLSearchParams({ symbol, limit: "1", expand: symbol });
  const body = await requestJson<{
    expanded?: { symbol: string; gap_dates: string[] | null };
  }>(`/api/coverage?${query.toString()}`);
  if (body.expanded === undefined || body.expanded === null) {
    throw new ApiError(`GET /api/coverage returned no gap dates for ${symbol}`, "unknown");
  }
  return { symbol: body.expanded.symbol, gapDates: body.expanded.gap_dates };
}

function toHistoryDepth(body: { years: number | null; updated_at: string | null }): HistoryDepth {
  return { years: body.years, updatedAt: body.updated_at };
}

/** `GET /api/settings/history-depth` (AC-2). */
export async function getHistoryDepth(): Promise<HistoryDepth> {
  const body = await requestJson<{ years: number | null; updated_at: string | null }>(
    "/api/settings/history-depth",
  );
  return toHistoryDepth(body);
}

/**
 * `PUT /api/settings/history-depth` (AC-2). Rejects with `ApiError` on
 * `422` when `years` is outside the API's bound — the depth field's blur
 * validation reports that as its STD-UI-19-shaped error.
 */
export async function setHistoryDepth(years: number): Promise<HistoryDepth> {
  const body = await requestJson<{ years: number | null; updated_at: string | null }>(
    "/api/settings/history-depth",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ years }),
    },
  );
  return toHistoryDepth(body);
}

/** `GET /api/acquisition-runs` filters (component design `ingestion-api` section 2.3). */
export interface RunListFilters {
  state?: RunState;
  limit?: number;
  cursor?: string;
}

interface WireRun {
  run_id: string;
  state: RunState;
  history_depth_years: number;
  requested_at: string;
  started_at: string | null;
  ended_at: string | null;
  instruments_named: number;
  instruments_written: number;
  instruments_failed: number;
  failure_reason: string | null;
}

function toAcquisitionRun(row: WireRun): AcquisitionRun {
  return {
    runId: row.run_id,
    state: row.state,
    historyDepthYears: row.history_depth_years,
    requestedAt: row.requested_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    instrumentsNamed: row.instruments_named,
    instrumentsWritten: row.instruments_written,
    instrumentsFailed: row.instruments_failed,
    failureReason: row.failure_reason,
  };
}

/**
 * `GET /api/acquisition-runs` (CAP-001-E5-S5; DAC-E5-S5-4), newest first.
 * Only the filters that are present become query parameters.
 */
export async function listAcquisitionRuns(
  filters: RunListFilters = {},
): Promise<AcquisitionRunPage> {
  const query = new URLSearchParams();
  if (filters.state) {
    query.set("state", filters.state);
  }
  if (filters.limit !== undefined) {
    query.set("limit", String(filters.limit));
  }
  if (filters.cursor) {
    query.set("cursor", filters.cursor);
  }
  const queryString = query.toString();

  const body = await requestJson<{ runs: WireRun[]; next_cursor: string | null }>(
    `/api/acquisition-runs${queryString ? `?${queryString}` : ""}`,
  );
  return { runs: body.runs.map(toAcquisitionRun), nextCursor: body.next_cursor };
}

/**
 * `POST /api/acquisition-runs` (CAP-001-E5-S5; AC-23, AC-24). The endpoint
 * takes an empty body, so none is sent. Rejects with `ApiError` on `409`
 * (`history_depth_not_set` or `no_active_instruments`).
 */
export async function startAcquisitionRun(): Promise<RunStartResult> {
  const body = await requestJson<{
    run_id: string;
    state: "requested";
    queued_behind: string | null;
  }>("/api/acquisition-runs", { method: "POST" });
  return { runId: body.run_id, state: body.state, queuedBehind: body.queued_behind };
}

/**
 * `POST /api/acquisition-runs/{id}/cancel` (CAP-001-E5-S5; AC-19, AC-26).
 * Rejects with `ApiError` on `409` `run_already_terminal`, whose `state`
 * carries the run's actual outcome (DAC-E5-9), or on `404`.
 */
export async function cancelAcquisitionRun(runId: string): Promise<RunCancelResult> {
  const body = await requestJson<{ state: "cancelling" | "cancelled" }>(
    `/api/acquisition-runs/${encodeURIComponent(runId)}/cancel`,
    { method: "POST" },
  );
  return { state: body.state };
}
