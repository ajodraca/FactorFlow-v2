import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge treats an unknown `bg-<value>` as a background colour, so the
 * stock merge would drop either the muted colour or the pattern of the
 * `coverage-unknown` badge. The theme's `pattern-indeterminate` key is
 * registered as a background image so both survive (component design 2.1,
 * DAC-E1-S1-1).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-image": [{ bg: ["pattern-indeterminate"] }],
    },
  },
});

/** Joins class values and resolves Tailwind conflicts, as shadcn/ui ships `cn`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
