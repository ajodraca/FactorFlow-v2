/**
 * Typed fetch layer over `/api/universes` and `/api/classifications`
 * (component design `classification-ui` sections 2.1 and 2.4; endpoints of
 * `classification-api` section 11).
 *
 * Every call goes through the delivered `requestJson` (DEC-0064), so a
 * transport failure is `ApiUnreachableError` and a non-2xx status a
 * `ClassificationApiError` carrying the envelope's `code`, never conflated.
 * Responses are mapped from the snake_case wire field by field, as
 * `client.ts` does; decimal strings and dates stay the wire's strings.
 */

import type {
  AddMembersResult,
  ClassificationList,
  ClassificationListParams,
  ClassificationOperation,
  ClassificationResource,
  ClassificationSet,
  ClassificationSetPage,
  ClassificationSummary,
  CreateUniverseRequest,
  CurrentSet,
  FactorCell,
  FactorName,
  FactorSummary,
  InputRow,
  LaterSet,
  Lifecycle,
  RemoveMemberResult,
  RetireUniverseResult,
  RunOutcome,
  StockEvidence,
  StockHistory,
  StockRow,
  ThresholdBounds,
  Thresholds,
  UniverseDetail,
  UniverseEvent,
  UniverseEventPage,
  UniverseEventType,
  UniverseList,
  UniverseMember,
  UniverseOrigin,
} from "./classification-types";
import { ApiError, requestJson } from "./client";

// --- Wire shapes (classification-api section 2.7) ---------------------------

interface WireFactorCell {
  status: FactorCell["status"];
  score: string | null;
  percentile: string | null;
  reason_code: FactorCell["reasonCode"];
  reason_input: string | null;
  reason_detail: string | null;
  restated_possible: boolean;
}

type WireFactorCells = Partial<Record<FactorName, WireFactorCell>>;

interface WireFactorSummary {
  qualified_count: number;
  ranked: boolean;
  min_peer_set_size: number;
}

type WireFactorSummaries = Record<FactorName, WireFactorSummary>;

interface WireSetBlock {
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
}

interface WireLaterBlock {
  set_id: string;
  state: LaterSet["state"];
  started_at: string;
  ended_at: string | null;
  failure_reason: string | null;
  run_id: string;
  run_started_at: string;
}

interface WireSetState {
  never_classified: boolean;
  set: WireSetBlock | null;
  later: WireLaterBlock | null;
  factors: WireFactorSummaries;
}

interface WireStockRow {
  symbol: string;
  name: string;
  lifecycle: Lifecycle;
  factors: WireFactorCells;
}

interface WireClassificationList extends WireSetState {
  match_count: number;
  stocks: WireStockRow[];
  unknown_symbols: string[];
  next_cursor: string | null;
}

interface WireClassificationSummary extends WireSetState {
  stocks_current: { current_count: number; followed_count: number } | null;
}

interface WireInputRow {
  factor: FactorName;
  input_name: string;
  label: string;
  status: InputRow["status"];
  value: string | null;
  as_of: string | null;
  known_on: string | null;
  restated_possible: boolean;
  detail: unknown;
}

interface WireStockEvidence {
  symbol: string;
  name: string;
  lifecycle: Lifecycle;
  set: WireSetBlock | null;
  factors: WireFactorCells;
  inputs: WireInputRow[];
  memberships: { universe_id: string; name: string }[];
}

interface WireStockHistory {
  symbol: string;
  sets: {
    set_id: string;
    classification_date: string;
    run_id: string;
    run_outcome: RunOutcome;
    ended_at: string;
    factors: WireFactorCells;
  }[];
  next_cursor: string | null;
}

interface WireClassificationSet {
  set_id: string;
  state: ClassificationSet["state"];
  classification_date: string;
  run_id: string;
  run_started_at: string;
  run_outcome: RunOutcome;
  started_at: string;
  ended_at: string | null;
  failure_reason: string | null;
  latest_trading_day: string | null;
  active_instruments: number | null;
  factors: WireFactorSummaries;
}

interface WireUniverseList {
  universes: {
    universe_id: string;
    name: string;
    lifecycle: Lifecycle;
    member_count: number;
    created_at: string;
    retired_at: string | null;
  }[];
  active_count: number;
  retired_count: number;
  next_cursor: string | null;
}

