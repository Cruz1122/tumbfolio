import tseslint from "typescript-eslint";

export default [
    {
      ignores: [
        "**/dist/**",
        "**/.next/**",
        "**/coverage/**",
        "**/node_modules/**",
        "**/drizzle/**"
      ]
    },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        sourceType: "module"
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  }
];
