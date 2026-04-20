import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { PostRankingItem } from '@/components/features/Post/PostRankingItem';
import { PostList } from '@/components/ui-section/PostList';
import { ListFilterBar } from '@/components/features/Post/ListFilterBar';
import type { ListTemplateProps } from './ListTemplate.types';

const DEFAULT_FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

const RANKING_COUNT = 3;

export const ListTemplate = ({
  categoryName,
  categoryDescription,
  posts,
  filterOptions = DEFAULT_FILTER_OPTIONS,
  activeFilter = 'score',
  onFilterSelect,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  vodRanking,
}: ListTemplateProps) => {
  const featuredPost = posts[0];
  const rankingPosts = posts.slice(0, RANKING_COUNT);
  const gridPosts = posts.slice(RANKING_COUNT);

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
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
      <div className='bg-[var(--color-secondary)]'>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <section className='px-4 py-8 md:py-12'>
          <div className='space-y-2'>
            <p className='font-ui text-xs tracking-[0.2em] text-[var(--color-score-border)] uppercase'>
              Category
            </p>
            <h1 className='font-bold text-[var(--color-text-inverse)]'>
              {categoryName}
            </h1>
            {categoryDescription && (
              <p className='text-sm text-[rgba(255,255,255,0.7)]'>{categoryDescription}</p>
            )}
          </div>
        </section>
      </div>

      {/* Filter */}
      <div className='py-4 px-4 bg-[var(--color-bg)] border-b border-[var(--color-border)]'>
        <ListFilterBar
          options={filterOptions}
          activeValue={activeFilter}
          onSelect={handleFilterSelect}
        />
      </div>

      {/* Main layout — SPファーストDOM順: メイン→サイドバー */}
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start px-4 py-8 pb-12'>
        {/* Main column */}
        <div className='space-y-8'>
          {/* Featured */}
          {featuredPost && !isLoading && (
            <PostCardImgLeft post={featuredPost} />
          )}

          {/* Ranking */}
          {rankingPosts.length > 0 && !isLoading && (
            <section className='space-y-2'>
              <h2 className='text-[var(--font-size-h3-sm)] font-bold text-[var(--color-text-primary)]'>
                ランキング
              </h2>
              <ol className='flex flex-wrap gap-4'>
                {rankingPosts.map((post, index) => (
                  <PostRankingItem key={post.id} post={post} rank={index + 1} columns={3} />
                ))}
              </ol>
            </section>
          )}

          {/* Grid */}
          <section>
            <PostList posts={gridPosts} isLoading={isLoading} />
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className='flex justify-center gap-2' aria-label='ページネーション'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type='button'
                  onClick={() => handlePageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={[
                    'min-w-[40px] h-10 rounded-lg border font-ui text-sm transition-colors',
                    page === currentPage
                      ? 'bg-[var(--color-category)] border-[var(--color-category)] text-[var(--color-text-inverse)]'
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-category)] hover:text-[var(--color-category)]',
                  ].join(' ')}
                >
                  {page}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Sidebar */}
        <aside className='space-y-6'>
          {/* 広告 */}
          <div className='rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5'>
            <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase mb-3'>
              Ad
            </p>
            <div className='flex items-center justify-center h-[250px] rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] text-sm'>
              300×250
            </div>
          </div>

          {/* VODランキング */}
          {vodRanking && vodRanking.length > 0 && (
            <div className='rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 space-y-3'>
              <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase'>
                VOD ランキング
              </p>
              <ol className='space-y-2'>
                {vodRanking.map((item, index) => (
                  <li key={item.id} className='flex items-center gap-3 text-sm text-[var(--color-text-primary)]'>
                    <span className='flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-secondary)] text-[var(--color-text-inverse)] font-ui text-xs flex items-center justify-center font-bold'>
                      {index + 1}
                    </span>
                    <span className='truncate'>{item.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* スコア別フィルター */}
          <div className='rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 space-y-3'>
            <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase'>
              スコア別
            </p>
            <ul className='space-y-2'>
              {[
                { label: '4.0 以上', value: '4.0+', color: 'var(--color-score-rank-s-text)' },
                { label: '3.0〜3.9', value: '3.0-3.9', color: 'var(--color-score-rank-a-text)' },
                { label: '2.9 以下', value: '2.9-', color: 'var(--color-score-rank-b-text)' },
              ].map((item) => (
                <li key={item.value}>
                  <button
                    type='button'
                    className='flex items-center gap-2 w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors'
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
