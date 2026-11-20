import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../api/client";
import { usePolledRead } from "./use-polled-read";

interface Answer {
  fast: boolean;
}

const FIXED_NOW = new Date("2026-09-06T18:30:00.000Z");

/** Sets what `document` reports, without announcing it. */
function defineVisibility(value: "hidden" | "visible"): void {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value });
  Object.defineProperty(document, "hidden", { configurable: true, get: () => value === "hidden" });
}

/** Sets what `document` reports and dispatches `visibilitychange`, as a browser does. */
function setVisibility(value: "hidden" | "visible"): void {
  defineVisibility(value);
  document.dispatchEvent(new Event("visibilitychange"));
}

/** Advances the fake clock and lets every settled read run its continuation. */
async function advance(ms: number): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

/** A read that settles when the test says so. */
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

/** The interval a last answer implies: 10 s once it is fast, else 60 s. */
const intervalByAnswer = (last: Answer | null): number => (last?.fast ? 10_000 : 60_000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  defineVisibility("visible");
});

afterEach(() => {
  defineVisibility("visible");
  vi.useRealTimers();
});

// Implements TC-COMP-069
describe("usePolledRead pauses while hidden, reads at once on show, never overlaps (DAC-E3-S2-1)", () => {
  it("fires nothing while hidden, reads at once on visible and resumes the 10 s schedule", async () => {
    const read = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: true });
    renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    setVisibility("hidden");
    await advance(30_000);
    expect(read).toHaveBeenCalledTimes(1);

    setVisibility("visible");
    await advance(0);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(9_999);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("starts no second read while one is in flight, whatever asks for it", async () => {
    const pending = deferred<Answer>();
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockResolvedValueOnce({ fast: true })
      .mockResolvedValueOnce({ fast: true })
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ fast: true });
    const { result } = renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(3);

    await advance(30_000);
    expect(read).toHaveBeenCalledTimes(3);
    setVisibility("hidden");
    setVisibility("visible");
    act(() => result.current.refresh());
    expect(read).toHaveBeenCalledTimes(3);

    await act(async () => {
      pending.resolve({ fast: true });
    });
    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(4);
  });

  it("schedules nothing for a read that settles while the page is hidden", async () => {
    const pending = deferred<Answer>();
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ fast: true });
    renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    setVisibility("hidden");
    await act(async () => {
      pending.resolve({ fast: true });
    });
    await advance(60_000);
    expect(read).toHaveBeenCalledTimes(1);

    setVisibility("visible");
    await advance(0);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("neither reads nor schedules for a read that settles after unmount", async () => {
    const pending = deferred<Answer>();
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ fast: true });
    const intervalMs = vi.fn(intervalByAnswer);
    const { unmount } = renderHook(() => usePolledRead(read, intervalMs));
    await advance(0);
    unmount();
    await act(async () => {
      pending.resolve({ fast: true });
    });
    await advance(120_000);
    expect(read).toHaveBeenCalledTimes(1);
    expect(intervalMs).not.toHaveBeenCalled();
  });

  it("removes the visibilitychange listener it added, on unmount", async () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const read = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: true });
    const { unmount } = renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    const added = add.mock.calls.filter(([type]) => type === "visibilitychange");
    expect(added).toHaveLength(1);
    expect(remove).not.toHaveBeenCalledWith("visibilitychange", expect.anything());
    unmount();
    expect(remove).toHaveBeenCalledWith("visibilitychange", added[0]?.[1]);
    add.mockRestore();
    remove.mockRestore();
  });

  it("makes no further read after unmount", async () => {
    const read = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: true });
    const { unmount } = renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    expect(read).toHaveBeenCalledTimes(1);
    unmount();
    await advance(120_000);
    setVisibility("visible");
    await advance(0);
    expect(read).toHaveBeenCalledTimes(1);
  });
});

