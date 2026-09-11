import { type JSX, useId, useState } from "react";
import { addInstruments } from "../../api/client";
import type { AddInstrumentsResult } from "../../api/types";
import { type ParsedSymbol, parseBulkSymbols } from "./parse-bulk-symbols";

/**
 * The `textarea` `list` Add-many region (component design section 2.5;
 * ux-design section 1.2 Interaction Flows; DAC-E2-3, DAC-E2-S4-1).
 *
 * Parses on blur, not per keystroke — the `textarea` `list` variant's
 * contract runs parsing at the same point `input`'s validation runs, so a
 * paste is reported once the owner has finished, not while it streams in.
 * The preview reports recognised and rejected counts, with rejected
 * entries individually reasoned, before the submit action is enabled or
 * anything is sent to the API. A rejected entry never removes the accepted
 * ones from the batch that submits (DAC-E2-S4-1) — at three thousand
 * symbols, a paste rejected wholesale over one malformed line is work the
 * owner cannot easily reconstruct.
 */
export function BulkAdd({ onAdded }: { onAdded: () => void }): JSX.Element {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedSymbol[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<AddInstrumentsResult | null>(null);
  const labelId = useId();
  const countId = useId();
  const blockedReasonId = useId();

  const recognised = parsed?.filter((entry) => entry.valid) ?? [];
  const rejected = parsed?.filter((entry) => !entry.valid) ?? [];
  // Persistent, reachable state — an all-rejected paste — rather than the
  // transient in-flight `submitting` state below (IR-003): only this one
  // gets the `blocked` treatment. `submitting` stays a native `disabled`
  // because it resolves in well under a second and DAC-E2-S4-3's own
  // remediation permits a sub-second in-flight state to remain disabled.
  const blocked = parsed !== null && recognised.length === 0;

  function handleBlur(): void {
    setParsed(raw.trim().length === 0 ? null : parseBulkSymbols(raw));
  }

  async function handleSubmit(): Promise<void> {
    if (recognised.length === 0) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitResult(null);
    try {
      // Deduplicate normalised symbols: the same symbol pasted twice in one
      // batch should not be sent to the API twice within a single request.
      const symbols = Array.from(new Set(recognised.map((entry) => entry.normalised)));
      const result = await addInstruments(symbols);
      // IR-008: the API's per-symbol outcomes (a mixed batch's rejections
      // included) are reported after submission rather than discarded —
      // clearing the textarea must not also clear what the store did with
      // what was sent.
      setSubmitResult(result);
      setRaw("");
      setParsed(null);
      onAdded();
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "the request could not be completed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label id={labelId} htmlFor="bulk-add-textarea" className="text-base">
        Add many instruments
      </label>
      <textarea
        id="bulk-add-textarea"
        aria-labelledby={labelId}
        aria-describedby={parsed ? countId : undefined}
        data-testid="bulk-add-textarea"
        data-variant="list"
        // Sized by the native `rows` attribute rather than a Tailwind
        // min-height utility: no height value in `theme.css`'s scale fits
        // a multi-row paste target, and introducing one outside the scale
        // is what STD-UI-29 forbids.
        rows={4}
        className="rounded border border-input p-2 text-base"
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        onBlur={handleBlur}
        placeholder="Paste symbols separated by newline, comma, tab, or semicolon"
      />
      {parsed !== null ? (
        <div data-testid="bulk-add-preview" className="flex flex-col gap-2 text-sm">
          <p id={countId}>
            {recognised.length} recognised, {rejected.length} rejected
          </p>
          {rejected.length > 0 ? (
            <ul data-testid="bulk-add-rejected" className="flex flex-col gap-1">
              {rejected.map((entry, index) => (
                <li key={`${entry.input}-${index}`} className="text-status-critical">
                  <span className="font-numeric">{entry.input}</span>: does not match the required
                  symbol shape
                </li>
              ))}
            </ul>
          ) : null}
          {submitError !== null ? (
            <p role="alert" className="text-status-critical">
              Adding instruments failed: {submitError}
            </p>
          ) : null}
          <button
            type="button"
            data-variant={blocked ? "blocked" : "default"}
            aria-describedby={blocked ? blockedReasonId : undefined}
            // Never a bare `disabled` attribute for the blocked case: a
            // plain disabled control is not focusable, so its reason never
            // reaches a keyboard or screen-reader user (DAC-E2-S4-3). The
            // transient `submitting` state below is the sub-second
            // exception that rule's own remediation allows.
            tabIndex={0}
            disabled={!blocked && submitting}
            className="w-fit rounded bg-foreground px-3 py-2 text-background data-[variant=blocked]:border data-[variant=blocked]:border-border data-[variant=blocked]:bg-transparent data-[variant=blocked]:text-muted-foreground"
            onClick={(event) => {
              if (blocked) {
                event.preventDefault();
                return;
              }
              void handleSubmit();
            }}
          >
            Add {recognised.length} instrument{recognised.length === 1 ? "" : "s"}
          </button>
          {blocked ? (
            <p id={blockedReasonId} className="text-muted-foreground text-sm">
              Add at least one recognised symbol before submitting.
            </p>
          ) : null}
        </div>
      ) : null}
      {submitResult !== null ? (
        <div data-testid="bulk-add-result" className="flex flex-col gap-1 text-sm">
          <p>
            {submitResult.added.length} added, {submitResult.reactivated.length} reactivated,{" "}
            {submitResult.rejected.length} rejected
          </p>
          {submitResult.rejected.length > 0 ? (
            <ul data-testid="bulk-add-result-rejected" className="flex flex-col gap-1">
              {submitResult.rejected.map((entry) => (
                <li key={entry.inputSymbol} className="text-status-critical">
                  <span className="font-numeric">{entry.inputSymbol}</span>:{" "}
                  {entry.reason ?? "rejected"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
