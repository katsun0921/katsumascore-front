import { useState, useEffect, useRef } from 'react';
import { VodMenuItem } from '@/components/ui-parts/VodMenuItem';
import { PlayIcon, ChevronDownIcon } from '@/assets/icons';
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
        className='inline-flex items-center gap-2 rounded border border-[var(--color-text-inverse)] px-3 py-2 text-[var(--font-size-ui-lg)] font-medium whitespace-nowrap text-[var(--color-text-inverse)] transition-[background-color,color] duration-200 ease-[ease] hover:bg-[var(--color-text-inverse)] hover:text-[var(--color-header)]'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <PlayIcon width='14' height='14' aria-hidden='true' />
        <span>配信</span>
        <ChevronDownIcon
          width='12'
          height='12'
          aria-hidden='true'
          className={`transition-transform duration-200 ease-[ease]${isOpen ? ' rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          className='absolute right-0 top-[calc(100%+var(--space-8))] z-[100] min-w-[180px] m-0 list-none rounded-[6px] border border-[var(--color-border-muted)] bg-[var(--color-bg)] py-2 shadow-[0_4px_12px_var(--color-border-soft)]'
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
