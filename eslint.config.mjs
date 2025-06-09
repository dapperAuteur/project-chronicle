// eslint.config.mjs
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['.next/'],
  },
  
  // Base configuration for all TypeScript files
  ...tseslint.configs.recommended,

  // Configuration specific to Next.js
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Apply Next.js recommended rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      
      // Keep the rule you wanted disabled
      "prefer-const": "off",

      // Optional: A helpful rule to warn about unused variables
      "@typescript-eslint/no-unused-vars": "warn",
    },
  }
);
