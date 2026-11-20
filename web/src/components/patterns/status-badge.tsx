import { Circle, CircleDot, Diamond, Icon, type IconNode, Square, Triangle } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
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
} as const;

/**
 * The one tier-to-shape mapping (blueprint section 8; ui-components 10 *Tier
 * shapes*), used by `StatusBadge` and the *Needs you* severity tile so the two
 * cannot draw a tier differently (DEC-0319).
 */
export function TierShape({
  tier,
  className,
}: {
  tier: Tier;
  className?: string;
}): JSX.Element {
  const classes = cn("h-3 w-3 shrink-0", className);
  switch (tier) {
    case "neutral":
      return <Circle {...ICON_PROPS} className={classes} />;
    case "active":
      return <CircleDot {...ICON_PROPS} className={classes} />;
    case "good":
      return <Icon iconNode={FILLED_CIRCLE} {...ICON_PROPS} className={classes} />;
    case "warning":
      return <Triangle fill="currentColor" {...ICON_PROPS} className={classes} />;
    case "serious":
      return <Diamond fill="currentColor" {...ICON_PROPS} className={classes} />;
    case "critical":
      return <Square fill="currentColor" {...ICON_PROPS} className={classes} />;
  }
}

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
      <TierShape tier={tier} />
      {children}
    </Badge>
  );
}
