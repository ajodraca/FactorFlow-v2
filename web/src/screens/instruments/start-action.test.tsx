import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { StartAction } from "./start-action";

function renderAction(historyDepthYears: number | null) {
  return render(
    <MemoryRouter>
      <StartAction historyDepthYears={historyDepthYears} />
    </MemoryRouter>,
  );
}

// TC-COMP-107, TC-COMP-130: with history depth unset, the action renders `blocked`
// with its reason, staying focusable and exposing the reason through
// `aria-describedby` rather than a bare `disabled`; the reason links to Settings
// directly (DAC-E2-9, DAC-E2-S4-3, AC-18, AC-19).
describe("StartAction — blocked when history depth is unset", () => {
  it("renders the blocked variant, stays focusable, and exposes its reason via aria-describedby", async () => {
    renderAction(null);

    const button = screen.getByRole("button", { name: "Download now" });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");

    const reason = document.getElementById(button.getAttribute("aria-describedby") as string);
    expect(reason).toHaveTextContent(
      "History depth is not set. Set it in Settings before downloading.",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");

    await userEvent.setup().tab();
    expect(button).toHaveFocus();
  });

  it("renders the default, unblocked variant once history depth is set", () => {
    renderAction(5);

    const button = screen.getByRole("button", { name: "Download now" });
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });
});
