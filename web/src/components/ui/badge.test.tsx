import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

const UI_DIR = path.dirname(fileURLToPath(import.meta.url));
// Vitest's root is `web/`, so the repo root is four levels above this file.
const REPO_ROOT = path.resolve(UI_DIR, "../../../..");
const TAILWIND_CONFIG = path.join(REPO_ROOT, "tailwind.config.js");
const THEME_CSS = path.join(REPO_ROOT, "design-system/theme.css");

type Variant = Parameters<typeof Badge>[0]["variant"];

// The expected classes per variant, written out independently of badge.tsx
// (badge spec section 6): each colour utility, and the token it must resolve to.
const FIXTURE: {
  variant: NonNullable<Variant>;
  classes: string[];
  tokens: Record<string, string>;
}[] = [
  ...(["neutral", "active", "good", "warning", "serious", "critical"] as const).map((tier) => ({
    variant: `status-${tier}` as const,
    classes: [`bg-status-${tier}-muted`, `text-status-${tier}`],
    tokens: {
      [`status-${tier}-muted`]: `--status-${tier}-muted`,
      [`status-${tier}`]: `--status-${tier}`,
    },
  })),
  {
    variant: "coverage-present",
    classes: ["bg-status-good-muted", "text-status-good"],
    tokens: { "status-good-muted": "--status-good-muted", "status-good": "--status-good" },
  },
  {
    variant: "coverage-absent",
    classes: ["bg-value-missing-muted", "text-value-missing"],
    tokens: { "value-missing-muted": "--value-missing-muted", "value-missing": "--value-missing" },
  },
  {
    variant: "coverage-unknown",
    classes: [
      "bg-value-indeterminate-muted",
      "bg-pattern-indeterminate",
      "text-value-indeterminate",
    ],
    tokens: {
      "value-indeterminate-muted": "--value-indeterminate-muted",
      "value-indeterminate": "--value-indeterminate",
    },
  },
  {
    variant: "secondary",
    classes: ["bg-secondary", "text-secondary-foreground"],
    tokens: { secondary: "--secondary", "secondary-foreground": "--secondary-foreground" },
  },
];

// Implements TC-COMP-007
describe("badge variants resolve to status and coverage tokens (DAC-E1-S1-4)", () => {
  it.each(FIXTURE)("$variant renders its token classes", ({ variant, classes }) => {
    render(<Badge variant={variant}>Label</Badge>);
    const badge = screen.getByText("Label");
    expect(badge).toHaveAttribute("data-variant", variant);
    for (const expected of classes) {
      expect(badge).toHaveClass(expected);
    }
  });

  it("resolves every colour utility to a token that theme.css declares", async () => {
    const config = (await import(TAILWIND_CONFIG)).default;
    const theme = readFileSync(THEME_CSS, "utf-8");
    const offenders: string[] = [];
    for (const { variant, tokens } of FIXTURE) {
      for (const [key, token] of Object.entries(tokens)) {
        if (config.theme.extend.colors[key] !== `hsl(var(${token}) / <alpha-value>)`) {
          offenders.push(`${variant}: colors.${key} !== hsl(var(${token}) / <alpha-value>)`);
        }
        if (!theme.includes(`${token}:`)) {
          offenders.push(`${variant}: ${token} not declared in theme.css`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("sets its shape from theme tokens, not Tailwind default literals (AC-26)", () => {
    render(<Badge variant="status-good">Label</Badge>);
    const badge = screen.getByText("Label");
    expect(badge).toHaveClass("rounded", "px-2", "py-1", "text-xs", "font-semibold");
    expect(badge.className).not.toMatch(/rounded-/);
    expect(badge.className).not.toMatch(/\b[a-z]+-\d+\.\d+\b/);
  });

  it("is neither a tab stop nor a role", async () => {
    render(<Badge variant="status-good">Label</Badge>);
    const badge = screen.getByText("Label");
    expect(badge).not.toHaveAttribute("tabindex");
    expect(badge).not.toHaveAttribute("role");
    await userEvent.tab();
    expect(badge).not.toHaveFocus();
  });
});
