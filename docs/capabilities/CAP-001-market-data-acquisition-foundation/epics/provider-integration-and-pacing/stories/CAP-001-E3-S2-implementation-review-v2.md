---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
story_id: "CAP-001-E3-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-16T17:09:57Z"
reviewed_head: "062601a54e800609408e3e23a542c7139bfb2abd"
review_base: "be332b1fde1176929c605c3d1ff04edd2a8630dc"
reviewed_state_revision: "sha256:b515d4f7ae7e0bfb39d59e07a3d116452689d7894552213126cab3cbe177cbfa"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-09-16T17:09:57Z
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

# Implementation Review: CAP-001-E3-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 4 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

This re-review was triggered by the shared-file fingerprint check, not by
rework: `src/factorflow/ingestion/massive/__init__.py` — a file this story
owns a section of and version 1 covered — was modified after version 1 by
three sibling stories (CAP-001-E3-S3, S4 and S5) that have since merged to
`main`.

**On the trigger question, the answer is no: nothing this story owns
changed.** `src/factorflow/ingestion/massive/models.py` is byte-identical to
the blob version 1 reviewed (`8480951b121ec064f056a6b2b79e77cbdafcba10` at
both `433c13c` and `062601a`), as are all four story test modules and all ten
recorded fixtures. The sibling edits to `massive/__init__.py` are purely
additive: this story's four model imports and its four `__all__` entries
survive verbatim, and every name the siblings added is a locally defined
error-taxonomy symbol, never a Massive SDK type or a raw wire dictionary — so
T009's actual prohibition, and DAC-E3-12 with it, still hold at the package
boundary. Every acceptance criterion was re-traced to production code and to
tests on the current tree, and all seven required validation commands were
rerun here and pass.

**The verdict nevertheless differs from version 1's `PASS-WITH-WARNINGS`,
and the reason is not the sibling changes.** Version 1's own Test Quality
table recorded the mandatory component test TC-COMP-216 as `WEAK`. Under the
gate rule this review operates by — `PASS` and `PASS-WITH-WARNINGS` require
every mandatory test to be `ADEQUATE`, and a `WEAK` mandatory test is at
least HIGH severity (`adversarial-review` SKILL.md §H; implementation-review
template invariant 8) — that classification and a passing verdict cannot both
stand. Re-deriving the classification independently on this tree, and on a
host in a different timezone from version 1's, reaches the same answer:
`WEAK`. IR-001 is therefore recorded at HIGH here rather than MEDIUM, and the
gate follows.

Two facts that did not exist at version 1 make the correction concrete rather
than pedantic. Commit `67af950` added `.github/workflows/validate.yml`, this
repository's first automated gate, running on `ubuntu-latest` — a UTC host;
and this review ran on a UTC−5 host, where the defect TC-COMP-216 exists to
catch is caught, proving the detection is a property of the host rather than
of the test. In the environment that now gates every merge, the sole test
guarding DAC-E3-S2-2 — an acceptance criterion whose entire subject is
timezone ambiguity — passes identically whether the conversion is
timezone-aware or naive. The remediation is a bounded test-only change; no
production code is implicated, and no other finding blocks.

If the owner judges the carried warning acceptable rather than blocking — the
position doc-sync commit `701e7fb` records — the mechanism is an explicit,
expiring waiver (`python3 scripts/artifact-gate.py waive`), not a re-review.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `main`, level with `origin/main` |
| HEAD | `062601a54e800609408e3e23a542c7139bfb2abd` |
| Review base | `be332b1fde1176929c605c3d1ff04edd2a8630dc` — the merge base from which this story's change set was cut; confirmed an ancestor of `HEAD` |
| Working tree | clean — `git status --porcelain=v1` returned no entries before or after validation; no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 20 in this story's own change set, plus 2 shared files re-reviewed for sibling drift |

### Resolving the review set on `main`

This story's work is merged, so `git merge-base main main` is `HEAD` and
yields an empty range. The review set was therefore reconstructed from two
ranges, both verified by SHA rather than inferred:

1. **This story's change set**, `be332b1..433c13c` — 20 files, identical in
   composition to the set version 1 reviewed. `README.md` is *not* in it:
   that file was modified by doc-sync commit `701e7fb`, which ran after
   version 1 and is a downstream stage's output, not this story's
   implementation.
2. **Drift since version 1's reviewed HEAD**, `433c13c..062601a`, restricted
   to paths version 1 covered — the subject of this re-review.

Version 1's reviewed HEAD `433c13c` is an ancestor of the current `HEAD`, so
the two ranges compose without ambiguity and no part of this story's change
set is unreachable. CAP-001-E3-S1's unmerged branch is not an ancestor of
`HEAD`, contains this package's `client.py`, and played no part in this
review; `src/factorflow/ingestion/massive/client.py` does not exist on `main`.

### Changed Files

