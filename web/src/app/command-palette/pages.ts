import { DESTINATIONS } from "../destinations";
import { PALETTE_COPY } from "./copy";

export interface PalettePage {
  readonly label: string;
  readonly to: string;
  readonly hint: string | null;
}

/**
 * The pages the palette offers (command-palette 2.3; DEC-0331): the shipped
 * destinations in their own order, then the three data pages. `DESTINATIONS` is
 * read at call time, so a destination another story adds appears here unchanged.
 */
export function palettePages(): readonly PalettePage[] {
  const { coverage, followed, downloads } = PALETTE_COPY.dataPages;
  return [
    ...DESTINATIONS.map((d) => ({ label: d.label, to: d.to, hint: null })),
    { label: coverage.label, to: "/data/coverage", hint: coverage.hint },
    { label: followed.label, to: "/data/followed", hint: followed.hint },
    { label: downloads.label, to: "/data/downloads", hint: downloads.hint },
  ];
}

/**
 * The local match (DEC-0331): empty text matches everything, otherwise any
 * field containing the trimmed text, ignoring case.
 */
export function matchesText(text: string, ...fields: readonly (string | null)[]): boolean {
  const needle = text.trim().toLowerCase();
  if (needle === "") return true;
  return fields.some((field) => field?.toLowerCase().includes(needle) === true);
}
