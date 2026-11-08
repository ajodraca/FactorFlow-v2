---
artifact_schema_version: 1
artifact_id: CAP-003-backlog-review
artifact_type: backlog-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
document: backlog-review-report
capability: CAP-003
scope: epics
version: v5
generated: 2026-11-08T01:18:19Z
review_subjects:
  - artifact_id: CAP-003-backlog
    artifact_version: 3
    content_revision: sha256:e31c62dc0e5482f037abfbf52dda8dc1fff4a44f774d1ab22d5b8179ab934d3a
  - artifact_id: CAP-003-E1
    artifact_version: 2
    content_revision: sha256:208427e6c5a6d5eabb267b4e869e78f3a94df770813722778734b9449ea804cb
  - artifact_id: CAP-003-E2
    artifact_version: 2
    content_revision: sha256:33f06f2c73251defef6cad37e8afee20681237e2fd8c017725ff9126d6071284
  - artifact_id: CAP-003-E3
    artifact_version: 2
    content_revision: sha256:cd3bf78654c153e86e8856d38dca68870c39e1d1f88527cce711d6fe010d55c4
  - artifact_id: CAP-003-E4
    artifact_version: 2
    content_revision: sha256:f24100e2faf8d23b3e07a81e847fee5ab55a1eadae1f1ccc2c161d3b0f791e61
  - artifact_id: CAP-003-E5
    artifact_version: 2
    content_revision: sha256:ad7fedcf9ff3ea675eaf5f428721d346f4b59720406590c6ab800a8a97fedc6e
  - artifact_id: CAP-003-E6
    artifact_version: 3
    content_revision: sha256:5e663d4ab8a50a8217b0a3ddf2789424a1d4b2fefada77f50a4eea3c499cfa34
  - artifact_id: CAP-003-E7
    artifact_version: 2
    content_revision: sha256:61c3c0920437c2ed9799d435c41ed9ee382f7145c71428720cc721217d1e5757
  - artifact_id: CAP-003-E8
    artifact_version: 1
    content_revision: sha256:28c8ed5795f2fecb35c6e033705f0bf254b8ea7102c5cd7a8832f35381024cde
statistics:
  epics_reviewed: 8
  stories_reviewed: 0
  total_findings: 10
  critical: 0
  high: 0
  medium: 1
  low: 9
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T01:18:19Z
  source_artifacts:
    - id: CAP-003-backlog
      version: "3"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003-E5
      version: "2"
    - id: CAP-003-E6
      version: "3"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003-E8
      version: "1"
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-ux-brief
      version: "2"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-component-design-data-health-api
      version: "2"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-component-design-data-health-ui
      version: "2"
    - id: CAP-003-component-design-owner-web-app
      version: "2"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 54e1f93e-f8eb-48a7-9074-9b5f655fad86
---

# Backlog Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 |
| **Scope** | epics |
| **EPICs Reviewed** | 8 (E8 v1 new; E6 v3 changed; E1 to E5 and E7 digest-identical to review v4) |
| **Stories Reviewed** | 0 (out of scope; E8 has none yet, as expected at this step) |
| **Total Findings** | 10 (0 critical, 0 high, 1 medium, 9 low) |
| **Readiness** | READY |

Commit `368e44d` adds E8, *Provider Refusals Reported by Cause*, for capability
v2's AC-29 and AC-30 (follow-up F1). It also changes E6 from v2 to v3 and the
backlog from v2 to v3.

E8 is a faithful, testable decomposition of system design §3.6 and the nine
component designs that change for it. Each of its 20 derived criteria traces
to AC-29 or AC-30. Each cites the approved design section it comes from, and
the derived criteria I sampled match those sections word for word: the
entitlement rule, the `429` constant, the per-stock budget, the heartbeat
checkpoint, the six-kind anchored match, the `retryable` rule, the
`failureRecovery` table and both fix texts. AC-29 and AC-30 are fully
covered, and no derived criterion introduces scope the designs do not hold.

