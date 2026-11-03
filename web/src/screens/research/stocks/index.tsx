import {
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getStockEvidence } from "../../../api/classification-client";
import type { FactorName, Membership, StockEvidence } from "../../../api/classification-types";
import { ApiError, ApiUnreachableError } from "../../../api/client";
import { UnreachableState } from "../../../app/status-region";
import {
  CELL,
  EVIDENCE,
  RESULTS,
  SELECTION,
  SHELL_ROUTES,
  UNIVERSE_DETAIL,
  failureSentence,
} from "../copy";
import FactorCard, { cardShowsMark } from "./factor-card";
import HistoryTab from "./history-tab";

const FACTORS: readonly FactorName[] = ["value", "growth", "momentum"];

type TabKey = "now" | "earlier";

const TABS: readonly { key: TabKey; label: string }[] = [
  { key: "now", label: EVIDENCE.nowTab },
  { key: "earlier", label: EVIDENCE.earlierScoresTab },
];

/**
 * A local union rather than `ScreenState`, whose `error` variant cannot hold
 * the code the failure sentence is chosen by (DEC-0280, as DEC-0278).
 */
type Body =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "unreachable" }
  | { kind: "error"; error: unknown }
  | { kind: "loaded"; evidence: StockEvidence };

/** The `status-neutral` badge at the delivered badge size: a stock no longer followed (DEC-0073). */
function NotFollowedBadge(): JSX.Element {
  return (
    <span
      data-variant="status-neutral"
      className="inline-flex items-center gap-1 rounded bg-status-neutral-muted px-2 py-1 text-xs font-normal text-status-neutral"
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
        <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {CELL.notFollowed}
    </span>
  );
}

/** *In Tech and Dividend growers*, each name a link to its universe, or *In no universe* (DEC-0071). */
function MembershipsLine({ memberships }: { memberships: readonly Membership[] }): JSX.Element {
  return (
    <p data-testid="memberships" className="text-sm">
      {memberships.length === 0 ? (
        SELECTION.inNoUniverse
      ) : (
        <>
          {SELECTION.inUniversesLead}
          {memberships.map((membership, index) => (
            <span key={membership.universeId}>
              {index === 0
                ? null
                : index === memberships.length - 1
                  ? SELECTION.listAnd
                  : SELECTION.listComma}
              <Link
                to={`/research/universes/${encodeURIComponent(membership.universeId)}`}
                className="underline"
              >
                {membership.name}
              </Link>
            </span>
          ))}
        </>
      )}
    </p>
  );
}

function Breadcrumb({ symbol }: { symbol: string }): JSX.Element {
  return (
    <nav aria-label={UNIVERSE_DETAIL.breadcrumb} className="text-sm text-muted-foreground">
      <Link to="/research" className="underline">
        {RESULTS.title}
      </Link>{" "}
      <span aria-hidden="true">{EVIDENCE.breadcrumbSeparator}</span>{" "}
      <span className="font-numeric">{symbol}</span>
    </nav>
  );
}

function Title({
  symbol,
  evidence,
}: { symbol: string; evidence: StockEvidence | null }): JSX.Element {
  return (
    <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
      <span className="font-numeric">{symbol}</span>
      {evidence === null ? null : <span className="font-normal">{evidence.name}</span>}
      {evidence?.lifecycle === "retired" ? <NotFollowedBadge /> : null}
    </h1>
  );
}

function Skeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      {FACTORS.map((factor) => (
        <div
          key={factor}
          data-testid="card-skeleton"
          aria-hidden="true"
          className="h-24 rounded border border-border bg-secondary"
        />
      ))}
    </div>
  );
}

/** The Now panel for a loaded read: the three cards, or the sentence that says why there are none. */
function NowBody({ evidence, symbol }: { evidence: StockEvidence; symbol: string }): JSX.Element {
  const { set } = evidence;
  if (set === null) {
    return <p className="text-sm">{EVIDENCE.noScoreYet(symbol)}</p>;
  }
  // The type promises all three cells; a followed stock with no row in the set arrives with none (DEC-0140).
  if (FACTORS.some((factor) => evidence.factors[factor] === undefined)) {
    return <p className="text-sm">{EVIDENCE.notYetFollowed(symbol, set.classificationDate)}</p>;
  }
  const cards = FACTORS.map((factor) => {
    const inputs = evidence.inputs.filter((row) => row.factor === factor);
    return { factor, inputs, cell: evidence.factors[factor] };
  });
  const firstMark = cards.findIndex((card) =>
    cardShowsMark(card.factor, card.cell, card.inputs, evidence.lifecycle),
  );
  return (
    <div className="flex flex-col gap-5">
      {cards.map((card, index) => (
        <FragmentOf key={card.factor}>
          <FactorCard
            factor={card.factor}
            symbol={symbol}
            cell={card.cell}
            inputs={card.inputs}
            lifecycle={evidence.lifecycle}
            scoresDate={set.classificationDate}
            latestTradingDay={set.latestTradingDay}
          />
          {index === firstMark ? (
            <p className="text-xs text-muted-foreground">{CELL.restatedExplanation}</p>
          ) : null}
        </FragmentOf>
      ))}
      <p className="text-xs text-muted-foreground">{CELL.coverageStatement}</p>
    </div>
  );
}

