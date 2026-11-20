import { act, render, renderHook, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../api/client";
import type { HealthResponse, RunState } from "../api/types";
import { HealthProvider } from "./health";
import { type ShellContextValue, ShellProvider, useShell, useTitleDetail } from "./shell-context";
import type { Attention, ScoreSummary } from "./shell-types";

/*
 * The shell context: cadences, refresh, the title detail, the context's shape
 * and the score mapping (CAP-003-E3-S3; owner-shell 2.3, 2.4). Requests go
 * through the real fetch functions against one fake `fetch`, so the `404`
 * mapping is exercised end to end.
 */

const NOW = new Date("2026-09-06T18:30:00.000Z");

const HEALTH: HealthResponse = {
  status: "ok",
  database: "reachable",
  credential_present: true,
  schema_version: 4,
  most_recent_run: null,
};

const ATTENTION_IDLE: Attention = {
  checked_at: "2026-09-06T18:30:00Z",
  followed_count: 12,
  prices_as_of: "2026-09-05",
  credential_present: true,
  problems: { stock_count: 3, symbols: ["AAA", "BBB", "CCC"], newest_completed_at: null },
  latest_download: {
    run_id: "run-1",
    state: "succeeded",
    requested_at: "2026-09-06T17:00:00Z",
    started_at: "2026-09-06T17:00:05Z",
    ended_at: "2026-09-06T17:20:00Z",
    progress: { done: 12, total: 12 },
  },
  latest_terminal_download: null,
  items: [],
};

function attentionWith(state: RunState): Attention {
  const base = ATTENTION_IDLE.latest_download;
  if (base === null) {
    throw new Error("fixture has a latest download");
  }
  return { ...ATTENTION_IDLE, latest_download: { ...base, state } };
}

const SUMMARY_SET: ScoreSummary = {
  never_classified: false,
  set: {
    set_id: "set-1",
    classification_date: "2026-09-05",
    run_id: "crun-1",
    run_started_at: "2026-09-05T22:00:00Z",
    run_outcome: "succeeded",
    state: "complete",
    started_at: "2026-09-05T22:00:00Z",
    ended_at: "2026-09-05T22:10:00Z",
    latest_trading_day: "2026-09-04",
    active_instruments: 40,
    not_current: false,
  },
  later: null,
  factors: {
    value: { qualified_count: 30, ranked: true, min_peer_set_size: 5 },
    growth: { qualified_count: 28, ranked: true, min_peer_set_size: 5 },
    momentum: { qualified_count: 35, ranked: true, min_peer_set_size: 5 },
  },
  stocks_current: { current_count: 10, followed_count: 12 },
};

const SUMMARY_BUILDING: ScoreSummary = {
  ...SUMMARY_SET,
  later: {
    set_id: "set-2",
    state: "building",
    started_at: "2026-09-06T18:00:00Z",
    ended_at: null,
    failure_reason: null,
    run_id: "crun-2",
    run_started_at: "2026-09-06T18:00:00Z",
  },
};

const SUMMARY_LATER_FAILED: ScoreSummary = {
  ...SUMMARY_BUILDING,
  later: {
    ...(SUMMARY_BUILDING.later as NonNullable<ScoreSummary["later"]>),
    state: "failed",
    ended_at: "2026-09-06T18:10:00Z",
    failure_reason: "x",
  },
};

const NOT_FOUND_ENVELOPE = {
  error: { code: "not_found", message: "No resource exists at this path.", request_id: "req-404" },
};
const INTERNAL_ENVELOPE = {
  error: { code: "internal_error", message: "x", request_id: "req-500" },
};

const HEALTH_PATH = "/api/health";
const ATTENTION_PATH = "/api/attention";
const SUMMARY_PATH = "/api/classifications/summary";
const DATA_HEALTH_PATH = "/api/data-health";

type Answer = { status: number; body: unknown } | "unreachable";
const queues = new Map<string, Array<Answer | Promise<Answer>>>();
const standings = new Map<string, Answer>();
const counts = new Map<string, number>();

function toResponse(answer: Answer): Response {
  if (answer === "unreachable") {
    throw new TypeError("network down");
  }
  return new Response(JSON.stringify(answer.body), {
    status: answer.status,
    headers: { "Content-Type": "application/json" },
  });
}

async function router(input: RequestInfo | URL): Promise<Response> {
  const path = new URL(String(input), "http://localhost").pathname;
  counts.set(path, (counts.get(path) ?? 0) + 1);
  const next = queues.get(path)?.shift();
  const answer = next === undefined ? standings.get(path) : await next;
  if (answer === undefined) {
    throw new Error(`no answer set for ${path}`);
  }
  return toResponse(answer);
}

function answer(path: string, status: number, body: unknown): void {
  const queue = queues.get(path) ?? [];
  queue.push({ status, body });
  queues.set(path, queue);
}

function standing(path: string, status: number, body: unknown): void {
  standings.set(path, { status, body });
}

/** Queues an answer the test settles later. */
function defer(path: string): { resolve(status: number, body: unknown): void } {
  let settle: (value: Answer) => void = () => undefined;
  const promise = new Promise<Answer>((resolve) => {
    settle = resolve;
  });
  const queue = queues.get(path) ?? [];
  queue.push(promise);
  queues.set(path, queue);
  return { resolve: (status, body) => settle({ status, body }) };
}

function calls(path: string): number {
  return counts.get(path) ?? 0;
}

function standIdle(): void {
  standing(HEALTH_PATH, 200, HEALTH);
  standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
  standing(SUMMARY_PATH, 200, SUMMARY_SET);
}

async function advance(ms: number): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

function defineVisibility(value: "hidden" | "visible"): void {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value });
  Object.defineProperty(document, "hidden", { configurable: true, get: () => value === "hidden" });
}

