import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

// Implements TC-COMP-010
describe("input (DAC-E1-S2-2, AC-25)", () => {
  it("renders the text variant by default", () => {
    render(<Input aria-label="Symbol" />);
    const field = screen.getByRole("textbox", { name: "Symbol" });
    expect(field).toHaveAttribute("data-variant", "text");
    expect(["text", null]).toContain(field.getAttribute("type"));
    for (const name of ["h-7", "rounded", "border", "border-input", "bg-background"]) {
      expect(field).toHaveClass(name);
    }
  });

  it("shows the --ring focus ring and the spec's text and placeholder tokens (AC-25, AC-26)", () => {
    render(<Input aria-label="Symbol" />);
    const field = screen.getByRole("textbox", { name: "Symbol" });
    for (const name of [
      "focus-visible:outline-none",
      "focus-visible:ring",
      "focus-visible:ring-ring",
      "text-base",
      "text-foreground",
      "placeholder:text-muted-foreground",
    ]) {
      expect(field).toHaveClass(name);
    }
    // The shipped ring width, ring offset and breakpoint text size resolve to
    // Tailwind defaults outside the theme (DAC-E1-12), so they must stay out.
    expect(field.className).not.toMatch(/(^|\s)(focus-visible:)?ring-(2|offset-)/);
    expect(field.className).not.toMatch(/(^|\s)md:/);
  });

  it("renders the numeric variant right-aligned in tabular figures", () => {
    render(<Input variant="numeric" aria-label="Depth" />);
    const field = screen.getByRole("spinbutton", { name: "Depth" });
    expect(field).toHaveAttribute("type", "number");
    expect(field).toHaveAttribute("inputmode", "numeric");
    expect(field).toHaveAttribute("data-variant", "numeric");
    expect(field).toHaveClass("text-right", "font-numeric");
  });

  it("makes the suffix part of the accessible name outside a form", () => {
    render(
      <>
        <span id="l">Maximum depth</span>
        <Input variant="numeric" suffix="years" aria-labelledby="l" />
      </>,
    );
    expect(screen.getByRole("spinbutton", { name: "Maximum depth years" })).toBeInTheDocument();
    const suffix = screen.getByText("years");
    expect(suffix).toBeVisible();
    expect(suffix).toHaveClass("text-muted-foreground");
    expect(suffix.parentElement).toContainElement(screen.getByRole("spinbutton"));
  });

  it("leaves native labelling intact without a suffix", () => {
    render(
      <>
        <label htmlFor="q">Symbol</label>
        <Input id="q" />
      </>,
    );
    const field = screen.getByRole("textbox", { name: "Symbol" });
    expect(field).not.toHaveAttribute("aria-labelledby");
    expect(field.parentElement).toBe(document.body.firstElementChild);
  });

  it("passes a caller's aria-labelledby through unchanged without a suffix", () => {
    render(
      <>
        <span id="l">Symbol</span>
        <Input aria-labelledby="l" />
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-labelledby", "l");
  });

  it("names a suffixed input by the suffix alone when no label id is given", () => {
    render(<Input variant="numeric" suffix="years" />);
    const field = screen.getByRole("spinbutton", { name: "years" });
    expect(field.getAttribute("aria-labelledby")).toBe(screen.getByText("years").id);
  });

  it("styles an invalid input with the destructive border", () => {
    render(<Input aria-label="Symbol" aria-invalid="true" />);
    expect(screen.getByRole("textbox")).toHaveClass("aria-[invalid=true]:border-destructive");
  });

  it("keeps the typed value on Escape", async () => {
    const user = userEvent.setup();
    render(<Input variant="numeric" aria-label="Depth" />);
    const field = screen.getByRole("spinbutton");
    await user.type(field, "12");
    await user.keyboard("{Escape}");
    expect(field).toHaveValue(12);
  });

  it("forwards a ref to the input element, with and without a suffix", () => {
    const plain = createRef<HTMLInputElement>();
    const suffixed = createRef<HTMLInputElement>();
    render(
      <>
        <Input ref={plain} aria-label="A" />
        <Input ref={suffixed} suffix="years" aria-label="B" />
      </>,
    );
    expect(plain.current).toBe(screen.getByRole("textbox", { name: "A" }));
    expect(suffixed.current?.tagName).toBe("INPUT");
    expect(suffixed.current).toHaveAttribute("aria-labelledby");
  });
});
