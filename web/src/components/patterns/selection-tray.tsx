import { type JSX, useId } from "react";
import { Link } from "react-router-dom";
import { REGIONS, SELECTION } from "../../screens/research/copy";

/**
 * The fewest and the most stocks a comparison holds: the API's `symbols`
 * bound of 2 to 6 (classification-api section 2.4; DEC-0070).
 */
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 6;

/** The delivered button size and border (`screens/instruments/start-action.tsx`). */
const BUTTON = "w-fit rounded border border-border px-3 py-2 text-sm";

export interface SelectionTrayProps {
  /** The checked symbols in the order checked; the host keeps them unique by symbol. */
  checked: string[];
  /** Opens the add dialog with the checked symbols; the dialog is CAP-002-E4-S8's. */
  onAddToUniverse?: (symbols: string[]) => void;
}

/**
 * The selection tray (classification-ui section 2.5; blueprint 4.6; UX design
 * 1.1), DAC-E4-S7-1 and AC-16. A controlled, stateless pattern the Research
 * screen (CAP-002-E4-S9) and a universe's Members tab mount under their
 * results: `checked` is the host's, the host keeps it unique by symbol and the
 * tray prints what it is given, counted by `checked.length` (DEC-0163).
 *
 * Nothing renders with no checked row. From one, a `section` (role `region`) labelled
 * *Selection* on the `--foreground` fill announces *{n} selected* politely.
 * **Compare side by side** is a link to `/research/compare?symbols=` with the
 * symbols comma-joined in the order checked, each `encodeURIComponent`-encoded,
 * while 2 to 6 are checked; otherwise it is a `button` `blocked`: focusable,
 * never `disabled`, its reason *Check 2 to 6 stocks to compare them.* visible
 * beside it and read through `aria-describedby`, and activating it does
 * nothing (the pattern of `screens/instruments/start-action.tsx`).
 * **Add to universe…** renders only when `onAddToUniverse` is given.
 *
 * Strings: `REGIONS.selection` and `SELECTION.selected`, `compareSideBySide`,
 * `compareBlocked` and `addToUniverse` from `screens/research/copy.ts`
 * (CAP-002-E4-S2).
 */
export function SelectionTray({
  checked,
  onAddToUniverse,
}: SelectionTrayProps): JSX.Element | null {
  const reasonId = useId();
  if (checked.length === 0) {
    return null;
  }
  const canCompare = checked.length >= COMPARE_MIN && checked.length <= COMPARE_MAX;
  return (
    <section
      aria-label={REGIONS.selection}
      className="flex flex-wrap items-center gap-3 rounded bg-foreground p-3 text-background"
    >
      <p aria-live="polite" className="text-sm">
        {SELECTION.selected(checked.length)}
      </p>
      {canCompare ? (
        <Link
          to={`/research/compare?symbols=${checked.map(encodeURIComponent).join(",")}`}
          data-variant="outline"
          className={BUTTON}
        >
          {SELECTION.compareSideBySide}
        </Link>
      ) : (
        <>
          <button
            type="button"
            data-variant="blocked"
            aria-disabled="true"
            aria-describedby={reasonId}
            // Never `disabled`: a disabled control takes no focus, so its
            // reason would never reach a keyboard or screen-reader user. It
            // carries no handler, so activating it does nothing.
            className={BUTTON}
          >
            {SELECTION.compareSideBySide}
          </button>
          <span id={reasonId} className="text-sm">
            {SELECTION.compareBlocked}
          </span>
        </>
      )}
      {onAddToUniverse === undefined ? null : (
        <button
          type="button"
          data-variant="outline"
          onClick={() => onAddToUniverse(checked)}
          className={BUTTON}
        >
          {SELECTION.addToUniverse}
        </button>
      )}
    </section>
  );
}
