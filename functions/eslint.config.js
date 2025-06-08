const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    // Add ESLint config files to the ignores list.
    ignores: ["lib/", "node_modules/", "eslint.config.js", ".eslintrc.js"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "tsconfig.json",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];