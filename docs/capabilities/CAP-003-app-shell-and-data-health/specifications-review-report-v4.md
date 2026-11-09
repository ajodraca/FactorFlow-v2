---
artifact_schema_version: 1
artifact_id: CAP-003-specification-review
artifact_type: specification-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
document: spec-review-report
capability: CAP-003
version: v4
generated: 2026-11-07T23:44:00Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 3 capabilities, 11 edges (blocked-by 0, requires-runtime 4, requires-contract 0, conforms-to 7), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; integration layers CAP-001, CAP-002, CAP-003; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 88 interfaces (84 at v3; the four new ingestion interfaces of system design v2 section 4.2), no drift against docs/architecture.md"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 482 warnings, exit 0 (--strict, whole project, 632 artifacts); on the CAP-003 subjects only upstream-pin warnings: scoped with -a to design/, PASSED with 25 warnings (FINDING-15, FINDING-35); the capability has none"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1256 path references across 647 Markdown files; its scope excludes repos/, so the paths the CAP-003 subjects cite were resolved by hand (FINDING-36 for two commits reachable only from a local branch)"
  - script: check-constitutions.py
    outcome: run
    result: "PASSED, exit 0: 10 constitutions, 38 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: "applied — including a socket-free reproduction of the provider-refusal transport path and of the per-stock throttle budget against the installed massive 2.8.0 and urllib3 2.7.0"
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; components, theme.css, component-map.json and intake.md exist); version 2 adds two fix lines at --text-xs and no component, variant or token; no COMPONENT-SPEC-GAP"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability 5.1 to 5.4 against the v2 scope; AGT-SCOPE-002 for the change to three delivered CAP-001 components; STD-UI-1 against the rendered failure reason (FINDING-30)"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-003-app-shell-and-data-health/Capability-CAP-003.md
  system_design: docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md
  ux_brief: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md
  component_designs:
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-acquisition-runner.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-command-palette.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-reader.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-home-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ingestion-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-massive-client.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-shell.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-web-app.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-rate-limit-governor.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-setup-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ui-components.md
review_subjects:
  - artifact_id: CAP-003
    artifact_version: 2
    content_revision: sha256:bb12aafc48a59465c47eff144b83da3ea31f0fe50cfdeabaffd3ebf82283da29
  - artifact_id: CAP-003-system-design
    artifact_version: 2
    content_revision: sha256:5b7f92690f403dab7a30303d437ed4f4b3ec5ed8ae3b6f9f7cac704a5d23af5b
  - artifact_id: CAP-003-ux-brief
    artifact_version: 2
    content_revision: sha256:3e44ea14bc6add09b70e5a3e1b54143a59bd15e737f29e1fa5f93a1a5c569ebd
  - artifact_id: CAP-003-ux-design
    artifact_version: 2
    content_revision: sha256:032830992c49aafca995cf626a32b2e5ff90d7ba1230be882aa789f7d0e8f954
  - artifact_id: CAP-003-component-design-acquisition-runner
    artifact_version: 1
    content_revision: sha256:f19020929a9096e4e6d8f3bfa6e5b88a91ef3f69ec306e6a0cd59ce0a281125c
  - artifact_id: CAP-003-component-design-command-palette
    artifact_version: 1
    content_revision: sha256:5f90690b3b633cc184c794aafa890965b4fbaa656cd4962835a822875878f617
  - artifact_id: CAP-003-component-design-data-health-api
    artifact_version: 2
    content_revision: sha256:de44a915fc02b671425279bf769a61342a00657b5a4e72fde8205300c9d61259
  - artifact_id: CAP-003-component-design-data-health-reader
    artifact_version: 2
    content_revision: sha256:3ea280a900eaacb56f019a18292cdbf078f0a1a49fc80c3dd1f433097b2116b8
  - artifact_id: CAP-003-component-design-data-health-ui
    artifact_version: 2
    content_revision: sha256:8bc4a8e6142ba3b2768faa0df513a5a15b492d94925f12aa8b03d063024be89d
  - artifact_id: CAP-003-component-design-home-ui
    artifact_version: 1
    content_revision: sha256:a59005fb2706a6cfb222bc7f543c29a1022db0a8bcb1b1c4bd4e6a45af46e7a9
  - artifact_id: CAP-003-component-design-ingestion-api
    artifact_version: 1
    content_revision: sha256:c6800ef2637c3e6010eae5b02d41d00e8bccefa9bbefb0cfe414ebd14632ebce
  - artifact_id: CAP-003-component-design-massive-client
    artifact_version: 1
    content_revision: sha256:1ee80d9e14b1e23f467a330ef0fe004680a37cf5bd6f341fc0485c8f31b35ee4
  - artifact_id: CAP-003-component-design-owner-shell
    artifact_version: 2
    content_revision: sha256:5f5981211166e3ce032005c08284ebac7ffa32004deff5b4f3f987af6435003f
  - artifact_id: CAP-003-component-design-owner-web-app
    artifact_version: 2
    content_revision: sha256:716c1f1105de912de5dd74d37648c9256337eccac3c3a793f1bd74ee29b90544
  - artifact_id: CAP-003-component-design-rate-limit-governor
    artifact_version: 1
    content_revision: sha256:d06d30fcce3b82df99ef1cbcc4a2c25e1778b26d02bf00285c5e17fff113f339
  - artifact_id: CAP-003-component-design-setup-ui
    artifact_version: 1
    content_revision: sha256:0760d1a9efd2c65959dc26125cdbc1cb28befd67c0e07d8ba8fdd811864be8e8
  - artifact_id: CAP-003-component-design-ui-components
    artifact_version: 2
    content_revision: sha256:02f64bfe7dac0b117b7d71bf2a881e1f5b3290470506cdf1fec6dabc3256bc89
statistics:
  total_findings: 34
  critical: 0
  high: 0
  medium: 15
  low: 19
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T23:44:00Z
  source_artifacts:
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-ux-brief
      version: "2"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-component-design-data-health-ui
      version: "2"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-component-design-owner-web-app
      version: "2"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-specification-review
      version: "3 (READY, 25 findings; dispositions verified here, not a subject)"
    - id: CAP-001-specifications-review-report
      version: "14 (b69facd, local branch usr/alvaro-de-jodra/CAP-001-design-provider-refusals; findings 55 to 64 re-verified here, not a subject)"
    - id: CAP-001-component-design-massive-client
      version: "15 (approved; the delivered base, not a subject)"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8 (approved; the delivered base, not a subject)"
    - id: CAP-001-component-design-acquisition-runner
      version: "9 (approved; the delivered base, not a subject)"
    - id: CAP-001-component-design-runtime-config
      version: "14 (approved; section 2.2a and invariant 2, context)"
    - id: STD-UI
      version: "6 (approved; governs, not a subject)"
    - id: tech-stack
      version: "7 (approved; governs, not a subject)"
    - id: massive and urllib3
      version: "2.8.0 and 2.7.0 as locked in uv.lock (installed, read only; reproduction evidence)"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Specification Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 App Shell & Data Health |
| **Version** | v4 |
| **Specifications Reviewed** | Capability v2; system design v2 (`ui_facing: true`); UX brief v2; UX design v2; thirteen component designs: three new CAP-003 change designs for delivered CAP-001 components (massive-client, rate-limit-governor, acquisition-runner, each v1), six revised to v2 (data-health-api, data-health-reader, data-health-ui, owner-shell, owner-web-app, ui-components) and four digest-identical to v3 (command-palette, home-ui, ingestion-api, setup-ui); all at project-repo commit `e92bda6` |
| **Total Findings** | 34 (CRITICAL 0, HIGH 0, MEDIUM 15, LOW 19) |
| **Pipeline Readiness** | READY |
| **Lane** | standard (signals `public-contract`, `product-behaviour`, as the invoking run declared); READY clears it, and would also clear the high-risk lane |

**What changed since v3.** Nine commits (`2e6bfeb` to `e92bda6`) bring
follow-up F1 of CAP-002's release into CAP-003. On 2026-11-07 production
stored every Massive `403` "not entitled" and every `429` as
`[unavailable] … The provider failed 3 consecutive attempts.` The owner
amended the capability to v2 (AC-29 *a plan refusal is not retried*, AC-30
*throttling is waited out, then named*, In and Out of Scope, 5.1, 5.2, an
assumption). The designs were refined to carry it, from the provider request
in the ingestion container to the fix shown on *Needs fixing* and the download
detail. CAP-001's own designs are untouched (`git diff origin/main..HEAD`
shows no CAP-001 path).

**The F1 account and the core of the design are correct, verified
independently.** A socket-free reproduction drove the worktree source through
the unpatched SDK and urllib3 (Supplementary Evidence). It reproduced both
production reasons from today's code. It then ran the designed classifier and
the designed per-stock governor, transcribed from the designs, through the
same path and confirmed the quantitative claims of the massive-client and
governor test tables (the governor rows by recomputation). A
`429` costs no attempt and ends as `[rate_limited]` after five 60 s waits
totalling exactly the 300 s budget. A plan refusal is sent once, with its
`request_id`, with "not entitled" in `message` alone or beside an unrelated
`error`. An unrecognised `403`,
a refused redirect and a `503` still retry three times to the configured host
only.

**CAP-001 review v14's two HIGH findings are resolved.**

