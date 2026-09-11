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

/**
 * A filled circle: supplied. A cross: missing. A dashed hollow circle:
 * unknown. Three distinct shapes rather than the same shape recoloured, so
 * the states are distinguishable in greyscale (STD-UI-8, DAC-E2-S4-7), the
 * same way `LifecycleIcon` (`badges.tsx`) already is (IR-007).
 */
function CredentialIcon({ variant }: { variant: PresenceVariant }): JSX.Element {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
      {variant === "status-good" ? (
        <circle cx="6" cy="6" r="5" fill="currentColor" />
      ) : variant === "status-critical" ? (
        <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2" fill="none" />
      ) : (
        <circle
          cx="6"
          cy="6"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2 1.5"
        />
      )}
    </svg>
  );
}

/**
 * The badge's actual visual treatment per variant (IR-007): `data-variant`
 * alone carried no style rule, so the three states rendered visually
 * identical text with no colour or shape distinction at all. `status-good`
 * and `status-critical` map to component design section 2.5's own badge
 * mapping; `coverage-unknown` takes the neutral `secondary` treatment
 * `LifecycleBadge` already uses for its own non-primary state.
 */
const BADGE_CLASS_NAME: Record<PresenceVariant, string> = {
  "status-good": "bg-status-good-muted text-status-good",
  "status-critical": "bg-status-critical-muted text-status-critical",
  "coverage-unknown": "bg-secondary text-secondary-foreground",
};

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
          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${BADGE_CLASS_NAME[variant]}`}
        >
          <CredentialIcon variant={variant} />
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
