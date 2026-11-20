import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';
import { HomeCard } from '@/components/ui-home/HomeCard';
import { PostCardImgTop } from '@/components/ui-section/PostCard/PostCardImgTop';
import { SayoProvider } from '@/components/features/sayo/SayoProvider';
import { createSayoMockClient } from '@/components/features/sayo/mocks/sayoMockClient';
import { mockPost, mockPostLongTitle, mockPostNoImage } from '@/mocks/post';
import { sayoMockChips } from '@/mocks/sayo';
import type { Post } from '@/types/post';
import { SayoCardAction } from './SayoCardAction';

const Frame = ({ post, visible = true }: { post: Post; visible?: boolean }) => {
  const client = useMemo(() => createSayoMockClient({ status: { visible } }), [visible]);
  const action = <SayoCardAction articleId={1203} title={post.title} />;
  return (
    <SayoProvider client={client} chips={sayoMockChips.map((c) => c.label)}>
      <div className='flex flex-wrap items-start gap-6'>
        <div className='bg-[var(--color-bg-dark)] p-4'>
          <HomeCard post={post} action={action} />
        </div>
        <div className='w-80'>
          <PostCardImgTop post={post} action={action} />
        </div>
      </div>
    </SayoProvider>
  );
};

const meta = {
  title: 'Features/Sayo/SayoCardAction',
  component: Frame,
  parameters: { layout: 'padded' },
  args: { post: mockPost },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTitle: Story = { args: { post: mockPostLongTitle } };

export const NoImage: Story = { args: { post: mockPostNoImage } };

/** 表示フラグ OFF：ボタンが出ず、カードは従来どおり */
export const Hidden: Story = { args: { visible: false } };
