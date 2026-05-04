/**
 * TOP（HomeTemplate）向けのサーバー側データ組み立て。WP から取得した記事・タグ・季節レビュー等を正規化する。
 */
import type { HomeTemplateProps } from "@/components/templates/HomeTemplate/HomeTemplate.types";
import type { HomeHeroProps } from "@/components/features/HomeHero";
import type { FeaturedItem } from "@/components/ui-home/HomeFeatured";
import type { SeasonItem } from "@/components/ui-home/HomeSeasonReview";
import type { RecommendBlock } from "@/components/ui-home/HomeRecommend";
import type { WPPage } from "@/types/wordpress";
import type { Post } from "@/types/post";
import { getScoreRank } from "@/types/wordpress";
import {
  getPosts,
  getCategoriesForArchiveResolve,
  mapWPPostToPost,
  pickRandomTags,
  getPostsByTagId,
  getCategoryBySlug,
  getChildPages,
  getFeaturedPages,
} from "@/libs/api/wordpress";
import { stripHtml } from "@/libs/api/wordpress";
import { buildVodFinderItemsFromConfig } from "@/libs/buildVodFinderItems";
import { resolveAnimeCategoryMeta } from "@/libs/loadAnimeListPage";
import { getPostTypeArchivePath } from "@/libs/route";

/** 表示用ランク計算に使う 1〜5。不正値は中央の 3 とみなす。 */
const rankFromScore = (score: number | undefined): 1 | 2 | 3 | 4 | 5 => {
  if (score === 1 || score === 2 || score === 3 || score === 4 || score === 5) return score;
  return 3;
};

/** スコア降順ソート用コンパレータ。 */
const sortByScoreDesc = (a: Post, b: Post) => (b.score ?? 0) - (a.score ?? 0);
/** 公開日降順ソート用コンパレータ。 */
const sortByDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);

/** WP 生配列を `mapWPPostToPost` し、言語フィルタと `content` 除去を行う。 */
const toMappedPosts = (raw: unknown[], locale?: string): Post[] => {
  const out: Post[] = [];
  for (const item of raw) {
    const m = mapWPPostToPost(item);
    if (!m) continue;
    if (locale && m.lang && m.lang !== locale) continue;
    const { content, ...rest } = m;
    void content;
    out.push(rest);
  }
  return out;
};

/** スコア上位 3 件からヒーロースライド用データを作る。0 件時はプレースホルダ 1 枚。 */
const buildHeroFromPosts = (posts: Post[]): HomeHeroProps => {
  const top = [...posts].sort(sortByScoreDesc).slice(0, 3);
  const slides: HomeHeroProps["slides"] = top.map((p) => {
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

/** 先頭最大 6 件をフィーチャーカード用の行データに変換する。 */
const toFeaturedItems = (posts: Post[]): FeaturedItem[] =>
  posts.slice(0, 6).map((p, i) => ({
    label: (p.category ?? "PICK").slice(0, 12).toUpperCase(),
    title: p.title,
    description:
      p.excerpt.length > 80 ? `${p.excerpt.slice(0, 80)}…` : p.excerpt || p.title,
    href: p.slug,
    isPrimary: i === 0,
  }));

/** 季節レビュー子ページを、ラベル・期間・リンク付きの一覧行に変換する。 */
const mapWpPagesToSeasonItems = (pages: WPPage[]): SeasonItem[] =>
  pages.map((p) => ({
    label: stripHtml(p.title.rendered),
    period: (p.modified || p.date || "").slice(0, 10),
    href: `/seasonal-reviews/${p.slug}`,
  }));

/** 環境変数のカンマ区切りリストをトリム分割する。空なら `undefined`。 */
const parseCommaList = (raw: string | undefined): string[] | undefined => {
  if (!raw?.trim()) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};

/** 指定ロケールで Home テンプレートに渡す props をまとめて取得する。 */
export const loadHomeTemplateProps = async (locale: string): Promise<HomeTemplateProps> => {
  const lang = locale === "en" ? "en" : "ja";
  const movieSlug = process.env.WP_MOVIE_CATEGORY_SLUG ?? "movie";
  const seasonalParentRaw = process.env.WP_SEASONAL_REVIEW_PARENT_ID;

  const [categories, poolRaw, randomTags] = await Promise.all([
    getCategoriesForArchiveResolve(lang),
    getPosts({ per_page: 100, lang }),
    pickRandomTags(3, lang),
  ]);

  const pool = toMappedPosts(poolRaw, lang);

  const rankingPosts = [...pool].sort(sortByScoreDesc).slice(0, 10);
  const latestPosts = [...pool].sort(sortByDateDesc).slice(0, 8);
  const highScorePosts = pool.filter((p) => (p.score ?? 0) >= 4).slice(0, 8);

  const animeCategoryId = resolveAnimeCategoryMeta(categories)?.id;

  const [animeRaw, movieCategory, recommendBlockRows, seasonalChildren, featuredPages] = await Promise.all([
    animeCategoryId ? getPosts({ per_page: 8, category: animeCategoryId, lang }) : Promise.resolve([]),
    getCategoryBySlug(movieSlug, lang),
    Promise.all(
      randomTags.map(async (tag) => {
        const raw = await getPostsByTagId(tag.id, { per_page: 6, lang });
        return {
          tag: tag.name,
          posts: toMappedPosts(raw, lang),
          seeAllHref: `/search?q=${encodeURIComponent(tag.name)}`,
        } satisfies RecommendBlock;
      }),
    ),
    seasonalParentRaw && /^\d+$/.test(seasonalParentRaw)
      ? getChildPages(Number(seasonalParentRaw), lang)
      : Promise.resolve([]),
    getFeaturedPages(lang),
  ]);

  const animePosts = toMappedPosts(animeRaw, lang);
  const recommendBlocks = recommendBlockRows.filter((b) => b.posts.length > 0);

  const featuredItemsFromPages: FeaturedItem[] = featuredPages.map((p, i) => ({
    label: "FEATURED",
    title: stripHtml(p.title.rendered),
    description: stripHtml(p.title.rendered),
    href: `/${p.slug}`,
    isPrimary: i === 0,
  }));

  const movieRaw = featuredItemsFromPages.length === 0 && movieCategory
    ? await getPosts({ per_page: 6, category: movieCategory.id, lang })
    : [];
  const moviePosts = toMappedPosts(movieRaw, lang);
  const featuredSource =
    moviePosts.length > 0 ? moviePosts : [...pool].sort(sortByDateDesc).slice(0, 6);
  const featuredItems =
    featuredItemsFromPages.length > 0 ? featuredItemsFromPages : toFeaturedItems(featuredSource);

  const seasonItems = mapWpPagesToSeasonItems(seasonalChildren);

  const facebookTimelineEmbedUrl = process.env.NEXT_PUBLIC_FACEBOOK_TIMELINE_EMBED_URL?.trim() || undefined;
  const homeAdScriptSrcs = parseCommaList(process.env.NEXT_PUBLIC_HOME_EXTRA_SCRIPT_SRCS);

  return {
    hero: buildHeroFromPosts(pool),
    rankingPosts,
    latestPosts,
    animeArchiveHref: getPostTypeArchivePath({ type: "anime", lang }),
    animePosts,
    highScorePosts,
    recommendBlocks,
    vodFinderItems: buildVodFinderItemsFromConfig(),
    seasonItems,
    featuredItems,
    ...(facebookTimelineEmbedUrl ? { facebookTimelineEmbedUrl } : {}),
    ...(homeAdScriptSrcs ? { homeAdScriptSrcs } : {}),
  };
};
