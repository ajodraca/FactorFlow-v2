import { type JSX, useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, ApiUnreachableError, getHistoryDepth, listInstruments } from "../../api/client";
import type { HistoryDepth, InstrumentListResult } from "../../api/types";
import { useShell } from "../../app/shell-context";
import { formatCount } from "../../components/patterns/format";
import { NotDeterminable } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSummaryList,
  CardTitle,
} from "../../components/ui/card";
import { ReadFailure, SkeletonLine } from "./check-card";
import {
  DEPTH_NOT_SET,
  FOLLOWED_STOCKS,
  HISTORY_DEPTH,
  KEY_NOT_DETERMINABLE_REASON,
  MANAGE_FOLLOWED_STOCKS,
  MARKET_DATA_KEY,
  READ_TARGETS,
  STOPPED_FOLLOWING,
  WHAT_YOU_FOLLOW,
  depthYears,
  historyKept,
  readFailed,
  readFailureReason,
} from "./copy";

type FollowState =
  | { kind: "loading" }
  | { kind: "ok"; counts: InstrumentListResult; depth: HistoryDepth }
  | { kind: "error"; error: ApiError | ApiUnreachableError };

/**
 * The What you follow card (component design data-health-ui 2.6 and 4;
 * DAC-E6-16, DAC-E6-S4-3, AC-4, AC-17, DEC-0385): how many stocks are followed
 * and stopped, the history depth, and whether the market data key was found,
 * never its value. The key's badge keys on whether health is answering, because
 * `health` keeps its last answer while unreachable (Resolved Conflict 6); no
 * field of it but `credential_present` is read.
 */
export function WhatYouFollow(): JSX.Element {
  const headingId = useId();
  const { health } = useShell();
  const [state, setState] = useState<FollowState>({ kind: "loading" });

  const latestCall = useRef(0);

  const read = useCallback(() => {
    latestCall.current += 1;
    const mine = latestCall.current;
    setState({ kind: "loading" });
    Promise.all([listInstruments({ limit: 1 }), getHistoryDepth()]).then(
      ([counts, depth]) => {
        if (mine !== latestCall.current) {
          return;
        }
        setState({ kind: "ok", counts, depth });
      },
      (cause: unknown) => {
        if (mine !== latestCall.current) {
          return;
        }
        if (!(cause instanceof ApiError || cause instanceof ApiUnreachableError)) {
          throw cause;
        }
        // DAC-E6-17: either read failing replaces the body with the error.
        setState({ kind: "error", error: cause });
      },
    );
  }, []);

  useEffect(() => {
    read();
  }, [read]);

  let key: JSX.Element;
  if (health.liveness === "answering" && health.health !== null) {
    const status = { of: "credential", present: health.health.credential_present } as const;
    key = <StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>;
  } else {
    key = <NotDeterminable reason={KEY_NOT_DETERMINABLE_REASON} />;
  }

  return (
    <section aria-labelledby={headingId}>
      <Card variant="summary">
        <CardHeader>
          <CardTitle id={headingId}>{WHAT_YOU_FOLLOW}</CardTitle>
        </CardHeader>
        {state.kind === "loading" ? (
          <CardContent>
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </CardContent>
        ) : state.kind === "error" ? (
          <CardContent>
            <ReadFailure
              sentence={readFailed(READ_TARGETS.whatYouFollow, readFailureReason(state.error))}
              onRetry={read}
            />
          </CardContent>
        ) : (
          <>
            <CardContent>
              <CardSummaryList className="grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">{FOLLOWED_STOCKS}</dt>
                <dd>{formatCount(state.counts.activeCount)}</dd>
                <dt className="text-muted-foreground">{STOPPED_FOLLOWING}</dt>
                <dd>{historyKept(formatCount(state.counts.retiredCount))}</dd>
                <dt className="text-muted-foreground">{HISTORY_DEPTH}</dt>
                <dd>
                  <Link to="/settings">
                    {state.depth.years === null
                      ? DEPTH_NOT_SET
                      : depthYears(formatCount(state.depth.years))}
                  </Link>
                </dd>
                <dt className="text-muted-foreground">{MARKET_DATA_KEY}</dt>
                <dd>{key}</dd>
              </CardSummaryList>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link to="/data/followed">{MANAGE_FOLLOWED_STOCKS}</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </section>
  );
}
