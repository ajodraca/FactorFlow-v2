import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import { ApiError } from "../../api/client";
import { AddField } from "./add-field";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, addInstruments: vi.fn() };
});

const FIELD = { name: "Symbol of the stock to follow" };

describe("AddField — follow a stock (AC-1, AC-17, DAC-E7-4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("names the field and its button in the product's words, inside an inline form", () => {
    const { container } = render(<AddField onAdded={vi.fn()} />);

    expect(screen.getByRole("textbox", FIELD)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Follow a stock" })).toBeInTheDocument();
    expect(container.querySelector("form")).toHaveAttribute("data-variant", "inline");
  });

  it("submits the trimmed, upper-cased symbol once on Enter and clears the field", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "added", reason: null },
      ],
      reactivated: [],
      rejected: [],
    });
    const user = userEvent.setup();
    const onAdded = vi.fn();
    render(<AddField onAdded={onAdded} />);

    const field = screen.getByRole("textbox", FIELD);
    await user.type(field, " aapl {Enter}");

    expect(client.addInstruments).toHaveBeenCalledTimes(1);
    expect(client.addInstruments).toHaveBeenCalledWith(["AAPL"]);
    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(field).toHaveValue("");
  });

  it("submits when the button is clicked, and holds it disabled while the request is in flight", async () => {
    let resolve: (value: Awaited<ReturnType<typeof client.addInstruments>>) => void = () =>
      undefined;
    vi.mocked(client.addInstruments).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    await user.type(screen.getByRole("textbox", FIELD), "msft");
    const button = screen.getByRole("button", { name: "Follow a stock" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).not.toBeDisabled();
    await user.click(button);

    expect(client.addInstruments).toHaveBeenCalledWith(["MSFT"]);
    expect(button).toBeDisabled();
    resolve({ added: [], reactivated: [], rejected: [] });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("sends nothing for an empty field", async () => {
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Follow a stock" }));

    expect(client.addInstruments).not.toHaveBeenCalled();
  });

  it("renders a field error for a stock that is already followed", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [],
      reactivated: [],
      rejected: [
        {
          inputSymbol: "AAPL",
          normalisedSymbol: "AAPL",
          disposition: "duplicate_active",
          reason: "an active instrument with this symbol already exists",
        },
      ],
    });
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    const field = screen.getByRole("textbox", FIELD);
    await user.type(field, "aapl{Enter}");

    const error = await screen.findByText("AAPL is already a followed stock.");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field.getAttribute("aria-describedby")).toBe(error.id);
  });

  it("renders a malformed symbol as the shape error, not the duplicate one", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [],
      reactivated: [],
      rejected: [
        {
          inputSymbol: "1BAD",
          normalisedSymbol: null,
          disposition: "malformed",
          reason: "bad shape",
        },
      ],
    });
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    await user.type(screen.getByRole("textbox", FIELD), "1bad{Enter}");

    expect(
      await screen.findByText("1BAD does not match the required symbol shape."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/already a followed stock/)).not.toBeInTheDocument();
  });

  it("reports a stock followed again as a notice, not an error", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [],
      reactivated: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "reactivated", reason: null },
      ],
      rejected: [],
    });
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    const field = screen.getByRole("textbox", FIELD);
    await user.type(field, "aapl{Enter}");

    expect(await screen.findByText("AAPL is followed again.")).toBeInTheDocument();
    expect(field).not.toHaveAttribute("aria-invalid", "true");
  });

  it("names the operation, stock and reason when the request itself fails", async () => {
    vi.mocked(client.addInstruments).mockRejectedValue(
      new ApiError("service unavailable", "req-1"),
    );
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    await user.type(screen.getByRole("textbox", FIELD), "aapl{Enter}");

    expect(
      await screen.findByText("Following AAPL failed: service unavailable"),
    ).toBeInTheDocument();
  });

  it("focuses the field on mount when asked to, and not otherwise", () => {
    const { unmount } = render(<AddField onAdded={vi.fn()} focusOnMount />);
    expect(screen.getByRole("textbox", FIELD)).toHaveFocus();
    unmount();

    render(<AddField onAdded={vi.fn()} />);
    expect(screen.getByRole("textbox", FIELD)).not.toHaveFocus();
  });
});
