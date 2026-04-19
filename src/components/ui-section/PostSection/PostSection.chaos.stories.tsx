/**
 * PostSection Chaos Stories
 *
 * Composes PostSection + PostList using chaosPosts slices to simulate
 * real page-level chaos: multiple sections on one page, each receiving
 * a different slice of dirty CMS data.
 *
 * Goal: verify that section spacing, title rendering, and inter-section
 * visual rhythm hold even when the content inside is maximally inconsistent.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSection } from './PostSection';
import { PostList } from '@/components/ui-section/PostList';
import { chaosPosts } from '@/mocks/chaosPosts';

const meta = {
  title: 'UI-Section/PostSection/Chaos',
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
// ChaosSections (CRITICAL)
// What it tests: 3 PostSections stacked vertically, each receiving a different
//   slice of chaosPosts — simulating a real homepage with Latest / Popular / Mixed.
//
//   Section 1 "Latest"   → chaosPosts[0..4]  : mix of normal + extreme title + no-image
//   Section 2 "Popular"  → chaosPosts[5..14] : maximally broken range (no meta, old dates)
//   Section 3 "Mixed"    → chaosPosts[0..19] : full 20-post chaos grid
//
// Layout risks:
//   - Section 1 ends at a wildly different height than Section 2 starts
//   - Section 2 has the most height-inconsistent cards (row 2: 1-char title next to 130-char title)
//   - Section 3 stacks 20 cards in 7 rows — compounding height chaos
//   - Inter-section margin must not collapse between sections
// Pass condition:
//   - Each section's title is visually separated from the previous section's content
//   - Grid alignment within each section is independent of other sections
//   - No visual bleed or overlap at section boundaries
// ---------------------------------------------------------------------------
export const ChaosSections: Story = {
  name: '[Chaos] ChaosSections (3 sections — CRITICAL)',
  render: () => (
    <>
      <PostSection title='Latest'>
        <PostList posts={chaosPosts.slice(0, 5)} />
      </PostSection>

      <PostSection title='Popular'>
        <PostList posts={chaosPosts.slice(5, 15)} />
      </PostSection>

      <PostSection title='Mixed'>
        <PostList posts={chaosPosts.slice(0, 20)} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// ChaosWithEmpty
// What it tests: one empty section adjacent to one populated section.
//   Simulates a category page where the first category has 0 articles
//   (e.g., a new category created in WordPress but not yet used).
//
// Layout risks:
//   - Empty section renders PostList's empty state inside PostSection
//   - Section title for the empty section still renders and takes space
//   - The gap between empty section and populated section must remain consistent
//   - Populated section below must not collapse upward to fill the void
// Pass condition:
//   - Empty section shows its empty state without layout collapse
//   - Visual separation between the two sections is maintained
// ---------------------------------------------------------------------------
export const ChaosWithEmpty: Story = {
  name: '[Chaos] ChaosWithEmpty (empty section + populated section)',
  render: () => (
    <>
      <PostSection title='新着記事（0件）'>
        <PostList posts={[]} />
      </PostSection>

      <PostSection title='人気記事'>
        <PostList posts={chaosPosts.slice(0, 6)} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// ChaosAllSectionsEmpty
// What it tests: 3 consecutive empty sections — maximum empty state stress.
//   Simulates a fresh WordPress install where categories exist but no posts
//   have been assigned to them yet.
//
// Layout risks:
//   - Consecutive empty states stack margin/padding additively
//   - Section titles may collapse toward each other without content separating them
// Pass condition:
//   - Each section's empty state is visually distinct and separated
//   - Section titles do not merge or overlap
// ---------------------------------------------------------------------------
export const ChaosAllSectionsEmpty: Story = {
  name: '[Chaos] ChaosAllSectionsEmpty (3 empty sections)',
  render: () => (
    <>
      <PostSection title='映画'>
        <PostList posts={[]} />
      </PostSection>

      <PostSection title='アニメ'>
        <PostList posts={[]} />
      </PostSection>

      <PostSection title='ドラマ'>
        <PostList posts={[]} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// ChaosAsymmetricSections
// What it tests: sections with wildly different post counts.
//   Section 1: 1 post (the most broken card: triple-missing)
//   Section 2: 20 posts (full chaos set)
//   Section 3: 3 posts (normal-ish subset)
//
// Layout risks:
//   - Section 1 renders a single card in a grid — must not stretch full-width
//   - Section 2 immediately after is 7 rows tall — the height contrast is jarring
//   - Section 3 after the tall section must not "float" with excess whitespace
// Pass condition:
//   - Each section wraps its content tightly
//   - No section inherits height from its sibling
// ---------------------------------------------------------------------------
export const ChaosAsymmetricSections: Story = {
  name: '[Chaos] ChaosAsymmetricSections (1 / 20 / 3 posts per section)',
  render: () => (
    <>
      <PostSection title='今週のピックアップ（1件）'>
        {/* chaos-015: triple missing — the most broken single card */}
        <PostList posts={[chaosPosts[14]]} />
      </PostSection>

      <PostSection title='全記事一覧（20件）'>
        <PostList posts={chaosPosts.slice(0, 20)} />
      </PostSection>

      <PostSection title='編集部おすすめ（3件）'>
        {/* chaos-001 / chaos-007 / chaos-017: normal + old-date + future-date */}
        <PostList posts={[chaosPosts[0], chaosPosts[6], chaosPosts[16]]} />
      </PostSection>
    </>
  ),
};

// ---------------------------------------------------------------------------
// ChaosNoSectionTitle
// What it tests: PostSection rendered without a `title` prop.
//   Simulates a design variant where section headings are omitted (e.g., homepage hero).
//   Uses chaosPosts so the content stress is still present.
//
// Layout risks:
//   - Without the <h2>, the section body may lose its top margin/padding reference
//   - The first card may collide with the section container's top edge
// Pass condition:
//   - Content renders correctly without title
//   - Spacing above the first card is consistent with the section container's padding
// ---------------------------------------------------------------------------
export const ChaosNoSectionTitle: Story = {
  name: '[Chaos] ChaosNoSectionTitle (title=undefined, chaos content)',
  args: {
    // No title prop — test graceful omission
    children: <PostList posts={chaosPosts.slice(0, 6)} />,
  },
};
