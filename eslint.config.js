const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    // Target source TypeScript files (excluding specs)
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // Enforces 'Component' suffix on @Component classes
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['Component'],
        },
      ],
      // Enforces 'Directive' suffix on @Directive classes
      '@angular-eslint/directive-class-suffix': [
        'error',
        {
          suffixes: ['Directive'],
        },
      ],
      '@angular-eslint/prefer-signals': [
        'warn',
        {
          preferReadonlySignalProperties: true,
        },
      ],
      '@angular-eslint/component-max-inline-declarations': [
        'warn',
        {
          styles: 0,
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
    },
  },
  {
    // Dedicated block for test files using tsconfig.spec.json
    files: ['src/**/*.spec.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/no-inline-styles': [
        'warn',
        {
          allowBindToStyle: false,
        },
      ],
    },
  },
]);