- **FINDING-55** (per-request budget against a per-stock staleness window).
  The owner's option (a) is implemented as one budget per stock, started at
  the heartbeat checkpoint and checked before each wait. The sleeps between
  two heartbeats are therefore bounded by 300 s, inside the 900 s window that
  `runtime-config` §2.2a and `settings.py` lines 305-314 already reserve. An
  integration test pins it at the default timing set.
- **FINDING-56** (AGT-SCOPE-002). The change is owned by CAP-003, which is in
  flight: all 51 stories are `todo` and there is no release. It is recorded
  in three CAP-003 change designs following the `ingestion-api` precedent,
  and no CAP-001 artifact is edited.

Of v14's eight other findings, FINDING-57 to FINDING-63 are resolved or not
carried forward. FINDING-64 is resolved for every failed data type, with the
summary card's re-run left as an owner question.

**New in this round: 3 MEDIUM, 6 LOW.**

- **FINDING-28 (MEDIUM).** AC-30 says the download "MUST still finish as
  partial". When everything is throttled, the delivered outcome rule records
  `failed`. The designs keep that rule, flag the conflict (system design open
  question 13) and test for `failed`, so the criterion as written cannot be
  met in a reachable case.
- **FINDING-29 (MEDIUM).** Every *Needs fixing* failure other than the two new
  causes still shows *{attempts} attempts*. The v2 designs themselves note
  that the delivered writer never records the count and that the column
  defaults to 1. The screen would therefore read *…failed 3 consecutive
  attempts., 1 attempts*.
- **FINDING-30 (MEDIUM).** Both failure screens render the stored reason
  verbatim, so `[not_entitled] symbol=KO data_type=fundamentals
  request_id=req_403_001:` reaches the owner. That breaks STD-UI-1's ban on
  implementation vocabulary, and the UX design's Error-clarity claim, edited
  in v2, that no `request_id` reaches the owner.
- **FINDING-31 to FINDING-36 (LOW)** cover a self-contradictory integration
  test row, a system-design sequence that writes per data type where the
  runner writes per stock, an overstated "raises at once", capability
  housekeeping, stale version pins and source rows, and the owner's answers
  living only in prose and in an unpushed review.

v3's 25 findings were re-verified against the current text. All are still
open and carried under their identifiers. FINDING-15, FINDING-16 and
FINDING-20 are narrower than at v3.

With no CRITICAL and no HIGH finding, the rubric's verdict is **READY**.
FINDING-28 should be answered before test design encodes AC-30.

## Review Scope

All four specification types exist. The capability, the system design, the
UX brief, the UX design and all thirteen `design/component-design-*.md`
files were read in full at project-repo commit `e92bda6` on
`usr/alvaro-de-jodra/CAP-003-design-provider-refusals` (clean tree, the
project repository under this harness worktree). `epics/` (7 epics, 51
stories, all `todo`) and `tests/` are downstream and not subjects. The
change was read as `git diff origin/main..HEAD -- docs/`, commit by commit.
`artifact-gate.py revision` confirms that four subjects (command-palette,
home-ui, ingestion-api, setup-ui) are digest-identical to their v3 revisions,
so v3's assessment of them stands by identity. They were re-read only where
the change touches what they describe.

Read to verify claims, not subjects:

- **Review history.** CAP-003 review v3. CAP-001 review v14, from
  `git show b69facd:…/specifications-review-report-v14.md`, and the
  abandoned CAP-001 draft `90b4ff0`.
- **CAP-001 base designs.** The approved massive-client v15,
  rate-limit-governor v8, acquisition-runner v9 and runtime-config v14
  §2.2a, and CAP-001's AC-9, AC-10, AC-19 and AC-20.
- **Standards and decisions.** STD-UI v6 (STD-UI-1, -15, -19), decision
  record DEC-0219, and every decision record under
  `projects/factorflow-v2/decisions/` on every harness ref, searched for an
  F1 record. None exists.
- **Delivered code.** `src/factorflow/ingestion/massive/client.py` and
  `errors.py`, `ingestion/rate_limit.py`, `runner.py`, `outcomes.py`,
  `runs/journal.py`, `runs/reclaim.py`, `config/settings.py`,
  `ingestion_main.py`, `db/migrations/0004_runs.sql`, and
  `web/src/screens/runs/detail/instrument-roster.tsx`.
- **Tests and harness.** The test harness `tests/unit/massive_transport_fakes.py`
  and `governor_fakes.py`, the delivered governor tests the designs re-baseline,
  and the runner integration tests' client doubles (all `MagicMock`, none with
  `spec=`).
- **Locked libraries.** `uv.lock` (massive 2.8.0, urllib3 2.7.0), and the
  installed SDK `massive/rest/base.py` and `urllib3/exceptions.py` line 220,
  read only.

Nothing contacted the provider or the production stack.

The invoking run asked for this review. The state engine reports
`AWAITING-APPROVAL` because the v2 subjects carry no approval, and
`design-next.py` names this review as the next step ("the specifications
changed after passing review v3"). See the *Unattended-Run Record*.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Capability sections 1 to 8 (30 ACs). System design sections 1 to 10, with a narrative of four or five sentences before the extended block diagram and the new 3.6 sequence. UX brief 1 to 12. UX design 0 to 7. All fourteen template sections in each of the three new change designs, each diagram preceded by a narrative of four sentences. New: FINDING-34. |
| SR-2 Correctness | applied | Every transport, SDK and code claim of the change was reproduced or read against code (Supplementary Evidence). The outcome rule was walked for the all-throttled case, and the attempt column against the writer. New: FINDING-28, -29, -31, -33. Carried: FINDING-5, -6, -7, -13, -23, -26. |
| SR-3 Consistency | applied | Six reason kinds, two error types, `cause`, `retryable` and `failureRecovery` traced across the system design, all six changed component designs, the brief and the UX design. The server and client `retryable` rules agree by construction and by test. New: FINDING-30, -32, -35. Carried: FINDING-8 to -11, -18, -21, -24 to -26. |
| SR-4 Testability | applied | AC-29 and AC-30 checked for observable outcome, input, boundary and measure. Every new test row with an arithmetic expectation was recomputed or executed. New: FINDING-28, -31. Carried: FINDING-7, -23. |
| SR-5 Traceability | applied | All 30 ACs map in system design 7. UX design 5 maps all 29 interface-facing ACs. Every changed component design has AC-29 and AC-30 rows. Evidence citations resolved, `90b4ff0` and `b69facd` included. New: FINDING-36. Carried: FINDING-16, -20, -22. |
| SR-6 Clarity | applied | Placeholder and vague-language scan. Step numbers, counts and source rows checked. New: FINDING-33, -34, -35. Carried: FINDING-12, -14, -17, -19, -25, -27. |
| SR-7 Feasibility | applied | No circular dependency: `rate_limit.py` already imports `errors.py`, which imports neither, and the `shell-types.ts` to `failure-recovery.ts` import is type-only. One governor per client and one runner per process (`ingestion_main.py` lines 88-90, 140-161). The throttle bound between heartbeats was reproduced at 300 s. The staleness attempt term predates this change and is surfaced as system design open question 15. Whole-download duration under persistent throttling is surfaced as open question 14. No primary finding. |
| SR-8 UX Completeness | applied | `design_system_available` true. The two new fix lines are text at `--text-xs` with no component, variant or token added, and no COMPONENT-SPEC-GAP. Source mapping and design source present. The EDG checklist was updated (and over-claims: FINDING-30). Carried: FINDING-6, -11, -27. |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py`: no error, no warning. 5.1 and 5.2 now agree with the v2 scope (system design open question 11, answered in `3174b50`). AGT-SCOPE-002 is satisfied for the delivered components. STD-UI-1 is not met by the rendered reason (FINDING-30). Carried: FINDING-3, -4, -15, -23. |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed with 88 interfaces. New boxes B16 `massive-client`, B17 `rate-limit-governor` and B18 the external provider carry component identifiers. Four new 4.2 rows each name a provider and a consumer component. No capability identifier is used as an actor in Sections 1 to 5. Carried: FINDING-9, -24. |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED, exit 0 | none. CAP-003 integrates at layer 2. The v2 dependency rows are typed and cited |
| `build-architecture.py -p factorflow-v2` | run, PASSED, exit 0, no drift | none. `docs/architecture.md` was regenerated in the change: four ingestion interfaces were added, and `rate-limit-governor` left the list of components in no interface |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED with 482 project warnings. Scoped to `design/`: PASSED with 25 warnings, all upstream pins | FINDING-15 (tech-stack v6 pins), FINDING-35 (CAP-003 pins and source rows in the revised designs) |
| `check-references.py` | run, PASSED, exit 0 | none from the script, whose scope excludes `repos/`. By hand: every delivered path the change designs cite exists (`tests/unit/test_massive_retry.py`, `test_massive_error_classification.py`, `test_massive_failure_reasons.py`, `test_massive_client_governor_integration.py`, `test_outcomes.py`, `test_governor_retry.py`, `test_governor_backoff.py`, `tests/integration/test_runner_*.py`, `web/src/screens/runs/run-detail.test.tsx`, `src/factorflow/ingestion_main.py`). The rest are new files the designs introduce. `b69facd` and `90b4ff0` resolve only from the unpushed local branch (FINDING-36) |
| `check-constitutions.py` | run, PASSED, exit 0 | none |

Also run, read-only:

- `scripts/check-prerequisites.sh --project factorflow-v2`: exit 0, every row
  PASSED, context 18 h old.
- `scripts/pipeline-state.py check --stage specification-review`:
  AWAITING-APPROVAL, exit 1. The v2 subjects have no approval block, and the
  four unchanged designs' pins name upstreams whose v2 is not yet approved.
- `scripts/design-next.py -p factorflow-v2 -c CAP-003`: review, "the
  specifications changed after passing review v3".
- `scripts/artifact-gate.py revision` for the 17 subjects.
- `scripts/artifact-gate.py check` for the four unchanged designs. Each fails
  only on "upstream … is stale … and is not approved". By
  `upstream_errors()` (`scripts/artifact-gate.py` lines 288-327), that clears
  once the owner approves the v2 upstreams, so the unchanged designs need no
  re-pin to pass the gate.

Design system resolved per `docs/design-system.md`:
`design_system_available = true`.

### Supplementary evidence (fresh, this session)

A script in the session scratchpad, outside the repository, imported the
worktree source (`factorflow.__file__` under `repos/factorflow-v2/FactorFlow-v2/src`).
It installed `tests/unit/massive_transport_fakes.py`'s `forbid_sockets` and
`RecordingMakeRequest`, so only `HTTPConnectionPool._make_request` was
replaced and the SDK, urllib3's `Retry` and `PoolManager.urlopen` ran
unpatched. It used production `MassiveSettings`
(`FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, every timing value at its
default) and one `FakeClock`, started at a multiple of 60, as both `monotonic`
and `now`. The interpreter was the installed virtual environment, run with
`-I -B` and `PYTHONDONTWRITEBYTECODE=1`. `git status` was clean afterwards.
The "designed" rows ran the classifier, the both-fields entitlement rule, the
governor branch and the two new kinds, transcribed from massive-client §2.3
to §2.5 and rate-limit-governor §2.2 as subclasses in the script.

