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
import { VOD_CONFIG } from "@/config/vod.config";
import {
  isVodPathSlug,
  resolveVodWpSlug,
  wpVodSlugToVodService,
} from "@/libs/vodPathToWpSlug";
import { getPostUrl, resolvePostType, type PostType } from "@/libs/route";

export const VOD_ARCHIVE_LIST_PER_PAGE = 20;

/** WP の VOD タームスラッグ（例: `amazon-prime-video`）を VodService キー（例: `amazon`）に変換する。 */
const toVodServices = (terms: VodListItem['vods']): VodService[] =>
  terms.flatMap((v) => {
    const service = wpVodSlugToVodService(v.slug);
    return service ? [service] : [];
  });

/** `VodListItem` を一覧表示用 `Post` にマッピングする。 */
const vodListItemToPost = (item: VodListItem): Post => {
  const typeSlug = item.genres.find((term) => POST_TYPE_SLUGS.has(term.slug))?.slug;
  const type = resolvePostType(typeSlug);
  return {
    id: String(item.id),
    slug: getPostUrl(type, item.slug, item.lang),
    title: item.title,
    excerpt: item.excerpt,
    image: item.featuredImage?.url ?? null,
    publishedAt: item.date,
    lang: item.lang,
    type,
    category: type,
    score: item.score ?? undefined,
    vods: toVodServices(item.vods),
    genres: item.genres.map((g) => ({ name: g.name, slug: g.slug })),
    tags: item.tags.map((t) => ({ name: t.name, slug: t.slug })),
  };
};

/** VOD API のターム配列に含まれる記事種別スラッグ。 */
const POST_TYPE_SLUGS: ReadonlySet<string> = new Set<PostType>(["movie", "anime", "drama"]);

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
  | { fetchFailed: true }
  | {
      categoryName: string;
      pathSlug: string;
      posts: Post[];
      allPosts: FilterPost[];
      currentPage: number;
      totalPages: number;
    };

/**
 * WordPress 取得失敗時に 404 を静的生成しないための空一覧データを返す。
 * 登録済みサービスは設定上の表示名を使い、総ページ数は現在ページ未満にならないよう補正する。
 */
export const buildEmptyVodArchivePage = (
  pathSlug: string,
  page: number,
): Extract<VodArchivePageResult, { posts: Post[] }> => {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const categoryName = isVodPathSlug(pathSlug) ? VOD_CONFIG[pathSlug].label : pathSlug;
  return {
    categoryName,
    pathSlug,
    posts: [],
    allPosts: [],
    currentPage: safePage,
    totalPages: safePage,
  };
};

/** VOD タームと一覧 API はビルド環境の遅延を考慮し、既定値より長く待つ。 */
const VOD_FETCH_OPTIONS = { timeoutMs: 10000, maxRetries: 1 } as const;

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
  try {
    const currentLocale = locale === "en" ? "en" : "ja";
    const trimmed = pathSlug.trim();
    if (!trimmed) return { notFound: true };

    const wpSlug = resolveVodWpSlug(trimmed);
    let term: WPVodTerm | null = await getVodTermBySlug(wpSlug, VOD_FETCH_OPTIONS);
    if (!term) {
      const list = await getVodTerms(VOD_FETCH_OPTIONS);
      if (list === null) {
        console.error(`[loadVodArchivePage] VOD ターム一覧を取得できなかった（slug=${wpSlug}）`);
        return { fetchFailed: true };
      }
      term = list.find((t) => t.slug === wpSlug) ?? null;
    }
    if (!term) return { notFound: true };

    const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

    // 指定ページのみ取得（ページネーションはサーバー側で完結）
    const vodResponse = await getVodList(
      {
        vod: term.slug,
        lang: currentLocale,
        page: safePage,
        per_page: VOD_ARCHIVE_LIST_PER_PAGE,
      },
      VOD_FETCH_OPTIONS,
    );
    if (!vodResponse) {
      console.error(`[loadVodArchivePage] VOD 記事一覧を取得できなかった（slug=${wpSlug} page=${safePage}）`);
      return { fetchFailed: true };
    }

    const { items, meta } = vodResponse;
    // meta.totalPages は per_page=VOD_ARCHIVE_LIST_PER_PAGE で計算されているためそのまま使用
    const totalPages = Math.max(1, meta.totalPages);
    if (safePage > totalPages) return { notFound: true };
    if (items.length === 0 && safePage > 1) return { notFound: true };

    const allPosts: FilterPost[] = items.map(vodListItemToFilterPost);
    const posts: Post[] = items.map(vodListItemToPost);

    return {
      categoryName: term.name,
      pathSlug: trimmed,
      posts: toSerializableValue(posts),
      allPosts: toSerializableValue(allPosts),
      currentPage: safePage,
      totalPages,
    };
  } catch (error) {
    console.error(`[loadVodArchivePage] VOD アーカイブ取得中に例外が発生した（slug=${pathSlug} page=${page}）`, error);
    return { fetchFailed: true };
  }
};
