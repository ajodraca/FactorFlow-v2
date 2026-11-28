import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LAYOUT } from "../app/layout";

// The AC-26 automated check (DAC-E1-12, DAC-E3-16): theme tokens only, no
// spacing, size or colour literal outside the theme. This file holds the
// Tailwind-key resolution check (TC-COMP-003) and the literal scan
// (TC-COMP-005).
const COMPONENTS_DIR = path.dirname(fileURLToPath(import.meta.url));
// Vitest's root is `web/`, so the repo root is three levels above this file.
const REPO_ROOT = path.resolve(COMPONENTS_DIR, "../../..");
const TAILWIND_CONFIG = path.join(REPO_ROOT, "tailwind.config.js");
const THEME_CSS = path.join(REPO_ROOT, "design-system/theme.css");

interface TailwindConfig {
  theme: { extend: Record<string, Record<string, string>> };
}

async function loadConfig(): Promise<TailwindConfig> {
  return (await import(TAILWIND_CONFIG)).default as TailwindConfig;
}

// The 25 colour keys delivered before this story, and the twelve it adds
// (component design 2.2; DAC-E1-11). Written out independently of the config.
const DELIVERED_COLOR_KEYS = [
  "background",
  "foreground",
  "border",
  "input",
  "card",
  "card-foreground",
  "muted-foreground",
  "secondary",
  "secondary-foreground",
  "status-neutral",
  "status-neutral-muted",
  "status-active",
  "status-active-muted",
  "status-good",
  "status-good-muted",
  "status-warning",
  "status-warning-muted",
  "status-serious",
  "status-serious-muted",
  "status-critical",
  "status-critical-muted",
  "value-missing",
  "value-missing-muted",
  "value-indeterminate",
  "value-indeterminate-muted",
];
const ADDED_COLOR_KEYS = [
  "primary",
  "primary-foreground",
  "accent",
  "accent-foreground",
  "popover",
  "popover-foreground",
  "muted",
  "ring",
  "destructive",
  "destructive-foreground",
  "status-foreground",
  "seq-1",
];

// Every scale `theme.extend` holds: the delivered ones and the vendored radius,
// ring width and background image. Written out independently of the config.
const EXTENDED_SCALES = [
  "colors",
  "borderRadius",
  "ringWidth",
  "backgroundImage",
  "spacing",
  "fontSize",
  "height",
  "fontFamily",
  "maxWidth",
];

