# Classification scheduler

`src/factorflow/classification/scheduler.py` finds the acquisition runs that
qualify for a classification set, claims them one at a time and has the engine
build each set (`component-design-classification-scheduler.md` section 2.4).
The data side, `claim_next_set` and `reclaim_interrupted_sets`, is
CAP-002-E2-S8. The loop, `run_classification_loop`, and the build handoff,
`build_claimed_set`, are CAP-002-E2-S9. The module's three statements are in
`classification/sql/`, and its settings are in `settings.py`.

No running process starts the loop yet: nothing under `src/` calls
`run_classification_loop`.

## `claim_next_set`

`claim_next_set(pool, *, at=None) -> ClaimedSet | None` runs two statements on
one pooled connection, in one transaction:

1. `qualifying_run.sql` finds the oldest run, by `ended_at`, in `succeeded` or
   `partial` that has no `classification_set` row. A run in `failed`,
   `cancelled` or `abandoned` never qualifies (AC-10, DAC-E2-4). When there is
   none, it returns `None`.
2. `claim_set.sql` inserts a `building` set for that run. Its
   `classification_date` is the America/Chicago date of `at`, or of the
   database's `CURRENT_TIMESTAMP` when `at` is `None` (DEC-0125).

It returns a `ClaimedSet(set_id, run_id)`. A `UniqueViolation` from the insert
means "not now", so the transaction is rolled back and `None` is returned. It
is raised in two cases:

- a set is already `building`, because the partial unique index
  `idx_classification_set_single_building` admits one;
- the run acquired a set between the two statements, because
  `classification_set.run_id` is unique.

## `reclaim_interrupted_sets`

`reclaim_interrupted_sets(pool) -> list[ReclaimedSet]` runs
`reclaim_interrupted.sql`. Every set in `building` becomes `failed`, with
`ended_at = now()` and the fixed reason
`interrupted: the application restarted during the build` (DAC-E2-12,
DEC-0067). With no set `building`, it changes no row.

It logs one `WARNING` per reclaimed set,
`classification set <set_id> for run <run_id> was interrupted; recorded failed`,
and returns them as `ReclaimedSet(set_id, run_id)`. It is meant to run once at
start, before any claim, and `run_classification_loop` runs it that way.

## `build_claimed_set`

