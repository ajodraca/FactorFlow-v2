import { describe, expect, it } from "vitest";
import {
  OVERSCAN_ROWS,
  PAGE_SIZE,
  PREFETCH_ROWS,
  ROW_HEIGHT_PX,
  VIEWPORT_ROWS,
  needsNextPage,
  scrollTopToReveal,
  visibleWindow,
} from "./results-window";

const MAX_RENDERED = VIEWPORT_ROWS + 2 * OVERSCAN_ROWS;

// T007: window arithmetic (AC-11, DAC-E4-S6-5; CAP-002-E4-S6 Open Gap 2, DEC-0160).
describe("results-window constants (DEC-0160)", () => {
  it("fixes the windowing constants the table and its tests share", () => {
    expect(ROW_HEIGHT_PX).toBe(32);
    expect(VIEWPORT_ROWS).toBe(15);
    expect(OVERSCAN_ROWS).toBe(10);
    expect(PREFETCH_ROWS).toBe(20);
    expect(PAGE_SIZE).toBe(50);
  });
});

describe("visibleWindow (DAC-E4-S6-5)", () => {
  it("starts an overscan above the first visible row and ends an overscan below the viewport", () => {
    const scrollTop = 40 * ROW_HEIGHT_PX;
    expect(visibleWindow({ scrollTop, loadedCount: 3000 })).toEqual({
      start: 40 - OVERSCAN_ROWS,
      end: 40 + VIEWPORT_ROWS + OVERSCAN_ROWS,
      padTop: (40 - OVERSCAN_ROWS) * ROW_HEIGHT_PX,
      padBottom: (3000 - (40 + VIEWPORT_ROWS + OVERSCAN_ROWS)) * ROW_HEIGHT_PX,
    });
  });

  it("floors a scrollTop inside a row to that row", () => {
    const window = visibleWindow({
      scrollTop: 40 * ROW_HEIGHT_PX + ROW_HEIGHT_PX - 1,
      loadedCount: 3000,
    });
    expect(window.start).toBe(40 - OVERSCAN_ROWS);
    expect(window.end).toBe(40 + VIEWPORT_ROWS + OVERSCAN_ROWS);
  });

  it("clamps the start at the first row", () => {
    expect(visibleWindow({ scrollTop: 0, loadedCount: 3000 })).toEqual({
      start: 0,
      end: VIEWPORT_ROWS + OVERSCAN_ROWS,
      padTop: 0,
      padBottom: (3000 - VIEWPORT_ROWS - OVERSCAN_ROWS) * ROW_HEIGHT_PX,
    });
  });

  it.each([0, 1, 50, 3000])(
    "never renders more than VIEWPORT_ROWS + 2 * OVERSCAN_ROWS rows of %d loaded",
    (loadedCount) => {
      for (const row of [0, 1, 7, 24, 25, 26, 49, 50, 1499, 2999, 3000, 5000]) {
        const window = visibleWindow({ scrollTop: row * ROW_HEIGHT_PX, loadedCount });
        expect(window.end - window.start).toBeLessThanOrEqual(MAX_RENDERED);
        expect(window.start).toBeGreaterThanOrEqual(0);
        expect(window.start).toBeLessThanOrEqual(window.end);
        expect(window.end).toBeLessThanOrEqual(loadedCount);
        expect(window.padTop).toBe(window.start * ROW_HEIGHT_PX);
        expect(window.padBottom).toBe((loadedCount - window.end) * ROW_HEIGHT_PX);
      }
    },
  );

  it("clamps a scrollTop beyond the end to the loaded rows", () => {
    const window = visibleWindow({ scrollTop: 5000 * ROW_HEIGHT_PX, loadedCount: 3000 });
    expect(window.end).toBe(3000);
    expect(window.padBottom).toBe(0);
    expect(window.start).toBeLessThanOrEqual(window.end);
    expect(window.start).toBe(3000);
    expect(window.padTop).toBe(3000 * ROW_HEIGHT_PX);
  });

  it("treats a negative or NaN scrollTop as 0", () => {
    const atZero = visibleWindow({ scrollTop: 0, loadedCount: 50 });
    expect(visibleWindow({ scrollTop: -400, loadedCount: 50 })).toEqual(atZero);
    expect(visibleWindow({ scrollTop: Number.NaN, loadedCount: 50 })).toEqual(atZero);
  });

  it("returns all zeros for nothing loaded", () => {
    expect(visibleWindow({ scrollTop: 0, loadedCount: 0 })).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });
    expect(visibleWindow({ scrollTop: 10 * ROW_HEIGHT_PX, loadedCount: 0 })).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });
  });
});

describe("scrollTopToReveal (DAC-E4-S6-4 arrow keys)", () => {
  const scrollTop = 100 * ROW_HEIGHT_PX;

  it("leaves scrollTop unchanged when the row is inside the viewport", () => {
    expect(scrollTopToReveal(100, scrollTop)).toBe(scrollTop);
    expect(scrollTopToReveal(100 + VIEWPORT_ROWS - 1, scrollTop)).toBe(scrollTop);
    expect(scrollTopToReveal(107, scrollTop)).toBe(scrollTop);
  });

  it("scrolls a row above the viewport to its top edge", () => {
    expect(scrollTopToReveal(99, scrollTop)).toBe(99 * ROW_HEIGHT_PX);
    expect(scrollTopToReveal(0, scrollTop)).toBe(0);
  });

  it("scrolls a row below the viewport to its bottom edge", () => {
    const below = 100 + VIEWPORT_ROWS;
    expect(scrollTopToReveal(below, scrollTop)).toBe(
      (below + 1) * ROW_HEIGHT_PX - VIEWPORT_ROWS * ROW_HEIGHT_PX,
    );
    expect(scrollTopToReveal(2999, scrollTop)).toBe(
      3000 * ROW_HEIGHT_PX - VIEWPORT_ROWS * ROW_HEIGHT_PX,
    );
  });
});

describe("needsNextPage (AC-11 keyset paging)", () => {
  it("is true exactly when a cursor exists, nothing is loading and the window nears the loaded end", () => {
    expect(
      needsNextPage({ end: 50 - PREFETCH_ROWS, loadedCount: 50, nextCursor: "c1", loading: false }),
    ).toBe(true);
    expect(needsNextPage({ end: 50, loadedCount: 50, nextCursor: "c1", loading: false })).toBe(
      true,
    );
    expect(
      needsNextPage({
        end: 50 - PREFETCH_ROWS - 1,
        loadedCount: 50,
        nextCursor: "c1",
        loading: false,
      }),
    ).toBe(false);
  });

  it("is false without a cursor", () => {
    expect(needsNextPage({ end: 50, loadedCount: 50, nextCursor: null, loading: false })).toBe(
      false,
    );
  });

  it("is false while a read is in flight", () => {
    expect(needsNextPage({ end: 50, loadedCount: 50, nextCursor: "c1", loading: true })).toBe(
      false,
    );
  });
});
