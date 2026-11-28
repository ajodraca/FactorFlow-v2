import { type JSX, useId } from "react";
import { Link } from "react-router-dom";
import type { ScreenState } from "../../api/types";
import { LAYOUT } from "../../app/layout";
import { useShell } from "../../app/shell-context";
import type { Attention, ReadState } from "../../app/shell-types";
import { useDataHealth } from "../../app/use-data-health";
import { formatCount } from "../../components/patterns/format";
import { StateRegion } from "../../components/patterns/state-region";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCard, ReadFailure, SkeletonLine } from "./check-card";
import {
  CHECK_TITLES,
  FOLLOW_FIRST,
  NO_DATA_YET,
  OPEN_SETUP,
  READ_TARGETS,
  START_FIRST_DOWNLOAD,
  downloadForFollowed,
  readFailed,
  readFailureReason,
} from "./copy";
import { DailyPricesCard } from "./daily-prices-card";
import { DownloadNow } from "./download-now";
import { FinancialsCard } from "./financials-card";
import { NeedsFixing } from "./needs-fixing";
import { RecentDownloads } from "./recent-downloads";
import { ScoresCard } from "./scores-card";
import { Verdict } from "./verdict";
import { WhatYouFollow } from "./what-you-follow";

/**
 * The Data health screen (data-health-ui 2.1, 2.2, 3, 5 and 10; DAC-E6-6,
 * DAC-E6-7, DAC-E6-15, DAC-E6-S5-1 to -6; AC-21, AC-24, AC-26, AC-28; DEC-0386).
 * It composes the regions CAP-003-E6-S1 to S4 built, capped at
 * `LAYOUT.contentMaxWidth`, and calls `useDataHealth` here and nowhere else
 * (CAP-003-E3-S3's importer rule), so the aggregate is read on load, on
 * **Try again**, once when the latest download turns terminal (the hook's own
 * trigger) and after a successful **Stop following**, never on a timer.
 * `/data` needs no `setTitleDetail` (DEC-0214).
 *
 * One slot under the header renders through `StateRegion`, over attention's
 * read: skeleton cards while it loads, the never-downloaded empty card while no
 * download has ended, the check grid otherwise. The empty card follows
 * attention's latest terminal download, never `never_acquired` (DAC-E6-7).
 *
 * The eight states per region. "NA" gives the reason the state does not apply.
 *
 * - Header and verdict: loading is a skeleton line; never populated gives the
 *   answer way to the empty card while the header stays; nothing found is
 *   *Yes. None of the {m}...*; partial is *Mostly yes*; stale NA (the
 *   aggregate is read on demand and shows *checked {time}*, AC-25); unavailable
 *   is attention's failure sentence; error is the aggregate's failure sentence;
 *   unreachable NA (the shell, AC-23).
 * - Daily prices and Company financials: loading is a skeleton card; never
 *   populated gives way to the empty card, and after a download ended with
 *   nothing stored they render DAC-E6-7's null state; nothing found is the `ok`
 *   check; partial is `exceptions`; stale is NOT RENDERED under DEC-0201, since
 *   `latest_session` is the newest session any followed stock holds and
 *   FactorFlow has no trading calendar (system design open question 9; it
 *   returns with one); unavailable is the gap part's `coverage-unknown` for
 *   Daily prices and NA for Company financials (no not-determinable status);
 *   error is a per-card sentence with **Try again**; unreachable NA (the shell).
 * - Factor scores: loading is a skeleton; never populated gives way to the
 *   empty card; nothing found is *No scores yet*; partial counts Incomplete
 *   stocks; stale is *Not reflecting the latest download*; unavailable is
 *   `coverage-unknown` while not served; error keeps the last value, else a
 *   sentence (DEC-0376); unreachable NA (the shell).
 * - Empty card: loading NA (skeleton cards show until attention answers);
 *   never populated is the card itself; the other six NA (no filter, no partial
 *   answer, attention is polled by the shell, a failed attention read renders
 *   the full layout, the shell owns unreachable).
 * - Needs fixing (S3): loading is its title and skeleton lines; never populated
 *   renders only while the count is above zero; nothing found is *Nothing needs
 *   fixing.* with the last complete download; partial is rows with **Show more**;
 *   stale NA (rows come from the on-demand aggregate, with *checked {time}*);
 *   unavailable NA (every row's reason is recorded); error is the aggregate's
 *   failure sentence, and a failed **Show more** keeps the rows; unreachable NA
 *   (the shell).
 * - Recent downloads (S4): loading is skeleton rows; never populated renders only
 *   once a download exists; nothing found NA (no filter); partial is the Partial
 *   and Interrupted rows (AC-12); stale NA (re-read on each attention answer
 *   while running); unavailable is indeterminate progress while the total is
 *   unknown; error is *Couldn't read recent downloads*; unreachable NA (the shell).
 * - What you follow (S4): loading is a skeleton; never populated gives way to the
 *   empty card; nothing found NA (counts are numbers, zero included); partial NA
 *   (no partial answer); stale NA (read on load only); unavailable is the key's
 *   `coverage-unknown` while health is not answering; error is *Couldn't read
 *   what you follow*; unreachable NA (the shell).
 * The lower regions mount while attention loads and read once (DEC-0405).
 */

