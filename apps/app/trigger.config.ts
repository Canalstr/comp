import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_wgdljccidbnmvlmnokjq",
  logLevel: "log",
  maxDuration: 300, // 5 minutes
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/jobs', './src/trigger'],
});