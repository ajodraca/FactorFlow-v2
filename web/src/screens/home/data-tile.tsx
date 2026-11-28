import { type JSX, type ReactNode, useId } from "react";
import { Link } from "react-router-dom";
import { type ApiError, ApiUnreachableError } from "../../api/client";
import { useShell } from "../../app/shell-context";
import type { ScoreState, ScoreSummary } from "../../app/shell-types";
import { formatCount, formatInstant, formatSessionDate } from "../../components/patterns/format";
import { Absent } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { type Status, labelOf, tierOf } from "../../components/patterns/tiers";
import { dataTileBadge, worstDataTier } from "../../components/patterns/worst-data-tier";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardMetricValue,
  CardTitle,
} from "../../components/ui/card";
import { DATA_TILE, NOT_DETERMINABLE, READ_FAILURE, TRY_AGAIN } from "./copy";

/**
 * Home's data tile: how many followed stocks are current and whether the data
 * can be trusted (component design `home-ui` 2.2, 2.4 and section 10; UX design
 * 1.3 Page Layout 2; DEC-0210 and DEC-0217 as amended; DAC-E5-2 to DAC-E5-5,
 * AC-8, AC-11 and AC-21; DEC-0363 to -4). It takes no props and reads the
 * shell's attention and scores only. It makes no read of its own and never
 * reads the aggregate (DEC-0219 withdrawn).
 */

/** The route the whole tile links to (home-ui 2.4). */
const DATA_HEALTH = "/data";

/** The status of a download that is running, for the first-download badge. */
const RUNNING: Status = { of: "download", state: "running" };

/** The scores status of a lagging set, for the lag badge. */
const NOT_CURRENT: Status = { of: "scores", state: "not_current" };

type ScoresStatus = Extract<Status, { of: "scores" }>;

/**
 * The summary's score state, in the table order of data-health-ui 2.4 and epic
 * DAC-E6-5 (home-ui 2.4: "the tier Data health's Factor scores card shows";
 * spec review v3 FINDING-13): never classified, then a later set building, then
 * failed, then a set not current, else current.
 */
function scoreStateOf(summary: ScoreSummary): ScoresStatus["state"] {
  if (summary.never_classified) {
    return "never_classified";
  }
  if (summary.later?.state === "building") {
    return "building";
  }
  if (summary.later?.state === "failed") {
    return "failed";
  }
  if (summary.set?.not_current === true) {
    return "not_current";
  }
  return "current";
}

/** The score input of `dataTileBadge`: null while the summary is not served (home-ui 2.4). */
function scoreStatus(scores: ScoreState): ScoresStatus | null {
  return scores.kind === "served" ? { of: "scores", state: scoreStateOf(scores.data) } : null;
}

/** The section, link and card the first-download and full states share; the error and skeleton states build their own, without the link (Resolved Conflict 4). */
function TileLink({
  name,
  titleId,
  badge,
  children,
}: {
  name: string;
  titleId: string;
  badge?: ReactNode;
  children: ReactNode;
}): JSX.Element {
  return (
    <section aria-labelledby={titleId}>
      <Link to={DATA_HEALTH} aria-label={name} className="block rounded">
        <Card variant="metric">
          <CardHeader>
            <CardTitle id={titleId}>{DATA_TILE.title}</CardTitle>
            {badge}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </Link>
    </section>
  );
}

/**
 * The reason a read failed, as one fixed sentence per kind; never the server's
 * message or request id (DEC-0366).
 */
function readFailureReason(error: ApiError | ApiUnreachableError): string {
  return error instanceof ApiUnreachableError ? READ_FAILURE.unreachable : READ_FAILURE.unexpected;
}

/**
 * A failed read, replacing the tile's body under its title: the sentence and
 * Try again, no badge and no figure, and no link (home-ui 2.4; epic DAC-E5-11).
 * It never shows the last good answer (Resolved Conflict 4).
 */
