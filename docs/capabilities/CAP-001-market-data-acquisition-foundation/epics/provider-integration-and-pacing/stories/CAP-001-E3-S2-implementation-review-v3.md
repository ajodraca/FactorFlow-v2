---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
story_id: "CAP-001-E3-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-16T17:31:38Z"
reviewed_head: "e78af9f28ed9f7389cedb1129ff02b8626903b9c"
review_base: "062601a54e800609408e3e23a542c7139bfb2abd"
reviewed_state_revision: "sha256:552842aac5a448d0b7e1bd6bfcf86867c6f2756dba55b44d6c00716465dc94e4"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S2
    artifact_version: 1
    content_revision: sha256:9210129541656c213b2c70936e85c9408efaa5ac53eff02abed9e218419a0171
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-16T17:31:38Z
  source_artifacts:
    - id: CAP-001-E3-S2
      version: "1"
    - id: CAP-001-E3-S2-tasks
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: CAP-001-component-design-observation-writer
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S2 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 4 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

Version 2's blocking finding is genuinely fixed, and the fix was verified by
reproducing the defect rather than by reading the commit message. The
remediation IR-001 demanded was that
`test_unix_millis_convert_to_session_date_via_timezone_aware_utc` fail under
`TZ=UTC` when `tz=UTC` is dropped from `DailyBar._millis_to_utc_session_date`.
This reviewer built a mutant copy of `models.py` in a scratch directory with
exactly that change, pointed a byte-equal copy of the test at it, and ran it
under `TZ=UTC`: it fails (`assert datetime.date(2024, 1, 1) ==
datetime.date(2024, 1, 2)`). The same mutant also fails under this host's own
timezone, so the test now discriminates the defect in both environments rather
than only in a non-UTC one. The vacuous
`datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)` expectation is
gone, replaced by a direct `date(2024, 1, 2)`. TC-COMP-216 is therefore
`ADEQUATE`, which is what invariant 8 required and what version 2 blocked on.

The three MEDIUM and four LOW findings were also addressed, each reproduced
here against the current tree: an out-of-domain `statement_type` or `timeframe`
is now rejected (v2/IR-002), a nested provider numeric is coerced to `Decimal`
and serialized as a string (v2/IR-003), a non-numeric or seconds-scale `t` now
raises (v2/IR-004), and the three docstring findings (v2/IR-005, IR-007,
IR-008) carry the records they asked for. Two of v2's eight were deliberately
not fixed in code — see the next paragraph.

**On the two deferred findings, the disposition is reasonable.** v2/IR-006
(`fundamental_observation.fiscal_period` has no producer) was explicitly framed
by version 2 as a choice between deriving the field here *or* recording the
ownership decision; it spans CAP-001-E4's writer, which this story does not own,
and it is now recorded as a durable `open_items` entry in
`CAP-001-E3-S2-tdd-evidence.yaml`, an artifact the task plan's T010 names by
path. The `statement_type` `"ratio"` versus `"ratios"` mismatch is a defect in
`CAP-001-E3-S1`'s `client.py`, on an unmerged branch, in a file this story does
not touch; `models.py` matches the DDL's `fundamental_statement_known` CHECK
exactly, which is the contract it is accountable to. Recording both rather than
reaching into another story's file is the correct call and neither is treated
here as an unaddressed finding. Both are carried into Follow-Up, because the
second one becomes a real break the moment S1 merges unchanged — verified:
`FinancialStatement.model_validate({…, "statement_type": "ratio"})` now raises.

