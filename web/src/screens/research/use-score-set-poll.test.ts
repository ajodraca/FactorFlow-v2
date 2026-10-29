import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getClassificationSummary } from "../../api/classification-client";
import type { ClassificationSummary, CurrentSet, LaterSet } from "../../api/classification-types";
import type { RunState } from "../../api/types";
import { type HealthState, useHealth } from "../../app/status-region";
import { SCORE_SET } from "./copy";
import { formatTimestamp } from "./format";
import { POLL_INTERVAL_MS, useScoreSetPoll } from "./use-score-set-poll";

vi.mock("../../api/classification-client", () => ({ getClassificationSummary: vi.fn() }));
vi.mock("../../app/status-region", () => ({ useHealth: vi.fn() }));

const readMock = vi.mocked(getClassificationSummary);
const healthMock = vi.mocked(useHealth);

const SECOND = 1_000;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const FACTORS: ClassificationSummary["factors"] = {
  value: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
  growth: { qualifiedCount: 118, ranked: true, minPeerSetSize: 30 },
  momentum: { qualifiedCount: 120, ranked: true, minPeerSetSize: 30 },
};

function set(setId: string, endedAt: string, runStartedAt: string): CurrentSet {
  return {
    setId,
    classificationDate: endedAt.slice(0, 10),
    runId: `run-of-${setId}`,
    runStartedAt,
    runOutcome: "succeeded",
    state: "complete",
    startedAt: runStartedAt,
    endedAt,
    latestTradingDay: endedAt.slice(0, 10),
    activeInstruments: 120,
    notCurrent: false,
  };
}

const SET_A = set("A", "2026-10-15T22:46:00Z", "2026-10-15T22:30:00Z");
const SET_B = set("B", "2026-10-16T22:48:00Z", "2026-10-16T22:30:00Z");
const SET_C = set("C", "2026-10-17T22:47:00Z", "2026-10-17T22:30:00Z");

const BUILDING: LaterSet = {
  setId: "B",
  state: "building",
  startedAt: "2026-10-16T22:40:00Z",
  endedAt: null,
  failureReason: null,
  runId: "run-of-B",
  runStartedAt: "2026-10-16T22:30:00Z",
};

const FAILED: LaterSet = {
  ...BUILDING,
  state: "failed",
  endedAt: "2026-10-16T22:43:00Z",
  failureReason: "Factor engine could not read prices",
};

function summary(current: CurrentSet | null, later: LaterSet | null): ClassificationSummary {
  return {
    neverClassified: current === null,
    set: current,
    later,
    factors: FACTORS,
    stocksCurrent: current === null ? null : { currentCount: 100, followedCount: 120 },
  };
}

const A_DONE = summary(SET_A, null);
const A_BUILDING = summary(SET_A, { ...BUILDING, setId: "B" });
const B_DONE = summary(SET_B, null);
const C_DONE = summary(SET_C, null);
const NEVER_BUILDING = summary(null, { ...BUILDING, setId: "A" });
const NEVER_FAILED = summary(null, { ...FAILED, setId: "A" });
const NEVER_NOTHING = summary(null, null);

function health(state: RunState | null): HealthState {
  return {
    liveness: "answering",
    health: {
      status: "ok",
      database: "reachable",
      credential_present: true,
      schema_version: 4,
      most_recent_run:
        state === null ? null : { run_id: "run-latest", state, ended_at: "2026-10-16T22:35:00Z" },
    },
    lastUpdated: new Date(),
  };
}

const TERMINAL: RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];
const NON_TERMINAL: RunState[] = ["requested", "running", "cancelling"];

