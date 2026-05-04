import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSection } from './PostSection';
import { PostCardListVertical } from '@/components/ui-section/PostCard';
import { mockPosts } from '@/mocks/post';

const meta = {
  title: 'UI-Section/PostSection',
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

const renderOnlyArgs = {
  title: '',
  children: <></>,
} as const;

export const WithTitle: Story = {
  args: {
    title: '最新記事',
    children: <PostCardListVertical posts={mockPosts} />,
  },
};

export const WithoutTitle: Story = {
  args: {
    children: <PostCardListVertical posts={mockPosts} />,
  },
};

export const MultipleSections: Story = {
  args: renderOnlyArgs,
  render: () => (
    <>
      <PostSection title='最新記事'>
        <PostCardListVertical posts={mockPosts} />
      </PostSection>

      <PostSection title='人気記事'>
        <PostCardListVertical posts={mockPosts} postCardKind='imgLeft' />
      </PostSection>

      <PostSection title='アニメ'>
        <PostCardListVertical posts={mockPosts.slice(0, 2)} />
      </PostSection>
    </>
  ),
};
