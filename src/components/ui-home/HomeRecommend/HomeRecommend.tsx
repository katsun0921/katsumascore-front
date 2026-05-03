import Link from 'next/link';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import type { Post } from '@/types/post';
export type RecommendBlock = {
  tag: string;
  posts: Post[];
  seeAllHref?: string;
};

export type HomeRecommendProps = {
  title: string;
  seeAllLabel: string;
  blocks: RecommendBlock[];
};

export const HomeRecommend = ({ title, seeAllLabel, blocks }: HomeRecommendProps) => {
  return (
    <section className='homeRecommend'>
      <h2 className='homeRecommend__title'>{title}</h2>
      <div className='homeRecommend__blocks'>
        {blocks.map(({ tag, posts, seeAllHref }) => (
          <div key={tag} className='homeRecommend__block'>
            <div className='homeRecommend__blockHeader'>
              <span className='homeRecommend__tag'>{tag}</span>
              {seeAllHref && (
                <Link href={seeAllHref} className='homeRecommend__seeAll'>
                  {seeAllLabel}
                </Link>
              )}
            </div>
            <HomeCardScrollList posts={posts} />
          </div>
        ))}
      </div>
    </section>
  );
};
