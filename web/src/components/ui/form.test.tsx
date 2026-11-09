import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRoot,
} from "./form";
import { Input } from "./input";
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

const YEARS_ERROR = "History depth must be a whole number of years from 1 to 50.";
const YEARS_HINT = "Whole years, 1 to 50.";

const schema = z.object({
  years: z.string().regex(/^(?:[1-9]|[1-4]\d|50)$/, YEARS_ERROR),
  symbol: z.string().min(1, "Enter a symbol."),
});

/** The form the setup step and Settings build: `onTouched` is the form spec's blur-then-change rule. */
function DepthForm({
  onSubmit,
  variant,
  withSymbol = false,
}: {
  onSubmit: (values: unknown) => void;
  variant?: "stacked" | "inline";
  withSymbol?: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    // Without the symbol field the schema still needs a valid symbol.
    defaultValues: { years: "", symbol: withSymbol ? "" : "AAPL" },
  });
  return (
    <Form {...form}>
      <FormRoot aria-label="History depth" variant={variant} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="years"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>History depth</FormLabel>
              <FormControl>
                <Input variant="numeric" suffix="years" {...field} />
              </FormControl>
              <FormDescription>{YEARS_HINT}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {withSymbol ? (
          <FormField
            name="symbol"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <button type="submit">Save</button>
      </FormRoot>
    </Form>
  );
}

// Implements TC-COMP-010
describe("form field naming, description and announced errors (DAC-E1-S2-2, AC-25)", () => {
  it("names the numeric input by its label and suffix, and describes it by its hint", () => {
    render(<DepthForm onSubmit={vi.fn()} />);
    const field = screen.getByRole("spinbutton", { name: "History depth years" });
    expect(field).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).toBeNull();
    // With nothing to report, the message renders no element at all.
    expect(document.querySelector("[id$='-form-item-message']")).toBeNull();
    expect(field.closest("div")?.parentElement).toHaveClass("space-y-2");
    expect(field).toHaveAccessibleDescription(YEARS_HINT);
    const describedBy = (field.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
    for (const id of describedBy) {
      expect(document.getElementById(id)).not.toHaveTextContent(YEARS_ERROR);
    }
  });

  it("links an invalid field to its announced error on blur and clears it on change", async () => {
    const user = userEvent.setup();
    render(<DepthForm onSubmit={vi.fn()} />);
    const field = screen.getByRole("spinbutton", { name: "History depth years" });

    await user.type(field, "0");
    await user.tab();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(YEARS_ERROR);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect((field.getAttribute("aria-describedby") ?? "").split(" ")).toContain(alert.id);
    expect(field).toHaveAccessibleDescription(`${YEARS_HINT} ${YEARS_ERROR}`);

    await user.clear(field);
    await user.type(field, "5");
    await vi.waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect((field.getAttribute("aria-describedby") ?? "").split(" ")).not.toContain(alert.id);
    expect(field).toHaveAttribute("aria-invalid", "false");
  });
});

describe("form root and field behaviour (DAC-E1-S2-2, AC-25)", () => {
  it("renders a native form in the stacked variant by default, inline on request, without native validation", () => {
    const { rerender } = render(<DepthForm onSubmit={vi.fn()} />);
    const stacked = screen.getByRole("form", { name: "History depth" });
    expect(stacked.tagName).toBe("FORM");
    expect(stacked).toHaveAttribute("data-variant", "stacked");
    expect(stacked).toHaveClass("flex", "flex-col", "gap-4");
    expect(stacked).toHaveAttribute("novalidate");

    rerender(<DepthForm onSubmit={vi.fn()} variant="inline" />);
    const inline = screen.getByRole("form", { name: "History depth" });
    expect(inline).toHaveAttribute("data-variant", "inline");
    expect(inline).toHaveClass("flex", "flex-row", "flex-wrap", "items-end", "gap-3");
    expect(inline).not.toHaveClass("flex-col");
    expect(inline).toHaveAttribute("novalidate");
  });

  it("reports every error at once, focuses the first and keeps what was typed", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.fn();
    render(<DepthForm onSubmit={submitSpy} withSymbol />);
    await user.type(screen.getByRole("spinbutton", { name: "History depth years" }), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(submitSpy).not.toHaveBeenCalled();
    const years = screen.getByRole("spinbutton", { name: "History depth years" });
    expect(document.activeElement).toBe(years);
    expect(years).toHaveValue(0);
  });

  it("submits the values once every field is valid", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.fn();
    render(<DepthForm onSubmit={submitSpy} />);
    await user.type(screen.getByRole("spinbutton", { name: "History depth years" }), "7");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(submitSpy.mock.calls[0]?.[0]).toEqual({ years: "7", symbol: "AAPL" });
  });

  it("lets a label name a control that is not labelable, such as a radio group", () => {
    function SourceForm() {
      const form = useForm({ defaultValues: { source: "paste" } });
      return (
        <Form {...form}>
          <FormRoot aria-label="Source">
            <FormField
              name="source"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How do you want to name them?</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <RadioGroupCard value="paste" title="Paste a list" description="Commas." />
                      <RadioGroupCard value="later" title="Add later" description="Later." />
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </FormRoot>
        </Form>
      );
    }
    render(<SourceForm />);
    expect(
      screen.getByRole("radiogroup", { name: "How do you want to name them?" }),
    ).toBeInTheDocument();
  });

  it("colours the label as an error only while its field is in error", async () => {
    const user = userEvent.setup();
    render(<DepthForm onSubmit={vi.fn()} />);
    const label = screen.getByText("History depth", { selector: "label" });
    expect(label).not.toHaveClass("text-destructive");
    expect(label).toHaveClass("text-base", "font-medium", "text-foreground");
    await user.type(screen.getByRole("spinbutton", { name: "History depth years" }), "0");
    await user.tab();
    await screen.findByRole("alert");
    expect(label).toHaveClass("text-destructive");
  });

  it("shows a message's own children when the field is valid, without announcing them", () => {
    function NoteForm() {
      const form = useForm({ defaultValues: { note: "" } });
      return (
        <Form {...form}>
          <FormRoot aria-label="Note">
            <FormField
              name="note"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>Saved</FormMessage>
                </FormItem>
              )}
            />
          </FormRoot>
        </Form>
      );
    }
    render(<NoteForm />);
    const note = screen.getByText("Saved");
    expect(note).not.toHaveAttribute("role");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("styles the hint and the error with theme tokens", async () => {
    const user = userEvent.setup();
    render(<DepthForm onSubmit={vi.fn()} />);
    expect(screen.getByText(YEARS_HINT)).toHaveClass("text-sm", "text-muted-foreground");
    await user.type(screen.getByRole("spinbutton", { name: "History depth years" }), "0");
    await user.tab();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveClass("text-sm", "font-medium", "text-destructive");
  });
});
