/**
 * The window arithmetic of the virtualised results table (DAC-E4-S6-5,
 * AC-11): which of the loaded rows the DOM holds for a scroll position, how
 * far to scroll to reveal a row, and when the next keyset page is due.
 *
 * Pure functions over numbers, no React and no import, so the table and its
 * tests share one definition of the window (CAP-002-E4-S6 Open Gap 2;
 * DEC-0160). The table is windowed over keyset pages, so the scroll height
 * tracks the rows loaded so far, never the server's match count: a keyset
 * cursor cannot jump.
 */

/** One row's height in CSS pixels: `--row-height-comfortable`, 2rem (theme.css; DEC-0160). */
export const ROW_HEIGHT_PX = 32;
/** Rows the fixed-height scroll container shows at once: what fits the Results card (DEC-0160). */
export const VIEWPORT_ROWS = 15;
/** Rows rendered above and below the viewport so one fast scroll step shows no blank frame (DEC-0160). */
export const OVERSCAN_ROWS = 10;
/** The next keyset page is read when the window's end is this close to the loaded end (DEC-0160). */
export const PREFETCH_ROWS = 20;
/** Rows per keyset page: the API's `DEFAULT_PAGE_SIZE` (classification-api section 2.4a; DEC-0160). */
export const PAGE_SIZE = 50;

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

/** A negative or NaN scrollTop is the top. */
function firstVisibleRow(scrollTop: number): number {
  return Number.isNaN(scrollTop) || scrollTop < 0 ? 0 : Math.floor(scrollTop / ROW_HEIGHT_PX);
}

/**
 * The rows to render for `scrollTop` over `loadedCount` loaded rows: an
 * overscan above the first visible row to an overscan below the viewport,
 * clamped to the loaded rows, with the spacer heights that keep the scroll
 * height at `loadedCount * ROW_HEIGHT_PX` (DAC-E4-S6-5).
 */
export function visibleWindow({
  scrollTop,
  loadedCount,
}: {
  scrollTop: number;
  loadedCount: number;
}): VisibleWindow {
  const first = firstVisibleRow(scrollTop);
  const end = Math.min(loadedCount, first + VIEWPORT_ROWS + OVERSCAN_ROWS);
  const start = Math.min(end, Math.max(0, first - OVERSCAN_ROWS));
  return {
    start,
    end,
    padTop: start * ROW_HEIGHT_PX,
    padBottom: (loadedCount - end) * ROW_HEIGHT_PX,
  };
}

/**
 * The scrollTop that shows row `index`: unchanged when it is already inside
 * the viewport, its top edge when it is above, its bottom edge when it is
 * below (DAC-E4-S6-4: an arrow key scrolls the row into the window before
 * the table focuses it).
 */
export function scrollTopToReveal(index: number, scrollTop: number): number {
  const top = index * ROW_HEIGHT_PX;
  const viewportHeight = VIEWPORT_ROWS * ROW_HEIGHT_PX;
  if (top < scrollTop) {
    return top;
  }
  if (top + ROW_HEIGHT_PX > scrollTop + viewportHeight) {
    return top + ROW_HEIGHT_PX - viewportHeight;
  }
  return scrollTop;
}

/**
 * Whether to read the next keyset page: a cursor exists, no read is in
 * flight, and the window's end is within `PREFETCH_ROWS` of the loaded end
 * (AC-11).
 */
export function needsNextPage({
  end,
  loadedCount,
  nextCursor,
  loading,
}: {
  end: number;
  loadedCount: number;
  nextCursor: string | null;
  loading: boolean;
}): boolean {
  return nextCursor !== null && !loading && end + PREFETCH_ROWS >= loadedCount;
}