function ErrorTile({
  error,
  titleId,
  onRetry,
}: {
  error: ApiError | ApiUnreachableError;
  titleId: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <section aria-labelledby={titleId}>
      <Card variant="metric">
        <CardHeader>
          <CardTitle id={titleId}>{DATA_TILE.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{DATA_TILE.readError(readFailureReason(error))}</p>
          <Button variant="outline" type="button" onClick={onRetry}>
            {TRY_AGAIN}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

/** The tile's title over one pulsing block, while a read it needs has not answered. */
function TileSkeleton({ titleId }: { titleId: string }): JSX.Element {
  return (
    <section aria-labelledby={titleId}>
      <Card variant="metric" data-testid="data-tile-skeleton" aria-busy="true">
        <CardHeader>
          <CardTitle id={titleId}>{DATA_TILE.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div aria-hidden="true" className="min-h-7 w-full animate-pulse rounded bg-secondary" />
        </CardContent>
      </Card>
    </section>
  );
}

export function DataTile(): JSX.Element | null {
  const { attention, scores, refresh } = useShell();
  const titleId = useId();

  if (attention.kind === "loading") {
    return <TileSkeleton titleId={titleId} />;
  }
  if (attention.kind === "error") {
    return (
      <ErrorTile error={attention.error} titleId={titleId} onRetry={() => refresh("attention")} />
    );
  }

  const a = attention.data;
  const d = a.latest_download;
  if (d === null) {
    return null;
  }

  const verdict = worstDataTier({
    affectedCount: a.problems.stock_count,
    followedCount: a.followed_count,
    latestTerminalDownload: a.latest_terminal_download?.state ?? null,
  });
  const badge = dataTileBadge(verdict, scoreStatus(scores));

  // No badge means no download has ended: `dataTileBadge` is null exactly when
  // the verdict is, which is exactly when there is no terminal download.
  if (badge === null) {
    const time = formatInstant(d.started_at ?? d.requested_at);
    return (
      <TileLink
        name={DATA_TILE.firstDownloadName(time)}
        titleId={titleId}
        badge={
          d.state === "running" ? (
            <span data-testid="data-tile-badge">
              <StatusBadge tier={tierOf(RUNNING)}>{labelOf(RUNNING)}</StatusBadge>
            </span>
          ) : null
        }
      >
        <p>{DATA_TILE.firstDownloadRunning(time)}</p>
      </TileLink>
    );
  }

  if (scores.kind === "loading") {
    return <TileSkeleton titleId={titleId} />;
  }

  if (scores.kind === "error") {
    return <ErrorTile error={scores.error} titleId={titleId} onRetry={() => refresh("scores")} />;
  }

  const summary = scores.kind === "served" ? scores.data : null;
  const stocks = summary?.stocks_current ?? null;
  const current = stocks === null ? null : formatCount(stocks.current_count);
  const followed = formatCount(stocks === null ? a.followed_count : stocks.followed_count);
  let scoresAt: string | null = null;
  if (summary !== null) {
    scoresAt =
      summary.set === null
        ? labelOf({ of: "scores", state: "never_classified" })
        : formatInstant(summary.set.ended_at);
  }
  const pricesOn = a.prices_as_of === null ? null : formatSessionDate(a.prices_as_of);
  const lagging = summary !== null && (summary.set?.not_current === true || summary.later !== null);

  let nameOfScores = NOT_DETERMINABLE;
  if (summary !== null && scoresAt !== null) {
    nameOfScores =
      summary.set === null ? `${scoresAt.charAt(0).toLowerCase()}${scoresAt.slice(1)}` : scoresAt;
  }
  const name = DATA_TILE.name(
    badge.label,
    current ?? NOT_DETERMINABLE,
    followed,
    nameOfScores,
    pricesOn ?? DATA_TILE.pricesNotDownloaded,
  );

  return (
    <TileLink
      name={name}
      titleId={titleId}
      badge={
        <span data-testid="data-tile-badge">
          <StatusBadge tier={badge.tier}>{badge.label}</StatusBadge>
        </span>
      }
    >
      <CardMetricValue>
        {current ?? <Absent label={NOT_DETERMINABLE} />}{" "}
        {DATA_TILE.ofFollowedStocksCurrent(followed)}
      </CardMetricValue>
      <p className="text-xs text-muted-foreground">
        {summary === null ? (
          <>
            {DATA_TILE.scores} <Absent label={NOT_DETERMINABLE} />
          </>
        ) : summary.set === null ? (
          scoresAt
        ) : (
          `${DATA_TILE.scores} ${scoresAt}`
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        {DATA_TILE.prices} {pricesOn ?? <Absent label={DATA_TILE.pricesNotDownloaded} />}
      </p>
      <p className="text-xs text-muted-foreground">{DATA_TILE.scope}</p>
      {lagging ? (
        <span data-testid="data-tile-lag">
          <StatusBadge tier={tierOf(NOT_CURRENT)}>{labelOf(NOT_CURRENT)}</StatusBadge>
        </span>
      ) : null}
    </TileLink>
  );
}
