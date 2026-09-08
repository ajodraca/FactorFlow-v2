import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `root: "web"` and `build.outDir` pointing into the API package's static
// directory (component design section 2.1) so the application container
// ships one image carrying both the API and the bundle (DAC-E1-S4-6).
export default defineConfig({
  root: "web",
  plugins: [react()],
  build: {
    outDir: "../src/factorflow/api/static",
    emptyOutDir: true,
  },
});
