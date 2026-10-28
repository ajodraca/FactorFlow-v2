import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  ClassificationApiError,
  addUniverseMembers,
  createUniverse,
  getClassificationSet,
  getClassificationSummary,
  getStockEvidence,
  getStockHistory,
  getUniverse,
  listClassificationSets,
  listClassifications,
  listUniverseEvents,
  listUniverses,
  removeUniverseMember,
  renameUniverse,
  retireUniverse,
} from "./classification-client";
import type {
  ClassificationList,
  ClassificationSummary,
  CurrentSet,
  LaterSet,
} from "./classification-types";
import { ApiError, ApiUnreachableError, requestJson } from "./client";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

// Implements TC-COMP-130 (DAC-E4-S1-1): `requestJson` is exported from the
// delivered client with its behaviour unchanged. The one-line diff of
// `client.ts` and the unchanged delivered client tests are checked by T012.
describe("TC-COMP-130 — requestJson is exported unchanged", () => {
  it("is a function", () => {
    expect(typeof requestJson).toBe("function");
  });

  it("returns a 200 JSON body unchanged", async () => {
    const body = { a: 1, nested: { b_c: "1.2300000000" }, list: [null, "x"] };
    stubFetch(jsonResponse(200, body));
    await expect(requestJson("/api/anything")).resolves.toEqual(body);
  });

  it("rejects a 404 envelope with ApiError carrying its code and request id", async () => {
    stubFetch(
      jsonResponse(404, {
        error: {
          code: "universe_not_found",
          message: "No universe has that id.",
          resource: "universe",
          request_id: "req-404",
        },
      }),
    );
    const error = await requestJson("/api/universes/x").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("universe_not_found");
    expect((error as ApiError).requestId).toBe("req-404");
  });

  it("rejects a failed fetch with ApiUnreachableError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    await expect(requestJson("/api/universes")).rejects.toBeInstanceOf(ApiUnreachableError);
  });
});

// --- Fixtures: made-up wire JSON written from classification-api section 2.7.

const WIRE_CELL_CLASSIFIED = {
  status: "classified",
  score: "1.2300000000",
  percentile: "87.0000000000",
  reason_code: null,
  reason_input: null,
  reason_detail: null,
  restated_possible: false,
};
const CELL_CLASSIFIED = {
  status: "classified",
  score: "1.2300000000",
  percentile: "87.0000000000",
  reasonCode: null,
  reasonInput: null,
  reasonDetail: null,
  restatedPossible: false,
};
const WIRE_CELL_NOT_CLASSIFIED = {
  status: "not_classified",
  score: null,
  percentile: null,
  reason_code: "input_missing",
  reason_input: "book_value",
  reason_detail: "no filing on record",
  restated_possible: true,
};
const CELL_NOT_CLASSIFIED = {
  status: "not_classified",
  score: null,
  percentile: null,
  reasonCode: "input_missing",
  reasonInput: "book_value",
  reasonDetail: "no filing on record",
  restatedPossible: true,
};
const WIRE_CELL_ZERO = {
  status: "classified",
  score: "-0.5000000000",
  percentile: "0.0000000000",
  reason_code: null,
  reason_input: null,
  reason_detail: null,
  restated_possible: false,
};
const CELL_ZERO = {
  status: "classified",
  score: "-0.5000000000",
  percentile: "0.0000000000",
  reasonCode: null,
  reasonInput: null,
  reasonDetail: null,
  restatedPossible: false,
};
const WIRE_CELLS = {
  value: WIRE_CELL_CLASSIFIED,
  growth: WIRE_CELL_NOT_CLASSIFIED,
  momentum: WIRE_CELL_ZERO,
};
const CELLS = { value: CELL_CLASSIFIED, growth: CELL_NOT_CLASSIFIED, momentum: CELL_ZERO };

const WIRE_SET = {
  set_id: "set-1",
  classification_date: "2026-10-15",
  run_id: "run-1",
  run_started_at: "2026-10-15T17:30:00-05:00",
  run_outcome: "partial",
  state: "complete",
  started_at: "2026-10-15T17:40:00-05:00",
  ended_at: "2026-10-15T17:46:00-05:00",
  latest_trading_day: "2026-10-14",
  active_instruments: 1250,
  not_current: false,
};
const SET: CurrentSet = {
  setId: "set-1",
  classificationDate: "2026-10-15",
  runId: "run-1",
  runStartedAt: "2026-10-15T17:30:00-05:00",
  runOutcome: "partial",
  state: "complete",
  startedAt: "2026-10-15T17:40:00-05:00",
  endedAt: "2026-10-15T17:46:00-05:00",
  latestTradingDay: "2026-10-14",
  activeInstruments: 1250,
  notCurrent: false,
};
const WIRE_LATER_BUILDING = {
  set_id: "set-2",
  state: "building",
  started_at: "2026-10-16T17:40:00-05:00",
  ended_at: null,
  failure_reason: null,
  run_id: "run-2",
  run_started_at: "2026-10-16T17:30:00-05:00",
};
const LATER_BUILDING: LaterSet = {
  setId: "set-2",
  state: "building",
  startedAt: "2026-10-16T17:40:00-05:00",
  endedAt: null,
  failureReason: null,
  runId: "run-2",
  runStartedAt: "2026-10-16T17:30:00-05:00",
};
const WIRE_LATER_FAILED = {
  set_id: "set-3",
  state: "failed",
  started_at: "2026-10-17T17:40:00-05:00",
  ended_at: "2026-10-17T17:41:00-05:00",
  failure_reason: "statement timeout",
  run_id: "run-3",
  run_started_at: "2026-10-17T17:30:00-05:00",
};
const LATER_FAILED: LaterSet = {
  setId: "set-3",
  state: "failed",
  startedAt: "2026-10-17T17:40:00-05:00",
  endedAt: "2026-10-17T17:41:00-05:00",
  failureReason: "statement timeout",
  runId: "run-3",
  runStartedAt: "2026-10-17T17:30:00-05:00",
};
const WIRE_SUMMARIES = {
  value: { qualified_count: 1100, ranked: true, min_peer_set_size: 30 },
  growth: { qualified_count: 12, ranked: false, min_peer_set_size: 30 },
  momentum: { qualified_count: 0, ranked: false, min_peer_set_size: 31 },
};
const SUMMARIES = {
  value: { qualifiedCount: 1100, ranked: true, minPeerSetSize: 30 },
  growth: { qualifiedCount: 12, ranked: false, minPeerSetSize: 30 },
  momentum: { qualifiedCount: 0, ranked: false, minPeerSetSize: 31 },
};

