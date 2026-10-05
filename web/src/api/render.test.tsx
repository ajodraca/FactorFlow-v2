import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const THIS_FILE = fileURLToPath(import.meta.url);
const WEB_SRC = path.resolve(path.dirname(THIS_FILE), "..");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

// Characterization (owner-web-app section 7, "No raw HTML injection"): text
// from the API, reasons included, only ever reaches the DOM as React text
// children (DAC-E7-S4-5). The rendered counterpart is TC-COMP-096 in
// web/src/screens/runs/run-detail.reason.test.tsx.
describe("No raw HTML injection under web/src (DAC-E7-S4-5)", () => {
  it("no source file uses dangerouslySetInnerHTML", () => {
    const files = sourceFiles(WEB_SRC).filter((file) => file !== THIS_FILE);
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((file) =>
      readFileSync(file, "utf-8").includes("dangerouslySetInnerHTML"),
    );
    expect(offenders).toEqual([]);
  });
});
