import { type JSX, type ReactNode, useId } from "react";
import { ApiError, ApiUnreachableError } from "../../api/client";
import type { ScreenState } from "../../api/types";
import { LAYOUT } from "../../app/layout";
import { useShell } from "../../app/shell-context";
import type { Attention, ScoreState } from "../../app/shell-types";
import { formatClock, formatInstant } from "../../components/patterns/format";
import {
  type NeedsYouItem,
  deriveNeedsYou,
  sortAttention,
} from "../../components/patterns/needs-you";
import { NeedsYouItemRow } from "../../components/patterns/needs-you-item";
import { Absent } from "../../components/patterns/presence";
import { StateRegion, type StateRenderers } from "../../components/patterns/state-region";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { CHECKED, ITEMS, NEEDS_YOU, NOT_DETERMINABLE, NO_REASON, READ_FAILURE } from "./copy";

/**
 * Home's *Needs you* card: what needs the owner, most important first, each with
 * one action that only navigates (component design `home-ui` 2.5, section 3 and
 * section 10; UX design 1.3 Page Layout 3, States and Accessibility; DEC-0203,
 * DEC-0216; AC-7, AC-9, AC-12, AC-16, AC-24, AC-25; DAC-E5-7 to DAC-E5-9,
 * DAC-E5-11; DEC-0367 to DEC-0370). It takes no props, reads the shell's
 * attention and scores only, and makes no read of its own.
 */

interface NeedsYouView {
  items: NeedsYouItem[];
  attention: Attention;
  scores: ScoreState;
}

/**
 * The card's body, one entry per state (DAC-E5-S3-3). The kinds that do not
 * apply carry their reasons as records, never as display copy.
 */
export const NEEDS_YOU_STATES: StateRenderers<NeedsYouView> = {
  loading: () => (
    <ul data-testid="needs-you-skeleton" aria-hidden="true" className="flex flex-col gap-3">
      <li className="min-h-7 w-full animate-pulse rounded bg-secondary" />
      <li className="min-h-7 w-full animate-pulse rounded bg-secondary" />
      <li className="min-h-7 w-full animate-pulse rounded bg-secondary" />
    </ul>
  ),
  "empty-never-populated": {
    notApplicable:
      "HomeScreen shows the empty card in place of the summary row and this card while latest_download is null (DAC-E5-1)",
  },
  "empty-no-match": { notApplicable: "Nothing on Home is filtered (DAC-E5-S3-3)" },
  populated: (state) => {
    const { items, attention, scores } = state.data;
    if (items.length === 0) {
      return <p>{NEEDS_YOU.nothingNeedsYou}</p>;
    }
    return (
      <ul>
        {items.map((item) => (
          <NeedsYouItemRow
            key={item.kind}
            {...itemCopy(item, attention, scores)}
            item={item}
            markerSize={LAYOUT.markerSize}
          />
        ))}
      </ul>
    );
  },
  partial: {
    notApplicable:
      "The attention read is whole or failed; a partial download is a data item rendered in populated (DAC-E5-S3-3; home-ui 10 Partial)",
  },
  unavailable: {
    notApplicable:
      "No part of this card waits on an unavailable read: under a summary 404 the server items render in populated and the first-download item follows DEC-0216 (DAC-E5-11)",
  },
  error: (state) => <p>{NEEDS_YOU.readError(state.message)}</p>,
  unreachable: { notApplicable: "The shell replaces the main region (AC-23)" },
};

