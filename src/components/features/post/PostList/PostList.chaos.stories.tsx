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
