---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T14:55:05Z"
reviewed_head: "19bea3759e9ba663666ceae30ee4106434203864"
review_base: "6a5eca7213a84853d9b0b6d46ee16a65e628d32a"
reviewed_state_revision: "sha256:4a54442f646c910fb4d28be5641da79892934dcefae42e9831327373cae6d0a7"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S7
    artifact_version: 1
    content_revision: sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T14:55:05Z
  source_artifacts:
    - id: CAP-002-E4-S7
      version: "1 (sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a)"
    - id: CAP-002-E4-S7-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S7-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0163
      version: "upheld"
    - id: DEC-0164
      version: "upheld"
    - id: DEC-0165
      version: "upheld"
    - id: DEC-0166
      version: "upheld"
    - id: DEC-0247
      version: "upheld 2026-10-31"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 5/5 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 8/8 passed |

This is the initial review of the story-coding commit `19bea37`, so every
finding has scope `initial`.

- **What passes.** Every required validation command passes when rerun
  independently. The full web suite passes (1147 tests in 55 files), as do
  lint, the format check, `tsc --noEmit` and the build. The TDD-evidence lint
  is clean. The three cycle patches, applied in order to the review base,
  reproduce HEAD's six code files byte for byte.
- **Production code.** It meets every acceptance criterion and every task as
  written. Two `SelectionTray` and `InspectorPanel` patterns plus string
  additions to `copy.ts`, with no edit to any delivered file.
- **Why it fails.** The gate fails on E.9. The reviewer regenerated the mutants
  over every changed production line and added 32 hand-written ones. Ten
  non-equivalent mutants survive the focused suites:
  - five change the top-to-bottom or left-to-right order that UX design 1.1 and
    T012 fix (IR-001);
  - five drop the `button` `outline` or `card` `summary` classes that UX design
    1.1, T010, T011 and T012 name (IR-002).

  These make the mandatory TC-COMP-140 and TC-COMP-142 tests `WEAK`, along
  with the T002, T006 and T007 additional tests.
