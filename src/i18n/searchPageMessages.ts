export const searchPageMessages = {
  pageTitle: { ja: '検索結果', en: 'Search results' },
  breadcrumb: {
    home: { ja: 'ホーム', en: 'Home' },
  },
  category: {
    label: { ja: '検索', en: 'Search' },
  },
  filters: {
    all: { ja: 'すべて', en: 'All' },
    actor: { ja: '出演者', en: 'Actor' },
    director: { ja: '監督', en: 'Director' },
    genre: { ja: 'ジャンル', en: 'Genre' },
  },
  emptyQuery: {
    ja: 'キーワードを入力して検索してください。',
    en: 'Enter a keyword to search.',
  },
  loading: { ja: '読み込み中…', en: 'Loading…' },
  emptyResults: { ja: '記事が見つかりませんでした。', en: 'No posts found.' },
  categoryDescription: {
    ja: 'タイトル・出演者・監督・ジャンルに基づき関連度の高い順に並べています。',
    en: 'Ranked by relevance to title, cast, director, and genre.',
  },
} as const;
