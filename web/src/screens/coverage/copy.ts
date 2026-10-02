/**
 * Every user-visible sentence on the Coverage screen, so the components and
 * their specs share one source (CAP-001-E6-S4-tasks T013).
 *
 * `NEVER_ACQUIRED`, `NO_MATCH`, `UNAVAILABLE_SENTENCE` and `shortBy` are
 * verbatim from ux-design 1.1 and are not provisional. The rest is the
 * owner-confirmed wording of Open Gap 6 (outage statement, no gaps,
 * inapplicable, unknown-reason fallback) and Open Gap 3 (plan-limit note).
 */

export const NEVER_ACQUIRED = "No data has been acquired yet.";
export const NO_MATCH = "No instrument matches this filter.";
export const UNAVAILABLE_SENTENCE =
  "Gap detection needs at least two instruments holding data in this range.";

/** Reason codes coverage-service 2.4 reports, mapped to their UX sentence. */
export const REASON_SENTENCES: Record<string, string> = {
  fewer_than_two_instruments_with_data: UNAVAILABLE_SENTENCE,
};

/**
 * The sentence for a gap-detection reason code. An unknown code is shown as
 * text, never dropped (owner-web-app 2.4: the interface does not invent a
 * reason). Open Gap 6.
 */
export function reasonSentence(code: string | null): string {
  if (code !== null && code in REASON_SENTENCES) {
    return REASON_SENTENCES[code] as string;
  }
  return `Gap detection is unavailable (${code ?? "no reason given"}).`;
}

/** The STD-UI-18 coverage statement, once below the table (DAC-E6-6; Open Gap 6). */
export const OUTAGE_SENTENCE =
  "Gap detection cannot see a market-wide provider outage: a day missing for every instrument never enters the trading-day set.";

/** Open Gap 6. */
export const NO_GAPS = "No missing trading days in the covered range.";

/** Open Gap 6. */
export const GAPS_INAPPLICABLE =
  "Gap detection applies to daily prices only, and no daily prices are covered for this instrument.";

/**
 * The note shown when every loaded covered instrument is short by the same
 * amount: a plan limit, not a data gap (DAC-E6-S4-6; Open Gap 3). It names
 * no plan tier, since no API field carries one.
 */
export function planLimitNote(years: number): string {
  return `Every instrument shown is short of the stated history depth by ${years} ${years === 1 ? "year" : "years"}. A shortfall shared by every instrument is the provider plan's history limit, not missing data.`;
}

/** ux-design 1.1, verbatim: the depth-shortfall marker (AC-22). */
export function shortBy(years: number): string {
  return `Short by ${years} ${years === 1 ? "year" : "years"}`;
}