- **Non-blocking.** Two MEDIUM findings: a tray announcement the UX design asks
  for but the planned structure makes unreliable (an owner question), and two
  size literals outside the theme. Four LOW findings.

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 4 · **total 8**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) at `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S7` |
| HEAD | `19bea3759e9ba663666ceae30ee4106434203864` |
| Review base | `origin/main` → `6a5eca7213a84853d9b0b6d46ee16a65e628d32a` (`pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD, equal to the merge base) |
| Working tree | clean (`git status --porcelain -uall` empty; no staged, unstaged or untracked files) |
| Changed files reviewed | 25 (one commit, `19bea37`) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/selection-tray.tsx` | added | DAC-E4-S7-1, AC-16; T009, T010 |
| `web/src/components/patterns/selection-tray.test.tsx` | added | TC-COMP-140; T001, T002 |
| `web/src/components/patterns/inspector-panel.tsx` | added | DAC-E4-S7-2/3/4, AC-16; T009, T011, T012 |
| `web/src/components/patterns/inspector-panel.test.tsx` | added | TC-COMP-141/142/143; T003 to T008 |
| `web/src/screens/research/copy.ts` | modified | T009, which allows adding strings (`inspectorLoading`, `inputsLineAsOf`, `inputsLineSeparator`, `inUniversesLead`, `listComma`, `listAnd`) |
| `web/src/screens/research/copy.test.ts` | modified | T009 (an anchor for each added string) |
| `.../stories/CAP-002-E4-S7.md` | modified | the `status:` line only (`planning` → `in-review`), as T013 allows |
| `.../stories/CAP-002-E4-S7-tasks.md` | modified | checkbox ticks only; no other line changed |
| `.../stories/CAP-002-E4-S7-tdd-evidence.yaml` | added | T015 |
| `.../stories/CAP-002-E4-S7-evidence/` (16 files: three cycle patches, red, green and full-suite logs, mutants and mutation results per cycle) | added | T015 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `selection-tray.tsx` `SelectionTray` (count, Compare gate, Add seam); `inspector-panel.tsx` `InspectorPanel` (one read per settled selection) | both test files | This story's slice of AC-16 is the selection controls. *Within a single universe* depends on mounting the patterns on the Members tab, which is unassigned and outside this story (plan Open Gap 8). |
| DAC-E4-S7-1 | SATISFIED | `selection-tray.tsx:51` `canCompare` from `COMPARE_MIN`/`COMPARE_MAX` (2, 6; DEC-0070). `:61-67`: a `Link` at 2 to 6. `:70-85`: otherwise a `button` with `data-variant="blocked"`, `aria-disabled="true"`, `aria-describedby` set to the visible reason, never `disabled` and with no handler | `selection-tray.test.tsx:43-108` (`describe.each` over 1, 7, 8 and 2, 3, 6; covers focus by Tab, the accessible description, and no navigation on click, Enter or Space) | Behaviour correct. The enabled link's `button` `outline` styling is not pinned (IR-002) |
| DAC-E4-S7-2 | SATISFIED | `inspector-panel.tsx:312-337`: one `setTimeout(INSPECT_DEBOUNCE_MS = 150)`, cleared on change and unmount, a per-effect `cancelled` flag. `:75-100` `inputsLine` prints each input's `asOf` and `knownOn` through `formatDate` (DEC-0165) | `inspector-panel.test.tsx:111-157` (no read at 0 and 149 ms, one at 150, none on re-render, one per burst); `:415-430` (dates printed as given) | Matches DEC-0164 (the inspector owns the one wait) |
| DAC-E4-S7-3 | SATISFIED | `inspector-panel.tsx:313-316` (`null` resets to idle, no timer); `:359` `SELECTION.inspectorEmpty` inside `section` `aria-label="Selected stock"` | `inspector-panel.test.tsx:159-209` (exact sentence, no read after 1 s, no link, status, button or footnote; back from loaded; in-flight read and failure dropped) | The card styling of the section is not pinned (IR-002) |
| DAC-E4-S7-4 | SATISFIED | `inspector-panel.tsx:175-202` `MembershipsLine` (`SELECTION.inNoUniverse` for `[]`, else `In` plus encoded router links) | `inspector-panel.test.tsx:432-483` (no link for `[]`; links and order; one to four names; special characters as text and encoded id); loading never shows *In no universe* (`:212-222`) | Correct |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `selection-tray.test.tsx:43-108` | Every assertion T001 lists is present. The enabled case does not pin the outline styling T010 specifies (IR-002) |
| T002 | complete | VERIFIED | `selection-tray.test.tsx:110-195` | Every assertion T002 lists is present. The tray's left-to-right order (IR-001) and the Add button's classes (IR-002) are unpinned |
| T003 | complete | VERIFIED | `inspector-panel.test.tsx:111-157`, `:415-430` | Its dates half runs in cycle 3, as the evidence header records |
| T004 | complete | VERIFIED | `inspector-panel.test.tsx:159-209` | — |
| T005 | complete | VERIFIED | `inspector-panel.test.tsx:432-483` | — |
| T006 | complete | VERIFIED | `inspector-panel.test.tsx:485-622` | Listed assertions present. The test titled "shows the symbol … then the name" asserts no order (IR-001) |
| T007 | complete | VERIFIED | `inspector-panel.test.tsx:624-836` | Listed assertions present. The box's position before the link (IR-001) and the link's `outline` classes (IR-002) are unpinned |
| T008 | complete | VERIFIED | `inspector-panel.test.tsx:211-358` | All of T008 runs in cycle 2 rather than half of it, a deviation the evidence header records and justifies |
| T009 | complete | VERIFIED | `copy.ts:489-516` (six additions with doc comments), `copy.test.ts:62, 533-545` | The tray needed no new string. `inUniversesLead`, `listComma` and `listAnd` cite T012, not a DEC (trivial) |
| T010 | complete | VERIFIED | `selection-tray.tsx:9-99` | A `section` with `aria-label` (implicit `region`) instead of a `div` with `role="region"`, because biome `useSemanticElements` rejects the latter; justified in the evidence. The blocked button has no `onClick` rather than a no-op one, which is equivalent |
| T011 | complete | VERIFIED | `inspector-panel.tsx:29, 306-371` | The doc comment states DEC-0164's host contract (`:281-282`) |
| T012 | complete | VERIFIED | `inspector-panel.tsx:68-274` | Rendered in the order T012 lists. The explanation-box rule follows DEC-0247 (owner-upheld 2026-10-31) rather than T012's narrower wording |
| T013 | complete | VERIFIED | `git diff --name-status 6a5eca72..HEAD -- web` shows only the six files. Nothing else in `web/src` imports either pattern. Neither file uses `dangerouslySetInnerHTML` or imports `results-table`. `dependencies.yaml`, `factor-cell.tsx` and `restated-mark.tsx` are unchanged | — |
| T014 | complete | VERIFIED | Format, lint, tsc, test and build rerun (below). The built CSS `assets/index-D7sYtP0P.css` contains every class the patterns use and defines `--factor-value:`, `--factor-growth:` and `--factor-momentum:` | Two classes the patterns use are Tailwind default literals, not theme tokens (IR-004) |
| T015 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings. Each patch's SHA-256 equals its `diff_sha256`, and each log and results hash matches. The three patches replay onto `6a5eca7` to HEAD's code files | Cycle 3's green-evidence test counts are misstated (IR-008) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `selection-tray.test.tsx` "TC-COMP-140 …" / TC-COMP-140 | WEAK | Real component in a `MemoryRouter` with a location probe. At 1, 7 and 8 the blocked case asserts the tag, `type`, `data-variant`, `aria-disabled`, not `disabled`, `tabIndex`, the reason by `aria-describedby` and its visibility, focus by Tab, and no navigation on click, Enter or Space. At 2, 3 and 6 it asserts the anchor, the exact `href`, no blocked attributes and no reason, and that clicking navigates there | Survivor `compare-link-unstyled`: the enabled Compare link loses its `button` `outline` classes and the test still passes (IR-002) |
| `selection-tray.test.tsx` tray behaviour, encoding, Add seam / T002 | WEAK | Empty at 0; region name, fill classes; polite live count updated in place; duplicates counted; per-symbol encoding with literal commas in checked order; Add absent without a handler, enabled from 1, called once with the symbols | Survivors `count-after-compare` (IR-001) and `add-unstyled` (IR-002) |
| `inspector-panel.test.tsx` debounce and dates / TC-COMP-141 | ADEQUATE | Fake timers, a mocked `getStockEvidence`, deferred promises. No read at 0 and 149 ms, one at 150 with the symbol, none after 10 s or on re-render, one per burst for the last symbol. The value line prints both dates exactly | — (the generated `INSPECT_DEBOUNCE_MS` 151 mutant and the reviewer's `swap-dates` are killed) |
| `inspector-panel.test.tsx` empty state / TC-COMP-142 | WEAK | Exact sentence as the whole section text; no read after 1 s; no link, status or button; back from loaded; in-flight resolve and reject dropped | Survivor `card-no-classes`: the section loses the `card` `summary` classes T011 names (`rounded border border-border bg-card … text-card-foreground`). No test reads them (IR-002) |
| `inspector-panel.test.tsx` memberships / TC-COMP-143 | ADEQUATE | Exact *In no universe* with no link; links, hrefs and order; joins for one to four names; text-only names with an encoded id | — |
| `inspector-panel.test.tsx` loading, failure, stale / T008 | ADEQUATE | Skeleton `role="status"` text through the wait and the pending read; refusal sentence with no message, code or request id; generic network sentence; Try again re-reads once after the wait; out-of-order, stale-failure, unmount and re-selection cases | — (the reviewer's `no-cancel-flag`, `fail-unguarded`, `load-unguarded`, `skeleton-after-wait`, `null-no-return` and `retry-no-type` are killed) |
| `inspector-panel.test.tsx` factor blocks / T006 | WEAK | Symbol classes, term labels and order, swatch `aria-hidden` and inline tokens, percentiles and signed scores, the mark on value and growth only, the absent-value dash, grouping by `(asOf, knownOn)`, the separator, a null `knownOn`, no line, `text-xs`, no wire key or detail | Survivors `name-above-symbol`, `memberships-after-blocks`, `inputs-before-cell` (IR-001) |
| `inspector-panel.test.tsx` explanation box, link, footnote / T007 | WEAK | The box's sentences equal the cells' titles; cause-less and unrecognised cells add none; *Not enough to rank* with no digit; the retired badge and sentence; the restated sentence once and only where a mark is drawn; no box when clean; the link's tag and encoded href; the footnote last with its classes; no holdings line | Survivors `box-after-link` (IR-001), `see-link-unstyled` (IR-002) |
| `copy.test.ts` T009 anchors | ADEQUATE | Exact strings and the agreement of the linked join with `inUniverses` | — (the reviewer's `list-comma-copy` is killed) |

Mocks and isolation: only `getStockEvidence` is doubled (with `importOriginal`,
so `ClassificationApiError` is the real class). `FactorCell` and `copy.ts`
run for real, so the explanation-box tests compare against S3's actual
`title` attribute. Fake timers are installed and reset per test, with no
network and no wall-clock dependence. The React Router future-flag warnings
on stderr are pre-existing noise.

### Mutation run (E.9)

The reviewer ran `scripts/mutation-run.py generate --range 6a5eca72..HEAD`,
which produced 28 operator mutants over both pattern files and none for the
`copy.ts` strings. To these the reviewer added 32 hand-written mutants
(`manual:review:*`) for the JSX, the guards and the copy that the operators do
not reach. All 60 ran against the three focused suites (`selection-tray.test.tsx`,
`inspector-panel.test.tsx`, `copy.test.ts`) in four clones. Baselines exited 0
in every worker. Result: **44 killed, 16 survived, 0 stillborn, 0 timeout**.
The results are saved beside this report as
`CAP-002-E4-S7-implementation-review-v1-mutation.json`; their SHA-256 is
`2df1b18776972d46ec1c35a91c33a111ca1e028d20f8d0e7067fb7741fec03ce`.

| Survivor | Mutation | Disposition | Contract |
|----------|----------|-------------|----------|
| `inspector-panel.tsx:308:off-by-one:1` | `useState(0)` → `useState(1)` | equivalent | `attempt` is read only as an effect dependency. T011 ("increments a retry counter in the effect's dependencies") and DEC-0165 ("re-issues the read") leave its initial value open |
| `inspector-panel.tsx:346:off-by-one:1` | `count + 1` → `count + 2` | equivalent | Any step yields a new dependency value. The same artifacts leave the step open |
| `manual:review:compare-link-no-variant` | drop `data-variant="outline"` from the Compare link | equivalent | No CSS consumes `data-variant="outline"`: `web/src` keys styles only on `data-[variant=blocked]` and `data-[variant=secondary]`. T001 requires only "`data-variant` not `blocked`" |
| `manual:review:see-link-no-variant` | the same on **See every input and its date** | equivalent | As above. T012 names classes, not the attribute |
| `manual:review:card-no-variant` | drop `data-variant="summary"` from the section | equivalent | As above. T011 names classes, not the attribute |
| `manual:review:sentence-for-scored` | `incompleteSentence` no longer exempts a scored cell | equivalent | The difference needs a `classified` cell with a percentile and a `reasonDetail` or incomplete `reasonCode`. research-store 2.4 `factor_classification_shape` forces `reason_code IS NULL` for `classified`, and factor-engine 2.5 writes `reason_detail` only on `not_classified` rows |
| `manual:review:count-after-compare` | *{n} selected* after **Compare side by side** | **non-equivalent** | UX design 1.1, the tray: "Left: *{n} selected*; right: **Compare side by side** and **Add to universe…**" (IR-001) |
| `manual:review:name-above-symbol` | the name above the symbol | **non-equivalent** | UX design 1.1 item 1: "the name beneath it"; T012 "in order" (IR-001) |
| `manual:review:memberships-after-blocks` | the memberships line after the factor blocks | **non-equivalent** | UX design 1.1 items 2 then 3; T012 "in order" (IR-001) |
| `manual:review:inputs-before-cell` | the inputs line before the percentile and score | **non-equivalent** | UX design 1.1 item 3: term, "then the percentile … then one line in `--text-xs` naming the inputs" (IR-001) |
| `manual:review:box-after-link` | the explanation box after **See every input and its date** | **non-equivalent** | UX design 1.1 items 4 then 5; T012 "in order" (IR-001) |
| `manual:review:compare-link-unstyled` | the Compare link without its button classes | **non-equivalent** | UX design 1.1 the tray: "both `button` `outline` on the dark bar"; T010 "a react-router `Link` styled as `button` `outline`" (IR-002) |
| `manual:review:add-unstyled` | **Add to universe…** without its button classes | **non-equivalent** | UX design 1.1 the tray: "both `button` `outline`" (IR-002) |
| `manual:review:see-link-unstyled` | **See every input and its date** without its button classes | **non-equivalent** | UX design 1.1 item 5 (`button` `outline`); T012 "with the `button` `outline` classes" (IR-002) |
| `manual:review:card-no-classes` | the section without `rounded border border-border bg-card text-card-foreground` | **non-equivalent** | UX design 1.1 Inspector and classification-ui 2.5 (`card` `summary`); T011 "`card` `summary` classes as the delivered cards use" (IR-002) |
| `manual:review:blocked-unstyled` | the blocked Compare button without its button classes | equivalent | button design spec §2 and §6 give `blocked` its semantics but no visual tokens, and T010 names no classes for it |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2` at `19bea37`. A
temporary symlink `node_modules` → the main checkout's `node_modules` was
created for the run and removed afterwards. Vitest and the build ran outside
the sandbox: the invoking driver reported `EPERM` on `node_modules/.vite`
inside the sandbox, so no in-sandbox attempt was made for those. `npm run …
--prefix <repo>` runs each script in the repository root, the working
directory the tech-stack file names.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm run test --prefix <repo> -- src/components/patterns/selection-tray.test.tsx src/components/patterns/inspector-panel.test.tsx src/screens/research/copy.test.ts src/components/patterns/factor-cell.test.tsx` | repo root | 0 | PASS | 4 files, 479 tests (tray 21, inspector 51, copy 317, factor-cell 90) |
| `npm run test` (`vitest run`) | repo root | 0 | PASS | 55 files, 1147 tests; includes the real-build test `build-output.test.tsx` |
| `npm run lint` (`biome lint .`) | repo root | 0 | PASS | 127 files checked, no fixes |
| `npm run format` (`biome format .`, check only) | repo root | 0 | PASS | 127 files checked, no fixes |
| `npx tsc --noEmit` (run as `node_modules/.bin/tsc --noEmit -p <repo>/tsconfig.json`) | repo root | 0 | PASS | `include: ["web/src"]`, strict |
| `npm run build` (`vite build`) | repo root | 0 | PASS | 63 modules. The patterns are not in the bundle because nothing imports them yet; Tailwind still scans them (`content: ./web/src/**/*.{ts,tsx}`) |
| `grep` of the built `assets/index-D7sYtP0P.css` for `.bg-foreground`, `.text-background`, `.bg-status-neutral-muted`, `.text-status-neutral`, `.text-xs`, `.text-xl`, `.font-numeric`, `.bg-card`, `.text-card-foreground`, `.animate-pulse`, `.bg-secondary`, `.sr-only`, `.border-border`, `.text-muted-foreground`, `.rounded-sm`, `.h-24`, `--factor-value:`, `--factor-growth:`, `--factor-momentum:` | repo root | 0 | PASS | All present (T014). `.h-24{height:6rem}` and `.rounded-sm{border-radius:.125rem}` are literals (IR-004) |
| `python3 scripts/check-tdd-evidence.py --evidence <S7>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6a5eca72… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --range 6a5eca72..HEAD --cycle review` + 32 manual mutants; `… run --jobs 4 --command 'test -e node_modules \|\| ln -s <main>/node_modules node_modules; ./node_modules/.bin/vitest run <three focused suites>'` | harness root | 3 (survivors present) | 16 survived / 60 | 10 non-equivalent (IR-001, IR-002), 6 equivalent |
| Evidence replay: clone at `6a5eca7`, `git apply` cycle-1, cycle-2, cycle-3 patches, `cmp` against `HEAD` | scratchpad clone | 0 | PASS | All six code files identical |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it: no screen mounts the patterns yet (first importer CAP-002-E4-S9) |

### Validation Side Effects

- **Before:** `usr/alvaro-de-jodra/CAP-002-E4-S7` at `19bea37`. `git status --porcelain -uall` was empty. Code fingerprint `sha256:4a54442f646c910fb4d28be5641da79892934dcefae42e9831327373cae6d0a7`.
- **After:**
  - The same HEAD, an empty status (the temporary `node_modules` link removed) and the same fingerprint.
  - The build and the build-output test rewrote ignored files under `src/factorflow/api/static/`: `index.html` and `assets/index-D7sYtP0P.css`, `index-Bb5b-zyJ.js`, `index-Bn7FqBiJ.js`.
  - Vitest's cache writes went to the linked main-checkout `node_modules/.vite`, which lies outside this repository.
  - The mutation clones and logs live in the session scratchpad.
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | Five non-equivalent mutants reorder the inspector and the tray undetected |
| IR-002 | HIGH | initial | Four non-equivalent mutants strip the `button` `outline` and `card` `summary` classes undetected |
| IR-003 | MEDIUM | initial | The tray's live region mounts already holding *1 selected*, so its appearance may not be announced |
| IR-004 | MEDIUM | initial | `h-24` and `rounded-sm` introduce size literals outside the theme (STD-UI-29) |
| IR-005 | LOW | initial | The inspector restates `FactorCell`'s private state choice and *Not followed* badge |
| IR-006 | LOW | initial | A selection change commits one render of the previous stock before the reset |
| IR-007 | LOW | initial | Activating **Try again** removes the focused control and leaves focus on the document |
| IR-008 | LOW | initial | Cycle 3's green evidence misstates the per-file test counts |

### IR-001 — Five non-equivalent mutants reorder the inspector and the tray undetected

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16; DAC-E4-S7-2 and DAC-E4-S7-4 (the panes they render in)
- **Tasks**: T002, T006, T007 (the tests); T010, T012 (the order they specify)
- **Files**:
  - Production: `web/src/components/patterns/inspector-panel.tsx:241-271` (`Loaded`), `:220-231` (`FactorBlock`); `web/src/components/patterns/selection-tray.tsx:57-86`.
  - Tests: `inspector-panel.test.tsx:486-508, 817-835`; `selection-tray.test.tsx:110-154`.
- **Claim challenged**: The cycle-3 evidence reports 58 of 59 mutants killed and calls the one survivor equivalent. T006 has a test titled "shows the symbol in the numeric face at text-xl, then the name".
- **Observed evidence**: Each of these reviewer mutants passes all three focused suites (logs `manual_review_*.log` in the mutation run):
  - `name-above-symbol`: the name paragraph moved above the symbol.
  - `memberships-after-blocks`: `MembershipsLine` moved after the factor `dl`.
  - `inputs-before-cell`: the inputs-line `dd` moved before the `FactorCell` `dd`.
  - `box-after-link`: the explanation box moved after **See every input and its date**.
  - `count-after-compare`: the *{n} selected* paragraph moved after the Compare control.

  The test titled "… then the name" asserts only that both texts exist (`:486-491`). The only position any test checks is the footnote being last (`:832`).
- **Expected evidence/behavior**:
  - UX design 1.1 Inspector, "When a row is selected, top to bottom": item 1 is the symbol and "the name beneath it"; item 2 the memberships line; item 3 the factor block (term, "then the percentile …, then one line in `--text-xs` naming the inputs"); item 4 the box; item 5 the link; item 6 the footnote.
  - UX design 1.1, the tray: "Left: *{n} selected*; right: **Compare side by side** and **Add to universe…**".
  - T012: "for a `loaded` `StockEvidence`, in order: …".
  - Adversarial-review E.9 and TEST-TDD-006: no non-equivalent survivor.
- **Impact**: A regression that reorders the inspector would pass the suite, for example a refactor that moves the box below the link or the memberships under the factors. So would one that moves the tray's count. It would break the reading order the design fixes and the order a screen reader follows. TC-COMP-141 to 143 are unaffected, but the T002, T006 and T007 tests are `WEAK`.
- **Required remediation**: Pin the document order of the loaded inspector's six parts, of the factor block's three parts, and of the tray's count before its actions. Then rerun `mutation-run.py` with the five mutants above (they are in `CAP-002-E4-S7-implementation-review-v1-mutation.json`) and show them killed.

### IR-002 — Four non-equivalent mutants strip the `button` `outline` and `card` `summary` classes undetected

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-1, DAC-E4-S7-3 (their mandatory tests); AC-16
- **Tasks**: T001, T002, T004, T007 (the tests); T010, T011, T012 (the styling they specify)
- **Files**:
  - Production: `web/src/components/patterns/selection-tray.tsx:13, 61-67, 87-96`; `web/src/components/patterns/inspector-panel.tsx:54, 264-270, 363-366`.
  - Tests: `selection-tray.test.tsx:84-107, 177-194`; `inspector-panel.test.tsx:161-175, 817-823`.
- **Claim challenged**: T001, T004 and T007 are checked complete as adequate tests of the controls and the section they render. The evidence calls the patterns fully mutation-tested.
- **Observed evidence**: Each of these reviewer mutants passes all three focused suites:
  - `compare-link-unstyled`: the enabled Compare `Link` loses `className={BUTTON}`.
  - `add-unstyled`: the same on **Add to universe…**.
  - `see-link-unstyled`: the same on **See every input and its date**.
  - `card-no-classes`: the section loses `rounded border border-border bg-card text-card-foreground`.

  The tests pin `data-variant="outline"` on Add only, and on the section only its tag and name. No test reads any of these classes. Other design classes are pinned elsewhere in the same files (`bg-foreground text-background`, `text-xs`, `font-numeric text-xl`, the box's `border border-border`, the footnote's `text-muted-foreground`).
- **Expected evidence/behavior**:
  - UX design 1.1, the tray: "**Compare side by side** and **Add to universe…**, both `button` `outline` on the dark bar".
  - UX design 1.1 item 5: "**See every input and its date** (`button` `outline`, rendered as a link …)".
  - UX design 1.1 and classification-ui 2.5: the inspector is `card` `summary`.
  - T010: "Compare is a react-router `Link` styled as `button` `outline`".
  - T011: "`card` `summary` classes as the delivered cards use".
  - T012: "with the `button` `outline` classes".
  - E.9: no non-equivalent survivor.
- **Impact**: A regression could render the enabled Compare, Add to universe or the evidence link as bare inline text on the dark bar or in the card, or drop the inspector's card surface and border, and the suite would pass. TC-COMP-140 and TC-COMP-142, both mandatory, are `WEAK`; so are the T002 and T007 tests.
- **Required remediation**: Assert the `button` `outline` classes on the enabled Compare link, on **Add to universe…** and on **See every input and its date**, and the `card` `summary` classes on the inspector section in each state. Then rerun `mutation-run.py` with the four mutants above and show them killed. The equivalent `data-variant` survivors need no change.

### IR-003 — The tray's live region mounts already holding *1 selected*, so its appearance may not be announced

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (the story description's "announces {n} selected")
- **Tasks**: T002, T010
- **Files**: `web/src/components/patterns/selection-tray.tsx:48-59`
- **Claim challenged**: The tray "announces *{n} selected* politely" from one checked row (T010 doc comment, `:29-30`).
- **Observed evidence**: With no checked row the tray returns `null`, as T002 requires (an empty container). The first check mounts the region and its `aria-live="polite"` paragraph together, already holding *1 selected*. Many screen readers announce changes only to a live region already in the document, so they will not announce this first appearance. Later counts update the same node (`selection-tray.test.tsx:127-139`) and are announced. The coder's cycle-1 code review raised this as MEDIUM and the evidence carries it as "the owner's call", but no decision record captures it. Not verified on a real screen reader. jsdom cannot show it.
- **Expected evidence/behavior**:
  - UX design 1.1, the tray: "announced politely as *{n} selected* when it appears (S03 §9)".
  - S03 §9 (`docs/ux/screens/S03-research.md:165`): "The tray appears as a polite announcement".
  - STD-UI-24: semantics remain mandatory.
  - AGENTS.md: proceeding on an unrecorded assumption is forbidden.
- **Impact**: A screen-reader user who checks the first row may hear nothing about the tray or the count. The design names exactly the moment the tray appears.
- **Required remediation**: Owner question: should the tray's empty state keep an empty, visually hidden polite live region mounted? That departs from T002's "container is empty" wording. The alternative is to accept the risk, or to give the host (E4-S9) a persistent announcer. Record the answer under `docs/decision-records.md`. If the owner chooses the live region, implement it and test that the count is written into an already mounted live region.

### IR-004 — `h-24` and `rounded-sm` introduce size literals outside the theme (STD-UI-29)

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011 (skeleton), T012 (swatch), T014
- **Files**: `web/src/components/patterns/inspector-panel.tsx:354` (`h-24` on the loading `output`), `:215` (`rounded-sm` on the swatch)
- **Claim challenged**: T014 is verified complete, and the evidence says the built CSS "carries every class the two patterns use".
- **Observed evidence**: `tailwind.config.js` extends `height` and `spacing` only for steps 1 to 8 (each `var(--space-N)`, plus `row`) and defines no `borderRadius`. The built CSS therefore has the literals `.h-24{height:6rem}` and `.rounded-sm{border-radius:.125rem}`. `git grep` over `web/src` at the review base finds neither class in any delivered file. The plan names neither.
- **Expected evidence/behavior**: STD-UI-29: "No spacing, size or colour literal appears outside the theme." CAP-002-E4-S5 review v1 IR-006 applied the same rule to `w-14`.
- **Impact**: Two new non-token sizes in `web/src`. The skeleton's height and the swatch's corner will not follow the theme's density or radius tokens.
- **Required remediation**: Use theme-token classes for the skeleton height and the swatch corner (for example a `height` step from the scale and the existing `rounded`), or surface the need for a new token to the owner. Supplying one touches `theme.css` or `tailwind.config.js`, outside DEC-0084's edit set.

### IR-005 — The inspector restates `FactorCell`'s private state choice and *Not followed* badge

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T012
- **Files**: `web/src/components/patterns/inspector-panel.tsx:102-132` (`isIncompleteReason`, `isScored`, `incompleteSentence`), `:159-172` (`NotFollowedBadge`); compare `factor-cell.tsx:64-82, 112-124, 189-200`
- **Claim challenged**: T009: "If S3 exports its Incomplete-sentence builder …, import it rather than writing a second".
- **Observed evidence**: S3 exports no such builder, and T013 puts `factor-cell.tsx` outside the edit set, so the copy is forced. The duplicate covers the state-selection order (DEC-0151) and the badge markup. The explanation-box tests compare against `FactorCell`'s live `title`, which catches title drift but not a change in which cells `FactorCell` draws as *Incomplete*. The coder's cycle-3 code review carried the same point.
- **Expected evidence/behavior**: one source for the cell state (DEC-0151, DEC-0247: the box follows what the cell draws).
- **Impact**: A later change to `FactorCell`'s state order can make the box explain a factor the cell draws differently.
- **Required remediation**: None required in this story. Record a follow-up for `factor-cell.tsx` to export its state selector and title builder in a story that may edit it.

### IR-006 — A selection change commits one render of the previous stock before the reset

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-2
- **Tasks**: T008, T011
- **Files**: `web/src/components/patterns/inspector-panel.tsx:307-341`
- **Claim challenged**: T008: a read for a symbol no longer current "never render[s]" (the evidence's "never renders a read that resolves after the selection moved on").
- **Observed evidence**: The reset to `LOADING` happens in `useEffect`. The first render after `symbol` changes from a loaded *A* to *B* still commits *A*'s loaded content, and the effect replaces it. React 18 flushes passive effects synchronously after a discrete input (click, keydown), so the row-selection paths E4-S9 will wire are unlikely to paint it; a non-discrete update can. The evidence carries this ("not observable in jsdom").
- **Expected evidence/behavior**: T008 and DEC-0165: content shown is for the current selection.
- **Impact**: A possible one-frame flash of the previous stock under a new selection, for non-discrete updates only.
- **Required remediation**: Optional: derive the reset during render, for example state keyed by the symbol it belongs to, so a stale `loaded` never commits.

### IR-007 — Activating **Try again** removes the focused control and leaves focus on the document

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008, T011
- **Files**: `web/src/components/patterns/inspector-panel.tsx:342-357`
- **Claim challenged**: The failure state is keyboard-recoverable (T008).
- **Observed evidence**: Activating **Try again** sets the state to `loading`. That unmounts the focused button and renders the skeleton, then the stock, so focus falls to `document.body`. No artifact names a target, and no decision records the choice. DEC-0244 records the comparable choice for E4-S6.
- **Expected evidence/behavior**: STD-UI-24: "focus MUST be managed … on content inserted into the page".
- **Impact**: A keyboard user who retries loses their place and must tab back into the inspector.
- **Required remediation**: Either move focus to a defined target, such as the *Selected stock* section, or record the choice for the owner, as DEC-0244 did for E4-S6.

### IR-008 — Cycle 3's green evidence misstates the per-file test counts

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T015
- **Files**: `docs/capabilities/…/stories/CAP-002-E4-S7-tdd-evidence.yaml:154`; `CAP-002-E4-S7-evidence/green-cycle-3.log`
- **Claim challenged**: "inspector-panel.test.tsx 56 passed and copy.test.ts 312 passed, 368 in all (green-cycle-3.log)".
- **Observed evidence**: The cited log shows `copy.test.ts (317 tests)` and `inspector-panel.test.tsx (51 tests)`. The total, 368, matches. The reviewer's rerun agrees with the log (51 and 317).
- **Expected evidence/behavior**: Evidence text agrees with the log it cites (T015).
- **Impact**: Evidence quality only.
- **Required remediation**: Correct the counts in the cycle-3 `green_evidence`, or in the reworked cycle's evidence.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded in the evidence:**
  - the region is a `section` with `aria-label`, because biome `useSemanticElements` rejects `div role="region"`;
  - all of T008 moved into cycle 2, and T003's dates half into cycle 3;
  - the explanation box follows DEC-0247 (owner-upheld 2026-10-31) instead of T012's narrower wording.
- **Bookkeeping:**
  - T011 and T012 still say "the loading half of T008" while cycle 2 implemented all of it. The evidence header records the change.
  - DEC-0247 extends DEC-0229, which is still open (`owner_reviewed: false`).
- **Out-of-scope changes:** none. Only the six code files, the story's status line, the task checkboxes and the evidence changed.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework with this report and `CAP-002-E4-S7-tasks.md`:
  - resolve IR-001 and IR-002 by strengthening the tests until the ten listed survivors are killed, then rerun `mutation-run.py` with this report's mutation file;
  - put IR-003's live-region question to the owner and record the answer;
  - address IR-004.

  Then rerun this review (v2).
- **Warnings accepted downstream**: N/A
