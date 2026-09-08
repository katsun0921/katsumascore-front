// ISR: revalidate REVALIDATE_NORMAL — 劇場公開中の作品一覧（/now-showing, /en/now-showing）。
// 上映中は常時数件〜十数件のため WP の /v1/theater-list で全件を ISR 取得し、
// ソート・絞り込み・ページングはクエリを見てクライアント側で行う（フィルタ切替時の再取得なし）。
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { REVALIDATE_NORMAL, REVALIDATE_NOT_FOUND } from '@/config/revalidate.config';
import { ListTemplate } from '@/components/templates/ListTemplate';
import type { FilterOption } from '@/components/features/Post/ListFilterBar/ListFilterBar.types';
import { POST_TYPE_ARCHIVE_NAV_ITEMS } from '@/config/wpContent.config';
import { I18nProvider } from '@/i18n/provider';
import { t, type Locale } from '@/i18n/t';
import { messages } from '@/i18n/nowShowingPageMessages';
import { getPostTaxonomyFilterOptionRows, paginatePosts } from '@/libs/listFilters';
import { loadNowShowingPosts } from '@/libs/loadNowShowingPosts';
import {
  NOW_SHOWING_PER_PAGE,
  applyNowShowingFilterValue,
  createNowShowingCategoryFilterValue,
  filterNowShowingPosts,
  getActiveNowShowingFilterValues,
  getNowShowingPageFromUrlParams,
  getNowShowingQueryFromUrlParams,
  nowShowingQueryToUrlParams,
} from '@/libs/nowShowingFilters';
import { getNowShowingArchivePath, getNowShowingUrl, normalizeRouteLocale } from '@/libs/route';
import type { Post } from '@/types/post';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

type NowShowingPageProps = {
  posts: Post[];
  locale: string;
};

/** カテゴリスラッグの表示名。ナビ定義にあればそのラベル、無ければスラッグをそのまま使う。 */
const categoryLabelOf = (slug: string, locale: Locale): string =>
  POST_TYPE_ARCHIVE_NAV_ITEMS.find((item) => item.postType === slug)?.label[locale] ?? slug;

/** カテゴリチップの選択肢を、一覧に実在するカテゴリだけから作る。 */
const buildCategoryFilterOptions = (posts: Post[], locale: Locale): FilterOption[] => {
  const slugs = new Set<string>();
  for (const post of posts) {
    if (post.category !== undefined) slugs.add(post.category);
  }
  return [...slugs].map((slug) => ({
    label: categoryLabelOf(slug, locale),
    value: createNowShowingCategoryFilterValue(slug),
  }));
};

const NowShowingPage = ({ posts: allPosts, locale }: NowShowingPageProps) => {
  const router = useRouter();
  const loc = normalizeRouteLocale(locale) as Locale;

  const query = getNowShowingQueryFromUrlParams(router.query);
  const currentPage = getNowShowingPageFromUrlParams(router.query);

  const filteredPosts = filterNowShowingPosts(allPosts, query);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / NOW_SHOWING_PER_PAGE));
  const pagePosts = paginatePosts(filteredPosts, currentPage, NOW_SHOWING_PER_PAGE);

  /** チップの遷移先。押した値を現在の状態に適用し、ページは1に戻す。 */
  const getFilterHref = (value: string): string =>
    getNowShowingUrl(loc, nowShowingQueryToUrlParams(applyNowShowingFilterValue(query, value)));

  const handlePageChange = (page: number) => {
    void router.push(
      getNowShowingUrl(loc, nowShowingQueryToUrlParams(query, page)),
      undefined,
      { shallow: true, scroll: true, locale: false },
    );
  };

  const withFilterHref = (option: FilterOption): FilterOption => ({
    ...option,
    href: getFilterHref(option.value),
  });

  const sortFilterOptions: FilterOption[] = [
    { label: t(messages, ['filterOptions', 'release'], loc), value: 'release' },
    { label: t(messages, ['filterOptions', 'new'], loc), value: 'new' },
    { label: t(messages, ['filterOptions', 'score'], loc), value: 'score' },
  ].map(withFilterHref);

  // 選択肢は絞り込み前の全件から作る（1つ選んだ時点で他が消えて元に戻せなくなるのを防ぐ）
  const categoryFilterOptions = buildCategoryFilterOptions(allPosts, loc).map(withFilterHref);
  const taxonomyFilterRows = getPostTaxonomyFilterOptionRows(allPosts, {
    genre: t(messages, ['filterOptions', 'genre'], loc),
    tag: t(messages, ['filterOptions', 'tag'], loc),
  }).map((row) => row.map(withFilterHref));

  const filterOptionRows = [
    sortFilterOptions,
    ...(categoryFilterOptions.length > 0 ? [categoryFilterOptions] : []),
    ...taxonomyFilterRows,
  ];

  // フィルター・ページは同じ一覧の見え方の違いのため、canonical は常に基底 URL へ寄せる
  const canonicalUrl = `${SITE_URL}${getNowShowingArchivePath(loc)}`;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{t(messages, ['head', 'title'], loc)}</title>
        <meta name='description' content={t(messages, ['head', 'description'], loc)} />
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <ListTemplate
        categoryName={t(messages, ['page', 'title'], loc)}
        categoryLabel={t(messages, ['page', 'kicker'], loc)}
        categoryDescription={t(messages, ['page', 'lead'], loc)}
        posts={pagePosts}
        filterOptionRows={filterOptionRows}
        activeFilter={getActiveNowShowingFilterValues(query)}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </I18nProvider>
  );
};

export default NowShowingPage;

export const getStaticProps: GetStaticProps<NowShowingPageProps> = async ({ locale }) => {
  const currentLocale = normalizeRouteLocale(locale);
  const result = await loadNowShowingPosts(currentLocale);

  // WP 取得失敗時は 404 を焼き付けず、空一覧を短い revalidate で生成して ISR 再生成で復旧させる
  // （ビルド環境から WP へ到達できない状態が常態化しているため。詳細は docs/develop/BUILD_WP_UNREACHABLE.md）
  if ('fetchFailed' in result) {
    return {
      props: { posts: [], locale: currentLocale },
      revalidate: REVALIDATE_NOT_FOUND,
    };
  }

  return {
    props: { posts: result.posts, locale: currentLocale },
    revalidate: REVALIDATE_NORMAL,
  };
};
