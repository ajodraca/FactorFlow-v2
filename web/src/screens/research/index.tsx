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
 * The Research screen at `/research` (UX design 1.1 and 1.2; classification-ui
 * 2.3 to 2.7; AC-16, AC-20, AC-21, AC-22; DAC-E4-3, DAC-E4-4, DAC-E4-S9-1 to
 * DAC-E4-S9-5; DEC-0170). `web/src/app/routes.tsx` imports this default
 * export (CAP-002-E4-S10); it adds no route itself.
 *
 * It owns, once each: the URL query (`useResearchQuery`: sort, thresholds,
 * scope, hide-incomplete and search live only there, so reload and back
 * restore them, DAC-E4-3), the score-set poll (`useScoreSetPoll`, whose
 * `onNewSet` bumps the table's `refreshKey` once per new set, DAC-E4-4), the
 * table's latest first page, the selected and checked symbols (kept by
 * symbol across sort, filter, scope and the refresh), the notices
 * (`useNotices`, one `NoticeRegion`) and whether the Add and Earlier sets
 * dialogs are open. A query change reloads through the table's own effect on
 * `query`; nothing else bumps the key. The inspector gets the immediate
 * selection and debounces it itself (DEC-0164).
 *
 * The three panes wrap in a flex row `--space-4` apart: Filters (in a card,
 * UX design 1.1 "each a card"), Results and the inspector, which falls below
 * the results when the row is too narrow for the results pane's minimum width
 * (UX design 1.1 Page Layout). The screen has no fetch, timer or storage of
 * its own.
 *
 * What each part serves: the query and the Filters pane, DAC-E4-3 and
 * DAC-E4-S9-3; the poll, the refresh key and the result, DAC-E4-4 and, through
 * the pane, DAC-E4-S9-1, DAC-E4-S9-2 and DAC-E4-S9-5; selected and checked,
 * AC-16 and DAC-E4-4; the history dialog, DAC-E4-S9-4 and AC-21; the Add
 * dialog and the notices, AC-16 (CAP-002-E4-S8's dialogs).
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
    <div className="flex flex-wrap items-start gap-4">
      <div className="shrink-0 rounded border border-border bg-card p-4 text-card-foreground">
        <FiltersPane showLookIn activeInstruments={result?.set?.activeInstruments ?? null} />
      </div>
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