const WIRE_UNIVERSE_BY_HAND = {
  universe_id: "u-1",
  name: "Tech",
  lifecycle: "active",
  created_at: "2026-10-01T09:00:00-05:00",
  retired_at: null,
  member_count: 2,
  as_of: "2026-10-18",
  as_of_before_creation: false,
  origin: {
    kind: "by_hand",
    set_id: null,
    classification_date: null,
    thresholds: null,
    hide_incomplete: null,
    symbol: null,
  },
  members: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      lifecycle: "active",
      member_since: "2026-10-01T09:00:00-05:00",
      factors: WIRE_CELLS,
    },
    {
      symbol: "NEWCO",
      name: null,
      lifecycle: "retired",
      member_since: "2026-10-02T10:00:00-05:00",
      factors: null,
    },
  ],
  set: WIRE_SET,
};
const UNIVERSE_BY_HAND = {
  universeId: "u-1",
  name: "Tech",
  lifecycle: "active",
  createdAt: "2026-10-01T09:00:00-05:00",
  retiredAt: null,
  memberCount: 2,
  asOf: "2026-10-18",
  asOfBeforeCreation: false,
  origin: {
    kind: "by_hand",
    setId: null,
    classificationDate: null,
    thresholds: null,
    hideIncomplete: null,
    symbol: null,
  },
  members: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      lifecycle: "active",
      memberSince: "2026-10-01T09:00:00-05:00",
      factors: CELLS,
    },
    {
      symbol: "NEWCO",
      name: null,
      lifecycle: "retired",
      memberSince: "2026-10-02T10:00:00-05:00",
      factors: null,
    },
  ],
  set: SET,
};
const WIRE_UNIVERSE_FROM_FILTER = {
  ...WIRE_UNIVERSE_BY_HAND,
  universe_id: "u-2",
  name: "Cheap",
  lifecycle: "retired",
  retired_at: "2026-10-20T08:00:00-05:00",
  member_count: 1,
  as_of: "2026-09-30",
  as_of_before_creation: true,
  origin: {
    kind: "from_filter",
    set_id: "set-1",
    classification_date: "2026-10-15",
    thresholds: { value_percentile_min: "80.0000000000", momentum_score_min: "0.0000000000" },
    hide_incomplete: true,
    symbol: "AA",
  },
  members: [],
  set: null,
};
const UNIVERSE_FROM_FILTER = {
  ...UNIVERSE_BY_HAND,
  universeId: "u-2",
  name: "Cheap",
  lifecycle: "retired",
  retiredAt: "2026-10-20T08:00:00-05:00",
  memberCount: 1,
  asOf: "2026-09-30",
  asOfBeforeCreation: true,
  origin: {
    kind: "from_filter",
    setId: "set-1",
    classificationDate: "2026-10-15",
    thresholds: { value_percentile_min: "80.0000000000", momentum_score_min: "0.0000000000" },
    hideIncomplete: true,
    symbol: "AA",
  },
  members: [],
  set: null,
};

const WIRE_LIST = {
  never_classified: false,
  set: WIRE_SET,
  later: null,
  factors: WIRE_SUMMARIES,
  match_count: 1200,
  stocks: [
    { symbol: "AAPL", name: "Apple Inc.", lifecycle: "active", factors: WIRE_CELLS },
    {
      symbol: "BRK.B",
      name: "Berkshire Hathaway",
      lifecycle: "retired",
      factors: { value: WIRE_CELL_ZERO, growth: WIRE_CELL_CLASSIFIED, momentum: WIRE_CELL_ZERO },
    },
  ],
  unknown_symbols: ["ZZZZ"],
  next_cursor: "cursor-2",
};

const WIRE_SUMMARY_BODY = {
  never_classified: false,
  set: WIRE_SET,
  later: null,
  factors: WIRE_SUMMARIES,
  stocks_current: { current_count: 1180, followed_count: 1250 },
};

type FetchCall = [string, RequestInit & { headers: Record<string, string> }];

function lastCall(fetchMock: ReturnType<typeof vi.fn>): FetchCall {
  return fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as FetchCall;
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  return new URL(lastCall(fetchMock)[0], "http://localhost");
}

function sentBody(fetchMock: ReturnType<typeof vi.fn>): unknown {
  return JSON.parse(String(lastCall(fetchMock)[1].body));
}