| Claim | Result |
|-------|--------|
| Today a `429` reaches the classifier as `MaxRetryError` whose `reason` is `ResponseError("too many 429 error responses")`. It costs an attempt, gives 3 requests, and stores `[unavailable] symbol=AAPL data_type=reference request_id=unavailable: The provider failed 3 consecutive attempts.` (system design §1; massive-client §1 cause 1) | Reproduced exactly |
| Today a `403` "not entitled" reaches the classifier as `BadResponse`, is retried, and gives 3 requests and the same `[unavailable] … failed 3 consecutive attempts.` (massive-client §1 cause 2) | Reproduced exactly |
| `ResponseError.SPECIFIC_ERROR` is urllib3 2.7.0 `exceptions.py` line 220. The SDK forcelists 429 under `Retry(total=retries)` (`massive/rest/base.py` lines 57-81). The lock pins massive 2.8.0 and urllib3 2.7.0 | Holds |
| massive-client §7 row 1: five `429` then `200` give 6 requests and five 60.0 s waits, and the read returns | Holds (with jitter `[0.0]`, see FINDING-31 (b)) |
| Rows 2 and 3: persistent `429` gives 6 requests and waits `[60.0] × 5` totalling exactly 300 s. `ProviderRateLimited` is an instance of `ProviderUnavailable`, with `__cause__` a `MaxRetryError` and no `request_id`. The next data type, without `start_instrument()`, sends 1 request and no sleep. After `start_instrument()`, it waits again | Holds. Reason: `[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: The provider kept rate-limiting requests until this stock's throttle wait budget was spent.` |
| Jitter row: with jitter `[0.999]` the sleeps total at most 300 s, and the total plus the declined delay exceeds 300 s | Holds: sleeps 119.94, 0.12, 119.82, 0.24 (240.12), declined 119.70 |
| `403` with the marker in `message` alone, and with `error` "Forbidden" plus the marker in `message`, each give 1 request to `/stocks/financials/v1/balance-sheets`, no wait, and `[not_entitled] symbol=KO data_type=fundamentals request_id=req_403_00n: the provider plan is not entitled to this data` (v14 FINDING-59) | Holds |
| An unrecognised `403` `{"error": "Forbidden"}` gives 3 requests and `[unavailable]` (constraint 16 (c), v14 FINDING-57) | Holds |
| A refused `302` and a `503` each give 3 requests, all to `api.massive.com`, none to `198.51.100.7`. Their `reason`s are "too many redirects" and "too many 503 error responses", not the 429 text (v14 FINDING-63 (a)) | Holds |
| Delivered governor tests re-baselined in rate-limit-governor §7, recomputed against `tests/unit/test_governor_retry.py` lines 220-270 under the new branch: budget 90 s gives `[60.0]`, stated delay 10 s with budget 25 s gives two sleeps, and a zero stated delay with 1 rpm and budget 1 s gives `send.calls == 2` | Hold |
| `acquisition-runner` §7 persistent-`429` row (c) at jitter `[0.999]`: once KO's reference has raised at t = start + 240.12, each later data type's first wait (119.70 s) does not fit, so one request each | Holds in the fake. In production jitter is redrawn per wait, see FINDING-33 |

---

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions, all
read at the versions in the frontmatter.

| Constitution | What it produced |
|--------------|------------------|
| CONST-AGT 2.3 | **AGT-SCOPE-002:** satisfied. CAP-001 is delivered and closed. CAP-003 is in flight, with no release and all stories `todo`, so it may be amended, and it takes ownership of the change in three change designs. No CAP-001 artifact is edited (v14 FINDING-56 resolved). **AGT-AUTH-002 / AGT-SPEC-002:** three design choices made on the owner's behalf are surfaced with their options: constraint 16 (c), the AC-30 reading in open question 13, and charging the retry's permit wait in rate-limit-governor §2.3. The reliability consequences are also surfaced (open questions 14, 15). None is yet a decision record (FINDING-36). **AGT-EVIDENCE-001:** file and line citations to code check out. The review that carries the reproduction is reachable only from a local branch (FINDING-36). **AGT-EVIDENCE-002:** every new quantity is sourced: 300 s, 900 s, 60 rpm, `max_attempts + 2`, the 500-character bound. **AGT-PROHIB-003:** `not_entitled`'s variable segment is fixed and never passed to `redact`. **AGT-PROV-001:** every v2 subject carries a complete block with the shared correlation id, timestamps that precede their commits, and the model the commit trailers name. Pins are stale (FINDING-35). **AGT-AUTH-001:** this review approves nothing |
| CONST-MDL 1.3 | **MDL-PIN-002 / MDL-PIN-003:** the revised subjects name `claude-opus-5-5`, which matches the trailers of `2e6bfeb` to `e92bda6`. This report records the same identifier. The v3 attribution gap remains only in the four unchanged designs (FINDING-20, narrowed) |
| CONST-OPS 1.3 | **OPS-ERR-001:** every new path raises a typed error, and nothing is swallowed. **OPS-MIG-001 / OPS-MIG-003:** no schema change. The new kinds are text in `run_instrument_result.reason`. Each change design's §6 names release 0.2.0, the behaviour changes and an image-redeploy rollback (v14 FINDING-58 resolved). **OPS-LOOP-001** (bounded repetition, read for the retry loops): the throttle path is bounded per stock and never crossed. The whole-download bound is surfaced, not designed (open question 14). **OPS-BUDGET-001:** this session stayed within its budget |
| CONST-REV 1.4 | **REV-STG-001:** Stage 1 and Stage 2 below. **REV-AGT-001:** full bar. **REV-RCV-001:** the designs' account of the transport and their test arithmetic were reproduced, not accepted. **REV-RCV-002:** three author claims are challenged with evidence. "After the budget is spent, every further `429` … raises at once" is not true under redrawn jitter (FINDING-33). The integration row's fixture contradicts its own assertion (FINDING-31). The UX design's "no `request_id` … reaches the owner" contradicts its rendering (FINDING-30) |
| CONST-SA 2.0 | **SA-MD-001:** templates conform, and v14 FINDING-62's malformed row is not carried (acquisition-runner §2.3 renders three rows). **SA-MD-002:** stale source rows and a stale open question (FINDING-35), and citations into an unpushed branch (FINDING-36). **SA-MD-003:** v3's wrapped `[REQUIRES INPUT]` markers on answered questions remain (FINDING-12). v2 adds none |
| CONST-SEC 1.3 | **SEC-INP-001:** `_safe_fields` still reads only `status`, `message`, `error` and `request_id`, and rule 3 reads two of them. **SEC-ENC-001:** the 429 rule matches only urllib3's 429 constant. The redirect refusal is unchanged and reproduced, and the host-local loopback exception and its five channels are untouched. **SEC-DAT-001:** `cause` is classified Internal in system design 4.2. **SEC-DEP-001 / SEC-DEP-003:** no new package. **SEC-ERR-001:** the new reasons carry no provider free text. That the stored reason, with its `request_id`, is rendered to the owner is a STD-UI-1 matter (FINDING-30), not an external error response |
| CONST-VER 1.2 | **VER-EVD-001 / VER-EVD-002:** every verdict rests on this session's reads, script runs and reproduction. **VER-EVD-004:** per-rule verdicts in Stage 1 and per-AC verdicts in the Traceability Matrix. **VER-DEL-001:** the change's own claims ("reproduced in v14", the "answered" open questions, the re-baselined tests) were re-verified, not taken from commit messages. **VER-CHK-001:** no test suite was run, because the change is design-only. The behaviour claims were exercised against the installed libraries instead |

### Stage 1 -- Specification Compliance of the Change