function setVisibility(value: "hidden" | "visible"): void {
  defineVisibility(value);
  document.dispatchEvent(new Event("visibilitychange"));
}

let latest: ShellContextValue;

function Probe() {
  latest = useShell();
  return <p data-testid="title-detail">{String(useTitleDetail())}</p>;
}

function Tree({ children }: { children?: React.ReactNode }) {
  return (
    <HealthProvider>
      <ShellProvider>
        <Probe />
        {children}
      </ShellProvider>
    </HealthProvider>
  );
}

async function mount() {
  const view = render(<Tree />);
  await advance(0);
  return view;
}

beforeEach(() => {
  queues.clear();
  standings.clear();
  counts.clear();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal("fetch", vi.fn(router));
  defineVisibility("visible");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  defineVisibility("visible");
});

const NON_TERMINAL: RunState[] = ["requested", "running", "cancelling"];
const TERMINAL: RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

describe("ShellProvider cadences (TC-COMP-073, DAC-E3-S3-1, AC-25)", () => {
  // Implements TC-COMP-073
  it("reads attention and summary every 60 s while idle", async () => {
    standIdle();
    await mount();
    expect(calls(ATTENTION_PATH)).toBe(1);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(59_999);
    expect(calls(ATTENTION_PATH)).toBe(1);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(1);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(2);
    await advance(60_000);
    expect(calls(ATTENTION_PATH)).toBe(3);
    expect(calls(SUMMARY_PATH)).toBe(3);
  });

  it.each(NON_TERMINAL)(
    "reads both every 10 s while the download is %s",
    async (state: RunState) => {
      standing(HEALTH_PATH, 200, HEALTH);
      standing(ATTENTION_PATH, 200, attentionWith(state));
      const first = defer(ATTENTION_PATH);
      const firstSummary = defer(SUMMARY_PATH);
      standing(SUMMARY_PATH, 200, SUMMARY_SET);
      render(<Tree />);
      await advance(0);
      first.resolve(200, attentionWith(state));
      await advance(0);
      firstSummary.resolve(200, SUMMARY_SET);
      await advance(0);
      expect(calls(ATTENTION_PATH)).toBe(1);
      expect(calls(SUMMARY_PATH)).toBe(1);
      await advance(9_999);
      expect(calls(ATTENTION_PATH)).toBe(1);
      expect(calls(SUMMARY_PATH)).toBe(1);
      await advance(1);
      expect(calls(ATTENTION_PATH)).toBe(2);
      expect(calls(SUMMARY_PATH)).toBe(2);
      await advance(10_000);
      expect(calls(ATTENTION_PATH)).toBe(3);
      expect(calls(SUMMARY_PATH)).toBe(3);
      await advance(10_000);
      expect(calls(ATTENTION_PATH)).toBe(4);
      expect(calls(SUMMARY_PATH)).toBe(4);
    },
  );

  it.each(TERMINAL)(
    "returns to 60 s after the next answer once the download is %s",
    async (end) => {
      standing(HEALTH_PATH, 200, HEALTH);
      standing(ATTENTION_PATH, 200, attentionWith("running"));
      standing(SUMMARY_PATH, 200, SUMMARY_SET);
      await mount();
      await advance(30_000);
      expect(calls(ATTENTION_PATH)).toBe(4);
      // The read at 30 000 ms is the fourth; make the next answer terminal.
      standing(ATTENTION_PATH, 200, attentionWith(end));
      await advance(10_000);
      expect(calls(ATTENTION_PATH)).toBe(5);
      // That fifth answer (at 40 000 ms) was terminal, and the summary read
      // beside it saw it: both next reads come 60 s after, not 10 s.
      expect(calls(SUMMARY_PATH)).toBe(5);
      await advance(59_999);
      expect(calls(ATTENTION_PATH)).toBe(5);
      expect(calls(SUMMARY_PATH)).toBe(5);
      await advance(1);
      expect(calls(ATTENTION_PATH)).toBe(6);
      expect(calls(SUMMARY_PATH)).toBe(6);
    },
  );

  it("reads both every 10 s while the scores are building", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    const a = defer(ATTENTION_PATH);
    const s = defer(SUMMARY_PATH);
    standing(SUMMARY_PATH, 200, SUMMARY_BUILDING);
    render(<Tree />);
    await advance(0);
    // The summary answers first, so attention's delay already sees it building.
    s.resolve(200, SUMMARY_BUILDING);
    await advance(0);
    a.resolve(200, ATTENTION_IDLE);
    await advance(0);
    await advance(9_999);
    expect(calls(ATTENTION_PATH)).toBe(1);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(1);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(2);
  });

  it("keeps 60 s for both when the later set failed", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    standing(SUMMARY_PATH, 200, SUMMARY_LATER_FAILED);
    await mount();
    await advance(59_999);
    expect(calls(ATTENTION_PATH)).toBe(1);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(1);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(2);
  });

  it("re-reads a not-served summary on the 60 s cadence while a download runs", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, attentionWith("running"));
    standing(SUMMARY_PATH, 404, NOT_FOUND_ENVELOPE);
    await mount();
    await advance(9_999);
    expect(calls(ATTENTION_PATH)).toBe(1);
    await advance(1);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(49_999);
    expect(calls(SUMMARY_PATH)).toBe(1);
    await advance(1);
    expect(calls(SUMMARY_PATH)).toBe(2);
  });
});

