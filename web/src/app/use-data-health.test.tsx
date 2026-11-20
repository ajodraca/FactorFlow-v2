import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ApiError } from "../api/client";
import type { HealthResponse, RunState } from "../api/types";
import { HealthProvider } from "./health";
import { ShellProvider } from "./shell-context";
import type { Attention, DataHealth, ReadState } from "./shell-types";
import { useDataHealth } from "./use-data-health";

/*
 * `useDataHealth()`: one read of `GET /api/data-health` on mount, on `retry()`
 * and once when the shell's attention read shows the download turning
 * terminal, never on a timer (CAP-003-E3-S3; DAC-E3-19, AC-28). The helpers
 * below repeat the shell-context test's harness, since test files share no
 * module.
 */

const NOW = new Date("2026-09-06T18:30:00.000Z");

const HEALTH: HealthResponse = {
  status: "ok",
  database: "reachable",
  credential_present: true,
  schema_version: 4,
  most_recent_run: null,
};

const SUMMARY = {
  never_classified: true,
  set: null,
  later: null,
  factors: {
    value: { qualified_count: 0, ranked: false, min_peer_set_size: 5 },
    growth: { qualified_count: 0, ranked: false, min_peer_set_size: 5 },
    momentum: { qualified_count: 0, ranked: false, min_peer_set_size: 5 },
  },
  stocks_current: null,
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

const ATTENTION_NO_DOWNLOAD: Attention = { ...ATTENTION_IDLE, latest_download: null };

const DATA_HEALTH: DataHealth = {
  checked_at: "2026-09-06T18:30:00Z",
  never_acquired: true,
  followed_count: 12,
  affected_count: 0,
  checks: { daily_prices: null, company_financials: null },
  problems: { rows: [], next_cursor: null },
};

const DATA_HEALTH_LATER: DataHealth = { ...DATA_HEALTH, followed_count: 99 };

const INTERNAL_ENVELOPE = {
  error: { code: "internal_error", message: "x", request_id: "req-500" },
};

const HEALTH_PATH = "/api/health";
const ATTENTION_PATH = "/api/attention";
const SUMMARY_PATH = "/api/classifications/summary";
const DATA_HEALTH_PATH = "/api/data-health";

type Answer = { status: number; body: unknown };
const queues = new Map<string, Array<Answer | Promise<Answer>>>();
const standings = new Map<string, Answer>();
const counts = new Map<string, number>();

async function router(input: RequestInfo | URL): Promise<Response> {
  const path = new URL(String(input), "http://localhost").pathname;
  counts.set(path, (counts.get(path) ?? 0) + 1);
  const next = queues.get(path)?.shift();
  const answer = next === undefined ? standings.get(path) : await next;
  if (answer === undefined) {
    throw new Error(`no answer set for ${path}`);
  }
  return new Response(JSON.stringify(answer.body), {
    status: answer.status,
    headers: { "Content-Type": "application/json" },
  });
}

function answer(path: string, status: number, body: unknown): void {
  const queue = queues.get(path) ?? [];
  queue.push({ status, body });
  queues.set(path, queue);
}

function standing(path: string, status: number, body: unknown): void {
  standings.set(path, { status, body });
}

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

async function advance(ms: number): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

let latestDH: ReturnType<typeof useDataHealth>;

function DataHealthProbe() {
  latestDH = useDataHealth();
  return null;
}

function Tree({ withHook = true }: { withHook?: boolean }) {
  return (
    <HealthProvider>
      <ShellProvider>{withHook ? <DataHealthProbe /> : null}</ShellProvider>
    </HealthProvider>
  );
}

function standBase(attention: Attention = ATTENTION_IDLE): void {
  standing(HEALTH_PATH, 200, HEALTH);
  standing(ATTENTION_PATH, 200, attention);
  standing(SUMMARY_PATH, 200, SUMMARY);
  standing(DATA_HEALTH_PATH, 200, DATA_HEALTH);
}

beforeEach(() => {
  queues.clear();
  standings.clear();
  counts.clear();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal("fetch", vi.fn(router));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useDataHealth reads on demand only (TC-COMP-064, DAC-E3-19, AC-28)", () => {
  // Implements TC-COMP-064
  it("reads on mount, on retry and on a terminal transition, and on no timer", async () => {
    standBase();
    render(<Tree />);
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
    expect(latestDH.state).toEqual({ kind: "ok", data: DATA_HEALTH, checkedAt: NOW });

    act(() => latestDH.retry());
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);

    // Ten attention answers, all terminal to terminal.
    await advance(600_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);

    standing(ATTENTION_PATH, 200, attentionWith("running"));
    await advance(60_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);
    standing(ATTENTION_PATH, 200, attentionWith("succeeded"));
    await advance(10_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(3);

    await advance(180_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(3);
  });

  it("is imported by data-health-ui alone", () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
    const files = walk(path.join(root, "web/src")).map((file) => ({
      path: path.relative(root, file).split(path.sep).join("/"),
      source: readFileSync(file, "utf-8"),
    }));
    expect(files.length).toBeGreaterThan(50);
    expect(files.map((file) => file.path)).toContain("web/src/app/use-data-health.ts");
    expect(illegalImporters(files)).toEqual([]);
  });

  it("flags an importer outside data-health-ui", () => {
    const planted = {
      path: "web/src/screens/home/index.tsx",
      source: 'import { useDataHealth } from "../../app/use-data-health";',
    };
    const allowed = {
      path: "web/src/screens/data-health/index.tsx",
      source: 'import { useDataHealth } from "../../app/use-data-health";',
    };
    expect(illegalImporters([planted, allowed])).toEqual([planted.path]);
    expect(illegalImporters([allowed])).toEqual([]);
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return walk(full);
    }
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

/** Files, other than data-health-ui's own, that import `use-data-health`. */
function illegalImporters(files: { path: string; source: string }[]): string[] {
  return files
    .filter((file) => /from\s+["'][^"']*use-data-health["']/.test(file.source))
    .map((file) => file.path)
    .filter((file) => !file.startsWith("web/src/screens/data-health/"));
}

const NON_TERMINAL: RunState[] = ["requested", "running", "cancelling"];
const TERMINAL: RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

describe("useDataHealth states, ordering and edges (DAC-E3-19, AC-28)", () => {
  it.each(NON_TERMINAL.flatMap((before) => TERMINAL.map((after) => [before, after] as const)))(
    "reads once when the download goes from %s to %s",
    async (before, after) => {
      standBase(attentionWith(before));
      render(<Tree />);
      await advance(0);
      expect(calls(DATA_HEALTH_PATH)).toBe(1);
      standing(ATTENTION_PATH, 200, attentionWith(after));
      await advance(10_000);
      expect(calls(ATTENTION_PATH)).toBe(2);
      expect(calls(DATA_HEALTH_PATH)).toBe(2);
    },
  );

  it.each([
    ["cancelling to running", attentionWith("cancelling"), attentionWith("running"), 10_000],
    ["no download to succeeded", ATTENTION_NO_DOWNLOAD, attentionWith("succeeded"), 60_000],
    ["succeeded to succeeded", attentionWith("succeeded"), attentionWith("succeeded"), 60_000],
  ])("does not read on %s", async (_name, first, second, cadenceMs) => {
    standBase(first);
    render(<Tree />);
    await advance(0);
    standing(ATTENTION_PATH, 200, second);
    await advance(cadenceMs);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
  });

  it("compares consecutive successful answers across a failed attention read", async () => {
    standBase(attentionWith("running"));
    render(<Tree />);
    await advance(0);
    standing(ATTENTION_PATH, 500, INTERNAL_ENVELOPE);
    await advance(10_000);
    expect(calls(ATTENTION_PATH)).toBe(2);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
    standing(ATTENTION_PATH, 200, attentionWith("succeeded"));
    await advance(10_000);
    expect(calls(ATTENTION_PATH)).toBe(3);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);
  });

  it("reads once when the hook mounts after the provider has answered", async () => {
    standBase(attentionWith("running"));
    const view = render(<Tree withHook={false} />);
    await advance(0);
    expect(calls(ATTENTION_PATH)).toBe(1);
    view.rerender(<Tree />);
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
    standing(ATTENTION_PATH, 200, attentionWith("succeeded"));
    await advance(10_000);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);
  });

  it("keeps the last good answer in error.last", async () => {
    standBase();
    answer(DATA_HEALTH_PATH, 500, INTERNAL_ENVELOPE);
    render(<Tree />);
    await advance(0);
    expect(latestDH.state).toEqual({ kind: "error", error: expect.any(ApiError), last: null });
    if (latestDH.state.kind === "error") {
      expect((latestDH.state.error as ApiError).code).toBe("internal_error");
    }
    answer(DATA_HEALTH_PATH, 200, DATA_HEALTH);
    act(() => latestDH.retry());
    await advance(0);
    expect(latestDH.state).toEqual({ kind: "ok", data: DATA_HEALTH, checkedAt: NOW });
    answer(DATA_HEALTH_PATH, 500, INTERNAL_ENVELOPE);
    act(() => latestDH.retry());
    await advance(0);
    expect(latestDH.state).toEqual({
      kind: "error",
      error: expect.any(ApiError),
      last: { data: DATA_HEALTH, checkedAt: NOW },
    });
    answer(DATA_HEALTH_PATH, 500, INTERNAL_ENVELOPE);
    act(() => latestDH.retry());
    await advance(0);
    expect(latestDH.state).toEqual({
      kind: "error",
      error: expect.any(ApiError),
      last: { data: DATA_HEALTH, checkedAt: NOW },
    });
  });

  it("never overlaps two reads and runs one trailing read for any triggers during one", async () => {
    standBase();
    const pending = defer(DATA_HEALTH_PATH);
    answer(DATA_HEALTH_PATH, 200, DATA_HEALTH_LATER);
    render(<Tree />);
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
    act(() => latestDH.retry());
    act(() => latestDH.retry());
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(1);
    pending.resolve(200, DATA_HEALTH);
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(2);
    expect(latestDH.state).toEqual({ kind: "ok", data: DATA_HEALTH_LATER, checkedAt: NOW });
    act(() => latestDH.retry());
    await advance(0);
    expect(calls(DATA_HEALTH_PATH)).toBe(3);
  });

  it("adds no read and no warning when it unmounts with a read in flight", async () => {
    standBase(attentionWith("running"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const pending = defer(DATA_HEALTH_PATH);
      const view = render(<Tree />);
      await advance(0);
      act(() => latestDH.retry());
      view.rerender(<Tree withHook={false} />);
      pending.resolve(200, DATA_HEALTH);
      standing(ATTENTION_PATH, 200, attentionWith("succeeded"));
      await advance(10_000);
      expect(calls(DATA_HEALTH_PATH)).toBe(1);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it("returns exactly state and a stable retry", async () => {
    standBase();
    render(<Tree />);
    await advance(0);
    expect(Object.keys(latestDH).sort()).toEqual(["retry", "state"]);
    const first = latestDH.retry;
    await advance(120_000);
    expect(latestDH.retry).toBe(first);
    expectTypeOf(useDataHealth).returns.toEqualTypeOf<{
      state: ReadState<DataHealth>;
      retry(): void;
    }>();
  });
});