interface WireUniverseMember {
  symbol: string;
  name: string | null;
  lifecycle: Lifecycle;
  member_since: string;
  factors: WireFactorCells | null;
}

interface WireUniverse {
  universe_id: string;
  name: string;
  lifecycle: Lifecycle;
  created_at: string;
  retired_at: string | null;
  member_count: number;
  as_of: string;
  as_of_before_creation: boolean;
  origin: {
    kind: UniverseOrigin["kind"];
    set_id: string | null;
    classification_date: string | null;
    thresholds: Record<string, string> | null;
    hide_incomplete: boolean | null;
    symbol: string | null;
  };
  members: WireUniverseMember[];
  set: WireSetBlock | null;
}

interface WireUniverseEvents {
  events: {
    event_id: number;
    event_type: UniverseEventType;
    name: string | null;
    symbol: string | null;
    recorded_at: string;
    recorded_on: string;
    filter_provenance: unknown;
  }[];
  next_cursor: string | null;
}

// --- Shared mappers --------------------------------------------------------

const FACTOR_NAMES: readonly FactorName[] = ["value", "growth", "momentum"];

/** The twelve bounds: camelCase field and its query-parameter name (section 2.4). */
const BOUND_PARAMS: readonly [keyof ThresholdBounds, string][] = [
  ["valuePercentileMin", "value_percentile_min"],
  ["valuePercentileMax", "value_percentile_max"],
  ["valueScoreMin", "value_score_min"],
  ["valueScoreMax", "value_score_max"],
  ["growthPercentileMin", "growth_percentile_min"],
  ["growthPercentileMax", "growth_percentile_max"],
  ["growthScoreMin", "growth_score_min"],
  ["growthScoreMax", "growth_score_max"],
  ["momentumPercentileMin", "momentum_percentile_min"],
  ["momentumPercentileMax", "momentum_percentile_max"],
  ["momentumScoreMin", "momentum_score_min"],
  ["momentumScoreMax", "momentum_score_max"],
];

function toFactorCell(cell: WireFactorCell): FactorCell {
  return {
    status: cell.status,
    score: cell.score,
    percentile: cell.percentile,
    reasonCode: cell.reason_code,
    reasonInput: cell.reason_input,
    reasonDetail: cell.reason_detail,
    restatedPossible: cell.restated_possible,
  };
}

/**
 * Maps the cells the wire carries. The evidence read sends `{}` for a stock
 * with no cells (DEC-0140), so a factor absent on the wire is absent here
 * rather than read through `undefined`.
 */
function toFactorCells(cells: WireFactorCells): Record<FactorName, FactorCell> {
  const mapped: Partial<Record<FactorName, FactorCell>> = {};
  for (const factor of FACTOR_NAMES) {
    const cell = cells[factor];
    if (cell !== undefined) {
      mapped[factor] = toFactorCell(cell);
    }
  }
  return mapped as Record<FactorName, FactorCell>;
}

function toFactorSummary(summary: WireFactorSummary): FactorSummary {
  return {
    qualifiedCount: summary.qualified_count,
    ranked: summary.ranked,
    minPeerSetSize: summary.min_peer_set_size,
  };
}

function toFactorSummaries(summaries: WireFactorSummaries): Record<FactorName, FactorSummary> {
  return {
    value: toFactorSummary(summaries.value),
    growth: toFactorSummary(summaries.growth),
    momentum: toFactorSummary(summaries.momentum),
  };
}

function toCurrentSet(set: WireSetBlock | null): CurrentSet | null {
  if (set === null) {
    return null;
  }
  return {
    setId: set.set_id,
    classificationDate: set.classification_date,
    runId: set.run_id,
    runStartedAt: set.run_started_at,
    runOutcome: set.run_outcome,
    state: set.state,
    startedAt: set.started_at,
    endedAt: set.ended_at,
    latestTradingDay: set.latest_trading_day,
    activeInstruments: set.active_instruments,
    notCurrent: set.not_current,
  };
}

function toLaterSet(later: WireLaterBlock | null): LaterSet | null {
  if (later === null) {
    return null;
  }
  return {
    setId: later.set_id,
    state: later.state,
    startedAt: later.started_at,
    endedAt: later.ended_at,
    failureReason: later.failure_reason,
    runId: later.run_id,
    runStartedAt: later.run_started_at,
  };
}

