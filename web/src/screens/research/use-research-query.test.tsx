import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { MemoryRouter, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_RESEARCH_QUERY,
  type ResearchQuery,
  applyResearchQuery,
  decodeResearchQuery,
} from "../../api/research-query";
import { useResearchQuery } from "./use-research-query";

/**
 * The hook under test beside the router state a host observes: the search
 * string, how many distinct locations have been visited, how the last one was
 * reached and a way back (T007; DAC-E4-3, DAC-E4-S5-2; DEC-0156).
 */
function useHarness() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const research = useResearchQuery();
  const keys = useRef<string[]>([]);
  if (keys.current[keys.current.length - 1] !== location.key) {
    keys.current.push(location.key);
  }
  return {
    ...research,
    search: location.search.replace(/^\?/, ""),
    navigations: keys.current.length - 1,
    navigationType,
    back: () => navigate(-1),
  };
}

function renderAt(search: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/research${search}`]}>{children}</MemoryRouter>
  );
  return renderHook(useHarness, { wrapper });
}

const VALUE_80: ResearchQuery = {
  ...DEFAULT_RESEARCH_QUERY,
  sentences: { value: { measure: "percentile", direction: "atLeast", value: "80" } },
};

describe("useResearchQuery (T007; DAC-E4-3, DAC-E4-S5-2; DEC-0156)", () => {
  it("reads the query as decodeResearchQuery reads the location search", () => {
    const search =
      "?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&hide_incomplete=true&symbol=aa&sort=symbol&order=desc&tab=history";
    const { result } = renderAt(search);

    expect(result.current.query).toEqual(decodeResearchQuery(new URLSearchParams(search)));
    expect(result.current.query.symbol).toBe("AA");
    expect(result.current.query.scope).toBe("u1");
  });

  it("setQuery writes applyResearchQuery over the current params: unknown keys survive, defaults are not written", () => {
    const { result } = renderAt("?tab=history&sort=symbol");

    act(() => result.current.setQuery({ ...result.current.query, hideIncomplete: true }));

    const expected = applyResearchQuery(new URLSearchParams("tab=history&sort=symbol"), {
      ...DEFAULT_RESEARCH_QUERY,
      hideIncomplete: true,
      sort: { key: "symbol", order: "asc" },
    }).toString();
    expect(result.current.search).toBe(expected);
    expect(result.current.search).toBe("tab=history&hide_incomplete=true&sort=symbol");
    expect(result.current.search).not.toContain("scope=");
    expect(result.current.search).not.toContain("order=");
  });

  it("setQuery causes exactly one navigation, a push, so back restores the earlier URL", () => {
    const { result } = renderAt("?sort=symbol");
    expect(result.current.navigations).toBe(0);

    act(() => result.current.setQuery({ ...result.current.query, symbol: "AA" }));

    expect(result.current.navigations).toBe(1);
    expect(result.current.navigationType).toBe("PUSH");
    expect(result.current.search).toBe("symbol=AA&sort=symbol");

    act(() => result.current.back());

    expect(result.current.search).toBe("sort=symbol");
    expect(result.current.query.symbol).toBeNull();
  });

  it("setQuery of an equal query causes no navigation", () => {
    const { result } = renderAt("?value.measure=percentile&value.direction=atLeast&value.value=80");
    const before = result.current.query;

    act(() => result.current.setQuery({ ...VALUE_80 }));

    expect(result.current.navigations).toBe(0);
    expect(result.current.query).toBe(before);
  });

  it("clear writes the defaults and keeps sort and order", () => {
    const { result } = renderAt(
      "?scope=u1&value.measure=percentile&value.direction=atLeast&value.value=80&hide_incomplete=true&symbol=AA&sort=value_percentile&order=desc&tab=history",
    );

    act(() => result.current.clear());

    expect(result.current.search).toBe("tab=history&sort=value_percentile&order=desc");
    expect(result.current.query).toEqual({
      ...DEFAULT_RESEARCH_QUERY,
      sort: { key: "value_percentile", order: "desc" },
    });
    expect(result.current.navigations).toBe(1);
  });

  it("clear with no sort writes the empty query", () => {
    const { result } = renderAt("?symbol=AA");

    act(() => result.current.clear());

    expect(result.current.search).toBe("");
    expect(result.current.query).toEqual(DEFAULT_RESEARCH_QUERY);
  });

  it("two setQuery calls in one tick are two pushes, each a full rewrite of the owned keys", () => {
    const { result } = renderAt("?tab=history");

    act(() => {
      const current = result.current.query;
      result.current.setQuery({ ...current, symbol: "AA" });
      result.current.setQuery({ ...current, symbol: "AA", hideIncomplete: true });
    });

    expect(result.current.search).toBe("tab=history&hide_incomplete=true&symbol=AA");

    // react-router's functional setSearchParams hands the second write the
    // render snapshot, not the first write's URL; applyResearchQuery rewrites
    // every owned key from `next`, so a full query lands whole either way.
    // React renders the two pushes once, so the history entries, not the
    // renders, show that each write was its own push.
    act(() => result.current.back());
    expect(result.current.search).toBe("tab=history&symbol=AA");

    act(() => result.current.back());
    expect(result.current.search).toBe("tab=history");
  });

  it("keeps the query identity across re-renders while the search is unchanged", () => {
    const { result, rerender } = renderAt("?symbol=AA");
    const first = result.current.query;

    rerender();

    expect(result.current.query).toBe(first);

    act(() => result.current.setQuery({ ...result.current.query, hideIncomplete: true }));

    expect(result.current.query).not.toBe(first);
  });
});
