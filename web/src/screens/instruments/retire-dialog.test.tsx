import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetireDialog } from "./retire-dialog";

// TC-COMP-109, TC-COMP-129 (T008): the retire confirmation uses `dialog`
// `confirm`, never `destructive`; its copy says "Stop acquiring", not
// "Delete" or "Remove"; and states that a run already under way still
// finishes with the instrument included (AC-25, DAC-E2-11, DAC-E2-S4-2).
//
// IR-002: no production path can determine whether a run is actually in
// progress (no run-status source exists on these screens yet), so the
// component renders the sentence unconditionally rather than behind a
// literal that can never be reached from production. This is disclosed as
// a deviation and is one of the two options the review itself authorized.
describe("RetireDialog", () => {
  it("renders via the confirm variant, not destructive, with retirement wording and initial focus on cancel", () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "confirm");

    expect(dialog.textContent).toContain("Stop acquiring");
    expect(dialog.textContent).not.toMatch(/delete|remove/i);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toHaveFocus();

    expect(screen.getByRole("button", { name: "Stop acquiring" })).toBeInTheDocument();
  });

  it("always states that an in-flight run still finishes with the instrument included", () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByText(/a run is in progress and will still acquire aapl this time/i),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm action is activated", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<RetireDialog symbol="AAPL" onConfirm={onConfirm} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Stop acquiring" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  // IR-004: a failed retirement must be visible in the dialog itself,
  // naming the operation and the symbol, rather than the dialog closing as
  // though the call had succeeded.
  it("renders a visible error naming the operation and symbol when retirement fails", () => {
    render(
      <RetireDialog symbol="AAPL" error="already retired" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/stopping acquisition for aapl failed/i);
    expect(alert.textContent).toMatch(/already retired/i);
  });

  it("renders no error when none is passed", () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // IR-006: the dialog traps focus rather than letting Tab escape it.
  it("traps focus, wrapping Tab from confirm back to cancel", async () => {
    const user = userEvent.setup();
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    const confirmButton = screen.getByRole("button", { name: "Stop acquiring" });

    confirmButton.focus();
    await user.tab();

    expect(cancelButton).toHaveFocus();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalled();
  });
});
