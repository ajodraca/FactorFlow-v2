import { type JSX, useReducer, useState } from "react";
import { InspectorPanel } from "../../components/patterns/inspector-panel";
import { AddToUniverseDialog } from "./add-to-universe-dialog";
import { FiltersPane } from "./filters-pane";
import { NoticeRegion, useNotices } from "./notices";
import { type ResearchResult, ResultsPane } from "./results-pane";
import { SetHistoryDialog } from "./set-history-dialog";
import { useResearchQuery } from "./use-research-query";
import { useScoreSetPoll } from "./use-score-set-poll";

/**
 * The Research screen (AC-9, AC-16, AC-20, AC-21, AC-22; DAC-E4-2, DAC-E4-3,
 * DAC-E4-4, DAC-E4-S9-3; DEC-0170): the Filters pane, the Results pane and the
 * selected stock's inspector, composed from what CAP-002-E4-S4 to S8 built.
 * `routes.tsx` imports this default export (CAP-002-E4-S10).
 *
 * The screen holds the one `useResearchQuery` (the URL is the only home of
 * sort, thresholds, scope, hide-incomplete and search, so a reload or back
 * restores them), the one `useScoreSetPoll` whose `onNewSet` bumps the
 * table's `refreshKey` once (DAC-E4-4), `selected` and `checked` by symbol, the
 * first-page result and the one `useNotices`/`NoticeRegion`. It has no
 * `fetch`, timer or storage of its own.
 */
export default function ResearchScreen(): JSX.Element {
  const { query, setQuery, clear } = useResearchQuery();
  const [refreshKey, bump] = useReducer((key: number) => key + 1, 0);
  const poll = useScoreSetPoll({ onNewSet: bump });
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const { notices, notify, dismiss } = useNotices();
  const [addOpen, setAddOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-4">
      <FiltersPane showLookIn activeInstruments={result?.set?.activeInstruments ?? null} />
      <ResultsPane
        query={query}
        onQueryChange={setQuery}
        onClear={clear}
        refreshKey={refreshKey}
        result={result}
        onResult={setResult}
        summary={poll.summary}
        checkedAt={poll.checkedAt}
        pollFailed={poll.pollFailed}
        onTryAgain={() => void poll.tryAgain()}
        announcement={poll.announcement}
        selected={selected}
        onSelect={setSelected}
        checked={checked}
        onCheckedChange={setChecked}
        onAddToUniverse={() => setAddOpen(true)}
        onOpenEarlierSets={() => setHistoryOpen(true)}
        onNotify={notify}
      />
      <InspectorPanel symbol={selected} />
      {addOpen ? (
        <AddToUniverseDialog
          symbols={checked}
          onClose={() => setAddOpen(false)}
          onNotify={notify}
        />
      ) : null}
      {historyOpen ? <SetHistoryDialog onClose={() => setHistoryOpen(false)} /> : null}
      <NoticeRegion notices={notices} onDismiss={dismiss} />
    </div>
  );
}