The E6 change is minimal and correct. DAC-E6-8 now hands the two new causes
to DAC-E8-17. E6's Out of Scope names E8. E6 does not depend on E8, so the
dependency graph stays acyclic and follows EPIC order.

The decision to add one EPIC is sound. The provider half needs an EPIC of its
own in any case, because no existing EPIC touches `src/factorflow/ingestion/`.
Keeping the interface half with it gives AC-29 one home.

The one MEDIUM finding (FINDING-1) is a hand-off that story generation has to
make explicit. Five approved, unimplemented stories in E2, E3, E6 and E7
build files from designs that are now at v2. Each of those designs already
describes the `cause` field, the new `retryable` rule or the fix by cause.
Story generation must say which story owns each change, or E8's work will be
done twice or claimed by two stories. The backlog names only E6-S3. The other
nine findings are LOW wording, staleness or carry-over items.

## Review Scope

The review covers the project repo `repos/factorflow-v2/FactorFlow-v2` on
branch `usr/alvaro-de-jodra/CAP-003-epics-provider-refusals` at HEAD
`368e44d`, with a clean tree.

Reviewed:

- `backlog.md` v3 (draft).
- `CAP-003-E8.md` v1 (draft).
- `CAP-003-E6.md` v3 (draft). I read the whole file and the `368e44d` diff
  against v2.
- `CAP-003-E1.md` to `E5.md` and `E7.md` v2 (approved). Their digests are
  identical to the ones review v4 recorded. I re-read them only for the
  claim that "every other EPIC's criteria hold as written under v2".

Reviewed against these approved sources (approval commit `79c49ce`, on
specification review v5, READY):

- `Capability-CAP-003.md` v2.
- `system-design.md` v2: §1, §3.4 note 9, §3.6, §4.1, §4.2, constraints 16
  and 17, assumptions 8 to 10, and open questions 12 to 16.
- `ux-design.md` v2: §1.4 problem row and §1.8 *Fix by cause*.
- The component designs: `massive-client` v1, `rate-limit-governor` v1,
  `acquisition-runner` v1, `data-health-reader` v2, `data-health-api` v2,
  `owner-shell` v2, `ui-components` v2 (§2.7a, §7, §14), `data-health-ui` v2
  (§2.5, §7, §8) and `owner-web-app` v2 (§2.3, §7, §8, §14).

Read as evidence, not authority:

- Backlog review v4.
- Specification review v5, including its carried findings 29 to 34. They
  touch the designs E8 cites.
- These stories, for hand-off checks only: E2-S1, E2-S4, E2-S6, E3-S1, E1-S1,
  E6-S3, E6-S6 and E7-S5.

I checked these repository facts, and they hold:

- `tests/unit/massive_transport_fakes.py` exists, as DAC-E8-20 requires.
- `src/factorflow/ingestion/` holds `rate_limit.py`, `runner.py`,
  `outcomes.py` and `massive/`.
- No CAP-003 screen is implemented yet: there is no `web/src/screens/data-health/`.
- Every E1 to E7 story is `status: todo`.

Gate evidence:

- **Prerequisites:** `check-prerequisites.sh --project factorflow-v2` exited 0.
- **Pipeline state:** `pipeline-state.py check --stage epic-generation`
  reported `RESUME — backlog review does not cover current ... CAP-003-E6.md`.
  That is the expected entry condition, and this report supplies the review.
- **Artifact check:** `check-artifacts.py --strict --allow-unchanged-legacy`
  on the capability directory exited 0 with 191 warnings. Every warning is an
  `upstream pin` warning. 28 of them are in the unchanged EPICs E1 to E5 and
  E7 (FINDING-9). None is in E6 v3, E8 or `backlog.md`.
- **Revisions:** `artifact-gate.py revision` was run for all nine subjects
  and is recorded in `review_subjects`.

---

## Findings by Dimension

