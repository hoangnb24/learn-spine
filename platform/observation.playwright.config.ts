import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/observation/browser",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4181",
    viewport: { width: 1400, height: 1000 },
  },
  webServer: {
    command: "npm run dev -- --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
  },
});
