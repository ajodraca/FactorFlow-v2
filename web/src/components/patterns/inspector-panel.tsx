import { Fragment, type JSX, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClassificationApiError, getStockEvidence } from "../../api/classification-client";
import type {
  FactorCell as FactorCellData,
  FactorName,
  InputRow,
  Membership,
  ReasonCode,
  StockEvidence,
} from "../../api/classification-types";
import {
  CELL,
  FACTOR_LABELS,
  type IncompleteReasonCode,
  REGIONS,
  RESULTS,
  SELECTION,
  failureSentence,
} from "../../screens/research/copy";
import { formatDate } from "../../screens/research/format";
import { FactorCell } from "./factor-cell";

/**
 * How long a selection must settle before the inspector reads it
 * (classification-ui section 2.5; DAC-E4-S7-2). The inspector owns this one
 * wait (DEC-0164).
 */
export const INSPECT_DEBOUNCE_MS = 150;

/** The (symbol, attempt) a read was issued for; a settled read carries it. */
interface ReadKey {
  symbol: string;
  attempt: number;
}

type InspectorState =
  | { kind: "idle" }
  | { kind: "loading" }
  | ({ kind: "loaded"; evidence: StockEvidence } & ReadKey)
  | ({ kind: "failed"; sentence: string } & ReadKey);

const IDLE: InspectorState = { kind: "idle" };
const LOADING: InspectorState = { kind: "loading" };

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

/**
 * Each factor's identity swatch, the `--factor-*` token as an inline style
 * because the Tailwind config maps no `factor` colour (UX design 1.1 item 3;
 * DEC-0166). Full literal strings, never assembled.
 */
const SWATCH: Record<FactorName, string> = {
  value: "hsl(var(--factor-value))",
  growth: "hsl(var(--factor-growth))",
  momentum: "hsl(var(--factor-momentum))",
};

/** The delivered button size and border (`screens/instruments/start-action.tsx`). */
const BUTTON = "w-fit rounded border border-border px-3 py-2 text-sm";

/**
 * The STD-UI-19 sentence for a failed read, built by `copy.ts` from the
 * error's code alone, never from its `message` (classification-ui 2.4). A
 * failure that is not an API refusal, a network error say, takes the
 * operation's generic sentence.
 */
function failureOf(cause: unknown): string {
  return cause instanceof ClassificationApiError
    ? failureSentence(cause)
    : failureSentence({ operation: "get-stock-evidence", resource: "classification", code: null });
}

/**
 * One factor's inputs line (DEC-0165): its inputs with an `asOf`, grouped by
 * identical `(asOf, knownOn)` in the order first seen, one clause per group
 * joined by `; `, a group with no `knownOn` printing no *known*. `null` when
 * no input of the factor is dated. Only `label` is printed, never the wire's
 * `inputName` or `detail` (STD-UI-1).
 */
function inputsLine(inputs: readonly InputRow[], factor: FactorName): string | null {
  const groups: { asOf: string; knownOn: string | null; labels: string[] }[] = [];
  for (const row of inputs) {
    if (row.factor !== factor || row.asOf === null) {
      continue;
    }
    const group = groups.find(
      (candidate) => candidate.asOf === row.asOf && candidate.knownOn === row.knownOn,
    );
    if (group === undefined) {
      groups.push({ asOf: row.asOf, knownOn: row.knownOn, labels: [row.label] });
    } else {
      group.labels.push(row.label);
    }
  }
  if (groups.length === 0) {
    return null;
  }
  return groups
    .map(({ asOf, knownOn, labels }) =>
      knownOn === null
        ? SELECTION.inputsLineAsOf(labels, formatDate(asOf))
        : SELECTION.inputsLine(labels, formatDate(asOf), formatDate(knownOn)),
    )
    .join(SELECTION.inputsLineSeparator);
}

function isIncompleteReason(code: ReasonCode | null): code is IncompleteReasonCode {
  return code !== null && Object.hasOwn(CELL.incompleteStatus, code);
}

/** Whether `FactorCell` draws this cell scored, the state its choice of rendering ends on (DEC-0151). */
function isScored(cell: FactorCellData): boolean {
  return (
    cell.reasonCode !== "retired" &&
    cell.reasonCode !== "not_enough_stocks" &&
    cell.status === "classified" &&
    cell.percentile !== null
  );
}

/**
 * An incomplete factor's sentence, the one `FactorCell` puts in its
 * *Incomplete* badge's `title` (DEC-0151): from `reasonDetail`, else from the
 * input reason code. `null` for a cell `FactorCell` does not draw
 * *Incomplete*, and for one that names no cause (DEC-0229, DEC-0247).
 */
