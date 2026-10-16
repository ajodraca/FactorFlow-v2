---
slug: data-table
name: Data Table
status: stable
source: shadcn/ui Table + TanStack Table v8 — headless sorting, filtering, pagination
upstream_docs: https://ui.shadcn.com/docs/components/data-table
last_reviewed: 2026-08-21
---

# Data Table

## 1. Purpose

Presents many rows of comparable records — stock rankings, portfolio holdings, trade history —
with sorting, filtering, and pagination. This is the primary surface of FactorFlow and the
component most screens are built around.

**Use when:**
- Records are comparable across a fixed set of columns and the user scans or ranks them
- The user needs to sort or filter to find a record
- Row count can exceed roughly 20

**Do not use when:**
- Showing the attributes of a single entity — use `card` with a description list
- Fewer than about 5 static rows with no sorting — a plain `table` is lighter
- The primary task is comparing a trend over time — use `chart`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `ranking` | Ordered list with a visible rank column; default sort is the rank itself |
| `holdings` | Portfolio positions; includes a totals row pinned to the bottom |
| `history` | Immutable past records (executed trades); no row selection, no row actions |
| `compact` | Embedded in a card or side panel; reduced row height, no pagination |
| `virtualised` | Lists that can reach the committed volume (3,000 rows) and need search and filter rather than pagination (STD-UI-30). Rows render in a windowed list; sorting, filtering and counting run server-side over the full set. Row checkboxes and a selected row (`aria-selected`) are supported. Closes the gap CAP-001's conformance record notes against STD-UI-30 |
| `expandable` | One row per record with a secondary level of detail behind per-row expansion. Rows are collapsed by default. Required wherever the row count can reach the volume a capability commits to and each row carries sub-records — an expanded-by-default view at that volume is unreadable (STD-UI-30) |

## 3. Anatomy

1. **Toolbar** (optional) — filter input, faceted filters, column visibility control
2. **Header row** — one cell per visible column; sortable cells carry a sort control
3. **Body rows** — one per record; optional selection checkbox as the first cell
4. **Totals row** (`holdings` only) — pinned, visually distinct from body rows
5. **Empty state** — replaces the body when zero rows match
6. **Pagination** — row count, page size selector, page controls

Header row and body rows are required. Everything else is optional per variant.

## 4. Interaction Contract

| Input | Result |
|-------|--------|
| `Tab` | Moves through toolbar, then interactive cells, then pagination. Non-interactive cells are not tab stops. |
| `Enter` / `Space` on a sort control | Cycles ascending → descending → unsorted |
| `Space` on a row checkbox | Toggles that row's selection |
| Click on a row (when the variant defines a row target) | Opens the record's detail view |

- **Sorting** is server-side for any table that can exceed one page. Never sort only the current page — it produces a silently wrong ranking.
- **Loading:** show a skeleton of the expected row count on first load. On re-sort or re-filter, keep existing rows visible and dim them; never collapse the table to a spinner, which loses the user's place.
- **Empty:** distinguish "no records exist yet" from "no records match your filter" — the second must offer a clear filter reset.
- **Error:** keep the header and toolbar rendered, replace the body with the error and a retry action.

## 5. Accessibility Contract

- **Role / ARIA:** native `<table>` semantics. Sortable headers carry `aria-sort` with the current state. The selection checkbox has an accessible name identifying its row, not just "select".
- **Focus management:** sorting or filtering must not move focus. After the rows update, announce the new row count via a polite live region.
- **Screen reader:** every column header is programmatically associated with its cells. Numeric cells whose meaning depends on colour (gain/loss) must also carry the sign in their text.
- **Contrast and target size:** sort controls and checkboxes are at least 24×24 CSS pixels.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Row and header separators | `--border` |
| Header text | `--muted-foreground` |
| Body text | `--foreground` |
| Row hover and selected background | `--muted` |
| Positive numeric values | `--gain` |
| Negative numeric values | `--loss` |
| Unchanged or zero values | `--neutral-value` |
| Numeric column font | `--font-numeric` |
| No observation exists | `--value-missing` (rendered as an em dash, never as `0`) |
| Check could not run | `--value-indeterminate` with `--pattern-indeterminate` |
| Row height | `--row-height` |
| Cell padding | `--cell-padding-x` / `--cell-padding-y` |
| Dense body text | `--text-sm` |

## 7. Content Guidelines

- Numeric columns are right-aligned; text columns are left-aligned. Never centre either.
- All numeric columns use `--font-numeric` (tabular figures) so digits align vertically.
- Fix decimal places per column. A column mixing `1.5` and `1.50` is a defect.
- Percentages carry an explicit sign: `+2.40%`, `−1.05%`. Currency carries its symbol in the header, not repeated in every cell.
- Column headers are sentence case, no trailing colon.
- Dates render ISO-8601 (`YYYY-MM-DD`), never locale-formatted; timestamps carry a visible zone (STD-UI-5). As-of dates are evidence in this product, and day-first versus month-first ambiguity is a real error mode.
- A cell with no observation renders an em dash, never `0` and never blank. Blank means the column does not apply to that row (STD-UI-4).
- A column whose value could not be determined carries `--pattern-indeterminate` and a label; it never renders as an ordinary missing value (STD-UI-14).

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Pair gain/loss colour with a sign or arrow | Rely on colour alone to convey direction |
| Sort server-side across the full result set | Sort the current page and call it a ranking |
| Keep stale rows visible while refreshing | Replace the table with a spinner on every sort |
| State what "no results" means and how to clear it | Render an empty body with no explanation |

## 9. References

- shadcn/ui Data Table: <https://ui.shadcn.com/docs/components/data-table>
- TanStack Table: <https://tanstack.com/table/latest>
- WAI-ARIA sortable table pattern: <https://www.w3.org/WAI/ARIA/apg/patterns/table/>
