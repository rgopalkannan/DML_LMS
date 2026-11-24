import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', 'server/prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      'no-console': 'error',
      eqeqeq: 'error'
    }
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: globals.browser },
    rules: { ...reactHooks.configs.recommended.rules, ...jsxA11y.flatConfigs.recommended.rules }
  },
  {
    /* NestJS injects by constructor parameter types, which an `import type` erases at runtime. */
    files: ['server/**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'off' }
  },
  {
    /* Layer boundary: only the database layer, seed and tests may import Prisma. */
    files: ['server/src/**/*.ts'],
    ignores: ['server/src/database/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{ name: '@prisma/client', message: 'Use IUnitOfWork and repository interfaces instead of Prisma.' }] }]
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx', 'server/test/**/*.ts', 'client/src/test/**/*.tsx'],
    rules: { '@typescript-eslint/explicit-function-return-type': 'off' }
  },
  { files: ['tools/**/*.mjs', 'client/e2e/**/*.mjs'], languageOptions: { globals: globals.node } }
);
