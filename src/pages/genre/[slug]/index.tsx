// ISR: revalidate 60s — WP genre taxonomy アーカイブ（カテゴリ一覧は /categories/[slug]）
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getGenres } from '@/libs/api/wordpress';
import { loadGenreListPage } from '@/libs/loadGenreListPage';
import { getTaxonomyUrl } from '@/libs/route';
import type { Post } from '@/types/post';

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type GenrePageProps = {
  genreName: string;
  slug: string;
  posts: Post[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const sortPosts = (posts: Post[], filter: string): Post[] => {
  if (filter === 'score') return [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  if (filter === 'new') return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return posts;
};

const GenrePage = ({ genreName, slug, posts, currentPage, totalPages, locale }: GenrePageProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  const handlePageChange = (page: number) => {
    const base = getTaxonomyUrl('genre', slug, loc);
    void router.push(page === 1 ? base : `${base}/page/${page}`, undefined, { scroll: true });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{genreName} | KatsumaScore</title>
        <meta name='description' content={`${genreName}の記事一覧 — スコアで選ぶ`} />
      </Head>
      <ListTemplate
        categoryName={genreName}
        categoryDescription={`今観るべき${genreName}作品を、スコアで選ぶ`}
        posts={sortedPosts}
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </I18nProvider>
  );
};

export default GenrePage;

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths = [];
  for (const loc of locales) {
    const lang = loc === 'en' ? 'en' : 'ja';
    const genres = await getGenres(lang);
    for (const genre of genres) {
      paths.push({ params: { slug: genre.slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<GenrePageProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const currentLocale = locale ?? 'ja';
  const data = await loadGenreListPage(slug, currentLocale, 1);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      genreName: data.genreName,
      slug: data.slug,
      posts: data.posts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