### BR-1 Completeness

E8 has every required section, and each one is filled in:

- a summary and the actors;
- the estimate (L);
- Out of Scope, with eleven exclusions, each tied to its source;
- dependencies on EPICs and other capabilities;
- links;
- six goals;
- NFRs for timing, provider load, read cost, security, supply chain, rollback,
  upgrade disclosure, design system and test fidelity;
- seven capability ACs and 20 derived ACs;
- a traceability table and seven open questions.

E8's *Stories* section says "To be populated by story generation". That is
expected at `SCOPE=epics` and is not a finding.

System design §3.6 is the one new control flow, and E8 owns it. Every flow
§3.1 to §3.5 keeps its v4 owner.

**The one-EPIC decision.** The alternative was to spread the interface half
over E1, E2, E3, E6 and E7 and add a provider-only EPIC. I find the chosen
boundary sound, for three reasons:

1. The provider half has to be a new EPIC regardless, because none of E1 to
   E7 touches the ingestion container.
2. The interface half is one behaviour, the fix chosen by the cause. Its
   parts are the reader's `cause`, the API field, the `ProblemPage` type, the
   `failureRecovery` mapping and the two screens. Spreading them over five
   EPICs would split AC-29's traceability five ways.
3. Order is preserved. Every edge from E8 points backwards, and the provider
   stories can start at once.

The decision has a cost, which FINDING-1 records. Every E1 to E7 story is
still `todo`, and those stories build the reader, the models, the shell types
and the problem row from designs that now contain E8's change. So the
boundary has to be drawn again at story level.

The decision also has an effect on scheduling. The AC-29 behaviour the owner
sees, on *Needs fixing*, lands only after E1 to E7 (51 stories). Only the
provider half can ship early. That is a scheduling choice for the owner (see
*Owner decisions*), not a defect.

### BR-2 Alignment with Upstream

E8 cites every DAC against the system design section and component design
section it comes from. Spot checks against the approved designs:

- **DAC-E8-1** matches system design §3.6 note 1 and `massive-client` §2.3
  and §2.4: both fields, case-insensitive, after the not-found and credential
  rules, and `FATAL`.
- **DAC-E8-2** matches §3.6 note 2: the
  `ResponseError.SPECIFIC_ERROR.format(status_code=429)` constant, and a
  refused redirect stays `RETRYABLE`.
- **DAC-E8-5** matches `rate-limit-governor` §2.2 and §2.3: the budget is
  checked before each wait, the retry's permit wait is charged, and jitter
  `[0.999]` is covered.
- **DAC-E8-7** matches §3.6 note 4 and `acquisition-runner` §8 criterion 1.
- **DAC-E8-9** and **DAC-E8-10** match `acquisition-runner` §7 rows 3 to 5.
  This includes the KO-then-AAPL roster and the rule `partial` when
  something was stored and `failed` when nothing was, which specification
  review v5 confirmed after FINDING-28.
- **DAC-E8-11** to **DAC-E8-14** match `data-health-reader` §2.4,
  `data-health-api` §2.4 and `owner-shell` §2.3.
- **DAC-E8-15** and **DAC-E8-16** match `ui-components` §2.7a and its §7
  rows. This includes the `offersDownload` agreement rule and the env-var
  name as plain text. UX design v2 puts that name in code formatting, and
  `ui-components` §2.7a reads the formatting as marking the literal name, so
  the plain-text rendering is consistent.
- **DAC-E8-17** and **DAC-E8-18** match `data-health-ui` §2.5, §7 and §8
  criteria 8 to 10, `owner-web-app` §2.3, §7 and §8 criteria 8 and 9, and UX
  design §1.4 and §1.8.

Nothing drifts out of scope:

- Constraint 16 (c) and open question 12 keep the unrecognised-envelope
  retry (DAC-E8-3).
- Constraint 16 (e) is the source of DAC-E8-20.
- OQ-5's verbatim-reason follow-up and `owner-web-app` §14 question 3 are
  excluded explicitly.

