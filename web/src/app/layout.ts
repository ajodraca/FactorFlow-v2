/*
 * The seven layout dimensions of the owner shell (component design owner-shell
 * 2.1; AC-26 as the owner narrowed it on 2026-10-25, review v1 FINDING-6;
 * DAC-E3-16; STD-UI-29).
 *
 * These are approved-specification values, not theme literals and not tokens.
 * They are read from here and never written at a call site: no other
 * non-test source under web/src/ holds one (the layout rule in
 * `components/token-literals.test.ts`, TC-COMP-072), with CAP-002's research
 * screens outside that rule (capability section 5, DEC-0321).
 */
export const LAYOUT = {
  railWidth: "208px", // the rail (UX design 0.1)
  contentMaxWidth: "1180px", // Home, Setup and Data health content cap
  sideColumnMin: "260px", // setup's step list, 260 to 300 px
  sideColumnMax: "300px",
  markerSize: "28px", // setup's step dot; Home's severity tile
  railIconSize: "16px", // the rail item icon
  explanationMeasure: "70ch", // setup's step explanation
} as const;
