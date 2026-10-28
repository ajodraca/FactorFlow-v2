/**
 * The Research filter, held in the URL query and nowhere else
 * (classification-ui section 2.4; S03 §5, S03-5; DAC-E4-3; DEC-0148).
 *
 * A pure, round-trippable codec between `URLSearchParams` and a
 * `ResearchQuery`, and the one mapping from the query to the list read's
 * parameters and to the filter a universe is saved from. Each threshold
 * sentence becomes exactly one of the twelve bounds the API already accepts:
 * the filter model is "a mapping, not a model" (classification-api section
 * 2.4). An invalid key is dropped on decode, never repaired and never sent.
 */

import type {
  ClassificationListParams,
  ClassificationSort,
  FactorName,
  ThresholdBounds,
  Thresholds,
} from "./classification-types";

export type Measure = "percentile" | "standardisedScore";
export type Direction = "atLeast" | "atMost";

/** One factor's *[measure] [direction] [value]* sentence; `value` stays the string given. */
export interface ThresholdSentence {
  measure: Measure;
  direction: Direction;
  value: string;
}

export type SortKey = ClassificationSort;
export type Order = "asc" | "desc";

export interface ResearchQuery {
  /** `null` is all followed stocks; otherwise a universe id. */
  scope: string | null;
  sentences: Partial<Record<FactorName, ThresholdSentence>>;
  hideIncomplete: boolean;
  /** The *Find a stock* prefix, upper-cased; `null` when no search is active. */
  symbol: string | null;
  /** `null` is unsorted, the API's default order. */
  sort: { key: SortKey; order: Order } | null;
}

/** All followed stocks, no sentence, nothing hidden, no search, unsorted. */
export const DEFAULT_RESEARCH_QUERY: ResearchQuery = {
  scope: null,
  sentences: {},
  hideIncomplete: false,
  symbol: null,
  sort: null,
};

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** The API's sort allowlist (classification-api section 2.4). */
const SORT_KEYS: readonly SortKey[] = [
  "symbol",
  "value_score",
  "value_percentile",
  "growth_score",
  "growth_percentile",
  "momentum_score",
  "momentum_percentile",
];

export type BoundKey = keyof ThresholdBounds;

/** The one table from a sentence to its bound: four pairs per factor, twelve in all. */
const BOUNDS: Record<FactorName, Record<Measure, Record<Direction, BoundKey>>> = {
  value: {
    percentile: { atLeast: "valuePercentileMin", atMost: "valuePercentileMax" },
    standardisedScore: { atLeast: "valueScoreMin", atMost: "valueScoreMax" },
  },
  growth: {
    percentile: { atLeast: "growthPercentileMin", atMost: "growthPercentileMax" },
    standardisedScore: { atLeast: "growthScoreMin", atMost: "growthScoreMax" },
  },
  momentum: {
    percentile: { atLeast: "momentumPercentileMin", atMost: "momentumPercentileMax" },
    standardisedScore: { atLeast: "momentumScoreMin", atMost: "momentumScoreMax" },
  },
};

const PLAIN_DECIMAL = /^[+-]?\d+(\.\d+)?$/;
const SYMBOL = /^[A-Z][A-Z0-9.-]{0,15}$/;

function sentenceKeys(factor: FactorName): [string, string, string] {
  return [`${factor}.measure`, `${factor}.direction`, `${factor}.value`];
}

const OWNED_KEYS: readonly string[] = [
  "scope",
  ...FACTORS.flatMap(sentenceKeys),
  "hide_incomplete",
  "symbol",
  "sort",
  "order",
];

function isMeasure(value: string | null): value is Measure {
  return value === "percentile" || value === "standardisedScore";
}

function isDirection(value: string | null): value is Direction {
  return value === "atLeast" || value === "atMost";
}

function isSortKey(value: string | null): value is SortKey {
  return SORT_KEYS.some((key) => key === value);
}

/** Percentile 0 to 100 inclusive; standardised score any finite plain decimal (API 2.4). */
function isValidValue(measure: Measure, value: string): boolean {
  if (!PLAIN_DECIMAL.test(value)) {
    return false;
  }
  return measure === "standardisedScore" || (Number(value) >= 0 && Number(value) <= 100);
}