One verdict per changed rule. PASS means the rule agrees with the capability,
the delivered code and the libraries, is tested, and contradicts no other
subject. MC is massive-client, RLG rate-limit-governor, AR acquisition-runner,
SD the system design, DHR data-health-reader, DHU data-health-ui, UIC
ui-components and OWA owner-web-app.

| # | Rule | Location | Governing source | Test | Verdict |
|---|------|----------|------------------|------|---------|
| 1 | A `429` `MaxRetryError` is `THROTTLED`, by urllib3's constant | MC §2.3 rule 1; SD §3.6 note 2; 4.2 *Throttle classification* | AC-30; locked urllib3 | MC §7 rows 1 to 4, 9 | PASS (reproduced) |
| 2 | Every other `MaxRetryError` stays `RETRYABLE`. The redirect refusal is not the forcelist | MC §2.3 rule 2 | DEC-0038, DEC-0042 | MC §7 row 7 | PASS (reproduced) |
| 3 | `not entitled` in `error` or `message`, each field searched on its own, after the not-found and credential rules | MC §2.4 rule 3 | AC-29; v14 FINDING-59 | MC §7 rows 5, 12, 13 | PASS (reproduced) |
| 4 | `ProviderNotEntitled` is `FATAL`, sent once, and carries `request_id` | MC §2.3, §2.4 | AC-29 | MC §7 row 5 | PASS (reproduced) |
| 5 | An unrecognised envelope is still `RETRYABLE` | SD constraint 16 (c); MC §3; RLG §8 criterion 5 | v14 FINDING-57 | MC §7 row 6 | PASS. The contradiction with the governor criterion is removed, and the policy is left to the owner (SD open question 12) |
| 6 | Six kinds by exact class; `not_entitled` fixed text; `rate_limited` with `request_id=unavailable` | MC §2.5 | AC-29, AC-30; AGT-PROHIB-003 | MC §7 rows 14, 15 | PASS |
| 7 | One throttle budget per stock, started by `start_throttle_budget()` | RLG §2.2; SD §3.6 note 3; 4.2 | AC-30; v14 FINDING-55 (a) | RLG §7 row 5; MC §7 row 3 | PASS (reproduced) |
| 8 | The check comes before the wait; sleeps never cross the budget | RLG §2.2, §8 criterion 3 | v14 FINDING-55 | RLG §7 rows 1, 2, 6; MC §7 row 4 | PASS (reproduced). The statement that a later `429` "raises at once" is overstated (FINDING-33) |
| 9 | `ProviderRateLimited(ProviderUnavailable)` on exhaustion; attempt exhaustion stays plain | RLG §2.2, §8 criteria 4, 5 | AC-30 | RLG §7 row 4 | PASS |
| 10 | The retry's permit wait is charged to the budget | RLG §2.3 | SD 4.2 "every `THROTTLED` wait" | RLG §7 row 3 | PASS. A stricter reading, surfaced (RLG open question 3) |
| 11 | `start_instrument()` after the heartbeat and cancellation check, before any request of the stock | AR §2.2; MC §2.6; SD 4.2 *Stock boundary* | AC-30 | AR §7 row 2 | PASS. The runner's checkpoint is `runner.py` lines 202-214, and every double is a `MagicMock` |
| 12 | `classify_provider_error` maps `ProviderNotEntitled` to `failed` | AR §2.3 | AC-29 | AR §7 row 1 | PASS. Without it, `outcomes.py` lines 155-159 would raise `TypeError` |
| 13 | Throttled sleeps between heartbeats are at most 300 s, inside 900 s | AR §2.3, §8 criterion 4; SD §3.6 note 4 | AC-30; runtime-config §2.2a | AR §7 row 4 | PASS. The row's fixture contradicts assertion (d) (FINDING-31) |
| 14 | "The download MUST still finish as partial" | Capability AC-30; SD open question 13; AR §2.3, §7 row 5 | `journal.py` lines 332-336 (zero successful rows → `failed`) | AR §7 row 5 expects `failed` | **FAIL** MEDIUM (FINDING-28) |
| 15 | `cause` from the anchored leading kind; `retryable` excludes `not_entitled` | DHR §2.4; DHA §2.4; SD 4.2 | AC-29, AC-14 | DHR §7 rows 1 to 4; DHA §7 | PASS |
| 16 | `ProblemPage` failure carries required `cause: FailureCause \| null` | owner-shell §2.3 | SD 4.1 | `shell-types.test.ts` | PASS |
| 17 | One mapping from outcome and cause to fix; `offersDownload` equals the server's rule | UIC §2.7a | AC-29, AC-30; v14 FINDING-64 | UIC §7 rows 1 to 5 | PASS |
| 18 | *Needs fixing* and the download detail choose the fix through `failureRecovery` | DHU §2.5; OWA §2.3; UX design 1.4, 1.8 | AC-13, AC-29 | DHU §7 rows; OWA §7 row | PASS. The reason line beside it: FINDING-30. The attempt count: FINDING-29 |
| 19 | No schema change; old rows keep `[unavailable]` | SD 4.4, constraint 17 (c) | OPS-MIG-001 | n/a | PASS |
| 20 | Upgrade sections name 0.2.0 and the behaviour changes | MC, RLG, AR §6; SD constraint 17 | OPS-MIG-003; v14 FINDING-58 | n/a | PASS (0.2.0 at `829c9e1`, 2026-11-07; 0.1.0 2026-10-16) |
| 21 | CAP-001's designs are not reopened | all three change designs; SD 4.1; capability §2, 5.2 | AGT-SCOPE-002; v14 FINDING-56 | `git diff` shows no CAP-001 path | PASS |
| 22 | Version, status and provenance | 10 changed subjects | AGT-PROV-001 | `check-artifacts.py --strict` | PASS. Pins and source rows stale (FINDING-35) |

### Stage 2 -- Artifact Quality

- **Contract.** All 17 subjects pass `check-artifacts.py --strict`. The ten
  changed or new ones are `draft` with no approval block, bumped versions and
  the shared correlation id.
- **Structure.** All template sections are present, every new diagram has its
  narrative, and the v14 malformed row is gone.
- **Cross-references.** All resolve, apart from FINDING-35 and FINDING-36.
- **Quantities.** All sourced.
- **Placeholders.** None added.
- **Internal consistency.** Two diagrams or rows disagree with the component
  that owns the behaviour (FINDING-31, FINDING-32). One sentence overstates
  what the governor guarantees (FINDING-33).

### Resolution of CAP-001 Review v14's Findings on F1

Assessed against the CAP-003 set, independently of the designs' own
statements.

| v14 finding | v14 severity | Status in the CAP-003 set | Evidence |
|-------------|--------------|---------------------------|----------|
| v14 FINDING-55 | HIGH | **Resolved** (owner option (a)) | RLG §2.2: the budget lives on the governor, is reset per stock, and is checked before each wait. AR §2.2: reset at the heartbeat checkpoint. SD §3.6 notes 3, 4. The reproduction gives sleeps bounded by 300 s between `start_instrument()` calls, against `stale_after_seconds` 900 (`settings.py` line 264) and invariant 2 (lines 305-314). AR §7 row 4 pins it at the default timing set. Residuals: AC-30's *partial* (FINDING-28), and the pre-existing attempt term (SD open question 15) |
| v14 FINDING-56 | HIGH | **Resolved** | Three CAP-003 change designs follow the `ingestion-api` precedent. Capability §1, §2, 5.1, 5.2 and §8 own the change. No CAP-001 path changed. CAP-003 is in flight. The answer is not yet a decision record (FINDING-36) |
| v14 FINDING-57 | MEDIUM | **Resolved as a contradiction**; policy open | SD constraint 16 (c) states the retry of an unrecognised envelope as the governor's actual seam. RLG §8 criterion 5 restates CAP-001 v8 criterion 8 accordingly. MC §7 row 6 pins it (reproduced). Whether to stop retrying is SD open question 12 |
| v14 FINDING-58 | MEDIUM | **Resolved** | MC, RLG and AR §6, and SD constraint 17 |
| v14 FINDING-59 | LOW | **Resolved** | MC §2.4 rule 3 reads each field on its own, with a test for both fields (reproduced) |
| v14 FINDING-60 | LOW | **Resolved** | MC §7 and RLG §7 pass one `FakeClock` as `monotonic` and `now`, and the `FakeSleeper` advances both |
| v14 FINDING-61 | LOW | **Resolved** | MC §12 and SD §9 cite `docs/releases/CAP-002-release-v1.md` on `usr/alvaro-de-jodra/CAP-002-automation-rework`, which exists on `origin` |
| v14 FINDING-62 | LOW | **Resolved** | AR §2.3's table renders three rows |
| v14 FINDING-63 | LOW | **Resolved** for (a). (b) to (e) are not carried | MC §2.3 rule 2 attributes the redirect refusal to `PoolManager.urlopen` (reproduced). The CAP-003 design does not reproduce the v16 passages of (b) to (e). Its §2.2 narrative has four sentences |
| v14 FINDING-64 | LOW | **Resolved per failed data type**; the summary card is open | OWA §2.3 *Fix by cause*; UX design 1.8. The summary card still offers a new download when every failure is a plan refusal (OWA open question 3), which AC-29 (scoped to *Needs fixing*) permits |

### Review v3 Dispositions

v3's identifiers are kept, so the owner's open list reads the same, and the
new findings are numbered from FINDING-28.

