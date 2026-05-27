// ISR: revalidate REVALIDATE_NORMAL — 映画カテゴリ記事一覧（/movie, /en/movie）。1ページ目は ISR、ページ変更・フィルタ変更時のみ CSR（/api/category-filter-posts）で取得。
import Head from 'next/head';
import { REVALIDATE_NORMAL, REVALIDATE_NOT_FOUND } from '@/config/revalidate.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
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
import { WP_MOVIE_CATEGORY_SLUG } from '@/config/wpContent.config';
import { CATEGORY_LIST_PER_PAGE } from '@/libs/listFilters';
import { loadCategoryListPage } from '@/libs/loadCategoryListPage';
import { useCategoryPagedPosts } from '@/libs/useCategoryPagedPosts';
import {
  getActiveListFilterValuesFromUrlParams,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  getUrlParamsFromListFilter,
} from '@/libs/listFilters';
import { getPostTypeArchiveNextPath, getPostTypeArchiveUrl, normalizeRouteLocale } from '@/libs/route';
import type { Post } from '@/types/post';

type MovieIndexProps = {
  categoryName: string;
  posts: Post[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const MovieIndexPage = ({
  categoryName,
  posts: initialPosts,
  currentPage,
  totalPages: initialTotalPages,
  locale,
}: MovieIndexProps) => {
  const router = useRouter();
  const loc = normalizeRouteLocale(locale) as Locale;
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);

  const { posts, filterPosts, totalPages, isLoading } = useCategoryPagedPosts({
    slug: WP_MOVIE_CATEGORY_SLUG,
    locale: loc,
    page: currentPage,
    sortFilter,
    taxonomyFilter,
    perPage: CATEGORY_LIST_PER_PAGE,
    initialPosts,
    initialTotalPages,
  });

  const canonicalUrl = `${SITE_URL}${getPostTypeArchiveUrl({ type: 'movie', lang: loc, page: 1 })}`;

  const getArchiveUrl = (page: number, filter?: string) => {
    const base = getPostTypeArchiveUrl({ type: 'movie', lang: loc, page });
    const params = new URLSearchParams();
    const nextParams = filter ? getUrlParamsFromListFilter(filter) : undefined;
    const nextSortFilter = nextParams?.filter ?? sortFilter;
    const nextTaxonomyFilter = nextParams?.genre || nextParams?.tag ? filter : taxonomyFilter;
    const sortParams = getUrlParamsFromListFilter(nextSortFilter);
    const taxonomyParams = nextTaxonomyFilter ? getUrlParamsFromListFilter(nextTaxonomyFilter) : undefined;
    if (sortParams?.filter) params.set('filter', sortParams.filter);
    if (taxonomyParams?.genre) params.set('genre', taxonomyParams.genre);
    if (taxonomyParams?.tag) params.set('tag', taxonomyParams.tag);
    if (params.size === 0) return base;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    void router.push(
      getPostTypeArchiveNextPath({ type: 'movie', lang: loc, page }),
      getArchiveUrl(page),
      { scroll: true, locale: false },
    );
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{formatListPageIndexTitle(categoryName, loc)}</title>
        <meta name='description' content={formatListPageIndexMetaDescription(categoryName, loc)} />
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={formatListPageCategoryDescription(categoryName, loc)}
        posts={posts}
        filterOptionPosts={filterPosts.length > 0 ? filterPosts : initialPosts}
        getFilterHref={(value) => getArchiveUrl(1, value)}
        activeFilter={activeListFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </I18nProvider>
  );
};

export default MovieIndexPage;

export const getStaticProps: GetStaticProps<MovieIndexProps> = async ({ locale }) => {
  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadCategoryListPage(WP_MOVIE_CATEGORY_SLUG, currentLocale, 1);
  if ('notFound' in data) return { notFound: true, revalidate: REVALIDATE_NOT_FOUND };

  return {
    props: {
      categoryName: data.categoryName,
      posts: data.posts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: REVALIDATE_NORMAL,
  };
};
