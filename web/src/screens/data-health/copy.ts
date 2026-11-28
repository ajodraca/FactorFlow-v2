/**
 * Every owner-facing string of the Data health screen (component design
 * data-health-ui 2.1). CAP-003-E6-S2 to S5 add theirs here. No string carries a
 * DAC-E7-3 term (AC-19), and a `{reason}` is never an envelope `message` or
 * `request_id` (UX design 0.7). Strings are verbatim from data-health-ui 2.3 and
 * 2.4 and epic DAC-E6-1 to DAC-E6-5 unless the plan marks them.
 */

import { ApiError, ApiUnreachableError } from "../../api/client";
import type { DataType } from "../../api/types";
import { formatCount } from "../../components/patterns/format";
import type { DataAnswer } from "../../components/patterns/worst-data-tier";

export const PAGE_TITLE = "Is the data good enough to trust?";
export const FULL_COVERAGE_TABLE = "Full coverage table";
export const TRY_AGAIN = "Try again";

export const CHECK_TITLES = {
  daily_prices: "Daily prices",
  company_financials: "Company financials",
  scores: "Factor scores",
} as const;

/** The count clause of the verdict: singular forms at 1, and none spelled out at 0 (data-health-ui 2.3). */
export function countClause(n: number, m: number): string {
  const followed = formatCount(m);
  if (n === 0) {
    return `None of the ${followed} followed stocks needs attention`;
  }
  if (n === 1) {
    return `1 of ${followed} followed stocks needs attention; its scores show as Incomplete until it's fixed`;
  }
  return `${formatCount(n)} of ${followed} followed stocks need attention; their scores show as Incomplete until they're fixed`;
}

/** The sentence after the badge's word; the download clause replaces the count clause's full stop. */
export function verdictSentenceRest(
  n: number,
  m: number,
  downloadClause: DataAnswer["downloadClause"],
): string {
  const count = countClause(n, m);
  switch (downloadClause) {
    case "failed":
      return `${count}, and the last download failed.`;
    case "interrupted":
      return `${count}, and the last download was interrupted.`;
    case null:
      return `${count}.`;
  }
}

/** Names a daily prices check that could not look for gaps (Resolved Conflict 2). */
export function gapsNotCheckable(reason: string): string {
  return `Daily prices can't be checked for gaps: ${reason}.`;
}

export function checked(time: string): string {
  return `checked ${time}`;
}

/** `Couldn't read {what}: {reason}.` */
export function readFailed(what: string, reason: string): string {
  return `Couldn't read ${what}: ${reason}.`;
}

export const READ_TARGETS = {
  attention: "what needs attention",
  checks: "the data health checks",
  scores: "the factor scores",
} as const;

/**
 * The `{reason}` of a failed read (DEC-0373). The GET reads used here answer
 * only `200` or the `500` `internal_error` envelope (data-health-api 11,
 * owner-shell 2.3), so a per-code table has nothing else to key on yet. Neither
 * the envelope's `message` nor its `request_id` is ever shown.
 */
export function readFailureReason(error: Error): string {
  return error instanceof ApiUnreachableError
    ? "FactorFlow is not answering"
    : "FactorFlow hit an unexpected problem";
}

/** Hidden words for an absent value (STD-UI-4); `noData` is DAC-E6-7's. */
export const ABSENT = {
  noData: "no data stored yet",
  noPrices: "no prices stored yet",
  noFinancials: "no financials stored yet",
  noScores: "no scores yet",
  notEnded: "not ended yet",
} as const;

/** `and {k} more`, after the exception symbols a card shows. */
export function andMore(k: number): string {
  return `and ${k} more`;
}

/**
 * The display clause of `gap_detection.reason` (DEC-0374). The key is the wire
 * code `coverage-service` serves and is never rendered.
 */
export const GAP_REASONS: Readonly<Record<string, string>> = {
  fewer_than_two_instruments_with_data: "fewer than two followed stocks hold daily prices",
};

/** An unknown code is shown as itself, never dropped; `null` has its own words. */
export function gapReason(code: string | null): string {
  if (code === null) {
    return "no reason was given";
  }
  return GAP_REASONS[code] ?? code;
}

