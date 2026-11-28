import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetireDialog } from "./retire-dialog";

// Implements TC-COMP-199
// The stop-following confirmation is `dialog` `confirm`, never `destructive`; it
// carries the blueprint section 9 wording, states that a download under way still
// finishes with the stock included, and traps and returns focus (DAC-E7-S3-2,
// DAC-E7-9, AC-17, AC-25). The delivered cases (TC-COMP-109, TC-COMP-129, IR-004,
// IR-006) are carried, relabelled. DEC-0390: the running-download sentence renders
// every time, as delivered.
describe("RetireDialog — stop following", () => {
  it("renders the confirm variant with the stop-following wording and Cancel first and focused", async () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(dialog.textContent).not.toMatch(/destructive|delete|remove/i);
    expect(screen.getByRole("heading", { name: "Stop following AAPL?" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      "Its history is kept, and strategies holding it keep holding it. You can follow it again later.",
    );

    const names = within(dialog)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(names).toEqual(["Cancel", "Stop following"]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
  });

  it("always states that a download under way still finishes with the stock included", () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "A download is running and will still download AAPL this time. Stopping takes effect from the next download.",
    );
  });

  it("calls onConfirm, and not onCancel, when Stop following is activated", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<RetireDialog symbol="AAPL" onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Stop following" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  // IR-002: the confirmation is held while the stop is in flight.
  it("holds the confirmation while pending: no second onConfirm, and Escape does not cancel", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<RetireDialog symbol="AAPL" pending onConfirm={onConfirm} onCancel={onCancel} />);

    const confirm = screen.getByRole("button", { name: "Stop following" });
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    await user.click(confirm);
    await user.keyboard("{Escape}");

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<RetireDialog symbol="AAPL" onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  // IR-004: a failed stop is visible in the dialog itself, which stays open.
  it("renders a visible error naming the operation and symbol, and stays open", () => {
    render(
      <RetireDialog
        symbol="AAPL"
        error="service unavailable"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Stopping following AAPL failed: service unavailable");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders no error when none is passed", () => {
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // IR-006 / AC-25: the dialog traps focus rather than letting Tab escape it.
  it("traps focus, wrapping Tab from Stop following back to Cancel", async () => {
    const user = userEvent.setup();
    render(<RetireDialog symbol="AAPL" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    screen.getByRole("button", { name: "Stop following" }).focus();
    await user.tab();

    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });
});