The 20 files of this story's own change set, all `added` at `be332b1..433c13c`
except where noted, and all unmodified since version 1 unless the last column
says otherwise.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/__init__.py` | added | T001 — **modified since v1** by CAP-001-E3-S4 (governor re-exports) |
| `src/factorflow/ingestion/massive/__init__.py` | added | T001; T009 — **modified since v1** by CAP-001-E3-S3 and CAP-001-E3-S5 (error-taxonomy re-exports) |
| `src/factorflow/ingestion/massive/models.py` | added | T001; T007; T008 — unchanged since v1 (blob `8480951`) |
| `tests/unit/test_massive_reference.py` | added | T001; T002; T006 — unchanged since v1 |
| `tests/unit/test_massive_bars.py` | added | T001; T002; T003; T006 — unchanged since v1 |
| `tests/unit/test_massive_financials.py` | added | T001; T002; T004; T006 — unchanged since v1 |
| `tests/unit/test_massive_actions.py` | added | T001; T002; T005; T006 — unchanged since v1 |
| `tests/fixtures/massive/reference_active.json` | added | T002 — unchanged since v1 |
| `tests/fixtures/massive/reference_delisted.json` | added | T002 — unchanged since v1 |
| `tests/fixtures/massive/bar_regular.json` | added | T003 — unchanged since v1 |
| `tests/fixtures/massive/bar_otc.json` | added | T003 — unchanged since v1 |
| `tests/fixtures/massive/financial_annual.json` | added | T004 — unchanged since v1 |
| `tests/fixtures/massive/financial_quarterly.json` | added | T004 — unchanged since v1 |
| `tests/fixtures/massive/action_split.json` | added | T005 — unchanged since v1 |
| `tests/fixtures/massive/action_dividend.json` | added | T005 — unchanged since v1 |
| `tests/fixtures/massive/action_ticker_change.json` | added | T005 — unchanged since v1 |
| `tests/fixtures/massive/action_ipo.json` | added | T005 — unchanged since v1 |
| `docs/.../CAP-001-E3-S2-tasks.md` | modified | Task-state bookkeeping only (T001–T010 checkboxes) |
| `docs/.../CAP-001-E3-S2.md` | modified | Lifecycle only (`planning` → `in-review`; later `in-review` → `docs-sync` by `701e7fb`) |
| `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` | added | T010 (the task names this exact path) |

No file in this story's change set lacks a justification. `pyproject.toml`
and `uv.lock` remain untouched by it, consistent with T001's checkpoint that
Pydantic is already available transitively.

### Sibling drift in the shared files

| Shared file | What the siblings added | Effect on this story |
|-------------|-------------------------|----------------------|
| `src/factorflow/ingestion/massive/__init__.py` | CAP-001-E3-S3 added eleven error-taxonomy names (five `MassiveError` types, `classify_error_body`, `is_rate_limited_body`, `is_fatal_for_governor`, `wrap_validation_error`); CAP-001-E3-S5 added `compose_failure_reason` and `MAX_FAILURE_REASON_VARIABLE_TEXT`; both extended the module docstring | **None.** The `from factorflow.ingestion.massive.models import …` block (lines 48–53) and the four model entries in `__all__` are unchanged. Verified by import on the current tree: every name in `__all__` resolves, and all four model types are still reachable as `from factorflow.ingestion.massive import TickerReference, DailyBar, FinancialStatement, CorporateAction`. |
| `src/factorflow/ingestion/__init__.py` | CAP-001-E3-S4 re-exported `GovernorSettings`, `Outcome` and `RateLimitGovernor` from `rate_limit.py` | **None to behavior.** One side effect: importing this story's models now also loads `factorflow.ingestion.rate_limit` and `factorflow.ingestion.massive.errors`, because the parent package's `__init__` runs first. Probed — `sys.modules` after `import factorflow.ingestion.massive` holds exactly `factorflow`, `.ingestion`, `.ingestion.massive`, `.ingestion.massive.errors`, `.ingestion.massive.models`, `.ingestion.rate_limit`. No import cycle (`rate_limit` imports `massive.errors` while `ingestion` is already partially initialised in `sys.modules`), no new third-party dependency, and no runtime settings load (`MassiveSettings` is imported under `TYPE_CHECKING` only). |

`errors.py` (CAP-001-E3-S3), `rate_limit.py` (CAP-001-E3-S4) and the
failure-reason composer (CAP-001-E3-S5) were read in full to answer the
trigger question. None of them alters, wraps, subclasses, monkey-patches or
re-validates any of this story's four models. `rate_limit.py` imports only
`ProviderUnavailable` from `errors.py` and is model-agnostic by construction.
The one place a sibling touches a model at all is a test — see the DAC-E3-S2-4
row below, where it strengthens this story's evidence rather than disturbing
it.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E3-12 | SATISFIED | `models.py` — every wire name appears only inside `Field(alias=…)`; all public attributes (`company_name`, `is_active`, `open_price`, `fiscal_period_end`, `provider_filing_date`, `effective_on`) are product vocabulary. `massive/__init__.py` re-exports the four model types plus this component's own error-taxonomy symbols — no SDK type, no dict passthrough. | `test_massive_reference.py::test_parses_wire_shape_into_product_vocabulary` (asserts `not hasattr` for `name`/`active`/`type`); `test_massive_bars.py::test_parses_wire_shape_into_product_vocabulary` (all eight one-letter keys); `test_massive_financials.py::test_parses_wire_shape_into_product_vocabulary` | Re-checked specifically against the widened package surface. The eleven-plus names the siblings export are all defined in `errors.py`, which "never imports the Massive SDK" and reads only four documented envelope fields; `classify_error_body(raw_body: bytes \| str)` takes a wire body *in* and returns a typed error — no wire-named type crosses the boundary outward. The `CorporateAction` JSONB payload still carries provider key names, sanctioned by the task plan's Notes and recorded as IR-005 (LOW), unchanged from v1. |
| AC-5 | SATISFIED | `FinancialStatement.provider_filing_date: date = Field(alias="filing_date")` with a docstring stating it is descriptive only and must never serve as the observation date; no model declares `observed_on`, `run_id` or `recorded_at`. | `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only`; `::test_value_payload_uses_decimal_strings_and_owns_no_writer_metadata` | Re-verified against `component-design-observation-writer.md` §2.3–2.4: `observed_on` is writer-supplied and the hash is value-only. Probed `value_payload()` on all four models — no writer-owned key appears. |
| DAC-E3-S2-1 | SATISFIED | `DailyBar` maps `t`→`session_date`, `o`→`open_price`, `h`→`high_price`, `l`→`low_price`, `c`→`close_price`, `v`→`volume`, `vw`→`vwap`, `n`→`transaction_count`. | `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` asserts all eight values, not merely their presence. | All eight are required; corroborated by the parametrized `test_missing_required_field_fails_validation` over each of the eight keys. |
| DAC-E3-S2-2 | SATISFIED | `DailyBar._millis_to_utc_session_date` (`mode="before"` validator, `models.py:120–128`) uses `datetime.fromtimestamp(value / 1000, tz=UTC).date()`, running before Pydantic's own `date` coercion. | `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` | The **production** contract is unambiguously correct, which is what satisfies this criterion. Its **test** does not durably guard it — see IR-001 (HIGH). Recorded SATISFIED rather than PARTIAL because the code is right; the gate blocks on the test-quality rule, not on this row. |
| DAC-E3-S2-3 | SATISFIED | Every price/ratio/monetary field is `Decimal`; `_coerce_extra_numeric_fields_to_decimal` converts retained provider line items via `Decimal(str(v))` rather than `Decimal(float)`, and skips `bool` (an `int` subclass). | `test_massive_bars.py::test_no_field_is_typed_float`; `test_massive_financials.py::test_monetary_values_are_decimal_not_float`; `test_massive_actions.py::test_split_ratio_values_are_decimal_not_float` and `::test_dividend_cash_amount_is_decimal_not_float` | Re-probed on the current tree: wire `187.15` yields `Decimal('187.15')`. All ten recorded fixtures were inspected — every monetary and ratio value in them is top-level, so the coercion covers each one. Nested coercion remains absent (IR-003, MEDIUM), but no recorded provider shape currently exercises it. |
| DAC-E3-S2-4 | SATISFIED | No required field carries a default, so a missing wire key raises Pydantic `ValidationError`. The criterion's second clause is now met by merged code: `errors.py::wrap_validation_error` turns that `ValidationError` into `ProviderContractViolation`. | This story: parametrized `test_missing_required_field_fails_validation` in all four modules — 5 + 8 + 7 + 2 = 22 distinct required-field deletions. The seam: `tests/unit/test_massive_error_classification.py::test_validation_error_from_a_successful_response_wraps_to_contract_violation`, which drives a real `DailyBar.model_validate` failure through `wrap_validation_error`. | **Strengthened since v1.** At v1 the "classified `ProviderContractViolation` by CAP-001-E3-S3" half of this criterion was a forward reference to unwritten code; it is now demonstrated end-to-end by a merged test that uses this story's own model. Deleting the *wire* key is a genuine test because `populate_by_name=True` would otherwise accept the field name; neither spelling survives the deletion. |
| DAC-E3-S2-5 | SATISFIED | `TickerReference.delisted_utc`, `DailyBar.is_otc`, `FinancialStatement.fiscal_quarter` are `X \| None = None`; no zero or `False` substitute anywhere. | `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false` (asserts `None`, and `True` when present); `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements`; `test_massive_reference.py::test_active_instrument_has_no_delisted_timestamp` | The bar test discriminates `None` from `False` specifically, which is the distinction this criterion names. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/massive/__init__.py`, `src/factorflow/ingestion/massive/models.py` and the four `tests/unit/test_massive_*.py` modules all exist at the planned paths on `main`. | Checkpoint reconfirmed: all four modules collect (10 + 14 + 13 + 11 = 48 tests) and run; `pyproject.toml`/`uv.lock` untouched by this story, so the "no additional dependency" claim still holds. |
| T002 | complete | VERIFIED | TC-COMP-206 realized as `test_parses_wire_shape_into_product_vocabulary` in the reference, bars and financials modules, plus the four action-mapping tests. | Assertions check parsed values *and* the absence of wire-named attributes, not merely that parsing succeeded. |
| T003 | complete | VERIFIED | `test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215) and `test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216) in `tests/unit/test_massive_bars.py`. | Both tests exist at the planned path, which is what the task asks for. The second half of the task's wording — "assert … using a timezone-aware UTC conversion" — is not durably met by the test as written; that is IR-001, raised against the test rather than against the task's existence. |
| T004 | complete | VERIFIED | `test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005), `test_monetary_values_are_decimal_not_float` (TC-COMP-217), `test_missing_required_field_fails_validation` (TC-COMP-218), `test_fiscal_quarter_is_optional_for_annual_statements` (TC-COMP-219). | The task's "distinguish an absent optional value from `Decimal("0")`" is met by asserting `is None`, which is strictly stronger than a not-equal-to-zero assertion. |
| T005 | complete | VERIFIED | `test_split_maps_to_a_product_named_action`, `test_dividend_…`, `test_ticker_change_…`, `test_ipo_…` in `tests/unit/test_massive_actions.py`, each driven by its own recorded fixture. | Each asserts `action_type` plus the endpoint-specific date resolved to `effective_on` — `execution_date`, `ex_dividend_date`, `date`, `listing_date` respectively, matching `component-design-massive-client.md` §2.5. |
| T006 | complete | VERIFIED | `test_value_payload_…` present in all four test modules; asserts `json.dumps` succeeds, `Decimal` values serialize as strings (`"187.15"`, `"352755000000"`, `"0.25"`), and `observed_on`/`run_id`/`recorded_at` are absent. | Re-probed: all four `value_payload()` results are JSON-round-trippable and carry no writer-owned key. |
| T007 | complete | VERIFIED | The four model classes in `models.py`, each with aliases, `Decimal` typing, optionality matching the provider contract in §2.5, and an explicit `provider_filing_date` docstring. | Deviations recorded as IR-002 (unconstrained `statement_type`/`timeframe`) and IR-006 (no `fiscal_period` field for a `NOT NULL` column). Neither leaves a planned field unimplemented; both are hardening gaps, unchanged since v1. |
| T008 | complete | VERIFIED | `_millis_to_utc_session_date`, `value_payload()` on all four models, `_coerce_extra_numeric_fields_to_decimal`. No hashing and no writer metadata were added, as the task forbids. | "Reject … rather than silently coercing" holds for missing and type-invalid input (22 parametrized cases) but not for a plausibly-typed wrong-magnitude `t` — IR-004 (MEDIUM). VERIFIED rather than PARTIAL because no named source of truth mandates timestamp-magnitude validation. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/massive/__init__.py:48–53` imports the four model types from `models.py` and lists them in `__all__`; no SDK type, no dict passthrough. | **Re-examined for this re-review.** The file no longer exposes *only* the four model types — siblings added the error-taxonomy surface. That widening belongs to CAP-001-E3-S3 and CAP-001-E3-S5, each of which passed its own gate; it is not scope leakage attributable here. The prohibition T009 actually imposes — no Massive SDK response type, no raw wire dictionary beyond the package boundary — is intact, and so is DAC-E3-12. The task's checkpoint clause "CAP-001-E3-S1 can import the four model types" is verified by import; the clause naming `client.py` as the consumer remains a forward reference, since that module is not on `main`. |
| T010 | complete | VERIFIED | `CAP-001-E3-S2-tdd-evidence.yaml` records four RED→GREEN cycles with commit hashes matching the branch commits, and five manual mutations covering exactly the five subjects the task names (bar alias, timestamp conversion, `Decimal` annotation, required field, optional field). | The file is unchanged since v1 (`git log` shows `433c13c` as its only touching commit). `mutation-2-timestamp-conversion` records its own result as observed "on this host's local timezone" — honest, and precisely the environment dependence IR-001 raises. |

