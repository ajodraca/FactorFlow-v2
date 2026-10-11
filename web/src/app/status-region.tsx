import {
  type JSX,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchHealth } from "../api/client";
import type { HealthResponse } from "../api/types";
import { OutcomeBadge } from "../screens/runs/outcome-badge";

/**
 * The persistent status region (UX design section 0; component design
 * `owner-web-app` sections 2.2, 2.3) and the designed unreachable state the
 * shell substitutes into the main region when the API does not answer
 * (UX design section 2).
 *
 * The region reports two facts from `GET /api/health`, which AC-18 requires
 * reachable from any screen without inspecting the data store: whether the
 * product is answering, and how the most recent acquisition run ended. It
 * polls every 30 seconds and shows its last-updated time (STD-UI-25,
 * DAC-E1-13), and reserves a third line for STD-UI-11's trading-environment
 * indicator so it can land without restructuring (DAC-E1-14).
 */

/** The cadence component design section 2.3 records for this region. */
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

/**
 * Polls `GET /api/health` on mount and every 30 seconds thereafter, clearing
 * the interval on unmount so no request continues after navigation
 * (DAC-E1-S5-5, T016).
 *
 * `enabled` exists so a consumer that already has a provider above it does
 * not open a second interval; the effect's dependency list is otherwise
 * empty, so a re-render never creates one either.
 */
