// ISR: revalidate 60s — ドラマカテゴリ記事一覧（/drama, /en/drama）
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import {
  formatListPageCategoryDescription,
  formatListPageIndexMetaDescription,
  formatListPageIndexTitle,
} from '@/components/templates/ListTemplate/i18n';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadCategoryListPage } from '@/libs/loadCategoryListPage';
import { getPostTypeArchiveUrl } from '@/libs/route';
import type { Post } from '@/types/post';

type DramaIndexProps = {
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

const DramaIndexPage = ({
  categoryName,
  posts,
  currentPage,
  totalPages,
  locale,
}: DramaIndexProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  const handlePageChange = (page: number) => {
    void router.push(getPostTypeArchiveUrl({ type: 'drama', lang: loc, page }), undefined, {
      scroll: true,
      locale: false,
    });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{formatListPageIndexTitle(categoryName, loc)}</title>
        <meta name='description' content={formatListPageIndexMetaDescription(categoryName, loc)} />
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

export default DramaIndexPage;

export const getStaticProps: GetStaticProps<DramaIndexProps> = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  const dramaSlug = process.env.WP_DRAMA_CATEGORY_SLUG ?? 'drama';
  const data = await loadCategoryListPage(dramaSlug, currentLocale, 1);
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
