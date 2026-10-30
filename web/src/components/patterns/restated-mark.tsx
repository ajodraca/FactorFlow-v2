import type { JSX } from "react";
import type { FactorName } from "../../api/classification-types";
import { CELL } from "../../screens/research/copy";

/** The `badge` `status-neutral` tokens at the delivered badge size, with no badge component (DEC-0075). */
const MARK_CLASSES =
  "inline-flex items-center rounded px-2 py-1 text-xs bg-status-neutral-muted text-status-neutral";

/**
 * The *Possibly restated* mark (classification-ui section 2.5; UX design 1.1;
 * STD-UI-17): a composition, not a badge, so its accessible name is its own
 * text (DEC-0075). The words from `copy.ts` are the text, visually hidden;
 * the glyph *R* is drawn `aria-hidden` beside them. No `role`, `aria-label`
 * or `title` overrides the name.
 *
 * The momentum guard lives here rather than in each consumer: DAC-E4-S3-3
 * says the mark never renders on momentum, and the inspector, universe
 * detail, compare, evidence and history all reuse this one element, so no
 * caller can show it there by mistake (DEC-0150).
 */
export function RestatedMark({ factor }: { factor: FactorName }): JSX.Element | null {
  if (factor === "momentum") {
    return null;
  }
  return (
    <span className={MARK_CLASSES}>
      <span className="sr-only">{CELL.possiblyRestated}</span>
      <span aria-hidden="true">R</span>
    </span>
  );
}
