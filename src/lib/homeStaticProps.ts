import type { HomeTemplateProps } from "@/components/templates/HomeTemplate/HomeTemplate.types";
import type { HomeHeroProps } from "@/components/features/HomeHero";
import type { FeaturedItem } from "@/components/ui-home/HomeFeatured";
import type { WPCategory } from "@/types/wordpress";
import type { Post } from "@/types/post";
import { getScoreRank } from "@/types/wordpress";
import { getPosts, getCategories, mapWPPostToPost } from "@/lib/api/wordpress";
import { buildVodFinderItemsFromConfig } from "@/lib/buildVodFinderItems";
// recommendBlocks / seasonItems: 暫定モック（API 設計後に差し替え）
import { mockRecommendBlocks, mockSeasonItems } from "@/components/ui-home/mocks/home";

const rankFromScore = (score: number | undefined): 1 | 2 | 3 | 4 | 5 => {
  if (score === 1 || score === 2 || score === 3 || score === 4 || score === 5) return score;
  return 3;
};

const sortByScoreDesc = (a: Post, b: Post) => (b.score ?? 0) - (a.score ?? 0);
const sortByDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);

const toMappedPosts = (raw: unknown[]): Post[] => {
  const out: Post[] = [];
  for (const item of raw) {
    const m = mapWPPostToPost(item);
    if (m) {
      const { content, ...rest } = m;
      void content;
      out.push(rest);
    }
  }
  return out;
};

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

const resolveAnimeCategoryId = (categories: WPCategory[]): number | undefined => {
  const fromEnv = process.env.WP_ANIME_CATEGORY_ID;
  if (fromEnv && /^\d+$/.test(fromEnv)) return Number(fromEnv);
  const bySlug = categories.find((c) => c.slug === "anime");
  if (bySlug) return bySlug.id;
  return categories.find((c) => c.name.includes("アニメ"))?.id;
};

const toFeaturedItems = (posts: Post[]): FeaturedItem[] =>
  posts.slice(0, 6).map((p, i) => ({
    label: (p.category ?? "PICK").slice(0, 12).toUpperCase(),
    title: p.title,
    description:
      p.excerpt.length > 80 ? `${p.excerpt.slice(0, 80)}…` : p.excerpt || p.title,
    href: p.slug,
    isPrimary: i === 0,
  }));

export const loadHomeTemplateProps = async (locale: string): Promise<HomeTemplateProps> => {
  const lang = locale === "en" ? "en" : "ja";
  const [categories, poolRaw] = await Promise.all([
    getCategories(lang),
    getPosts({ per_page: 100, lang }),
  ]);

  const pool = toMappedPosts(poolRaw);

  const rankingPosts = [...pool].sort(sortByScoreDesc).slice(0, 10);
  const latestPosts = [...pool].sort(sortByDateDesc).slice(0, 8);
  const highScorePosts = pool.filter((p) => (p.score ?? 0) >= 4).slice(0, 8);

  const animeCategoryId = resolveAnimeCategoryId(categories);
  const animeRaw = animeCategoryId
    ? await getPosts({ per_page: 8, category: animeCategoryId, lang })
    : [];
  const animePosts = toMappedPosts(animeRaw);

  const featuredSource = [...pool].sort(sortByDateDesc).slice(0, 6);
  const featuredItems = toFeaturedItems(featuredSource);

  return {
    hero: buildHeroFromPosts(pool),
    rankingPosts,
    latestPosts,
    animePosts,
    highScorePosts,
    recommendBlocks: mockRecommendBlocks,
    vodFinderItems: buildVodFinderItemsFromConfig(),
    seasonItems: mockSeasonItems,
    featuredItems,
  };
};
