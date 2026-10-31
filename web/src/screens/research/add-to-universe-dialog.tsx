import { type FormEvent, type JSX, useEffect, useId, useRef, useState } from "react";
import {
  ClassificationApiError,
  addUniverseMembers,
  createUniverse,
  listUniverses,
} from "../../api/classification-client";
import type {
  ClassificationOperation,
  ClassificationResource,
  UniverseSummary,
} from "../../api/classification-types";
import { DIALOGS, FILTERS, failureSentence } from "./copy";
import { DialogFrame } from "./dialog-frame";
import { type Notice, universePath } from "./notices";

/** The `select` value of *New universe*; a universe id is never empty. */
const NEW_UNIVERSE = "";

/** The one box the select and its loading skeleton share, so the field does not shift on load. */
const FIELD_BOX = "rounded border border-input bg-background px-2 py-1";

type ListState =
  | { kind: "loading" }
  | { kind: "loaded"; universes: UniverseSummary[] }
  | { kind: "failed"; sentence: string };

/** The STD-UI-19 sentence of a failed call, from its code alone; a transport failure has none. */
function sentenceFor(
  caught: unknown,
  operation: ClassificationOperation,
  resource: ClassificationResource,
): string {
  return caught instanceof ClassificationApiError
    ? failureSentence(caught)
    : failureSentence({ operation, resource, code: null });
}

/**
 * The tray's **Add to universe…** `dialog` `standard` (DAC-E4-S8-5, AC-4,
 * AC-5; classification-ui section 2.7; UX design 1.1; DEC-0076, DEC-0168,
 * DEC-0169), rendered by its host while open: CAP-002-E4-S9 mounts it behind
 * the tray's `onAddToUniverse` (DEC-0163) and owns the notices.
 *
 * On open it reads the active universes once, at the API's largest page of
 * 500 with no paging (DEC-0169), showing a `status` skeleton in the select's
 * box meanwhile. The select lists them in the API's order, then *New
 * universe*, which reveals a Name field; the first universe is chosen, or
 * *New universe* when none exists. **Add** posts the checked symbols to the
 * chosen universe, or creates one by hand from them. Success calls `onNotify`
 * once and then `onClose`; a request that completes after the dialog closed
 * still notifies, since the stocks were added, but never closes the host's
 * next dialog. The symbols are those the dialog opened with.
 *
 * Built on the CAP-002-E4-S1 and S2 exports `listUniverses`,
 * `addUniverseMembers`, `createUniverse` (by-hand shape `{ name, symbols }`),
 * `ClassificationApiError`, `failureSentence`, `DIALOGS.addTitle`,
 * `DIALOGS.newUniverseOption`, `DIALOGS.add`, `DIALOGS.added`, `DIALOGS.cancel`,
 * `DIALOGS.name` and `FILTERS.loadingUniverses`; `DIALOGS.enterName` and
 * `DIALOGS.universe` were added by this story (T011).
 */
