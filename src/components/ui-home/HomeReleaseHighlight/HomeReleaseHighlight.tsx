import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import type { HomeReleaseHighlightProps, ReleaseHighlightBlock } from './HomeReleaseHighlight.types';

const ReleaseBlock = ({
  label,
  seeAllLabel,
  block: { href, works, articleTitle },
}: {
  label: string;
  seeAllLabel: string;
  block: ReleaseHighlightBlock;
}) => (
  <div className='homeReleaseHighlight__block'>
    <div className='homeReleaseHighlight__blockHeader'>
      <h3 className='homeReleaseHighlight__blockTitle'>{label}</h3>
      <Link
        href={href}
        locale={linkLocaleForHref(href)}
        className='homeReleaseHighlight__seeAll'
      >
        {seeAllLabel}
      </Link>
    </div>
    {works.length > 0 ? (
      <ul className='homeReleaseHighlight__workList'>
        {works.map((work) => (
          <li key={work.title} className='homeReleaseHighlight__work'>
            <span className='homeReleaseHighlight__workTitle'>{work.title}</span>
            {work.meta && <span className='homeReleaseHighlight__workMeta'>{work.meta}</span>}
          </li>
        ))}
      </ul>
    ) : (
      <p className='homeReleaseHighlight__fallback'>{articleTitle}</p>
    )}
  </div>
);

export const HomeReleaseHighlight = ({
  theaterTitle,
  vodTitle,
  seeAllLabel,
  theater,
  vod,
}: HomeReleaseHighlightProps) => {
  if (!theater && !vod) return null;

  return (
    <section data-component='HomeReleaseHighlight' className='homeReleaseHighlight'>
      {theater && <ReleaseBlock label={theaterTitle} seeAllLabel={seeAllLabel} block={theater} />}
      {vod && <ReleaseBlock label={vodTitle} seeAllLabel={seeAllLabel} block={vod} />}
    </section>
  );
};
