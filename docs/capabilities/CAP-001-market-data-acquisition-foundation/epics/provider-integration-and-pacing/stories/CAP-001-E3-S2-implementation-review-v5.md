---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E3-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-10-10T21:00:34Z"
reviewed_head: "a181426c22355f2ae6ab12613bed5eb9e0867af8"
review_base: "be332b1fde1176929c605c3d1ff04edd2a8630dc"
reviewed_state_revision: "sha256:b1456c109e25cf6f8818ec46ffd0eaa9a1ae53d6c06d1350f76c9420eb72dfb5"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S2
    artifact_version: 1
    content_revision: sha256:9210129541656c213b2c70936e85c9408efaa5ac53eff02abed9e218419a0171
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-10T21:00:34Z
  source_artifacts:
    - id: CAP-001-E3-S2
      version: "1"
    - id: CAP-001-E3-S2-tasks
      version: "1"
    - id: CAP-001-E3-S2-implementation-review
      version: "4"
    - id: CAP-001-component-design-massive-client
      version: "12"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-observation-writer
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S2 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

This is a re-review of a story that has been on `main` since PR #38 (follow-up
PR #61). It is not a rework cycle. v4 passed at `5e7f04c`, doc sync followed at
`3fcca88`, and the derived state then reopened the gate:

```
adversarial-review: RESUME — component repository changed after the latest passing review,
in files no other passing review covers: tests/unit/test_massive_actions.py,
tests/unit/test_massive_bars.py, tests/unit/test_massive_financials.py,
tests/unit/test_massive_reference.py
```

The question for this review: do E3-S2's seven criteria and ten tasks still hold
on `main` at `a181426`, after every change since v4 to the files this story
delivered? They do.

**None of the three trigger commits is E3-S2's, and none touches an E3-S2
test.** Each of the four modules was created by this story (T001), and
CAP-001-E3-S1 later appended its `MassiveClient` tests below a
`# --- MassiveClient.… (CAP-001-E3-S1)` marker in each one. Every post-v4 hunk
lands in one of those E3-S1 sections:
- `26cfe3c` (integration automation, `integration-tests-automation-tasks.md`)
  added `# Implements TC-INT-021/022/024/025` markers to six E3-S1 tests. It
  also added four `assert_called_once_with` checks to E3-S1's
  `test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol`.
- `16fe009` and `f7baf77` (EXP-20261009-1) rewrote E3-S1's
  `test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol`
  to autospec `RESTClient`. They also added the two module-level imports that
  test needs (`inspect`, `massive.RESTClient`).

Above each section marker, the E3-S2 portion of all four modules is
byte-identical to v4, apart from those two import lines. `models.py`, both
`__init__.py` files, `test_massive_package_boundary.py` and all ten fixtures have
the same Git blob as at `5e7f04c`.

**Everything was re-verified on HEAD, not carried forward.** All seven required
commands pass, the full suite being 925 tests (654 non-postgres, 271 postgres).
This reviewer built and ran 14 mutants against a scratch copy of the package:
11 were killed. The three survivors are one known optional gap (the upper
millisecond bound, noted since v3), v4/IR-001 reproducing unchanged, and one new
gap. Since v4, the E4 observation writer and runner have started consuming
these models. Both use only product-named attributes, and the writer stores
`provider_filing_date` in its own column while taking `observed_on` from its
caller. So DAC-E3-12 and AC-5 also hold downstream.

**Findings: four carried, one new, no blocker.**
- v4/IR-001 (MEDIUM), IR-002 (LOW) and IR-005 (LOW) concern files that have not
  changed, so they are carried as IR-001, IR-002 and IR-004.
- v4/IR-003 is superseded. The E3-S2 evidence now records the propagation, and
  E4-S3's own implementation gate has since verified the propagated plan content.
- v4/IR-004 (provenance) is still open and is carried as IR-003, together with
  the reconciliation item E3-S2's evidence still lists as outstanding.
- New: IR-005 (LOW). The `bool` exemption in the extra-field `Decimal` coercion
  is unpinned. With it removed, the suite stays green, and a boolean extra then
  raises a raw `decimal.InvalidOperation` instead of a `ValidationError`.

