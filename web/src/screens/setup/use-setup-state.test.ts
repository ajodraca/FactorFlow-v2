import { act, render } from "@testing-library/react";
import { type FunctionComponent, createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, getHistoryDepth, listInstruments } from "../../api/client";
import type { RunState } from "../../api/types";
import type { ShellContextValue } from "../../app/shell-context";
import { useShell } from "../../app/shell-context";
import type { Attention, LatestDownload, ReadState } from "../../app/shell-types";
import { SetupDraftProvider } from "./draft";
import { type SetupState, useSetupState } from "./use-setup-state";

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  getHistoryDepth: vi.fn(),
  listInstruments: vi.fn(),
}));

vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }));

type Health = ShellContextValue["health"];

const T_ANSWER = new Date("2026-09-06T18:30:00.000Z");
const T_POLL = new Date("2026-09-06T18:31:00.000Z");

const HEALTH_UNKNOWN: Health = {
  liveness: "unknown",
  health: null,
  lastUpdated: null,
  lastAnsweredAt: null,
};
const HEALTH_OK: Health = {
  liveness: "answering",
  health: {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 3,
    most_recent_run: null,
  },
  lastUpdated: T_ANSWER,
  lastAnsweredAt: T_ANSWER,
};
const HEALTH_UNREACHABLE_AFTER_ANSWER: Health = {
  liveness: "unreachable",
  health: HEALTH_OK.health,
  lastUpdated: T_POLL,
  lastAnsweredAt: T_ANSWER,
};
const HEALTH_UNREACHABLE_NEVER: Health = {
  liveness: "unreachable",
  health: null,
  lastUpdated: T_POLL,
  lastAnsweredAt: null,
};

const ATTENTION_BASE: Attention = {
  checked_at: "2026-09-06T18:30:00Z",
  followed_count: 0,
  prices_as_of: null,
  credential_present: true,
  problems: { stock_count: 0, symbols: [], newest_completed_at: null },
  latest_download: null,
  latest_terminal_download: null,
  items: [],
};
const ATTENTION_LOADING: ReadState<Attention> = { kind: "loading" };

function downloadIn(state: RunState): LatestDownload {
  return {
    run_id: "r-1",
    state,
    requested_at: "2026-09-06T18:20:00Z",
    started_at: null,
    ended_at: null,
    progress: { done: 0, total: null },
  };
}

function attentionOk(download: LatestDownload | null): ReadState<Attention> {
  return {
    kind: "ok",
    data: { ...ATTENTION_BASE, latest_download: download },
    checkedAt: T_ANSWER,
  };
}

let current: ShellContextValue;

function shell(overrides: Partial<ShellContextValue>): ShellContextValue {
  return {
    health: HEALTH_UNKNOWN,
    attention: ATTENTION_LOADING,
    scores: { kind: "loading" },
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
    ...overrides,
  };
}

function depth(years: number | null) {
  vi.mocked(getHistoryDepth).mockResolvedValue({
    years,
    updatedAt: years === null ? null : "2026-09-06T18:00:00Z",
  });
}

