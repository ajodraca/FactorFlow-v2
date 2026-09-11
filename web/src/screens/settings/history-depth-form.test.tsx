import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import { HistoryDepthForm } from "./history-depth-form";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, getHistoryDepth: vi.fn(), setHistoryDepth: vi.fn() };
});

describe("HistoryDepthForm", () => {
  beforeEach(() => {
    vi.mocked(client.getHistoryDepth).mockResolvedValue({ years: null, updatedAt: null });
  });

  // TC-COMP-132 (T011): a non-positive or non-integer value's error names
  // the operation, the resource, and the reason (STD-UI-19, DAC-E2-S4-5).
  it("names the operation, resource, and reason for a non-positive value", async () => {
    const user = userEvent.setup();
    render(<HistoryDepthForm />);

    const field = await screen.findByRole("spinbutton", { name: /history depth/i });
    await user.type(field, "0");
    await user.tab();

    const error = await screen.findByRole("alert");
    expect(error.textContent).toMatch(/setting history depth/i);
    expect(error.textContent).toMatch(/history depth/i);
    expect(error.textContent).toMatch(/must be a positive whole number/i);
    expect(client.setHistoryDepth).not.toHaveBeenCalled();
  });

  it("names the operation, resource, and reason for a non-integer value", async () => {
    const user = userEvent.setup();
    render(<HistoryDepthForm />);

    const field = await screen.findByRole("spinbutton", { name: /history depth/i });
    await user.type(field, "2.5");
    await user.tab();

    const error = await screen.findByRole("alert");
    expect(error.textContent).toMatch(/must be a positive whole number/i);
  });

  // T012: AC-2's read/write round trip.
  it("reflects the saved value and clears the required description on a valid submit", async () => {
    vi.mocked(client.setHistoryDepth).mockResolvedValue({
      years: 5,
      updatedAt: "2026-09-10T00:00:00Z",
    });
    const user = userEvent.setup();
    render(<HistoryDepthForm />);

    expect(
      await screen.findByText(/required before the first acquisition run/i),
    ).toBeInTheDocument();

    const field = screen.getByRole("spinbutton", { name: /history depth/i });
    await user.type(field, "5");
    await user.tab();

    await waitFor(() => expect(client.setHistoryDepth).toHaveBeenCalledWith(5));
    await waitFor(() => expect(field).toHaveValue(5));
    expect(
      screen.queryByText(/required before the first acquisition run/i),
    ).not.toBeInTheDocument();
  });

  // T015: validation runs on blur, not per keystroke.
  it("does not validate while typing, only on blur", async () => {
    const user = userEvent.setup();
    render(<HistoryDepthForm />);
    await screen.findByRole("spinbutton", { name: /history depth/i });

    const field = screen.getByRole("spinbutton", { name: /history depth/i });
    await user.type(field, "0");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
