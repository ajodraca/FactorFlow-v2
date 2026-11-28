import { type JSX, type ReactNode, useEffect, useState } from "react";
import { useShell } from "../../app/shell-context";
import { AsOfLine } from "../../components/patterns/as-of-line";
import { formatClock, formatSessionDate } from "../../components/patterns/format";
import { Absent, NotDeterminable } from "../../components/patterns/presence";
import { CHECKED, HEADER, NOT_DETERMINABLE } from "./copy";
import { chicagoWallClock, marketState } from "./market-state";

/**
 * Home's opening line: today's date, the market state and how current prices
 * are (component design `home-ui` 2.3 and section 10; UX design 1.3 Page Layout
 * 1; DEC-0206, DEC-0209; AC-24, AC-25, AC-26; DEC-0362). It reads the shell's
 * attention and makes no read of its own: a one-minute timer recomputes the date
 * and the market state from the clock alone.
 */

const MINUTE_MS = 60_000;

/** The current instant, renewed every minute. */
function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function HomeHeader(): JSX.Element {
  const { attention } = useShell();
  const now = useMinuteClock();
  const { weekday, date } = chicagoWallClock(now);

  const market: ReactNode =
    marketState(now) === "closed" ? (
      HEADER.marketClosed
    ) : (
      <NotDeterminable label={HEADER.marketNotDeterminable} reason={HEADER.noTradingCalendar} />
    );

  let prices: ReactNode;
  if (attention.kind === "ok") {
    prices =
      attention.data.prices_as_of === null
        ? HEADER.pricesNotDownloaded
        : `${HEADER.pricesCurrentTo} ${formatSessionDate(attention.data.prices_as_of)}`;
  } else {
    prices = (
      <>
        {HEADER.pricesCurrentTo} <Absent label={NOT_DETERMINABLE} />
      </>
    );
  }

  // The server's `checked_at`, never the client's `checkedAt` (home-ui 2.3).
  const answered =
    attention.kind === "ok"
      ? attention.data
      : attention.kind === "error"
        ? attention.last?.data
        : null;
  const checked: ReactNode = answered ? (
    `${CHECKED} ${formatClock(answered.checked_at)}`
  ) : (
    <>
      {CHECKED} <Absent label={NOT_DETERMINABLE} />
    </>
  );

  return (
    <header>
      <h1 className="text-xl">{HEADER.heading(weekday, date)}</h1>
      {attention.kind === "loading" ? (
        <div
          data-testid="home-as-of-skeleton"
          aria-hidden="true"
          className="min-h-7 w-full animate-pulse rounded bg-secondary"
        />
      ) : (
        <AsOfLine parts={[market, prices, checked]} />
      )}
    </header>
  );
}
