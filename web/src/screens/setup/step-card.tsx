import { type JSX, type ReactNode, useEffect, useRef } from "react";
import { LAYOUT } from "../../app/layout";
import { type ApiError, ApiUnreachableError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CONTINUE, READ_ERRORS, STEP_TITLES, backLabel, nextHint, stepPosition } from "./copy";
import type { StepId } from "./use-setup-state";

/*
 * The step card and its focus and read-failure helpers (CAP-003-E4-S2;
 * component design setup-ui 10; AC-25, DAC-E4-13; DEC-0345, DEC-0350). One
 * step card renders at a time, so one id serves the heading, its
 * `aria-labelledby` and the done-step links' `href`.
 */

/** The step card heading's id. */
export const STEP_HEADING_ID = "setup-step-heading";

export interface StepCardProps {
  step: StepId;
  question: string;
  explanation?: ReactNode;
  note?: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  children?: ReactNode;
}

/** The step card: position, question, explanation, controls, info note and footer (AC-25). */
export function StepCard({
  step,
  question,
  explanation,
  note,
  onBack,
  onContinue,
  children,
}: StepCardProps): JSX.Element {
  const previousTitle = step > 1 ? STEP_TITLES[(step - 1) as 1 | 2 | 3] : null;
  const nextTitle = step < 4 ? STEP_TITLES[(step + 1) as 2 | 3 | 4] : null;
  return (
    <section aria-labelledby={STEP_HEADING_ID}>
      <Card variant="default" className="flex flex-col gap-5 p-4">
        <p className="text-xs text-muted-foreground">{stepPosition(step)}</p>
        {/* A plain h2, not CardTitle: the step question is larger than a card heading (setup-ui 10). */}
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
          {previousTitle !== null && onBack !== undefined ? (
            <Button variant="ghost" onClick={onBack}>
              {backLabel(previousTitle)}
            </Button>
          ) : (
            <span />
          )}
          {onContinue !== undefined && nextTitle !== null ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{nextHint(nextTitle)}</span>
              <Button variant="default" onClick={onContinue}>
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
 * Moves focus to the step card's heading when the step changes, never on the
 * first render, so the shell's focus on the screen's heading on entry stands
 * (owner-shell 2.7; DAC-E4-S6-2). It lives in the persistent screen because
 * each step renders its own card and a step change remounts it. The setup
 * screen calls it once.
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
 * The reason a failed read or save shows. It never reads the error's message
 * or request id: the delivered messages name domain terms that owner-facing
 * text keeps out (AC-19; DEC-0345).
 */
export function failureReason(error: ApiError | ApiUnreachableError): string {
  return error instanceof ApiUnreachableError ? READ_ERRORS.notAnswering : READ_ERRORS.unexpected;
}

/** A failed read in its own step, with a recovery (DAC-E4-13). */
export function StepReadError({
  subject,
  error,
  onRetry,
}: {
  subject: string;
  error: ApiError | ApiUnreachableError;
  onRetry: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-destructive">{READ_ERRORS.readFailed(subject, failureReason(error))}</p>
      <Button variant="outline" onClick={onRetry}>
        {READ_ERRORS.tryAgain}
      </Button>
    </div>
  );
}
