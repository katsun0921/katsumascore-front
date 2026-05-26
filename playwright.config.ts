import { defineConfig, devices } from 'playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
