# Acquisition runner

`src/factorflow/ingestion/runner.py` turns a claimed run into observations,
one instrument at a time. It is the process that finally calls the
[observation writer](../../README.md#observation-writer). It writes nothing directly — every
insert or update belongs to `writer.py` on the success path and `outcomes.py`
on the failure path — while reading an instrument's symbol and coverage
segments through two parameterised queries of its own.

`AcquisitionRunner.execute_claimed(run_id, depth_years, instrument_ids)`
walks the roster it was handed — snapshotted once at claim time, so an
instrument added mid-run belongs to the next one. Before anything else it
records the roster's size on the run through the journal's
`record_instruments_named`, because that is the count `finalise` compares
written results against. A run whose claimed depth
is `None` is finalised without a single provider call: no stated depth means
there is no window to fetch.

Before every instrument, in this order, it refreshes the heartbeat and then
asks whether cancellation was requested. A lost claim stops the run
immediately and writes nothing further — another runner now owns it. An
observed cancellation finalises and stops. Both checks sit at the top of the
loop rather than around the work, so the longest a cancelled run continues
is one instrument, including that instrument's throttle waits (see
[Stock boundary](#stock-boundary)).

For each instrument it fetches the four data types individually through
[`plan_fetches`](../../README.md#range-planner), which is what keeps a re-run from
re-fetching covered ground. Each data type is fetched in a separate
try/except block. `CredentialRejected` is the one run-level error: every
remaining instrument would fail the same way, so the runner records the whole
run `failed` through the journal's `fail_run`, with the composed
credential-safe reason as `failure_reason`, writes nothing for the instrument
it was reading, and returns, so the ingestion process keeps polling
(EXP-20261011-3). The reason is served as `failure_reason` by
`GET /api/acquisition-runs` and `GET /api/acquisition-runs/{id}`; no screen
shows it yet. `InstrumentNotFound`, `ProviderUnavailable`, and any other `MassiveError`
are classified by `classify_provider_error` into a per-data-type
`InstrumentOutcomeRecord` (`not_found` or `failed`). The reason is composed
by `compose_failure_reason` and passed through the entrypoint's redaction
callable before classification, so a credential in a provider message never
reaches the database. After all four data types are attempted, the runner
calls `write_instrument_with_outcomes()` in one transaction, passing the
successfully fetched observations alongside the error outcomes for any
data types that failed. This allows one instrument to record distinct
outcomes per data type — for example `written` for prices and `not_found`
for fundamentals. Provider failures affect the instrument, not the run;
the next instrument starts immediately after.

When the roster is exhausted the run is finalised from what was written.

`CredentialAwareClientFactory` keeps one provider client and rebuilds it only
when the credential's value changes, and the entrypoint re-reads the
credential at each claim — so rotating the key takes effect on the next run
without restarting the process.

## Stock boundary

Once the heartbeat and cancellation checks pass, the runner calls the
client's `start_instrument()` once, before it looks up the instrument's
symbol (CAP-003-E8-S4; CAP-003 `component-design-acquisition-runner.md`
section 2.2). That starts the stock's throttle wait budget (see
[Stock boundary](massive-client.md#stock-boundary)), so each stock has the
whole `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS` (default 300) of
throttle waits to itself, and a throttled stock never spends the next one's.
The budget starts where the heartbeat was refreshed, so the throttle waits
between two heartbeats never exceed one budget.

A stock whose claim is lost or whose cancellation is observed never reaches
the call. A stock whose `instrument_id` has no `instrument` row does: its
budget starts, and the runner then skips it for the missing symbol.

## Provider refusals

A plan refusal and a rate limit are per-data-type failures, not run-level
ones (CAP-003-E8-S1 to S4; AC-29, AC-30):

- **Plan refusal.** The client sends a refused data type's request once and
  raises `ProviderNotEntitled`, with no wait. The runner records that data
  type `failed` with a `[not_entitled]` reason carrying the provider's
  `request_id`, then fetches the stock's other data types and the next stock.
  For fundamentals, a refused balance-sheets request means the income and
  cash-flow statements are not requested.
- **Persistent rate limit.** A `429` is waited out at the next minute
  boundary and never counted as an attempt. When the stock's budget would be
  exceeded, the read raises `ProviderRateLimited` and the runner records that
  data type `failed` with a `[rate_limited]` reason. With every request
  answered `429` and no jitter, the stock's first read waits five times 60 s
  over six requests. Each later read of the same stock then sends one request
  and is recorded `[rate_limited]` too, because the budget is spent. The next
  stock starts with a full budget.

The run is then finalised by the delivered rule: `partial` when anything was
stored, `failed` when nothing was. At the default timing set a fully throttled
stock stays inside the 900 s staleness window, so the run is never reclaimed
as `abandoned` because of throttling. The reasons and their kinds are
described in
[Massive provider failure reasons](../../README.md#massive-provider-failure-reasons).

`tests/integration/test_runner_provider_refusals.py` proves both cases end to
end. It runs the real `MassiveClient`, SDK, urllib3 request path and
`RateLimitGovernor`, built from production `MassiveSettings`, against a
PostgreSQL database. Only urllib3's `_make_request` is replaced, and time is a
fake clock.

## Known limitations

**Carried forward as accepted warnings from implementation review v1**
(`CAP-001-E4-S6-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- `test_rate_limit_does_not_produce_outcome_row` (TC-COMP-145) provides a
  normal full-success stub client and asserts outcome strings are in the
  allowed set; it does not inject a 429-equivalent at the fetch boundary
  (IR-001, medium). Since CAP-003-E8-S4,
  `tests/integration/test_runner_provider_refusals.py` injects real `429`
  responses at urllib3's request boundary, through the real client and
  governor, and pins that a persistent `429` reaches the runner only as
  `ProviderRateLimited`, recorded `[rate_limited]` (TC-COMP-254, TC-COMP-255).
  No runner-level test has a `429` waited out and followed by a successful
  response. That path is pinned one layer down, at the client, by
  `test_rate_limited_responses_are_paced_without_consuming_attempts` in
  `tests/unit/test_massive_retry.py`.
- `test_appended_rows_persist_written_outcome` (TC-COMP-183 integration) does
  not assert `corporate_actions`; `test_unchanged_rows_persist_unchanged_outcome`
  (TC-COMP-184 integration) asserts only `prices` and `fundamentals`. An
  integration regression silently dropping one data type from
  `run_instrument_result` insertion would not be caught by these integration
  tests (IR-002, medium).
