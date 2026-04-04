import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import uiPlugin from './eslint-rules/index.mjs'

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

    rules: {
      // Components must not call fetch() — data belongs in lib/ or page props
      'katsumascore-ui/no-fetch-in-component': 'error',

      // No hex colors in JSX inline styles — use SCSS variables or CSS tokens
      'katsumascore-ui/no-hardcoded-hex-color': 'error',

      // No variant prop with layout values (grid/list/overlay/left/right/…)
      // Separate components should be created for each layout variant
      'katsumascore-ui/no-variant-layout-prop': 'error',

      // PostSection must never import or render PostCard directly
      'katsumascore-ui/no-postsection-direct-postcard': 'error',

      // PostList must not own section headings (h1–h3)
      'katsumascore-ui/no-postlist-section-title': 'error',

      // Enforce strict TypeScript — no implicit any allowed
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
])

export default eslintConfig
