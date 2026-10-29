import { type JSX, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { ClassificationApiError, listUniverses } from "../../api/classification-client";
import type { FactorName, UniverseSummary } from "../../api/classification-types";
import {
  DEFAULT_RESEARCH_QUERY,
  type ThresholdSentence as Sentence,
  decodeResearchQuery,
} from "../../api/research-query";
import { FILTERS, REGIONS, UNIVERSES, failureSentence } from "./copy";
import { ThresholdSentence } from "./threshold-sentence";
import { useResearchQuery } from "./use-research-query";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];
const ALL_FOLLOWED = "";

export interface FiltersPaneProps {
  /** `false` on universe detail: no *Look in*, and `scope` is neither read as a filter nor written. */
  showLookIn?: boolean;
  /** The followed-stock count for *All followed stocks · {n}*; `null` while unknown. */
  activeInstruments?: number | null;
  /** Rendered above **Clear filters**: universe detail's *Members as of* slot. */
  children?: ReactNode;
}

/** The S2 symbol rule, taken from the codec so the pane and the URL cannot drift. */
function symbolAccepted(raw: string): boolean {
  return decodeResearchQuery(new URLSearchParams({ symbol: raw })).symbol !== null;
}

function universesFailure(cause: unknown): string {
  return cause instanceof ClassificationApiError
    ? failureSentence(cause)
    : failureSentence({ operation: "list-universes", resource: "universe", code: null });
}

/**
 * The Research screen's Filters pane (UX design 1.1; classification-ui 2.5;
 * DEC-0156): *Find a stock*, *Look in*, one threshold sentence per factor,
 * *Hide stocks with an incomplete score* and **Clear filters**. The pane is
 * controlled by the URL through `useResearchQuery`: every change is one
 * `setQuery`, hence one URL write and one list request by the host that keys
 * its request on the query (DAC-E4-S5-2, DAC-E4-3). It never fetches the list
 * and never reads an error's `message`. **Clear filters** resets every filter,
 * keeps the sort and moves focus to *Find a stock* (DAC-E4-S5-3; DEC-0157).
 * It is itself the `section` labelled *Filters*, so a host mounts it unwrapped.
 */