The four findings recorded here are all LOW and none blocks. Three concern
test strength or an unrecorded assumption behind an otherwise-correct new
bound; one notes that a version 2 remediation landed only half. All seven
required validation commands were rerun by this reviewer and pass, with the
unit-test count rising from 48 to 53 in this story's four modules and from 247
to 252 in the container-free suite.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S2-review` |
| HEAD | `e78af9f28ed9f7389cedb1129ff02b8626903b9c` |
| Review base | `main` merge base `062601a54e800609408e3e23a542c7139bfb2abd` for the rework; `be332b1fde1176929c605c3d1ff04edd2a8630dc` for this story's original change set, both confirmed ancestors of `HEAD` |
| Working tree | clean — `git status --porcelain=v1 --untracked-files=all` returned no entries before or after validation |
| Changed files reviewed | 20 in this story's cumulative change set (5 of them touched again by the rework), plus 2 shared files re-checked for sibling drift |

### Resolving the review set

This story's original implementation is merged to `main`, and the rework sits
on a branch above it, so the review set was reconstructed from two ranges,
each verified by SHA:

1. **This story's original change set**, `be332b1..433c13c` — 20 files,
   unchanged in composition from the sets versions 1 and 2 reviewed.
2. **The rework**, `062601a..e78af9f` — two commits: `314df3b`, which adds
   only the version 2 review report, and `e78af9f`, the story-coding rework.

`git diff --name-status 062601a..e78af9f` returns exactly six paths, five of
which already belong to the story's own change set and one of which is the
version 2 report itself. No production or test file outside this story was
touched, so there is no scope leakage to attribute.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/models.py` | modified by rework | T001; T007; T008 — v2/IR-002, IR-003, IR-004, IR-005, IR-007, IR-008 |
| `tests/unit/test_massive_bars.py` | modified by rework | T003; T008 — v2/IR-001, IR-004 |
| `tests/unit/test_massive_financials.py` | modified by rework | T004 — v2/IR-002, IR-003 |
| `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` | modified by rework | T010 — three new mutations, the rework narrative, and the two `open_items` |
| `docs/.../CAP-001-E3-S2-tasks.md` | modified by rework | Metadata only: `updated` date and `last_reworked_review` |
| `docs/.../CAP-001-E3-S2-implementation-review-v2.md` | added (`314df3b`) | The prior gate report; a review artifact, not implementation |
| `src/factorflow/ingestion/__init__.py` | unchanged since v2 | T001 — shared file, re-checked |
| `src/factorflow/ingestion/massive/__init__.py` | unchanged since v2 | T001; T009 — shared file, re-checked |
| `tests/unit/test_massive_reference.py` | unchanged since v2 | T001; T002; T006 |
| `tests/unit/test_massive_actions.py` | unchanged since v2 | T001; T002; T005; T006 |
| `tests/fixtures/massive/*.json` (10 files) | unchanged since v2 | T002–T005 |
| `docs/.../CAP-001-E3-S2.md` | unchanged since v2 | Lifecycle metadata only |

No file in the change set lacks a justification. `pyproject.toml` and
`uv.lock` are still untouched, consistent with T001's checkpoint that Pydantic
is available transitively.

### Sibling drift since version 2

