---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-21
updated: 2026-09-21
story_id: "CAP-001-E3-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-09-21T02:38:54Z"
reviewed_head: "5e7f04c698bac0605ae96353d3c93321db3c1ea8"
review_base: "0ccc29f8b27288b453f51555e8b001608edc8637"
reviewed_state_revision: "sha256:5d045861072be63517d07247ca10d0b16ebf438c9ad6a0ef1748922d29529947"
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
  tool_version: "unknown"
  timestamp: 2026-09-21T02:38:54Z
  source_artifacts:
    - id: CAP-001-E3-S2
      version: "1"
    - id: CAP-001-E3-S2-tasks
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-observation-writer
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S2 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

All four version 3 findings are genuinely closed, and every closure was
established here by executing a mutant, not by reading the evidence file. The
timezone pin is now self-verifying (`tests/unit/test_massive_bars.py:108`):
with the pinned zone replaced by an unresolvable name, the test fails at that
assertion instead of passing vacuously — the exact failure mode v3/IR-001
described. The `_MIN_PLAUSIBLE_MILLIS` bound now carries a regression test at
Massive Advanced's September 2003 floor, and raising the floor to
`1_100_000_000_000` makes it fail. Both `Literal` domains are now pinned on
their accepted half, and narrowing either one fails exactly two parametrized
cases. The ticker-change payload key set is now asserted, and dropping `date`
from `CorporateAction.value_payload()` fails it. Six mutations in total were
built and run by this reviewer against copies of the package placed outside
the repository; all six were caught, and the repository was never modified.

The new `tests/unit/test_massive_package_boundary.py` is a real addition to
T009's evidence — it catches a raw dictionary export and an SDK class export,
both reproduced here. It is not as tight as its docstring claims: its
`_export_origin` fallback treats every builtin-typed export as
package-owned, so a `list` of raw wire dicts added to `__all__` passes all
three tests (reproduced). That is IR-001 and is a MEDIUM warning on a test
nobody's plan required, not a gate failure — DAC-E3-12's mandatory coverage
lives in the four TC-COMP-206 tests, which remain ADEQUATE.

The owner decision assigning `fundamental_observation.fiscal_period`
derivation to CAP-001-E4's writer is recorded in three places and is
internally consistent: `fiscal_period` is still absent from
`FinancialStatement.model_fields` (probed), the E3-S2 task plan Notes records
the attended decision, and `CAP-001-E4-S3-tasks.md` now carries the derivation
in T010, mandatory annual/quarterly coverage in T002, a story dependency, a
story-specific validation line, a Notes entry, and an Open Gaps entry naming
`component-design-observation-writer.md` as the design that must absorb it.
The `FY` / `Q{fiscal_quarter}` shape is unconstrained by the DDL
(`migrations/0002_observations.sql:41` is `text NOT NULL`, no `CHECK`), so the
mapping is a free and recorded choice. The propagation is correct in content.
What it is not is in-scope for a story-coding run: `story-coding` SKILL.md
constraint 9 limits project-repo edits to metadata, this story's own task plan
assigns the work to *E4-S3 implementation planning*, and the E3-S2 TDD
evidence still describes the propagation in the future tense while the commit
already performed it. That is IR-003 (MEDIUM), with the provenance
inconsistency it leaves behind as IR-004 (LOW).

