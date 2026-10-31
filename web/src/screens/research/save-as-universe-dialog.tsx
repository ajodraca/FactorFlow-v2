import { type FormEvent, type JSX, useEffect, useId, useRef, useState } from "react";
import { ClassificationApiError, createUniverse } from "../../api/classification-client";
import { type ResearchQuery, toThresholds } from "../../api/research-query";
import { DIALOGS, RESULTS, describeQuery, failureSentence } from "./copy";
import { ConfirmProgress, DialogFrame } from "./dialog-frame";
import { type Notice, universePath } from "./notices";

/**
 * **Save these {n} as a universe…** and its `dialog` `standard` (AC-2, AC-5,
 * DAC-E4-5, DAC-E4-S8-1 to DAC-E4-S8-4; classification-ui section 2.7; UX
 * design 1.1; DEC-0076, DEC-0085, DEC-0167, DEC-0168).
 *
 * Contract CAP-002-E4-S9 relies on: it passes the results header's
 * `matchCount`, the on-screen `setId` (`null` while no set is shown) and
 * `incompleteCount` only when every matching row is loaded, else `null`
 * (STD-UI-15: the *including* clause is omitted rather than guessed). The
 * control renders nothing under a universe scope: the save carries the
 * filter, not the scope. The dialog reads these props when it opens and keeps
 * that snapshot, so the title and the request always agree. A dialog open
 * when the scope becomes a universe closes then, unless a save is pending: it
 * stays until the result is known (DEC-0259).
 *
 * Built on the CAP-002-E4-S1 and S2 exports: `createUniverse` in its
 * from-a-result shape `{ name, filter, setId }` with `filter` the one
 * `toThresholds(query)` object the list read used, `ClassificationApiError`,
 * and from `copy.ts` `RESULTS.saveThese`, `RESULTS.nothingToSave`,
 * `DIALOGS.saveTitle`, `DIALOGS.includingIncomplete`, `describeQuery`,
 * `DIALOGS.save`, `DIALOGS.cancel`, `DIALOGS.name`, `DIALOGS.reviewNewResult`,
 * `DIALOGS.saved` and `failureSentence` (which yields `DIALOGS.setChanged`
 * and the `universe_name_in_use` sentence). The empty-name error
 * `DIALOGS.enterName` was added by this story (T011): `copy.ts` held no
 * empty-name key yet (DEC-0169).
 */
export function SaveAsUniverse({
  query,
  matchCount,
  setId,
  incompleteCount,
  onNotify,
}: {
  query: ResearchQuery;
  matchCount: number;
  setId: string | null;
  incompleteCount: number | null;
  onNotify: (notice: Notice) => void;
}): JSX.Element | null {
  const reasonId = useId();
  const [opened, setOpened] = useState<Snapshot | null>(null);

  const scopeLeft = query.scope !== null;
  const blocked = matchCount === 0 || setId === null;

  // The dialog is outside the control's row, so it keeps its place in the tree
  // (and a pending request) when the control goes under a universe scope.
  return (
    <>
      {scopeLeft ? null : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-variant={blocked ? "blocked" : "outline"}
            aria-disabled={blocked ? "true" : undefined}
            aria-describedby={blocked ? reasonId : undefined}
            onClick={() => {
              // `blocked`, never `disabled`: it stays focusable so its reason is
              // reached (button design spec, `blocked`).
              if (!blocked) {
                setOpened({ query, matchCount, setId, incompleteCount });
              }
            }}
            className="w-fit rounded border border-input px-3 py-2 text-base data-[variant=blocked]:text-muted-foreground"
          >
            {RESULTS.saveThese(matchCount)}
          </button>
          {blocked ? (
            <span id={reasonId} className="text-muted-foreground text-sm">
              {RESULTS.nothingToSave}
            </span>
          ) : null}
        </div>
      )}
      {opened !== null ? (
        <SaveDialog
          snapshot={opened}
          scopeLeft={scopeLeft}
          onClose={() => setOpened(null)}
          onNotify={onNotify}
        />
      ) : null}
    </>
  );
}

/** The confirm action: `--primary` on `--primary-foreground` (button spec section 6; DEC-0257). */
const CONFIRM =
  "inline-flex items-center gap-2 rounded bg-[hsl(var(--primary))] px-3 py-2 text-[hsl(var(--primary-foreground))]";

/** The props as they were when the dialog opened; `setId` is never null once open. */
interface Snapshot {
  query: ResearchQuery;
  matchCount: number;
  setId: string;
  incompleteCount: number | null;
}