// Implements TC-COMP-131 (DAC-E4-S1-4, DAC-E4-3, AC-16): every field of
// every section 2.7 response has a camelCase counterpart, decimal strings
// and dates stay the wire's strings, and a null stays null.
describe("TC-COMP-131 — every response field has a typed counterpart", () => {
  it("maps UniverseListResponse", async () => {
    stubFetch(
      jsonResponse(200, {
        universes: [
          {
            universe_id: "u-1",
            name: "Tech",
            lifecycle: "active",
            member_count: 2,
            created_at: "2026-10-01T09:00:00-05:00",
            retired_at: null,
          },
          {
            universe_id: "u-2",
            name: "Old",
            lifecycle: "retired",
            member_count: 0,
            created_at: "2026-09-01T09:00:00-05:00",
            retired_at: "2026-09-02T09:00:00-05:00",
          },
        ],
        active_count: 1,
        retired_count: 4,
        next_cursor: null,
      }),
    );
    await expect(listUniverses()).resolves.toStrictEqual({
      universes: [
        {
          universeId: "u-1",
          name: "Tech",
          lifecycle: "active",
          memberCount: 2,
          createdAt: "2026-10-01T09:00:00-05:00",
          retiredAt: null,
        },
        {
          universeId: "u-2",
          name: "Old",
          lifecycle: "retired",
          memberCount: 0,
          createdAt: "2026-09-01T09:00:00-05:00",
          retiredAt: "2026-09-02T09:00:00-05:00",
        },
      ],
      activeCount: 1,
      retiredCount: 4,
      nextCursor: null,
    });
  });

  it("maps a by_hand UniverseResponse, a member with null factors and name included", async () => {
    stubFetch(jsonResponse(200, WIRE_UNIVERSE_BY_HAND));
    const universe = await getUniverse("u-1");
    expect(universe).toStrictEqual(UNIVERSE_BY_HAND);
    const [, nullMember] = universe.members;
    expect(nullMember.factors).toBeNull();
    expect(nullMember.name).toBeNull();
    expect(nullMember.symbol).toBe("NEWCO");
    expect(nullMember.lifecycle).toBe("retired");
    expect(nullMember.memberSince).toBe("2026-10-02T10:00:00-05:00");
    expect(universe.origin.setId).toBeNull();
    expect(universe.origin.classificationDate).toBeNull();
    expect(universe.origin.thresholds).toBeNull();
    expect(universe.origin.hideIncomplete).toBeNull();
    expect(universe.origin.symbol).toBeNull();
  });

  it("maps a from_filter UniverseResponse, keeping the thresholds keys and strings", async () => {
    stubFetch(jsonResponse(201, WIRE_UNIVERSE_FROM_FILTER));
    const universe = await createUniverse({
      name: "Cheap",
      filter: { valuePercentileMin: "80", hideIncomplete: true, symbol: "AA" },
      setId: "set-1",
    });
    expect(universe).toStrictEqual(UNIVERSE_FROM_FILTER);
    expect(universe.origin.thresholds).toStrictEqual({
      value_percentile_min: "80.0000000000",
      momentum_score_min: "0.0000000000",
    });
    expect(universe.origin.thresholds).not.toHaveProperty("valuePercentileMin");
  });

  it("maps a from_filter origin saved with no search active", async () => {
    stubFetch(
      jsonResponse(200, {
        ...WIRE_UNIVERSE_FROM_FILTER,
        origin: { ...WIRE_UNIVERSE_FROM_FILTER.origin, symbol: null, hide_incomplete: false },
      }),
    );
    const universe = await getUniverse("u-2");
    expect(universe.origin.symbol).toBeNull();
    expect(universe.origin.hideIncomplete).toBe(false);
  });

  it("maps UniverseEventsResponse, passing filter_provenance through unrenamed", async () => {
    const provenance = {
      thresholds: { value_percentile_min: 80 },
      hide_incomplete: true,
      set_id: "set-1",
      classification_date: "2026-10-15",
    };
    stubFetch(
      jsonResponse(200, {
        events: [
          {
            event_id: 7,
            event_type: "created",
            name: "Cheap",
            symbol: null,
            recorded_at: "2026-10-15T18:00:00-05:00",
            recorded_on: "2026-10-15",
            filter_provenance: provenance,
          },
          {
            event_id: 8,
            event_type: "member_removed",
            name: null,
            symbol: "AAPL",
            recorded_at: "2026-10-16T18:00:00-05:00",
            recorded_on: "2026-10-16",
            filter_provenance: null,
          },
        ],
        next_cursor: "cursor-e",
      }),
    );
    const page = await listUniverseEvents("u-2");
    expect(page).toStrictEqual({
      events: [
        {
          eventId: 7,
          eventType: "created",
          name: "Cheap",
          symbol: null,
          recordedAt: "2026-10-15T18:00:00-05:00",
          recordedOn: "2026-10-15",
          filterProvenance: provenance,
        },
        {
          eventId: 8,
          eventType: "member_removed",
          name: null,
          symbol: "AAPL",
          recordedAt: "2026-10-16T18:00:00-05:00",
          recordedOn: "2026-10-16",
          filterProvenance: null,
        },
      ],
      nextCursor: "cursor-e",
    });
  });

  it("maps AddMembersResponse, RemoveMemberResponse and RetireUniverseResponse", async () => {
    stubFetch(jsonResponse(200, { added: ["MSFT"], already_member: ["AAPL", "TSLA"] }));
    await expect(addUniverseMembers("u-1", ["MSFT", "AAPL", "TSLA"])).resolves.toStrictEqual({
      added: ["MSFT"],
      alreadyMember: ["AAPL", "TSLA"],
    });
    stubFetch(jsonResponse(200, { removed_at: "2026-10-16T18:00:00-05:00" }));
    await expect(removeUniverseMember("u-1", "AAPL")).resolves.toStrictEqual({
      removedAt: "2026-10-16T18:00:00-05:00",
    });
    stubFetch(jsonResponse(200, { lifecycle: "retired", retired_at: "2026-10-20T08:00:00-05:00" }));
    await expect(retireUniverse("u-1")).resolves.toStrictEqual({
      lifecycle: "retired",
      retiredAt: "2026-10-20T08:00:00-05:00",
    });
  });

  it("maps ClassificationListResponse, with matchCount from match_count and not the rows", async () => {
    stubFetch(jsonResponse(200, WIRE_LIST));
    const list = await listClassifications();
    expect(list).toStrictEqual({
      neverClassified: false,
      set: SET,
      later: null,
      factors: SUMMARIES,
      matchCount: 1200,
      stocks: [
        { symbol: "AAPL", name: "Apple Inc.", lifecycle: "active", factors: CELLS },
        {
          symbol: "BRK.B",
          name: "Berkshire Hathaway",
          lifecycle: "retired",
          factors: { value: CELL_ZERO, growth: CELL_CLASSIFIED, momentum: CELL_ZERO },
        },
      ],
      unknownSymbols: ["ZZZZ"],
      nextCursor: "cursor-2",
    });
    expect(list.matchCount).toBe(1200);
    expect(list.stocks).toHaveLength(2);
    const cell = list.stocks[0].factors.value;
    expect(typeof cell.score).toBe("string");
    expect(typeof cell.percentile).toBe("string");
    expect(cell.score).toBe("1.2300000000");
    expect(cell.percentile).toBe("87.0000000000");
    expect(list.stocks[0].factors.momentum.percentile).toBe("0.0000000000");
    expect(list.stocks[0].factors.growth.score).toBeNull();
    expect(typeof list.set?.classificationDate).toBe("string");
  });

  it("maps ClassificationSummaryResponse with stocks_current as an object and as null", async () => {
    stubFetch(jsonResponse(200, WIRE_SUMMARY_BODY));
    await expect(getClassificationSummary()).resolves.toStrictEqual({
      neverClassified: false,
      set: SET,
      later: null,
      factors: SUMMARIES,
      stocksCurrent: { currentCount: 1180, followedCount: 1250 },
    });
    stubFetch(jsonResponse(200, { ...WIRE_SUMMARY_BODY, stocks_current: null }));
    const summary = await getClassificationSummary();
    expect(summary.stocksCurrent).toBeNull();
  });

  it("maps StockEvidenceResponse, a missing input row's nulls and detail included", async () => {
    const detail = { thresholds: { value_percentile_min: 80 }, hide_incomplete: true };
    stubFetch(
      jsonResponse(200, {
        symbol: "AAPL",
        name: "Apple Inc.",
        lifecycle: "active",
        set: WIRE_SET,
        factors: WIRE_CELLS,
        inputs: [
          {
            factor: "value",
            input_name: "book_to_price",
            label: "Book to price",
            status: "present",
            value: "0.0412000000",
            as_of: "2026-09-30",
            known_on: "2026-10-02",
            restated_possible: true,
            detail,
          },
          {
            factor: "growth",
            input_name: "sales_growth",
            label: "Sales growth",
            status: "missing",
            value: null,
            as_of: null,
            known_on: null,
            restated_possible: false,
            detail: {},
          },
        ],
        memberships: [
          { universe_id: "u-9", name: "Dividend growers" },
          { universe_id: "u-1", name: "Tech" },
        ],
      }),
    );
    const evidence = await getStockEvidence("AAPL");
    expect(evidence).toStrictEqual({
      symbol: "AAPL",
      name: "Apple Inc.",
      lifecycle: "active",
      set: SET,
      factors: CELLS,
      inputs: [
        {
          factor: "value",
          inputName: "book_to_price",
          label: "Book to price",
          status: "present",
          value: "0.0412000000",
          asOf: "2026-09-30",
          knownOn: "2026-10-02",
          restatedPossible: true,
          detail,
        },
        {
          factor: "growth",
          inputName: "sales_growth",
          label: "Sales growth",
          status: "missing",
          value: null,
          asOf: null,
          knownOn: null,
          restatedPossible: false,
          detail: {},
        },
      ],
      memberships: [
        { universeId: "u-9", name: "Dividend growers" },
        { universeId: "u-1", name: "Tech" },
      ],
    });
    expect(evidence.inputs[0].detail).toEqual(detail);
    expect(evidence.inputs[1].value).toBeNull();
    expect(evidence.inputs[1].asOf).toBeNull();
    expect(evidence.inputs[1].knownOn).toBeNull();
  });

  it("maps a StockEvidenceResponse with no set and no cells (DEC-0140)", async () => {
    stubFetch(
      jsonResponse(200, {
        symbol: "NEWCO",
        name: "New Co",
        lifecycle: "active",
        set: null,
        factors: {},
        inputs: [],
        memberships: [],
      }),
    );
    await expect(getStockEvidence("NEWCO")).resolves.toStrictEqual({
      symbol: "NEWCO",
      name: "New Co",
      lifecycle: "active",
      set: null,
      factors: {},
      inputs: [],
      memberships: [],
    });
  });

  it("maps StockHistoryResponse", async () => {
    stubFetch(
      jsonResponse(200, {
        symbol: "AAPL",
        sets: [
          {
            set_id: "set-0",
            classification_date: "2026-10-08",
            run_id: "run-0",
            run_outcome: "succeeded",
            ended_at: "2026-10-08T17:46:00-05:00",
            factors: WIRE_CELLS,
          },
          {
            set_id: "set-x",
            classification_date: "2026-10-01",
            run_id: "run-x",
            run_outcome: "partial",
            ended_at: "2026-10-01T17:46:00-05:00",
            factors: { value: WIRE_CELL_ZERO, growth: WIRE_CELL_ZERO, momentum: WIRE_CELL_ZERO },
          },
        ],
        next_cursor: "cursor-h",
      }),
    );
    await expect(getStockHistory("AAPL")).resolves.toStrictEqual({
      symbol: "AAPL",
      sets: [
        {
          setId: "set-0",
          classificationDate: "2026-10-08",
          runId: "run-0",
          runOutcome: "succeeded",
          endedAt: "2026-10-08T17:46:00-05:00",
          factors: CELLS,
        },
        {
          setId: "set-x",
          classificationDate: "2026-10-01",
          runId: "run-x",
          runOutcome: "partial",
          endedAt: "2026-10-01T17:46:00-05:00",
          factors: { value: CELL_ZERO, growth: CELL_ZERO, momentum: CELL_ZERO },
        },
      ],
      nextCursor: "cursor-h",
    });
  });

  const WIRE_SET_ROW_COMPLETE = {
    set_id: "set-1",
    state: "complete",
    classification_date: "2026-10-15",
    run_id: "run-1",
    run_started_at: "2026-10-15T17:30:00-05:00",
    run_outcome: "partial",
    started_at: "2026-10-15T17:40:00-05:00",
    ended_at: "2026-10-15T17:46:00-05:00",
    failure_reason: null,
    latest_trading_day: "2026-10-14",
    active_instruments: 1250,
    factors: WIRE_SUMMARIES,
  };
  const SET_ROW_COMPLETE = {
    setId: "set-1",
    state: "complete",
    classificationDate: "2026-10-15",
    runId: "run-1",
    runStartedAt: "2026-10-15T17:30:00-05:00",
    runOutcome: "partial",
    startedAt: "2026-10-15T17:40:00-05:00",
    endedAt: "2026-10-15T17:46:00-05:00",
    failureReason: null,
    latestTradingDay: "2026-10-14",
    activeInstruments: 1250,
    factors: SUMMARIES,
  };

  it("maps SetListResponse", async () => {
    stubFetch(
      jsonResponse(200, {
        sets: [
          WIRE_SET_ROW_COMPLETE,
          {
            ...WIRE_SET_ROW_COMPLETE,
            set_id: "set-3",
            state: "failed",
            ended_at: "2026-10-17T17:41:00-05:00",
            failure_reason: "statement timeout",
          },
        ],
        next_cursor: "cursor-s",
      }),
    );
    await expect(listClassificationSets()).resolves.toStrictEqual({
      sets: [
        SET_ROW_COMPLETE,
        {
          ...SET_ROW_COMPLETE,
          setId: "set-3",
          state: "failed",
          endedAt: "2026-10-17T17:41:00-05:00",
          failureReason: "statement timeout",
        },
      ],
      nextCursor: "cursor-s",
    });
  });

  it("maps a building SetResponse whose nullable columns are null", async () => {
    stubFetch(
      jsonResponse(200, {
        ...WIRE_SET_ROW_COMPLETE,
        set_id: "set-2",
        state: "building",
        ended_at: null,
        failure_reason: null,
        latest_trading_day: null,
        active_instruments: null,
      }),
    );
    await expect(getClassificationSet("set-2")).resolves.toStrictEqual({
      ...SET_ROW_COMPLETE,
      setId: "set-2",
      state: "building",
      endedAt: null,
      failureReason: null,
      latestTradingDay: null,
      activeInstruments: null,
    });
  });
});

