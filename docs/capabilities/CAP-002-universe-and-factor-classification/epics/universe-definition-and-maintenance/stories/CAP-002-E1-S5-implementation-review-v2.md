---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S5-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T20:46:00Z"
reviewed_head: "59bc0d16eee956ddce839c60bb55b70aa7c8d7f0"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:9602353675e67046d778b6d4506fadeb9299c07fb864d622ea5c75c6cf029bcb"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S5
    artifact_version: 1
    content_revision: sha256:fcb642f919a718fa93aae334cb6d085348a3e3fa70aec1d92a3796547a101317
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T20:46:00Z
  source_artifacts:
    - id: CAP-002-E1-S5
      version: "1 (sha256:fcb642f919a718fa93aae334cb6d085348a3e3fa70aec1d92a3796547a101317)"
    - id: CAP-002-E1-S5-tasks
      version: "1 (docs_synced_review v1; task content unchanged since review v1)"
    - id: CAP-002-E1-S5-tdd-evidence
      version: "1 (cycles 1 to 4)"
    - id: CAP-002-E1-S5-implementation-review
      version: "1 (baseline, reviewed_head 3a8777092afbeaa67b63a3157f2fb59beaa11c7b)"
    - id: DEC-0248
      version: "owner-decided 2026-10-31T14:37:45Z"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-universe-service-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S5 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 8/8 passed |

This is a re-review, run unattended for the pipeline driver and independent of the coding
work. No rework happened after v1. What changed since v1's `reviewed_head` (`3a87770`) is the
v1 report itself, doc sync (`14202b7`), and merge `59bc0d1`. That merge brought
CAP-002-E1-S4 in from `origin/main` and resolved conflicts in `service.py` and
`docs/reference/universe-service.md`. The pipeline reported `RESUME` because `service.py` had
changed after the last passing review.

The merge is faithful:

- S4's lines arrived unchanged. The changed lines of `git diff 3a87770 HEAD -- service.py`
  equal those of `git diff 6a5eca7 f4deee3 -- service.py` (S4's own change) except one
  docstring sentence. That sentence said `create_from_filter` "is not defined here", and the
  merge rightly dropped it.
- S5's own production diff against the new base is the v1 diff. The changed lines of
  `git diff f4deee3 HEAD -- src` equal those of v1's `git diff 6a5eca7 3a87770 -- src` except
  that same sentence.
- `__all__` lists both stories' names in sorted order.
- No S5 test file changed. The four cycle patches, applied in order to `6a5eca7`, still
  reproduce `3a87770` byte for byte, and the two test files equal `HEAD`.

All eight required commands pass on the merged tree: 803 PostgreSQL tests, 1262 others, ruff,
format, strict mypy, the build and the TDD-evidence lint against the new base. The
re-review's mutation run had 57 mutants and 50 were killed. The seven survivors are the ones v1
recorded (IR-001, IR-002, IR-004 and two equivalent mutants) plus one new equivalent mutant.
The four v1 findings stay open with the same severity and scope `carried`: no rework touched
them. The merge added no finding, so the verdict stays `PASS-WITH-WARNINGS`.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tasks.md` |
| Component | `FactorFlow-v2` (run-local clone `repos/factorflow-v2/FactorFlow-v2` under the harness worktree) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S5` |
| HEAD | `59bc0d16eee956ddce839c60bb55b70aa7c8d7f0` (merge of `14202b7` and `origin/main` `f4deee3`) |
| Review base | `origin/main` at `f4deee3e319a7f7ef536df83d85d212b0fbf623f`, fetched for this review at the driver's direction. This is `pipeline-state.py review-base --base-ref origin/main` and `git merge-base HEAD origin/main`, and it is an ancestor of `HEAD`. `origin/HEAD` is stale (it points to `usr/alvaro-de-jodra/tech-stack-v7`), so the default resolution gives `1d166f7`, which is not used. |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. |
| Changed files reviewed | 25 (commits `3a87770`, `5ddd3b3`, `14202b7` and merge `59bc0d1`, against `f4deee3`) |
| Baseline | v1 (`PASS-WITH-WARNINGS`), `reviewed_head` `3a8777092afbeaa67b63a3157f2fb59beaa11c7b`, with `CAP-002-E1-S5-implementation-review-v1-mutation.json` |

### Changed Files

Paths under `stories/` are relative to
`docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | modified | T011; AC-2, AC-5, DAC-E1-2, DAC-E1-3, DAC-E1-S5-1 to -6. Against the new base the diff is the S5 docstring paragraph, imports, `__all__` entry, `_INSTRUMENTS_BY_ID_SQL`, `_json_default`, `_dump_json`, `_filter_provenance`, `create_from_filter`, and the merge's removal of S4's sentence "``create_from_filter`` belongs to CAP-002-E1-S5 and is not defined here". |
| `tests/integration/test_universe_filter_snapshot.py` | added | T002 to T009. Unchanged since v1. |
| `tests/unit/test_universe_filter_provenance.py` | added | T010. Unchanged since v1. |
| `stories/CAP-002-E1-S5.md` | modified (`status` only: `planning` to `docs-sync`) | story-coding and doc-sync bookkeeping. The `artifact-gate.py revision` is unchanged from the approved `reviewed_revision`. |
| `stories/CAP-002-E1-S5-tasks.md` | modified (14 checkboxes, `updated`, `docs_synced_review: ...-v1.md`) | T001 to T014 bookkeeping; doc sync's marker |
| `stories/CAP-002-E1-S5-tdd-evidence.yaml` | added | T014 |
| `stories/CAP-002-E1-S5-evidence/` (14 files: four cycle patches, four RED logs, three mutant files, three mutation results) | added | T014 |
| `stories/CAP-002-E1-S5-implementation-review-v1.md`, `-v1-mutation.json` | added | the baseline review and its mutation results |
| `stories/CAP-002-E1-S5-proof-of-work.yaml` | added | doc sync's proof of work against v1 |
| `docs/reference/universe-service.md` | modified | doc sync (the module reference: `create_from_filter`, its refusal order, provenance keys, DEC-0248 encoding and its limits), merged with S4's text |
| `docs/reference/classification-reader.md` | modified | doc sync (the service is now the reader's one caller under `src/`) |

`README.md` changed in doc sync `14202b7`, but it equals `origin/main`'s after the merge, so it is
not in the change set.

## Acceptance Criteria Verification

Paths: `service.py` is `src/factorflow/universes/service.py` at `HEAD`; `snapshot` is
`tests/integration/test_universe_filter_snapshot.py`; `provenance` is
`tests/unit/test_universe_filter_provenance.py`. The test line numbers are v1's, because the test
files are unchanged.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `service.py:286-329` `create_from_filter`. Membership is only `member_added` events (`:322-328`), replayed by `_replayed` (`:329`). No path re-reads a set after the save. | `snapshot:273`, `:307` (members), `:647` (a later set changes nothing), `:356` (origin) | Unchanged since v1. The merged S4 functions (`rename`, `remove_member`, `retire`) do not touch the filter path. |
| AC-5 | SATISFIED | `service.py:306-307` raises `EmptyUniverse` when `evaluate_filter` returns nothing, before any `INSERT` | `snapshot:530`, `:542`, `:554`, `:567`, `:577` | The last-member clause is CAP-002-E1-S4's `remove_member` (`LastMember`, `service.py:403-406`). It is now on this branch through the merge and is covered by S4's own reviews. DAC-E1-S5-3 scopes this story's part of AC-5 to the snapshot. |
| DAC-E1-2 | SATISFIED | `service.py:299-305`: inside `with conn.transaction()`, the lock, then `current_set(conn)`, then the comparison with `set_id`, then `evaluate_filter(conn, set_id, thresholds)` with the whole object | `snapshot:439`, `:460`, `:474`, `:488`, `:506`; `:721` (the list equals the snapshot) | `ClassificationSetChanged(requested, current)` is raised for a newer complete set, no complete set or an unknown id. A later `building` or `failed` set is not a change. The lock-order test gap is IR-002 (carried). |
| DAC-E1-3 | SATISFIED | `service.py:216-230` `_filter_provenance`; `:317-321` writes it as `Jsonb(..., dumps=_dump_json)` on the `created` row only | `snapshot:356`, `:397`; `provenance:36-87` | Exactly five keys, under the query-parameter names; `classification_date` is `current.classification_date` (`:319`). The encoding at extreme magnitudes is IR-003 (carried). |
| DAC-E1-S5-1 | SATISFIED | `service.py:305`, `:310-312` (each id resolved once, in symbol order) | `snapshot:273`, `:307`, `:317`, `:325`, `:335`, `:730` | The hand list and the reader oracle agree. |
| DAC-E1-S5-2 | SATISFIED | `service.py:303-304`, before any write | `snapshot:439`, `:460`, `:474`, `:506` | Nothing is written, not even the `universe` row. |
| DAC-E1-S5-3 | SATISFIED | `service.py:306-307` | `snapshot:530` | `EmptyUniverse` is a `ValueError`; the counts are unchanged. The new mutant `manual:empty-raises-plain-valueerror` is killed. |
| DAC-E1-S5-4 | SATISFIED | `replay.origin_from_provenance` (S2) reads the stored object; `service.py:216-230` writes it | `snapshot:356`, `:397`; `provenance:137`, `:155` | The new mutant `manual:set-id-hex` is killed. |
| DAC-E1-S5-5 | SATISFIED | `thresholds` passed unchanged to the reader (`service.py:305`) | `snapshot:620`, parametrised over the three input reasons | |
| DAC-E1-S5-6 | SATISFIED | Replay from events only (`service.py:329`) | `snapshot:647` | Non-vacuous: the newer set's matches are asserted to differ. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The producers it names exist at the new base too: S3's helpers and exceptions, `replay.current_state` and `origin_from_provenance`, `reader.Thresholds`, `current_set` and `evaluate_filter`, migration `0006`, `prohibited_research_mutations`, and `seed_instrument`, `event_rows` and `count_events`. | Verification only. S4 changed `_name_in_use` to take `excluding: UUID \| None = None`. `create_from_filter` calls it with the default (`service.py:308`), which keeps S3's meaning. |
| T002 | complete | VERIFIED | `snapshot:273-350` | Unchanged since v1 (ten stocks rather than eight; justified). |
| T003 | complete | VERIFIED | `snapshot:439-521` | Unchanged since v1. |
| T004 | complete | VERIFIED | `snapshot:530-592` | Unchanged since v1. |
| T005 | complete | VERIFIED | `snapshot:356-423` | Unchanged since v1. |
| T006 | complete | VERIFIED | `snapshot:598-641` | Unchanged since v1. |
| T007 | complete | VERIFIED | `snapshot:647-680` | Unchanged since v1. |
| T008 | complete | VERIFIED | `snapshot:686-741` | Unchanged since v1. |
| T009 | complete | VERIFIED | `snapshot:751-940`, (a) to (g) | Written as the plan specifies. (b) still retires a holder with a raw `INSERT`, which the plan allows, although S4's `service.retire` is now present. (c) does not prove that the lock comes first (IR-002). (e) and (g) do not prove that the call rolls back its own writes (IR-001). |
| T010 | complete | VERIFIED | `provenance:36-259` | Unchanged since v1. |
| T011 | complete | VERIFIED | `service.py:21-26` (docstring), `:29-43` (imports), `:60` (`__all__`), `:83-86` (`_INSTRUMENTS_BY_ID_SQL`), `:198-230` (`_json_default`, `_dump_json`, `_filter_provenance`), `:286-329` | "Keep S3's and S4's code untouched" holds after the merge: S4's functions and helpers equal `origin/main`'s. The only S5 edit to S4's text is the dropped "not defined here" sentence. |
| T012 | complete | VERIFIED | The guards pass on the merged tree: `test_universe_sql_safety` (now including S4's TC-COMP-054 scans, which read every `_SQL` constant, `_INSTRUMENTS_BY_ID_SQL` included), `test_research_sql_is_append_only` and `test_package_data_ships_sql`. Importing `service` and `reader` in both orders in fresh interpreters succeeds. | `dependencies.yaml` was a planning-time edit and is not in this diff (as in v1). |
| T013 | complete | VERIFIED | Independent Validation below | |
| T014 | complete | VERIFIED | `check-tdd-evidence.py ... --base f4deee3 --require-logs`: 0 errors, 0 warnings. The four `reviewed_patch` files still compose from `6a5eca7` to `3a87770`. | As in v1, the plan's cycles 2 and 3 were merged into one, and the evidence header records it. The merge commit adds no S5 behaviour, so it needs no cycle. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `snapshot:273`, `:307`, `:317`, `:325`, `:335` / TC-COMP-012 | ADEQUATE | Members equal a hand list and `reader.evaluate_filter`. The raw event order and types are checked, and so is `member_since`. Kills the catalogue mutants, which the merge moved to `:303`, `:306`, `:316` and `:324`, plus `commits-itself`, `default-dumps`, `no-provenance`, `order-desc`, `created-untrimmed-name`, `id-order`, `own-predicate`, `filter-drops-hide`, `filter-drops-symbol` and `one-member-refused`. Under `-x` each mutant's log names its first failing test, and this table cites that test. | none |
| `snapshot:439`, `:460`, `:474`, `:488`, `:506` / TC-COMP-013 | ADEQUATE | Both ids on the exception; `written()` unchanged; precedence over the name and empty checks. Kills `currency-ignores-other-set`, `current-id-dropped`, `changed-args-swapped`, `currency-only-when-current` and `name-before-currency` again. | none |
| `snapshot:356`, `:397`, `:417` / TC-COMP-014 | ADEQUATE | Exact raw key set and values; `Origin` equals the stored object. Kills the catalogue `:205` negate-boolean, the `provenance-*` mutants, `set-id-raw`, `date-today`, `integral-as-float`, `nonintegral-*`, `dumps-no-default`, `hide-false-dropped`, `symbol-empty` and the new `manual:set-id-hex`. | none |
| `snapshot:620` / TC-COMP-015 | ADEQUATE | All three input reasons; `not_enough_stocks` kept; a retired instrument never saved. No mutant fails here first under `-x`: `filter-drops-hide` fails `:307` first. v1 and the coder's cycle-3 RED both show that this test catches a dropped `hide_incomplete`. | none |
| `snapshot:647` / TC-COMP-016 | ADEQUATE | Non-vacuous immutability across a newer set. | none |
| `snapshot:530`, `:542`, `:554`, `:567`, `:577` / TC-COMP-039 | ADEQUATE | Four ways to be empty, with nothing written. Kills `empty-check-dropped`, `name-before-empty` and the new `manual:empty-raises-plain-valueerror`. | none |
| T008 `snapshot:686`, `:721`, `:730` | ADEQUATE | Prefix, list equals snapshot, duplicate ids. | `no-dedupe` survives and is equivalent (Mutation results). |
| T009(a), (b), (d), (f) `snapshot:751`, `:767`, `:774`, `:851`, `:907` | ADEQUATE | Name shape before the reader, holders, retired name free, same-name serialisation, reader error propagation. Kills `no-name-check`, `name-check-untrimmed`, `name-shape-after-reader`, `lock-after-reads` and the new `manual:name-in-use-plain-valueerror`. | none |
| T009(c) `snapshot:812` | WEAK (not mandatory) | B waits on the advisory lock and finishes after A commits. Kills `skip-lock`. | `lock-after-currency-check` and `lock-after-evaluate` still survive (IR-002). |
| T009(e), (g) `snapshot:888`, `:926` | WEAK (not mandatory) | The error propagates as the same object; the caller owns the outer transaction. Kills `swallow-insert-error`. | `no-transaction-block` still survives (IR-001). |
| T010(a) to (c) `provenance:36-193` | ADEQUATE | Exact dict shape, JSON int versus number, `Decimal` round trip, precision consequence, no aliasing. | Extreme magnitudes untested (IR-003). |
| T010(d) `provenance:210-259` | ADEQUATE | AST: no `UPDATE`/`DELETE` and no built statement in `create_from_filter`; the predicate is the reader's. | `__all__` membership still not pinned (IR-004). |

Isolation and determinism are as v1 found them: each test gets its own database, migrated
through version 6 only. The lock tests use a bounded 5 s `pg_locks` poll with `finally`
cleanup. Monkeypatches replace only `service.current_set`, `service.evaluate_filter` and
`psycopg.Cursor.executemany`. The suite passed again on the merged tree with S4's
`test_universe_maintenance.py` in the same run (117 passed), so the two stories' tests do not
interfere.

### Mutation results

The review regenerated the catalogue over `f4deee3..HEAD`, giving five catalogue mutants. Four
reviewer mutants were added, and `scope` added v1's own mutants. Everything was run against the
focused suites, and the results are in `CAP-002-E1-S5-implementation-review-v2-mutation.json`
beside this report. On scope:

- `scope` tagged the five regenerated catalogue mutants `late`. They are v1's catalogue mutants
  at the line numbers the merge moved them to (`:195` is now `:205`, `:293` is `:303`, and so
  on). v1's copies were relocated by their text and run again as `carried`, so these five are
  counted twice.
- v1's `:306:off-by-one:1` no longer applies, because its line text now occurs twice: S3's
  `create_by_hand` has the same line. Its `create_from_filter` instance is the regenerated
  `:316:off-by-one:1`, which is killed.
- v1's `manual:dunder-all-drops-create-from-filter` no longer applied, because S4's names now
  follow it in `__all__`. It was rewritten under the same id with `old` set to
  `    "create_from_filter",\n`, so `scope` tagged it `carried`.

Totals: 57 mutants, 50 killed, 7 survived, none stillborn and no timeout. All four baselines
passed 142 tests. That is v1's 134 plus the eight S4 added to `test_universe_sql_safety.py`.

| Survivor | Scope | Change | Judgement |
|----------|-------|--------|-----------|
| `manual:no-transaction-block` | carried | `with conn.transaction():` becomes `if True:` (`service.py:299`) | **Non-equivalent.** Design 2.3 and 2.4 (IR-001, still open). |
| `manual:lock-after-currency-check` | carried | `_take_lock` moved after the set-currency check | **Non-equivalent.** Design 2.3, "as its first statement" (IR-002, still open). |
| `manual:lock-after-evaluate` | carried | `_take_lock` moved after `evaluate_filter` | **Non-equivalent**, as above (IR-002, still open). |
| `manual:dunder-all-drops-create-from-filter` | carried | `"create_from_filter"` removed from `__all__` (`service.py:60`) | **Non-equivalent** against T011 (IR-004, still open). |
| `coder-manual:no-dedupe` | carried | `sorted(set(instrument_ids))` becomes `instrument_ids` | Equivalent, as in v1. `instrument_id = ANY(...)` returns each row once and `ORDER BY symbol` fixes the order. No artifact specifies the array's shape. |
| `manual:date-from-requested-is-current` | carried | provenance built from `current.set_id` instead of `set_id` | Equivalent, as in v1. `:303` raises unless the two are equal. |
| `manual:evaluate-current-set-id` | late | `evaluate_filter(conn, current.set_id, thresholds)` instead of `set_id` (`service.py:305`) | Equivalent for the same reason: past `:303-304`, `current.set_id == set_id`. DAC-E1-2 names the requested set, and it is the same UUID by construction. |

## Independent Validation

`<repo>` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/planning-run-learnbot-cap-001-d79e92/repos/factorflow-v2/FactorFlow-v2`.
The harness root is the worktree that contains it, `<scratch>` is this session's scratchpad, and
`<stories>` is
`repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories`.
The `uv` commands ran outside the sandbox as plain calls with `--directory <repo> --offline`.
v1 recorded that the sandbox refuses the uv cache ("Failed to initialize cache ... Operation not
permitted"), and the PostgreSQL tests need Docker for `testcontainers`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `git -C <repo> fetch origin main` | harness root | 0 | PASS | At the driver's direction, to use the current `origin/main` as the base; it updates only `origin/main` (`f4deee3`, unchanged) |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | RESUME | "component repository changed after the latest passing review, in files no other passing review covers: src/factorflow/universes/service.py" |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `f4deee3e319a7f7ef536df83d85d212b0fbf623f`; ancestor of `HEAD` |
| `uv run --directory <repo> --offline pytest -m "not postgres" tests/unit/test_universe_filter_provenance.py tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py -q` | `<repo>` | 0 | PASS | 137 passed in 0.82 s (focused unit and T012 guards) |
| `uv run --directory <repo> --offline pytest -m postgres tests/integration/test_universe_filter_snapshot.py tests/integration/test_universe_create.py tests/integration/test_universe_maintenance.py -q -p no:randomly` | `<repo>` | 0 | PASS | 117 passed in 23 s. Covers S5, S3 and the merged S4 together under PostgreSQL 16 through `testcontainers`. |
| `uv run --directory <repo> --offline pytest -m postgres -q` | `<repo>` | 0 | PASS | 803 passed, 1263 deselected in 347 s |
| `uv run --directory <repo> --offline pytest -m "not postgres" -q` | `<repo>` | 0 | PASS | 1262 passed, 1 xfailed, 803 deselected in 28 s |
| `uv run --directory <repo> --offline pytest -q` | `<repo>` | 0 | PASS | 2065 passed, 1 xfailed in 371 s. This is the union of the two marker runs (803 + 1262 + 1), and it matches the count in the merge commit's message. |
| `uv run --directory <repo> --offline ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> --offline ruff format --check .` | `<repo>` | 0 | PASS | 255 files already formatted |
| `uv run --directory <repo> --offline mypy src` | `<repo>` | 0 | PASS | No issues in 57 source files (strict) |
| `uv build --directory <repo> --offline --out-dir <scratch>/dist` | `<repo>` | 0 | PASS | Built the sdist and the wheel. The wheel ships `universes/service.py` (with both `create_from_filter` and S4's `retire`) and the five `universes/sql/*.sql`. The output was redirected so `dist/` was untouched. |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git archive 6a5eca7 src tests`, then `git apply` of `cycle-1.patch` to `cycle-4.patch` in order, then `cmp` against `3a87770` and `HEAD` | `<scratch>/compose` | 0 | PASS | `service.py` and both test files equal `3a87770`; both test files equal `HEAD` |
| Changed-line comparison: `git diff 6a5eca7 f4deee3 -- service.py` against `git diff 3a87770 HEAD -- service.py`, and `git diff 6a5eca7 3a87770 -- src` against `git diff f4deee3 HEAD -- src` (changed lines only, compared with `diff`) | `<repo>` | 1 | PASS (diagnostic) | Both comparisons differ only in the one docstring sentence about `create_from_filter` "not defined here", so the merge kept S4's and S5's code unchanged. `diff` exits 1 because it found that difference. |
| `.venv/bin/python -c "import factorflow.universes.service, factorflow.classification.reader"` and the reverse order | `<repo>` | 0 | PASS | No import cycle; every `__all__` name resolves |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out <scratch>/mut/generated.json` | harness root | 0 | PASS | 5 catalogue mutants (3 negate-boolean, 2 off-by-one). A short script then wrote `<scratch>/mut/with-manual.json`, adding the four new reviewer mutants (`empty-raises-plain-valueerror`, `set-id-hex`, `name-in-use-plain-valueerror`, `evaluate-current-set-id`) and the rewritten `dunder-all-drops-create-from-filter`. It first checked that each `old` occurs exactly once in `service.py`. |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/with-manual.json --since 3a8777092afbeaa67b63a3157f2fb59beaa11c7b --previous <stories>/CAP-002-E1-S5-implementation-review-v1-mutation.json --out <scratch>/mut/mutants.json` | harness root | 0 | PASS | 57 mutants: 48 `carried`, 9 `late`, none `delta`; 1 previous mutant no longer applies (`:306:off-by-one:1`). Mutants sha256 `e89d01209fa6e3f50b21aa0615543922bcbbd9caaa2977b625ac72697392764d`. |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mut/mutants.json --jobs 4 --timeout 600 --command "cd {workdir} && PYTHONPATH={workdir}/src <repo>/.venv/bin/python -m pytest -q -x -p no:cacheprovider -m 'postgres or not postgres' tests/integration/test_universe_filter_snapshot.py tests/unit/test_universe_filter_provenance.py tests/unit/test_universe_service_validation.py tests/unit/test_universe_sql_safety.py" --out <scratch>/mut/results.json --logs <scratch>/mut/logs --work-root <scratch>/mut/work` | harness root | 3 | PASS-WITH-SURVIVORS | 20:53:23Z to 20:55:48Z. All four baselines passed 142 tests. 50 killed, 7 survived (3 equivalent, 4 not, all already open as IR-001, IR-002 and IR-004). Results sha256 `c0dcd3f01b82da1951451b0eebd99ff48c4a06f00355dd58e2af07d7425f5db8`. Exit 3 means survivors, not a broken run. The first attempt exited 1 before running anything, because the `--work-root` directory did not exist yet. It was created and the command rerun. |
| `uv sync --all-extras` | `<repo>` | N/A | NOT RUN | No dependency, `pyproject.toml` or `uv.lock` change in the change set (the merge brought none either); the task plan does not list it. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `<repo>` | N/A | NOT RUN | Not applicable. The change set has no frontend or TypeScript file, and the task plan names none. |

The eight required commands are the same as v1's: the story's and the plan's `pytest -m postgres`,
`pytest -m 'not postgres'`, `ruff check`, `ruff format --check`, `mypy src` and `uv build`; the
constitution's full `uv run pytest`; and the skill's TDD-evidence lint.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E1-S5` at `59bc0d1`, clean, with `code-revision`
  `sha256:9602353675e67046d778b6d4506fadeb9299c07fb864d622ea5c75c6cf029bcb`.
- After: the same HEAD, still clean, with the same `code-revision`. Only ignored paths changed:
  `.hypothesis/`, `__pycache__/`, `src/factorflow.egg-info/` and `build/`. The mutation clones,
  logs, recomposition and build output went to the scratchpad. The fetch moved no local ref:
  `origin/main` was already `f4deee3`.
- The only new files are this review's own report and its `-v2-mutation.json`, both untracked
  under `docs/` (excluded from `code-revision`, which still reads `sha256:96023536...029bcb`
  after they were written).
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 1 · **total 4**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | carried | OPEN | No test shows that `create_from_filter` rolls back its own writes (`no-transaction-block` still survives) |
| IR-002 | MEDIUM | carried | OPEN | T009(c) does not show that the write lock is the first statement (`lock-after-currency-check` and `lock-after-evaluate` still survive) |
| IR-003 | MEDIUM | carried | OPEN | Bounds of extreme magnitude cannot be saved under the DEC-0248 encoding. The code is unchanged, and doc sync has documented the limit. |
| IR-004 | LOW | carried | OPEN | `create_from_filter`'s place in `__all__` is not pinned (the rewritten `dunder-all-drops-create-from-filter` still survives) |

Each finding is v1's finding of the same ID, carried forward. Nothing changed the code or tests
behind them since v1, so the evidence and remediation below restate v1's against the current line
numbers. They were not re-derived from scratch.

### IR-001 — No test shows that `create_from_filter` rolls back its own writes

- **Severity**: MEDIUM
- **Scope**: carried (v1 IR-001; `manual:no-transaction-block` tagged `carried`)
- **Status**: OPEN
- **Acceptance criteria**: N/A. The requirement is design 2.3 and 2.4; no story AC is unmet.
- **Tasks**: T009(e), T009(g), T011
- **Files**: `src/factorflow/universes/service.py:299` (`with conn.transaction():`);
  `tests/integration/test_universe_filter_snapshot.py:888-904`
  (`test_a_failed_member_insert_rolls_the_whole_snapshot_back`), `:926-940`
  (`test_the_caller_owns_the_transaction`)
- **Claim challenged**: T009(e) says "the `universe` row and the `created` event do not survive
  a failed member insert". The plan's Story-Specific Validation says "T009 shows ... a whole
  rollback".
- **Observed evidence**:
  - `manual:no-transaction-block` (`with conn.transaction():` becomes `if True:`) survives
    all 142 focused tests in this run, as it survived v1's 134.
  - T009(e) is unchanged and still calls `conn.rollback()` before it asserts, so the caller's
    rollback, not the function's, empties the transaction.
  - v1's probe showed that the committed code's savepoint undoes the partial rows before any
    caller rollback, and that without the block they stay pending. Nothing since v1 alters that.
- **Expected evidence/behavior**:
  - Design 2.3 (`component-design-universe-service.md:281`): "Every write function runs inside
    `with conn.transaction():`".
  - Design 2.4 (`:315`): "one transaction of appended events per successful call and nothing
    written on any refusal".
  - T011 specifies the block.
  - Skill E.9: no non-equivalent mutant may survive.
- **Impact**: Every current test still passes if the block is dropped. The append-only
  `universe_event` log cannot be repaired, so a partial universe written by a caller that catches
  the error and commits would be permanent.
- **Required remediation**: Before any caller `rollback()`, assert that a failure after the
  member insert leaves nothing behind. Examples:
  - `written()` is unchanged on the same connection;
  - a second connection sees the lock free;
  - the call on an autocommit connection leaves nothing.

  Then show `manual:no-transaction-block` killed. The severity is MEDIUM rather than HIGH
  because the code is correct, T009 is an additional test that follows the plan's own design,
  and no mandatory TC's Expected Result depends on the block. That reasoning is unchanged from
  v1.

### IR-002 — T009(c) does not show that the write lock is the first statement

- **Severity**: MEDIUM
- **Scope**: carried (v1 IR-002; both survivors tagged `carried`)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-2 (concurrent case only; the AC is satisfied as written)
- **Tasks**: T009(c), T011
- **Files**: `src/factorflow/universes/service.py:300` (`_take_lock(conn)`);
  `tests/integration/test_universe_filter_snapshot.py:812-848`
  (`test_the_snapshot_waits_on_the_write_lock`)
- **Claim challenged**: the plan's "T009 shows the lock as the first statement", and the test
  docstring's "the lock is taken first (DEC-0065)".
- **Observed evidence**:
  - `manual:lock-after-currency-check` and `manual:lock-after-evaluate` both survive again.
  - The test still shows only that B eventually waits on the lock and finishes after A commits.
  - `lock-after-reads` (the lock moved after the name check) is still killed by T009(d).
- **Expected evidence/behavior**:
  - Design 2.3 (`component-design-universe-service.md:281-282`) requires the lock "as its first
    statement".
  - The order is observable. Hold the lock on A, start B against S1, and commit a newer complete
    set S2 while B waits. The committed code then raises `ClassificationSetChanged`, while both
    mutants save a stale snapshot. The plan's "Check-then-evaluate window" gap does not leave
    the lock order open.
- **Impact**: A save that waited behind another universe write could record a set that went
  stale while it waited, and every current test would still pass. The effect is small, which does
  not lower the severity. The severity is MEDIUM because T009(c) is an additional test.
- **Required remediation**: Add a test that tells the order apart, for example by committing a
  newer complete set while B waits and expecting `ClassificationSetChanged`. Then show both
  mutants killed.

### IR-003 — Bounds of extreme magnitude cannot be saved under the DEC-0248 encoding

- **Severity**: MEDIUM
- **Scope**: carried (v1 IR-003)
- **Status**: OPEN
- **Acceptance criteria**: AC-2, DAC-E1-3 (at the edge of the input domain)
- **Tasks**: T011, T010(b)
- **Files**:
  - `src/factorflow/universes/service.py:198-213` (`_json_default`, `_dump_json`);
  - `src/factorflow/classification/reader.py` (`Thresholds` accepts any finite `Decimal` score
    bound);
  - `docs/reference/universe-service.md`, "Bound encoding (DEC-0248)".
- **Claim challenged**: DEC-0248 records only a read-back precision consequence. It does not
  record a bound that cannot be written at all.
- **Observed evidence**:
  - `_json_default` and `_dump_json` are byte-identical to v1's, so v1's probe results still
    hold:
    - `Decimal("1" + "0"*400 + ".5")` encodes as `Infinity`, which PostgreSQL rejects with
      `InvalidTextRepresentation`;
    - `Decimal("1E+5000")` raises `ValueError` (the 4300-digit integer-string limit).
  - Both are raised after `evaluate_filter` has accepted the bound, and nothing is written.
  - Since v1, doc sync has documented this limit in the reference file. Documenting it does not
    change the behaviour.
  - DEC-0248 is still `owner_reviewed: false` and `status: open`. It is now committed to the
    harness repository (`748c262`).
- **Expected evidence/behavior**:
  - AC-2: a threshold filter's result can be saved.
  - DEC-0076: what the list shows is what is saved.
  - Design 2.4: `filter_provenance` is "the filter as evaluated".
- **Impact**: For such bounds the list works but the save fails. The non-integral case is an
  unexpected database error, which S6's route would map to a 500. The integral case is a bare
  `ValueError`, which S6 may report as a misleading 422. Nothing is persisted, and the values are
  far outside any realistic standardised-score range.
- **Required remediation**:
  - Make `create_from_filter` either save such a bound or refuse it with a typed, documented
    error before anything is written, and pin the result with a test.
  - Do not change the DEC-0248 encoding of representable bounds.
  - If the fix changes the encoding or narrows the accepted bound domain, the owner decides:
    DEC-0248 is `one-way`.

### IR-004 — `create_from_filter`'s place in `__all__` is not pinned

- **Severity**: LOW
- **Scope**: carried (v1 IR-004; the rewritten mutant keeps v1's id and is tagged `carried`)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `src/factorflow/universes/service.py:60`
- **Claim challenged**: T011 says "add `create_from_filter` to `__all__` if S3 defined one".
- **Observed evidence**:
  - The merge kept the entry, and `__all__` now lists S4's names after it.
  - `manual:dunder-all-drops-create-from-filter`, rewritten for the merged context, survives.
  - `test_all_names_in_dunder_all_resolve` checks only that the listed names resolve.
  - No module in `src` or `tests` star-imports `service`.
- **Expected evidence/behavior**: A plan-specified export should be pinned if it is meant to
  hold. This merge is exactly the kind of edit that could drop such an entry unnoticed.
- **Impact**: None for any current caller; this is a maintainability gap only.
- **Required remediation**: Optional. Assert `"create_from_filter" in service.__all__`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | STILL OPEN | Carried as v2 IR-001. `manual:no-transaction-block` survives (results file); `snapshot:888-940` unchanged since `3a87770` (`git diff 3a87770 HEAD -- tests/` lists no S5 test file). |
| v1/IR-002 | STILL OPEN | Carried as v2 IR-002. `manual:lock-after-currency-check` and `manual:lock-after-evaluate` survive; `snapshot:812-848` unchanged. |
| v1/IR-003 | STILL OPEN | Carried as v2 IR-003. `service.py:198-213` byte-identical to v1's `:188-203`; the limit is now documented in `docs/reference/universe-service.md` (doc sync `14202b7`), but no code or test addresses it; DEC-0248 still `owner_reviewed: false`. |
| v1/IR-004 | STILL OPEN | Carried as v2 IR-004. The rewritten `manual:dunder-all-drops-create-from-filter` survives; no test asserts the entry. |

## Scope and Plan Deviations

- **Justified**:
  - Every deviation v1 recorded still stands: ten stocks seeded rather than eight, a fixed UUID
    in T003(d), the named `_dump_json`, the merged cycles 2 and 3, and the evidence files missing
    from T012's list.
  - The merge `59bc0d1` takes CAP-002-E1-S4 from `origin/main`. It is not S5 work, but it is
    the base this review is measured from. The only S5-side edit inside it is the removal of
    S4's now-false sentence that `create_from_filter` "is not defined here".
- **Bookkeeping**:
  - The story `status` is `docs-sync`, and its content revision still equals the approved
    `reviewed_revision`.
  - The tasks file carries `docs_synced_review: CAP-002-E1-S5-implementation-review-v1.md`.
  - `CAP-002-E1-S5-proof-of-work.yaml` still names implementation commit `3a87770` and review
    v1.
  - Doc sync owns all three and will refresh them against this report. This is not an
    implementation finding.
- **Out of scope**: None. Every S5 production line is `create_from_filter` and its helpers, as
  in v1. The merged S4 code is in the review base, not in this change set.
- **Observation, not a finding**: the module docstring's first line, which the merge took from
  S4, reads "create by hand, add members, the maintenance writes and the reads" and does not name
  create from a filter. The S5 paragraph (`service.py:21-26`) does cite it, which is what T011
  asks.
- **Decisions**:
  - The bound encoding still follows DEC-0248 exactly.
  - DEC-0248 is now committed to the harness repository (`748c262`). It is `owner_reviewed:
    false`, and its `commits` list names `3a87770`.
  - This review recorded no decision. IR-003's resolution, if it changes the encoding or the
    bound domain, is the owner's.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E1-S5 against this report. The merged
  `docs/reference/universe-service.md` already documents `create_from_filter` beside S4's
  functions, and the code it describes is unchanged. Doc sync needs to refresh
  `docs_synced_review`, the proof of work (commit `59bc0d1`, review v2) and the story status.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003 and IR-004. IR-003 remains a
  question for the owner about DEC-0248's coverage of extreme-magnitude bounds. A coding agent
  may address IR-001, IR-002 and IR-004 in a later rework.
