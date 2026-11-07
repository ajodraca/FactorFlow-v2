import { readFileSync } from "node:fs";
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

  it("names only tokens that theme.css declares", async () => {
    const config = await loadConfig();
    const theme = readFileSync(THEME_CSS, "utf-8");
    const declared = new Set([...theme.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
    const offenders: string[] = [];
    for (const scale of ["colors", "borderRadius", "ringWidth", "backgroundImage"]) {
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
