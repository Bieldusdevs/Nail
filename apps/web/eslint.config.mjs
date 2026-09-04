import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "node:url";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "playwright-report/**", "test-results/**", "next-env.d.ts"]),
  {
    settings: {
      next: { rootDir: fileURLToPath(new URL(".", import.meta.url)) },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
]);
