/**
 * Every owner-facing string of the CAP-002 screens, so components and their
 * tests share one source (classification-ui sections 2.1 and 2.4: `copy.ts`
 * holds one owner-facing sentence per code and state in display labels).
 *
 * Wording is verbatim from the designs, each group citing its section; the
 * failure sentences and the operation and resource labels follow DEC-0149.
 * Display labels are STD-UI-1's (DEC-0072). Every universe-lifecycle string
 * containing *retire*, *retired* or *retiring* lives in `UNIVERSE_LIFECYCLE`,
 * the allow-list `copy.test.ts` reads (DEC-0145): a later story adds such a
 * string there and never edits the scanner. A message a later story needs and
 * no design contains is added with a doc comment saying so (CAP-002-E4-S2
 * Open Gap 6). The universe name's maximum length is not stated anywhere here:
 * it is `[REQUIRES INPUT]` (classification-ui section 14).
 */

import type {
  ClassificationOperation,
  ClassificationResource,
  FactorName,
} from "../../api/classification-types";
import type { ResearchQuery } from "../../api/research-query";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** "A", "A and B", "A, B and C". */
function listOf(items: readonly string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * The delivered CAP-001 routes CAP-002 links to (classification-ui section
 * 2.2; UX design section 0): a download's detail `/runs/:runId`, Data health
 * `/runs` and followed stocks `/instruments`. When the shell capability
 * delivers the blueprint's routes (`/data/downloads/:id`, `/data`,
 * `/data/followed`) it changes this one map.
 */
export const SHELL_ROUTES = {
  download: (runId: string): string => `/runs/${encodeURIComponent(runId)}`,
  dataHealth: "/runs",
  followedStocks: "/instruments",
} as const;

/**
 * Universe-lifecycle strings, the only ones that may say *retire*,
 * *retired* or *retiring* (DEC-0145: STD-UI-1 forbids *retire* for a stock,
 * whose label is *stop following*, and leaves *universe* its own label).
 * `copy.test.ts` reads this group as its allow-list and asserts none of its
 * strings mentions a stock or following. UX design 1.3 and 1.4; classification-ui
 * section 2.7; the operation label is DEC-0149's.
 */
export const UNIVERSE_LIFECYCLE = {
  /** UX 1.4: the header action. */
  retireAction: "Retire…",
  /** UX 1.4: the retire dialog's title. */
  retireTitle: (name: string): string => `Retire ${name}`,
  /** UX 1.4: the retire dialog's description. */
  retireDescription: "It leaves your active universes. Its members and history stay viewable.",
  /** UX 1.4: the retire dialog's confirm. */
  retireConfirm: "Retire universe",
  /** UX 1.4: the toast after retiring. */
  retired: (name: string): string => `Retired ${name}`,
  /** UX 1.3, 1.4: the lifecycle badge, the lifecycle option and the history event. */
  retiredLabel: "Retired",
  /** UX 1.4: a retired universe's header. */
  retiredHeader: "This universe is retired. Its members and history stay viewable.",
  /** UX 1.1, 1.4; classification-ui 2.7: the `universe_retired` refusal. */
  retiredRefusal:
    "This universe is retired and can't be changed. Its members and history are still viewable.",
  /** UX 1.4: the sole member's blocked Remove…, and the `last_member` refusal. */
  lastMember: "This is the last member. Retire the universe instead.",
  /** UX 1.3: the universes card header's count. */
  counts: (active: number, retired: number): string => `${active} active, ${retired} retired`,
  /** UX 1.3: the lifecycle filter matches none. */
  noRetired: "No retired universes.",
  /** DEC-0149: the `retire-universe` operation. */
  retireFailed: "Could not retire the universe",
} as const;

/**
 * The `classification_set_changed` refusal: only saving a result as a universe
 * sends a `set_id`, so the design's save-dialog sentence is the code's one
 * sentence (UX 1.1; classification-ui 2.7).
 */
const SET_CHANGED =
  "Could not save these stocks as a universe: the scores changed while you were reviewing them. Review the new result, then save again.";

/** The error codes of classification-api section 2.5. */
export type ErrorCode =
  | "instrument_not_acquired"
  | "empty_universe"
  | "universe_name_in_use"
  | "classification_set_changed"
  | "universe_not_found"
  | "universe_retired"
  | "not_a_member"
  | "last_member"
  | "instrument_not_found"
  | "cursor_invalid"
  | "cursor_stale"
  | "classification_set_not_found"
  | "validation_error"
  | "internal_error";

