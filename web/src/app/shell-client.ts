import { requestJson } from "../api/client";
import type { Attention, DataHealth, ProblemPage } from "./shell-types";

/*
 * The one fetch module for data-health-api's three routes and the score
 * summary (CAP-003-E3-S1; owner-shell 2.1, 2.3; DAC-E3-18). Every read goes
 * through the delivered `requestJson`, so a transport failure is an
 * `ApiUnreachableError` and a non-2xx status an `ApiError`, as delivered. No
 * body is mapped, cast field by field or re-keyed: the wire shape is the type.
 */

/** `GET /api/attention` (data-health-api 2.3; AC-8, AC-16). */
export function fetchAttention(): Promise<Attention> {
  return requestJson<Attention>("/api/attention");
}

/** `GET /api/data-health` (data-health-api 2.3; DAC-E3-18). */
export function fetchDataHealth(): Promise<DataHealth> {
  return requestJson<DataHealth>("/api/data-health");
}

/**
 * `GET /api/data-health/problems` (data-health-api 2.3; DAC-E3-S1-3).
 *
 * `limit` is sent as given and never clamped or defaulted here: the server owns
 * its bound and refuses out-of-range values. `cursor` is sent only when set, so
 * `null` (data-health-ui's value after the last page) and `undefined` both ask
 * for the first page.
 */
export function fetchProblems(
  cursor: string | null | undefined,
  limit: number,
): Promise<ProblemPage> {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  if (cursor != null) {
    params.append("cursor", cursor);
  }
  return requestJson<ProblemPage>(`/api/data-health/problems?${params}`);
}
