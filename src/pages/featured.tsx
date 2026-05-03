// ISR: revalidate 60s — 特集カテゴリ一覧
import Head from 'next/head';
import { useState } from 'react';
import type { GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getCategoryBySlug, getPostsWithMeta } from '@/libs/api/wordpress';
import { normalizePostsFromLangScopedQuery } from '@/utils/normalizePost';
import type { Post } from '@/types/post';
const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type FeaturedPageProps = {
  categoryName: string;
  posts: Post[];
  locale: string;
};

const sortPosts = (posts: Post[], filter: string): Post[] => {
  if (filter === 'score') {
    return [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
  if (filter === 'new') {
    return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  return posts;
};

const FeaturedPage = ({ categoryName, posts, locale }: FeaturedPageProps) => {
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{categoryName} | KatsumaScore</title>
        <meta name='description' content={`${categoryName}の記事一覧`} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={categoryName}
        posts={sortedPosts}
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
        currentPage={1}
        totalPages={1}
      />
    </I18nProvider>
  );
};

export default FeaturedPage;

export const getStaticProps: GetStaticProps<FeaturedPageProps> = async ({ locale }) => {
  const currentLocale = (locale === 'en' ? 'en' : 'ja') as import('@/libs/api/wordpress/lang').Locale;
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const slug = process.env.WP_FEATURED_CATEGORY_SLUG ?? 'featured';
  const category = await getCategoryBySlug(slug, lang);
  if (!category) return { notFound: true };

  const fetched = await getPostsWithMeta({
    category: category.id,
    page: 1,
    per_page: 100,
    lang,
  });
  if (!fetched) return { notFound: true };

  return {
    props: {
      categoryName: category.name,
      posts: normalizePostsFromLangScopedQuery(fetched.items),
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