/**
 * What a failure sentence is built from: the operation's label, the
 * resource's label, the symbols the envelope named and the universe name, when
 * known. Never the envelope's `message` (classification-ui 2.4; UX design 4),
 * and never the error's `name`, which an `Error` always carries.
 */
export interface ErrorContext {
  action: string;
  resource: string;
  symbols: readonly string[];
  universeName: string | null;
}

/**
 * One owner-facing sentence per `ClassificationOperation`, in the *Could not
 * {verb phrase}* pattern of the design's own sentences (DEC-0149). A `Record`
 * over S1's union, so a missing operation is a compile error.
 */
export const OPERATION_LABELS: Record<ClassificationOperation, string> = {
  "list-universes": "Could not load your universes",
  "create-universe": "Could not create the universe",
  "get-universe": "Could not load the universe",
  "rename-universe": "Could not rename the universe",
  "retire-universe": UNIVERSE_LIFECYCLE.retireFailed,
  "list-universe-events": "Could not load the universe's history",
  "add-universe-members": "Could not add the stocks to the universe",
  "remove-universe-member": "Could not remove the stock from the universe",
  "list-classifications": "Could not load the scores",
  "get-classification-summary": "Could not check for newer scores",
  "list-classification-sets": "Could not load the earlier sets",
  "get-classification-set": "Could not load the set of scores",
  "get-stock-evidence": "Could not load the stock's scores and inputs",
  "get-stock-history": "Could not load the stock's earlier scores",
};

/** The display noun of each `ClassificationResource` (DEC-0149; STD-UI-1). */
export const RESOURCE_LABELS: Record<ClassificationResource, string> = {
  universe: "universe",
  "universe-member": "universe member",
  classification: "scores",
  "classification-set": "set of scores",
};

/** The sentence for a failure whose code is unknown or absent: no code, no envelope text. */
export const FALLBACK_ERROR = "FactorFlow hit an unexpected problem. Try again.";

/**
 * One sentence per error code of classification-api section 2.5, naming the
 * operation, the resource and the reason and offering the recovery where one
 * exists (STD-UI-19). Where the design prints a code's sentence it is used
 * verbatim (UX 1.1, 1.3, 1.4, 1.5; classification-ui 2.7); the others follow
 * DEC-0149.
 */
export const ERROR_SENTENCES: Record<ErrorCode, (context: ErrorContext) => string> = {
  instrument_not_acquired: ({ action, symbols }) =>
    `${action}: FactorFlow doesn't follow ${symbols.join(", ")}. Follow them on Data health, then try again.`,
  empty_universe: ({ action }) =>
    `${action}: a universe needs at least one stock, and none was given or matched.`,
  universe_name_in_use: ({ action, universeName }) =>
    universeName === null
      ? `${action}: another active universe already has this name.`
      : `${action}: another active universe is already named ${universeName}.`,
  classification_set_changed: () => SET_CHANGED,
  universe_not_found: () => "No universe with this address exists.",
  universe_retired: () => UNIVERSE_LIFECYCLE.retiredRefusal,
  not_a_member: ({ action }) => `${action}: that stock is not a member of this universe.`,
  last_member: () => UNIVERSE_LIFECYCLE.lastMember,
  instrument_not_found: ({ symbols }) =>
    symbols.length === 0
      ? "FactorFlow doesn't follow that stock."
      : `FactorFlow doesn't follow a stock named ${symbols[0]}.`,
  cursor_invalid: ({ action }) =>
    `${action}: the list changed while it was being read. Reload it, then try again.`,
  cursor_stale: ({ action }) =>
    `${action}: the list changed while it was being read. Reload it, then try again.`,
  classification_set_not_found: ({ action, resource }) =>
    `${action}: that ${resource} does not exist.`,
  validation_error: ({ action, resource }) =>
    `${action}: FactorFlow could not accept the ${resource} as entered. Check it, then try again.`,
  internal_error: ({ action }) => `${action}: ${FALLBACK_ERROR}`,
};

function isErrorCode(code: string | null): code is ErrorCode {
  return code !== null && Object.hasOwn(ERROR_SENTENCES, code);
}

/**
 * The STD-UI-19 statement of a failed call: operation, resource and reason,
 * selected by `code` alone. It never reads the error's `message`
 * (classification-ui 2.4), so a `ClassificationApiError` can be passed as is.
 */
