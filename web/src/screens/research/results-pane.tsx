import { type JSX, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ClassificationSummary, FactorName, LaterSet } from "../../api/classification-types";
import { listAcquisitionRuns } from "../../api/client";
import type { ResearchQuery, SortKey } from "../../api/research-query";
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

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/**
 * The first page the table reports through `onResult` (CAP-002-E4-S6's
 * `FirstPage`): `neverClassified`, `set`, `later`, `factors` and
 * `matchCount` drive the heading, the as-of line, the banner and Save, and
 * the page's `stocks` and `nextCursor` say whether every match is loaded
 * (DEC-0170, DEC-0274).
 */
export type ResearchResult = Pick<
  FirstPage,
  "neverClassified" | "set" | "later" | "factors" | "matchCount" | "stocks" | "nextCursor"
>;

export interface ResultsPaneProps {
  /** The URL's query; the screen's one `useResearchQuery` owns it (DAC-E4-3). */
  query: ResearchQuery;
  onQueryChange: (query: ResearchQuery) => void;
  /** The nothing-found body's **Clear filters**: the screen's `clear`. */
  onClear: () => void;
  /** Bumped once per new complete set (DEC-0062). */
  refreshKey: number;
  /** The table's latest first page, `null` until the first arrives. */
  result: ResearchResult | null;
  onResult: (page: FirstPage) => void;
  /** The score-set poll's state (`useScoreSetPoll`, CAP-002-E4-S4). */
  summary: ClassificationSummary | null;
  checkedAt: string | null;
  pollFailed: boolean;
  onTryAgain: () => void;
  announcement: string | null;
  selected: string | null;
  onSelect: (symbol: string) => void;
  checked: string[];
  onCheckedChange: (checked: string[]) => void;
  onAddToUniverse: (symbols: string[]) => void;
  onOpenEarlierSets: () => void;
  onNotify: (notice: Notice) => void;
}

/**
 * The table's `onInspect` is required, but it is not the inspector's trigger:
 * `InspectorPanel` debounces the immediate `selected` itself, and wiring this
 * notification into it would make the wait 300 ms (DEC-0164, DEC-0170).
 */
const NO_INSPECT = (): void => undefined;

/** The as-of line's *sorted by* column for each sort key (Open Gaps, owner-directed fix E4-F17). */
const SORT_LABEL: Record<SortKey, string> = {
  symbol: SCORE_SET.sortLabels.symbol,
  value_percentile: SCORE_SET.sortLabels.value,
  value_score: SCORE_SET.sortLabels.value,
  growth_percentile: SCORE_SET.sortLabels.growth,
  growth_score: SCORE_SET.sortLabels.growth,
  momentum_percentile: SCORE_SET.sortLabels.momentum,
  momentum_score: SCORE_SET.sortLabels.momentum,
};

/** *symbol* for the default order (the API lists by symbol), otherwise the sorted column. */
function sortLabelOf(sort: ResearchQuery["sort"]): string {
  return sort === null ? SCORE_SET.sortLabels.symbol : SORT_LABEL[sort.key];
}

/** The reason codes that make a score incomplete: the hide-incomplete set (UX design 1.1 item 4). */
const INCOMPLETE_REASONS: ReadonlySet<string> = new Set(Object.keys(CELL.incompleteStatus));

/**
 * Save's *including {m} with an incomplete score*: counted over the rows only
 * when the first page holds every match, otherwise `null` so the clause is
 * omitted rather than guessed (classification-ui 2.7; STD-UI-15; DEC-0274).
 */
function incompleteCountOf(result: ResearchResult): number | null {
  if (result.nextCursor !== null || result.stocks.length !== result.matchCount) {
    return null;
  }
  return result.stocks.filter((row) =>
    FACTORS.some((factor) => {
      const cell = row.factors[factor];
      return (
        cell.status === "not_classified" &&
        cell.reasonCode !== null &&
        INCOMPLETE_REASONS.has(cell.reasonCode)
      );
    }),
  ).length;
}