function toUniverse(body: WireUniverse): UniverseDetail {
  return {
    universeId: body.universe_id,
    name: body.name,
    lifecycle: body.lifecycle,
    createdAt: body.created_at,
    retiredAt: body.retired_at,
    memberCount: body.member_count,
    asOf: body.as_of,
    asOfBeforeCreation: body.as_of_before_creation,
    origin: {
      kind: body.origin.kind,
      setId: body.origin.set_id,
      classificationDate: body.origin.classification_date,
      thresholds: body.origin.thresholds,
      hideIncomplete: body.origin.hide_incomplete,
      symbol: body.origin.symbol,
    },
    members: body.members.map(
      (member): UniverseMember => ({
        symbol: member.symbol,
        name: member.name,
        lifecycle: member.lifecycle,
        memberSince: member.member_since,
        // Null when the reader has no row for the member (CAP-002-E1-S6, DEC-0097).
        factors: member.factors === null ? null : toFactorCells(member.factors),
      }),
    ),
    set: toCurrentSet(body.set),
  };
}

function toClassificationSet(row: WireClassificationSet): ClassificationSet {
  return {
    setId: row.set_id,
    state: row.state,
    classificationDate: row.classification_date,
    runId: row.run_id,
    runStartedAt: row.run_started_at,
    runOutcome: row.run_outcome,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    failureReason: row.failure_reason,
    latestTradingDay: row.latest_trading_day,
    activeInstruments: row.active_instruments,
    factors: toFactorSummaries(row.factors),
  };
}

function withQuery(path: string, query: URLSearchParams): string {
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function pagingQuery(params: { limit?: number; cursor?: string }): URLSearchParams {
  const query = new URLSearchParams();
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.cursor) {
    query.set("cursor", params.cursor);
  }
  return query;
}

function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// --- Errors ----------------------------------------------------------------

/**
 * A non-2xx answer from a classification endpoint (DAC-E4-S1-2). It is an
 * `ApiError`, so a screen builds its `error` state from it as from any other,
 * and adds what the envelope and the call know without any prose being
 * parsed (DEC-0143): `operation`, the client's identifier for the call;
 * `resource`, the envelope's when it is one of the four of classification-api
 * section 2.5 and otherwise the operation's own; `reason`, the envelope's
 * `code`; and `symbols`, the `instrument_not_acquired` list, `[]` when absent.
 */
export class ClassificationApiError extends ApiError {
  readonly operation: ClassificationOperation;
  readonly resource: ClassificationResource;
  readonly reason: string | null;
  readonly symbols: string[];

  constructor(
    message: string,
    requestId: string,
    details: {
      code?: string | null;
      state?: string | null;
      operation: ClassificationOperation;
      resource: ClassificationResource;
      symbols?: string[];
    },
  ) {
    super(message, requestId, { code: details.code, state: details.state });
    this.name = "ClassificationApiError";
    this.operation = details.operation;
    this.resource = details.resource;
    this.reason = this.code;
    this.symbols = details.symbols ?? [];
  }
}

const CLASSIFICATION_RESOURCES: readonly ClassificationResource[] = [
  "universe",
  "universe-member",
  "classification",
  "classification-set",
];

/**
 * The envelope's `resource` when it is a `ClassificationResource`, else
 * `fallback`. A `validation_error` from the delivered handler carries the
 * path's last segment (`universes`, `classifications`, ...; classification-api
 * section 2.3), which is not one, so it becomes the operation's own resource.
 */
function toClassificationResource(
  value: unknown,
  fallback: ClassificationResource,
): ClassificationResource {
  return CLASSIFICATION_RESOURCES.find((resource) => resource === value) ?? fallback;
}

/** The `error` object of an envelope, or `{}` when the body is not one. */
async function readEnvelope(response: Response | undefined): Promise<Record<string, unknown>> {
  try {
    const body = (await response?.json()) as { error?: unknown } | null | undefined;
    const error = body?.error;
    if (typeof error === "object" && error !== null) {
      return error as Record<string, unknown>;
    }
  } catch {
    // Not JSON: the envelope fields stay absent, as `toApiError` degrades too.
  }
  return {};
}

