import { useState, useEffect, useRef } from 'react';
import { VodMenuItem } from './VodMenuItem';
import type { TVodMenuService } from './VodMenu.types';

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
    <div className='relative' ref={ref}>
      <button
        type='button'
        className='inline-flex items-center gap-[6px] px-3 py-[6px] border border-[var(--color-text-inverse)] rounded text-[var(--color-text-inverse)] text-[0.875rem] font-medium whitespace-nowrap transition-[background-color,color] duration-200 ease-[ease] hover:bg-[var(--color-text-inverse)] hover:text-[var(--color-header)]'
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
        {/* eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n */}
        <span>配信</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
          width='12'
          height='12'
          className={`transition-transform duration-200 ease-[ease]${isOpen ? ' rotate-180' : ''}`}
        >
          <path d='M7 10l5 5 5-5z' />
        </svg>
      </button>

      {isOpen && (
        <ul
          className='absolute top-[calc(100%+8px)] right-0 z-[100] min-w-[180px] py-[6px] m-0 list-none bg-[var(--color-bg)] border border-[var(--color-border-muted)] rounded-[6px] shadow-[0_4px_12px_var(--color-border-soft)]'
          role='listbox'
          aria-label='配信サービス一覧'
        >
          {services.map((item) => (
            <VodMenuItem key={item.service} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
};
