import Link from 'next/link';
import { useRouter } from 'next/router';
import './HeaderNav.scss';

const NAV_ITEMS = [
  { label: '映画', href: '/movies' },
  { label: 'アニメ', href: '/anime' },
  { label: 'ドラマ', href: '/drama' },
] as const;

export const HeaderNav = () => {
  const { pathname } = useRouter();

  return (
    <nav className='headerNav' aria-label='メインナビゲーション'>
      <ul className='headerNav__list'>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`headerNav__link${isActive ? ' headerNav__link--active' : ''}`}
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
