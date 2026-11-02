import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AddStocksDialog, type AddStocksDialogProps } from "./add-stocks-dialog";

const RETIRED_REFUSAL =
  "This universe is retired and can't be changed. Its members and history are still viewable.";
const GENERIC =
  "Could not add the stocks to the universe: FactorFlow hit an unexpected problem. Try again.";

function dialogProps(overrides: Partial<AddStocksDialogProps> = {}): AddStocksDialogProps {
  return {
    universeName: "Tech",
    error: null,
    result: null,
    pending: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

function renderDialog(overrides: Partial<AddStocksDialogProps> = {}) {
  const props = dialogProps(overrides);
  const view = render(
    <MemoryRouter>
      <AddStocksDialog {...props} />
    </MemoryRouter>,
  );
  function rerenderWith(next: Partial<AddStocksDialogProps>): void {
    view.rerender(
      <MemoryRouter>
        <AddStocksDialog {...props} {...next} />
      </MemoryRouter>,
    );
  }
  return { props, rerenderWith, ...view };
}

function stocksField(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: "Stocks" }) as HTMLTextAreaElement;
}

function addButton(): HTMLElement {
  return screen.getByRole("button", { name: "Add" });
}

function describedText(element: HTMLElement): string {
  const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
}

function symbols(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `A${String(index + 1).padStart(4, "0")}`);
}

async function pasteStocks(user: ReturnType<typeof userEvent.setup>, text: string): Promise<void> {
  await user.click(stocksField());
  await user.paste(text);
  await user.tab();
}

