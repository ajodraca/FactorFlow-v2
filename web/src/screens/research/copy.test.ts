import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ClassificationApiError } from "../../api/classification-client";
import type {
  ClassificationOperation,
  ClassificationResource,
} from "../../api/classification-types";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../api/research-query";
import * as copy from "./copy";

/** Arguments every template function is called with unless a path below names its own. */
const REPRESENTATIVE: unknown[] = [
  "Tech",
  12,
  "2026-10-15 17:46 CDT",
  "AAPL",
  "the download ended",
];

const SAMPLE_QUERY: ResearchQuery = {
  ...DEFAULT_RESEARCH_QUERY,
  sentences: {
    value: { measure: "percentile", direction: "atLeast", value: "80" },
    momentum: { measure: "standardisedScore", direction: "atLeast", value: "0.00" },
  },
  hideIncomplete: true,
  symbol: "AA",
};

/** Each error sentence is rendered with and without the optional context, so every branch is scanned. */
const ERROR_CONTEXTS = [
  {
    action: "Could not create the universe",
    resource: "universe",
    symbols: ["MSFT", "TSLA"],
    universeName: "Tech",
  },
  { action: "Could not load the universe", resource: "universe", symbols: [], universeName: null },
];

/** The calls for functions whose parameters are not strings or numbers, or that branch on them. */
const CALLS: Record<string, unknown[][]> = {
  failureSentence: [
    [
      {
        operation: "create-universe",
        resource: "universe",
        code: "instrument_not_acquired",
        symbols: ["MSFT", "TSLA"],
      },
    ],
  ],
  describeQuery: [[SAMPLE_QUERY]],
  savedFromFilter: [["2026-10-15", SAMPLE_QUERY]],
  "SELECTION.inUniverses": [[["Tech", "Dividend growers"]]],
  "SELECTION.inputsLine": [
    [["book-to-price", "earnings yield", "free-cash-flow yield"], "2025-06-27", "2026-10-14"],
  ],
  "DIALOGS.added": [
    [3, "Tech", 0],
    [3, "Tech", 2],
  ],
};

function callsFor(at: string): unknown[][] {
  if (at.startsWith("ERROR_SENTENCES.")) {
    return ERROR_CONTEXTS.map((context) => [context]);
  }
  return CALLS[at] ?? [REPRESENTATIVE];
}

/**
 * Every owner-facing string under `value`: constants, nested values and each
 * template function's result for its representative arguments.
 */
function flatten(value: unknown, at: string): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (typeof value === "function") {
    return callsFor(at).map((args) => {
      const result: unknown = value(...args);
      expect(typeof result, `${at} returns a string`).toBe("string");
      return result as string;
    });
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, inner]) =>
      flatten(inner, at === "" ? key : `${at}.${key}`),
    );
  }
  return [];
}

/** `SHELL_ROUTES` holds link targets, not owner-facing text. */
const NOT_OWNER_FACING = new Set(["SHELL_ROUTES"]);

const CATALOGUE: string[] = Object.entries(copy)
  .filter(([name]) => !NOT_OWNER_FACING.has(name))
  .flatMap(([name, value]) => flatten(value, name));

const UNIVERSE_LIFECYCLE_STRINGS: string[] = flatten(copy.UNIVERSE_LIFECYCLE, "UNIVERSE_LIFECYCLE");

/**
 * Every sentence `failureSentence` can compose: each operation, resource and
 * code (an unknown and an absent code included), with and without the
 * optional context (IR-005; DEC-0226).
 */
const COMPOSED_FAILURES: string[] = [
  ...new Set(
    (Object.keys(copy.OPERATION_LABELS) as ClassificationOperation[]).flatMap((operation) =>
      (Object.keys(copy.RESOURCE_LABELS) as ClassificationResource[]).flatMap((resource) =>
        [...Object.keys(copy.ERROR_SENTENCES), "not_a_code", null].flatMap((code) =>
          [{ symbols: ["MSFT", "TSLA"], universeName: "Tech" }, {}].map((context) =>
            copy.failureSentence({ operation, resource, code, ...context }),
          ),
        ),
      ),
    ),
  ),
];

