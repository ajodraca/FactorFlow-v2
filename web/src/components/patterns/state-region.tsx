import type { JSX, ReactNode } from "react";
import type { ScreenState } from "../../api/types";
import { Button } from "../ui/button";

/**
 * Renders a data-bearing region's `ScreenState` through one entry per kind
 * (component design 2.7; DAC-E1-10; AC-24; STD-UI-23). The caller's map names,
 * for each kind, either a renderer or `{ notApplicable: "reason" }`, so a call
 * that omits a kind without saying why does not type-check. `empty-never-populated`
 * and `empty-no-match` dispatch to their own entries and are never conflated.
 *
 * `unreachable` is the shell's: it replaces the main region (AC-23), so the map
 * accepts only a reason for it and `StateRegion` renders nothing. A kind whose
 * entry is `notApplicable` and which arrives anyway renders nothing; the reason
 * is a record, never display copy.
 *
 * Provisional contract (DEC-0313, DEC-0314): the caller's `error` renderer
 * supplies the whole three-part sentence; it is wrapped in a polite status
 * region with **Try again** outside it, wired to `onRetry`. `loading` is the
 * caller's skeleton marked busy. `StateRegion` never reads `requestId` or any
 * other field of the state, and every visible string except **Try again** is
 * the caller's.
 */

export interface NotApplicable {
  readonly notApplicable: string;
}

export type StateKind = ScreenState<unknown>["kind"];

export type StateRenderer<T, K extends StateKind> =
  | ((state: Extract<ScreenState<T>, { kind: K }>) => ReactNode)
  | NotApplicable;

export type StateRenderers<T> = {
  readonly [K in Exclude<StateKind, "unreachable">]: StateRenderer<T, K>;
} & { readonly unreachable: NotApplicable };

export interface StateRegionProps<T> {
  state: ScreenState<T>;
  renderers: StateRenderers<T>;
  onRetry: () => void;
}

function renderEntry<S>(entry: ((state: S) => ReactNode) | NotApplicable, state: S): ReactNode {
  return typeof entry === "function" ? entry(state) : null;
}

export function StateRegion<T>({
  state,
  renderers,
  onRetry,
}: StateRegionProps<T>): JSX.Element | null {
  switch (state.kind) {
    case "loading":
      return <div aria-busy="true">{renderEntry(renderers.loading, state)}</div>;
    case "empty-never-populated":
      return <>{renderEntry(renderers["empty-never-populated"], state)}</>;
    case "empty-no-match":
      return <>{renderEntry(renderers["empty-no-match"], state)}</>;
    case "populated":
      return <>{renderEntry(renderers.populated, state)}</>;
    case "partial":
      return <>{renderEntry(renderers.partial, state)}</>;
    case "unavailable":
      return <>{renderEntry(renderers.unavailable, state)}</>;
    case "error": {
      const entry = renderers.error;
      if (typeof entry !== "function") return null;
      return (
        <div className="flex flex-col gap-2">
          <output>{entry(state)}</output>
          <Button type="button" variant="outline" className="w-fit" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );
    }
    case "unreachable":
      return null;
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