function SaveDialog({
  snapshot,
  scopeLeft,
  onClose,
  onNotify,
}: {
  snapshot: Snapshot;
  scopeLeft: boolean;
  onClose: () => void;
  onNotify: (notice: Notice) => void;
}): JSX.Element {
  const { query, matchCount, setId, incompleteCount } = snapshot;
  const nameId = useId();
  const fieldErrorId = useId();
  const descriptionId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(false);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [pending, setPending] = useState(false);

  // Closes for good when the scope becomes a universe, so the dialog never
  // reappears with an old snapshot when the scope returns; a pending save
  // keeps it open until its result is known (DEC-0259).
  // biome-ignore lint/correctness/useExhaustiveDependencies: closes on the scope change only, never on a later render.
  useEffect(() => {
    if (scopeLeft && !pendingRef.current) {
      onClose();
    }
  }, [scopeLeft]);

  /** Cancel, Escape and the overlay: never while a save is pending (DEC-0259). */
  function cancel(): void {
    if (!pendingRef.current) {
      onClose();
    }
  }

  const filterWords = describeQuery(query);
  const lines = [
    ...(incompleteCount !== null && incompleteCount > 0
      ? [DIALOGS.includingIncomplete(matchCount, incompleteCount)]
      : []),
    ...(filterWords === "" ? [] : [filterWords]),
  ];

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pendingRef.current || conflict) {
      return;
    }
    const trimmed = name.trim();
    if (trimmed === "") {
      setFieldError(DIALOGS.enterName);
      nameRef.current?.focus();
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setAlert(null);
    try {
      const saved = await createUniverse({ name: trimmed, filter: toThresholds(query), setId });
      // Nothing in the dialog closes it while the save is pending, so the
      // result lands on this instance; if the host unmounts the control
      // meanwhile, the notice still reaches it and the close is a no-op.
      onNotify({
        message: DIALOGS.saved(saved.memberCount, saved.name),
        to: universePath(saved.universeId),
      });
      onClose();
    } catch (caught) {
      pendingRef.current = false;
      setPending(false);
      if (!(caught instanceof ClassificationApiError)) {
        setAlert(
          failureSentence({ operation: "create-universe", resource: "universe", code: null }),
        );
      } else if (caught.code === "universe_name_in_use") {
        setFieldError(
          failureSentence({
            operation: caught.operation,
            resource: caught.resource,
            code: caught.code,
            universeName: trimmed,
          }),
        );
        nameRef.current?.focus();
      } else {
        setConflict(caught.code === "classification_set_changed");
        setAlert(failureSentence(caught));
      }
    }
  }

  return (
    <DialogFrame
      title={DIALOGS.saveTitle(matchCount)}
      initialFocusRef={nameRef}
      onCancel={cancel}
      busy={pending}
      descriptionId={lines.length > 0 ? descriptionId : undefined}
    >
      <div id={descriptionId}>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-3">
        <label htmlFor={nameId} className="text-sm">
          {DIALOGS.name}
        </label>
        <input
          ref={nameRef}
          id={nameId}
          type="text"
          value={name}
          aria-invalid={fieldError !== null ? "true" : undefined}
          aria-describedby={fieldError !== null ? fieldErrorId : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setFieldError(null);
          }}
          // `--destructive` border while in error (form spec section 6; DEC-0257).
          className="rounded border border-input p-2 aria-[invalid=true]:border-[hsl(var(--destructive))]"
        />
        {fieldError !== null ? (
          <p id={fieldErrorId} className="text-[hsl(var(--destructive))] text-sm">
            {fieldError}
          </p>
        ) : null}
        {alert !== null ? (
          <p role="alert" className="text-[hsl(var(--destructive))] text-sm">
            {alert}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            aria-disabled={pending ? "true" : undefined}
            onClick={cancel}
            // Visibly unavailable while a request is pending (button spec section 4).
            className="rounded border border-input px-3 py-2 text-base aria-disabled:text-muted-foreground"
          >
            {DIALOGS.cancel}
          </button>
          {/* One `button` in one place, unkeyed: React keeps the DOM node when
              Review new result replaces Save, so focus stays on it and never
              falls out of the dialog (pinned by the conflict focus test). */}
          {conflict ? (
            <button type="button" onClick={onClose} className={CONFIRM}>
              {DIALOGS.reviewNewResult}
            </button>
          ) : (
            <button
              type="submit"
              aria-disabled={pending ? "true" : undefined}
              aria-busy={pending ? "true" : undefined}
              data-pending={pending ? "true" : undefined}
              className={CONFIRM}
            >
              <ConfirmProgress pending={pending} />
              {DIALOGS.save}
            </button>
          )}
        </div>
      </form>
    </DialogFrame>
  );
}
