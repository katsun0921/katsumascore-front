import Link from 'next/link';
import './HomeSeasonReview.scss';

export type SeasonItem = {
  label: string;
  period: string;
  href: string;
  isCurrent?: boolean;
};

export type HomeSeasonReviewProps = {
  seasons: SeasonItem[];
};

export const HomeSeasonReview = ({ seasons }: HomeSeasonReviewProps) => {
  return (
    <section className='homeSeasonReview'>
      <h2 className='homeSeasonReview__title'>シーズンレビュー</h2>
      <div className='homeSeasonReview__track'>
        {seasons.map(({ label, period, href, isCurrent }) => (
          <Link
            key={`${label}-${period}`}
            href={href}
            className={`homeSeasonCard${isCurrent ? ' homeSeasonCard--current' : ''}`}
          >
            <span className='homeSeasonCard__label'>{label}</span>
            <span className='homeSeasonCard__period'>{period}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
