import React from 'react';
import { Category } from '../../components/Category/Category';
import { Score } from '../../components/Score/Score';
import { Heading } from '../../components/Heading/Heading';
import type { WPPost } from '../../../types/wordpress';
import '@/scss/layout/_post.scss';

type TPostOverlayProps = {
  post?: WPPost;
  locale?: string;
};

export const PostOverlay = ({ post, locale = 'ja' }: TPostOverlayProps) => {
  const title =
    locale === 'ja'
      ? post?.acf?.title_jp || post?.title?.rendered || 'ジュピター[映画マトリックスのウォシャウスキー姉弟監督が手がけるSF大作]'
      : post?.acf?.title_en || post?.title?.rendered || 'ジュピター[映画マトリックスのウォシャウスキー姉弟監督が手がけるSF大作]';

  const imageSrc =
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/dummy-540X400.webp';

  const score = post?.acf?.review_score;

  return (
    <a
      className='p-postImageOverlay'
      href='#'
      style={{ backgroundImage: `url(${imageSrc})` }}
    >
      {score && (
        <div className='u-z-20 u-absolute u-right-1-5 u-top-1-5'>
          <Score score={String(score) as '1' | '2' | '3' | '4' | '5'} />
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
