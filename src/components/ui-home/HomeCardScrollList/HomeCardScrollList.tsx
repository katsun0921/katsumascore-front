import Link from 'next/link';
import { HomeCard } from '@/components/ui-home/HomeCard';
import { StarIcon } from '@/assets/icons';
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
                <StarIcon
                  width='14'
                  height='14'
                  aria-hidden='true'
                  fill='var(--color-score-accent)'
                  opacity='0.7'
                />
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
