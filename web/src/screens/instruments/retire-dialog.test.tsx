import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetireDialog } from "./retire-dialog";

// TC-COMP-109, TC-COMP-129 (T008): the retire confirmation uses `dialog`
// `confirm`, never `destructive`; its copy says "Stop acquiring", not
// "Delete" or "Remove"; and — when a run is active — states that a run
// already under way still finishes with the instrument included (AC-25,
// DAC-E2-11, DAC-E2-S4-2).
describe("RetireDialog", () => {
  it("renders via the confirm variant, not destructive, with retirement wording and initial focus on cancel", () => {
    render(
      <RetireDialog symbol="AAPL" hasActiveRun={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "confirm");

    expect(dialog.textContent).toContain("Stop acquiring");
    expect(dialog.textContent).not.toMatch(/delete|remove/i);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toHaveFocus();

    expect(screen.getByRole("button", { name: "Stop acquiring" })).toBeInTheDocument();
  });

  it("adds the in-flight-run sentence when a run is active", () => {
    render(
      <RetireDialog symbol="AAPL" hasActiveRun={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(
      screen.getByText(/a run is in progress and will still acquire aapl this time/i),
    ).toBeInTheDocument();
  });

  it("omits the in-flight-run sentence when no run is active", () => {
    render(
      <RetireDialog symbol="AAPL" hasActiveRun={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.queryByText(/a run is in progress/i)).not.toBeInTheDocument();
  });

  it("calls onConfirm when the confirm action is activated", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RetireDialog symbol="AAPL" hasActiveRun={false} onConfirm={onConfirm} onCancel={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Stop acquiring" }));

    expect(onConfirm).toHaveBeenCalled();
  });
});
