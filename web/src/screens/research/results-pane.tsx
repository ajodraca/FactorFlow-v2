import { type JSX, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ClassificationSummary, LaterSet } from "../../api/classification-types";
import { listAcquisitionRuns } from "../../api/client";
import type { ResearchQuery } from "../../api/research-query";
import type { AcquisitionRun } from "../../api/types";
import { useHealth } from "../../app/status-region";
import { AsOfLine } from "../../components/patterns/as-of-line";
import { NotCurrentBanner } from "../../components/patterns/not-current-banner";
import { SelectionTray } from "../../components/patterns/selection-tray";
import { StatusBadge } from "../../components/patterns/status-badge";
import { CELL, FILTERS, REGIONS, RESULTS, SCORE_SET, SHELL_ROUTES } from "./copy";
import { formatTimestamp } from "./format";
import type { Notice } from "./notices";
import { type EmptyKind, type FirstPage, ResultsTable } from "./results-table";
import { SaveAsUniverse } from "./save-as-universe-dialog";

/**
 * The Research screen's Results card (AC-11, AC-12, AC-14, AC-20, AC-21;
 * DAC-E4-2, DAC-E4-3, DAC-E4-4, DAC-E4-S9-1, DAC-E4-S9-2, DAC-E4-S9-5; DEC-0170).
 * `ResultsPane` is the Research screen's own (`index.tsx` mounts it); a
 * universe's Members tab composes `ResultsTable` directly.
 *
 * Top to bottom: the not-current banner, the header (the one `h1`, the as-of
 * line and **Save these {n} as a universe…**), the table, the STD-UI-18
 * footnote once, then the selection tray. The host owns every state and passes
 * it in.
 *
 * Sources of each figure (Open Gap 1): the `h1`'s count, the as-of line's set
 * and Save's `matchCount` and `setId` are the list result's (they describe the
 * rows on screen); the banner's and the *Updating* mark's `later` is the poll
 * summary's, and the list result's only while the first poll is pending. A
 * summary whose `later` is null clears both at once.
 *
 * Built on the shipped S1 to S8 exports: `ResultsTable` (its `onResult` hands
 * the whole first page, `FirstPage`, rows included, and `onInspect` is
 * required, so the pane passes a named no-op: the inspector reads the
 * immediate selection, DEC-0164, DEC-0170), `NotCurrentBanner`, `AsOfLine`,
 * `SelectionTray` and `SaveAsUniverse`. `incompleteCount` stays `null`: the
 * first page does not carry every matching row, and the design omits the
 * *including* clause rather than guess (STD-UI-15). The pane has no state of
 * its own beyond the `h1` ref, no `fetch`, no storage and no time formatting.
 */

/** The first page the table hands the host: the figures the pane's header, line and banner read. */
export type ResearchResult = FirstPage;

export interface ResultsPaneProps {
  query: ResearchQuery;
  onQueryChange: (query: ResearchQuery) => void;
  onClear: () => void;
  refreshKey: number;
  result: ResearchResult | null;
  onResult: (result: ResearchResult) => void;
  summary: ClassificationSummary | null;
  checkedAt: string | null;
  pollFailed: boolean;
  onTryAgain: () => void;
  announcement: string | null;
  selected: string | null;
  onSelect: (symbol: string) => void;
  checked: string[];
  onCheckedChange: (checked: string[]) => void;
  onAddToUniverse: () => void;
  onOpenEarlierSets: () => void;
  onNotify: (notice: Notice) => void;
}

/**
 * The table fires `onInspect` 150 ms after a selection, but the inspector
 * waits 150 ms itself and takes the immediate symbol, so wiring this would
 * make the wait 300 ms (DEC-0164, DEC-0170).
 */
function NO_INSPECT(): void {
  // Deliberately empty.
}

/** The as-of line's *sorted by* label: *symbol* for the default order, else the sorted factor's name. */
function sortLabelFor(query: ResearchQuery): string {
  const key = query.sort?.key ?? "symbol";
  const factor = key.split("_")[0] as keyof typeof RESULTS.sortLabels;
  return RESULTS.sortLabels[factor];
}

/** The sentence for a download's state (Open Gap 2): one `copy.ts` sentence per state. */
function downloadSentence(download: AcquisitionRun, started: string): string {
  const ended = download.endedAt === null ? "" : formatTimestamp(download.endedAt);
  switch (download.state) {
    case "requested":
    case "running":
      return RESULTS.latestDownloadRunning(started);
    case "cancelling":
      return RESULTS.latestDownloadCancelling(started);
    case "succeeded":
      return RESULTS.latestDownloadComplete(started, ended);
    case "partial":
      return RESULTS.latestDownloadPartial(started, ended);
    case "failed":
      return RESULTS.latestDownloadFailed(
        started,
        ended,
        download.failureReason ?? SCORE_SET.noReasonRecorded,
      );
    case "cancelled":
      return RESULTS.latestDownloadCancelled(started, ended);
    case "abandoned":
      return RESULTS.latestDownloadAbandoned(started, ended);
  }
}

/** The latest download's line, its start time the link to the download (DEC-0171). */
function LatestDownload({ download }: { download: AcquisitionRun }): JSX.Element {
  const started = formatTimestamp(download.startedAt ?? download.requestedAt);
  const sentence = downloadSentence(download, started);
  const at = sentence.indexOf(started);
  return (
    <p data-testid="latest-download" className="text-sm">
      {sentence.slice(0, at)}
      <Link to={SHELL_ROUTES.download(download.runId)} className="font-numeric underline">
        {started}
      </Link>
      {sentence.slice(at + started.length)}
    </p>
  );
}