All seven required validation commands were rerun by this reviewer and pass.
The working tree was clean before and after; no tracked file changed.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (worktree `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-run-E3-S2-root/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S2-followup` |
| HEAD | `5e7f04c698bac0605ae96353d3c93321db3c1ea8` |
| Review base | `origin/main` merge base `0ccc29f8b27288b453f51555e8b001608edc8637` (confirmed ancestor of `HEAD`; `git merge-base origin/main HEAD`) |
| Working tree | clean — `git status --porcelain=v1 --untracked-files=all` returned no entries before and after validation |
| Changed files reviewed | 9 in the follow-up range, plus the 6 E3-S2-owned source/test/fixture paths already on `main`, re-read and re-executed |

### Resolving the review set

This story's original implementation, and its version 2 rework, are already
merged to `origin/main`. `origin/main` at `0ccc29f` is therefore the only
trustworthy base, and `git diff --name-status 0ccc29f HEAD` returns exactly
nine paths — the complete follow-up change set. No staged, unstaged, or
untracked file exists.

To satisfy the instruction to review the *full current* E3-S2 change set
rather than only the delta, the E3-S2-owned artifacts already on `main` were
re-read and re-executed against the current tree as well:
`src/factorflow/ingestion/massive/models.py` (all 345 lines),
`src/factorflow/ingestion/massive/__init__.py`,
`src/factorflow/ingestion/__init__.py`, the four
`tests/unit/test_massive_*.py` modules, and the ten
`tests/fixtures/massive/*.json` fixtures this story introduced. Every
acceptance criterion below was re-traced against that current state, not
against a prior report's description of it.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/models.py` | modified | T008 — comment only; the `_MIN_PLAUSIBLE_MILLIS` rationale required by v3/IR-002. No executable line changed (`git diff` touches lines 68-77 only). |
| `tests/unit/test_massive_bars.py` | modified | T003, T008 — v3/IR-001 (self-verifying TZ pin, `monkeypatch`) and v3/IR-002 (September 2003 regression test) |
| `tests/unit/test_massive_financials.py` | modified | T004, T007 — v3/IR-003 (accepted half of `fundamental_statement_known`) |
| `tests/unit/test_massive_actions.py` | modified | T005, T006, T007 — v3/IR-003 (accepted half of `corporate_action_type_known`) and v3/IR-004 (ticker-change payload key set) |
| `tests/unit/test_massive_package_boundary.py` | added | T009, DAC-E3-12 — supplementary regression; not a planned path (justified deviation, see Scope and Plan Deviations) |
| `docs/.../CAP-001-E3-S2.md` | modified | Lifecycle metadata only: `status: docs-sync` → `in-review`, `updated`. Content revision unchanged (`sha256:9210129…`, identical to the approved `reviewed_revision`). |
| `docs/.../CAP-001-E3-S2-tasks.md` | modified | Metadata plus one Notes entry recording the attended owner decision. No task text, checkbox, or AC row altered. |
| `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` | modified | T010 — six new mutations, the `review_v3_rework` block, and updated `open_items` dispositions |
| `docs/.../CAP-001-E4-S3-tasks.md` | modified | **Out of scope for this story's coding run** — substantive edits to a sibling story's planning artifact (T002, T010, dependencies, validation plan, Notes, Open Gaps, provenance). See IR-003 and IR-004. |

`pyproject.toml` and `uv.lock` remain untouched, consistent with T001's
checkpoint that Pydantic arrives transitively. No dependency, configuration,
migration, or production behavior changed in this range.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E3-12 | SATISFIED | `models.py` — every wire name appears only inside `Field(alias=…)`; public attributes are product vocabulary throughout (`company_name`, `open_price`, `fiscal_period_end`, `provider_filing_date`, `effective_on`). `massive/__init__.py:55-71` re-exports only `factorflow`-defined names. | `test_massive_{reference,bars,financials}.py::test_parses_wire_shape_into_product_vocabulary`; the four action-mapping tests; new `test_massive_package_boundary.py` (3 tests) | Re-traced on the current tree. Boundary re-probed by mutation: exporting `BadResponse` from `massive.exceptions` fails two of the three new tests; exporting a raw `dict` fails two. The `CorporateAction` JSONB payload still carries provider key names, documented as deliberate at `models.py:313-321` and now pinned by a test. IR-001 records the residual hole in the new test. |
| AC-5 | SATISFIED | `models.py:255` — `provider_filing_date: date = Field(alias="filing_date")`; class docstring `:236-240` states it is descriptive only and that `observed_on` belongs to the writer. No model declares `observed_on`, `run_id`, or `recorded_at`. | `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005); the four `test_value_payload_*` tests | Unchanged by the follow-up and re-executed. Probed: `"fiscal_period" in FinancialStatement.model_fields` is `False`, which is what the 2026-09-20 owner decision requires of this story. |
| DAC-E3-S2-1 | SATISFIED | `models.py:163-171` — `t`→`session_date`, `o`→`open_price`, `h`→`high_price`, `l`→`low_price`, `c`→`close_price`, `v`→`volume`, `vw`→`vwap`, `n`→`transaction_count`. | `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215) asserts all eight values; 8 parametrized required-field deletions | Untouched by the follow-up; re-read and re-run. |
| DAC-E3-S2-2 | SATISFIED | `models.py:173-192` — `_millis_to_utc_session_date`, a `mode="before"` validator using `datetime.fromtimestamp(value / 1000, tz=UTC).date()`, rejecting non-numeric, `bool`, and out-of-magnitude input. | `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216); `::test_earliest_massive_advanced_bar_is_within_millis_bound`; `::test_non_numeric_t_is_rejected_rather_than_coerced`; `::test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected` | Mutant-verified twice: dropping `tz=UTC` fails TC-COMP-216 under `TZ=UTC`; making the pinned zone unresolvable fails it at the new self-verification assertion. Suite re-run green under `TZ=UTC`, `TZ=Pacific/Kiritimati`, and `TZ=America/Los_Angeles`. |
| DAC-E3-S2-3 | SATISFIED | Every price/ratio/monetary field is `Decimal`; `_coerce_extra_numeric_fields_to_decimal` (`models.py:32-65`) recurses into nested dicts and lists via `Decimal(str(v))`, exempting `bool` at every level. | `test_massive_bars.py::test_no_field_is_typed_float`; `test_massive_financials.py::test_monetary_values_are_decimal_not_float` (TC-COMP-217), `::test_nested_extra_numeric_values_are_coerced_to_decimal`; `test_massive_actions.py::test_split_ratio_values_are_decimal_not_float`, `::test_dividend_cash_amount_is_decimal_not_float` | Unchanged by the follow-up; re-executed. Payload strings re-asserted by `test_value_payload_*` in all four modules. |
| DAC-E3-S2-4 | SATISFIED | No required field carries a default; `statement_type`, `timeframe`, and `action_type` are `Literal`, matching `fundamental_statement_known` and `corporate_action_type_known`. `errors.py::wrap_validation_error` maps the resulting `ValidationError` to `ProviderContractViolation`. | 22 parametrized required-field deletions across the four modules (TC-COMP-218); new `test_each_known_statement_type_is_accepted` (4 cases) and `test_each_known_action_type_is_accepted` (4 cases); `test_unknown_statement_type_is_rejected`; `test_unknown_action_type_is_rejected`; `test_only_annual_or_quarterly_timeframe_is_accepted` | The accepted half is now pinned — the gap v3/IR-003 raised. Mutant-verified: narrowing `statement_type` to two values fails exactly the `income_statement` and `cash_flow_statement` cases; narrowing `action_type` to two values fails `ticker_change` and `ipo` plus four merged E3-S1 client tests. |
| DAC-E3-S2-5 | SATISFIED | `TickerReference.delisted_utc`, `DailyBar.is_otc`, `FinancialStatement.fiscal_quarter` are `X \| None = None`; no zero or `False` substitute. | `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false`; `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements`; `test_massive_reference.py::test_active_instrument_has_no_delisted_timestamp` | Unchanged; re-executed. IR-005 notes that TC-COMP-219, the mapped case for this criterion, still carries no traceability comment in code. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/massive/__init__.py`, `models.py`, and the four planned `tests/unit/test_massive_*.py` modules all exist at the planned paths. | Checkpoint reconfirmed: the four planned modules plus the new boundary module collect and run 86 tests (53 at version 3). `pyproject.toml`/`uv.lock` untouched. |
| T002 | complete | VERIFIED | TC-COMP-206 realized as `test_parses_wire_shape_into_product_vocabulary` in three modules plus the four action-mapping tests in `test_massive_actions.py`. | Untouched by the follow-up; re-read and re-run. |
| T003 | complete | VERIFIED | `test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215) and `test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216), `tests/unit/test_massive_bars.py:79-119`. | The TZ pin was rewritten to `monkeypatch.context()` with a self-verification assertion, exactly the remediation v3/IR-001 asked for. Mutant-verified both directions. |
| T004 | complete | VERIFIED | `test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005), `test_monetary_values_are_decimal_not_float` (TC-COMP-217), `test_missing_required_field_fails_validation` (TC-COMP-218), `test_fiscal_quarter_is_optional_for_annual_statements`, plus the new accepted-domain parametrization. | Strengthened, not weakened: `git diff 0ccc29f HEAD -- tests/unit/test_massive_financials.py` deletes only the old single-case rejection test, which is retained verbatim as `test_unknown_statement_type_is_rejected`. TC-COMP-219's traceability comment is still absent — IR-005. |
| T005 | complete | VERIFIED | The four action-mapping tests in `tests/unit/test_massive_actions.py`, each driven by its own recorded fixture; `action_type`/`effective_on` natural-key coverage retained. | The follow-up adds the accepted-domain parametrization and the ticker-change payload key-set assertion. No prior assertion removed. |
| T006 | complete | VERIFIED | `test_value_payload_*` in all four modules: `json.dumps` succeeds, decimals serialize as strings, all three writer-owned keys absent. | The assertion v3/IR-004 required now exists (`test_ticker_change_payload_deliberately_retains_provider_keys`) and is mutant-verified. |
| T007 | complete | VERIFIED | The four model classes; `timeframe: Literal["annual", "quarterly"]` and the four-value `statement_type` Literal at `models.py:258-261` match `fundamental_statement_known` exactly; `action_type` Literal at `:326` matches `corporate_action_type_known`. | The one standing T007 deviation — no `fiscal_period` field — is now a recorded attended owner decision assigning the derivation to E4-S3, not an omission. Probed: the field is still absent, which the decision requires. |
| T008 | complete | VERIFIED | `_millis_to_utc_session_date` rejects rather than falls through (`models.py:188-191`); `_coerce_extra_numeric_fields_to_decimal` recurses; `value_payload()` on all four models; no hashing and no writer metadata, as the task forbids. | The follow-up changes only the rationale comment at `:68-77`. Its cited basis is now the provider floor rather than digit counts — correct in substance; the section number it cites is wrong (IR-002). |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/massive/__init__.py:48-71` re-exports the four model types; `__all__` holds 15 names and every one resolves; no SDK type and no raw wire dictionary crosses the boundary. | Now defended by a regression test rather than by inspection alone. Two mutations confirmed the test bites; a third confirmed a builtin-typed escape it does not cover (IR-001). The task's literal "expose only the product model types" remains superseded by E3-S3's and E3-S5's merged error taxonomy, which passed their own gates. |
| T010 | complete | VERIFIED | `CAP-001-E3-S2-tdd-evidence.yaml` records the four original RED→GREEN cycles, mutations 1–8 from earlier passes, and mutations 9–14 for this one, each with change, test, result, `caught`, and `reverted`. | All six new mutations were independently reproduced by this reviewer; every recorded outcome matched. `initial_green: 70 passed` and all five `final_validation` results were reproduced exactly. One nit: `mutation-12`'s recorded `2 failed, 2 passed` is true only for the single parametrized test — run across the story modules it fails nine, including four merged E3-S1 client tests. Understated, not wrong. |

