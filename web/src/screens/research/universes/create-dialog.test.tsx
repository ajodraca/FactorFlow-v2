import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type JSX, useState } from "react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../api/classification-client";
import type { UniverseDetail } from "../../../api/classification-types";
import { ApiUnreachableError } from "../../../api/client";
import { CreateDialog, withLink } from "./create-dialog";
import UniversesScreen from "./index";

vi.mock("../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../api/classification-client")>(
    "../../../api/classification-client",
  )),
  listUniverses: vi.fn(),
  createUniverse: vi.fn(),
  listUniverseEvents: vi.fn(),
}));

const { ClassificationApiError } = classificationClient;
const createUniverse = vi.mocked(classificationClient.createUniverse);

function created(universeId: string, name: string): UniverseDetail {
  return {
    universeId,
    name,
    lifecycle: "active",
    createdAt: "2026-10-16T14:00:00Z",
    retiredAt: null,
    memberCount: 2,
    asOf: "2026-10-16",
    asOfBeforeCreation: false,
    origin: {
      kind: "by_hand",
      setId: null,
      classificationDate: null,
      thresholds: null,
      hideIncomplete: null,
      symbol: null,
    },
    members: [],
    set: null,
  };
}

function createError(code: string, symbols: string[] = []): Error {
  return new ClassificationApiError("RAW-SERVER-PROSE", "req-1", {
    code,
    operation: "create-universe",
    resource: "universe",
    symbols,
  });
}

/** `count` distinct valid symbols, `A0001` onwards. */
function symbols(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `A${String(index + 1).padStart(4, "0")}`);
}

function renderDialog(props: { onCreated?: (id: string) => void; onCancel?: () => void } = {}) {
  const onCreated = props.onCreated ?? vi.fn();
  const onCancel = props.onCancel ?? vi.fn();
  render(
    <MemoryRouter>
      <CreateDialog onCreated={onCreated} onCancel={onCancel} />
    </MemoryRouter>,
  );
  return { onCreated, onCancel };
}

function createButton(): HTMLElement {
  return screen.getByRole("button", { name: "Create" });
}

function nameField(): HTMLInputElement {
  return screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
}

function stocksField(): HTMLTextAreaElement {
  return screen.getByRole("textbox", { name: "Stocks to include" }) as HTMLTextAreaElement;
}

function describedText(element: HTMLElement): string {
  const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
}

async function pasteStocks(user: ReturnType<typeof userEvent.setup>, text: string): Promise<void> {
  await user.click(stocksField());
  await user.paste(text);
  await user.tab();
}

beforeEach(() => {
  createUniverse.mockReset();
});

// Implements TC-COMP-042 (T003): DAC-E1-S7-1, AC-5.
describe("TC-COMP-042: Create is blocked for zero or over 1000 symbols", () => {
  it("is blocked, focusable and described while the Stocks field is empty, and sends nothing", async () => {
    const user = userEvent.setup();
    renderDialog();
    const create = createButton();
    expect(create).toHaveAttribute("data-variant", "blocked");
    expect(create).toBeEnabled();
    expect(create).toHaveAttribute("tabindex", "0");
    expect(describedText(create)).toBe("Enter at least one stock.");
    await user.type(nameField(), "Tech");
    await user.click(create);
    expect(createUniverse).not.toHaveBeenCalled();
  });

  it("is blocked above 1000 recognised symbols and not at exactly 1000", async () => {
    const user = userEvent.setup();
    renderDialog();
    await pasteStocks(user, symbols(1001).join(", "));
    expect(createButton()).toHaveAttribute("data-variant", "blocked");
    expect(describedText(createButton())).toBe("Up to 1000 stocks can be added in one request.");
    await user.click(createButton());
    expect(createUniverse).not.toHaveBeenCalled();

    await user.clear(stocksField());
    await pasteStocks(user, symbols(1000).join(", "));
    expect(createButton()).not.toHaveAttribute("data-variant", "blocked");
    expect(createButton()).not.toHaveAttribute("aria-describedby");
    createUniverse.mockResolvedValue(created("u-1", "Wide"));
    await user.type(nameField(), "Wide");
    await user.click(createButton());
    expect(createUniverse).toHaveBeenCalledWith({ name: "Wide", symbols: symbols(1000) });
  });

  it("stays blocked when only malformed entries were entered, which never count", async () => {
    const user = userEvent.setup();
    renderDialog();
    await pasteStocks(user, "1BAD, zzzz zz");
    expect(createButton()).toHaveAttribute("data-variant", "blocked");
    expect(describedText(createButton())).toBe("Enter at least one stock.");

    await user.clear(stocksField());
    await pasteStocks(user, [...symbols(1000), "1BAD", "zzzz zz"].join(", "));
    expect(createButton()).not.toHaveAttribute("data-variant", "blocked");
  });

  it("counts duplicates per recognised entry (DEC-0104)", async () => {
    const user = userEvent.setup();
    renderDialog();
    const entries = [...symbols(999), "A0001", "A0002"];
    expect(entries).toHaveLength(1001);
    await pasteStocks(user, entries.join("\n"));
    expect(createButton()).toHaveAttribute("data-variant", "blocked");
    expect(describedText(createButton())).toBe("Up to 1000 stocks can be added in one request.");
  });
});

