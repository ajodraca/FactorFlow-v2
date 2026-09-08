import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    root: "web",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    passWithNoTests: true,
  },
});
