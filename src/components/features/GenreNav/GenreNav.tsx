import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { getGenreIcon } from './genreIconMap';
import { messages } from './i18n';
export type GenreNavTag = {
  slug: string
  name: string
  count: number
}

export type GenreNavProps = {
  tags: GenreNavTag[]
  /** genre アーカイブページで現在のスラッグをハイライト */
  activeSlug?: string
}

export const GenreNav = ({ tags, activeSlug }: GenreNavProps) => {
  const locale = useLocale();

  if (tags.length === 0) return null;

  return (
    <div data-component='GenreNav' className='sidebar-genre-nav'>
      <p className='sidebar-genre-nav__heading'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <ul className='sidebar-genre-nav__grid'>
        {tags.map((tag) => {
          const icon = getGenreIcon(tag.slug);
          const isActive = tag.slug === activeSlug;

          return (
            <li key={tag.slug} className='sidebar-genre-nav__cell'>
              <Link
                href={`/genre/${tag.slug}`}
                className={[
                  'sidebar-genre-nav__link',
                  isActive ? 'sidebar-genre-nav__link--active' : '',
                ].filter(Boolean).join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className='sidebar-genre-nav__icon' aria-hidden='true'>{icon}</span>
                <span className='sidebar-genre-nav__label'>{tag.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