`src/factorflow/ingestion/__init__.py` and
`src/factorflow/ingestion/massive/__init__.py` are byte-identical to the
blobs version 2 reviewed — `git diff 062601a..e78af9f` lists neither. The
package boundary was re-probed on the current tree anyway: `__all__` holds 15
names, every one resolves, and all four of this story's model types are still
importable as `from factorflow.ingestion.massive import TickerReference,
DailyBar, FinancialStatement, CorporateAction`. No Massive SDK response type
and no raw wire dictionary crosses the boundary, so T009's prohibition and
DAC-E3-12 hold.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E3-12 | SATISFIED | `models.py` — every wire name appears only inside `Field(alias=…)`; public attributes are product vocabulary throughout (`company_name`, `open_price`, `fiscal_period_end`, `provider_filing_date`, `effective_on`). | `test_massive_reference.py::test_parses_wire_shape_into_product_vocabulary`; `test_massive_bars.py::test_parses_wire_shape_into_product_vocabulary`; `test_massive_financials.py::test_parses_wire_shape_into_product_vocabulary` | Re-traced on the current tree. The rework added no new attribute and renamed none. `CorporateAction`'s JSONB payload still carries provider key names, now recorded as deliberate in the class docstring (`models.py:313-321`); see IR-004 for the half of that remediation that did not land. |
| AC-5 | SATISFIED | `models.py:255` — `provider_filing_date: date = Field(alias="filing_date")`, with the class docstring (`:236-240`) stating it is descriptive only and that `observed_on` belongs to the writer. No model declares `observed_on`, `run_id` or `recorded_at`. | `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only`; the four `test_value_payload_*` tests | Re-probed: `value_payload()` on all four models carries no writer-owned key. |
| DAC-E3-S2-1 | SATISFIED | `models.py:163-171` — `t`→`session_date`, `o`→`open_price`, `h`→`high_price`, `l`→`low_price`, `c`→`close_price`, `v`→`volume`, `vw`→`vwap`, `n`→`transaction_count`. | `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` asserts all eight values, not their presence | Unchanged by the rework; the eight-case parametrized required-field test still corroborates. |
| DAC-E3-S2-2 | SATISFIED | `models.py:173-192` — `_millis_to_utc_session_date`, a `mode="before"` validator using `datetime.fromtimestamp(value / 1000, tz=UTC).date()`, now also rejecting non-numeric and out-of-magnitude input. | `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TZ-pinned); `::test_non_numeric_t_is_rejected_rather_than_coerced`; `::test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected` | **The row version 2 blocked on.** The test is now durable: verified by mutant execution under `TZ=UTC` (see Independent Validation). IR-002 notes an unrecorded assumption behind the new magnitude bound; it does not affect this row. |
| DAC-E3-S2-3 | SATISFIED | Every price/ratio/monetary field is `Decimal`; `_coerce_extra_numeric_fields_to_decimal` (`models.py:32-65`) now recurses into nested dicts and lists via `Decimal(str(v))`, skipping `bool` at every level. | `test_massive_bars.py::test_no_field_is_typed_float`; `test_massive_financials.py::test_monetary_values_are_decimal_not_float` and `::test_nested_extra_numeric_values_are_coerced_to_decimal`; `test_massive_actions.py::test_split_ratio_values_are_decimal_not_float`, `::test_dividend_cash_amount_is_decimal_not_float` | Re-probed: `{"financials": {"assets": {"value": 0.1}, "l": [1.5]}}` yields `Decimal` at both nesting levels and `value_payload()` emits `{'assets': {'value': '0.1'}, 'l': ['1.5']}` — strings, not JSON numbers. This is stronger than at version 2, where the nested case leaked a `float`. |
| DAC-E3-S2-4 | SATISFIED | No required field carries a default; `statement_type`, `timeframe` and `action_type` are now all `Literal`, so an out-of-domain value also fails. `errors.py::wrap_validation_error` maps the resulting `ValidationError` to `ProviderContractViolation`. | 22 parametrized required-field deletions across the four modules; `test_only_the_four_known_statement_types_are_accepted`; `test_only_annual_or_quarterly_timeframe_is_accepted`; the merged seam test `tests/unit/test_massive_error_classification.py::test_validation_error_from_a_successful_response_wraps_to_contract_violation` | Reproduced: `statement_type: "not_a_statement"`, `timeframe: "weekly"` and `statement_type: "ratio"` all raise `ValidationError` on the current tree. IR-003 records that the *accepted* half of the domain is only partly pinned by tests. |
| DAC-E3-S2-5 | SATISFIED | `TickerReference.delisted_utc`, `DailyBar.is_otc`, `FinancialStatement.fiscal_quarter` are `X \| None = None`; no zero or `False` substitute. | `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false`; `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements`; `test_massive_reference.py::test_active_instrument_has_no_delisted_timestamp` | Unchanged by the rework. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/massive/__init__.py`, `models.py` and the four `tests/unit/test_massive_*.py` modules exist at the planned paths. | Checkpoint reconfirmed: the four modules now collect and run 53 tests (was 48); `pyproject.toml`/`uv.lock` still untouched. |
| T002 | complete | VERIFIED | TC-COMP-206 realized as `test_parses_wire_shape_into_product_vocabulary` in three modules plus the four action-mapping tests. | Untouched by the rework; re-read and re-run. |
| T003 | complete | VERIFIED | `test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215) and `test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216), `tests/unit/test_massive_bars.py:36-87`. | The half version 2 held against this task — "assert … *using a timezone-aware UTC conversion*" — is now actually met, not merely named. Mutant-verified. |
| T004 | complete | VERIFIED | `test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005), `test_monetary_values_are_decimal_not_float` (TC-COMP-217), `test_missing_required_field_fails_validation` (TC-COMP-218), `test_fiscal_quarter_is_optional_for_annual_statements` (TC-COMP-219), plus three new tests. | Strengthened by the rework rather than altered: nothing previously asserted was weakened or deleted (`git diff` on this file is additive apart from the new imports). |
| T005 | complete | VERIFIED | The four action-mapping tests in `tests/unit/test_massive_actions.py`, each driven by its own recorded fixture. | Untouched by the rework. |
| T006 | complete | VERIFIED | `test_value_payload_*` in all four modules; asserts `json.dumps` succeeds, decimals serialize as strings, and the three writer-owned keys are absent. | Re-probed on all four models. IR-004 notes the payload-key assertion version 2 asked for was not added. |
| T007 | complete | VERIFIED | The four model classes, now with `timeframe: Literal["annual", "quarterly"]` and `statement_type: Literal["balance_sheet", "income_statement", "cash_flow_statement", "ratios"]` (`models.py:258-261`) matching `fundamental_statement_known` exactly. | The one T007 deviation version 2 recorded and this rework did not close — `fiscal_period` — is now a recorded `open_items` decision rather than a silent omission; see the disposition table. |
| T008 | complete | VERIFIED | `_millis_to_utc_session_date` now rejects rather than falls through (`models.py:188-191`); `_coerce_extra_numeric_fields_to_decimal` recurses; `value_payload()` on all four models; still no hashing and no writer metadata, as the task forbids. | "Reject unsupported or missing required input rather than silently coercing it" is now met for the two cases version 2 named. IR-002 records that the new bound's safety margin rests on a fact stated outside this file. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/massive/__init__.py` re-exports the four model types; `__all__` resolves in full; no SDK type or wire dict beyond the boundary. | Unchanged since version 2. The task's literal "expose only the product model types" is still superseded by CAP-001-E3-S3's and S5's merged error taxonomy, which passed their own gates; not attributable here. |
| T010 | complete | VERIFIED | `CAP-001-E3-S2-tdd-evidence.yaml` now records the four original RED→GREEN cycles, the five original mutations, and three rework mutations (`mutation-6` through `mutation-8`) with commands and results. | Two of the three new mutations were independently reproduced by this reviewer against mutant copies; see Independent Validation. `mutation-2`'s original "on this host's local timezone" caveat is superseded by the TZ-pinned test, though the recorded entry itself was not re-run under `TZ=UTC` as version 2 asked — the test change makes that re-run redundant, since the reviewer executed the equivalent directly. |

