import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, addInstruments } from "../../api/client";
import type { SymbolOutcome } from "../../api/types";
import { MAX_SYMBOLS_PER_REQUEST, postInBatches } from "./post-in-batches";

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  addInstruments: vi.fn(),
}));

const symbols = (n: number, start = 0): string[] =>
  Array.from({ length: n }, (_, i) => `S${start + i}`);

const outcome = (symbol: string, disposition: SymbolOutcome["disposition"]): SymbolOutcome => ({
  inputSymbol: symbol,
  normalisedSymbol: symbol,
  disposition,
  reason: null,
});

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
};

beforeEach(() => {
  vi.mocked(addInstruments).mockReset();
  vi.mocked(addInstruments).mockImplementation(async (batch: string[]) => ({
    added: batch.map((s) => outcome(s, "added")),
    reactivated: [],
    rejected: [],
  }));
});

// Implements TC-COMP-114 (DAC-E4-S3-2, DAC-E4-6, AC-5): the request half
describe("postInBatches (TC-COMP-114)", () => {
  it("posts 2500 symbols as 1000, 1000 and 500, in order", async () => {
    const result = await postInBatches(symbols(2500));
    const calls = vi.mocked(addInstruments).mock.calls;
    expect(calls).toHaveLength(3);
    expect(calls.map(([batch]) => batch.length)).toEqual([1000, 1000, 500]);
    expect(calls.map(([batch]) => batch[0])).toEqual(["S0", "S1000", "S2000"]);
    expect(calls[2]?.[0].at(-1)).toBe("S2499");
    expect(result).toEqual({ kind: "done", posted: 2500, rejected: [] });
  });

  it("posts one batch at a time", async () => {
    const held = deferred<Awaited<ReturnType<typeof addInstruments>>>();
    vi.mocked(addInstruments)
      .mockResolvedValueOnce({ added: [], reactivated: [], rejected: [] })
      .mockReturnValueOnce(held.promise);
    const pending = postInBatches(symbols(2500));
    await flush();
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(2);
    held.resolve({ added: [], reactivated: [], rejected: [] });
    await pending;
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(3);
  });

  it("treats a 409 batch as posted and goes on", async () => {
    vi.mocked(addInstruments)
      .mockResolvedValueOnce({ added: [], reactivated: [], rejected: [] })
      .mockRejectedValueOnce(new ApiError("x", "req-1", { code: "all_duplicate" }));
    const result = await postInBatches(symbols(2500));
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ kind: "done", posted: 2500, rejected: [] });
  });

  it("stops at a transport failure and keeps that batch and the later ones", async () => {
    const error = new ApiUnreachableError("x");
    vi.mocked(addInstruments)
      .mockResolvedValueOnce({ added: [], reactivated: [], rejected: [] })
      .mockRejectedValueOnce(error);
    const result = await postInBatches(symbols(2500));
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      kind: "failed",
      posted: 1000,
      unposted: symbols(1500, 1000),
      error,
      rejected: [],
    });
    expect(result.kind === "failed" && result.error).toBe(error);
  });

  it("stops at a 500 on the first batch with everything unposted", async () => {
    const error = new ApiError("x", "req-2", { code: "internal_error" });
    vi.mocked(addInstruments).mockRejectedValueOnce(error);
    const result = await postInBatches(symbols(2500));
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      kind: "failed",
      posted: 0,
      unposted: symbols(2500),
      error,
      rejected: [],
    });
  });
});

describe("postInBatches rules (DAC-E4-6, AC-17; DEC-0354)", () => {
  it("posts exactly 1000 as one batch and 1001 as two", async () => {
    await postInBatches(symbols(1000));
    expect(vi.mocked(addInstruments).mock.calls.map(([batch]) => batch.length)).toEqual([1000]);
    vi.mocked(addInstruments).mockClear();
    await postInBatches(symbols(1001));
    expect(vi.mocked(addInstruments).mock.calls.map(([batch]) => batch.length)).toEqual([1000, 1]);
  });

  it("posts nothing for an empty list", async () => {
    const result = await postInBatches([]);
    expect(vi.mocked(addInstruments)).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: "done", posted: 0, rejected: [] });
  });

  it("accumulates each batch's rejected dispositions in order", async () => {
    const first = outcome("S5", "duplicate_active");
    const second = outcome("S1500", "duplicate_active");
    vi.mocked(addInstruments)
      .mockResolvedValueOnce({ added: [], reactivated: [], rejected: [first] })
      .mockResolvedValueOnce({ added: [], reactivated: [], rejected: [second] });
    const result = await postInBatches(symbols(2000));
    expect(result.rejected).toEqual([first, second]);
    expect(result.rejected[0]).toBe(first);
    expect(result.rejected[1]).toBe(second);
  });

  it.each([
    ["all_malformed", new ApiError("x", "req-3", { code: "all_malformed" })],
    ["validation_error", new ApiError("x", "req-3", { code: "validation_error" })],
    ["no code", new ApiError("x", "req-4", { code: null })],
  ])("takes the failure path for a %s refusal", async (_name, error) => {
    vi.mocked(addInstruments).mockRejectedValueOnce(error);
    const result = await postInBatches(symbols(10));
    expect(result).toMatchObject({ kind: "failed", posted: 0, unposted: symbols(10) });
  });

  it("rethrows anything else", async () => {
    const boom = new TypeError("boom");
    vi.mocked(addInstruments).mockRejectedValueOnce(boom);
    await expect(postInBatches(symbols(10))).rejects.toBe(boom);
  });

  it("mirrors the server's bound", () => {
    expect(MAX_SYMBOLS_PER_REQUEST).toBe(1000);
    const here = path.dirname(fileURLToPath(import.meta.url));
    const bounds = readFileSync(
      path.join(here, "../../../../src/factorflow/api/bounds.py"),
      "utf8",
    );
    expect(bounds).toMatch(/^MAX_SYMBOLS_PER_REQUEST = 1000$/m);
  });
});
