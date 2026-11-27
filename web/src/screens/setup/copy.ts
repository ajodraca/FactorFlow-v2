/*
 * Every owner-facing string of the setup screen, so the steps and their tests
 * share one source (CAP-003-E4-S1; component design setup-ui 2.1, 2.3, 10; UX
 * design 1.2; S02 section 8). The wording is verbatim from those sections
 * except the sub-line (DEC-0341). Status labels (Found, Missing and the
 * download states) come from the shared label helper, and Not determinable
 * from its own component, so they are not repeated here. A string a later
 * setup story needs and no design contains is added by that story with a doc
 * comment saying so.
 *
 * Template parameters are text the caller has already formatted, so this
 * module imports nothing. It holds no number and no boolean: the plan limit is
 * stated as copy, and nothing here is a bound to validate against (DAC-E4-S1-3).
 * Its own text, comments included, is scanned for the terms the capability
 * keeps out of owner-facing copy (AC-19, DAC-E7-3).
 */

/** A step's number, as `Step {n} of 4` takes it. */
type StepNumber = 1 | 2 | 3 | 4;

/** The screen's heading, sub-line and step-list label (setup-ui 10). */
export const SCREEN = {
  title: "Get set up",
  // DEC-0341: S02 section 8's sentence with its one scanned word replaced.
  subLine:
    "About 10 minutes, then the data download continues on its own. You can leave and come back.",
  stepsLabel: "Setup steps",
};

/** The four step titles, in the step list and in the Back and Next hints (setup-ui 10). */
export const STEP_TITLES = {
  1: "Market data",
  2: "How far back",
  3: "Stocks to follow",
  4: "Download data",
};

/** Each step card's question; step 4's is `STEP4.downloadFor` (setup-ui 10). */
export const QUESTIONS = {
  1: "Connect market data",
  2: "How far back should history go?",
  3: "Which stocks do you want to follow?",
};

/** The step card's position line (setup-ui 10). */
export const stepPosition = (n: StepNumber): string => `Step ${n} of 4`;

/** The footer's Back button, naming the previous step (setup-ui 10). */
export const backLabel = (title: string): string => `← Back: ${title}`;

/** The footer's hint, naming the next step (setup-ui 10). */
export const nextHint = (title: string): string => `Next: ${title}`;

/** The footer's Continue button (setup-ui 10). */
export const CONTINUE = "Continue";

/** The step list's done text for a step, read by a screen reader (UX design 1.2, accessibility). */
export const doneLabel = (title: string): string => `${title}, done`;

/** The one-line done summaries in the step list (setup-ui 10). */
export const SUMMARIES = {
  years: (y: string): string => `${y} years of history`,
  followed: (n: string): string => `${n} followed stocks`,
  downloadStarted: (time: string): string => `Download started ${time}`,
};

/** The variable's name, one source for the line below and for the step that sets it in code type. */
const KEY_VARIABLE = "FACTORFLOW_MASSIVE_API_KEY";

/** Step 1, the market data key (setup-ui 10). */
export const STEP1 = {
  keyLabel: "Market data key:",
  KEY_VARIABLE,
  setVariable: `Set the environment variable ${KEY_VARIABLE} to your Massive API key.`,
  restart: "Restart FactorFlow after setting it.",
  notAnswering: "FactorFlow isn't answering, so the key can't be checked.",
};

/** Step 2, the history depth (setup-ui 10). */
export const STEP2 = {
  fieldLabel: "History depth",
  suffix: "years",
  description: "Whole years, 1 to 50.",
  planLimitNote:
    "Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.",
  rangeError: "History depth must be a whole number of years from 1 to 50.",
  /**
   * A failed save other than the refusal of the value. CAP-003-E4-S2 adds it
   * and no design gives its wording (DEC-0346): it mirrors the read failure's
   * shape and names the operation, the resource and the reason.
   */
  saveFailed: (reason: string): string => `Couldn't save history depth: ${reason}`,
};

