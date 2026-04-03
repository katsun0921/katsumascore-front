import React from 'react';
import './PostTopImage.scss';
import { Category } from '@/components/ui/Category/Category';
import { Score } from '@/components/ui/Score/Score';
import { Heading } from '@/components/ui/Heading/Heading';
import type { PostCardData } from '@/features/post/types/PostCard';

type TPostTopImageProps = {
  post: PostCardData;
  excerpt?: string;
};

export const PostTopImage = ({ post, excerpt }: TPostTopImageProps) => {
  const { title, thumbnail, href, score } = post;

  const displayExcerpt = excerpt ?? post.excerpt;

  return (
    <a className='p-postTopImage' href={href}>
      <div className='p-postTopImage__image'>
        <img src={thumbnail} alt='' width={540} />
        {score && (
          <div className='absolute top-2 right-2'>
            <Score score={score} />
          </div>
        )}
      </div>
      <div className='p-postTopImage__content'>
        <div>
          <div className='mb-4'>
            <Category label='映画' size='small' />
          </div>
          <Heading headingLevel='3' isLink={false} type='post' label={title} />
          <p className='p-postTopImage__excerpt'>{displayExcerpt}</p>
        </div>
      </div>
    </a>
  );
};
