/**
 * Response types mirroring the JSON contracts `ingestion-api` publishes
 * (component design `owner-web-app` section 2.1, `web/src/api/types.ts`).
 *
 * These are hand-written against the documented contract rather than
 * generated: the interface and the API are built together but are separate
 * source trees, and CAP-001-E1-S5 is explicitly developable in parallel with
 * CAP-001-E1-S6's endpoint.
 */

/**
 * The most recent acquisition run's summary.
 *
 * CAP-001-E1-S6's `HealthResponse` hardcodes this field to `null`, and
 * CAP-001-E7-S3 owns its real shape. Typing it `null` exactly — rather than
 * an `unknown`-shaped placeholder — keeps the current contract precise and
 * forces the widening to be a deliberate, reviewable change in that story,
 * mirroring the same decision the API model records (IR-006).
 */
export type RunSummary = null;

/**
 * `GET /api/health`'s response body (component design `ingestion-api`
 * section 11; CAP-001-E1-S5 Technical Details).
 *
 * `credential_present` is a boolean only, never the credential value
 * (AC-13, DAC-E1-9).
 *
 * `database: "unreachable"` means the API answered but its store did not —
 * a different fact from the API not answering at all, which is a rejected
 * `fetchHealth()` rather than any value of this field (DAC-E1-15 versus
 * DAC-E1-S6-2). The two must not be collapsed into one code path.
 */
export interface HealthResponse {
  status: "ok";
  database: "reachable" | "unreachable";
  credential_present: boolean;
  schema_version: number | null;
  most_recent_run: RunSummary;
}

/**
 * The eight-state discriminated union component design `owner-web-app`
 * section 2.4 specifies for every fetched region (STD-UI-23), reproduced
 * here verbatim from that section rather than re-derived, per CAP-001-E1-S4's
 * task plan T004. A `loading` flag combined with an `error` flag can
 * represent states that must never render and cannot represent the two
 * empty states this capability distinguishes (AC-17); this explicit union
 * is what a boolean pair cannot express.
 *
 * `empty-never-populated` and `empty-no-match` are separate variants
 * because AC-17's failure is exactly conflating them. `unavailable` is
 * scoped per column or region, never per screen, and carries the reason a
 * check could not run rather than leaving the caller to invent one.
 */
export type ScreenState<T> =
  | { kind: "loading" }
  | { kind: "empty-never-populated" }
  | { kind: "empty-no-match" }
  | { kind: "populated"; data: T; fetchedAt: string }
  | { kind: "partial"; data: T; fetchedAt: string }
  | { kind: "unavailable"; reason: string }
  | { kind: "error"; message: string; requestId: string }
  | { kind: "unreachable" };

/**
 * One symbol's classification in a `POST /api/instruments` response
 * (`SymbolOutcomeResponse`, CAP-001-E2-S3). `disposition` mirrors the
 * store's `Disposition` enum values verbatim rather than being re-worded,
 * so a caller can compare it directly against the wire value.
 */
export interface SymbolOutcome {
  inputSymbol: string;
  normalisedSymbol: string | null;
  disposition: "added" | "reactivated" | "duplicate_active" | "malformed";
  reason: string | null;
}

/**
 * `POST /api/instruments`'s `201` response body (`AddInstrumentsResponse`),
 * mapped from snake_case. `added`, `reactivated` and `rejected` are kept
 * separate (DAC-E2-S3-1, DAC-E2-S4-1) so a mixed batch's outcome is legible
 * without the caller re-deriving it from a flat list, and so a rejection
 * never discards the symbols that were accepted alongside it.
 */
export interface AddInstrumentsResult {
  added: SymbolOutcome[];
  reactivated: SymbolOutcome[];
  rejected: SymbolOutcome[];
}

/** The two lifecycle states an instrument can carry (AC-21, DAC-E2-S4-4). */
export type InstrumentLifecycle = "active" | "retired";

/**
 * One instrument row (`InstrumentResponse`, CAP-001-E2-S3). The API's
 * current response shape carries no `addedAt`/`retiredAt` timestamp per
 * row — see this story's tasks-file Notes for the deviation from the
 * originally assumed shape.
 */
export interface Instrument {
  instrumentId: number;
  symbol: string;
  lifecycle: InstrumentLifecycle;
}

/**
 * `GET /api/instruments`'s `200` response body (`InstrumentListResponse`,
 * DAC-E2-10), mapped from snake_case.
 */
export interface InstrumentListResult {
  rows: Instrument[];
  activeCount: number;
  retiredCount: number;
  nextCursor: string | null;
}

/**
 * `GET`/`PUT /api/settings/history-depth`'s response body
 * (`HistoryDepthResponse`), mapped from snake_case. `years` is `null`, not
 * omitted, when the owner has never stated a depth (DAC-E2-S3-2).
 */
export interface HistoryDepth {
  years: number | null;
  updatedAt: string | null;
}

/**
 * The eight acquisition-run states (component design `ingestion-api`
 * section 11; `RunState` in `src/factorflow/api/models.py`), exactly the
 * wire values. Three are non-terminal (`requested`, `running`,
 * `cancelling`); the other five are outcomes.
 */
export type RunState =
  | "requested"
  | "running"
  | "cancelling"
  | "succeeded"
  | "partial"
  | "failed"
  | "cancelled"
  | "abandoned";

/**
 * One run in `GET /api/acquisition-runs` (`RunSummary` in
 * `src/factorflow/api/models.py`; component design `ingestion-api` section
 * 11), mapped from snake_case. Named `AcquisitionRun` rather than reusing
 * `RunSummary`, which is the health placeholder CAP-001-E7-S3 owns.
 */
export interface AcquisitionRun {
  runId: string;
  state: RunState;
  historyDepthYears: number;
  requestedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  instrumentsNamed: number;
  instrumentsWritten: number;
  instrumentsFailed: number;
  failureReason: string | null;
}

/**
 * `GET /api/acquisition-runs`'s `200` body (`RunListResponse` in
 * `src/factorflow/api/models.py`; component design `ingestion-api` section
 * 11), mapped from snake_case. `nextCursor`
 * is `null` on the last page.
 */
export interface AcquisitionRunPage {
  runs: AcquisitionRun[];
  nextCursor: string | null;
}

/**
 * `POST /api/acquisition-runs`'s `202` body (`RunStartResponse` in
 * `src/factorflow/api/models.py`; component design `ingestion-api` section
 * 11). `queuedBehind` carries the active
 * run's id when the new run is queued behind it (AC-23), else `null`.
 */
export interface RunStartResult {
  runId: string;
  state: "requested";
  queuedBehind: string | null;
}

/**
 * `POST /api/acquisition-runs/{id}/cancel`'s `202` body
 * (`CancelRunResponse` in `src/factorflow/api/models.py`; component design
 * `ingestion-api` section 11).
 */
export interface RunCancelResult {
  state: "cancelling" | "cancelled";
}