Phase ordering was re-checked against commit history rather than checkboxes:
`20d1842`, `7393560`, `883700d`, `2099be9` land one model at a time with its
tests, and `433c13c` adds the T010 evidence last — the order the plan's
dependency section requires. All ten checkboxes are checked and all ten have
corroborating repository evidence; no unchecked-but-implemented and no
checked-but-missing task was found.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_massive_reference.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts eight concrete parsed values *and* that `name`/`active`/`type` are not attributes. Fails if an alias is dropped or a wire name re-surfaces. | none |
| `test_massive_bars.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts none of the eight one-letter keys survives as an attribute. Paired with TC-COMP-215's value assertions it is not vacuous. | none |
| `test_massive_financials.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Asserts renamed values and the absence of `period_end`/`filing_date` attributes. | none |
| `test_massive_actions.py` four mapping tests / TC-COMP-206 | ADEQUATE | Each uses a distinct recorded fixture and asserts the endpoint-specific date resolves to the product-named `effective_on`. `test_only_the_four_known_action_types_are_accepted` proves the `Literal` domain matches the DDL's `corporate_action_type_known` CHECK. | none |
| `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` / TC-COMP-215 | ADEQUATE | Asserts all eight values with exact `Decimal` comparison; renaming any alias makes the field required-and-missing, so it fails. | none |
| `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` / TC-COMP-216 | **WEAK** | Asserts `1704153600000` → `2024-01-02` and `1704153599999` → `2024-01-01`. The expectations are correct, and on this UTC−5 host the first assertion does fail when `tz=UTC` is dropped. | Its power to fail comes from the host's timezone, not from the test. Probed directly: under `TZ=UTC` a naive `datetime.fromtimestamp(t/1000).date()` returns `2024-01-02` and `2024-01-01` for those two inputs — identical to the timezone-aware results, so both assertions still pass against the exact defect the test targets. The repository's only automated gate (`.github/workflows/validate.yml`, `ubuntu-latest`) is such a host. Line 59's `datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)` is additionally a convoluted restatement of `date(2024, 1, 2)` and proves nothing line 60 does not. See IR-001. |
| `test_massive_financials.py::test_monetary_values_are_decimal_not_float` / TC-COMP-217 | ADEQUATE | Asserts both `==` against an exact `Decimal` and `isinstance(…, Decimal)` for a monetary value and a ratio, across two fixtures. Catches the `Decimal`→`float` mutation. | Does not cover nested provider structures — IR-003. No recorded fixture currently contains a nested numeric, so this is a forward risk rather than an uncovered present shape. |
| `test_massive_*::test_missing_required_field_fails_validation` / TC-COMP-218 | ADEQUATE | 22 parametrized cases across four models, each deleting a required wire key and asserting `ValidationError`. Each case fails for the intended reason (field required), not incidentally. | none |
| `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false` / TC-COMP-219 | ADEQUATE | Asserts `is None` for the absent case and `is True` for the present case — the `None`-versus-`False` distinction the criterion is about. | none |
| `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements` / TC-COMP-219 | ADEQUATE | Both branches asserted against separate fixtures. | none |
| `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` / TC-COMP-005 | ADEQUATE | Asserts the filing date survives under its product name and that no attribute exists that could be mistaken for an as-of date. | The append/restatement half of TC-COMP-005 belongs to CAP-001-E4's writer and is not this story's to cover. |
| `test_massive_*::test_value_payload_*` (T006, four modules) | ADEQUATE | Asserts JSON-serializability, exact decimal-string values, and the absence of all three writer-owned keys. Catches a `mode="json"` regression and any leak of writer metadata. | Asserts absence of writer keys but not that only product-named keys are present; the `CorporateAction` payload's provider-named keys go unasserted — IR-005. |
| `test_massive_*::test_no_*field_is_typed_float` | ADEQUATE | Introspects `model_fields` annotations. Tautological in isolation, but recorded mutation 3 confirms it fails on a `Decimal`→`float` change. | Cannot see undeclared (extra) fields, by construction. |