async function tick(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

/** Mounts the hook and settles the mount read. */
async function mount(onNewSet = vi.fn(), options: { strict?: boolean } = {}) {
  const hook = renderHook(
    ({ callback }: { callback: (next: ClassificationSummary) => void }) =>
      useScoreSetPoll({ onNewSet: callback }),
    { initialProps: { callback: onNewSet }, wrapper: options.strict ? StrictMode : undefined },
  );
  await tick(0);
  return { ...hook, onNewSet };
}

beforeEach(() => {
  readMock.mockReset();
  healthMock.mockReset();
  healthMock.mockReturnValue(health("succeeded"));
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-10-16T22:50:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TC-COMP-177: a new complete set triggers exactly one announcement and one reload (DAC-E4-S4-5)", () => {
  // Implements TC-COMP-177
  it("announces B once and calls onNewSet once with B's summary, never again for the same set", async () => {
    readMock.mockResolvedValueOnce(A_BUILDING).mockResolvedValue(B_DONE);
    const { result, onNewSet } = await mount();
    expect(result.current.summary).toBe(A_BUILDING);
    expect(result.current.announcement).toBeNull();
    expect(onNewSet).not.toHaveBeenCalled();

    await tick(POLL_INTERVAL_MS);
    const expected = SCORE_SET.scoresUpdatedTo(
      formatTimestamp(SET_B.endedAt),
      formatTimestamp(SET_B.runStartedAt),
    );
    expect(result.current.announcement).toBe(expected);
    expect(result.current.announcement).toBe(
      "Scores updated to 2026-10-16 17:48 CDT from the download started 2026-10-16 17:30 CDT",
    );
    expect(onNewSet).toHaveBeenCalledTimes(1);
    expect(onNewSet).toHaveBeenCalledWith(B_DONE);
    expect(result.current.summary).toBe(B_DONE);

    const callsAfterB = readMock.mock.calls.length;
    await tick(60 * SECOND);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    expect(result.current.announcement).toBe(expected);
    // B with later null and a terminal download: polling stopped, so B is never re-read.
    expect(readMock).toHaveBeenCalledTimes(callsAfterB);
  });

  // Implements TC-COMP-177
  it("never re-fires when a poll returns the same set again", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock.mockResolvedValueOnce(A_BUILDING).mockResolvedValue(B_DONE);
    const { result, onNewSet } = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    const callsAfterB = readMock.mock.calls.length;

    await tick(3 * POLL_INTERVAL_MS);
    expect(readMock.mock.calls.length).toBeGreaterThan(callsAfterB);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    expect(result.current.announcement).toBe(
      SCORE_SET.scoresUpdatedTo(
        formatTimestamp(SET_B.endedAt),
        formatTimestamp(SET_B.runStartedAt),
      ),
    );
  });

  // Implements TC-COMP-177
  it("fires only for a set: a read with no set after one with a set neither fires nor fails", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock.mockResolvedValueOnce(A_BUILDING).mockResolvedValue(NEVER_BUILDING);
    const { result, onNewSet } = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(result.current.summary).toBe(NEVER_BUILDING);
    expect(result.current.pollFailed).toBe(false);
    expect(onNewSet).not.toHaveBeenCalled();
    expect(result.current.announcement).toBeNull();
  });

  // Implements TC-COMP-177
  it("fires a second, separate announcement and call for a later set C (one per new set, DEC-0153)", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock
      .mockResolvedValueOnce(A_BUILDING)
      .mockResolvedValueOnce(B_DONE)
      .mockResolvedValueOnce(B_DONE)
      .mockResolvedValue(C_DONE);
    const { result, onNewSet } = await mount();
    await tick(3 * POLL_INTERVAL_MS);
    expect(onNewSet).toHaveBeenCalledTimes(2);
    expect(onNewSet).toHaveBeenNthCalledWith(1, B_DONE);
    expect(onNewSet).toHaveBeenNthCalledWith(2, C_DONE);
    expect(result.current.announcement).toBe(
      SCORE_SET.scoresUpdatedTo(
        formatTimestamp(SET_C.endedAt),
        formatTimestamp(SET_C.runStartedAt),
      ),
    );
  });
});

describe("TC-COMP-184: a never-populated store polls from first load (DAC-E4-S4-6)", () => {
  // Implements TC-COMP-184
  it("reads on mount, keeps polling while the first set builds, and hands the first completion to the host", async () => {
    readMock.mockResolvedValue(NEVER_BUILDING);
    const onNewSet = vi.fn();
    const hook = renderHook(() => useScoreSetPoll({ onNewSet }));
    expect(readMock).toHaveBeenCalledTimes(1);
    await tick(0);
    expect(hook.result.current.summary).toBe(NEVER_BUILDING);
    expect(hook.result.current.summary?.set).toBeNull();

    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(onNewSet).not.toHaveBeenCalled();

    const firstSet = summary(SET_A, null);
    readMock.mockResolvedValue(firstSet);
    await tick(POLL_INTERVAL_MS);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    expect(onNewSet).toHaveBeenCalledWith(firstSet);
    expect(hook.result.current.announcement).toBe(
      SCORE_SET.scoresUpdatedTo(
        formatTimestamp(SET_A.endedAt),
        formatTimestamp(SET_A.runStartedAt),
      ),
    );
    expect(hook.result.current.summary?.set).not.toBeNull();
    expect(hook.result.current.summary).toBe(firstSet);
  });

  // Implements TC-COMP-184
  it("reads once and stops when the first set failed and the download is terminal, keeping the reason", async () => {
    readMock.mockResolvedValue(NEVER_FAILED);
    const { result } = await mount();
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(result.current.summary?.later?.failureReason).toBe(
      "Factor engine could not read prices",
    );
    expect(result.current.summary?.set).toBeNull();
  });

  // Implements TC-COMP-184
  it("keeps polling an empty store while the download runs, and stops once health reports it ended", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock.mockResolvedValue(NEVER_NOTHING);
    const hook = await mount();
    await tick(2 * POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);

    healthMock.mockReturnValue(health("succeeded"));
    hook.rerender({ callback: hook.onNewSet });
    // Exactly one further read follows the terminal report (T006; DEC-0233), then the stop.
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(4);
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(4);
  });
});