export function allPrices(m: string, date: string): string {
  return `All ${m} stocks have prices to ${date}`;
}

export function withoutPrices(n: string): string {
  return `${n} without prices`;
}

export function withGaps(n: string): string {
  return `${n} with gaps`;
}

export function behind(n: string, date: string): string {
  return `${n} behind ${date}`;
}

export const GAPS_NOT_DETERMINABLE = "Gaps not determinable";
export const PRICES_TO = "Prices to";
export const PRICES_SCOPE_NOTE =
  "Gaps and currency are judged against the days and the newest session other followed stocks hold. FactorFlow has no trading calendar, so a day with no download leaves nothing to detect.";

export function allFinancials(m: string): string {
  return `All ${m} stocks have financials`;
}

export function withoutFinancials(n: string): string {
  return `${n} without financials`;
}

export function withFailedDownloads(n: string): string {
  return `${n} with failed downloads`;
}

export const FINANCIALS_TO = "Financials to";
export const FINANCIALS_NOTE =
  "Checks that financials are present and downloaded, not that they are correct.";

export function stocksCurrent(c: string, f: string): string {
  return `${c} of ${f} stocks current`;
}

export function showAsIncomplete(k: string): string {
  return `${k} stocks show as Incomplete until their data is complete`;
}

export const SCORES_AT = "Scores";
export const FROM_DOWNLOAD_STARTED = "from the download started";
export const SCORES_NOT_SERVED = "FactorFlow can't read scores yet.";

// CAP-003-E6-S2: Download now and Stop following (data-health-ui 2.7)

export const DOWNLOAD_NOW = "Download now";
export const QUEUED_NOTICE = "A download is running. This starts when it finishes.";

/**
 * The two refusals `POST /api/acquisition-runs` can answer, each with its fix.
 * The keys are wire codes from the delivered route (`runs.py` l.86-97),
 * selected by `ApiError.code`. The envelope `message`, which carries domain
 * terms, is never rendered (ux-design 0.7; register C13; AC-19).
 * `history_depth_not_set` wins when both preconditions fail (`runs.py` l.77-78).
 */
export const START_REFUSALS: Readonly<
  Record<
    "history_depth_not_set" | "no_active_instruments",
    { sentence: string; fix: string; to: string }
  >
> = {
  history_depth_not_set: {
    sentence: "Couldn't start the download: history depth isn't set.",
    fix: "Set history depth",
    to: "/settings",
  },
  no_active_instruments: {
    sentence: "Couldn't start the download: no stocks are followed.",
    fix: "Follow stocks",
    to: "/data/followed",
  },
};

export function startFailed(reason: string): string {
  return `Couldn't start the download: ${reason}.`;
}

export const STOP_FOLLOWING = "Stop following";

export function stopFollowingTitle(symbol: string): string {
  return `Stop following ${symbol}`;
}

/** The blueprint section 9 sentence, verbatim. */
export function stopFollowingDescription(symbol: string): string {
  return `Stop following ${symbol}? Its history is kept, and strategies holding it keep holding it. You can follow it again later.`;
}

export function stopFollowingFailed(symbol: string, reason: string): string {
  return `Couldn't stop following ${symbol}: ${reason}.`;
}

export function stoppedFollowing(symbol: string): string {
  return `Stopped following ${symbol}`;
}

/**
 * The `{reason}` of a refused stop (DEC-0377). The keys are wire codes from the
 * delivered route (`instruments.py` l.113-125), selected by `ApiError.code`.
 * The envelope `message`, which carries domain terms, is never rendered
 * (ux-design 0.7; register C13; AC-19).
 */
export const STOP_REFUSAL_REASONS: Readonly<
  Record<"instrument_not_found" | "instrument_already_retired", string>
> = {
  instrument_not_found: "FactorFlow doesn't follow it",
  instrument_already_retired: "you already stopped following it",
};

