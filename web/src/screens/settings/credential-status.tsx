import type { JSX } from "react";
import type { Liveness } from "../../app/status-region";

/**
 * The read-only `card` `summary` credential region (component design
 * sections 2.5, 4; ux-design section 1.3; AC-13).
 *
 * States presence only — never a field, never masked, never a last-four.
 * When health is unreachable, presence renders as `coverage-unknown`
 * rather than as missing, so this region never reports a credential absent
 * on the strength of a failed request; the README documents
 * `FACTORFLOW_MASSIVE_API_KEY` as the variable named when missing, which
 * matches what the process itself reports at start.
 */
const CREDENTIAL_ENV_VAR = "FACTORFLOW_MASSIVE_API_KEY";

type PresenceVariant = "status-good" | "status-critical" | "coverage-unknown";

function badgeFor(liveness: Liveness, credentialPresent: boolean | null): PresenceVariant {
  if (liveness !== "answering" || credentialPresent === null) {
    return "coverage-unknown";
  }
  return credentialPresent ? "status-good" : "status-critical";
}

export function CredentialStatus({
  liveness,
  credentialPresent,
}: {
  liveness: Liveness;
  credentialPresent: boolean | null;
}): JSX.Element {
  const variant = badgeFor(liveness, credentialPresent);

  return (
    <div
      data-testid="credential-status"
      className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-card-foreground"
    >
      <h2 className="text-base">Provider credential</h2>
      <div className="flex items-center gap-2">
        <span
          data-testid="credential-badge"
          data-variant={variant}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
        >
          {variant === "coverage-unknown"
            ? "Unknown"
            : variant === "status-good"
              ? "Good"
              : "Critical"}
        </span>
        <p>
          {variant === "coverage-unknown"
            ? "Provider credential presence is unknown while the product is not answering."
            : credentialPresent
              ? "Provider credential supplied"
              : `Provider credential missing. Set ${CREDENTIAL_ENV_VAR}.`}
        </p>
      </div>
    </div>
  );
}
