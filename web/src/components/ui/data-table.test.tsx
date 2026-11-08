import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCANNED_DIRECTORIES } from "../token-literals.test";
import { DataTable, type DataTableProps, windowFor } from "./data-table";

const UI_DIR = path.dirname(fileURLToPath(import.meta.url));
// Vitest's root is `web/`, so the repo root is four levels above this file.
const REPO_ROOT = path.resolve(UI_DIR, "../../../..");

interface Stock {
  symbol: string;
  name: string;
  gapCount: number;
}

// Built once per test so earlier objects keep their identity when a later
// array is formed by spreading them.
function stocks(n: number): Stock[] {
  return Array.from({ length: n }, (_, i) => ({
    symbol: `S${String(i).padStart(4, "0")}`,
    name: `Stock ${i}`,
    gapCount: i,
  }));
}

// Which row ids rendered their cells, so a test sees which rows re-rendered.
let renders: string[] = [];

// Defined once at module level: the memoised row compares `columns` by identity.
// biome-ignore lint/suspicious/noExplicitAny: TanStack's own column typing
const columns: ColumnDef<Stock, any>[] = [
  {
    id: "symbol",
    header: "Symbol",
    accessorKey: "symbol",
    enableSorting: true,
    cell: (ctx) => {
      renders.push(ctx.row.id);
      return ctx.getValue();
    },
  },
  { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
  {
    id: "gapCount",
    header: "Gaps",
    accessorKey: "gapCount",
    enableSorting: true,
    meta: { numeric: true },
  },
];

// The same three columns with Name's sorting left unset.
// biome-ignore lint/suspicious/noExplicitAny: TanStack's own column typing
const unsortableName: ColumnDef<Stock, any>[] = columns.map((column) =>
  column.id === "name" ? { id: "name", header: "Name", accessorKey: "name" } : column,
);

const getRowId = (row: Stock) => row.symbol;

// jsdom has no layout: report a height for a body row, an expansion row and nothing else.
function stubRowHeight(rowPx: number, detailPx: number) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const height = this.matches("tr[data-row-id]")
      ? rowPx
      : this.matches("tr[data-expansion-for]")
        ? detailPx
        : 0;
    return { height, width: 0, top: 0, left: 0, right: 0, bottom: height, x: 0, y: 0 } as DOMRect;
  });
}

function scrollTo(row: number, rowPx: number) {
  const scroller = document.querySelector<HTMLElement>('[data-slot="data-table-scroller"]');
  if (!scroller) {
    throw new Error("no scroller");
  }
  act(() => {
    scroller.scrollTop = row * rowPx;
    fireEvent.scroll(scroller);
  });
}

function bodyRowIds(): string[] {
  return Array.from(document.querySelectorAll("tbody tr[data-row-id]")).map(
    (row) => row.getAttribute("data-row-id") ?? "",
  );
}

function spacer(which: "top" | "bottom"): HTMLElement | null {
  return document.querySelector(`tr[data-spacer="${which}"]`);
}

afterEach(() => {
  vi.restoreAllMocks();
  renders = [];
});

type Variant = "compact" | "history" | "expandable" | "virtualised";
const VARIANTS: Variant[] = ["compact", "history", "expandable", "virtualised"];

// Props that satisfy every variant's required set.
function variantProps(variant: Variant, data: Stock[]): DataTableProps<Stock> {
  const base = { columns, data, getRowId };
  switch (variant) {
    case "expandable":
      return {
        ...base,
        variant,
        renderExpansion: (row: Stock) => `Detail ${row.symbol}`,
        getRowLabel: (row: Stock) => row.name,
      };
    case "virtualised":
      return { ...base, variant, hasMore: false, onEndReached: vi.fn() };
    default:
      return { ...base, variant };
  }
}

// Both expansion props or neither, as the virtualised variant's type requires.
function expansionProps(on: boolean) {
  return on
    ? {
        renderExpansion: (row: Stock) => `Detail ${row.symbol}`,
        getRowLabel: (row: Stock) => row.name,
      }
    : {};
}

// A small stateful wrapper holding `sorting`, as a screen would.
function Sortable(props: DataTableProps<Stock>): ReactElement {
  const [sorting, setSorting] = useState<SortingState>([{ id: "symbol", desc: false }]);
  return <DataTable {...props} sorting={sorting} onSortingChange={setSorting} />;
}