/**
 * The Research screen's Results card (UX design 1.1 and 1.2; classification-ui
 * 2.3 to 2.7; AC-12, AC-20, AC-21, AC-22; DAC-E4-2, DAC-E4-3, DAC-E4-S9-1,
 * DAC-E4-S9-2, DAC-E4-S9-5; DEC-0170, DEC-0171, DEC-0274), presentational:
 * the screen (`index.tsx`) owns every state it shows. It is the Research
 * screen's alone; the universe Members tab composes `ResultsTable` directly.
 *
 * Top to bottom inside the `section` labelled *Results*: the not-current
 * banner; the header, holding the `h1` with the as-of line under it and
 * **Save these {n} as a universe…** to its right; the table; the STD-UI-18
 * footnote, once, whenever scored rows show; and the selection tray.
 *
 * Where each figure comes from (DEC-0170): the `h1` count, the as-of line's
 * set and Save's `setId` and count are the list result's, so they describe
 * the rows on screen; the banner's and the never-populated body's `later` is
 * the poll summary's, the list's only while the first summary read is
 * pending, so a summary reporting no later set clears the banner at once.
 * The `h1` reads the screen title until a scored result exists, and the as-of
 * line holds its final-height skeleton until the first page arrives, unless
 * the summary already says nothing has been scored (UX design 1.2 Loading;
 * DEC-0276).
 *
 * Built on the shipped exports (T011): CAP-002-E4-S4's `NotCurrentBanner`
 * and `AsOfLine` (its `sortLabel` always given on Research), CAP-002-E4-S6's
 * `ResultsTable`, `FirstPage` and `EmptyKind` (`onInspect` required, passed
 * `NO_INSPECT`; `onResult` hands the whole first page, rows included),
 * CAP-002-E4-S7's `SelectionTray`, CAP-002-E4-S8's `SaveAsUniverse` and
 * `Notice`, `copy.ts`'s `RESULTS`, `SCORE_SET`, `CELL`, `FILTERS`,
 * `REGIONS` and `SHELL_ROUTES`, `format.ts`'s `formatTimestamp`, S4's
 * `StatusBadge` for the first set's badge, the delivered `useHealth` and
 * `listAcquisitionRuns` for the latest download (DEC-0171), whose run-state
 * words match the delivered run screens' `RUN_STATE_LABEL` (Cancelling,
 * Partial, Cancelled, Abandoned), so no word is substituted. Nothing here
 * calls `fetch` directly, stores anything or formats a time itself.
 */
export function ResultsPane(props: ResultsPaneProps): JSX.Element {
  const { query, result, summary, checked } = props;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const later: LaterSet | null = summary ? summary.later : (result?.later ?? null);
  const scored = result !== null && !result.neverClassified;

  const empty = (kind: EmptyKind): ReactNode =>
    kind === "never-populated" ? (
      <NeverPopulatedBody
        later={later}
        pollFailed={props.pollFailed}
        onTryAgain={props.onTryAgain}
      />
    ) : (
      <NoMatchBody
        onClear={() => {
          props.onClear();
          // The body and its button leave once the filters clear; focus goes to
          // the heading rather than the document (DEC-0157, DEC-0170).
          headingRef.current?.focus();
        }}
      />
    );

  return (
    <section
      aria-label={REGIONS.results}
      className="flex min-w-[var(--measure-prose)] flex-1 flex-col gap-3 rounded border border-border bg-card p-4 text-card-foreground"
    >
      <NotCurrentBanner set={result?.set ?? summary?.set ?? null} later={later} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 ref={headingRef} tabIndex={-1} className="text-lg">
            {scored ? RESULTS.stocksMatch(result.matchCount) : RESULTS.screenTitle}
          </h1>
          {result?.neverClassified === true ? null : (
            <AsOfLine
              set={result?.set ?? null}
              later={later}
              checkedAt={props.checkedAt}
              pollFailed={props.pollFailed}
              onTryAgain={props.onTryAgain}
              announcement={props.announcement}
              sortLabel={sortLabelOf(query.sort)}
              onOpenEarlierSets={props.onOpenEarlierSets}
              loading={result === null && summary?.neverClassified !== true}
            />
          )}
        </div>
        {scored ? (
          <SaveAsUniverse
            query={query}
            matchCount={result.matchCount}
            setId={result.set?.setId ?? null}
            incompleteCount={incompleteCountOf(result)}
            onNotify={props.onNotify}
          />
        ) : null}
      </div>
      <ResultsTable
        query={query}
        onQueryChange={props.onQueryChange}
        refreshKey={props.refreshKey}
        selected={props.selected}
        onSelect={props.onSelect}
        onInspect={NO_INSPECT}
        checked={checked}
        onCheckedChange={props.onCheckedChange}
        onResult={props.onResult}
        empty={empty}
      />
      {scored && result.matchCount > 0 ? (
        <p className="text-xs text-muted-foreground">{CELL.coverageStatement}</p>
      ) : null}
      <SelectionTray checked={checked} onAddToUniverse={props.onAddToUniverse} />
    </section>
  );
}