All ten checkboxes remain checked and all ten have corroborating repository
evidence. No task was added, and no unchecked task appears implemented.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` / TC-COMP-216 | ADEQUATE | Pins `TZ=America/Los_Angeles` via `monkeypatch.context()`, calls `time.tzset()`, then **proves the pin took effect** (`assert datetime.fromtimestamp(1704153600).date() == date(2024, 1, 1)`) before asserting `1704153600000` → `2024-01-02` and `1704153599999` → `2024-01-01`. Restores the C-level zone in `finally`. Mutant-verified twice: dropping `tz=UTC` fails it under `TZ=UTC`; replacing the zone with `No/Such_Zone` fails it at line 108 rather than passing vacuously. | none — v3/IR-001 closed |
| `test_massive_bars.py::test_earliest_massive_advanced_bar_is_within_millis_bound` (new) | ADEQUATE | Asserts a `t` of `1_062_374_400_000` parses to `date(2003, 9, 1)` — independently confirmed as `2003-09-01T00:00:00Z`. Mutant-verified: raising `_MIN_PLAUSIBLE_MILLIS` to `1_100_000_000_000` fails it with a `ValidationError`. | `_MAX_PLAUSIBLE_MILLIS` still has no covering test. v3/IR-002 marked that half optional; the realistic drift is downward. |
| `test_massive_financials.py::test_each_known_statement_type_is_accepted` (new, 4 cases) | ADEQUATE | Drives all four `fundamental_statement_known` values through `model_validate` and asserts the round-tripped value. Mutant-verified: narrowing the `Literal` to `["balance_sheet", "ratios"]` fails exactly the other two cases. | none — v3/IR-003 closed for this model |
| `test_massive_actions.py::test_each_known_action_type_is_accepted` (new, 4 cases) | ADEQUATE | Drives all four `corporate_action_type_known` values and asserts the round-tripped value. Mutant-verified: narrowing to `["split", "dividend"]` fails `ticker_change` and `ipo`. | Reuses the split fixture for all four types, so the payloads are semantically incoherent for three of them. Acceptable — the test's stated purpose is the `Literal` domain, and the model deliberately imposes no variant-specific shape. |
| `test_massive_actions.py::test_ticker_change_payload_deliberately_retains_provider_keys` (new) | ADEQUATE | Asserts the exact payload key set `{action_type, date, effective_on, ticker_change, type}`, pinning the retention the class docstring records. Mutant-verified: dropping `date` from `CorporateAction.value_payload()` fails it. | none — v3/IR-004 closed |
| `test_massive_package_boundary.py::test_s2_product_models_are_identity_reexported_from_package` (new) | ADEQUATE | Asserts each of the four model names is in `__all__` **and** that the package attribute `is` the class object from `models`. Mutant-verified: rebinding `CorporateAction` to a dict fails it. | none |
| `test_massive_package_boundary.py::test_every_public_export_is_product_owned` (new) | **WEAK** | Asserts every `__all__` entry's origin starts with `factorflow.`. Mutant-verified: exporting `massive.exceptions.BadResponse` fails it. | `_export_origin` returns the boundary package's own name for any value whose type is a builtin, so a `str`, `int`, `list`, or `tuple` export is declared product-owned unconditionally. Reproduced — IR-001. |
| `test_massive_package_boundary.py::test_public_surface_contains_no_raw_dictionary_or_massive_sdk_value` (new) | **WEAK** | Asserts no export is a `dict` and none originates in `massive*`. Mutant-verified: a dict export and an SDK class export both fail it. | A `list` of raw wire dicts (`[{"t": 1, "o": 2}]`) added to `__all__` passes all three tests — reproduced. The docstring's claim that "raw wire dictionaries … stay inside" is therefore broader than what is enforced. IR-001. |
| `test_massive_*.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Unchanged; re-read and re-run. Each asserts parsed values and the absence of wire-named attributes. | none |
| `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` / TC-COMP-215 | ADEQUATE | All eight values asserted with exact `Decimal` comparison. | none |
| `test_massive_financials.py::test_monetary_values_are_decimal_not_float` / TC-COMP-217 | ADEQUATE | `==` against exact `Decimal` plus `isinstance`, over two fixtures; the nested case covered separately and mutation-proven at version 3. | none |
| `test_massive_*.py::test_missing_required_field_fails_validation` / TC-COMP-218 | ADEQUATE | 22 parametrized cases across four modules; each deletes a required wire key. | none |
| `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false`, `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements` / TC-COMP-219 | ADEQUATE | `is None` versus `is True` / an explicit quarter, across separate fixtures. | Neither test, nor any file under `tests/`, names TC-COMP-219 — IR-005. |
| `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` / TC-COMP-005 | ADEQUATE | Asserts survival under the product name and the absence of any attribute mistakable for an as-of date. | The restatement half belongs to CAP-001-E4's writer. |
| `test_massive_*.py::test_value_payload_*` (T006, four modules) | ADEQUATE | JSON-serializability, exact decimal strings, absence of all three writer-owned keys; the action module now also pins a full key set. | none |
| `test_massive_financials.py::test_only_annual_or_quarterly_timeframe_is_accepted` | ADEQUATE | Rejects `"weekly"`; both accepted values are positively exercised by the annual and quarterly fixtures. | none |

