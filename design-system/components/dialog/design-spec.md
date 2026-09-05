---
slug: dialog
name: Dialog
status: stable
source: shadcn/ui Dialog / AlertDialog — built on Radix Primitives
upstream_docs: https://ui.shadcn.com/docs/components/dialog
last_reviewed: 2026-08-21
---

# Dialog

## 1. Purpose

Interrupts the user to collect a decision or a small amount of input, blocking the page behind
it. In FactorFlow this is also the trade-approval surface, so this spec carries stricter rules
than a general-purpose dialog.

**Use when:**
- A decision must be made before continuing, and its consequences are hard to reverse
- Confirming an action that spends real money or changes a portfolio target
- A short focused form, roughly five fields or fewer

**Do not use when:**
- Reporting the result of an action the user already took — use `toast`
- Showing supporting detail the user may want alongside the page — use a side panel or `card`
- The form is long or multi-step — use a dedicated route

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `standard` | Dismissible dialog for input or non-destructive choices |
| `confirm` | Two-choice confirmation, dismissible, no lasting consequence |
| `destructive` | Confirms deleting or discarding data; the confirm action uses `--destructive` |
| `real-money` | Confirms a trade that moves real funds. Not dismissible by click-outside. Requires explicit typed or checked acknowledgement. Uses `--risk-real-money`. |

`real-money` is the only variant permitted for real-fund trade submission. Paper trades use
`confirm` with a `--risk-paper` badge, and must never be styled as `real-money` — if both look
identical, the distinction that protects the user stops working.

## 3. Anatomy

1. **Overlay** — dims and blocks the page behind
2. **Title** — required, states the decision
3. **Description** — required for `destructive` and `real-money`; states the consequence
4. **Content** — optional form fields or a summary of what will happen
5. **Acknowledgement** — `real-money` only; explicit checkbox or typed confirmation
6. **Actions** — cancel first in DOM order, confirm last

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Cycles within the dialog only; focus never leaves while open |
| `Enter` | Activates the focused control. Never bound to the confirm action by default in `destructive` or `real-money`. |
| `Esc` | Closes `standard`, `confirm`, `destructive`. Does nothing in `real-money`. |
| Click on overlay | Closes `standard` and `confirm`. Does nothing in `destructive` or `real-money`. |

- **Initial focus** goes to the least destructive control: the cancel action for `destructive` and `real-money`, the first field for `standard`.
- **Confirm stays disabled** in `real-money` until the acknowledgement is satisfied.
- **Submitting:** disable the confirm action and show progress in place. Never close the dialog before the result is known — a dialog that closes optimistically on a real trade can leave the user unsure whether it was placed.
- **On failure:** keep the dialog open, keep the entered values, show the error inside it.

## 5. Accessibility Contract

- **Role / ARIA:** `role="dialog"` with `aria-modal="true"`. `aria-labelledby` points at the title; `aria-describedby` at the description. `destructive` and `real-money` use `alertdialog`.
- **Focus management:** focus moves into the dialog on open and returns to the triggering element on close. Focus is trapped while open.
- **Screen reader:** the title and description are announced on open. For `real-money`, the description must state the instrument, direction, quantity, and estimated value in text — not only in a visual summary table.
- **Contrast and target size:** action buttons are at least 44×44 CSS pixels in `destructive` and `real-money`.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Surface | `--popover` |
| Body text | `--popover-foreground` |
| Border | `--border` |
| Destructive confirm action | `--destructive` |
| Real-money confirm action | `--risk-real-money` |
| Real-money banner background | `--risk-real-money-muted` |
| Paper-trade indicator | `--risk-paper` |

## 7. Content Guidelines

- The title names the action, not the question: "Submit real-money order", not "Are you sure?".
- The confirm label restates the verb: "Submit order", never "OK" or "Yes".
- The description states what happens and what it costs, with concrete numbers.
- Cancel is always labelled "Cancel".

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Focus cancel first for irreversible actions | Focus the confirm action and let `Enter` fire it |
| Keep the dialog open until the result is known | Close optimistically and report by toast |
| Make real-money visually distinct from paper | Reuse the same confirmation for both |
| State amounts in the description text | Convey the amount only in a visual table |

## 9. References

- shadcn/ui Dialog: <https://ui.shadcn.com/docs/components/dialog>
- shadcn/ui Alert Dialog: <https://ui.shadcn.com/docs/components/alert-dialog>
- Radix Dialog accessibility: <https://www.radix-ui.com/primitives/docs/components/dialog#accessibility>
- WAI-ARIA alert dialog pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/>
