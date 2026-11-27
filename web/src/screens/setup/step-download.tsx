import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, ApiUnreachableError, startAcquisitionRun } from "../../api/client";
import type { RunState } from "../../api/types";
import { useShell } from "../../app/shell-context";
import type { Attention, LatestDownload } from "../../app/shell-types";
import { formatClock, formatCount, formatInstant } from "../../components/patterns/format";
import { Absent, NotDeterminable } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { Button } from "../../components/ui/button";
import { Card, CardSummaryList } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { READ_ERRORS, STEP4, STEP_TITLES } from "./copy";
import { STEP_HEADING_ID, StepCard, failureReason } from "./step-card";
import { KeyPresence } from "./step-market-data";
import type { SetupState } from "./use-setup-state";

/*
 * Step 4 (setup-ui 2.3 *Step 4* and *Add later*, 10; UX design 1.2; DAC-E4-8
 * to DAC-E4-10, DAC-E4-12). It opens no interval and no animation frame: the
 * progress follows the shell's attention cadence (setup-ui 5; DAC-E4-S4-1).
 */

const TERMINAL: readonly RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

/**
 * What the region shows before attention names the download this visit
 * started (DEC-0356). It carries no times, so no Started or checked line
 * renders for it.
 */
const PENDING = {
  state: "requested",
  progress: { done: 0, total: null },
  started_at: null,
  requested_at: null,
} as const;

type Shown = Pick<LatestDownload, "state" | "progress"> & {
  started_at: string | null;
  requested_at: string | null;
};

type Outcome = { kind: "refused"; step: 2 | 3 } | { kind: "failed"; reason: string } | null;

function latestOf(
  attention: { kind: string } & Partial<{ data: Attention; last: { data: Attention } | null }>,
): LatestDownload | null {
  if (attention.kind === "ok") {
    return attention.data?.latest_download ?? null;
  }
  return attention.kind === "error" ? (attention.last?.data.latest_download ?? null) : null;
}

export function StepDownload({ state }: { state: SetupState }) {
  const { attention, refresh } = useShell();
  const [ours, setOurs] = useState<{ runId: string; queuedBehind: string | null } | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const starting = useRef(false);
  const reasonId = useId();
  const stateId = useId();
  const labelId = useId();
  const blocked = state.step4 === "blocked";

  async function start(): Promise<void> {
    if (starting.current) {
      return;
    }
    starting.current = true;
    setOutcome(null);
    try {
      const result = await startAcquisitionRun();
      setOurs({ runId: result.runId, queuedBehind: result.queuedBehind });
      refresh("health");
      if (result.queuedBehind === null) {
        refresh("attention");
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "history_depth_not_set") {
        setOutcome({ kind: "refused", step: 2 });
      } else if (error instanceof ApiError && error.code === "no_active_instruments") {
        setOutcome({ kind: "refused", step: 3 });
      } else if (error instanceof ApiError || error instanceof ApiUnreachableError) {
        setOutcome({ kind: "failed", reason: failureReason(error) });
      } else {
        throw error;
      }
    } finally {
      starting.current = false;
    }
  }

  const question =
    state.activeCount.kind === "ok"
      ? STEP4.downloadFor(formatCount(state.activeCount.data))
      : STEP_TITLES[4];

  const depthValue = (() => {
    if (state.depth.kind === "ok") {
      return state.depth.data.years === null ? (
        <Absent label={STEP4.depthAbsent} />
      ) : (
        STEP4.yearsValue(String(state.depth.data.years))
      );
    }
    if (state.depth.kind === "error") {
      return (
        <NotDeterminable
          reason={READ_ERRORS.readFailed(
            READ_ERRORS.subjects.depth,
            failureReason(state.depth.error),
          )}
        />
      );
    }
    return null;
  })();

  const countValue = (() => {
    if (state.activeCount.kind === "ok") {
      return formatCount(state.activeCount.data);
    }
    if (state.activeCount.kind === "error") {
      return (
        <NotDeterminable
          reason={READ_ERRORS.readFailed(
            READ_ERRORS.subjects.followed,
            failureReason(state.activeCount.error),
          )}
        />
      );
    }
    return null;
  })();

  const latest = latestOf(attention);
  const shown: Shown | null = ours !== null && latest?.run_id !== ours.runId ? PENDING : latest;

  return (
    <StepCard step={4} question={question} onBack={() => state.goTo(3)}>
      <Card variant="summary" className="p-4">
        <CardSummaryList>
          <dt>{STEP4.summaryKey}</dt>
          <dd>
            <KeyPresence />
          </dd>
          <dt>{STEP4.summaryDepth}</dt>
          <dd>{depthValue}</dd>
          <dt>{STEP4.summaryFollowed}</dt>
          <dd>{countValue}</dd>
        </CardSummaryList>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={blocked ? "blocked" : "default"}
          aria-describedby={blocked ? reasonId : undefined}
          onClick={blocked ? undefined : () => void start()}
        >
          {STEP4.start}
        </Button>
        {blocked ? (
          <p id={reasonId} className="text-xs text-muted-foreground">
            {STEP4.blockedReason}
          </p>
        ) : null}
      </div>

      {blocked ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/home">{STEP4.goHome}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/data/followed">{STEP4.manageFollowed}</Link>
          </Button>
        </div>
      ) : null}

      {outcome !== null ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">
          {outcome.kind === "refused" ? (
            <>
              <span>{outcome.step === 2 ? STEP4.depthNotSet : STEP4.noStocks}</span>
              <a
                href={`#${STEP_HEADING_ID}`}
                onClick={(event) => {
                  event.preventDefault();
                  state.goTo(outcome.step);
                }}
              >
                {outcome.step === 2 ? STEP4.goToStep2 : STEP4.goToStep3}
              </a>
            </>
          ) : (
            <span>{STEP4.startFailed(outcome.reason)}</span>
          )}
        </div>
      ) : null}

      {shown !== null ? (
        <div className="flex flex-col gap-2">
          <span id={stateId}>
            <StatusBadge tier={tierOf({ of: "download", state: shown.state })}>
              {labelOf({ of: "download", state: shown.state })}
            </StatusBadge>
          </span>
          {attention.kind === "error" ? (
            <p aria-live="polite">{STEP4.progressUnreadable}</p>
          ) : ours?.queuedBehind != null && shown.state === "requested" ? (
            <output>{STEP4.queued}</output>
          ) : TERMINAL.includes(shown.state) ? null : (
            <>
              <p id={labelId} aria-live="polite">
                {shown.progress.total === null
                  ? ""
                  : STEP4.progress(
                      formatCount(shown.progress.done),
                      formatCount(shown.progress.total),
                    )}
              </p>
              <Progress
                value={shown.progress.done}
                max={shown.progress.total}
                aria-labelledby={shown.progress.total === null ? stateId : labelId}
              />
            </>
          )}
          {(shown.started_at ?? shown.requested_at) !== null ? (
            <p className="text-xs text-muted-foreground">
              <span>
                {STEP4.started(formatInstant((shown.started_at ?? shown.requested_at) as string))}
              </span>
              {attention.kind === "ok" ? (
                <span>{STEP4.checked(formatClock(attention.checkedAt))}</span>
              ) : null}
            </p>
          ) : null}
          {TERMINAL.includes(shown.state) ? null : <p>{STEP4.canLeave}</p>}
        </div>
      ) : null}
    </StepCard>
  );
}
