/**
 * `/v1/category-list` のレスポンス1件を、表示用の `Post` へ変換する。
 * ISR（`loadCategoryListPage`）と CSR（`/api/category-filter-posts`）の両方から使う。
 */
import { toVodServices } from "@/libs/api/wordpress";
import type { CategoryListItem } from "@/libs/api/wordpress";
import { getPostUrl, resolvePostType } from "@/libs/route";
import type { Post } from "@/types/post";

/** WP のレスポンス1件を、表示用の `Post` へ変換する。 */
export const categoryListItemToPost = (item: CategoryListItem, locale: "ja" | "en"): Post => {
  const type = resolvePostType(item.category);
  const vods = toVodServices(item.vods);
  const genres = item.genres.map(({ name, slug }) => ({ name, slug }));
  const tags = item.tags.map(({ name, slug }) => ({ name, slug }));

  return {
    id: String(item.id),
    // `Post.slug` はリンクの href としてそのまま使われるためロケール込みのフルパスにする
    slug: getPostUrl(type, item.slug, locale),
    title: item.title,
    excerpt: item.excerpt,
    image: item.featuredImage?.url ?? null,
    publishedAt: item.date.slice(0, 10),
    updatedAt: item.modified.slice(0, 10),
    lang: locale,
    type,
    category: item.category,
    ...(item.score !== null ? { score: item.score } : {}),
    ...(vods.length > 0 ? { vods } : {}),
    ...(genres.length > 0 ? { genres } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };
};
