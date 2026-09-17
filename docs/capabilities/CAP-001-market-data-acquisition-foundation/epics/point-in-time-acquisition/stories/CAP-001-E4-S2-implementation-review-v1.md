---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-17
updated: 2026-09-17
story_id: "CAP-001-E4-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-17T22:33:19Z"
reviewed_head: "c9b5ceae5119b4b7c352115946630ef39ee6b392"
review_base: "eefe8614fe62adcd0c417c7ace266f761e132e95"
reviewed_state_revision: "sha256:463fbed31bc44f3483859ab13aba4b980cf58357b1ba24831e20c1284a95991f"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E4-S2
    artifact_version: 1
    content_revision: sha256:93ae06c8b405b39f77aa63a24f889908a6b2d5429687b3e1a7e8664b28dc93cc
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-09-17T22:33:19Z
  source_artifacts:
    - id: CAP-001-E4-S2
      version: "1"
    - id: CAP-001-E4-S2-tasks
      version: "1"
    - id: CAP-001-component-design-observation-writer
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 4/4 verified |
| Required validation | 17/17 passed |

`src/factorflow/ingestion/hashing.py` implements the canonicalization and fingerprint
contract exactly as specified by `component-design-observation-writer.md` §2.3 and the
story's derived criteria, and the evidence supporting it survived independent
reproduction rather than being accepted from the coding agent's report.

Three things were verified first-hand rather than read. First, canonical semantics: a
direct probe of 18 input shapes confirmed sorted keys, `(',', ':')` separators with no
whitespace, `Decimal` rendered as its exact string form (`Decimal('1.10')` →
`"1.10"`, distinct from `Decimal('1.1')`), and `TypeError` for every unsupported input
— `float` (top-level and nested in a list), `date`, `datetime`, `tuple`, `set`,
`bytes`, and non-`str` dictionary keys — with no `str()`/`repr()` fallback anywhere.
Second, independent-process determinism: four separate interpreter processes, three
with distinct `PYTHONHASHSEED` values and one with reordered keys, all produced
`2714464a21c390ddb3e17648a6136144b72389c99d090392fe822e1ed8601d7f`, matching the hex
recorded in `CAP-001-E4-S2-tdd-evidence.yaml` and confirming 32 raw `bytes`. Third,
regression sensitivity: seven mutations were applied out-of-tree (via a `/tmp` pytest
plugin that rebinds the module functions, leaving the repository untouched) and every
one was caught by a named test, reproducing the four mutations the coding agent
recorded with identical failing test names and pass/fail counts, plus three the agent
did not attempt — non-compact separators, a same-length `blake2b` substitution for
SHA-256, and a silent `str()` fallback for unsupported objects. The RED claim, which
cannot be re-observed now that the module exists, was corroborated by blocking the
import and reproducing the recorded `ModuleNotFoundError` collection failure.

All seventeen required validation commands were rerun independently and passed, and
the tracked working tree was byte-clean before and after — including after `npm run
build` and `npm run test`, which write only into the git-ignored
`src/factorflow/api/static/` bundle. The `origin/main` merge at `8281d9c` carrying
EXP-20260917-1 is a clean merge: `git diff-tree -c` reports no combined changes, so no
evil-merge edits were smuggled in, and the story change set remains exactly five files.

The three findings are all LOW and none touches a criterion, task, or command. Two are
evidence-quality notes (an unimplemented story Testing bullet whose omission the task
plan explicitly justified, and a stale branch field in the plan header); the third
records a type-collision boundary that follows necessarily from the approved design
rather than from any implementation error.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S2-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S2` (ahead 3 of `origin/main`) |
| HEAD | `c9b5ceae5119b4b7c352115946630ef39ee6b392` |
| Review base | `origin/main` merge base `eefe8614fe62adcd0c417c7ace266f761e132e95` |
| Working tree | Clean — `git status --porcelain` empty; no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 5 |

Branch commits reviewed, base-exclusive:

| Commit | Subject | Role |
|--------|---------|------|
| `e7e0d10` | CAP-001-E4-S2: preserve stopped story-coding stage | Initial stopped stage — added implementation and tests, ticked T001–T003 |
| `8281d9c` | Merge remote-tracking branch 'origin/main' | Clean merge absorbing EXP-20260917-1 (`f0b40c2`) static-bundle test isolation |
| `c9b5cea` | CAP-001-E4-S2: complete hashing story coding | Final evidence commit — added TDD evidence, ticked T004 |

`git diff-tree -c -r --name-status 8281d9c` returned no file rows, proving `8281d9c`
introduced no changes not already present in one of its parents.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/hashing.py` | added | AC-6; DAC-E4-3; DAC-E4-S2-1..5; T003 |
| `tests/unit/test_hashing.py` | added | T001; T002; TC-COMP-005/006/137/157–161 |
| `.../stories/CAP-001-E4-S2-tdd-evidence.yaml` | added | T004 RED→GREEN→MUTATE evidence; matches the convention already used by CAP-001-E3-S1..S5 |
| `.../stories/CAP-001-E4-S2-tasks.md` | modified | Task checkbox and `updated` bookkeeping for T001–T004 |
| `.../stories/CAP-001-E4-S2.md` | modified | `status: planning` → `in-review`, `updated` date only; frontmatter content revision still matches the approved `reviewed_revision` |

