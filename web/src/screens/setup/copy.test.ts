import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as copy from "./copy";

/** Arguments a template function is called with, as many as it declares. */
const REPRESENTATIVE: string[] = ["AAPL", "12", "2026-10-15 09:30 CDT", "history depth"];

/** Every string the module offers: strings as they are, objects recursively, functions called. */
function flatten(value: unknown, name = ""): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (typeof value === "function") {
    const template = value as (...args: unknown[]) => unknown;
    // The one function of a step number is called with each of the four.
    const calls: unknown[][] =
      name === "stepPosition" ? [[1], [2], [3], [4]] : [REPRESENTATIVE.slice(0, template.length)];
    return calls.flatMap((args) => {
      const result = template(...args);
      expect(typeof result, `${name}(${args.join(", ")}) must return a string`).toBe("string");
      return [result as string];
    });
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, member]) => flatten(member, key));
  }
  throw new Error(`${name}: copy.ts exports a ${typeof value}, which is not copy`);
}

const CATALOGUE = flatten({ ...copy });

/** The eight DAC-E7-3 terms, as case-insensitive whole words. */
const TERMS: RegExp[] = [
  /\binstrument\b/i,
  /\bacquisition\b/i,
  /\bacquire\b/i,
  /\brun\b/i,
  /\bruns\b/i,
  /\bretire\b/i,
  /\bretired\b/i,
  /\bprovider\s+credential\b/i,
];

function violations(text: string): RegExp[] {
  return TERMS.filter((term) => term.test(text));
}

/** Every static (non-function) value reachable from an export. */
function staticValues(value: unknown): unknown[] {
  if (typeof value === "function") {
    return [];
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(staticValues);
  }
  return [value];
}

// Implements TC-COMP-107
describe("setup copy is free of domain terms", () => {
  it("catalogues enough strings for the scan to mean something", () => {
    expect(CATALOGUE.length).toBeGreaterThan(60);
  });

  it("flags every planted term and passes near misses", () => {
    for (const planted of [
      "Start acquisition",
      "Runs",
      "run",
      "Retired stocks",
      "Instrument",
      "Provider credential missing",
      "acquire data",
      "the download runs on its own",
    ]) {
      expect(violations(planted), planted).not.toEqual([]);
    }
    for (const clean of [
      "this keeps running",
      "Restart FactorFlow after setting it.",
      "provider plan",
      "Download data",
    ]) {
      expect(violations(clean), clean).toEqual([]);
    }
  });

  it.each(CATALOGUE)("has no domain term in %s", (text) => {
    expect(violations(text)).toEqual([]);
  });

  it("holds none in its own source text, comments included", () => {
    const source = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "copy.ts"),
      "utf8",
    );
    expect(violations(source)).toEqual([]);
  });

  it("states the plan limit as copy and holds no bound to validate against", () => {
    expect(copy.STEP2.planLimitNote).toBe(
      "Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.",
    );
    expect(copy.STEP2.planLimitNote).toMatch(/\b5 years\b/);
    for (const value of staticValues({ ...copy })) {
      expect(["number", "boolean"]).not.toContain(typeof value);
    }
  });
});

/** Resolves `a.b.c` against the module, calling it with `args` when it is a function. */
function textAt(dotted: string, args: string[]): unknown {
  const value = dotted
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], { ...copy });
  return typeof value === "function" ? (value as (...a: string[]) => unknown)(...args) : value;
}

