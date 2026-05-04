/**
 * WordPress タグの slug とアイコン絵文字のマッピング。
 * タグ追加頻度は低いため Next.js 側でハードコード（仕様書 §3.❽ 推奨）。
 */
export const GENRE_ICON_MAP: Record<string, string> = {
  'western-movie':  '🎬',
  'japanese-movie': '🇯🇵',
  'drama':          '📺',
  'anime':          '🎌',
  'action':         '🔫',
  'horror':         '😱',
  'romance':        '💕',
  'suspense':       '🔍',
  'comedy':         '😂',
  'human-drama':    '🎭',
  'sf':             '🚀',
  'fantasy':        '🧙',
  'documentary':    '🎥',
  'animation':      '✨',
  'thriller':       '⚡',
};

export const DEFAULT_ICON = '🎞️';

export const getGenreIcon = (slug: string): string =>
  GENRE_ICON_MAP[slug] ?? DEFAULT_ICON;
