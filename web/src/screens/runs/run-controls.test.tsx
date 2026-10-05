import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, startAcquisitionRun } from "../../api/client";
import type { RunStartResult } from "../../api/types";
import {
  DEPTH_NOT_SET_REASON,
  NO_INSTRUMENTS_REASON,
  QUEUED_NOTICE,
  StartRunControl,
  type StartRunControlProps,
} from "./run-controls";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, startAcquisitionRun: vi.fn() };
});

const startMock = vi.mocked(startAcquisitionRun);

function LocationProbe(): JSX.Element {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderControl(props: StartRunControlProps = {}) {
  const view = render(
    <MemoryRouter initialEntries={["/runs"]}>
      <StartRunControl {...props} />
      <LocationProbe />
    </MemoryRouter>,
  );
  return {
    ...view,
    rerenderWith: (next: StartRunControlProps) =>
      view.rerender(
        <MemoryRouter initialEntries={["/runs"]}>
          <StartRunControl {...next} />
          <LocationProbe />
        </MemoryRouter>,
      ),
  };
}

function startButton(): HTMLElement {
  return screen.getByRole("button", { name: "Start acquisition run" });
}

beforeEach(() => {
  startMock.mockReset();
});

describe("StartRunControl — after a 202", () => {
  it("calls onStarted once, then routes to the run's detail when nothing is queued", async () => {
    const user = userEvent.setup();
    const result: RunStartResult = { runId: "r-9", state: "requested", queuedBehind: null };
    startMock.mockResolvedValue(result);
    const onStarted = vi.fn();
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3, onStarted });

    await user.click(startButton());

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/runs/r-9"));
    expect(onStarted).toHaveBeenCalledTimes(1);
    expect(onStarted).toHaveBeenCalledWith(result);
    expect(screen.queryByText(QUEUED_NOTICE)).not.toBeInTheDocument();
  });

  it("calls onStarted once and stays put when the run is queued", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue({ runId: "r-2", state: "requested", queuedBehind: "r-1" });
    const onStarted = vi.fn();
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3, onStarted });

    await user.click(startButton());

    expect(await screen.findByText(QUEUED_NOTICE)).toBeInTheDocument();
    expect(onStarted).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/runs$/);
  });
});

describe("StartRunControl — the server refuses a precondition the client could not see", () => {
  it("turns blocked with the UX depth sentence, not the API's own message", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(
      new ApiError("No history depth has been set. Configure it in Settings before running.", "q", {
        code: "history_depth_not_set",
      }),
    );
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());

    expect(await screen.findByText(DEPTH_NOT_SET_REASON)).toBeInTheDocument();
    expect(startButton()).toHaveAttribute("data-variant", "blocked");
    expect(screen.queryByText(/Configure it in Settings before running/)).not.toBeInTheDocument();
  });

  it("turns blocked with the AC-24 sentence on no_active_instruments", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(
      new ApiError("No active instruments exist.", "q", { code: "no_active_instruments" }),
    );
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());

    expect(await screen.findByText(NO_INSTRUMENTS_REASON)).toBeInTheDocument();
    expect(startButton()).toHaveAttribute("data-variant", "blocked");
    expect(screen.queryByText("No active instruments exist.")).not.toBeInTheDocument();
  });

  it("clears the refusal when the precondition props change", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(new ApiError("m", "q", { code: "no_active_instruments" }));
    const view = renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());
    expect(await screen.findByText(NO_INSTRUMENTS_REASON)).toBeInTheDocument();

    view.rerenderWith({ historyDepthYears: 5, activeInstrumentCount: 4 });
    expect(screen.queryByText(NO_INSTRUMENTS_REASON)).not.toBeInTheDocument();
    expect(startButton()).toHaveAttribute("data-variant", "default");
  });
});

describe("StartRunControl — unknown preconditions", () => {
  it("renders default with no props and lets the server decide", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue({ runId: "r-1", state: "requested", queuedBehind: "r-0" });
    renderControl();

    expect(startButton()).toHaveAttribute("data-variant", "default");
    await user.click(startButton());
    expect(startMock).toHaveBeenCalledTimes(1);
  });
});

describe("StartRunControl — other failures", () => {
  it("renders the STD-UI-19 alert for an ApiError with any other code", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(new ApiError("x", "req-5", { code: "internal" }));
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Starting an acquisition run failed: x (request req-5)",
    );
    expect(startButton()).toHaveAttribute("data-variant", "default");
  });

  it("renders the alert with the unreachable error's message", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(new ApiUnreachableError("POST /api/acquisition-runs failed"));
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Starting an acquisition run failed: POST /api/acquisition-runs failed",
    );
    expect(startButton()).toHaveAttribute("data-variant", "default");
  });
});

describe("StartRunControl — no double submit", () => {
  it("sends one request for two rapid clicks, busy but never disabled", async () => {
    const user = userEvent.setup();
    let resolve: (value: RunStartResult) => void = () => undefined;
    startMock.mockReturnValue(
      new Promise<RunStartResult>((done) => {
        resolve = done;
      }),
    );
    renderControl({ historyDepthYears: 5, activeInstrumentCount: 3 });

    await user.click(startButton());
    await user.click(startButton());

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startButton()).toHaveAttribute("aria-busy", "true");
    expect(startButton()).not.toHaveAttribute("disabled");

    resolve({ runId: "r-1", state: "requested", queuedBehind: "r-0" });
    await waitFor(() => expect(startButton()).not.toHaveAttribute("aria-busy", "true"));
  });
});

// CAP-001-E7-S4 T013 (DAC-E7-S4-2; DEC-0017, Open Gap P3): the optional label.
describe("StartRunControl — label (CAP-001-E7-S4)", () => {
  it("renders the given label as the button's accessible name", () => {
    renderControl({ label: "Re-run acquisition" });
    expect(screen.getByRole("button", { name: "Re-run acquisition" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start acquisition run" })).not.toBeInTheDocument();
  });

  it("keeps the blocked, queued and navigation behaviour under a custom label", async () => {
    const user = userEvent.setup();
    startMock
      .mockResolvedValueOnce({ runId: "r-2", state: "requested", queuedBehind: "r-1" })
      .mockResolvedValueOnce({ runId: "r-9", state: "requested", queuedBehind: null });
    const view = renderControl({ label: "Re-run acquisition", historyDepthYears: null });
    const button = () => screen.getByRole("button", { name: "Re-run acquisition" });

    expect(button()).toHaveAttribute("data-variant", "blocked");
    await user.click(button());
    expect(startMock).not.toHaveBeenCalled();

    view.rerenderWith({ label: "Re-run acquisition" });
    await user.click(button());
    expect(await screen.findByText(QUEUED_NOTICE)).toBeInTheDocument();

    await user.click(button());
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/runs/r-9"));
  });

  it("defaults to Start acquisition run when no label is given (DEC-0004)", () => {
    renderControl({});
    expect(screen.getByRole("button", { name: "Start acquisition run" })).toBeInTheDocument();
  });
});
