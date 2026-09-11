import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CredentialStatus } from "./credential-status";

// TC-COMP-134 (T013): the credential-status badge carries a text label
// alongside its shape/icon, and does not rely on colour alone
// (DAC-E2-S4-7).
describe("Credential badge — greyscale readability", () => {
  it("carries a text label distinguishing each of the three presence states", () => {
    const { rerender } = render(<CredentialStatus liveness="answering" credentialPresent={true} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/good/i);

    rerender(<CredentialStatus liveness="answering" credentialPresent={false} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/critical/i);

    rerender(<CredentialStatus liveness="unreachable" credentialPresent={null} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/unknown/i);
  });
});
