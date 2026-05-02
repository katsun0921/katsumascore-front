import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { PostRankingItem } from '@/components/features/Post/PostRankingItem';
import { ListFilterBar } from '@/components/features/Post/ListFilterBar';
import { Pagination } from '@/components/features/Pagination';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { ListTemplateProps } from './ListTemplate.types';

const RANKING_COUNT = 10;

export const ListTemplate = ({
  categoryName,
  categoryDescription,
  posts,
  filterOptions,
  activeFilter = 'score',
  onFilterSelect,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  vodRanking,
}: ListTemplateProps) => {
  const locale = useLocale();

  const defaultFilterOptions = [
    { label: t(messages, ['filterOptions', 'score'], locale), value: 'score' },
    { label: t(messages, ['filterOptions', 'new'], locale), value: 'new' },
    { label: t(messages, ['filterOptions', 'streaming'], locale), value: 'streaming' },
  ];

  const resolvedFilterOptions = filterOptions ?? defaultFilterOptions;

  const scoreFilterItems = [
    { label: t(messages, ['scoreFilter', 'high'], locale), value: '4.0+', color: 'var(--color-score-rank-high)' },
    { label: t(messages, ['scoreFilter', 'mid'], locale), value: '3.0-3.9', color: 'var(--color-score-rank-mid)' },
    { label: t(messages, ['scoreFilter', 'low'], locale), value: '2.9-', color: 'var(--color-score-rank-low)' },
  ];

  const featuredPost = posts[0];
  const rankingPosts = posts.slice(0, RANKING_COUNT);

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    { label: categoryName },
  ];

  const handleFilterSelect = (value: string) => {
    onFilterSelect?.(value);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

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
          activeValue={activeFilter}
          onSelect={handleFilterSelect}
        />
      </div>

      {/* Main layout — SPファーストDOM順: メイン→サイドバー */}
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start px-4 py-8 pb-12'>
        {/* Main column */}
        <div className='space-y-8'>
          {featuredPost && !isLoading && (
            <PostCardImgLeft post={featuredPost} rank={1} />
          )}

          {rankingPosts.length > 1 && !isLoading && (
            <section className='space-y-2'>
              <ol className='grid grid-cols-3 gap-4'>
                {rankingPosts.map((post, index) => (
                  <PostRankingItem key={post.id} post={post} rank={index + 1} columns={3} />
                ))}
              </ol>
            </section>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Sidebar */}
        <aside className='space-y-6'>
          {/* 広告 */}
          <div className='rounded-2xl border border-color-border-soft bg-surface p-5'>
            <p className='font-ui text-xs tracking-[0.16em] text-category uppercase mb-3'>
              {t(messages, ['ad', 'label'], locale)}
            </p>
            <div className='flex items-center justify-center h-[250px] rounded-lg bg-color-bg-muted text-color-secondary text-sm'>
              {t(messages, ['ad', 'placeholder'], locale)}
            </div>
          </div>

          {/* スコア別フィルター */}
          <div className='rounded-2xl border border-color-border-soft bg-surface p-5 space-y-3'>
            <p className='font-ui text-xs tracking-[0.16em] text-category uppercase'>
              {t(messages, ['scoreFilter', 'heading'], locale)}
            </p>
            <ul className='space-y-2'>
              {scoreFilterItems.map((item) => (
                <li key={item.value}>
                  <button
                    type='button'
                    className='flex items-center gap-2 w-full text-sm text-color-secondary hover:text-color-primary transition-colors'
                  >
                    <span
                      className='font-bold font-ui'
                      style={{ color: `var(${item.color.slice(4, -1)})` }}
                    >
                      ●
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};