All ten checkboxes remain checked and all ten have corroborating repository
evidence. The rework added no task and left no task unchecked-but-implemented.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` / TC-COMP-216 | **ADEQUATE** (was WEAK at v1 and v2) | Pins the process's ambient `TZ` to `America/Los_Angeles` with `os.environ` + `time.tzset()` for the test's duration, restoring the prior value in a `finally`, then asserts `1704153600000` → `2024-01-02` and `1704153599999` → `2024-01-01`. Mutant-verified: with `tz=UTC` removed from the validator, the first assertion fails under `TZ=UTC` *and* under this host's zone. The vacuous `.replace(2024, 1, 2)` expectation is gone. | The pin fails open if the tz database is unavailable — IR-001. Not reachable from any environment this repository currently runs tests in. |
| `test_massive_bars.py::test_non_numeric_t_is_rejected_rather_than_coerced` (new) | ADEQUATE | Asserts `ValidationError` for `"t": "2024-01-02"`. Reproduced: without the `isinstance` guard the same input parses to `date(2024, 1, 2)` through Pydantic's ordinary coercion, so the test fails on the mutation it targets. | none |
| `test_massive_bars.py::test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected` (new) | ADEQUATE | Asserts `ValidationError` for `"t": 1704153600`. Independently mutant-verified: with `_MIN_PLAUSIBLE_MILLIS` widened to `1`, the same input parses to `date(1970, 1, 20)` and the test fails. | The upper bound `_MAX_PLAUSIBLE_MILLIS` has no covering test; a widened upper bound would go unnoticed. Minor — the realistic drift is downward, to seconds. Folded into IR-002. |
| `test_massive_financials.py::test_nested_extra_numeric_values_are_coerced_to_decimal` (new) | ADEQUATE | Asserts `Decimal` for a value nested two dicts deep *and* for every element of a nested list, then asserts the serialized payload emits `"0.1"` as a string. Independently mutant-verified: disabling the dict recursion leaves a `float` and the test fails. | Exercises the shared helper through `FinancialStatement` only, not `CorporateAction`. Acceptable — it is one shared function, reached identically from both `mode="before"` validators. |
| `test_massive_financials.py::test_only_the_four_known_statement_types_are_accepted` (new) | ADEQUATE | Asserts `ValidationError` for `"not_a_statement_type"`. Reproduced; also confirmed `"ratio"` (the singular S1 currently emits) is rejected. | Asserts only the rejection half. Of the four accepted values only `balance_sheet` and `ratios` appear in fixtures, so narrowing the `Literal` would go undetected — IR-003. |
| `test_massive_financials.py::test_only_annual_or_quarterly_timeframe_is_accepted` (new) | ADEQUATE | Asserts `ValidationError` for `"weekly"`; both accepted values are positively exercised by the annual and quarterly fixtures. | none |
| `test_massive_*.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Unchanged from version 2's assessment; re-read and re-run. Each asserts parsed values *and* the absence of wire-named attributes. | none |
| `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` / TC-COMP-215 | ADEQUATE | All eight values asserted with exact `Decimal` comparison. | none |
| `test_massive_financials.py::test_monetary_values_are_decimal_not_float` / TC-COMP-217 | ADEQUATE | `==` against an exact `Decimal` plus `isinstance`, over two fixtures. The nested gap version 2 recorded against it is now covered by a separate test. | none |
| `test_massive_*.py::test_missing_required_field_fails_validation` / TC-COMP-218 | ADEQUATE | 22 parametrized cases; each deletes a required wire key and fails for the intended reason. | none |
| `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false`, `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements` / TC-COMP-219 | ADEQUATE | `is None` versus `is True` / an explicit quarter, across separate fixtures. | none |
| `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` / TC-COMP-005 | ADEQUATE | Asserts survival under the product name and the absence of any attribute mistakable for an as-of date. | The restatement half belongs to CAP-001-E4's writer. |
| `test_massive_*.py::test_value_payload_*` (T006, four modules) | ADEQUATE | JSON-serializability, exact decimal strings, absence of all three writer-owned keys. | Still asserts only absence, never which keys *may* appear — IR-004. |
| `test_massive_actions.py::test_only_the_four_known_action_types_are_accepted` | ADEQUATE | Proves the `Literal` domain rejects an unknown action type, matching `corporate_action_type_known`. | Same accepted-half gap as its financials sibling; noted under IR-003 rather than duplicated. |

