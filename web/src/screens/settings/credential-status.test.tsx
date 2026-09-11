import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CredentialStatus } from "./credential-status";

// T016: the credential region never renders a value, masked value, or
// last-four — only the two presence states or coverage-unknown when
// health is unreachable (AC-13, component design section 4).
describe("CredentialStatus", () => {
  it("states presence with the status-good badge when the credential is present", () => {
    render(<CredentialStatus liveness="answering" credentialPresent={true} />);

    expect(screen.getByText("Provider credential supplied")).toBeInTheDocument();
    expect(screen.getByTestId("credential-badge")).toHaveAttribute("data-variant", "status-good");
  });

  it("states absence and never a value when the credential is missing, naming the variable", () => {
    render(<CredentialStatus liveness="answering" credentialPresent={false} />);

    expect(screen.getByText(/provider credential missing/i)).toBeInTheDocument();
    expect(screen.getByText(/FACTORFLOW_MASSIVE_API_KEY/)).toBeInTheDocument();
    expect(screen.getByTestId("credential-badge")).toHaveAttribute(
      "data-variant",
      "status-critical",
    );
  });

  it("renders coverage-unknown, never missing, when health is unreachable", () => {
    render(<CredentialStatus liveness="unreachable" credentialPresent={null} />);

    expect(screen.getByTestId("credential-badge")).toHaveAttribute(
      "data-variant",
      "coverage-unknown",
    );
    expect(screen.queryByText(/provider credential missing/i)).not.toBeInTheDocument();
    expect(screen.getByText(/presence is unknown/i)).toBeInTheDocument();
  });

  it("never renders a credential value, a masked value, or a last-four anywhere", () => {
    const { container } = render(
      <CredentialStatus liveness="answering" credentialPresent={true} />,
    );
    expect(container.textContent ?? "").not.toMatch(/\*{2,}|•{2,}|last.?four/i);
  });
});