Component names, error classes, file paths and env-var names all match the
designs.

Four findings concern alignment:

- **FINDING-4 (LOW).** DAC-E8-17 keeps DAC-E6-8's *Download again* line "with
  its attempt count" for a cause of `unavailable` or `null`. This faithfully
  carries specification review v5 FINDING-29: the delivered writer never
  records `attempts`, so the column reads its default of 1. The epic is
  aligned with the approved design. However, a test written from the epic
  could assert *3 attempts*, which is false.
- **FINDING-5 (LOW).** E8's *From Capability* list restates AC-13, AC-14,
  AC-16, AC-17 and AC-26 in E8-specific wording under the capability IDs.
  AC-17 in particular reads "The download detail's fix by cause MUST read the
  delivered `GET /api/acquisition-runs/{id}` response unchanged". The
  capability's AC-17 says nothing about a fix by cause. Other EPICs paraphrase
  too, but this restatement adds content under a capability ID.
- **FINDING-7 (LOW, known).** E6's Security NFR says "no `request_id` is
  shown". Both failure screens show the stored reason verbatim, and that
  reason includes `request_id=…`. Capability OQ-5 makes this a separate
  follow-up, and specification review v5 FINDING-30 carries the upstream
  contradiction. DAC-E6-17 limits the claim to read-failure states, so it is
  correct. The NFR's general sentence is the stale part.

### BR-3 Coverage (Reverse Traceability)

AC-29 is covered by E8:

- *Sent once:* DAC-E8-1 and DAC-E8-9.
- *Recorded under its own reason:* DAC-E8-4 and DAC-E8-8.
- *The row names the plan, not a download:* DAC-E8-15 to DAC-E8-17.

AC-30 is covered by E8:

- *Not a failed attempt:* DAC-E8-2 and DAC-E8-6.
- *Its own reason past the stock's budget:* DAC-E8-4, DAC-E8-5 and
  DAC-E8-10.
- *Finishes with its recorded outcome, never abandoned:* DAC-E8-7 and
  DAC-E8-10.

Every component that changes in system design §4.1 v2 is in E8's actors and
links: `massive-client`, `rate-limit-governor`, `acquisition-runner`,
`data-health-reader`, `data-health-api`, `owner-shell`, `ui-components`,
`data-health-ui` and `owner-web-app`.

AC-1 to AC-28 keep their v4 coverage. The backlog's traceability rows for
AC-13, AC-14, AC-16, AC-17 and AC-26 add E8 correctly.

The AC-29 and AC-30 rows have empty *Story* columns. That is expected until
story generation.

No UNCOVERED-AC.

### BR-4 Testability

E8's criteria have concrete observables:

- exact reason prefixes and texts;
- request counts per path;
- the 300 s and 900 s bounds under both jitter values;
- the closed six-kind table, with negative cases;
- the `offersDownload` agreement over the full product of outcome and cause;
- type-level proof that `cause` is required, through `expectTypeOf`;
- the absence of any accessible name containing *Download*.

Two LOW wording issues remain:

- **FINDING-2.** DAC-E8-17 says a `rate_limited` failure "MUST render
  `RATE_LIMIT_FIX_TEXT` without the attempt count". The design means that the
  *what-failed line* ends at *{reason}*, as the `not_entitled` clause states
  in the same criterion. The sentence can be read as a property of the fix
  text instead.
- **FINDING-3.** DAC-E8-19 requires "each change's upgrade notes MUST name
  release 0.2.0 and the behaviour changes of system design constraint 17 (a)
  to (d)". It does not say which artifact holds those notes. Constraint 17
  places them in each change design's upgrade section, and those sections
  already exist (`massive-client` §6, `rate-limit-governor` §6,
  `acquisition-runner` §6). A story could not tell what it must produce or
  how the criterion is checked.

### BR-5 Single-Component Scoping

