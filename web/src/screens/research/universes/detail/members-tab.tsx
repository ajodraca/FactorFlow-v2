import {
  type FormEvent,
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ClassificationApiError,
  getUniverse,
  removeUniverseMember,
} from "../../../../api/classification-client";
import type {
  FactorName,
  Lifecycle,
  StockRow,
  UniverseDetail,
  UniverseMember,
} from "../../../../api/classification-types";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../../../api/research-query";
import { FactorCell } from "../../../../components/patterns/factor-cell";
import {
  CELL,
  FACTOR_LABELS,
  FILTERS,
  REGIONS,
  RESULTS,
  UNIVERSES,
  UNIVERSE_DETAIL,
  failureSentence,
} from "../../copy";
import { FiltersPane } from "../../filters-pane";
import { formatTimestamp } from "../../format";
import {
  type EmptyKind,
  type ExtraColumn,
  type FirstPage,
  ResultsTable,
} from "../../results-table";
import { useResearchQuery } from "../../use-research-query";
import { RemoveAction, RemoveDialog, type RemoveError } from "./remove-dialog";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** `YYYY-MM-DD`, checked as a real calendar date before any request (UX design 1.4). */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The America/Chicago calendar date of an instant (DEC-0105; the rule of `recorded_on`, DEC-0065). */
const CHICAGO_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function isCalendarDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (match === null) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** An absent value: the em dash in `--value-missing` (UX design section 0; STD-UI-4; DEC-0105). */
function Missing(): JSX.Element {
  return <span className="text-value-missing">{CELL.absentValue}</span>;
}

function isValidationError(error: unknown): boolean {
  return error instanceof ClassificationApiError && error.code === "validation_error";
}

function removeErrorFor(error: unknown): RemoveError | "not_a_member" {
  const code = error instanceof ClassificationApiError ? error.code : null;
  if (code === "last_member" || code === "universe_retired" || code === "not_a_member") {
    return code;
  }
  return "generic";
}

type AsOfRead =
  | { kind: "loading" }
  | { kind: "loaded"; detail: UniverseDetail }
  | { kind: "error"; error: unknown };

interface Removal {
  symbol: string;
  pending: boolean;
  error: RemoveError | null;
}

export interface MembersTabProps {
  universeId: string;
  universeName: string;
  lifecycle: Lifecycle;
  memberCount: number;
  /** The `as_of` date, controlled by the host and kept in its URL; `null` is the current members. */
  asOf: string | null;
  onAsOfChange: (asOf: string | null) => void;
  /** Called after each removal, so the host re-reads its header and count. */
  onMembershipChanged: () => void;
  /** Opens the host's retire dialog. */
  onRetire: () => void;
}

/**
 * A universe's Members panel (UX design 1.4; classification-ui 2.5;
 * DAC-E1-S8-1 to DAC-E1-S8-5). The Filters pane without *Look in*, holding
 * the *Members as of* field, beside the Results section.
 *
 * With no `asOf` the table is the Research results table on the list read
 * scoped to the universe, with *Member since* after Name (joined by symbol
 * from the universe read) and **Remove…** last; the filter, search and sort
 * live in the URL as on Research. A member no longer followed is a row like
 * any other, *Not followed* on every factor (AC-15).
 *
 * With `asOf` the universe read is the only one that takes the date, so its
 * members are shown in one native table, in the order returned, unfiltered
 * and unsorted, under a polite line saying so; a date before creation states
 * the creation date instead (DEC-0105). A member without cells or a name
 * shows the em dash. No **Remove…** is offered there.
 */
