/**
 * TOP（HomeTemplate）向けのサーバー側データ組み立て。WP から取得した記事・タグ等を正規化する。
 */
import type { HomeTemplateProps } from "@/components/templates/HomeTemplate/HomeTemplate.types";
import type { HomeHeroProps } from "@/components/features/HomeHero";
import type { FeaturedItem } from "@/components/ui-home/HomeFeatured";
import type { RecommendBlock } from "@/components/ui-home/HomeRecommend";
import type { Post } from "@/types/post";
import { getScoreRank } from "@/types/wordpress";
import {
  getPosts,
  getCategoriesForArchiveResolve,
  mapWPPostToPost,
  pickRandomTags,
  getPostsByTagId,
  getCategoryBySlug,
  getFeaturedPages,
} from "@/libs/api/wordpress";
import { stripHtml } from "@/libs/api/wordpress";
import { buildVodFinderItemsFromConfig } from "@/libs/buildVodFinderItems";
import { resolveAnimeCategoryMeta } from "@/config/wpContent.config";
import { getPostTypeArchivePath } from "@/libs/route";
import { WP_MOVIE_CATEGORY_SLUG } from "@/config/wpContent.config";
import { resolveSeasonalReviewParentId } from "@/libs/seasonalReviewParent";

const SEASONAL_REVIEWS_BASE_PATH = "/seasonal-reviews";

/**
 * レビュースコアをヒーロー表示用の 1〜5 の整数ランクに正規化する。
 * `undefined` や範囲外の数値は表示崩れを避けるため 3（中央）として扱う。
 *
 * @param score — ACF のレビュースコア（1〜5）。欠損可。
 * @returns 1 / 2 / 3 / 4 / 5 のいずれか。
 */
const rankFromScore = (score: number | undefined): 1 | 2 | 3 | 4 | 5 => {
  if (score === 1 || score === 2 || score === 3 || score === 4 || score === 5) return score;
  return 3;
};

/**
 * TOP 用 `Post` 配列をスコアの高い順に並べ替えるための比較関数。
 * `score` が無い投稿は 0 点として扱う。
 */
const sortByScoreDesc = (a: Post, b: Post) => (b.score ?? 0) - (a.score ?? 0);

/**
 * TOP 用 `Post` 配列を公開日（`publishedAt`）の新しい順に並べ替えるための比較関数。
 * ISO 日付文字列の辞書順比較に依存する。
 */
const sortByDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);

/**
 * WordPress REST の投稿配列（生 JSON）を正規化した `Post` 配列に変換する。
 * `mapWPPostToPost` でパースし、`content` は破棄する。`Post.lang`（`detectLang`）が
 * `routeLang` と異なる投稿は除外する（例: `/ja` では英語判定の投稿を載せない）。
 *
 * @param raw — `getPosts` 等から返った未検証の投稿オブジェクトの配列。
 * @param routeLang — ページのルート言語。`ja` または `en`。
 * @returns `content` を除いた `Post` の配列。
 */
const toMappedPostsForRoute = (raw: unknown[], routeLang: "ja" | "en"): Post[] => {
  const out: Post[] = [];
  for (const item of raw) {
    const m = mapWPPostToPost(item);
    if (!m) continue;
    if (routeLang && m.lang && m.lang !== routeLang) continue;
    const { content, ...rest } = m;
    void content;
    out.push(rest);
  }
  return out;
};

/**
 * 複数ページの取得結果などで混ざった `Post` 配列から、`id` が重複する行を除く。
 * 先に出現した要素を残し、後続の同一 `id` は捨てる。
 *
 * @param posts — 重複の可能性がある `Post` の配列。
 * @returns `id` ごとに 1 件だけ残した配列。
 */
