import type { ParsedSymbol } from "../instruments/parse-bulk-symbols";

/*
 * The paste summary of setup step 3 (CAP-003-E4-S3; component design setup-ui
 * 2.3; AC-5, DAC-E4-5, DAC-E4-S3-1; DEC-0218, DEC-0351, DEC-0352). It wraps the
 * delivered parser's output and never edits the parser (DAC-E7-13): the step
 * calls the parser, so its calls stay countable (DAC-E4-S3-2), and this module
 * only classifies what came back.
 */

/**
 * The mirror of the delivered symbol shape: `parse-bulk-symbols.ts` and
 * `src/factorflow/instruments/symbols.py` keep it private, so the summary's
 * tests pin that this constant and the parser agree.
 */
export const SYMBOL_SHAPE = /^[A-Z][A-Z0-9.-]{0,15}$/;

/**
 * The mirror of the delivered parser's separators. The capture group makes
 * `split` keep them, so a replaced entry leaves the text around it as pasted.
 */
export const ENTRY_SEPARATOR = /([\n,\t;]+)/;

/** An entry that is not a valid symbol, with the fix that would make it one, if any. */
export interface UnreadableEntry {
  input: string;
  fix: string | null;
}

/** What a paste holds: the symbols to post, the repeats, and the entries to fix. */
export interface PasteSummary {
  accepted: string[];
  duplicates: string[];
  unreadable: UnreadableEntry[];
}

/**
 * A stretch of slash, space or underscore characters between two letters becomes
 * one dot, and the result is offered only when it is a valid symbol (DEC-0218).
 */
function nearMiss(normalised: string): string | null {
  const fixed = normalised.replace(/(?<=[A-Z])[/ _]+(?=[A-Z])/g, ".");
  return fixed !== normalised && SYMBOL_SHAPE.test(fixed) ? fixed : null;
}

/**
 * Classifies each parsed entry in paste order (DEC-0351). A valid symbol seen
 * for the first time is accepted; each later repeat adds its symbol to
 * `duplicates` once. An invalid entry is unreadable, however often it repeats.
 */
export function summarisePaste(parsed: readonly ParsedSymbol[]): PasteSummary {
  const accepted: string[] = [];
  const duplicates: string[] = [];
  const unreadable: UnreadableEntry[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (!entry.valid) {
      unreadable.push({ input: entry.input, fix: nearMiss(entry.normalised) });
    } else if (!seen.has(entry.normalised)) {
      seen.add(entry.normalised);
      accepted.push(entry.normalised);
    } else if (!duplicates.includes(entry.normalised)) {
      duplicates.push(entry.normalised);
    }
  }
  return { accepted, duplicates, unreadable };
}

/**
 * Replaces every whole entry equal to `input` by `fix`, keeping the
 * separators and the whitespace around each entry (DEC-0352). An entry that
 * merely contains `input` is left alone.
 */
export function replaceEntry(raw: string, input: string, fix: string): string {
  return raw
    .split(ENTRY_SEPARATOR)
    .map((part) => (part.trim() === input ? part.replace(input, fix) : part))
    .join("");
}