| v3 finding | Severity | Disposition in the current text |
|------------|----------|---------------------------------|
| v3 FINDING-3, -4 | MEDIUM | Open, unchanged (capability 5.4 STD-UI-25 and STD-UI-29 rows, now lines 423 and 427) |
| v3 FINDING-5 to -8 | MEDIUM | Open, unchanged. v2 edits no verdict, empty-state or null-check text. `component-design-data-health-ui.md` line 385 still tests *Can't tell yet*, and line 482 still renders the null checks as `Absent` |
| v3 FINDING-9 | MEDIUM | Open. Section 4.2 and the regenerated `docs/architecture.md` still have no `setTitleDetail` row |
| v3 FINDING-10 | MEDIUM | Open (`system-design.md` lines 781, 1195) |
| v3 FINDING-11 | MEDIUM | Open, unchanged |
| v3 FINDING-12 | MEDIUM | Open. The `[REQUIRES` / `INPUT]` markers on OQ-1 and OQ-3 wrap across lines (`ux-brief.md` lines 596, 608; `ux-design.md` lines 1583, 1595) and *until OQ-1 is answered* remains (`ux-brief.md` line 440). The brief's capability source row was refreshed while its open-question section was not |
| v3 FINDING-13, -14 | LOW | Open (capability line 277 for FINDING-14) |
| v3 FINDING-15 | LOW | **Narrowed.** The system design now pins tech stack v7, approved, in its provenance and §9. Still stale: capability 5.1 (`(v2)`, line 361), `ux-brief.md` line 657 (v5), `component-design-data-health-reader.md` line 644 (v5), and the four unchanged designs' v6 pins |
| v3 FINDING-16 | LOW | **Narrowed.** The brief no longer cites `09410b0`. The DEC numbers given as (0188) to (0196) remain at `system-design.md` line 1313 and `ux-brief.md` line 659 |
| v3 FINDING-17 | LOW | Open (`system-design.md` lines 384, 545, 563) |
| v3 FINDING-18, -19, -21 | LOW | Open, unchanged |
| v3 FINDING-20 | LOW | **Narrowed** to the four digest-unchanged designs (command-palette and ingestion-api timestamps; setup-ui and home-ui attribution). The v2 revisions restamp before their commits and name the model their trailers name |
| v3 FINDING-22 | LOW | Open. `DEC-0219.md` is still `status: open`, `owner_reviewed: false`, on the harness worktree and on `origin/main` (`14973ae`) |
| v3 FINDING-23, -24 | MEDIUM | Open, unchanged |
| v3 FINDING-25 to -27 | LOW | Open, unchanged |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reported no error and no warning. 5.1's CAP-001 row
stays `requires-runtime` and now states that AC-29 and AC-30 change three of
CAP-001's components while leaving its criteria standing. That holds: the
change narrows what is retried and how a refusal is worded, and CAP-001 AC-10
("the reason reported") still holds. 5.2's CAP-001 and Massive rows now carve
out the exception consistently with In Scope, Out of Scope and the system
design (system design open question 11, answered in `3174b50`). There is no
`blocked-by` row. The STD-UI conformance table (5.4) is unchanged; its
STD-UI-1 claim does not hold for the rendered failure reason (FINDING-30).
FINDING-3, -4 and -15 are carried.

#### Completeness (SR-1)

- **FINDING-34** (LOW). §8 still says 28 acceptance criteria. Flow 2 has no
  step for a plan refusal, whose row offers no download.

#### Correctness (SR-2)

- **FINDING-28** (MEDIUM). AC-30's "MUST still finish as partial" against the
  delivered outcome rule the designs keep.
- FINDING-14 is carried.

#### Testability (SR-4)

AC-29 is observable at the transport (one request), in the store (the reason)
and on screen (the fix, and no download). AC-30's "never abandoned" and "not a
failed attempt" are observable. Its *partial* is not attainable when nothing
is stored (FINDING-28). Its "wait budget" is unquantified in the capability,
and the designs fix it at 300 s, configurable.

#### Clarity (SR-6)

FINDING-14 and FINDING-25 are carried.

### System Design Specification

Version 2 adds §3.6, extends the block diagram, 4.1, 4.2, 4.3 and 4.4, and
adds constraints 16 and 17, assumptions 8 to 10, open questions 11 to 16 and
the AC-29 and AC-30 traceability rows. Components keep stable identifiers.
Every new 4.2 row names both sides. The narrative before each changed diagram
runs four or five sentences.

- **FINDING-28** (MEDIUM). Open question 13 adopts `failed` for AC-30's
  all-throttled case and attributes the rule to CAP-001's "honest-outcome
  rule". CAP-001 AC-9 does not say it; the run-journal rule does
  (`journal.py`, DAC-E5-S3-7).
- **FINDING-32** (LOW). The §3.6 sequence writes per data type, in an order
  the runner does not use, and has the governor return `ProviderNotEntitled`.
- **FINDING-33** (LOW). The §3.6 diagram note says "a further 429 raises
  ProviderRateLimited at once".
- **FINDING-36** (LOW). Open question 16: the owner's answers are not
  decision records.
- Carried: FINDING-9, -10, -16, -17, -23, -24.

### Component Design Specifications

**massive-client, rate-limit-governor, acquisition-runner (new, v1).** Every
behaviour has an owner. The interfaces match system design 4.2. The tests run
through the real transport path. Every arithmetic expectation was reproduced.
No circular dependency.

- **FINDING-31** (LOW). AR §7 row 4's fixture gives AAPL a `not_entitled`
  fundamentals row while assertion (d) says all its data types are written or
  unchanged. MC §7 row 1 leaves its jitter unstated.
- **FINDING-33** (LOW). RLG §2.4 lines 245-247.
- **FINDING-28** (MEDIUM). AR §2.3, §7 row 5 and §14 question 1.

**data-health-reader, data-health-api, data-health-ui, ui-components,
owner-shell, owner-web-app (v2).** `cause` and `retryable` agree across the
reader, the API model, the shell's type and `failureRecovery`, and a test
asserts the agreement over the whole outcome and cause product.

- **FINDING-29** (MEDIUM). The attempt count on every other cause (DHU §2.5,
  §7).
- **FINDING-30** (MEDIUM). The reason line rendered verbatim (DHU §2.5;
  OWA §2.3).
- **FINDING-35** (LOW). Stale pins and source rows; OWA open question 4 is
  still open.
- Carried: FINDING-5 to -8, -13, -18 to -23, -26, -27.

**command-palette, home-ui, ingestion-api, setup-ui (unchanged).** These are
digest-identical to v3, so v3's assessment stands. None describes the
changed behaviour. Their v1 pins clear the gate once the v2 upstreams are
approved.

### UX Brief

v2 adds AC-29 and AC-30 to the S09 row, the fix by cause to the *Needs fixing*
paragraph (line 221), and plan refusals to the STD-UI-2 row and the EDG
checklist.

- **FINDING-30** (MEDIUM). The Error-clarity row (line 574) keeps "No code,
  `request_id` … reaches the owner".
- **FINDING-29** (MEDIUM). Line 221 keeps *{attempts} attempts* for ordinary
  failures.
- **FINDING-35** (LOW). The §10 rows describe system design v2 as
  "constraints 1 to 15; assumptions 1 to 7; open questions 1 to 10" and the
  capability's out of scope as "any CAP-001 change" (lines 645-646).
- Carried: FINDING-11, -12, -15, -16.

### UX Design Specification

v2 adds the fix by cause to 1.4 and 1.8 with final words, the AC-29 and AC-30
traceability rows, and source rows. The design system covers every element,
so there is no COMPONENT-SPEC-GAP.

- **FINDING-29** (MEDIUM). Lines 839-846.
- **FINDING-30** (MEDIUM). 1.4 line 841 renders `{reason}`. The 1.8 example
  sentence (line 1271) is not the stored format. The EDG row (line 1497)
  claims no `request_id` reaches the owner.
- **FINDING-35** (LOW). Design Source (line 61) and §6 (line 1557) name UX
  brief v1; the frontmatter pins the brief at v1.
- Carried: FINDING-4 to -9, -12, -13, -18, -19, -21, -23 to -27.

### Cross-Specification Consistency (SR-3)

**Consistent across all subjects:**

- the six kinds, and `cause` null when the kind is unknown;
- `retryable` ⇔ some failure `failed` with a cause other than `not_entitled`
  (system design 4.2, DHR `_retryable`, DHA criterion 7, UIC `offersDownload`
  test, DHU and UX design 1.4);
- the two fix texts (UX design 1.4 and 1.8 = UIC constants = DHU and OWA
  tests);
- `ProviderRateLimited` as a `ProviderUnavailable`, and `ProviderNotEntitled`
  per data type, never run-level;
- `start_instrument()` placement (SD 4.2, MC §2.6, AR §2.2);
- the upgrade facts (0.1.0, 0.2.0 `829c9e1`).

**Mismatches, each a `CROSS-SPEC-INCONSISTENCY`:**

- FINDING-28 (capability AC-30 against SD open question 13 and AR §7);
- FINDING-30 (UX design and brief EDG claims against their own 1.4 and 1.8);
- FINDING-32 (SD §3.6 against AR §2.2 and `runner.py`);
- FINDING-35 (pins and source rows);
- FINDING-8, -10, -11, -18, -21, -24, -25, -26 (carried).

### Screen Specification Acceptance Checks

v2 changes only S09-2 and S09-3's rows. Every other check is as v3 recorded it.

