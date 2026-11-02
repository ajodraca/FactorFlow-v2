import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, listClassificationSets } from "../../api/classification-client";
import type {
  ClassificationSet,
  ClassificationSetPage,
  FactorName,
  RunOutcome,
} from "../../api/classification-types";
import { StatusBadge, type StatusTier } from "../../components/patterns/status-badge";
import { CELL, RESULTS, SCORE_SET, SHELL_ROUTES, UNIVERSES, failureSentence } from "./copy";
import { DialogFrame } from "./dialog-frame";
import { formatDate, formatTimestamp } from "./format";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/** A set's state as the history's `badge` (UX design 1.2: good, active, critical). */
const STATE_BADGE: Record<ClassificationSet["state"], { tier: StatusTier; word: string }> = {
  complete: { tier: "good", word: SCORE_SET.complete },
  building: { tier: "active", word: SCORE_SET.updating },
  failed: { tier: "critical", word: SCORE_SET.failed },
};

/** The download's outcome after its start time, as the as-of line shows it (UX design 1.2). */
const OUTCOME_BADGE: Record<RunOutcome, { tier: StatusTier; word: string }> = {
  succeeded: { tier: "good", word: SCORE_SET.complete },
  partial: { tier: "warning", word: SCORE_SET.partial },
};

/** The delivered button size and border (`screens/instruments/start-action.tsx`). */
const BUTTON = "w-fit rounded border border-border px-3 py-2 text-sm";

const QUALIFIED_KEY: Record<FactorName, keyof typeof SCORE_SET.historyColumns> = {
  value: "valueQualified",
  growth: "growthQualified",
  momentum: "momentumQualified",
};

/** The STD-UI-19 sentence for a failed sets read: by code, never by message. */
function sentenceFor(cause: unknown): string {
  return cause instanceof ClassificationApiError
    ? failureSentence(cause)
    : failureSentence({
        operation: "list-classification-sets",
        resource: "classification-set",
        code: null,
      });
}

/** `incoming` after `existing`, dropping any set already listed. */
function appendNew(
  existing: ClassificationSet[],
  incoming: ClassificationSet[],
): ClassificationSet[] {
  const known = new Set(existing.map((set) => set.setId));
  return [...existing, ...incoming.filter((set) => !known.has(set.setId))];
}

type Status = "loading" | "loaded" | "failed";

/**
 * **Earlier sets…**'s dialog (UX design 1.2; classification-ui 2.6; AC-21,
 * DAC-E4-S9-4; DEC-0073, DEC-0078, DEC-0172, DEC-0273): a `dialog`
 * `standard` titled *Earlier sets* over a `data-table` `history` of every
 * set, newest first as the API returns them, keyset paged by **Show more**.
 *
 * The host renders it while open and unmounts it on `onClose`. The frame is
 * CAP-002-E4-S8's `DialogFrame`: initial focus on **Close**, Escape and
 * **Close** call `onClose`, Tab stays inside, and focus returns to whatever
 * opened it (**Earlier sets…**) when it unmounts, so nothing here touches
 * focus. There is no confirm action.
 *
 * Each row: the set's state badge, its scores date, the download named by its
 * start time and linked to its detail with its outcome badge (never a number
 * or raw id, DEC-0083), started, ended (blank while building), the three
 * qualified counts (*Not enough to rank* after an unranked one) and the
 * recorded reason as text. Badges are S4's `StatusBadge` (DEC-0273). A failed
 * read shows its `failureSentence` in an alert with **Try again**; a failed
 * next page keeps the rows already shown.
 */
