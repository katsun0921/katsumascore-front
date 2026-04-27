export type CinemaCheckLocale = 'ja' | 'en'

export type CinemaCheckMessages = {
  badgeLabel: string
  fallbackTitle: string
  messageSuffix: string
}

export const cinemaCheckConfig: Record<CinemaCheckLocale, CinemaCheckMessages> = {
  ja: {
    badgeLabel: '劇場公開中',
    fallbackTitle: 'この作品',
    messageSuffix: 'は現在劇場公開中です。',
  },
  en: {
    badgeLabel: 'Now in Theaters',
    fallbackTitle: 'This title',
    messageSuffix: ' is currently showing in theaters.',
  },
};
