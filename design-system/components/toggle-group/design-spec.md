---
slug: toggle-group
name: Toggle Group
status: beta
source: shadcn/ui Toggle Group — built on Radix Toggle Group
upstream_docs: https://www.radix-ui.com/primitives/docs/components/toggle-group
last_reviewed: 2026-10-15
---

# Toggle Group

## 1. Purpose

A compact segmented control for switching between two to four modes that apply
immediately: equal weight versus tilt to score; live versus paper portfolio.

**Use when:** the options are short labels, the change applies at once, and the
current mode should be visible at a glance.

**Do not use when:**
- The options need explanation — use `radio-group`
- Switching between distinct content panels with their own headings — use `tabs`
- More than four options — use `select`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `single` | Exactly one item pressed (Radix `type="single"`). Default |
| `environment` | `single`, used only to switch between paper and live views. Each item carries its environment shape and words (*◆ Live · real money*, *○ Paper · practice*); the pressed item uses its `--risk-*` text colour. Never used for anything else (STD-UI-11) |

`multiple` (Radix `type="multiple"`) is not used in this product.

## 3. Anatomy

A rounded container on `--muted` with 4 px padding; items are buttons; the
pressed item sits on `--background` with a subtle shadow.

## 4. Interaction Contract

From Radix Toggle Group:

| Input | Result |
|-------|--------|
| `Tab` | Focuses the pressed item, or the first item if none is pressed |
| `Space` / `Enter` | Toggles the focused item |
| `ArrowRight` / `ArrowDown` | Moves focus to the next item |
| `ArrowLeft` / `ArrowUp` | Moves focus to the previous item |
| `Home` / `End` | Moves focus to the first / last item |

- Roving focus is on by default (`rovingFocus`).
- In `single`, pressing the already-pressed item does not unpress it; the
  product always has a mode. Prevent the empty value in `onValueChange`.
- Radix data attribute: `[data-state="on" | "off"]`.
- The `environment` variant changes the route, so back and forward work.

## 5. Accessibility Contract

- **Role / ARIA:** Radix Toggle Group with roving tabindex (Radix references
  the APG radio example). Items expose their pressed state.
- **Labelling:** the group has an accessible name (*Weighting*, *Environment*).
- **Screen reader:** `environment` items include *real money* or *practice* in
  their names.
- **Target size:** at least 24 px tall; the product uses 34–36 px.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Container | `--muted` |
| Pressed item | `--background` |
| Item text | `--muted-foreground`; pressed `--foreground` |
| `environment` pressed text | `--risk-real-money` / `--risk-paper` |
| Focus ring | `--ring` |

## 7. Content Guidelines

One to three words per item. Each `environment` item states its environment in
words.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Use for immediate modes | Use for a choice that needs a Save |
| Keep exactly one item pressed | Allow an empty state |

## 9. References

- Radix Toggle Group: <https://www.radix-ui.com/primitives/docs/components/toggle-group>
- shadcn/ui Toggle Group: <https://ui.shadcn.com/docs/components/toggle-group>
