import { describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, fetchCoverage, fetchCoverageGapDates } from "./client";

// Supports AC-7 and AC-8 (CAP-001-E6-S4-tasks T012). Kept apart from
// `client.runs.test.ts` so the two stories never edit one test file.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(response: Response | Error): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) {
      throw response;
    }
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn>): string {
  return fetchMock.mock.calls[0]?.[0] as string;
}

const WIRE_BODY = {
  instruments: [
    {
      symbol: "AA",
      lifecycle: "retired",
      data_types: {
        reference: "present",
        prices: "present",
        fundamentals: "absent",
        corporate_actions: "unknown",
      },
      covered_from: "2024-01-02",
      covered_to: "2024-01-05",
      last_acquired_at: "2026-09-05T22:14:03Z",
      gap_count: 0,
      depth_short_by_years: 2,
    },
    {
      symbol: "AAL",
      lifecycle: "retired",
      data_types: {
        reference: "present",
        prices: "absent",
        fundamentals: "absent",
        corporate_actions: "absent",
      },
      covered_from: null,
      covered_to: null,
      last_acquired_at: null,
      gap_count: null,
      depth_short_by_years: null,
    },
  ],
  never_acquired: false,
  gap_detection: { available: true, reason: null },
  next_cursor: "AAL",
};

describe("fetchCoverage", () => {
  it("sends only the present filters, never limit, from or to, and maps to camelCase", async () => {
    const fetchMock = stubFetch(jsonResponse(WIRE_BODY));

    const result = await fetchCoverage({ symbol: "AA", lifecycle: "retired", cursor: "X" });

    const url = requestedUrl(fetchMock);
    expect(url).toBe("/api/coverage?symbol=AA&lifecycle=retired&cursor=X");
    for (const param of ["limit=", "from=", "to="]) {
      expect(url).not.toContain(param);
    }
    expect(Object.keys(result).sort()).toEqual(
      ["gapDetection", "neverAcquired", "nextCursor", "rows"].sort(),
    );
    expect(result.rows[0]).toEqual({
      symbol: "AA",
      lifecycle: "retired",
      dataTypes: {
        reference: "present",
        prices: "present",
        fundamentals: "absent",
        corporate_actions: "unknown",
      },
      coveredFrom: "2024-01-02",
      coveredTo: "2024-01-05",
      lastAcquiredAt: "2026-09-05T22:14:03Z",
      gapCount: 0,
      depthShortByYears: 2,
    });
    expect(result.rows[1]?.gapCount).toBeNull();
    expect(result.rows[1]?.coveredFrom).toBeNull();
    expect(result.neverAcquired).toBe(false);
    expect(result.gapDetection).toEqual({ available: true, reason: null });
    expect(result.nextCursor).toBe("AAL");
  });

  it("requests exactly /api/coverage with no filters", async () => {
    const fetchMock = stubFetch(jsonResponse(WIRE_BODY));
    await fetchCoverage();
    expect(requestedUrl(fetchMock)).toBe("/api/coverage");
  });

  it("rejects a 422 envelope with ApiError carrying its message and request id", async () => {
    stubFetch(
      jsonResponse(
        { error: { code: "validation_error", message: "bad cursor", request_id: "req-1" } },
        422,
      ),
    );
    const failure = await fetchCoverage({ cursor: "?" }).catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).message).toBe("bad cursor");
    expect((failure as ApiError).requestId).toBe("req-1");
  });

  it("rejects a thrown fetch with ApiUnreachableError", async () => {
    stubFetch(new TypeError("network down"));
    await expect(fetchCoverage()).rejects.toBeInstanceOf(ApiUnreachableError);
  });
});

describe("fetchCoverageGapDates", () => {
  it("narrows the page to the symbol, expands it, and returns only the expansion", async () => {
    const fetchMock = stubFetch(
      jsonResponse({
        ...WIRE_BODY,
        expanded: { symbol: "BRK.B", gap_dates: ["2024-01-03"] },
      }),
    );

    const result = await fetchCoverageGapDates("BRK.B");

    expect(requestedUrl(fetchMock)).toBe("/api/coverage?symbol=BRK.B&limit=1&expand=BRK.B");
    expect(result).toEqual({ symbol: "BRK.B", gapDates: ["2024-01-03"] });
  });

  it("URL-encodes the symbol", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ ...WIRE_BODY, expanded: { symbol: "A&B", gap_dates: [] } }),
    );
    await fetchCoverageGapDates("A&B");
    expect(requestedUrl(fetchMock)).toBe("/api/coverage?symbol=A%26B&limit=1&expand=A%26B");
  });

  it("passes a null gap_dates through as null", async () => {
    stubFetch(jsonResponse({ ...WIRE_BODY, expanded: { symbol: "AA", gap_dates: null } }));
    expect(await fetchCoverageGapDates("AA")).toEqual({ symbol: "AA", gapDates: null });
  });

  it("rejects a body without expanded rather than returning an empty list", async () => {
    stubFetch(jsonResponse(WIRE_BODY));
    await expect(fetchCoverageGapDates("AA")).rejects.toBeInstanceOf(ApiError);
  });
});