Isolation and determinism were re-verified independently. The `TZ` pin is the
only global state these modules touch; it is now restored by
`monkeypatch.context()` plus a `finally: time.tzset()`. `pyproject.toml`
declares a bare `pytest` with no `pytest-xdist` and sets no `addopts`, so
tests run serially in one process. The four story modules plus the new
boundary module were run alone (86 tests), inside the container-free suite
(340 tests), inside the full suite (427 tests), and under three different
ambient timezones (`UTC`, `Pacific/Kiritimati`, `America/Los_Angeles`) — all
green, with identical counts. No mocks are used in the model tests; the models
are exercised directly against recorded JSON fixtures resolved from
`__file__`. The mocks that do appear in these files belong to merged E3-S1
client tests and patch only `RESTClient`, leaving the unit under test intact.

## Independent Validation

Every command below was run by this reviewer on
`usr/alvaro-de-jodra/CAP-001-E3-S2-followup` at
`5e7f04c698bac0605ae96353d3c93321db3c1ea8`; none is quoted from the evidence
file or from a prior report. Working directory for all of them:
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-run-E3-S2-root/FactorFlow-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_package_boundary.py` | repo root | 0 | PASS | 86 passed in 0.24s — narrowest story-relevant scope, run first (53 at version 3) |
| `uv run pytest -q -m 'not postgres'` | repo root | 0 | PASS | 340 passed, 87 deselected, 2 warnings in 12.88s |
| `uv run pytest -q` | repo root | 0 | PASS | 427 passed, 2 warnings in 25.68s — full suite; Docker daemon confirmed up beforehand (`docker info`) |
| `uv run ruff check .` | repo root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | repo root | 0 | PASS | 117 files already formatted |
| `uv run mypy src` | repo root | 0 | PASS | Success: no issues found in 34 source files |
| `uv build` | repo root | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |

Supporting commands, all read-only:
`bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack`
(exit 0, PASSED);
`python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>`
(`sha256:9210129…`, identical to the story's approved `reviewed_revision`);
`python3 scripts/pipeline-state.py code-revision --repo-dir <worktree>`
(`sha256:5d04586…`).
`python3 scripts/pipeline-state.py check … --stage adversarial-review` reports
`BLOCKED — story coding has not reached in-review` because it reads
`repos/factorflow-v2/FactorFlow-v2`, which is checked out on
`usr/alvaro-de-jodra/CAP-001-E4-tasks` where this story still reads
`status: planning`. On the branch actually under review the story reads
`status: in-review`, so the stage is correct and the tool's answer is an
artifact of the checkout, not of this story. This is recorded rather than
treated as a blocker.

### Mutation reproduction

Six mutations were built and executed by this reviewer against a copy of
`src/factorflow` placed in a scratch directory outside the repository and
shadowed onto `PYTHONPATH`. No repository file was modified at any point. The
unmutated baseline in that scratch tree is `70 passed`, matching the evidence
file's `initial_green`.

| Mutation reproduced | How | Observed |
|---------------------|-----|----------|
| `mutation-9` — pinned zone unresolvable | `America/Los_Angeles` → `No/Such_Zone` in a scratch copy of `test_massive_bars.py` | **1 failed** at `test_massive_bars.py:108`, the self-verification assertion (`date(2024, 1, 2) != date(2024, 1, 1)`), exactly as recorded. The v3/IR-001 failure mode is closed. |
| `mutation-10` — history floor raised | `_MIN_PLAUSIBLE_MILLIS` `1_000_000_000_000` → `1_100_000_000_000` | **1 failed, 69 passed**: `test_earliest_massive_advanced_bar_is_within_millis_bound` raises `ValidationError` for the 2003-09-01 bar |
| `mutation-11` — statement domain narrowed | `Literal[…4 values]` → `Literal["balance_sheet", "ratios"]` | **2 failed, 68 passed**: `test_each_known_statement_type_is_accepted[income_statement]` and `[cash_flow_statement]` |
| `mutation-12` — action domain narrowed | `Literal[…4 values]` → `Literal["split", "dividend"]` | **9 failed, 61 passed**: the `ticker_change` and `ipo` accepted-domain cases plus four merged E3-S1 `fetch_corporate_actions` tests. Recorded as `2 failed, 2 passed`, true for the single test in isolation. |
| `mutation-13` — ticker-change date dropped | `CorporateAction.value_payload()` filters out the `date` key | **1 failed, 69 passed**: `test_ticker_change_payload_deliberately_retains_provider_keys` |
| `mutation-14` — package model replaced by a dict | `CorporateAction = {"action_type": "split"}` appended to `massive/__init__.py` | **2 failed, 1 passed** in the boundary module (identity re-export and raw-dictionary guards), matching the recorded outcome |

Two additional mutations of this reviewer's own design, not claimed by the
evidence file:

| Extra mutation | Observed |
|----------------|----------|
| Drop `tz=UTC` from `_millis_to_utc_session_date`, run under `TZ=UTC` | **1 failed, 20 passed** — TC-COMP-216 still discriminates the original v2/IR-001 defect on a UTC host |
| Export `massive.exceptions.BadResponse` through `__all__` | **2 failed, 1 passed** — the boundary test catches an SDK type |
| Export `RAW_WIRE_PAGE = [{"t": 1, "o": 2}]` through `__all__` | **3 passed** — the boundary test does *not* catch a raw wire row collection. Basis for IR-001. |

Further read-only probes, in a throwaway interpreter against the installed
package: `"fiscal_period" in FinancialStatement.model_fields` → `False`;
`MAX_FAILURE_REASON_VARIABLE_TEXT` is an `int` with `__module__ is None`,
which is what drives `_export_origin`'s fallback;
`datetime.fromtimestamp(1062374400, tz=UTC)` → `2003-09-01T00:00:00+00:00`;
`client.py:125` pairs `list_financials_ratios` with `"ratios"`;
`migrations/0002_observations.sql:41` declares `fiscal_period text NOT NULL`
with no `CHECK`.

The two `pytest` warnings are pre-existing third-party `anyio`/`starlette`
deprecation notices from `.venv`, unrelated to this story.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` → empty; `HEAD` `5e7f04c698bac0605ae96353d3c93321db3c1ea8`
- After: `git status --porcelain=v1 --untracked-files=all` → empty; `HEAD` unchanged
- Unexpected tracked-file changes: none. `uv build` wrote `dist/`, which `.gitignore` excludes. All mutant copies were written under `/tmp`, never into the repository. No branch was switched, no ref moved, nothing was fetched, pulled, reset, or committed.

