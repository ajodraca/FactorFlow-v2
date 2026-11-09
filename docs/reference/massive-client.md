# Massive historical client

`src/factorflow/ingestion/massive/client.py` provides the project-owned
historical boundary over Massive's official REST SDK. `MassiveClient` exposes
four product-named reads: `fetch_reference(symbol)`,
`fetch_daily_bars(symbol, start, end)`, `fetch_financials(symbol, start, end)`,
and `fetch_corporate_actions(symbol, start, end)`. Each returns the parsed
models described in
[Massive provider response models](../../README.md#massive-provider-response-models)
rather than provider wire shapes. It also exposes `start_instrument()`, the
stock boundary, which reads and sends nothing (see
[Stock boundary](#stock-boundary)). The module exports `MassiveClient` and
`classify_for_governor`, the classifier every governed request uses (see
[Classifying a failed request](#classifying-a-failed-request)).

The client creates one reusable SDK client from `MassiveSettings`, explicitly
disabling SDK retries, pagination, and request tracing. It passes the runtime
credential to the SDK for header authentication; it does not put the credential
in request URLs. It also passes the validated `FACTORFLOW_MASSIVE_BASE_URL` as
the SDK's `base`, so every request of the four reads, followed `next_url` pages
and the `vx` sub-client's IPO reads included, goes to that host
(CAP-001-E3-S6). Every initial and followed page request passes through
`RateLimitGovernor`, while `paging.follow_pages()` follows a present
`next_url` one page at a time and raises if a later page fails rather than
returning a partial range.

Reference reads use Massive's single-ticker endpoint. Daily-bar requests use
multiplier `1`, timespan `day`, inclusive ISO date bounds, and unadjusted bars.
Financial statements are read from the three statement endpoints (balance
sheets, income statements and cash-flow statements), each bounded by
`period_end`. Massive's ratios endpoint is not called: CAP-001's fundamentals
are the three statements, and ratios can be derived later from stored
statements and bars (component design v13 section 2.5). Corporate actions
combine splits, dividends, IPOs, and ticker-change events. Ticker events have
no provider date-range parameter, so the client validates their rows and
applies the requested inclusive range locally. The client never calls
Massive's forward-looking market-status endpoint or ticker-list endpoint.

An empty successful response is not an unknown instrument. `fetch_daily_bars`,
`fetch_financials` and `fetch_corporate_actions` return an empty list when a
recognised instrument has nothing in range, such as no corporate action, no
filings or a range outside its trading life. Only `fetch_reference` raises
`InstrumentNotFound` for an empty result, and any provider 404 still raises it
on every read (decision record DEC-0047 in the ai-agents SDD harness).

The credential never leaves for another host. With SDK retries at `0`, a
redirect is refused rather than followed: the governor retries the request to
the same host up to `max_attempts`, then raises `ProviderUnavailable`. Neither
SDK connection pool uses a proxy, whatever the `HTTP_PROXY`, `HTTPS_PROXY` or
`ALL_PROXY` environment says, and no construction path relaxes TLS
verification (`cert_reqs="CERT_REQUIRED"` on both pools). The release build
carries none of the test tree: the `Dockerfile` copies nothing under `tests/`,
the wheel contains nothing under it, and nothing in `src/factorflow` imports
from it. `tests/unit/test_massive_redirects.py`, `test_massive_tls.py` and
`test_release_excludes_test_paths.py` prove each of these without opening a
socket.

## Classifying a failed request

`classify_for_governor(exc)` is the `classify` callable every governed request
passes to `RateLimitGovernor.execute` (CAP-003-E8-S3; CAP-003
`component-design-massive-client.md` section 2.3). It maps the exception one
send raised onto the governor's `Outcome`. The first matching rule wins:

| Rule | Exception | `Outcome` |
|---|---|---|
| 1 | urllib3 `MaxRetryError` whose `reason` is a `ResponseError` whose text equals `ResponseError.SPECIFIC_ERROR.format(status_code=429)` (`too many 429 error responses` in urllib3 2.7.0) | `THROTTLED` |
| 2 | Any other exception that is not the SDK's `BadResponse` | `RETRYABLE` |
| 3 | A `BadResponse` whose body `is_rate_limited_body` recognises | `THROTTLED` |
| 4 | Any other `BadResponse`, typed by `classify_error_body` | `FATAL`, unless the type is `ProviderUnavailable`, which is `RETRYABLE` |

A provider `429` reaches the classifier as rule 1's `MaxRetryError`, never as
a `BadResponse`. The SDK builds its connection pool with
`Retry(total=retries, status_forcelist=[413, 429, 499, 500, 502, 503, 504])`,
and the client passes `retries=0`, so a forcelisted status raises
`MaxRetryError` before the SDK sees the body. Rule 1 compares the reason with
urllib3's own constant, built once as `_THROTTLED_RETRY_REASON`, never with a
hand-typed copy, so a urllib3 release that rewords the text changes both sides
together. The comparison is exact: the same text with a prefix, other
whitespace or another case is `RETRYABLE`.

Rule 2 keeps every other transport failure on the delivered retry path: the
other forcelisted statuses (their `reason` names their own status), a refused
redirect (`reason` `too many redirects`), connection errors and timeouts. A
`KeyboardInterrupt` or `SystemExit` raised during a send is also `RETRYABLE`
(see [Known limitations](#known-limitations)). Rule 3 never fires with the
locked SDK under `retries=0`; it keeps a `429` throttling if an SDK release
drops `429` from its forcelist.

So a `429` costs no attempt. The governor waits it out at the next minute
boundary, charging the wait to the stock's throttle wait budget, and raises
`ProviderRateLimited` instead of taking a wait that would spend more than
`max_throttle_wait_seconds` (default 300). That error carries no provider
`request_id`, and its cause is the last `MaxRetryError`. With every request
answered `429` and no jitter, a read after `start_instrument()` waits five
times 60 seconds over six requests, then raises. The budget is described in
[Rate limit governor](rate-limit-governor.md#throttle-wait-budget).

A `FATAL` outcome is the only one on which the governor re-raises the SDK's
`BadResponse`. `MassiveClient` then raises the typed error built from that one
response by `classify_error_body`, so a `ProviderNotEntitled` or
`InstrumentNotFound` keeps the response's `request_id`. A
`ProviderUnavailable` or `ProviderRateLimited` the governor raises passes
through unchanged.

## Stock boundary

`start_instrument()` begins a new stock: it calls the governor's
`start_throttle_budget()` once, and does nothing else. It asks the governor for
no permit and sends no request (CAP-003-E8-S3; CAP-003
`component-design-massive-client.md` section 2.6). Every read made after it
spends the same throttle wait budget until the next call. One governor belongs
to one client, built together in `ingestion_main._build_client_for_key`.

No production code calls `start_instrument()` yet, so a client's throttle
wait budget starts when its governor is constructed and is spent across the
governor's whole life.

## Known limitations

**Carried forward as an accepted warning from implementation review v6**
(`CAP-001-E3-S1-implementation-review-v6.md`, IR-001, low). The empty-result
tests serve `results: []` only. An envelope with no `results` key is also
handled as empty today (`paging.follow_pages` reads
`envelope.get("results") or []`), but no test pins that form, so a refactor
that indexed `envelope["results"]` directly would still pass.

**Carried forward as accepted warnings from implementation review v1**
(`CAP-001-E3-S6-implementation-review-v1.md`). All four are about how strong
the tests are. None leaves an acceptance criterion unmet:

- `test_trailing_slash_base_never_produces_a_double_slash` uses the default
  host, so it would still pass if `base=` were removed. Other tests catch that
  removal (IR-001).
- `test_no_construction_path_passes_a_tls_override` does not install the
  `forbid_sockets` guard. It patches `RESTClient` for the whole test, so no
  pool exists today (IR-002).
- The source scan for `http` acceptance flags string constants, comparisons
  and collection literals. It would miss a `startswith("http")` or a `match`
  case (IR-003).

  It has exactly one exemption (CAP-001-E1-S7, DAC-E1-S7-6). The constants
  `http://127.0.0.1:`, `http://localhost:` and `http://[::1]:` are accepted
  only in `src/factorflow/api/app.py`, where they build the
  [Origin allow-list](../../README.md#host-and-origin-checks). That module is
  matched by its path under `src/factorflow`, not by its file name. Any other
  `http://` constant there, those three anywhere else, and every comparison
  with or listing of `"http"` still fail the scan.
- The `Dockerfile` check reads `COPY`/`ADD` line by line. It would miss a
  continued line or the JSON array form (IR-004).

**The classifier retries a cancellation signal.** Rule 2 returns `RETRYABLE`
for `KeyboardInterrupt` and `SystemExit`, because the governor hands every
`BaseException` to `classify`. The governor therefore backs off and resends
through a cancellation signal until `max_attempts` is reached. This is the
case the governor's v5 IR-003 limitation describes
([Rate limit governor](rate-limit-governor.md#known-limitations)). It is
unchanged by CAP-003-E8-S3, and no test covers it.

**Carried forward as an accepted warning from implementation review v2**
(`CAP-003-E8-S3-implementation-review-v2.md`, IR-002, low). TC-COMP-251's
guard (`test_the_429_change_adds_no_package_and_no_test_fakes_a_429_or_reads_attempts`
in `tests/unit/test_massive_retry.py`) reaches only what its `ast` checks see.
Its docstring, and the comment on `_SCHEMA_DEFAULT_READS`, claim more:

- Clause (c) finds a replaced `RESTClient` only through a string target of
  `patch`, `patch.object` or `monkeypatch.setattr`, one test function at a
  time. A patch of a `RESTClient` method, such as
  `patch.object(RESTClient, "_get", ...)` or `patch("massive.RESTClient._get", ...)`,
  or `patch.multiple(client, RESTClient=...)`, would fake a `429` unseen.
- Clause (d) finds an `attempts` read only as `.attempts` or `["attempts"]`.
  `getattr(x, "attempts")`, `row.get("attempts")` and a read in SQL text pass
  it. `tests/integration/test_run_constraints.py` reads back an `attempts`
  value the test itself inserts, in SQL, so the comment's "the one `attempts`
  read under tests/" holds only for reads the guard can see.
- The one exemption is keyed on the expression text
  `result_columns['attempts']` in `tests/integration/test_run_constraints.py`,
  so a second read written the same way in that file would also pass, and
  nothing checks that the exemption is still needed.

No test in the tree uses any of these forms today.
