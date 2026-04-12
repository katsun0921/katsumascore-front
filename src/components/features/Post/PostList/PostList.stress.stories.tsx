/**
 * PostList Stress Stories
 *
 * Tests the list/grid layout under extreme data conditions:
 * - Volume stress (1 item, 10 items, 20+ items)
 * - Visual inconsistency (mixed image/no-image, short/long titles)
 * - Height inconsistency (cards of wildly different rendered heights)
 *
 * Goal: If the grid survives all of these, it's production-ready.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostList } from './PostList';
import type { Post } from '@/components/features/Post/types/post';

const meta = {
  title: 'Features/Post/PostList/Stress',
  component: PostList,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostList>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makePost = (overrides: Partial<Post> & Pick<Post, 'id'>): Post => ({
  slug: `/posts/${overrides.id}`,
  title: `記事タイトル ${overrides.id}`,
  excerpt: 'デフォルトの概要テキストです。通常の長さを想定しています。',
  image: '/images/mock-image.webp',
  publishedAt: '2026-04-01',
  category: '映画',
  score: 3,
  ...overrides,
});

/** Generate N posts with an auto-incrementing id */
const generatePosts = (count: number, overrides?: Partial<Post>): Post[] =>
  Array.from({ length: count }, (_, i) =>
    makePost({ id: `stress-${String(i + 1).padStart(3, '0')}`, ...overrides }),
  );

