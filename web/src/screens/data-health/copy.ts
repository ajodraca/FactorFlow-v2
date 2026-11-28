/**
 * Every owner-facing string of the Data health screen (component design
 * data-health-ui 2.1). CAP-003-E6-S2 to S5 add theirs here. No string carries a
 * DAC-E7-3 term (AC-19), and a `{reason}` is never an envelope `message` or
 * `request_id` (UX design 0.7). Strings are verbatim from data-health-ui 2.3 and
 * 2.4 and epic DAC-E6-1 to DAC-E6-5 unless the plan marks them.
 */

import { ApiUnreachableError } from "../../api/client";

export const FULL_COVERAGE_TABLE = "Full coverage table";
export const TRY_AGAIN = "Try again";

export const CHECK_TITLES = {
  daily_prices: "Daily prices",
  company_financials: "Company financials",
  scores: "Factor scores",
} as const;

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
