import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListTemplate } from './ListTemplate';
import { mockPost, mockPosts } from '@/mocks/post';
import { chaosPosts } from '@/mocks/chaosPosts';

/** /movie（1ページ目）と /movie?page=2（2ページ目）で同じ 13 件のとき、リード1＋グリッド11で揃うことを確認する */
const thirteenPostsMovieArchive = Array.from({ length: 13 }, (_, i) => ({
  ...mockPost,
  id: `movie-parity-${i}`,
  slug: `/posts/movie-parity-${i}`,
  title: `映画レビュー ${i + 1}（13件ページング同型）`,
  publishedAt: `2026-05-${String((i % 28) + 1).padStart(2, '0')}`,
  score: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
}));

const meta = {
  title: 'templates/ListTemplate',
  component: ListTemplate,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ListTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    categoryName: '映画',
    categoryDescription: '今観るべき作品を、スコアで選ぶ',
    posts: mockPosts,
    activeFilter: 'score',
    currentPage: 1,
    totalPages: 3,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    posts: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    posts: [],
    isLoading: false,
    totalPages: 1,
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    categoryName: 'サイエンスフィクション・SF映画・アニメーション特集',
    categoryDescription: '宇宙・未来・AI・テクノロジーをテーマにした話題作を一挙にスコアで比較する',
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    categoryDescription: undefined,
  },
};

export const Pagination: Story = {
  args: {
    ...Default.args,
    currentPage: 2,
    totalPages: 5,
  },
};

export const MoviePageQueryParity: Story = {
  args: {
    categoryName: '映画',
    posts: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`currentPage` が 1 と 2 で **同一13件**のとき、どちらもリード（ImgLeft）1件＋グリッド（ImgTop）11件。`/movie` と `/movie?page=2` の表示数ずれをここで確認する。',
      },
    },
  },
  render: () => (
    <div className='flex flex-col gap-10 bg-color-bg'>
      <section>
        <p className='border-b border-color-border bg-secondary px-4 py-2 font-ui text-sm text-color-inverse'>
          1ページ目（/movie 相当）— リード1＋グリッド11＝計13カード
        </p>
        <ListTemplate
          categoryName='映画'
          categoryDescription='今観るべき作品を、スコアで選ぶ'
          posts={thirteenPostsMovieArchive}
          activeFilter='score'
          currentPage={1}
          totalPages={3}
        />
      </section>
      <section>
        <p className='border-b border-color-border bg-secondary px-4 py-2 font-ui text-sm text-color-inverse'>
          2ページ目（/movie?page=2 相当）— 同じ内訳で計13カード
        </p>
        <ListTemplate
          categoryName='映画'
          categoryDescription='今観るべき作品を、スコアで選ぶ'
          posts={thirteenPostsMovieArchive}
          activeFilter='score'
          currentPage={2}
          totalPages={3}
        />
      </section>
    </div>
  ),
};

export const Chaos: Story = {
  args: {
    categoryName: '映画',
    categoryDescription: '今観るべき作品を、スコアで選ぶ',
    posts: chaosPosts,
    activeFilter: 'score',
    currentPage: 1,
    totalPages: 3,
  },
};

export const Dense: Story = {
  args: {
    ...Default.args,
    posts: Array.from({ length: 14 }, (_, i) => ({
      ...mockPost,
      id: `dense-${i}`,
      slug: `/posts/dense-${i}`,
      title: `レビュー記事タイトル ${i + 1}`,
      publishedAt: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
      score: (i % 5) + 1,
    })),
    totalPages: 4,
    currentPage: 1,
  },
};

export const Extreme: Story = {
  args: {
    ...Default.args,
    posts: Array.from({ length: 22 }, (_, i) => ({
      ...mockPost,
      id: `ext-${i}`,
      slug: `/posts/ext-${i}`,
      title: `Extreme list item ${i + 1}`,
      publishedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-15`,
      score: (i % 5) + 1,
      image: i % 3 === 0 ? null : mockPost.image,
    })),
    totalPages: 6,
    currentPage: 3,
  },
};
