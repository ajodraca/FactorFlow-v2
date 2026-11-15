import { Fragment, type JSX, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { CurrentSet, LaterSet, RunOutcome } from "../../api/classification-types";
import { RESULTS, SCORE_SET, SHELL_ROUTES } from "../../screens/research/copy";
import { formatTimestamp } from "../../screens/research/format";
import { cn } from "../ui/utils";
import { StatusBadge, type StatusTier } from "./status-badge";

/**
 * The as-of line under a scored surface's title (UX design 1.2; classification-ui
 * 2.6; AC-21; DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-3, DAC-E4-S4-4): *Scores from
 * {time} · from the download started {time}*, the start time linked to the
 * download's detail and never a number or UUID (DEC-0083), the download's
 * outcome badge, the optional *sorted by* clause, *Updating* with *checked
 * {time}* while a later set builds (STD-UI-25), **Earlier sets…** when the host
 * supplies the dialog (DEC-0154) and, after a failed poll, *Could not check for
 * newer scores.* with **Try again** (DEC-0155). Every time is in the numeric
 * face, and the *Updating* badge carries the building set's start time as its
 * tooltip (UX design 1.2, Token Usage and Section 1.2).
 *
 * The line holds exactly one polite live region, an `output`, which carries
 * only what should be announced: the completion announcement, *Updating*, the
 * never-changing **Earlier sets…** button and the failed-poll sentence
 * (STD-UI-24). The 10-second *checked* tick, the link, the outcome badge and
 * **Try again** sit outside it. `aria-atomic` is set to `false` explicitly:
 * `role="status"` is atomic by default, and an atomic region would re-read the
 * retained announcement whenever *Updating* or the failure text toggles
 * (CAP-002-E4-S4 Open Gap 6).
 *
 * CAP-002 delivered this file for the Research line alone; CAP-003
 * `ui-components` took it over (owner decision 2026-10-25; DAC-E1-13). The
 * Research line now composes the generic `AsOfLine`, whose parts are joined by
 * the pattern's own separator, and renders the same text it always did.
 */

export interface AsOfLineProps {
  set: CurrentSet | null;
  later: LaterSet | null;
  /** The ISO-8601 instant of the last successful poll read, `null` before the first (DEC-0153). */
  checkedAt: string | null;
  pollFailed: boolean;
  onTryAgain: () => void;
  announcement?: string | null;
  /** Omitted on compare and evidence, which have no sort. */
  sortLabel?: string;
  /** The set-history dialog is CAP-002-E4-S9's; without a handler the button is absent. */
  onOpenEarlierSets?: () => void;
  /** With `set` null, renders the line's skeleton at its final height (UX design 1.2, Loading). */
  loading?: boolean;
}

/**
 * The one height the line and its skeleton share, so the skeleton stands in at
 * the line's final height and the table beneath does not shift (UX design 1.2,
 * Loading; DEC-0154).
 */
const LINE_HEIGHT = "min-h-7";

const OUTCOME: Record<RunOutcome, { tier: StatusTier; word: string }> = {
  succeeded: { tier: "good", word: SCORE_SET.complete },
  partial: { tier: "warning", word: SCORE_SET.partial },
};

/** *Scores from {time}*: the words, then the produced time in the numeric face. */
function ScoresFromPart({ set }: { set: CurrentSet }): JSX.Element {
  const produced = formatTimestamp(set.endedAt);
  const scores = SCORE_SET.scoresFrom(produced);
  return (
    <>
      {scores.slice(0, scores.length - produced.length)}
      <span className="font-numeric">{produced}</span>
    </>
  );
}

/** *from the download started {time}*, the start time linked to the run, then the outcome badge. */
function DownloadPart({
  set,
  outcome,
}: {
  set: CurrentSet;
  outcome: { tier: StatusTier; word: string };
}): JSX.Element {
  const started = formatTimestamp(set.runStartedAt);
  const clause = SCORE_SET.fromTheDownloadStarted(started);
  return (
    <>
      {clause.slice(0, clause.length - started.length)}
      <Link
        to={SHELL_ROUTES.download(set.runId)}
        aria-label={SCORE_SET.openDownload(started)}
        className="font-numeric underline"
      >
        {started}
      </Link>{" "}
      <StatusBadge tier={outcome.tier}>{outcome.word}</StatusBadge>
    </>
  );
}

function LiveRegion({
  announcement,
  buildingSince,
  pollFailed,
  onOpenEarlierSets,
}: {
  announcement: string | null;
  /** The building set's formatted start time, or `null` when no set builds. */
  buildingSince: string | null;
  pollFailed: boolean;
  onOpenEarlierSets?: () => void;
}): JSX.Element {
  return (
    // An `output` carries `role="status"` implicitly, as the delivered
    // unreachable state relies on; the explicit polite and non-atomic
    // attributes are what this region needs beyond the default.
    <output aria-live="polite" aria-atomic="false" data-testid="as-of-line-status">
      {announcement ? (
        <>
          {" "}
          <span>{announcement}</span>
        </>
      ) : null}
      {buildingSince !== null ? (
        <>
          {" "}
          <StatusBadge tier="active" title={buildingSince}>
            {SCORE_SET.updating}
          </StatusBadge>
        </>
      ) : null}
      {onOpenEarlierSets ? (
        <>
          {" "}
          <button
            type="button"
            data-variant="ghost"
            onClick={onOpenEarlierSets}
            className="rounded px-2 py-1 text-xs underline"
          >
            {SCORE_SET.earlierSetsAction}
          </button>
        </>
      ) : null}
      {pollFailed ? (
        <>
          {" "}
          <br />
          {SCORE_SET.couldNotCheck}
        </>
      ) : null}
    </output>
  );
}

/**
 * The Research line, or `null` with no set (the never-populated body has no
 * line), or its skeleton while the first read is pending (DEC-0154).
 */
function ResearchAsOfLine({
  set,
  later,
  checkedAt,
  pollFailed,
  onTryAgain,
  announcement = null,
  sortLabel,
  onOpenEarlierSets,
  loading = false,
}: AsOfLineProps): JSX.Element | null {
  if (set === null) {
    return loading ? (
      <div
        data-testid="as-of-line-skeleton"
        aria-hidden="true"
        className={`${LINE_HEIGHT} w-full animate-pulse rounded bg-secondary`}
      />
    ) : null;
  }
  const building = later?.state === "building";
  const buildingSince = later?.state === "building" ? formatTimestamp(later.startedAt) : null;
  const outcome = OUTCOME[set.runOutcome];
  // What follows the last part, with no separator: the *checked* time while a
  // later set builds, the live region and, after a failed poll, **Try again**.
  const tail = (
    <>
      {building && checkedAt !== null ? (
        <>
          {" "}
          <span className="font-numeric">
            {SCORE_SET.checked(formatTimestamp(checkedAt, { seconds: true }))}
          </span>
        </>
      ) : null}
      <LiveRegion
        announcement={announcement}
        buildingSince={buildingSince}
        pollFailed={pollFailed}
        onOpenEarlierSets={onOpenEarlierSets}
      />
      {pollFailed ? (
        <>
          {" "}
          <button
            type="button"
            onClick={onTryAgain}
            className="rounded border border-border px-2 py-1 text-xs"
          >
            {RESULTS.tryAgain}
          </button>
        </>
      ) : null}
    </>
  );
  const download = <DownloadPart set={set} outcome={outcome} />;
  return (
    <AsOfLine
      className={LINE_HEIGHT}
      parts={
        sortLabel === undefined
          ? [
              <ScoresFromPart key="scores" set={set} />,
              <Fragment key="download">
                {download}
                {tail}
              </Fragment>,
            ]
          : [
              <ScoresFromPart key="scores" set={set} />,
              download,
              <Fragment key="sort">
                {SCORE_SET.sortedBy(sortLabel)}
                {tail}
              </Fragment>,
            ]
      }
    />
  );
}

/**
 * The generic form's props (component design `ui-components` 2.1; DAC-E1-13;
 * DEC-0315): the parts of one as-of line, at least one, and the host's own
 * classes.
 */
export interface AsOfLinePartsProps {
  parts: readonly [ReactNode, ...ReactNode[]];
  className?: string;
}

/**
 * The separator between two parts. The spaces sit inside an `inline-block`: they
 * keep the word boundaries in the text a screen reader and `textContent` read,
 * and an inline-block drops collapsible spaces at the start and end of its own
 * line, so the visible gap is the `--space-2` padding alone.
 */
const SEPARATOR = " · ";

/**
 * The as-of line, one pattern for every surface (blueprint 4.8; AC-26;
 * DAC-E1-13, DAC-E1-S10-1; DEC-0315). With `parts` it renders them in one `p`
 * at `--text-xs` `--muted-foreground`, each part after the first preceded by
 * the middle-dot separator with `--space-2` either side, so a screen reader
 * reads one line. With the Research props it renders the Research line.
 */
export function AsOfLine(props: AsOfLineProps | AsOfLinePartsProps): JSX.Element | null {
  if ("parts" in props) {
    return (
      <p data-testid="as-of-line" className={cn("text-xs text-muted-foreground", props.className)}>
        {props.parts.map((part, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder.
          <Fragment key={index}>
            {index > 0 ? <span className="inline-block px-2">{SEPARATOR}</span> : null}
            {part}
          </Fragment>
        ))}
      </p>
    );
  }
  return <ResearchAsOfLine {...props} />;
}
