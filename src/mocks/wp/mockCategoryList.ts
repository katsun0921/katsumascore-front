/**
 * `/v1/category-list`（カテゴリ記事一覧エンドポイント）のモック。
 *
 * 既存の `MOCK_WP_POSTS` から組み立てるため、モックデータを増やせば
 * 自動的にこちらにも反映される。WP 側の SQL と同じ順序で
 * 絞り込み → ソート → ページングを行う。
 */
import { MOCK_WP_POSTS } from "./mockWpDataset";
import type {
  CategoryListParams,
  CategoryListItem,
  CategoryListResponse,
} from "@/libs/api/wordpress/endpoints/categoryList";

type TermLike = { id?: number; slug?: string; name?: string; taxonomy?: string };

/** 埋め込みタームを taxonomy 単位で取り出す。 */
const termsOf = (post: unknown, taxonomy: string): TermLike[] => {
  const groups = (post as { _embedded?: { "wp:term"?: TermLike[][] } })._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  return groups.flat().filter((t) => t?.taxonomy === taxonomy);
};

/** モック投稿の主カテゴリスラッグ（`wp:term` の第1グループ先頭）。 */
const categorySlugOf = (post: unknown): string => {
  const groups = (post as { _embedded?: { "wp:term"?: TermLike[][] } })._embedded?.["wp:term"];
  const first = Array.isArray(groups) ? groups[0]?.[0] : undefined;
  return first?.slug ?? "";
};

/** ACF の VOD フィールドのうち status が streaming のものを返す。 */
const streamingVodsOf = (post: unknown): string[] => {
  const acf = (post as { acf?: Record<string, unknown> }).acf ?? {};
  const fields = ["netflix", "amazon_prime_video", "hulu", "unext"];
  return fields.filter((f) => {
    const v = acf[f];
    return typeof v === "object" && v !== null && (v as { status?: string }).status === "streaming";
  });
};

/** モック投稿1件を `CategoryListItem` へ変換する。 */
const toItem = (post: unknown): CategoryListItem => {
  const p = post as {
    id: number;
    slug: string;
    date: string;
    modified?: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    acf?: Record<string, unknown>;
    _embedded?: { "wp:featuredmedia"?: { source_url?: string }[] };
  };
  const media = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const score = p.acf?.["review_score"];

  return {
    id: p.id,
    slug: p.slug,
    lang: typeof p.acf?.["lang"] === "string" ? (p.acf["lang"] as string) : "ja",
    title: p.title?.rendered ?? "",
    excerpt: p.excerpt?.rendered ?? "",
    date: p.date,
    modified: p.modified ?? p.date,
    featuredImage: media ? { url: media, width: 1200, height: 675, alt: "" } : null,
    score: typeof score === "number" ? score : null,
    category: categorySlugOf(post),
    vods: streamingVodsOf(post),
    genres: termsOf(post, "genre").map((t) => ({
      id: t.id ?? 0,
      slug: t.slug ?? "",
      name: t.name ?? "",
    })),
    tags: termsOf(post, "post_tag").map((t) => ({
      id: t.id ?? 0,
      slug: t.slug ?? "",
      name: t.name ?? "",
    })),
  };
};

/**
 * WP の `/v1/category-list` と同じ挙動でモックデータを返す。
 * 絞り込み（カテゴリ・言語・genre・tag・streaming）→ ソート → ページングの順に適用する。
 */
export const mockCategoryList = (params: CategoryListParams): CategoryListResponse => {
  const all = MOCK_WP_POSTS.map(toItem).filter(
    (i) => i.category === params.category && i.lang === params.lang,
  );

  // フィルタ選択肢は genre / tag 絞り込み前の母集団から作る（WP 側と同じ）
  const genreMap = new Map<string, string>();
  const tagMap = new Map<string, string>();
  for (const item of all) {
    for (const g of item.genres) genreMap.set(g.slug, g.name);
    for (const t of item.tags) tagMap.set(t.slug, t.name);
  }
  const filterOptions = {
    genres: [...genreMap].map(([slug, name]) => ({ slug, name })),
    tags: [...tagMap].map(([slug, name]) => ({ slug, name })),
  };

  let filtered = all;
  if (params.genre) {
    const slugs = params.genre.split(",");
    filtered = filtered.filter((i) => i.genres.some((g) => slugs.includes(g.slug)));
  }
  if (params.tag) {
    const slugs = params.tag.split(",");
    filtered = filtered.filter((i) => i.tags.some((t) => slugs.includes(t.slug)));
  }
  if (params.filter === "streaming") {
    filtered = filtered.filter((i) => i.vods.length > 0);
  }

  const sorted = [...filtered].sort((a, b) =>
    params.filter === "score"
      ? (b.score ?? 0) - (a.score ?? 0) || b.date.localeCompare(a.date)
      : b.date.localeCompare(a.date),
  );

  const total = sorted.length;
  const totalPages = total > 0 ? Math.ceil(total / params.perPage) : 0;
  const start = (params.page - 1) * params.perPage;

  return {
    items: sorted.slice(start, start + params.perPage),
    meta: { page: params.page, perPage: params.perPage, total, totalPages },
    filterOptions,
  };
};
