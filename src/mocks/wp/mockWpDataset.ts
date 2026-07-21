/**
 * WP REST 互換のモックデータ（投稿・カテゴリ・タグ・genre / vod ターム・固定ページ）。
 * `isWpMockMode()` 時のみ API レイヤーから参照される。
 */
import type { components } from "@/libs/api/wordpress/generated/wp-schema";
import { mockPostContentFull } from "@/mocks/post";
import { WP_FEATURED_CATEGORY_SLUG } from "@/config/wpContent.config";
import { WP_SEASONAL_REVIEW_PARENT_SLUG } from "@/config/wpContent.config";

export type MockWPPost = components["schemas"]["WPPost"];

type Term = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
};

const term = (id: number, name: string, slug: string, taxonomy: string): Term => ({
  id,
  name,
  slug,
  taxonomy,
});

const CAT_MOVIE = term(10, "映画", "movie", "category");
const CAT_ANIME = term(11, "アニメ", "anime", "category");
const CAT_DRAMA = term(12, "ドラマ", "drama", "category");
const CAT_FEATURED = term(13, "特集", WP_FEATURED_CATEGORY_SLUG, "category");

const TAG_SF = term(301, "SF", "sf", "post_tag");
const TAG_HORROR = term(302, "ホラー", "horror", "post_tag");
const TAG_ACTION = term(303, "アクション", "action", "post_tag");

const GENRE_SCI_FI = term(401, "SF", "sci-fi", "genre");
const GENRE_HORROR = term(402, "ホラー", "horror", "genre");

const VOD_NETFLIX = term(201, "Netflix", "netflix", "vod");
const VOD_AMAZON = term(202, "Amazon Prime Video", "amazon-prime-video", "vod");

const ACTOR_YAMADA = term(501, "山田太郎", "yamada-taro", "actor");

const mockLink = (lang: "ja" | "en", categorySlug: string, slug: string): string =>
  `https://mock.katsumascore.local/${lang}/${categorySlug}/${slug}`;

type BuildPostOpts = {
  id: number;
  slug: string;
  title: string;
  category: Term;
  lang: "ja" | "en";
  score: 1 | 2 | 3 | 4 | 5;
  excerpt?: string;
  contentHtml?: string;
  extraTermGroups?: Term[][];
  vodFlags?: { amazon?: boolean; netflix?: boolean; hulu?: boolean; unext?: boolean };
  /** 記事紹介ショート動画（`short_movie.youtube` の URL または動画 ID）。記事の言語の動画を入れる */
  shortVideo?: string;
  /** ACF `director`（post_object。実際の WP は監督名の文字列を格納する） */
  director?: string;
};

const buildPost = (o: BuildPostOpts): MockWPPost => {
  const groups: Term[][] = [[o.category], ...(o.extraTermGroups ?? [])];
  const acf: Record<string, unknown> = {
    lang: o.lang,
    review_score: o.score,
    ...(o.vodFlags?.amazon ? { amazon_prime_video: { status: "streaming" } } : {}),
    ...(o.vodFlags?.netflix ? { netflix: { status: "streaming" } } : {}),
    ...(o.vodFlags?.hulu ? { hulu: { status: "streaming" } } : {}),
    ...(o.vodFlags?.unext ? { unext: { status: "streaming" } } : {}),
    ...(o.shortVideo !== undefined ? { short_movie: { youtube: o.shortVideo } } : {}),
    ...(o.director !== undefined ? { director: o.director } : {}),
  };

  return {
    id: o.id,
    slug: o.slug,
    link: mockLink(o.lang, o.category.slug, o.slug),
    title: { rendered: o.title },
    content: { rendered: o.contentHtml ?? "<p>モック本文です。</p>" },
    excerpt: { rendered: o.excerpt ?? "モックの抜粋テキスト。" },
    date: "2026-01-15T10:00:00",
    modified: "2026-02-01T12:00:00",
    featured_media: 1,
    acf,
    _embedded: {
      "wp:featuredmedia": [{ source_url: "/images/mock-image.webp" }],
      "wp:term": groups,
    },
  } as MockWPPost;
};

