/**
 * Typed fetch layer over the JSON API (component design `owner-web-app`
 * section 2.1, `web/src/api/client.ts`).
 *
 * Same-origin only: the bundle is served by the same process as the API
 * (component design section 4), so every path here is relative and no
 * cross-origin configuration exists.
 */

import type { HealthResponse } from "./types";

/** Raised when the API could not be reached or did not answer usefully.
 *
 * The status region distinguishes two failures that a caller must never
 * conflate: the fetch itself failing, which is the API not answering at all
 * (DAC-E1-15, the shell-wide unreachable state), and a successful response
 * reporting `database: "unreachable"`, which is the API answering that its
 * store is down (DAC-E1-S6-2). Only the former reaches a caller as this
 * error; the latter arrives as an ordinary `HealthResponse`.
 */
export class ApiUnreachableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ApiUnreachableError";
  }
}

/**
 * `GET /api/health` (CAP-001-E1-S6).
 *
 * Throws `ApiUnreachableError` on a transport failure or a non-OK status —
 * both are "the API did not answer" from the interface's point of view.
 * Never returns a partially-typed body: a response that does not parse as
 * JSON is a failure to answer, not a health report.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  let response: Response;
  try {
    response = await fetch("/api/health", { headers: { Accept: "application/json" } });
  } catch (cause) {
    throw new ApiUnreachableError("GET /api/health could not be reached", { cause });
  }

  if (!response.ok) {
    throw new ApiUnreachableError(`GET /api/health returned ${response.status}`);
  }

  try {
    return (await response.json()) as HealthResponse;
  } catch (cause) {
    throw new ApiUnreachableError("GET /api/health returned a body that is not JSON", { cause });
  }
}
