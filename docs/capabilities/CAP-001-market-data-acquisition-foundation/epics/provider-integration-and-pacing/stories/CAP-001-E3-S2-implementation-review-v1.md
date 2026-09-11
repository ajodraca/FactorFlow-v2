---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
story_id: "CAP-001-E3-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-11T22:22:36Z"
reviewed_head: "433c13c58a1aee090889bc6b9521bf245fc84bc9"
review_base: "be332b1fde1176929c605c3d1ff04edd2a8630dc"
reviewed_state_revision: "sha256:b1ee626f62bb1bdd45bc1186b2a9e4c107d028d528a139285346566f2beafb2f"
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
  timestamp: 2026-09-11T22:22:36Z
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

# Implementation Review: CAP-001-E3-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 4 |
| Low findings | 4 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

Every acceptance criterion traces to concrete production code in
`src/factorflow/ingestion/massive/models.py` and to at least one test that
genuinely discriminates against the defect it exists to prevent. All ten
planned tasks have corroborating implementation evidence; no task was found
checked without it, and no changed file lacks a story or task justification.
Every constitution-defined and story-specific validation command was rerun
independently and passed, leaving the working tree clean.

The findings below are all MEDIUM or LOW and none of them makes an acceptance
criterion, a required task, or a required validation incomplete. The four
MEDIUM findings concern hardening and test discrimination: one mandatory test
(TC-COMP-216) proves the timezone property only because the reviewing host is
not UTC; the `Decimal` guarantee is enforced only at the top level of the
retained provider payload; `FinancialStatement.statement_type` and `timeframe`
are unconstrained strings where the persistence contract and the sibling
`CorporateAction.action_type` both constrain their domain; and `DailyBar`
accepts a timestamp that is not Unix milliseconds without complaint. The
production behavior the story asks for is present and correct in each case, so
these are recorded as warnings carried into Doc Sync rather than as blockers.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (worktree `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-run-E3-S2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S2` |
| HEAD | `433c13c58a1aee090889bc6b9521bf245fc84bc9` |
| Review base | `origin/main` merge-base `be332b1fde1176929c605c3d1ff04edd2a8630dc` |
| Working tree | clean — `git status --porcelain=v1` returned no entries before or after validation; no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 20 (5 commits, all committed; no uncommitted work) |

The review set is exactly the committed range `be332b1..433c13c`. Because the
working tree is clean, the committed range is the complete change set.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/__init__.py` | added | T001 |
| `src/factorflow/ingestion/massive/__init__.py` | added | T001; T009 |
| `src/factorflow/ingestion/massive/models.py` | added | T001; T007; T008 |
| `tests/unit/test_massive_reference.py` | added | T001; T002; T006 |
| `tests/unit/test_massive_bars.py` | added | T001; T002; T003; T006 |
| `tests/unit/test_massive_financials.py` | added | T001; T002; T004; T006 |
| `tests/unit/test_massive_actions.py` | added | T001; T002; T005; T006 |
| `tests/fixtures/massive/reference_active.json` | added | T002 (recorded fixture per data type, story Testing) |
| `tests/fixtures/massive/reference_delisted.json` | added | T002 |
| `tests/fixtures/massive/bar_regular.json` | added | T003 |
| `tests/fixtures/massive/bar_otc.json` | added | T003 |
| `tests/fixtures/massive/financial_annual.json` | added | T004 |
| `tests/fixtures/massive/financial_quarterly.json` | added | T004 |
| `tests/fixtures/massive/action_split.json` | added | T005 |
| `tests/fixtures/massive/action_dividend.json` | added | T005 |
| `tests/fixtures/massive/action_ticker_change.json` | added | T005 |
| `tests/fixtures/massive/action_ipo.json` | added | T005 |
| `docs/.../CAP-001-E3-S2-tasks.md` | modified | Task-state bookkeeping only (T001–T010 checkboxes) |
| `docs/.../CAP-001-E3-S2.md` | modified | Lifecycle only (`status: planning` → `in-review`) |
| `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` | added | T010 (the task names this exact path) |

No file in the change set lacks a justification. No production file outside
`src/factorflow/ingestion/` was touched, no dependency or configuration file
was modified, and `pyproject.toml`/`uv.lock` are unchanged — consistent with
T001's checkpoint that Pydantic is already available transitively.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E3-12 | SATISFIED | `models.py` — every wire name appears only inside `Field(alias=...)`; all public attributes (`company_name`, `is_active`, `open_price`, `fiscal_period_end`, `provider_filing_date`, `effective_on`) are product vocabulary. `massive/__init__.py` re-exports only the four model types, no SDK type or raw dict. | `test_massive_reference.py::test_parses_wire_shape_into_product_vocabulary` (asserts `not hasattr` for `name`/`active`/`type`); `test_massive_bars.py::test_parses_wire_shape_into_product_vocabulary` (asserts `not hasattr` for all eight one-letter keys); `test_massive_financials.py::test_parses_wire_shape_into_product_vocabulary` | Verified independently: `TickerReference.value_payload()` returns only product-named keys. The retained JSONB payload of `CorporateAction` does carry provider key names — sanctioned by the task plan's Notes and recorded as IR-005 (LOW), not as a failure of this AC, since the models themselves name every field in the product's vocabulary. |
| AC-5 | SATISFIED | `FinancialStatement.provider_filing_date: date = Field(alias="filing_date")` with a docstring stating it is descriptive only and must never serve as the observation date; no model declares `observed_on`, `run_id`, or `recorded_at`. | `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only`; `::test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata` | Cross-checked against `component-design-observation-writer.md` §2.3–2.4: `observed_on` is writer-supplied and the hash is value-only. No model field could be mistaken for an as-of date. TC-COMP-005's story-scoped portion is what is testable here; the append/restatement behavior belongs to CAP-001-E4. |
| DAC-E3-S2-1 | SATISFIED | `DailyBar` maps `t`→`session_date`, `o`→`open_price`, `h`→`high_price`, `l`→`low_price`, `c`→`close_price`, `v`→`volume`, `vw`→`vwap`, `n`→`transaction_count`. | `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` asserts all eight values, not merely their presence. | All eight are required; verified by the parametrized `test_missing_required_field_fails_validation` over each of the eight keys. |
| DAC-E3-S2-2 | SATISFIED | `DailyBar._millis_to_utc_session_date` (`mode="before"` validator) uses `datetime.fromtimestamp(value / 1000, tz=UTC).date()`, explicitly timezone-aware, running before Pydantic's own `date` coercion. | `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc`, including the 1 ms-before-midnight boundary (`1704153599999` → `2024-01-01`). | Production code is unambiguously correct. The *test's* ability to detect a naive conversion depends on the host timezone — see IR-001 (MEDIUM). The AC itself is satisfied by the production evidence. |
| DAC-E3-S2-3 | SATISFIED | Every price/ratio/monetary field is `Decimal`; `_coerce_extra_numeric_fields_to_decimal` converts retained provider line items via `Decimal(str(v))` rather than `Decimal(float)`, and explicitly skips `bool` (which is an `int` subclass). | `test_massive_bars.py::test_no_field_is_typed_float`; `test_massive_financials.py::test_monetary_values_are_decimal_not_float`; `test_massive_actions.py::test_split_ratio_values_are_decimal_not_float` and `::test_dividend_cash_amount_is_decimal_not_float` | Independently probed: wire `187.15` yields `Decimal('187.15')`, not `Decimal('187.1499…')`. Coercion is top-level only — see IR-003 (MEDIUM). |
| DAC-E3-S2-4 | SATISFIED | No required field carries a default; validation failures surface as Pydantic `ValidationError`, which CAP-001-E3-S3 maps to `ProviderContractViolation` per `component-design-massive-client.md` §2.4. | Parametrized `test_missing_required_field_fails_validation` in all four test modules, covering 5 + 8 + 7 + 2 = 22 distinct required-field deletions. | Deleting the *wire* key is a genuine test because `populate_by_name=True` would otherwise allow the field name; neither spelling is present after deletion. |
| DAC-E3-S2-5 | SATISFIED | `TickerReference.delisted_utc`, `DailyBar.is_otc`, `FinancialStatement.fiscal_quarter` are `X \| None = None`; no zero or `False` substitute anywhere. | `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false` (asserts `None`, and `True` when present); `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements`; `test_massive_reference.py::test_active_instrument_has_no_delisted_timestamp` | The bar test discriminates `None` from `False` specifically, which is the distinction the AC names. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/massive/__init__.py`, `src/factorflow/ingestion/massive/models.py`, and the four `tests/unit/test_massive_*.py` modules all exist at the planned paths. | Checkpoint confirmed: all four modules collect and run; `pyproject.toml`/`uv.lock` unchanged, so the "no additional dependency" claim holds. |
| T002 | complete | VERIFIED | TC-COMP-206 realized as `test_parses_wire_shape_into_product_vocabulary` in the reference, bars and financials modules plus the four action-mapping tests. | Assertions check values and the absence of wire-named attributes, not merely that parsing succeeded. |
| T003 | complete | VERIFIED | `test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215) and `test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216) in `tests/unit/test_massive_bars.py`. | TC-COMP-216's discrimination is environment-dependent — IR-001. The task itself is implemented at the planned path. |
| T004 | complete | VERIFIED | `test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005), `test_monetary_values_are_decimal_not_float` (TC-COMP-217), `test_missing_required_field_fails_validation` (TC-COMP-218), `test_fiscal_quarter_is_optional_for_annual_statements` (TC-COMP-219). | The task's wording "distinguish an absent optional value from `Decimal("0")`" is met by asserting `is None`, which is strictly stronger than a not-equal-to-zero assertion. |
| T005 | complete | VERIFIED | `test_split_maps_to_a_product_named_action`, `test_dividend_…`, `test_ticker_change_…`, `test_ipo_…` in `tests/unit/test_massive_actions.py`, each driven by its own recorded fixture. | Each asserts `action_type` plus the endpoint-specific date correctly resolved to `effective_on` — `execution_date`, `ex_dividend_date`, `date`, `listing_date` respectively, matching `component-design-massive-client.md` §2.5. |
| T006 | complete | VERIFIED | `test_value_payload_…` present in all four test modules; asserts `json.dumps` succeeds, `Decimal` values serialize as strings (`"187.15"`, `"352755000000"`, `"0.25"`), and `observed_on`/`run_id`/`recorded_at` are absent. | Independently confirmed the payload is compatible with `component-design-observation-writer.md` §2.3 `canonical_json`. |
| T007 | complete | VERIFIED | The four model classes in `models.py`, each with aliases, `Decimal` typing, optionality matching the provider contract in §2.5, and an explicit `provider_filing_date` docstring. | Deviations recorded as IR-002 (unconstrained `statement_type`/`timeframe`) and IR-006 (no `fiscal_period` field for a `NOT NULL` column). Neither leaves a planned field unimplemented; both are hardening gaps. |
| T008 | complete | VERIFIED | `_millis_to_utc_session_date`, `value_payload()` on all four models, `_coerce_extra_numeric_fields_to_decimal`. No hashing and no writer metadata were added, as the task forbids. | The "reject … rather than silently coercing" clause is met for missing and type-invalid input (22 parametrized cases prove it) but not for a plausibly-typed wrong-magnitude `t` — IR-004 (MEDIUM). Judged VERIFIED rather than PARTIAL because no source of truth specifies timestamp magnitude validation. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/massive/__init__.py` imports and re-exports exactly `CorporateAction`, `DailyBar`, `FinancialStatement`, `TickerReference` via `__all__`; no SDK type, no dict passthrough. | Checkpoint confirmed by import: `from factorflow.ingestion.massive import DailyBar` resolves. |
| T010 | complete | VERIFIED | `CAP-001-E3-S2-tdd-evidence.yaml` records four RED→GREEN cycles with commit hashes matching the five branch commits, and five manual mutations covering exactly the five subjects the task names (bar alias, timestamp conversion, `Decimal` annotation, required field, optional field). | Spot-checked the recorded commits against `git log`: `20d1842`, `7393560`, `883700d`, `2099be9` all exist and match their described content. Mutation 2's recorded "caught" result is real on this host but would not reproduce under `TZ=UTC` — IR-001. |