export function MembersTab({
  universeId,
  universeName,
  lifecycle,
  memberCount,
  asOf,
  onAsOfChange,
  onMembershipChanged,
  onRetire,
}: MembersTabProps): JSX.Element {
  const { query, setQuery } = useResearchQuery();
  const scopedQuery = useMemo(() => ({ ...query, scope: universeId }), [query, universeId]);
  const onQueryChange = useCallback(
    (next: ResearchQuery): void => setQuery({ ...next, scope: query.scope }),
    [query.scope, setQuery],
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<ReadonlyMap<string, string>>(new Map());
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [notice, setNotice] = useState("");
  /**
   * Where focus goes once the dialog has closed on a removal: the row after
   * the removed one, which takes its place, or the heading when it was last.
   */
  const [focusAfterRemoval, setFocusAfterRemoval] = useState<{ symbol: string | null } | null>(
    null,
  );
  const resultsRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [draft, setDraft] = useState(asOf ?? "");
  const [fieldError, setFieldError] = useState(false);
  const [asOfRead, setAsOfRead] = useState<AsOfRead>({ kind: "loading" });
  /** The last as-of result shown, kept under a `422` field error. */
  const [lastAsOf, setLastAsOf] = useState<UniverseDetail | null>(null);
  const [asOfAttempt, setAsOfAttempt] = useState(0);
  const fieldId = useId();
  const fieldErrorId = useId();

  useEffect(() => {
    setDraft(asOf ?? "");
    setFieldError(false);
  }, [asOf]);

  // Member since for the current view: one universe read, again after each removal.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is the re-read trigger.
  useEffect(() => {
    if (asOf !== null) {
      return;
    }
    let cancelled = false;
    getUniverse(universeId)
      .then((detail) => {
        if (!cancelled) {
          setMemberSince(
            new Map(detail.members.map((member) => [member.symbol, member.memberSince])),
          );
        }
      })
      .catch(() => {
        // Member since stays the em dash; the table's own read reports failures.
      });
    return () => {
      cancelled = true;
    };
  }, [universeId, asOf, refreshKey]);

  // The as-of view: the universe read with the date (DEC-0105).
  // biome-ignore lint/correctness/useExhaustiveDependencies: asOfAttempt is the Try again trigger.
  useEffect(() => {
    if (asOf === null) {
      return;
    }
    let cancelled = false;
    setAsOfRead({ kind: "loading" });
    setMatchCount(null);
    getUniverse(universeId, { asOf })
      .then((detail) => {
        if (!cancelled) {
          setAsOfRead({ kind: "loaded", detail });
          setLastAsOf(detail);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        if (isValidationError(error)) {
          setFieldError(true);
        }
        setAsOfRead({ kind: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, [universeId, asOf, asOfAttempt]);

  // A kept as-of result belongs to one universe.
  // biome-ignore lint/correctness/useExhaustiveDependencies: universeId is the reset trigger.
  useEffect(() => {
    setLastAsOf(null);
  }, [universeId]);

  // After a removal the row that takes the removed row's place, else the
  // heading, takes focus. This runs after the dialog's unmount has returned
  // focus to the removed row's Remove…, and before the list is read again:
  // the results table keeps a focused row it still holds in its window, so
  // the row keeps its place and focus when the re-read rows arrive.
  useEffect(() => {
    if (focusAfterRemoval === null) {
      return;
    }
    setFocusAfterRemoval(null);
    const { symbol } = focusAfterRemoval;
    const next =
      symbol === null
        ? null
        : resultsRef.current?.querySelector<HTMLElement>(`tr[data-symbol="${CSS.escape(symbol)}"]`);
    (next ?? headingRef.current)?.focus();
  }, [focusAfterRemoval]);

  const onResult = useCallback((page: FirstPage): void => {
    setMatchCount(page.matchCount);
  }, []);

  function submitAsOf(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const value = draft.trim();
    if (value === "") {
      setFieldError(false);
      return;
    }
    if (!isCalendarDate(value)) {
      setFieldError(true);
      return;
    }
    setFieldError(false);
    onAsOfChange(value);
  }

  function openRemoval(symbol: string): void {
    setRemoval({ symbol, pending: false, error: null });
  }

  /** The symbol of the loaded row after `symbol`'s, or null when it is the last. */
  function nextRowSymbol(symbol: string): string | null {
    const rowElement = resultsRef.current?.querySelector<HTMLElement>(
      `tr[data-symbol="${CSS.escape(symbol)}"]`,
    );
    const next = rowElement?.nextElementSibling;
    return next instanceof HTMLElement ? (next.dataset.symbol ?? null) : null;
  }

  function removed(current: Removal, message: string): void {
    setFocusAfterRemoval({ symbol: nextRowSymbol(current.symbol) });
    setRemoval(null);
    setNotice(message);
    setRefreshKey((key) => key + 1);
    onMembershipChanged();
  }

  function confirmRemoval(): void {
    if (removal === null || removal.pending) {
      return;
    }
    const current = removal;
    setRemoval({ ...current, pending: true, error: null });
    removeUniverseMember(universeId, current.symbol)
      .then(() => removed(current, UNIVERSE_DETAIL.removed(current.symbol, universeName)))
      .catch((error: unknown) => {
        const code = removeErrorFor(error);
        if (code === "not_a_member") {
          removed(current, UNIVERSE_DETAIL.noLongerMember(current.symbol, universeName));
          return;
        }
        setRemoval({ ...current, pending: false, error: code });
      });
  }

  const extraColumns: ExtraColumn[] = [
    {
      id: "memberSince",
      header: UNIVERSE_DETAIL.memberSince,
      placement: "afterName",
      cell: (row: StockRow) => {
        const since = memberSince.get(row.symbol);
        return since === undefined ? (
          <Missing />
        ) : (
          <span className="text-xs">{formatTimestamp(since)}</span>
        );
      },
    },
  ];
  if (lifecycle === "active") {
    extraColumns.push({
      id: "remove",
      header: "",
      placement: "end",
      cell: (row: StockRow) => (
        <RemoveAction
          symbol={row.symbol}
          universeName={universeName}
          soleMember={memberCount === 1}
          onRemove={() => openRemoval(row.symbol)}
          onRetire={onRetire}
        />
      ),
    });
  }

  const empty = (kind: EmptyKind): ReactNode =>
    kind === "never-populated" ? (
      <p className="text-sm">{RESULTS.neverScored}</p>
    ) : (
      <p className="flex items-center gap-2 text-sm">
        {RESULTS.noMembersMatch}
        <button
          type="button"
          onClick={() =>
            setQuery({ ...DEFAULT_RESEARCH_QUERY, sort: query.sort, scope: query.scope })
          }
          className="rounded px-3 py-2 text-sm"
        >
          {FILTERS.clearFilters}
        </button>
      </p>
    );

  const asOfForm = (
    <form onSubmit={submitAsOf} data-variant="inline" className="flex flex-col gap-2 py-3">
      <label htmlFor={fieldId} className="text-sm">
        {UNIVERSE_DETAIL.membersAsOf}
      </label>
      <input
        id={fieldId}
        type="text"
        value={draft}
        placeholder="YYYY-MM-DD"
        aria-invalid={fieldError ? "true" : undefined}
        aria-describedby={fieldError ? fieldErrorId : undefined}
        onChange={(event) => setDraft(event.target.value)}
        className="rounded border border-input p-2 font-numeric"
      />
      {fieldError ? (
        <p id={fieldErrorId} role="alert" className="text-[hsl(var(--destructive))] text-sm">
          {UNIVERSE_DETAIL.malformedDate}
        </p>
      ) : null}
    </form>
  );

  function asOfBody(): ReactNode {
    if (asOfRead.kind === "error" && !isValidationError(asOfRead.error)) {
      return (
        <div className="flex flex-col gap-2 text-sm">
          <p>
            {asOfRead.error instanceof ClassificationApiError
              ? failureSentence(asOfRead.error)
              : failureSentence({ operation: "get-universe", resource: "universe", code: null })}
          </p>
          <button
            type="button"
            onClick={() => setAsOfAttempt((count) => count + 1)}
            className="w-fit rounded border border-border px-3 py-2"
          >
            {RESULTS.tryAgain}
          </button>
        </div>
      );
    }
    if (asOfRead.kind === "loading") {
      return (
        <output aria-busy="true" className="text-sm">
          {UNIVERSES.loading}
        </output>
      );
    }
    // Under a `422` field error the last result shown stays (T002 c).
    const detail = asOfRead.kind === "loaded" ? asOfRead.detail : lastAsOf;
    if (detail === null) {
      return null;
    }
    return <AsOfMembers detail={detail} />;
  }

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <FiltersPane showLookIn={false}>{asOfForm}</FiltersPane>
      <section
        ref={resultsRef}
        aria-label={REGIONS.results}
        className="flex min-w-0 flex-1 flex-col gap-3"
      >
        {asOf === null ? (
          <>
            {matchCount === null ? null : (
              <h2 ref={headingRef} tabIndex={-1} className="text-lg">
                {RESULTS.membersMatch(matchCount, memberCount)}
              </h2>
            )}
            <output aria-live="polite" className="text-sm">
              {notice}
            </output>
            <ResultsTable
              query={scopedQuery}
              onQueryChange={onQueryChange}
              refreshKey={refreshKey}
              selected={selected}
              onSelect={setSelected}
              onInspect={() => {}}
              checked={checked}
              onCheckedChange={setChecked}
              onResult={onResult}
              empty={empty}
              matchLabel={(count) => RESULTS.membersMatch(count, memberCount)}
              extraColumns={extraColumns}
            />
          </>
        ) : (
          <>
            {asOfBody()}
            <button
              type="button"
              data-variant="ghost"
              onClick={() => onAsOfChange(null)}
              className="w-fit rounded px-3 py-2 text-sm"
            >
              {UNIVERSE_DETAIL.showCurrentMembers}
            </button>
          </>
        )}
      </section>
      {removal !== null ? (
        <RemoveDialog
          symbol={removal.symbol}
          universeName={universeName}
          error={removal.error}
          pending={removal.pending}
          onConfirm={confirmRemoval}
          onCancel={() => {
            if (!removal.pending) {
              setRemoval(null);
            }
          }}
          onRetire={() => {
            setRemoval(null);
            onRetire();
          }}
        />
      ) : null}
    </div>
  );
}

/** One past date's membership as the universe read returns it (DEC-0105). */
function AsOfMembers({ detail }: { detail: UniverseDetail }): JSX.Element {
  const date = detail.asOf;
  if (detail.asOfBeforeCreation) {
    return (
      <output aria-live="polite" className="text-sm">
        {UNIVERSE_DETAIL.didNotExist(
          detail.name,
          date,
          CHICAGO_DATE.format(new Date(detail.createdAt)),
        )}
      </output>
    );
  }
  return (
    <>
      <output aria-live="polite" className="text-sm">
        {`${UNIVERSE_DETAIL.membersAsOfLine(date)} ${UNIVERSE_DETAIL.asOfFiltersNote}`}
      </output>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th scope="col" className="text-left">
              {RESULTS.columns.symbol}
            </th>
            <th scope="col" className="text-left">
              {RESULTS.columns.name}
            </th>
            <th scope="col" className="text-left">
              {UNIVERSE_DETAIL.memberSince}
            </th>
            {FACTORS.map((factor) => (
              <th key={factor} scope="col" className="text-right">
                {FACTOR_LABELS[factor]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detail.members.map((member) => (
            <AsOfRow key={member.symbol} member={member} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function AsOfRow({ member }: { member: UniverseMember }): JSX.Element {
  const factors = member.factors;
  return (
    <tr className="h-row border-t border-border">
      <th scope="row" className="text-left font-numeric">
        {member.symbol}
      </th>
      <td className="truncate">{member.name === null ? <Missing /> : member.name}</td>
      <td className="text-xs">{formatTimestamp(member.memberSince)}</td>
      {FACTORS.map((factor) => (
        <td key={factor} className="text-right">
          {factors === null ? <Missing /> : <FactorCell cell={factors[factor]} factor={factor} />}
        </td>
      ))}
    </tr>
  );
}
