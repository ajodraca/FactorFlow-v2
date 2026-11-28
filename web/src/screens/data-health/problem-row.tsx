import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { ProblemRow as ProblemRowData } from "../../app/shell-types";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { Button } from "../../components/ui/button";
import {
  CONSEQUENCE,
  FAILED_FIX,
  FOLLOW_DIFFERENT,
  NOT_FOUND_FIX,
  NOT_RECOGNISED,
  STOP_FOLLOWING,
  downloadFailed,
  followDifferentName,
  stopFollowingName,
  symbolLinkName,
} from "./copy";

/**
 * One stock with a problem: its symbol, each failure with its badge, the
 * consequence and the fix that applies (component design data-health-ui 2.5,
 * 2.7 and 10; DAC-E6-8, DAC-E6-13, AC-13, AC-14). Each fix renders once per
 * row per outcome present. A *Failed* fix has no control of its own: the
 * header's **Download now** is the action (D-9). A *Not found* row offers
 * stopping and following a different symbol, whose router state `focusAdd` is
 * read by Followed stocks (CAP-003-E7-S3); the symbol link seeds Coverage with
 * `?symbol=` (CAP-003-E7-S2). A provider reason is a text child, never markup.
 */
export function ProblemRow({
  row,
  onStopFollowing,
}: {
  row: ProblemRowData;
  onStopFollowing: (symbol: string) => void;
}): JSX.Element {
  const anyFailed = row.failures.some((f) => f.outcome === "failed");
  const anyNotFound = row.failures.some((f) => f.outcome === "not_found");
  return (
    <li className="flex flex-col gap-3 py-3">
      <Link
        to={`/data/coverage?symbol=${encodeURIComponent(row.symbol)}`}
        aria-label={symbolLinkName(row.symbol)}
        className="font-semibold"
      >
        {row.symbol}
      </Link>
      {row.failures.map((f) => {
        const status = { of: "result", outcome: f.outcome } as const;
        return (
          <p key={f.data_type} className="flex items-center gap-2 text-sm">
            <StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>
            {f.outcome === "failed"
              ? downloadFailed(f.data_type, f.reason, f.attempts)
              : NOT_RECOGNISED}
          </p>
        );
      })}
      <p className="text-xs text-muted-foreground">{CONSEQUENCE}</p>
      {anyFailed ? <p className="text-sm">{FAILED_FIX}</p> : null}
      {anyNotFound ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            aria-label={stopFollowingName(row.symbol)}
            onClick={() => onStopFollowing(row.symbol)}
          >
            {STOP_FOLLOWING}
          </Button>
          <Button variant="outline" asChild>
            <Link
              to="/data/followed"
              state={{ focusAdd: true }}
              aria-label={followDifferentName(row.symbol)}
            >
              {FOLLOW_DIFFERENT}
            </Link>
          </Button>
          <p className="text-sm">{NOT_FOUND_FIX}</p>
        </div>
      ) : null}
    </li>
  );
}
