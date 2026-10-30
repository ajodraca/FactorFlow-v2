---
artifact_schema_version: 1
artifact_id: CAP-003-coverage-matrix
artifact_type: coverage-matrix
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-30T02:26:09Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-backlog
      version: "2"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---


# Test Coverage Matrix

## AC Coverage

| AC ID | Source | AC Description | Component Tests | Integration Tests | E2E Tests | Status |
|-------|--------|---------------|-----------------|-------------------|-----------|--------|
| AC-1 | Capability | One shell | TC-COMP-057, TC-COMP-087, TC-COMP-089, TC-COMP-147, TC-COMP-182 | TC-INT-001 | TC-E2E-007 | Covered |
| AC-2 | Capability | Setup comes first | TC-COMP-056, TC-COMP-115, TC-COMP-120 | TC-INT-001, TC-INT-002, TC-INT-003, TC-INT-004, TC-INT-008 | TC-E2E-001, TC-E2E-002 | Covered |
| AC-3 | Capability | Setup is a visible multi-step operation | TC-COMP-098, TC-COMP-103, TC-COMP-105, TC-COMP-108, TC-COMP-121, TC-COMP-125 | TC-INT-004, TC-INT-029, TC-INT-030, TC-INT-031 | TC-E2E-001, TC-E2E-002 | Covered |
| AC-4 | Capability | Credential presence, never value | TC-COMP-045, TC-COMP-053, TC-COMP-055, TC-COMP-076, TC-COMP-099, TC-COMP-104, TC-COMP-109, TC-COMP-154, TC-COMP-172, TC-COMP-185, TC-COMP-187 | TC-INT-038 | TC-E2E-001 | Covered |
| AC-5 | Capability | Pasted list is parsed honestly | TC-COMP-100, TC-COMP-113, TC-COMP-114 | TC-INT-005, TC-INT-006, TC-INT-007 | TC-E2E-001, TC-E2E-002 | Covered |
| AC-6 | Capability | Too few to rank is a warning, not a block | TC-COMP-100 | — | TC-E2E-001 | Covered |
| AC-7 | Capability | First download from setup | TC-COMP-029, TC-COMP-036, TC-COMP-101 | TC-INT-008, TC-INT-009, TC-INT-033, TC-INT-034, TC-INT-035 | TC-E2E-001 | Covered |
| AC-8 | Capability | Home's data tile | TC-COMP-001, TC-COMP-025, TC-COMP-059, TC-COMP-068, TC-COMP-128, TC-COMP-129, TC-COMP-136, TC-COMP-137, TC-COMP-138, TC-COMP-150 | TC-INT-003, TC-INT-010, TC-INT-011, TC-INT-012 | TC-E2E-005, TC-E2E-006 | Covered |
| AC-9 | Capability | Needs you | TC-COMP-002, TC-COMP-028, TC-COMP-029, TC-COMP-030, TC-COMP-041, TC-COMP-044, TC-COMP-141, TC-COMP-142 | TC-INT-013, TC-INT-025 | TC-E2E-005, TC-E2E-006 | Covered |
| AC-10 | Capability | Nothing unshipped on Home | TC-COMP-063, TC-COMP-130 | — | TC-E2E-005 | Covered |
| AC-11 | Capability | Data health verdict | TC-COMP-026, TC-COMP-027, TC-COMP-035, TC-COMP-038, TC-COMP-047, TC-COMP-052, TC-COMP-137, TC-COMP-138, TC-COMP-148, TC-COMP-149, TC-COMP-150, TC-COMP-156, TC-COMP-157, TC-COMP-158, TC-COMP-176 | TC-INT-010, TC-INT-011, TC-INT-014, TC-INT-015, TC-INT-017, TC-INT-026 | TC-E2E-003, TC-E2E-004 | Covered |
| AC-12 | Capability | A partial download is never complete | TC-COMP-021, TC-COMP-044, TC-COMP-094, TC-COMP-095, TC-COMP-170, TC-COMP-171, TC-COMP-204, TC-COMP-206, TC-COMP-213 | TC-INT-021, TC-INT-036 | TC-E2E-003 | Covered |
| AC-13 | Capability | Every problem names its fix | TC-COMP-040, TC-COMP-049, TC-COMP-051, TC-COMP-067, TC-COMP-152, TC-COMP-165, TC-COMP-166 | TC-INT-014, TC-INT-016, TC-INT-017, TC-INT-018, TC-INT-037 | TC-E2E-003 | Covered |
| AC-14 | Capability | Not found is not retried | TC-COMP-041, TC-COMP-153, TC-COMP-162, TC-COMP-165, TC-COMP-166, TC-COMP-192, TC-COMP-198, TC-COMP-211, TC-COMP-212 | TC-INT-018, TC-INT-019, TC-INT-020, TC-INT-039 | TC-E2E-003 | Covered |
| AC-15 | Capability | Download now is the retry | TC-COMP-101, TC-COMP-161 | TC-INT-014, TC-INT-021, TC-INT-022, TC-INT-023, TC-INT-024, TC-INT-035 | TC-E2E-003, TC-E2E-004 | Covered |
| AC-16 | Capability | Attention counts | TC-COMP-002, TC-COMP-049, TC-COMP-060, TC-COMP-068 | TC-INT-013, TC-INT-025, TC-INT-026, TC-INT-027, TC-INT-028 | TC-E2E-003, TC-E2E-005 | Covered |
| AC-17 | Capability | CAP-001's behaviour is preserved | TC-COMP-039, TC-COMP-042, TC-COMP-054, TC-COMP-065, TC-COMP-075, TC-COMP-078, TC-COMP-079, TC-COMP-102, TC-COMP-108, TC-COMP-126, TC-COMP-154, TC-COMP-162, TC-COMP-181, TC-COMP-183, TC-COMP-185, TC-COMP-191, TC-COMP-192, TC-COMP-193, TC-COMP-197, TC-COMP-198, TC-COMP-199, TC-COMP-203, TC-COMP-210, TC-COMP-211, TC-COMP-212, TC-COMP-217, TC-COMP-220, TC-COMP-222 | TC-INT-005, TC-INT-006, TC-INT-007, TC-INT-019, TC-INT-020, TC-INT-023, TC-INT-024, TC-INT-028, TC-INT-029, TC-INT-030, TC-INT-031, TC-INT-032, TC-INT-033, TC-INT-034, TC-INT-035, TC-INT-036, TC-INT-037, TC-INT-038, TC-INT-039, TC-INT-040 | TC-E2E-007, TC-E2E-008 | Covered |
| AC-18 | Capability | Old paths still arrive | TC-COMP-077, TC-COMP-183, TC-COMP-221, TC-COMP-223, TC-COMP-224 | TC-INT-040 | TC-E2E-008 | Covered |
| AC-19 | Capability | Product vocabulary | TC-COMP-037, TC-COMP-080, TC-COMP-085, TC-COMP-092, TC-COMP-096, TC-COMP-107, TC-COMP-111, TC-COMP-117, TC-COMP-123, TC-COMP-134, TC-COMP-139, TC-COMP-145, TC-COMP-159, TC-COMP-163, TC-COMP-168, TC-COMP-173, TC-COMP-179, TC-COMP-184, TC-COMP-186, TC-COMP-189, TC-COMP-195, TC-COMP-201, TC-COMP-208, TC-COMP-215, TC-COMP-218, TC-COMP-219, TC-COMP-220, TC-COMP-221 | TC-INT-040 | TC-E2E-007 | Covered |
| AC-20 | Capability | One tier per status | TC-COMP-020, TC-COMP-021, TC-COMP-022, TC-COMP-030, TC-COMP-086, TC-COMP-093, TC-COMP-097, TC-COMP-112, TC-COMP-118, TC-COMP-124, TC-COMP-135, TC-COMP-140, TC-COMP-146, TC-COMP-160, TC-COMP-164, TC-COMP-169, TC-COMP-174, TC-COMP-180, TC-COMP-190, TC-COMP-196, TC-COMP-202, TC-COMP-204, TC-COMP-206, TC-COMP-209, TC-COMP-213, TC-COMP-216 | — | TC-E2E-003, TC-E2E-007 | Covered |
| AC-21 | Capability | Honest empty state | TC-COMP-026, TC-COMP-043, TC-COMP-044, TC-COMP-048, TC-COMP-052, TC-COMP-056, TC-COMP-106, TC-COMP-115, TC-COMP-120, TC-COMP-127, TC-COMP-136, TC-COMP-151, TC-COMP-175 | TC-INT-002, TC-INT-004, TC-INT-017, TC-INT-032 | TC-E2E-001, TC-E2E-002, TC-E2E-005 | Covered |
| AC-22 | Capability | Command palette | TC-COMP-081, TC-COMP-082, TC-COMP-088 | TC-INT-041, TC-INT-042, TC-INT-043, TC-INT-044, TC-INT-045 | TC-E2E-007 | Covered |
| AC-23 | Capability | Unreachable is a designed state | TC-COMP-061, TC-COMP-071, TC-COMP-089 | TC-INT-046 | TC-E2E-009, TC-E2E-010 | Covered |
| AC-24 | Capability | Every region defines its states | TC-COMP-025, TC-COMP-031, TC-COMP-032, TC-COMP-035, TC-COMP-050, TC-COMP-058, TC-COMP-059, TC-COMP-062, TC-COMP-066, TC-COMP-070, TC-COMP-104, TC-COMP-106, TC-COMP-122, TC-COMP-131, TC-COMP-132, TC-COMP-133, TC-COMP-143, TC-COMP-148, TC-COMP-151, TC-COMP-155, TC-COMP-157, TC-COMP-158, TC-COMP-167, TC-COMP-177, TC-COMP-191, TC-COMP-197, TC-COMP-203, TC-COMP-210, TC-COMP-217 | TC-INT-011, TC-INT-012, TC-INT-015, TC-INT-027, TC-INT-042, TC-INT-045 | TC-E2E-004, TC-E2E-006, TC-E2E-009 | Covered |
| AC-25 | Capability | Keyboard and freshness | TC-COMP-006, TC-COMP-009, TC-COMP-010, TC-COMP-012, TC-COMP-013, TC-COMP-014, TC-COMP-015, TC-COMP-018, TC-COMP-023, TC-COMP-024, TC-COMP-060, TC-COMP-069, TC-COMP-073, TC-COMP-074, TC-COMP-080, TC-COMP-083, TC-COMP-088, TC-COMP-116, TC-COMP-119, TC-COMP-138, TC-COMP-141, TC-COMP-142, TC-COMP-170, TC-COMP-171, TC-COMP-182, TC-COMP-205, TC-COMP-211, TC-COMP-212 | TC-INT-001, TC-INT-008, TC-INT-009, TC-INT-021, TC-INT-027, TC-INT-036 | TC-E2E-001, TC-E2E-003, TC-E2E-005 | Covered |
| AC-26 | Capability | Built from the design system | TC-COMP-003, TC-COMP-004, TC-COMP-005, TC-COMP-007, TC-COMP-008, TC-COMP-011, TC-COMP-016, TC-COMP-017, TC-COMP-019, TC-COMP-033, TC-COMP-034, TC-COMP-072, TC-COMP-084, TC-COMP-090, TC-COMP-091, TC-COMP-110, TC-COMP-144, TC-COMP-178, TC-COMP-188, TC-COMP-193, TC-COMP-194, TC-COMP-200, TC-COMP-207, TC-COMP-214 | — | TC-E2E-007 | Covered |
| AC-27 | Capability | CAP-002 keeps its routes | TC-COMP-057, TC-COMP-081, TC-COMP-082, TC-COMP-223, TC-COMP-225 | TC-INT-044 | TC-E2E-007 | Covered |
| AC-28 | Capability | Data health answers in bounded time | TC-COMP-046, TC-COMP-049, TC-COMP-064, TC-COMP-176 | TC-INT-047 | — | Covered |
| DAC-E1-1 | Derived (E1) | `tierOf` and `labelOf` MUST implement every row of UX brief §12.2 verbatim: download `requested` / `running`… | TC-COMP-021 | — | — | Covered |
| DAC-E1-2 | Derived (E1) | `StatusBadge` MUST render the `badge` `status-<tier>` variant with the label as text and the tier shape… | TC-COMP-022 | — | — | Covered |
| DAC-E1-3 | Derived (E1) | `worstDataTier` MUST return `null` whenever `latestTerminalDownload` is null, for `affectedCount` 0 and above… | TC-COMP-026 | — | — | Covered |
| DAC-E1-4 | Derived (E1) | Otherwise `worstDataTier` MUST answer good *Yes* when `affectedCount` is 0, warning *Mostly yes* when it is… | TC-COMP-026 | — | — | Covered |
| DAC-E1-5 | Derived (E1) | `dataTileBadge` MUST return the worse of the verdict tier and the score-state tier by the same order with the… | TC-COMP-001 | — | — | Covered |
| DAC-E1-6 | Derived (E1) | `deriveNeedsYou` MUST produce each of the six kinds (`data_problems`, `download_not_complete`,… | TC-COMP-029 | — | — | Covered |
| DAC-E1-7 | Derived (E1) | `sortAttention` MUST order by tier (critical, serious, warning, good, neutral, with active sorting with… | TC-COMP-002 | — | — | Covered |
| DAC-E1-8 | Derived (E1) | `Absent` MUST render an em dash in `--value-missing` with visually hidden text naming what is absent, never… | TC-COMP-025 | — | — | Covered |
| DAC-E1-9 | Derived (E1) | `formatInstant` MUST render `YYYY-MM-DD HH:MM zone` (or with seconds when asked) in America/Chicago with the… | TC-COMP-023, TC-COMP-024 | — | — | Covered |
| DAC-E1-10 | Derived (E1) | `StateRegion` MUST take the delivered `ScreenState` union unchanged and one renderer per state, MUST refuse… | TC-COMP-031, TC-COMP-032 | — | — | Covered |
| DAC-E1-11 | Derived (E1) | `tailwind.config.js` MUST gain only the keys the vendored components reference (`primary`,… | TC-COMP-003 | — | — | Covered |
| DAC-E1-12 | Derived (E1) | No vendored component or pattern MAY contain a spacing, size or colour literal outside the theme, and no… | TC-COMP-008, TC-COMP-011, TC-COMP-016, TC-COMP-019 | — | — | Covered |
| DAC-E1-13 | Derived (E1) | `AsOfLine` MUST be the generalisation of CAP-002's `web/src/components/patterns/as-of-line.tsx`, with… | TC-COMP-033, TC-COMP-034 | — | — | Covered |
| DAC-E1-14 | Derived (E1) | `dialog` `confirm` (Radix AlertDialog) MUST put **Cancel** first and focus it; `button` `blocked` MUST remain… | TC-COMP-006, TC-COMP-012, TC-COMP-014, TC-COMP-015 | — | — | Covered |
| DAC-E1-15 | Derived (E1) | `dialog` `destructive` MUST NOT be used for stopping following or cancelling a download, because nothing is… | TC-COMP-006 | — | — | Covered |
| DAC-E1-S1-1 | Derived (E1-S1) | Given the three vendored sources, When they are copied, Then every `@/` import is rewritten to a relative… | TC-COMP-004 | — | — | Covered |
| DAC-E1-S1-2 | Derived (E1-S1) | Given `web/src/components/token-literals.test.ts`, When it runs over `web/src/components/`, Then it fails on… | TC-COMP-005 | — | — | Covered |
| DAC-E1-S1-3 | Derived (E1-S1) | Given `button` `blocked`, When rendered with a reason, Then it stays focusable, is `aria-disabled`, exposes… | TC-COMP-006 | — | — | Covered |
| DAC-E1-S1-4 | Derived (E1-S1) | Given `badge`, When each `status-<tier>` and `coverage-*` variant renders, Then its colour resolves to the… | TC-COMP-007 | — | — | Covered |
| DAC-E1-S1-5 | Derived (E1-S1) | Given `package.json`, When the five packages are added, Then each carries its licence in the change and no… | TC-COMP-008 | — | — | Covered |
| DAC-E1-S2-1 | Derived (E1-S2) | Given `radio-group` `cards`, When focused, Then the group is one tab stop and arrow keys move the selection;… | TC-COMP-009 | — | — | Covered |
| DAC-E1-S2-2 | Derived (E1-S2) | Given `input` `numeric` with a suffix, When rendered, Then the suffix is part of the input's accessible name,… | TC-COMP-010 | — | — | Covered |
| DAC-E1-S2-3 | Derived (E1-S2) | Given the six components, When `token-literals.test.ts` runs, Then it passes over them, and `package.json`… | TC-COMP-011 | — | — | Covered |
| DAC-E1-S3-1 | Derived (E1-S3) | Given `dialog` `confirm` open, When rendered, Then it has `role="dialog"` with `aria-modal`, focus is… | TC-COMP-012 | — | — | Covered |
| DAC-E1-S3-2 | Derived (E1-S3) | Given `toast()` with `error` or `warning`, When raised, Then it persists until dismissed, never takes focus… | TC-COMP-013 | — | — | Covered |
| DAC-E1-S3-3 | Derived (E1-S3) | Given `progress` `indeterminate`, When rendered, Then `progressbar` carries no `aria-valuenow`; `determinate`… | TC-COMP-014 | — | — | Covered |
| DAC-E1-S3-4 | Derived (E1-S3) | Given `command`, When opened, Then its dialog is labelled *Search FactorFlow*, `loop` is set, the input has… | TC-COMP-015 | — | — | Covered |
| DAC-E1-S3-5 | Derived (E1-S3) | Given the five components, When `token-literals.test.ts` runs, Then it passes with the `command` 560 px width… | TC-COMP-016 | — | — | Covered |
| DAC-E1-S4-1 | Derived (E1-S4) | Given 3000 rows in the `virtualised` variant, When rendered, Then the DOM holds only the windowed rows plus… | TC-COMP-017 | — | — | Covered |
| DAC-E1-S4-2 | Derived (E1-S4) | Given any variant, When rendered, Then column headers are programmatic (`columnheader`, `aria-sort` on a… | TC-COMP-018 | — | — | Covered |
| DAC-E1-S4-3 | Derived (E1-S4) | Given the component, When `token-literals.test.ts` runs, Then it passes, row height resolves to… | TC-COMP-019 | — | — | Covered |
| DAC-E1-S5-1 | Derived (E1-S5) | Given the `Status` union, When a new kind or state is added without a row, Then `tierOf` and `labelOf` fail… | TC-COMP-020 | — | — | Covered |
| DAC-E1-S5-2 | Derived (E1-S5) | Given `web/src/components/patterns/tiers.test.ts`, When it runs, Then it asserts every row of DAC-E1-1 by… | TC-COMP-021 | — | — | Covered |
| DAC-E1-S5-3 | Derived (E1-S5) | Given `status-badge.test.tsx`, When each tier renders, Then the label is in the accessible name, the shape is… | TC-COMP-022 | — | — | Covered |
| DAC-E1-S6-1 | Derived (E1-S6) | Given an instant in October and one in January, When `formatInstant` renders them, Then the zones are *CDT*… | TC-COMP-023 | — | — | Covered |
| DAC-E1-S6-2 | Derived (E1-S6) | Given `formatCount(1236)`, When rendered, Then it reads *1,236*; given a download with `started_at` null,… | TC-COMP-024 | — | — | Covered |
| DAC-E1-S6-3 | Derived (E1-S6) | Given `NotDeterminable` with a reason, When rendered, Then the reason is in its accessible description and… | TC-COMP-025 | — | — | Covered |
| DAC-E1-S7-1 | Derived (E1-S7) | Given `web/src/components/patterns/worst-data-tier.test.ts`, When it runs, Then it covers each row of the… | TC-COMP-026 | — | — | Covered |
| DAC-E1-S7-2 | Derived (E1-S7) | Given the tier order, When it is defined, Then it is one exported constant `TIER_ORDER` that `sortAttention`… | TC-COMP-027 | — | — | Covered |
| DAC-E1-S8-1 | Derived (E1-S8) | Given each kind, When `deriveNeedsYou` runs, Then the item's `target` is `/data` for `data_problems` and… | TC-COMP-028 | — | — | Covered |
| DAC-E1-S8-2 | Derived (E1-S8) | Given a summary in `error` state, When `deriveNeedsYou` runs, Then no score-derived item is produced and the… | TC-COMP-029 | — | — | Covered |
| DAC-E1-S8-3 | Derived (E1-S8) | Given `needs-you-item.tsx`, When rendered, Then the severity tile is `aria-hidden`, the tag badge carries the… | TC-COMP-030 | — | — | Covered |
| DAC-E1-S9-1 | Derived (E1-S9) | Given `state-region.test.tsx`, When it runs, Then each of the eight `ScreenState` kinds renders its renderer,… | TC-COMP-031 | — | — | Covered |
| DAC-E1-S9-2 | Derived (E1-S9) | Given a call omitting a renderer and its `notApplicable` reason, When `npx tsc --noEmit` runs, Then it fails… | TC-COMP-032 | — | — | Covered |
| DAC-E1-S10-1 | Derived (E1-S10) | Given `AsOfLine` with three parts, When rendered, Then they are joined by *·* with `--space-2` either side in… | TC-COMP-033 | — | — | Covered |
| DAC-E1-S10-2 | Derived (E1-S10) | Given CAP-002's Research as-of line after the change, When its delivered tests run, Then every case passes… | TC-COMP-034 | — | — | Covered |
| DAC-E2-1 | Derived (E2) | A followed stock has a problem exactly when its `instrument.lifecycle` is `active` and any of its… | TC-COMP-049 | — | — | Covered |
| DAC-E2-2 | Derived (E2) | A problem MUST leave every read only when a later download records `written` for that data type or the stock… | TC-COMP-041 | — | — | Covered |
| DAC-E2-3 | Derived (E2) | `read_problems` MUST page by symbol with the `limit + 1` lookahead, returning `next_cursor` as the last kept… | TC-COMP-040, TC-COMP-051 | TC-INT-016 | — | Covered |
| DAC-E2-4 | Derived (E2) | The Daily prices check MUST be `exceptions` when `absent_count`, `behind_count` or a known `gap_stock_count`… | TC-COMP-035 | — | — | Covered |
| DAC-E2-5 | Derived (E2) | `absent_count` MUST count active stocks whose prices (or fundamentals) presence is `absent` or `unknown`… | TC-COMP-047 | — | — | Covered |
| DAC-E2-6 | Derived (E2) | `latest_download.progress.done` MUST count instruments with a `run_instrument_result` row for all four data… | TC-COMP-036 | — | — | Covered |
| DAC-E2-7 | Derived (E2) | `latest_download` MUST be the `acquisition_run` with the greatest `requested_at` and… | TC-COMP-044 | — | — | Covered |
| DAC-E2-8 | Derived (E2) | The attention `items` MUST be `data_problems` when `problems.stock_count` is above 0 (recency… | TC-COMP-044 | — | — | Covered |
| DAC-E2-9 | Derived (E2) | The three routes MUST answer `200` with the §4.2 shapes whenever the database answers, including on an empty… | TC-COMP-052 | TC-INT-017 | — | Covered |
| DAC-E2-10 | Derived (E2) | The router MUST be included by `create_app` with the delivered routers and before `_add_static_mount`, so a… | — | TC-INT-028 | — | Covered |
| DAC-E2-11 | Derived (E2) | Nullable counts and dates (`gap_stock_count`, `prices_as_of`, `latest_session`, `as_of`, `total`) MUST… | TC-COMP-050 | — | — | Covered |
| DAC-E2-12 | Derived (E2) | Field names MUST stay in the domain vocabulary (`instrument`, `acquisition_run`, outcome); no response field… | TC-COMP-037 | — | — | Covered |
| DAC-E2-13 | Derived (E2) | The delivered `tests/unit/test_api_no_secrets.py` MUST gain one parametrised test proving a populated `200`… | TC-COMP-055 | — | — | Covered |
| DAC-E2-14 | Derived (E2) | The volume test MUST seed 3000 active instruments with failures on 300, assert the counts, the keyset pages… | — | TC-INT-047 | — | Covered |
| DAC-E2-15 | Derived (E2) | `read_data_health` MUST call `coverage-service`'s public `read_coverage(conn, lifecycle="active", cursor,… | TC-COMP-038 | — | — | Covered |
| DAC-E2-S1-1 | Derived (E2-S1) | Given `queries.py` and `reader.py`, When `test_data_health_sql_is_read_only.py` runs, Then neither source… | TC-COMP-039 | — | — | Covered |
| DAC-E2-S1-2 | Derived (E2-S1) | Given five problem stocks and `limit` 2, When `read_problems` pages, Then the pages hold 2, 2 and 1 stocks… | TC-COMP-040 | — | — | Covered |
| DAC-E2-S1-3 | Derived (E2-S1) | Given a stock whose failures are all `not_found` and one with a `failed` failure, When read, Then `retryable`… | TC-COMP-041 | — | — | Covered |
| DAC-E2-S1-4 | Derived (E2-S1) | Given the `cursor` and `limit` parameters, When bound, Then they are psycopg query parameters, never… | TC-COMP-042 | — | — | Covered |
| DAC-E2-S2-1 | Derived (E2-S2) | Given an empty store, When `read_attention` runs, Then `followed_count` is 0, `prices_as_of`,… | TC-COMP-043 | — | — | Covered |
| DAC-E2-S2-2 | Derived (E2-S2) | Given a `running` download after a `partial` one, When read, Then `latest_download` is the running one and… | TC-COMP-044 | — | — | Covered |
| DAC-E2-S2-3 | Derived (E2-S2) | Given `credential_present()` false, When read, Then the `credential_missing` item has `recorded_at` equal to… | TC-COMP-045 | — | — | Covered |
| DAC-E2-S2-4 | Derived (E2-S2) | Given 3000 active instruments, When `read_attention` runs, Then it issues the five aggregate statements plus… | TC-COMP-046 | — | — | Covered |
| DAC-E2-S3-1 | Derived (E2-S3) | Given a stock with presence `unknown`, When the checks run, Then it counts in `absent_count` and not in… | TC-COMP-047 | — | — | Covered |
| DAC-E2-S3-2 | Derived (E2-S3) | Given an empty store, When read, Then `never_acquired` is `True`, both checks are `None` and `affected_count`… | TC-COMP-048 | — | — | Covered |
| DAC-E2-S3-3 | Derived (E2-S3) | Given a retired stock with a failure, When read, Then it is in no count and no row; given 3000 active stocks,… | TC-COMP-049 | — | — | Covered |
| DAC-E2-S4-1 | Derived (E2-S4) | Given each model, When serialised, Then every §4.2 field is present, timestamps are ISO-8601 with offset,… | TC-COMP-050 | — | — | Covered |
| DAC-E2-S4-2 | Derived (E2-S4) | Given `limit=0`, `limit=501` and `cursor=not a symbol`, When requested, Then each answers `422… | TC-COMP-051 | — | — | Covered |
| DAC-E2-S4-3 | Derived (E2-S4) | Given each handler, When called, Then it calls its reader function once with one connection from… | TC-COMP-052 | — | — | Covered |
| DAC-E2-S4-4 | Derived (E2-S4) | Given `limit` and `cursor`, When they reach SQL, Then only as bound parameters after validation (SEC-INP-001,… | TC-COMP-053 | — | — | Covered |
| DAC-E2-S5-1 | Derived (E2-S5) | Given `app.py`, When the change lands, Then its diff is the one import and the one `include_router` line, and… | TC-COMP-054 | — | — | Covered |
| DAC-E2-S5-2 | Derived (E2-S5) | Given the new test, When it runs, Then each route answers `200` through `create_app` with the reader stubbed… | TC-COMP-055 | — | — | Covered |
| DAC-E2-S6-1 | Derived (E2-S6) | Given a seeded store with failures on three stocks, When `GET /api/data-health/problems` is paged with… | — | TC-INT-016 | — | Covered |
| DAC-E2-S6-2 | Derived (E2-S6) | Given the `500` case, When asserted, Then the body is the delivered envelope's fixed message with no internal… | — | TC-INT-017 | — | Covered |
| DAC-E2-S7-1 | Derived (E2-S7) | Given the seeded store, When `GET /api/attention` is requested, Then `problems.stock_count` is 300 and… | — | TC-INT-026 | — | Covered |
| DAC-E2-S7-2 | Derived (E2-S7) | Given the timing loop, When it reports, Then the p95 is computed over the 20 timed requests only, the warm-up… | — | TC-INT-047 | — | Covered |
| DAC-E3-1 | Derived (E3) | `/` MUST render one card-shaped skeleton until the first health answer, then `Navigate replace` to `/setup`… | TC-COMP-056 | — | — | Covered |
| DAC-E3-2 | Derived (E3) | `DESTINATIONS` MUST be one static, ordered list in `web/src/app/destinations.ts`; a destination enters it… | TC-COMP-057 | — | — | Covered |
| DAC-E3-3 | Derived (E3) | `/coverage`, `/instruments`, `/runs` and `/runs/:runId` MUST land on `/data/coverage`, `/data/followed`,… | TC-COMP-077 | — | — | Covered |
| DAC-E3-4 | Derived (E3) | An unregistered path MUST render the not-found state inside the frame, titled *Page not found*, with *There's… | TC-COMP-058 | — | — | Covered |
| DAC-E3-5 | Derived (E3) | `usePolledRead` MUST read on mount, schedule the next read from the interval the last answer implies, clear… | TC-COMP-069, TC-COMP-074 | — | — | Covered |
| DAC-E3-6 | Derived (E3) | A summary `404` MUST yield `scores: not_served`, not an error, and the score figures render not determinable;… | TC-COMP-059 | — | — | Covered |
| DAC-E3-7 | Derived (E3) | The Home chip MUST equal `deriveNeedsYou(attention, scores).length` and the Data health chip… | TC-COMP-060 | — | — | Covered |
| DAC-E3-8 | Derived (E3) | The unreachable state MUST be a `card` holding a `section` `role="status"` with *FactorFlow is not… | TC-COMP-061 | — | — | Covered |
| DAC-E3-9 | Derived (E3) | Top-bar titles MUST come from a static route-to-title table (`titles.ts`) with each ancestor crumb a link,… | TC-COMP-078 | — | — | Covered |
| DAC-E3-10 | Derived (E3) | One `keydown` listener on `document` MUST open the palette on `⌘K` or `Ctrl+K` and ignore the event when its… | TC-COMP-088 | — | — | Covered |
| DAC-E3-11 | Derived (E3) | The palette MUST show Stocks (followed stocks whose symbol starts with the typed text, from `GET… | TC-COMP-081, TC-COMP-082 | — | — | Covered |
| DAC-E3-12 | Derived (E3) | The palette MUST render an `aria-disabled` hint row before typing, `CommandEmpty` *No stocks or pages match… | TC-COMP-062 | — | — | Covered |
| DAC-E3-13 | Derived (E3) | `download-toast.ts` MUST raise one toast when `latest_download.state` turns from non-terminal to terminal… | TC-COMP-094, TC-COMP-095 | — | — | Covered |
| DAC-E3-14 | Derived (E3) | `shell.tsx` MUST mount `SetupDraftProvider` inside `ShellProvider` and outside the main region's route map,… | TC-COMP-125 | — | — | Covered |
| DAC-E3-15 | Derived (E3) | The delivered `status-region.tsx` and its four test files MUST be deleted, with `HealthProvider`'s polling,… | TC-COMP-089 | — | — | Covered |
| DAC-E3-16 | Derived (E3) | `web/src/app/layout.ts` MUST hold `railWidth` 208 px, `contentMaxWidth` 1180 px, `sideColumnMin` 260 px,… | TC-COMP-072 | — | — | Covered |
| DAC-E3-17 | Derived (E3) | The top bar MUST leave the place of the environment region and the kill switch empty rather than reserving a… | TC-COMP-063 | — | — | Covered |
| DAC-E3-18 | Derived (E3) | The `Shell context` MUST expose `health`, `attention`, `scores`, `refresh(kind)` and `setTitleDetail`, with… | TC-COMP-068 | — | — | Covered |
| DAC-E3-19 | Derived (E3) | `useDataHealth()` MUST read `GET /api/data-health` once on mount, on `retry()` and once when the context's… | TC-COMP-064 | — | — | Covered |
| DAC-E3-S1-1 | Derived (E3-S1) | Given `client.ts`, When the export is added, Then only the `export` keyword on line 154 changes and the… | TC-COMP-065 | — | — | Covered |
| DAC-E3-S1-2 | Derived (E3-S1) | Given `fetchScoreSummary()`, When the summary route answers `404`, Then it resolves to `{ kind: "not_served"… | TC-COMP-066 | — | — | Covered |
| DAC-E3-S1-3 | Derived (E3-S1) | Given `fetchProblems(cursor, limit)`, When called, Then it requests `GET /api/data-health/problems` with… | TC-COMP-067 | — | — | Covered |
| DAC-E3-S1-4 | Derived (E3-S1) | Given `shell-types.ts`, When compiled, Then `Attention.latest_terminal_download` carries the recorded… | TC-COMP-068 | — | — | Covered |
| DAC-E3-S2-1 | Derived (E3-S2) | Given a read whose last answer implies 10 s, When the page is hidden, Then no read fires until it is visible… | TC-COMP-069 | — | — | Covered |
| DAC-E3-S2-2 | Derived (E3-S2) | Given a failed read after a successful one, When the state is read, Then it is `{ kind: "error", error, last:… | TC-COMP-070 | — | — | Covered |
| DAC-E3-S2-3 | Derived (E3-S2) | Given `HealthProvider`, When a health read succeeds, Then `lastAnsweredAt` is that instant and the delivered… | TC-COMP-071 | — | — | Covered |
| DAC-E3-S2-4 | Derived (E3-S2) | Given `token-literals.test.ts`, When the layout rule runs over `web/src/`, Then `208px`, `1180px`, `260px`,… | TC-COMP-072 | — | — | Covered |
| DAC-E3-S3-1 | Derived (E3-S3) | Given an idle store, When the context polls, Then attention and summary read every 60 s; given… | TC-COMP-073 | — | — | Covered |
| DAC-E3-S3-2 | Derived (E3-S3) | Given `refresh("attention")`, When called by a screen after an action, Then one attention read fires at once,… | TC-COMP-074 | — | — | Covered |
| DAC-E3-S3-3 | Derived (E3-S3) | Given `setTitleDetail("Download 2026-10-15 09:30 CDT")`, When called, Then the context holds that text until… | TC-COMP-075 | — | — | Covered |
| DAC-E3-S3-4 | Derived (E3-S3) | Given `credential_present` in the health answer, When exposed, Then the context passes the boolean only and… | TC-COMP-076 | — | — | Covered |
| DAC-E3-S4-1 | Derived (E3-S4) | Given `/runs/abc?x=1`, When visited, Then the location becomes `/data/downloads/abc?x=1` with `replace`; the… | TC-COMP-077 | — | — | Covered |
| DAC-E3-S4-2 | Derived (E3-S4) | Given `titles.ts`, When every registered route is enumerated, Then each has a title: *Settings*, *Data health… | TC-COMP-078 | — | — | Covered |
| DAC-E3-S4-3 | Derived (E3-S4) | Given `routes.test.tsx`, When it runs, Then it asserts only the routes this story registers: it visits the… | TC-COMP-079 | — | — | Covered |
| DAC-E3-S4-4 | Derived (E3-S4) | Given `NotFound`, When rendered, Then it is a `card` holding a `section` `role="status"` with the `h1` and… | TC-COMP-080 | — | — | Covered |
| DAC-E3-S5-1 | Derived (E3-S5) | Given typed text *K* then *KO* within 250 ms, When the search fires, Then one request with… | TC-COMP-081 | — | — | Covered |
| DAC-E3-S5-2 | Derived (E3-S5) | Given `RESEARCH_REGISTERED` false, When the palette opens, Then no universes request is sent and no Universes… | TC-COMP-082 | — | — | Covered |
| DAC-E3-S5-3 | Derived (E3-S5) | Given `Esc` or an item chosen, When the dialog closes, Then focus returns to the element focused before it… | TC-COMP-083 | — | — | Covered |
| DAC-E3-S5-4 | Derived (E3-S5) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-084 | — | — | Covered |
| DAC-E3-S5-5 | Derived (E3-S5) | Given the palette's groups, rows, hint, empty and error states rendered in every state this story defines,… | TC-COMP-085 | — | — | Covered |
| DAC-E3-S5-6 | Derived (E3-S5) | Given no status is rendered in the palette (its rows are symbols, universe names and page names), so the… | TC-COMP-086 | — | — | Covered |
| DAC-E3-S6-1 | Derived (E3-S6) | Given the rail at this story, When rendered, Then it lists the Research entry (only when registered) and… | TC-COMP-087 | — | — | Covered |
| DAC-E3-S6-2 | Derived (E3-S6) | Given a `keydown` of `⌘K` whose target is an `input`, `textarea`, `select` or `contenteditable`, When… | TC-COMP-088 | — | — | Covered |
| DAC-E3-S6-3 | Derived (E3-S6) | Given `startup-health.spec.ts` and `startup-refusal.spec.ts` at this story, When rewritten, Then they assert… | TC-COMP-089 | — | — | Covered |
| DAC-E3-S6-4 | Derived (E3-S6) | Given the viewport below 768 px, When rendered, Then the rail stacks above the content and every item stays… | TC-COMP-090 | — | — | Covered |
| DAC-E3-S6-5 | Derived (E3-S6) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-091 | — | — | Covered |
| DAC-E3-S6-6 | Derived (E3-S6) | Given the rail, the chips, the top bar, the unreachable state and the toasts' container rendered in every… | TC-COMP-092 | — | — | Covered |
| DAC-E3-S6-7 | Derived (E3-S6) | Given the chip badges (`status-warning`) and the unreachable state's `role="status"` section, When rendered,… | TC-COMP-093 | — | — | Covered |
| DAC-E3-S7-1 | Derived (E3-S7) | Given two consecutive attention answers with `latest_download.state` `running` then `partial`, When the… | TC-COMP-094 | — | — | Covered |
| DAC-E3-S7-2 | Derived (E3-S7) | Given the first attention answer after mount already terminal, When it arrives, Then no toast is raised,… | TC-COMP-095 | — | — | Covered |
| DAC-E3-S7-3 | Derived (E3-S7) | Given the toast's title, label and link rendered in every state this story defines, When its visible text and… | TC-COMP-096 | — | — | Covered |
| DAC-E3-S7-4 | Derived (E3-S7) | Given the toast's outcome label (*Complete*, *Partial*, *Interrupted*, *Failed*) from `labelOf` with its… | TC-COMP-097 | — | — | Covered |
| DAC-E3-S8-1 | Derived (E3-S8) | Given `unreachable-recovery.spec.ts`, When the container is stopped and restarted through… | — | TC-INT-046 | — | Covered |
| DAC-E3-S8-2 | Derived (E3-S8) | Given `shell-navigation.spec.ts`, When it runs at this story, Then it asserts only the Settings and `/data`… | — | TC-INT-001 | — | Covered |
| DAC-E3-S8-3 | Derived (E3-S8) | Given `command-palette.spec.ts` with one followed stock seeded, When *K* is typed, Then the Stocks group… | — | TC-INT-041 | — | Covered |
| DAC-E4-1 | Derived (E4) | Step 1 is done when health has answered, step 2 when `GET /api/settings/history-depth` returns years, step 3… | TC-COMP-098 | — | — | Covered |
| DAC-E4-2 | Derived (E4) | `SetupDraftProvider` MUST hold `yearsText`, `source`, `pasted` and `unposted` in React state only, mounted by… | TC-COMP-105 | — | — | Covered |
| DAC-E4-3 | Derived (E4) | Step 1 MUST render `badge` `status-good` *Found* or `status-critical` *Missing*, and when missing *Set the… | TC-COMP-099 | — | — | Covered |
| DAC-E4-4 | Derived (E4) | Step 2 MUST save through `PUT /api/settings/history-depth`; a `422` MUST render *History depth must be a… | TC-COMP-108 | — | — | Covered |
| DAC-E4-5 | Derived (E4) | `summarisePaste` MUST wrap the delivered `parseBulkSymbols` without changing it, returning `accepted` (first… | TC-COMP-113 | — | — | Covered |
| DAC-E4-6 | Derived (E4) | Accepted symbols MUST be posted in order in batches of at most 1000; a `409` on a batch (every symbol already… | TC-COMP-114 | — | — | Covered |
| DAC-E4-7 | Derived (E4) | At zero accepted with *Paste a list* chosen, **Continue** MUST be `blocked` with *Paste at least one symbol,… | TC-COMP-100 | — | — | Covered |
| DAC-E4-8 | Derived (E4) | *Add later* and **Continue** MUST save nothing and make step 4 current with step 3 still to do; step 4 MUST… | TC-COMP-115, TC-COMP-120 | — | — | Covered |
| DAC-E4-9 | Derived (E4) | **Start download** MUST call `POST /api/acquisition-runs`; on `202` with `queued_behind` null it MUST call… | TC-COMP-101 | — | — | Covered |
| DAC-E4-10 | Derived (E4) | **Start download** MUST NOT be blocked by a missing key: CAP-001 refuses a start only for an unset depth or… | TC-COMP-102 | — | — | Covered |
| DAC-E4-11 | Derived (E4) | Setup MUST show exactly four steps with the paper trading step absent, and step 3 MUST offer exactly two… | TC-COMP-103 | — | — | Covered |
| DAC-E4-12 | Derived (E4) | Step 4's summary card MUST restate the key presence badge, *{y} years* and *{n}* followed stocks, and the… | TC-COMP-104 | — | — | Covered |
| DAC-E4-13 | Derived (E4) | A failed depth or count read MUST show *Couldn't read {history depth / the followed list}: {reason}* with… | TC-COMP-106 | — | — | Covered |
| DAC-E4-S1-1 | Derived (E4-S1) | Given `SetupDraftProvider` above a memory router, When the owner navigates from `/setup` to `/home` and back… | TC-COMP-105 | — | — | Covered |
| DAC-E4-S1-2 | Derived (E4-S1) | Given a depth read that fails, When the state derives, Then step 2 is not done and the state carries the… | TC-COMP-106 | — | — | Covered |
| DAC-E4-S1-3 | Derived (E4-S1) | Given `copy.ts`, When scanned for the DAC-E7-3 terms as whole words, Then none appears, and the plan-limit… | TC-COMP-107 | — | — | Covered |
| DAC-E4-S2-1 | Derived (E4-S2) | Given a successful depth save, When `200` returns, Then step 2 reads done *{y} years of history*, step 3… | TC-COMP-108 | — | — | Covered |
| DAC-E4-S2-2 | Derived (E4-S2) | Given step 1 with health unreachable, When rendered, Then the badge is `coverage-unknown`, never *Missing*,… | TC-COMP-109 | — | — | Covered |
| DAC-E4-S2-3 | Derived (E4-S2) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-110 | — | — | Covered |
| DAC-E4-S2-4 | Derived (E4-S2) | Given the step list, the step card and steps 1 and 2 rendered in every state this story defines, When its… | TC-COMP-111 | — | — | Covered |
| DAC-E4-S2-5 | Derived (E4-S2) | Given the key-presence badge (*Found* good, *Missing* critical) through `StatusBadge` and *Not determinable*… | TC-COMP-112 | — | — | Covered |
| DAC-E4-S3-1 | Derived (E4-S3) | Given `BRK/B`, `BRK B` and `BRK_B`, When summarised, Then each suggests `BRK.B`; given `ZZZZ!`, Then no fix;… | TC-COMP-113 | — | — | Covered |
| DAC-E4-S3-2 | Derived (E4-S3) | Given 2500 accepted symbols, When posted, Then three requests of 1000, 1000 and 500 are sent in order, and… | TC-COMP-114 | — | — | Covered |
| DAC-E4-S3-3 | Derived (E4-S3) | Given *Add later* chosen and **Continue**, When activated, Then nothing is posted, `source` is `later` in the… | TC-COMP-115 | — | — | Covered |
| DAC-E4-S3-4 | Derived (E4-S3) | Given pasted text, When posted, Then it is sent as a JSON array of symbols the delivered route validates per… | TC-COMP-116 | — | — | Covered |
| DAC-E4-S3-5 | Derived (E4-S3) | Given step 3 with its parse summary, warning, blocked and error states rendered in every state this story… | TC-COMP-117 | — | — | Covered |
| DAC-E4-S3-6 | Derived (E4-S3) | Given no status badge renders on step 3 (dispositions are listed as text), so the one-tier rule is recorded… | TC-COMP-118 | — | — | Covered |
| DAC-E4-S4-1 | Derived (E4-S4) | Given a `202` and three attention answers, When rendered, Then *checked {time}* advances on each answer and… | TC-COMP-119 | — | — | Covered |
| DAC-E4-S4-2 | Derived (E4-S4) | Given the blocked step 4, When **Start download** is activated by keyboard, Then no request is sent and the… | TC-COMP-120 | — | — | Covered |
| DAC-E4-S4-3 | Derived (E4-S4) | Given `setup.test.tsx`, When the owner goes back from step 4 to step 2 and forward again, Then the years… | TC-COMP-121 | — | — | Covered |
| DAC-E4-S4-4 | Derived (E4-S4) | Given the eight states, When the screen's regions are enumerated, Then each step's loading, never-populated,… | TC-COMP-122 | — | — | Covered |
| DAC-E4-S4-5 | Derived (E4-S4) | Given step 4, the summary card and the setup screen rendered in every state this story defines, When its… | TC-COMP-123 | — | — | Covered |
| DAC-E4-S4-6 | Derived (E4-S4) | Given the summary card's key badge and the download state through `StatusBadge`, progress through `progress`,… | TC-COMP-124 | — | — | Covered |
| DAC-E4-S5-1 | Derived (E4-S5) | Given the real stack with the Massive stub, When the four steps are completed by keyboard alone, Then `POST… | — | TC-INT-008 | — | Covered |
| DAC-E4-S5-2 | Derived (E4-S5) | Given *Add later*, When **Go to Home** is activated and the owner returns to `/setup`, Then the years text… | — | TC-INT-004 | — | Covered |
| DAC-E4-S6-1 | Derived (E4-S6) | Given the shell with health unreachable, When the main region shows the unreachable state and then recovers,… | TC-COMP-125 | — | — | Covered |
| DAC-E4-S6-2 | Derived (E4-S6) | Given `/setup`, When visited, Then the top bar reads *Setup*, focus lands on the screen's `h1`, and… | TC-COMP-126 | — | — | Covered |
| DAC-E4-S6-3 | Derived (E4-S6) | Given `startup-health.spec.ts`, When an empty install opens `/`, Then it lands on `/setup` and setup's `h1`… | — | TC-INT-002 | — | Covered |
| DAC-E5-1 | Derived (E5) | While `attention.latest_download` is null Home MUST render one `card` with `h2` *No data has been downloaded… | TC-COMP-127 | — | — | Covered |
| DAC-E5-2 | Derived (E5) | While `latest_terminal_download` is null and `latest_download` is not, the tile MUST render the… | TC-COMP-136 | — | — | Covered |
| DAC-E5-3 | Derived (E5) | Once `latest_terminal_download` is set, the tile badge MUST be `dataTileBadge` over the verdict from… | TC-COMP-137, TC-COMP-138 | — | — | Covered |
| DAC-E5-4 | Derived (E5) | The hero line MUST take `current_count` and `followed_count` both from the summary's `stocks_current`… | TC-COMP-128 | — | — | Covered |
| DAC-E5-5 | Derived (E5) | The lag badge `status-warning` *Not reflecting the latest download* MUST render when the summary's… | TC-COMP-129 | — | — | Covered |
| DAC-E5-6 | Derived (E5) | The header MUST render the date as *{Weekday}, {YYYY-MM-DD}* (DEC-0209) and the market state as *Market… | TC-COMP-132, TC-COMP-133 | — | — | Covered |
| DAC-E5-7 | Derived (E5) | Each item MUST render the catalogue's tag, tier, title, body and single action for its kind: `data_problems`… | TC-COMP-141 | — | — | Covered |
| DAC-E5-8 | Derived (E5) | Every item action MUST be a link styled `button` `outline` whose accessible name names the item (*Fix data… | TC-COMP-141 | — | — | Covered |
| DAC-E5-9 | Derived (E5) | With no item, the card MUST read *Nothing needs you right now.* with *checked {time}*; a changed count MUST… | TC-COMP-142 | — | — | Covered |
| DAC-E5-10 | Derived (E5) | No element with strategy, paper or live text or role MUST render; the summary row's second and third columns… | TC-COMP-130 | — | — | Covered |
| DAC-E5-11 | Derived (E5) | When the attention read fails, the header MUST stay and each card's body MUST be replaced by *Couldn't read… | TC-COMP-131 | — | — | Covered |
| DAC-E5-S1-1 | Derived (E5-S1) | Given a Saturday, a Sunday, a weekday 08:29 and a weekday 15:00 in America/Chicago, When `marketState` runs,… | TC-COMP-132 | — | — | Covered |
| DAC-E5-S1-2 | Derived (E5-S1) | Given `header.tsx` on 2026-10-15, When rendered, Then the `h1` reads *Thursday, 2026-10-15*, and… | TC-COMP-133 | — | — | Covered |
| DAC-E5-S1-3 | Derived (E5-S1) | Given the header, its as-of line and the copy catalogue rendered in every state this story defines, When its… | TC-COMP-134 | — | — | Covered |
| DAC-E5-S1-4 | Derived (E5-S1) | Given the market-state badge (`coverage-unknown` through `NotDeterminable`), When rendered, Then each goes… | TC-COMP-135 | — | — | Covered |
| DAC-E5-S2-1 | Derived (E5-S2) | Given `latest_download` `requested` and `latest_terminal_download` null with the summary at `404`, When… | TC-COMP-136 | — | — | Covered |
| DAC-E5-S2-2 | Derived (E5-S2) | Given the same problem set and latest download as a `data-health-ui` verdict fixture, When rendered, Then the… | TC-COMP-137 | — | — | Covered |
| DAC-E5-S2-3 | Derived (E5-S2) | Given the tile, When rendered, Then it is one link named by its title, tier and figures (or, in the… | TC-COMP-138 | — | — | Covered |
| DAC-E5-S2-4 | Derived (E5-S2) | Given the data tile in every state rendered in every state this story defines, When its visible text and… | TC-COMP-139 | — | — | Covered |
| DAC-E5-S2-5 | Derived (E5-S2) | Given the verdict badge, the score-state badge, the *Downloading* badge and the lag badge through… | TC-COMP-140 | — | — | Covered |
| DAC-E5-S3-1 | Derived (E5-S3) | Given items of kinds `data_problems` (three symbols), `download_not_complete` (failed) and… | TC-COMP-141 | — | — | Covered |
| DAC-E5-S3-2 | Derived (E5-S3) | Given a next read lacking an item's cause, When rendered, Then the item leaves and the new count is announced… | TC-COMP-142 | — | — | Covered |
| DAC-E5-S3-3 | Derived (E5-S3) | Given the eight states, When Home's regions are enumerated, Then each renders through `StateRegion` or… | TC-COMP-143 | — | — | Covered |
| DAC-E5-S3-4 | Derived (E5-S3) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-144 | — | — | Covered |
| DAC-E5-S3-5 | Derived (E5-S3) | Given the Needs you card, its rows and the Home screen in every state rendered in every state this story… | TC-COMP-145 | — | — | Covered |
| DAC-E5-S3-6 | Derived (E5-S3) | Given each item's tag badge through `StatusBadge` with DEC-0203's tier and the severity tile `aria-hidden`,… | TC-COMP-146 | — | — | Covered |
| DAC-E5-S4-1 | Derived (E5-S4) | Given the Massive stub failing three symbols, When the download ends `partial`, Then Home's data item names… | — | TC-INT-025 | — | Covered |
| DAC-E5-S4-2 | Derived (E5-S4) | Given a later clean download for those symbols, When the next attention read arrives, Then the data item and… | — | TC-INT-013 | — | Covered |
| DAC-E5-S5-1 | Derived (E5-S5) | Given `DESTINATIONS` after this story, When the rail renders, Then Home precedes the Research entry (when… | TC-COMP-147 | — | — | Covered |
| DAC-E5-S5-2 | Derived (E5-S5) | Given `startup-health.spec.ts`, When a download has been requested, Then `/` lands on `/home` with Home's… | — | TC-INT-003 | — | Covered |
| DAC-E6-1 | Derived (E6) | The verdict badge MUST be `worstDataTier` over the aggregate's `affected_count` and `followed_count` and… | TC-COMP-156 | — | — | Covered |
| DAC-E6-2 | Derived (E6) | While attention loads the verdict MUST render a skeleton, and while attention fails the verdict region MUST… | TC-COMP-148 | — | — | Covered |
| DAC-E6-3 | Derived (E6) | The Daily prices card MUST render `ok` as *No missing prices or gaps* (good), `exceptions` as *Needs… | TC-COMP-157, TC-COMP-158 | — | — | Covered |
| DAC-E6-4 | Derived (E6) | The Company financials card MUST render `ok` as *All financials present* and `exceptions` as *Needs… | TC-COMP-149 | — | — | Covered |
| DAC-E6-5 | Derived (E6) | The Factor scores card MUST read the shell's summary: `coverage-unknown` *Not determinable* with *FactorFlow… | TC-COMP-150 | — | — | Covered |
| DAC-E6-6 | Derived (E6) | While attention's `latest_terminal_download` is null the screen MUST render, in place of the verdict, the… | TC-COMP-175 | — | — | Covered |
| DAC-E6-7 | Derived (E6) | When `never_acquired` is true but a download has ended, the verdict, *Needs fixing* and Recent downloads MUST… | TC-COMP-151 | — | — | Covered |
| DAC-E6-8 | Derived (E6) | Each *Needs fixing* row MUST render the symbol (weight 600, a link to `/data/coverage?symbol={SYMBOL}`), per… | TC-COMP-165 | — | — | Covered |
| DAC-E6-9 | Derived (E6) | The *Needs fixing* header MUST read *Needs fixing · {n}* from `affected_count` with the sub-line *From your… | TC-COMP-166 | — | — | Covered |
| DAC-E6-10 | Derived (E6) | When `affected_count` is 0 the card MUST read *Nothing needs fixing.* and *Last complete download {start… | TC-COMP-152 | — | — | Covered |
| DAC-E6-11 | Derived (E6) | **Download now** (header, *Needs fixing* and the empty state's **Start the first download**) MUST be one… | TC-COMP-161 | — | — | Covered |
| DAC-E6-12 | Derived (E6) | **Stop following {SYMBOL}** MUST open `dialog` `confirm` titled *Stop following {SYMBOL}* with *Stop… | TC-COMP-162 | — | — | Covered |
| DAC-E6-13 | Derived (E6) | **Follow a different symbol than {SYMBOL}** MUST navigate to `/data/followed` with router state `{ focusAdd:… | TC-COMP-153 | — | — | Covered |
| DAC-E6-14 | Derived (E6) | Recent downloads MUST be a `data-table` `compact` with `history` semantics over `listAcquisitionRuns({ limit:… | TC-COMP-170, TC-COMP-171 | — | — | Covered |
| DAC-E6-15 | Derived (E6) | The aggregate MUST be read on load, on **Try again**, once when the attention read shows the latest download… | TC-COMP-176 | — | — | Covered |
| DAC-E6-16 | Derived (E6) | *What you follow* MUST render *Followed stocks {active_count}*, *Stopped following {retired_count} (history… | TC-COMP-154 | — | — | Covered |
| DAC-E6-17 | Derived (E6) | A failed read MUST keep each card's header and replace its body with *Couldn't read {the data health checks /… | TC-COMP-155 | — | — | Covered |
| DAC-E6-S1-1 | Derived (E6-S1) | Given `affected_count` 1 of 10 with a `partial` latest download, When rendered, Then the sentence is *Mostly… | TC-COMP-156 | — | — | Covered |
| DAC-E6-S1-2 | Derived (E6-S1) | Given `gap_stock_count` null with `gap_detection.reason`, When the Daily prices card renders, Then the gap… | TC-COMP-157 | — | — | Covered |
| DAC-E6-S1-3 | Derived (E6-S1) | Given `exception_count` 7 with five symbols shown, When rendered, Then *and 2 more* follows; given 5, Then no… | TC-COMP-158 | — | — | Covered |
| DAC-E6-S1-4 | Derived (E6-S1) | Given the verdict and the three check cards in every state rendered in every state this story defines, When… | TC-COMP-159 | — | — | Covered |
| DAC-E6-S1-5 | Derived (E6-S1) | Given the verdict badge, each check's tier badge (`ok` good, `exceptions` warning) and the score-state badge… | TC-COMP-160 | — | — | Covered |
| DAC-E6-S2-1 | Derived (E6-S2) | Given each `409` code, When rendered, Then the two reasons are never interchanged and each link targets its… | TC-COMP-161 | — | — | Covered |
| DAC-E6-S2-2 | Derived (E6-S2) | Given a `409` on stop following, When rendered, Then the dialog stays open with the reason, `Esc` closes it,… | TC-COMP-162 | — | — | Covered |
| DAC-E6-S2-3 | Derived (E6-S2) | Given the Download now control, its helper lines and refusals, and the stop-following dialog rendered in… | TC-COMP-163 | — | — | Covered |
| DAC-E6-S2-4 | Derived (E6-S2) | Given no status badge renders in these controls, so the one-tier rule is recorded as not applicable here,… | TC-COMP-164 | — | — | Covered |
| DAC-E6-S3-1 | Derived (E6-S3) | Given a row with a `failed` prices failure and a `not_found` reference failure, When rendered, Then both… | TC-COMP-165 | — | — | Covered |
| DAC-E6-S3-2 | Derived (E6-S3) | Given 120 problem stocks, When the first page renders and **Show more** is activated twice, Then… | TC-COMP-166 | — | — | Covered |
| DAC-E6-S3-3 | Derived (E6-S3) | Given `reason` text from the provider, When rendered, Then it is text, never markup (AGT-PROHIB-003), and no… | TC-COMP-167 | — | — | Covered |
| DAC-E6-S3-4 | Derived (E6-S3) | Given the Needs fixing card, its rows, Show more, the empty card and the error states rendered in every state… | TC-COMP-168 | — | — | Covered |
| DAC-E6-S3-5 | Derived (E6-S3) | Given each failure's outcome badge (*Failed* critical, *Not found* warning) through `StatusBadge`, When… | TC-COMP-169 | — | — | Covered |
| DAC-E6-S4-1 | Derived (E6-S4) | Given a `partial` and an `abandoned` run, When rendered, Then *Partial* is warning with *{written} of {named}… | TC-COMP-170 | — | — | Covered |
| DAC-E6-S4-2 | Derived (E6-S4) | Given three attention answers with `latest_download` `running`, When they arrive, Then `listAcquisitionRuns`… | TC-COMP-171 | — | — | Covered |
| DAC-E6-S4-3 | Derived (E6-S4) | Given health unreachable, When *What you follow* renders, Then the key badge is `coverage-unknown`, never… | TC-COMP-172 | — | — | Covered |
| DAC-E6-S4-4 | Derived (E6-S4) | Given Recent downloads and What you follow in every state rendered in every state this story defines, When… | TC-COMP-173 | — | — | Covered |
| DAC-E6-S4-5 | Derived (E6-S4) | Given the *Outcome* column and the key-presence badge through `StatusBadge`, the running `progressbar`, em… | TC-COMP-174 | — | — | Covered |
| DAC-E6-S5-1 | Derived (E6-S5) | Given `latest_terminal_download` null with `active_count` 0, When rendered, Then the empty card offers **Open… | TC-COMP-175 | — | — | Covered |
| DAC-E6-S5-2 | Derived (E6-S5) | Given fake timers advanced ten minutes with no action and no terminal transition, When observed, Then… | TC-COMP-176 | — | — | Covered |
| DAC-E6-S5-3 | Derived (E6-S5) | Given the eight states, When the screen's regions are enumerated, Then each renders through `StateRegion` or… | TC-COMP-177 | — | — | Covered |
| DAC-E6-S5-4 | Derived (E6-S5) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-178 | — | — | Covered |
| DAC-E6-S5-5 | Derived (E6-S5) | Given the Data health screen in every state, including its empty card and null check cards rendered in every… | TC-COMP-179 | — | — | Covered |
| DAC-E6-S5-6 | Derived (E6-S5) | Given every status on the screen through its region's `StatusBadge`, null check tiers through `Absent`, When… | TC-COMP-180 | — | — | Covered |
| DAC-E6-S6-1 | Derived (E6-S6) | Given the Massive stub failing three symbols, When the download ends `partial`, Then the verdict reads… | — | TC-INT-014 | — | Covered |
| DAC-E6-S6-2 | Derived (E6-S6) | Given the stub not recognising one symbol, When its row's **Stop following** is confirmed by keyboard, Then… | — | TC-INT-019 | — | Covered |
| DAC-E6-S7-1 | Derived (E6-S7) | Given `/data/downloads` after this story, When the top bar renders, Then the *Data health* crumb links to… | TC-COMP-181 | — | — | Covered |
| DAC-E6-S7-2 | Derived (E6-S7) | Given `shell-navigation.spec.ts`, When Data health is chosen from the rail and from the palette's Pages group… | TC-COMP-182 | — | — | Covered |
| DAC-E7-1 | Derived (E7) | The five screens MUST open at their new paths inside the shell; every internal link and `navigate()` MUST… | TC-COMP-183 | — | — | Covered |
| DAC-E7-2 | Derived (E7) | The `SHELL_ROUTES` map in `web/src/screens/research/copy.ts` MUST change exactly three targets,… | TC-COMP-223 | — | — | Covered |
| DAC-E7-3 | Derived (E7) | A vocabulary sweep test MUST render each of the five screens in its populated, empty, error and dialog states… | TC-COMP-218, TC-COMP-219 | — | — | Covered |
| DAC-E7-4 | Derived (E7) | The label deltas MUST be exactly UX design 1.5 to 1.9's: Coverage *stock*, **Download now**, *Last… | TC-COMP-184 | — | — | Covered |
| DAC-E7-5 | Derived (E7) | The delivered `web/src/screens/runs/outcome-badge.tsx` and `detail/result-outcome-badge.tsx` MUST be replaced… | TC-COMP-204, TC-COMP-206, TC-COMP-213 | — | — | Covered |
| DAC-E7-6 | Derived (E7) | Coverage MUST seed its symbol filter from `?symbol=` on load and update or clear the query with `replace` as… | TC-COMP-192, TC-COMP-198 | — | — | Covered |
| DAC-E7-7 | Derived (E7) | Settings MUST add, under the `h1`, *Walk through setup again to check the market data key, history depth and… | TC-COMP-185 | — | — | Covered |
| DAC-E7-8 | Derived (E7) | The download detail MUST title itself *Download {start time}*, set the top-bar crumb through… | TC-COMP-211, TC-COMP-212 | — | — | Covered |
| DAC-E7-9 | Derived (E7) | Stopping following and cancelling MUST use `dialog` `confirm`, never `destructive`, with the blueprint §9… | TC-COMP-199 | — | — | Covered |
| DAC-E7-10 | Derived (E7) | No raw `run_id` MUST appear on any surface: the Downloads list's first column is *Started*, the start time… | TC-COMP-186 | — | — | Covered |
| DAC-E7-11 | Derived (E7) | The Coverage and Followed-stocks tables MUST be `data-table` `virtualised` with the per-row expansion v5… | TC-COMP-193 | — | — | Covered |
| DAC-E7-12 | Derived (E7) | The delivered screen tests, the eleven e2e specs and `tests/e2e/support/acquisition.ts` MUST follow the new… | TC-COMP-065, TC-COMP-220 | — | — | Covered |
| DAC-E7-13 | Derived (E7) | The screen directories MUST keep their delivered names (`instruments`, `runs`), because code and paths may… | TC-COMP-220 | — | — | Covered |
| DAC-E7-S1-1 | Derived (E7-S1) | Given health unreachable, When Settings renders, Then the key region reads `coverage-unknown` *Not… | TC-COMP-187 | — | — | Covered |
| DAC-E7-S1-2 | Derived (E7-S1) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-188 | — | — | Covered |
| DAC-E7-S1-3 | Derived (E7-S1) | Given Settings in its populated, empty, error and dialog states, When its visible text and accessible names… | TC-COMP-189 | — | — | Covered |
| DAC-E7-S1-4 | Derived (E7-S1) | Given the key-presence badge (*Found* good, *Missing* critical), When rendered, Then each goes through… | TC-COMP-190 | — | — | Covered |
| DAC-E7-S1-5 | Derived (E7-S1) | Given every request, query parameter, confirmation step, refusal and cadence CAP-001 accepted on this screen,… | TC-COMP-191 | — | — | Covered |
| DAC-E7-S2-1 | Derived (E7-S2) | Given `?symbol=KO`, When Coverage loads, Then the filter reads *KO* and the first server request carries… | TC-COMP-192 | — | — | Covered |
| DAC-E7-S2-2 | Derived (E7-S2) | Given 3000 stocks, When the table renders, Then the DOM holds only the window the `virtualised` variant… | TC-COMP-193 | — | — | Covered |
| DAC-E7-S2-3 | Derived (E7-S2) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-194 | — | — | Covered |
| DAC-E7-S2-4 | Derived (E7-S2) | Given Coverage in its populated, empty, error and dialog states, When its visible text and accessible names… | TC-COMP-195 | — | — | Covered |
| DAC-E7-S2-5 | Derived (E7-S2) | Given the presence badges (`coverage-present`, `coverage-absent`, `coverage-unknown`) and the *Stopped… | TC-COMP-196 | — | — | Covered |
| DAC-E7-S2-6 | Derived (E7-S2) | Given every request, query parameter, confirmation step, refusal and cadence CAP-001 accepted on this screen,… | TC-COMP-197 | — | — | Covered |
| DAC-E7-S3-1 | Derived (E7-S3) | Given `focusAdd` true in router state, When the screen mounts, Then `document.activeElement` is the add… | TC-COMP-198 | — | — | Covered |
| DAC-E7-S3-2 | Derived (E7-S3) | Given a running download when **Stop following** is confirmed, When the dialog renders, Then it carries *A… | TC-COMP-199 | — | — | Covered |
| DAC-E7-S3-3 | Derived (E7-S3) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-200 | — | — | Covered |
| DAC-E7-S3-4 | Derived (E7-S3) | Given Followed stocks in its populated, empty, error and dialog states, When its visible text and accessible… | TC-COMP-201 | — | — | Covered |
| DAC-E7-S3-5 | Derived (E7-S3) | Given the *Not found* stock state (`status-warning`) and *Stopped following*, When rendered, Then each goes… | TC-COMP-202 | — | — | Covered |
| DAC-E7-S3-6 | Derived (E7-S3) | Given every request, query parameter, confirmation step, refusal and cadence CAP-001 accepted on this screen,… | TC-COMP-203 | — | — | Covered |
| DAC-E7-S4-1 | Derived (E7-S4) | Given a `partial` run, When the list renders, Then its badge is `status-warning` *Partial* with the triangle… | TC-COMP-204 | — | — | Covered |
| DAC-E7-S4-2 | Derived (E7-S4) | Given a non-terminal download, When three polls pass, Then the list's last-updated time advances at the… | TC-COMP-205 | — | — | Covered |
| DAC-E7-S4-3 | Derived (E7-S4) | Given `web/src/screens/runs/`, When `grep` runs for `outcome-badge` after this story, Then no import remains… | TC-COMP-206 | — | — | Covered |
| DAC-E7-S4-4 | Derived (E7-S4) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-207 | — | — | Covered |
| DAC-E7-S4-5 | Derived (E7-S4) | Given Downloads in its populated, empty, error and dialog states, When its visible text and accessible names… | TC-COMP-208 | — | — | Covered |
| DAC-E7-S4-6 | Derived (E7-S4) | Given the eight download states, When rendered, Then each goes through `StatusBadge` with its label and… | TC-COMP-209 | — | — | Covered |
| DAC-E7-S4-7 | Derived (E7-S4) | Given every request, query parameter, confirmation step, refusal and cadence CAP-001 accepted on this screen,… | TC-COMP-210 | — | — | Covered |
| DAC-E7-S5-1 | Derived (E7-S5) | Given the run read, When the screen mounts, Then `setTitleDetail` is called once with *Download {start time}*… | TC-COMP-211 | — | — | Covered |
| DAC-E7-S5-2 | Derived (E7-S5) | Given `instruments_named` 0, When progress renders, Then it is `indeterminate`; given 120 named and 40 done,… | TC-COMP-212 | — | — | Covered |
| DAC-E7-S5-3 | Derived (E7-S5) | Given `web/src/screens/runs/detail/`, When `grep` runs for `result-outcome-badge` after this story, Then no… | TC-COMP-213 | — | — | Covered |
| DAC-E7-S5-4 | Derived (E7-S5) | Given the AC-26 literal-scan test `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), When this… | TC-COMP-214 | — | — | Covered |
| DAC-E7-S5-5 | Derived (E7-S5) | Given the download detail in its populated, empty, error and dialog states, When its visible text and… | TC-COMP-215 | — | — | Covered |
| DAC-E7-S5-6 | Derived (E7-S5) | Given the download's state, each stock's result outcome (*Failed* critical, *Not found* warning) and… | TC-COMP-216 | — | — | Covered |
| DAC-E7-S5-7 | Derived (E7-S5) | Given every request, query parameter, confirmation step, refusal and cadence CAP-001 accepted on this screen,… | TC-COMP-217 | — | — | Covered |
| DAC-E7-S6-1 | Derived (E7-S6) | Given the sweep, When a screen's `copy.ts` is changed to include *Retired*, Then the test fails naming the… | TC-COMP-218 | — | — | Covered |
| DAC-E7-S6-2 | Derived (E7-S6) | Given the sweep's matcher, When it runs, Then it reads both `textContent` and every element's computed… | TC-COMP-219 | — | — | Covered |
| DAC-E7-S6-3 | Derived (E7-S6) | Given `web/src/api/client.ts`, When the test imports `{ requestJson }` from it, Then the import type-checks… | TC-COMP-220 | — | — | Covered |
| DAC-E7-S7-1 | Derived (E7-S7) | Given the eleven specs, When `grep` runs for `goto("/coverage")`, `goto("/instruments")`, `goto("/runs")` and… | TC-COMP-221 | — | — | Covered |
| DAC-E7-S7-2 | Derived (E7-S7) | Given each spec, When it runs, Then the assertions on outcomes (dispositions, refusals, cancellation states,… | TC-COMP-222 | — | — | Covered |
| DAC-E7-S8-1 | Derived (E7-S8) | Given the diff of this story, When reviewed, Then the only non-test file changed is… | TC-COMP-223 | — | — | Covered |
| DAC-E7-S8-2 | Derived (E7-S8) | Given a Research screen rendering each of the three links, When followed, Then the download link lands on the… | TC-COMP-224 | — | — | Covered |
| DAC-E7-S8-3 | Derived (E7-S8) | Given the description's departure note, When the story is planned, Then the task plan cites DEC-0224 as the… | TC-COMP-225 | — | — | Covered |

## Coverage Summary

- **Total ACs:** 331 (capability: 28, derived: 303 — 103 epic-level, 200 story-level)
- **Covered:** 331
- **Gaps:** 0
- **Component test cases:** 225
- **Integration test cases:** 47
- **E2E test cases:** 10

### Extraction Audit

DACs extracted from each file's `### Derived` section (N extracted out of M present; every file N = M, no DAC omitted, no duplicate ID):

| File | DACs |
|------|------|
| `CAP-003-E1.md` | 15 of 15 |
| `CAP-003-E1-S1.md` | 5 of 5 |
| `CAP-003-E1-S2.md` | 3 of 3 |
| `CAP-003-E1-S3.md` | 5 of 5 |
| `CAP-003-E1-S4.md` | 3 of 3 |
| `CAP-003-E1-S5.md` | 3 of 3 |
| `CAP-003-E1-S6.md` | 3 of 3 |
| `CAP-003-E1-S7.md` | 2 of 2 |
| `CAP-003-E1-S8.md` | 3 of 3 |
| `CAP-003-E1-S9.md` | 2 of 2 |
| `CAP-003-E1-S10.md` | 2 of 2 |
| `CAP-003-E2.md` | 15 of 15 |
| `CAP-003-E2-S1.md` | 4 of 4 |
| `CAP-003-E2-S2.md` | 4 of 4 |
| `CAP-003-E2-S3.md` | 3 of 3 |
| `CAP-003-E2-S4.md` | 4 of 4 |
| `CAP-003-E2-S5.md` | 2 of 2 |
| `CAP-003-E2-S6.md` | 2 of 2 |
| `CAP-003-E2-S7.md` | 2 of 2 |
| `CAP-003-E3.md` | 19 of 19 |
| `CAP-003-E3-S1.md` | 4 of 4 |
| `CAP-003-E3-S2.md` | 4 of 4 |
| `CAP-003-E3-S3.md` | 4 of 4 |
| `CAP-003-E3-S4.md` | 4 of 4 |
| `CAP-003-E3-S5.md` | 6 of 6 |
| `CAP-003-E3-S6.md` | 7 of 7 |
| `CAP-003-E3-S7.md` | 4 of 4 |
| `CAP-003-E3-S8.md` | 3 of 3 |
| `CAP-003-E4.md` | 13 of 13 |
| `CAP-003-E4-S1.md` | 3 of 3 |
| `CAP-003-E4-S2.md` | 5 of 5 |
| `CAP-003-E4-S3.md` | 6 of 6 |
| `CAP-003-E4-S4.md` | 6 of 6 |
| `CAP-003-E4-S5.md` | 2 of 2 |
| `CAP-003-E4-S6.md` | 3 of 3 |
| `CAP-003-E5.md` | 11 of 11 |
| `CAP-003-E5-S1.md` | 4 of 4 |
| `CAP-003-E5-S2.md` | 5 of 5 |
| `CAP-003-E5-S3.md` | 6 of 6 |
| `CAP-003-E5-S4.md` | 2 of 2 |
| `CAP-003-E5-S5.md` | 2 of 2 |
| `CAP-003-E6.md` | 17 of 17 |
| `CAP-003-E6-S1.md` | 5 of 5 |
| `CAP-003-E6-S2.md` | 4 of 4 |
| `CAP-003-E6-S3.md` | 5 of 5 |
| `CAP-003-E6-S4.md` | 5 of 5 |
| `CAP-003-E6-S5.md` | 6 of 6 |
| `CAP-003-E6-S6.md` | 2 of 2 |
| `CAP-003-E6-S7.md` | 2 of 2 |
| `CAP-003-E7.md` | 13 of 13 |
| `CAP-003-E7-S1.md` | 5 of 5 |
| `CAP-003-E7-S2.md` | 6 of 6 |
| `CAP-003-E7-S3.md` | 6 of 6 |
| `CAP-003-E7-S4.md` | 7 of 7 |
| `CAP-003-E7-S5.md` | 7 of 7 |
| `CAP-003-E7-S6.md` | 3 of 3 |
| `CAP-003-E7-S7.md` | 2 of 2 |
| `CAP-003-E7-S8.md` | 3 of 3 |
| **Total** | **303** |

### Scenario Inventory

The inventory the test cases were generated from (unattended run; the owner's confirmation step did not fire — DEC-0239; granularity rule — DEC-0240, PROVISIONAL):

- **Component scenarios: 225** — one per story-level DAC verifiable in a unit test harness (185), plus one per epic-level DAC that no story-level DAC refines (40: DAC-E1-5, DAC-E1-7, DAC-E1-11, DAC-E2-4, DAC-E2-6, DAC-E2-12, DAC-E2-15, DAC-E3-1, DAC-E3-2, DAC-E3-4, DAC-E3-6, DAC-E3-7, DAC-E3-8, DAC-E3-12, DAC-E3-17, DAC-E3-19, DAC-E4-1, DAC-E4-3, DAC-E4-7, DAC-E4-9, DAC-E4-10, DAC-E4-11, DAC-E4-12, DAC-E5-1, DAC-E5-4, DAC-E5-5, DAC-E5-10, DAC-E5-11, DAC-E6-2, DAC-E6-4, DAC-E6-5, DAC-E6-7, DAC-E6-10, DAC-E6-13, DAC-E6-16, DAC-E6-17, DAC-E7-1, DAC-E7-4, DAC-E7-7, DAC-E7-10).
- **Integration scenarios: 47** — the 16 story-level DACs whose steps require a real HTTP contract between two components (DAC-E3-S8-2, DAC-E4-S6-3, DAC-E5-S5-2, DAC-E4-S5-2, DAC-E4-S5-1, DAC-E5-S4-2, DAC-E6-S6-1, DAC-E2-S6-1, DAC-E2-S6-2, DAC-E6-S6-2, DAC-E5-S4-1, DAC-E2-S7-1, DAC-E2-10, DAC-E3-S8-3, DAC-E3-S8-1, DAC-E2-S7-2), plus one scenario per external-protocol contract (request/response pair) of system design §4.2 not already covered by those, and one per error propagation path the system design names across such a boundary (31 scenarios).
- **E2E scenarios: 10** — one happy path and one error path per user flow of capability §3 (five flows).
- **TOTAL: 225 component + 47 integration + 10 e2e = 282 test cases.**

### Coverage Notes

1. **Granularity (PROVISIONAL, DEC-0240).** Every story-level DAC is already one Given/When/Then scenario, so each receives exactly one test case; the alternates a DAC states ("given X … then Y") are carried in that case's *Error / Edge Cases*. Epic-level DACs that at least one story-level DAC refines are covered transitively: the story's test lists the epic DAC in *Traces to*. The 41 epic-level DACs no story refines receive one test each. Capability ACs are covered by the tests tracing to their DACs, by the integration contract tests and by the E2E journeys. This follows the convention CAP-002's approved coverage matrix used; splitting every clause of every DAC would roughly triple the count without adding a requirement. The owner may revert DEC-0240 to require one case per clause.
2. **Tier placement of the journey-spec DACs.** Fifteen story-level DACs describe Playwright specs or HTTP tests against the real stack (`tests/e2e/*.spec.ts`, `tests/integration/test_api_data_health*.py`, the volume test). Their steps cannot be performed in a unit harness, so they are enumerated as integration scenarios at the HTTP contract they exercise (constraint 7), not as E2E tests: the E2E tier is reserved for the capability's five user flows (one happy and one error path each, check 5).
3. **The reader–store contract is component scope.** `data-health-reader`'s API table lists only `Python call` entries and no CAP-003 component design lists `market-data-store`'s SQL as a Method/Operation, so the reader's PostgreSQL-backed tests (testcontainers) are component tests of `data-health-reader`, matching its own section 7. Likewise `read_coverage` (in-process), the shell context, screen registration and the design-system imports.
4. **AC-17's delivered contracts.** CAP-001's own suites already verify each delivered endpoint; this capability requires only that their outcomes are preserved at the new paths. TC-INT-040 (the eleven relabelled journeys) is the one integration scenario for that, beside the per-contract scenarios the new screens add as consumers (TC-INT-005 to TC-INT-007, TC-INT-021 to TC-INT-024, TC-INT-029 to TC-INT-039).
5. **AC-6 and AC-10 have no story-level DAC.** AC-6 is covered by DAC-E4-7's test (TC-COMP-100) and TC-E2E-001; AC-10 by DAC-E5-10 and DAC-E3-17 (TC-COMP-130, TC-COMP-063) and TC-E2E-005. Not gaps: both are epic-level DACs with their own tests.
6. **DAC-E7-S8-3 is a process criterion**, not a product behaviour: it requires the story's task plan to cite DEC-0224. TC-COMP-225 records it as a documentary check (the plan and the commit trailer), the only way it can be verified.
7. **Three "not applicable" DACs are asserted as absences.** DAC-E3-S5-6, DAC-E4-S3-6 and DAC-E6-S2-4 state that no status badge renders in their region and that the one-tier rule is recorded as not applicable; their tests (TC-COMP-086, TC-COMP-118, TC-COMP-164) verify that no badge renders and that the record exists. The story wording ("When rendered, Then each goes through `StatusBadge`…") is the shared template clause and is vacuous there; it is not treated as contradicting the first clause.
8. **Wording observations.** (a) DAC-E7-2 (epic) sends `/runs` to `/data` while system design §4.1 and capability OQ-6 send it to `/data/downloads`; the epic records this as a departure under DEC-0224 and E7-S8's tests follow the epic. (b) The capability's AC-18 bookmark example and the system design name `/runs/:runId`; DAC-E7-2 writes `/data/downloads/:id` — the same route. (c) The specs use *stock* and *download* in owner-facing text and `instrument` and `acquisition_run` in the API; E2E steps use the display words, integration and component tests the API names (DAC-E2-12). (d) The Factor scores card and Home's score figures depend on CAP-002's summary route; TC-INT-010 to TC-INT-012 assume it is deployed and verify the `404` rendering when it is not (capability assumption 2).
9. **Behaviour in flows not decomposed into an AC.** Flow 1 step 3's "plan's limit on what the provider holds" is copy only (DAC-E4-S1-3); flow 2 step 1's "strategies skip them until fixed" is the verdict sentence (DAC-E6-1). Neither needed a separate test. The STD-UI-18 scope note under the daily prices card (capability §5.4) is covered by DAC-E6-3's test (TC-COMP-157) only as the presence of the note.
10. **Constitution-driven cases.** AC-28's 2 s p95 (TC-INT-047, TC-COMP-049) is the only performance SLA; security cases cover the credential never appearing in any response or DOM (TC-COMP-045, TC-COMP-053, TC-COMP-055, TC-COMP-076, TC-COMP-099, TC-COMP-106, TC-COMP-172, TC-COMP-187), bound SQL parameters (TC-COMP-042, TC-COMP-053), provider text rendered as text (TC-COMP-167) and the Host/Origin posture (TC-INT-028). Tier names in E2E steps are avoided; E2E steps use the owner's words.