export function SetHistoryDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const [status, setStatus] = useState<Status>("loading");
  const [sets, setSets] = useState<ClassificationSet[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  /** The cursor whose page failed, so Try again reads that page; `null` for the first page. */
  const [failedCursor, setFailedCursor] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const read = useCallback((cursor: string | null): void => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    setFailure(null);
    if (cursor === null) {
      setStatus("loading");
    }
    const request: Promise<ClassificationSetPage> =
      cursor === null ? listClassificationSets() : listClassificationSets({ cursor });
    request.then(
      (page) => {
        inFlightRef.current = false;
        if (!mountedRef.current) {
          return;
        }
        setSets((existing) => appendNew(existing, page.sets));
        setNextCursor(page.nextCursor);
        setStatus("loaded");
      },
      (cause: unknown) => {
        inFlightRef.current = false;
        if (!mountedRef.current) {
          return;
        }
        setFailedCursor(cursor);
        setFailure(sentenceFor(cause));
        setStatus((current) => (cursor === null ? "failed" : current));
      },
    );
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    read(null);
    return () => {
      mountedRef.current = false;
    };
  }, [read]);

  // A control that held focus can leave: Show more after the last page or on a
  // failure, Try again once activated. Focus then falls out of the dialog, where
  // the frame's Escape and Tab handling no longer reach it, so it goes to
  // Close, the one control that always stays (STD-UI-24: dialogs manage focus).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-checked whenever the controls change.
  useEffect(() => {
    const dialog = closeRef.current?.closest("dialog");
    if (dialog && !dialog.contains(document.activeElement)) {
      closeRef.current?.focus();
    }
  }, [status, nextCursor, failure]);

  return (
    <DialogFrame
      title={SCORE_SET.earlierSetsTitle}
      initialFocusRef={closeRef}
      onCancel={onClose}
      busy={status === "loading"}
    >
      {status === "loading" ? (
        // An `output` carries `role="status"` implicitly (as `as-of-line.tsx`).
        <output aria-busy="true" className="block h-8 w-full animate-pulse rounded bg-secondary">
          <span className="sr-only">{UNIVERSES.loading}</span>
        </output>
      ) : null}
      {status === "loaded" ? <HistoryTable sets={sets} /> : null}
      {failure !== null ? (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm">
            {failure}
          </p>
          <button type="button" onClick={() => read(failedCursor)} className={BUTTON}>
            {RESULTS.tryAgain}
          </button>
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        {status === "loaded" && nextCursor !== null && failure === null ? (
          <button type="button" onClick={() => read(nextCursor)} className={BUTTON}>
            {SCORE_SET.showMore}
          </button>
        ) : null}
        <button type="button" ref={closeRef} onClick={onClose} className={BUTTON}>
          {SCORE_SET.close}
        </button>
      </div>
    </DialogFrame>
  );
}

function HistoryTable({ sets }: { sets: ClassificationSet[] }): JSX.Element {
  const columns = SCORE_SET.historyColumns;
  return (
    <div className="overflow-auto">
      <table data-variant="history" className="text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th scope="col" className="px-2 py-1">
              {columns.state}
            </th>
            <th scope="col" className="px-2 py-1">
              {columns.scoresDate}
            </th>
            <th scope="col" className="px-2 py-1">
              {columns.download}
            </th>
            <th scope="col" className="px-2 py-1">
              {columns.started}
            </th>
            <th scope="col" className="px-2 py-1">
              {columns.ended}
            </th>
            {FACTORS.map((factor) => (
              <th key={factor} scope="col" className="px-2 py-1 text-right">
                {columns[QUALIFIED_KEY[factor]]}
              </th>
            ))}
            <th scope="col" className="px-2 py-1">
              {columns.reason}
            </th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <HistoryRow key={set.setId} set={set} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryRow({ set }: { set: ClassificationSet }): JSX.Element {
  const state = STATE_BADGE[set.state];
  const outcome = OUTCOME_BADGE[set.runOutcome];
  const downloadStarted = formatTimestamp(set.runStartedAt);
  return (
    <tr className="border-b border-border">
      <td className="px-2 py-1">
        <StatusBadge tier={state.tier}>{state.word}</StatusBadge>
      </td>
      <td className="px-2 py-1 font-numeric">{formatDate(set.classificationDate)}</td>
      <td className="px-2 py-1">
        <span className="inline-flex items-center gap-2">
          <Link
            to={SHELL_ROUTES.download(set.runId)}
            aria-label={SCORE_SET.openDownload(downloadStarted)}
            className="font-numeric underline"
          >
            {downloadStarted}
          </Link>
          <StatusBadge tier={outcome.tier}>{outcome.word}</StatusBadge>
        </span>
      </td>
      <td className="px-2 py-1 font-numeric">{formatTimestamp(set.startedAt)}</td>
      <td className="px-2 py-1 font-numeric">
        {set.state === "building" || set.endedAt === null ? "" : formatTimestamp(set.endedAt)}
      </td>
      {FACTORS.map((factor) => {
        const summary = set.factors[factor];
        return (
          <td key={factor} className="px-2 py-1 text-right font-numeric">
            {summary.ranked
              ? `${summary.qualifiedCount}`
              : `${summary.qualifiedCount} ${CELL.notEnoughToRank}`}
          </td>
        );
      })}
      <td className="px-2 py-1">{set.failureReason ?? ""}</td>
    </tr>
  );
}
