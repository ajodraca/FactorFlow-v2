import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Absent, NotDeterminable } from "./presence";

const REASON = "Gap detection needs at least two stocks with data in range.";

function badgeOf(container: HTMLElement): HTMLElement {
  const badge = container.querySelector<HTMLElement>("[data-variant]");
  if (!badge) throw new Error("no badge rendered");
  return badge;
}

// Implements TC-COMP-025
describe("NotDeterminable (TC-COMP-025)", () => {
  it("describes itself by its reason, which is also visible beside the badge", () => {
    render(<NotDeterminable reason={REASON} />);
    expect(screen.getByText("Not determinable")).toHaveAccessibleDescription(REASON);
    const reason = screen.getByText(REASON);
    expect(reason.closest("[data-variant]")).toBeNull();
    expect(reason).not.toHaveClass("sr-only");
  });

  it("is the coverage-unknown badge, never a passed check or a dimmed absent", () => {
    const { container } = render(<NotDeterminable reason={REASON} />);
    const badge = badgeOf(container);
    expect(badge).toHaveAttribute("data-variant", "coverage-unknown");
    expect(badge).toHaveClass(
      "bg-pattern-indeterminate",
      "bg-value-indeterminate-muted",
      "text-value-indeterminate",
    );
    expect(badge).not.toHaveClass("text-value-missing");
    expect(badge.className).not.toMatch(/opacity-/);
  });

  it("takes a caller's label and keeps the badge and the description", () => {
    const { container } = render(<NotDeterminable reason={REASON} label="Unknown" />);
    expect(screen.getByText("Unknown")).toHaveAccessibleDescription(REASON);
    expect(screen.queryByText("Not determinable")).toBeNull();
    expect(badgeOf(container)).toHaveAttribute("data-variant", "coverage-unknown");
  });

  it("gives two instances their own descriptions", () => {
    render(
      <>
        <NotDeterminable reason="First reason." />
        <NotDeterminable reason="Second reason." />
      </>,
    );
    const [first, second] = screen.getAllByText("Not determinable");
    expect(first).toHaveAccessibleDescription("First reason.");
    expect(second).toHaveAccessibleDescription("Second reason.");
  });

  it("is not a tab stop", async () => {
    render(<NotDeterminable reason={REASON} />);
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });
});

describe("Absent (TC-COMP-025 edge, DAC-E1-8)", () => {
  it("is an em dash hidden from assistive technology with the hidden words naming what is absent", () => {
    const { container } = render(<Absent label="No closing price" />);
    expect(container).toHaveTextContent(/^—No closing price$/);
    const dash = screen.getByText("—");
    expect(dash).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("No closing price")).toHaveClass("sr-only");
    expect(container.firstElementChild).toHaveClass("text-value-missing");
    expect(container.textContent).not.toMatch(/0/);
  });

  it("is not a tab stop and carries no role", async () => {
    render(<Absent label="No closing price" />);
    await userEvent.tab();
    expect(document.body).toHaveFocus();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
