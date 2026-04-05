import React, { useState, useEffect, useRef } from 'react';
import { VodMenuItem } from './VodMenuItem';
import type { TVodMenuService } from './VodMenu.types';
import './VodMenu.scss';

type TVodMenuProps = {
  services: TVodMenuService[];
  defaultOpen?: boolean;
};

export const VodMenu = ({ services, defaultOpen = false }: TVodMenuProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='vodMenu' ref={ref}>
      <button
        type='button'
        className='vodMenu__trigger'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
          width='14'
          height='14'
        >
          <path d='M8 5v14l11-7z' />
        </svg>
        <span>配信</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
          width='12'
          height='12'
          className={`vodMenu__chevron ${isOpen ? 'vodMenu__chevron--open' : ''}`}
        >
          <path d='M7 10l5 5 5-5z' />
        </svg>
      </button>

      {isOpen && (
        <ul className='vodMenu__dropdown' role='listbox' aria-label='配信サービス一覧'>
          {services.map((item) => (
            <VodMenuItem key={item.service} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
};