`build_claimed_set(pool, set_id, timeout_seconds) -> engine.BuildResult` checks
out one pooled connection, holds it for the whole build and calls
`engine.build(conn, set_id, timeout_seconds)` on it. The engine records the
set `complete` or `failed` itself (see
[`build`](classification-engine.md#build)), so the result is returned
unchanged. An exception from `build` propagates, and the connection goes back
to the pool.

## `run_classification_loop`

`run_classification_loop(pool, settings, wait_fn=None, dispatch_fn=None,
stop_event=None)` is a coroutine that returns `None` (DEC-0054). `settings` is
a [`ClassificationSettings`](#settings). The other three parameters are seams
for tests:

| Parameter | Default | Role |
|---|---|---|
| `wait_fn` | `asyncio.sleep` | Awaited with `poll_interval_seconds` when there is nothing to build |
| `dispatch_fn` | `asyncio.to_thread` | Runs each synchronous database call off the event loop thread |
| `stop_event` | `None` | Once set, ends the loop at its next stop check. Without it the loop runs until its task is cancelled |

Every `await` in the loop is a call to `dispatch` or `wait`, so no
synchronous database call runs on the event loop.

### Start

1. `reclaim_interrupted_sets` is dispatched once, before the first claim, and
   never again (DAC-E2-12). It runs even when `stop_event` is already set.
2. One `WARNING` is logged for each key that `line_items.unresolved()` returns:
   `line item <key> has no payload key; its inputs will be missing`. It is
   logged once per start, before the first claim (see
   [Line items](classification-engine.md#line-items)).

The reclaim is not inside the loop's error handling. When it raises, for
example because the database is unreachable, the exception ends the coroutine.
No line-item warning is logged and no claim is made. Whether start-up should
retry instead is an open owner question (the story's task plan, Open Gaps;
scheduler design section 14, item 1).

### Each iteration

1. `claim_next_set` is dispatched.
2. When it returns a `ClaimedSet`, `build_claimed_set` is dispatched with
   `settings.build_timeout_seconds`. The loop logs one `INFO` line,
   `classification set <set_id> for run <run_id> ended <state>`, with `<state>`
   `complete` or `failed`. It then claims again at once, without waiting and
   without checking `stop_event`, because another run may be waiting.
3. When it returns `None`, the loop checks `stop_event`, waits
   `settings.poll_interval_seconds` through `wait_fn`, then checks `stop_event`
   again.

The loop awaits each build before it claims again, so one loop has at most
one build in flight. Across processes the one-`building` index enforces the
same limit.

### Failure

Any `Exception` raised while claiming or building ends that iteration only.
The loop logs it at `ERROR` as `classification scheduler iteration failed`,
with its traceback (`log.exception`). It then checks `stop_event`, waits the
poll interval and claims again (OPS-ERR-001). An exception that does not
derive from `Exception`, such as `asyncio.CancelledError`, is not caught.
Cancelling the task ends the loop, and nothing is logged.

A failed build does not normally raise. The engine records the set `failed`
with its reason, and the loop logs `ended failed`. A build that exceeds
`build_timeout_seconds` is one such case: the timeout reaches the engine
unchanged, and the set fails with a reason that begins `QueryCanceled:`.

When `build_claimed_set` raises instead, the claimed set stays `building`.
The engine raises when recording a failure itself fails (see
[Failure](classification-engine.md#failure)), and checking out the
connection can fail too. While the set stays `building`, every claim loses to
the one-`building` index and returns `None`, so the loop keeps polling but
builds nothing. This lasts until the next start's reclaim records the set
`failed`. The task plan's Open Gaps record this case for the owner, with
scheduler design section 14, item 1.

## Settings

The loop reads two fields of `ClassificationSettings` (`settings.py`). Their
environment variables, defaults and bounds are listed under
[Configuration](../../README.md#configuration) in the README.

| Field | Use |
|---|---|
| `poll_interval_seconds` | The wait after an iteration that built nothing or failed. There is no wait after a build |
| `build_timeout_seconds` | Passed to `engine.build` as `timeout_seconds` |

## Statements

All three are loaded once, at import, from `classification/sql/`, which ships
as package data. `claim_set.sql` binds `run_id` and `at` as `%(name)s`
parameters. The other two take no parameters.

| Statement | Effect |
|---|---|
| `qualifying_run.sql` | One `run_id`: the oldest by `ended_at` in `succeeded` or `partial` with no `classification_set` row, or no row. Read-only |
| `claim_set.sql` | Inserts one `building` set for `run_id`, with the America/Chicago date of `at` or `CURRENT_TIMESTAMP` as its `classification_date`. Returns `set_id` |
| `reclaim_interrupted.sql` | Every `building` set to `failed`, with `ended_at = now()` and the fixed interruption reason. Returns each `set_id` and `run_id` |

The engine's [safety rules](classification-engine.md#safety-rules) apply to
these files too.

## Process boundary

The scheduler belongs to the application process (DEC-0054), and the
ingestion process never loads it: `factorflow.ingestion_main` imports nothing
under `factorflow.classification`. TC-COMP-085, in
`tests/unit/test_classification_scheduler_loop.py`, checks this twice: once by
parsing the source and once by importing the module in a fresh interpreter.

`tests/unit/test_classification_scheduler_shapes.py` holds `scheduler.py` to
three rules: no `time.sleep` call, no `threading` import and no import from
`factorflow.ingestion`. It also checks that every `await` in the loop is a
call to `dispatch` or `wait`.
