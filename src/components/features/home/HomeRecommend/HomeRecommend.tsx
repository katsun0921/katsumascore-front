import Link from 'next/link';
import { HomeCardScroll } from '@/components/features/home/HomeCardScroll';
import type { Post } from '@/types/post';
import './HomeRecommend.scss';

export type RecommendBlock = {
  tag: string;
  posts: Post[];
  seeAllHref?: string;
};

export type HomeRecommendProps = {
  blocks: RecommendBlock[];
};

export const HomeRecommend = ({ blocks }: HomeRecommendProps) => {
  return (
    <section className='homeRecommend'>
      <h2 className='homeRecommend__title'>こちらもおすすめ</h2>
      <div className='homeRecommend__blocks'>
        {blocks.map(({ tag, posts, seeAllHref }) => (
          <div key={tag} className='homeRecommend__block'>
            <div className='homeRecommend__blockHeader'>
              <span className='homeRecommend__tag'>{tag}</span>
              {seeAllHref && (
                <Link href={seeAllHref} className='homeRecommend__seeAll'>
                  すべて見る →
                </Link>
              )}
            </div>
            <HomeCardScroll posts={posts} />
          </div>
        ))}
      </div>
    </section>
  );
};
