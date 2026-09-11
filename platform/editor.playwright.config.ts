import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e/editor",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4182",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 1000 },
  },
  reporter: "list",
});