// Implements TC-COMP-003
describe("tailwind.config.js keys (DAC-E1-11)", () => {
  it("gains only the vendored colour keys, no other", async () => {
    const config = await loadConfig();
    expect(Object.keys(config.theme.extend.colors).sort()).toEqual(
      [...DELIVERED_COLOR_KEYS, ...ADDED_COLOR_KEYS].sort(),
    );
  });

  it("binds the default radius and ring width to their tokens", async () => {
    const config = await loadConfig();
    expect(config.theme.extend.borderRadius).toEqual({ DEFAULT: "var(--radius)" });
    expect(config.theme.extend.ringWidth).toEqual({ DEFAULT: "var(--focus-ring-width)" });
  });

  it("writes every colour as hsl(var(--token) / <alpha-value>)", async () => {
    const config = await loadConfig();
    const offenders = Object.entries(config.theme.extend.colors)
      .filter(([, value]) => !/^hsl\(var\(--[\w-]+\) \/ <alpha-value>\)$/.test(value))
      .map(([key, value]) => `colors.${key} = ${value}`);
    expect(offenders).toEqual([]);
  });

  it("binds every colour key to the token of the same name", async () => {
    const config = await loadConfig();
    const offenders = Object.entries(config.theme.extend.colors)
      .filter(([key, value]) => value !== `hsl(var(--${key}) / <alpha-value>)`)
      .map(([key, value]) => `colors.${key} = ${value}, expected --${key}`);
    expect(offenders).toEqual([]);
  });

  it("extends only the scales this design system names", async () => {
    const config = await loadConfig();
    expect(Object.keys(config.theme.extend).sort()).toEqual([...EXTENDED_SCALES].sort());
  });

  it("names only tokens that theme.css declares, in every extended scale", async () => {
    const config = await loadConfig();
    const theme = readFileSync(THEME_CSS, "utf-8");
    const declared = new Set([...theme.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
    const offenders: string[] = [];
    for (const scale of Object.keys(config.theme.extend)) {
      for (const [key, value] of Object.entries(config.theme.extend[scale] ?? {})) {
        for (const reference of value.matchAll(/var\((--[\w-]+)\)/g)) {
          if (!declared.has(reference[1])) {
            offenders.push(`${scale}.${key} -> ${reference[1]}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The literal scan (AC-26, DAC-E1-S1-2; interface fixed by DEC-0296).
// ---------------------------------------------------------------------------

/** Repo-root-relative directories the scan reads. Later stories widen it by appending. */
// biome-ignore lint/suspicious/noExportsInTest: DEC-0296 fixes this export as the scan's interface.
export const SCANNED_DIRECTORIES: readonly string[] = [
  "web/src/components/",
  "web/src/app/command-palette/",
  "web/src/screens/setup/",
  "web/src/screens/home/",
];

/** The one module that holds approved-specification widths (system design constraint 12). */
const LAYOUT_MODULE = "web/src/app/layout.ts";
/** The vendored command dialog is the one file allowed its 560 px width. */
const COMMAND_MODULE = "web/src/components/ui/command.tsx";
const COMMAND_WIDTH = "560px";

const LENGTH_LITERAL = /\b\d+(\.\d+)?(px|rem|em|vh|vw)\b/g;
const HEX_LITERAL = /#[0-9a-fA-F]{3,8}\b/g;
const COLOR_FUNCTION_LITERAL = /\b(rgb|hsl)a?\((?!\s*var\()/g;

/** A non-test `.ts` or `.tsx` source. */
// biome-ignore lint/suspicious/noExportsInTest: DEC-0296 fixes this export as the scan's interface.
export function isScannedSource(relPath: string): boolean {
  return /\.tsx?$/.test(relPath) && !/\.test\.tsx?$/.test(relPath);
}

/** Every spacing, size or colour literal in a source, as `"<relPath>: <match>"`. */
// biome-ignore lint/suspicious/noExportsInTest: DEC-0296 fixes this export as the scan's interface.
export function literalsIn(relPath: string, source: string): string[] {
  if (relPath === LAYOUT_MODULE) {
    return [];
  }
  const matches = [
    ...source.matchAll(LENGTH_LITERAL),
    ...source.matchAll(HEX_LITERAL),
    ...source.matchAll(COLOR_FUNCTION_LITERAL),
  ].map((match) => match[0]);
  return matches
    .filter((match) => !/^\d/.test(match) || Number.parseFloat(match) !== 0)
    .filter((match) => !(match === COMMAND_WIDTH && relPath === COMMAND_MODULE))
    .map((match) => `${relPath}: ${match}`);
}

function scannedFiles(): string[] {
  const walk = (relDirectory: string): string[] =>
    readdirSync(path.join(REPO_ROOT, relDirectory), { withFileTypes: true }).flatMap((entry) => {
      const relPath = `${relDirectory.replace(/\/$/, "")}/${entry.name}`;
      return entry.isDirectory() ? walk(relPath) : isScannedSource(relPath) ? [relPath] : [];
    });
  return SCANNED_DIRECTORIES.flatMap((directory) => walk(directory));
}

const PLANTED = "web/src/components/ui/planted.tsx";

// Implements TC-COMP-005
describe("literal scan (AC-26, DAC-E1-S1-2)", () => {
  it("finds no literal in any scanned source, and scans some", () => {
    const files = scannedFiles();
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.flatMap((relPath) =>
      literalsIn(relPath, readFileSync(path.join(REPO_ROOT, relPath), "utf-8")),
    );
    expect(offenders).toEqual([]);
  });

  it("scans web/src/components/ as a whole (DEC-0296)", () => {
    expect(SCANNED_DIRECTORIES).toContain("web/src/components/");
  });

  it("scans only directories that exist", () => {
    for (const directory of SCANNED_DIRECTORIES) {
      expect(() => readdirSync(path.join(REPO_ROOT, directory))).not.toThrow();
    }
  });

  it.each([
    ["a spacing literal", 'const a = "p-[12px]";', "12px"],
    ["a short hex colour", 'const a = "#fff";', "#fff"],
    ["an rgb colour", 'const a = "rgb(0 0 0)";', "rgb("],
    ["an hsl colour", 'const a = "hsl(210 40% 50%)";', "hsl("],
    ["an rgba colour", 'const a = "rgba(0, 0, 0, 0.5)";', "rgba("],
    ["a rem length", 'const a = "p-[1.5rem]";', "1.5rem"],
    ["an em length", 'const a = "p-[2em]";', "2em"],
    ["a vh length", 'const a = "h-[50vh]";', "50vh"],
    ["a vw length", 'const a = "w-[30vw]";', "30vw"],
  ])("rejects %s", (_name, source, match) => {
    expect(literalsIn(PLANTED, source)).toEqual([`${PLANTED}: ${match}`]);
  });

  it("allows zero-valued lengths", () => {
    expect(literalsIn(PLANTED, 'const a = "0px m-0";')).toEqual([]);
  });

  it("allows the command dialog's width in command.tsx only", () => {
    const source = 'const a = "max-w-[560px]";';
    expect(literalsIn(COMMAND_MODULE, source)).toEqual([]);
    expect(literalsIn("web/src/components/ui/badge.tsx", source)).toEqual([
      "web/src/components/ui/badge.tsx: 560px",
    ]);
  });

  it("skips web/src/app/layout.ts wholesale and nothing else under web/src/app/", () => {
    const source = 'export const width = "208px";';
    expect(literalsIn(LAYOUT_MODULE, source)).toEqual([]);
    expect(literalsIn("web/src/app/shell.tsx", source)).toEqual(["web/src/app/shell.tsx: 208px"]);
  });

  it("does not treat a colour function over a theme token as a literal", () => {
    expect(literalsIn(PLANTED, 'const a = "hsl(var(--seq-1))";')).toEqual([]);
    expect(literalsIn(PLANTED, 'const a = "hsl( var(--seq-1))";')).toEqual([]);
  });

  it("ignores test files", () => {
    expect(isScannedSource("web/src/components/ui/planted.test.tsx")).toBe(false);
    expect(isScannedSource("web/src/components/ui/planted.test.ts")).toBe(false);
    expect(isScannedSource(PLANTED)).toBe(true);
    expect(isScannedSource("web/src/components/ui/styles.css")).toBe(false);
  });
});

// The six form family components (CAP-003-E1-S2) are scanned and clean. Listed
// independently of the scan so a file moved out of the scanned tree fails here.
const FORM_FAMILY_FILES = [
  "web/src/components/ui/form.tsx",
  "web/src/components/ui/input.tsx",
  "web/src/components/ui/textarea.tsx",
  "web/src/components/ui/checkbox.tsx",
  "web/src/components/ui/radio-group.tsx",
  "web/src/components/ui/select.tsx",
];

// Implements TC-COMP-011
describe("form family is scanned and clean (TC-COMP-011)", () => {
  it.each(FORM_FAMILY_FILES)("%s exists, is scanned and holds no literal", (relPath) => {
    const source = readFileSync(path.join(REPO_ROOT, relPath), "utf-8");
    expect(isScannedSource(relPath)).toBe(true);
    expect(SCANNED_DIRECTORIES.some((directory) => relPath.startsWith(directory))).toBe(true);
    expect(literalsIn(relPath, source)).toEqual([]);
  });

  it("finds a shipped literal planted in a vendored file", () => {
    const planted = 'const a = "min-h-[80px]";';
    expect(literalsIn("web/src/components/ui/textarea.tsx", planted)).toEqual([
      "web/src/components/ui/textarea.tsx: 80px",
    ]);
  });
});

// The command palette's sources are scanned too (CAP-003-E3-S5, DAC-E3-S5-4).
const PALETTE_DIRECTORY = "web/src/app/command-palette/";

// Implements TC-COMP-084
describe("command-palette sources are scanned (TC-COMP-084, DAC-E3-S5-4, AC-26)", () => {
  it("(a) scans the directory and finds its six sources but not its tests", () => {
    expect(SCANNED_DIRECTORIES).toContain(PALETTE_DIRECTORY);
    const files = scannedFiles().filter((relPath) => relPath.startsWith(PALETTE_DIRECTORY));
    for (const name of [
      "index.tsx",
      "use-stock-search.ts",
      "universes.ts",
      "pages.ts",
      "targets.ts",
      "copy.ts",
    ]) {
      expect(files).toContain(`${PALETTE_DIRECTORY}${name}`);
    }
    expect(isScannedSource(`${PALETTE_DIRECTORY}command-palette.test.tsx`)).toBe(false);
    expect(isScannedSource(`${PALETTE_DIRECTORY}use-stock-search.test.ts`)).toBe(false);
  });

  it("(b) finds a literal planted in a palette source", () => {
    const planted = `${PALETTE_DIRECTORY}planted.tsx`;
    expect(literalsIn(planted, 'const x = "12px";')).toEqual([`${planted}: 12px`]);
  });

  it("(c) allows the command width only inside the vendored component", () => {
    expect(literalsIn(`${PALETTE_DIRECTORY}index.tsx`, "max-w-[560px]")).toEqual([
      `${PALETTE_DIRECTORY}index.tsx: 560px`,
    ]);
    expect(literalsIn("web/src/components/ui/command.tsx", "max-w-[560px]")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The layout rule (DAC-E3-16, DAC-E3-S2-4): the seven approved-specification
// layout values are written in web/src/app/layout.ts and nowhere else.
// ---------------------------------------------------------------------------

/** The seven values, written out independently of `LAYOUT`. */
const LAYOUT_LITERALS = ["208px", "1180px", "260px", "300px", "28px", "16px", "70ch"];
const LAYOUT_RULE_ROOT = "web/src/";
/**
 * The module itself, and CAP-002's research screens as a directory prefix
 * (capability section 5 leaves them alone; DEC-0321).
 */
const LAYOUT_RULE_EXEMPT = ["web/src/app/layout.ts", "web/src/screens/research/"];

const LAYOUT_LENGTH = /(?<![\w.-])(208|1180|260|300|28|16)px\b/g;
const LAYOUT_MEASURE = /(?<![\w.-])70ch\b/g;

/** Every whole layout value in a source, as `"<relPath>: <value>"`. */
function layoutLiteralsIn(
  relPath: string,
  source: string,
  exempt: readonly string[] = LAYOUT_RULE_EXEMPT,
): string[] {
  if (exempt.some((entry) => relPath === entry || relPath.startsWith(entry))) {
    return [];
  }
  return [...source.matchAll(LAYOUT_LENGTH), ...source.matchAll(LAYOUT_MEASURE)].map(
    (match) => `${relPath}: ${match[0]}`,
  );
}

function sourcesUnder(relDirectory: string): string[] {
  const walk = (directory: string): string[] =>
    readdirSync(path.join(REPO_ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
      const relPath = `${directory.replace(/\/$/, "")}/${entry.name}`;
      return entry.isDirectory() ? walk(relPath) : isScannedSource(relPath) ? [relPath] : [];
    });
  return walk(relDirectory);
}

const PLANTED_APP = "web/src/app/planted.tsx";

// Implements TC-COMP-072
describe("layout rule (DAC-E3-16, DAC-E3-S2-4)", () => {
  it("finds no layout value outside layout.ts and CAP-002's research screens, and scans many sources", () => {
    const files = sourcesUnder(LAYOUT_RULE_ROOT);
    expect(files.length).toBeGreaterThan(50);
    expect(files).toContain("web/src/app/shell.tsx");
    expect(files).toContain("web/src/screens/research/stocks/index.tsx");
    const offenders = files.flatMap((relPath) =>
      layoutLiteralsIn(relPath, readFileSync(path.join(REPO_ROOT, relPath), "utf-8")),
    );
    expect(offenders).toEqual([]);
  });

  it.each(LAYOUT_LITERALS)("rejects a planted %s", (value) => {
    expect(layoutLiteralsIn(PLANTED_APP, `const x = "${value}";`)).toEqual([
      `${PLANTED_APP}: ${value}`,
    ]);
  });

  it("exempts layout.ts and the research directory, and no look-alike", () => {
    const source = 'const a = "max-w-[1180px]";';
    expect(layoutLiteralsIn("web/src/app/layout.ts", source)).toEqual([]);
    expect(layoutLiteralsIn("web/src/screens/research/stocks/index.tsx", source)).toEqual([]);
    expect(layoutLiteralsIn("web/src/screens/home/index.tsx", source)).toEqual([
      "web/src/screens/home/index.tsx: 1180px",
    ]);
    expect(layoutLiteralsIn("web/src/screens/researcher.tsx", source)).toEqual([
      "web/src/screens/researcher.tsx: 1180px",
    ]);
  });

  it.each(["w-[116px]", "w-[128px]", "1280px", "p-[2.16px]", "170ch", "16pxs", "208pxx", "70chx"])(
    "matches whole values only: %s",
    (source) => {
      expect(layoutLiteralsIn(PLANTED_APP, source)).toEqual([]);
    },
  );

  it.each(["16 px", "--space-4", "h-4"])("ignores %s", (source) => {
    expect(layoutLiteralsIn(PLANTED_APP, source)).toEqual([]);
  });

  it("LAYOUT holds the seven values, in order", () => {
    expect(LAYOUT).toEqual({
      railWidth: "208px",
      contentMaxWidth: "1180px",
      sideColumnMin: "260px",
      sideColumnMax: "300px",
      markerSize: "28px",
      railIconSize: "16px",
      explanationMeasure: "70ch",
    });
    expect(Object.keys(LAYOUT)).toEqual([
      "railWidth",
      "contentMaxWidth",
      "sideColumnMin",
      "sideColumnMax",
      "markerSize",
      "railIconSize",
      "explanationMeasure",
    ]);
  });

  it("CAP-002's research screens are the only exempt directory", () => {
    expect(LAYOUT_RULE_EXEMPT).toEqual(["web/src/app/layout.ts", "web/src/screens/research/"]);
    const offenders = sourcesUnder("web/src/screens/research/").flatMap((relPath) =>
      layoutLiteralsIn(relPath, readFileSync(path.join(REPO_ROOT, relPath), "utf-8"), []),
    );
    expect(offenders).toEqual([
      "web/src/screens/research/stocks/index.tsx: 1180px",
      "web/src/screens/research/stocks/index.tsx: 1180px",
    ]);
  });
});

// Implements TC-COMP-110
describe("setup screen is scanned (TC-COMP-110, DAC-E4-S2-3)", () => {
  it("(a) widens the scan to the setup directory", () => {
    expect(SCANNED_DIRECTORIES).toContain("web/src/screens/setup/");
  });

  it("(b) scans every setup source and no test file, and finds no literal in any", () => {
    const directory = "web/src/screens/setup/";
    const files = scannedFiles().filter((relPath) => relPath.startsWith(directory));
    for (const name of [
      "draft.tsx",
      "use-setup-state.ts",
      "copy.ts",
      "step-list.tsx",
      "step-card.tsx",
      "step-market-data.tsx",
      "step-history-depth.tsx",
    ]) {
      expect(files).toContain(`${directory}${name}`);
    }
    expect(files.filter((relPath) => /\.test\.tsx?$/.test(relPath))).toEqual([]);
    for (const relPath of files) {
      expect(literalsIn(relPath, readFileSync(path.join(REPO_ROOT, relPath), "utf-8"))).toEqual([]);
    }
  });

  it("(c) finds a literal planted in a setup source", () => {
    const planted = "web/src/screens/setup/planted.tsx";
    expect(literalsIn(planted, 'export const x = "p-[12px]";')).toEqual([`${planted}: 12px`]);
  });
});

// Implements TC-COMP-144
describe("home screen is scanned (TC-COMP-144, DAC-E5-S3-4)", () => {
  it("(a) widens the scan to the home directory", () => {
    expect(SCANNED_DIRECTORIES).toContain("web/src/screens/home/");
  });

  it("(b) scans every home source and no test file, and finds no literal in any", () => {
    const directory = "web/src/screens/home/";
    const files = scannedFiles().filter((relPath) => relPath.startsWith(directory));
    for (const name of [
      "index.tsx",
      "needs-you-card.tsx",
      "header.tsx",
      "market-state.ts",
      "copy.ts",
      "data-tile.tsx",
    ]) {
      expect(files).toContain(`${directory}${name}`);
    }
    expect(files.filter((relPath) => /\.test\.tsx?$/.test(relPath))).toEqual([]);
    for (const relPath of files) {
      expect(literalsIn(relPath, readFileSync(path.join(REPO_ROOT, relPath), "utf-8"))).toEqual([]);
    }
  });

  it("(c) finds a literal planted in a home source", () => {
    const planted = "web/src/screens/home/planted.tsx";
    expect(literalsIn(planted, 'export const x = "p-[12px]";')).toEqual([`${planted}: 12px`]);
  });
});
