import { type FormEvent, type JSX, useEffect, useId, useRef, useState } from "react";
import { ClassificationApiError, createUniverse } from "../../api/classification-client";
import { type ResearchQuery, toThresholds } from "../../api/research-query";
import { DIALOGS, RESULTS, describeQuery, failureSentence } from "./copy";
import { DialogFrame } from "./dialog-frame";
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
 * that snapshot, so the title and the request always agree.
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

  if (query.scope !== null) {
    // A dialog open when the scope became a universe closes for good, so it
    // never reappears with an old snapshot when the scope returns.
    if (opened !== null) {
      setOpened(null);
    }
    return null;
  }
  const blocked = matchCount === 0 || setId === null;

  return (
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
        className="w-fit rounded border border-border px-3 py-2 text-base data-[variant=blocked]:text-muted-foreground"
      >
        {RESULTS.saveThese(matchCount)}
      </button>
      {blocked ? (
        <span id={reasonId} className="text-muted-foreground text-sm">
          {RESULTS.nothingToSave}
        </span>
      ) : null}
      {opened !== null ? (
        <SaveDialog snapshot={opened} onClose={() => setOpened(null)} onNotify={onNotify} />
      ) : null}
    </div>
  );
}

/** The props as they were when the dialog opened; `setId` is never null once open. */
interface Snapshot {
  query: ResearchQuery;
  matchCount: number;
  setId: string;
  incompleteCount: number | null;
}

function SaveDialog({
  snapshot,
  onClose,
  onNotify,
}: {
  snapshot: Snapshot;
  onClose: () => void;
  onNotify: (notice: Notice) => void;
}): JSX.Element {
  const { query, matchCount, setId, incompleteCount } = snapshot;
  const nameId = useId();
  const fieldErrorId = useId();
  const descriptionId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(false);
  // Set by the effect, so StrictMode's remount marks it mounted again.
  const mountedRef = useRef(false);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      // The universe exists whether or not the dialog is still open, so the
      // owner is told; a dialog closed meanwhile is not closed a second time.
      onNotify({
        message: DIALOGS.saved(saved.memberCount, saved.name),
        to: universePath(saved.universeId),
      });
      if (mountedRef.current) {
        onClose();
      }
    } catch (caught) {
      // A failure reaching a dialog closed meanwhile lands on an unmounted
      // instance, whose state setters React drops; a reopened dialog is a new
      // instance and never sees it.
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
      onCancel={onClose}
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
          className="rounded border border-input p-2"
        />
        {fieldError !== null ? (
          <p id={fieldErrorId} className="text-status-critical text-sm">
            {fieldError}
          </p>
        ) : null}
        {alert !== null ? (
          <p role="alert" className="text-status-critical text-sm">
            {alert}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-3 py-2 text-base"
          >
            {DIALOGS.cancel}
          </button>
          {/* One `button` in one place, unkeyed: React keeps the DOM node when
              Review new result replaces Save, so focus stays on it and never
              falls out of the dialog (pinned by the conflict focus test). */}
          {conflict ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-foreground px-3 py-2 text-background"
            >
              {DIALOGS.reviewNewResult}
            </button>
          ) : (
            <button
              type="submit"
              aria-disabled={pending ? "true" : undefined}
              className="rounded bg-foreground px-3 py-2 text-background"
            >
              {DIALOGS.save}
            </button>
          )}
        </div>
      </form>
    </DialogFrame>
  );
}
