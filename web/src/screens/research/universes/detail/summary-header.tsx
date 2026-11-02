import {
  type FormEvent,
  type JSX,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ClassificationApiError } from "../../../../api/classification-client";
import type { UniverseDetail, UniverseOrigin } from "../../../../api/classification-types";
import {
  DIALOGS,
  UNIVERSES,
  UNIVERSE_DETAIL,
  UNIVERSE_LIFECYCLE,
  failureSentence,
} from "../../copy";
import { formatTimestamp } from "../../format";
import { describeOrigin } from "../universe-table";

/** What the header reads from the universe read (`GET /api/universes/{id}`). */
export type HeaderUniverse = Pick<
  UniverseDetail,
  "name" | "lifecycle" | "createdAt" | "retiredAt" | "memberCount" | "origin"
>;

const BUTTON = "rounded px-3 py-2 text-sm";
const DESTRUCTIVE = "text-[hsl(var(--destructive))] text-sm";

/**
 * The universe read's `origin` as `describeOrigin`'s parameter, the stored
 * `filter_provenance` spelling (DEC-0108): `null` for a universe made by hand,
 * otherwise the provenance with its thresholds keyed by query-parameter name,
 * as both sides already key them (DEC-0144).
 */
export function originToProvenance(origin: UniverseOrigin): Parameters<typeof describeOrigin>[0] {
  if (origin.kind === "by_hand" || origin.classificationDate === null) {
    return null;
  }
  return {
    classification_date: origin.classificationDate,
    thresholds: origin.thresholds ?? {},
    hide_incomplete: origin.hideIncomplete === true,
    symbol: origin.symbol,
  };
}

/** The rename field's error for a refusal, selected by code (DEC-0109; classification-ui 2.7). */
function renameErrorFor(caught: unknown, submitted: string): string {
  const code = caught instanceof ClassificationApiError ? caught.code : null;
  if (code === "universe_name_in_use") {
    return UNIVERSES.nameInUse(submitted);
  }
  if (code === "universe_retired") {
    return UNIVERSE_LIFECYCLE.retiredRefusal;
  }
  return failureSentence({ operation: "rename-universe", resource: "universe", code: null });
}

/** The `secondary` *Retired* badge: text and a hollow square, never colour alone (STD-UI-8). */
function RetiredBadge(): JSX.Element {
  return (
    <span
      data-variant="secondary"
      className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        <rect
          x="1"
          y="1"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      {UNIVERSE_LIFECYCLE.retiredLabel}
    </span>
  );
}

export interface SummaryHeaderProps {
  universe: HeaderUniverse;
  /** Sends the rename; rejects with the client error, whose code selects the field error. */
  onRename: (name: string) => Promise<void>;
  onAddStocks: () => void;
  onRetire: () => void;
}

/**
 * A universe's summary header, the `card` `summary` (UX design 1.4;
 * classification-ui 2.7; DAC-E1-S9-1, DAC-E1-S9-4, AC-4, AC-6). The name is
 * the page's only `h1`. On an active universe it is a control that opens the
 * inline rename (`form` `inline`, one field named *Universe name*, its value
 * selected, and **Rename** while editing): `Enter` or **Rename** sends the
 * trimmed name, an empty one is a field error and the unchanged one closes
 * without a request (DEC-0109); `Escape` closes and restores the name. A
 * refusal keeps the field open with its error by code. Beneath, a description
 * list of Lifecycle, Members, Created and Origin; the actions **Add stocks…**
 * and **Retire…** sit right. A retired universe shows a plain `h1`, the
 * *Retired* badge with its time and the retired sentence, and no action.
 */
