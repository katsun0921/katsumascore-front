/**
 * PostList Chaos Stories
 *
 * Uses the full chaosPosts dataset to stress the grid layout under real-world
 * CMS conditions: inconsistent card heights, mixed image availability,
 * missing metadata, and volume extremes.
 *
 * Goal: verify that the grid remains stable when every card is different.
 * If grid alignment, gap, and column structure survive this, the list is production-ready.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostList } from './PostList';
import { chaosPosts } from '@/components/features/post/mocks/chaosPosts';

const meta = {
  title: 'Features/Post/PostList/Chaos',
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
// ChaosMixed (CRITICAL)
// What it tests: all 22 chaos posts in a 3-column grid simultaneously.
//   - Row 1: normal card / extreme title (130+ chars) / no-image
//   - Row 2: 1-char title / missing category / missing score + no-image
//   - Row 3: 2019 date / triple-missing / 200+ char excerpt
//   - Row 4-8: remaining chaos posts with full variety
// Layout risks:
//   - Rows where card A has a 1-char title and card B has a 130-char title
//     → dramatic height difference within the same grid row
//   - image cards and no-image fallback cards side by side
//   - Missing metadata creates invisible space vs. no space ambiguity
// Pass condition:
//   - Grid columns remain aligned across all rows
//   - No card bleeds into or overlaps another
//   - Consistent gap between cards regardless of height difference
// ---------------------------------------------------------------------------
export const ChaosMixed: Story = {
  name: '[Chaos] ChaosMixed (all 22 chaos posts — CRITICAL)',
  args: {
    posts: chaosPosts,
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// ChaosDense
// What it tests: 22 chaos posts in dense list variant.
//   Simulates a search results page or category archive where the CMS
//   returns a full unfiltered dataset.
// Layout risks:
//   - List items with no image stack oddly in list layout
//   - Missing score/category fields create jagged left-edge alignment
//   - Old dates (2019, 2020) contrast visually with 2026 posts
// Pass condition:
//   - List rows maintain consistent baseline alignment
//   - No row collapses or expands unexpectedly
// ---------------------------------------------------------------------------
export const ChaosDense: Story = {
  name: '[Chaos] ChaosDense (22 posts, list variant)',
  args: {
    posts: chaosPosts,
    variant: 'list',
  },
};

// ---------------------------------------------------------------------------
// ChaosSingle
// What it tests: a single chaos post — the most broken card in the dataset.
//   Uses chaos-015 (image=null, category=undefined, score=undefined).
// Layout risks:
//   - A single card in a grid — does it stretch to fill the container?
//   - No metadata means the card body is nearly empty
// Pass condition:
//   - Card aligns to the first column and does not stretch full-width
//   - Card maintains its natural minimum height
// ---------------------------------------------------------------------------
export const ChaosSingle: Story = {
  name: '[Chaos] ChaosSingle (1 post, most broken card)',
  args: {
    // chaos-015: triple missing (image=null, category=undefined, score=undefined)
    posts: [chaosPosts[14]],
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// ChaosFirstRow
// What it tests: only the first 3 posts — exactly one grid row.
//   The 3 posts are: normal / extreme-title / no-image.
//   This is the most extreme height-difference scenario within a single row.
// Layout risks:
//   - Card 1 (normal height) vs Card 2 (extreme title, tall) vs Card 3 (no-image fallback)
//   - Row alignment must hold across this height spread
// Pass condition:
//   - All 3 cards share the same top edge (grid row alignment)
//   - No card wraps to the next row
// ---------------------------------------------------------------------------
export const ChaosFirstRow: Story = {
  name: '[Chaos] ChaosFirstRow (1 row: normal / extreme-title / no-image)',
  args: {
    posts: chaosPosts.slice(0, 3),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// ChaosSliceMiddle
// What it tests: posts 5–14 (10 posts from the middle of the chaos dataset).
//   This slice deliberately avoids the "normal anchor" posts at index 0 and 17.
//   Data in this range is maximally broken: no category, no score, old dates,
//   long excerpts, future dates.
// Pass condition:
//   - Grid handles 10 inconsistent cards over 4 rows without collapse
// ---------------------------------------------------------------------------
export const ChaosSliceMiddle: Story = {
  name: '[Chaos] ChaosSliceMiddle (posts 5–14, most broken range)',
  args: {
    posts: chaosPosts.slice(4, 14),
    variant: 'grid',
  },
};

// ---------------------------------------------------------------------------
// HeightChaos (CRITICAL)
// What it tests: the grid under maximum height variance — each card in the
//   dataset is engineered to produce a drastically different rendered height:
//
//   Card 1 — 1-char title + 1-char excerpt + image  → minimum body height
//   Card 2 — 3–5 line title + image (wide 16:9)     → tall body, wide image source
//   Card 3 — very long excerpt + image (tall 3:4)   → excerpt-driven height, tall image source
//   Card 4 — image=null                              → fallback block, no text pressure
//   Card 5 — 3–5 line title + long excerpt + image  → maximum combined height
//             (square 1:1 image source)
//
// Note: PostCard constrains all images to aspect-ratio 27/20 via CSS, so the
//   native image ratio does not affect card height. The risk here is the text
//   content area — rows with mixed text density will produce extreme height spreads.
//
// Layout risks:
//   - Row containing Card 1 (min-height) and Card 2 (tall title) in the same row
//   - Card 4 (no image) next to Card 3 (long excerpt) — fallback vs. text-heavy
//   - CSS grid must align tops without masonry — bottom edges will be uneven
// Pass condition:
//   - All 5 cards share the same top edge within each grid row
//   - No card bleeds into or overlaps an adjacent card
//   - Gap between cards is consistent regardless of content height
// ---------------------------------------------------------------------------

import type { Post } from '@/components/features/post/types/post';

const heightChaosPosts: Post[] = [
  // Card 1: minimum content — 1-char title, 1-char excerpt, image present
  // Target: absolute floor of card height
  {
    id: 'height-001',
    slug: '/posts/height-min',
    title: '映',
    excerpt: '。',
    image: '/images/mock-image.webp', // wide source (16:9 native)
    publishedAt: '2026-04-01',
    category: '映画',
    score: 3,
  },

  // Card 2: 3–5 line title — tests title overflow and card body expansion
  // Wide image (16:9): horizontal poster-style source
  {
    id: 'height-002',
    slug: '/posts/height-long-title',
    title:
      '劇場版アニメーションにおける長回し演出の系譜：押井守から湯浅政明まで、日本アニメが蓄積してきた「時間の映画的操作」についての包括的批評【全作品レビュー付き】',
    excerpt: '短い概要文。',
    image: '/images/mock-image.webp', // wide source (16:9 native)
    publishedAt: '2026-03-28',
    category: 'アニメ',
    score: 5,
  },

  // Card 3: extremely long excerpt — tests excerpt overflow at 3-line clamp
  // Tall image (3:4): vertical poster-style source (same display ratio via CSS)
  {
    id: 'height-003',
    slug: '/posts/height-long-excerpt',
    title: '2026年春アニメ総評',
    excerpt:
      'このクールが一貫して示してきた傾向は、原作の複雑な世界観をシリーズ構成の段階で思い切って圧縮し、映像的なリズムと感情の密度を優先するというアプローチであり、それが視聴者層の広がりと批評的な評価の両立という難題を、少なくとも今季に限っては見事にクリアしていたという点において、今後の業界的な参照点になりうる重要なシーズンだったと評価できます。',
    image: '/images/mock-image.webp', // tall source (3:4 native)
    publishedAt: '2026-04-02',
    category: 'アニメ',
    score: 4,
  },

  // Card 4: no image — fallback block fills media area; body has minimal text
  // Tests: fallback block height vs. image-card height in the same row
  {
    id: 'height-004',
    slug: '/posts/height-no-image',
    title: '画像なしの記事：fallbackブロックの高さ確認',
    excerpt: 'サムネイル画像が存在しない記事のフォールバック表示を確認します。',
    image: null,
    publishedAt: '2026-04-03',
    // category: undefined, score: undefined  — stripped to minimum
  },

  // Card 5: maximum combined height — 3–5 line title + very long excerpt + image
  // Square image (1:1): equal-dimension source (same display ratio via CSS)
  // This is the heaviest possible card: both title AND excerpt at maximum density
  {
    id: 'height-005',
    slug: '/posts/height-max',
    title:
      '「映像化不可能」と言われた長編小説を完全映像化した監督の意図と、8年間の制作期間を経て完成した映像表現の限界への挑戦について：世界市場への訴求を同時に達成した傑作の包括的批評',
    excerpt:
      '原作のページ数は1,200ページを超え、登場人物は300人以上にのぼる。それをアニメーション映像に落とし込む作業は、単なる「翻訳」ではなく、メディアの特性そのものを問い直す行為であった。監督が8年間にわたって積み上げてきた演出メモと絵コンテは、完成した映像の一カット一カットに痕跡を残している。',
    image: '/images/mock-image.webp', // square source (1:1 native)
    publishedAt: '2026-01-10',
    category: 'アニメ',
    score: 5,
  },
];

export const HeightChaos: Story = {
  name: '[Chaos] HeightChaos (max height variance: min ↔ max, wide/tall/square/no-image)',
  args: {
    posts: heightChaosPosts,
    variant: 'grid',
  },
};
