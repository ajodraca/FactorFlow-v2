import { describe, expect, it } from "vitest";
import type { FactorName, ThresholdBounds, Thresholds } from "./classification-types";
import {
  DEFAULT_RESEARCH_QUERY,
  type Direction,
  type Measure,
  type ResearchQuery,
  type SortKey,
  applyResearchQuery,
  decodeResearchQuery,
  encodeResearchQuery,
  sentenceToBound,
  toListParams,
  toThresholds,
} from "./research-query";

const FACTORS: FactorName[] = ["value", "growth", "momentum"];
const MEASURES: Measure[] = ["percentile", "standardisedScore"];
const DIRECTIONS: Direction[] = ["atLeast", "atMost"];

/** The API's sort allowlist, classification-api section 2.4. */
const SORT_ALLOWLIST: SortKey[] = [
  "symbol",
  "value_score",
  "value_percentile",
  "growth_score",
  "growth_percentile",
  "momentum_score",
  "momentum_percentile",
];

const BOUND_KEYS: (keyof ThresholdBounds)[] = [
  "valuePercentileMin",
  "valuePercentileMax",
  "valueScoreMin",
  "valueScoreMax",
  "growthPercentileMin",
  "growthPercentileMax",
  "growthScoreMin",
  "growthScoreMax",
  "momentumPercentileMin",
  "momentumPercentileMax",
  "momentumScoreMin",
  "momentumScoreMax",
];

function query(overrides: Partial<ResearchQuery>): ResearchQuery {
  return { ...DEFAULT_RESEARCH_QUERY, ...overrides };
}

function roundTrip(q: ResearchQuery): ResearchQuery {
  return decodeResearchQuery(new URLSearchParams(encodeResearchQuery(q).toString()));
}

function boundsOf(params: object): string[] {
  return Object.keys(params).filter((key) => (BOUND_KEYS as string[]).includes(key));
}

// Implements TC-COMP-132 (T002): DAC-E4-S2-1.
describe("TC-COMP-132: ResearchQuery URL round-trip; one sentence per bound", () => {
  const rows: [string, ResearchQuery][] = [];
  for (const factor of FACTORS) {
    for (const measure of MEASURES) {
      for (const direction of DIRECTIONS) {
        const value = measure === "percentile" ? "80" : "-0.45";
        rows.push([
          `${factor} ${measure} ${direction}`,
          query({ sentences: { [factor]: { measure, direction, value } } }),
        ]);
      }
    }
  }
  rows.push(["no sentence", DEFAULT_RESEARCH_QUERY]);
  rows.push([
    "all three sentences",
    query({
      sentences: {
        value: { measure: "percentile", direction: "atLeast", value: "80" },
        growth: { measure: "standardisedScore", direction: "atMost", value: "+1.27" },
        momentum: { measure: "standardisedScore", direction: "atLeast", value: "0.00" },
      },
    }),
  ]);
  rows.push(["universe scope", query({ scope: "8d9a3c1e-0000-4000-8000-000000000001" })]);
  rows.push(["hide incomplete", query({ hideIncomplete: true })]);
  rows.push(["search", query({ symbol: "AA" })]);
  for (const key of SORT_ALLOWLIST) {
    rows.push([`sort ${key} asc`, query({ sort: { key, order: "asc" } })]);
    rows.push([`sort ${key} desc`, query({ sort: { key, order: "desc" } })]);
  }
  rows.push([
    "everything at once",
    query({
      scope: "u1",
      sentences: { value: { measure: "percentile", direction: "atLeast", value: "80.0" } },
      hideIncomplete: true,
      symbol: "BRK.B",
      sort: { key: "momentum_percentile", order: "desc" },
    }),
  ]);

  it.each(rows)("round-trips %s", (_name, q) => {
    expect(roundTrip(q)).toEqual(q);
  });

  it("maps each measure and direction onto exactly one of the twelve bounds", () => {
    const seen = new Set<string>();
    for (const factor of FACTORS) {
      const expected: Record<Measure, Record<Direction, keyof ThresholdBounds>> = {
        percentile: {
          atLeast: `${factor}PercentileMin` as keyof ThresholdBounds,
          atMost: `${factor}PercentileMax` as keyof ThresholdBounds,
        },
        standardisedScore: {
          atLeast: `${factor}ScoreMin` as keyof ThresholdBounds,
          atMost: `${factor}ScoreMax` as keyof ThresholdBounds,
        },
      };
      for (const measure of MEASURES) {
        for (const direction of DIRECTIONS) {
          const sentence = { measure, direction, value: "50" };
          expect(sentenceToBound(factor, sentence)).toEqual([expected[measure][direction], "50"]);
          const sent = toListParams(query({ sentences: { [factor]: sentence } }));
          expect(boundsOf(sent)).toEqual([expected[measure][direction]]);
          seen.add(expected[measure][direction]);
        }
      }
    }
    expect([...seen].sort()).toEqual([...BOUND_KEYS].sort());
  });

  it("drops an invalid sentence and sends none of the twelve bounds", () => {
    const decoded = decodeResearchQuery(
      new URLSearchParams("value.measure=percentile&value.direction=atLeast&value.value=101"),
    );
    expect(decoded.sentences).toEqual({});
    expect(boundsOf(toListParams(decoded))).toEqual([]);
  });
});

