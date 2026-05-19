// ISR: revalidate 600s — 映画カテゴリ記事一覧（/movie, /en/movie）。allPosts は CSR（/api/category-filter-posts）で取得。
import Head from 'next/head';

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
import { useCategoryFilterPosts } from '@/libs/useCategoryFilterPosts';
import {
  filterPostsByListFilters,
  getActiveListFilterValuesFromUrlParams,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  getUrlParamsFromListFilter,
  paginatePosts,
} from '@/libs/listFilters';
import { getPostTypeArchiveUrl, normalizeRouteLocale } from '@/libs/route';
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
  posts,
  currentPage,
  totalPages,
  locale,
}: MovieIndexProps) => {
  const router = useRouter();
  const loc = normalizeRouteLocale(locale) as Locale;
  const { allPosts, isLoading } = useCategoryFilterPosts(WP_MOVIE_CATEGORY_SLUG, loc, CATEGORY_LIST_PER_PAGE);
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredAll = filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter });
  const filteredIds = paginatePosts(filteredAll, currentPage, CATEGORY_LIST_PER_PAGE).map((p) => p.id);
  const pagedPosts = isLoading
    ? posts
    : filteredIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => p !== undefined);
  const filteredTotalPages = isLoading
    ? totalPages
    : Math.max(1, Math.ceil(filteredAll.length / CATEGORY_LIST_PER_PAGE));
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
    void router.push(getArchiveUrl(page), undefined, {
      scroll: true,
      locale: false,
    });
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
        posts={pagedPosts}
        filterOptionPosts={allPosts}
        getFilterHref={(value) => getArchiveUrl(1, value)}
        activeFilter={activeListFilters}
        currentPage={currentPage}
        totalPages={filteredTotalPages}
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
  if ('notFound' in data) return { notFound: true, revalidate: 60 };

  return {
    props: {
      categoryName: data.categoryName,
      posts: data.posts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: 600,
  };
};
