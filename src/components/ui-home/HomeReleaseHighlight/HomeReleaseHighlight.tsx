import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import type { HomeReleaseHighlightProps, ReleaseHighlightItem } from './HomeReleaseHighlight.types';

const ReleaseHighlightCard = ({
  label,
  item: { title, publishedAt, href },
}: {
  label: string;
  item: ReleaseHighlightItem;
}) => (
  <Link
    href={href}
    locale={linkLocaleForHref(href)}
    className='homeReleaseHighlight__card'
  >
    <span className='homeReleaseHighlight__cardLabel'>{label}</span>
    <span className='homeReleaseHighlight__cardTitle'>{title}</span>
    <span className='homeReleaseHighlight__cardDate'>{publishedAt.slice(0, 10)}</span>
  </Link>
);

export const HomeReleaseHighlight = ({
  theaterTitle,
  vodTitle,
  theaterItem,
  vodItem,
}: HomeReleaseHighlightProps) => {
  if (!theaterItem && !vodItem) return null;

  return (
    <section data-component='HomeReleaseHighlight' className='homeReleaseHighlight'>
      <div className='homeReleaseHighlight__grid'>
        {theaterItem && <ReleaseHighlightCard label={theaterTitle} item={theaterItem} />}
        {vodItem && <ReleaseHighlightCard label={vodTitle} item={vodItem} />}
      </div>
    </section>
  );
};