function toSymbols(value: unknown): string[] {
  return Array.isArray(value) && value.every((symbol) => typeof symbol === "string")
    ? [...value]
    : [];
}

/**
 * Starts `requestJson` with `fetch` wrapped so that a non-2xx response is
 * cloned for this call alone (Open Gap 2 of the story's task plan): the
 * delivered `toApiError` drops the envelope's `resource` and `symbols`, and
 * `client.ts` may change by the `export` keyword only (DAC-E4-S1-1).
 *
 * `requestJson` calls `fetch` before its first `await`, so the wrapper is
 * installed only for that synchronous start and the global is restored in
 * `finally` before anything is awaited; no other call can see the wrapper
 * or another call's response. If `requestJson` ever awaits before calling
 * `fetch`, the restoration and concurrency tests fail first.
 */
function startCapturingErrorResponse<T>(
  input: string,
  init: RequestInit | undefined,
): { pending: Promise<T>; errorResponse: () => Response | undefined } {
  let captured: Response | undefined;
  const original = globalThis.fetch;
  const capturing: typeof fetch = async (...args) => {
    const response = await original(...args);
    // Only an error response is cloned; a 2xx body is read by `requestJson` alone.
    if (!response.ok) {
      captured = response.clone();
    }
    return response;
  };
  globalThis.fetch = capturing;
  try {
    return { pending: requestJson<T>(input, init), errorResponse: () => captured };
  } finally {
    globalThis.fetch = original;
  }
}

/**
 * One request on behalf of `operation`, whose own resource is `resource`.
 * `ApiUnreachableError` passes through untouched; an `ApiError` becomes a
 * `ClassificationApiError`.
 */
async function request<T>(
  operation: ClassificationOperation,
  resource: ClassificationResource,
  input: string,
  init?: RequestInit,
): Promise<T> {
  const { pending, errorResponse } = startCapturingErrorResponse<T>(input, init);
  try {
    return await pending;
  } catch (caught) {
    if (!(caught instanceof ApiError)) {
      throw caught;
    }
    const envelope = await readEnvelope(errorResponse());
    throw new ClassificationApiError(caught.message, caught.requestId, {
      code: caught.code,
      state: caught.state,
      operation,
      resource: toClassificationResource(envelope.resource, resource),
      symbols: toSymbols(envelope.symbols),
    });
  }
}

// --- Universes -------------------------------------------------------------

/** `GET /api/universes` parameters. */
export interface UniverseListParams {
  lifecycle?: Lifecycle | "all";
  name?: string;
  limit?: number;
  cursor?: string;
}

/** `GET /api/universes` (AC-3, AC-4). Only the present parameters are sent. */
export async function listUniverses(params: UniverseListParams = {}): Promise<UniverseList> {
  const query = new URLSearchParams();
  if (params.lifecycle) {
    query.set("lifecycle", params.lifecycle);
  }
  if (params.name) {
    query.set("name", params.name);
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.cursor) {
    query.set("cursor", params.cursor);
  }
  const body = await request<WireUniverseList>(
    "list-universes",
    "universe",
    withQuery("/api/universes", query),
  );
  return {
    universes: body.universes.map((row) => ({
      universeId: row.universe_id,
      name: row.name,
      lifecycle: row.lifecycle,
      memberCount: row.member_count,
      createdAt: row.created_at,
      retiredAt: row.retired_at,
    })),
    activeCount: body.active_count,
    retiredCount: body.retired_count,
    nextCursor: body.next_cursor,
  };
}

function toFilterBody(filter: Thresholds): Record<string, string | boolean | null> {
  const body: Record<string, string | boolean | null> = {};
  for (const [field, param] of BOUND_PARAMS) {
    const value = filter[field];
    if (value !== undefined) {
      body[param] = value;
    }
  }
  body.hide_incomplete = filter.hideIncomplete;
  body.symbol = filter.symbol;
  return body;
}

/**
 * `POST /api/universes` (AC-1, AC-2, S03-7): by hand with `symbols`, or from
 * a result with the filter and the set it was read against (DEC-0085).
 */
