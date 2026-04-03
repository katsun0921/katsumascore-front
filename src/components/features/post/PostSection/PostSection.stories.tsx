import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSection } from './PostSection';
import { PostList } from '@/components/features/post/PostList/PostList';
import { mockPosts } from '@/components/features/post/mocks/post';

const meta = {
  title: 'Features/Post/PostSection',
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

export const WithTitle: Story = {
  args: {
    title: '最新記事',
    children: <PostList posts={mockPosts} />,
  },
};

export const WithoutTitle: Story = {
  args: {
    children: <PostList posts={mockPosts} />,
  },
};

export const MultipleSections: Story = {
  render: () => (
    <>
      <PostSection title='最新記事'>
        <PostList posts={mockPosts} />
      </PostSection>

      <PostSection title='人気記事'>
        <PostList posts={mockPosts} variant='list' />
      </PostSection>

      <PostSection title='アニメ'>
        <PostList posts={mockPosts.slice(0, 2)} />
      </PostSection>
    </>
  ),
};
