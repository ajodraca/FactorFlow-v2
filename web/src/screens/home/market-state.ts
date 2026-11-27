/**
 * The market state and the America/Chicago wall clock Home's header reads
 * (component design `home-ui` 2.3; DEC-0206; DAC-E5-6, DAC-E5-S1-1; system
 * design open question 9: there is no trading calendar). Without one, a
 * holiday or an early close cannot be told from a session, so inside weekday
 * session hours the state is `not_determinable`, never open. The rule reads
 * the clock only and never the viewer's machine zone. Module shape provisional,
 * recorded as DEC-0362.
 */

export type MarketState = "closed" | "not_determinable";

export interface ChicagoWallClock {
  weekday: string;
  date: string;
  minutes: number;
}

/** 08:30 America/Chicago, in minutes after midnight. */
const SESSION_OPENS = 8 * 60 + 30;
/** 15:00 America/Chicago: the market is `closed` from here (DAC-E5-S1-1). */
const SESSION_CLOSES = 15 * 60;

const CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** The English weekday, the ISO date and the minutes since midnight in Chicago. */
export function chicagoWallClock(now: Date): ChicagoWallClock {
  const parts = CLOCK.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return {
    weekday: part("weekday"),
    date: `${part("year")}-${part("month")}-${part("day")}`,
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

/** `closed` on weekends and outside 08:30 to 15:00; otherwise not determinable. */
export function marketState(now: Date): MarketState {
  const { weekday, minutes } = chicagoWallClock(now);
  if (weekday === "Saturday" || weekday === "Sunday") {
    return "closed";
  }
  return SESSION_OPENS <= minutes && minutes < SESSION_CLOSES ? "not_determinable" : "closed";
}