| Check | Verdict | Evidence |
|-------|---------|----------|
| S01-1, S01-2, S01-5 | not applicable | M2 and M6 tiles |
| S01-3, S01-4, S01-7 | met | as v3 |
| S01-6 | met, with FINDING-23 | as v3 |
| S02-1, S02-3 to S02-6 | met | as v3 |
| S02-2 | met, with FINDING-24 | as v3 |
| S09-1 | met | as v3 |
| S09-2, S09-3 | met, with FINDING-29, FINDING-30 | Problem rows name the operation, stock, reason and a fix by cause. *Not found* and plan refusals never offer a download (DHU §2.5; UIC §2.7a). The reason line carries machine tokens, and ordinary failures show an attempt count the writer never records |
| S09-4 | met | as v3 |
| S09-5 | met, with FINDING-6, FINDING-23 | as v3 |

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 15 · LOW 19 · **total 34**. By origin:

- **New in v4:** 9 (3 MEDIUM, 6 LOW).
- **Carried from v3:** 25 (12 MEDIUM, 13 LOW). FINDING-15, -16 and -20 are
  narrowed.

New findings:

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-28 | MEDIUM | SR-2, SR-4 | Capability; system design; acquisition-runner; rate-limit-governor | `Capability-CAP-003.md` lines 346-349 (AC-30: "the download MUST still finish as partial, never abandoned"); `system-design.md` lines 713-724 (§3.6 note 4), 1252-1259 (open question 13); `component-design-acquisition-runner.md` lines 186-198, 270, 341-344; `component-design-rate-limit-governor.md` lines 354-358; delivered `src/factorflow/runs/journal.py` lines 332-336 | **New.** AC-30 requires *partial*. The delivered outcome rule, which the designs keep unchanged (system design 4.1, constraint 16 (d)), records `failed` when no data type of any stock was stored. That happens when every request of a one-stock download, or of every stock, is rate-limited past the budget. The designs flag this as open question 13, adopt `failed`, and test for it (AR §7 row 5), so the design fails the criterion as written in that case. Open question 13 also cites CAP-001's "honest-outcome rule" for "nothing stored is failed". CAP-001 AC-9 says only "succeeded, failed or partial … not succeeded when any named instrument failed"; the rule is run-journal's (DAC-E5-S3-7) | Test design traces tests to AC-30's text. A test written from it fails against the design, or the design's test contradicts the approved criterion | Owner decision (system design open question 13): amend AC-30 to "the download MUST still finish by the recorded outcome rule (*partial*, or *failed* when nothing was stored), never abandoned", or change the outcome rule (a further CAP-001 behaviour change). Correct open question 13's attribution. Optionally quantify "the wait budget" by reference to the configured setting |
| FINDING-29 | MEDIUM | SR-2, SR-3 | UX design; UX brief; data-health-ui | `ux-design.md` lines 839-846 (*Downloading {…} failed: {reason}, {attempts} attempts*, dropped only for `not_entitled` and `rate_limited` "and the stored count would read 1"); `ux-brief.md` line 221; `component-design-data-health-ui.md` lines 221-223, 241-248, 389 (*Rows* test asserts attempts), 391 (*a failure with cause `unavailable` or `null` renders … with its attempt count, as delivered*); delivered `src/factorflow/db/migrations/0004_runs.sql` line 41 (`attempts integer NOT NULL DEFAULT 1`), no writer in `src/factorflow/ingestion/` sets `attempts` | **New; pre-existing in v1 text, now evidenced by v2.** The v2 designs establish that the delivered writer never records an attempt count, so every row reads 1. They then remove the count for the two new causes only. An ordinary failure after three attempts therefore renders *…failed: [unavailable] … The provider failed 3 consecutive attempts., 1 attempts*. The approved S09 copy has no attempt count; it is a CAP-003 addition | *Needs fixing* states a figure the record does not support, beside text that contradicts it (STD-UI-15 "display only what recorded data supports"). The *Rows* test enshrines it | Drop *, {attempts} attempts* from the what-failed line for every cause in UX design 1.4, the brief and DHU §2.5 and §7. Or, if the owner wants the count, bring recording it into scope as a further ingestion change. No owner decision is needed for the first option |
| FINDING-30 | MEDIUM | SR-9, SR-3 | UX design; UX brief; data-health-ui; owner-web-app; capability 5.4 | `ux-design.md` line 841 (`{reason}` in the what-failed line), lines 1248 and 1270-1272 (the 1.8 example *…failed: the provider timed out 3 times.* is not the stored format), line 1497 (EDG: "No code, `request_id`, payload key or implementation word reaches the owner (STD-UI-1)", edited in v2); `ux-brief.md` line 574 (same claim); `component-design-data-health-ui.md` line 222; `component-design-owner-web-app.md` line 384 (test expects "the reason sentence"); `component-design-massive-client.md` lines 341-342 (stored examples); delivered `web/src/screens/runs/detail/instrument-roster.tsx` line 48 (renders `row.reason` verbatim); `docs/constitution/standards/ui-conventions.md` lines 148-157 (STD-UI-1: MUST NOT surface implementation vocabulary); `Capability-CAP-003.md` lines 303-305 (AC-19), 399 (5.4 STD-UI-1 `yes`) | **New; pre-existing in v1, made concrete by v2.** Both failure screens interpolate the stored reason as is. With v2 the owner reads *Downloading company financials failed: [not_entitled] symbol=KO data_type=fundamentals request_id=req_403_001: the provider plan is not entitled to this data*. That shows the kind token, `data_type=fundamentals` beside the display label, and a `request_id`, which STD-UI-1 forbids and which the v2-edited EDG rows say never happens. v2 gives the screens `cause`, and the kind prefix is a fixed-shape read contract (system design assumption 8), so the variable segment is separable | The 5.4 STD-UI-1 `yes` and AC-19 claims do not hold on *Needs fixing* or the download detail. An implementation review applying STD-UI-1's verification would reject the rendering | Owner choice: render only the reason's variable segment, after `]` and the fields up to `: ` (the cause now carries the kind and the fix carries the remedy), keeping the full text available for diagnosis if wanted (for example behind a disclosure, or the `request_id` alone for quoting to the provider). Or record that the stored reason is shown verbatim and correct the EDG rows. Align UX design 1.4 and 1.8, the brief and the DHU and OWA tests |
| FINDING-31 | LOW | SR-4, SR-2 | acquisition-runner; massive-client | `component-design-acquisition-runner.md` line 269 (persistent-`429` row: "`AAPL` answers as in the previous row", whose fixture answers every `/stocks/financials/v1/*` request `403`, line 268; assertion (d) "its data types are `written` or `unchanged`"); `component-design-massive-client.md` line 475 (row 1: five 60.0 s waits; jitter not stated) | **New.** (a) Under the fixture it cites, AAPL's fundamentals are recorded `failed` `[not_entitled]`, so assertion (d) cannot pass as written. Assertion (e) (`partial`) still holds. (b) MC row 1's "five waits of 60.0 s", with the fifth landing exactly on the 300 s budget, holds only with jitter `[0.0]` (reproduced). The row does not state it, and any non-zero jitter raises `ProviderRateLimited` instead | An implementer meets a failing assertion or a flaky boundary | (a) Give AAPL a fixture without the `403` in row 4, or assert "reference, prices and corporate actions `written` or `unchanged`, fundamentals `[not_entitled]`". (b) State `SequenceJitter([0.0])` in row 1 |
| FINDING-32 | LOW | SR-3 | System design | `system-design.md` lines 656-674 (§3.6 sequence: `fetch_financials` before `fetch_reference`; `RUN->>MDS: fundamentals failed` at line 662 and `reference failed` at line 674 as separate writes; line 661 `GOV-->>RUN: ProviderNotEntitled re-raised`) against `component-design-acquisition-runner.md` lines 121-137 (one `write_instrument_with_outcomes` transaction per stock), `src/factorflow/ingestion/runner.py` lines 233-343 (reference, prices, fundamentals, corporate actions, then one write), and `component-design-massive-client.md` lines 156-158 (the governor re-raises `BadResponse`; `massive-client` builds `ProviderNotEntitled`) | **New.** The illustrative sequence shows per-data-type writes, an order the runner does not use, and the governor returning a type it never builds. CROSS-SPEC-INCONSISTENCY (data flow against sequence flow) | A story written from §3.6 could write a stock's results outside the one transaction that CAP-001 v9 and AR §2.2 rely on | Redraw §3.6: fetches in delivered order, one write per stock, `ProviderNotEntitled` raised by `massive-client` |
| FINDING-33 | LOW | SR-2, SR-6 | rate-limit-governor; system design | `component-design-rate-limit-governor.md` lines 245-247 ("After the budget is spent, every further `429` for that stock raises at once, so the stock's remaining data types each cost one request and no wait"); `system-design.md` line 675 (diagram note "a further 429 raises ProviderRateLimited at once"); against `src/factorflow/ingestion/rate_limit.py` lines 228-239 (each wait is the time to the next wall-clock boundary plus a freshly drawn jitter) | **New.** The governor raises when *this* wait would cross the budget. The next request's wait is recomputed with new jitter and may be shorter. For example, with 50 s left, a 70 s wait is declined, and the next data type's 44 s wait is taken. The bound (sleeps at most 300 s per stock) holds, as reproduced. "At once" and "no wait" do not | The claim is the premise of AR §7 row 4's assertion (c), which passes only because the fake jitter is constant | Say "a further `429` waits only if its wait still fits the remaining budget; the stock's sleeps never exceed it" in RLG §2.4 and the §3.6 note |
| FINDING-34 | LOW | SR-1, SR-6 | Capability | `Capability-CAP-003.md` line 496 (§8 "28 acceptance criteria"); lines 171-195 (flow 2: step 3 offers **Download now** "for a failure the provider may not repeat", step 4 covers not-found; no step for a refusal the plan causes) | **New.** §8's count predates AC-29 and AC-30. Flow 2 gives no path for a plan refusal, whose row offers no download, or for a rate limit | Readers derive flows and counts from stale text | Update §8 to 30. Add an alternate to flow 2: "for a data type the owner's plan does not include, the row names the plan as the fix and offers no download (AC-29)" |
| FINDING-35 | LOW | SR-3, SR-5, SR-6 | data-health-reader; data-health-ui; owner-shell; owner-web-app; ui-components; UX design; UX brief | Frontmatter pins: `component-design-data-health-reader.md` line 24 (ux-design `"1"`), `component-design-data-health-ui.md` line 26 (ux-brief `"1"`), `component-design-owner-shell.md` lines 26, 28 (ux-brief, ux-design `"1"`), `component-design-owner-web-app.md` lines 24, 26 (same), `component-design-ui-components.md` line 24 (ux-brief `"1"`), `ux-design.md` line 31 (ux-brief `"1"`). Source rows: `ux-design.md` lines 61 and 1557 (UX brief v1, 41ff183); `component-design-owner-shell.md` line 672 and `component-design-owner-web-app.md` line 504 (UX design CAP-003 v1); `component-design-ui-components.md` line 687 (UX brief CAP-003 v1); `ux-brief.md` lines 645-646 (capability v2 "out of scope … any CAP-001 change"; system design v2 "constraints 1 to 15; assumptions 1 to 7 … open questions 1 to 10", which are 17, 10 and 16). Stale question: `component-design-owner-web-app.md` lines 547-549 ("The words of the two new fixes await UX design v2"), answered in UX design v2 and closed in its two sibling designs by `e92bda6` | **New.** The brief and UX design were revised after the designs that cite them (`4efc4f6` and `d0af566` after `522d447` and `ca2eb41`), and the pins and rows were not refreshed. `check-artifacts.py` reports the pins as warnings | Traceability points at superseded inputs. OWA shows an answered question as open (SA-MD-003) | Refresh the pins and rows in the revision that answers FINDING-28 to FINDING-30. Close OWA question 4 as its siblings were closed |
| FINDING-36 | LOW | SR-5, SR-9 | System design; the three change designs; capability | `system-design.md` lines 1278-1291 (open question 16: the answers to CAP-001 v14 FINDING-55 and FINDING-56 "not yet decision records"), lines 1010-1053 (constraint 16 (c), "decided here"); `component-design-rate-limit-governor.md` lines 205-232 (§2.3 "decided here"); `Capability-CAP-003.md` lines 502-505; citations `git show b69facd:…` and `git show 90b4ff0` in `component-design-massive-client.md` lines 559-560, `component-design-rate-limit-governor.md` line 388, `component-design-acquisition-runner.md` line 326 and `system-design.md` line 1309 | **New.** The owner's two answers (ownership in CAP-003; option (a)) live only in the capability's revision note and design prose. Commit `2e6bfeb` carries no `Decision-Id` trailer, and no record exists under `projects/factorflow-v2/decisions/` on any harness ref. The three agent choices awaiting the owner are likewise prose only: constraint 16 (c), the AC-30 reading, and the permit-wait charge. The reproduction and v14's findings, cited as evidence, sit in `b69facd` and `90b4ff0`, reachable only from the local, unpushed branch `usr/alvaro-de-jodra/CAP-001-design-provider-refusals`, which the designs call abandoned | AGT-AUTH-002's verification expects decision records. Blind review and `sdd decisions` cannot see these choices. Deleting the abandoned branch would leave the cited evidence unreachable (SA-MD-002) | Owner: record the two answers, and uphold or revert the three agent choices, through `scripts/sdd decisions` (or `$constitution` for the cross-capability read contract of the reason prefix). Keep `b69facd` reachable (push the branch or a tag), or cite this report's Supplementary Evidence instead |