This dimension applies to stories, which are not in scope here. E8 spans
nine components across the ingestion container, the API and the browser.
Story generation must therefore split it at least nine ways, each story
owning one component, with the provider stories ordered as follows:

1. `massive-client`'s `start_instrument()` and the governor's
   `start_throttle_budget()` come before the runner's checkpoint.
2. `failure-recovery.ts` comes before the `owner-shell` type import and
   before both screens.

An estimate of L is plausible against E1, E3, E6 and E7, which are 28 to 42
points each. No finding.

### BR-6 Consistency and Sequencing

- **IDs:** `CAP-003-E8` is unique. The slug `provider-refusals-by-cause` and
  the `DAC-E8-<n>` numbering follow the convention the other seven EPICs use
  and review v4 accepted.
- **Dependencies:** E8 depends on E1, E2, E3, E6 and E7. No EPIC depends on
  E8. E6 v3 refers to DAC-E8-17 only to exclude it from scope, so it has no
  dependency edge on E8. The graph is acyclic, and there is no
  SEQUENCING-INVERSION at EPIC level.
- **Backlog counts:** 8 EPICs, and 51 stories totalling 214 points in E1 to
  E7. The counts are 10+7+8+6+5+7+8 = 51 stories and 42+28+39+23+18+28+36 =
  214 points, matching the EPIC files. E8's row is blank, as expected.

Six consistency findings:

- **FINDING-1 (MEDIUM): ownership hand-offs at story level are not stated.**
  E8's dependency list names the files that earlier stories create. However,
  those stories' own criteria point at designs that now contain E8's change:
  - **E2-S1** builds `reader.py` against `data-health-reader` §2.4. In v2,
    §2.4 holds `cause_of` and the rule that `retryable` excludes
    `not_entitled`. DAC-E2-S1-3 ("a stock with a `failed` failure … `retryable`
    … true") does not say which reasons its fixture uses.
  - **E2-S4** builds `data_health_models.py` "mirroring system design §4.2
    field for field". §4.2 v2 includes `cause`.
  - **E3-S1** says `shell-types.ts` holds `ProblemPage`, and DAC-E3-S1-4 says
    "no field is added or renamed from the wire shape". The wire shape in v2
    carries `cause`, which DAC-E8-14 assigns to E8 and types from a file E8
    creates.
  - **E6-S3** renders *Download again* for every *Failed* failure. This one is
    known and flagged.
  - **E7-S5** takes over `instrument-roster.tsx` against `owner-web-app`
    §2.1 to §2.6. In v2, §2.3 holds the fix by cause.

  The backlog says only "Story generation records E8's edges in
  `dependencies.yaml`". Without an explicit split, an implementer of E2-S4 or
  E3-S1 working from the current designs will add `cause` early, or an E8
  story will find its work already done and its tests in conflict.
- **FINDING-6 (LOW): E6 v3 is only partly refreshed.** Three places still
  read as v2:
  - The Goals bullet still says each row names "reason and attempts".
  - The traceability row for DAC-E6-8 still cites only §3.4 step 4 and
    DEC-0201.
  - The Links still cite §3.4 "notes 1 to 8".

  None of them cites §3.4 note 9, §3.6 note 7, `data-health-ui` v2 §2.5 or
  DAC-E8-17. The normative criterion is correct; only the surrounding
  references are stale.
- **FINDING-8 (LOW, known):** E7's summary says the two entry hints and
  **Open setup** "are the only additions". `owner-web-app` v2 §2.3 adds the
  fix-by-cause line to the download detail, but E8 delivers it, so E7's
  sentence is about E7's own work. Read alone, it misleads. E7 is unchanged
  and still approved at its v4 digest.
- **FINDING-9 (LOW, known):** E1 to E5 and E7 pin capability, system design,
  UX and component design v1 (28 `upstream pin` warnings). Their content is
  unchanged and approved, and the backlog states that their criteria hold
  under v2. My re-read found no EPIC-level criterion that v2 contradicts
  outside E6, which was changed. FINDING-1 covers the story-level effects.
- **FINDING-10 (LOW):** The backlog's first narrative paragraph still opens
  "The seven EPICs follow the system design's five control flows (§3.1 to
  §3.5)". The next paragraph adds E8 and §3.6, so the meaning is recoverable.
  Separately, the AC-13 row still lists `CAP-003-E3-S1` among its stories
  while its EPIC column omits E3. This was already true in v2.

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 9 · **total 10**

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | BR-6, BR-2 | backlog.md v3; CAP-003-E8 v1 (stories E2-S1, E2-S4, E3-S1, E6-S3, E7-S5) | backlog *Sequencing* ¶2; E8 *Dependencies* | Five `todo` stories build files from v2 designs that already contain E8's `cause`, `retryable` rule or fix by cause. Only E6-S3 is named as needing change. | The same change may be implemented twice, or the earlier stories' tests may contradict E8's. | In story generation, have each of the five stories state that it builds the v1 shape (or amend it), and have the matching E8 story name the earlier tests it changes. |
| FINDING-2 | LOW | BR-4 | CAP-003-E8 | DAC-E8-17 | "render `RATE_LIMIT_FIX_TEXT` without the attempt count" is ambiguous | A test could be written to the wrong reading | Say "the what-failed line ends at *{reason}*", as the `not_entitled` clause does |
| FINDING-3 | LOW | BR-4 | CAP-003-E8 | DAC-E8-19 | "each change's upgrade notes" names no artifact | No story can tell what to produce or how to check it | Name the target (the existing change-design upgrade sections, or release notes), or drop the clause as already satisfied by the designs |
| FINDING-4 | LOW | BR-2 | CAP-003-E8; CAP-003-E6 | DAC-E8-17, DAC-E6-8 | The *Download again* line keeps "{attempts} attempts", but `attempts` is never recorded (spec review v5 FINDING-29, carried) | A test could assert *3 attempts* | Note in the stories that the stored value is shown (currently 1) until FINDING-29 is settled |
| FINDING-5 | LOW | BR-2 | CAP-003-E8 | *From Capability* | AC-13, AC-14, AC-16, AC-17 and AC-26 are restated with E8-specific content under capability IDs (AC-17 gains "fix by cause") | Blurs the line between capability and derived criteria | Quote the capability text and move E8-specific content into DACs |
| FINDING-6 | LOW | BR-6 | CAP-003-E6 v3 | Goals bullet 3; *Links*; traceability row DAC-E6-8 | Not refreshed to §3.4 note 9, §3.6 note 7, `data-health-ui` v2 or DAC-E8-17 | Stale reading aid | Refresh when E6 is next edited |
| FINDING-7 | LOW | BR-2 | CAP-003-E6 | NFR *Security* | "no `request_id` is shown", yet the verbatim reason shows it (known; OQ-5; spec review v5 FINDING-30) | Claim false for every failure row | Narrow to read-failure states as DAC-E6-17 does, or point to OQ-5 |
| FINDING-8 | LOW | BR-6 | CAP-003-E7 | *Summary* | "the only additions" omits the download detail's fix line that E8 adds (known) | Misleading when read alone | Add "(the fix by cause is E8's)" at the next E7 edit |
| FINDING-9 | LOW | BR-6 | CAP-003-E1 to E5, E7 | `ai_provenance.source_artifacts` | v1 upstream pins (28 warnings) on unchanged, approved EPICs (known) | Pin warnings only | Refresh at the next material edit of each EPIC |
| FINDING-10 | LOW | BR-6 | backlog.md v3 | narrative ¶1; AC-13 row | "seven EPICs … five control flows"; AC-13 row lists E3-S1 without E3 in its EPIC column (pre-existing) | Cosmetic | Update the sentence and the row |

---

## Traceability Matrix

