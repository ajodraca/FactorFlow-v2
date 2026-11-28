import type { JSX } from "react";
import type { InstrumentLifecycle } from "../../api/types";
import { StatusBadge } from "../../components/patterns/status-badge";
import { type Status, labelOf, tierOf } from "../../components/patterns/tiers";

/** A stock the provider does not recognise: the result outcome `not_found` (ux-brief 12.2). */
const NOT_FOUND: Status = { of: "result", outcome: "not_found" };

/**
 * The followed-stocks lifecycle marker (UX design 1.6; DAC-E7-S3-5; DEC-0389).
 * *Stopped following* goes through `StatusBadge` as the neutral tier, a hollow
 * circle with its label, so it never reads by colour alone; a followed stock
 * carries its word alone, with no badge and no tier. Coverage renders this same
 * marker. Nothing here is not determinable, so nothing goes through
 * `NotDeterminable`. No file under this directory writes a unit literal: the
 * literal scan reads comments too.
 */
export function LifecycleBadge({ lifecycle }: { lifecycle: InstrumentLifecycle }): JSX.Element {
  if (lifecycle === "retired") {
    return <StatusBadge tier="neutral">Stopped following</StatusBadge>;
  }
  return <span>Followed</span>;
}

/**
 * The *Not found* marker for a stock the provider does not recognise (AC-14,
 * UX design 1.6 Recognition): the warning tier's triangle and its label.
 */
export function RecognitionBadge(): JSX.Element {
  return <StatusBadge tier={tierOf(NOT_FOUND)}>{labelOf(NOT_FOUND)}</StatusBadge>;
}
