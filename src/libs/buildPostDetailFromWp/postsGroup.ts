import { parseWPPostUnknown, stripHtml } from "@/libs/api/wordpress";

import { collectNumericIds } from "./relationPostIds";
import type { PostsGroupSpec } from "./types";

/** ACF の関連投稿グループ定義から見出し・説明・投稿 ID 列を抽出する。 */
const extractPostsGroupIds = (acf: Record<string, unknown> | undefined): PostsGroupSpec[] => {
  if (!acf) return [];
  const raw = acf.relation_fields ?? acf.posts_groups ?? acf.post_groups ?? acf.related_groups;
  if (!Array.isArray(raw)) return [];
  const groups: PostsGroupSpec[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const heading = typeof o.heading === "string" ? o.heading : typeof o.title === "string" ? o.title : "";
    const description = typeof o.description === "string" ? stripHtml(o.description.trim()) : "";
    const ids = new Set<number>();
    collectNumericIds(o.posts ?? o.post_ids ?? o.ids, ids);
    if (heading && ids.size > 0) {
      groups.push({ heading, ...(description ? { description } : {}), ids: [...ids] });
    }
  }
  return groups;
};

/** 未パースの WP 投稿から関連グループ仕様の配列を取り出す。 */
export const extractPostsGroupSpecsFromWp = (wp: unknown): PostsGroupSpec[] => {
  const p = parseWPPostUnknown(wp);
  if (!p) return [];
  return extractPostsGroupIds(p.acf as Record<string, unknown> | undefined);
};
