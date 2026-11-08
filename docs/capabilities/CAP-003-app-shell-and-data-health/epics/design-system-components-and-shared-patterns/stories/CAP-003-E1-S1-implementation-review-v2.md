---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T00:43:02Z"
reviewed_head: "5c9731ec66eb1c519fe5c38ad35c11c09c8d3f94"
review_base: "2fc2d1e18a4e8c1e43ad153d5b809658d7c541ef"
reviewed_state_revision: "sha256:46112d91ebdd076b52415d9577721305a00a24be8c7d3302eb29f44d2adc9d2f"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S1
    artifact_version: 1
    content_revision: sha256:6fe60839989e9103d29fd7a4313faa90e19667db66f0caf79d95d4a0391167aa
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T00:43:02Z
  source_artifacts:
    - id: CAP-003-E1-S1
      version: "1 (sha256:6fe60839989e9103d29fd7a4313faa90e19667db66f0caf79d95d4a0391167aa)"
    - id: CAP-003-E1-S1-tasks
      version: "1 (updated 2026-11-08, last_reworked_review v1)"
    - id: CAP-003-E1-S1-tdd-evidence
      version: "cycle-1 to cycle-8"
    - id: CAP-003-E1-S1-implementation-review
      version: "1 (baseline, reviewed_head cf0690796b2fdccf76a6948115b1a581de9e5eb6)"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: design-system/components/badge/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/button/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/card/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: DEC-0296
      version: "applied, owner-upheld 2026-11-07"
    - id: DEC-0297
      version: "applied, owner-upheld 2026-11-07"
    - id: DEC-0298
      version: "applied, owner-upheld 2026-11-07"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 5 |
| Low findings | 1 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 13/13 passed |

This is a re-review. The baseline is review v1 (`CHANGES-REQUIRED`, reviewed head `cf06907`). The
rework is test-only. No production file changed since the baseline: `git diff --exit-code
cf06907 HEAD` over `tailwind.config.js`, `package.json`, `package-lock.json` and the four `ui/`
sources exits 0.

The four blocking v1 findings are resolved. The reviewer reran all 28 v1 mutants (`scope`
tagged them `carried`), including the 11 that survived v1. All 28 are now killed, each by a named
assertion. Every required command passes.

The reviewer also wrote 9 new mutants. All 9 survive, and none is equivalent. Each one mutates a
production or scan line that is unchanged since v1, so `mutation-run.py scope` tags it `late`.
Under the re-review scope rule (skill H), a late survivor is MEDIUM at most and does not make its
test `WEAK`. They are reported as IR-002 to IR-005 and do not block.

Two v1 findings are still open and also do not block:

- v1/IR-005 (missing `Decision-Id` trailers, MEDIUM) is now IR-001. The rework commits repeat
  the omission.
