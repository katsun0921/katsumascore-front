export type VodPanelLocale = 'ja' | 'en'

export type VodPanelMessages = {
  cinemaBadgeLabel: string
  cinemaNote: string
  listHeading: string
  listHeadingSuffix: string
}

export const vodPanelConfig: Record<VodPanelLocale, VodPanelMessages> = {
  ja: {
    cinemaBadgeLabel: '劇場公開中',
    cinemaNote: '劇場公開中のためVOD配信は表示していません。',
    listHeading: 'Streaming Services',
    listHeadingSuffix: 'の動画配信サービス',
  },
  en: {
    cinemaBadgeLabel: 'Now in Theaters',
    cinemaNote: 'VOD streaming is not available during theatrical release.',
    listHeading: 'Streaming Services',
    listHeadingSuffix: '',
  },
}
