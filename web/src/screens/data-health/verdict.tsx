import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Attention, DataHealth, ReadState } from "../../app/shell-types";
import { formatClock } from "../../components/patterns/format";
import { StatusBadge } from "../../components/patterns/status-badge";
import { worstDataTier } from "../../components/patterns/worst-data-tier";
import { Button } from "../../components/ui/button";
import { ReadFailure, SkeletonLine } from "./check-card";
import {
  FULL_COVERAGE_TABLE,
  PAGE_TITLE,
  READ_TARGETS,
  checked,
  gapReason,
  gapsNotCheckable,
  readFailed,
  readFailureReason,
  verdictSentenceRest,
} from "./copy";

/**
 * The page header and the verdict (data-health-ui 2.3; DAC-E6-1 and DAC-E6-2;
 * DEC-0210 and DEC-0217 as amended). The badge is `worstDataTier` over the
 * aggregate's counts and the latest terminal download; the checks' tiers never
 * feed it. While attention loads the verdict is a skeleton, and while attention
 * or the aggregate fails it is that read's error with **Try again**, computing no
 * tier and never reading a failed read's `last`. The component mounts no provider
 * and calls no hook of the shell: the screen passes the reads, the retries and
 * the **Download now** control in (CAP-003-E6-S5, CAP-003-E6-S2).
 */
export function Verdict({
  attention,
  dataHealth,
  onRetryAttention,
  onRetryDataHealth,
  downloadNow,
}: {
  attention: ReadState<Attention>;
  dataHealth: ReadState<DataHealth>;
  onRetryAttention: () => void;
  onRetryDataHealth: () => void;
  downloadNow: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <h1 tabIndex={-1} className="text-xl font-semibold">
          {PAGE_TITLE}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/data/coverage">{FULL_COVERAGE_TABLE}</Link>
          </Button>
          {downloadNow}
        </div>
      </div>
      {body(attention, dataHealth, onRetryAttention, onRetryDataHealth)}
    </header>
  );
}

function body(
  attention: ReadState<Attention>,
  dataHealth: ReadState<DataHealth>,
  onRetryAttention: () => void,
  onRetryDataHealth: () => void,
): ReactNode {
  if (attention.kind === "loading") {
    return <SkeletonLine />;
  }
  if (attention.kind === "error") {
    return (
      <ReadFailure
        sentence={readFailed(READ_TARGETS.attention, readFailureReason(attention.error))}
        onRetry={onRetryAttention}
      />
    );
  }
  if (dataHealth.kind === "loading") {
    return <SkeletonLine />;
  }
  if (dataHealth.kind === "error") {
    return (
      <ReadFailure
        sentence={readFailed(READ_TARGETS.checks, readFailureReason(dataHealth.error))}
        onRetry={onRetryDataHealth}
      />
    );
  }

  const health = dataHealth.data;
  const answer = worstDataTier({
    affectedCount: health.affected_count,
    followedCount: health.followed_count,
    latestTerminalDownload: attention.data.latest_terminal_download?.state ?? null,
  });
  if (answer === null) {
    return null;
  }
  const prices = health.checks.daily_prices;
  return (
    <>
      <p data-testid="verdict-sentence">
        <StatusBadge tier={answer.tier}>{answer.word}</StatusBadge>
        <span className="sr-only">.</span>{" "}
        {verdictSentenceRest(health.affected_count, health.followed_count, answer.downloadClause)}
      </p>
      {prices?.gap_stock_count === null ? (
        <p>{gapsNotCheckable(gapReason(prices.gap_detection.reason))}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">{checked(formatClock(health.checked_at))}</p>
    </>
  );
}
