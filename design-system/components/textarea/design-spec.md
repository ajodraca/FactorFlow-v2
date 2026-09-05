---
slug: textarea
name: Textarea
status: beta
source: shadcn/ui Textarea — a styled native <textarea>, not a Radix primitive
upstream_docs: https://ui.shadcn.com/docs/components/textarea
last_reviewed: 2026-09-05
---

# Textarea

## 1. Purpose

Multi-line free-text entry. Always used inside `form`, which owns the label, help
text, and error message. In FactorFlow its first job is entering many instrument
symbols at once, so this spec treats list entry as a first-class variant rather
than as a long note.

**Use when:**
- The value is genuinely multi-line, or is a list the user pastes from elsewhere
- A single-line `input` would force the user to add items one at a time at a
  volume where that is not workable

**Do not use when:**
- The value is a single short string — use `input`
- The value comes from a known set — use `select`
- The text is prose the product will render as markup — that is a different
  component and does not exist here
- Filtering a table — use the table toolbar's filter input

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Free multi-line text, fixed height, scrolls |
| `autosize` | Grows with content up to a stated maximum, then scrolls. Use where the expected length varies widely |
| `list` | One entry per line, or separated by commas. Parses to a list and reports rejected entries individually rather than failing the whole field. Use for bulk symbol entry |

## 3. Anatomy

1. **Field** — required, the native `<textarea>`
2. **Resize affordance** — optional, native; suppressed in `list`, where height is
   governed by the variant
3. **Entry counter** — `list` only, required: how many entries parsed, and how
   many rejected
4. **Rejected-entry list** — `list` only, required when any entry is rejected

Label, description, and error live in the enclosing `form` field, never inside
the textarea.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the field; visible focus ring required. `Tab` inside the field moves to the next control and never inserts a tab character |
| `Enter` / `Space` | Inserts a newline or a space. `Enter` MUST NOT submit the enclosing form: the `form` contract binds `Enter` to submit only in single-line fields |
| `Esc` | Does nothing. It does not clear the field, because discarding a long paste on a single keystroke is unrecoverable |
| Pointer | Focuses on click; native resize where the variant allows it |

- **Validation** runs on blur, not on every keystroke. In `list`, parsing runs on
  blur and on paste, so a pasted list reports its count immediately.
- **Paste** is the primary input path for `list`. Accept newline, comma, tab and
  semicolon separators, trim whitespace, and ignore empty entries.
- **Rejected entries** in `list` are reported individually and the accepted ones
  are kept. Rejecting the whole field because one entry is malformed discards
  work the user cannot easily reconstruct.
- **Never silently reformat** while the user is typing. Normalise on blur.
- **Loading and disabled:** while submitting, the field is read-only rather than
  disabled, so its content stays selectable and copyable.

## 5. Accessibility Contract

- **Role / ARIA:** native `<textarea>` with a programmatically associated
  `<label>`. `aria-invalid` when in error, `aria-describedby` pointing at the
  description, the entry counter, and the error. **This component has no Radix
  primitive**: shadcn/ui ships a styled native element, so the contract derives
  from the HTML element and the WAI-ARIA text-field pattern rather than from a
  primitive's published keyboard table.
- **Focus management:** on submit failure, focus moves to this field if it is the
  first in error. Focus is never moved into the field by parsing or by the
  counter updating.
- **Screen reader:** the entry counter is a polite live region, so a paste
  announces how many entries were understood. Rejected entries are announced with
  their reason, not only counted. The accessible name states what is being
  entered, not just "Text".
- **Contrast and target size:** field boundary meets 3:1 against its surface;
  minimum height of four rows in `list`, so a paste is visibly multi-line.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Field text | `--foreground` |
| Field surface | `--background` |
| Field boundary | `--input` |
| Focus ring | `--ring` |
| Placeholder and counter text | `--muted-foreground` |
| Error boundary and text | `--destructive` |
| Rejected-entry marker | `--status-warning` |
| Body text size | `--text-base` |
| Field padding | `--cell-padding-x` / `--cell-padding-y` |
| Corner radius | `--radius` |

## 7. Content Guidelines

- The placeholder states the accepted separators by example, never the rules in
  prose: `AAPL, MSFT, NVDA` or one symbol per line.
- The counter reads as a sentence, not a fraction: "412 symbols recognised, 3 not
  recognised".
- A rejected entry names itself and the reason: "ZZZZ — not a valid symbol
  format". It never says "invalid input".
- Symbols normalise to upper case on blur. Normalising while typing fights the
  user.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Keep accepted entries when some are rejected | Reject the whole paste over one bad line |
| Report how many entries were understood | Leave the user counting lines |
| Let `Enter` insert a newline | Bind `Enter` to submit and destroy a multi-line paste |
| Report each rejected entry with its reason | Show a single "invalid input" message |

## 9. References

- Upstream component docs: <https://ui.shadcn.com/docs/components/textarea>
- Upstream primitive / accessibility docs: no Radix primitive exists for this
  component. See the WAI-ARIA text field pattern and the HTML `textarea` element:
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea>