function count(activeCount: number) {
  vi.mocked(listInstruments).mockResolvedValue({
    rows: [],
    activeCount,
    retiredCount: 0,
    nextCursor: null,
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Mounts `useSetupState` under one `SetupDraftProvider` that outlives the
 * hook's host, so `visit()` is "another visit" to the same session.
 */
async function mount() {
  const holder: { state: SetupState | null } = { state: null };
  const Probe: FunctionComponent = () => {
    holder.state = useSetupState();
    return null;
  };
  function tree(visible: boolean) {
    return createElement(SetupDraftProvider, null, visible ? createElement(Probe) : null);
  }
  const view = render(tree(true));
  await act(async () => {});
  return {
    get state(): SetupState {
      if (holder.state === null) {
        throw new Error("hook not mounted");
      }
      return holder.state;
    },
    rerender: () => view.rerender(tree(true)),
    async visit() {
      view.rerender(tree(false));
      view.rerender(tree(true));
      await act(async () => {});
    },
  };
}

beforeEach(() => {
  vi.mocked(getHistoryDepth).mockReset();
  vi.mocked(listInstruments).mockReset();
  vi.mocked(useShell).mockReset();
  current = shell({});
  vi.mocked(useShell).mockImplementation(() => current);
});

// Implements TC-COMP-098
describe("step done flags follow server facts; current is the first not done", () => {
  async function stepsFor(overrides: Partial<ShellContextValue>) {
    current = shell(overrides);
    const hook = await mount();
    return hook;
  }

  it("walks the four steps cumulatively", async () => {
    // Row 1: nothing answered.
    depth(null);
    count(0);
    let hook = await stepsFor({ health: HEALTH_UNKNOWN, attention: ATTENTION_LOADING });
    expect(hook.state.done).toEqual({ 1: false, 2: false, 3: false, 4: false });
    expect(hook.state.current).toBe(1);

    // Row 2: health resolved only.
    hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.done).toEqual({ 1: true, 2: false, 3: false, 4: false });
    expect(hook.state.current).toBe(2);

    // Row 3: add years.
    depth(5);
    hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.done).toEqual({ 1: true, 2: true, 3: false, 4: false });
    expect(hook.state.current).toBe(3);

    // Row 4: add followed stocks.
    count(12);
    hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.done).toEqual({ 1: true, 2: true, 3: true, 4: false });
    expect(hook.state.current).toBe(4);
  });

  it.each([
    "requested",
    "running",
    "cancelling",
    "succeeded",
    "partial",
    "failed",
    "cancelled",
    "abandoned",
  ] as const)("marks step 4 done once a download is %s", async (state) => {
    depth(5);
    count(12);
    const hook = await stepsFor({
      health: HEALTH_OK,
      attention: attentionOk(downloadIn(state)),
    });
    expect(hook.state.done).toEqual({ 1: true, 2: true, 3: true, 4: true });
    expect(hook.state.current).toBe(4);
  });

  it("leaves step 2 not done when the depth is null", async () => {
    depth(null);
    count(12);
    const hook = await stepsFor({
      health: HEALTH_OK,
      attention: attentionOk(downloadIn("running")),
    });
    expect(hook.state.done[2]).toBe(false);
    expect(hook.state.current).toBe(2);
  });

  it("takes the first step not done, not the step after the last done", async () => {
    depth(null);
    count(12);
    const hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.done[3]).toBe(true);
    expect(hook.state.current).toBe(2);
  });

  it("counts a single followed stock as step 3 done", async () => {
    depth(5);
    count(1);
    const hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.done[3]).toBe(true);
    expect(hook.state.current).toBe(4);
  });

  it("reads step 1 as done once health has answered, even when now unreachable", async () => {
    depth(null);
    count(0);
    let hook = await stepsFor({ health: HEALTH_UNREACHABLE_AFTER_ANSWER });
    expect(hook.state.done[1]).toBe(true);
    hook = await stepsFor({ health: HEALTH_UNREACHABLE_NEVER });
    expect(hook.state.done[1]).toBe(false);
  });

  it("keeps step 4 not done after Add later (AC-2)", async () => {
    depth(5);
    count(0);
    const hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    act(() => hook.state.goTo(4));
    expect(hook.state.current).toBe(4);
    expect(hook.state.done[4]).toBe(false);
    expect(hook.state.done[3]).toBe(false);
  });

  it("re-derives on every visit and drops the in-session goTo", async () => {
    depth(null);
    count(0);
    const hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.current).toBe(2);
    act(() => hook.state.goTo(1));
    expect(hook.state.current).toBe(1);
    act(() => hook.state.setDraft("pasted", "AAPL"));

    depth(10);
    await hook.visit();
    expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(listInstruments)).toHaveBeenCalledTimes(2);
    expect(hook.state.done[2]).toBe(true);
    expect(hook.state.current).toBe(3);
    expect(hook.state.drafts.pasted).toBe("AAPL");
  });

  it("lets a done step be revisited without touching done or drafts", async () => {
    depth(5);
    count(12);
    const hook = await stepsFor({ health: HEALTH_OK, attention: attentionOk(null) });
    expect(hook.state.current).toBe(4);
    const draftsBefore = hook.state.drafts;
    act(() => hook.state.goTo(2));
    expect(hook.state.current).toBe(2);
    expect(hook.state.done).toEqual({ 1: true, 2: true, 3: true, 4: false });
    expect(hook.state.drafts).toBe(draftsBefore);
  });
});

