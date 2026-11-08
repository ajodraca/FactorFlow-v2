import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperStep } from "./stepper";

function renderStepper(onSelect = vi.fn()) {
  const steps: StepperStep[] = [
    { title: "Market data", state: "done", summary: "Found", href: "/setup", onSelect },
    { title: "How far back", state: "current" },
    { title: "Stocks to follow", state: "todo" },
    { title: "Download data", state: "todo" },
  ];
  render(<Stepper label="Setup steps" markerSize="var(--space-6)" steps={steps} />);
  return { onSelect };
}

// No mapped TC: the stepper half of DAC-E1-14 (Open Gap 6).
describe("stepper marks the current step and links only done steps (DAC-E1-14, AC-25, DEC-0304)", () => {
  it("is a labelled navigation holding one ordered list of four items", () => {
    renderStepper();
    const nav = screen.getByRole("navigation", { name: "Setup steps" });
    expect(nav).toHaveAttribute("data-variant", "vertical");
    const list = within(nav).getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  });

  it("sets aria-current=step on the current item only", () => {
    renderStepper();
    const items = screen.getAllByRole("listitem");
    const current = items.filter((item) => item.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("How far back");
  });

  it("links the done step, names each state in text, and gives the others no link", () => {
    renderStepper();
    const [done, current, todo] = screen.getAllByRole("listitem");
    expect(within(done).getByRole("link", { name: "Market data, done" })).toHaveAttribute(
      "href",
      "/setup",
    );
    expect(done).toHaveTextContent("Found");
    expect(within(current).queryByRole("link")).toBeNull();
    expect(current).toHaveTextContent("How far back, current");
    expect(within(todo).queryByRole("link")).toBeNull();
    expect(todo).toHaveTextContent("Stocks to follow, to do");
  });

  it("draws an aria-hidden dot per step, sized by the caller", () => {
    renderStepper();
    const items = screen.getAllByRole("listitem");
    const dots = items.map((item) => item.querySelector("[aria-hidden='true']:not(svg)"));
    for (const dot of dots) {
      expect(dot).not.toBeNull();
      expect((dot as HTMLElement).style.width).toBe("var(--space-6)");
      expect((dot as HTMLElement).style.height).toBe("var(--space-6)");
    }
    expect(dots[0]?.querySelector("svg")).not.toBeNull();
    expect(dots.slice(1).map((dot) => dot?.textContent)).toEqual(["2", "3", "4"]);
  });

  it("makes only the done link a tab stop and activates it with Enter", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderStepper();
    await user.tab();
    expect(screen.getByRole("link", { name: "Market data, done" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("links only a done step that has an href", () => {
    render(
      <Stepper
        label="Setup steps"
        markerSize="var(--space-6)"
        steps={[
          { title: "Done without href", state: "done" },
          { title: "Current with href", state: "current", href: "/current" },
          { title: "To do with href", state: "todo", href: "/todo" },
        ]}
      />,
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("follows the href when no onSelect is given", async () => {
    const user = userEvent.setup();
    render(
      <Stepper
        label="Setup steps"
        markerSize="var(--space-6)"
        steps={[{ title: "Market data", state: "done", href: "/setup" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Market data, done" });
    const clicked = vi.fn((event: MouseEvent) => event.defaultPrevented);
    // Records the flag, then stops jsdom attempting the navigation it does not implement.
    const observe = (event: MouseEvent) => {
      clicked(event);
      event.preventDefault();
    };
    document.addEventListener("click", observe);
    await user.click(link);
    document.removeEventListener("click", observe);
    expect(clicked).toHaveReturnedWith(false);
  });

  it("pins the dot shape and the link's focus ring to tokens", () => {
    renderStepper();
    const [done] = screen.getAllByRole("listitem");
    const dot = done.querySelector("[aria-hidden='true']:not(svg)");
    expect(dot?.className).toContain("shrink-0");
    expect(dot?.className).toContain("rounded-[50%]");
    const link = screen.getByRole("link", { name: "Market data, done" });
    expect(link.className).toContain("underline-offset-4");
    expect(link.className).toContain("focus-visible:ring-ring");
  });
});

function tokensOf(node: Element | null | undefined): string[] {
  if (!node) throw new Error("node not rendered");
  return node.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

// AC-25, AC-26, DAC-E1-14: the stepper's focus ring, dots, labels and summary take the tokens the
// stepper spec sections 3 and 6 name, its list is an `ol`, and activating a done step with
// `onSelect` never follows the href (IR-001 to IR-004).
describe("stepper resolves to design-system tokens and an ordered list (AC-25, AC-26, IR-001 to IR-004)", () => {
  function dotsAndTitles() {
    renderStepper();
    const items = screen.getAllByRole("listitem");
    return items.map((item) => ({
      dot: tokensOf(item.querySelector("[aria-hidden='true']:not(svg)")),
      title: tokensOf(
        item.querySelector("[aria-hidden='true']:not(svg)")?.nextElementSibling?.firstElementChild
          ?.firstElementChild,
      ),
    }));
  }

  it("renders the list as an ol", () => {
    renderStepper();
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("gives the done link a ring of the focus width in the ring colour, and no ring-4 or outline", () => {
    renderStepper();
    const tokens = tokensOf(screen.getByRole("link", { name: "Market data, done" }));
    expect(tokens).toContain("focus-visible:ring");
    expect(tokens).toContain("focus-visible:ring-ring");
    expect(tokens).toContain("focus-visible:outline-none");
    expect(tokens).not.toContain("focus-visible:ring-4");
  });

  it("draws the done dot filled, the current dot ringed and the to-do dot outlined", () => {
    const [done, current, todo] = dotsAndTitles().map(({ dot }) => dot);
    expect(done).toEqual(expect.arrayContaining(["bg-foreground", "text-background"]));
    expect(done).not.toContain("bg-status-good");
    expect(current).toEqual(
      expect.arrayContaining([
        "border",
        "border-status-active",
        "ring",
        "ring-status-active-muted",
      ]),
    );
    expect(current).not.toContain("ring-4");
    expect(todo).toEqual(
      expect.arrayContaining(["border", "border-border", "text-muted-foreground"]),
    );
  });

  it("sets every dot's number in the numeric face", () => {
    for (const { dot } of dotsAndTitles()) {
      expect(dot).toContain("font-numeric");
      expect(dot).toContain("text-xs");
    }
  });

  it("weights the current title 600 and mutes the to-do title", () => {
    const [, current, todo] = dotsAndTitles().map(({ title }) => title);
    expect(current).toEqual(expect.arrayContaining(["font-semibold", "text-foreground"]));
    expect(todo).toContain("text-muted-foreground");
    expect(todo).not.toContain("text-foreground");
  });

  it("sets the summary in the small muted face", () => {
    renderStepper();
    const summary = screen.getByText("Found");
    expect(tokensOf(summary)).toEqual(expect.arrayContaining(["text-xs", "text-muted-foreground"]));
  });

  it("prevents the browser following the href when onSelect handles the click", async () => {
    const user = userEvent.setup();
    renderStepper();
    const link = screen.getByRole("link", { name: "Market data, done" });
    const defaultPrevented = vi.fn((event: MouseEvent) => event.defaultPrevented);
    // Runs in the bubble phase after React's handler, then stops jsdom navigating.
    const observe = (event: MouseEvent) => {
      defaultPrevented(event);
      event.preventDefault();
    };
    document.addEventListener("click", observe);
    await user.click(link);
    document.removeEventListener("click", observe);
    expect(defaultPrevented).toHaveReturnedWith(true);
  });
});
