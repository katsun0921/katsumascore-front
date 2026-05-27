// ISR: revalidate REVALIDATE_NORMAL — WP タグタクソノミーアーカイブ
import Head from 'next/head';
import { REVALIDATE_NORMAL } from '@/config/revalidate.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getTags } from '@/libs/api/wordpress';
import { loadTagListPage } from '@/libs/loadTagListPage';
import { getTaxonomyUrl, normalizeRouteLocale } from '@/libs/route';
import type { Post } from '@/types/post';

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type TagPageProps = {
  tagName: string;
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

const TagPage = ({ tagName, slug, posts, currentPage, totalPages, locale }: TagPageProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;
  const canonicalUrl = `${SITE_URL}${getTaxonomyUrl('tag', slug, loc)}`;

  const handlePageChange = (page: number) => {
    const base = getTaxonomyUrl('tag', slug, loc);
    void router.push(page === 1 ? base : `${base}/p/${page}`, undefined, { scroll: true });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{tagName} | KatsumaScore</title>
        <meta name='description' content={`${tagName}の記事一覧 — スコアで選ぶ`} />
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <ListTemplate
        categoryName={tagName}
        categoryDescription={`${tagName}に関連する作品をスコアで選ぶ`}
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

export default TagPage;

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths = [];
  for (const loc of locales.filter((l) => l !== 'default')) {
    const tags = await getTags();
    for (const tag of tags) {
      paths.push({ params: { slug: tag.slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

const paramAsString = (v: string | string[] | undefined): string | undefined => {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return undefined;
};

export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params, locale }) => {
  const slug = paramAsString(params?.slug);
  if (slug === undefined) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadTagListPage(slug, currentLocale, 1);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      tagName: data.tagName,
      slug: data.slug,
      posts: data.posts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: REVALIDATE_NORMAL,
  };
};
