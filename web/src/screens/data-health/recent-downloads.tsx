import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, ApiUnreachableError, listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun, RunState } from "../../api/types";
import { useShell } from "../../app/shell-context";
import { formatClock, formatCount, formatInstant } from "../../components/patterns/format";
import { Absent } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DataTable } from "../../components/ui/data-table";
import { Progress } from "../../components/ui/progress";
import { ReadFailure, SkeletonLine } from "./check-card";
import {
  ABSENT,
  DOWNLOAD_COLUMNS,
  READ_TARGETS,
  RECENT_DOWNLOADS,
  interruptedResult,
  partialResult,
  progressOf,
  readFailed,
  readFailureReason,
  recentDownloadsSubline,
  writtenOf,
} from "./copy";

type ListState =
  | { kind: "loading" }
  | { kind: "ok"; runs: AcquisitionRun[] }
  | { kind: "error"; error: ApiError | ApiUnreachableError };

/** The download states that are not outcomes (owner-shell 2.4). */
const NON_TERMINAL: ReadonlySet<RunState> = new Set<RunState>([
  "requested",
  "running",
  "cancelling",
]);

function rowId(run: AcquisitionRun): string {
  return run.runId;
}

/** A running download heads the list, then a queued one, then the outcomes (Resolved Conflict 3). */
function rank(state: RunState): number {
  switch (state) {
    case "running":
    case "cancelling":
      return 0;
    case "requested":
      return 1;
    default:
      return 2;
  }
}

/** The *Result* sentence of a download that is not showing progress (data-health-ui 2.6; AC-12). */
function resultOf(run: AcquisitionRun): string {
  const written = formatCount(run.instrumentsWritten);
  const named = formatCount(run.instrumentsNamed);
  switch (run.state) {
    case "partial":
      return partialResult(written, named, formatCount(run.instrumentsFailed));
    case "abandoned":
      return interruptedResult(written);
    default:
      return writtenOf(written, named);
  }
}

/**
 * The Recent downloads card (component design data-health-ui 2.6; DAC-E6-14,
 * DAC-E6-S4-1, DAC-E6-S4-2, AC-12, AC-25, DEC-0384): the five newest downloads
 * as a compact table with *Started* as the row header, a running download first
 * with its progress, and the time the list last answered beside the title. The
 * list is read on load and again on each new attention answer while the latest
 * download is not finished, and never otherwise; no timer is set here. A
 * *Partial* or *Interrupted* download is never worded as complete.
 */
export function RecentDownloads(): JSX.Element {
  const headingId = useId();
  const idPrefix = useId();
  const { attention } = useShell();
  const [list, setList] = useState<ListState>({ kind: "loading" });
  const [answeredAt, setAnsweredAt] = useState<Date | null>(null);
  const latestCall = useRef(0);

  const latest = attention.kind === "ok" ? attention.data.latest_download : null;
  const active = latest !== null && NON_TERMINAL.has(latest.state);
  const answerKey = attention.kind === "ok" ? attention.checkedAt.getTime() : null;
  const seenKey = useRef(answerKey);

  const read = useCallback(() => {
    latestCall.current += 1;
    const mine = latestCall.current;
    listAcquisitionRuns({ limit: 5 }).then(
      (page) => {
        if (mine !== latestCall.current) {
          return;
        }
        setList({ kind: "ok", runs: page.runs });
        setAnsweredAt(new Date());
      },
      (cause: unknown) => {
        if (mine !== latestCall.current) {
          return;
        }
        if (!(cause instanceof ApiError || cause instanceof ApiUnreachableError)) {
          throw cause;
        }
        // DAC-E6-17: the body is replaced by the error; the last answered time stays.
        setList({ kind: "error", error: cause });
      },
    );
  }, []);

  useEffect(() => {
    read();
  }, [read]);

  useEffect(() => {
    if (answerKey === null || answerKey === seenKey.current) {
      return;
    }
    seenKey.current = answerKey;
    if (active) {
      read();
    }
  }, [answerKey, active, read]);

  const runningId = active ? latest.run_id : null;
  const done = active ? latest.progress.done : null;
  const total = active ? latest.progress.total : null;

  const columns = useMemo<ColumnDef<AcquisitionRun>[]>(() => {
    const outcomeId = (run: AcquisitionRun) => `${idPrefix}-outcome-${run.runId}`;
    const labelId = `${idPrefix}-progress`;
    return [
      {
        id: "started",
        header: DOWNLOAD_COLUMNS.started,
        cell: ({ row }) => (
          <Link to={`/data/downloads/${encodeURIComponent(row.original.runId)}`}>
            {formatInstant(row.original.startedAt ?? row.original.requestedAt)}
          </Link>
        ),
      },
      {
        id: "outcome",
        header: DOWNLOAD_COLUMNS.outcome,
        cell: ({ row }) => {
          const status = { of: "download", state: row.original.state } as const;
          return (
            <span id={outcomeId(row.original)}>
              <StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>
            </span>
          );
        },
      },
      {
        id: "ended",
        header: DOWNLOAD_COLUMNS.ended,
        cell: ({ row }) =>
          row.original.endedAt === null ? (
            <Absent label={ABSENT.notEnded} />
          ) : (
            formatInstant(row.original.endedAt)
          ),
      },
      {
        id: "result",
        header: DOWNLOAD_COLUMNS.result,
        cell: ({ row }) => {
          if (runningId !== row.original.runId || done === null) {
            return resultOf(row.original);
          }
          if (total === null) {
            // DEC-0384: no count exists yet, so the bar is named by the row's outcome label.
            return <Progress value={null} max={null} aria-labelledby={outcomeId(row.original)} />;
          }
          return (
            <>
              <span id={labelId} aria-live="polite">
                {progressOf(formatCount(done), formatCount(total))}
              </span>
              <Progress value={done} max={total} aria-labelledby={labelId} />
            </>
          );
        },
      },
    ];
  }, [idPrefix, runningId, done, total]);

  const ordered = useMemo(
    () => (list.kind === "ok" ? [...list.runs].sort((a, b) => rank(a.state) - rank(b.state)) : []),
    [list],
  );

  return (
    <section aria-labelledby={headingId}>
      <Card variant="default">
        <CardHeader>
          <CardTitle id={headingId}>{RECENT_DOWNLOADS}</CardTitle>
          <CardDescription className="text-xs">
            {recentDownloadsSubline(answeredAt && formatClock(answeredAt))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.kind === "loading" ? (
            <>
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine />
            </>
          ) : list.kind === "error" ? (
            <ReadFailure
              sentence={readFailed(READ_TARGETS.recentDownloads, readFailureReason(list.error))}
              onRetry={read}
            />
          ) : (
            <DataTable
              variant="compact"
              rowHeader
              columns={columns}
              data={ordered}
              getRowId={rowId}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
