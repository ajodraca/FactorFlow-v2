import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "../api/types";
import { ApiUnreachableError } from "../api/client";
import { StatusRegion, UnreachableState } from "./status-region";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return { ...actual, fetchHealth: vi.fn() };
});

const { fetchHealth } = await import("../api/client");
const fetchHealthMock = vi.mocked(fetchHealth);

function answering(overrides: Partial<HealthResponse> = {}): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 4,
    most_recent_run: null,
    ...overrides,
  };
}

beforeEach(() => {
  fetchHealthMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// STD-UI-24 (DAC-E1-S5-1): every status carries text plus icon, so each state
// is readable in greyscale. A state distinguished by colour alone fails this
// regardless of how the colour is chosen.
describe("StatusRegion — no state relies on colour alone (STD-UI-24)", () => {
  it("the answering state carries a word and a shape", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const liveness = await screen.findByTestId("liveness-state");
    expect(liveness.textContent ?? "").toMatch(/\S/);
    expect(within(liveness).getByTestId("liveness-icon").tagName.toLowerCase()).toBe("svg");
  });

  it("the not-answering state carries a word and a shape", async () => {
    fetchHealthMock.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));

    render(<StatusRegion />);

    const liveness = await screen.findByTestId("liveness-state");
    await waitFor(() => expect(liveness).toHaveAttribute("data-liveness", "unreachable"));
    expect(liveness.textContent ?? "").toMatch(/\S/);
    expect(within(liveness).getByTestId("liveness-icon").tagName.toLowerCase()).toBe("svg");
  });

  it("the answering and not-answering icons are different shapes, not one shape in two colours", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    const { unmount } = render(<StatusRegion />);
    const answeringIcon = (await screen.findByTestId("liveness-icon")).innerHTML;
    unmount();

    fetchHealthMock.mockReset();
    fetchHealthMock.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));
    render(<StatusRegion />);
    await waitFor(() =>
      expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "unreachable"),
    );
    const unreachableIcon = screen.getByTestId("liveness-icon").innerHTML;

    expect(unreachableIcon).not.toEqual(answeringIcon);
  });

  it("the run-outcome line states its meaning in words", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const runOutcome = await screen.findByTestId("run-outcome");
    expect(runOutcome.textContent ?? "").toMatch(/no run recorded/i);
  });

  it("the credential-absent state states its meaning in words", async () => {
    fetchHealthMock.mockResolvedValue(answering({ credential_present: false }));

    render(<StatusRegion />);

    const credential = await screen.findByTestId("credential-state");
    expect(credential.textContent ?? "").toMatch(/credential/i);
  });

  it("the unreachable state is prose, carrying no colour-only cue", () => {
    render(<UnreachableState />);

    const unreachable = screen.getByTestId("unreachable-state");
    expect(unreachable.textContent ?? "").toMatch(/FactorFlow is not answering/);
  });
});

// STD-UI-24: content updated by polling must announce politely rather than
// replacing silently.
describe("StatusRegion — polled content announces politely (STD-UI-24)", () => {
  it("marks the region as a polite live region with an accessible name", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const region = await screen.findByTestId("status-region");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAccessibleName(/application status/i);
  });
});
