export const messages = {
  placeholder: {
    loading: { ja: '読み込み中...', en: 'Loading...' },
  },
  tabs: {
    label: { ja: 'SNS タブ', en: 'SNS tabs' },
    x: { ja: 'X', en: 'X' },
    youtube: { ja: 'YouTube', en: 'YouTube' },
    instagram: { ja: 'Instagram', en: 'Instagram' },
    tiktok: { ja: 'TikTok', en: 'TikTok' },
  },
  iframe: {
    youtubeTitle: { ja: '公式 YouTube', en: 'Official YouTube' },
    instagramTitle: { ja: '公式 Instagram', en: 'Official Instagram' },
    tiktokTitle: { ja: '公式 TikTok', en: 'Official TikTok' },
  },
  fallback: {
    xLink: { ja: 'X（Twitter）公式アカウントを見る', en: 'View official X account' },
  },
  /** ACF `link` を iframe 下に出すときのラベル */
  officialLink: {
    x: { ja: '公式 X を開く', en: 'Open official X' },
    instagram: { ja: '公式 Instagram を開く', en: 'Open official Instagram' },
    tiktok: { ja: '公式 TikTok を開く', en: 'Open official TikTok' },
  },
} as const;
