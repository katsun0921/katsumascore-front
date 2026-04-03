import React from 'react';
import './PostOverlay.scss';
import { Category } from '@/components/ui/Category/Category';
import { Score } from '@/components/ui/Score/Score';
import { Heading } from '@/components/ui/Heading/Heading';
import type { PostCardData } from '@/features/post/types/PostCard';

type TPostOverlayProps = {
  post: PostCardData;
};

export const PostOverlay = ({ post }: TPostOverlayProps) => {
  const { title, thumbnail, href, score } = post;

  return (
    <a
      className='p-postImageOverlay'
      href={href}
      style={{ backgroundImage: `url(${thumbnail})` }}
    >
      {score && (
        <div className='absolute top-6 right-6 z-20'>
          <Score score={score} />
        </div>
      )}
      <div className='relative z-20'>
        <Category label='映画' size='small' />
      </div>
      <div className='p-postImageOverlay__content'>
        <div className='p-3'>
          <Heading headingLevel='3' isLink={false} type='post' label={title} />
        </div>
      </div>
    </a>
  );
};
