import { type JSX, useId } from "react";

/**
 * The `button` `blocked` Start-action rendering (component design section
 * 2.5's load-bearing note; DAC-E2-9, DAC-E2-S4-3).
 *
 * Starting a run itself belongs to whichever story owns Coverage (1.1) —
 * this story's own tasks-file Notes record the ambiguity and take the
 * narrower reading: this component implements only the `blocked`-not-
 * `disabled` pattern for the precondition this story's own screens can
 * observe (history depth unset), so it stays focusable and exposes its
 * reason through `aria-describedby` rather than a bare `disabled`
 * attribute, which would hide the reason from keyboard and screen-reader
 * users entirely.
 */
export function StartAction({
  historyDepthYears,
}: { historyDepthYears: number | null }): JSX.Element {
  const reasonId = useId();
  const blocked = historyDepthYears === null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        data-variant={blocked ? "blocked" : "default"}
        aria-describedby={blocked ? reasonId : undefined}
        // Never a bare `disabled` attribute: a plain disabled control is
        // not focusable, so its reason never reaches a keyboard or
        // screen-reader user (component design section 2.5).
        tabIndex={0}
        onClick={(event) => {
          if (blocked) {
            event.preventDefault();
          }
        }}
        className="w-fit rounded border border-border px-3 py-2 text-base data-[variant=blocked]:text-muted-foreground"
      >
        Start acquisition run
      </button>
      {blocked ? (
        <p id={reasonId} className="text-muted-foreground text-sm">
          Start is blocked: history depth is not set. Set it on Settings before starting an
          acquisition run.
        </p>
      ) : null}
    </div>
  );
}
