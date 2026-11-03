import type { CSSProperties, JSX } from "react";
import { useId } from "react";
import { Link } from "react-router-dom";
import type {
  FactorCell as FactorCellData,
  FactorName,
  InputRow,
  Lifecycle,
} from "../../../api/classification-types";
import { FactorCell } from "../../../components/patterns/factor-cell";
import { RestatedMark } from "../../../components/patterns/restated-mark";
import { StatusBadge } from "../../../components/patterns/status-badge";
import { CELL, EVIDENCE, FACTOR_LABELS, INPUT_STATUS, SHELL_ROUTES } from "../copy";
import { formatRate, formatRatio, formatScore } from "../format";

const BADGE = "inline-flex items-center gap-1 rounded px-2 py-1 text-xs";

/** The inputs whose value is a ratio; every other input is a rate (DEC-0063, DEC-0186). */
const RATIO_INPUTS: readonly string[] = ["book_to_price", "earnings_yield", "fcf_yield"];

export interface FactorCardProps {
  factor: FactorName;
  symbol: string;
  cell: FactorCellData;
  /** The stock's input rows for this factor, in the order received. */
  inputs: readonly InputRow[];
  lifecycle: Lifecycle;
  /** `set.classificationDate`, the wire string. */
  scoresDate: string;
  /** `set.latestTradingDay`, read only by the price sentence (DEC-0182). */
  latestTradingDay: string;
}

function isRetired(cell: FactorCellData, lifecycle: Lifecycle): boolean {
  return lifecycle === "retired" || cell.reasonCode === "retired";
}

/**
 * Whether `FactorCell` draws the mark on this cell: a scored value or growth
 * cell that carries `restatedPossible` (DAC-E4-S3-3).
 */
function cellDrawsMark(cell: FactorCellData, factor: FactorName): boolean {
  return (
    factor !== "momentum" &&
    cell.restatedPossible &&
    cell.status === "classified" &&
    cell.percentile !== null &&
    cell.reasonCode !== "retired" &&
    cell.reasonCode !== "not_enough_stocks"
  );
}

/**
 * Whether the card shows the restated mark anywhere, on its cell or an input
 * row, so the screen can place the meaning sentence below the first such card
 * (DEC-0185).
 */
export function cardShowsMark(
  factor: FactorName,
  cell: FactorCellData,
  inputs: readonly InputRow[],
  lifecycle: Lifecycle,
): boolean {
  if (factor === "momentum" || isRetired(cell, lifecycle)) {
    return false;
  }
  return cellDrawsMark(cell, factor) || inputs.some((input) => input.restatedPossible);
}

/**
 * Whether the provider holds no such data: a missing input whose last
 * acquisition outcome is `not_found` (DEC-0181). `detail` is `unknown`, so
 * each level is narrowed at runtime; any other shape is false.
 */
function providerHoldsNoData(input: InputRow): boolean {
  if (input.status !== "missing") {
    return false;
  }
  const { detail } = input;
  if (typeof detail !== "object" || detail === null) {
    return false;
  }
  const acquisition = (detail as Record<string, unknown>).last_acquisition;
  if (typeof acquisition !== "object" || acquisition === null) {
    return false;
  }
  return (acquisition as Record<string, unknown>).outcome === "not_found";
}

/**
 * `scoresDate` minus 6 months as an ISO date, the day clamped to the month's
 * end. Arithmetic on the string's fields: no date string is parsed (STD-UI-5);
 * `Date.UTC` only supplies the month's length.
 */
function sixMonthsBefore(scoresDate: string): string {
  const months = Number(scoresDate.slice(0, 4)) * 12 + Number(scoresDate.slice(5, 7)) - 1 - 6;
  const year = Math.floor(months / 12);
  const month = (months % 12) + 1;
  const monthEnd = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Number(scoresDate.slice(8, 10)), monthEnd);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** An outdated fundamental is older than the 6-month rule; momentum inputs are always price (DEC-0182). */
function isOutdatedFundamental(input: InputRow, factor: FactorName, scoresDate: string): boolean {
  return factor !== "momentum" && input.asOf !== null && input.asOf < sixMonthsBefore(scoresDate);
}

interface Statement {
  sentence: string;
  /** Whether the next download can change it: the recovery line, or the no-action line. */
  recovery: "next-download" | "none" | "no-action";
}

function statementFor(props: FactorCardProps, input: InputRow | undefined): Statement | null {
  const { cell, factor, symbol, scoresDate, latestTradingDay } = props;
  const name = FACTOR_LABELS[factor];
  const label = input?.label ?? EVIDENCE.unnamedInput;
  switch (cell.reasonCode) {
    case "input_missing":
      if (input !== undefined && providerHoldsNoData(input)) {
        return {
          sentence: EVIDENCE.couldNotBeScored(
            name,
            symbol,
            EVIDENCE.providerHoldsNoDataReason(label, symbol),
          ),
          recovery: "no-action",
        };
      }
      return {
        sentence: EVIDENCE.couldNotBeScored(name, symbol, EVIDENCE.missingInputReason(label)),
        recovery: "next-download",
      };
    case "input_outdated": {
      const reason =
        input !== undefined && isOutdatedFundamental(input, factor, scoresDate)
          ? EVIDENCE.fundamentalOutdatedReason(scoresDate)
          : EVIDENCE.priceOutdatedReason(latestTradingDay);
      return {
        sentence: EVIDENCE.couldNotBeScored(name, symbol, reason),
        recovery: "next-download",
      };
    }
    case "input_not_computable":
      return {
        sentence: EVIDENCE.couldNotBeScored(
          name,
          symbol,
          EVIDENCE.notComputableReason(label, cell.reasonDetail),
        ),
        recovery: "none",
      };
    default:
      return null;
  }
}