export function AddToUniverseDialog({
  symbols,
  onClose,
  onNotify,
}: {
  symbols: string[];
  onClose: () => void;
  onNotify: (notice: Notice) => void;
}): JSX.Element {
  const [opened] = useState(symbols);
  const selectId = useId();
  const nameId = useId();
  const fieldErrorId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(false);
  // Set by the effect, so StrictMode's remount marks it mounted again.
  const mountedRef = useRef(false);
  const [list, setList] = useState<ListState>({ kind: "loading" });
  const [choice, setChoice] = useState(NEW_UNIVERSE);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    listUniverses({ lifecycle: "active", limit: 500 }).then(
      (page) => {
        if (!cancelled) {
          setChoice(page.universes[0]?.universeId ?? NEW_UNIVERSE);
          setList({ kind: "loaded", universes: page.universes });
        }
      },
      (caught: unknown) => {
        if (!cancelled) {
          setList({ kind: "failed", sentence: sentenceFor(caught, "list-universes", "universe") });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = list.kind === "loaded";
  const isNew = choice === NEW_UNIVERSE;

  // Initial focus is the select, or the Name field when there is no universe
  // (DEC-0169); until the list arrives it rests on Cancel, and it moves only
  // if the owner has not moved it meanwhile.
  // biome-ignore lint/correctness/useExhaustiveDependencies: focus moves once, when the list arrives, never on a later choice.
  useEffect(() => {
    if (loaded && document.activeElement === cancelRef.current) {
      (isNew ? nameRef : selectRef).current?.focus();
    }
  }, [loaded]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pendingRef.current || list.kind !== "loaded") {
      return;
    }
    const trimmed = name.trim();
    if (isNew && trimmed === "") {
      setFieldError(DIALOGS.enterName);
      nameRef.current?.focus();
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setAlert(null);
    const operation: ClassificationOperation = isNew ? "create-universe" : "add-universe-members";
    try {
      let notice: Notice;
      if (isNew) {
        const universe = await createUniverse({ name: trimmed, symbols: opened });
        notice = {
          message: DIALOGS.added(universe.memberCount, universe.name, 0),
          to: universePath(universe.universeId),
        };
      } else {
        const target = list.universes.find((universe) => universe.universeId === choice);
        const result = await addUniverseMembers(choice, opened);
        notice = {
          message: DIALOGS.added(
            result.added.length,
            target?.name ?? "",
            result.alreadyMember.length,
          ),
          to: universePath(choice),
        };
      }
      onNotify(notice);
      if (mountedRef.current) {
        onClose();
      }
    } catch (caught) {
      // A failure reaching a dialog closed meanwhile lands on an unmounted
      // instance, whose state setters React drops.
      pendingRef.current = false;
      setPending(false);
      if (caught instanceof ClassificationApiError && caught.code === "universe_name_in_use") {
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
        setAlert(sentenceFor(caught, operation, isNew ? "universe" : "universe-member"));
      }
    }
  }

  const unavailable = pending || list.kind !== "loaded";

  return (
    <DialogFrame
      title={DIALOGS.addTitle(opened.length)}
      initialFocusRef={cancelRef}
      onCancel={onClose}
      busy={pending}
    >
      <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-3">
        {list.kind === "failed" ? (
          <p role="alert" className="text-status-critical text-sm">
            {list.sentence}
          </p>
        ) : (
          <>
            {/* One label node for both states, so the select replaces the
                skeleton beside it and nothing else moves. */}
            <label htmlFor={selectId} className="text-sm">
              {DIALOGS.universe}
            </label>
            {list.kind === "loaded" ? (
              <select
                ref={selectRef}
                id={selectId}
                data-variant="default"
                value={choice}
                onChange={(event) => {
                  // The choice a pending request was sent for stays shown, so
                  // its refusal lands on the field it concerns.
                  if (!pendingRef.current) {
                    setChoice(event.target.value);
                    setFieldError(null);
                  }
                }}
                className={FIELD_BOX}
              >
                {list.universes.map((universe) => (
                  <option key={universe.universeId} value={universe.universeId}>
                    {universe.name}
                  </option>
                ))}
                <option value={NEW_UNIVERSE}>{DIALOGS.newUniverseOption}</option>
              </select>
            ) : (
              <output id={selectId} className={`${FIELD_BOX} animate-pulse text-muted-foreground`}>
                {FILTERS.loadingUniverses}
              </output>
            )}
          </>
        )}
        {loaded && isNew ? (
          <>
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
          </>
        ) : null}
        {alert !== null ? (
          <p role="alert" className="text-status-critical text-sm">
            {alert}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="rounded border border-border px-3 py-2 text-base"
          >
            {DIALOGS.cancel}
          </button>
          <button
            type="submit"
            aria-disabled={unavailable ? "true" : undefined}
            className="rounded bg-foreground px-3 py-2 text-background"
          >
            {DIALOGS.add}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}
