import { useEffect, useRef, useId } from 'react';
import { useRouter } from 'next/router';
import { useSearch } from '@/components/features/Search';
import { SearchResultItem } from '@/components/ui/SearchResultItem';

type Props = {
  onClose: () => void;
};

export const SearchModal = ({ onClose }: Props) => {
  const router = useRouter();
  const { query, setQuery, results, isOpen, activeIndex, activeResult, moveDown, moveUp, close } =
    useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const getItemId = (index: number) => `${listboxId}-item-${index}`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const showDropdown = isOpen && results.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveDown(results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveUp();
        break;
      case 'Enter':
        e.preventDefault();
        if (activeResult) {
          router.push(activeResult.href);
          close();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className='fixed inset-0 bg-[rgba(var(--color-black-rgb),0.7)] z-[300] flex flex-col items-stretch'
      role='dialog'
      aria-modal='true'
      aria-label='検索'
      onClick={handleOverlayClick}
    >
      <div className='bg-[var(--color-bg)] px-4 py-3'>
        <div className='flex items-center gap-2'>
          <svg
            className='block shrink-0 text-[var(--color-text-muted)]'
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.35-4.35' />
          </svg>
          <input
            ref={inputRef}
            type='search'
            className='h-11 flex-1 bg-transparent px-3 text-[var(--font-size-body-lg)] font-[var(--font-ui)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]'
            placeholder='タイトルで検索...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            role='combobox'
            aria-expanded={showDropdown}
            aria-autocomplete='list'
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? getItemId(activeIndex) : undefined}
            autoComplete='off'
            spellCheck={false}
          />
          <button
            type='button'
            className='shrink-0 py-1 font-[var(--font-ui)] text-[var(--font-size-ui-lg)] font-medium whitespace-nowrap text-[var(--color-primary)] transition-opacity duration-150 ease-[ease] hover:opacity-70'
            onClick={onClose}
            aria-label='検索を閉じる'
          >
            キャンセル
          </button>
        </div>

        {showDropdown && (
          <ul
            id={listboxId}
            className='list-none m-0 py-1 bg-[var(--color-bg)] border-t border-[var(--color-border-muted)] max-h-[60vh] overflow-y-auto'
            role='listbox'
          >
            {results.map((result, index) => (
              <SearchResultItem
                key={result.id}
                result={result}
                isActive={index === activeIndex}
                id={getItemId(index)}
                onClick={() => {
                  close();
                  onClose();
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
