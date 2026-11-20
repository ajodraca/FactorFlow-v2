import { describe, expect, it } from "vitest";
import { ApiError } from "../../api/client";
import type { RunState } from "../../api/types";
import type { Attention, LatestDownload, ScoreState, ScoreSummary } from "../../app/shell-types";
import { type NeedsYouItem, deriveNeedsYou, sortAttention } from "./needs-you";

const CHECKED_AT = "2026-10-15T23:00:00+00:00";

function attentionWith(overrides: Partial<Attention> = {}): Attention {
  return {
    checked_at: CHECKED_AT,
    followed_count: 10,
    prices_as_of: "2026-10-15",
    credential_present: true,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_download: null,
    latest_terminal_download: null,
    items: [],
    ...overrides,
  };
}

function download(runId: string, state: RunState, requestedAt: string): LatestDownload {
  return {
    run_id: runId,
    state,
    requested_at: requestedAt,
    started_at: null,
    ended_at: null,
    progress: { done: 0, total: null },
  };
}

type Later = NonNullable<ScoreSummary["later"]>;

function later(overrides: Partial<Later> = {}): Later {
  return {
    set_id: "set-1",
    state: "building",
    started_at: "2026-10-15T22:10:00+00:00",
    ended_at: null,
    failure_reason: null,
    run_id: "run-first-1",
    run_started_at: "2026-10-15T22:00:00+00:00",
    ...overrides,
  };
}

function summary(overrides: Partial<ScoreSummary> = {}): ScoreSummary {
  return {
    never_classified: true,
    set: null,
    later: null,
    factors: {},
    ...overrides,
  } as ScoreSummary;
}

function served(data: ScoreSummary): ScoreState {
  return { kind: "served", data, checkedAt: new Date("2026-10-15T23:00:00Z") };
}

function kinds(items: NeedsYouItem[]): string[] {
  return items.map((item) => item.kind).sort();
}

describe("targets and runId (TC-COMP-028, DAC-E1-S8-1)", () => {
  // Implements TC-COMP-028
  it("data_problems targets /data with no runId", () => {
    const items = deriveNeedsYou(
      attentionWith({
        problems: { stock_count: 3, symbols: ["A", "B", "C"], newest_completed_at: null },
        items: [{ kind: "data_problems", recorded_at: "2026-10-15T22:31:00+00:00", run_id: null }],
      }),
      { kind: "not_served" },
    );
    expect(items).toEqual([
      {
        kind: "data_problems",
        tier: "warning",
        recordedAt: "2026-10-15T22:31:00+00:00",
        target: "/data",
      },
    ]);
    expect(items[0]).not.toHaveProperty("runId");
    expect(Object.keys(items[0] as object).sort()).toEqual([
      "kind",
      "recordedAt",
      "target",
      "tier",
    ]);
  });

  it("download_not_complete targets the download and carries its runId", () => {
    const items = deriveNeedsYou(
      attentionWith({
        items: [
          {
            kind: "download_not_complete",
            recorded_at: "2026-10-15T22:31:00+00:00",
            run_id: "run-failed-1",
          },
        ],
        latest_terminal_download: {
          run_id: "run-failed-1",
          state: "failed",
          ended_at: "2026-10-15T22:31:00+00:00",
          failure_reason: null,
        },
      }),
      { kind: "not_served" },
    );
    expect(items).toEqual([
      {
        kind: "download_not_complete",
        tier: "critical",
        recordedAt: "2026-10-15T22:31:00+00:00",
        target: "/data/downloads/run-failed-1",
        runId: "run-failed-1",
      },
    ]);
    expect(Object.keys(items[0] as object).sort()).toEqual([
      "kind",
      "recordedAt",
      "runId",
      "target",
      "tier",
    ]);
  });

  it("credential_missing targets /settings with no runId", () => {
    const items = deriveNeedsYou(
      attentionWith({
        credential_present: false,
        items: [{ kind: "credential_missing", recorded_at: CHECKED_AT, run_id: null }],
      }),
      { kind: "not_served" },
    );
    expect(items).toEqual([
      { kind: "credential_missing", tier: "critical", recordedAt: CHECKED_AT, target: "/settings" },
    ]);
    expect(items[0]).not.toHaveProperty("runId");
  });

  it("first_download targets its download", () => {
    const items = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-first-1", "running", "2026-10-15T21:58:00+00:00"),
      }),
      served(summary({ never_classified: true, later: null })),
    );
    expect(items).toEqual([
      {
        kind: "first_download",
        tier: "active",
        recordedAt: "2026-10-15T21:58:00+00:00",
        target: "/data/downloads/run-first-1",
        runId: "run-first-1",
      },
    ]);
    expect(Object.keys(items[0] as object).sort()).toEqual([
      "kind",
      "recordedAt",
      "runId",
      "target",
      "tier",
    ]);
  });

  it("first_scores targets the download its scores come from (DEC-0318)", () => {
    const items = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-first-1", "succeeded", "2026-10-15T21:58:00+00:00"),
      }),
      served(summary({ never_classified: true, later: later({ state: "building" }) })),
    );
    expect(items).toEqual([
      {
        kind: "first_scores",
        tier: "active",
        recordedAt: "2026-10-15T21:58:00+00:00",
        target: "/data/downloads/run-first-1",
        runId: "run-first-1",
      },
    ]);
  });

  it("score_failed targets /data with no runId", () => {
    const items = deriveNeedsYou(
      attentionWith(),
      served(
        summary({
          never_classified: false,
          later: later({
            state: "failed",
            ended_at: "2026-10-15T23:40:00+00:00",
            run_id: "run-2",
          }),
        }),
      ),
    );
    expect(items).toEqual([
      {
        kind: "score_failed",
        tier: "critical",
        recordedAt: "2026-10-15T23:40:00+00:00",
        target: "/data",
      },
    ]);
    expect(items[0]).not.toHaveProperty("runId");
    expect(Object.keys(items[0] as object).sort()).toEqual([
      "kind",
      "recordedAt",
      "target",
      "tier",
    ]);
  });
});

