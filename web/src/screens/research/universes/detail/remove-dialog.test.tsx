import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RemoveAction, RemoveDialog } from "./remove-dialog";

const LAST_MEMBER_BLOCKED = "This is the last member. Retire the universe instead.";
const LAST_MEMBER_REFUSED =
  "This is the last member, so it can't be removed. Retire the universe instead.";

function dialogProps(overrides: Partial<Parameters<typeof RemoveDialog>[0]> = {}) {
  return {
    symbol: "AAPL",
    universeName: "Tech",
    error: null,
    pending: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    onRetire: vi.fn(),
    ...overrides,
  };
}

describe("RemoveAction", () => {
  // Implements TC-COMP-043 (T006 a): DAC-E1-S8-4, DAC-E1-7, AC-5, AC-6.
  it("renders the sole member's Remove… blocked, focusable and described, with Retire… adjacent", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onRetire = vi.fn();
    render(
      <RemoveAction
        symbol="AAPL"
        universeName="Tech"
        soleMember
        onRemove={onRemove}
        onRetire={onRetire}
      />,
    );

    const remove = screen.getByRole("button", { name: "Remove AAPL from Tech" });
    expect(remove).toHaveAttribute("data-variant", "blocked");
    expect(remove).toBeEnabled();
    expect(remove).not.toHaveAttribute("disabled");
    expect(remove).toHaveAttribute("tabindex", "0");
    const describedBy = remove.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(LAST_MEMBER_BLOCKED);
    expect(remove).toHaveAccessibleDescription(LAST_MEMBER_BLOCKED);

    await user.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const retire = screen.getByRole("button", { name: "Retire…" });
    expect(retire.parentElement).toBe(remove.parentElement);
    remove.focus();
    await user.tab();
    expect(retire).toHaveFocus();

    await user.click(retire);
    expect(onRetire).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("ignores Enter and Space on the blocked Remove…", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <RemoveAction
        symbol="AAPL"
        universeName="Tech"
        soleMember
        onRemove={onRemove}
        onRetire={vi.fn()}
      />,
    );
    screen.getByRole("button", { name: "Remove AAPL from Tech" }).focus();
    await user.keyboard("{Enter} ");
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("renders the ghost Remove… named for its row when the member is not the sole one", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onRetire = vi.fn();
    render(
      <RemoveAction
        symbol="AAPL"
        universeName="Tech"
        soleMember={false}
        onRemove={onRemove}
        onRetire={onRetire}
      />,
    );

    const remove = screen.getByRole("button", { name: "Remove AAPL from Tech" });
    expect(remove).toHaveAttribute("data-variant", "ghost");
    expect(remove).toHaveTextContent("Remove…");
    expect(remove).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("button", { name: "Retire…" })).not.toBeInTheDocument();
    expect(screen.queryByText(LAST_MEMBER_BLOCKED)).not.toBeInTheDocument();

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRetire).not.toHaveBeenCalled();
  });

  it("stops a click from reaching the row it sits in", async () => {
    const user = userEvent.setup();
    const onRow = vi.fn();
    render(
      // biome-ignore lint/a11y/useKeyWithClickEvents: a stand-in for the results table's selectable row
      <div onClick={onRow}>
        <RemoveAction
          symbol="AAPL"
          universeName="Tech"
          soleMember={false}
          onRemove={vi.fn()}
          onRetire={vi.fn()}
        />
        <RemoveAction
          symbol="MSFT"
          universeName="Tech"
          soleMember
          onRemove={vi.fn()}
          onRetire={vi.fn()}
        />
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Remove AAPL from Tech" }));
    await user.click(screen.getByRole("button", { name: "Remove MSFT from Tech" }));
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    expect(onRow).not.toHaveBeenCalled();
  });
});

