import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RunDetailScreen from "./detail";

/** A synthetic credential-like value, never a real one. */
const SECRET = "sk-e7s4-credential-like-0000";

const REDACTED_REASON =
  "[provider_unavailable] symbol=MSFT data_type=fundamentals request_id=req-e7s4-001: upstream error key=[redacted]";
const MARKUP_REASON = '<img src=x onerror="alert(1)">';

const WIRE_BODY = {
  run: {
    run_id: "r-1",
    state: "partial",
    history_depth_years: 5,
    requested_at: "2026-09-06T14:00:00Z",
    started_at: "2026-09-06T14:00:05Z",
    ended_at: "2026-09-06T14:30:00Z",
    instruments_named: 1,
    instruments_written: 0,
    instruments_failed: 1,
    failure_reason: null,
    credential: SECRET,
  },
  counts: {
    instruments_named: 1,
    instruments_written: 0,
    instruments_failed: 1,
    results_by_outcome: { written: 0, unchanged: 0, not_found: 0, failed: 2, skipped: 0 },
  },
  results: [
    {
      instrument_id: 11,
      symbol: "MSFT",
      data_type: "fundamentals",
      outcome: "failed",
      reason: REDACTED_REASON,
      attempts: 3,
      completed_at: "2026-09-06T14:10:00Z",
      api_key: SECRET,
    },
    {
      instrument_id: 11,
      symbol: "MSFT",
      data_type: "prices",
      outcome: "failed",
      reason: MARKUP_REASON,
      attempts: 1,
      completed_at: "2026-09-06T14:11:00Z",
    },
  ],
  next_cursor: null,
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify(WIRE_BODY), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    ),
  );
});

// Implements TC-COMP-096
describe("A reason shows its data type and request id, never a credential (DAC-E7-S4-5)", () => {
  it("renders through the real client mapping, as text only", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/runs/r-1"]}>
        <Routes>
          <Route path="/runs/:runId" element={<RunDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: "Show data types for MSFT" }));

    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Fundamentals" })).toBeInTheDocument();
    expect(table).toHaveTextContent("req-e7s4-001");
    expect(document.body.innerHTML).not.toContain(SECRET);

    expect(
      screen.getByText(`Acquiring prices for MSFT failed: ${MARKUP_REASON}`),
    ).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });
});
