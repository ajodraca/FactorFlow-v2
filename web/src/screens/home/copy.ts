/**
 * Every owner-facing string of the Home screen the designs fix, so the header,
 * the data tile and the Needs you card share one source (component design
 * `home-ui` 2.1: `copy.ts` holds item titles, bodies, actions and every other
 * string; 2.3 to 2.5 and section 10; UX design 1.3). The module's shape is
 * adopted provisionally as DEC-0362: grouped `as const` objects of constants
 * and template functions, in the shape of `screens/research/copy.ts`.
 *
 * Left out on purpose: tier and status labels, which `labelOf` owns; the answer
 * words *Yes*, *Mostly yes* and *No*, which `worstDataTier` owns; route
 * targets, which `deriveNeedsYou` and the router own; and the strings no
 * artifact fixes, which the story whose criteria need them adds here with a doc
 * comment saying so.
 */

import { formatCount } from "../../components/patterns/format";

/** "A", "A and B", "A, B and C" (restated: a screen must not import another screen). */
function listOf(items: readonly string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The hidden words of every Home em dash (home-ui 2.3, 2.4, section 10 Accessibility). */
export const NOT_DETERMINABLE = "not determinable";

/** The prefix of the as-of line's last part (home-ui 2.3). */
export const CHECKED = "checked";

/** The retry action of a failed read (home-ui 2.4, 2.5). */
export const TRY_AGAIN = "Try again";

/** The header (home-ui 2.3; UX design 1.3 Page Layout 1). */
export const HEADER = {
  /** The `h1`: weekday and date in America/Chicago (DEC-0209). */
  heading: (weekday: string, date: string): string => `${weekday}, ${date}`,
  marketClosed: "Market closed",
  marketNotDeterminable: "Market state not determinable",
  noTradingCalendar:
    "FactorFlow has no trading calendar, so it can't tell a session from a holiday.",
  /** A prefix, so `Absent` can stand after it while the read fails. */
  pricesCurrentTo: "prices current to",
  pricesNotDownloaded: "prices not downloaded yet",
} as const;

/** The data tile (home-ui 2.4, section 10; UX design 1.3 Page Layout 2; epic DAC-E5-2, DAC-E5-11). */
export const DATA_TILE = {
  title: "Data",
  /** After the current figure, or `Absent`. */
  ofFollowedStocksCurrent: (followed: string): string => `of ${followed} stocks current`,
  /** The as-of labels. */
  scores: "Scores",
  prices: "Prices",
  scope: "Every other number on this page is as of those times.",
  /**
   * The hidden words of the tile's prices em dash while `prices_as_of` is null.
   * No design contains it; added by CAP-003-E5-S2 as DEC-0365.
   */
  pricesNotDownloaded: "not downloaded yet",
  firstDownloadRunning: (time: string): string =>
    `Your first download, started ${time}, is running.`,
  readError: (reason: string): string => `Couldn't read the data summary: ${reason}.`,
  /** The tile's accessible name; the answer label's first letter is lower-cased. */
  name: (
    label: string,
    current: string,
    followed: string,
    scores: string,
    prices: string,
  ): string =>
    `Data: ${label.charAt(0).toLowerCase()}${label.slice(1)}. ${current} of ${followed} stocks current. Scores ${scores}, prices ${prices}.`,
  firstDownloadName: (time: string): string =>
    `Data: your first download, started ${time}, is running.`,
} as const;

/**
 * The `{reason}` of *Couldn't read the data summary: {reason}.*: one fixed
 * sentence per failure kind, never the server's message or request id. No
 * design contains these words; added by CAP-003-E5-S2 as DEC-0366.
 */
export const READ_FAILURE = {
  unreachable: "FactorFlow is not answering",
  unexpected: "FactorFlow hit an unexpected problem",
} as const;

/** The Needs you card (home-ui 2.5, section 10; UX design 1.3 Page Layout 3 and States). */
export const NEEDS_YOU = {
  title: "Needs you",
  heading: (count: number): string => `Needs you · ${formatCount(count)}`,
  subLine: "Most important first. Nothing here is urgent unless marked.",
  nothingNeedsYou: "Nothing needs you right now.",
  readError: (reason: string): string => `Couldn't read what needs you: ${reason}.`,
} as const;

/** The empty state before any download (epic DAC-E5-1; UX design 1.3 States). */
export const EMPTY_STATE = {
  title: "No data has been downloaded yet.",
  body: "Set up FactorFlow to name the stocks to follow and start the first download.",
  action: "Start setup",
} as const;

/**
 * The six item kinds of `ui-components` 2.6 (home-ui 2.5; UX design 1.3
 * catalogue; DEC-0203, DEC-0216), not typed by `NeedsYouKind` (DEC-0362).
 */
export const ITEMS = {
  data_problems: {
    tag: "Data",
    /** One symbol, a list of two or three, or the first symbols and how many more (epic DAC-E5-7). */
    title: (symbols: readonly string[], stockCount: number): string => {
      if (stockCount > symbols.length) {
        const more = stockCount - symbols.length;
        return `${symbols.join(", ")} and ${formatCount(more)} more ${more === 1 ? "stock" : "stocks"} are missing data`;
      }
      return symbols.length === 1
        ? `${symbols[0]} is missing data`
        : `${listOf(symbols)} are missing data`;
    },
    body: (stockCount: number): string =>
      `${stockCount === 1 ? "Its" : "Their"} scores show as Incomplete until the data is complete.`,
    action: "Fix data",
    actionName: (symbols: readonly string[]): string => `Fix data for ${listOf(symbols)}`,
  },
  download_not_complete: {
    tag: "Download",
    failedTitle: "The last download failed",
    interruptedTitle: "The last download was interrupted",
    failedBody: (reason: string, endedAt: string): string => `${reason}. Ended ${endedAt}.`,
    interruptedBody: (endedAt: string): string =>
      `FactorFlow restarted mid-download. Download again to pick up the rest. Ended ${endedAt}.`,
    action: "See download",
    failedActionName: "See the download that failed",
  },
  credential_missing: {
    tag: "Setup",
    title: "The market data key is missing",
    body: "Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then.",
    action: "Open Settings",
    actionName: "Open Settings to set the market data key",
  },
  first_download: {
    tag: "Download",
    title: "Your first download is running",
    /** With no total, only the closing sentence (DEC-0213 f). */
    body: (done: number, total: number | null): string =>
      total === null
        ? "Scores appear when it finishes."
        : `${formatCount(done)} of ${formatCount(total)} ${total === 1 ? "stock" : "stocks"} so far. Scores appear when it finishes.`,
    action: "See download",
  },
  first_scores: {
    tag: "Scores",
    title: "Your first scores are being produced",
    body: "Scores appear when this finishes.",
    action: "See download",
  },
  score_failed: {
    tag: "Scores",
    title: "The latest score update failed",
    body: (reason: string, setStartedAt: string | null): string =>
      setStartedAt === null
        ? `${reason}.`
        : `${reason}. Scores still show the set from the download started ${setStartedAt}.`,
    action: "See details",
  },
} as const;
