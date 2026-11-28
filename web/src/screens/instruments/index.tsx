import { type JSX, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, getHistoryDepth, listInstruments } from "../../api/client";
import type { ScreenState } from "../../api/types";
import { StateRegion, type StateRenderers } from "../../components/patterns/state-region";
import { AddField } from "./add-field";
import { BulkAdd } from "./bulk-add";
import { InstrumentTable } from "./instrument-table";
import { StartAction } from "./start-action";

type Read = { everPopulated: boolean };

/**
 * The state kinds the screen's own read never reaches, each with the reason
 * (AC-24): the read carries no filter, so nothing is "no match" here; a stock
 * is followed or it is not; no check runs on this screen (UX design 1.6
 * States); the shell replaces the main region when the API does not answer.
 */
const NOT_REACHED = {
  "empty-no-match": {
    notApplicable: "the screen's read carries no filter; the table renders nothing-found",
  },
  partial: { notApplicable: "a stock is followed or it is not (UX 1.6 States)" },
  unavailable: { notApplicable: "no check runs on this screen (UX 1.6 States)" },
  unreachable: { notApplicable: "the shell replaces the main region (AC-23)" },
} as const;

/**
 * The Followed stocks screen at `/data/followed` (owner-web-app 2.1, 2.3, 2.4;
 * UX design 1.6), composing the add field and Follow-many region with the
 * table and rendering the `ScreenState` variants through `StateRegion`
 * (AC-24).
 *
 * Opened with router state `{ focusAdd: true }`, as Data health's *Follow a
 * different symbol* does, the add field takes focus once (DAC-E7-6). The hint
 * is then replaced in the history entry, because the browser keeps router state
 * in `window.history.state` and a reload would otherwise re-focus.
 */
export default function InstrumentsScreen(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusAddRequested] = useState(
    () => (location.state as { focusAdd?: boolean } | null)?.focusAdd === true,
  );
  const [screenState, setScreenState] = useState<ScreenState<Read>>({ kind: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [historyDepthYears, setHistoryDepthYears] = useState<number | null>(null);

  // The hint is consumed once, on mount: a later `location` is the cleared one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    if (focusAddRequested) {
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      );
    }
  }, []);

  useEffect(() => {
    getHistoryDepth()
      .then((depth) => setHistoryDepthYears(depth.years))
      .catch(() => {
        // The download action's own blocked reason degrades to "unset" on a
        // failed read rather than surfacing a second error region on this
        // screen: Settings is where that failure is reported in full.
        setHistoryDepthYears(null);
      });
  }, []);

  // reloadToken below is a deliberate re-fetch trigger (bumped after a follow
  // or a stop), not a value read inside the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;
    listInstruments({})
      .then((page) => {
        if (cancelled) {
          return;
        }
        const everPopulated = page.activeCount + page.retiredCount > 0;
        setScreenState(
          everPopulated
            ? { kind: "populated", data: { everPopulated }, fetchedAt: new Date().toISOString() }
            : { kind: "empty-never-populated" },
        );
      })
      .catch((cause: unknown) => {
        if (cancelled) {
          return;
        }
        setScreenState({
          kind: "error",
          message: cause instanceof Error ? cause.message : "the request could not be completed",
          requestId: cause instanceof ApiError ? cause.requestId : "unknown",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const neverPopulated = screenState.kind === "empty-never-populated";
  const refresh = (): void => setReloadToken((token) => token + 1);

  const renderers: StateRenderers<Read> = {
    ...NOT_REACHED,
    loading: () => <p>Loading followed stocks…</p>,
    "empty-never-populated": () => <p>No stocks followed yet.</p>,
    populated: () => <InstrumentTable refreshToken={reloadToken} />,
    error: (failed) => <p>Couldn't read followed stocks: {failed.message}.</p>,
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">Followed stocks</h1>

      <StartAction historyDepthYears={historyDepthYears} />

      {screenState.kind === "loading" || screenState.kind === "unreachable" ? null : (
        <div className="flex flex-wrap items-start gap-5" data-testid="instruments-add-region">
          <AddField focusOnMount={neverPopulated || focusAddRequested} onAdded={refresh} />
          <BulkAdd onAdded={refresh} />
        </div>
      )}

      <StateRegion state={screenState} renderers={renderers} onRetry={refresh} />
    </div>
  );
}