describe("summary states (TC-COMP-029, DAC-E1-S8-2, DAC-E1-6)", () => {
  const threeServerItems = {
    items: [
      { kind: "data_problems", recorded_at: "2026-10-15T22:00:00+00:00", run_id: null },
      {
        kind: "download_not_complete",
        recorded_at: "2026-10-15T22:10:00+00:00",
        run_id: "run-3",
      },
      { kind: "credential_missing", recorded_at: "2026-10-15T22:20:00+00:00", run_id: null },
    ],
  } as const;

  function attention3(terminal: Attention["latest_terminal_download"]): Attention {
    return attentionWith({
      items: [...threeServerItems.items],
      latest_download: download("run-3", "running", "2026-10-15T21:00:00+00:00"),
      latest_terminal_download: terminal,
    });
  }

  const abandoned = {
    run_id: "run-3",
    state: "abandoned",
    ended_at: "2026-10-15T22:10:00+00:00",
    failure_reason: null,
  } as const;

  // Implements TC-COMP-029
  it("an error summary yields only the three server items, never reading last", () => {
    const scores: ScoreState = {
      kind: "error",
      error: new ApiError("boom", "req-1"),
      last: summary({ never_classified: true, later: later({ state: "building" }) }),
    };
    expect(kinds(deriveNeedsYou(attention3(abandoned), scores))).toEqual([
      "credential_missing",
      "data_problems",
      "download_not_complete",
    ]);
  });

  it("a building first set yields first_scores and not first_download", () => {
    const result = kinds(
      deriveNeedsYou(
        attention3(abandoned),
        served(summary({ never_classified: true, later: later({ state: "building" }) })),
      ),
    );
    expect(result).toContain("first_scores");
    expect(result).not.toContain("first_download");
  });

  it("a 404 summary with no terminal download yields first_download only from the download", () => {
    const items = deriveNeedsYou(
      attentionWith({
        items: [threeServerItems.items[0], threeServerItems.items[2]],
        latest_download: download("run-3", "running", "2026-10-15T21:00:00+00:00"),
        latest_terminal_download: null,
      }),
      { kind: "not_served" },
    );
    expect(kinds(items)).toEqual(["credential_missing", "data_problems", "first_download"]);
    expect(items.find((item) => item.kind === "first_download")?.runId).toBe("run-3");
  });

  it("a 404 summary after a terminal download yields no first_download", () => {
    const items = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-3", "running", "2026-10-15T21:00:00+00:00"),
        latest_terminal_download: {
          run_id: "run-2",
          state: "succeeded",
          ended_at: "2026-10-15T20:00:00+00:00",
          failure_reason: null,
        },
      }),
      { kind: "not_served" },
    );
    expect(items).toEqual([]);
  });
});

