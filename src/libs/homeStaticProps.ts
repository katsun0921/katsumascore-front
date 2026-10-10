/**
 * TOP（HomeTemplate）向けのサーバー側データ組み立て。WP から取得した記事・タグ等を正規化する。
 */
import type { HomeTemplateProps } from "@/components/templates/HomeTemplate/HomeTemplate.types";
import type { HomeHeroProps } from "@/components/features/HomeHero";
import type { FeaturedItem } from "@/components/ui-home/HomeFeatured";
import type { RecommendBlock } from "@/components/ui-home/HomeRecommend";
import type { ReleaseHighlightBlock } from "@/components/ui-home/HomeReleaseHighlight";
import { extractReleaseWorks } from "@/libs/releaseWorks";
import type { Post } from "@/types/post";
import { getRankingIcon } from "@/components/features/ScoreWithRank/getRankingIcon";
import type { ScoreRank } from "@/types/wordpress";
import {
  getPosts,
  getCategoriesForArchiveResolve,
  mapWPPostToPost,
  pickRandomTags,
  getPostsByTagId,
  getCategoryBySlug,
  getFeaturedPages,
  getVodTerms,
  getTheaterReleases,
  getVodReleases,
  getTheaterList,
  getHomeCuratedCollections,
} from "@/libs/api/wordpress";
import type { TheaterListItem, WPCuratedCollection, WPTheaterRelease, WPVodRelease } from "@/libs/api/wordpress";
import type { HomeCuratedCollection } from "@/components/templates/HomeTemplate/HomeTemplate.types";
import { stripHtml } from "@/libs/api/wordpress";
import { buildVodFinderItemsFromTerms } from "@/libs/vodPathToWpSlug";
import { resolveCategoryMeta, WP_ANIME_CATEGORY_SLUG, WP_MOVIE_CATEGORY_SLUG } from "@/config/wpContent.config";
import { getNowShowingArchivePath, getPostTypeArchivePath, getTaxonomyUrl, getTheaterReleaseUrl, getVodReleaseUrl } from "@/libs/route";
import { theaterListItemToPost } from "@/utils/theaterListItemToPost";
import { resolveSeasonalReviewParentId } from "@/libs/seasonalReviewParent";
import { buildSeasonalIndexProps, SEASONAL_REVIEWS_BASE_PATH } from "@/libs/seasonalReviewIndex";

/**
 * TOP の「こちらもおすすめ」に出すランダムタグの数。
 * 現在は1つだが、`recommendBlocks` は複数ブロックを前提とした配列のまま保つ。
 */
const RECOMMEND_TAG_COUNT = 1;

/** TOP の「劇場公開中」枠に出す件数。横スクロール1本に収まる範囲に留める。 */
const NOW_SHOWING_HOME_LIMIT = 10;

/** スコア（小数可）からヒーロー表示用の ScoreRank を返す。範囲外は 'A'（中央）。 */
const rankFromScore = (score: number | undefined): ScoreRank =>
  getRankingIcon(score ?? 3)?.label ?? 'A';

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
 * ショート動画枠用の比較関数。更新日（`updatedAt`）の新しい順に並べ替える。
 * YouTube 側の投稿順を厳密には持たないため、記事の更新順を代替指標として使う。
 * `updatedAt` 未設定時は `publishedAt` にフォールバックする。
 */
const sortByUpdatedAtDesc = (a: Post, b: Post) =>
  (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt);

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
      score: p.score ?? 3,
      rank: rs,
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
          href: "/",
          image: "/images/mock-image.webp",
        },
      ],
    };
  }
  return { slides };
};

/** 劇場公開情報（週次まとめ記事）の最新1件を、作品リスト付きの TOP ハイライト用ブロックに変換する。 */
const toTheaterReleaseHighlight = (
  release: WPTheaterRelease | undefined,
  lang: "ja" | "en",
): ReleaseHighlightBlock | undefined =>
  release
    ? {
        href: getTheaterReleaseUrl(release.slug, lang),
        works: extractReleaseWorks(release.content.rendered),
        articleTitle: stripHtml(release.title.rendered),
      }
    : undefined;

/** VOD配信情報（週次まとめ記事）の最新1件を、作品リスト付きの TOP ハイライト用ブロックに変換する。 */
const toVodReleaseHighlight = (
  release: WPVodRelease | undefined,
  lang: "ja" | "en",
): ReleaseHighlightBlock | undefined =>
  release
    ? {
        href: getVodReleaseUrl(release.slug, lang),
        works: extractReleaseWorks(release.content.rendered),
        articleTitle: stripHtml(release.title.rendered),
      }
    : undefined;

