import type { RunState } from "../../api/types";

/**
 * The one status-to-tier function of the owner interface (AC-20; system design
 * constraint 4; component design `ui-components` 2.3), implementing every row of
 * UX brief section 12.2 as DAC-E1-1 restates it. The labels are the STD-UI-1 v6
 * display labels, so `labelOf` is the one source of status labels (AC-19).
 * `partial` is warning and never good (AC-12); `cancelled` is neutral and never
 * critical. Not determinable is not a tier: it renders through `NotDeterminable`,
 * never through `tierOf`.
 *
 * Every `switch` ends `default: return assertNever(...)`, so a kind or state
 * added to `Status` without a row fails to type-check (DAC-E1-S5-1).
 */

export type Tier = "neutral" | "active" | "good" | "warning" | "serious" | "critical";

/** The kinds of *Needs you* item (DEC-0203), declared here so this module imports nothing from `needs-you.ts`. */
export type NeedsYouKind =
  | "data_problems"
  | "download_not_complete"
  | "credential_missing"
  | "first_download"
  | "first_scores"
  | "score_failed";

export type Status =
  | { of: "download"; state: RunState }
  | { of: "result"; outcome: "failed" | "not_found" }
  | {
      of: "scores";
      state: "never_classified" | "building" | "not_current" | "failed" | "current";
    }
  | { of: "check"; check: "daily_prices" | "company_financials"; status: "ok" | "exceptions" }
  | { of: "credential"; present: boolean }
  | { of: "item"; kind: NeedsYouKind; failed?: boolean };

function assertNever(value: never): never {
  throw new Error(`Unhandled status: ${JSON.stringify(value)}`);
}

export function tierOf(status: Status): Tier {
  switch (status.of) {
    case "download":
      switch (status.state) {
        case "requested":
          return "neutral";
        case "running":
          return "active";
        case "cancelling":
          return "warning";
        case "succeeded":
          return "good";
        case "partial":
          return "warning";
        case "failed":
          return "critical";
        case "cancelled":
          return "neutral";
        case "abandoned":
          return "serious";
        default:
          return assertNever(status);
      }
    case "result":
      switch (status.outcome) {
        case "not_found":
          return "warning";
        case "failed":
          return "critical";
        default:
          return assertNever(status.outcome);
      }
    case "scores":
      switch (status.state) {
        case "building":
          return "active";
        case "not_current":
          return "warning";
        case "failed":
          return "critical";
        case "never_classified":
          return "neutral";
        case "current":
          return "good";
        default:
          return assertNever(status);
      }
    case "check":
      switch (status.status) {
        case "ok":
          return "good";
        case "exceptions":
          return "warning";
        default:
          return assertNever(status.status);
      }
    case "credential":
      return status.present ? "good" : "critical";
    case "item":
      switch (status.kind) {
        case "data_problems":
          return "warning";
        case "download_not_complete":
          return status.failed ? "critical" : "serious";
        case "credential_missing":
          return "critical";
        case "first_download":
          return "active";
        case "first_scores":
          return "active";
        case "score_failed":
          return "critical";
        default:
          return assertNever(status.kind);
      }
    default:
      return assertNever(status);
  }
}

export function labelOf(status: Status): string {
  switch (status.of) {
    case "download":
      switch (status.state) {
        case "requested":
          return "Queued";
        case "running":
          return "Downloading";
        case "cancelling":
          return "Stopping";
        case "succeeded":
          return "Complete";
        case "partial":
          return "Partial";
        case "failed":
          return "Failed";
        case "cancelled":
          return "Cancelled by you";
        case "abandoned":
          return "Interrupted";
        default:
          return assertNever(status);
      }
    case "result":
      switch (status.outcome) {
        case "not_found":
          return "Not found";
        case "failed":
          return "Failed";
        default:
          return assertNever(status.outcome);
      }
    case "scores":
      switch (status.state) {
        case "building":
          return "Updating";
        case "not_current":
          return "Not reflecting the latest download";
        case "failed":
          return "Score update failed";
        case "never_classified":
          return "No scores yet";
        case "current":
          return "Current";
        default:
          return assertNever(status);
      }
    case "check":
      switch (status.status) {
        case "ok":
          switch (status.check) {
            case "daily_prices":
              return "No missing prices or gaps";
            case "company_financials":
              return "All financials present";
            default:
              return assertNever(status.check);
          }
        case "exceptions":
          return "Needs attention";
        default:
          return assertNever(status.status);
      }
    case "credential":
      return status.present ? "Found" : "Missing";
    case "item":
      switch (status.kind) {
        case "data_problems":
          return "Data";
        case "download_not_complete":
          return "Download";
        case "credential_missing":
          return "Setup";
        case "first_download":
          return "Download";
        case "first_scores":
          return "Scores";
        case "score_failed":
          return "Scores";
        default:
          return assertNever(status.kind);
      }
    default:
      return assertNever(status);
  }
}
