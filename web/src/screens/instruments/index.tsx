import { type JSX, useEffect, useState } from "react";
import { ApiError, getHistoryDepth, listInstruments } from "../../api/client";
import type { ScreenState } from "../../api/types";
import { AddField } from "./add-field";
import { BulkAdd } from "./bulk-add";
import { InstrumentTable } from "./instrument-table";
import { StartAction } from "./start-action";

/**
 * The Instruments screen (component design section 2.5; ux-design section
 * 1.2), composing the toolbar's add field and Add-many region with the
 * instrument table, and implementing the `ScreenState<T>` variants
 * component design section 2.4 specifies for this screen (T023).
 *
 * `unreachable` renders nothing here: the shell already substitutes its own
 * designed state into the main region on every route when the API does not
 * answer at all (DAC-E1-15), so this screen would otherwise duplicate that
 * substitution rather than adding information.
 */
export default function InstrumentsScreen(): JSX.Element {
  const [screenState, setScreenState] = useState<ScreenState<{ everPopulated: boolean }>>({
    kind: "loading",
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [historyDepthYears, setHistoryDepthYears] = useState<number | null>(null);

  useEffect(() => {
    getHistoryDepth()
      .then((depth) => setHistoryDepthYears(depth.years))
      .catch(() => {
        // The Start action's own blocked reason degrades to "unset" on a
        // failed read rather than surfacing a second error region on this
        // screen — depth's own screen (Settings) is where that failure is
        // reported in full.
        setHistoryDepthYears(null);
      });
  }, []);

  // reloadToken below is a deliberate re-fetch trigger (bumped after
  // add/retire), not a value read inside the effect body.
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

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl">Instruments</h1>

      <StartAction historyDepthYears={historyDepthYears} />

      {screenState.kind === "loading" ? <p aria-live="polite">Loading…</p> : null}

      {screenState.kind === "error" ? (
        <div role="alert" className="flex flex-col gap-2 text-status-critical">
          <p>
            Loading instruments failed: {screenState.message} (request {screenState.requestId})
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      ) : null}

      {screenState.kind === "loading" || screenState.kind === "unreachable" ? null : (
        <>
          <div className="flex flex-wrap items-start gap-5" data-testid="instruments-add-region">
            <AddField
              focusOnMount={neverPopulated}
              onAdded={() => setReloadToken((token) => token + 1)}
            />
            <BulkAdd onAdded={() => setReloadToken((token) => token + 1)} />
          </div>

          {neverPopulated ? <p>No instruments named yet.</p> : null}

          {screenState.kind === "populated" ? <InstrumentTable refreshToken={reloadToken} /> : null}
        </>
      )}
    </div>
  );
}
