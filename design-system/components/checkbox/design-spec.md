---
slug: checkbox
name: Checkbox
status: beta
source: shadcn/ui Checkbox — built on Radix Checkbox
upstream_docs: https://www.radix-ui.com/primitives/docs/components/checkbox
last_reviewed: 2026-10-15
---

# Checkbox

## 1. Purpose

An independent on/off choice: selecting rows, switching a filter on, or
acknowledging a statement before a capital-at-risk action.

**Use when:** each option can be on or off independently of the others.

**Do not use when:**
- Exactly one of several options must be chosen — use `radio-group`
- The change applies immediately as a mode — use `toggle-group`
- Selecting rows in a `data-table` — use the table's own row checkbox, which is
  this component under the table's contract

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Inline choice with a short label |
| `acknowledgement` | A full-sentence statement the owner confirms before a capital-at-risk action (STD-UI-20). The whole bordered row is the label and hit target. Never pre-checked, never checked by a "check all" control |

## 3. Anatomy

16 px box (target at least 24 px), check or indeterminate dash, then the label.
`acknowledgement`: a bordered row (`--border`, `--radius`) with the box at the
top left and the sentence beside it.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the checkbox |
| `Space` | Checks or unchecks (Radix Checkbox keyboard interaction) |
| Pointer on the label | Toggles |

- Supports the tri-state pattern: `checked`, `unchecked`, `indeterminate`, set
  through the `checked` prop. `indeterminate` is used only by a "select all"
  control whose rows are partly selected.
- Radix data attributes: `[data-state="checked" | "unchecked" |
  "indeterminate"]`, `[data-disabled]`.

## 5. Accessibility Contract

- **Role / ARIA:** Radix Checkbox follows the WAI-ARIA tri-state Checkbox
  pattern; `aria-checked="mixed"` for indeterminate.
- **Labelling:** a visible label is always present and associated. Row
  checkboxes name their row: *Select KO*.
- **Screen reader:** `acknowledgement` sentences are read in full as the
  accessible name.
- **Contrast and target size:** box border uses `--input` (3:1); target at least
  24×24 CSS pixels.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Box border | `--input` |
| Checked fill / mark | `--primary` / `--primary-foreground` |
| Checked fill, `acknowledgement` before a real-money action | `--risk-real-money` / `--risk-foreground` |
| Row border (`acknowledgement`) | `--border` |
| Focus ring | `--ring` |

## 7. Content Guidelines

Labels state the choice positively (*Hide stocks with an incomplete score*).
Acknowledgements are first person, one fact each, and say what the owner accepts
(*Live orders spend real money.*).

## 8. Do / Don't

| Do | Don't |
|----|-------|
| One fact per acknowledgement | Bundle several facts into one checkbox |
| Leave acknowledgements unchecked by default | Pre-check or remember them across visits |

## 9. References

- Radix Checkbox: <https://www.radix-ui.com/primitives/docs/components/checkbox>
- WAI-ARIA APG Checkbox: <https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/>
- shadcn/ui Checkbox: <https://ui.shadcn.com/docs/components/checkbox>