Isolation and determinism were re-verified on the current tree. All four
modules are pure, read only local JSON fixtures through a path resolved from
`__file__`, and touch no network, clock, database or shared state. Running
the four story modules alone (48 tests, 0.10 s) and inside the full suite
(306 tests) produced identical results, so there is no order dependence. No
mocks are used — the unit under test is exercised directly, so no mock can
make an expected result inevitable. The one environment dependence is
TC-COMP-216's (IR-001), and it is now load-bearing because CI is UTC.

## Independent Validation

Every command below was run by this reviewer on `main` at
`062601a54e800609408e3e23a542c7139bfb2abd`; none is quoted from a prior
report. Working directory for all of them:
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py` | repo root | 0 | PASS | 48 passed in 0.10s — narrowest story-relevant scope, run first |
| `uv run pytest -m 'not postgres'` | repo root | 0 | PASS | 247 passed, 59 deselected, 2 warnings in 12.78s |
| `uv run pytest` | repo root | 0 | PASS | 306 passed, 2 warnings in 22.43s — full suite including the postgres-marked tests; Docker daemon confirmed up beforehand, so no exclusion was needed |
| `uv run ruff check .` | repo root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | repo root | 0 | PASS | 96 files already formatted |
| `uv run mypy src` | repo root | 0 | PASS | Success: no issues found in 28 source files |
| `uv build` | repo root | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |

Story-specific validation from the plan was additionally confirmed by
read-only probes against the installed models: `DailyBar` maps every required
wire field and produces the DDL's `session_date`; no `float`-typed field
enters `daily_bar`; all payload decimals serialize as strings; payloads omit
`observed_on`, `run_id` and `recorded_at`; a missing required field raises
`ValidationError`; and an absent optional field is `None`, not zero.

Two further read-only probes supported specific findings and mutated nothing:

- **Timezone probe (IR-001).** `datetime.fromtimestamp(t/1000)` versus
  `datetime.fromtimestamp(t/1000, tz=UTC)` for the test's two inputs, run
  under `TZ=UTC` and under the host's own timezone. Under `TZ=UTC` both forms
  give `2024-01-02` and `2024-01-01`; on this UTC−5 host the naive form gives
  `2024-01-01` for the first input. No repository file was touched.
- **Model-behavior probes (IR-002 through IR-008).** Each version 1 finding
  was reproduced against the current tree through `model_validate` and
  `value_payload()` calls in a throwaway interpreter session.

The two `pytest` warnings are pre-existing third-party deprecation notices
from `starlette`/`fastapi` in `.venv`, unrelated to this story. The local
virtualenv resolves Python 3.13 while CI pins `UV_PYTHON: "3.12"`; the suite
is green on both by CI's own evidence and this run's, and the divergence is
not attributable to this story.

### Validation Side Effects

- Before: `git status --porcelain=v1` → empty (clean tree, no untracked files)
- After: `git status --porcelain=v1` → empty (clean tree, no untracked files); `HEAD` still `062601a54e800609408e3e23a542c7139bfb2abd`
- Unexpected tracked-file changes: none. `uv build` wrote `dist/`, which
  `.gitignore:17` excludes, so no tracked file changed and constraint 10
  required no intervention. No branch was switched, no ref was moved, and
  nothing was fetched or pulled.

## Findings

### IR-001 — TC-COMP-216 cannot detect a naive timestamp conversion on a UTC host, and CI is now a UTC host

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T003, T010
- **Files**: `tests/unit/test_massive_bars.py:51-64` (`test_unix_millis_convert_to_session_date_via_timezone_aware_utc`); `docs/.../CAP-001-E3-S2-tdd-evidence.yaml` (`mutation-2-timestamp-conversion`); context: `.github/workflows/validate.yml`
- **Claim challenged**: T003 requires asserting that `t` converts "using a timezone-aware UTC conversion", and the TDD evidence records that removing `tz=UTC` from `DailyBar._millis_to_utc_session_date` is caught by this test (`caught: true`).
- **Observed evidence**: the test's two inputs are `1704153600000` and `1704153599999`. Evaluated directly under `TZ=UTC`, a naive `datetime.fromtimestamp(t/1000).date()` returns `2024-01-02` and `2024-01-01` — identical to the timezone-aware results, so both assertions still pass with the defect present. On this host (UTC−5) the naive form returns `2024-01-01` for the first input, so the assertion does fail here; version 1 observed the same on a UTC+2 host. The discriminating power is therefore a property of the host, not of the test, and the TDD evidence's own wording concedes it ("on this host's local timezone"). Since version 1, commit `67af950` added `.github/workflows/validate.yml`, which runs `uv run pytest -m 'not postgres'` and `uv run pytest` on `ubuntu-latest` — a UTC host — and is the only automated gate this repository has.
- **Expected evidence/behavior**: `adversarial-review` SKILL.md §E.6 requires tests to be free of environment dependence unless that dependence is explicitly controlled, and §E.3 requires that a plausible regression make the test fail; T003 asks specifically for the timezone-aware property to be asserted. `component-design-massive-client.md` §2.5 fixes `t` as Unix milliseconds, and DAC-E3-S2-2 makes freedom from timezone ambiguity the whole point of the criterion.
- **Impact**: the sole test guarding an acceptance criterion about timezone ambiguity does not guard it in the environment that gates every merge. A regression to `datetime.fromtimestamp(t/1000)` would pass CI green and ship, writing bars against `session_date` values shifted by one day near midnight. `daily_bar`'s natural key is append-only, so such rows cannot be repaired after the fact. This is recorded at HIGH rather than the MEDIUM version 1 assigned because the gate rule this review operates by (SKILL.md §H; template invariant 8) makes a `WEAK` mandatory test at least HIGH — version 1 classified this same test `WEAK` and then issued a passing verdict, which those rules do not permit — and because the UTC CI gate, which did not exist at version 1, turns the risk from hypothetical into the default case.
- **Required remediation**: make the assertion independent of the host timezone — for example by pinning a deliberately non-UTC `TZ` for the duration of the test (`monkeypatch.setenv("TZ", "…")` plus `time.tzset()`), or by asserting the validator's result against a value computed with an explicit `tz=UTC` reference while the ambient timezone is non-UTC. Replace the vacuous `datetime.fromtimestamp(0, tz=UTC).date().replace(2024, 1, 2)` on line 59 with a direct expectation. Re-record `mutation-2-timestamp-conversion` afterwards, demonstrating the mutation is caught under `TZ=UTC`. No production code needs to change: `_millis_to_utc_session_date` is already correct.

### IR-002 — `FinancialStatement.statement_type` and `timeframe` accept any string despite constrained domains

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12, DAC-E3-S2-4
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/massive/models.py:183-184` — `FinancialStatement.timeframe: str`, `FinancialStatement.statement_type: str`
- **Claim challenged**: T007 requires mapping to "the product fields required by … `fundamental_observation` … in `component-design-market-data-store.md` §2.3", and the model's own docstring says `statement_type` "remains required because the persistence contract requires it".
- **Observed evidence**: reproduced on the current tree — `FinancialStatement.model_validate({**financial_annual, "statement_type": "not_a_statement", "timeframe": "weekly"})` succeeds and yields exactly those values. `component-design-market-data-store.md` §2.3 constrains the column with `CONSTRAINT fundamental_statement_known CHECK (statement_type IN ('balance_sheet', 'income_statement', 'cash_flow_statement', 'ratios'))`, and `component-design-massive-client.md` §2.5 states `timeframe` is `quarterly` or `annual`. The sibling model in the same file does constrain its equivalent: `CorporateAction.action_type: Literal["split", "dividend", "ticker_change", "ipo"]`.
- **Expected evidence/behavior**: the treatment `CorporateAction.action_type` already receives — the model rejects a value the persistence contract forbids, so the failure surfaces as a Pydantic `ValidationError` that `errors.py::wrap_validation_error` (now merged) maps to `ProviderContractViolation`.
- **Impact**: an out-of-domain `statement_type`, from caller error or provider drift, passes parsing and fails later as a raw database CHECK violation inside the writer's per-instrument transaction, where it is not classifiable as a provider contract violation and aborts an append instead of being recorded as one instrument's failure.
- **Required remediation**: constrain `statement_type` to the four values in `fundamental_statement_known` and `timeframe` to `quarterly`/`annual`, following the `CorporateAction.action_type` pattern, and add a rejection test mirroring `test_only_the_four_known_action_types_are_accepted`.

