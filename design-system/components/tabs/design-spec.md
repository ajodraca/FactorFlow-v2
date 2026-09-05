---
slug: tabs
name: Tabs
status: stable
source: shadcn/ui Tabs — built on Radix Tabs
upstream_docs: https://ui.shadcn.com/docs/components/tabs
last_reviewed: 2026-08-21
---

# Tabs

## 1. Purpose

Switches between alternative views of the same subject without leaving the page — a stock's
factors, fundamentals, and price history.

**Use when:** two to six mutually exclusive views describe one subject and the user compares
them by switching.

**Do not use when:**
- The panels are unrelated — use navigation, so each gets its own URL
- The user needs to see two panels at once — use a two-column layout
- There are more than about six panels — use navigation or a `select`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Horizontal tabs above the panel |
| `pill` | Compact toggling inside a `card` header |

## 3. Anatomy

Tab list, one tab trigger per panel, active indicator, and the panel itself.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Enters the tab list at the active tab, then moves to the panel |
| Arrow left / right | Moves between tabs |
| `Home` / `End` | First / last tab |
| `Enter` / `Space` | Activates the focused tab when activation is manual |

- Only the active tab is in the page tab order; arrow keys move within the list. Radix handles this — do not re-implement.
- The active tab is reflected in the URL so a view can be linked and survives reload.
- Panel state persists while switching: filters and scroll position in one panel are not reset by visiting another.
- Load panel content lazily on first activation, but keep it mounted afterwards.

## 5. Accessibility Contract

- **Role / ARIA:** `tablist`, `tab`, `tabpanel` with `aria-selected` and `aria-controls`, supplied by Radix.
- **Focus management:** activating a tab does not move focus into the panel. The panel is focusable so the next `Tab` reaches its content.
- **Screen reader:** each tab's accessible name states its content, not a bare ordinal.
- **Contrast:** the active indicator meets 3:1 and is not conveyed by colour alone — weight or an underline must also change.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Active tab text | `--foreground` |
| Inactive tab text | `--muted-foreground` |
| Active indicator | `--primary` |
| List border | `--border` |
| Focus ring | `--ring` |

## 7. Content Guidelines

One or two words, sentence case, nouns. Order by expected use, most common first.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Reflect the active tab in the URL | Lose the view on reload |
| Preserve each panel's state | Reset filters when the user returns |
| Change weight as well as colour | Signal the active tab by colour alone |

## 9. References

- shadcn/ui Tabs: <https://ui.shadcn.com/docs/components/tabs>
- Radix Tabs accessibility: <https://www.radix-ui.com/primitives/docs/components/tabs#accessibility>
