/**
 * VOD タクソノミー別の記事一覧ページ用データ取得。
 * カスタムエンドポイント `getVodList` を使い、N リクエストのループを 1 リクエストに削減する。
 * 移行仕様: docs/develop/vod_list_api_front_spec.md
 */
import {
  type WPVodTerm,
  getVodTermBySlug,
  getVodTerms,
  getVodList,
  type VodListItem,
} from "@/libs/api/wordpress";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { FilterPost, Post, VodService } from "@/types/post";
import {
  normalizeVodSlugKeyForMatch,
  vodWpSlugLookupCandidates,
} from "@/libs/vodPathToWpSlug";

export const VOD_ARCHIVE_LIST_PER_PAGE = 13;

/** `slug` 直指定が全部空でも、一覧の正規化 slug が候補のいずれかと一致すればそのタームを返す。 */
const pickVodTermFromList = (terms: WPVodTerm[], candidates: string[]): WPVodTerm | null => {
  for (let ti = 0; ti < terms.length; ti += 1) {
    const t = terms[ti];
    const tn = normalizeVodSlugKeyForMatch(t.slug);
    for (let ci = 0; ci < candidates.length; ci += 1) {
      if (tn === normalizeVodSlugKeyForMatch(candidates[ci])) return t;
    }
  }
  return null;
};

const VOD_SERVICE_SET = new Set<string>([
  'netflix', 'amazon', 'unext', 'hulu', 'disney',
  'dmmtv', 'abema', 'appletv', 'rakuten', 'youtube',
]);

/** VOD タームスラッグを VodService 型にフィルタする。 */
const toVodServices = (terms: VodListItem['vods']): VodService[] =>
  terms.map((v) => v.slug).filter((s): s is VodService => VOD_SERVICE_SET.has(s));

/** `VodListItem` を一覧表示用 `Post` にマッピングする。 */
const vodListItemToPost = (item: VodListItem): Post => ({
  id: String(item.id),
  slug: item.slug,
  title: item.title,
  excerpt: item.excerpt,
  image: item.featuredImage?.url ?? null,
  publishedAt: item.date,
  lang: item.lang,
  score: item.score ?? undefined,
  vods: toVodServices(item.vods),
  genres: item.genres.map((g) => ({ name: g.name, slug: g.slug })),
  tags: item.tags.map((t) => ({ name: t.name, slug: t.slug })),
});

/** `VodListItem` をフィルタ・ページネーション用 `FilterPost` にマッピングする。 */
const vodListItemToFilterPost = (item: VodListItem): FilterPost => ({
  id: String(item.id),
  slug: item.slug,
  score: item.score,
  publishedAt: item.date,
  vods: toVodServices(item.vods),
  genres: item.genres.map((g) => ({ name: g.name, slug: g.slug })),
  tags: item.tags.map((t) => ({ name: t.name, slug: t.slug })),
});

export type VodArchivePageResult =
  | { notFound: true }
  | {
      categoryName: string;
      pathSlug: string;
      posts: Post[];
      allPosts: FilterPost[];
      currentPage: number;
      totalPages: number;
    };

/**
 * URL パス上の VOD スラッグ（例: `amazon`）でタームを解決し、
 * カスタムエンドポイントから最大 100 件を取得してページ分割する。
 * タームが存在しない・ページ範囲外は `{ notFound: true }`。
 *
 * Phase 1 制限: `allPosts` は最大 100 件。101 件以上の VOD サービスでは
 * フィルタ選択肢が不完全になる。Phase 2 でサーバーサイドフィルタへ移行予定。
 */
export const loadVodArchivePage = async (
  pathSlug: string,
  locale: string,
  page: number,
): Promise<VodArchivePageResult> => {
  const currentLocale = locale === "en" ? "en" : "ja";
  const trimmed = pathSlug.trim();
  if (!trimmed) return { notFound: true };

  const candidates = vodWpSlugLookupCandidates(trimmed);
  let term: WPVodTerm | null = null;
  for (let i = 0; i < candidates.length; i += 1) {
    const resolved = await getVodTermBySlug(candidates[i]);
    if (resolved) {
      term = resolved;
      break;
    }
  }
  if (!term) {
    const list = await getVodTerms();
    if (list) term = pickVodTermFromList(list, candidates);
  }
  if (!term) return { notFound: true };

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  // カスタムエンドポイントから最大 100 件取得（言語フィルタはサーバー側）
  const vodResponse = await getVodList({
    vod: term.slug,
    lang: currentLocale,
    per_page: 100,
  });
  if (!vodResponse) return { notFound: true };

  const { items: allItems, meta } = vodResponse;
  const totalPages = Math.max(1, Math.ceil(meta.total / VOD_ARCHIVE_LIST_PER_PAGE));
  if (safePage > totalPages) return { notFound: true };

  const allPosts: FilterPost[] = allItems.map(vodListItemToFilterPost);
  const pageItems = allItems.slice(
    (safePage - 1) * VOD_ARCHIVE_LIST_PER_PAGE,
    safePage * VOD_ARCHIVE_LIST_PER_PAGE,
  );
  const posts: Post[] = pageItems.map(vodListItemToPost);

  return {
    categoryName: term.name,
    pathSlug: trimmed,
    posts: toSerializableValue(posts),
    allPosts: toSerializableValue(allPosts),
    currentPage: safePage,
    totalPages,
  };
};