### IR-003 — `Decimal` coercion of retained provider data is top-level only

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-3
- **Tasks**: T007, T008
- **Files**: `src/factorflow/ingestion/massive/models.py:32-46` — `_coerce_extra_numeric_fields_to_decimal`; used by `FinancialStatement._coerce_statement_values_to_decimal` and `CorporateAction._coerce_action_values_to_decimal`
- **Claim challenged**: the helper's docstring states it converts "every field not already declared on the model from `int` or `float` to `Decimal` … so no binary rounding enters a value that will be recorded permanently".
- **Observed evidence**: the helper iterates only `data.items()` at the top level. Reproduced on the current tree — `FinancialStatement.model_validate({**financial_annual, "financials": {"assets": {"value": 0.1}}})` yields a nested value of type `float`, and `value_payload()` emits `{'assets': {'value': 0.1}}` as a JSON number, not the string `"0.1"`. All ten recorded fixtures were re-inspected for this review: every monetary and ratio value in them is top-level, so no currently recorded shape is affected, but `tests/fixtures/massive/action_ticker_change.json` already nests a `ticker_change` object, so nested provider structures are not hypothetical for this provider.
- **Expected evidence/behavior**: DAC-E3-S2-3 requires monetary and ratio values to be held as `Decimal` so no binary rounding enters recorded history; `component-design-observation-writer.md` §2.3 requires decimals to serialize as strings for a deterministic hash.
- **Impact**: a nested provider numeric would reach the JSONB payload and the SHA-256 value hash as a float. Per the writer design's own reasoning, that is the case where `123.45` and `123.450000000000003` can hash differently across runs — appending a duplicate row and defeating AC-6 — with no way to repair append-only history afterwards.
- **Required remediation**: make the coercion recurse into nested dicts and lists, and add a test using a nested provider structure asserting the nested value is `Decimal` and serializes as a string.

