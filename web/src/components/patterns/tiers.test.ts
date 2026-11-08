import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import type { RunState } from "../../api/types";
import { type NeedsYouKind, type Status, type Tier, labelOf, tierOf } from "./tiers";

const PATTERNS_DIR = path.dirname(fileURLToPath(import.meta.url));
const TIERS_PATH = path.join(PATTERNS_DIR, "tiers.ts");
const TSCONFIG_PATH = path.join(PATTERNS_DIR, "../../../../tsconfig.json");

type Row = [label: string, tier: Tier];

/** Compile `tiers.ts` with `source` standing in for its text; return its diagnostics. */
function diagnosticsFor(source: string): readonly ts.Diagnostic[] {
  const config = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(TSCONFIG_PATH));
  const options: ts.CompilerOptions = { ...parsed.options, types: [] };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersionOrOptions, ...rest) =>
    path.resolve(fileName) === TIERS_PATH
      ? ts.createSourceFile(fileName, source, languageVersionOrOptions, true)
      : original(fileName, languageVersionOrOptions, ...rest);
  const program = ts.createProgram([TIERS_PATH], options, host);
  const file = program.getSourceFile(TIERS_PATH);
  if (!file) throw new Error("tiers.ts is not in the program");
  return ts.getPreEmitDiagnostics(program, file);
}

/** The text range of a top-level function declaration in `source`. */
function functionRange(source: string, name: string): [number, number] {
  const file = ts.createSourceFile(TIERS_PATH, source, ts.ScriptTarget.ES2022, true);
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) {
      return [statement.getStart(file), statement.getEnd()];
    }
  }
  throw new Error(`function ${name} not found in tiers.ts`);
}

/** Insert a union member after the last member of a type literal member's union, found by AST. */
function plant(source: string, target: (file: ts.SourceFile) => ts.UnionTypeNode, text: string) {
  const file = ts.createSourceFile(TIERS_PATH, source, ts.ScriptTarget.ES2022, true);
  const union = target(file);
  const end = union.types[union.types.length - 1].getEnd();
  return `${source.slice(0, end)} | ${text}${source.slice(end)}`;
}

function statusUnion(file: ts.SourceFile): ts.UnionTypeNode {
  for (const statement of file.statements) {
    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === "Status") {
      if (ts.isUnionTypeNode(statement.type)) return statement.type;
    }
  }
  throw new Error("Status union not found in tiers.ts");
}

function scoresStateUnion(file: ts.SourceFile): ts.UnionTypeNode {
  for (const member of statusUnion(file).types) {
    if (!ts.isTypeLiteralNode(member)) continue;
    const props = member.members.filter(ts.isPropertySignature);
    const of = props.find((p) => p.name.getText(file) === "of");
    const state = props.find((p) => p.name.getText(file) === "state");
    if (
      of?.type &&
      ts.isLiteralTypeNode(of.type) &&
      of.type.literal.getText(file) === '"scores"' &&
      state?.type &&
      ts.isUnionTypeNode(state.type)
    ) {
      return state.type;
    }
  }
  throw new Error("the scores state union was not found in tiers.ts");
}

// Implements TC-COMP-020
describe("Status exhaustiveness (TC-COMP-020, DAC-E1-S5-1)", { timeout: 30_000 }, () => {
  const source = readFileSync(TIERS_PATH, "utf-8");

  it("the unspliced source type-checks clean", () => {
    expect(
      diagnosticsFor(source).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")),
    ).toEqual([]);
  });

  it("a new status kind fails to type-check in both tierOf and labelOf", () => {
    const planted = plant(source, statusUnion, '{ of: "planted" }');
    expect(planted).not.toBe(source);
    const starts = diagnosticsFor(planted).map((d) => d.start ?? -1);
    for (const name of ["tierOf", "labelOf"]) {
      const [from, to] = functionRange(planted, name);
      expect(starts.some((start) => start >= from && start < to)).toBe(true);
    }
  });

  it("a new scores state fails to type-check in both tierOf and labelOf", () => {
    const planted = plant(source, scoresStateUnion, '"planted"');
    expect(planted).not.toBe(source);
    const starts = diagnosticsFor(planted).map((d) => d.start ?? -1);
    for (const name of ["tierOf", "labelOf"]) {
      const [from, to] = functionRange(planted, name);
      expect(starts.some((start) => start >= from && start < to)).toBe(true);
    }
  });

  it("Not determinable is not a tier: the check status type refuses it", () => {
    expect(() =>
      tierOf({
        of: "check",
        check: "daily_prices",
        // @ts-expect-error not_determinable renders through NotDeterminable, never tierOf
        status: "not_determinable",
      }),
    ).toThrow();
    expect(() =>
      tierOf({
        of: "check",
        check: "daily_prices",
        // @ts-expect-error not_current has no row for a check (Resolved Conflict 1)
        status: "not_current",
      }),
    ).toThrow();
  });
});

