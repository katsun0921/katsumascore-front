import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostSection } from './PostSection';
import { PostList } from '@/components/ui-section/PostList';
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
        <PostList posts={mockPosts} variant='row' />
      </PostSection>

      <PostSection title='アニメ'>
        <PostList posts={mockPosts.slice(0, 2)} />
      </PostSection>
    </>
  ),
};