### IR-004 — `DailyBar` silently accepts a timestamp that is not Unix milliseconds

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-2, DAC-E3-S2-4
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py:120-128` — `DailyBar._millis_to_utc_session_date`
- **Claim challenged**: T008 requires helpers that "reject unsupported or missing required input rather than silently coercing it".
- **Observed evidence**: reproduced on the current tree — the validator returns `value` unchanged for any non-numeric input, so `DailyBar.model_validate({…, "t": "2024-01-02"})` parses to `session_date == date(2024, 1, 2)` through Pydantic's ordinary date coercion. No magnitude check exists either: `{"t": 1704153600}` (the same instant expressed in seconds) parses to `session_date == date(1970, 1, 20)` without error.
- **Expected evidence/behavior**: `component-design-massive-client.md` §2.5 states `t` is Unix milliseconds; an input that is not milliseconds is provider drift, which §2.4 says must become a `ProviderContractViolation` rather than a value.
- **Impact**: a provider or SDK change from milliseconds to seconds, or to an ISO string, would write bars against wrong session dates into append-only history rather than failing loudly. This is precisely the "shape that parses cleanly and means something different" the component design names as the residual risk `ProviderContractViolation` exists to catch.
- **Required remediation**: have the validator accept only an integer or float and reject anything else, and add a plausibility bound so a seconds-scale or obviously out-of-range value raises rather than parsing. Cover both with tests. Held at MEDIUM because no named source of truth mandates magnitude validation explicitly and the story's own criteria are met for well-formed input.

### IR-005 — Provider wire key names ride into the hashed `CorporateAction` payload

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-12
- **Tasks**: T005, T006, T007
- **Files**: `src/factorflow/ingestion/massive/models.py:206-258` — `CorporateAction` (`extra="allow"`, `value_payload()`)
- **Claim challenged**: DAC-E3-12 states wire field names stay inside this component.
- **Observed evidence**: reproduced on the current tree — the ticker-change variant's `value_payload()` returns keys `['action_type', 'date', 'effective_on', 'ticker_change', 'type']`, and the split variant returns `['action_type', 'adjustment_type', 'effective_on', 'execution_date', 'historical_adjustment_factor', 'id', 'split_from', 'split_to', 'ticker']`. So `date` and `type` cross the package boundary as provider-named duplicates of the product-named `effective_on` and `action_type`. No test asserts anything about which keys the payload may contain.
- **Expected evidence/behavior**: the task plan's Notes sanction retaining "variant-specific provider content … in its JSONB payload", so provider-shaped payload content is a recorded decision; the redundant duplication of the natural key under provider names is not required by it.
- **Impact**: low — the payload is opaque JSONB and the writer reads the product-named fields. The duplication mildly weakens DAC-E3-12's intent and adds redundant bytes to the hashed value.
- **Required remediation**: either drop the provider-named duplicates of the natural key before building the payload, or add an explicit assertion and a one-line note in the model docstring recording that provider key names are deliberately retained inside the JSONB payload only.

### IR-006 — No model field supplies `fundamental_observation.fiscal_period`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/massive/models.py:138-203` — `FinancialStatement`; `docs/.../design/component-design-market-data-store.md` §2.3
- **Claim challenged**: T007 requires mapping "the product fields required by … `fundamental_observation` … in `component-design-market-data-store.md` §2.3".
- **Observed evidence**: the DDL declares `fiscal_period text NOT NULL`. Confirmed on the current tree that `"fiscal_period" in FinancialStatement.model_fields` is `False`; the model declares `fiscal_year`, `fiscal_quarter` and `timeframe` instead. A repository-wide search still finds `fiscal_period` only in that DDL — no component produces a value for it, including the three sibling stories merged since version 1.
- **Expected evidence/behavior**: every `NOT NULL` column on an observation table needs a producer; the model is the natural one for a value derived from the provider's period fields.
- **Impact**: low today (no writer exists yet), but CAP-001-E4's insert into `fundamental_observation` will have no source for a `NOT NULL` column unless it derives one itself, duplicating period semantics outside this component. CAP-001-E4's task plans are now on `main` (`9816596`, `2856a07`, `7184e4c`, `e396b0e`), so the decision is due.
- **Required remediation**: either derive `fiscal_period` on `FinancialStatement` from `timeframe`/`fiscal_quarter` with a covering test, or record in the task plan that CAP-001-E4 owns it, so the gap is a decision rather than an omission.

