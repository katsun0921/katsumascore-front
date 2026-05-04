// ISR: revalidate 60s — 映画カテゴリ記事一覧（/movie, /en/movie）。2 ページ目以降は ?page=N（内部 rewrite で page/[page].tsx）
import Head from 'next/head';
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
import {
  filterPostsByListFilters,
  getActiveListFilterValuesFromUrlParams,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  getUrlParamsFromListFilter,
  paginatePosts,
} from '@/libs/listFilters';
import { getPostTypeArchiveUrl, normalizeRouteLocale } from '@/libs/route';
import type { FilterPost, Post } from '@/types/post';

type MovieIndexProps = {
  categoryName: string;
  posts: Post[];
  allPosts: FilterPost[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const MovieIndexPage = ({
  categoryName,
  posts,
  allPosts,
  currentPage,
  locale,
}: MovieIndexProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredIds = paginatePosts(
    filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter }),
    currentPage,
    CATEGORY_LIST_PER_PAGE,
  ).map((p) => p.id);
  const pagedPosts = filteredIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => p !== undefined);
  const filteredTotalPages = Math.max(1, Math.ceil(
    filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter }).length / CATEGORY_LIST_PER_PAGE,
  ));
  const loc = normalizeRouteLocale(locale) as Locale;

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
      />
    </I18nProvider>
  );
};

export default MovieIndexPage;

export const getStaticProps: GetStaticProps<MovieIndexProps> = async ({ locale }) => {
  const currentLocale = normalizeRouteLocale(locale);
  const movieSlug = WP_MOVIE_CATEGORY_SLUG;
  const data = await loadCategoryListPage(movieSlug, currentLocale, 1);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      categoryName: data.categoryName,
      posts: data.posts,
      allPosts: data.allPosts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: 600,
  };
};
