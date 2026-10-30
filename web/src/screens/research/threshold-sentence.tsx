import { type JSX, useEffect, useId, useState } from "react";
import type { FactorName } from "../../api/classification-types";
import {
  type Direction,
  type Measure,
  type ThresholdSentence as Sentence,
  decodeResearchQuery,
} from "../../api/research-query";
import { FACTOR_LABELS, FILTERS, thresholdFieldError } from "./copy";

const DEFAULT_MEASURE: Measure = "percentile";
const DEFAULT_DIRECTION: Direction = "atLeast";
const MEASURES: readonly Measure[] = ["percentile", "standardisedScore"];
const DIRECTIONS: readonly Direction[] = ["atLeast", "atMost"];

/**
 * The `factor` row's field error for `raw` under `measure`, or `null` when the
 * value is valid or blank (blank means no threshold on that measure;
 * DAC-E4-S5-1). Validity is the S2 codec's own verdict: the value is valid
 * exactly when `decodeResearchQuery` would keep a sentence carrying it, so the
 * pane and the URL cannot drift (DEC-0157). The wording is `copy.ts`'s, for
 * the factor given, so any caller gets its own row's sentence.
 */
export function validateThresholdValue(
  factor: FactorName,
  measure: Measure,
  raw: string,
): string | null {
  if (raw === "") {
    return null;
  }
  const params = new URLSearchParams({
    "value.measure": measure,
    "value.direction": DEFAULT_DIRECTION,
    "value.value": raw,
  });
  return decodeResearchQuery(params).sentences.value === undefined
    ? thresholdFieldError(factor, measure)
    : null;
}

interface Draft {
  measure: Measure;
  direction: Direction;
  raw: string;
}

function draftOf(value: Sentence | undefined): Draft {
  return value === undefined
    ? { measure: DEFAULT_MEASURE, direction: DEFAULT_DIRECTION, raw: "" }
    : { measure: value.measure, direction: value.direction, raw: value.value };
}

function sameSentence(a: Sentence | undefined, b: Sentence): boolean {
  return (
    a !== undefined && a.measure === b.measure && a.direction === b.direction && a.value === b.value
  );
}

export interface ThresholdSentenceProps {
  factor: FactorName;
  /** The factor's current sentence from the URL; `undefined` is no threshold. */
  value?: Sentence;
  /** One call per change: the new sentence, or `null` to drop the factor's threshold. */
  onCommit(next: Sentence | null): void;
}

/**
 * One factor's *[measure] [direction] [value]* sentence (blueprint 4.7;
 * UX design 1.1 item 3; classification-ui 2.5): the swatch and name, then a
 * `<p>` holding the three blanks whose accessible names read as the sentence
 * (DAC-E4-S5-4; DEC-0157). The selects commit on change and the value on
 * blur or Enter; an invalid value is a field error before any request and
 * nothing is written (DAC-E4-S5-1). The draft re-syncs from `value`, so back
 * navigation resets it; a host that must reset a row whose `value` is already
 * `undefined` (Clear filters) remounts it. Nothing here is ever `disabled`:
 * rows stay usable while a request is in flight.
 */
export function ThresholdSentence({
  factor,
  value,
  onCommit,
}: ThresholdSentenceProps): JSX.Element {
  const [draft, setDraft] = useState<Draft>(() => draftOf(value));
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const measure = value?.measure;
  const direction = value?.direction;
  const raw = value?.value;

  useEffect(() => {
    const synced =
      measure !== undefined && direction !== undefined && raw !== undefined
        ? { measure, direction, value: raw }
        : undefined;
    setDraft(draftOf(synced));
    setError(null);
  }, [measure, direction, raw]);

  function commit(next: Draft): void {
    const problem = validateThresholdValue(factor, next.measure, next.raw);
    setError(problem);
    if (problem !== null) {
      return;
    }
    if (next.raw === "") {
      if (value !== undefined) {
        onCommit(null);
      }
      return;
    }
    const sentence: Sentence = {
      measure: next.measure,
      direction: next.direction,
      value: next.raw,
    };
    if (!sameSentence(value, sentence)) {
      onCommit(sentence);
    }
  }

  function changeSelect(next: Draft): void {
    setDraft(next);
    commit(next);
  }

  function changeValue(nextRaw: string): void {
    const next = { ...draft, raw: nextRaw };
    setDraft(next);
    if (error !== null && validateThresholdValue(factor, next.measure, nextRaw) === null) {
      setError(null);
    }
  }

  const thresholdName =
    factor === "value" ? FILTERS.thresholdFor(factor) : FILTERS.valueThresholdFor(factor);
  const selectClass = "rounded border border-input bg-background px-2 py-1";

  return (
    <div className="flex flex-col gap-1">
      <p className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded"
          style={{ backgroundColor: `hsl(var(--factor-${factor}))` }}
        />
        <span>{FACTOR_LABELS[factor]}</span>
        <select
          data-variant="inline"
          aria-label={FILTERS.measureFor(factor)}
          value={draft.measure}
          onChange={(event) => changeSelect({ ...draft, measure: event.target.value as Measure })}
          className={selectClass}
        >
          {MEASURES.map((option) => (
            <option key={option} value={option}>
              {FILTERS.measures[option]}
            </option>
          ))}
        </select>
        <select
          data-variant="inline"
          aria-label={FILTERS.directionFor(factor)}
          value={draft.direction}
          onChange={(event) =>
            changeSelect({ ...draft, direction: event.target.value as Direction })
          }
          className={selectClass}
        >
          {DIRECTIONS.map((option) => (
            <option key={option} value={option}>
              {FILTERS.directions[option]}
            </option>
          ))}
        </select>
        <input
          type="text"
          inputMode="decimal"
          aria-label={thresholdName}
          placeholder={FILTERS.valuePlaceholder}
          value={draft.raw}
          aria-invalid={error !== null ? "true" : undefined}
          aria-describedby={error !== null ? errorId : undefined}
          onChange={(event) => changeValue(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit(draft);
            }
          }}
          className="w-8 rounded border border-input p-1 text-right font-numeric"
        />
      </p>
      {error !== null ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm"
          style={{ color: "hsl(var(--destructive))" }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