/**
 * Before any score exists: never an empty table (UX design 1.1 States;
 * classification-ui 2.6; AC-20, AC-22; DAC-E4-2, DAC-E4-S9-1; DEC-0155,
 * DEC-0171). Top to bottom: the never-scored sentence; the first
 * set's state from `later` (the banner's source), *Updating* or *Score update
 * failed* with its sentence, none when no set has started; the poll-failure
 * row, a polite status always present, holding the could-not-check
 * sentence after a failed summary read, with **Try again** outside it
 * in the as-of line's own classes (`rounded border border-border px-2 py-1
 * text-xs`, the shipped `AsOfLine`'s, recorded at T011); the latest download;
 * and *Open Data health*. The first set's failed attempt offers nothing to
 * retry (STD-UI-2).
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
  return (
    <div data-testid="never-populated-body" className="flex flex-col gap-2 text-sm">
      <p>{RESULTS.neverScored}</p>
      {later === null ? null : <FirstSetState later={later} />}
      <output aria-live="polite">{pollFailed ? SCORE_SET.couldNotCheck : null}</output>
      {pollFailed ? (
        <button
          type="button"
          onClick={onTryAgain}
          className="w-fit rounded border border-border px-2 py-1 text-xs"
        >
          {RESULTS.tryAgain}
        </button>
      ) : null}
      <LatestDownload later={later} />
      <Link to={SHELL_ROUTES.dataHealth} className="w-fit underline">
        {RESULTS.openDataHealth}
      </Link>
    </div>
  );
}

/** The first set's state, exactly as a later set's is shown (UX design 1.2; DEC-0082). */
function FirstSetState({ later }: { later: LaterSet }): JSX.Element {
  if (later.state === "building") {
    return (
      <p className="flex flex-wrap items-center gap-2">
        <StatusBadge tier="active" title={formatTimestamp(later.startedAt)}>
          {SCORE_SET.updating}
        </StatusBadge>
        <span>{RESULTS.firstSetBuilding(formatTimestamp(later.runStartedAt))}</span>
      </p>
    );
  }
  // A failed set always records its end time and reason; the fallbacks cover
  // the nullable wire types only, as the banner's do (DEC-0232).
  return (
    <p className="flex flex-wrap items-center gap-2">
      <StatusBadge tier="critical">{SCORE_SET.scoreUpdateFailed}</StatusBadge>
      <span>
        {RESULTS.firstSetFailed(
          formatTimestamp(later.endedAt ?? later.startedAt),
          later.failureReason ?? SCORE_SET.noReasonRecorded,
        )}
      </span>
    </p>
  );
}

