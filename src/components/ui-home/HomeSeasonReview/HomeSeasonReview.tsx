import Link from 'next/link';
export type SeasonItem = {
  label: string;
  period: string;
  href: string;
  isCurrent?: boolean;
};

export type HomeSeasonReviewProps = {
  title: string;
  items: SeasonItem[];
};

export const HomeSeasonReview = ({ title, items }: HomeSeasonReviewProps) => {
  return (
    <section className='homeSeasonReview'>
      <h2 className='homeSeasonReview__title'>{title}</h2>
      <ul className='homeSeasonReview__list'>
        {items.map(({ label, period, href, isCurrent }) => (
          <li key={href}>
            <Link
              href={href}
              className={`homeSeasonReview__link${isCurrent ? " homeSeasonReview__link--current" : ""}`}
            >
              <span className='homeSeasonReview__label'>{label}</span>
              <span className='homeSeasonReview__period'>{period}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
