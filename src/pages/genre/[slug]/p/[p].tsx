// ISR: revalidate REVALIDATE_DAILY — genre アーカイブのページネーション（/genre/[slug]/p/[p] — `page` セグメントは OpenNext 等と衝突しうるため `p` を使用）
import Head from 'next/head';
import { REVALIDATE_DAILY } from '@/config/revalidate.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { loadGenreListPage } from '@/libs/loadGenreListPage';
import { getTaxonomyUrl, normalizeRouteLocale } from '@/libs/route';
import type { Post } from '@/types/post';

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type GenrePagedProps = {
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

const paramAsString = (v: string | string[] | undefined): string | undefined => {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return undefined;
};

const GenrePagedPage = ({
  genreName,
  slug,
  posts,
  currentPage,
  totalPages,
  locale,
}: GenrePagedProps) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;
  // ページネーションの正規URLは `?p=N` に一本化している（`/p/N` は 301 で寄せる）
  const canonicalUrl = `${SITE_URL}${getTaxonomyUrl('genre', slug, loc)}?p=${currentPage}`;

  const handlePageChange = (page: number) => {
    const base = getTaxonomyUrl('genre', slug, loc);
    void router.push(page === 1 ? base : `${base}?p=${page}`, undefined, { scroll: true });
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{`${genreName}（${currentPage}ページ目）| KatsumaScore`}</title>
        <meta name='description' content={`${genreName}の記事一覧（${currentPage}ページ目） — スコアで選ぶ`} />
        <link rel='canonical' href={canonicalUrl} />
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

export default GenrePagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<GenrePagedProps> = async ({ params, locale }) => {
  const slug = paramAsString(params?.slug);
  const rawP = paramAsString(params?.p);
  if (slug === undefined || rawP === undefined) return { notFound: true };

  const pageNum = Number.parseInt(rawP, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadGenreListPage(slug, currentLocale, pageNum);
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
    revalidate: REVALIDATE_DAILY,
  };
};
