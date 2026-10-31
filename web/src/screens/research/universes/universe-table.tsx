import { type JSX, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, listUniverseEvents } from "../../../api/classification-client";
import type { UniverseSummary } from "../../../api/classification-types";
import { FILTERS, RESULTS, UNIVERSES, UNIVERSE_LIFECYCLE, failureSentence } from "../copy";
import { formatPercentile, formatScore, formatTimestamp } from "../format";

/** `MAX_PAGE_SIZE` of the API (classification-api section 2.4; DEC-0101). */
const PAGE_SIZE = 500;

/** UX 1.3 Token Usage: an error is drawn in --destructive. */
const DESTRUCTIVE = { color: "hsl(var(--destructive))" } as const;

/** The route of one universe's detail, registered by CAP-002-E4-S10. */
export function universeDetailPath(universeId: string): string {
  return `/research/universes/${encodeURIComponent(universeId)}`;
}

const FACTORS = ["value", "growth", "momentum"] as const;

const MEASURES = [
  { key: "percentile", label: FILTERS.measures.percentile, format: formatPercentile },
  { key: "score", label: FILTERS.measures.standardisedScore, format: formatScore },
] as const;

const DIRECTIONS = [
  { key: "min", label: FILTERS.directions.atLeast },
  { key: "max", label: FILTERS.directions.atMost },
] as const;

/**
 * A universe's origin line (UX design 1.3; DEC-0102): *Created by hand*, or
 * *Saved from a filter on {classification_date}* followed, each only when it
 * applied, by the bounds (factor order value, growth, momentum; percentile
 * before standardised score; minimum before maximum), the search prefix and
 * the hidden-incomplete clause. A bound key outside the twelve is dropped,
 * never printed. The parameter is the stored `filter_provenance` spelling.
 *
 * A cross-story contract (DEC-0108): CAP-002-E1-S9 exports and imports this
 * function, so its name, parameter, `string` return and wording stay as they
 * are, and it stays pure and at module scope.
 */
function describeOrigin(
  provenance: {
    set_id?: string;
    classification_date: string;
    thresholds: Record<string, number | string>;
    hide_incomplete: boolean;
    symbol: string | null;
  } | null,
): string {
  if (provenance === null) {
    return UNIVERSES.createdByHand;
  }
  const bounds: string[] = [];
  for (const factor of FACTORS) {
    for (const measure of MEASURES) {
      for (const direction of DIRECTIONS) {
        const value = provenance.thresholds[`${factor}_${measure.key}_${direction.key}`];
        if (value !== undefined) {
          bounds.push(
            `${factor} ${measure.label} ${direction.label} ${measure.format(String(value))}`,
          );
        }
      }
    }
  }
  let line = UNIVERSES.originLead(provenance.classification_date);
  if (bounds.length > 0) {
    line += `: ${bounds.join(", ")}`;
  }
  if (typeof provenance.symbol === "string" && provenance.symbol !== "") {
    line += `; ${UNIVERSES.originSearch(provenance.symbol)}`;
  }
  if (provenance.hide_incomplete === true) {
    line += `; ${UNIVERSES.originHidden}`;
  }
  return line;
}

type Provenance = Parameters<typeof describeOrigin>[0];

/**
 * The `created` event's `filter_provenance`, passed through by the fetch layer
 * as stored (snake_case; DEC-0144), narrowed to `describeOrigin`'s parameter.
 * `null` is a universe created by hand; any other shape is a failed read.
 */
function toProvenance(value: unknown): Provenance {
  if (value === null) {
    return null;
  }
  const stored = value as Record<string, unknown> | undefined;
  if (typeof stored !== "object" || typeof stored.classification_date !== "string") {
    throw new TypeError("filter_provenance has no classification_date");
  }
  const thresholds = stored.thresholds;
  return {
    set_id: typeof stored.set_id === "string" ? stored.set_id : undefined,
    classification_date: stored.classification_date,
    thresholds:
      typeof thresholds === "object" && thresholds !== null
        ? (thresholds as Record<string, number | string>)
        : {},
    hide_incomplete: stored.hide_incomplete === true,
    symbol: typeof stored.symbol === "string" ? stored.symbol : null,
  };
}

/**
 * Pages the universe's events, newest first, at the API maximum until the
 * `created` event, the oldest (UX design 1.3: read once per expansion).
 */
async function readOrigin(universeId: string): Promise<string> {
  let cursor: string | null = null;
  do {
    const page = await listUniverseEvents(
      universeId,
      cursor === null ? { limit: PAGE_SIZE } : { limit: PAGE_SIZE, cursor },
    );
    const created = page.events.find((event) => event.eventType === "created");
    if (created !== undefined) {
      return describeOrigin(toProvenance(created.filterProvenance));
    }
    cursor = page.nextCursor;
  } while (cursor !== null);
  throw new Error("the universe's history has no created event");
}

/** The America/Chicago calendar date of an instant (DEC-0103; the rule of `recorded_on`). */
const CHICAGO_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type OriginEntry =
  | { status: "loading" }
  | { status: "loaded"; text: string }
  | { status: "error"; sentence: string };

type Sort = "none" | "ascending" | "descending";