// Implements TC-COMP-133 (T003): DAC-E4-S2-2.
describe("TC-COMP-133: save payload is the twelve bounds, hide_incomplete and symbol", () => {
  const ALLOWED = [...BOUND_KEYS, "hideIncomplete", "symbol"];
  const saved = query({
    scope: null,
    sentences: {
      value: { measure: "percentile", direction: "atLeast", value: "80" },
      momentum: { measure: "standardisedScore", direction: "atLeast", value: "0.00" },
    },
    hideIncomplete: true,
    symbol: "AA",
    sort: { key: "value_percentile", order: "desc" },
  });

  /** The list read's filter, with the defaults toListParams leaves out read back in. */
  function listFilter(q: ResearchQuery): Thresholds {
    const params = toListParams(q) as Record<string, unknown>;
    const filter: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (key in params) {
        filter[key] = params[key];
      }
    }
    return { hideIncomplete: false, symbol: null, ...filter } as Thresholds;
  }

  it("carries only the fourteen allowed keys, exactly the bounds the sentences set", () => {
    const thresholds = toThresholds(saved);
    expect(Object.keys(thresholds).every((key) => ALLOWED.includes(key))).toBe(true);
    expect(thresholds).toEqual({
      valuePercentileMin: "80",
      momentumScoreMin: "0.00",
      hideIncomplete: true,
      symbol: "AA",
    });
    for (const key of ["scope", "sort", "order", "universeId", "limit", "cursor"]) {
      expect(thresholds).not.toHaveProperty(key);
    }
  });

  it("never carries the scope, even for a universe scope", () => {
    const thresholds = toThresholds(query({ scope: "u1", sort: { key: "symbol", order: "asc" } }));
    expect(thresholds).toEqual({ hideIncomplete: false, symbol: null });
  });

  it("carries the same filter as the list read", () => {
    expect(toThresholds(saved)).toEqual(listFilter(saved));
    expect(toThresholds(DEFAULT_RESEARCH_QUERY)).toEqual(listFilter(DEFAULT_RESEARCH_QUERY));
  });

  it("always carries hideIncomplete and symbol, which the default list read leaves out", () => {
    expect(toThresholds(DEFAULT_RESEARCH_QUERY)).toEqual({ hideIncomplete: false, symbol: null });
    const params = toListParams(DEFAULT_RESEARCH_QUERY);
    expect(params).not.toHaveProperty("hideIncomplete");
    expect(params).not.toHaveProperty("symbol");
  });
});

