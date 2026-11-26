import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // Pre-existing violations in app code; surfaced as warnings so lint is
    // usable in CI without a refactor. Tighten to "error" once cleaned up.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["tailwind.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
