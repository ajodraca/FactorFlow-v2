import {
  type ClipboardEvent,
  type FormEvent,
  type JSX,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { AddMembersResult } from "../../../../api/classification-types";
import { type ParsedSymbol, parseBulkSymbols } from "../../../instruments/parse-bulk-symbols";
import {
  DIALOGS,
  SHELL_ROUTES,
  UNIVERSES,
  UNIVERSE_DETAIL,
  UNIVERSE_LIFECYCLE,
  failureSentence,
} from "../../copy";
import { ConfirmProgress, DialogFrame } from "../../dialog-frame";
import { withLink } from "../create-dialog";

/** `MAX_SYMBOLS_PER_REQUEST` of classification-api section 2.4. */
const MAX_SYMBOLS = 1000;

/** UX 1.4 Token Usage: field and dialog errors are drawn in --destructive. */
const DESTRUCTIVE = "text-[hsl(var(--destructive))] text-sm";

/** The refusals the dialog states by kind (classification-ui 2.7; DEC-0109). */
export type AddStocksError =
  | { kind: "instrument_not_acquired"; symbols: string[] }
  | { kind: "universe_retired" }
  | { kind: "generic" };

/** Why **Add** is `blocked`, or `null` when it is not (UX 1.4; DEC-0104). */
function blockedReason(recognised: number): string | null {
  if (recognised === 0) {
    return UNIVERSES.enterAtLeastOne;
  }
  return recognised > MAX_SYMBOLS ? UNIVERSES.tooMany : null;
}

/** The polite result sentence (DEC-0109): never an error, whatever was already a member. */
export function addResultSentence(result: AddMembersResult, universeName: string): string {
  return result.added.length === 0
    ? UNIVERSE_DETAIL.allAlreadyMembers(result.alreadyMember.length, universeName)
    : UNIVERSE_DETAIL.addedStocks(result.added.length, universeName, result.alreadyMember.length);
}

function ErrorAlert({ error }: { error: AddStocksError }): JSX.Element {
  switch (error.kind) {
    case "instrument_not_acquired":
      return (
        <p role="alert" className={DESTRUCTIVE}>
          {withLink(
            UNIVERSE_DETAIL.addNotFollowed(error.symbols.join(", ")),
            UNIVERSES.followThemLink,
            SHELL_ROUTES.followedStocks,
          )}
        </p>
      );
    case "universe_retired":
      return (
        <p role="alert" className={DESTRUCTIVE}>
          {UNIVERSE_LIFECYCLE.retiredRefusal}
        </p>
      );
    case "generic":
      return (
        <p role="alert" className={DESTRUCTIVE}>
          {failureSentence({
            operation: "add-universe-members",
            resource: "universe-member",
            code: null,
          })}
        </p>
      );
  }
}

export interface AddStocksDialogProps {
  universeName: string;
  error: AddStocksError | null;
  result: AddMembersResult | null;
  pending: boolean;
  /** Receives the distinct upper-case symbols, in the order entered. */
  onSubmit: (symbols: string[]) => void;
  onCancel: () => void;
}

/**
 * The *Add stocks to {name}* dialog (UX design 1.4; classification-ui 2.7;
 * DAC-E1-S9-2, DAC-E1-S9-3, DAC-E1-6). A `dialog` `standard` on the shared
 * `DialogFrame` (Escape, the Tab cycle and focus restored on unmount) with
 * the `textarea` `list` field alone, initially focused. The field parses with
 * CAP-001's `parseBulkSymbols` on paste and on blur, never per keystroke, as
 * the create dialog does, and is rewritten upper case one symbol per line on
 * blur. **Add** is `blocked`, focusable and described by its reason while the
 * recognised entries number zero or more than 1000, counted as parsed
 * (DEC-0104); `onSubmit` receives the distinct symbols. Refusals render by
 * kind through `copy.ts`, keeping the entered list; `result` renders the
 * polite sentence of DEC-0109, never an error. While `pending` **Add** is
 * natively disabled and shows its progress in place (dialog spec section 4).
 *
 * `onCancel` is called for Escape, the overlay and **Cancel** at any time: the
 * host keeps the dialog open while its request is pending, so it never closes
 * before the result is known (dialog spec section 4; `index.tsx`).
 */
export function AddStocksDialog({
  universeName,
  error,
  result,
  pending,
  onSubmit,
  onCancel,
}: AddStocksDialogProps): JSX.Element {
  const stocksId = useId();
  const counterId = useId();
  const blockedId = useId();
  const stocksRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedSymbol[] | null>(null);

  const recognised = parsed?.filter((entry) => entry.valid) ?? [];
  const rejected = parsed?.filter((entry) => !entry.valid) ?? [];
  const blocked = blockedReason(recognised.length);

  // Add is natively disabled while pending, and a browser either drops focus
  // from a control it disables or leaves it there with no Tab stop. Either
  // way focus moves to Cancel, so Escape and the Tab cycle keep working, as
  // `remove-dialog.tsx` does. Focus elsewhere in the dialog stays put.
  useEffect(() => {
    if (!pending) {
      return;
    }
    const active = document.activeElement;
    if (formRef.current?.contains(active) && active !== addRef.current) {
      return;
    }
    cancelRef.current?.focus();
  }, [pending]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // Re-parse the current text, so a preview older than the field cannot send.
    const valid = parseBulkSymbols(raw).filter((entry) => entry.valid);
    showParse(raw);
    if (blockedReason(valid.length) !== null) {
      return;
    }
    onSubmit(Array.from(new Set(valid.map((entry) => entry.normalised))));
  }

  return (
    <DialogFrame
      title={UNIVERSE_DETAIL.addStocksTitle(universeName)}
      initialFocusRef={stocksRef}
      onCancel={onCancel}
      busy={pending}
    >
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error === null ? null : <ErrorAlert error={error} />}
        {result === null ? null : (
          <output className="text-sm">{addResultSentence(result, universeName)}</output>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={stocksId}>{UNIVERSES.stocks}</label>
          <textarea
            ref={stocksRef}
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
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded border border-border px-3 py-2"
          >
            {DIALOGS.cancel}
          </button>
          <button
            ref={addRef}
            type="submit"
            data-variant={blocked === null ? "default" : "blocked"}
            aria-describedby={blocked === null ? undefined : blockedId}
            // Never a bare `disabled` while blocked: the reason must stay reachable
            // (button `blocked` contract). In flight it is natively disabled.
            tabIndex={0}
            disabled={pending}
            data-pending={pending ? "true" : undefined}
            className="inline-flex items-center gap-2 rounded bg-foreground px-3 py-2 text-background data-[variant=blocked]:border data-[variant=blocked]:border-border data-[variant=blocked]:bg-transparent data-[variant=blocked]:text-muted-foreground"
          >
            <ConfirmProgress pending={pending} />
            {DIALOGS.add}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}
