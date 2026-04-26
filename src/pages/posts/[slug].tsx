import type { GetServerSideProps } from 'next';
import { getPostBySlug, getPosts, getTags, mapWPPostToPost } from '@/lib/api/wordpress';
import { extractToc } from '@/lib/toc';
import { pickRandom } from '@/lib/highscore';
import { PostDetail } from '@/components/templates/PostDetail';
import { SeoHead } from '@/components/ui-section/SeoHead';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import type { GenreNavTag } from '@/components/features/GenreNav/GenreNav';
import type { PostDetailProps } from '@/components/templates/PostDetail/PostDetail.types';

type Props = {
  post: PostDetailProps['post'];
  locale: string;
  genres: GenreNavTag[];
};

export const PostPage = ({ post, locale, genres }: Props) => {
  const currentLocale = (locale ?? 'ja') as Locale;

  return (
    <I18nProvider locale={currentLocale}>
      <SeoHead post={post} />
      <PostDetail post={post} genres={genres} />
    </I18nProvider>
  );
}

export default PostPage;

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

  const profile = {
    name: 'Katsuma',
    description: '映画好きのKatsumaが独自スコアでレビューするブログ。年間200本以上鑑賞。',
    avatarUrl: '/images/mock-avatar.webp',
    aboutUrl: '/about',
    social: {
      x: 'https://x.com/Katsun0921',
    },
  };

  return {
    props: {
      post: { ...post, toc, highScorePosts, profile },
      locale: locale ?? 'ja',
      genres,
    },
  };
};
