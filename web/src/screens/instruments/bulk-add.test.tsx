import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import { BulkAdd } from "./bulk-add";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, addInstruments: vi.fn() };
});

// TC-COMP-101, TC-COMP-128 (T006): bulk entry accepts newline, comma, tab,
// and semicolon separators; a rejected entry never discards accepted ones;
// the preview lists rejections with reasons before anything is added
// (DAC-E2-3, DAC-E2-S4-1).
describe("BulkAdd — mixed-separator paste with a malformed entry", () => {
  beforeEach(() => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "added", reason: null },
        { inputSymbol: "MSFT", normalisedSymbol: "MSFT", disposition: "added", reason: null },
        { inputSymbol: "GOOG", normalisedSymbol: "GOOG", disposition: "added", reason: null },
      ],
      reactivated: [],
      rejected: [],
    });
  });

  it("reports each recognised symbol and the malformed one with a reason before submitting", async () => {
    const user = userEvent.setup();
    render(<BulkAdd onAdded={vi.fn()} />);

    const textarea = screen.getByRole("textbox", { name: /add many/i });
    await user.click(textarea);
    await user.paste("AAPL,1BAD\nMSFT\tGOOG");
    await user.tab();

    // Preview reports before anything is added — no call yet.
    expect(client.addInstruments).not.toHaveBeenCalled();
    expect(screen.getByText(/3 recognised/i)).toBeInTheDocument();
    expect(screen.getByText(/1 rejected/i)).toBeInTheDocument();
    expect(screen.getByText("1BAD")).toBeInTheDocument();
    expect(screen.getByText(/does not match the required symbol shape/i)).toBeInTheDocument();
  });

  it("submits only the recognised symbols, and the rejection did not discard them", async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    render(<BulkAdd onAdded={onAdded} />);

    const textarea = screen.getByRole("textbox", { name: /add many/i });
    await user.click(textarea);
    await user.paste("AAPL,1BAD\nMSFT\tGOOG");
    await user.tab();

    await user.click(screen.getByRole("button", { name: /add \d+ instruments?/i }));

    expect(client.addInstruments).toHaveBeenCalledWith(["AAPL", "MSFT", "GOOG"]);
    expect(onAdded).toHaveBeenCalled();
  });
});
