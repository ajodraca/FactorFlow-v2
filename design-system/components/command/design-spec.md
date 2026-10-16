---
slug: command
name: Command
status: beta
source: shadcn/ui Command — built on cmdk, whose dialog composes Radix Dialog
upstream_docs: https://ui.shadcn.com/docs/components/command
last_reviewed: 2026-10-15
---

# Command

## 1. Purpose

The command palette: one keyboard-first place to jump to any stock, strategy,
universe or page, and to run a few routine actions.

**Use when:** the user knows the name of what they want and the product has
more destinations than the rail shows.

**Do not use when:**
- Filtering a table — use the table's toolbar filter
- Choosing a value inside a form — use `select`
- Any capital-at-risk or protective action — those have one fixed control each

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `dialog` | The global palette, opened by `⌘K` / `Ctrl+K` or the top-bar button. The only variant this product uses |

## 3. Anatomy

`CommandDialog` → `CommandInput` (search), `CommandList` → `CommandEmpty`,
`CommandGroup`s with headings (*Stocks*, *Strategies*, *Universes*, *Pages*,
*Actions*), `CommandItem`s, `CommandSeparator`, optional `CommandShortcut`
hints.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `⌘K` / `Ctrl+K` anywhere outside a text field | Opens the palette (the application's own listener; cmdk does not provide it) |
| Typing | Filters and ranks items (cmdk default; `keywords` give aliases such as company names for symbols) |
| `ArrowDown` / `ArrowUp` | Moves the active item; wraps when `loop` is set, which this product sets |
| `Enter` | Runs the active item's `onSelect` |
| `Escape` | Closes and returns focus to the element that opened it |
| Pointer | Hover makes an item active; click selects |

- Stock and strategy results come from the server (`shouldFilter={false}` for
  those groups); pages and actions filter locally.
- While server results load, show `Command.Loading` with *Searching…*.

## 5. Accessibility Contract

- **Role / ARIA:** cmdk renders an accessible combobox with a listbox of
  options; `CommandDialog` composes Radix Dialog, which traps focus and
  restores it on close.
- **Labelling:** the dialog is labelled *Search FactorFlow*; the input has a
  visible placeholder and an accessible label.
- **Screen reader:** group headings are announced; the empty state is text.
- **Focus management:** opening focuses the input; closing returns focus to the
  opener.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Surface / text | `--popover` / `--popover-foreground` |
| Active item | `--accent` / `--accent-foreground` |
| Group headings, shortcuts | `--muted-foreground`, `--text-xs` |
| Overlay | `--foreground` at 40% |
| Corner radius | `--radius` |

## 7. Content Guidelines

Items are named as they appear elsewhere (*KO · Coca-Cola*, *Quality Value
Monthly*). Actions start with a verb (*Download now*). Empty state: *Nothing
matches "{query}".*

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Use it as a shortcut to places that also exist in the UI | Hide functionality only in the palette |
| Keep actions routine | Offer Stop all trading, Go live or Resume trading |

## 9. References

- shadcn/ui Command: <https://ui.shadcn.com/docs/components/command>
- cmdk: <https://github.com/dip/cmdk>
- Radix Dialog: <https://www.radix-ui.com/primitives/docs/components/dialog>