/** The first set's state, from the same `later` the banner reads: Updating, or Score update failed. */
function FirstSetState({ later }: { later: LaterSet }): JSX.Element {
  if (later.state === "building") {
    return (
      <p className="flex flex-col items-start gap-2 text-sm">
        <StatusBadge tier="active">{SCORE_SET.updating}</StatusBadge>
        {RESULTS.firstSetBuilding(formatTimestamp(later.runStartedAt))}
      </p>
    );
  }
  return (
    <p className="flex flex-col items-start gap-2 text-sm">
      <StatusBadge tier="critical">{SCORE_SET.scoreUpdateFailed}</StatusBadge>
      {RESULTS.firstSetFailed(
        formatTimestamp(later.endedAt ?? later.startedAt),
        later.failureReason ?? SCORE_SET.noReasonRecorded,
      )}
    </p>
  );
}

/**
 * The never-populated body (AC-22, DAC-E4-2, DAC-E4-S9-1; DEC-0170, DEC-0171;
 * Open Gaps 2 and 7): *No stocks have been scored yet.*, the first set's state,
 * the poll-failure sentence with **Try again**, the latest download and a link
 * to Data health. The first set's failed attempt offers nothing to retry
 * (STD-UI-2); the only control is the poll's own **Try again**.
 */
function NeverPopulatedBody({
  later,
  pollFailed,
  onTryAgain,
}: {
  later: LaterSet | null;
  pollFailed: boolean;
  onTryAgain: () => void;
}): JSX.Element {
  const recent = useHealth().health?.most_recent_run ?? null;
  const [download, setDownload] = useState<AcquisitionRun | null>(null);
  // The read repeats when the shell's health or the first set reports a change.
  const signal = [recent?.run_id, recent?.state, later?.state, later?.runId].join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: `signal` is the re-read trigger.
  useEffect(() => {
    let cancelled = false;
    listAcquisitionRuns({ limit: 1 })
      .then((page) => {
        if (!cancelled) {
          setDownload(page.runs[0] ?? null);
        }
      })
      .catch(() => {
        // A secondary read: the line is omitted rather than an error shown.
        if (!cancelled) {
          setDownload(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [signal]);

  return (
    <div data-testid="never-populated" className="flex flex-col items-start gap-3 py-3">
      <p>{RESULTS.neverScored}</p>
      {later === null ? null : <FirstSetState later={later} />}
      <output aria-live="polite" data-testid="never-populated-status" className="text-sm">
        {pollFailed ? SCORE_SET.couldNotCheck : null}
      </output>
      {pollFailed ? (
        <button
          type="button"
          onClick={onTryAgain}
          className="rounded border border-border px-2 py-1 text-xs"
        >
          {RESULTS.tryAgain}
        </button>
      ) : null}
      {download === null ? null : <LatestDownload download={download} />}
      <Link to={SHELL_ROUTES.dataHealth} className="text-sm underline">
        {RESULTS.openDataHealth}
      </Link>
    </div>
  );
}

export function ResultsPane({
  query,
  onQueryChange,
  onClear,
  refreshKey,
  result,
  onResult,
  summary,
  checkedAt,
  pollFailed,
  onTryAgain,
  announcement,
  selected,
  onSelect,
  checked,
  onCheckedChange,
  onAddToUniverse,
  onOpenEarlierSets,
  onNotify,
}: ResultsPaneProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scored = result !== null && !result.neverClassified;
  // The list result's `later` only while the first summary poll is pending.
  const later = summary ? summary.later : (result?.later ?? null);

  function empty(kind: EmptyKind): ReactNode {
    if (kind === "never-populated") {
      return <NeverPopulatedBody later={later} pollFailed={pollFailed} onTryAgain={onTryAgain} />;
    }
    return (
      <div className="flex flex-col items-start gap-2">
        <p>{RESULTS.noMatch}</p>
        <button
          type="button"
          data-variant="ghost"
          onClick={() => {
            onClear();
            headingRef.current?.focus();
          }}
          className="rounded px-3 py-2 text-sm underline"
        >
          {FILTERS.clearFilters}
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label={REGIONS.results}
      className="flex min-w-[40rem] flex-1 flex-col gap-4 rounded border border-border bg-card p-4 text-card-foreground"
    >
      <NotCurrentBanner set={result?.set ?? summary?.set ?? null} later={later} />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 ref={headingRef} tabIndex={-1} className="text-lg">
            {scored ? RESULTS.stocksMatch(result.matchCount) : RESULTS.title}
          </h1>
          <AsOfLine
            set={result?.set ?? null}
            later={later}
            checkedAt={checkedAt}
            pollFailed={pollFailed}
            onTryAgain={onTryAgain}
            announcement={announcement}
            sortLabel={sortLabelFor(query)}
            onOpenEarlierSets={onOpenEarlierSets}
            loading={result === null && summary === null}
          />
        </div>
        {scored ? (
          <SaveAsUniverse
            query={query}
            matchCount={result.matchCount}
            setId={result.set?.setId ?? null}
            incompleteCount={null}
            onNotify={onNotify}
          />
        ) : null}
      </header>
      <ResultsTable
        query={query}
        onQueryChange={onQueryChange}
        refreshKey={refreshKey}
        selected={selected}
        onSelect={onSelect}
        onInspect={NO_INSPECT}
        checked={checked}
        onCheckedChange={onCheckedChange}
        onResult={onResult}
        empty={empty}
      />
      {scored && result.matchCount > 0 ? (
        <p className="text-xs text-muted-foreground">{CELL.coverageStatement}</p>
      ) : null}
      <SelectionTray checked={checked} onAddToUniverse={onAddToUniverse} />
    </section>
  );
}
