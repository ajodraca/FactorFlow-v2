import { type JSX, useId } from "react";
import { Badge } from "../ui/badge";

/**
 * Present, absent and not determinable are three different things (component
 * design 2.5; UX design 0.7; DAC-E1-8; STD-UI-4; STD-UI-14). A blank means
 * only "does not apply" and is not this module's. Props are provisional,
 * recorded as DEC-0310.
 */

/**
 * Absent: an em dash for a value that does not exist, never zero and never
 * blank. The dash is hidden from assistive technology; `label` is the full
 * hidden phrase naming what is absent.
 */
export function Absent({ label }: { label: string }): JSX.Element {
  return (
    <span className="text-value-missing">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Not determinable: the `coverage-unknown` badge with its reason beside it and
 * as its accessible description. Never a dimmed absent, never a passed check.
 */
export function NotDeterminable({
  reason,
  label = "Not determinable",
}: {
  reason: string;
  label?: string;
}): JSX.Element {
  const id = useId();
  return (
    <span className="inline-flex items-center gap-2">
      <Badge variant="coverage-unknown" aria-describedby={id}>
        {label}
      </Badge>
      <span id={id} className="text-xs text-muted-foreground">
        {reason}
      </span>
    </span>
  );
}
