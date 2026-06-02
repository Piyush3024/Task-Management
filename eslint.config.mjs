import js from '@eslint/js';
import globals from 'globals';

export default [
  
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2025,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',

      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      'no-var': 'error',
      'prefer-const': 'error',

      eqeqeq: ['error', 'always'],

      'no-promise-executor-return': 'error',

      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
];
