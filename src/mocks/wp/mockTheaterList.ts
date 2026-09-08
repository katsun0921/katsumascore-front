/**
 * `/v1/theater-list`（現在劇場公開中の記事一覧エンドポイント）のモック。
 *
 * `MOCK_WP_POSTS` のうち ACF `cinema_info_filed.is_cinema_showing` が
 * 立っている投稿だけを対象にする。WP 側の SQL と同じ順序で
 * 絞り込み → ソート → ページングを行う。
 */
import { MOCK_WP_POSTS } from "./mockWpDataset";
import type {
  TheaterListParams,
  TheaterListItem,
  TheaterListResponse,
  TheaterListTerm,
} from "@/libs/api/wordpress/endpoints/theaterList";

type TermLike = { id?: number; slug?: string; name?: string; taxonomy?: string };

/** 埋め込みタームを taxonomy 単位で取り出す。 */
const termsOf = (post: unknown, taxonomy: string): TheaterListTerm[] => {
  const groups = (post as { _embedded?: { "wp:term"?: TermLike[][] } })._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return [];
  return groups
    .flat()
    .filter((t) => t?.taxonomy === taxonomy)
    .map((t) => ({ id: t.id ?? 0, slug: t.slug ?? "", name: t.name ?? "" }));
};

/** ACF グループから値を1つ取り出す（グループでない場合は undefined）。 */
const acfGroupValue = (acf: Record<string, unknown> | undefined, group: string, key: string): unknown => {
  const value = acf?.[group];
  if (typeof value !== "object" || value === null) return undefined;
  return (value as Record<string, unknown>)[key];
};

/** ACF `cinema_info_filed.is_cinema_showing` が立っているか。 */
const isCinemaShowing = (post: unknown): boolean => {
  const acf = (post as { acf?: Record<string, unknown> }).acf;
  const value = acfGroupValue(acf, "cinema_info_filed", "is_cinema_showing");
  return value === true || value === 1 || value === "1";
};

/** ACF の `Ymd`（`20260801`）を WP のレスポンスと同じ `Y-m-d` へ整形する。 */
const toIsoDate = (ymd: unknown): string | null => {
  if (typeof ymd !== "string" || !/^\d{8}$/.test(ymd)) return null;
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
};

/** モック投稿1件を `TheaterListItem` へ変換する。 */
const toItem = (post: unknown): TheaterListItem => {
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
  const cinemaUrl = acfGroupValue(p.acf, "cinema_info_filed", "cinema_list_filed");

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
    releaseDate: toIsoDate(acfGroupValue(p.acf, "release", "release_date")),
    cinemaUrl: typeof cinemaUrl === "string" && cinemaUrl.length > 0 ? cinemaUrl : null,
    categories: termsOf(post, "category"),
    genres: termsOf(post, "genre"),
    tags: termsOf(post, "post_tag"),
  };
};

/** ソート種別に応じた比較関数。`release` は未入力を末尾に送る。 */
const compareItems = (filter: TheaterListParams["filter"]) => (a: TheaterListItem, b: TheaterListItem) => {
  if (filter === "score") return (b.score ?? 0) - (a.score ?? 0) || b.date.localeCompare(a.date);
  if (filter === "new") return b.date.localeCompare(a.date);
  return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || b.date.localeCompare(a.date);
};

/**
 * WP の `/v1/theater-list` と同じ挙動でモックデータを返す。
 * 上映中・言語で母集団を作り、絞り込み（category・genre・tag）→ ソート → ページングの順に適用する。
 */
export const mockTheaterList = (params: TheaterListParams): TheaterListResponse => {
  const all = MOCK_WP_POSTS.filter(isCinemaShowing)
    .map(toItem)
    .filter((i) => i.lang === params.lang);

  // フィルタ選択肢は category / genre / tag 絞り込み前の母集団から作る（WP 側と同じ）
  const collect = (pick: (item: TheaterListItem) => TheaterListTerm[]) => {
    const map = new Map<string, string>();
    for (const item of all) {
      for (const term of pick(item)) map.set(term.slug, term.name);
    }
    return [...map].map(([slug, name]) => ({ slug, name }));
  };
  const filterOptions = {
    categories: collect((i) => i.categories),
    genres: collect((i) => i.genres),
    tags: collect((i) => i.tags),
  };

  const bySlugs = (terms: TheaterListTerm[], csv: string) => {
    const slugs = csv.split(",");
    return terms.some((t) => slugs.includes(t.slug));
  };

  let filtered = all;
  if (params.category) filtered = filtered.filter((i) => bySlugs(i.categories, params.category ?? ""));
  if (params.genre) filtered = filtered.filter((i) => bySlugs(i.genres, params.genre ?? ""));
  if (params.tag) filtered = filtered.filter((i) => bySlugs(i.tags, params.tag ?? ""));

  const sorted = [...filtered].sort(compareItems(params.filter));

  const total = sorted.length;
  const totalPages = total > 0 ? Math.ceil(total / params.perPage) : 0;
  const start = (params.page - 1) * params.perPage;

  return {
    items: sorted.slice(start, start + params.perPage),
    meta: { page: params.page, perPage: params.perPage, total, totalPages },
    filterOptions,
  };
};
