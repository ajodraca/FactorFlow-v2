import { type JSX, useId } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

/**
 * The `button` `blocked` download action (component design section 2.5's
 * load-bearing note; DAC-E2-9, DAC-E2-S4-3).
 *
 * As delivered, it gates on the precondition this screen can observe, history
 * depth unset, and starts nothing itself: when unblocked its click does nothing
 * (CAP-001's narrower reading, kept so no outcome changes, AC-17). Blocked, it
 * stays focusable and exposes its reason through `aria-describedby` rather than
 * a bare `disabled`, and the reason links to Settings directly (AC-18).
 */
export function StartAction({
  historyDepthYears,
}: { historyDepthYears: number | null }): JSX.Element {
  const reasonId = useId();
  const blocked = historyDepthYears === null;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={blocked ? "blocked" : "default"}
        aria-describedby={blocked ? reasonId : undefined}
        className="w-fit"
      >
        Download now
      </Button>
      {blocked ? (
        <p id={reasonId} className="text-muted-foreground text-sm">
          History depth is not set. Set it in <Link to="/settings">Settings</Link> before
          downloading.
        </p>
      ) : null}
    </div>
  );
}
