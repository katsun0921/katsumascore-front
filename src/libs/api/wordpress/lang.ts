export type Locale = "ja" | "en";

/**
 * 記事の言語は **ACF の `lang` フィールド**を正とする。
 * 一覧・詳細の最終的な言語切り分けは `normalizePosts` 等で `detectLang` の結果（`m.lang`）を使う。
 *
 * 判定順:
 *   1. ACF `lang`（`ja` / `en`）— 最優先
 *   2. `link` のパスが `/en/` で始まる場合は `en`（ACF 未設定時のフォールバック）
 *   3. それ以外は `ja`
 */
export const detectLang = (link: string | undefined, acfLang?: string): Locale => {
  if (acfLang === "en" || acfLang === "ja") return acfLang;
  if (link) {
    try {
      const pathname = new URL(link).pathname;
      if (pathname.startsWith("/en/")) return "en";
      if (pathname.startsWith("/ja/")) return "ja";
    } catch {
      // fall through
    }
  }
  return "ja";
};

