import { type JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "../../components/ui/command";
import { RESEARCH_REGISTERED } from "../destinations";
import { PALETTE_COPY, failureReason } from "./copy";
import { matchesText, palettePages } from "./pages";
import { stockTarget, universeTarget } from "./targets";
import { type PaletteUniverse, fetchActiveUniverses } from "./universes";
import { useStockSearch } from "./use-stock-search";

/**
 * The command palette (command-palette 2.2 to 2.4 and 10; UX design 1.1;
 * DAC-E3-11, DAC-E3-12, DAC-E3-S5-2, DAC-E3-S5-3): a dialog over three groups,
 * Stocks, Universes (only while research routes are registered) and Pages, in
 * that order and with no Actions group, every row of which only navigates.
 *
 * The eight states of command-palette 2.4 render as follows. Hint: the disabled
 * Stocks row before any text. Loading: the Searching row, and the Universes
 * group absent until its read answers. Empty: `CommandEmpty`. Partial: the
 * disabled row after eight stocks. Error: a disabled row in the group that
 * failed, the others still usable. Unreachable: the same rows, worded by
 * `failureReason`, and Pages is local so it always works.
 *
 * Stale: not applicable (stocks are read again for every settled keystroke and
 * universes once per opening).
 * Unavailable: not applicable (no check runs here).
 * One-tier rule (AC-20): not applicable (the rows are symbols, universe names
 * and page names, so no status renders and no value is undeterminable, and
 * `StatusBadge` and `NotDeterminable` are not used).
 */
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps): JSX.Element {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <PaletteBody onClose={() => onOpenChange(false)} />
    </CommandDialog>
  );
}

type UniversesState =
  | { kind: "off" }
  | { kind: "loading" }
  | { kind: "ok"; rows: readonly PaletteUniverse[] }
  | { kind: "error"; error: unknown };

/**
 * Mounted only while the dialog is open, because Radix unmounts the content on
 * close. The typed text and the universes read are therefore per opening, and
 * nothing typed is kept (DAC-E3-S5-3; command-palette 4).
 */
function PaletteBody({ onClose }: { onClose: () => void }): JSX.Element {
  const [text, setText] = useState("");
  const stocks = useStockSearch(text);
  const navigate = useNavigate();
  const [universes, setUniverses] = useState<UniversesState>(
    RESEARCH_REGISTERED ? { kind: "loading" } : { kind: "off" },
  );

  // One read per opening, and none while research routes are unregistered.
  useEffect(() => {
    if (!RESEARCH_REGISTERED) return;
    const controller = new AbortController();
    fetchActiveUniverses(controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setUniverses({ kind: "ok", rows });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setUniverses({ kind: "error", error });
      });
    return () => controller.abort();
  }, []);

  const choose = (to: string) => {
    navigate(to);
    onClose();
  };

  const groups: JSX.Element[] = [];

  if (!(stocks.kind === "ok" && stocks.symbols.length === 0)) {
    groups.push(
      <CommandGroup key="stocks" heading={PALETTE_COPY.groups.stocks}>
        {stocks.kind === "idle" && (
          <CommandItem disabled value="hint:stocks">
            {PALETTE_COPY.stocksHint}
          </CommandItem>
        )}
        {stocks.kind === "loading" && <CommandLoading>{PALETTE_COPY.searching}</CommandLoading>}
        {stocks.kind === "ok" &&
          stocks.symbols.map((symbol) => (
            <CommandItem
              key={symbol}
              value={`stock:${symbol}`}
              onSelect={() => choose(stockTarget(symbol))}
            >
              {symbol}
            </CommandItem>
          ))}
        {stocks.kind === "ok" && stocks.more && (
          <CommandItem disabled value="partial:stocks">
            {PALETTE_COPY.partial}
          </CommandItem>
        )}
        {stocks.kind === "error" && (
          <CommandItem disabled value="error:stocks">
            {PALETTE_COPY.stocksError(failureReason(stocks.error))}
          </CommandItem>
        )}
      </CommandGroup>,
    );
  }

  const universeRows =
    universes.kind === "ok" ? universes.rows.filter((u) => matchesText(text, u.name)) : [];
  if (universes.kind === "error" || universeRows.length > 0) {
    groups.push(
      <CommandGroup key="universes" heading={PALETTE_COPY.groups.universes}>
        {universes.kind === "error" && (
          <CommandItem disabled value="error:universes">
            {PALETTE_COPY.universesError(failureReason(universes.error))}
          </CommandItem>
        )}
        {universeRows.map((u) => (
          <CommandItem
            key={u.id}
            value={`universe:${u.id}`}
            onSelect={() => choose(universeTarget(u.id))}
          >
            {u.name}
          </CommandItem>
        ))}
      </CommandGroup>,
    );
  }

  const pages = palettePages().filter((p) => matchesText(text, p.label, p.hint));
  if (pages.length > 0) {
    groups.push(
      <CommandGroup key="pages" heading={PALETTE_COPY.groups.pages}>
        {pages.map((p) => (
          <CommandItem key={p.to} value={`page:${p.to}`} onSelect={() => choose(p.to)}>
            {p.label}
            {p.hint !== null && (
              <span className="ml-auto text-xs text-muted-foreground">{p.hint}</span>
            )}
          </CommandItem>
        ))}
      </CommandGroup>,
    );
  }

  const settled = text.trim() !== "" && stocks.kind === "ok" && universes.kind !== "loading";

  return (
    <>
      <CommandInput placeholder={PALETTE_COPY.placeholder} value={text} onValueChange={setText} />
      <CommandList>
        {settled && <CommandEmpty>{PALETTE_COPY.empty(text.trim())}</CommandEmpty>}
        {groups.flatMap((group, i) =>
          i === 0
            ? [group]
            : [<CommandSeparator key={`separator-${group.key}`} alwaysRender />, group],
        )}
      </CommandList>
    </>
  );
}
