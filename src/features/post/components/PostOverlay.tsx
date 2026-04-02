import React from 'react';
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
        <div className='u-z-20 u-absolute u-right-1-5 u-top-1-5'>
          <Score score={score} />
        </div>
      )}
      <div className='u-z-20 u-relative'>
        <Category label='映画' size='small' />
      </div>
      <div className='p-postImageOverlay__content'>
        <div className='u-p-3'>
          <Heading headingLevel='3' isLink={false} type='post' label={title} />
        </div>
      </div>
    </a>
  );
};
