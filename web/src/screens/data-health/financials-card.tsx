import { Fragment } from "react";
import type { DataHealth } from "../../app/shell-types";
import { formatCount, formatInstant } from "../../components/patterns/format";
import { Absent } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { CheckCard } from "./check-card";
import {
  ABSENT,
  CHECK_TITLES,
  FINANCIALS_NOTE,
  FINANCIALS_TO,
  allFinancials,
  andMore,
  withFailedDownloads,
  withoutFinancials,
} from "./copy";

/**
 * The Company financials check card (data-health-ui 2.4; DAC-E6-4; STD-UI-18).
 * It checks that financials are present and downloaded, not that they are
 * correct, and says so. Zero parts are omitted. A null `check` is DAC-E6-7's
 * null state, an absent dash for the tier and the result.
 */
export function FinancialsCard({
  check,
  followedCount,
}: {
  check: DataHealth["checks"]["company_financials"];
  followedCount: number;
}) {
  const title = CHECK_TITLES.company_financials;
  if (check === null) {
    return (
      <CheckCard
        title={title}
        status={<Absent label={ABSENT.noData} />}
        result={<Absent label={ABSENT.noData} />}
      />
    );
  }

  const status = { of: "check", check: "company_financials", status: check.status } as const;
  const parts: string[] = [];
  if (check.absent_count > 0) {
    parts.push(withoutFinancials(formatCount(check.absent_count)));
  }
  if (check.problem_count > 0) {
    parts.push(withFailedDownloads(formatCount(check.problem_count)));
  }

  const more = check.exception_count - check.exception_symbols.length;
  const exceptions =
    check.exception_symbols.length === 0
      ? null
      : ` · ${check.exception_symbols.join(", ")}${more > 0 ? ` ${andMore(more)}` : ""}`;

  return (
    <CheckCard
      title={title}
      status={<StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>}
      result={check.status === "ok" ? allFinancials(formatCount(followedCount)) : parts.join(", ")}
      asOf={
        <Fragment>
          {FINANCIALS_TO}{" "}
          {check.as_of === null ? (
            <Absent label={ABSENT.noFinancials} />
          ) : (
            formatInstant(check.as_of)
          )}
          {exceptions}
        </Fragment>
      }
    >
      <p className="text-xs text-muted-foreground">{FINANCIALS_NOTE}</p>
    </CheckCard>
  );
}