// Implements TC-COMP-019
describe("TC-COMP-019 data-table passes the scan, takes its row height from the token and adds one package (DAC-E1-S4-3, DAC-E1-12, AC-26)", () => {
  it("is covered by the literal scan", () => {
    const file = "web/src/components/ui/data-table.tsx";
    expect(SCANNED_DIRECTORIES.some((entry) => file.startsWith(entry))).toBe(true);
  });

  it.each(VARIANTS)(
    "%s: every header row and body row has the h-row class and no h-[ class",
    (variant) => {
      stubRowHeight(32, 96);
      render(<DataTable {...variantProps(variant, stocks(3))} />);
      const rows = [
        ...Array.from(document.querySelectorAll("thead tr")),
        ...Array.from(document.querySelectorAll("tbody tr[data-row-id]")),
      ];
      expect(rows.length).toBe(4);
      for (const row of rows) {
        expect(row).toHaveClass("h-row");
        expect(Array.from(row.classList).some((name) => /^h-\[/.test(name))).toBe(false);
      }
    },
  );

  it("resolves h-row to --row-height in the Tailwind config and the theme", async () => {
    const config = (await import(path.join(REPO_ROOT, "tailwind.config.js"))).default;
    expect(config.theme.extend.height.row).toBe("var(--row-height)");
    expect(readFileSync(path.join(REPO_ROOT, "design-system/theme.css"), "utf-8")).toContain(
      "--row-height:",
    );
  });

  it("adds @tanstack/react-table under its MIT licence and no virtualisation library (DEC-0215)", () => {
    const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8"));
    const lock = JSON.parse(readFileSync(path.join(REPO_ROOT, "package-lock.json"), "utf-8"));
    expect(manifest.dependencies["@tanstack/react-table"]).toMatch(/^\^8\./);
    expect(lock.packages["node_modules/@tanstack/react-table"].license).toBe("MIT");
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };
    for (const name of [
      "@tanstack/react-virtual",
      "react-window",
      "react-virtualized",
      "react-virtuoso",
    ]) {
      expect(declared[name]).toBeUndefined();
    }
  });
});