/** The sentence for a download in `run.state`, or `null` when an ended one has no end time. */
function latestDownloadSentence(run: AcquisitionRun, started: string): string | null {
  switch (run.state) {
    case "requested":
    case "running":
      return RESULTS.latestDownloadRunning(started);
    case "cancelling":
      return RESULTS.latestDownloadCancelling(started);
    default:
      break;
  }
  if (run.endedAt === null) {
    return null;
  }
  const ended = formatTimestamp(run.endedAt);
  switch (run.state) {
    case "succeeded":
      return RESULTS.latestDownloadComplete(started, ended);
    case "partial":
      return RESULTS.latestDownloadPartial(started, ended);
    case "failed":
      return RESULTS.latestDownloadFailed(
        started,
        ended,
        run.failureReason ?? SCORE_SET.noReasonRecorded,
      );
    case "cancelled":
      return RESULTS.latestDownloadCancelled(started, ended);
    case "abandoned":
      return RESULTS.latestDownloadAbandoned(started, ended);
  }
}

/**
 * The latest download's state (DEC-0171): one `listAcquisitionRuns({ limit: 1
 * })` read on mount, and again when the shell's health reports a different
 * latest download or state, or the first set's state or download changes,
 * so *Downloading* becomes *ended Complete* without a reload and no timer is
 * added. Health arriving for the first time is not a change: the mount read
 * already saw it. Omitted, with no error, when there is no download or the
 * read fails. The start time (`startedAt`, or `requestedAt` before the
 * download starts) is the link to the download's detail.
 */
function LatestDownload({ later }: { later: LaterSet | null }): JSX.Element | null {
  const { health } = useHealth();
  const latestRun = health?.most_recent_run ?? null;
  const runSignal = health === null ? null : `${latestRun?.run_id ?? ""}:${latestRun?.state ?? ""}`;
  const laterSignal = `${later?.state ?? ""}:${later?.runId ?? ""}`;
  const [generation, setGeneration] = useState(0);
  const [run, setRun] = useState<AcquisitionRun | null>(null);
  const seen = useRef<{ run: string | null; later: string } | null>(null);

  useEffect(() => {
    const previous = seen.current;
    seen.current = { run: runSignal, later: laterSignal };
    if (previous === null) {
      return;
    }
    const runChanged = previous.run !== null && previous.run !== runSignal;
    if (runChanged || previous.later !== laterSignal) {
      setGeneration((count) => count + 1);
    }
  }, [runSignal, laterSignal]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: each generation is one read.
  useEffect(() => {
    let cancelled = false;
    listAcquisitionRuns({ limit: 1 }).then(
      (page) => {
        if (!cancelled) {
          setRun(page.runs[0] ?? null);
        }
      },
      () => {
        // A secondary line: a failed read omits it rather than showing an
        // error, as the delivered Coverage screen treats its secondary reads
        // (DEC-0171). The primary facts above come from `later`.
        if (!cancelled) {
          setRun(null);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [generation]);

  if (run === null) {
    return null;
  }
  const started = formatTimestamp(run.startedAt ?? run.requestedAt);
  const sentence = latestDownloadSentence(run, started);
  if (sentence === null) {
    return null;
  }
  // The sentence's first time is the start time: it becomes the link.
  const at = sentence.indexOf(started);
  return (
    <p data-testid="latest-download">
      {sentence.slice(0, at)}
      <Link
        to={SHELL_ROUTES.download(run.runId)}
        aria-label={SCORE_SET.openDownload(started)}
        className="font-numeric underline"
      >
        {started}
      </Link>
      {sentence.slice(at + started.length)}
    </p>
  );
}

/** The nothing-found sentence with **Clear filters** (UX design 1.1 States). */
function NoMatchBody({ onClear }: { onClear: () => void }): JSX.Element {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{RESULTS.noMatch}</span>
      <button
        type="button"
        data-variant="ghost"
        onClick={onClear}
        className="rounded px-3 py-2 text-sm"
      >
        {FILTERS.clearFilters}
      </button>
    </div>
  );
}
