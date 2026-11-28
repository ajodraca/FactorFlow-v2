import { type JSX, useCallback, useEffect, useId, useRef, useState } from "react";
import { ApiError, ApiUnreachableError, listAcquisitionRuns } from "../../api/client";
import { fetchProblems } from "../../app/shell-client";
import type { DataHealth, ProblemRow as ProblemRowData, ReadState } from "../../app/shell-types";
import { formatClock, formatInstant } from "../../components/patterns/format";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ReadFailure, SkeletonLine } from "./check-card";
import {
  FROM_RECENT_DOWNLOADS,
  LAST_COMPLETE_TARGET,
  MORE_PROBLEMS,
  NOTHING_NEEDS_FIXING,
  NO_COMPLETE_DOWNLOAD,
  SHOW_MORE,
  TRY_AGAIN,
  checked,
  lastCompleteDownload,
  needsFixingTitle,
  readFailed,
  readFailureReason,
  showingOf,
} from "./copy";
import { DownloadNow } from "./download-now";
import { ProblemRow } from "./problem-row";

const PAGE_SIZE = 50;

type LastRead =
  | { kind: "pending" }
  | { kind: "done"; line: string }
  | { kind: "failed"; reason: string };

/**
 * The line under *Nothing needs fixing.*: the start time of the last complete
 * download (DAC-E6-10, register C3). It reads only here, once per aggregate
 * answer (DEC-0383), and a read an answer has outdated is ignored.
 */