function isStopRefusalCode(code: string | null): code is keyof typeof STOP_REFUSAL_REASONS {
  return code !== null && Object.hasOwn(STOP_REFUSAL_REASONS, code);
}

/** True exactly for the two refusals that mean the row on screen is stale. */
export function isStaleRowRefusal(error: unknown): boolean {
  return error instanceof ApiError && isStopRefusalCode(error.code);
}

export function stopFailureReason(error: ApiError | ApiUnreachableError): string {
  if (error instanceof ApiError && isStopRefusalCode(error.code)) {
    return STOP_REFUSAL_REASONS[error.code];
  }
  return readFailureReason(error);
}

// CAP-003-E6-S3: Needs fixing (data-health-ui 2.5)
//
// The `DATA_TYPE_WORDS` keys are wire values and are never rendered. The
// `{reason}` of `downloadFailed` is provider text, rendered as text; the reasons
// of failed reads come only from `readFailureReason`.

export const NEEDS_FIXING = "Needs fixing";

export function needsFixingTitle(n: number): string {
  return `${NEEDS_FIXING} · ${formatCount(n)}`;
}

export const FROM_RECENT_DOWNLOADS = "From your most recent downloads";

export const DATA_TYPE_WORDS: Readonly<Record<DataType, string>> = {
  prices: "daily prices",
  fundamentals: "company financials",
  corporate_actions: "corporate actions",
  reference: "reference data",
};

export const NO_REASON_RECORDED = "no reason was recorded";

export function downloadFailed(
  dataType: DataType,
  reason: string | null,
  attempts: number,
): string {
  return `Downloading ${DATA_TYPE_WORDS[dataType]} failed: ${reason ?? NO_REASON_RECORDED}, ${formatCount(attempts)} attempts`;
}

export const NOT_RECOGNISED = "The provider doesn't recognise this symbol.";
export const CONSEQUENCE =
  "Its scores show as Incomplete until this is fixed, and so does every universe holding it.";
export const FAILED_FIX =
  "Download again to retry; data already stored is never duplicated or overwritten.";
export const NOT_FOUND_FIX = "Probably a typo or a delisted ticker. Downloading again won't help.";

export const FOLLOW_DIFFERENT = "Follow a different symbol";

export function followDifferentName(symbol: string): string {
  return `${FOLLOW_DIFFERENT} than ${symbol}`;
}

export function stopFollowingName(symbol: string): string {
  return `${STOP_FOLLOWING} ${symbol}`;
}

export function symbolLinkName(symbol: string): string {
  return `${symbol}, show in the coverage table`;
}

export const SHOW_MORE = "Show more";
export const MORE_PROBLEMS = "more problems";

export function showingOf(shown: number, n: number): string {
  return `Showing ${formatCount(shown)} of ${formatCount(n)} stocks`;
}

export const NOTHING_NEEDS_FIXING = "Nothing needs fixing.";

export function lastCompleteDownload(time: string): string {
  return `Last complete download ${time}`;
}

export const NO_COMPLETE_DOWNLOAD = "No complete download yet";
export const LAST_COMPLETE_TARGET = "the last complete download";

// CAP-003-E6-S4: Recent downloads and What you follow (data-health-ui 2.6)
//
// Counts arrive already formatted (`formatCount`). No string carries a DAC-E7-3
// term (AC-19).

export const RECENT_DOWNLOADS = "Recent downloads";

/** ux-design 1.4 item 4: one sub-line, with *checked {time}* once the list has answered. */
export function recentDownloadsSubline(time: string | null): string {
  const base = "Starts when you press Download now";
  return time === null ? base : `${base} · ${checked(time)}`;
}

export const DOWNLOAD_COLUMNS = {
  started: "Started",
  outcome: "Outcome",
  ended: "Ended",
  result: "Result",
} as const;

export function writtenOf(written: string, named: string): string {
  return `${written} of ${named} stocks`;
}

export function partialResult(written: string, named: string, failed: string): string {
  return `${written} of ${named} stocks, ${failed} failed`;
}

export function interruptedResult(written: string): string {
  return `FactorFlow restarted mid-download; ${written} kept, the rest picked up next time`;
}
