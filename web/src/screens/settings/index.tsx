import type { JSX } from "react";
import { useHealth } from "../../app/status-region";
import { CredentialStatus } from "./credential-status";
import { HistoryDepthForm } from "./history-depth-form";

/**
 * The Settings screen (component design section 2.5; ux-design section
 * 1.3; AC-2, AC-13), a single narrow column capped at `--measure-prose`
 * rather than a full-width table screen, with `--space-5` between its two
 * stacked regions (T026).
 */
export default function SettingsScreen(): JSX.Element {
  const { liveness, health } = useHealth();

  return (
    <div className="flex max-w-prose flex-col gap-5">
      <h1 className="text-xl">Settings</h1>
      <HistoryDepthForm />
      <CredentialStatus
        liveness={liveness}
        credentialPresent={liveness === "answering" ? (health?.credential_present ?? null) : null}
      />
    </div>
  );
}
