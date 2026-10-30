import type { JSX } from "react";
import { TIER_CLASSES } from "../../screens/runs/outcome-badge";

/**
 * The status badge the CAP-002 score-set surfaces share: the not-current
 * banner and the as-of line (UX design 1.2; STD-UI-8). Its tier classes are
 * the delivered map in `web/src/screens/runs/outcome-badge.tsx`, imported
 * rather than restated (SA-DUP-001). The shapes are UX design 1.2's, which
 * gives CAP-002 badges shapes of their own so the tiers stay distinct in
 * greyscale: good a filled circle, warning a triangle, active a ringed dot,
 * critical a square.
 */

export type StatusTier = "good" | "warning" | "active" | "critical";

const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";

const TIER_SHAPES: Record<StatusTier, JSX.Element> = {
  good: <circle cx="6" cy="6" r="5" fill="currentColor" />,
  warning: <path d="M6 1 11 11H1Z" fill="currentColor" />,
  active: (
    <>
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="2" fill="currentColor" />
    </>
  ),
  critical: <rect x="1.5" y="1.5" width="9" height="9" fill="currentColor" />,
};

export interface StatusBadgeProps {
  tier: StatusTier;
  /** The badge's word, from the copy catalogue. */
  children: string;
  /** A native tooltip, such as the building set's start time on *Updating* (UX design 1.2). */
  title?: string;
  /** Layout classes the host adds, as full literal strings. */
  className?: string;
}

export function StatusBadge({ tier, children, title, className }: StatusBadgeProps): JSX.Element {
  return (
    <span
      data-variant={`status-${tier}`}
      title={title}
      className={[BADGE, className, TIER_CLASSES[tier]].filter(Boolean).join(" ")}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        {TIER_SHAPES[tier]}
      </svg>
      {children}
    </span>
  );
}
