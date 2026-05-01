// ISR: revalidate 60s. Shared getStaticPaths/Props logic for movie/anime/drama pages.
import type { GetStaticPaths, GetStaticProps } from 'next';
import {
  genreDisplayLabel,
  getGenres,
  getPostBySlug,
  getPosts,
  getRelatedPosts,
  mapWPPostToPost,
} from '@/lib/api/wordpress';
import { extractToc } from '@/lib/toc';
import { pickRandom } from '@/lib/highscore';
import {
  buildPostDetailFromWp,
  extractRelationPostIds,
  extractPostsGroupSpecsFromWp,
} from '@/lib/buildPostDetailFromWp';
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

const toListPost = (m: Post & { content: string }): Post => {
  const { content: _c, ...rest } = m;
  void _c;
  return rest;
};

export const makeGetStaticPaths = (): GetStaticPaths => async ({ locales }) => {
  const locs = locales ?? ['ja', 'en'];
  const paths: { params: { slug: string }; locale: string }[] = [];

  for (const loc of locs) {
    const posts = await getPosts({ per_page: 100, lang: loc });
    for (const p of posts) {
      if (typeof p.slug === 'string') {
        paths.push({ params: { slug: p.slug }, locale: loc });
      }
    }
  }

  return { paths, fallback: 'blocking' };
};

export const makeGetStaticProps = (): GetStaticProps<PostDetailPageProps> =>
  async ({ params, locale }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    const loc = locale ?? 'ja';
    const wpPost = await getPostBySlug(slug, loc);
    if (!wpPost) return { notFound: true };

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

    const detail = buildPostDetailFromWp({
      wp: wpPost,
      locale: loc,
      relationPosts: relationPosts.length > 0 ? relationPosts : undefined,
      postsGroups: postsGroups.length > 0 ? postsGroups : undefined,
    });
    if (!detail) return { notFound: true };

    const toc = extractToc(detail.content);

    const [allHighScore, allGenres] = await Promise.all([
      getPosts({ per_page: 100, lang: loc }),
      getGenres(loc),
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

    return {
      props: {
        post: { ...detail, toc, highScorePosts, profile: {} },
        locale: loc,
        genres,
      },
      revalidate: 60,
    };
  };