describe("RemoveDialog", () => {
  // Implements TC-COMP-043 (T006 b): DAC-E1-S8-4, DAC-E1-7, AC-5.
  it("keeps the dialog open on last_member with the backstop alert and Retire… in place of the confirm", async () => {
    const user = userEvent.setup();
    const props = dialogProps({ error: "last_member" });
    render(<RemoveDialog {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(LAST_MEMBER_REFUSED);
    expect(screen.queryByRole("button", { name: "Remove from universe" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retire…" }));
    expect(props.onRetire).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  // Implements TC-COMP-057 (T007): DAC-E1-S8-5, AC-6.
  it("is the confirm variant, states that history stays, and opens on Cancel", () => {
    render(<RemoveDialog {...dialogProps()} />);

    const dialog = screen.getByRole("dialog", { name: "Remove AAPL from Tech" });
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(dialog).not.toHaveAttribute("data-variant", "destructive");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.querySelector('[data-variant="destructive"]')).toBeNull();
    expect(dialog).toHaveTextContent(
      "Its membership until today stays in the universe's history. Its scores are not affected.",
    );
    expect(dialog).toHaveAccessibleDescription(
      "Its membership until today stays in the universe's history. Its scores are not affected.",
    );
    expect(screen.getByRole("button", { name: "Remove from universe" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onConfirm from Remove from universe and onCancel from Cancel and Esc", async () => {
    const user = userEvent.setup();
    const props = dialogProps();
    render(<RemoveDialog {...props} />);

    await user.click(screen.getByRole("button", { name: "Remove from universe" }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onCancel).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "Cancel" }).focus();
    await user.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(2);
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("traps Tab between Cancel and the last control in both directions", async () => {
    const user = userEvent.setup();
    render(<RemoveDialog {...dialogProps()} />);
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Remove from universe" });

    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
    // Inside the cycle Shift+Tab moves back as the browser would.
    await user.tab({ shift: true });
    expect(cancel).toHaveFocus();
  });

  it("traps Tab onto Retire… when it replaces the confirm", async () => {
    const user = userEvent.setup();
    render(<RemoveDialog {...dialogProps({ error: "last_member" })} />);
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const retire = screen.getByRole("button", { name: "Retire…" });

    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(retire).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
  });

  it("leaves other keys alone", async () => {
    const user = userEvent.setup();
    const props = dialogProps();
    render(<RemoveDialog {...props} />);
    await user.keyboard("a");
    expect(props.onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("returns focus to the element focused before it opened", async () => {
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Opener
          </button>
          {open ? <RemoveDialog {...dialogProps({ onCancel: () => setOpen(false) })} /> : null}
        </>
      );
    }
    render(<Host />);
    const opener = screen.getByRole("button", { name: "Opener" });
    await user.click(opener);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("natively disables the confirm, never Cancel, while pending", () => {
    render(<RemoveDialog {...dialogProps({ pending: true })} />);
    expect(screen.getByRole("button", { name: "Remove from universe" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
  });

  it("keeps focus in the dialog through pending and a last_member refusal", async () => {
    const user = userEvent.setup();
    const props = dialogProps();
    const { rerender } = render(<RemoveDialog {...props} />);
    const confirm = screen.getByRole("button", { name: "Remove from universe" });
    await user.click(confirm);
    expect(confirm).toHaveFocus();

    // A browser drops focus from a control it disables; jsdom does not, so the test does.
    confirm.blur();
    rerender(<RemoveDialog {...props} pending />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    // The disabled confirm is no stop: Tab stays on Cancel.
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    rerender(<RemoveDialog {...props} pending={false} error="last_member" />);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("moves focus to Cancel when the focused confirm becomes pending", async () => {
    const user = userEvent.setup();
    const props = dialogProps();
    const { rerender } = render(<RemoveDialog {...props} />);
    const confirm = screen.getByRole("button", { name: "Remove from universe" });
    await user.click(confirm);
    expect(confirm).toHaveFocus();
    rerender(<RemoveDialog {...props} pending />);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("keeps focus on Retire… when last_member replaces the focused confirm", async () => {
    const user = userEvent.setup();
    const props = dialogProps();
    const { rerender } = render(<RemoveDialog {...props} />);
    await user.click(screen.getByRole("button", { name: "Remove from universe" }));
    rerender(<RemoveDialog {...props} error="last_member" />);
    expect(screen.getByRole("button", { name: "Retire…" })).toHaveFocus();
  });

  it("moves focus to Retire… when last_member arrives with focus outside the dialog", () => {
    const props = dialogProps();
    const { rerender } = render(<RemoveDialog {...props} />);
    screen.getByRole("button", { name: "Cancel" }).blur();
    rerender(<RemoveDialog {...props} error="last_member" />);
    expect(screen.getByRole("button", { name: "Retire…" })).toHaveFocus();
  });

  it("leaves focus where it is when it is already inside the dialog", () => {
    const props = dialogProps();
    const { rerender } = render(<RemoveDialog {...props} />);
    const confirm = screen.getByRole("button", { name: "Remove from universe" });
    confirm.focus();
    rerender(<RemoveDialog {...props} error="generic" />);
    expect(confirm).toHaveFocus();
  });

  it("is not busy when nothing is pending", () => {
    render(<RemoveDialog {...dialogProps()} />);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-busy");
  });

  it("renders the generic failure as an alert and keeps the confirm", () => {
    render(<RemoveDialog {...dialogProps({ error: "generic" })} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "Could not remove the stock from the universe: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(alert).toHaveClass("text-[hsl(var(--destructive))]");
    expect(screen.getByRole("button", { name: "Remove from universe" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Retire…" })).not.toBeInTheDocument();
  });

  it("renders universe_retired as the retired refusal and keeps the confirm", () => {
    render(<RemoveDialog {...dialogProps({ error: "universe_retired" })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This universe is retired and can't be changed. Its members and history are still viewable.",
    );
    expect(screen.getByRole("button", { name: "Remove from universe" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retire…" })).not.toBeInTheDocument();
  });
});
