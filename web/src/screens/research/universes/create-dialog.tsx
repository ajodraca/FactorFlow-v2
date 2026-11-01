import {
  type ClipboardEvent,
  type FormEvent,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, createUniverse } from "../../../api/classification-client";
import { type ParsedSymbol, parseBulkSymbols } from "../../instruments/parse-bulk-symbols";
import { DIALOGS, SHELL_ROUTES, UNIVERSES, failureSentence } from "../copy";

/** UX 1.3 Token Usage: field and summary errors are drawn in --destructive. */
const DESTRUCTIVE = { color: "hsl(var(--destructive))" } as const;

/** `MAX_SYMBOLS_PER_REQUEST` of classification-api section 2.4. */
const MAX_SYMBOLS = 1000;

type Failure =
  | { kind: "not-followed"; symbols: string[] }
  | { kind: "name-in-use"; name: string }
  | { kind: "name-required" }
  | { kind: "generic" };

/** Why **Create** is `blocked`, or `null` when it is not (DAC-E1-S7-1; DEC-0104). */
function blockedReason(recognised: number): string | null {
  if (recognised === 0) {
    return UNIVERSES.enterAtLeastOne;
  }
  return recognised > MAX_SYMBOLS ? UNIVERSES.tooMany : null;
}

/** `sentence` with its `phrase` rendered as a link to `to`; the words stay verbatim (DEC-0254). */
export function withLink(sentence: string, phrase: string, to: string): ReactNode {
  const at = sentence.indexOf(phrase);
  if (at < 0) {
    return sentence;
  }
  return (
    <>
      {sentence.slice(0, at)}
      <Link to={to} className="underline">
        {phrase}
      </Link>
      {sentence.slice(at + phrase.length)}
    </>
  );
}

/**
 * The *New universe* dialog (UX design 1.3; classification-ui 2.7; AC-1,
 * AC-5, DAC-E1-S7-1 to DAC-E1-S7-3).
 *
 * Built on the delivered `retire-dialog.tsx`: a native `<dialog open>` with
 * its own Tab cycle and Escape, restoring focus to whatever opened it when it
 * unmounts, but with initial focus on the Name field. The Stocks field parses
 * with CAP-001's `parseBulkSymbols` on paste and on blur, never per
 * keystroke. **Create** is `blocked`, focusable and described by its reason
 * while the recognised entries number zero or more than 1000, counted as
 * parsed (DEC-0104); the request sends the distinct symbols. Failures render
 * by `code` through `copy.ts`, never the envelope's `message`.
 */
