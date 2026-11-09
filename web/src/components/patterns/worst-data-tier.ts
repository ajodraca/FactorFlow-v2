import type { RunState } from "../../api/types";
import { type Status, type Tier, labelOf, tierOf } from "./tiers";

/**
 * The data verdict, composed once (component design `ui-components` 2.4;
 * DAC-E1-3, DAC-E1-4, DAC-E1-5; AC-8, AC-11, AC-21). Data health's verdict and
 * Home's data tile both call these, so the two surfaces cannot disagree. The
 * checks' tiers do not feed the answer (DEC-0210 as amended): only the problem
 * set and the latest terminal download do. Not determinable is not an answer of
 * this module.
 */

/**
 * The one six-tier order of the owner interface (DEC-0217 as amended, DEC-0311):
 * ascending rank is severity order, lower is worse, and active ranks alongside
 * good. `sortAttention` (`needs-you.ts`) imports it; no other order may be
 * declared (TC-COMP-027).
 */
export const TIER_ORDER: Readonly<Record<Tier, number>> = Object.freeze({
  critical: 0,
  serious: 1,
  warning: 2,
  good: 3,
  active: 3,
  neutral: 4,
});

export type DataAnswer = {
  tier: "good" | "warning" | "serious" | "critical";
  word: "Yes" | "Mostly yes" | "No";
  downloadClause: "failed" | "interrupted" | null;
};

const WORD: Record<DataAnswer["tier"], DataAnswer["word"]> = {
  good: "Yes",
  warning: "Mostly yes",
  serious: "Mostly yes",
  critical: "No",
};

export function worstDataTier(inputs: {
  affectedCount: number;
  followedCount: number;
  latestTerminalDownload: RunState | null;
}): DataAnswer | null {
  const { affectedCount, followedCount, latestTerminalDownload } = inputs;
  if (latestTerminalDownload === null) {
    return null;
  }

  // DEC-0312: affected >= followed is critical, which includes followedCount 0.
  let tier: DataAnswer["tier"] =
    affectedCount === 0 ? "good" : affectedCount >= followedCount ? "critical" : "warning";

  let downloadTier: DataAnswer["tier"] | null = null;
  let downloadClause: DataAnswer["downloadClause"] = null;
  if (latestTerminalDownload === "failed") {
    downloadTier = "critical";
    downloadClause = "failed";
  } else if (latestTerminalDownload === "abandoned") {
    downloadTier = "serious";
    downloadClause = "interrupted";
  }

  if (downloadTier !== null && TIER_ORDER[downloadTier] < TIER_ORDER[tier]) {
    tier = downloadTier;
  }
  return { tier, word: WORD[tier], downloadClause };
}

export function dataTileBadge(
  verdict: DataAnswer | null,
  scores: Extract<Status, { of: "scores" }> | null,
): { tier: Tier; label: string; from: "verdict" | "scores" } | null {
  if (verdict === null) {
    return null;
  }
  if (scores !== null && TIER_ORDER[tierOf(scores)] < TIER_ORDER[verdict.tier]) {
    return { tier: tierOf(scores), label: labelOf(scores), from: "scores" };
  }
  return { tier: verdict.tier, label: verdict.word, from: "verdict" };
}
