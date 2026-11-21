/**
 * The owner's destinations, one static ordered list (owner-shell 2.6; DEC-0204;
 * DAC-E3-2).
 *
 * A destination enters this list in the change that registers its screen, so
 * the list never names a route the router cannot render. Home goes first
 * (CAP-003-E5-S5) and Data health goes before Settings (CAP-003-E6-S7).
 */
export interface Destination {
  readonly group: "primary" | "data";
  readonly label: string;
  readonly to: string;
  readonly count?: "needs-you" | "problems";
}

export const DESTINATIONS: readonly Destination[] = [
  { group: "primary", label: "Research", to: "/research" },
  { group: "data", label: "Settings", to: "/settings" },
];

/**
 * True exactly when Research is in the list. Derived from the static list at
 * module load, never from the router: the product detects no route at run
 * time (DEC-0204).
 */
export const RESEARCH_REGISTERED: boolean = DESTINATIONS.some((d) => d.to === "/research");