One upstream item is recorded but not raised: the ratios contract.
`component-design-massive-client.md` §14 item 7 holds it open for the capability
owner (Scope and Plan Deviations).

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, which is also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S1-S2-rereview`. It has no commits of its own: HEAD's tree `4aa7ad2` equals `origin/main`'s tree, and `origin/main` is the PR #101 merge `fe65413`, whose first parent is HEAD. |
| HEAD | `a181426c22355f2ae6ab12613bed5eb9e0867af8` |
| Review base | The story's original base, `be332b1fde1176929c605c3d1ff04edd2a8630dc`, as recorded by v1, v2 and v3. It is an ancestor of HEAD (`git merge-base --is-ancestor`, exit 0), and so are v4's base `0ccc29f` and v4's HEAD `5e7f04c`. |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty). |
| Changed files reviewed | 18 story-delivered implementation files, all re-read at HEAD: 4 modified since v4 by non-E3-S2 commits, 14 byte-identical. 5 documentation paths were also read, for bookkeeping and dispositions. |
| Pipeline state (before) | `adversarial-review: RESUME`, triggered by the four test modules above |
| Review timestamp | 2026-10-10T21:00:34Z |

### Review-base note

`python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2`
returns HEAD itself (`a181426`), because the story is merged and the branch has no
commits of its own. That base yields an empty diff, so it cannot identify E3-S2's
change set.

The widest honest alternative is just as unusable. `be332b1..HEAD` spans 395
changed paths, 207 of them outside `docs/`, nearly all from other stories.

This review therefore follows CAP-001-E1-S6 v6. That report kept the original
base, scoped the review to the story-delivered files at HEAD, and attributed
every later commit touching them since the prior review's `reviewed_head`. This
story's own v3 and v4 handled their merged predecessors the same way. The
approach is sound here, for four reasons:

1. **The base is recorded and reachable.** `be332b1` is the base v1–v3 recorded
   for this story's original change set, and it is an ancestor of HEAD.
2. **The file inventory is closed and derivable from E3-S2's own commits.** It
   is `20d1842`, `7393560`, `883700d`, `2099be9` and `433c13c` (original),
   `e78af9f` (v2 rework) and `5e7f04c` (follow-up). Their non-documentation paths
   are exactly the 18 files below.
3. **Every later change to those files is enumerable and attributable.**
   `git log 5e7f04c..HEAD` over the 18 paths returns exactly `26cfe3c`, `16fe009`
   and `f7baf77`. Each hunk falls inside an E3-S1-owned section, or (for two
   import lines) serves only an E3-S1 test.
4. **The harness agrees.** Its RESUME trigger names exactly the four files those
   commits touched. Its internal `story_files_changed` probe resolves v4's
   reviewed commit to `5e7f04c`, with a complete inventory and the same four
   changed paths.

The `review_base` value alone does not define the review set; the file inventory
does. The INCONCLUSIVE condition in SKILL.md §A.5 ("cannot be separated from
unrelated work") therefore does not apply.

### Changed Files

| File | State since v4 (`5e7f04c..HEAD`) | Story/Task Justification |
|------|----------------------------------|--------------------------|
| `src/factorflow/ingestion/__init__.py` | unchanged (blob `9f21c15939c9`, same as v4) | T001 |
| `src/factorflow/ingestion/massive/__init__.py` | unchanged (blob `c8e912f91e5c`, same as v4) | T001, T009 |
| `src/factorflow/ingestion/massive/models.py` | unchanged (blob `11850174bcbd`, same as v4) | T007, T008 |
| `tests/fixtures/massive/action_dividend.json` | unchanged | T005, T006 |
| `tests/fixtures/massive/action_ipo.json` | unchanged | T005 |
| `tests/fixtures/massive/action_split.json` | unchanged | T005, T006 |
| `tests/fixtures/massive/action_ticker_change.json` | unchanged | T005, T006 |
| `tests/fixtures/massive/bar_otc.json` | unchanged | T003 |
| `tests/fixtures/massive/bar_regular.json` | unchanged | T002, T003, T006 |
| `tests/fixtures/massive/financial_annual.json` | unchanged | T002, T004, T006 |
| `tests/fixtures/massive/financial_quarterly.json` | unchanged | T004 |
| `tests/fixtures/massive/reference_active.json` | unchanged | T002, T006 |
| `tests/fixtures/massive/reference_delisted.json` | unchanged | T002 |
| `tests/unit/test_massive_actions.py` | **modified by `26cfe3c`** (+22). It adds `# Implements TC-INT-024` and four SDK-call assertions to E3-S1's `test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` (`:214-263`). The E3-S2 portion (`:1-210`) is byte-identical to v4. | T001, T002, T005, T006. The added lines are justified by `integration-tests-automation-tasks.md` and touch no E3-S2 function. |
| `tests/unit/test_massive_bars.py` | **modified by `26cfe3c`** (+2). It adds `# Implements TC-INT-022` above two E3-S1 `fetch_daily_bars` tests (`:195`, `:232`). The E3-S2 portion (`:1-191`) is byte-identical. | T001, T003, T006. Same justification. |
| `tests/unit/test_massive_financials.py` | **modified by `16fe009` and `f7baf77`** (EXP-20261009-1). They add `import inspect` (`:8`) and `from massive import RESTClient as RealRESTClient` (`:16`), and rewrite E3-S1's `test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol` (`:265-306`) to autospec `RESTClient` and bind kwargs against the real SDK signature. Apart from the two imports, the E3-S2 portion (`:1-217`) is byte-identical. | T001, T004, T006. Justified by expedited change EXP-20261009-1. The imports are used only by the E3-S1 test. |
| `tests/unit/test_massive_reference.py` | **modified by `26cfe3c`** (+3). It adds `# Implements TC-INT-021` (×2) and `TC-INT-025` (×1) above three E3-S1 `fetch_reference` tests. The E3-S2 portion (`:1-125`) is byte-identical. | T001, T002, T006. Same justification as the other `26cfe3c` changes. |
| `tests/unit/test_massive_package_boundary.py` | unchanged (blob `9f508349880e`, same as v4) | T009, DAC-E3-12. A justified deviation since v4. |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md` | `3fcca88` moved `status: in-review` to `docs-sync`. The content revision is unchanged (`sha256:9210129…`, equal to the approved `reviewed_revision`). | Lifecycle metadata (doc sync) |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tasks.md` | `61e658a` added `docs_synced_review: CAP-001-E3-S2-implementation-review-v4.md`. No task text or checkbox changed. | Lifecycle metadata |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tdd-evidence.yaml` | `3fcca88`: `open_items[0]` and `review_v3_rework.description` now record the E4-S3 propagation, and the `review_v4_doc_sync` block was added. | T010 evidence; doc sync. Basis for the v4/IR-003 disposition. |
| `README.md` | The `## Massive provider response models` section (`README.md:355-428`) is byte-identical to its `3fcca88` text. The other README changes since then belong to other stories. | Doc sync; excluded from the code fingerprint |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md` | E4-S3 story-coding (`d402d54`, `0f5603b`) checked its tasks and recorded a T011 deviation. `ai_provenance` (`:13-32`) is unchanged since v4. | Read only for v4/IR-003 and IR-004. Not an E3-S2 deliverable. |

