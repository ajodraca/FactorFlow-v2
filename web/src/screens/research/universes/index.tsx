import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassificationApiError, listUniverses } from "../../../api/classification-client";
import type { UniverseSummary } from "../../../api/classification-types";
import { ApiError, ApiUnreachableError } from "../../../api/client";
import type { ScreenState } from "../../../api/types";
import { RESULTS, UNIVERSES, UNIVERSE_LIFECYCLE, failureSentence } from "../copy";
import { CreateDialog, withLink } from "./create-dialog";
import { UniverseTable, universeDetailPath } from "./universe-table";

/** `MAX_PAGE_SIZE` of the API (classification-api section 2.4; DEC-0101). */
const PAGE_SIZE = 500;

type LifecycleFilter = "active" | "retired" | "all";

const LIFECYCLE_LABELS: Record<LifecycleFilter, string> = {
  active: UNIVERSES.lifecycleActive,
  retired: UNIVERSE_LIFECYCLE.retiredLabel,
  all: UNIVERSES.lifecycleAll,
};

interface UniverseListData {
  universes: UniverseSummary[];
  activeCount: number;
  retiredCount: number;
}

/** Every page of `GET /api/universes` for the selection, at the API maximum (DEC-0101). */
async function readAllUniverses(lifecycle: LifecycleFilter): Promise<UniverseListData> {
  const universes: UniverseSummary[] = [];
  let page = await listUniverses({ lifecycle, limit: PAGE_SIZE });
  universes.push(...page.universes);
  while (page.nextCursor !== null) {
    page = await listUniverses({ lifecycle, limit: PAGE_SIZE, cursor: page.nextCursor });
    universes.push(...page.universes);
  }
  // The counts are the whole collection's, the same on every page; the last page's are current.
  return { universes, activeCount: page.activeCount, retiredCount: page.retiredCount };
}

/**
 * The Universes screen (UX design 1.3; classification-ui 2.7; AC-1, AC-3,
 * AC-5), mirroring the delivered `instruments/index.tsx`: one `card` whose
 * header keeps the title, the counts, the lifecycle select and **New
 * universe…** in every state. Never populated (no universe at all) and
 * nothing found (the selection matches none; DEC-0103) are distinct states.
 * The one write is the create dialog; there is no delete (STD-UI-2).
 * `unreachable` renders nothing: the shell owns that state.
 */
