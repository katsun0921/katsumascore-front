/**
 * VODサービスの共通定義
 * サービスキー・表示名・カラー変数・イニシャルをここで一元管理する。
 * コンポーネント内でのローカル定義は禁止。
 */

export type VodService =
  | 'netflix'
  | 'amazon'
  | 'unext'
  | 'hulu'
  | 'disney'
  | 'dmmtv'
  | 'abema'
  | 'appletv'
  | 'rakuten'
  | 'youtube';

/** CSS変数（背景色） */
export const VOD_COLOR_VAR: Record<VodService, string> = {
  netflix: 'var(--color-netflix)',
  amazon: 'var(--color-amazon-shopping)',
  unext: 'var(--color-amazon)',
  hulu: 'var(--color-hulu)',
  disney: 'var(--color-disney)',
  dmmtv: 'var(--color-dmmtv)',
  abema: 'var(--color-abema)',
  appletv: 'var(--color-appletv)',
  rakuten: 'var(--color-rakuten)',
  youtube: 'var(--color-youtube)',
};

/** Tailwind border-top クラス（VodItem 用） */
export const VOD_BORDER_CLASS: Record<VodService, string> = {
  netflix: '[border-top:3px_solid_var(--color-netflix)]',
  amazon: '[border-top:3px_solid_var(--color-amazon)]',
  unext: '[border-top:3px_solid_var(--color-unext)]',
  hulu: '[border-top:3px_solid_var(--color-hulu)]',
  disney: '[border-top:3px_solid_var(--color-disney)]',
  dmmtv: '[border-top:3px_solid_var(--color-dmmtv)]',
  abema: '[border-top:3px_solid_var(--color-abema)]',
  appletv: '[border-top:3px_solid_var(--color-appletv)]',
  rakuten: '[border-top:3px_solid_var(--color-rakuten)]',
  youtube: '[border-top:3px_solid_var(--color-youtube)]',
};