## Findings

### IR-001 — the new package-boundary test declares every builtin-typed export product-owned, so a raw wire row collection crosses it undetected

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12
- **Tasks**: T009
- **Files**: `tests/unit/test_massive_package_boundary.py:16-24` (`_export_origin`), `:38-46`, `:49-56`
- **Claim challenged**: `test_public_surface_contains_no_raw_dictionary_or_massive_sdk_value`'s docstring states "raw wire dictionaries and Massive SDK values stay inside", and `test_every_public_export_is_product_owned`'s states that "exported code/types originate below `factorflow.*`".
- **Observed evidence**: reproduced by mutation. `_export_origin` returns `getattr(value, "__module__", None)`, then `type(value).__module__`, and when that is `builtins` it returns the boundary package's own name — which trivially satisfies both `startswith("factorflow.")` and `not startswith("massive")`. Appending `RAW_WIRE_PAGE = [{"t": 1, "o": 2}]` to `massive/__init__.py`'s `__all__` leaves the module green (`3 passed`), even though a list of raw wire dicts is precisely what T009 forbids. The `isinstance(value, dict)` guard only catches a bare dict; a list, tuple, or set of dicts, or a JSON string, all pass. The fallback exists for a real reason — `MAX_FAILURE_REASON_VARIABLE_TEXT` is an `int` and has no `__module__` — but it is applied to every builtin-typed value rather than to an explicitly allowed set.
- **Expected evidence/behavior**: `adversarial-review` SKILL.md §E.3 requires that a plausible regression make the test fail. T009 forbids exposing "Massive SDK response types or raw wire dictionaries beyond the package boundary", and the new test is the only durable enforcement of that prohibition.
- **Impact**: MEDIUM and forward-looking. Nothing in the current `__all__` is a raw wire value — verified by resolving all 15 names — so DAC-E3-12 holds today and no acceptance criterion is unsatisfied. The exposure is that the guard reads stronger than it is, so a later convenience export of a wire-shaped constant would land silently in the one test written to prevent it.
- **Required remediation**: replace the blanket builtin fallback with an explicit allow-list of the scalar constants the boundary intends to export (today, `MAX_FAILURE_REASON_VARIABLE_TEXT`), and fail any other builtin-typed export; or recurse the raw-value check through list, tuple, and set members so a collection of dicts is rejected the way a bare dict already is. Either way, narrow the two docstrings to what the test actually enforces.