export default function UniversesScreen(): JSX.Element | null {
  const navigate = useNavigate();
  const [lifecycle, setLifecycle] = useState<LifecycleFilter>("active");
  const [reloadToken, setReloadToken] = useState(0);
  const [screenState, setScreenState] = useState<ScreenState<UniverseListData>>({
    kind: "loading",
  });
  const [counts, setCounts] = useState<{ active: number; retired: number } | null>(null);
  const [creating, setCreating] = useState(false);
  // The rows the table last showed, kept dimmed while a new selection loads
  // (data-table section 4); null when there is no table to keep.
  const [shownRows, setShownRows] = useState<UniverseSummary[] | null>(null);
  const newUniverseRef = useRef<HTMLButtonElement>(null);
  const lifecycleRef = useRef<HTMLSelectElement>(null);

  // reloadToken is a deliberate re-read trigger (Try again), not a value read here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    let cancelled = false;
    setScreenState({ kind: "loading" });
    readAllUniverses(lifecycle)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setCounts({ active: data.activeCount, retired: data.retiredCount });
        if (data.universes.length > 0) {
          setShownRows(data.universes);
          setScreenState({ kind: "populated", data, fetchedAt: new Date().toISOString() });
        } else if (data.activeCount + data.retiredCount === 0) {
          setShownRows(null);
          setScreenState({ kind: "empty-never-populated" });
        } else {
          setShownRows([]);
          setScreenState({ kind: "empty-no-match" });
        }
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }
        if (caught instanceof ApiUnreachableError) {
          setScreenState({ kind: "unreachable" });
          return;
        }
        setShownRows([]);
        setScreenState({
          kind: "error",
          message: failureSentence({
            operation: "list-universes",
            resource: "universe",
            code: caught instanceof ClassificationApiError ? caught.code : null,
          }),
          requestId: caught instanceof ApiError ? caught.requestId : "unknown",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [lifecycle, reloadToken]);

  useEffect(() => {
    if (screenState.kind === "empty-never-populated") {
      newUniverseRef.current?.focus();
    }
  }, [screenState.kind]);

  if (screenState.kind === "unreachable") {
    return null;
  }

  // The reset and Try again controls unmount when activated; focus moves to
  // the lifecycle select, which every state keeps (STD-UI-24; DEC-0256).
  function reselect(next: LifecycleFilter): void {
    setLifecycle(next);
    lifecycleRef.current?.focus();
  }

  function retry(): void {
    setReloadToken((token) => token + 1);
    lifecycleRef.current?.focus();
  }

  // The nothing-found and error states replace the table's body and keep its
  // header row (DEC-0255; data-table sections 3 and 4; UX 1.3 States).
  let tableBody: JSX.Element | undefined;
  if (screenState.kind === "error") {
    tableBody = (
      <div
        role="alert"
        className="flex flex-col gap-2"
        style={{ color: "hsl(var(--destructive))" }}
      >
        <p>{screenState.message}</p>
        <button
          type="button"
          onClick={retry}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          {RESULTS.tryAgain}
        </button>
      </div>
    );
  } else if (screenState.kind === "empty-no-match") {
    tableBody = (
      <div className="flex flex-col gap-2">
        <p>{lifecycle === "retired" ? UNIVERSE_LIFECYCLE.noRetired : UNIVERSES.noActive}</p>
        <button
          type="button"
          onClick={() => reselect(lifecycle === "retired" ? "active" : "all")}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          {UNIVERSES.resetFilter}
        </button>
      </div>
    );
  }
  const tableRows = screenState.kind === "populated" ? screenState.data.universes : shownRows;

  return (
    <section className="flex flex-col gap-4 rounded border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-lg">{UNIVERSES.title}</h1>
        {counts === null ? null : (
          <p className="text-muted-foreground">
            {UNIVERSE_LIFECYCLE.counts(counts.active, counts.retired)}
          </p>
        )}
        <select
          ref={lifecycleRef}
          aria-label={UNIVERSES.showLifecycle(LIFECYCLE_LABELS[lifecycle])}
          data-variant="inline"
          value={lifecycle}
          onChange={(event) => setLifecycle(event.target.value as LifecycleFilter)}
          className="rounded border border-input px-2 py-1"
        >
          {(Object.keys(LIFECYCLE_LABELS) as LifecycleFilter[]).map((option) => (
            <option key={option} value={option}>
              {LIFECYCLE_LABELS[option]}
            </option>
          ))}
        </select>
        <button
          ref={newUniverseRef}
          type="button"
          data-variant="default"
          onClick={() => setCreating(true)}
          style={{
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
          className="ml-auto rounded px-3 py-2"
        >
          {UNIVERSES.newUniverseAction}
        </button>
      </div>

      {screenState.kind === "loading" ? <p aria-live="polite">{UNIVERSES.loading}</p> : null}

      {screenState.kind === "empty-never-populated" ? (
        <p>{withLink(UNIVERSES.noUniversesYet, UNIVERSES.researchLink, "/research")}</p>
      ) : null}

      {tableRows === null ? null : (
        <UniverseTable
          universes={tableRows}
          body={tableBody}
          busy={screenState.kind === "loading"}
        />
      )}

      {creating ? (
        <CreateDialog
          onCreated={(universeId) => {
            setCreating(false);
            navigate(universeDetailPath(universeId));
          }}
          onCancel={() => setCreating(false)}
        />
      ) : null}
    </section>
  );
}
