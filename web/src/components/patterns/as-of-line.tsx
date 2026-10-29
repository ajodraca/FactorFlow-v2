import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { CurrentSet, LaterSet, RunOutcome } from "../../api/classification-types";
import { RESULTS, SCORE_SET, SHELL_ROUTES } from "../../screens/research/copy";
import { formatTimestamp } from "../../screens/research/format";

/**
 * The as-of line under a scored surface's title (UX design 1.2; classification-ui
 * 2.6; AC-21; DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-3, DAC-E4-S4-4): *Scores from
 * {time} · from the download started {time}*, the start time linked to the
 * download's detail and never a number or UUID (DEC-0083), the download's
 * outcome badge, the optional *sorted by* clause, *Updating* with *checked
 * {time}* while a later set builds (STD-UI-25), **Earlier sets…** when the host
 * supplies the dialog (DEC-0154) and, after a failed poll, *Could not check for
 * newer scores.* with **Try again** (DEC-0155).
 *
 * The line holds exactly one polite live region, an `output`, which carries
 * only what should be announced: the completion announcement, *Updating*, the
 * never-changing **Earlier sets…** button and the failed-poll sentence
 * (STD-UI-24). The 10-second *checked* tick, the link, the outcome badge and
 * **Try again** sit outside it. `aria-atomic` is set to `false` explicitly:
 * `role="status"` is atomic by default, and an atomic region would re-read the
 * retained announcement whenever *Updating* or the failure text toggles
 * (CAP-002-E4-S4 Open Gap 6).
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

type Tier = "good" | "warning" | "active";

const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";

const TIER_CLASSES: Record<Tier, string> = {
  good: "bg-status-good-muted text-status-good",
  warning: "bg-status-warning-muted text-status-warning",
  active: "bg-status-active-muted text-status-active",
};

/**
 * One shape per tier so the badges stay distinct in greyscale (STD-UI-8; UX
 * design 1.2, Accessibility): good a filled circle, warning a triangle, active
 * a ringed dot.
 */
const TIER_SHAPES: Record<Tier, JSX.Element> = {
  good: <circle cx="6" cy="6" r="5" fill="currentColor" />,
  warning: <path d="M6 1 11 11H1Z" fill="currentColor" />,
  active: (
    <>
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="2" fill="currentColor" />
    </>
  ),
};

function Badge({ tier, children }: { tier: Tier; children: string }): JSX.Element {
  return (
    <span data-variant={`status-${tier}`} className={`${BADGE} ${TIER_CLASSES[tier]}`}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        {TIER_SHAPES[tier]}
      </svg>
      {children}
    </span>
  );
}

const OUTCOME: Record<RunOutcome, { tier: Tier; word: string }> = {
  succeeded: { tier: "good", word: SCORE_SET.complete },
  partial: { tier: "warning", word: SCORE_SET.partial },
};

/** *Scores from {time} · from the download started {time}*, the start time linked to the run. */
function SetSentence({ set }: { set: CurrentSet }): JSX.Element {
  const started = formatTimestamp(set.runStartedAt);
  const clause = SCORE_SET.fromTheDownloadStarted(started);
  // The clause's words precede its time, which is the link.
  const words = clause.slice(0, clause.length - started.length);
  return (
    <>
      {SCORE_SET.scoresFrom(formatTimestamp(set.endedAt))}
      {SCORE_SET.separator}
      {words}
      <Link
        to={SHELL_ROUTES.download(set.runId)}
        aria-label={SCORE_SET.openDownload(started)}
        className="font-numeric underline"
      >
        {started}
      </Link>
    </>
  );
}

function LiveRegion({
  announcement,
  building,
  pollFailed,
  onOpenEarlierSets,
}: {
  announcement: string | null;
  building: boolean;
  pollFailed: boolean;
  onOpenEarlierSets?: () => void;
}): JSX.Element {
  return (
    // An `output` carries `role="status"` implicitly, as the delivered
    // unreachable state relies on; the explicit polite and non-atomic
    // attributes are what this region needs beyond the default.
    <output aria-live="polite" aria-atomic="false" data-testid="as-of-line-status">
      {announcement ? <span>{announcement}</span> : null}
      {building ? (
        <>
          {" "}
          <Badge tier="active">{SCORE_SET.updating}</Badge>
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
 * The line, or `null` with no set (the never-populated body has no line), or
 * its skeleton while the first read is pending (DEC-0154).
 */
export function AsOfLine({
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
        className="h-7 w-full animate-pulse rounded bg-secondary"
      />
    ) : null;
  }
  const building = later?.state === "building";
  const outcome = OUTCOME[set.runOutcome];
  return (
    <p data-testid="as-of-line" className="text-xs text-muted-foreground">
      <SetSentence set={set} /> <Badge tier={outcome.tier}>{outcome.word}</Badge>
      {sortLabel === undefined ? null : `${SCORE_SET.separator}${SCORE_SET.sortedBy(sortLabel)}`}
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
        building={building}
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
    </p>
  );
}
