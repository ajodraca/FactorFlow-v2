import type { JSX, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import type { NeedsYouItem } from "./needs-you";
import { StatusBadge, TierShape } from "./status-badge";
import { type Tier, labelOf } from "./tiers";

/**
 * One *Needs you* row (blueprint 4.1; UX design 1.3; `home-ui` 2.5 and 10;
 * DAC-E1-S8-3; DEC-0319): a hidden severity tile in the tier's status pair and
 * shape, the tag badge through `StatusBadge`, a title, a body and exactly one
 * link styled `button` `outline`. The copy is the caller's; the tag comes from
 * `labelOf`, and the link always goes to the derivation's `target`. The caller
 * passes the tile's size (`LAYOUT.markerSize`), so this layer carries no layout
 * literal.
 */
export interface NeedsYouItemRowProps {
  item: NeedsYouItem;
  title: string;
  body: ReactNode;
  /** The link's visible text. */
  actionLabel: string;
  /** The link's accessible name, which names the item. */
  actionName: string;
  /** The tile's width and height, as a CSS length. */
  markerSize: string;
}

const TILE_CLASSES: Record<Tier, string> = {
  neutral: "bg-status-neutral-muted text-status-neutral",
  active: "bg-status-active-muted text-status-active",
  good: "bg-status-good-muted text-status-good",
  warning: "bg-status-warning-muted text-status-warning",
  serious: "bg-status-serious-muted text-status-serious",
  critical: "bg-status-critical-muted text-status-critical",
};

export function NeedsYouItemRow({
  item,
  title,
  body,
  actionLabel,
  actionName,
  markerSize,
}: NeedsYouItemRowProps): JSX.Element {
  return (
    <li className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
      <span
        aria-hidden="true"
        data-slot="severity-tile"
        style={{ width: markerSize, height: markerSize }}
        className={cn("flex shrink-0 items-center justify-center rounded", TILE_CLASSES[item.tier])}
      >
        <TierShape tier={item.tier} className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <StatusBadge tier={item.tier}>{labelOf({ of: "item", kind: item.kind })}</StatusBadge>
        <p className="truncate font-semibold">{title}</p>
        <p>{body}</p>
      </div>
      <Button asChild variant="outline" className="shrink-0">
        <Link to={item.target} aria-label={actionName}>
          {actionLabel}
        </Link>
      </Button>
    </li>
  );
}
