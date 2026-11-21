import { RESEARCH_REGISTERED } from "../destinations";

/**
 * Where a chosen stock goes (DEC-0207; AC-27): the Research evidence page when
 * its routes are registered, otherwise its row in Coverage. The flag is read at
 * call time.
 */
export function stockTarget(symbol: string): string {
  const encoded = encodeURIComponent(symbol);
  return RESEARCH_REGISTERED ? `/research/stocks/${encoded}` : `/data/coverage?symbol=${encoded}`;
}

/** Where a chosen universe goes. Universes are offered only while registered. */
export function universeTarget(id: string): string {
  return `/research/universes/${encodeURIComponent(id)}`;
}
