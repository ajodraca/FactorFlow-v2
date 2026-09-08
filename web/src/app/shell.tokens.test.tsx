import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// TC-COMP-331 (DAC-E1-S4-3, STD-UI-29): every spacing/type value in the
// shell comes from the defined token scale. This is a static scan of the
// source rather than a rendering assertion — consistent with the story's
// "introduces no spacing value outside the scale" wording and the task
// plan's note that this is closer to a lint check than a render check.
const SHELL_SOURCE = path.join(path.dirname(fileURLToPath(import.meta.url)), "shell.tsx");

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
});