Isolation and determinism were re-verified. The new TZ manipulation is the only
global state any of these tests touches; it is restored in a `finally`, no
`pytest-xdist` is installed (`pyproject.toml:20` declares a bare `pytest`, and
`[tool.pytest.ini_options]` sets no `addopts`), so tests run serially in one
process and no concurrent test can observe the pinned zone. Running the four
story modules alone (53 tests, 0.06 s) and inside the full suite (311 tests)
produced identical results. No mocks are used anywhere in these modules; the
models are exercised directly against recorded JSON fixtures read through a
path resolved from `__file__`.

## Independent Validation

Every command below was run by this reviewer on
`usr/alvaro-de-jodra/CAP-001-E3-S2-review` at
`e78af9f28ed9f7389cedb1129ff02b8626903b9c`; none is quoted from a prior report
or from the rework's commit message. Working directory for all of them:
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py` | repo root | 0 | PASS | 53 passed in 0.06s — narrowest story-relevant scope, run first; 48 at version 2 |
| `uv run pytest -m 'not postgres'` | repo root | 0 | PASS | 252 passed, 59 deselected, 2 warnings in 12.73s; 247 at version 2 |
| `uv run pytest` | repo root | 0 | PASS | 311 passed, 2 warnings in 20.05s — full suite; Docker daemon confirmed up beforehand |
| `uv run ruff check .` | repo root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | repo root | 0 | PASS | 96 files already formatted |
| `uv run mypy src` | repo root | 0 | PASS | Success: no issues found in 28 source files |
| `uv build` | repo root | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |

### Mutation reproduction (the evidence this re-review turns on)

Three mutations were executed by this reviewer against copies of `models.py`
placed in a scratch directory outside the repository. No repository file was
modified at any point.

| Mutation reproduced | How | Observed |
|---------------------|-----|----------|
| v2/IR-001 — drop `tz=UTC` from `_millis_to_utc_session_date` | `sed` copy of `models.py` plus a byte-equal copy of TC-COMP-216 pointed at it, run under `TZ=UTC` and under the host zone | **Fails in both**: `AssertionError: assert datetime.date(2024, 1, 1) == datetime.date(2024, 1, 2)`. Before the rework, the same mutant passed under `TZ=UTC`. |
| `mutation-7` — `_MIN_PLAUSIBLE_MILLIS` widened to `1` | `sed` copy, then `DailyBar.model_validate({…, "t": 1704153600})` | Parses to `1970-01-20` with no error, so `test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected` fails — the evidence file's `caught: true` is correct |
| `mutation-6` — dict branch of `_coerce_value` stops recursing | `sed` copy, then a nested extra field | Nested value is `float`, so `test_nested_extra_numeric_values_are_coerced_to_decimal` fails — `caught: true` is correct |

Additional read-only probes, all in a throwaway interpreter against the
installed package, mutating nothing: every version 2 finding re-tested on the
current tree (results in the disposition table); `DailyBar` parsed across
session dates from 1976 to 2024 to establish the new magnitude bound's real
boundary (IR-002); the package `__all__` resolved in full; and `extra=`
resolved per model (`ignore` for `TickerReference`/`DailyBar`, `allow` for the
other two).

The two `pytest` warnings are pre-existing third-party deprecation notices
from `starlette`/`fastapi` in `.venv`, unrelated to this story.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` → empty; `HEAD` `e78af9f28ed9f7389cedb1129ff02b8626903b9c`
- After: `git status --porcelain=v1 --untracked-files=all` → empty; `HEAD` unchanged
- Unexpected tracked-file changes: none. `uv build` wrote `dist/`, which
  `.gitignore` excludes. All mutant copies were written under the session
  scratch directory, never into the repository. No branch was switched, no ref
  moved, nothing fetched or pulled.

## Findings

