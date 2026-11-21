import { ApiUnreachableError } from "../../api/client";

/**
 * Every owner-facing string of the command palette (command-palette 2.4 and
 * 10; UX design 1.1; DAC-E3-12; DAC-E3-S5-5; DEC-0332).
 *
 * The dialog's own label, *Search FactorFlow*, is owned by `CommandDialog`.
 * No string here uses a domain term the owner's labels avoid (DAC-E7-3).
 */
export const PALETTE_COPY = {
  placeholder: "Jump to a stock or page",
  groups: { stocks: "Stocks", universes: "Universes", pages: "Pages" },
  stocksHint: "Type a symbol to find a followed stock",
  searching: "Searching…",
  partial: "Showing the first 8. Keep typing to narrow.",
  empty: (text: string): string => `No stocks or pages match "${text}".`,
  stocksError: (reason: string): string => `Couldn't search followed stocks: ${reason}.`,
  universesError: (reason: string): string => `Couldn't read universes: ${reason}.`,
  dataPages: {
    coverage: { label: "Coverage", hint: "Data health › Coverage" },
    followed: { label: "Followed stocks", hint: "Data health › Followed stocks" },
    downloads: { label: "Downloads", hint: "Data health › Downloads" },
  },
} as const;

/**
 * The reason an error row gives (DEC-0332; UX design 0.7). Only an unreachable
 * API is told apart: the envelope's message and request id are never shown.
 */
export function failureReason(error: unknown): string {
  return error instanceof ApiUnreachableError
    ? "FactorFlow is not answering"
    : "FactorFlow hit an unexpected problem";
}