### IR-002 — the new `_MIN_PLAUSIBLE_MILLIS` rationale cites a design section that does not contain the fact it rests on

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py:68-77`
- **Claim challenged**: the rewritten comment states that "`component-design-ingestion-api.md` section 3 pins its current floor to September 2003".
- **Observed evidence**: `grep -n 2003 component-design-ingestion-api.md` returns exactly one line, 221, inside **§2.4a "Request bounds: the canonical set"** — the `MAX_HISTORY_DEPTH_YEARS` row, which reads "Advanced reaches back to September 2003". Section 3 of that document begins at line 258 ("Constraints and Assumptions") and contains no mention of 2003, of Advanced, or of history depth. The other half of the citation is accurate: `docs/constitution/tech-stack.md:429` does record "Stocks Advanced … 20+ years" in the plan-tier table.
- **Expected evidence/behavior**: v3/IR-002's remediation was to "record the actual basis in the comment — Massive Advanced's September 2003 floor, cited to `tech-stack.md`". A citation is only useful if it resolves; this one sends a reader to a section that will make them conclude the comment is wrong.
- **Impact**: low, documentation-only. The bound itself is correct and is now pinned by `test_earliest_massive_advanced_bar_is_within_millis_bound`, so the substance of v3/IR-002 is closed. The cost is a reader who cannot confirm the premise, on the one comment written specifically so the premise would not have to be remembered.
- **Required remediation**: change the citation to `component-design-ingestion-api.md` §2.4a (the `MAX_HISTORY_DEPTH_YEARS` row), or drop the section number and cite the document and row.

### IR-003 — a sibling story's task plan was rewritten inside this story's coding change set, and this story's own evidence still describes that work as pending

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (process/scope)
- **Tasks**: N/A — no E3-S2 task authorizes this file
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md` (lines 10, 17, 38, 48, 79, 99, 131, 136, 170, 185, 190); `docs/.../CAP-001-E3-S2-tdd-evidence.yaml:139-159`
- **Claim challenged**: the E3-S2 task plan's own Notes entry states that "**CAP-001-E4-S3 implementation planning** must incorporate and test that derivation", and the E3-S2 TDD evidence records the item as "Flag for CAP-001-E4-S3 implementation planning: add the derivation and covering writer test", describing the propagation as owed rather than done.
- **Observed evidence**: commit `5e7f04c`, a single `test(CAP-001-E3-S2)` commit on the E3-S2 follow-up branch, is the only commit since `origin/main` that touches `CAP-001-E4-S3-tasks.md`, and it rewrites task T002's mandated assertions, task T010's implementation instruction, T010's dependency list, the Story Dependencies list, the Story-Specific Validation list, a Notes entry, and the Open Gaps section. `story-coding` SKILL.md constraint 9 reads "**Project repo edits: metadata only** — you may update story status fields and mark tasks as complete in the tasks file", and directs that issues found during implementation be noted "as follow-up items". The E3-S2 TDD evidence's `review_v3_rework.description` scopes the change to "Tests and comments only: close review-v3 IR-001 through IR-004, add the DAC-E3-12/T009 package-boundary regression" and never mentions the E4-S3 edit, so this story's own record of what it changed is incomplete.
- **Expected evidence/behavior**: constraint 7 of this review requires every change in the set to be justified by the story or task plan. The content of the propagation is correct and internally consistent — `FY` / `Q{fiscal_quarter}` is compatible with `migrations/0002_observations.sql:41` (`text NOT NULL`, no `CHECK`), the T010 dependency was correctly extended to T002 to keep the derivation test-first, and the new Open Gaps entry properly names `component-design-observation-writer.md` as the owning design. The defect is that a phase-gated planning artifact for another epic was edited by a story-coding run whose own plan assigned that edit to E4-S3's implementation-planning phase, and that the edit is unrecorded in the evidence file that is supposed to describe this change set.
- **Impact**: MEDIUM. No E3-S2 acceptance criterion, task, test, or validation command is affected, and no product behavior changed — which is why this is not a gate failure. Downstream, E4-S3's plan now contains requirements that did not pass through its own planning gate, and its Open Gaps section changed from "None" to a real open gap; a reader reconciling the E3-S2 evidence against the diff will find the evidence silent on the largest documentation change in the commit.
- **Required remediation**: either (a) record the propagation explicitly in `CAP-001-E3-S2-tdd-evidence.yaml` — change `open_items[0]` from a flag to a completed action naming `CAP-001-E4-S3-tasks.md` and the lines changed, and extend `review_v3_rework.description` to say the change set is not tests-and-comments-only — and have the owner acknowledge the out-of-phase edit; or (b) revert the `CAP-001-E4-S3-tasks.md` change from this story's branch and let `$implementation-planning` re-emit it for E4-S3 under its own gate. Do not leave the edit in place while the evidence describes it as pending.