describe("ShellProvider refresh (TC-COMP-074, DAC-E3-S3-2)", () => {
  // Implements TC-COMP-074
  it("reads attention at once and reschedules from it", async () => {
    standIdle();
    await mount();
    await advance(20_000);
    act(() => latest.refresh("attention"));
    await advance(0);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(1);
    expect(calls(HEALTH_PATH)).toBe(1);
    await advance(40_000);
    expect(calls(ATTENTION_PATH)).toBe(2);
    await advance(20_000);
    expect(calls(ATTENTION_PATH)).toBe(3);
  });

  it("never overlaps two attention reads and reschedules from the resolution", async () => {
    standIdle();
    await mount();
    const pending = defer(ATTENTION_PATH);
    act(() => latest.refresh("attention"));
    await advance(0);
    expect(calls(ATTENTION_PATH)).toBe(2);
    act(() => latest.refresh("attention"));
    await advance(0);
    expect(calls(ATTENTION_PATH)).toBe(2);
    pending.resolve(200, ATTENTION_IDLE);
    await advance(0);
    await advance(59_999);
    expect(calls(ATTENTION_PATH)).toBe(2);
    await advance(1);
    expect(calls(ATTENTION_PATH)).toBe(3);
  });

  it("refreshes the summary alone", async () => {
    standIdle();
    await mount();
    await advance(20_000);
    act(() => latest.refresh("scores"));
    await advance(0);
    expect(calls(SUMMARY_PATH)).toBe(2);
    expect(calls(ATTENTION_PATH)).toBe(1);
  });

  it("refreshes health alone, keeping its 30 s cadence", async () => {
    standIdle();
    await mount();
    await advance(10_000);
    act(() => latest.refresh("health"));
    await advance(0);
    expect(calls(HEALTH_PATH)).toBe(2);
    expect(calls(ATTENTION_PATH)).toBe(1);
    await advance(29_999);
    expect(calls(HEALTH_PATH)).toBe(2);
    await advance(1);
    expect(calls(HEALTH_PATH)).toBe(3);
  });

  it("keeps the identity of refresh across answers", async () => {
    standIdle();
    await mount();
    const first = latest.refresh;
    await advance(60_000);
    await advance(60_000);
    expect(latest.refresh).toBe(first);
  });
});

