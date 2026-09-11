import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LifecycleBadge } from "./badges";

// TC-COMP-134 (T013): every status shown carries a text label plus
// icon/shape and reads in greyscale — not colour alone (DAC-E2-S4-7).
describe("LifecycleBadge", () => {
  it("renders the active state with a text label and an icon", () => {
    render(<LifecycleBadge lifecycle="active" />);
    const badge = screen.getByTestId("lifecycle-badge");
    expect(badge).toHaveTextContent("Active");
    expect(badge).toHaveAttribute("data-variant", "default");
    expect(badge.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the retired state with a distinct shape and the secondary variant", () => {
    render(<LifecycleBadge lifecycle="retired" />);
    const badge = screen.getByTestId("lifecycle-badge");
    expect(badge).toHaveTextContent("Retired");
    expect(badge).toHaveAttribute("data-variant", "secondary");
    // Distinguishable by shape, not colour alone: the retired icon is a
    // hollow shape (stroke, no fill), the active icon a filled one.
    expect(badge.querySelector("svg rect")).toHaveAttribute("fill", "none");
  });
});