// Implements TC-COMP-018
describe("TC-COMP-018 data-table headers, history row header and expandable expander semantics (DAC-E1-S4-2, AC-25)", () => {
  it.each(VARIANTS)(
    "%s: programmatic column headers and aria-sort on the sorted column only",
    (variant) => {
      stubRowHeight(32, 96);
      render(<Sortable {...variantProps(variant, stocks(3))} />);
      const headers = screen.getAllByRole("columnheader");
      const expected = variant === "expandable" ? 4 : 3;
      expect(headers).toHaveLength(expected);
      const symbol = screen.getByRole("columnheader", { name: "Symbol" });
      const name = screen.getByRole("columnheader", { name: "Name" });
      const gaps = screen.getByRole("columnheader", { name: "Gaps" });
      expect(symbol).toHaveAttribute("aria-sort", "ascending");
      expect(name).not.toHaveAttribute("aria-sort");
      expect(gaps).not.toHaveAttribute("aria-sort");
    },
  );

  it("sorts from the keyboard, cycling ascending, descending, unsorted", async () => {
    const user = userEvent.setup();
    render(<Sortable {...variantProps("compact", stocks(3))} />);
    const nameButton = screen.getByRole("button", { name: "Name" });
    for (let i = 0; i < 10 && document.activeElement !== nameButton; i++) {
      await user.tab();
    }
    expect(nameButton).toHaveFocus();
    const name = screen.getByRole("columnheader", { name: "Name" });
    const symbol = screen.getByRole("columnheader", { name: "Symbol" });
    await user.keyboard("{Enter}");
    expect(name).toHaveAttribute("aria-sort", "ascending");
    expect(symbol).not.toHaveAttribute("aria-sort");
    await user.keyboard("{Enter}");
    expect(name).toHaveAttribute("aria-sort", "descending");
    await user.keyboard("{Enter}");
    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
    // The numeric column cycles the same way: its first press is ascending.
    await user.click(screen.getByRole("button", { name: "Gaps" }));
    expect(screen.getByRole("columnheader", { name: "Gaps" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("shows no sort control without onSortingChange, yet still declares the given sorting", () => {
    const { rerender } = render(
      <DataTable
        {...variantProps("compact", stocks(3))}
        sorting={[{ id: "symbol", desc: false }]}
      />,
    );
    expect(within(screen.getByRole("table")).queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("columnheader", { name: "Symbol" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    rerender(<DataTable {...variantProps("compact", stocks(3))} />);
    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
  });

  it("gives a header a button only when its column is marked sortable", () => {
    render(
      <DataTable
        {...variantProps("compact", stocks(3))}
        columns={unsortableName}
        sorting={[]}
        onSortingChange={vi.fn()}
      />,
    );
    expect(
      within(screen.getByRole("columnheader", { name: "Name" })).queryByRole("button"),
    ).toBeNull();
    expect(
      within(screen.getByRole("columnheader", { name: "Symbol" })).getByRole("button"),
    ).toBeInTheDocument();
  });

  it("makes the first cell of every history row the row header", () => {
    render(<DataTable {...variantProps("history", stocks(3))} />);
    const rowHeaders = screen.getAllByRole("rowheader");
    expect(rowHeaders).toHaveLength(3);
    rowHeaders.forEach((cell, i) => {
      expect(cell).toHaveTextContent(`S000${i}`);
    });
    expect(screen.getAllByRole("cell")).toHaveLength(6);
  });

  it("keeps the history row header on when rowHeader is false", () => {
    render(<DataTable {...variantProps("history", stocks(3))} rowHeader={false} />);
    expect(screen.getAllByRole("rowheader")).toHaveLength(3);
  });

  it("gives compact a row header only when asked (Recent downloads)", () => {
    const { rerender } = render(<DataTable {...variantProps("compact", stocks(3))} />);
    expect(screen.queryAllByRole("rowheader")).toHaveLength(0);
    rerender(<DataTable {...variantProps("compact", stocks(3))} rowHeader />);
    expect(screen.getAllByRole("rowheader")).toHaveLength(3);
  });

  it("gives every expandable row a named expander that toggles aria-expanded and keeps focus", async () => {
    const user = userEvent.setup();
    render(<DataTable {...variantProps("expandable", stocks(3))} />);
    const expander = screen.getByRole("button", { name: "Expand Stock 1" });
    expect(expander).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector("tr[data-expansion-for]")).toBeNull();
    for (let i = 0; i < 10 && document.activeElement !== expander; i++) {
      await user.tab();
    }
    expect(expander).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(expander).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Expand Stock 1" })).toBe(expander);
    expect(expander).toHaveFocus();
    const detailRow = document.getElementById(expander.getAttribute("aria-controls") ?? "");
    expect(detailRow).not.toBeNull();
    expect(detailRow).toHaveAttribute("data-expansion-for", "S0001");
    const live = detailRow?.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("Detail S0001");
    await user.keyboard(" ");
    expect(expander).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(detailRow?.id ?? "")).toBeNull();
    expect(expander).toHaveFocus();
  });

  it.each(VARIANTS)(
    "%s: busy sets aria-busy on the table and its absence leaves none",
    (variant) => {
      stubRowHeight(32, 96);
      const { rerender } = render(<DataTable {...variantProps(variant, stocks(3))} busy />);
      expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
      rerender(<DataTable {...variantProps(variant, stocks(3))} />);
      expect(screen.getByRole("table")).not.toHaveAttribute("aria-busy");
    },
  );
});

// Implements TC-COMP-017
describe("TC-COMP-017 data-table virtualised windows 3000 rows and appends keyset pages (DAC-E1-S4-1, AC-26, DEC-0306)", () => {
  function virtualised(data: Stock[], extra: Partial<{ hasMore: boolean; busy: boolean }> = {}) {
    const onEndReached = vi.fn();
    const element = (rows: Stock[], more = extra) => (
      <DataTable
        variant="virtualised"
        columns={columns}
        data={rows}
        getRowId={getRowId}
        hasMore={more.hasMore ?? false}
        busy={more.busy ?? false}
        onEndReached={onEndReached}
      />
    );
    const view = render(element(data));
    return { ...view, onEndReached, element };
  }

  it("renders the first window of 3000 rows with the spacer and row counts", () => {
    stubRowHeight(32, 96);
    virtualised(stocks(3000));
    const ids = bodyRowIds();
    expect(ids).toHaveLength(25);
    expect(ids[0]).toBe("S0000");
    expect(ids[24]).toBe("S0024");
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "3001");
    expect(document.querySelector("tr[data-row-id]")).toHaveAttribute("aria-rowindex", "2");
    expect(spacer("bottom")).toHaveAttribute("aria-hidden", "true");
    expect(spacer("bottom")?.style.height).toBe("95200px");
    expect(spacer("top")).toBeNull();
  });

  it("renders the next window on scroll and keeps the DOM bounded", () => {
    stubRowHeight(32, 96);
    virtualised(stocks(3000));
    scrollTo(1000, 32);
    const ids = bodyRowIds();
    expect(ids).toHaveLength(35);
    expect(ids[0]).toBe("S0990");
    expect(ids[34]).toBe("S1024");
    expect(spacer("top")?.style.height).toBe("31680px");
    expect(spacer("bottom")?.style.height).toBe("63200px");
  });

  it("measures the row height instead of assuming one", () => {
    stubRowHeight(40, 96);
    virtualised(stocks(3000));
    scrollTo(1000, 40);
    const ids = bodyRowIds();
    expect(ids[0]).toBe("S0990");
    expect(ids[ids.length - 1]).toBe("S1024");
    expect(spacer("top")?.style.height).toBe("39600px");
  });

  it("appends a keyset page without re-rendering earlier rows, asking for it once", () => {
    stubRowHeight(32, 96);
    const first = stocks(100);
    const { onEndReached, rerender, element } = virtualised(first.slice(0, 50), {
      hasMore: true,
      busy: false,
    });
    scrollTo(30, 32);
    expect(onEndReached).toHaveBeenCalledTimes(1);
    renders = [];
    rerender(element(first, { hasMore: true, busy: false }));
    const ids = bodyRowIds();
    expect(ids).toHaveLength(35);
    expect(ids[0]).toBe("S0020");
    expect(ids[34]).toBe("S0054");
    for (let i = 20; i < 50; i++) {
      expect(renders).not.toContain(`S${String(i).padStart(4, "0")}`);
    }
    for (let i = 50; i <= 54; i++) {
      expect(renders).toContain(`S${String(i).padStart(4, "0")}`);
    }
  });

  it("renders every row, with no spacer, when there are fewer than the window", () => {
    stubRowHeight(32, 96);
    virtualised(stocks(10));
    expect(bodyRowIds()).toHaveLength(10);
    expect(spacer("top")).toBeNull();
    expect(spacer("bottom")).toBeNull();
  });

  it("never holds more than the window in the DOM across a scroll sweep", () => {
    stubRowHeight(32, 96);
    virtualised(stocks(3000));
    for (const row of [0, 500, 1500, 2990]) {
      scrollTo(row, 32);
      expect(document.querySelectorAll("tbody tr").length).toBeLessThanOrEqual(37);
    }
  });
});

describe("windowFor (DAC-E1-S4-1, AC-26)", () => {
  const none = new Map<number, number>();

  it("windows the top of 3000 rows", () => {
    expect(windowFor({ scrollTop: 0, rowHeight: 32, rowCount: 3000, extraHeights: none })).toEqual({
      start: 0,
      end: 25,
      padTop: 0,
      padBottom: 95200,
    });
  });

  it("windows the middle with an overscan above", () => {
    expect(
      windowFor({ scrollTop: 32000, rowHeight: 32, rowCount: 3000, extraHeights: none }),
    ).toEqual({ start: 990, end: 1025, padTop: 31680, padBottom: 63200 });
  });

  it("falls back to the top window when there is no layout, a negative scroll or NaN", () => {
    for (const args of [
      { scrollTop: 32000, rowHeight: 0 },
      { scrollTop: -5, rowHeight: 32 },
      { scrollTop: Number.NaN, rowHeight: 32 },
    ]) {
      const result = windowFor({ ...args, rowCount: 3000, extraHeights: none });
      expect(result.start).toBe(0);
      expect(result.end).toBe(25);
    }
  });

  it("renders every row of a short list, and none of an empty one", () => {
    expect(windowFor({ scrollTop: 0, rowHeight: 32, rowCount: 10, extraHeights: none })).toEqual({
      start: 0,
      end: 10,
      padTop: 0,
      padBottom: 0,
    });
    expect(windowFor({ scrollTop: 0, rowHeight: 32, rowCount: 0, extraHeights: none })).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });
  });

  it("counts an open expansion above the window in the row tops", () => {
    const extra = new Map([[5, 96]]);
    expect(
      windowFor({ scrollTop: 3296, rowHeight: 32, rowCount: 3000, extraHeights: extra }),
    ).toEqual({ start: 90, end: 125, padTop: 2976, padBottom: 92000 });
    const at = windowFor({ scrollTop: 3200, rowHeight: 32, rowCount: 3000, extraHeights: extra });
    expect(at.start).toBe(87);
    expect(at.end).toBe(122);
  });

  it("leaves the expansion of the window's first row below its top", () => {
    const result = windowFor({
      scrollTop: 3296,
      rowHeight: 32,
      rowCount: 3000,
      extraHeights: new Map([[90, 96]]),
    });
    expect(result).toMatchObject({ start: 90, end: 125, padTop: 2880 });
  });

  it("counts an open expansion below the window in the bottom spacer", () => {
    const result = windowFor({
      scrollTop: 0,
      rowHeight: 32,
      rowCount: 3000,
      extraHeights: new Map([[2000, 96]]),
    });
    expect(result.padBottom).toBe(95296);
  });
});

describe("virtualised paging, keyboard and expansion (DAC-E1-S4-1, DAC-E1-S4-2, AC-25)", () => {
  function paged(data: Stock[], props: { hasMore: boolean; busy?: boolean }, expansion = false) {
    const onEndReached = vi.fn();
    const element = (rows: Stock[]) => (
      <DataTable
        variant="virtualised"
        columns={columns}
        data={rows}
        getRowId={getRowId}
        hasMore={props.hasMore}
        busy={props.busy ?? false}
        onEndReached={onEndReached}
        {...expansionProps(expansion)}
      />
    );
    return { ...render(element(data)), onEndReached, element };
  }

  it("asks for the next page when the window end plus the prefetch reaches the loaded rows", () => {
    stubRowHeight(32, 96);
    const { onEndReached } = paged(stocks(50), { hasMore: true });
    scrollTo(4, 32);
    expect(onEndReached).not.toHaveBeenCalled();
    scrollTo(5, 32);
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it("asks again when the rows are replaced by as many different ones (a sort)", () => {
    stubRowHeight(32, 96);
    const { onEndReached, rerender, element } = paged(stocks(50), { hasMore: true });
    scrollTo(30, 32);
    expect(onEndReached).toHaveBeenCalledTimes(1);
    const replaced = stocks(50).map((row) => ({ ...row, symbol: `R${row.symbol}` }));
    rerender(element(replaced));
    expect(onEndReached).toHaveBeenCalledTimes(2);
    rerender(element(replaced));
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it("asks again when only the first row is replaced (a sort that changes the head)", () => {
    stubRowHeight(32, 96);
    const { onEndReached, rerender, element } = paged(stocks(50), { hasMore: true });
    scrollTo(30, 32);
    const [head, ...rest] = stocks(50);
    rerender(element([{ ...head, symbol: "HEAD" }, ...rest]));
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it("never asks while busy or when there is no more", () => {
    stubRowHeight(32, 96);
    const busy = paged(stocks(50), { hasMore: true, busy: true });
    scrollTo(30, 32);
    expect(busy.onEndReached).not.toHaveBeenCalled();
    busy.unmount();
    const done = paged(stocks(50), { hasMore: false });
    scrollTo(30, 32);
    expect(done.onEndReached).not.toHaveBeenCalled();
  });

  it("makes the scroller keyboard-focusable with no role or name of its own", () => {
    stubRowHeight(32, 96);
    paged(stocks(10), { hasMore: false });
    const scroller = document.querySelector('[data-slot="data-table-scroller"]');
    expect(scroller).toHaveAttribute("tabindex", "0");
    expect(scroller).not.toHaveAttribute("role");
    expect(scroller).not.toHaveAttribute("aria-label");
    expect(scroller).not.toHaveAttribute("aria-labelledby");
  });

  it("keeps an expansion open across an appended page", async () => {
    stubRowHeight(32, 96);
    const user = userEvent.setup();
    const first = stocks(100);
    const { rerender, element } = paged(first.slice(0, 50), { hasMore: true }, true);
    screen.getByRole("button", { name: "Expand Stock 3" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Detail S0003")).toBeInTheDocument();
    // TanStack resets its own page state in a microtask after `data` changes; await it inside act.
    await act(async () => {
      rerender(element(first));
    });
    expect(screen.getByRole("button", { name: "Expand Stock 3" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Detail S0003")).toBeInTheDocument();
  });

  it("drops a collapsed row's height from the window arithmetic", async () => {
    stubRowHeight(32, 96);
    const user = userEvent.setup();
    paged(stocks(100), { hasMore: false }, true);
    await user.click(screen.getByRole("button", { name: "Expand Stock 3" }));
    await user.click(screen.getByRole("button", { name: "Expand Stock 3" }));
    expect(screen.queryByText("Detail S0003")).toBeNull();
    scrollTo(50, 32);
    const ids = bodyRowIds();
    expect(ids[0]).toBe("S0040");
    expect(ids[ids.length - 1]).toBe("S0074");
  });
});

describe("windowFor edges (DAC-E1-S4-1)", () => {
  const none = new Map<number, number>();

  it("clamps a scroll past the end to the last rows", () => {
    expect(
      windowFor({ scrollTop: 999999, rowHeight: 32, rowCount: 3000, extraHeights: none }),
    ).toEqual({ start: 2989, end: 3000, padTop: 95648, padBottom: 0 });
  });

  it("windows a one pixel row height", () => {
    expect(windowFor({ scrollTop: 100, rowHeight: 1, rowCount: 3000, extraHeights: none })).toEqual(
      {
        start: 90,
        end: 125,
        padTop: 90,
        padBottom: 2875,
      },
    );
  });

  it("ignores an expansion recorded for a row index past the loaded rows", () => {
    const result = windowFor({
      scrollTop: 0,
      rowHeight: 32,
      rowCount: 10,
      extraHeights: new Map([[10, 96]]),
    });
    expect(result.padBottom).toBe(0);
  });
});

describe("data-table classes and structure (AC-26, DAC-E1-S4-2)", () => {
  it("right-aligns numeric headers and cells in the numeric face, and no others", () => {
    render(<DataTable {...variantProps("compact", stocks(2))} />);
    const gaps = screen.getByRole("columnheader", { name: "Gaps" });
    const symbol = screen.getByRole("columnheader", { name: "Symbol" });
    expect(gaps).toHaveClass("text-right", "font-numeric");
    expect(symbol).not.toHaveClass("text-right");
    expect(symbol).not.toHaveClass("font-numeric");
    const cells = screen.getAllByRole("cell");
    expect(cells[2]).toHaveClass("text-right", "font-numeric");
    expect(cells[0]).not.toHaveClass("text-right");
    expect(cells[0]).not.toHaveClass("font-numeric");
  });

  it("right-aligns a numeric row header", () => {
    const numericFirst = [columns[2], columns[0], columns[1]];
    render(<DataTable {...variantProps("history", stocks(2))} columns={numericFirst} />);
    const [first] = screen.getAllByRole("rowheader");
    expect(first).toHaveClass("text-right", "font-numeric");
    const symbolFirst = render(<DataTable {...variantProps("history", stocks(2))} />);
    const rowHeaders = within(symbolFirst.container).getAllByRole("rowheader");
    expect(rowHeaders[0]).not.toHaveClass("text-right");
    expect(rowHeaders[0]).not.toHaveClass("font-numeric");
  });

  it("spans the expansion row over every column and the expander", async () => {
    const user = userEvent.setup();
    render(<DataTable {...variantProps("expandable", stocks(2))} />);
    await user.click(screen.getByRole("button", { name: "Expand Stock 0" }));
    const detail = document.querySelector("tr[data-expansion-for]");
    expect(detail?.querySelector("td")).toHaveAttribute("colspan", "4");
  });

  it("gives only the virtualised header a sticky position, and only it a scroller and spacers", () => {
    stubRowHeight(32, 96);
    const { unmount } = render(<DataTable {...variantProps("virtualised", stocks(3000))} />);
    expect(document.querySelector("thead tr")).toHaveClass("sticky", "top-0");
    expect(document.querySelector('[data-slot="data-table-scroller"]')).toHaveStyle({
      height: "calc(var(--row-height) * 16)",
    });
    unmount();
    for (const variant of ["compact", "history", "expandable"] as const) {
      const view = render(<DataTable {...variantProps(variant, stocks(3000))} />);
      expect(document.querySelector("thead tr")).not.toHaveClass("sticky");
      expect(document.querySelector('[data-slot="data-table-scroller"]')).toBeNull();
      expect(document.querySelector("tr[data-spacer]")).toBeNull();
      expect(screen.getByRole("table")).not.toHaveAttribute("aria-rowcount");
      expect(document.querySelector("tr[data-row-id]")).not.toHaveAttribute("aria-rowindex");
      expect(bodyRowIds()).toHaveLength(3000);
      view.unmount();
    }
  });

  it("shows no expander column for a virtualised table without expansion", () => {
    stubRowHeight(32, 96);
    render(<DataTable {...variantProps("virtualised", stocks(5))} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("sorts one column at a time, even with the shift key held", async () => {
    const user = userEvent.setup();
    render(<Sortable {...variantProps("compact", stocks(3))} />);
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("button", { name: "Name" }));
    await user.keyboard("{/Shift}");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getByRole("columnheader", { name: "Symbol" })).not.toHaveAttribute("aria-sort");
  });
});

describe("virtualised measuring (DAC-E1-S4-1, AC-26)", () => {
  it("renders the top window with no spacer where layout reports a zero height", () => {
    render(<DataTable {...variantProps("virtualised", stocks(3000))} />);
    expect(bodyRowIds()).toHaveLength(25);
    expect(spacer("top")).toBeNull();
    expect(spacer("bottom")).toBeNull();
  });

  it("measures a row only once rows exist, not from an empty table", () => {
    const view = render(<DataTable {...variantProps("virtualised", [])} />);
    expect(bodyRowIds()).toHaveLength(0);
    view.rerender(<DataTable {...variantProps("virtualised", stocks(3000))} />);
    expect(spacer("bottom")).toBeNull();
  });

  it("keeps the last measured height when a later measurement reports zero", () => {
    const stub = vi.spyOn(Element.prototype, "getBoundingClientRect");
    stub.mockImplementation(function (this: Element) {
      const height = this.matches("tr[data-row-id]") ? 32 : 0;
      return { height } as DOMRect;
    });
    const data = stocks(3000);
    const view = render(<DataTable {...variantProps("virtualised", data)} />);
    stub.mockImplementation(() => ({ height: 0 }) as DOMRect);
    view.rerender(<DataTable {...variantProps("virtualised", data)} />);
    expect(spacer("bottom")?.style.height).toBe("95200px");
  });

  it("measures a one pixel row and shows a one pixel spacer", () => {
    const stub = vi.spyOn(Element.prototype, "getBoundingClientRect");
    stub.mockImplementation(function (this: Element) {
      return { height: this.matches("tr[data-row-id]") ? 1 : 0 } as DOMRect;
    });
    render(<DataTable {...variantProps("virtualised", stocks(3000))} />);
    expect(spacer("bottom")?.style.height).toBe("2975px");
    scrollTo(11, 1);
    expect(spacer("top")?.style.height).toBe("1px");
    document.body.innerHTML = "";
  });

  it("shows a one pixel bottom spacer when one row is left unrendered", () => {
    const stub = vi.spyOn(Element.prototype, "getBoundingClientRect");
    stub.mockImplementation(function (this: Element) {
      return { height: this.matches("tr[data-row-id]") ? 1 : 0 } as DOMRect;
    });
    render(<DataTable {...variantProps("virtualised", stocks(26))} />);
    expect(bodyRowIds()).toHaveLength(25);
    expect(spacer("bottom")?.style.height).toBe("1px");
  });

  it("keeps an open expansion's height in the offsets after it scrolls out of the window", async () => {
    stubRowHeight(32, 96);
    const user = userEvent.setup();
    render(
      <DataTable
        variant="virtualised"
        columns={columns}
        data={stocks(100)}
        getRowId={getRowId}
        hasMore={false}
        onEndReached={vi.fn()}
        {...expansionProps(true)}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expand Stock 3" }));
    scrollTo(50, 32);
    expect(bodyRowIds()[0]).toBe("S0037");
  });
});

// Review v1 rework (IR-001 to IR-005): the contracts the first suites left unpinned.
function scrollToPx(scrollTop: number) {
  const scroller = document.querySelector<HTMLElement>('[data-slot="data-table-scroller"]');
  if (!scroller) {
    throw new Error("no scroller");
  }
  act(() => {
    scroller.scrollTop = scrollTop;
    fireEvent.scroll(scroller);
  });
}

function rowIndexOf(id: string): string | null {
  return document.querySelector(`tr[data-row-id="${id}"]`)?.getAttribute("aria-rowindex") ?? null;
}

function windowedTable(
  data: Stock[],
  options: { columns?: DataTableProps<Stock>["columns"]; expansion?: boolean } = {},
) {
  return (
    <DataTable
      variant="virtualised"
      columns={options.columns ?? columns}
      data={data}
      getRowId={getRowId}
      hasMore={false}
      onEndReached={vi.fn()}
      {...expansionProps(options.expansion ?? false)}
    />
  );
}

describe("windowed row numbering and the row memo (DAC-E1-S4-1, AC-25)", () => {
  it("numbers every windowed row by its position in the loaded list after a scroll", () => {
    stubRowHeight(32, 96);
    render(windowedTable(stocks(3000)));
    scrollTo(1000, 32);
    expect(rowIndexOf("S0990")).toBe("992");
    expect(rowIndexOf("S1024")).toBe("1026");
  });

  it("renumbers later rows when a record is removed and the others keep their identity", () => {
    stubRowHeight(32, 96);
    const data = stocks(40);
    const view = render(windowedTable(data));
    expect(rowIndexOf("S0004")).toBe("6");
    view.rerender(windowedTable(data.filter((_, i) => i !== 3)));
    expect(rowIndexOf("S0004")).toBe("5");
    expect(rowIndexOf("S0024")).toBe("25");
  });

  it("re-renders the cells of kept rows when the columns change", () => {
    stubRowHeight(32, 96);
    const data = stocks(40);
    const view = render(windowedTable(data));
    expect(screen.getByText("Stock 3")).toBeInTheDocument();
    const renamed: DataTableProps<Stock>["columns"] = columns.map((column) =>
      column.id === "name" ? { ...column, cell: (ctx) => `Renamed ${ctx.getValue()}` } : column,
    );
    view.rerender(windowedTable(data, { columns: renamed }));
    expect(screen.getByText("Renamed Stock 3")).toBeInTheDocument();
    expect(screen.queryByText("Stock 3")).toBeNull();
  });

  it("credits an open expansion's height to its own row, not to the next one", async () => {
    stubRowHeight(32, 96);
    const user = userEvent.setup();
    render(windowedTable(stocks(100), { expansion: true }));
    scrollTo(40, 32);
    await user.click(screen.getByRole("button", { name: "Expand Stock 40" }));
    // 1350 lies inside row 40's detail (1312 to 1408), so row 40 is still the first visible row.
    scrollToPx(1350);
    expect(bodyRowIds()[0]).toBe("S0030");
  });
});

describe("expanded rows follow what the caller renders (DEC-0307, IR-005)", () => {
  // Stable, so a test changes one of the two functions and not both.
  const nameLabel = (row: Stock) => row.name;
  const symbolDetail = (row: Stock) => row.symbol;
  function expandable(
    renderExpansion: (row: Stock) => string,
    getRowLabel: (row: Stock) => string = nameLabel,
  ) {
    return (
      <DataTable
        variant="expandable"
        columns={columns}
        data={DATA}
        getRowId={getRowId}
        renderExpansion={renderExpansion}
        getRowLabel={getRowLabel}
      />
    );
  }
  const DATA = stocks(3);

  it("shows a changed renderExpansion in an open row, and re-renders no collapsed row", async () => {
    const user = userEvent.setup();
    const view = render(expandable((row) => `Loading ${row.symbol}`));
    await user.click(screen.getByRole("button", { name: "Expand Stock 1" }));
    expect(screen.getByText("Loading S0001")).toBeInTheDocument();
    renders = [];
    view.rerender(expandable((row) => `Loaded ${row.symbol}`));
    expect(screen.getByText("Loaded S0001")).toBeInTheDocument();
    expect(screen.queryByText("Loading S0001")).toBeNull();
    expect(Array.from(new Set(renders))).toEqual(["S0001"]);
  });

  it("shows a changed getRowLabel on an open row's expander", async () => {
    const user = userEvent.setup();
    const view = render(expandable(symbolDetail));
    await user.click(screen.getByRole("button", { name: "Expand Stock 1" }));
    view.rerender(expandable(symbolDetail, (row) => `Row ${row.symbol}`));
    expect(screen.getByRole("button", { name: "Expand Row S0001" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

describe("data-table token classes and targets (AC-25, AC-26, IR-003, IR-004)", () => {
  const PADDING = ["px-[var(--cell-padding-x)]", "py-[var(--cell-padding-y)]", "align-middle"];

  it("sets the table in the dense text size and gives the header and body rows their separators", () => {
    render(<DataTable {...variantProps("compact", stocks(2))} />);
    expect(screen.getByRole("table")).toHaveClass("w-full", "caption-bottom", "text-sm");
    expect(document.querySelector("thead tr")).toHaveClass("h-row", "border-b", "border-border");
    expect(document.querySelector("tbody tr")).toHaveClass(
      "h-row",
      "border-b",
      "border-border",
      "hover:bg-muted",
    );
  });

  it("pads and colours the header cells and pads the body cells with the cell tokens", () => {
    render(<DataTable {...variantProps("compact", stocks(2))} />);
    expect(screen.getByRole("columnheader", { name: "Symbol" })).toHaveClass(
      ...PADDING,
      "text-left",
      "font-medium",
      "text-muted-foreground",
    );
    for (const cell of screen.getAllByRole("cell")) {
      expect(cell).toHaveClass(...PADDING);
    }
  });

  it("sets a row header left-aligned in the medium weight with the cell padding", () => {
    render(<DataTable {...variantProps("history", stocks(2))} />);
    for (const cell of screen.getAllByRole("rowheader")) {
      expect(cell).toHaveClass(...PADDING, "text-left", "font-medium");
    }
  });

  it("separates the detail row, and gives the expander column the same padding", async () => {
    const user = userEvent.setup();
    render(<DataTable {...variantProps("expandable", stocks(2))} />);
    await user.click(screen.getByRole("button", { name: "Expand Stock 0" }));
    expect(document.querySelector("tr[data-expansion-for]")).toHaveClass(
      "border-b",
      "border-border",
    );
    expect(screen.getByRole("button", { name: "Expand Stock 0" }).closest("td")).toHaveClass(
      ...PADDING,
    );
    expect(screen.getByText("Details").closest("th")).toHaveClass(
      ...PADDING,
      "text-muted-foreground",
    );
  });

  it("hides the Details header text visually and sizes the expander to the 24 px target", () => {
    render(<DataTable {...variantProps("expandable", stocks(2))} />);
    expect(screen.getByText("Details")).toHaveClass("sr-only");
    expect(screen.getByRole("button", { name: "Expand Stock 0" })).toHaveClass("h-5", "w-5", "p-0");
  });

  it("sizes a sort button to the 24 px target", () => {
    render(<Sortable {...variantProps("compact", stocks(2))} />);
    expect(screen.getByRole("button", { name: "Name" })).toHaveClass("h-5");
  });

  it("gives the virtualised scroller its overflow and the sticky header its background", () => {
    stubRowHeight(32, 96);
    const { unmount } = render(<DataTable {...variantProps("virtualised", stocks(30))} />);
    expect(document.querySelector('[data-slot="data-table-scroller"]')).toHaveClass(
      "overflow-y-auto",
    );
    expect(document.querySelector("thead tr")).toHaveClass("sticky", "top-0", "bg-background");
    unmount();
    render(<DataTable {...variantProps("compact", stocks(30))} />);
    expect(document.querySelector("thead tr")).not.toHaveClass("bg-background");
  });
});