/**
 * フィーチャー枠（`HomeFeatured`）用のカード行データに、投稿を最大 6 件まで変換する。
 * カテゴリ名をラベルに、抜粋を説明に使う。
 * `isPrimary`（先頭カードの強調）は並び確定後に呼び出し側がまとめて付与する。
 *
 * @param posts — 特集ページが無い場合のフォールバック元となる `Post` の配列。
 * @returns `FeaturedItem` の配列（最大 6 要素）。
 */
const toFeaturedItems = (posts: Post[]): FeaturedItem[] =>
  posts.slice(0, 6).map((p) => ({
    label: (p.category ?? "PICK").slice(0, 12).toUpperCase(),
    title: p.title,
    description:
      p.excerpt.length > 80 ? `${p.excerpt.slice(0, 80)}…` : p.excerpt || p.title,
    href: p.slug,
  }));

/** TOP の特集枠で季節まとめに付けるラベル。 */
const SEASONAL_FEATURED_LABEL = "SEASONAL";

/**
 * 最新の季節まとめ1件を特集枠のカードへ変換する。
 *
 * 季節まとめは「今期に何を観るか」という回遊の入口になるため、特集枠の
 * 先頭に固定して TOP から直接辿れるようにする。
 * 並び順・CPT と固定ページの統合は `buildSeasonalIndexProps` が持つため、
 * その先頭要素をそのまま最新として採用する。
 *
 * @returns 変換した `FeaturedItem`。季節まとめが1件も無ければ `undefined`。
 */
const toSeasonalFeaturedItem = (items: Post[]): FeaturedItem | undefined => {
  const latest = items[0];
  if (!latest) return undefined;
  return {
    label: SEASONAL_FEATURED_LABEL,
    title: latest.title,
    description: latest.excerpt.length > 80 ? `${latest.excerpt.slice(0, 80)}…` : latest.excerpt || latest.title,
    href: latest.slug,
  };
};

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
 * WP のキュレーション枠を、表示用の `HomeCuratedCollection` に変換する。
 *
 * 並び順は WP が返した順をそのまま使う。記事は `theaterListItemToPost` で `Post` 化し、
 * ACF `lang` が `lang` と異なるものを除外する。除外の結果 0 件になった枠・シリーズは捨てる
 * （空見出しを残さない）。見出しのリンク先は `franchise` のみ解決する
 * （`series` CPT のページは未実装のため `null`＝テキストのみ）。
 */
const toCuratedCollections = (rows: WPCuratedCollection[], lang: "ja" | "en"): HomeCuratedCollection[] => {
  const toPosts = (items: TheaterListItem[]): Post[] =>
    items
      .filter((item) => item.lang === "" || item.lang === lang)
      .map((item) => theaterListItemToPost(item, lang));

  return rows.flatMap((row): HomeCuratedCollection[] => {
    const base = { label: row.label, description: row.description, seeAllHref: row.seeAllHref };
    if (row.kind === "posts") {
      const posts = toPosts(row.items);
      return posts.length > 0 ? [{ ...base, kind: "posts", posts }] : [];
    }
    const items = row.items.flatMap((item) => {
      const posts = toPosts(item.posts);
      if (posts.length === 0) return [];
      return [
        {
          id: String(item.id),
          title: item.title,
          href: row.kind === "franchise" ? getTaxonomyUrl("franchise", item.slug, lang) : null,
          description: item.description,
          image: item.image,
          postCount: item.postCount,
          posts,
        },
      ];
    });
    return items.length > 0 ? [{ ...base, kind: "series", items }] : [];
  });
};

/**
 * TOP ページ（`HomeTemplate`）向けに、WordPress から必要データを並列取得して `HomeTemplateProps` を組み立てる。
 * 投稿プールは `getPosts` の 1 ページ目から開始し、正規化後の `Post.lang` が内部言語（`ja` / `en`）と一致する投稿のみ採用する。
 * プールが 15 件未満のときは 2 ページ目以降を最大 4 ページまで取得し、`id` 重複を除いてマージする。
 * アニメ枠・ショート動画枠・おすすめ（タグ）・特集・VOD ブロックを含む。
 * 劇場公開中枠は日本語のみの運用のため、`ja` のときだけ取得する（`en` では空配列＝非表示）。
 *
 * @param locale — Next の `locale` 文字列。`en` のとき英語、それ以外は日本語として扱う。
 * @returns ISR / `getStaticProps` からそのまま渡せるシリアライズ可能な `HomeTemplateProps`。
 */
