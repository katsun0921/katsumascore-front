// ISR: revalidate REVALIDATE_DAILY — VOD 別記事一覧 1 ページ目（/ja/vod/netflix 等）
import Head from 'next/head';
import { REVALIDATE_DAILY, REVALIDATE_NOT_FOUND } from '@/config/revalidate.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
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
  buildEmptyVodArchivePage,
  loadVodArchivePage,
} from '@/libs/loadVodArchivePage';
import {
  filterPostsByListFilters,
  getActiveListFilterValuesFromUrlParams,
  getSortFilterFromUrlParams,
  getTaxonomyFilterFromUrlParams,
  getUrlParamsFromListFilter,
} from '@/libs/listFilters';
import { getVodArchiveNextPath, getVodArchiveUrl, normalizeRouteLocale } from '@/libs/route';
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
  totalPages,
  locale,
}: VodSlugIndexProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredAll = filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter });
  const pagedPosts = filteredAll
    .map((fp) => posts.find((p) => p.id === fp.id))
    .filter((p): p is Post => p !== undefined);
  // タクソノミーフィルタ適用時は現在ページ内での件数、未適用時はサーバーの totalPages を使用
  const filteredTotalPages = taxonomyFilter
    ? Math.max(1, Math.ceil(filteredAll.length / VOD_ARCHIVE_LIST_PER_PAGE))
    : totalPages;
  const loc = normalizeRouteLocale(locale) as Locale;
  const canonicalUrl = `${SITE_URL}${getVodArchiveUrl(pathSlug, loc, 1)}`;

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
    void router.push(
      getVodArchiveNextPath(pathSlug, loc, page),
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
        posts={pagedPosts}
        filterOptionPosts={allPosts}
        getFilterHref={(value) => getArchiveUrl(1, value)}
        activeFilter={activeListFilters}
        currentPage={currentPage}
        totalPages={filteredTotalPages}
        onPageChange={handlePageChange}
        vodHubBreadcrumb
        singleVodService
      />
    </I18nProvider>
  );
};

export default VodSlugIndexPage;

// WordPress へ同時アクセスするビルド時生成を避け、各サービスの初回アクセス時に ISR 生成する。
export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: 'blocking' });

export const getStaticProps: GetStaticProps<VodSlugIndexProps> = async ({ params, locale }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;
  if (slug === undefined) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadVodArchivePage(slug, currentLocale, 1);
  if ('fetchFailed' in data) {
    const fallback = buildEmptyVodArchivePage(slug, 1);
    return {
      props: { ...fallback, locale: currentLocale },
      revalidate: REVALIDATE_NOT_FOUND,
    };
  }
  if ('notFound' in data) return { notFound: true, revalidate: REVALIDATE_NOT_FOUND };

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
    revalidate: REVALIDATE_DAILY,
  };
};
