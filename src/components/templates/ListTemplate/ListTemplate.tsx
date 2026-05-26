import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PageLayout } from '@/components/templates/PageLayout';
import { Sidebar as SidebarComponent } from '@/components/ui-layout/Sidebar';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { VodLegend } from '@/components/ui-section/VodLegend';
import { ListFilterBar } from '@/components/features/Post/ListFilterBar';
import { Pagination } from '@/components/features/Pagination';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { getPostTaxonomyFilterOptionRows } from '@/libs/listFilters';
import { getVodHubPath } from '@/libs/route';
import type { VodService } from '@/libs/vod';
import { messages } from './i18n';
import type { ListTemplateProps } from './ListTemplate.types';

export const ListTemplate = ({
  categoryName,
  categoryDescription,
  posts,
  filterOptionPosts,
  filterOptions,
  getFilterHref,
  activeFilter = 'score',
  onFilterSelect,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  sidebar,
  vodHubBreadcrumb = false,
}: ListTemplateProps) => {
  const locale = useLocale();

  const defaultFilterOptionPosts = filterOptionPosts ?? posts;
  const withFilterHref = (option: { label: string; value: string }) => ({
    ...option,
    ...(getFilterHref ? { href: getFilterHref(option.value) } : {}),
  });
  const defaultSortFilterOptions = [
    { label: t(messages, ['filterOptions', 'score'], locale), value: 'score' },
    { label: t(messages, ['filterOptions', 'new'], locale), value: 'new' },
    { label: t(messages, ['filterOptions', 'streaming'], locale), value: 'streaming' },
  ].map(withFilterHref);
  const defaultTaxonomyFilterRows = getPostTaxonomyFilterOptionRows(defaultFilterOptionPosts, {
      genre: t(messages, ['filterOptions', 'genre'], locale),
      tag: t(messages, ['filterOptions', 'tag'], locale),
    }).map((row) => row.map(withFilterHref));
  const defaultFilterOptionRows = [
    defaultSortFilterOptions,
    ...defaultTaxonomyFilterRows,
  ];
  const defaultFilterOptions = defaultFilterOptionRows.flat();

  const resolvedFilterOptions = filterOptions ?? defaultFilterOptions;
  const resolvedFilterOptionRows = filterOptions ? [filterOptions] : defaultFilterOptionRows;

  const vodMid =
    vodHubBreadcrumb ?
      [{ label: t(messages, ['breadcrumb', 'vod'], locale), href: getVodHubPath(locale) }]
    : [];
  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    ...vodMid,
    { label: categoryName },
  ];

  const handleFilterSelect = (value: string) => {
    onFilterSelect?.(value);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  /** 各ページとも先頭1件をリード、残りをグリッドに揃える（1ページ目と2ページ目で同じ内訳になる） */
  const leadPost = posts[0];
  const gridPosts = posts.slice(1);

  /** 一覧に登場する VOD サービスのみを凡例として表示する。 */
  const legendServices: VodService[] = Array.from(
    new Set(posts.flatMap((post) => post.vods ?? [])),
  );

  return (
    <PageLayout>
      {/* Hero — ダーク背景でカテゴリ名を表示 */}
      <div className='bg-secondary'>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <section className='px-4 py-8 md:py-12'>
          <div className='space-y-2'>
            <p className='font-ui text-xs tracking-[0.2em] text-score-accent uppercase'>
              {t(messages, ['category', 'label'], locale)}
            </p>
            <h1 className='font-bold text-color-inverse'>
              {categoryName}
            </h1>
            {categoryDescription && (
              <p className='text-sm text-[rgba(255,255,255,0.7)]'>{categoryDescription}</p>
            )}
          </div>
        </section>
      </div>

      {/* Filter */}
      <div className='py-4 px-4 bg-color-bg border-b border-color-border'>
        <ListFilterBar
          options={resolvedFilterOptions}
          optionRows={resolvedFilterOptionRows}
          activeValue={activeFilter}
          onSelect={handleFilterSelect}
        />
      </div>

      {/* Main layout — SPファーストDOM順: メイン→サイドバー */}
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start px-4 py-8 pb-12'>
        {/* Main column */}
        <div className='space-y-8'>
          <VodLegend services={legendServices} />

          {posts.length > 0 && !isLoading && (
            <div className='flex flex-col gap-3 lg:gap-4'>
              {leadPost && <PostCardImgLeft post={leadPost} priority />}
              {gridPosts.length > 0 && (
                <ol className='m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3 lg:gap-4'>
                  {gridPosts.map((item) => (
                    <li key={item.id}>
                      <PostCardImgTop post={item} />
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {posts.length === 0 && !isLoading && (
            <p className='text-body text-color-secondary'>
              {t(messages, ['empty', 'posts'], locale)}
            </p>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <SidebarComponent {...(sidebar ?? {})} />
      </div>
    </PageLayout>
  );
};