function FragmentOf({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}

function EvidenceView({ symbol }: { symbol: string }): JSX.Element {
  const display = symbol.toUpperCase();
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get("tab") === "earlier" ? "earlier" : "now";
  const [body, setBody] = useState<Body>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  /** The history is read on first activation of Earlier scores and kept mounted after (DEC-0185). */
  const [historyMounted, setHistoryMounted] = useState(tab === "earlier");
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tab === "earlier" && !historyMounted) {
    setHistoryMounted(true);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt is the Try again trigger.
  useEffect(() => {
    let superseded = false;
    setBody({ kind: "loading" });
    getStockEvidence(symbol)
      .then((evidence) => {
        if (!superseded) setBody({ kind: "loaded", evidence });
      })
      .catch((error: unknown) => {
        if (superseded) return;
        if (error instanceof ApiUnreachableError) {
          setBody({ kind: "unreachable" });
        } else if (error instanceof ApiError && error.code === "instrument_not_found") {
          setBody({ kind: "not-found" });
        } else {
          setBody({ kind: "error", error });
        }
      });
    return () => {
      superseded = true;
    };
  }, [symbol, attempt]);

  if (body.kind === "unreachable") {
    return <UnreachableState />;
  }

  if (body.kind === "not-found") {
    return (
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
        <Breadcrumb symbol={display} />
        <Title symbol={display} evidence={null} />
        <p className="text-sm">
          {failureSentence({
            operation: "get-stock-evidence",
            resource: "classification",
            code: "instrument_not_found",
            symbols: [display],
          })}{" "}
          <Link to={SHELL_ROUTES.followedStocks} className="underline">
            {EVIDENCE.followedStocksLink}
          </Link>
        </p>
      </div>
    );
  }

  const evidence = body.kind === "loaded" ? body.evidence : null;

  function select(index: number): void {
    const key = TABS[index]?.key ?? "now";
    setParams(key === "earlier" ? { tab: "earlier" } : {});
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const last = TABS.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target !== null) {
      event.preventDefault();
      select(target);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
      <Breadcrumb symbol={display} />
      <Title symbol={display} evidence={evidence} />
      {evidence === null ? null : <MembershipsLine memberships={evidence.memberships} />}
      <div role="tablist" className="flex gap-2 border-b border-border">
        {TABS.map((entry, index) => (
          <button
            key={entry.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${base}-${entry.key}-tab`}
            aria-selected={tab === entry.key}
            aria-controls={`${base}-${entry.key}-panel`}
            tabIndex={tab === entry.key ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="min-h-6 px-3 py-2 text-sm aria-selected:border-b-2 aria-selected:font-semibold"
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${base}-now-panel`}
        aria-labelledby={`${base}-now-tab`}
        hidden={tab !== "now"}
      >
        {body.kind === "loading" ? <Skeleton /> : null}
        {body.kind === "error" ? (
          <div className="flex flex-col gap-2 text-sm">
            <p>
              {failureSentence({
                operation: "get-stock-evidence",
                resource: "classification",
                code: body.error instanceof ApiError ? body.error.code : null,
                symbols: [display],
              })}
            </p>
            <button
              type="button"
              onClick={() => setAttempt((count) => count + 1)}
              className="w-fit rounded border border-border px-3 py-2"
            >
              {RESULTS.tryAgain}
            </button>
          </div>
        ) : null}
        {evidence === null ? null : <NowBody evidence={evidence} symbol={display} />}
      </div>
      <div
        role="tabpanel"
        id={`${base}-earlier-panel`}
        aria-labelledby={`${base}-earlier-tab`}
        hidden={tab !== "earlier"}
      >
        {historyMounted ? <HistoryTab symbol={symbol} /> : null}
      </div>
    </div>
  );
}

/**
 * The Stock evidence screen (AC-12 to AC-17, AC-23; DAC-E5-S3-1 to -5;
 * DEC-0184, DEC-0185; classification-ui 2.5, 10; UX design 1.6): one stock's
 * three factor cards on the Now tab and its earlier scores on the other.
 * `routes.tsx` imports this default export (CAP-002-E4-S10). The inner view is
 * keyed by the symbol, so a changed symbol reads once and resets the tab state.
 */
export default function StockEvidenceScreen(): JSX.Element {
  const { symbol = "" } = useParams();
  return <EvidenceView key={symbol} symbol={symbol} />;
}