Carried from v3 (see the v3 report for each finding's full text; current
locations where the text moved):

| ID | Severity | Dimension | Specification | Location (current) | Status |
|----|----------|-----------|---------------|--------------------|--------|
| FINDING-3 | MEDIUM | SR-9, SR-2 | Capability; UX brief; system design; owner-shell | `Capability-CAP-003.md` line 423 (5.4 STD-UI-25), lines 323-325 (AC-25); as v3 elsewhere | Open, unchanged: the rail chips show no time; STD-UI-25 permits varying cadence, not omitting the time |
| FINDING-4 | MEDIUM | SR-9 | Capability; system design; UX brief; UX design; owner-shell; setup-ui; ui-components | `Capability-CAP-003.md` lines 326-333, 427; as v3 | Open, unchanged: `layout.ts` literals against STD-UI-29; 70ch beside 75ch |
| FINDING-5 | MEDIUM | SR-2, SR-6 | UX design; data-health-ui; ui-components; UX brief | as v3 | Open, unchanged: *needs attention* means two populations |
| FINDING-6 | MEDIUM | SR-2, SR-8 | UX design; UX brief; data-health-ui; system design | as v3 | Open, unchanged: **Start the first download** offered while it runs |
| FINDING-7 | MEDIUM | SR-4, SR-2 | data-health-ui; UX design | `component-design-data-health-ui.md` line 385; as v3 | Open, unchanged: verdict failure states and the *Can't tell yet* test |
| FINDING-8 | MEDIUM | SR-3 | UX design; UX brief; data-health-ui | `component-design-data-health-ui.md` line 482; as v3 | Open, unchanged: null checks not determinable against `Absent` |
| FINDING-9 | MEDIUM | SR-10, SR-3 | System design; UX design; UX brief | Section 4.2 (no `setTitleDetail` row); `docs/architecture.md` | Open, unchanged |
| FINDING-10 | MEDIUM | SR-3 | System design; owner-web-app | `system-design.md` lines 781, 1195 | Open, unchanged: `/runs` to `/data/downloads` against `/data` |
| FINDING-11 | MEDIUM | SR-3, SR-9 | UX brief | as v3 | Open, unchanged: the gaps-only STD-UI-18 note |
| FINDING-12 | MEDIUM | SR-6, SR-3 | UX brief; UX design; several component designs | `ux-brief.md` lines 440, 596, 608; `ux-design.md` lines 1583, 1595; as v3 elsewhere | Open, unchanged: answered questions still marked |
| FINDING-13 | LOW | SR-2 | UX design; data-health-ui | as v3 | Open, unchanged |
| FINDING-14 | LOW | SR-6 | Capability | `Capability-CAP-003.md` lines 277-278 | Open, unchanged |
| FINDING-15 | LOW | SR-9 | Capability; UX brief; data-health-reader; the four unchanged designs | `Capability-CAP-003.md` line 361 (v2); `ux-brief.md` line 657 (v5); `component-design-data-health-reader.md` line 644 (v5); command-palette, home-ui, ingestion-api, setup-ui (v6 pins) | Narrowed: the system design now cites v7, approved |
| FINDING-16 | LOW | SR-5, SR-6 | System design; UX brief | `system-design.md` line 1313; `ux-brief.md` line 659 | Narrowed: `09410b0` gone; (0188) to (0196) remain |
| FINDING-17 | LOW | SR-6 | System design | `system-design.md` lines 384, 545, 563, and v3's other two | Open, unchanged |
| FINDING-18 | LOW | SR-3 | UX brief; UX design; several component designs | as v3 | Open, unchanged |
| FINDING-19 | LOW | SR-6 | UX design; command-palette; home-ui | as v3 | Open, unchanged |
| FINDING-20 | LOW | SR-5 | command-palette; ingestion-api; setup-ui; home-ui | as v3 for these four | Narrowed: the v2 revisions are restamped and attributed correctly |
| FINDING-21 | LOW | SR-3 | UX design; UX brief; data-health-ui; system design; ui-components | as v3 | Open, unchanged |
| FINDING-22 | LOW | SR-5 | System design; home-ui; owner-shell; data-health-api; DEC-0219 | as v3; `DEC-0219.md` lines 28, 33 | Open, unchanged |
| FINDING-23 | MEDIUM | SR-2, SR-9 | System design; UX brief; UX design; ui-components; home-ui; data-health-ui; data-health-reader | as v3 | Open, unchanged: a cancelled first download answers *Yes* |
| FINDING-24 | MEDIUM | SR-10, SR-3 | System design; UX brief; UX design; setup-ui; owner-shell | as v3; `SetupDraftProvider` still absent from `system-design.md` | Open, unchanged |
| FINDING-25 | LOW | SR-6, SR-3 | Capability; UX brief; UX design; setup-ui | `Capability-CAP-003.md` lines 167-169; as v3 | Open, unchanged |
| FINDING-26 | LOW | SR-3, SR-2 | UX design; system design; UX brief; home-ui | as v3 | Open, unchanged |
| FINDING-27 | LOW | SR-8, SR-6 | setup-ui; UX design; UX brief | as v3 | Open, unchanged |

---

## Traceability Matrix