export function FiltersPane({
  showLookIn = true,
  activeInstruments = null,
  children,
}: FiltersPaneProps): JSX.Element {
  const { query, setQuery } = useResearchQuery();
  const [universes, setUniverses] = useState<UniverseSummary[]>([]);
  const [universesError, setUniversesError] = useState<string | null>(null);
  const [symbolDraft, setSymbolDraft] = useState(query.symbol ?? "");
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const findStockRef = useRef<HTMLInputElement>(null);
  const findStockId = useId();
  const symbolErrorId = useId();
  const lookInId = useId();
  const universesErrorId = useId();
  const hideIncompleteId = useId();
  const hideIncompleteHelperId = useId();

  useEffect(() => {
    if (!showLookIn) {
      return;
    }
    let cancelled = false;
    listUniverses({ lifecycle: "active" })
      .then((list) => {
        if (!cancelled) {
          setUniverses(list.universes);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setUniversesError(universesFailure(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showLookIn]);

  const symbol = query.symbol;
  useEffect(() => {
    setSymbolDraft(symbol ?? "");
    setSymbolError(null);
  }, [symbol]);

  function commitSymbol(raw: string): void {
    if (raw === "") {
      setSymbolError(null);
      setQuery({ ...query, symbol: null });
      return;
    }
    if (!symbolAccepted(raw)) {
      setSymbolError(UNIVERSES.invalidSymbol(raw));
      return;
    }
    setSymbolError(null);
    setQuery({ ...query, symbol: raw.toUpperCase() });
  }

  function commitSentence(factor: FactorName, next: Sentence | null): void {
    const sentences = { ...query.sentences };
    if (next === null) {
      delete sentences[factor];
    } else {
      sentences[factor] = next;
    }
    setQuery({ ...query, sentences });
  }

  function clearFilters(): void {
    setSymbolDraft("");
    setSymbolError(null);
    setQuery({
      ...DEFAULT_RESEARCH_QUERY,
      sort: query.sort,
      scope: showLookIn ? null : query.scope,
    });
    findStockRef.current?.focus();
  }

  const scope = query.scope;
  const scopeListed = scope === null || universes.some((universe) => universe.universeId === scope);
  const lookInLabel =
    scope === null
      ? FILTERS.allFollowedStocks
      : (universes.find((universe) => universe.universeId === scope)?.name ??
        FILTERS.unavailableUniverse);
  const filterActive =
    Object.keys(query.sentences).length > 0 ||
    query.symbol !== null ||
    query.hideIncomplete ||
    (showLookIn && scope !== null);
  const partClass = "flex flex-col gap-2 py-3";

  return (
    <section aria-label={REGIONS.filters} className="flex flex-col divide-y divide-border">
      <h2 className="pb-3 text-lg">{FILTERS.heading}</h2>

      <div className={partClass}>
        <label htmlFor={findStockId} className="text-sm">
          {FILTERS.findStock}
        </label>
        <input
          id={findStockId}
          ref={findStockRef}
          type="text"
          placeholder={FILTERS.findStockPlaceholder}
          value={symbolDraft}
          aria-invalid={symbolError !== null ? "true" : undefined}
          aria-describedby={symbolError !== null ? symbolErrorId : undefined}
          onChange={(event) => setSymbolDraft(event.target.value)}
          onBlur={() => commitSymbol(symbolDraft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitSymbol(symbolDraft);
            } else if (event.key === "Escape") {
              setSymbolDraft("");
              commitSymbol("");
            }
          }}
          className="rounded border border-input p-2 font-numeric"
        />
        {symbolError !== null ? (
          <p
            id={symbolErrorId}
            role="alert"
            className="text-sm"
            style={{ color: "hsl(var(--destructive))" }}
          >
            {symbolError}
          </p>
        ) : null}
      </div>

      {showLookIn ? (
        <div className={partClass}>
          <label htmlFor={lookInId} className="text-sm">
            {FILTERS.lookIn}
          </label>
          <select
            id={lookInId}
            data-variant="inline"
            aria-label={FILTERS.lookInName(lookInLabel)}
            aria-describedby={universesError !== null ? universesErrorId : undefined}
            value={scope ?? ALL_FOLLOWED}
            onChange={(event) =>
              setQuery({
                ...query,
                scope: event.target.value === ALL_FOLLOWED ? null : event.target.value,
              })
            }
            className="rounded border border-input bg-background px-2 py-1"
          >
            <option value={ALL_FOLLOWED}>
              {activeInstruments === null
                ? FILTERS.allFollowedStocks
                : FILTERS.allFollowedStocksOption(activeInstruments)}
            </option>
            {universes.map((universe) => (
              <option key={universe.universeId} value={universe.universeId}>
                {universe.name}
              </option>
            ))}
            {scopeListed ? null : <option value={scope}>{FILTERS.unavailableUniverse}</option>}
          </select>
          {universesError !== null ? (
            <p
              id={universesErrorId}
              role="alert"
              className="text-sm"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {universesError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={partClass}>
        {FACTORS.map((factor) => (
          <ThresholdSentence
            key={factor}
            factor={factor}
            value={query.sentences[factor]}
            onCommit={(next) => commitSentence(factor, next)}
          />
        ))}
        <p className="text-muted-foreground text-xs">{FILTERS.percentileHelper}</p>
      </div>

      <div className={partClass}>
        <label htmlFor={hideIncompleteId} className="flex items-center gap-2 text-sm">
          <input
            id={hideIncompleteId}
            type="checkbox"
            checked={query.hideIncomplete}
            aria-describedby={hideIncompleteHelperId}
            onChange={(event) => setQuery({ ...query, hideIncomplete: event.target.checked })}
          />
          {FILTERS.hideIncomplete}
        </label>
        <p id={hideIncompleteHelperId} className="text-muted-foreground text-xs">
          {FILTERS.hideIncompleteHelper}
        </p>
      </div>

      {children}

      {filterActive ? (
        <div className={partClass}>
          <button type="button" onClick={clearFilters} className="w-fit rounded px-3 py-2 text-sm">
            {FILTERS.clearFilters}
          </button>
        </div>
      ) : null}
    </section>
  );
}
