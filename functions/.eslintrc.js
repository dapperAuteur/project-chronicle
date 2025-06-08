// functions/.eslintrc.js
module.exports = {
  root: true, // This is crucial: Stops ESLint from looking up the directory tree
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // DO NOT add 'next' or 'next/core-web-vitals' here
  ],
  globals: {
    // Add any global variables if needed for Firebase Functions (e.g., functions, admin)
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Ensure these paths correctly point to your functions' tsconfig files
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Add/customize rules specific to your functions
    // e.g., 'no-unused-vars': 'off', // Use TypeScript specific rule
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'indent': ['error', 2], // Example: 2-space indentation
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore compiled JavaScript files
    '*.d.ts',    // Ignore TypeScript declaration files
  ],
};