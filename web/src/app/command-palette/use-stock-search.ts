import { useEffect, useState } from "react";
import { requestJson } from "../../api/client";

export const STOCK_SEARCH_DEBOUNCE_MS = 250;
export const STOCK_SEARCH_LIMIT = 8;

export type StockSearchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; symbols: readonly string[]; more: boolean }
  | { kind: "error"; error: unknown };

/**
 * The palette's stock search (DAC-E3-S5-1, DAC-E3-11; command-palette 5): one
 * `GET /api/instruments` for the text that has settled, with a request still in
 * flight aborted the moment the text changes, clears or the palette closes, so
 * a stale answer never overwrites a newer one.
 *
 * It calls `requestJson` rather than the delivered `listInstruments`, because
 * `listInstruments` forwards no `signal` and so cannot be aborted (Resolved
 * Conflict 1). The request is byte-identical to the one it sends.
 */
export function useStockSearch(text: string): StockSearchState {
  const [state, setState] = useState<StockSearchState>({ kind: "idle" });

  useEffect(() => {
    const prefix = text.trim();
    if (prefix === "") {
      setState({ kind: "idle" });
      return;
    }
    setState({ kind: "loading" });
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const query = new URLSearchParams({
        symbol: prefix,
        lifecycle: "active",
        limit: String(STOCK_SEARCH_LIMIT),
      });
      requestJson<{ instruments: { symbol: string }[]; next_cursor: string | null }>(
        `/api/instruments?${query}`,
        { signal: controller.signal },
      )
        .then((body) => {
          if (controller.signal.aborted) return;
          setState({
            kind: "ok",
            symbols: body.instruments.map((row) => row.symbol),
            more: body.next_cursor !== null,
          });
        })
        .catch((error: unknown) => {
          // An aborted request reaches here as ApiUnreachableError, because
          // requestJson wraps every transport rejection.
          if (controller.signal.aborted) return;
          setState({ kind: "error", error });
        });
    }, STOCK_SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  return state;
}
