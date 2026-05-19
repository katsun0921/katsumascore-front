// ISR: revalidate 60s — ドラマ一覧 2 ページ目以降。公開 URL は /drama?page=N（rewrite で本ファイルに到達）
import Head from 'next/head';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog';
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
import { WP_DRAMA_CATEGORY_SLUG } from '@/config/wpContent.config';
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

type DramaPagedProps = {
  categoryName: string;
  posts: Post[];
  allPosts: FilterPost[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const DramaPagedPage = ({
  categoryName,
  posts,
  allPosts,
  currentPage,
  locale,
}: DramaPagedProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredAll = filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter });
  const filteredIds = paginatePosts(filteredAll, currentPage, CATEGORY_LIST_PER_PAGE).map((p) => p.id);
  const pagedPosts = filteredIds.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => p !== undefined);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredAll.length / CATEGORY_LIST_PER_PAGE));
  const loc = normalizeRouteLocale(locale) as Locale;
  const canonicalUrl = `${SITE_URL}${getPostTypeArchiveUrl({ type: 'drama', lang: loc, page: currentPage })}`;

  const getArchiveUrl = (page: number, filter?: string) => {
    const base = getPostTypeArchiveUrl({ type: 'drama', lang: loc, page });
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
      />
    </I18nProvider>
  );
};

export default DramaPagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<DramaPagedProps> = async ({ params, locale }) => {
  const raw = params?.page;
  if (typeof raw !== 'string') return { notFound: true };
  const pageNum = Number.parseInt(raw, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const dramaSlug = WP_DRAMA_CATEGORY_SLUG;
  const data = await loadCategoryListPage(dramaSlug, currentLocale, pageNum);
  if ('notFound' in data) return { notFound: true, revalidate: 60 };

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
