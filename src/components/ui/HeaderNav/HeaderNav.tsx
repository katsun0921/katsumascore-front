import Link from 'next/link';
import { useRouter } from 'next/router';
import './HeaderNav.scss';

const NAV_ITEMS = [
  { label: '映画', href: '/movies' },
  { label: 'アニメ', href: '/anime' },
  { label: 'ドラマ', href: '/drama' },
] as const;

type Props = {
  layout: 'pc' | 'sp';
};

export const HeaderNav = ({ layout }: Props) => {
  const { pathname } = useRouter();

  return (
    <nav
      className={`header-nav header-nav--${layout}`}
      aria-label="メインナビゲーション"
    >
      <ul className="header-nav__list">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="header-nav__item">
              <Link
                href={item.href}
                className={`header-nav__link${isActive ? ' header-nav__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
