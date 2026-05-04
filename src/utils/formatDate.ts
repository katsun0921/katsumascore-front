type Locale = 'ja' | 'en';

const parseInputToDate = (value: string): Date => {
  // YYYYMMDD（例: 20240315）— ローカル日として解釈
  if (/^\d{8}$/.test(value)) {
    return new Date(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8))
    );
  }

  // YYYY-MM-DD のみ（時刻なし）— ローカル日として解釈
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // ISO 8601 やその他、Date コンストラクタに委ねる形式
  return new Date(value);
};

/**
 * 日付文字列をロケール対応の表示文字列と datetime 属性値に変換する。
 * 対応フォーマット: Ymd（20240315）/ ISO（2024-03-15）/ ISO datetime
 */
export const formatDate = (
  value: string,
  locale: Locale
): { display: string; datetime: string } => {
  const date = parseInputToDate(value);

  // Invalid Date のときはフォールバック（入力をそのまま返す）
  if (Number.isNaN(date.getTime())) {
    return { display: value, datetime: value };
  }

  const datetime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // en: 米英表記 / ja: 日本語表記（Intl のロケールタグ）
  const intlLocale = locale === 'en' ? 'en-US' : 'ja-JP';
  const display = new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  return { display, datetime };
};