// Implements TC-COMP-106
describe("a failed depth read carries its error; step 4 is blocked at zero stocks", () => {
  it("carries a depth read's ApiError for the step to render, and no other step", async () => {
    const failure = new ApiError("History depth could not be read.", "req-1", {
      code: "internal_error",
    });
    vi.mocked(getHistoryDepth).mockRejectedValue(failure);
    count(3);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(hook.state.done[2]).toBe(false);
    expect(hook.state.current).toBe(2);
    expect(hook.state.depth).toEqual({ kind: "error", error: failure, last: null });
    expect(hook.state.depth.kind === "error" && hook.state.depth.error).toBe(failure);
    expect(hook.state.activeCount).toEqual({
      kind: "ok",
      data: 3,
      checkedAt: expect.any(Date),
    });
  });

  it("carries a transport failure the same way", async () => {
    const failure = new ApiUnreachableError("x");
    vi.mocked(getHistoryDepth).mockRejectedValue(failure);
    count(3);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(hook.state.depth.kind).toBe("error");
    expect(hook.state.depth.kind === "error" && hook.state.depth.error).toBe(failure);
  });

  it("blocks step 4 only while the followed count is a known 0", async () => {
    depth(5);
    count(0);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    let hook = await mount();
    act(() => hook.state.goTo(4));
    expect(hook.state.current).toBe(4);
    expect(hook.state.step4).toBe("blocked");

    count(1);
    hook = await mount();
    act(() => hook.state.goTo(4));
    expect(hook.state.step4).toBe("ready");
  });
});