/** Each owner-facing string, as the designs write it (setup-ui 10; UX design 1.2; S02 8). */
const ROWS: [string, string[], string][] = [
  ["SCREEN.title", [], "Get set up"],
  [
    "SCREEN.subLine",
    [],
    "About 10 minutes, then the data download continues on its own. You can leave and come back.",
  ],
  ["SCREEN.stepsLabel", [], "Setup steps"],
  ["STEP_TITLES.1", [], "Market data"],
  ["STEP_TITLES.2", [], "How far back"],
  ["STEP_TITLES.3", [], "Stocks to follow"],
  ["STEP_TITLES.4", [], "Download data"],
  ["QUESTIONS.1", [], "Connect market data"],
  ["QUESTIONS.2", [], "How far back should history go?"],
  ["QUESTIONS.3", [], "Which stocks do you want to follow?"],
  ["stepPosition", ["2"], "Step 2 of 4"],
  ["backLabel", ["How far back"], "← Back: How far back"],
  ["nextHint", ["Stocks to follow"], "Next: Stocks to follow"],
  ["CONTINUE", [], "Continue"],
  ["doneLabel", ["How far back"], "How far back, done"],
  ["SUMMARIES.years", ["5"], "5 years of history"],
  ["SUMMARIES.followed", ["12"], "12 followed stocks"],
  ["SUMMARIES.downloadStarted", ["2026-10-15 09:30 CDT"], "Download started 2026-10-15 09:30 CDT"],
  ["STEP1.keyLabel", [], "Market data key:"],
  ["STEP1.KEY_VARIABLE", [], "FACTORFLOW_MASSIVE_API_KEY"],
  [
    "STEP1.setVariable",
    [],
    "Set the environment variable FACTORFLOW_MASSIVE_API_KEY to your Massive API key.",
  ],
  ["STEP1.restart", [], "Restart FactorFlow after setting it."],
  ["STEP1.notAnswering", [], "FactorFlow isn't answering, so the key can't be checked."],
  ["STEP2.fieldLabel", [], "History depth"],
  ["STEP2.suffix", [], "years"],
  ["STEP2.description", [], "Whole years, 1 to 50."],
  [
    "STEP2.planLimitNote",
    [],
    "Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.",
  ],
  ["STEP2.rangeError", [], "History depth must be a whole number of years from 1 to 50."],
  [
    "STEP3.explanation",
    [],
    "FactorFlow downloads data and scores value, growth and momentum for these stocks. Scores rank stocks against each other, so a factor needs at least 30 stocks with complete data before it can rank anything. Start with 100 or more if you can.",
  ],
  ["STEP3.sourceLegend", [], "How do you want to name them?"],
  ["STEP3.paste.label", [], "Paste a list"],
  ["STEP3.paste.description", [], "Paste symbols separated by commas or one per line."],
  ["STEP3.later.label", [], "Add later"],
  [
    "STEP3.later.description",
    [],
    "Continue without stocks for now; you can follow them later from Data health.",
  ],
  ["STEP3.fieldLabel", [], "Stock symbols"],
  ["STEP3.placeholder", [], "AAPL, MSFT, NVDA or one symbol per line"],
  [
    "STEP3.fieldDescription",
    [],
    "Whether the provider knows each one is checked during the download.",
  ],
  ["STEP3.counter", ["12", "1", "2"], "12 symbols recognised, 1 duplicates, 2 not recognised"],
  ["STEP3.unreadable", ["AA PL"], "AA PL, not a valid symbol format"],
  ["STEP3.didYouMean", ["BRK.B"], "Did you mean BRK.B?"],
  [
    "STEP3.belowFloor",
    ["12"],
    "Factor scores need at least 30 stocks with complete data. With 12, no factor can be ranked yet.",
  ],
  ["STEP3.zeroBlocked", [], "Paste at least one symbol, or choose Add later."],
  ["STEP3.alreadyFollowed", [], "already followed"],
  [
    "STEP3.infoNote",
    [],
    "This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.",
  ],
  ["STEP4.downloadFor", ["42"], "Download data for 42 stocks"],
  ["STEP4.summaryKey", [], "Market data key"],
  ["STEP4.summaryDepth", [], "History depth"],
  ["STEP4.yearsValue", ["5"], "5 years"],
  ["STEP4.summaryFollowed", [], "Followed stocks"],
  ["STEP4.start", [], "Start download"],
  ["STEP4.progress", ["12", "42"], "12 of 42 stocks"],
  ["STEP4.started", ["2026-10-15 09:30 CDT"], "Started 2026-10-15 09:30 CDT"],
  ["STEP4.checked", ["09:31:00"], "checked 09:31:00"],
  ["STEP4.canLeave", [], "You can leave; this keeps running."],
  ["STEP4.queued", [], "A download is running. This starts when it finishes."],
  ["STEP4.depthNotSet", [], "Couldn't start the download: history depth isn't set."],
  ["STEP4.goToStep2", [], "Go to step 2"],
  ["STEP4.noStocks", [], "Couldn't start the download: no stocks are followed."],
  ["STEP4.goToStep3", [], "Go to step 3"],
  ["STEP4.blockedReason", [], "No stocks are followed. Follow stocks before downloading."],
  ["STEP4.goHome", [], "Go to Home"],
  ["STEP4.manageFollowed", [], "Manage followed stocks"],
  ["STEP4.progressUnreadable", [], "Progress can't be read right now"],
  ["READ_ERRORS.subjects.depth", [], "history depth"],
  ["READ_ERRORS.subjects.followed", [], "the followed list"],
  [
    "READ_ERRORS.readFailed",
    ["history depth", "the server said no"],
    "Couldn't read history depth: the server said no",
  ],
  ["READ_ERRORS.tryAgain", [], "Try again"],
  ["READ_ERRORS.notAnswering", [], "FactorFlow is not answering"],
  ["READ_ERRORS.unexpected", [], "FactorFlow hit an unexpected problem"],
  [
    "STEP2.saveFailed",
    ["FactorFlow is not answering"],
    "Couldn't save history depth: FactorFlow is not answering",
  ],
  ["STEP3.duplicateEntry", ["KO"], "KO, listed more than once"],
  ["STEP3.alreadyFollowedEntry", ["KO"], "KO, already followed"],
  [
    "STEP3.saveFailed",
    ["FactorFlow is not answering"],
    "Couldn't save the followed list: FactorFlow is not answering",
  ],
  ["STEP3.followedSoFar", ["1,000"], "1,000 followed so far."],
  ["STEP3.keptForRetry", ["1,500"], "1,500 not saved yet; kept in the list to try again."],
];

describe("setup copy is complete and verbatim", () => {
  it.each(ROWS)("%s", (dotted, args, expected) => {
    expect(textAt(dotted, args)).toBe(expected);
  });

  it("numbers each of the four steps out of four", () => {
    expect(copy.stepPosition(1)).toBe("Step 1 of 4");
    expect(copy.stepPosition(2)).toBe("Step 2 of 4");
    expect(copy.stepPosition(3)).toBe("Step 3 of 4");
    expect(copy.stepPosition(4)).toBe("Step 4 of 4");
  });

  it("titles exactly four steps, so the paper trading step is absent", () => {
    expect(Object.keys(copy.STEP_TITLES)).toEqual(["1", "2", "3", "4"]);
  });
});
