import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea";

// Implements TC-COMP-010
describe("textarea list (DAC-E1-S2-1, AC-25)", () => {
  function renderField(props: Parameters<typeof Textarea>[0] = {}) {
    const submitSpy = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <form onSubmit={submitSpy}>
        <label htmlFor="s">Stock symbols</label>
        <Textarea id="s" {...props} />
        <button type="button">Next</button>
      </form>,
    );
    return { submitSpy, field: screen.getByRole("textbox", { name: "Stock symbols" }) };
  }

  it("is the list variant with four rows and no resize by default", () => {
    const { field } = renderField();
    expect(field).toHaveAttribute("data-variant", "list");
    expect(field).toHaveAttribute("rows", "4");
    expect(field).toHaveClass("resize-none", "w-full", "rounded", "border", "border-input");
    expect(field).toHaveClass("aria-[invalid=true]:border-destructive");
  });

  it("pads the field with the cell padding tokens", () => {
    const { field } = renderField();
    expect(field).toHaveClass("px-[var(--cell-padding-x)]", "py-[var(--cell-padding-y)]");
  });

  it("inserts a newline on Enter and never submits the form", async () => {
    const user = userEvent.setup();
    const { field, submitSpy } = renderField();
    await user.type(field, "AAPL{Enter}MSFT");
    expect(field).toHaveValue("AAPL\nMSFT");
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("leaves the value alone on Escape", async () => {
    const user = userEvent.setup();
    const { field } = renderField();
    await user.type(field, "AAPL");
    await user.keyboard("{Escape}");
    expect(field).toHaveValue("AAPL");
  });

  it("hands Tab to focus navigation and inserts no tab character", async () => {
    const user = userEvent.setup();
    const { field } = renderField();
    await user.type(field, "AAPL");
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    expect(field).toHaveValue("AAPL");
    expect((field as HTMLTextAreaElement).value).not.toContain("\t");
  });

  it("keeps a caller's rows", () => {
    const { field } = renderField({ rows: 8 });
    expect(field).toHaveAttribute("rows", "8");
  });

  it("forwards a ref to the textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Symbols" />);
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Symbols" }));
    expect(ref.current?.tagName).toBe("TEXTAREA");
  });
});
