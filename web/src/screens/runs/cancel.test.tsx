import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, cancelAcquisitionRun } from "../../api/client";
import type { RunState } from "../../api/types";
import { CancelRunControl } from "./cancel-run";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, cancelAcquisitionRun: vi.fn() };
});

const cancelMock = vi.mocked(cancelAcquisitionRun);

const RUNNING_TITLE = "Stop this run?";
const RUNNING_BODY =
  "Instruments already acquired keep their coverage. Instruments not yet started will be skipped. The run stops after the instrument it is working on now.";
const QUEUED_TITLE = "Cancel this queued run?";
const QUEUED_BODY =
  "It has not started, so nothing has been acquired. The run in progress is not affected.";

function renderControl(state: RunState, onSettled = vi.fn()) {
  render(
    <MemoryRouter>
      <CancelRunControl runId="r-1" state={state} onSettled={onSettled} />
    </MemoryRouter>,
  );
  return onSettled;
}

beforeEach(() => {
  cancelMock.mockReset();
});

// Implements TC-COMP-289
describe("Cancel confirmation copy follows the run's state (DAC-E5-S6-5)", () => {
  it("states the cooperative effect for a running run, as confirm, never destructive", async () => {
    const user = userEvent.setup();
    renderControl("running");
    await user.click(screen.getByRole("button", { name: "Cancel run" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(within(dialog).getByRole("heading")).toHaveTextContent(RUNNING_TITLE);
    expect(dialog).toHaveTextContent(RUNNING_BODY);
    expect(within(dialog).getByRole("button", { name: "Stop run" })).toBeInTheDocument();
  });

  it("states that nothing has been acquired for a queued run", async () => {
    const user = userEvent.setup();
    renderControl("requested");
    await user.click(screen.getByRole("button", { name: "Cancel run" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(within(dialog).getByRole("heading")).toHaveTextContent(QUEUED_TITLE);
    expect(dialog).toHaveTextContent(QUEUED_BODY);
    expect(within(dialog).getByRole("button", { name: "Cancel queued run" })).toBeInTheDocument();
  });

  it("gives the two dialogs different text", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CancelRunControl runId="r-1" state="running" />);
    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    const running = screen.getByRole("dialog").textContent;
    unmount();

    render(<CancelRunControl runId="r-1" state="requested" />);
    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    const queued = screen.getByRole("dialog").textContent;

    expect(running).not.toBe(queued);
  });

  it.each<RunState>(["running", "requested"])(
    "focuses Cancel first, and Escape closes the %s dialog without a call, restoring focus",
    async (state) => {
      const user = userEvent.setup();
      renderControl(state);
      const trigger = screen.getByRole("button", { name: "Cancel run" });
      await user.click(trigger);

      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(cancelMock).not.toHaveBeenCalled();
      expect(trigger).toHaveFocus();
    },
  );
});

describe("Cancelling is not presented as immediate (AC-19)", () => {
  it("shows cancelling as a warning and withdraws the action", async () => {
    const user = userEvent.setup();
    cancelMock.mockResolvedValue({ state: "cancelling" });
    const onSettled = renderControl("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    const badge = await screen.findByTestId("outcome-badge");
    expect(badge).toHaveTextContent("Cancelling");
    expect(badge).toHaveAttribute("data-variant", "status-warning");
    expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cancelMock).toHaveBeenCalledWith("r-1");
    expect(onSettled).toHaveBeenCalledWith("cancelling");
  });

  it("presents a queued cancel as immediate, because it is (AC-26)", async () => {
    const user = userEvent.setup();
    cancelMock.mockResolvedValue({ state: "cancelled" });
    const onSettled = renderControl("requested");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Cancel queued run" }));

    const badge = await screen.findByTestId("outcome-badge");
    expect(badge).toHaveTextContent("Cancelled");
    expect(badge).toHaveAttribute("data-variant", "status-neutral");
    expect(onSettled).toHaveBeenCalledWith("cancelled");
  });

  it("keeps the dialog open and busy until the result is known", async () => {
    const user = userEvent.setup();
    let resolve: (value: { state: "cancelling" }) => void = () => undefined;
    cancelMock.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    renderControl("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    resolve({ state: "cancelling" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

// Implements TC-COMP-290
describe("A cancel that races a completion (DAC-E5-S6-6)", () => {
  it("says the run had already completed and shows its real outcome", async () => {
    const user = userEvent.setup();
    cancelMock.mockRejectedValue(
      new ApiError("Run already reached a terminal state.", "req-3", {
        code: "run_already_terminal",
        state: "succeeded",
      }),
    );
    const onSettled = renderControl("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    expect(await screen.findByText("This run had already completed.")).toBeInTheDocument();
    const badge = screen.getByTestId("outcome-badge");
    expect(badge).toHaveTextContent("Succeeded");
    expect(badge).toHaveAttribute("data-variant", "status-good");
    expect(document.body).not.toHaveTextContent(/Cancelled|Cancelling/);
    expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
    expect(onSettled).toHaveBeenCalledWith("succeeded");
  });

  it("reports any other failure inside the dialog in STD-UI-19 form", async () => {
    const user = userEvent.setup();
    cancelMock.mockRejectedValue(new ApiError("boom", "req-4", { code: "internal" }));
    renderControl("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));

    const alert = await within(screen.getByRole("dialog")).findByRole("alert");
    expect(alert).toHaveTextContent("Cancelling run r-1 failed: boom (request req-4)");
  });
});

describe("Cancel is not offered when it cannot apply", () => {
  it.each<RunState>(["cancelling", "succeeded", "partial", "failed", "cancelled", "abandoned"])(
    "renders no trigger for %s",
    (state) => {
      renderControl(state);
      expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
    },
  );
});

// CAP-001-E7-S4 T013 (AC-19, DAC-E7-S4-3; DEC-0018, Open Gap P4): once the
// owning screen has observed a newer state, the control's own badge would be
// stale.
describe("CancelRunControl — after its owner observes a newer state (CAP-001-E7-S4)", () => {
  function renderWithRerender(state: RunState) {
    const view = render(<CancelRunControl runId="r-1" state={state} />);
    return (next: RunState) => view.rerender(<CancelRunControl runId="r-1" state={next} />);
  }

  it("renders nothing after a 202 once the state prop moves past running", async () => {
    const user = userEvent.setup();
    cancelMock.mockResolvedValue({ state: "cancelling" });
    const rerender = renderWithRerender("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));
    expect(await screen.findByTestId("outcome-badge")).toHaveTextContent("Cancelling");

    rerender("cancelling");
    expect(screen.queryByTestId("outcome-badge")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Cancelling");

    rerender("cancelled");
    expect(screen.queryByTestId("outcome-badge")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel run" })).not.toBeInTheDocument();
  });

  it("keeps the 409 message and the actual outcome when the state prop turns terminal", async () => {
    const user = userEvent.setup();
    cancelMock.mockRejectedValue(
      new ApiError("Run already reached a terminal state.", "req-3", {
        code: "run_already_terminal",
        state: "succeeded",
      }),
    );
    const rerender = renderWithRerender("running");

    await user.click(screen.getByRole("button", { name: "Cancel run" }));
    await user.click(screen.getByRole("button", { name: "Stop run" }));
    expect(await screen.findByText("This run had already completed.")).toBeInTheDocument();

    rerender("succeeded");
    expect(screen.getByText("This run had already completed.")).toBeInTheDocument();
    expect(screen.getByTestId("outcome-badge")).toHaveTextContent("Succeeded");
  });
});