export async function createUniverse(universe: CreateUniverseRequest): Promise<UniverseDetail> {
  const payload =
    "symbols" in universe
      ? { name: universe.name, symbols: universe.symbols }
      : { name: universe.name, filter: toFilterBody(universe.filter), set_id: universe.setId };
  const body = await request<WireUniverse>(
    "create-universe",
    "universe",
    "/api/universes",
    jsonBody("POST", payload),
  );
  return toUniverse(body);
}

/** `GET /api/universes/{id}` (AC-3, AC-6, AC-15), optionally as of a date. */
export async function getUniverse(
  universeId: string,
  params: { asOf?: string } = {},
): Promise<UniverseDetail> {
  const query = new URLSearchParams();
  if (params.asOf) {
    query.set("as_of", params.asOf);
  }
  const body = await request<WireUniverse>(
    "get-universe",
    "universe",
    withQuery(`/api/universes/${encodeURIComponent(universeId)}`, query),
  );
  return toUniverse(body);
}

/** `PATCH /api/universes/{id}` (AC-4). */
export async function renameUniverse(universeId: string, name: string): Promise<UniverseDetail> {
  const body = await request<WireUniverse>(
    "rename-universe",
    "universe",
    `/api/universes/${encodeURIComponent(universeId)}`,
    jsonBody("PATCH", { name }),
  );
  return toUniverse(body);
}

/** `DELETE /api/universes/{id}` (AC-4, AC-6): retires, never deletes. */
export async function retireUniverse(universeId: string): Promise<RetireUniverseResult> {
  const body = await request<{ lifecycle: "retired"; retired_at: string }>(
    "retire-universe",
    "universe",
    `/api/universes/${encodeURIComponent(universeId)}`,
    { method: "DELETE" },
  );
  return { lifecycle: body.lifecycle, retiredAt: body.retired_at };
}

