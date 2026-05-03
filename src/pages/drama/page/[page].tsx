// ISR: revalidate 60s — ドラマ一覧ページネーション（/drama/page/[page], /en/drama/page/[page]）
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import {
  formatListPageCategoryDescription,
  formatListPagePagedMetaDescription,
  formatListPagePagedTitle,
} from '@/components/templates/ListTemplate/i18n';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadCategoryListPage } from '@/libs/loadCategoryListPage';
import { getPostTypeArchivePath } from '@/libs/route';
import type { Post } from '@/types/post';

type DramaPagedProps = {
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

const DramaPagedPage = ({
  categoryName,
  posts,
  currentPage,
  totalPages,
  locale,
}: DramaPagedProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  const handlePageChange = (page: number) => {
    const base = getPostTypeArchivePath({ type: 'drama', lang: loc });
    void router.push(page === 1 ? base : `${base}/page/${page}`, undefined, { scroll: true, locale: false });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{formatListPagePagedTitle(categoryName, currentPage, loc)}</title>
        <meta name='description' content={formatListPagePagedMetaDescription(categoryName, currentPage, loc)} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={formatListPageCategoryDescription(categoryName, loc)}
        posts={sortedPosts}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </I18nProvider>
  );
};

export default DramaPagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<DramaPagedProps> = async ({ params, locale }) => {
  const raw = params?.page;
  if (typeof raw !== 'string') return { notFound: true };
  const pageNum = Number.parseInt(raw, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = locale ?? 'ja';
  const dramaSlug = process.env.WP_DRAMA_CATEGORY_SLUG ?? 'drama';
  const data = await loadCategoryListPage(dramaSlug, currentLocale, pageNum);
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
