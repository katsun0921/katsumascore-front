import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from './PostCard';
import { chaosPosts } from '@/mocks/chaosPosts';

const meta = {
  title: 'Ui-Parts/PostCard/Chaos',
  component: PostCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PostCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChaosExtremeTitle: Story = {
  name: '[Chaos] ChaosExtremeTitle',
  args: {
    post: chaosPosts[1],
  },
};

export const ChaosNoImage: Story = {
  name: '[Chaos] ChaosNoImage',
  args: {
    post: chaosPosts[2],
  },
};

export const ChaosBrokenMeta: Story = {
  name: '[Chaos] ChaosBrokenMeta (category=undefined, score=undefined)',
  args: {
    post: chaosPosts[7],
  },
};

export const ChaosExtremeTitle_NoImage: Story = {
  name: '[Chaos] ChaosExtremeTitle + NoImage (compound)',
  args: {
    post: chaosPosts[10],
  },
};

export const ChaosVeryShortTitle: Story = {
  name: '[Chaos] ChaosVeryShortTitle (1 char)',
  args: {
    post: chaosPosts[3],
  },
};

export const ChaosOldDate: Story = {
  name: '[Chaos] ChaosOldDate (publishedAt: 2019)',
  args: {
    post: chaosPosts[6],
  },
};

export const ChaosLongExcerpt: Story = {
  name: '[Chaos] ChaosLongExcerpt (200+ char excerpt)',
  args: {
    post: chaosPosts[8],
  },
};

export const ChaosTripleMissing: Story = {
  name: '[Chaos] ChaosTripleMissing (image=null, category=undefined, score=undefined)',
  args: {
    post: chaosPosts[14],
  },
};
