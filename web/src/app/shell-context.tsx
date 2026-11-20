import {
  type JSX,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RunState } from "../api/types";
import { type HealthState, useHealth, useHealthRefresh } from "./health";
import { fetchAttention, fetchScoreSummary } from "./shell-client";
import type { Attention, ReadState, ScoreState, ScoreSummary } from "./shell-types";
import { usePolledRead } from "./use-polled-read";

/*
 * The one context every screen reads the shell's shared reads through
 * (component design owner-shell 2.3, 2.4; CAP-003-E3-S3). Three intervals
 * serve the whole interface and none is opened per screen (epic NFR
 * *Cadences*): health's 30 s poll belongs to `health.tsx`, and the two reads
 * below run on `usePolledRead`, which owns the scheduling, the hidden-page
 * pause and the no-overlap rule (DAC-E3-5). Nothing here sets a timer.
 */

/** Attention and summary while nothing is running (owner-shell 2.4; DAC-E3-S3-1). */
const IDLE_INTERVAL_MS = 60_000;

/**
 * Attention and summary while a download is not terminal or the scores are
 * building (owner-shell 2.4; epic NFR *Cadences*; system design constraint 8).
 */
const ACTIVE_INTERVAL_MS = 10_000;

/** The download states that are not outcomes (`web/src/api/types.ts`). */
const NON_TERMINAL: ReadonlySet<RunState | undefined> = new Set<RunState>([
  "requested",
  "running",
  "cancelling",
]);

type NotServed = Extract<ScoreState, { kind: "not_served" }>;
type SummaryAnswer = ScoreSummary | NotServed;

/**
 * What the shell offers a screen (owner-shell 2.3; DAC-E3-18). `health` is
 * the delivered health state, passed through, so `credential_present` stays
 * the boolean it is and no member holds a credential value (DAC-E3-S3-4,
 * AC-4).
 */
export interface ShellContextValue {
  /** The health poll's state, with the instant of the last answer (AC-23). */
  health: HealthState;
  /** `GET /api/attention`, polled (AC-16, AC-25). */
  attention: ReadState<Attention>;
  /** The score summary, polled; `not_served` until its route is deployed (DAC-E3-6). */
  scores: ScoreState;
  /** Re-reads one kind at once and keeps its cadence (DAC-E3-S3-2). */
  refresh(kind: "health" | "attention" | "scores"): void;
  /** Sets the top-bar crumb's detail text, or clears it with `null` (DAC-E3-S3-3). */
  setTitleDetail(text: string | null): void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/**
 * The held title detail, in a context of its own so a crumb change does not
 * re-render every `useShell()` consumer, and so `ShellContextValue` keeps
 * exactly the five members DAC-E3-18 names (DEC-0323).
 */
const TitleDetailContext = createContext<string | null>(null);

/**
 * True while the download is not terminal or the scores are building: the
 * joint condition for the 10 s cadence (owner-shell 2.4; DAC-E3-S3-1).
 */
function active(attention: Attention | null, scores: SummaryAnswer | null): boolean {
  if (NON_TERMINAL.has(attention?.latest_download?.state)) {
    return true;
  }
  return scores !== null && !("kind" in scores) && scores.later?.state === "building";
}

/**
 * Polls attention and the score summary once for the whole interface and
 * supplies them, with health and the title detail, to every screen beneath
 * it. It never reads `GET /api/data-health` (AC-28; DAC-E3-19).
 */
export function ShellProvider({ children }: { children: ReactNode }): JSX.Element {
  // Each read's last success, set before `usePolledRead` computes the next
  // delay, so neither interval depends on React's render timing.
  const attentionLast = useRef<Attention | null>(null);
  const scoresLast = useRef<SummaryAnswer | null>(null);

  const attentionRead = useCallback(async (): Promise<Attention> => {
    const answered = await fetchAttention();
    attentionLast.current = answered;
    return answered;
  }, []);
  const scoresRead = useCallback(async (): Promise<SummaryAnswer> => {
    const answered = await fetchScoreSummary();
    scoresLast.current = answered;
    return answered;
  }, []);

  const attentionPoll = usePolledRead<Attention>(attentionRead, (last) =>
    active(last, scoresLast.current) ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS,
  );
  const scoresPoll = usePolledRead<SummaryAnswer>(scoresRead, (last) =>
    // A not-served summary has no `later` to build and a download does not
    // deploy its route: it is re-read on the 60 s cadence (DAC-E3-6).
    last !== null && "kind" in last
      ? IDLE_INTERVAL_MS
      : active(attentionLast.current, last)
        ? ACTIVE_INTERVAL_MS
        : IDLE_INTERVAL_MS,
  );

  const health = useHealth();
  const healthRefresh = useHealthRefresh();
  const attentionRefresh = attentionPoll.refresh;
  const scoresRefresh = scoresPoll.refresh;

  // The summary route answers 404 until it is deployed: that is `not_served`,
  // not an error (DAC-E3-6). A last success that was not served is not a
  // `ScoreSummary`, so it maps to `null`.
  const scoresState = scoresPoll.state;
  const scores = useMemo<ScoreState>(() => {
    if (scoresState.kind === "loading") {
      return { kind: "loading" };
    }
    if (scoresState.kind === "ok") {
      const { data, checkedAt } = scoresState;
      return "kind" in data ? { kind: "not_served" } : { kind: "served", data, checkedAt };
    }
    const lastData = scoresState.last?.data ?? null;
    return {
      kind: "error",
      error: scoresState.error,
      last: lastData !== null && !("kind" in lastData) ? lastData : null,
    };
  }, [scoresState]);

  const refresh = useCallback(
    (kind: "health" | "attention" | "scores"): void => {
      if (kind === "attention") {
        attentionRefresh();
      } else if (kind === "scores") {
        scoresRefresh();
      } else {
        healthRefresh();
      }
    },
    [attentionRefresh, scoresRefresh, healthRefresh],
  );

  const [detail, setDetail] = useState<string | null>(null);
  const setTitleDetail = useCallback((text: string | null): void => setDetail(text), []);

  const attention = attentionPoll.state;
  const value = useMemo<ShellContextValue>(
    () => ({ health, attention, scores, refresh, setTitleDetail }),
    [health, attention, scores, refresh, setTitleDetail],
  );

  return (
    <ShellContext.Provider value={value}>
      <TitleDetailContext.Provider value={detail}>{children}</TitleDetailContext.Provider>
    </ShellContext.Provider>
  );
}

/**
 * The shell's shared reads. Throws outside a `ShellProvider`: a per-consumer
 * fallback poll would open intervals per screen, which the epic NFR forbids,
 * and a frozen default would leave a screen loading with no sign why
 * (DEC-0326).
 */
export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (value === null) {
    throw new Error("useShell() must be called inside <ShellProvider>");
  }
  return value;
}

/** The crumb detail a screen set, or `null` until one is set (DEC-0214, DEC-0323). */
export function useTitleDetail(): string | null {
  return useContext(TitleDetailContext);
}