// Implements TC-COMP-183 (DAC-E4-S1-3, AC-20, AC-22): `neverClassified`,
// `set` and `later` are one shape on the list and the summary reads.
describe("TC-COMP-183 — neverClassified, set and later are one shape", () => {
  it("declares the three fields with the same types on both reads", () => {
    expectTypeOf<ClassificationList["later"]>().toEqualTypeOf<LaterSet | null>();
    expectTypeOf<ClassificationSummary["later"]>().toEqualTypeOf<LaterSet | null>();
    expectTypeOf<ClassificationList["later"]>().toEqualTypeOf<ClassificationSummary["later"]>();
    expectTypeOf<ClassificationList["set"]>().toEqualTypeOf<ClassificationSummary["set"]>();
    expectTypeOf<ClassificationList["set"]>().toEqualTypeOf<CurrentSet | null>();
    expectTypeOf<ClassificationList["neverClassified"]>().toEqualTypeOf<
      ClassificationSummary["neverClassified"]
    >();
  });

  const NEVER = { never_classified: true, set: null, factors: WIRE_SUMMARIES };

  it("maps a never-classified list and summary with a building first set", async () => {
    stubFetch(
      jsonResponse(200, {
        ...NEVER,
        later: WIRE_LATER_BUILDING,
        match_count: 0,
        stocks: [],
        unknown_symbols: [],
        next_cursor: null,
      }),
    );
    const list = await listClassifications();
    stubFetch(jsonResponse(200, { ...NEVER, later: WIRE_LATER_BUILDING, stocks_current: null }));
    const summary = await getClassificationSummary();
    for (const read of [list, summary]) {
      expect(read.neverClassified).toBe(true);
      expect(read.set).toBeNull();
      expect(read.later).toStrictEqual(LATER_BUILDING);
    }
  });

  it("maps a never-classified list and summary with a failed first set and its reason", async () => {
    stubFetch(
      jsonResponse(200, {
        ...NEVER,
        later: WIRE_LATER_FAILED,
        match_count: 0,
        stocks: [],
        unknown_symbols: [],
        next_cursor: null,
      }),
    );
    const list = await listClassifications();
    stubFetch(jsonResponse(200, { ...NEVER, later: WIRE_LATER_FAILED, stocks_current: null }));
    const summary = await getClassificationSummary();
    for (const read of [list, summary]) {
      expect(read.neverClassified).toBe(true);
      expect(read.set).toBeNull();
      expect(read.later).toStrictEqual(LATER_FAILED);
      expect(read.later?.failureReason).toBe("statement timeout");
    }
  });

  it("maps a not-current set beside a later set, and a quiet one", async () => {
    stubFetch(
      jsonResponse(200, {
        ...WIRE_LIST,
        set: { ...WIRE_SET, not_current: true },
        later: WIRE_LATER_BUILDING,
      }),
    );
    const stale = await listClassifications();
    expect(stale.neverClassified).toBe(false);
    expect(stale.set).toStrictEqual({ ...SET, notCurrent: true });
    expect(stale.later).toStrictEqual(LATER_BUILDING);

    stubFetch(jsonResponse(200, WIRE_SUMMARY_BODY));
    const quiet = await getClassificationSummary();
    expect(quiet.set?.notCurrent).toBe(false);
    expect(quiet.later).toBeNull();
  });

  it("keeps never-classified apart from a set that matched nothing (AC-22)", async () => {
    stubFetch(jsonResponse(200, { ...WIRE_LIST, match_count: 0, stocks: [], next_cursor: null }));
    const noMatch = await listClassifications({ valuePercentileMin: "99" });
    expect(noMatch.neverClassified).toBe(false);
    expect(noMatch.set).toStrictEqual(SET);
    expect(noMatch.matchCount).toBe(0);
  });
});