describe("withLink", () => {
  it("links the phrase wherever it sits, and leaves a sentence without it as text", () => {
    render(
      <MemoryRouter>
        <p>{withLink("Research first.", "Research", "/research")}</p>
        <p>{withLink("No phrase here.", "Research", "/research")}</p>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Research" })).toHaveAttribute("href", "/research");
    expect(screen.getByRole("link").parentElement).toHaveTextContent(/^Research first\.$/);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("No phrase here.")).toBeInTheDocument();
  });
});

// Implements TC-COMP-006 (T004): DAC-E1-S7-2, DAC-E1-1, AC-1.
describe("TC-COMP-006: the dialog names every uncovered symbol and keeps the list", () => {
  it("names MSFT and TSLA, links to the followed-stocks page and keeps both fields", async () => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValue(createError("instrument_not_acquired", ["MSFT", "TSLA"]));
    const { onCreated } = renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL, MSFT, TSLA");
    await user.click(createButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      /^Could not create the universe: FactorFlow doesn't follow MSFT, TSLA\. Follow them on Data health, then try again\.$/,
    );
    expect(alert.getAttribute("aria-live") ?? "assertive").toBe("assertive");
    const link = screen.getByRole("link");
    expect(alert).toContainElement(link);
    expect(link).toHaveAttribute("href", "/instruments");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(stocksField().value).toMatch(/AAPL/);
    expect(stocksField().value).toMatch(/MSFT/);
    expect(stocksField().value).toMatch(/TSLA/);
    expect(nameField().value).toBe("Tech");
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.queryByText(/RAW-SERVER-PROSE/)).not.toBeInTheDocument();
    expect(alert.style.color).toBe("hsl(var(--destructive))");
    expect(createButton()).toHaveFocus();
  });

  it("falls back to the generic sentence when the refusal names no symbol", async () => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValue(createError("instrument_not_acquired", []));
    renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL");
    await user.click(createButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /^Could not create the universe: FactorFlow hit an unexpected problem\. Try again\.$/,
    );
  });

  it("names a single uncovered symbol without a comma", async () => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValue(createError("instrument_not_acquired", ["TSLA"]));
    renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL, TSLA");
    await user.click(createButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /^Could not create the universe: FactorFlow doesn't follow TSLA\. Follow them on Data health, then try again\.$/,
    );
  });
});

