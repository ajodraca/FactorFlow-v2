import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiUnreachableError, getHistoryDepth, listInstruments } from "../../api/client";
import type { HistoryDepth } from "../../api/types";
import { useShell } from "../../app/shell-context";
import type { LatestDownload, ReadState } from "../../app/shell-types";
import { type SetupDrafts, useSetupDrafts } from "./draft";

/*
 * The setup screen's step state (CAP-003-E4-S1; component design setup-ui
 * 2.2, 3, 5; DAC-E4-1, DAC-E4-S1-2, DAC-E4-13, AC-2, AC-21). Each step's done
 * flag is re-derived from its server fact on every mount, so going back or
 * leaving never shows a step as done that is not (DAC-E4-1). The screen opens
 * no interval: two reads on mount, and a re-read only when a step asks for
 * one (setup-ui 5).
 */

/** The four setup steps, by number (setup-ui 2.2). */
export type StepId = 1 | 2 | 3 | 4;

/**
 * What the setup steps read (setup-ui 2.2). The six members `current`, `done`,
 * `step4`, `drafts`, `goTo` and `setDraft` are the contract's; `depth`,
 * `activeCount`, `loading` and `reread` are additive (DEC-0342).
 */
export interface SetupState {
  /** The step to show: the first not done, unless `goTo` chose another this visit (DAC-E4-1). */
  current: StepId;
  /** Each step's done flag, from its server fact (DAC-E4-1, AC-2). */
  done: Record<StepId, boolean>;
  /** `blocked` while the followed count is a known 0, else `ready` (setup-ui 2.2; DEC-0344). */
  step4: "ready" | "blocked";
  /** The four drafts, passed through from the provider (AC-3). */
  drafts: SetupDrafts;
  /** Shows one step for this visit; touches no draft and no done flag (AC-3). */
  goTo(step: StepId): void;
  /** Changes one draft (AC-3). */
  setDraft: ReturnType<typeof useSetupDrafts>["setDraft"];
  /** The history-depth read, for step 2's error and summary (DAC-E4-S1-2; DEC-0342). */
  depth: ReadState<HistoryDepth>;
  /** The followed count, `listInstruments(...).activeCount` (DEC-0342). */
  activeCount: ReadState<number>;
  /** True while any of the four facts is still being asked (DEC-0342, DEC-0344). */
  loading: boolean;
  /** Asks one fact again, for Try again and for a step that has just saved (DAC-E4-13; DEC-0342). */
  reread(fact: "depth" | "activeCount"): void;
}

const STEPS: readonly StepId[] = [1, 2, 3, 4];

const loadDepth = (): Promise<HistoryDepth> => getHistoryDepth();

/** Asks for one active stock: the response's `active_count` is the whole followed count. */
const loadActiveCount = async (): Promise<number> =>
  (await listInstruments({ lifecycle: "active", limit: 1 })).activeCount;

/** The previous answer a failed read keeps beside its error (owner-shell 2.3 `ReadState`). */
function lastOf<T>(previous: ReadState<T>): { data: T; checkedAt: Date } | null {
  if (previous.kind === "ok") {
    return { data: previous.data, checkedAt: previous.checkedAt };
  }
  return previous.kind === "error" ? previous.last : null;
}

/**
 * One read as a `ReadState`. A re-read does not reset the state to `loading`,
 * so a step's done flag holds until the new answer settles (DEC-0342). Answers
 * that arrive after unmount are dropped.
 */
function useRead<T>(load: () => Promise<T>): { state: ReadState<T>; reread(): void } {
  const [state, setState] = useState<ReadState<T>>({ kind: "loading" });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reread = useCallback((): void => {
    load().then(
      (data) => {
        if (mounted.current) {
          setState({ kind: "ok", data, checkedAt: new Date() });
        }
      },
      (error: unknown) => {
        if (!(error instanceof ApiError || error instanceof ApiUnreachableError)) {
          throw error;
        }
        if (mounted.current) {
          setState((previous) => ({ kind: "error", error, last: lastOf(previous) }));
        }
      },
    );
  }, [load]);

  return { state, reread };
}

/** Derives the setup steps from the shell's facts and two reads made on mount. */
export function useSetupState(): SetupState {
  const { health, attention } = useShell();
  const { drafts, setDraft } = useSetupDrafts();
  const { state: depth, reread: rereadDepth } = useRead(loadDepth);
  const { state: activeCount, reread: rereadActiveCount } = useRead(loadActiveCount);
  const [override, setOverride] = useState<StepId | null>(null);

  useEffect(() => {
    rereadDepth();
    rereadActiveCount();
  }, [rereadDepth, rereadActiveCount]);

  const reread = useCallback(
    (fact: "depth" | "activeCount"): void => {
      if (fact === "depth") {
        rereadDepth();
      } else {
        rereadActiveCount();
      }
    },
    [rereadDepth, rereadActiveCount],
  );

  // A download that existed does not stop existing because one poll failed (DEC-0344).
  let latest: LatestDownload | null = null;
  if (attention.kind === "ok") {
    latest = attention.data.latest_download;
  } else if (attention.kind === "error") {
    latest = attention.last?.data.latest_download ?? null;
  }

  const done: Record<StepId, boolean> = {
    // UX design 1.2: done once health has answered, and an outage after an answer keeps it.
    1: health.lastAnsweredAt !== null,
    // DAC-E4-1: the depth is set.
    2: depth.kind === "ok" && depth.data.years !== null,
    // DAC-E4-1: at least one followed stock.
    3: activeCount.kind === "ok" && activeCount.data > 0,
    // AC-2: a download has been requested, in any state.
    4: latest !== null,
  };

  // DAC-E4-1: the first step not done; DEC-0343: step 4 when all four are.
  const derived = STEPS.find((step) => !done[step]) ?? 4;
  const current = override ?? derived;

  // setup-ui 2.2: blocked while the count is a known 0; an unknown count does not block (DEC-0344).
  const step4 = activeCount.kind === "ok" && activeCount.data === 0 ? "blocked" : "ready";

  const loading =
    health.liveness === "unknown" ||
    depth.kind === "loading" ||
    activeCount.kind === "loading" ||
    attention.kind === "loading";

  // The override lives here, not in the provider, so it ends with the visit (setup-ui 2.2).
  const goTo = useCallback((step: StepId): void => setOverride(step), []);

  return { current, done, step4, drafts, goTo, setDraft, depth, activeCount, loading, reread };
}
