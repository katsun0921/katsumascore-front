/**
 * モック WP データに対する一覧フィルタ・ページネーション（REST クエリのサブセット）。
 */
import { detectLang } from "@/libs/api/wordpress/lang";
import {
  MOCK_WP_CATEGORIES,
  MOCK_WP_GENRES,
  MOCK_WP_PAGES,
  MOCK_WP_POSTS,
  MOCK_WP_TAGS,
  MOCK_WP_VOD_TERMS,
  type MockGenreTerm,
  type MockVodTerm,
  type MockWPCategory,
  type MockWPPost,
  type MockWPTag,
} from "@/mocks/wp/mockWpDataset";
import type { components } from "@/libs/api/wordpress/generated/wp-schema";
import type { WpPostsListMeta, WpPostsPagedResult } from "@/libs/api/wordpress/client";

type PostsQuery = {
  page?: number;
  per_page?: number;
  lang?: "ja" | "en";
  categories?: number;
  tags?: number;
  genre?: string;
  vod?: number;
  slug?: string;
  search?: string;
  include?: string;
};

type TermLike = { id?: number; slug?: string; name?: string; taxonomy?: string };

const normalizeTaxonomy = (raw: string): string => raw.replace(/^wp_/i, "").toLowerCase();

const eachEmbeddedTerm = (post: MockWPPost, fn: (t: TermLike) => void) => {
  const groups = post._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return;
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const term of group) {
      fn(term as TermLike);
    }
  }
};

const primaryCategoryId = (post: MockWPPost): number | undefined => {
  const g0 = post._embedded?.["wp:term"]?.[0];
  if (!Array.isArray(g0) || g0.length === 0) return undefined;
  const id = (g0[0] as TermLike).id;
  return typeof id === "number" ? id : undefined;
};

const postHasTagId = (post: MockWPPost, tagId: number): boolean => {
  let found = false;
  eachEmbeddedTerm(post, (t) => {
    const tax = typeof t.taxonomy === "string" ? normalizeTaxonomy(t.taxonomy) : "";
    if ((tax === "post_tag" || tax === "tag") && t.id === tagId) found = true;
  });
  return found;
};

const postHasGenreQuery = (post: MockWPPost, genreQ: string): boolean => {
  let found = false;
  eachEmbeddedTerm(post, (t) => {
    const tax = typeof t.taxonomy === "string" ? normalizeTaxonomy(t.taxonomy) : "";
    if (tax !== "genre" && tax !== "genres") return;
    if (String(t.id) === genreQ || t.slug === genreQ) found = true;
  });
  return found;
};

const postHasVodId = (post: MockWPPost, vodId: number): boolean => {
  let found = false;
  eachEmbeddedTerm(post, (t) => {
    const tax = typeof t.taxonomy === "string" ? normalizeTaxonomy(t.taxonomy) : "";
    if (tax === "vod" && t.id === vodId) found = true;
  });
  return found;
};

const matchesLang = (post: MockWPPost, lang: string | undefined): boolean => {
  if (!lang) return true;
  const acfLang = post.acf && typeof post.acf === "object" && !Array.isArray(post.acf)
    ? (post.acf as { lang?: string }).lang
    : undefined;
  const link = (post as { link?: string }).link;
  const resolved = detectLang(link, acfLang === "en" || acfLang === "ja" ? acfLang : undefined);
  return resolved === lang;
};

const matchesSearch = (post: MockWPPost, q: string): boolean => {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  const title = post.title.rendered.replace(/<[^>]+>/g, "").toLowerCase();
  const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, "").toLowerCase();
  return title.includes(needle) || excerpt.includes(needle);
};

/** `include=id,id` 順を保って返す */
const filterByInclude = (posts: MockWPPost[], include: string): MockWPPost[] => {
  const ids = include
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  const map = new Map(posts.map((p) => [p.id, p]));
  const out: MockWPPost[] = [];
  for (const id of ids) {
    const p = map.get(id);
    if (p) out.push(p);
  }
  return out;
};

/**
 * REST `/posts` と同様のクエリでモック投稿を絞り込み、ページネーション適用後のアイテムとメタを返す。
 */