function LastComplete({ answer }: { answer: DataHealth }): JSX.Element {
  const [read, setRead] = useState<LastRead>({ kind: "pending" });
  const latest = useRef(0);

  const load = useCallback(() => {
    latest.current += 1;
    const mine = latest.current;
    setRead({ kind: "pending" });
    listAcquisitionRuns({ state: "succeeded", limit: 1 }).then(
      (page) => {
        if (mine !== latest.current) {
          return;
        }
        const run = page.runs[0];
        setRead({
          kind: "done",
          line:
            run === undefined
              ? NO_COMPLETE_DOWNLOAD
              : lastCompleteDownload(formatInstant(run.startedAt ?? run.requestedAt)),
        });
      },
      (cause: unknown) => {
        if (mine !== latest.current) {
          return;
        }
        // A thrown value that is not an API error reads as the unexpected-problem reason.
        const known =
          cause instanceof ApiError || cause instanceof ApiUnreachableError
            ? cause
            : new ApiError("", "");
        setRead({ kind: "failed", reason: readFailureReason(known) });
      },
    );
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new aggregate answer re-reads (DEC-0383)
  useEffect(() => {
    load();
    return () => {
      latest.current += 1;
    };
  }, [answer, load]);

  switch (read.kind) {
    case "pending":
      return <SkeletonLine />;
    case "done":
      return <p className="text-xs text-muted-foreground">{read.line}</p>;
    case "failed":
      return (
        <ReadFailure sentence={readFailed(LAST_COMPLETE_TARGET, read.reason)} onRetry={load} />
      );
  }
}

/**
 * The Needs fixing card (component design data-health-ui 2.5, 2.7, 3 and 10;
 * DAC-E6-9, AC-16, AC-25, DEC-0201, DEC-0380 to -2). The header count is the
 * aggregate's `affected_count`, the set the rail chip counts. The rows are the
 * aggregate's first page, then the pages **Show more** appends with the cursor
 * as served; each new aggregate answer restarts from its first page, so a header
 * count and its rows always come from one response (DEC-0381). The card calls no
 * shell hook itself (its children do), and CAP-003-E6-S5 passes
 * `useDataHealth().state` and `retry`.
 */
export function NeedsFixing({
  dataHealth,
  onReread,
}: {
  dataHealth: ReadState<DataHealth>;
  onReread: () => void;
}): JSX.Element | null {
  const titleId = useId();
  const dh = dataHealth.kind === "ok" ? dataHealth.data : null;
  const [extraRows, setExtraRows] = useState<ProblemRowData[]>([]);
  const [cursor, setCursor] = useState<string | null>(dh?.problems.next_cursor ?? null);
  const [pagePending, setPagePending] = useState(false);
  const [pageFailure, setPageFailure] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState({ text: "", serial: 0 });
  const inFlight = useRef(false);
  const generation = useRef(0);
  const moreRef = useRef<HTMLButtonElement>(null);
  const tryRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocus = useRef<"list" | "try" | null>(null);

  useEffect(() => {
    setExtraRows([]);
    setCursor(dh?.problems.next_cursor ?? null);
    setPageFailure(null);
    setPagePending(false);
    inFlight.current = false;
    generation.current += 1;
  }, [dh]);

  useEffect(() => {
    if (pendingFocus.current === "list") {
      listRef.current?.focus();
    } else if (pendingFocus.current === "try") {
      tryRef.current?.focus();
    }
    pendingFocus.current = null;
  });

  if (dh === null) {
    return null;
  }

  const rows = [...dh.problems.rows, ...extraRows];

  async function showMore(): Promise<void> {
    if (inFlight.current || dh === null) {
      return;
    }
    inFlight.current = true;
    setPagePending(true);
    const g = generation.current;
    try {
      const page = await fetchProblems(cursor, PAGE_SIZE);
      if (g !== generation.current) {
        return;
      }
      const hadFocus = document.activeElement === moreRef.current;
      setExtraRows((previous) => [...previous, ...page.rows]);
      setCursor(page.next_cursor);
      setAnnouncement((previous) => ({
        text: showingOf(rows.length + page.rows.length, dh.affected_count),
        serial: previous.serial + 1,
      }));
      if (page.next_cursor === null && hadFocus) {
        pendingFocus.current = "list";
      }
    } catch (cause: unknown) {
      if (g !== generation.current) {
        return;
      }
      // A thrown value that is not an API error reads as the unexpected-problem
      // reason; no thrown value's own text is ever shown.
      const known =
        cause instanceof ApiError || cause instanceof ApiUnreachableError
          ? cause
          : new ApiError("", "");
      if (document.activeElement === moreRef.current) {
        pendingFocus.current = "try";
      }
      setPageFailure(readFailureReason(known));
    } finally {
      // A request an aggregate answer has outdated must not clear the new one's flags.
      if (g === generation.current) {
        inFlight.current = false;
        setPagePending(false);
      }
    }
  }

  return (
    <section aria-labelledby={titleId}>
      <Card variant="default">
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle id={titleId} tabIndex={-1}>
              {needsFixingTitle(dh.affected_count)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {`${FROM_RECENT_DOWNLOADS} · ${checked(formatClock(dh.checked_at))}`}
            </p>
          </div>
          {rows.some((r) => r.retryable) ? <DownloadNow /> : null}
        </CardHeader>
        <CardContent>
          {dh.affected_count === 0 ? (
            <>
              <p className="text-base font-semibold">{NOTHING_NEEDS_FIXING}</p>
              <LastComplete answer={dh} />
            </>
          ) : (
            <>
              <ul
                ref={listRef}
                tabIndex={-1}
                aria-labelledby={titleId}
                className="flex flex-col divide-y divide-border"
              >
                {rows.map((r) => (
                  <ProblemRow key={r.symbol} row={r} onStopFollowing={() => undefined} />
                ))}
              </ul>
              {pageFailure !== null ? (
                <>
                  <output className="text-sm">{readFailed(MORE_PROBLEMS, pageFailure)}</output>
                  <Button ref={tryRef} variant="outline" onClick={onReread}>
                    {TRY_AGAIN}
                  </Button>
                </>
              ) : cursor !== null ? (
                <Button
                  ref={moreRef}
                  variant="outline"
                  aria-busy={pagePending || undefined}
                  onClick={() => void showMore()}
                >
                  {SHOW_MORE}
                </Button>
              ) : null}
            </>
          )}
          <output aria-live="polite" className="sr-only">
            <span key={announcement.serial}>{announcement.text}</span>
          </output>
        </CardContent>
      </Card>
    </section>
  );
}
