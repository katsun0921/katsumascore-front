import { PageLayout } from '@/components/templates/PageLayout/PageLayout';
import { PostFeatured } from '@/components/features/Post/PostFeatured/PostFeatured';
import { PostRankingItem } from '@/components/features/Post/PostRankingItem/PostRankingItem';
import { PostList } from '@/components/features/Post/PostList/PostList';
import { ListFilterBar } from '@/components/features/Post/ListFilterBar/ListFilterBar';
import type { ListTemplateProps } from './ListTemplate.types';

const DEFAULT_FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

// ランキング表示する先頭件数
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
}: ListTemplateProps) => {
  const featuredPost = posts[0];
  const rankingPosts = posts.slice(0, RANKING_COUNT);
  const gridPosts = posts.slice(RANKING_COUNT);

  const handleFilterSelect = (value: string) => {
    onFilterSelect?.(value);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className='py-8 md:py-12'>
        <header className='space-y-2'>
          <p className='font-ui text-sm tracking-[0.2em] text-[var(--color-category)] uppercase'>
            Category
          </p>
          <h1 className='text-3xl md:text-5xl'>{categoryName}</h1>
          {categoryDescription && (
            <p className='text-[var(--color-text-secondary)]'>{categoryDescription}</p>
          )}
        </header>
      </section>

      {/* Filter */}
      <div className='pb-6'>
        <ListFilterBar
          options={filterOptions}
          activeValue={activeFilter}
          onSelect={handleFilterSelect}
        />
      </div>

      {/* Main layout */}
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start pb-12'>
        {/* Main column */}
        <div className='space-y-8'>
          {/* Featured */}
          {featuredPost && !isLoading && (
            <PostFeatured post={featuredPost} />
          )}

          {/* Ranking */}
          {rankingPosts.length > 0 && !isLoading && (
            <section className='space-y-2'>
              <h2 className='text-xl font-bold'>ランキング</h2>
              <ol>
                {rankingPosts.map((post, index) => (
                  <PostRankingItem key={post.id} post={post} rank={index + 1} />
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
          <div className='rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5'>
            <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase mb-3'>
              Ad
            </p>
            <div className='flex items-center justify-center h-[250px] rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] text-sm'>
              300×250
            </div>
          </div>

          <div className='rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-5 space-y-3'>
            <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase'>
              Score Filter
            </p>
            <ul className='space-y-2 text-sm text-[var(--color-text-secondary)]'>
              <li>4.0 以上</li>
              <li>3.0〜3.9</li>
              <li>2.9 以下</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
};
