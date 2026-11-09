import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { RunState } from "../../api/types";
import type { Status } from "./tiers";
import { type DataAnswer, TIER_ORDER, dataTileBadge, worstDataTier } from "./worst-data-tier";

type ScoresStatus = Extract<Status, { of: "scores" }>;

// Implements TC-COMP-026
describe("worstDataTier (TC-COMP-026, DAC-E1-3, DAC-E1-4)", () => {
  it.each([
    [0, 10],
    [3, 10],
    [10, 10],
  ])(
    "returns null before any download ended: affected %i of %i (DAC-E1-3)",
    (affectedCount, followedCount) => {
      expect(
        worstDataTier({ affectedCount, followedCount, latestTerminalDownload: null }),
      ).toBeNull();
    },
  );

  const problemRows: [number, number, DataAnswer][] = [
    [0, 10, { tier: "good", word: "Yes", downloadClause: null }],
    [3, 10, { tier: "warning", word: "Mostly yes", downloadClause: null }],
    [9, 10, { tier: "warning", word: "Mostly yes", downloadClause: null }],
    [10, 10, { tier: "critical", word: "No", downloadClause: null }],
    [1, 1, { tier: "critical", word: "No", downloadClause: null }],
    [11, 10, { tier: "critical", word: "No", downloadClause: null }],
    [0, 0, { tier: "good", word: "Yes", downloadClause: null }],
    // DEC-0312: an inconsistent read (affected with nobody followed) is critical, never better than the data.
    [1, 0, { tier: "critical", word: "No", downloadClause: null }],
    [5, 0, { tier: "critical", word: "No", downloadClause: null }],
  ];
  it.each(problemRows)(
    "succeeded download, affected %i of %i",
    (affectedCount, followedCount, expected) => {
      expect(
        worstDataTier({ affectedCount, followedCount, latestTerminalDownload: "succeeded" }),
      ).toEqual(expected);
    },
  );

  const downloadRows: [RunState, number, number, DataAnswer][] = [
    ["failed", 0, 10, { tier: "critical", word: "No", downloadClause: "failed" }],
    ["failed", 3, 10, { tier: "critical", word: "No", downloadClause: "failed" }],
    ["failed", 10, 10, { tier: "critical", word: "No", downloadClause: "failed" }],
    ["abandoned", 0, 10, { tier: "serious", word: "Mostly yes", downloadClause: "interrupted" }],
    ["abandoned", 3, 10, { tier: "serious", word: "Mostly yes", downloadClause: "interrupted" }],
    ["abandoned", 10, 10, { tier: "critical", word: "No", downloadClause: "interrupted" }],
  ];
  it.each(downloadRows)(
    "%s download, affected %i of %i",
    (state, affectedCount, followedCount, expected) => {
      expect(
        worstDataTier({ affectedCount, followedCount, latestTerminalDownload: state }),
      ).toEqual(expected);
    },
  );

  // A RunState added later without a decision fails `npx tsc --noEmit` here.
  const noTier: Record<Exclude<RunState, "failed" | "abandoned">, true> = {
    requested: true,
    running: true,
    cancelling: true,
    succeeded: true,
    partial: true,
    cancelled: true,
  };
  it.each(Object.keys(noTier) as (keyof typeof noTier)[])(
    "%s download contributes no tier",
    (state) => {
      expect(
        worstDataTier({ affectedCount: 0, followedCount: 10, latestTerminalDownload: state }),
      ).toEqual({ tier: "good", word: "Yes", downloadClause: null });
      expect(
        worstDataTier({ affectedCount: 3, followedCount: 10, latestTerminalDownload: state }),
      ).toEqual({ tier: "warning", word: "Mostly yes", downloadClause: null });
    },
  );
});

