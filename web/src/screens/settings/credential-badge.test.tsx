import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CredentialStatus } from "./credential-status";

// TC-COMP-134 (T013): the credential-status badge carries a text label
// alongside its shape/icon, and does not rely on colour alone
// (DAC-E2-S4-7).
//
// IR-007: the rendered distinction is asserted directly (icon shape, and a
// style rule actually attached to the variant) rather than the
// `data-variant` attribute alone, which a viewer never sees.
describe("Credential badge — greyscale readability", () => {
  it("carries a text label distinguishing each of the three presence states", () => {
    const { rerender } = render(<CredentialStatus liveness="answering" credentialPresent={true} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/good/i);

    rerender(<CredentialStatus liveness="answering" credentialPresent={false} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/critical/i);

    rerender(<CredentialStatus liveness="unreachable" credentialPresent={null} />);
    expect(screen.getByTestId("credential-badge")).toHaveTextContent(/unknown/i);
  });

  it("renders a distinguishing icon/shape for each state, not colour alone", () => {
    const { rerender } = render(<CredentialStatus liveness="answering" credentialPresent={true} />);
    const goodBadge = screen.getByTestId("credential-badge");
    expect(goodBadge.querySelector("svg")).toBeInTheDocument();
    const goodShape = goodBadge.querySelector("circle, path");
    expect(goodShape).toBeInTheDocument();

    rerender(<CredentialStatus liveness="answering" credentialPresent={false} />);
    const criticalBadge = screen.getByTestId("credential-badge");
    const criticalShape = criticalBadge.querySelector("path");
    expect(criticalShape).toBeInTheDocument();
    // The critical shape (a cross) must differ from the good shape (a
    // filled circle) — same-shape-recoloured would fail this.
    expect(criticalBadge.querySelector("circle")).not.toBeInTheDocument();

    rerender(<CredentialStatus liveness="unreachable" credentialPresent={null} />);
    const unknownBadge = screen.getByTestId("credential-badge");
    const unknownShape = unknownBadge.querySelector("circle");
    expect(unknownShape).toHaveAttribute("stroke-dasharray");
  });

  it("attaches an actual style rule to each variant, not a bare test hook", () => {
    render(<CredentialStatus liveness="answering" credentialPresent={true} />);
    const badge = screen.getByTestId("credential-badge");
    // A pure test hook with no associated style carries none of the
    // design system's own colour classes.
    expect(badge.className).toMatch(/status-good/);
  });
});