export function SummaryHeader({
  universe,
  onRename,
  onAddStocks,
  onRetire,
}: SummaryHeaderProps): JSX.Element {
  const headingId = useId();
  const errorId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const opened = useRef(false);

  const retired = universe.lifecycle === "retired";
  // A universe retired while its name was being edited offers no rename.
  const editing = open && !retired;

  // Opening moves focus into the field with the name selected; closing
  // returns it to the name control, which mounts again in the same commit, or
  // to the heading when the universe was retired meanwhile and has none.
  useEffect(() => {
    if (editing) {
      opened.current = true;
      fieldRef.current?.focus();
      fieldRef.current?.select();
    } else if (opened.current) {
      (nameRef.current ?? headingRef.current)?.focus();
    }
  }, [editing]);

  // Rename is natively disabled while pending, and a browser drops focus from
  // a control it disables: focus moves to the field, so Escape still reaches
  // the form.
  useEffect(() => {
    if (pending && document.activeElement !== fieldRef.current) {
      fieldRef.current?.focus();
    }
  }, [pending]);

  function startEditing(): void {
    setValue(universe.name);
    setError(null);
    setOpen(true);
  }

  function stopEditing(): void {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed === "") {
      setError(DIALOGS.enterName);
      return;
    }
    if (trimmed === universe.name) {
      stopEditing();
      return;
    }
    setPending(true);
    try {
      await onRename(trimmed);
      setPending(false);
      stopEditing();
    } catch (caught) {
      setPending(false);
      setError(renameErrorFor(caught, trimmed));
    }
  }

  /** Escape cancels from anywhere in the form, but never while the rename is pending. */
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!pending) {
        stopEditing();
      }
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      data-variant="summary"
      className="flex flex-wrap items-start justify-between gap-4 rounded border border-border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-3">
        <h1
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className={editing ? "sr-only" : "text-xl"}
        >
          {retired || editing ? (
            universe.name
          ) : (
            <button ref={nameRef} type="button" onClick={startEditing} className="text-left">
              {universe.name}
            </button>
          )}
        </h1>
        {editing ? (
          <form
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            onKeyDown={handleKeyDown}
            data-variant="inline"
            className="flex flex-wrap items-start gap-2"
          >
            <div className="flex flex-col gap-1">
              <input
                ref={fieldRef}
                type="text"
                aria-label={UNIVERSE_DETAIL.universeName}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError(null);
                }}
                aria-invalid={error === null ? undefined : true}
                aria-describedby={error === null ? undefined : errorId}
                className="rounded border border-input p-2 text-xl"
              />
              {error === null ? null : (
                <p id={errorId} className={DESTRUCTIVE}>
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              data-variant="secondary"
              disabled={pending}
              className={`${BUTTON} bg-secondary text-secondary-foreground`}
            >
              {UNIVERSE_DETAIL.rename}
            </button>
          </form>
        ) : null}
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{UNIVERSE_DETAIL.lifecycle}</dt>
          <dd>
            {retired ? (
              <span className="inline-flex items-center gap-2">
                <RetiredBadge />
                {universe.retiredAt === null ? null : (
                  <span>{formatTimestamp(universe.retiredAt)}</span>
                )}
              </span>
            ) : (
              UNIVERSE_DETAIL.active
            )}
          </dd>
          <dt className="text-muted-foreground">{UNIVERSE_DETAIL.members}</dt>
          <dd className="font-numeric">{universe.memberCount}</dd>
          <dt className="text-muted-foreground">{UNIVERSE_DETAIL.created}</dt>
          <dd>{formatTimestamp(universe.createdAt)}</dd>
          <dt className="text-muted-foreground">{UNIVERSE_DETAIL.origin}</dt>
          <dd>{describeOrigin(originToProvenance(universe.origin))}</dd>
        </dl>
        {retired ? <p className="text-sm">{UNIVERSE_LIFECYCLE.retiredHeader}</p> : null}
      </div>
      {retired ? null : (
        <div className="flex gap-2">
          <button
            type="button"
            data-variant="default"
            onClick={onAddStocks}
            className={`${BUTTON} bg-primary text-primary-foreground`}
          >
            {UNIVERSE_DETAIL.addStocksAction}
          </button>
          <button
            type="button"
            data-variant="secondary"
            onClick={onRetire}
            className={`${BUTTON} bg-secondary text-secondary-foreground`}
          >
            {UNIVERSE_LIFECYCLE.retireAction}
          </button>
        </div>
      )}
    </section>
  );
}
