import Link from 'next/link';
export type FeaturedItem = {
  label: string;
  title: string;
  description: string;
  href: string;
  isPrimary?: boolean;
};

export type HomeFeaturedProps = {
  items: FeaturedItem[];
};

export const HomeFeatured = ({ items }: HomeFeaturedProps) => {
  return (
    <section className='homeFeatured'>
      <h2 className='homeFeatured__title'>特集</h2>
      <ul className='homeFeatured__grid'>
        {items.map(({ label, title, description, href, isPrimary }) => (
          <li key={href}>
            <Link
              href={href}
              className={`homeFeaturedCard${isPrimary ? ' homeFeaturedCard--primary' : ''}`}
            >
              <span className='homeFeaturedCard__label'>{label}</span>
              <p className='homeFeaturedCard__title'>{title}</p>
              <p className='homeFeaturedCard__desc'>{description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
