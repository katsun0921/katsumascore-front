/**
 * レーティング（映倫の年齢区分）の表示ラベル。
 * `code` はバッジに出す短い区分表記、`note` は区分の意味を補う説明文。
 * 英語圏の読み手には映倫の区分名だけでは伝わらないため、en 側で対象年齢を明示する。
 */
export const messages = {
  label: {
    rating: { ja: 'レーティング', en: 'Rating' },
  },
  code: {
    g: { ja: 'G', en: 'G' },
    pg12: { ja: 'PG12', en: 'PG12' },
    r15: { ja: 'R15+', en: 'R15+' },
    r18: { ja: 'R18+', en: 'R18+' },
  },
  note: {
    g: { ja: '全年齢対象', en: 'Suitable for all ages' },
    pg12: {
      ja: '12歳未満は保護者の助言・指導が必要',
      en: 'Parental guidance advised for under 12',
    },
    r15: { ja: '15歳以上鑑賞可', en: 'Ages 15 and over only' },
    r18: { ja: '18歳以上鑑賞可', en: 'Ages 18 and over only' },
  },
} as const;
