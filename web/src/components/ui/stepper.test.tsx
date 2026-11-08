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
    document.addEventListener("click", clicked);
    await user.click(link);
    document.removeEventListener("click", clicked);
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
