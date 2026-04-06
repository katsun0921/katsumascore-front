import type { GetServerSideProps } from 'next';
import { getPostBySlug, getPosts, getTags, mapWPPostToPost } from '@/lib/api/wordpress';
import { extractToc } from '@/lib/toc';
import { pickRandom } from '@/lib/highscore';
import { PostDetail } from '@/components/templates/PostDetail/PostDetail';
import { PostSEO } from '@/components/features/PostSEO/PostSEO';
import type { PostDetailProps } from '@/components/templates/PostDetail/PostDetail.types';

type Props = {
  post: PostDetailProps['post'];
  locale: string;
  genres: import('@/components/features/sidebar/GenreNav/GenreNav').GenreNavTag[];
};

export default function PostPage({ post, locale, genres }: Props) {
  return (
    <>
      <PostSEO post={post} locale={locale} />
      <PostDetail post={post} genres={genres} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const wpPost = await getPostBySlug(slug, locale);
  if (!wpPost) return { notFound: true };

  const post = mapWPPostToPost(wpPost);
  const toc = extractToc(post.content);

  // HIGH SCORE（スコア4以上からランダム5件）+ ジャンルタグ
  const [allHighScore, allTags] = await Promise.all([
    getPosts({ per_page: 100, lang: locale }),
    getTags(locale),
  ]);
  const highScorePosts = pickRandom(
    allHighScore
      .filter((p) => (p.acf?.review_score ?? 0) >= 4)
      .map((p) => {
        const mapped = mapWPPostToPost(p);
        return {
          slug: mapped.slug,
          title: mapped.title,
          thumbnailUrl: mapped.image ?? undefined,
          score: mapped.score,
        };
      }),
    5,
  );

  const genres = allTags.map((tag) => ({
    slug: tag.slug,
    name: tag.name,
    count: tag.count,
  }));

  return {
    props: {
      post: { ...post, toc, highScorePosts },
      locale: locale ?? 'ja',
      genres,
    },
  };
};
