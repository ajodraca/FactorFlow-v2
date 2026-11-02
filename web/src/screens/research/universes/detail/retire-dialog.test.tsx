import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RetireDialog, type RetireDialogProps } from "./retire-dialog";

const RETIRED_REFUSAL =
  "This universe is retired and can't be changed. Its members and history are still viewable.";
const GENERIC = "Could not retire the universe: FactorFlow hit an unexpected problem. Try again.";

function renderDialog(overrides: Partial<RetireDialogProps> = {}) {
  const props: RetireDialogProps = {
    universeName: "Tech",
    error: null,
    pending: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<RetireDialog {...props} />) };
}

describe("RetireDialog (CAP-002-E1-S9)", () => {
  // Implements TC-COMP-044
  it("is the confirm variant with the retire wording, Cancel focused first, and confirming calls onConfirm once", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();

    const dialog = screen.getByRole("dialog", { name: "Retire Tech" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(document.querySelector('[data-variant="destructive"]')).toBeNull();
    expect(dialog).toHaveAccessibleDescription(
      "It leaves your active universes. Its members and history stay viewable.",
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  // T008 (a) to (d), DAC-E1-S9-4: keyboard, pending, errors and no overlay.
  it("Escape calls onCancel", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("Cancel calls onCancel", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("Tab from the last control wraps to Cancel", async () => {
    const user = userEvent.setup();
    renderDialog();
    screen.getByRole("button", { name: "Retire universe" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("Shift+Tab from Cancel wraps to the last control", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Retire universe" })).toHaveFocus();
  });

  it("Tab from Cancel moves forward to the confirm, inside the dialog", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.tab();
    expect(screen.getByRole("button", { name: "Retire universe" })).toHaveFocus();
  });

  it("Shift+Tab from the confirm moves back to Cancel, inside the dialog", async () => {
    const user = userEvent.setup();
    renderDialog();
    screen.getByRole("button", { name: "Retire universe" }).focus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("restores focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = renderDialog();
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("while pending natively disables the confirm and not Cancel", () => {
    renderDialog({ pending: true });
    expect(screen.getByRole("button", { name: "Retire universe" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("is enabled when not pending", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Retire universe" })).toBeEnabled();
  });

  it("moves focus to Cancel when the focused confirm becomes pending, so Escape still works", async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderDialog();
    screen.getByRole("button", { name: "Retire universe" }).focus();
    rerender(<RetireDialog {...props} pending />);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("moves focus to Cancel when a browser dropped it from the confirm that became pending", () => {
    const { props, rerender } = renderDialog();
    const confirm = screen.getByRole("button", { name: "Retire universe" });
    confirm.focus();
    // A browser drops focus from a control it disables; jsdom does not, so the test does.
    confirm.blur();
    rerender(<RetireDialog {...props} pending />);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("leaves focus where it is when it is already inside the dialog", () => {
    const { props, rerender } = renderDialog();
    const confirm = screen.getByRole("button", { name: "Retire universe" });
    confirm.focus();
    rerender(<RetireDialog {...props} error="generic" />);
    expect(confirm).toHaveFocus();
  });

  it("is busy while pending and not otherwise", () => {
    const { props, rerender } = renderDialog();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-busy");
    rerender(<RetireDialog {...props} pending />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
  });

  it("with a disabled confirm, Tab and Shift+Tab stay on Cancel", async () => {
    const user = userEvent.setup();
    renderDialog({ pending: true });
    const cancel = screen.getByRole("button", { name: "Cancel" });
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(cancel).toHaveFocus();
  });

  it("states universe_retired by code as an alert and keeps the confirm enabled", () => {
    renderDialog({ error: "universe_retired" });
    expect(screen.getByRole("alert")).toHaveTextContent(RETIRED_REFUSAL);
    expect(screen.getByRole("button", { name: "Retire universe" })).toBeEnabled();
  });

  it("states any other failure with the generic sentence", () => {
    renderDialog({ error: "generic" });
    expect(screen.getByRole("alert")).toHaveTextContent(GENERIC);
  });

  it("renders no alert without an error", () => {
    renderDialog();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("has no overlay and does not close on an outside click", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    expect(document.querySelector('[data-slot="overlay"]')).toBeNull();
    await user.click(document.body);
    expect(props.onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders the universe name as text, never as markup", () => {
    renderDialog({ universeName: "<b>Tech</b>" });
    expect(screen.getByRole("dialog", { name: "Retire <b>Tech</b>" })).toBeInTheDocument();
    expect(document.querySelector("dialog b")).toBeNull();
  });
});
