import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "../api/types";
import {
  HealthProvider,
  UNREACHABLE_MESSAGE,
  formatTimestamp,
  useHealth,
  useHealthRefresh,
} from "./health";

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

/** Renders what `useHealth()` reports, as attributes a test can read. */
function Probe({ id = "probe" }: { id?: string }) {
  const { liveness, health, lastUpdated, lastAnsweredAt } = useHealth();
  return (
    <p
      data-testid={id}
      data-liveness={liveness}
      data-last-updated={lastUpdated?.toISOString() ?? "null"}
      data-last-answered={lastAnsweredAt?.toISOString() ?? "null"}
      data-database={health?.database ?? "none"}
    />
  );
}

/** Hands the refresh function `useHealthRefresh()` returns to the test. */
const grabbed: { refresh: () => void } = { refresh: () => undefined };
function Grab() {
  grabbed.refresh = useHealthRefresh();
  return null;
}

function defineVisibility(value: "hidden" | "visible"): void {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value });
  Object.defineProperty(document, "hidden", { configurable: true, get: () => value === "hidden" });
}

function setVisibility(value: "hidden" | "visible"): void {
  defineVisibility(value);
  document.dispatchEvent(new Event("visibilitychange"));
}

async function advance(ms: number): Promise<void> {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function attribute(testId: string, name: string): string | null {
  return screen.getByTestId(testId).getAttribute(name);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  defineVisibility("visible");
  fetchHealthMock.mockReset();
});

afterEach(() => {
  defineVisibility("visible");
  vi.useRealTimers();
});

// Implements TC-COMP-071
describe("HealthProvider records lastAnsweredAt and keeps the delivered rendering (DAC-E3-S2-3)", () => {
  it("sets lastUpdated and lastAnsweredAt to the instant of the first success", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(attribute("probe", "data-liveness")).toBe("answering");
    expect(attribute("probe", "data-last-answered")).toBe("2026-09-06T18:30:00.000Z");
    expect(attribute("probe", "data-last-updated")).toBe("2026-09-06T18:30:00.000Z");
  });

  it("keeps lastAnsweredAt and the last health while unreachable, and moves lastUpdated", async () => {
    fetchHealthMock
      .mockResolvedValueOnce(answering())
      .mockRejectedValueOnce(new ApiUnreachableError("down"));
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    await advance(30_000);
    expect(attribute("probe", "data-liveness")).toBe("unreachable");
    expect(attribute("probe", "data-last-updated")).toBe("2026-09-06T18:30:30.000Z");
    expect(attribute("probe", "data-last-answered")).toBe("2026-09-06T18:30:00.000Z");
    expect(attribute("probe", "data-database")).toBe("reachable");
  });

  it("is unknown, with no times, before the first answer", async () => {
    fetchHealthMock.mockReturnValue(new Promise<HealthResponse>(() => undefined));
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(attribute("probe", "data-liveness")).toBe("unknown");
    expect(attribute("probe", "data-last-updated")).toBe("null");
    expect(attribute("probe", "data-last-answered")).toBe("null");
  });

  it("renders a timestamp in America/Chicago, as delivered", () => {
    expect(formatTimestamp(new Date("2026-09-06T18:30:00.000Z"))).toBe(
      "2026-09-06 13:30:00 America/Chicago",
    );
  });

  it("holds the designed unreachable sentence word for word", () => {
    expect(UNREACHABLE_MESSAGE).toBe(
      "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.",
    );
  });
});

// The delivered HealthProvider cases, moved from status-region.test.tsx and
// rewritten against a probe (owner-shell 2.10; DAC-E3-5). TC-COMP-304,
// TC-COMP-018 (DAC-E1-13, AC-18): health polls every 30 seconds.
// TC-COMP-339 (DAC-E1-S5-5): no request continues after unmount, and a
// re-render opens no second poll.
describe("HealthProvider polling, unknown state and cleanup (TC-COMP-304, TC-COMP-018)", () => {
  it("fetches health on mount and reports answering", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    expect(attribute("probe", "data-liveness")).toBe("answering");
  });

  it("polls again every 30 seconds while mounted", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(3);
  });

  it("does not poll faster than 30 seconds", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    await advance(29_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    await advance(999);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  it("reports unreachable when the fetch rejects", async () => {
    fetchHealthMock.mockRejectedValue(new ApiUnreachableError("down"));
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(attribute("probe", "data-liveness")).toBe("unreachable");
  });

  it("still reports answering when the answer says the database is unreachable", async () => {
    fetchHealthMock.mockResolvedValue(answering({ database: "unreachable" }));
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(attribute("probe", "data-liveness")).toBe("answering");
    expect(attribute("probe", "data-database")).toBe("unreachable");
  });

  it("fetches nothing after unmount, however far the timers advance", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    const { unmount } = render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    unmount();
    await advance(300_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });

  it("opens one poll across re-renders of the provider", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    const { rerender } = render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    for (let count = 0; count < 3; count += 1) {
      rerender(
        <HealthProvider>
          <Probe />
        </HealthProvider>,
      );
    }
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  it("makes one fetch per cycle for two probes under one provider", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe id="first" />
        <Probe id="second" />
      </HealthProvider>,
    );
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
    expect(attribute("first", "data-liveness")).toBe("answering");
    expect(attribute("second", "data-liveness")).toBe("answering");
  });

  it("polls for itself when useHealth has no provider above it", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(<Probe />);
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    expect(attribute("probe", "data-liveness")).toBe("answering");
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  // New: DEC-0212's pause while the page is hidden.
  it("pauses while the page is hidden and reads at once when it is visible", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Probe />
      </HealthProvider>,
    );
    await advance(0);
    setVisibility("hidden");
    await advance(90_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    setVisibility("visible");
    await advance(0);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(3);
  });
});

// DEC-0322: the shell context re-reads health through the provider.
describe("useHealthRefresh (DEC-0322)", () => {
  it("reads at once inside a provider and keeps the 30 s cadence from that read", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    render(
      <HealthProvider>
        <Grab />
      </HealthProvider>,
    );
    await advance(0);
    await advance(10_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      grabbed.refresh();
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);

    await advance(29_999);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
    await advance(1);
    expect(fetchHealthMock).toHaveBeenCalledTimes(3);
  });

  it("adds no fetch while one is pending", async () => {
    const pending = deferred<HealthResponse>();
    fetchHealthMock.mockResolvedValueOnce(answering()).mockReturnValueOnce(pending.promise);
    render(
      <HealthProvider>
        <Grab />
      </HealthProvider>,
    );
    await advance(0);
    await advance(30_000);
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      grabbed.refresh();
    });
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  it("returns a stable function that makes no fetch outside a provider", async () => {
    fetchHealthMock.mockResolvedValue(answering());
    const { rerender } = render(<Grab />);
    const first = grabbed.refresh;
    rerender(<Grab />);
    expect(grabbed.refresh).toBe(first);
    await act(async () => {
      grabbed.refresh();
    });
    await advance(60_000);
    expect(fetchHealthMock).not.toHaveBeenCalled();
  });
});