export function CreateDialog({
  onCreated,
  onCancel,
}: {
  onCreated: (universeId: string) => void;
  onCancel: () => void;
}): JSX.Element {
  const titleId = useId();
  const nameId = useId();
  const nameErrorId = useId();
  const stocksId = useId();
  const counterId = useId();
  const blockedId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedSymbol[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    nameRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  const recognised = parsed?.filter((entry) => entry.valid) ?? [];
  const rejected = parsed?.filter((entry) => !entry.valid) ?? [];
  const blocked = blockedReason(recognised.length);

  // After a failed attempt focus goes where the error is: the Name field for
  // its own errors, otherwise back to Create, which was disabled in flight.
  useEffect(() => {
    if (failure === null) {
      return;
    }
    const target =
      failure.kind === "name-in-use" || failure.kind === "name-required" ? nameRef : createRef;
    target.current?.focus();
  }, [failure]);

  function showParse(text: string): void {
    const entries = parseBulkSymbols(text);
    setParsed(entries.length === 0 ? null : entries);
  }

  function handleBlur(): void {
    const rewritten = parseBulkSymbols(raw)
      .map((entry) => entry.normalised)
      .join("\n");
    setRaw(rewritten);
    showParse(rewritten);
  }

  /** Parses the text the paste produces, read from the event, so no keystroke ever parses. */
  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>): void {
    const field = event.currentTarget;
    const text = event.clipboardData.getData("text");
    showParse(
      field.value.slice(0, field.selectionStart) + text + field.value.slice(field.selectionEnd),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting) {
      return;
    }
    // Re-parse the current text, so a preview older than the field cannot send.
    const entries = parseBulkSymbols(raw);
    showParse(raw);
    const valid = entries.filter((entry) => entry.valid);
    if (blockedReason(valid.length) !== null) {
      return;
    }
    const trimmed = name.trim();
    if (trimmed === "") {
      setFailure({ kind: "name-required" });
      return;
    }
    setFailure(null);
    setSubmitting(true);
    try {
      const universe = await createUniverse({
        name: trimmed,
        symbols: Array.from(new Set(valid.map((entry) => entry.normalised))),
      });
      onCreated(universe.universeId);
    } catch (caught) {
      const code = caught instanceof ClassificationApiError ? caught.code : null;
      if (
        code === "instrument_not_acquired" &&
        caught instanceof ClassificationApiError &&
        caught.symbols.length > 0
      ) {
        setFailure({ kind: "not-followed", symbols: caught.symbols });
      } else if (code === "universe_name_in_use") {
        setFailure({ kind: "name-in-use", name: trimmed });
      } else {
        setFailure({ kind: "generic" });
      }
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!submitting) {
        onCancel();
      }
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    // Manual focus trap, as `retire-dialog.tsx`: `<dialog open>` gives none.
    const first = nameRef.current;
    const last = createRef.current;
    if (first === null || last === null) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const nameError =
    failure?.kind === "name-in-use"
      ? UNIVERSES.nameInUse(failure.name)
      : failure?.kind === "name-required"
        ? UNIVERSES.nameRequired
        : null;
  const operation = { operation: "create-universe", resource: "universe" } as const;

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      data-variant="standard"
      // UX 1.3 Token Usage: the dialog is drawn in --popover.
      style={{
        backgroundColor: "hsl(var(--popover))",
        color: "hsl(var(--popover-foreground))",
      }}
      className="fixed inset-0 m-auto flex flex-col gap-3 rounded border border-border p-5 text-base"
    >
      <h2 id={titleId} className="text-lg">
        {UNIVERSES.newUniverseTitle}
      </h2>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-3"
      >
        {failure?.kind === "not-followed" ? (
          <p role="alert" aria-live="assertive" style={DESTRUCTIVE}>
            {withLink(
              failureSentence({
                ...operation,
                code: "instrument_not_acquired",
                symbols: failure.symbols,
              }),
              UNIVERSES.followThemLink,
              SHELL_ROUTES.followedStocks,
            )}
          </p>
        ) : null}
        {failure?.kind === "generic" ? (
          <p role="alert" aria-live="assertive" style={DESTRUCTIVE}>
            {failureSentence({ ...operation, code: null })}
          </p>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor={nameId}>{DIALOGS.name}</label>
          <input
            ref={nameRef}
            id={nameId}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              // A Name error describes the name it was raised for; editing clears it.
              if (nameError !== null) {
                setFailure(null);
              }
            }}
            aria-invalid={nameError === null ? undefined : true}
            aria-describedby={nameError === null ? undefined : nameErrorId}
            className="rounded border border-input p-2"
          />
          {nameError === null ? null : (
            <p id={nameErrorId} className="text-sm" style={DESTRUCTIVE}>
              {nameError}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={stocksId}>{UNIVERSES.stocksToInclude}</label>
          <textarea
            id={stocksId}
            data-variant="list"
            rows={4}
            value={raw}
            placeholder={UNIVERSES.stocksPlaceholder}
            onChange={(event) => setRaw(event.target.value)}
            onPaste={handlePaste}
            onBlur={handleBlur}
            aria-describedby={parsed === null ? undefined : counterId}
            className="rounded border border-input p-2"
          />
          <div id={counterId} aria-live="polite" className="flex flex-col gap-1 text-sm">
            {parsed === null ? null : (
              <>
                <p>{UNIVERSES.recognised(recognised.length, rejected.length)}</p>
                {rejected.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {rejected.map((entry, index) => (
                      <li key={`${entry.input}-${index}`} className="flex items-center gap-1">
                        <span aria-hidden="true" className="text-status-warning">
                          ▲
                        </span>
                        {UNIVERSES.invalidSymbol(entry.input)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {blocked === null ? null : (
            <p id={blockedId} className="text-sm text-muted-foreground">
              {blocked}
            </p>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded border border-border px-3 py-2"
          >
            {DIALOGS.cancel}
          </button>
          <button
            ref={createRef}
            type="submit"
            data-variant={blocked === null ? "default" : "blocked"}
            aria-describedby={blocked === null ? undefined : blockedId}
            // Never a bare `disabled` while blocked: the reason must stay reachable
            // (button `blocked` contract). In flight it is natively disabled.
            tabIndex={0}
            disabled={submitting}
            className="rounded bg-foreground px-3 py-2 text-background data-[variant=blocked]:border data-[variant=blocked]:border-border data-[variant=blocked]:bg-transparent data-[variant=blocked]:text-muted-foreground"
          >
            {UNIVERSES.create}
          </button>
        </div>
      </form>
    </dialog>
  );
}
