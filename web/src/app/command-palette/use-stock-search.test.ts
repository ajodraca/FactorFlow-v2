import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import { useStockSearch } from "./use-stock-search";

interface Deferred {
  promise: Promise<Response>;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
}

function deferred(): Deferred {
  let resolve!: (response: Response) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Response>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function page(symbols: string[], nextCursor: string | null = null): Response {
  return new Response(
    JSON.stringify({
      instruments: symbols.map((symbol, i) => ({
        instrument_id: i + 1,
        symbol,
        lifecycle: "active",
      })),
      active_count: symbols.length,
      retired_count: 0,
      next_cursor: nextCursor,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

let calls: { url: string; init: RequestInit; reply: Deferred }[];

beforeEach(() => {
  vi.useFakeTimers();
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init: RequestInit) => {
      const reply = deferred();
      calls.push({ url, init, reply });
      return reply.promise;
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

function mount() {
  return renderHook(({ text }) => useStockSearch(text), { initialProps: { text: "" } });
}

async function settle(call: { reply: Deferred }, response: Response) {
  await act(async () => {
    call.reply.resolve(response);
    await vi.advanceTimersByTimeAsync(0);
  });
}

// Implements TC-COMP-081
describe("stock search debounces 250 ms and aborts the stale request (DAC-E3-S5-1, DAC-E3-11)", () => {
  it("(a) sends one request for the settled text, 250 ms after the last keystroke", () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ text: "KO" });
    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(calls).toHaveLength(0);
    expect(result.current).toEqual({ kind: "loading" });
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("/api/instruments?symbol=KO&lifecycle=active&limit=8");
  });

  it("(a) sends the trimmed text, not what was typed around it", () => {
    const { rerender } = mount();
    rerender({ text: "  KO " });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("/api/instruments?symbol=KO&lifecycle=active&limit=8");
  });

  it("(b) aborts the request in flight at once and never lets a stale answer overwrite", async () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(calls).toHaveLength(1);
    expect((calls[0]?.init.signal as AbortSignal).aborted).toBe(false);
    rerender({ text: "KO" });
    expect((calls[0]?.init.signal as AbortSignal).aborted).toBe(true);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(calls).toHaveLength(2);
    expect(calls[1]?.url).toContain("symbol=KO&");

    await settle(calls[1] as { reply: Deferred }, page(["KO", "KOF"]));
    expect(result.current).toEqual({ kind: "ok", symbols: ["KO", "KOF"], more: false });
    await settle(calls[0] as { reply: Deferred }, page(["KXX"]));
    expect(result.current).toEqual({ kind: "ok", symbols: ["KO", "KOF"], more: false });
  });

  it("(b) an aborted request rejecting never becomes an error", async () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    rerender({ text: "KO" });
    await act(async () => {
      calls[0]?.reply.reject(new DOMException("aborted", "AbortError"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current).toEqual({ kind: "loading" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await settle(calls[1] as { reply: Deferred }, page(["KO"]));
    expect(result.current).toEqual({ kind: "ok", symbols: ["KO"], more: false });
  });

  it("(b) reports more rows when the page has a next cursor", async () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await settle(calls[0] as { reply: Deferred }, page(["KA", "KB"], "KB"));
    expect(result.current).toEqual({ kind: "ok", symbols: ["KA", "KB"], more: true });
  });

  it("(c) clearing the text aborts, goes idle and sends nothing more", () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(calls).toHaveLength(1);
    rerender({ text: "" });
    expect((calls[0]?.init.signal as AbortSignal).aborted).toBe(true);
    expect(result.current).toEqual({ kind: "idle" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(calls).toHaveLength(1);
    rerender({ text: "   " });
    expect(result.current).toEqual({ kind: "idle" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(calls).toHaveLength(1);
  });

  it("(c) unmounting aborts the request in flight", () => {
    const { rerender, unmount } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    unmount();
    expect((calls[0]?.init.signal as AbortSignal).aborted).toBe(true);
  });

  it("(d) an unreachable API and an error envelope both end as error, keeping the error", async () => {
    const { result, rerender } = mount();
    rerender({ text: "K" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await act(async () => {
      calls[0]?.reply.reject(new TypeError("Failed to fetch"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.kind).toBe("error");
    if (result.current.kind === "error") {
      expect(result.current.error).toBeInstanceOf(ApiUnreachableError);
    }

    rerender({ text: "KO" });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    await settle(
      calls[1] as { reply: Deferred },
      new Response(JSON.stringify({ error: { code: "internal_error", request_id: "req-1" } }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(result.current.kind).toBe("error");
    if (result.current.kind === "error") {
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect((result.current.error as ApiError).code).toBe("internal_error");
    }
  });
});