### IR-007 — `DailyBar` docstrings reference a `daily_bar.payload` column that does not exist

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T008
- **Files**: `src/factorflow/ingestion/massive/models.py:88-106` and `:130-135` — `DailyBar` class docstring and `DailyBar.value_payload()` docstring
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
- **Files**: `src/factorflow/ingestion/massive/models.py` — `model_config` on all four models (`:67`, `:108`, `:175`, `:237`)
- **Claim challenged**: T007 asks for one coherent model set over the four response shapes.
- **Observed evidence**: reproduced on the current tree — `FinancialStatement` and `CorporateAction` set `extra="allow"`; `TickerReference` and `DailyBar` leave Pydantic's default `extra="ignore"`. The wire `ticker` key present in `reference_active.json` is silently absent from `TickerReference.value_payload()`, whose keys are the ten declared fields only.
- **Expected evidence/behavior**: the difference is defensible — reference and bar shapes are fully enumerated in `component-design-massive-client.md` §2.5, the other two are not — but it is nowhere stated, and silent dropping is the failure mode `ProviderContractViolation` exists to surface.
- **Impact**: low — no current requirement is unmet. A new provider field on reference or bar responses would vanish without signal.
- **Required remediation**: record the rationale in the `TickerReference` and `DailyBar` docstrings, or set `extra="forbid"` on them so provider drift raises instead of being discarded.

## Previous Review Disposition

