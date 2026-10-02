import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { AcquisitionRun } from "../../api/types";
import { formatTimestamp } from "../../app/status-region";
import { ABANDONED_EXPLANATION, OutcomeBadge, isNonTerminalRunState } from "./outcome-badge";

function Timestamp({ iso }: { iso: string | null }): JSX.Element {
  if (iso === null) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not recorded</span>
      </>
    );
  }
  return <span className="font-numeric text-xs">{formatTimestamp(new Date(iso))}</span>;
}

/**
 * The Runs list as a `data-table` `history` table (ux-design 1.4;
 * owner-web-app 2.5). The history variant allows no row selection and no
 * row actions, so the only way into a run is the run-id link in the first
 * column, an anchor that middle-click and open-in-new-tab honour
 * (DAC-E5-S6-4).
 *
 * Non-terminal runs are pinned first, stably, and marked in progress
 * (ux-design 1.4 Page Layout). `busy` keeps the rows rendered while a poll
 * is in flight rather than collapsing to a loading message.
 */
export function RunTable({ runs, busy }: { runs: AcquisitionRun[]; busy: boolean }): JSX.Element {
  const ordered = [
    ...runs.filter((item) => isNonTerminalRunState(item.state)),
    ...runs.filter((item) => !isNonTerminalRunState(item.state)),
  ];

  return (
    <table aria-busy={busy} className="w-full text-left text-sm">
      <thead>
        <tr>
          <th scope="col">Run</th>
          <th scope="col">Outcome</th>
          <th scope="col">Requested</th>
          <th scope="col">Started</th>
          <th scope="col">Ended</th>
          <th scope="col" className="text-right">
            Instruments written
          </th>
          <th scope="col" className="text-right">
            Instruments failed
          </th>
        </tr>
      </thead>
      <tbody>
        {ordered.map((item) => {
          const inProgress = isNonTerminalRunState(item.state);
          return (
            <tr
              key={item.runId}
              data-in-progress={inProgress ? "true" : undefined}
              className={`h-row border-t border-border ${inProgress ? "border-l-4 border-l-status-active" : ""}`}
            >
              <th scope="row" className="font-normal">
                <Link
                  to={`/runs/${encodeURIComponent(item.runId)}`}
                  className="font-numeric underline"
                >
                  {item.runId}
                </Link>
              </th>
              <td>
                <OutcomeBadge state={item.state} />
                {item.state === "abandoned" ? (
                  <p data-testid="abandoned-explanation" className="text-sm">
                    {ABANDONED_EXPLANATION}
                  </p>
                ) : null}
              </td>
              <td>
                <Timestamp iso={item.requestedAt} />
              </td>
              <td>
                <Timestamp iso={item.startedAt} />
              </td>
              <td>
                <Timestamp iso={item.endedAt} />
              </td>
              <td className="text-right font-numeric">{item.instrumentsWritten}</td>
              <td className="text-right font-numeric">{item.instrumentsFailed}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
