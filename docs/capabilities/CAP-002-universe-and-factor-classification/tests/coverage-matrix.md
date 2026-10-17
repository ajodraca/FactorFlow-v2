---
artifact_schema_version: 1
artifact_id: CAP-002-coverage-matrix
artifact_type: coverage-matrix
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T18:38:08Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-backlog
      version: "4"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Test Coverage Matrix

## AC Coverage

| AC ID | Source | AC Description | Component Tests | Integration Tests | E2E Tests | Status |
|-------|--------|---------------|-----------------|-------------------|-----------|--------|
| AC-1 | Capability | Universe by hand | TC-COMP-001, TC-COMP-002, TC-COMP-003, TC-COMP-004, TC-COMP-005, TC-COMP-006, TC-COMP-007 | TC-INT-001, TC-INT-002, TC-INT-003, TC-INT-004 | TC-E2E-003, TC-E2E-004 | Covered |
| AC-2 | Capability | Universe from a filter | TC-COMP-008, TC-COMP-009, TC-COMP-010, TC-COMP-011, TC-COMP-012, TC-COMP-013, TC-COMP-014, TC-COMP-015, TC-COMP-016 | TC-INT-005, TC-INT-006, TC-INT-007, TC-INT-008 | TC-E2E-005, TC-E2E-006 | Covered |
| AC-3 | Capability | Several universes | TC-COMP-017, TC-COMP-018, TC-COMP-019, TC-COMP-020, TC-COMP-021, TC-COMP-022 | TC-INT-001, TC-INT-009, TC-INT-010 | TC-E2E-003, TC-E2E-011 | Covered |
| AC-4 | Capability | Universe maintenance | TC-COMP-019, TC-COMP-023, TC-COMP-024, TC-COMP-025, TC-COMP-026, TC-COMP-027, TC-COMP-028, TC-COMP-029, TC-COMP-030, TC-COMP-031, TC-COMP-032 | TC-INT-003, TC-INT-004, TC-INT-010, TC-INT-011, TC-INT-012, TC-INT-013, TC-INT-014, TC-INT-015, TC-INT-016 | TC-E2E-011 | Covered |
| AC-5 | Capability | No empty universe | TC-COMP-008, TC-COMP-009, TC-COMP-033, TC-COMP-034, TC-COMP-035, TC-COMP-036, TC-COMP-037, TC-COMP-038, TC-COMP-039, TC-COMP-040, TC-COMP-041, TC-COMP-042, TC-COMP-043, TC-COMP-044 | TC-INT-008, TC-INT-017, TC-INT-018 | TC-E2E-004, TC-E2E-006, TC-E2E-012 | Covered |
| AC-6 | Capability | Membership history | TC-COMP-034, TC-COMP-036, TC-COMP-037, TC-COMP-038, TC-COMP-041, TC-COMP-043, TC-COMP-044, TC-COMP-045, TC-COMP-046, TC-COMP-047, TC-COMP-048, TC-COMP-049, TC-COMP-050, TC-COMP-051, TC-COMP-052, TC-COMP-053, TC-COMP-054, TC-COMP-055, TC-COMP-056, TC-COMP-057, TC-COMP-058 | TC-INT-014, TC-INT-016, TC-INT-019, TC-INT-020, TC-INT-021, TC-INT-022, TC-INT-023, TC-INT-024 | TC-E2E-011, TC-E2E-012 | Covered |
| AC-7 | Capability | Factor definitions | TC-COMP-059, TC-COMP-060, TC-COMP-061, TC-COMP-062, TC-COMP-063, TC-COMP-064, TC-COMP-065, TC-COMP-066 | TC-INT-025 | — | Covered |
| AC-8 | Capability | One peer set | TC-COMP-067, TC-COMP-068 | TC-INT-026 | — | Covered |
| AC-9 | Capability | Score and percentile | TC-COMP-069, TC-COMP-070, TC-COMP-071, TC-COMP-072, TC-COMP-073, TC-COMP-074 | TC-INT-027 | TC-E2E-001, TC-E2E-007 | Covered |
| AC-10 | Capability | Automatic refresh | TC-COMP-075, TC-COMP-076, TC-COMP-077, TC-COMP-078, TC-COMP-079, TC-COMP-080, TC-COMP-081, TC-COMP-082, TC-COMP-083, TC-COMP-084, TC-COMP-085, TC-COMP-086, TC-COMP-087, TC-COMP-088, TC-COMP-089 | TC-INT-028, TC-INT-029, TC-INT-030 | TC-E2E-001 | Covered |
| AC-11 | Capability | Timeliness | TC-COMP-090, TC-COMP-091, TC-COMP-092, TC-COMP-093 | TC-INT-031 | — | Covered |
| AC-12 | Capability | Like-for-like only | TC-COMP-072, TC-COMP-073, TC-COMP-094, TC-COMP-095, TC-COMP-096, TC-COMP-097, TC-COMP-098, TC-COMP-099 | TC-INT-032, TC-INT-033 | TC-E2E-001, TC-E2E-008, TC-E2E-009, TC-E2E-010 | Covered |
| AC-13 | Capability | Outdated inputs | TC-COMP-100, TC-COMP-101, TC-COMP-102, TC-COMP-103, TC-COMP-104, TC-COMP-105, TC-COMP-106 | TC-INT-034, TC-INT-035 | TC-E2E-001, TC-E2E-009, TC-E2E-010 | Covered |
| AC-14 | Capability | Enough stocks to rank | TC-COMP-072, TC-COMP-073, TC-COMP-107, TC-COMP-108, TC-COMP-109, TC-COMP-110 | TC-INT-036 | TC-E2E-002, TC-E2E-008 | Covered |
| AC-15 | Capability | Retired stocks | TC-COMP-108, TC-COMP-111, TC-COMP-112, TC-COMP-113, TC-COMP-114, TC-COMP-115, TC-COMP-116, TC-COMP-117, TC-COMP-118, TC-COMP-119 | TC-INT-037, TC-INT-038 | TC-E2E-001, TC-E2E-003, TC-E2E-008, TC-E2E-012 | Covered |
| AC-16 | Capability | Compare | TC-COMP-088, TC-COMP-089, TC-COMP-096, TC-COMP-112, TC-COMP-120, TC-COMP-121, TC-COMP-122, TC-COMP-123, TC-COMP-124, TC-COMP-125, TC-COMP-126, TC-COMP-127, TC-COMP-128, TC-COMP-129, TC-COMP-130, TC-COMP-131, TC-COMP-132, TC-COMP-133, TC-COMP-134, TC-COMP-135, TC-COMP-136, TC-COMP-137, TC-COMP-138, TC-COMP-139, TC-COMP-140, TC-COMP-141, TC-COMP-142, TC-COMP-143, TC-COMP-144, TC-COMP-145 | TC-INT-033, TC-INT-038, TC-INT-039, TC-INT-040, TC-INT-041, TC-INT-042, TC-INT-043 | TC-E2E-005, TC-E2E-007, TC-E2E-008 | Covered |
| AC-17 | Capability | Evidence behind a result | TC-COMP-105, TC-COMP-106, TC-COMP-146, TC-COMP-147, TC-COMP-148, TC-COMP-149 | TC-INT-025, TC-INT-044, TC-INT-045 | TC-E2E-007, TC-E2E-010 | Covered |
| AC-18 | Capability | Classification history | TC-COMP-150, TC-COMP-151, TC-COMP-152, TC-COMP-153, TC-COMP-154, TC-COMP-155 | TC-INT-046, TC-INT-047, TC-INT-048 | TC-E2E-009 | Covered |
| AC-19 | Capability | No backdating | TC-COMP-154, TC-COMP-155, TC-COMP-156, TC-COMP-157, TC-COMP-158, TC-COMP-159, TC-COMP-160, TC-COMP-161, TC-COMP-162 | TC-INT-024, TC-INT-049 | — | Covered |
| AC-20 | Capability | Previous set while not current | TC-COMP-163, TC-COMP-164, TC-COMP-165, TC-COMP-166, TC-COMP-167, TC-COMP-168, TC-COMP-169, TC-COMP-170, TC-COMP-171, TC-COMP-172, TC-COMP-173, TC-COMP-174, TC-COMP-175, TC-COMP-176, TC-COMP-177 | TC-INT-050, TC-INT-051, TC-INT-052, TC-INT-053, TC-INT-054 | TC-E2E-002, TC-E2E-009 | Covered |
| AC-21 | Capability | Classification currency | TC-COMP-170, TC-COMP-174, TC-COMP-175, TC-COMP-176, TC-COMP-177, TC-COMP-178, TC-COMP-179, TC-COMP-180 | TC-INT-055, TC-INT-056 | TC-E2E-001 | Covered |
| AC-22 | Capability | Honest empty state | TC-COMP-171, TC-COMP-173, TC-COMP-181, TC-COMP-182, TC-COMP-183, TC-COMP-184, TC-COMP-185 | TC-INT-057 | TC-E2E-002 | Covered |
| AC-23 | Capability | Restatement mark | TC-COMP-186, TC-COMP-187, TC-COMP-188, TC-COMP-189, TC-COMP-190, TC-COMP-191, TC-COMP-192 | TC-INT-058 | TC-E2E-009 | Covered |
| DAC-E2-1 | Derived (E2) | Each of the eight named inputs MUST be derived exactly per the trailing-twelve-month sums… | TC-COMP-060, TC-COMP-061, TC-COMP-062, TC-COMP-063, TC-COMP-064, TC-COMP-065 | — | — | Covered |
| DAC-E2-2 | Derived (E2) | A factor's peer set MUST be exactly the active instruments whose inputs for that factor a… | TC-COMP-067, TC-COMP-068 | — | — | Covered |
| DAC-E2-3 | Derived (E2) | The composite MUST be formed by z-scoring each input over the peer set with the sample st… | TC-COMP-069 | — | — | Covered |
| DAC-E2-4 | Derived (E2) | classification_set.run_id MUST be unique so a run acquires at most one set; a run in fail… | TC-COMP-075, TC-COMP-078, TC-COMP-081 | TC-INT-029, TC-INT-030 | — | Covered |
| DAC-E2-5 | Derived (E2) | A build over 3000 active instruments MUST complete within the AC-11 budget less the detec… | TC-COMP-091 | — | — | Covered |
| DAC-E2-6 | Derived (E2) | A fundamental input MUST be outdated when its latest reported period ended more than 6 mo… | TC-COMP-100, TC-COMP-101, TC-COMP-102 | — | — | Covered |
| DAC-E2-7 | Derived (E2) | A factor MUST be ranked only when at least 30 stocks qualify; below that, every active st… | TC-COMP-107 | — | — | Covered |
| DAC-E2-8 | Derived (E2) | A retired instrument MUST be excluded from every peer set and recorded not_classified wit… | TC-COMP-111 | — | — | Covered |
| DAC-E2-9 | Derived (E2) | Every input used by a classification set MUST be selected exactly as it existed when that… | TC-COMP-159, TC-COMP-161, TC-COMP-162 | — | — | Covered |
| DAC-E2-10 | Derived (E2) | A classification_set MUST transition to complete in the same transaction as its last clas… | TC-COMP-163, TC-COMP-164, TC-COMP-166, TC-COMP-167 | TC-INT-051, TC-INT-054 | — | Covered |
| DAC-E2-11 | Derived (E2) | A value or growth classification built on any statement whose provider_filing_date preced… | TC-COMP-186, TC-COMP-187 | — | — | Covered |
| DAC-E2-12 | Derived (E2) | A classification_set left building by an interrupted application process MUST be recorded… | TC-COMP-168, TC-COMP-169 | TC-INT-053 | — | Covered |
| DAC-E3-1 | Derived (E3) | current_set MUST resolve to the latest set in state complete, and later MUST carry the mo… | TC-COMP-170 | — | — | Covered |
| DAC-E3-2 | Derived (E3) | evaluate_filter MUST be the one predicate used by the list read, by compare, and by unive… | TC-COMP-122 | — | — | Covered |
| DAC-E3-3 | Derived (E3) | A threshold on a factor MUST exclude only a stock classified on that factor that fails th… | TC-COMP-096 | TC-INT-033 | — | Covered |
| DAC-E3-4 | Derived (E3) | hide_incomplete MUST exclude a stock only when its not_classified reason on any factor is… | TC-COMP-108 | — | — | Covered |
| DAC-E3-5 | Derived (E3) | The unscoped list MUST be active instruments only; a universe scope or a compare request… | TC-COMP-112 | TC-INT-037 | — | Covered |
| DAC-E3-6 | Derived (E3) | match_count MUST be the count over the whole filtered scope (lifecycle scope, thresholds,… | TC-COMP-120 | TC-INT-039 | — | Covered |
| DAC-E3-7 | Derived (E3) | Compare MUST accept 2 to 6 symbols, never fewer or more, and MUST return every requested… | TC-COMP-123, TC-COMP-124, TC-COMP-125 | TC-INT-040 | — | Covered |
| DAC-E3-8 | Derived (E3) | A stock's evidence read MUST return every factor_input row of the current set with its va… | TC-COMP-146, TC-COMP-147 | TC-INT-009 | — | Covered |
| DAC-E3-9 | Derived (E3) | A stock's history read MUST return only complete sets' results, newest first, exactly as… | TC-COMP-150, TC-COMP-152 | — | — | Covered |
| DAC-E3-10 | Derived (E3) | A stock MUST be reported current in the summary exactly when none of its factor_input row… | TC-COMP-103 | TC-INT-035 | — | Covered |
| DAC-E3-11 | Derived (E3) | The summary and the list read MUST carry the same set and later shape, including before a… | TC-COMP-171, TC-COMP-173 | — | — | Covered |
| DAC-E3-12 | Derived (E3) | The restatement mark MUST be carried on every read that returns a factor cell: list, comp… | TC-COMP-189 | TC-INT-058 | — | Covered |
| DAC-E3-13 | Derived (E3) | create_app MUST include the universes and classifications routers before the Host/Origin… | TC-COMP-088, TC-COMP-089 | — | — | Covered |
| DAC-E5-1 | Derived (E5) | Compare MUST hold 2 to 6 stocks; a stock not classified on a factor MUST keep its column… | TC-COMP-127, TC-COMP-128, TC-COMP-129 | — | — | Covered |
| DAC-E5-2 | Derived (E5) | Stock evidence MUST show every input with its value (where present), as_of and known_on,… | TC-COMP-105, TC-COMP-106 | — | — | Covered |
| DAC-E5-3 | Derived (E5) | A stock no longer followed MUST render "Not followed" on every factor in Compare and evid… | TC-COMP-114, TC-COMP-115, TC-COMP-116 | — | — | Covered |
| DAC-E5-4 | Derived (E5) | The Earlier scores / history tab MUST show only recorded results, newest first, and MUST… | TC-COMP-154, TC-COMP-155 | — | — | Covered |
| DAC-E5-5 | Derived (E5) | The restatement mark MUST render on every percentile it applies to across Compare and Sto… | TC-COMP-190, TC-COMP-191, TC-COMP-192 | — | — | Covered |
| DAC-E4-1 | Derived (E4) | A scored factor cell MUST show a whole-number percentile and a bar; an incomplete factor… | TC-COMP-072, TC-COMP-073 | — | — | Covered |
| DAC-E4-2 | Derived (E4) | Before any score exists, the results body MUST state that no stocks have been scored, rat… | TC-COMP-184, TC-COMP-185 | — | — | Covered |
| DAC-E4-3 | Derived (E4) | The results heading MUST read the server's match_count, never the number of rows loaded i… | TC-COMP-131, TC-COMP-132, TC-COMP-133, TC-COMP-135, TC-COMP-136, TC-COMP-144, TC-COMP-145 | — | — | Covered |
| DAC-E4-4 | Derived (E4) | While a later set is building, the current set MUST stay displayed with a warning banner… | TC-COMP-174, TC-COMP-175, TC-COMP-176, TC-COMP-177 | — | — | Covered |
| DAC-E4-5 | Derived (E4) | "Save these {n} as a universe…" MUST be blocked at zero matches and, when confirmed, MUST… | TC-COMP-008, TC-COMP-009 | — | — | Covered |
| DAC-E4-6 | Derived (E4) | The rail MUST gain exactly one Research destination and the five /research routes MUST re… | TC-COMP-193, TC-COMP-194, TC-COMP-195, TC-COMP-196, TC-COMP-197 | — | — | Covered |
| DAC-E1-1 | Derived (E1) | create_by_hand and add_members MUST refuse the whole request when any named symbol lacks… | TC-COMP-001, TC-COMP-004, TC-COMP-006 | TC-INT-002 | — | Covered |
| DAC-E1-2 | Derived (E1) | create_from_filter MUST evaluate the owner-reviewed Thresholds object against the named c… | TC-COMP-012, TC-COMP-013, TC-COMP-015 | TC-INT-005, TC-INT-006 | — | Covered |
| DAC-E1-3 | Derived (E1) | A created event taken from a filter MUST carry filter_provenance with the bounds, hide_in… | TC-COMP-014 | TC-INT-005 | — | Covered |
| DAC-E1-4 | Derived (E1) | Universe names MUST be unique among active universes after trimming; a retired universe's… | TC-COMP-023, TC-COMP-030 | TC-INT-010 | — | Covered |
| DAC-E1-5 | Derived (E1) | Two concurrent creates naming the same universe name MUST serialise through the write loc… | TC-COMP-019 | TC-INT-011 | — | Covered |
| DAC-E1-6 | Derived (E1) | Adding a symbol that is already a current member MUST report it as already_member rather… | TC-COMP-024, TC-COMP-027, TC-COMP-031 | — | — | Covered |
| DAC-E1-7 | Derived (E1) | Removing a universe's sole member MUST be refused with last_member, offering retirement a… | TC-COMP-034, TC-COMP-036, TC-COMP-037, TC-COMP-038, TC-COMP-041, TC-COMP-043, TC-COMP-044 | TC-INT-018 | — | Covered |
| DAC-E1-8 | Derived (E1) | Membership as of a given America/Chicago date MUST equal exactly the members implied by e… | TC-COMP-049, TC-COMP-050, TC-COMP-055, TC-COMP-056 | TC-INT-019, TC-INT-020 | — | Covered |
| DAC-E1-9 | Derived (E1) | A symbol acquisition covers but whose instrument.lifecycle is retired MAY be added or MAY… | TC-COMP-117, TC-COMP-118, TC-COMP-119 | — | — | Covered |
| DAC-E1-10 | Derived (E1) | No statement issued by this EPIC's components against universe or universe_event MAY be a… | TC-COMP-047, TC-COMP-052, TC-COMP-054 | — | — | Covered |
| DAC-E2-S1-1 | Derived (E2-S1) | Migration 0006 applies over 0001-0005 and data unchanged | TC-COMP-156 | — | — | Covered |
| DAC-E2-S1-2 | Derived (E2-S1) | Duplicate run_id for a classification set is refused | TC-COMP-075 | — | — | Covered |
| DAC-E2-S1-3 | Derived (E2-S1) | Only one building set allowed at a time | TC-COMP-163 | — | — | Covered |
| DAC-E2-S1-4 | Derived (E2-S1) | Complete and failed set required columns enforced | TC-COMP-164 | — | — | Covered |
| DAC-E2-S1-5 | Derived (E2-S1) | Classification row shape CHECK refuses malformed rows | TC-COMP-165 | — | — | Covered |
| DAC-E2-S1-6 | Derived (E2-S1) | factor_input rejects wrong factor name and incomplete present rows | TC-COMP-157 | — | — | Covered |
| DAC-E2-S1-7 | Derived (E2-S1) | pg_dump restore returns current set and membership unchanged | TC-COMP-158 | — | — | Covered |
| DAC-E2-S1-8 | Derived (E2-S1) | classification/sql is shipped as package data | TC-COMP-076 | — | — | Covered |
| DAC-E2-S2-1 | Derived (E2-S2) | Failure after inputs written leaves zero rows and failed set | TC-COMP-166 | — | — | Covered |
| DAC-E2-S2-2 | Derived (E2-S2) | Completing an already-failed set updates no row and rolls back | TC-COMP-167 | TC-INT-052 | — | Covered |
| DAC-E2-S2-3 | Derived (E2-S2) | Build timeout fails the set with a timeout reason | TC-COMP-090 | — | — | Covered |
| DAC-E2-S2-4 | Derived (E2-S2) | set_context resolves date, latest trading day and roster in-transaction | TC-COMP-159 | — | — | Covered |
| DAC-E2-S2-5 | Derived (E2-S2) | Unresolved LINE_ITEMS key yields missing inputs; momentum still classifies | TC-COMP-059 | — | — | Covered |
| DAC-E2-S2-6 | Derived (E2-S2) | classification package is isolated from ingestion and append-only | TC-COMP-160 | — | — | Covered |
| DAC-E2-S3-1 | Derived (E2-S3) | revenue_growth equals four-quarter sum over prior four minus one | TC-COMP-060 | — | — | Covered |
| DAC-E2-S3-2 | Derived (E2-S3) | Seven quarters leave growth inputs missing, value unaffected | TC-COMP-094 | — | — | Covered |
| DAC-E2-S3-3 | Derived (E2-S3) | Annual FY rows enter no TTM sum | TC-COMP-061 | — | — | Covered |
| DAC-E2-S3-4 | Derived (E2-S3) | Later observation of a period is used; earlier untouched | TC-COMP-161 | — | — | Covered |
| DAC-E2-S3-5 | Derived (E2-S3) | Fundamental outdated at 6 months and a day, present at exactly 6 | TC-COMP-100 | — | — | Covered |
| DAC-E2-S3-6 | Derived (E2-S3) | Stale latest bar makes value inputs outdated, growth unaffected | TC-COMP-101 | — | — | Covered |
| DAC-E2-S3-7 | Derived (E2-S3) | Non-positive base or shares make inputs not_computable | TC-COMP-062 | — | — | Covered |
| DAC-E2-S4-1 | Derived (E2-S4) | Missing 12-month price makes only return_12m missing | TC-COMP-063 | — | — | Covered |
| DAC-E2-S4-2 | Derived (E2-S4) | 2-for-1 split inside window leaves return unchanged | TC-COMP-064 | — | — | Covered |
| DAC-E2-S4-3 | Derived (E2-S4) | Dividend of 1 on close of 100 multiplies return factor by 1.01 | TC-COMP-065 | — | — | Covered |
| DAC-E2-S4-4 | Derived (E2-S4) | Momentum known_on is max observed_on of bars and actions used | TC-COMP-066 | — | — | Covered |
| DAC-E2-S4-5 | Derived (E2-S4) | Stale latest bar makes all momentum inputs outdated | TC-COMP-102 | — | — | Covered |
| DAC-E2-S5-1 | Derived (E2-S5) | Composite arithmetic matches hand-built peer set and properties | TC-COMP-069 | — | — | Covered |
| DAC-E2-S5-2 | Derived (E2-S5) | Stock with two of three value inputs is outside value peer set | TC-COMP-067 | — | — | Covered |
| DAC-E2-S5-3 | Derived (E2-S5) | 29 qualifying stocks: not ranked; 30 ranks | TC-COMP-107 | — | — | Covered |
| DAC-E2-S5-4 | Derived (E2-S5) | Retired instrument in no peer set, not classified retired | TC-COMP-111 | — | — | Covered |
| DAC-E2-S5-5 | Derived (E2-S5) | Scores identical regardless of universe membership | TC-COMP-068 | — | — | Covered |
| DAC-E2-S5-6 | Derived (E2-S5) | not_computable input yields input_not_computable naming it | TC-COMP-095 | — | — | Covered |
| DAC-E2-S6-1 | Derived (E2-S6) | Pre-first-observation statement marks value and growth restated_possible | TC-COMP-186 | — | — | Covered |
| DAC-E2-S6-2 | Derived (E2-S6) | Momentum classification is never marked | TC-COMP-187 | — | — | Covered |
| DAC-E2-S6-3 | Derived (E2-S6) | Earlier row's mark unchanged by a later set | TC-COMP-188 | — | — | Covered |
| DAC-E2-S7-1 | Derived (E2-S7) | 3000 instruments build within 295 s with expected row counts | TC-COMP-091 | — | — | Covered |
| DAC-E2-S7-2 | Derived (E2-S7) | Backfill after completion leaves the set unchanged | TC-COMP-162 | — | — | Covered |
| DAC-E2-S8-1 | Derived (E2-S8) | Only succeeded and partial runs are claimed | TC-COMP-077 | — | — | Covered |
| DAC-E2-S8-2 | Derived (E2-S8) | Qualifying runs claimed in ended_at order, once each | TC-COMP-078 | — | — | Covered |
| DAC-E2-S8-3 | Derived (E2-S8) | Claim while a set is building returns None | TC-COMP-079 | — | — | Covered |
| DAC-E2-S8-4 | Derived (E2-S8) | Claim at 23:30 Chicago stamps the Chicago date | TC-COMP-080 | — | — | Covered |
| DAC-E2-S8-5 | Derived (E2-S8) | Failed set for run A does not block later run B | TC-COMP-081 | — | — | Covered |
| DAC-E2-S8-6 | Derived (E2-S8) | reclaim_interrupted_sets fails stale building sets only | TC-COMP-168 | — | — | Covered |
| DAC-E2-S8-7 | Derived (E2-S8) | Invalid poll interval settings fail naming the variable | TC-COMP-082 | — | — | Covered |
| DAC-E2-S9-1 | Derived (E2-S9) | Loop claims and builds via dispatcher; idle waits poll interval | TC-COMP-083 | — | — | Covered |
| DAC-E2-S9-2 | Derived (E2-S9) | Raising claim is logged and the loop continues | TC-COMP-084 | — | — | Covered |
| DAC-E2-S9-3 | Derived (E2-S9) | Reclaim runs once before the first claim | TC-COMP-169 | — | — | Covered |
| DAC-E2-S9-4 | Derived (E2-S9) | Short build timeout reaches the engine and fails the set | TC-COMP-092 | — | — | Covered |
| DAC-E2-S9-5 | Derived (E2-S9) | ingestion_main imports nothing from classification | TC-COMP-085 | — | — | Covered |
| DAC-E3-S1-1 | Derived (E3-S1) | current_set returns complete set with newer building set as later | TC-COMP-170 | — | — | Covered |
| DAC-E3-S1-2 | Derived (E3-S1) | First set building or failed gives never_classified with later | TC-COMP-171 | — | — | Covered |
| DAC-E3-S1-3 | Derived (E3-S1) | No set at all gives never_classified in the same shape | TC-COMP-181 | — | — | Covered |
| DAC-E3-S1-4 | Derived (E3-S1) | Summary currency counts missing/outdated, not not_computable | TC-COMP-103 | — | — | Covered |
| DAC-E3-S1-5 | Derived (E3-S1) | Summary returns counts only from indexed rows | TC-COMP-104 | — | — | Covered |
| DAC-E3-S1-6 | Derived (E3-S1) | Reader returns stored values and recomputes nothing | TC-COMP-178 | — | — | Covered |
| DAC-E3-S2-1 | Derived (E3-S2) | Threshold excludes only classified stocks failing the bound | TC-COMP-096 | — | — | Covered |
| DAC-E3-S2-2 | Derived (E3-S2) | hide_incomplete hides only input-reason stocks | TC-COMP-108 | — | — | Covered |
| DAC-E3-S2-3 | Derived (E3-S2) | Unscoped list is active only; universe scope keeps retired | TC-COMP-112 | — | — | Covered |
| DAC-E3-S2-4 | Derived (E3-S2) | match_count identical on every page | TC-COMP-120 | — | — | Covered |
| DAC-E3-S2-5 | Derived (E3-S2) | Sort allowlist enforced; cursor round-trips and rejects tampering | TC-COMP-121 | — | — | Covered |
| DAC-E3-S2-6 | Derived (E3-S2) | Restated value or growth cell carries restated_possible | TC-COMP-189 | — | — | Covered |
| DAC-E3-S2-7 | Derived (E3-S2) | All-null thresholds match every stock in scope | TC-COMP-122 | — | — | Covered |
| DAC-E3-S3-1 | Derived (E3-S3) | Compare returns every known symbol, 2 to 6 only | TC-COMP-123 | — | — | Covered |
| DAC-E3-S3-2 | Derived (E3-S3) | Unrecognised compare symbol reported in unknown_symbols | TC-COMP-124 | — | — | Covered |
| DAC-E3-S3-3 | Derived (E3-S3) | Evidence returns every factor_input with dates and universes | TC-COMP-146 | — | — | Covered |
| DAC-E3-S3-4 | Derived (E3-S3) | Retired stock keeps its row with retired reason | TC-COMP-113 | — | — | Covered |
| DAC-E3-S3-5 | Derived (E3-S3) | Evidence with no current set has null set, same shape | TC-COMP-147 | — | — | Covered |
| DAC-E3-S4-1 | Derived (E3-S4) | History returns complete sets newest first with marks | TC-COMP-150 | — | — | Covered |
| DAC-E3-S4-2 | Derived (E3-S4) | Never-classified stock history is empty, not unknown | TC-COMP-151 | — | — | Covered |
| DAC-E3-S4-3 | Derived (E3-S4) | History excludes failed/building sets; set list includes them | TC-COMP-152 | — | — | Covered |
| DAC-E3-S4-4 | Derived (E3-S4) | 3000-stock list, sort and count served from indexed rows | TC-COMP-153 | — | — | Covered |
| DAC-E3-S5-1 | Derived (E3-S5) | /summary routed to the summary handler | TC-COMP-172 | — | — | Covered |
| DAC-E3-S5-2 | Derived (E3-S5) | Compare outside 2 to 6 rejected before the reader | TC-COMP-125 | — | — | Covered |
| DAC-E3-S5-3 | Derived (E3-S5) | List and summary share never_classified/set/later shape | TC-COMP-173 | — | — | Covered |
| DAC-E3-S5-4 | Derived (E3-S5) | Cells serialise as decimal strings with restated_possible | TC-COMP-070 | — | — | Covered |
| DAC-E3-S5-5 | Derived (E3-S5) | Unknown symbol on evidence returns documented error envelope | TC-COMP-148 | — | — | Covered |
| DAC-E3-S5-6 | Derived (E3-S5) | Classification routes mounted behind middleware, ahead of static | TC-COMP-126 | — | — | Covered |
| DAC-E3-S6-1 | Derived (E3-S6) | Lifespan creates and cancels the classification task | TC-COMP-086 | — | — | Covered |
| DAC-E3-S6-2 | Derived (E3-S6) | Lifespan passes pool and ClassificationSettings to the scheduler | TC-COMP-087 | — | — | Covered |
| DAC-E3-S6-3 | Derived (E3-S6) | No-secrets test covers every new route | TC-COMP-088 | — | — | Covered |
| DAC-E3-S6-4 | Derived (E3-S6) | Only app.py and test_api_no_secrets.py changed, additively | TC-COMP-089 | — | — | Covered |
| DAC-E5-S1-1 | Derived (E5-S1) | Compare keeps incomplete stock's column with the input named | TC-COMP-127 | — | — | Covered |
| DAC-E5-S1-2 | Derived (E5-S1) | Compare blocks Add at six and prompts below two | TC-COMP-128 | — | — | Covered |
| DAC-E5-S1-3 | Derived (E5-S1) | Unknown symbol is a field error; no column added | TC-COMP-129 | — | — | Covered |
| DAC-E5-S1-4 | Derived (E5-S1) | Retired stock reads Not followed on every factor in Compare | TC-COMP-114 | — | — | Covered |
| DAC-E5-S1-5 | Derived (E5-S1) | Possibly restated mark on Compare percentiles, sentence once | TC-COMP-190 | — | — | Covered |
| DAC-E5-S2-1 | Derived (E5-S2) | Earlier scores tab lists results newest first, not recomputed | TC-COMP-154 | — | — | Covered |
| DAC-E5-S2-2 | Derived (E5-S2) | No earlier scores shown distinct from never scored | TC-COMP-155 | — | — | Covered |
| DAC-E5-S2-3 | Derived (E5-S2) | Retired stock's earlier classifications remain visible | TC-COMP-115 | — | — | Covered |
| DAC-E5-S2-4 | Derived (E5-S2) | Restatement mark on history rows retained for older rows | TC-COMP-191 | — | — | Covered |
| DAC-E5-S3-1 | Derived (E5-S3) | Outdated fundamental card names period end, rule and recovery | TC-COMP-105 | — | — | Covered |
| DAC-E5-S3-2 | Derived (E5-S3) | No-provider-data factor offers no recovery | TC-COMP-106 | — | — | Covered |
| DAC-E5-S3-3 | Derived (E5-S3) | STD-UI-18 sentence once; restatement meaning beside first mark | TC-COMP-192 | — | — | Covered |
| DAC-E5-S3-4 | Derived (E5-S3) | Retired stock evidence reads Not followed; history keeps scores | TC-COMP-116 | — | — | Covered |
| DAC-E5-S3-5 | Derived (E5-S3) | Unknown symbol shows not-found state | TC-COMP-149 | — | — | Covered |
| DAC-E4-S1-1 | Derived (E4-S1) | Exporting requestJson changes only the export keyword | TC-COMP-130 | — | — | Covered |
| DAC-E4-S1-2 | Derived (E4-S1) | Fetch layer surfaces envelope code, operation, resource, reason | TC-COMP-182 | — | — | Covered |
| DAC-E4-S1-3 | Derived (E4-S1) | Types express neverClassified, set and later as one shape | TC-COMP-183 | — | — | Covered |
| DAC-E4-S1-4 | Derived (E4-S1) | Every API response field has a typed counterpart; scores stay strings | TC-COMP-131 | — | — | Covered |
| DAC-E4-S10-1 | Derived (E4-S10) | Rail reads five destinations in order; landing redirect unchanged | TC-COMP-193 | — | — | Covered |
| DAC-E4-S10-2 | Derived (E4-S10) | Five research routes render inside the shell | TC-COMP-194 | — | — | Covered |
| DAC-E4-S10-3 | Derived (E4-S10) | Unreachable state applies to every CAP-002 route | TC-COMP-195 | — | — | Covered |
| DAC-E4-S10-4 | Derived (E4-S10) | Only shell, routes and four tests changed, assertions limited | TC-COMP-196 | — | — | Covered |
| DAC-E4-S10-5 | Derived (E4-S10) | SHELL_ROUTES link targets point at delivered routes | TC-COMP-197 | — | — | Covered |
| DAC-E4-S2-1 | Derived (E4-S2) | ResearchQuery URL round-trip; one sentence per bound | TC-COMP-132 | — | — | Covered |
| DAC-E4-S2-2 | Derived (E4-S2) | Save payload is twelve bounds, hide_incomplete and symbol | TC-COMP-133 | — | — | Covered |
| DAC-E4-S2-3 | Derived (E4-S2) | Score, percentile, ratio, rate and date formatting | TC-COMP-071 | — | — | Covered |
| DAC-E4-S2-4 | Derived (E4-S2) | copy.ts contains no forbidden vocabulary | TC-COMP-072 | — | — | Covered |
| DAC-E4-S3-1 | Derived (E4-S3) | Unscored factor never shows 0 or bare number | TC-COMP-073 | — | — | Covered |
| DAC-E4-S3-2 | Derived (E4-S3) | Measured 0.00 score renders as 0.00 | TC-COMP-074 | — | — | Covered |
| DAC-E4-S3-3 | Derived (E4-S3) | Possibly restated mark on value and growth only | TC-COMP-097 | — | — | Covered |
| DAC-E4-S3-4 | Derived (E4-S3) | Every status has a word plus shape; polarity colour carries no value | TC-COMP-109 | — | — | Covered |
| DAC-E4-S4-1 | Derived (E4-S4) | Banner absent when later null; warning banner when building | TC-COMP-174 | — | — | Covered |
| DAC-E4-S4-2 | Derived (E4-S4) | Failed attempt banner shows recorded reason, no retry | TC-COMP-175 | — | — | Covered |
| DAC-E4-S4-3 | Derived (E4-S4) | As-of line shows times in America/Chicago with run link | TC-COMP-179 | — | — | Covered |
| DAC-E4-S4-4 | Derived (E4-S4) | Failed poll keeps banner and offers Try again | TC-COMP-176 | — | — | Covered |
| DAC-E4-S4-5 | Derived (E4-S4) | New complete set triggers exactly one announcement and reload | TC-COMP-177 | — | — | Covered |
| DAC-E4-S4-6 | Derived (E4-S4) | Never-populated store polls from first load | TC-COMP-184 | — | — | Covered |
| DAC-E4-S5-1 | Derived (E4-S5) | Threshold field validates percentile and non-finite scores on blur | TC-COMP-134 | — | — | Covered |
| DAC-E4-S5-2 | Derived (E4-S5) | One list request per filter change, URL updated | TC-COMP-135 | — | — | Covered |
| DAC-E4-S5-3 | Derived (E4-S5) | Clear filters resets filters and keeps sort | TC-COMP-136 | — | — | Covered |
| DAC-E4-S5-4 | Derived (E4-S5) | Threshold sentences have accessible names reading as sentences | TC-COMP-137 | — | — | Covered |
| DAC-E4-S6-1 | Derived (E4-S6) | Under-30 factor shows header count, Not enough to rank, no sort | TC-COMP-110 | — | — | Covered |
| DAC-E4-S6-2 | Derived (E4-S6) | Sort issues request, updates aria-sort, announces count | TC-COMP-138 | — | — | Covered |
| DAC-E4-S6-3 | Derived (E4-S6) | Incomplete factor cell and incomplete rows sort last | TC-COMP-098 | — | — | Covered |
| DAC-E4-S6-4 | Derived (E4-S6) | Selection and checking do not interfere | TC-COMP-139 | — | — | Covered |
| DAC-E4-S6-5 | Derived (E4-S6) | 3000 rows virtualised | TC-COMP-093 | — | — | Covered |
| DAC-E4-S7-1 | Derived (E4-S7) | Compare tray blocked at 1 or 7, enabled at 2 to 6 | TC-COMP-140 | — | — | Covered |
| DAC-E4-S7-2 | Derived (E4-S7) | Inspector debounces 150 ms and shows inputs with dates | TC-COMP-141 | — | — | Covered |
| DAC-E4-S7-3 | Derived (E4-S7) | Inspector empty sentence when nothing selected | TC-COMP-142 | — | — | Covered |
| DAC-E4-S7-4 | Derived (E4-S7) | Inspector reads In no universe | TC-COMP-143 | — | — | Covered |
| DAC-E4-S8-1 | Derived (E4-S8) | Save blocked at zero matches | TC-COMP-008 | — | — | Covered |
| DAC-E4-S8-2 | Derived (E4-S8) | Save under a search carries the prefix | TC-COMP-009 | — | — | Covered |
| DAC-E4-S8-3 | Derived (E4-S8) | 201 closes dialog and toasts a link | TC-COMP-010 | — | — | Covered |
| DAC-E4-S8-4 | Derived (E4-S8) | classification_set_changed replaces Save with Review new result | TC-COMP-011 | — | — | Covered |
| DAC-E4-S8-5 | Derived (E4-S8) | Add toast with already-member clause; universe_retired wording | TC-COMP-033 | — | — | Covered |
| DAC-E4-S9-1 | Derived (E4-S9) | Never-populated body distinct from no-match state | TC-COMP-185 | — | — | Covered |
| DAC-E4-S9-2 | Derived (E4-S9) | Heading shows server matchCount | TC-COMP-144 | — | — | Covered |
| DAC-E4-S9-3 | Derived (E4-S9) | Reload and back restore state from the URL | TC-COMP-145 | — | — | Covered |
| DAC-E4-S9-4 | Derived (E4-S9) | Earlier sets dialog opens and returns focus | TC-COMP-180 | — | — | Covered |
| DAC-E4-S9-5 | Derived (E4-S9) | Absence-judges-presence footnote appears once | TC-COMP-099 | — | — | Covered |
| DAC-E1-S1-1 | Derived (E1-S1) | Migration 0005 applies without touching CAP-001 rows | TC-COMP-045 | — | — | Covered |
| DAC-E1-S1-2 | Derived (E1-S1) | Universe event CHECK constraints refuse malformed events | TC-COMP-046 | — | — | Covered |
| DAC-E1-S1-3 | Derived (E1-S1) | Partial unique index allows one created and one retired event | TC-COMP-034 | — | — | Covered |
| DAC-E1-S1-4 | Derived (E1-S1) | Static guard finds no UPDATE or DELETE on universe_event | TC-COMP-047 | — | — | Covered |
| DAC-E1-S1-5 | Derived (E1-S1) | Migration 0005 matches research-store design | TC-COMP-017 | — | — | Covered |
| DAC-E1-S1-6 | Derived (E1-S1) | Second migrator run after 0005 applies nothing | TC-COMP-048 | — | — | Covered |
| DAC-E1-S1-7 | Derived (E1-S1) | Every sql directory is covered by a package-data glob | TC-COMP-018 | — | — | Covered |
| DAC-E1-S2-1 | Derived (E1-S2) | Same-day add and remove is not membership; add day counts | TC-COMP-049 | — | — | Covered |
| DAC-E1-S2-2 | Derived (E1-S2) | Membership before creation is empty and flagged | TC-COMP-050 | — | — | Covered |
| DAC-E1-S2-3 | Derived (E1-S2) | Retired instrument member replays with lifecycle retired | TC-COMP-117 | — | — | Covered |
| DAC-E1-S2-4 | Derived (E1-S2) | list_events orders by event_id DESC with stable cursor | TC-COMP-051 | — | — | Covered |
| DAC-E1-S2-5 | Derived (E1-S2) | Membership SQL is parameterised and loaded once from files | TC-COMP-052 | — | — | Covered |
| DAC-E1-S3-1 | Derived (E1-S3) | Uncovered symbols refuse the whole create or add | TC-COMP-001 | — | — | Covered |
| DAC-E1-S3-2 | Derived (E1-S3) | create_by_hand with no symbols raises EmptyUniverse | TC-COMP-035 | — | — | Covered |
| DAC-E1-S3-3 | Derived (E1-S3) | Create appends one created and n member_added events | TC-COMP-002 | — | — | Covered |
| DAC-E1-S3-4 | Derived (E1-S3) | Active universe name must be unique; retired name reusable | TC-COMP-023 | — | — | Covered |
| DAC-E1-S3-5 | Derived (E1-S3) | Concurrent same-name creates serialise on the write lock | TC-COMP-019 | — | — | Covered |
| DAC-E1-S3-6 | Derived (E1-S3) | Adding a current member reports already_member, no event | TC-COMP-024 | — | — | Covered |
| DAC-E1-S3-7 | Derived (E1-S3) | Retired-lifecycle covered symbol is accepted | TC-COMP-118 | — | — | Covered |
| DAC-E1-S3-8 | Derived (E1-S3) | 3000-member universe created and replayed correctly | TC-COMP-003 | — | — | Covered |
| DAC-E1-S4-1 | Derived (E1-S4) | Rename keeps identity, history and memberships | TC-COMP-025 | — | — | Covered |
| DAC-E1-S4-2 | Derived (E1-S4) | Removing the sole member raises LastMember | TC-COMP-036 | — | — | Covered |
| DAC-E1-S4-3 | Derived (E1-S4) | Removed member keeps both events in history | TC-COMP-053 | — | — | Covered |
| DAC-E1-S4-4 | Derived (E1-S4) | Retire appends one retired event, data stays readable | TC-COMP-037 | — | — | Covered |
| DAC-E1-S4-5 | Derived (E1-S4) | Every write to a retired universe raises UniverseRetired | TC-COMP-038 | — | — | Covered |
| DAC-E1-S4-6 | Derived (E1-S4) | Removing a non-member raises a typed error | TC-COMP-026 | — | — | Covered |
| DAC-E1-S4-7 | Derived (E1-S4) | New membership SQL has no UPDATE or DELETE and is parameterised | TC-COMP-054 | — | — | Covered |
| DAC-E1-S5-1 | Derived (E1-S5) | create_from_filter members equal evaluate_filter result | TC-COMP-012 | — | — | Covered |
| DAC-E1-S5-2 | Derived (E1-S5) | Newer complete set raises ClassificationSetChanged | TC-COMP-013 | — | — | Covered |
| DAC-E1-S5-3 | Derived (E1-S5) | Filter matching no stock raises EmptyUniverse | TC-COMP-039 | — | — | Covered |
| DAC-E1-S5-4 | Derived (E1-S5) | Saved snapshot Origin equals filter_provenance | TC-COMP-014 | — | — | Covered |
| DAC-E1-S5-5 | Derived (E1-S5) | hide_incomplete decides membership of incomplete stocks | TC-COMP-015 | — | — | Covered |
| DAC-E1-S5-6 | Derived (E1-S5) | Later sets do not change a saved snapshot's members | TC-COMP-016 | — | — | Covered |
| DAC-E1-S6-1 | Derived (E1-S6) | POST /api/universes uncovered symbol returns envelope naming all | TC-COMP-004 | — | — | Covered |
| DAC-E1-S6-2 | Derived (E1-S6) | Service refusals map to documented status and code | TC-COMP-040 | — | — | Covered |
| DAC-E1-S6-3 | Derived (E1-S6) | POST members with current member reports already_member in 200 | TC-COMP-027 | — | — | Covered |
| DAC-E1-S6-4 | Derived (E1-S6) | Out-of-bounds request rejected before the service is called | TC-COMP-005 | — | — | Covered |
| DAC-E1-S6-5 | Derived (E1-S6) | Universes router mounted behind middleware, ahead of static | TC-COMP-028 | — | — | Covered |
| DAC-E1-S6-6 | Derived (E1-S6) | DELETE sole member returns last_member, writes nothing | TC-COMP-041 | — | — | Covered |
| DAC-E1-S7-1 | Derived (E1-S7) | Create dialog submit blocked for zero or over 1000 symbols | TC-COMP-042 | — | — | Covered |
| DAC-E1-S7-2 | Derived (E1-S7) | Create dialog names every uncovered symbol and keeps the list | TC-COMP-006 | — | — | Covered |
| DAC-E1-S7-3 | Derived (E1-S7) | Successful create navigates to the new universe without toast | TC-COMP-007 | — | — | Covered |
| DAC-E1-S7-4 | Derived (E1-S7) | Retired universes appear only under the lifecycle select | TC-COMP-020 | — | — | Covered |
| DAC-E1-S7-5 | Derived (E1-S7) | Filter-origin line names search and hidden-incomplete only when applied | TC-COMP-021 | — | — | Covered |
| DAC-E1-S7-6 | Derived (E1-S7) | Never-populated state distinct from empty lifecycle filter | TC-COMP-022 | — | — | Covered |
| DAC-E1-S8-1 | Derived (E1-S8) | As-of view requests as_of and labels it; malformed date is field error | TC-COMP-055 | — | — | Covered |
| DAC-E1-S8-2 | Derived (E1-S8) | As-of before creation shows did-not-exist sentence | TC-COMP-056 | — | — | Covered |
| DAC-E1-S8-3 | Derived (E1-S8) | Retired member shows Not followed, absent from All followed stocks | TC-COMP-119 | — | — | Covered |
| DAC-E1-S8-4 | Derived (E1-S8) | Sole member Remove is blocked with adjacent Retire action | TC-COMP-043 | — | — | Covered |
| DAC-E1-S8-5 | Derived (E1-S8) | Remove dialog is confirm variant, focus on Cancel | TC-COMP-057 | — | — | Covered |
| DAC-E1-S8-6 | Derived (E1-S8) | History tab newest first, rename shows both names | TC-COMP-029 | — | — | Covered |
| DAC-E1-S9-1 | Derived (E1-S9) | Inline rename: Enter sends PATCH, Esc cancels, field errors | TC-COMP-030 | — | — | Covered |
| DAC-E1-S9-2 | Derived (E1-S9) | Add stocks reports already-current symbol politely | TC-COMP-031 | — | — | Covered |
| DAC-E1-S9-3 | Derived (E1-S9) | Add stocks with uncovered symbol names every symbol | TC-COMP-032 | — | — | Covered |
| DAC-E1-S9-4 | Derived (E1-S9) | Retire dialog is confirm variant; header shows Retired after 200 | TC-COMP-044 | — | — | Covered |
| DAC-E1-S9-5 | Derived (E1-S9) | Retired universe stays readable with universe_retired wording | TC-COMP-058 | — | — | Covered |

## Coverage Summary

- **Total ACs:** 266 (capability: 23, derived: 243)
- **Covered:** 266
- **Gaps:** 0
- **Component test cases:** 197
- **Integration test cases:** 58
- **E2E test cases:** 12

### Coverage Notes

1. **DAC-E4-6 and its story DACs DAC-E4-S10-1 to DAC-E4-S10-5 trace to no capability AC.** DAC-E4-6 states it traces "to the composition constraint, AGT-SCOPE-002; not a capability AC". They are covered by component tests TC-COMP-193, TC-COMP-194, TC-COMP-195, TC-COMP-196, TC-COMP-197 only. This is by design of the source, not a gap.
2. **Epic-level DACs are covered transitively.** Each epic-level DAC has no test of its own; it is covered by the component tests of its child story DACs, which list the epic DAC in their Traces to field. Every one of the 46 epic-level DACs has at least one such child test.
3. **Capability ACs and the story-level DACs.** Every story-level DAC has exactly one component test. AC-8 has no story-level DAC that traces to it directly; its component coverage is through DAC-E2-2 (child DAC-E2-S5-2 and DAC-E2-S5-5) and its integration coverage is the integration test comparing unscoped and universe-scoped classifications.
4. **Scope of the integration tier.** Contracts reachable only through Python call, Python coroutine or in-process entries (universe-service, classification-reader, factor-engine build, scheduler loop) are not integration boundaries and are tested at component scope. The integration boundaries used are the HTTP endpoints of classification-api and the SQL contracts in the research-store API table, plus the CAP-001 acquisition_run read (classification recorded as a decision record).
5. **Terminology.** The specs use "stock" for owner-facing text and "instrument" for stored data; "followed" and "acquisition list" both appear for CAP-001 coverage; "not classified" (capability) and "Incomplete" / "Not enough to rank" / "Not followed" (UX copy) name the same states. E2E steps use the UX copy; integration and component tests use the API reason codes.
6. **Underspecified detail not invented.** The specs do not state the response for a duplicate symbol inside one create request, nor an HTTP status for an out-of-allowlist sort value at the API (the reader raises ValueError; DAC-E3-S2-5 requires rejection). These are left untested at the API tier; DAC-E3-S2-5 covers the reader behaviour.
7. **Wording tension.** Capability AC-20 requires the product to show "the failure and its reason"; DAC-E4-4 and DAC-E4-S4-2 state the banner "offers nothing to retry", while DAC-E4-S4-4 offers "Try again" on a failed poll. These concern different failures (a failed classification versus a failed status poll), which the tests keep separate.
8. **Capability flow 1 step 6 and AC-22** (nothing classified yet) are exercised as the opening observation of TC-E2E-002 rather than as a separate E2E scenario, because the capability defines one user flow, not two.
9. **The capability assumption that acquired statements contain every line item the factors need is unverified** (capability section 6). the component test for DAC-E2-S2-5 covers an unresolved line-item key; no test asserts the assumption holds on real data.
