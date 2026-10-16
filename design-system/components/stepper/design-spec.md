---
slug: stepper
name: Stepper
status: beta
source: Bespoke. No shadcn/ui or Radix primitive exists; built on a native ordered list
upstream_docs: https://www.w3.org/TR/wai-aria-1.2/#aria-current
last_reviewed: 2026-10-15
---

# Stepper

## 1. Purpose

Shows an ordered sequence of stages, which are done, which is current, and what
remains. Used for a strategy's lifecycle (Draft · Backtest · Paper · Review ·
Live) and for multi-step operations such as first-run setup, where STD-UI-26
requires the steps, the current position and what remains to be visible.

**Use when:** the order of stages matters and the user benefits from seeing the
whole path.

**Do not use when:**
- The stages are independent views of one thing — use `tabs`
- Progress is a quantity (41 of 60 days) — use `progress`
- There are more than seven stages — group them

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `horizontal` | Status of an object's lifecycle in a page header. Steps are not links |
| `vertical` | Navigation through a multi-step operation. Done steps are links back to that step; the current and future steps are not links |

## 3. Anatomy

An ordered list. Each step: a 24 px (horizontal) or 28 px (vertical) dot holding
the step number or a check, then the step label; vertical steps add a one-line
summary of what was chosen. Horizontal steps are joined by a 2 px connector,
filled for completed segments.

| Step state | Dot | Label |
|------------|-----|-------|
| Done | Filled `--foreground`, check in `--background` | `--foreground` |
| Current | Outline `--status-active` with a 3 px `--status-active-muted` ring | `--foreground`, weight 600 |
| To do | Outline `--border` | `--muted-foreground` |

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | `horizontal`: not focusable. `vertical`: focuses each done step's link in order |
| `Enter` on a done step (`vertical`) | Navigates to that step without discarding data entered in later steps (STD-UI-26) |
| Pointer | Same as `Enter`; current and future steps have no pointer affordance |

## 5. Accessibility Contract

- **Role / ARIA:** `<ol>` inside a `<nav>` labelled for its purpose (*Setup
  steps*, *Strategy lifecycle*). The current step carries `aria-current="step"`,
  per WAI-ARIA 1.2 `aria-current`. Done steps' state is in text, visually hidden
  where only a check is drawn: *Draft, done*.
- **Focus management:** changing step moves focus to the new step's heading, not
  to the stepper.
- **Screen reader:** the list announces its length, so *Step 3 of 5* is
  available without extra text; the visible *Step 3 of 5* line is still shown
  for sighted users.
- **Contrast:** to-do labels use `--muted-foreground`, which meets 4.5:1 on
  `--background`. The connector is decorative and `aria-hidden`.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Done dot / check | `--foreground` / `--background` |
| Current ring | `--status-active` / `--status-active-muted` |
| To-do outline, connector | `--border` |
| Labels | `--foreground`, `--muted-foreground` |
| Step number | `--font-numeric`, `--text-xs` |

## 7. Content Guidelines

One or two words per label, in the product vocabulary: *Draft*, *Backtest*,
*Paper*, *Review*, *Live*. Vertical summaries state the choice, not the
instruction: *5 years of history*, not *Choose history depth*.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Show only the stages the product has | Show a disabled *coming later* stage |
| Let done steps be revisited in `vertical` | Let the user jump ahead past an incomplete step |
| Keep the same stage names everywhere | Rename a stage per screen |

## 9. References

- WAI-ARIA 1.2, `aria-current`: <https://www.w3.org/TR/wai-aria-1.2/#aria-current>
- STD-UI-26, multi-step operations: `docs/constitution/standards/ui-conventions.md`
