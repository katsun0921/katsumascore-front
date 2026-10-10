import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { HomeCardScrollList } from '@/components/ui-home/HomeCardScrollList';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import type { CuratedSeriesView, HomeCuratedSeriesProps } from './HomeCuratedSeries.types';

/** シリーズ名。リンク先が無ければただのテキスト。 */
const SeriesTitle = ({ title, href }: Pick<CuratedSeriesView, 'title' | 'href'>) =>
  href === null ? (
    <h3 className='homeCuratedSeries__seriesTitle'>{title}</h3>
  ) : (
    <h3 className='homeCuratedSeries__seriesTitle'>
      <Link
        href={href}
        locale={linkLocaleForHref(href)}
        className='homeCuratedSeries__seriesLink'
      >
        {title}
      </Link>
    </h3>
  );

export const HomeCuratedSeries = ({
  label,
  description,
  seeAllHref,
  seeAllLabel,
  workCountTemplate,
  items,
}: HomeCuratedSeriesProps) => {
  if (items.length === 0) return null;

  return (
    <section data-component='HomeCuratedSeries' className='homeCuratedSeries'>
      <div className='homeCuratedSeries__header'>
        <h2 className='homeCuratedSeries__title'>{label}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            locale={linkLocaleForHref(seeAllHref)}
            className='homeCuratedSeries__seeAll'
          >
            {seeAllLabel}
          </Link>
        )}
      </div>
      {description !== '' && <p className='homeCuratedSeries__description'>{description}</p>}

      <div className='homeCuratedSeries__list'>
        {items.map((item) => (
          <div key={item.id} className='homeCuratedSeries__series'>
            <div className='homeCuratedSeries__seriesHead'>
              <div className='homeCuratedSeries__thumb'>
                <PostCardMedia image={item.image} title={item.title} sizes='64px' />
              </div>
              <div className='homeCuratedSeries__seriesText'>
                <SeriesTitle title={item.title} href={item.href} />
                <p className='homeCuratedSeries__seriesDescription'>
                  {item.description !== ''
                    ? item.description
                    : workCountTemplate.replace('{n}', String(item.postCount))}
                </p>
              </div>
            </div>
            <HomeCardScrollList posts={item.posts} />
          </div>
        ))}
      </div>
    </section>
  );
};