function itemCopy(
  item: NeedsYouItem,
  attention: Attention,
  scores: ScoreState,
): { title: string; body: ReactNode; actionLabel: string; actionName: string } {
  switch (item.kind) {
    case "data_problems": {
      const { symbols, stock_count: count } = attention.problems;
      const copy = ITEMS.data_problems;
      return {
        title: copy.title(symbols, count),
        body: copy.body(count),
        actionLabel: copy.action,
        actionName: copy.actionName(symbols, count),
      };
    }
    case "download_not_complete": {
      const copy = ITEMS.download_not_complete;
      // One derivation decides the badge and the words, so they cannot disagree (AC-12).
      const failed = item.tier === "critical";
      const endedAt = formatInstant(item.recordedAt);
      return failed
        ? {
            title: copy.failedTitle,
            body: copy.failedBody(
              attention.latest_terminal_download?.failure_reason ?? NO_REASON,
              endedAt,
            ),
            actionLabel: copy.action,
            actionName: copy.failedActionName,
          }
        : {
            title: copy.interruptedTitle,
            body: copy.interruptedBody(endedAt),
            actionLabel: copy.action,
            actionName: copy.interruptedActionName,
          };
    }
    case "credential_missing": {
      const copy = ITEMS.credential_missing;
      return {
        title: copy.title,
        body: copy.body,
        actionLabel: copy.action,
        actionName: copy.actionName,
      };
    }
    case "first_download": {
      const copy = ITEMS.first_download;
      const progress = attention.latest_download?.progress;
      return {
        title: copy.title,
        body: copy.body(progress?.done ?? 0, progress?.total ?? null),
        actionLabel: copy.action,
        actionName: copy.actionName,
      };
    }
    case "first_scores": {
      const copy = ITEMS.first_scores;
      return {
        title: copy.title,
        body: copy.body,
        actionLabel: copy.action,
        actionName: copy.actionName,
      };
    }
    case "score_failed": {
      const copy = ITEMS.score_failed;
      const summary = scores.kind === "served" ? scores.data : null;
      return {
        title: copy.title,
        body: copy.body(
          summary?.later?.failure_reason ?? NO_REASON,
          summary?.set ? formatInstant(summary.set.run_started_at) : null,
        ),
        actionLabel: copy.action,
        actionName: copy.actionName,
      };
    }
    default: {
      const unhandled: never = item.kind;
      return unhandled;
    }
  }
}

/** One fixed sentence per failure kind, never the server's message or request id (DEC-0366). */
function readFailureReason(error: ApiError | ApiUnreachableError): string {
  return error instanceof ApiUnreachableError ? READ_FAILURE.unreachable : READ_FAILURE.unexpected;
}

export function NeedsYouCard(): JSX.Element {
  const { attention, scores, refresh } = useShell();
  const titleId = useId();

  const items =
    attention.kind === "ok" ? sortAttention(deriveNeedsYou(attention.data, scores)) : null;

  let state: ScreenState<NeedsYouView>;
  if (attention.kind === "ok" && items !== null) {
    state = {
      kind: "populated",
      data: { items, attention: attention.data, scores },
      fetchedAt: attention.data.checked_at,
    };
  } else if (attention.kind === "error") {
    state = {
      kind: "error",
      message: readFailureReason(attention.error),
      requestId: attention.error instanceof ApiError ? attention.error.requestId : "",
    };
  } else {
    state = { kind: "loading" };
  }

  let heading: ReactNode = NEEDS_YOU.title;
  if (items !== null) {
    heading = NEEDS_YOU.heading(items.length);
  } else if (attention.kind === "error") {
    heading = (
      <>
        {NEEDS_YOU.headingPrefix} <Absent label={NOT_DETERMINABLE} />
      </>
    );
  }

  // The read's own time, never the client's, so it ages while the read fails.
  let checked: ReactNode = null;
  if (attention.kind === "ok") {
    checked = `${CHECKED} ${formatClock(attention.data.checked_at)}`;
  } else if (attention.kind === "error") {
    checked =
      attention.last === null ? (
        <>
          {CHECKED} <Absent label={NOT_DETERMINABLE} />
        </>
      ) : (
        `${CHECKED} ${formatClock(attention.last.data.checked_at)}`
      );
  }

  return (
    <section aria-labelledby={titleId}>
      <Card variant="default">
        <CardHeader>
          <div className="flex items-baseline justify-between gap-4">
            <CardTitle id={titleId}>{heading}</CardTitle>
            {checked === null ? null : <p className="text-xs text-muted-foreground">{checked}</p>}
          </div>
          <p className="text-sm text-muted-foreground">{NEEDS_YOU.subLine}</p>
        </CardHeader>
        <CardContent>
          {items === null ? null : (
            <output className="sr-only">{NEEDS_YOU.heading(items.length)}</output>
          )}
          <StateRegion
            state={state}
            renderers={NEEDS_YOU_STATES}
            onRetry={() => refresh("attention")}
          />
        </CardContent>
      </Card>
    </section>
  );
}
