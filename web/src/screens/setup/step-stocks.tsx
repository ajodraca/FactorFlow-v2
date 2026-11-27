import { type Ref, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { formatCount } from "../../components/patterns/format";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormRoot,
  useFormField,
} from "../../components/ui/form";
import { RadioGroup, RadioGroupCard } from "../../components/ui/radio-group";
import { Textarea } from "../../components/ui/textarea";
import { parseBulkSymbols } from "../instruments/parse-bulk-symbols";
import { QUESTIONS, READ_ERRORS, STEP3 } from "./copy";
import { postInBatches } from "./post-in-batches";
import { StepCard, StepReadError, failureReason } from "./step-card";
import { type PasteSummary, replaceEntry, summarisePaste } from "./summarise-paste";
import type { SetupState } from "./use-setup-state";

/*
 * Step 3, the followed stocks (CAP-003-E4-S3; component design setup-ui 2.3,
 * 10; UX design 1.2; S02 6; AC-3, AC-5, AC-6, AC-17, AC-19, DAC-E4-5 to
 * DAC-E4-7, DAC-E4-11, DAC-E4-13, DAC-E4-S3-1 to DAC-E4-S3-6; DEC-0351 to
 * DEC-0355).
 *
 * DAC-E4-S3-6: every disposition is listed as text and no status badge renders
 * here, so the one-tier rule does not apply, and no value on this step is
 * undeterminable, so `NotDeterminable` is not used. The register conflict with
 * setup-ui 10's counter badges is settled by the story (Resolved Conflict 1).
 *
 * The paste is parsed on paste and on blur, never per keystroke, and the
 * session draft holds the text, so going back keeps it (AC-3, DAC-E4-2).
 */

/** The floor below which no factor can be ranked (DAC-E4-7; the warning's wording says 30). */
const FACTOR_FLOOR = 30;

/** The warning marker beside an entry's words, never instead of them (setup-ui 10, Tokens). */
const ENTRY_CLASS = "flex flex-wrap items-center gap-2 border-l-2 border-status-warning pl-2";

const summarise = (text: string): PasteSummary | null =>
  text.trim() === "" ? null : summarisePaste(parseBulkSymbols(text));

interface SymbolsFieldProps {
  value: string;
  readOnly: boolean;
  summary: PasteSummary | null;
  report: string[];
  unposted: number;
  textareaRef: Ref<HTMLTextAreaElement>;
  onPaste: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  onFix: (input: string, fix: string) => void;
}

/**
 * The field, its hint and the polite live region that is always rendered, so
 * it exists before it changes. Inside `FormItem` so it can read the hint's id;
 * the field's own `aria-describedby` replaces the one `FormControl` supplies
 * and names both (CAP-003-E1-S2 Other Notes).
 */
