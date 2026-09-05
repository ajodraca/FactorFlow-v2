---
slug: form
name: Form
status: stable
source: shadcn/ui Form — React Hook Form + Zod resolver
upstream_docs: https://ui.shadcn.com/docs/components/form
last_reviewed: 2026-08-21
---

# Form

## 1. Purpose

Groups fields into one submission, owning labels, descriptions, validation, and error display.
Individual field components never render their own label or error — this component does.

**Use when:** collecting one or more related values the user submits together.

**Do not use when:**
- A single control applies immediately — use the `inline` variant of `select` or a switch
- Filtering a table — use the table toolbar

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `stacked` | Default. Label above field, one column. |
| `inline` | Two or three short fields on one row inside a toolbar |
| `dialog` | Inside `dialog`; actions belong to the dialog footer, not the form |

## 3. Anatomy

Per field: label, optional description, the control, error message. Form level: optional
summary error, then actions with cancel before submit in DOM order.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Moves through fields in visual order |
| `Enter` in a single-line field | Submits, except in a `destructive` or `real-money` dialog |
| Submit | Validates all fields, then either submits or reports every error at once |

- Validate a field on blur; once it has errored, re-validate on change so the error clears as soon as it is fixed.
- On failed submit, show every error at once and move focus to the first field in error. Never reveal errors one at a time.
- While submitting, disable the submit action and show progress. Keep field values; never clear the form on failure.
- Server-side errors attach to the field they belong to. Only errors with no field go to the summary.

## 5. Accessibility Contract

- **Role / ARIA:** native `<form>`. Every control has a programmatically associated label. Errors are referenced by `aria-describedby` and the control carries `aria-invalid`.
- **Focus management:** focus moves to the first invalid field on failed submit; on success, focus moves to whatever replaces the form.
- **Screen reader:** the summary error is in an assertive live region. Field errors are announced when focus reaches the field.
- **Contrast and target size:** error text meets 4.5:1; controls at least 44 CSS pixels tall.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Label | `--foreground` |
| Description | `--muted-foreground` |
| Error text and border | `--destructive` |
| Summary error background | `--destructive` at low alpha |
| Field border | `--input` |

## 7. Content Guidelines

Labels are sentence case nouns without a trailing colon. Descriptions state constraints before
the user hits them. Error messages say what is wrong and how to fix it — "Quantity must be a
whole number of shares", not "Invalid input".

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Report all errors at once on submit | Reveal errors one at a time |
| Attach server errors to their field | Dump every server error in the summary |
| Preserve values on failure | Clear the form and make the user start again |

## 9. References

- shadcn/ui Form: <https://ui.shadcn.com/docs/components/form>
- WAI form error guidance: <https://www.w3.org/WAI/tutorials/forms/notifications/>
