import { act, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "../api/types";
import { StatusRegion, UnreachableState } from "./status-region";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return { ...actual, fetchHealth: vi.fn() };
});

const { fetchHealth } = await import("../api/client");
const { ApiUnreachableError } = await import("../api/client");
const fetchHealthMock = vi.mocked(fetchHealth);

/** A health response with the product answering and nothing yet run. */
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

/** 2026-09-06T18:30:00Z is 13:30 America/Chicago (CDT, UTC-5). */
const FIXED_NOW = new Date("2026-09-06T18:30:00.000Z");

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(FIXED_NOW);
  fetchHealthMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// TC-COMP-304, TC-COMP-018 (DAC-E1-13, AC-18): the region reports whether the
// product is answering, polls health every 30 seconds, and shows its
// last-updated time (STD-UI-25).
describe("StatusRegion — liveness and polling (DAC-E1-13, AC-18)", () => {
  it("fetches health on mount and renders the answering state", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));
    const region = await screen.findByTestId("status-region");
    expect(within(region).getByTestId("liveness-state")).toHaveTextContent(/answering/i);
  });

  it("polls again every 30 seconds while mounted", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);
    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(3);
  });

  it("does not poll faster than the 30-second cadence the design records", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);
    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(29_000);
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });

  it("shows a last-updated time (STD-UI-25)", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const lastUpdated = await screen.findByTestId("last-updated");
    expect(lastUpdated.textContent ?? "").not.toEqual("");
  });
});

// TC-COMP-016, TC-COMP-306, TC-COMP-337 (AC-16, DAC-E1-15, DAC-E1-S5-3): a
// rejected fetch is the API not answering at all. It renders as the named
// designed state from UX design section 2, never as a raw transport error.
// The region's own line reports "Not answering"; `UnreachableState` is the
// designed body the shell substitutes into the main region on every route
// (T018 wires it there, and `shell.unreachable.test.tsx` asserts the wiring).
describe("StatusRegion — unreachable state (AC-16, DAC-E1-15, DAC-E1-S5-3)", () => {
  it("test_unreachable_state renders the exact designed copy from UX design section 2", () => {
    render(<UnreachableState />);

    const unreachable = screen.getByTestId("unreachable-state");
    expect(unreachable).toHaveTextContent(
      "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.",
    );
  });

  it("names the likely cause and where to look, not the transport failure", () => {
    render(<UnreachableState />);

    const text = screen.getByTestId("unreachable-state").textContent ?? "";
    expect(text).toMatch(/application container may have stopped/i);
    expect(text).toMatch(/migration may have failed/i);
    expect(text).toMatch(/container logs/i);
    // The raw transport error must not leak into the rendered state
    // (STD-UI-23: unreachable is designed, never a generic transport error).
    expect(text).not.toMatch(/ECONNREFUSED|TypeError|Failed to fetch|127\.0\.0\.1/i);
  });

  it("reports 'Not answering' in the region's own liveness line when the fetch rejects", async () => {
    fetchHealthMock.mockRejectedValue(
      new ApiUnreachableError("connect ECONNREFUSED 127.0.0.1:8000"),
    );

    render(<StatusRegion />);

    const liveness = await screen.findByTestId("liveness-state");
    expect(liveness).toHaveTextContent(/not answering/i);
    expect(liveness).toHaveAttribute("data-liveness", "unreachable");
    // No raw transport detail anywhere in the region.
    const region = screen.getByTestId("status-region");
    expect(region.textContent ?? "").not.toMatch(/ECONNREFUSED|127\.0\.0\.1/i);
  });

  it("does not treat a successful response reporting database unreachable as the API not answering", async () => {
    // DAC-E1-S6-2 is a different fact from DAC-E1-15 and must not collapse
    // into the same code path: the API answered here.
    fetchHealthMock.mockResolvedValue(answering({ database: "unreachable" }));

    render(<StatusRegion />);

    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));
    const liveness = await screen.findByTestId("liveness-state");
    expect(liveness).toHaveTextContent(/answering/i);
    expect(liveness).toHaveAttribute("data-liveness", "answering");
  });
});

// TC-COMP-335 (DAC-E1-S5-1, STD-UI-24): the answering state carries a text
// label plus an icon or shape, so it reads in greyscale rather than by colour
// alone.
describe("StatusRegion — answering state is readable in greyscale (DAC-E1-S5-1)", () => {
  it("renders a text label alongside a non-colour visual cue", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const liveness = await screen.findByTestId("liveness-state");
    expect(liveness).toHaveTextContent(/answering/i);

    const icon = within(liveness).getByTestId("liveness-icon");
    expect(icon).toBeInTheDocument();
    // The cue must carry meaning without colour: an accessible name or
    // shape-bearing markup, not a bare coloured dot.
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.tagName.toLowerCase()).toBe("svg");
  });
});

