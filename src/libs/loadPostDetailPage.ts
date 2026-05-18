/**
 * 映画・アニメ・ドラマの記事詳細で共有する `getStaticPaths` / `getStaticProps` ファクトリ（ISR 300 秒）。
 */
// ISR: revalidate 300s. Shared getStaticPaths/Props logic for movie/anime/drama pages.
import type { GetStaticPaths, GetStaticProps } from 'next';
import {
  genreDisplayLabel,
  getGenres,
  getPostBySlug,
  getPosts,
  getPostsPagedMerge,
  getRelatedPosts,
  getPostsByActorSlug,
  getPostsByPersonSlug,
  mapWPPostToPost,
} from '@/libs/api/wordpress';
import { detectLang } from '@/libs/api/wordpress/lang';
import { extractToc } from '@/libs/toc';
import { pickRandom } from '@/libs/highscore';
import {
  buildPostDetailFromWp,
  extractRelationPostIds,
  extractPostsGroupSpecsFromWp,
  extractVodIntroductionRelatedPostsTermId,
} from '@/libs/buildPostDetailFromWp';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import type { PostDetailProps } from '@/components/templates/PostDetail/PostDetail.types';
import type { Post } from '@/types/post';
import type { TRelationPostItem } from '@/components/features/RelationPost';
import type { TPostsGroupItem } from '@/components/features/Post/PostsGroup';

export type PostDetailPageProps = {
  post: PostDetailProps['post'];
  locale: string;
  genres: GenreNavTag[];
};

/** 一覧用に `content` を除いた `Post` 形へ射影する。 */
const toListPost = (m: Post & { content: string }): Post => {
  const { content: _c, ...rest } = m;
  void _c;
  return rest;
};

/** 全ロケールの投稿スラッグから静的パスを生成する。`fallback: 'blocking'`。 */
export const makeGetStaticPaths = (): GetStaticPaths => async ({ locales }) => {
  const locs = (locales ?? ['ja', 'en']).filter((l: string) => l !== 'default');
  const paths: { params: { slug: string }; locale: string }[] = [];

  for (const loc of locs) {
    const posts = await getPosts({ per_page: 100 });
    for (const p of posts) {
      if (typeof p.slug === 'string') {
        paths.push({ params: { slug: p.slug }, locale: loc });
      }
    }
  }

  return { paths, fallback: 'blocking' };
};

