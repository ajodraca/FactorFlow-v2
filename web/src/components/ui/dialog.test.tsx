import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./dialog";

const TITLE = "Stop following AAPL";
const DESCRIPTION =
  "Stop following AAPL? Its history is kept, and strategies holding it keep holding it. You can follow it again later.";
const CONFIRM = "Stop following";

function Harness({
  onConfirm,
  onOpenChange,
  pending = false,
  withRefusal = false,
}: {
  onConfirm: () => void;
  onOpenChange?: (open: boolean) => void;
  pending?: boolean;
  withRefusal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {TITLE}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          setOpen(next);
        }}
        title={TITLE}
        description={DESCRIPTION}
        confirmLabel={CONFIRM}
        onConfirm={onConfirm}
        pending={pending}
      >
        {withRefusal ? <p>Couldn't stop following AAPL: not found.</p> : null}
      </ConfirmDialog>
    </>
  );
}

function overlay(): Element {
  const node = document.querySelector("[data-slot='overlay']");
  if (node === null) throw new Error("no overlay rendered");
  return node;
}

// Implements TC-COMP-012
describe("dialog confirm traps focus, Cancel first and focused, Esc restores focus (DAC-E1-S3-1, DAC-E1-14, AC-25)", () => {
  it("is a modal dialog with Cancel first and focused, traps Tab and returns focus on Esc", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} />);
    const opener = screen.getByRole("button", { name: TITLE });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(dialog).toHaveAccessibleDescription(DESCRIPTION);

    const buttons = within(dialog).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", CONFIRM]);
    expect(buttons[0]).toHaveFocus();

    await user.tab();
    expect(within(dialog).getByRole("button", { name: CONFIRM })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole("button", { name: CONFIRM })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveFocus();
  });

  it("closes on a click on the overlay and returns focus to the opener", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} />);
    const opener = screen.getByRole("button", { name: TITLE });
    await user.click(opener);
    await screen.findByRole("dialog", { name: TITLE });

    await user.click(overlay());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveFocus();
  });
});

describe("ConfirmDialog contract (DEC-0301, DAC-E1-S3-1, DAC-E1-15)", () => {
  it("calls onConfirm exactly once on confirm and stays open until the consumer closes it", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    const dialog = await screen.findByRole("dialog", { name: TITLE });

    await user.click(within(dialog).getByRole("button", { name: CONFIRM }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
  });

  it("does not close and does not confirm while pending", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(<Harness onConfirm={onConfirm} onOpenChange={onOpenChange} pending />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    onOpenChange.mockClear();

    expect(dialog).toHaveAttribute("aria-busy", "true");
    const confirm = within(dialog).getByRole("button", { name: CONFIRM });
    expect(confirm).toHaveAttribute("aria-disabled", "true");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    await user.click(overlay());
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("is not busy when not pending", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(dialog).not.toHaveAttribute("aria-busy");
    expect(within(dialog).getByRole("button", { name: CONFIRM })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("is not pending when the prop is omitted", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title={TITLE}
        description={DESCRIPTION}
        confirmLabel={CONFIRM}
        onConfirm={onConfirm}
      />,
    );
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(dialog).not.toHaveAttribute("aria-busy");
    await user.click(within(dialog).getByRole("button", { name: CONFIRM }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders children between the description and the buttons", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} withRefusal />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    const refusal = within(dialog).getByText("Couldn't stop following AAPL: not found.");
    const description = within(dialog).getByText(DESCRIPTION);
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    expect(
      description.compareDocumentPosition(refusal) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(refusal.compareDocumentPosition(cancel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses the default button variant and no destructive styling (DAC-E1-15)", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    const dialog = await screen.findByRole("dialog", { name: TITLE });
    expect(within(dialog).getByRole("button", { name: CONFIRM })).toHaveAttribute(
      "data-variant",
      "default",
    );
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
    expect(dialog.querySelector("[class*='bg-destructive']")).toBeNull();
    expect(dialog.className).not.toContain("bg-destructive");
  });
});

function tokensOf(node: Element | null | undefined): string[] {
  if (!node) throw new Error("node not rendered");
  return node.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

// AC-26, DAC-E1-12: the confirm dialog's surface takes the popover tokens and none of the
// Tailwind-default literals the shadcn source ships (dialog spec section 6, DEC-0305).
describe("dialog confirm resolves to design-system tokens, not shipped literals (AC-26, IR-002, IR-003)", () => {
  async function openContent() {
    const user = userEvent.setup();
    render(<Harness onConfirm={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: TITLE }));
    return screen.findByRole("dialog", { name: TITLE });
  }

  it("styles the content with the popover surface, the prose measure and the theme radius", async () => {
    const tokens = tokensOf(await openContent());
    for (const token of [
      "max-w-prose",
      "rounded",
      "border",
      "border-border",
      "bg-popover",
      "text-popover-foreground",
      "p-6",
    ]) {
      expect(tokens, token).toContain(token);
    }
    for (const shipped of [
      "max-w-lg",
      "rounded-lg",
      "shadow-lg",
      "bg-background",
      "text-foreground",
    ]) {
      expect(tokens, shipped).not.toContain(shipped);
    }
  });

  it("styles the overlay with the foreground scrim, not black", async () => {
    await openContent();
    const tokens = tokensOf(overlay());
    expect(tokens).toContain("bg-foreground/40");
    expect(tokens).not.toContain("bg-black/80");
  });
});