Every version 1 finding was re-tested against the current tree rather than
carried forward on its own say-so. None is resolved: `models.py` and all four
test modules are byte-identical to the blobs version 1 reviewed, so no
remediation could have occurred.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — TC-COMP-216 cannot detect a naive conversion on a UTC host | STILL OPEN — **severity raised MEDIUM → HIGH** | `tests/unit/test_massive_bars.py:51-64` unchanged (no commit touches it in `433c13c..062601a`). Probe under `TZ=UTC`: naive and timezone-aware conversions return identical dates for both test inputs. New since v1: `.github/workflows/validate.yml` (commit `67af950`) runs the suite on `ubuntu-latest`. Raised per SKILL.md §H and template invariant 8, which do not permit a passing verdict over a `WEAK` mandatory test. |
| v1/IR-002 — `statement_type`/`timeframe` unconstrained | STILL OPEN | `models.py:183-184` unchanged; `FinancialStatement.model_validate({…, "statement_type": "not_a_statement", "timeframe": "weekly"})` succeeds. |
| v1/IR-003 — `Decimal` coercion is top-level only | STILL OPEN | `models.py:32-46` unchanged; nested `{"financials": {"assets": {"value": 0.1}}}` retains a `float` and serializes as a JSON number. |
| v1/IR-004 — `DailyBar` accepts a non-millisecond timestamp | STILL OPEN | `models.py:120-128` unchanged; `"t": "2024-01-02"` → `date(2024, 1, 2)`, `"t": 1704153600` → `date(1970, 1, 20)`. |
| v1/IR-005 — provider key names in the `CorporateAction` payload | STILL OPEN | `value_payload()` keys reproduced verbatim for the ticker-change and split variants. |
| v1/IR-006 — no producer for `fundamental_observation.fiscal_period` | STILL OPEN | `"fiscal_period" in FinancialStatement.model_fields` is `False`; the identifier still appears only in the DDL, including across the three sibling stories merged since v1. |
| v1/IR-007 — docstrings cite a non-existent `daily_bar.payload` column | STILL OPEN | `models.py:88-106`, `:130-135` unchanged; `component-design-market-data-store.md` §2.3 still defines `daily_bar` without a `payload` column. |
| v1/IR-008 — inconsistent `extra=` across the four models | STILL OPEN | `extra` resolves to `ignore` (default) for `TickerReference` and `DailyBar`, `allow` for the other two; `reference_active.json`'s `ticker` key is still dropped silently. |

Doc-sync commit `701e7fb` documented IR-002, IR-003 and IR-004 in `README.md`
as known limitations and recorded IR-001 and IR-005 through IR-008 as having
no README-visible surface. That is documentation of the findings, not
remediation of them and not a gate waiver, so each remains OPEN here.

## Scope and Plan Deviations

- **The trigger is resolved in the negative.** The sibling additions to
  `src/factorflow/ingestion/massive/__init__.py` changed nothing this story
  owns. `models.py` is byte-identical (`8480951` at both `433c13c` and
  `062601a`), the four test modules and ten fixtures are unmodified, this
  story's model imports and `__all__` entries survive verbatim, and no
  sibling module alters, wraps, subclasses or re-validates any of the four
  models. No re-review finding arises from the drift itself.
- **T009's literal wording is superseded; its prohibition is not.** The task
  says "expose only the product model types"; the package now also exports
  this component's error taxonomy. That widening is owned by CAP-001-E3-S3
  and CAP-001-E3-S5, both of which passed their own gates, so it is not scope
  leakage attributable to this story. What T009 forbids — a Massive SDK
  response type or a raw wire dictionary beyond the package boundary — is
  still not present, and DAC-E3-12 holds.
- **An import side effect, recorded rather than raised.** Because
  `src/factorflow/ingestion/__init__.py` now eagerly imports `rate_limit`,
  importing this story's models also loads `rate_limit` and `errors`. No
  cycle, no new dependency, no settings load at import time; not attributable
  to this story and not a finding.
- **Verdict divergence from version 1 on unchanged code.** Version 1
  classified TC-COMP-216 `WEAK` and issued `PASS-WITH-WARNINGS`; those two
  cannot both hold under SKILL.md §H and template invariant 8. This review
  reaches the same `WEAK` classification independently and applies the rule.
  The divergence is a correction of severity, not a new defect, and the owner
  may overrule it with an explicit expiring waiver
  (`python3 scripts/artifact-gate.py waive`) rather than a rework cycle.
- **Branch metadata is still stale in the task plan.** `CAP-001-E3-S2-tasks.md`
  records `**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`, while the work was
  done on `usr/alvaro-de-jodra/CAP-001-E3-S2` and merged in PR #33
  (`fb4e722`). A copy-paste error in the plan header, not an implementation
  defect; carried over from version 1's report and doc-sync's follow-up list.
- **`README.md` is not part of this story's change set.** It was modified by
  doc-sync commit `701e7fb` after version 1 and is a downstream stage's
  output, outside this gate's subject.
- **Task bookkeeping is consistent.** All ten checkboxes are checked and all
  ten have corroborating repository evidence; no unchecked-but-implemented
  and no checked-but-missing task was found.
- **CAP-001-E3-S1 played no part.** Its unmerged branch is not an ancestor of
  `HEAD`, and `src/factorflow/ingestion/massive/client.py` does not exist on
  `main`; references to it in this story's docstrings and in T009 are forward
  references, as they were at version 1.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: resolve IR-001 in `tests/unit/test_massive_bars.py` —
  make `test_unix_millis_convert_to_session_date_via_timezone_aware_utc` fail
  under `TZ=UTC` when `tz=UTC` is dropped from
  `DailyBar._millis_to_utc_session_date`, replace the vacuous line-59
  assertion, and re-record `mutation-2-timestamp-conversion` in
  `CAP-001-E3-S2-tdd-evidence.yaml` with the mutation demonstrated caught
  under `TZ=UTC`. No production change is required for this finding. Then
  rerun this review. IR-002 through IR-008 remain accepted warnings and are
  not part of the required action; IR-003 and IR-004 concern values that
  enter append-only history and should be resolved before CAP-001-E4's
  observation writer begins, and IR-006 needs an owner decision now that
  CAP-001-E4's task plans are on `main`.
- **Warnings accepted downstream**: N/A — the verdict is `CHANGES-REQUIRED`.
