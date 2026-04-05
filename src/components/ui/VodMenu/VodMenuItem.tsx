import React from 'react';
import type { TVodMenuService } from './VodMenu.types';

type TVodMenuItemProps = {
  item: TVodMenuService;
};

export const VodMenuItem = ({ item }: TVodMenuItemProps) => {
  return (
    <li>
      <a
        href={item.href}
        className={`vodMenu__item vodMenu__item--${item.service}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        <span className='vodMenu__itemLabel'>{item.label}</span>
        <span
          className='vodMenu__itemStatus'
          aria-label={item.status ? '配信中' : '配信なし'}
        >
          {item.status ? '✔' : '✖'}
        </span>
      </a>
    </li>
  );
};