No unjustified file. `pyproject.toml` and `uv.lock` changed since v4 only to add
`hypothesis` and `sortedcontainers` (E4-S4, E4-S7 and E6-S1). `pydantic` is
still 2.13.5 and `massive` still 2.8.0, so the libraries these models depend on
are unchanged. `errors.py` (`wrap_validation_error`, the classifier for
DAC-E3-S2-4) is unchanged since v4.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E3-12 | SATISFIED | `models.py:114-123`, `:163-171`, `:252-261`, `:326-327`: every wire name appears only inside `Field(alias=…)`. `massive/__init__.py:55-71` re-exports only `factorflow`-defined names. | `test_massive_{reference,bars,financials}.py::test_parses_wire_shape_into_product_vocabulary`; the four action-mapping tests (`test_massive_actions.py:63-109`); `test_massive_package_boundary.py` (3 tests) | Re-verified against the new downstream consumers. `writer.py` and `runner.py` import `factorflow.ingestion.massive.models` and read only product-named attributes (`writer.py:205-208`, `:268-273`, `:307-308`). Nothing outside the package reads `model_extra` (grep: no match). M7 (filing date exposed under its wire name) fails 3 tests. The boundary test's hole is IR-001. |
| AC-5 | SATISFIED | `models.py:255` `provider_filing_date: date = Field(alias="filing_date")`; docstring `:236-240`. No model declares `observed_on`, `run_id` or `recorded_at`. | `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` (TC-COMP-005, `:90-99`); the four `test_value_payload_*` tests | M8 (adds `observed_on` to `FinancialStatement`) fails 2 tests. The writer, which consumes this downstream, inserts `provider_filing_date` into its own column and `observed_on` from its caller (`writer.py:259-274`). Probe: `"fiscal_period" in FinancialStatement.model_fields` is `False`, as the 2026-09-20 owner decision requires. |
| DAC-E3-S2-1 | SATISFIED | `models.py:163-171`: `t`→`session_date`, `o`→`open_price`, `h`→`high_price`, `l`→`low_price`, `c`→`close_price`, `v`→`volume`, `vw`→`vwap`, `n`→`transaction_count` | `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` (TC-COMP-215, `:79-93`); 8 parametrized deletions (`:160-170`) | M1 (`h`/`l` aliases swapped) fails TC-COMP-215. |
| DAC-E3-S2-2 | SATISFIED | `models.py:173-192`: a `mode="before"` validator using `datetime.fromtimestamp(value / 1000, tz=UTC).date()`, with a magnitude bound (`:78-79`, `:190-191`) and rejection of non-numeric and `bool` input (`:188-189`) | `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` (TC-COMP-216, `:96-119`), `::test_earliest_massive_advanced_bar_is_within_millis_bound`, `::test_non_numeric_t_is_rejected_rather_than_coerced`, `::test_t_expressed_in_seconds_instead_of_milliseconds_is_rejected` | M2 (drop `tz=UTC`, host `TZ=UTC`) fails TC-COMP-216, so the self-verifying pin still discriminates. M10 (floor raised past 2003-09) fails the floor test. The story modules are green under `TZ=UTC`, `Pacific/Kiritimati` and `America/Los_Angeles`. |
| DAC-E3-S2-3 | SATISFIED | Every declared price/volume field is `Decimal` (`models.py:164-169`). `_coerce_extra_numeric_fields_to_decimal` (`:32-65`) converts extras through `Decimal(str(v))`, recursing into dicts and lists. | `test_massive_bars.py::test_no_field_is_typed_float`; `test_massive_financials.py::test_monetary_values_are_decimal_not_float` (TC-COMP-217), `::test_nested_extra_numeric_values_are_coerced_to_decimal`; `test_massive_actions.py::test_split_ratio_values_are_decimal_not_float`, `::test_dividend_cash_amount_is_decimal_not_float` | M3 (`open_price: float`) fails 3 tests; M9 (list recursion dropped) fails the nested test. The `bool` exemption at `:50-51` is unpinned: IR-005. |
| DAC-E3-S2-4 | SATISFIED | No required field has a default. `statement_type`, `timeframe` and `action_type` are `Literal` (`models.py:258-261`, `:326`). `errors.py::wrap_validation_error` (`:206-223`) maps the `ValidationError` to `ProviderContractViolation`, and `client.py:305-307` applies it. | 22 parametrized required-field deletions across four modules (TC-COMP-218); `test_each_known_statement_type_is_accepted` (4 cases); `test_each_known_action_type_is_accepted` (4 cases); `test_unknown_statement_type_is_rejected`; `test_unknown_action_type_is_rejected`; `test_only_annual_or_quarterly_timeframe_is_accepted` | M4 (`FinancialStatement.cik` optional) fails `[cik]`. Probe: a `DailyBar` missing `n` gives `ValidationError`, and `wrap_validation_error` turns it into a `ProviderContractViolation` carrying only the summary "…for DailyBar failed model validation (1 field(s))." |
| DAC-E3-S2-5 | SATISFIED | `TickerReference.delisted_utc` (`:120`), `DailyBar.is_otc` (`:171`) and `FinancialStatement.fiscal_quarter` (`:257`) are `X \| None = None` | `test_massive_bars.py::test_otc_flag_is_optional_and_absence_is_not_false`; `test_massive_financials.py::test_fiscal_quarter_is_optional_for_annual_statements`; `test_massive_reference.py::test_active_instrument_has_no_delisted_timestamp` | M5 (`fiscal_quarter` defaults to `0`) and M6 (`is_otc` defaults to `False`) each fail their test. TC-COMP-219 is still not named in code: IR-004. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `massive/__init__.py`, `models.py` and the four planned `tests/unit/test_massive_*.py` modules exist at the planned paths. | All four modules now also host E3-S1's client tests (20 of the 86 tests collected). E3-S2's own tests number 66 (`-k "not fetch"`: 66 passed, 20 deselected). |
| T002 | complete | VERIFIED | TC-COMP-206: `test_parses_wire_shape_into_product_vocabulary` in three modules, plus the four action-mapping tests | E3-S2 portion unchanged since v4; re-run. |
| T003 | complete | VERIFIED | TC-COMP-215 and TC-COMP-216, `test_massive_bars.py:79-119` | M1 and M2 killed. |
| T004 | complete | VERIFIED | TC-COMP-005 (`:90-99`), TC-COMP-217 (`:102-113`), TC-COMP-218 (`:133-148`), and the optional quarter (`:122-130`) in `test_massive_financials.py` | M4, M5, M7 and M8 killed. TC-COMP-219's traceability comment is still absent (IR-004). |
| T005 | complete | VERIFIED | `test_massive_actions.py:63-122`: the four fixture-driven mappings and the accepted domain | Unchanged since v4. |
| T006 | complete | VERIFIED | `test_value_payload_*` in all four modules: `json.dumps`, decimal strings, no writer-owned keys. Ticker-change key set pinned at `test_massive_actions.py:194-208`. | M3 also fails the bars payload test. |
| T007 | complete | VERIFIED | The four classes at `models.py:82-345`; the `Literal` domains match `fundamental_statement_known` and `corporate_action_type_known`. | `fiscal_period` remains absent, per the recorded owner decision. |
| T008 | complete | VERIFIED | The millis validator rejects rather than coercing (`:188-191`). `_coerce_extra_numeric_fields_to_decimal` recurses. `value_payload()` on all four models, with no hashing and no writer metadata. | IR-002 (citation) and IR-005 (unpinned `bool` exemption) are carried and new LOWs on this task's code. |
| T009 | complete | VERIFIED | `massive/__init__.py:48-71`: the four models are identity-re-exported (`test_s2_product_models_are_identity_reexported_from_package`), and no SDK type is exported (M14 killed). | The task's literal "expose only the product model types" is superseded by E3-S3's and E3-S5's error-taxonomy exports, which passed their own gates. The boundary test's builtin hole is IR-001 (M13 survives). |
| T010 | complete | VERIFIED | `CAP-001-E3-S2-tdd-evidence.yaml` records the RED→GREEN cycles and mutations 1–14; `3fcca88` added `review_v4_doc_sync`. | This reviewer independently re-ran the five mutation classes T010 names (alias, timestamp, `Decimal` annotation, required field, optional field) as M1–M6. All were killed. |