### IR-001 — TC-COMP-216's timezone pin fails open when the tz database is unavailable

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T003
- **Files**: `tests/unit/test_massive_bars.py:70-87`
- **Claim challenged**: the test's own docstring states that pinning `TZ` to `America/Los_Angeles` makes "a regression to a naive conversion fail here regardless of the host's own timezone".
- **Observed evidence**: probed directly — setting `TZ` to an unresolvable zone and calling `time.tzset()` leaves `time.tzname == ('UTC', 'UTC')` and `datetime.fromtimestamp(1704153600).date() == date(2024, 1, 2)`, identical to the UTC-aware result. Python's `time.tzset()` reads the host's zoneinfo database; where that database is absent or the name is not found it falls back to UTC silently, with no exception and no signal. The test asserts nothing about whether the pin took effect, so in that environment both of its assertions would pass against the very defect it exists to catch — the failure mode version 2 raised, in a different disguise.
- **Expected evidence/behavior**: `adversarial-review` SKILL.md §E.6 requires environment dependence to be *explicitly controlled*; a control that can silently not apply is only partly explicit. §E.3 requires a plausible regression to make the test fail.
- **Impact**: low today, and not reachable from any environment this repository runs tests in: CI is `ubuntu-latest`, which ships tzdata, the development host resolves `America/Los_Angeles` correctly, and `Dockerfile` installs the package without ever running pytest. The exposure is a future one — a slim test image, or a runner without tzdata.
- **Required remediation**: make the pin self-verifying — assert inside the test that the ambient zone is genuinely non-UTC once pinned (for instance that a naive conversion of `1704153600` yields `2024-01-01`), so the test fails loudly rather than becoming vacuous where the zone cannot be resolved. `pytest`'s `monkeypatch.setenv` would additionally remove the hand-rolled save/restore.

