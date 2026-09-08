// @vitest-environment node
//
// This file drives a real esbuild-backed Vite build. jsdom's environment
// (the suite default) monkey-patches globals such as `TextEncoder` in a way
// that breaks esbuild's own invariant checks, so this file opts back into
// Node's real environment.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild, resolveConfig } from "vite";
import { describe, expect, it } from "vitest";

// TC-COMP-334 (DAC-E1-S4-6): `npm run build` output lands in the API
// package's static directory, so one image serves both the API and the
// bundle. Asserted against the resolved Vite configuration and a real build,
// not by re-reading `vite.config.ts` as text — a config regression (wrong
// `outDir`, or `emptyOutDir` reverting to `true` and deleting the tracked
// `.gitkeep`, as happened in IR-001) must fail this test.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const VITE_CONFIG = path.join(REPO_ROOT, "vite.config.ts");
const STATIC_DIR = path.join(REPO_ROOT, "src/factorflow/api/static");
const GITKEEP = path.join(STATIC_DIR, ".gitkeep");

describe("Build output — lands in the API static directory (DAC-E1-S4-6)", () => {
  it("resolves outDir to the API package's static directory with emptyOutDir disabled", async () => {
    const config = await resolveConfig({ configFile: VITE_CONFIG }, "build");

    expect(path.resolve(config.root, config.build.outDir)).toBe(STATIC_DIR);
    // `emptyOutDir: true` is what deleted the tracked `.gitkeep` in IR-001 —
    // this directly guards against that regression, not just its symptom.
    expect(config.build.emptyOutDir).toBe(false);
  });

  it("a real build places index.html in the static directory and leaves its tracked marker intact", async () => {
    const gitkeepBefore = existsSync(GITKEEP) ? readFileSync(GITKEEP) : null;
    expect(
      gitkeepBefore,
      "src/factorflow/api/static/.gitkeep must exist before the build",
    ).not.toBeNull();

    await viteBuild({ configFile: VITE_CONFIG, logLevel: "silent" });

    expect(existsSync(path.join(STATIC_DIR, "index.html"))).toBe(true);
    expect(existsSync(GITKEEP), "the build must not delete the tracked .gitkeep marker").toBe(true);
    expect(readFileSync(GITKEEP)).toEqual(gitkeepBefore);
  });
});