// Implements TC-COMP-031 (T004): DAC-E1-S9-2, DAC-E1-6, AC-4. Lists are comma-separated, the
// delivered parser's separator (DEC-0270).
describe("TC-COMP-031: an already-current symbol is reported politely", () => {
  it("submits the typed symbols once, in order", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.type(stocksField(), "AAPL, MSFT");
    await user.click(addButton());
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith(["AAPL", "MSFT"]);
  });

  it("reports one added and one already a member as a status, never an alert", () => {
    renderDialog({ result: { added: ["MSFT"], alreadyMember: ["AAPL"] } });
    expect(screen.getByRole("status")).toHaveTextContent(
      /^Added 1 stock to Tech, and 1 were already members$/,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector('[data-variant="error"]')).toBeNull();
  });

  it("reports every symbol already a member without an error", () => {
    renderDialog({ result: { added: [], alreadyMember: ["AAPL", "MSFT"] } });
    expect(screen.getByRole("status")).toHaveTextContent(/^All 2 were already members of Tech\.$/);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector('[data-variant="error"]')).toBeNull();
  });

  it("uses the plural noun from two added, and no clause when none were already members", () => {
    renderDialog({ result: { added: ["AAPL", "MSFT"], alreadyMember: [] } });
    expect(screen.getByRole("status")).toHaveTextContent(/^Added 2 stocks to Tech$/);
  });

  it("renders no status without a result", () => {
    renderDialog();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

// Implements TC-COMP-032 (T005): DAC-E1-S9-3, AC-4.
describe("TC-COMP-032: an uncovered symbol refuses the whole request and names every symbol", () => {
  it("names every symbol in order with the followed-stocks link, keeps the list and allows a retry", async () => {
    const user = userEvent.setup();
    const { props, rerenderWith } = renderDialog();
    await user.type(stocksField(), "AAPL, MSFT, TSLA");
    await user.click(addButton());
    expect(props.onSubmit).toHaveBeenCalledWith(["AAPL", "MSFT", "TSLA"]);

    rerenderWith({ error: { kind: "instrument_not_acquired", symbols: ["MSFT", "TSLA"] } });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "Could not add the stocks: FactorFlow doesn't follow MSFT, TSLA. Follow them on Data health, then try again.",
    );
    const link = within(alert).getByRole("link", { name: "Follow them on Data health" });
    expect(link).toHaveAttribute("href", "/instruments");
    expect(screen.getByRole("dialog", { name: "Add stocks to Tech" })).toBeInTheDocument();
    // Normalised on blur, one symbol per line, as the create dialog rewrites it (DEC-0270).
    expect(stocksField().value).toBe("AAPL\nMSFT\nTSLA");
    expect(addButton()).toBeEnabled();
    expect(addButton()).not.toHaveAttribute("data-variant", "blocked");
  });

  it("allows a second attempt after the refusal", async () => {
    const user = userEvent.setup();
    const { props, rerenderWith } = renderDialog();
    await user.type(stocksField(), "AAPL, MSFT, TSLA");
    await user.click(addButton());
    rerenderWith({ error: { kind: "instrument_not_acquired", symbols: ["MSFT", "TSLA"] } });
    await user.click(addButton());
    expect(props.onSubmit).toHaveBeenCalledTimes(2);
    expect(props.onSubmit).toHaveBeenLastCalledWith(["AAPL", "MSFT", "TSLA"]);
  });
});

// T006 (a) to (f): structure, the blocked confirm, normalisation, refusals and plain text.
describe("AddStocksDialog", () => {
  it("is a standard modal dialog titled for the universe, with one list textarea and Add and Cancel", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "Add stocks to Tech" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-variant", "standard");
    expect(within(dialog).getAllByRole("textbox")).toHaveLength(1);
    expect(stocksField().tagName).toBe("TEXTAREA");
    expect(stocksField()).toHaveAttribute("data-variant", "list");
    expect(stocksField()).toHaveAttribute("rows", "4");
    expect(within(dialog).getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("puts initial focus on the textarea", () => {
    renderDialog();
    expect(stocksField()).toHaveFocus();
  });

  it("Escape calls onCancel", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.keyboard("{Escape}");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("Cancel calls onCancel", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("cycles Tab and Shift+Tab inside the dialog", async () => {
    const user = userEvent.setup();
    renderDialog();
    addButton().focus();
    await user.tab();
    expect(stocksField()).toHaveFocus();
    await user.tab({ shift: true });
    expect(addButton()).toHaveFocus();
  });

  it("restores focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = renderDialog();
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("is blocked, focusable and described while no symbol parses, and sends nothing", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    const add = addButton();
    expect(add).toHaveAttribute("data-variant", "blocked");
    expect(add).toBeEnabled();
    expect(add).toHaveAttribute("tabindex", "0");
    expect(describedText(add)).toBe("Enter at least one stock.");
    await user.click(add);
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("stays blocked when only malformed entries were entered, reporting each one after normalising", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await pasteStocks(user, "1BAD, zzzz zz");
    expect(addButton()).toHaveAttribute("data-variant", "blocked");
    expect(describedText(addButton())).toBe("Enter at least one stock.");
    expect(screen.getByText("1BAD: not a valid symbol format")).toBeInTheDocument();
    expect(screen.getByText("ZZZZ ZZ: not a valid symbol format")).toBeInTheDocument();
    expect(screen.getByText("0 symbols recognised, 2 not recognised")).toBeInTheDocument();
    await user.click(addButton());
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("is blocked above 1000 recognised entries, duplicates counted, and sends nothing", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await pasteStocks(user, [...symbols(999), "A0001", "A0002"].join(", "));
    expect(addButton()).toHaveAttribute("data-variant", "blocked");
    expect(describedText(addButton())).toBe("Up to 1000 stocks can be added in one request.");
    await user.click(addButton());
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("is not blocked at exactly 1000 recognised entries, and sends them", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await pasteStocks(user, symbols(1000).join(", "));
    expect(addButton()).not.toHaveAttribute("data-variant", "blocked");
    expect(addButton()).not.toHaveAttribute("aria-describedby");
    await user.click(addButton());
    expect(props.onSubmit).toHaveBeenCalledWith(symbols(1000));
  });

  it("sends the distinct symbols, upper case, once each, and reports the recognised count", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await pasteStocks(user, "aapl; msft\nAAPL, 1BAD");
    expect(screen.getByText("3 symbols recognised, 1 not recognised")).toBeInTheDocument();
    await user.click(addButton());
    expect(props.onSubmit).toHaveBeenCalledWith(["AAPL", "MSFT"]);
  });

  it("parses a paste together with the text already in the field, and describes the field by the count", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "A, ");
    expect(stocksField()).not.toHaveAttribute("aria-describedby");
    await user.paste("MSFT");
    expect(stocksField()).toHaveAccessibleDescription("2 symbols recognised, 0 not recognised");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows no count for a field left empty", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), " ");
    await user.tab();
    expect(screen.queryByText(/symbols recognised/)).toBeNull();
    expect(stocksField()).not.toHaveAttribute("aria-describedby");
  });

  it("submitting never navigates the page: the form's default action is prevented", async () => {
    const user = userEvent.setup();
    renderDialog();
    await pasteStocks(user, "AAPL");
    const form = stocksField().closest("form") as HTMLFormElement;
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("normalises symbols to upper case on blur, not while typing", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "aapl, msft");
    expect(stocksField().value).toBe("aapl, msft");
    await user.tab();
    expect(stocksField().value).toBe("AAPL\nMSFT");
  });

  it("parses a paste at once, without a blur", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(stocksField());
    await user.paste("AAPL, MSFT");
    expect(screen.getByText("2 symbols recognised, 0 not recognised")).toBeInTheDocument();
    expect(addButton()).not.toHaveAttribute("data-variant", "blocked");
  });

  it("states universe_retired and keeps the list", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderDialog();
    await pasteStocks(user, "AAPL");
    rerenderWith({ error: { kind: "universe_retired" } });
    expect(screen.getByRole("alert")).toHaveTextContent(RETIRED_REFUSAL);
    expect(stocksField().value).toBe("AAPL");
  });

  it("states any other failure with the generic sentence and keeps the list", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderDialog();
    await pasteStocks(user, "AAPL");
    rerenderWith({ error: { kind: "generic" } });
    expect(screen.getByRole("alert")).toHaveTextContent(GENERIC);
    expect(stocksField().value).toBe("AAPL");
  });

  it("renders no alert without an error", () => {
    renderDialog();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("while pending natively disables Add and not Cancel, and sends nothing more", async () => {
    const user = userEvent.setup();
    const { props } = renderDialog({ pending: true });
    expect(addButton()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    await pasteStocks(user, "AAPL");
    await user.click(addButton());
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("moves focus to Cancel when Add, focused by its click, becomes pending", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderDialog();
    await pasteStocks(user, "AAPL");
    await user.click(addButton());
    expect(addButton()).toHaveFocus();
    rerenderWith({ pending: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("moves focus to Cancel when a browser dropped it from the Add that became pending", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderDialog();
    await pasteStocks(user, "AAPL");
    await user.click(addButton());
    // A browser drops focus from a control it disables; jsdom does not, so the test does.
    addButton().blur();
    rerenderWith({ pending: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("shows progress in place on Add while pending, and none otherwise", () => {
    const { rerenderWith } = renderDialog();
    expect(addButton()).not.toHaveAttribute("data-pending");
    expect(addButton().querySelector('[aria-hidden="true"]')).toHaveClass("invisible");
    rerenderWith({ pending: true });
    expect(addButton()).toHaveAttribute("data-pending", "true");
    const progress = addButton().querySelector('[aria-hidden="true"]');
    expect(progress).toHaveClass("motion-safe:animate-spin");
    expect(progress).not.toHaveClass("invisible");
  });

  it("moves no focus when a request ends", () => {
    const { rerenderWith } = renderDialog({ pending: true });
    stocksField().blur();
    rerenderWith({ pending: false });
    expect(document.body).toHaveFocus();
  });

  it("leaves focus in the field when a request becomes pending", () => {
    const { rerenderWith } = renderDialog();
    expect(stocksField()).toHaveFocus();
    rerenderWith({ pending: true });
    expect(stocksField()).toHaveFocus();
  });

  it("is enabled when not pending and a symbol parses", async () => {
    const user = userEvent.setup();
    renderDialog();
    await pasteStocks(user, "AAPL");
    expect(addButton()).toBeEnabled();
    expect(addButton()).toHaveAttribute("data-variant", "default");
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-busy");
  });

  it("renders entered text as plain text, never as markup", async () => {
    const user = userEvent.setup();
    renderDialog({ universeName: "<i>Tech</i>" });
    await pasteStocks(user, "<b>AAPL</b>");
    expect(screen.getByText("<B>AAPL</B>: not a valid symbol format")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Add stocks to <i>Tech</i>" })).toBeInTheDocument();
    expect(document.querySelector("dialog b")).toBeNull();
    expect(document.querySelector("dialog i")).toBeNull();
  });
});
