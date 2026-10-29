import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_RESEARCH_QUERY,
  type ResearchQuery,
  applyResearchQuery,
  decodeResearchQuery,
} from "../../api/research-query";

/** What a host reads and writes: the query, one write, and the reset Clear filters performs. */
export interface ResearchQueryBinding {
  query: ResearchQuery;
  setQuery(next: ResearchQuery): void;
  clear(): void;
}

/**
 * The React binding between the URL and S2's `ResearchQuery` (DAC-E4-3;
 * DEC-0156). The URL is the only state: `query` is `decodeResearchQuery` of
 * the location search, and `setQuery` writes `applyResearchQuery` over the
 * current params as a push, so unknown keys survive, no default is written
 * and back navigation restores the earlier filter. A write that leaves the
 * search unchanged navigates nowhere.
 *
 * Two writes in one tick do not compose: react-router's functional
 * `setSearchParams` hands each updater the render's params, not the previous
 * write's result, so a second write in the same tick must carry the whole
 * query it wants. Every write here is a full query built from `query`.
 *
 * The host that issues the list request (CAP-002-E4-S9 on Research,
 * CAP-002-E1-S8 on universe detail) must key it on `query`, whose identity is
 * stable while the search string is unchanged: one write, one URL, one request
 * (DAC-E4-S5-2). The Filters pane never fetches the list.
 */
export function useResearchQuery(): ResearchQueryBinding {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const query = useMemo(() => decodeResearchQuery(new URLSearchParams(search)), [search]);

  const setQuery = useCallback(
    (next: ResearchQuery): void => {
      if (applyResearchQuery(new URLSearchParams(search), next).toString() === search) {
        return;
      }
      setSearchParams((previous) => applyResearchQuery(previous, next));
    },
    [search, setSearchParams],
  );

  const clear = useCallback(
    (): void => setQuery({ ...DEFAULT_RESEARCH_QUERY, sort: query.sort }),
    [query.sort, setQuery],
  );

  return { query, setQuery, clear };
}
