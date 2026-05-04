// ISR: revalidate 60s — VOD 別記事一覧 1 ページ目（/ja/vod/netflix 等）
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import {
  formatListPageCategoryDescription,
  formatListPageIndexMetaDescription,
  formatListPageIndexTitle,
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
import { VOD_ARCHIVE_PATH_SLUGS } from '@/libs/vodPathToWpSlug';
import { getVodArchiveUrl, normalizeRouteLocale } from '@/libs/route';
import type { FilterPost, Post } from '@/types/post';

type VodSlugIndexProps = {
  categoryName: string;
  pathSlug: string;
  posts: Post[];
  allPosts: FilterPost[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const VodSlugIndexPage = ({
  categoryName,
  pathSlug,
  posts,
  allPosts,
  currentPage,
  locale,
}: VodSlugIndexProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredIds = paginatePosts(
    filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter }),
    currentPage,
    VOD_ARCHIVE_LIST_PER_PAGE,
  ).map((p) => p.id);
  const pagedPosts = filteredIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => p !== undefined);
  const filteredTotalPages = Math.max(
    1,
    Math.ceil(
      filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter }).length / VOD_ARCHIVE_LIST_PER_PAGE,
    ),
  );
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
        vodHubBreadcrumb
      />
    </I18nProvider>
  );
};

export default VodSlugIndexPage;

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const locs = (locales ?? ['ja', 'en']).filter((l) => l !== 'default');
  const pathLocales = locs.length > 0 ? locs : ['ja', 'en'];
  const paths: { params: { slug: string }; locale: string }[] = [];
  for (const loc of pathLocales) {
    for (const slug of VOD_ARCHIVE_PATH_SLUGS) {
      paths.push({ params: { slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<VodSlugIndexProps> = async ({ params, locale }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;
  if (slug === undefined) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadVodArchivePage(slug, currentLocale, 1);
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