describe("cause boundaries", () => {
  const nonTerminal: Record<RunState, boolean> = {
    requested: true,
    running: true,
    cancelling: true,
    succeeded: false,
    partial: false,
    failed: false,
    cancelled: false,
    abandoned: false,
  };

  it("an all-clear attention yields nothing under every score state", () => {
    const clear = attentionWith();
    const states: ScoreState[] = [
      { kind: "loading" },
      served(summary({ never_classified: false, later: null })),
      { kind: "not_served" },
      { kind: "error", error: new ApiError("x", "r"), last: null },
    ];
    for (const scores of states) {
      expect(deriveNeedsYou(clear, scores)).toEqual([]);
    }
  });

  it.each(Object.entries(nonTerminal))(
    "first_download for latest download %s is %s",
    (state, on) => {
      const items = deriveNeedsYou(
        attentionWith({
          latest_download: download("run-x", state as RunState, "2026-10-15T21:00:00+00:00"),
        }),
        served(summary({ never_classified: true, later: null })),
      );
      expect(kinds(items)).toEqual(on ? ["first_download"] : []);
    },
  );

  it("no first_download without a latest download", () => {
    expect(
      deriveNeedsYou(attentionWith(), served(summary({ never_classified: true, later: null }))),
    ).toEqual([]);
  });

  it("no first_download once scores have been classified", () => {
    expect(
      kinds(
        deriveNeedsYou(
          attentionWith({
            latest_download: download("run-x", "running", "2026-10-15T21:00:00+00:00"),
          }),
          served(summary({ never_classified: false, later: null })),
        ),
      ),
    ).toEqual([]);
  });

  it("a failed first set yields both first_download and score_failed", () => {
    expect(
      kinds(
        deriveNeedsYou(
          attentionWith({
            latest_download: download("run-x", "running", "2026-10-15T21:00:00+00:00"),
          }),
          served(
            summary({
              never_classified: true,
              later: later({ state: "failed", ended_at: "2026-10-15T22:30:00+00:00" }),
            }),
          ),
        ),
      ),
    ).toEqual(["first_download", "score_failed"]);
  });

  it("a building later set is not first scores once scores exist", () => {
    expect(
      kinds(
        deriveNeedsYou(
          attentionWith({
            latest_download: download("run-x", "running", "2026-10-15T21:00:00+00:00"),
          }),
          served(summary({ never_classified: false, later: later({ state: "building" }) })),
        ),
      ),
    ).toEqual([]);
  });

  it("loading yields only the server items", () => {
    const items = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-x", "running", "2026-10-15T21:00:00+00:00"),
        items: [
          { kind: "data_problems", recorded_at: "2026-10-15T22:00:00+00:00", run_id: null },
          { kind: "credential_missing", recorded_at: "2026-10-15T22:20:00+00:00", run_id: null },
        ],
      }),
      { kind: "loading" },
    );
    expect(kinds(items)).toEqual(["credential_missing", "data_problems"]);
  });

  it.each([
    ["abandoned", "serious"],
    ["failed", "critical"],
  ] as const)("download_not_complete after a %s download is %s", (state, tier) => {
    const items = deriveNeedsYou(
      attentionWith({
        items: [{ kind: "download_not_complete", recorded_at: CHECKED_AT, run_id: "run-9" }],
        latest_terminal_download: {
          run_id: "run-9",
          state,
          ended_at: CHECKED_AT,
          failure_reason: null,
        },
      }),
      { kind: "not_served" },
    );
    expect(items[0]?.tier).toBe(tier);
  });

  it("copies recorded_at unchanged", () => {
    const items = deriveNeedsYou(
      attentionWith({
        items: [{ kind: "data_problems", recorded_at: "2026-10-15T17:31:00-05:00", run_id: null }],
      }),
      { kind: "not_served" },
    );
    expect(items[0]?.recordedAt).toBe("2026-10-15T17:31:00-05:00");
  });

  it("does not mutate its inputs", () => {
    const attention = attentionWith({
      latest_download: download("run-x", "running", "2026-10-15T21:00:00+00:00"),
      items: [{ kind: "data_problems", recorded_at: CHECKED_AT, run_id: null }],
    });
    const scores = served(summary({ never_classified: true, later: later() }));
    const before = structuredClone({ attention, scores });
    deriveNeedsYou(attention, scores);
    expect({ attention, scores }).toEqual(before);
  });
});