Dependency and phase ordering were checked against the commit history rather
than the checkboxes: commits `20d1842`, `7393560`, `883700d`, `2099be9` land
one model at a time with its tests, and `433c13c` adds the T010 evidence last,
which is the order the plan's dependency section requires.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_massive_reference.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts eight concrete parsed values *and* that `name`/`active`/`type` are not attributes. Would fail if an alias were dropped or a wire name re-surfaced. | none |
| `test_massive_bars.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts none of the eight one-letter keys survives as an attribute. Paired with the value assertions in TC-COMP-215, it is not vacuous. | none |
| `test_massive_financials.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts renamed values and the absence of `period_end`/`filing_date` attributes. | none |
| `test_massive_actions.py` four mapping tests / TC-COMP-206 | ADEQUATE | Each uses a distinct recorded fixture and asserts the endpoint-specific date resolves to the product-named `effective_on`. `test_only_the_four_known_action_types_are_accepted` proves the `Literal` domain matches the DDL's `corporate_action_type_known` CHECK. | none |
| `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` / TC-COMP-215 | ADEQUATE | Asserts all eight values with exact `Decimal` comparison. Independently confirmed sensitive: renaming any alias makes the field required-and-missing, so it fails. | none |
| `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` / TC-COMP-216 | WEAK | Asserts `1704153600000` → `2024-01-02` and `1704153599999` → `2024-01-01`. Correct expectations, and it does catch a dropped `tz=UTC` on this (UTC+2) host. | Under `TZ=UTC` a naive `datetime.fromtimestamp()` produces identical dates for both inputs, so the test cannot fail for the exact defect it targets in a UTC environment. See IR-001. The first assertion, `datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)`, is a convoluted restatement of `date(2024, 1, 2)` and proves nothing the next line does not. |
| `test_massive_financials.py::test_monetary_values_are_decimal_not_float` / TC-COMP-217 | ADEQUATE | Asserts both `==` against an exact `Decimal` and `isinstance(..., Decimal)` for a monetary value and a ratio, across two fixtures. Catches the `Decimal`→`float` mutation. | Does not cover nested provider structures — IR-003. |
| `test_massive_*::test_missing_required_field_fails_validation` / TC-COMP-218 | ADEQUATE | 22 parametrized cases across four models, each deleting a required wire key and asserting `ValidationError`. Verified each case fails for the intended reason (field required), not incidentally. | none |
| `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false` / TC-COMP-219 | ADEQUATE | Asserts `is None` for the absent case and `is True` for the present case, which discriminates `None` from `False` — the distinction the AC is about. | none |
| `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements` / TC-COMP-219 | ADEQUATE | Both branches asserted against separate fixtures. | none |
| `test_massive_*::test_value_payload_*` (T006, four modules) | ADEQUATE | Asserts JSON-serializability, exact decimal-string values, and absence of all three writer-owned keys. Catches a `mode="json"` regression and any leak of writer metadata. | Asserts absence of writer keys but not the presence of product-named keys only; the `CorporateAction` payload's provider-named keys go unasserted — IR-005. |
| `test_massive_*::test_no_*field_is_typed_float` | ADEQUATE | Introspects `model_fields` annotations. Slightly tautological in isolation, but the recorded mutation 3 confirms it fails on a `Decimal`→`float` change. | Cannot see undeclared (extra) fields, by construction. |

