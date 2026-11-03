import { type JSX, type ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import type {
  FactorCell as FactorCellData,
  FactorName,
  FactorSummary,
  InputRow,
  Lifecycle,
} from "../../api/classification-types";
import { CELL, COMPARE, FACTOR_LABELS, INPUT_STATUS } from "../../screens/research/copy";
import { formatRate, formatRatio, formatScore } from "../../screens/research/format";
import { FactorCell } from "./factor-cell";
import { RestatedMark } from "./restated-mark";

/** One stock's column: the list read's cells and the evidence read's input rows. */
export interface ComparisonColumn {
  symbol: string;
  name: string;
  lifecycle: Lifecycle;
  factors: Record<FactorName, FactorCellData>;
  inputs: InputRow[];
}

export interface ComparisonTableProps {
  columns: ComparisonColumn[];
  /** Absent for a single column, which has no list read (DEC-0176). */
  factors?: Record<FactorName, FactorSummary>;
  onRemove: (symbol: string) => void;
}

type InputName = keyof typeof COMPARE.inputLabels;

interface InputSpec {
  name: InputName;
  format: (value: string) => string;
}

/** The rows of each group in the order of UX 1.5. */
const GROUPS: { factor: FactorName; inputs: InputSpec[] }[] = [
  {
    factor: "value",
    inputs: [
      { name: "book_to_price", format: formatRatio },
      { name: "earnings_yield", format: formatRatio },
      { name: "fcf_yield", format: formatRatio },
    ],
  },
  {
    factor: "growth",
    inputs: [
      { name: "revenue_growth", format: formatRate },
      { name: "eps_growth", format: formatRate },
    ],
  },
  {
    factor: "momentum",
    inputs: [
      { name: "return_3m", format: formatRate },
      { name: "return_6m", format: formatRate },
      { name: "return_12m", format: formatRate },
    ],
  },
];

const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";
const CELL_CLASSES = "px-3 py-2 align-top";
const ROW_HEADER_CLASSES =
  "sticky left-0 border-r border-border bg-background px-3 py-2 text-left align-top font-normal";

function Absent(): JSX.Element {
  return <span className="text-value-missing">{CELL.absentValue}</span>;
}

function WarningIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      <path d="M6 1.5 11 10.5H1Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** The score row: em dash wherever the cell carries no measured score. */
function scoreText(cell: FactorCellData): string | null {
  if (cell.status !== "classified" || cell.score === null || cell.percentile === null) {
    return null;
  }
  if (cell.reasonCode === "retired" || cell.reasonCode === "not_enough_stocks") {
    return null;
  }
  return formatScore(cell.score);
}

function InputValue({
  input,
  format,
}: { input: InputRow | undefined; format: InputSpec["format"] }): JSX.Element {
  // No row at all (a retired stock) is not a fault: only the em dash (DEC-0073, DEC-0077).
  if (input === undefined) {
    return <Absent />;
  }
  const value =
    input.value === null ? <Absent /> : <span className="font-numeric">{format(input.value)}</span>;
  let status: ReactNode = null;
  if (input.status === "missing") {
    status = (
      <span
        data-variant="coverage-absent"
        className={`${BADGE} bg-value-missing-muted text-value-missing`}
      >
        {INPUT_STATUS.missing}
      </span>
    );
  } else if (input.status === "outdated") {
    status = (
      <span
        data-variant="status-warning"
        className={`${BADGE} bg-status-warning-muted text-status-warning`}
      >
        <WarningIcon />
        {INPUT_STATUS.outdated}
      </span>
    );
  } else if (input.status === "not_computable") {
    status = (
      <span className="inline-flex items-center gap-1 text-xs text-status-warning">
        <WarningIcon />
        {INPUT_STATUS.not_computable}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {input.status === "missing" ? <Absent /> : value}
      {status}
      {input.restatedPossible ? <RestatedMark factor={input.factor} /> : null}
    </span>
  );
}

function InputDates({ input }: { input: InputRow | undefined }): JSX.Element {
  return (
    <span className="mt-1 flex flex-col text-xs text-muted-foreground">
      <span>
        {COMPARE.asOf} {input?.asOf ?? CELL.absentValue}
      </span>
      <span>
        {COMPARE.knownOn} {input?.knownOn ?? CELL.absentValue}
      </span>
    </span>
  );
}

function InputRowView({
  spec,
  columns,
}: { spec: InputSpec; columns: ComparisonColumn[] }): JSX.Element {
  const [open, setOpen] = useState(false);
  const label = COMPARE.inputLabels[spec.name];
  return (
    <tr>
      <th scope="row" className={ROW_HEADER_CLASSES}>
        {label}{" "}
        <button
          type="button"
          data-variant="ghost"
          aria-expanded={open}
          aria-label={COMPARE.showDatesFor(label.toLowerCase())}
          onClick={() => setOpen((current) => !current)}
          className="rounded px-2 py-1 text-xs underline"
        >
          {COMPARE.dates}
        </button>
      </th>
      {columns.map((column) => {
        const input = column.inputs.find((row) => row.inputName === spec.name);
        return (
          <td key={column.symbol} className={CELL_CLASSES}>
            <InputValue input={input} format={spec.format} />
            {open ? <InputDates input={input} /> : null}
          </td>
        );
      })}
    </tr>
  );
}

function StockHeader({
  column,
  onRemove,
}: {
  column: ComparisonColumn;
  onRemove: (symbol: string) => void;
}): JSX.Element {
  return (
    <th
      scope="col"
      data-symbol={column.symbol}
      tabIndex={-1}
      className="px-3 py-2 text-left align-top font-normal"
    >
      <Link
        to={`/research/stocks/${encodeURIComponent(column.symbol)}`}
        className="font-semibold underline"
      >
        {column.symbol}
      </Link>
      <span className="block text-xs text-muted-foreground">{column.name}</span>
      {column.lifecycle === "retired" ? (
        <span
          data-variant="status-neutral"
          className={`${BADGE} bg-status-neutral-muted text-status-neutral`}
        >
          {CELL.notFollowed}
        </span>
      ) : null}
      <button
        type="button"
        data-variant="ghost"
        aria-label={COMPARE.removeFromComparison(column.symbol)}
        onClick={() => onRemove(column.symbol)}
        className="ml-2 rounded px-2 py-1 text-xs underline"
      >
        {COMPARE.removeGlyph}
      </button>
    </th>
  );
}

/**
 * The comparison table (classification-ui section 2.5; UX design 1.5): a
 * native table with the stocks as columns and the three factors as row
 * groups. It is presentational: the screen supplies the columns and removes
 * one on request. A stock keeps its column whatever its cells say, and
 * `reasonInput`, a payload key, is never read (DEC-0151, STD-UI-1).
 */
export function ComparisonTable({ columns, factors, onRemove }: ComparisonTableProps): JSX.Element {
  const span = columns.length + 1;
  return (
    <section
      aria-label={COMPARE.comparisonOf(columns.length)}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must take the keyboard to scroll.
      tabIndex={0}
      className="overflow-x-auto"
    >
      <table
        aria-label={COMPARE.comparisonOf(columns.length)}
        className="w-full border-collapse text-sm"
      >
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 border-r border-border bg-background">
              <span className="sr-only">{COMPARE.measure}</span>
            </th>
            {columns.map((column) => (
              <StockHeader key={column.symbol} column={column} onRemove={onRemove} />
            ))}
          </tr>
        </thead>
        <tbody>
          {GROUPS.map(({ factor, inputs }) => {
            const summary = factors?.[factor];
            return [
              <tr key={`${factor}-group`}>
                <th
                  scope="row"
                  colSpan={span}
                  className="bg-secondary px-3 py-2 text-left font-semibold"
                >
                  {FACTOR_LABELS[factor]}
                  {summary !== undefined && !summary.ranked ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {COMPARE.notEnoughToRankGroup(summary.qualifiedCount, summary.minPeerSetSize)}
                    </span>
                  ) : null}
                </th>
              </tr>,
              <tr key={`${factor}-percentile`}>
                <th scope="row" className={ROW_HEADER_CLASSES}>
                  {COMPARE.percentile}
                  <span className="sr-only">, {FACTOR_LABELS[factor]}</span>
                </th>
                {columns.map((column) => (
                  <td key={column.symbol} className={CELL_CLASSES}>
                    <FactorCell cell={column.factors[factor]} factor={factor} />
                  </td>
                ))}
              </tr>,
              <tr key={`${factor}-score`}>
                <th scope="row" className={`${ROW_HEADER_CLASSES} text-muted-foreground`}>
                  {COMPARE.standardisedScore}
                  <span className="sr-only">, {FACTOR_LABELS[factor]}</span>
                </th>
                {columns.map((column) => {
                  const text = scoreText(column.factors[factor]);
                  return (
                    <td key={column.symbol} className={`${CELL_CLASSES} text-muted-foreground`}>
                      {text === null ? <Absent /> : <span className="font-numeric">{text}</span>}
                    </td>
                  );
                })}
              </tr>,
              ...inputs.map((spec) => (
                <InputRowView key={spec.name} spec={spec} columns={columns} />
              )),
            ];
          })}
        </tbody>
      </table>
    </section>
  );
}
