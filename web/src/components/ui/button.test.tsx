import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

// Implements TC-COMP-006
describe("button blocked stays focusable, aria-disabled and inert (DAC-E1-S1-3)", () => {
  function renderBlocked() {
    const clickSpy = vi.fn();
    const submitSpy = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={submitSpy}>
        <Button variant="blocked" aria-describedby="reason" onClick={clickSpy}>
          Start download
        </Button>
        <p id="reason">History depth is not set.</p>
      </form>,
    );
    return { clickSpy, submitSpy, button: screen.getByRole("button", { name: "Start download" }) };
  }

  it("takes keyboard focus, announces itself as disabled and is described by its reason", async () => {
    const { button } = renderBlocked();
    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAccessibleDescription("History depth is not set.");
  });

  it("fires no handler and submits no form on Enter, Space or click", async () => {
    const { button, clickSpy, submitSpy } = renderBlocked();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(button);
    expect(clickSpy).not.toHaveBeenCalled();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("fires its handler exactly once on click for the default variant", async () => {
    const clickSpy = vi.fn();
    render(<Button onClick={clickSpy}>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    await userEvent.click(button);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).not.toHaveAttribute("aria-disabled");
  });

  it("renders its child element with the button's classes under asChild", () => {
    render(
      <Button asChild variant="outline">
        <a href="/runs">Runs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Runs" });
    expect(link).toHaveAttribute("data-variant", "outline");
    expect(link).toHaveClass("border", "bg-background");
  });
});
