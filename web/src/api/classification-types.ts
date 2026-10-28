/**
 * Public types of the classification fetch layer (component design
 * `classification-ui` section 2.4), mirroring the response shapes of
 * `classification-api` section 2.7 field for field in camelCase.
 *
 * Scores, percentiles and input values are the wire's decimal strings at
 * stored precision (DEC-0063), and dates and timestamps are the wire's
 * ISO-8601 strings, never `Date` (STD-UI-5): `format.ts` is the one place
 * either becomes text. A field is `| null` exactly where its source says the
 * wire can carry null.
 */

export type FactorName = "value" | "growth" | "momentum";

export type ReasonCode =
  | "input_missing"
  | "input_outdated"
  | "input_not_computable"
  | "not_enough_stocks"
  | "retired";

export type Lifecycle = "active" | "retired";

/** `acquisition_run.state` of the download a set was built from. */
export type RunOutcome = "succeeded" | "partial";

/** `FactorCellResponse`. */
export interface FactorCell {
  status: "classified" | "not_classified";
  score: string | null;
  percentile: string | null;
  reasonCode: ReasonCode | null;
  reasonInput: string | null;
  reasonDetail: string | null;
  restatedPossible: boolean;
}

/** One factor's entry in a read's `factors {qualified_count, ranked, min_peer_set_size}`. */
export interface FactorSummary {
  qualifiedCount: number;
  ranked: boolean;
  minPeerSetSize: number;
}

/** `SetBlock`: the current, complete set (classification-reader `CurrentSet`). */
export interface CurrentSet {
  setId: string;
  classificationDate: string;
  runId: string;
  /** The download's start time: how every surface names it (DEC-0083). */
  runStartedAt: string;
  runOutcome: RunOutcome;
  state: "complete";
  startedAt: string;
  endedAt: string;
  latestTradingDay: string;
  activeInstruments: number;
  /** True exactly when the read's `later` is non-null (DEC-0082). */
  notCurrent: boolean;
}

/** `LaterBlock`: the newer building or failed set, or the first while none is complete (DEC-0082). */
export interface LaterSet {
  setId: string;
  state: "building" | "failed";
  startedAt: string;
  endedAt: string | null;
  failureReason: string | null;
  runId: string;
  runStartedAt: string;
}

/**
 * The one shape the list and the summary reads share (DAC-E4-S1-3, AC-20,
 * AC-22): `neverClassified` is true exactly when `set` is null, and `later`
 * carries a building or failed set in both states.
 */
export interface SetState {
  neverClassified: boolean;
  set: CurrentSet | null;
  later: LaterSet | null;
}

export interface StockRow {
  symbol: string;
  name: string;
  lifecycle: Lifecycle;
  factors: Record<FactorName, FactorCell>;
}

/** `ClassificationListResponse` (`GET /api/classifications`). */
export interface ClassificationList extends SetState {
  factors: Record<FactorName, FactorSummary>;
  /** Over the whole filtered scope, never the page (S03-2, DAC-E4-3). */
  matchCount: number;
  stocks: StockRow[];
  /** Compare only. */
  unknownSymbols: string[];
  nextCursor: string | null;
}

export interface StocksCurrent {
  currentCount: number;
  followedCount: number;
}

/** `ClassificationSummaryResponse` (`GET /api/classifications/summary`, DEC-0071). */
export interface ClassificationSummary extends SetState {
  factors: Record<FactorName, FactorSummary>;
  stocksCurrent: StocksCurrent | null;
}

export type InputStatus = "present" | "missing" | "outdated" | "not_computable";

/** One `factor_input` row of the current set; `value`, `asOf` and `knownOn` are nullable columns. */
export interface InputRow {
  factor: FactorName;
  inputName: string;
  label: string;
  status: InputStatus;
  value: string | null;
  asOf: string | null;
  knownOn: string | null;
  restatedPossible: boolean;
  /** Passed through as received; no key is renamed (DEC-0144). */
  detail: unknown;
}

export interface Membership {
  universeId: string;
  name: string;
}

/** `StockEvidenceResponse` (`GET /api/classifications/stocks/{symbol}`). */
export interface StockEvidence {
  symbol: string;
  name: string;
  lifecycle: Lifecycle;
  set: CurrentSet | null;
  /** Holds only the cells the API sent: `{}` when the stock has none (DEC-0140). */
  factors: Record<FactorName, FactorCell>;
  inputs: InputRow[];
  memberships: Membership[];
}

/** One earlier set's result for a stock (`StockHistoryResponse.sets[]`). */
export interface StockHistoryRow {
  setId: string;
  classificationDate: string;
  runId: string;
  runOutcome: RunOutcome;
  endedAt: string;
  factors: Record<FactorName, FactorCell>;
}

/** `StockHistoryResponse` (`GET /api/classifications/stocks/{symbol}/history`). */
export interface StockHistory {
  symbol: string;
  sets: StockHistoryRow[];
  nextCursor: string | null;
}

/** `SetResponse` (`GET /api/classifications/sets/{set_id}`) and one `SetListResponse` row. */
export interface ClassificationSet {
  setId: string;
  state: "building" | "complete" | "failed";
  classificationDate: string;
  runId: string;
  runStartedAt: string;
  runOutcome: RunOutcome;
  startedAt: string;
  endedAt: string | null;
  failureReason: string | null;
  latestTradingDay: string | null;
  activeInstruments: number | null;
  factors: Record<FactorName, FactorSummary>;
}

