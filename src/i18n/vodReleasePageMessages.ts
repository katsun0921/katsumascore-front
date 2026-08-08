export const messages = {
  head: {
    archiveTitle: {
      ja: "VOD配信情報 | KatsumaScore",
      en: "Streaming Releases | KatsumaScore",
    },
    archiveDescription: {
      ja: "毎週の配信開始作品をサービス別にまとめています。",
      en: "Weekly roundups of new titles by streaming service.",
    },
    detailDescriptionFallback: {
      ja: "今週配信開始となったVOD作品のまとめ。",
      en: "A roundup of titles newly available to stream this week.",
    },
  },
  archive: {
    kicker: { ja: "VOD RELEASE", en: "VOD RELEASE" },
    title: { ja: "VOD配信情報", en: "Streaming Releases" },
    lead: {
      ja: "毎週の配信開始作品をサービス別にまとめています。",
      en: "Weekly roundups of new titles by streaming service.",
    },
    empty: {
      ja: "まだ配信情報の記事がありません。",
      en: "No streaming roundups have been published yet.",
    },
  },
  breadcrumb: {
    home: { ja: "ホーム", en: "Home" },
    vodRelease: { ja: "VOD配信情報", en: "Streaming Releases" },
  },
  detail: {
    publishedAt: { ja: "公開日", en: "Published" },
    backToArchive: { ja: "配信情報の一覧へ", en: "All streaming roundups" },
    findByService: { ja: "配信サービスから探す", en: "Browse by service" },
    theaterRelease: { ja: "劇場公開情報を見る", en: "Theatrical releases" },
  },
} as const;
