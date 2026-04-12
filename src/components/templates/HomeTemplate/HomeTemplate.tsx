import { PageLayout } from '@/components/templates/PageLayout/PageLayout';
import { PostList } from '@/components/features/Post/PostList/PostList';
import type { HomeTemplateProps } from './HomeTemplate.types';

export const HomeTemplate = ({ posts, isLoading = false }: HomeTemplateProps) => {
  return (
    <PageLayout>
      <section className='py-8 md:py-12'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start'>
          <div className='space-y-8'>
            <header className='space-y-4'>
              <p className='font-ui text-sm tracking-[0.2em] text-[var(--color-category)] uppercase'>
                Latest Reviews
              </p>
              <div className='space-y-3'>
                <h1 className='text-3xl leading-tight md:text-5xl'>
                  映画とドラマを深く読むためのレビュー一覧
                </h1>
                <p className='w-[min(100%,var(--measure-readable))] text-[var(--color-text-secondary)]'>
                  新作レビュー、配信作品の感想、長編考察をまとめて読めるホームフィードです。作品の空気が伝わるカード一覧から、気になる記事へそのまま進めます。
                </p>
              </div>
            </header>

            <PostList posts={posts} isLoading={isLoading} />
          </div>

          <aside className='space-y-6 rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] p-6'>
            <section className='space-y-3'>
              <p className='font-ui text-xs tracking-[0.16em] text-[var(--color-category)] uppercase'>
                Featured Section
              </p>
              <h2 className='text-2xl leading-snug'>今週の注目ポイント</h2>
              <p className='text-sm leading-7 text-[var(--color-text-secondary)]'>
                劇場公開作と配信オリジナルを横断して、いま読む価値の高いレビューをホームから探しやすくするための補助エリアです。
              </p>
            </section>

            <section className='space-y-4 border-t border-[var(--color-border-soft)] pt-5'>
              <div className='space-y-1'>
                <h3 className='text-lg'>レビューの見どころ</h3>
                <p className='text-sm text-[var(--color-text-secondary)]'>
                  スコア付きの注目作、長文考察、画像なしの短評まで同じ一覧で確認できます。
                </p>
              </div>
              <ul className='space-y-3 text-sm text-[var(--color-text-secondary)]'>
                <li>映画・アニメ・ドラマをカテゴリ付きで整理</li>
                <li>モバイルでは1カラム、広い画面ではメイン導線を優先</li>
                <li>Loading と Empty もページ単位で確認可能</li>
              </ul>
            </section>
          </aside>
        </div>
      </section>
    </PageLayout>
  );
};
