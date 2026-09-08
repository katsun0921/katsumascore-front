/**
 * `/v1/theater-list` のレスポンス1件を、表示用の `Post` へ変換する。
 * 上映中一覧ページ（`loadNowShowingPosts`）と TOP の劇場公開中セクションの両方から使う。
 */
import type { TheaterListItem } from "@/libs/api/wordpress";
import { getPostUrl, resolvePostType } from "@/libs/route";
import type { Post } from "@/types/post";

/** WP のレスポンス1件を、表示用の `Post` へ変換する。 */
export const theaterListItemToPost = (item: TheaterListItem, locale: "ja" | "en"): Post => {
  // カテゴリは複数付くことがあるため、記事 URL の解決には先頭を使う（`resolvePostType` の既定は movie）
  const categorySlug = item.categories[0]?.slug;
  const type = resolvePostType(categorySlug);
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
    ...(categorySlug !== undefined ? { category: categorySlug } : {}),
    ...(item.score !== null ? { score: item.score } : {}),
    ...(genres.length > 0 ? { genres } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };
};
