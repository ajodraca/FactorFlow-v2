import { ApiError, ApiUnreachableError, addInstruments } from "../../api/client";
import type { SymbolOutcome } from "../../api/types";

/*
 * Posts the accepted symbols of setup step 3 in order, one batch at a time
 * (CAP-003-E4-S3; component design setup-ui 1, 2.3; AC-5, AC-17, DAC-E4-6,
 * DAC-E4-S3-2; DEC-0354). The delivered route and its dispositions are used
 * as they are; this module only splits the list and decides where to stop.
 */

/**
 * The mirror of the server's per-request bound
 * (`src/factorflow/api/bounds.py:25`; setup-ui 1), pinned equal by test.
 */
export const MAX_SYMBOLS_PER_REQUEST = 1000;

/**
 * Every batch was followed (`done`), or the requests stopped at one that
 * failed (`failed`): `posted` counts the symbols followed before it and
 * `unposted` holds that batch's symbols and every later one, in order.
 */
export type BatchOutcome =
  | { kind: "done"; posted: number; rejected: SymbolOutcome[] }
  | {
      kind: "failed";
      posted: number;
      unposted: string[];
      error: ApiError | ApiUnreachableError;
      rejected: SymbolOutcome[];
    };

/**
 * A `409` batch (every symbol already followed, the code `all_duplicate`)
 * counts as posted and the requests go on (DAC-E4-6; system design 3.2 note
 * 3). Any other refusal and a transport failure stop them (DEC-0354); an
 * error of any other kind is a defect and is thrown.
 */
export async function postInBatches(symbols: readonly string[]): Promise<BatchOutcome> {
  const rejected: SymbolOutcome[] = [];
  let posted = 0;
  for (let i = 0; i < symbols.length; i += MAX_SYMBOLS_PER_REQUEST) {
    const batch = symbols.slice(i, i + MAX_SYMBOLS_PER_REQUEST);
    try {
      const result = await addInstruments(batch);
      rejected.push(...result.rejected);
      posted += batch.length;
    } catch (error) {
      if (error instanceof ApiError && error.code === "all_duplicate") {
        posted += batch.length;
      } else if (error instanceof ApiError || error instanceof ApiUnreachableError) {
        return { kind: "failed", posted, unposted: symbols.slice(i), error, rejected };
      } else {
        throw error;
      }
    }
  }
  return { kind: "done", posted, rejected };
}