No unjustified file appears in the change set. `src/factorflow/ingestion/__init__.py`,
which T003 names, already existed at the review base (`git ls-tree eefe861`), so no
change to it was needed or made.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-5 | SATISFIED | `src/factorflow/ingestion/hashing.py:35-37` `value_hash` | `tests/unit/test_hashing.py:67` `test_changed_field_changes_the_digest` | Scope-limited by design: this story delivers only the primitive that makes a restatement distinguishable. Verified `Decimal('12.50')` vs `Decimal('12.51')` yield different digests, so the later writer's `ON CONFLICT DO NOTHING` appends rather than suppresses. The append statement itself belongs to a later E4 story. |
| AC-6 | SATISFIED | `hashing.py:29-37` — pure functions, no module-level mutable state, no `hash()`/`id()`/iteration-order dependence | `test_hashing.py:54` `test_identical_input_returns_the_same_raw_sha256_digest`; `test_hashing.py:24` order-independence | Independently confirmed across processes: four separate `uv run python` invocations (`PYTHONHASHSEED` 1, 2, 3, and `random`) all returned `2714464a…d8601d7f` for `{"b": Decimal("1.10"), "a": 1}` and its reordered twin. Identical digests are exactly what makes the later insert conflict and write nothing. |
| DAC-E4-3 | SATISFIED | `hashing.py:32` `json.dumps(..., sort_keys=True, separators=(",", ":"))`; `:17` `str(value)` for `Decimal`; `:37` `hashlib.sha256(...).digest()` | `test_hashing.py:17` exact-bytes assertion `b'{"a":"first","items":[{"a":1,"b":2}],"z":1}'`; `test_hashing.py:61` independent SHA-256 recomputation | All four mandated properties present: sorted keys (nested too), no whitespace, decimals as strings, SHA-256. The test pins canonical bytes literally and then recomputes SHA-256 over the public `canonical_json` output, so neither property can drift silently. |
| DAC-E4-S2-1 | SATISFIED | `hashing.py:25,32` — recursive dict rebuild plus `sort_keys=True` | `test_hashing.py:24` `test_dictionary_insertion_order_does_not_change_value_hash` | Fixture varies insertion order at two nesting levels (`flags` inner dict and the outer dict), so it exercises nested sorting rather than only top-level sorting. Mutating `sort_keys=True → False` fails this test and the canonical-bytes test. |
| DAC-E4-S2-2 | SATISFIED | `hashing.py:16-17` `isinstance(value, Decimal) → str(value)` before any numeric path | `test_hashing.py:32` `test_nested_decimals_render_as_exact_strings_and_preserve_scale` | Verified by direct probe: `Decimal('1.10')` → `b'{"quote":{"price":"1.10"}}'`, `Decimal('1.1')` → `"1.1"`, digests differ. Scale is preserved exactly, so no float repr enters the digest. Also confirmed `Decimal('1E+2')` and `Decimal('NaN')` serialize deterministically as `"1E+2"` and `"NaN"`. |
| DAC-E4-S2-3 | SATISFIED | `hashing.py:18-19` float rejection; `:23-24` non-`str` key rejection; `:26` catch-all `TypeError`; note the absence of any `default=` hook in `json.dumps` | `test_hashing.py:42,48,74,79` — float, unsupported object, nested-in-dict, nested-in-list | Pre-canonicalization is recursive and total: every branch either returns a JSON-native value or raises, and the probe confirmed `TypeError` for `float`, nested `float`, `date`, `datetime`, `tuple`, `set`, `bytes`, and `int` dictionary keys at both top level and nested. The `UnsupportedValue` fixture defines `__str__` returning `"silently-coerced"`, so a `str()` fallback would be observable — and injecting exactly that fallback fails three named tests. |
| DAC-E4-S2-4 | SATISFIED | `hashing.py:37` `hashlib.sha256(...).digest()` (raw digest, not `hexdigest`) | `test_hashing.py:62-63` `isinstance(first_digest, bytes)` and `len(first_digest) == 32` | Confirmed out-of-band: `type(...).__name__ == 'bytes'`, `len == 32`. Matches the observation table's `bytea` length check constraint per `component-design-market-data-store.md`. |
| DAC-E4-S2-5 | SATISFIED | `hashing.py:35-37` over the full canonical form | `test_hashing.py:67` `test_changed_field_changes_the_digest` | A one-digit change in a nested `Decimal` changes the digest. The canonical form covers every supplied field, and the module correctly excludes nothing on its own — the plan assigns `observed_on`/`run_id`/`recorded_at` exclusion to the caller, matching design §2.3's "Value only" property. See IR-003 for the `Decimal`/`str` type-collision boundary. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_hashing.py:1-71` | Every mandated element present and checked line by line: `# Implements TC-COMP-…` comments cover TC-COMP-005, 006, 137, 157, 158, 159, 160, 161 (159 twice, for the float and object paths); insertion-order independence, exact canonical bytes with `(',', ':')`, nested `Decimal('1.10')` as `"1.10"` distinct from `1.1`, changed-field inequality, a 32-byte `bytes` digest, and float plus unsupported-object rejection are all asserted. No test carries a marker, so `-m 'not postgres'` collects all nine — independently confirmed by the collection count. |
| T002 | complete | VERIFIED | `tests/unit/test_hashing.py:74-81` | Two focused error-path tests place `UnsupportedValue` inside a nested dict and inside a list. Both assert `pytest.raises(TypeError)`, so no digest is returned; the fixture's `__str__` makes a coercion fallback detectable rather than invisible. The out-of-tree fallback mutation fails both, proving they are not vacuous. |
| T003 | VERIFIED | VERIFIED | `src/factorflow/ingestion/hashing.py` | Signatures match the plan exactly (`canonical_json(value: dict[str, Any]) -> bytes`, `value_hash(value: dict[str, Any]) -> bytes`); recursion, sorted keys, compact separators, `Decimal` string preservation, float and unsupported rejection, UTF-8 encoding, and a raw 32-byte SHA-256 digest are all present. The `__init__.py` clause is NOT APPLICABLE — the package marker already existed at the review base. Justified deviation from the design snippet: the design and story use `json.dumps(default=…)`, which C-level float serialization never invokes; the implementation pre-canonicalizes recursively instead, which is the only way to honour the story's float-rejection requirement. The task plan records this conflict and resolution under "Resolved Conflicts". |
| T004 | complete | VERIFIED | `CAP-001-E4-S2-tdd-evidence.yaml`; independently rerun below | All seven Python commands the task names were rerun by this review and passed. The four mandated mutations were reproduced out-of-tree with matching failing test names and counts (sorted keys 2 failed/7 passed; decimal 1/8; float 1/8; digest algorithm 1/8). RED is honestly labelled as a prior-stage, uncommitted observation and was corroborated by reproducing the `ModuleNotFoundError` collection failure with the module's import blocked. |