Isolation and determinism: all four modules are pure, read only local JSON
fixtures through a path resolved from `__file__`, touch no network, no clock,
no database, and no shared state. Running the four story modules alone
(48 tests, 0.08 s) and within the full suite (240 tests) produced identical
results, so there is no order dependence. No mocks are used — the unit under
test is exercised directly, so no mock can make an expected result inevitable.
The single environment dependence found is TC-COMP-216's timezone sensitivity
(IR-001).

## Independent Validation

All commands were run by this reviewer in the worktree, not taken from any
prior report.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py` | `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-run-E3-S2` | 0 | PASS | 48 passed in 0.08s (narrowest story-relevant scope, run first) |
| `uv run pytest -m 'not postgres'` | same | 0 | PASS | 181 passed, 59 deselected, 2 warnings in 13.04s |
| `uv run pytest` | same | 0 | PASS | 240 passed in 29.17s (full suite including the 59 postgres-marked tests) |
| `uv run ruff check .` | same | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | same | 0 | PASS | 86 files already formatted |
| `uv run mypy src` | same | 0 | PASS | Success: no issues found in 26 source files |
| `uv build` | same | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |

Story-specific validation from the plan was additionally confirmed by direct
inspection and by read-only probes of the built models: `DailyBar` maps every
required wire field and produces the DDL's `session_date`; no `float`-typed
field enters `daily_bar`; all payload decimals serialize as strings; payloads
omit `observed_on`, `run_id` and `recorded_at`; a missing required field raises
`ValidationError`; and an absent optional field is `None`, not zero.

The two `pytest` warnings are pre-existing third-party deprecation notices from
`starlette`/`fastapi` in `.venv`, unrelated to this change set.

### Validation Side Effects

- Before: `git status --porcelain=v1` → empty (clean tree, no untracked files)
- After: `git status --porcelain=v1` → empty (clean tree, no untracked files)
- Unexpected tracked-file changes: none. `uv build` wrote `dist/`, which is
  git-ignored and therefore produced no tracked-file change. No validation
  command modified a tracked file, so constraint 10 required no intervention.

## Findings

### IR-001 — TC-COMP-216 cannot detect a naive timestamp conversion on a UTC host

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T003, T010
- **Files**: `tests/unit/test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc`; `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` (`mutation-2-timestamp-conversion`)
- **Claim challenged**: the TDD evidence records that removing `tz=UTC` from `DailyBar._millis_to_utc_session_date` is caught by this test ("caught: true"), and T003 requires asserting a *timezone-aware* UTC conversion.
- **Observed evidence**: the test's two inputs are `1704153600000` and `1704153599999`. Evaluated directly under `TZ=UTC`, a naive `datetime.fromtimestamp(t/1000).date()` returns `2024-01-02` and `2024-01-01` — identical to the timezone-aware results, so both assertions still pass. On this host (UTC+2) the naive form returns `2024-01-01` for the first input, which is why the recorded mutation was caught. The discriminating power therefore comes from the host's timezone, not from the test.
- **Expected evidence/behavior**: skill constraint E.6 and the project's TDD discipline require a test to be free of environment dependence unless that dependence is explicitly controlled; T003 asks specifically for the timezone-aware property to be asserted.
- **Impact**: the only test guarding the AC whose entire subject is timezone ambiguity would silently stop guarding it in any UTC environment (a container, CI runner, or production host). A future regression to `datetime.fromtimestamp(t/1000)` would then ship undetected, and `daily_bar`'s natural key is append-only and unrepairable once written.
- **Required remediation**: make the assertion independent of the host timezone — for example by pinning a non-UTC `TZ` for the duration of the test (`monkeypatch.setenv("TZ", ...)` plus `time.tzset()`), or by asserting the validator's result equals the value computed with an explicit `tz=UTC` reference under a deliberately non-UTC ambient timezone. Also replace the vacuous first assertion `datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)` with a direct expectation. Re-record the mutation-2 evidence afterwards.

### IR-002 — `FinancialStatement.statement_type` and `timeframe` accept any string despite constrained domains

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12, DAC-E3-S2-4
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/massive/models.py` — `FinancialStatement.statement_type: str`, `FinancialStatement.timeframe: str`
- **Claim challenged**: T007 requires mapping to "the product fields required by … `fundamental_observation` … in `component-design-market-data-store.md` §2.3", and the model's own docstring says `statement_type` "remains required because the persistence contract requires it".
- **Observed evidence**: `FinancialStatement.model_validate({**financial_annual, "statement_type": "not_a_statement"})` succeeds and yields `statement_type == "not_a_statement"`; `{"timeframe": "weekly"}` likewise succeeds. `component-design-market-data-store.md` §2.3 constrains the column with `CONSTRAINT fundamental_statement_known CHECK (statement_type IN ('balance_sheet', 'income_statement', 'cash_flow_statement', 'ratios'))`, and `component-design-massive-client.md` §2.5 states `timeframe` is `quarterly` or `annual`. The sibling model in the same file does constrain its equivalent: `CorporateAction.action_type: Literal["split", "dividend", "ticker_change", "ipo"]`, mirrored by `corporate_action_type_known`.
- **Expected evidence/behavior**: the same treatment `CorporateAction.action_type` already receives — the model rejects a value the persistence contract forbids, so the failure surfaces as a Pydantic `ValidationError` that CAP-001-E3-S3 maps to `ProviderContractViolation`.
- **Impact**: an out-of-domain `statement_type` (from caller error or provider drift) passes parsing and fails later as a raw database CHECK violation inside the writer's per-instrument transaction, where it is not classifiable as a provider contract violation and aborts an append instead of being recorded as one instrument's failure.
- **Required remediation**: constrain `statement_type` to the four values in `fundamental_statement_known` and `timeframe` to `quarterly`/`annual`, following the `CorporateAction.action_type` pattern, and add a rejection test mirroring `test_only_the_four_known_action_types_are_accepted`.

