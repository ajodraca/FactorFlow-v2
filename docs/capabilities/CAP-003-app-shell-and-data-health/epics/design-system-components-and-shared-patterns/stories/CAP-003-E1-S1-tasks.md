---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T05:48:56Z
  source_artifacts:
    - id: CAP-003-E1-S1
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E1-S1 — Vendoring Foundation: cn, Tailwind Token Keys, badge, button, card and the AC-26 Literal Scan

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Lays the first stone of the `ui-components` layer (component design 2.1, 2.2): `web/src/components/ui/utils.ts` (`cn()`, clsx plus tailwind-merge), and the vendored shadcn/ui `badge`, `button` and `card` in `web/src/components/ui/`, copied with `@/` imports rewritten to relative paths and every class that resolves to a Tailwind default literal replaced by a token-backed class, so that no surface built from them carries a spacing, size or colour literal of its own (AC-26). `tailwind.config.js` gains exactly the twelve colour keys plus `borderRadius.DEFAULT` and `ringWidth.DEFAULT` of DAC-E1-11, each bound to a token `design-system/theme.css` already defines. `package.json` gains the five packages these components need (`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `@radix-ui/react-slot`), each with its licence verified and recorded. The story also writes the AC-26 automated check `web/src/components/token-literals.test.ts`, which every later screen story widens, and pins `button` `blocked` as the focusable, `aria-disabled`, reason-described, inert control every gated action in CAP-003 relies on (AC-25).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-26 | Every surface built from design-system components, theme tokens only, no spacing, size or colour literal outside the theme | T002, T003, T004, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016 |
| AC-25 | Every operation completable by keyboard; this story delivers the `button` `blocked` contract | T005, T013, T016 |
| DAC-E1-11 | `tailwind.config.js` gains only the listed keys, each `hsl(var(--token) / <alpha-value>)` (or `var(--token)`) resolving to an existing `theme.css` token; `shell.tokens.test.tsx` keeps passing | T002, T010, T015 |
| DAC-E1-12 | No literal in a vendored component; no dependency beyond the ten confirmed packages and `@radix-ui/react-*`, each with its licence recorded | T003, T004, T009, T012, T013, T014, T015 |
| DAC-E1-14 | `button` `blocked` remains focusable and is described by its reason | T005, T013 |
| DAC-E1-15 | `button` `disabled` not used where a precondition gates an action | T005, T013 |
| DAC-E1-S1-1 | `@/` imports rewritten to relative paths; no `tsconfig.json` / `vite.config.ts` alias; `npm run lint` passes on the vendored files | T004, T011, T012, T013, T014, T016 |
| DAC-E1-S1-2 | `token-literals.test.ts` fails on any length, hex, `rgb(` or `hsl(` literal in a non-test source under the scanned directories, allowing only `0`, the `command` 560 px width and `web/src/app/layout.ts`, and exports the scanned-directory list | T003, T015 |
| DAC-E1-S1-3 | `button` `blocked` with a reason: focusable, `aria-disabled`, reason through `aria-describedby`, no handler fires | T005, T013 |
| DAC-E1-S1-4 | `badge` `status-<tier>` and `coverage-*` colours resolve to their tokens through Tailwind keys; `shell.tokens.test.tsx` still passes | T006, T008, T010, T012, T015 |
| DAC-E1-S1-5 | Exactly the five packages, each with its licence; `render.test.tsx` passes over `web/src/components/` | T004, T009, T015 |

Mapped test cases (from `tests/component/ui-components-tests.md`, confirmed in `tests/coverage-matrix.md` lines 76-82 and the AC-25 / AC-26 rows): **TC-COMP-003** (DAC-E1-11), **TC-COMP-004** (DAC-E1-S1-1), **TC-COMP-005** (DAC-E1-S1-2), **TC-COMP-006** (DAC-E1-S1-3, DAC-E1-14, DAC-E1-15), **TC-COMP-007** (DAC-E1-S1-4), **TC-COMP-008** (DAC-E1-S1-5, DAC-E1-12). The other cases on the AC-25, AC-26 and DAC-E1-12 / DAC-E1-14 rows (TC-COMP-009 to 019, 033, 034, 072 onwards) belong to sibling and later stories. No integration or end-to-end case is owned by this story. The test specification is `status: draft`; its steps are used as written and sharpened in Phase 2.

## Phase 1: Setup

**Purpose**: Record the delivered baseline the story must keep green.

- [ ] T001 From the repo root run `npm ci` and `npm run test` and record that the delivered `web/src/app/shell.tokens.test.tsx`, `web/src/api/render.test.tsx` and the CAP-002 `web/src/components/patterns/*.test.tsx` pass before any change (baseline for T015; traces to AC-26)

**Checkpoint**: Baseline suite green; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the vendoring, token and `blocked` contracts before any production change.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-003 (tailwind.config.js gains only the vendored keys bound to existing tokens) as a `describe("tailwind.config.js keys (DAC-E1-11)")` block in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-003` comment. Load the config by dynamic `import()` of the repo-root `tailwind.config.js` (as `web/src/app/shell.tokens.test.tsx` does; Vitest's root is `web/`, so resolve from `import.meta.url`), and read `design-system/theme.css` as text. Assert: (a) `Object.keys(theme.extend.colors).sort()` equals an independent literal fixture of the 25 delivered keys plus `primary`, `primary-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `muted`, `ring`, `destructive`, `destructive-foreground`, `status-foreground`, `seq-1` (37 keys, nothing else); (b) `theme.extend.borderRadius` equals `{ DEFAULT: "var(--radius)" }` and `theme.extend.ringWidth` equals `{ DEFAULT: "var(--focus-ring-width)" }`; (c) every value in `colors` matches `^hsl\(var\(--[\w-]+\) \/ <alpha-value>\)$`; (d) every `var(--name)` referenced by any value in `colors`, `borderRadius`, `ringWidth` and `backgroundImage` is declared as `--name:` in `theme.css`, collecting offenders as `"<scale>.<key> -> --<name>"` and asserting `toEqual([])` so a key naming an undefined token fails naming it (edge case). Step 3 of the TC (the delivered `shell.tokens.test.tsx` passing) is run, not edited, in T015 — kills: swap-case on a token name in `tailwind.config.js` (`--ring` → `--rng` is reported by (d)); off-by-one on the key set (an extra or missing key fails (a))
- [ ] T003 Implement TC-COMP-005 (token-literals test rejects spacing, size and colour literals) in `web/src/components/token-literals.test.ts` (same file as T002, so sequential), with a `// Implements TC-COMP-005` comment, to the interface fixed by DEC-0296 (Open Gap 1): export `SCANNED_DIRECTORIES: readonly string[] = ["web/src/components/"]` (repo-root-relative, trailing slash), a helper `isScannedSource(relPath)` (`.ts`/`.tsx`, not `*.test.ts(x)`) and `literalsIn(relPath, source): string[]` returning `"<relPath>: <match>"` offenders for `\b\d+(\.\d+)?(px|rem|em|vh|vw)\b`, `#[0-9a-fA-F]{3,8}\b` and `\b(rgb|hsl)a?\((?!\s*var\()`, skipping zero-valued lengths, skipping `web/src/app/layout.ts` wholesale, and allowing `560px` only when `relPath` is `web/src/components/ui/command.tsx`. Cases: (1) walking every directory in `SCANNED_DIRECTORIES` recursively finds more than zero scanned files (no vacuous pass) and `literalsIn` over all of them returns `[]` — this passes on the delivered CAP-002 patterns (`factor-cell.tsx`, `inspector-panel.tsx` use `hsl(var(--…))`, which consumes the theme: Resolved Conflict 1); (2) each directory in `SCANNED_DIRECTORIES` exists; (3) planted sources for `web/src/components/ui/planted.tsx` containing `p-[12px]`, `#fff`, `rgb(0 0 0)`, `hsl(210 40% 50%)` and `rgba(0, 0, 0, 0.5)` each return exactly one offender naming `web/src/components/ui/planted.tsx`; (4) `0px` and `m-0` in the planted file return `[]`; (5) `max-w-[560px]` returns `[]` for `web/src/components/ui/command.tsx` and one offender for `web/src/components/ui/badge.tsx`; (6) `width: "208px"` returns `[]` for `web/src/app/layout.ts` and one offender for `web/src/app/shell.tsx`; (7) `hsl(var(--seq-1))` returns `[]`; (8) `isScannedSource("web/src/components/ui/planted.test.tsx")` is false and `isScannedSource("web/src/components/ui/planted.tsx")` true (TC edge: literals in test files ignored) — kills: negate-boolean on the zero allowance (case 3 `12px` vs case 4 `0px`), swap-case on the allowed file (case 5, case 6), remove-attribute on the `(?!\s*var\()` lookahead (cases 1 and 7)
- [ ] T004 [P] Implement TC-COMP-004 (vendored sources use relative imports and lint as first-party code) and TC-COMP-008 (package.json adds exactly the five packages with licences) in a new `web/src/components/ui/vendoring.test.ts`, with `// Implements TC-COMP-004` and `// Implements TC-COMP-008` comments. TC-COMP-004: every non-test `.ts`/`.tsx` file under `web/src/components/ui/` contains no `from "@/` or `import("@/` (offenders listed by file), at least one file is scanned; repo-root `tsconfig.json` (parsed as JSON) has no `compilerOptions.paths` and no `compilerOptions.baseUrl`; repo-root `vite.config.ts` text contains no `alias`. The lint step of the TC is `npm run lint` in T016. TC-COMP-008, under DEC-0298 (Open Gap 3): (a) `package.json` `dependencies` contains `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` and `@radix-ui/react-slot`; (b) every `dependencies` key is in the approved set — `react`, `react-dom`, `react-router-dom` (delivered), the ten tech stack v7 packages (`cmdk`, `sonner`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`) or a name matching `^@radix-ui/react-[a-z-]+$`; (c) for every `dependencies` key, `package-lock.json` `packages["node_modules/<name>"].license` equals an independent literal map: `class-variance-authority` → `Apache-2.0`, `lucide-react` → `ISC`, every other → `MIT` (tech stack v7 Key Libraries). The "exactly five, nothing else" half of the TC is a diff check in T015 — kills: swap-case on a licence (a `tailwind-merge` resolved to a non-MIT build fails (c)); drop-field-copy of a package from `package.json` (fails (a)); an unapproved package fails (b)
- [ ] T005 [P] Implement TC-COMP-006 (button blocked stays focusable, aria-disabled and inert) in a new `web/src/components/ui/button.test.tsx`, with a `// Implements TC-COMP-006` comment, using React Testing Library role queries and `@testing-library/user-event` (system design constraint 13). Render `<form onSubmit={submitSpy}><Button variant="blocked" aria-describedby="r" onClick={clickSpy}>Start download</Button><p id="r">History depth is not set.</p></form>`. Assert: `userEvent.tab()` focuses `getByRole("button", { name: "Start download" })`; it has `aria-disabled="true"`, `data-variant="blocked"`, is `not.toBeDisabled()` (no native `disabled`, DAC-E1-15) and `toHaveAccessibleDescription("History depth is not set.")`; `{Enter}`, `{ }` (Space) and a click each leave `clickSpy` and `submitSpy` uncalled. Control in the same file: `variant="default"` with `onClick` fires `clickSpy` exactly once on click. The TC edge "`disabled` used where a precondition gates an action" is a review rule (DAC-E1-15), recorded in Other Notes, not a test — kills: remove-attribute on `aria-disabled` (attribute assertion); negate-boolean on the blocked guard in the click handler (`clickSpy` called under `blocked`, or never called under `default`); drop-defaulted-argument on `event.preventDefault()` (`submitSpy` called by Enter on the submit button)
- [ ] T006 [P] Implement TC-COMP-007 (badge variants resolve to status and coverage tokens) in a new `web/src/components/ui/badge.test.tsx`, with a `// Implements TC-COMP-007` comment. For each variant render `<Badge variant=…>Label</Badge>` and assert against an independent literal fixture table: `status-<tier>` for the six tiers → `data-variant="status-<tier>"` and classes `bg-status-<tier>-muted` and `text-status-<tier>`; `coverage-present` → `bg-status-good-muted text-status-good`; `coverage-absent` → `bg-value-missing-muted text-value-missing`; `coverage-unknown` → `bg-value-indeterminate-muted`, `bg-pattern-indeterminate` **and** `text-value-indeterminate` all present (both background classes must survive `cn()`, see Other Notes); `secondary` → `bg-secondary text-secondary-foreground`. Then, for every colour utility in the fixture (strip `bg-`/`text-`), assert the loaded `tailwind.config.js` `colors[<key>]` equals `hsl(var(--<expected token>) / <alpha-value>)` where the expected token comes from the fixture (for example `coverage-present` → `--status-good`, per the badge spec section 6), and that the token is declared in `theme.css`. Also assert the badge is not a tab stop (no `tabindex`, `userEvent.tab()` does not focus it) and has no role (badge spec sections 4-5). Step 3 of the TC (the delivered `shell.tokens.test.tsx`) runs in T015 — kills: swap-case between coverage variants (`coverage-present` given `bg-value-missing-muted`); remove-attribute of `bg-pattern-indeterminate` (or tailwind-merge dropping it); swap-case of a tier's muted pair

### Additional Unit Tests

- [ ] T007 [P] Write the `card` contract test in a new `web/src/components/ui/card.test.tsx` (design 2.1 `card` `default`, `metric`, `summary`; card spec sections 2-6; UX design 10 tokens), to the API fixed by DEC-0297 (Open Gap 2): `Card` renders `data-variant` for each of `default`, `metric`, `summary` (default when omitted is `default`) with classes `rounded`, `border`, `border-border`, `bg-card`, `text-card-foreground` and no `shadow` class; `CardTitle` is `getByRole("heading", { level: 2 })` with `text-lg`; `CardMetricValue` carries `font-numeric` and `text-2xl`; `CardSummaryList` renders a `dl` whose `dt`/`dd` children are exposed as `term`/`definition`; the card itself is not a tab stop (`userEvent.tab()` with no interactive child focuses nothing) (traces to AC-26) — kills: swap-case `h2` → `h3` on `CardTitle` (level assertion); remove-attribute of `font-numeric` on `CardMetricValue`; swap-case `rounded` → `rounded-lg` (a Tailwind default literal radius)
- [ ] T008 [P] Write `cn()` unit tests in a new `web/src/components/ui/utils.test.ts`: `cn("px-2", "px-4")` is `"px-4"` (tailwind-merge active); `cn("a", false, undefined, "b")` is `"a b"` (clsx active); `cn("bg-value-indeterminate-muted", "bg-pattern-indeterminate")` keeps both classes (the theme's background-image key is registered with tailwind-merge as a background image, not a colour); `cn("bg-status-good-muted", "bg-status-warning-muted")` keeps only the last (colour conflicts still merge) (traces to AC-26, DAC-E1-S1-4) — kills: remove-attribute of the `extendTailwindMerge` `bg-image` registration in `utils.ts` (third assertion); replacing `twMerge` with plain `clsx` (first and fourth assertions)

**Checkpoint**: All Phase 2 tests written; T002, T004-T008 fail (missing keys, packages and modules). T003's scan cases pass against the delivered sources and its planted cases exercise only test-local helpers: it is a test-only cycle (see T017).

---

## Phase 3: Core Implementation

**Purpose**: Add the packages and Tailwind keys, then vendor `cn()`, `badge`, `button` and `card` as token-bound first-party code.

- [ ] T009 Add the five packages to `package.json` `dependencies` and `package-lock.json` with `npm install clsx tailwind-merge@^2 class-variance-authority lucide-react @radix-ui/react-slot` from the repo root (network to `registry.npmjs.org` is required). `tailwind-merge` MUST be a 2.x release: 3.x supports only Tailwind CSS v4 and the delivered `tailwindcss` is `^3.4.11`. Verify each licence against the installed package's `LICENSE` file (`node_modules/<name>/LICENSE*`): `clsx` MIT, `tailwind-merge` MIT, `class-variance-authority` Apache-2.0, `lucide-react` ISC, `@radix-ui/react-slot` MIT; confirm each `package-lock.json` entry carries that `license` value; record the five verified licences in this cycle's entry in `CAP-003-E1-S1-tdd-evidence.yaml` (DEC-0298). Add nothing else to `dependencies` or `devDependencies` (makes T004 pass; traces to DAC-E1-12, DAC-E1-S1-5)
- [ ] T010 [P] Extend `tailwind.config.js` `theme.extend`: add to `colors` exactly `primary`, `primary-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `muted`, `ring`, `destructive`, `destructive-foreground`, `status-foreground` and `seq-1`, each `"hsl(var(--<same name>) / <alpha-value>)"`; add `borderRadius: { DEFAULT: "var(--radius)" }` and `ringWidth: { DEFAULT: "var(--focus-ring-width)" }`; keep every delivered key and comment unchanged; add one comment line citing component design 2.2 and DAC-E1-11. No token is added to `theme.css` (makes T002 pass; traces to DAC-E1-11, AC-26)
- [ ] T011 Create `web/src/components/ui/utils.ts` exporting `cn(...inputs: ClassValue[])` as shadcn/ui ships it (`twMerge(clsx(inputs))`), with `twMerge` built by `extendTailwindMerge` registering the theme's `pattern-indeterminate` background-image key in the `bg-image` class group, so the `coverage-unknown` badge keeps its muted background colour and its pattern (badge spec section 6). Doc comment cites component design 2.1 and DAC-E1-S1-1; no unit literal in the comment (T003 scans this file). Depends on T009 (makes T008 pass)
- [ ] T012 [P] Create `web/src/components/ui/badge.tsx` from shadcn/ui's Tailwind v3 `badge` source: `import { cn } from "./utils"` (the `@/lib/utils` import rewritten), `badgeVariants` via `cva` and `Badge(props: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>)` rendering a `span` with `data-variant={variant}`. Variants are exactly design 2.1's list, with `variant` required (no `default`, `destructive` or `outline`: Resolved Conflict 3): `status-neutral`, `status-active`, `status-good`, `status-warning`, `status-serious`, `status-critical` (`bg-status-<tier>-muted text-status-<tier>`), `coverage-present` (`bg-status-good-muted text-status-good`), `coverage-absent` (`bg-value-missing-muted text-value-missing`), `coverage-unknown` (`bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate`), `secondary` (`bg-secondary text-secondary-foreground`). Base classes replace shipped literals with token classes and the delivered `StatusBadge` precedent: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold` (shipped `rounded-full`, `px-2.5`, `py-0.5`, the focus ring and hover states removed: a badge is never focusable and has no hover, badge spec section 4). Depends on T011 (makes T006 pass)
- [ ] T013 [P] Create `web/src/components/ui/button.tsx` from shadcn/ui's Tailwind v3 `button` source: `import { Slot } from "@radix-ui/react-slot"`, `import { cn } from "./utils"`, `buttonVariants` via `cva`, `Button` as a `forwardRef<HTMLButtonElement, ButtonProps>` with `asChild` rendering `Slot`, `data-variant={variant}`. Variants are exactly design 2.1's `default` (`bg-primary text-primary-foreground hover:bg-primary/90`), `secondary` (`bg-secondary text-secondary-foreground hover:bg-secondary/80`), `outline` (`border border-input bg-background hover:bg-accent hover:text-accent-foreground`), `ghost` (`hover:bg-accent hover:text-accent-foreground`) and `blocked` (`border border-input bg-background text-muted-foreground cursor-not-allowed`), `defaultVariants: { variant: "default" }`; shadcn's `destructive`, `link` and the `size` axis are not vendored (Resolved Conflict 3). Base classes: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` (shipped `h-10`, `rounded-md`, `text-sm`, `ring-2`, `ring-offset-*` replaced: Other Notes). When `variant === "blocked"`: set `aria-disabled="true"`, never set native `disabled`, and replace the caller's `onClick` with a handler that calls `event.preventDefault()` and returns without calling it, so Enter, Space and click neither fire the handler nor submit an enclosing form; the reason is the caller's inline element referenced by the standard `aria-describedby` prop (button spec `blocked`; ux-design 1.2). Doc comment states `blocked`, never `disabled`, where a precondition gates an action (DAC-E1-15). Depends on T009, T011 (makes T005 pass)
- [ ] T014 [P] Create `web/src/components/ui/card.tsx` from shadcn/ui's Tailwind v3 `card` source with `import { cn } from "./utils"`, to DEC-0297: `Card` (`variant?: "default" | "metric" | "summary"`, default `default`, rendered as `data-variant`; classes `rounded border border-border bg-card text-card-foreground`, shipped `rounded-lg` and `shadow-sm` removed), `CardHeader` (`flex flex-col space-y-1 p-6`, shipped `space-y-1.5` replaced), `CardTitle` (an `h2`, `text-lg font-semibold`; shipped `text-2xl leading-none tracking-tight` replaced per UX design 10 "`--text-lg` card `h2`s"), `CardDescription` (`text-sm text-muted-foreground`), `CardContent` (`p-6 pt-0`), `CardFooter` (`flex items-center p-6 pt-0`), and the two variant parts `CardMetricValue` (a `p`, `font-numeric text-2xl`; card spec `metric` anatomy, UX design 10 "`--text-2xl` the data tile's hero count") and `CardSummaryList` (a `dl`, `grid grid-cols-2 gap-x-4 gap-y-2`; card spec `summary` "description list"). Depends on T011 (makes T007 pass)

**Checkpoint**: T002 and T004-T008 pass; the T003 scan still passes over the new `ui/` files.

---

## Phase 4: Integration

**Purpose**: Prove the delivered token and raw-HTML checks keep passing over the new directory without editing them.

- [ ] T015 Run, unchanged, `web/src/app/shell.tokens.test.tsx` (TC-COMP-003 step 3, TC-COMP-007 step 3) and `web/src/api/render.test.tsx` (TC-COMP-008 step 3: its `sourceFiles(WEB_SRC)` walk already recurses through all of `web/src/`, so `web/src/components/` is covered and no glob edit is made: Resolved Conflict 4), plus every CAP-002 `web/src/components/patterns/*.test.tsx` and CAP-001 screen test (the `borderRadius.DEFAULT` change restyles every delivered `rounded` element; no delivered test asserts a radius value). Confirm with `git diff --stat -- package.json` and `git diff -- package.json` that `dependencies` gained exactly the five packages and `devDependencies` is unchanged, and that `tsconfig.json`, `vite.config.ts`, `web/src/app/` and `web/src/api/` are untouched by `git diff --exit-code -- tsconfig.json vite.config.ts web/src/app web/src/api` (traces to DAC-E1-11, DAC-E1-S1-4, DAC-E1-S1-5, DAC-E1-12)

**Checkpoint**: The whole Vitest suite is green with no delivered test edited.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T016 Run `npm run lint` (DAC-E1-S1-1: the vendored files lint as first-party code), `npm run format` (fix with `npx biome format --write <files>` on this story's files only), `npx tsc --noEmit` (test files are type-checked too) and `npm run build` from the repo root; fix findings in this story's files only (traces to AC-26, AC-25, DAC-E1-S1-1)
- [ ] T017 After each TDD cycle in T002–T016 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E1-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T002 + T010 Tailwind keys; (2) T003 literal scan — test-only, `mutation: {not_applicable: "test-only cycle: token-literals.test.ts adds no production code"}`; (3) T004 + T009 packages and licences — `mutation: {not_applicable: "dependency manifest change only"}` unless the mutation runner covers `package.json`; (4) T008 + T011 `cn()`; (5) T006 + T012 `badge`; (6) T005 + T013 `button`; (7) T007 + T014 `card`; T015-T016 add no behaviour and join the last cycle's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S2 | reverse | Imports `cn()` from `ui/utils.ts`, uses the Tailwind keys, is checked by `token-literals.test.ts` and `vendoring.test.ts` (its seven packages fall in the approved set); graph edge S2 → S1 already present |
| CAP-003-E1-S3 | reverse | Imports `cn()` and `button`; its `command.tsx` is the one file whose `560px` the scan allows (DEC-0296); edge S3 → S1 present |
| CAP-003-E1-S4 | reverse | Imports `cn()` and `button`; `@tanstack/react-table` falls in the approved set; edge S4 → S1 present |
| CAP-003-E1-S5 | reverse | Its `StatusBadge` renders this story's `badge` `status-<tier>` variant; edge S5 → S1 present |
| CAP-003-E3-S2 | reverse | Creates `web/src/app/layout.ts` (allowed wholesale by the scan) and extends `token-literals.test.ts` with the layout rule; edge E3-S2 → E1-S1 present |
| CAP-003-E3-S5 | reverse | Adds `web/src/app/command-palette/` to `SCANNED_DIRECTORIES`; edge E3-S5 → E1-S1 present |
| CAP-003-E3-S6 | reverse | Adds `web/src/app/` to `SCANNED_DIRECTORIES`; edge E3-S6 → E1-S1 present |
| CAP-003-E4-S4 | reverse | Renders the step 4 summary through `card` `summary` and `CardSummaryList` (DEC-0297); reaches E1-S1 through its graph edges |
| CAP-003-E1-S6 | reverse | Its `NotDeterminable` renders the `coverage-unknown` badge, whose pattern class `cn()` must keep; edge E1-S6 → E1-S1 present |

This story has no hard dependency (`CAP-003-E1-S1: []`); no edge is added.

### Task Dependencies

- T001: No dependencies
- T002 → T003: same file, sequential; both after T001
- T004, T005, T006, T007, T008: No dependencies on each other (can run in parallel with T002/T003)
- T009: Depends on T004 (test first)
- T010: Depends on T002
- T011: Depends on T008, T009
- T012: Depends on T006, T011
- T013: Depends on T005, T009, T011
- T014: Depends on T007, T011
- T015: Depends on T010, T012, T013, T014
- T016: Depends on T015
- T017: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: T002/T003 (one file) in parallel with T004, T005, T006, T007, T008
- Phase 3: T009 and T010 in parallel; then T012, T013, T014 in parallel after T011

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci` (T009 uses `npm install <pkgs>` to add the five packages and rewrite the lockfile)
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- DAC-E1-11: T002 passes; `shell.tokens.test.tsx` passes unchanged; `git diff -- design-system/theme.css` is empty (no token added).
- DAC-E1-S1-1: `grep -rn '"@/' web/src/components/ui` prints nothing; `git diff --exit-code -- tsconfig.json vite.config.ts`; `npm run lint` passes.
- DAC-E1-S1-2: T003 passes; then plant `export const x = "12px";` in a temporary `web/src/components/ui/planted.tsx`, confirm `npx vitest run src/components/token-literals.test.ts` (from `web/` as Vitest root, or `npm run test -- token-literals`) fails naming `web/src/components/ui/planted.tsx`, and delete the file.
- DAC-E1-S1-3: T005 passes.
- DAC-E1-S1-4: T006 passes; `shell.tokens.test.tsx` passes.
- DAC-E1-S1-5 / DAC-E1-12: T004 passes; `git diff -- package.json` shows exactly the five added `dependencies` lines and no `devDependencies` change; plant `dangerouslySetInnerHTML` in a temporary `web/src/components/ui/planted.tsx`, confirm `render.test.tsx` fails, and delete the file.
- AC-26 visual: `npm run build` succeeds; the `rounded` radius on delivered surfaces now resolves to `--radius` (expected, see Other Notes).

---

## Notes

### Resolved Conflicts

1. **The scan's `hsl(` rule vs theme consumption.** DAC-E1-S1-2's pattern lists `hsl(` and `rgb(`, and the delivered CAP-002 patterns under the scanned directory use `hsl(var(--seq-1))`, `hsl(var(--seq-4))` (`factor-cell.tsx` lines 19-20) and `hsl(var(--factor-*))` (`inspector-panel.tsx` lines 54-56). Capability AC-26 (and epic DAC-E1-12, system design constraint 12) forbids a colour literal *outside the theme*; a colour function whose argument is a `var(--token)` consumes the theme and is not a literal, and the story AC itself says "`hsl(` literal". Capability AC-26 governs over the story's illustrative pattern: the scan flags `rgb(`/`hsl(` (and `rgba(`/`hsla(`) only when not followed by `var(`. CAP-002's files are not edited to satisfy this story's test.
2. **`--coverage-*` tokens.** DAC-E1-S1-4 and TC-COMP-007 say badge colours resolve to "the `--status-*` or `--coverage-*` token"; `theme.css` defines no `--coverage-*` token, and epic DAC-E1-11 and component design 2.2 forbid adding one. The badge design spec section 6 (normative) maps `coverage-present` to `--status-good` on `--status-good-muted`, `coverage-absent` to `--value-missing` on `--value-missing-muted`, and `coverage-unknown` to `--value-indeterminate` on `--value-indeterminate-muted` plus `--pattern-indeterminate`, all already mapped in the delivered `tailwind.config.js`. The epic and the design-system spec govern; T006 and T012 use those tokens. Equally, "through the new Tailwind keys" is satisfied through the delivered keys for these variants (no new key is needed by them).
3. **"Copied as shadcn/ui ships them" vs the variant lists and AC-26.** Component design 2.1 enumerates the variants of each file (badge: `status-<tier>`, `coverage-*`, `secondary`; button: `default`, `secondary`, `outline`, `ghost`, `blocked`), the button spec defines no size axis, and the shipped sources carry classes that resolve to Tailwind default literals (`h-10`, `rounded-md`, `rounded-full`, `px-2.5`, `py-0.5`, `ring-2`, `ring-offset-2`, `shadow-sm`, `tracking-tight`). Capability AC-26 and epic DAC-E1-12 govern over the generic "as shipped": the files are vendored from the shipped sources (structure, `cva`, `forwardRef`, `Slot`, part names), with unlisted variants and the `size` axis dropped and every literal-backed class replaced by a token-backed one (`rounded` → `--radius`, `ring` → `--focus-ring-width`, spacing 1-8 → `--space-*`, `text-*` → `--text-*`).
4. **`render.test.tsx` "glob widening".** The story's Description and Implementation say the delivered `web/src/api/render.test.tsx` glob is widened to `web/src/components/`. The delivered file (lines 7-17, 25) already walks every `.ts`/`.tsx` under `web/src/` recursively, so `web/src/components/` is covered; DAC-E1-S1-5 ("`render.test.tsx` passes with its glob widened to `web/src/components/`") holds without an edit. The code fact governs the story's description; no edit is made (and `web/src/api/` is not touched).
5. **"`shell.tokens.test.tsx` already asserts every scale resolves to a custom property"** (component design 2.2, section 7 Token discipline row). The delivered test checks only `spacing`, `fontSize` and `height` (lines 37-41), not `colors`, `borderRadius` or `ringWidth`. It stays unchanged and passing (DAC-E1-11), and TC-COMP-003's resolution check is written in this story's own test file (Open Gap 4).

### Open Gaps

1. **The literal scan's interface. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0296.** DAC-E1-S1-2 requires the scanned-directory list to be exported "for later stories to widen" and allows "only `0`, the vendored `command` dialog's 560 px width and `web/src/app/layout.ts`", but no artifact names the export, its path format or how each allowance is scoped. Adopted (T003): `export const SCANNED_DIRECTORIES: readonly string[] = ["web/src/components/"]`, repo-root-relative directory paths with a trailing slash, widened by later stories by appending an entry; `web/src/app/layout.ts` is skipped wholesale; `560px` is allowed only in `web/src/components/ui/command.tsx`; zero-valued lengths are allowed everywhere; colour functions whose first argument is `var(` are not literals (Resolved Conflict 1). Derivation: later stories word their widening as "adds `web/src/screens/home/` to its scanned directories" (DAC-E5-S3-4, DAC-E3-S5-4, DAC-E3-S6-5, DAC-E7-S1-2 and siblings), i.e. repo-relative directory paths; component design 2.1 places `command` at `web/src/components/ui/command.tsx` and UX design 1.1 and design section 3 call the 560 px "a width inside the vendored component, not a call-site literal", so scoping the allowance to that file keeps 560 px a literal everywhere else; system design constraint 12 makes `layout.ts` the one module holding approved-specification widths. Consumers: CAP-003-E1-S3 (must keep its width as the literal `560px` inside `ui/command.tsx`), CAP-003-E3-S2 (adds the layout rule to this file), CAP-003-E3-S5, CAP-003-E3-S6 and the screen stories of epics E4 to E7 that widen the scan (append to `SCANNED_DIRECTORIES`). Follow-up: component design `ui-components` section 7 (and 3) should name the export and the allowance scoping at its next revision.
2. **The `card` `metric` and `summary` API. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0297.** Component design 2.1 lists `card` variants `default`, `metric`, `summary`; shadcn/ui ships `card` as parts with no variants, and no artifact fixes how a variant is selected or which parts it adds. Adopted (T007, T014): `Card` takes `variant?: "default" | "metric" | "summary"` (default `default`), rendered as `data-variant` like the delivered `data-variant` convention; the shipped parts `CardHeader`, `CardTitle` (an `h2` at `text-lg`), `CardDescription`, `CardContent`, `CardFooter`; plus `CardMetricValue` (`p`, `font-numeric text-2xl`) and `CardSummaryList` (`dl`, callers supply `dt`/`dd`). Derivation: card spec section 2-3 (`metric` "one large number with a label"; `summary` "description list"), section 5 (the title is a real heading), UX design section 10 tokens (`--text-lg` card `h2`s, `--text-2xl` the data tile's hero count, `--font-numeric` for every count). A caller needing another heading level composes its own heading inside `CardHeader`. Consumers: CAP-003-E4-S4 (the step 4 summary card) and the Home data tile, check cards, What you follow and download summary stories of epics E5 to E7. Follow-up: component design `ui-components` section 2.1 should state the card parts at its next revision.
3. **Where a package's licence is recorded. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0298.** DAC-E1-S1-5 requires each package to carry "its licence in the change" and system design constraint 12, design section 4 and SEC-DEP-003 require it "recorded"; no artifact names the record or a location, and the repository has no licence register. Adopted (T004, T009): the `package-lock.json` `license` field npm writes for each package is the record, verified by hand against the package's `LICENSE` file when added (licences listed in the TDD-evidence cycle), and enforced by `web/src/components/ui/vendoring.test.ts`, which requires every `dependencies` entry to be in the approved set (the three delivered, the ten tech stack v7 packages, `@radix-ui/react-*`) with the licence tech stack v7 states (MIT; `class-variance-authority` Apache-2.0; `lucide-react` ISC). Derivation: tech stack v7 Key Libraries fixes the expected licences; SEC-DEP-003's verification is "an agent-checkable configuration audit"; the lockfile already records a `license` for each of its 304 entries. Consumers: CAP-003-E1-S2, CAP-003-E1-S3, CAP-003-E1-S4 add approved packages and are checked by the test without editing it; a later capability adding a package outside the set (for example `lightweight-charts`) extends the approved set. Follow-up: component design `ui-components` section 4 (Supply chain) should name the record at its next revision.
4. **Home of the Tailwind-key resolution check (TC-COMP-003).** TC-COMP-003's edge case ("a key naming an undefined token: the test fails naming it") needs a check that resolves colour, radius and ring keys against `theme.css`. Component design section 7 assigns it to the delivered `shell.tokens.test.tsx`, which does not do it (Resolved Conflict 5) and is `owner-shell`'s file (DEC-0211: every file under `web/src/app/` is `owner-shell`'s). The plan writes it as a `describe` block in this story's own `web/src/components/token-literals.test.ts`, the AC-26 automated check (T002). Contained in this story. Follow-up: component design `ui-components` section 7 should move the Token discipline row to `token-literals.test.ts` at its next revision.

### Other Notes

- **tailwind-merge and the pattern class.** tailwind-merge classifies any unknown `bg-<value>` as a background colour, so the stock `twMerge` would drop `bg-value-indeterminate-muted` in favour of `bg-pattern-indeterminate` (or the reverse) and `coverage-unknown` would lose either its colour or its pattern. T011 registers `pattern-indeterminate` in the `bg-image` class group with `extendTailwindMerge` (shadcn/ui's documented route for theme-specific classes); T006 and T008 prove both survive. This matters to CAP-003-E1-S6's `NotDeterminable`, which renders `coverage-unknown`.
- **Button sizing from local precedent.** No artifact fixes a button height token. The delivered CAP-001/CAP-002 buttons (`web/src/screens/runs/run-controls.tsx` line 123, `web/src/screens/research/save-as-universe-dialog.tsx` line 71) use `rounded border px-3 py-2 text-base` with no fixed height; T013 follows that precedent (constraint 9.5) instead of shadcn's literal-backed `h-10`. The resulting control exceeds the button spec's 24 by 24 px minimum target.
- **`blocked` is the delivered DOM.** T013's `data-variant="blocked"`, `aria-disabled="true"` and `aria-describedby` reproduce the DOM the delivered `run-controls.tsx` and `save-as-universe-dialog.tsx` already render and test, so `owner-web-app`'s rebuild (E7) can swap in `Button` without changing those assertions. The reason element stays the caller's (the button spec puts it "inline beside" the button, and UX design 1.5 makes part of one reason a link).
- **DAC-E1-15 review rule.** "`button` `disabled` is not used where a precondition gates an action" is enforced by review at each consuming story; T013's doc comment states it. The delivered native `disabled` in `web/src/screens/settings/history-depth-form.tsx` is a deliberate IR-003 case outside this story.
- **Badge `variant` is required.** Every `badge` caller names its variant (no shipped `default`); CAP-003-E1-S5's `StatusBadge` passes `status-<tier>` and keeps `data-variant="status-<tier>"`, which the delivered CAP-002 tests assert.
- **Radius change is global and expected.** Mapping `borderRadius.DEFAULT` to `var(--radius)` (0.5rem) restyles every delivered `rounded` element from Tailwind's literal 0.25rem; this is the one-line fix DEC-0231 (CAP-002) named and is required by DAC-E1-11. No delivered test asserts a radius. `ringWidth.DEFAULT` is unused by delivered code.
- **Borders name their colour.** The delivered config defines no `borderColor.DEFAULT`, so a bare `border` would take Tailwind's default grey; every vendored border class pairs with `border-border` or `border-input`.
- **`lucide-react`** is added because the story and TC-COMP-008 require all five, though none of `badge`, `button`, `card` imports it; the first importers are CAP-003-E1-S2 and E1-S3.
- **No self-contradicting scan.** T003 scans every non-test file under `web/src/components/`, comments included: doc comments in `utils.ts`, `badge.tsx`, `button.tsx` and `card.tsx` must not write a unit literal (write "560 px" with a space, never the joined form, and no hex colour). Arbitrary values such as `grid-cols-[auto_1fr]` carry no unit the scan matches; none is planned here.
- **Network.** T009 needs `registry.npmjs.org`; in the Bash sandbox, allow that host for the install command.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/components/ui/button.tsx`: `aria-disabled={blocked ? "true" : undefined}` → `aria-disabled={undefined}`
  - `web/src/components/ui/button.tsx`: `event.preventDefault();` → (deleted)
  - `web/src/components/ui/badge.tsx`: `"coverage-present": "bg-status-good-muted text-status-good"` → `"coverage-present": "bg-value-missing-muted text-value-missing"`
  - `web/src/components/ui/utils.ts`: `"bg-image": [{ bg: ["pattern-indeterminate"] }]` → `"bg-image": []`
  - `tailwind.config.js`: `ring: "hsl(var(--ring) / <alpha-value>)"` → `ring: "hsl(var(--rng) / <alpha-value>)"`
  - `web/src/components/ui/card.tsx`: `<h2` → `<h3` in `CardTitle`