| Capability AC | EPIC(s) | Story(ies) | Status |
|---------------|---------|------------|--------|
| AC-1 to AC-12 | E1 to E7 as in backlog v3 (unchanged from v4) | as backlog v3 | Covered |
| AC-13 | E2, E6, E8 | E2-S1, E2-S4, E2-S6, E3-S1, E6-S3, E6-S6; E8 pending | Covered |
| AC-14 | E2, E6, E7, E8 | E2-S1, E6-S2, E6-S3, E6-S6, E7-S2, E7-S3, E7-S5; E8 pending | Covered |
| AC-15 | E4, E6, E7 | as backlog v3 | Covered |
| AC-16 | E1, E2, E3, E5, E6, E8 | as backlog v3; E8 pending | Covered |
| AC-17 | E2, E3, E4, E6, E7, E8 | as backlog v3; E8 pending | Covered |
| AC-18 to AC-25 | as backlog v3 (unchanged from v4) | as backlog v3 | Covered |
| AC-26 | E1, E3, E4, E5, E6, E7, E8 | as backlog v3; E8 pending | Covered |
| AC-27, AC-28 | as backlog v3 (unchanged from v4) | as backlog v3 | Covered |
| AC-29 | E8 (DAC-E8-1, -3, -4, -8, -9, -11 to -19) | pending story generation | Covered at EPIC level |
| AC-30 | E8 (DAC-E8-2, -4 to -8, -10, -11, -13, -15 to -20) | pending story generation | Covered at EPIC level |

---

## Readiness Assessment

**Verdict:** READY

There are no CRITICAL or HIGH findings. Every capability AC, including AC-29
and AC-30, is covered at EPIC level. E8's derived criteria match the approved
v2 designs, and the E6 change is consistent with them. The EPIC graph is
acyclic and follows EPIC order.

FINDING-1 should be settled in story generation, the next step: it decides
which story owns `cause`, the `retryable` change and the fix by cause. It does
not block approving the EPIC set.

A READY report is not approval. The owner must still approve E6 v3, E8 v1
and `backlog.md` v3 in a separate action, under `owner-allowed`, before
story generation proceeds.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

- **FINDING-1.** At story generation, settle ownership for E2-S1, E2-S4,
  E3-S1, E6-S3 and E7-S5. Each must state that it builds the v1 shape and
  that the named E8 story adds `cause`, the `retryable` change or the fix by
  cause. Alternatively, amend the story to include that change. Either way,
  each E8 interface story must name the earlier tests it changes, and the
  edges must be recorded in `dependencies.yaml`.

### Nice to Have (LOW)

- FINDING-2 and FINDING-3: tighten the wording of DAC-E8-17 and DAC-E8-19.
- FINDING-4: carry spec review v5 FINDING-29 into the stories so that no test
  asserts an attempt count that is never recorded.
- FINDING-5: keep capability ACs verbatim and put E8-specific content in DACs.
- FINDING-6 to FINDING-10: refresh the stale references at the next edit of
  each artifact.

### Owner decisions (none blocks this review)

- **Scheduling.** The provider-side stories of E8 depend on nothing in
  CAP-003 and can ship ahead of E1 to E7, which would address F1's
  production behaviour sooner. The interface half must follow E1 to E7.
- **E8 open questions**, each marked *Blocks: nothing*:
  - system design question 12: send an unrecognised refusal once;
  - system design question 14: the cost of persistent throttling, about 250
    hours at 3,000 stocks, with no endpoint short-circuit or run-level bound;
  - system design question 15: the staleness derivation's attempt term;
  - system design question 16: decision records for the per-stock budget and
    for the reason-kind read contract;
  - the uncaptured production `403` body;
  - `owner-web-app` §14 question 3: the download detail's summary card still
    offers a download when every failure is a plan refusal;
  - charging the retry's permit wait to the budget.
- **Approval** of E6 v3, E8 v1 and `backlog.md` v3, a separate owner action.