All ten checkboxes are checked, and all ten have corroborating evidence on HEAD.
No task was added, and no unchecked task appears implemented.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_massive_*.py::test_parses_wire_shape_into_product_vocabulary` / TC-COMP-206 | ADEQUATE | Parses a recorded fixture, asserts product-named values, and asserts each wire name is not an attribute. M7 fails the financials case. | None |
| Action mappings (`test_massive_actions.py:63-109`) / TC-COMP-206 (corporate-action portion) | ADEQUATE | Each of four fixtures maps to `action_type` and `effective_on` with exact dates. | None |
| `test_massive_bars.py::test_aliases_map_every_wire_field_to_a_named_attribute` / TC-COMP-215 | ADEQUATE | All eight values are asserted with exact `Decimal` and `int` comparison. M1 and M3 fail it. | None |
| `test_massive_bars.py::test_unix_millis_convert_to_session_date_via_timezone_aware_utc` / TC-COMP-216 | ADEQUATE | Pins `America/Los_Angeles`, proves the pin took effect (`:108`), asserts both sides of UTC midnight, and restores in `finally`. M2 fails it under `TZ=UTC`. | None |
| `test_massive_financials.py::test_monetary_values_are_decimal_not_float` / TC-COMP-217 | ADEQUATE | Exact `Decimal` equality plus `isinstance`, over two fixtures. | None |
| `test_massive_*.py::test_missing_required_field_fails_validation` / TC-COMP-218 | ADEQUATE | 22 parametrized deletions, each expecting `ValidationError`. M4 fails `[cik]`. | None |
| `test_otc_flag_is_optional_and_absence_is_not_false`, `test_fiscal_quarter_is_optional_for_annual_statements` / TC-COMP-219 | ADEQUATE | `is None` against a real alternative (`is True`, `== 1`). M5 and M6 fail them. | Neither names TC-COMP-219 (IR-004). |
| `test_massive_financials.py::test_filing_date_is_preserved_as_a_descriptive_attribute_only` / TC-COMP-005 | ADEQUATE | Asserts the value under the product name and the absence of any as-of attribute. M7 and M8 fail it. | The restatement half belongs to E4's writer. |
| `test_massive_*.py::test_value_payload_*` (T006) | ADEQUATE | JSON round-trip, exact decimal strings, absence of all three writer-owned keys. | None |
| `test_massive_financials.py::test_nested_extra_numeric_values_are_coerced_to_decimal` | ADEQUATE | Nested dict and list values become `Decimal` and serialize as strings. M9 fails it. | No test pins the `bool` exemption beside it (IR-005; M12 survives). |
| `test_massive_bars.py::test_earliest_massive_advanced_bar_is_within_millis_bound` | ADEQUATE | 2003-09-01 parses. M10 fails it. | `_MAX_PLAUSIBLE_MILLIS` is still uncovered (M11 survives). This has been known since v3 and is low-value, because a microsecond value still fails with year out of range. |
| `test_each_known_statement_type_is_accepted`, `test_each_known_action_type_is_accepted` | ADEQUATE | Pin the accepted half of both DDL domains. | `[ratios]` validates a statement-shaped payload the SDK never returns. This is the upstream open item, not a test defect (Scope and Plan Deviations). |
| `test_massive_package_boundary.py::test_s2_product_models_are_identity_reexported_from_package` | ADEQUATE | `is`-identity against `models.*`. | None |
| `test_massive_package_boundary.py::test_every_public_export_is_product_owned` (supplementary) | WEAK | M14 (SDK `BadResponse` exported) fails it. | It treats every builtin-typed export as product-owned. M13 (a list of raw wire dicts) passes (IR-001). |
| `test_massive_package_boundary.py::test_public_surface_contains_no_raw_dictionary_or_massive_sdk_value` (supplementary) | WEAK | M14 fails it. | Same hole as the test above: M13 passes (IR-001). |

The two WEAK tests are supplementary regressions that no plan task requires.
Every mandatory TC-COMP mapping (005, 206, 215–219) is ADEQUATE.

Isolation and determinism: the model tests use no mocks. They load fixtures
resolved from `__file__`, and the only global state they touch, `TZ`, is restored
through `monkeypatch.context()` plus `time.tzset()`. The E3-S1 tests in the same
modules mock only `RESTClient`. After EXP-20261009-1, one of them autospecs it,
which tightens rather than loosens it.

## Independent Validation

Every command below was run by this reviewer on
`usr/alvaro-de-jodra/CAP-001-E3-S1-S2-rereview` at `a181426`, in
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`. Each
ran with the Bash sandbox lifted, because `uv` and `pytest` write ignored caches
inside `repos/` and the postgres suite needs the Docker socket.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py` | repo root | 0 | PASS | 83 passed in 0.29s. The task plan's story-specific command, run first. |
| `uv run pytest -q -m 'not postgres'` | repo root | 0 | PASS | 654 passed, 271 deselected, 2 warnings in 14.46s |
| `uv run pytest -q` | repo root | 0 | PASS | 925 passed, 2 warnings in 219.21s. Docker 28.3.2 confirmed up beforehand (`docker info`). No skips. |
| `uv run ruff check .` | repo root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | repo root | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | repo root | 0 | PASS | Success: no issues found in 47 source files |
| `uv build` | repo root | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |
| `uv sync --all-extras` | repo root | N/A | NOT RUN | Not in E3-S2's task plan. The environment was already synced, and running it would mutate `.venv`. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | repo root | N/A | NOT RUN | Not in the task plan's command list, and no frontend file is in the review set. `tech-stack.md:350` records that `npm run test` writes into the API static directory. |

Supplementary runs, all exit 0:
- The four story modules plus `test_massive_package_boundary.py` gave 86 passed.
  They gave 86 passed again under each of `TZ=UTC`, `TZ=Pacific/Kiritimati` and
  `TZ=America/Los_Angeles`.
- `-k "not fetch"` over the five modules gave 66 passed, 20 deselected. Those 66
  are the E3-S2-owned tests.

Supporting commands, all read-only:
- `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack`:
  exit 0, PASSED.
- `python3 scripts/pipeline-state.py check … --stage adversarial-review`: RESUME,
  quoted above.
- `python3 scripts/pipeline-state.py review-base`: `a181426`.
- `python3 scripts/artifact-gate.py revision`: `sha256:9210129…`.
- `python3 scripts/pipeline-state.py code-revision`: `sha256:b1456c1…`, the same
  before and after validation.

### Mutation reproduction

`src/factorflow` and the five story modules, with their fixtures and
`conftest.py`, were copied to a scratch directory outside the repository and
mutated there. Each run used `PYTHONPATH` set to the copy,
`PYTHONDONTWRITEBYTECODE=1` and `-p no:cacheprovider`. A probe confirmed that
`factorflow.__file__` resolved to the copy. The unmutated baseline gave 86 passed.

| Mutation | Observed |
|----------|----------|
| M1 `high_price`/`low_price` aliases swapped | 1 failed: TC-COMP-215 |
| M2 `tz=UTC` dropped, host `TZ=UTC` | 1 failed: TC-COMP-216 |
| M3 `open_price: float` | 3 failed: TC-COMP-215, `test_no_field_is_typed_float`, bars payload |
| M4 `FinancialStatement.cik` optional | 1 failed: TC-COMP-218 `[cik]` |
| M5 `fiscal_quarter` default `0` | 1 failed: `test_fiscal_quarter_is_optional_for_annual_statements` |
| M6 `is_otc` default `False` | 1 failed: `test_otc_flag_is_optional_and_absence_is_not_false` |
| M7 attribute renamed `filing_date` | 3 failed: TC-COMP-206 (financials), TC-COMP-005, financials payload |
| M8 `observed_on` added to `FinancialStatement` | 2 failed: TC-COMP-005, financials payload |
| M9 list recursion dropped from the coercion | 1 failed: `test_nested_extra_numeric_values_are_coerced_to_decimal` |
| M10 `_MIN_PLAUSIBLE_MILLIS` raised to `1_100_000_000_000` | 1 failed: `test_earliest_massive_advanced_bar_is_within_millis_bound` |
| M11 upper millis bound removed from the comparison | **86 passed**: known since v3, optional (see test table) |
| M12 `bool` exemption removed from `_coerce_value` | **86 passed**: basis for IR-005 |
| M13 `RAW_WIRE_PAGE = [{"t": 1, "o": 2}]` added to `__all__` | **86 passed**: v4/IR-001 reproduces unchanged (IR-001) |
| M14 `massive.exceptions.BadResponse` added to `__all__` | 2 failed: both boundary origin tests |

Read-only probes, run in an isolated interpreter (`-I`):
- **The `bool` exemption and M12.** With the current `models.py`, a
  `CorporateAction` with extras `is_reverse: False` and `nested.flag: True` keeps
  both as `bool` and serializes them as JSON booleans. Under M12 the same input
  raises `decimal.InvalidOperation`, which is not a `ValueError` and so is not
  wrapped into a `ValidationError`.
- **A ratios row in the SDK's shape.** The probe used `massive` 2.8.0's
  `FinancialRatio` fields (`ticker`, `cik`, `date` and the ratio values). With
  `statement_type="ratios"`, `FinancialStatement.model_validate` raises
  `ValidationError` on `filing_date`, `fiscal_year`, `period_end`, `tickers` and
  `timeframe`.
- **Classification.** A `DailyBar` missing `n`, passed through
  `wrap_validation_error`, gives `ProviderContractViolation`.
- **`fiscal_period`.** It is not in `FinancialStatement.model_fields`.

The two `pytest` warnings are third-party `anyio`/`starlette` deprecation notices
from `.venv`, unrelated to this story.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` was empty. `HEAD` was `a181426c22355f2ae6ab12613bed5eb9e0867af8`. `code-revision` was `sha256:b1456c109e25cf6f8818ec46ffd0eaa9a1ae53d6c06d1350f76c9420eb72dfb5`.
- After: `git status --porcelain=v1 --untracked-files=all` was empty. `HEAD` and `code-revision` were unchanged.
- Unexpected tracked-file changes: none.
  - `uv build` rewrote the ignored `dist/` and `build/`.
  - `pytest`, `ruff` and `mypy` refreshed their ignored caches.
  - All mutants and probes were written under the session scratchpad, never into
    the repository.
  - No branch was switched and no ref moved. Nothing was fetched, pulled, reset,
    stashed or committed.
  - The concurrent sibling report `CAP-001-E3-S1-implementation-review-v5.md` was
    not present at either check. If it appears, it is a `docs/` path outside this
    review set and outside the code fingerprint.