export function failureSentence(failure: {
  operation: ClassificationOperation;
  resource: ClassificationResource;
  code: string | null;
  symbols?: readonly string[];
  universeName?: string | null;
}): string {
  const action = OPERATION_LABELS[failure.operation];
  if (!isErrorCode(failure.code)) {
    return `${action}: ${FALLBACK_ERROR}`;
  }
  return ERROR_SENTENCES[failure.code]({
    action,
    resource: RESOURCE_LABELS[failure.resource],
    symbols: failure.symbols ?? [],
    universeName: failure.universeName ?? null,
  });
}

/** Factor names as headers and row titles (UX 1.1, 1.5, 1.6). */
export const FACTOR_LABELS: Record<FactorName, string> = {
  value: "Value",
  growth: "Growth",
  momentum: "Momentum",
};

/** Section labels of the Research panes and the tray (UX 1.1 Accessibility). */
export const REGIONS = {
  filters: "Filters",
  results: "Results",
  selectedStock: "Selected stock",
  selection: "Selection",
} as const;

/** The Filters pane and its threshold sentences (UX 1.1; classification-ui 2.5). */
export const FILTERS = {
  heading: "Find stocks",
  findStock: "Find a stock",
  findStockPlaceholder: "Symbol",
  lookIn: "Look in",
  allFollowedStocks: "All followed stocks",
  allFollowedStocksOption: (count: number): string => `All followed stocks · ${count}`,
  lookInName: (option: string): string => `Look in: ${option}`,
  measures: { percentile: "percentile", standardisedScore: "standardised score" },
  directions: { atLeast: "at least", atMost: "at most" },
  measureFor: (factor: string): string => `Measure for ${factor}`,
  directionFor: (factor: string): string => `Direction for ${factor}`,
  thresholdFor: (factor: string): string =>
    `${factor.charAt(0).toUpperCase()}${factor.slice(1)} threshold`,
  valuePlaceholder: "any",
  percentileHelper:
    'Percentile 70 means "scores better than 70% of the stocks scored on this factor".',
  hideIncomplete: "Hide stocks with an incomplete score",
  hideIncompleteHelper: "They're shown by default so nothing disappears silently.",
  clearFilters: "Clear filters",
} as const;

/** One threshold sentence in words: *value percentile at least 80*. */
function sentenceClause(factor: FactorName, query: ResearchQuery): string | null {
  const sentence = query.sentences[factor];
  if (sentence === undefined) {
    return null;
  }
  return `${factor} ${FILTERS.measures[sentence.measure]} ${FILTERS.directions[sentence.direction]} ${sentence.value}`;
}

function filterClauses(query: ResearchQuery): {
  thresholds: string[];
  search: string | null;
  hidden: string | null;
} {
  return {
    thresholds: FACTORS.map((factor) => sentenceClause(factor, query)).filter(
      (clause): clause is string => clause !== null,
    ),
    search: query.symbol === null ? null : `search "${query.symbol}"`,
    hidden: query.hideIncomplete ? "stocks with an incomplete score hidden" : null,
  };
}

/**
 * The filter in words for the save dialog, each clause only when it applies:
 * *value percentile at least 80 · momentum standardised score at least 0.00 ·
 * search "AA" · stocks with an incomplete score hidden* (UX 1.1; classification-ui 2.7).
 */
export function describeQuery(query: ResearchQuery): string {
  const { thresholds, search, hidden } = filterClauses(query);
  return [...thresholds, search, hidden].filter((clause) => clause !== null).join(" · ");
}

/**
 * A saved universe's origin line, each clause only when it applies (UX 1.3):
 * *Saved from a filter on 2026-10-15: value percentile at least 80, momentum
 * standardised score at least 0.00; search "AA"; stocks with an incomplete score hidden*.
 */
export function savedFromFilter(date: string, query: ResearchQuery): string {
  const { thresholds, search, hidden } = filterClauses(query);
  const groups = [thresholds.join(", "), search, hidden].filter(
    (group) => group !== null && group !== "",
  );
  return `Saved from a filter on ${date}: ${groups.join("; ")}`;
}

/** The status phrase per input reason code (classification-ui 2.5), the subject of `incompleteReason`. */
const INCOMPLETE_STATUS = {
  input_missing: "is missing",
  input_outdated: "is outdated",
  input_not_computable: "couldn't be computed",
} as const;

/** The three `ReasonCode` values an Incomplete cell can carry (classification-ui 2.5). */
export type IncompleteReasonCode = keyof typeof INCOMPLETE_STATUS;

