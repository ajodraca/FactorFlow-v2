import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StartAction } from "./start-action";

// TC-COMP-107, TC-COMP-130 (T007): with history depth unset, the Start
// action renders `blocked` with its reason, staying focusable and exposing
// the reason through `aria-describedby` rather than a bare `disabled`
// attribute (DAC-E2-9, DAC-E2-S4-3).
describe("StartAction — blocked when history depth is unset", () => {
  it("renders the blocked variant, stays focusable, and exposes its reason via aria-describedby", () => {
    render(<StartAction historyDepthYears={null} />);

    const button = screen.getByRole("button", { name: /start acquisition run/i });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).not.toHaveAttribute("disabled");
    expect(button.tabIndex).toBe(0);

    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const reason = document.getElementById(describedBy as string);
    expect(reason?.textContent).toMatch(/history depth is not set/i);
  });

  it("renders the default, unblocked variant once history depth is set", () => {
    render(<StartAction historyDepthYears={5} />);

    const button = screen.getByRole("button", { name: /start acquisition run/i });
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).not.toHaveAttribute("aria-describedby");
  });
});
