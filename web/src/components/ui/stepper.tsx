import { Check } from "lucide-react";

/**
 * Bespoke `stepper`, vertical (component design 2.1; stepper spec sections
 * 2-6; DAC-E1-14; DEC-0304, DEC-0305). There is no shadcn/ui or Radix source.
 *
 * A `nav` labelled by the caller holds an `ol`. The current item carries
 * `aria-current="step"`; each title carries its state in text (", done",
 * ", current", ", to do"): a visually hidden suffix, or the link's `aria-label`,
 * since a hidden inline span would split a link's name with a space. Only a done step with an `href`
 * is a link, and when `onSelect` is given its click is prevented and calls it,
 * so a caller can move between steps in memory. Current and to-do steps are
 * never links or tab stops. The stepper never moves focus: changing step moves
 * it to the step card's heading, which is the caller's.
 *
 * `markerSize` is the caller's marker width. This layer holds no layout width
 * and imports nothing from `web/src/app/` (component design 2.2, 3).
 */
export type StepState = "done" | "current" | "todo";

export interface StepperStep {
  title: string;
  state: StepState;
  summary?: string;
  href?: string;
  onSelect?: () => void;
}

const STATE_SUFFIX: Record<StepState, string> = {
  done: ", done",
  current: ", current",
  todo: ", to do",
};

const DOT_CLASS: Record<StepState, string> = {
  done: "bg-foreground text-background",
  current: "border border-status-active ring ring-status-active-muted",
  todo: "border border-border text-muted-foreground",
};

const TITLE_CLASS: Record<StepState, string> = {
  done: "text-foreground",
  current: "font-semibold text-foreground",
  todo: "text-muted-foreground",
};

export function Stepper({
  label,
  steps,
  markerSize,
}: {
  label: string;
  steps: readonly StepperStep[];
  markerSize: string;
}) {
  return (
    <nav aria-label={label} data-variant="vertical">
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            data-state={step.state}
            aria-current={step.state === "current" ? "step" : undefined}
            className="flex items-start gap-3"
          >
            <span
              aria-hidden="true"
              style={{ width: markerSize, height: markerSize }}
              className={`flex shrink-0 items-center justify-center rounded-[50%] font-numeric text-xs ${DOT_CLASS[step.state]}`}
            >
              {step.state === "done" ? <Check className="size-4" /> : index + 1}
            </span>
            <span className="flex flex-col gap-1">
              <span>
                {step.state === "done" && step.href !== undefined ? (
                  <a
                    href={step.href}
                    aria-label={`${step.title}${STATE_SUFFIX.done}`}
                    className={`${TITLE_CLASS.done} rounded underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-ring`}
                    onClick={(event) => {
                      if (step.onSelect !== undefined) {
                        event.preventDefault();
                        step.onSelect();
                      }
                    }}
                  >
                    {step.title}
                  </a>
                ) : (
                  <span className={TITLE_CLASS[step.state]}>
                    {step.title}
                    <span className="sr-only">{STATE_SUFFIX[step.state]}</span>
                  </span>
                )}
              </span>
              {step.summary !== undefined ? (
                <span className="text-xs text-muted-foreground">{step.summary}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