function decodeSentence(params: URLSearchParams, factor: FactorName): ThresholdSentence | null {
  const [measureKey, directionKey, valueKey] = sentenceKeys(factor);
  const measure = params.get(measureKey);
  const direction = params.get(directionKey);
  const value = params.get(valueKey);
  if (!isMeasure(measure) || !isDirection(direction) || value === null) {
    return null;
  }
  return isValidValue(measure, value) ? { measure, direction, value } : null;
}

/**
 * Reads the codec's keys from `params` and ignores every other key; a key
 * repeated is read at its first value (DAC-E4-S2-1).
 */
export function decodeResearchQuery(params: URLSearchParams): ResearchQuery {
  const sentences: Partial<Record<FactorName, ThresholdSentence>> = {};
  for (const factor of FACTORS) {
    const sentence = decodeSentence(params, factor);
    if (sentence !== null) {
      sentences[factor] = sentence;
    }
  }
  const scope = params.get("scope");
  const symbol = params.get("symbol")?.toUpperCase() ?? null;
  const sort = params.get("sort");
  return {
    scope: scope === null || scope === "all" ? null : scope,
    sentences,
    hideIncomplete: params.get("hide_incomplete") === "true",
    symbol: symbol !== null && SYMBOL.test(symbol) ? symbol : null,
    sort: isSortKey(sort)
      ? { key: sort, order: params.get("order") === "desc" ? "desc" : "asc" }
      : null,
  };
}

/**
 * A copy of `params` with the codec's keys rewritten from `query` and every
 * other key kept; no default is ever written (DAC-E4-3).
 */
export function applyResearchQuery(params: URLSearchParams, query: ResearchQuery): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of OWNED_KEYS) {
    next.delete(key);
  }
  if (query.scope !== null) {
    next.set("scope", query.scope);
  }
  for (const factor of FACTORS) {
    const sentence = query.sentences[factor];
    if (sentence !== undefined) {
      const [measureKey, directionKey, valueKey] = sentenceKeys(factor);
      next.set(measureKey, sentence.measure);
      next.set(directionKey, sentence.direction);
      next.set(valueKey, sentence.value);
    }
  }
  if (query.hideIncomplete) {
    next.set("hide_incomplete", "true");
  }
  if (query.symbol !== null) {
    next.set("symbol", query.symbol);
  }
  if (query.sort !== null) {
    next.set("sort", query.sort.key);
    if (query.sort.order === "desc") {
      next.set("order", "desc");
    }
  }
  return next;
}

/** The query as a fresh URL query: the empty string for the default (DAC-E4-S2-1). */
export function encodeResearchQuery(query: ResearchQuery): URLSearchParams {
  return applyResearchQuery(new URLSearchParams(), query);
}

/** The one bound a sentence sets, and its value (DAC-E4-S2-1). */
export function sentenceToBound(
  factor: FactorName,
  sentence: ThresholdSentence,
): [BoundKey, string] {
  return [BOUNDS[factor][sentence.measure][sentence.direction], sentence.value];
}

function boundsOf(query: ResearchQuery): ThresholdBounds {
  const bounds: ThresholdBounds = {};
  for (const factor of FACTORS) {
    const sentence = query.sentences[factor];
    if (sentence !== undefined) {
      const [key, value] = sentenceToBound(factor, sentence);
      bounds[key] = value;
    }
  }
  return bounds;
}

/**
 * The filter a universe is saved from: the bounds set, `hideIncomplete` and
 * `symbol` (`null` with no search), never the scope or sort (DAC-E4-S2-2;
 * DEC-0085).
 */
export function toThresholds(query: ResearchQuery): Thresholds {
  return { ...boundsOf(query), hideIncomplete: query.hideIncomplete, symbol: query.symbol };
}

/**
 * The list read's parameters: the same filter as `toThresholds` with the
 * API's defaults left out, plus the scope, the sort and the paging when given
 * (DAC-E4-3; owner-directed fix E4-F11).
 */
export function toListParams(
  query: ResearchQuery,
  paging?: { limit?: number; cursor?: string },
): ClassificationListParams {
  const params: ClassificationListParams = boundsOf(query);
  if (query.hideIncomplete) {
    params.hideIncomplete = true;
  }
  if (query.symbol !== null) {
    params.symbol = query.symbol;
  }
  if (query.scope !== null) {
    params.universeId = query.scope;
  }
  if (query.sort !== null) {
    params.sort = query.sort.key;
    params.order = query.sort.order;
  }
  if (paging?.limit !== undefined) {
    params.limit = paging.limit;
  }
  if (paging?.cursor !== undefined) {
    params.cursor = paging.cursor;
  }
  return params;
}
