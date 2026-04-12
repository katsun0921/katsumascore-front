// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import uiPlugin from './eslint-rules/index.mjs'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'storybook-static/**',
    'next-env.d.ts',
    'node_modules/**',
    'katsumascore_design_system/**',
    'katsumascore_wordpress_theme/**',
    'docs/**',
  ]),
  // ─────────────────────────────────────────────────────────────────────────────
  // katsumascore-ui: Architecture enforcement rules
  //
  // These rules protect component responsibility boundaries, styling conventions,
  // and variant patterns. Violations are errors, not warnings — they signal a
  // design decision that must be reconsidered, not just cleaned up later.
  // ─────────────────────────────────────────────────────────────────────────────
  {
    plugins: {
      'katsumascore-ui': uiPlugin,
    },

    files: ['src/components/**/*.tsx', 'src/components/**/*.ts'],
    ignores: ['**/*.stories.tsx', '**/*.stories.ts'],

    rules: {
      // Components must not call fetch() — data belongs in lib/ or page props
      'katsumascore-ui/no-fetch-in-component': 'error',

      // No hex colors in JSX inline styles — use SCSS variables or CSS tokens
      'katsumascore-ui/no-hardcoded-hex-color': 'error',

      // No hardcoded font-family — use design tokens (var(--font-*))
      'katsumascore-ui/no-hardcoded-font-family': 'error',

      // No variant prop with layout values (grid/list/overlay/left/right/…)
      // Separate components should be created for each layout variant
      'katsumascore-ui/no-variant-layout-prop': 'error',

      // PostSection must never import or render PostCard directly
      'katsumascore-ui/no-postsection-direct-postcard': 'error',

      // PostList must not own section headings (h1–h3)
      'katsumascore-ui/no-postlist-section-title': 'error',

      // Enforce strict TypeScript — no implicit any allowed
      '@typescript-eslint/no-explicit-any': 'error',

      // UI text must go through i18n.ts — no hardcoded Japanese or English words
      // Phase 1: warn (will be promoted to error once coverage is sufficient)
      'katsumascore-ui/no-hardcoded-i18n': 'warn',

      // No direct font-size values — use design tokens (var(--font-size-*))
      'katsumascore-ui/no-direct-font-size': 'error',

      // No arbitrary spacing, hardcoded breakpoints, max-width, or inline spacing props
      'katsumascore-ui/no-design-violation': 'error',
    },
    // ■ i18nファイルだけ例外
      files: ['**/i18n*.ts'],
      rules: {
        'katsumascore-ui/no-hardcoded-i18n': 'off',
      },
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Arrow functions only — no function declarations or named function expressions
  // Applies to all src/ TS/TSX files (stories excluded)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['**/*.stories.tsx', '**/*.stories.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration',
          message: 'Use arrow functions instead of function declarations.',
        },
        {
          selector: 'FunctionExpression:not([async]):not([generator])',
          message: 'Use arrow functions instead of function expressions.',
        },
      ],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // unused-imports: Auto-fixable unused import detection
  // ─────────────────────────────────────────────────────────────────────────────
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
    },
  },
  ...storybook.configs["flat/recommended"]
])

export default eslintConfig
