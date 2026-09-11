/**
 * The pure parsing half of the `textarea` `list` Add-many region
 * (component design section 2.5; ux-design section 1.2 Interaction Flows;
 * DAC-E2-3, DAC-E2-S4-1). Tested independently of the rendered field
 * (T014) so the separator and shape rules are verifiable without React.
 *
 * The symbol shape mirrors `factorflow.instruments.symbols.SYMBOL_PATTERN`
 * exactly (`^[A-Z][A-Z0-9.-]{0,15}$`, applied after trimming and
 * upper-casing) so a symbol this parser marks valid is never rejected by
 * the store as malformed for a reason the owner was not already shown.
 * This field never validates against the provider — that is not known
 * until a run reaches the instrument (AC-11) — so `valid` here means only
 * "matches the required shape".
 */

const SEPARATOR_PATTERN = /[\n,\t;]+/;
const SYMBOL_SHAPE_PATTERN = /^[A-Z][A-Z0-9.-]{0,15}$/;

export interface ParsedSymbol {
  /** Exactly as pasted, before trimming or case normalisation. */
  input: string;
  /** Trimmed and upper-cased, the form submitted to the API. */
  normalised: string;
  /** Whether `normalised` matches the store's shape constraint. */
  valid: boolean;
}

/**
 * Splits on newline, comma, tab, and semicolon in any combination
 * (DAC-E2-3), dropping blank entries produced by consecutive or trailing
 * separators, and classifies each remaining entry by shape. A malformed
 * entry is reported alongside the valid ones rather than discarding them
 * (DAC-E2-S4-1) — this function never throws and never drops an entry
 * silently.
 */
export function parseBulkSymbols(raw: string): ParsedSymbol[] {
  return raw
    .split(SEPARATOR_PATTERN)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((input) => {
      const normalised = input.toUpperCase();
      return { input, normalised, valid: SYMBOL_SHAPE_PATTERN.test(normalised) };
    });
}
