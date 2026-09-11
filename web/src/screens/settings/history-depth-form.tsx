import { type JSX, useEffect, useId, useState } from "react";
import { getHistoryDepth, setHistoryDepth } from "../../api/client";

/**
 * The `form` `stacked` + `input` `numeric` history-depth field
 * (component design section 2.5; ux-design section 1.3; AC-2).
 *
 * Validation runs on blur, not per keystroke (ux-design section 1.3
 * Interaction Flows, T015): reporting an error before the owner has
 * finished typing a number is what a per-keystroke check would do, and for
 * numeric entry that is constant. A failing value's error names the
 * operation, the resource, and the reason (STD-UI-19, DAC-E2-S4-5), rather
 * than a generic "Invalid value".
 */
export function HistoryDepthForm(): JSX.Element {
  const [years, setYears] = useState<number | null>(null);
  const [rawValue, setRawValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputId = useId();
  const errorId = useId();
  const descriptionId = useId();

  useEffect(() => {
    getHistoryDepth()
      .then((depth) => {
        setYears(depth.years);
        setRawValue(depth.years === null ? "" : String(depth.years));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleBlur(): Promise<void> {
    if (rawValue.trim().length === 0) {
      return;
    }
    const parsedFloat = Number(rawValue);
    const isPositiveInteger = Number.isInteger(parsedFloat) && parsedFloat > 0;
    if (!isPositiveInteger) {
      setError("Setting history depth failed: history depth must be a positive whole number.");
      return;
    }

    try {
      const depth = await setHistoryDepth(parsedFloat);
      setYears(depth.years);
      setRawValue(depth.years === null ? "" : String(depth.years));
      setError(null);
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "the request could not be completed";
      setError(`Setting history depth failed: ${reason}`);
    }
  }

  return (
    <div className="flex flex-col gap-2" data-testid="history-depth-form">
      <label htmlFor={inputId} className="text-base">
        History depth <span aria-hidden="true">(years)</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          disabled={loading}
          value={rawValue}
          aria-label="History depth, in years"
          aria-invalid={error !== null ? "true" : undefined}
          aria-describedby={
            [error !== null ? errorId : null, years === null ? descriptionId : null]
              .filter((id): id is string => id !== null)
              .join(" ") || undefined
          }
          onChange={(event) => setRawValue(event.target.value)}
          onBlur={() => void handleBlur()}
          // Sized by its own `size` attribute, not a Tailwind width
          // utility: no width value in `theme.css`'s scale fits a
          // handful-of-digits numeric field, and introducing one outside
          // the scale is what STD-UI-29 forbids.
          size={4}
          className="rounded border border-input p-2 text-right font-numeric"
        />
        <span className="text-sm">years</span>
      </div>
      {years === null ? (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          Required before the first acquisition run.
        </p>
      ) : null}
      {error !== null ? (
        <p id={errorId} role="alert" className="text-status-critical text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
