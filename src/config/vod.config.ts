/**
 * VOD サービスのマスター定義。
 * ラベル・カラー変数・ボーダークラス・WP タクソノミースラッグをここで一元管理する。
 * サービスの追加・削除・名称変更はこのファイルのみを変更すること。
 */
export const VOD_CONFIG = {
  netflix: {
    label: 'Netflix',
    colorVar: 'var(--color-netflix)',
    borderClass: '[border-top:3px_solid_var(--color-netflix)]',
    wpSlug: 'netflix',
  },
  'prime-video': {
    label: 'Prime Video',
    colorVar: 'var(--color-amazon-shopping)',
    borderClass: '[border-top:3px_solid_var(--color-amazon)]',
    wpSlug: 'amazon-prime-video',
  },
  unext: {
    label: 'U-NEXT',
    colorVar: 'var(--color-amazon)',
    borderClass: '[border-top:3px_solid_var(--color-unext)]',
    wpSlug: 'u-next',
  },
  hulu: {
    label: 'Hulu',
    colorVar: 'var(--color-hulu)',
    borderClass: '[border-top:3px_solid_var(--color-hulu)]',
    wpSlug: 'hulu',
  },
  disney: {
    label: 'Disney+',
    colorVar: 'var(--color-disney)',
    borderClass: '[border-top:3px_solid_var(--color-disney)]',
    wpSlug: 'disneyplus',
  },
  dmmtv: {
    label: 'DMM TV',
    colorVar: 'var(--color-dmmtv)',
    borderClass: '[border-top:3px_solid_var(--color-dmmtv)]',
    wpSlug: 'dmmtv',
  },
  abema: {
    label: 'ABEMA',
    colorVar: 'var(--color-abema)',
    borderClass: '[border-top:3px_solid_var(--color-abema)]',
    wpSlug: 'abema_tv',
  },
  appletv: {
    label: 'Apple TV+',
    colorVar: 'var(--color-appletv)',
    borderClass: '[border-top:3px_solid_var(--color-appletv)]',
    wpSlug: 'apple-tv',
  },
  youtube: {
    label: 'YouTube',
    colorVar: 'var(--color-youtube)',
    borderClass: '[border-top:3px_solid_var(--color-youtube)]',
    wpSlug: 'youtube',
  },
} as const;

export type VodService = keyof typeof VOD_CONFIG;
