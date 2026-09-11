import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e/deformation",
  timeout: 240000,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4196",
    viewport: { width: 1900, height: 1300 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: "npm run dev -- --port 4196 --strictPort",
    url: "http://127.0.0.1:4196",
    reuseExistingServer: false,
  },
});
