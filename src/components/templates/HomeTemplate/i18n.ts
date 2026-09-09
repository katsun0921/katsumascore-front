export const messages = {
  ranking: {
    title: { ja: 'TOP 10 ランキング', en: 'TOP 10 Ranking' },
  },
  cardScrollList: {
    latest: { ja: '最新レビュー', en: 'Latest Reviews' },
    nowShowing: { ja: '劇場公開中', en: 'Now Showing' },
    anime: { ja: '注目のアニメ', en: 'Spotlight Anime' },
    highScore: { ja: '高評価作品', en: 'Top Rated' },
  },
  shorts: {
    title: { ja: 'ショート動画で紹介', en: 'Intro Shorts' },
  },
  recommend: {
    title: { ja: 'こちらもおすすめ', en: 'More to Explore' },
    seeAll: { ja: 'すべて見る →', en: 'See all →' },
  },
  featured: {
    title: { ja: '特集', en: 'Features' },
  },
  vodFinder: {
    title: { ja: 'VODで探す', en: 'Find on VOD' },
    workCountSuffix: { ja: '作品', en: ' titles' },
  },
  youtubeFree: {
    title: { ja: 'YouTubeで無料配信中', en: 'Free on YouTube' },
    free: { ja: '無料', en: 'FREE' },
    note: {
      ja: '公式チャンネルの期間限定公開です。予告なく終了することがあります。',
      en: 'Limited-time releases on official channels. They may end without notice.',
    },
    new: { ja: 'NEW', en: 'NEW' },
    watch: { ja: 'YouTubeで観る →', en: 'Watch on YouTube →' },
    startedAtSuffix: { ja: '〜 公開中', en: '– now streaming' },
  },
  releaseHighlight: {
    theaterTitle: { ja: '今週の劇場公開', en: 'In Theaters This Week' },
    vodTitle: { ja: '今週のVOD配信開始', en: 'New on Streaming This Week' },
    seeAll: { ja: 'まとめ記事を見る →', en: 'Read the roundup →' },
  },
} as const;
