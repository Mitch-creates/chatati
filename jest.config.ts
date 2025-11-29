import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Use node environment for API route tests
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  // Explicitly add moduleNameMapper for @ alias (nextJest should handle this, but adding as fallback)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
