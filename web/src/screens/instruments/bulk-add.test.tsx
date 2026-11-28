import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import { BulkAdd } from "./bulk-add";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, addInstruments: vi.fn() };
});

const REGION = { name: "Follow many" };

async function paste(text: string): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup();
  await user.click(screen.getByRole("textbox", REGION));
  await user.paste(text);
  await user.tab();
  return user;
}

// TC-COMP-101, TC-COMP-128: bulk entry accepts newline, comma, tab and semicolon
// separators; a rejected entry never discards accepted ones; the preview lists
// rejections with reasons before anything is followed (AC-5, DAC-E2-3, DAC-E2-S4-1).
describe("BulkAdd — mixed-separator paste with a malformed entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("names its region Follow many, as a list textarea", () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    expect(screen.getByRole("textbox", REGION)).toHaveAttribute("data-variant", "list");
  });

  it("reports each recognised symbol and the malformed one with a reason before submitting", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    await paste("AAPL, MSFT\n1BAD;GOOG");

    expect(client.addInstruments).not.toHaveBeenCalled();
    expect(screen.getByText("3 recognised, 1 rejected")).toBeInTheDocument();
    expect(screen.getByText("1BAD")).toBeInTheDocument();
    expect(screen.getByText(/does not match the required symbol shape/)).toBeInTheDocument();
  });

  it("submits only the recognised symbols, and the rejection did not discard them", async () => {
    const onAdded = vi.fn();
    render(<BulkAdd onAdded={onAdded} />);
    const user = await paste("AAPL, MSFT\n1BAD;GOOG");

    await user.click(screen.getByRole("button", { name: "Follow 3 stocks" }));

    expect(client.addInstruments).toHaveBeenCalledTimes(1);
    expect(client.addInstruments).toHaveBeenCalledWith(["AAPL", "MSFT", "GOOG"]);
    expect(onAdded).toHaveBeenCalledTimes(1);
  });

  it("does not send a symbol pasted twice twice", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("AAPL, aapl");

    await user.click(screen.getByRole("button", { name: "Follow 2 stocks" }));

    expect(client.addInstruments).toHaveBeenCalledWith(["AAPL"]);
  });

  it("uses the singular for one recognised symbol", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    await paste("AAPL");

    expect(screen.getByRole("button", { name: "Follow 1 stock" })).toBeInTheDocument();
  });

  it("keeps using the shared parser setup uses (AC-5)", () => {
    const source = readFileSync(path.join(__dirname, "bulk-add.tsx"), "utf-8");
    expect(source).toMatch(
      /import\s*\{[^}]*\bparseBulkSymbols\b[^}]*\}\s*from\s*"\.\/parse-bulk-symbols"/,
    );
  });
});

// IR-003, TC-COMP-130: an all-rejected paste is a persistent, reachable state in
// which the submit control cannot currently be used, so it renders `blocked`
// (focusable, reason via `aria-describedby`), never a bare `disabled`.
describe("BulkAdd — submit control when nothing is recognised", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders blocked, not disabled, with its reason exposed, and sends nothing", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("1BAD,2BAD");

    const button = screen.getByRole("button", { name: "Follow 0 stocks" });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");

    const reason = document.getElementById(button.getAttribute("aria-describedby") as string);
    expect(reason).toHaveTextContent("Add at least one recognised symbol before submitting.");

    await user.click(button);
    expect(client.addInstruments).not.toHaveBeenCalled();
  });

  it("is reachable by the keyboard", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("1BAD,2BAD");

    await user.click(screen.getByRole("textbox", REGION));
    await user.tab();

    expect(screen.getByRole("button", { name: "Follow 0 stocks" })).toHaveFocus();
  });

  it("is not blocked while recognised symbols are present", async () => {
    render(<BulkAdd onAdded={vi.fn()} />);
    await paste("AAPL");

    const button = screen.getByRole("button", { name: "Follow 1 stock" });
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).not.toHaveAttribute("aria-describedby");
  });
});

// IR-008: the API's per-symbol outcomes are reported after submission, not
// discarded once the textarea clears.
describe("BulkAdd — reports outcomes after submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports every outcome with its own count after a mixed-outcome submit", async () => {
    vi.mocked(client.addInstruments).mockResolvedValue({
      added: [
        { inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "added", reason: null },
        { inputSymbol: "NVDA", normalisedSymbol: "NVDA", disposition: "added", reason: null },
      ],
      reactivated: [
        { inputSymbol: "AMD", normalisedSymbol: "AMD", disposition: "reactivated", reason: null },
      ],
      rejected: ["MSFT", "TSLA", "IBM"].map((symbol) => ({
        inputSymbol: symbol,
        normalisedSymbol: symbol,
        disposition: "duplicate_active" as const,
        reason: "already a followed stock",
      })),
    });
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("AAPL,NVDA,AMD,MSFT,TSLA,IBM");

    await user.click(screen.getByRole("button", { name: "Follow 6 stocks" }));

    expect(await screen.findByText("2 followed, 1 followed again, 3 rejected")).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
    expect(screen.getAllByText(/already a followed stock/)).toHaveLength(3);
    expect(screen.getByRole("textbox", REGION)).toHaveValue("");
  });

  it("holds the submit disabled while the request is in flight", async () => {
    vi.mocked(client.addInstruments).mockReturnValue(new Promise(() => undefined));
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("AAPL");
    const button = screen.getByRole("button", { name: "Follow 1 stock" });
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(button).toBeDisabled();
  });

  it("names the operation and reason when the request itself fails", async () => {
    vi.mocked(client.addInstruments).mockRejectedValue(new Error("service unavailable"));
    render(<BulkAdd onAdded={vi.fn()} />);
    const user = await paste("AAPL");

    await user.click(screen.getByRole("button", { name: "Follow 1 stock" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Following stocks failed: service unavailable",
    );
  });
});
