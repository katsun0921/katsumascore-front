import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockLatestPosts } from '@/components/ui-home/mocks/home';
import { HomeCuratedPosts } from './HomeCuratedPosts';

const meta: Meta<typeof HomeCuratedPosts> = {
  title: 'UI-Home/HomeCuratedPosts',
  component: HomeCuratedPosts,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0618', padding: '24px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: '泣けるアニメ映画',
    description: '観終わったあと、しばらく動けなくなる作品を集めた。',
    seeAllHref: '/ja/anime',
    seeAllLabel: 'すべて見る →',
    posts: mockLatestPosts,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    description:
      '公開から数年経っても語られ続ける作品を、今あらためて観る理由ごとに集めた。初見の人にも、もう一度観たい人にも向く、編集部が自信を持って薦める十作。'.repeat(2),
  },
};

export const SingleItem: Story = {
  args: { posts: mockLatestPosts.slice(0, 1) },
};

export const NoSeeAll: Story = {
  args: { seeAllHref: null },
};

export const NoDescription: Story = {
  args: { description: '' },
};

export const English: Story = {
  args: {
    label: 'Anime films that make you cry',
    description: 'Titles that stay with you long after the credits.',
    seeAllLabel: 'See all →',
  },
  globals: { locale: 'en' },
};