describe("provisional recency and target rules (DEC-0318, DEC-0320)", () => {
  it("first_scores uses the attention download's requested_at when it is the scored run", () => {
    const [item] = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-first-1", "succeeded", "2026-10-15T21:58:00+00:00"),
      }),
      served(summary({ never_classified: true, later: later({ run_id: "run-first-1" }) })),
    );
    expect(item).toEqual({
      kind: "first_scores",
      tier: "active",
      recordedAt: "2026-10-15T21:58:00+00:00",
      target: "/data/downloads/run-first-1",
      runId: "run-first-1",
    });
  });

  it("first_scores falls back to run_started_at when a newer download is current", () => {
    const [item] = deriveNeedsYou(
      attentionWith({
        latest_download: download("run-2", "succeeded", "2026-10-16T08:00:00+00:00"),
      }),
      served(
        summary({
          never_classified: true,
          later: later({ run_id: "run-first-1", run_started_at: "2026-10-15T22:00:00+00:00" }),
        }),
      ),
    );
    expect(item).toEqual({
      kind: "first_scores",
      tier: "active",
      recordedAt: "2026-10-15T22:00:00+00:00",
      target: "/data/downloads/run-first-1",
      runId: "run-first-1",
    });
  });

  it("download_not_complete without its own run_id takes the terminal download's", () => {
    const [item] = deriveNeedsYou(
      attentionWith({
        items: [{ kind: "download_not_complete", recorded_at: CHECKED_AT, run_id: null }],
        latest_terminal_download: {
          run_id: "run-failed-1",
          state: "failed",
          ended_at: CHECKED_AT,
          failure_reason: null,
        },
      }),
      { kind: "not_served" },
    );
    expect(item).toMatchObject({
      runId: "run-failed-1",
      target: "/data/downloads/run-failed-1",
    });
  });

  it("download_not_complete with no run anywhere is kept, serious, and targets /data", () => {
    const [item] = deriveNeedsYou(
      attentionWith({
        items: [{ kind: "download_not_complete", recorded_at: CHECKED_AT, run_id: null }],
        latest_terminal_download: null,
      }),
      { kind: "not_served" },
    );
    expect(item).toEqual({
      kind: "download_not_complete",
      tier: "serious",
      recordedAt: CHECKED_AT,
      target: "/data",
    });
    expect(item).not.toHaveProperty("runId");
  });

  it("score_failed without an ended_at uses started_at", () => {
    const [item] = deriveNeedsYou(
      attentionWith(),
      served(
        summary({
          never_classified: false,
          later: later({
            state: "failed",
            ended_at: null,
            started_at: "2026-10-15T22:10:00+00:00",
          }),
        }),
      ),
    );
    expect(item?.recordedAt).toBe("2026-10-15T22:10:00+00:00");
  });
});

function item(
  kind: NeedsYouItem["kind"],
  tier: NeedsYouItem["tier"],
  recordedAt: string,
  target: string,
): NeedsYouItem {
  return { kind, tier, recordedAt, target };
}

