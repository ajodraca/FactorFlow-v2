import type { JSX } from "react";
import type { PresenceState } from "../../api/types";
import { shortBy } from "./copy";

const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";
const UNKNOWN_CLASSES =
  "bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate";

function Icon({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      {children}
    </svg>
  );
}

/** A check mark: present. */
function CheckIcon(): JSX.Element {
  return (
    <Icon>
      <polyline points="2,6 5,9 10,3" fill="none" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

/** A question mark: the check could not run. */
function QuestionIcon(): JSX.Element {
  return (
    <Icon>
      <path
        d="M4 4a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5V8M6 10v.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Icon>
  );
}

/** A warning triangle: short of the stated depth. */
function WarningIcon(): JSX.Element {
  return (
    <Icon>
      <path d="M6 1 11 11H1Z" fill="currentColor" />
    </Icon>
  );
}

function UnknownBadge({ testId }: { testId: string }): JSX.Element {
  return (
    <span
      data-testid={testId}
      data-variant="coverage-unknown"
      className={`${BADGE} ${UNKNOWN_CLASSES}`}
    >
      <QuestionIcon />
      Unknown
    </span>
  );
}

/**
 * One data type's presence (ux-design 1.1; DAC-E6-S4-3, DAC-E6-S4-7). Each
 * state carries a text label and its own shape, never colour alone
 * (STD-UI-8). Absent uses the em dash as its shape, which also satisfies
 * owner-web-app design AC 2 (CAP-001-E6-S4-tasks Resolved Conflict 2).
 * Unknown carries the hatch pattern, so it never reads as a milder absent
 * (STD-UI-14).
 */
export function PresenceBadge({ state }: { state: PresenceState }): JSX.Element {
  if (state === "unknown") {
    return <UnknownBadge testId="presence-badge" />;
  }
  if (state === "absent") {
    return (
      <span
        data-testid="presence-badge"
        data-variant="coverage-absent"
        className={`${BADGE} bg-value-missing-muted text-value-missing`}
      >
        <span aria-hidden="true">—</span>
        Absent
      </span>
    );
  }
  return (
    <span
      data-testid="presence-badge"
      data-variant="coverage-present"
      className={`${BADGE} bg-status-good-muted text-status-good`}
    >
      <CheckIcon />
      Present
    </span>
  );
}

/**
 * The Gaps column when gap detection is unavailable (ux-design 1.1, "Gap
 * detection unavailable"; DAC-E6-4): the same visual as an unknown
 * presence, never a zero.
 */
export function GapsUnknownBadge(): JSX.Element {
  return <UnknownBadge testId="gaps-unknown-badge" />;
}

/** The depth-shortfall marker (ux-design 1.1 "Short of stated depth"; AC-22). */
export function DepthShortBadge({ years }: { years: number }): JSX.Element {
  return (
    <span
      data-testid="depth-short-badge"
      data-variant="status-warning"
      className={`${BADGE} bg-status-warning-muted text-status-warning`}
    >
      <WarningIcon />
      {shortBy(years)}
    </span>
  );
}