/** The S03 §8 shape every Incomplete reason sentence takes (UX 1.1; DEC-0151). */
function incompleteSentence(cause: string, factor: string): string {
  return `Incomplete: ${cause}, so ${factor} can't be compared fairly. It isn't guessed.`;
}

/** The subject of the generic Incomplete sentence when the engine named no input (DEC-0151). */
const GENERIC_INPUT = "an input";

/** The factor cell and column states (UX 1.1; classification-ui 2.5). */
export const CELL = {
  selectRow: (symbol: string): string => `Select ${symbol}`,
  incomplete: "Incomplete",
  /**
   * The S03 §8 reason: *Incomplete: revenue for the quarter ending 2025-06-27
   * is missing, so growth can't be compared fairly. It isn't guessed.*
   */
  incompleteReason: (input: string, status: string, factor: string): string =>
    incompleteSentence(`${input} ${status}`, factor),
  /** The status phrase per input reason code, for `incompleteReason`. */
  incompleteStatus: INCOMPLETE_STATUS,
  /**
   * The Incomplete badge's `title` in the factor cell, from the engine's
   * owner-facing `reasonDetail` and the factor (classification-ui 2.5; UX 1.1;
   * CAP-002-E4-S3 Open Gap 2, DEC-0151): *Incomplete: operating cash flow
   * missing, so value can't be compared fairly. It isn't guessed.*
   */
  incompleteDetail: (detail: string, factor: string): string => incompleteSentence(detail, factor),
  /**
   * The same `title` when the engine sent no `reasonDetail`: the clause the
   * reason code selects, naming the factor (classification-ui 2.5; DEC-0151).
   */
  incompleteGeneric: (code: IncompleteReasonCode, factor: string): string =>
    incompleteSentence(`${GENERIC_INPUT} ${INCOMPLETE_STATUS[code]}`, factor),
  notEnoughToRank: "Not enough to rank",
  qualified: (count: number, needed: number): string => `${count} qualified, ${needed} needed`,
  notFollowed: "Not followed",
  notFollowedSince: (date: string): string => `Not followed since ${date}. Earlier scores stand.`,
  /**
   * The Not followed badge's `title` when no read carries the date a stock
   * stopped being followed, which is every current read (classification-ui
   * 2.5; CAP-002-E4-S3 Open Gap 3, DEC-0152).
   */
  notFollowedNoDate: "Not followed. Earlier scores stand.",
  possiblyRestated: "Possibly restated",
  restatedExplanation:
    "Possibly restated: the financials behind this score were downloaded for a period that had already been reported before FactorFlow began following this stock, so they may reflect later restatements.",
  /** An absent value in an evidence or compare table (UX 0). */
  absentValue: "—",
  /** STD-UI-18, below the results and the evidence cards (S03 §8). */
  coverageStatement:
    "A score is shown only when every input is present and current. This checks presence and currency, not whether the provider's values are correct.",
} as const;

/** An input's status where it is not present (UX 1.5, 1.6; DEC-0077). */
export const INPUT_STATUS = {
  missing: "Missing",
  outdated: "Outdated",
  not_computable: "Couldn't be computed",
} as const;

/** The results header and the nothing-found and never-scored bodies (UX 1.1, 1.4). */
export const RESULTS = {
  stocksMatch: (count: number): string => `${count} stocks match`,
  membersMatch: (count: number, members: number): string => `${count} of ${members} members match`,
  saveThese: (count: number): string => `Save these ${count} as a universe…`,
  noMatch: "No stocks match these filters.",
  noMembersMatch: "No members match these filters.",
  nothingToSave: "No stocks match these filters, so there is nothing to save.",
  neverScored: "No stocks have been scored yet.",
  firstSetBuilding: (time: string): string =>
    `The first set of scores is being produced from the download started ${time}.`,
  firstSetFailed: (time: string, reason: string): string =>
    `Score update failed ${time}: ${reason}. The next complete download will try again.`,
  latestDownloadRunning: (started: string): string =>
    `The latest download, started ${started}, is Downloading`,
  latestDownloadComplete: (started: string, ended: string): string =>
    `The latest download, started ${started}, ended Complete at ${ended}`,
  latestDownloadFailed: (started: string, ended: string, reason: string): string =>
    `The latest download, started ${started}, ended Failed at ${ended}: ${reason}`,
  openDataHealth: "Open Data health",
  tryAgain: "Try again",
} as const;

