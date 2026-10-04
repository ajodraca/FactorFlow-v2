import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ApiUnreachableError,
  cancelAcquisitionRun,
  getAcquisitionRun,
  listAcquisitionRuns,
  startAcquisitionRun,
} from "./client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const WIRE_RUN = {
  run_id: "8b1c0e3a-0000-4000-8000-000000000001",
  state: "partial",
  history_depth_years: 5,
  requested_at: "2026-09-06T15:00:00Z",
  started_at: "2026-09-06T15:00:05Z",
  ended_at: null,
  instruments_named: 10,
  instruments_written: 8,
  instruments_failed: 2,
  failure_reason: "provider refused two symbols",
};

// Supports AC-23, AC-24 and DAC-E5-S6-6: the error envelope's `code` and
// `state` reach callers, so a control can key off them rather than off the
// message text.
describe("ApiError — additive code and state", () => {
  it("keeps the two-argument shape, with code and state null", () => {
    const error = new ApiError("m", "r");
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("m");
    expect(error.requestId).toBe("r");
    expect(error.code).toBeNull();
    expect(error.state).toBeNull();
  });

  it("reads code and state from a 409 run_already_terminal envelope", async () => {
    stubFetch(
      jsonResponse(409, {
        error: {
          code: "run_already_terminal",
          message: "m",
          resource: "acquisition-run",
          request_id: "r",
          state: "failed",
        },
      }),
    );
    const error = await cancelAcquisitionRun("x").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("run_already_terminal");
    expect((error as ApiError).state).toBe("failed");
    expect((error as ApiError).requestId).toBe("r");
  });

  it("leaves state null when the envelope carries none", async () => {
    stubFetch(
      jsonResponse(409, {
        error: { code: "no_active_instruments", message: "m", request_id: "r" },
      }),
    );
    const error = await startAcquisitionRun().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("no_active_instruments");
    expect((error as ApiError).state).toBeNull();
  });

  it("keeps the generic message, an unknown request id and a null code for a non-JSON 500", async () => {
    stubFetch(new Response("<html>boom</html>", { status: 500 }));
    const error = await listAcquisitionRuns().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe("request failed with status 500");
    expect((error as ApiError).requestId).toBe("unknown");
    expect((error as ApiError).code).toBeNull();
    expect((error as ApiError).state).toBeNull();
  });
});