function DetailScreen({ onEffect }: { onEffect: () => void }) {
  const { setTitleDetail } = useShell();
  useEffect(() => {
    onEffect();
    setTitleDetail("Download 2026-10-15 09:30 CDT");
    return () => setTitleDetail(null);
  }, [setTitleDetail, onEffect]);
  return null;
}

describe("setTitleDetail (TC-COMP-075, DAC-E3-S3-3)", () => {
  // Implements TC-COMP-075
  it("holds the detail while the screen is mounted and clears it on unmount", async () => {
    standIdle();
    const onEffect = vi.fn();
    const view = render(
      <Tree>
        <DetailScreen onEffect={onEffect} />
      </Tree>,
    );
    await advance(0);
    expect(screen.getByTestId("title-detail").textContent).toBe("Download 2026-10-15 09:30 CDT");
    await advance(180_000);
    expect(screen.getByTestId("title-detail").textContent).toBe("Download 2026-10-15 09:30 CDT");
    expect(onEffect).toHaveBeenCalledTimes(1);
    view.rerender(<Tree />);
    await advance(0);
    expect(screen.getByTestId("title-detail").textContent).toBe("null");
  });

  it("starts as null and follows direct calls", async () => {
    standIdle();
    await mount();
    expect(screen.getByTestId("title-detail").textContent).toBe("null");
    act(() => latest.setTitleDetail("X"));
    expect(screen.getByTestId("title-detail").textContent).toBe("X");
    act(() => latest.setTitleDetail(null));
    expect(screen.getByTestId("title-detail").textContent).toBe("null");
  });
});

type DeepKeys<T> = T extends (...args: never[]) => unknown
  ? never
  : T extends Date
    ? never
    : T extends Array<infer E>
      ? DeepKeys<E>
      : T extends object
        ? { [K in keyof T & string]: K | DeepKeys<T[K]> }[keyof T & string]
        : never;

describe("credential_present stays a boolean (TC-COMP-076, DAC-E3-S3-4)", () => {
  // Implements TC-COMP-076
  it("exposes no credential-bearing key but credential_present, at the type level", () => {
    expectTypeOf<
      Extract<
        DeepKeys<ShellContextValue>,
        `${string}${"credential" | "secret" | "token" | "password" | "key" | "Key"}${string}`
      >
    >().toEqualTypeOf<"credential_present">();
    expectTypeOf<
      NonNullable<ShellContextValue["health"]["health"]>["credential_present"]
    >().toEqualTypeOf<boolean>();
  });

  it.each([true, false])("passes credential_present %s through as a boolean", async (present) => {
    standing(HEALTH_PATH, 200, { ...HEALTH, credential_present: present });
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    standing(SUMMARY_PATH, 200, SUMMARY_SET);
    await mount();
    expect(typeof latest.health.health?.credential_present).toBe("boolean");
    expect(latest.health.health?.credential_present).toBe(present);
    expect(JSON.stringify(latest)).not.toMatch(/"credential(?!_present")/);
  });
});

