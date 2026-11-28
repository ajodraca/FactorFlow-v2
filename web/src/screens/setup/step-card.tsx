import { type ReactNode, useEffect, useId, useRef } from "react";
import { type ApiError, ApiUnreachableError } from "../../api/client";
import { LAYOUT } from "../../app/layout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CONTINUE, READ_ERRORS, STEP_TITLES, backLabel, nextHint, stepPosition } from "./copy";
import type { StepId } from "./use-setup-state";

/*
 * The setup step card and the pieces every step shares (CAP-003-E4-S2;
 * component design setup-ui 10; AC-25, DAC-E4-13; DEC-0345, DEC-0350). One
 * card renders at a time, so one id serves the heading, its label and the
 * done-step links' target.
 */

/** The step question's id: the card's label and the target of a done step's link. */
export const STEP_HEADING_ID = "setup-step-heading";

export interface StepCardProps {
  step: StepId;
  question: string;
  explanation?: ReactNode;
  note?: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  /**
   * The reason a gated Continue is blocked (DAC-E4-7; CAP-003-E1-S1's button
   * `blocked`, never `disabled`, DAC-E1-15). Set, Continue is inert, stays in
   * the tab order and is described by this text.
   */
  continueBlocked?: string;
  children?: ReactNode;
}

/**
 * A section labelled by its question, with the position line, an optional
 * explanation capped at the layout's measure, the step's controls, an optional
 * info note and the footer. The question is a plain level-2 heading, not the
 * card title, which is the card-heading size and not the step question's.
 */
export function StepCard({
  step,
  question,
  explanation,
  note,
  onBack,
  onContinue,
  continueBlocked,
  children,
}: StepCardProps) {
  const reasonId = useId();
  return (
    <section aria-labelledby={STEP_HEADING_ID}>
      <Card variant="default" className="flex flex-col gap-5 p-4">
        <p className="text-xs text-muted-foreground">{stepPosition(step)}</p>
        <h2
          id={STEP_HEADING_ID}
          tabIndex={-1}
          className="text-xl font-semibold text-foreground focus-visible:outline-none"
        >
          {question}
        </h2>
        {explanation !== undefined ? (
          <p style={{ maxWidth: LAYOUT.explanationMeasure }}>{explanation}</p>
        ) : null}
        {children}
        {note !== undefined ? <p className="rounded bg-muted p-3 text-xs">{note}</p> : null}
        <div className="flex items-center justify-between gap-4">
          {step > 1 && onBack !== undefined ? (
            <Button variant="ghost" onClick={onBack}>
              {backLabel(STEP_TITLES[(step - 1) as StepId])}
            </Button>
          ) : (
            <span />
          )}
          {onContinue !== undefined ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {nextHint(STEP_TITLES[(step + 1) as StepId])}
              </span>
              {continueBlocked !== undefined ? (
                <p id={reasonId} className="text-xs text-muted-foreground">
                  {continueBlocked}
                </p>
              ) : null}
              <Button
                variant={continueBlocked !== undefined ? "blocked" : "default"}
                aria-describedby={continueBlocked !== undefined ? reasonId : undefined}
                onClick={onContinue}
              >
                {CONTINUE}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

/**
 * Moves focus to the step question when the step changes, never on the first
 * render, so the shell's focus on the screen's heading on entry stands
 * (owner-shell 2.7; DAC-E4-S6-2). It lives in the persistent screen, not in
 * `StepCard`, because each step renders its own card and a step change mounts
 * a new one. The setup screen calls it once.
 */
export function useStepHeadingFocus(current: StepId): void {
  const previous = useRef(current);
  useEffect(() => {
    if (previous.current !== current) {
      document.getElementById(STEP_HEADING_ID)?.focus();
      previous.current = current;
    }
  }, [current]);
}

/**
 * The reason a failed read or save shows (DEC-0345). It never reads the
 * error's message or request id: the delivered messages name domain terms the
 * capability keeps out of owner-facing text (AC-19), and a request id is never
 * shown (UX design 0.7).
 */
export function failureReason(error: ApiError | ApiUnreachableError): string {
  return error instanceof ApiUnreachableError ? READ_ERRORS.notAnswering : READ_ERRORS.unexpected;
}

/**
 * A failed read in its own step: the resource, the reason and a way to try
 * again (DAC-E4-13; STD-UI-19).
 */
export function StepReadError({
  subject,
  error,
  onRetry,
}: {
  subject: string;
  error: ApiError | ApiUnreachableError;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-destructive">{READ_ERRORS.readFailed(subject, failureReason(error))}</p>
      <Button variant="outline" onClick={onRetry}>
        {READ_ERRORS.tryAgain}
      </Button>
    </div>
  );
}
