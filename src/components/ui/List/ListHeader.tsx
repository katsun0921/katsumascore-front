import React from 'react';

type TLinkHeader = {
  label: string;
  href: string;
  count: string;
  current?: boolean;
};
export type TLinksHeader = TLinkHeader[];

const headerNavigationMenu: TLinksHeader = [
  {
    label: 'HOME',
    href: 'http://katsumascore.local/',
    count: '',
    current: true,
  },
  {
    label: '映画',
    href: 'http://katsumascore.local/category/movie/',
    count: '12',
  },
  {
    label: 'アニメ',
    href: 'http://katsumascore.local/category/anime/',
    count: '8',
  },
  {
    label: 'ドラマ',
    href: 'http://katsumascore.local/category/drama/',
    count: '1',
  },
];

export const ListHeader = ({}) => {
  return (
    <ul id='menu-category'>
      {headerNavigationMenu.map((link, i) => {
        return (
          <li key={i}>
            <a href={link.href}>
              <span>
                {link.label}
              </span>
              {link.count && (
                <span>
                  {link.count}
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