function MissingBadge(): JSX.Element {
  return (
    <span
      data-variant="coverage-absent"
      className={`${BADGE} bg-value-missing-muted text-value-missing`}
    >
      <span aria-hidden="true">—</span>
      {INPUT_STATUS.missing}
    </span>
  );
}

function NotComputableText(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-status-warning">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        <path d="M6 1 11 11H1Z" fill="currentColor" />
      </svg>
      {INPUT_STATUS.not_computable}
    </span>
  );
}

function printedValue(input: InputRow): string {
  if (input.value === null) {
    return CELL.absentValue;
  }
  return RATIO_INPUTS.includes(input.inputName)
    ? formatRatio(input.value)
    : formatRate(input.value);
}

function Dated({ term, date }: { term: string; date: string | null }): JSX.Element {
  return (
    <span className="text-xs text-muted-foreground">
      <span>{term}</span>{" "}
      <span className="font-numeric">{date === null ? CELL.absentValue : date}</span>
    </span>
  );
}

function InputItem({ input }: { input: InputRow }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <dt className="text-sm">{input.label}</dt>
      <dd className="m-0 flex flex-wrap items-center gap-2">
        <span
          data-testid="input-value"
          className={`font-numeric text-sm ${input.status === "missing" ? "text-value-missing" : ""}`}
        >
          {input.status === "missing" ? CELL.absentValue : printedValue(input)}
        </span>
        {input.status === "missing" ? <MissingBadge /> : null}
        {input.status === "outdated" ? (
          <StatusBadge tier="warning">{INPUT_STATUS.outdated}</StatusBadge>
        ) : null}
        {input.status === "not_computable" ? <NotComputableText /> : null}
        {input.restatedPossible ? <RestatedMark factor={input.factor} /> : null}
        <Dated term={EVIDENCE.asOf} date={input.asOf} />
        <Dated term={EVIDENCE.knownOn} date={input.knownOn} />
      </dd>
    </div>
  );
}

function swatchStyle(factor: FactorName): CSSProperties {
  // The identity token as an inline style: tailwind.config.js maps no `factor` colour.
  return { background: `hsl(var(--factor-${factor}))` };
}

function Recovery({ kind }: { kind: Statement["recovery"] }): JSX.Element | null {
  if (kind === "no-action") {
    return <p className="text-sm">{EVIDENCE.noActionChangesThis}</p>;
  }
  if (kind === "next-download") {
    return (
      <p className="text-sm">
        {EVIDENCE.nextDownloadRecovery}{" "}
        <Link to={SHELL_ROUTES.dataHealth} className="underline">
          {EVIDENCE.dataHealthLink}
        </Link>
      </p>
    );
  }
  return null;
}

/**
 * One factor's card on the Stock evidence screen (classification-ui 2.5, 10;
 * UX design 1.6; AC-12, AC-13, AC-15, AC-17): the factor's result, the
 * three-part statement when it is incomplete, and every input with its value,
 * `as_of` and `known_on` and its own status (DEC-0077). Presentational over
 * the delivered factor cell and mark; the screen places the page-level
 * sentences (DEC-0185).
 */
export default function FactorCard(props: FactorCardProps): JSX.Element {
  const { factor, cell, inputs, lifecycle } = props;
  const headingId = useId();
  const retired = isRetired(cell, lifecycle);
  const input =
    cell.reasonInput === null
      ? undefined
      : inputs.find((row) => row.inputName === cell.reasonInput);
  const statement = retired ? null : statementFor(props, input);

  return (
    <section
      aria-labelledby={headingId}
      className="rounded border border-border bg-card p-4 text-card-foreground"
    >
      <h2 id={headingId} className="mb-2 flex items-center gap-2 text-base font-semibold">
        <span
          data-testid="factor-swatch"
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded"
          style={swatchStyle(factor)}
        />
        {FACTOR_LABELS[factor]}
      </h2>
      <div className="flex flex-col gap-2">
        <FactorCell cell={retired ? { ...cell, reasonCode: "retired" } : cell} factor={factor} />
        {retired ? <p className="text-sm">{CELL.notFollowedNoDate}</p> : null}
        {!retired &&
        cell.status === "classified" &&
        cell.reasonCode !== "not_enough_stocks" &&
        cell.score !== null ? (
          <span data-testid="card-score" className="font-numeric text-xs text-muted-foreground">
            {formatScore(cell.score)}
          </span>
        ) : null}
        {!retired && cell.reasonCode === "not_enough_stocks" && cell.reasonDetail !== null ? (
          <p className="text-sm">{cell.reasonDetail}</p>
        ) : null}
        {statement === null ? null : (
          <>
            <p className="text-sm">{statement.sentence}</p>
            <Recovery kind={statement.recovery} />
          </>
        )}
        {retired || inputs.length === 0 ? null : (
          <dl className="m-0 divide-y divide-border">
            {inputs.map((row) => (
              <InputItem key={row.inputName} input={row} />
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
