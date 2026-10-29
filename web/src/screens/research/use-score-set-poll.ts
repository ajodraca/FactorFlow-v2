import { useCallback, useEffect, useRef, useState } from "react";
import { getClassificationSummary } from "../../api/classification-client";
import type { ClassificationSummary, CurrentSet } from "../../api/classification-types";
import { type HealthState, useHealth } from "../../app/status-region";
import { isNonTerminalRunState } from "../runs/outcome-badge";
import { SCORE_SET } from "./copy";
import { formatTimestamp } from "./format";

/**
 * The score-set poll every scored CAP-002 surface runs (classification-ui 2.3,
 * 2.6; UX design 1.2 Polling and Completion; AC-20, AC-22; DAC-E4-4,
 * DAC-E4-S4-4, DAC-E4-S4-5, DAC-E4-S4-6; DEC-0153, DEC-0155, DEC-0233).
 *
 * It reads `GET /api/classifications/summary` on mount, from first load and
 * before any set exists, then every 10 seconds while the read's `later.state`
 * is `building` or the shell's health reports a non-terminal download, and
 * stops otherwise (STD-UI-25). The stop waits for one more read when the
 * download ends: a read issued while the download still ran cannot have seen
 * the set it produced, so the hook keeps its cadence until a read issued after
 * the terminal report has landed; that read's `later` then governs
 * (classification-ui 2.6's handoff; DEC-0233). A read whose `set.setId`
 * differs from the last one seen, null to a first set included, is a new
 * complete set: the hook sets `announcement` once and calls the host's
 * `onNewSet` once, and the host reloads its table once with its state
 * preserved (DEC-0062). A rejected read sets `pollFailed`, keeps the summary
 * and stops the timer until `tryAgain`, whether or not a set exists yet
 * (DEC-0155).
 */

/** The cadence classification-ui 2.3 records for this poll, mirroring `HEALTH_POLL_INTERVAL_MS`. */
export const POLL_INTERVAL_MS = 10_000;

export interface ScoreSetPoll {
  /** The last successful read, `null` before the first. */
  summary: ClassificationSummary | null;
  /** The ISO-8601 instant of the last successful read, `null` before the first (DEC-0153). */
  checkedAt: string | null;
  /** True after a rejected read, until `tryAgain` succeeds. */
  pollFailed: boolean;
  /** One read, now; polling resumes while a continuation condition holds. */
  tryAgain: () => Promise<void>;
  /** *Scores updated to {time} from the download started {time}* for the latest new set. */
  announcement: string | null;
}

/**
 * `undefined` before the first successful read, then the last read's
 * `set.setId`, or `null` when that read had no set. The two empty values are
 * distinct so a first set arriving after a never-populated read counts as new
 * while the very first read never fires.
 */
type LastSetId = string | null | undefined;

/** True while the shell's health reports the latest download still running: requested, running or cancelling. */
function downloadRunning(health: HealthState["health"]): boolean {
  const latestRun = health?.most_recent_run ?? null;
  return latestRun !== null && isNonTerminalRunState(latestRun.state);
}

/** *Scores updated to {time} from the download started {time}* for a new complete set. */
function announcementFor(set: CurrentSet): string {
  return SCORE_SET.scoresUpdatedTo(formatTimestamp(set.endedAt), formatTimestamp(set.runStartedAt));
}

/** A ref that always holds the latest render's value, for callbacks that must not restart on it. */
function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

/** Runs `tick` every `POLL_INTERVAL_MS` while `active`; the timer is cleared when it stops and on unmount. */
function usePollTimer(active: boolean, tick: () => void): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [active, tick]);
}

export function useScoreSetPoll({
  onNewSet,
}: {
  onNewSet: (summary: ClassificationSummary) => void;
}): ScoreSetPoll {
  const [summary, setSummary] = useState<ClassificationSummary | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [pollFailed, setPollFailed] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  // True while the latest successful read was issued before the shell's health
  // reported the download terminal, so one more read is owed (DEC-0233).
  const [readWhileDownloading, setReadWhileDownloading] = useState(false);
  const { health } = useHealth();
  const downloading = downloadRunning(health);

  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const lastSetIdRef = useRef<LastSetId>(undefined);
  const onNewSetRef = useLatest(onNewSet);
  const downloadingRef = useLatest(downloading);

  const read = useCallback(async (): Promise<void> => {
    // At most one read in flight: a tick that lands during a slow read is skipped.
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    // What a read can have seen is fixed when it is issued, not when it lands.
    const issuedWhileDownloading = downloadingRef.current;
    let next: ClassificationSummary;
    try {
      // Only the read is guarded: a host callback that throws is the host's
      // defect and must not be reported as a failed poll.
      next = await getClassificationSummary();
    } catch {
      // The read failed, whether the API did not answer or refused. The error
      // is not swallowed: it becomes the `pollFailed` state the as-of line
      // renders as *Could not check for newer scores.* with **Try again**
      // (DEC-0155), and the previous summary stays as it was. Its text is
      // deliberately not rendered (STD-UI-23).
      if (mountedRef.current) {
        setPollFailed(true);
      }
      return;
    } finally {
      inFlightRef.current = false;
    }
    if (!mountedRef.current) {
      return;
    }
    const previous = lastSetIdRef.current;
    const setId = next.set?.setId ?? null;
    lastSetIdRef.current = setId;
    setSummary(next);
    setCheckedAt(new Date().toISOString());
    setPollFailed(false);
    setReadWhileDownloading(issuedWhileDownloading);
    if (next.set !== null && previous !== undefined && previous !== setId) {
      setAnnouncement(announcementFor(next.set));
      onNewSetRef.current(next);
    }
  }, [downloadingRef, onNewSetRef]);

  useEffect(() => {
    mountedRef.current = true;
    void read();
    return () => {
      mountedRef.current = false;
    };
  }, [read]);

  const polling =
    !pollFailed && (summary?.later?.state === "building" || downloading || readWhileDownloading);
  usePollTimer(polling, read);

  return { summary, checkedAt, pollFailed, tryAgain: read, announcement };
}
