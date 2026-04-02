import React from 'react';
import Image from 'next/image';
import { Category } from '@/components/ui/Category/Category';
import { Score } from '@/components/ui/Score/Score';
import { Heading } from '@/components/ui/Heading/Heading';
import type { PostCardData } from '@/features/post/types/PostCard';

type TPostLeftImageProps = {
  post: PostCardData;
  excerpt?: string;
};

export const PostLeftImage = ({ post, excerpt }: TPostLeftImageProps) => {
  const { title, thumbnail, href, score } = post;

  const displayExcerpt = excerpt ?? post.excerpt;

  return (
    <a className='p-postLeftImage' href={href}>
      <div className='p-postLeftImage__image'>
        <Image src={thumbnail} alt='' width={540} height={400} />
      </div>
      {score && (
        <div className='u-absolute u-right-2 u-top-2'>
          <Score score={score} />
        </div>
      )}
      <div className='p-postLeftImage__content'>
        <div>
          <div className='u-mb-4'>
            <Category label='映画' size='small' />
          </div>
          <Heading headingLevel='3' isLink={false} type='post' label={title} />
          <p className='u-mt-2'>{displayExcerpt}</p>
        </div>
      </div>
    </a>
  );
};
