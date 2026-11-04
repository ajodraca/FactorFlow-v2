import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, listClassificationSets } from "../../api/classification-client";
import type { ClassificationSet, FactorName } from "../../api/classification-types";
import { StatusBadge, type StatusTier } from "../../components/patterns/status-badge";
import { CELL, RESULTS, SCORE_SET, SHELL_ROUTES, failureSentence } from "./copy";
import { DialogFrame } from "./dialog-frame";
import { formatDate, formatTimestamp } from "./format";

/**
 * The set history dialog behind **Earlier sets…** (AC-21; DAC-E4-S9-4; UX
 * design 1.2; classification-ui 2.6; DEC-0073, DEC-0078, DEC-0172). A
 * read-only list of every score set, newest first, with no confirm action: a
 * `table` of State, Scores date, Download, Started, Ended, the three factors'
 * qualified counts and the failure Reason. The host renders it while open and
 * unmounts it from `onClose`; `DialogFrame` moves focus in, traps Tab, closes
 * on Escape and gives focus back to the opener, so nothing here touches focus.
 *
 * It reads `listClassificationSets()` once on mount, bare (the API's default
 * page), and **Show more** appends the next keyset page; rows are de-duplicated
 * by `setId`; when the last page removes **Show more**, focus moves to
 * **Close**. A failed read is stated by code in an alert with **Try again**
 * (never the envelope's `message`), and a failed later page keeps the rows
 * already loaded. A download is named by its start time, linked to its detail,
 * never by a number or id (DEC-0083). Every string is from `copy.ts`.
 */

type Load = "loading" | "loaded" | "failed";

const SET_TIER: Record<ClassificationSet["state"], { tier: StatusTier; word: string }> = {
  complete: { tier: "good", word: SCORE_SET.complete },
  building: { tier: "active", word: SCORE_SET.updating },
  failed: { tier: "critical", word: SCORE_SET.failed },
};

const OUTCOME_TIER: Record<ClassificationSet["runOutcome"], { tier: StatusTier; word: string }> = {
  succeeded: { tier: "good", word: SCORE_SET.complete },
  partial: { tier: "warning", word: SCORE_SET.partial },
};

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

const CELL_CLASS = "px-2 py-1 text-left align-top text-sm";
const HEAD_CLASS = "px-2 py-1 text-left text-xs text-muted-foreground";

/** A qualified count, with *Not enough to rank* in text after an unranked factor's number. */
function qualified(set: ClassificationSet, factor: FactorName): string {
  const summary = set.factors[factor];
  return summary.ranked
    ? String(summary.qualifiedCount)
    : `${summary.qualifiedCount} ${CELL.notEnoughToRank}`;
}

function HistoryRow({ set }: { set: ClassificationSet }): JSX.Element {
  const state = SET_TIER[set.state];
  const outcome = OUTCOME_TIER[set.runOutcome];
  const downloadStarted = formatTimestamp(set.runStartedAt);
  return (
    <tr className="border-t border-border">
      <td className={CELL_CLASS}>
        <StatusBadge tier={state.tier}>{state.word}</StatusBadge>
      </td>
      <td className={`${CELL_CLASS} font-numeric`}>{formatDate(set.classificationDate)}</td>
      <td className={CELL_CLASS}>
        <Link
          to={SHELL_ROUTES.download(set.runId)}
          aria-label={SCORE_SET.openDownload(downloadStarted)}
          className="font-numeric underline"
        >
          {downloadStarted}
        </Link>{" "}
        <StatusBadge tier={outcome.tier}>{outcome.word}</StatusBadge>
      </td>
      <td className={`${CELL_CLASS} font-numeric`}>{formatTimestamp(set.startedAt)}</td>
      <td className={`${CELL_CLASS} font-numeric`}>
        {set.state === "building" || set.endedAt === null ? null : formatTimestamp(set.endedAt)}
      </td>
      {FACTORS.map((factor) => (
        <td key={factor} className={`${CELL_CLASS} font-numeric`}>
          {qualified(set, factor)}
        </td>
      ))}
      <td className={CELL_CLASS}>{set.failureReason}</td>
    </tr>
  );
}

/** The dialog; `onClose` is called by **Close** and by Escape. */
export function SetHistoryDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [sets, setSets] = useState<ClassificationSet[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [pageFailed, setPageFailed] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const read = useCallback(async (cursor: string | null): Promise<void> => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    try {
      const page = await (cursor === null
        ? listClassificationSets()
        : listClassificationSets({ cursor }));
      if (!mountedRef.current) {
        return;
      }
      setSets((current) => {
        const known = new Set(current.map((set) => set.setId));
        return [...current, ...page.sets.filter((set) => !known.has(set.setId))];
      });
      // The last page removes **Show more**; focus moves to **Close** rather than to the page.
      if (page.nextCursor === null && document.activeElement === moreRef.current) {
        closeRef.current?.focus();
      }
      setNextCursor(page.nextCursor);
      setPageFailed(false);
      setLoad("loaded");
    } catch (cause) {
      if (!mountedRef.current) {
        return;
      }
      setFailure(cause);
      if (cursor === null) {
        setLoad("failed");
      } else {
        setPageFailed(true);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void read(null);
    return () => {
      mountedRef.current = false;
    };
  }, [read]);

  const sentence = failureSentence({
    operation: "list-classification-sets",
    resource: "classification-set",
    code: errorCode(failure),
  });

  return (
    <DialogFrame
      title={SCORE_SET.earlierSetsTitle}
      initialFocusRef={closeRef}
      onCancel={onClose}
      busy={load === "loading"}
    >
      {load === "loading" ? (
        <output
          aria-live="polite"
          className="block h-20 w-full animate-pulse rounded bg-secondary"
        />
      ) : null}
      {load === "failed" ? (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm">
            {sentence}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoad("loading");
              void read(null);
            }}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            {RESULTS.tryAgain}
          </button>
        </div>
      ) : null}
      {load === "loaded" ? (
        <div className="max-h-[60vh] overflow-auto">
          <table data-variant="history" className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.state}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.scoresDate}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.download}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.started}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.ended}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.valueQualified}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.growthQualified}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.momentumQualified}
                </th>
                <th scope="col" className={HEAD_CLASS}>
                  {SCORE_SET.historyColumns.reason}
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
      ) : null}
      {pageFailed ? (
        <p role="alert" className="text-sm">
          {sentence}
        </p>
      ) : null}
      <div className="flex gap-2">
        {nextCursor !== null && load === "loaded" ? (
          <button
            ref={moreRef}
            type="button"
            onClick={() => void read(nextCursor)}
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          >
            {SCORE_SET.showMore}
          </button>
        ) : null}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          {SCORE_SET.close}
        </button>
      </div>
    </DialogFrame>
  );
}

/** The envelope code of a failed read, or `null` for a network or unexpected failure. */
function errorCode(cause: unknown): string | null {
  return cause instanceof ClassificationApiError ? cause.code : null;
}
