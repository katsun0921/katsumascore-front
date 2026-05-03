// ISR: revalidate 60s — アニメ一覧ページネーション（/anime/page/[page], /en/anime/page/[page]）
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadAnimeListPage } from '@/libs/loadAnimeListPage';
import { getAnimeArchivePath } from '@/libs/route';
import type { Post } from '@/types/post';

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type AnimePagedProps = {
  categoryName: string;
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

const AnimePagedPage = ({
  categoryName,
  posts,
  currentPage,
  totalPages,
  locale,
}: AnimePagedProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  const handlePageChange = (page: number) => {
    const base = getAnimeArchivePath(loc);
    void router.push(page === 1 ? base : `${base}/page/${page}`, undefined, { scroll: true, locale: false });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${categoryName}（${currentPage}ページ目）| KatsumaScore`}</title>
        <meta name='description' content={`${categoryName}の記事一覧（${currentPage}ページ目）`} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={`今観るべき${categoryName}作品を、スコアで選ぶ`}
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

export default AnimePagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<AnimePagedProps> = async ({ params, locale }) => {
  const raw = params?.page;
  if (typeof raw !== 'string') return { notFound: true };
  const pageNum = Number.parseInt(raw, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = locale ?? 'ja';
  const data = await loadAnimeListPage(currentLocale, pageNum);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      categoryName: data.categoryName,
      posts: data.posts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