// TC-COMP-305, TC-COMP-336 (DAC-E1-14, DAC-E1-S5-2): the last-updated
// timestamp renders ISO-8601 in America/Chicago, and the region reserves a
// third line for STD-UI-11's future trading-environment indicator.
describe("StatusRegion — timestamp and reserved third line (DAC-E1-14, DAC-E1-S5-2)", () => {
  it("renders the last-updated time in ISO-8601, America/Chicago, with its zone visible", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const lastUpdated = await screen.findByTestId("last-updated");
    // 2026-09-06T18:30:00Z is 13:30 in America/Chicago (CDT, UTC-05:00).
    expect(lastUpdated).toHaveTextContent("2026-09-06 13:30:00 America/Chicago");
    // Not UTC, and not a locale-formatted string (STD-UI-5).
    expect(lastUpdated.textContent ?? "").not.toMatch(/18:30|UTC|\bZ\b|\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it("reserves a third line in the region's layout without restructuring", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    render(<StatusRegion />);

    const region = await screen.findByTestId("status-region");
    const lines = within(region).getAllByTestId(/^status-line-/);
    // Two facts today (liveness, most recent run outcome) plus one reserved
    // slot for STD-UI-11's trading-environment indicator.
    expect(lines).toHaveLength(3);
    const reserved = within(region).getByTestId("status-line-reserved");
    expect(reserved).toBeInTheDocument();
    // Reserved, not rendered: it holds space and carries no content today.
    expect(reserved.textContent ?? "").toEqual("");
    expect(reserved).toHaveAttribute("aria-hidden", "true");
  });
});

// TC-COMP-308, TC-COMP-338 (DAC-E1-17, DAC-E1-S5-4): before any run has ever
// existed the run-outcome line states that no run has been recorded, rather
// than presenting an empty successful state or erroring.
describe("StatusRegion — run outcome before any run exists (DAC-E1-17, DAC-E1-S5-4)", () => {
  it("renders 'No run recorded' when most_recent_run is null", async () => {
    fetchHealthMock.mockResolvedValue(answering({ most_recent_run: null }));

    render(<StatusRegion />);

    const runOutcome = await screen.findByTestId("run-outcome");
    expect(runOutcome).toHaveTextContent(/no run recorded/i);
  });

  it("does not present the null run as a success or a failure", async () => {
    fetchHealthMock.mockResolvedValue(answering({ most_recent_run: null }));

    render(<StatusRegion />);

    const runOutcome = await screen.findByTestId("run-outcome");
    const text = runOutcome.textContent ?? "";
    expect(text).not.toMatch(/succeeded|completed|failed|partial|ok\b/i);
    expect(runOutcome).toHaveAttribute("data-outcome", "none");
  });
});

// TC-COMP-339 (DAC-E1-S5-5): unmounting clears the polling interval, so no
// request continues after the owner navigates away.
describe("StatusRegion — polling stops on unmount (DAC-E1-S5-5)", () => {
  it("issues no further fetch after unmount, however far timers advance", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    const { unmount } = render(<StatusRegion />);
    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));

    unmount();
    const callsAtUnmount = fetchHealthMock.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000 * 10);
    });

    expect(fetchHealthMock).toHaveBeenCalledTimes(callsAtUnmount);
  });

  it("creates only one interval across re-renders", async () => {
    fetchHealthMock.mockResolvedValue(answering());

    const { rerender } = render(<StatusRegion />);
    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));

    rerender(<StatusRegion />);
    rerender(<StatusRegion />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    // One interval, so exactly one additional fetch — not one per render.
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });
});

// TC-COMP-340 (DAC-E1-S5-6): a missing credential is a configuration fact
// reported by a health check that answered — distinct from a health check
// that did not answer at all.
describe("StatusRegion — missing credential is distinct from unreachable (DAC-E1-S5-6)", () => {
  it("renders a credential state when credential_present is false", async () => {
    fetchHealthMock.mockResolvedValue(answering({ credential_present: false }));

    render(<StatusRegion />);

    const credential = await screen.findByTestId("credential-state");
    expect(credential).toHaveTextContent(/credential/i);
    expect(credential).toHaveAttribute("data-credential", "absent");
    // The product answered, so this is not the unreachable state: the
    // liveness line still reports the product answering.
    const liveness = screen.getByTestId("liveness-state");
    expect(liveness).toHaveAttribute("data-liveness", "answering");
  });

  it("renders no credential-absent state when the credential is present", async () => {
    fetchHealthMock.mockResolvedValue(answering({ credential_present: true }));

    render(<StatusRegion />);

    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("credential-state")).toBeNull();
  });

  it("renders no credential state when the API did not answer at all", async () => {
    fetchHealthMock.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));

    render(<StatusRegion />);

    await waitFor(() =>
      expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "unreachable"),
    );
    // Never report a credential absent on the strength of a failed request
    // (component design section 4).
    expect(screen.queryByTestId("credential-state")).toBeNull();
  });
});