const FORBIDDEN: RegExp[] = [/\binstruments?\b/i, /\bacquisition runs?\b/i, /\bnot classified\b/i];
const RETIRE = /\bretir(?:e|ed|es|ing)\b/i;

/**
 * DEC-0146: *score* shortened from a percentile or standardised score. Rejected
 * after a factor name or *percentile*, or before a threshold or a number unless
 * *standardised* precedes it, and the *standardized* spelling.
 */
const BARE_SCORE: RegExp[] = [
  /\b(?:value|growth|momentum|percentile)\s+scores?\b/i,
  /(?<!\bstandardised\s)\bscores?\s+(?:at\s+(?:least|most)\b|[+\-−]?\d)/i,
  /\bstandardized\b/i,
];

/**
 * DEC-0145 as applied by DEC-0226 (PROVISIONAL): *retire* may appear only inside an
 * allow-listed string, either the whole text or the `{allowed}: ` prefix of a
 * composed failure sentence whose remainder says *retire* nowhere.
 */
function retireAllowed(text: string, allowed: readonly string[]): boolean {
  return allowed.some(
    (entry) =>
      text === entry || (text.startsWith(`${entry}: `) && !RETIRE.test(text.slice(entry.length))),
  );
}

/** The STD-UI-19 vocabulary violations of `text` (DAC-E4-S2-4; DEC-0145, DEC-0146). */
function violations(text: string, allowed: readonly string[]): string[] {
  const found = FORBIDDEN.filter((pattern) => pattern.test(text)).map(String);
  if (RETIRE.test(text) && !retireAllowed(text, allowed)) {
    found.push("retire outside UNIVERSE_LIFECYCLE");
  }
  found.push(...BARE_SCORE.filter((pattern) => pattern.test(text)).map(String));
  return found;
}

// Implements TC-COMP-072 (T004): DAC-E4-S2-4, DAC-E4-1.
describe("TC-COMP-072: copy.ts contains no forbidden vocabulary", () => {
  it("scans a non-trivial catalogue", () => {
    expect(CATALOGUE.length).toBeGreaterThan(100);
    expect(UNIVERSE_LIFECYCLE_STRINGS.length).toBeGreaterThan(0);
  });

  it("flags the known-bad strings and passes the approved ones", () => {
    for (const bad of [
      "Retire this instrument",
      "Value score at least 80",
      "Not classified",
      "acquisition run 3",
      "Retired stocks",
      "percentile score",
      "growth score 1.27",
      "standardized score at least 1",
      "score at least 80",
    ]) {
      expect(violations(bad, []), bad).not.toEqual([]);
    }
    for (const good of [
      "momentum standardised score at least 0.00",
      "Score update failed",
      "Scores from 2026-10-15 17:46 CDT",
      "Hide stocks with an incomplete score",
      "The small number is the standardised score.",
    ]) {
      expect(violations(good, []), good).toEqual([]);
    }
    expect(violations("Retire Tech", ["Retire Tech"])).toEqual([]);
    const label = "Could not retire the universe";
    expect(violations(`${label}: FactorFlow hit an unexpected problem.`, [label])).toEqual([]);
    for (const bad of [`${label}: retire AAPL instead.`, `${label}; try again.`, `${label}:`]) {
      expect(violations(bad, [label]), bad).not.toEqual([]);
    }
    expect(violations(`${label}: FactorFlow hit an unexpected problem.`, [])).not.toEqual([]);
  });

  it("scans every composed failure sentence, the retire-universe ones included", () => {
    expect(COMPOSED_FAILURES.length).toBeGreaterThan(200);
    expect(
      COMPOSED_FAILURES.filter((text) => text.startsWith(copy.UNIVERSE_LIFECYCLE.retireFailed))
        .length,
    ).toBeGreaterThan(10);
    const flagged = COMPOSED_FAILURES.map((text) => ({
      text,
      found: violations(text, UNIVERSE_LIFECYCLE_STRINGS),
    })).filter(({ found }) => found.length > 0);
    expect(flagged).toEqual([]);
  });

  it.each(CATALOGUE)("%j uses only STD-UI-1 display labels", (text) => {
    expect(violations(text, UNIVERSE_LIFECYCLE_STRINGS)).toEqual([]);
  });

  it.each(UNIVERSE_LIFECYCLE_STRINGS)(
    "universe-lifecycle string %j mentions no stock or following",
    (text) => {
      expect(text).not.toMatch(/stock|instrument|follow/i);
    },
  );
});