const EMPTY_LIST = {
  never_classified: true,
  set: null,
  later: null,
  factors: WIRE_SUMMARIES,
  match_count: 0,
  stocks: [],
  unknown_symbols: [],
  next_cursor: null,
};
const EMPTY_UNIVERSES = { universes: [], active_count: 0, retired_count: 0, next_cursor: null };
const EMPTY_PAGE = { events: [], sets: [], next_cursor: null };

// AC-16, DAC-E4-3: the list read's filters travel as query parameters, and
// only the ones present are sent.
describe("request encoding for reads", () => {
  it("sends no query for a list read with no parameters", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_LIST));
    await listClassifications();
    expect(lastCall(fetchMock)[0]).toBe("/api/classifications");
  });

  it("sends each of the twelve bounds under its wire name, as the given string", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_LIST));
    await listClassifications({
      valuePercentileMin: "80",
      valuePercentileMax: "99.5",
      valueScoreMin: "-1.25",
      valueScoreMax: "2.0",
      growthPercentileMin: "10",
      growthPercentileMax: "90",
      growthScoreMin: "-3",
      growthScoreMax: "3",
      momentumPercentileMin: "0",
      momentumPercentileMax: "100",
      momentumScoreMin: "0.0",
      momentumScoreMax: "0.50",
    });
    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/api/classifications");
    expect([...url.searchParams.entries()].sort()).toStrictEqual(
      [
        ["value_percentile_min", "80"],
        ["value_percentile_max", "99.5"],
        ["value_score_min", "-1.25"],
        ["value_score_max", "2.0"],
        ["growth_percentile_min", "10"],
        ["growth_percentile_max", "90"],
        ["growth_score_min", "-3"],
        ["growth_score_max", "3"],
        ["momentum_percentile_min", "0"],
        ["momentum_percentile_max", "100"],
        ["momentum_score_min", "0.0"],
        ["momentum_score_max", "0.50"],
      ].sort(),
    );
  });

  it("sends scope, search, sort, paging and hide_incomplete when present", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_LIST));
    await listClassifications({
      universeId: "u-1",
      symbol: "AA",
      sort: "momentum_percentile",
      order: "desc",
      hideIncomplete: true,
      limit: 50,
      cursor: "c-1",
      valueScoreMin: "1",
    });
    expect([...requestedUrl(fetchMock).searchParams.entries()].sort()).toStrictEqual(
      [
        ["universe_id", "u-1"],
        ["symbol", "AA"],
        ["sort", "momentum_percentile"],
        ["order", "desc"],
        ["hide_incomplete", "true"],
        ["limit", "50"],
        ["cursor", "c-1"],
        ["value_score_min", "1"],
      ].sort(),
    );
  });

  it("leaves hide_incomplete out when false", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_LIST));
    await listClassifications({ hideIncomplete: false, sort: "symbol" });
    const url = requestedUrl(fetchMock);
    expect(url.searchParams.has("hide_incomplete")).toBe(false);
    expect([...url.searchParams.keys()]).toStrictEqual(["sort"]);
  });

  it("sends compare symbols as one repeated key per entry (DEC-0144)", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_LIST));
    await listClassifications({ symbols: ["AAPL", "MSFT", "BRK.B"] });
    const url = requestedUrl(fetchMock);
    expect(url.searchParams.getAll("symbols")).toStrictEqual(["AAPL", "MSFT", "BRK.B"]);
    expect(lastCall(fetchMock)[0]).toBe(
      "/api/classifications?symbols=AAPL&symbols=MSFT&symbols=BRK.B",
    );
  });

  it("sends only the present listUniverses parameters", async () => {
    const fetchMock = stubFetch(jsonResponse(200, EMPTY_UNIVERSES));
    await listUniverses();
    expect(lastCall(fetchMock)[0]).toBe("/api/universes");
    const second = stubFetch(jsonResponse(200, EMPTY_UNIVERSES));
    await listUniverses({ lifecycle: "all", name: "Te", limit: 10, cursor: "c-u" });
    expect([...requestedUrl(second).searchParams.entries()].sort()).toStrictEqual(
      [
        ["lifecycle", "all"],
        ["name", "Te"],
        ["limit", "10"],
        ["cursor", "c-u"],
      ].sort(),
    );
    const third = stubFetch(jsonResponse(200, EMPTY_UNIVERSES));
    await listUniverses({ name: "Te" });
    expect(lastCall(third)[0]).toBe("/api/universes?name=Te");
  });

  it("sends as_of on getUniverse only when given", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_UNIVERSE_BY_HAND));
    await getUniverse("u-1");
    expect(lastCall(fetchMock)[0]).toBe("/api/universes/u-1");
    const second = stubFetch(jsonResponse(200, WIRE_UNIVERSE_BY_HAND));
    await getUniverse("u-1", { asOf: "2026-10-01" });
    expect(lastCall(second)[0]).toBe("/api/universes/u-1?as_of=2026-10-01");
  });

  it("sends only the present paging parameters on events, sets and history", async () => {
    let fetchMock = stubFetch(jsonResponse(200, EMPTY_PAGE));
    await listUniverseEvents("u-1");
    expect(lastCall(fetchMock)[0]).toBe("/api/universes/u-1/events");
    fetchMock = stubFetch(jsonResponse(200, EMPTY_PAGE));
    await listUniverseEvents("u-1", { limit: 5, cursor: "c-e" });
    expect(lastCall(fetchMock)[0]).toBe("/api/universes/u-1/events?limit=5&cursor=c-e");

    fetchMock = stubFetch(jsonResponse(200, EMPTY_PAGE));
    await listClassificationSets();
    expect(lastCall(fetchMock)[0]).toBe("/api/classifications/sets");
    fetchMock = stubFetch(jsonResponse(200, EMPTY_PAGE));
    await listClassificationSets({ cursor: "c-s" });
    expect(lastCall(fetchMock)[0]).toBe("/api/classifications/sets?cursor=c-s");
    fetchMock = stubFetch(jsonResponse(200, EMPTY_PAGE));
    await listClassificationSets({ limit: 20 });
    expect(lastCall(fetchMock)[0]).toBe("/api/classifications/sets?limit=20");

    fetchMock = stubFetch(jsonResponse(200, { symbol: "AAPL", ...EMPTY_PAGE }));
    await getStockHistory("AAPL");
    expect(lastCall(fetchMock)[0]).toBe("/api/classifications/stocks/AAPL/history");
    fetchMock = stubFetch(jsonResponse(200, { symbol: "AAPL", ...EMPTY_PAGE }));
    await getStockHistory("AAPL", { limit: 3, cursor: "c-h" });
    expect(lastCall(fetchMock)[0]).toBe(
      "/api/classifications/stocks/AAPL/history?limit=3&cursor=c-h",
    );
  });

  it("encodes every path segment", async () => {
    const evidence = {
      symbol: "A/B",
      name: "x",
      lifecycle: "active",
      set: null,
      factors: {},
      inputs: [],
      memberships: [],
    };
    const cases: [() => Promise<unknown>, unknown, string][] = [
      [() => getUniverse("u/1"), WIRE_UNIVERSE_BY_HAND, "/api/universes/u%2F1"],
      [() => renameUniverse("u/1", "n"), WIRE_UNIVERSE_BY_HAND, "/api/universes/u%2F1"],
      [
        () => retireUniverse("u/1"),
        { lifecycle: "retired", retired_at: "2026-10-20T08:00:00-05:00" },
        "/api/universes/u%2F1",
      ],
      [() => listUniverseEvents("u/1"), EMPTY_PAGE, "/api/universes/u%2F1/events"],
      [
        () => addUniverseMembers("u/1", ["A"]),
        { added: [], already_member: [] },
        "/api/universes/u%2F1/members",
      ],
      [
        () => removeUniverseMember("u/1", "A/B"),
        { removed_at: "2026-10-16T18:00:00-05:00" },
        "/api/universes/u%2F1/members/A%2FB",
      ],
      [() => getStockEvidence("BRK.B"), evidence, "/api/classifications/stocks/BRK.B"],
      [() => getStockEvidence("A/B"), evidence, "/api/classifications/stocks/A%2FB"],
      [
        () => getStockHistory("A/B"),
        { symbol: "A/B", ...EMPTY_PAGE },
        "/api/classifications/stocks/A%2FB/history",
      ],
      [
        () => getClassificationSet("s/1"),
        { ...EMPTY_PAGE, ...WIRE_SET, failure_reason: null, factors: WIRE_SUMMARIES },
        "/api/classifications/sets/s%2F1",
      ],
    ];
    for (const [call, body, expected] of cases) {
      const fetchMock = stubFetch(jsonResponse(200, body));
      await call();
      expect(lastCall(fetchMock)[0]).toBe(expected);
    }
  });

  it("asks for JSON on every read, with no body and no Content-Type", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_SUMMARY_BODY));
    await getClassificationSummary();
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/classifications/summary");
    expect(init.headers.Accept).toBe("application/json");
    expect(init.headers).not.toHaveProperty("Content-Type");
    expect(init.body).toBeUndefined();
    expect(init.method ?? "GET").toBe("GET");
  });
});