### IR-004 — `CAP-001-E4-S3-tasks.md`'s `ai_provenance` attributes the edit to a planning run that the commit history does not show

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (provenance)
- **Tasks**: N/A
- **Files**: `docs/.../CAP-001-E4-S3-tasks.md:11-30`
- **Claim challenged**: the file's `ai_provenance` block now reads `agent_id: implementation-planning-agent`, `model: gpt-5.6`, `tool: Codex`, `timestamp: 2026-09-21T02:24:44Z` — asserting that an implementation-planning run under Codex/gpt-5.6 produced this revision.
- **Observed evidence**: `git log --format='%an <%ae>%n%B' -1 5e7f04c` shows the only commit carrying this change was authored by `Alvaro de Jodra <ajodraca@gmail.com>` with `Co-Authored-By: Devin`, message `test(CAP-001-E3-S2): pin provider model boundaries`, body "…and assign fiscal-period derivation to the E4 observation writer" — i.e. the edit was made by this story's coding run, not by a separate Codex planning session. `git log --all -- <that file>` shows no other commit since `origin/main`. `artifact_version` correctly stayed at `1` (the artifact is `status: draft`, and the contract bumps only approved artifacts), so the version field is not the issue; the agent, model, and tool fields are.
- **Expected evidence/behavior**: AGT-PROV-001 requires `ai_provenance` to identify the agent, model, and tool that actually produced the revision. An accurate block is what lets a later reader tell a gated planning output from an ad-hoc edit — exactly the distinction IR-003 turns on.
- **Impact**: low on its own; it compounds IR-003 by making an out-of-phase edit look like the product of the phase that was skipped.
- **Required remediation**: correct the block to name the agent, model, and tool that actually made the change, or — if option (b) of IR-003 is taken and a real `$implementation-planning` run re-emits the file — let that run write its own provenance.

### IR-005 — TC-COMP-219 has no traceability comment anywhere in the test suite

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-5
- **Tasks**: T004
- **Files**: `tests/unit/test_massive_financials.py:120-128`; `tests/unit/test_massive_bars.py:150-157`
- **Claim challenged**: T004 names TC-COMP-219 among the cases it implements, and the Phase 2 checkpoint states that "TC-COMP-005, TC-COMP-206, and TC-COMP-215 through TC-COMP-219 are represented with traceability comments".
- **Observed evidence**: a repository-wide search for `TC-COMP-219` returns only the task plan, the three earlier review reports, the coverage matrix, and the component test spec — no file under `tests/`. Its four siblings are all cited in code (`TC-COMP-215`, `TC-COMP-216` in `test_massive_bars.py`; `TC-COMP-005`, `TC-COMP-217`, `TC-COMP-218` in `test_massive_financials.py`). The behavior itself is covered: `test_fiscal_quarter_is_optional_for_annual_statements` and `test_otc_flag_is_optional_and_absence_is_not_false` both assert `is None` against a real alternative, and both were re-executed here.
- **Expected evidence/behavior**: the checkpoint requires the mapping to be visible in code, which is how every other mapped case in these modules is recorded, and how the coverage matrix stays auditable.
- **Impact**: low and pre-existing — this predates the follow-up and was not flagged by versions 1 through 3. Nothing is untested; the link from the component test specification to the code is the only thing missing, and it breaks the automated traceability the coverage matrix depends on.
- **Required remediation**: add `TC-COMP-219` to the docstrings of `test_fiscal_quarter_is_optional_for_annual_statements` and `test_otc_flag_is_optional_and_absence_is_not_false`, matching how TC-COMP-215 through TC-COMP-218 are cited in the same files.

## Previous Review Disposition