describe("listAcquisitionRuns", () => {
  it("requests the bare path when no filter is given", async () => {
    const fetchMock = stubFetch(jsonResponse(200, { runs: [], next_cursor: null }));
    await listAcquisitionRuns();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/acquisition-runs");
  });

  it("adds only the filters that are present", async () => {
    const fetchMock = stubFetch(jsonResponse(200, { runs: [], next_cursor: null }));
    await listAcquisitionRuns({ state: "failed", cursor: "c" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/acquisition-runs?state=failed&cursor=c");
  });

  it("maps every snake_case field of a run, and next_cursor", async () => {
    stubFetch(jsonResponse(200, { runs: [WIRE_RUN], next_cursor: "c1" }));
    const page = await listAcquisitionRuns();
    expect(page).toEqual({
      runs: [
        {
          runId: WIRE_RUN.run_id,
          state: "partial",
          historyDepthYears: 5,
          requestedAt: "2026-09-06T15:00:00Z",
          startedAt: "2026-09-06T15:00:05Z",
          endedAt: null,
          instrumentsNamed: 10,
          instrumentsWritten: 8,
          instrumentsFailed: 2,
          failureReason: "provider refused two symbols",
        },
      ],
      nextCursor: "c1",
    });
  });
});

describe("startAcquisitionRun", () => {
  it("posts with no body and no Content-Type", async () => {
    const fetchMock = stubFetch(
      jsonResponse(202, { run_id: "r-1", state: "requested", queued_behind: null }),
    );
    await startAcquisitionRun();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/acquisition-runs");
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
  });

  it("maps a 202 with no queue to queuedBehind null", async () => {
    stubFetch(jsonResponse(202, { run_id: "r-1", state: "requested", queued_behind: null }));
    await expect(startAcquisitionRun()).resolves.toEqual({
      runId: "r-1",
      state: "requested",
      queuedBehind: null,
    });
  });

  it("maps a 202 queued behind an active run", async () => {
    stubFetch(jsonResponse(202, { run_id: "r-2", state: "requested", queued_behind: "r-1" }));
    await expect(startAcquisitionRun()).resolves.toEqual({
      runId: "r-2",
      state: "requested",
      queuedBehind: "r-1",
    });
  });
});

describe("cancelAcquisitionRun", () => {
  it("posts to the encoded run path and maps the state", async () => {
    const fetchMock = stubFetch(jsonResponse(202, { state: "cancelling" }));
    await expect(cancelAcquisitionRun("a/b")).resolves.toEqual({ state: "cancelling" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/acquisition-runs/a%2Fb/cancel");
    expect(init.method).toBe("POST");
  });
});

describe("transport failure", () => {
  it("rejects with ApiUnreachableError when fetch itself throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    await expect(listAcquisitionRuns()).rejects.toBeInstanceOf(ApiUnreachableError);
    await expect(startAcquisitionRun()).rejects.toBeInstanceOf(ApiUnreachableError);
    await expect(cancelAcquisitionRun("r-1")).rejects.toBeInstanceOf(ApiUnreachableError);
  });
});

const WIRE_DETAIL = {
  run: WIRE_RUN,
  counts: {
    instruments_named: 10,
    instruments_written: 8,
    instruments_failed: 2,
    results_by_outcome: { written: 30, unchanged: 4, not_found: 4, failed: 2, skipped: 0 },
  },
  results: [
    {
      instrument_id: 7,
      symbol: "AAPL",
      data_type: "prices",
      outcome: "failed",
      reason: "[failed] symbol=AAPL data_type=prices request_id=req-1: upstream returned 503",
      attempts: 3,
      completed_at: "2026-09-06T15:01:00Z",
    },
  ],
  next_cursor: "c2",
};

// CAP-001-E7-S4 T011 (AC-10, DAC-E7-S4-5, DAC-E7-S4-7): the run-detail read.
describe("getAcquisitionRun", () => {
  it("requests the encoded run path with no query when no filter is given", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_DETAIL));
    await getAcquisitionRun("a b", {});
    expect(fetchMock.mock.calls[0][0]).toBe("/api/acquisition-runs/a%20b");
  });

  it("defaults to no filters, and never sends a limit", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_DETAIL));
    await getAcquisitionRun("r-1");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/acquisition-runs/r-1");
  });

  it("adds exactly the outcome and cursor filters that are present", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_DETAIL));
    await getAcquisitionRun("r-1", { outcome: "failed", cursor: "c1" });
    const url = new URL(fetchMock.mock.calls[0][0] as string, "http://x");
    expect(url.pathname).toBe("/api/acquisition-runs/r-1");
    expect([...url.searchParams.entries()]).toEqual([
      ["outcome", "failed"],
      ["cursor", "c1"],
    ]);
  });

  it("maps the run, counts, results and next_cursor to camelCase", async () => {
    stubFetch(jsonResponse(200, WIRE_DETAIL));
    await expect(getAcquisitionRun("r-1")).resolves.toEqual({
      run: {
        runId: WIRE_RUN.run_id,
        state: "partial",
        historyDepthYears: 5,
        requestedAt: "2026-09-06T15:00:00Z",
        startedAt: "2026-09-06T15:00:05Z",
        endedAt: null,
        instrumentsNamed: 10,
        instrumentsWritten: 8,
        instrumentsFailed: 2,
        failureReason: "provider refused two symbols",
      },
      counts: {
        instrumentsNamed: 10,
        instrumentsWritten: 8,
        instrumentsFailed: 2,
        resultsByOutcome: { written: 30, unchanged: 4, notFound: 4, failed: 2, skipped: 0 },
      },
      results: [
        {
          instrumentId: 7,
          symbol: "AAPL",
          dataType: "prices",
          outcome: "failed",
          reason: "[failed] symbol=AAPL data_type=prices request_id=req-1: upstream returned 503",
          attempts: 3,
          completedAt: "2026-09-06T15:01:00Z",
        },
      ],
      nextCursor: "c2",
    });
  });

  it("drops every field outside the contract", async () => {
    stubFetch(
      jsonResponse(200, {
        ...WIRE_DETAIL,
        credential: "sk-leak",
        run: { ...WIRE_RUN, api_key: "sk-leak" },
        counts: { ...WIRE_DETAIL.counts, extra: "sk-leak" },
        results: [{ ...WIRE_DETAIL.results[0], api_key: "sk-leak" }],
      }),
    );
    const detail = await getAcquisitionRun("r-1");
    expect(JSON.stringify(detail)).not.toContain("sk-leak");
    expect(Object.keys(detail).sort()).toEqual(["counts", "nextCursor", "results", "run"]);
  });

  it("rejects a 404 with ApiError carrying not_found and the request id", async () => {
    stubFetch(
      jsonResponse(404, {
        error: { code: "not_found", message: "No such run.", request_id: "req-404" },
      }),
    );
    const error = await getAcquisitionRun("r-x").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("not_found");
    expect((error as ApiError).requestId).toBe("req-404");
  });

  it("keeps the request id of a 500 whose envelope carries no message (CAP-001-E7-S2)", async () => {
    stubFetch(jsonResponse(500, { error: { code: "internal_error", request_id: "r" } }));
    const error = await getAcquisitionRun("r-1").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).requestId).toBe("r");
    expect((error as ApiError).code).toBe("internal_error");
  });

  it("rejects with ApiUnreachableError when fetch itself throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    await expect(getAcquisitionRun("r-1")).rejects.toBeInstanceOf(ApiUnreachableError);
  });
});
