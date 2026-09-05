---
slug: select
name: Select
status: stable
source: shadcn/ui Select — built on Radix Select
upstream_docs: https://ui.shadcn.com/docs/components/select
last_reviewed: 2026-08-21
---

# Select

## 1. Purpose

Chooses one value from a known, finite set.

**Use when:** the options are known ahead of time and roughly 15 or fewer — a universe, a
strategy, a page size.

**Do not use when:**
- There are more than about 15 options, or they are searchable — use a combobox
- There are 2–4 options and all should stay visible — use `tabs` or a radio group
- Multiple values may be chosen — use faceted filters in the table toolbar

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Standard form field inside `form` |
| `inline` | Toolbar control that applies immediately, without a submit step |
| `grouped` | Options fall into labelled groups |

## 3. Anatomy

Trigger showing the current value, chevron, popover list of options, optional group labels,
optional check mark on the selected option.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the trigger |
| `Enter` / `Space` | Opens the list |
| Arrow up / down | Moves through options while open |
| Typing characters | Jumps to the first option starting with them |
| `Enter` | Selects the highlighted option and closes |
| `Esc` | Closes without changing the value |

- The list opens with the current value highlighted, not the first option.
- `inline` applies on selection. `default` defers to the enclosing form's submit.
- A select must always have a value. Where "no choice" is meaningful, make it an explicit option ("All sectors"), never an empty state.

## 5. Accessibility Contract

- **Role / ARIA:** Radix supplies `combobox`/`listbox` semantics with `aria-expanded` and `aria-activedescendant`. Do not re-implement.
- **Focus management:** focus returns to the trigger on close, whether or not the value changed.
- **Screen reader:** the trigger's accessible name includes what is being chosen, not just the current value — "Universe: S&P 500".
- **Contrast and target size:** trigger at least 44 CSS pixels tall; options at least 32.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Trigger border | `--input` |
| Focus ring | `--ring` |
| Popover surface / text | `--popover` / `--popover-foreground` |
| Highlighted option | `--accent` / `--accent-foreground` |
| Group label | `--muted-foreground` |
| Corner radius | `--radius` |

## 7. Content Guidelines

Options are sentence case and mutually exclusive. Order by expected frequency, or alphabetically
when frequency is unknown — never by internal enum order.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Open with the current value highlighted | Open at the top of the list every time |
| Make "no filter" an explicit option | Leave the select empty to mean "all" |
| Use a combobox past ~15 options | Force scrolling through a long list |

## 9. References

- shadcn/ui Select: <https://ui.shadcn.com/docs/components/select>
- Radix Select accessibility: <https://www.radix-ui.com/primitives/docs/components/select#accessibility>
