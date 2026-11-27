import type { JSX } from "react";
import type { ScreenState } from "../../api/types";
import { LAYOUT } from "../../app/layout";
import { StateRegion, type StateRenderers } from "../../components/patterns/state-region";
import { Card } from "../../components/ui/card";
import { SCREEN, STEP_TITLES } from "./copy";
import { useStepHeadingFocus } from "./step-card";
import { StepDownload } from "./step-download";
import { StepHistoryDepth } from "./step-history-depth";
import { StepList } from "./step-list";
import { StepMarketData } from "./step-market-data";
import { StepStocks } from "./step-stocks";
import { type SetupState, useSetupState } from "./use-setup-state";

/*
 * SetupScreen (CAP-003-E4-S4; component design setup-ui 2.1, 10; UX design
 * 1.2; AC-3, AC-24, AC-26). It records STD-UI-23's eight states for the step
 * card region: loading, never populated and partial or complete render through
 * StateRegion; nothing found, unavailable and error render inside their steps
 * (CAP-003-E4-S2, CAP-003-E4-S3 and step 4); unreachable is the shell's; and
 * stale is recorded on the next line, which a test reads.
 * Stale: not applicable, every step is re-derived on each visit; step 4's polled progress carries checked {time}
 *
 * It mounts no SetupDraftProvider (the shell does, CAP-003-E4-S6) and opens no
 * interval.
 */

/** The region's `error` kind is recorded not applicable, so Try again never renders here. */
const NO_RETRY = (): undefined => undefined;

/** Derives the region's kind from the step state; `fetchedAt` is never rendered. */
export function screenStateOf(state: SetupState, now: Date): ScreenState<SetupState> {
  if (state.loading) {
    return { kind: "loading" };
  }
  const flags = Object.values(state.done);
  if (!flags.some(Boolean)) {
    return { kind: "empty-never-populated" };
  }
  return {
    kind: flags.every(Boolean) ? "populated" : "partial",
    data: state,
    fetchedAt: now.toISOString(),
  };
}

function CardSkeleton(): JSX.Element {
  return (
    <Card variant="default">
      <div className="flex flex-col gap-5 p-4">
        <div className="h-4 w-1/4 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
      </div>
    </Card>
  );
}

function ListSkeleton(): JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Object.keys(STEP_TITLES).map((row) => (
        <div key={row} className="flex items-center gap-3">
          <div
            className="rounded bg-muted"
            style={{ width: LAYOUT.markerSize, height: LAYOUT.markerSize }}
          />
          <div className="h-4 flex-1 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/** Mounts only once the reads have settled, so its first render never moves focus. */
function SetupBody({ state }: { state: SetupState }): JSX.Element {
  useStepHeadingFocus(state.current);
  switch (state.current) {
    case 1:
      return <StepMarketData state={state} />;
    case 2:
      return <StepHistoryDepth state={state} />;
    case 3:
      return <StepStocks state={state} />;
    case 4:
      return <StepDownload state={state} />;
  }
}

/** A function, not a constant: the never-populated kind carries no data, so its renderer closes over `state`. */
export function cardRenderers(state: SetupState): StateRenderers<SetupState> {
  return {
    loading: () => <CardSkeleton />,
    "empty-never-populated": () => <SetupBody state={state} />,
    partial: (s) => <SetupBody state={s.data} />,
    populated: (s) => <SetupBody state={s.data} />,
    "empty-no-match": {
      notApplicable:
        "Nothing found is a state inside a step: step 3 at zero accepted blocks Continue, and step 4 with no followed stock blocks Start download with two exits; steps 1 and 2 have nothing to come up empty.",
    },
    unavailable: {
      notApplicable:
        "Unavailable is a state inside a step: step 1's and step 4's key line read Not determinable while health is not answering, and step 4's progress reads Progress can't be read right now while attention fails; steps 2 and 3 have no polled value.",
    },
    error: {
      notApplicable:
        "A failed read or save shows in its own step with its recovery (DAC-E4-13: in that step only), and a refused start shows on step 4; step 1 makes no read of its own. The screen never fails as a whole.",
    },
    unreachable: { notApplicable: "The shell replaces the main region (AC-23; owner-shell 2.8)." },
  };
}

export default function SetupScreen(): JSX.Element {
  const state = useSetupState();
  return (
    <div className="flex items-start gap-6" style={{ maxWidth: LAYOUT.contentMaxWidth }}>
      <div
        className="flex flex-col gap-4"
        style={{ minWidth: LAYOUT.sideColumnMin, maxWidth: LAYOUT.sideColumnMax }}
      >
        <h1 tabIndex={-1} className="text-xl font-semibold text-foreground">
          {SCREEN.title}
        </h1>
        <p className="text-xs text-muted-foreground">{SCREEN.subLine}</p>
        {state.loading ? <ListSkeleton /> : <StepList state={state} />}
      </div>
      <div className="min-w-0 flex-1">
        <StateRegion
          state={screenStateOf(state, new Date())}
          renderers={cardRenderers(state)}
          onRetry={NO_RETRY}
        />
      </div>
    </div>
  );
}
