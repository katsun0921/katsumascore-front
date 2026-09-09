/**
 * `/v1/youtube-free-list`（YouTube 無料配信中の記事一覧エンドポイント）のモック。
 *
 * `MOCK_WP_POSTS` のうち ACF `youtube.status` が `streaming` かつ `youtube.price` が
 * 0（または未入力）の投稿だけを対象にする。WP 側の SQL と同じ順序で
 * 絞り込み → ソート → ページングを行う。
 */
import { MOCK_WP_POSTS } from "./mockWpDataset";
import type {
  YoutubeFreeListParams,
  YoutubeFreeListItem,
  YoutubeFreeListResponse,
  YoutubeFreeListTerm,
} from "@/libs/api/wordpress/endpoints/youtubeFreeList";

type TermLike = { id?: number; slug?: string; name?: string; taxonomy?: string };

/** 埋め込みタームを taxonomy 単位で取り出す。 */
const termsOf = (post: unknown, taxonomy: string): YoutubeFreeListTerm[] => {
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

/**
 * YouTube で無料配信中か。WP 側と同じく「`streaming` かつ価格が 0 か未入力」で判定する。
 * レンタル・購入は価格が入るためここで落ちる。
 */
const isYoutubeFree = (post: unknown): boolean => {
  const acf = (post as { acf?: Record<string, unknown> }).acf;
  if (acfGroupValue(acf, "youtube", "status") !== "streaming") return false;
  const price = acfGroupValue(acf, "youtube", "price");
  return price === undefined || price === null || price === "" || price === 0;
};

/** ACF `youtube.streaming_started_at`（`Y-m-d H:i:s`）を WP と同じ `Y-m-d` へ整形する。 */
const toStartedDate = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const matched = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  return matched ? matched[1] : null;
};

/** 文字列 ACF を取り出す。空文字は null にする（WP のレスポンスと合わせる）。 */
const nullableString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

/** モック投稿1件を `YoutubeFreeListItem` へ変換する。 */
const toItem = (post: unknown): YoutubeFreeListItem => {
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
    youtubeUrl: nullableString(acfGroupValue(p.acf, "youtube", "scraping_url")),
    channelName: nullableString(acfGroupValue(p.acf, "youtube", "channel_name")),
    streamingStartedAt: toStartedDate(acfGroupValue(p.acf, "youtube", "streaming_started_at")),
    categories: termsOf(post, "category"),
    genres: termsOf(post, "genre"),
    tags: termsOf(post, "post_tag"),
  };
};

/** ソート種別に応じた比較関数。`streaming` は未入力を末尾に送る。 */
const compareItems =
  (filter: YoutubeFreeListParams["filter"]) => (a: YoutubeFreeListItem, b: YoutubeFreeListItem) => {
    if (filter === "score") return (b.score ?? 0) - (a.score ?? 0) || b.date.localeCompare(a.date);
    if (filter === "new") return b.date.localeCompare(a.date);
    return (
      (b.streamingStartedAt ?? "").localeCompare(a.streamingStartedAt ?? "") ||
      b.date.localeCompare(a.date)
    );
  };

/**
 * WP の `/v1/youtube-free-list` と同じ挙動でモックデータを返す。
 * 無料配信中・言語で母集団を作り、絞り込み（category・genre・tag）→ ソート → ページングの順に適用する。
 */
export const mockYoutubeFreeList = (params: YoutubeFreeListParams): YoutubeFreeListResponse => {
  const all = MOCK_WP_POSTS.filter(isYoutubeFree)
    .map(toItem)
    .filter((i) => i.lang === params.lang);

  // フィルタ選択肢は category / genre / tag 絞り込み前の母集団から作る（WP 側と同じ）
  const collect = (pick: (item: YoutubeFreeListItem) => YoutubeFreeListTerm[]) => {
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

  const bySlugs = (terms: YoutubeFreeListTerm[], csv: string) => {
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