### IR-002 — the new Unix-milliseconds bound is safe only because of a provider fact stated nowhere near it

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py:68-79` (`_MIN_PLAUSIBLE_MILLIS`, `_MAX_PLAUSIBLE_MILLIS`) and `:190-191`
- **Claim challenged**: the comment above the constants says the bound is "wide enough to admit any bar this component will ever parse", and justifies its endpoints by `t`'s digit count ("2001-09-09 … through 2286-11-20 — the decade boundaries of `t`'s own digit count, so this needs no revisiting as real dates advance").
- **Observed evidence**: reproduced on the current tree — `DailyBar` rejects any session before 2001-09-09 with `t is not plausibly Unix milliseconds`: 1999 and 2001-06 inputs raise, 2005 and 2024 parse. Meanwhile `src/factorflow/api/bounds.py:9` admits a stated history depth of up to 50 years, which from 2026 reaches 1976. The claim is nevertheless **true today**, but for a reason the comment never gives: `docs/constitution/tech-stack.md:429` records that Massive's deepest tier (Advanced) holds "20+ years", and `component-design-ingestion-api.md:221` pins that to "September 2003". The floor therefore sits about two years below the earliest bar any plan can return — a real margin, resting on an external fact.
- **Expected evidence/behavior**: the digit-count rationale the comment offers does not establish the property the comment claims; the provider's earliest data does. A reader checking this bound against `MAX_HISTORY_DEPTH_YEARS = 50` — the only in-repo statement about how far back history may be asked for — will conclude it is too tight, as this reviewer initially did.
- **Impact**: low. No bar the provider can return today is rejected. Two future changes would make it bite silently, both plausible within this product's own roadmap: a provider tier that extends history below September 2003, or a second provider. The failure would surface as a `ProviderContractViolation` on legitimate data, i.e. as a provider fault rather than a local bound.
- **Required remediation**: record the actual basis in the comment — Massive Advanced's September 2003 floor, cited to `tech-stack.md` — and add a test asserting a bar at the earliest date the deepest plan can return still parses, so the coupling is pinned rather than remembered. Optionally cover `_MAX_PLAUSIBLE_MILLIS` the way `mutation-7` covers the lower one.

### IR-003 — no test pins the accepted half of the `statement_type` domain

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-4
- **Tasks**: T004, T007
- **Files**: `tests/unit/test_massive_financials.py:103-113`; `src/factorflow/ingestion/massive/models.py:259-261`
- **Claim challenged**: `test_only_the_four_known_statement_types_are_accepted` is named for the four-value domain and cites `fundamental_statement_known`.
- **Observed evidence**: the test asserts one rejection (`"not_a_statement_type"`) and nothing about which values are accepted. Of the four DDL values, only `balance_sheet` (`financial_annual.json`) and `ratios` (`financial_quarterly.json`) appear in any fixture. Narrowing the `Literal` to those two would leave the whole suite green, and a value the DDL permits would then be rejected as a `ProviderContractViolation`. The exact hazard is live: the same Literal now rejects `"ratio"`, which is what CAP-001-E3-S1's `client.py` currently emits.
- **Expected evidence/behavior**: `component-design-market-data-store.md` §2.3's `fundamental_statement_known` CHECK is the source of truth for this domain, and T007 requires the model to map to the fields that contract requires. A test naming the four values should hold the model to all four.
- **Impact**: low — the model is correct today, verified by direct probe against all four values. The gap is that nothing durable holds it correct, on precisely the field where a one-character difference is already known to exist across stories.
- **Required remediation**: parametrize the test over the four DDL values asserting each is accepted, alongside the existing rejection case. The identical gap in `test_massive_actions.py::test_only_the_four_known_action_types_are_accepted` is worth closing in the same pass.

### IR-004 — version 2's IR-005 remediation landed only its documentation half

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12
- **Tasks**: T005, T006
- **Files**: `src/factorflow/ingestion/massive/models.py:313-321`; `tests/unit/test_massive_actions.py:129-…`
- **Claim challenged**: the rework's own evidence file records IR-005 as addressed.
- **Observed evidence**: version 2's remediation read "either drop the provider-named duplicates of the natural key before building the payload, or add an explicit assertion **and** a one-line note in the model docstring". The docstring note landed (`models.py:313-321`, an eight-line record rather than one line). No assertion did: reproduced on the current tree, `value_payload()` for the ticker-change variant still returns `['action_type', 'date', 'effective_on', 'ticker_change', 'type']`, and no test asserts anything about which keys a payload may contain — the four `test_value_payload_*` tests assert only that three writer-owned keys are absent.
- **Expected evidence/behavior**: the branch of the remediation the rework chose requires both halves; documentation alone leaves the decision unpinned.
- **Impact**: low, unchanged from version 2's assessment — the payload is opaque JSONB, the writer reads product-named fields, and the duplication costs redundant hashed bytes. Without an assertion, a later change to the payload's key set would be invisible either way.
- **Required remediation**: add an assertion to `test_massive_actions.py::test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata` (or a sibling) pinning the ticker-change payload's key set, so the deliberate retention the docstring records is the behavior a test enforces.

## Previous Review Disposition

Every version 2 finding was re-tested against the current tree by probe or by
mutation; none is recorded as resolved on the rework's say-so.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) — TC-COMP-216 cannot detect a naive conversion on a UTC host | **RESOLVED** | `tests/unit/test_massive_bars.py:70-87` pins `TZ=America/Los_Angeles` with `time.tzset()` and restores it in a `finally`; the vacuous `.replace(2024, 1, 2)` expectation is replaced by `date(2024, 1, 2)`. Mutant-verified by this reviewer: with `tz=UTC` removed from `_millis_to_utc_session_date`, the test fails under `TZ=UTC` and under the host zone. Residual recorded as IR-001 (LOW). |
| v2/IR-002 (MEDIUM) — `statement_type`/`timeframe` unconstrained | **RESOLVED** | `models.py:258-261` — both are now `Literal`, matching `fundamental_statement_known` and §2.5. Probed: `"not_a_statement"`, `"weekly"` and `"ratio"` all raise `ValidationError`. Two new tests cover the rejections; accepted-half gap recorded as IR-003 (LOW). |
| v2/IR-003 (MEDIUM) — `Decimal` coercion top-level only | **RESOLVED** | `models.py:49-58` — `_coerce_value` recurses into dicts and lists and still exempts `bool` at every level. Probed: `{"financials": {"assets": {"value": 0.1}, "l": [1.5]}}` yields `Decimal` throughout and serializes as `'0.1'`/`'1.5'` strings. Mutation independently reproduced. |
| v2/IR-004 (MEDIUM) — `DailyBar` accepts a non-millisecond timestamp | **RESOLVED** | `models.py:188-191` rejects non-numeric input (including `bool`) and anything outside `1_000_000_000_000..9_999_999_999_999`. Probed: `"t": "2024-01-02"` and `"t": 1704153600` both raise; two new tests cover them; `mutation-7` independently reproduced. The bound's own basis is recorded as IR-002 (LOW). |
| v2/IR-005 (LOW) — provider key names in the `CorporateAction` payload | **PARTIALLY RESOLVED** | Docstring record added at `models.py:313-321`; the assertion the remediation's second branch also required was not added, and the payload key set is unchanged (reproduced). Carried as IR-004 (LOW). |
| v2/IR-006 (LOW) — no producer for `fundamental_observation.fiscal_period` | **ADDRESSED BY RECORD — decision still owed** | Not fixed in code, deliberately: `"fiscal_period" in FinancialStatement.model_fields` is still `False`, and the identifier still appears only in the DDL. It is now recorded as `open_items[0]` in `CAP-001-E3-S2-tdd-evidence.yaml:276-286`, naming both options version 2 offered. This satisfies the "record … so the gap is a decision rather than an omission" branch of the remediation, in a durable artifact the task plan's T010 names by path. It is not re-raised as a finding here; it is carried into Follow-Up because the decision itself is still open and CAP-001-E4's task plans are on `main`. |
| v2/IR-007 (LOW) — docstrings cite a non-existent `daily_bar.payload` column | **RESOLVED** | `models.py:194-202` — `DailyBar.value_payload()` now states the payload exists for the append-only value hash, that `daily_bar` has no `payload` column, and that `vwap`, `transaction_count` and `is_otc` are carried for hashing only. The class docstring never made the claim (checked against `062601a:models.py:86-104`), so no second correction was needed. |
| v2/IR-008 (LOW) — inconsistent `extra=` across the four models | **RESOLVED** | `models.py:99-109` and `:152-158` — both `TickerReference` and `DailyBar` now record why they keep `extra="ignore"`, name the contrast with the other two models, and state plainly that a future provider field would vanish without signal. `extra` resolution re-probed and unchanged, which is what the first branch of the remediation chose. |

### The cross-story `"ratio"` / `"ratios"` mismatch

Discovered by the rework while implementing v2/IR-002 and recorded as
`open_items[1]` in the evidence file rather than fixed. Verified here:
`CAP-001-E3-S1`'s `client.py`, on the unmerged branch
`usr/alvaro-de-jodra/CAP-001-E3-S1`, pairs `list_financials_ratios` with the
label `"ratio"` (line 125), while `component-design-market-data-store.md`
§2.3's `fundamental_statement_known` CHECK names `'ratios'`. This story's model
now matches the DDL, so `FinancialStatement.model_validate({…,
"statement_type": "ratio"})` raises — confirmed by probe.

Recording rather than fixing is the right disposition. The defect is in another
story's file, on a branch that is not an ancestor of this `HEAD`;
`src/factorflow/ingestion/massive/client.py` does not exist on `main`; and
this story's own contract — the DDL's CHECK — is satisfied exactly. Reaching
into S1's unmerged branch would have been scope leakage and would have bypassed
S1's own gate. No finding is raised against CAP-001-E3-S2 for it. It is carried
into Follow-Up because it is a real break the moment S1 merges unchanged, and
because the store is append-only: every ratios statement would be refused as a
`ProviderContractViolation` rather than written.

## Scope and Plan Deviations

- **The rework is confined to this story's own files.** `git diff
  --name-status 062601a..e78af9f` lists six paths: three of this story's
  implementation and test files, its task plan (metadata only), its TDD
  evidence, and the version 2 report added by the separate commit `314df3b`.
  No sibling module, no dependency, no configuration file was touched.
- **The task-plan edit is metadata only.** `updated: 2026-09-11` →
  `2026-09-16` and a new `last_reworked_review` key. No task text, checkbox,
  traceability row or validation command changed, so the plan this review
  judges against is the same one version 2 judged against.
- **Test changes are additive.** `test_massive_bars.py` and
  `test_massive_financials.py` gained five tests and replaced TC-COMP-216's
  body; no existing assertion was weakened or deleted. Verified by reading the
  full diff rather than the summary.
- **Two findings were deliberately deferred, both defensibly.** See the
  disposition table and the cross-story section above. Neither is treated as
  unaddressed, and neither affects the verdict.
- **The story's own `status` is stale.** `CAP-001-E3-S2.md` still reads
  `status: docs-sync`, set by doc-sync commit `701e7fb` before version 2
  returned the story to coding. `scripts/pipeline-state.py` derives the correct
  stage regardless ("changes were reworked; a new review version is required"),
  so this is bookkeeping noise rather than a defect.
- **Branch metadata in the task plan is still stale.** `**Branch**:
  usr/alvaro-de-jodra/CAP-001-E2-S4` in the plan header; the work was done on
  `usr/alvaro-de-jodra/CAP-001-E3-S2` and this rework on
  `usr/alvaro-de-jodra/CAP-001-E3-S2-review`. Carried from versions 1 and 2;
  a copy-paste error in the plan, not an implementation defect.
- **`README.md` is now stale in the opposite direction.** Doc-sync commit
  `701e7fb` recorded v2/IR-002, IR-003 and IR-004 in `README.md:233-252` as
  "known limitations, carried forward as accepted warnings". All three are
  fixed by this rework, so those entries now describe behavior the code no
  longer has. `README.md` is doc-sync's output, outside this gate's subject;
  named here so the next stage corrects it.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: proceed to doc sync with the four LOW findings recorded.
  Doc sync must additionally correct `README.md:233-252`, which still lists
  v2/IR-002, IR-003 and IR-004 as accepted limitations after this rework fixed
  all three, and should reflect the tightened contracts: `statement_type` and
  `timeframe` are now closed domains, nested provider numerics are `Decimal`,
  and `t` is rejected unless it is plausibly Unix milliseconds.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004 — all LOW.
  None blocks doc sync or merge. IR-002 is the one worth scheduling rather than
  merely recording: it pins an assumption about provider history depth that a
  plan upgrade could invalidate silently.
- **Owner decisions still open, carried from version 2**:
  1. **`fundamental_observation.fiscal_period` ownership** (v2/IR-006,
     `open_items[0]`). `NOT NULL` with no producer. The decision is due now that
     CAP-001-E4's task plans are on `main`: either derive it on
     `FinancialStatement`, or record in a CAP-001-E4 task plan that the writer
     owns it.
  2. **CAP-001-E3-S1's `"ratio"` label** (`open_items[1]`). Must become
     `"ratios"` before or as part of S1's next pass, or every ratios statement
     S1's client produces will be refused by this story's model.