## Findings

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| IR-001 | MEDIUM | OPEN | The package-boundary test declares every builtin-typed export product-owned (carried from v4/IR-001) |
| IR-002 | LOW | OPEN | The `_MIN_PLAUSIBLE_MILLIS` rationale cites a design section that does not contain its premise (carried from v4/IR-002) |
| IR-003 | LOW | OPEN | `CAP-001-E4-S3-tasks.md` still carries provenance that does not match the commit that wrote it (carried from v4/IR-004) |
| IR-004 | LOW | OPEN | TC-COMP-219 has no traceability comment anywhere in the test suite (carried from v4/IR-005) |
| IR-005 | LOW | OPEN | The `bool` exemption in the extra-field `Decimal` coercion is unpinned |

### IR-001 — The package-boundary test declares every builtin-typed export product-owned

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v4/IR-001; the file is unchanged)
- **Acceptance criteria**: DAC-E3-12
- **Tasks**: T009
- **Files**: `tests/unit/test_massive_package_boundary.py:16-24` (`_export_origin`), `:34-41`, `:44-49`
- **Claim challenged**: The docstring at `:45` says "raw wire dictionaries and Massive SDK values stay inside".
- **Observed evidence**: Reproduced again as M13. Adding `RAW_WIRE_PAGE = [{"t": 1, "o": 2}]` to `massive/__init__.py`'s `__all__` leaves all 86 tests green. `_export_origin` returns the boundary package's own name for any value whose type is a builtin. The `isinstance(value, dict)` guard catches only a bare dict.
- **Expected evidence/behavior**: Under SKILL.md §E.3, a plausible regression must make the test fail. T009 forbids raw wire dictionaries crossing the boundary.
- **Impact**: Forward-looking. All 15 current exports are product-owned, so DAC-E3-12 holds today. The guard reads stronger than it is.
- **Required remediation**: Either replace the blanket builtin fallback with an explicit allow-list (today, `MAX_FAILURE_REASON_VARIABLE_TEXT`), or recurse the raw-value check through list, tuple and set members. Then narrow the docstrings to what the test enforces.

