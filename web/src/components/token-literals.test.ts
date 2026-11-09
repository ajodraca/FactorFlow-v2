import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

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
export const SCANNED_DIRECTORIES: readonly string[] = ["web/src/components/"];

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
