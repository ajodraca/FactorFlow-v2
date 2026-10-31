import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NOTICES } from "./copy";
import { type Notice, NoticeRegion, universePath, useNotices } from "./notices";

/** A host as CAP-002-E4-S9 will be: `useNotices` once, `NoticeRegion` once (DEC-0168). */
function Host({ children }: { children?: (notify: (notice: Notice) => void) => JSX.Element }) {
  const { notices, notify, dismiss } = useNotices();
  return (
    <>
      {children?.(notify)}
      <NoticeRegion notices={notices} onDismiss={dismiss} />
    </>
  );
}

let captured: ((notice: Notice) => void) | null = null;
let returned: unknown = "not called";

function Capture({ notify }: { notify: (notice: Notice) => void }) {
  captured = notify;
  return null;
}

function renderHost() {
  captured = null;
  return render(
    <MemoryRouter>
      <Host>{(notify) => <Capture notify={notify} />}</Host>
    </MemoryRouter>,
  );
}

function raise(notice: Notice) {
  act(() => {
    returned = captured?.(notice);
  });
}

afterEach(() => {
  vi.useRealTimers();
});

// Implements T009 (DAC-E4-S8-3, DAC-E4-S8-5; DEC-0168, Open Gap 2).
describe("notices", () => {
  it("renders a polite status region that is present and empty before any notice", () => {
    renderHost();
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "false");
    // Focusable by script (the Dismiss target), never a Tab stop of its own.
    expect(region).toHaveAttribute("tabindex", "-1");
    expect(region).toBeEmptyDOMElement();
  });

  it("shows one success item per notice, with a router link when `to` is given", () => {
    renderHost();
    raise({ message: "Saved 12 stocks as Tech", to: "/research/universes/u-9" });
    const region = screen.getByRole("status");
    const items = region.querySelectorAll("[data-variant]");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute("data-variant", "success");
    // The toast's surface, text, accent and radius tokens (toast design spec section 6).
    expect(items[0]).toHaveClass(
      "border",
      "border-status-good",
      "bg-[hsl(var(--popover))]",
      "text-[hsl(var(--popover-foreground))]",
      "rounded-[var(--radius)]",
    );
    // The dismiss target is at least 24 by 24 CSS pixels: `--space-5` (toast design spec section 5).
    expect(within(region).getByRole("button", { name: NOTICES.dismiss })).toHaveClass(
      "min-h-5",
      "min-w-5",
    );
    const link = within(region).getByRole("link", { name: "Saved 12 stocks as Tech" });
    expect(link).toHaveAttribute("href", "/research/universes/u-9");
    expect(returned).toBeUndefined();
  });

  it("shows the message as plain text, with no link, when `to` is absent", () => {
    renderHost();
    raise({ message: "Added 3 stocks to Tech" });
    const region = screen.getByRole("status");
    expect(within(region).queryByRole("link")).toBeNull();
    expect(region.querySelector("[data-variant='success']")).toHaveTextContent(
      `Added 3 stocks to Tech${NOTICES.dismiss}`,
    );
  });

  it("renders a message as text, never as markup", () => {
    renderHost();
    raise({ message: "<b>Tech</b>", to: "/research/universes/u1" });
    const region = screen.getByRole("status");
    raise({ message: "<i>Dividend growers</i>" });
    expect(within(region).getByRole("link")).toHaveTextContent("<b>Tech</b>");
    expect(region).toHaveTextContent("<i>Dividend growers</i>");
    expect(region.querySelector("b, i")).toBeNull();
  });

  it("stacks items in arrival order", () => {
    renderHost();
    raise({ message: "First" });
    raise({ message: "Second", to: "/research/universes/u2" });
    raise({ message: "Third" });
    const items = [...screen.getByRole("status").querySelectorAll("[data-variant='success']")];
    expect(items.map((item) => item.textContent)).toEqual([
      `First${NOTICES.dismiss}`,
      `Second${NOTICES.dismiss}`,
      `Third${NOTICES.dismiss}`,
    ]);
  });

  it("dismisses only the chosen item and returns focus to the region", async () => {
    const user = userEvent.setup();
    renderHost();
    raise({ message: "First" });
    raise({ message: "Second" });
    raise({ message: "Third" });
    const region = screen.getByRole("status");
    const buttons = within(region).getAllByRole("button", { name: NOTICES.dismiss });
    expect(buttons).toHaveLength(3);
    await user.click(buttons[1] as HTMLElement);
    const items = [...region.querySelectorAll("[data-variant='success']")];
    expect(items.map((item) => item.textContent)).toEqual([
      `First${NOTICES.dismiss}`,
      `Third${NOTICES.dismiss}`,
    ]);
    expect(region).toHaveFocus();
  });

  it("gives each item a distinct id, so dismissing a later duplicate keeps the earlier one", async () => {
    const user = userEvent.setup();
    renderHost();
    raise({ message: "Same" });
    raise({ message: "Same" });
    const region = screen.getByRole("status");
    const buttons = within(region).getAllByRole("button", { name: NOTICES.dismiss });
    await user.click(buttons[0] as HTMLElement);
    expect(region.querySelectorAll("[data-variant='success']")).toHaveLength(1);
    raise({ message: "Other" });
    const after = within(region).getAllByRole("button", { name: NOTICES.dismiss });
    await user.click(after[1] as HTMLElement);
    expect(
      [...region.querySelectorAll("[data-variant='success']")].map((i) => i.textContent),
    ).toEqual([`Same${NOTICES.dismiss}`]);
  });

  it("removes nothing by time", () => {
    vi.useFakeTimers();
    renderHost();
    raise({ message: "Saved 12 stocks as Tech", to: "/research/universes/u-9" });
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(screen.getByRole("link", { name: "Saved 12 stocks as Tech" })).toBeInTheDocument();
  });

  it("still shows a notice raised by a callback of a component that has unmounted", () => {
    let late: ((notice: Notice) => void) | null = null;
    function Dialog({ notify }: { notify: (notice: Notice) => void }) {
      late = notify;
      return <p>dialog</p>;
    }
    function Toggle({ notify }: { notify: (notice: Notice) => void }) {
      const [open, setOpen] = useState(true);
      return (
        <>
          {open ? <Dialog notify={notify} /> : null}
          <button type="button" onClick={() => setOpen(false)}>
            close
          </button>
        </>
      );
    }
    render(
      <MemoryRouter>
        <Host>{(notify) => <Toggle notify={notify} />}</Host>
      </MemoryRouter>,
    );
    act(() => {
      screen.getByRole("button", { name: "close" }).click();
    });
    expect(screen.queryByText("dialog")).toBeNull();
    act(() => {
      late?.({ message: "Added 2 stocks to Tech" });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Added 2 stocks to Tech");
  });

  it("builds the universe detail link, encoding the id", () => {
    expect(universePath("u-9")).toBe("/research/universes/u-9");
    expect(universePath("a/b c")).toBe("/research/universes/a%2Fb%20c");
  });
});
