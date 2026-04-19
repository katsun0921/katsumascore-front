import { useRef, useEffect, useId } from 'react';
import './Search.scss';
import { useSearch } from './useSearch';
import { SearchResultItem } from '@/components/ui-parts/SearchResultItem';

type Props = {
  onNavigate?: (href: string) => void;
  className?: string;
};

export const Search = ({ onNavigate, className }: Props) => {
  const { query, setQuery, results, isOpen, activeIndex, activeResult, moveDown, moveUp, close } =
    useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const getItemId = (index: number) => `${listboxId}-item-${index}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

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
        if (activeResult && onNavigate) {
          onNavigate(activeResult.href);
          close();
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        inputRef.current?.blur();
        break;
    }
  };

  const showDropdown = isOpen && results.length > 0;

  return (
    <div className={`relative${className ? ` ${className}` : ''}`} ref={containerRef}>
      <input
        ref={inputRef}
        type='search'
        // search__input クラスは globals.css の .header-search-pc/.header-search-sp セレクタ用に保持
        className='search__input w-[240px] rounded-[20px] border-2 border-transparent bg-[var(--color-bg)] px-4 py-2 text-[var(--font-size-ui-lg)] font-[var(--font-ui)] text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] duration-200 ease-[ease] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]'
        placeholder='タイトルで検索...'
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        role='combobox'
        aria-expanded={showDropdown}
        aria-autocomplete='list'
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? getItemId(activeIndex) : undefined}
        autoComplete='off'
        spellCheck={false}
      />
      {showDropdown && (
        <ul
          id={listboxId}
          className='absolute left-0 right-0 top-[calc(100%+var(--space-8))] z-[200] m-0 min-w-[280px] list-none rounded-[10px] border border-[var(--color-border-muted)] bg-[var(--color-bg)] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[320px] overflow-y-auto'
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
                inputRef.current?.blur();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