/** Opens the dialog from a trigger, as the screen does, so focus restoration is observable. */
function Opener({ onCancel }: { onCancel: () => void }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open ? (
        <CreateDialog
          onCreated={vi.fn()}
          onCancel={() => {
            onCancel();
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

// T009: the create dialog's remaining behaviour (UX design 1.3).
describe("CreateDialog: parsing, focus, field errors and in-flight state", () => {
  it("(a) reports recognised and rejected counts politely, on paste and on blur, never per keystroke", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "AAPL");
    expect(screen.queryByText(/symbols recognised/)).not.toBeInTheDocument();
    await user.clear(stocksField());

    await user.click(stocksField());
    await user.paste([...symbols(12), "1bad"].join(", "));
    const counter = screen.getByText("12 symbols recognised, 1 not recognised");
    expect(counter.closest("[aria-live=polite]")).not.toBeNull();
    expect(screen.getByText("1bad: not a valid symbol format")).toBeInTheDocument();
    expect(
      screen.getByText("1bad: not a valid symbol format").querySelector(".text-status-warning"),
    ).not.toBeNull();
    expect(stocksField()).toHaveAccessibleDescription(/12 symbols recognised, 1 not recognised/);

    await user.tab();
    expect(screen.getByText("12 symbols recognised, 1 not recognised")).toBeInTheDocument();
    expect(stocksField().value).toMatch(/A0012/);
    expect(screen.getByText("1BAD: not a valid symbol format")).toBeInTheDocument();
    expect(screen.queryByText("1bad: not a valid symbol format")).not.toBeInTheDocument();
  });

  it("(a) reports a single entry, on blur, on paste and on a submit that re-parses", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "aapl");
    await user.tab();
    expect(screen.getByText("1 symbols recognised, 0 not recognised")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    await user.clear(stocksField());
    await user.tab();
    expect(screen.queryByText(/symbols recognised/)).not.toBeInTheDocument();
    await user.click(stocksField());
    await user.paste("MSFT");
    expect(screen.getByText("1 symbols recognised, 0 not recognised")).toBeInTheDocument();
    await user.type(stocksField(), ", NVDA");
    expect(screen.getByText("1 symbols recognised, 0 not recognised")).toBeInTheDocument();

    await user.clear(stocksField());
    await user.type(stocksField(), "a, ");
    await user.paste("msft");
    expect(screen.getByText("2 symbols recognised, 0 not recognised")).toBeInTheDocument();

    fireEvent.change(stocksField(), { target: { value: "1bad" } });
    fireEvent.submit(screen.getByRole("dialog").querySelector("form") as HTMLFormElement);
    expect(screen.getByText("0 symbols recognised, 1 not recognised")).toBeInTheDocument();
    expect(createUniverse).not.toHaveBeenCalled();
  });

  it("(a) a paste that replaces a selected range counts the text the paste leaves", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "AAPL, MSFT, TSLA");
    stocksField().setSelectionRange(6, 16);
    await user.paste("NVDA");
    expect(stocksField().value).toBe("AAPL, NVDA");
    expect(screen.getByText("2 symbols recognised, 0 not recognised")).toBeInTheDocument();
  });

  it("(b) upper-cases one entry per line on blur, never while typing", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(stocksField(), "aapl, msft");
    expect(stocksField().value).toBe("aapl, msft");
    await user.tab();
    expect(stocksField().value).toBe("AAPL\nMSFT");
  });

  it("(c) focuses Name, orders Cancel before Create, traps Tab and cancels on Esc", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    expect(nameField()).toHaveFocus();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.compareDocumentPosition(createButton()) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    await user.tab();
    expect(stocksField()).toHaveFocus();
    createButton().focus();
    await user.tab({ shift: true });
    expect(cancel).toHaveFocus();
    createButton().focus();
    await user.tab();
    expect(nameField()).toHaveFocus();
    await user.tab({ shift: true });
    expect(createButton()).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("(c) returns focus to the control that opened it on close", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MemoryRouter>
        <Opener onCancel={onCancel} />
      </MemoryRouter>,
    );
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);
    expect(nameField()).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("(d) attaches universe_name_in_use to the Name field with the trimmed name (DEC-0109)", async () => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValue(createError("universe_name_in_use"));
    renderDialog();
    await user.type(nameField(), " Tech ");
    await pasteStocks(user, "AAPL");
    await user.click(createButton());

    await waitFor(() => expect(nameField()).toHaveAttribute("aria-invalid", "true"));
    expect(describedText(nameField())).toBe("Another active universe is already named Tech.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(nameField().value).toBe(" Tech ");
    expect(stocksField().value).toBe("AAPL");
    expect(createUniverse).toHaveBeenCalledWith({ name: "Tech", symbols: ["AAPL"] });
    expect(nameField()).toHaveFocus();
    const error = document.getElementById(nameField().getAttribute("aria-describedby") ?? "");
    expect(error?.style.color).toBe("hsl(var(--destructive))");
    await user.type(nameField(), "x");
    expect(nameField()).not.toHaveAttribute("aria-invalid");
  });

  it("(e) refuses an empty trimmed name on the field, sends nothing and states no maximum length", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(nameField(), "   ");
    await pasteStocks(user, "AAPL");
    expect(nameField()).not.toHaveAttribute("aria-invalid");
    await user.click(createButton());
    expect(createUniverse).not.toHaveBeenCalled();
    expect(nameField()).toHaveAttribute("aria-invalid", "true");
    expect(describedText(nameField())).toBe("Enter a name for the universe.");
    expect(nameField()).not.toHaveAttribute("maxlength");
    expect(screen.getByRole("dialog")).not.toHaveTextContent(/maximum|characters|at most/i);
  });

  it.each([
    ["an unknown code", createError("something_new")],
    ["a known code other than the two handled", createError("validation_error")],
    ["a transport failure", new ApiUnreachableError("RAW-SERVER-PROSE")],
  ])("(f) shows the generic sentence for %s, never the envelope message", async (_, failure) => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValue(failure);
    renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL");
    await user.click(createButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Could not create the universe: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(screen.queryByText(/RAW-SERVER-PROSE/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(nameField()).not.toHaveAttribute("aria-invalid");
  });

  it("(f) clears an earlier error as soon as the next attempt is sent", async () => {
    const user = userEvent.setup();
    createUniverse.mockRejectedValueOnce(createError("universe_name_in_use"));
    createUniverse.mockReturnValueOnce(new Promise<UniverseDetail>(() => undefined));
    renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL, TSLA");
    await user.click(createButton());
    await waitFor(() => expect(nameField()).toHaveAttribute("aria-invalid", "true"));
    await user.click(createButton());
    expect(createUniverse).toHaveBeenCalledTimes(2);
    expect(nameField()).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Another active universe is already named Tech.")).toBeNull();
  });

  it("(g) sends one request, keeps the dialog open and cannot cancel while in flight", async () => {
    const user = userEvent.setup();
    let resolve: (value: UniverseDetail) => void = () => undefined;
    createUniverse.mockReturnValue(
      new Promise<UniverseDetail>((settle) => {
        resolve = settle;
      }),
    );
    const { onCreated, onCancel } = renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "aapl, msft, AAPL");
    await user.click(createButton());

    expect(createButton()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await user.click(createButton());
    nameField().focus();
    await user.keyboard("{Enter}");
    fireEvent.submit(screen.getByRole("dialog").querySelector("form") as HTMLFormElement);
    await user.keyboard("{Escape}");
    expect(createUniverse).toHaveBeenCalledTimes(1);
    expect(createUniverse).toHaveBeenCalledWith({ name: "Tech", symbols: ["AAPL", "MSFT"] });
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();

    resolve(created("u-9", "Tech"));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("u-9"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("(g) re-parses the current text on submit, so an unparsed edit is what is sent", async () => {
    const user = userEvent.setup();
    createUniverse.mockResolvedValue(created("u-1", "Tech"));
    renderDialog();
    await user.type(nameField(), "Tech");
    await pasteStocks(user, "AAPL");
    const form = screen.getByRole("dialog").querySelector("form") as HTMLFormElement;

    fireEvent.change(stocksField(), { target: { value: "" } });
    fireEvent.submit(form);
    expect(createUniverse).not.toHaveBeenCalled();
    expect(describedText(createButton())).toBe("Enter at least one stock.");

    fireEvent.change(stocksField(), { target: { value: "AAPL, nvda" } });
    fireEvent.submit(form);
    await waitFor(() =>
      expect(createUniverse).toHaveBeenCalledWith({ name: "Tech", symbols: ["AAPL", "NVDA"] }),
    );
  });

  it("(h) is a modal dialog labelled by its title", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog", { name: "New universe" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-variant", "standard");
    expect(dialog.style.backgroundColor).toBe("hsl(var(--popover))");
    expect(stocksField()).toHaveAttribute("data-variant", "list");
    expect(stocksField()).toHaveAttribute("rows", "4");
    expect(stocksField()).toHaveAttribute("placeholder", "AAPL, MSFT, NVDA");
  });
});

function DetailStub(): JSX.Element {
  const { universeId } = useParams();
  return <p>Detail {universeId}</p>;
}

// Implements TC-COMP-007 (T005): DAC-E1-S7-3, AC-1.
describe("TC-COMP-007: a successful create navigates to the new universe without a toast", () => {
  it("sends one request and renders the new universe's detail route", async () => {
    const user = userEvent.setup();
    vi.mocked(classificationClient.listUniverses).mockResolvedValue({
      universes: [
        {
          universeId: "u-tech",
          name: "Tech",
          lifecycle: "active",
          memberCount: 3,
          createdAt: "2026-10-16T14:00:00Z",
          retiredAt: null,
        },
      ],
      activeCount: 1,
      retiredCount: 0,
      nextCursor: null,
    });
    createUniverse.mockResolvedValue(created("u-new", "Growth picks"));
    render(
      <MemoryRouter initialEntries={["/research/universes"]}>
        <Routes>
          <Route path="/research/universes" element={<UniversesScreen />} />
          <Route path="/research/universes/:universeId" element={<DetailStub />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole("link", { name: "Tech" });
    await user.click(screen.getByRole("button", { name: "New universe…" }));
    await user.type(nameField(), "  Growth picks ");
    await pasteStocks(user, "aapl, msft, AAPL");
    await user.click(createButton());

    expect(await screen.findByText("Detail u-new")).toBeInTheDocument();
    expect(createUniverse).toHaveBeenCalledTimes(1);
    expect(createUniverse).toHaveBeenCalledWith({
      name: "Growth picks",
      symbols: ["AAPL", "MSFT"],
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/created|saved/i);
  });
});
