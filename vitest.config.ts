import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";

loadEnvFile(".env");

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        testTimeout: 20_000,

        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/config/**", "src/server.ts", "src/tests/**"],
            thresholds: {
                lines: 60,
                functions: 60,
                branches: 60,
                statements: 60,
            },
        }
    }
})