/** Step 3, the followed stocks (setup-ui 2.3, 10; S02 section 8; DAC-E4-5). */
export const STEP3 = {
  explanation:
    "FactorFlow downloads data and scores value, growth and momentum for these stocks. Scores rank stocks against each other, so a factor needs at least 30 stocks with complete data before it can rank anything. Start with 100 or more if you can.",
  sourceLegend: "How do you want to name them?",
  paste: {
    label: "Paste a list",
    description: "Paste symbols separated by commas or one per line.",
  },
  later: {
    label: "Add later",
    description: "Continue without stocks for now; you can follow them later from Data health.",
  },
  fieldLabel: "Stock symbols",
  placeholder: "AAPL, MSFT, NVDA or one symbol per line",
  fieldDescription: "Whether the provider knows each one is checked during the download.",
  counter: (a: string, d: string, r: string): string =>
    `${a} symbols recognised, ${d} duplicates, ${r} not recognised`,
  unreadable: (entry: string): string => `${entry}, not a valid symbol format`,
  didYouMean: (fix: string): string => `Did you mean ${fix}?`,
  belowFloor: (a: string): string =>
    `Factor scores need at least 30 stocks with complete data. With ${a}, no factor can be ranked yet.`,
  zeroBlocked: "Paste at least one symbol, or choose Add later.",
  alreadyFollowed: "already followed",
  infoNote:
    "This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.",
  /**
   * A repeated symbol, named once. CAP-003-E4-S3 adds it and no design gives
   * its wording (DEC-0351): the *{entry}, {reason}* shape of UX design 1.2's
   * unreadable example, in plain words.
   */
  duplicateEntry: (entry: string): string => `${entry}, listed more than once`,
  /**
   * A symbol the post found already followed. CAP-003-E4-S3 adds the entry
   * form; the wording is DAC-E4-5's pinned *already followed* (DEC-0351).
   */
  alreadyFollowedEntry: (entry: string): string => `${entry}, ${STEP3.alreadyFollowed}`,
  /**
   * A failed batch other than the all-followed refusal. CAP-003-E4-S3 adds it
   * and no design gives its wording (DEC-0354): it mirrors the read failure's
   * shape and names the operation, the resource and the reason.
   */
  saveFailed: (reason: string): string => `Couldn't save the followed list: ${reason}`,
  /** How many symbols a failed post had followed. CAP-003-E4-S3 adds it (DEC-0354). */
  followedSoFar: (n: string): string => `${n} followed so far.`,
  /** The symbols a failed post left in the field for another try. CAP-003-E4-S3 adds it (DEC-0354). */
  keptForRetry: (n: string): string => `${n} not saved yet; kept in the list to try again.`,
};

/** Step 4, the download (setup-ui 10; epic DAC-E4-9 for the two progress times). */
export const STEP4 = {
  downloadFor: (n: string): string => `Download data for ${n} stocks`,
  summaryKey: "Market data key",
  summaryDepth: "History depth",
  yearsValue: (y: string): string => `${y} years`,
  summaryFollowed: "Followed stocks",
  start: "Start download",
  progress: (done: string, total: string): string => `${done} of ${total} stocks`,
  started: (time: string): string => `Started ${time}`,
  checked: (time: string): string => `checked ${time}`,
  canLeave: "You can leave; this keeps running.",
  queued: "A download is running. This starts when it finishes.",
  depthNotSet: "Couldn't start the download: history depth isn't set.",
  goToStep2: "Go to step 2",
  noStocks: "Couldn't start the download: no stocks are followed.",
  goToStep3: "Go to step 3",
  blockedReason: "No stocks are followed. Follow stocks before downloading.",
  goHome: "Go to Home",
  manageFollowed: "Manage followed stocks",
  progressUnreadable: "Progress can't be read right now",
};

/** A failed depth or count read, shown in that step only (setup-ui 10, States; DAC-E4-13). */
export const READ_ERRORS = {
  subjects: { depth: "history depth", followed: "the followed list" },
  readFailed: (subject: string, reason: string): string => `Couldn't read ${subject}: ${reason}`,
  tryAgain: "Try again",
  /**
   * The reason for a read that never got an answer. CAP-003-E4-S2 adds it and
   * no design gives its wording (DEC-0345).
   */
  notAnswering: "FactorFlow is not answering",
  /**
   * The reason for a read the server answered with a failure. CAP-003-E4-S2
   * adds it and no design gives its wording (DEC-0345).
   */
  unexpected: "FactorFlow hit an unexpected problem",
};
