/**
 * Header i18n — Phase 1: component-local messages
 *
 * Key structure mirrors the UI structure (not semantic meaning).
 * Access via path array: t(messages, ['logo', 'alt'], locale)
 */

export const messages = {
  logo: {
    alt: {
      ja: 'KatsumaScore',
      en: 'KatsumaScore',
    },
  },
  search: {
    placeholder: {
      ja: '映画・ドラマを検索',
      en: 'Search movies & series',
    },
  },
  cta: {
      watch: {
      ja: '動画配信を探す',
      en: 'Find Streaming',
    },
  },
} as const
