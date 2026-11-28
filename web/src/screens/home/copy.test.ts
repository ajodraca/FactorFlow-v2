import { describe, expect, it } from "vitest";
import {
  CHECKED,
  DATA_TILE,
  EMPTY_STATE,
  HEADER,
  ITEMS,
  NEEDS_YOU,
  NOT_DETERMINABLE,
  READ_FAILURE,
  TRY_AGAIN,
} from "./copy";

// Pins the Home catalogue's wording against independent literals (DAC-E5-S1-3;
// component design home-ui 2.3 to 2.5 and section 10; UX design 1.3). Every
// assertion compares with a string typed here, never one read from copy.ts.

/** The string members of a group, so a literal object can be compared with `toEqual`. */
function statics(group: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(group).filter(([, value]) => typeof value === "string"));
}

describe("static strings", () => {
  it("top level", () => {
    expect({ NOT_DETERMINABLE, CHECKED, TRY_AGAIN }).toEqual({
      NOT_DETERMINABLE: "not determinable",
      CHECKED: "checked",
      TRY_AGAIN: "Try again",
    });
  });

  it("HEADER", () => {
    expect(statics(HEADER)).toEqual({
      marketClosed: "Market closed",
      marketNotDeterminable: "Market state not determinable",
      noTradingCalendar:
        "FactorFlow has no trading calendar, so it can't tell a session from a holiday.",
      pricesCurrentTo: "prices current to",
      pricesNotDownloaded: "prices not downloaded yet",
    });
  });

  it("DATA_TILE", () => {
    expect(statics(DATA_TILE)).toEqual({
      title: "Data",
      scores: "Scores",
      prices: "Prices",
      scope: "Every other number on this page is as of those times.",
      pricesNotDownloaded: "not downloaded yet",
    });
  });

  it("READ_FAILURE", () => {
    expect(READ_FAILURE).toEqual({
      unreachable: "FactorFlow is not answering",
      unexpected: "FactorFlow hit an unexpected problem",
    });
  });

  it("NEEDS_YOU", () => {
    expect(statics(NEEDS_YOU)).toEqual({
      title: "Needs you",
      subLine: "Most important first. Nothing here is urgent unless marked.",
      nothingNeedsYou: "Nothing needs you right now.",
    });
  });

  it("EMPTY_STATE", () => {
    expect(EMPTY_STATE).toEqual({
      title: "No data has been downloaded yet.",
      body: "Set up FactorFlow to name the stocks to follow and start the first download.",
      action: "Start setup",
    });
  });

  it("ITEMS, kind by kind", () => {
    expect(Object.keys(ITEMS)).toEqual([
      "data_problems",
      "download_not_complete",
      "credential_missing",
      "first_download",
      "first_scores",
      "score_failed",
    ]);
    expect(statics(ITEMS.data_problems)).toEqual({ tag: "Data", action: "Fix data" });
    expect(statics(ITEMS.download_not_complete)).toEqual({
      tag: "Download",
      failedTitle: "The last download failed",
      interruptedTitle: "The last download was interrupted",
      action: "See download",
      failedActionName: "See the download that failed",
    });
    expect(statics(ITEMS.credential_missing)).toEqual({
      tag: "Setup",
      title: "The market data key is missing",
      body: "Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then.",
      action: "Open Settings",
      actionName: "Open Settings to set the market data key",
    });
    expect(statics(ITEMS.first_download)).toEqual({
      tag: "Download",
      title: "Your first download is running",
      action: "See download",
    });
    expect(statics(ITEMS.first_scores)).toEqual({
      tag: "Scores",
      title: "Your first scores are being produced",
      body: "Scores appear when this finishes.",
      action: "See download",
    });
    expect(statics(ITEMS.score_failed)).toEqual({
      tag: "Scores",
      title: "The latest score update failed",
      action: "See details",
    });
  });
});

