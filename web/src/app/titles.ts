import { matchPath, useLocation } from "react-router-dom";
import { useTitleDetail } from "./shell-context";

/**
 * The static route-to-title table (owner-shell 2.6; DEC-0214, DEC-0329;
 * DAC-E3-9; UX design 0.3).
 *
 * A route enters this table in the change that registers it, as `DESTINATIONS`
 * does: CAP-003-E4-S6 adds `/setup` (Setup), CAP-003-E5-S5 `/home` (Home) and
 * CAP-003-E6-S7 `/data` (Data health). The separator between crumbs and its
 * rendering are the top bar's (CAP-003-E3-S6); this module holds none.
 */

/** A crumb as the table states it: text, the matched `:symbol`, or the detail slot. */
export type CrumbSpec =
  | { readonly label: string; readonly to?: string }
  | { readonly param: "symbol" }
  | { readonly detail: string };

/** One route pattern and its crumbs; `null` crumbs mean the route has no title. */
export interface TitleEntry {
  readonly pattern: string;
  readonly crumbs: readonly CrumbSpec[] | null;
}

/** A crumb as the top bar renders it. */
export interface Crumb {
  readonly label: string;
  readonly to?: string;
}

const DATA_HEALTH: CrumbSpec = { label: "Data health", to: "/data" };
const RESEARCH: CrumbSpec = { label: "Research", to: "/research" };

export const TITLES: readonly TitleEntry[] = [
  { pattern: "/", crumbs: null },
  { pattern: "/data/coverage", crumbs: [DATA_HEALTH, { label: "Coverage" }] },
  { pattern: "/data/followed", crumbs: [DATA_HEALTH, { label: "Followed stocks" }] },
  { pattern: "/data/downloads", crumbs: [DATA_HEALTH, { label: "Downloads" }] },
  {
    pattern: "/data/downloads/:runId",
    crumbs: [DATA_HEALTH, { label: "Downloads", to: "/data/downloads" }, { detail: "Download" }],
  },
  { pattern: "/settings", crumbs: [{ label: "Settings" }] },
  { pattern: "/research", crumbs: [{ label: "Research" }] },
  { pattern: "/research/stocks/:symbol", crumbs: [RESEARCH, { param: "symbol" }] },
  { pattern: "/research/compare", crumbs: [RESEARCH, { label: "Compare" }] },
  { pattern: "/research/universes", crumbs: [RESEARCH, { label: "Universes" }] },
  {
    pattern: "/research/universes/:universeId",
    crumbs: [RESEARCH, { label: "Universes", to: "/research/universes" }, { detail: "Universe" }],
  },
  { pattern: "/coverage", crumbs: null },
  { pattern: "/instruments", crumbs: null },
  { pattern: "/runs", crumbs: null },
  { pattern: "/runs/:runId", crumbs: null },
  { pattern: "*", crumbs: [{ label: "Page not found" }] },
];

/**
 * The crumbs for a pathname, or `null` when the route has no title. The
 * router's own matcher decides which entry applies, so a title never
 * disagrees with the route that renders; an unmatched path takes the `*`
 * entry. A detail crumb reads `detail` when it is a non-empty string, else
 * its generic noun.
 */
export function resolveTitle(pathname: string, detail: string | null): readonly Crumb[] | null {
  let entry = TITLES.find((e) => e.pattern === "*");
  let params: Readonly<Record<string, string | undefined>> = {};
  for (const candidate of TITLES) {
    const matched =
      candidate.pattern === "*"
        ? null
        : matchPath({ path: candidate.pattern, end: true }, pathname);
    if (matched !== null) {
      entry = candidate;
      params = matched.params;
      break;
    }
  }
  if (entry === undefined || entry.crumbs === null) {
    return null;
  }
  return entry.crumbs.map((spec): Crumb => {
    if ("param" in spec) {
      return { label: params[spec.param] ?? "" };
    }
    if ("detail" in spec) {
      return { label: detail || spec.detail };
    }
    return spec.to === undefined ? { label: spec.label } : { label: spec.label, to: spec.to };
  });
}

/** The current title: the route's crumbs with the detail a screen set (DEC-0323). */
export function useTitle(): readonly Crumb[] | null {
  return resolveTitle(useLocation().pathname, useTitleDetail());
}
