export type RelationPostLocale = 'ja' | 'en'

export type RelationPostMessages = {
  heading: string
}

export const relationPostConfig: Record<RelationPostLocale, RelationPostMessages> = {
  ja: {
    heading: '関連ページ',
  },
  en: {
    heading: 'Related Posts',
  },
};
