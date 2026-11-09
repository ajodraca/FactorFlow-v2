import {
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type Row,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, memo, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./button";
import { cn } from "./utils";

/**
 * Rows the `virtualised` scroller shows at once. DEC-0306: the counts follow
 * CAP-002's `results-window.ts` (DEC-0160), the one hand-built windowing over
 * keyset pages in the product.
 */
export const VIEWPORT_ROWS = 15;
/** Rows rendered above and below the viewport so one fast scroll step shows no blank frame (DEC-0306). */
export const OVERSCAN_ROWS = 10;
/** The next keyset page is requested when the window's end is this close to the loaded end (DEC-0306). */
export const PREFETCH_ROWS = 20;

export interface VisibleWindow {
  /** Index of the first rendered row. */
  start: number;
  /** Index after the last rendered row. */
  end: number;
  /** Height of the spacer above the rendered rows, in pixels. */
  padTop: number;
  /** Height of the spacer below the rendered rows, in pixels. */
  padBottom: number;
}

/**
 * The rows to render for `scrollTop`: an overscan above the first visible
 * row to an overscan below the viewport, clamped to the loaded rows, with the
 * spacer heights that keep the scroll height at the full content height.
 * `extraHeights` maps a row index to the measured height of that row's open
 * expansion, which lies below the row's own top (DEC-0306). A row height of
 * zero (no layout) or a negative or NaN `scrollTop` is the top window.
 */
export function windowFor({
  scrollTop,
  rowHeight,
  rowCount,
  extraHeights,
}: {
  scrollTop: number;
  rowHeight: number;
  rowCount: number;
  extraHeights: ReadonlyMap<number, number>;
}): VisibleWindow {
  const extras = Array.from(extraHeights);
  const topOf = (index: number): number =>
    index * rowHeight + extras.reduce((sum, [at, height]) => (at < index ? sum + height : sum), 0);
  const total = topOf(rowCount);
  let first = 0;
  if (rowHeight > 0) {
    // The last row whose top is at or above scrollTop; tops only grow with the index.
    // A negative or NaN scrollTop matches no row, which leaves the first.
    let low = 0;
    let high = rowCount - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (topOf(middle) <= scrollTop) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    first = low;
  }
  const end = Math.min(rowCount, first + VIEWPORT_ROWS + OVERSCAN_ROWS);
  const start = Math.min(end, Math.max(0, first - OVERSCAN_ROWS));
  return { start, end, padTop: topOf(start), padBottom: total - topOf(end) };
}

declare module "@tanstack/react-table" {
  // The type parameters must match the declaration they merge with.
  interface ColumnMeta<TData, TValue> {
    /** Right-aligns the column and sets it in the numeric face. */
    numeric?: boolean;
  }
}

interface CommonProps<TRow> {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own column typing
  columns: ColumnDef<TRow, any>[];
  data: TRow[];
  getRowId: (row: TRow) => string;
  /** The sorting to declare with `aria-sort`; the caller sorts server-side. */
  sorting?: SortingState;
  /** Given, sortable columns get a sort control; the caller turns the change into its request. */
  onSortingChange?: OnChangeFn<SortingState>;
  /** First cell of each row is a row header; always on for `history`. */
  rowHeader?: boolean;
  /** Sets `aria-busy` and holds back `onEndReached`. */
  busy?: boolean;
}

interface ExpansionProps<TRow> {
  renderExpansion: (row: TRow) => ReactNode;
  getRowLabel: (row: TRow) => string;
}

export type DataTableProps<TRow> = CommonProps<TRow> &
  (
    | { variant: "compact" | "history" }
    | ({ variant: "expandable" } & ExpansionProps<TRow>)
    | ({
        variant: "virtualised";
        hasMore: boolean;
        onEndReached: () => void;
      } & (ExpansionProps<TRow> | { renderExpansion?: never; getRowLabel?: never }))
  );

interface RowProps<TRow> {
  row: Row<TRow>;
  index: number;
  expanded: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own column typing
  columns: ColumnDef<TRow, any>[];
  rowHeader: boolean;
  expansion?: ExpansionProps<TRow>;
  windowed: boolean;
}

function RowImpl<TRow>({
  row,
  index,
  expanded,
  rowHeader,
  expansion,
  windowed,
  columns,
}: RowProps<TRow>) {
  const detailId = useId();
  const cellClass = "px-[var(--cell-padding-x)] py-[var(--cell-padding-y)] align-middle";
  const cells = row.getVisibleCells();
  return (
    <>
      <tr
        data-row-id={row.id}
        aria-rowindex={windowed ? index + 2 : undefined}
        className="h-row border-b border-border hover:bg-muted"
      >
        {expansion ? (
          <td className={cellClass}>
            <Button
              variant="ghost"
              className="h-5 w-5 p-0"
              aria-expanded={expanded}
              aria-controls={detailId}
              aria-label={`Expand ${expansion.getRowLabel(row.original)}`}
              onClick={row.getToggleExpandedHandler()}
            >
              {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </Button>
          </td>
        ) : null}
        {cells.map((cell, position) => {
          const numeric = cell.column.columnDef.meta?.numeric;
          const content = flexRender(cell.column.columnDef.cell, cell.getContext());
          if (position === 0 && rowHeader) {
            return (
              <th
                key={cell.id}
                scope="row"
                className={cn(
                  cellClass,
                  "text-left font-medium",
                  numeric && "text-right font-numeric",
                )}
              >
                {content}
              </th>
            );
          }
          return (
            <td key={cell.id} className={cn(cellClass, numeric && "text-right font-numeric")}>
              {content}
            </td>
          );
        })}
      </tr>
      {expansion && expanded ? (
        <tr id={detailId} data-expansion-for={row.id} className="border-b border-border">
          <td colSpan={columns.length + 1}>
            <div aria-live="polite">{expansion.renderExpansion(row.original)}</div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

/**
 * TanStack recreates `Row` objects on every new `data`, so the comparison is
 * by the record's identity, which an appended keyset page leaves unchanged.
 * Callers keep `columns` and loaded records referentially stable, or earlier
 * rows re-render on every page. An open row also follows `renderExpansion` and
 * `getRowLabel`, so detail the caller loads into its own state reaches it
 * (DEC-0307); a collapsed row reads them when it opens and stays memoised.
 */
const DataTableRow = memo(
  RowImpl,
  (a, b) =>
    a.row.original === b.row.original &&
    a.expanded === b.expanded &&
    a.index === b.index &&
    a.columns === b.columns &&
    a.rowHeader === b.rowHeader &&
    (!a.expanded ||
      (a.expansion?.renderExpansion === b.expansion?.renderExpansion &&
        a.expansion?.getRowLabel === b.expansion?.getRowLabel)),
) as typeof RowImpl;

/**
 * The design-system `data-table` on TanStack Table v8 (component design 2.1
 * and 3; data-table spec sections 2 and 4-6): `compact`, `history`,
 * `expandable` and `virtualised` variants over one controlled table. Sorting
 * is the caller's (server-side, spec section 4): `sorting` is declared with
 * `aria-sort` and `onSortingChange` receives the cycle ascending, descending,
 * unsorted. Every row consumes `--row-height` through `h-row`; the window
 * arithmetic measures the rendered height, so no literal sits outside the
 * theme (DAC-E1-S4-2, DAC-E1-S4-3; DEC-0306, DEC-0307).
 */
export function DataTable<TRow>(props: DataTableProps<TRow>) {
  const { columns, data, getRowId, sorting, onSortingChange, busy, variant } = props;
  const rowHeader = variant === "history" || props.rowHeader === true;
  // `renderExpansion` and `getRowLabel` come as a pair, so one is enough to test.
  const { renderExpansion, getRowLabel } = props as Partial<ExpansionProps<TRow>>;
  const expansion: ExpansionProps<TRow> | undefined = renderExpansion
    ? { renderExpansion, getRowLabel: getRowLabel as ExpansionProps<TRow>["getRowLabel"] }
    : undefined;
  const windowed = variant === "virtualised";
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: onSortingChange !== undefined,
    defaultColumn: { enableSorting: false },
    enableMultiSort: false,
    sortDescFirst: false,
    state: { sorting: sorting ?? [], expanded },
    onSortingChange,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => expansion !== undefined,
  });
  // No sorted or expanded row model is wired: rows keep the caller's order (the
  // sort is server-side) and expansion is this component's own state, keyed by
  // `getRowId`, so neither resets when an appended page changes `data`.
  const rows = table.getRowModel().rows;
  const rowCount = rows.length;

  const [scrollTop, setScrollTop] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [extraHeights, setExtraHeights] = useState<ReadonlyMap<number, number>>(new Map());
  const tableRef = useRef<HTMLTableElement>(null);
  const measured = useRef(new Map<string, number>());

  // Measure the rendered row and each open expansion; jsdom reports zero, which is the top window.
  useLayoutEffect(() => {
    if (!windowed || !tableRef.current) {
      return;
    }
    const firstRow = tableRef.current.querySelector("tr[data-row-id]");
    const height = firstRow ? firstRow.getBoundingClientRect().height : 0;
    if (height > 0) {
      setRowHeight(height);
    }
    const open = new Set(rows.filter((row) => row.getIsExpanded()).map((row) => row.id));
    for (const id of Array.from(measured.current.keys())) {
      if (!open.has(id)) {
        measured.current.delete(id);
      }
    }
    for (const detail of Array.from(tableRef.current.querySelectorAll("tr[data-expansion-for]"))) {
      const id = detail.getAttribute("data-expansion-for") ?? "";
      measured.current.set(id, detail.getBoundingClientRect().height);
    }
    const next = new Map<number, number>();
    rows.forEach((row, index) => {
      const extra = measured.current.get(row.id);
      if (extra !== undefined) {
        next.set(index, extra);
      }
    });
    const same =
      next.size === extraHeights.size &&
      Array.from(next).every(([index, extra]) => extraHeights.get(index) === extra);
    if (!same) {
      setExtraHeights(next);
    }
  });

  const visible: VisibleWindow = windowed
    ? windowFor({ scrollTop, rowHeight, rowCount, extraHeights })
    : { start: 0, end: rowCount, padTop: 0, padBottom: 0 };

  const paging = props.variant === "virtualised" ? props : undefined;
  // One request per page of data: the loaded count and its first row name it, so
  // replacing the rows (a sort or filter) with as many as before asks again.
  const firedFor = useRef<string | null>(null);
  const loadedKey = `${rows[0]?.id ?? ""}/${rowCount}`;
  useEffect(() => {
    if (paging?.hasMore && !busy && visible.end + PREFETCH_ROWS >= rowCount) {
      if (firedFor.current !== loadedKey) {
        firedFor.current = loadedKey;
        paging.onEndReached();
      }
    }
  });

  const headerCell =
    "px-[var(--cell-padding-x)] py-[var(--cell-padding-y)] text-left align-middle font-medium text-muted-foreground";
  const body = (
    <table
      ref={tableRef}
      data-variant={variant}
      aria-busy={busy || undefined}
      aria-rowcount={windowed ? rowCount + 1 : undefined}
      className="w-full caption-bottom text-sm"
    >
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr
            key={group.id}
            className={cn("h-row border-b border-border", windowed && "sticky top-0 bg-background")}
          >
            {expansion ? (
              <th scope="col" className={headerCell}>
                <span className="sr-only">Details</span>
              </th>
            ) : null}
            {group.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const numeric = header.column.columnDef.meta?.numeric;
              const label = flexRender(header.column.columnDef.header, header.getContext());
              return (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={
                    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
                  }
                  className={cn(headerCell, numeric && "text-right font-numeric")}
                >
                  {header.column.getCanSort() ? (
                    <Button
                      variant="ghost"
                      className="h-5 gap-1 px-1 py-0"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {label}
                      {sorted === "asc" ? (
                        <ArrowUp aria-hidden="true" />
                      ) : sorted === "desc" ? (
                        <ArrowDown aria-hidden="true" />
                      ) : (
                        <ArrowUpDown aria-hidden="true" />
                      )}
                    </Button>
                  ) : (
                    label
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {visible.padTop > 0 ? (
          // biome-ignore lint/a11y/noAriaHiddenOnFocusable: an empty spacer row holds nothing focusable
          <tr data-spacer="top" aria-hidden="true" style={{ height: visible.padTop }} />
        ) : null}
        {rows.slice(visible.start, visible.end).map((row, offset) => (
          <DataTableRow
            key={row.id}
            row={row}
            index={visible.start + offset}
            expanded={row.getIsExpanded()}
            columns={columns}
            rowHeader={rowHeader}
            expansion={expansion}
            windowed={windowed}
          />
        ))}
        {visible.padBottom > 0 ? (
          // biome-ignore lint/a11y/noAriaHiddenOnFocusable: an empty spacer row holds nothing focusable
          <tr data-spacer="bottom" aria-hidden="true" style={{ height: visible.padBottom }} />
        ) : null}
      </tbody>
    </table>
  );

  if (!windowed) {
    return body;
  }
  return (
    <div
      data-slot="data-table-scroller"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a keyboard user scrolls the window with the arrow and page keys (AC-25)
      tabIndex={0}
      className="overflow-y-auto"
      style={{ height: `calc(var(--row-height) * ${VIEWPORT_ROWS + 1})` }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      {body}
    </div>
  );
}