describe("sortAttention (TC-COMP-002, DAC-E1-7)", () => {
  // Implements TC-COMP-002
  const neutral = item("first_download", "neutral", "2026-10-15T20:00:00+00:00", "/n");
  const active = item("first_download", "active", "2026-10-15T21:00:00+00:00", "/a");
  const good = item("first_scores", "good", "2026-10-15T21:00:00+00:00", "/g");
  const warningA = item("data_problems", "warning", "2026-10-15T22:00:00+00:00", "/wa");
  const warningB = item("data_problems", "warning", "2026-10-15T22:00:00+00:00", "/wb");
  const serious = item("download_not_complete", "serious", "2026-10-15T22:30:00+00:00", "/s");
  const criticalOld = item("credential_missing", "critical", "2026-10-15T20:30:00+00:00", "/co");
  const criticalNew = item("score_failed", "critical", "2026-10-15T23:30:00+00:00", "/cn");

  it("orders by tier then newest first, stable for equal keys", () => {
    const input = [neutral, warningA, criticalOld, active, good, warningB, serious, criticalNew];
    const before = structuredClone(input);
    const expected = [criticalNew, criticalOld, serious, warningA, warningB, active, good, neutral];
    expect(sortAttention(input)).toEqual(expected);
    expect(sortAttention(input)).toEqual(expected);
    expect(input).toEqual(before);
  });

  it("returns an empty list for an empty list", () => {
    expect(sortAttention([])).toEqual([]);
  });

  it("the sorted derivation has the same length as the derivation (AC-16)", () => {
    const attention = attentionWith({
      items: [
        { kind: "data_problems", recorded_at: "2026-10-15T22:00:00+00:00", run_id: null },
        {
          kind: "download_not_complete",
          recorded_at: "2026-10-15T22:10:00+00:00",
          run_id: "run-1",
        },
        { kind: "credential_missing", recorded_at: "2026-10-15T22:20:00+00:00", run_id: null },
      ],
      latest_download: download("run-1", "running", "2026-10-15T21:00:00+00:00"),
      latest_terminal_download: null,
    });
    const scores = served(
      summary({
        never_classified: true,
        later: later({ state: "failed", ended_at: "2026-10-15T23:00:00+00:00" }),
      }),
    );
    expect(deriveNeedsYou(attention, scores)).toHaveLength(5);
    expect(sortAttention(deriveNeedsYou(attention, scores))).toHaveLength(5);
  });

  it("compares instants, not strings", () => {
    const earlier = item("data_problems", "warning", "2026-10-15T22:00:00-05:00", "/early");
    const later2 = item("data_problems", "warning", "2026-10-16T01:00:00+00:00", "/late");
    expect(sortAttention([later2, earlier]).map((i) => i.target)).toEqual(["/early", "/late"]);
  });

  it("orders the five-kind derivation by severity", () => {
    const attention = attentionWith({
      items: [
        { kind: "data_problems", recorded_at: "2026-10-15T22:00:00+00:00", run_id: null },
        {
          kind: "download_not_complete",
          recorded_at: "2026-10-15T22:10:00+00:00",
          run_id: "run-1",
        },
        { kind: "credential_missing", recorded_at: "2026-10-15T22:20:00+00:00", run_id: null },
      ],
      latest_download: download("run-1", "running", "2026-10-15T21:00:00+00:00"),
      latest_terminal_download: {
        run_id: "run-1",
        state: "failed",
        ended_at: "2026-10-15T22:10:00+00:00",
        failure_reason: null,
      },
    });
    const scores = served(
      summary({
        never_classified: true,
        later: later({ state: "failed", ended_at: "2026-10-15T23:00:00+00:00" }),
      }),
    );
    expect(sortAttention(deriveNeedsYou(attention, scores)).map((i) => i.kind)).toEqual([
      "score_failed",
      "credential_missing",
      "download_not_complete",
      "data_problems",
      "first_download",
    ]);
  });

  it("active and good share a rank, so recency decides between them", () => {
    const activeNew = item("first_download", "active", "2026-10-15T23:00:00+00:00", "/an");
    const goodOld = item("first_scores", "good", "2026-10-15T20:00:00+00:00", "/go");
    const goodNew = item("first_scores", "good", "2026-10-15T23:30:00+00:00", "/gn");
    const activeOld = item("first_download", "active", "2026-10-15T19:00:00+00:00", "/ao");
    expect(sortAttention([goodOld, activeNew]).map((i) => i.target)).toEqual(["/an", "/go"]);
    expect(sortAttention([activeOld, goodNew]).map((i) => i.target)).toEqual(["/gn", "/ao"]);
  });

  it("returns a new array holding the same item objects", () => {
    const input = [warningA, criticalNew];
    const output = sortAttention(input);
    expect(output).not.toBe(input);
    expect(output[0]).toBe(criticalNew);
    expect(output[1]).toBe(warningA);
  });
});
