import type { JSX } from "react";
import type { CurrentSet, LaterSet } from "../../api/classification-types";
import { SCORE_SET } from "../../screens/research/copy";
import { formatTimestamp } from "../../screens/research/format";
import { StatusBadge } from "./status-badge";

/**
 * The not-current banner every scored CAP-002 surface shows above its scores
 * while a later set builds or after an attempt failed (UX design 1.2;
 * classification-ui 2.6; AC-20; DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-2).
 *
 * It reads `set` and `later` only, never `notCurrent`, so the list and the
 * summary reads' shared shape is its one source (DEC-0082). It renders
 * nothing when either is null: with no current set the host's never-populated
 * body renders the first set's state from the same `later` block (DAC-E4-2,
 * CAP-002-E4-S9), and with no later set the as-of line stands alone. It is not
 * a live region; the as-of line announces (DEC-0154). It carries no control:
 * the scheduler does not retry a failed set, so nothing is offered to retry
 * (STD-UI-2).
 */

/** The sentence under the badge, from the shipped catalogue (CAP-002-E4-S2). */
function bannerBody(set: CurrentSet, later: LaterSet): string {
  const produced = formatTimestamp(set.endedAt);
  const downloadStarted = formatTimestamp(set.runStartedAt);
  if (later.state === "building") {
    return SCORE_SET.buildingBody(produced, downloadStarted);
  }
  // A failed set always records its end time and reason; the fallbacks cover
  // the nullable wire types only (DEC-0232).
  const failedAt = formatTimestamp(later.endedAt ?? later.startedAt);
  const reason = later.failureReason ?? SCORE_SET.noReasonRecorded;
  return SCORE_SET.failedBody(failedAt, reason, produced, downloadStarted);
}

export interface NotCurrentBannerProps {
  set: CurrentSet | null;
  later: LaterSet | null;
}

/**
 * A `card` holding the `status-warning` *Not reflecting the latest download*
 * or `status-critical` *Score update failed* badge and one or two sentences
 * (DAC-E4-S4-1, DAC-E4-S4-2); `null` when there is nothing to mark.
 */
export function NotCurrentBanner({ set, later }: NotCurrentBannerProps): JSX.Element | null {
  if (set === null || later === null) {
    return null;
  }
  const building = later.state === "building";
  return (
    <div
      data-testid="not-current-banner"
      data-variant="default"
      className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-base text-card-foreground"
    >
      {building ? (
        <StatusBadge tier="warning" className="w-fit">
          {SCORE_SET.notReflecting}
        </StatusBadge>
      ) : (
        <StatusBadge tier="critical" className="w-fit">
          {SCORE_SET.scoreUpdateFailed}
        </StatusBadge>
      )}
      <p>{bannerBody(set, later)}</p>
    </div>
  );
}
