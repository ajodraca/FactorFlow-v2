---
slug: progress
name: Progress
status: beta
source: shadcn/ui Progress — built on Radix Progress; `meter` variant per the WAI-ARIA APG Meter pattern
upstream_docs: https://www.radix-ui.com/primitives/docs/components/progress
last_reviewed: 2026-10-15
---

# Progress

## 1. Purpose

A horizontal bar for a bounded quantity: how far an operation has got, or how
much of a limit is used. It closes the one component gap CAP-001's UX design
left open — an indicator for an acquisition run whose duration cannot be
estimated — with its `indeterminate` variant.

**Use when:** the value has a known maximum (812 of 1,236 stocks; 41 of 60
days; 6.8% of an 8% limit), or an operation is running with no estimate.

**Do not use when:**
- The value is unbounded or has no meaningful maximum — show the number
- Showing a series over time — use `chart`
- Showing a factor percentile in a list — that is the factor-cell pattern, a
  decorative bar beside the number

## 2. Variants

| Variant | Role | When to use |
|---------|------|-------------|
| `determinate` | `progressbar` | An operation with a known total: a download's stocks done, paper days toward the gate |
| `indeterminate` | `progressbar` | An operation under way whose total or duration is unknown. Never shows an estimated time remaining |
| `meter` | `meter` | Current use of a bounded capacity, which is not progress: a position's weight against its limit, today's loss against the daily-loss limit. The WAI-ARIA APG reserves `progressbar` for progress and `meter` for this |

## 3. Anatomy

Track (6–8 px, fully rounded) and indicator. `determinate` and `meter` are
paired with a visible text value (*41 of 60 days*, *6.80% of 8%*); the bar is
never the only carrier of the value. `meter` may draw a 2 px tick at the limit
when the track represents more than the limit.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Not focusable. Radix lists no keyboard interaction for Progress, and APG Meter has none |
| Pointer | No hover state |

- `indeterminate` animates by sliding the indicator; under
  `prefers-reduced-motion` it shows a static hatched track
  (`--pattern-indeterminate`) instead.
- Radix data attributes drive styling: `[data-state="loading"]`,
  `[data-state="complete"]`, `[data-state="indeterminate"]` (value `null`).

## 5. Accessibility Contract

- **Role / ARIA:** `progressbar` for `determinate` and `indeterminate` (Radix
  Progress adheres to the `progressbar` role requirements); `indeterminate`
  omits `aria-valuenow`. `meter` uses `role="meter"` with `aria-valuenow`,
  `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` whenever a percentage
  alone is unclear (*6.80% of an 8% limit*), per APG Meter.
- **Labelling:** `aria-labelledby` to the visible label, else `aria-label`.
- **Screen reader:** values that change while watched are announced through the
  enclosing region's polite live region at the polling cadence, not on every
  frame.
- **Contrast:** indicator against track at least 3:1; the text value meets 4.5:1.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Track | `--seq-1` |
| Indicator, `determinate` / `meter` | `--seq-4` |
| Indicator, paper gate progress | `--risk-paper` (environment channel, permitted by STD-UI-11 v5) |
| Indicator, download in progress | `--status-active` |
| `indeterminate` with reduced motion | `--pattern-indeterminate` |
| Limit tick | `--foreground` |
| Value text | `--font-numeric` |

## 7. Content Guidelines

State both the value and the bound: *812 of 1,236 stocks*, *41 of 60 days
toward review*, *6.80% of an 8% limit*. No estimated time remaining unless a
duration target exists.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Use `meter` for limits | Use `progressbar` for a limit, which reads as "loading" |
| Pair every bar with its number | Let the bar carry the value alone |
| Use `indeterminate` when the total is unknown | Fake a determinate bar |

## 9. References

- Radix Progress: <https://www.radix-ui.com/primitives/docs/components/progress>
- WAI-ARIA APG Meter: <https://www.w3.org/WAI/ARIA/apg/patterns/meter/>
- shadcn/ui Progress: <https://ui.shadcn.com/docs/components/progress>