/** 1 記事の詳細・目次・関連・サイド用データを組み立て、`revalidate: 300` で返す。 */
export const makeGetStaticProps = (): GetStaticProps<PostDetailPageProps> =>
  async ({ params, locale }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    const loc = locale === 'default' ? 'ja' : (locale ?? 'ja');
    const wpPost = await getPostBySlug(slug);
    if (!wpPost) return { notFound: true, revalidate: 60 };
    const wpAny = wpPost as Record<string, unknown>;
    const wpAcf = wpAny.acf as Record<string, unknown> | undefined;
    const postLang = detectLang(
      typeof wpAny.link === 'string' ? wpAny.link : undefined,
      typeof wpAcf?.lang === 'string' ? wpAcf.lang : undefined,
    );
    if (postLang !== loc) return { notFound: true, revalidate: 60 };

    const acfRecord = wpPost.acf as Record<string, unknown> | undefined;
    const relationIds = extractRelationPostIds(acfRecord);
    const groupSpecs = extractPostsGroupSpecsFromWp(wpPost);
    const groupIdSet = new Set(groupSpecs.flatMap((g) => g.ids));
    const allFetchIds = [...new Set([...relationIds, ...groupIdSet])];
    const relatedRaw = allFetchIds.length > 0 ? await getRelatedPosts(allFetchIds) : [];

    const relationPosts: TRelationPostItem[] = [];
    for (const id of relationIds) {
      const raw = relatedRaw.find((p) => p.id === id);
      if (!raw) continue;
      const m = mapWPPostToPost(raw);
      if (!m) continue;
      const item: TRelationPostItem = {
        id: raw.id,
        title: m.title,
        href: m.slug,
      };
      if (m.image) item.imageUrl = m.image;
      relationPosts.push(item);
    }

    const postsGroups: TPostsGroupItem[] = groupSpecs
      .map((g) => ({
        heading: g.heading,
        ...(g.description ? { description: g.description } : {}),
        posts: g.ids
          .map((id) => {
            const raw = relatedRaw.find((p) => p.id === id);
            if (!raw) return null;
            const m = mapWPPostToPost(raw);
            return m ? toListPost(m) : null;
          })
          .filter((p): p is Post => p !== null),
      }))
      .filter((g) => g.posts.length > 0);

    const vodTermId = extractVodIntroductionRelatedPostsTermId(wpPost);
    let vodRelatedPosts: Post[] | undefined;
    if (vodTermId !== undefined) {
      const vodFetched = await getPosts({ per_page: 12, vod: vodTermId });
      const mapped = vodFetched
        .filter((p) => p.id !== wpPost.id)
        .map((p) => mapWPPostToPost(p))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map(toListPost);
      const picked = pickRandom(mapped, 3);
      if (picked.length > 0) vodRelatedPosts = picked;
    }

    const detail = buildPostDetailFromWp({
      wp: wpPost,
      locale: loc,
      relationPosts: relationPosts.length > 0 ? relationPosts : undefined,
      postsGroups: postsGroups.length > 0 ? postsGroups : undefined,
      vodRelatedPosts,
    });
    if (!detail) return { notFound: true, revalidate: 60 };

    // キャストごとの他作品（フィルモグラフィー）を並列取得して otherWorks に付与する
    if (detail.actors && detail.actors.length > 0) {
      detail.actors = await Promise.all(
        detail.actors.map(async (actor) => {
          if (!actor.actorUrl) return actor;
          const urlParts = actor.actorUrl.split('/').filter(Boolean);
          const taxType = urlParts[0];
          const actorSlug = urlParts[1];
          if (!actorSlug) return actor;

          let posts: Awaited<ReturnType<typeof getPostsByActorSlug>> = [];
          if (taxType === 'actor' || taxType === 'actors') {
            posts = await getPostsByActorSlug(actorSlug);
          } else if (taxType === 'person' || taxType === 'persons') {
            posts = await getPostsByPersonSlug(actorSlug);
          }

          const otherWorks = posts
            .filter((p) => p.id !== wpPost.id)
            .slice(0, 5)
            .map((p) => {
              const m = mapWPPostToPost(p);
              if (!m) return null;
              return {
                title: m.title,
                href: m.slug,
                ...(m.score !== undefined ? { score: m.score } : {}),
              };
            })
            .filter((w): w is NonNullable<typeof w> => w !== null);

          if (otherWorks.length === 0) return actor;
          return { ...actor, otherWorks };
        }),
      );
    }

    const toc = extractToc(detail.content);

    const [allHighScore, allGenres] = await Promise.all([
      getPostsPagedMerge({ per_page: 100 }, 5),
      getGenres(),
    ]);

    const highScorePosts = pickRandom(
      allHighScore
        .filter((p) => (p.acf?.review_score ?? 0) >= 4)
        .map((p) => mapWPPostToPost(p))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map((mapped) => ({
          slug: mapped.slug,
          title: mapped.title,
          ...(mapped.image ? { thumbnailUrl: mapped.image } : {}),
          ...(mapped.score !== undefined ? { score: mapped.score } : {}),
        })),
      5,
    );

    const genres = allGenres.map((g) => ({
      slug: g.slug,
      name: genreDisplayLabel(g, loc),
      count: g.count,
    }));

    const excerptTrimmed = detail.excerpt.trim();
    const commentTrimmed = detail.authorComment?.trim() ?? "";
    const profile = {
      ...(excerptTrimmed.length > 0 ? { excerpt: excerptTrimmed } : {}),
      ...(commentTrimmed.length > 0 ? { comment: commentTrimmed } : {}),
    };

    return {
      props: {
        post: { ...detail, toc, highScorePosts, profile },
        locale: loc,
        genres,
      },
      revalidate: 300,
    };
  };
