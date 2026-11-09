/**
 * The shared formatters (component design 2.5; DAC-E1-9; STD-UI-5; capability
 * OQ-1). Every instant renders in America/Chicago with its zone as the
 * instant falls (CDT or CST), built from Intl.DateTimeFormat parts in en-US,
 * so the viewer's machine zone is never read and no locale format is used.
 * Signatures are provisional, recorded as DEC-0309. The shell's
 * formatTimestamp stays as delivered (system design assumption 5).
 */

/** A `Date`, or an ISO-8601 instant string with `Z` or an offset. */
export type Instant = Date | string;

const TIME_ZONE = "America/Chicago";

/** An ISO-8601 instant with its zone: `Z` or an offset, never a local wall-clock time. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

/** Built per call so the zone is always the one named here, never one cached at load. */
function chicago(): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("en-US", {
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
  });
}

function toDate(value: Instant): Date {
  const when = typeof value === "string" ? new Date(value) : value;
  if ((typeof value === "string" && !ISO_INSTANT.test(value)) || Number.isNaN(when.getTime())) {
    throw new RangeError(`Not an ISO-8601 instant: ${JSON.stringify(value)}`);
  }
  return when;
}

function partsOf(value: Instant): (type: Intl.DateTimeFormatPartTypes) => string {
  const parts = chicago().formatToParts(toDate(value));
  return (type) => parts.find((candidate) => candidate.type === type)?.value ?? "";
}

/** `2026-10-15 17:46 CDT`, with seconds (`17:52:10`) only when asked. */
export function formatInstant(value: Instant, options?: { seconds?: boolean }): string {
  const part = partsOf(value);
  const clock = options?.seconds
    ? `${part("hour")}:${part("minute")}:${part("second")}`
    : `${part("hour")}:${part("minute")}`;
  return `${part("year")}-${part("month")}-${part("day")} ${clock} ${part("timeZoneName")}`;
}

/** `17:52:10 CDT`, for a *checked {time}* clause. */
export function formatClock(value: Instant): string {
  const part = partsOf(value);
  return `${part("hour")}:${part("minute")}:${part("second")} ${part("timeZoneName")}`;
}

/** A calendar date, returned as received after a shape check, never through `Date`. */
export function formatSessionDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError(`Not an ISO-8601 date: ${JSON.stringify(value)}`);
  }
  return value;
}

/** A whole, non-negative count with `,` thousands separators. */
export function formatCount(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError(`Not a count: ${String(n)}`);
  }
  return String(n).replace(/\B(?=(\d{3})+$)/g, ",");
}

/** `Download {instant}` from the start time, else the request time (capability OQ-1). */
export function formatDownloadName(startedAt: Instant | null, requestedAt: Instant): string {
  return `Download ${formatInstant(startedAt ?? requestedAt)}`;
}