// T007: catalogue completeness and keying (DAC-E4-1, DAC-E4-S2-4; DEC-0149).
describe("copy.ts completeness and keying", () => {
  const CODES = [
    "instrument_not_acquired",
    "empty_universe",
    "universe_name_in_use",
    "classification_set_changed",
    "universe_not_found",
    "universe_retired",
    "not_a_member",
    "last_member",
    "instrument_not_found",
    "cursor_invalid",
    "cursor_stale",
    "classification_set_not_found",
    "validation_error",
    "internal_error",
  ];
  const OPERATIONS: ClassificationOperation[] = [
    "list-universes",
    "create-universe",
    "get-universe",
    "rename-universe",
    "retire-universe",
    "list-universe-events",
    "add-universe-members",
    "remove-universe-member",
    "list-classifications",
    "get-classification-summary",
    "list-classification-sets",
    "get-classification-set",
    "get-stock-evidence",
    "get-stock-history",
  ];
  const RESOURCES: ClassificationResource[] = [
    "universe",
    "universe-member",
    "classification",
    "classification-set",
  ];

  it("(a) has exactly one sentence per error code of classification-api 2.5", () => {
    expect(Object.keys(copy.ERROR_SENTENCES).sort()).toEqual([...CODES].sort());
    for (const code of CODES) {
      const sentence = copy.failureSentence({
        operation: "get-universe",
        resource: "universe",
        code,
        symbols: ["MSFT"],
      });
      expect(sentence, code).not.toContain(code);
      expect(sentence, code).toMatch(/[.]$/);
    }
  });

  it("(a) falls back to a generic sentence and never reads the envelope message", () => {
    for (const code of ["weird_code", null]) {
      const error = new ClassificationApiError("Leaked envelope text with code", "req-1", {
        code,
        operation: "list-classifications",
        resource: "classification",
      });
      const sentence = copy.failureSentence(error);
      expect(sentence).toBe(`Could not load the scores: ${copy.FALLBACK_ERROR}`);
      expect(sentence).not.toContain("weird_code");
      expect(sentence).not.toMatch(/error/i);
      expect(sentence).not.toContain("Leaked envelope text");
    }
    expect(copy.FALLBACK_ERROR).not.toMatch(/error/i);
    const known = new ClassificationApiError("Leaked envelope text", "req-2", {
      code: "universe_retired",
      operation: "add-universe-members",
      resource: "universe",
    });
    expect(copy.failureSentence(known)).not.toContain("Leaked envelope text");
  });

  it("(b) names every unfollowed symbol in the order given, as the design reads", () => {
    const error = new ClassificationApiError("FactorFlow follows everything", "req-3", {
      code: "instrument_not_acquired",
      operation: "create-universe",
      resource: "universe",
      symbols: ["MSFT", "TSLA"],
    });
    expect(copy.failureSentence(error)).toBe(
      "Could not create the universe: FactorFlow doesn't follow MSFT, TSLA. Follow them on Data health, then try again.",
    );
    expect(
      copy.failureSentence({
        operation: "add-universe-members",
        resource: "universe-member",
        code: "instrument_not_acquired",
        symbols: ["TSLA", "AMZN", "MSFT"],
      }),
    ).toBe(
      "Could not add the stocks to the universe: FactorFlow doesn't follow TSLA, AMZN, MSFT. Follow them on Data health, then try again.",
    );
  });

  it("selects each code's sentence and the operation's and resource's labels", () => {
    expect(
      copy.failureSentence({
        operation: "rename-universe",
        resource: "universe",
        code: "universe_name_in_use",
        universeName: "Tech",
      }),
    ).toBe("Could not rename the universe: another active universe is already named Tech.");
    const nameless = new ClassificationApiError("Tech is taken", "req-4", {
      code: "universe_name_in_use",
      operation: "create-universe",
      resource: "universe",
    });
    expect(copy.failureSentence(nameless)).toBe(
      "Could not create the universe: another active universe already has this name.",
    );
    expect(copy.failureSentence({ ...nameless, universeName: "Tech" })).toBe(
      "Could not create the universe: another active universe is already named Tech.",
    );
    expect(
      copy.failureSentence({
        operation: "create-universe",
        resource: "universe",
        code: "classification_set_changed",
      }),
    ).toBe(copy.DIALOGS.setChanged);
    expect(
      copy.failureSentence({
        operation: "add-universe-members",
        resource: "universe",
        code: "universe_retired",
      }),
    ).toBe(copy.UNIVERSE_LIFECYCLE.retiredRefusal);
    expect(
      copy.failureSentence({
        operation: "remove-universe-member",
        resource: "universe-member",
        code: "last_member",
      }),
    ).toBe(copy.UNIVERSE_LIFECYCLE.lastMember);
    expect(
      copy.failureSentence({
        operation: "get-stock-evidence",
        resource: "classification",
        code: "instrument_not_found",
        symbols: ["XYZ"],
      }),
    ).toBe("FactorFlow doesn't follow a stock named XYZ.");
    expect(
      copy.failureSentence({
        operation: "get-universe",
        resource: "universe",
        code: "universe_not_found",
      }),
    ).toBe("No universe with this address exists.");
    expect(
      copy.failureSentence({
        operation: "get-classification-set",
        resource: "classification-set",
        code: "classification_set_not_found",
      }),
    ).toBe("Could not load the set of scores: that set of scores does not exist.");
    expect(
      copy.failureSentence({
        operation: "list-classifications",
        resource: "classification",
        code: "internal_error",
      }),
    ).toBe(`Could not load the scores: ${copy.FALLBACK_ERROR}`);
  });

  it("(c) labels every ClassificationOperation and ClassificationResource", () => {
    expect(Object.keys(copy.OPERATION_LABELS).sort()).toEqual([...OPERATIONS].sort());
    expect(Object.keys(copy.RESOURCE_LABELS).sort()).toEqual([...RESOURCES].sort());
    for (const operation of OPERATIONS) {
      expect(copy.OPERATION_LABELS[operation]).toMatch(/^Could not [a-z]/);
    }
    for (const resource of RESOURCES) {
      expect(copy.RESOURCE_LABELS[resource]).not.toBe("");
    }
    expect(copy.OPERATION_LABELS["get-classification-summary"]).toBe(
      "Could not check for newer scores",
    );
  });

  it.each([
    "No stocks have been scored yet.",
    "No stocks match these filters.",
    "Not reflecting the latest download",
    "Could not check for newer scores.",
    "Choose 2 to 6 stocks to compare.",
    "A comparison holds up to 6 stocks.",
    "Select a stock to see why it scores as it does.",
    "Incomplete",
    "Not enough to rank",
    "Not followed",
    "Possibly restated",
    "Outdated",
    "Couldn't be computed",
    "This universe is retired and can't be changed. Its members and history are still viewable.",
    "This is the last member. Retire the universe instead.",
    "Enter at least one stock.",
    "Up to 1000 stocks can be added in one request.",
    "Check 2 to 6 stocks to compare them.",
    "Hide stocks with an incomplete score",
    "They're shown by default so nothing disappears silently.",
    'Percentile 70 means "scores better than 70% of the stocks scored on this factor".',
    "Clear filters",
    "Open Data health",
    "Earlier sets…",
    "Find a stock",
    "A score is shown only when every input is present and current. This checks presence and currency, not whether the provider's values are correct.",
    "No stocks match these filters, so there is nothing to save.",
    "Could not save these stocks as a universe: the scores changed while you were reviewing them. Review the new result, then save again.",
  ])("(d) holds the design's %j verbatim", (anchor) => {
    expect(CATALOGUE).toContain(anchor);
  });

  it("(d) renders the templated design messages for the design's example arguments", () => {
    expect(copy.CELL.qualified(12, 30)).toBe("12 qualified, 30 needed");
    expect(copy.DIALOGS.saved(14, "Tech")).toBe("Saved 14 stocks as Tech");
    expect(copy.DIALOGS.added(3, "Tech", 0)).toBe("Added 3 stocks to Tech");
    expect(copy.DIALOGS.added(3, "Tech", 1)).toBe(
      "Added 3 stocks to Tech, and 1 were already members",
    );
    expect(copy.DIALOGS.added(3, "Tech", 2)).toBe(
      "Added 3 stocks to Tech, and 2 were already members",
    );
    expect(copy.SCORE_SET.asOfLine("2026-10-15 17:46 CDT", "2026-10-15 17:30 CDT", "value")).toBe(
      "Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT · sorted by value",
    );
    expect(copy.SCORE_SET.asOfLine("2026-10-15 17:46 CDT", "2026-10-15 17:30 CDT", null)).toBe(
      "Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT",
    );
    expect(copy.SCORE_SET.openDownload("2026-10-15 17:30 CDT")).toBe(
      "Open the download started 2026-10-15 17:30 CDT",
    );
    expect(copy.SCORE_SET.scoresUpdatedTo("2026-10-16 17:48 CDT", "2026-10-16 17:30 CDT")).toBe(
      "Scores updated to 2026-10-16 17:48 CDT from the download started 2026-10-16 17:30 CDT",
    );
    expect(copy.SCORE_SET.checked("17:52:10 CDT")).toBe("checked 17:52:10 CDT");
    expect(copy.SCORE_SET.buildingBody("17:46 CDT", "2026-10-15 17:30 CDT")).toBe(
      "Showing scores produced 17:46 CDT from the download started 2026-10-15 17:30 CDT. A newer set is being produced and replaces this one when complete.",
    );
    expect(
      copy.SCORE_SET.failedBody(
        "18:03 CDT",
        "the download ended",
        "17:46 CDT",
        "2026-10-15 17:30 CDT",
      ),
    ).toBe(
      "Score update failed 18:03 CDT: the download ended. Showing scores produced 17:46 CDT from the download started 2026-10-15 17:30 CDT. The next complete download will try again.",
    );
    expect(copy.EVIDENCE.noEarlierScores("AAPL").startsWith("No earlier scores for")).toBe(true);
    expect(copy.EVIDENCE.noEarlierScores("AAPL")).toBe("No earlier scores for AAPL.");
    expect(copy.CELL.notFollowedSince("2026-10-01")).toBe(
      "Not followed since 2026-10-01. Earlier scores stand.",
    );
    expect(
      copy.CELL.incompleteReason(
        "revenue for the quarter ending 2025-06-27",
        copy.CELL.incompleteStatus.input_missing,
        "growth",
      ),
    ).toBe(
      "Incomplete: revenue for the quarter ending 2025-06-27 is missing, so growth can't be compared fairly. It isn't guessed.",
    );
    expect(copy.SELECTION.inUniverses(["Tech", "Dividend growers"])).toBe(
      "In Tech and Dividend growers",
    );
    expect(copy.SELECTION.inUniverses(["Tech", "Value", "Dividend growers"])).toBe(
      "In Tech, Value and Dividend growers",
    );
    expect(copy.SELECTION.inUniverses(["Tech"])).toBe("In Tech");
    expect(
      copy.SELECTION.inputsLine(
        ["book-to-price", "earnings yield", "free-cash-flow yield"],
        "2025-06-27",
        "2026-10-14",
      ),
    ).toBe(
      "From book-to-price, earnings yield and free-cash-flow yield, as of 2025-06-27, known 2026-10-14",
    );
    expect(copy.FILTERS.allFollowedStocksOption(3000)).toBe("All followed stocks · 3000");
    expect(copy.FILTERS.thresholdFor("value")).toBe("Value threshold");
    expect(copy.FILTERS.measureFor("value")).toBe("Measure for value");
    expect(copy.FILTERS.directionFor("value")).toBe("Direction for value");
    expect(copy.UNIVERSE_DETAIL.didNotExist("Tech", "2026-01-01", "2026-10-15")).toBe(
      "Tech did not exist on 2026-01-01. It was created on 2026-10-15.",
    );
    expect(copy.EVIDENCE.onlyQualified(12, 30, "value")).toBe(
      "Only 12 of 30 stocks qualified on value in this set, so no stock was ranked on it.",
    );
  });

  it("describes a query in words, each clause only when it applies", () => {
    expect(copy.describeQuery(SAMPLE_QUERY)).toBe(
      'value percentile at least 80 · momentum standardised score at least 0.00 · search "AA" · stocks with an incomplete score hidden',
    );
    expect(copy.describeQuery(DEFAULT_RESEARCH_QUERY)).toBe("");
    expect(
      copy.describeQuery({
        ...DEFAULT_RESEARCH_QUERY,
        sentences: { growth: { measure: "percentile", direction: "atMost", value: "30" } },
      }),
    ).toBe("growth percentile at most 30");
    expect(copy.savedFromFilter("2026-10-15", SAMPLE_QUERY)).toBe(
      'Saved from a filter on 2026-10-15: value percentile at least 80, momentum standardised score at least 0.00; search "AA"; stocks with an incomplete score hidden',
    );
    expect(copy.savedFromFilter("2026-10-15", { ...DEFAULT_RESEARCH_QUERY, symbol: "AA" })).toBe(
      'Saved from a filter on 2026-10-15: search "AA"',
    );
  });

  it("(e) holds no identifier, input marker, or implementation or generic word", () => {
    for (const text of CATALOGUE) {
      expect(text, text).not.toMatch(/\b[a-z]+_[a-z_]+\b/);
      expect(text, text).not.toContain("[REQUIRES INPUT");
      expect(text, text).not.toMatch(
        /\b(?:null|undefined|exception|timeout|500|job|sync|import|task|item|object|entity|record|delete)\b/i,
      );
    }
  });

  it("(f) points SHELL_ROUTES at routes the delivered router declares", () => {
    const routesPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "app",
      "routes.tsx",
    );
    const declared = [...readFileSync(routesPath, "utf-8").matchAll(/path="([^"]+)"/g)].map(
      (match) => match[1] as string,
    );
    // The catch-all renders Not found; a link resolving only to it does not exist.
    const destinations = declared.filter((route) => route !== "*");
    const resolves = (target: string): boolean =>
      destinations.some((route) =>
        new RegExp(`^${route.replace(/:[A-Za-z]+/g, "[^/]+")}$`).test(target),
      );
    expect(declared).toContain("/runs/:runId");
    expect(copy.SHELL_ROUTES.download("8d9a3c1e-0000-4000-8000-000000000001")).toBe(
      "/runs/8d9a3c1e-0000-4000-8000-000000000001",
    );
    expect(resolves(copy.SHELL_ROUTES.download("r1"))).toBe(true);
    expect(resolves(copy.SHELL_ROUTES.dataHealth)).toBe(true);
    expect(copy.SHELL_ROUTES.dataHealth).toBe("/runs");
    expect(resolves(copy.SHELL_ROUTES.followedStocks)).toBe(true);
    expect(copy.SHELL_ROUTES.followedStocks).toBe("/instruments");
  });
});