### IR-002 — The `_MIN_PLAUSIBLE_MILLIS` rationale cites a design section that does not contain its premise

- **Severity**: LOW
- **Status**: OPEN (carried from v4/IR-002; `models.py` is unchanged)
- **Acceptance criteria**: DAC-E3-S2-2
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py:72`
- **Claim challenged**: The comment says "`component-design-ingestion-api.md` section 3 pins its current floor to September 2003".
- **Observed evidence**: `grep -n 2003 component-design-ingestion-api.md` still returns only line 221. That line is in §2.4a "Request bounds: the canonical set" (heading at `:208`), in the `MAX_HISTORY_DEPTH_YEARS` row. §3 starts at `:258` and does not mention 2003.
- **Expected evidence/behavior**: The citation should resolve to the fact it relies on.
- **Impact**: Documentation only. The bound is correct, and M10 confirms it is pinned.
- **Required remediation**: Cite §2.4a (the `MAX_HISTORY_DEPTH_YEARS` row) instead of section 3.

### IR-003 — `CAP-001-E4-S3-tasks.md` still carries provenance that does not match the commit that wrote it

- **Severity**: LOW
- **Status**: OPEN (carried from v4/IR-004, with the residual of v4/IR-003 folded in)
- **Acceptance criteria**: N/A (provenance)
- **Tasks**: N/A
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md:13-19`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tdd-evidence.yaml:447-450`
- **Claim challenged**: The E4-S3 plan's `ai_provenance` says an `implementation-planning-agent` run under Codex/`gpt-5.6` produced the revision at `2026-09-21T02:24:44Z`.
- **Observed evidence**:
  - That block is unchanged since v4. The commits touching the file since then
    are E4-S3 story-coding (`d402d54`, `0f5603b`), and they did not alter it.
  - The content it describes was written by E3-S2's `5e7f04c`, as v4 established.
  - E3-S2's own `review_v4_doc_sync.outstanding_gates` still lists "CAP-001-E4-S3
    planning/provenance reconciliation for IR-003 and IR-004". No commit has
    closed it.
- **Expected evidence/behavior**: Under AGT-PROV-001, `ai_provenance` names the agent, model and tool that produced the revision.
- **Impact**: Low. E4-S3's implementation gate has since verified the content (see the v4/IR-003 disposition). What remains is a provenance record that misattributes the edit, and an E3-S2 outstanding-gate entry that will never close on its own.
- **Required remediation**: Correct the E4-S3 plan's `ai_provenance` to name what actually produced the revision, or record an owner decision that accepts it as is. Then close the outstanding-gate entry in E3-S2's evidence.

### IR-004 — TC-COMP-219 has no traceability comment anywhere in the test suite

- **Severity**: LOW
- **Status**: OPEN (carried from v4/IR-005; the E3-S2 test portions are unchanged)
- **Acceptance criteria**: DAC-E3-S2-5
- **Tasks**: T004
- **Files**: `tests/unit/test_massive_financials.py:122-130`; `tests/unit/test_massive_bars.py:150-157`
- **Claim challenged**: The Phase 2 checkpoint says TC-COMP-005, 206 and 215–219 "are represented with traceability comments".
- **Observed evidence**: `grep -rn TC-COMP-219 tests/ src/` returns nothing. TC-COMP-215–218 and 005 are all cited in code.
- **Expected evidence/behavior**: Each mapped case is cited in code, as its siblings are.
- **Impact**: Low. The behavior is covered, and M5 and M6 confirm it. Only the specification-to-code link is missing.
- **Required remediation**: Name TC-COMP-219 in the two tests' docstrings.

### IR-005 — The `bool` exemption in the extra-field `Decimal` coercion is unpinned

- **Severity**: LOW
- **Status**: OPEN (new in v5; pre-existing since the v2 rework introduced the recursive coercion)
- **Acceptance criteria**: DAC-E3-S2-3, DAC-E3-S2-4
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/massive/models.py:49-58` (`_coerce_value`, exemption at `:50-51`)
- **Claim challenged**: The coercion exempts `bool` "at every level" (v4's evidence for DAC-E3-S2-3). T008 requires the helpers to "reject unsupported … input rather than silently coercing it".
- **Observed evidence**: M12 deletes the two-line exemption and the suite stays green (86 passed). The exemption is load-bearing, because `bool` is a subclass of `int`. Under M12, a boolean extra goes to `Decimal(str(True))` and raises `decimal.InvalidOperation` (probed). That error is neither a `ValueError` nor a `ValidationError`, so Pydantic does not wrap it. `client.py:305-307` catches only `ValidationError`, so the failure would escape `wrap_validation_error` as a raw exception instead of a `ProviderContractViolation`.
- **Expected evidence/behavior**: Under SKILL.md §E.3, a plausible regression must make a test fail. Dropping a `bool` special case is a familiar Python simplification.
- **Impact**: Low. No documented field of the seven `extra="allow"` endpoint shapes is boolean today. §2.5 lists none, and none of the `massive` 2.8.0 `Split`, `Dividend`, `IPOListing`, `TickerChange*`, `BalanceSheet`, `IncomeStatement`, `CashFlowStatement` or `FinancialRatio` models declares a `bool`. Exposure needs both the regression and a provider addition.
- **Required remediation**: Add a test with a top-level and a nested boolean extra on `FinancialStatement` or `CorporateAction`. It should assert that both stay `bool` (not `Decimal`) in `model_extra` and in `value_payload()`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-001 (MEDIUM): the boundary test declares every builtin-typed export product-owned | STILL OPEN, carried as IR-001 | `test_massive_package_boundary.py` blob `9f508349880e` is unchanged since `5e7f04c`; M13 still gives 86 passed. |
| v4/IR-002 (LOW): the `_MIN_PLAUSIBLE_MILLIS` comment cites §3 instead of §2.4a | STILL OPEN, carried as IR-002 | `models.py` blob is unchanged; `:72` still says "section 3", and `grep 2003` still matches only `component-design-ingestion-api.md:221` (§2.4a). |
| v4/IR-003 (MEDIUM): a sibling plan was rewritten inside E3-S2's change set, and E3-S2's evidence described the work as pending | SUPERSEDED | The evidence half was fixed in `3fcca88`. `CAP-001-E3-S2-tdd-evidence.yaml` `open_items[0]` is now `resolved-by-attended-owner-decision-and-propagated`, worded in the past tense, and `review_v3_rework.description` names the propagation. That satisfies the remediation's "do not leave the edit in place while the evidence describes it as pending". The planning-gate half has been overtaken. E4-S3 was coded against that plan and passed its own implementation gate: v2 `PASS-WITH-WARNINGS` at `0f5603b`, with T002 and T010 VERIFIED and the fiscal-period tests ADEQUATE. `writer.py:222` `_derive_fiscal_period` implements the derivation. Reverting the edit (option b) is no longer meaningful, and the remaining reconciliation entry is carried in IR-003. |
| v4/IR-004 (LOW): `CAP-001-E4-S3-tasks.md` provenance misattributes the edit | STILL OPEN, carried as IR-003 | `CAP-001-E4-S3-tasks.md:13-19` still reads `implementation-planning-agent` / `gpt-5.6` / `Codex` / `2026-09-21T02:24:44Z`. |
| v4/IR-005 (LOW): no traceability comment for TC-COMP-219 | STILL OPEN, carried as IR-004 | `grep -rn TC-COMP-219 tests/ src/` gives no match. |

## Scope and Plan Deviations

- **Post-v4 changes to story-delivered files are not E3-S2 scope leakage.**
  `26cfe3c` is justified by the integration automation plan
  (`integration-tests-automation-tasks.md`; DEC-0023, DEC-0024, DEC-0028), and
  `16fe009` and `f7baf77` by expedited change EXP-20261009-1. All three change
  only E3-S1-owned tests, or imports used only by them. They are why the harness
  reported RESUME. EXP-20261009-1 has a passing expedited review (v2,
  `PASS-WITH-WARNINGS`), but the harness cannot bind it to a commit.
  `expedited_reviewed_commit` returned empty because its fingerprint matches none
  of the recent commits touching its paths. The integration automation has no
  automation review yet, and E3-S1's latest passing review (v4, reviewed commit
  `7795735`) predates all three commits. A sibling E3-S1 re-review is in progress.
