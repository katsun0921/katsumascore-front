import { stripHtml } from "@/libs/api/wordpress";

/** ACF のよい点リピーターまたは旧テキスト形式から、表示用の行配列を得る。 */
export const splitGoodPoints = (raw: unknown): string[] | undefined => {
  // ACF repeater形式: [{good_point_text: string}, ...]
  if (Array.isArray(raw)) {
    const parts = raw
      .map((r) => {
        if (typeof r === "object" && r !== null && "good_point_text" in r) {
          return stripHtml(String((r as Record<string, unknown>).good_point_text)).trim();
        }
        return typeof r === "string" ? stripHtml(r).trim() : "";
      })
      .filter(Boolean);
    return parts.length > 0 ? parts : undefined;
  }
  // 旧形式: 改行 or | 区切りの文字列
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const parts = raw
    .split(/\r?\n|\|/)
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};
