import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startAcquisitionRun } from "../../api/client";
import { StartRunControl } from "../runs/run-controls";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, startAcquisitionRun: vi.fn() };
});

const startMock = vi.mocked(startAcquisitionRun);

const DEPTH_REASON = "History depth is not set. Set it in Settings before acquiring.";
const INSTRUMENTS_REASON = "No instruments are named. Add instruments before acquiring.";

function LocationProbe(): JSX.Element {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

/**
 * The control is rendered standalone, with nothing from the Runs screen
 * around it, which is what proves Coverage can compose it.
 */
function renderStandalone(props: Parameters<typeof StartRunControl>[0]): void {
  render(
    <MemoryRouter initialEntries={["/coverage"]}>
      <StartRunControl {...props} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function describedByText(button: HTMLElement): string[] {
  return (button.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "");
}

beforeEach(() => {
  startMock.mockReset();
});

describe("Start is blocked, not disabled", () => {
  // Implements TC-COMP-287
  it("blocks with its own reason when no history depth is set (DAC-E5-S6-3)", async () => {
    const user = userEvent.setup();
    renderStandalone({ historyDepthYears: null, activeInstrumentCount: 3 });

    const button = screen.getByRole("button", { name: "Start acquisition run" });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).not.toHaveAttribute("disabled");

    await user.tab();
    expect(button).toHaveFocus();
    expect(describedByText(button)).toEqual([DEPTH_REASON]);

    await user.click(button);
    expect(startMock).not.toHaveBeenCalled();
  });

  // Implements TC-COMP-024
  it("blocks with the AC-24 reason when no instrument is named", async () => {
    const user = userEvent.setup();
    renderStandalone({ historyDepthYears: 5, activeInstrumentCount: 0 });

    const button = screen.getByRole("button", { name: "Start acquisition run" });
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).not.toHaveAttribute("disabled");
    expect(describedByText(button)).toEqual([INSTRUMENTS_REASON]);
    expect(INSTRUMENTS_REASON).not.toBe(DEPTH_REASON);

    await user.click(button);
    expect(startMock).not.toHaveBeenCalled();
  });

  it("shows both reasons, depth first, when both preconditions fail", () => {
    renderStandalone({ historyDepthYears: null, activeInstrumentCount: 0 });

    const button = screen.getByRole("button", { name: "Start acquisition run" });
    expect(describedByText(button)).toEqual([DEPTH_REASON, INSTRUMENTS_REASON]);

    const depth = screen.getByText(DEPTH_REASON);
    const instruments = screen.getByText(INSTRUMENTS_REASON);
    expect(
      depth.compareDocumentPosition(instruments) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("Queued run notice renders", () => {
  // Implements TC-COMP-023
  it("keeps the action available and says the new run is queued (AC-23)", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue({ runId: "r-2", state: "requested", queuedBehind: "r-1" });
    renderStandalone({ historyDepthYears: 5, activeInstrumentCount: 3 });

    const button = screen.getByRole("button", { name: "Start acquisition run" });
    await user.click(button);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "A run is in progress. This will start when it finishes.",
    );
    const after = screen.getByRole("button", { name: "Start acquisition run" });
    expect(after).toHaveAttribute("data-variant", "default");
    expect(after).not.toHaveAttribute("disabled");
    expect(screen.getByTestId("location")).toHaveTextContent("/coverage");

    await user.click(after);
    expect(startMock).toHaveBeenCalledTimes(2);
  });
});