const dedupePostsById = (posts: Post[]): Post[] => {
  const seen = new Set<string>();
  const out: Post[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
};

/**
 * ヒーロー（`HomeHero`）向けスライドデータを、プール投稿から組み立てる。
 * スコア 3.5 以上の投稿を候補とし、最大 8 件をクライアント側でランダム選択できるよう渡す。
 * 候補が 0 件のときはサイト名のみのプレースホルダ 1 枚を返す。
 *
 * @param posts — 既にルート言語でフィルタ済みの `Post` 配列（ランキング元と同じプールでよい）。
 * @returns `HomeHero` に渡す `slides` を含む props オブジェクト。
 */
const buildHeroFromPosts = (posts: Post[]): HomeHeroProps => {
  const candidates = posts
    .filter((p) => (p.score ?? 0) >= 3.5)
    .sort(sortByScoreDesc)
    .slice(0, 8);
  const slides: HomeHeroProps["slides"] = candidates.map((p) => {
    const rs = rankFromScore(p.score);
    return {
      title: p.title,
      copy: p.excerpt.length > 0 ? p.excerpt : p.title,
      score: p.score ?? rs,
      rank: getScoreRank(rs),
      href: p.slug,
      image: p.image ?? "/images/mock-image.webp",
    };
  });
  if (slides.length === 0) {
    return {
      slides: [
        {
          title: "KatsumaScore",
          copy: "",
          score: 3,
          rank: "A",
          href: "/posts",
          image: "/images/mock-image.webp",
        },
      ],
    };
  }
  return { slides };
};

/**
 * フィーチャー枠（`HomeFeatured`）用のカード行データに、投稿を最大 6 件まで変換する。
 * カテゴリ名をラベルに、抜粋を説明に使い、先頭 1 件を `isPrimary: true` にする。
 *
 * @param posts — 特集ページが無い場合のフォールバック元となる `Post` の配列。
 * @returns `FeaturedItem` の配列（最大 6 要素）。
 */
const toFeaturedItems = (posts: Post[]): FeaturedItem[] =>
  posts.slice(0, 6).map((p, i) => ({
    label: (p.category ?? "PICK").slice(0, 12).toUpperCase(),
    title: p.title,
    description:
      p.excerpt.length > 80 ? `${p.excerpt.slice(0, 80)}…` : p.excerpt || p.title,
    href: p.slug,
    isPrimary: i === 0,
  }));

/**
 * TOP の特集枠に固定ページを出す際のリンク先を決める。
 * 季節レビュー親ページの子は通常固定ページ直下ではなく `/seasonal-reviews/{slug}` に正規化する。
 */
const getFeaturedPageHref = (page: { slug: string; parent?: number }, seasonalParentId: number | null): string => {
  if (seasonalParentId && page.parent === seasonalParentId) {
    return `${SEASONAL_REVIEWS_BASE_PATH}/${page.slug}`;
  }
  return `/${page.slug}`;
};

/**
 * TOP ページ（`HomeTemplate`）向けに、WordPress から必要データを並列取得して `HomeTemplateProps` を組み立てる。
 * 投稿プールは `getPosts` の 1 ページ目から開始し、正規化後の `Post.lang` が内部言語（`ja` / `en`）と一致する投稿のみ採用する。
 * プールが 15 件未満のときは 2 ページ目以降を最大 4 ページまで取得し、`id` 重複を除いてマージする。
 * アニメ枠・おすすめ（タグ）・特集・VOD ブロックを含む。
 *
 * @param locale — Next の `locale` 文字列。`en` のとき英語、それ以外は日本語として扱う。
 * @returns ISR / `getStaticProps` からそのまま渡せるシリアライズ可能な `HomeTemplateProps`。
 */
export const loadHomeTemplateProps = async (locale: string): Promise<HomeTemplateProps> => {
  const lang = locale === "en" ? "en" : "ja";
  const movieSlug = WP_MOVIE_CATEGORY_SLUG;

  const homePoolFetchOptions = { timeoutMs: 15_000, maxRetries: 3 };

  const [categories, poolRaw, randomTags] = await Promise.all([
    getCategoriesForArchiveResolve(),
    getPosts({ per_page: 100 }, homePoolFetchOptions),
    pickRandomTags(3),
  ]);

  let pool = dedupePostsById(toMappedPostsForRoute(poolRaw, lang));
  const minHomePool = 15;
  const maxExtraPoolPages = 4;
  let poolPage = 1;
  while (pool.length < minHomePool && poolPage <= maxExtraPoolPages) {
    poolPage += 1;
    const moreRaw = await getPosts({ per_page: 100, page: poolPage }, homePoolFetchOptions);
    if (moreRaw.length === 0) break;
    pool = dedupePostsById([...pool, ...toMappedPostsForRoute(moreRaw, lang)]);
  }

  const rankingPosts = [...pool].sort(sortByScoreDesc).slice(0, 10);
  const latestPosts = [...pool].sort(sortByDateDesc).slice(0, 8);
  const highScorePosts = pool.filter((p) => (p.score ?? 0) >= 4).slice(0, 8);

  const animeCategoryId = resolveAnimeCategoryMeta(categories)?.id;
  const seasonalParentId = await resolveSeasonalReviewParentId();

  const [animeRaw, movieCategory, recommendBlockRows, featuredPages] = await Promise.all([
    animeCategoryId ? getPosts({ per_page: 8, category: animeCategoryId }) : Promise.resolve([]),
    getCategoryBySlug(movieSlug),
    Promise.all(
      randomTags.map(async (tag) => {
        const raw = await getPostsByTagId(tag.id, { per_page: 6 });
        return {
          tag: tag.name,
          posts: toMappedPostsForRoute(raw, lang),
          seeAllHref: `/search?q=${encodeURIComponent(tag.name)}`,
        } satisfies RecommendBlock;
      }),
    ),
    getFeaturedPages(),
  ]);

  const animePosts = toMappedPostsForRoute(animeRaw, lang);
  const recommendBlocks = recommendBlockRows.filter((b) => b.posts.length > 0);

  const featuredItemsFromPages: FeaturedItem[] = featuredPages.map((p, i) => ({
    label: "FEATURED",
    title: stripHtml(p.title.rendered),
    description: stripHtml(p.title.rendered),
    href: getFeaturedPageHref(p, seasonalParentId),
    isPrimary: i === 0,
  }));

  const movieRaw = featuredItemsFromPages.length === 0 && movieCategory
    ? await getPosts({ per_page: 6, category: movieCategory.id })
    : [];
  const moviePosts = toMappedPostsForRoute(movieRaw, lang);
  const featuredSource =
    moviePosts.length > 0 ? moviePosts : [...pool].sort(sortByDateDesc).slice(0, 6);
  const featuredItems =
    featuredItemsFromPages.length > 0 ? featuredItemsFromPages : toFeaturedItems(featuredSource);

  return {
    hero: buildHeroFromPosts(pool),
    rankingPosts,
    latestPosts,
    animeArchiveHref: getPostTypeArchivePath({ type: "anime", lang }),
    animePosts,
    highScorePosts,
    recommendBlocks,
    vodFinderItems: buildVodFinderItemsFromConfig(),
    featuredItems,
  };
};