function SymbolsField({
  value,
  readOnly,
  summary,
  report,
  unposted,
  textareaRef,
  onPaste,
  onChange,
  onBlur,
  onFix,
}: SymbolsFieldProps) {
  const { formDescriptionId } = useFormField();
  const summaryId = useId();
  return (
    <>
      <FormLabel>{STEP3.fieldLabel}</FormLabel>
      <FormControl>
        <Textarea
          variant="list"
          ref={textareaRef}
          value={value}
          placeholder={STEP3.placeholder}
          readOnly={readOnly}
          aria-describedby={`${formDescriptionId} ${summaryId}`}
          onPaste={onPaste}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      </FormControl>
      <FormDescription>{STEP3.fieldDescription}</FormDescription>
      <div
        id={summaryId}
        // biome-ignore lint/a11y/useSemanticElements: the summary is a polite live region tied to the field by aria-describedby (textarea spec section 5, TC-COMP-116); `output` is a form-result element, and the plan names role="status" on a div.
        role="status"
        className="flex flex-col gap-2 text-sm text-muted-foreground"
      >
        {summary !== null ? (
          <p>
            {STEP3.counter(
              formatCount(summary.accepted.length),
              formatCount(summary.duplicates.length),
              formatCount(summary.unreadable.length),
            )}
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {(summary?.duplicates ?? []).map((symbol) => (
            <li key={`duplicate-${symbol}`} className={ENTRY_CLASS}>
              {STEP3.duplicateEntry(symbol)}
            </li>
          ))}
          {(summary?.unreadable ?? []).map((entry, index) => (
            <li key={`unreadable-${index}-${entry.input}`} className={ENTRY_CLASS}>
              {STEP3.unreadable(entry.input)}
              {entry.fix !== null ? (
                <Button variant="outline" onClick={() => onFix(entry.input, entry.fix as string)}>
                  {STEP3.didYouMean(entry.fix)}
                </Button>
              ) : null}
            </li>
          ))}
          {report.map((line) => (
            <li key={`report-${line}`} className={ENTRY_CLASS}>
              {line}
            </li>
          ))}
        </ul>
        {unposted > 0 ? <p>{STEP3.keptForRetry(formatCount(unposted))}</p> : null}
      </div>
    </>
  );
}

export function StepStocks({ state }: { state: SetupState }) {
  const legendId = useId();
  const form = useForm<{ pasted: string }>({ defaultValues: { pasted: "" } });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingParse = useRef(false);
  const postingRef = useRef(false);
  // False once the owner has left step 3 (Back, a step link, unmount): a post that settles
  // afterwards must not move them again (AC-3, DAC-E4-6).
  const onStepRef = useRef(true);
  useEffect(() => {
    onStepRef.current = true;
    return () => {
      onStepRef.current = false;
    };
  }, []);
  const [summary, setSummary] = useState<PasteSummary | null>(() => summarise(state.drafts.pasted));
  const [report, setReport] = useState<string[]>([]);
  const [failure, setFailure] = useState<{ reason: string; posted: number } | null>(null);
  const [posting, setPosting] = useState(false);

  const { source, pasted, unposted } = state.drafts;
  const accepted = summary?.accepted.length ?? 0;
  const blocked = source === null || (source === "paste" && accepted === 0);

  function onChange(value: string): void {
    state.setDraft("pasted", value);
    if (pendingParse.current) {
      pendingParse.current = false;
      setSummary(summarise(value));
    }
  }

  function onBlur(): void {
    pendingParse.current = false;
    const next = pasted.toUpperCase();
    if (next !== pasted) {
      state.setDraft("pasted", next);
    }
    setSummary(summarise(next));
  }

  function applyFix(input: string, fix: string): void {
    const next = replaceEntry(pasted, input, fix);
    state.setDraft("pasted", next);
    setSummary(summarise(next));
    textareaRef.current?.focus();
  }

  async function post(symbols: readonly string[]): Promise<void> {
    postingRef.current = true;
    setPosting(true);
    setReport([]);
    setFailure(null);
    try {
      const outcome = await postInBatches(symbols);
      if (outcome.kind === "done") {
        state.setDraft("unposted", []);
        state.reread("activeCount");
        const lines = outcome.rejected.flatMap((entry) => {
          const name = entry.normalisedSymbol ?? entry.inputSymbol;
          if (entry.disposition === "duplicate_active") {
            return [STEP3.alreadyFollowedEntry(name)];
          }
          return entry.disposition === "malformed" ? [STEP3.unreadable(entry.inputSymbol)] : [];
        });
        setReport(lines);
        if (onStepRef.current) {
          state.goTo(lines.length > 0 ? 3 : 4);
        }
      } else {
        const text = outcome.unposted.join("\n");
        state.setDraft("unposted", outcome.unposted);
        state.setDraft("pasted", text);
        setSummary(summarise(text));
        setFailure({ reason: failureReason(outcome.error), posted: outcome.posted });
        if (outcome.posted > 0) {
          state.reread("activeCount");
        }
        if (onStepRef.current) {
          state.goTo(3);
        }
      }
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  }

  function onContinue(): void {
    if (source === "later") {
      state.goTo(4);
    } else if (source === "paste" && summary !== null && !postingRef.current) {
      void post(summary.accepted);
    }
  }

  return (
    <StepCard
      step={3}
      question={QUESTIONS[3]}
      explanation={STEP3.explanation}
      note={STEP3.infoNote}
      onBack={() => {
        onStepRef.current = false;
        state.goTo(2);
      }}
      onContinue={onContinue}
      continueBlocked={blocked ? STEP3.zeroBlocked : undefined}
    >
      {state.activeCount.kind === "error" ? (
        <StepReadError
          subject={READ_ERRORS.subjects.followed}
          error={state.activeCount.error}
          onRetry={() => state.reread("activeCount")}
        />
      ) : null}
      <p id={legendId} className="font-medium">
        {STEP3.sourceLegend}
      </p>
      <RadioGroup
        aria-labelledby={legendId}
        value={source ?? ""}
        onValueChange={(value) => state.setDraft("source", value as "paste" | "later")}
      >
        <RadioGroupCard
          value="paste"
          title={STEP3.paste.label}
          description={STEP3.paste.description}
        />
        <RadioGroupCard
          value="later"
          title={STEP3.later.label}
          description={STEP3.later.description}
        />
      </RadioGroup>
      {source === "paste" ? (
        <Form {...form}>
          <FormRoot aria-label={STEP3.fieldLabel} onSubmit={(event) => event.preventDefault()}>
            <FormField
              control={form.control}
              name="pasted"
              render={() => (
                <FormItem>
                  <SymbolsField
                    value={pasted}
                    readOnly={posting}
                    summary={summary}
                    report={report}
                    unposted={unposted.length}
                    textareaRef={textareaRef}
                    onPaste={() => {
                      pendingParse.current = true;
                    }}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFix={applyFix}
                  />
                </FormItem>
              )}
            />
          </FormRoot>
        </Form>
      ) : null}
      {source === "paste" && accepted >= 1 && accepted < FACTOR_FLOOR ? (
        <p>{STEP3.belowFloor(formatCount(accepted))}</p>
      ) : null}
      {failure !== null ? (
        <div role="alert" className="text-destructive">
          <p>{STEP3.saveFailed(failure.reason)}</p>
          <p>{STEP3.followedSoFar(formatCount(failure.posted))}</p>
        </div>
      ) : null}
    </StepCard>
  );
}
