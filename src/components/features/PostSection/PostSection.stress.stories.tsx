/**
 * PostSection Stress Stories
 *
 * Tests PostSection layout under:
 * - Multiple sections stacked vertically (spacing, visual rhythm)
 * - Mixed list sizes per section (1 item vs 20 items)
 * - Empty sections (0 posts → PostList empty state)
 * - Sections with no title
 * - Extremely long section title
 *
 * Goal: If the section container handles all of these gracefully,
 * it's ready for production page composition.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSection } from './PostSection';
import { PostList } from '@/components/features/PostList/PostList';
import { PostListRow } from '@/components/features/PostList/PostListRow/PostListRow';
import type { Post } from '@/components/features/post/types/post';

const meta = {
  title: 'Features/Post/PostSection/Stress',
  component: PostSection,
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
} satisfies Meta<typeof PostSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makePost = (overrides: Partial<Post> & Pick<Post, 'id'>): Post => ({
  slug: `/posts/${overrides.id}`,
  title: `記事タイトル ${overrides.id}`,
  excerpt: '通常の長さの概要テキストです。',
  image: '/images/dummy-540X400.webp',
  publishedAt: '2026-04-01',
  category: '映画',
  score: 3,
  ...overrides,
});

const generatePosts = (count: number, prefix = 'p', overrides?: Partial<Post>): Post[] =>
  Array.from({ length: count }, (_, i) =>
    makePost({ id: `${prefix}-${String(i + 1).padStart(3, '0')}`, ...overrides }),
  );

// ---------------------------------------------------------------------------
// MultipleSections
// Tests: 4 sections stacked — consistent section gap, title spacing, visual rhythm
// Expectation: sections do not bleed into each other; spacing is uniform
// ---------------------------------------------------------------------------
export const MultipleSections: Story = {
  name: '[Stress] MultipleSections (4 sections stacked)',
  render: () => (
    <>
      <PostSection title='最新映画レビュー'>
        <PostList posts={generatePosts(4, 'sec1')} />
      </PostSection>

      <PostSection title='春アニメ2026 注目作'>
        <PostList posts={generatePosts(4, 'sec2')} />
      </PostSection>

      <PostSection title='人気ドラマランキング'>
        <PostListRow posts={generatePosts(4, 'sec3')} />
      </PostSection>

      <PostSection title='編集部おすすめ'>
        <PostList posts={generatePosts(4, 'sec4')} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// MixedSections
// Tests: sections with wildly different post counts (1 vs 3 vs 10 vs 20)
// Expectation: section wrapper adjusts height to content; no fixed-height collapse
// ---------------------------------------------------------------------------
export const MixedSections: Story = {
  name: '[Stress] MixedSections (1 / 3 / 10 / 20 posts per section)',
  render: () => (
    <>
      <PostSection title='1件のみのセクション'>
        <PostList posts={generatePosts(1, 'mix-sm')} />
      </PostSection>

      <PostSection title='3件のセクション'>
        <PostList posts={generatePosts(3, 'mix-md')} />
      </PostSection>

      <PostSection title='10件のセクション'>
        <PostList posts={generatePosts(10, 'mix-lg')} />
      </PostSection>

      <PostSection title='20件の大規模セクション'>
        <PostList posts={generatePosts(20, 'mix-xl')} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// EmptySection
// Tests: PostList receives 0 posts — empty state is rendered inside PostSection
// Expectation: section still renders; PostList empty state is visible and accessible
// ---------------------------------------------------------------------------
export const EmptySection: Story = {
  name: '[Stress] EmptySection (0 posts)',
  args: {
    title: '記事が存在しないセクション',
    children: <PostList posts={[]} />,
  },
};

// ---------------------------------------------------------------------------
// EmptySectionNoTitle
// Tests: PostSection without title and without posts — minimum possible render
// Expectation: no visual crash; section occupies appropriate height via empty state
// ---------------------------------------------------------------------------
export const EmptySectionNoTitle: Story = {
  name: '[Stress] EmptySectionNoTitle (no title, 0 posts)',
  args: {
    children: <PostList posts={[]} />,
  },
};

// ---------------------------------------------------------------------------
// ExtremelyLongSectionTitle
// Tests: section <h2> with a very long string — overflow handling
// Expectation: title wraps or truncates without breaking the section layout
// ---------------------------------------------------------------------------
export const ExtremelyLongSectionTitle: Story = {
  name: '[Stress] ExtremelyLongSectionTitle',
  args: {
    title:
      '2026年春クールにおけるアニメ・映画・ドラマ全ジャンルを横断した包括的なエンターテインメントレビューコーナー：注目作品総まとめスペシャルエディション',
    children: <PostList posts={generatePosts(4, 'long-title-sec')} />,
  },
};

// ---------------------------------------------------------------------------
// ConsecutiveEmptySections
// Tests: multiple empty sections in a row
// Expectation: no compounding margin/padding collapse; each section is separated
// ---------------------------------------------------------------------------
export const ConsecutiveEmptySections: Story = {
  name: '[Stress] ConsecutiveEmptySections (3 empty sections stacked)',
  render: () => (
    <>
      <PostSection title='空のセクション A'>
        <PostList posts={[]} />
      </PostSection>

      <PostSection title='空のセクション B'>
        <PostList posts={[]} />
      </PostSection>

      <PostSection title='空のセクション C'>
        <PostList posts={[]} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// MixedContentSections
// Tests: each section contains chaotic post data (image/no-image, long/short titles)
// Expectation: visual chaos inside each section is contained; inter-section spacing holds
// ---------------------------------------------------------------------------
const chaosPosts: Post[] = [
  makePost({ id: 'chaos-001', title: '短タイトル', excerpt: '短い概要。', score: 5, category: 'アニメ' }),
  makePost({ id: 'chaos-002', image: null, title: '画像なし記事', excerpt: '画像なしパターン。', score: undefined, category: undefined }),
  makePost({
    id: 'chaos-003',
    title: '非常に長いタイトルで複数行にわたる記事：演出・脚本・音楽のすべてを包括するレビュー【ネタバレあり】',
    excerpt: '長い概要テキスト。これにより同じグリッド行の他カードとの高さ差が生じます。',
    score: 4,
    category: '映画',
  }),
  makePost({ id: 'chaos-004', title: '普通', excerpt: '普通の概要。', score: undefined, category: 'ドラマ' }),
];

export const MixedContentSections: Story = {
  name: '[Stress] MixedContentSections (chaos data across 3 sections)',
  render: () => (
    <>
      <PostSection title='カオスセクション 1（grid）'>
        <PostList posts={chaosPosts} />
      </PostSection>

      <PostSection title='カオスセクション 2（list）'>
        <PostListRow posts={chaosPosts} />
      </PostSection>

      <PostSection title='カオスセクション 3（grid・20件）'>
        <PostList
          posts={[
            ...chaosPosts,
            ...generatePosts(16, 'fill', { image: null, score: undefined, category: undefined }),
          ]}
         
        />
      </PostSection>
    </>
  ),
};
