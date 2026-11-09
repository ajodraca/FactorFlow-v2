import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const UI_DIR = path.dirname(fileURLToPath(import.meta.url));
// Vitest's root is `web/`, so the repo root is four levels above this file.
const REPO_ROOT = path.resolve(UI_DIR, "../../../..");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

// Implements TC-COMP-004
describe("vendored sources are first-party code (DAC-E1-S1-1)", () => {
  it("imports nothing through an @/ alias, and scans at least one file", () => {
    const files = sourceFiles(UI_DIR);
    expect(files.length).toBeGreaterThan(0);
    const offenders = files
      .filter((file) => /from "@\/|import\("@\//.test(readFileSync(file, "utf-8")))
      .map((file) => path.relative(REPO_ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("adds no path alias to tsconfig.json or vite.config.ts", () => {
    const tsconfig = JSON.parse(readFileSync(path.join(REPO_ROOT, "tsconfig.json"), "utf-8"));
    expect(tsconfig.compilerOptions.paths).toBeUndefined();
    expect(tsconfig.compilerOptions.baseUrl).toBeUndefined();
    expect(readFileSync(path.join(REPO_ROOT, "vite.config.ts"), "utf-8")).not.toContain("alias");
  });
});

// The five packages this story adds, and the licence each must carry in
// package-lock.json (tech stack v7 Key Libraries; DEC-0298).
const ADDED_PACKAGES = [
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "lucide-react",
  "@radix-ui/react-slot",
];
const APPROVED_PACKAGES = [
  "react",
  "react-dom",
  "react-router-dom",
  "cmdk",
  "sonner",
  "@tanstack/react-table",
  "react-hook-form",
  "zod",
  "@hookform/resolvers",
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "lucide-react",
];
const LICENCE_OVERRIDES: Record<string, string> = {
  "class-variance-authority": "Apache-2.0",
  "lucide-react": "ISC",
};

// Implements TC-COMP-008
describe("package.json dependencies and licences (DAC-E1-12, DAC-E1-S1-5)", () => {
  const manifest = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8"));
  const lock = JSON.parse(readFileSync(path.join(REPO_ROOT, "package-lock.json"), "utf-8"));
  const dependencies = Object.keys(manifest.dependencies);

  it("lists the five packages the vendored components need", () => {
    const missing = ADDED_PACKAGES.filter((name) => !dependencies.includes(name));
    expect(missing).toEqual([]);
  });

  it("lists only approved packages", () => {
    const unapproved = dependencies.filter(
      (name) => !APPROVED_PACKAGES.includes(name) && !/^@radix-ui\/react-[a-z-]+$/.test(name),
    );
    expect(unapproved).toEqual([]);
  });

  it("records the expected licence for every dependency in package-lock.json", () => {
    const wrong = dependencies
      .map((name) => ({
        name,
        expected: LICENCE_OVERRIDES[name] ?? "MIT",
        actual: lock.packages[`node_modules/${name}`]?.license,
      }))
      .filter(({ expected, actual }) => actual !== expected)
      .map(({ name, expected, actual }) => `${name}: ${actual} (expected ${expected})`);
    expect(wrong).toEqual([]);
  });
});
