// ISR: revalidate 60s
import { PostDetail } from '@/components/templates/PostDetail';
import { SeoHead } from '@/components/features/seo/SeoHead';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { makeGetStaticPaths, makeGetStaticProps } from '@/libs/loadPostDetailPage';
import type { PostDetailPageProps } from '@/libs/loadPostDetailPage';

const AnimePage = ({ post, locale, genres, actorTermEntries, postId, vodTermId }: PostDetailPageProps) => {
  const currentLocale = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={currentLocale}>
      <SeoHead post={post} />
      <PostDetail post={post} genres={genres} actorTermEntries={actorTermEntries} postId={postId} vodTermId={vodTermId} />
    </I18nProvider>
  );
};

export default AnimePage;

export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps();