function incompleteSentence(cell: FactorCellData, factor: FactorName): string | null {
  if (cell.reasonCode === "retired" || cell.reasonCode === "not_enough_stocks" || isScored(cell)) {
    return null;
  }
  if (cell.reasonDetail !== null) {
    return CELL.incompleteDetail(cell.reasonDetail, factor);
  }
  return isIncompleteReason(cell.reasonCode)
    ? CELL.incompleteGeneric(cell.reasonCode, factor)
    : null;
}

/** Whether `FactorCell` draws the *Possibly restated* mark: a scored value or growth cell that carries it (DEC-0247). */
function showsMark(cell: FactorCellData | undefined, factor: FactorName): boolean {
  return cell !== undefined && factor !== "momentum" && cell.restatedPossible && isScored(cell);
}

/**
 * The explanation box's sentences, in the order incomplete factors, not
 * followed, restated; the box opens whenever there is one (DEC-0247).
 */
function explanations(evidence: StockEvidence): string[] {
  const sentences = FACTORS.flatMap((factor) => {
    const cell = evidence.factors[factor];
    const sentence = cell === undefined ? null : incompleteSentence(cell, factor);
    return sentence === null ? [] : [sentence];
  });
  if (evidence.lifecycle === "retired") {
    sentences.push(CELL.notFollowedNoDate);
  }
  if (FACTORS.some((factor) => showsMark(evidence.factors[factor], factor))) {
    sentences.push(CELL.restatedExplanation);
  }
  return sentences;
}

/** The `badge` `status-neutral` *Not followed*, a word plus a shape, as `FactorCell` draws it (DEC-0073). */
function NotFollowedBadge(): JSX.Element {
  return (
    <span
      data-variant="status-neutral"
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-status-neutral-muted text-status-neutral"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {CELL.notFollowed}
    </span>
  );
}

/** *In Tech and Dividend growers*, each name a link to its universe, or *In no universe* (DEC-0071). */
function MembershipsLine({ memberships }: { memberships: readonly Membership[] }): JSX.Element {
  return (
    <p data-testid="memberships" className="text-sm">
      {memberships.length === 0 ? (
        SELECTION.inNoUniverse
      ) : (
        <>
          {SELECTION.inUniversesLead}
          {memberships.map((membership, index) => (
            <Fragment key={membership.universeId}>
              {index === 0
                ? null
                : index === memberships.length - 1
                  ? SELECTION.listAnd
                  : SELECTION.listComma}
              <Link
                to={`/research/universes/${encodeURIComponent(membership.universeId)}`}
                className="underline"
              >
                {membership.name}
              </Link>
            </Fragment>
          ))}
        </>
      )}
    </p>
  );
}

function FactorBlock({
  evidence,
  factor,
}: { evidence: StockEvidence; factor: FactorName }): JSX.Element {
  const cell = evidence.factors[factor];
  const line = inputsLine(evidence.inputs, factor);
  return (
    <div className="flex flex-col gap-1">
      <dt className="flex items-center gap-2 text-sm">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded"
          style={{ backgroundColor: SWATCH[factor] }}
        />
        {FACTOR_LABELS[factor]}
      </dt>
      <dd>
        {cell === undefined ? (
          CELL.absentValue
        ) : (
          <FactorCell cell={cell} factor={factor} showScore />
        )}
      </dd>
      {line === null ? null : (
        <dd data-testid="inputs-line" className="text-xs">
          {line}
        </dd>
      )}
    </div>
  );
}

