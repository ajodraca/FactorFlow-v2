import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ApiUnreachableError } from "../api/client";
import type { RunState } from "../api/types";
import { fetchDataHealth } from "./shell-client";
import { useShell } from "./shell-context";
import type { DataHealth, ReadState } from "./shell-types";

/*
 * The data-health aggregate, read on demand only (DAC-E3-19, AC-28; system
 * design 3.4 note 1). DEC-0219, which had the shell read it, is withdrawn:
 * this hook is used by `data-health-ui` alone, and nothing else in the shell
 * reads `GET /api/data-health`. It sets no timer and listens for no
 * visibility change: its one automatic trigger comes from the shell's
 * attention answers, which the hidden-page pause already stops.
 */

/** The download states that are not outcomes (`web/src/api/types.ts`). */
const NON_TERMINAL: ReadonlySet<RunState | null> = new Set<RunState | null>([
  "requested",
  "running",
  "cancelling",
]);

/** The five outcomes a download ends in. */
const TERMINAL: ReadonlySet<RunState | null> = new Set<RunState | null>([
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "abandoned",
]);

/**
 * One read of `GET /api/data-health` on mount, one per `retry()`, and one when
 * the attention read shows `latest_download` turning terminal (DAC-E3-19,
 * TC-COMP-064). Needs a `ShellProvider` above it (DEC-0326).
 *
 * The return type follows `usePolledRead`'s: the state and the one method
 * (DEC-0324).
 */
export function useDataHealth(): { state: ReadState<DataHealth>; retry(): void } {
  const { attention } = useShell();
  const [state, setState] = useState<ReadState<DataHealth>>({ kind: "loading" });
  const inFlight = useRef(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  const previousDownloadState = useRef<RunState | null | undefined>(undefined);
  const runRef = useRef<() => Promise<void>>(async () => undefined);

  /**
   * Reads once at a time (DEC-0325). A trigger during a read sets one pending
   * flag, and exactly one trailing read starts when it settles, so reads never
   * overlap and any number of triggers during one adds one read.
   */
  runRef.current = async (): Promise<void> => {
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    try {
      let outcome: { ok: true; data: DataHealth } | { ok: false; error: unknown };
      try {
        outcome = { ok: true, data: await fetchDataHealth() };
      } catch (error) {
        outcome = { ok: false, error };
      }
      if (!mounted.current) {
        return;
      }
      if (outcome.ok) {
        const { data } = outcome;
        setState({ kind: "ok", data, checkedAt: new Date() });
        return;
      }
      const { error } = outcome;
      // `requestJson` rejects with only these two. Any other value is a
      // programming error, which surfaces rather than rendering as a stale
      // read (as `usePolledRead` does).
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
    } finally {
      inFlight.current = false;
      if (pending.current) {
        pending.current = false;
        if (mounted.current) {
          void runRef.current();
        }
      }
    }
  };

  // The one read on mount (DAC-E3-19).
  useEffect(() => {
    mounted.current = true;
    void runRef.current();
    return () => {
      mounted.current = false;
    };
  }, []);

  // The one read when the download turns terminal. The comparison is between
  // consecutive successful attention answers: an error never touches the ref
  // (DAC-E3-19, TC-COMP-064).
  useEffect(() => {
    if (attention.kind !== "ok") {
      return;
    }
    const current = attention.data.latest_download?.state ?? null;
    const previous = previousDownloadState.current;
    previousDownloadState.current = current;
    if (previous !== undefined && NON_TERMINAL.has(previous) && TERMINAL.has(current)) {
      void runRef.current();
    }
  }, [attention]);

  const retry = useCallback((): void => {
    void runRef.current();
  }, []);

  return { state, retry };
}