/** `GET /api/universes/{id}/events` (AC-6), newest first. */
export async function listUniverseEvents(
  universeId: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<UniverseEventPage> {
  const body = await request<WireUniverseEvents>(
    "list-universe-events",
    "universe",
    withQuery(`/api/universes/${encodeURIComponent(universeId)}/events`, pagingQuery(params)),
  );
  return {
    events: body.events.map(
      (event): UniverseEvent => ({
        eventId: event.event_id,
        eventType: event.event_type,
        name: event.name,
        symbol: event.symbol,
        recordedAt: event.recorded_at,
        recordedOn: event.recorded_on,
        filterProvenance: event.filter_provenance,
      }),
    ),
    nextCursor: body.next_cursor,
  };
}

/** `POST /api/universes/{id}/members` (AC-1, AC-4). */
export async function addUniverseMembers(
  universeId: string,
  symbols: string[],
): Promise<AddMembersResult> {
  const body = await request<{ added: string[]; already_member: string[] }>(
    "add-universe-members",
    "universe-member",
    `/api/universes/${encodeURIComponent(universeId)}/members`,
    jsonBody("POST", { symbols }),
  );
  return { added: body.added, alreadyMember: body.already_member };
}

/** `DELETE /api/universes/{id}/members/{symbol}` (AC-4, AC-5, AC-6). */
export async function removeUniverseMember(
  universeId: string,
  symbol: string,
): Promise<RemoveMemberResult> {
  const body = await request<{ removed_at: string }>(
    "remove-universe-member",
    "universe-member",
    `/api/universes/${encodeURIComponent(universeId)}/members/${encodeURIComponent(symbol)}`,
    { method: "DELETE" },
  );
  return { removedAt: body.removed_at };
}

// --- Classifications -------------------------------------------------------

function toStockRow(row: WireStockRow): StockRow {
  return {
    symbol: row.symbol,
    name: row.name,
    lifecycle: row.lifecycle,
    factors: toFactorCells(row.factors),
  };
}

/**
 * `GET /api/classifications` (AC-16, AC-20, AC-22, DAC-E4-3). Only the
 * present parameters are sent; `hide_incomplete` only when true (the API's
 * default is false), and compare `symbols` as one repeated key per entry
 * (DEC-0144). `matchCount` is the server's count, never the rows loaded.
 */
export async function listClassifications(
  params: ClassificationListParams = {},
): Promise<ClassificationList> {
  const query = new URLSearchParams();
  if (params.universeId) {
    query.set("universe_id", params.universeId);
  }
  for (const symbol of params.symbols ?? []) {
    query.append("symbols", symbol);
  }
  if (params.symbol) {
    query.set("symbol", params.symbol);
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }
  if (params.order) {
    query.set("order", params.order);
  }
  for (const [field, param] of BOUND_PARAMS) {
    const value = params[field];
    if (value !== undefined) {
      query.set(param, value);
    }
  }
  if (params.hideIncomplete === true) {
    query.set("hide_incomplete", "true");
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.cursor) {
    query.set("cursor", params.cursor);
  }
  const body = await request<WireClassificationList>(
    "list-classifications",
    "classification",
    withQuery("/api/classifications", query),
  );
  return {
    neverClassified: body.never_classified,
    set: toCurrentSet(body.set),
    later: toLaterSet(body.later),
    factors: toFactorSummaries(body.factors),
    matchCount: body.match_count,
    stocks: body.stocks.map(toStockRow),
    unknownSymbols: body.unknown_symbols,
    nextCursor: body.next_cursor,
  };
}

/** `GET /api/classifications/summary` (AC-13, AC-20 to AC-22; DEC-0071). */
export async function getClassificationSummary(): Promise<ClassificationSummary> {
  const body = await request<WireClassificationSummary>(
    "get-classification-summary",
    "classification",
    "/api/classifications/summary",
  );
  return {
    neverClassified: body.never_classified,
    set: toCurrentSet(body.set),
    later: toLaterSet(body.later),
    factors: toFactorSummaries(body.factors),
    stocksCurrent:
      body.stocks_current === null
        ? null
        : {
            currentCount: body.stocks_current.current_count,
            followedCount: body.stocks_current.followed_count,
          },
  };
}

/** `GET /api/classifications/sets` (AC-20, AC-21; DEC-0083), newest first. */
export async function listClassificationSets(
  params: { limit?: number; cursor?: string } = {},
): Promise<ClassificationSetPage> {
  const body = await request<{ sets: WireClassificationSet[]; next_cursor: string | null }>(
    "list-classification-sets",
    "classification-set",
    withQuery("/api/classifications/sets", pagingQuery(params)),
  );
  return { sets: body.sets.map(toClassificationSet), nextCursor: body.next_cursor };
}

/** `GET /api/classifications/sets/{set_id}` (AC-21; DEC-0083). */
export async function getClassificationSet(setId: string): Promise<ClassificationSet> {
  const body = await request<WireClassificationSet>(
    "get-classification-set",
    "classification-set",
    `/api/classifications/sets/${encodeURIComponent(setId)}`,
  );
  return toClassificationSet(body);
}

/** `GET /api/classifications/stocks/{symbol}` (AC-12, AC-17, AC-23; DEC-0071). */
export async function getStockEvidence(symbol: string): Promise<StockEvidence> {
  const body = await request<WireStockEvidence>(
    "get-stock-evidence",
    "classification",
    `/api/classifications/stocks/${encodeURIComponent(symbol)}`,
  );
  return {
    symbol: body.symbol,
    name: body.name,
    lifecycle: body.lifecycle,
    set: toCurrentSet(body.set),
    factors: toFactorCells(body.factors),
    inputs: body.inputs.map(
      (row): InputRow => ({
        factor: row.factor,
        inputName: row.input_name,
        label: row.label,
        status: row.status,
        value: row.value,
        asOf: row.as_of,
        knownOn: row.known_on,
        restatedPossible: row.restated_possible,
        detail: row.detail,
      }),
    ),
    memberships: body.memberships.map((membership) => ({
      universeId: membership.universe_id,
      name: membership.name,
    })),
  };
}

/** `GET /api/classifications/stocks/{symbol}/history` (AC-18, AC-19), newest first. */
export async function getStockHistory(
  symbol: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<StockHistory> {
  const body = await request<WireStockHistory>(
    "get-stock-history",
    "classification",
    withQuery(
      `/api/classifications/stocks/${encodeURIComponent(symbol)}/history`,
      pagingQuery(params),
    ),
  );
  return {
    symbol: body.symbol,
    sets: body.sets.map((row) => ({
      setId: row.set_id,
      classificationDate: row.classification_date,
      runId: row.run_id,
      runOutcome: row.run_outcome,
      endedAt: row.ended_at,
      factors: toFactorCells(row.factors),
    })),
    nextCursor: body.next_cursor,
  };
}