describe("classification-ui 2.6 handoff: health reports the download ended before a read has seen the claim (AC-20, DAC-E4-2, DAC-E4-4, DAC-E4-S4-6; DEC-0233)", () => {
  it("reads once more after the terminal report, sees the building set, keeps polling, and hands the completion over once", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock.mockResolvedValue(A_DONE);
    const hook = await mount();
    await tick(2 * POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(hook.result.current.summary?.later).toBeNull();

    // The scheduler claims the set and the shell's health reports the download
    // terminal before any read has seen the claim.
    readMock.mockResolvedValue(A_BUILDING);
    healthMock.mockReturnValue(health("succeeded"));
    hook.rerender({ callback: hook.onNewSet });
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(4);
    // The banner's input: the previous set with the building later block.
    expect(hook.result.current.summary).toBe(A_BUILDING);
    expect(hook.result.current.summary?.set?.setId).toBe("A");
    expect(hook.result.current.summary?.later?.state).toBe("building");
    expect(hook.onNewSet).not.toHaveBeenCalled();
    expect(hook.result.current.announcement).toBeNull();

    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(5);

    readMock.mockResolvedValue(B_DONE);
    await tick(POLL_INTERVAL_MS);
    expect(hook.onNewSet).toHaveBeenCalledTimes(1);
    expect(hook.onNewSet).toHaveBeenCalledWith(B_DONE);
    expect(hook.result.current.announcement).toBe(
      SCORE_SET.scoresUpdatedTo(
        formatTimestamp(SET_B.endedAt),
        formatTimestamp(SET_B.runStartedAt),
      ),
    );
    expect(hook.result.current.summary).toBe(B_DONE);

    const settled = readMock.mock.calls.length;
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(settled);
    expect(hook.onNewSet).toHaveBeenCalledTimes(1);
  });

  it("carries a never-populated store through the same handoff to its first set", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock.mockResolvedValue(NEVER_NOTHING);
    const hook = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);

    readMock.mockResolvedValue(NEVER_BUILDING);
    healthMock.mockReturnValue(health("succeeded"));
    hook.rerender({ callback: hook.onNewSet });
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(hook.result.current.summary).toBe(NEVER_BUILDING);
    expect(hook.result.current.summary?.set).toBeNull();
    expect(hook.result.current.summary?.later?.state).toBe("building");
    expect(hook.onNewSet).not.toHaveBeenCalled();

    const firstSet = summary(SET_A, null);
    readMock.mockResolvedValue(firstSet);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(4);
    expect(hook.onNewSet).toHaveBeenCalledTimes(1);
    expect(hook.onNewSet).toHaveBeenCalledWith(firstSet);
    expect(hook.result.current.summary).toBe(firstSet);

    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(4);
    expect(hook.onNewSet).toHaveBeenCalledTimes(1);
  });

  it("still owes the further read when the read in flight at the terminal report was issued while the download ran", async () => {
    healthMock.mockReturnValue(health("running"));
    let resolveSlow: (value: ClassificationSummary) => void = () => undefined;
    readMock.mockResolvedValueOnce(A_DONE).mockReturnValueOnce(
      new Promise<ClassificationSummary>((resolve) => {
        resolveSlow = resolve;
      }),
    );
    const hook = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);

    // The download ends while that read is still in flight.
    healthMock.mockReturnValue(health("succeeded"));
    hook.rerender({ callback: hook.onNewSet });
    readMock.mockResolvedValue(A_DONE);
    await act(async () => {
      resolveSlow(A_DONE);
    });
    expect(readMock).toHaveBeenCalledTimes(2);

    // A read issued while the download ran cannot have seen its end: one more follows.
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(3);
  });

  it("owes no further read when health was terminal before the mount read", async () => {
    readMock.mockResolvedValue(A_DONE);
    await mount();
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(1);
  });
});

