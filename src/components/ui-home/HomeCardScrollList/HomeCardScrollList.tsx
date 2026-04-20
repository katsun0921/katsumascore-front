import Link from 'next/link';
import { HomeCard } from '@/components/ui-home/HomeCard';
import type { HomeCardScrollListProps } from './HomeCardScrollList.types';
import './HomeCardScrollList.scss';

export const HomeCardScrollList = ({
  title,
  posts,
  seeAllHref,
  icon,
}: HomeCardScrollListProps) => {
  return (
    <section className='homeCardScrollList'>
      {(title || seeAllHref) && (
        <div className='homeCardScrollList__header'>
          {title && (
            <div className='homeCardScrollList__titleRow'>
              {icon === 'star' && (
                <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden='true'>
                  <polygon
                    points='7,1 9,5 13,5.5 10,8.5 11,12.5 7,10.5 3,12.5 4,8.5 1,5.5 5,5'
                    fill='var(--color-score-border)'
                    opacity='0.7'
                  />
                </svg>
              )}
              <h2 className='homeCardScrollList__title'>{title}</h2>
            </div>
          )}
          {seeAllHref && (
            <Link href={seeAllHref} className='homeCardScrollList__seeAll'>
              すべて見る →
            </Link>
          )}
        </div>
      )}

      <div className='homeCardScrollList__track'>
        {posts.map((post) => (
          <HomeCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};
