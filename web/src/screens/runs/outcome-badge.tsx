import type { JSX } from "react";
import type { RunState } from "../../api/types";

/** The six STD-UI-12 severity tiers a run state can carry. */
export type RunTier = "neutral" | "active" | "good" | "warning" | "serious" | "critical";

/**
 * Run state to tier, verbatim from ux-design section 5 and component design
 * `run-journal` section 10 (DAC-E5-16, DAC-E5-S6-2). `partial` is warning and
 * never good (AC-9); `cancelled` is neutral and never critical (AC-19);
 * `abandoned` is serious, distinct from both.
 */
export const RUN_STATE_TIER: Record<RunState, RunTier> = {
  requested: "neutral",
  running: "active",
  cancelling: "warning",
  succeeded: "good",
  partial: "warning",
  failed: "critical",
  cancelled: "neutral",
  abandoned: "serious",
};

/** The visible word for each state (CAP-001-E5-S6-tasks Open Gap 7, PROVISIONAL). */
export const RUN_STATE_LABEL: Record<RunState, string> = {
  requested: "Requested",
  running: "Running",
  cancelling: "Cancelling",
  succeeded: "Succeeded",
  partial: "Partial",
  failed: "Failed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
};

/** The abandoned-run explanation, verbatim from ux-design section 1.5 (DAC-E5-17). */
export const ABANDONED_EXPLANATION =
  "The process running this acquisition stopped before it finished, and the run was reclaimed. Coverage written before it stopped is kept. Start a new run to continue.";

export function isRunState(value: unknown): value is RunState {
  return typeof value === "string" && Object.hasOwn(RUN_STATE_TIER, value);
}

/** True only for the three states a run can still leave: requested, running, cancelling. */
export function isNonTerminalRunState(state: RunState): boolean {
  return state === "requested" || state === "running" || state === "cancelling";
}

/**
 * One shape per tier, so the six tiers stay distinguishable in greyscale
 * (STD-UI-8) rather than being the same shape recoloured.
 */
export function TierIcon({ tier }: { tier: RunTier }): JSX.Element {
  const shapes: Record<RunTier, JSX.Element> = {
    neutral: <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="2" />,
    active: <circle cx="6" cy="6" r="5" fill="currentColor" />,
    good: <path d="M1.5 6.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" />,
    warning: <path d="M6 1l5 10H1z" fill="currentColor" />,
    serious: <path d="M6 0.5l5.5 5.5-5.5 5.5-5.5-5.5z" fill="currentColor" />,
    critical: <path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" strokeWidth="2" />,
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      data-icon={tier}
      className="h-3 w-3 shrink-0"
    >
      {shapes[tier]}
    </svg>
  );
}

export const TIER_CLASSES: Record<RunTier, string> = {
  neutral: "bg-status-neutral-muted text-status-neutral",
  active: "bg-status-active-muted text-status-active",
  good: "bg-status-good-muted text-status-good",
  warning: "bg-status-warning-muted text-status-warning",
  serious: "bg-status-serious-muted text-status-serious",
  critical: "bg-status-critical-muted text-status-critical",
};

/**
 * A run's outcome as a `badge` with one of the six `status-*` variants,
 * carrying its word and an icon, never colour alone (ux-design 1.4
 * Accessibility). It renders the state as recorded and never upgrades it.
 */
export function OutcomeBadge({ state }: { state: RunState }): JSX.Element {
  const tier = RUN_STATE_TIER[state];
  return (
    <span
      data-testid="outcome-badge"
      data-variant={`status-${tier}`}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${TIER_CLASSES[tier]}`}
    >
      <TierIcon tier={tier} />
      {RUN_STATE_LABEL[state]}
    </span>
  );
}