/** `SetListResponse` (`GET /api/classifications/sets`). */
export interface ClassificationSetPage {
  sets: ClassificationSet[];
  nextCursor: string | null;
}

/** One `UniverseListResponse` row. */
export interface UniverseSummary {
  universeId: string;
  name: string;
  lifecycle: Lifecycle;
  memberCount: number;
  createdAt: string;
  retiredAt: string | null;
}

/** `UniverseListResponse` (`GET /api/universes`). */
export interface UniverseList {
  universes: UniverseSummary[];
  activeCount: number;
  retiredCount: number;
  nextCursor: string | null;
}

/**
 * How a universe was created (universe-service `Origin`, DEC-0065). All five
 * nullable fields are null for `by_hand`; `symbol` is also null for a
 * `from_filter` origin saved with no search active.
 */
export interface UniverseOrigin {
  kind: "by_hand" | "from_filter";
  setId: string | null;
  classificationDate: string | null;
  /** Keyed by query-parameter name, as received (`value_percentile_min`; DEC-0144). */
  thresholds: Record<string, string> | null;
  hideIncomplete: boolean | null;
  symbol: string | null;
}

/**
 * One member on the universe read. `name` and `factors` are null when the
 * reader has no row for the member (CAP-002-E1-S6, DEC-0097).
 */
export interface UniverseMember {
  symbol: string;
  name: string | null;
  lifecycle: Lifecycle;
  memberSince: string;
  factors: Record<FactorName, FactorCell> | null;
}

/** `UniverseResponse` (`GET`, `POST`, `PATCH /api/universes/...`). */
export interface UniverseDetail {
  universeId: string;
  name: string;
  lifecycle: Lifecycle;
  createdAt: string;
  retiredAt: string | null;
  memberCount: number;
  asOf: string;
  asOfBeforeCreation: boolean;
  origin: UniverseOrigin;
  members: UniverseMember[];
  set: CurrentSet | null;
}

export type UniverseEventType =
  | "created"
  | "renamed"
  | "member_added"
  | "member_removed"
  | "retired";

export interface UniverseEvent {
  eventId: number;
  eventType: UniverseEventType;
  name: string | null;
  symbol: string | null;
  recordedAt: string;
  recordedOn: string;
  /** Passed through as received; no key is renamed (DEC-0144). */
  filterProvenance: unknown;
}

/** `UniverseEventsResponse` (`GET /api/universes/{id}/events`). */
export interface UniverseEventPage {
  events: UniverseEvent[];
  nextCursor: string | null;
}

/** `AddMembersResponse`. */
export interface AddMembersResult {
  added: string[];
  alreadyMember: string[];
}

/** `RemoveMemberResponse`. */
export interface RemoveMemberResult {
  removedAt: string;
}

/** `RetireUniverseResponse`. */
export interface RetireUniverseResult {
  lifecycle: "retired";
  retiredAt: string;
}

/** The twelve optional bounds, as decimal strings (classification-api section 2.4). */
export interface ThresholdBounds {
  valuePercentileMin?: string;
  valuePercentileMax?: string;
  valueScoreMin?: string;
  valueScoreMax?: string;
  growthPercentileMin?: string;
  growthPercentileMax?: string;
  growthScoreMin?: string;
  growthScoreMax?: string;
  momentumPercentileMin?: string;
  momentumPercentileMax?: string;
  momentumScoreMin?: string;
  momentumScoreMax?: string;
}

/**
 * The filter a universe is saved from: the bounds, `hideIncomplete` and the
 * Find a stock prefix, `null` when no search is active (DEC-0076, DEC-0085).
 */
export interface Thresholds extends ThresholdBounds {
  hideIncomplete: boolean;
  symbol: string | null;
}

export type ClassificationSort = "symbol" | `${FactorName}_score` | `${FactorName}_percentile`;

/**
 * `GET /api/classifications` parameters. Every field is optional and only
 * present ones are sent (classification-api section 2.4; owner-directed fix
 * E4-F11), so it does not extend `Thresholds`.
 */
export interface ClassificationListParams extends ThresholdBounds {
  universeId?: string;
  /** Compare: 2 to 6 symbols. */
  symbols?: string[];
  sort?: ClassificationSort;
  order?: "asc" | "desc";
  hideIncomplete?: boolean;
  symbol?: string;
  limit?: number;
  cursor?: string;
}

/** `POST /api/universes` by hand. */
export interface CreateUniverseByHand {
  name: string;
  symbols: string[];
}

/** `POST /api/universes` from a result: the filter and the set it was read against. */
export interface CreateUniverseFromFilter {
  name: string;
  filter: Thresholds;
  setId: string;
}

export type CreateUniverseRequest = CreateUniverseByHand | CreateUniverseFromFilter;

/** The client's own identifier for each call: kebab-case of the function name (DEC-0143). */
export type ClassificationOperation =
  | "list-universes"
  | "create-universe"
  | "get-universe"
  | "rename-universe"
  | "retire-universe"
  | "list-universe-events"
  | "add-universe-members"
  | "remove-universe-member"
  | "list-classifications"
  | "get-classification-summary"
  | "list-classification-sets"
  | "get-classification-set"
  | "get-stock-evidence"
  | "get-stock-history";

/** The four resources of classification-api section 2.5 (DEC-0143, DEC-0149). */
export type ClassificationResource =
  | "universe"
  | "universe-member"
  | "classification"
  | "classification-set";
