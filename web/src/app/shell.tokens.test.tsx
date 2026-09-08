import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// TC-COMP-331 (DAC-E1-S4-3, STD-UI-29): every spacing/type value in the
// shell comes from the defined token scale. This is a static scan of the
// source rather than a rendering assertion — consistent with the story's
// "introduces no spacing value outside the scale" wording and the task
// plan's note that this is closer to a lint check than a render check.
const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const SHELL_SOURCE = path.join(APP_DIR, "shell.tsx");
// The Tailwind config is the actual boundary of the token scale (DAC-E1-S4-3
// governs "any spacing or type value in the shell", not only shell.tsx's own
// literals) — an off-scale value added here would silently pass a scan
// confined to shell.tsx alone. Resolved relative to the repo root since
// Vitest's root is `web/`.
const TAILWIND_CONFIG = path.join(APP_DIR, "../../../tailwind.config.js");

// Matches a literal CSS length (px, rem, em) or a bare pixel-like number
// that is not already wrapped in `var(--...)`.
const LITERAL_LENGTH = /(?<!--[\w-]*)\b\d+(\.\d+)?(px|rem|em)\b/;

describe("Shell — token discipline (DAC-E1-S4-3, STD-UI-29)", () => {
  it("shell.tsx introduces no literal spacing or type value outside theme.css's scale", () => {
    const source = readFileSync(SHELL_SOURCE, "utf-8");
    const offendingLines = source
      .split("\n")
      .map((line, index) => ({ line, index: index + 1 }))
      .filter(({ line }) => LITERAL_LENGTH.test(line));

    expect(offendingLines).toEqual([]);
  });

  it("tailwind.config.js's spacing, fontSize, and height scales resolve only to theme.css custom properties", async () => {
    const config = (await import(TAILWIND_CONFIG)).default;
    const scales = {
      spacing: config.theme?.extend?.spacing ?? {},
      fontSize: config.theme?.extend?.fontSize ?? {},
      height: config.theme?.extend?.height ?? {},
    };

    const nonTokenValues: string[] = [];
    for (const [scaleName, scale] of Object.entries(scales)) {
      for (const [key, value] of Object.entries(scale as Record<string, string>)) {
        if (!/^var\(--[\w-]+\)$/.test(value)) {
          nonTokenValues.push(`${scaleName}.${key} = ${value}`);
        }
      }
    }

    expect(nonTokenValues).toEqual([]);
  });
});