// T006: codec edge cases (AC-16, DAC-E4-3, DAC-E4-S2-1; DEC-0148).
describe("research-query codec edge cases", () => {
  const decode = (search: string): ResearchQuery =>
    decodeResearchQuery(new URLSearchParams(search));

  it("decodes empty input to the default and never writes a default", () => {
    expect(decode("")).toEqual(DEFAULT_RESEARCH_QUERY);
    expect(DEFAULT_RESEARCH_QUERY).toEqual({
      scope: null,
      sentences: {},
      hideIncomplete: false,
      symbol: null,
      sort: null,
    });
    expect(encodeResearchQuery(DEFAULT_RESEARCH_QUERY).toString()).toBe("");
    expect(toListParams(DEFAULT_RESEARCH_QUERY)).toEqual({});
  });

  it("decodes scope=all as all followed stocks and never writes it", () => {
    expect(decode("scope=all")).toEqual(DEFAULT_RESEARCH_QUERY);
    expect(toListParams(decode("scope=all"))).not.toHaveProperty("universeId");
    const applied = applyResearchQuery(
      new URLSearchParams("scope=all&tab=history"),
      DEFAULT_RESEARCH_QUERY,
    );
    expect(applied.get("tab")).toBe("history");
    expect(applied.has("scope")).toBe(false);
  });

  it("passes any other scope through as a universe id with no shape check", () => {
    expect(decode("scope=u1").scope).toBe("u1");
    expect(toListParams(decode("scope=u1"))).toEqual({ universeId: "u1" });
    expect(decode("scope=ALL").scope).toBe("ALL");
    expect(encodeResearchQuery(query({ scope: "u1" })).toString()).toBe("scope=u1");
  });

  it("ignores unknown keys on decode and leaves them untouched on apply", () => {
    expect(decode("foo=1&tab=history&symbols=AAPL,MSFT")).toEqual(DEFAULT_RESEARCH_QUERY);
    const params = new URLSearchParams(
      "foo=1&scope=u9&value.measure=percentile&value.direction=atLeast&value.value=10&tab=history&symbols=AAPL,MSFT&hide_incomplete=true&symbol=ZZ&sort=symbol&order=desc",
    );
    const next = query({
      sentences: { growth: { measure: "percentile", direction: "atMost", value: "20" } },
    });
    const applied = applyResearchQuery(params, next);
    expect(applied.get("foo")).toBe("1");
    expect(applied.get("tab")).toBe("history");
    expect(applied.get("symbols")).toBe("AAPL,MSFT");
    for (const key of [
      "scope",
      "value.measure",
      "value.direction",
      "value.value",
      "hide_incomplete",
      "symbol",
      "sort",
      "order",
    ]) {
      expect(applied.has(key)).toBe(false);
    }
    expect(applied.get("growth.measure")).toBe("percentile");
    expect(applied.get("growth.direction")).toBe("atMost");
    expect(applied.get("growth.value")).toBe("20");
    expect(decodeResearchQuery(applied)).toEqual(next);
    expect(params.get("scope")).toBe("u9");
    const rewritten = applyResearchQuery(
      params,
      query({
        scope: "u2",
        sentences: { value: { measure: "standardisedScore", direction: "atMost", value: "1.5" } },
        symbol: "MSFT",
        sort: { key: "value_score", order: "desc" },
      }),
    );
    expect(rewritten.getAll("scope")).toEqual(["u2"]);
    expect(rewritten.getAll("value.measure")).toEqual(["standardisedScore"]);
    expect(rewritten.getAll("value.direction")).toEqual(["atMost"]);
    expect(rewritten.getAll("value.value")).toEqual(["1.5"]);
    expect(rewritten.getAll("symbol")).toEqual(["MSFT"]);
    expect(rewritten.getAll("sort")).toEqual(["value_score"]);
    expect(rewritten.getAll("order")).toEqual(["desc"]);
    expect(rewritten.has("hide_incomplete")).toBe(false);
    expect(rewritten.get("foo")).toBe("1");
  });

  it.each([
    "value.direction=atLeast&value.value=80",
    "value.measure=percentile&value.value=80",
    "value.measure=percentile&value.direction=atLeast",
    "value.measure=bogus&value.direction=atLeast&value.value=80",
    "value.measure=percentile&value.direction=bogus&value.value=80",
    "value.measure=percentile&value.direction=atLeast&value.value=-1",
    "value.measure=percentile&value.direction=atLeast&value.value=101",
    "value.measure=percentile&value.direction=atLeast&value.value=100.01",
    // Above 100 by less than a float can tell from 100 (IR-004).
    "value.measure=percentile&value.direction=atLeast&value.value=100.00000000000000001",
    "value.measure=percentile&value.direction=atLeast&value.value=-0.00000000000000001",
    "value.measure=percentile&value.direction=atLeast&value.value=-0.5",
    "value.measure=percentile&value.direction=atLeast&value.value=%2B100.5",
    "value.measure=percentile&value.direction=atLeast&value.value=abc",
    "value.measure=standardisedScore&value.direction=atLeast&value.value=abc",
    "value.measure=standardisedScore&value.direction=atLeast&value.value=NaN",
    "value.measure=standardisedScore&value.direction=atLeast&value.value=Infinity",
    "value.measure=standardisedScore&value.direction=atLeast&value.value=1e3",
    "value.measure=standardisedScore&value.direction=atLeast&value.value=",
  ])("drops the invalid sentence %s whole", (search) => {
    expect(decode(search).sentences).toEqual({});
  });

  it.each([
    ["percentile", "0"],
    ["percentile", "100"],
    ["percentile", "99.5"],
    ["percentile", "100.0000000000"],
    ["percentile", "0.00"],
    ["percentile", "099.99999999999999999"],
    ["percentile", "-0.00"],
    ["percentile", "+100"],
    ["standardisedScore", "-0.45"],
    ["standardisedScore", "+1.27"],
    ["standardisedScore", "250"],
  ])("accepts a %s value of %s", (measure, value) => {
    const params = new URLSearchParams();
    params.set("growth.measure", measure);
    params.set("growth.direction", "atMost");
    params.set("growth.value", value);
    expect(decodeResearchQuery(params).sentences).toEqual({
      growth: { measure, direction: "atMost", value },
    });
  });

  it("keeps a valid sentence when another factor's is invalid", () => {
    expect(
      decode(
        "value.measure=percentile&value.direction=atLeast&value.value=101&momentum.measure=percentile&momentum.direction=atMost&momentum.value=30",
      ).sentences,
    ).toEqual({ momentum: { measure: "percentile", direction: "atMost", value: "30" } });
  });

  it("preserves values as the strings given", () => {
    const decoded = decode("value.measure=percentile&value.direction=atLeast&value.value=80.0");
    expect(decoded.sentences.value?.value).toBe("80.0");
    expect(encodeResearchQuery(decoded).get("value.value")).toBe("80.0");
    expect(toListParams(decoded)).toEqual({ valuePercentileMin: "80.0" });
  });

  it("drops an unknown sort, drops an order with no sort, and falls back to asc", () => {
    expect(decode("sort=bogus").sort).toBeNull();
    expect(decode("sort=bogus&order=desc").sort).toBeNull();
    expect(decode("order=desc")).toEqual(DEFAULT_RESEARCH_QUERY);
    expect(decode("sort=value_score&order=bogus").sort).toEqual({
      key: "value_score",
      order: "asc",
    });
    expect(decode("sort=value_score").sort).toEqual({ key: "value_score", order: "asc" });
    expect(decode("sort=value_score&order=desc").sort).toEqual({
      key: "value_score",
      order: "desc",
    });
  });

  it("writes order only when descending", () => {
    expect(encodeResearchQuery(query({ sort: { key: "symbol", order: "asc" } })).toString()).toBe(
      "sort=symbol",
    );
    expect(encodeResearchQuery(query({ sort: { key: "symbol", order: "desc" } })).toString()).toBe(
      "sort=symbol&order=desc",
    );
  });

  it("validates and upper-cases the symbol", () => {
    expect(decode("symbol=1!").symbol).toBeNull();
    expect(decode("symbol=").symbol).toBeNull();
    expect(decode("symbol=ABCDEFGHIJKLMNOPQ").symbol).toBeNull();
    expect(decode("symbol=aa").symbol).toBe("AA");
    expect(decode("symbol=a").symbol).toBe("A");
    expect(decode("symbol=brk.b").symbol).toBe("BRK.B");
    expect(decode("symbol=ABCDEFGHIJKLMNOP").symbol).toBe("ABCDEFGHIJKLMNOP");
  });

  it("reads only the literal true as hide incomplete", () => {
    expect(decode("hide_incomplete=true").hideIncomplete).toBe(true);
    expect(decode("hide_incomplete=false").hideIncomplete).toBe(false);
    expect(decode("hide_incomplete=1").hideIncomplete).toBe(false);
    expect(decode("hide_incomplete=TRUE").hideIncomplete).toBe(false);
    expect(encodeResearchQuery(query({ hideIncomplete: true })).toString()).toBe(
      "hide_incomplete=true",
    );
  });

  it("uses the first value of a repeated key", () => {
    expect(decode("symbol=AA&symbol=BB").symbol).toBe("AA");
    expect(decode("scope=u1&scope=u2").scope).toBe("u1");
    expect(
      decode(
        "value.measure=percentile&value.measure=standardisedScore&value.direction=atLeast&value.direction=atMost&value.value=10&value.value=90",
      ).sentences,
    ).toEqual({ value: { measure: "percentile", direction: "atLeast", value: "10" } });
    expect(
      decode(
        "growth.measure=standardisedScore&growth.measure=percentile&growth.direction=atMost&growth.direction=atLeast&growth.value=1.5&growth.value=50",
      ).sentences,
    ).toEqual({ growth: { measure: "standardisedScore", direction: "atMost", value: "1.5" } });
    expect(decode("sort=symbol&sort=value_score").sort).toEqual({ key: "symbol", order: "asc" });
    expect(decode("sort=symbol&order=desc&order=asc").sort).toEqual({
      key: "symbol",
      order: "desc",
    });
    expect(decode("sort=symbol&order=asc&order=desc").sort).toEqual({
      key: "symbol",
      order: "asc",
    });
    expect(decode("hide_incomplete=false&hide_incomplete=true").hideIncomplete).toBe(false);
    expect(decode("hide_incomplete=true&hide_incomplete=false").hideIncomplete).toBe(true);
  });

  it("removes every factor's sentence keys when the new query omits its sentence", () => {
    const all = encodeResearchQuery(
      query({
        sentences: {
          value: { measure: "percentile", direction: "atLeast", value: "10" },
          growth: { measure: "standardisedScore", direction: "atMost", value: "1.5" },
          momentum: { measure: "percentile", direction: "atLeast", value: "50" },
        },
      }),
    );
    all.set("tab", "history");
    const cleared = applyResearchQuery(all, DEFAULT_RESEARCH_QUERY);
    expect(cleared.toString()).toBe("tab=history");
    for (const factor of ["value", "growth", "momentum"] as const) {
      const kept = applyResearchQuery(
        all,
        query({ sentences: { [factor]: decodeResearchQuery(all).sentences[factor] } }),
      );
      for (const other of ["value", "growth", "momentum"].filter((name) => name !== factor)) {
        for (const suffix of ["measure", "direction", "value"]) {
          expect(kept.has(`${other}.${suffix}`), `${other}.${suffix} after keeping ${factor}`).toBe(
            false,
          );
        }
      }
      expect(Object.keys(decodeResearchQuery(kept).sentences)).toEqual([factor]);
    }
  });

  it("sends only what is set, as the list read names it", () => {
    expect(
      toListParams(
        query({
          scope: "u1",
          sentences: { growth: { measure: "standardisedScore", direction: "atMost", value: "1" } },
          hideIncomplete: true,
          symbol: "AA",
          sort: { key: "growth_score", order: "desc" },
        }),
      ),
    ).toEqual({
      universeId: "u1",
      growthScoreMax: "1",
      hideIncomplete: true,
      symbol: "AA",
      sort: "growth_score",
      order: "desc",
    });
    expect(toListParams(query({ sort: { key: "symbol", order: "asc" } }))).toEqual({
      sort: "symbol",
      order: "asc",
    });
  });

  it("adds the paging fields when given", () => {
    expect(toListParams(DEFAULT_RESEARCH_QUERY, { limit: 50, cursor: "c1" })).toEqual({
      limit: 50,
      cursor: "c1",
    });
    expect(toListParams(DEFAULT_RESEARCH_QUERY, { limit: 50 })).toEqual({ limit: 50 });
    expect(toListParams(DEFAULT_RESEARCH_QUERY, {})).toEqual({});
  });

  it("decodes every key of the API sort allowlist and nothing else", () => {
    for (const key of SORT_ALLOWLIST) {
      expect(decode(`sort=${key}`).sort).toEqual({ key, order: "asc" });
    }
    for (const key of ["name", "value", "value_rank", "SYMBOL", "symbol_score"]) {
      expect(decode(`sort=${key}`).sort).toBeNull();
    }
  });
});