// Implements TC-COMP-070
describe("usePolledRead keeps the previous value in error.last (DAC-E3-S2-2)", () => {
  const always10s = (): number => 10_000;

  it("reports a failure after a success with the success kept, then keeps it through the next failure", async () => {
    const apiError = new ApiError("boom", "req-1", { code: "internal_error" });
    const unreachable = new ApiUnreachableError("down");
    const read = vi
      .fn<() => Promise<{ n: number }>>()
      .mockResolvedValueOnce({ n: 1 })
      .mockRejectedValueOnce(apiError)
      .mockRejectedValueOnce(unreachable)
      .mockResolvedValueOnce({ n: 2 });
    const { result } = renderHook(() => usePolledRead(read, always10s));
    await advance(0);

    await advance(10_000);
    expect(result.current.state).toEqual({
      kind: "error",
      error: apiError,
      last: { data: { n: 1 }, checkedAt: new Date("2026-09-06T18:30:00.000Z") },
    });
    expect(result.current.state.kind === "error" && result.current.state.error).toBe(apiError);

    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(3);
    expect(result.current.state).toEqual({
      kind: "error",
      error: unreachable,
      last: { data: { n: 1 }, checkedAt: new Date("2026-09-06T18:30:00.000Z") },
    });

    await advance(10_000);
    expect(read).toHaveBeenCalledTimes(4);
    expect(result.current.state).toEqual({
      kind: "ok",
      data: { n: 2 },
      checkedAt: new Date("2026-09-06T18:30:30.000Z"),
    });
  });

  it("has no last value when the first read fails", async () => {
    const unreachable = new ApiUnreachableError("down");
    const read = vi.fn<() => Promise<{ n: number }>>().mockRejectedValue(unreachable);
    const { result } = renderHook(() => usePolledRead(read, always10s));
    await advance(0);
    expect(result.current.state).toEqual({ kind: "error", error: unreachable, last: null });
  });
});

describe("usePolledRead mount, checkedAt, interval and refresh (DAC-E3-5, AC-25)", () => {
  it("is loading until the mount read settles, then carries the answer's own instant", async () => {
    const first = deferred<Answer>();
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue({ fast: false });
    const { result } = renderHook(() => usePolledRead(read, intervalByAnswer));
    expect(result.current.state).toEqual({ kind: "loading" });

    await act(async () => {
      first.resolve({ fast: false });
    });
    expect(result.current.state).toEqual({
      kind: "ok",
      data: { fast: false },
      checkedAt: new Date("2026-09-06T18:30:00.000Z"),
    });

    await advance(60_000);
    expect(result.current.state).toEqual({
      kind: "ok",
      data: { fast: false },
      checkedAt: new Date("2026-09-06T18:31:00.000Z"),
    });
  });

  it("asks intervalMs about the last successful answer, or null before one", async () => {
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockResolvedValueOnce({ fast: false })
      .mockResolvedValueOnce({ fast: true })
      .mockResolvedValue({ fast: true });
    const intervalMs = vi.fn(intervalByAnswer);
    renderHook(() => usePolledRead(read, intervalMs));
    await advance(0);
    expect(intervalMs).toHaveBeenNthCalledWith(1, { fast: false });

    await advance(59_999);
    expect(read).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(2);
    expect(intervalMs).toHaveBeenNthCalledWith(2, { fast: true });
    await advance(9_999);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("passes null to intervalMs when the first read fails, and reads again at 60 s", async () => {
    const read = vi
      .fn<() => Promise<Answer>>()
      .mockRejectedValueOnce(new ApiUnreachableError("down"))
      .mockResolvedValue({ fast: true });
    const intervalMs = vi.fn(intervalByAnswer);
    renderHook(() => usePolledRead(read, intervalMs));
    await advance(0);
    expect(intervalMs).toHaveBeenCalledWith(null);
    await advance(59_999);
    expect(read).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it("refresh reads at once and reschedules from that read", async () => {
    const read = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: false });
    const { result } = renderHook(() => usePolledRead(read, intervalByAnswer));
    await advance(0);
    await advance(20_000);
    expect(read).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });
    expect(read).toHaveBeenCalledTimes(2);

    await advance(40_000);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(19_999);
    expect(read).toHaveBeenCalledTimes(2);
    await advance(1);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it("uses a changed read and intervalMs from the next read on, without restarting the poll", async () => {
    const firstRead = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: false });
    const secondRead = vi.fn<() => Promise<Answer>>().mockResolvedValue({ fast: false });
    const firstInterval = vi.fn(intervalByAnswer);
    const secondInterval = vi.fn((): number => 5_000);
    const { rerender } = renderHook(({ read, intervalMs }) => usePolledRead(read, intervalMs), {
      initialProps: { read: firstRead, intervalMs: firstInterval },
    });
    await advance(0);
    expect(firstRead).toHaveBeenCalledTimes(1);

    rerender({ read: secondRead, intervalMs: secondInterval });
    await advance(0);
    expect(firstRead).toHaveBeenCalledTimes(1);
    expect(secondRead).toHaveBeenCalledTimes(0);

    await advance(60_000);
    expect(firstRead).toHaveBeenCalledTimes(1);
    expect(secondRead).toHaveBeenCalledTimes(1);
    expect(secondInterval).toHaveBeenCalledWith({ fast: false });
    await advance(5_000);
    expect(secondRead).toHaveBeenCalledTimes(2);
  });
});
