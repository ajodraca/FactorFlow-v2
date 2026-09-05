---
slug: card
name: Card
status: stable
source: shadcn/ui Card
upstream_docs: https://ui.shadcn.com/docs/components/card
last_reviewed: 2026-08-21
---

# Card

## 1. Purpose

Groups related content about a single subject into one bounded surface — a position summary, a
key metric, a recommendation detail.

**Use when:** presenting the attributes of one entity, or a single headline metric.

**Do not use when:**
- Showing many comparable records — use `data-table`
- The content is a decision that blocks the user — use `dialog`
- Grouping form fields — use `form`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Titled container with optional footer actions |
| `metric` | One large number with a label and optional change indicator |
| `summary` | Description list of an entity's attributes |
| `chart` | Wraps a `chart` with its title and legend |

## 3. Anatomy

Header with title and optional action, optional description, content, optional footer. In
`metric`: label, value, optional change indicator, optional comparison period.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Reaches only the interactive controls inside; the card itself is not a tab stop |
| Pointer | No hover state unless the whole card is a link |

- If the entire card navigates, it must contain exactly one interactive element — nesting a button inside a clickable card produces an unreachable control.
- **Loading:** show a skeleton matching the final layout, so the card does not resize on load.
- **Empty:** state what is missing and why, not a blank surface.

## 5. Accessibility Contract

- **Role / ARIA:** no special role. The card title is a real heading at the right level for the page outline.
- **Screen reader:** in `metric`, the value's accessible text includes its unit and direction — "Down 1.05 percent", not "1.05".
- **Contrast:** the card surface meets 3:1 against the page background where the border is the only separator.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Surface / text | `--card` / `--card-foreground` |
| Border | `--border` |
| Description and labels | `--muted-foreground` |
| Positive / negative change | `--gain` / `--loss` |
| Unchanged | `--neutral-value` |
| Metric value font | `--font-numeric` |
| Corner radius | `--radius` |

## 7. Content Guidelines

Titles are sentence case noun phrases. A `metric` card shows one number; a second number is a
comparison, not a competing metric. Always state the period a metric covers.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| One metric per `metric` card | Crowd three numbers in and lose the headline |
| Pair change colour with a sign | Rely on red/green alone |
| Skeleton to the final layout | Let the card jump in size on load |

## 9. References

- shadcn/ui Card: <https://ui.shadcn.com/docs/components/card>
