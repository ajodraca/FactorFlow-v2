import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAcquisitionRuns } from "../../api/client";
import type { AcquisitionRun } from "../../api/types";
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
import { SkeletonLine } from "./check-card";
import {
  ABSENT,
  DOWNLOAD_COLUMNS,
  RECENT_DOWNLOADS,
  interruptedResult,
  partialResult,
  recentDownloadsSubline,
  writtenOf,
} from "./copy";

type ListState = { kind: "loading" } | { kind: "ok"; runs: AcquisitionRun[] };

function rowId(run: AcquisitionRun): string {
  return run.runId;
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
 * DAC-E6-S4-1, AC-12, AC-25): the five newest downloads as a compact table with
 * *Started* as the row header, and the time the list last answered beside the
 * title. A *Partial* or *Interrupted* download is never worded as complete.
 */
export function RecentDownloads(): JSX.Element {
  const headingId = useId();
  const [list, setList] = useState<ListState>({ kind: "loading" });
  const [answeredAt, setAnsweredAt] = useState<Date | null>(null);

  useEffect(() => {
    listAcquisitionRuns({ limit: 5 }).then((page) => {
      setList({ kind: "ok", runs: page.runs });
      setAnsweredAt(new Date());
    });
  }, []);

  const columns = useMemo<ColumnDef<AcquisitionRun>[]>(
    () => [
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
          return <StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>;
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
        cell: ({ row }) => resultOf(row.original),
      },
    ],
    [],
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
          ) : (
            <DataTable
              variant="compact"
              rowHeader
              columns={columns}
              data={list.runs}
              getRowId={rowId}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