// AC-16: the write calls send the bodies classification-api section 11 names.
describe("request bodies for writes", () => {
  it("creates a universe by hand with name and symbols and no filter", async () => {
    const fetchMock = stubFetch(jsonResponse(201, WIRE_UNIVERSE_BY_HAND));
    await createUniverse({ name: "Tech", symbols: ["AAPL", "MSFT"] });
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers.Accept).toBe("application/json");
    expect(sentBody(fetchMock)).toStrictEqual({ name: "Tech", symbols: ["AAPL", "MSFT"] });
  });

  it("creates a universe from a result with every bound under its wire name", async () => {
    const fetchMock = stubFetch(jsonResponse(201, WIRE_UNIVERSE_FROM_FILTER));
    await createUniverse({
      name: "Cheap",
      setId: "set-1",
      filter: {
        valuePercentileMin: "80",
        valuePercentileMax: "99.5",
        valueScoreMin: "-1.25",
        valueScoreMax: "2.0",
        growthPercentileMin: "10",
        growthPercentileMax: "90",
        growthScoreMin: "-3",
        growthScoreMax: "3",
        momentumPercentileMin: "0",
        momentumPercentileMax: "100",
        momentumScoreMin: "0.0",
        momentumScoreMax: "0.50",
        hideIncomplete: true,
        symbol: "AA",
      },
    });
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(sentBody(fetchMock)).toStrictEqual({
      name: "Cheap",
      set_id: "set-1",
      filter: {
        value_percentile_min: "80",
        value_percentile_max: "99.5",
        value_score_min: "-1.25",
        value_score_max: "2.0",
        growth_percentile_min: "10",
        growth_percentile_max: "90",
        growth_score_min: "-3",
        growth_score_max: "3",
        momentum_percentile_min: "0",
        momentum_percentile_max: "100",
        momentum_score_min: "0.0",
        momentum_score_max: "0.50",
        hide_incomplete: true,
        symbol: "AA",
      },
    });
  });

  it("sends only the set bounds, hide_incomplete false and a null symbol when no search is active", async () => {
    const fetchMock = stubFetch(jsonResponse(201, WIRE_UNIVERSE_FROM_FILTER));
    await createUniverse({
      name: "Cheap",
      setId: "set-1",
      filter: {
        valuePercentileMin: "80",
        momentumScoreMin: "0",
        hideIncomplete: false,
        symbol: null,
      },
    });
    expect(sentBody(fetchMock)).toStrictEqual({
      name: "Cheap",
      set_id: "set-1",
      filter: {
        value_percentile_min: "80",
        momentum_score_min: "0",
        hide_incomplete: false,
        symbol: null,
      },
    });
  });

  it("renames with PATCH and a name body", async () => {
    const fetchMock = stubFetch(jsonResponse(200, WIRE_UNIVERSE_BY_HAND));
    const universe = await renameUniverse("u-1", "Big tech");
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes/u-1");
    expect(init.method).toBe("PATCH");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(sentBody(fetchMock)).toStrictEqual({ name: "Big tech" });
    expect(universe).toStrictEqual(UNIVERSE_BY_HAND);
  });

  it("retires with DELETE and no body", async () => {
    const fetchMock = stubFetch(
      jsonResponse(200, { lifecycle: "retired", retired_at: "2026-10-20T08:00:00-05:00" }),
    );
    await retireUniverse("u-1");
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes/u-1");
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  it("adds members with POST and a symbols body", async () => {
    const fetchMock = stubFetch(jsonResponse(200, { added: ["MSFT"], already_member: [] }));
    await addUniverseMembers("u-1", ["MSFT", "TSLA"]);
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes/u-1/members");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(sentBody(fetchMock)).toStrictEqual({ symbols: ["MSFT", "TSLA"] });
  });

  it("removes a member with DELETE and no body", async () => {
    const fetchMock = stubFetch(jsonResponse(200, { removed_at: "2026-10-16T18:00:00-05:00" }));
    await removeUniverseMember("u-1", "AAPL");
    const [input, init] = lastCall(fetchMock);
    expect(input).toBe("/api/universes/u-1/members/AAPL");
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
    expect(init.headers).not.toHaveProperty("Content-Type");
  });
});

async function rejection(call: () => Promise<unknown>): Promise<unknown> {
  return call().then(
    () => {
      throw new Error("expected the call to reject");
    },
    (caught: unknown) => caught,
  );
}

function envelope(status: number, error: Record<string, unknown>): Response {
  return jsonResponse(status, { error });
}

// Implements TC-COMP-182 (DAC-E4-S1-2, AC-22): an error envelope reaches the
// caller as code, operation, resource and reason, read from fields and never
// from the prose in `message`.
describe("TC-COMP-182 — the fetch layer surfaces code, operation, resource and reason", () => {
  it("surfaces instrument_not_acquired with its symbols list, not the prose", async () => {
    stubFetch(
      envelope(409, {
        code: "instrument_not_acquired",
        message: "MISLEADING PROSE naming QQQ",
        resource: "universe",
        request_id: "r-1",
        symbols: ["MSFT", "TSLA"],
      }),
    );
    const error = await rejection(() => createUniverse({ name: "Mine", symbols: ["MSFT"] }));
    expect(error).toBeInstanceOf(ClassificationApiError);
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ClassificationApiError;
    expect(apiError.code).toBe("instrument_not_acquired");
    expect(apiError.reason).toBe("instrument_not_acquired");
    expect(apiError.resource).toBe("universe");
    expect(apiError.operation).toBe("create-universe");
    expect(apiError.requestId).toBe("r-1");
    expect(apiError.symbols).toStrictEqual(["MSFT", "TSLA"]);
    expect(apiError.name).toBe("ClassificationApiError");
    expect(apiError.state).toBeNull();
  });

  it("surfaces universe_not_found on getUniverse", async () => {
    stubFetch(
      envelope(404, {
        code: "universe_not_found",
        message: "PROSE about a classification-set and create-universe",
        resource: "universe",
        request_id: "r-2",
      }),
    );
    const error = (await rejection(() => getUniverse("u-404"))) as ClassificationApiError;
    expect(error).toBeInstanceOf(ClassificationApiError);
    expect(error.code).toBe("universe_not_found");
    expect(error.reason).toBe("universe_not_found");
    expect(error.resource).toBe("universe");
    expect(error.operation).toBe("get-universe");
    expect(error.requestId).toBe("r-2");
    expect(error.symbols).toStrictEqual([]);
  });

  it("keeps the envelope's resource when it is a ClassificationResource", async () => {
    stubFetch(
      envelope(404, {
        code: "universe_not_found",
        message: "PROSE naming universe-member",
        resource: "universe",
        request_id: "r-3",
      }),
    );
    const error = (await rejection(() =>
      addUniverseMembers("u-404", ["AAPL"]),
    )) as ClassificationApiError;
    expect(error.resource).toBe("universe");
    expect(error.operation).toBe("add-universe-members");
    expect(error.reason).toBe("universe_not_found");
  });

  it("keeps each of the four ClassificationResource values from the envelope", async () => {
    for (const resource of [
      "universe",
      "universe-member",
      "classification",
      "classification-set",
    ]) {
      stubFetch(envelope(404, { code: "c", message: "m", resource, request_id: "r" }));
      const error = (await rejection(() => getStockEvidence("AAPL"))) as ClassificationApiError;
      expect(error.resource).toBe(resource);
      expect(error.operation).toBe("get-stock-evidence");
    }
  });

  it("constructs with the ApiError shape, symbols empty and reason null by default", () => {
    const error = new ClassificationApiError("m", "r", {
      operation: "get-universe",
      resource: "universe",
    });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("m");
    expect(error.requestId).toBe("r");
    expect(error.code).toBeNull();
    expect(error.state).toBeNull();
    expect(error.reason).toBeNull();
    expect(error.symbols).toStrictEqual([]);
    const coded = new ClassificationApiError("m", "r", {
      code: "universe_retired",
      state: "s",
      operation: "rename-universe",
      resource: "universe",
      symbols: ["A"],
    });
    expect(coded.reason).toBe("universe_retired");
    expect(coded.state).toBe("s");
    expect(coded.symbols).toStrictEqual(["A"]);
  });

  it("replaces a path-segment resource with the operation's own on listClassifications", async () => {
    stubFetch(
      envelope(422, {
        code: "validation_error",
        message: "PROSE naming universe",
        resource: "classifications",
        request_id: "r-4",
      }),
    );
    const error = (await rejection(() =>
      listClassifications({ symbols: ["AAPL"] }),
    )) as ClassificationApiError;
    expect(error.resource).toBe("classification");
    expect(error.operation).toBe("list-classifications");
    expect(error.reason).toBe("validation_error");
    expect(error.requestId).toBe("r-4");
  });

  it("replaces a path-segment resource with the operation's own on createUniverse", async () => {
    stubFetch(
      envelope(422, {
        code: "validation_error",
        message: "PROSE naming classification",
        resource: "universes",
        request_id: "r-5",
      }),
    );
    const error = (await rejection(() =>
      createUniverse({ name: "", symbols: ["AAPL"] }),
    )) as ClassificationApiError;
    expect(error.resource).toBe("universe");
    expect(error.operation).toBe("create-universe");
  });

  it("names each function's own operation and resource", async () => {
    const cases: [() => Promise<unknown>, string, string][] = [
      [() => listUniverses(), "list-universes", "universe"],
      [() => createUniverse({ name: "n", symbols: ["A"] }), "create-universe", "universe"],
      [() => getUniverse("u"), "get-universe", "universe"],
      [() => renameUniverse("u", "n"), "rename-universe", "universe"],
      [() => retireUniverse("u"), "retire-universe", "universe"],
      [() => listUniverseEvents("u"), "list-universe-events", "universe"],
      [() => addUniverseMembers("u", ["A"]), "add-universe-members", "universe-member"],
      [() => removeUniverseMember("u", "A"), "remove-universe-member", "universe-member"],
      [() => listClassifications(), "list-classifications", "classification"],
      [() => getClassificationSummary(), "get-classification-summary", "classification"],
      [() => listClassificationSets(), "list-classification-sets", "classification-set"],
      [() => getClassificationSet("s"), "get-classification-set", "classification-set"],
      [() => getStockEvidence("A"), "get-stock-evidence", "classification"],
      [() => getStockHistory("A"), "get-stock-history", "classification"],
    ];
    for (const [call, operation, resource] of cases) {
      stubFetch(
        envelope(500, { code: "internal_error", resource: "path-segment", request_id: "r-x" }),
      );
      const error = (await rejection(call)) as ClassificationApiError;
      expect(error).toBeInstanceOf(ClassificationApiError);
      expect(error.operation).toBe(operation);
      expect(error.resource).toBe(resource);
    }
  });
});

// AC-22, DAC-E4-S1-2: the error path's edge cases.
describe("error-path edge cases", () => {
  it("degrades a non-JSON error body to null code and reason and the operation's resource", async () => {
    stubFetch(new Response("<html>bad gateway</html>", { status: 502 }));
    const error = (await rejection(() =>
      removeUniverseMember("u-1", "AAPL"),
    )) as ClassificationApiError;
    expect(error).toBeInstanceOf(ClassificationApiError);
    expect(error.code).toBeNull();
    expect(error.reason).toBeNull();
    expect(error.symbols).toStrictEqual([]);
    expect(error.requestId).toBe("unknown");
    expect(error.operation).toBe("remove-universe-member");
    expect(error.resource).toBe("universe-member");
  });

  it("degrades a JSON error body with no error object the same way", async () => {
    stubFetch(jsonResponse(500, { detail: "not an envelope", resource: "universe" }));
    const error = (await rejection(() => getClassificationSet("s-1"))) as ClassificationApiError;
    expect(error).toBeInstanceOf(ClassificationApiError);
    expect(error.code).toBeNull();
    expect(error.reason).toBeNull();
    expect(error.symbols).toStrictEqual([]);
    expect(error.requestId).toBe("unknown");
    expect(error.operation).toBe("get-classification-set");
    expect(error.resource).toBe("classification-set");
  });

  it("degrades a JSON null body, a null error and a string error the same way", async () => {
    for (const body of [null, { error: null }, { error: "universe" }]) {
      stubFetch(jsonResponse(500, body));
      const error = (await rejection(() => getStockHistory("AAPL"))) as ClassificationApiError;
      expect(error).toBeInstanceOf(ClassificationApiError);
      expect(error.code).toBeNull();
      expect(error.resource).toBe("classification");
      expect(error.symbols).toStrictEqual([]);
    }
  });

  it("keeps symbols empty when the envelope's symbols is not a list of strings", async () => {
    stubFetch(
      envelope(409, {
        code: "instrument_not_acquired",
        message: "m",
        resource: 7,
        request_id: "r-6",
        symbols: "MSFT,TSLA",
      }),
    );
    const error = (await rejection(() =>
      addUniverseMembers("u-1", ["MSFT"]),
    )) as ClassificationApiError;
    expect(error.symbols).toStrictEqual([]);
    expect(error.resource).toBe("universe-member");
    stubFetch(
      envelope(409, {
        code: "instrument_not_acquired",
        message: "m",
        resource: "universe-member",
        request_id: "r-7",
        symbols: ["MSFT", 3],
      }),
    );
    const mixed = (await rejection(() =>
      addUniverseMembers("u-1", ["MSFT"]),
    )) as ClassificationApiError;
    expect(mixed.symbols).toStrictEqual([]);
  });

  it("rejects a failed fetch with ApiUnreachableError, not a ClassificationApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    const error = await rejection(() => listClassifications());
    expect(error).toBeInstanceOf(ApiUnreachableError);
    expect(error).not.toBeInstanceOf(ApiError);
  });

  it("rejects a 200 body that is not JSON with ApiUnreachableError", async () => {
    stubFetch(new Response("not json", { status: 200 }));
    const error = await rejection(() => getClassificationSummary());
    expect(error).toBeInstanceOf(ApiUnreachableError);
    expect(error).not.toBeInstanceOf(ClassificationApiError);
  });

  it("leaves globalThis.fetch as the stubbed function after a failed and a successful call", async () => {
    const failing = stubFetch(envelope(404, { code: "universe_not_found", request_id: "r" }));
    const pending = rejection(() => getUniverse("u-1"));
    // Restored as soon as the call has started, not when it settles.
    expect(globalThis.fetch).toBe(failing);
    await pending;
    expect(globalThis.fetch).toBe(failing);
    expect(failing).toHaveBeenCalledTimes(1);
    const succeeding = stubFetch(jsonResponse(200, WIRE_SUMMARY_BODY));
    const resolving = getClassificationSummary();
    expect(globalThis.fetch).toBe(succeeding);
    await resolving;
    expect(globalThis.fetch).toBe(succeeding);
    expect(succeeding).toHaveBeenCalledTimes(1);
  });

  it("keeps two concurrent failures' envelopes apart", async () => {
    let releaseFirst: () => void = () => {};
    const firstHeld = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const concurrentFetch = vi.fn(async (input: string) => {
      if (input.includes("u-a")) {
        await firstHeld;
        return envelope(409, {
          code: "instrument_not_acquired",
          message: "m",
          resource: "universe-member",
          request_id: "r-a",
          symbols: ["AAA"],
        });
      }
      releaseFirst();
      return envelope(404, {
        code: "universe_not_found",
        message: "m",
        resource: "universe",
        request_id: "r-b",
      });
    });
    vi.stubGlobal("fetch", concurrentFetch);
    const calls = [addUniverseMembers("u-a", ["AAA"]), addUniverseMembers("u-b", ["BBB"])];
    expect(globalThis.fetch).toBe(concurrentFetch);
    const [first, second] = await Promise.allSettled(calls);
    expect(globalThis.fetch).toBe(concurrentFetch);
    expect(first.status).toBe("rejected");
    expect(second.status).toBe("rejected");
    const a = (first as PromiseRejectedResult).reason as ClassificationApiError;
    const b = (second as PromiseRejectedResult).reason as ClassificationApiError;
    expect(a.code).toBe("instrument_not_acquired");
    expect(a.resource).toBe("universe-member");
    expect(a.symbols).toStrictEqual(["AAA"]);
    expect(a.requestId).toBe("r-a");
    expect(b.code).toBe("universe_not_found");
    expect(b.resource).toBe("universe");
    expect(b.symbols).toStrictEqual([]);
    expect(b.requestId).toBe("r-b");
  });
});