Dependencies and phase checkpoints hold: T003 postdates T001/T002 in authorship order
and the RED checkpoint is consistent with both files being added in the same commit
with the module absent at the base; T004 postdates T003. Phase 1 and Phase 4 declare
no tasks and their checkpoints are met — `src/factorflow/` is still the package root,
the new tests are unmarked and therefore `not postgres`-eligible, and
`factorflow.ingestion.hashing` imports cleanly, exposing both public functions.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_canonical_json_sorts_nested_keys_and_uses_compact_separators` / TC-COMP-137 | ADEQUATE | Asserts the complete canonical byte string for a value mixing an out-of-order outer dict, a nested out-of-order dict inside a list, and a string value. A literal byte comparison leaves no room for a near-miss: key order, separator choice, and whitespace are all pinned at once. Fails under both the `sort_keys=False` and the default-separator mutations. | none |
| `test_dictionary_insertion_order_does_not_change_value_hash` / TC-COMP-157 | ADEQUATE | Hashes two dicts with identical pairs in different insertion order at two nesting levels and asserts digest equality. Proves observable digest stability rather than internal sorting. Fails under the `sort_keys=False` mutation. | none |
| `test_nested_decimals_render_as_exact_strings_and_preserve_scale` / TC-COMP-158 | ADEQUATE | Three assertions: exact canonical bytes for `Decimal('1.10')` and `Decimal('1.1')`, then digest inequality. Pins both the string form and the scale distinction the criterion calls out. Fails under the `Decimal → float()` mutation with precisely the symptom recorded (`1.1` instead of `"1.10"`). | none |
| `test_float_value_raises_instead_of_entering_the_digest` / TC-COMP-159 | ADEQUATE | `pytest.raises(TypeError)` around `value_hash({"price": 1.1})`. Asserting on `value_hash` rather than `canonical_json` proves the rejection happens before any digest is produced. Fails with `DID NOT RAISE` under the float-acceptance mutation. | none |
| `test_unsupported_object_raises_instead_of_being_coerced` / TC-COMP-159 | ADEQUATE | Uses a purpose-built `UnsupportedValue` whose `__str__` returns `"silently-coerced"`, so a `default=str` fallback would produce a digest instead of raising and be caught. Fails under the `str()`-fallback mutation. | none |
| `test_identical_input_returns_the_same_raw_sha256_digest` / TC-COMP-006, TC-COMP-137, TC-COMP-160 | ADEQUATE | Four assertions: repeat-call stability, equality with an independently recomputed `hashlib.sha256(canonical_json(value)).digest()`, `bytes` type, and length 32. The recomputation is a genuine external check rather than a restatement of implementation logic, because it is built from the separately pinned `canonical_json` output — it fails under the `sha1` mutation and, importantly, also under a same-length `blake2b(digest_size=32)` substitution that the length assertion alone would miss. | Cross-process determinism (the "across processes" half of TC-COMP-137) is proven by the task plan's out-of-band two-process check and by this review, not by an in-suite assertion. Not a gap against any named requirement; the plan assigns it to story-specific validation. |
| `test_changed_field_changes_the_digest` / TC-COMP-005, TC-COMP-161 | ADEQUATE | Changes one nested `Decimal` digit and asserts digest inequality, which is the restatement path AC-5 depends on. | none |
| `test_unsupported_value_nested_in_dictionary_raises_without_string_fallback` (T002) | ADEQUATE | Exercises the recursive dict branch, which the top-level object test does not reach. Fails under the `str()`-fallback mutation. | none |
| `test_unsupported_value_nested_in_list_raises_without_string_fallback` (T002) | ADEQUATE | Exercises the recursive list branch alongside a valid sibling element, confirming rejection is not skipped when some items are canonicalizable. Fails under the `str()`-fallback mutation. | none |

Determinism and isolation: all nine tests are pure, synchronous, and free of clock,
network, filesystem, randomness, and environment dependence; they use no mocks, fixtures,
or shared state, so no mock can bypass the unit under test or make an expected result
inevitable. Order independence follows from there being no mutable module state — the
production module holds only function and type-alias definitions. Every test is
unmarked and therefore included in `-m 'not postgres'`, as T001 requires.

Regression sensitivity was measured rather than assumed. Seven mutations applied via an
out-of-tree pytest plugin (`/tmp/ffmut`, rebinding `factorflow.ingestion.hashing`
attributes at plugin-import time; no repository file was modified):

| Mutation | Named test(s) that failed | Caught |
|----------|---------------------------|--------|
| `sort_keys=True` → `False` | `test_canonical_json_sorts_nested_keys_and_uses_compact_separators`, `test_dictionary_insertion_order_does_not_change_value_hash` (2 failed, 7 passed) | yes |
| compact separators → default whitespace separators | `test_canonical_json_sorts_nested_keys_and_uses_compact_separators`, `test_nested_decimals_render_as_exact_strings_and_preserve_scale` (2 failed, 7 passed) | yes |
| `Decimal → str()` → `Decimal → float()` | `test_nested_decimals_render_as_exact_strings_and_preserve_scale` (1 failed, 8 passed) | yes |
| float `TypeError` → accept as `str()` | `test_float_value_raises_instead_of_entering_the_digest` (1 failed, 8 passed) | yes |
| `sha256` → `sha1` | `test_identical_input_returns_the_same_raw_sha256_digest` (1 failed, 8 passed) | yes |
| `sha256` → `blake2b(digest_size=32)` (same length) | `test_identical_input_returns_the_same_raw_sha256_digest` (1 failed, 8 passed) | yes |
| unsupported-type `TypeError` → silent `str()` fallback | `test_unsupported_object_raises_instead_of_being_coerced`, `test_unsupported_value_nested_in_dictionary_raises_without_string_fallback`, `test_unsupported_value_nested_in_list_raises_without_string_fallback` (3 failed, 6 passed) | yes |

The first, third, fourth, and fifth rows reproduce the coding agent's recorded
mutations with identical failing test names and identical pass/fail counts. The second,
sixth, and seventh were added by this review and were also caught.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_hashing.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 9 passed in 0.06s; Python 3.13.7, pytest 9.1.1 |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 305 passed, 59 deselected, 2 warnings |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 364 passed, 2 warnings (full suite including postgres-marked tests) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 104 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success, no issues in 31 source files (strict mode) |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and the wheel |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Succeeded; the 3 unapproved-install-script warnings are the pre-existing condition recorded by EXP-20260917-1 |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite built in 567ms into the git-ignored static directory |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 22 test files, 105 tests passed, including the EXP-20260917-1 `build-output.test.tsx` isolation fix |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 Playwright test passed |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 47 files, no fixes applied |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 47 files, no fixes applied |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `PYTHONHASHSEED={1,2,3,random} uv run python -c '…value_hash…'` (4 independent processes) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All four printed `b'{"a":1,"b":"1.10"}'` / `2714464a21c390ddb3e17648a6136144b72389c99d090392fe822e1ed8601d7f`, length 32, type `bytes`, including the reordered-key variant; matches the hex recorded in the TDD evidence |
| Canonical-semantics probe over 18 input shapes (`uv run python - <<EOF`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `TypeError` for `float`, nested `float`, `date`, `datetime`, `tuple`, `set`, `bytes`, and non-`str` keys (top-level and nested); deterministic output for `None`, `bool`, large `int`, unicode, empty containers, `Decimal('1E+2')`, `Decimal('NaN')` |
| Mutation sweep, 7 mutants + RED reproduction (`-p mutant` / `-p blocker`, plugins in `/tmp`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Every mutant caught by a named test (table above); with the module import blocked, collection fails with `ModuleNotFoundError: No module named 'factorflow.ingestion.hashing'`, reproducing the recorded RED checkpoint |

No required command was skipped. The task plan's seven Python commands and the tech
stack's full thirteen-command validation table (`docs/constitution/tech-stack.md`
lines 323–335) were all rerun, plus the three story-specific checks in the plan's
Validation Plan.

### Validation Side Effects

- Before: `git status --porcelain` empty. Ignored-only entries: caches, `.venv/`,
  `dist/`, `node_modules/`, `test-results/`, `src/factorflow/api/static/{index.html,assets/}`.
- After: `git status --porcelain` empty; `HEAD` unchanged at `c9b5ceae`.
- Unexpected tracked-file changes: none. `npm run build` and `npm run test` rewrote
  `src/factorflow/api/static/`, and `uv build` rewrote `dist/` — both are git-ignored
  and documented as expected side effects in the tech stack. The EXP-20260917-1 fix
  merged at `8281d9c` is what keeps `tests/integration/test_api_static_mount.py`
  passing regardless of bundle presence, and the full `uv run pytest` run after
  `npm run build` confirmed that isolation holds. All mutation and RED experiments were
  applied through pytest plugins living in `/tmp`, so no repository file was ever
  modified to produce this evidence.

## Findings

### IR-001 — Story Testing section's property test is not implemented

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-1; DAC-E4-S2-5
- **Tasks**: T001
- **Files**: `tests/unit/test_hashing.py`; `CAP-001-E4-S2.md:95`
- **Claim challenged**: That the story's Testing section is fully realized by the delivered test module.
- **Observed evidence**: The story lists "A property test over generated dictionaries asserts equal inputs hash equal and unequal inputs hash unequal." No property-based test exists; `tests/unit/test_hashing.py` uses nine deterministic examples, and no property-testing library is declared in `pyproject.toml`.
- **Expected evidence/behavior**: `CAP-001-E4-S2.md` §Testing names a property test. The task plan's "Other Notes" explicitly resolves this: "No property-test dependency is declared in `pyproject.toml`; this plan uses deterministic pytest examples rather than adding an unapproved dependency."
- **Impact**: Minimal. Both properties the bullet names are asserted by example (order-independence at two nesting levels, changed-field inequality), and the mutation sweep shows those examples are regression-sensitive. The residual loss is randomized input-space exploration, which might surface an unanticipated type.
- **Required remediation**: None required for this gate — the deviation is documented and justified in the approved task plan. If broader input-space coverage is wanted later, add `hypothesis` through the dependency-approval path rather than inside a story that did not budget it.

### IR-002 — Task plan header names the wrong branch

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A
- **Files**: `CAP-001-E4-S2-tasks.md:35`
- **Claim challenged**: That the task plan's recorded branch identifies where the work landed.
- **Observed evidence**: The header reads `**Branch**: usr/alvaro-de-jodra/CAP-001-E4-tasks`, the planning branch. The implementation was delivered on `usr/alvaro-de-jodra/CAP-001-E4-S2` (`git rev-parse --abbrev-ref HEAD`).
- **Expected evidence/behavior**: Per `docs/branch-naming.md`, the story implementation branch is `usr/<name>/<story-id>`; the plan header should identify the branch the reader must inspect.
- **Impact**: Documentation-only. A reader following the header would check out the planning branch and find no implementation. It caused no ambiguity here because the review base and change set resolved cleanly.
- **Required remediation**: Doc Sync may correct the header to the implementation branch. Do not reopen coding for this.

### IR-003 — `Decimal` and `str` inputs with the same text collide, untested

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-5
- **Tasks**: T001
- **Files**: `src/factorflow/ingestion/hashing.py:16-17`
- **Claim challenged**: That "a value differing in any field produces a different digest" holds for every distinguishable input.
- **Observed evidence**: Direct probe — `canonical_json({"p": Decimal("1.10")})` and `canonical_json({"p": "1.10"})` both produce `b'{"p":"1.10"}'` and therefore the same digest `331de2ff4d8c…`. The canonical form carries no type tag, so a `Decimal` and a `str` with identical text are indistinguishable after canonicalization.
- **Expected evidence/behavior**: This is a direct and unavoidable consequence of DAC-E4-3 and `component-design-observation-writer.md` §2.3, which mandate decimals be rendered as strings; any conforming implementation exhibits it. It is recorded here as a boundary the test suite does not document, not as an implementation defect, and no source of truth asks for type-tagged canonicalization.
- **Impact**: None in the delivered scope. The caller is the observation writer, which builds value dictionaries from typed Pydantic models, so a given field is consistently `Decimal` or consistently `str` and the two cannot alias for the same column. The risk would only materialize if a future caller changed a field's Python type between releases while preserving its text, which would then hash equal and suppress a legitimate append.
- **Required remediation**: None for this gate. Optionally, when the observation writer story lands, add a test asserting that each value field's Python type is fixed at the writer seam, so the invariant this module relies on is stated somewhere rather than assumed.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified — recursive pre-canonicalization instead of `json.dumps(default=…)`.** The
  story's and design's illustrative snippets use a `default=` hook, which CPython never
  invokes for `float` because floats are serialized in C. Honouring the story's
  float-rejection requirement therefore requires walking the structure before
  serialization. The task plan records this conflict and its resolution under "Resolved
  Conflicts", and the implementation follows the plan. The resulting behavior matches
  §2.3's normative prose on all three trustworthiness properties.
- **Justified — `src/factorflow/ingestion/__init__.py` not created.** T003 names it, but
  it already existed at the review base. Creating it would have been a no-op.
- **Justified — the stopped-stage and resume commit split.** `e7e0d10` deliberately left
  T004 unticked because pre-existing frontend build output broke the no-bundle
  static-mount test; the merge at `8281d9c` absorbed the EXP-20260917-1 fix for exactly
  that, and `c9b5cea` then completed T004. The commit messages state this, the merge is
  clean, and the full suite now passes with the bundle present — confirmed by running
  `uv run pytest` after `npm run build`.
- **Documented gap in the TDD evidence.** `CAP-001-E4-S2-tdd-evidence.yaml` labels RED as
  a prior-stage, uncommitted observation and does not claim it as a current run, which is
  honest rather than misleading. It is not directly re-observable now that the module
  exists; this review corroborated it two ways — both files were added in the same commit
  with the module absent at the base, and blocking the import reproduces the recorded
  `ModuleNotFoundError` collection failure.
- No bookkeeping inconsistency: all four tasks are ticked and all four are VERIFIED.
- No scope leakage: every changed file traces to a task or to story-status bookkeeping.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed with documentation synchronization for CAP-001-E4-S2 with
  IR-001, IR-002, and IR-003 recorded. IR-002 is the only finding Doc Sync can act on
  directly; correct the task plan's `**Branch**` header to
  `usr/alvaro-de-jodra/CAP-001-E4-S2`. No code rework is required.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003 (all LOW)
