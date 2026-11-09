import { Circle, CircleDot, Diamond, Icon, type IconNode, Square, Triangle } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "../ui/badge";
import type { Tier } from "./tiers";

/**
 * The status badge every surface shares (component design `ui-components` 2.3;
 * DAC-E1-2; blueprint section 8; STD-UI-8): S1's `badge` `status-<tier>` variant
 * with the label as text and the tier shape as an `aria-hidden` icon, so no
 * status is carried by colour alone. The label comes from `labelOf` or from the
 * caller's own answer word, which is why it stays a prop rather than a `Status`.
 *
 * Neutral is a hollow circle, active a ringed dot, good a filled circle,
 * warning a triangle, serious a diamond and critical a square.
 */

/** Kept for the delivered CAP-002 callers (`as-of-line`, `set-history-dialog`, `history-tab`); new code imports `Tier`. */
export type StatusTier = Tier;

/** Lucide ships no filled circle, and the delivered tests want the circle element itself to carry the fill. */
const FILLED_CIRCLE: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", fill: "currentColor", key: "filled-circle" }],
];

const ICON_PROPS = {
  "aria-hidden": "true",
  focusable: "false",
  className: "h-3 w-3 shrink-0",
} as const;

const TIER_ICON: Record<Tier, JSX.Element> = {
  neutral: <Circle {...ICON_PROPS} />,
  active: <CircleDot {...ICON_PROPS} />,
  good: <Icon iconNode={FILLED_CIRCLE} {...ICON_PROPS} />,
  warning: <Triangle fill="currentColor" {...ICON_PROPS} />,
  serious: <Diamond fill="currentColor" {...ICON_PROPS} />,
  critical: <Square fill="currentColor" {...ICON_PROPS} />,
};

export interface StatusBadgeProps {
  tier: Tier;
  /** The badge's word, from `labelOf` or the caller's own answer. */
  children: string;
  /** A native tooltip, such as the building set's start time on *Updating* (UX design 1.2). */
  title?: string;
  /** Layout classes the host adds, as full literal strings. */
  className?: string;
}

export function StatusBadge({ tier, children, title, className }: StatusBadgeProps): JSX.Element {
  return (
    <Badge variant={`status-${tier}` as const} title={title} className={className}>
      {TIER_ICON[tier]}
      {children}
    </Badge>
  );
}
