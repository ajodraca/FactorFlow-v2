import type { JSX } from "react";
import type { ResultOutcome } from "../../../api/types";
import { type RunTier, TIER_CLASSES, TierIcon } from "../outcome-badge";

/**
 * Per-data-type outcome to tier (CAP-001-E7-S4-tasks Open Gap P1, DEC-0015,
 * PROVISIONAL). Only the three variants ux-design 1.5 lists for this badge
 * are used. `written` and `unchanged` both count toward `succeeded`
 * (acquisition-runner 2.4), so both are good. `not_found` is warning, distinct
 * from `failed`'s critical, because the owner's remedy differs (DAC-E7-S4-4).
 * `skipped` is warning, STD-UI-12's "requested but not effective".
 */
export const RESULT_OUTCOME_TIER: Record<ResultOutcome, RunTier> = {
  written: "good",
  unchanged: "good",
  not_found: "warning",
  failed: "critical",
  skipped: "warning",
};

/** The visible word for each outcome (DEC-0015, PROVISIONAL). */
export const RESULT_OUTCOME_LABEL: Record<ResultOutcome, string> = {
  written: "Written",
  unchanged: "Unchanged",
  not_found: "Not found",
  failed: "Failed",
  skipped: "Skipped",
};

/** The collapsed row's badge order: failure-first, as the roster sorts (DEC-0015). */
export const RESULT_OUTCOME_ORDER: ResultOutcome[] = [
  "failed",
  "not_found",
  "skipped",
  "unchanged",
  "written",
];

/**
 * One data type's outcome as a `badge`, with its word and its tier's icon,
 * never colour alone (STD-UI-8, STD-UI-12; DAC-E7-11). The same markup as
 * `OutcomeBadge`.
 */
export function ResultOutcomeBadge({ outcome }: { outcome: ResultOutcome }): JSX.Element {
  const tier = RESULT_OUTCOME_TIER[outcome];
  return (
    <span
      data-testid="result-outcome-badge"
      data-variant={`status-${tier}`}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${TIER_CLASSES[tier]}`}
    >
      <TierIcon tier={tier} />
      {RESULT_OUTCOME_LABEL[outcome]}
    </span>
  );
}