/** 一覧・詳細・検索で共有するモック投稿プール */
export const MOCK_WP_POSTS: MockWPPost[] = (() => {
  const rows: BuildPostOpts[] = [
    {
      id: 1001,
      slug: "hanataba-review",
      title: "映画『花束みたいな恋をした』レビュー",
      category: CAT_MOVIE,
      lang: "ja",
      score: 5,
      contentHtml: mockPostContentFull.content,
      excerpt: "モック環境用の長めのレビュー本文を含む映画記事。",
      extraTermGroups: [[TAG_SF], [GENRE_SCI_FI], [VOD_NETFLIX], [ACTOR_YAMADA]],
      vodFlags: { netflix: true },
      shortVideo: "https://www.youtube.com/shorts/M7lc1UVf-VE",
      director: "佐藤監督",
    },
    {
      id: 1002,
      slug: "frieren-quiet-power",
      title: "アニメ『葬送のフリーレン』の静かな強さ",
      category: CAT_ANIME,
      lang: "ja",
      score: 5,
      extraTermGroups: [[TAG_SF], [GENRE_SCI_FI], [VOD_AMAZON]],
      vodFlags: { amazon: true },
      shortVideo: "ScMzIvxBSi4",
    },
    {
      id: 1003,
      slug: "spring-drama-2026",
      title: "春ドラマ2026 注目作レビュー",
      category: CAT_DRAMA,
      lang: "ja",
      score: 4,
      extraTermGroups: [[TAG_HORROR], [GENRE_HORROR]],
    },
    {
      id: 1004,
      slug: "mock-movie-b",
      title: "モック映画B — スコア4",
      category: CAT_MOVIE,
      lang: "ja",
      score: 4,
      extraTermGroups: [[TAG_ACTION], [GENRE_SCI_FI], [VOD_NETFLIX, VOD_AMAZON]],
      vodFlags: { netflix: true, amazon: true },
    },
    {
      id: 1005,
      slug: "mock-movie-c",
      title: "モック映画C — スコア3",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[TAG_SF]],
    },
    {
      id: 1006,
      slug: "mock-anime-b",
      title: "モックアニメB",
      category: CAT_ANIME,
      lang: "ja",
      score: 4,
    },
    {
      id: 1007,
      slug: "mock-anime-c",
      title: "モックアニメC",
      category: CAT_ANIME,
      lang: "ja",
      score: 3,
    },
    {
      id: 1008,
      slug: "mock-drama-b",
      title: "モックドラマB",
      category: CAT_DRAMA,
      lang: "ja",
      score: 4,
    },
    {
      id: 1009,
      slug: "mock-drama-c",
      title: "モックドラマC",
      category: CAT_DRAMA,
      lang: "ja",
      score: 2,
    },
    {
      id: 1010,
      slug: "horror-mock",
      title: "モックホラー映画",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[TAG_HORROR], [GENRE_HORROR], [VOD_NETFLIX]],
      vodFlags: { netflix: true },
    },
    {
      id: 1011,
      slug: "rec-mock",
      title: "REC レック を振り返る",
      category: CAT_MOVIE,
      lang: "ja",
      score: 4,
      extraTermGroups: [[TAG_HORROR], [GENRE_HORROR]],
    },
    {
      id: 1012,
      slug: "avatar-mock",
      title: "アバター モックレビュー",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[TAG_SF], [GENRE_SCI_FI]],
    },
    {
      id: 1013,
      slug: "equalizer-mock",
      title: "イコライザー モック",
      category: CAT_MOVIE,
      lang: "ja",
      score: 4,
      extraTermGroups: [[TAG_ACTION], [VOD_AMAZON]],
      vodFlags: { amazon: true },
    },
    {
      id: 1014,
      slug: "m3gan-mock",
      title: "M3GAN モック",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[TAG_HORROR]],
    },
    {
      id: 1015,
      slug: "troll-mock",
      title: "トロール モック",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[VOD_NETFLIX]],
      vodFlags: { netflix: true },
    },
    {
      id: 1016,
      slug: "kpop-girls-mock",
      title: "KPOPガールズ モック",
      category: CAT_ANIME,
      lang: "ja",
      score: 5,
    },
    {
      id: 1017,
      slug: "hathaway-mock",
      title: "閃光のハサウェイ モック",
      category: CAT_ANIME,
      lang: "ja",
      score: 4,
    },
    {
      id: 1018,
      slug: "one-battle-mock",
      title: "ワン・バトル モック",
      category: CAT_MOVIE,
      lang: "ja",
      score: 4,
    },
    {
      id: 1019,
      slug: "voyager-mock",
      title: "ヴォイジャー モック",
      category: CAT_MOVIE,
      lang: "ja",
      score: 3,
      extraTermGroups: [[GENRE_SCI_FI], [TAG_SF]],
    },
    {
      id: 1020,
      slug: "en-movie-sample",
      title: "Mock English movie review",
      category: CAT_MOVIE,
      lang: "en",
      score: 4,
      excerpt: "Mock excerpt for English route.",
      shortVideo: "https://www.youtube.com/shorts/aqz-KE-bpKQ",
    },
    {
      id: 1021,
      slug: "en-anime-sample",
      title: "Mock English anime review",
      category: CAT_ANIME,
      lang: "en",
      score: 5,
    },
    {
      id: 1022,
      slug: "featured-landing-mock",
      title: "特集ランディング（モック）",
      category: CAT_FEATURED,
      lang: "ja",
      score: 3,
    },
  ];
  return rows.map(buildPost);
})();

