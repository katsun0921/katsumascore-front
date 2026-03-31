import React from 'react';
import { Category } from '../../components/Category/Category';
import { Score } from '../../components/Score/Score';
import { Heading } from '../../components/Heading/Heading';
import type { WPPost } from '../../../types/wordpress';
import '@/scss/layout/_post.scss';

type TPostTopImageProps = {
  post?: WPPost;
  excerpt?: string;
  locale?: string;
};

export const PostTopImage = ({ post, excerpt, locale = 'ja' }: TPostTopImageProps) => {
  const title =
    locale === 'ja'
      ? post?.acf?.title_jp || post?.title?.rendered || '夏目漱石「私の個人主義」'
      : post?.acf?.title_en || post?.title?.rendered || '夏目漱石「私の個人主義」';

  const imageSrc =
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/dummy-540X400.webp';

  const score = post?.acf?.review_score;
  const displayExcerpt = excerpt ?? post?.excerpt?.rendered ?? '';

  return (
    <a className='p-postTopImage' href='#'>
      <div className='p-postTopImage__image'>
        <img src={imageSrc} alt='' width={540} />
        {score && (
          <div className='u-absolute u-right-2 u-top-2'>
            <Score score={String(score) as '1' | '2' | '3' | '4' | '5'} />
          </div>
        )}
      </div>
      <div className='p-postTopImage__content'>
        <div>
          <div className='u-mb-4'>
            <Category label='映画' size='small' />
          </div>
          <Heading headingLevel='3' isLink={false} type='post' label={title} />
          <p className='p-postTopImage__excerpt'>{displayExcerpt}</p>
        </div>
      </div>
    </a>
  );
};