describe("reads, re-reads and unknown facts", () => {
  it("makes exactly the two reads, with the exact query", async () => {
    depth(5);
    count(1);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    await mount();
    expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledWith();
    expect(vi.mocked(listInstruments)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(listInstruments)).toHaveBeenCalledWith({ lifecycle: "active", limit: 1 });
  });

  it("opens no interval", async () => {
    vi.useFakeTimers();
    try {
      depth(5);
      count(1);
      current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
      await mount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(600_000);
      });
      expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(listInstruments)).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reports loading while any of the four facts is pending, and not once all settled", async () => {
    const pendingDepth = deferred<{ years: number | null; updatedAt: string | null }>();
    vi.mocked(getHistoryDepth).mockReturnValue(pendingDepth.promise);
    count(1);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(hook.state.loading).toBe(true);
    await act(async () => pendingDepth.resolve({ years: 5, updatedAt: null }));
    expect(hook.state.loading).toBe(false);

    const pendingCount = deferred<Awaited<ReturnType<typeof listInstruments>>>();
    vi.mocked(getHistoryDepth).mockResolvedValue({ years: 5, updatedAt: null });
    vi.mocked(listInstruments).mockReturnValue(pendingCount.promise);
    const second = await mount();
    expect(second.state.loading).toBe(true);
    await act(async () =>
      pendingCount.resolve({ rows: [], activeCount: 1, retiredCount: 0, nextCursor: null }),
    );
    expect(second.state.loading).toBe(false);

    depth(5);
    count(1);
    current = shell({ health: HEALTH_OK, attention: ATTENTION_LOADING });
    expect((await mount()).state.loading).toBe(true);
    current = shell({ health: HEALTH_UNKNOWN, attention: attentionOk(null) });
    expect((await mount()).state.loading).toBe(true);

    // A read that settled as an error is settled.
    vi.mocked(getHistoryDepth).mockRejectedValue(new ApiUnreachableError("x"));
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    expect((await mount()).state.loading).toBe(false);
  });

  it("re-reads on Try again without touching the other read", async () => {
    const failure = new ApiError("History depth could not be read.", "req-1", {
      code: "internal_error",
    });
    vi.mocked(getHistoryDepth).mockRejectedValueOnce(failure);
    count(3);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(hook.state.depth.kind).toBe("error");

    vi.mocked(getHistoryDepth).mockResolvedValue({ years: 8, updatedAt: "2026-09-06T18:00:00Z" });
    await act(async () => hook.state.reread("depth"));
    expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(listInstruments)).toHaveBeenCalledTimes(1);
    expect(hook.state.depth).toEqual({
      kind: "ok",
      data: { years: 8, updatedAt: "2026-09-06T18:00:00Z" },
      checkedAt: expect.any(Date),
    });
    expect(hook.state.done[2]).toBe(true);
  });

  it("keeps the value while a re-read is in flight, then carries the last answer into the error", async () => {
    depth(5);
    count(3);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    const firstInstant = (hook.state.depth as Extract<ReadState<unknown>, { kind: "ok" }>)
      .checkedAt;

    const pending = deferred<{ years: number | null; updatedAt: string | null }>();
    vi.mocked(getHistoryDepth).mockReturnValue(pending.promise);
    act(() => hook.state.reread("depth"));
    expect(hook.state.depth.kind).toBe("ok");
    expect(hook.state.done[2]).toBe(true);

    const failure = new ApiError("History depth could not be read.", "req-2", {
      code: "internal_error",
    });
    await act(async () => pending.reject(failure));
    expect(hook.state.depth).toEqual({
      kind: "error",
      error: failure,
      last: {
        data: { years: 5, updatedAt: "2026-09-06T18:00:00Z" },
        checkedAt: firstInstant,
      },
    });
    expect(hook.state.done[2]).toBe(false);
  });

  it("treats a failed count as not done but does not block step 4", async () => {
    const failure = new ApiError("The followed list could not be read.", "req-3", {
      code: "internal_error",
    });
    depth(5);
    vi.mocked(listInstruments).mockRejectedValue(failure);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(hook.state.done[3]).toBe(false);
    expect(hook.state.current).toBe(3);
    expect(hook.state.activeCount.kind).toBe("error");
    expect(hook.state.step4).toBe("ready");

    await act(async () => hook.state.reread("activeCount"));
    expect(vi.mocked(listInstruments)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(listInstruments)).toHaveBeenLastCalledWith({ lifecycle: "active", limit: 1 });
    expect(vi.mocked(getHistoryDepth)).toHaveBeenCalledTimes(1);
  });

  it("keeps step 4 done through a failed attention poll that follows an answer", async () => {
    depth(5);
    count(3);
    const failure = new ApiError("Attention could not be read.", "req-4", {
      code: "internal_error",
    });

    current = shell({
      health: HEALTH_OK,
      attention: {
        kind: "error",
        error: failure,
        last: {
          data: { ...ATTENTION_BASE, latest_download: downloadIn("running") },
          checkedAt: T_ANSWER,
        },
      },
    });
    expect((await mount()).state.done[4]).toBe(true);

    current = shell({
      health: HEALTH_OK,
      attention: { kind: "error", error: failure, last: null },
    });
    expect((await mount()).state.done[4]).toBe(false);

    current = shell({ health: HEALTH_OK, attention: ATTENTION_LOADING });
    expect((await mount()).state.done[4]).toBe(false);
  });

  it("offers exactly the contracted members with stable callbacks", async () => {
    depth(5);
    count(3);
    current = shell({ health: HEALTH_OK, attention: attentionOk(null) });
    const hook = await mount();
    expect(Object.keys(hook.state).sort()).toEqual([
      "activeCount",
      "current",
      "depth",
      "done",
      "drafts",
      "goTo",
      "loading",
      "reread",
      "setDraft",
      "step4",
    ]);
    const { goTo, reread, setDraft } = hook.state;
    hook.rerender();
    hook.rerender();
    expect(hook.state.goTo).toBe(goTo);
    expect(hook.state.reread).toBe(reread);
    expect(hook.state.setDraft).toBe(setDraft);

    act(() => hook.state.setDraft("yearsText", "9"));
    expect(hook.state.drafts.yearsText).toBe("9");
  });
});
