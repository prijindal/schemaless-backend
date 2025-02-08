import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: globals.browser }},
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];