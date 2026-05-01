type Locale = 'ja' | 'en';

/**
 * 日付文字列をロケール対応の表示文字列と datetime 属性値に変換する。
 * 対応フォーマット: Ymd（20240315）/ ISO（2024-03-15）/ ISO datetime
 */
export const formatDate = (
  value: string,
  locale: Locale
): { display: string; datetime: string } => {
  let date: Date;

  if (/^\d{8}$/.test(value)) {
    date = new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)));
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return { display: value, datetime: value };
  }

  const datetime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const display = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  return { display, datetime };
};