/** Attention's read as the slot's `ScreenState` (DEC-0386). */
function slotState(attention: ReadState<Attention>): ScreenState<Attention> {
  if (attention.kind === "loading") {
    return { kind: "loading" };
  }
  if (attention.kind === "error") {
    return { kind: "unavailable", reason: readFailureReason(attention.error) };
  }
  if (attention.data.latest_terminal_download === null) {
    return { kind: "empty-never-populated" };
  }
  return {
    kind: "populated",
    data: attention.data,
    fetchedAt: attention.checkedAt.toISOString(),
  };
}

function EmptyCard({ followedCount }: { followedCount: number }): JSX.Element {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <Card variant="default">
        <CardHeader>
          <CardTitle id={id}>{NO_DATA_YET}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          {followedCount > 0 ? (
            <>
              <p className="text-base">{downloadForFollowed(formatCount(followedCount))}</p>
              <DownloadNow label={START_FIRST_DOWNLOAD} />
            </>
          ) : (
            <>
              <p className="text-base">{FOLLOW_FIRST}</p>
              <Button variant="default" asChild>
                <Link to="/setup">{OPEN_SETUP}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function CheckGrid({
  skeleton,
  dataHealth,
  scores,
  onRetry,
  onRetryScores,
}: {
  skeleton: boolean;
  dataHealth: ReturnType<typeof useDataHealth>["state"];
  scores: ReturnType<typeof useShell>["scores"];
  onRetry: () => void;
  onRetryScores: () => void;
}): JSX.Element {
  const waiting = skeleton || dataHealth.kind === "loading";
  const titles = [CHECK_TITLES.daily_prices, CHECK_TITLES.company_financials] as const;
  let first: JSX.Element;
  let second: JSX.Element;
  if (waiting) {
    first = (
      <CheckCard title={titles[0]}>
        <SkeletonLine />
      </CheckCard>
    );
    second = (
      <CheckCard title={titles[1]}>
        <SkeletonLine />
      </CheckCard>
    );
  } else if (dataHealth.kind === "error") {
    const sentence = readFailed(READ_TARGETS.checks, readFailureReason(dataHealth.error));
    first = (
      <CheckCard title={titles[0]}>
        <ReadFailure sentence={sentence} onRetry={onRetry} />
      </CheckCard>
    );
    second = (
      <CheckCard title={titles[1]}>
        <ReadFailure sentence={sentence} onRetry={onRetry} />
      </CheckCard>
    );
  } else {
    const dh = dataHealth.data;
    first = <DailyPricesCard check={dh.checks.daily_prices} followedCount={dh.followed_count} />;
    second = (
      <FinancialsCard check={dh.checks.company_financials} followedCount={dh.followed_count} />
    );
  }
  return (
    <div className="grid grid-cols-4 gap-5">
      {first}
      {second}
      {skeleton ? (
        <CheckCard title={CHECK_TITLES.scores}>
          <SkeletonLine />
        </CheckCard>
      ) : (
        <ScoresCard scores={scores} onRetryScores={onRetryScores} />
      )}
    </div>
  );
}

export default function DataHealthScreen(): JSX.Element {
  const { attention, scores, refresh } = useShell();
  const { state: dataHealth, retry } = useDataHealth();

  const empty = attention.kind === "ok" && attention.data.latest_terminal_download === null;
  const anyDownload = attention.kind !== "ok" || attention.data.latest_download !== null;
  const showNeedsFixing =
    !empty || (dataHealth.kind === "ok" && dataHealth.data.affected_count > 0);
  const showRecent = !empty || anyDownload;
  const showFollow = !empty;

  const grid = (skeleton: boolean) => (
    <CheckGrid
      skeleton={skeleton}
      dataHealth={dataHealth}
      scores={scores}
      onRetry={retry}
      onRetryScores={() => refresh("scores")}
    />
  );

  return (
    <div
      className="mx-auto flex w-full flex-col gap-5"
      style={{ maxWidth: LAYOUT.contentMaxWidth }}
    >
      <Verdict
        attention={attention}
        dataHealth={dataHealth}
        onRetryAttention={() => refresh("attention")}
        onRetryDataHealth={retry}
        downloadNow={<DownloadNow />}
      />
      <StateRegion
        state={slotState(attention)}
        onRetry={() => refresh("attention")}
        renderers={{
          loading: () => grid(true),
          "empty-never-populated": () =>
            attention.kind === "ok" ? (
              <EmptyCard followedCount={attention.data.followed_count} />
            ) : null,
          populated: () => grid(false),
          unavailable: () => grid(false),
          "empty-no-match": {
            notApplicable:
              "Data health has no filter; nothing found is the Needs fixing card's Nothing needs fixing state (DAC-E6-10).",
          },
          partial: {
            notApplicable:
              "Partial results render inside the cards: exceptions with counts and the Partial and Interrupted download rows (AC-12).",
          },
          error: {
            notApplicable:
              "A failed attention read is this slot's unavailable state; each card's own read renders its own error (DAC-E6-2, DAC-E6-17).",
          },
          unreachable: { notApplicable: "The shell replaces the main region (AC-23)." },
        }}
      />
      {showNeedsFixing && <NeedsFixing dataHealth={dataHealth} onReread={retry} />}
      <div className="grid grid-cols-2 items-start gap-5">
        {showRecent && <RecentDownloads />}
        {showFollow && <WhatYouFollow />}
      </div>
    </div>
  );
}
