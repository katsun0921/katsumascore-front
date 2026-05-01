export type Locale = "ja" | "en";

/**
 * ACF `lang` フィールドを正規ソースとして言語を判定する。
 *   1. acfLang（ACF lang フィールド） — 最優先
 *   2. link の /en/ プレフィックス — ACF 未設定時のフォールバック
 *   3. "ja" にフォールバック
 */
export const detectLang = (link: string | undefined, acfLang?: string): Locale => {
  if (acfLang === "en" || acfLang === "ja") return acfLang;
  if (link) {
    try {
      if (new URL(link).pathname.startsWith("/en/")) return "en";
    } catch {
      // fall through
    }
  }
  return "ja";
};

