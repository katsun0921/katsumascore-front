/** ネストした配列・オブジェクトから正の投稿 ID を再帰的に `out` に集める。 */
export const collectNumericIds = (v: unknown, out: Set<number>) => {
  if (v == null) return;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    out.add(Math.floor(v));
    return;
  }
  if (Array.isArray(v)) {
    for (const item of v) {
      collectNumericIds(item, out);
    }
    return;
  }
  if (typeof v === "object" && v !== null) {
    const record = v as Record<string, unknown>;
    const id = record.id ?? record.ID ?? record.release_post_id ?? record.post_id;
    const numericId = typeof id === "string" ? Number.parseInt(id, 10) : id;
    if (typeof numericId === "number" && Number.isFinite(numericId) && numericId > 0) {
      out.add(Math.floor(numericId));
    }
  }
};

const RELATION_ACF_KEYS = [
  "relation_filed",
  "related_posts",
  "related_movies",
  "relation_posts",
  "series_posts",
  "acf_relation",
  "rm_related",
  "relation_article",
];

/** WP の ACF リレーションから投稿 ID を抽出（返却形の差異を吸収） */
export const extractRelationPostIds = (acf: Record<string, unknown> | undefined): number[] => {
  if (!acf) return [];
  const ids = new Set<number>();
  for (const key of RELATION_ACF_KEYS) {
    if (key in acf) collectNumericIds(acf[key], ids);
  }
  return [...ids];
};