/** The loaded inspector, top to bottom as UX design 1.1 orders it. */
function Loaded({ evidence }: { evidence: StockEvidence }): JSX.Element {
  const sentences = explanations(evidence);
  return (
    <>
      <div>
        <p className="flex items-center gap-2">
          <span className="font-numeric text-xl">{evidence.symbol}</span>
          {evidence.lifecycle === "retired" ? <NotFollowedBadge /> : null}
        </p>
        <p className="text-sm">{evidence.name}</p>
      </div>
      <MembershipsLine memberships={evidence.memberships} />
      <dl className="flex flex-col gap-3">
        {FACTORS.map((factor) => (
          <FactorBlock key={factor} evidence={evidence} factor={factor} />
        ))}
      </dl>
      {sentences.length === 0 ? null : (
        <div
          data-testid="explanation"
          className="flex flex-col gap-2 rounded border border-border p-3 text-sm"
        >
          {sentences.map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
      )}
      <Link
        to={`/research/stocks/${encodeURIComponent(evidence.symbol)}`}
        data-variant="outline"
        className={BUTTON}
      >
        {SELECTION.seeEveryInput}
      </Link>
      <p className="text-xs text-muted-foreground">{SELECTION.footnote}</p>
    </>
  );
}

/**
 * The inspector (classification-ui section 2.5; blueprint 4.5; UX design
 * 1.1), DAC-E4-S7-2 and DAC-E4-S7-3. A pattern the Research screen
 * (CAP-002-E4-S9) and a universe's Members tab mount beside their results.
 *
 * The host passes the immediate selected symbol, not the results table's
 * debounced `onInspect` value, so only one 150 ms wait exists (DEC-0164).
 * Each settled symbol is read once with `getStockEvidence` (CAP-002-E4-S1):
 * no polling, no cache and no prefetch. A response for a symbol that is no
 * longer current is dropped, and a failure offers **Try again**, which reads
 * the same symbol once more after the same wait (DEC-0165) and moves focus
 * to this section, the one part that stays (DEC-0250). With `symbol`
 * null it reads the empty sentence and issues nothing.
 *
 * Loaded, top to bottom (DAC-E4-S7-2, DAC-E4-S7-4): the symbol and name, with
 * *Not followed* for a retired stock; the memberships line, or *In no
 * universe*; one block per factor (the swatch and name as its term, then
 * `FactorCell` with the standardised score, then the inputs line with each
 * input's `as_of` and `known_on`); the explanation box when it has a
 * sentence; **See every input and its date**; the footnote. *Not enough to
 * rank* prints no count (Open Gap 7), and the holdings line and **Start a
 * strategy from this screen** are M2 and absent.
 *
 * Exports used: `getStockEvidence` and `ClassificationApiError`
 * (`api/classification-client.ts`) and `StockEvidence`, `InputRow`,
 * `Membership`, `FactorName` (`api/classification-types.ts`), CAP-002-E4-S1;
 * `REGIONS`, `SELECTION`, `RESULTS.tryAgain`, `CELL`, `FACTOR_LABELS` and
 * `failureSentence` (`screens/research/copy.ts`) and `formatDate`
 * (`format.ts`), CAP-002-E4-S2; `FactorCell`, which draws the
 * percentile, the score and `RestatedMark` (`factor-cell.tsx`), CAP-002-E4-S3.
 */
export function InspectorPanel({ symbol }: { symbol: string | null }): JSX.Element {
  const [state, setState] = useState<InspectorState>(symbol === null ? IDLE : LOADING);
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState({ symbol, attempt });
  const sectionRef = useRef<HTMLElement>(null);

  // A new selection or a retry resets the panel during render, before the
  // commit, so the previous stock's content is never put on the page under
  // the new selection (T008; React's "adjusting state when a prop changes").
  if (settled.symbol !== symbol || settled.attempt !== attempt) {
    setSettled({ symbol, attempt });
    setState(symbol === null ? IDLE : LOADING);
  }

  // `attempt` changes on Try again, which re-runs the read, and keys its result.
  useEffect(() => {
    if (symbol === null) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      getStockEvidence(symbol).then(
        (evidence) => {
          if (!cancelled) {
            setState({ kind: "loaded", evidence, symbol, attempt });
          }
        },
        (cause: unknown) => {
          if (!cancelled) {
            setState({ kind: "failed", sentence: failureOf(cause), symbol, attempt });
          }
        },
      );
    }, INSPECT_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [symbol, attempt]);

  // The `cancelled` flag flips only when React runs the previous effect's
  // cleanup, which can come after the new selection commits; a read for the
  // previous (symbol, attempt) that settles in that gap is never shown, so a
  // response for a symbol that is no longer current is always dropped
  // (T011; DEC-0165; review v2 IR-001).
  const current =
    (state.kind === "loaded" || state.kind === "failed") &&
    (state.symbol !== symbol || state.attempt !== attempt)
      ? symbol === null
        ? IDLE
        : LOADING
      : state;

  let body: ReactNode;
  if (current.kind === "loaded") {
    body = <Loaded evidence={current.evidence} />;
  } else if (current.kind === "failed") {
    body = (
      <>
        <p className="text-sm">{current.sentence}</p>
        <button
          type="button"
          onClick={() => {
            // The button leaves with the failure, so focus moves to the
            // section that stays rather than falling to the document (DEC-0250).
            sectionRef.current?.focus();
            setAttempt((count) => count + 1);
          }}
          className={BUTTON}
        >
          {RESULTS.tryAgain}
        </button>
      </>
    );
  } else if (current.kind === "loading") {
    body = (
      // An `output` carries `role="status"` implicitly (as `as-of-line.tsx`);
      // its height is a spacing token, never a literal (STD-UI-29; DEC-0251).
      <output className="block h-8 w-full animate-pulse rounded bg-secondary">
        <span className="sr-only">{SELECTION.inspectorLoading}</span>
      </output>
    );
  } else {
    body = <p className="text-sm">{SELECTION.inspectorEmpty}</p>;
  }

  return (
    <section
      ref={sectionRef}
      // Focusable by script only, for Try again (DEC-0250); never a tab stop.
      tabIndex={-1}
      aria-label={REGIONS.selectedStock}
      data-variant="summary"
      className="flex flex-col gap-3 rounded border border-border bg-card p-4 text-card-foreground"
    >
      {body}
    </section>
  );
}