// Implements TC-COMP-001
describe("dataTileBadge (TC-COMP-001, DAC-E1-5, DAC-E1-3)", () => {
  const GOOD: DataAnswer = { tier: "good", word: "Yes", downloadClause: null };
  const WARNING: DataAnswer = { tier: "warning", word: "Mostly yes", downloadClause: null };
  const SERIOUS: DataAnswer = {
    tier: "serious",
    word: "Mostly yes",
    downloadClause: "interrupted",
  };
  const CRITICAL: DataAnswer = { tier: "critical", word: "No", downloadClause: "failed" };
  const scores = (state: ScoresStatus["state"]): ScoresStatus => ({ of: "scores", state });

  it("a worse score state wins with its own label: warning + failed", () => {
    expect(dataTileBadge(WARNING, scores("failed"))).toEqual({
      tier: "critical",
      label: "Score update failed",
      from: "scores",
    });
  });

  it("a tie goes to the verdict: warning + not_current", () => {
    expect(dataTileBadge(WARNING, scores("not_current"))).toEqual({
      tier: "warning",
      label: "Mostly yes",
      from: "verdict",
    });
  });

  it.each([null, scores("never_classified"), scores("building"), scores("current")])(
    "warning verdict stays when scores are %j",
    (s) => {
      expect(dataTileBadge(WARNING, s)).toEqual({
        tier: "warning",
        label: "Mostly yes",
        from: "verdict",
      });
    },
  );

  it("good + not_current: the scores win", () => {
    expect(dataTileBadge(GOOD, scores("not_current"))).toEqual({
      tier: "warning",
      label: "Not reflecting the latest download",
      from: "scores",
    });
  });

  it.each([null, scores("building"), scores("never_classified"), scores("current")])(
    "good verdict stays when scores are %j (active ranks alongside good)",
    (s) => {
      expect(dataTileBadge(GOOD, s)).toEqual({ tier: "good", label: "Yes", from: "verdict" });
    },
  );

  it("serious outranks warning: serious + not_current", () => {
    expect(dataTileBadge(SERIOUS, scores("not_current"))).toEqual({
      tier: "serious",
      label: "Mostly yes",
      from: "verdict",
    });
  });

  it("serious + failed: the scores win", () => {
    expect(dataTileBadge(SERIOUS, scores("failed"))).toEqual({
      tier: "critical",
      label: "Score update failed",
      from: "scores",
    });
  });

  it("critical + failed: a tie at critical goes to the verdict", () => {
    expect(dataTileBadge(CRITICAL, scores("failed"))).toEqual({
      tier: "critical",
      label: "No",
      from: "verdict",
    });
  });

  // A score state added later must be listed here.
  const everyScoreState: Record<ScoresStatus["state"], true> = {
    never_classified: true,
    building: true,
    not_current: true,
    failed: true,
    current: true,
  };
  it("a null verdict yields null for a null score state", () => {
    expect(dataTileBadge(null, null)).toBeNull();
  });
  it.each(Object.keys(everyScoreState) as ScoresStatus["state"][])(
    "a null verdict yields null for score state %s (failed and not_current included)",
    (state) => {
      expect(dataTileBadge(null, scores(state))).toBeNull();
    },
  );
});

const THIS_FILE = fileURLToPath(import.meta.url);
const PATTERNS_DIR = path.dirname(THIS_FILE);
const WEB_SRC = path.resolve(PATTERNS_DIR, "..", "..");
const ORDER_MODULE = path.join(PATTERNS_DIR, "worst-data-tier.ts");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const IMPORT_TIER_ORDER =
  /import\s*(?:type\s*)?\{[^}]*\bTIER_ORDER\b[^}]*\}\s*from\s*["'][^"']*\/worst-data-tier["']/;

const TIER_NAME = "critical|serious|warning|good|active|neutral";
const ARRAY_ORDER = new RegExp(
  `\\[\\s*(["'])(${TIER_NAME})\\1\\s*,\\s*(["'])(${TIER_NAME})\\3\\s*,\\s*(["'])(${TIER_NAME})\\5`,
);
const RECORD_ORDER = new RegExp(
  `\\b(${TIER_NAME})\\s*:\\s*-?\\d+\\s*,\\s*(${TIER_NAME})\\s*:\\s*-?\\d+`,
);

