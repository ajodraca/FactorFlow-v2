import { Link } from "react-router-dom";
import type { ScoreState, ScoreSummary } from "../../app/shell-types";
import { formatCount, formatInstant } from "../../components/patterns/format";
import { Absent, NotDeterminable } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { type Status, labelOf, tierOf } from "../../components/patterns/tiers";
import { CheckCard, ReadFailure, SkeletonLine } from "./check-card";
import {
  ABSENT,
  CHECK_TITLES,
  FROM_DOWNLOAD_STARTED,
  READ_TARGETS,
  SCORES_AT,
  SCORES_NOT_SERVED,
  readFailed,
  readFailureReason,
  showAsIncomplete,
  stocksCurrent,
} from "./copy";

type ScoreStatus = Extract<Status, { of: "scores" }>;

/**
 * The state of a served summary, in the card table's order (data-health-ui 2.4;
 * DAC-E6-5). `not_current` is checked after `later`: CAP-002 sets it exactly when
 * `later` is non-null, so the branch is unreachable on real data and is kept in
 * the epic's listed order (Resolved Conflict 5).
 */
function scoreStateOf(d: ScoreSummary): ScoreStatus["state"] {
  if (d.never_classified) {
    return "never_classified";
  }
  if (d.later?.state === "building") {
    return "building";
  }
  if (d.later?.state === "failed") {
    return "failed";
  }
  if (d.set?.not_current) {
    return "not_current";
  }
  return "current";
}

/**
 * The Factor scores check card, read from the shell's summary (data-health-ui 2.4
 * and 3; DAC-E6-5; AC-8). Its counts come from `stocks_current` alone, never from
 * another `followed_count`.
 */
export function ScoresCard({
  scores,
  onRetryScores,
}: {
  scores: ScoreState;
  onRetryScores: () => void;
}) {
  const title = CHECK_TITLES.scores;
  switch (scores.kind) {
    case "loading":
      return (
        <CheckCard title={title}>
          <SkeletonLine />
        </CheckCard>
      );
    case "not_served":
      return <CheckCard title={title} status={<NotDeterminable reason={SCORES_NOT_SERVED} />} />;
    case "error":
      if (scores.last === null) {
        return (
          <CheckCard title={title}>
            <ReadFailure
              sentence={readFailed(READ_TARGETS.scores, readFailureReason(scores.error))}
              onRetry={onRetryScores}
            />
          </CheckCard>
        );
      }
      return <ServedScores title={title} d={scores.last} />;
    case "served":
      return <ServedScores title={title} d={scores.data} />;
  }
}

function ServedScores({ title, d }: { title: string; d: ScoreSummary }) {
  const status: ScoreStatus = { of: "scores", state: scoreStateOf(d) };
  const current = d.stocks_current;
  const incomplete = current === null ? 0 : current.followed_count - current.current_count;
  return (
    <CheckCard
      title={title}
      status={<StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>}
      result={
        current === null ? (
          <Absent label={ABSENT.noScores} />
        ) : (
          stocksCurrent(formatCount(current.current_count), formatCount(current.followed_count))
        )
      }
      asOf={
        d.set === null ? undefined : (
          <>
            {SCORES_AT} {formatInstant(d.set.ended_at)} · {FROM_DOWNLOAD_STARTED}{" "}
            <Link to={`/data/downloads/${d.set.run_id}`}>
              {formatInstant(d.set.run_started_at)}
            </Link>
          </>
        )
      }
    >
      {incomplete > 0 ? (
        <p className="text-base font-semibold">{showAsIncomplete(formatCount(incomplete))}</p>
      ) : null}
    </CheckCard>
  );
}
