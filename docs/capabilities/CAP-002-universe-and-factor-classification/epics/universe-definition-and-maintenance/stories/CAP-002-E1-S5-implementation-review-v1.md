---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T15:19:44Z"
reviewed_head: "3a8777092afbeaa67b63a3157f2fb59beaa11c7b"
review_base: "6a5eca7213a84853d9b0b6d46ee16a65e628d32a"
reviewed_state_revision: "sha256:dd3bc7641b996e9bb2629f00ed0bb5acf1d7385e3edc4e6bddabed6d1fece224"
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
  timestamp: 2026-10-31T15:19:44Z
  source_artifacts:
    - id: CAP-002-E1-S5
      version: "1 (sha256:fcb642f919a718fa93aae334cb6d085348a3e3fa70aec1d92a3796547a101317)"
    - id: CAP-002-E1-S5-tasks
      version: "1 (sha256:a3990b3f4073fd56fe9d17604d45ef194790c71483486bfc7e511e6d9566a7d0)"
    - id: CAP-002-E1-S5-tdd-evidence
      version: "1 (cycles 1 to 4)"
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

# Implementation Review: CAP-002-E1-S5 — Version 1

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

This is an initial, unattended review run by the pipeline-run driver. It is independent of the
coding work and re-derives every conclusion from the repository.

`create_from_filter` does what the story asks:

- It takes the write lock and trims the name.
- It refuses a set that is no longer the current complete set, naming both ids.
- It saves exactly `evaluate_filter`'s result for the whole `Thresholds`, and refuses an empty
  result before the name check.
- It writes one `created` event carrying `filter_provenance`, then one `member_added` per
  member in symbol order.
- It returns the replayed universe.

The bounds are encoded as DEC-0248 decides. Every acceptance criterion has passing tests that
check observable outcomes against a hand-computed list and against the reader as a second
oracle. All 14 tasks are verified. All eight required commands pass, including the full
PostgreSQL suite under `testcontainers`. The TDD-evidence lint is clean, and the four cycle
patches, applied in order to the review base, reproduce the committed files byte for byte.

The review's mutation run (49 mutants, 43 killed) found four non-equivalent survivors, none of
them against a mandatory TC:

- The `with conn.transaction():` block can be removed without any test failing (IR-001). This
  is the gap CAP-002-E1-S3 v2 IR-003 recorded for `create_by_hand`.
- The lock can move after the set-currency check or after `evaluate_filter` (IR-002).
- `create_from_filter` can leave `__all__` (IR-004, LOW).

A probe also shows that DEC-0248's float encoding cannot write two kinds of bound that
`Thresholds` and the API accept: a non-integral bound above the largest double, and an integral
bound of 4300 digits or more (IR-003). The production code is correct for every bound in a
realistic range, and no finding is CRITICAL or HIGH, so the verdict is `PASS-WITH-WARNINGS`.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tasks.md` |
| Component | `FactorFlow-v2` (run-local clone `repos/factorflow-v2/FactorFlow-v2` under the harness worktree) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S5` |
| HEAD | `3a8777092afbeaa67b63a3157f2fb59beaa11c7b` |
| Review base | `origin/main` at `6a5eca7213a84853d9b0b6d46ee16a65e628d32a`. This is `pipeline-state.py review-base --base-ref origin/main` and also `git merge-base origin/main HEAD`. The driver supplied this base because `origin/HEAD` is stale: the default resolution gives `1d166f7`. |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. |
| Changed files reviewed | 20 (one commit, `3a87770`) |
| Baseline | none: initial review |

### Changed Files

