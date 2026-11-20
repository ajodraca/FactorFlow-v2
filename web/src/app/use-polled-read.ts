import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiUnreachableError } from "../api/client";
import type { ReadState } from "./shell-types";

/*
 * The shell's polling rules, in one place (component design owner-shell 2.4;
 * DAC-E3-5). `startPolling` is the plain scheduler; `usePolledRead` wraps it
 * for a screen's read, and `health.tsx` wraps it for the health poll, so both
 * get the same visibility rule from the same code and no screen opens an
 * interval of its own.
 */

/** What one read settled as. */
export type PollOutcome<T> = { ok: true; data: T } | { ok: false; error: unknown };

/**
 * Owner-shell's internal scheduler, shared by `usePolledRead` and
 * `health.tsx`. Plain code, no React.
 *
 * It reads once at once (read on mount), then schedules each next read with a
 * `setTimeout` whose delay comes from `nextDelayMs`, asked after `onSettled`
 * has seen the answer so the delay can follow it. The timer is cleared while
 * the page is hidden and a read starts at once when it is visible again
 * (DAC-E3-S2-1). A read never starts while one is in flight, so a refresh,
 * a visibility change and an elapsed interval cannot overlap (TC-COMP-069).
 */
export function startPolling<T>(
  read: () => Promise<T>,
  nextDelayMs: () => number,
  onSettled: (outcome: PollOutcome<T>) => void,
): { refresh(): void; stop(): void } {
  let inFlight = false;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = async (): Promise<void> => {
    if (stopped || inFlight) {
      return;
    }
    clearTimeout(timer);
    inFlight = true;
    try {
      let outcome: PollOutcome<T>;
      try {
        outcome = { ok: true, data: await read() };
      } catch (error) {
        outcome = { ok: false, error };
      }
      if (!stopped) {
        onSettled(outcome);
      }
    } finally {
      inFlight = false;
      // The next read is scheduled even when `onSettled` threw, so a
      // programming error surfaces without ending the poll.
      if (!stopped && document.visibilityState !== "hidden") {
        timer = setTimeout(() => {
          void run();
        }, nextDelayMs());
      }
    }
  };

  const onVisibility = (): void => {
    if (document.visibilityState === "hidden") {
      clearTimeout(timer);
      timer = undefined;
    } else {
      void run();
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  void run();

  return {
    refresh: () => {
      void run();
    },
    stop: () => {
      stopped = true;
      clearTimeout(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/**
 * One polled read of the shell (owner-shell 2.4): reads on mount, then after
 * the interval the last answer implies, pauses while the page is hidden and
 * never overlaps two reads of one kind (DAC-E3-5, DAC-E3-S2-1).
 *
 * Every answer carries `checkedAt`, the instant it arrived (AC-25). A failed
 * read keeps the previous value in `error.last` (DAC-E3-S2-2, TC-COMP-070).
 * `intervalMs` is given the last successful answer, or `null` before one.
 */
export function usePolledRead<T>(
  read: () => Promise<T>,
  intervalMs: (last: T | null) => number,
): { state: ReadState<T>; refresh(): void } {
  const [state, setState] = useState<ReadState<T>>({ kind: "loading" });
  // Held in refs so a closure that changes on re-render applies from the next
  // read on and never restarts the poll.
  const readRef = useRef(read);
  const intervalRef = useRef(intervalMs);
  readRef.current = read;
  intervalRef.current = intervalMs;
  const lastData = useRef<T | null>(null);
  const handle = useRef<{ refresh(): void } | null>(null);

  useEffect(() => {
    const poller = startPolling<T>(
      () => readRef.current(),
      () => intervalRef.current(lastData.current),
      (outcome) => {
        const checkedAt = new Date();
        if (outcome.ok) {
          lastData.current = outcome.data;
          setState({ kind: "ok", data: outcome.data, checkedAt });
          return;
        }
        const { error } = outcome;
        // `requestJson` and `fetchHealth` reject with only these two. Any
        // other value is a programming error, which surfaces rather than
        // rendering as a stale read; the next read is already scheduled.
        if (!(error instanceof ApiError || error instanceof ApiUnreachableError)) {
          throw error;
        }
        setState((previous) => ({
          kind: "error",
          error,
          last:
            previous.kind === "ok"
              ? { data: previous.data, checkedAt: previous.checkedAt }
              : previous.kind === "error"
                ? previous.last
                : null,
        }));
      },
    );
    handle.current = poller;
    return poller.stop;
  }, []);

  const refresh = useCallback(() => {
    handle.current?.refresh();
  }, []);

  return { state, refresh };
}
