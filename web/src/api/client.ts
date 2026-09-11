/**
 * Typed fetch layer over the JSON API (component design `owner-web-app`
 * section 2.1, `web/src/api/client.ts`).
 *
 * Same-origin only: the bundle is served by the same process as the API
 * (component design section 4), so every path here is relative and no
 * cross-origin configuration exists.
 */

import type {
  AddInstrumentsResult,
  HealthResponse,
  HistoryDepth,
  Instrument,
  InstrumentLifecycle,
  InstrumentListResult,
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

  constructor(message: string, requestId: string) {
    super(message);
    this.name = "ApiError";
    this.requestId = requestId;
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
  try {
    const body = (await response.json()) as { error?: { message?: string; request_id?: string } };
    if (typeof body.error?.message === "string") {
      message = body.error.message;
    }
    if (typeof body.error?.request_id === "string") {
      requestId = body.error.request_id;
    }
  } catch {
    // Body did not parse as JSON at all — the generic message and unknown
    // request id above stand, rather than the caller ever seeing a thrown
    // parse error in place of the request's own failure.
  }
  return new ApiError(message, requestId);
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