- **Justified deviation, unchanged since v4:** `tests/unit/test_massive_package_boundary.py`
  is a fifth module that T001 does not enumerate. Its strength is assessed under IR-001.
- **T009 literal, unchanged since v4:** "expose only the product model types" is
  superseded by the error-taxonomy exports of E3-S3 and E3-S5.
- **Upstream observation, not a finding: the ratios contract.**
  `component-design-massive-client.md` §14 item 7 (v12) records specification
  review v6 FINDING-2 and EXP-20261009-1 ER-003. `massive` 2.8.0's
  `list_financials_ratios` returns `FinancialRatio` rows carrying `ticker`, `cik`,
  `date` and ratio values, but no `tickers`, `period_end`, `filing_date`,
  `fiscal_year` or `timeframe` (`.venv/…/massive/rest/models/financials.py:812-835`).
  The probe above shows that such a row fails `FinancialStatement` validation, so
  every real ratios read would become a `ProviderContractViolation`. The E3-S2
  fixture `financial_quarterly.json` (labelled `ratios`) is statement-shaped and
  names its value `current_ratio` where the SDK says `current`. This is not raised
  against E3-S2, because the governing design still states "four sibling
  endpoints under one shape" (§2.5). §14 item 7 also says "Sections 2.5 and 11 are
  left as they stand until the owner decides". The owner is the capability owner,
  and the item blocks "the ratios read and AC-3's fundamentals for ratios". E3-S2
  implements the design as written. Failing it here would invent a requirement.
