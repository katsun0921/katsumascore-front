/**
 * VOD タクソノミー別の記事一覧ページ用データ取得（URL スラッグ → WP `vod` ターム → 投稿一覧）。
 */
import {
  type WPVodTerm,
  getPostsWithMeta,
  getVodTermBySlug,
  getVodTerms,
} from "@/libs/api/wordpress";
import { normalizePosts } from "@/utils/normalizePost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { FilterPost, Post } from "@/types/post";
import type { WPPost } from "@/types/wordpress";
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
 * URL パス上の VOD スラッグ（例: `amazon`）でタームを解決し、該当投稿を全ページ分取得してページ分割する。
 * タームが存在しない・ページ範囲外は `{ notFound: true }`。
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
  let term = null;
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
  const rawPosts: WPPost[] = [];
  let rawTotalPages = 1;
  for (let rawPage = 1; rawPage <= rawTotalPages; rawPage += 1) {
    const fetched = await getPostsWithMeta({
      vod: term.id,
      page: rawPage,
      per_page: VOD_ARCHIVE_LIST_PER_PAGE,
    });
    if (!fetched) {
      if (rawPage === 1) {
        rawTotalPages = 1;
        break;
      }
      return { notFound: true };
    }
    rawPosts.push(...fetched.items);
    rawTotalPages = Math.max(1, fetched.meta.totalPages);
  }

  const normalizedPosts = normalizePosts(rawPosts, currentLocale);
  const normalizedTotalPages = Math.max(
    1,
    Math.ceil(normalizedPosts.length / VOD_ARCHIVE_LIST_PER_PAGE),
  );
  const totalPages = normalizedTotalPages;
  if (safePage > totalPages) return { notFound: true };
  const start = (safePage - 1) * VOD_ARCHIVE_LIST_PER_PAGE;

  const allPosts: FilterPost[] = normalizedPosts.map(({ id, slug, score, publishedAt, vods, genres, tags }) => ({
    id,
    slug,
    score: score ?? null,
    publishedAt,
    vods: vods ?? null,
    genres: genres ?? null,
    tags: tags ?? null,
  }));

  const categoryName = term.name;

  return {
    categoryName,
    pathSlug: trimmed,
    posts: toSerializableValue(normalizedPosts),
    allPosts: toSerializableValue(allPosts),
    currentPage: safePage,
    totalPages,
  };
};
