// ISR: revalidate 60s — VOD 別記事一覧 2 ページ目以降。公開 URL は /ja/vod/{slug}?page=N（middleware rewrite）
import Head from 'next/head';
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
import {
  VOD_ARCHIVE_LIST_PER_PAGE,
  loadVodArchivePage,
} from '@/libs/loadVodArchivePage';
import {
  filterPostsByListFilters,
  getActiveListFilterValuesFromUrlParams,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  getUrlParamsFromListFilter,
  paginatePosts,
} from '@/libs/listFilters';
import { getVodArchiveUrl, normalizeRouteLocale } from '@/libs/route';
import type { FilterPost, Post } from '@/types/post';

type VodSlugPagedProps = {
  categoryName: string;
  pathSlug: string;
  posts: Post[];
  allPosts: FilterPost[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const VodSlugPagedPage = ({
  categoryName,
  pathSlug,
  posts,
  allPosts,
  currentPage,
  locale,
}: VodSlugPagedProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredAll = filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter });
  const filteredIds = paginatePosts(filteredAll, currentPage, VOD_ARCHIVE_LIST_PER_PAGE).map((p) => p.id);
  const pagedPosts = filteredIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => p !== undefined);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredAll.length / VOD_ARCHIVE_LIST_PER_PAGE));
  const loc = normalizeRouteLocale(locale) as Locale;

  const getArchiveUrl = (page: number, filter?: string) => {
    const base = getVodArchiveUrl(pathSlug, loc, page);
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
        <title>{formatListPagePagedTitle(categoryName, currentPage, loc)}</title>
        <meta name='description' content={formatListPagePagedMetaDescription(categoryName, currentPage, loc)} />
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
        vodHubBreadcrumb
      />
    </I18nProvider>
  );
};

export default VodSlugPagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<VodSlugPagedProps> = async ({ params, locale }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;
  const rawPage = params?.page;
  if (slug === undefined) return { notFound: true };
  if (typeof rawPage !== 'string') return { notFound: true };
  const pageNum = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadVodArchivePage(slug, currentLocale, pageNum);
  if ('notFound' in data) return { notFound: true };

  return {
    props: {
      categoryName: data.categoryName,
      pathSlug: data.pathSlug,
      posts: data.posts,
      allPosts: data.allPosts,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      locale: currentLocale,
    },
    revalidate: 60,
  };
};