// ---------------------------------------------------------------------------
// SingleItem
// Tests: grid with a single card — does it stretch to fill the row?
// Expectation: single card aligns to the first column; no full-width stretch
// ---------------------------------------------------------------------------
export const SingleItem: Story = {
  name: '[Stress] SingleItem',
  args: {
    posts: [
      makePost({
        id: 'single-001',
        title: 'リストに記事が1件だけある場合のグリッドレイアウト確認',
        excerpt: '1件のみのとき、カードが全幅に引き伸ばされないことを確認します。',
      }),
    ],
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// Dense10
// Tests: moderate volume — 10 items in a grid
// Expectation: grid wraps correctly at expected breakpoints
// ---------------------------------------------------------------------------
export const Dense10: Story = {
  name: '[Stress] Dense10 (10 items)',
  args: {
    posts: generatePosts(10),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// Dense20
// Tests: high volume — 20+ items in a grid
// Expectation: all cards render; no performance-related layout collapse
// ---------------------------------------------------------------------------
export const Dense20: Story = {
  name: '[Stress] Dense20 (20 items)',
  args: {
    posts: generatePosts(20),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// Dense20List
// Tests: high volume in list variant
// Expectation: list layout handles 20 items without visual regression
// ---------------------------------------------------------------------------
export const Dense20List: Story = {
  name: '[Stress] Dense20 — list variant',
  args: {
    posts: generatePosts(20),
    variant: 'list',
  },
};

// ---------------------------------------------------------------------------
// MixedContent
// Tests: real-world chaos — mix of image/no-image, short/long title, score/no score
// Expectation: inconsistent data does not break grid alignment
// ---------------------------------------------------------------------------
const mixedContentPosts: Post[] = [
  makePost({
    id: 'mix-001',
    title: '短タイトル',
    excerpt: '短い概要。',
    score: 5,
    category: 'アニメ',
  }),
  makePost({
    id: 'mix-002',
    image: null,
    title: '画像なし・通常の長さのタイトル記事',
    excerpt: '画像がないパターンの概要テキストです。',
    score: undefined,
    category: undefined,
  }),
  makePost({
    id: 'mix-003',
    title:
      '非常に長いタイトルが入った記事で、複数行にわたってテキストが折り返されるシナリオを確認するためのストレステスト用見出し文字列',
    excerpt:
      '長い概要テキストも同様にテストします。実際の運用ではWordPressの抜粋が120〜200文字になることも多く、この長さでカードの高さが適切に変化することを確認します。',
    score: 4,
  }),
  makePost({
    id: 'mix-004',
    title: '普通のタイトル',
    excerpt: 'スコアなし・カテゴリなし。',
    score: undefined,
    category: undefined,
  }),
  makePost({
    id: 'mix-005',
    image: null,
    title: '画像なし＋スコアあり（5.0）',
    excerpt: '画像なしでスコアが最高値の場合のレイアウト。',
    score: 5,
    category: 'ドラマ',
  }),
  makePost({
    id: 'mix-006',
    title: '普',
    excerpt: '最短クラスのコンテンツ。',
    score: 1,
    category: '映画',
  }),
];

export const MixedContent: Story = {
  name: '[Stress] MixedContent (image ↔ no-image, short ↔ long, score ↔ no-score)',
  args: {
    posts: mixedContentPosts,
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// UnevenHeight
// Tests: cards with dramatically different content heights in the same grid row
// Expectation: grid rows should align tops; bottom edges may differ — no overlap
// ---------------------------------------------------------------------------
const unevenHeightPosts: Post[] = [
  makePost({
    id: 'uneven-001',
    title: '短',
    excerpt: '短。',
    score: undefined,
    category: undefined,
  }),
  makePost({
    id: 'uneven-002',
    title:
      '非常に非常に長いタイトル記事A：脚本・演出・音楽・美術のすべてにわたる包括的なレビューテキストで意図的に高さを増やしています【ネタバレ含む詳細批評】',
    excerpt:
      '長い概要Aです。カードの高さが隣と大きく異なる場合に、グリッドの行揃えがどう機能するかを確認します。特にmasonryレイアウト非採用時に注目してください。',
    score: 5,
    category: '映画レビュー',
  }),
  makePost({
    id: 'uneven-003',
    title: '普通の長さ',
    excerpt: '普通の長さの概要テキストです。隣との高さ差を対比させるために使います。',
    score: 3,
  }),
  makePost({
    id: 'uneven-004',
    image: null,
    title:
      '非常に非常に長いタイトル記事B：画像なし版。fallbackブロックの高さと長いテキストの組み合わせで縦方向ストレスを加速させます【全話レビュー】',
    excerpt:
      '長い概要Bです。画像なしfallbackブロックと長いテキストが重なった場合の高さ挙動を確認します。左右の隣カードより大きく高さが異なります。',
    score: undefined,
    category: undefined,
  }),
  makePost({
    id: 'uneven-005',
    title: '1文字',
    excerpt: '。',
    score: 1,
    category: '映画',
  }),
  makePost({
    id: 'uneven-006',
    title: '中くらいのタイトル：標準的な記事',
    excerpt: '標準的な長さの概要です。',
    score: 4,
    category: 'ドラマ',
  }),
];

export const UnevenHeight: Story = {
  name: '[Stress] UnevenHeight (cards with dramatically different heights)',
  args: {
    posts: unevenHeightPosts,
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// ExtremeSpacing — tight viewport simulation
// Tests: grid compresses inside a narrow container (320px, simulating mobile)
// Expectation: grid falls back to 1-column; no horizontal overflow
// ---------------------------------------------------------------------------
export const ExtremeSpacing: Story = {
  name: '[Stress] ExtremeSpacing (narrow 320px container)',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '320px', margin: '0 auto', padding: '0 4px', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    posts: generatePosts(6),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// AllNoImage
// Tests: every card has no image — fallback rendering at scale
// Expectation: uniform fallback blocks without height inconsistency
// ---------------------------------------------------------------------------
export const AllNoImage: Story = {
  name: '[Stress] AllNoImage (every card is image=null)',
  args: {
    posts: generatePosts(8, { image: null }),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// AllMinimalData
// Tests: every card has only required fields; no category, score, or image
// Expectation: stripped-down cards render without crashing or layout gaps
// ---------------------------------------------------------------------------
export const AllMinimalData: Story = {
  name: '[Stress] AllMinimalData (required fields only)',
  args: {
    posts: Array.from({ length: 6 }, (_, i) => ({
      id: `minimal-${String(i + 1).padStart(3, '0')}`,
      slug: `/posts/minimal-${i + 1}`,
      title: `最低限データの記事 ${i + 1}`,
      excerpt: '最低限データ。',
      image: null,
      publishedAt: '2026-01-01',
    })),
    variant: 'grid',
  },
};