describe("hook behaviour: cadence, stop, checkedAt, failure, unmount, StrictMode, overlap, seams (AC-20, AC-22, DAC-E4-4, DAC-E4-S4-4 to DAC-E4-S4-6)", () => {
  it("(a) reads at 0, 10 and 20 seconds while a later set builds, and not at 9", async () => {
    readMock.mockResolvedValue(A_BUILDING);
    await mount();
    expect(readMock).toHaveBeenCalledTimes(1);
    await tick(9 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(1);
    await tick(SECOND);
    expect(readMock).toHaveBeenCalledTimes(2);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(POLL_INTERVAL_MS).toBe(10_000);
  });

  it.each([null, ...TERMINAL])(
    "(b) stops after the mount read with later null and most_recent_run %s",
    async (state) => {
      healthMock.mockReturnValue(health(state));
      readMock.mockResolvedValue(B_DONE);
      await mount();
      await tick(5 * 60 * SECOND);
      expect(readMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(NON_TERMINAL)(
    "(b) keeps polling with later null while the download is %s",
    async (state) => {
      healthMock.mockReturnValue(health(state));
      readMock.mockResolvedValue(B_DONE);
      await mount();
      await tick(3 * POLL_INTERVAL_MS);
      expect(readMock).toHaveBeenCalledTimes(4);
    },
  );

  it("(b) resumes polling when a new download starts after the hook has stopped", async () => {
    readMock.mockResolvedValue(B_DONE);
    const hook = await mount();
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(1);

    healthMock.mockReturnValue(health("requested"));
    hook.rerender({ callback: hook.onNewSet });
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
  });

  it("(c) returns checkedAt as null, then the ISO instant of each successful read, advancing", async () => {
    let resolveFirst: (value: ClassificationSummary) => void = () => undefined;
    readMock.mockReturnValueOnce(
      new Promise<ClassificationSummary>((resolve) => {
        resolveFirst = resolve;
      }),
    );
    readMock.mockResolvedValue(A_BUILDING);
    const { result } = renderHook(() => useScoreSetPoll({ onNewSet: vi.fn() }));
    expect(result.current.checkedAt).toBeNull();
    expect(result.current.pollFailed).toBe(false);
    expect(result.current.summary).toBeNull();

    await act(async () => {
      resolveFirst(A_BUILDING);
    });
    const first = result.current.checkedAt;
    expect(typeof first).toBe("string");
    expect(first).toMatch(ISO_INSTANT);
    // Bounded, not exact: shouldAdvanceTime moves the fake clock with real elapsed time.
    const start = Date.parse("2026-10-16T22:50:00Z");
    expect(Date.parse(first as string)).toBeGreaterThanOrEqual(start);
    expect(Date.parse(first as string)).toBeLessThan(start + SECOND);

    await tick(POLL_INTERVAL_MS);
    const second = result.current.checkedAt;
    expect(second).toMatch(ISO_INSTANT);
    expect(Date.parse(second as string)).toBeGreaterThan(Date.parse(first as string));
  });

  it("(d) a rejected read sets pollFailed, keeps the summary and checkedAt, and stops the timer", async () => {
    readMock.mockResolvedValueOnce(A_BUILDING).mockRejectedValue(new Error("boom"));
    const { result, onNewSet } = await mount();
    const checkedAt = result.current.checkedAt;
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);
    expect(result.current.pollFailed).toBe(true);
    expect(result.current.summary).toBe(A_BUILDING);
    expect(result.current.checkedAt).toBe(checkedAt);
    expect(onNewSet).not.toHaveBeenCalled();

    await tick(30 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(2);
  });

  it("(d) tryAgain performs exactly one read, clears pollFailed on success and resumes the cadence", async () => {
    readMock.mockResolvedValueOnce(A_BUILDING).mockRejectedValueOnce(new Error("boom"));
    const { result } = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(result.current.pollFailed).toBe(true);

    readMock.mockResolvedValue(A_BUILDING);
    await act(async () => {
      await result.current.tryAgain();
    });
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(result.current.pollFailed).toBe(false);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(4);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(5);
  });

  it("(d) a rejected tryAgain keeps pollFailed and performs no further read", async () => {
    readMock.mockResolvedValueOnce(A_BUILDING).mockRejectedValue(new Error("boom"));
    const { result } = await mount();
    await tick(POLL_INTERVAL_MS);
    await act(async () => {
      await result.current.tryAgain();
    });
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(result.current.pollFailed).toBe(true);
    await tick(30 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(3);
  });

  it("(d) a rejected first read leaves summary null, checkedAt null and pollFailed true", async () => {
    readMock.mockRejectedValue(new Error("boom"));
    const { result } = await mount();
    expect(result.current.summary).toBeNull();
    expect(result.current.checkedAt).toBeNull();
    expect(result.current.pollFailed).toBe(true);
    expect(result.current.announcement).toBeNull();
  });

  it("(d) the stop does not depend on set: a never-populated store stops too, and Try again carries the first completion", async () => {
    readMock.mockResolvedValueOnce(NEVER_BUILDING).mockRejectedValueOnce(new Error("boom"));
    const { result, onNewSet } = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(result.current.pollFailed).toBe(true);
    expect(result.current.summary).toBe(NEVER_BUILDING);
    await tick(30 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(2);

    const firstSet = summary(SET_A, null);
    readMock.mockResolvedValue(firstSet);
    await act(async () => {
      await result.current.tryAgain();
    });
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(result.current.pollFailed).toBe(false);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    expect(onNewSet).toHaveBeenCalledWith(firstSet);
    expect(result.current.summary).toBe(firstSet);
  });

  it("(e) unmount clears the timer, and an in-flight read resolving afterwards changes nothing", async () => {
    readMock.mockResolvedValue(A_BUILDING);
    const { result, unmount, onNewSet } = await mount();
    let resolveLate: (value: ClassificationSummary) => void = () => undefined;
    readMock.mockReturnValueOnce(
      new Promise<ClassificationSummary>((resolve) => {
        resolveLate = resolve;
      }),
    );
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);
    const before = result.current;
    unmount();
    await act(async () => {
      resolveLate(B_DONE);
    });
    expect(onNewSet).not.toHaveBeenCalled();
    expect(result.current).toBe(before);
    await tick(60 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(2);
  });

  it("(f) a StrictMode double mount calls onNewSet once and leaves one interval", async () => {
    readMock.mockResolvedValueOnce(A_BUILDING).mockResolvedValue(B_DONE);
    healthMock.mockReturnValue(health("running"));
    const { onNewSet } = await mount(vi.fn(), { strict: true });
    await tick(3 * POLL_INTERVAL_MS);
    expect(onNewSet).toHaveBeenCalledTimes(1);
    // One read on mount and one per 10-second tick: a second interval would double the ticks.
    expect(readMock).toHaveBeenCalledTimes(4);
  });

  it("(g) a read slower than the cadence is not overlapped by the next tick", async () => {
    let resolveSlow: (value: ClassificationSummary) => void = () => undefined;
    readMock.mockResolvedValueOnce(A_BUILDING).mockReturnValueOnce(
      new Promise<ClassificationSummary>((resolve) => {
        resolveSlow = resolve;
      }),
    );
    const { result } = await mount();
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);
    await tick(2 * POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(2);

    readMock.mockResolvedValue(A_BUILDING);
    await act(async () => {
      resolveSlow(A_BUILDING);
    });
    expect(result.current.summary).toBe(A_BUILDING);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
  });

  it("(h) reads health from the shell's useHealth and issues no fetch of its own", async () => {
    readMock.mockResolvedValue(A_BUILDING);
    await mount();
    await tick(2 * POLL_INTERVAL_MS);
    expect(healthMock).toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("(h) reads onNewSet from the latest render without restarting the cadence", async () => {
    healthMock.mockReturnValue(health("running"));
    readMock
      .mockResolvedValueOnce(A_BUILDING)
      .mockResolvedValueOnce(A_BUILDING)
      .mockResolvedValue(B_DONE);
    const first = vi.fn();
    const hook = await mount(first);
    await tick(5 * SECOND);
    const latest = vi.fn();
    hook.rerender({ callback: latest });
    await tick(5 * SECOND);
    expect(readMock).toHaveBeenCalledTimes(2);
    await tick(POLL_INTERVAL_MS);
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
    expect(latest).toHaveBeenCalledWith(B_DONE);
  });
});
