import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { DataHealth } from "../../app/shell-types";
import { NotDeterminable, Absent } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { formatCount, formatSessionDate } from "../../components/patterns/format";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { Button } from "../../components/ui/button";
import { CheckCard } from "./check-card";
import {
  ABSENT,
  CHECK_TITLES,
  FULL_COVERAGE_TABLE,
  GAPS_NOT_DETERMINABLE,
  PRICES_SCOPE_NOTE,
  PRICES_TO,
  allPrices,
  andMore,
  behind,
  gapReason,
  withGaps,
  withoutPrices,
} from "./copy";

/**
 * The Daily prices check card (data-health-ui 2.4; DAC-E6-3; DEC-0201, DEC-0206,
 * DEC-0213, DEC-0220). Zero parts are omitted and a null is never `0`: a null
 * `gap_stock_count` is the not-determinable gap part, the absent and behind parts
 * still render. A null `check` is DAC-E6-7's null state, an absent dash for the
 * tier and the result.
 */
export function DailyPricesCard({
  check,
  followedCount,
}: {
  check: DataHealth["checks"]["daily_prices"];
  followedCount: number;
}) {
  const title = CHECK_TITLES.daily_prices;
  if (check === null) {
    return (
      <CheckCard
        title={title}
        status={<Absent label={ABSENT.noData} />}
        result={<Absent label={ABSENT.noData} />}
      />
    );
  }

  const date =
    check.latest_session === null ? (
      <Absent label={ABSENT.noPrices} />
    ) : (
      formatSessionDate(check.latest_session)
    );

  const status =
    check.status === "not_determinable" ? (
      <NotDeterminable reason={gapReason(check.gap_detection.reason)} />
    ) : (
      <StatusBadge tier={tierOf({ of: "check", check: "daily_prices", status: check.status })}>
        {labelOf({ of: "check", check: "daily_prices", status: check.status })}
      </StatusBadge>
    );

  const parts: JSX.Element[] = [];
  if (check.absent_count > 0) {
    parts.push(<Fragment key="absent">{withoutPrices(formatCount(check.absent_count))}</Fragment>);
  }
  if (check.gap_stock_count === null) {
    parts.push(
      <NotDeterminable
        key="gaps"
        label={GAPS_NOT_DETERMINABLE}
        reason={gapReason(check.gap_detection.reason)}
      />,
    );
  } else if (check.gap_stock_count > 0) {
    parts.push(<Fragment key="gaps">{withGaps(formatCount(check.gap_stock_count))}</Fragment>);
  }
  if (check.behind_count > 0 && check.latest_session !== null) {
    parts.push(
      <Fragment key="behind">
        {behind(formatCount(check.behind_count), formatSessionDate(check.latest_session))}
      </Fragment>,
    );
  }

  const result =
    check.status === "ok"
      ? check.latest_session === null
        ? date
        : allPrices(formatCount(followedCount), formatSessionDate(check.latest_session))
      : parts.map((part, index) => (
          <Fragment key={part.key}>
            {index > 0 ? ", " : null}
            {part}
          </Fragment>
        ));

  const more = check.exception_count - check.exception_symbols.length;
  const exceptions =
    check.exception_symbols.length === 0
      ? null
      : ` · ${check.exception_symbols.join(", ")}${more > 0 ? ` ${andMore(more)}` : ""}`;

  return (
    <CheckCard
      title={title}
      status={status}
      result={result}
      asOf={
        <>
          {PRICES_TO} {date}
          {exceptions}
        </>
      }
    >
      <p className="text-xs text-muted-foreground">{PRICES_SCOPE_NOTE}</p>
      <Button variant="outline" asChild>
        <Link to="/data/coverage">{FULL_COVERAGE_TABLE}</Link>
      </Button>
    </CheckCard>
  );
}
