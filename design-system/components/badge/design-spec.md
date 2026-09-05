---
slug: badge
name: Badge
status: stable
source: shadcn/ui Badge
upstream_docs: https://ui.shadcn.com/docs/components/badge
last_reviewed: 2026-08-21
---

# Badge

## 1. Purpose

A short, non-interactive label that classifies the record it sits on — factor classification,
recommendation state, trade mode.

**Use when:** categorising at a glance inside a table row, card header, or detail view.

**Do not use when:**
- The element performs an action — use `button` with the `outline` variant
- The text exceeds two words — use plain text or a `card` field
- Conveying a numeric value — put it in the table cell where it can be sorted

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Neutral classification |
| `secondary` | De-emphasised metadata |
| `outline` | Low-noise labelling inside dense table rows |
| `momentum` / `value` / `growth` | Factor classification; uses the matching `--factor-*` token |
| `paper` | Marks a paper-trading record |
| `real-money` | Marks a real-money record; always paired with a text label, never colour alone |
| `gain` / `loss` | Directional summary where a number is not shown |
| `status-neutral` / `status-active` / `status-good` / `status-warning` / `status-serious` / `status-critical` | The six severity tiers of STD-UI-12. Always carries a text label and an icon; never colour alone (STD-UI-8) |
| `coverage-present` / `coverage-absent` / `coverage-unknown` | The three presence states of STD-UI-14. `coverage-unknown` means the check could not run and MUST NOT read as a milder `coverage-absent`: it carries `--pattern-indeterminate` and the word *unknown*, not a dimmed absent styling |

## 3. Anatomy

Optional leading dot or icon, then the label. No dismiss control — a badge is not a chip.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Not focusable. A badge is never a tab stop. |
| Pointer | No hover state, no cursor change |

If a badge needs a click target, it is the wrong component.

## 5. Accessibility Contract

- **Role / ARIA:** no role. The badge is read as part of its row or heading.
- **Screen reader:** the label must be meaningful out of context. "Real money", not "RM".
- **Contrast:** text meets 4.5:1 against its own background, not against the page.
- **Colour independence:** the variant's meaning is carried by the label text. A screen reader user and a colour-blind user must both get the same information from the words alone.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Momentum / value / growth | `--factor-momentum` / `--factor-value` / `--factor-growth` |
| Factor label text | `--factor-foreground` |
| Paper trade | `--risk-paper` on `--risk-paper-muted` |
| Real-money trade | `--risk-real-money` on `--risk-real-money-muted` |
| Gain / loss | `--gain` on `--gain-muted` / `--loss` on `--loss-muted` |
| Severity tiers | `--status-<tier>` on `--status-<tier>-muted`, for the six tiers of STD-UI-12 |
| Coverage present / absent | `--status-good` on `--status-good-muted` / `--value-missing` on `--value-missing-muted` |
| Coverage unknown | `--value-indeterminate` on `--value-indeterminate-muted`, plus `--pattern-indeterminate` |
| Corner radius | `--radius` |

## 7. Content Guidelines

Sentence case, one or two words, no punctuation. Use the product's vocabulary consistently:
"Momentum", "Value", "Growth", "Paper", "Real money".

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Keep the label meaningful without colour | Rely on the colour to carry the meaning |
| Use the fixed factor vocabulary | Invent per-screen synonyms |
| Keep badges non-interactive | Attach a click handler |

## 9. References

- shadcn/ui Badge: <https://ui.shadcn.com/docs/components/badge>
