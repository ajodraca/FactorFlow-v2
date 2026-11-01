import { type JSX, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, listUniverseEvents } from "../../../../api/classification-client";
import type { UniverseEvent, UniverseEventType } from "../../../../api/classification-types";
import {
  RESULTS,
  UNIVERSES,
  UNIVERSE_DETAIL,
  UNIVERSE_LIFECYCLE,
  failureSentence,
} from "../../copy";
import { formatTimestamp } from "../../format";

/** The API's default page size, the history's page (DEC-0107). */
const PAGE_SIZE = 50;

/** The Universes list, registered by CAP-002-E4-S10. */
const UNIVERSES_ROUTE = "/research/universes";

const EVENT_LABELS: Record<UniverseEventType, string> = {
  ...UNIVERSE_DETAIL.events,
  retired: UNIVERSE_LIFECYCLE.retiredLabel,
};

/** The events that open the membership on their date (UX design 1.4). */
const AS_OF_EVENTS: readonly UniverseEventType[] = ["created", "member_added", "member_removed"];

/** Only `created` and `renamed` events carry a name (`universe_event_name_agrees`; DEC-0107). */
function bearsName(event: UniverseEvent): boolean {
  return event.eventType === "created" || event.eventType === "renamed";
}

/** The name a universe had before the rename at `index`: the nearest older name-bearing event's. */
function previousName(events: readonly UniverseEvent[], index: number): string | null {
  return events.slice(index + 1).find(bearsName)?.name ?? null;
}

/** Whether the oldest loaded name-bearing event is a rename, whose old name is not loaded yet. */
function needsOlderName(events: readonly UniverseEvent[]): boolean {
  const named = events.filter(bearsName);
  return named.length > 0 && named[named.length - 1].eventType === "renamed";
}

function sentenceFor(error: unknown): string {
  return error instanceof ClassificationApiError
    ? failureSentence(error)
    : failureSentence({ operation: "list-universe-events", resource: "universe", code: null });
}

function isNotFound(error: unknown): boolean {
  return error instanceof ClassificationApiError && error.code === "universe_not_found";
}

type Body =
  | { kind: "loading" }
  | { kind: "error"; error: unknown }
  | { kind: "loaded"; events: UniverseEvent[]; nextCursor: string | null };

export interface HistoryTabProps {
  universeId: string;
  /** Opens the Members tab as of an event's America/Chicago date (`recorded_on`; DEC-0065). */
  onViewMembersAsOf: (date: string) => void;
}

/**
 * A universe's History panel (UX design 1.4; classification-ui 2.5;
 * DAC-E1-S8-6): the `data-table` `history` of its events, newest first as
 * the API returns them, keyset paged at 50 with **Load more** (DEC-0107). A
 * rename shows the old and the new name; when the old name is on a page not
 * yet read, the next page is read without a click until it is found or the
 * history ends. The tab never filters, sorts or deletes an event (AC-6).
 *
 * Any failed read replaces the body with the operation, resource and reason
 * sentence and **Try again**, which reads the history again from its first
 * page (UX design 1.4 States, Error; T009 f): a refused cursor is not retried.
 * **Load more** stays mounted while its page is read, so keyboard focus stays
 * on it; when the last page arrives it leaves and focus moves to the table.
 * The state is a local union rather than `ScreenState`, whose `error` carries
 * a `message` this tab must never render (classification-ui 2.4).
 */
