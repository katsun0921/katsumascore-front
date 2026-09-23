export const messages = {
  search: {
    label: { ja: 'タイトル・あらすじで絞り込む', en: 'Filter by title or synopsis' },
    placeholder: { ja: '作品名を入力…', en: 'Type a title…' },
    clear: { ja: '検索条件をクリア', en: 'Clear search' },
  },
  vod: {
    label: { ja: '配信サービスで絞り込む', en: 'Filter by streaming service' },
    all: { ja: 'すべて', en: 'All' },
  },
  index: {
    title: { ja: '作品インデックス', en: 'Title index' },
    toggle: { ja: '作品インデックスを開閉する', en: 'Toggle title index' },
  },
  result: {
    /** `{shown}` / `{total}` をプレースホルダとして差し替える */
    count: { ja: '{total}作品中 {shown}件を表示', en: 'Showing {shown} of {total} titles' },
    empty: {
      ja: '条件に合う作品が見つかりませんでした。条件を変えてお試しください。',
      en: 'No titles match your filters. Try changing them.',
    },
    reset: { ja: '条件をリセット', en: 'Reset filters' },
  },
  card: {
    official: { ja: '公式サイト', en: 'Official site' },
  },
} as const;