- v1/IR-006 (`blocked` with `asChild`, LOW) is now IR-006.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S1.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S1-run-20261107T234031Z` |
| HEAD | `5c9731ec66eb1c519fe5c38ad35c11c09c8d3f94` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261107T234031Z` (the driver's integration branch, passed as `--base-ref`), merge base `2fc2d1e18a4e8c1e43ad153d5b809658d7c541ef`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 46 (11 commits: `e36f7b8`, `5757ae4`, `ccfdd8d`, `784dcfc`, `eaaa230`, `b221b25`, `822077d`, `cf06907`, `f1da038`, `1768887`, `5c9731e`) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `cf0690796b2fdccf76a6948115b1a581de9e5eb6`, mutation results `CAP-003-E1-S1-implementation-review-v1-mutation.json` |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261107T234031Z` reports `READY — review changes were
reworked; a new review version is required`.

**Delta since baseline** (`git diff --stat cf06907 HEAD`):

- Four test files changed: `token-literals.test.ts` (+39/-3), `badge.test.tsx` (+8),
  `button.test.tsx` (+54) and `card.test.tsx` (+18).
- The task plan frontmatter changed (`updated`, `last_reworked_review`).
- `tdd-evidence.yaml` gained a `cycle-8` entry, and the four cycle-8 evidence files were added.
- The v1 report and its mutation results were added (commit `f1da038`).

No production file changed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `package.json` | modified | DAC-E1-S1-5, DAC-E1-12; T009 (exactly five `dependencies` added, `devDependencies` unchanged) |
| `package-lock.json` | modified | DAC-E1-S1-5, DAC-E1-12; T009 (the five packages and one transitive, `@radix-ui/react-compose-refs` 1.1.5, MIT) |
| `tailwind.config.js` | modified | DAC-E1-11; T010 |
| `web/src/components/token-literals.test.ts` | added | DAC-E1-11, DAC-E1-S1-2; T002, T003 (cycle-8 additions: IR-001 and IR-002 of v1) |
| `web/src/components/ui/utils.ts` | added | AC-26, DAC-E1-S1-4; T011 |
| `web/src/components/ui/utils.test.ts` | added | AC-26, DAC-E1-S1-4; T008 |
| `web/src/components/ui/badge.tsx` | added | DAC-E1-S1-4, AC-26; T012 |
| `web/src/components/ui/badge.test.tsx` | added | DAC-E1-S1-4, AC-26; T006 (cycle-8 shape test: v1 IR-003) |
| `web/src/components/ui/button.tsx` | added | AC-25, DAC-E1-S1-3; T013 |
| `web/src/components/ui/button.test.tsx` | added | AC-25, AC-26, DAC-E1-S1-3; T005 (cycle-8 class block: v1 IR-003, IR-004) |
| `web/src/components/ui/card.tsx` | added | AC-26; T014 (DEC-0297) |
| `web/src/components/ui/card.test.tsx` | added | AC-26; T007 (cycle-8 parts test: v1 IR-003) |
| `web/src/components/ui/vendoring.test.ts` | added | DAC-E1-S1-1, DAC-E1-S1-5, DAC-E1-12; T004 |
| `docs/.../stories/CAP-003-E1-S1.md` | modified | Story-coding hand-off: `status: planning` to `in-review` (only line changed) |
| `docs/.../stories/CAP-003-E1-S1-tasks.md` | modified | T001-T017 checkboxes, plus frontmatter `updated` and `last_reworked_review` (37 lines in all, verified by diff) |
| `docs/.../stories/CAP-003-E1-S1-tdd-evidence.yaml` | added | T017 (cycles 1 to 8) |
| `docs/.../stories/CAP-003-E1-S1-evidence/cycle-1.patch` to `cycle-8.patch` (8 files) | added | T017: each cycle's reviewed patch |
| `docs/.../stories/CAP-003-E1-S1-evidence/mutants-cycle-{1,4,5,6,7,8}.json` (6 files) | added | T017: each cycle's mutants |
| `docs/.../stories/CAP-003-E1-S1-evidence/mutation-cycle-{1,4,5,6,7,8}-results.json` (6 files) | added | T017: each cycle's mutation results |
| `docs/.../stories/CAP-003-E1-S1-evidence/red-cycle-1-tailwind-keys.log` to `red-cycle-8-mutants.log` (8 files) | added | T017: each cycle's RED evidence |
| `docs/.../stories/CAP-003-E1-S1-implementation-review-v1.md` | added | The baseline review (adversarial review I.4) |
| `docs/.../stories/CAP-003-E1-S1-implementation-review-v1-mutation.json` | added | The baseline mutation results (adversarial review I.5) |

`docs/...` abbreviates `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns`.
That is 13 code and configuration files and 33 documentation files, 46 in all. Every change traces
to the story, the task plan or the review cycle. No file is unjustified. These are unchanged since
the review base (`git diff --exit-code` exit 0 for each):

- `design-system/theme.css`;
- `tsconfig.json` and `vite.config.ts`;
- `web/src/app/` and `web/src/api/`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | SATISFIED | `web/src/components/ui/badge.tsx:13`, `button.tsx:17,21-25`, `card.tsx:12,36,43,52,58,65,75,82`: every spacing, size, radius, ring and colour class is token-backed (spacing 1-8 to `--space-*`, `text-*` to `--text-*`, `rounded` to `--radius`, `ring` to `--focus-ring-width`, colours to `hsl(var(--token))`). No source contains a length, hex or colour-function literal | `token-literals.test.ts:190-197` scans the 12 non-test sources under `web/src/components/`. Class tests: `badge.test.tsx:89-95`, `button.test.tsx:74-85`, `card.test.tsx:16-37,66-82` | The four v1 IR-003 survivors are killed. Unpinned test gaps on unchanged lines remain: IR-004 and IR-005 (`late`, MEDIUM) |
| AC-25 | SATISFIED | `button.tsx:40-57`: `blocked` keeps a native `<button>` in the tab order, sets `aria-disabled="true"`, never sets `disabled`, and replaces `onClick` with `event.preventDefault()`. Base classes carry `focus-visible:ring focus-visible:ring-ring` | `button.test.tsx:22-40`: Tab focus, `aria-disabled`, not natively disabled, accessible description; Enter, Space and click leave both spies uncalled. `:87-99`: focus-visible ring on `default`, `blocked`, `outline`. `:101-115`: `blocked` presentation | The two v1 IR-004 survivors are killed |
| DAC-E1-11 | SATISFIED | `tailwind.config.js:34-54`: exactly the 12 colour keys plus `borderRadius.DEFAULT: "var(--radius)"` and `ringWidth.DEFAULT: "var(--focus-ring-width)"`. Each names its same-named token, declared in `design-system/theme.css`. `theme.css` unchanged | `token-literals.test.ts:84-133`: exact colour-key set, exact radius and ring, same-name binding, exact scale set, declared `var()` in every scale. `shell.tokens.test.tsx` passes unchanged | The three v1 IR-001 survivors are killed. The keys of the six delivered scales are unpinned: IR-002 (`late`, MEDIUM) |
| DAC-E1-12 | SATISFIED | No literal in vendored sources (see AC-26). `package.json` adds only the five approved packages. Licences are recorded in `package-lock.json`; the reviewer checked each against the installed `LICENSE` file (clsx MIT, tailwind-merge MIT, class-variance-authority Apache-2.0, lucide-react ISC, @radix-ui/react-slot MIT) | `vendoring.test.ts:68-97`. The unapproved-dependency mutant (`left-pad`) is killed by two assertions | The no-literal half has the late gaps of IR-003 to IR-005 |
| DAC-E1-S1-1 | SATISFIED | All four `ui/` sources import `./utils` or packages. `tsconfig.json` and `vite.config.ts` are unchanged | `vendoring.test.ts:20-37` (TC-COMP-004). `grep -rn '"@/' web/src/components/ui` finds nothing. `npm run lint` exit 0 | Adequate |
| DAC-E1-S1-2 | SATISFIED | `token-literals.test.ts:140-175`: `SCANNED_DIRECTORIES = ["web/src/components/"]`, `isScannedSource`, `literalsIn` with the story's regexes; zero, `command.tsx`-only `560px` and `layout.ts` allowances (DEC-0296); colour functions over `var(` exempt (Resolved Conflict 1) | `token-literals.test.ts:188-252` (TC-COMP-005), now planting every specified unit (`:210`, `:215-218`) and pinning the DEC-0296 directory (`:199-201`). A planted `px-[12px]` in `badge.tsx` and `text-[#fff]` in `card.tsx` each fail the scan naming the file | The two v1 IR-002 survivors are killed. `.ts` coverage and eight-digit hex are unpinned: IR-003 (`late`, MEDIUM) |
| DAC-E1-S1-3 | SATISFIED | `button.tsx:42-55` | `button.test.tsx:7-50` (TC-COMP-006). Killed: the generated `asChild` negation, the plan's `aria-disabled` and `preventDefault` mutants, and the added-native-`disabled` mutant | Covers DAC-E1-14 (focusable, described by its reason) and DAC-E1-15 (no native `disabled`). `asChild` + `blocked` remains unspecified: IR-006 (LOW) |
| DAC-E1-S1-4 | SATISFIED | `badge.tsx:17-27`: six `status-<tier>` pairs and three `coverage-*` variants on the badge spec section 6 tokens, through the delivered keys. `utils.ts:11-17` keeps `bg-pattern-indeterminate` beside the muted colour | `badge.test.tsx:62-87` (TC-COMP-007), `utils.test.ts:17-25`. The plan's `coverage-present` swap and `bg-image` removal mutants are killed. `shell.tokens.test.tsx` passes | No `--coverage-*` token exists. Resolved Conflict 2 maps coverage to the spec's tokens through the delivered keys. Accepted |
| DAC-E1-S1-5 | SATISFIED | `package.json`: exactly `@radix-ui/react-slot` ^1.5.0, `class-variance-authority` ^0.7.1, `clsx` ^2.1.1, `lucide-react` ^1.70.0 and `tailwind-merge` ^2.6.1 added; `devDependencies` unchanged | `vendoring.test.ts:74-96` (TC-COMP-008). `render.test.tsx` passes, and a planted `dangerouslySetInnerHTML` in `card.tsx` makes it fail | `render.test.tsx` already walks all of `web/src/` (Resolved Conflict 4). `tailwind-merge` is 2.x, as the plan requires for Tailwind 3 |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Reviewer ran `npm run test` at the review base in a scratch clone: 77 files and 2101 tests green | No baseline log persisted by the coder (bookkeeping only); the reviewer's run supplies it |
| T002 | complete | VERIFIED | `token-literals.test.ts:82-134`: assertions (a) to (d) as planned, plus cycle-8's same-name binding (`:105-111`), scale set (`:113-116`) and all-scale `var()` check (`:118-133`) | The plan's `--ring` to `--rng` mutant and v1's three config survivors are killed. Residual gap: IR-002 |
| T003 | complete | VERIFIED | `token-literals.test.ts:136-252`: cases (1) to (8) as planned, plus cycle-8's directory pin and `rem`/`em`/`vh`/`vw` plants | Killed: v1's lookahead, zero-filter, `command`-scope, test-file-exclusion, unit-narrowing and directory mutants. Residual gap: IR-003 |
| T004 | complete | VERIFIED | `vendoring.test.ts`: TC-COMP-004 assertions, and TC-COMP-008 assertions (a) to (c) | Adequate |
| T005 | complete | VERIFIED | `button.test.tsx:7-50` as planned. Additions: an `asChild` test at `:52-61`, and cycle-8's class block at `:64-116` | The `asChild` test is recorded in cycle-6. Residual gap: IR-004 |
| T006 | complete | VERIFIED | `badge.test.tsx:62-105`: independent fixture, config resolution, cycle-8 shape test, no tab stop, no role | Adequate |
| T007 | complete | VERIFIED | `card.test.tsx:16-99`, plus cycle-8's parts test at `:66-82` | Residual gap: IR-005 |
| T008 | complete | VERIFIED | `utils.test.ts:4-26`, plus an object/array case | The plan's `bg-image` mutant is killed |
| T009 | complete | VERIFIED | `package.json` and `package-lock.json`. Reviewer checked each lock licence against `node_modules/<pkg>/LICENSE*` | `npm ci` reports 10 audit advisories. All are in packages that predate this story; none is in the five added or their transitive |
| T010 | complete | VERIFIED | `tailwind.config.js:34-54` | Two comment lines rather than one; immaterial |
| T011 | complete | VERIFIED | `utils.ts:11-22` | Matches plan |
| T012 | complete | VERIFIED | `badge.tsx:12-44`: variants exactly design 2.1's list, `variant` required, base classes token-backed | Matches plan |
| T013 | complete | VERIFIED | `button.tsx:16-60`: five variants, no `size` axis, `Slot` for `asChild`, the `blocked` contract, DAC-E1-15 doc comment | Matches plan |
| T014 | complete | VERIFIED | `card.tsx:12-85`: the DEC-0297 API | Matches plan |
| T015 | complete | VERIFIED | Full suite green: 83 files, 2167 tests. `web/src/app` and `web/src/api` unchanged. The `package.json` diff is exactly five `dependencies` lines | Matches plan |
| T016 | complete | VERIFIED | Reviewer reran lint, format, tsc and build: all exit 0 | Matches plan |
| T017 | complete | VERIFIED | `CAP-003-E1-S1-tdd-evidence.yaml`: eight cycles, all `APPROVED`, no drift. `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. Cycle 8 records the 11 v1 survivors killed (`red-cycle-8-mutants.log`, `mutation-cycle-8-results.json`); the reviewer confirms all 11 killed | Deviation: per-cycle commits instead of `commit_hash: stage`, and the cycle and rework commits carry no `Decision-Id` trailer (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `token-literals.test.ts` "tailwind.config.js keys (DAC-E1-11)" / TC-COMP-003 | ADEQUATE | Exact colour-key set against an independent fixture; exact `borderRadius` and `ringWidth`; `hsl(var(--x) / <alpha-value>)` shape; every colour bound to its same-named token; exact `theme.extend` scale set against an independent list; every `var()` in every scale declared in `theme.css`. Killed: `primary` to `--secondary`, `status-foreground` to `--foreground`, the new `boxShadow` scale, `--ring` to `--rng` | `late`: the key sets of `spacing`, `fontSize`, `height`, `fontFamily`, `maxWidth` and `backgroundImage` are unpinned, and a value with no `var()` passes the token check (IR-002) |
| `token-literals.test.ts` "literal scan (AC-26, DAC-E1-S1-2)" / TC-COMP-005 | ADEQUATE | Real, non-vacuous walk over the scanned directories; `web/src/components/` pinned as a scanned directory while appending still passes; directory existence; planted `px`, `rem`, `em`, `vh`, `vw`, `#fff`, `rgb(`, `hsl(`, `rgba(`; zero allowance; `560px` scoped to `command.tsx`; `layout.ts`; `hsl(var(` exemption; test-file exclusion | `late`: no positive `.ts` case for `isScannedSource`, and no eight-digit hex is planted (IR-003) |
| `vendoring.test.ts` / TC-COMP-004 | ADEQUATE | No `@/` import in any non-test `ui/` source (non-vacuous); no `paths` or `baseUrl`; no `alias` in `vite.config.ts` | None |
| `vendoring.test.ts` / TC-COMP-008 | ADEQUATE | The five packages are present; every dependency is approved or `@radix-ui/react-*`; each lock licence equals an independent map | None. The "exactly five" half is a diff check, verified by the reviewer |
| `button.test.tsx` / TC-COMP-006 | ADEQUATE | Real Tab focus; `aria-disabled`; `data-variant`; not natively disabled; accessible description; Enter, Space and click inside a form leave both spies uncalled; default-variant control; `asChild` link. Cycle 8 adds: `rounded px-3 py-2 text-base` with no `rounded-`, `h-<n>` or `ring-<n>`/`ring-offset` on `default`, `blocked` and `outline`; the focus-visible ring trio on each; the `blocked` presentation and the `default` primary classes | `late`: `secondary` and `ghost` classes are unpinned, and no fractional-class guard (IR-004) |
| `badge.test.tsx` / TC-COMP-007 | ADEQUATE | Every variant's colour classes against an independent fixture; each class's key bound to its expected token in the config and declared in `theme.css`; base `rounded px-2 py-1 text-xs font-semibold` with no `rounded-` or fractional class; no tab stop; no role | None found |
| `card.test.tsx` (T007, no TC-ID) | ADEQUATE | `data-variant` per variant and the default; root token classes, no `shadow`, no `rounded-*`; `h2` at `text-lg`; `font-numeric text-2xl`; `dl` with term and definition; header `space-y-1 p-6`; no fractional class on header, content, footer or list; no tab stop | `late`: `CardTitle` accepts added shipped literals, and part spacing off the `--space-*` scale passes when not fractional (IR-005) |
| `utils.test.ts` (T008) | ADEQUATE | twMerge active; clsx active (including object and array); pattern and colour both kept; colour conflicts still merge | None |
| `shell.tokens.test.tsx`, `render.test.tsx` (delivered, unchanged) | ADEQUATE | Spacing, fontSize and height scales are `var()`-only; no `dangerouslySetInnerHTML` under `web/src/` | None for this story's scope |

The new tests are deterministic. They use no timers, network or environment, and `classesOf`
unmounts each render. Each one asserts observable classes or attributes on the rendered element,
not mock setup.

**Mutation run (E.9).**

1. `generate` over `2fc2d1e..HEAD` produced the same 2 catalogue mutants as v1.
2. The reviewer added 9 hand-written mutants (`review-v2-*`).
3. `scope --since cf06907 --previous <v1 mutation.json>` re-added v1's 26 manual mutants. That
   gives 37 mutants: 28 `carried` and 9 `late`. No v1 mutant failed to apply.
4. `run` used 4 jobs. The command was
   `ln -sfn <repo>/node_modules node_modules && npx vitest run src/components src/api/render.test.tsx src/app/shell.tokens.test.tsx && npx tsc --noEmit`.

All four baselines were green. Every survivor's log shows 15 files and 321 tests passing, and
`tsc` passing. The results are in `CAP-003-E1-S1-implementation-review-v2-mutation.json` beside
this report.

| Mutant | Scope | State | Equivalence judgement |
|--------|-------|-------|-----------------------|
| `button.tsx:40:negate-boolean:1` (`asChild = true`) | carried | killed | n/a |
| `card.tsx:14:drop-defaulted-argument:1` (drop `metric`) | carried | killed | n/a (`tsc` TS2322) |
| `button.tsx:manual:plan-1` (`aria-disabled={undefined}`) | carried | killed | n/a |
| `button.tsx:manual:plan-2` (no `preventDefault`) | carried | killed | n/a |
| `badge.tsx:manual:plan-1` (`coverage-present` to missing tokens) | carried | killed | n/a |
| `utils.ts:manual:plan-1` (`"bg-image": []`) | carried | killed | n/a |
| `tailwind.config.js:manual:plan-1` (`--ring` to `--rng`) | carried | killed | n/a |
| `card.tsx:manual:plan-1` (`h2` to `h3`) | carried | killed | n/a |
| `tailwind.config.js:manual:review-1` (`primary` to `--secondary`) | carried | killed | n/a (v1 survivor; "binds every colour key to the token of the same name") |
| `tailwind.config.js:manual:review-2` (`status-foreground` to `--foreground`) | carried | killed | n/a (v1 survivor; same assertion) |
| `tailwind.config.js:manual:review-3` (new `boxShadow.DEFAULT: var(--shadow)`) | carried | killed | n/a (v1 survivor; scale set and declared-token assertions) |
| `token-literals.test.ts:manual:review-5` (units narrowed to `px`) | carried | killed | n/a (v1 survivor; the `rem`, `em`, `vh`, `vw` plants) |
| `token-literals.test.ts:manual:review-6` (scan only `ui/`) | carried | killed | n/a (v1 survivor; "scans web/src/components/ as a whole") |
| `badge.tsx:manual:review-1` (`rounded-full px-2.5 py-0.5`) | carried | killed | n/a (v1 survivor; badge shape test) |
| `button.tsx:manual:review-1` (`rounded-md h-10`) | carried | killed | n/a (v1 survivor; "sizes and rounds" on three variants) |
| `button.tsx:manual:review-2` (`ring-2 ring-offset-2`) | carried | killed | n/a (v1 survivor; focus-ring trio and `ring-\d` guard) |
| `button.tsx:manual:review-3` (no focus ring) | carried | killed | n/a (v1 survivor; focus-ring trio) |
| `button.tsx:manual:review-4` (`blocked` styled as primary) | carried | killed | n/a (v1 survivor; `blocked` presentation test) |
| `card.tsx:manual:review-1` (`space-y-1.5`) | carried | killed | n/a (v1 survivor; parts test) |
| `badge.tsx:manual:review-2` (planted `px-[12px]`) | carried | killed | n/a |
| `card.tsx:manual:review-2` (planted `text-[#fff]`) | carried | killed | n/a |
| `card.tsx:manual:review-3` (planted `dangerouslySetInnerHTML`) | carried | killed | n/a (`render.test.tsx`) |
| `button.tsx:manual:review-5` (native `disabled` on `blocked`) | carried | killed | n/a |
| `package.json:manual:review-1` (unapproved `left-pad`) | carried | killed | n/a |
| `token-literals.test.ts:manual:review-1` (drop `(?!\s*var\()`) | carried | killed | n/a |
| `token-literals.test.ts:manual:review-2` (negate zero allowance) | carried | killed | n/a |
| `token-literals.test.ts:manual:review-3` (`560px` allowed everywhere) | carried | killed | n/a |
| `token-literals.test.ts:manual:review-4` (test files scanned) | carried | killed | n/a |
| `tailwind.config.js:manual:review-v2-1` (adds `maxWidth.dialog: "var(--measure-prose)"`) | late | survived | Not equivalent. TC-COMP-003 Expected Result: "Only `primary`, ... `borderRadius.DEFAULT` and `ringWidth.DEFAULT` are added". DAC-E1-11: the config "MUST gain only the keys the vendored components reference" (IR-002) |
| `tailwind.config.js:manual:review-v2-2` (adds `maxWidth.dialog: "35rem"`) | late | survived | Not equivalent. DAC-E1-11 requires each key to resolve "to a token `theme.css` already defines"; component design 2.2 requires every scale to resolve to a custom property. The token check reads only `var()` references, and `shell.tokens.test.tsx` reads only `spacing`, `fontSize` and `height` (IR-002) |
| `token-literals.test.ts:manual:review-v2-1` (`isScannedSource` matches `.tsx` only) | late | survived | Not equivalent. DAC-E1-S1-2: "a non-test `.ts` or `.tsx` source"; T003 and DEC-0296 fix `isScannedSource` as `.ts`/`.tsx`. Under the mutant, `utils.ts` and every later `.ts` module leave the AC-26 scan (IR-003) |
| `token-literals.test.ts:manual:review-v2-2` (`HEX_LITERAL` `{3,8}` to `{3,6}`) | late | survived | Not equivalent. DAC-E1-S1-2 specifies `#[0-9a-fA-F]{3,8}\b`. Under the mutant, an eight-digit colour such as `#00000080` passes the scan (IR-003) |
| `card.tsx:manual:review-v2-1` (`CardTitle` gains `leading-none tracking-tight`) | late | survived | Not equivalent. T014 names shipped `text-2xl leading-none tracking-tight` as replaced. `tracking-tight` is Tailwind's default `-0.025em` letter spacing, a literal outside the theme (AC-26) (IR-005) |
| `card.tsx:manual:review-v2-2` (`CardSummaryList` `gap-x-4` to `gap-x-10`) | late | survived | Not equivalent. AC-26, and DEC-0297/T014 fix `gap-x-4 gap-y-2`. The config maps spacing 1-8 only, so `gap-x-10` resolves to Tailwind's default `2.5rem` (IR-005) |
| `button.tsx:manual:review-v2-1` (`secondary` styled `bg-primary text-primary-foreground`) | late | survived | Not equivalent. Button spec section 6 puts `secondary` on `--secondary` / `--secondary-foreground`. Sections 2 and 8 allow one `default` per region. T013 fixes the classes (IR-004) |
| `button.tsx:manual:review-v2-2` (`ghost` gains `h-10 w-10`, shadcn's `icon` size) | late | survived | Not equivalent. AC-26, and T013 names `h-10` as replaced. The height scale extends only 1-8 and `row`, so `h-10` and `w-10` resolve to Tailwind's default `2.5rem` (IR-004) |
| `button.tsx:manual:review-v2-3` (base `gap-2` to `gap-1.5`) | late | survived | Not equivalent. AC-26, and T013 fixes `gap-2`. `gap-1.5` is Tailwind's default `0.375rem`, outside `--space-*`. It applies to every variant (IR-004) |

## Independent Validation

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<component>` is `repos/factorflow-v2/FactorFlow-v2` under it. The npm commands were run with
`--prefix <component>`, so their working directory is the component root, as the tech stack's
working directory `.` requires.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261107T234031Z` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir <component> --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261107T234031Z` | harness root | 0 | PASS | `2fc2d1e18a4e8c1e43ad153d5b809658d7c541ef` |
| `git -C <component> merge-base --is-ancestor 2fc2d1e1 HEAD` | harness root | 0 | PASS | The review base is an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir <component> --base 2fc2d1e1... --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (eight cycles) |
| `npm ci --prefix <component>` | component root | 0 | PASS | 256 packages added. 10 audit advisories, all in packages that predate this story |
| `npm run --prefix <component> test` | component root | 0 | PASS | 83 files, 2167 tests. The base has 77 files and 2101 tests, so this story adds 6 files and 66 tests (16 of them in cycle 8) |
| `npm run --prefix <component> lint` | component root | 0 | PASS | Biome: 190 files, no findings |
| `npm run --prefix <component> format` | component root | 0 | PASS | Biome: 190 files, no changes |
| `npx --prefix <component> tsc --noEmit -p <component>/tsconfig.json` | component root | 0 | PASS | No output |
| `npm run --prefix <component> build` | component root | 0 | PASS | 102 modules. Writes only ignored files under `src/factorflow/api/static/` |
| `git -C <component> diff --exit-code 2fc2d1e1 HEAD -- design-system/theme.css` | harness root | 0 | PASS | DAC-E1-11: no token added |
| `git -C <component> diff --exit-code 2fc2d1e1 HEAD -- tsconfig.json vite.config.ts web/src/app web/src/api` | harness root | 0 | PASS | DAC-E1-S1-1, T015 |
| `grep -rn '"@/' <component>/web/src/components/ui` | harness root | 1 | PASS | No match (DAC-E1-S1-1) |
| `git -C <component> diff 2fc2d1e1 HEAD -- package.json`, plus lock entries and `node_modules/<pkg>/LICENSE*` | harness root | 0 | PASS | Exactly five `dependencies` added; `devDependencies` unchanged; lock licences match each `LICENSE` file (DAC-E1-S1-5) |
| Planted literal in a scanned file: `px-[12px]` in `badge.tsx`, `text-[#fff]` in `card.tsx`, run as carried mutants in clones | mutation clones | 1 | PASS | The scan fails, naming each file (DAC-E1-S1-2 story-specific check) |
| Planted `dangerouslySetInnerHTML` in `card.tsx`, run as a carried mutant | mutation clones | 1 | PASS | `render.test.tsx` fails (DAC-E1-S1-5 story-specific check) |
| `git -C <component> diff --exit-code cf06907 HEAD -- tailwind.config.js package.json package-lock.json web/src/components/ui/utils.ts web/src/components/ui/badge.tsx web/src/components/ui/button.tsx web/src/components/ui/card.tsx` | harness root | 0 | N/A | Scope evidence: no production line changed since the baseline |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 2fc2d1e1..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 2 catalogue mutants; the reviewer appended 9 manual mutants |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-with-manual.json --since cf0690796b2f... --previous <v1 mutation.json> --out <scratch>/mutants.json` | harness root | 0 | N/A | 37 mutants: 28 `carried`, 9 `late`; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command '<focused suites + tsc>' --out <scratch>/review-v2-results.json` | harness root | 3 | N/A | 28 killed (every carried mutant), 9 survived (every late mutant); see the table above |
| `npm run --prefix <scratch>/base-clone test` (review base `2fc2d1e1`) | scratch clone | 0 | PASS | 77 files, 2101 tests: the T001 baseline |
| `python3 scripts/pipeline-state.py code-revision --repo-dir <component>` | harness root | 0 | N/A | `sha256:46112d91ebdd076b52415d9577721305a00a24be8c7d3302eb29f44d2adc9d2f` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | N/A | `sha256:6fe60839989e9103d29fd7a4313faa90e19667db66f0caf79d95d4a0391167aa` (unchanged since v1) |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | component root | N/A | NOT RUN | No Python file changed. Neither the story's validation list nor the task plan's includes them |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the task plan's validation list. The plan records that the story owns no integration or E2E case. The suite needs PostgreSQL and Playwright browsers |

The Gate Summary counts 13 required validation entries, and all pass:

- the six tech-stack frontend commands: `npm ci`, test, lint, format, tsc and build;
- the TDD-evidence lint;
- six story-specific checks: theme diff, untouched-files diff, alias grep, package and licence
  diff, planted literal, and planted raw HTML.

No command was refused by the sandbox, so none needed a retry outside it.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-003-E1-S1-run-20261107T234031Z` at `5c9731ec66eb1c519fe5c38ad35c11c09c8d3f94`. No staged, unstaged or untracked non-ignored files. Ignored `node_modules/` and build output under `src/factorflow/api/static/` were present.
- **After.** Same HEAD, and still no staged, unstaged or untracked non-ignored files.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - Mutants and the base-commit run ran only in clones under the reviewer's scratch directory.
- **Unexpected tracked-file changes.** None.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 1 · **total 6**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | carried | Decision-derived work sits in commits without its `Decision-Id` trailer |
| IR-002 | MEDIUM | late | TC-COMP-003 leaves the keys of the delivered scales unpinned and passes a value with no `var()` |
| IR-003 | MEDIUM | late | The literal scan's `.ts` coverage and eight-digit hex pattern are unpinned |
| IR-004 | MEDIUM | late | `button`'s class contract is pinned on three of its five variants, without a fractional-class guard |
| IR-005 | MEDIUM | late | `card` part classes beyond the root and header are unpinned against literal-backed classes |
| IR-006 | LOW | carried | `blocked` with `asChild` does not suppress a handler on the child element |

### IR-001 — Decision-derived work sits in commits without its `Decision-Id` trailer

- **Severity**: MEDIUM
- **Scope**: carried (v1/IR-005; the rework commits repeat it)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T017
- **Files**: Commits carrying decision work without a trailer:
  - `5757ae4` ("WIP cycle-2 (temporary)", the DEC-0296 scan interface);
  - `ccfdd8d` ("WIP cycle-3 (temporary)", the DEC-0298 licence check);
  - `822077d` (cycle 7, the DEC-0297 `card` API);
  - `1768887` (cycle 8, adds `it("scans web/src/components/ as a whole (DEC-0296)")`);
  - `5c9731e` (the rework's evidence commit).

  `e36f7b8` still reads "WIP cycle-1 (temporary; squashed before stage commit)".
- **Claim challenged**: T017 says every cycle records `commit_hash: stage` and no per-cycle commit
  is planned. The rework commit says IR-005 "needs a history rewrite, which a unit may not do;
  left for the owner".
- **Observed evidence**: `git log 2fc2d1e..HEAD` shows a `Decision-Id` trailer only on
  `cf06907`, which holds the evidence, task ticks and story status. `scripts/sdd decisions show
  DEC-0297 --project factorflow-v2` lists `cf0690796` as this story's only commit carrying it.
  `822077d` is not listed, though it adds `card.tsx`. The pre-rework cycle commits do need a
  history rewrite. The rework commits do not: `1768887` adds DEC-0296-derived test code, and
  neither it nor `5c9731e` carries a trailer.
- **Expected evidence/behavior**: `docs/decision-records.md`, *The commit trailer*: "Every commit
  made under a decision carries a git trailer". `$pipeline-run` rule 7: "When a stage ran under a
  recorded decision, its commit carries that decision's `Decision-Id:` trailer ... An untrailed
  commit is unrevertable".
- **Impact**: v1 said all three decisions were provisional and awaiting the owner. That was out
  of date when v1 was written: `projects/factorflow-v2/decisions/DEC-0296.md`, `DEC-0297.md` and
  `DEC-0298.md` record `owner_reviewed: true`, `owner_verdict: upheld` (blind review, owner
  decided 2026-11-07T15:42Z). A revert is therefore unlikely. If one ever happens,
  `sdd decisions revert` would revert only `cf06907` and leave the implementing code and tests in
  place. The "temporary; squashed" commit messages still misdescribe the history.
- **Required remediation**: Before this branch is merged, make every commit that carries
  DEC-0296, DEC-0297 or DEC-0298 work carry its trailer, and keep the commit messages accurate
  about the history. This is the owner's or the driver's history operation; it is not a code
  change. Future rework commits made under these decisions should carry the trailer when they are
  made.

### IR-002 — TC-COMP-003 leaves the keys of the delivered scales unpinned and passes a value with no `var()`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-11, AC-26
- **Tasks**: T002
- **Files**: `web/src/components/token-literals.test.ts:84-133`; `tailwind.config.js:55-101`
- **Claim challenged**: TC-COMP-003 Expected Result: "Only `primary`, ..., `borderRadius.DEFAULT`
  and `ringWidth.DEFAULT` are added; Every key resolves to a token `theme.css` already defines".
- **Observed evidence**: The test pins the colour-key set, `borderRadius`, `ringWidth` and the
  set of `theme.extend` scales. It does not pin the keys within `spacing`, `fontSize`, `height`,
  `fontFamily`, `maxWidth` or `backgroundImage`. Its token check (`:118-133`) inspects only
  `var(--x)` references, so a value with none passes. Two mutants survive with 321 tests passing:
  - `tailwind.config.js:manual:review-v2-1` adds `maxWidth.dialog: "var(--measure-prose)"`;
  - `:review-v2-2` adds `maxWidth.dialog: "35rem"`.

  The delivered `shell.tokens.test.tsx` reads only `spacing`, `fontSize` and `height`.
- **Expected evidence/behavior**: DAC-E1-11 says `tailwind.config.js` "MUST gain only the keys
  the vendored components reference, each resolving to a token `theme.css` already defines".
  Component design 2.2 says every scale resolves to a custom property.
- **Impact**: A later story could add an unreviewed key to a delivered scale, or a literal to
  `maxWidth`, `fontFamily` or `backgroundImage`, and the AC-26 check would stay green. The
  delivered configuration has neither today. This is a test-strength gap on lines unchanged since
  v1, which v1 could equally have raised.
- **Required remediation**: Make both mutants fail. Pin the key set of every extended scale, or
  pin the added keys against an independent list, and require every value in every scale to be a
  token reference.

### IR-003 — The literal scan's `.ts` coverage and eight-digit hex pattern are unpinned

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-2, AC-26
- **Tasks**: T003
- **Files**: `web/src/components/token-literals.test.ts:151` (`HEX_LITERAL`), `:156-158`
  (`isScannedSource`), `:209-221` (planted cases), `:246-251` (file-type cases)
- **Claim challenged**: TC-COMP-005 and DAC-E1-S1-2: the scan fails on any `#[0-9a-fA-F]{3,8}\b`
  literal "in a non-test `.ts` or `.tsx` source".
- **Observed evidence**: Two mutants survive:
  - `token-literals.test.ts:manual:review-v2-1` narrows `isScannedSource` to `.tsx`. The
    file-type test asserts a positive only for `planted.tsx`. `utils.ts` drops out of the walk,
    and the walk still passes.
  - `:review-v2-2` narrows `HEX_LITERAL` to `{3,6}`. The only planted hex is `#fff`.
- **Expected evidence/behavior**: DAC-E1-S1-2 specifies both the `.ts`/`.tsx` sources and
  `#[0-9a-fA-F]{3,8}\b`. T003 and DEC-0296 fix `isScannedSource` as `.ts`/`.tsx`, not
  `*.test.ts(x)`.
- **Impact**: Every later screen story widens this scan. Two regressions would pass with the
  suite green: an edit that stops reading `.ts` modules (layout constants, formatters, `cn()`
  helpers), and one that stops seeing `#RRGGBBAA` colours. The current sources have no such
  literal.
- **Required remediation**: Make both mutants fail. Add a positive `.ts` case for
  `isScannedSource` and an eight-digit hex planted case.

### IR-004 — `button`'s class contract is pinned on three of its five variants, without a fractional-class guard

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-26, AC-25
- **Tasks**: T005 (T013)
- **Files**: `web/src/components/ui/button.tsx:17` (base `gap-2`), `:22` (`secondary`), `:24`
  (`ghost`); `web/src/components/ui/button.test.tsx:64-116`
- **Claim challenged**: Cycle 8 says "badge, button and card part classes are pinned against the
  shipped Tailwind literals".
- **Observed evidence**: The class tests iterate `default`, `blocked` and `outline` only. They
  guard against `rounded-`, `h-<n>` and `ring-<n>`/`ring-offset`, but not against fractional
  spacing; `badge.test.tsx:94` and `card.test.tsx:80` do guard against it. Three mutants survive:
  - `button.tsx:manual:review-v2-1` restyles `secondary` as `bg-primary text-primary-foreground hover:bg-primary/90`;
  - `:review-v2-2` gives `ghost` shadcn's `icon` size, `h-10 w-10`;
  - `:review-v2-3` changes the base `gap-2` to `gap-1.5`.
- **Expected evidence/behavior**: Button spec section 6: `secondary` on `--secondary` /
  `--secondary-foreground`. Sections 2 and 8: one `default` per screen region. T013 fixes each
  variant's classes and names `h-10` as replaced. AC-26: no size or spacing literal outside the
  theme.
- **Impact**: Three regressions would pass with the suite green:
  - a supporting action could render as a second primary;
  - icon-only `ghost` buttons could take Tailwind's literal `2.5rem`;
  - every button's icon gap could leave the `--space-*` scale.

  The shipped shadcn `secondary` and `ghost` carry no literal, so the v1 IR-003 mutants did not
  reach these lines.
- **Required remediation**: Make the three mutants fail. Pin the `secondary` and `ghost` classes,
  and apply the fractional-class guard to the button's classes.

### IR-005 — `card` part classes beyond the root and header are unpinned against literal-backed classes

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T007 (T014)
- **Files**: `web/src/components/ui/card.tsx:43` (`CardTitle`), `:82` (`CardSummaryList`);
  `web/src/components/ui/card.test.tsx:44-47`, `:66-82`
- **Claim challenged**: The cycle-8 test "spaces and pads every part from the spacing tokens,
  never a fractional literal".
- **Observed evidence**: Two mutants survive:
  - `card.tsx:manual:review-v2-1` adds shadcn's `leading-none tracking-tight` to `CardTitle`. The
    title test asserts only `text-lg`.
  - `:review-v2-2` changes `CardSummaryList` `gap-x-4` to `gap-x-10`. The parts test rejects
    only fractional classes on content, footer and list, and `gap-x-10` is not fractional.
- **Expected evidence/behavior**: T014 names the shipped `text-2xl leading-none tracking-tight`
  as replaced. DEC-0297 and T014 fix `CardSummaryList` at `gap-x-4 gap-y-2`. AC-26: no spacing
  or size literal outside the theme. `tracking-tight` is `-0.025em` and `gap-x-10` is `2.5rem`,
  both Tailwind defaults.
- **Impact**: Re-vendoring could bring back shadcn's title letter-spacing, or move part spacing
  off the `--space-*` scale, with the suite green. The CAP-003-E4-S4 summary card and the E5 to E7
  card consumers would inherit it.
- **Required remediation**: Make both mutants fail. Pin `CardTitle` against the shipped literal
  classes, and pin the part spacing classes to the token scale, not only against fractional
  values.

### IR-006 — `blocked` with `asChild` does not suppress a handler on the child element

- **Severity**: LOW
- **Scope**: carried (v1/IR-006)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-3 (edge, unspecified combination)
- **Tasks**: T013
- **Files**: `web/src/components/ui/button.tsx:41-55`; Radix `Slot` `mergeProps` calls the
  child's handler, then the slot's
- **Claim challenged**: A `blocked` button "fires no handler on activation".
- **Observed evidence**: `button.tsx` is unchanged since v1 (`git diff --exit-code cf06907 HEAD`
  exit 0). v1's probe therefore still holds: `<Button asChild variant="blocked"><a href="#x"
  onClick={spy}>` called `spy` once. A react-router `Link` child with no handler of its own did
  not navigate. The rework did not address it, as its commit message states.
- **Expected evidence/behavior**: DAC-E1-S1-3 covers `button` `blocked`. No artifact specifies
  `blocked` together with `asChild`.
- **Impact**: No current or planned caller is known to combine them. If one does, a handler on
  the child still runs on a "blocked" control.
- **Required remediation**: Optional. Either document that `blocked` applies to native buttons
  only, or suppress (or type-forbid) child handlers under `blocked` with `asChild`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `token-literals.test.ts:105-111` (same-name binding), `:113-116` (exact scale set), `:118-133` (declared `var()` in every scale). Carried mutants `tailwind.config.js:manual:review-1`, `-2` and `-3` are killed by those assertions. The residual delivered-scale gap is new and `late`: IR-002 |
| v1/IR-002 | RESOLVED | `token-literals.test.ts:199-201` (directory pin) and `:215-218` (`rem`, `em`, `vh`, `vw` plants). Carried mutants `token-literals.test.ts:manual:review-5` and `-6` are killed. The residual `.ts` and eight-digit hex gap is new and `late`: IR-003 |
| v1/IR-003 | RESOLVED | `badge.test.tsx:89-95`, `button.test.tsx:74-85` and `card.test.tsx:66-82` kill the four named carried mutants: `badge.tsx:manual:review-1`, `button.tsx:manual:review-1` and `-2`, and `card.tsx:manual:review-1`. Every shipped literal the v1 mutants restored is pinned, as is the shipped button size and ring. The new survivors are on lines v1 did not mutate and are `late`: IR-004 and IR-005 |
| v1/IR-004 | RESOLVED | `button.test.tsx:87-99` (focus-visible ring trio on three variants) and `:101-115` (`blocked` presentation; `default` primary). Carried mutants `button.tsx:manual:review-3` and `-4` are killed |
| v1/IR-005 | STILL OPEN | Now IR-001. No commit before `cf06907` gained a trailer, and the rework commits `1768887` and `5c9731e` carry none |
| v1/IR-006 | STILL OPEN | Now IR-006. `button.tsx` is unchanged since v1 |

## Scope and Plan Deviations

- **Re-review scope.** All scope tags come from git and `mutation-run.py scope`:
  - 28 `carried` mutants, all killed;
  - 9 `late` mutants, all surviving, all on production or scan lines unchanged since
    `cf06907`;
  - no `delta` mutant, because the rework changed no production line.

  The v1 remediation text for IR-001 and IR-003 was worded more broadly than the mutants it named.
  The reviewer judged both resolved: every named survivor is killed and the claim each challenged
  is now pinned. New survivors on unchanged lines are classed `late`, as skill H prescribes ("It
  does not block on a gap the baseline could have found just as well"). They are reported as
  IR-002 to IR-005, not as v1 findings still open.
- **Justified deviations.**
  - T005 adds an `asChild` render test and a class block beyond the plan.
  - T006 and T007 add class-contract tests. T002 and T003 add assertions beyond (a) to (d) and
    cases (1) to (8). All of these are recorded in cycle 8 as v1 rework.
  - T008 adds an object/array `cn()` case.
  - T010 adds two comment lines where the plan said one.
  - `render.test.tsx` is not edited (Resolved Conflict 4).
  - `badge` colours resolve through the delivered keys (Resolved Conflict 2).
- **Bookkeeping.**
  - T001 left no persisted baseline log. The reviewer reran the suite at the review base: 77
    files and 2101 tests green.
  - The cycle commits deviate from T017's `commit_hash: stage`, and no cycle or rework commit
    carries its decisions' trailer (IR-001).
  - The task plan's frontmatter gained `last_reworked_review`, as the rework hand-off requires.
- **Out-of-scope changes.** None.
- **Decisions recorded by this review.** None. Every judgement above derives from the story, the
  task plan, the referenced designs, DEC-0296 to DEC-0298 and the gate rules, including the
  re-review scope rule. No question arose that only the owner could answer.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E1-S1 with this report. Its `review_base`
  (`2fc2d1e18a4e8c1e43ad153d5b809658d7c541ef`) and `reviewed_head` (`5c9731e`) define the change
  set.
  - Before the branch is merged, the owner or driver should resolve IR-001 in the branch history.
  - IR-002 to IR-005 are test-only hardening and can go to a later rework or story. The 9 late
    survivors in `CAP-003-E1-S1-implementation-review-v2-mutation.json` are the acceptance check
    for that hardening.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005, IR-006
