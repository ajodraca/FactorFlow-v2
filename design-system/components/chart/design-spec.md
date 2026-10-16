---
slug: chart
name: Chart
status: stable
source: shadcn/ui Chart — Recharts wrapper using theme CSS custom properties
upstream_docs: https://ui.shadcn.com/docs/components/chart
last_reviewed: 2026-08-21
---

# Chart

## 1. Purpose

Shows a quantitative relationship that is hard to read from a table — a trend over time, a
distribution, or a composition.

**Use when:** the shape of the data is the message: price history, factor score distribution,
portfolio allocation, cumulative return.

**Do not use when:**
- The user needs exact values to compare or act on — use `data-table`
- There are fewer than about four data points — a table or `metric` card is clearer
- Showing a single current value — use a `metric` card

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `line` | A continuous series over time, such as price or cumulative return |
| `bar` | Comparing a value across discrete categories, such as factor scores by sector |
| `area` | A cumulative total over time where the magnitude matters |
| `scatter` | Relationship between two factors across the universe |

| `sparkline` | A single-series trend inside a list row or tile: no axes, no legend, 2 px line in `--chart-1`. Its accessible name states the direction and period (*Rising over 30 days*), and the row links to where the full series and its table live (STD-UI-28) |

**Period bands** are an annotation available on `line`: named date ranges shaded in `--muted` behind the series, labelled at the top of the band in `--chart-axis` at `--text-xs`. They mark market periods (*2022 drawdown*) for comparison and are listed in the chart's table equivalent. A band never carries a series colour.

There is no pie variant. Composition is read more accurately from a bar chart or a table with
percentages, and allocation accuracy matters here.

## 3. Anatomy

Title (owned by the enclosing `card`), plot area, axes with labels and units, gridlines, series,
optional legend, tooltip, empty state.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Focuses the chart as a single stop, then its legend controls |
| Arrow left / right | Moves through data points, announcing each |
| Pointer hover | Shows the tooltip for the nearest point |

- The tooltip shows the point's exact value with its unit; the chart is for shape, the tooltip for precision.
- A time axis always states its range and granularity. Never render an unlabelled axis.
- **Loading:** reserve the final plot area and show a skeleton, so the page does not reflow.
- **Empty:** state why there is no data — "No price history before 2024-01-01" — not a blank plot.
- Zero baselines are shown for bar and area charts. A truncated y-axis on a returns chart misrepresents the magnitude of a move.

## 5. Accessibility Contract

- **Role / ARIA:** `role="img"` with an `aria-label` summarising the trend in words — "S&P 500 cumulative return, January to August 2026, up 12 percent".
- **Focus management:** the chart is one tab stop; point-by-point reading is via arrow keys.
- **Screen reader:** every chart has an accessible alternative — either an adjacent `data-table` or a visually hidden table of the same series. A chart is never the only representation of data the user needs.
- **Contrast and colour independence:** series are distinguished by more than colour — line style, marker shape, or direct labelling. Series colours meet 3:1 against the plot background.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Series colours in order | `--chart-1` … `--chart-6` |
| Gridlines | `--chart-grid` |
| Axis lines and tick labels | `--chart-axis` |
| Positive / negative series or region | `--gain` / `--loss` |
| Tooltip surface / text | `--popover` / `--popover-foreground` |
| Numeric labels | `--font-numeric` |

Series take `--chart-1` onward in order, and a series keeps its colour across every screen it
appears on. Reassigning colours per chart makes two views of the same data look unrelated.

## 7. Content Guidelines

Axis labels state the unit: "Return (%)", "Date". Fix decimal places per series. Legend entries
use the same names as the corresponding table columns.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Provide a table alternative | Ship a chart as the only representation |
| Keep a series' colour stable across screens | Recolour per chart |
| Show a zero baseline on bar and area | Truncate the axis and exaggerate a move |
| Distinguish series beyond colour | Rely on hue alone in a six-series chart |

## 9. References

- shadcn/ui Chart: <https://ui.shadcn.com/docs/components/chart>
- Recharts: <https://recharts.org/>
- WAI complex images guidance: <https://www.w3.org/WAI/tutorials/images/complex/>
