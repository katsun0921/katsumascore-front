import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import type { HomeCuratedPostsProps } from './HomeCuratedPosts.types';

export const HomeCuratedPosts = ({
  label,
  description,
  seeAllHref,
  seeAllLabel,
  posts,
}: HomeCuratedPostsProps) => {
  if (posts.length === 0) return null;

  return (
    <section data-component='HomeCuratedPosts' className='homeCuratedPosts'>
      <div className='homeCuratedPosts__header'>
        <h2 className='homeCuratedPosts__title'>{label}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            locale={linkLocaleForHref(seeAllHref)}
            className='homeCuratedPosts__seeAll'
          >
            {seeAllLabel}
          </Link>
        )}
      </div>
      {description !== '' && <p className='homeCuratedPosts__description'>{description}</p>}
      <HomeCardScrollList posts={posts} />
    </section>
  );
};