describe("the score and attention states (TC-COMP-059, DAC-E3-6)", () => {
  // Implements TC-COMP-059
  it("maps a summary 404 to not_served and any other failure to an error", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    standing(SUMMARY_PATH, 404, NOT_FOUND_ENVELOPE);
    await mount();
    expect(latest.scores).toEqual({ kind: "not_served" });
    expect("error" in latest.scores).toBe(false);
    expect("checkedAt" in latest.scores).toBe(false);
  });

  it("gives an error for a first-read 500, with no last value", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    standing(SUMMARY_PATH, 500, INTERNAL_ENVELOPE);
    await mount();
    expect(latest.scores).toEqual({ kind: "error", error: expect.any(ApiError), last: null });
  });

  it("keeps the last served summary when a later read fails, then recovers", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    answer(SUMMARY_PATH, 200, SUMMARY_SET);
    answer(SUMMARY_PATH, 500, INTERNAL_ENVELOPE);
    answer(SUMMARY_PATH, 200, SUMMARY_BUILDING);
    standing(SUMMARY_PATH, 200, SUMMARY_BUILDING);
    await mount();
    expect(latest.scores).toEqual({ kind: "served", data: SUMMARY_SET, checkedAt: NOW });
    await advance(60_000);
    expect(latest.scores).toEqual({
      kind: "error",
      error: expect.any(ApiError),
      last: SUMMARY_SET,
    });
    expect(latest.scores).toMatchObject({ error: { code: "internal_error" } });
    await advance(60_000);
    expect(latest.scores).toEqual({
      kind: "served",
      data: SUMMARY_BUILDING,
      checkedAt: new Date(NOW.getTime() + 120_000),
    });
  });

  it("has no last value after a not-served answer followed by a failure", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(ATTENTION_PATH, 200, ATTENTION_IDLE);
    answer(SUMMARY_PATH, 404, NOT_FOUND_ENVELOPE);
    standing(SUMMARY_PATH, 500, INTERNAL_ENVELOPE);
    await mount();
    await advance(60_000);
    expect(latest.scores).toEqual({ kind: "error", error: expect.any(ApiError), last: null });
  });

  it("keeps the last attention answer when a read fails or the network is down", async () => {
    standing(HEALTH_PATH, 200, HEALTH);
    standing(SUMMARY_PATH, 200, SUMMARY_SET);
    answer(ATTENTION_PATH, 200, ATTENTION_IDLE);
    answer(ATTENTION_PATH, 500, INTERNAL_ENVELOPE);
    await mount();
    await advance(60_000);
    expect(latest.attention).toEqual({
      kind: "error",
      error: expect.any(ApiError),
      last: { data: ATTENTION_IDLE, checkedAt: NOW },
    });
    standing(ATTENTION_PATH, 500, INTERNAL_ENVELOPE);
    queues.set(ATTENTION_PATH, ["unreachable"]);
    await advance(60_000);
    expect(latest.attention).toEqual({
      kind: "error",
      error: expect.any(ApiUnreachableError),
      last: { data: ATTENTION_IDLE, checkedAt: NOW },
    });
  });
});

describe("the context's shape, freshness, pause and on-demand reads", () => {
  it("exposes exactly the five members", async () => {
    standIdle();
    await mount();
    expect(Object.keys(latest).sort()).toEqual([
      "attention",
      "health",
      "refresh",
      "scores",
      "setTitleDetail",
    ]);
    expectTypeOf<keyof ShellContextValue>().toEqualTypeOf<
      "health" | "attention" | "scores" | "refresh" | "setTitleDetail"
    >();
  });

  it("carries the instant of every answer (AC-25)", async () => {
    standIdle();
    await mount();
    expect(latest.attention).toEqual({ kind: "ok", data: ATTENTION_IDLE, checkedAt: NOW });
    expect(latest.scores).toEqual({ kind: "served", data: SUMMARY_SET, checkedAt: NOW });
    expect(latest.health.liveness).toBe("answering");
    expect(latest.health.lastAnsweredAt).toEqual(NOW);
    await advance(60_000);
    const later = new Date("2026-09-06T18:31:00.000Z");
    expect(latest.attention.kind === "ok" && latest.attention.checkedAt).toEqual(later);
    expect(latest.scores.kind === "served" && latest.scores.checkedAt).toEqual(later);
  });

  it("pauses while the page is hidden and reads once when it is visible again", async () => {
    standIdle();
    await mount();
    setVisibility("hidden");
    await advance(600_000);
    expect(calls(ATTENTION_PATH)).toBe(1);
    expect(calls(SUMMARY_PATH)).toBe(1);
    expect(calls(HEALTH_PATH)).toBe(1);
    setVisibility("visible");
    await advance(0);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(SUMMARY_PATH)).toBe(2);
    expect(calls(HEALTH_PATH)).toBe(2);
  });

  it("never reads the data-health aggregate (AC-28)", async () => {
    standIdle();
    standing(DATA_HEALTH_PATH, 200, {});
    await mount();
    await advance(600_000);
    standing(ATTENTION_PATH, 200, attentionWith("running"));
    await advance(60_000);
    standing(ATTENTION_PATH, 200, attentionWith("succeeded"));
    await advance(60_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(0);
  });

  it("stops every read on unmount", async () => {
    standIdle();
    const view = await mount();
    view.unmount();
    const before = [HEALTH_PATH, ATTENTION_PATH, SUMMARY_PATH].map(calls);
    await advance(600_000);
    expect([HEALTH_PATH, ATTENTION_PATH, SUMMARY_PATH].map(calls)).toEqual(before);
  });

  it("throws outside a provider, and reads no detail there", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      expect(() => renderHook(() => useShell())).toThrow(
        new Error("useShell() must be called inside <ShellProvider>"),
      );
    } finally {
      spy.mockRestore();
    }
    expect(renderHook(() => useTitleDetail()).result.current).toBeNull();
  });
});