describe("templates", () => {
  it("HEADER.heading joins weekday and date", () => {
    expect(HEADER.heading("Thursday", "2026-10-15")).toBe("Thursday, 2026-10-15");
  });

  it.each([
    [["KO"], 1, "KO is missing data"],
    [["KO", "TSLA"], 2, "KO and TSLA are missing data"],
    [["FBXX", "KO", "TSLA"], 3, "FBXX, KO and TSLA are missing data"],
    [["FBXX", "KO", "TSLA"], 4, "FBXX, KO, TSLA and 1 more stock are missing data"],
    [["FBXX", "KO", "TSLA"], 1239, "FBXX, KO, TSLA and 1,236 more stocks are missing data"],
  ] as const)("data_problems.title(%j, %i) is %j", (symbols, count, expected) => {
    expect(ITEMS.data_problems.title(symbols, count)).toBe(expected);
  });

  it("data_problems body follows the count", () => {
    expect(ITEMS.data_problems.body(1)).toBe(
      "Its scores show as Incomplete until the data is complete.",
    );
    expect(ITEMS.data_problems.body(3)).toBe(
      "Their scores show as Incomplete until the data is complete.",
    );
  });

  it("data_problems.actionName lists the symbols", () => {
    expect(ITEMS.data_problems.actionName(["KO", "TSLA", "FBXX"])).toBe(
      "Fix data for KO, TSLA and FBXX",
    );
    expect(ITEMS.data_problems.actionName(["KO"])).toBe("Fix data for KO");
    expect(ITEMS.data_problems.actionName(["KO", "TSLA"])).toBe("Fix data for KO and TSLA");
  });

  it("download_not_complete bodies carry the end time", () => {
    expect(
      ITEMS.download_not_complete.failedBody(
        "The provider refused the request",
        "2026-10-15 17:46 CDT",
      ),
    ).toBe("The provider refused the request. Ended 2026-10-15 17:46 CDT.");
    expect(ITEMS.download_not_complete.interruptedBody("2026-10-15 17:46 CDT")).toBe(
      "FactorFlow restarted mid-download. Download again to pick up the rest. Ended 2026-10-15 17:46 CDT.",
    );
  });

  it.each([
    [1236, 1236, "1,236 of 1,236 stocks so far. Scores appear when it finishes."],
    [12, 1236, "12 of 1,236 stocks so far. Scores appear when it finishes."],
    [0, 1, "0 of 1 stock so far. Scores appear when it finishes."],
    [5, null, "Scores appear when it finishes."],
  ] as const)("first_download.body(%i, %j) is %j", (done, total, expected) => {
    expect(ITEMS.first_download.body(done, total)).toBe(expected);
  });

  it("score_failed.body names the set it still shows, when there is one", () => {
    expect(ITEMS.score_failed.body("The engine stopped", "2026-10-15 17:30 CDT")).toBe(
      "The engine stopped. Scores still show the set from the download started 2026-10-15 17:30 CDT.",
    );
    expect(ITEMS.score_failed.body("The engine stopped", null)).toBe("The engine stopped.");
  });

  it("DATA_TILE sentences", () => {
    expect(DATA_TILE.firstDownloadRunning("2026-10-15 16:02 CDT")).toBe(
      "Your first download, started 2026-10-15 16:02 CDT, is running.",
    );
    expect(DATA_TILE.ofFollowedStocksCurrent("1,236")).toBe("of 1,236 stocks current");
    expect(
      DATA_TILE.name("Mostly yes", "1,233", "1,236", "2026-10-15 17:46 CDT", "2026-10-15"),
    ).toBe(
      "Data: mostly yes. 1,233 of 1,236 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-15.",
    );
    expect(DATA_TILE.firstDownloadName("2026-10-15 16:02 CDT")).toBe(
      "Data: your first download, started 2026-10-15 16:02 CDT, is running.",
    );
    expect(DATA_TILE.readError("The server answered 500")).toBe(
      "Couldn't read the data summary: The server answered 500.",
    );
    expect(DATA_TILE.readError(READ_FAILURE.unreachable)).toBe(
      "Couldn't read the data summary: FactorFlow is not answering.",
    );
    expect(DATA_TILE.readError(READ_FAILURE.unexpected)).toBe(
      "Couldn't read the data summary: FactorFlow hit an unexpected problem.",
    );
  });

  it("NEEDS_YOU sentences", () => {
    expect(NEEDS_YOU.heading(3)).toBe("Needs you · 3");
    expect(NEEDS_YOU.heading(1236)).toBe("Needs you · 1,236");
    expect(NEEDS_YOU.readError("The server answered 500")).toBe(
      "Couldn't read what needs you: The server answered 500.",
    );
  });
});
