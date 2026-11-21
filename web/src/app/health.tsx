import {
  type JSX,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchHealth } from "../api/client";
import type { HealthResponse } from "../api/types";
import { startPolling } from "./use-polled-read";

/**
 * The health poll the shell reads (component design `owner-shell` 2.4;
 * DEC-0211, DEC-0212), copied from the delivered `status-region.tsx`, whose
 * rendering moves in CAP-003-E3-S6.
 *
 * The product reports two facts from `GET /api/health`, which AC-18 requires
 * reachable from any screen without inspecting the data store: whether it is
 * answering, and how the most recent acquisition run ended. It polls every
 * 30 seconds and carries its last-updated time (STD-UI-25, DAC-E1-13). New
 * here: `lastAnsweredAt` (AC-23), and the poll pauses while the page is
 * hidden by the same scheduler `usePolledRead` uses (DAC-E3-5).
 */

/** The cadence owner-shell section 2.4 records for this poll. */
export const HEALTH_POLL_INTERVAL_MS = 30_000;

/**
 * The zone the product displays throughout, per STD-UI-5's resolution of
 * OQ-UI-3. A timestamp is never rendered in the viewing machine's local zone.
 */
const DISPLAY_TIME_ZONE = "America/Chicago";

/**
 * The designed unreachable copy, verbatim from UX design section 2.
 * STD-UI-23 requires this state to be designed rather than surfaced as a
 * generic transport error, so the wording lives here as one constant rather
 * than being assembled from an exception's message.
 */
export const UNREACHABLE_MESSAGE =
  "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.";

/**
 * What the last poll established. `unknown` is the state before the first
 * poll resolves; `unreachable` means the fetch itself failed, which is the
 * API not answering at all.
 *
 * A successful response reporting `database: "unreachable"` is deliberately
 * NOT this state: that is the API answering that its store is down
 * (DAC-E1-S6-2), a different fact from DAC-E1-15's, and collapsing the two
 * would make a dead database look like a dead product.
 */
export type Liveness = "unknown" | "answering" | "unreachable";

export interface HealthState {
  liveness: Liveness;
  /** The last successful response, or `null` if none has arrived yet. */
  health: HealthResponse | null;
  /** When the last poll completed, successfully or not. */
  lastUpdated: Date | null;
  /**
   * The instant of the last successful answer, kept while unreachable
   * (AC-23; DEC-0212).
   */
  lastAnsweredAt: Date | null;
}

/**
 * Renders a timestamp as ISO-8601 in `America/Chicago`, with the zone
 * visible (STD-UI-5, DAC-E1-S5-2). Built from `Intl` parts rather than from
 * a locale format string, because a locale-formatted timestamp is exactly
 * what the rule forbids.
 */
export function formatTimestamp(when: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(when);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";

  // Some engines spell midnight "24" under a 24-hour cycle; ISO-8601 spells
  // that hour "00".
  const hour = part("hour") === "24" ? "00" : part("hour");

  return `${part("year")}-${part("month")}-${part("day")} ${hour}:${part("minute")}:${part("second")} ${DISPLAY_TIME_ZONE}`;
}

interface HealthHandle {
  state: HealthState;
  /** Reads at once and keeps the cadence from that read; ignored while a read is in flight. */
  refresh: () => void;
}

/**
 * Polls `GET /api/health` on mount and every 30 seconds thereafter, pausing
 * while the page is hidden and stopping on unmount so no request continues
 * after navigation (DAC-E1-S5-5, DAC-E3-5).
 *
 * `enabled` exists so a consumer that already has a provider above it does
 * not open a second poll; the effect depends on nothing else, so a re-render
 * never creates one either.
 */
function useHealthPolling(enabled: boolean): HealthHandle {
  const [state, setState] = useState<HealthState>({
    liveness: "unknown",
    health: null,
    lastUpdated: null,
    lastAnsweredAt: null,
  });
  const poller = useRef<{ refresh(): void } | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = startPolling<HealthResponse>(
      fetchHealth,
      () => HEALTH_POLL_INTERVAL_MS,
      (outcome) => {
        const now = new Date();
        if (outcome.ok) {
          setState({
            liveness: "answering",
            health: outcome.data,
            lastUpdated: now,
            lastAnsweredAt: now,
          });
          return;
        }
        // The transport failed, so the API is not answering at all. The
        // thrown error's text is deliberately discarded rather than
        // rendered: STD-UI-23 forbids surfacing it, and the designed copy
        // says more than the exception would. The error is not swallowed —
        // it is translated into the `unreachable` state below, which is the
        // handling this criterion asks for.
        setState((previous) => ({
          liveness: "unreachable",
          health: previous.health,
          lastUpdated: now,
          lastAnsweredAt: previous.lastAnsweredAt,
        }));
      },
    );
    poller.current = handle;
    return () => {
      handle.stop();
      poller.current = null;
    };
  }, [enabled]);

  const refresh = useCallback(() => {
    poller.current?.refresh();
  }, []);

  return { state, refresh };
}

/**
 * The shell needs the same liveness fact the status region reports, to
 * substitute the unreachable state into the main region on every route
 * (DAC-E1-15). One provider at the shell's root means exactly one polling
 * chain exists no matter how many consumers read it — two independent
 * pollers would double the request rate the design fixes at 30 seconds.
 */
const HealthContext = createContext<HealthHandle | null>(null);

/** Polls health once and supplies the result to every consumer beneath it. */
export function HealthProvider({ children }: { children: ReactNode }): JSX.Element {
  const { state, refresh } = useHealthPolling(true);
  const value = useMemo(() => ({ state, refresh }), [state, refresh]);
  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

/**
 * The current health state.
 *
 * Falls back to polling for itself when no provider is above it, so a
 * consumer stays renderable — and testable — on its own, without the shell.
 */
export function useHealth(): HealthState {
  const provided = useContext(HealthContext);
  const own = useHealthPolling(provided === null);
  return (provided ?? own).state;
}

const NO_REFRESH = (): void => undefined;

/**
 * Re-reads health at once, for the shell context's `refresh("health")`
 * (DEC-0322). Inside a provider it is the provider's refresh. Outside one
 * there is no shell above to call it, so it is a stable no-op.
 */
export function useHealthRefresh(): () => void {
  return useContext(HealthContext)?.refresh ?? NO_REFRESH;
}
