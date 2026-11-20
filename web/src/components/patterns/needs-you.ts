import type { RunState } from "../../api/types";
import type { Attention, ScoreState } from "../../app/shell-types";
import { type NeedsYouKind, type Tier, tierOf } from "./tiers";
import { TIER_ORDER } from "./worst-data-tier";

/**
 * The one place the *Needs you* list is derived (component design `ui-components`
 * 2.6; DEC-0203, DEC-0216; DAC-E1-6, DAC-E1-S8-1, DAC-E1-S8-2). Each of the six
 * kinds is produced exactly while its cause holds, every tier comes from
 * `tierOf` (AC-20), and no user-visible string is produced: only kinds, ISO
 * times, ids and route paths. `Attention` and `ScoreState` are imported as
 * types only from the shell (ui-components 11; a deliberate later-epic edge,
 * DEC-0223).
 *
 * Three provisional decisions shape the edges the contracts leave open:
 * DEC-0318 (`first_scores` run and recency), DEC-0319 (the row, in
 * `needs-you-item.tsx`) and DEC-0320 (reads that contradict their own contract).
 */
export type { NeedsYouKind };

export interface NeedsYouItem {
  kind: NeedsYouKind;
  tier: Tier;
  recordedAt: string;
  target: string;
  runId?: string;
}

/** Written here: the delivered helper lives in a screen, and patterns import no screen (design 2.2). */
function isNonTerminal(state: RunState): boolean {
  return state === "requested" || state === "running" || state === "cancelling";
}

function downloadTarget(runId: string): string {
  return `/data/downloads/${runId}`;
}

export function deriveNeedsYou(attention: Attention, scores: ScoreState): NeedsYouItem[] {
  const result: NeedsYouItem[] = [];

  for (const entry of attention.items) {
    const kind = entry.kind;
    switch (kind) {
      case "data_problems":
        result.push({
          kind,
          tier: tierOf({ of: "item", kind }),
          recordedAt: entry.recorded_at,
          target: "/data",
        });
        break;
      case "credential_missing":
        result.push({
          kind,
          tier: tierOf({ of: "item", kind }),
          recordedAt: entry.recorded_at,
          target: "/settings",
        });
        break;
      case "download_not_complete": {
        const terminal = attention.latest_terminal_download;
        const failed = terminal?.state === "failed";
        const runId = entry.run_id ?? terminal?.run_id;
        const tier = tierOf({ of: "item", kind, failed });
        if (typeof runId === "string") {
          result.push({
            kind,
            tier,
            recordedAt: entry.recorded_at,
            target: downloadTarget(runId),
            runId,
          });
        } else {
          result.push({ kind, tier, recordedAt: entry.recorded_at, target: "/data" });
        }
        break;
      }
    }
  }

  const download = attention.latest_download;
  const downloading = download !== null && isNonTerminal(download.state);

  const firstDownload = (): void => {
    if (download === null) {
      return;
    }
    result.push({
      kind: "first_download",
      tier: tierOf({ of: "item", kind: "first_download" }),
      recordedAt: download.requested_at,
      target: downloadTarget(download.run_id),
      runId: download.run_id,
    });
  };

  if (scores.kind === "served") {
    const { never_classified, later } = scores.data;
    if (never_classified && later?.state === "building") {
      const runId = later.run_id;
      result.push({
        kind: "first_scores",
        tier: tierOf({ of: "item", kind: "first_scores" }),
        recordedAt:
          download?.run_id === later.run_id ? download.requested_at : later.run_started_at,
        target: downloadTarget(runId),
        runId,
      });
    } else if (never_classified && downloading) {
      firstDownload();
    }
    if (later?.state === "failed") {
      result.push({
        kind: "score_failed",
        tier: tierOf({ of: "item", kind: "score_failed" }),
        recordedAt: later.ended_at ?? later.started_at,
        target: "/data",
      });
    }
  } else if (
    scores.kind === "not_served" &&
    attention.latest_terminal_download === null &&
    downloading
  ) {
    firstDownload();
  }

  return result;
}

/**
 * Most severe first, then newest first (design 2.6: critical, serious, warning,
 * good, neutral, with active sorting with good; DEC-0217; DAC-E1-7). Equal keys
 * keep their input order, which `Array.prototype.sort` guarantees. The Home chip
 * and Home's list are `sortAttention(deriveNeedsYou(...))` and its length (AC-16).
 */
export function sortAttention(items: readonly NeedsYouItem[]): NeedsYouItem[] {
  return [...items].sort(
    (a, b) =>
      TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
      Date.parse(b.recordedAt) - Date.parse(a.recordedAt),
  );
}
