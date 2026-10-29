import type { CSSProperties, JSX, ReactNode } from "react";
import type {
  FactorCell as FactorCellData,
  FactorName,
  ReasonCode,
} from "../../api/classification-types";
import { CELL, type IncompleteReasonCode } from "../../screens/research/copy";
import { formatDate, formatPercentile, formatScore } from "../../screens/research/format";
import { RestatedMark } from "./restated-mark";

/** The delivered badge size (`screens/coverage/badges.tsx`), copied rather than imported: it is CAP-001's. */
const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";

/**
 * The bar paints `--seq-4` on `--seq-1` (UX design Token Usage; STD-UI-7) as
 * inline styles, because its fill width is data and the Tailwind config maps
 * no `seq` colour (CAP-002-E4-S3 Open Gap 4; STD-UI-29 introduces no literal).
 */
const TRACK_STYLE: CSSProperties = { background: "hsl(var(--seq-1))" };
const FILL_COLOUR = "hsl(var(--seq-4))";

export interface FactorCellProps {
  /** One factor's result on the wire (classification-api section 2.7). */
  cell: FactorCellData;
  factor: FactorName;
  /** The inspector, evidence and compare renderings print the standardised score; the list never does. */
  showScore?: boolean;
  /** The date a stock stopped being followed, which no current read carries (DEC-0152). */
  notFollowedSince?: string | null;
}

function Icon({ children }: { children: ReactNode }): JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      {children}
    </svg>
  );
}

/** A question mark: the factor could not be ranked (the delivered `coverage-unknown` shape). */
function QuestionIcon(): JSX.Element {
  return (
    <Icon>
      <path
        d="M4 4a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5V8M6 10v.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/** A dash in a circle: neutral, never a fault (DEC-0073). */
function NotFollowedIcon(): JSX.Element {
  return (
    <Icon>
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.5" />
    </Icon>
  );
}

function isIncompleteReason(code: ReasonCode | null): code is IncompleteReasonCode {
  return code !== null && Object.hasOwn(CELL.incompleteStatus, code);
}

/**
 * The Incomplete badge's `title` (DEC-0151): the engine's `reasonDetail` when
 * it sent one, else the clause its input reason code selects. A cell with
 * neither names no cause, so it carries no title (DEC-0229). `reasonInput`,
 * a payload key, is never read (STD-UI-1).
 */
function incompleteTitle(cell: FactorCellData, factor: FactorName): string | undefined {
  if (cell.reasonDetail !== null) {
    return CELL.incompleteDetail(cell.reasonDetail, factor);
  }
  if (isIncompleteReason(cell.reasonCode)) {
    return CELL.incompleteGeneric(cell.reasonCode, factor);
  }
  return undefined;
}

function IncompleteBadge({ title }: { title: string | undefined }): JSX.Element {
  return (
    <span
      data-testid="factor-cell"
      data-variant="coverage-absent"
      className={`${BADGE} bg-value-missing-muted text-value-missing`}
      title={title}
    >
      <span aria-hidden="true">—</span>
      {CELL.incomplete}
    </span>
  );
}

/** No count and no title: the column header states *{n} qualified, 30 needed* once (E4-S6). */
function NotEnoughToRankBadge(): JSX.Element {
  return (
    <span
      data-testid="factor-cell"
      data-variant="coverage-unknown"
      className={`${BADGE} bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate`}
    >
      <QuestionIcon />
      {CELL.notEnoughToRank}
    </span>
  );
}

function NotFollowedBadge({ since }: { since: string | null }): JSX.Element {
  return (
    <span
      data-testid="factor-cell"
      data-variant="status-neutral"
      className={`${BADGE} bg-status-neutral-muted text-status-neutral`}
      title={since === null ? CELL.notFollowedNoDate : CELL.notFollowedSince(formatDate(since))}
    >
      <NotFollowedIcon />
      {CELL.notFollowed}
    </span>
  );
}

interface ScoredCellProps {
  cell: FactorCellData;
  percentile: string;
  factor: FactorName;
  showScore: boolean;
}

/**
 * The percentile in the numeric face at weight 600, right-aligned in a fixed
 * box, then the `aria-hidden` bar filled to the printed whole number, then the
 * mark where the cell carries it, then the muted standardised score only when
 * asked for and present. The box and the bar take the theme's spacing tokens
 * nearest the design's 22 px and 52 px (DEC-0230).
 */
function ScoredCell({ cell, percentile, factor, showScore }: ScoredCellProps): JSX.Element {
  const printed = formatPercentile(percentile);
  return (
    <span data-testid="factor-cell" className="inline-flex items-center gap-1">
      <span
        data-testid="factor-percentile"
        className="inline-block w-5 text-right font-numeric font-semibold"
      >
        {printed}
      </span>
      <span
        data-testid="factor-bar"
        aria-hidden="true"
        className="inline-block h-2 w-7 overflow-hidden"
        style={TRACK_STYLE}
      >
        <span className="block h-full" style={{ width: `${printed}%`, background: FILL_COLOUR }} />
      </span>
      {cell.restatedPossible ? <RestatedMark factor={factor} /> : null}
      {showScore && cell.score !== null ? (
        <span data-testid="factor-score" className="text-muted-foreground">
          {formatScore(cell.score)}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The factor cell every CAP-002 surface draws a result with (classification-ui
 * section 2.5; UX design 1.1; blueprint 4.4): four renderings that are never
 * confused. The state is chosen by `reasonCode` first, then `status`
 * (DEC-0151): `retired` is *Not followed* even with a percentile;
 * `not_enough_stocks` is *Not enough to rank*; a `classified` cell with a
 * percentile is scored; everything else, a null or unrecognised reason
 * included, is *Incomplete*, so an unscored factor never shows `0` or a bare
 * number (DAC-E4-S3-1) while a measured `0.00` prints as `0.00` through
 * `formatScore` (DAC-E4-S3-2). The mark rides the percentile on value and
 * growth only (DAC-E4-S3-3), and every status is a word plus a shape with no
 * polarity colour (DAC-E4-S3-4). Props per DEC-0150; the Not followed date
 * per DEC-0152.
 */
export function FactorCell({
  cell,
  factor,
  showScore = false,
  notFollowedSince = null,
}: FactorCellProps): JSX.Element {
  if (cell.reasonCode === "retired") {
    return <NotFollowedBadge since={notFollowedSince} />;
  }
  if (cell.reasonCode === "not_enough_stocks") {
    return <NotEnoughToRankBadge />;
  }
  if (cell.status === "classified" && cell.percentile !== null) {
    return (
      <ScoredCell cell={cell} percentile={cell.percentile} factor={factor} showScore={showScore} />
    );
  }
  return <IncompleteBadge title={incompleteTitle(cell, factor)} />;
}