/** The as-of line, the not-current banner and the set history (UX 1.2; classification-ui 2.6). */
export const SCORE_SET = {
  /** *Scores from 2026-10-15 17:46 CDT* */
  scoresFrom: (time: string): string => `Scores from ${time}`,
  /** The clause whose time is the download link: *from the download started 2026-10-15 17:30 CDT* */
  fromTheDownloadStarted: (time: string): string => `from the download started ${time}`,
  sortedBy: (column: string): string => `sorted by ${column}`,
  separator: " · ",
  /** The whole line; the *sorted by* clause is omitted on compare and evidence. */
  asOfLine: (scoresAt: string, downloadStarted: string, sortedBy: string | null): string =>
    [
      `Scores from ${scoresAt}`,
      `from the download started ${downloadStarted}`,
      ...(sortedBy === null ? [] : [`sorted by ${sortedBy}`]),
    ].join(" · "),
  openDownload: (time: string): string => `Open the download started ${time}`,
  complete: "Complete",
  partial: "Partial",
  failed: "Failed",
  updating: "Updating",
  checked: (time: string): string => `checked ${time}`,
  earlierSetsAction: "Earlier sets…",
  earlierSetsTitle: "Earlier sets",
  notReflecting: "Not reflecting the latest download",
  scoreUpdateFailed: "Score update failed",
  buildingBody: (produced: string, downloadStarted: string): string =>
    `Showing scores produced ${produced} from the download started ${downloadStarted}. A newer set is being produced and replaces this one when complete.`,
  failedBody: (failed: string, reason: string, produced: string, downloadStarted: string): string =>
    `Score update failed ${failed}: ${reason}. Showing scores produced ${produced} from the download started ${downloadStarted}. The next complete download will try again.`,
  scoresUpdatedTo: (scoresAt: string, downloadStarted: string): string =>
    `Scores updated to ${scoresAt} from the download started ${downloadStarted}`,
  scoresUpdatedToast: (scoresAt: string): string => `Scores updated to ${scoresAt}`,
  scoreUpdateFailedToast: (reason: string): string => `Score update failed: ${reason}`,
  couldNotCheck: "Could not check for newer scores.",
  historyColumns: {
    state: "State",
    scoresDate: "Scores date",
    download: "Download",
    started: "Started",
    ended: "Ended",
    valueQualified: "Value qualified",
    growthQualified: "Growth qualified",
    momentumQualified: "Momentum qualified",
    reason: "Reason",
  },
} as const;

/** The selection tray and the inspector (UX 1.1; classification-ui 2.5). */
export const SELECTION = {
  selected: (count: number): string => `${count} selected`,
  compareSideBySide: "Compare side by side",
  compareBlocked: "Check 2 to 6 stocks to compare them.",
  addToUniverse: "Add to universe…",
  inspectorEmpty: "Select a stock to see why it scores as it does.",
  inNoUniverse: "In no universe",
  /** *In Tech and Dividend growers* */
  inUniverses: (names: readonly string[]): string => `In ${listOf(names)}`,
  /** *From book-to-price, earnings yield and free-cash-flow yield, as of 2025-06-27, known 2026-10-14* */
  inputsLine: (inputs: readonly string[], asOf: string, knownOn: string): string =>
    `From ${listOf(inputs)}, as of ${asOf}, known ${knownOn}`,
  seeEveryInput: "See every input and its date",
  footnote:
    "Percentile first: 88 means better than 88% of the stocks scored on this factor. The small number is the standardised score.",
} as const;

/** The save and add dialogs (UX 1.1; classification-ui 2.7; DEC-0076). */
export const DIALOGS = {
  saveTitle: (count: number): string => `Save these ${count} stocks as a universe`,
  includingIncomplete: (count: number, incomplete: number): string =>
    `${count} stocks, including ${incomplete} with an incomplete score`,
  save: "Save",
  saved: (count: number, name: string): string => `Saved ${count} stocks as ${name}`,
  setChanged: SET_CHANGED,
  reviewNewResult: "Review new result",
  addTitle: (count: number): string => `Add ${count} stocks to a universe`,
  newUniverseOption: "New universe",
  add: "Add",
  added: (count: number, name: string, alreadyMembers: number): string =>
    `Added ${count} stocks to ${name}${alreadyMembers > 0 ? `, and ${alreadyMembers} were already members` : ""}`,
  cancel: "Cancel",
  name: "Name",
} as const;