/**
 * The universes `data-table` `expandable` (UX design 1.3; classification-ui
 * 2.7; AC-3, DAC-E1-S7-4, DAC-E1-S7-5), in the pattern of the delivered
 * coverage table. Name sorts in the browser over the loaded rows (DEC-0101).
 * Expanding a row reads its origin once and keeps it while the table lives.
 */
export function UniverseTable({ universes }: { universes: UniverseSummary[] }): JSX.Element {
  const [sort, setSort] = useState<Sort>("none");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [origins, setOrigins] = useState<Record<string, OriginEntry>>({});
  function loadOrigin(universeId: string): void {
    setOrigins((cache) => ({ ...cache, [universeId]: { status: "loading" } }));
    readOrigin(universeId)
      .then((text) => {
        setOrigins((cache) => ({ ...cache, [universeId]: { status: "loaded", text } }));
      })
      .catch((caught: unknown) => {
        const sentence = failureSentence({
          operation: "list-universe-events",
          resource: "universe",
          code: caught instanceof ClassificationApiError ? caught.code : null,
        });
        setOrigins((cache) => ({ ...cache, [universeId]: { status: "error", sentence } }));
      });
  }

  function toggle(universeId: string): void {
    const opening = !expanded[universeId];
    setExpanded((state) => ({ ...state, [universeId]: opening }));
    if (opening && origins[universeId] === undefined) {
      loadOrigin(universeId);
    }
  }

  const rows =
    sort === "none"
      ? universes
      : [...universes].sort((left, right) => {
          const order = left.name.toLowerCase().localeCompare(right.name.toLowerCase());
          return sort === "ascending" ? order : -order;
        });

  return (
    <table data-variant="expandable" className="w-full text-sm">
      <thead>
        <tr>
          <th scope="col" aria-sort={sort} className="text-left text-muted-foreground">
            <button
              type="button"
              onClick={() => setSort(sort === "ascending" ? "descending" : "ascending")}
            >
              {UNIVERSES.columns.name}
            </button>
          </th>
          <th scope="col" className="text-left text-muted-foreground">
            {UNIVERSES.columns.lifecycle}
          </th>
          <th scope="col" className="text-right text-muted-foreground">
            {UNIVERSES.columns.members}
          </th>
          <th scope="col" className="text-right text-muted-foreground">
            {UNIVERSES.columns.created}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((universe) => (
          <UniverseRow
            key={universe.universeId}
            universe={universe}
            expanded={expanded[universe.universeId] === true}
            origin={origins[universe.universeId]}
            onToggle={() => toggle(universe.universeId)}
            onRetry={() => loadOrigin(universe.universeId)}
          />
        ))}
      </tbody>
    </table>
  );
}

/** The `secondary` *Retired* badge: text and a hollow square, never colour alone (STD-UI-8). */
function RetiredBadge(): JSX.Element {
  return (
    <span
      data-variant="secondary"
      className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        <rect
          x="1"
          y="1"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      {UNIVERSE_LIFECYCLE.retiredLabel}
    </span>
  );
}

function UniverseRow({
  universe,
  expanded,
  origin,
  onToggle,
  onRetry,
}: {
  universe: UniverseSummary;
  expanded: boolean;
  origin: OriginEntry | undefined;
  onToggle: () => void;
  onRetry: () => void;
}): JSX.Element {
  const detailId = useId();
  const retired = universe.lifecycle === "retired";
  return (
    <>
      <tr>
        <th scope="row" className={`text-left ${retired ? "text-muted-foreground" : ""}`}>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailId}
            aria-label={
              expanded
                ? UNIVERSES.hideDetailsFor(universe.name)
                : UNIVERSES.showDetailsFor(universe.name)
            }
            onClick={onToggle}
            className="mr-2 rounded px-1"
          >
            <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
          </button>
          <Link to={universeDetailPath(universe.universeId)} className="underline">
            {universe.name}
          </Link>
        </th>
        <td>{retired ? <RetiredBadge /> : null}</td>
        <td className="text-right font-numeric">{universe.memberCount}</td>
        <td className="text-right font-numeric">
          {CHICAGO_DATE.format(new Date(universe.createdAt))}
        </td>
      </tr>
      {expanded ? (
        <tr id={detailId}>
          <td colSpan={4}>
            <div aria-live="polite" className="flex flex-col gap-1">
              <p>{`${UNIVERSES.columns.created} ${formatTimestamp(universe.createdAt)}`}</p>
              {universe.retiredAt === null ? null : (
                <p>{`${UNIVERSE_LIFECYCLE.retiredLabel} ${formatTimestamp(universe.retiredAt)}`}</p>
              )}
              <OriginLine origin={origin} onRetry={onRetry} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function OriginLine({
  origin,
  onRetry,
}: {
  origin: OriginEntry | undefined;
  onRetry: () => void;
}): JSX.Element {
  if (origin?.status === "loaded") {
    return <p>{origin.text}</p>;
  }
  if (origin?.status === "error") {
    return (
      <div role="alert" className="flex flex-col gap-2" style={DESTRUCTIVE}>
        <p>{origin.sentence}</p>
        <button
          type="button"
          onClick={onRetry}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          {RESULTS.tryAgain}
        </button>
      </div>
    );
  }
  return <p>{UNIVERSES.loading}</p>;
}