export type MockWPCategory = components["schemas"]["WPCategory"];

/** `getCategories` / アーカイブ解決用 */
export const MOCK_WP_CATEGORIES: MockWPCategory[] = [
  { id: CAT_MOVIE.id, slug: CAT_MOVIE.slug, name: CAT_MOVIE.name, count: 12, parent: 0 },
  { id: CAT_ANIME.id, slug: CAT_ANIME.slug, name: CAT_ANIME.name, count: 6, parent: 0 },
  { id: CAT_DRAMA.id, slug: CAT_DRAMA.slug, name: CAT_DRAMA.name, count: 3, parent: 0 },
  { id: CAT_FEATURED.id, slug: CAT_FEATURED.slug, name: CAT_FEATURED.name, count: 1, parent: 0 },
];

export type MockWPTag = components["schemas"]["WPTag"];

export const MOCK_WP_TAGS: MockWPTag[] = [
  { id: TAG_SF.id, slug: TAG_SF.slug, name: TAG_SF.name, count: 8 },
  { id: TAG_HORROR.id, slug: TAG_HORROR.slug, name: TAG_HORROR.name, count: 5 },
  { id: TAG_ACTION.id, slug: TAG_ACTION.slug, name: TAG_ACTION.name, count: 3 },
];

export type MockGenreTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
  acf?: { ja?: string; en?: string };
};

export const MOCK_WP_GENRES: MockGenreTerm[] = [
  { id: GENRE_SCI_FI.id, slug: GENRE_SCI_FI.slug, name: GENRE_SCI_FI.name, count: 6, acf: { ja: "SF", en: "Science Fiction" } },
  { id: GENRE_HORROR.id, slug: GENRE_HORROR.slug, name: GENRE_HORROR.name, count: 4, acf: { ja: "ホラー", en: "Horror" } },
];

export type MockVodTerm = {
  id: number;
  slug: string;
  name: string;
  count: number;
};

export const MOCK_WP_VOD_TERMS: MockVodTerm[] = [
  { id: VOD_NETFLIX.id, slug: VOD_NETFLIX.slug, name: VOD_NETFLIX.name, count: 5 },
  { id: VOD_AMAZON.id, slug: VOD_AMAZON.slug, name: VOD_AMAZON.name, count: 4 },
];

const seasonalParentId = 500;

/** 固定ページ（季節レビュー・フィーチャー用）。OpenAPI の WPPage より ACF / 埋め込みが広いため二重アサートする。 */
export const MOCK_WP_PAGES = [
  {
    id: seasonalParentId,
    slug: WP_SEASONAL_REVIEW_PARENT_SLUG,
    title: { rendered: "季節のアニメとドラマのレビュー" },
    content: { rendered: "<p>親ページ（モック）</p>" },
    date: "2026-01-01T00:00:00",
    modified: "2026-01-01T00:00:00",
    parent: 0,
  },
  {
    id: 501,
    slug: "winter-2026-reviews",
    title: { rendered: "2026年冬アニメ・ドラマ一口レビュー" },
    content: { rendered: "<p>子ページ本文モック</p>" },
    date: "2026-01-10T00:00:00",
    modified: "2026-01-20T00:00:00",
    parent: seasonalParentId,
    _embedded: { "wp:featuredmedia": [{ source_url: "/images/mock-image.webp" }] },
  },
  {
    id: 502,
    slug: "spring-2026-reviews",
    title: { rendered: "2026年春の注目作品" },
    content: { rendered: "<p>春モック</p>" },
    date: "2026-02-01T00:00:00",
    modified: "2026-02-05T00:00:00",
    parent: seasonalParentId,
  },
  {
    id: 503,
    slug: "mock-featured-page",
    title: { rendered: "モック特集固定ページ" },
    content: { rendered: "" },
    date: "2026-01-05T00:00:00",
    modified: "2026-01-05T00:00:00",
    parent: 0,
    acf: {
      display_settings: { is_featured: true, feature_priority: 1 },
    },
  },
] as unknown as components["schemas"]["WPPage"][];
