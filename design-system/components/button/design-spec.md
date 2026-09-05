---
slug: button
name: Button
status: stable
source: shadcn/ui Button — built on Radix Slot
upstream_docs: https://ui.shadcn.com/docs/components/button
last_reviewed: 2026-08-21
---

# Button

## 1. Purpose

Triggers an action in place. The most common interactive element; its variant communicates how
consequential the action is.

**Use when:** the user performs an action — submitting, approving, refreshing, opening a dialog.

**Do not use when:**
- Navigating to another route — use a link, so middle-click and open-in-new-tab work
- Toggling a persistent binary state — use a switch or `badge` filter
- Choosing among options — use `select` or `tabs`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | The primary action of a view. At most one per screen region. |
| `secondary` | Supporting actions shown alongside the primary |
| `outline` | Low-emphasis actions in toolbars and table rows |
| `ghost` | Icon-only or in-row actions where a border would add noise |
| `destructive` | Deletes or discards data. Never the initial focus in a dialog. |
| `link` | Renders as text; use only inside prose |
| `blocked` | An action that cannot yet be taken, with the reason stated inline beside it (STD-UI-19, STD-UI-23). Used where a precondition is unmet — history depth not stated, no instruments named. It stays focusable and exposes the reason through `aria-describedby`; a plain `disabled` button is not focusable, so the reason never reaches a keyboard or screen-reader user |

There is no real-money button variant. Real-money confirmation is a property of `dialog`, not of
the button that opens it — the button only opens the dialog, it never places the trade.

## 3. Anatomy

Optional leading icon, label, optional trailing icon. Icon-only buttons require an accessible
name and a tooltip.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the button; visible focus ring is required |
| `Enter` / `Space` | Activates |
| Pointer | Activates on release within bounds |

- **Loading:** disable and show a spinner while preserving the button's width, so the layout does not shift. Keep the label; do not replace it with the spinner alone.
- **Disabled:** never the only explanation. Pair with helper text or a tooltip stating what would enable it.
- **Never** disable a submit button purely to prevent double submission — handle idempotency in the request and keep the control operable.

## 5. Accessibility Contract

- **Role / ARIA:** native `<button>`. Icon-only buttons carry `aria-label`. `aria-busy` while loading.
- **Focus management:** activating a button that opens an overlay moves focus into it and returns focus here on close.
- **Screen reader:** the accessible name states the action and its object — "Approve trade", not "Approve".
- **Contrast and target size:** at least 24×24 CSS pixels; 44×44 for destructive and trade actions.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Primary background / text | `--primary` / `--primary-foreground` |
| Secondary background / text | `--secondary` / `--secondary-foreground` |
| Destructive background / text | `--destructive` / `--destructive-foreground` |
| Border (outline) | `--border` |
| Focus ring | `--ring` |
| Corner radius | `--radius` |

## 7. Content Guidelines

Sentence case. Start with a verb. Two or three words. No trailing punctuation. Prefer the
specific verb over "Submit" or "OK".

## 8. Do / Don't

| Do | Don't |
|----|-------|
| One `default` button per screen region | Compete for attention with several primaries |
| Explain why a disabled button is disabled | Leave the user guessing |
| Use a link for navigation | Use a button and break open-in-new-tab |

## 9. References

- shadcn/ui Button: <https://ui.shadcn.com/docs/components/button>
- WAI-ARIA button pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/button/>
