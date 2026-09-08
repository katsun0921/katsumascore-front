export const messages = {
  head: {
    title: {
      ja: "劇場公開中の作品 | KatsumaScore",
      en: "Now Showing in Theaters | KatsumaScore",
    },
    description: {
      ja: "いま映画館で上映中の作品のレビュー一覧。劇場公開日順・評価順で絞り込めます。",
      en: "Reviews of films currently showing in theaters — sort by release date or rating.",
    },
  },
  page: {
    kicker: { ja: "NOW SHOWING", en: "NOW SHOWING" },
    title: { ja: "劇場公開中の作品", en: "Now Showing in Theaters" },
    lead: {
      ja: "いま映画館で上映中の作品を、劇場公開日の新しい順に紹介します。",
      en: "Films currently in theaters, listed by their opening date.",
    },
  },
  filterOptions: {
    release: { ja: "公開日順", en: "By Release Date" },
    new: { ja: "新着", en: "New" },
    score: { ja: "評価順", en: "By Rating" },
    category: { ja: "カテゴリ", en: "Category" },
    genre: { ja: "ジャンル", en: "Genre" },
    tag: { ja: "タグ", en: "Tag" },
  },
} as const;
