import Link from 'next/link';
import { useRouter } from 'next/router';

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
  const isPC = layout === 'pc';

  const listClasses = isPC
    ? 'flex gap-[28px]'
    : 'flex justify-around py-2'

  return (
    <nav aria-label='メインナビゲーション'>
      <ul className={listClasses}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          const linkClasses = isPC
            ? 'block font-[var(--font-ui)] text-[0.9375rem] font-medium text-[var(--color-text-inverse)] tracking-[0.06em] hover:opacity-70'
            : [
                'block px-2 py-1 font-[var(--font-ui)] text-[0.875rem] font-medium tracking-[0.06em] transition-colors duration-150 ease-[ease]',
                isActive
                  ? 'text-[var(--color-text-inverse)] border-b-2 border-[var(--color-primary)] pb-[2px]'
                  : 'text-[rgba(var(--color-white-rgb),0.6)] hover:text-[rgba(var(--color-white-rgb),0.9)] hover:opacity-100',
              ].join(' ')

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={linkClasses}
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