export const mockWpPostsPaged = (query: PostsQuery): WpPostsPagedResult<MockWPPost> => {
  let list: MockWPPost[] = [...MOCK_WP_POSTS];

  if (query.include) {
    list = filterByInclude(list, query.include);
  } else {
    if (query.lang) list = list.filter((p) => matchesLang(p, query.lang));
    const categoryId = query.categories;
    if (categoryId !== undefined) {
      list = list.filter((p) => primaryCategoryId(p) === categoryId);
    }
    const tagId = query.tags;
    if (tagId !== undefined) {
      list = list.filter((p) => postHasTagId(p, tagId));
    }
    const genreQ = query.genre;
    if (genreQ) {
      list = list.filter((p) => postHasGenreQuery(p, genreQ));
    }
    const vodId = query.vod;
    if (vodId !== undefined) {
      list = list.filter((p) => postHasVodId(p, vodId));
    }
    const slugQ = query.slug;
    if (slugQ) {
      list = list.filter((p) => p.slug === slugQ);
    }
    const searchQ = query.search;
    if (searchQ) {
      list = list.filter((p) => matchesSearch(p, searchQ));
    }
  }

  const total = list.length;
  const perPage = query.per_page ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);
  const start = (page - 1) * perPage;
  const items = list.slice(start, start + perPage);
  const meta: WpPostsListMeta = { total, totalPages };
  return { items, meta };
};

/** メタ不要時はアイテム列のみ */
export const mockWpPostsList = (query: PostsQuery): MockWPPost[] => mockWpPostsPaged(query).items;

const categoriesForLang = (lang: string | undefined): MockWPCategory[] => {
  void lang;
  return [...MOCK_WP_CATEGORIES];
};

/**
 * `getCategories` / `getCategoriesForArchiveResolve` 向け。
 */
export const mockWpGetCategories = (lang?: string): MockWPCategory[] => categoriesForLang(lang);

/**
 * `getTags` 向け。
 */
export const mockWpGetTags = (lang?: string): MockWPTag[] => {
  void lang;
  return [...MOCK_WP_TAGS];
};

/**
 * `getGenres` 向け。
 */
export const mockWpGetGenres = (lang?: string): MockGenreTerm[] => {
  void lang;
  return [...MOCK_WP_GENRES];
};

/**
 * `getGenreBySlug` / slug 検索向け。
 */
export const mockWpGetGenreBySlug = (slug: string): MockGenreTerm | null =>
  MOCK_WP_GENRES.find((g) => g.slug === slug) ?? null;

/**
 * `getVodTerms` 向け。
 */
export const mockWpGetVodTerms = (lang?: string): MockVodTerm[] => {
  void lang;
  return [...MOCK_WP_VOD_TERMS];
};

/**
 * `getVodTermBySlug` 向け（候補 slug のいずれかに一致）。
 */
export const mockWpGetVodTermBySlug = (slug: string): MockVodTerm | null => {
  const t = slug.trim();
  if (!t) return null;
  return (
    MOCK_WP_VOD_TERMS.find((v) => v.slug === t) ??
    MOCK_WP_VOD_TERMS.find((v) => v.slug.replace(/-/g, "") === t.replace(/-/g, "")) ??
    null
  );
};

type PagesQuery = {
  per_page?: number;
  lang?: "ja" | "en";
  parent?: number;
  slug?: string;
  orderby?: string;
  order?: string;
};

/**
 * OpenAPI `/pages` 相当のモック。
 */
export const mockWpFetchPages = (query: PagesQuery): components["schemas"]["WPPage"][] => {
  let list = [...MOCK_WP_PAGES];
  if (query.slug) list = list.filter((p) => p.slug === query.slug);
  if (query.parent !== undefined) list = list.filter((p) => (p.parent ?? 0) === query.parent);
  return list;
};

type FeaturedPageFields = {
  id: number;
  slug: string;
  title: { rendered: string };
  link?: string;
  parent?: number;
  acf?: {
    display_settings?: {
      is_featured?: boolean;
      feature_priority?: number | string;
      feature_type?: string;
    };
  };
};

/**
 * `getFeaturedPages`（ACF `display_settings.is_featured`）向け。
 */
export const mockWpGetFeaturedPages = (): FeaturedPageFields[] =>
  MOCK_WP_PAGES.filter((p) => {
    const acf = (p as FeaturedPageFields).acf;
    return acf?.display_settings?.is_featured === true;
  }) as FeaturedPageFields[];
