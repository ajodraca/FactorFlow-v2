import { ApiError, requestJson } from "../api/client";
import type { Attention, DataHealth, ProblemPage, ScoreState, ScoreSummary } from "./shell-types";

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

/**
 * `GET /api/classifications/summary` (classification-api; DAC-E3-S1-2, AC-8,
 * AC-24). Resolves the served summary itself, or `{ kind: "not_served" }` while
 * the route is not deployed.
 *
 * The route answers `404 not_found` until it is deployed (system design 4.2;
 * owner-shell 3), served by `app.py:338-347` for every unmatched `/api` path.
 * `ApiError` carries the envelope's `code`, not the HTTP status, so the mapping
 * is `code === "not_found"`. Any other `ApiError`, an `ApiUnreachableError`, and
 * a `404` without the envelope all reject unchanged. The two results are told
 * apart by `"kind" in value`: the wire summary has no `kind` key.
 */
export async function fetchScoreSummary(): Promise<
  ScoreSummary | Extract<ScoreState, { kind: "not_served" }>
> {
  try {
    return await requestJson<ScoreSummary>("/api/classifications/summary");
  } catch (caught) {
    if (caught instanceof ApiError && caught.code === "not_found") {
      return { kind: "not_served" };
    }
    throw caught;
  }
}