export function HistoryTab({ universeId, onViewMembersAsOf }: HistoryTabProps): JSX.Element {
  const [body, setBody] = useState<Body>({ kind: "loading" });
  const [pagePending, setPagePending] = useState(false);
  /** Set when the last page removes a focused Load more: focus then moves to the table. */
  const [focusTable, setFocusTable] = useState(false);
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  /** Bumped by Try again: the history is read again from its first page. */
  const [attempt, setAttempt] = useState(0);
  /** A response from an earlier read, or one settling after unmount, is ignored. */
  const generation = useRef(0);

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt is the Try again trigger.
  useEffect(() => {
    generation.current += 1;
    const current = generation.current;
    setBody({ kind: "loading" });
    setPagePending(false);
    listUniverseEvents(universeId, { limit: PAGE_SIZE })
      .then((page) => {
        if (current === generation.current) {
          setBody({ kind: "loaded", events: page.events, nextCursor: page.nextCursor });
        }
      })
      .catch((error: unknown) => {
        if (current === generation.current) {
          setBody({ kind: "error", error });
        }
      });
  }, [universeId, attempt]);

  const readMore = useCallback(
    (cursor: string): void => {
      const current = generation.current;
      setPagePending(true);
      listUniverseEvents(universeId, { limit: PAGE_SIZE, cursor })
        .then((page) => {
          if (current !== generation.current) {
            return;
          }
          if (page.nextCursor === null && document.activeElement === loadMoreRef.current) {
            setFocusTable(true);
          }
          setBody((previous) =>
            previous.kind === "loaded"
              ? {
                  kind: "loaded",
                  events: [...previous.events, ...page.events],
                  nextCursor: page.nextCursor,
                }
              : previous,
          );
          setPagePending(false);
        })
        .catch((error: unknown) => {
          if (current === generation.current) {
            setPagePending(false);
            setBody({ kind: "error", error });
          }
        });
    },
    [universeId],
  );

  // A rename whose old name is not loaded reads the next page on its own (DEC-0107).
  useEffect(() => {
    if (body.kind !== "loaded" || pagePending) {
      return;
    }
    if (body.nextCursor !== null && needsOlderName(body.events)) {
      readMore(body.nextCursor);
    }
  }, [body, pagePending, readMore]);

  useEffect(() => {
    if (focusTable) {
      setFocusTable(false);
      tableRef.current?.focus();
    }
  }, [focusTable]);

  if (body.kind === "loading") {
    return (
      <output aria-busy="true" className="flex flex-col gap-2">
        <span className="sr-only">{UNIVERSES.loading}</span>
        <span aria-hidden="true" className="block h-2 rounded bg-secondary" />
        <span aria-hidden="true" className="block h-2 rounded bg-secondary" />
        <span aria-hidden="true" className="block h-2 rounded bg-secondary" />
      </output>
    );
  }

  if (body.kind === "error") {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p>{sentenceFor(body.error)}</p>
        {isNotFound(body.error) ? (
          <Link to={UNIVERSES_ROUTE} className="underline">
            {UNIVERSES.title}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setAttempt((count) => count + 1)}
            className="w-fit rounded border border-border px-3 py-2"
          >
            {RESULTS.tryAgain}
          </button>
        )}
      </div>
    );
  }

  const { events, nextCursor } = body;

  function detail(event: UniverseEvent, index: number): ReactNode {
    switch (event.eventType) {
      case "created":
        return event.name;
      case "renamed": {
        const before = previousName(events, index);
        return before === null || event.name === null
          ? event.name
          : UNIVERSE_DETAIL.renamedDetail(before, event.name);
      }
      case "member_added":
      case "member_removed":
        return event.symbol === null ? null : (
          <Link
            to={`/research/stocks/${encodeURIComponent(event.symbol)}`}
            className="font-numeric underline"
          >
            {event.symbol}
          </Link>
        );
      case "retired":
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <table ref={tableRef} tabIndex={-1} data-variant="history" className="w-full text-sm">
        <thead>
          <tr>
            <th scope="col" className="text-left">
              {UNIVERSE_DETAIL.historyColumns.recordedAt}
            </th>
            <th scope="col" className="text-left">
              {UNIVERSE_DETAIL.historyColumns.event}
            </th>
            <th scope="col" className="text-left">
              {UNIVERSE_DETAIL.historyColumns.detail}
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.eventId} className="h-row border-t border-border">
              <td className="font-numeric">{formatTimestamp(event.recordedAt)}</td>
              <td>{EVENT_LABELS[event.eventType]}</td>
              <td>
                <span className="inline-flex items-center gap-3">
                  {detail(event, index)}
                  {AS_OF_EVENTS.includes(event.eventType) ? (
                    <button
                      type="button"
                      onClick={() => onViewMembersAsOf(event.recordedOn)}
                      className="text-primary underline"
                    >
                      {UNIVERSE_DETAIL.viewMembersAsOf}
                    </button>
                  ) : null}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {nextCursor !== null ? (
        <button
          ref={loadMoreRef}
          type="button"
          aria-disabled={pagePending ? "true" : undefined}
          onClick={() => {
            if (!pagePending) {
              readMore(nextCursor);
            }
          }}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          {UNIVERSE_DETAIL.loadMore}
        </button>
      ) : null}
    </div>
  );
}
