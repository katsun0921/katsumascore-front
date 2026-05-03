import Link from 'next/link';
import { HomeCard } from '@/components/ui-home/HomeCard';
import type { Post } from '@/types/post';
export type HomeRankingProps = {
  title: string;
  posts: Post[];
  seeAllHref?: string;
};

export const HomeRanking = ({ title, posts, seeAllHref }: HomeRankingProps) => {
  return (
    <section className='homeRanking'>
      <div className='homeRanking__header'>
        <div>
          <p className='homeRanking__badge'>KATSUMASCORE</p>
          <h2 className='homeRanking__title'>{title}</h2>
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className='homeRanking__seeAll'>
            すべて見る →
          </Link>
        )}
      </div>

      <div className='homeRanking__track'>
        {posts.map((post, index) => {
          const rank = index + 1;
          return (
            <div key={post.id} className='homeRankingCard'>
              <span
                className={`homeRankingCard__rank${rank <= 3 ? ` homeRankingCard__rank--top${rank}` : ''}`}
                aria-label={`${rank}位`}
              >
                {rank}
              </span>
              <HomeCard post={post} />
            </div>
          );
        })}
      </div>
    </section>
  );
};