Every version 3 finding was re-tested against the current tree by mutation or
direct probe. None is recorded as resolved on the follow-up's say-so.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-001 (LOW) — TC-COMP-216's timezone pin fails open when the tz database is unavailable | **RESOLVED** | `tests/unit/test_massive_bars.py:96-119` now uses `monkeypatch.context()` (the remediation's suggested mechanism) and asserts at line 108 that the pin took effect before testing the conversion. Mutant-verified by this reviewer: with the zone replaced by `No/Such_Zone`, the test fails at line 108 rather than passing vacuously. The original v2/IR-001 defect is still caught too — dropping `tz=UTC` fails the test under `TZ=UTC`. |
| v3/IR-002 (LOW) — the Unix-milliseconds bound is safe only because of a provider fact stated nowhere near it | **RESOLVED**, with a residual | `models.py:68-77` now records the provider basis (Advanced's 20+ years, September 2003 floor) instead of the digit-count rationale, and `test_earliest_massive_advanced_bar_is_within_millis_bound` pins the coupling. Mutant-verified: raising `_MIN_PLAUSIBLE_MILLIS` to `1_100_000_000_000` fails the new test. Residuals: one of the two citations points at the wrong section (carried as IR-002 here), and `_MAX_PLAUSIBLE_MILLIS` remains uncovered — which v3 marked optional. |
| v3/IR-003 (LOW) — no test pins the accepted half of the `statement_type` domain | **RESOLVED** | `test_each_known_statement_type_is_accepted` (4 parametrized cases) and `test_each_known_action_type_is_accepted` (4 cases) now pin both DDL domains, with the rejection halves retained as `test_unknown_statement_type_is_rejected` and `test_unknown_action_type_is_rejected`. The remediation's explicit suggestion to close the identical actions gap in the same pass was followed. Mutant-verified on both models. |
| v3/IR-004 (LOW) — version 2's IR-005 remediation landed only its documentation half | **RESOLVED** | `test_massive_actions.py:194-208` asserts the exact ticker-change payload key set `{action_type, date, effective_on, ticker_change, type}`, pinning the deliberate retention the docstring at `models.py:313-321` records. Mutant-verified: filtering `date` out of `CorporateAction.value_payload()` fails it. |

### Carried items from version 3's Follow-Up

| Item | Disposition | Current Evidence |
|------|-------------|------------------|
| v2/IR-006 — `fundamental_observation.fiscal_period` has no producer | **DECIDED AND PROPAGATED** | An attended owner decision dated 2026-09-20 assigns the derivation to CAP-001-E4's observation writer and forbids a `fiscal_period` field on `FinancialStatement`. Verified: the field is still absent from `FinancialStatement.model_fields`; the decision is recorded in `CAP-001-E3-S2-tasks.md:161` and in `CAP-001-E3-S2-tdd-evidence.yaml`'s `open_items[0]`; and `CAP-001-E4-S3-tasks.md` carries it in T002, T010, Story Dependencies, Story-Specific Validation, Notes, and Open Gaps. The mapping is compatible with the DDL (`fiscal_period text NOT NULL`, no `CHECK`). The decision and its content are sound; the *mechanism* by which the E4-S3 plan was edited is IR-003, and its provenance is IR-004. |
| The cross-story `"ratio"` / `"ratios"` mismatch | **RESOLVED ON MAIN** | Verified independently: `src/factorflow/ingestion/massive/client.py:125` pairs `list_financials_ratios` with `"ratios"`, matching `FinancialStatement`'s `Literal` and the `fundamental_statement_known` CHECK, and `tests/unit/test_massive_financials.py:241::test_fetch_financials_labels_ratios_rows_with_the_ddl_statement_type` covers the integrated seam. The evidence file's `status: resolved-on-main` is accurate. |

## Scope and Plan Deviations

- **Justified deviation** — `tests/unit/test_massive_package_boundary.py` is a fifth test module; T001 enumerates four. T009's prohibition ("do not expose Massive SDK response types or raw wire dictionaries beyond the package boundary") previously had no dedicated regression, and a separate module for a package-level invariant matches the repository's existing layout. Accepted; its strength is assessed under IR-001.
- **Out-of-scope change** — `docs/.../CAP-001-E4-S3-tasks.md` belongs to a different epic's story and is edited substantively by this change set. See IR-003.
- **Bookkeeping inconsistency** — `CAP-001-E3-S2-tdd-evidence.yaml`'s `review_v3_rework.description` says "Tests and comments only", which the E4-S3 task-plan edit contradicts; `open_items[0]` still frames the E4-S3 propagation as a flag for future planning after it has been performed. Folded into IR-003.
- **Bookkeeping note, not a finding** — `CAP-001-E3-S2.md` moved backwards from `status: docs-sync` to `status: in-review`. This is correct for a re-review, and its content revision is unchanged from the approved `reviewed_revision`, so no approval was invalidated.
- **Tooling note, not a finding** — `scripts/pipeline-state.py check … --stage adversarial-review` reports `BLOCKED` because it reads `repos/factorflow-v2/FactorFlow-v2`, which is on a different branch. The branch under review reads `status: in-review`. Recorded for transparency; it did not affect the verdict.
- No `pyproject.toml`, `uv.lock`, migration, configuration, or production-behavior change appears in this change set.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-001-E3-S2 with the five warnings below recorded. Before or during E4-S3's next planning or coding run, resolve IR-003 and IR-004 by one of the two routes IR-003 names, so `CAP-001-E4-S3-tasks.md` carries provenance matching how it was produced. IR-001, IR-002, and IR-005 are test-strength and traceability improvements that may be folded into any later pass touching these files; none blocks doc sync.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-003 (MEDIUM), IR-002 (LOW), IR-004 (LOW), IR-005 (LOW)
