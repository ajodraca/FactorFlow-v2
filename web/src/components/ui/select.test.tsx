import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// Radix Select needs three pointer and scroll methods and ResizeObserver, none
// of which jsdom provides. The prototype methods are defined once; the shared
// test setup unstubs globals after each test, so ResizeObserver is stubbed
// before each.
//
// jsdom's selector engine (nwsapi) also recurses on the `:fullscreen` and
// `:modal` pseudo-classes, which jsdom's own default stylesheet asks about on
// every computed-style read. The popper positioning reads styles, and opening
// the list then takes about eight seconds. Neither pseudo-class can match in
// jsdom, so they are answered directly.
const originalMatches = Element.prototype.matches;
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.matches = function matches(this: Element, selector: string) {
    return selector === ":fullscreen" || selector === ":modal"
      ? false
      : originalMatches.call(this, selector);
  };
});

afterAll(() => {
  Element.prototype.matches = originalMatches;
});

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

function renderSelect(changeSpy = vi.fn()) {
  render(
    <Select defaultValue="all" onValueChange={changeSpy}>
      <SelectTrigger aria-label="Lifecycle">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All stocks</SelectItem>
        <SelectItem value="followed">Followed</SelectItem>
        <SelectItem value="stopped">Stopped following</SelectItem>
      </SelectContent>
    </Select>,
  );
  return { changeSpy, trigger: screen.getByRole("combobox", { name: "Lifecycle" }) };
}

// Implements TC-COMP-009
describe("select inline opens and closes from the keyboard (DAC-E1-S2-1, AC-25)", () => {
  it("exposes combobox and listbox roles and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const { trigger, changeSpy } = renderSelect();

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("All stocks");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "All stocks" })).toHaveAttribute("data-highlighted");

    await user.keyboard("{ArrowDown}{Enter}");
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy).toHaveBeenCalledWith("followed");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent("Followed");

    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveTextContent("Followed");
    expect(trigger).toHaveFocus();
  });

  it("is the inline variant with the control classes", () => {
    const { trigger } = renderSelect();
    expect(trigger).toHaveAttribute("data-variant", "inline");
    for (const name of ["h-7", "rounded", "border", "border-input", "bg-background"]) {
      expect(trigger).toHaveClass(name);
    }
  });

  it("shows the --ring focus ring and the base text size on the trigger (AC-25, AC-26)", () => {
    const { trigger } = renderSelect();
    for (const name of ["focus:outline-none", "focus:ring", "focus:ring-ring", "text-base"]) {
      expect(trigger).toHaveClass(name);
    }
    expect(trigger).not.toHaveClass("text-sm");
    expect(trigger.className).not.toMatch(/(^|\s)(focus:)?ring-(2|offset-)/);
  });

  it("styles the open content and its options with theme tokens", async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.tab();
    await user.keyboard("{Enter}");
    const content = screen.getByRole("listbox").closest("[data-radix-popper-content-wrapper] > *");
    const surface = content ?? screen.getByRole("listbox");
    for (const name of ["bg-popover", "text-popover-foreground", "border", "border-border"]) {
      expect(surface).toHaveClass(name);
    }
    expect(surface.className).not.toMatch(/(^|\s)animate-/);
    // Shipped shadow and maximum height resolve to Tailwind defaults (DAC-E1-12).
    expect(surface.className).not.toMatch(/(^|\s)(shadow|max-h-\d)/);
    expect(surface).toHaveClass("max-h-[var(--radix-select-content-available-height)]");
    const option = screen.getByRole("option", { name: "Followed" });
    expect(option).toHaveClass(
      "h-row",
      "rounded",
      "py-1",
      "pl-6",
      "pr-2",
      "text-base",
      "data-[highlighted]:bg-accent",
      "data-[highlighted]:text-accent-foreground",
    );
    expect(option.className).not.toMatch(/(^|\s)(rounded-sm|py-1\.5|pl-8)(\s|$)/);
    const indicatorBox = option.querySelector("span.absolute");
    expect(indicatorBox).toHaveClass("left-2", "h-4", "w-4");
    expect(indicatorBox?.className).not.toMatch(/3\.5/);
    const mark = screen.getByRole("option", { name: "All stocks" }).querySelector("svg");
    expect(mark).toHaveClass("h-4", "w-4");
  });

  it("positions the popper content under the trigger with a trigger-sized viewport", async () => {
    const user = userEvent.setup();
    const { trigger } = renderSelect();
    await user.tab();
    await user.keyboard("{Enter}");
    const wrapper = document.querySelector("[data-radix-popper-content-wrapper]");
    expect(wrapper).not.toBeNull();
    const content = wrapper?.firstElementChild;
    expect(content).toHaveClass(
      "data-[side=bottom]:translate-y-1",
      "data-[side=top]:-translate-y-1",
    );
    expect(content).toHaveClass(
      "min-w-[var(--radix-select-trigger-width)]",
      "overflow-hidden",
      "rounded",
    );
    const viewport = content?.querySelector("[data-radix-select-viewport]");
    expect(viewport).toHaveClass("p-1", "h-[var(--radix-select-trigger-height)]", "w-full");
    expect(trigger.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(trigger.querySelector("svg")).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("styles a group label and a separator with theme tokens", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="a">
        <SelectTrigger aria-label="Pick">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group</SelectLabel>
            <SelectItem value="a">A</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="b">B</SelectItem>
        </SelectContent>
      </Select>,
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Group")).toHaveClass(
      "text-base",
      "text-muted-foreground",
      "font-semibold",
      "pl-6",
      "pr-2",
      "py-1",
    );
    const separator = document.querySelector(".h-px");
    expect(separator).toHaveClass("-mx-1", "my-1", "h-px", "bg-muted");
  });

  it("highlights the matching option when a letter is typed while open", async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard("s");
    expect(screen.getByRole("option", { name: "Stopped following" })).toHaveAttribute(
      "data-highlighted",
    );
  });
});
