import { type FormEvent, type JSX, useEffect, useId, useRef, useState } from "react";
import { addInstruments } from "../../api/client";

/**
 * The single-symbol inline `form` + `input` `text` add (component design
 * section 2.5; ux-design section 1.2 Page Layout and Interaction Flows;
 * AC-1).
 *
 * Format only is validated here — this field never validates against the
 * provider, because whether Massive recognises a symbol is not known until
 * a run reaches it (AC-11), and a field that appeared to validate would be
 * lying. Duplicate-of-active is a field error; duplicate-of-retired is the
 * store silently reactivating it in the same request, reported here as a
 * distinct notice rather than folded into the error path (ux-design
 * section 1.2 Interaction Flows, DAC-E2-S4-1's sibling rule).
 */
export function AddField({
  onAdded,
  focusOnMount = false,
}: {
  onAdded: () => void;
  /**
   * Set once the screen learns the list has never been populated
   * (ux-design section 1.2 States), so this field receives focus rather
   * than the owner having to find it themselves.
   */
  focusOnMount?: boolean;
}): JSX.Element {
  const [symbol, setSymbol] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorId = useId();
  const noticeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOnMount) {
      inputRef.current?.focus();
    }
  }, [focusOnMount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = symbol.trim().toUpperCase();
    if (trimmed.length === 0 || submitting) {
      return;
    }
    setSubmitting(true);
    setFieldError(null);
    setNotice(null);
    try {
      const result = await addInstruments([trimmed]);
      if (result.rejected.length > 0) {
        const [rejection] = result.rejected;
        setFieldError(
          rejection.disposition === "duplicate_active"
            ? `${rejection.normalisedSymbol ?? trimmed} is already an active instrument.`
            : `${rejection.inputSymbol} does not match the required symbol shape.`,
        );
        return;
      }
      if (result.reactivated.length > 0) {
        setNotice(`${result.reactivated[0].normalisedSymbol} reactivated — it is active again.`);
      }
      setSymbol("");
      onAdded();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "the request could not be completed";
      setFieldError(`Adding instrument ${trimmed} failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="add-instrument-field" className="text-base">
          Instrument symbol
        </label>
        <input
          id="add-instrument-field"
          ref={inputRef}
          type="text"
          value={symbol}
          onChange={(event) => setSymbol(event.target.value)}
          aria-invalid={fieldError !== null ? "true" : undefined}
          aria-describedby={fieldError !== null ? errorId : notice !== null ? noticeId : undefined}
          className="rounded border border-input p-2 text-base"
          placeholder="e.g. AAPL"
        />
        {fieldError !== null ? (
          <p id={errorId} role="alert" className="text-status-critical text-sm">
            {fieldError}
          </p>
        ) : null}
        {notice !== null ? (
          <p id={noticeId} className="text-status-good text-sm">
            {notice}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-foreground px-3 py-2 text-background"
      >
        Add
      </button>
    </form>
  );
}
