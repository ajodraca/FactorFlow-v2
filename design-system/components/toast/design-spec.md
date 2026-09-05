---
slug: toast
name: Toast
status: stable
source: shadcn/ui Sonner
upstream_docs: https://ui.shadcn.com/docs/components/sonner
last_reviewed: 2026-09-05
---

# Toast

## 1. Purpose

Confirms the outcome of an action the user already took, without interrupting them.

**Use when:** an action succeeded and the result is not visible on screen, or a background task
finished.

**Do not use when:**
- The user must decide something — use `dialog`
- The error belongs to a field — show it in `form`
- Confirming a real-money trade result — that outcome belongs in the dialog that placed it, because a toast can be missed and the user is left unsure whether the order went through
- The result is already visible on screen — a toast for a change the user can see is noise

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `success` | The action completed |
| `error` | The action failed and there is nothing to fix in a form |
| `warning` | Completed with a caveat worth knowing |
| `info` | Neutral background event, such as a completed data refresh |

## 3. Anatomy

Optional icon, message, optional description, optional single action, optional dismiss control.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Reaches the toast's action and dismiss control while visible |
| `Esc` | Dismisses the focused toast |
| Pointer hover | Pauses auto-dismiss |

- `success` and `info` auto-dismiss after about five seconds. `error` and `warning` persist until dismissed — an error the user did not read is an error that did not happen.
- At most one action per toast, and it must be a shortcut, never the only way to do something.
- Stack at most three; collapse the rest rather than covering the screen.
- Never use a toast to report an error the user could act on inside a form.

## 5. Accessibility Contract

- **Role / ARIA:** `status` with a polite live region for `success` and `info`; `alert` with an assertive region for `error` and `warning`.
- **Focus management:** a toast never steals focus. Auto-dismiss pauses while it or its action holds focus.
- **Screen reader:** the message is self-contained — "Portfolio target saved", not "Saved".
- **Contrast and target size:** dismiss control at least 24×24 CSS pixels.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Surface / text | `--popover` / `--popover-foreground` |
| Border | `--border` |
| Success accent | `--status-good` |
| Error accent | `--status-critical` |
| Warning accent | `--status-warning` |
| Info accent | `--status-neutral` |
| Corner radius | `--radius` |

## 7. Content Guidelines

One sentence, past tense, naming the object: "Trade approved", "Ranking refreshed". No trailing
period on a single fragment. Errors state what failed and the next step.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Persist errors until dismissed | Auto-dismiss an error in five seconds |
| Keep the message self-contained | Use "Done" with no object |
| Report trade outcomes in the dialog | Rely on a toast for a real-money result |

## 9. References

- shadcn/ui Sonner: <https://ui.shadcn.com/docs/components/sonner>
- WAI-ARIA live regions: <https://www.w3.org/WAI/ARIA/apg/practices/live-regions/>
