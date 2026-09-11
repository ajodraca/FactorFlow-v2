import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import { ApiError } from "../../api/client";
import { AddField } from "./add-field";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, addInstruments: vi.fn() };
});

describe("AddField — single-symbol inline add (AC-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has an accessible name stating what is being added, not a bare 'Symbol'", () => {
    render(<AddField onAdded={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: /instrument symbol/i })).toBeInTheDocument();
  });

  it("submits one symbol on Enter and reports it added", async () => {
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

    const field = screen.getByRole("textbox", { name: /instrument symbol/i });
    await user.type(field, "aapl{Enter}");

    expect(client.addInstruments).toHaveBeenCalledWith(["AAPL"]);
    expect(onAdded).toHaveBeenCalled();
  });

  // T017 (DAC-E2-S4-1 sibling): duplicate-of-active is a field error;
  // duplicate-of-retired is distinguished as a reactivation, not an error.
  it("renders a field error for a duplicate-of-active symbol", async () => {
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

    const field = screen.getByRole("textbox", { name: /instrument symbol/i });
    await user.type(field, "aapl{Enter}");

    const error = await screen.findByText(/already an active instrument/i);
    expect(error).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("distinguishes a duplicate-of-retired symbol as a reactivation, not an error", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [],
      reactivated: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "reactivated", reason: null },
      ],
      rejected: [],
    });
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    const field = screen.getByRole("textbox", { name: /instrument symbol/i });
    await user.type(field, "aapl{Enter}");

    const notice = await screen.findByText(/reactivated/i);
    expect(notice).toBeInTheDocument();
    expect(field).not.toHaveAttribute("aria-invalid", "true");
  });

  it("names the operation, resource and reason when the request itself fails", async () => {
    vi.mocked(client.addInstruments).mockRejectedValue(
      new ApiError("the store is unavailable", "req-1"),
    );
    const user = userEvent.setup();
    render(<AddField onAdded={vi.fn()} />);

    const field = screen.getByRole("textbox", { name: /instrument symbol/i });
    await user.type(field, "aapl{Enter}");

    expect(await screen.findByText(/adding instrument aapl failed/i)).toBeInTheDocument();
  });
});
