import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
  {
    ignores: ["dist/**", "doc/**", "types/**", "example/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "max-lines-per-function": ["error", { max: 30, skipComments: true, skipBlankLines: true }],
      complexity: ["error", 15],
    },
  },
  {
    files: ["tests/**/*.test.ts"],
    rules: {
      "max-lines-per-function": "off",
      complexity: "off",
    },
  },
];
