/**
 * PostCard Chaos Stories
 *
 * These stories pull directly from chaosPosts — a realistic messy CMS dataset.
 * Each story isolates a single high-risk card condition.
 *
 * Goal: verify that PostCard degrades gracefully when WordPress data is incomplete,
 * inconsistent, or extreme. If every story here renders without layout breakage,
 * the card is production-ready.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from './PostCard';
import { chaosPosts } from '@/components/features/Post/mocks/chaosPosts';

const meta = {
  title: 'Features/Post/PostCard/Chaos',
  component: PostCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ChaosExtremeTitle
// What it tests: a 130+ character title that mirrors real WordPress post titles.
// Layout risk: card height explosion, overflow beyond card boundaries,
//              text bleeding into adjacent elements.
// Pass condition: title wraps cleanly; card expands without breaking padding/gap.
// ---------------------------------------------------------------------------
export const ChaosExtremeTitle: Story = {
  name: '[Chaos] ChaosExtremeTitle',
  args: {
    // chaos-002: 130+ char title, image present, score=5
    post: chaosPosts[1],
  },
};

// ---------------------------------------------------------------------------
// ChaosNoImage
// What it tests: image=null forces the fallback <div> to render.
// Layout risk: fallback block collapses to 0 height or stretches the card
//              to an unexpected height compared to image cards.
// Pass condition: fallback block fills the media area consistently;
//                card height matches a comparable image card.
// ---------------------------------------------------------------------------
export const ChaosNoImage: Story = {
  name: '[Chaos] ChaosNoImage',
  args: {
    // chaos-003: image=null, category present, score present
    post: chaosPosts[2],
  },
};

// ---------------------------------------------------------------------------
// ChaosBrokenMeta
// What it tests: both `category` and `score` are undefined simultaneously.
// Layout risk: spacing around missing elements collapses or creates ghost gaps;
//              the body area shrinks unexpectedly.
// Pass condition: card renders with only required fields; no empty space artifacts.
// ---------------------------------------------------------------------------
export const ChaosBrokenMeta: Story = {
  name: '[Chaos] ChaosBrokenMeta (category=undefined, score=undefined)',
  args: {
    // chaos-008: image=null, category=undefined, score=undefined
    post: chaosPosts[7],
  },
};

// ---------------------------------------------------------------------------
// ChaosExtremeTitle_NoImage
// What it tests: compound failure — 130+ char title AND image=null.
// Layout risk: additive height pressure from both long text and fallback block.
// Pass condition: both stress conditions coexist without overlapping or collapsing.
// ---------------------------------------------------------------------------
export const ChaosExtremeTitle_NoImage: Story = {
  name: '[Chaos] ChaosExtremeTitle + NoImage (compound)',
  args: {
    // chaos-011: long title, image=null, score=undefined
    post: chaosPosts[10],
  },
};

// ---------------------------------------------------------------------------
// ChaosVeryShortTitle
// What it tests: single-character title with minimal excerpt.
// Layout risk: card shrinks too aggressively; body area loses minimum height;
//              date and title overlap.
// Pass condition: card maintains minimum height; proportions are stable.
// ---------------------------------------------------------------------------
export const ChaosVeryShortTitle: Story = {
  name: '[Chaos] ChaosVeryShortTitle (1 char)',
  args: {
    // chaos-004: title='映', excerpt='短い概要。'
    post: chaosPosts[3],
  },
};

// ---------------------------------------------------------------------------
// ChaosOldDate
// What it tests: publishedAt from 2019 — date string formatting edge case.
// Layout risk: unusually long or formatted date string shifts surrounding elements.
// Pass condition: date renders inline; no overflow or wrapping into title area.
// ---------------------------------------------------------------------------
export const ChaosOldDate: Story = {
  name: '[Chaos] ChaosOldDate (publishedAt: 2019)',
  args: {
    // chaos-007: publishedAt='2019-07-04'
    post: chaosPosts[6],
  },
};

// ---------------------------------------------------------------------------
// ChaosLongExcerpt
// What it tests: a 200+ character excerpt simulating WordPress auto-generated extracts.
// Layout risk: excerpt overflows card boundary or pushes title off-screen.
// Pass condition: excerpt truncates or wraps within card constraints.
// ---------------------------------------------------------------------------
export const ChaosLongExcerpt: Story = {
  name: '[Chaos] ChaosLongExcerpt (200+ char excerpt)',
  args: {
    // chaos-009: very long excerpt, image present, score=5
    post: chaosPosts[8],
  },
};

// ---------------------------------------------------------------------------
// ChaosTripleMissing
// What it tests: image=null + category=undefined + score=undefined at once.
// Layout risk: the most stripped-down card possible — only required fields remain.
// Pass condition: card renders safely with zero optional content.
// ---------------------------------------------------------------------------
export const ChaosTripleMissing: Story = {
  name: '[Chaos] ChaosTripleMissing (image=null, category=undefined, score=undefined)',
  args: {
    // chaos-015: all three optional visual fields absent
    post: chaosPosts[14],
  },
};