Paths under `stories/` are relative to
`docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | modified | T011; AC-2, AC-5, DAC-E1-2, DAC-E1-3, DAC-E1-S5-1 to -6 |
| `tests/integration/test_universe_filter_snapshot.py` | added | T002 to T009 |
| `tests/unit/test_universe_filter_provenance.py` | added | T010 |
| `stories/CAP-002-E1-S5.md` | modified (`status: planning` to `in-review`) | story-coding bookkeeping. `artifact-gate.py revision` is unchanged from the approved `reviewed_revision`. |
| `stories/CAP-002-E1-S5-tasks.md` | modified (14 checkboxes only; word diff shows no other change) | T001 to T014 bookkeeping |
| `stories/CAP-002-E1-S5-tdd-evidence.yaml` | added | T014 |
| `stories/CAP-002-E1-S5-evidence/cycle-1.patch` to `cycle-4.patch` (4 files) | added | T014 (`reviewed_patch` per cycle) |
| `stories/CAP-002-E1-S5-evidence/red-cycle-1-provenance.log`, `red-cycle-2-snapshot.log`, `red-cycle-3-hide-and-immutability.log`, `red-cycle-4-names-lock-rollback.log` | added | T014 (RED evidence) |
| `stories/CAP-002-E1-S5-evidence/mutants-cycle-{1,2,4}.json`, `mutation-cycle-{1,2,4}-results.json` (6 files) | added | T014 (mutation evidence; cycle 3 changed tests only) |

## Acceptance Criteria Verification

Paths: `service.py` is `src/factorflow/universes/service.py`; `snapshot` is
`tests/integration/test_universe_filter_snapshot.py`; `provenance` is
`tests/unit/test_universe_filter_provenance.py`.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `service.py:276-319` `create_from_filter`. Membership is only `member_added` events (`:312-318`), replayed by `_replayed` (`:319`). No path re-reads a set after the save. | `snapshot:273` and `:307` (members), `:647` (a later set changes nothing), `:356` (origin) | A saved filter result becomes a named universe, and replay never consults the classification tables, so its members cannot follow later sets. |
| AC-5 | SATISFIED | `service.py:296-297` raises `EmptyUniverse` when `evaluate_filter` returns nothing, before any `INSERT` | `snapshot:530`, `:542`, `:554`, `:567`, `:577` | Covers no match, an empty scope, everything hidden and an unmatched prefix, with nothing written. The last-member clause of AC-5 is CAP-002-E1-S4's `remove_member`. This story adds no removal path, and DAC-E1-S5-3 scopes AC-5 to the snapshot. |
| DAC-E1-2 | SATISFIED | `service.py:289-295`: lock, then `current_set(conn)`, then the comparison with `set_id`, then `evaluate_filter(conn, set_id, thresholds)` with the whole object, all inside `with conn.transaction()` on the caller's connection | `snapshot:439`, `:460`, `:474`, `:488`, `:506`; `:721` (list equals snapshot) | `ClassificationSetChanged(requested, current)` is raised when there is a newer complete set, no complete set or an unknown id. A later `building` or `failed` set is not a change. Lock-order strength gap: IR-002. |
| DAC-E1-3 | SATISFIED | `service.py:206-220` `_filter_provenance` (five keys, only the bounds set, `hide_incomplete` always present, `symbol` null without a search); `:307-311` writes it as `Jsonb(..., dumps=_dump_json)` on the `created` row only | `snapshot:356`, `:397`; `provenance:36-87` | The raw jsonb has exactly the five keys. `thresholds` uses the query-parameter names, and `classification_date` is the set's (`current.classification_date`, `:309`). Encoding at extreme magnitudes: IR-003. |
| DAC-E1-S5-1 | SATISFIED | `service.py:295`, `:300-302` (each id resolved once, in symbol order) | `snapshot:273` (hand list `[AAA, AAC, BAA, BBB, DDD]` and the oracle), `:307`, `:317`, `:325`, `:335`, `:730` | I checked the hand list against `BASE`, including the inclusive boundaries at `BBB` (p80, momentum 0) and the exclusions `FFF` (p79.999999) and `GGG` (momentum -0.000001). |
| DAC-E1-S5-2 | SATISFIED | `service.py:293-294`, before any write | `snapshot:439` (ids and `written()` unchanged), `:460`, `:474`, `:506` | Nothing is written, not even the `universe` row. |
| DAC-E1-S5-3 | SATISFIED | `service.py:296-297` | `snapshot:530` | `EmptyUniverse` is a `ValueError`; counts unchanged. |
| DAC-E1-S5-4 | SATISFIED | `replay.origin_from_provenance` (S2) reads the stored object; `service.py:206-220` writes it | `snapshot:356` (raw keys and values equal `Origin`; `Origin.classification_date == current_set().classification_date`), `:397` (`symbol` null, `hide_incomplete` false, `thresholds == {}`, `list_universes` agrees); `provenance:137`, `:155` | The `Decimal` round trip is exact for every representable bound DEC-0248 covers. |
| DAC-E1-S5-5 | SATISFIED | Passes `thresholds` unchanged to the reader (`service.py:295`) | `snapshot:620`, parametrised over `input_missing`, `input_outdated` and `input_not_computable` | `INC` is a member when `hide_incomplete` is false and not when it is true. `NER` (`not_enough_stocks`) is kept, `RET` (retired lifecycle) is never saved, and provenance and `Origin` read back the flag used. |
| DAC-E1-S5-6 | SATISFIED | Replay from events only (`service.py:319`) | `snapshot:647` | A newer set changes the match list (asserted, so the test is not vacuous). Members, `member_since`, origin, raw events, the as-of read and `list_universes` are unchanged. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Every producer it names exists at the review base: `service.py` S3 helpers and exceptions, `replay.current_state` and `origin_from_provenance`, `reader.Thresholds`, `current_set` and `evaluate_filter`, migration `0006`, S1's `prohibited_research_mutations`, and S3's `seed_instrument`, `event_rows` and `count_events`. `Thresholds.bounds` keys are `_BOUNDS` (`reader.py:109-114`), the query-parameter names. | Verification only; no producer edited. |
| T002 | complete | VERIFIED | `snapshot:273-350` | Seeds 10 stocks instead of the planned 8 (`AAC` and `BAA` added for the hidden and prefix cases). A harmless, justified deviation. |
| T003 | complete | VERIFIED | `snapshot:439-521`, (a) to (f) | (d) uses a fixed UUID rather than a random one, which is equivalent. |
| T004 | complete | VERIFIED | `snapshot:530-592`, (a) to (f) | |
| T005 | complete | VERIFIED | `snapshot:356-423` | Includes the by-hand origin check. |
| T006 | complete | VERIFIED | `snapshot:598-641` | `RET` is seeded with S3's `seed_instrument(..., lifecycle="retired")`, as planned. |
| T007 | complete | VERIFIED | `snapshot:647-680` | No retired instrument seeded and no `UPDATE`, as planned. |
| T008 | complete | VERIFIED | `snapshot:686-741`, (a) to (c) | (c) monkeypatches `service.evaluate_filter` to return a duplicate id. |
| T009 | complete | VERIFIED | `snapshot:751-940`, (a) to (g) | Implemented as the plan specifies them. (c) does not prove "lock first" (IR-002). (e) and (g) do not prove the call rolls back its own writes (IR-001). |
| T010 | complete | VERIFIED | `provenance:36-259`, (a) to (d) | |
| T011 | complete | VERIFIED | `service.py:18-23` (docstring), `:26-37` (imports), `:57` (`__all__`), `:73-76` (`_INSTRUMENTS_BY_ID_SQL`), `:188-220` (`_json_default`, `_dump_json`, `_filter_provenance`), `:276-319` | S3 code untouched apart from the docstring sentence that said S5 was not defined. The planned `Jsonb(..., dumps=lambda ...)` is the named `_dump_json`, an equivalent form. |
| T012 | complete | VERIFIED | `test_universe_sql_safety`, `test_research_sql_is_append_only` and `test_package_data_ships_sql` pass in `-m 'not postgres'`. Importing `service` and `reader` in both orders in fresh interpreters succeeds. | The plan's expected `git status` list omits the `CAP-002-E1-S5-evidence/` files, which T014 requires. `dependencies.yaml` was edited at planning time and is not in this diff. |
| T013 | complete | VERIFIED | Independent Validation below | |
| T014 | complete | VERIFIED | `check-tdd-evidence.py ... --require-logs`: 0 errors, 0 warnings. The four `reviewed_patch` files compose exactly to the committed files. | Planned cycles 2 and 3 were merged into one cycle-2; the evidence header records this. Cycle 3's RED for TC-COMP-016 injected a fault into S3's `get_universe` rather than S5 code. That is acceptable, because TC-COMP-016 characterises replay, which S5 does not change. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `snapshot:273`, `:307`, `:317`, `:325`, `:335` / TC-COMP-012 | ADEQUATE | Members equal a hand list and `reader.evaluate_filter`. The raw event order and types are checked: `created` first with null `instrument_id`, then `member_added` in symbol order with null provenance. `member_since` equals `recorded_at`. The test exercises all three `Thresholds` parts together, the empty filter, DEC-0081 and an uncovered stock with the highest id, which proves symbol order rather than id order. Kills `order-desc`, `id-order`, `one-member-refused`, `filter-drops-symbol`, `filter-drops-hide`, `own-predicate`, `created-untrimmed-name`, `no-provenance`, `default-dumps`, `commits-itself`, both off-by-one mutants and the negate-boolean mutants at `:293` and `:296`. Under `-x` each mutant's log names its first failing test, and this table cites that test. | none |
| `snapshot:439`, `:460`, `:474`, `:488`, `:506` / TC-COMP-013 | ADEQUATE | Both ids on the exception. `written()` is unchanged. The test covers no complete set, an unknown id, a later building or failed set, and precedence over the name and empty checks. Kills `currency-ignores-other-set`, `current-id-dropped`, `changed-args-swapped`, `currency-only-when-current` and `name-before-currency`. | none |
| `snapshot:356`, `:397`, `:417` / TC-COMP-014 | ADEQUATE | Exact raw key set and values, including JSON int versus float per DEC-0248. `Origin` equals the stored object and `current_set().classification_date`; `list_universes` agrees; a by-hand origin is unaffected. Kills `provenance-*`, `date-today`, `set-id-raw`, `integral-as-float`, `nonintegral-*`, `dumps-no-default`, `hide-false-dropped`, `symbol-empty` and `195:negate-boolean`. | none |
| `snapshot:620` / TC-COMP-015 | ADEQUATE | All three input reasons. `not_enough_stocks` is kept, retired is never saved, and the flag reads back from both provenance and `Origin`. | none |
| `snapshot:647` / TC-COMP-016 | ADEQUATE | Non-vacuous: it asserts that the newer set's matches differ. Members, origin, raw events, the as-of read and the list are unchanged. | none |
| `snapshot:530`, `:542`, `:554`, `:567`, `:577` / TC-COMP-039 | ADEQUATE | Four ways to be empty, with nothing written. `EmptyUniverse` precedes `UniverseNameInUse`, and a refusal leaves no residue for a following save of the same name. Kills `empty-check-dropped` and `name-before-empty`. | none |
| T008 `snapshot:686`, `:721`, `:730` | ADEQUATE | Prefix `AA` keeps `AAA` and `AAC` but not `BAA`. The paged list ids equal the members for three filters, and duplicate ids give one member. | `no-dedupe` survives and is equivalent (Mutation results). |
| T009(a), (b), (d), (f) `snapshot:751`, `:767`, `:774`, `:851`, `:907` | ADEQUATE | The empty name is refused before the reader (the reader is patched to raise `AssertionError`); a 10 000-character name is accepted; holders by hand and from a filter refuse; a retired name is free again; same-name serialisation under the lock; the reader's error propagates. Kills `no-name-check`, `name-check-untrimmed`, `name-shape-after-reader` and `lock-after-reads`. | none |
| T009(c) `snapshot:812` | WEAK (not mandatory) | B is seen waiting on the advisory lock and finishes after A commits. Kills `skip-lock`. | `lock-after-currency-check` and `lock-after-evaluate` survive (IR-002). |
| T009(e), (g) `snapshot:888`, `:926` | WEAK (not mandatory) | The error propagates as the same object; the caller owns the outer transaction; rollback removes an uncommitted universe. Kills `swallow-insert-error`. | `no-transaction-block` survives: (e) rolls back before it asserts (IR-001). |
| T010(a) to (c) `provenance:36-193` | ADEQUATE | Exact dict shape; JSON int versus number for representative values; `origin_from_provenance` round trip to equal `Decimal`s; the >15-digit precision consequence of DEC-0248 pinned; no aliasing. Kills `integral-needs-zero-exponent`, `float-rounded`, `non-decimal-passthrough` and `alias-bounds`. | Extreme magnitudes untested (IR-003). |
| T010(d) `provenance:210-259` | ADEQUATE | AST: no `UPDATE`/`DELETE` constant and no built statement in `create_from_filter`; the new constant is append-only with a named placeholder; the predicate is the reader's (`service.evaluate_filter is reader.evaluate_filter`, no score/percentile comparison). | `__all__` membership not pinned (IR-004). |

Isolation and determinism: each test gets its own database (`postgres_connection_string`) and
migrates through version 6 only. The lock tests use a bounded 5 s `pg_locks` poll, daemon
threads and `finally` cleanup, the same form as S3's TC-COMP-019. TC-COMP-016's as-of date uses
`datetime.now(America/Chicago)` after the save, so it cannot fall before the event's date. No
network or order dependence was found. Mock validity: monkeypatches replace only
`service.current_set`, `service.evaluate_filter` and `psycopg.Cursor.executemany`, never the
unit under test.

### Mutation results

The review regenerated the catalogue over the whole range and added the coder's 25 manual
mutants (re-tagged `review`, prefixed `coder-`) and 19 of its own. Results are in
`CAP-002-E1-S5-implementation-review-v1-mutation.json` beside this report.

| Survivor | Change | Judgement |
|----------|--------|-----------|
| `manual:no-transaction-block` | `with conn.transaction():` becomes `if True:` (`service.py:289`) | **Non-equivalent.** Design 2.3 and 2.4 specify the block and its atomicity (IR-001). |
| `manual:lock-after-currency-check` | `_take_lock` moved after the set-currency check | **Non-equivalent.** Design 2.3 requires the lock "as its first statement". The order is observable (IR-002). |
| `manual:lock-after-evaluate` | `_take_lock` moved after `evaluate_filter` | **Non-equivalent**, as above (IR-002). |
| `manual:dunder-all-drops-create-from-filter` | `"create_from_filter"` removed from `__all__` | **Non-equivalent** against T011 ("add `create_from_filter` to `__all__`"). The effect is only on star imports, and none exists in `src` or `tests` (IR-004). |
| `coder-manual:no-dedupe` | `sorted(set(instrument_ids))` becomes `instrument_ids` | Equivalent. `instrument_id = ANY(...)` returns each `instrument` row once and `ORDER BY symbol` fixes the order, so the members and their order are identical. No artifact specifies the array's shape. The coder's cycle-2 judgement is confirmed. |
| `manual:date-from-requested-is-current` | provenance built from `current.set_id` instead of `set_id` | Equivalent. `:293` raises unless `current.set_id == set_id`, so the two values are equal UUIDs by construction. |

## Independent Validation

`<repo>` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/planning-run-learnbot-cap-001-d79e92/repos/factorflow-v2/FactorFlow-v2`.
The harness root is the worktree that contains it. The sandbox refused the uv cache
("Failed to initialize cache ... Operation not permitted"), so the `uv` commands ran outside
it as plain calls with `--directory <repo> --offline`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <repo> --offline pytest -m "not postgres" tests/unit/test_universe_filter_provenance.py tests/unit/test_universe_sql_safety.py -q` | `<repo>` | 0 | PASS | 58 passed |
| `uv run --directory <repo> --offline pytest -m postgres tests/integration/test_universe_filter_snapshot.py tests/integration/test_universe_create.py -q -p no:randomly` | `<repo>` | 0 | PASS | 71 passed in 8.9 s, under PostgreSQL 16 through `testcontainers` |
| `uv run --directory <repo> --offline pytest -m postgres -q` | `<repo>` | 0 | PASS | 665 passed, 1242 deselected in 271 s |
| `uv run --directory <repo> --offline pytest -m "not postgres" -q` | `<repo>` | 0 | PASS | 1241 passed, 1 xfailed, 665 deselected in 29 s |
| `uv run --directory <repo> --offline pytest -q` | `<repo>` | 0 | PASS | 1906 passed, 1 xfailed in 266 s. This is the union of the two marker runs above (665 + 1241 + 1). |
| `uv run --directory <repo> --offline ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> --offline ruff format --check .` | `<repo>` | 0 | PASS | 249 files already formatted |
| `uv run --directory <repo> --offline mypy src` | `<repo>` | 0 | PASS | No issues in 57 source files (strict) |
| `uv build --directory <repo> --offline --out-dir <scratchpad>/dist` | `<repo>` | 0 | PASS | Built the sdist and the wheel, which ships `universes/service.py` and `universes/sql/`. The output was redirected so `dist/` was untouched; setuptools refreshed the ignored `src/factorflow.egg-info/` and `build/`. |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S5-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6a5eca7213a84853d9b0b6d46ee16a65e628d32a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git archive 6a5eca7 src tests`, then `git apply` of `cycle-1.patch` to `cycle-4.patch` in order, then `cmp` against `HEAD` | scratchpad | 0 | PASS | `service.py` and both test files are identical to the committed versions |
| `.venv/bin/python -c "import factorflow.universes.service, factorflow.classification.reader"` and the reverse order | `<repo>` | 0 | PASS | No import cycle (T012) |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 6a5eca7213a84853d9b0b6d46ee16a65e628d32a..HEAD --cycle review --out <scratchpad>/mut/mutants.json` | harness root | 0 | PASS | 5 catalogue mutants (3 negate-boolean, 2 off-by-one). 44 manual mutants were appended, for 49 in all (mutants sha256 `e826c684...faae5`). |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratchpad>/mut/mutants.json --jobs 4 --timeout 600 --command "cd {workdir} && PYTHONPATH={workdir}/src <repo>/.venv/bin/python -m pytest -q -x -p no:cacheprovider -m 'postgres or not postgres' tests/integration/test_universe_filter_snapshot.py tests/unit/test_universe_filter_provenance.py tests/unit/test_universe_service_validation.py tests/unit/test_universe_sql_safety.py" --out <scratchpad>/mut/results.json --logs <scratchpad>/mut/logs` | harness root | 3 | PASS-WITH-SURVIVORS | 15:14:52Z to 15:16:35Z. All four baselines passed 134 tests. 43 killed, 6 survived (2 equivalent, 4 not; see Mutation results). Results sha256 `40fdf487daf3d00cc3f18e88da2e5a3173e822b9749e436d8c1ae6d2febc2752`. Exit 3 means survivors, not a broken run. |
| Reviewer probe `<scratchpad>/probe_extreme_bounds.py <repo>`, run with `<repo>/.venv/bin/python` against its own `postgres:16` container (migrated through 0006, `BASE` seed) | scratchpad | 0 | PASS (diagnostic) | Results in IR-001 and IR-003. No repository file was changed. |
| `uv sync --all-extras` | `<repo>` | N/A | NOT RUN | No dependency, `pyproject.toml` or `uv.lock` change in the change set. The task plan's Validation Plan does not list it, and it would modify the shared environment. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `<repo>` | N/A | NOT RUN | Not applicable. The change set has no frontend or TypeScript file, and the task plan names none. |