export const loadHomeTemplateProps = async (locale: string): Promise<HomeTemplateProps> => {
  const lang = locale === "en" ? "en" : "ja";
  const movieSlug = WP_MOVIE_CATEGORY_SLUG;

  const homePoolFetchOptions = { timeoutMs: 15_000, maxRetries: 3 };

  const [categories, poolRaw, randomTags, vodTerms, theaterReleases, vodReleases, nowShowing, curated] = await Promise.all([
    getCategoriesForArchiveResolve(),
    getPosts({ per_page: 100 }, homePoolFetchOptions),
    pickRandomTags(RECOMMEND_TAG_COUNT),
    getVodTerms(),
    getTheaterReleases(1),
    getVodReleases(1),
    // 上映中の作品（`/v1/theater-list`）。劇場公開情報は日本語のみの運用のため ja の TOP でのみ取得する。
    // 取得しない・取得失敗・0件のときはセクションごと出さない
    lang === "ja"
      ? getTheaterList({ lang: "ja", page: 1, perPage: NOW_SHOWING_HOME_LIMIT, filter: "release" })
      : Promise.resolve(null),
    // 編集部のキュレーション枠。取得失敗・未設定は空配列（TOP の既存セクションは落とさない）
    getHomeCuratedCollections(lang),
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
  const shortVideoPosts = pool
    .filter((p) => p.shortVideoId !== undefined)
    .sort(sortByUpdatedAtDesc)
    .slice(0, 10);

  const animeCategoryId = resolveCategoryMeta(categories, WP_ANIME_CATEGORY_SLUG)?.id;
  const seasonalParentId = await resolveSeasonalReviewParentId();

  const [animeRaw, movieCategory, recommendBlockRows, featuredPages, seasonalIndex] = await Promise.all([
    animeCategoryId ? getPosts({ per_page: 8, category: animeCategoryId }) : Promise.resolve([]),
    getCategoryBySlug(movieSlug),
    Promise.all(
      randomTags.map(async (tag) => {
        const raw = await getPostsByTagId(tag.id, { per_page: 6 });
        return {
          tag: tag.name,
          posts: toMappedPostsForRoute(raw, lang),
          seeAllHref: `/tag/${tag.slug}`,
        } satisfies RecommendBlock;
      }),
    ),
    getFeaturedPages(),
    buildSeasonalIndexProps(locale),
  ]);

  const animePosts = toMappedPostsForRoute(animeRaw, lang);
  const recommendBlocks = recommendBlockRows.filter((b) => b.posts.length > 0);

  const seasonalFeaturedItem = toSeasonalFeaturedItem(seasonalIndex.items);

  const featuredItemsFromPages: FeaturedItem[] = featuredPages.map((p) => ({
    label: "FEATURED",
    title: stripHtml(p.title.rendered),
    description: stripHtml(p.title.rendered),
    href: getFeaturedPageHref(p, seasonalParentId),
  }));

  const movieRaw = featuredItemsFromPages.length === 0 && movieCategory
    ? await getPosts({ per_page: 6, category: movieCategory.id })
    : [];
  const moviePosts = toMappedPostsForRoute(movieRaw, lang);
  const featuredSource =
    moviePosts.length > 0 ? moviePosts : [...pool].sort(sortByDateDesc).slice(0, 6);
  const featuredRest =
    featuredItemsFromPages.length > 0 ? featuredItemsFromPages : toFeaturedItems(featuredSource);

  // 季節まとめを特集枠の先頭に固定する。取得できなければ従来どおりの並びに戻す。
  // 強調（isPrimary）は必ず先頭の1件だけになるよう、ここで最終的に決める
  const featuredItems: FeaturedItem[] = (
    seasonalFeaturedItem ? [seasonalFeaturedItem, ...featuredRest] : featuredRest
  ).map((item, i) => ({ ...item, isPrimary: i === 0 }));

  return {
    hero: buildHeroFromPosts(pool),
    rankingPosts,
    latestPosts,
    latestSeeAllHref: getPostTypeArchivePath({ type: "movie", lang }),
    animeArchiveHref: getPostTypeArchivePath({ type: "anime", lang }),
    animePosts,
    highScorePosts,
    nowShowingPosts: (nowShowing?.items ?? []).map((item) => theaterListItemToPost(item, "ja")),
    nowShowingSeeAllHref: getNowShowingArchivePath("ja"),
    shortVideoPosts,
    recommendBlocks,
    vodFinderItems: buildVodFinderItemsFromTerms(vodTerms ?? []),
    featuredItems,
    curatedCollections: toCuratedCollections(curated, lang),
    theaterReleaseHighlight: toTheaterReleaseHighlight(theaterReleases[0], lang),
    vodReleaseHighlight: toVodReleaseHighlight(vodReleases[0], lang),
  };
};