### IR-003 — `Decimal` coercion of retained provider data is top-level only

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-3
- **Tasks**: T007, T008
- **Files**: `src/factorflow/ingestion/massive/models.py` — `_coerce_extra_numeric_fields_to_decimal`; used by `FinancialStatement._coerce_statement_values_to_decimal` and `CorporateAction._coerce_action_values_to_decimal`
- **Claim challenged**: the helper's docstring states it converts "every field not already declared on the model from `int` or `float` to `Decimal` … so no binary rounding enters a value that will be recorded permanently".
- **Observed evidence**: the helper iterates only `data.items()` at the top level. Probed directly: `FinancialStatement.model_validate({**financial_annual, "financials": {"assets": {"value": 0.1}}})` yields `model_extra["financials"]["assets"]["value"]` of type `float`, and `value_payload()` emits it as the JSON number `0.1`, not the string `"0.1"`. The repository already contains a nested provider shape — `tests/fixtures/massive/action_ticker_change.json` nests a `ticker_change` object — so nested provider data is not hypothetical here.
- **Expected evidence/behavior**: DAC-E3-S2-3 requires monetary and ratio values to be held as `Decimal` so no binary rounding enters recorded history; `component-design-observation-writer.md` §2.3 requires decimals to serialize as strings for a deterministic hash.
- **Impact**: a nested provider numeric reaches the JSONB payload and the SHA-256 value hash as a float. Per the writer design's own reasoning, that is the case where `123.45` and `123.450000000000003` can hash differently across runs — appending a duplicate row and defeating AC-6 — with no way to repair append-only history afterwards.
- **Required remediation**: make the coercion recurse into nested dicts and lists, and add a test using a nested provider structure asserting the nested value is `Decimal` and serializes as a string.

