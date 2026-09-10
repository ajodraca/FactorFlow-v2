/**
 * Response types mirroring the JSON contracts `ingestion-api` publishes
 * (component design `owner-web-app` section 2.1, `web/src/api/types.ts`).
 *
 * These are hand-written against the documented contract rather than
 * generated: the interface and the API are built together but are separate
 * source trees, and CAP-001-E1-S5 is explicitly developable in parallel with
 * CAP-001-E1-S6's endpoint.
 */

/**
 * The most recent acquisition run's summary.
 *
 * CAP-001-E1-S6's `HealthResponse` hardcodes this field to `null`, and
 * CAP-001-E7-S3 owns its real shape. Typing it `null` exactly — rather than
 * an `unknown`-shaped placeholder — keeps the current contract precise and
 * forces the widening to be a deliberate, reviewable change in that story,
 * mirroring the same decision the API model records (IR-006).
 */
export type RunSummary = null;

/**
 * `GET /api/health`'s response body (component design `ingestion-api`
 * section 11; CAP-001-E1-S5 Technical Details).
 *
 * `credential_present` is a boolean only, never the credential value
 * (AC-13, DAC-E1-9).
 *
 * `database: "unreachable"` means the API answered but its store did not —
 * a different fact from the API not answering at all, which is a rejected
 * `fetchHealth()` rather than any value of this field (DAC-E1-15 versus
 * DAC-E1-S6-2). The two must not be collapsed into one code path.
 */
export interface HealthResponse {
  status: "ok";
  database: "reachable" | "unreachable";
  credential_present: boolean;
  schema_version: number | null;
  most_recent_run: RunSummary;
}