Per-requirement verdicts (VER-EVD-004). "Traced" means the AC maps to a system
design element, a UX design element (where interface-facing) and a component
design element, and that a component test proves it. AC-1 to AC-28 keep v3's
mapping and verdicts; v2 changes only the rows shown in full.

| AC | System design | UX design | Component design(s) | Verdict |
|----|---------------|-----------|---------------------|---------|
| AC-1 to AC-12 | as v3 | as v3 | as v3 | Traced, with v3's findings (FINDING-5, -7, -14, -23 to -27) |
| AC-13 | 3.4, 3.4 note 9, 3.6 note 7 | 1.4 problem row and the fix by cause; 1.8 *Fix by cause* | DHR 2.4 (`cause`); DHA 2.4; DHU 2.5; UIC 2.7a; OWA 2.3 | Traced, with FINDING-29, FINDING-30 |
| AC-14 | 3.4 note 2, note 9 | 1.4 | DHR `_retryable`; DHU 2.5; UIC `failureRecovery` | Traced |
| AC-15 | 3.4 | 1.4, 1.5, 1.7 | DHU 2.7; OWA 2.3 | Traced, with FINDING-6. **Download now** is withheld when every loaded row is a plan refusal or not-found, by design |
| AC-16 to AC-28 | as v3 | as v3 | as v3 | Traced, with v3's findings (FINDING-3, -4, -6, -8, -9, -10, -13, -23, -24, -27) |
| AC-29 | 1; 3.4 note 9; 3.6 notes 1, 5 to 7; 4.1; 4.2 *Throttle classification*, *Typed provider refusals*; constraint 16 (a), (d) | 1.4 (plan fix, no control, not retryable); 1.8 *Fix by cause* | MC 2.3, 2.4, 2.5 (rule 3, `FATAL`, `not_entitled`); AR 2.3; DHR 2.4; DHA 2.4; owner-shell 2.3; UIC 2.7a; DHU 2.5; OWA 2.3 | Traced. One request and the reason were reproduced. The row's fix and the absence of a download are tested (DHU, UIC, OWA). The reason line carries FINDING-30 |
| AC-30 | 1; 3.6 notes 2 to 5; 4.1; 4.2 *Per-stock throttle budget*, *Stock boundary*; constraints 16 (b), (e), 17 | 1.4 (later download, request rate to check); 1.8 | MC 2.3, 2.5, 2.6; RLG 2.2 to 2.4; AR 2.2, 2.3, 7 row 4 | Traced, **with FINDING-28** (*partial* not attainable when nothing is stored), FINDING-31, FINDING-33. "Not a failed attempt" and "never abandoned" were reproduced at the default timing set |

---

## Pipeline Readiness Assessment

**Verdict:** READY

There is no CRITICAL and no HIGH finding, which is the rubric's definition of
READY. In the declared standard lane this clears the specification gate, and
it would also clear the high-risk lane.

F1's design is sound and was verified independently: the transport account,
the classifier, the per-stock budget and the end-to-end path to *Needs fixing*.
CAP-001 review v14's two HIGH findings are resolved in the CAP-003 set, and
its remaining eight are resolved or deliberately left with the owner as open
questions.

READY does not mean nothing is open. Fifteen MEDIUM findings stand, twelve of
them carried from v3. Three are new:

- **FINDING-28** needs an owner answer before test design writes AC-30's
  test. It is the only finding that makes an approved criterion fail by
  design.
- **FINDING-29** and **FINDING-30** are copy and rendering corrections on
  *Needs fixing* and the download detail. They are cheapest to fix before
  stories E6 and E7 are re-generated against these designs.

**This verdict approves nothing.** The ten subjects that are `draft`, without
an approval block, stay blocked from epic generation and test design until
the owner approves each revision with `scripts/artifact-gate.py approve`,
using this report as `--review-artifact`:

- the capability v2, system design v2, UX brief v2 and UX design v2;
- data-health-api, data-health-reader, data-health-ui, owner-shell,
  owner-web-app and ui-components (each v2);
- massive-client, rate-limit-governor and acquisition-runner (each v1).

The four unchanged designs keep their v3-backed approvals, at the identical
revision this report re-covers. Their stale-upstream gate errors clear once
the v2 upstreams are approved.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

1. **FINDING-28.** Owner answer on AC-30's *partial* (system design open
   question 13). Amend the criterion, or the outcome rule.
2. **FINDING-29.** Drop the attempt count from the what-failed line for every
   cause, or bring recording it into scope.
3. **FINDING-30.** Render the reason's variable segment, or record that the
   stored reason is shown verbatim and correct the EDG claims.
4. **FINDING-23** and **FINDING-24** (carried). As v3: before test design and
   before the setup and shell stories respectively.
5. **FINDING-3** to **FINDING-12** (carried). FINDING-3 and FINDING-4 need an
   owner choice at the standard.

### Nice to Have (LOW findings)

6. **FINDING-31** to **FINDING-36.** Fold them into the revision that answers
   FINDING-28 to FINDING-30. FINDING-36 is the owner's: record the two answers
   and the three choices.
7. **FINDING-13** to **FINDING-22**, **FINDING-25** to **FINDING-27**
   (carried).

---

## Open Questions for the Owner

Recorded instead of asked: the run is delegated and has no interactive tool.
None is a decision this review took.

1. **FINDING-28 / system design open question 13.** Does AC-30 mean "finished
   by the outcome rule, never abandoned" (the designs' reading), or *partial*
   even when nothing was stored?
2. **FINDING-30.** Should the owner see the stored reason verbatim, with its
   `request_id`, or only its readable segment?
3. **System design open questions 12, 14 and 15**, and **owner-web-app open
   question 3**. These are surfaced by the designs: whether an unrecognised
   refusal should also be sent once; whether a run-level throttle bound or a
   refused-endpoint short-circuit is wanted; the pre-existing attempt term of
   the staleness window; and whether the download detail's summary should
   withhold its re-run when every failure is a plan refusal.
4. **FINDING-36.** Record the answers to CAP-001 v14 FINDING-55 and
   FINDING-56, and uphold or revert constraint 16 (c), the AC-30 reading and
   the permit-wait charge.
5. Carried from v3: FINDING-3 and FINDING-4 at the standard; FINDING-23's
   never-acquired signal; FINDING-5's wording; DEC-0219 (FINDING-22).

## Observations Outside the Review Subjects

Not findings against the specifications.

- **CAP-001 TC-INT-025 was a false green.** Its delivered test
  (`tests/unit/test_massive_retry.py` lines 64-69) patches `RESTClient` to
  raise a `BadResponse` for a `429`, which the real SDK cannot raise under
  `retries=0`. That is how CAP-001's integration automation review recorded
  TC-INT-025 VERIFIED while production counted every `429` as an attempt.
  The CAP-003 massive-client design replaces it with a real-transport row
  under the same marker.
- **Downstream pins.** The backlog, all 7 epics, the stories and the
  test specifications pin CAP-003 v1 designs (`check-artifacts.py`). Nothing
  is implemented (51 stories `todo`), so this is bookkeeping for
  `$epic-generation` and `$story-generation` once the v2 set is approved.
  AC-29 and AC-30 need stories; the ingestion work has no epic yet.
- **The non-locking per-data-type write path** that v14 observed
  (`writer.py` line 502 does not check the run is still active) is no longer
  reachable through throttling. It stays reachable through the pre-existing
  all-timeout worst case (system design open question 15).
- **A deployed plan without financials** makes every followed stock a
  permanent problem: in the problem set, the verdict and Home's *Needs you*,
  until the plan changes. That follows from system design §3.6 note 6 ("a plan
  refusal is still a problem") and AC-9's cause-resolved rule, and the owner
  may want to confirm it is the intended steady state.

## Unattended-Run Record

- **Mode.** Delegated by a parent agent, with no interactive input tool. The
  parent directed that the Step 6 discussion prompt be skipped, that the
  project repository under the harness worktree be used, that no branch be
  created or switched, and that nothing be committed or pushed.
- **Decided, not asked, as run conditions:**
  1. **Proceeding past `AWAITING-APPROVAL`.** The state engine reports it
     because the v2 subjects carry no approval. `design-next.py` names this
     review as the next step, and v3 and CAP-001 v14 proceeded the same way
     in the same state.
  2. **Lane.** The invoking run declared standard (`public-contract`,
     `product-behaviour`). The verdict's consequence is stated for both
     lanes.
  3. **Numbering.** v3's identifiers are kept for carried findings, and new
     findings start at FINDING-28. CAP-001 v14's findings are referred to
     with their v14 numbers, prefixed by the review.
  4. **Reproduction.** It ran from a scratchpad script against the installed,
     read-only virtual environment, without bytecode and with sockets
     refused. It wrote nothing in the repository (`git status` clean), and
     nothing contacted the provider or production.
- **Severity judgements under the rubric:**
  - **FINDING-28 is MEDIUM, not HIGH.** The designs surfaced the conflict
    with options and kept the honest outcome. It is reachable only when
    nothing at all is stored, and the fix is a sentence in the criterion. It
    is listed first because it is the one finding that fails an approved
    criterion by design.
  - **FINDING-29 and FINDING-30 are MEDIUM.** Each is a displayed
    contradiction of a standard or of the record, on the region this change
    exists to improve. Neither blocks a downstream phase.
- **Abstentions:** none. Every owner question is listed, not answered.
- **Writes:** this report only. No specification, approval block, decision
  record, branch, commit, cache or log was touched.