function useHealthPolling(enabled: boolean): HealthState {
  const [state, setState] = useState<HealthState>({
    liveness: "unknown",
    health: null,
    lastUpdated: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    mountedRef.current = true;

    const poll = async (): Promise<void> => {
      try {
        const health = await fetchHealth();
        if (!mountedRef.current) {
          return;
        }
        setState({ liveness: "answering", health, lastUpdated: new Date() });
      } catch {
        // The transport failed, so the API is not answering at all. The
        // thrown error's text is deliberately discarded rather than
        // rendered: STD-UI-23 forbids surfacing it, and the designed copy
        // says more than the exception would. The error is not swallowed —
        // it is translated into the `unreachable` state below, which is the
        // handling this criterion asks for.
        if (!mountedRef.current) {
          return;
        }
        setState((previous) => ({
          liveness: "unreachable",
          health: previous.health,
          lastUpdated: new Date(),
        }));
      }
    };

    void poll();
    const timer = setInterval(() => {
      void poll();
    }, HEALTH_POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [enabled]);

  return state;
}

/**
 * The shell needs the same liveness fact the region reports, to substitute
 * the unreachable state into the main region on every route (DAC-E1-15). One
 * provider at the shell's root means exactly one polling interval exists no
 * matter how many consumers read it — two independent pollers would double
 * the request rate the design fixes at 30 seconds.
 */
const HealthContext = createContext<HealthState | null>(null);

/** Polls health once and supplies the result to every consumer beneath it. */
export function HealthProvider({ children }: { children: ReactNode }): JSX.Element {
  const state = useHealthPolling(true);
  return <HealthContext.Provider value={state}>{children}</HealthContext.Provider>;
}

/**
 * The current health state.
 *
 * Falls back to polling for itself when no provider is above it, so the
 * region stays renderable — and testable — on its own, without the shell.
 */
export function useHealth(): HealthState {
  const provided = useContext(HealthContext);
  const own = useHealthPolling(provided === null);
  return provided ?? own;
}

/** A filled disc: the product is answering. */
function AnsweringIcon(): JSX.Element {
  return (
    <svg
      data-testid="liveness-icon"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className="h-3 w-3 shrink-0"
    >
      <circle cx="8" cy="8" r="6" fill="currentColor" />
    </svg>
  );
}

/**
 * A hollow disc struck through: the product is not answering. A different
 * shape rather than the same shape in a different colour, so the two states
 * are distinguishable in greyscale (STD-UI-24, DAC-E1-S5-1).
 */
function UnreachableIcon(): JSX.Element {
  return (
    <svg
      data-testid="liveness-icon"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className="h-3 w-3 shrink-0"
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="4" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** A hollow disc: the first poll has not resolved yet. */
function UnknownIcon(): JSX.Element {
  return (
    <svg
      data-testid="liveness-icon"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className="h-3 w-3 shrink-0"
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const LIVENESS_LABEL: Record<Liveness, string> = {
  unknown: "Checking",
  answering: "Answering",
  unreachable: "Not answering",
};

const LIVENESS_ICON: Record<Liveness, () => JSX.Element> = {
  unknown: UnknownIcon,
  answering: AnsweringIcon,
  unreachable: UnreachableIcon,
};

/**
 * The designed state the shell substitutes into the main region on every
 * route when the API does not answer (UX design section 2, AC-16,
 * DAC-E1-15, DAC-E1-S5-3). It names the likely cause and where to look; it
 * never renders the transport failure.
 */
export function UnreachableState(): JSX.Element {
  return (
    // `output` rather than a `div` with `role="status"`: it carries that
    // role implicitly, so the state announces politely when it replaces the
    // main region (STD-UI-24) without duplicating the role attribute.
    <output data-testid="unreachable-state" className="block text-base">
      {UNREACHABLE_MESSAGE}
    </output>
  );
}

/**
 * The most recent run's outcome (T015).
 *
 * A `null` `most_recent_run` states that no run has been recorded rather
 * than presenting an empty successful state (DAC-E1-17, DAC-E1-S5-4).
 * Otherwise the line shows the run's state as the same outcome badge the
 * Runs screen uses, so the region answers how the last run ended (AC-18,
 * EXP-20261011-2). `data-outcome` carries the recorded state.
 */
function RunOutcomeLine({ health }: { health: HealthResponse | null }): JSX.Element {
  if (health === null || health.most_recent_run === null) {
    return (
      <span data-testid="run-outcome" data-outcome="none">
        No run recorded
      </span>
    );
  }

  const { state } = health.most_recent_run;
  return (
    <span data-testid="run-outcome" data-outcome={state} className="flex items-center gap-2">
      Last run
      <OutcomeBadge state={state} />
    </span>
  );
}

/**
 * The status region itself, pinned to the bottom of the navigation rail.
 *
 * Announced politely rather than replacing silently, because its content is
 * updated by polling (STD-UI-24).
 */
export function StatusRegion(): JSX.Element {
  const { liveness, health, lastUpdated } = useHealth();
  const LivenessIcon = LIVENESS_ICON[liveness];

  // A credential is reported absent only on the strength of a response that
  // actually arrived. When the API did not answer, presence is unknown and
  // the region says nothing about it (component design section 4).
  const credentialAbsent = liveness === "answering" && health?.credential_present === false;

  return (
    <section
      data-testid="status-region"
      aria-label="Application status"
      aria-live="polite"
      className="flex flex-col gap-1 border-border border-t p-3 text-xs"
    >
      <div data-testid="status-line-liveness">
        <span
          data-testid="liveness-state"
          data-liveness={liveness}
          className="flex items-center gap-2"
        >
          <LivenessIcon />
          {LIVENESS_LABEL[liveness]}
        </span>
      </div>

      <div data-testid="status-line-run-outcome">
        <RunOutcomeLine health={health} />
      </div>

      {/*
        DAC-E1-14: the third line STD-UI-11's trading-environment indicator
        lands on. It is reserved rather than rendered — CAP-001 has no paper
        or live environment — so it holds its line's height and is hidden
        from assistive technology until a capability introduces one.
      */}
      <div data-testid="status-line-reserved" aria-hidden="true" className="h-4" />

      {credentialAbsent ? (
        <p data-testid="credential-state" data-credential="absent">
          No provider credential is configured.
        </p>
      ) : null}

      <p data-testid="last-updated" className="font-numeric">
        {lastUpdated === null ? "Not yet checked" : formatTimestamp(lastUpdated)}
      </p>
    </section>
  );
}
