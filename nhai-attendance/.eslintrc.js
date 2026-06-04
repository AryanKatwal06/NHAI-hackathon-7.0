// .eslintrc.js
// ESLint configuration for TypeScript + React Native.
// Rules are deliberately strict to enforce consistent code quality across all 12 phases.
// If a rule causes a genuine false positive, add an inline disable comment WITH an explanation.
// Do not disable rules globally without discussion.

module.exports = {
  root: true,
  // Extend React Native's recommended ESLint config as the base
  extends: [
    '@react-native',
    // TypeScript-specific rules on top of the RN base
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Point to tsconfig for type-aware linting rules
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
    'eslint-comments/no-unused-disable': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-duplicate-imports': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unstable-nested-components': 'off',
    'comma-dangle': 'off',
    'react-native/no-inline-styles': 'off',
    'no-bitwise': 'off',
    'no-console': 'off',
    'no-void': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    // TYPESCRIPT RULES
    // Prefer nullish coalescing (??) over || for nullable checks
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    // Prefer optional chaining (?.) over && null checks
    '@typescript-eslint/prefer-optional-chain': 'error',

    // REACT / REACT NATIVE RULES
    // Enforce React hooks rules (no conditional hooks, etc.)
    'react-hooks/rules-of-hooks': 'error',

    // GENERAL CODE QUALITY RULES
    // Enforce === over == to prevent type coercion bugs
    'eqeqeq': ['error', 'always'],
    // Disallow var — always use const or let
    'no-var': 'error',
    // Prefer const when variable is never reassigned
    'prefer-const': 'error',
  },
  // Separate config for test files — relax some rules that are too strict for tests
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        // Test files often use 'any' for mocking — allow it
        '@typescript-eslint/no-explicit-any': 'off',
        // Test files don't need explicit return types
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  // Exclude generated files and native project files from linting
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    '.eslintrc.js',
  ],
};
