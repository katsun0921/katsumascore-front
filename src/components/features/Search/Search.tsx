import { useRef, useEffect, useId } from 'react';
import { useSearch } from './useSearch';
import { SearchResultItem } from '@/components/ui-parts/SearchResultItem';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

type Props = {
  onNavigate?: (href: string) => void;
  className?: string;
};

export const Search = ({ onNavigate, className }: Props) => {
  const { query, setQuery, results, isOpen, activeIndex, activeResult, moveDown, moveUp, close } =
    useSearch();
  const locale = useLocale();

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !onNavigate) return;
    onNavigate(`/search?q=${encodeURIComponent(trimmed)}`);
    close();
    inputRef.current?.blur();
  };

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
        if (activeResult && onNavigate) {
          e.preventDefault();
          onNavigate(activeResult.href);
          close();
          inputRef.current?.blur();
        }
        // no preventDefault → form onSubmit handles the case without activeResult
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
    <div data-component='Search' className={`relative${className ? ` ${className}` : ''}`} ref={containerRef}>
      <form className='search__form' onSubmit={handleSubmit} role='search'>
        <input
          ref={inputRef}
          type='search'
          // search__input クラスは globals.css の .header-search-pc/.header-search-sp セレクタ用に保持
          className='search__input w-[240px] rounded-[20px] border-2 border-transparent bg-color-bg px-4 py-2 text-ui font-[var(--font-ui)] text-color-primary outline-none transition-[border-color,box-shadow] duration-200 ease-[ease] placeholder:text-color-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]'
          placeholder={t(messages, ['input', 'placeholder'], locale)}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          role='combobox'
          aria-expanded={showDropdown}
          aria-autocomplete='list'
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? getItemId(activeIndex) : undefined}
          aria-label={t(messages, ['input', 'ariaLabel'], locale)}
          autoComplete='off'
          spellCheck={false}
        />
        <button
          type='submit'
          className='search__submit'
          aria-label={t(messages, ['button', 'ariaLabel'], locale)}
        >
          <svg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.35-4.35' />
          </svg>
        </button>
      </form>
      {showDropdown && (
        <ul
          id={listboxId}
          className='absolute left-0 right-0 top-[calc(100%+var(--space-8))] z-[200] m-0 min-w-[280px] list-none rounded-[10px] border border-color-border-muted bg-color-bg py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[320px] overflow-y-auto'
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
