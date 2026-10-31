import { type JSX, type KeyboardEvent, useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NOTICES } from "./copy";

/**
 * The success notices the Research dialogs confirm through: *Saved {n} stocks
 * as {name}* and *Added {n} stocks to {name}*, each linking to the universe
 * (DAC-E4-S8-3, DAC-E4-S8-5; `toast` `success`, UX design 1.1; DEC-0168).
 *
 * Contract CAP-002-E4-S9 and later screens rely on: the host calls
 * `useNotices` once and renders `NoticeRegion` once; a dialog only calls
 * `notify`. The state lives in the host, so a notice raised by a dialog that
 * is closing (the Add dialog is unmounted by its host on success, DEC-0163)
 * still shows. Nothing is removed by time: DEC-0168 (owner-upheld; Open Gap
 * 2) keeps an item until it is dismissed, so the toast design spec's *about
 * five seconds* for `success` is not applied here. The spec's other two rules
 * are (DEC-0258): `Esc` dismisses the focused item, and at most three are
 * stacked, the newest, while the rest are held and return as those are
 * dismissed.
 */

/** The toast design spec's largest stack (section 4; DEC-0258). */
const MAX_SHOWN = 3;

/** One notice: its self-contained message and, optionally, the route it links to. */
export interface Notice {
  message: string;
  to?: string;
}

/** A notice as the host holds it, with the id `dismiss` names it by. */
export type HeldNotice = Notice & { id: number };

/** What `useNotices` returns: the held notices and the two ways to change them. */
export interface NoticesBinding {
  notices: HeldNotice[];
  notify: (notice: Notice) => void;
  dismiss: (id: number) => void;
}

/** The universe detail route a notice links to (UX design 1.1; STD-UI-24). */
export function universePath(universeId: string): string {
  return `/research/universes/${encodeURIComponent(universeId)}`;
}

/** The host's notices, in arrival order; ids come from a counter (DAC-E4-S8-3, DAC-E4-S8-5). */
export function useNotices(): NoticesBinding {
  const [notices, setNotices] = useState<HeldNotice[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((notice: Notice): void => {
    nextId.current += 1;
    const id = nextId.current;
    setNotices((current) => [...current, { ...notice, id }]);
  }, []);

  const dismiss = useCallback((id: number): void => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  return { notices, notify, dismiss };
}

/**
 * The polite `status` region, always mounted so its first announcement is
 * read, with one `success` item for each of the newest three notices and a
 * Dismiss control that, like `Esc` on the item's link or control, hands focus
 * back to the region (DAC-E4-S8-3, DAC-E4-S8-5; toast design spec sections 4
 * and 5; DEC-0258).
 */
export function NoticeRegion({
  notices,
  onDismiss,
}: {
  notices: HeldNotice[];
  onDismiss: (id: number) => void;
}): JSX.Element {
  const regionRef = useRef<HTMLOutputElement>(null);

  function dismiss(id: number): void {
    onDismiss(id);
    regionRef.current?.focus();
  }

  function dismissOnEscape(id: number): (event: KeyboardEvent) => void {
    return (event) => {
      if (event.key === "Escape") {
        dismiss(id);
      }
    };
  }

  return (
    // An `output` carries `role="status"` implicitly, as the delivered status
    // region and as-of line rely on. Not atomic: a second notice is read on
    // its own rather than re-reading every item still shown.
    <output
      ref={regionRef}
      aria-live="polite"
      aria-atomic="false"
      tabIndex={-1}
      className="fixed right-4 bottom-4 flex flex-col gap-2"
    >
      {notices.slice(-MAX_SHOWN).map((notice) => (
        // `span`, not `div`: an `output` holds phrasing content only.
        <span
          key={notice.id}
          data-variant="success"
          // The toast tokens (toast design spec section 6): `--popover` surface
          // and text, `--status-good` accent, `--radius` corners. `popover` has
          // no Tailwind colour, so the token is read directly; no literal value.
          className="flex items-center gap-3 rounded-[var(--radius)] border border-status-good bg-[hsl(var(--popover))] p-3 text-[hsl(var(--popover-foreground))] text-sm"
        >
          {notice.to === undefined ? (
            <span>{notice.message}</span>
          ) : (
            <Link to={notice.to} onKeyDown={dismissOnEscape(notice.id)} className="underline">
              {notice.message}
            </Link>
          )}
          <button
            type="button"
            onClick={() => dismiss(notice.id)}
            onKeyDown={dismissOnEscape(notice.id)}
            // `min-h-5 min-w-5` is `--space-5`, 24px: the toast contract's
            // smallest dismiss target (toast design spec section 5).
            className="min-h-5 min-w-5 rounded border border-border px-2 text-sm"
          >
            {NOTICES.dismiss}
          </button>
        </span>
      ))}
    </output>
  );
}
