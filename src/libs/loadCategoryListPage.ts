/**
 * 任意カテゴリ（スラッグ指定）の記事一覧ページ用データ取得。
 * allPosts（フィルタ用全件）は ISR から除外し、CSR（/api/category-filter-posts）で取得する。
 *
 * 取得は WP のカスタムエンドポイント（`/v1/category-list`）を使う。
 * 以前は `getPostsWithMeta` で ja / en 混在のまま1ページ分を取得し、
 * その後 `normalizePosts` で言語フィルタしていたため、
 * 「13件取得 → 表示は0〜13件」と件数が安定せず、
 * 1ページ目が全て日本語の場合に `/en/movie` が0件になっていた。
 * WP 側で言語を絞ってからページングすることで構造的に解消している。
 */
import { getCategoriesForArchiveResolve, getCategoryList } from "@/libs/api/wordpress";
import { toSerializableValue } from "@/utils/toSerializableValue";
import { categoryListItemToPost } from "@/utils/categoryListItemToPost";
import { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";
import { POST_TYPE_ARCHIVE_NAV_ITEMS } from "@/config/wpContent.config";
import type { Post } from "@/types/post";

export { CATEGORY_LIST_PER_PAGE } from "@/libs/listFilters";

export type CategoryListPageResult =
  /** カテゴリ・ページが存在しない（恒久的な 404） */
  | { notFound: true }
  /**
   * WP からの取得に失敗した（一時的な障害）。
   *
   * 2つの失敗モードがあり、扱いを分ける必要がある。
   *
   * 1. `notFound: true` を返す → 静的出力に 404 が焼き付き `revalidate` でも
   *    復旧しない。実際に本番で `/ja/movie` `/ja/anime` `/ja/drama` が 404 になった
   * 2. `throw` する → ビルド全体が失敗する。ビルド環境から WP へ到達できない
   *    状態が常態化していると、デプロイそのものができなくなる
   *
   * 現状 GitHub Actions のランナーからは WP が HTTP 403 を返すため 2 が起きる。
   * そのため呼び出し側は空一覧のページを短い `revalidate` で生成し、
   * リクエスト時の ISR 再生成で復旧させる（`buildEmptyCategoryListPage` を使う）。
   */
  | { fetchFailed: true }
  | {
      categoryName: string;
      slug: string;
      posts: Post[];
      currentPage: number;
      totalPages: number;
    };

/**
 * WP 取得に失敗したときの一覧ページデータ（空一覧）。
 *
 * ビルド時に WP へ到達できなくても、404 を焼き付けず・ビルドも止めずに
 * ページを生成するために使う。呼び出し側は短い `revalidate` を設定し、
 * リクエスト時の ISR 再生成で実データへ復旧させること。
 *
 * カテゴリ名は WP から取れないため、ナビ定義のラベルで代替する。
 */
export const buildEmptyCategoryListPage = (
  slug: string,
  locale: "ja" | "en",
): Extract<CategoryListPageResult, { posts: Post[] }> => {
  const navItem = POST_TYPE_ARCHIVE_NAV_ITEMS.find((item) => item.postType === slug);
  return {
    categoryName: navItem ? navItem.label[locale] : slug,
    slug,
    posts: [],
    currentPage: 1,
    totalPages: 1,
  };
};

/** カテゴリ名の解決のみ `/wp/v2/categories` を使うため、余裕を持たせる */
const CATEGORY_FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

/** 記事一覧は1ページ分のみの取得。実測コールド 0.7〜1.3 秒 */
const POSTS_FETCH_OPTIONS = { timeoutMs: 8000, maxRetries: 1 } as const;

/** カテゴリ `slug` の表示ページ分（`perPage` 件）のみを ISR 向けに取得して返す。
 * allPosts は含まない（CSR で /api/category-filter-posts を利用）。 */
export const loadCategoryListPage = async (
  slug: string,
  locale: string,
  page: number,
  perPage: number = CATEGORY_LIST_PER_PAGE,
): Promise<CategoryListPageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";

  // 表示用のカテゴリ名（「映画」等）はエンドポイントが返さないため WP から解決する
  const categories = await getCategoriesForArchiveResolve(CATEGORY_FETCH_OPTIONS);

  // カテゴリ一覧が空 = WP 取得失敗。「カテゴリが存在しない」と区別する
  if (categories.length === 0) {
    console.error(`[loadCategoryListPage] カテゴリ一覧を取得できなかった（slug=${slug}）`);
    return { fetchFailed: true };
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  const result = await getCategoryList(
    {
      category: category.slug,
      lang: currentLocale,
      page: safePage,
      perPage,
      filter: "score",
    },
    POSTS_FETCH_OPTIONS,
  );
  if (!result) {
    console.error(`[loadCategoryListPage] 記事を取得できなかった（slug=${slug} page=${safePage}）`);
    return { fetchFailed: true };
  }

  // 該当言語の記事が0件のカテゴリ（例: drama の en）は 404 とする
  if (result.meta.total === 0) return { notFound: true };

  const totalPages = Math.max(1, result.meta.totalPages);
  if (safePage > totalPages) return { notFound: true };

  const posts = result.items.map((item) => categoryListItemToPost(item, currentLocale));

  return {
    categoryName: category.name,
    slug: category.slug,
    posts: toSerializableValue(posts),
    currentPage: safePage,
    totalPages,
  };
};