const DOWNLOAD: Record<RunState, Row> = {
  requested: ["Queued", "neutral"],
  running: ["Downloading", "active"],
  cancelling: ["Stopping", "warning"],
  succeeded: ["Complete", "good"],
  partial: ["Partial", "warning"],
  failed: ["Failed", "critical"],
  cancelled: ["Cancelled by you", "neutral"],
  abandoned: ["Interrupted", "serious"],
};

const RESULT: Record<"not_found" | "failed", Row> = {
  not_found: ["Not found", "warning"],
  failed: ["Failed", "critical"],
};

const SCORES: Record<Extract<Status, { of: "scores" }>["state"], Row> = {
  building: ["Updating", "active"],
  not_current: ["Not reflecting the latest download", "warning"],
  failed: ["Score update failed", "critical"],
  never_classified: ["No scores yet", "neutral"],
  current: ["Current", "good"],
};

const ITEM: Record<NeedsYouKind, Row> = {
  data_problems: ["Data", "warning"],
  download_not_complete: ["Download", "serious"],
  credential_missing: ["Setup", "critical"],
  first_download: ["Download", "active"],
  first_scores: ["Scores", "active"],
  score_failed: ["Scores", "critical"],
};

const TABLE: [string, Status, Row][] = [
  ...(Object.entries(DOWNLOAD) as [RunState, Row][]).map(([state, row]): [string, Status, Row] => [
    `download ${state}`,
    { of: "download", state },
    row,
  ]),
  ...(Object.entries(RESULT) as ["not_found" | "failed", Row][]).map(
    ([outcome, row]): [string, Status, Row] => [
      `result ${outcome}`,
      { of: "result", outcome },
      row,
    ],
  ),
  ...(Object.entries(SCORES) as [keyof typeof SCORES, Row][]).map(
    ([state, row]): [string, Status, Row] => [`scores ${state}`, { of: "scores", state }, row],
  ),
  [
    "check daily_prices ok",
    { of: "check", check: "daily_prices", status: "ok" },
    ["No missing prices or gaps", "good"],
  ],
  [
    "check company_financials ok",
    { of: "check", check: "company_financials", status: "ok" },
    ["All financials present", "good"],
  ],
  [
    "check daily_prices exceptions",
    { of: "check", check: "daily_prices", status: "exceptions" },
    ["Needs attention", "warning"],
  ],
  [
    "check company_financials exceptions",
    { of: "check", check: "company_financials", status: "exceptions" },
    ["Needs attention", "warning"],
  ],
  ["credential present", { of: "credential", present: true }, ["Found", "good"]],
  ["credential missing", { of: "credential", present: false }, ["Missing", "critical"]],
  ...(Object.entries(ITEM) as [NeedsYouKind, Row][]).map(([kind, row]): [string, Status, Row] => [
    `item ${kind}`,
    { of: "item", kind },
    row,
  ]),
  [
    "item download_not_complete not failed",
    { of: "item", kind: "download_not_complete", failed: false },
    ["Download", "serious"],
  ],
  [
    "item download_not_complete failed",
    { of: "item", kind: "download_not_complete", failed: true },
    ["Download", "critical"],
  ],
];

// Implements TC-COMP-021
describe("Tier table (TC-COMP-021, DAC-E1-1)", () => {
  it("covers every UX brief 12.2 row", () => {
    expect(TABLE).toHaveLength(29);
  });

  it.each(TABLE)("%s", (_name, status, [label, tier]) => {
    expect(tierOf(status)).toBe(tier);
    expect(labelOf(status)).toBe(label);
  });

  it("partial is never good", () => {
    expect(tierOf({ of: "download", state: "partial" })).not.toBe("good");
  });

  it("cancelled is never critical", () => {
    expect(tierOf({ of: "download", state: "cancelled" })).not.toBe("critical");
  });
});
