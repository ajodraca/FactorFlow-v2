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

// IR-003, TC-COMP-130: an all-rejected paste is a persistent, reachable
// state in which the submit control cannot currently be used. It must
// render `blocked` — focusable, with its reason exposed via
// `aria-describedby` — never a bare `disabled` attribute, which hides the
// reason from keyboard and screen-reader users.
describe("BulkAdd — submit control when nothing is recognised", () => {
  it("renders blocked, not disabled, with a reason exposed via aria-describedby", async () => {
    vi.mocked(client.addInstruments).mockReset();
    const user = userEvent.setup();
    render(<BulkAdd onAdded={vi.fn()} />);

    const textarea = screen.getByRole("textbox", { name: /add many/i });
    await user.click(textarea);
    await user.paste("1BAD,2BAD");
    await user.tab();

    const button = screen.getByRole("button", { name: /add 0 instruments/i });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).not.toHaveAttribute("disabled");
    expect(button.tabIndex).toBe(0);

    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const reason = document.getElementById(describedBy as string);
    expect(reason?.textContent).toMatch(/at least one recognised symbol/i);

    await user.click(button);
    expect(client.addInstruments).not.toHaveBeenCalled();
  });
});

// IR-008: the API's per-symbol outcomes must be reported after submission,
// not discarded once the textarea clears.
describe("BulkAdd — reports outcomes after submission", () => {
  it("reports rejected symbols with their reasons after a mixed-outcome submit", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "added", reason: null },
      ],
      reactivated: [],
      rejected: [
        {
          inputSymbol: "MSFT",
          normalisedSymbol: "MSFT",
          disposition: "duplicate_active",
          reason: "already an active instrument",
        },
      ],
    });
    const user = userEvent.setup();
    render(<BulkAdd onAdded={vi.fn()} />);

    const textarea = screen.getByRole("textbox", { name: /add many/i });
    await user.click(textarea);
    await user.paste("AAPL,MSFT");
    await user.tab();
    await user.click(screen.getByRole("button", { name: /add \d+ instruments?/i }));

    expect(await screen.findByText(/1 added, 0 reactivated, 1 rejected/i)).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
    expect(screen.getByText(/already an active instrument/i)).toBeInTheDocument();
  });
});