- **Bookkeeping notes, not findings:**
  - The task plan header still names branch `usr/alvaro-de-jodra/CAP-001-E2-S4`,
    unchanged since v1.
  - The story stays `status: docs-sync` under the recorded 2026-09-21 owner
    decision deferring Phase 6b automation.
  - The task plan's `docs_synced_review` names v4, so the next doc sync will need
    to confirm against v5. The README section is unchanged, and no E3-S2 behavior
    changed.
- **Tooling note:** `review-base` resolving to HEAD on a merged story is the
  condition the review-base note addresses. It did not affect the verdict.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Commit this untracked report on `usr/alvaro-de-jodra/CAP-001-E3-S1-S2-rereview`
    and push the branch. `doc-sync` for CAP-001-E3-S2 stays blocked until the
    report is committed.
  - Then run `$doc-sync` against v5. No E3-S2 production or test line changed
    since v4, and the README section is byte-identical to its last sync, so the
    sync is expected to confirm the documentation and move `docs_synced_review`
    to v5.
  - Separately, when the capability owner decides `component-design-massive-client.md`
    §14 item 7 (ratios), E3-S2's `FinancialStatement`, the `financial_quarterly.json`
    ratios fixture and `test_each_known_statement_type_is_accepted[ratios]` will
    need re-planning.
  - IR-003 needs either a provenance correction or an owner decision. IR-001,
    IR-002, IR-004 and IR-005 are test-strength and traceability improvements
    that can go into any later pass touching these files. None blocks doc sync.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW), IR-003 (LOW), IR-004 (LOW), IR-005 (LOW)
