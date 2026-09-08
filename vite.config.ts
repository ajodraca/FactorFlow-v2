import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `root: "web"` and `build.outDir` pointing into the API package's static
// directory (component design section 2.1) so the application container
// ships one image carrying both the API and the bundle (DAC-E1-S4-6).
//
// `emptyOutDir` is deliberately `false`: the default `true` wipes the whole
// `outDir` before each build, including the tracked `.gitkeep` that is the
// only thing keeping `src/factorflow/api/static/` in version control
// (CAP-001-E1-S6). Vite still overwrites `index.html` and `assets/` on every
// build; it just no longer deletes files it didn't produce.
export default defineConfig({
  root: "web",
  plugins: [react()],
  build: {
    outDir: "../src/factorflow/api/static",
    emptyOutDir: false,
  },
});