function tierOrderLiteralsIn(source: string): string[] {
  return [ARRAY_ORDER, RECORD_ORDER].flatMap((pattern) => {
    const match = pattern.exec(source);
    return match ? [match[0]] : [];
  });
}

// Implements TC-COMP-027
describe("TIER_ORDER is the one tier order (TC-COMP-027, DAC-E1-S7-2)", () => {
  const files = sourceFiles(WEB_SRC).filter((file) => file !== THIS_FILE);
  const stripped = new Map(files.map((file) => [file, stripComments(readFileSync(file, "utf-8"))]));

  it("exactly one source declares TIER_ORDER, exported, in worst-data-tier.ts", () => {
    expect(files.length).toBeGreaterThan(0);
    const declaring = files.filter((file) =>
      /\b(?:const|let|var)\s+TIER_ORDER\b/.test(stripped.get(file) ?? ""),
    );
    expect(declaring).toEqual([ORDER_MODULE]);
    const exported = (stripped.get(ORDER_MODULE) ?? "").match(/export\s+const\s+TIER_ORDER\b/g);
    expect(exported).toHaveLength(1);
  });

  it("every other source that mentions TIER_ORDER imports it from worst-data-tier", () => {
    const offenders = files.filter((file) => {
      const text = stripped.get(file) ?? "";
      return file !== ORDER_MODULE && /\bTIER_ORDER\b/.test(text) && !IMPORT_TIER_ORDER.test(text);
    });
    expect(offenders).toEqual([]);
  });

  const needsYou = path.join(PATTERNS_DIR, "needs-you.ts");
  it.runIf(existsSync(needsYou))(
    "sortAttention's module imports TIER_ORDER from ./worst-data-tier",
    () => {
      expect(IMPORT_TIER_ORDER.test(stripComments(readFileSync(needsYou, "utf-8")))).toBe(true);
    },
  );

  it("tierOrderLiteralsIn finds a second order literal and ignores the Tier union", () => {
    expect(tierOrderLiteralsIn('const ORDER = ["critical", "serious", "warning"]')).toHaveLength(1);
    expect(tierOrderLiteralsIn("{ critical: 0, serious: 1 }")).toHaveLength(1);
    expect(tierOrderLiteralsIn('type Tier = "neutral" | "active" | "good"')).toEqual([]);
    expect(tierOrderLiteralsIn("{ active: 2, retired: 1 }")).toEqual([]);
  });

  it("no other source declares a second order literal", () => {
    const offenders = files
      .filter((file) => file !== ORDER_MODULE)
      .filter((file) => tierOrderLiteralsIn(stripped.get(file) ?? "").length > 0);
    expect(offenders).toEqual([]);
  });
});

describe("TIER_ORDER semantics (DEC-0217, DEC-0311)", () => {
  it("ranks exactly the six tiers", () => {
    expect(Object.keys(TIER_ORDER).sort()).toEqual([
      "active",
      "critical",
      "good",
      "neutral",
      "serious",
      "warning",
    ]);
  });

  it("critical < serious < warning < good < neutral, pairwise", () => {
    expect(TIER_ORDER.critical).toBeLessThan(TIER_ORDER.serious);
    expect(TIER_ORDER.serious).toBeLessThan(TIER_ORDER.warning);
    expect(TIER_ORDER.warning).toBeLessThan(TIER_ORDER.good);
    expect(TIER_ORDER.good).toBeLessThan(TIER_ORDER.neutral);
  });

  it("active ranks alongside good", () => {
    expect(TIER_ORDER.active).toBe(TIER_ORDER.good);
  });

  it("an ascending sort puts the most severe first, active with good", () => {
    const list = ["neutral", "good", "critical", "active", "warning", "serious"] as const;
    const sorted = [...list].sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b]);
    expect(sorted).toEqual(["critical", "serious", "warning", "good", "active", "neutral"]);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(TIER_ORDER)).toBe(true);
  });
});
