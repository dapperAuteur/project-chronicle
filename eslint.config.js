const { FlatCompat } = require("@eslint/eslintrc");
const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const hooksPlugin = require("eslint-plugin-react-hooks");

const compat = new FlatCompat();

module.exports = [
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    languageOptions: {
      ...compat.config({
        extends: [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended",
          "next/core-web-vitals",
        ],
        parser: "@typescript-eslint/parser",
      })[0].languageOptions,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      
      // --- ADD THIS RULE HERE ---
      // This disables the "prefer-const" rule, resolving your warning.
      "prefer-const": "off", 
    },
  },
];
