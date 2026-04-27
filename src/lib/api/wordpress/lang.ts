export type Locale = "ja" | "en";

/**
 * Polylang Free では REST レスポンスに lang フィールドが返らないため、
 * `link` フィールドのパス（/en/ プレフィックス）で言語を判定する。
 */
export const detectLang = (link: string): Locale => {
  try {
    return new URL(link).pathname.startsWith("/en/") ? "en" : "ja";
  } catch {
    return "ja";
  }
};

/**
 * 投稿の HTML から Polylang が出力する hreflang タグを解析し、
 * 翻訳ペアのスラッグを返す。SSG ビルド時（詳細ページ）専用。
 *
 * @returns { ja: "/slug-ja/", en: "/en/slug-en/" } のような pathname マップ
 */
export const fetchTranslationLinks = async (
  postLink: string,
): Promise<Partial<Record<Locale, string>>> => {
  try {
    const res = await fetch(postLink, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const html = await res.text();
    const result: Partial<Record<Locale, string>> = {};
    const re =
      /<link\s+rel="alternate"\s+href="([^"]+)"\s+hreflang="(ja|en)"\s*\/?>/g;
    for (const m of html.matchAll(re)) {
      const lang = m[2] as Locale;
      result[lang] = new URL(m[1]).pathname;
    }
    return result;
  } catch {
    return {};
  }
};