### IR-004 — `DailyBar` silently accepts a timestamp that is not Unix milliseconds

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2, DAC-E3-S2-4
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py` — `DailyBar._millis_to_utc_session_date`
- **Claim challenged**: T008 requires helpers that "reject unsupported or missing required input rather than silently coercing it".
- **Observed evidence**: the validator returns `value` unchanged for any non-numeric input, so `DailyBar.model_validate({..., "t": "2024-01-02"})` parses to `session_date == date(2024, 1, 2)` via Pydantic's ordinary date coercion. No magnitude check exists either: `{"t": 1704153600}` (the same instant expressed in seconds) parses to `session_date == date(1970, 1, 20)` without error.
- **Expected evidence/behavior**: `component-design-massive-client.md` §2.5 states `t` is Unix milliseconds; an input that is not milliseconds is provider drift, which §2.4 says must become a `ProviderContractViolation` rather than a value.
- **Impact**: a provider or SDK change from milliseconds to seconds, or to an ISO string, would write bars against wrong session dates into append-only history rather than failing loudly. This is precisely the "shape that parses cleanly and means something different" the component design names as the residual risk `ProviderContractViolation` exists to catch.
- **Required remediation**: have the validator accept only an integer/float and reject anything else, and add a plausibility bound so a seconds-scale or obviously out-of-range value raises rather than parsing. Cover both with tests. Recorded as MEDIUM rather than HIGH because no named source of truth mandates magnitude validation explicitly and the story's own ACs are met for well-formed input.

### IR-005 — Provider wire key names ride into the hashed `CorporateAction` payload

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12
- **Tasks**: T005, T006, T007
- **Files**: `src/factorflow/ingestion/massive/models.py` — `CorporateAction` (`extra="allow"`, `value_payload()`)
- **Claim challenged**: DAC-E3-12 states wire field names stay inside this component.
- **Observed evidence**: `CorporateAction.model_validate({**action_ticker_change, "action_type": "ticker_change", "effective_on": ...}).value_payload()` returns keys `['action_type', 'date', 'effective_on', 'ticker_change', 'type']`; the split variant returns `execution_date`, `split_from`, `split_to`, `adjustment_type`, `historical_adjustment_factor`. So `date` and `type` cross the package boundary as provider-named duplicates of the product-named `effective_on` and `action_type`. No test asserts anything about which keys the payload *may* contain.
- **Expected evidence/behavior**: the task plan's Notes sanction retaining "variant-specific provider content … in its JSONB payload", so provider-shaped payload content is a recorded decision; the redundant duplication of the natural key under provider names is not required by it.
- **Impact**: low — the payload is opaque JSONB and the writer reads the product-named fields. The duplication mildly weakens DAC-E3-12's intent and adds redundant bytes to the hashed value.
- **Required remediation**: either drop the provider-named duplicates of the natural key before building the payload, or add an explicit assertion and a one-line note in the model docstring recording that provider key names are deliberately retained inside the JSONB payload only. No redesign is needed.

### IR-006 — No model field supplies `fundamental_observation.fiscal_period`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/massive/models.py` — `FinancialStatement`; `docs/.../design/component-design-market-data-store.md` §2.3
- **Claim challenged**: T007 requires mapping "the product fields required by … `fundamental_observation` … in `component-design-market-data-store.md` §2.3".
- **Observed evidence**: the DDL declares `fiscal_period text NOT NULL`. `FinancialStatement` declares `fiscal_year`, `fiscal_quarter` and `timeframe`, but no `fiscal_period`. A repository-wide search finds `fiscal_period` only in that DDL — no component currently produces a value for it.
- **Expected evidence/behavior**: every `NOT NULL` column on an observation table needs a producer; the model is the natural one for a value derived from the provider's period fields.
- **Impact**: low today (no writer exists yet), but CAP-001-E4's insert into `fundamental_observation` will have no source for a `NOT NULL` column unless it derives one itself, duplicating period semantics outside this component.
- **Required remediation**: either derive `fiscal_period` on `FinancialStatement` from `timeframe`/`fiscal_quarter` with a covering test, or record here and in the task plan that CAP-001-E4 owns it, so the gap is a decision rather than an omission.

