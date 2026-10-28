/**
 * The one place a CAP-002 number or date becomes text (classification-ui
 * section 2.4; STD-UI-3, STD-UI-5, STD-UI-6; DEC-0063; DEC-0147).
 *
 * Every numeric input is the wire's decimal string at stored precision and is
 * rounded by string arithmetic, half away from zero, never through a float. A
 * value that rounds to zero is never signed, and a string that is not a plain
 * decimal throws `RangeError` rather than render a value the API never sent
 * (STD-UI-4). Signs use the ASCII hyphen-minus (CAP-002-E4-S2 Resolved
 * Conflict 2).
 */

const PLAIN_DECIMAL = /^([+-]?)(\d+)(?:\.(\d+))?$/;

/** The zero spelling a `Decimal` column can emit at a scale (`0E-10`). */
const ZERO_EXPONENT = /^[+-]?0E[+-]?\d+$/;

const TIME_ZONE = "America/Chicago";

interface Decimal {
  negative: boolean;
  whole: string;
  fraction: string;
}

function parseDecimal(value: string): Decimal {
  const match = PLAIN_DECIMAL.exec(ZERO_EXPONENT.test(value) ? "0" : value);
  if (match === null) {
    throw new RangeError(`Not a decimal string: ${JSON.stringify(value)}`);
  }
  return { negative: match[1] === "-", whole: match[2] as string, fraction: match[3] ?? "" };
}

/** Multiplies by 10^places by moving the decimal point (a rate's fraction to percent). */
function shiftLeft(decimal: Decimal, places: number): Decimal {
  const fraction = decimal.fraction.padEnd(places, "0");
  return {
    negative: decimal.negative,
    whole: decimal.whole + fraction.slice(0, places),
    fraction: fraction.slice(places),
  };
}

/**
 * Rounds the magnitude to `places` decimals, half away from zero. `sign` is
 * the one to print: empty when the rounded magnitude is zero.
 */
function round(decimal: Decimal, places: number): { sign: "" | "+" | "-"; digits: string } {
  const kept = decimal.fraction.slice(0, places).padEnd(places, "0");
  let units = BigInt(decimal.whole + kept);
  if (decimal.fraction.charAt(places) >= "5") {
    units += 1n;
  }
  const padded = units.toString().padStart(places + 1, "0");
  const digits =
    places === 0
      ? padded
      : `${padded.slice(0, padded.length - places)}.${padded.slice(padded.length - places)}`;
  const sign = units === 0n ? "" : decimal.negative ? "-" : "+";
  return { sign, digits };
}

function signed(decimal: Decimal, places: number): string {
  const { sign, digits } = round(decimal, places);
  return `${sign}${digits}`;
}

/** Keeps a `-`, never prints a `+`. */
function unsigned(decimal: Decimal, places: number): string {
  const { sign, digits } = round(decimal, places);
  return `${sign === "-" ? "-" : ""}${digits}`;
}

/** A standardised score: two decimals, `+` or `-`, `0.00` unsigned (DAC-E4-S2-3). */
export function formatScore(value: string): string {
  return signed(parseDecimal(value), 2);
}

/** A percentile: a whole number 0 to 100, no sign and no `%` (DAC-E4-S2-3, AC-9). */
export function formatPercentile(value: string): string {
  return unsigned(parseDecimal(value), 0);
}

/** A ratio input: two decimals, a negative keeps `-`, never a `+` (DAC-E4-S2-3). */
export function formatRatio(value: string): string {
  return unsigned(parseDecimal(value), 2);
}

/** A rate input, the engine's fraction: times 100, two decimals, signed, `%` (DAC-E4-S2-3). */
export function formatRate(value: string): string {
  return `${signed(shiftLeft(parseDecimal(value), 2), 2)}%`;
}

/** An amount: whole units, `,` thousands separators, no symbol, no abbreviation (STD-UI-6). */
export function formatAmount(value: string): string {
  return unsigned(parseDecimal(value), 0).replace(/\B(?=(\d{3})+$)/g, ",");
}

/** An ISO-8601 instant with its zone: `Z` or an offset, never a local wall-clock time. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * An instant in America/Chicago with the zone as the instant falls:
 * `2026-10-15 17:46 CDT`, or `17:52:10 CDT` with `seconds` for the polled
 * *checked* clause (DAC-E4-S2-3; DEC-0147). Never reads the machine zone.
 */
export function formatTimestamp(value: string, options?: { seconds?: boolean }): string {
  const when = new Date(value);
  if (!ISO_INSTANT.test(value) || Number.isNaN(when.getTime())) {
    throw new RangeError(`Not an ISO-8601 instant: ${JSON.stringify(value)}`);
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // h23, not hour12: false, so midnight is "00" on every engine, never "24".
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(when);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  const clock = options?.seconds
    ? `${part("hour")}:${part("minute")}:${part("second")}`
    : `${part("hour")}:${part("minute")}`;
  return `${part("year")}-${part("month")}-${part("day")} ${clock} ${part("timeZoneName")}`;
}

/**
 * A calendar date (`classification_date`, `known_on`, an input's `as_of`):
 * returned as received after a shape check, never through `Date` (STD-UI-5).
 */
export function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError(`Not an ISO-8601 date: ${JSON.stringify(value)}`);
  }
  return value;
}
