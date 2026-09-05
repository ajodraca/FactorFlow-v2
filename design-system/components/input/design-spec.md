---
slug: input
name: Input
status: stable
source: shadcn/ui Input
upstream_docs: https://ui.shadcn.com/docs/components/input
last_reviewed: 2026-08-21
---

# Input

## 1. Purpose

Single-line free-text or numeric entry. Always used inside `form`, which owns the label, help
text, and error message.

**Use when:** collecting a value that cannot be picked from a known set — a quantity, a limit
price, a search term.

**Do not use when:**
- The value comes from a known set — use `select`
- The text is long or multi-line — use a textarea
- Filtering a table — use the table toolbar's filter input

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `text` | Free text, including search |
| `numeric` | Quantities and prices; right-aligned, tabular figures |
| `currency` | Monetary amounts; currency symbol as a non-editable prefix |
| `percentage` | Rates and weights; `%` as a non-editable suffix |

## 3. Anatomy

Optional prefix, the field itself, optional suffix. Label, description, and error live in the
enclosing `form` field, never inside the input.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the field; visible focus ring required |
| `Esc` | Clears a search input; does nothing elsewhere |
| Arrow up / down in `numeric` | Steps by the field's defined increment |

- **Validation** runs on blur, not on every keystroke. Validating while typing reports an error before the user has finished, and for numeric entry that is constant.
- Once a field has shown an error, re-validate on change so the error clears as soon as it is fixed.
- Never silently reformat while the user is typing. Format on blur.
- `numeric`, `currency`, and `percentage` reject non-numeric characters rather than accepting and failing later.

## 5. Accessibility Contract

- **Role / ARIA:** native `<input>` with a programmatically associated `<label>`. `aria-invalid` when in error, `aria-describedby` pointing at the description and error.
- **Focus management:** on submit failure, focus moves to the first field in error.
- **Screen reader:** the error text is announced when it appears. Prefix and suffix are part of the accessible name — a bare "1.5" is not enough.
- **Contrast and target size:** field height at least 44 CSS pixels; border meets 3:1 against the surface.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Border | `--input` |
| Focus ring | `--ring` |
| Text | `--foreground` |
| Placeholder and affixes | `--muted-foreground` |
| Error border and text | `--destructive` |
| Numeric font | `--font-numeric` |
| Corner radius | `--radius` |

## 7. Content Guidelines

Placeholders show format, never substitute for the label. Numeric fields state their unit in the
label or affix, never only in the placeholder. Fix decimal places per field.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Validate on blur, clear on change | Report errors on every keystroke |
| Keep the unit visible while typing | Hide the unit in a placeholder that disappears |
| Format on blur | Reformat mid-keystroke and move the caret |

## 9. References

- shadcn/ui Input: <https://ui.shadcn.com/docs/components/input>
