import React from 'react';
import { ScoreWithRank } from '@/components/features/ScoreWithRank';
import { useLocale } from '@/i18n/provider';
import { SCORE_DISPLAY_MAX } from '@/lib/scoreDisplay';
export type TGoodPointProps = {
  points: string[]
  score?: number
}

export const GoodPoint = ({ points, score }: TGoodPointProps) => {
  const locale = useLocale();

  if (!points.length) return null;

  return (
    <section className='good-point'>
      <h2 className='good-point__heading'>
        {locale === 'en' ? 'I highly recommend this!' : 'ここがおすすめ！'}
      </h2>
      <ul className='good-point__list'>
        {points.map((point, i) => (
          <li key={i} className='good-point__item'>
            {point}
          </li>
        ))}
      </ul>
      {score != null && (
        <div className='good-point__rank'>
          <ScoreWithRank value={score} max={SCORE_DISPLAY_MAX} imageOnly />
        </div>
      )}
    </section>
  );
};
