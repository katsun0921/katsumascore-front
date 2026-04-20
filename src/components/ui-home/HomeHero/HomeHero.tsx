import Link from 'next/link';
import { type VodService, VOD_LABEL } from '@/lib/vod';
import './HomeHero.scss';

export type HomeHeroProps = {
  title: string;
  subtitle: string;
  score: number;
  rank: string;
  href: string;
  vods?: VodService[];
};

const HexScore = ({ score, rank }: { score: number; rank: string }) => (
  <svg
    className='homeHero__hexScore'
    width='100'
    height='110'
    viewBox='0 0 100 110'
    aria-label={`スコア ${score} ランク ${rank}`}
  >
    <polygon
      points='50,2 96,28 96,82 50,108 4,82 4,28'
      fill='var(--color-score-bg)'
      stroke='var(--color-score-border)'
      strokeWidth='2'
    />
    <text
      x='50'
      y='58'
      textAnchor='middle'
      fill='var(--color-score-border)'
      fontSize='28'
      fontWeight='700'
      fontFamily='var(--font-ui)'
    >
      {score.toFixed(1)}
    </text>
    <text
      x='50'
      y='76'
      textAnchor='middle'
      fill='var(--color-score-rank-s-text)'
      fontSize='11'
      fontWeight='500'
      fontFamily='var(--font-ui)'
    >
      RANK {rank}
    </text>
  </svg>
);

export const HomeHero = ({ title, subtitle, score, rank, href, vods = [] }: HomeHeroProps) => {
  return (
    <section className='homeHero'>
      <div className='homeHero__inner'>
        <div className='homeHero__visual'>
          <HexScore score={score} rank={rank} />
          {vods.length > 0 && (
            <div className='homeHero__vods'>
              {vods.map((vod) => (
                <span key={vod} className={`homeHero__vodBadge homeHero__vodBadge--${vod}`}>
                  {VOD_LABEL[vod]}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='homeHero__content'>
          <p className='homeHero__label'>FEATURED REVIEW</p>
          <h2 className='homeHero__title'>{title}</h2>
          <p className='homeHero__subtitle'>{subtitle}</p>
          <Link href={href} className='homeHero__cta'>
            レビューを読む
          </Link>
        </div>
      </div>
      <div className='homeHero__fade' aria-hidden='true' />
    </section>
  );
};