### IR-007 — `DailyBar` docstrings reference a `daily_bar.payload` column that does not exist

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T008
- **Files**: `src/factorflow/ingestion/massive/models.py` — `DailyBar` class docstring and `DailyBar.value_payload()` docstring
- **Claim challenged**: `value_payload()` documents itself as "A JSON-round-trippable value payload for `daily_bar`'s `payload` column".
- **Observed evidence**: `component-design-market-data-store.md` §2.3 defines `daily_bar` with no `payload` column — it is the only one of the four observation tables without one. Its declared columns are `open_price`, `high_price`, `low_price`, `close_price`, `volume`; `vwap`, `transaction_count` and `is_otc` have no destination column.
- **Expected evidence/behavior**: docstrings should describe the persistence contract they cite. `value_payload()` remains legitimately needed on `DailyBar` for the writer's value hash.
- **Impact**: low — a reader or a later story could act on an incorrect statement about the schema. The behavior is correct; only the stated rationale is wrong.
- **Required remediation**: correct both docstrings to say the payload exists for the append-only value hash, and note that `vwap`, `transaction_count` and `is_otc` are carried for hashing rather than for a `daily_bar` column.

### IR-008 — Inconsistent handling of undeclared provider fields across the four models

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/massive/models.py` — `model_config` on all four models
- **Claim challenged**: T007 asks for one coherent model set over the four response shapes.
- **Observed evidence**: `FinancialStatement` and `CorporateAction` set `extra="allow"`; `TickerReference` and `DailyBar` leave Pydantic's default `extra="ignore"`. Confirmed by probe: the wire `ticker` key present in `reference_active.json` is absent from `TickerReference.value_payload()`, whose keys are the ten declared fields only.
- **Expected evidence/behavior**: the difference is defensible (reference and bar shapes are fully enumerated in `component-design-massive-client.md` §2.5, the other two are not), but it is nowhere stated, and silent dropping is the failure mode `ProviderContractViolation` exists to surface.
- **Impact**: low — no current requirement is unmet. A new provider field on reference or bar responses would vanish without signal.
- **Required remediation**: record the rationale in the `TickerReference` and `DailyBar` docstrings, or set `extra="forbid"` on them so provider drift raises instead of being discarded. A one-line documentation change is sufficient to close this.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Branch metadata is stale in the task plan.** `CAP-001-E3-S2-tasks.md` records `**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`, while the work was correctly done on `usr/alvaro-de-jodra/CAP-001-E3-S2`. This is a copy-paste error in the plan header, not an implementation defect; the reviewed branch matches the story. Noted for the Doc Sync Agent; no finding raised, since the task plan is not this story's deliverable.
- **No scope leakage found.** All 20 changed files map to a planned task. No unrelated refactor, no dependency change, no debug artifact, no commented-out code, and no test hook into production code were found in the change set.
- **Task bookkeeping is consistent.** All ten checkboxes are checked and all ten have corroborating repository evidence; no unchecked-but-implemented and no checked-but-missing task was found.
- **`fiscal_period` and the payload-column gaps** (IR-006, IR-007) are deviations from the persistence contract's completeness rather than from the plan's instructions, and are recorded as LOW.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: proceed to documentation synchronization for CAP-001-E3-S2 with the eight findings below recorded as accepted warnings. IR-001 through IR-004 should be carried into the epic's remaining stories (E3-S1 and E3-S3 both consume these models) or raised as follow-up work before CAP-001-E4's observation writer begins, since IR-003 and IR-004 concern values that enter append-only history.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004 (MEDIUM); IR-005, IR-006, IR-007, IR-008 (LOW)
