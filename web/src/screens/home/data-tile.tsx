import { type JSX, type ReactNode, useId } from "react";
import { Link } from "react-router-dom";
import { useShell } from "../../app/shell-context";
import { formatInstant } from "../../components/patterns/format";
import { StatusBadge } from "../../components/patterns/status-badge";
import { type Status, labelOf, tierOf } from "../../components/patterns/tiers";
import { dataTileBadge, worstDataTier } from "../../components/patterns/worst-data-tier";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { DATA_TILE } from "./copy";

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

/** The section, the link and the card every state shares (Resolved Conflict 4). */
function TileLink({
  name,
  titleId,
  children,
}: {
  name: string;
  titleId: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section aria-labelledby={titleId}>
      <Link to={DATA_HEALTH} aria-label={name} className="block rounded">
        <Card variant="metric">
          <CardHeader>
            <CardTitle id={titleId}>{DATA_TILE.title}</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </Link>
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
  const { attention, scores } = useShell();
  const titleId = useId();

  if (attention.kind === "loading") {
    return <TileSkeleton titleId={titleId} />;
  }
  if (attention.kind === "error") {
    return null;
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
  const badge = dataTileBadge(verdict, null);

  // No badge means no download has ended: `dataTileBadge` is null exactly when
  // the verdict is, which is exactly when there is no terminal download.
  if (badge === null) {
    const time = formatInstant(d.started_at ?? d.requested_at);
    return (
      <TileLink name={DATA_TILE.firstDownloadName(time)} titleId={titleId}>
        <p>{DATA_TILE.firstDownloadRunning(time)}</p>
        {d.state === "running" ? (
          <span data-testid="data-tile-badge">
            <StatusBadge tier={tierOf(RUNNING)}>{labelOf(RUNNING)}</StatusBadge>
          </span>
        ) : null}
      </TileLink>
    );
  }

  if (scores.kind === "loading") {
    return <TileSkeleton titleId={titleId} />;
  }

  return (
    <TileLink name={`Data: ${badge.label}`} titleId={titleId}>
      <span data-testid="data-tile-badge">
        <StatusBadge tier={badge.tier}>{badge.label}</StatusBadge>
      </span>
    </TileLink>
  );
}
