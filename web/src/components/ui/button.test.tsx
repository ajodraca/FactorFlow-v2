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

// AC-26 and AC-25: the classes that replace shadcn/ui's Tailwind-default
// literals, the visible focus indicator and the `blocked` presentation.
describe("button classes (AC-25, AC-26)", () => {
  function classesOf(variant: "default" | "blocked" | "outline"): string {
    const { unmount } = render(<Button variant={variant}>Label</Button>);
    const className = screen.getByRole("button", { name: "Label" }).className;
    unmount();
    return className;
  }

  it.each(["default", "blocked", "outline"] as const)(
    "sizes and rounds the %s variant from theme tokens",
    (variant) => {
      const className = classesOf(variant);
      expect(className.split(" ")).toEqual(
        expect.arrayContaining(["rounded", "px-3", "py-2", "text-base"]),
      );
      expect(className).not.toMatch(/rounded-/);
      expect(className).not.toMatch(/(^| )h-\d/);
      expect(className).not.toMatch(/ring-\d|ring-offset/);
    },
  );

  it.each(["default", "blocked", "outline"] as const)(
    "shows a focus-visible ring on the %s variant from the ring token",
    (variant) => {
      const classes = classesOf(variant).split(" ");
      expect(classes).toEqual(
        expect.arrayContaining([
          "focus-visible:outline-none",
          "focus-visible:ring",
          "focus-visible:ring-ring",
        ]),
      );
    },
  );

  it("presents blocked as inert and the default as the primary action", () => {
    const blocked = classesOf("blocked").split(" ");
    expect(blocked).toEqual(
      expect.arrayContaining([
        "border",
        "border-input",
        "bg-background",
        "text-muted-foreground",
        "cursor-not-allowed",
      ]),
    );
    expect(blocked.some((name) => /^(hover:)?bg-primary|^text-primary/.test(name))).toBe(false);
    const primary = classesOf("default").split(" ");
    expect(primary).toEqual(expect.arrayContaining(["bg-primary", "text-primary-foreground"]));
  });
});