/** The universes list and the create dialog (UX 1.3). */
export const UNIVERSES = {
  title: "Universes",
  lifecycleActive: "Active",
  lifecycleAll: "All",
  showLifecycle: (option: string): string => `Show: ${option}`,
  newUniverseAction: "New universe…",
  newUniverseTitle: "New universe",
  columns: { name: "Name", lifecycle: "Lifecycle", members: "Members", created: "Created" },
  createdByHand: "Created by hand",
  showDetailsFor: (name: string): string => `Show details for ${name}`,
  noUniversesYet: "No universes yet. Create one by picking stocks, or save a result on Research.",
  stocks: "Stocks",
  stocksToInclude: "Stocks to include",
  stocksPlaceholder: "AAPL, MSFT, NVDA",
  recognised: (recognised: number, rejected: number): string =>
    `${recognised} symbols recognised, ${rejected} not recognised`,
  invalidSymbol: (entry: string): string => `${entry}: not a valid symbol format`,
  create: "Create",
  enterAtLeastOne: "Enter at least one stock.",
  tooMany: "Up to 1000 stocks can be added in one request.",
} as const;

/** One universe's detail: header, members, history and the maintenance dialogs (UX 1.4). */
export const UNIVERSE_DETAIL = {
  universeName: "Universe name",
  rename: "Rename",
  lifecycle: "Lifecycle",
  active: "Active",
  members: "Members",
  created: "Created",
  origin: "Origin",
  addStocksAction: "Add stocks…",
  addStocksTitle: (name: string): string => `Add stocks to ${name}`,
  membersTab: "Members",
  historyTab: "History",
  memberSince: "Member since",
  remove: (symbol: string, name: string): string => `Remove ${symbol} from ${name}`,
  removeDescription:
    "Its membership until today stays in the universe's history. Its scores are not affected.",
  removeConfirm: "Remove from universe",
  removed: (symbol: string, name: string): string => `Removed ${symbol} from ${name}`,
  membersAsOf: "Members as of",
  membersAsOfLine: (date: string): string =>
    `Members as of ${date}. Scores shown are from the current set.`,
  showCurrentMembers: "Show current members",
  didNotExist: (name: string, date: string, created: string): string =>
    `${name} did not exist on ${date}. It was created on ${created}.`,
  historyColumns: { recordedAt: "Recorded at", event: "Event", detail: "Detail" },
  events: {
    created: "Created",
    renamed: "Renamed",
    member_added: "Stock added",
    member_removed: "Stock removed",
  },
  viewMembersAsOf: "View members as of this event",
} as const;

/** Compare (UX 1.5; DEC-0070). */
export const COMPARE = {
  comparing: (count: number): string => `Comparing ${count} stocks`,
  comparisonOf: (count: number): string => `Comparison of ${count} stocks`,
  addAStock: "Add a stock",
  add: "Add",
  atMost: "A comparison holds up to 6 stocks.",
  chooseTwoToSix: "Choose 2 to 6 stocks to compare.",
  chooseTwoToSixEmpty:
    "Choose 2 to 6 stocks to compare. Check rows on Research or in a universe, or add a stock here.",
  removeFromComparison: (symbol: string): string => `Remove ${symbol} from comparison`,
  showDatesFor: (input: string): string => `Show dates for ${input}`,
  notEnoughToRankGroup: (count: number, needed: number): string =>
    `Not enough to rank · ${count} qualified, ${needed} needed`,
  percentile: "Percentile",
  standardisedScore: "Standardised score",
} as const;

/** Stock evidence: the Now and Earlier scores panels (UX 1.6). */
export const EVIDENCE = {
  nowTab: "Now",
  earlierScoresTab: "Earlier scores",
  asOf: "As of",
  knownOn: "Known on",
  /** *Value for KO couldn't be scored: {reason}.* */
  couldNotBeScored: (factor: string, symbol: string, reason: string): string =>
    `${factor} for ${symbol} couldn't be scored: ${reason}.`,
  nextDownloadRecovery: "The next Complete or Partial download will try again.",
  noActionChangesThis: "No action in FactorFlow changes this.",
  onlyQualified: (count: number, needed: number, factor: string): string =>
    `Only ${count} of ${needed} stocks qualified on ${factor} in this set, so no stock was ranked on it.`,
  showHowComputed: (input: string): string => `Show how ${input} was computed`,
  historyNote:
    "Each row is what was known when that set was produced. Later data does not change it.",
  noScoreYet: (symbol: string): string =>
    `${symbol} has no score yet because no stocks have been scored.`,
  noEarlierScores: (symbol: string): string => `No earlier scores for ${symbol}.`,
} as const;
