import type { JSX } from "react";
import type { InstrumentLifecycle } from "../../api/types";

/**
 * A filled square: active. A hollow square: retired. Different shapes
 * rather than the same shape recoloured, so the two states are
 * distinguishable in greyscale (STD-UI-8, DAC-E2-S4-7) the same way the
 * shell's liveness icon already is.
 */
function LifecycleIcon({ lifecycle }: { lifecycle: InstrumentLifecycle }): JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      {lifecycle === "active" ? (
        <rect x="1" y="1" width="10" height="10" fill="currentColor" />
      ) : (
        <rect
          x="1"
          y="1"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

/**
 * The instrument table's lifecycle badge (ux-design section 1.2 Token
 * Usage; DAC-E2-S4-4, DAC-E2-S4-7): `secondary` for retired, carrying the
 * text label alongside its icon so the state reads in greyscale.
 */
export function LifecycleBadge({ lifecycle }: { lifecycle: InstrumentLifecycle }): JSX.Element {
  return (
    <span
      data-testid="lifecycle-badge"
      data-variant={lifecycle === "retired" ? "secondary" : "default"}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs data-[variant=secondary]:bg-secondary data-[variant=secondary]:text-secondary-foreground"
    >
      <LifecycleIcon lifecycle={lifecycle} />
      {lifecycle === "active" ? "Active" : "Retired"}
    </span>
  );
}