The eight required commands are the story's and the plan's (`pytest -m postgres`,
`pytest -m 'not postgres'`, `ruff check`, `ruff format --check`, `mypy src`, `uv build`), the
constitution's full `uv run pytest` and the skill's TDD-evidence lint.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E1-S5` at `3a87770`, clean (no staged, unstaged or
  untracked non-ignored files); `code-revision` `sha256:dd3bc764...ece224`.
- After: the same HEAD, clean, with the same `code-revision`. Only ignored paths changed:
  `.hypothesis/`, `__pycache__/`, `src/factorflow.egg-info/` and `build/`. The mutation clones,
  logs and build output went to the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 1 · **total 4**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | initial | OPEN | No test shows that `create_from_filter` rolls back its own writes: the failure test rolls back first (`no-transaction-block` survives) |
| IR-002 | MEDIUM | initial | OPEN | T009(c) does not show the write lock is the first statement (`lock-after-currency-check` and `lock-after-evaluate` survive) |
| IR-003 | MEDIUM | initial | OPEN | Bounds of extreme magnitude cannot be saved under the DEC-0248 encoding (`Infinity` written for a non-integral bound above the largest double; `ValueError` for an integral bound of 4300 or more digits) |
| IR-004 | LOW | initial | OPEN | `create_from_filter`'s place in `__all__` is not pinned (`dunder-all-drops-create-from-filter` survives) |

### IR-001 — No test shows that `create_from_filter` rolls back its own writes

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. The requirement is design 2.3 and 2.4; no story AC is unmet.
- **Tasks**: T009(e), T009(g), T011
- **Files**: `src/factorflow/universes/service.py:289` (`with conn.transaction():`);
  `tests/integration/test_universe_filter_snapshot.py:888-904`
  (`test_a_failed_member_insert_rolls_the_whole_snapshot_back`), `:926-940`
  (`test_the_caller_owns_the_transaction`)
- **Claim challenged**: T009(e) says "the `universe` row and the `created` event do not survive
  a failed member insert". The plan's Story-Specific Validation says "T009 shows ... a whole
  rollback".
- **Observed evidence**:
  - Mutant `manual:no-transaction-block` (`with conn.transaction():` becomes `if True:`)
    survives all 134 focused tests.
  - T009(e)'s patched `executemany` raises before any SQL runs, and the test calls
    `conn.rollback()` (`:903`) before it asserts. The caller's rollback empties the transaction
    whether or not the function rolled anything back.
  - T009(g) checks only the caller's outer transaction.
  - The probe made the failure happen *after* the member insert had executed and read the state
    before any caller rollback. With the committed code, `written()` was already unchanged: the
    block's savepoint had undone the `universe` row and the events. Without the block those rows
    stay pending in the caller's transaction. A caller that catches the error and commits would
    then persist a partial universe. On an autocommit connection every statement would commit
    on its own and the transaction-level advisory lock would be released at once.
  - CAP-002-E1-S3 v2 IR-003 recorded the same gap for `create_by_hand` and predicted it for S5.
- **Expected evidence/behavior**:
  - Design 2.3: "Every write function runs inside `with conn.transaction():`".
  - Design 2.4: "one transaction of appended events per successful call and nothing written on
    any refusal".
  - T011 also specifies the block.
  - Skill E.9: no non-equivalent mutant may survive.
  - MEDIUM, not HIGH: the code is correct, T009 is an additional test that follows the plan's
    own test design, and no mandatory TC's Expected Result depends on the block.
- **Impact**: Every current test still passes if the block is dropped from `create_from_filter`.
  The append-only `universe_event` log cannot be repaired afterwards, so a partial universe
  written that way would be permanent.
- **Required remediation**: Add an assertion, before any caller `rollback()`, that a failure
  after the member insert leaves nothing behind. Examples:
  - `written()` is unchanged on the same connection;
  - a second connection sees the write lock free;
  - the same call on an autocommit connection leaves nothing.

  Then show `manual:no-transaction-block` killed.

### IR-002 — T009(c) does not show that the write lock is the first statement

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-2 (concurrent case only; the AC is satisfied as written)
- **Tasks**: T009(c), T011
- **Files**: `src/factorflow/universes/service.py:290` (`_take_lock(conn)`);
  `tests/integration/test_universe_filter_snapshot.py:812-848`
  (`test_the_snapshot_waits_on_the_write_lock`)
- **Claim challenged**:
  - The plan's Story-Specific Validation: "T009 shows the lock as the first statement".
  - The test's docstring: "the lock is taken first (DEC-0065)".
- **Observed evidence**:
  - `manual:lock-after-currency-check` (the lock taken after `current_set` and the currency
    check) survives.
  - `manual:lock-after-evaluate` (the lock taken after `evaluate_filter`) also survives.
  - The test shows only that B is *eventually* seen waiting on the lock and finishes after A
    commits. It does not constrain what B ran before it waited.
  - T009(d) does kill the coder's `lock-after-reads`, which moves the lock after the name check,
    so name uniqueness under concurrency is pinned.
- **Expected evidence/behavior**:
  - Design 2.3 says the write takes the lock "as its first statement", and flowchart step 1 shows
    the same.
  - The order is observable. Hold the lock on A, start B against current set S1, and commit a
    newer complete set S2 while B waits, then release A. The committed code reads
    `current_set` after it gets the lock and raises `ClassificationSetChanged` (DAC-E1-2). Both
    mutants have already passed the check, so they save a snapshot of a set that is no longer
    current.
  - The plan's Open Gaps entry "Check-then-evaluate window" accepts the window between the check
    and the commit. It does not leave the lock order open, so the mutants are not equivalent.
- **Impact**: With one owner the lock rarely contends. Even so, a save that waited behind
  another universe write could record a set that went stale while it waited, and every current
  test would still pass. The effect is small, which does not lower the severity. The severity is
  MEDIUM because T009(c) is an additional test, not a mandatory TC.
- **Required remediation**: Add a test that tells the order apart. For example, commit a newer
  complete set while B waits on the lock and expect `ClassificationSetChanged`. Then show
  `manual:lock-after-currency-check` and `manual:lock-after-evaluate` killed.

### IR-003 — Bounds of extreme magnitude cannot be saved under the DEC-0248 encoding

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-2, DAC-E1-3 (at the edge of the input domain)
- **Tasks**: T011, T010(b)
- **Files**:
  - `src/factorflow/universes/service.py:188-203` (`_json_default`, `_dump_json`);
  - `src/factorflow/classification/reader.py:265` (`Thresholds` accepts any finite `Decimal`
    score bound);
  - `component-design-classification-api.md:265` (score thresholds: "finite decimal").
- **Claim challenged**: DEC-0248 kept the float encoding after the owner was shown "the precision
  consequence (values with more than 15 significant digits or magnitude below about 2.2E-308
  read back as the nearest double)". The task plan's Open Gaps entry says the same. Neither
  mentions a bound that cannot be written at all.
- **Observed evidence**:
  - `_dump_json({"b": Decimal("1" + "0"*400 + ".5")})` returns `{"b": Infinity}`.
    `float(value)` overflows, and `json.dumps` defaults to `allow_nan=True`, so the output is
    not JSON.
  - `_dump_json({"b": Decimal("1E+5000")})` raises `ValueError: Exceeds the limit (4300 digits)
    for integer string conversion`.
  - The end-to-end probe used PostgreSQL 16, migrated through 0006, with the `BASE` seed. With
    `value_score_max` set to the first value, `create_from_filter` raises
    `psycopg.errors.InvalidTextRepresentation` ("invalid input syntax for type json ... Token
    "Infinity" is invalid"). With the second, it raises a bare `ValueError`.
  - Both raise after `Thresholds` and `evaluate_filter` have accepted the bound, and nothing is
    written after rollback.
  - The controls save and read back equal: `1E+400` (integral) with 10 members and `1.5` with 8.
- **Expected evidence/behavior**:
  - AC-2: the user can save the result of a threshold filter.
  - DEC-0076: what the list shows is what is saved.
  - Design 2.4: `filter_provenance` is "the filter as evaluated".
  - DEC-0248's recorded consequence is a read-back precision loss, not a failed save.
- **Impact**:
  - For these bounds the list works but the save fails. The non-integral case is an unexpected
    database error (`internal_error_handler`, 500).
  - The integral case is a bare `ValueError`, which CAP-002-E1-S6's route may report as a
    misleading 422 shape failure.
  - Nothing is persisted. The values are far outside any realistic standardised-score range, so
    the practical exposure is small. The gap is in what DEC-0248 covers, not a deviation from it.
- **Required remediation**:
  - Make `create_from_filter` either save such a bound or refuse it with a typed, documented
    error before anything is written, and pin the result with a test.
  - Do not change the DEC-0248 encoding of representable bounds.
  - If the chosen fix changes the encoding or narrows the accepted bound domain, it is the
    owner's to decide: DEC-0248 is `one-way`, and that change needs a recorded decision.

### IR-004 — `create_from_filter`'s place in `__all__` is not pinned

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `src/factorflow/universes/service.py:57`
- **Claim challenged**: T011 says "add `create_from_filter` to `__all__` if S3 defined one".
- **Observed evidence**:
  - `manual:dunder-all-drops-create-from-filter` survives.
  - S3's `test_all_names_in_dunder_all_resolve` checks only that listed names resolve.
  - No module in `src` or `tests` uses a star import.
- **Expected evidence/behavior**: A plan-specified export should be pinned if it is meant to
  hold.
- **Impact**: None for any current caller. A later edit could drop the export unnoticed. This is
  a maintainability and evidence-quality gap only.
- **Required remediation**: Optional. Assert `"create_from_filter" in service.__all__`, for
  example in `tests/unit/test_universe_filter_provenance.py`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified**:
  - T002 seeds ten stocks rather than eight, adding `AAC` and `BAA` for the hidden and prefix
    cases.
  - T003(d) uses a fixed UUID rather than a random one.
  - T011 names the `dumps` callable `_dump_json` instead of an inline lambda.
  - The plan's cycles 2 and 3 were merged; the evidence header records this.
  - The `CAP-002-E1-S5-evidence/` files are absent from T012's `git status` list but are
    required by T014.
- **Bookkeeping**: All 14 task boxes are checked and each has evidence. The story status changed
  from `planning` to `in-review`; the story's content revision equals its approved
  `reviewed_revision`.
- **Out of scope**: None. The only production change outside `create_from_filter` and its
  helpers is the module docstring sentence that said S5's function was not defined here.
- **Decisions**: The bound encoding follows DEC-0248 exactly, and the commit carries
  `Decision-Id: DEC-0248`. DEC-0248 is `owner_reviewed: false` and, in the harness worktree,
  still an untracked file. Committing it is the driver's. This review recorded no decision.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E1-S5 against this report.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004. IR-003 is also a question
  for the owner about DEC-0248's coverage of extreme-magnitude bounds. A coding agent may address
  IR-001, IR-002 and IR-004 in a later rework.
