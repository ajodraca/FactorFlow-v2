import type { JSX } from "react";
import { formatTimestamp } from "../../app/status-region";
import { GapsUnknownBadge } from "./badges";

/**
 * No observation exists (STD-UI-4; DAC-E6-S4-1): an em dash, with the fact
 * spelled out for assistive technology.
 */
export function MissingValue(): JSX.Element {
  return (
    <span data-state="missing" className="text-value-missing">
      <span aria-hidden="true">—</span>
      <span className="sr-only">No data</span>
    </span>
  );
}

/** A measured count, zero included (STD-UI-4; DAC-E6-S4-1). */
export function CountValue({ value }: { value: number }): JSX.Element {
  return (
    <span data-state="measured" className="font-numeric">
      {value}
    </span>
  );
}

/** A cell the question does not apply to: blank, with an `sr-only` label (DAC-E6-S4-1). */
export function Inapplicable(): JSX.Element {
  return (
    <span data-state="inapplicable">
      <span className="sr-only">Not applicable</span>
    </span>
  );
}

/**
 * A session date is a calendar day as the exchange recorded it. It is
 * returned unchanged and never passed to `Date`, which would shift it by
 * the viewer's zone (STD-UI-5; OQ-UI-3 closure; DAC-E6-S4-2).
 */
export function formatSessionDate(value: string): string {
  return value;
}

export function SessionDate({ value }: { value: string }): JSX.Element {
  return <span className="font-numeric">{formatSessionDate(value)}</span>;
}

/** An instant, shown in America/Chicago through the shell's formatter (DAC-E6-S4-2). */
export function Timestamp({ value }: { value: string }): JSX.Element {
  return <span className="font-numeric">{formatTimestamp(new Date(value))}</span>;
}

/**
 * The Gaps column (DAC-E6-4, DAC-E6-S4-1; CAP-001-E6-S3-tasks Open Gap 4).
 * An unavailable view always renders Unknown, even if a count arrived, so
 * a number never appears when the view says detection could not run. On an
 * available view, a `null` count means gap detection does not apply to
 * this instrument (DAC-E6-5).
 */
export function GapsCell({
  gapCount,
  available,
}: {
  gapCount: number | null;
  available: boolean;
}): JSX.Element {
  if (!available) {
    return <GapsUnknownBadge />;
  }
  return gapCount === null ? <Inapplicable /> : <CountValue value={gapCount} />;
}
