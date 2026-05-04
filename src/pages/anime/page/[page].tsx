// ISR: revalidate 60s — アニメ一覧 2 ページ目以降。公開 URL は /anime?page=N（rewrite で本ファイルに到達）
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
import { ANIME_LIST_PER_PAGE, loadAnimeListPage } from '@/libs/loadAnimeListPage';
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

type AnimePagedProps = {
  categoryName: string;
  posts: Post[];
  allPosts: Post[];
  currentPage: number;
  totalPages: number;
  locale: string;
};

const AnimePagedPage = ({
  categoryName,
  allPosts,
  currentPage,
  locale,
}: AnimePagedProps) => {
  const router = useRouter();
  const sortFilter = getSortFilterFromUrlParams(router.query);
  const taxonomyFilter = getTaxonomyFilterFromUrlParams(router.query);
  const activeListFilters = getActiveListFilterValuesFromUrlParams(router.query);
  const filteredPosts = filterPostsByListFilters(allPosts, { sortFilter, taxonomyFilter });
  const pagedPosts = paginatePosts(filteredPosts, currentPage, ANIME_LIST_PER_PAGE);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredPosts.length / ANIME_LIST_PER_PAGE));
  const loc = normalizeRouteLocale(locale) as Locale;

  const getArchiveUrl = (page: number, filter?: string) => {
    const base = getPostTypeArchiveUrl({ type: 'anime', lang: loc, page });
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
      />
    </I18nProvider>
  );
};

export default AnimePagedPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<AnimePagedProps> = async ({ params, locale }) => {
  const raw = params?.page;
  if (typeof raw !== 'string') return { notFound: true };
  const pageNum = Number.parseInt(raw, 10);
  if (!Number.isFinite(pageNum) || pageNum < 2) return { notFound: true };

  const currentLocale = normalizeRouteLocale(locale);
  const data = await loadAnimeListPage(currentLocale, pageNum);
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
    revalidate: 60,
  };
};
