import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupCard } from "./radio-group";

// Radix renders a hidden bubble input inside a form and measures it with
// ResizeObserver, which jsdom lacks. The shared test setup unstubs globals
// after each test, so it is stubbed again here.
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

const GROUP = "How do you want to name them?";
const PASTE_DESCRIPTION = "Paste symbols separated by commas or one per line.";
const LATER_DESCRIPTION =
  "Continue without stocks for now; you can follow them later from Data health.";

function renderGroup(changeSpy = vi.fn()) {
  render(
    <>
      <button type="button">Before</button>
      <RadioGroup aria-label={GROUP} onValueChange={changeSpy}>
        <RadioGroupCard value="paste" title="Paste a list" description={PASTE_DESCRIPTION} />
        <RadioGroupCard value="later" title="Add later" description={LATER_DESCRIPTION} />
      </RadioGroup>
      <button type="button">After</button>
    </>,
  );
  return {
    changeSpy,
    paste: screen.getByRole("radio", { name: "Paste a list" }),
    later: screen.getByRole("radio", { name: "Add later" }),
  };
}

/**
 * Presses an arrow key the way a person does: Radix checks the focused card on
 * the next animation frame, and only while the key is still down, so the key is
 * released after the selection has settled.
 */
async function pressArrow(
  user: ReturnType<typeof userEvent.setup>,
  key: "ArrowDown" | "ArrowUp",
  expected: HTMLElement,
) {
  await user.keyboard(`{${key}>}`);
  await waitFor(() => expect(expected).toHaveAttribute("aria-checked", "true"));
  await user.keyboard(`{/${key}}`);
}

// Implements TC-COMP-009
describe("radio-group cards are one tab stop with arrows moving the selection (DAC-E1-S2-1, AC-25)", () => {
  it("moves the selection with both arrow axes and is a single tab stop", async () => {
    const user = userEvent.setup();
    const { paste, later, changeSpy } = renderGroup();
    expect(screen.getByRole("radiogroup", { name: GROUP })).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.tab();
    expect(paste).toHaveFocus();

    await pressArrow(user, "ArrowDown", later);
    expect(later).toHaveFocus();
    expect(paste).toHaveAttribute("aria-checked", "false");
    expect(changeSpy).toHaveBeenLastCalledWith("later");

    await pressArrow(user, "ArrowUp", paste);
    expect(paste).toHaveFocus();
    expect(changeSpy).toHaveBeenLastCalledWith("paste");

    await pressArrow(user, "ArrowDown", later);
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("returns to the checked card on Shift+Tab, not to each radio in turn", async () => {
    const user = userEvent.setup();
    const { later } = renderGroup();
    await user.tab();
    await user.tab();
    await pressArrow(user, "ArrowDown", later);
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(later).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
  });

  it("names each card by its title and describes it by its explanatory line", () => {
    const { paste, later } = renderGroup();
    expect(paste).toHaveAccessibleName("Paste a list");
    expect(paste).toHaveAccessibleDescription(PASTE_DESCRIPTION);
    expect(later).toHaveAccessibleName("Add later");
    expect(later).toHaveAccessibleDescription(LATER_DESCRIPTION);
  });

  it("shows the title and description as blocks and hides the indicator box from assistive technology", () => {
    const { paste } = renderGroup();
    const title = screen.getByText("Paste a list");
    expect(title).toHaveClass("block", "font-semibold");
    const description = screen.getByText(PASTE_DESCRIPTION);
    expect(description).toHaveClass("block", "text-xs", "text-muted-foreground");
    const indicatorBox = paste.querySelector('[aria-hidden="true"]');
    expect(indicatorBox).not.toBeNull();
    expect(indicatorBox).toHaveClass("rounded-full", "border", "border-input");
    expect(indicatorBox).not.toContainElement(title);
  });

  it("is the cards variant in equal-width columns and leaves orientation unset", () => {
    renderGroup();
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("data-variant", "cards");
    expect(group).toHaveClass("grid", "grid-flow-col", "auto-cols-fr", "gap-3");
    expect(group).not.toHaveAttribute("aria-orientation");
  });

  it("rings the checked card with the foreground token", async () => {
    const user = userEvent.setup();
    const { paste, later } = renderGroup();
    await user.click(later);
    expect(later).toHaveAttribute("data-state", "checked");
    expect(paste).toHaveAttribute("data-state", "unchecked");
    for (const name of [
      "data-[state=checked]:ring-1",
      "data-[state=checked]:ring-foreground",
      "rounded",
      "border",
      "border-border",
      "bg-background",
      "p-4",
      "focus-visible:ring",
      "focus-visible:ring-ring",
    ]) {
      expect(later).toHaveClass(name);
    }
  });

  it("checks the whole card when its title text is clicked", async () => {
    const user = userEvent.setup();
    const { later, changeSpy } = renderGroup();
    await user.click(screen.getByText("Add later"));
    expect(later).toHaveAttribute("aria-checked", "true");
    expect(changeSpy).toHaveBeenCalledWith("later");
  });
});
