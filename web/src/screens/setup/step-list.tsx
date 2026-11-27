import type { ReactNode } from "react";
import { LAYOUT } from "../../app/layout";
import { useShell } from "../../app/shell-context";
import { formatCount, formatInstant } from "../../components/patterns/format";
import { labelOf } from "../../components/patterns/tiers";
import { Stepper, type StepperStep } from "../../components/ui/stepper";
import { SCREEN, STEP_TITLES, SUMMARIES } from "./copy";
import { STEP_HEADING_ID } from "./step-card";
import type { SetupState, StepId } from "./use-setup-state";

/*
 * The setup screen's left column (CAP-003-E4-S2; component design setup-ui
 * 10; AC-25, DAC-E4-S2-1; DEC-0348, DEC-0349, DEC-0350): an optional header
 * for the screen's heading and sub-line, then the vertical stepper. A done
 * step that is not the current one is an in-page link to the step heading and
 * activating it shows that step in memory; the stepper's own suffixes carry
 * each state in text.
 */

const STEP_IDS: readonly StepId[] = [1, 2, 3, 4];

export function StepList({ state, header }: { state: SetupState; header?: ReactNode }) {
  const { health, attention } = useShell();

  const download =
    attention.kind === "ok"
      ? attention.data.latest_download
      : attention.kind === "error"
        ? (attention.last?.data.latest_download ?? null)
        : null;

  /** The one-line summary of a done step, or none when its fact cannot be stated. */
  function summaryOf(step: StepId): string | undefined {
    switch (step) {
      case 1:
        // A stale answer kept after a failed poll is never summarised (DEC-0349).
        return health.liveness === "answering" && health.health !== null
          ? labelOf({ of: "credential", present: health.health.credential_present })
          : undefined;
      case 2:
        return state.depth.kind === "ok" && state.depth.data.years !== null
          ? SUMMARIES.years(String(state.depth.data.years))
          : undefined;
      case 3:
        return state.activeCount.kind === "ok"
          ? SUMMARIES.followed(formatCount(state.activeCount.data))
          : undefined;
      case 4:
        return download !== null
          ? SUMMARIES.downloadStarted(formatInstant(download.started_at ?? download.requested_at))
          : undefined;
    }
  }

  const steps: StepperStep[] = STEP_IDS.map((step) => {
    const isDone = state.done[step];
    const stepState: StepperStep["state"] =
      step === state.current ? "current" : isDone ? "done" : "todo";
    // Only a done step that is not the current one is a link (DEC-0348).
    const link = stepState === "done";
    return {
      title: STEP_TITLES[step],
      state: stepState,
      href: link ? `#${STEP_HEADING_ID}` : undefined,
      onSelect: link ? () => state.goTo(step) : undefined,
      summary: isDone ? summaryOf(step) : undefined,
    };
  });

  return (
    <div
      className="flex flex-col gap-4"
      style={{ minWidth: LAYOUT.sideColumnMin, maxWidth: LAYOUT.sideColumnMax }}
    >
      {header}
      <Stepper label={SCREEN.stepsLabel} markerSize={LAYOUT.markerSize} steps={steps} />
    </div>
  );
}
